"use strict";

function applyDevUI(){
  refreshDevMode();
  const dbBadge=$('#devBadge');
  if(dbBadge)dbBadge.hidden=!devMode;
  $$('.dev-only').forEach(el=>el.hidden=!devMode);
}

function switchToIdentity(nextUid,nextProfileObj){
  const isAccountSwitch=nextUid!==uid||(nextProfileObj&&nextProfileObj.accountType&&nextProfileObj.accountType!==me.accountType);
  if(isAccountSwitch)$$('#modals .mb').forEach(b=>b.remove());
  cur=null;$('#thread').hidden=true;
  uid=nextUid;localStorage.setItem('sg_uid',uid);
  me=normalizeProfile(nextProfileObj,nextUid);
  refreshDevMode();
  stats={calc_open:0,pdf_open:0,tool_open:0,profile_save:0,games_played:0,store_buy:0,ad_watch:0,gifts_sent:0,party_join:0,...ls.get('sg_stats_'+uid,{})};
  chats=ls.get('sg_chats_'+uid,{});ensureDevChat();
  saveMe();saveStats();applyDevUI();checkBan();checkDailyLoginBonus();
  if(typeof checkPendingWarnings==='function')checkPendingWarnings();
  if(typeof checkPendingProposals==='function')checkPendingProposals();
  dbOp(()=>F.setDoc(userRef(uid),{...base(),createdAt:Date.now()},{merge:true}));
  claimRankReward();updateUnreadDots();updateHud();buildProfile();renderAll();showTab('tools');
}

function openAuthModal(){
  const signedInGoogle=me.accountType==='account';
  const m=modal('Google Account',`
    <div class="auth-status-card">
      <div class="auth-status-label">${signedInGoogle?'Signed in with Google':'Guest Session'}</div>
      <div class="auth-status-val">${signedInGoogle?esc(me.accountId):('Guest ID: '+esc(uid))}</div>
      <small>${signedInGoogle?'Your coins, Gift Vault, VIP Pass, and Bonds sync securely across devices & APK.':'Guest sessions auto-clean after 7 days of inactivity. Sign in with Google to save permanently.'}</small>
    </div>
    ${!signedInGoogle?`
      <label for="auRef">Invite Code (optional)</label>
      <input id="auRef" type="text" placeholder="REF_..." value="${esc(me.referredBy||REF_PARAM)}" autocomplete="off">
      <button type="button" class="btn google-btn full" id="auGoogle">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12z"/>
        </svg>
        Continue with Google
      </button>
    `:`<button type="button" class="btn red full" id="auLogout">Sign Out of Google</button>`}
  `);

  if($('#auGoogle',m)){
    $('#auGoogle',m).onclick=async()=>{
      const refCode=($('#auRef',m)?.value||'').trim().toUpperCase();
      if(refCode){me.referredBy=refCode;saveMe()}
      const btn=$('#auGoogle',m);
      if(typeof signInWithGoogleReliable==='function'){
        const ok=await signInWithGoogleReliable(btn);
        if(ok)m.close();
        return;
      }
      toast('Connecting… try again in a moment');
    };
  }

  if($('#auLogout',m)){
    $('#auLogout',m).onclick=async()=>{
      if(!auth||!AUTH){m.close();return}
      try{await AUTH.signOut(auth);await AUTH.signInAnonymously(auth)}catch(e){toast(authMsg(e))}
      m.close();toast('Signed out');
    };
  }
}

function mergePairs(baseList,fxList){
  const seen=new Set(),out=[];
  [...(baseList||[]),...(fxList||[])].forEach(item=>{
    if(!Array.isArray(item)||seen.has(item[0]))return;
    seen.add(item[0]);out.push(item);
  });
  return out;
}

function labelForPair(list, val, fallback){
  const found=(list||[]).find(x=>x[0]===val);
  return found?found[1]:(fallback||val||'Default');
}

function persistProfileChanges(msg){
  me=normalizeProfile(me,uid);
  if(typeof evaluateAchievementTitles==='function')evaluateAchievementTitles();
  saveMe();
  patchUser(uid,base());
  dbOp(()=>F.setDoc(userRef(uid),base(),{merge:true}));
  updateHud();
  buildProfile();
  renderAll();
  if(msg)toast(msg);
}

/* ===== Client-Side Circular Photo Crop & Compression (< 220px JPEG) ===== */
function cropSquareAvatarDataUrl(file, size=200){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=reject;
    reader.onload=()=>{
      const img=new Image();
      img.onerror=reject;
      img.onload=()=>{
        const side=Math.min(img.width,img.height);
        const sx=Math.floor((img.width-side)/2);
        const sy=Math.floor((img.height-side)/2);
        const c=document.createElement('canvas');
        c.width=size;c.height=size;
        const ctx=c.getContext('2d');
        ctx.drawImage(img,sx,sy,side,side,0,0,size,size);
        let q=0.76, out=c.toDataURL('image/jpeg',q);
        while(out.length>48000&&q>0.4){q-=0.08;out=c.toDataURL('image/jpeg',q)}
        resolve(out);
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function openBannerPicker(bannerList){
  const unlocked=bannerList.filter(b=>isUnlocked('banner:'+b[0]));
  const m=modal('Cover Banner',`
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
  let tab='boys';
  const boys=typeof FX_BOY_AVATARS!=='undefined'?FX_BOY_AVATARS:['av_b1','av_b2','av_b3','av_b4','av_b5'];
  const girls=typeof FX_GIRL_AVATARS!=='undefined'?FX_GIRL_AVATARS:['av_g1','av_g2','av_g3','av_g4','av_g5'];
  const lbAvs=(typeof LB_EXCLUSIVE_AVATARS!=='undefined'?Object.keys(LB_EXCLUSIVE_AVATARS):[]).filter(em=>isUnlocked('avatar:'+em));

  const m=modal('Avatar & Custom Photo',`
    <div class="av-upload-box">
      <div id="avUploadPrev">${av(me,68)}</div>
      <div class="mid">
        <b>Upload Custom Photo</b>
        <small style="display:block;color:var(--mu)">Auto-cropped circularly &amp; compressed for fast cloud sync.</small>
        <label class="btn sm gold" style="display:inline-flex;margin-top:6px;cursor:pointer">
          Choose Photo
          <input type="file" id="avPhotoIn" accept="image/*" hidden>
        </label>
      </div>
    </div>
    <div class="row" style="gap:6px;margin:12px 0 8px" id="avCatTabs">
      <button type="button" class="btn sm" data-avcat="boys">Boys (5)</button>
      <button type="button" class="btn ghost sm" data-avcat="girls">Girls (5)</button>
      ${lbAvs.length?`<button type="button" class="btn ghost sm" data-avcat="crests">Top Crests (${lbAvs.length})</button>`:''}
    </div>
    <div class="pick" id="avGridBox"></div>
  `);

  const paint=()=>{
    $$('[data-avcat]',m).forEach(b=>{
      b.className=b.dataset.avcat===tab?'btn sm':'btn ghost sm';
    });
    const list=tab==='girls'?girls:(tab==='crests'?lbAvs:boys);
    $('#avGridBox',m).innerHTML=list.map(em=>{
      const meta=(typeof FX_AVATAR_META!=='undefined'&&FX_AVATAR_META[em])||(typeof LB_EXCLUSIVE_AVATARS!=='undefined'&&LB_EXCLUSIVE_AVATARS[em])||{name:em};
      return `<button type="button" class="av-pick-tile ${em===me.avatar?'on':''}" data-pickav="${esc(em)}" title="${esc(meta.name)}">
        <span class="av-pick-circle">${typeof renderAvatarGlyph==='function'?renderAvatarGlyph(em):esc(em)}</span>
        <small>${esc(meta.name)}</small>
      </button>`;
    }).join('');
  };
  paint();

  $('#avCatTabs',m).onclick=e=>{
    const b=e.target.closest('[data-avcat]');if(!b)return;
    tab=b.dataset.avcat;paint();
  };
  $('#avGridBox',m).onclick=e=>{
    const b=e.target.closest('[data-pickav]');if(!b)return;
    me.avatar=b.dataset.pickav;
    m.close();persistProfileChanges('Avatar updated');
  };
  $('#avPhotoIn',m).onchange=async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      const dataUrl=await cropSquareAvatarDataUrl(file,200);
      me.avatar=dataUrl;
      m.close();persistProfileChanges('Custom profile photo uploaded!');
    }catch{
      toast('Could not process image. Try a JPG or PNG photo.');
    }
  };
}

function openFramePicker(frameList){
  const unlocked=frameList.filter(f=>isUnlocked('frame:'+f[0]));
  const m=modal('Avatar Frame',`
    <div class="pick">
      ${unlocked.map(f=>`<button type="button" class="${f[0]===me.frame?'on':''}" data-pickfr="${esc(f[0])}" style="min-width:76px;padding:8px 6px">${av({avatar:me.avatar,frame:f[0]},42)}<small style="font-size:10px;max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(f[1])}</small></button>`).join('')}
    </div>
  `);
  m.onclick=e=>{
    const btn=e.target.closest('[data-pickfr]');if(!btn)return;
    me.frame=btn.dataset.pickfr;
    m.close();persistProfileChanges('Frame updated');
  };
}

function openStylePicker(title, list, currentVal, keyPrefix, fieldName, previewType){
  const unlocked=list.filter(item=>isUnlocked(keyPrefix+item[0]));
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

  const m=modal('Profile Tags (Max 3)',`
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
    if(selected.includes(g))selected=selected.filter(x=>x!==g);
    else selected=[...selected,g].slice(-3);
    renderChoices();
  };
  $('#tgPickSave',m).onclick=()=>{
    if(!selected.length)selected=devMode?['Developer','LVL 99']:[me.accountType==='account'?'Newbie':'Guest Pass'];
    me.tags=selected.slice(0,3);
    m.close();persistProfileChanges('Tags updated');
  };
}

/* ===== WePlay-Style Grouped List Edit Profile Modal ===== */
function openFieldEditorModal(title, fieldHtml, onSave){
  const fm=modal(title,`${fieldHtml}<button type="button" class="btn gold full" id="feSave" style="margin-top:12px">Save</button>`,'wp-mini-edit');
  $('#feSave',fm).onclick=()=>{
    if(onSave(fm)!==false){
      fm.close();
      bumpStat('profile_save');
      persistProfileChanges(title+' updated');
    }
  };
  return fm;
}

function openEditProfileModal(bannerList, frameList){
  if(typeof evaluateAchievementTitles==='function')evaluateAchievementTitles();
  const titles=typeof ACHIEVEMENT_TITLES!=='undefined'?ACHIEVEMENT_TITLES:[];
  const unlockedTitles=Array.isArray(me.unlockedTitles)?me.unlockedTitles:[];
  const curFrameLabel=labelForPair(frameList,me.frame,'Plain');
  const curBannerLabel=labelForPair(bannerList,me.banner,'Aurora');
  const gSvg=typeof GLOSSY_SVG!=='undefined'?GLOSSY_SVG:null;
  const gLow=String(me.gender||'').toLowerCase();
  const genderLbl=gLow==='male'?'Male':(gLow==='female'?'Female':'Set');
  const flag=typeof getRegionFlag==='function'?getRegionFlag(me.region||'India'):'🇮🇳';
  const regionName=me.region||'India';
  const shortId=String(uid||'').slice(-8);
  const badgeIcons=gSvg?`${gSvg.badge('gold_star')}${gSvg.badge('mic_pro')}${gSvg.badge('crown_vip')}`:'★★★';

  const m=modal('Edit Profile',`
    <div class="wp-edit-group">
      <button type="button" class="wp-edit-row" id="erAvatar">
        <span class="wp-er-lbl">Avatar</span>
        <span class="wp-er-val">${av(me,36)}<i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="erName">
        <span class="wp-er-lbl">Nickname</span>
        <span class="wp-er-val"><em>${esc(me.name)}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="erUid">
        <span class="wp-er-lbl">User ID</span>
        <span class="wp-er-val"><em>${esc(shortId)}</em><i class="wp-chev">⧉</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="erFrame">
        <span class="wp-er-lbl">Frame</span>
        <span class="wp-er-val"><em>${esc(curFrameLabel)}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="erBanner">
        <span class="wp-er-lbl">Cover</span>
        <span class="wp-er-val"><em>${esc(curBannerLabel)}</em><i class="wp-chev">›</i></span>
      </button>
    </div>

    <div class="wp-edit-group">
      <button type="button" class="wp-edit-row" id="erGender">
        <span class="wp-er-lbl">Gender</span>
        <span class="wp-er-val"><em>${esc(genderLbl)}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="erBday">
        <span class="wp-er-lbl">Birthday</span>
        <span class="wp-er-val"><em>${esc(me.birthday||'Set')}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="erRegion">
        <span class="wp-er-lbl">Region</span>
        <span class="wp-er-val"><em>${flag} ${esc(regionName)}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="erBio">
        <span class="wp-er-lbl">Signature</span>
        <span class="wp-er-val"><em class="wp-er-trunc">${esc(me.bio||'Add')}</em><i class="wp-chev">›</i></span>
      </button>
    </div>

    <div class="wp-edit-group">
      <button type="button" class="wp-edit-row" id="erTitle">
        <span class="wp-er-lbl">Title</span>
        <span class="wp-er-val"><em>${esc(me.title||'None')}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="erBadge">
        <span class="wp-er-lbl">Badge</span>
        <span class="wp-er-val"><span class="wp-er-badges">${badgeIcons}</span><i class="wp-chev">›</i></span>
      </button>
      <div class="wp-edit-row static">
        <span class="wp-er-lbl">Level</span>
        <span class="wp-er-val"><em>Lv.${fmtNum(calcLevel(me.exp),MAX_LEVEL)}</em></span>
      </div>
    </div>
  `,'wp-edit-sheet');

  const reopen=()=>{m.close();openEditProfileModal(bannerList,frameList)};

  $('#erAvatar',m).onclick=()=>{m.close();openAvatarPicker()};
  $('#erFrame',m).onclick=()=>{m.close();openFramePicker(frameList)};
  $('#erBanner',m).onclick=()=>{m.close();openBannerPicker(bannerList)};
  $('#erUid',m).onclick=()=>{if(typeof copyTextClean==='function')copyTextClean(uid,'UID')};
  $('#erBadge',m).onclick=()=>{m.close();openTagPicker()};

  $('#erName',m).onclick=()=>{
    openFieldEditorModal('Nickname',`<input id="feIn" maxlength="24" value="${esc(me.name)}" placeholder="Nickname">`,fm=>{
      me.name=$('#feIn',fm).value.trim()||'Player '+uid.slice(-4);
      setTimeout(reopen,40);
    });
  };
  $('#erGender',m).onclick=()=>{
    openFieldEditorModal('Gender',`
      <select id="feGen">
        <option value="" ${!me.gender?'selected':''}>Hidden</option>
        <option value="male" ${me.gender==='male'?'selected':''}>♂ Male</option>
        <option value="female" ${me.gender==='female'?'selected':''}>♀ Female</option>
      </select>
    `,fm=>{me.gender=$('#feGen',fm).value||'';setTimeout(reopen,40)});
  };
  $('#erBday',m).onclick=()=>{
    openFieldEditorModal('Birthday',`<input id="feBd" type="date" value="${esc((me.birthday||'').replace(/\//g,'-'))}">`,fm=>{
      const v=$('#feBd',fm).value||'';
      me.birthday=v?v.replace(/-/g,'/'):'';
      setTimeout(reopen,40);
    });
  };
  $('#erRegion',m).onclick=()=>{
    const opts=typeof REGION_OPTIONS!=='undefined'?REGION_OPTIONS:[{code:'India',flag:'🇮🇳'},{code:'Global',flag:'🌐'}];
    openFieldEditorModal('Region',`
      <select id="feReg">${opts.map(r=>`<option value="${esc(r.code)}" ${(me.region||'India')===r.code?'selected':''}>${r.flag} ${esc(r.code)}</option>`).join('')}</select>
    `,fm=>{me.region=$('#feReg',fm).value||'India';setTimeout(reopen,40)});
  };
  $('#erBio',m).onclick=()=>{
    openFieldEditorModal('Signature',`<textarea id="feBio" maxlength="120" placeholder="Short signature...">${esc(me.bio||'')}</textarea>`,fm=>{
      me.bio=$('#feBio',fm).value.trim();
      setTimeout(reopen,40);
    });
  };
  $('#erTitle',m).onclick=()=>{
    openFieldEditorModal('Title',`
      <select id="feTit">
        <option value="">None</option>
        ${titles.map(t=>{
          const lbl=t.name||t.id;
          const ok=devMode||unlockedTitles.includes(t.id);
          return `<option value="${esc(lbl)}" ${me.title===lbl?'selected':''} ${!ok?'disabled':''}>${esc(lbl)}${ok?'':' (Locked)'}</option>`;
        }).join('')}
      </select>
    `,fm=>{me.title=$('#feTit',fm).value||'';setTimeout(reopen,40)});
  };
}

function buildProfile(){
  cleanExpiredUnlocks();
  refreshDevMode();
  if(typeof evaluateAchievementTitles==='function')evaluateAchievementTitles();
  const invCode=getInviteCode(), daysCount=new Set(me.activeDays||[]).size;
  const fxLists=typeof FX_USER_LISTS!=='undefined'?FX_USER_LISTS:{};
  const frameList=mergePairs(typeof USER_FRAMES!=='undefined'?USER_FRAMES:[],fxLists.frame);
  const bannerList=mergePairs(typeof BANNERS!=='undefined'?BANNERS:[],fxLists.banner);
  const textList=mergePairs(typeof TEXTS!=='undefined'?TEXTS:[],fxLists.text);
  const msgList=mergePairs(typeof MSGS!=='undefined'?MSGS:[],fxLists.msg);

  const curFrameLabel=labelForPair(frameList,me.frame,'Plain');
  const curBannerLabel=labelForPair(bannerList,me.banner,'Aurora');
  const curTextLabel=labelForPair(textList,me.textStyle,'Normal');
  const curMsgLabel=labelForPair(msgList,me.msgStyle,'Normal');
  const curBioLabel=labelForPair(BIOS,me.bioStyle,'Normal');
  const vip=typeof getActiveVipTier==='function'?getActiveVipTier(me):null;
  const pendingReportsCount=typeof reportsList!=='undefined'&&Array.isArray(reportsList)?reportsList.filter(r=>r.status==='open').length:0;
  const gSvg=typeof GLOSSY_SVG!=='undefined'?GLOSSY_SVG:{};
  const lvl=calcLevel(me.exp);
  const expInLvl=Number(me.exp||0)%100;
  const flag=typeof getRegionFlag==='function'?getRegionFlag(me.region||'India'):'🇮🇳';
  const genderChip=me.gender==='male'?'<span class="wp-gender m">♂</span>':(me.gender==='female'?'<span class="wp-gender f">♀</span>':'');
  const shortId=String(uid||'').slice(-8);

  const bondsHtml=typeof renderBondsGridHtml==='function'?renderBondsGridHtml(me,true):'';

  const visitors=(Array.isArray(me.visitors)?me.visitors:[]).slice(0,10);
  const visitorsHtml=`
    <div class="wp-section-card">
      <div class="wp-sec-head" style="cursor:default">
        <div class="row" style="gap:6px"><b>Visitors</b><span class="wp-vis-cnt">${visitors.length}</span></div>
        <span style="font-size:12px;color:var(--mu);font-weight:700">❤️ ${fmtNum(me.likesCount||0)}</span>
      </div>
      ${visitors.length?`<div class="visitors-row" style="margin-top:8px">
        ${visitors.map(v=>`<button type="button" class="visitor-chip" data-prof-link="${esc(v.uid)}">
          ${av({avatar:v.avatar||'av_b1',frame:v.frame||'none'},34)}
          <small>${esc(v.name||'Player')}</small>
        </button>`).join('')}
      </div>`:'<div style="font-size:12px;color:var(--mu);padding-top:4px">No visitors yet</div>'}
    </div>
  `;

  const devWalletHtml=(typeof isDevSession==='function'?isDevSession():devMode)?`
    <div class="card pf-dev-wallet">
      <div class="row" style="justify-content:space-between">
        <b style="color:var(--gold)">Developer Control Center</b>
        <span class="p-tag p-tag-dev-sig" style="font-size:10px;padding:2px 8px">DEV ONLY</span>
      </div>
      <button type="button" class="btn crimson full" id="devOpenModCenterBtn" style="margin-top:8px">
        🛡️ Reports &amp; Moderation <span id="devReportBadge" class="mod-badge">${pendingReportsCount}</span>
      </button>
      <button type="button" class="btn red full" id="devClearFakeVoiceBtn" style="margin-top:8px">
        🧹 Clear Fake / Stale Voice Rooms
      </button>
      <div class="row" style="margin-top:8px">
        <input id="devSelfCoin" type="number" placeholder="± my coins" style="flex:1">
        <button type="button" class="btn sm gold" id="devSelfApply">Apply</button>
      </div>
      <button type="button" class="btn ghost full" id="devSelfReset" style="margin-top:8px">${UI_SVG.reset} Reset Coins / EXP</button>
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--bd)">
        <input id="devPmSearch" type="text" placeholder="Search player name or UID..." autocomplete="off">
        <div class="dev-pm-list" id="devPmList"></div>
      </div>
    </div>
  `:'';

  const giftWallSt = typeof getGiftWallStatsForUser === 'function' ? getGiftWallStatsForUser(me) : { totalReceivedCount: 0, totalCharm: Number(me.charm || 0) };
  const streakDays = calcStreak(me.activeDays);
  const rankBadgeObj = typeof getActiveRankBadge === 'function' ? getActiveRankBadge(me) : null;

  $('#v-profile').innerHTML=`
    <div class="wp-prof-cover bn-box pf-banner-tap v13-prof-hero ${esc(me.banner||'bn-aurora')}" id="pBanner">
      <div class="wp-prof-cover-acts">
        <button type="button" class="wp-cover-pill" id="editProfileBtn">Edit</button>
        <button type="button" class="wp-cover-pill" id="accBtn">${me.accountType==='account'?'Google ✓':'Sign In'}</button>
        <button type="button" class="wp-cover-pill" id="tapBannerBtn">Cover</button>
      </div>
      <div class="wp-prof-top">
        <button type="button" class="pf-av-btn" id="tapAvatarBtn" aria-label="Change Avatar">
          ${av(me,78)}
          <span class="pf-live-dot" title="Online"></span>
          <span class="pf-av-edit-dot">${UI_SVG.edit}</span>
        </button>
        <div class="wp-prof-id">
          <div class="wp-prof-name-row">
            <b id="pnamePrev" class="${esc(me.textStyle||'')}">${esc(me.name)}</b>
            <span>${flag}</span>
            ${genderChip}
          </div>
          <div class="wp-prof-pills">
            ${vip?`<span class="wp-pill vip">👑 ${esc(vip.toUpperCase())}</span>`:`<span class="wp-pill rank">✦ LVL ${fmtNum(lvl,MAX_LEVEL)}</span>`}
            ${rankBadgeObj?`<span class="wp-pill gold">${esc(rankBadgeObj.badge)}</span>`:''}
            ${me.clanTag?`<span class="wp-pill clan">[${esc(me.clanTag)}]</span>`:''}
          </div>
          <div class="wp-lv-bar">
            <span>Lv.${fmtNum(lvl,MAX_LEVEL)}</span>
            <div class="wp-lv-track"><i style="width:${Math.max(8,expInLvl)}%"></i></div>
            <small>${expInLvl}/100</small>
          </div>
          <div class="wp-prof-sub">
            <button type="button" class="wp-id-copy" id="pfCopyMyId">ID ${esc(shortId)} ⧉</button>
            <span>❤️ ${fmtNum(me.likesCount||0)}</span>
          </div>
        </div>
      </div>
      ${renderTags(me.tags,me)}
      <div class="v13-stats-strip" aria-label="Profile Quick Stats">
        <div class="v13-st-cell"><b>Lv.${fmtNum(lvl,MAX_LEVEL)}</b><small>Level</small></div>
        <div class="v13-st-cell gold"><b class="coinval">${fmtNum(me.coins)}</b><small>Coins</small></div>
        <div class="v13-st-cell charm"><b>${fmtNum(giftWallSt.totalCharm||me.charm||0)}</b><small>Charm</small></div>
        <div class="v13-st-cell"><b>${fmtNum(giftWallSt.totalReceivedCount||0)}</b><small>Gifts</small></div>
        <div class="v13-st-cell"><b>${streakDays}d 🔥</b><small>Streak</small></div>
      </div>
    </div>

    ${me.bio?`<div class="wp-sig-box"><span class="${esc(me.bioStyle||'')}">${esc(me.bio)}</span></div>`:''}

    <div class="wp-me-shortcuts">
      <button type="button" class="wp-sc-btn" id="scVipBtn">
        <span>${gSvg.vip||'💎'}</span>
        <b>VIP</b>
      </button>
      <button type="button" class="wp-sc-btn" id="scShopBtn">
        <span>${gSvg.shop||'🛍️'}</span>
        <b>Store</b>
      </button>
      <button type="button" class="wp-sc-btn" id="pfSpinBtn">
        <span>${gSvg.spin||'🎡'}</span>
        <b>Spin</b>
      </button>
      <button type="button" class="wp-sc-btn" id="pfClanBtn">
        <span>${gSvg.clans||'🛡️'}</span>
        <b>Clans</b>
      </button>
    </div>

    ${bondsHtml}

    ${visitorsHtml}

    ${devWalletHtml}

    ${typeof renderGiftWallHtml==='function'?renderGiftWallHtml(me,true):''}

    <div class="wp-edit-group" style="margin-top:10px" aria-label="Profile Settings">
      <button type="button" class="wp-edit-row" id="pickEditRow">
        <span class="wp-er-lbl">Edit Profile</span>
        <span class="wp-er-val"><em>Name, Gender, Region</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="pickAvatarRow">
        <span class="wp-er-lbl">Avatar &amp; Photo</span>
        <span class="wp-er-val"><em>Upload / Presets</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="pickFrameRow">
        <span class="wp-er-lbl">Avatar Frame</span>
        <span class="wp-er-val"><em>${esc(curFrameLabel)}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="pickBannerRow">
        <span class="wp-er-lbl">Cover Banner</span>
        <span class="wp-er-val"><em>${esc(curBannerLabel)}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="pickTextRow">
        <span class="wp-er-lbl">Name Glow</span>
        <span class="wp-er-val"><em>${esc(curTextLabel)}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="pickMsgRow">
        <span class="wp-er-lbl">Chat Glow</span>
        <span class="wp-er-val"><em>${esc(curMsgLabel)}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="pickBioRow">
        <span class="wp-er-lbl">Signature Glow</span>
        <span class="wp-er-val"><em>${esc(curBioLabel)}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="pickTagsRow">
        <span class="wp-er-lbl">Badges &amp; Tags</span>
        <span class="wp-er-val"><em>${esc((me.tags||[]).slice(0,2).join(' · '))}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="pfInviteRow">
        <span class="wp-er-lbl">Invite Friends</span>
        <span class="wp-er-val"><em style="color:var(--gold)">+50 🪙 (${Math.min(3,daysCount)}/3)</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="pfSfxRow" data-sfx-toggle="1" aria-pressed="${typeof SFX!=='undefined'&&SFX.isMuted()?'true':'false'}">
        <span class="wp-er-lbl">Sound FX</span>
        <span class="wp-er-val"><em data-sfx-label>${typeof SFX!=='undefined'&&SFX.isMuted()?'Off':'On'}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="pfVoiceToneRow" aria-label="Switch AI Voice Chat Tone">
        <span class="wp-er-lbl">AI Quick Voice Tone</span>
        <span class="wp-er-val"><em data-voice-tone-label>${typeof QuickVoice!=='undefined'&&QuickVoice.getTone()==='male'?'Male':'Female'}</em><i class="wp-chev">›</i></span>
      </button>
      <button type="button" class="wp-edit-row" id="pfInstallRow" ${typeof PWA!=='undefined'&&PWA.isStandalone()?'hidden':''}>
        <span class="wp-er-lbl">Install App</span>
        <span class="wp-er-val"><em data-pwa-sub>PWA</em><i class="wp-chev">›</i></span>
      </button>
    </div>
  `;

  updateHud();
  if(typeof SFX!=='undefined')SFX.syncButtons();
  if(typeof PWA!=='undefined')PWA.syncUI();
  if(typeof bindGiftWallEvents==='function')bindGiftWallEvents($('#v-profile'),me,true);
  $('#accBtn').onclick=e=>{e.stopPropagation();openAuthModal()};
  if($('#editProfileBtn'))$('#editProfileBtn').onclick=e=>{e.stopPropagation();openEditProfileModal(bannerList,frameList)};
  if($('#pickEditRow'))$('#pickEditRow').onclick=()=>openEditProfileModal(bannerList,frameList);
  if($('#pfCopyMyId'))$('#pfCopyMyId').onclick=e=>{e.stopPropagation();if(typeof copyTextClean==='function')copyTextClean(uid,'UID')};
  if($('#scVipBtn'))$('#scVipBtn').onclick=()=>showTab('store');
  if($('#scShopBtn'))$('#scShopBtn').onclick=()=>showTab('store');
  if($('#pfClanBtn'))$('#pfClanBtn').onclick=()=>{if(typeof openClansModal==='function')openClansModal()};
  if($('#pfSpinBtn'))$('#pfSpinBtn').onclick=()=>{if(typeof openLuckySpinModal==='function')openLuckySpinModal()};
  if($('#pfInviteRow'))$('#pfInviteRow').onclick=()=>{if(invCode)openReferShareModal();else openAuthModal()};

  $$('[data-open-bonds]',$('#v-profile')).forEach(el=>{
    el.onclick=e=>{e.stopPropagation();if(typeof openBondsShowcaseModal==='function')openBondsShowcaseModal(me)};
  });
  $$('[data-unlock-bond]',$('#v-profile')).forEach(el=>{
    el.onclick=e=>{
      e.stopPropagation();
      const preGift=el.dataset.bondGift||'g_ring_royal';
      if(typeof openGiftSendModal==='function')openGiftSendModal('',{allowPickPlayer:true,preselectFilter:'rings',preselectGiftId:preGift});
    };
  });
  $$('[data-unbind-slot]',$('#v-profile')).forEach(el=>{
    el.onclick=e=>{
      e.stopPropagation();
      const slot=el.dataset.unbindSlot;
      if(typeof unbindMyBondSlot==='function')unbindMyBondSlot(slot);
    };
  });
  $$('[data-accept-bond]',$('#v-profile')).forEach(el=>{
    el.onclick=e=>{
      e.stopPropagation();
      if(typeof acceptPendingBondProposal==='function')acceptPendingBondProposal(el.dataset.acceptBond);
    };
  });
  $$('[data-decline-bond]',$('#v-profile')).forEach(el=>{
    el.onclick=e=>{
      e.stopPropagation();
      if(typeof declinePendingBondProposal==='function')declinePendingBondProposal(el.dataset.declineBond);
    };
  });
  $$('[data-prof-link]',$('#v-profile')).forEach(btn=>{
    btn.onclick=e=>{e.stopPropagation();openPublicProfile(btn.dataset.profLink)};
  });
  if($('#pfSfxRow'))$('#pfSfxRow').onclick=()=>{
    if(typeof SFX!=='undefined'){
      const isOff=SFX.toggle();
      toast(isOff?'Sound FX muted':'Sound FX enabled');
    }
  };
  if($('#pfVoiceToneRow'))$('#pfVoiceToneRow').onclick=()=>{
    if(typeof QuickVoice!=='undefined'){
      const next=QuickVoice.toggleTone();
      toast(`AI Voice Tone set to ${next==='male'?'Male':'Female'}`);
    }
  };
  if($('#pfInstallRow'))$('#pfInstallRow').onclick=()=>{
    if(typeof PWA!=='undefined')PWA.triggerInstall();
  };

  /* Tap Banner -> Banner Picker; Tap Avatar -> Avatar Picker */
  $('#pBanner').onclick=e=>{
    if(e.target.closest('button'))return;
    openBannerPicker(bannerList);
  };
  $('#tapBannerBtn').onclick=e=>{e.stopPropagation();openBannerPicker(bannerList)};
  $('#tapAvatarBtn').onclick=e=>{e.stopPropagation();openAvatarPicker()};

  /* Tap-to-Pick rows */
  $('#pickBannerRow').onclick=()=>openBannerPicker(bannerList);
  $('#pickAvatarRow').onclick=()=>openAvatarPicker();
  $('#pickFrameRow').onclick=()=>openFramePicker(frameList);
  $('#pickTextRow').onclick=()=>openStylePicker('Name Glow',textList,me.textStyle,'text:','textStyle','text');
  $('#pickMsgRow').onclick=()=>openStylePicker('Chat Glow',msgList,me.msgStyle,'msg:','msgStyle','msg');
  $('#pickBioRow').onclick=()=>openStylePicker('Signature Glow',BIOS,me.bioStyle,'bio:','bioStyle','bio');
  $('#pickTagsRow').onclick=()=>openTagPicker();

  /* Developer-only Self Wallet Controls + Moderation Center + Player Manager */
  if((typeof isDevSession==='function'?isDevSession():devMode)&&$('#devSelfApply')){
    if($('#devOpenModCenterBtn'))$('#devOpenModCenterBtn').onclick=()=>{
      if(typeof openDevModerationCenter==='function')openDevModerationCenter();
    };
    if($('#devClearFakeVoiceBtn'))$('#devClearFakeVoiceBtn').onclick=()=>{
      if(typeof clearFakeVoiceRooms==='function')clearFakeVoiceRooms();
    };
    $('#devSelfApply').onclick=()=>{
      const delta=Math.trunc(+$('#devSelfCoin').value);
      if(!delta)return toast('Enter a valid coin amount');
      devAdjustUserCoins(uid,delta);
    };
    $('#devSelfReset').onclick=()=>devResetUserProgress(uid);

    const renderDevPm=(q='')=>{
      const box=$('#devPmList');
      if(!box)return;
      const term=String(q||'').trim().toLowerCase();
      const players=allUsers()
        .filter(u=>u&&u.uid&&u.uid!==uid)
        .filter(u=>!term||String(u.name||'').toLowerCase().includes(term)||String(u.uid||'').toLowerCase().includes(term))
        .sort((a,b)=>clampCoins(b.coins)-clampCoins(a.coins))
        .slice(0,25);
      box.innerHTML=players.map(u=>{
        const gst=typeof getGiftWallStatsForUser==='function'?getGiftWallStatsForUser(u):{totalCharm:Number(u.charm||0),totalReceivedCount:0};
        const statusFlag=u.banned?'<span style="color:var(--bad);font-weight:800"> · BANNED</span>':(Number(u.mutedUntil||0)>Date.now()?'<span style="color:var(--gold);font-weight:800"> · MUTED</span>':'');
        return `<div class="dev-pm-row">
          ${av(u,34)}
          <div class="mid">
            <b>${styledName(u)}${statusFlag}</b>
            <div class="dev-pm-stats">
              <span class="dev-pm-coin">🪙 ${fmtNum(u.coins)}</span>
              <span>·</span>
              <span style="color:#f9a8d4">✨ ${fmtNum(gst.totalCharm)}</span>
              <span>·</span>
              <span>🎁 ${fmtNum(gst.totalReceivedCount)}</span>
            </div>
          </div>
          <button type="button" class="btn sm gold" data-devpm="${esc(u.uid)}">Manage</button>
        </div>`;
      }).join('')||'<div class="mp-empty">No other players found.</div>';
    };
    renderDevPm();
    if($('#devPmSearch'))$('#devPmSearch').oninput=e=>renderDevPm(e.target.value);
    if($('#devPmList'))$('#devPmList').onclick=e=>{
      const btn=e.target.closest('[data-devpm]');
      if(btn&&btn.dataset.devpm)openPublicProfile(btn.dataset.devpm);
    };
  }
}

function checkReferralPayout(){
  if(!online||me.accountType!=='account'||!me.referredBy||me.referralRewardClaimed)return;
  if(new Set(me.activeDays).size>=3){me.referralRewardClaimed=true;saveMe();dbOp(()=>F.setDoc(F.doc(db,'referrals',uid),{uid,code:me.referredBy,paid:false,ts:Date.now()}))}
}
$('#banLogin').onclick=openAuthModal;
