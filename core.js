"use strict";
const DEV_LOGIN_ID = "soumitranext1@gmail.com";
const DEV_OWNER_EMAILS = ["soumitranext1@gmail.com", "soumitranext@gmail.com"];
const DAILY_FREE_COIN_CAP = 120;
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
  'Night Owl':'tag-fx-prism','Early Bird':'tag-fx-emerald','Study Boy':'tag-fx-classic','Study Girl':'tag-fx-classic',
  'Tycoon Crown':'tag-fx-tycoon','Soulmate':'tag-fx-couple','Partner in Crime':'tag-fx-couple'
};

function tagClassFor(tagName){
  const raw=String(tagName||'').trim();
  const low=raw.toLowerCase();
  if(low==='developer'||low==='dev')return 'p-tag-dev-sig';
  if(low==='lvl 99')return 'p-tag-lvl99-sig';
  return TAG_STYLE_MAP[raw]||'tag-fx-classic';
}

function canWearExclusiveAsset(u, key){
  if(typeof isRankExclusiveKey!=='function'||!isRankExclusiveKey(key))return true;
  if(!u)return false;
  const now=Date.now();
  const grants=(u.devGrants&&typeof u.devGrants==='object')?u.devGrants:{};
  if(Number(grants[key]||0)>now)return true;
  if(u.accountType!=='account')return false;
  const tu=(u.tempUnlocks&&typeof u.tempUnlocks==='object')?u.tempUnlocks:{};
  const rv=(u.rankVerified&&typeof u.rankVerified==='object')?u.rankVerified:{};
  return Number(tu[key]||0)>now && Number(rv[key]||0)>now;
}

function getActiveRankBadge(u){
  if(!u)return null;
  for(const rk of [1,2,3]){
    if(canWearExclusiveAsset(u,'badge:lb_top'+rk) && typeof LB_EXCLUSIVE_ASSETS!=='undefined' && LB_EXCLUSIVE_ASSETS[rk]){
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
  const tm=document.querySelector('meta[name="theme-color"]');
  if(tm)tm.setAttribute('content',themeMode==='light'?'#eef3f9':'#131b2e');
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
en:{home:'Home',games:'Games',stories:'Stories',rank:'Rank',tasks:'Tasks',store:'Store',chat:'Chat',profile:'Profile',tools:'Student Tools',poems:'Poems & Writing Wall',req:'Request Poem',gamesH:'Games Hub',lb:'Daily Leaderboard',d5:'Daily 5 Tasks',storeH:'Store',msgs:'Messages',addf:'Add friend',yp:'Your Profile',streak:'day streak'},
hi:{home:'होम',games:'गेम्स',stories:'कहानी',rank:'रैंक',tasks:'टास्क',store:'स्टोर',chat:'चैट',profile:'प्रोफ़ाइल',tools:'स्टूडेंट टूल्स',poems:'कविता और लेखन दीवार',req:'कविता भेजें',gamesH:'गेम्स हब',lb:'दैनिक लीडरबोर्ड',d5:'आज के 5 टास्क',storeH:'स्टोर',msgs:'संदेश',addf:'दोस्त जोड़ें',yp:'आपकी प्रोफ़ाइल',streak:'दिन की स्ट्रीक'},
bn:{home:'হোম',games:'গেমস',stories:'গল্প',rank:'র‍্যাঙ্ক',tasks:'টাস্ক',store:'স্টোর',chat:'চ্যাট',profile:'প্রোফাইল',tools:'স্টুডেন্ট টুলস',poems:'কবিতা ও লেখার দেয়াল',req:'কবিতা পাঠান',gamesH:'গেমস হাব',lb:'দৈনিক লিডারবোর্ড',d5:'আজকের ৫টি টাস্ক',storeH:'স্টোর',msgs:'বার্তা',addf:'বন্ধু যোগ করুন',yp:'আপনার প্রোফাইল',streak:'দিনের স্ট্রিক'},
es:{home:'Inicio',games:'Juegos',stories:'Historias',rank:'Ranking',tasks:'Tareas',store:'Tienda',chat:'Chat',profile:'Perfil',tools:'Herramientas',poems:'Muro de poemas y textos',req:'Enviar poema',gamesH:'Centro de juegos',lb:'Clasificación diaria',d5:'5 tareas diarias',storeH:'Tienda',msgs:'Mensajes',addf:'Añadir amigo',yp:'Tu perfil',streak:'días seguidos'},
fr:{home:'Accueil',games:'Jeux',stories:'Histoires',rank:'Classement',tasks:'Tâches',store:'Boutique',chat:'Chat',profile:'Profil',tools:'Outils Étudiant',poems:'Mur de poèmes et textes',req:'Proposer un poème',gamesH:'Espace jeux',lb:'Classement du jour',d5:'5 tâches du jour',storeH:'Boutique',msgs:'Messages',addf:'Ajouter un ami',yp:'Votre profil',streak:'jours de suite'},
ta:{home:'முகப்பு',games:'விளையாட்டு',stories:'கதைகள்',rank:'தரவரிசை',tasks:'பணிகள்',store:'கடை',chat:'அரட்டை',profile:'சுயவிவரம்',tools:'மாணவர் கருவிகள்',poems:'கவிதை & எழுத்துச் சுவர்',req:'கவிதை அனுப்பு',gamesH:'விளையாட்டு மையம்',lb:'தினசரி தரவரிசை',d5:'தினசரி 5 பணிகள்',storeH:'கடை',msgs:'செய்திகள்',addf:'நண்பரைச் சேர்',yp:'உங்கள் சுயவிவரம்',streak:'நாள் தொடர்'},
te:{home:'హోమ్',games:'గేమ్స్',stories:'కథలు',rank:'ర్యాంక్',tasks:'టాస్క్‌లు',store:'స్టోర్',chat:'చాట్',profile:'ప్రొఫైల్',tools:'విద్యార్థి టూల్స్',poems:'కవితలు & రచనల గోడ',req:'కవిత పంపండి',gamesH:'గేమ్స్ హబ్',lb:'రోజువారీ లీడర్‌బోర్డ్',d5:'రోజువారీ 5 టాస్క్‌లు',storeH:'స్టోర్',msgs:'సందేశాలు',addf:'స్నేహితుని జోడించు',yp:'మీ ప్రొఫైల్',streak:'రోజుల స్ట్రీక్'}
};
const tr=k=>(I18N[langKey]&&I18N[langKey][k])||I18N.en[k]||k;
const NAV_KEYS={tools:'home',games:'games',stories:'stories',ranking:'rank',tasks:'tasks',store:'store',chat:'chat',profile:'profile'};
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
  const prov=String(u.authProvider||'');
  const provOk=!prov||prov==='google.com';
  const em=String(u.accountId||'').trim().toLowerCase();
  return u.accountType==='account' && provOk && DEV_OWNER_EMAILS.includes(em);
}

const REGION_OPTIONS=[
  {code:'India',flag:'🇮🇳'},{code:'USA',flag:'🇺🇸'},{code:'UK',flag:'🇬🇧'},
  {code:'UAE',flag:'🇦🇪'},{code:'Canada',flag:'🇨🇦'},{code:'Japan',flag:'🇯🇵'},
  {code:'Brazil',flag:'🇧🇷'},{code:'Global',flag:'🌐'}
];
function getRegionFlag(region){
  const r=REGION_OPTIONS.find(x=>x.code===region);
  return r?r.flag:'🇮🇳';
}
function copyTextClean(val,label){
  const s=String(val||'');
  if(!s)return;
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(s).then(()=>toast((label||'Copied')+': '+s)).catch(()=>toast(s));
  }else toast(s);
}

function freshDefaultProfile(targetUid, isGuest){
  return {
    uid:targetUid,
    name:isGuest?('Guest '+targetUid.slice(-4)):'Player '+targetUid.slice(-4),
    bio:'',hobbies:'',gender:'',birthday:'',region:'India',moodTag:'',avatar:'av_b1',
    frame:'none',banner:'bn-aurora',textStyle:'',msgStyle:'',entryEffect:'',title:'',unlockedTitles:[],
    tags:[isGuest?'Guest Pass':'Newbie'],
    accountType:isGuest?'guest':'account',accountId:'',authProvider:isGuest?'anonymous':'google.com',
    coins:250,exp:0,charm:0,charmSent:0,giftWallet:{},
    vipTier:'',vipUntil:0,
    likesCount:0,likedBy:[],visitors:[],
    bonds:[],pendingProposals:[],
    equippedRing:'',ownedRings:[],
    clanId:'',clanTag:'',
    warnings:[],mutedUntil:0,banReason:'',banUntil:0,
    streakClaimDay:'',streakDayIndex:0,dailyChestClaimedDay:'',
    spinFreeDay:'',spinTickets:0,activitySec:0,claimedChestsDay:{},
    dailyCoinsByDay:{},dailyFreeCoinsByDay:{},claimedByDay:{},friends:[],tempUnlocks:{},rankVerified:{},devGrants:{},done:{},bioStyle:'',
    unreadFrom:{},activeDays:[today()],referredBy:'',referralRewardClaimed:false,
    lastLoginBonusDay:'',poemReqDay:'',usageSec:0,banned:false,resetAt:0,devStatsUpdatedAt:0,giftResetAt:0,lastRewardedLevel:1,
    activity:{type:'online',label:'Online',updatedAt:Date.now()},lastSeen:Date.now()
  };
}

const FREE_TAGS=['Guest Pass','Newbie'];
const REF_PARAM=(new URLSearchParams(location.search).get('ref')||'').toUpperCase();
const FX_L=typeof FX_USER_LISTS!=='undefined'?FX_USER_LISTS:{};
const USER_FRAMES=[['none','Plain'],['flame','Fire Ring'],['wings','Royal Wings'],['crown','Crown'],['star','Starlight'],['neon','Neon'],['ice','Frost'],['rainbow','Rainbow'],...(FX_L.frame||[])];
const BANNERS=[['bn-aurora','Aurora'],['bn-crimson','Crimson'],['bn-galaxy','Galaxy'],['bn-solar','Solar'],['bn-emerald','Emerald'],['bn-midnight','Midnight'],['bn-rose','Rose'],['bn-ocean','Ocean'],['bn-sunrise','Sunrise'],['bn-candy','Candy'],...(FX_L.banner||[])];
const TEXTS=[['','Normal'],['anim-firetxt','Fire'],['anim-royal-txt','Royal'],['anim-neon-txt','Neon'],['anim-gold-txt','Gold'],['anim-ice-txt','Ice'],['anim-berry-txt','Berry'],['anim-mint-txt','Mint'],['anim-sunset-txt','Sunset'],['anim-lava-txt','Lava'],['anim-aqua-txt','Aqua'],...(FX_L.text||[])];
const MSGS=[['','Normal Msg'],['msg-glow-gold','Gold'],['msg-glow-cyan','Cyan'],['msg-glow-rose','Rose'],['msg-glow-violet','Violet'],['msg-glow-green','Green'],['msg-glow-orange','Orange'],...(FX_L.msg||[])];
const BIOS=[['','Normal'],['bio-gold','Gold'],['bio-cyan','Cyan'],['bio-pink','Pink'],['bio-rainbow','Rainbow']];
const USER_AVATARS=['🦊','🐼','🐯','🦉','🐙','🚀','🧠','🎮','⚡','🔥','🌟','🐲'];

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
  ['dailyCoinsByDay','dailyFreeCoinsByDay','claimedByDay','tempUnlocks','rankVerified','devGrants','unreadFrom','done','giftWallet','claimedChestsDay'].forEach(k=>{if(!o[k]||typeof o[k]!=='object'||Array.isArray(o[k]))o[k]={}});
  o.friends=Array.isArray(o.friends)?o.friends:[];
  o.activeDays=Array.isArray(o.activeDays)?o.activeDays:[];
  o.likedBy=Array.isArray(o.likedBy)?o.likedBy.slice(-200):[];
  o.visitors=Array.isArray(o.visitors)?o.visitors.slice(-20):[];
  o.bonds=Array.isArray(o.bonds)?o.bonds.slice(-10):[];
  o.pendingProposals=Array.isArray(o.pendingProposals)?o.pendingProposals.slice(-15):[];
  o.ownedRings=Array.isArray(o.ownedRings)?[...new Set(o.ownedRings.filter(Boolean))].slice(-64):[];
  o.equippedRing=typeof o.equippedRing==='string'?o.equippedRing:'';
  o.warnings=Array.isArray(o.warnings)?o.warnings.slice(-20):[];
  o.unlockedTitles=Array.isArray(o.unlockedTitles)?o.unlockedTitles:[];
  if(!o.activeDays.includes(today()))o.activeDays.push(today());
  o.activeDays=o.activeDays.slice(-60);
  o.dailyCoinsByDay=sanitizeDailyMap(o.dailyCoinsByDay);
  o.coins=clampCoins(o.coins);
  o.exp=clampExp(o.exp);
  o.charm=clampSafeInt(o.charm||0,0,MAX_COINS);
  o.charmSent=clampSafeInt(o.charmSent||0,0,MAX_COINS);
  o.likesCount=Math.max(o.likedBy.length,clampSafeInt(o.likesCount||0,0,MAX_COINS));
  o.vipUntil=Number(o.vipUntil||0);
  if(o.vipUntil<=Date.now())o.vipTier='';
  o.mutedUntil=Number(o.mutedUntil||0);
  o.banUntil=Number(o.banUntil||0);
  if(o.banned && o.banUntil>0 && o.banUntil<=Date.now()){
    o.banned=false;o.banUntil=0;o.banReason='';
  }
  o.spinTickets=clampSafeInt(o.spinTickets||0,0,9999);
  o.activitySec=clampSafeInt(o.activitySec||0,0,8640000);
  o.streakDays=calcStreak(o.activeDays);
  o.resetAt=Number(o.resetAt||0);
  o.devStatsUpdatedAt=Number(o.devStatsUpdatedAt||0);
  o.giftResetAt=Number(o.giftResetAt||0);
  o.lastRewardedLevel=Math.max(1,clampSafeInt(o.lastRewardedLevel||calcLevel(o.exp),1,MAX_LEVEL));
  o.lastSeen=Date.now();

  const live=k=>{
    if(typeof isRankExclusiveKey==='function'&&isRankExclusiveKey(k))return canWearExclusiveAsset(o,k);
    return Number(o.tempUnlocks[k]||0)>Date.now();
  };
  const isFreeAvatar=a=>{
    if(!a)return false;
    if(typeof isCustomPhotoAvatar==='function'&&isCustomPhotoAvatar(a))return true;
    if(String(a).startsWith('data:image/'))return true;
    const pool=typeof FX_FREE_AVATARS!=='undefined'?FX_FREE_AVATARS:USER_AVATARS;
    return pool.includes(a)||USER_AVATARS.includes(a);
  };

  /* Clean leaked unverified Top 1-3 tempUnlocks immediately */
  Object.keys(o.tempUnlocks).forEach(k=>{
    if(typeof isRankExclusiveKey==='function'&&isRankExclusiveKey(k)&&!canWearExclusiveAsset(o,k)){
      delete o.tempUnlocks[k];
    }
  });

  if(isDevAccount(o)){
    /* Developer Profile Rules: keep Developer profile clean and controllable, only keeping items owned/free. */
    if(!o.avatar || (!isFreeAvatar(o.avatar) && !live('avatar:'+o.avatar)))o.avatar='av_b1';
    if(o.frame && o.frame!=='none' && !live('frame:'+o.frame))o.frame='none';
    if(o.banner && o.banner!=='bn-aurora' && !live('banner:'+o.banner))o.banner='bn-aurora';
    if(o.textStyle && !live('text:'+o.textStyle))o.textStyle='';
    if(o.msgStyle && !live('msg:'+o.msgStyle))o.msgStyle='';
    if(o.bioStyle && !live('bio:'+o.bioStyle))o.bioStyle='';
    if(o.entryEffect && !live('entry:'+o.entryEffect))o.entryEffect='';
    const validDevTags=(Array.isArray(o.tags)?o.tags:[]).filter(t=>t==='Developer'||t==='LVL 99'||FREE_TAGS.includes(t)||live('tag:'+t));
    o.tags=validDevTags.length?validDevTags.slice(0,3):['Developer','LVL 99'];
  }else{
    if(!o.avatar || (!isFreeAvatar(o.avatar) && !live('avatar:'+o.avatar)))o.avatar='av_b1';
    if(o.frame==='dev'||(o.frame&&o.frame!=='none'&&!live('frame:'+o.frame)))o.frame='none';
    if(o.banner==='bn-dev'||(o.banner!=='bn-aurora'&&!live('banner:'+o.banner)))o.banner='bn-aurora';
    if(o.textStyle&&!live('text:'+o.textStyle))o.textStyle='';
    if(o.msgStyle&&!live('msg:'+o.msgStyle))o.msgStyle='';
    if(o.bioStyle&&!live('bio:'+o.bioStyle))o.bioStyle='';
    if(o.entryEffect&&!live('entry:'+o.entryEffect)&&!o.vipTier)o.entryEffect='';
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

let devMode=isDevAccount(me);
let usersHydrated=false;
function isDevSession(){
  if(devMode||isDevAccount(me))return true;
  try{
    if(typeof auth!=='undefined'&&auth&&auth.currentUser&&!auth.currentUser.isAnonymous){
      const em=String(auth.currentUser.email||'').trim().toLowerCase();
      if(DEV_OWNER_EMAILS.includes(em)){devMode=true;return true}
    }
  }catch{}
  return false;
}
function refreshDevMode(){
  devMode=isDevAccount(me)||isDevSession();
  return devMode;
}
function needLogin(what){if(isDevSession()||me.accountType==='account')return false;toast('Sign in with Google to use '+what);return true}

function sanitizeUserAppearance(u){
  const copy={...(u||{})};
  copy._hasCoins=typeof copy.coins==='number';
  copy.coins=clampCoins(copy.coins);
  copy.exp=clampExp(copy.exp);
  if(!isDevAccount(copy)){
    if(copy.frame==='dev')copy.frame='none';
    if(copy.banner==='bn-dev')copy.banner='bn-aurora';
  }
  /* Strictly block leaked Top 1-3 exclusive assets on any player without verified eligibility or dev grant */
  if(copy.frame && typeof isRankExclusiveKey==='function' && isRankExclusiveKey('frame:'+copy.frame) && !canWearExclusiveAsset(copy,'frame:'+copy.frame)){
    copy.frame='none';
  }
  if(copy.banner && typeof isRankExclusiveKey==='function' && isRankExclusiveKey('banner:'+copy.banner) && !canWearExclusiveAsset(copy,'banner:'+copy.banner)){
    copy.banner='bn-aurora';
  }
  if(copy.avatar && typeof isRankExclusiveKey==='function' && isRankExclusiveKey('avatar:'+copy.avatar) && !canWearExclusiveAsset(copy,'avatar:'+copy.avatar)){
    copy.avatar='🦊';
  }
  return copy;
}

function isUnlocked(key){
  if(['frame:none','banner:bn-aurora','text:','msg:','bio:','entry:'].includes(key))return true;
  if(typeof isRankExclusiveKey==='function'&&isRankExclusiveKey(key)){
    return canWearExclusiveAsset(me,key);
  }
  if(key.startsWith('avatar:')){
    const em=key.slice(7);
    if(typeof isCustomPhotoAvatar==='function'&&isCustomPhotoAvatar(em))return true;
    if(String(em).startsWith('data:image/'))return true;
    if((typeof FX_FREE_AVATARS!=='undefined'?FX_FREE_AVATARS:USER_AVATARS).includes(em))return true;
    if(USER_AVATARS.includes(em))return true;
  }
  if(key.startsWith('tag:')){
    const tg=key.slice(4);
    if(FREE_TAGS.includes(tg))return true;
    if(isDevSession() && (tg==='Developer'||tg==='LVL 99'))return true;
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
if(!Array.isArray(users)||!users.length){
  const td=today();
  const futureVip=Date.now()+86400000*14;
  users=[
    {uid:'bot_aria',name:'Aria Nova',accountType:'account',online:true,avatar:'av_g1',frame:'crown',banner:'bn-aurora',region:'India',gender:'female',bio:'Ludo Royal Queen & Voice Host',exp:1420,charm:3680,likesCount:48,vipTier:'gold',vipUntil:futureVip,clanTag:'NOVA',dailyCoinsByDay:{[td]:420},giftWallet:{g01_rose:24,g25_tiara:3},activity:{type:'playing',gameId:'ludo',gameName:'Ludo',roomCode:'LU4821',mode:'4p',updatedAt:Date.now()},lastSeen:Date.now()},
    {uid:'bot_leo',name:'Leo Blaze',accountType:'account',online:true,avatar:'av_b3',frame:'flame',banner:'bn-crimson',region:'USA',gender:'male',bio:'Jackaroo Captain & 8-Ball Shark',exp:1890,charm:5120,likesCount:62,vipTier:'royal',vipUntil:futureVip,clanTag:'APEX',dailyCoinsByDay:{[td]:510},giftWallet:{g01_rose:18,g40_falcon:2},activity:{type:'playing',gameId:'jackaroo',gameName:'Jackaroo',roomCode:'JK7290',mode:'2v2',updatedAt:Date.now()},lastSeen:Date.now()},
    {uid:'bot_zara',name:'Zara Star',accountType:'account',online:true,avatar:'av_g3',frame:'star',banner:'bn-galaxy',region:'Japan',gender:'female',bio:'UNO Garden & Trivia Speedrunner',exp:1160,charm:2450,likesCount:39,vipTier:'silver',vipUntil:futureVip,clanTag:'STAR',dailyCoinsByDay:{[td]:340},giftWallet:{g01_rose:12},activity:{type:'playing',gameId:'uno',gameName:'UNO',roomCode:'UN3154',mode:'classic',updatedAt:Date.now()},lastSeen:Date.now()},
    {uid:'bot_kai',name:'Kai Volt',accountType:'account',online:true,avatar:'av_b1',frame:'neon',banner:'bn-ocean',region:'UK',gender:'male',bio:'1v1 Stake Arena Grinder',exp:920,charm:1790,likesCount:29,vipTier:'',vipUntil:0,clanTag:'VOLT',dailyCoinsByDay:{[td]:260},giftWallet:{g01_rose:8},activity:{type:'online',label:'Online',updatedAt:Date.now()},lastSeen:Date.now()}
  ];
}
let devInbox=ls.get('sg_dev_inbox',{});
let worldMsgs=ls.get('sg_world_msgs',[]);
let poems=ls.get('sg_poems_cache',[]);
let poemRequests=ls.get('sg_poem_requests_cache',[]);
let customGameSlots=ls.get('sg_game_slots',[]);

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
  uid,name:me.name,bio:me.bio,hobbies:me.hobbies,gender:me.gender||'',birthday:me.birthday||'',region:me.region||'India',moodTag:me.moodTag||'',
  avatar:me.avatar,frame:me.frame,banner:me.banner,
  textStyle:me.textStyle,msgStyle:me.msgStyle,bioStyle:me.bioStyle||'',entryEffect:me.entryEffect||'',
  title:me.title||'',unlockedTitles:me.unlockedTitles||[],
  vipTier:getActiveVipTier(me),vipUntil:Number(me.vipUntil||0),
  likesCount:Number(me.likesCount||0),likedBy:(me.likedBy||[]).slice(-200),visitors:(me.visitors||[]).slice(-20),
  bonds:(me.bonds||[]).slice(-10),pendingProposals:(me.pendingProposals||[]).slice(-15),
  equippedRing:me.equippedRing||'',ownedRings:(me.ownedRings||[]).slice(-64),
  clanId:me.clanId||'',clanTag:me.clanTag||'',
  streakDays:calcStreak(me.activeDays),activeDays:me.activeDays,tags:me.tags,
  accountType:me.accountType,accountId:me.accountId,authProvider:me.authProvider||(me.accountType==='account'?'google.com':'anonymous'),
  exp:clampExp(me.exp),charm:clampSafeInt(me.charm||0,0,MAX_COINS),charmSent:clampSafeInt(me.charmSent||0,0,MAX_COINS),
  activity:me.activity||{type:'online',label:'Online',updatedAt:Date.now()},online:true,
  giftWallet:me.giftWallet||{},
  dailyCoinsByDay:sanitizeDailyMap(me.dailyCoinsByDay),claimedByDay:me.claimedByDay,
  friends:me.friends,tempUnlocks:me.tempUnlocks,rankVerified:me.rankVerified||{},devGrants:me.devGrants||{},
  resetAt:Number(me.resetAt||0),devStatsUpdatedAt:Number(me.devStatsUpdatedAt||0),giftResetAt:Number(me.giftResetAt||0),lastSeen:Date.now()
});

function getActiveVipTier(u){
  if(!u)return '';
  const tier=String(u.vipTier||'').toLowerCase();
  const until=Number(u.vipUntil||0);
  if(tier&&until>Date.now())return tier;
  return '';
}

function formatCountdownMs(ms){
  const rem=Math.max(0,Math.floor(Number(ms||0)/1000));
  const d=Math.floor(rem/86400);
  const h=Math.floor((rem%86400)/3600);
  const m=Math.floor((rem%3600)/60);
  const s=rem%60;
  if(d>0)return `${d}d ${h}h ${m}m`;
  if(h>0)return `${h}h ${m}m ${s}s`;
  if(m>0)return `${m}m ${s}s`;
  return `${s}s`;
}

function isMutedNow(u){
  const target=u||me;
  if(!target||isDevAccount(target))return false;
  return Number(target.mutedUntil||0)>Date.now();
}

function muteRemainingText(u){
  const target=u||me;
  const rem=Math.max(0,Number((target&&target.mutedUntil)||0)-Date.now());
  return rem>0?formatCountdownMs(rem):'';
}

function renderNameDecorations(u, opts){
  if(!u)return '';
  opts=opts||{};
  const parts=[];
  const vip=getActiveVipTier(u);
  if(vip){
    const lbl=vip==='royal'?'ROYAL VIP':vip==='gold'?'GOLD VIP':'SILVER VIP';
    parts.push(`<span class="vip-pill vip-${esc(vip)}">${lbl}</span>`);
  }
  if(u.clanTag){
    parts.push(`<span class="clan-tag-pill">[${esc(u.clanTag)}]</span>`);
  }
  if(typeof getCharmTierInfo==='function'){
    const ct=getCharmTierInfo(Number(u.charm||0));
    parts.push(`<span class="charm-rank-pill" title="Charm Rank: ${esc(ct.label)}">${ct.icon}</span>`);
  }
  const bonds=Array.isArray(u.bonds)?u.bonds:[];
  const couple=bonds.find(b=>b&&b.type==='couple');
  if(couple&&!opts.compact){
    parts.push(`<span class="bond-mini-pill bond-couple" title="Couple with ${esc(couple.partnerName||'Partner')}">💍 ${esc(couple.partnerName||'Partner')}</span>`);
  }else if(bonds[0]&&!opts.compact){
    const b0=bonds[0];
    const ico=b0.type==='bestie'?'💖':b0.type==='bro'?'🛡️':'💍';
    parts.push(`<span class="bond-mini-pill bond-${esc(b0.type||'bestie')}">${ico} ${esc(b0.partnerName||'Squad')}</span>`);
  }
  return parts.join('');
}

let banTimerIv=null;
function patchUser(id,obj){let u=users.find(x=>x.uid===id);if(!u){u={uid:id};users.push(u)}Object.assign(u,obj);ls.set('sg_users_cache',users)}
function checkBan(){
  const now=Date.now();
  if(me.banned && Number(me.banUntil||0)>0 && Number(me.banUntil)<=now){
    me.banned=false;me.banUntil=0;me.banReason='';saveMe();
    dbOp(()=>F.setDoc(userRef(uid),{banned:false,banUntil:0,banReason:''},{merge:true}));
  }
  const box=$('#banBox');
  if(!box)return;
  box.hidden=!me.banned;
  const uidEl=$('#banUid');if(uidEl)uidEl.textContent=uid;
  const reasonEl=$('#banReason');
  if(reasonEl)reasonEl.textContent=me.banReason||'Violation of Study Game community guidelines.';
  const cdEl=$('#banCountdown');
  if(banTimerIv){clearInterval(banTimerIv);banTimerIv=null;}
  if(me.banned && cdEl){
    const tick=()=>{
      const until=Number(me.banUntil||0);
      if(!until){cdEl.textContent='Permanent suspension (contact developer for review)';return;}
      const left=until-Date.now();
      if(left<=0){
        clearInterval(banTimerIv);banTimerIv=null;
        me.banned=false;me.banUntil=0;me.banReason='';saveMe();
        box.hidden=true;toast('Your temporary suspension has expired.');
        return;
      }
      cdEl.textContent='Time remaining: '+formatCountdownMs(left);
    };
    tick();
    banTimerIv=setInterval(tick,1000);
  }
}

let shownWarningIds=new Set();
function checkPendingWarnings(){
  const list=Array.isArray(me.warnings)?me.warnings:[];
  const unseen=list.filter(w=>w&&w.id&&!w.ack&&!shownWarningIds.has(w.id));
  if(!unseen.length)return;
  const w=unseen[unseen.length-1];
  shownWarningIds.add(w.id);
  if(typeof playSfx==='function')playSfx('warningAlert');
  const m=modal('Official Moderation Warning',`
    <div class="warn-alert-card">
      <div class="warn-alert-ico">⚠️</div>
      <b>Strike #${list.length} Issued by Moderator</b>
      <p style="margin:8px 0 4px;font-size:13px;line-height:1.5">${esc(w.reason||'Please follow community rules in chats, party rooms, and games.')}</p>
      <small style="color:var(--muted)">Issued ${new Date(w.ts||Date.now()).toLocaleString()}</small>
    </div>
    <button class="btn full" id="warnAckBtn" style="margin-top:10px">I Understand</button>
  `,'warn-sheet');
  $('#warnAckBtn',m).onclick=()=>{
    me.warnings=(me.warnings||[]).map(x=>x.id===w.id?{...x,ack:true}:x);
    saveMe();
    dbOp(()=>F.setDoc(userRef(uid),{warnings:me.warnings},{merge:true}));
    m.close();
  };
}

function toggleProfileLike(targetUid){
  if(!targetUid||targetUid===uid)return toast('You cannot like your own profile');
  const u=allUsers().find(x=>x.uid===targetUid);
  if(!u)return;
  const likedBy=Array.isArray(u.likedBy)?[...u.likedBy]:[];
  const already=likedBy.includes(uid);
  let nextLiked=likedBy;
  let nextCount=Math.max(likedBy.length,Number(u.likesCount||0));
  if(already){
    nextLiked=likedBy.filter(x=>x!==uid);
    nextCount=Math.max(0,nextCount-1);
    toast('Removed profile like');
  }else{
    nextLiked.push(uid);
    nextCount+=1;
    if(typeof playSfx==='function')playSfx('reactionPop');
    toast('Liked '+(u.name||'Player')+' ❤️');
  }
  patchUser(targetUid,{likedBy:nextLiked.slice(-200),likesCount:nextCount});
  dbOp(()=>F.setDoc(userRef(targetUid),{likedBy:nextLiked.slice(-200),likesCount:nextCount},{merge:true}));
}

function recordProfileVisitor(targetUid){
  if(!targetUid||targetUid===uid)return;
  const u=allUsers().find(x=>x.uid===targetUid);
  if(!u)return;
  const existing=Array.isArray(u.visitors)?u.visitors.filter(v=>v&&v.uid!==uid):[];
  existing.unshift({uid,name:me.name||'Player',avatar:me.avatar||'av_b1',frame:me.frame||'none',ts:Date.now()});
  const nextVisitors=existing.slice(0,15);
  patchUser(targetUid,{visitors:nextVisitors});
  dbOp(()=>F.setDoc(userRef(targetUid),{visitors:nextVisitors},{merge:true}));
}

function getClaimedToday(){return me.claimedByDay[today()]||[]}
function updateHud(){
  $$('.coinval').forEach(e=>e.textContent=fmtNum(me.coins));
  $$('.lvlval').forEach(e=>e.textContent=fmtNum(calcLevel(me.exp),MAX_LEVEL));
}

function getFreeCoinsUsedToday(){
  const d=today();
  const map=me.dailyFreeCoinsByDay&&typeof me.dailyFreeCoinsByDay==='object'?me.dailyFreeCoinsByDay:{};
  return clampSafeInt(map[d]||0,0,DAILY_FREE_COIN_CAP);
}

function grantCappedFreeCoins(requestedCoins, expDelta, taskId, noLb, opts){
  const req=Math.max(0,Math.floor(Number(requestedCoins)||0));
  const used=getFreeCoinsUsedToday();
  const calc=(typeof ShowGamesRules!=='undefined'&&typeof ShowGamesRules.calcDailyFreeCoinGrant==='function')
    ? ShowGamesRules.calcDailyFreeCoinGrant(req,used,DAILY_FREE_COIN_CAP)
    : { requested:req, granted:Math.min(req,Math.max(0,DAILY_FREE_COIN_CAP-used)), usedAfter:Math.min(DAILY_FREE_COIN_CAP,used+req), remaining:Math.max(0,DAILY_FREE_COIN_CAP-used-req), cap:DAILY_FREE_COIN_CAP, capped:req>Math.max(0,DAILY_FREE_COIN_CAP-used) };
  const d=today();
  me.dailyFreeCoinsByDay={...(me.dailyFreeCoinsByDay||{}),[d]:calc.usedAfter};
  addReward(calc.granted, expDelta, taskId, noLb, opts);
  return calc;
}
window.grantCappedFreeCoins=grantCappedFreeCoins;
window.getFreeCoinsUsedToday=getFreeCoinsUsedToday;

function checkDailyLoginBonus(){
  const d=today();
  if(me.lastLoginBonusDay===d)return;
  me.lastLoginBonusDay=d;saveMe();
  const res=grantCappedFreeCoins(15,10,null,false,{skipLevelUp:false});
  toast(res.granted>0?`Daily login bonus: +${res.granted} 🪙 (Free cap ${res.usedAfter}/${res.cap})`:'Daily login bonus: +10 EXP (Daily free coin cap reached)');
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
    const capRes=grantCappedFreeCoins(rw.amount,0,null,true,{skipLevelUp:true,silentSfx:true});
    rw.amount=capRes.granted;
    rw.label=capRes.granted>0?`+${capRes.granted} Bonus Coins`:`Daily Free Coin Cap (${capRes.cap} 🪙) Reached`;
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
  if(typeof playSfx==='function')playSfx('levelUp');
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
  if(cDelta>0 && !(opts&&opts.silentSfx) && typeof playSfx==='function'){
    playSfx('coin',{amount:cDelta});
  }
  if(typeof markTabsDirty==='function')markTabsDirty('ranking');
  else if(typeof renderRanking==='function')renderRanking();
  dbOp(()=>F.setDoc(userRef(uid),{...base(),coins:me.coins,exp:me.exp,dailyCoinsByDay:me.dailyCoinsByDay,claimedByDay:me.claimedByDay},{merge:true}));

  if(!(opts&&opts.skipLevelUp) && eDelta>0 && newLevel>prevLevel && newLevel>Number(me.lastRewardedLevel||1)){
    setTimeout(()=>triggerLevelUp(prevLevel,newLevel),180);
  }
}

/* Developer-only Permanent User ID Deletion (protects owner/dev accounts) */
async function devDeleteUserRecord(targetUid){
  if(!isDevSession()){toast('Developer only');return false;}
  const tid=String(targetUid||'').trim();
  if(!tid||tid===uid){toast('Cannot delete your active developer account');return false;}
  const target=allUsers().find(x=>x&&x.uid===tid);
  if(target&&isDevAccount(target)){toast('Cannot delete a protected developer account');return false;}
  let cloudOk=true;
  if(online&&db&&F&&!tid.startsWith('bot_')&&!tid.startsWith('demo_')){
    cloudOk=await dbOp(()=>F.deleteDoc(userRef(tid)));
  }
  users=(users||[]).filter(x=>x&&x.uid!==tid);
  ls.set('sg_users_cache',users);
  if(typeof buildProfile==='function')buildProfile();
  if(typeof renderAll==='function')renderAll();
  toast(cloudOk?`🗑️ Deleted user ID ${tid.slice(-8)}`:`Removed locally (check Firestore rules for ${tid.slice(-8)})`);
  return true;
}
window.devDeleteUserRecord=devDeleteUserRecord;

/* Developer-only Reset Coins & EXP to 0 (also cleans today's leaderboard points) */
function devResetUserProgress(targetUid){
  if(!isDevSession())return toast('Developer only');
  const d=today();
  const ts=Date.now();
  const cleanDaily={[d]:0};
  if(targetUid===uid){
    me.coins=0;me.exp=0;me.dailyCoinsByDay=cleanDaily;me.resetAt=ts;me.devStatsUpdatedAt=ts;me.lastRewardedLevel=1;
    saveMe();updateHud();
    if(typeof buildProfile==='function')buildProfile();
  }
  patchUser(targetUid,{coins:0,exp:0,dailyCoinsByDay:cleanDaily,resetAt:ts,devStatsUpdatedAt:ts});
  dbOp(()=>F.setDoc(userRef(targetUid),{coins:0,exp:0,dailyCoinsByDay:cleanDaily,resetAt:ts,devStatsUpdatedAt:ts},{merge:true}),()=>toast('Sync failed — check Firestore rules'));
  renderAll();
  toast('Coins, EXP & Today points reset to 0');
}

function devAdjustUserCoins(targetUid, delta){
  if(!isDevSession())return toast('Developer only');
  const n=clampSafeInt(delta,-MAX_COINS,MAX_COINS);
  if(!n)return toast('Enter a valid non-zero amount');
  const ts=Date.now();
  const existing=allUsers().find(x=>x.uid===targetUid)||{coins:0};
  const nc=clampCoins(Number(existing.coins||0)+n);
  if(targetUid===uid){
    me.coins=nc;me.devStatsUpdatedAt=ts;saveMe();updateHud();
    if(typeof buildProfile==='function')buildProfile();
  }
  patchUser(targetUid,{coins:nc,devStatsUpdatedAt:ts});
  dbOp(()=>F.setDoc(userRef(targetUid),{coins:nc,devStatsUpdatedAt:ts},{merge:true}),()=>toast('Sync failed — check Firestore rules'));
  renderAll();
  toast('Coins '+(n>0?'+':'')+fmtNum(n)+' (Now: '+fmtNum(nc)+')');
}

function devAdjustUserCharm(targetUid, delta){
  if(!isDevSession())return toast('Developer only');
  const n=clampSafeInt(delta,-MAX_COINS,MAX_COINS);
  if(!n)return toast('Enter a valid Charm amount');
  const ts=Date.now();
  const existing=allUsers().find(x=>x.uid===targetUid)||{uid:targetUid,charm:0,giftWallet:{}};
  const curStats=typeof getGiftWallStatsForUser==='function'?getGiftWallStatsForUser(existing):{totalCharm:existing.charm||0,counts:existing.giftWallet||{}};
  const nextCharm=clampSafeInt(Number(curStats.totalCharm||0)+n,0,MAX_COINS);
  const snapWallet={...(curStats.counts||{})};
  if(targetUid===uid){
    me.charm=nextCharm;me.giftWallet=snapWallet;me.devStatsUpdatedAt=ts;me.giftResetAt=ts;saveMe();
    if(typeof buildProfile==='function')buildProfile();
  }
  patchUser(targetUid,{charm:nextCharm,giftWallet:snapWallet,devStatsUpdatedAt:ts,giftResetAt:ts});
  dbOp(()=>F.setDoc(userRef(targetUid),{charm:nextCharm,giftWallet:snapWallet,devStatsUpdatedAt:ts,giftResetAt:ts},{merge:true}),()=>toast('Sync failed — check Firestore rules'));
  renderAll();
  toast('Charm '+(n>0?'+':'')+fmtNum(n)+' (Now: '+fmtNum(nextCharm)+')');
}

function devResetUserCharm(targetUid){
  if(!isDevSession())return toast('Developer only');
  const ts=Date.now();
  const existing=allUsers().find(x=>x.uid===targetUid)||{uid:targetUid,giftWallet:{}};
  const curStats=typeof getGiftWallStatsForUser==='function'?getGiftWallStatsForUser(existing):{counts:existing.giftWallet||{}};
  const snapWallet={...(curStats.counts||{})};
  if(targetUid===uid){
    me.charm=0;me.giftWallet=snapWallet;me.devStatsUpdatedAt=ts;me.giftResetAt=ts;saveMe();
    if(typeof buildProfile==='function')buildProfile();
  }
  patchUser(targetUid,{charm:0,giftWallet:snapWallet,devStatsUpdatedAt:ts,giftResetAt:ts});
  dbOp(()=>F.setDoc(userRef(targetUid),{charm:0,giftWallet:snapWallet,devStatsUpdatedAt:ts,giftResetAt:ts},{merge:true}),()=>toast('Sync failed — check Firestore rules'));
  renderAll();
  toast('Player Charm reset to 0');
}

function devAdjustUserGift(targetUid, giftId, delta){
  if(!isDevSession())return toast('Developer only');
  if(typeof GIFT_BY_ID==='undefined'||!GIFT_BY_ID[giftId])return toast('Gift not found');
  const n=clampSafeInt(delta,-9999,9999);
  if(!n)return toast('Enter a valid gift quantity');
  const ts=Date.now();
  const existing=allUsers().find(x=>x.uid===targetUid)||{uid:targetUid,charm:0,giftWallet:{}};
  const curStats=typeof getGiftWallStatsForUser==='function'?getGiftWallStatsForUser(existing):{totalCharm:existing.charm||0,counts:existing.giftWallet||{}};
  const nextWallet={...(curStats.counts||{})};
  const nextCnt=clampSafeInt(Number(nextWallet[giftId]||0)+n,0,MAX_COINS);
  if(nextCnt<=0)delete nextWallet[giftId];
  else nextWallet[giftId]=nextCnt;
  const g=GIFT_BY_ID[giftId];
  const nextCharm=clampSafeInt(Number(curStats.totalCharm||0)+(n*Number(g.charm||0)),0,MAX_COINS);

  if(n<0 && typeof giftEvents!=='undefined' && Array.isArray(giftEvents)){
    const toRemove=giftEvents.filter(ev=>ev&&ev.toUid===targetUid&&ev.giftId===giftId);
    toRemove.forEach(ev=>{if(ev.id)dbOp(()=>F.deleteDoc(F.doc(db,'gift_events',ev.id)))});
    giftEvents=giftEvents.filter(ev=>!(ev&&ev.toUid===targetUid&&ev.giftId===giftId));
    ls.set('sg_gift_events',giftEvents);
  }
  if(targetUid===uid){
    me.giftWallet=nextWallet;me.charm=nextCharm;me.devStatsUpdatedAt=ts;me.giftResetAt=ts;saveMe();
    if(typeof buildProfile==='function')buildProfile();
  }
  patchUser(targetUid,{giftWallet:nextWallet,charm:nextCharm,devStatsUpdatedAt:ts,giftResetAt:ts});
  dbOp(()=>F.setDoc(userRef(targetUid),{giftWallet:nextWallet,charm:nextCharm,devStatsUpdatedAt:ts,giftResetAt:ts},{merge:true}),()=>toast('Sync failed — check Firestore rules'));
  renderAll();
  toast(`${g.name} ${n>0?'+':''}${n} (Now: x${nextCnt})`);
}

function devClearUserGiftWall(targetUid){
  if(!isDevSession())return toast('Developer only');
  const ts=Date.now();
  if(typeof giftEvents!=='undefined'&&Array.isArray(giftEvents)){
    const toDelete=giftEvents.filter(ev=>ev&&ev.toUid===targetUid);
    toDelete.forEach(ev=>{if(ev.id)dbOp(()=>F.deleteDoc(F.doc(db,'gift_events',ev.id)))});
    giftEvents=giftEvents.filter(ev=>!(ev&&ev.toUid===targetUid));
    ls.set('sg_gift_events',giftEvents);
  }
  if(targetUid===uid){
    me.giftWallet={};me.charm=0;me.devStatsUpdatedAt=ts;me.giftResetAt=ts;saveMe();
    if(typeof buildProfile==='function')buildProfile();
  }
  patchUser(targetUid,{giftWallet:{},charm:0,devStatsUpdatedAt:ts,giftResetAt:ts});
  dbOp(()=>F.setDoc(userRef(targetUid),{giftWallet:{},charm:0,devStatsUpdatedAt:ts,giftResetAt:ts},{merge:true}),()=>toast('Sync failed — check Firestore rules'));
  renderAll();
  toast('Player Gift Wall & Received Gifts cleared');
}

function devGrantTopRankSet(targetUid, rank, days=1){
  if(!isDevSession())return toast('Developer only');
  const rk=Math.max(1,Math.min(3,Number(rank)||1));
  const def=typeof LB_EXCLUSIVE_ASSETS!=='undefined'&&LB_EXCLUSIVE_ASSETS[rk]?LB_EXCLUSIVE_ASSETS[rk]:null;
  if(!def)return;
  const ts=Date.now(), until=ts+Math.max(1,Number(days||1))*864e5;
  const existing=allUsers().find(x=>x.uid===targetUid)||{uid:targetUid};
  const nextTemp={...(existing.tempUnlocks||{})};
  const nextGrants={...(existing.devGrants||{})};
  ['frame:'+def.frame,'banner:'+def.banner,'avatar:'+def.avatar,'badge:lb_top'+rk].forEach(k=>{
    nextTemp[k]=until;nextGrants[k]=until;
  });
  const payload={tempUnlocks:nextTemp,devGrants:nextGrants,frame:def.frame,devStatsUpdatedAt:ts};
  if(targetUid===uid){
    me.tempUnlocks=nextTemp;me.devGrants=nextGrants;me.frame=def.frame;me.devStatsUpdatedAt=ts;saveMe();
    if(typeof buildProfile==='function')buildProfile();
  }
  patchUser(targetUid,payload);
  dbOp(()=>F.setDoc(userRef(targetUid),payload,{merge:true}));
  renderAll();
  toast(`Granted Top #${rk} Exclusive Set (${days}D)`);
}

function devRevokeTopRankSet(targetUid){
  if(!isDevSession())return toast('Developer only');
  const ts=Date.now();
  const existing=allUsers().find(x=>x.uid===targetUid)||{uid:targetUid};
  const nextTemp={...(existing.tempUnlocks||{})};
  const nextVerified={...(existing.rankVerified||{})};
  const nextGrants={...(existing.devGrants||{})};
  Object.keys(nextTemp).forEach(k=>{if(typeof isRankExclusiveKey==='function'&&isRankExclusiveKey(k))delete nextTemp[k]});
  Object.keys(nextVerified).forEach(k=>{if(typeof isRankExclusiveKey==='function'&&isRankExclusiveKey(k))delete nextVerified[k]});
  Object.keys(nextGrants).forEach(k=>{if(typeof isRankExclusiveKey==='function'&&isRankExclusiveKey(k))delete nextGrants[k]});
  const nextFrame=typeof isRankExclusiveKey==='function'&&isRankExclusiveKey('frame:'+existing.frame)?'none':(existing.frame||'none');
  const nextBanner=typeof isRankExclusiveKey==='function'&&isRankExclusiveKey('banner:'+existing.banner)?'bn-aurora':(existing.banner||'bn-aurora');
  const nextAvatar=typeof isRankExclusiveKey==='function'&&isRankExclusiveKey('avatar:'+existing.avatar)?'🦊':(existing.avatar||'🦊');
  const payload={tempUnlocks:nextTemp,rankVerified:nextVerified,devGrants:nextGrants,frame:nextFrame,banner:nextBanner,avatar:nextAvatar,devStatsUpdatedAt:ts};
  if(targetUid===uid){
    Object.assign(me,payload);saveMe();
    if(typeof buildProfile==='function')buildProfile();
  }
  patchUser(targetUid,payload);
  dbOp(()=>F.setDoc(userRef(targetUid),payload,{merge:true}));
  renderAll();
  toast('Revoked Top 1–3 Exclusive Set');
}

function devSetUserTodayCoins(targetUid, nextVal){
  if(!isDevSession())return toast('Developer only');
  const n=clampSafeInt(nextVal,0,MAX_DAILY_PTS);
  const ts=Date.now(), d=today();
  const existing=allUsers().find(x=>x.uid===targetUid)||{dailyCoinsByDay:{}};
  const nextDaily={...(existing.dailyCoinsByDay||{}),[d]:n};
  if(targetUid===uid){me.dailyCoinsByDay=nextDaily;me.devStatsUpdatedAt=ts;saveMe();}
  patchUser(targetUid,{dailyCoinsByDay:nextDaily,devStatsUpdatedAt:ts});
  dbOp(()=>F.setDoc(userRef(targetUid),{dailyCoinsByDay:nextDaily,devStatsUpdatedAt:ts},{merge:true}));
  renderAll();
  toast('Today Coins set to '+fmtNum(n));
}

function devAdjustUserExp(targetUid, delta){
  if(!isDevSession())return toast('Developer only');
  const n=clampSafeInt(delta,-MAX_EXP,MAX_EXP);
  if(!n)return toast('Enter a valid EXP value');
  const ts=Date.now();
  const existing=allUsers().find(x=>x.uid===targetUid)||{exp:0};
  const nextExp=clampExp(Number(existing.exp||0)+n);
  if(targetUid===uid){me.exp=nextExp;me.devStatsUpdatedAt=ts;saveMe();updateHud();}
  patchUser(targetUid,{exp:nextExp,devStatsUpdatedAt:ts});
  dbOp(()=>F.setDoc(userRef(targetUid),{exp:nextExp,devStatsUpdatedAt:ts},{merge:true}));
  renderAll();
  toast('EXP updated (LVL '+calcLevel(nextExp)+')');
}

function devGrantVip(targetUid, tier, days=7){
  if(!isDevSession())return toast('Developer only');
  const ts=Date.now();
  const until=tier?ts+Math.max(1,Number(days||7))*86400000:0;
  const payload={vipTier:tier||'',vipUntil:until,devStatsUpdatedAt:ts};
  if(targetUid===uid){Object.assign(me,payload);saveMe();}
  patchUser(targetUid,payload);
  dbOp(()=>F.setDoc(userRef(targetUid),payload,{merge:true}));
  renderAll();
  toast(tier?`Granted ${tier.toUpperCase()} VIP (${days}D)`:'VIP revoked');
}

function devSendWarning(targetUid, reason){
  if(!isDevSession())return toast('Developer only');
  const txt=String(reason||'Community guidelines reminder').trim().slice(0,220);
  const ts=Date.now();
  const existing=allUsers().find(x=>x.uid===targetUid)||{warnings:[]};
  const nextW=[...(Array.isArray(existing.warnings)?existing.warnings:[]),{id:'W'+ts,reason:txt,ts,by:uid,ack:false}].slice(-20);
  patchUser(targetUid,{warnings:nextW,devStatsUpdatedAt:ts});
  dbOp(()=>F.setDoc(userRef(targetUid),{warnings:nextW,devStatsUpdatedAt:ts},{merge:true}));
  toast('Official warning sent to user');
}

function devSetMute(targetUid, minutes){
  if(!isDevSession())return toast('Developer only');
  const mins=Math.max(0,Number(minutes||0));
  const ts=Date.now();
  const mutedUntil=mins>0?ts+mins*60000:0;
  patchUser(targetUid,{mutedUntil,devStatsUpdatedAt:ts});
  dbOp(()=>F.setDoc(userRef(targetUid),{mutedUntil,devStatsUpdatedAt:ts},{merge:true}));
  toast(mins>0?`Muted user for ${formatCountdownMs(mins*60000)}`:'User unmuted');
}

function devSetBan(targetUid, durationHours, reason){
  if(!isDevSession())return toast('Developer only');
  const ts=Date.now();
  if(durationHours==='unban'||durationHours===0){
    const payload={banned:false,banUntil:0,banReason:'',devStatsUpdatedAt:ts};
    patchUser(targetUid,payload);
    dbOp(()=>F.setDoc(userRef(targetUid),payload,{merge:true}));
    if(targetUid===uid){Object.assign(me,payload);saveMe();checkBan();}
    toast('User unbanned');
    return;
  }
  const hrs=durationHours==='perm'?0:Math.max(0.25,Number(durationHours||24));
  const banUntil=hrs>0?ts+Math.round(hrs*3600000):0;
  const cleanReason=String(reason||'Violation of community guidelines').trim().slice(0,220);
  const payload={banned:true,banUntil,banReason:cleanReason,devStatsUpdatedAt:ts};
  patchUser(targetUid,payload);
  dbOp(()=>F.setDoc(userRef(targetUid),payload,{merge:true}));
  if(targetUid===uid){Object.assign(me,payload);saveMe();checkBan();}
  toast(hrs>0?`Temporary ban applied (${formatCountdownMs(hrs*3600000)})`:'Permanent ban applied');
}

function getInviteCode(){return me.accountType==='account'?'REF_'+uid.replace(/[^A-Z0-9]/gi,'').slice(-8).toUpperCase():''}
function buildReferralSharePayload(customCode){
  const code=String(customCode||getInviteCode()||'').trim().toUpperCase();
  const cleanBase=location.href.split('#')[0].split('?')[0];
  const link=code?`${cleanBase}?ref=${encodeURIComponent(code)}`:cleanBase;
  const sender=(me.name||'').trim();
  const intro=sender&&!/^guest /i.test(sender)
    ? `Join ${sender} on *Study Game* — study tools, live quizzes, daily leaderboard & gift drops!`
    : `Join *Study Game* — study tools, live quizzes, daily leaderboard & gift drops!`;
  const text=[
    intro,
    '',
    `Invite Code: *${code}*`,
    `Bonus: Stay active 3 days to unlock +50 bonus coins`,
    `Play now: ${link}`
  ].join('\n');
  return {
    code,
    link,
    text,
    whatsappUrl:`https://wa.me/?text=${encodeURIComponent(text)}`,
    telegramUrl:`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(intro+'\nInvite Code: '+code+' (+50 bonus coins after 3 active days)')}`
  };
}
function shareInvite(mode){
  const code=getInviteCode();if(!code)return toast('Sign in with Google for your invite code');
  const p=buildReferralSharePayload(code);
  if(typeof playSfx==='function')playSfx('click');
  if(mode==='whatsapp'){
    const a=document.createElement('a');a.href=p.whatsappUrl;a.target='_blank';a.rel='noopener noreferrer';a.click();
    return;
  }
  if(mode==='telegram'){
    const a=document.createElement('a');a.href=p.telegramUrl;a.target='_blank';a.rel='noopener noreferrer';a.click();
    return;
  }
  if(mode==='copy_code'){
    navigator.clipboard?.writeText(p.code).then(()=>toast('Invite code copied: '+p.code),()=>toast(p.code));
    return;
  }
  if(mode==='copy_card'){
    navigator.clipboard?.writeText(p.text).then(()=>toast('Invite message copied! Ready to paste in WhatsApp/Telegram'),()=>toast(p.link));
    return;
  }
  /* Pass ONLY title + text (no separate url field) so WhatsApp/Android never duplicates the link */
  if(navigator.share){
    navigator.share({title:'Study Game — Invite & Earn',text:p.text}).catch(()=>{});
  }else{
    navigator.clipboard?.writeText(p.text).then(()=>toast('Invite card copied!'),()=>toast(p.link));
  }
}
function openReferShareModal(){
  const code=getInviteCode();
  if(!code)return toast('Sign in with Google to unlock your Invite Card');
  const p=buildReferralSharePayload(code);
  const days=Math.min(3,new Set(me.activeDays||[]).size);
  const m=modal('Refer & Earn Card',`
    <div class="ref-card-preview">
      <div class="ref-card-head">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="32" height="32" fill="none">
            <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#hdrSgBg)"/>
            <path d="M16 40V25c0-1.5 1.4-2.6 2.9-2.1 4.7 1.5 9.2 3.4 13.1 6.1 3.9-2.7 8.4-4.6 13.1-6.1 1.5-.5 2.9.6 2.9 2.1v15c0 1.4-1.3 2.4-2.6 2-4.6-1.3-9.1-1-13.4 1.5-4.3-2.5-8.8-2.8-13.4-1.5-1.3.4-2.6-.6-2.6-2z" fill="#ffffff"/>
            <path d="M32 29v14.5" stroke="#4f6ef7" stroke-width="2.4" stroke-linecap="round"/>
            <path d="M32 10.5l2.5 5.4 5.9.7-4.4 4 1.2 5.8-5.2-2.9-5.2 2.9 1.2-5.8-4.4-4 5.9-.7 2.5-5.4z" fill="#ffd36b"/>
          </svg>
        </span>
        <div>
          <div class="ref-card-brand">Study Game</div>
          <small>Study tools · Live Multiplayer · Gift Wall</small>
        </div>
        <span class="ref-bonus-tag">+50 🪙</span>
      </div>
      <div class="ref-code-strip">
        <div><small>Your Invite Code</small><b id="refCodeVal">${esc(p.code)}</b></div>
        <button type="button" class="btn ghost sm" id="refCopyCodeBtn">Copy Code</button>
      </div>
      <div class="ref-msg-box" id="refPreviewTxt">${esc(p.text).replace(/\n/g,'<br>')}</div>
      <div class="ref-meta-foot">Your active streak: <b>${days}/3 days</b> · Friend stays active 3 days → you earn +50 coins</div>
    </div>
    <div class="ref-share-grid">
      <a class="btn ref-wa-btn" href="${esc(p.whatsappUrl)}" target="_blank" rel="noopener noreferrer" id="refWaBtn">WhatsApp</a>
      <a class="btn ref-tg-btn" href="${esc(p.telegramUrl)}" target="_blank" rel="noopener noreferrer" id="refTgBtn">Telegram</a>
    </div>
    <div class="row" style="margin-top:8px">
      <button type="button" class="btn ghost" style="flex:1" id="refCopyAllBtn">Copy Message</button>
      <button type="button" class="btn" style="flex:1" id="refNativeBtn">Share Now</button>
    </div>
  `,'ref-modal-sheet');
  $('#refCopyCodeBtn',m).onclick=()=>shareInvite('copy_code');
  $('#refCopyAllBtn',m).onclick=()=>shareInvite('copy_card');
  $('#refNativeBtn',m).onclick=()=>shareInvite();
  $('#refWaBtn',m).onclick=()=>{if(typeof playSfx==='function')playSfx('click')};
  $('#refTgBtn',m).onclick=()=>{if(typeof playSfx==='function')playSfx('click')};
}

function syncDevInboxToCloud(tid,obj){ls.set('sg_dev_inbox',devInbox);dbOp(()=>F.setDoc(F.doc(db,'dev_inbox',tid),obj,{merge:true}))}

/* Auto-cleanup offline/inactive guest accounts after 7 days (Firestore + local storage) */
function cleanupInactiveGuestUsers(docList){
  const now=Date.now();
  /* 1. Sweep stale local guest profiles older than 7 days */
  try{
    const keys=Object.keys(localStorage);
    keys.forEach(k=>{
      if(!k.startsWith('sg_profile_')||k==='sg_profile_'+uid)return;
      const p=ls.get(k,null);
      if(p&&p.accountType==='guest'){
        const last=Number(p.lastSeen||p.createdAt||0);
        if(!last||(now-last)>=SEVEN_DAYS_MS){
          const deadUid=k.slice('sg_profile_'.length);
          localStorage.removeItem(k);
          localStorage.removeItem('sg_stats_'+deadUid);
          localStorage.removeItem('sg_chats_'+deadUid);
        }
      }
    });
  }catch{}

  /* 2. Remove inactive Firestore guest docs older than 7 days */
  if(!online||!db||!Array.isArray(docList))return;
  docList.forEach(d=>{
    if(!d||!d.uid||d.uid===uid||isDevAccount(d))return;
    if(d.accountType!=='guest')return;
    const last=Number(d.lastSeen||d.createdAt||0);
    if(last>0&&(now-last)>=SEVEN_DAYS_MS){
      dbOp(()=>F.deleteDoc(F.doc(db,'users',d.uid)));
    }
  });
}

function modal(title,html,cls=''){
  const b=document.createElement('div');b.className='mb';
  b.innerHTML=`<div class="sheet ${cls}"><div class="sh"><h3>${title}</h3><button class="x" aria-label="Close">✕</button></div><div class="sb">${html}</div></div>`;
  $('#modals').appendChild(b);b.close=()=>{b.remove();b.onclose&&b.onclose()};$('.x',b).onclick=b.close;b.addEventListener('click',e=>{if(e.target===b)b.close()});
  if(typeof pushBackGuardState==='function')pushBackGuardState('modal');
  return b;
}

function openRewardAd(onDone){
  const m=modal('Reward Ad',`<div class="ad"><div class="adbox">Reward Ad</div><p id="adt">Ad ends in 15s</p><button class="btn ghost full" id="adskip" disabled>Skip in 5s</button></div>`);
  let t=15;const iv=setInterval(()=>{t--;$('#adt',m).textContent=t>0?`Ad ends in ${t}s`:'Done';const sk=$('#adskip',m);if(15-t>=5){sk.disabled=false;sk.textContent='Claim'}else sk.textContent=`Skip in ${5-(15-t)}s`;if(t<=0){clearInterval(iv);bumpStat('ad_watch');m.close();onDone&&onDone()}},1000);
  $('#adskip',m).onclick=()=>{if($('#adskip',m).disabled)return;clearInterval(iv);bumpStat('ad_watch');m.close();onDone&&onDone()};
  m.onclose=()=>clearInterval(iv);
}

function allUsers(){const m=new Map(users.map(u=>[u.uid,sanitizeUserAppearance(u)]));m.set(uid,{...(m.get(uid)||{}),...sanitizeUserAppearance(me)});return [...m.values()]}
/* Leaderboard strictly ranks by TODAY'S earned coins/points (never exposes total wallet balance) */
function rankableUsers(){
  return allUsers()
    .filter(u=>!isDevAccount(u))
    .map(u=>({...u,todayPts:getUserTodayPts(u)}))
    .sort((a,b)=>b.todayPts-a.todayPts||(b.charm||0)-(a.charm||0)||(b.exp||0)-(a.exp||0));
}
function isFriend(id){return me.friends.includes(id)}
function toggleFriend(targetUid){
  if(!targetUid||targetUid===uid)return;
  if(isFriend(targetUid)){me.friends=me.friends.filter(x=>x!==targetUid);toast('Removed friend')}
  else{me.friends.push(targetUid);toast('Friend added')}
  saveMe();patchUser(uid,{friends:me.friends});dbOp(()=>F.setDoc(userRef(uid),{friends:me.friends},{merge:true}));
  if(typeof renderChats==='function')renderChats();
}

function resolvePlayerForProfile(targetUid){
  if(!targetUid)return null;
  const direct=allUsers().find(x=>x.uid===targetUid);
  if(direct)return direct;
  const wm=(worldMsgs||[]).slice().reverse().find(m=>m&&(m.uid===targetUid||m.fromUid===targetUid));
  if(wm){
    return sanitizeUserAppearance({
      uid:targetUid,name:wm.name||wm.fromName||'Player',avatar:wm.avatar||'🦊',frame:wm.frame||'none',
      banner:wm.banner||'bn-aurora',textStyle:wm.textStyle||'',tags:wm.tags||['Newbie'],
      exp:wm.exp||0,coins:0,charm:0,giftWallet:{}
    });
  }
  const wmRecip=(worldMsgs||[]).slice().reverse().find(m=>m&&m.toUid===targetUid);
  if(wmRecip){
    return sanitizeUserAppearance({
      uid:targetUid,name:wmRecip.toName||'Player',avatar:'🦊',frame:'none',
      banner:'bn-aurora',tags:['Newbie'],exp:0,coins:0,charm:0,giftWallet:{}
    });
  }
  if(typeof chats!=='undefined'&&chats[targetUid]){
    const c=chats[targetUid];
    return sanitizeUserAppearance({uid:targetUid,name:c.name||'Player',avatar:'🦊',frame:'none',banner:'bn-aurora',tags:['Newbie'],exp:0,coins:0,charm:0,giftWallet:{}});
  }
  if(typeof devInbox!=='undefined'&&devInbox[targetUid]){
    const d=devInbox[targetUid];
    return sanitizeUserAppearance({uid:targetUid,name:d.name||'Player',avatar:d.avatar||'🦊',frame:d.frame||'none',banner:'bn-aurora',tags:['Newbie'],exp:0,coins:0,charm:0,giftWallet:{}});
  }
  if(typeof giftEvents!=='undefined'&&Array.isArray(giftEvents)){
    const ge=giftEvents.find(ev=>ev&&(ev.fromUid===targetUid||ev.toUid===targetUid));
    if(ge){
      const isFrom=ge.fromUid===targetUid;
      return sanitizeUserAppearance({
        uid:targetUid,name:(isFrom?ge.fromName:ge.toName)||'Player',
        avatar:(isFrom&&ge.fromAvatar)||'🦊',frame:(isFrom&&ge.fromFrame)||'none',
        banner:'bn-aurora',tags:['Newbie'],exp:0,coins:0,charm:0,giftWallet:{}
      });
    }
  }
  return null;
}

/* =====================================================================
   ONLINE PRESENCE, GUEST FILTER, LIVE ACTIVITY, CLICKABLE INVITES,
   SPECTATE & SHARED IN-GAME CHAT WIDGET
   ===================================================================== */
function isGuestUser(u){
  if(!u)return true;
  const id=String(u.uid||'').trim();
  const nm=String(u.name||'').trim();
  if(!id)return true;
  if(u.accountType==='guest')return true;
  if(/^SG\d{6,}$/i.test(id) && u.accountType!=='account')return true;
  if(/^guest[_\-\s]/i.test(id))return true;
  if(/^Guest\s+\d{3,}$/i.test(nm) && u.accountType!=='account')return true;
  return false;
}
window.isGuestUser=isGuestUser;

function isUserOnline(u){
  if(!u||isGuestUser(u))return false;
  if(u.uid===uid)return true;
  const lsTs=Number(u.lastSeen||0);
  if(lsTs>0 && (Date.now()-lsTs)<5*60*1000)return true;
  if(u.online===true && (lsTs===0 || (Date.now()-lsTs)<30*60*1000))return true;
  return false;
}
window.isUserOnline=isUserOnline;

function getRealOnlineUsers(opts){
  const o=opts||{};
  const includeSelf=Boolean(o.includeSelf);
  const friendsOnly=Boolean(o.friendsOnly);
  const friendSet=new Set(Array.isArray(me?.friends)?me.friends:[]);
  const list=(typeof allUsers==='function'?allUsers():[])
    .filter(u=>u&&u.uid&&(includeSelf||u.uid!==uid))
    .filter(u=>!isGuestUser(u))
    .filter(u=>isUserOnline(u))
    .filter(u=>!friendsOnly||friendSet.has(u.uid));
  list.sort((a,b)=>{
    const af=friendSet.has(a.uid)?1:0, bf=friendSet.has(b.uid)?1:0;
    if(bf!==af)return bf-af;
    return Number(b.lastSeen||0)-Number(a.lastSeen||0);
  });
  return list;
}
window.getRealOnlineUsers=getRealOnlineUsers;

function getUserLiveActivity(u){
  if(!u||isGuestUser(u)){
    return {isOnline:false,type:'offline',label:'Offline',shortLabel:'Offline',badgeCls:'off',canSpectate:false};
  }
  const on=isUserOnline(u);
  const act=u.activity&&typeof u.activity==='object'?u.activity:null;
  const fresh=!act||!act.updatedAt||(Date.now()-Number(act.updatedAt))<45*60*1000;
  if(on && act && fresh && (act.type==='playing' || act.type==='game') && (act.gameId||act.gameName)){
    const gMap={ludo:'Ludo',jackaroo:'Jackaroo',uno:'UNO',pool_8ball:'8-Ball Pool',ludo_snakes:'Ludo Express',blitz_dots:'Blitz Dots',squad_arena:'Squad Arena',undercover:'Undercover'};
    const gLabel=act.gameName||gMap[act.gameId]||'Game';
    const cleanG=gLabel.replace(/\s+(Royal|Garden)$/i,'');
    return {
      isOnline:true,
      type:'playing',
      label:`Playing ${cleanG}`,
      shortLabel:`Playing ${cleanG}`,
      badgeCls:'playing',
      gameId:String(act.gameId||'ludo'),
      gameName:gLabel,
      roomCode:String(act.roomCode||''),
      roomId:String(act.roomId||''),
      mode:String(act.mode||''),
      canSpectate:true
    };
  }
  if(on && act && fresh && act.type==='party'){
    return {
      isOnline:true,
      type:'party',
      label:'In Voice Room',
      shortLabel:'In Voice Room',
      badgeCls:'party',
      roomId:String(act.roomId||''),
      roomCode:String(act.roomCode||''),
      gameName:act.gameName||'Voice Room',
      canSpectate:Boolean(act.roomId)
    };
  }
  if(on){
    return {isOnline:true,type:'online',label:'Online',shortLabel:'Online',badgeCls:'on',canSpectate:false};
  }
  return {isOnline:false,type:'offline',label:'Offline',shortLabel:'Offline',badgeCls:'off',canSpectate:false};
}
window.getUserLiveActivity=getUserLiveActivity;

function setMyLiveActivity(act){
  const next=act&&act.type&&act.type!=='online'
    ? {...act,updatedAt:Date.now()}
    : {type:'online',label:'Online',updatedAt:Date.now()};
  me.activity=next;
  me.lastSeen=Date.now();
  saveMe();
  patchUser(uid,{activity:next,lastSeen:me.lastSeen,online:true});
  if(online&&db&&F&&uid){
    dbOp(()=>F.setDoc(userRef(uid),{activity:next,lastSeen:me.lastSeen,online:true},{merge:true}));
  }
}
window.setMyLiveActivity=setMyLiveActivity;

function renderOnlineActivityBadge(u, opts){
  const o=opts||{};
  const act=getUserLiveActivity(u);
  if(!act.isOnline){
    return o.hideOffline?'':'<span class="sg-act-badge off"><i></i>Offline</span>';
  }
  const ico=act.type==='playing'?'🎮':(act.type==='party'?'🎙️':'');
  return `<span class="sg-act-badge ${esc(act.badgeCls)}"><i></i>${ico?ico+' ':''}${esc(act.label)}</span>`;
}
window.renderOnlineActivityBadge=renderOnlineActivityBadge;

function buildRoomInviteUrl(opts){
  const o=opts||{};
  const code=String(o.roomCode||'').trim().toUpperCase();
  const gameId=String(o.gameId||'').trim().toLowerCase();
  const roomId=String(o.roomId||o.partyId||'').trim();
  const mode=String(o.mode||'').trim();
  try{
    const baseHref=(typeof window!=='undefined'&&window.location&&window.location.href)?window.location.href:'https://study-game.app/';
    const u=new URL(baseHref);
    u.search='';
    u.hash='';
    if(o.type==='party'||roomId.startsWith('pr_')){
      if(roomId)u.searchParams.set('party',roomId);
      if(code)u.searchParams.set('room',code);
    }else{
      if(code)u.searchParams.set('room',code);
      if(roomId&&!roomId.startsWith('pr_'))u.searchParams.set('rid',roomId);
      if(gameId)u.searchParams.set('game',gameId);
      if(mode)u.searchParams.set('mode',mode);
    }
    return u.toString();
  }catch{
    if(o.type==='party'||roomId.startsWith('pr_')){
      return `?party=${encodeURIComponent(roomId)}&room=${encodeURIComponent(code)}`;
    }
    return `?room=${encodeURIComponent(code)}${roomId?'&rid='+encodeURIComponent(roomId):''}${gameId?'&game='+encodeURIComponent(gameId):''}${mode?'&mode='+encodeURIComponent(mode):''}`;
  }
}
window.buildRoomInviteUrl=buildRoomInviteUrl;

function detectInviteGameFromCodeOrText(code, text, explicitGame){
  const g=String(explicitGame||'').trim().toLowerCase();
  if(g)return g;
  const c=String(code||'').toUpperCase();
  const t=String(text||'').toLowerCase();
  if(c.startsWith('CC')||/couple\s*chronicles|chronicles\s*story|midnight\s*express/.test(t))return 'couple_chronicles';
  if(c.startsWith('BC')||/budget\s*clash/.test(t))return 'budget_clash';
  if(c.startsWith('CP')||/couple|bestie\s*arena|mind\s*sync/.test(t))return 'couple_arena';
  if(c.startsWith('PL')||/8-?ball|pool/.test(t))return 'pool_8ball';
  if(c.startsWith('CH')||/chess/.test(t))return 'chess_blitz';
  if(c.startsWith('TR')||/tile\s*race/.test(t))return 'tile_race';
  if(c.startsWith('TD')||/trap\s*door/.test(t))return 'trap_door';
  if(c.startsWith('MC')||/mind\s*clash/.test(t))return 'mind_clash';
  if(c.startsWith('PT')||/pocket\s*territory|territory/.test(t))return 'pocket_territory';
  if(c.startsWith('LU')||/\bludo\b/.test(t))return 'ludo';
  if(c.startsWith('NM')||/number\s*match/.test(t))return 'number_match';
  if(c.startsWith('JK')||/\bjackaroo\b/.test(t))return 'jackaroo';
  if(c.startsWith('UN')||/\buno\b/.test(t))return 'uno';
  if(c.startsWith('PR')||/voice\s*room|party\s*room|\?party=/.test(t))return 'party';
  if(/blitz|dots/.test(t))return 'blitz_dots';
  if(/undercover/.test(t))return 'undercover';
  if(/squad/.test(t))return 'squad_arena';
  return 'room';
}

function parseRoomInviteFromText(rawText, meta){
  const txt=String(rawText||'');
  const m=meta&&typeof meta==='object'?meta:{};
  let roomCode=String(m.roomCode||'').trim().toUpperCase();
  let roomId=String(m.roomId||m.partyId||'').trim();
  let gameId=String(m.gameId||'').trim().toLowerCase();
  let mode=String(m.mode||'').trim();
  let stake=Number(m.stake||0);

  const qRoom=txt.match(/[?&]room=([A-Za-z0-9_-]{3,16})/i);
  const qRid=txt.match(/[?&]rid=([A-Za-z0-9_-]{4,60})/i);
  const qJk=txt.match(/[?&]jkRoom=([A-Za-z0-9_-]{3,16})/i);
  const qParty=txt.match(/[?&]party=([A-Za-z0-9_-]{3,40})/i);
  const qGame=txt.match(/[?&]game=([A-Za-z0-9_-]{2,24})/i);
  const qMode=txt.match(/[?&]mode=([A-Za-z0-9_-]{2,20})/i);

  if(!roomCode && qRoom)roomCode=qRoom[1].toUpperCase();
  if(!roomId && qRid)roomId=qRid[1];
  if(!roomCode && qJk){roomCode=qJk[1].toUpperCase();if(!gameId)gameId='jackaroo';}
  if(!roomId && qParty){roomId=qParty[1];if(!gameId)gameId='party';}
  if(!gameId && qGame)gameId=qGame[1].toLowerCase();
  if(!mode && qMode)mode=qMode[1];

  if(!roomCode){
    const cMatch=txt.match(/(?:Room\s*Code|Table\s*Code|Code)\s*[:#]\s*([A-Z0-9-]{4,14})/i);
    if(cMatch)roomCode=cMatch[1].toUpperCase();
  }
  if(!roomCode && !roomId)return null;

  const isParty=m.type==='party_invite'||m.inviteType==='party_invite'||gameId==='party'||Boolean(qParty)||(roomId&&roomId.startsWith('pr_'));
  const resolvedGame=isParty?'party':detectInviteGameFromCodeOrText(roomCode,txt,gameId);
  const gameNames={
    couple_chronicles:'Couple Chronicles',
    budget_clash:'Budget Clash',
    couple_arena:'Couple & Bestie Arena',
    pool_8ball:'8-Ball Pool',
    jackaroo:'Jackaroo Royal',
    uno:'UNO Clash',
    chess_blitz:'Chess Blitz',
    tile_race:'60-Second Tile Race',
    trap_door:'Trap Door Duel',
    mind_clash:'Mind Clash 1v1',
    pocket_territory:'Pocket Territory',
    ludo:'Ludo Royal 3D',
    number_match:'Number Match',
    party:'Voice Party Room',
    blitz_dots:'Blitz Dots',
    squad_arena:'Squad Arena',
    undercover:'Undercover',
    room:'Multiplayer Room'
  };
  const gameIcons={
    couple_chronicles:'📖',
    budget_clash:'💰',
    couple_arena:'💗',
    pool_8ball:'🎱',
    jackaroo:'🃏',
    uno:'🌈',
    chess_blitz:'♟️',
    tile_race:'⚡',
    trap_door:'🚪',
    mind_clash:'🧠',
    pocket_territory:'🗺️',
    ludo:'🎲',
    number_match:'🔢',
    party:'🎙️',
    blitz_dots:'🔵',
    squad_arena:'⚡',
    undercover:'🕵️',
    room:'🎮'
  };
  if(!mode){
    if(/\b1v1\b/i.test(txt))mode='1v1';
    else if(/\b2v2\b/i.test(txt))mode='2v2';
    else if(/\b4p\b|4\s*player/i.test(txt))mode='4p';
    else if(/\bfun\b/i.test(txt)&&resolvedGame==='uno')mode='fun';
  }
  if(!stake){
    const sMatch=txt.match(/(\d{2,6})\s*(?:🪙|Coins?)/i);
    if(sMatch)stake=Number(sMatch[1])||0;
  }

  return {
    kind:isParty?'party':'game',
    gameId:resolvedGame,
    gameName:m.gameName||gameNames[resolvedGame]||'Multiplayer Room',
    icon:gameIcons[resolvedGame]||'🎮',
    roomCode,
    roomId,
    mode,
    stake,
    url:buildRoomInviteUrl({type:isParty?'party':'game',gameId:resolvedGame,roomCode,roomId,mode})
  };
}
window.parseRoomInviteFromText=parseRoomInviteFromText;

function renderClickableInviteCard(inv, opts){
  if(!inv)return '';
  const o=opts||{};
  const payload=encodeURIComponent(JSON.stringify({
    kind:inv.kind,gameId:inv.gameId,gameName:inv.gameName,roomCode:inv.roomCode,roomId:inv.roomId,mode:inv.mode,stake:inv.stake
  }));
  const subParts=[];
  if(inv.roomCode)subParts.push(`Room Code: ${inv.roomCode}`);
  if(inv.mode)subParts.push(inv.mode.toUpperCase());
  if(inv.stake>0)subParts.push(`${inv.stake} 🪙`);
  return `
    <button type="button" class="sg-invite-card ${esc(inv.gameId||'room')}" data-sg-join-invite="${payload}" aria-label="Join ${esc(inv.gameName)} Room ${esc(inv.roomCode||'')}">
      <div class="sg-inv-left">
        <span class="sg-inv-ico" aria-hidden="true">${inv.icon||'🎮'}</span>
        <div class="sg-inv-meta">
          <b>${esc(inv.gameName||'Game Invite')}</b>
          <small>${esc(subParts.join(' · ')||'Tap to join live room')}</small>
        </div>
      </div>
      <span class="sg-inv-cta">${o.btnLabel||(inv.kind==='party'?'Enter Room':'Join')} ›</span>
    </button>
  `;
}
window.renderClickableInviteCard=renderClickableInviteCard;

async function joinFromInvitePayload(raw){
  if(!raw)return;
  let inv=raw;
  if(typeof raw==='string'){
    try{inv=JSON.parse(decodeURIComponent(raw));}
    catch{inv=parseRoomInviteFromText(raw);}
  }
  if(!inv)return;
  if(typeof playSfx==='function')playSfx('tap');

  const thr=$('#thread');
  if(thr&&!thr.hidden){thr.hidden=true;if(typeof cur!=='undefined')cur=null;}

  if(inv.kind==='party'||inv.gameId==='party'){
    const rooms=typeof partyRooms!=='undefined'&&Array.isArray(partyRooms)?partyRooms:[];
    const match=rooms.find(r=>r&&(r.id===inv.roomId||(inv.roomCode&&String(r.code||r.shortId||'').toUpperCase()===inv.roomCode)));
    if(match && typeof openPartyRoomModal==='function'){
      showTab('party');
      openPartyRoomModal(match.id);
      return;
    }
    if(inv.roomId && typeof openPartyRoomModal==='function'){
      showTab('party');
      openPartyRoomModal(inv.roomId);
      return;
    }
    showTab('party');
    toast(inv.roomCode?`Voice Room ${inv.roomCode} not active right now`:'Opening Voice Rooms');
    return;
  }

  // Dedicated Couple Chronicles invite routing (lazy-loads story modules on demand)
  const isChronicleInvite=inv.gameId==='couple_chronicles'||String(inv.roomCode||'').toUpperCase().startsWith('CC');
  if(isChronicleInvite&&(inv.roomId||inv.roomCode)){
    showTab('stories');
    const ok=await ensureCoupleChroniclesLoaded();
    if(ok&&typeof window.joinCoupleStoryRoom==='function'){
      await window.joinCoupleStoryRoom({roomId:inv.roomId||'',roomCode:inv.roomCode||''});
    }
    return;
  }

  // Always fetch live room directly from Firestore (never rely only on local mpRooms or pass code as id!)
  if((inv.roomId||inv.roomCode) && typeof window.joinAndOpenWaitingLobby==='function'){
    const joined=await window.joinAndOpenWaitingLobby({
      roomId:inv.roomId||'',
      roomCode:inv.roomCode||'',
      gameId:inv.gameId||'',
      mode:inv.mode||'',
      stake:Number(inv.stake||0)
    });
    if(joined)return;
    return;
  }

  if(inv.roomCode && typeof joinMultiplayerRoomByCode==='function'){
    showTab('games');
    joinMultiplayerRoomByCode(inv.roomCode);
    return;
  }
  showTab('games');
  toast(`Opening ${inv.gameName||'Arena'} (${inv.roomCode||'Live'})`);
}
window.joinFromInvitePayload=joinFromInvitePayload;

function sendUniversalRoomInviteToDm(friend, payload){
  if(!friend||!friend.uid)return false;
  const targetUid=String(friend.uid);
  const p=payload||{};
  const roomCode=String(p.roomCode||'').trim().toUpperCase();
  const gameId=String(p.gameId||'room').trim().toLowerCase();
  const isParty=p.type==='party'||gameId==='party';
  const url=buildRoomInviteUrl({type:isParty?'party':'game',gameId,roomCode,roomId:p.roomId,mode:p.mode});
  const gameName=p.gameName||(gameId==='couple_chronicles'?'Couple Chronicles':gameId==='budget_clash'?'Budget Clash':gameId==='couple_arena'?'Couple & Bestie Arena':gameId==='ludo'?'Ludo Royal 3D':gameId==='number_match'?'Number Match':gameId==='jackaroo'?'Jackaroo Royal':gameId==='uno'?'UNO Clash':isParty?'Voice Party Room':'Game Room');
  const txt=p.text||`${isParty?'🎙️':'🎮'} Join my ${gameName}${p.mode?' ('+p.mode.toUpperCase()+')':''}${Number(p.stake||0)>0?' · '+p.stake+' 🪙':''}! Room Code: ${roomCode} ${url}`;
  const msgId='dm_inv_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  const msgObj={
    id:msgId,
    from:uid,
    to:targetUid,
    fromName:me.name||'Player',
    type:isParty?'party_invite':'game_invite',
    text:txt,
    roomCode,
    roomId:p.roomId||'',
    gameId,
    gameName,
    mode:p.mode||'',
    stake:Number(p.stake||0),
    url,
    ts:Date.now()
  };
  if(typeof chats!=='undefined'&&chats){
    if(!chats[targetUid])chats[targetUid]={id:targetUid,name:friend.name||'Friend',uid:targetUid,messages:[]};
    chats[targetUid].messages.push({...msgObj,from:'me'});
    if(chats[targetUid].messages.length>120)chats[targetUid].messages=chats[targetUid].messages.slice(-120);
    if(typeof saveChats==='function')saveChats();
    if(typeof cur!=='undefined'&&cur===targetUid&&typeof renderThread==='function')renderThread();
    if(typeof renderChats==='function')renderChats();
  }
  if(online&&db&&F){
    dbOp(()=>F.setDoc(F.doc(db,'dm_messages',msgId),msgObj));
  }
  return true;
}
window.sendUniversalRoomInviteToDm=sendUniversalRoomInviteToDm;

async function spectateUserMatch(targetUidOrUser){
  const u=typeof targetUidOrUser==='string'?resolvePlayerForProfile(targetUidOrUser):targetUidOrUser;
  if(!u)return toast('Player not found');
  const act=getUserLiveActivity(u);
  if(!act.isOnline||!act.canSpectate){
    return toast(`${u.name||'Player'} is not in a live match right now`);
  }
  if(typeof playSfx==='function')playSfx('tap');
  if(act.type==='party'&&act.roomId&&typeof openPartyRoomModal==='function'){
    showTab('tools');
    openPartyRoomModal(act.roomId);
    return;
  }
  const code=act.roomCode||('SP'+Math.floor(1000+Math.random()*9000));
  const gid=act.gameId||'ludo';
  if(typeof ensureGameModule==='function'){
    const ok=await ensureGameModule(gid);
    if(!ok)return;
  }
  if(gid==='ludo'&&typeof launchLudoGame==='function'){
    launchLudoGame({stake:0,rival:u,mode:act.mode==='1v1'?'1v1':'4p',roomCode:code,spectate:true,spectateHost:u});
    return;
  }
  if(gid==='number_match'&&typeof launchNumberMatch==='function'){
    launchNumberMatch({stake:0,rival:u,mode:act.mode==='duel'?'duel':'classic',roomCode:code,spectate:true,spectateHost:u});
    return;
  }
  if(gid==='jackaroo'&&typeof launchJackaroo==='function'){
    launchJackaroo(0,u,act.mode==='1v1'?'1v1':'2v2','standard',code,{spectate:true,spectateHost:u});
    return;
  }
  if(gid==='uno'&&typeof launchUnoGame==='function'){
    launchUnoGame(0,u,act.mode||'classic','standard',code,{spectate:true,spectateHost:u});
    return;
  }
  if(typeof launchLudoGame==='function'){
    launchLudoGame({stake:0,rival:u,mode:'4p',roomCode:code,spectate:true,spectateHost:u});
  }else{
    toast(`Viewing ${u.name||'Player'}'s match (${act.label})`);
  }
}
window.spectateUserMatch=spectateUserMatch;

function createInGameChatWidget(opts){
  const o=opts||{};
  const roomCode=String(o.roomCode||'ROOM').toUpperCase();
  const gameId=String(o.gameId||'game');
  const spectate=Boolean(o.spectate);
  const storageKey=`sg_gchat_${gameId}_${roomCode}`;
  const rawQuick=Array.isArray(o.quickLines)&&o.quickLines.length?o.quickLines:(Array.isArray(o.quickMessages)&&o.quickMessages.length?o.quickMessages:null);
  const quickLines=rawQuick||[
    'Nice move! 🔥','Good luck! 🍀','Watch this! 😎','GG! 👏','Haha 😂','Hurry up! ⚡'
  ];
  let messages=ls.get(storageKey,[]);
  if(!Array.isArray(messages))messages=[];
  if(!messages.length){
    messages.push({
      id:'sys_0',
      system:true,
      name:'Table',
      text:spectate?`You joined Room ${roomCode} as a Spectator 👁️`:`In-game chat ready · Room ${roomCode}`,
      ts:Date.now()
    });
  }
  let expanded=false;
  let hostEl=null;
  let destroyed=false;

  const persist=()=>{
    try{ls.set(storageKey,messages.slice(-40));}catch{}
  };

  const renderMessagesList=()=>{
    if(!hostEl||destroyed)return;
    const logEl=hostEl.querySelector('[data-gc-log]');
    const previewEl=hostEl.querySelector('[data-gc-preview]');
    const last=messages[messages.length-1];
    if(previewEl&&last){
      previewEl.innerHTML=last.system
        ? `<span class="gc-sys">${esc(last.text)}</span>`
        : `<b>${esc(last.name)}:</b> ${esc(last.text)}`;
    }
    if(logEl){
      logEl.innerHTML=messages.slice(-24).map(m=>m.system
        ? `<div class="gc-line sys">${esc(m.text)}</div>`
        : `<div class="gc-line ${m.uid===uid?'me':''}"><span class="gc-who">${esc(m.name)}${m.spectate?' <em>(Viewer)</em>':''}:</span> <span class="gc-txt">${esc(m.text)}</span></div>`
      ).join('');
      logEl.scrollTop=logEl.scrollHeight;
    }
  };

  const pushMessage=(name, text, meta={})=>{
    if(destroyed)return;
    const clean=String(text||'').trim().slice(0,140);
    if(!clean)return;
    const item={
      id:'gm_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),
      uid:meta.uid||uid,
      name:String(name||me.name||'You'),
      text:clean,
      spectate:Boolean(meta.spectate),
      system:Boolean(meta.system),
      ts:Date.now()
    };
    messages.push(item);
    if(messages.length>50)messages=messages.slice(-50);
    persist();
    renderMessagesList();
    if(typeof o.onMessage==='function')o.onMessage(item);
    if(typeof o.onSend==='function'&&item.uid===uid&&!item.system)o.onSend(item.text,item);
  };

  const mount=(container)=>{
    if(!container||destroyed)return;
    hostEl=container;
    hostEl.innerHTML=`
      <div class="sg-gchat-box" data-testid="ingame-chat-box">
        <div class="sg-gchat-drawer" data-gc-drawer hidden>
          <div class="sg-gchat-head">
            <b>💬 Table Chat · ${esc(roomCode)}</b>
            <button type="button" class="sg-gc-x" data-gc-toggle="0" aria-label="Collapse chat">✕</button>
          </div>
          <div class="sg-gchat-log" data-gc-log></div>
          <div class="sg-gchat-quick">
            ${quickLines.map(q=>`<button type="button" class="sg-gc-qbtn" data-gc-quick="${esc(q)}">${esc(q)}</button>`).join('')}
          </div>
        </div>
        <div class="sg-gchat-bar">
          <button type="button" class="sg-gc-toggle-btn" data-gc-toggle="1" title="Toggle chat history" aria-label="Toggle in-game chat">💬</button>
          <div class="sg-gc-preview" data-gc-preview data-gc-toggle="1"></div>
          <input type="text" class="sg-gc-input" data-gc-input placeholder="${spectate?'Cheer players…':'Message table…'}" maxlength="120" autocomplete="off" aria-label="In-game chat message">
          <button type="button" class="sg-gc-send" data-gc-send aria-label="Send in-game message">Send</button>
        </div>
      </div>
    `;
    renderMessagesList();
    const drawer=hostEl.querySelector('[data-gc-drawer]');
    const input=hostEl.querySelector('[data-gc-input]');

    const submit=()=>{
      if(!input)return;
      const val=input.value.trim();
      if(!val)return;
      input.value='';
      if(typeof playSfx==='function')playSfx('chatSend');
      pushMessage(me.name||'You',val,{uid,spectate});
    };

    hostEl.onclick=(e)=>{
      const tog=e.target.closest('[data-gc-toggle]');
      if(tog&&drawer){
        expanded=tog.dataset.gcToggle==='0'?false:!expanded;
        drawer.hidden=!expanded;
        if(expanded)renderMessagesList();
        return;
      }
      const qBtn=e.target.closest('[data-gc-quick]');
      if(qBtn){
        if(typeof playSfx==='function')playSfx('chatSend');
        pushMessage(me.name||'You',qBtn.dataset.gcQuick,{uid,spectate});
        return;
      }
      if(e.target.closest('[data-gc-send]')){
        submit();
      }
    };
    if(input){
      input.onkeydown=(ev)=>{
        if(ev.key==='Enter'){ev.preventDefault();submit();}
      };
    }
  };

  const destroy=()=>{
    destroyed=true;
    if(hostEl){hostEl.onclick=null;hostEl=null;}
  };

  return {mount,pushMessage,destroy};
}
window.createInGameChatWidget=createInGameChatWidget;

function openPublicProfile(targetUid){
  const devViewer=isDevSession();
  if(targetUid==='developer'||targetUid===DEV_UID){
    const realDev=allUsers().find(x=>isDevAccount(x))||{uid:DEV_UID,name:'Developer',avatar:'🦊',frame:'none',banner:'bn-aurora',tags:['Developer','LVL 99']};
    const isSelfDev=realDev.uid===uid;
    const gwHtml=typeof renderGiftWallHtml==='function'?renderGiftWallHtml(realDev,isSelfDev):'';
    const m=modal('Developer Profile',`
      <div class="bn-box ${esc(realDev.banner||'bn-aurora')}"><div class="pf">${av(realDev,74)}<b>${styledName(realDev)}</b>${renderTags(['Developer','LVL 99'],realDev)}</div></div>
      <div class="row" style="margin-top:10px">
        <button class="btn" id="pmDev" style="flex:1">Message Developer</button>
        ${!isSelfDev&&typeof openGiftSendModal==='function'?`<button class="btn gold" id="pmDevGift" style="flex:1">Send Gift</button>`:''}
      </div>
      ${gwHtml}
    `,'pub-prof-sheet');
    $('#pmDev',m).onclick=()=>{m.close();showTab('chat');openThread('developer')};
    if($('#pmDevGift',m))$('#pmDevGift',m).onclick=()=>openGiftSendModal(realDev.uid,{targetName:realDev.name||'Developer'});
    if(typeof bindGiftWallEvents==='function')bindGiftWallEvents(m,realDev,isSelfDev);
    return;
  }
  const u=resolvePlayerForProfile(targetUid);if(!u)return toast('Player not found');
  const self=u.uid===uid, fr=isFriend(u.uid);
  if(!self)recordProfileVisitor(u.uid);
  const canSeeWallet=self||devViewer;
  const gwStats=typeof getGiftWallStatsForUser==='function'?getGiftWallStatsForUser(u):{totalCharm:u.charm||0,totalReceivedCount:0};
  const walletMarkup=canSeeWallet
    ? `<span class="wp-pill gold" data-wallet-visible="1">🪙 ${fmtNum(u.coins)}</span>`
    : '';
  const gwHtml=typeof renderGiftWallHtml==='function'?renderGiftWallHtml(u,self):'';
  const likedByMe=Array.isArray(u.likedBy)&&u.likedBy.includes(uid);
  const likesCnt=Math.max(Array.isArray(u.likedBy)?u.likedBy.length:0,Number(u.likesCount||0));
  const bondsHtml=typeof renderBondsGridHtml==='function'?renderBondsGridHtml(u,self):'';
  const genderChip=u.gender==='male'?'<span class="wp-gender m">♂</span>':(u.gender==='female'?'<span class="wp-gender f">♀</span>':'');
  const flag=getRegionFlag(u.region||'India');
  const liveAct=getUserLiveActivity(u);

  const m=modal('Profile',`
    <div class="wp-prof-cover bn-box ${esc(u.banner||'bn-aurora')}">
      <div class="wp-prof-top">
        <div class="sg-av-presence-wrap">
          ${av(u,74)}
          ${liveAct.isOnline?'<span class="sg-online-dot lg" title="Online"></span>':''}
        </div>
        <div class="wp-prof-id">
          <div class="wp-prof-name-row">
            <b>${styledName(u)}</b>
            <span>${flag}</span>
            ${genderChip}
          </div>
          <div class="wp-prof-pills">
            ${renderOnlineActivityBadge(u)}
            <span class="wp-pill lv">Lv.${fmtNum(calcLevel(u.exp),MAX_LEVEL)}</span>
            <span class="wp-pill charm">💎 ${fmtNum(gwStats.totalCharm)}</span>
            ${u.clanTag?`<span class="wp-pill clan">[${esc(u.clanTag)}]</span>`:''}
            ${walletMarkup}
          </div>
          <div class="wp-prof-sub">
            <button type="button" class="wp-id-copy" id="pfCopyId">ID ${esc(String(u.uid||'').slice(-8))} ⧉</button>
            <span>❤️ ${fmtNum(likesCnt)}</span>
            <span>+${fmtNum(getUserTodayPts(u))} Today</span>
          </div>
        </div>
      </div>
      ${renderTags(u.tags,u)}
    </div>

    ${!self&&liveAct.canSpectate?`
      <div class="sg-prof-live-card">
        <div class="sg-plc-info">
          <span class="sg-live-pulse">LIVE</span>
          <div>
            <b>${esc(liveAct.label)}</b>
            <small>${liveAct.roomCode?`Room ${esc(liveAct.roomCode)}`:'Live session in progress'}</small>
          </div>
        </div>
        <button type="button" class="btn sm ok" id="pfSpectateTop">👁️ View / Spectate</button>
      </div>
    `:''}

    ${u.bio?`<div class="wp-sig-box"><span class="${esc(u.bioStyle||'')}">${esc(u.bio)}</span></div>`:''}

    ${bondsHtml}

    ${devViewer&&!self?`<div class="dev-wallet-summary" data-dev-coin-panel="1">
      <div><small>DEV WALLET</small><b>${fmtNum(u.coins)} 🪙</b></div>
      <div class="dev-wallet-pills"><span>EXP ${fmtNum(u.exp,MAX_EXP)}</span><span>·</span><span>Charm ${fmtNum(gwStats.totalCharm)}</span><span>·</span><span>Gifts ${fmtNum(gwStats.totalReceivedCount||0)}</span>${u.banned?'<span>·</span><b style="color:var(--red)">BANNED</b>':''}${isMutedNow(u)?'<span>·</span><b style="color:var(--gold)">MUTED</b>':''}</div>
    </div>`:''}

    ${gwHtml}

    ${!self?`<div class="wp-prof-sticky-bar">
      <div class="wp-prof-mini-acts">
        <button type="button" class="wp-mini-btn ${fr?'on':''}" id="pfAdd">${fr?'✓ Friend':'+ Friend'}</button>
        <button type="button" class="wp-mini-btn ${likedByMe?'liked':''}" id="pfLike">${likedByMe?'❤️':'🤍'} ${fmtNum(likesCnt)}</button>
        ${liveAct.canSpectate?'<button type="button" class="wp-mini-btn on" id="pfSpectate">👁️ View</button>':''}
        <button type="button" class="wp-mini-btn" id="pfChallenge">⚔️ Duel</button>
        <button type="button" class="wp-mini-btn bad" id="pfReport">🚩</button>
      </div>
      <div class="wp-prof-dual-cta">
        <button type="button" class="wp-cta-gift" id="pfGift">🎁 Send Gift</button>
        <button type="button" class="wp-cta-chat" id="pfMsg">💬 Chat</button>
      </div>
    </div>`:''}
  `,'pub-prof-sheet');

  if($('#pfCopyId',m))$('#pfCopyId',m).onclick=()=>copyTextClean(u.uid,'UID');
  $$('[data-open-bonds]',m).forEach(el=>{
    el.onclick=()=>{if(typeof openBondsShowcaseModal==='function')openBondsShowcaseModal(u)};
  });
  $$('[data-unlock-bond]',m).forEach(el=>{
    el.onclick=()=>{
      if(typeof openGiftSendModal==='function')openGiftSendModal(u.uid,{targetName:u.name,preselectGiftId:'g_ring_silver'});
    };
  });
  if(typeof bindGiftWallEvents==='function')bindGiftWallEvents(m,u,self);

  if(devViewer&&!self){
    const giftOpts=typeof GIFT_CATALOG!=='undefined'
      ? GIFT_CATALOG.slice().reverse().map(g=>`<option value="${esc(g.id)}">${esc(g.name)} (${fmtNum(g.price)} 🪙 · +${fmtNum(g.charm)} Charm)</option>`).join('')
      : '';
    $('.sb',m).insertAdjacentHTML('beforeend',`
      <div class="card pf-dev-wallet" data-dev-controls="1">
        <div class="row" style="justify-content:space-between;margin-bottom:6px">
          <b style="color:var(--gold)">Developer Moderation & Stats</b>
          <span class="p-tag p-tag-dev-sig" style="font-size:10px;padding:2px 8px">DEV ONLY</span>
        </div>

        <label style="margin-top:6px">Coins (Add or Subtract)</label>
        <div class="row">
          <input id="dvCoin" type="number" placeholder="e.g. 50000 or -500" style="flex:1">
          <button type="button" class="btn sm gold" id="dvAdj">Apply</button>
        </div>

        <label style="margin-top:8px">Today Leaderboard Coins & EXP</label>
        <div class="row">
          <input id="dvTodayVal" type="number" placeholder="Set Today Pts" style="flex:1">
          <button type="button" class="btn sm ghost" id="dvTodaySet">Set Today</button>
          <input id="dvExpDelta" type="number" placeholder="+/- EXP" style="width:92px">
          <button type="button" class="btn sm ghost" id="dvExpBtn">EXP</button>
        </div>

        <label style="margin-top:8px">Charm (Add, Remove, or Reset)</label>
        <div class="row">
          <input id="dvCharm" type="number" placeholder="e.g. 1000 or -500" style="flex:1">
          <button type="button" class="btn sm" id="dvCharmAdj">Apply</button>
          <button type="button" class="btn ghost sm" id="dvCharmReset">Reset 0</button>
        </div>

        <label style="margin-top:8px">VIP Pass Grant</label>
        <div class="row wrap" style="gap:6px">
          <button type="button" class="btn sm ghost" id="dvVipSilver">Silver 7D</button>
          <button type="button" class="btn sm gold" id="dvVipGold">Gold 7D</button>
          <button type="button" class="btn sm" id="dvVipRoyal">Royal 7D</button>
          <button type="button" class="btn sm red" id="dvVipRevoke">Revoke</button>
        </div>

        ${giftOpts?`
          <label style="margin-top:8px">Gift Wall (Add or Remove Gifts)</label>
          <select id="dvGiftSel">${giftOpts}</select>
          <div class="row" style="margin-top:6px">
            <input id="dvGiftQty" type="number" value="1" min="1" max="999" style="width:84px" aria-label="Gift quantity">
            <button type="button" class="btn sm ok" id="dvGiftAdd" style="flex:1">+ Add Gift</button>
            <button type="button" class="btn sm red" id="dvGiftRem" style="flex:1">− Remove Gift</button>
          </div>
          <button type="button" class="btn ghost sm full" id="dvGiftClear" style="margin-top:6px">Clear Entire Gift Wall</button>
        `:''}

        <label style="margin-top:8px">Official Warning & Mute Cooldown</label>
        <div class="row">
          <input id="dvWarnReason" placeholder="Warning reason..." style="flex:1">
          <button type="button" class="btn sm gold" id="dvWarnBtn">Send Warning</button>
        </div>
        <div class="row wrap" style="gap:6px;margin-top:6px">
          <button type="button" class="btn sm ghost" data-dv-mute="15">Mute 15m</button>
          <button type="button" class="btn sm ghost" data-dv-mute="60">Mute 1h</button>
          <button type="button" class="btn sm ghost" data-dv-mute="360">Mute 6h</button>
          <button type="button" class="btn sm ghost" data-dv-mute="1440">Mute 24h</button>
          <button type="button" class="btn sm ok" data-dv-mute="0">Unmute</button>
        </div>

        <label style="margin-top:8px">Timed / Permanent Ban</label>
        <input id="dvBanReason" placeholder="Ban reason shown to user..." value="${esc(u.banReason||'')}">
        <div class="row wrap" style="gap:6px;margin-top:6px">
          <select id="dvBanDur" style="flex:1">
            <option value="1">1 Hour</option>
            <option value="6">6 Hours</option>
            <option value="24" selected>24 Hours</option>
            <option value="72">3 Days</option>
            <option value="168">7 Days</option>
            <option value="720">30 Days</option>
            <option value="perm">Permanent</option>
          </select>
          <button type="button" class="btn sm red" id="dvBanApply">Apply Ban</button>
          ${u.banned?`<button type="button" class="btn sm ok" id="dvUnbanBtn">Unban</button>`:''}
        </div>

        <label style="margin-top:8px">Exclusive Top 1–3 Access</label>
        <div class="row wrap" style="gap:6px">
          <button type="button" class="btn sm gold" id="dvGrant1">Grant Top #1</button>
          <button type="button" class="btn sm ghost" id="dvGrant2">Top #2</button>
          <button type="button" class="btn sm ghost" id="dvGrant3">Top #3</button>
          <button type="button" class="btn sm red" id="dvRevokeTop">Revoke</button>
        </div>

        <div class="row" style="margin-top:10px">
          <button type="button" class="btn ghost sm full" id="dvResetZero">${UI_SVG.reset} Reset Coins/EXP to 0</button>
        </div>
      </div>
    `);
    $('#dvAdj',m).onclick=()=>{const n=Math.trunc(+$('#dvCoin',m).value);if(!n)return toast('Enter coin amount');devAdjustUserCoins(u.uid,n);m.close();openPublicProfile(u.uid)};
    $('#dvTodaySet',m).onclick=()=>{devSetUserTodayCoins(u.uid,+$('#dvTodayVal',m).value||0);m.close();openPublicProfile(u.uid)};
    $('#dvExpBtn',m).onclick=()=>{const n=Math.trunc(+$('#dvExpDelta',m).value);if(!n)return toast('Enter EXP');devAdjustUserExp(u.uid,n);m.close();openPublicProfile(u.uid)};
    $('#dvCharmAdj',m).onclick=()=>{const n=Math.trunc(+$('#dvCharm',m).value);if(!n)return toast('Enter Charm amount');devAdjustUserCharm(u.uid,n);m.close();openPublicProfile(u.uid)};
    $('#dvCharmReset',m).onclick=()=>{devResetUserCharm(u.uid);m.close();openPublicProfile(u.uid)};
    $('#dvVipSilver',m).onclick=()=>{devGrantVip(u.uid,'silver',7);m.close();openPublicProfile(u.uid)};
    $('#dvVipGold',m).onclick=()=>{devGrantVip(u.uid,'gold',7);m.close();openPublicProfile(u.uid)};
    $('#dvVipRoyal',m).onclick=()=>{devGrantVip(u.uid,'royal',7);m.close();openPublicProfile(u.uid)};
    $('#dvVipRevoke',m).onclick=()=>{devGrantVip(u.uid,'',0);m.close();openPublicProfile(u.uid)};
    if($('#dvGiftAdd',m)){
      $('#dvGiftAdd',m).onclick=()=>{const gid=$('#dvGiftSel',m).value,q=Math.max(1,Math.trunc(+$('#dvGiftQty',m).value||1));devAdjustUserGift(u.uid,gid,q);m.close();openPublicProfile(u.uid)};
      $('#dvGiftRem',m).onclick=()=>{const gid=$('#dvGiftSel',m).value,q=Math.max(1,Math.trunc(+$('#dvGiftQty',m).value||1));devAdjustUserGift(u.uid,gid,-q);m.close();openPublicProfile(u.uid)};
      $('#dvGiftClear',m).onclick=()=>{devClearUserGiftWall(u.uid);m.close();openPublicProfile(u.uid)};
    }
    $('#dvWarnBtn',m).onclick=()=>{devSendWarning(u.uid,$('#dvWarnReason',m).value.trim()||'Please follow community guidelines.');m.close();openPublicProfile(u.uid)};
    $$('[data-dv-mute]',m).forEach(btn=>{btn.onclick=()=>{devSetMute(u.uid,Number(btn.dataset.dvMute));m.close();openPublicProfile(u.uid)}});
    $('#dvBanApply',m).onclick=()=>{
      const dur=$('#dvBanDur',m).value;
      const reason=$('#dvBanReason',m).value.trim()||'Violation of community guidelines.';
      devSetBan(u.uid,dur==='perm'?'perm':Number(dur),reason);
      m.close();openPublicProfile(u.uid);
    };
    if($('#dvUnbanBtn',m))$('#dvUnbanBtn',m).onclick=()=>{devSetBan(u.uid,'unban');m.close();openPublicProfile(u.uid)};
    $('#dvGrant1',m).onclick=()=>{devGrantTopRankSet(u.uid,1,1);m.close();openPublicProfile(u.uid)};
    $('#dvGrant2',m).onclick=()=>{devGrantTopRankSet(u.uid,2,1);m.close();openPublicProfile(u.uid)};
    $('#dvGrant3',m).onclick=()=>{devGrantTopRankSet(u.uid,3,1);m.close();openPublicProfile(u.uid)};
    $('#dvRevokeTop',m).onclick=()=>{devRevokeTopRankSet(u.uid);m.close();openPublicProfile(u.uid)};
    $('#dvResetZero',m).onclick=()=>{devResetUserProgress(u.uid);m.close();openPublicProfile(u.uid)};
  }
  if($('#pfAdd',m))$('#pfAdd',m).onclick=()=>{toggleFriend(u.uid);m.close();openPublicProfile(u.uid)};
  if($('#pfMsg',m))$('#pfMsg',m).onclick=()=>{
    if(!chats[u.uid])chats[u.uid]={id:u.uid,name:u.name||'Player',uid:u.uid,messages:[]};
    saveChats();m.close();showTab('chat');openThread(u.uid);
  };
  if($('#pfGift',m))$('#pfGift',m).onclick=()=>{
    if(typeof openGiftSendModal==='function'){
      openGiftSendModal(u.uid,{targetName:u.name,onSent:()=>{m.close();openPublicProfile(u.uid)}});
    }
  };
  if($('#pfLike',m))$('#pfLike',m).onclick=()=>{toggleProfileLike(u.uid);m.close();openPublicProfile(u.uid)};
  const onSpec=()=>{m.close();spectateUserMatch(u);};
  if($('#pfSpectate',m))$('#pfSpectate',m).onclick=onSpec;
  if($('#pfSpectateTop',m))$('#pfSpectateTop',m).onclick=onSpec;
  if($('#pfChallenge',m))$('#pfChallenge',m).onclick=()=>{
    m.close();
    if(typeof openRivalChallenge==='function')openRivalChallenge(u.uid);
    else{showTab('games');toast('Select an Arena game to challenge '+(u.name||'Player'));}
  };
  if($('#pfReport',m))$('#pfReport',m).onclick=()=>{
    if(typeof openReportModal==='function')openReportModal({targetUid:u.uid,targetName:u.name||'Player',context:'profile'});
    else toast('Report module loading...');
  };
}

let activeAppTab='tools';
let sgExitConfirmEl=null;

function pushBackGuardState(tag){
  try{
    if(!history.state||!history.state.sgBackGuard){
      history.replaceState({sgBackGuard:true,base:true},'');
    }
    history.pushState({sgBackGuard:true,tag:tag||'nav',ts:Date.now()},'');
  }catch{}
}

function closeCuteExitConfirm(){
  if(sgExitConfirmEl){
    sgExitConfirmEl.remove();
    sgExitConfirmEl=null;
  }
}

function showCuteExitConfirm(){
  closeCuteExitConfirm();
  const wrap=document.createElement('div');
  wrap.id='sgExitConfirm';
  wrap.className='sg-exit-backdrop';
  wrap.setAttribute('role','dialog');
  wrap.setAttribute('aria-modal','true');
  wrap.setAttribute('aria-label','Exit Study Game Confirmation');
  wrap.innerHTML=`
    <div class="sg-exit-card">
      <div class="sg-exit-face" aria-hidden="true">🥺</div>
      <b>Leaving so soon?</b>
      <p>Your squad &amp; daily streak will miss you! Stay a little longer?</p>
      <div class="sg-exit-acts">
        <button type="button" class="btn gold" id="sgStayBtn">Stay &amp; Play</button>
        <button type="button" class="btn ghost" id="sgExitYesBtn">Exit</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  sgExitConfirmEl=wrap;
  $('#sgStayBtn',wrap).onclick=()=>{
    if(typeof playSfx==='function')playSfx('tap');
    closeCuteExitConfirm();
    pushBackGuardState('stay');
  };
  $('#sgExitYesBtn',wrap).onclick=()=>{
    closeCuteExitConfirm();
    toast('Bye for now! See you soon 🥺');
    try{history.go(-2)}catch{}
  };
  wrap.addEventListener('click',e=>{
    if(e.target===wrap){closeCuteExitConfirm();pushBackGuardState('stay')}
  });
}

function handleAppBack(){
  /* 1. Close exit confirm if open */
  if(sgExitConfirmEl){
    closeCuteExitConfirm();
    pushBackGuardState('dismiss-exit');
    return 'close-exit-confirm';
  }
  /* 2. Close topmost modal (e.g. Profile -> Edit Profile -> Back returns to Profile) */
  const openModals=$$('#modals .mb');
  if(openModals.length){
    const top=openModals[openModals.length-1];
    if(typeof top.close==='function')top.close();
    else top.remove();
    pushBackGuardState('after-modal');
    return 'close-modal';
  }
  /* 3. Close Dedicated Full-Screen Game View */
  const gameRoot=$('#gameFsRoot');
  if(gameRoot&&!gameRoot.hidden){
    if(typeof closeFullScreenGameView==='function')closeFullScreenGameView();
    pushBackGuardState('after-game');
    return 'close-game-view';
  }
  /* 4. Minimize Full-Screen Voice/Video Party Room into Floating VR Icon Mode */
  const partyRoot=$('#partyFsRoot');
  if(partyRoot&&!partyRoot.hidden){
    if(typeof minimizePartyRoom==='function')minimizePartyRoom();
    else if(typeof closePartyRoom==='function')closePartyRoom();
    pushBackGuardState('after-party-minimize');
    return 'minimize-party-room';
  }
  /* 4. Close DM / World Chat thread (returns to Chat list) */
  const thr=$('#thread');
  if(thr&&!thr.hidden){
    thr.hidden=true;
    if(typeof cur!=='undefined')cur=null;
    if(typeof renderChats==='function')renderChats();
    pushBackGuardState('after-thread');
    return 'close-chat-thread';
  }
  /* 5. Close Student Tools Drawer if currently open */
  const drawer=$('#toolsDrawer');
  if(drawer&&drawer.classList.contains('open')){
    if(typeof closeToolsDrawer==='function')closeToolsDrawer();
    pushBackGuardState('after-drawer');
    return 'close-tools-drawer';
  }
  /* 6. Any non-Home tab (Profile, Chat, Games, etc.) returns straight to Home (never drops back into Student Tool) */
  if(activeAppTab!=='tools'){
    showTab('tools',{fromBack:true});
    pushBackGuardState('home');
    return 'go-home';
  }
  /* 7. Already on Home -> show cute slightly sad exit confirmation popup */
  showCuteExitConfirm();
  pushBackGuardState('exit-prompt');
  return 'show-exit-confirm';
}
window.handleAppBack=handleAppBack;

window.addEventListener('popstate',()=>{
  handleAppBack();
});

/* ===== On-Demand Script & Game Module Loader (Lazy Load Heavy Engines) ===== */
const _loadedScriptPromises=new Map();
function loadScriptOnce(src){
  const cleanSrc=String(src||'').trim();
  if(!cleanSrc)return Promise.resolve(true);
  const basePath=cleanSrc.split('?')[0];
  if(_loadedScriptPromises.has(basePath))return _loadedScriptPromises.get(basePath);
  const existing=[...document.scripts].find(s=>{
    const attr=s.getAttribute('src')||'';
    return attr.split('?')[0]===basePath;
  });
  if(existing){
    const p=Promise.resolve(true);
    _loadedScriptPromises.set(basePath,p);
    return p;
  }
  const p=new Promise((resolve,reject)=>{
    const el=document.createElement('script');
    el.src=cleanSrc;
    el.async=false;
    el.onload=()=>resolve(true);
    el.onerror=()=>{
      _loadedScriptPromises.delete(basePath);
      reject(new Error('Failed to load module: '+basePath));
    };
    document.head.appendChild(el);
  });
  _loadedScriptPromises.set(basePath,p);
  return p;
}
window.loadScriptOnce=loadScriptOnce;

const GAME_MODULE_BUNDLES={
  ludo:['ludo-rules.js?v=35','ludo.js?v=35'],
  number_match:['number-match-rules.js?v=35','number-match.js?v=35'],
  jackaroo:['jackaroo-rules.js?v=35','jackaroo.js?v=35'],
  uno:['uno-rules.js?v=35','uno.js?v=35'],
  pool_8ball:['pool-8ball.js?v=35'],
  chess_blitz:['chess-arena.js?v=35'],
  tile_race:['voice-narrator.js?v=35','arcade-games.js?v=35'],
  trap_door:['voice-narrator.js?v=35','arcade-games.js?v=35'],
  mind_clash:['voice-narrator.js?v=35','arcade-games.js?v=35'],
  pocket_territory:['voice-narrator.js?v=35','arcade-games.js?v=35'],
  budget_clash:['voice-narrator.js?v=35','budget-clash.js?v=35'],
  couple_arena:['voice-narrator.js?v=35','budget-clash.js?v=35','couple-arena.js?v=35'],
  couple_mind_sync:['voice-narrator.js?v=35','budget-clash.js?v=35','couple-arena.js?v=35'],
  couple_truth_dare:['voice-narrator.js?v=35','budget-clash.js?v=35','couple-arena.js?v=35'],
  couple_most_likely:['voice-narrator.js?v=35','budget-clash.js?v=35','couple-arena.js?v=35'],
  couple_love_meter:['voice-narrator.js?v=35','budget-clash.js?v=35','couple-arena.js?v=35']
};

const GAME_MODULE_SYMBOLS={
  ludo:'launchLudoGame',
  number_match:'launchNumberMatch',
  jackaroo:'launchJackaroo',
  uno:'launchUnoGame',
  pool_8ball:'launchPool8BallPro',
  chess_blitz:'launchChessBlitzArena',
  tile_race:'launchTileRace',
  trap_door:'launchTrapDoorDuel',
  mind_clash:'launchMindClash',
  pocket_territory:'launchPocketTerritory',
  budget_clash:'launchBudgetClash',
  couple_arena:'launchCoupleArena',
  couple_mind_sync:'launchCoupleArena',
  couple_truth_dare:'launchCoupleArena',
  couple_most_likely:'launchCoupleArena',
  couple_love_meter:'launchCoupleArena'
};

async function ensureGameModule(gameId){
  const gid=String(gameId||'').trim().toLowerCase();
  const files=GAME_MODULE_BUNDLES[gid];
  if(!files||!files.length)return true;
  const expectedFn=GAME_MODULE_SYMBOLS[gid];
  if(expectedFn&&typeof window[expectedFn]==='function')return true;
  try{
    for(const f of files){
      await loadScriptOnce(f);
    }
    if(expectedFn&&typeof window[expectedFn]!=='function'){
      // Retry once with fresh cache-busting query if a stale cached script missed exports
      const bust='&r='+Date.now();
      for(const f of files){
        const base=f.split('?')[0];
        _loadedScriptPromises.delete(base);
        [...document.scripts].forEach(s=>{if((s.getAttribute('src')||'').split('?')[0]===base)s.remove()});
        await loadScriptOnce(f+bust);
      }
    }
    return !expectedFn||typeof window[expectedFn]==='function';
  }catch(err){
    console.warn('ensureGameModule error:',err);
    if(typeof toast==='function')toast('Could not load game module. Check connection & try again.');
    return false;
  }
}
window.ensureGameModule=ensureGameModule;

let _chroniclesLoadPromise=null;
async function ensureCoupleChroniclesLoaded(){
  if(typeof window.renderCoupleChroniclesHub==='function'&&typeof window.StoryRules!=='undefined'&&Array.isArray(window.STORIES_CATALOG)){
    return true;
  }
  if(_chroniclesLoadPromise)return _chroniclesLoadPromise;
  const files=['voice-narrator.js?v=35','story-rules.js?v=35','story-data.js?v=35','story.js?v=35'];
  _chroniclesLoadPromise=(async ()=>{
    try{
      for(const f of files){
        await loadScriptOnce(f);
      }
      return typeof window.renderCoupleChroniclesHub==='function';
    }catch(err){
      console.warn('ensureCoupleChroniclesLoaded error:',err);
      _chroniclesLoadPromise=null;
      if(typeof toast==='function')toast('Could not load Couple Chronicles. Check connection & retry.');
      return false;
    }
  })();
  return _chroniclesLoadPromise;
}
window.ensureCoupleChroniclesLoaded=ensureCoupleChroniclesLoaded;

/* ===== Page-By-Page On-Demand View Lifecycle & Active-Tab-Only Rendering ===== */
const appViewLifecycle=(window.ShowGamesRules&&typeof window.ShowGamesRules.createViewLifecycleManager==='function')
  ? window.ShowGamesRules.createViewLifecycleManager('tools')
  : (()=>{
      let active='tools';
      const mounted=new Set();
      const dirty=new Set(['tools','games','stories','ranking','tasks','store','chat','profile']);
      return {
        getActiveTab:()=>active,
        isMounted:t=>mounted.has(t),
        isDirty:t=>dirty.has(t),
        markDirty:tabs=>{const arr=Array.isArray(tabs)?tabs:[tabs];let hit=false;arr.forEach(t=>{if(t){dirty.add(t);if(t===active)hit=true}});return hit},
        markRendered:t=>{mounted.add(t);dirty.delete(t)},
        switchTab:t=>{const prev=active;active=t||'tools';return {prevTab:prev,nextTab:active,changed:prev!==active,shouldRender:!mounted.has(active)||dirty.has(active)}}
      };
    })();
window.appViewLifecycle=appViewLifecycle;

let _activeTabRaf=0;
function renderTabView(tab){
  const t=tab||activeAppTab||'tools';
  if(t==='tools'){
    if(typeof renderHome==='function')renderHome();
    else if(typeof renderHomeHub==='function')renderHomeHub();
  }else if(t==='games'){
    if(typeof renderGameSlots==='function')renderGameSlots();
  }else if(t==='stories'){
    const root=$('#coupleChroniclesRoot');
    if(typeof window.renderCoupleChroniclesHub==='function'){
      window.renderCoupleChroniclesHub();
    }else{
      if(root&&!root.innerHTML.trim()){
        root.innerHTML='<div class="cc-loading-shell"><div class="cc-loading-ring"></div><b>Opening Couple Chronicles…</b><small>Loading atmospheric chapters &amp; dual-choice engine</small></div>';
      }
      ensureCoupleChroniclesLoaded().then(ok=>{
        if(ok&&activeAppTab==='stories'&&typeof window.renderCoupleChroniclesHub==='function'){
          window.renderCoupleChroniclesHub();
        }
      });
    }
  }else if(t==='ranking'){
    if(typeof renderRanking==='function')renderRanking();
  }else if(t==='tasks'){
    if(typeof renderTasks==='function')renderTasks();
  }else if(t==='store'){
    if(typeof renderStore==='function')renderStore();
  }else if(t==='chat'){
    if(typeof cur!=='undefined'&&cur){
      if(typeof renderThread==='function')renderThread();
    }else if(typeof renderChats==='function'){
      renderChats();
    }
  }else if(t==='profile'){
    if(typeof buildProfile==='function')buildProfile();
  }
  appViewLifecycle.markRendered(t);
}
window.renderTabView=renderTabView;

function scheduleActiveTabRender(){
  if(_activeTabRaf)return;
  _activeTabRaf=requestAnimationFrame(()=>{
    _activeTabRaf=0;
    const curTab=activeAppTab||'tools';
    if(!appViewLifecycle.isMounted(curTab)||appViewLifecycle.isDirty(curTab)){
      renderTabView(curTab);
    }
  });
}

function markTabsDirty(tabs){
  const affectsActive=appViewLifecycle.markDirty(tabs);
  if(affectsActive)scheduleActiveTabRender();
  return affectsActive;
}
window.markTabsDirty=markTabsDirty;

function showTab(tab,opts){
  const o=opts||{};
  const nextTab=tab||'tools';
  const prevTab=activeAppTab||'tools';
  if(prevTab!==nextTab&&typeof window.pauseLauncherHeroTimer==='function'){
    window.pauseLauncherHeroTimer();
  }
  if(prevTab==='stories'&&nextTab!=='stories'&&typeof window.cleanupCoupleChronicles==='function'){
    window.cleanupCoupleChronicles();
  }
  activeAppTab=nextTab;
  /* Always close transient Student Tools Drawer & open Chat Thread when switching tabs so Back returns to Home */
  if(typeof closeToolsDrawer==='function')closeToolsDrawer();
  const thr=$('#thread');
  if(nextTab!=='chat'&&thr&&!thr.hidden){thr.hidden=true;if(typeof cur!=='undefined')cur=null}
  closeCuteExitConfirm();
  $$('#nav button').forEach(x=>x.classList.toggle('on',x.dataset.tab===activeAppTab));
  $$('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+activeAppTab));
  $('main').scrollTop=0;
  const info=typeof appViewLifecycle.switchTab==='function'
    ? appViewLifecycle.switchTab(activeAppTab)
    : {shouldRender:true};
  if(info.shouldRender){
    renderTabView(activeAppTab);
  }
  if(!o.fromBack&&activeAppTab!=='tools')pushBackGuardState('tab:'+activeAppTab);
}
$('#nav').onclick=e=>{const b=e.target.closest('[data-tab]');if(b){if(typeof playSfx==='function')playSfx('click');showTab(b.dataset.tab)}};
if($('#sfxBtn'))$('#sfxBtn').onclick=()=>{
  if(typeof SFX!=='undefined'){
    const isOff=SFX.toggle();
    toast(isOff?'Sound FX muted':'Sound FX enabled');
  }
};
/* Arm initial back-button guard sentinel once DOM loads */
try{pushBackGuardState('init')}catch{}
function renderAll(){
  markTabsDirty(['tools','games','stories','ranking','tasks','store','chat','profile']);
  if(typeof renderPoems==='function')renderPoems();
  if(typeof updateUnreadDots==='function')updateUnreadDots();
}
