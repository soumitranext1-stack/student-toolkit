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
function authMsg(e){
  const c=String((e&&e.code)||'');
  if(c.includes('popup-closed-by-user')||c.includes('cancelled-popup-request'))return 'Google sign-in cancelled';
  if(c.includes('popup-blocked'))return 'Popup blocked — redirecting to Google Sign-In…';
  if(c.includes('credential-already-in-use')||c.includes('email-already-in-use'))return 'Switching to your existing Google account…';
  if(c.includes('network'))return 'No internet connection';
  if(c.includes('operation-not-allowed'))return 'Enable Google sign-in in Firebase Auth';
  if(c.includes('unauthorized-domain'))return 'Add this domain in Firebase > Auth > Authorized domains';
  if(c.includes('too-many-requests'))return 'Too many tries, wait a moment';
  return 'Google sign-in failed';
}

function mergeAppearanceFromCloud(m){
  if(!m)return;
  const cloudResetAt=Number(m.resetAt||0);
  const localResetAt=Number(me.resetAt||0);
  const wasReset=cloudResetAt>localResetAt;
  const cloudIsStale=localResetAt>cloudResetAt;

  if(!cloudIsStale && typeof m.coins==='number'&&m._hasCoins!==false)me.coins=clampCoins(m.coins);
  if(!cloudIsStale && typeof m.exp==='number'){
    const safeCloudExp=clampExp(m.exp);
    me.exp=wasReset?safeCloudExp:Math.max(clampExp(me.exp),safeCloudExp);
  }
  if(wasReset){
    me.resetAt=cloudResetAt;
    me.lastRewardedLevel=calcLevel(me.exp);
  }
  if(typeof m.name==='string'&&m.name.trim())me.name=m.name.trim();
  if(typeof m.bio==='string')me.bio=m.bio;
  if(typeof m.hobbies==='string')me.hobbies=m.hobbies;
  if(m.tempUnlocks&&typeof m.tempUnlocks==='object'&&!Array.isArray(m.tempUnlocks)){
    me.tempUnlocks={...me.tempUnlocks,...m.tempUnlocks};
  }
  if(Array.isArray(m.tags)&&m.tags.length)me.tags=m.tags.slice(0,3);
  if(Array.isArray(m.friends))me.friends=m.friends;
  if(Array.isArray(m.activeDays)&&m.activeDays.length){
    me.activeDays=[...new Set([...(me.activeDays||[]),...m.activeDays])].slice(-60);
  }
  if(typeof m.avatar==='string'&&m.avatar)me.avatar=m.avatar;
  if(typeof m.frame==='string'&&m.frame){
    if(isDevAccount(me)||m.frame!=='dev')me.frame=m.frame;
  }
  if(typeof m.banner==='string'&&m.banner){
    if(isDevAccount(me)||m.banner!=='bn-dev')me.banner=m.banner;
  }
  if(typeof m.textStyle==='string')me.textStyle=m.textStyle;
  if(typeof m.msgStyle==='string')me.msgStyle=m.msgStyle;
  if(typeof m.bioStyle==='string')me.bioStyle=m.bioStyle;
  if(!cloudIsStale && m.dailyCoinsByDay&&typeof m.dailyCoinsByDay==='object'){
    if(wasReset){
      me.dailyCoinsByDay=sanitizeDailyMap(m.dailyCoinsByDay);
    }else{
      const o=sanitizeDailyMap(m.dailyCoinsByDay);
      Object.entries(sanitizeDailyMap(me.dailyCoinsByDay)).forEach(([k,v])=>{o[k]=Math.max(Number(o[k]||0),Number(v||0))});
      me.dailyCoinsByDay=o;
    }
  }
  if(m.claimedByDay&&typeof m.claimedByDay==='object'){
    me.claimedByDay={...m.claimedByDay,...me.claimedByDay};
  }
  if(typeof m.charm==='number')me.charm=Math.max(clampSafeInt(me.charm||0,0,MAX_COINS),clampSafeInt(m.charm,0,MAX_COINS));
  if(typeof m.charmSent==='number')me.charmSent=Math.max(clampSafeInt(me.charmSent||0,0,MAX_COINS),clampSafeInt(m.charmSent,0,MAX_COINS));
  if(m.giftWallet&&typeof m.giftWallet==='object'&&!Array.isArray(m.giftWallet)){
    const gw={...(me.giftWallet||{})};
    Object.entries(m.giftWallet).forEach(([k,v])=>{gw[k]=Math.max(Number(gw[k]||0),clampSafeInt(v,0,MAX_COINS))});
    me.giftWallet=gw;
  }
  if(typeof m.banned==='boolean')me.banned=m.banned;

  me=normalizeProfile(me,uid);
  me.lastRewardedLevel=Math.max(Number(me.lastRewardedLevel||1),calcLevel(me.exp));
  refreshDevMode();
  saveMe();
}

async function adoptAuthUser(u){
  const hasGoogle=Array.isArray(u.providerData)&&u.providerData.some(p=>p&&p.providerId==='google.com');
  const anon=u.isAnonymous||!hasGoogle;
  const email=hasGoogle?String(u.email||'').trim().toLowerCase():'';
  const authProvider=hasGoogle?'google.com':'anonymous';
  if(u.uid===uid){
    me.accountType=anon?'guest':'account';me.accountId=email;me.authProvider=authProvider;
    if(hasGoogle&&u.displayName&&/^guest /i.test(me.name||''))me.name=u.displayName.slice(0,24);
    me=normalizeProfile(me,uid);refreshDevMode();
    saveMe();applyDevUI();checkBan();
    patchUser(uid,base());dbOp(()=>F.setDoc(userRef(uid),base(),{merge:true}));
    renderAll();
    return;
  }
  if(anon){guestUid=u.uid;localStorage.setItem('sg_guest_uid',u.uid)}
  const local=ls.get('sg_profile_'+u.uid,null);
  let cloud=null;
  try{const ps=await F.getDoc(F.doc(db,'users',u.uid));if(ps.exists())cloud=ps.data()}catch{}
  let start=(local||cloud)?{...(local||{}),...(cloud||{})}:null;
  if(!start&&!localStorage.getItem('sg_migrated')){
    start=JSON.parse(JSON.stringify(me));delete start.banned;
  }
  localStorage.setItem('sg_migrated','1');
  const next={...(start||{}),uid:u.uid,accountType:anon?'guest':'account',accountId:email,authProvider};
  if(hasGoogle&&u.displayName&&(!next.name||/^guest /i.test(next.name)))next.name=u.displayName.slice(0,24);
  switchToIdentity(u.uid,next);
  if(!cloud){
    dbOp(()=>F.setDoc(userRef(u.uid),{...base(),coins:clampCoins(me.coins),createdAt:Date.now()},{merge:true}));
  }
  attachUserListeners();attachDevListeners();
}

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

    try{await AU.getRedirectResult(auth)}catch{}
    let u=await new Promise(res=>{const un=AU.onAuthStateChanged(auth,x=>{un();res(x)})});
    if(!u)u=(await AU.signInAnonymously(auth)).user;
    online=true;
    await adoptAuthUser(u);
    setStatus(true);
    AU.onAuthStateChanged(auth,x=>{if(x&&x.uid!==uid)adoptAuthUser(x)});

    S.getDoc(userRef(uid)).then(s=>{
      if(!s.exists()){
        return S.setDoc(userRef(uid),{...base(),coins:clampCoins(me.coins),createdAt:Date.now()},{merge:true});
      }
      const d=s.data();
      mergeAppearanceFromCloud({...d,_hasCoins:typeof d?.coins==='number'});
      applyDevUI();checkBan();updateHud();buildProfile();renderAll();
    }).catch(()=>{});

    S.onSnapshot(S.collection(db,'users'),snap=>{
      const docs=snap.docs.map(d=>sanitizeUserAppearance({uid:d.id,...d.data()}));
      cleanupInactiveGuestUsers(docs);users=docs;ls.set('sg_users_cache',users);
      const m=users.find(x=>x.uid===uid);
      if(m){mergeAppearanceFromCloud(m);applyDevUI();checkBan()}
      setStatus(true);claimRankReward();checkReferralPayout();updateHud();renderAll();
    },()=>{});

    S.onSnapshot(S.collection(db,'gift_events'),snap=>{
      const list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.ts||0)-(a.ts||0));
      if(typeof ingestIncomingGiftEvents==='function')ingestIncomingGiftEvents(list);
    },()=>{});

    S.onSnapshot(S.collection(db,'store_items'),snap=>{
      customItems=snap.docs.map(d=>({id:d.id,...d.data()})).filter(c=>!DEFAULT_ITEMS.some(x=>x.id===c.id) && !(typeof isRankExclusiveKey==='function'&&isRankExclusiveKey(`${c.kind}:${c.value}`)));
      ls.set('sg_store_custom',customItems);storeItems=[...DEFAULT_ITEMS,...customItems];renderStore();
    },()=>{});

    S.onSnapshot(S.collection(db,'rank_rewards'),snap=>{
      if(snap.docs.length){
        rankRewards=snap.docs.map(d=>({id:d.id,...d.data()}));
        ls.set('sg_rank_rewards',rankRewards);
      }
      renderRanking();
    },()=>{});

    /* World Chat with automatic 7-day cleanup + 150 msg cap + live incoming Sound FX */
    let worldHydrated=false, prevWorldIds=new Set((worldMsgs||[]).map(x=>x.id));
    S.onSnapshot(S.collection(db,'world_chat'),snap=>{
      const now=Date.now();
      let list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0));
      const fresh=[];
      list.forEach(msg=>{
        if(now-Number(msg.ts||0)>=SEVEN_DAYS_MS){
          dbOp(()=>F.deleteDoc(F.doc(db,'world_chat',msg.id)));
        }else{
          fresh.push(msg);
        }
      });
      list=fresh;
      if(list.length>150){
        list.slice(0,list.length-150).forEach(old=>dbOp(()=>F.deleteDoc(F.doc(db,'world_chat',old.id))));
        list=list.slice(-150);
      }
      if(worldHydrated&&typeof playSfx==='function'){
        const newlyAdded=list.filter(m=>m&&m.id&&!prevWorldIds.has(m.id)&&m.uid!==uid);
        if(newlyAdded.length){
          const lastNew=newlyAdded[newlyAdded.length-1];
          if(lastNew.type==='red_packet')playSfx('redPacketDrop');
          else if(lastNew.type==='gift')playSfx('giftReceive');
          else if(cur==='world')playSfx('chatRecv');
        }
      }
      worldHydrated=true;
      prevWorldIds=new Set(list.map(x=>x.id));
      worldMsgs=list;ls.set('sg_world_msgs',worldMsgs);
      if(cur==='world')renderThread();
      else renderChats();
    },()=>{});

    /* Live Multiplayer Game Rooms listener (auto-cleans stale rooms older than 2 hours) */
    S.onSnapshot(S.collection(db,'game_rooms'),snap=>{
      const now=Date.now();
      const active=[];
      snap.docs.forEach(d=>{
        const rm={id:d.id,...d.data()};
        const lastTs=Number(rm.updatedAt||rm.createdAt||0);
        if(lastTs>0&&(now-lastTs)>=7200000){
          dbOp(()=>F.deleteDoc(F.doc(db,'game_rooms',d.id)));
        }else{
          active.push(rm);
        }
      });
      if(typeof ingestMultiplayerRooms==='function')ingestMultiplayerRooms(active);
    },()=>{});

    attachUserListeners();attachDevListeners();

    S.onSnapshot(S.collection(db,'poems_wall'),snap=>{
      const list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.ts||0)-(a.ts||0));
      poems=list;ls.set('sg_poems_cache',poems);renderPoems();
    },()=>{});

    S.onSnapshot(S.collection(db,'dev_tasks'),snap=>{devTasks=snap.docs.map(d=>({id:d.id,...d.data()}));ls.set('sg_dev_tasks',devTasks);renderTasks()},()=>{});
    S.onSnapshot(S.doc(db,'config','notice'),sn=>{notice=sn.exists()?sn.data():null;ls.set('sg_notice',notice);renderNotice()},()=>{});
    S.onSnapshot(S.doc(db,'config','game_slots'),sn=>{
      customGameSlots=sn.exists()&&Array.isArray(sn.data().slots)?sn.data().slots:[];
      ls.set('sg_game_slots',customGameSlots);
      renderGameSlots();
    },()=>{});

    S.onSnapshot(S.collection(db,'referrals'),snap=>{
      const code=getInviteCode();if(!code)return;
      snap.docs.forEach(d=>{const r=d.data();if(r.code===code&&!r.paid&&d.id!==uid&&!me.done['ref_'+d.id]){me.done['ref_'+d.id]=1;addReward(50,10);saveMe();dbOp(()=>F.setDoc(F.doc(db,'referrals',d.id),{paid:true},{merge:true}));toast('Referral bonus +50 coins!')}});
    },()=>{});
  }catch(e){console.warn('firebase init',e);setStatus(false);if(e&&e.code)toast(authMsg(e))}
}
