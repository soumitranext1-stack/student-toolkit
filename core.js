"use strict";
const DEV_LOGIN_ID = "soumitranext1@gmail.com";
const DEV_UID = "DEV_SUDIPTA_99";
const DEV_AVATAR = "👑";
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const BAD_WORDS = ["fuck","bitch","asshole","bastard","madarchod","bhosdike","chutiya","lund","randi","sex","porn"];

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);

function fmtNum(n){
  const v=Number(n||0), abs=Math.abs(v);
  if(abs>=1000000000)return (v/1000000000).toFixed(abs%1000000000===0?0:1).replace(/\.0$/,'')+'B';
  if(abs>=1000000)return (v/1000000).toFixed(abs%1000000===0?0:1).replace(/\.0$/,'')+'M';
  return String(Math.round(v));
}
function toast(t){$$('.toast').forEach(x=>x.remove());const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2200)}

let themeMode=localStorage.getItem('sg_theme')||'dark';
function applyTheme(){document.body.classList.toggle('light',themeMode==='light');$('#themeBtn').textContent=themeMode==='light'?'☀️':'🌙';localStorage.setItem('sg_theme',themeMode)}
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
te:{home:'హోమ్',games:'గేమ్స్',rank:'ర్యాంక్',tasks:'టాస్క్‌లు',store:'స్టోర్',chat:'చాట్',profile:'ప్రొఫైల్',tools:'విద్యార్థి టూల్స్',poems:'కవితలు & రచనల గోడ',req:'కవిత పంపండి',gamesH:'గేమ్స్ హబ్',lb:'రోజువారీ లీడర్‌బోర్డ్',d5:'రోజువారీ 5 టాస్క్‌లు',storeH:'స్టోర్',msgs:'సందేశాలు',addf:'స్నేహితుని జోడించు',yp:'మీ ప్రొఫైల్',streak:'రోజుల స్ట్రీక్'}
};
const tr=k=>(I18N[langKey]&&I18N[langKey][k])||I18N.en[k]||k;
const NAV_KEYS={tools:'home',games:'games',ranking:'rank',tasks:'tasks',store:'store',chat:'chat',profile:'profile'};
function applyLang(){
  const l=LANGS[langKey]||LANGS.en;$('#langCode').textContent=l.code;document.documentElement.lang=langKey;
  $$('[data-i]').forEach(e=>e.textContent=tr(e.dataset.i));
  $$('#nav [data-tab]').forEach(b=>{$('em',b).textContent=tr(NAV_KEYS[b.dataset.tab])});
  localStorage.setItem('sg_lang',langKey);
}
$('#langBtn').onclick=()=>{
  const m=modal('Select Language',Object.entries(LANGS).map(([k,v])=>`<button class="btn ${k===langKey?'':'ghost'} full" data-l="${k}">${esc(v.name)}</button>`).join(''));
  m.onclick=e=>{if(e.target.dataset.l){langKey=e.target.dataset.l;applyLang();buildProfile();m.close()}};
};

function openToolClean(href,stat){
  if(!href)return;
  if(!devMode){if(me.coins<5)return toast('Need 5 coins for tool export');addReward(-5,0,null,true)}
  stat=stat||(TOOLS.find(x=>x[0]===href)||[])[4];if(stat)bumpStat(stat);
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
const calcLevel=(exp)=>Math.max(1,Math.floor(Number(exp||0)/100)+1);

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
    lastLoginBonusDay:'',poemReqDay:'',usageSec:0,banned:false
  };
}

const FREE_TAGS=['Guest Pass','Newbie'];
const REF_PARAM=(new URLSearchParams(location.search).get('ref')||'').toUpperCase();
function normalizeProfile(p,targetUid){
  const isGuest=targetUid===guestUid;
  const o={...freshDefaultProfile(targetUid,isGuest),...JSON.parse(JSON.stringify(p||{})),uid:targetUid};
  ['dailyCoinsByDay','claimedByDay','tempUnlocks','unreadFrom','done'].forEach(k=>{if(!o[k]||typeof o[k]!=='object'||Array.isArray(o[k]))o[k]={}});
  o.friends=Array.isArray(o.friends)?o.friends:[];o.activeDays=Array.isArray(o.activeDays)?o.activeDays:[];
  if(!o.activeDays.includes(today()))o.activeDays.push(today());o.activeDays=o.activeDays.slice(-60);
  Object.keys(o.dailyCoinsByDay).sort().slice(0,-7).forEach(k=>delete o.dailyCoinsByDay[k]);
  o.coins=Number(o.coins||0);o.exp=Number(o.exp||0);o.streakDays=calcStreak(o.activeDays);
  if(isDevAccount(o)){o.avatar=DEV_AVATAR;o.frame='dev';o.tags=['Developer','LVL 99'];if(!o.banner||o.banner==='bn-aurora')o.banner='bn-dev'}
  else{
    const live=k=>Number(o.tempUnlocks[k]||0)>Date.now();
    if(o.avatar===DEV_AVATAR)o.avatar='🦊';
    if(o.frame==='dev'||(o.frame&&o.frame!=='none'&&!live('frame:'+o.frame)))o.frame='none';
    if(o.banner==='bn-dev'||(o.banner!=='bn-aurora'&&!live('banner:'+o.banner)))o.banner='bn-aurora';
    if(o.textStyle&&!live('text:'+o.textStyle))o.textStyle='';
    if(o.msgStyle&&!live('msg:'+o.msgStyle))o.msgStyle='';
    if(o.bioStyle&&!live('bio:'+o.bioStyle))o.bioStyle='';
    o.tags=(Array.isArray(o.tags)?o.tags:[]).filter(t=>FREE_TAGS.includes(t)||live('tag:'+t)).slice(0,3);
    if(!o.tags.length)o.tags=[isGuest?'Guest Pass':'Newbie'];
  }
  return o;
}
function calcStreak(days){const set=new Set(days||[]);let n=0;const d=new Date();while(set.has(d.toISOString().slice(0,10))){n++;d.setUTCDate(d.getUTCDate()-1)}return n}
let me=normalizeProfile(ls.get('sg_profile_'+uid,null),uid);
const saveMe=()=>ls.set('sg_profile_'+uid,me);

function getUserTodayPts(u){
  if(!u)return 0;
  const map=(u.uid===uid?me:u).dailyCoinsByDay;
  return map&&typeof map==='object'?Number(map[today()]||0):0;
}

function isDevAccount(u){return Boolean(u&&(u.uid===DEV_UID||String(u.accountId||'').toLowerCase()===DEV_LOGIN_ID))}
let devMode=isDevAccount(me);
function needLogin(what){if(devMode||me.accountType==='account')return false;toast('Register / Login to use '+what);return true}

function sanitizeUserAppearance(u){
  const copy={...(u||{})};
  if(isDevAccount(copy)){copy.avatar=DEV_AVATAR;copy.frame='dev'}
  else{if(copy.frame==='dev')copy.frame='none';if(copy.avatar===DEV_AVATAR)copy.avatar='🦊'}
  return copy;
}

function isUnlocked(key){
  if(key==='frame:dev')return devMode;
  if(devMode)return true;
  if(['frame:none','banner:bn-aurora','text:','msg:','bio:'].includes(key)||(key.startsWith('tag:')&&FREE_TAGS.includes(key.slice(4))))return true;
  return Number(me.tempUnlocks[key]||0)>Date.now();
}
function cleanExpiredUnlocks(){
  let ch=false;
  for(const [k,exp] of Object.entries(me.tempUnlocks||{})){
    if(Number(exp)<=Date.now()){
      delete me.tempUnlocks[k];
      if(me.frame&&k==='frame:'+me.frame)me.frame='none';
      if(me.textStyle&&k==='text:'+me.textStyle)me.textStyle='';
      if(me.msgStyle&&k==='msg:'+me.msgStyle)me.msgStyle='';if(me.bioStyle&&k==='bio:'+me.bioStyle)me.bioStyle='';if(me.banner&&k==='banner:'+me.banner)me.banner='bn-aurora';if(k.startsWith('tag:')){me.tags=(me.tags||[]).filter(x=>x!==k.slice(4));if(!me.tags.length)me.tags=[me.accountType==='account'?'Newbie':'Guest Pass']}
      ch=true;
    }
  }
  if(!devMode&&me.frame==='dev'){me.frame='none';ch=true}
  if(!devMode&&me.avatar===DEV_AVATAR){me.avatar='🦊';ch=true}
  if(devMode){me.frame='dev';me.avatar=DEV_AVATAR}
  if(ch)saveMe();
}

let stats=ls.get('sg_stats_'+uid,{calc_open:0,pdf_open:0,tool_open:0,profile_save:0,games_played:0,store_buy:0,ad_watch:0});
const saveStats=()=>ls.set('sg_stats_'+uid,stats);
function bumpStat(k){stats[k]=(stats[k]||0)+1;saveStats();renderTasks()}

let users=ls.get('sg_users_cache',[]);
let devInbox=ls.get('sg_dev_inbox',{});
let worldMsgs=ls.get('sg_world_msgs',[]);
let poems=ls.get('sg_poems_cache',[]);
let poemRequests=ls.get('sg_poem_requests_cache',[]);

const USER_FRAMES=[['none','Plain'],['top1_glow','No.1 Glow'],['flame','Fire Ring'],['wings','Royal Wings'],['crown','Crown'],['star','Starlight'],['neon','Neon'],['ice','Frost'],['rainbow','Rainbow']];
const BANNERS=[['bn-aurora','Aurora'],['bn-crimson','Crimson'],['bn-galaxy','Galaxy'],['bn-solar','Solar'],['bn-emerald','Emerald'],['bn-midnight','Midnight'],['bn-rose','Rose'],['bn-ocean','Ocean'],['bn-sunrise','Sunrise'],['bn-candy','Candy']];
const TEXTS=[['','Normal'],['anim-firetxt','Fire'],['anim-royal-txt','Royal'],['anim-neon-txt','Neon'],['anim-gold-txt','Gold'],['anim-ice-txt','Ice'],['anim-berry-txt','Berry'],['anim-mint-txt','Mint'],['anim-sunset-txt','Sunset'],['anim-lava-txt','Lava'],['anim-aqua-txt','Aqua']];
const MSGS=[['','Normal Msg'],['msg-glow-gold','Gold'],['msg-glow-cyan','Cyan'],['msg-glow-rose','Rose'],['msg-glow-violet','Violet'],['msg-glow-green','Green'],['msg-glow-orange','Orange']];
const BIOS=[['','Normal'],['bio-gold','Gold'],['bio-cyan','Cyan'],['bio-pink','Pink'],['bio-rainbow','Rainbow']];
const USER_AVATARS=['🦊','🐼','🐯','🦉','🐙','🚀','🧠','🎮','⚡','🔥','🌟','🐲'];

function frameSvgBase(fr){
  if(fr==='dev')return `<svg class="ring-svg spin-cw" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#ffd36b" stroke-width="3.8" stroke-dasharray="16 6"/><polygon points="34,11 42,2 50,10 58,2 66,11 61,18 39,18" fill="#ff4d6a" stroke="#ffd36b" stroke-width="1.4"/></svg><span class="f-top-tag">DEV 99</span>`;
  if(fr==='top1_glow')return `<svg class="ring-svg pulse-fx" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#ffd36b" stroke-width="3.6" stroke-dasharray="18 6"/><polygon points="34,12 42,2 50,10 58,2 66,12 61,18 39,18" fill="#ffd36b" stroke="#78350f" stroke-width="1.4"/></svg><span class="f-top-tag">NO.1</span>`;
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
const av=(rawU,s=44)=>{const isDev=isDevAccount(rawU),u=isDev?{avatar:DEV_AVATAR,frame:'dev'}:sanitizeUserAppearance(rawU||{});return `<div class="av-wrap ${u.frame==='top1_glow'?'top1-glow-wrap':''}" style="--s:${s}px">${frameSvg(u.frame||'none')}<div class="av"><span>${esc(u.avatar||'🙂')}</span></div></div>`};
const styledName=(u)=>`<span class="${esc(u.textStyle||'')}">${esc(u.name||'Player')}</span>`;
function renderTags(tags){return `<div class="tag-grid">${(Array.isArray(tags)&&tags.length?tags:['Study Boy']).map(tg=>`<span class="p-tag">${esc(tg)}</span>`).join('')}</div>`}

let F=null,db=null,online=false;
function setStatus(ok){online=ok;const s=$('#st');s.classList.toggle('on',ok);$('em',s).textContent=ok?'Live':'Local mode'}
const userRef=id=>F.doc(db,'users',id);
function dbOp(fn){if(!online||!db)return;try{Promise.resolve(fn()).catch(()=>{})}catch{}}
const base=()=>({uid,name:me.name,bio:me.bio,hobbies:me.hobbies,avatar:me.avatar,frame:me.frame,banner:me.banner,textStyle:me.textStyle,msgStyle:me.msgStyle,bioStyle:me.bioStyle||'',streakDays:calcStreak(me.activeDays),activeDays:me.activeDays,tags:me.tags,accountType:me.accountType,accountId:me.accountId,exp:me.exp,dailyCoinsByDay:me.dailyCoinsByDay,claimedByDay:me.claimedByDay,friends:me.friends,tempUnlocks:me.tempUnlocks,lastSeen:Date.now()});
function patchUser(id,obj){let u=users.find(x=>x.uid===id);if(!u){u={uid:id};users.push(u)}Object.assign(u,obj);ls.set('sg_users_cache',users)}
function checkBan(){$('#banBox').hidden=!me.banned;$('#banUid').textContent=uid}
function getClaimedToday(){return me.claimedByDay[today()]||[]}
function updateHud(){$$('.coinval').forEach(e=>e.textContent=fmtNum(me.coins));$$('.lvlval').forEach(e=>e.textContent=calcLevel(me.exp))}

function checkDailyLoginBonus(){
  const d=today();
  if(me.lastLoginBonusDay===d)return;
  me.lastLoginBonusDay=d;saveMe();
  addReward(15,10);toast('Daily login bonus: +15 coins!');
}

function addReward(coinsDelta, expDelta, taskId, noLb){
  if(me.banned)return;
  const cDelta=Number(coinsDelta||0), eDelta=Number(expDelta||0);
  me.coins=Math.max(0,Number(me.coins||0)+cDelta);
  me.exp=Math.max(0,Number(me.exp||0)+eDelta);
  const d=today();
  if(cDelta>0&&!noLb)me.dailyCoinsByDay[d]=Number(me.dailyCoinsByDay[d]||0)+cDelta;
  if(taskId){me.claimedByDay[d]=me.claimedByDay[d]||[];if(!me.claimedByDay[d].includes(taskId))me.claimedByDay[d].push(taskId)}
  saveMe();patchUser(uid,{...base(),coins:me.coins});updateHud();renderRanking();
  dbOp(()=>F.setDoc(userRef(uid),{...base(),coins:me.coins,exp:me.exp,dailyCoinsByDay:me.dailyCoinsByDay,claimedByDay:me.claimedByDay},{merge:true}));
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
  b.innerHTML=`<div class="sheet ${cls}"><div class="sh"><h3>${title}</h3><button class="x">✕</button></div><div class="sb">${html}</div></div>`;
  $('#modals').appendChild(b);b.close=()=>{b.remove();b.onclose&&b.onclose()};$('.x',b).onclick=b.close;b.addEventListener('click',e=>{if(e.target===b)b.close()});return b;
}

function openRewardAd(onDone){
  const m=modal('Reward Ad',`<div class="ad"><div class="adbox">📺 Reward Ad</div><p id="adt">Ad ends in 15s</p><button class="btn ghost full" id="adskip" disabled>Skip in 5s</button></div>`);
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
  saveMe();patchUser(uid,{friends:me.friends});renderChats();
}

function openPublicProfile(targetUid){
  if(targetUid==='developer'||targetUid===DEV_UID){
    return modal('Developer Profile',`<div class="bn-box bn-dev"><div class="pf">${av({uid:DEV_UID,avatar:DEV_AVATAR,frame:'dev'},74)}<b>Developer</b><div class="tags"><span class="tg d">DEV</span><span class="tg l">LVL 99</span></div></div></div><button class="btn full" id="pmDev">Message Developer</button>`).querySelector('#pmDev').onclick=function(){this.closest('.mb').remove();openThread('developer')};
  }
  const u=allUsers().find(x=>x.uid===targetUid);if(!u)return toast('Player not found');
  const self=u.uid===uid, fr=isFriend(u.uid);
  const m=modal('Player Profile',`
    <div class="bn-box ${esc(u.banner||'bn-aurora')}">
      <div class="pf">${av(u,74)}<b style="font-size:18px">${styledName(u)}</b><small>LVL ${calcLevel(u.exp)} · UID: ${esc(u.uid)}</small></div>
      <div style="text-align:center;margin-top:4px"><span class="chip">🪙 ${fmtNum(u.coins)}</span> · <span class="exp-chip">Today: ${fmtNum(getUserTodayPts(u))} 🪙</span></div>
      ${renderTags(u.tags)}
    </div>
    <div class="card" style="margin-top:10px;font-size:13px"><div><b>Bio:</b> <span class="${esc(u.bioStyle||'')}">${esc(u.bio||'—')}</span></div>${u.streakDays?`<div>🔥 ${u.streakDays} ${tr('streak')}</div>`:''}<div><b>Hobbies:</b> ${esc(u.hobbies||'—')}</div></div>
    ${!self?`<div class="row" style="margin-top:10px"><button class="btn ${fr?'ghost':''}" id="pfAdd" style="flex:1">${fr?'Friends ✓':'Add Friend'}</button><button class="btn" id="pfMsg" style="flex:1" ${fr||devMode?'':'disabled'}>Message</button></div>`:''}
  `);
  if(devMode&&!self){
    $('.sb',m).insertAdjacentHTML('beforeend',`<div class="card" style="margin-top:10px;border-color:var(--gold)"><b style="color:var(--gold)">Developer tools</b><div class="row" style="margin-top:8px"><input id="dvCoin" type="number" placeholder="± coins" style="flex:1"><button class="btn sm" id="dvAdj">Apply</button></div><button class="btn ${u.banned?'ok':'red'} full" id="dvBan">${u.banned?'Unban':'Ban'} user</button></div>`);
    $('#dvAdj',m).onclick=()=>{
      const n=Math.trunc(+$('#dvCoin',m).value);if(!n)return;
      const nc=Math.max(0,Number(u.coins||0)+n);
      if(u.uid===uid){me.coins=nc;saveMe();updateHud()}
      patchUser(u.uid,{coins:nc});
      dbOp(()=>F.setDoc(userRef(u.uid),{coins:nc},{merge:true}));
      toast('Coins '+(n>0?'+':'')+n);m.close();openPublicProfile(u.uid);
    };
    $('#dvBan',m).onclick=()=>{
      const b=!u.banned;
      if(u.uid===uid){me.banned=b;saveMe();checkBan()}
      patchUser(u.uid,{banned:b});
      dbOp(()=>F.setDoc(userRef(u.uid),{banned:b},{merge:true}));
      toast(b?'User banned':'User unbanned');m.close();openPublicProfile(u.uid);
    };
  }
  if($('#pfAdd',m))$('#pfAdd',m).onclick=()=>{toggleFriend(u.uid);m.close();openPublicProfile(u.uid)};
  if($('#pfMsg',m))$('#pfMsg',m).onclick=()=>{if(!chats[u.uid])chats[u.uid]={id:u.uid,name:u.name||'Player',uid:u.uid,messages:[]};saveChats();m.close();openThread(u.uid)};
}

function showTab(tab){
  $$('#nav button').forEach(x=>x.classList.toggle('on',x.dataset.tab===tab));
  $$('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+tab));
  $('main').scrollTop=0;
}
$('#nav').onclick=e=>{const b=e.target.closest('[data-tab]');if(b)showTab(b.dataset.tab)};
function renderAll(){renderRanking();renderTasks();renderStore();renderPoems();if(!cur)renderChats()}
y]||0)>Date.now();
}
function cleanExpiredUnlocks(){
  let ch=false;
  for(const [k,exp] of Object.entries(me.tempUnlocks||{})){
    if(Number(exp)<=Date.now()){
      delete me.tempUnlocks[k];
      if(me.frame&&k==='frame:'+me.frame)me.frame='none';
      if(me.textStyle&&k==='text:'+me.textStyle)me.textStyle='';
      if(me.msgStyle&&k==='msg:'+me.msgStyle)me.msgStyle='';if(me.bioStyle&&k==='bio:'+me.bioStyle)me.bioStyle='';if(me.banner&&k==='banner:'+me.banner)me.banner='bn-aurora';if(k.startsWith('tag:')){me.tags=(me.tags||[]).filter(x=>x!==k.slice(4));if(!me.tags.length)me.tags=[me.accountType==='account'?'Newbie':'Guest Pass']}
      ch=true;
    }
  }
  if(!devMode&&me.frame==='dev'){me.frame='none';ch=true}
  if(!devMode&&me.avatar===DEV_AVATAR){me.avatar='🦊';ch=true}
  if(devMode){me.frame='dev';me.avatar=DEV_AVATAR}
  if(ch)saveMe();
}

let stats=ls.get('sg_stats_'+uid,{calc_open:0,pdf_open:0,tool_open:0,profile_save:0,games_played:0,store_buy:0,ad_watch:0});
const saveStats=()=>ls.set('sg_stats_'+uid,stats);
function bumpStat(k){stats[k]=(stats[k]||0)+1;saveStats();renderTasks()}

let users=ls.get('sg_users_cache',[]);
let devInbox=ls.get('sg_dev_inbox',{});
let worldMsgs=ls.get('sg_world_msgs',[]);
let poems=ls.get('sg_poems_cache',[]);
let poemRequests=ls.get('sg_poem_requests_cache',[]);

const USER_FRAMES=[['none','Plain'],['top1_glow','No.1 Glow'],['flame','Fire Ring'],['wings','Royal Wings'],['crown','Crown'],['star','Starlight'],['neon','Neon'],['ice','Frost'],['rainbow','Rainbow']];
const BANNERS=[['bn-aurora','Aurora'],['bn-crimson','Crimson'],['bn-galaxy','Galaxy'],['bn-solar','Solar'],['bn-emerald','Emerald'],['bn-midnight','Midnight'],['bn-rose','Rose'],['bn-ocean','Ocean'],['bn-sunrise','Sunrise'],['bn-candy','Candy']];
const TEXTS=[['','Normal'],['anim-firetxt','Fire'],['anim-royal-txt','Royal'],['anim-neon-txt','Neon'],['anim-gold-txt','Gold'],['anim-ice-txt','Ice'],['anim-berry-txt','Berry'],['anim-mint-txt','Mint'],['anim-sunset-txt','Sunset'],['anim-lava-txt','Lava'],['anim-aqua-txt','Aqua']];
const MSGS=[['','Normal Msg'],['msg-glow-gold','Gold'],['msg-glow-cyan','Cyan'],['msg-glow-rose','Rose'],['msg-glow-violet','Violet'],['msg-glow-green','Green'],['msg-glow-orange','Orange']];
const BIOS=[['','Normal'],['bio-gold','Gold'],['bio-cyan','Cyan'],['bio-pink','Pink'],['bio-rainbow','Rainbow']];
const USER_AVATARS=['🦊','🐼','🐯','🦉','🐙','🚀','🧠','🎮','⚡','🔥','🌟','🐲'];

function frameSvgBase(fr){
  if(fr==='dev')return `<svg class="ring-svg spin-cw" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#ffd36b" stroke-width="3.8" stroke-dasharray="16 6"/><polygon points="34,11 42,2 50,10 58,2 66,11 61,18 39,18" fill="#ff4d6a" stroke="#ffd36b" stroke-width="1.4"/></svg><span class="f-top-tag">DEV 99</span>`;
  if(fr==='top1_glow')return `<svg class="ring-svg pulse-fx" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#ffd36b" stroke-width="3.6" stroke-dasharray="18 6"/><polygon points="34,12 42,2 50,10 58,2 66,12 61,18 39,18" fill="#ffd36b" stroke="#78350f" stroke-width="1.4"/></svg><span class="f-top-tag">NO.1</span>`;
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
const av=(rawU,s=44)=>{const isDev=isDevAccount(rawU),u=isDev?{avatar:DEV_AVATAR,frame:'dev'}:sanitizeUserAppearance(rawU||{});return `<div class="av-wrap ${u.frame==='top1_glow'?'top1-glow-wrap':''}" style="--s:${s}px">${frameSvg(u.frame||'none')}<div class="av"><span>${esc(u.avatar||'🙂')}</span></div></div>`};
const styledName=(u)=>`<span class="${esc(u.textStyle||'')}">${esc(u.name||'Player')}</span>`;
function renderTags(tags){return `<div class="tag-grid">${(Array.isArray(tags)&&tags.length?tags:['Study Boy']).map(tg=>`<span class="p-tag">${esc(tg)}</span>`).join('')}</div>`}

let F=null,db=null,online=false;
function setStatus(ok){online=ok;const s=$('#st');s.classList.toggle('on',ok);$('em',s).textContent=ok?'Live':'Local mode'}
const userRef=id=>F.doc(db,'users',id);
function dbOp(fn){if(!online||!db)return;try{Promise.resolve(fn()).catch(()=>{})}catch{}}
const base=()=>({uid,name:me.name,bio:me.bio,hobbies:me.hobbies,avatar:me.avatar,frame:me.frame,banner:me.banner,textStyle:me.textStyle,msgStyle:me.msgStyle,bioStyle:me.bioStyle||'',streakDays:calcStreak(me.activeDays),activeDays:me.activeDays,tags:me.tags,accountType:me.accountType,accountId:me.accountId,exp:me.exp,dailyCoinsByDay:me.dailyCoinsByDay,claimedByDay:me.claimedByDay,friends:me.friends,tempUnlocks:me.tempUnlocks,lastSeen:Date.now()});
function patchUser(id,obj){let u=users.find(x=>x.uid===id);if(!u){u={uid:id};users.push(u)}Object.assign(u,obj);ls.set('sg_users_cache',users)}
function checkBan(){$('#banBox').hidden=!me.banned;$('#banUid').textContent=uid}
function getClaimedToday(){return me.claimedByDay[today()]||[]}
function updateHud(){$$('.coinval').forEach(e=>e.textContent=fmtNum(me.coins));$$('.lvlval').forEach(e=>e.textContent=calcLevel(me.exp))}

function checkDailyLoginBonus(){
  const d=today();
  if(me.lastLoginBonusDay===d)return;
  me.lastLoginBonusDay=d;saveMe();
  addReward(15,10);toast('Daily login bonus: +15 coins!');
}

function addReward(coinsDelta, expDelta, taskId, noLb){
  if(me.banned)return;
  const cDelta=Number(coinsDelta||0), eDelta=Number(expDelta||0);
  me.coins=Math.max(0,Number(me.coins||0)+cDelta);
  me.exp=Math.max(0,Number(me.exp||0)+eDelta);
  const d=today();
  if(cDelta>0&&!noLb)me.dailyCoinsByDay[d]=Number(me.dailyCoinsByDay[d]||0)+cDelta;
  if(taskId){me.claimedByDay[d]=me.claimedByDay[d]||[];if(!me.claimedByDay[d].includes(taskId))me.claimedByDay[d].push(taskId)}
  saveMe();patchUser(uid,{...base(),coins:me.coins});updateHud();renderRanking();
  dbOp(()=>F.setDoc(userRef(uid),{...base(),coins:me.coins,exp:me.exp,dailyCoinsByDay:me.dailyCoinsByDay,claimedByDay:me.claimedByDay},{merge:true}));
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
  b.innerHTML=`<div class="sheet ${cls}"><div class="sh"><h3>${title}</h3><button class="x">✕</button></div><div class="sb">${html}</div></div>`;
  $('#modals').appendChild(b);b.close=()=>{b.remove();b.onclose&&b.onclose()};$('.x',b).onclick=b.close;b.addEventListener('click',e=>{if(e.target===b)b.close()});return b;
}

function openRewardAd(onDone){
  const m=modal('Reward Ad',`<div class="ad"><div class="adbox">📺 Reward Ad</div><p id="adt">Ad ends in 15s</p><button class="btn ghost full" id="adskip" disabled>Skip in 5s</button></div>`);
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
  saveMe();patchUser(uid,{friends:me.friends});renderChats();
}

function openPublicProfile(targetUid){
  if(targetUid==='developer'||targetUid===DEV_UID){
    return modal('Developer Profile',`<div class="bn-box bn-dev"><div class="pf">${av({uid:DEV_UID,avatar:DEV_AVATAR,frame:'dev'},74)}<b>Developer</b><div class="tags"><span class="tg d">DEV</span><span class="tg l">LVL 99</span></div></div></div><button class="btn full" id="pmDev">Message Developer</button>`).querySelector('#pmDev').onclick=function(){this.closest('.mb').remove();openThread('developer')};
  }
  const u=allUsers().find(x=>x.uid===targetUid);if(!u)return toast('Player not found');
  const self=u.uid===uid, fr=isFriend(u.uid);
  const m=modal('Player Profile',`
    <div class="bn-box ${esc(u.banner||'bn-aurora')}">
      <div class="pf">${av(u,74)}<b style="font-size:18px">${styledName(u)}</b><small>LVL ${calcLevel(u.exp)} · UID: ${esc(u.uid)}</small></div>
      <div style="text-align:center;margin-top:4px"><span class="chip">🪙 ${fmtNum(u.coins)}</span> · <span class="exp-chip">Today: ${fmtNum(getUserTodayPts(u))} 🪙</span></div>
      ${renderTags(u.tags)}
    </div>
    <div class="card" style="margin-top:10px;font-size:13px"><div><b>Bio:</b> <span class="${esc(u.bioStyle||'')}">${esc(u.bio||'—')}</span></div>${u.streakDays?`<div>🔥 ${u.streakDays} ${tr('streak')}</div>`:''}<div><b>Hobbies:</b> ${esc(u.hobbies||'—')}</div></div>
    ${!self?`<div class="row" style="margin-top:10px"><button class="btn ${fr?'ghost':''}" id="pfAdd" style="flex:1">${fr?'Friends ✓':'Add Friend'}</button><button class="btn" id="pfMsg" style="flex:1" ${fr||devMode?'':'disabled'}>Message</button></div>`:''}
  `);
  if(devMode&&!self){
    $('.sb',m).insertAdjacentHTML('beforeend',`<div class="card" style="margin-top:10px;border-color:var(--gold)"><b style="color:var(--gold)">Developer tools</b><div class="row" style="margin-top:8px"><input id="dvCoin" type="number" placeholder="± coins" style="flex:1"><button class="btn sm" id="dvAdj">Apply</button></div><button class="btn ${u.banned?'ok':'red'} full" id="dvBan">${u.banned?'Unban':'Ban'} user</button></div>`);
    $('#dvAdj',m).onclick=()=>{const n=Math.trunc(+$('#dvCoin',m).value);if(!n)return;const nc=Math.max(0,Number(u.coins||0)+n);patchUser(u.uid,{coins:nc});dbOp(()=>F.setDoc(userRef(u.uid),{coins:nc},{merge:true}));toast('Coins '+(n>0?'+':'')+n);m.close();openPublicProfile(u.uid)};
    $('#dvBan',m).onclick=()=>{const b=!u.banned;patchUser(u.uid,{banned:b});dbOp(()=>F.setDoc(userRef(u.uid),{banned:b},{merge:true}));toast(b?'User banned':'User unbanned');m.close();openPublicProfile(u.uid)};
  }
  if($('#pfAdd',m))$('#pfAdd',m).onclick=()=>{toggleFriend(u.uid);m.close();openPublicProfile(u.uid)};
  if($('#pfMsg',m))$('#pfMsg',m).onclick=()=>{if(!chats[u.uid])chats[u.uid]={id:u.uid,name:u.name||'Player',uid:u.uid,messages:[]};saveChats();m.close();openThread(u.uid)};
}

function showTab(tab){
  $$('#nav button').forEach(x=>x.classList.toggle('on',x.dataset.tab===tab));
  $$('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+tab));
  $('main').scrollTop=0;
}
$('#nav').onclick=e=>{const b=e.target.closest('[data-tab]');if(b)showTab(b.dataset.tab)};
function renderAll(){renderRanking();renderTasks();renderStore();renderPoems();if(!cur)renderChats()}
