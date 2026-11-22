"use strict";
/* Shared helpers for all Study Game mini games (safe coin/EXP capping, Google auth check, Sound FX, Gift return) */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const rnd=n=>Math.floor(Math.random()*n);
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=rnd(i+1);[b[i],b[j]]=[b[j],b[i]]}return b};
function toast(t){$$('.toast').forEach(x=>x.remove());const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2600)}
function modal(html){const m=document.createElement('div');m.className='mb';m.innerHTML=`<div class="sheet">${html}</div>`;document.body.appendChild(m);m.close=()=>m.remove();return m}
if(localStorage.getItem('sg_theme')==='light')document.body.classList.add('light');

/* Shared Lightweight Web Audio SFX synced with main app Mute/Unmute preference */
let gkAudioCtx=null;
function gkIsMuted(){try{return localStorage.getItem('sg_sfx_muted')==='1'}catch{return false}}
function gkPlaySfx(kind){
  if(gkIsMuted())return;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  if(!gkAudioCtx){try{gkAudioCtx=new AC()}catch{return}}
  if(gkAudioCtx.state==='suspended')gkAudioCtx.resume().catch(()=>{});
  const tone=(f,off,dur,tp='sine',g=0.08)=>{
    try{
      const now=gkAudioCtx.currentTime+off,o=gkAudioCtx.createOscillator(),gn=gkAudioCtx.createGain();
      o.type=tp;o.frequency.setValueAtTime(f,now);
      gn.gain.setValueAtTime(0.0001,now);
      gn.gain.exponentialRampToValueAtTime(g,now+0.015);
      gn.gain.exponentialRampToValueAtTime(0.0001,now+dur);
      o.connect(gn);gn.connect(gkAudioCtx.destination);o.start(now);o.stop(now+dur+0.02);
    }catch{}
  };
  if(kind==='coin'){tone(988,0,0.08,'triangle',0.08);tone(1318.5,0.06,0.16,'sine',0.09)}
  else if(kind==='win'){[587.3,740,880,1174.7].forEach((f,i)=>tone(f,i*0.065,0.2,'triangle',0.085))}
  else if(kind==='good'){tone(660,0,0.07,'triangle',0.07);tone(990,0.05,0.11,'sine',0.08)}
  else if(kind==='bad'){tone(250,0,0.1,'sawtooth',0.045)}
  else tone(740,0,0.04,'sine',0.045);
}

/* Inject compact Sound FX mute toggle into standalone mini-game headers */
(function mountMiniGameSfxBtn(){
  const hdr=$('header');
  if(!hdr||$('#gkSfxBtn'))return;
  const btn=document.createElement('button');
  btn.id='gkSfxBtn';btn.type='button';btn.className='ib';
  const sync=()=>{
    const m=gkIsMuted();
    btn.setAttribute('aria-label',m?'Unmute Sound FX':'Mute Sound FX');
    btn.title=m?'Sound FX: Muted':'Sound FX: On';
    btn.innerHTML=m
      ?'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>'
      :'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';
  };
  btn.onclick=()=>{
    const next=!gkIsMuted();
    try{localStorage.setItem('sg_sfx_muted',next?'1':'0')}catch{}
    sync();
    if(!next)gkPlaySfx('click');
  };
  sync();
  const coinEl=$('.coin');
  if(coinEl)hdr.insertBefore(btn,coinEl);
  else hdr.appendChild(btn);
})();

const MAX_COINS=999999999, MAX_EXP=99999900;
const DAILY_CAP=20;
let uid=localStorage.getItem('sg_uid')||('SG'+Math.floor(10000000+Math.random()*89999999));
let PK='sg_profile_'+uid,isGuest=true,db=null,S=null;

function clampInt(v,min,max){const n=Number(v);if(!Number.isFinite(n))return min;return Math.trunc(Math.min(max,Math.max(min,n)))}
function fmtCoins(v){
  const n=clampInt(v,0,MAX_COINS);
  if(n>=1e9)return (n/1e9).toFixed(1).replace(/\.0$/,'')+'B';
  if(n>=1e6)return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  if(n>=1e4)return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K';
  return String(n);
}

function getProf(){
  try{const p=JSON.parse(localStorage.getItem(PK)||'null');if(p)return p}catch{}
  const p={uid,name:'Guest '+uid.slice(-4),avatar:'🦊',coins:50,exp:0,lastSeen:Date.now()};
  localStorage.setItem(PK,JSON.stringify(p));return p;
}
function showCoins(){const e=$('#coins');if(e)e.textContent=fmtCoins(getProf().coins)}
function addReward(coins,exp){
  const p=getProf();
  p.coins=clampInt(Number(p.coins||0)+Number(coins||0),0,MAX_COINS);
  p.exp=clampInt(Number(p.exp||0)+Number(exp||0),0,MAX_EXP);
  p.lastSeen=Date.now();
  if(coins>0){
    p.dailyCoinsByDay=p.dailyCoinsByDay&&typeof p.dailyCoinsByDay==='object'?p.dailyCoinsByDay:{};
    p.dailyCoinsByDay[today()]=clampInt(Number(p.dailyCoinsByDay[today()]||0)+coins,0,MAX_COINS);
  }
  localStorage.setItem(PK,JSON.stringify(p));
  if(db&&S){
    const o={uid,name:p.name,avatar:p.avatar||'🦊',coins:p.coins,exp:p.exp,lastSeen:p.lastSeen};
    if(p.dailyCoinsByDay)o.dailyCoinsByDay=p.dailyCoinsByDay;
    S.setDoc(S.doc(db,'users',uid),o,{merge:true}).catch(()=>{});
  }
  showCoins();
}
function bumpPlayed(){
  try{const k='sg_stats_'+uid,st=JSON.parse(localStorage.getItem(k)||'{}');st.games_played=(st.games_played||0)+1;localStorage.setItem(k,JSON.stringify(st))}catch{}
}

const CFG={apiKey:"AIzaSyA5rrpi1fe6YCkLkBxUVz3vJNDlcUTiRHA",authDomain:"study-game-8ce0c.firebaseapp.com",projectId:"study-game-8ce0c",storageBucket:"study-game-8ce0c.firebasestorage.app",messagingSenderId:"1042366074383",appId:"1:1042366074383:web:a53806b5d7dcc621e89d7a"};
async function initFb(){
  try{
    const A=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    S=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const AU=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
    const app=A.initializeApp(CFG);db=S.getFirestore(app);const auth=AU.getAuth(app);
    let u=await new Promise(res=>{const un=AU.onAuthStateChanged(auth,x=>{un();res(x)})});
    if(!u)u=(await AU.signInAnonymously(auth)).user;
    const hasGoogle=Array.isArray(u.providerData)&&u.providerData.some(p=>p&&p.providerId==='google.com');
    uid=u.uid;PK='sg_profile_'+uid;isGuest=u.isAnonymous||!hasGoogle;localStorage.setItem('sg_uid',uid);
  }catch{S=null;db=null}
}
const ready=initFb().then(showCoins);

async function award(gameId,wantCoins,wantExp){
  await ready;
  bumpPlayed();
  const k=`gk_${uid}_${gameId}_${today()}`,got=Number(localStorage.getItem(k)||0);
  const coins=isGuest?0:Math.max(0,Math.min(wantCoins,DAILY_CAP-got));
  localStorage.setItem(k,String(got+coins));
  addReward(coins,Math.max(0,Math.min(40,wantExp)));
  if(coins>0)gkPlaySfx('coin');
  else gkPlaySfx('win');
  return {coins,capped:!isGuest&&wantCoins>coins,guest:isGuest&&wantCoins>0};
}
function result(o){
  const r=o.r||{coins:0};
  const coinTxt=r.guest?'Sign in with Google in Study Game to earn coins':(r.coins>0?`+${r.coins} 🪙 earned`:(r.capped?'Daily coin cap reached (20 🪙/game)':'No coins earned this round'));
  const m=modal(`<div class="big">${o.emoji||'🏁'}</div><h2>${esc(o.title)}</h2>${(o.lines||[]).map(l=>`<p class="mu">${esc(l)}</p>`).join('')}<p style="margin-top:10px;font-weight:700">${esc(coinTxt)}</p><button class="btn full" id="rA">Play again</button><button class="btn ghost full" id="rG">Send Gift to a Player</button><button class="btn ghost full" id="rMp">Join Live Multiplayer Room</button><button class="btn ghost full" id="rM">Menu</button><button class="btn ghost full" id="rB">Back to Study Game</button>`);
  $('#rA').onclick=()=>{gkPlaySfx('click');m.close();o.again()};
  $('#rG').onclick=()=>{try{sessionStorage.setItem('sg_return','games');sessionStorage.setItem('sg_open_gift','1')}catch{}location.href='index.html'};
  $('#rMp').onclick=()=>{try{sessionStorage.setItem('sg_return','games')}catch{}location.href='index.html'};
  $('#rM').onclick=()=>{gkPlaySfx('click');m.close();o.menu()};
  $('#rB').onclick=()=>location.href='index.html';
}
function pick(sel,cb){$(sel).onclick=e=>{const b=e.target.closest('button');if(!b)return;$$(sel+' button').forEach(x=>x.classList.toggle('on',x===b));gkPlaySfx('click');cb(b.dataset.v)}}
const bestGet=k=>Number(localStorage.getItem('best_'+k)||0);
const bestSet=(k,v)=>{if(v>bestGet(k)){localStorage.setItem('best_'+k,String(v));return true}return false};
showCoins();
if($('#back'))$('#back').onclick=()=>{try{sessionStorage.setItem('sg_return','games')}catch{}location.href='index.html'};
