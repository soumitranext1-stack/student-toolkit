"use strict";
/* Shared helpers for all Study Game mini games (same profile + coin storage as chess-blitz.html) */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const rnd=n=>Math.floor(Math.random()*n);
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=rnd(i+1);[b[i],b[j]]=[b[j],b[i]]}return b};
function toast(t){$$('.toast').forEach(x=>x.remove());const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2600)}
function modal(html){const m=document.createElement('div');m.className='mb';m.innerHTML=`<div class="sheet">${html}</div>`;document.body.appendChild(m);m.close=()=>m.remove();return m}
if(localStorage.getItem('sg_theme')==='light')document.body.classList.add('light');

const DAILY_CAP=20;            // max coins one game can pay per day (stops coin farming)
let uid=localStorage.getItem('sg_uid')||('SG'+Math.floor(10000000+Math.random()*89999999));
let PK='sg_profile_'+uid,isGuest=true,db=null,S=null;

function getProf(){
  try{const p=JSON.parse(localStorage.getItem(PK)||'null');if(p)return p}catch{}
  const p={uid,name:'Guest '+uid.slice(-4),avatar:'🦊',coins:50,exp:0};
  localStorage.setItem(PK,JSON.stringify(p));return p;
}
function showCoins(){const n=Number(getProf().coins||0);const e=$('#coins');if(e)e.textContent=n>=1e6?(n/1e6).toFixed(1)+'M':String(n)}
function addReward(coins,exp){
  const p=getProf();
  p.coins=Math.max(0,Number(p.coins||0)+coins);p.exp=Number(p.exp||0)+exp;
  if(coins>0){p.dailyCoinsByDay=p.dailyCoinsByDay&&typeof p.dailyCoinsByDay==='object'?p.dailyCoinsByDay:{};p.dailyCoinsByDay[today()]=Number(p.dailyCoinsByDay[today()]||0)+coins}
  localStorage.setItem(PK,JSON.stringify(p));
  if(db&&S){const o={uid,name:p.name,avatar:p.avatar||'🦊',coins:p.coins,exp:Number(p.exp||0)};if(p.dailyCoinsByDay)o.dailyCoinsByDay=p.dailyCoinsByDay;S.setDoc(S.doc(db,'users',uid),o,{merge:true}).catch(()=>{})}
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
    uid=u.uid;PK='sg_profile_'+uid;isGuest=u.isAnonymous;localStorage.setItem('sg_uid',uid);
  }catch{S=null;db=null}
}
const ready=initFb().then(showCoins);

/* Pay a game result. Coins only for registered players, capped per game per day. */
async function award(gameId,wantCoins,wantExp){
  await ready;
  bumpPlayed();
  const k=`gk_${uid}_${gameId}_${today()}`,got=Number(localStorage.getItem(k)||0);
  const coins=isGuest?0:Math.max(0,Math.min(wantCoins,DAILY_CAP-got));
  localStorage.setItem(k,String(got+coins));
  addReward(coins,Math.max(0,Math.min(40,wantExp)));
  return {coins,capped:!isGuest&&wantCoins>coins,guest:isGuest&&wantCoins>0};
}
function result(o){   // o:{emoji,title,lines:[],r:{coins,capped,guest},again,menu}
  const r=o.r||{coins:0};
  const coinTxt=r.guest?'🔒 Coins ke liye Register / Login karo':(r.coins>0?`+${r.coins} 🪙 mile`:(r.capped?'Aaj ka coin limit pura ho gaya (20 🪙/game)':'Is baar coin nahi mile'));
  const m=modal(`<div class="big">${o.emoji||'🏁'}</div><h2>${esc(o.title)}</h2>${(o.lines||[]).map(l=>`<p class="mu">${esc(l)}</p>`).join('')}<p style="margin-top:10px;font-weight:700">${esc(coinTxt)}</p><button class="btn full" id="rA">Play again</button><button class="btn ghost full" id="rM">Menu</button><button class="btn ghost full" id="rB">Back to Study Game</button>`);
  $('#rA').onclick=()=>{m.close();o.again()};
  $('#rM').onclick=()=>{m.close();o.menu()};
  $('#rB').onclick=()=>location.href='index.html';
}
function pick(sel,cb){$(sel).onclick=e=>{const b=e.target.closest('button');if(!b)return;$$(sel+' button').forEach(x=>x.classList.toggle('on',x===b));cb(b.dataset.v)}}
const bestGet=k=>Number(localStorage.getItem('best_'+k)||0);
const bestSet=(k,v)=>{if(v>bestGet(k)){localStorage.setItem('best_'+k,String(v));return true}return false};
showCoins();
$('#back').onclick=()=>location.href='index.html';
