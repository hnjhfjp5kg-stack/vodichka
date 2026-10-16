/* Сервер-бот «Водички»: счета в Telegram Stars, приём оплат, проверка Pro. Без зависимостей, Node 20.6+. */
'use strict';
const http = require('http'), crypto = require('crypto'), fs = require('fs'), path = require('path');
const E = process.env;
const TOKEN = E.BOT_TOKEN, WEBAPP = E.WEBAPP_URL || '', PORT = +E.PORT || 3000;
const PUBLIC = E.PUBLIC_URL || '', SECRET = E.WEBHOOK_SECRET || '';
const ORIGIN = E.ALLOWED_ORIGIN || (WEBAPP ? new URL(WEBAPP).origin : '*');
const STARS = { m: +E.STARS_M || 150, y: +E.STARS_Y || 1200 };
const DB_FILE = E.DATA_FILE || path.join(__dirname, 'data.json');

let db = {};
try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch (e) {}
function saveDb() { const t = DB_FILE + '.tmp'; fs.writeFileSync(t, JSON.stringify(db)); fs.renameSync(t, DB_FILE); }

/* Проверка подписи initData по документации Telegram Mini Apps. Возвращает объект user или null. */
function validateInitData(initData, token, maxAge) {
  const p = new URLSearchParams(initData || ''), hash = p.get('hash');
  if (!hash) return null;
  p.delete('hash');
  const str = [...p.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, v]) => k + '=' + v).join('\n');
  const key = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const calc = crypto.createHmac('sha256', key).update(str).digest('hex');
  const a = Buffer.from(calc), b = Buffer.from(hash);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Date.now() / 1000 - (+p.get('auth_date') || 0) > (maxAge || 86400)) return null;
  try { const u = JSON.parse(p.get('user') || 'null'); return u && u.id ? u : null; } catch (e) { return null; }
}

async function bot(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!j.ok) throw new Error(method + ': ' + j.description);
  return j.result;
}

function createInvoice(user, plan) {
  const monthly = plan === 'm';
  const body = {
    title: 'Водичка Pro — ' + (monthly ? 'месяц' : 'год'),
    description: 'Темы, рыбка-питомец, карта 30 дней и повышенный шанс редких существ.',
    payload: `pro:${user.id}:${plan}`, currency: 'XTR',
    prices: [{ label: 'Водичка Pro', amount: STARS[plan] }]
  };
  if (monthly) body.subscription_period = 2592000; // 30 дней, автопродление (единственный период, который поддерживает Telegram)
  return bot('createInvoiceLink', body);
}

const isPro = id => !!(db[id] && db[id].until > Date.now());

async function onUpdate(u) {
  if (u.pre_checkout_query) {
    const q = u.pre_checkout_query, m = /^pro:(\d+):([my])$/.exec(q.invoice_payload || '');
    const ok = !!m && String(q.from.id) === m[1];
    await bot('answerPreCheckoutQuery', ok ? { pre_checkout_query_id: q.id, ok: true } : { pre_checkout_query_id: q.id, ok: false, error_message: 'Неверный платёж' });
    return;
  }
  const msg = u.message; if (!msg) return;
  if (msg.successful_payment) {
    const sp = msg.successful_payment, m = /^pro:(\d+):([my])$/.exec(sp.invoice_payload || ''); if (!m) return;
    const id = m[1], plan = m[2];
    if (db[id] && db[id].charge === sp.telegram_payment_charge_id) return; // повторная доставка webhook
    const until = sp.subscription_expiration_date ? sp.subscription_expiration_date * 1000
      : Math.max(Date.now(), (db[id] && db[id].until) || 0) + (plan === 'y' ? 365 : 30) * 864e5;
    db[id] = { until, plan, charge: sp.telegram_payment_charge_id }; saveDb();
    await bot('sendMessage', { chat_id: msg.chat.id, text: '💎 Pro активирован! Спасибо, кактус спасён 🌵' });
    return;
  }
  if (msg.text && msg.text.startsWith('/start') && WEBAPP) {
    await bot('sendMessage', { chat_id: msg.chat.id, text: 'Привет! Я помогаю пить воду 💧', reply_markup: { inline_keyboard: [[{ text: '💧 Открыть Водичку', web_app: { url: WEBAPP } }]] } });
  }
}

function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((ok, no) => {
    let d = '';
    req.on('data', c => { d += c; if (d.length > 1e5) { req.destroy(); no(new Error('too big')); } });
    req.on('end', () => { try { ok(JSON.parse(d || '{}')); } catch (e) { no(e); } });
  });
}

function makeServer() {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') return send(res, 204, {});
      if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true });
      if (req.method !== 'POST') return send(res, 404, {});
      const b = await readBody(req);
      if (SECRET && req.url === '/webhook/' + SECRET) {
        if (req.headers['x-telegram-bot-api-secret-token'] !== SECRET) return send(res, 403, {});
        send(res, 200, { ok: true });
        onUpdate(b).catch(e => console.error(e.message));
        return;
      }
      if (req.url === '/api/status' || req.url === '/api/invoice') {
        const user = validateInitData(b.initData, TOKEN);
        if (!user) return send(res, 401, { error: 'initData' });
        if (req.url === '/api/status') return send(res, 200, { pro: isPro(user.id), until: (db[user.id] && db[user.id].until) || 0 });
        if (b.plan !== 'm' && b.plan !== 'y') return send(res, 400, { error: 'plan' });
        return send(res, 200, { link: await createInvoice(user, b.plan) });
      }
      send(res, 404, {});
    } catch (e) { console.error(e.message); send(res, 500, { error: 'server' }); }
  });
}

async function start() {
  if (!TOKEN) { console.error('Укажи BOT_TOKEN в .env'); process.exit(1); }
  if (PUBLIC) {
    if (!/^[A-Za-z0-9_-]{16,256}$/.test(SECRET)) { console.error('WEBHOOK_SECRET: 16–256 символов A-Za-z0-9_-'); process.exit(1); }
    await bot('setWebhook', { url: PUBLIC.replace(/\/$/, '') + '/webhook/' + SECRET, secret_token: SECRET, allowed_updates: ['message', 'pre_checkout_query'] });
    console.log('Webhook установлен');
  }
  makeServer().listen(PORT, () => console.log('Сервер на порту ' + PORT));
}

if (require.main === module) start().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { validateInitData, makeServer };
