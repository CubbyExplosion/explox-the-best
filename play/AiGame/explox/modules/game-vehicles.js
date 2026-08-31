// ─── CAR SYSTEM ──────────────────────────────────────────────────────────────
const CAR_CATALOG = [
  { id:'city_cruiser', name:'City Cruiser',  emoji:'🚗', color:0xdd3333, price:2000,  speed:22 },
  { id:'gold_cab',     name:'Gold Cab',      emoji:'🚕', color:0xFFD700, price:3500,  speed:24 },
  { id:'off_roader',   name:'Off-Roader',    emoji:'🚙', color:0x336633, price:5000,  speed:26 },
  { id:'speed_racer',  name:'Speed Racer',   emoji:'🏎', color:0x2244ff, price:8000,  speed:38 },
  { id:'diamond_limo', name:'Diamond Limo',  emoji:'💎', color:0x44ddff, price:20000, speed:30 },
];

function buildCar(def, x, z, yawAngle) {
  const g = new THREE.Group();
  function b(w,h,d,color,px,py,pz) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color));
    m.position.set(px,py,pz); m.castShadow=true; g.add(m);
    return m;
  }
  // Tagged so the real Rainbow Paint add-on can recolor the live car — every existing caller
  // (NPC cars included) just ignores these extra properties, nothing else changes for them.
  g.bodyMesh  = b(4.2,1.3,8.5, def.color,     0,  0.65, 0);    // body
  g.cabinMesh = b(3.2,1.4,4.5, def.color,     0,  2.05,-0.5);  // cabin
  // Real glass now (was an opaque flat-color panel) — traffic cars need a driver to actually be
  // visible through it (see buildTrafficCarMesh below); a free, more realistic look for the
  // player's own car too, which was never see-through either.
  const glassMat = new THREE.MeshLambertMaterial({ color:0x88ccff, transparent:true, opacity:0.55 });
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(3.1,1.2,0.2), glassMat); windshield.position.set(0,1.75,1.8); windshield.castShadow=true; g.add(windshield);
  const rearWindow  = new THREE.Mesh(new THREE.BoxGeometry(3.1,1.1,0.2), glassMat); rearWindow.position.set(0,1.75,-2.8); rearWindow.castShadow=true; g.add(rearWindow);
  b(4.4,0.4,0.5, 0x888888,      0,  0.2,  4.5);  // front bumper
  b(4.4,0.4,0.5, 0x888888,      0,  0.2, -4.5);  // rear bumper
  [[-2.2,0.45,2.8],[2.2,0.45,2.8],[-2.2,0.45,-2.8],[2.2,0.45,-2.8]].forEach(([wx,wy,wz])=>b(0.9,0.9,0.9,0x111111,wx,wy,wz));
  b(0.9,0.45,0.15, 0xffffcc, -1.5,0.9, 4.35);   // headlight L
  b(0.9,0.45,0.15, 0xffffcc,  1.5,0.9, 4.35);   // headlight R
  b(0.9,0.45,0.15, 0xff2222, -1.5,0.9,-4.35);   // taillight L
  b(0.9,0.45,0.15, 0xff2222,  1.5,0.9,-4.35);   // taillight R
  g.position.set(x,0,z);
  g.rotation.y = yawAngle||0;
  scene.add(g);
  return g;
}

// ─── CAR RAM — driving into an NPC/robot/tree destroys it for real (item 160), reusing the exact
// same reward/consequence systems as fighting them on foot, plus a real 3D debris burst. ─────────
let carImpactDebris = []; // NOT persisted — {mesh,vx,vy,vz,life}
function spawnCarImpactBurst(x, z, colors) {
  for (let i=0; i<9; i++) {
    const sz = 0.18+Math.random()*0.28;
    const frag = new THREE.Mesh(new THREE.BoxGeometry(sz,sz,sz), new THREE.MeshBasicMaterial({ color: colors[i%colors.length] }));
    frag.position.set(x, 1+Math.random()*0.8, z);
    scene.add(frag);
    const ang = Math.random()*Math.PI*2, spd = 4+Math.random()*5;
    carImpactDebris.push({ mesh:frag, vx:Math.cos(ang)*spd, vy:6+Math.random()*5, vz:Math.sin(ang)*spd, life:1.1 });
  }
  sfx.boom();
}
function tickCarImpactDebris(dt) {
  if (!carImpactDebris.length) return;
  carImpactDebris.forEach(d => {
    d.life -= dt;
    d.vy -= 18*dt; // real gravity
    d.mesh.position.x += d.vx*dt;
    d.mesh.position.y = Math.max(0.05, d.mesh.position.y + d.vy*dt);
    d.mesh.position.z += d.vz*dt;
    d.mesh.rotation.x += dt*9; d.mesh.rotation.y += dt*7;
  });
  const dead = carImpactDebris.filter(d => d.life<=0);
  if (dead.length) { dead.forEach(d => scene.remove(d.mesh)); carImpactDebris = carImpactDebris.filter(d => d.life>0); }
}
function ramNPC(npc) {
  if (npc.isDown) return;
  spawnCarImpactBurst(npc.group.position.x, npc.group.position.z, [0xdddddd,0xffffff,0xbbbbbb]); // a cartoon "poof", not gore
  showNotif(`🚗💥 Ran over ${npc.name}!`);
  defeatNPC(npc);
}
function ramRobot(robot) {
  if (!robot.alive) return;
  spawnCarImpactBurst(robot.x, robot.z, [0x888899,0xffcc00,0x445566]);
  showNotif(`🚗💥 Smashed a ${robot.type.name}!`);
  defeatRobot(robot);
}
function ramRogueRobot(robot) {
  if (!robot.alive) return;
  spawnCarImpactBurst(robot.x, robot.z, [0x888899,0xffcc00,0x445566]);
  showNotif(`🚗💥 Smashed the rogue ${robot.type.name}!`);
  defeatRogueRobot(robot);
}
function ramTree(tree) {
  if (tree.fallen) return;
  spawnCarImpactBurst(tree.x, tree.z, [0x5c3a1e,0x2d7a2d,0x7a5c3a]);
  showNotif('🚗💥 Smashed through a tree!');
  // Real bug caught in verification: fellTree() itself grants no wood — chopTree() adds its own
  // +2 felling bonus BEFORE calling it, on top of the final hit's +1. Matching that exact +3 total
  // here too (was accidentally only +1 on the first pass, contradicting fellTree()'s own "+3" notif).
  woodCount += 3; updateWood();
  fellTree(tree);
}
// Buildings stay standing (they're permanent city architecture, not a real destroyable target like
// NPCs/robots/trees above) — ramming one instead charges a real repair fee. A real cooldown (not a
// per-frame charge) so sitting the car against a wall doesn't drain the wallet every single frame.
const BUILDING_CRASH_FEE = 30;
let lastCarCrashAt = 0;
function crashIntoBuilding(x, z) {
  const now = performance.now();
  if (now - lastCarCrashAt < 1500) return;
  lastCarCrashAt = now;
  const fee = activeAddOns.includes('crashinsurance') ? 0 : Math.min(sipDollars, BUILDING_CRASH_FEE);
  spendSip(fee); updateSIP(); saveCurrentUser();
  spawnCarImpactBurst(x, z, [0xff8800,0x888888,0xffcc00]); // sparks, not the "destroyed" debris palette
  sfx.hit();
  // Bumper Bounce — a real backward knockback along the car's own heading, away from the wall.
  if(activeAddOns.includes('bumperbounce') && activeCar) {
    activeCar.group.position.x -= Math.sin(carYaw)*4;
    activeCar.group.position.z -= Math.cos(carYaw)*4;
  }
  showNotif(fee>0 ? `🚗💢 Crashed into a building! -${fee} S.I.P. for damages.` : `🚗💢 Crashed into a building! Crash Insurance covered it.`);
}
// Checked every frame while actually driving at a real meaningful speed (a car idling next to
// someone shouldn't "ram" them) — removing the hit target's own collider (robots/trees) BEFORE
// the movement/isBlocked() check runs later this same frame lets the car smash straight through
// instead of still bouncing off a now-invisible wall where the target used to stand.
const RAM_RADIUS = 3.4; // still used for NPCs/rogue robots — real targets with NO CITY_COLS collider, so there's no block-check to race against.
function boxHit(px, pz, r, cx, cz, hw, hd) {
  return px+r > cx-hw && px-r < cx+hw && pz+r > cz-hd && pz-r < cz+hd;
}
// Real bug fix: driving into a tree (or ambient robot) sometimes showed "Crashed into a building!"
// instead of felling/destroying it. The old version checked a plain CIRCLE of radius RAM_RADIUS
// around the car's CURRENT (pre-move) position, while isBlocked() checks a RECTANGLE — the car's
// own radius inflated around the target's real collider half-width/half-depth (0.5 for trees, 0.6
// for robots, see their addCol() calls) — at the car's NEXT (post-move) position. A rectangle's
// CORNERS reach farther than a circle of the same nominal radius, so approaching a tree/robot
// diagonally could trip isBlocked() before the circular ram check ever caught up, and the generic
// building-crash path fired instead. Fixed by checking ram against the EXACT SAME (nx,nz) position
// and CAR_R radius isBlocked() is about to use, with the SAME rectangle geometry — ram and block
// can no longer disagree on what counts as "close enough," and ram (checked first) always wins.
function tickCarRam(nx, nz, r) {
  for (const npc of npcs) {
    if (npc.isDown) continue;
    if (Math.hypot(nx-npc.group.position.x, nz-npc.group.position.z) < RAM_RADIUS) { ramNPC(npc); return true; }
  }
  for (const rb of robots) {
    if (!rb.alive) continue;
    if (boxHit(nx, nz, r, rb.x, rb.z, 0.6, 0.6)) { ramRobot(rb); return true; }
  }
  for (const rb of rogueRobots) {
    if (!rb.alive) continue;
    if (Math.hypot(nx-rb.x, nz-rb.z) < RAM_RADIUS) { ramRogueRobot(rb); return true; }
  }
  for (const tree of WOOD_TREES) {
    if (tree.fallen) continue;
    if (boxHit(nx, nz, r, tree.x, tree.z, 0.5, 0.5)) { ramTree(tree); return true; }
  }
  return false;
}

const CAR_PARKING_SPOTS = [
  {x:117,z:44},{x:124,z:44},{x:131,z:44},{x:138,z:44},{x:145,z:44}
];

// Real per-country parking spot for a car that flew along with you (item 156) — open ground near
// that country's airport, clear of every building item 154 added there.
function carLocationSpot(name) {
  if (name === 'Downtown Explox' || !name) return null; // downtown uses CAR_PARKING_SPOTS below, unchanged
  if (name === 'Home') return { x: -45, z: -107 }; // real open ground just outside your House's fenced yard (fence spans x:[-40,-20])
  const theme = COUNTRY_THEMES.find(t => t.name === name);
  // -30/+90 (1x-scale "open ground near the airport") scaled ×20 for item ~234's country resize —
  // theme.cx/cz are already the new, final scaled center, so only this offset needed the ×20.
  return theme ? { x: theme.cx-600, z: theme.cz+1800 } : null;
}
function parkCarAtHome() {
  if (!ownedCars.length) { showNotif("❌ You don't own a car yet! Buy one at the Car Dealership."); return; }
  if (carLocation === 'Home') { showNotif('🅿️ Your car is already parked here!'); return; }
  carLocation = 'Home';
  saveCurrentUser();
  spawnOwnedCars();
  sfx.buy();
  showNotif('🅿️ Your car is now parked at home!');
}
function spawnOwnedCars() {
  parkedCars.forEach(pc => scene.remove(pc.group));
  parkedCars = [];
  ownedCars.forEach((carId, i) => {
    const def = CAR_CATALOG.find(c => c.id === carId);
    if(!def) return;
    // Only your FIRST-owned car can travel — every other car always stays at the Downtown lot
    if (i === 0 && carLocation !== 'Downtown Explox') {
      const spot = carLocationSpot(carLocation);
      if (spot) { parkedCars.push({def, group: buildCar(def, spot.x, spot.z, 0), carYaw:0}); return; }
    }
    const spot = CAR_PARKING_SPOTS[i % CAR_PARKING_SPOTS.length];
    const group = buildCar(def, spot.x, spot.z, 0);
    parkedCars.push({def, group, carYaw:0});
  });
}

function openCarShop() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  const modal = document.getElementById('carShopModal');
  modal.style.display = 'flex';
  refreshCarShopUI();
}
function closeCarShop() {
  document.getElementById('carShopModal').style.display = 'none';
}
function refreshCarShopUI() {
  const list = document.getElementById('carShopList');
  list.innerHTML = '';
  CAR_CATALOG.forEach((def, i) => {
    const owned = ownedCars.includes(def.id);
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name}</div>
      <div class="siCost">💰 ${def.price.toLocaleString()} S.I.P. &nbsp;|&nbsp; 🏎 Speed: ${def.speed}</div>
      <button class="shopBtn" ${owned?'disabled':''} onclick="buyCarItem(${i})">${owned?'✅ Owned':'Buy'}</button>`;
    list.appendChild(d);
  });
}
function buyCarItem(idx) {
  const def = CAR_CATALOG[idx];
  if(ownedCars.includes(def.id)) { showNotif('You already own this car!'); return; }
  const cost = def.price;
  if(sipDollars < cost) { sfx.nope(); showNotif(`❌ Need ${cost} S.I.P.!`); return; }
  spendSip(cost);
  updateSIP();
  ownedCars.push(def.id);
  saveCurrentUser();
  spawnOwnedCars();
  sfx.buy();
  showNotif(`${def.emoji} ${def.name} purchased! Find it parked at the Car Shop!`);
  refreshCarShopUI();
}
function enterCar(pc) {
  activeCar = pc;
  inCar = true;
  carYaw = pc.carYaw || 0;
  playerGroup.visible = false;
  showNotif(`🚗 Driving ${pc.def.name}! WASD to drive · A/D to turn · E to exit`);
}
function exitCar() {
  if(!inCar||!activeCar) return;
  playerGroup.position.x = activeCar.group.position.x + Math.cos(carYaw)*5;
  playerGroup.position.z = activeCar.group.position.z - Math.sin(carYaw)*5;
  activeCar.carYaw = carYaw;
  activeCar = null;
  inCar = false;
  playerGroup.visible = true;
  showNotif('Stepped out of car.');
}

// ─── STORE OWNERSHIP — buy a real store that appears in the world ───────────
// Only one store can be owned at a time; buying a new one replaces the old one.
const STORE_CATALOG = [
  { id:'kiosk',    name:'Corner Kiosk',     price:100,   size:'small',  floors:1, furnished:false },
  { id:'minimart', name:'Mini Mart',        price:500,   size:'small',  floors:1, furnished:true  },
  { id:'mainst',   name:'Main Street Shop', price:1000,  size:'medium', floors:1, furnished:false },
  { id:'boutique', name:'Boutique Store',   price:2000,  size:'medium', floors:1, furnished:true  },
  { id:'grocery',  name:'Grocery Store',    price:3000,  size:'medium', floors:1, furnished:true  },
  { id:'plaza',    name:'Plaza Storefront', price:4000,  size:'large',  floors:1, furnished:false },
  { id:'outlet',   name:'Outlet Center',    price:5000,  size:'large',  floors:2, furnished:false },
  { id:'depart',   name:'Department Store', price:6000,  size:'large',  floors:2, furnished:true  },
  { id:'complex',  name:'Shopping Complex', price:10000, size:'xlarge', floors:2, furnished:true  },
  { id:'tower',    name:'Commerce Tower',   price:15000, size:'xlarge', floors:2, furnished:true  },
];
// Footprint per size — floors * fh gives total building height (2-story = taller, same footprint)
const STORE_SIZES = {
  small:  { w:10, d:8,  fh:6   },
  medium: { w:14, d:10, fh:6.5 },
  large:  { w:18, d:12, fh:7   },
  xlarge: { w:22, d:14, fh:7.5 },
};
const STORE_PLOT = { x:160, z:-25 }; // open ground east of The Diner
let ownedStore = null;       // {id, customName} or null — persisted per account
let storeGroup = null;       // current 3D building THREE.Group, so it can be torn down on upgrade
let storeCustomerNPCs = [];  // customer NPCs tied to the current store, torn down together with it

// ─── STORE INTERIOR — walk in/out, buy ingredients (eat) and furniture (decorate) ──
// 40 real base foods × 25 "styles" (Plain, Organic, Deluxe, ...) = exactly 1000 distinct items,
// generated by formula instead of hand-typed one at a time — same trick as the 50 music tracks
// (a hand-made seed set + a formula for volume). Style changes the name and the price multiplier.
const BASE_INGREDIENTS = [
  {id:'tomato',emoji:'🍅',name:'Tomato',price:3,taste:'savory'}, {id:'carrot',emoji:'🥕',name:'Carrot',price:2,taste:'savory'},
  {id:'cheese',emoji:'🧀',name:'Cheese',price:5,taste:'savory'}, {id:'bread',emoji:'🍞',name:'Bread',price:4,taste:'savory'},
  {id:'milk',emoji:'🥛',name:'Milk',price:3,taste:'sweet'},      {id:'eggs',emoji:'🥚',name:'Eggs',price:4,taste:'savory'},
  {id:'chicken',emoji:'🍗',name:'Chicken',price:8,taste:'savory'},{id:'apple',emoji:'🍎',name:'Apple',price:2,taste:'sweet'},
  {id:'onion',emoji:'🧅',name:'Onion',price:2,taste:'spicy'},    {id:'banana',emoji:'🍌',name:'Banana',price:2,taste:'sweet'},
  {id:'grapes',emoji:'🍇',name:'Grapes',price:4,taste:'sweet'},  {id:'fish',emoji:'🐟',name:'Fish',price:9,taste:'savory'},
  {id:'rice',emoji:'🍚',name:'Rice',price:3,taste:'savory'},     {id:'butter',emoji:'🧈',name:'Butter',price:4,taste:'savory'},
  {id:'potato',emoji:'🥔',name:'Potato',price:2,taste:'savory'}, {id:'corn',emoji:'🌽',name:'Corn',price:3,taste:'sweet'},
  {id:'broccoli',emoji:'🥦',name:'Broccoli',price:3,taste:'savory'},{id:'strawberry',emoji:'🍓',name:'Strawberry',price:4,taste:'sweet'},
  {id:'orange',emoji:'🍊',name:'Orange',price:3,taste:'sweet'},  {id:'watermelon',emoji:'🍉',name:'Watermelon',price:5,taste:'sweet'},
  {id:'pepper',emoji:'🌶️',name:'Pepper',price:2,taste:'spicy'}, {id:'mushroom',emoji:'🍄',name:'Mushroom',price:3,taste:'savory'},
  {id:'garlic',emoji:'🧄',name:'Garlic',price:2,taste:'spicy'},  {id:'lemon',emoji:'🍋',name:'Lemon',price:2,taste:'sour'},
  {id:'avocado',emoji:'🥑',name:'Avocado',price:5,taste:'savory'},{id:'bacon',emoji:'🥓',name:'Bacon',price:7,taste:'savory'},
  {id:'shrimp',emoji:'🦐',name:'Shrimp',price:9,taste:'savory'}, {id:'honey',emoji:'🍯',name:'Honey',price:6,taste:'sweet'},
  {id:'yogurt',emoji:'🥣',name:'Yogurt',price:4,taste:'sweet'},  {id:'pasta',emoji:'🍝',name:'Pasta',price:4,taste:'savory'},
  {id:'cereal',emoji:'🌾',name:'Cereal',price:5,taste:'sweet'},  {id:'cookie',emoji:'🍪',name:'Cookie',price:3,taste:'sweet'},
  {id:'chocolate',emoji:'🍫',name:'Chocolate',price:4,taste:'sweet'},{id:'pretzel',emoji:'🥨',name:'Pretzel',price:3,taste:'savory'},
  {id:'peanuts',emoji:'🥜',name:'Peanuts',price:3,taste:'savory'},{id:'icecream',emoji:'🍦',name:'Ice Cream',price:5,taste:'sweet'},
  {id:'soda',emoji:'🥤',name:'Soda',price:2,taste:'sweet'},      {id:'coffee',emoji:'☕',name:'Coffee',price:4,taste:'bitter'},
  {id:'tea',emoji:'🍵',name:'Tea',price:3,taste:'bitter'},       {id:'chips',emoji:'🍟',name:'Chips',price:3,taste:'savory'},
];
const INGREDIENT_STYLES = [
  {id:'plain',label:'',mult:1.0}, {id:'fresh',label:'Fresh',mult:1.1}, {id:'organic',label:'Organic',mult:1.4},
  {id:'premium',label:'Premium',mult:1.6}, {id:'value',label:'Value Pack',mult:0.6}, {id:'frozen',label:'Frozen',mult:0.8},
  {id:'canned',label:'Canned',mult:0.7}, {id:'imported',label:'Imported',mult:1.8}, {id:'local',label:'Local',mult:1.2},
  {id:'deluxe',label:'Deluxe',mult:2.0}, {id:'family',label:'Family Size',mult:1.3}, {id:'mini',label:'Mini',mult:0.5},
  {id:'jumbo',label:'Jumbo',mult:1.7}, {id:'gourmet',label:'Gourmet',mult:2.2}, {id:'budget',label:'Budget',mult:0.4},
  {id:'farm',label:'Farm Fresh',mult:1.15}, {id:'wild',label:'Wild-Caught',mult:1.5}, {id:'artisan',label:'Artisan',mult:1.9},
  {id:'classic',label:'Classic',mult:1.05}, {id:'xl',label:'Extra Large',mult:1.4}, {id:'diet',label:'Diet',mult:0.9},
  {id:'smoked',label:'Smoked',mult:1.3}, {id:'pickled',label:'Pickled',mult:1.1}, {id:'dried',label:'Dried',mult:0.75},
  {id:'limited',label:'Limited Edition',mult:2.5},
];
const STORE_INGREDIENTS = [];
INGREDIENT_STYLES.forEach(style => {
  BASE_INGREDIENTS.forEach(base => {
    STORE_INGREDIENTS.push({
      id: base.id + '_' + style.id,
      baseId: base.id,
      name: style.label ? `${style.label} ${base.name}` : base.name,
      emoji: base.emoji,
      price: Math.max(1, Math.round(base.price * style.mult)),
      taste: base.taste,
    });
  });
});
// = 25 styles × 40 bases = 1000. Unlocked in this same order (all 40 Plain ones first, then
// all 40 Fresh ones, etc.) so leveling up broadens variety before it adds fancy price tiers.

// ─── STORE LEVEL — goes up from sales made, unlocks more of the 1000 ingredient types ──
let storeSalesCount = 0; // persisted per account
function storeLevel(){ return Math.min(400, Math.floor(storeSalesCount/5) + 1); }
function unlockedIngredientCount(){
  const lvl = storeLevel();
  return Math.min(STORE_INGREDIENTS.length, 10 + Math.round((lvl-1) * (STORE_INGREDIENTS.length-10) / 399));
}
function salesUntilNextLevel(){
  if(storeLevel() >= 400) return 0;
  return (storeLevel()*5) - storeSalesCount;
}
// Fixed slot per furniture piece (local room coords) so pieces never overlap
const FURNITURE_CATALOG = [
  { id:'shelf',    name:'Shelf Unit',    emoji:'🗄️', price:50, slot:{x:-4,z:-4} },
  { id:'rack',     name:'Display Rack',  emoji:'👕', price:60, slot:{x:4, z:-4} },
  { id:'rug',      name:'Cozy Rug',      emoji:'🟫', price:30, slot:{x:0, z:1}  },
  { id:'plant',    name:'Potted Plant',  emoji:'🪴', price:25, slot:{x:-4,z:2}  },
  { id:'lamp',     name:'Floor Lamp',    emoji:'💡', price:35, slot:{x:4, z:2}  },
  { id:'painting', name:'Wall Painting', emoji:'🖼️', price:40, slot:{x:-3,z:-5.8} },
  { id:'couch',    name:'Waiting Couch', emoji:'🛋️', price:70, slot:{x:3, z:3}  },
];
const STORE_COLS = [];        // interior colliders — empty, matching House/Mall/Hotel (walls are visual only)
const STORE_INTERIOR = { x:40000, z:0 };
const STORE_EXIT      = { x:40000, z:7 };
let ownedFurniture = [];      // furniture ids owned, persisted per account, carries across store upgrades
let storeStock = {};          // per-ingredient counts on the shelf, e.g. {tomato:3} — persisted per account
let storePrices = {};         // your sell price per ingredient id, e.g. {chicken_plain:20, icecream_plain:30} — persisted per account
let shopOpen = false;         // NOT persisted — a shop always starts closed, you have to be there running it
let shopSalesTimer = null;
let storeAdLevel = 0;         // persisted per account — each level makes customers show up more often, and costs more
const MAX_STAFF = 2;          // one stands behind each of the 2 counters
let ownedStaff = [];          // persisted per account — [{name}]; hired staff keep the shop selling while you're away
const STAFF_NAMES = ['Alex','Jordan','Sam','Riley'];
let friends = [];        // persisted per account — names of Suburbs neighbors you've befriended
let houseGuest = null;   // persisted per account — name of the friend currently hanging out at your house, or null
let inFriendHouse = false;    // NOT persisted, matches inHouse/inStore/etc. — true while visiting a friend's house
let visitingFriendName = null; // which friend's house is currently built, while inFriendHouse
let houseGuestMeshes = [];    // meshes for the guest figure inside YOUR house, tracked so refreshHouseGuest() can clean them up
let friendHouseMeshes = [];   // meshes for the shared "visiting a friend" room, rebuilt fresh per visit
const FRIEND_HOUSE_SPAWN = { x:50000, z:0 }; // its own 10,000-unit lane, same spacing scheme as every other pocket interior

// ─── RESTOCKING — buy it, a box is delivered, carry it to its shelf, press E to shelve+label it ──
// Each ingredient gets a fixed shelf spot (two rows near the back wall), so stock is now
// tracked per ingredient (storeStock is an object keyed by id) instead of one shared number.
// Shelves are built dynamically, one per ingredient TYPE you've actually stocked (there are
// 1000 possible types now, not just 10, so a fixed slot per catalog entry no longer works).
// storeStockOrder remembers the order they were first shelved, so positions stay stable —
// capped at 4 rows (20 shelves) so the room doesn't grow into the back wall forever.
let storeStockOrder = []; // persisted per account
const SHELF_ROW_CAP = 4;
const BOX_QTY = 5; // every restock box holds this many units — priced as unit price × BOX_QTY
function getShelfSlots(){
  return storeStockOrder.slice(0, 5*SHELF_ROW_CAP).map((id,i) => ({
    id, x: [-4,-2,0,2,4][i%5], row: Math.floor(i/5),
  }));
}
function shelfLocalPos(slot, roomD){ return { x: slot.x, z: -roomD/2 + 0.7 + slot.row*1.4 }; }
function currentRoomDepth(){
  const def = STORE_CATALOG.find(s => s.id === ownedStore.id);
  return STORE_SIZES[def.size].d + 6;
}
let storeBoxes = [];      // boxes delivered and sitting on the floor, waiting to be carried: {ingredientId, group, x, z}
const MAX_CARRY_BOXES = 3; // carry a small stack at once instead of one trip per box — less tedious restocking
let carriedBoxes = [];    // [{ingredientId}, ...] up to MAX_CARRY_BOXES — not persisted, you have to finish the job
let carriedBoxMeshes = [];

function spawnStoreBox(ingredientId){
  const ing = STORE_INGREDIENTS.find(i => i.id === ingredientId);
  const dropX = STORE_INTERIOR.x - 3 + (Math.random()-0.5)*1.4;
  const dropZ = STORE_INTERIOR.z - 2 + (Math.random()-0.5)*1.4; // delivered near the ingredients counter
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.8,0.8,0.8), new THREE.MeshLambertMaterial({color:0xC08040})));
  const cv=document.createElement('canvas'); cv.width=64; cv.height=64;
  const cx=cv.getContext('2d'); cx.font='34px Arial'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText(ing.emoji,32,26);
  cx.fillStyle='#fff'; cx.font='bold 15px Arial'; cx.fillText('×'+BOX_QTY,32,50);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.7), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv), transparent:true}));
  label.position.y=0.41; label.rotation.x=-Math.PI/2; g.add(label);
  g.position.set(dropX, 0.4, dropZ);
  scene.add(g);
  storeBoxes.push({ingredientId, group:g, x:dropX, z:dropZ});
}
function restackCarriedBoxMeshes(){
  carriedBoxMeshes.forEach((m,i) => m.position.set(0, 2.4 + i*0.55, 0.6));
}
function tryPickUpBox(){
  const px=playerGroup.position.x, pz=playerGroup.position.z;
  const idx = storeBoxes.findIndex(b => Math.hypot(px-b.x, pz-b.z) < 2);
  if(idx===-1) return false;
  if(carriedBoxes.length >= MAX_CARRY_BOXES){
    showNotif(`🙌 Hands full — carrying ${MAX_CARRY_BOXES}/${MAX_CARRY_BOXES} boxes. Go shelve one first!`);
    return true;
  }
  const box = storeBoxes[idx];
  scene.remove(box.group);
  storeBoxes.splice(idx,1);
  carriedBoxes.push({ ingredientId: box.ingredientId });
  const ing = STORE_INGREDIENTS.find(i => i.id === box.ingredientId);
  showNotif(`📦 Picked up ${ing.emoji} ${ing.name} (${carriedBoxes.length}/${MAX_CARRY_BOXES}) — shelve it (E) or grab more!`);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.6), new THREE.MeshLambertMaterial({color:0xC08040})));
  playerGroup.add(g);
  carriedBoxMeshes.push(g);
  restackCarriedBoxMeshes();
  return true;
}
// Places whichever ONE of the carried boxes matches the shelf you're currently standing at —
// carrying several different ingredients at once just means a few E-presses at their own
// shelves instead of a separate round trip per box.
function tryPlaceBox(){
  if(!ownedStore || carriedBoxes.length === 0) return false;
  const roomD = currentRoomDepth();
  const px=playerGroup.position.x, pz=playerGroup.position.z;
  const slots = getShelfSlots();
  for(let i=0; i<carriedBoxes.length; i++){
    const carried = carriedBoxes[i];
    const carriedIsNew = !storeStockOrder.includes(carried.ingredientId);
    // A brand-new ingredient (never shelved before) can go on any EMPTY slot within the grid —
    // that spot becomes its permanent shelf. An ingredient that already has a shelf must go
    // on that SAME shelf (the "wrong shelf" rejection), even if other empty ones are closer.
    const targetSlots = carriedIsNew
      ? Array.from({length: 5*SHELF_ROW_CAP}, (_,k) => ({ x:[-4,-2,0,2,4][k%5], row:Math.floor(k/5) })).filter((s,k) => k >= slots.length)
      : slots.filter(s => s.id === carried.ingredientId);
    for(const slot of targetSlots){
      const lp = shelfLocalPos(slot, roomD);
      const wx = STORE_INTERIOR.x + lp.x, wz = STORE_INTERIOR.z + lp.z;
      if(Math.hypot(px-wx, pz-wz) < 1.8){
        const ing = STORE_INGREDIENTS.find(x => x.id === carried.ingredientId);
        if(carriedIsNew) storeStockOrder.push(carried.ingredientId); // only claim a new shelf slot once, ever
        storeStock[carried.ingredientId] = (storeStock[carried.ingredientId]||0) + BOX_QTY;
        saveCurrentUser();
        carriedBoxes.splice(i,1);
        const mesh = carriedBoxMeshes.splice(i,1)[0];
        if(mesh) playerGroup.remove(mesh);
        restackCarriedBoxMeshes();
        const remaining = carriedBoxes.length ? ` (${carriedBoxes.length} more box${carriedBoxes.length>1?'es':''} to go)` : '';
        showNotif((carriedIsNew
          ? `🏷️ New shelf labeled: ${ing.emoji} ${ing.name} (+${BOX_QTY} — ${storeStock[ing.id]} in stock)`
          : `📦 Restocked: ${ing.emoji} ${ing.name} (+${BOX_QTY} — ${storeStock[ing.id]} in stock)`) + remaining);
        sfx.buy();
        buildStoreInterior();
        refreshStoreManagerUI();
        return true;
      }
    }
  }
  // Nothing we're carrying matches this spot — if we're standing at an existing shelf,
  // explain why nothing happened instead of just doing nothing silently.
  for(const slot of slots){
    const lp = shelfLocalPos(slot, roomD);
    const wx = STORE_INTERIOR.x + lp.x, wz = STORE_INTERIOR.z + lp.z;
    if(Math.hypot(px-wx, pz-wz) < 1.8){
      const wrongIng = STORE_INGREDIENTS.find(x => x.id === slot.id);
      showNotif(`❌ That's the ${wrongIng.name} shelf — none of what you're carrying goes there.`);
      return true;
    }
  }
  return false;
}
let storeInteriorGroup = null;

function interactWithStorePlot(){ ownedStore ? enterStore() : openStoreManager(); }
function enterStore(){
  if(!ownedStore){ showNotif("🏪 You don't own a store yet!"); return; }
  inStore = true;
  playerGroup.position.set(STORE_INTERIOR.x, 0, STORE_INTERIOR.z);
  yaw = Math.PI;
  showNotif(`🏪 Welcome to ${ownedStore.customName}!`);
}
function exitStore(){
  if(shopOpen && ownedStaff.length === 0){ // no staff to cover it — leaving automatically closes up shop
    shopOpen = false;
    clearInterval(shopSalesTimer);
    shopSalesTimer = null;
  }
  if(carriedBoxes.length){ // can't carry boxes out into the city — drop them, they'll be waiting inside
    carriedBoxes.forEach(b => spawnStoreBox(b.ingredientId));
    carriedBoxMeshes.forEach(m => playerGroup.remove(m));
    carriedBoxes = [];
    carriedBoxMeshes = [];
  }
  inStore = false;
  playerGroup.position.set(STORE_PLOT.x, 0, STORE_PLOT.z + 15);
  yaw = 0;
  showNotif(shopOpen ? "Leaving your store — your staff has it covered!" : 'Leaving your store...');
}
const STORE_ZONES = [
  { x:STORE_EXIT.x,   z:STORE_EXIT.z,   r:3,   label:'Exit Store',          action: () => exitStore()},
  { x:STORE_INTERIOR.x-3, z:STORE_INTERIOR.z-4, r:2.5, label:'🛒 Buy Ingredients', action: () => openIngredientsCounter()},
  { x:STORE_INTERIOR.x+3, z:STORE_INTERIOR.z-4, r:2.5, label:'🪑 Buy Furniture',   action: () => openFurnitureCounter()},
  { x:STORE_INTERIOR.x,   z:STORE_INTERIOR.z+2, r:2.5, label:'🏪 Manage Store',    action: () => openStoreManager()},
];

function openIngredientsCounter() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('ingredientsCounterModal').style.display = 'flex';
  refreshIngredientsCounterUI();
}
function closeIngredientsCounter() { document.getElementById('ingredientsCounterModal').style.display = 'none'; }
function refreshIngredientsCounterUI() {
  const list = document.getElementById('ingredientsCounterList');
  list.innerHTML = '';
  const unlocked = unlockedIngredientCount();
  const header = document.createElement('div');
  header.style.cssText = 'color:#e0a860;font-size:11px;text-align:center;margin-bottom:8px;';
  header.textContent = `🏪 Level ${storeLevel()} — ${unlocked}/${STORE_INGREDIENTS.length} item types unlocked`;
  list.appendChild(header);
  STORE_INGREDIENTS.slice(0, unlocked).forEach((def, i) => {
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name} <span style="opacity:0.7;font-size:10px;">(box of ${BOX_QTY})</span></div>
      <div class="siCost">💰 ${def.price * BOX_QTY} S.I.P.</div>
      <button class="shopBtn" onclick="buyIngredient(${i})">Buy</button>`;
    list.appendChild(d);
  });
}
function buyIngredient(idx) {
  const def = STORE_INGREDIENTS[idx];
  const boxPrice = def.price * BOX_QTY;
  if(sipDollars < boxPrice) { sfx.nope(); showNotif(`❌ Need ${boxPrice} S.I.P.!`); return; }
  spendSip(boxPrice);
  updateSIP();
  sfx.buy();
  closeIngredientsCounter();
  spawnStoreBox(def.id);
  showNotif(`📦 A box of ${BOX_QTY}× ${def.emoji} ${def.name} arrived! Carry it (E) to the ${def.name} shelf and press E again.`);
}

// ─── RUNNING THE SHOP — open it, price your stock, and customers buy while you're there ──
function toggleShopOpen(){
  if(!ownedStore){ showNotif("You don't own a store yet!"); return; }
  shopOpen = !shopOpen;
  if(shopOpen){
    showNotif('🔓 Shop is open for business!');
    shopSalesTimer = setInterval(() => { trySellToCustomer(); tryStaffRestock(); }, 4000);
  } else {
    showNotif('🔒 Shop closed.');
    clearInterval(shopSalesTimer);
    shopSalesTimer = null;
  }
  updateStoreSign();
  refreshStoreManagerUI();
}
// Each ingredient's own sell price. Not set yet = falls back to the old "3x fair value" heuristic,
// so a freshly-stocked item has a sensible starting price instead of 0 until you touch its slider.
function getItemPrice(id){
  if(storePrices[id] !== undefined) return storePrices[id];
  const ing = STORE_INGREDIENTS.find(i => i.id === id);
  return ing ? Math.round(ing.price * 3) : 10;
}
function setItemPrice(id, val){
  storePrices[id] = Math.max(1, Math.min(1000, parseInt(val) || 1));
  saveCurrentUser();
}
// The more you've already advertised, the more the NEXT level costs.
function adCost(level){ return 50 + level*50; }
function advertiseStore(){
  if(!ownedStore) return;
  const cost = adCost(storeAdLevel);
  if(sipDollars < cost){ sfx.nope(); showNotif(`❌ Need ${cost} S.I.P. to advertise!`); return; }
  spendSip(cost);
  storeAdLevel += 1;
  updateSIP();
  saveCurrentUser();
  sfx.buy();
  showNotif(`📢 Advertised! Ad Level ${storeAdLevel} — customers will visit more often.`);
  refreshStoreManagerUI();
}
function staffHireCost(){ return 100 + ownedStaff.length*150; }
// specificName: hire a particular Suburbs friend (from the neighbor modal) instead of a
// random generic name — same hire, same cost, same job. Omit it for the Store Manager's
// plain "Hire Staff" button, which keeps picking from STAFF_NAMES like before.
function hireStaff(specificName){
  if(!ownedStore) return;
  if(ownedStaff.length >= MAX_STAFF){ showNotif('You already have a full staff!'); return; }
  if(specificName && ownedStaff.some(s => s.name === specificName)){ showNotif(`${specificName} already works here!`); return; }
  const cost = staffHireCost();
  if(sipDollars < cost){ sfx.nope(); showNotif(`❌ Need ${cost} S.I.P. to hire staff!`); return; }
  spendSip(cost);
  const name = specificName || STAFF_NAMES[ownedStaff.length % STAFF_NAMES.length];
  ownedStaff.push({name});
  updateSIP();
  saveCurrentUser();
  sfx.buy();
  showNotif(`👥 Hired ${name}! They'll run the register AND carry restock boxes to shelves — even while you're out in the city.`);
  refreshStoreManagerUI();
  buildStoreInterior();
}
function hireFriendAsStaff(name){
  hireStaff(name);
  closeNeighborModal();
}
// Staff carry delivered boxes (storeBoxes, waiting on the floor) to their shelf themselves —
// same shelving rules tryPlaceBox() uses (new ingredient claims the next empty slot, capped at
// 5*SHELF_ROW_CAP shelves). Runs alongside trySellToCustomer() on the same 4s shop tick; each
// staff member clears up to one box per tick, so more staff restock faster.
function tryStaffRestock(){
  if(!ownedStore || ownedStaff.length === 0 || storeBoxes.length === 0) return;
  const maxSlots = 5 * SHELF_ROW_CAP;
  let handled = 0;
  for(let i = 0; i < storeBoxes.length && handled < ownedStaff.length; ){
    const b = storeBoxes[i];
    const isNew = !storeStockOrder.includes(b.ingredientId);
    if(isNew && storeStockOrder.length >= maxSlots){ i++; continue; } // shelves full — leave it for later
    scene.remove(b.group);
    storeBoxes.splice(i, 1);
    if(isNew) storeStockOrder.push(b.ingredientId);
    storeStock[b.ingredientId] = (storeStock[b.ingredientId] || 0) + BOX_QTY;
    const ing = STORE_INGREDIENTS.find(x => x.id === b.ingredientId);
    showNotif(`👥 Staff shelved ${BOX_QTY}× ${ing.emoji} ${ing.name} (${storeStock[b.ingredientId]} in stock)`);
    handled++;
  }
  if(handled > 0){
    saveCurrentUser();
    if(inStore) buildStoreInterior();
    refreshStoreManagerUI();
  }
}
function trySellToCustomer(){
  if(!shopOpen) return;
  if(!inStore && ownedStaff.length === 0) return; // nobody's there to run the register while you're away
  const stockedIds = Object.keys(storeStock).filter(id => storeStock[id] > 0);
  if(stockedIds.length === 0) return;
  // Advertising controls how often a customer shows up at all, each check (every 4s)
  const adChance = Math.min(0.9, 0.3 + storeAdLevel*0.08);
  if(Math.random() > adChance) return; // no customer walked in this time
  const soldId = stockedIds[Math.floor(Math.random()*stockedIds.length)];
  const ing = STORE_INGREDIENTS.find(i => i.id === soldId);
  const price = getItemPrice(soldId);
  const fairValue = ing.price * 3; // this ITEM's own fair value, not a store-wide average
  const staffBonus = Math.min(0.25, ownedStaff.length * 0.05); // helpful staff nudge up the sale
  // Priced at fair value or under = customers almost always buy; every 50 S.I.P. over fair shaves off buy-chance
  const buyChance = Math.max(0.05, Math.min(0.95, 1 - (price-fairValue)/50 + staffBonus));
  if(Math.random() < buyChance){
    storeStock[soldId] -= 1;
    queueEarning(price, 0, 'Your Store');
    const levelBefore = storeLevel();
    storeSalesCount += 1;
    saveCurrentUser();
    sfx.notify();
    showNotif(`💰 A customer bought ${ing.emoji} ${ing.name} for ${price} S.I.P.!`);
    if(storeLevel() > levelBefore){
      sfx.cheer();
      showNotif(`⭐ Store leveled up to Level ${storeLevel()}! More ingredient types unlocked.`);
    }
    refreshStoreManagerUI();
    // Only bother rebuilding the room's meshes / spawning a visible customer if you're actually there to see it
    if(inStore){ buildStoreInterior(); spawnShopperCustomer(); }
  }
}
// A customer NPC that walks in from the door, up to the register, then runs out happy —
// spawned once per successful sale. Reuses the normal patrol system: it's just a 2-point
// patrol (register, then door) with the loop below despawning it once it gets back outside.
function spawnShopperCustomer(){
  const doorPt = [STORE_INTERIOR.x, STORE_INTERIOR.z + 5];
  const registerPt = [STORE_INTERIOR.x, STORE_INTERIOR.z - 3];
  const skins = [0xf5c89a,0xd4956a,0xe8c080,0xc07840,0x8B5E3C];
  const shirts = [0xff6644,0x44aaff,0xffcc44,0x66cc88,0xcc66ff];
  const hairs = ['short','long','spiky','curly','ponytail'];
  const cdef = {
    name:'Shopper', role:'Customer',
    skin: skins[Math.floor(Math.random()*skins.length)],
    shirt: shirts[Math.floor(Math.random()*shirts.length)],
    pants: 0x333333,
    pos:[doorPt[0], 0, doorPt[1]],
    patrol:[registerPt, doorPt],
    hair: hairs[Math.floor(Math.random()*hairs.length)], hairColor:0x2a1505,
  };
  const npc = makeNPC(cdef);
  npc.isShopper = true;
  npcs.push(npc);
}
function giveShopperTip(){
  if(Math.random() < 0.3){
    const tip = 1 + Math.floor(Math.random()*100); // 1-100 S.I.P.
    queueEarning(tip, 0, 'Store Tip');
    sfx.cheer();
    showNotif(`🎉 A happy customer left you a ${tip} S.I.P. tip! (pending in Earnings)`);
  }
}
// Builds/updates the OPEN or CLOSED sign on the front of the building
let storeSignMesh = null;
function updateStoreSign(){
  if(!storeGroup || !ownedStore) return;
  if(storeSignMesh){ scene.remove(storeSignMesh); storeSignMesh=null; }
  const def = STORE_CATALOG.find(s => s.id === ownedStore.id);
  const sz = STORE_SIZES[def.size];
  const {x,z} = ownedStore.location || STORE_PLOT; // older saves from before free placement fall back to the old fixed spot
  const cv = document.createElement('canvas'); cv.width=200; cv.height=80;
  const c = cv.getContext('2d');
  c.fillStyle = shopOpen ? '#2ecc40' : '#ff4136';
  c.fillRect(0,0,200,80);
  c.fillStyle='#fff'; c.font='bold 32px Arial'; c.textAlign='center'; c.textBaseline='middle';
  c.save(); c.scale(-1,1); c.translate(-200,0); // matches buildSign()'s mirrored-text convention
  c.fillText(shopOpen ? 'OPEN' : 'CLOSED', 100, 42);
  c.restore();
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3,1.2), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv), side:THREE.DoubleSide}));
  mesh.position.set(x, 2.2, z + sz.d/2 + 0.25);
  scene.add(mesh);
  storeSignMesh = mesh;
}

function openFurnitureCounter() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('furnitureCounterModal').style.display = 'flex';
  refreshFurnitureCounterUI();
}
function closeFurnitureCounter() { document.getElementById('furnitureCounterModal').style.display = 'none'; }
function refreshFurnitureCounterUI() {
  const list = document.getElementById('furnitureCounterList');
  list.innerHTML = '';
  FURNITURE_CATALOG.forEach((def, i) => {
    const owned = ownedFurniture.includes(def.id);
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name}</div>
      <div class="siCost">💰 ${def.price} S.I.P.</div>
      <button class="shopBtn" ${owned?'disabled':''} onclick="buyFurniture(${i})">${owned?'✅ Placed':'Buy'}</button>`;
    list.appendChild(d);
  });
}
function buyFurniture(idx) {
  const def = FURNITURE_CATALOG[idx];
  if(ownedFurniture.includes(def.id)) { showNotif('You already have this!'); return; }
  if(sipDollars < def.price) { sfx.nope(); showNotif(`❌ Need ${def.price} S.I.P.!`); return; }
  spendSip(def.price);
  updateSIP();
  ownedFurniture.push(def.id);
  saveCurrentUser();
  sfx.buy();
  showNotif(`${def.emoji} ${def.name} placed in your store!`);
  buildStoreInterior();
  refreshFurnitureCounterUI();
}

function openStoreManager() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('storeManagerModal').style.display = 'flex';
  refreshStoreManagerUI();
}
function closeStoreManager() {
  document.getElementById('storeManagerModal').style.display = 'none';
}
function refreshStoreManagerUI() {
  const owned = document.getElementById('storeOwnedBox');
  if(ownedStore) {
    const def = STORE_CATALOG.find(s => s.id === ownedStore.id);
    owned.innerHTML = `
      <div style="margin-bottom:8px;">You own: <b>${ownedStore.customName || def.name}</b> (${def.name})</div>
      <div style="margin-bottom:8px;">⭐ Level <b>${storeLevel()}</b> (${storeSalesCount} sales made) — 🔓 ${unlockedIngredientCount()}/${STORE_INGREDIENTS.length} item types unlocked
        ${storeLevel()<400 ? `<span style="color:#888;font-size:10px;"> (${salesUntilNextLevel()} sales to next level)</span>` : `<span style="color:#FFD700;font-size:10px;"> (MAX LEVEL!)</span>`}</div>
      <div style="margin-bottom:8px;">📦 Stock: <b>${Object.values(storeStock).reduce((a,b)=>a+b,0)}</b> items —
        <a href="javascript:void(0)" onclick="closeStoreManager();openIngredientsCounter();" style="color:#e0a860;">buy more</a></div>
      <div style="margin-bottom:8px;text-align:left;">
        <div style="margin-bottom:4px;">💲 <b>Set your own price per item</b> <span style="color:#888;font-size:10px;">(too high = fewer sales)</span></div>
        ${storeStockOrder.length === 0 ? `<div style="color:#888;font-size:11px;">Stock a shelf first to set its price.</div>` :
          storeStockOrder.map(id => {
            const ing = STORE_INGREDIENTS.find(i => i.id === id);
            if(!ing) return '';
            return `<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:3px;font-size:11px;">
              <span>${ing.emoji} ${ing.name}</span>
              <input type="number" min="1" max="1000" value="${getItemPrice(id)}" style="width:56px;"
                onchange="setItemPrice('${id}', this.value)">
            </div>`;
          }).join('')}
      </div>
      <div style="margin-bottom:8px;padding-top:6px;border-top:1px solid #444;text-align:left;">
        📢 <b>Advertising:</b> Level ${storeAdLevel} <span style="color:#888;font-size:10px;">(more customers visit)</span>
        <button onclick="advertiseStore()" style="width:100%;padding:6px;margin-top:4px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#3a6ea5;">
          📢 Advertise (+1 level) — ${adCost(storeAdLevel)} S.I.P.
        </button>
      </div>
      <div style="margin-bottom:8px;padding-top:6px;border-top:1px solid #444;text-align:left;">
        👥 <b>Staff:</b> ${ownedStaff.length}/${MAX_STAFF} hired ${ownedStaff.length>0 ? `<span style="color:#7CFC00;font-size:10px;">(sells AND restocks shelves — even while you're away!)</span>` : ''}
        ${ownedStaff.length ? `<div style="color:#ccc;font-size:11px;">${ownedStaff.map(s=>'👤 '+s.name).join(', ')}</div>` : ''}
        ${ownedStaff.length < MAX_STAFF
          ? `<button onclick="hireStaff()" style="width:100%;padding:6px;margin-top:4px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#4a8a4a;">👥 Hire Staff — ${staffHireCost()} S.I.P.</button>`
          : `<div style="color:#888;font-size:10px;">Max staff hired!</div>`}
      </div>
      <button onclick="toggleShopOpen()" style="width:100%;padding:8px;margin-bottom:4px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:${shopOpen?'#4CAF50':'#e94560'};">
        ${shopOpen ? '🔓 Shop is OPEN — click to close' : '🔒 Shop is closed — click to open'}
      </button>
      <div style="color:#888;font-size:10px;text-align:center;">${ownedStaff.length>0 ? "Your staff keeps the shop open even if you leave." : "You have to stay in the store while it's open — leaving closes it, unless you hire staff."}</div>
    `;
  } else {
    owned.innerHTML = `You don't own a store yet — the plot east of The Diner is empty.`;
  }
  const list = document.getElementById('storeCatalogList');
  list.innerHTML = '';
  STORE_CATALOG.forEach((def, i) => {
    const isCurrent = ownedStore && ownedStore.id === def.id;
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.name} ${def.furnished ? '🛋️ furnished' : ''} ${def.floors===2 ? '🏢 2-story' : ''}</div>
      <div class="siCost">💰 ${def.price.toLocaleString()} S.I.P.</div>
      <button class="shopBtn" ${isCurrent?'disabled':''} onclick="buyStore(${i})">${isCurrent ? '✅ Owned' : (ownedStore ? 'Upgrade/Switch' : 'Buy')}</button>`;
    list.appendChild(d);
  });
}
function buyStore(idx) {
  const def = STORE_CATALOG[idx];
  if(ownedStore && ownedStore.id === def.id) { showNotif('You already own this store!'); return; }
  if(sipDollars < def.price) { sfx.nope(); showNotif(`❌ Need ${def.price.toLocaleString()} S.I.P.!`); return; }
  // Resolve the name BEFORE spending any S.I.P. — some browsers/embeds (e.g. a sandboxed
  // itch.io iframe) don't support prompt() at all and throw instead of returning null, so
  // this must not be able to fail AFTER the player has already been charged.
  let customName = def.name;
  try { customName = prompt('Name your store:', def.name) || def.name; } catch(e) { /* prompt unsupported here — just use the default name */ }
  closeStoreManager();
  placingStore = { def, customName };
  showNotif('🏗️ Walk to where you want your shop, then press P to place it (Esc to cancel)');
}

// ─── STORE PLACEMENT — pick any open ground in the city, not one fixed spot ─
let placingStore = null;   // {def, customName} while the player is choosing a spot
let placementMarker = null; // ground ring, green = valid spot, red = blocked
let remoteShops = {};       // ownerName -> {storeId, customName, x, z} synced from the server (used for overlap checks now; rendering other players' shops is a later step)

function isStoreSpotValid(x, z) {
  if(isBlocked(x, z, 12)) return false; // overlaps an existing building/road collider
  if(Math.hypot(x - LAND_CENTER.x, z - LAND_CENTER.z) < 220) return false; // too close to Sunset Plains
  for(const name in remoteShops) {
    if(name === currentUser) continue;
    const s = remoteShops[name];
    if(Math.hypot(x - s.x, z - s.z) < 24) return false; // overlaps another player's shop
  }
  return true;
}

function updatePlacementMarker() {
  if(!placingStore || !playerGroup) return;
  const x = playerGroup.position.x, z = playerGroup.position.z;
  const valid = isStoreSpotValid(x, z);
  if(!placementMarker) {
    const mat = new THREE.MeshBasicMaterial({ color:0x00ff00, side:THREE.DoubleSide, transparent:true, opacity:0.8 });
    placementMarker = new THREE.Mesh(new THREE.RingGeometry(3, 3.6, 24), mat);
    placementMarker.rotation.x = -Math.PI/2;
    scene.add(placementMarker);
  }
  placementMarker.position.set(x, 0.05, z);
  placementMarker.material.color.setHex(valid ? 0x00ff00 : 0xff2222);
}
function clearPlacementMarker() {
  if(placementMarker) { scene.remove(placementMarker); placementMarker = null; }
}
function cancelStorePlacement() {
  if(!placingStore) return;
  placingStore = null;
  clearPlacementMarker();
  showNotif('Placement cancelled.');
}
function confirmStorePlacement() {
  if(!placingStore || !playerGroup) return;
  const x = playerGroup.position.x, z = playerGroup.position.z;
  if(!isStoreSpotValid(x, z)) { sfx.nope(); showNotif('❌ Too close to something else — try a different spot!'); return; }
  const { def, customName } = placingStore;
  spendSip(def.price);
  updateSIP();
  ownedStore = { id: def.id, customName, location: { x, z } };
  placingStore = null;
  clearPlacementMarker();
  saveCurrentUser();
  syncOwnStoreLocation();
  sfx.buy();
  showNotif(`🏪 ${customName} is open for business right here!`);
  buildOwnedStore();
  refreshStoreManagerUI();
}

function syncOwnStoreLocation() {
  if(serverMode !== 'online' || !ownedStore || !ownedStore.location) return;
  fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/shops', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ owner: currentUser, storeId: ownedStore.id, customName: ownedStore.customName, x: ownedStore.location.x, z: ownedStore.location.z })
  }, 4000).catch(()=>{});
}
let _lastShopSync = -999;
const SHOP_SYNC_INTERVAL = 3;
async function syncShops() {
  if(serverMode !== 'online') return;
  try {
    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/shops', {}, 4000);
    if(r.ok) remoteShops = await r.json();
  } catch(e) { /* next sync will catch up */ }
}

// ─── COMPUTER SHOP & SIB BROWSER ─────────────────────────────────────────────
const COMPUTER_CATALOG = [
  { id:'sic',  name:'S.I.C.',  full:'Super Important Computer',       emoji:'💻', price:3000,  tier:1 },
  { id:'sicp', name:'S.I.C.+', full:'Super Important Computer Plus',  emoji:'🖥️', price:7000,  tier:2 },
  { id:'sdic', name:'S.D.I.C.',full:'Super Duper Important Computer', emoji:'🖧',  price:15000, tier:3 },
];
const SIB_SHOP_ITEMS = [
  { id:'gaming_chair',  name:'Gaming Chair',    emoji:'🪑', cost:150,  tier:1 },
  { id:'headphones',    name:'Pro Headphones',  emoji:'🎧', cost:80,   tier:1 },
  { id:'toy_drone',     name:'Toy Drone',       emoji:'🚁', cost:200,  tier:1 },
  { id:'taco_delivery', name:'Taco Delivery',   emoji:'🌮', cost:15,   tier:1 },
  { id:'racing_seat',   name:'Racing Seat',     emoji:'🏎', cost:300,  tier:2 },
  { id:'extra_monitor', name:'Extra Monitor',   emoji:'🖥️', cost:500,  tier:2 },
  { id:'mystery_box',   name:'Mystery Box',     emoji:'📦', cost:50,   tier:2 },
  { id:'hover_board',   name:'Hover Board',     emoji:'🛹', cost:1000, tier:3 },
  { id:'robot_pet',     name:'Robot Pet',       emoji:'🤖', cost:2000, tier:3 },
  { id:'vip_balloon',   name:'VIP Balloon',     emoji:'🎈', cost:25,   tier:3 },
];

function openComputerShop() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('computerShopModal').style.display = 'flex';
  refreshComputerShopUI();
}
function closeComputerShop() {
  document.getElementById('computerShopModal').style.display = 'none';
}
function refreshComputerShopUI() {
  const list = document.getElementById('computerShopList');
  list.innerHTML = '';
  COMPUTER_CATALOG.forEach((def, i) => {
    const owned = ownedComputers.includes(def.id);
    const cost  = def.price;
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name} <span style="color:#888;font-size:10px;">${def.full}</span></div>
      <div class="siCost">💰 ${cost.toLocaleString()} S.I.P.</div>
      <button class="shopBtn" ${owned?'disabled':''} onclick="buyComputer(${i})">${owned?'✅ Owned':'Buy'}</button>`;
    list.appendChild(d);
  });
}
function buyComputer(idx) {
  const def = COMPUTER_CATALOG[idx];
  if(ownedComputers.includes(def.id)) { showNotif('You already own this computer!'); return; }
  const cost = def.price;
  if(sipDollars < cost) { sfx.nope(); showNotif(`❌ Need ${cost} S.I.P.!`); return; }
  spendSip(cost);
  updateSIP();
  ownedComputers.push(def.id);
  saveCurrentUser();
  sfx.buy();
  showNotif(`${def.emoji} ${def.name} delivered to your house! Use it from the computer desk.`);
  refreshComputerShopUI();
}

// ─── EXPLOXTUBE — a real video feed inside SIB, reusing the SAME cartoon-character canvas
// helpers the Cinema (items 40/42) already draws with, not a separate art system ────────────
const TUBE_VIDEOS = [
  { id:'v1',  title:'Robot Dance Party',        channel:'TechTube',       emoji:'🤖', color:'#1a1a2e', views:128000, dur:14,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#1a1a2e','#0a0a15'); _cLines(ctx,w/2,h*0.55,h*0.35,16,'rgba(0,200,255,.18)'); _cRobot(ctx,w/2,h*0.62,h*0.55,t,true); } },
  { id:'v2',  title:'T-Rex ROARS Compilation',  channel:'DinoDaily',      emoji:'🦖', color:'#1b3a1b', views:342000, dur:12,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2d5a2d','#0f2a0f'); _cDino(ctx,w/2,h*0.6,h*0.6,t,true); } },
  { id:'v3',  title:'Rocket Launch LIVE',       channel:'SpaceExplorers', emoji:'🚀', color:'#0a0a20', views:891000, dur:16,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#0a0a25','#000010'); _cStars(ctx,w,h,t); _cPlanet(ctx,w*0.8,h*0.25,h*0.14,'#cc8844','#663311',t); _cRocket(ctx,w/2,h*0.6,h*0.6,t); } },
  { id:'v4',  title:'Ninja Training Vlog',      channel:'ShadowAcademy',  emoji:'🥷', color:'#221833', views:76000, dur:13,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2a1f3a','#0f0a18'); _cNinja(ctx,w/2,h*0.6,h*0.55,t,true); } },
  { id:'v5',  title:'Cats Being Cats',          channel:'PetCorner',      emoji:'🐱', color:'#3a2a1a', views:2100000, dur:11,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#5a4a30','#2a1f15'); _cCat(ctx,w/2,h*0.6,h*0.6,t); } },
  { id:'v6',  title:'Evil Pizza Prank?!',       channel:'FoodFails',      emoji:'🍕', color:'#4a2010', views:210000, dur:12,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#6a3018','#2a1005'); _cPizza(ctx,w/2,h*0.55,h*0.6,t,true); } },
  { id:'v7',  title:'Detective Mystery Shorts', channel:'MysteryMinute',  emoji:'🕵️', color:'#20242a', views:54000, dur:15,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2a2e36','#0a0c10'); _cDetective(ctx,w/2,h*0.6,h*0.55,t); } },
  { id:'v8',  title:'Alien First Contact',      channel:'UFOWatch',       emoji:'👽', color:'#0a1a0a', views:667000, dur:14,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#0a1a10','#000800'); _cStars(ctx,w,h,t); _cAlien(ctx,w/2,h*0.6,h*0.55,t,true); } },
  { id:'v9',  title:'Dragon Breathing Fire',    channel:'FantasyClips',   emoji:'🐉', color:'#3a1005', views:445000, dur:13,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#3a1508','#150500'); _cDragon(ctx,w/2,h*0.55,h*0.6,t,true); } },
  { id:'v10', title:'City Nightlife Timelapse', channel:'UrbanViews',     emoji:'🌃', color:'#0a0a1a', views:98000, dur:18,
    draw:(ctx,w,h,t)=>{ _cCity(ctx,w,h,true); _cBird(ctx,w*0.2,h*0.15,h*0.03,t); _cBird(ctx,w*0.3,h*0.22,h*0.025,t+0.5); } },
  { id:'v11', title:'Rainy Day Study Beats',    channel:'ChillHub',       emoji:'☔', color:'#2a3038', views:389000, dur:20,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#3a4048','#181c20'); _cRain(ctx,w,h,t); } },
  { id:'v12', title:'S.I.P. Money Rain!',       channel:'SIPMaster',      emoji:'💰', color:'#3a2f0a', views:1500000, dur:12,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#4a3a10','#1a1503'); _cMoney(ctx,w,h,t); } },
  { id:'v13', title:"Grandma's Kung Fu Secrets", channel:'ElderPower',    emoji:'👵', color:'#2a1a3a', views:230000, dur:13,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#3a1f4a','#150a20'); _cGrandma(ctx,w/2,h*0.6,h*0.55,t,true); } },
  { id:'v14', title:'Beach Day Sunburn Fail',   channel:'TravelWithMe',   emoji:'🏖️', color:'#2a5a7a', views:410000, dur:14,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#4a8aca','#dfefff'); _cSun(ctx,w*0.75,h*0.22,h*0.13,t); _cBird(ctx,w*0.3,h*0.15,h*0.025,t); _cBird(ctx,w*0.45,h*0.2,h*0.02,t+0.4); } },
  { id:'v15', title:'Explosion Fails Compilation', channel:'FoodFails',   emoji:'💥', color:'#3a1508', views:670000, dur:12,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2a1005','#0a0300'); _cExplo(ctx,w/2,h*0.5,h*0.4,(t%2)/2); } },
  { id:'v16', title:'Ultimate Party Confetti Cannon', channel:'CelebrationCentral', emoji:'🎉', color:'#3a1a3a', views:158000, dur:11,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#3a1a4a','#150818'); _cConfetti(ctx,w,h,t); } },
  { id:'v17', title:'Robot vs Dino Showdown',   channel:'ScrapyardFan',   emoji:'⚔️', color:'#1a2a1a', views:940000, dur:16,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#1a3a1a','#081508'); _cRobot(ctx,w*0.32,h*0.62,h*0.42,t,true); _cDino(ctx,w*0.7,h*0.6,h*0.5,t,true); } },
  { id:'v18', title:'Dragon vs Ninja Duel',     channel:'FantasyClips',   emoji:'🐲', color:'#2a1005', views:512000, dur:15,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#3a1508','#150500'); _cDragon(ctx,w*0.68,h*0.5,h*0.5,t,true); _cNinja(ctx,w*0.3,h*0.65,h*0.4,t,true); } },
  { id:'v19', title:'Alien Abducts a Pizza?!',  channel:'UFOWatch',       emoji:'🛸', color:'#0a1a0a', views:388000, dur:13,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#0a1a10','#000800'); _cStars(ctx,w,h,t); _cAlien(ctx,w*0.35,h*0.5,h*0.4,t,true); _cPizza(ctx,w*0.65,h*0.65,h*0.35,t); } },
  { id:'v20', title:'Space Planet Tour',        channel:'SpaceExplorers', emoji:'🪐', color:'#0a0a20', views:275000, dur:17,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#0a0a25','#000010'); _cStars(ctx,w,h,t); _cPlanet(ctx,w*0.28,h*0.35,h*0.11,'#cc8844','#663311',t); _cPlanet(ctx,w*0.68,h*0.6,h*0.16,'#4488cc','#113355',t+1); } },
];
// Cubby Explosion 6001 — a real named channel (the actual publisher name Explox itself ships
// under, see item 49/[[feedback_explox_hosting]]) with its own real videos, leading the feed.
const CUBBY_VIDEOS = [
  { id:'cubby1', title:'Building EXPLOX Live!', channel:'Cubby Explosion 6001', emoji:'🛠️', color:'#2a1a3a', views:512000, dur:14,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2a1a4a','#0f0818'); _cLines(ctx,w/2,h*0.55,h*0.4,10,'rgba(255,200,0,.15)'); _cRobot(ctx,w/2,h*0.6,h*0.5,t,true); } },
  { id:'cubby2', title:'New Update Trailer!',   channel:'Cubby Explosion 6001', emoji:'🎬', color:'#1a2a3a', views:820000, dur:12,
    draw:(ctx,w,h,t)=>{ _cCity(ctx,w,h,true); _cExplo(ctx,w*0.5,h*0.4,h*0.3,(t%3)/3); } },
  { id:'cubby3', title:'Behind the Scenes',     channel:'Cubby Explosion 6001', emoji:'🎥', color:'#3a2a1a', views:310000, dur:13,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#4a3a20','#1a1206'); _cDetective(ctx,w/2,h*0.6,h*0.55,t); } },
];
TUBE_VIDEOS.unshift(...CUBBY_VIDEOS);

// Reusable scene generators keyed by string — the static TUBE_VIDEOS/CUBBY_VIDEOS above use inline
// draw() closures (fine, they're never persisted), but an UPLOADED or ambient-posted video has to
// survive a save/reload, and a function can't be JSON-serialized — so those pick one of these keys
// instead, resolved back to a real draw() at render/play time via SCENE_LIBRARY[scene].
const SCENE_META = {
  robot:  { emoji:'🤖', color:'#1a1a2e' }, dino:  { emoji:'🦖', color:'#1b3a1b' },
  space:  { emoji:'🚀', color:'#0a0a20' }, ninja: { emoji:'🥷', color:'#221833' },
  cat:    { emoji:'🐱', color:'#3a2a1a' }, city:  { emoji:'🌃', color:'#0a0a1a' },
  money:  { emoji:'💰', color:'#3a2f0a' }, party: { emoji:'🎉', color:'#2a1a3a' },
};
const SCENE_LIBRARY = {
  robot: (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#1a1a2e','#0a0a15'); _cRobot(ctx,w/2,h*0.62,h*0.55,t,true); },
  dino:  (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2d5a2d','#0f2a0f'); _cDino(ctx,w/2,h*0.6,h*0.6,t,true); },
  space: (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#0a0a25','#000010'); _cStars(ctx,w,h,t); _cRocket(ctx,w/2,h*0.6,h*0.6,t); },
  ninja: (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2a1f3a','#0f0a18'); _cNinja(ctx,w/2,h*0.6,h*0.55,t,true); },
  cat:   (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#5a4a30','#2a1f15'); _cCat(ctx,w/2,h*0.6,h*0.6,t); },
  city:  (ctx,w,h,t)=>{ _cCity(ctx,w,h,true); _cBird(ctx,w*0.2,h*0.15,h*0.03,t); },
  money: (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#4a3a10','#1a1503'); _cMoney(ctx,w,h,t); },
  party: (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#3a1a3a','#150818'); _cConfetti(ctx,w,h,t); },
};
function videoDraw(v) { return v.draw || SCENE_LIBRARY[v.scene] || SCENE_LIBRARY.robot; }

// ── The shared "world" feed — other channels' videos, visible to every account on this device,
// same shared-registry idea as item 149's land ownership. Posts real new videos over real played
// time (see tickTubeWorld below); genuinely NOT tied to your OS clock/calendar dates (a literal
// wall-clock "monthly" cadence would mean nothing ever posts during a normal play session) — an
// honest in-fiction "day counter" advances instead, and every video's age is shown relative to it.
const CHANNEL_POOL = ['PixelPals','DailyDrift','SIPSquad','TownTalk','NightOwlGaming','QuickClips4U','TheRealScoop','CraftCornerTV'];
const TOPIC_POOL = [
  { title:'You Won\'t Believe This Robot Fight',  scene:'robot' }, { title:'Dino Encounter Gone Wrong',      scene:'dino'  },
  { title:'Mission to the Stars',                 scene:'space' }, { title:'Ninja Skills Challenge',         scene:'ninja' },
  { title:'My Cat Did WHAT?!',                    scene:'cat'   }, { title:'City Lights at Midnight',        scene:'city'  },
  { title:'How I Made My First 1000 S.I.P.',      scene:'money' }, { title:'Surprise Party Vlog',            scene:'party' },
];
function getTubeWorld() {
  try { const d = JSON.parse(localStorage.getItem('explox_tube_world')); return Array.isArray(d) ? d : []; }
  catch(e) { return []; }
}
function saveTubeWorld(list) { localStorage.setItem('explox_tube_world', JSON.stringify(list)); }
function getTubeWorldClock() {
  try { const d = JSON.parse(localStorage.getItem('explox_tube_world_clock')); return (d && typeof d.day==='number') ? d : {day:0}; }
  catch(e) { return {day:0}; }
}
function saveTubeWorldClock(c) { localStorage.setItem('explox_tube_world_clock', JSON.stringify(c)); }
let tubeWorldTimer = 0;
function tickTubeWorld(dt) {
  tubeWorldTimer += dt;
  if (tubeWorldTimer < 90) return; // check roughly every 90s of real active play
  tubeWorldTimer = 0;
  const clock = getTubeWorldClock();
  clock.day += 1 + Math.floor(Math.random()*30); // "day to day, sometimes month to month"
  if (Math.random() < 0.6) {
    const channel = CHANNEL_POOL[Math.floor(Math.random()*CHANNEL_POOL.length)];
    const topic = TOPIC_POOL[Math.floor(Math.random()*TOPIC_POOL.length)];
    const world = getTubeWorld();
    world.push({ id:'w'+Date.now()+'_'+Math.floor(Math.random()*99999), title:topic.title, channel, scene:topic.scene,
      dur:12, views:Math.floor(Math.random()*8000), likes:0, comments:[], postedDay:clock.day });
    saveTubeWorld(world);
    showNotif(`📺 ${channel} just posted "${topic.title}"!`);
  }
  saveTubeWorldClock(clock);
}
function tubeAgoLabel(postedDay) {
  if (postedDay === undefined) return '';
  const d = getTubeWorldClock().day - postedDay;
  if (d <= 0) return 'today';
  if (d < 30) return d===1 ? '1 day ago' : `${d} days ago`;
  const m = Math.round(d/30);
  return m===1 ? '1 month ago' : `${m} months ago`;
}

// ── Your own channel — real uploads that persist forever, real subscribers/likes/views/comments
// that keep growing the more time you spend playing (see tickTubeGrowth below). ─────────────────
let myUploads = [];      // persisted — [{id,title,channel,scene,dur,views,likes,comments:[{author,text}]}]
let mySubscribers = 0;   // persisted
const TUBE_COMMENT_TEMPLATES = ['This is amazing! 🔥','First!','LOL 😂','Can you make a part 2?','My favorite channel!','Wait this is actually good','👏👏👏','Underrated!','This made my day 😊','No cap this is fire'];
let tubeGrowthTimer = 0;
function tickTubeGrowth(dt) {
  tubeGrowthTimer += dt;
  if (tubeGrowthTimer < 45) return; // real growth roughly every 45s of active play
  tubeGrowthTimer = 0;
  if (!myUploads.length) return;
  let grew = false;
  myUploads.forEach(v => {
    if (Math.random() < 0.7) { v.views += 5+Math.floor(Math.random()*50); grew = true; }
    if (Math.random() < 0.3) { v.likes += 1+Math.floor(Math.random()*5); grew = true; }
    if (Math.random() < 0.25) {
      v.comments.push({ author: CHANNEL_POOL[Math.floor(Math.random()*CHANNEL_POOL.length)], text: TUBE_COMMENT_TEMPLATES[Math.floor(Math.random()*TUBE_COMMENT_TEMPLATES.length)] });
      grew = true;
    }
  });
  if (grew) { mySubscribers = Math.min(999999, mySubscribers + Math.floor(Math.random()*3)); saveCurrentUser(); }
}
function uploadTubeVideo(title, sceneKey) {
  title = (title||'').trim();
  if (!title) { showNotif('❌ Enter a title first!'); return; }
  if (!SCENE_LIBRARY[sceneKey]) return;
  myUploads.push({ id:'u'+Date.now(), title:title.slice(0,60), channel:playerName||'You', scene:sceneKey, dur:12, views:0, likes:0, comments:[] });
  saveCurrentUser();
  sfx.buy();
  showNotif(`⬆️ "${title}" uploaded to your channel! It'll be there forever.`);
  sibNavigate('tube');
}

let tubeLikes = {};  // { videoId: true }  — persisted
let tubeViews = {};  // { videoId: extraViewCount } — persisted, real count on top of the video's base views
// User's own ask: "make it so you can comment" — the Comments section only ever showed the
// auto-generated TUBE_COMMENT_TEMPLATES ones (see fakeCommentOn... below); there was no input,
// no way for the player to actually post one. Same "extra count layered on top of a shared base
// constant" shape as tubeViews above for a 'base' video (never mutate TUBE_VIDEOS itself — it's one
// shared array/object graph reused by every account) — 'mine'/'world' videos push straight into
// their own real, already-persisted .comments array instead, same as their view-counting already does.
let tubeBaseComments = {}; // { videoId: [{author,text}] } — persisted, player's own comments on a 'base' video
let tubePlaying = null; // current video id, or null
let _tubeAnimId = null;
function fmtViews(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1).replace('.0','')+'M';
  if (n >= 1000) return (n/1000).toFixed(1).replace('.0','')+'K';
  return String(n);
}
// Every video the feed can show — the static base list + the shared ambient world feed + your own
// permanent uploads — each tagged with `_src` so the UI can label "Your Channel" distinctly.
function allTubeVideos() {
  return [
    ...TUBE_VIDEOS.map(v => ({...v, _src:'base'})),
    ...getTubeWorld().map(v => ({...v, _src:'world'})),
    ...myUploads.map(v => ({...v, _src:'mine'})),
  ];
}
function findTubeVideo(id) { return allTubeVideos().find(v => v.id === id); }
function renderTubeFeed() {
  const vids = allTubeVideos();
  return `<div style="background:#181818;padding:16px;min-height:360px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <div style="font-size:18px;font-weight:bold;color:#ff3333;">📺 ExploxTube</div>
      <button onclick="sibNavigate('tubeupload')" style="background:#ff3333;border:none;border-radius:16px;color:#fff;padding:6px 12px;font-size:11px;cursor:pointer;font-weight:bold;">⬆️ Upload</button>
    </div>
    <div style="color:#888;font-size:11px;margin-bottom:12px;">🔔 ${mySubscribers.toLocaleString()} subscribers on your channel (${playerName||'You'})</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      ${vids.map(v => {
        const views = (v.views||0) + (v._src==='base' ? (tubeViews[v.id]||0) : 0);
        const mine = v._src==='mine';
        const color = v.color || SCENE_META[v.scene]?.color || '#222';
        const emoji = v.emoji || SCENE_META[v.scene]?.emoji || '🎬';
        return `<div onclick="openTubePlayer('${v.id}')" style="background:#222;border-radius:8px;overflow:hidden;cursor:pointer;${mine?'border:1px solid #ff3333;':''}">
          <div style="background:${color};height:70px;display:flex;align-items:center;justify-content:center;font-size:32px;position:relative;">
            ${emoji}
            <span style="position:absolute;bottom:3px;right:5px;background:rgba(0,0,0,0.75);color:#fff;font-size:9px;padding:1px 4px;border-radius:3px;">${Math.floor((v.dur||12)/60)}:${String((v.dur||12)%60).padStart(2,'0')}</span>
            ${mine?'<span style="position:absolute;top:3px;left:5px;background:#ff3333;color:#fff;font-size:8px;padding:1px 4px;border-radius:3px;">YOUR CHANNEL</span>':''}
          </div>
          <div style="padding:7px 8px;">
            <div style="color:#fff;font-size:11px;font-weight:bold;line-height:1.3;">${v.title}</div>
            <div style="color:#aaa;font-size:10px;margin-top:2px;">${v.channel} · ${fmtViews(views)} views${v._src==='world'?' · '+tubeAgoLabel(v.postedDay):''}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}
function renderTubeUpload() {
  return `<div style="background:#181818;padding:20px;min-height:360px;">
    <div style="font-size:16px;font-weight:bold;color:#ff3333;margin-bottom:14px;">⬆️ Upload a Video</div>
    <input id="tubeUploadTitle" placeholder="Video title..." maxlength="60" style="width:100%;padding:8px;border-radius:6px;border:1px solid #444;background:#222;color:#fff;box-sizing:border-box;margin-bottom:12px;">
    <div style="color:#aaa;font-size:11px;margin-bottom:6px;">Pick a style:</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
      ${Object.entries(SCENE_META).map(([key,m]) => `<div onclick="uploadTubeVideo(document.getElementById('tubeUploadTitle').value,'${key}')" style="background:${m.color};border-radius:8px;padding:14px 4px;text-align:center;cursor:pointer;font-size:22px;">${m.emoji}</div>`).join('')}
    </div>
    <button onclick="sibNavigate('tube')" style="margin-top:14px;width:100%;padding:8px;background:none;border:1px solid #555;border-radius:6px;color:#aaa;cursor:pointer;">← Back</button>
  </div>`;
}

// ─── THE APP STORE — 400 real, distinct, non-repeating app names (item 157) — reachable once you
// own a real Phone or Tablet (item 155's Airport Lounge electronics). Same honest-count precedent
// as [[project_suin_chatbot]]'s "918 words not 1000" and item 127's "275 facts not 1000": generated
// combinatorially like item 59's 49 auto-generated music tracks, verified for a real exact count of
// 400 with zero duplicate names inside any one category, not hand-padded filler. ─────────────────
const APP_CATEGORIES = [
  { name:'Games',              emoji:'🎮', count:60, adj:['Super','Mega','Epic','Pixel','Turbo','Retro','Galaxy','Shadow'], noun:['Quest','Dash','Blast','Legends','Arena','Kingdom','Heroes','Clash'] },
  { name:'Social',             emoji:'💬', count:40, adj:['Chat','Connect','Circle','Buzz','Vibe','Squad','Link','Pulse'], noun:['Talk','Feed','Space','Wave','Zone','Hub','Stream','Loop'] },
  { name:'Productivity',       emoji:'📋', count:35, adj:['Quick','Smart','Focus','Task','Pro','Swift','Clear','Prime'], noun:['Notes','Planner','Board','Flow','List','Tracker','Suite','Desk'] },
  { name:'Music & Audio',      emoji:'🎵', count:35, adj:['Beat','Sonic','Rhythm','Sound','Wave','Loud','Chill','Bass'], noun:['Player','Mix','Studio','Radio','Tunes','Vibes','Track','Amp'] },
  { name:'Photo & Video',      emoji:'📷', count:35, adj:['Snap','Flash','Frame','Lens','Pixel','Bright','Clip','Vivid'], noun:['Cam','Edit','Studio','Gallery','Reel','Shot','Filter','Vision'] },
  { name:'Finance',            emoji:'💳', count:30, adj:['Smart','Coin','Wealth','Budget','Secure','Prime','Vault','Swift'], noun:['Wallet','Bank','Pay','Ledger','Fund','Save','Cash','Track'] },
  { name:'Food & Drink',       emoji:'🍔', count:30, adj:['Tasty','Fresh','Quick','Yum','Home','Local','Daily','Sweet'], noun:['Bites','Recipes','Eats','Kitchen','Menu','Table','Chef','Dish'] },
  { name:'Fitness & Health',   emoji:'💪', count:30, adj:['Fit','Active','Peak','Vital','Strong','Zen','Move','Pulse'], noun:['Track','Coach','Gym','Steps','Health','Flow','Burn','Balance'] },
  { name:'Education',          emoji:'📚', count:30, adj:['Learn','Bright','Smart','Study','Quick','Wise','Prime','Clever'], noun:['School','Class','Academy','Tutor','Lesson','Mind','Books','Skills'] },
  { name:'Shopping',           emoji:'🛍️', count:25, adj:['Quick','Smart','Deal','Prime','Fresh','Easy','Local','Bright'], noun:['Shop','Cart','Market','Store','Deals','Finds','Mall','Basket'] },
  { name:'News & Weather',     emoji:'📰', count:25, adj:['Daily','Live','Local','Quick','Global','Bright','Clear','Instant'], noun:['News','Weather','Times','Report','Watch','Update','Scoop','Forecast'] },
  { name:'Utilities & Tools',  emoji:'🛠️', count:25, adj:['Quick','Smart','Handy','Pro','Easy','Clean','Simple','Swift'], noun:['Tools','Fix','Scan','Convert','Backup','Manager','Boost','Guard'] },
];
function genAppNames(adj, noun, count) {
  const names = []; let ai=0, ni=0;
  while (names.length < count) {
    names.push(adj[ai]+' '+noun[ni]);
    ni++;
    if (ni >= noun.length) { ni = 0; ai = (ai+1) % adj.length; }
  }
  return names;
}
const ALL_APPS = APP_CATEGORIES.flatMap(cat => genAppNames(cat.adj, cat.noun, cat.count).map(name => ({ name, category:cat.name, emoji:cat.emoji })));
let installedApps = []; // persisted — names of apps you've "downloaded"
let appStoreCategory = 'Games';
function ownsAMobileDevice() { return !!(playerInventory['lounge_phone'] || playerInventory['lounge_tablet']); }
function installApp(name) {
  if (!installedApps.includes(name)) { installedApps.push(name); saveCurrentUser(); sfx.buy(); showNotif(`${name} installed!`); }
  else { installedApps = installedApps.filter(n => n!==name); saveCurrentUser(); showNotif(`${name} uninstalled.`); }
  sibNavigate('appstore');
}
function renderAppStore() {
  if (!ownsAMobileDevice()) {
    return `<div style="background:#181818;padding:30px;min-height:360px;text-align:center;">
      <div style="font-size:40px;">📵</div>
      <div style="color:#fff;font-size:14px;margin-top:10px;">You need a real Phone or Tablet to use the App Store.</div>
      <div style="color:#888;font-size:11px;margin-top:6px;">Buy one at any Airport Lounge's Electronics kiosk!</div>
    </div>`;
  }
  const cat = APP_CATEGORIES.find(c => c.name === appStoreCategory) || APP_CATEGORIES[0];
  const apps = ALL_APPS.filter(a => a.category === cat.name);
  return `<div style="background:#181818;padding:14px;min-height:360px;">
    <div style="font-size:16px;font-weight:bold;color:#00cc88;margin-bottom:4px;">📱 App Store</div>
    <div style="color:#888;font-size:10px;margin-bottom:10px;">${ALL_APPS.length} real apps · ${installedApps.length} installed</div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;">
      ${APP_CATEGORIES.map(c => `<button onclick="appStoreCategory='${c.name}';sibNavigate('appstore')" style="background:${c.name===cat.name?'#00cc88':'#333'};border:none;border-radius:12px;color:#fff;padding:4px 9px;font-size:10px;cursor:pointer;">${c.emoji} ${c.name}</button>`).join('')}
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;max-height:280px;overflow-y:auto;">
      ${apps.map(a => {
        const has = installedApps.includes(a.name);
        return `<div style="background:#222;border-radius:8px;padding:8px 10px;display:flex;align-items:center;gap:10px;">
          <span style="font-size:20px;">${a.emoji}</span>
          <span style="flex:1;color:#fff;font-size:12px;">${a.name}</span>
          <button onclick="installApp('${a.name.replace(/'/g,"\\'")}')" style="background:${has?'#333':'#00cc88'};border:none;border-radius:12px;color:#fff;padding:4px 10px;font-size:10px;cursor:pointer;">${has?'✓ Installed':'Get'}</button>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function openTubePlayer(id) {
  const v = findTubeVideo(id);
  if (!v) return;
  tubePlaying = id;
  document.getElementById('tubePlayerOverlay').style.display = 'flex';
  document.getElementById('tubeTitle').textContent = v.title;
  document.getElementById('tubeChannel').textContent = v.channel;
  updateTubeLikeUI();
  renderTubeComments(id);
  const canvas = document.getElementById('tubeCanvas');
  canvas.width = canvas.offsetWidth || 480;
  canvas.height = canvas.offsetHeight || 270;
  const ctx = canvas.getContext('2d');
  const draw = videoDraw(v);
  const dur = v.dur || 12;
  const start = performance.now();
  let counted = false;
  function frame() {
    if (tubePlaying !== id) return;
    const t = (performance.now()-start)/1000;
    draw(ctx, canvas.width, canvas.height, t % dur);
    document.getElementById('tubeProgressBar').style.width = ((t % dur)/dur*100)+'%';
    const liveV = findTubeVideo(id) || v;
    const views = (liveV.views||0) + (v._src==='base' ? (tubeViews[id]||0) : 0);
    document.getElementById('tubeViews').textContent = fmtViews(views) + ' views';
    if (!counted && t > 1.5) {
      counted = true;
      if (v._src === 'base') { tubeViews[id] = (tubeViews[id]||0)+1; saveCurrentUser(); }
      else if (v._src === 'mine') { const mv = myUploads.find(x=>x.id===id); if(mv){ mv.views=(mv.views||0)+1; saveCurrentUser(); } }
      else if (v._src === 'world') { const world = getTubeWorld(); const wv = world.find(x=>x.id===id); if(wv){ wv.views=(wv.views||0)+1; saveTubeWorld(world); } }
    }
    _tubeAnimId = requestAnimationFrame(frame);
  }
  frame();
}
function closeTubePlayer() {
  tubePlaying = null;
  if (_tubeAnimId) cancelAnimationFrame(_tubeAnimId);
  document.getElementById('tubePlayerOverlay').style.display = 'none';
}
function toggleTubeLike() {
  if (!tubePlaying) return;
  tubeLikes[tubePlaying] = !tubeLikes[tubePlaying];
  saveCurrentUser();
  updateTubeLikeUI();
  sfx.click();
}
function updateTubeLikeUI() {
  const btn = document.getElementById('tubeLikeBtn');
  const liked = !!tubeLikes[tubePlaying];
  btn.textContent = liked ? '❤️ Liked' : '🤍 Like';
  btn.style.background = liked ? '#ff3333' : '#333';
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function renderTubeComments(id) {
  const v = findTubeVideo(id);
  const commentList = document.getElementById('tubeComments');
  if (!v || !commentList) return;
  const extra = v._src === 'base' ? (tubeBaseComments[id] || []) : [];
  const comments = (v.comments || []).concat(extra);
  commentList.innerHTML = comments.length
    ? comments.map(c => `<div style="padding:4px 0;border-bottom:1px solid #222;"><b style="color:#ff3333;">${escapeHtml(c.author)}</b> <span style="color:#ccc;">${escapeHtml(c.text)}</span></div>`).join('')
    : '<div style="color:#666;">No comments yet.</div>';
}
// User's own ask: "make it so you can comment" — a real post, not just the auto-generated
// TUBE_COMMENT_TEMPLATES lines. Never mutates TUBE_VIDEOS directly (see tubeBaseComments' own
// comment above) — 'mine'/'world' videos already have a real, persisted .comments array to push
// into directly, same as their view-counting in openTubePlayer's frame() already does per-source.
function postTubeComment() {
  if (!tubePlaying) return;
  const input = document.getElementById('tubeCommentInput');
  const text = (input.value || '').trim();
  if (!text) return;
  const v = findTubeVideo(tubePlaying);
  if (!v) return;
  const comment = { author: playerName || 'You', text: text.slice(0, 200) };
  if (v._src === 'mine') {
    const mv = myUploads.find(x => x.id === tubePlaying);
    if (mv) { mv.comments = mv.comments || []; mv.comments.push(comment); }
    saveCurrentUser();
  } else if (v._src === 'world') {
    const world = getTubeWorld();
    const wv = world.find(x => x.id === tubePlaying);
    if (wv) { wv.comments = wv.comments || []; wv.comments.push(comment); }
    saveTubeWorld(world);
  } else {
    tubeBaseComments[tubePlaying] = tubeBaseComments[tubePlaying] || [];
    tubeBaseComments[tubePlaying].push(comment);
    saveCurrentUser();
  }
  input.value = '';
  sfx.click();
  renderTubeComments(tubePlaying);
}

let sibPage = 'home';
function openSIB() {
  if(ownedComputers.length === 0) { showNotif('💻 You need a computer! Buy one at the Computer Shop.'); return; }
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('sibModal').style.display = 'flex';
  sibNavigate('home');
}
function closeSIB() {
  document.getElementById('sibModal').style.display = 'none';
}
function sibNavigate(page) {
  sibPage = page;
  const urlBar = document.getElementById('sibUrl');
  if(urlBar) urlBar.value = 'sib://' + page;
  renderSibPage();
}
function sibGo() {
  const val = (document.getElementById('sibUrl').value||'').replace('sib://','').trim();
  sibNavigate(val || 'home');
}
function renderSibPage() {
  const area = document.getElementById('sibContent');
  if(!area) return;
  if(sibPage === 'home') {
    area.innerHTML = `
      <div style="background:#f5f5f5;padding:20px;min-height:360px;">
        <div style="text-align:center;padding:24px 0 16px;">
          <div style="font-size:36px;">🌐</div>
          <div style="font-size:22px;font-weight:bold;color:#00aacc;">SIB</div>
          <div style="color:#888;font-size:12px;">Super Important Browser</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:380px;margin:0 auto;">
          <div onclick="sibNavigate('shop')" style="background:#fff;border-radius:10px;padding:16px;text-align:center;cursor:pointer;border:1px solid #ddd;">
            <div style="font-size:24px;">🛒</div><div style="font-weight:bold;color:#333;font-size:13px;">SIB Shop</div><div style="color:#888;font-size:10px;">Buy stuff online!</div>
          </div>
          <div onclick="sibNavigate('news')" style="background:#fff;border-radius:10px;padding:16px;text-align:center;cursor:pointer;border:1px solid #ddd;">
            <div style="font-size:24px;">📰</div><div style="font-weight:bold;color:#333;font-size:13px;">SIB News</div><div style="color:#888;font-size:10px;">What's happening?</div>
          </div>
          <div onclick="sibNavigate('mail')" style="background:#fff;border-radius:10px;padding:16px;text-align:center;cursor:pointer;border:1px solid #ddd;">
            <div style="font-size:24px;">📧</div><div style="font-weight:bold;color:#333;font-size:13px;">SIB Mail</div><div style="color:#888;font-size:10px;">Your inbox</div>
          </div>
          <div onclick="sibNavigate('games')" style="background:#fff;border-radius:10px;padding:16px;text-align:center;cursor:pointer;border:1px solid #ddd;">
            <div style="font-size:24px;">🎮</div><div style="font-weight:bold;color:#333;font-size:13px;">SIB Games</div><div style="color:#888;font-size:10px;">Play online!</div>
          </div>
          <div onclick="sibNavigate('tube')" style="background:#fff;border-radius:10px;padding:16px;text-align:center;cursor:pointer;border:1px solid #ddd;">
            <div style="font-size:24px;">📺</div><div style="font-weight:bold;color:#333;font-size:13px;">ExploxTube</div><div style="color:#888;font-size:10px;">Watch videos!</div>
          </div>
          <div onclick="sibNavigate('appstore')" style="background:#fff;border-radius:10px;padding:16px;text-align:center;cursor:pointer;border:1px solid #ddd;">
            <div style="font-size:24px;">📱</div><div style="font-weight:bold;color:#333;font-size:13px;">App Store</div><div style="color:#888;font-size:10px;">400 real apps!</div>
          </div>
        </div>
      </div>`;
  } else if(sibPage === 'shop') {
    const maxTier = ownedComputers.length ? Math.max(...ownedComputers.map(id => { const c = COMPUTER_CATALOG.find(c=>c.id===id); return c ? c.tier : 0; })) : 0;
    const items = SIB_SHOP_ITEMS.filter(it => it.tier <= maxTier);
    let html = `<div style="background:#f5f5f5;padding:20px;min-height:360px;">
      <div style="font-size:18px;font-weight:bold;color:#00aacc;margin-bottom:4px;">🛒 SIB Shop</div>
      <div style="color:#888;font-size:11px;margin-bottom:14px;">Items delivered to your inventory instantly!</div>
      <div style="display:flex;flex-direction:column;gap:8px;">`;
    items.forEach((it,i) => {
      const realIdx = SIB_SHOP_ITEMS.indexOf(it);
      html += `<div style="background:#fff;border-radius:8px;padding:10px;display:flex;justify-content:space-between;align-items:center;border:1px solid #eee;">
        <div><span style="font-size:18px;">${it.emoji}</span> <b style="font-size:12px;">${it.name}</b></div>
        <button onclick="buySibItem(${realIdx})" style="padding:5px 12px;background:#00aacc;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;">💰 ${it.cost}</button>
      </div>`;
    });
    if(items.length === 0) html += `<div style="color:#aaa;text-align:center;padding:20px;">Upgrade your computer to unlock more items!</div>`;
    html += `</div></div>`;
    area.innerHTML = html;
  } else if(sibPage === 'news') {
    area.innerHTML = `<div style="background:#f5f5f5;padding:20px;min-height:360px;">
      <div style="font-size:18px;font-weight:bold;color:#cc4422;margin-bottom:14px;">📰 SIB News — Explox City Daily</div>
      ${[
        ['🚗','Local Speedster Drives Diamond Limo Through Parking Lot — Citizens Amazed'],
        ['🏦','Bank Reports Record Interest Payments — "Everyone Is Getting Rich," Says Mayor'],
        ['🎬','Robot Dinosaurs From Space 4 In Production — Biggest Movie Ever?'],
        ['🍕','Chef Wins City Cooking Award For 100th Delivered Meal In A Row'],
        ['💻','New Computer Shop Opens On Tech Street — Sells Out Of S.D.I.C. On Day One'],
        ['👮','Police Baffled After Entire Criminal Alley Painted Pink Overnight'],
        ['🚇','S.I.T.S. Transit Announces New Diamond Line — Goes Everywhere At Once'],
      ].map(([e,t])=>`<div style="background:#fff;border-radius:8px;padding:10px;margin-bottom:8px;border-left:3px solid #cc4422;font-size:12px;color:#333;"><span style="font-size:16px;">${e}</span> ${t}</div>`).join('')}
    </div>`;
  } else if(sibPage === 'mail') {
    area.innerHTML = `<div style="background:#f5f5f5;padding:20px;min-height:360px;">
      <div style="font-size:18px;font-weight:bold;color:#4488cc;margin-bottom:14px;">📧 SIB Mail</div>
      ${[
        ['SIB Team','Welcome to SIB!','Thanks for using the Super Important Browser. Happy browsing!','2 min ago'],
        ['City Bank','Your Interest Is Ready','Your bank earned interest! Log in to collect it.','1 hr ago'],
        ['S.I.T.S.','New Routes Available','Three new bus routes are now running. Ride for free this weekend!','3 hrs ago'],
        ['Car Dealership','Speed Racer On Sale!','The Speed Racer is 20% off this week only. Hurry!','1 day ago'],
      ].map(([f,s,b,t])=>`<div style="background:#fff;border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid #eee;">
        <div style="display:flex;justify-content:space-between;"><b style="font-size:12px;color:#333;">${s}</b><span style="font-size:10px;color:#aaa;">${t}</span></div>
        <div style="font-size:11px;color:#666;">From: ${f} — ${b}</div>
      </div>`).join('')}
    </div>`;
  } else if(sibPage === 'games') {
    area.innerHTML = `<div style="background:#f5f5f5;padding:20px;min-height:360px;">
      <div style="font-size:18px;font-weight:bold;color:#8844cc;margin-bottom:14px;">🎮 SIB Games</div>
      <div style="color:#888;font-size:11px;margin-bottom:14px;">Exit SIB and use the MINI GAMES button on the right to play!</div>
      ${[['🏰','Capture the Throne','Strategy PvP battle'],['🏃','Obby Challenge','Obstacle course run'],['🏙️','Rooftop Parkour','Rooftop jumping']]
        .map(([e,n,d])=>`<div style="background:#fff;border-radius:8px;padding:12px;margin-bottom:8px;display:flex;gap:12px;align-items:center;border:1px solid #eee;"><span style="font-size:24px;">${e}</span><div><b style="font-size:13px;">${n}</b><br><span style="font-size:11px;color:#888;">${d}</span></div></div>`).join('')}
    </div>`;
  } else if(sibPage === 'tube') {
    area.innerHTML = renderTubeFeed();
  } else if(sibPage === 'tubeupload') {
    area.innerHTML = renderTubeUpload();
  } else if(sibPage === 'appstore') {
    area.innerHTML = renderAppStore();
  } else {
    area.innerHTML = `<div style="background:#f5f5f5;padding:40px;text-align:center;min-height:360px;"><div style="font-size:48px;">🔍</div><div style="color:#888;margin-top:10px;">Page not found: sib://${sibPage}</div></div>`;
  }
}
function buySibItem(idx) {
  const it = SIB_SHOP_ITEMS[idx];
  if(!it) return;
  const cost = it.cost;
  if(sipDollars < cost) { sfx.nope(); showNotif(`❌ Need ${cost} S.I.P.!`); return; }
  spendSip(cost);
  updateSIP();
  const info = { emoji: it.emoji, id: it.id };
  addToInventory(it.id, it.name, it.emoji);
  saveCurrentUser();
  sfx.buy();
  showNotif(`${it.emoji} ${it.name} delivered to your inventory!`);
}

