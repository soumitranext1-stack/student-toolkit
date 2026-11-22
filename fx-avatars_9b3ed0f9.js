/* =====================================================================
   FX PACK: AVATARS  (data only, no logic)
   Use: AVATAR_CATS for profile.js / store.js lists.
   Row format [emoji, name] is the same shape store.js already uses.
   ===================================================================== */
"use strict";

/* free avatars everyone already has (same 12 as USER_AVATARS in core.js) */
const FX_FREE_AVATARS=['🦊','🐼','🐯','🦉','🐙','🚀','🧠','🎮','⚡','🔥','🌟','🐲'];

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

/* ---------- helpers ---------- */
const AVATAR_ALL=AVATAR_CATS.flatMap(c=>c.list.map(([e,n])=>({e,name:n,cat:c.id,catName:c.name,rarity:c.rarity,price:c.price,free:FX_FREE_AVATARS.includes(e)})));
const AVATAR_MAP=Object.fromEntries(AVATAR_ALL.map(a=>[a.e,a]));      // emoji -> meta
const avatarMeta=e=>AVATAR_MAP[e]||null;

/* store.js rows (id=emoji): paid avatars only, grouped by category */
const FX_AVATAR_STORE_ROWS=AVATAR_ALL.filter(a=>!a.free).map(a=>[a.e,a.name,a.price,a.catName+' avatar']);
/* profile.js: categories with their emojis (everything, free ones included) */
const FX_AVATAR_PROFILE=AVATAR_CATS.map(c=>({id:c.id,name:c.name,icon:c.icon,list:c.list.map(x=>x[0])}));
