(function(){
var CFG=Object.assign({DEMO:true,PRICE_M:199,PRICE_Y:1490,CUR:'₽',TRIAL:7,PAY_M:'',PAY_Y:'',MANAGE_URL:'',TG_API:'',STARS_M:150,STARS_Y:1200,DEV:false},window.WATER_CONFIG||{});
var K='water_v1',S={norm:2000,weight:'',rOn:true,rMin:60,log:{},pro:false,skin:'ocean',plan:'y',coll:{},chest:'',snd:true};
try{var r=localStorage.getItem(K);if(r){var p0=JSON.parse(r);for(var k in p0)S[k]=p0[k];}}catch(e){}
function ev(n,d){try{window.dispatchEvent(new CustomEvent('water:'+n,{detail:d}));}catch(e){}}
function ask(t,f){if(window.WaterTG&&WaterTG.active&&WaterTG.confirm){WaterTG.confirm(t,function(ok){if(ok)f();});}else if(confirm(t))f();}
function save(){S.u=Date.now();try{localStorage.setItem(K,JSON.stringify(S));}catch(e){}ev('save');}
function dk(d){return (d||new Date()).toLocaleDateString('sv');}
function day(k){return S.log[k]||[];}
function tot(k){return day(k).reduce(function(a,x){return a+x.ml;},0);}
var $=function(i){return document.getElementById(i);};
var pick=function(a){return a[Math.floor(Math.random()*a.length)];};
var lastRemind=Date.now();
var LEVELS=[[0,'🌵 Кактус','Пустыня зовёт. Налей хоть глоток!'],[10,'🥀 Увядающий фикус','Листики поникли...'],[25,'🐪 Верблюд','Запасы пошли, но до оазиса далеко'],[50,'🐟 Рыбка','Уже плаваем! Половина пути позади'],[75,'🐬 Дельфин','Красавчик, осталось совсем чуть-чуть'],[100,'🐳 Кит','Норма выполнена! Ты — океан 🌊'],[150,'🧌 Водяной','Эй, полегче! Лишнее тоже не нужно']];
var ADD=['Бульк! 💦','Глоток засчитан 😎','Почки аплодируют 👏','Мозг сказал «спасибо» 🧠','Кожа светится ✨','H₂O — твой лучший друг'];
var NUDGE=['Эй! Твои почки на связи 📞','Кактус внутри тебя просит воды 🌵','Рыбки в аквариуме выпили больше тебя 🐟','Время глоточка! Бульк-бульк 💧','Вода сама себя не выпьет 🥛'];
var BADGES=[['🥇','Первый глоток',function(c){return c.t>0;}],['🌊','50% нормы',function(c){return c.p>=50;}],['🏆','Норма!',function(c){return c.p>=100;}],['🔥','Серия 3 дня',function(c){return c.s>=3;}],['🐳','Серия 7 дней',function(c){return c.s>=7;}],['🕺','5 глотков за день',function(c){return c.n>=5;}]];
var SKINS=[['ocean','linear-gradient(135deg,#1e90ff,#00d4c8)'],['sunset','linear-gradient(135deg,#ff6b6b,#ffb347)'],['neon','linear-gradient(135deg,#a855f7,#22d3ee)'],['forest','linear-gradient(135deg,#10b981,#a3e635)']];

function tw(el,to,fmt){var from=+el._v||0,t0=performance.now();el._v=to;(function f(n){var k=Math.max(0,Math.min(1,(n-t0)/900)),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(from+(to-from)*e));if(k<1)requestAnimationFrame(f);})(t0);}
function streak(){var n=0,d=new Date();if(tot(dk(d))<S.norm)d.setDate(d.getDate()-1);while(tot(dk(d))>=S.norm&&n<365){n++;d.setDate(d.getDate()-1);}return n;}
function skin(){document.documentElement.dataset.skin=S.pro?S.skin:'ocean';}
function render(){
  var t=tot(dk()),p=Math.round(t/S.norm*100),lv=LEVELS[0],L=day(dk());
  LEVELS.forEach(function(l){if(p>=l[0])lv=l;});
  $('fill').style.height=Math.min(100,p)+'%';
  tw($('pct'),p,function(v){return v+'%';});
  tw($('ml'),t,function(v){return v+' / '+S.norm+' мл';});
  $('title').textContent=lv[1];
  if(!$('msg').dataset.keep)$('msg').textContent=lv[2];
  $('petRow').style.display=S.pro?'none':'flex';
  $('fish').style.display=S.pro?'block':'none';
  $('fs').textContent=p<5?'🐚':p<25?'🐟':p<75?'🐠':p<100?'🐡':'🐬';
  $('fs').style.fontSize=(26+Math.min(p,100)*.16)+'px';
  $('proBtn').textContent=S.pro?'💎 PRO':'💎 Pro';
  $('proBtn').className='pill'+(S.pro?' pro':'');
  $('proStat').style.display=S.pro?'flex':'none';
  $('heatCard').className='card lk'+(S.pro?'':' on');
  $('log').innerHTML=L.length?L.map(function(x,i){return '<span data-i="'+i+'" title="Нажми, чтобы удалить запись">'+x.h+' · '+x.ml+' ✕</span>';}).join(''):'<span>Пока пусто — самое время налить 🫗</span>';
  var days=[],i,d,h='';
  for(i=6;i>=0;i--){d=new Date();d.setDate(d.getDate()-i);days.push(d);}
  var mx=Math.max(S.norm,Math.max.apply(null,days.map(function(x){return tot(dk(x));})));
  $('chart').innerHTML=days.map(function(x,j){var v=tot(dk(x));return '<div class="bar"><i class="'+(v>=S.norm?'ok':'')+'" style="height:'+(v/mx*72)+'px;animation-delay:'+(j*70)+'ms"></i>'+x.toLocaleDateString('ru',{weekday:'short'})+'</div>';}).join('');
  for(i=29;i>=0;i--){d=new Date();d.setDate(d.getDate()-i);var v=tot(dk(d));h+='<i title="'+dk(d)+': '+v+' мл" style="opacity:'+(.12+Math.min(1,v/S.norm)*.88)+';animation-delay:'+((29-i)*20)+'ms"></i>';}
  $('heat').innerHTML=h;
  var s=streak();
  $('streak').textContent=s?'🔥 Серия: '+s+' дн. подряд с выполненной нормой':'Выполни норму сегодня — начнётся серия 🔥';
  var ks=Object.keys(S.log).filter(function(q){return tot(q)>0;}),allv=ks.reduce(function(a,q){return a+tot(q);},0),best=ks.reduce(function(a,q){return Math.max(a,tot(q));},0),wk=days.reduce(function(a,x){return a+tot(dk(x));},0);
  $('stats').textContent=ks.length?'Среднее за неделю: '+Math.round(wk/7)+' мл · лучший день: '+best+' мл · всего: '+(allv/1000).toFixed(1)+' л':'';
  var c={t:t,p:p,s:s,n:L.length};
  $('badges').innerHTML=BADGES.map(function(b){return '<span class="b '+(b[2](c)?'on':'')+'">'+b[0]+' '+b[1]+'</span>';}).join('');
  $('skins').innerHTML=SKINS.map(function(s){var lk=!S.pro&&s[0]!=='ocean';return '<button class="sk'+((S.pro?S.skin:'ocean')===s[0]?' sel':'')+'" data-sk="'+s[0]+'" style="background:'+s[1]+'" aria-label="'+s[0]+'">'+(lk?'<em>🔒</em>':'')+'</button>';}).join('');
  document.querySelectorAll('.sk').forEach(function(b){b.onclick=function(){var k=b.dataset.sk;if(!S.pro&&k!=='ocean'){openPay();return;}S.skin=k;save();skin();render();};});
}
function say(m){var e=$('msg');e.textContent=m;e.dataset.keep='1';clearTimeout(say.t);say.t=setTimeout(function(){delete e.dataset.keep;render();},3500);}
function confetti(){var em=['💧','💦','🌊','🐬','🎉','🥳','💎'];for(var i=0;i<34;i++){(function(){var e=document.createElement('div');e.className='drop';e.textContent=pick(em);e.style.left=Math.random()*100+'vw';e.style.animationDelay=Math.random()*.9+'s';document.body.appendChild(e);setTimeout(function(){e.remove();},3800);})();}}
function add(ml){
  ml=Math.round(ml);if(!ml||ml<1||ml>2000)return;
  var k=dk(),before=tot(k);
  if(!S.log[k])S.log[k]=[];
  S.log[k].push({ml:ml,h:new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'}),ts:Date.now()});
  lastRemind=Date.now();save();
  var after=tot(k);render();
  var g=$('glass');g.classList.remove('pop');void g.offsetWidth;g.classList.add('pop');ev('add');
  if(before<S.norm&&after>=S.norm){say('🎉 НОРМА! Ты официально водный бог!');confetti();ev('goal');}
  else if(after>S.norm*1.5)say('Стоп-стоп! Слишком много воды сразу — не перебарщивай 🙏');
  else say(pick(ADD));
  hideToast();
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b)return;var r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)/4,i=document.createElement('span');i.className='rip';i.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px';b.appendChild(i);setTimeout(function(){i.remove();},650);});
document.querySelectorAll('.add').forEach(function(b){b.onclick=function(){add(+b.dataset.ml);};});
$('custBtn').onclick=function(){add(+$('cust').value);$('cust').value='';};
$('undo').onclick=function(){var L=S.log[dk()];if(L&&L.length){var x=L.pop();save();render();say('Отменили '+x.ml+' мл. Было — не было 🤫');}};
$('norm').value=S.norm;$('weight').value=S.weight;$('rOn').checked=S.rOn;$('rMin').value=S.rMin;
$('norm').onchange=function(){var v=+$('norm').value;if(v>=500&&v<=6000){S.norm=v;save();render();}};
$('weight').onchange=function(){var w=+$('weight').value;S.weight=w||'';if(w>=30&&w<=250){S.norm=Math.round(w*30/50)*50;$('norm').value=S.norm;say('Норма пересчитана: 30 мл на кг = '+S.norm+' мл');}save();render();};
$('rMin').onchange=function(){var v=+$('rMin').value;if(v>=15&&v<=240){S.rMin=v;save();}};
$('rOn').onchange=function(){S.rOn=$('rOn').checked;save();if(S.rOn&&window.Notification&&Notification.permission==='default'){try{Notification.requestPermission();}catch(e){}}};
function hideToast(){$('toast').classList.remove('show');}
function remind(){var m=pick(NUDGE);$('tmsg').textContent=m;$('toast').classList.add('show');try{if(window.Notification&&Notification.permission==='granted')new Notification('💧 Водичка',{body:m,icon:'icons/icon-192.png'});}catch(e){}setTimeout(hideToast,15000);}
$('tbtn').onclick=function(){add(250);};
setInterval(function(){
  if(!S.rOn)return;var h=new Date().getHours();
  if(h<8||h>=22||tot(dk())>=S.norm)return;
  var L=day(dk()),last=L.length?L[L.length-1].ts||0:0;
  if(Date.now()-Math.max(last,lastRemind)>=S.rMin*60000){lastRemind=Date.now();remind();}
},30000);
/* Pro paywall (demo) */
function plan(pl){S.plan=pl;document.querySelectorAll('.plan').forEach(function(b){b.classList.toggle('sel',b.dataset.plan===pl);});tw($('price'),pl==='y'?PR().y:PR().m,function(v){return v+' '+PR().c;});$('pnote').textContent=(pl==='y'?'в год':'в месяц')+(CFG.TRIAL?' · '+CFG.TRIAL+' дн. бесплатно':'');}
function openPay(){payInit();plan(S.plan);$('modal').classList.add('on');}
function closePay(){$('modal').classList.remove('on');}
document.querySelectorAll('.plan').forEach(function(b){b.onclick=function(){plan(b.dataset.plan);};});
$('proBtn').onclick=function(){if(S.pro)say('Ты уже в Pro 💎 Спасибо за кактус!');else openPay();};
$('petBtn').onclick=openPay;$('heatLock').onclick=openPay;$('mx').onclick=closePay;$('later').onclick=closePay;
$('modal').onclick=function(e){if(e.target===$('modal'))closePay();};
function grantPro(){S.pro=true;save();closePay();skin();render();confetti();say('💎 Добро пожаловать в Pro! Рыбка уже плывёт');}
window.WaterApp={grantPro:grantPro,setPro:function(v){v=!!v;if(!!S.pro===v)return;S.pro=v;if(!v)S.skin='ocean';save();skin();render();},isPro:function(){return !!S.pro;}};
$('buy').onclick=function(){if(CFG.DEMO){grantPro();return;}if(window.WaterTG&&WaterTG.canPay()){WaterTG.pay(S.plan,function(ok,why){if(ok)grantPro();else $('payNote').textContent=why==='pending'?'Платёж обрабатывается — Pro включится через минуту. Перезапусти приложение.':'Оплата отменена.';});return;}var u=S.plan==='y'?CFG.PAY_Y:CFG.PAY_M;if(!u){closePay();say('Оплата ещё не настроена');return;}window.open(u,'_blank','noopener');};
$('cancel').onclick=function(){if(!CFG.DEMO&&CFG.MANAGE_URL){window.open(CFG.MANAGE_URL,'_blank','noopener');return;}S.pro=false;S.skin='ocean';save();skin();render();say('Pro отключён. Кактус грустит 🌵');};
var bb='';for(var i=0;i<8;i++){var sz=4+Math.random()*8;bb+='<i style="left:'+(Math.random()*90+3)+'%;width:'+sz+'px;height:'+sz+'px;animation-delay:'+(Math.random()*4)+'s;animation-duration:'+(3+Math.random()*3)+'s"></i>';}
$('bub').innerHTML=bb;
/* Океанариум: сундук, квест, коллекция */
var CR=[['🐚','Ракушка',0],['🦀','Крабик',0],['🦐','Креветка',0],['🐟','Рыбка',0],['🪸','Коралл',0],['🦪','Устрица',0],['🐠','Рыба-клоун',1],['🐡','Фугу',1],['🐢','Черепаха',1],['🦑','Кальмар',1],['🐙','Осьминог',2],['🦈','Акула',2],['🐬','Дельфин',2],['🐳','Кит',2],['🧜','Русалка',3],['🐉','Дракон глубин',3],['🔱','Трезубец Посейдона',3]];
var RN=['Обычный','Редкий','Эпичный','Легендарный'],RC=['#94a3b8','#38bdf8','#a855f7','#f5b400'];
var Q=[['🌅 Выпей 200+ мл до 10:00',function(L){return L.some(function(x){return new Date(x.ts).getHours()<10&&x.ml>=200;});}],['🥤 Сделай 5 глотков за день',function(L){return L.length>=5;}],['⏰ Выпей 1 литр до 15:00',function(L){return L.filter(function(x){return new Date(x.ts).getHours()<15;}).reduce(function(a,x){return a+x.ml;},0)>=1000;}]];
function left(){var n=new Date(),m=new Date(n);m.setHours(24,0,0,0);var ms=m-n;return Math.floor(ms/36e5)+' ч '+Math.floor(ms%36e5/6e4)+' мин';}
function extra(){
 var k=dk(),t=tot(k),L=day(k),ready=t>=S.norm&&S.chest!==k,done=S.chest===k,q=Q[new Date().getDate()%Q.length],qd=q[1](L),s=streak(),n=0,h='';
 $('strk').textContent=s;
 $('chest').className='chest'+(ready?' ready':done?' done':'');
 $('chestE').title=done?'Открыт':ready?'Открыть кейс':'Закрыт';
 $('chestT').textContent=ready?'Кейс готов — открывай!':done?'Кейс открыт ✅':'До кейса: ещё '+Math.max(0,S.norm-t)+' мл';
 $('cd').textContent=done?'Новый кейс и квест — через '+left():s?'Выполни норму сегодня, чтобы не потерять серию 🔥':'Выполни норму — получи морское существо';
 $('dot').style.display=ready?'block':'none';
 $('qS').textContent=qd?'✅':'⬜';$('qT').textContent=q[0];
 $('qN').textContent=S.pro?'💎 С Pro шанс редких существ всегда повышен':qd?'Бонус активен: шанс редких существ повышен ✨':'Выполни квест — шанс редких существ в кейсе вырастет';
 CR.forEach(function(c,i){var v=S.coll[i]||0;if(v)n++;h+='<div class="cr'+(v?'':' no')+'" style="--c:'+RC[c[2]]+';animation-delay:'+(i*30)+'ms">'+(v?c[0]+'<small>'+c[1]+'</small>'+(v>1?'<em>×'+v+'</em>':''):'❓')+'</div>';});
 $('coll').innerHTML=h;$('cn').textContent=n+'/'+CR.length;$('cp').style.width=(n/CR.length*100)+'%';
}
var _r=render;render=function(){_r();extra();};
function openChest(){
 var k=dk();if(tot(k)<S.norm||S.chest===k)return;
 var q=Q[new Date().getDate()%Q.length],b=S.pro||q[1](day(k)),r=Math.random(),th=b?[.5,.82,.95]:[.68,.91,.985],rar=r<th[0]?0:r<th[1]?1:r<th[2]?2:3,pool=[];
 CR.forEach(function(c,i){if(c[2]===rar)pool.push(i);});
 var id=pick(pool),c=CR[id],nw=!S.coll[id];S.coll[id]=(S.coll[id]||0)+1;S.chest=k;save();render();
 $('rvm').style.setProperty('--c',RC[rar]);
 var e=$('rvE');e.textContent=c[0];e.style.animation='none';void e.offsetWidth;e.style.animation='';
 $('rvN').textContent=c[1];$('rvR').textContent=RN[rar];
 $('rvS').textContent=nw?'🆕 Новое существо в твоём океанариуме!':'Уже есть — теперь ×'+S.coll[id];
 spin(id,rar,nw,th,function(){var e2=$('rvE');e2.style.animation='none';void e2.offsetWidth;e2.style.animation='';$('rvm').classList.add('on');if(rar>1||nw)confetti();ev('reveal',{rar:rar});});
}
var CASE='<svg viewBox="0 0 100 80"><path d="M32 24v-7a7 7 0 0 1 7-7h22a7 7 0 0 1 7 7v7" fill="none" stroke="#4a5f7e" stroke-width="5"/><rect x="6" y="22" width="88" height="54" rx="9" fill="#1f2c3f"/><rect x="6" y="22" width="88" height="18" rx="9" fill="#2e4260"/><rect x="6" y="46" width="88" height="7" fill="#f5b400"/><rect x="40" y="34" width="20" height="26" rx="5" fill="#f5b400"/><circle cx="50" cy="45" r="3.5" fill="#1f2c3f"/></svg>';
$('chestE').innerHTML=CASE;$('cbig').innerHTML=CASE;
var snd=S.snd!==false,AC=null;
$('snd').onclick=function(){snd=!snd;S.snd=snd;save();$('snd').textContent=snd?'🔊':'🔇';$('sndOn').checked=snd;};
function beep(f,d,v,ty){if(!snd)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.type=ty||'square';o.frequency.value=f;g.gain.value=v||.03;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.stop(AC.currentTime+d);}catch(e){}}
function spin(id,rar,nw,th,fin){
 var cs=$('cs'),tr=$('tr'),rl=$('rl'),big=$('cbig'),W=118,WI=48,arr=[],i,off=(Math.random()-.5)*76,TM=[],done=false,
  dur=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches?600:7000;
 function rnd(){var r=Math.random(),rr=r<th[0]?0:r<th[1]?1:r<th[2]?2:3,pool=[];CR.forEach(function(c,j){if(c[2]===rr)pool.push(j);});return pick(pool);}
 function T(f,ms){TM.push(setTimeout(f,ms));}
 function go(ms,ease){var cw=rl.clientWidth;void tr.offsetWidth;tr.style.transition='transform '+ms+'ms '+ease;tr.style.transform='translateX('+(-(WI*W+55+off-cw/2))+'px)';return cw;}
 function end(){
  if(done)return;done=true;
  tr.classList.add('fin');$('ct').textContent='Выпало: '+CR[id][1]+'!';$('ct').style.color=RC[rar];
  beep(440+rar*180,.5,.06,'triangle');if(rar>1)beep(660+rar*220,.7,.05,'triangle');
  setTimeout(function(){cs.classList.remove('on');fin();},1600);
 }
 for(i=0;i<WI+8;i++)arr.push(rnd());
 arr[WI]=id;
 if(rar<3&&Math.random()<.5){var lg=[];CR.forEach(function(c,j){if(c[2]===3)lg.push(j);});arr[WI+(Math.random()<.5?1:-1)]=pick(lg);}
 tr.className='tr';tr.style.transition='none';tr.style.transform='translateX(0)';
 tr.innerHTML=arr.map(function(j,n){var c=CR[j];return '<div class="it'+(n===WI?' win':'')+'" style="--c:'+RC[c[2]]+'">'+c[0]+'<small>'+c[1]+'</small></div>';}).join('');
 rl.className='rl';big.className='cbig';$('ct').style.color='';$('ct').textContent='Открываем кейс…';
 cs.classList.add('on');beep(160,.3,.05,'sawtooth');
 T(function(){big.className='cbig out';rl.className='rl on';beep(320,.2,.04,'triangle');},1100);
 T(function(){
  var cw=go(dur,'cubic-bezier(.08,.72,.1,1)'),last=-1,t0=Date.now();
  (function loop(){var x=new DOMMatrix(getComputedStyle(tr).transform).m41,ix=Math.floor((-x+cw/2)/W);if(ix!==last){last=ix;beep(850+Math.random()*120,.03,.025);ev('tick');}if(!done&&Date.now()-t0<dur)requestAnimationFrame(loop);})();
 },1400);
 T(end,1400+dur+150);
 $('skip').onclick=function(){
  if(done)return;TM.forEach(clearTimeout);TM=[];
  var x=new DOMMatrix(getComputedStyle(tr).transform).m41;
  tr.style.transition='none';tr.style.transform='translateX('+x+'px)';
  big.className='cbig out';rl.className='rl on';go(700,'ease-out');T(end,850);
 };
}
if(CFG.DEV||/[?&]dev=1/.test(location.search))$('rstCase').style.display='';
$('rstCase').onclick=function(){var k=dk(),t=tot(k);S.chest='';if(t<S.norm){if(!S.log[k])S.log[k]=[];S.log[k].push({ml:S.norm-t,h:new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'}),ts:Date.now()});}save();render();tab('ocean');};
function PR(){var tg=!CFG.DEMO&&window.WaterTG&&WaterTG.canPay();return tg?{m:CFG.STARS_M,y:CFG.STARS_Y,c:'⭐'}:{m:CFG.PRICE_M,y:CFG.PRICE_Y,c:CFG.CUR};}
function payInit(){
 var p=PR(),disc=Math.round((1-p.y/(p.m*12))*100);
 $('pm').textContent=p.m+' '+p.c+' / мес';
 $('py').textContent='≈'+Math.round(p.y/12)+' '+p.c+' / мес';
 $('ptag').textContent='−'+disc+'%';if(disc<=0)$('ptag').style.display='none';
 $('buy').textContent=CFG.TRIAL?'Попробовать '+CFG.TRIAL+' дн. бесплатно':'Оформить подписку';
 $('payNote').textContent=CFG.DEMO?'Демо-режим: оплата не подключена, ничего не списывается.':(p.c==='⭐'?'Оплата в Telegram Stars ⭐. Месячный план продлевается автоматически, управлять подпиской можно в настройках Telegram.':'Оплата проходит на защищённой странице платёжного сервиса. Отмена в любой момент.');
 if(!CFG.DEMO&&CFG.MANAGE_URL)$('cancel').textContent='Управлять';
}
payInit();
$('sndOn').checked=snd;$('snd').textContent=snd?'🔊':'🔇';
$('sndOn').onchange=function(){snd=$('sndOn').checked;S.snd=snd;save();$('snd').textContent=snd?'🔊':'🔇';};
$('log').onclick=function(e){var sp=e.target.closest('span[data-i]'),L=S.log[dk()];if(!sp||!L)return;L.splice(+sp.dataset.i,1);save();render();say('Запись удалена');};
$('exp').onclick=function(){if(window.WaterTG&&WaterTG.active){var tx=JSON.stringify(S);if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(tx).then(function(){say('Копия скопирована в буфер обмена');},function(){say('Не удалось скопировать');});}else say('Буфер обмена недоступен');return;}var b=new Blob([JSON.stringify(S,null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='vodichka-backup-'+dk()+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);};
$('imp').onclick=function(){$('impF').click();};
$('impF').onchange=function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);if(!d||typeof d.log!=='object'||typeof d.norm!=='number')throw 0;for(var q in d)S[q]=d[q];save();location.reload();}catch(e){say('Не удалось импортировать: неверный файл');}};r.readAsText(f);};
$('wipe').onclick=function(){ask('Удалить все данные приложения? Это нельзя отменить.',function(){try{localStorage.removeItem(K);}catch(e){}var go=function(){location.reload();};if(window.WaterTG)WaterTG.wipeCloud(go);else go();});};
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}
$('chest').onclick=openChest;$('rvB').onclick=function(){$('rvm').classList.remove('on');};
function tab(t){document.querySelectorAll('[data-tab]').forEach(function(s){s.style.display=s.dataset.tab===t?'':'none';});document.querySelectorAll('#nav button').forEach(function(b){b.classList.toggle('sel',b.dataset.t===t);});window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('#nav button').forEach(function(b){b.onclick=function(){tab(b.dataset.t);};});
var curDay=dk();setInterval(function(){if(dk()!==curDay){curDay=dk();render();}else extra();},60000);
tab('today');
skin();render();
ev('ready');
})();
