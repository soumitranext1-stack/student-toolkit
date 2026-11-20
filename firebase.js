"use strict";
const firebaseConfig = {
  apiKey: "AIzaSyA5rrpi1fe6YCkLkBxUVz3vJNDlcUTiRHA",
  authDomain: "study-game-8ce0c.firebaseapp.com",
  projectId: "study-game-8ce0c",
  storageBucket: "study-game-8ce0c.firebasestorage.app",
  messagingSenderId: "1042366074383",
  appId: "1:1042366074383:web:a53806b5d7dcc621e89d7a",
  measurementId: "G-XKEH13E1DC"
};

/* ===== Firebase Auth helpers ===== */
let AUTH=null,auth=null,userUnsubs=[],devListening=false;
/* A plain "Login ID" (no @) is turned into an internal email so Email/Password auth works */
const emailOf=id=>{id=String(id||'').trim().toLowerCase();return id.includes('@')?id:id.replace(/[^a-z0-9._-]/g,'')+'@studygame.app'};
function authMsg(e){
  const c=String((e&&e.code)||'');
  if(c.includes('invalid-credential')||c.includes('wrong-password')||c.includes('user-not-found'))return 'Wrong ID or password';
  if(c.includes('email-already-in-use')||c.includes('credential-already-in-use'))return 'This ID already exists';
  if(c.includes('weak-password'))return 'Password must be 6+ characters';
  if(c.includes('invalid-email'))return 'Invalid ID';
  if(c.includes('network'))return 'No internet';
  if(c.includes('operation-not-allowed'))return 'Enable Email/Password sign-in in Firebase Auth';
  if(c.includes('unauthorized-domain'))return 'Add this website in Firebase > Auth > Authorized domains';
  if(c.includes('too-many-requests'))return 'Too many tries, wait a bit';
  return 'Login failed';
}

/* Called whenever Firebase tells us who is signed in. uid == Firebase Auth uid from now on. */
async function adoptAuthUser(u){
  const anon=u.isAnonymous,email=(u.email||'').toLowerCase();
  if(u.uid===uid){                       // same person: just refresh account info (e.g. guest -> registered)
    me.accountType=anon?'guest':'account';me.accountId=anon?'':email;
    me=normalizeProfile(me,uid);devMode=isDevAccount(me);
    saveMe();applyDevUI();checkBan();
    patchUser(uid,base());dbOp(()=>F.setDoc(userRef(uid),base(),{merge:true}));
    return;
  }
  if(anon){guestUid=u.uid;localStorage.setItem('sg_guest_uid',u.uid)}
  const local=ls.get('sg_profile_'+u.uid,null);
  let cloud=null;
  try{const ps=await F.getDoc(F.doc(db,'users',u.uid));if(ps.exists())cloud=ps.data()}catch{}
  let start=(local||cloud)?{...(local||{}),...(cloud||{})}:null;
  if(!start&&!localStorage.getItem('sg_migrated')){        // first run after the Auth update: keep old local progress once
    start=JSON.parse(JSON.stringify(me));delete start.banned;
  }
  localStorage.setItem('sg_migrated','1');
  const next={...(start||{}),uid:u.uid,accountType:anon?'guest':'account',accountId:anon?'':email};
  switchToIdentity(u.uid,next);
  attachUserListeners();attachDevListeners();
}

/* listeners that depend on WHO the user is (re-attached after login / logout) */
function attachUserListeners(){
  if(!F||!db)return;
  userUnsubs.forEach(f=>{try{f()}catch{}});userUnsubs=[];
  const S=F,buf={a:[],b:[]},push=()=>ingestRemoteDmDocs([...buf.a,...buf.b]);
  userUnsubs.push(S.onSnapshot(S.query(S.collection(db,'dm_messages'),S.where('to','==',uid)),s=>{buf.a=s.docs.map(d=>({id:d.id,...d.data()}));push()},()=>{}));
  userUnsubs.push(S.onSnapshot(S.query(S.collection(db,'dm_messages'),S.where('from','==',uid)),s=>{buf.b=s.docs.map(d=>({id:d.id,...d.data()}));push()},()=>{}));
  if(devMode){
    userUnsubs.push(S.onSnapshot(S.collection(db,'dev_inbox'),snap=>{const next={};snap.docs.forEach(d=>{next[d.id]={uid:d.id,...d.data()}});devInbox=next;ls.set('sg_dev_inbox',devInbox);if(!cur)renderChats()},()=>{}));
  }else{
    userUnsubs.push(S.onSnapshot(S.doc(db,'dev_inbox',uid),sn=>{devInbox=sn.exists()?{[uid]:{uid,...sn.data()}}:{};ls.set('sg_dev_inbox',devInbox);if(!cur)renderChats()},()=>{}));
  }
}
/* developer-only listeners */
function attachDevListeners(){
  if(devListening||!devMode||!F||!db)return;
  devListening=true;
  F.onSnapshot(F.collection(db,'poem_requests'),snap=>{
    const list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.ts||0)-(a.ts||0));
    poemRequests=list;ls.set('sg_poem_requests_cache',poemRequests);
    if(devMode)renderPoems();
  },()=>{});
}

async function initFirebase(){
  try{
    const A=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const S=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const AU=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
    const app=A.initializeApp(firebaseConfig);
    db=S.getFirestore(app);F=S;AUTH=AU;auth=AU.getAuth(app);

    /* who is signed in? (nobody yet -> silent guest login) */
    let u=await new Promise(res=>{const un=AU.onAuthStateChanged(auth,x=>{un();res(x)})});
    if(!u)u=(await AU.signInAnonymously(auth)).user;
    online=true;
    await adoptAuthUser(u);
    setStatus(true);
    AU.onAuthStateChanged(auth,x=>{if(x&&x.uid!==uid)adoptAuthUser(x)});

    S.getDoc(userRef(uid)).then(s=>{if(!s.exists())return S.setDoc(userRef(uid),{...base(),createdAt:Date.now()})}).catch(()=>{});
    S.onSnapshot(S.collection(db,'users'),snap=>{
      const docs=snap.docs.map(d=>({uid:d.id,...d.data()}));
      cleanupInactiveZeroFriendUsers(docs);users=docs;ls.set('sg_users_cache',users);
      const m=users.find(u=>u.uid===uid);
      if(m){if(typeof m.coins==='number')me.coins=m.coins;if(typeof m.exp==='number')me.exp=Math.max(me.exp,m.exp);if(m.dailyCoinsByDay){const o={...m.dailyCoinsByDay};Object.entries(me.dailyCoinsByDay).forEach(([k,v])=>{o[k]=Math.max(Number(o[k]||0),Number(v||0))});me.dailyCoinsByDay=o}if(m.claimedByDay)me.claimedByDay={...m.claimedByDay,...me.claimedByDay};me.banned=!!m.banned;saveMe();checkBan()}
      setStatus(true);claimRankReward();checkReferralPayout();updateHud();renderAll();
    },()=>{});

    S.onSnapshot(S.collection(db,'store_items'),snap=>{customItems=snap.docs.map(d=>({id:d.id,...d.data()})).filter(c=>!DEFAULT_ITEMS.some(x=>x.id===c.id));ls.set('sg_store_custom',customItems);storeItems=[...DEFAULT_ITEMS,...customItems];renderStore()},()=>{});
    S.onSnapshot(S.collection(db,'rank_rewards'),snap=>{if(snap.docs.length){rankRewards=snap.docs.map(d=>({id:d.id,...d.data()}));ls.set('sg_rank_rewards',rankRewards)}renderRanking()},()=>{});

    S.onSnapshot(S.collection(db,'world_chat'),snap=>{
      let list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0));
      if(list.length>100){list.slice(0,list.length-100).forEach(old=>dbOp(()=>F.deleteDoc(F.doc(db,'world_chat',old.id))));list=list.slice(-100)}
      worldMsgs=list;ls.set('sg_world_msgs',worldMsgs);if(cur==='world')renderThread();
    },()=>{});

    attachUserListeners();attachDevListeners();

    // Approved poems shown on Home screen
    S.onSnapshot(S.collection(db,'poems_wall'),snap=>{
      const list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.ts||0)-(a.ts||0));
      poems=list;ls.set('sg_poems_cache',poems);renderPoems();
    },()=>{});

    S.onSnapshot(S.collection(db,'dev_tasks'),snap=>{devTasks=snap.docs.map(d=>({id:d.id,...d.data()}));ls.set('sg_dev_tasks',devTasks);renderTasks()},()=>{});
    S.onSnapshot(S.doc(db,'config','notice'),sn=>{notice=sn.exists()?sn.data():null;ls.set('sg_notice',notice);renderNotice()},()=>{});
    S.onSnapshot(S.collection(db,'referrals'),snap=>{
      const code=getInviteCode();if(!code)return;
      snap.docs.forEach(d=>{const r=d.data();if(r.code===code&&!r.paid&&d.id!==uid&&!me.done['ref_'+d.id]){me.done['ref_'+d.id]=1;addReward(50,10);saveMe();dbOp(()=>F.setDoc(F.doc(db,'referrals',d.id),{paid:true},{merge:true}));toast('Referral bonus +50 🪙')}});
    },()=>{});
  }catch(e){console.warn('firebase init',e);setStatus(false);if(e&&e.code)toast(authMsg(e))}
}
