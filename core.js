"use strict";
const DEV_LOGIN_ID = "soumitranext1@gmail.com";
const DEV_UID = "DEV_SUDIPTA_99";
const MAX_COINS = 999999999;
const MAX_EXP = 99999900;
const MAX_DAILY_PTS = 999999999;
const MAX_LEVEL = 999999;
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const BAD_WORDS = ["fuck","bitch","asshole","bastard","madarchod","bhosdike","chutiya","lund","randi","sex","porn"];

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);

/* Crisp SVG Icon Registry */
const UI_SVG={
  sun:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  moon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  coin:`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" fill="#ffd36b" stroke="#b45309" stroke-width="1.8"/><circle cx="12" cy="12" r="6.2" stroke="#92400e" stroke-width="1.4"/><path d="M12 8.2v7.6M9.8 10.2c0-.9 1-1.6 2.2-1.6s2.2.7 2.2 1.6-1 1.4-2.2 1.6-2.2.7-2.2 1.6 1 1.6 2.2 1.6 2.2-.7 2.2-1.6" stroke="#78350f" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  pin:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16h14v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6a1 1 0 0 1 1-1h1V3H7v2h1a1 1 0 0 1 1 1z"/></svg>`,
  edit:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  frame:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5" stroke-dasharray="3 2"/></svg>`,
  spark:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.1 5.4L19.5 10.5l-5.4 2.1L12 18l-2.1-5.4-5.4-2.1 5.4-2.1L12 3z"/></svg>`,
  chat:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  bio:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h12M4 18h8"/></svg>`,
  tag:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>`,
  banner:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 15l5-5 4 4 3-3 6 4"/></svg>`,
  redpacket:`<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="2.5" width="16" height="19" rx="3" fill="#dc2626" stroke="#ffd36b" stroke-width="1.6"/><path d="M4 8.5c3 3 13 3 16 0" stroke="#ffd36b" stroke-width="1.6"/><circle cx="12" cy="11.5" r="2.7" fill="#ffd36b"/></svg>`,
  trophy:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  reset:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>`,
  globe:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`
};

/* Safe Number Clamping & Overflow-Proof Formatter (prevents 1.999e+21 / 9e+33B bugs) */
function clampSafeInt(raw, min=0, max=MAX_COINS){
  const n=Number(raw);
  if(!Number.isFinite(n))return min;
  if(n<min)return min;
  if(n>max)return max;
  return Math.trunc(n);
}
const clampCoins=n=>clampSafeInt(n,0,MAX_COINS);
const clampExp=n=>clampSafeInt(n,0,MAX_EXP);
const calcLevel=exp=>Math.max(1,Math.min(MAX_LEVEL,Math.floor(clampExp(exp)/100)+1));

function fmtNum(raw, cap=MAX_COINS){
  const v=clampSafeInt(raw,-cap,cap), abs=Math.abs(v);
  if(abs>=1000000000)return (v/1000000000).toFixed(1).replace(/\.0$/,'')+'B';
  if(abs>=1000000)return (v/1000000).toFixed(1).replace(/\.0$/,'')+'M';
  if(abs>=10000)return (v/1000).toFixed(1).replace(/\.0$/,'')+'K';
  return String(v);
}

/* Glowing Tag Style Resolver (including Signature Developer & LVL 99 Glow) */
const TAG_STYLE_MAP={
  'Neon Scholar':'tag-fx-neon','Cyber Genius':'tag-fx-neon','Volt Thinker':'tag-fx-neon','Laser Focus':'tag-fx-neon',
  'Blaze Ace':'tag-fx-solar','Solar Legend':'tag-fx-solar','Inferno Mind':'tag-fx-solar','Phoenix Topper':'tag-fx-solar',
  'Aurora Prodigy':'tag-fx-prism','Galaxy Ace':'tag-fx-prism','Prism Grandmaster':'tag-fx-prism','Starlight Sage':'tag-fx-prism',
  'Grand Champion':'tag-fx-royal','Royal Mentor':'tag-fx-royal','Diamond Ranker':'tag-fx-ice','Frost Prodigy':'tag-fx-ice',
  'Emerald Brain':'tag-fx-emerald','Crimson Striker':'tag-fx-crimson',
  'School Topper':'tag-fx-royal','Top Challenger':'tag-fx-solar','Quiz Master':'tag-fx-neon',
  'Night Owl':'tag-fx-prism','Early Bird':'tag-fx-emerald','Study Boy':'tag-fx-classic','Study Girl':'tag-fx-classic'
};

function tagClassFor(tagName){
  const raw=String(tagName||'').trim();
  const low=raw.toLowerCase();
  if(low==='developer'||low==='dev')return 'p-tag-dev-sig';
  if(low==='lvl 99')return 'p-tag-lvl99-sig';
  return TAG_STYLE_MAP[raw]||'tag-fx-classic';
}

function getActiveRankBadge(u){
  const tu=(u&&u.tempUnlocks&&typeof u.tempUnlocks==='object')?u.tempUnlocks:{};
  const now=Date.now();
  for(const rk of [1,2,3]){
    if(Number(tu['badge:lb_top'+rk]||0)>now && typeof LB_EXCLUSIVE_ASSETS!=='undefined' && LB_EXCLUSIVE_ASSETS[rk]){
      return LB_EXCLUSIVE_ASSETS[rk];
    }
  }
  return null;
}

function renderTags(tags, userObj){
  const list=Array.isArray(tags)&&tags.length?tags:['Newbie'];
  const rb=userObj?getActiveRankBadge(userObj):null;
  const badgeHtml=rb?`<span class="lb-badge ${esc(rb.badgeClass)}">${esc(rb.badge)}</span>`:'';
  return `<div class="tag-grid">${badgeHtml}${list.map(tg=>{
    const s=String(tg||'').trim();
    if(!s)return '';
    return `<span class="p-tag ${tagClassFor(s)}">${esc(s)}</span>`;
  }).join('')}</div>`;
}

function toast(t){$$('.toast').forEach(x=>x.remove());const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2400)}

let themeMode=localStorage.getItem('sg_theme')||'dark';
function applyTheme(){
  document.body.classList.toggle('light',themeMode==='light');
  const tb=$('#themeBtn');
  if(tb)tb.innerHTML=themeMode==='light'?UI_SVG.sun:UI_SVG.moon;
  localStorage.setItem('sg_theme',themeMode);
}
$('#themeBtn').onclick=()=>{themeMode=(themeMode==='light'?'dark':'light');applyTheme()};

const LANGS={
  en:{code:'EN',name:'English',home:'Student Tools'},
  hi:{code:'HI',name:'हिन्दी (Hindi)',home:'स्टूडेंट टूल्स'},
  bn:{code:'BN',name:'বাংলা (Bengali)',home:'স্টুডেন্ট টুলস'},
  es:{code:'ES',name:'Español (Spanish)',home:'Herramientas'},
  fr:{code:'FR',name:'Français (French)',home:'Outils Étudiant'},
  ta:{code:'TA',name:'தமிழ் (Tamil)',home:'மாணவர் கருவிகள்'},
  te:{code:'TE',name:'తెలుగు (Telugu)',home:'విద్యార్థి టూల్స్'}
};
let langKey=localStorage.getItem('sg_lang')||'en';
const I18N={
en:{home:'Home',games:'Games',rank:'Rank',tasks:'Tasks',store:'Store',chat:'Chat',profile:'Profile',tools:'Student Tools',poems:'Poems & Writing Wall',req:'Request Poem',gamesH:'Games Hub',lb:'Daily Leaderboard',d5:'Daily 5 Tasks',storeH:'Store',msgs:'Messages',addf:'Add friend',yp:'Your Profile',streak:'day streak'},
hi:{home:'होम',games:'गेम्स',rank:'रैंक',tasks:'टास्क',store:'स्टोर',chat:'चैट',profile:'प्रोफ़ाइल',tools:'स्टूडेंट टूल्स',poems:'कविता और लेखन दीवार',req:'कविता भेजें',gamesH:'गेम्स हब',lb:'दैनिक लीडरबोर्ड',d5:'आज के 5 टास्क',storeH:'स्टोर',msgs:'संदेश',addf:'दोस्त जोड़ें',yp:'आपकी प्रोफ़ाइल',streak:'दिन की स्ट्रीक'},
bn:{home:'হোম',games:'গেমস',rank:'র‍্যাঙ্ক',tasks:'টাস্ক',store:'স্টোর',chat:'চ্যাট',profile:'প্রোফাইল',tools:'স্টুডেন্ট টুলস',poems:'কবিতা ও লেখার দেয়াল',req:'কবিতা পাঠান',gamesH:'গেমস হাব',lb:'দৈনিক লিডারবোর্ড',d5:'আজকের ৫টি টাস্ক',storeH:'স্টোর',msgs:'বার্তা',addf:'বন্ধু যোগ করুন',yp:'আপনার প্রোফাইল',streak:'দিনের স্ট্রিক'},
es:{home:'Inicio',games:'Juegos',rank:'Ranking',tasks:'Tareas',store:'Tienda',chat:'Chat',profile:'Perfil',tools:'Herramientas',poems:'Muro de poemas y textos',req:'Enviar poema',gamesH:'Centro de juegos',lb:'Clasificación diaria',d5:'5 tareas diarias',storeH:'Tienda',msgs:'Mensajes',addf:'Añadir amigo',yp:'Tu perfil',streak:'días seguidos'},
fr:{home:'Accueil',games:'Jeux',rank:'Classement',tasks:'Tâches',store:'Boutique',chat:'Chat',profile:'Profil',tools:'Outils Étudiant',poems:'Mur de poèmes et textes',req:'Proposer un poème',gamesH:'Espace jeux',lb:'Classement du jour',d5:'5 tâches du jour',storeH:'Boutique',msgs:'Messages',addf:'Ajouter un ami',yp:'Votre profil',streak:'jours de suite'},
ta:{home:'முகப்பு',games:'விளையாட்டு',rank:'தரவரிசை',tasks:'பணிகள்',store:'கடை',chat:'அரட்டை',profile:'சுயவிவரம்',tools:'மாணவர் கருவிகள்',poems:'கவிதை & எழுத்துச் சுவர்',req:'கவிதை அனுப்பு',gamesH:'விளையாட்டு மையம்',lb:'தினசரி தரவரிசை',d5:'தினசரி 5 பணிகள்',storeH:'கடை',msgs:'செய்திகள்',addf:'நண்பரைச் சேர்',yp:'உங்கள் சுயவிவரம்',streak:'நாள் தொடர்'},
te:{home:'హోమ్',games:'గేమ్స్',rank:'ర్యాంక్',tasks:'టాస్క్‌లు',store:'స్టोर',chat:'చాట్',profile:'ప్రొఫైల్',tools:'విద్యార్థి టూల్స్',poems:'కవితలు & రచనల గోడ',req:'కవిత పంపండి',gamesH:'గేమ్స్ హబ్',lb:'రోజువారీ లీడర్‌బోర్డ్',d5:'రోజువారీ 5 టాస్క్‌లు',storeH:'స్టోర్',msgs:'సందేశాలు',addf:'స్నేహితుని జోడించు',yp:'మీ ప్రొఫైల్',streak:'రోజుల స్ట్రీక్'}
};
const tr=k=>(I18N[langKey]&&I18N[langKey][k])||I18N.en[k]||k;
const NAV_KEYS={tools:'home',games:'games',ranking:'rank',tasks:'tasks',store:'store',chat:'chat',profile:'profile'};
function applyLang(){
  const l=LANGS[langKey]||LANGS.en;$('#langCode').textContent=l.code;document.documentElement.lang=langKey;
  $$('[data-i]').forEach(e=>e.textContent=tr(e.dataset.i));
  $$('#nav [data-tab]').forEach(b=>{const em=$('em',b);if(em)em.textContent=tr(NAV_KEYS[b.dataset.tab])});
  localStorage.setItem('sg_lang',langKey);
}
$('#langBtn').onclick=()=>{
  const m=modal('Select Language',Object.entries(LANGS).map(([k,v])=>`<button class="btn ${k===langKey?'':'ghost'} full" data-l="${k}">${esc(v.name)}</button>`).join(''));
  m.onclick=e=>{if(e.target.dataset.l){langKey=e.target.dataset.l;applyLang();buildProfile();m.close()}};
};

function openToolClean(href,stat){
  if(!href)return;
  if(!devMode){if(me.coins<5)return toast('Need 5 coins for tool export');addReward(-5,0,null,true)}
  stat=stat||(typeof TOOLS!=='undefined'?(TOOLS.find(x=>x[0]===href)||[])[4]:null);
  if(stat)bumpStat(stat);
  openPage(href,'tools');
}
function openPage(href,ret){
  try{sessionStorage.setItem('sg_return',ret||'tools')}catch{}
  history.replaceState(null,'',location.pathname);
  location.assign(href);
}
addEventListener('pageshow',e=>{
  let r=null;try{r=sessionStorage.getItem('sg_return');sessionStorage.removeItem('sg_return')}catch{}
  if(!r)return;showTab(r);cur=null;$('#thread').hidden=true;if(e.persisted){updateHud();renderAll()}
});
window.__openTool=openToolClean;

let guestUid=localStorage.getItem('sg_guest_uid');
if(!guestUid){guestUid='SG'+Math.floor(10000000+Math.random()*89999999);localStorage.setItem('sg_guest_uid',guestUid)}
let uid=localStorage.getItem('sg_uid')||guestUid;localStorage.setItem('sg_uid',uid);

function isDevAccount(u){
  if(!u)return false;
  if(u.uid===DEV_UID)return true;
  return u.accountType==='account' && String(u.accountId||'').trim().toLowerCase()===DEV_LOGIN_ID;
}

function freshDefaultProfile(targetUid, isGuest){
  return {
    uid:targetUid,
    name:isGuest?('Guest '+targetUid.slice(-4)):'Player '+targetUid.slice(-4),
    bio:'',hobbies:'',avatar:'🦊',
    frame:'none',banner:'bn-aurora',textStyle:'',msgStyle:'',
    tags:[isGuest?'Guest Pass':'Newbie'],
    accountType:isGuest?'guest':'account',accountId:'',
    coins:50,exp:0,dailyCoinsByDay:{},claimedByDay:{},friends:[],tempUnlocks:{},done:{},bioStyle:'',
    unreadFrom:{},activeDays:[today()],referredBy:'',referralRewardClaimed:false,
    lastLoginBonusDay:'',poemReqDay:'',usageSec:0,banned:false,resetAt:0,lastRewardedLevel:1
  };
}

const FREE_TAGS=['Guest Pass','Newbie'];
const REF_PARAM=(new URLSearchParams(location.search).get('ref')||'').toUpperCase();

function sanitizeDailyMap(rawMap){
  const out={};
  if(rawMap&&typeof rawMap==='object'&&!Array.isArray(rawMap)){
    Object.keys(rawMap).sort().slice(-7).forEach(k=>{
      out[k]=clampSafeInt(rawMap[k],0,MAX_DAILY_PTS);
    });
  }
  return out;
}

function normalizeProfile(p,targetUid){
  const isGuest=targetUid===guestUid && (!p || p.accountType!=='account');
  const o={...freshDefaultProfile(targetUid,isGuest),...JSON.parse(JSON.stringify(p||{})),uid:targetUid};
  ['dailyCoinsByDay','claimedByDay','tempUnlocks','unreadFrom','done'].forEach(k=>{if(!o[k]||typeof o[k]!=='object'||Array.isArray(o[k]))o[k]={}});
  o.friends=Array.isArray(o.friends)?o.friends:[];
  o.activeDays=Array.isArray(o.activeDays)?o.activeDays:[];
  if(!o.activeDays.includes(today()))o.activeDays.push(today());
  o.activeDays=o.activeDays.slice(-60);
  o.dailyCoinsByDay=sanitizeDailyMap(o.dailyCoinsByDay);
  o.coins=clampCoins(o.coins);
  o.exp=clampExp(o.exp);
  o.streakDays=calcStreak(o.activeDays);
  o.resetAt=Number(o.resetAt||0);
  o.lastRewardedLevel=Math.max(1,clampSafeInt(o.lastRewardedLevel||calcLevel(o.exp),1,MAX_LEVEL));

  const live=k=>Number(o.tempUnlocks[k]||0)>Date.now();
  const isFreeAvatar=a=>(typeof FX_FREE_AVATARS!=='undefined'?FX_FREE_AVATARS:USER_AVATARS).includes(a);

  if(isDevAccount(o)){
    /* Developer Profile Rules: do NOT force or pre-equip random/unpurchased cosmetics!
       Keep Developer profile clean and controllable, only keeping items owned/free. */
    if(!o.avatar || (!isFreeAvatar(o.avatar) && !live('avatar:'+o.avatar)))o.avatar='🦊';
    if(o.frame && o.frame!=='none' && !live('frame:'+o.frame))o.frame='none';
    if(o.banner && o.banner!=='bn-aurora' && !live('banner:'+o.banner))o.banner='bn-aurora';
    if(o.textStyle && !live('text:'+o.textStyle))o.textStyle='';
    if(o.msgStyle && !live('msg:'+o.msgStyle))o.msgStyle='';
    if(o.bioStyle && !live('bio:'+o.bioStyle))o.bioStyle='';
    const validDevTags=(Array.isArray(o.tags)?o.tags:[]).filter(t=>t==='Developer'||t==='LVL 99'||FREE_TAGS.includes(t)||live('tag:'+t));
    o.tags=validDevTags.length?validDevTags.slice(0,3):['Developer','LVL 99'];
  }else{
    if(!o.avatar || (!isFreeAvatar(o.avatar) && !live('avatar:'+o.avatar)))o.avatar='🦊';
    if(o.frame==='dev'||(o.frame&&o.frame!=='none'&&!live('frame:'+o.frame)))o.frame='none';
    if(o.banner==='bn-dev'||(o.banner!=='bn-aurora'&&!live('banner:'+o.banner)))o.banner='bn-aurora';
    if(o.textStyle&&!live('text:'+o.textStyle))o.textStyle='';
    if(o.msgStyle&&!live('msg:'+o.msgStyle))o.msgStyle='';
    if(o.bioStyle&&!live('bio:'+o.bioStyle))o.bioStyle='';
    o.tags=(Array.isArray(o.tags)?o.tags:[]).filter(t=>t!=='Developer'&&t!=='LVL 99'&&(FREE_TAGS.includes(t)||live('tag:'+t))).slice(0,3);
    if(!o.tags.length)o.tags=[o.accountType==='account'?'Newbie':'Guest Pass'];
  }
  return o;
}

function calcStreak(days){const set=new Set(days||[]);let n=0;const d=new Date();while(set.has(d.toISOString().slice(0,10))){n++;d.setUTCDate(d.getUTCDate()-1)}return n}
let me=normalizeProfile(ls.get('sg_profile_'+uid,null),uid);
const saveMe=()=>ls.set('sg_profile_'+uid,me);

function getUserTodayPts(u){
  if(!u)return 0;
  const map=(u.uid===uid?me:u).dailyCoinsByDay;
  return map&&typeof map==='object'?clampSafeInt(map[today()]||0,0,MAX_DAILY_PTS):0;
}

let devMode=isDevAccount(me) && me.accountType==='account' && String(me.accountId||'').toLowerCase()===DEV_LOGIN_ID;
function refreshDevMode(){
  devMode=Boolean(me && me.accountType==='account' && String(me.accountId||'').trim().toLowerCase()===DEV_LOGIN_ID);
  return devMode;
}
function needLogin(what){if(devMode||me.accountType==='account')return false;toast('Register / Login to use '+what);return true}

function sanitizeUserAppearance(u){
  const copy={...(u||{})};
  copy._hasCoins=typeof copy.coins==='number';
  copy.coins=clampCoins(copy.coins);
  copy.exp=clampExp(copy.exp);
  if(!isDevAccount(copy)){
    if(copy.frame==='dev')copy.frame='none';
    if(copy.banner==='bn-dev')copy.banner='bn-aurora';
  }
  return copy;
}

function isUnlocked(key){
  if(['frame:none','banner:bn-aurora','text:','msg:','bio:'].includes(key))return true;
  if(key.startsWith('avatar:')){
    const em=key.slice(7);
    if((typeof FX_FREE_AVATARS!=='undefined'?FX_FREE_AVATARS:USER_AVATARS).includes(em))return true;
  }
  if(key.startsWith('tag:')){
    const tg=key.slice(4);
    if(FREE_TAGS.includes(tg))return true;
    if(devMode && (tg==='Developer'||tg==='LVL 99'))return true;
  }
  return Number(me.tempUnlocks[key]||0)>Date.now();
}

function cleanExpiredUnlocks(){
  let ch=false;
  const now=Date.now();
  for(const [k,exp] of Object.entries(me.tempUnlocks||{})){
    if(Number(exp)<=now){
      delete me.tempUnlocks[k];
      if(me.avatar&&k==='avatar:'+me.avatar)me.avatar='🦊';
      if(me.frame&&k==='frame:'+me.frame)me.frame='none';
      if(me.textStyle&&k==='text:'+me.textStyle)me.textStyle='';
      if(me.msgStyle&&k==='msg:'+me.msgStyle)me.msgStyle='';
      if(me.bioStyle&&k==='bio:'+me.bioStyle)me.bioStyle='';
      if(me.banner&&k==='banner:'+me.banner)me.banner='bn-aurora';
      if(k.startsWith('tag:')){
        me.tags=(me.tags||[]).filter(x=>x!==k.slice(4));
        if(!me.tags.length)me.tags=devMode?['Developer','LVL 99']:[me.accountType==='account'?'Newbie':'Guest Pass'];
      }
      ch=true;
    }
  }
  if(!devMode&&me.frame==='dev'){me.frame='none';ch=true}
  if(!devMode&&me.banner==='bn-dev'){me.banner='bn-aurora';ch=true}
  if(ch)saveMe();
}

let stats=ls.get('sg_stats_'+uid,{calc_open:0,pdf_open:0,tool_open:0,profile_save:0,games_played:0,store_buy:0,ad_watch:0});
const saveStats=()=>ls.set('sg_stats_'+uid,stats);
function bumpStat(k){stats[k]=(stats[k]||0)+1;saveStats();if(typeof renderTasks==='function')renderTasks()}

let users=ls.get('sg_users_cache',[]);
let devInbox=ls.get('sg_dev_inbox',{});
let worldMsgs=ls.get('sg_world_msgs',[]);
let poems=ls.get('sg_poems_cache',[]);
let poemRequests=ls.get('sg_poem_requests_cache',[]);
let customGameSlots=ls.get('sg_game_slots',[]);

const FX_L=typeof FX_USER_LISTS!=='undefined'?FX_USER_LISTS:{};
const USER_FRAMES=[['none','Plain'],['flame','Fire Ring'],['wings','Royal Wings'],['crown','Crown'],['star','Starlight'],['neon','Neon'],['ice','Frost'],['rainbow','Rainbow'],...(FX_L.frame||[])];
const BANNERS=[['bn-aurora','Aurora'],['bn-crimson','Crimson'],['bn-galaxy','Galaxy'],['bn-solar','Solar'],['bn-emerald','Emerald'],['bn-midnight','Midnight'],['bn-rose','Rose'],['bn-ocean','Ocean'],['bn-sunrise','Sunrise'],['bn-candy','Candy'],...(FX_L.banner||[])];
const TEXTS=[['','Normal'],['anim-firetxt','Fire'],['anim-royal-txt','Royal'],['anim-neon-txt','Neon'],['anim-gold-txt','Gold'],['anim-ice-txt','Ice'],['anim-berry-txt','Berry'],['anim-mint-txt','Mint'],['anim-sunset-txt','Sunset'],['anim-lava-txt','Lava'],['anim-aqua-txt','Aqua'],...(FX_L.text||[])];
const MSGS=[['','Normal Msg'],['msg-glow-gold','Gold'],['msg-glow-cyan','Cyan'],['msg-glow-rose','Rose'],['msg-glow-violet','Violet'],['msg-glow-green','Green'],['msg-glow-orange','Orange'],...(FX_L.msg||[])];
const BIOS=[['','Normal'],['bio-gold','Gold'],['bio-cyan','Cyan'],['bio-pink','Pink'],['bio-rainbow','Rainbow']];
const USER_AVATARS=['🦊','🐼','🐯','🦉','🐙','🚀','🧠','🎮','⚡','🔥','🌟','🐲'];

function frameSvgBase(fr){
  if(fr==='dev')return `<svg class="ring-svg spin-cw" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#ffd36b" stroke-width="3.8" stroke-dasharray="16 6"/><polygon points="34,11 42,2 50,10 58,2 66,11 61,18 39,18" fill="#ff4d6a" stroke="#ffd36b" stroke-width="1.4"/></svg><span class="f-top-tag">DEV 99</span>`;
  if(fr==='flame')return `<svg class="ring-svg spin-cw" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#ff6a1a" stroke-width="3.4" stroke-dasharray="14 8"/></svg><span class="f-top-tag" style="background:#ff5500;color:#fff">FIRE</span>`;
  if(fr==='wings')return `<svg class="ring-svg pulse-fx" viewBox="0 0 100 100"><path d="M16 52 C2 35, 5 18, 22 25 C14 35, 16 44, 22 48" fill="#ffd54f"/><path d="M84 52 C98 35, 95 18, 78 25 C86 35, 84 44, 78 48" fill="#ffd54f"/><circle cx="50" cy="50" r="45" fill="none" stroke="#a88bff" stroke-width="2.6" stroke-dasharray="9 6"/></svg>`;
  if(fr==='crown')return `<svg class="ring-svg spin-cw" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#ffd36b" stroke-width="3.4"/><polygon points="36,12 43,4 50,11 57,4 64,12 60,18 40,18" fill="#ffd36b" stroke="#78350f" stroke-width="1.2"/></svg>`;
  if(fr==='star')return `<svg class="ring-svg spin-cw" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#f472b6" stroke-width="3" stroke-dasharray="3 9"/></svg>`;
  return '';
}
function frameSvg(fr){
  if(fr==='neon')return `<svg class="ring-svg pulse-fx" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#2dd4bf" stroke-width="3.6" style="filter:drop-shadow(0 0 4px #2dd4bf)"/><circle cx="50" cy="50" r="42" fill="none" stroke="#e879f9" stroke-width="1.6" stroke-dasharray="6 5"/></svg>`;
  if(fr==='ice')return `<svg class="ring-svg spin-cw" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#66d9e8" stroke-width="3.4" stroke-dasharray="10 6"/><circle cx="50" cy="50" r="41" fill="none" stroke="#e3fafc" stroke-width="1.4" stroke-dasharray="2 8"/></svg>`;
  if(fr==='rainbow')return `<svg class="ring-svg spin-cw" viewBox="0 0 100 100" fill="none" stroke-width="3.6"><circle cx="50" cy="50" r="45" stroke="#ff4d6a" stroke-dasharray="70.7 212"/><circle cx="50" cy="50" r="45" stroke="#ffd43b" stroke-dasharray="70.7 212" stroke-dashoffset="-70.7"/><circle cx="50" cy="50" r="45" stroke="#2dd4bf" stroke-dasharray="70.7 212" stroke-dashoffset="-141.4"/><circle cx="50" cy="50" r="45" stroke="#a855f7" stroke-dasharray="70.7 212" stroke-dashoffset="-212.1"/></svg>`;
  return frameSvgBase(fr);
}
const av=(rawU,s=44)=>{
  const u=sanitizeUserAppearance(rawU||{});
  const fr=u.frame||'none';
  const useFx=typeof fxFrameHtml==='function'&&typeof isFxFrame==='function'&&isFxFrame(fr);
  const ringMarkup=useFx?fxFrameHtml(fr,s):frameSvg(fr);
  const glyph=typeof renderAvatarGlyph==='function'?renderAvatarGlyph(u.avatar||'🦊'):`<span>${esc(u.avatar||'🦊')}</span>`;
  return `<div class="av-wrap ${fr==='fx_top1'?'top1-glow-wrap':''}" style="--s:${s}px">${ringMarkup}<div class="av">${glyph}</div></div>`;
};
const styledName=(u)=>`<span class="${esc((u&&u.textStyle)||'')}">${esc((u&&u.name)||'Player')}</span>`;

let F=null,db=null,online=false;
const inFlightOps=new Set();
function setStatus(ok){online=ok;const s=$('#st');if(!s)return;s.classList.toggle('on',ok);const em=$('em',s);if(em)em.textContent=ok?'Live':'Local mode'}
const userRef=id=>F.doc(db,'users',id);
function dbOp(fn, onErr){
  if(!online||!db)return Promise.resolve(false);
  try{
    return Promise.resolve(fn()).then(()=>true).catch(err=>{
      console.warn('Firestore op failed:',err?.code||err?.message||err);
      if(typeof onErr==='function')onErr(err);
      return false;
    });
  }catch(err){
    if(typeof onErr==='function')onErr(err);
    return Promise.resolve(false);
  }
}

const base=()=>({
  uid,name:me.name,bio:me.bio,hobbies:me.hobbies,avatar:me.avatar,frame:me.frame,banner:me.banner,
  textStyle:me.textStyle,msgStyle:me.msgStyle,bioStyle:me.bioStyle||'',
  streakDays:calcStreak(me.activeDays),activeDays:me.activeDays,tags:me.tags,
  accountType:me.accountType,accountId:me.accountId,exp:clampExp(me.exp),
  dailyCoinsByDay:sanitizeDailyMap(me.dailyCoinsByDay),claimedByDay:me.claimedByDay,
  friends:me.friends,tempUnlocks:me.tempUnlocks,resetAt:Number(me.resetAt||0),lastSeen:Date.now()
});

function patchUser(id,obj){let u=users.find(x=>x.uid===id);if(!u){u={uid:id};users.push(u)}Object.assign(u,obj);ls.set('sg_users_cache',users)}
function checkBan(){$('#banBox').hidden=!me.banned;$('#banUid').textContent=uid}
function getClaimedToday(){return me.claimedByDay[today()]||[]}
function updateHud(){
  $$('.coinval').forEach(e=>e.textContent=fmtNum(me.coins));
  $$('.lvlval').forEach(e=>e.textContent=fmtNum(calcLevel(me.exp),MAX_LEVEL));
}

function checkDailyLoginBonus(){
  const d=today();
  if(me.lastLoginBonusDay===d)return;
  me.lastLoginBonusDay=d;saveMe();
  addReward(15,10,null,false,{skipLevelUp:false});toast('Daily login bonus: +15 coins!');
}

/* Random Level-Up Reward Roller & Celebratory Modal */
function rollLevelUpReward(newLevel){
  const r=Math.random();
  if(r<0.34){
    const bonus=Math.min(120,25+(newLevel%6)*10);
    return {kind:'coins',label:`+${bonus} Bonus Coins`,amount:bonus};
  }
  if(r<0.52){
    const pool=[['fx_silver','Silver Chrome Frame'],['fx_emerald','Emerald Pulse Frame'],['fx_aurora','Aurora Flow Frame'],['fx_galaxy','Galaxy Orbit Frame'],['fx_rose','Rose Quartz Frame']];
    const p=pool[Math.floor(Math.random()*pool.length)];
    return {kind:'frame',value:p[0],label:`${p[1]} (1D)`,days:1};
  }
  if(r<0.70){
    const pool=[['bn-fx-aurora','Aurora Flow Banner'],['bn-fx-galaxy','Galaxy Banner'],['bn-fx-frost','Frost Banner'],['bn-fx-ocean','Ocean Banner']];
    const p=pool[Math.floor(Math.random()*pool.length)];
    return {kind:'banner',value:p[0],label:`${p[1]} (1D)`,days:1};
  }
  if(r<0.86){
    const pool=['Neon Scholar','Blaze Ace','Aurora Prodigy','Royal Mentor','Emerald Brain'];
    const tg=pool[Math.floor(Math.random()*pool.length)];
    return {kind:'tag',value:tg,label:`"${tg}" Glow Tag (1D)`,days:1};
  }
  const expBonus=25+(newLevel%3)*10;
  return {kind:'exp',label:`+${expBonus} Bonus EXP`,amount:expBonus};
}

function showLevelUpModal(prevLevel,newLevel,rw){
  let previewHtml='';
  if(rw.kind==='coins')previewHtml=`<div class="chip" style="font-size:15px;padding:6px 14px">${UI_SVG.coin} +${fmtNum(rw.amount)} Coins</div>`;
  else if(rw.kind==='exp')previewHtml=`<div class="exp-chip" style="font-size:14px;padding:6px 14px">+${fmtNum(rw.amount)} Bonus EXP</div>`;
  else if(rw.kind==='frame')previewHtml=av({avatar:me.avatar,frame:rw.value},64);
  else if(rw.kind==='banner')previewHtml=`<div class="bn-box ${esc(rw.value)}" style="width:100%;padding:12px;font-weight:800;font-size:13px">${esc(rw.label)}</div>`;
  else if(rw.kind==='tag')previewHtml=`<span class="p-tag ${tagClassFor(rw.value)}" style="font-size:13px;padding:6px 14px">${esc(rw.value)}</span>`;

  const canEquip=['frame','banner','tag'].includes(rw.kind);
  const m=modal('Level Up!',`
    <div class="lvlup-emblem">${UI_SVG.trophy}</div>
    <div class="lvlup-title">LEVEL ${fmtNum(newLevel,MAX_LEVEL)} REACHED!</div>
    <div class="lvlup-sub">Leveled up from LVL ${fmtNum(prevLevel,MAX_LEVEL)} → LVL ${fmtNum(newLevel,MAX_LEVEL)}</div>
    <div class="lvlup-reward-box">
      <small style="text-transform:uppercase;letter-spacing:.08em;font-weight:800;color:var(--gold)">Random Level Reward Unlocked</small>
      ${previewHtml}
      <b>${esc(rw.label)}</b>
    </div>
    ${canEquip?`<button class="btn gold full" id="luEquip">Equip Reward Now</button>`:''}
    <button class="btn ${canEquip?'ghost':''} full" id="luOk">Awesome!</button>
  `,'lvlup-sheet');

  if($('#luEquip',m)){
    $('#luEquip',m).onclick=()=>{
      if(rw.kind==='frame')me.frame=rw.value;
      else if(rw.kind==='banner')me.banner=rw.value;
      else if(rw.kind==='tag'){
        me.tags=[...me.tags.filter(x=>x!==rw.value&&!FREE_TAGS.includes(x)),rw.value].slice(-3);
      }
      me=normalizeProfile(me,uid);saveMe();
      patchUser(uid,base());dbOp(()=>F.setDoc(userRef(uid),base(),{merge:true}));
      if(typeof buildProfile==='function')buildProfile();
      renderAll();m.close();toast('Equipped '+rw.label);
    };
  }
  $('#luOk',m).onclick=()=>m.close();
}

function triggerLevelUp(prevLevel,newLevel){
  me.lastRewardedLevel=newLevel;
  const rw=rollLevelUpReward(newLevel);
  if(rw.kind==='coins'){
    me.coins=clampCoins(me.coins+rw.amount);
  }else if(rw.kind==='exp'){
    me.exp=clampExp(me.exp+rw.amount);
    me.lastRewardedLevel=Math.max(newLevel,calcLevel(me.exp));
  }else if(rw.value){
    const key=`${rw.kind}:${rw.value}`;
    me.tempUnlocks[key]=Math.max(Date.now(),Number(me.tempUnlocks[key]||0))+(rw.days||1)*86400000;
  }
  saveMe();patchUser(uid,{...base(),coins:me.coins,exp:me.exp,tempUnlocks:me.tempUnlocks});
  dbOp(()=>F.setDoc(userRef(uid),{...base(),coins:me.coins,exp:me.exp,tempUnlocks:me.tempUnlocks},{merge:true}));
  updateHud();
  if(typeof buildProfile==='function')buildProfile();
  showLevelUpModal(prevLevel,newLevel,rw);
}

function addReward(coinsDelta, expDelta, taskId, noLb, opts){
  if(me.banned)return;
  const prevLevel=calcLevel(me.exp);
  const cDelta=Number(coinsDelta||0), eDelta=Number(expDelta||0);
  me.coins=clampCoins(Number(me.coins||0)+cDelta);
  me.exp=clampExp(Number(me.exp||0)+eDelta);
  const d=today();
  if(cDelta>0&&!noLb){
    me.dailyCoinsByDay[d]=clampSafeInt(Number(me.dailyCoinsByDay[d]||0)+cDelta,0,MAX_DAILY_PTS);
  }
  if(taskId){
    me.claimedByDay[d]=me.claimedByDay[d]||[];
    if(!me.claimedByDay[d].includes(taskId))me.claimedByDay[d].push(taskId);
  }
  const newLevel=calcLevel(me.exp);
  saveMe();patchUser(uid,{...base(),coins:me.coins,exp:me.exp});updateHud();
  if(typeof renderRanking==='function')renderRanking();
  dbOp(()=>F.setDoc(userRef(uid),{...base(),coins:me.coins,exp:me.exp,dailyCoinsByDay:me.dailyCoinsByDay,claimedByDay:me.claimedByDay},{merge:true}));

  if(!(opts&&opts.skipLevelUp) && eDelta>0 && newLevel>prevLevel && newLevel>Number(me.lastRewardedLevel||1)){
    setTimeout(()=>triggerLevelUp(prevLevel,newLevel),180);
  }
}

/* Developer-only Reset Coins & EXP to 0 (also cleans today's leaderboard points) */
function devResetUserProgress(targetUid){
  if(!devMode)return toast('Developer only');
  const d=today();
  const ts=Date.now();
  const cleanDaily={[d]:0};
  if(targetUid===uid){
    me.coins=0;me.exp=0;me.dailyCoinsByDay=cleanDaily;me.resetAt=ts;me.lastRewardedLevel=1;
    saveMe();updateHud();
    if(typeof buildProfile==='function')buildProfile();
  }
  patchUser(targetUid,{coins:0,exp:0,dailyCoinsByDay:cleanDaily,resetAt:ts});
  dbOp(()=>F.setDoc(userRef(targetUid),{coins:0,exp:0,dailyCoinsByDay:cleanDaily,resetAt:ts},{merge:true}),()=>toast('Sync failed — check Firestore rules'));
  renderAll();
  toast('Coins, EXP & Today points reset to 0');
}

function devAdjustUserCoins(targetUid, delta){
  if(!devMode)return toast('Developer only');
  const n=clampSafeInt(delta,-MAX_COINS,MAX_COINS);
  if(!n)return toast('Enter a valid non-zero amount');
  const existing=allUsers().find(x=>x.uid===targetUid)||{coins:0};
  const nc=clampCoins(Number(existing.coins||0)+n);
  if(targetUid===uid){
    me.coins=nc;saveMe();updateHud();
    if(typeof buildProfile==='function')buildProfile();
  }
  patchUser(targetUid,{coins:nc});
  dbOp(()=>F.setDoc(userRef(targetUid),{coins:nc},{merge:true}),()=>toast('Sync failed — check Firestore rules'));
  renderAll();
  toast('Coins '+(n>0?'+':'')+fmtNum(n)+' (Now: '+fmtNum(nc)+')');
}

function getInviteCode(){return me.accountType==='account'?'REF_'+uid.replace(/[^A-Z0-9]/gi,'').slice(-8).toUpperCase():''}
function shareInvite(){
  const code=getInviteCode();if(!code)return toast('Login first for invite code');
  const link=location.href.split('#')[0].split('?')[0]+'?ref='+code;
  if(navigator.share)navigator.share({title:'Study Game',text:`Join with code ${code}: ${link}`,url:link}).catch(()=>{});
  else navigator.clipboard?.writeText(link).then(()=>toast('Invite link copied'),()=>toast(link));
}

function syncDevInboxToCloud(tid,obj){ls.set('sg_dev_inbox',devInbox);dbOp(()=>F.setDoc(F.doc(db,'dev_inbox',tid),obj,{merge:true}))}
function cleanupInactiveZeroFriendUsers(docList){
  if(!online||!db||!devMode)return;const now=Date.now();
  docList.forEach(d=>{if(isDevAccount(d)||d.uid===uid||d.accountType==='account')return;const fc=Array.isArray(d.friends)?d.friends.length:0,lsT=Number(d.lastSeen||d.createdAt||now);if(fc===0&&(now-lsT)>=TEN_DAYS_MS)dbOp(()=>F.deleteDoc(F.doc(db,'users',d.uid)))});
}

function modal(title,html,cls=''){
  const b=document.createElement('div');b.className='mb';
  b.innerHTML=`<div class="sheet ${cls}"><div class="sh"><h3>${title}</h3><button class="x" aria-label="Close">✕</button></div><div class="sb">${html}</div></div>`;
  $('#modals').appendChild(b);b.close=()=>{b.remove();b.onclose&&b.onclose()};$('.x',b).onclick=b.close;b.addEventListener('click',e=>{if(e.target===b)b.close()});return b;
}

function openRewardAd(onDone){
  const m=modal('Reward Ad',`<div class="ad"><div class="adbox">Reward Ad</div><p id="adt">Ad ends in 15s</p><button class="btn ghost full" id="adskip" disabled>Skip in 5s</button></div>`);
  let t=15;const iv=setInterval(()=>{t--;$('#adt',m).textContent=t>0?`Ad ends in ${t}s`:'Done';const sk=$('#adskip',m);if(15-t>=5){sk.disabled=false;sk.textContent='Claim'}else sk.textContent=`Skip in ${5-(15-t)}s`;if(t<=0){clearInterval(iv);bumpStat('ad_watch');m.close();onDone&&onDone()}},1000);
  $('#adskip',m).onclick=()=>{if($('#adskip',m).disabled)return;clearInterval(iv);bumpStat('ad_watch');m.close();onDone&&onDone()};
  m.onclose=()=>clearInterval(iv);
}

function allUsers(){const m=new Map(users.map(u=>[u.uid,sanitizeUserAppearance(u)]));m.set(uid,{...(m.get(uid)||{}),...sanitizeUserAppearance(me)});return [...m.values()]}
function rankableUsers(){return allUsers().filter(u=>!isDevAccount(u)).map(u=>({...u,todayPts:getUserTodayPts(u)})).sort((a,b)=>b.todayPts-a.todayPts||(b.coins||0)-(a.coins||0))}
function isFriend(id){return me.friends.includes(id)}
function toggleFriend(targetUid){
  if(!targetUid||targetUid===uid)return;
  if(isFriend(targetUid)){me.friends=me.friends.filter(x=>x!==targetUid);toast('Removed friend')}
  else{me.friends.push(targetUid);toast('Friend added')}
  saveMe();patchUser(uid,{friends:me.friends});dbOp(()=>F.setDoc(userRef(uid),{friends:me.friends},{merge:true}));
  if(typeof renderChats==='function')renderChats();
}

function openPublicProfile(targetUid){
  if(targetUid==='developer'||targetUid===DEV_UID){
    const realDev=allUsers().find(x=>isDevAccount(x))||{uid:DEV_UID,name:'Developer',avatar:'🦊',frame:'none',banner:'bn-aurora',tags:['Developer','LVL 99']};
    const m=modal('Developer Profile',`<div class="bn-box ${esc(realDev.banner||'bn-aurora')}"><div class="pf">${av(realDev,74)}<b>${styledName(realDev)}</b>${renderTags(['Developer','LVL 99'],realDev)}</div></div><button class="btn full" id="pmDev">Message Developer</button>`);
    $('#pmDev',m).onclick=()=>{m.close();openThread('developer')};
    return;
  }
  const u=allUsers().find(x=>x.uid===targetUid);if(!u)return toast('Player not found');
  const self=u.uid===uid, fr=isFriend(u.uid);
  const m=modal('Player Profile',`
    <div class="bn-box ${esc(u.banner||'bn-aurora')}">
      <div class="pf">${av(u,74)}<b style="font-size:18px">${styledName(u)}</b><small>LVL ${fmtNum(calcLevel(u.exp),MAX_LEVEL)} · UID: ${esc(u.uid)}</small></div>
      <div style="text-align:center;margin-top:6px"><span class="chip">${UI_SVG.coin} ${fmtNum(u.coins)}</span> · <span class="exp-chip">Today: ${fmtNum(getUserTodayPts(u))}</span></div>
      ${renderTags(u.tags,u)}
    </div>
    <div class="card" style="margin-top:10px;font-size:13px"><div><b>Bio:</b> <span class="${esc(u.bioStyle||'')}">${esc(u.bio||'—')}</span></div>${u.streakDays?`<div style="margin-top:4px">🔥 ${u.streakDays} ${tr('streak')}</div>`:''}<div style="margin-top:4px"><b>Hobbies:</b> ${esc(u.hobbies||'—')}</div></div>
    ${!self?`<div class="row" style="margin-top:10px"><button class="btn ${fr?'ghost':''}" id="pfAdd" style="flex:1">${fr?'Friends ✓':'Add Friend'}</button><button class="btn" id="pfMsg" style="flex:1">Message</button></div>`:''}
  `);
  if(devMode&&!self){
    $('.sb',m).insertAdjacentHTML('beforeend',`<div class="card pf-dev-wallet"><b style="color:var(--gold)">Developer Tools</b><div class="row" style="margin-top:8px"><input id="dvCoin" type="number" placeholder="± coins" style="flex:1"><button class="btn sm gold" id="dvAdj">Apply</button></div><button class="btn ghost full" id="dvResetZero" style="margin-top:8px">${UI_SVG.reset} Reset Coins / EXP to 0</button><button class="btn ${u.banned?'ok':'red'} full" id="dvBan" style="margin-top:8px">${u.banned?'Unban':'Ban'} user</button></div>`);
    $('#dvAdj',m).onclick=()=>{
      const n=Math.trunc(+$('#dvCoin',m).value);if(!n)return toast('Enter coin amount');
      devAdjustUserCoins(u.uid,n);m.close();openPublicProfile(u.uid);
    };
    $('#dvResetZero',m).onclick=()=>{
      devResetUserProgress(u.uid);m.close();openPublicProfile(u.uid);
    };
    $('#dvBan',m).onclick=()=>{
      const b=!u.banned;
      patchUser(u.uid,{banned:b});
      dbOp(()=>F.setDoc(userRef(u.uid),{banned:b},{merge:true}));
      toast(b?'User banned':'User unbanned');m.close();openPublicProfile(u.uid);
    };
  }
  if($('#pfAdd',m))$('#pfAdd',m).onclick=()=>{toggleFriend(u.uid);m.close();openPublicProfile(u.uid)};
  if($('#pfMsg',m))$('#pfMsg',m).onclick=()=>{
    if(!chats[u.uid])chats[u.uid]={id:u.uid,name:u.name||'Player',uid:u.uid,messages:[]};
    saveChats();m.close();showTab('chat');openThread(u.uid);
  };
}

function showTab(tab){
  $$('#nav button').forEach(x=>x.classList.toggle('on',x.dataset.tab===tab));
  $$('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+tab));
  $('main').scrollTop=0;
}
$('#nav').onclick=e=>{const b=e.target.closest('[data-tab]');if(b)showTab(b.dataset.tab)};
function renderAll(){
  if(typeof renderGameSlots==='function')renderGameSlots();
  if(typeof renderRanking==='function')renderRanking();
  if(typeof renderTasks==='function')renderTasks();
  if(typeof renderStore==='function')renderStore();
  if(typeof renderPoems==='function')renderPoems();
  if(typeof renderChats==='function'&&!cur)renderChats();
}
