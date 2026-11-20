"use strict";
const DURATIONS={'1d':{label:'1 Day',ms:86400000,mult:1},'2d':{label:'2 Days',ms:172800000,mult:1.8},'1w':{label:'1 Week',ms:604800000,mult:4.5}};

const DEFAULT_ITEMS=[];
(function(){
  const add=(kind,rows)=>rows.forEach(r=>DEFAULT_ITEMS.push({id:kind+'_'+r[0],name:r[1],kind,value:r[0],basePrice:r[2],desc:r[3]}));
  add('frame',[['top1_glow','No.1 Glowing Avatar + Crown',85,'Golden halo + crown for the #1 look'],['flame','Fire Ring',40,'Animated fire ring'],['wings','Royal Wings',55,'Animated golden wings'],['crown','Crown Halo',65,'Golden crown border'],['star','Starlight Ring',45,'Sparkling star ring'],['neon','Neon Pulse Ring',50,'Pulsing neon ring'],['ice','Frost Ring',48,'Spinning icy ring'],['rainbow','Rainbow Ring',60,'Animated rainbow ring']]);
  add('banner',[['bn-aurora','Aurora Banner',40,'Teal-blue animated banner'],['bn-crimson','Crimson Banner',45,'Crimson-violet banner'],['bn-galaxy','Galaxy Banner',50,'Cosmic galaxy banner'],['bn-solar','Solar Banner',48,'Warm solar gradient'],['bn-emerald','Emerald Banner',48,'Fresh emerald banner'],['bn-midnight','Midnight Banner',45,'Deep night banner'],['bn-rose','Rose Banner',48,'Vibrant rose banner'],['bn-ocean','Ocean Banner',46,'Flowing ocean waves'],['bn-sunrise','Sunrise Banner',48,'Warm sunrise glow'],['bn-candy','Candy Banner',50,'Sweet candy gradient']]);
  add('text',[['anim-firetxt','Fire Glow Text',55,'Glowing fire name'],['anim-royal-txt','Royal Glow Text',50,'Glowing royal name'],['anim-neon-txt','Neon Glow Text',50,'Glowing neon name'],['anim-gold-txt','Gold Glow Text',52,'Shining gold name'],['anim-ice-txt','Ice Glow Text',46,'Cool ice-blue name'],['anim-berry-txt','Berry Glow Text',48,'Pink-violet name'],['anim-mint-txt','Mint Glow Text',46,'Fresh mint name'],['anim-sunset-txt','Sunset Glow Text',50,'Warm sunset name'],['anim-lava-txt','Lava Glow Text',54,'Molten lava name'],['anim-aqua-txt','Aqua Glow Text',48,'Flowing aqua name']]);
  add('bio',[['bio-gold','Gold Bio Glow',42,'Glowing gold bio text'],['bio-cyan','Cyan Bio Glow',42,'Glowing cyan bio text'],['bio-pink','Pink Bio Glow',44,'Glowing pink bio text'],['bio-rainbow','Rainbow Bio Glow',52,'Animated rainbow bio']]);
  add('msg',[['msg-glow-gold','Gold Message Border',45,'Glowing gold chat bubble'],['msg-glow-cyan','Cyan Message Border',45,'Glowing cyan chat bubble'],['msg-glow-rose','Rose Message Border',48,'Glowing rose chat bubble'],['msg-glow-violet','Violet Message Border',50,'Glowing violet chat bubble'],['msg-glow-green','Green Message Border',46,'Glowing green chat bubble'],['msg-glow-orange','Orange Message Border',46,'Glowing orange chat bubble']]);
  add('tag',[['Study Boy','Study Boy',25,'Profile tag'],['Study Girl','Study Girl',25,'Profile tag'],['School Topper','School Topper',40,'Profile tag'],['Top Challenger','Top Challenger',40,'Profile tag'],['Night Owl','Night Owl',30,'Profile tag'],['Quiz Master','Quiz Master',35,'Profile tag'],['Early Bird','Early Bird',30,'Profile tag']]);
})();
let customItems=ls.get('sg_store_custom',[]);
let storeItems=[...DEFAULT_ITEMS,...customItems];
const CATS=[['all','All'],['frame','Frames'],['banner','Banners'],['text','Name Glow'],['bio','Bio Glow'],['msg','Msg Border'],['tag','Tags']];
let storeCat='all';
const itemKey=it=>`${it.kind}:${it.value||it.id}`;
function itemPreview(it){
  if(it.kind==='frame')return av({avatar:'🦊',frame:it.value},52);
  if(it.kind==='banner')return `<div class="bn-box ${esc(it.value)}" style="padding:6px 14px;font-size:12px"><b>${esc(it.name)}</b></div>`;
  if(it.kind==='msg')return `<div class="bub ${esc(it.value)}" style="background:var(--s1);font-size:12px">Glow message</div>`;
  if(it.kind==='bio')return `<span class="${esc(it.value)}" style="font-size:13px">Your glowing bio ✨</span>`;
  if(it.kind==='tag')return `<span class="p-tag" style="font-size:14px;padding:5px 14px">${esc(it.value)}</span>`;
  return `<span class="${esc(it.value)}" style="font-size:18px">${esc(it.name)}</span>`;
}
function renderStore(){
  cleanExpiredUnlocks();
  $('#storeTabs').innerHTML=CATS.map(c=>`<button class="chipbtn ${c[0]===storeCat?'on':''}" data-cat="${c[0]}">${c[1]}</button>`).join('');
  $('#storeList').innerHTML=storeItems.filter(it=>storeCat==='all'||it.kind===storeCat).map(it=>{
    const exp=Number(me.tempUnlocks[itemKey(it)]||0),isAct=exp>Date.now();
    return `<div class="card"><div class="prod-stage">${itemPreview(it)}</div><div class="row" style="justify-content:space-between"><b>${esc(it.name)}</b><span class="dur-pill">${isAct?Math.max(1,Math.ceil((exp-Date.now())/3600000))+'h left':'Timed'}</span></div><p style="color:var(--mu);font-size:12px;margin:3px 0 8px">${esc(it.desc||'')}</p><div class="row wrap">${Object.entries(DURATIONS).map(([dk,dv])=>`<button class="btn sm ${isAct?'ghost':''}" data-buy="${esc(it.id)}" data-dur="${dk}" style="flex:1">${dv.label} · ${fmtNum(Math.max(5,Math.round((it.basePrice||40)*dv.mult)))} 🪙</button>`).join('')}</div>${devMode&&String(it.id).startsWith('c_')?`<button class="btn red sm" style="margin-top:8px" data-delitem="${esc(it.id)}">Delete item</button>`:''}</div>`;
  }).join('')||'<div class="empty">No items</div>';
}
$('#storeTabs').onclick=e=>{const c=e.target.dataset.cat;if(c){storeCat=c;renderStore()}};
$('#storeList').onclick=e=>{
  const del=e.target.dataset.delitem;
  if(del&&devMode){customItems=customItems.filter(x=>x.id!==del);ls.set('sg_store_custom',customItems);storeItems=[...DEFAULT_ITEMS,...customItems];dbOp(()=>F.deleteDoc(F.doc(db,'store_items',del)));renderStore();return}
  const btn=e.target.closest('[data-buy]');if(!btn)return;
  const it=storeItems.find(x=>x.id===btn.dataset.buy),dur=DURATIONS[btn.dataset.dur];if(!it||!dur)return;
  const cost=Math.max(5,Math.round((it.basePrice||40)*dur.mult));if(me.coins<cost)return toast('Not enough coins');
  me.coins-=cost;const key=itemKey(it);me.tempUnlocks[key]=Math.max(Date.now(),Number(me.tempUnlocks[key]||0))+dur.ms;
  if(it.kind==='frame'&&it.value!=='dev')me.frame=it.value;
  if(it.kind==='banner')me.banner=it.value;if(it.kind==='text')me.textStyle=it.value;if(it.kind==='msg')me.msgStyle=it.value;if(it.kind==='bio')me.bioStyle=it.value;
  if(it.kind==='tag')me.tags=[...me.tags.filter(x=>x!==it.value&&!FREE_TAGS.includes(x)),it.value].slice(-3);
  saveMe();patchUser(uid,{...base(),coins:me.coins,tempUnlocks:me.tempUnlocks});dbOp(()=>F.setDoc(userRef(uid),{...base(),coins:me.coins,tempUnlocks:me.tempUnlocks},{merge:true}));
  bumpStat('store_buy');updateHud();buildProfile();renderStore();renderRanking();toast(`${it.name} (${dur.label})`);
};
$('#addStoreBtn').onclick=()=>{
  const m=modal('Add Store Item',`<label>Kind</label><select id="siK"><option>frame</option><option>banner</option><option>text</option><option>msg</option><option>bio</option><option>tag</option></select><label>Name</label><input id="siN" maxlength="40"><label>Value (existing CSS class, frame key, or tag name)</label><input id="siV" maxlength="80"><div class="row"><div style="flex:1"><label>Price (1 day)</label><input id="siP" type="number" value="40"></div></div><label>Description</label><input id="siD" maxlength="100"><label>…or paste JSON</label><textarea id="siJ" placeholder='{"name":"Gold Tag","kind":"tag","value":"Gold Scholar","basePrice":45}'></textarea><button class="btn full" id="siS">Save item</button>`);
  $('#siS',m).onclick=()=>{
    let it;const raw=$('#siJ',m).value.trim();
    try{it=raw?JSON.parse(raw):{kind:$('#siK',m).value,name:$('#siN',m).value.trim(),value:$('#siV',m).value.trim(),basePrice:+$('#siP',m).value||40,desc:$('#siD',m).value.trim()}}catch{return toast('Invalid JSON')}
    if(!it||!it.name||!it.value||!['frame','banner','text','msg','bio','tag'].includes(it.kind))return toast('Need kind, name and value');
    it={id:'c_'+Date.now().toString(36),name:String(it.name).slice(0,40),kind:it.kind,value:String(it.value).slice(0,80),basePrice:Math.max(5,+it.basePrice||40),desc:String(it.desc||'').slice(0,100)};
    customItems.push(it);ls.set('sg_store_custom',customItems);storeItems=[...DEFAULT_ITEMS,...customItems];dbOp(()=>F.setDoc(F.doc(db,'store_items',it.id),it));m.close();renderStore();toast('Item added');
  };
};


