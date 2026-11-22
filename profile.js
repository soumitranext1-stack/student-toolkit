"use strict";

function applyDevUI(){
  refreshDevMode();
  const dbBadge=$('#devBadge');
  if(dbBadge)dbBadge.hidden=!devMode;
  $$('.dev-only').forEach(el=>el.hidden=!devMode);
  const rpBtn=$('#rpBtn');
  if(rpBtn)rpBtn.hidden=!devMode;
}

function switchToIdentity(nextUid,nextProfileObj){
  $$('#modals .mb').forEach(b=>b.remove());
  cur=null;$('#thread').hidden=true;
  uid=nextUid;localStorage.setItem('sg_uid',uid);
  me=normalizeProfile(nextProfileObj,nextUid);
  refreshDevMode();
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
    if(!Array.isArray(item)||seen.has(item[0]))return;
    seen.add(item[0]);out.push(item);
  });
  return out;
}

function getUnlockedAvatars(){
  const free=typeof FX_FREE_AVATARS!=='undefined'?FX_FREE_AVATARS:USER_AVATARS;
  const fxEmojis=typeof FX_AVATAR_PROFILE!=='undefined'?FX_AVATAR_PROFILE.flatMap(c=>c.list||[]):[];
  const lbAvs=typeof LB_EXCLUSIVE_AVATARS!=='undefined'?Object.keys(LB_EXCLUSIVE_AVATARS):[];
  const all=[...free,...fxEmojis,...lbAvs,me.avatar].filter(Boolean);
  return [...new Set(all)].filter(em=>isUnlocked('avatar:'+em)||em===me.avatar);
}

function labelForPair(list, val, fallback){
  const found=(list||[]).find(x=>x[0]===val);
  return found?found[1]:(fallback||val||'Default');
}

function persistProfileChanges(msg){
  me=normalizeProfile(me,uid);
  saveMe();
  patchUser(uid,base());
  dbOp(()=>F.setDoc(userRef(uid),base(),{merge:true}));
  updateHud();
  buildProfile();
  renderAll();
  if(msg)toast(msg);
}

function openBannerPicker(bannerList){
  const unlocked=bannerList.filter(b=>isUnlocked('banner:'+b[0])||b[0]===me.banner);
  const m=modal('Choose Banner',`
    <p style="font-size:12px;color:var(--mu);margin-bottom:10px">Tap a banner to equip it immediately. Unlock more in the Store or Leaderboard Top 1–3.</p>
    <div class="bn-pick-grid">
      ${unlocked.map(b=>`<button type="button" class="bn-pick-item bn-box ${esc(b[0])} ${b[0]===me.banner?'on':''}" data-pickbn="${esc(b[0])}">${esc(b[1])}</button>`).join('')}
    </div>
  `);
  m.onclick=e=>{
    const btn=e.target.closest('[data-pickbn]');if(!btn)return;
    me.banner=btn.dataset.pickbn;
    m.close();persistProfileChanges('Banner updated');
  };
}

function openAvatarPicker(){
  const unlocked=getUnlockedAvatars();
  const m=modal('Choose Avatar',`
    <p style="font-size:12px;color:var(--mu);margin-bottom:10px">Tap an avatar to equip it. Unlock more in the Store or earn Exclusive Crests in Leaderboard Top 1–3.</p>
    <div class="pick">
      ${unlocked.map(em=>{
        const isLb=typeof LB_EXCLUSIVE_AVATARS!=='undefined'&&LB_EXCLUSIVE_AVATARS[em];
        return `<button type="button" class="${em===me.avatar?'on':''}" data-pickav="${esc(em)}" title="${esc(isLb?isLb.name:em)}" style="width:56px;height:56px">${typeof renderAvatarGlyph==='function'?renderAvatarGlyph(em):esc(em)}</button>`;
      }).join('')}
    </div>
  `);
  m.onclick=e=>{
    const btn=e.target.closest('[data-pickav]');if(!btn)return;
    me.avatar=btn.dataset.pickav;
    m.close();persistProfileChanges('Avatar updated');
  };
}

function openFramePicker(frameList){
  const unlocked=frameList.filter(f=>isUnlocked('frame:'+f[0])||f[0]===me.frame);
  const m=modal('Choose Avatar Frame',`
    <p style="font-size:12px;color:var(--mu);margin-bottom:10px">Tap any unlocked frame to apply.</p>
    <div class="pick">
      ${unlocked.map(f=>`<button type="button" class="${f[0]===me.frame?'on':''}" data-pickfr="${esc(f[0])}" style="min-width:74px;padding:8px 6px">${av({avatar:me.avatar,frame:f[0]},40)}<small style="font-size:10px;max-width:68px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(f[1])}</small></button>`).join('')}
    </div>
  `);
  m.onclick=e=>{
    const btn=e.target.closest('[data-pickfr]');if(!btn)return;
    me.frame=btn.dataset.pickfr;
    m.close();persistProfileChanges('Frame updated');
  };
}

function openStylePicker(title, list, currentVal, keyPrefix, fieldName, previewType){
  const unlocked=list.filter(item=>isUnlocked(keyPrefix+item[0])||item[0]===currentVal);
  const m=modal(title,`
    <div class="list">
      ${unlocked.map(item=>{
        const active=item[0]===currentVal;
        let preview='';
        if(previewType==='text')preview=`<span class="${esc(item[0])}" style="font-weight:800">${esc(me.name)}</span>`;
        else if(previewType==='msg')preview=`<span class="bub ${esc(item[0])}" style="padding:5px 10px;font-size:12px">Sample chat message</span>`;
        else preview=`<span class="${esc(item[0])}" style="font-size:12.5px">Your glowing bio style</span>`;
        return `<button type="button" class="pf-pick-row ${active?'on':''}" style="${active?'border-color:var(--gold)':''}" data-pickst="${esc(item[0])}">
          <div class="pf-pick-meta"><b>${esc(item[1])}</b><div style="margin-top:3px">${preview}</div></div>
          <span class="dur-pill">${active?'Equipped':'Use'}</span>
        </button>`;
      }).join('')}
    </div>
  `);
  m.onclick=e=>{
    const btn=e.target.closest('[data-pickst]');if(!btn)return;
    me[fieldName]=btn.dataset.pickst;
    m.close();persistProfileChanges(title+' updated');
  };
}

function openTagPicker(){
  const storeTagValues=(typeof storeItems!=='undefined'?storeItems:[]).filter(i=>i.kind==='tag').map(i=>i.value);
  const devTags=devMode?['Developer','LVL 99']:[];
  const allTags=[...new Set([...devTags,...FREE_TAGS,...storeTagValues,...(me.tags||[])])].filter(g=>isUnlocked('tag:'+g));
  let selected=[...(me.tags||[])];

  const m=modal('Choose Profile Tags (Max 3)',`
    <p style="font-size:12px;color:var(--mu);margin-bottom:10px">Select up to 3 glowing tags to display on your Profile &amp; World Chat.</p>
    <div class="row wrap" id="tgPickBox" style="gap:8px"></div>
    <button class="btn full" id="tgPickSave">Apply Tags</button>
  `);
  const renderChoices=()=>{
    $('#tgPickBox',m).innerHTML=allTags.map(g=>{
      const on=selected.includes(g);
      return `<button type="button" class="p-tag ${tagClassFor(g)}" data-ptg="${esc(g)}" style="cursor:pointer;padding:6px 12px;font-size:12px;outline:${on?'2px solid var(--gold)':'none'};opacity:${on?'1':'.65'}">${on?'✓ ':''}${esc(g)}</button>`;
    }).join('');
  };
  renderChoices();
  $('#tgPickBox',m).onclick=e=>{
    const btn=e.target.closest('[data-ptg]');if(!btn)return;
    const g=btn.dataset.ptg;
    if(selected.includes(g)){
      selected=selected.filter(x=>x!==g);
    }else{
      selected=[...selected,g].slice(-3);
    }
    renderChoices();
  };
  $('#tgPickSave',m).onclick=()=>{
    if(!selected.length)selected=devMode?['Developer','LVL 99']:[me.accountType==='account'?'Newbie':'Guest Pass'];
    me.tags=selected.slice(0,3);
    m.close();persistProfileChanges('Tags updated');
  };
}

function buildProfile(){
  cleanExpiredUnlocks();
  refreshDevMode();
  const invCode=getInviteCode(), daysCount=new Set(me.activeDays||[]).size;
  const fxLists=typeof FX_USER_LISTS!=='undefined'?FX_USER_LISTS:{};
  const frameList=mergePairs(typeof USER_FRAMES!=='undefined'?USER_FRAMES:[],fxLists.frame);
  const bannerList=mergePairs(typeof BANNERS!=='undefined'?BANNERS:[],fxLists.banner);
  const textList=mergePairs(typeof TEXTS!=='undefined'?TEXTS:[],fxLists.text);
  const msgList=mergePairs(typeof MSGS!=='undefined'?MSGS:[],fxLists.msg);

  const curFrameLabel=labelForPair(frameList,me.frame,'Plain');
  const curBannerLabel=labelForPair(bannerList,me.banner,'Aurora');
  const curTextLabel=labelForPair(textList,me.textStyle,'Normal');
  const curMsgLabel=labelForPair(msgList,me.msgStyle,'Normal Msg');
  const curBioLabel=labelForPair(BIOS,me.bioStyle,'Normal');

  const devWalletHtml=devMode?`
    <div class="card pf-dev-wallet">
      <div class="row" style="justify-content:space-between">
        <b style="color:var(--gold)">Developer Wallet Controls</b>
        <span class="p-tag p-tag-dev-sig" style="font-size:10px;padding:2px 8px">DEV ONLY</span>
      </div>
      <p style="font-size:12px;color:var(--mu);margin-top:4px">Adjust your own Developer ID coins or reset Coins / EXP to 0 cleanly.</p>
      <div class="row" style="margin-top:8px">
        <input id="devSelfCoin" type="number" placeholder="± coins (e.g. 500 or -100)" style="flex:1">
        <button type="button" class="btn sm gold" id="devSelfApply">Apply</button>
      </div>
      <button type="button" class="btn ghost full" id="devSelfReset" style="margin-top:8px">${UI_SVG.reset} Reset My Coins / EXP to 0</button>
    </div>
  `:'';

  $('#v-profile').innerHTML=`
    <div class="row" style="justify-content:space-between;margin-bottom:10px">
      <h2 style="margin:0">${tr('yp')}</h2>
      <button class="btn ghost sm" id="accBtn">${me.accountType==='account'?'Account · Logout':'Register / Login'}</button>
    </div>

    <div class="bn-box pf-banner-tap ${esc(me.banner||'bn-aurora')}" id="pBanner" title="Tap to change Banner">
      <button type="button" class="pf-banner-edit-btn" id="tapBannerBtn">${UI_SVG.banner} Change Banner</button>
      <div class="pf">
        <button type="button" class="pf-av-btn" id="tapAvatarBtn" aria-label="Change Avatar">
          ${av(me,78)}
          <span class="pf-av-edit-dot">${UI_SVG.edit}</span>
        </button>
        <b id="pnamePrev" class="${esc(me.textStyle||'')}" style="font-size:19px">${esc(me.name)}</b>
        <div class="row wrap" style="justify-content:center">
          <span class="lvl-pill">LVL ${fmtNum(calcLevel(me.exp),MAX_LEVEL)} · ${fmtNum(me.exp,MAX_EXP)} EXP</span>
          <div class="coin">${UI_SVG.coin} <span class="coinval"></span></div>
        </div>
        <small style="opacity:.86">UID: ${esc(uid)}</small>
        <span class="streak">🔥 ${calcStreak(me.activeDays)} ${tr('streak')}</span>
        ${me.bio?`<div class="${esc(me.bioStyle||'')}" style="font-size:13px;text-align:center;max-width:440px">${esc(me.bio)}</div>`:''}
      </div>
      ${renderTags(me.tags,me)}
    </div>

    ${devWalletHtml}

    <div class="pf-picker-grid" aria-label="Customize Appearance">
      <button type="button" class="pf-pick-row" id="pickBannerRow">
        <div class="pf-pick-left"><span class="pf-pick-ico">${UI_SVG.banner}</span><div class="pf-pick-meta"><b>Banner</b><small>${esc(curBannerLabel)}</small></div></div>
        <span class="pf-pick-chev">›</span>
      </button>
      <button type="button" class="pf-pick-row" id="pickAvatarRow">
        <div class="pf-pick-left"><span class="pf-pick-ico">${typeof renderAvatarGlyph==='function'?renderAvatarGlyph(me.avatar):esc(me.avatar)}</span><div class="pf-pick-meta"><b>Avatar</b><small>Tap to pick unlocked avatar</small></div></div>
        <span class="pf-pick-chev">›</span>
      </button>
      <button type="button" class="pf-pick-row" id="pickFrameRow">
        <div class="pf-pick-left"><span class="pf-pick-ico">${UI_SVG.frame}</span><div class="pf-pick-meta"><b>Avatar Frame</b><small>${esc(curFrameLabel)}</small></div></div>
        <span class="pf-pick-chev">›</span>
      </button>
      <button type="button" class="pf-pick-row" id="pickTextRow">
        <div class="pf-pick-left"><span class="pf-pick-ico">${UI_SVG.spark}</span><div class="pf-pick-meta"><b>Name Glow</b><small>${esc(curTextLabel)}</small></div></div>
        <span class="pf-pick-chev">›</span>
      </button>
      <button type="button" class="pf-pick-row" id="pickMsgRow">
        <div class="pf-pick-left"><span class="pf-pick-ico">${UI_SVG.chat}</span><div class="pf-pick-meta"><b>Message Glow</b><small>${esc(curMsgLabel)}</small></div></div>
        <span class="pf-pick-chev">›</span>
      </button>
      <button type="button" class="pf-pick-row" id="pickBioRow">
        <div class="pf-pick-left"><span class="pf-pick-ico">${UI_SVG.bio}</span><div class="pf-pick-meta"><b>Bio Glow</b><small>${esc(curBioLabel)}</small></div></div>
        <span class="pf-pick-chev">›</span>
      </button>
      <button type="button" class="pf-pick-row" id="pickTagsRow">
        <div class="pf-pick-left"><span class="pf-pick-ico">${UI_SVG.tag}</span><div class="pf-pick-meta"><b>Profile Tags (Max 3)</b><small>${esc((me.tags||[]).join(' · '))}</small></div></div>
        <span class="pf-pick-chev">›</span>
      </button>
    </div>

    <div class="card" style="margin-top:12px">
      <h3>Profile Details</h3>
      <label for="pn">Display Name</label>
      <input id="pn" maxlength="24" value="${esc(me.name)}">
      <label for="pb">Bio</label>
      <textarea id="pb" maxlength="160" placeholder="Write a short bio...">${esc(me.bio)}</textarea>
      <label for="ph">Hobbies</label>
      <input id="ph" maxlength="80" value="${esc(me.hobbies||'')}" placeholder="Math, coding, chess...">
      <button class="btn full" id="psv">Save Profile Details</button>
    </div>

    <div class="card" style="margin-top:10px">
      <b>Refer &amp; Earn (Logged-In Only · 3 Days)</b>
      <p style="color:var(--mu);font-size:12px;margin-top:3px">Active days: <b>${daysCount}/3</b> · Referrer gets +50 coins</p>
      ${invCode?`<div class="row wrap" style="margin-top:8px"><span class="dur-pill">${esc(invCode)}</span><button class="btn sm" id="refShare">Share Link</button></div>`:`<button class="btn ghost sm" style="margin-top:8px" id="refLogin">Login for Invite Code</button>`}
    </div>
  `;

  updateHud();
  $('#accBtn').onclick=openAuthModal;
  if($('#refLogin'))$('#refLogin').onclick=openAuthModal;
  if($('#refShare'))$('#refShare').onclick=shareInvite;

  /* Tap Banner -> Banner Picker; Tap Avatar -> Avatar Picker */
  $('#pBanner').onclick=e=>{
    if(e.target.closest('#tapAvatarBtn'))return;
    openBannerPicker(bannerList);
  };
  $('#tapBannerBtn').onclick=e=>{e.stopPropagation();openBannerPicker(bannerList)};
  $('#tapAvatarBtn').onclick=e=>{e.stopPropagation();openAvatarPicker()};

  /* Tap-to-Pick rows */
  $('#pickBannerRow').onclick=()=>openBannerPicker(bannerList);
  $('#pickAvatarRow').onclick=()=>openAvatarPicker();
  $('#pickFrameRow').onclick=()=>openFramePicker(frameList);
  $('#pickTextRow').onclick=()=>openStylePicker('Name Glow',textList,me.textStyle,'text:','textStyle','text');
  $('#pickMsgRow').onclick=()=>openStylePicker('Message Glow',msgList,me.msgStyle,'msg:','msgStyle','msg');
  $('#pickBioRow').onclick=()=>openStylePicker('Bio Glow',BIOS,me.bioStyle,'bio:','bioStyle','bio');
  $('#pickTagsRow').onclick=()=>openTagPicker();

  /* Developer-only Self Wallet Controls */
  if(devMode&&$('#devSelfApply')){
    $('#devSelfApply').onclick=()=>{
      const delta=Math.trunc(+$('#devSelfCoin').value);
      if(!delta)return toast('Enter a valid coin amount');
      devAdjustUserCoins(uid,delta);
    };
    $('#devSelfReset').onclick=()=>devResetUserProgress(uid);
  }

  $('#pn').oninput=()=>{const prev=$('#pnamePrev');if(prev)prev.textContent=$('#pn').value.trim()||me.name};
  $('#psv').onclick=()=>{
    me.name=$('#pn').value.trim()||'Player '+uid.slice(-4);
    me.bio=$('#pb').value.trim();
    me.hobbies=$('#ph').value.trim();
    bumpStat('profile_save');
    persistProfileChanges('Profile saved');
  };
}

function checkReferralPayout(){
  if(!online||me.accountType!=='account'||!me.referredBy||me.referralRewardClaimed)return;
  if(new Set(me.activeDays).size>=3){me.referralRewardClaimed=true;saveMe();dbOp(()=>F.setDoc(F.doc(db,'referrals',uid),{uid,code:me.referredBy,paid:false,ts:Date.now()}))}
}
$('#banLogin').onclick=openAuthModal;
