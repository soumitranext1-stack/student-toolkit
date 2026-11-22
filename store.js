"use strict";
const DURATIONS={'1d':{label:'1 Day',ms:86400000,mult:1},'2d':{label:'2 Days',ms:172800000,mult:1.8},'1w':{label:'1 Week',ms:604800000,mult:4.5}};

/* Multi-tier Glowing & Lighting Store Tags */
const STORE_GLOW_TAGS=[
  /* Radiant Neon Tier */
  ['Neon Scholar','Neon Scholar',35,'Radiant Neon · Electric cyan glow tag','Radiant Neon'],
  ['Cyber Genius','Cyber Genius',38,'Radiant Neon · Pulse circuit lighting tag','Radiant Neon'],
  ['Volt Thinker','Volt Thinker',36,'Radiant Neon · High-voltage study tag','Radiant Neon'],
  ['Laser Focus','Laser Focus',35,'Radiant Neon · Sharp neon beam aura','Radiant Neon'],
  /* Solar & Flame Tier */
  ['Blaze Ace','Blaze Ace',45,'Solar Flame · Blazing amber lighting tag','Solar Flame'],
  ['Solar Legend','Solar Legend',50,'Solar Flame · Sunburst golden fire glow','Solar Flame'],
  ['Inferno Mind','Inferno Mind',48,'Solar Flame · Fiery crimson-orange halo','Solar Flame'],
  ['Phoenix Topper','Phoenix Topper',52,'Solar Flame · Rising flame prestige tag','Solar Flame'],
  /* Celestial & Prism Tier */
  ['Aurora Prodigy','Aurora Prodigy',58,'Celestial Prism · Flowing northern-lights tag','Celestial Prism'],
  ['Galaxy Ace','Galaxy Ace',56,'Celestial Prism · Animated cosmic gradient','Celestial Prism'],
  ['Prism Grandmaster','Prism Grandmaster',64,'Celestial Prism · Full-spectrum shimmer tag','Celestial Prism'],
  ['Starlight Sage','Starlight Sage',55,'Celestial Prism · Luminous twilight aura','Celestial Prism'],
  /* Royal & Elite Tier */
  ['Grand Champion','Grand Champion',60,'Royal Elite · Molten gold spotlight tag','Royal Elite'],
  ['Royal Mentor','Royal Mentor',50,'Royal Elite · Sovereign gold rim glow','Royal Elite'],
  ['Emerald Brain','Emerald Brain',44,'Royal Elite · Radiant emerald gem glow','Royal Elite'],
  ['Diamond Ranker','Diamond Ranker',52,'Royal Elite · Crystalline ice-blue halo','Royal Elite'],
  ['Frost Prodigy','Frost Prodigy',44,'Royal Elite · Glacial frost glow tag','Royal Elite'],
  ['Crimson Striker','Crimson Striker',46,'Royal Elite · Ruby lighting edge tag','Royal Elite'],
  /* Classic Study Tags */
  ['School Topper','School Topper',40,'Classic Glow · Top student badge','Classic'],
  ['Top Challenger','Top Challenger',40,'Classic Glow · Arena contender tag','Classic'],
  ['Quiz Master','Quiz Master',35,'Classic Glow · Trivia specialist tag','Classic'],
  ['Night Owl','Night Owl',30,'Classic Glow · Late-night grinder tag','Classic'],
  ['Early Bird','Early Bird',30,'Classic Glow · Morning study streak tag','Classic'],
  ['Study Boy','Study Boy',25,'Classic Glow · Profile tag','Classic'],
  ['Study Girl','Study Girl',25,'Classic Glow · Profile tag','Classic']
];

const DEFAULT_ITEMS=[];
(function(){
  const add=(kind,rows)=>rows.forEach(r=>{
    const key=`${kind}:${r[0]}`;
    if(typeof isRankExclusiveKey==='function'&&isRankExclusiveKey(key))return;
    DEFAULT_ITEMS.push({id:kind+'_'+r[0],name:r[1],kind,value:r[0],basePrice:r[2],desc:r[3],tier:r[4]||''});
  });
  if(typeof FX_STORE_ROWS!=='undefined'){
    add('frame',FX_STORE_ROWS.frame||[]);
    add('banner',FX_STORE_ROWS.banner||[]);
    add('text',FX_STORE_ROWS.text||[]);
    add('msg',FX_STORE_ROWS.msg||[]);
  }else{
    add('frame',[['fx_gold','Royal Gold',65,'Molten gold ring, shine sweep and a crown'],['fx_phoenix','Phoenix Wings',110,'Fire-gold ring with blazing wings']]);
    add('banner',[['bn-fx-gold','Royal Gold Banner',70,'Moving gold with shine sweep'],['bn-fx-aurora','Aurora Flow Banner',66,'Northern lights banner']]);
    add('text',[['fxt-aurora','Aurora Name',58,'Flowing northern-lights name'],['fxt-solar','Solar Name',64,'Burning sun gold name']]);
    add('msg',[['msg-fx-gold','Gold Flow Border',55,'Animated gold chat border'],['msg-fx-aurora','Aurora Flow Border',58,'Animated aurora border']]);
  }
  if(typeof FX_AVATAR_STORE_ROWS!=='undefined'){
    add('avatar',FX_AVATAR_STORE_ROWS);
  }
  add('bio',[['bio-gold','Gold Bio Glow',42,'Glowing gold bio text'],['bio-cyan','Cyan Bio Glow',42,'Glowing cyan bio text'],['bio-pink','Pink Bio Glow',44,'Glowing pink bio text'],['bio-rainbow','Rainbow Bio Glow',52,'Animated rainbow bio']]);
  add('tag',STORE_GLOW_TAGS);
})();

let customItems=ls.get('sg_store_custom',[]).filter(c=>!(typeof isRankExclusiveKey==='function'&&isRankExclusiveKey(`${c.kind}:${c.value}`)));
let storeItems=[...DEFAULT_ITEMS,...customItems];
const CATS=[['all','All'],['tag','Glow Tags'],['frame','Frames'],['banner','Banners'],['avatar','Avatars'],['text','Name Glow'],['bio','Bio Glow'],['msg','Msg Border']];
let storeCat='all';
const itemKey=it=>`${it.kind}:${it.value||it.id}`;

function itemPreview(it){
  if(it.kind==='avatar')return av({avatar:it.value,frame:''},52);
  if(it.kind==='frame')return av({avatar:'🦊',frame:it.value},56);
  if(it.kind==='banner')return `<div class="bn-box ${esc(it.value)}" style="padding:8px 16px;font-size:12px"><b>${esc(it.name)}</b></div>`;
  if(it.kind==='msg')return `<div class="bub ${esc(it.value)}" style="background:var(--s1);font-size:12px">Glow message preview</div>`;
  if(it.kind==='bio')return `<span class="${esc(it.value)}" style="font-size:13px">Your glowing bio ✨</span>`;
  if(it.kind==='tag')return `<span class="p-tag ${tagClassFor(it.value)}" style="font-size:13px;padding:6px 15px">${esc(it.value)}</span>`;
  return `<span class="${esc(it.value)}" style="font-size:18px">${esc(it.name)}</span>`;
}

function renderStore(){
  cleanExpiredUnlocks();
  $('#storeTabs').innerHTML=CATS.map(c=>`<button class="chipbtn ${c[0]===storeCat?'on':''}" data-cat="${c[0]}">${c[1]}</button>`).join('');
  $('#storeList').innerHTML=storeItems.filter(it=>storeCat==='all'||it.kind===storeCat).map(it=>{
    const exp=Number(me.tempUnlocks[itemKey(it)]||0),isAct=exp>Date.now();
    const tierBadge=it.tier?`<span class="tier-pill">${esc(it.tier)}</span>`:'';
    return `<div class="card"><div class="prod-stage">${itemPreview(it)}</div><div class="row" style="justify-content:space-between;gap:6px"><b>${esc(it.name)}</b><div class="row" style="gap:5px">${tierBadge}<span class="dur-pill">${isAct?Math.max(1,Math.ceil((exp-Date.now())/3600000))+'h left':'Timed'}</span></div></div><p style="color:var(--mu);font-size:12px;margin:4px 0 8px">${esc(it.desc||'')}</p><div class="row wrap">${Object.entries(DURATIONS).map(([dk,dv])=>`<button class="btn sm ${isAct?'ghost':''}" data-buy="${esc(it.id)}" data-dur="${dk}" style="flex:1">${dv.label} · ${fmtNum(Math.max(5,Math.round((it.basePrice||40)*dv.mult)))} 🪙</button>`).join('')}</div>${devMode&&String(it.id).startsWith('c_')?`<button class="btn red sm" style="margin-top:8px" data-delitem="${esc(it.id)}">Delete item</button>`:''}</div>`;
  }).join('')||'<div class="empty">No items</div>';
}

$('#storeTabs').onclick=e=>{const c=e.target.dataset.cat;if(c){storeCat=c;renderStore()}};
$('#storeList').onclick=e=>{
  const del=e.target.dataset.delitem;
  if(del){
    if(!devMode)return toast('Developer only');
    customItems=customItems.filter(x=>x.id!==del);ls.set('sg_store_custom',customItems);
    storeItems=[...DEFAULT_ITEMS,...customItems];
    dbOp(()=>F.deleteDoc(F.doc(db,'store_items',del)));
    renderStore();toast('Item deleted');return;
  }
  const btn=e.target.closest('[data-buy]');if(!btn)return;
  if(needLogin('the Store'))return;
  const buyKey='buy_'+btn.dataset.buy+'_'+btn.dataset.dur;
  if(inFlightOps.has(buyKey))return;
  const it=storeItems.find(x=>x.id===btn.dataset.buy),dur=DURATIONS[btn.dataset.dur];
  if(!it||!dur)return;
  if(typeof isRankExclusiveKey==='function'&&isRankExclusiveKey(itemKey(it)))return toast('Exclusive to Leaderboard Top 1–3');
  const cost=Math.max(5,Math.round((it.basePrice||40)*dur.mult));
  if(me.coins<cost)return toast('Not enough coins');

  inFlightOps.add(buyKey);
  try{
    me.coins=clampCoins(me.coins-cost);
    const key=itemKey(it);
    me.tempUnlocks[key]=Math.max(Date.now(),Number(me.tempUnlocks[key]||0))+dur.ms;
    if(it.kind==='avatar')me.avatar=it.value;
    if(it.kind==='frame'&&it.value!=='dev')me.frame=it.value;
    if(it.kind==='banner')me.banner=it.value;
    if(it.kind==='text')me.textStyle=it.value;
    if(it.kind==='msg')me.msgStyle=it.value;
    if(it.kind==='bio')me.bioStyle=it.value;
    if(it.kind==='tag'){
      me.tags=[...me.tags.filter(x=>x!==it.value&&!FREE_TAGS.includes(x)),it.value].slice(-3);
    }
    saveMe();
    patchUser(uid,{...base(),coins:me.coins,tempUnlocks:me.tempUnlocks});
    dbOp(()=>F.setDoc(userRef(uid),{...base(),coins:me.coins,tempUnlocks:me.tempUnlocks},{merge:true}));
    bumpStat('store_buy');updateHud();buildProfile();renderStore();renderRanking();
    if(typeof playSfx==='function')playSfx('taskClaim');
    toast(`Unlocked ${it.name} (${dur.label})`);
  }finally{
    setTimeout(()=>inFlightOps.delete(buyKey),400);
  }
};

$('#addStoreBtn').onclick=()=>{
  if(!devMode)return toast('Developer only');
  const m=modal('Add Store Item (Developer)',`<label>Kind</label><select id="siK"><option>tag</option><option>avatar</option><option>frame</option><option>banner</option><option>text</option><option>msg</option><option>bio</option></select><label>Name</label><input id="siN" maxlength="40"><label>Value (CSS class, frame key, avatar emoji, or tag text)</label><input id="siV" maxlength="80"><div class="row"><div style="flex:1"><label>Price (1 day)</label><input id="siP" type="number" min="5" max="10000" value="40"></div></div><label>Description</label><input id="siD" maxlength="100"><label>…or paste JSON</label><textarea id="siJ" placeholder='{"name":"Gold Tag","kind":"tag","value":"Gold Scholar","basePrice":45}'></textarea><button class="btn full" id="siS">Save item</button>`);
  $('#siS',m).onclick=()=>{
    if(!devMode)return;
    let it;const raw=$('#siJ',m).value.trim();
    try{it=raw?JSON.parse(raw):{kind:$('#siK',m).value,name:$('#siN',m).value.trim(),value:$('#siV',m).value.trim(),basePrice:+$('#siP',m).value||40,desc:$('#siD',m).value.trim()}}catch{return toast('Invalid JSON')}
    if(!it||!it.name||!it.value||!['avatar','frame','banner','text','msg','bio','tag'].includes(it.kind))return toast('Need kind, name and value');
    if(typeof isRankExclusiveKey==='function'&&isRankExclusiveKey(`${it.kind}:${it.value}`))return toast('Cannot sell Leaderboard Top 1–3 exclusive items');
    it={id:'c_'+Date.now().toString(36),name:String(it.name).slice(0,40),kind:it.kind,value:String(it.value).slice(0,80),basePrice:clampSafeInt(it.basePrice||40,5,10000),desc:String(it.desc||'').slice(0,100)};
    customItems.push(it);ls.set('sg_store_custom',customItems);storeItems=[...DEFAULT_ITEMS,...customItems];
    dbOp(()=>F.setDoc(F.doc(db,'store_items',it.id),it),()=>toast('Could not sync item'));
    m.close();renderStore();toast('Item added');
  };
};
