"use strict";
/* Gamer-First Home Hub + Slide-Out Student Tools Drawer + Poems Wall */

const TOOL_SVG={
  calc:`<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="2.5" width="16" height="19" rx="3" stroke="#7b8cff" stroke-width="2"/><path d="M7.5 7h9M7.5 11.5h2M12 11.5h.01M16.5 11.5h-2M7.5 15.5h2M12 15.5h.01M16.5 15.5h-2" stroke="#35e0b5" stroke-width="2" stroke-linecap="round"/></svg>`,
  pdf:`<svg viewBox="0 0 24 24" fill="none"><path d="M6 3h8l4 4v14H6V3z" stroke="#ff8a3d" stroke-width="2" stroke-linejoin="round"/><path d="M14 3v4h4M8.5 13h7M8.5 17h5" stroke="#ffd36b" stroke-width="2" stroke-linecap="round"/></svg>`,
  ai:`<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5l2.2 5.3L19.5 10l-5.3 2.2L12 17.5l-2.2-5.3L4.5 10l5.3-2.2L12 2.5z" stroke="#35e0b5" stroke-width="2" stroke-linejoin="round"/><path d="M19 16l.7 1.6L21.3 18.3l-1.6.7L19 20.6l-.7-1.6-1.6-.7 1.6-.7L19 16z" fill="#ffd36b"/></svg>`,
  pass:`<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="3" stroke="#2ee6c5" stroke-width="2"/><circle cx="9.5" cy="11.5" r="2.2" stroke="#ffd36b" stroke-width="1.8"/><path d="M6.5 16.5c.8-1.5 5.2-1.5 6 0M14.5 10h4M14.5 13.5h3" stroke="#7b8cff" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  retouch:`<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" stroke="#ffd36b" stroke-width="2" stroke-linejoin="round"/><path d="M18.5 15l.9 2.1L21.5 18l-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z" stroke="#ff4d6a" stroke-width="1.8"/></svg>`,
  resume:`<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2.5" stroke="#a88bff" stroke-width="2"/><circle cx="10" cy="8.5" r="2" stroke="#35e0b5" stroke-width="1.8"/><path d="M13 8.5h4M8 13.5h8M8 17h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  hand:`<svg viewBox="0 0 24 24" fill="none"><path d="M4 20h16M14.5 4.5l5 5L9 20H4v-5L14.5 4.5z" stroke="#ffd36b" stroke-width="2" stroke-linejoin="round"/></svg>`,
  idcard:`<svg viewBox="0 0 24 24" fill="none"><rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="#7b8cff" stroke-width="2"/><circle cx="8" cy="11.5" r="2.2" stroke="#2ee6c5" stroke-width="1.8"/><path d="M5.5 16c.6-1.2 4.4-1.2 5 0M13 10h6M13 13.5h5M13 16.5h3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  canvas:`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#ff4d6a" stroke-width="2"/><circle cx="9" cy="10" r="1.5" fill="#ffd36b"/><circle cx="14.5" cy="9.5" r="1.5" fill="#2ee6c5"/><circle cx="15" cy="14" r="1.5" fill="#a88bff"/><path d="M8.5 15.5c1 .8 2.2.8 3 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
};

const POSTERS=[
  ['calculators.html','Popular · Calculators','Step-by-step & smart math solver','calc',''],
  ['pdf-tools.html','Popular · PDF & Image Tools','Merge, split, compress & export PDFs','pdf','p2'],
  ['ai-assistant.html','Popular · Advance AI Assistant','Ask doubts, summarize notes & get clear study explanations','ai','p4']
];

const TOOLS=[
  ['calculators.html','calc','Calculators','Step-by-step & smart math','calc_open'],
  ['pdf-tools.html','pdf','PDF & Image Tools','Merge, split, compress & PDF','pdf_open'],
  ['ai-assistant.html','ai','Advance AI Assistant','Ask doubts, summarize notes & study faster','tool_open'],
  ['passport-ai.html','pass','Passport Photo','Photo maker & print sheet','tool_open'],
  ['retouch-pro.html','retouch','Photo Retouch','Clean & enhance images','tool_open'],
  ['resume-builder.html','resume','Resume Builder','Create & export resume','tool_open'],
  ['handwriting.html','hand','Handwriting','Assignment generator','tool_open'],
  ['idcard-print.html','idcard','ID Card Print','Format & print ID cards','tool_open'],
  ['canvas-studio.html','canvas','Canvas Studio','Design & visual edits','tool_open']
];

/* ===== Student Tools Side Drawer Controls (On-Demand Mount + Clean Timer Teardown) ===== */
let toolsDrawerMounted=false;
let drawerPoemsDirty=true;
let posterScrollIv=0;

function mountToolsDrawer(){
  if(!toolsDrawerMounted){
    const track=$('#posterTrack');
    if(track){
      track.innerHTML=POSTERS.map(p=>`<a class="poster-slide ${p[4]}" href="${esc(p[0])}" onclick="event.preventDefault();closeToolsDrawer();window.__openTool('${esc(p[0])}')"><div><b>${esc(p[1])}</b><small>${esc(p[2])}</small></div><span class="poster-ico">${TOOL_SVG[p[3]]}</span></a>`).join('');
    }
    const tg=$('#toolGrid');
    if(tg){
      tg.innerHTML=TOOLS.map(t=>`<a class="card tool" href="${esc(t[0])}" data-stat="${esc(t[4])}" data-href="${esc(t[0])}"><div class="art">${TOOL_SVG[t[1]]}</div><b>${esc(t[2])}</b><small>${esc(t[3])}</small></a>`).join('');
    }
    toolsDrawerMounted=true;
  }
  if(drawerPoemsDirty){
    renderPoems(true);
  }
}

function startDrawerPosterTimer(){
  clearInterval(posterScrollIv);
  posterScrollIv=setInterval(()=>{
    const drawer=$('#toolsDrawer');
    const track=$('#posterTrack');
    if(document.hidden||!drawer||!drawer.classList.contains('open')||!track||!track.offsetParent)return;
    if(track.scrollLeft+track.clientWidth>=track.scrollWidth-10)track.scrollTo({left:0,behavior:'smooth'});
    else track.scrollBy({left:track.clientWidth*0.85,behavior:'smooth'});
  },4200);
}

function stopDrawerPosterTimer(){
  if(posterScrollIv){
    clearInterval(posterScrollIv);
    posterScrollIv=0;
  }
}

function openToolsDrawer(){
  const drawer=$('#toolsDrawer');
  const backdrop=$('#toolsDrawerBackdrop');
  if(!drawer)return;
  mountToolsDrawer();
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  if(backdrop){backdrop.hidden=false;backdrop.classList.add('open')}
  startDrawerPosterTimer();
  if(typeof pushBackGuardState==='function')pushBackGuardState('drawer');
  if(typeof playSfx==='function')playSfx('click');
}

function closeToolsDrawer(){
  const drawer=$('#toolsDrawer');
  const backdrop=$('#toolsDrawerBackdrop');
  stopDrawerPosterTimer();
  if(!drawer)return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');
  if(backdrop){backdrop.classList.remove('open');backdrop.hidden=true}
}

function scrollToPartyHub(){
  showTab('tools');
  const el=$('#homePartyRooms');
  if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
}

if($('#toolsDrawerBtn'))$('#toolsDrawerBtn').onclick=openToolsDrawer;
if($('#toolsDrawerClose'))$('#toolsDrawerClose').onclick=closeToolsDrawer;
if($('#toolsDrawerBackdrop'))$('#toolsDrawerBackdrop').onclick=closeToolsDrawer;

/* ===== WePlay-Style Clean Games & Social Hub ===== */
function renderHomeHub(){
  const host=$('#homeHubRoot');
  if(!host)return;
  const vip=typeof getActiveVipTier==='function'?getActiveVipTier(me):'';
  const gSvg=typeof GLOSSY_SVG!=='undefined'?GLOSSY_SVG:{};
  const freeSpin=me.spinFreeDay!==today();

  host.innerHTML=`
    <div class="wp-home-bar">
      <button type="button" class="wp-hb-user" id="heroProfileBtn" aria-label="Open Profile">
        ${av(me,44)}
        <div class="wp-hb-meta">
          <b>${styledName(me)}</b>
          <div class="wp-hb-pills">
            <span class="wp-pill lv">Lv.${fmtNum(calcLevel(me.exp),MAX_LEVEL)}</span>
            ${vip?`<span class="wp-pill gold">${esc(vip.toUpperCase())}</span>`:''}
            <span class="wp-pill charm">💎 ${fmtNum(me.charm||0)}</span>
          </div>
        </div>
      </button>
      <div class="wp-hb-acts">
        <button type="button" class="wp-hb-btn gold" id="aqGiftBtn" title="Send Gift">🎁</button>
        <button type="button" class="wp-hb-btn" id="heroToolsShortcut" title="Student Tools">Tools</button>
      </div>
    </div>

    <div class="wp-quick-row">
      <button type="button" class="wp-qa-btn" id="qaRankBtn">
        <span class="wp-qa-ico">${gSvg.ranking||'🏆'}</span>
        <b>Ranking</b>
      </button>
      <button type="button" class="wp-qa-btn" id="qaTasksBtn">
        <span class="wp-qa-ico">${gSvg.tasks||'✓'}</span>
        <b>Tasks</b>
      </button>
      <button type="button" class="wp-qa-btn" id="qaFriendsBtn">
        <span class="wp-qa-ico">${gSvg.friends||'👥'}</span>
        <b>Friends</b>
      </button>
      <button type="button" class="wp-qa-btn" id="qaEventsBtn">
        <span class="wp-qa-ico">${gSvg.events||'🎡'}${freeSpin?'<i class="wp-qa-dot"></i>':''}</span>
        <b>Events</b>
      </button>
    </div>

    ${typeof renderActivityChestsStrip==='function'?renderActivityChestsStrip():''}
  `;

  if($('#heroProfileBtn',host))$('#heroProfileBtn',host).onclick=()=>showTab('profile');
  if($('#heroToolsShortcut',host))$('#heroToolsShortcut',host).onclick=openToolsDrawer;
  if($('#aqGiftBtn',host))$('#aqGiftBtn',host).onclick=()=>{
    if(typeof openGiftSendModal==='function')openGiftSendModal(null,{allowPickPlayer:true});
  };
  if($('#qaRankBtn',host))$('#qaRankBtn',host).onclick=()=>showTab('ranking');
  if($('#qaTasksBtn',host))$('#qaTasksBtn',host).onclick=()=>showTab('tasks');
  if($('#qaFriendsBtn',host))$('#qaFriendsBtn',host).onclick=()=>showTab('chat');
  if($('#qaEventsBtn',host))$('#qaEventsBtn',host).onclick=()=>{
    if(typeof openLuckySpinModal==='function')openLuckySpinModal();
  };
  if(typeof bindActivityChests==='function')bindActivityChests(host);

  if(typeof renderPartyHub==='function')renderPartyHub();
  if(typeof renderHomeFeaturedLauncher==='function')renderHomeFeaturedLauncher($('#homeArenaPosters'));
  else if(typeof renderArenaPostersGrid==='function')renderArenaPostersGrid($('#homeArenaPosters'));
}

function renderHome(){
  renderHomeHub();
}

if($('#toolGrid')){
  $('#toolGrid').onclick=e=>{
    const a=e.target.closest('[data-href]');
    if(a){
      e.preventDefault();
      closeToolsDrawer();
      openToolClean(a.dataset.href,a.dataset.stat);
    }
  };
}

/* Poem Request (1/day per user) -> Developer Approval -> Side Drawer Wall + Dev Delete */
function renderPoems(force){
  const listEl=$('#poemList');
  if(!listEl)return;
  const drawer=$('#toolsDrawer');
  if(!force&&drawer&&!drawer.classList.contains('open')){
    drawerPoemsDirty=true;
    return;
  }
  drawerPoemsDirty=false;
  let devReqHtml='';
  if(devMode && poemRequests.length){
    devReqHtml=`<div class="card" style="border-color:var(--gold)">
      <b style="color:var(--gold)">Pending Poem Requests (${poemRequests.length})</b>
      <div class="list" style="margin-top:8px">${poemRequests.map(rq=>`
        <div class="card" style="background:var(--s2)">
          <b>${esc(rq.title||'Poem Request')}</b>
          <small style="color:var(--mu)">By ${esc(rq.author||'Player')} · UID: ${esc(rq.uid)}</small>
          ${rq.text?`<div class="poem-box">${esc(rq.text)}</div>`:''}
          ${rq.photoUrl?`<img class="poem-img" src="${esc(rq.photoUrl)}" alt="Request">`:''}
          <div class="row" style="margin-top:8px">
            <button class="btn ok sm" data-approvepoem="${esc(rq.id)}" style="flex:1">Approve &amp; Upload</button>
            <button class="btn red sm" data-rejectpoem="${esc(rq.id)}">Reject</button>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  }

  const wallHtml=(poems||[]).map(p=>`
    <div class="card">
      <div class="row">
        ${av({uid:p.uid,avatar:p.avatar||'av_b1',frame:p.frame||'none'},34)}
        <div class="mid"><b>${esc(p.author||'Player')}</b><small>UID: ${esc(p.uid||'—')} · ${esc(p.title||'Poem')}</small></div>
        ${devMode?`<button class="btn red sm" data-delpoem="${esc(p.id)}">Delete</button>`:''}
      </div>
      ${p.text?`<div class="poem-box">${esc(p.text)}</div>`:''}
      ${p.photoUrl?`<img class="poem-img" src="${esc(p.photoUrl)}" alt="Poem">`:''}
    </div>`).join('')||'<div class="empty">No approved poems on wall yet. Tap "Request Poem" (1/day).</div>';

  listEl.innerHTML=devReqHtml+wallHtml;
}

if($('#poemList')){
  $('#poemList').onclick=e=>{
    const appId=e.target.dataset.approvepoem;
    if(appId){
      if(!devMode)return toast('Developer only');
      const rq=poemRequests.find(x=>x.id===appId);if(!rq)return;
      const approvedItem={id:'p_'+Date.now().toString(36),uid:rq.uid,author:rq.author,avatar:rq.avatar||'av_b1',frame:rq.frame||'none',title:rq.title||'Poem',text:rq.text||'',photoUrl:rq.photoUrl||'',ts:Date.now()};
      poems=[approvedItem,...poems];ls.set('sg_poems_cache',poems);
      poemRequests=poemRequests.filter(x=>x.id!==appId);ls.set('sg_poem_requests_cache',poemRequests);
      dbOp(()=>F.setDoc(F.doc(db,'poems_wall',approvedItem.id),approvedItem));
      dbOp(()=>F.deleteDoc(F.doc(db,'poem_requests',appId)));
      renderPoems();toast('Approved & uploaded to Poems Wall!');return;
    }
    const rejId=e.target.dataset.rejectpoem;
    if(rejId){
      if(!devMode)return toast('Developer only');
      poemRequests=poemRequests.filter(x=>x.id!==rejId);ls.set('sg_poem_requests_cache',poemRequests);
      dbOp(()=>F.deleteDoc(F.doc(db,'poem_requests',rejId)));
      renderPoems();toast('Request removed');return;
    }
    const delId=e.target.dataset.delpoem;
    if(delId){
      if(!devMode)return toast('Developer only');
      poems=poems.filter(x=>x.id!==delId);ls.set('sg_poems_cache',poems);
      dbOp(()=>F.deleteDoc(F.doc(db,'poems_wall',delId)));
      renderPoems();toast('Poem deleted');
    }
  };
}

function shrinkImg(f,max=800){return new Promise((ok,no)=>{const r=new FileReader();r.onerror=no;r.onload=()=>{const im=new Image();im.onerror=no;im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.72))};im.src=r.result};r.readAsDataURL(f)})}

if($('#openPoemReqBtn')){
  $('#openPoemReqBtn').onclick=()=>{
    if(!devMode && me.poemReqDay===today()){
      return toast('You can send only 1 poem request per day.');
    }
    const m=modal('Request Poem Upload (1/Day)',`
      <p style="font-size:12px;color:var(--mu)">Sent to Developer. If approved, it appears on the Poems Wall with your Name &amp; UID.</p>
      <label>Title</label><input id="pmT" maxlength="60" placeholder="Poem or note title">
      <label>Poem / Text</label><textarea id="pmX" maxlength="1000" style="min-height:100px" placeholder="Write poem or text..."></textarea>
      <label>Photo URL or Image</label><input id="pmImgUrl" placeholder="https://... or choose image below">
      <input type="file" id="pmImgFile" accept="image/*" style="margin-top:6px">
      <button class="btn full" id="pmSendReq">Send Request to Developer</button>
    `);
    let chosenImg='';
    $('#pmImgFile',m).onchange=e=>{const f=e.target.files[0];if(!f)return;shrinkImg(f).then(d=>{chosenImg=d;$('#pmImgUrl',m).value='[Image attached]'},()=>toast('Image failed'))};
    $('#pmSendReq',m).onclick=()=>{
      const text=$('#pmX',m).value.trim(), rawUrl=$('#pmImgUrl',m).value.trim();
      const photoUrl=chosenImg||(rawUrl.startsWith('http')?rawUrl:'');
      if(!text&&!photoUrl)return toast('Write text or add photo');
      const reqId='pr_'+Date.now().toString(36);
      const reqItem={id:reqId,uid,author:me.name,avatar:me.avatar,frame:me.frame,title:$('#pmT',m).value.trim()||'Poem',text,photoUrl,ts:Date.now()};
      poemRequests=[reqItem,...poemRequests];ls.set('sg_poem_requests_cache',poemRequests);
      if(!devMode){me.poemReqDay=today();saveMe()}
      dbOp(()=>F.setDoc(F.doc(db,'poem_requests',reqId),reqItem));
      renderPoems();m.close();toast('Poem request sent to Developer!');
    };
  };
}

/* Pinned notice (Strictly Developer Only) */
let notice=ls.get('sg_notice',null);
function renderNotice(){
  const b=$('#noticeBox');if(!b)return;
  if(!notice||!notice.text){b.hidden=true;return}
  b.hidden=false;b.innerHTML=`<span style="color:var(--ac);display:inline-flex;flex-shrink:0;margin-top:1px">${UI_SVG.pin}</span><span>${esc(notice.text)}</span>`;
}
if($('#noticeBtn')){
  $('#noticeBtn').onclick=()=>{
    if(!devMode)return toast('Developer only');
    const m=modal('Pinned Notice',`<label>Short announcement shown to every user</label><textarea id="ntX" maxlength="140">${esc(notice?.text||'')}</textarea><button class="btn full" id="ntS">Publish Notice</button><button class="btn ghost full" id="ntC">Clear Notice</button>`);
    const put=txt=>{
      if(!devMode)return;
      notice=txt?{text:txt,ts:Date.now()}:null;ls.set('sg_notice',notice);renderNotice();
      dbOp(()=>txt?F.setDoc(F.doc(db,'config','notice'),notice):F.deleteDoc(F.doc(db,'config','notice')),()=>toast('Could not sync notice'));
      m.close();toast(txt?'Notice published':'Notice cleared');
    };
    $('#ntS',m).onclick=()=>put($('#ntX',m).value.trim());$('#ntC',m).onclick=()=>put('');
  };
}
