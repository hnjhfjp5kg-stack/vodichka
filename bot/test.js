/* Офлайн-тест проверки подписи initData: node test.js */
const crypto = require('crypto'), assert = require('assert');
const { validateInitData } = require('./server.js');
const TOKEN = '123456:TEST-TOKEN';
function sign(fields) {
  const str = Object.entries(fields).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, v]) => k + '=' + v).join('\n');
  const key = crypto.createHmac('sha256', 'WebAppData').update(TOKEN).digest();
  const hash = crypto.createHmac('sha256', key).update(str).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}
const now = Math.floor(Date.now() / 1000), user = JSON.stringify({ id: 42, first_name: 'Тест' });
const good = sign({ auth_date: now, query_id: 'AAA', user });
assert.strictEqual(validateInitData(good, TOKEN).id, 42);
assert.strictEqual(validateInitData(good.replace('42', '43'), TOKEN), null);        // подмена данных
assert.strictEqual(validateInitData(good, '999:OTHER'), null);                      // чужой токен
assert.strictEqual(validateInitData(sign({ auth_date: now - 90000, user }), TOKEN), null); // просрочено
assert.strictEqual(validateInitData('', TOKEN), null);
console.log('Тесты пройдены ✅');
