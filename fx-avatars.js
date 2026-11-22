/* =====================================================================
   FX PACK: AVATARS  (data + Exclusive Leaderboard Top 1-3 SVG Emblems)
   ===================================================================== */
"use strict";

/* Free avatars everyone already has */
const FX_FREE_AVATARS=['🦊','🐼','🐯','🦉','🐙','🚀','🧠','🎮','⚡','🔥','🌟','🐲'];

/* Exclusive Top 1-3 Leaderboard Avatars/Crests (NOT sold in Store, earned only from Leaderboard Top 1-3) */
const LB_EXCLUSIVE_AVATARS={
  lb_av_top1:{
    id:'lb_av_top1',
    rank:1,
    name:'Sovereign Crown Crest',
    svg:`<svg class="av-svg" viewBox="0 0 64 64" fill="none" aria-label="Top 1 Sovereign Crest">
      <defs>
        <linearGradient id="lb1g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#fff6b8"/><stop offset="50%" stop-color="#ffd036"/><stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="#2b1600" stroke="url(#lb1g)" stroke-width="3"/>
      <path d="M14 42L10 21l12 9 10-15 10 15 12-9-4 21H14z" fill="url(#lb1g)" stroke="#5c2d00" stroke-width="2" stroke-linejoin="round"/>
      <rect x="14" y="44" width="36" height="5" rx="2.5" fill="#ffe57f"/>
      <circle cx="32" cy="31" r="3.2" fill="#dc2626"/>
    </svg>`
  },
  lb_av_top2:{
    id:'lb_av_top2',
    rank:2,
    name:'Celestial Silver Crest',
    svg:`<svg class="av-svg" viewBox="0 0 64 64" fill="none" aria-label="Top 2 Silver Crest">
      <defs>
        <linearGradient id="lb2g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ffffff"/><stop offset="55%" stop-color="#bfdbfe"/><stop offset="100%" stop-color="#64748b"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="#0f172a" stroke="url(#lb2g)" stroke-width="3"/>
      <path d="M32 12l5.8 12.2 13.4 1.8-9.8 9.4 2.4 13.4L32 42.4 20.2 48.8l2.4-13.4-9.8-9.4 13.4-1.8L32 12z" fill="url(#lb2g)" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="4" fill="#38bdf8"/>
    </svg>`
  },
  lb_av_top3:{
    id:'lb_av_top3',
    rank:3,
    name:'Ember Bronze Shield',
    svg:`<svg class="av-svg" viewBox="0 0 64 64" fill="none" aria-label="Top 3 Bronze Crest">
      <defs>
        <linearGradient id="lb3g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ffdfc2"/><stop offset="55%" stop-color="#e3904f"/><stop offset="100%" stop-color="#7c2d12"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="#230e04" stroke="url(#lb3g)" stroke-width="3"/>
      <path d="M32 12l17 7v13c0 11-7.4 18.6-17 22-9.6-3.4-17-11-17-22V19l17-7z" fill="url(#lb3g)" stroke="#431407" stroke-width="2" stroke-linejoin="round"/>
      <path d="M32 20l4 8.5 9 1.2-6.6 6.2 1.7 9L32 40.6l-8.1 4.3 1.7-9-6.6-6.2 9-1.2L32 20z" fill="#fff3e0"/>
    </svg>`
  }
};

function renderAvatarGlyph(avatarVal){
  if(avatarVal && LB_EXCLUSIVE_AVATARS[avatarVal]){
    return LB_EXCLUSIVE_AVATARS[avatarVal].svg;
  }
  const safe=String(avatarVal||'🦊').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return `<span>${safe}</span>`;
}

/* price = coins for 1 day (store.js multiplies by 1.8 for 2d, 4.5 for 1w) */
const AVATAR_CATS=[
 {id:'cute',   name:'Cute',            icon:'🐰', rarity:'common',    price:15, list:[
  ['🦊','Fox'],['🐼','Panda'],['🐯','Tiger Cub'],['🐱','Kitty'],['🐶','Puppy'],['🐰','Bunny'],
  ['🐻','Teddy'],['🐨','Koala'],['🐹','Hamster'],['🐥','Chick'],['🦄','Unicorn'],['🐧','Penguin'],
  ['🦋','Butterfly'],['🌸','Blossom'],['🍓','Strawberry'],['🧸','Teddy Toy'],['🐸','Froggy'],['🐙','Octopus']]},
 {id:'study',  name:'Study',           icon:'📚', rarity:'common',    price:15, list:[
  ['📚','Books'],['🧠','Brain'],['🎓','Graduate'],['✏️','Pencil'],['📝','Notes'],['🔬','Microscope'],
  ['🔭','Telescope'],['🧪','Test Tube'],['🧮','Abacus'],['📐','Ruler'],['🌍','Globe'],['💡','Idea'],
  ['🦉','Wise Owl'],['📖','Open Book'],['🖋️','Fountain Pen'],['🎒','Backpack'],['🧬','DNA'],['⚗️','Alembic']]},
 {id:'gaming', name:'Gaming',          icon:'🎮', rarity:'rare',      price:20, list:[
  ['🎮','Controller'],['🕹️','Joystick'],['👾','Invader'],['🤖','Robot'],['🧩','Puzzle'],['🎲','Dice'],
  ['♟️','Pawn'],['🃏','Joker'],['🎯','Bullseye'],['⚔️','Swords'],['🏹','Archer'],['💣','Bomb'],
  ['🚀','Rocket'],['🏎️','Racer'],['🥷','Ninja'],['🧟','Zombie'],['🦾','Mech Arm'],['🎰','Jackpot']]},
 {id:'neon',   name:'Neon & Space',    icon:'🌌', rarity:'rare',      price:25, list:[
  ['⚡','Bolt'],['🌟','Star'],['🌙','Moon'],['☄️','Comet'],['🪐','Saturn'],['🌌','Galaxy'],
  ['🛸','UFO'],['🌈','Rainbow'],['🔮','Crystal Ball'],['💫','Dizzy Star'],['✨','Sparkles'],['🔆','Glow'],
  ['🌠','Shooting Star'],['🧊','Ice Cube'],['🪩','Disco Ball'],['🎆','Fireworks'],['💠','Blue Gem'],['🔷','Neon Diamond']]},
 {id:'royal',  name:'Royal',           icon:'👑', rarity:'epic',      price:30, list:[
  ['👑','Crown'],['🤴','Prince'],['👸','Princess'],['🏰','Castle'],['🦁','Lion King'],['🦅','Eagle'],
  ['🐎','Stallion'],['💎','Diamond'],['🔱','Trident'],['⚜️','Fleur-de-lis'],['🛡️','Shield'],['🗡️','Dagger'],
  ['📜','Decree'],['🏆','Trophy'],['🥇','Gold Medal'],['💍','Ring'],['🦚','Peacock'],['🎩','Top Hat']]},
 {id:'mythic', name:'Mythic & Legendary', icon:'🐉', rarity:'legendary', price:45, list:[
  ['🐉','Dragon'],['🐲','Drake'],['🔥','Inferno'],['👹','Oni'],['👺','Tengu'],['💀','Skull'],
  ['☠️','Reaper'],['👻','Phantom'],['🧞','Genie'],['🧙','Wizard'],['🧛','Vampire'],['🧜','Merfolk'],
  ['🧚','Fairy'],['🦂','Scorpion'],['🐺','Wolf'],['🦇','Bat'],['🐍','Serpent'],['🦖','T-Rex'],
  ['🌋','Volcano'],['🗿','Moai']]}
];

const AVATAR_ALL=AVATAR_CATS.flatMap(c=>c.list.map(([e,n])=>({e,name:n,cat:c.id,catName:c.name,rarity:c.rarity,price:c.price,free:FX_FREE_AVATARS.includes(e)})));
const AVATAR_MAP=Object.fromEntries(AVATAR_ALL.map(a=>[a.e,a]));
const avatarMeta=e=>LB_EXCLUSIVE_AVATARS[e]||AVATAR_MAP[e]||null;

/* Paid store avatars only (excludes free + excludes Leaderboard Top 1-3 exclusives) */
const FX_AVATAR_STORE_ROWS=AVATAR_ALL.filter(a=>!a.free).map(a=>[a.e,a.name,a.price,a.catName+' avatar']);
const FX_AVATAR_PROFILE=AVATAR_CATS.map(c=>({id:c.id,name:c.name,icon:c.icon,list:c.list.map(x=>x[0])}));
