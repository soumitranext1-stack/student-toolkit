"use strict";
function applyDevUI(){$('#devBadge').hidden=!devMode;$$('.dev-only').forEach(el=>el.hidden=!devMode)}
function switchToIdentity(nextUid,nextProfileObj){
  $$('#modals .mb').forEach(b=>b.remove());
  cur=null;$('#thread').hidden=true;
  uid=nextUid;localStorage.setItem('sg_uid',uid);
  me=normalizeProfile(nextProfileObj,nextUid);
  devMode=isDevAccount(me);
  stats={calc_open:0,pdf_open:0,tool_open:0,profile_save:0,games_played:0,store_buy:0,ad_watch:0,...ls.get('sg_stats_'+uid,{})};
  chats=ls.get('sg_chats_'+uid,{});ensureDevChat();
  saveMe();saveStats();applyDevUI();checkBan();checkDailyLoginBonus();
  dbOp(()=>F.setDoc(userRef(uid),{...base(),createdAt:Date.now()},{merge:true}));
  claimRankReward();updateUnreadDots();updateHud();buildProfile();renderAll();showTab('tools');
}

function openAuthModal(){
  const m=modal('Register & Login',`
    <p style="font-size:12px;color:var(--mu);margin-bottom:8px">Status: <b style="color:var(--tx)">${me.accountType==='account'?esc(me.accountId):'Guest: '+esc(uid)}</b></p>
    <div class="tabs"><button class="on" data-am="login">Login</button><button data-am="reg">Register New ID</button></div>
    <label>Login ID (name or email)</label><input id="auId" type="text" placeholder="Enter Login ID" autocomplete="off">
    <label>Password (6+ characters)</label><input id="auPw" type="password" placeholder="Enter Password">
    <label>Invite Code (optional)</label><input id="auRef" type="text" placeholder="REF_..." value="${esc(me.referredBy||REF_PARAM)}">
    <button class="btn full" id="auSubmit">Login</button>
    <button class="btn red full" id="auLogout">Logout</button>
  `);
  let mode='login';
  $$('[data-am]',m).forEach(b=>b.onclick=()=>{mode=b.dataset.am;$$('[data-am]',m).forEach(x=>x.classList.toggle('on',x===b));$('#auSubmit',m).textContent=mode==='login'?'Login':'Create Account'});

  $('#auSubmit',m).onclick=async()=>{
    if(!auth||!AUTH)return toast('Connecting… try again in a moment');
    const idClean=$('#auId',m).value.trim().toLowerCase(),pass=$('#auPw',m).value,refCode=$('#auRef',m).value.trim().toUpperCase();
    if(!idClean||!pass)return toast('Enter ID and password');
    if(pass.length<6)return toast('Password must be 6+ characters');
    const email=emailOf(idClean),btn=$('#auSubmit',m);btn.disabled=true;
    try{
      if(mode==='reg'){
        if(auth.currentUser&&auth.currentUser.isAnonymous){
          await AUTH.linkWithCredential(auth.currentUser,AUTH.EmailAuthProvider.credential(email,pass));
          me.referredBy=me.referredBy||refCode||'';
          if(/^guest /i.test(me.name||''))me.name=idClean.split('@')[0].slice(0,24);
          await adoptAuthUser(auth.currentUser);
          attachUserListeners();attachDevListeners();
          buildProfile();renderAll();
        }else{
          await AUTH.createUserWithEmailAndPassword(auth,email,pass);
        }
        toast('Account created');
      }else{
        await AUTH.signInWithEmailAndPassword(auth,email,pass);
        toast('Logged in');
      }
      m.close();
    }catch(e){btn.disabled=false;toast(authMsg(e))}
  };

  $('#auLogout',m).onclick=async()=>{
    if(!auth||!AUTH){m.close();return}
    try{await AUTH.signOut(auth);await AUTH.signInAnonymously(auth)}catch(e){toast(authMsg(e))}
    m.close();toast('Logged out');
  };
}

function mergePairs(baseList,fxList){
  const seen=new Set(),out=[];
  [...(baseList||[]),...(fxList||[])].forEach(item=>{
    if(!Array.isArray(item)||!item[0]||seen.has(item[0]))return;
    seen.add(item[0]);out.push(item);
  });
  return out;
}

function getProfileAvatars(){
  const fxEmojis=typeof FX_AVATAR_PROFILE!=='undefined'?FX_AVATAR_PROFILE.flatMap(c=>c.list||[]):[];
  const all=[...(typeof USER_AVATARS!=='undefined'?USER_AVATARS:[]),...fxEmojis,me.avatar].filter(Boolean);
  return [...new Set(all)].filter(em=>(typeof FX_FREE_AVATARS!=='undefined'&&FX_FREE_AVATARS.includes(em))||isUnlocked('avatar:'+em)||em===me.avatar);
}

function buildProfile(){
  cleanExpiredUnlocks();
  const d={avatar:me.avatar,frame:me.frame,banner:me.banner,textStyle:me.textStyle,msgStyle:me.msgStyle,bioStyle:me.bioStyle||'',tags:[...(me.tags||[])]};
  const invCode=getInviteCode(), daysCount=new Set(me.activeDays||[]).size;
  const fxLists=typeof FX_USER_LISTS!=='undefined'?FX_USER_LISTS:{};
  const avList=getProfileAvatars();
  const frameList=mergePairs(typeof USER_FRAMES!=='undefined'?USER_FRAMES:[],fxLists.frame);
  const bannerList=mergePairs(typeof BANNERS!=='undefined'?BANNERS:[],fxLists.banner);
  const textList=mergePairs(typeof TEXTS!=='undefined'?TEXTS:[],fxLists.text);
  const msgList=mergePairs(typeof MSGS!=='undefined'?MSGS:[],fxLists.msg);

  $('#v-profile').innerHTML=`
    <div class="row" style="justify-content:space-between;margin-bottom:10px"><h2 style="margin:0">${tr('yp')}</h2><button class="btn ghost sm" id="accBtn">${me.accountType==='account'?'Account · Logout':'Register / Login'}</button></div>
    <div class="bn-box ${esc(d.banner)}" id="pBanner">
      <div class="pf"><div id="pav"></div><b id="pnamePrev" class="${esc(d.textStyle)}" style="font-size:18px">${esc(me.name)}</b>
      <div class="row"><span class="lvl-pill">LVL ${calcLevel(me.exp)} · ${fmtNum(me.exp)} EXP</span><div class="coin">🪙 <span class="coinval"></span></div></div>
      <small style="opacity:.85">UID: ${esc(uid)}</small><span class="streak">🔥 ${calcStreak(me.activeDays)} ${tr('streak')}</span>${me.bio?`<div class="${esc(me.bioStyle||'')}" style="font-size:13px;text-align:center">${esc(me.bio)}</div>`:''}</div>
      ${renderTags(me.tags)}
    </div>
    <div class="card" style="margin-top:10px">
      <b>Refer &amp; Earn (Logged-In Only · 3 Days)</b>
      <p style="color:var(--mu);font-size:12px;margin-top:3px">Active days: <b>${daysCount}/3</b> · Referrer gets +50 🪙</p>
      ${invCode?`<div class="row wrap" style="margin-top:8px"><span class="dur-pill">${esc(invCode)}</span><button class="btn sm" id="refShare">Share Link</button></div>`:`<button class="btn ghost sm" style="margin-top:8px" id="refLogin">Login for Invite Code</button>`}
    </div>
    <label>Display Name</label><input id="pn" maxlength="24" value="${esc(me.name)}">
    <label>Bio</label><textarea id="pb" maxlength="160">${esc(me.bio)}</textarea>
    <label>Avatar</label><div class="pick" id="pa">${avList.map(a=>`<button data-a="${esc(a)}" style="font-size:22px">${esc(a)}</button>`).join('')}</div>
    <label>Frames</label><div class="pick" id="pfm">${frameList.filter(f=>isUnlocked('frame:'+f[0])||f[0]===d.frame).map(f=>`<button data-f="${esc(f[0])}">${av({avatar:'🙂',frame:f[0]},34)}</button>`).join('')}</div>
    <label>Banners</label><div class="row wrap" id="pbn">${bannerList.filter(b=>isUnlocked('banner:'+b[0])||b[0]===d.banner).map(b=>`<button class="btn ghost sm" data-b="${esc(b[0])}">${esc(b[1])}</button>`).join('')}</div>
    <label>Glowing Text</label><div class="row wrap" id="ptx">${textList.filter(t=>isUnlocked('text:'+t[0])||t[0]===d.textStyle).map(t=>`<button class="btn ghost sm" data-t="${esc(t[0])}">${esc(t[1])}</button>`).join('')}</div>
    <label>Message Glow</label><div class="row wrap" id="pmg">${msgList.filter(mg=>isUnlocked('msg:'+mg[0])||mg[0]===d.msgStyle).map(mg=>`<button class="btn ghost sm" data-msg="${esc(mg[0])}">${esc(mg[1])}</button>`).join('')}</div>
    <label>Glowing Bio</label><div class="row wrap" id="pbo">${BIOS.filter(b=>isUnlocked('bio:'+b[0])||b[0]===d.bioStyle).map(b=>`<button class="btn ghost sm" data-bio="${esc(b[0])}">${esc(b[1])}</button>`).join('')}</div>
    ${devMode?'':`<label>Profile Tags (max 3)</label><div class="row wrap" id="ptg">${[...new Set([...FREE_TAGS,...storeItems.filter(i=>i.kind==='tag').map(i=>i.value)])].filter(g=>isUnlocked('tag:'+g)).map(g=>`<button class="btn ghost sm" data-tag="${esc(g)}">${esc(g)}</button>`).join('')}</div>`}
    <button class="btn full" id="psv">Save Profile</button>`;
  const sync=()=>{
    $('#pav').innerHTML=av({uid,avatar:d.avatar,frame:d.frame},74);$('#pBanner').className='bn-box '+d.banner;
    $('#pnamePrev').className=d.textStyle;$('#pnamePrev').textContent=$('#pn').value.trim()||me.name;
    $$('#pa button').forEach(b=>b.classList.toggle('on',b.dataset.a===d.avatar));
    $$('#pfm button').forEach(b=>b.classList.toggle('on',b.dataset.f===d.frame));
    $$('#pbn button').forEach(b=>b.classList.toggle('on',b.dataset.b===d.banner));
    $$('#ptx button').forEach(b=>b.classList.toggle('on',b.dataset.t===d.textStyle));
    $$('#pmg button').forEach(b=>b.classList.toggle('on',b.dataset.msg===d.msgStyle));$$('#pbo button').forEach(b=>b.classList.toggle('on',b.dataset.bio===d.bioStyle));$$('#ptg button').forEach(b=>b.classList.toggle('on',d.tags.includes(b.dataset.tag)));
  };
  sync();updateHud();
  $('#accBtn').onclick=openAuthModal;
  if($('#refLogin'))$('#refLogin').onclick=openAuthModal;
  if($('#refShare'))$('#refShare').onclick=shareInvite;
  $('#pn').oninput=sync;
  $('#pa').onclick=e=>{const b=e.target.closest('[data-a]');if(b){d.avatar=b.dataset.a;sync()}};
  $('#pfm').onclick=e=>{const b=e.target.closest('[data-f]');if(b){d.frame=b.dataset.f;sync()}};
  $('#pbn').onclick=e=>{const b=e.target.closest('[data-b]');if(b){d.banner=b.dataset.b;sync()}};
  $('#ptx').onclick=e=>{const b=e.target.closest('[data-t]');if(b){d.textStyle=b.dataset.t;sync()}};
  $('#pmg').onclick=e=>{const b=e.target.closest('[data-msg]');if(b){d.msgStyle=b.dataset.msg;sync()}};
  $('#pbo').onclick=e=>{const b=e.target.closest('[data-bio]');if(b){d.bioStyle=b.dataset.bio;sync()}};
  if($('#ptg'))$('#ptg').onclick=e=>{const b=e.target.closest('[data-tag]');if(!b)return;const g=b.dataset.tag;d.tags=d.tags.includes(g)?d.tags.filter(x=>x!==g):[...d.tags,g].slice(-3);sync()};
  $('#psv').onclick=()=>{
    me.name=$('#pn').value.trim()||'Player '+uid.slice(-4);
    me.bio=$('#pb').value.trim();
    me.avatar=d.avatar;
    me.frame=d.frame;
    me.banner=d.banner;
    me.textStyle=d.textStyle;
    me.msgStyle=d.msgStyle;
    me.bioStyle=d.bioStyle;
    if(!devMode)me.tags=d.tags.length?d.tags:[me.accountType==='account'?'Newbie':'Guest Pass'];
    me=normalizeProfile(me,uid);
    saveMe();
    patchUser(uid,base());
    dbOp(()=>F.setDoc(userRef(uid),base(),{merge:true}));
    bumpStat('profile_save');
    buildProfile();
    renderAll();
    toast('Saved');
  };
}

function checkReferralPayout(){
  if(!online||me.accountType!=='account'||!me.referredBy||me.referralRewardClaimed)return;
  if(new Set(me.activeDays).size>=3){me.referralRewardClaimed=true;saveMe();dbOp(()=>F.setDoc(F.doc(db,'referrals',uid),{uid,code:me.referredBy,paid:false,ts:Date.now()}))}
}
$('#banLogin').onclick=openAuthModal;
