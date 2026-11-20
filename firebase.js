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
async function initFirebase(){
  try{
    const A=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const S=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    db=S.getFirestore(A.initializeApp(firebaseConfig));F=S;setStatus(true);

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
    S.onSnapshot(S.collection(db,'dev_inbox'),snap=>{const next={};snap.docs.forEach(d=>{next[d.id]={uid:d.id,...d.data()}});devInbox=next;ls.set('sg_dev_inbox',devInbox);if(!cur)renderChats()},()=>{});

    S.onSnapshot(S.collection(db,'world_chat'),snap=>{
      let list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0));
      if(list.length>100){list.slice(0,list.length-100).forEach(old=>dbOp(()=>F.deleteDoc(F.doc(db,'world_chat',old.id))));list=list.slice(-100)}
      worldMsgs=list;ls.set('sg_world_msgs',worldMsgs);if(cur==='world')renderThread();
    },()=>{});

    S.onSnapshot(S.collection(db,'dm_messages'),snap=>{
      const dmDocs=snap.docs.map(d=>({id:d.id,...d.data()}));
      ingestRemoteDmDocs(dmDocs);
    },()=>{});

    // Approved poems shown on Home screen
    S.onSnapshot(S.collection(db,'poems_wall'),snap=>{
      const list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.ts||0)-(a.ts||0));
      poems=list;ls.set('sg_poems_cache',poems);renderPoems();
    },()=>{});

    // Pending poem requests sent to Developer
    S.onSnapshot(S.collection(db,'poem_requests'),snap=>{
      const list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.ts||0)-(a.ts||0));
      poemRequests=list;ls.set('sg_poem_requests_cache',poemRequests);
      if(devMode)renderPoems();
    },()=>{});
    S.onSnapshot(S.collection(db,'dev_tasks'),snap=>{devTasks=snap.docs.map(d=>({id:d.id,...d.data()}));ls.set('sg_dev_tasks',devTasks);renderTasks()},()=>{});
    S.onSnapshot(S.doc(db,'config','notice'),sn=>{notice=sn.exists()?sn.data():null;ls.set('sg_notice',notice);renderNotice()},()=>{});
    S.onSnapshot(S.collection(db,'referrals'),snap=>{
      const code=getInviteCode();if(!code)return;
      snap.docs.forEach(d=>{const r=d.data();if(r.code===code&&!r.paid&&d.id!==uid&&!me.done['ref_'+d.id]){me.done['ref_'+d.id]=1;addReward(50,10);saveMe();dbOp(()=>F.setDoc(F.doc(db,'referrals',d.id),{paid:true},{merge:true}));toast('Referral bonus +50 🪙')}});
    },()=>{});
  }catch{setStatus(false)}
}
