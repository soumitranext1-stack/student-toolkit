"use strict";
const FIXED_TASK_POOL=[
  {id:'fx1',title:'25-Min Math Sprint',description:'Open Calculators and practice math.',reward:25,exp:20,ruleCode:'calc_open:1'},
  {id:'fx2',title:'PDF Notes Organizer',description:'Open PDF & Image Tools for study files.',reward:20,exp:15,ruleCode:'pdf_open:1'},
  {id:'fx3',title:'Study Duel Winner',description:'Play 1 60s MCQ coin duel in chat.',reward:30,exp:25,ruleCode:'games_played:1'},
  {id:'fx4',title:'Double Duel Challenge',description:'Play 2 60s MCQ coin duels today.',reward:40,exp:35,ruleCode:'games_played:2'},
  {id:'fx5',title:'Profile Shine Update',description:'Save your profile bio or style.',reward:15,exp:15,ruleCode:'profile_save:1'},
  {id:'fx6',title:'Reward Ad Boost',description:'Watch a reward ad for bonus coins & EXP.',reward:25,exp:20,ruleCode:'ad_watch:1'},
  {id:'fx7',title:'Resume & ID Prep',description:'Open Resume Builder or ID Card Print.',reward:20,exp:15,ruleCode:'tool_open:1'},
  {id:'fx8',title:'Handwriting Practice',description:'Open Handwriting for study notes.',reward:20,exp:15,ruleCode:'tool_open:1'}
];

function getDaily5Tasks(){
  const d=today(), saved=ls.get('sg_daily5_'+d,null);
  if(Array.isArray(saved)&&saved.length>=5)return saved;
  const copy=[...FIXED_TASK_POOL];
  let seed=d.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  for(let i=copy.length-1;i>0;i--){seed=(seed*9301+49297)%233280;const j=Math.floor((seed/233280)*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}
  const pick5=copy.slice(0,5);ls.set('sg_daily5_'+d,pick5);return pick5;
}

let devTasks=ls.get('sg_dev_tasks',[]);
let tasks=[...getDaily5Tasks(),...devTasks];
function checkRule(rc){if(!rc)return true;const [k,v]=String(rc).split(':'),req=Number(v||1);return (stats[k]||0)>=req}

function renderTasks(){
  tasks=[...getDaily5Tasks(),...devTasks];const claimedToday=getClaimedToday();
  $('#taskList').innerHTML=tasks.map(t=>{
    const cl=claimedToday.includes(t.id), met=checkRule(t.ruleCode);
    let lbl='Claim', cls='btn sm', dis=false;
    if(cl){lbl='Claimed';cls='btn sm ghost';dis=true}
    else if(!met&&t.ruleCode==='ad_watch:1'){lbl='Watch Ad';cls='btn sm'}
    else if(!met){lbl='Locked';cls='btn sm ghost';dis=true}
    return `<div class="card task"><div class="mid"><b>${esc(t.title)}</b><p>${esc(t.description)}</p><div class="row wrap" style="margin-top:4px"><span class="chip">+${fmtNum(t.reward)} coins</span><span class="exp-chip">+${fmtNum(t.exp||15)} EXP</span></div></div><button class="${cls}" data-claim="${esc(t.id)}" ${dis?'disabled':''}>${lbl}</button>${devMode&&String(t.id).startsWith('dt_')?`<button class="btn red sm" data-deltask="${esc(t.id)}" aria-label="Delete task">✕</button>`:''}</div>`;
  }).join('');
}

$('#taskList').onclick=e=>{
  const dt=e.target.dataset.deltask;
  if(dt){
    if(!devMode)return toast('Developer only');
    devTasks=devTasks.filter(x=>x.id!==dt);ls.set('sg_dev_tasks',devTasks);
    dbOp(()=>F.deleteDoc(F.doc(db,'dev_tasks',dt)));
    renderTasks();toast('Task deleted');return;
  }
  const id=e.target.dataset.claim;if(!id)return;
  if(inFlightOps.has('task_'+id))return;
  const t=tasks.find(x=>x.id===id);
  if(!t||getClaimedToday().includes(id))return;
  if(t.ruleCode==='ad_watch:1'&&!checkRule(t.ruleCode)){
    openRewardAd(()=>{renderTasks();toast('Ad done! Tap Claim')});
    return;
  }
  if(!checkRule(t.ruleCode))return;
  inFlightOps.add('task_'+id);
  try{
    addReward(clampSafeInt(t.reward,0,5000),clampSafeInt(t.exp||15,0,500),id,false,{silentSfx:true});
    if(typeof playSfx==='function')playSfx('taskClaim',{amount:t.reward});
    renderTasks();
    toast(`+${fmtNum(t.reward)} coins & +${fmtNum(t.exp||15)} EXP`);
  }finally{
    setTimeout(()=>inFlightOps.delete('task_'+id),500);
  }
};

$('#addTaskBtn').onclick=()=>{
  if(!devMode)return toast('Developer only');
  const m=modal('Add Daily Task (Developer)',`<label>Title</label><input id="tkT" maxlength="60"><label>Description</label><textarea id="tkD" maxlength="140" style="min-height:52px"></textarea><div class="row"><div style="flex:1"><label>Coins</label><input id="tkR" type="number" min="0" max="5000" value="25"></div><div style="flex:1"><label>EXP</label><input id="tkE" type="number" min="0" max="500" value="20"></div></div><label>Rule</label><select id="tkC"><option value="ad_watch:1">Ad task (watch ad)</option><option value="">No requirement</option><option value="pdf_open:1">pdf_open:1</option><option value="tool_open:1">tool_open:1</option><option value="store_buy:1">store_buy:1</option><option value="games_played:1">games_played:1</option><option value="calc_open:1">calc_open:1</option><option value="profile_save:1">profile_save:1</option></select><button class="btn full" id="tkS">Add Task</button>`);
  $('#tkS',m).onclick=()=>{
    if(!devMode)return;
    const title=$('#tkT',m).value.trim();if(!title)return toast('Add a title');
    const t={id:'dt_'+Date.now().toString(36),title,description:$('#tkD',m).value.trim(),reward:clampSafeInt($('#tkR',m).value,0,5000),exp:clampSafeInt($('#tkE',m).value||15,0,500),ruleCode:$('#tkC',m).value};
    devTasks.push(t);ls.set('sg_dev_tasks',devTasks);
    dbOp(()=>F.setDoc(F.doc(db,'dev_tasks',t.id),t),()=>toast('Could not sync task'));
    m.close();renderTasks();toast('Task added');
  };
};
