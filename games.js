"use strict";
/* High-Craft 3D Glossy SVG Icons for Study Mini-Games & Live Multiplayer Arena */
const GAME_SVG={
  chess:`<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="gChGold" x1="14" y1="8" x2="50" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef08a"/><stop offset="48%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
      <linearGradient id="gChBase" x1="12" y1="48" x2="52" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#92400e"/></linearGradient>
    </defs>
    <ellipse cx="32" cy="54" rx="20" ry="5" fill="#000" fill-opacity=".35"/>
    <path d="M18 46h28l3 7H15l3-7z" fill="url(#gChBase)" stroke="#fff" stroke-opacity=".35" stroke-width="1.3"/>
    <path d="M23 46l3-17-6-5 5-8 7 5 7-5 5 8-6 5 3 17H23z" fill="url(#gChGold)" stroke="#fffbeb" stroke-opacity=".55" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="32" cy="12" r="4.2" fill="#fef9c3" stroke="#d97706" stroke-width="1.5"/>
    <path d="M27 30c3-2 7-2 10 0" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  math:`<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="gMaBolt" x1="16" y1="6" x2="48" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="45%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#2563eb"/></linearGradient>
    </defs>
    <circle cx="32" cy="34" r="22" fill="#0ea5e9" fill-opacity=".18"/>
    <path d="M36 7L15 35h15l-4 22 23-29H34l2-21z" fill="url(#gMaBolt)" stroke="#e0f2fe" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="48" cy="15" r="5" fill="#fde047" stroke="#fff" stroke-width="1.2"/>
    <path d="M46 15h4M48 13v4" stroke="#78350f" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  puzzle:`<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="gPzA" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f0abfc"/><stop offset="50%" stop-color="#a855f7"/><stop offset="100%" stop-color="#581c87"/></linearGradient>
    </defs>
    <ellipse cx="32" cy="54" rx="19" ry="4.5" fill="#000" fill-opacity=".35"/>
    <path d="M28 11a5 5 0 1 1 8 0v4h10a4 4 0 0 1 4 4v9h-4a5 5 0 1 0 0 10h4v9a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4v-9h4a5 5 0 1 0 0-10h-4v-9a4 4 0 0 1 4-4h10v-4z" fill="url(#gPzA)" stroke="#fae8ff" stroke-opacity=".55" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M20 22h14" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  word:`<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="gWdTile" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#99f6e4"/><stop offset="52%" stop-color="#14b8a6"/><stop offset="100%" stop-color="#0f766e"/></linearGradient>
    </defs>
    <rect x="8" y="12" width="48" height="40" rx="11" fill="url(#gWdTile)" stroke="#ccfbf1" stroke-opacity=".6" stroke-width="1.8"/>
    <rect x="11" y="15" width="42" height="14" rx="7" fill="#fff" fill-opacity=".16"/>
    <path d="M18 41l6-17 6 17M20.5 35.5h7M38 24v17M38 32h7a4 4 0 0 1 0 9h-7" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  trivia:`<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="gTrCap" x1="10" y1="14" x2="54" y2="50" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fed7aa"/><stop offset="50%" stop-color="#f97316"/><stop offset="100%" stop-color="#c2410c"/></linearGradient>
    </defs>
    <path d="M32 12L6 25l26 13 26-13L32 12z" fill="url(#gTrCap)" stroke="#ffedd5" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M16 31v12c4.5 4.8 27.5 4.8 32 0V31" fill="#ea580c" fill-opacity=".75" stroke="#fed7aa" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M52 28v15" stroke="#fde047" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="52" cy="45" r="3" fill="#fde047"/>
  </svg>`,
  duel:`<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="gDlRing" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#fda4af"/><stop offset="55%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#881337"/></radialGradient>
    </defs>
    <circle cx="32" cy="32" r="24" fill="url(#gDlRing)" stroke="#ffe4e6" stroke-width="1.8"/>
    <circle cx="32" cy="32" r="15" fill="#0f172a" fill-opacity=".42" stroke="#fecdd3" stroke-width="2.2"/>
    <circle cx="32" cy="32" r="6.5" fill="#fde047" stroke="#fff" stroke-width="1.6"/>
  </svg>`,
  plus:`<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="22" fill="#f59e0b" fill-opacity=".22" stroke="#fde047" stroke-width="2" stroke-dasharray="6 4"/><path d="M32 20v24M20 32h24" stroke="#fef08a" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  custom:`<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs><linearGradient id="gCuPad" x1="8" y1="16" x2="56" y2="48" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#6ee7b7"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs>
    <rect x="8" y="16" width="48" height="32" rx="12" fill="url(#gCuPad)" stroke="#d1fae5" stroke-width="1.8"/>
    <path d="M21 32h10M26 27v10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <circle cx="42" cy="29" r="2.6" fill="#fde047"/><circle cx="47" cy="35" r="2.6" fill="#38bdf8"/>
  </svg>`
};

const HUB_GAMES=[
  ['Speed Math','math','Sprint','speedmath.html','mg-math','FAST'],
  ['Brain Puzzle','puzzle','Logic','brain-puzzle.html','mg-puzzle','IQ'],
  ['Word Duel','word','Vocab','word-duel.html','mg-word','CLASH'],
  ['Trivia Rush','trivia','Quiz','trivia-rush.html','mg-trivia','LIVE']
];

const DUEL_GAMES=[
  {
    id:'number_match',name:'Number Match Room',icon:'puzzle',
    questions:[
      {id:'nm1',q:'Which two digits can be matched in Number Match?',o:['Same digits or Sum 10','Only even digits','Only prime digits','Sum 12'],a:0},
      {id:'nm2',q:'In Number Match, 3 can pair with which two numbers?',o:['3 or 7','3 or 6','2 or 8','4 or 6'],a:0},
      {id:'nm3',q:'What happens when every number in a row is cleared?',o:['Row collapses + Bonus','Game ends','Nothing','Tiles shuffle'],a:0},
      {id:'nm4',q:'Which directions can a Number Match pair connect across empty tiles?',o:['Horizontal, Vertical, Diagonal & Wrap','Horizontal only','Vertical only','Diagonal only'],a:0},
      {id:'nm5',q:'Which pair adds up to 10 in Number Match?',o:['4 and 6','3 and 6','2 and 7','5 and 4'],a:0},
      {id:'nm6',q:'Can a number at the end of one row pair with the first active number of the next row?',o:['Yes, line-wrap match','No, never','Only on diagonals','Only if both are 5'],a:0},
      {id:'nm7',q:'What does the "+ Add Rows" action do when no pairs remain?',o:['Appends remaining numbers below','Deletes top row','Ends the game','Resets score to 0'],a:0},
      {id:'nm8',q:'Which digit pairs ONLY with itself to make 10?',o:['5','4','6','9'],a:0},
      {id:'nm9',q:'Which pair is an EQUAL match?',o:['8 and 8','8 and 2','7 and 3','9 and 1'],a:0},
      {id:'nm10',q:'If 1 and 9 have only cleared cells between them vertically, can they match?',o:['Yes, clear path works','No, must touch directly','Only horizontally','Only at game start'],a:0},
      {id:'nm11',q:'Clearing the entire board in Number Match gives what?',o:['Stage Clear + Big Bonus','Instant Loss','Penalty −50','Board Lock'],a:0},
      {id:'nm12',q:'Which number pairs with 2 to sum to 10?',o:['8','7','6','9'],a:0}
    ]
  },
  {
    id:'jackaroo',name:'Jackaroo Royal Room',icon:'custom',
    questions:[
      {id:'jk1',q:'Which card in Jackaroo moves 1 or 2 stones a total of 7 steps?',o:['Card 4','Card 7','Card 10','Queen'],a:1},
      {id:'jk2',q:'Card 4 in Jackaroo moves a stone how many steps back?',o:['2 steps','3 steps','4 steps','5 steps'],a:2},
      {id:'jk3',q:'Which card lets you swap with another player\'s stone or move +11?',o:['Jack (J)','King (K)','2','6'],a:0},
      {id:'jk4',q:'King (K) in Jackaroo can exit base or move how many steps?',o:['10','11','12','13'],a:3},
      {id:'jk5',q:'Which card besides King allows a marble to exit Home Base?',o:['Ace (A)','5','9','Queen (Q)'],a:0},
      {id:'jk6',q:'How many marbles does each player race to Safe Home in Jackaroo?',o:['2','3','4','6'],a:2},
      {id:'jk7',q:'What does Card 10 allow in classic Jackaroo?',o:['Move +10 or force next player to burn a card','Move backwards 10','Swap two marbles','Skip two players'],a:0},
      {id:'jk8',q:'In 2v2 Squad Jackaroo, once all 4 of your marbles reach Home, what do you do?',o:['Help move your teammate\'s marbles','Leave the table','Skip every turn','Restart your marbles'],a:0},
      {id:'jk9',q:'What happens when your marble lands directly on an opponent\'s unprotected marble?',o:['Sends opponent marble back to Base','Both marbles freeze','Nothing happens','You lose a turn'],a:0},
      {id:'jk10',q:'How many steps forward does Queen (Q) move a stone?',o:['10','11','12','13'],a:2},
      {id:'jk11',q:'Card 5 in Jackaroo can move which marble +5 steps?',o:['Any marble on the track (even opponent/ally)','Only your own marble','Only marbles in base','None'],a:0},
      {id:'jk12',q:'When you have no legal move with any card in hand, what happens?',o:['Burn/discard a card','Draw 5 cards','Win automatically','Reverse the board'],a:0}
    ]
  },
  {
    id:'uno',name:'UNO Clash Room',icon:'duel',
    questions:[
      {id:'un1',q:'What happens if you reach 1 card and forget to call UNO?',o:['Nothing','+2 penalty cards','Instant win','Skip next turn'],a:1},
      {id:'un2',q:'Which card reverses turn direction?',o:['Skip','Reverse','Wild','0'],a:1},
      {id:'un3',q:'Wild +4 lets you choose the next color and forces next player to draw?',o:['2 cards','3 cards','4 cards','1 card'],a:2},
      {id:'un4',q:'In 1v1 UNO, how does a Reverse card act?',o:['Same as Skip','Draws 1','Ends round','Changes deck'],a:0},
      {id:'un5',q:'How many cards are dealt to each player at the start of standard UNO?',o:['5','7','9','10'],a:1},
      {id:'un6',q:'What are the 4 standard UNO card colors?',o:['Red, Yellow, Green, Blue','Red, Purple, Orange, Blue','Black, White, Red, Green','Pink, Gold, Cyan, Blue'],a:0},
      {id:'un7',q:'You can play a card on top of the discard pile if it matches the?',o:['Color, Number, Symbol, or is Wild','Exact same card only','Higher number only','Lower number only'],a:0},
      {id:'un8',q:'In Fun +Stack mode, what can you play on top of a +2 card?',o:['Another +2 (or +4) to stack penalty','Only a 0 card','Any matching number','Nothing'],a:0},
      {id:'un9',q:'What does a Skip card do to the next player?',o:['Skips their turn','Gives them +2 cards','Swaps their hand','Ends the match'],a:0},
      {id:'un10',q:'Can a regular Wild card be played on any color?',o:['Yes, and you pick the new color','No, only on Red','Only on matching number','Only on last turn'],a:0},
      {id:'un11',q:'How do you win a round of UNO?',o:['Be the first to empty your hand','Collect 15 cards','Hold 4 Wild cards','Draw the whole deck'],a:0},
      {id:'un12',q:'If you have no playable card on your turn, what must you do?',o:['Draw from the deck','Pass without drawing','Discard 2 cards','Swap seats'],a:0}
    ]
  },
  {
    id:'math',name:'Math Speed Sprint',icon:'math',
    questions:[
      {id:'ma1',q:'(24 ÷ 3) + (6 × 5) = ?',o:['34','38','42','30'],a:1},
      {id:'ma2',q:'15% of 200 = ?',o:['25','30','35','40'],a:1},
      {id:'ma3',q:'14 × 6 = ?',o:['74','84','94','64'],a:1},
      {id:'ma4',q:'√144 = ?',o:['10','11','12','14'],a:2},
      {id:'ma5',q:'7² + 3² = ?',o:['52','58','56','62'],a:1},
      {id:'ma6',q:'1/2 + 1/4 = ?',o:['3/4','2/6','1/6','2/4'],a:0},
      {id:'ma7',q:'9 × 8 = ?',o:['64','72','81','78'],a:1},
      {id:'ma8',q:'250 ÷ 5 = ?',o:['40','45','50','55'],a:2},
      {id:'ma9',q:'18 × 5 = ?',o:['80','85','90','95'],a:2},
      {id:'ma10',q:'3³ + 13 = ?',o:['36','40','42','39'],a:1},
      {id:'ma11',q:'12 × 12 − 44 = ?',o:['90','100','104','110'],a:1},
      {id:'ma12',q:'20% of 450 = ?',o:['80','85','90','95'],a:2},
      {id:'ma13',q:'√196 + 6 = ?',o:['18','20','22','24'],a:1},
      {id:'ma14',q:'(15 × 4) ÷ 3 = ?',o:['15','20','25','30'],a:1}
    ]
  },
  {
    id:'science',name:'Science Quiz Arena',icon:'trivia',
    questions:[
      {id:'sc1',q:'Powerhouse of the cell?',o:['Ribosome','Mitochondria','Nucleus','Golgi'],a:1},
      {id:'sc2',q:'Chemical symbol of Sodium?',o:['So','Na','Sd','K'],a:1},
      {id:'sc3',q:'SI unit of force?',o:['Joule','Watt','Newton','Pascal'],a:2},
      {id:'sc4',q:'Formula of water?',o:['H2O','CO2','O2','HO'],a:0},
      {id:'sc5',q:'Which planet is known as the Red Planet?',o:['Venus','Mars','Jupiter','Mercury'],a:1},
      {id:'sc6',q:'Gas absorbed by plants during photosynthesis?',o:['Oxygen','Nitrogen','Carbon dioxide','Helium'],a:2},
      {id:'sc7',q:'Hardest natural substance on Earth?',o:['Gold','Iron','Diamond','Quartz'],a:2},
      {id:'sc8',q:'Total bones in an adult human body?',o:['206','201','212','196'],a:0},
      {id:'sc9',q:'SI unit of electric current?',o:['Volt','Ohm','Ampere','Watt'],a:2},
      {id:'sc10',q:'Chemical symbol of Gold?',o:['Ag','Au','Gd','Go'],a:1},
      {id:'sc11',q:'Which planet is closest to the Sun?',o:['Venus','Mercury','Mars','Earth'],a:1},
      {id:'sc12',q:'Normal human body temperature in Celsius?',o:['35°C','37°C','39°C','40°C'],a:1},
      {id:'sc13',q:'Which organ filters blood to produce urine?',o:['Heart','Liver','Kidney','Lung'],a:2},
      {id:'sc14',q:'Sound travels fastest through which medium?',o:['Vacuum','Air','Water','Steel (Solid)'],a:3}
    ]
  },
  {
    id:'trivia',name:'Trivia Rush Live',icon:'trivia',
    questions:[
      {id:'tr1',q:'Capital of Japan?',o:['Kyoto','Tokyo','Osaka','Seoul'],a:1},
      {id:'tr2',q:'Largest ocean on Earth?',o:['Atlantic','Indian','Pacific','Arctic'],a:2},
      {id:'tr3',q:'How many continents are there?',o:['5','6','7','8'],a:2},
      {id:'tr4',q:'Longest river in India?',o:['Yamuna','Ganga','Godavari','Kaveri'],a:1},
      {id:'tr5',q:'National flower of India?',o:['Rose','Marigold','Lotus','Jasmine'],a:2},
      {id:'tr6',q:'Number of days in a leap year?',o:['364','365','366','367'],a:2},
      {id:'tr7',q:'Olympics are held every how many years?',o:['2','3','4','5'],a:2},
      {id:'tr8',q:'HTML stands for?',o:['HyperText Markup Language','HighText Machine Language','HyperTool Markup Language','Home Text Markup Language'],a:0},
      {id:'tr9',q:'Which country gifted the Statue of Liberty to the USA?',o:['Spain','France','Italy','UK'],a:1},
      {id:'tr10',q:'Which city is known as the Pink City of India?',o:['Udaipur','Jaipur','Jodhpur','Bikaner'],a:1},
      {id:'tr11',q:'How many keys are on a standard full-size piano?',o:['76','84','88','92'],a:2},
      {id:'tr12',q:'Which currency is used in the United Kingdom?',o:['Euro','Dollar','Pound Sterling','Franc'],a:2},
      {id:'tr13',q:'Mount Kilimanjaro is located in which country?',o:['Kenya','Tanzania','Ethiopia','Egypt'],a:1},
      {id:'tr14',q:'Which desert is the coldest desert on Earth?',o:['Gobi','Sahara','Antarctica','Kalahari'],a:2}
    ]
  },
  {
    id:'word',name:'Word Power Clash',icon:'word',
    questions:[
      {id:'wd1',q:'Synonym of "Swift"?',o:['Slow','Rapid','Heavy','Calm'],a:1},
      {id:'wd2',q:'Antonym of "Abundant"?',o:['Plentiful','Rich','Scarce','Large'],a:2},
      {id:'wd3',q:'Meaning of "Benevolent"?',o:['Kind & generous','Angry','Silent','Careless'],a:0},
      {id:'wd4',q:'Synonym of "Diligent"?',o:['Lazy','Hardworking','Fragile','Noisy'],a:1},
      {id:'wd5',q:'Antonym of "Opaque"?',o:['Dark','Transparent','Solid','Thick'],a:1},
      {id:'wd6',q:'Meaning of "Concise"?',o:['Brief and clear','Very long','Confusing','Delayed'],a:0},
      {id:'wd7',q:'Synonym of "Resilient"?',o:['Weak','Adaptable & strong','Timid','Rigid'],a:1},
      {id:'wd8',q:'Antonym of "Expand"?',o:['Grow','Stretch','Contract','Build'],a:2},
      {id:'wd9',q:'Synonym of "Candid"?',o:['Secretive','Honest & frank','Shy','Bitter'],a:1},
      {id:'wd10',q:'Antonym of "Optimistic"?',o:['Hopeful','Cheerful','Pessimistic','Confident'],a:2},
      {id:'wd11',q:'Meaning of "Ephemeral"?',o:['Short-lived','Eternal','Heavy','Ancient'],a:0},
      {id:'wd12',q:'Synonym of "Meticulous"?',o:['Careless','Very thorough','Hasty','Loud'],a:1},
      {id:'wd13',q:'Antonym of "Scarce"?',o:['Rare','Limited','Plentiful','Tiny'],a:2},
      {id:'wd14',q:'Meaning of "Pragmatic"?',o:['Practical & realistic','Daydreaming','Stubborn','Dramatic'],a:0}
    ]
  }
];

function seededShuffle(a,seed){
  let h=0;
  for(const c of String(seed))h=(h*31+c.charCodeAt(0))>>>0;
  const r=()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296};
  const b=[...a];
  for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]]}
  return b;
}

function drawDuelQuestionBatch(modeObj, count, seed, roundNo){
  const list = (modeObj && Array.isArray(modeObj.questions)) ? modeObj.questions : [];
  if (!list.length) return [];
  const SR = window.ShowGamesRules;
  if (seed) {
    // Deterministic across players in the same room/duel, rotating cleanly by roundNo
    const baseSeed = `${seed}_${modeObj.id}`;
    const ordered = seededShuffle(list, baseSeed);
    const rn = Math.max(1, Number(roundNo || 1));
    const offset = ((rn - 1) * count) % ordered.length;
    const out = [];
    for (let i = 0; i < Math.min(count, ordered.length); i++) {
      out.push(ordered[(offset + i) % ordered.length]);
    }
    return out;
  }
  if (SR && typeof SR.drawPersistentQuestions === 'function') {
    return SR.drawPersistentQuestions('duel_' + modeObj.id, list, count, q => q.id || q.q);
  }
  return seededShuffle(list, Date.now() + '_' + Math.random()).slice(0, count);
}

/* ===== Live Multiplayer Rooms State & Firestore Sync ===== */
let mpRooms=ls.get('sg_mp_rooms',[]);
if(!Array.isArray(mpRooms))mpRooms=[];
let activeRoomId=null;
let activeRoomModal=null;
let activeRoomPlayState=null;

function mpModeById(id){return DUEL_GAMES.find(g=>g.id===id)||DUEL_GAMES[0]}
function genRoomCode(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out='SG-';
  for(let i=0;i<4;i++)out+=chars[Math.floor(Math.random()*chars.length)];
  return out;
}
function saveMpRoomsLocal(){ls.set('sg_mp_rooms',mpRooms.slice(0,30))}
function persistMpRoom(room){
  if(!room||!room.id)return;
  room.updatedAt=Date.now();
  const idx=mpRooms.findIndex(r=>r.id===room.id);
  if(idx>=0)mpRooms[idx]=room;
  else mpRooms=[room,...mpRooms].slice(0,30);
  saveMpRoomsLocal();
  dbOp(()=>F.setDoc(F.doc(db,'game_rooms',room.id),room,{merge:true}));
  renderMultiplayerRooms();
  refreshActiveRoomModal();
}

function ingestMultiplayerRooms(list){
  const now=Date.now();
  mpRooms=(Array.isArray(list)?list:[])
    .filter(r=>r&&r.id&&(now-Number(r.updatedAt||r.createdAt||now))<7200000)
    .sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0))
    .slice(0,30);
  saveMpRoomsLocal();
  renderMultiplayerRooms();
  refreshActiveRoomModal();
  if(typeof syncActiveJackarooLobbyFromRooms==='function')syncActiveJackarooLobbyFromRooms(mpRooms);
}

function appendMultiplayerRoomGift(roomId, evObj){
  const room=mpRooms.find(r=>r.id===roomId);
  if(!room||!evObj)return;
  room.chat=Array.isArray(room.chat)?room.chat:[];
  room.chat.push({
    id:'rg_'+evObj.id,
    type:'gift',
    uid:evObj.fromUid,
    name:evObj.fromName||'Player',
    toName:evObj.toName||'Player',
    giftId:evObj.giftId,
    giftName:evObj.giftName||'Gift',
    qty:evObj.qty||1,
    charm:evObj.charm||0,
    luckyCoins:evObj.luckyCoins||0,
    ts:Date.now()
  });
  room.chat=room.chat.slice(-30);
  persistMpRoom(room);
}

function settleRoomRewardForMe(room){
  if(!room||room.status!=='finished')return;
  const players=Object.values(room.players||{});
  if(!players.some(p=>p.uid===uid))return;
  const payKey='room_pay_'+room.id+'_'+Number(room.roundNo||1);
  if(me.done[payKey])return;
  me.done[payKey]=1;

  const topScore=Math.max(...players.map(p=>Number(p.score||0)));
  const winners=players.filter(p=>Number(p.score||0)===topScore).map(p=>p.uid);
  const iWon=winners.includes(uid);
  const isTie=winners.length>1;
  const stake=clampSafeInt(room.entryCoins||0,0,500);

  let rewardCoins=0, rewardExp=10;
  if(stake<=0){
    // Strict Coin Economy: Free rooms award 0 coins (EXP only)
    rewardCoins=0;
    rewardExp=iWon?(isTie?15:25):10;
  }else{
    const pot=stake*players.length;
    const netPot=players.length>1?Math.max(stake,Math.floor(pot*0.9)):stake;
    rewardCoins=iWon?(isTie?stake:Math.floor(netPot/Math.max(1,winners.length))):0;
    rewardExp=iWon?(isTie?15:30):12;
  }
  bumpStat('games_played');
  addReward(rewardCoins,rewardExp,null,false,{silentSfx:true});
  if(typeof playSfx==='function')playSfx(iWon?'duelWin':'coin',{amount:rewardCoins});
  saveMe();
}

function renderMultiplayerRooms(){
  if(typeof activeAppTab!=='undefined' && activeAppTab!=='games'){
    if(typeof markTabsDirty==='function')markTabsDirty('games');
    return;
  }
  const host=$('#mpRoomsHost');
  if(!host)return;
  const openRooms=(mpRooms||[]).filter(r=>r&&r.id&&r.status!=='closed').slice(0,6);
  host.innerHTML=`
    <div class="card mp-hub-card">
      <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div>
          <div class="mp-kicker">LIVE MULTIPLAYER ARENA</div>
          <b style="font-size:15px">Play With Friends · Live Chat &amp; Gifts</b>
        </div>
        <div class="row" style="gap:6px">
          <input id="mpCodeIn" maxlength="10" placeholder="SG-XXXX" aria-label="Room Code" style="width:106px;padding:7px 9px;font-size:12.5px;text-transform:uppercase;letter-spacing:.06em">
          <button type="button" class="btn sm ok" id="mpJoinCodeBtn">Join</button>
        </div>
      </div>
      <div class="mp-room-list">
        ${openRooms.length?openRooms.map(r=>{
          const pList=Object.values(r.players||{});
          const mode=mpModeById(r.mode);
          const inRoom=pList.some(p=>p.uid===uid);
          const statusLabel=r.status==='playing'?'In Match':(r.status==='finished'?'Finished':'Lobby');
          const canSpec=r.status==='playing'&&!inRoom;
          return `<div class="mp-room-row">
            <div class="mp-room-ico">${GAME_SVG[mode.icon]||GAME_SVG.duel}</div>
            <div class="mid">
              <b>${esc(mode.name)} <span class="mp-code-pill">${esc(r.code)}</span></b>
              <small>${esc(r.hostName||'Host')} · ${pList.length}/${clampSafeInt(r.maxPlayers||4,2,6)} players · ${r.entryCoins>0?`${fmtNum(r.entryCoins)} 🪙 Match`:'Free Friendly'} · ${statusLabel}</small>
            </div>
            <div class="row" style="gap:5px">
              ${canSpec?`<button type="button" class="btn sm ghost" data-specroom="${esc(r.id)}" title="Spectate live match">👁️ View</button>`:''}
              <button type="button" class="btn sm ${inRoom?'gold':''}" data-joinroom="${esc(r.id)}">${inRoom?'Open':'Join'}</button>
            </div>
          </div>`;
        }).join(''):`<div class="mp-empty">No active rooms right now. Tap <b>+ Live Room</b> to start a match and invite World Chat!</div>`}
      </div>
    </div>
  `;

  if($('#mpJoinCodeBtn'))$('#mpJoinCodeBtn').onclick=()=>{
    const code=($('#mpCodeIn')?.value||'').trim().toUpperCase();
    if(!code)return toast('Enter a room code (e.g. SG-4K9P)');
    joinMultiplayerRoomByCode(code);
  };
  host.onclick=async e=>{
    const sb=e.target.closest('[data-specroom]');
    if(sb&&sb.dataset.specroom){
      const rm=mpRooms.find(x=>x.id===sb.dataset.specroom);
      if(rm){
        if(typeof ensureGameModule==='function'&&['ludo','number_match','jackaroo','uno'].includes(rm.mode)){
          try{await ensureGameModule(rm.mode)}catch{}
        }
        if(rm.mode==='ludo'&&typeof launchLudoGame==='function'){
          launchLudoGame({roomCode:rm.code,mode:rm.subMode==='1v1'?'1v1':'4p',spectate:true,spectateHost:{uid:rm.hostUid,name:rm.hostName}});
        }else if(rm.mode==='number_match'&&typeof launchNumberMatch==='function'){
          launchNumberMatch({roomCode:rm.code,mode:rm.subMode==='duel'?'duel':'classic',spectate:true,spectateHost:{uid:rm.hostUid,name:rm.hostName}});
        }else if(rm.mode==='jackaroo'&&typeof launchJackaroo==='function'){
          launchJackaroo(0,{uid:rm.hostUid,name:rm.hostName},rm.subMode==='1v1'?'1v1':'2v2','standard',rm.code,{spectate:true,spectateHost:{uid:rm.hostUid,name:rm.hostName}});
        }else{
          openMultiplayerRoom(rm.id);
        }
      }
      return;
    }
    const jb=e.target.closest('[data-joinroom]');
    if(jb&&jb.dataset.joinroom)joinMultiplayerRoom(jb.dataset.joinroom);
  };
}

function shareRoomToWorldChat(room){
  if(!room)return;
  const mode=mpModeById(room.mode);
  const gId=room.mode||'room';
  const url=typeof buildRoomInviteUrl==='function'
    ? buildRoomInviteUrl({gameId:gId,roomCode:room.code,mode:room.subMode||''})
    : `?room=${encodeURIComponent(room.code)}&game=${encodeURIComponent(gId)}`;
  const txt=`🎮 Live ${room.tierLabel||mode.name} room open! (${room.entryCoins>0?room.entryCoins+' 🪙 match':'Free Friendly'}) — Room Code: ${room.code} ${url}`;
  if(typeof sendWorldMsg==='function'){
    sendWorldMsg(txt,{type:'game_invite',gameId:gId,gameName:room.tierLabel||mode.name,roomCode:room.code,mode:room.subMode||'',stake:Number(room.entryCoins||0),url});
    toast('Clickable room invite posted to World Chat!');
    return;
  }
  const id='rmw_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  const item={
    id,type:'game_invite',uid,name:me.name,avatar:me.avatar,frame:me.frame,banner:me.banner,
    textStyle:me.textStyle||'',msgStyle:me.msgStyle||'',tags:me.tags||[],exp:me.exp||0,
    isDev:devMode,gameId:gId,gameName:room.tierLabel||mode.name,roomCode:room.code,mode:room.subMode||'',stake:Number(room.entryCoins||0),url,
    text:txt,ts:Date.now()
  };
  worldMsgs=[...(worldMsgs||[]),item].slice(-150);
  ls.set('sg_world_msgs',worldMsgs);
  dbOp(()=>F.setDoc(F.doc(db,'world_chat',id),item));
  if(typeof playSfx==='function')playSfx('chatSend');
  toast('Clickable room invite posted to World Chat!');
}

function openCreateRoomModal(){
  const m=modal('Create Live Multiplayer Room',`
    <label for="mpModeSel">Game Mode</label>
    <select id="mpModeSel">${DUEL_GAMES.map(g=>`<option value="${esc(g.id)}">${esc(g.name)}</option>`).join('')}</select>
    <label for="mpStakeSel">Entry Mode</label>
    <select id="mpStakeSel">
      <option value="0">Free Friendly (Winner +15 🪙 &amp; +25 EXP)</option>
      <option value="20">Coin Match — 20 🪙 stake (Winner takes 90% pot)</option>
      <option value="50">High Stakes — 50 🪙 stake (Winner takes 90% pot)</option>
    </select>
    <label for="mpMaxSel">Max Players</label>
    <select id="mpMaxSel"><option value="2">2 Players</option><option value="4" selected>4 Players</option><option value="6">6 Players</option></select>
    <label class="row" style="gap:8px;margin-top:10px;cursor:pointer"><input id="mpPostWorld" type="checkbox" checked style="width:auto"><span>Post join card to World Chat</span></label>
    <button type="button" class="btn full" id="mpCreateGo">Create &amp; Enter Room</button>
  `);
  $('#mpCreateGo',m).onclick=()=>{
    const mode=$('#mpModeSel',m).value||'math';
    const entryCoins=clampSafeInt($('#mpStakeSel',m).value,0,500);
    const maxPlayers=clampSafeInt($('#mpMaxSel',m).value,2,6);
    if(entryCoins>0&&me.coins<entryCoins)return toast(`Need ${entryCoins} coins to host this stake`);
    const postWorld=Boolean($('#mpPostWorld',m)?.checked);
    const now=Date.now();
    const code=genRoomCode();
    const roomId='room_'+now.toString(36)+Math.random().toString(36).slice(2,5);
    const room={
      id:roomId,
      code,
      mode,
      entryCoins,
      maxPlayers,
      hostUid:uid,
      hostName:me.name||'Player',
      status:'waiting',
      seed:code+'_'+now,
      roundNo:1,
      createdAt:now,
      updatedAt:now,
      players:{
        [uid]:{uid,name:me.name||'Player',avatar:me.avatar||'🦊',frame:me.frame||'none',score:0,qIdx:0,finished:false,paidStake:false,joinedAt:now}
      },
      chat:[{id:'sys_'+now,type:'sys',text:`${me.name||'Player'} created room ${code}`,ts:now}]
    };
    persistMpRoom(room);
    if(typeof playSfx==='function')playSfx('click');
    if(postWorld)shareRoomToWorldChat(room);
    m.close();
    openMultiplayerRoom(roomId);
  };
}

function joinMultiplayerRoomByCode(codeRaw){
  const clean=String(codeRaw||'').trim().toUpperCase();
  const room=mpRooms.find(r=>String(r.code||'').toUpperCase()===clean);
  if(!room)return toast('Room not found or expired: '+clean);
  joinMultiplayerRoom(room.id);
}

function joinMultiplayerRoom(roomId){
  const room=mpRooms.find(r=>r.id===roomId);
  if(!room)return toast('Room is no longer active');
  room.players=room.players||{};
  const count=Object.keys(room.players).length;
  if(!room.players[uid]){
    if(count>=clampSafeInt(room.maxPlayers||4,2,6))return toast('Room is full');
    if(room.entryCoins>0&&me.coins<room.entryCoins)return toast(`Need ${room.entryCoins} coins to join`);
    const now=Date.now();
    room.players[uid]={uid,name:me.name||'Player',avatar:me.avatar||'🦊',frame:me.frame||'none',score:0,qIdx:0,finished:false,paidStake:false,joinedAt:now};
    room.chat=[...(room.chat||[]),{id:'join_'+now,type:'sys',text:`${me.name||'Player'} joined the room`,ts:now}].slice(-30);
    persistMpRoom(room);
  }
  if(typeof playSfx==='function')playSfx('click');
  if(room.mode==='jackaroo'){
    Promise.resolve(typeof ensureGameModule==='function'?ensureGameModule('jackaroo'):null).then(()=>{
      if(typeof openJackarooTableLobby==='function'){
        openJackarooTableLobby({
          mode:room.subMode==='1v1'?'1v1':'2v2',
          tier:room.tierLabel||(room.subMode==='1v1'?'1v1 | Junior':'Basic | Junior'),
          stake:Number(room.entryCoins||0),
          roomCode:room.code,
          roomId:room.id,
          joinExistingRoom:room
        });
      }else openMultiplayerRoom(room.id);
    });
    return;
  }
  openMultiplayerRoom(room.id);
}

function openMultiplayerRoom(roomId){
  if(activeRoomModal){try{activeRoomModal.close()}catch{}}
  activeRoomId=roomId;
  activeRoomPlayState=null;

  const room=mpRooms.find(r=>r.id===roomId);
  if(!room)return toast('Room unavailable');
  const mode=mpModeById(room.mode);

  const m=modal(`${esc(mode.name)} · ${esc(room.code)}`,`<div id="mpRoomBody"></div>`,'mp-sheet');
  activeRoomModal=m;
  m.onclose=()=>{
    if(activeRoomPlayState&&activeRoomPlayState.timerId)clearInterval(activeRoomPlayState.timerId);
    activeRoomPlayState=null;
    activeRoomId=null;
    activeRoomModal=null;
  };
  refreshActiveRoomModal();
}

function startLocalRoomMatchRunner(room){
  if(!activeRoomModal||activeRoomId!==room.id)return;
  if(activeRoomPlayState&&activeRoomPlayState.roundNo===Number(room.roundNo||1))return;

  const meP=room.players&&room.players[uid];
  if(!meP||meP.finished)return;

  const stake=clampSafeInt(room.entryCoins||0,0,500);
  const stakeKey='room_stake_'+room.id+'_'+Number(room.roundNo||1);
  if(stake>0&&!me.done[stakeKey]){
    if(me.coins<stake){
      toast(`Need ${stake} coins for this match`);
      return;
    }
    me.done[stakeKey]=1;
    addReward(-stake,0,null,true,{silentSfx:true});
    meP.paidStake=true;
    persistMpRoom(room);
  }

  const mode=mpModeById(room.mode);
  const questions=drawDuelQuestionBatch(mode,6,room.seed||room.id,room.roundNo||1);
  activeRoomPlayState={
    roundNo:Number(room.roundNo||1),
    questions,
    qIdx:clampSafeInt(meP.qIdx||0,0,questions.length),
    score:Number(meP.score||0),
    left:45,
    over:false,
    timerId:0
  };

  const finishMyRun=()=>{
    if(!activeRoomPlayState||activeRoomPlayState.over)return;
    activeRoomPlayState.over=true;
    clearInterval(activeRoomPlayState.timerId);
    const liveRoom=mpRooms.find(r=>r.id===room.id)||room;
    if(liveRoom.players&&liveRoom.players[uid]){
      liveRoom.players[uid].score=activeRoomPlayState.score;
      liveRoom.players[uid].qIdx=questions.length;
      liveRoom.players[uid].finished=true;
    }
    const allDone=Object.values(liveRoom.players||{}).every(p=>p.finished);
    if(allDone)liveRoom.status='finished';
    persistMpRoom(liveRoom);
    if(liveRoom.status==='finished')settleRoomRewardForMe(liveRoom);
  };

  activeRoomPlayState.finishMyRun=finishMyRun;
  activeRoomPlayState.timerId=setInterval(()=>{
    if(!activeRoomPlayState||activeRoomPlayState.over)return;
    activeRoomPlayState.left--;
    const tEl=activeRoomModal?$('#mpTimerVal',activeRoomModal):null;
    if(tEl)tEl.textContent=activeRoomPlayState.left+'s';
    if(activeRoomPlayState.left<=0)finishMyRun();
  },1000);
}

function refreshActiveRoomModal(){
  if(!activeRoomModal||!activeRoomId)return;
  const room=mpRooms.find(r=>r.id===activeRoomId);
  const body=$('#mpRoomBody',activeRoomModal);
  if(!body)return;
  if(!room){
    body.innerHTML=`<div class="empty">This room was closed by the host.</div>`;
    return;
  }

  if(room.status==='playing')startLocalRoomMatchRunner(room);
  if(room.status==='finished'){
    if(activeRoomPlayState&&activeRoomPlayState.timerId)clearInterval(activeRoomPlayState.timerId);
    settleRoomRewardForMe(room);
  }

  const players=Object.values(room.players||{}).sort((a,b)=>Number(b.score||0)-Number(a.score||0));
  const isHost=room.hostUid===uid;
  const meP=room.players&&room.players[uid];

  const rosterHtml=`<div class="mp-roster">${players.map((p,idx)=>{
    const liveUser=allUsers().find(u=>u.uid===p.uid)||p;
    const isMe=p.uid===uid;
    const isFr=typeof isFriend==='function'?isFriend(p.uid):false;
    const badge=room.status==='finished'&&idx===0?'🏆':(p.finished?'✓':(room.status==='playing'?'⚡':'Ready'));
    return `<div class="mp-player-row ${isMe?'me':''}">
      ${av(liveUser,34)}
      <div class="mid">
        <b>${esc(liveUser.name||p.name||'Player')}${p.uid===room.hostUid?' <span class="mp-host-tag">HOST</span>':''}</b>
        <small>Score: <b>${Number(p.score||0)}</b> · ${badge}</small>
      </div>
      <div class="row" style="gap:4px">
        ${!isMe&&typeof toggleFriend==='function'?`<button type="button" class="btn ${isFr?'ghost':'ok'} sm" data-mpaddfr="${esc(p.uid)}">${isFr?'✓':'+Fr'}</button>`:''}
        ${!isMe?`<button type="button" class="btn gold sm rk-gift-btn" data-mpgift="${esc(p.uid)}" data-mpname="${esc(liveUser.name||p.name||'Player')}">Gift</button>`:''}
      </div>
    </div>`;
  }).join('')}</div>`;

  let stageHtml='';
  if(room.status==='waiting'){
    const launchBoardBtn=room.mode==='jackaroo'
      ? `<button type="button" class="btn gold sm" id="mpLaunchJackarooBtn">Launch Jackaroo Board</button>`
      : (room.mode==='uno'
        ? `<button type="button" class="btn gold sm" id="mpLaunchUnoBtn">Launch UNO Table</button>`
        : (room.mode==='number_match'
          ? `<button type="button" class="btn gold sm" id="mpLaunchNmBtn">Launch Number Match</button>`
          : ''));
    stageHtml=`
      <div class="mp-stage">
        <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:6px">
          <span class="mp-code-pill">Code: ${esc(room.code)}</span>
          <span style="font-size:12px;color:var(--mu)">${room.entryCoins>0?`Stake: ${fmtNum(room.entryCoins)} 🪙`:'Free Friendly · +15 🪙 Winner'}</span>
        </div>
        <div class="row" style="margin-top:10px;flex-wrap:wrap">
          ${isHost?`<button type="button" class="btn ok" style="flex:1" id="mpStartBtn">Start Match (${players.length} ${players.length===1?'Solo/Open':'Players'})</button>`:`<span class="dur-pill" style="flex:1;text-align:center">Waiting for host to start…</span>`}
          ${launchBoardBtn}
          <button type="button" class="btn ghost sm" id="mpShareWorldBtn">Share to World Chat</button>
          <button type="button" class="btn red sm" id="mpLeaveBtn">${isHost?'Close':'Leave'}</button>
        </div>
      </div>
    `;
  }else if(room.status==='playing'){
    const st=activeRoomPlayState;
    if(meP&&meP.finished){
      stageHtml=`<div class="mp-stage" style="text-align:center">
        <b>You finished with ${Number(meP.score||0)} pts!</b>
        <p style="font-size:12px;color:var(--mu);margin-top:4px">Waiting for other players to finish…</p>
        ${isHost?`<button type="button" class="btn sm ghost" id="mpForceEndBtn" style="margin-top:8px">Finish &amp; Settle Now</button>`:''}
      </div>`;
    }else if(st&&st.questions[st.qIdx]){
      const q=st.questions[st.qIdx];
      stageHtml=`<div class="mp-stage">
        <div class="row" style="justify-content:space-between;margin-bottom:8px">
          <span class="dur-pill">Q ${st.qIdx+1}/${st.questions.length}</span>
          <span class="dur-pill">⏱ <b id="mpTimerVal">${st.left}s</b></span>
          <span class="chip">Score: ${st.score}</span>
        </div>
        <p style="font-size:15px;font-weight:800;margin-bottom:10px">${esc(q.q)}</p>
        <div>${q.o.map((opt,i)=>`<button type="button" class="opt" data-mpans="${i}">${esc(opt)}</button>`).join('')}</div>
      </div>`;
    }
  }else if(room.status==='finished'){
    const top=players[0];
    stageHtml=`<div class="mp-stage mp-podium">
      <div style="font-size:12px;font-weight:800;color:var(--gold);text-transform:uppercase">Match Complete</div>
      <b style="font-size:17px">${top?`🏆 ${esc(top.name||'Winner')} leads with ${Number(top.score||0)} pts!`:'Match Finished'}</b>
      <div class="row" style="margin-top:10px;justify-content:center;flex-wrap:wrap">
        ${isHost?`<button type="button" class="btn ok sm" id="mpRematchBtn">Play Rematch</button>`:''}
        ${top&&top.uid!==uid?`<button type="button" class="btn gold sm" data-mpgift="${esc(top.uid)}" data-mpname="${esc(top.name||'Winner')}">Gift Winner</button>`:''}
        <button type="button" class="btn ghost sm" id="mpLeaveBtn">${isHost?'Close Room':'Leave'}</button>
      </div>
    </div>`;
  }

  const chatFeedHtml=room.status!=='playing'?`
    <div class="mp-chat-box">
      <div class="mp-chat-head">Room Chat &amp; Live Gifts</div>
      <div class="mp-chat-scroll" id="mpChatScroll">
        ${(room.chat||[]).map(c=>{
          if(c.type==='gift'){
            const g=typeof GIFT_BY_ID!=='undefined'?GIFT_BY_ID[c.giftId]:null;
            return `<div class="mp-gift-line">${g&&typeof giftSvg==='function'?giftSvg(g,26):'🎁'} <span><b>${esc(c.name)}</b> sent <b>${esc(c.giftName)} ×${clampSafeInt(c.qty||1,1,100)}</b> to <b>${esc(c.toName)}</b> (+${fmtNum(c.charm||0)} Charm · +${fmtNum(c.luckyCoins||0)} 🪙)</span></div>`;
          }
          if(c.type==='sys')return `<div class="mp-sys-line">${esc(c.text)}</div>`;
          return `<div class="mp-chat-line"><b>${esc(c.name||'Player')}:</b> <span>${esc(c.text)}</span></div>`;
        }).join('')||'<div class="mp-sys-line">Say hi or send a gift before starting!</div>'}
      </div>
      <div class="row" style="margin-top:8px">
        <input id="mpChatIn" maxlength="160" placeholder="Message room..." autocomplete="off" style="flex:1;padding:8px 10px;font-size:13px">
        <button type="button" class="btn sm" id="mpChatSend">Send</button>
      </div>
    </div>
  `:'';

  body.innerHTML=rosterHtml+stageHtml+chatFeedHtml;

  const sc=$('#mpChatScroll',body);
  if(sc)sc.scrollTop=sc.scrollHeight;

  body.onclick=e=>{
    const fb=e.target.closest('[data-mpaddfr]');
    if(fb&&typeof toggleFriend==='function'){
      const fUid=fb.dataset.mpaddfr;
      if(!isFriend(fUid))toggleFriend(fUid);
      toast('Friend added!');
      refreshActiveRoomModal();
      return;
    }
    const gb=e.target.closest('[data-mpgift]');
    if(gb&&typeof openGiftSendModal==='function'){
      openGiftSendModal(gb.dataset.mpgift,{inRoom:room.id,targetName:gb.dataset.mpname||'Player'});
      return;
    }
    const ans=e.target.closest('[data-mpans]');
    if(ans&&activeRoomPlayState&&!activeRoomPlayState.over){
      const q=activeRoomPlayState.questions[activeRoomPlayState.qIdx];
      const ok=Number(ans.dataset.mpans)===q.a;
      activeRoomPlayState.score+=ok?10:-2;
      activeRoomPlayState.qIdx++;
      if(typeof playSfx==='function')playSfx(ok?'duelCorrect':'duelWrong');
      const liveRoom=mpRooms.find(r=>r.id===room.id)||room;
      if(liveRoom.players&&liveRoom.players[uid]){
        liveRoom.players[uid].score=activeRoomPlayState.score;
        liveRoom.players[uid].qIdx=activeRoomPlayState.qIdx;
      }
      if(activeRoomPlayState.qIdx>=activeRoomPlayState.questions.length){
        activeRoomPlayState.finishMyRun();
      }else{
        persistMpRoom(liveRoom);
      }
    }
  };

  if($('#mpLaunchJackarooBtn',body)){
    $('#mpLaunchJackarooBtn',body).onclick=async ()=>{
      if(activeRoomModal)activeRoomModal.close();
      if(typeof ensureGameModule==='function')await ensureGameModule('jackaroo');
      if(typeof launchJackaroo==='function')launchJackaroo(room.entryCoins||0,null,'2v2',room.entryCoins>0?'pro':'standard',room.code);
    };
  }
  if($('#mpLaunchUnoBtn',body)){
    $('#mpLaunchUnoBtn',body).onclick=async ()=>{
      if(activeRoomModal)activeRoomModal.close();
      if(typeof ensureGameModule==='function')await ensureGameModule('uno');
      if(typeof launchUnoGame==='function')launchUnoGame(room.entryCoins||0,null,'4p',room.entryCoins>0?'pro':'standard',room.code);
    };
  }
  if($('#mpLaunchNmBtn',body)){
    $('#mpLaunchNmBtn',body).onclick=async ()=>{
      if(activeRoomModal)activeRoomModal.close();
      if(typeof ensureGameModule==='function')await ensureGameModule('number_match');
      if(typeof launchNumberMatch==='function')launchNumberMatch({mode:'duel',stake:room.entryCoins||0,roomCode:room.code});
    };
  }
  if($('#mpShareWorldBtn',body))$('#mpShareWorldBtn',body).onclick=()=>shareRoomToWorldChat(room);
  if($('#mpStartBtn',body))$('#mpStartBtn',body).onclick=()=>{
    const liveRoom=mpRooms.find(r=>r.id===room.id)||room;
    liveRoom.status='playing';
    liveRoom.startedAt=Date.now();
    Object.values(liveRoom.players||{}).forEach(p=>{p.score=0;p.qIdx=0;p.finished=false});
    if(typeof playSfx==='function')playSfx('click');
    persistMpRoom(liveRoom);
  };
  if($('#mpForceEndBtn',body))$('#mpForceEndBtn',body).onclick=()=>{
    const liveRoom=mpRooms.find(r=>r.id===room.id)||room;
    liveRoom.status='finished';
    persistMpRoom(liveRoom);
  };
  if($('#mpRematchBtn',body))$('#mpRematchBtn',body).onclick=()=>{
    const liveRoom=mpRooms.find(r=>r.id===room.id)||room;
    liveRoom.status='waiting';
    liveRoom.roundNo=Number(liveRoom.roundNo||1)+1;
    liveRoom.seed=liveRoom.code+'_'+Date.now();
    Object.values(liveRoom.players||{}).forEach(p=>{p.score=0;p.qIdx=0;p.finished=false});
    activeRoomPlayState=null;
    if(typeof playSfx==='function')playSfx('click');
    persistMpRoom(liveRoom);
  };
  if($('#mpLeaveBtn',body))$('#mpLeaveBtn',body).onclick=()=>{
    const liveRoom=mpRooms.find(r=>r.id===room.id);
    if(liveRoom){
      if(isHost){
        mpRooms=mpRooms.filter(r=>r.id!==room.id);
        saveMpRoomsLocal();
        dbOp(()=>F.deleteDoc(F.doc(db,'game_rooms',room.id)));
      }else if(liveRoom.players){
        delete liveRoom.players[uid];
        persistMpRoom(liveRoom);
      }
    }
    if(activeRoomModal)activeRoomModal.close();
    renderMultiplayerRooms();
  };

  const sendRoomChat=()=>{
    const inp=$('#mpChatIn',body);
    const txt=(inp?.value||'').trim();
    if(!txt)return;
    if(typeof hasBadWord==='function'&&hasBadWord(txt))return toast('Bad language is not allowed');
    inp.value='';
    const liveRoom=mpRooms.find(r=>r.id===room.id)||room;
    liveRoom.chat=[...(liveRoom.chat||[]),{id:'rc_'+Date.now().toString(36),type:'text',uid,name:me.name||'Player',text:txt,ts:Date.now()}].slice(-30);
    if(typeof playSfx==='function')playSfx('chatSend');
    persistMpRoom(liveRoom);
  };
  if($('#mpChatSend',body))$('#mpChatSend',body).onclick=sendRoomChat;
  if($('#mpChatIn',body))$('#mpChatIn',body).onkeydown=e=>{if(e.key==='Enter')sendRoomChat()};
}

function renderGameSlots(){
  if(typeof renderGamesLauncher==='function'&&$('#gamesLauncherRoot')){
    renderGamesLauncher();
    return;
  }
  if(typeof renderArenaPostersGrid==='function'){
    const ag=$('#arenaGamesGrid');
    if(ag)renderArenaPostersGrid(ag);
  }
  const baseCards=HUB_GAMES.map((g,i)=>`<button type="button" class="mini-game-3d-card glossy-card clean-mg-card ${esc(g[4]||'mg-math')}" data-hubgame="${i}">
    <div class="mg-3d-art">${GAME_SVG[g[1]]||GAME_SVG.custom}</div>
    <div class="mg-3d-foot">
      <b>${esc(g[0])}</b>
    </div>
  </button>`).join('');

  const extraCards=(Array.isArray(customGameSlots)?customGameSlots:[]).map((sg,idx)=>`<div class="mini-game-3d-card glossy-card clean-mg-card mg-custom" data-customgame="${idx}" role="button" tabindex="0">
    <div class="mg-3d-art">${GAME_SVG.custom}</div>
    <div class="mg-3d-foot">
      <b>${esc(sg.name||'Game')}</b>
    </div>
    ${devMode?`<button type="button" class="btn red sm mg-del-btn" data-delgameslot="${idx}">✕</button>`:''}
  </div>`).join('');

  const duelCard=`<button type="button" class="mini-game-3d-card glossy-card clean-mg-card mg-duel" data-hubduel="1">
    <div class="mg-3d-art">${GAME_SVG.duel}</div>
    <div class="mg-3d-foot">
      <b>60s MCQ Duel</b>
    </div>
  </button>`;

  const devSlotCard=devMode?`<button type="button" class="mini-game-3d-card glossy-card clean-mg-card mg-dev-slot" data-addgameslot="1">
    <div class="mg-3d-art">${GAME_SVG.plus}</div>
    <div class="mg-3d-foot">
      <b>+ New Slot</b>
    </div>
  </button>`:'';

  const gridEl=$('#gameSlotsGrid');
  if(gridEl){
    gridEl.classList.add('mini-games-3d-grid');
    gridEl.innerHTML=baseCards+extraCards+duelCard+devSlotCard;
  }
  renderMultiplayerRooms();
}

if($('#gameSlotsGrid'))$('#gameSlotsGrid').onclick=e=>{
  const delSlot=e.target.closest('[data-delgameslot]');
  if(delSlot){
    e.stopPropagation();
    if(!devMode)return toast('Developer only');
    const idx=+delSlot.dataset.delgameslot;
    customGameSlots=customGameSlots.filter((_,i)=>i!==idx);
    ls.set('sg_game_slots',customGameSlots);
    dbOp(()=>F.setDoc(F.doc(db,'config','game_slots'),{slots:customGameSlots,ts:Date.now()}));
    renderGameSlots();toast('Game slot removed');return;
  }
  if(e.target.closest('[data-addgameslot]')){
    if(!devMode)return toast('Developer only');
    const m=modal('Add Game Slot',`
      <label>Game Title</label><input id="gsN" maxlength="40" placeholder="e.g. Science Sprint">
      <label>Short Description</label><input id="gsD" maxlength="80" placeholder="Quick practice challenge">
      <label>HTML File or URL</label><input id="gsH" maxlength="140" placeholder="science-sprint.html">
      <button class="btn full" id="gsSave">Add Slot</button>
    `);
    $('#gsSave',m).onclick=()=>{
      const name=$('#gsN',m).value.trim(), desc=$('#gsD',m).value.trim(), href=$('#gsH',m).value.trim();
      if(!name||!href)return toast('Enter game title and file/URL');
      customGameSlots=[...(customGameSlots||[]),{name,desc:desc||'Study mini-game',href}];
      ls.set('sg_game_slots',customGameSlots);
      dbOp(()=>F.setDoc(F.doc(db,'config','game_slots'),{slots:customGameSlots,ts:Date.now()}));
      m.close();renderGameSlots();toast('Game slot added');
    };
    return;
  }
  const cg=e.target.closest('[data-customgame]');
  if(cg){
    const item=customGameSlots[+cg.dataset.customgame];
    if(item&&item.href)openPage(item.href,'games');
    return;
  }
  if(e.target.closest('[data-hubduel]')){showTab('chat');return toast('Open a friend chat & tap Duel')}
  const c=e.target.closest('[data-hubgame]');if(!c)return;
  const g=HUB_GAMES[+c.dataset.hubgame];
  if(g&&g[3])openPage(g[3],'games');else if(g)toast(g[0]+' — coming soon');
};

if($('#mpCreateBtn'))$('#mpCreateBtn').onclick=openCreateRoomModal;
if($('#gamesGiftBtn'))$('#gamesGiftBtn').onclick=()=>{
  if(typeof openGiftSendModal==='function')openGiftSendModal(null,{allowPickPlayer:true});
};

function settleDuel(m){
  if(m.type!=='duel'||m.settled||m.myScore==null||!me.done['bet_'+m.id])return;
  if(m.oppScore==null){
    if(Date.now()-(m.finishedAt||Date.now())>15*60000){
      m.settled=true;m.state='refund';
      if(!me.done['pay_'+m.id]){me.done['pay_'+m.id]=1;addReward(20,0,null,true)}
    }
    return;
  }
  m.settled=true;if(me.done['pay_'+m.id])return;me.done['pay_'+m.id]=1;
  if(m.myScore>m.oppScore){
    m.state='won';
    addReward(36,20,null,false,{silentSfx:true});
    if(typeof playSfx==='function')playSfx('duelWin');
  }
  else if(m.myScore===m.oppScore){m.state='tie';addReward(20,8,null,true)}
  else m.state='lost';
}
function sweepDuels(){let ch=false;Object.values(chats).forEach(t=>(t.messages||[]).forEach(m=>{if(m.type==='duel'&&!m.settled&&m.myScore!=null){settleDuel(m);ch=true}}));if(ch){saveChats();if(cur)renderThread()}}
function startTimedDuel(msg,peer){
  if(needLogin('coin duels'))return;
  if(!online)return toast('Duels need a live connection');
  if(!msg.accepted)return toast('Friend must Accept Challenge first');
  if(msg.paid||msg.myScore!=null||me.done['bet_'+msg.id])return toast('You already played this duel');
  if(me.coins<20)return toast('Need 20 coins');
  msg.paid=true;me.done['bet_'+msg.id]=1;addReward(-20,0,null,true,{silentSfx:true});saveChats();
  const g=DUEL_GAMES[msg.gi]||DUEL_GAMES[0],Q=drawDuelQuestionBatch(g,8,msg.id,1);
  let qIdx=0,score=0,left=60,over=false,iv=0;
  const m=modal(`${esc(g.name)} (60s)`,`<div class="row" style="justify-content:space-between;margin-bottom:8px;flex-wrap:wrap"><span class="dur-pill">⏱ <b id="dTimer">60s</b></span><span class="chip" id="dScore">Score: 0</span><button type="button" class="btn gold sm" id="dGiftBtn">Gift Opponent</button></div><div id="dBody"></div>`);
  if($('#dGiftBtn',m))$('#dGiftBtn',m).onclick=()=>{if(typeof openGiftSendModal==='function')openGiftSendModal(peer,{inDm:true})};
  const end=txt=>{
    if(over)return;over=true;clearInterval(iv);bumpStat('games_played');
    msg.myScore=score;msg.finishedAt=Date.now();
    const rid='r_'+msg.id+'_'+uid;
    dbOp(()=>F.setDoc(F.doc(db,'dm_messages',rid),{id:rid,type:'duel_result',ref:msg.id,from:uid,to:peer,score,ts:Date.now()}));
    settleDuel(msg);saveChats();if(cur)renderThread();
    const body=$('#dBody',m);
    if(body)body.innerHTML=`<div class="card"><b>${esc(txt)}</b><p style="color:var(--mu);margin-top:6px">Your score: ${score}. ${msg.oppScore==null?'Result updates automatically in chat once your friend finishes.':'Final: '+score+' vs '+msg.oppScore}</p><button type="button" class="btn gold sm" style="margin-top:10px" id="dEndGift">Send Gift to Opponent</button></div>`;
    if($('#dEndGift',m))$('#dEndGift',m).onclick=()=>{if(typeof openGiftSendModal==='function')openGiftSendModal(peer,{inDm:true})};
  };
  const step=()=>{
    if(over)return;if(qIdx>=Q.length)return end('All questions done');
    const item=Q[qIdx];
    $('#dBody',m).innerHTML=`<p style="margin-bottom:8px"><b>${esc(item.q)}</b></p>`+item.o.map((o,i)=>`<button class="opt" data-ans="${i}">${esc(o)}</button>`).join('');
    $$('[data-ans]',m).forEach(b=>b.onclick=()=>{
      if(over)return;
      const ok=+b.dataset.ans===item.a;
      score+=(ok?4:-2);
      if(typeof playSfx==='function')playSfx(ok?'duelCorrect':'duelWrong');
      $('#dScore',m).textContent='Score: '+score;
      qIdx++;step();
    });
  };
  iv=setInterval(()=>{if(over)return clearInterval(iv);left--;if($('#dTimer',m))$('#dTimer',m).textContent=left+'s';if(left<=0)end('Time up')},1000);
  m.onclose=()=>{clearInterval(iv);if(!over)end('Match ended')};
  step();
}
