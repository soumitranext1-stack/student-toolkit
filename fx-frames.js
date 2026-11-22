/* =====================================================================
   FX PACK: FRAMES + EXCLUSIVE TOP 1-3 LEADERBOARD ASSETS
   + NAME GLOW + BANNERS + MESSAGE GLOW
   ===================================================================== */
"use strict";

const FX_RARITY={
  rare:     {label:'Rare',      color:'#4da3ff'},
  epic:     {label:'Epic',      color:'#b266ff'},
  legendary:{label:'Legendary', color:'#ffb020'},
  mythic:   {label:'Mythic',    color:'#ff3d6e'},
  vip:      {label:'VIP',       color:'#ffd700'},
  rank:     {label:'Leaderboard Exclusive', color:'#ffe27a'}
};

const FX_FRAMES=[
 /* ---- RARE ---- */
 {id:'fx_silver',   name:'Silver Chrome',   rarity:'rare',      price:40,  mods:'sh',            desc:'Polished chrome ring with a moving shine'},
 {id:'fx_emerald',  name:'Emerald Pulse',   rarity:'rare',      price:42,  mods:'pls spk',       desc:'Green gem ring that breathes and sparkles'},
 {id:'fx_rose',     name:'Rose Quartz',     rarity:'rare',      price:42,  mods:'pls spk',       desc:'Soft pink ring with twinkling stars'},
 {id:'fx_sapphire', name:'Sapphire Orbit',  rarity:'rare',      price:45,  mods:'orb pls',       desc:'Blue ring with two orbiting lights'},
 /* ---- EPIC ---- */
 {id:'fx_gold',     name:'Royal Gold',      rarity:'epic',      price:65,  mods:'sh pls',        badges:['crown'],  desc:'Molten gold ring, shine sweep and a crown'},
 {id:'fx_crimson',  name:'Crimson Blade',   rarity:'epic',      price:65,  mods:'pls sh',        desc:'Blood-red and black spinning ring'},
 {id:'fx_aurora',   name:'Aurora Flow',     rarity:'epic',      price:70,  mods:'pls sh',        desc:'Northern-lights colours flowing round'},
 {id:'fx_galaxy',   name:'Galaxy Orbit',    rarity:'epic',      price:72,  mods:'orb spk pls',   desc:'Violet cosmos with orbiting stars'},
 {id:'fx_sakura',   name:'Sakura Dream',    rarity:'epic',      price:68,  mods:'orb spk',       desc:'Pink blossom ring with drifting petals'},
 {id:'fx_ocean',    name:'Ocean Wave',      rarity:'epic',      price:66,  mods:'sh pls',        desc:'Deep blue water ring with a glint'},
 {id:'fx_toxic',    name:'Toxic Neon',      rarity:'epic',      price:68,  mods:'pls',           desc:'Lime and black hazard spinner'},
 {id:'fx_ember',    name:'Ember Flame',     rarity:'epic',      price:74,  mods:'pls spk',       desc:'Flickering fire ring with flying sparks'},
 /* ---- LEGENDARY ---- */
 {id:'fx_phoenix',  name:'Phoenix Wings',   rarity:'legendary', price:110, mods:'sh pls spk',    badges:['wings'],  desc:'Fire-gold ring with blazing wings'},
 {id:'fx_dragon',   name:'Dragon Crest',    rarity:'legendary', price:115, mods:'sh orb pls',    badges:['crown'],  desc:'Crimson and gold ring, ember orbit and a crest'},
 {id:'fx_frostking',name:'Frost Crown',     rarity:'legendary', price:112, mods:'sh spk pls',    badges:['crown'],  desc:'Icy ring, crystal crown, falling sparkles'},
 {id:'fx_celestial',name:'Celestial Halo',  rarity:'legendary', price:120, mods:'sh ray pls',    badges:['wings'],  desc:'Holy light rays and white-gold wings'},
 {id:'fx_void',     name:'Void Rift',       rarity:'legendary', price:108, mods:'pls orb sh',    desc:'Purple void ring pulling light inward'},
 {id:'fx_prism',    name:'Prism Rainbow',   rarity:'legendary', price:105, mods:'sh pls',        desc:'Full spectrum ring with shimmer'},
 {id:'fx_thunder',  name:'Thunder Strike',  rarity:'legendary', price:110, mods:'pls spk',       desc:'Yellow-blue ring with lightning flashes'},
 /* ---- MYTHIC ---- */
 {id:'fx_solar',    name:'Solar Emperor',   rarity:'mythic',    price:170, mods:'sh ray orb pls spk', badges:['crown'], tag:'EMPEROR', desc:'Rotating sun rays, orbit, crown and ribbon'},
 {id:'fx_lunar',    name:'Lunar Queen',     rarity:'mythic',    price:170, mods:'sh ray spk pls',     badges:['wings'], tag:'LUNAR',   desc:'Moonlight rays and silver wings'},
 {id:'fx_chaos',    name:'Chaos Throne',    rarity:'mythic',    price:190, mods:'sh orb ray pls spk', badges:['crown'], tag:'CHAOS',   desc:'Crimson, violet and gold rings at war'},
 /* ---- VIP ---- */
 {id:'fx_vip',      name:'VIP Diamond',     rarity:'vip',       price:130, mods:'sh pls spk',    badges:['diamond'], tag:'VIP', desc:'Purple-gold ring with diamond and VIP ribbon'},
 /* ---- LEADERBOARD TOP 1-3 EXCLUSIVE FRAMES (NOT IN STORE) ---- */
 {id:'fx_top1',     name:'Top #1 Sovereign Ring', rarity:'rank', price:0, rank:1, mods:'sh ray orb pls spk', badges:['laurel','crown'], tag:'TOP #1', desc:'Exclusive Leaderboard #1 Sovereign gold laurel, rays & crown'},
 {id:'fx_top2',     name:'Top #2 Celestial Ring', rarity:'rank', price:0, rank:2, mods:'sh orb pls spk',     badges:['laurel','crown'], tag:'TOP #2', desc:'Exclusive Leaderboard #2 Silver laurel, orbit & crown'},
 {id:'fx_top3',     name:'Top #3 Ember Ring',     rarity:'rank', price:0, rank:3, mods:'sh pls spk',         badges:['laurel','crown'], tag:'TOP #3', desc:'Exclusive Leaderboard #3 Bronze laurel & crown'}
];

/* Exclusive Top 1-3 Leaderboard Package (Frames, Banners, Avatars, Badges) - NEVER sold in store */
const LB_EXCLUSIVE_ASSETS={
  1:{
    rank:1,
    title:'Top #1 Sovereign Champion',
    frame:'fx_top1',
    frameLabel:'Top #1 Sovereign Ring',
    banner:'bn-lb-top1',
    bannerLabel:'Top #1 Sovereign Throne Banner',
    avatar:'lb_av_top1',
    avatarLabel:'Sovereign Crown Crest',
    badge:'TOP #1 CHAMPION',
    badgeClass:'lb-badge-1',
    defaultCoins:100,
    days:1
  },
  2:{
    rank:2,
    title:'Top #2 Celestial Elite',
    frame:'fx_top2',
    frameLabel:'Top #2 Celestial Ring',
    banner:'bn-lb-top2',
    bannerLabel:'Top #2 Celestial Silver Banner',
    avatar:'lb_av_top2',
    avatarLabel:'Celestial Silver Crest',
    badge:'TOP #2 ELITE',
    badgeClass:'lb-badge-2',
    defaultCoins:60,
    days:1
  },
  3:{
    rank:3,
    title:'Top #3 Ember Master',
    frame:'fx_top3',
    frameLabel:'Top #3 Ember Ring',
    banner:'bn-lb-top3',
    bannerLabel:'Top #3 Ember Bronze Banner',
    avatar:'lb_av_top3',
    avatarLabel:'Ember Bronze Shield',
    badge:'TOP #3 MASTER',
    badgeClass:'lb-badge-3',
    defaultCoins:30,
    days:1
  }
};

const LB_EXCLUSIVE_BANNERS=[
  ['bn-lb-top1','Top #1 Sovereign Throne'],
  ['bn-lb-top2','Top #2 Celestial Silver'],
  ['bn-lb-top3','Top #3 Ember Bronze']
];

const LB_EXCLUSIVE_KEYS=new Set([
  'frame:fx_top1','frame:fx_top2','frame:fx_top3',
  'banner:bn-lb-top1','banner:bn-lb-top2','banner:bn-lb-top3',
  'avatar:lb_av_top1','avatar:lb_av_top2','avatar:lb_av_top3',
  'badge:lb_top1','badge:lb_top2','badge:lb_top3'
]);
const isRankExclusiveKey=k=>LB_EXCLUSIVE_KEYS.has(String(k||''));

const FX_MAP=Object.fromEntries(FX_FRAMES.map(f=>[f.id,f]));
const isFxFrame=id=>!!FX_MAP[id];

const FX_SVG={
 crown:'<fxl class="bd cr"><svg viewBox="0 0 40 26"><path d="M3 22 1 6l10 7L20 2l9 11 10-7-2 16z" fill="var(--bd1)" stroke="var(--bd2)" stroke-width="1.6" stroke-linejoin="round"/><rect x="3" y="22" width="34" height="3.6" rx="1.8" fill="var(--bd1)" stroke="var(--bd2)" stroke-width="1.2"/><circle cx="20" cy="9" r="2" fill="var(--bd2)"/><circle cx="6" cy="9" r="1.4" fill="var(--bd2)"/><circle cx="34" cy="9" r="1.4" fill="var(--bd2)"/></svg></fxl>',
 diamond:'<fxl class="bd dm"><svg viewBox="0 0 30 26"><path d="M8 2h14l7 8-14 15L1 10z" fill="var(--bd1)" stroke="var(--bd2)" stroke-width="1.6" stroke-linejoin="round"/><path d="M1 10h28M8 2l7 8 7-8M15 10v15" fill="none" stroke="var(--bd2)" stroke-width="1.1" stroke-linejoin="round"/></svg></fxl>',
 wings:(function(){
   const w='<path d="M80 44C60 36 34 22 4 6c14 22 36 34 76 44z"/><path d="M80 50C58 46 30 40 8 30c14 16 40 24 72 26z"/><path d="M80 56C60 56 38 56 20 54c12 12 36 12 60 8z"/>';
   return '<fxl class="bd wg"><svg viewBox="-40 0 280 80" preserveAspectRatio="xMidYMid meet"><g fill="var(--bd1)" stroke="var(--bd2)" stroke-width="1.3" stroke-linejoin="round"><g transform="translate(-40 0)">'+w+'</g><g transform="translate(200 0) scale(-1 1)"><g transform="translate(-40 0)">'+w+'</g></g></g></svg></fxl>';
 })(),
 laurel:(function(){
   let s='';
   for(let i=0;i<9;i++){
     const a=Math.PI*(0.62+i*0.095),x=50+45*Math.cos(a),y=50+45*Math.sin(a),deg=a*180/Math.PI+90+(i<4?-14:14);
     const leaf=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7.4" ry="3.1" transform="rotate(${deg.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
     s+=leaf+`<g transform="translate(100 0) scale(-1 1)">${leaf}</g>`;
   }
   return '<fxl class="bd lr"><svg viewBox="0 0 100 100"><g fill="var(--bd1)" stroke="var(--bd2)" stroke-width=".9">'+s+'</g></svg></fxl>';
 })()
};

function fxFrameHtml(id,size){
  const d=FX_MAP[id];if(!d)return '';
  const lite=(size||44)<=44?' lite':'';
  return `<fxl class="fx ${id.replace(/_/g,'-')} ${d.mods||''}${lite}">`+
    '<fxl class="la"></fxl><fxl class="lb"></fxl><fxl class="lc"></fxl><fxl class="ld"></fxl><fxl class="le"></fxl>'+
    '<fxl class="lk k1"></fxl><fxl class="lk k2"></fxl><fxl class="lk k3"></fxl>'+
    (d.badges||[]).map(b=>FX_SVG[b]||'').join('')+
    (d.tag?`<fxl class="bd tg">${d.tag}</fxl>`:'')+
  '</fxl>';
}
const fxRarityPill=r=>{const x=FX_RARITY[r];return x?`<span class="dur-pill" style="color:${x.color};border-color:${x.color}">${x.label}</span>`:''};

const FX_TEXTS=[
 ['fxt-aurora','Aurora Name',58,'Flowing northern-lights name'],['fxt-crimson','Crimson Name',56,'Blood-red glowing name'],
 ['fxt-galaxy','Galaxy Name',60,'Violet cosmos name'],['fxt-prism','Prism Name',62,'Rainbow spectrum name'],
 ['fxt-void','Void Name',58,'Dark purple energy name'],['fxt-thunder','Thunder Name',60,'Yellow-blue lightning name'],
 ['fxt-sakura','Sakura Name',54,'Soft pink blossom name'],['fxt-chrome','Chrome Name',52,'Polished silver name'],
 ['fxt-emerald','Emerald Name',54,'Green gem name'],['fxt-solar','Solar Name',64,'Burning sun gold name']
];
const FX_BANNERS=[
 ['bn-fx-gold','Royal Gold Banner',70,'Moving gold with shine sweep'],['bn-fx-aurora','Aurora Flow Banner',66,'Northern lights banner'],
 ['bn-fx-galaxy','Galaxy Banner',68,'Deep space banner'],['bn-fx-crimson','Crimson Blade Banner',64,'Red and black banner'],
 ['bn-fx-void','Void Rift Banner',66,'Dark purple banner'],['bn-fx-frost','Frost Banner',62,'Icy blue banner'],
 ['bn-fx-solar','Solar Banner',70,'Burning sun banner'],['bn-fx-prism','Prism Banner',72,'Rainbow banner'],
 ['bn-fx-ember','Ember Banner',66,'Fire glow banner'],['bn-fx-ocean','Ocean Banner',62,'Deep blue waves banner']
];
const FX_MSGS=[
 ['msg-fx-gold','Gold Flow Border',55,'Animated gold chat border'],['msg-fx-aurora','Aurora Flow Border',58,'Animated aurora border'],
 ['msg-fx-crimson','Crimson Flow Border',55,'Animated crimson border'],['msg-fx-galaxy','Galaxy Flow Border',58,'Animated galaxy border'],
 ['msg-fx-frost','Frost Flow Border',55,'Animated icy border'],['msg-fx-toxic','Toxic Flow Border',55,'Animated lime border']
];

/* Strictly excludes rank:1/2/3 exclusive frames & banners from Store */
const FX_STORE_ROWS={
  frame:FX_FRAMES.filter(f=>!f.rank).map(f=>[f.id,f.name,f.price,f.desc]),
  text:FX_TEXTS, banner:FX_BANNERS, msg:FX_MSGS
};

/* Profile pick lists (exclusive Top 1-3 banners/frames included only for lookup; Profile filters by active unlock!) */
const FX_USER_LISTS={
  frame:FX_FRAMES.map(f=>[f.id,f.name]),
  text:FX_TEXTS.map(t=>[t[0],t[1].replace(' Name','')]),
  banner:[...FX_BANNERS.map(b=>[b[0],b[1].replace(' Banner','')]),...LB_EXCLUSIVE_BANNERS],
  msg:FX_MSGS.map(m=>[m[0],m[1].replace(' Flow Border','')])
};
