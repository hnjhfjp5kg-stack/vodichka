/* Интеграция с Telegram Mini App. Вне Telegram ничего не делает. Грузится до app.js. */
(function(){
var tg=window.Telegram&&Telegram.WebApp,CFG=window.WATER_CONFIG||{},active=!!(tg&&tg.initData);
var W=window.WaterTG={active:active,tg:tg||null};
W.canPay=function(){return active&&!!CFG.TG_API;};
W.wipeCloud=function(cb){if(cb)cb();};
if(!active)return;

function ver(v){try{return tg.isVersionAtLeast(v);}catch(e){return false;}}
try{tg.ready();tg.expand();if(ver('7.7'))tg.disableVerticalSwipes();}catch(e){}

/* тема Telegram -> светлая/тёмная тема приложения */
function theme(){var d=tg.colorScheme==='dark';document.documentElement.dataset.theme=d?'dark':'light';try{tg.setHeaderColor(d?'#071522':'#eaf5ff');tg.setBackgroundColor(d?'#071522':'#eaf5ff');}catch(e){}}
theme();try{tg.onEvent('themeChanged',theme);}catch(e){}

/* тактильный отклик */
var H=tg.HapticFeedback,lastT=0;
function hap(t,s){try{if(!H||!ver('6.1'))return;if(t==='n')H.notificationOccurred(s);else if(t==='i')H.impactOccurred(s);else H.selectionChanged();}catch(e){}}
window.addEventListener('water:add',function(){hap('i','light');});
window.addEventListener('water:goal',function(){hap('n','success');});
window.addEventListener('water:tick',function(){var n=Date.now();if(n-lastT>70){lastT=n;hap('s');}});
window.addEventListener('water:reveal',function(e){var r=(e.detail||{}).rar||0;if(r>1)hap('n','success');else hap('i','medium');});

/* системное подтверждение */
W.confirm=function(t,cb){try{tg.showConfirm(t,cb);}catch(e){cb(window.confirm(t));}};

/* синхронизация между устройствами через Telegram CloudStorage (значения до 4096 символов — режем на части) */
var CS=ver('6.9')?tg.CloudStorage:null,SK='water_v1',CH=3500,cloud={},ready=false,pushT=null;
function chunks(raw){var o=[];for(var i=0;i<raw.length;i+=CH)o.push(raw.slice(i,i+CH));return o;}
function push(){
  if(!CS||!ready)return;var raw;try{raw=localStorage.getItem(SK);}catch(e){return;}if(!raw)return;
  var parts=chunks(raw),i=0,old=parseInt(cloud.wn||'0',10)||0;
  (function next(){
    if(i<parts.length){var k='w'+i,v=parts[i++];if(cloud[k]===v)return next();CS.setItem(k,v,function(e,ok){if(ok)cloud[k]=v;next();});}
    else{var rm=[];for(var j=parts.length;j<old;j++)rm.push('w'+j);
      CS.setItem('wn',String(parts.length),function(e,ok){if(ok)cloud.wn=String(parts.length);});
      if(rm.length)CS.removeItems(rm,function(){});}
  })();
}
function pull(){
  if(!CS){return;}
  CS.getItem('wn',function(e,v){
    var n=parseInt(v||'0',10);
    if(e||!n||n>1000){ready=true;push();return;}
    var keys=[];for(var i=0;i<n;i++)keys.push('w'+i);
    CS.getItems(keys,function(e2,r){
      if(e2||!r){ready=true;return;}
      var raw='',i2;for(i2=0;i2<n;i2++){if(typeof r['w'+i2]!=='string'){ready=true;return;}raw+=r['w'+i2];}
      cloud=r;cloud.wn=v;
      var c=null,l=null;
      try{c=JSON.parse(raw);}catch(x){}
      try{l=JSON.parse(localStorage.getItem(SK)||'null');}catch(x){}
      if(c&&(!l||(c.u||0)>(l.u||0))){try{localStorage.setItem(SK,raw);}catch(x){}location.reload();return;}
      ready=true;if(l&&(!c||(l.u||0)>(c.u||0)))push();
    });
  });
}
window.addEventListener('water:save',function(){if(!ready)return;clearTimeout(pushT);pushT=setTimeout(push,2500);});
document.addEventListener('visibilitychange',function(){if(document.hidden&&pushT){clearTimeout(pushT);pushT=null;push();}});
W.wipeCloud=function(cb){
  var done=false,fin=function(){if(!done){done=true;if(cb)cb();}};
  if(!CS){fin();return;}setTimeout(fin,3000);
  CS.getKeys(function(e,ks){if(e||!ks||!ks.length){fin();return;}CS.removeItems(ks,fin);});
};
pull();

/* оплата Telegram Stars через сервер-бот */
function api(path,body,cb){
  fetch(String(CFG.TG_API).replace(/\/$/,'')+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({initData:tg.initData},body||{}))})
    .then(function(r){return r.json();}).then(function(j){cb(null,j);}).catch(function(e){cb(e);});
}
function poll(n,cb){api('/api/status',{},function(e,j){if(!e&&j&&j.pro)return cb(true);if(n<=0)return cb(false,'pending');setTimeout(function(){poll(n-1,cb);},1200);});}
W.pay=function(plan,cb){
  api('/api/invoice',{plan:plan},function(e,j){
    if(e||!j||!j.link){cb(false,'error');return;}
    try{tg.openInvoice(j.link,function(st){if(st==='paid')poll(6,cb);else cb(false,'cancelled');});}catch(x){cb(false,'error');}
  });
};
/* при запуске сервер — источник истины по статусу Pro */
window.addEventListener('water:ready',function(){
  if(CFG.DEMO||!W.canPay())return;
  api('/api/status',{},function(e,j){if(!e&&j&&typeof j.pro==='boolean'&&window.WaterApp)WaterApp.setPro(j.pro);});
});
})();
