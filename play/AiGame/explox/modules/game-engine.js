// ─── 3D GAME ─────────────────────────────────────────────────────────────────
let scene, camera, renderer, player, playerGroup;
let sunLight, ambientLight; // set once in the init block below, then modulated every frame by updateDayNight()
let moveState = { w:false, a:false, s:false, d:false, run:false };
let jumpVel = 0, onGround = true;
let inOuterSpace = false; // NOT persisted, matches inHouse/inMall/etc. — true while launched up off the Space Station platform
let rollerVel = null; // THREE.Vector3, lazily created — carries momentum for the Roller Feet add-on
let playerBag = []; // food items waiting to be eaten with C
let yaw = 0, pitch = 0.3;
let isPointerLocked = false;
let npcs = [], clock;
let inHouse = false;
let inMall  = false;
let inHotel = false;
let inStore = false;
let inArcade = false;
let inBankInterior = false;
const BANK_INTERIOR_COLS = [];
const BANK_INTERIOR = { x:130000, z:0 }; // own 10,000-unit lane, next free one after AirportLounge(120000)
const BANK_INTERIOR_EXIT = { x:130000, z:7 };
const BANK_INTERIOR_ENTRANCE = { x:160, z:198 }; // exterior employee door, just outside the building's real north wall (z:200)
const ARCADE_COLS  = [];
const ARCADE_SPAWN = { x:70000, z:0 }; // own 10,000-unit lane, after Store(40000)/FriendHouse(50000)/Prison(60000)
const ARCADE_EXIT  = { x:40, z:90 };
let currentHotelRoom = null;
const HOTEL_COLS  = [];
const HOTEL_SPAWN = { x:30000, z:0 };
// Real bug fix: these x/z used to be each country's LANDMARK center (COUNTRY_THEMES' cx/cz) — a
// real solid collider (see buildCountryZones()'s addCol() at that exact point) — so landing after
// a flight put the player dead-center inside a wall, every country, every time. First attempt at a
// fix reused the airport's own "leave without boarding" door spot (apZ-8) — but that turned out to
// be a near-miss too, just 0.5 units clear of the neighboring filler skyline tower's own collider
// before the player's own collision radius eats that margin back up (verified live: isBlocked()
// returned true there). The actual fix, verified live for real against every country's real built
// colliders via isBlocked(): land 10 units past the airport, on its open (non-shop) side —
// x:apX=cx-30, z:apZ+10=cz+65 — genuinely open ground clear of the airport, its neighboring filler
// tower, and everything else buildTownExtras() builds.
// Coordinates below are 20x-scale (item ~234, user: "lets make the countrys 20 times bigger")
// versions of the same "cx-30, cz+65" open-ground-past-the-airport offset described above,
// now "cx-600, cz+1300" — computed by hand against the new COUNTRY_CENTERS ring (defined later
// in the file, so still hardcoded here to avoid the same TDZ crash the original comment warned
// about — this array runs hundreds of lines before that table exists).
const AIRPORT_FLIGHTS = [
  { name:'Japan',     emoji:'🌸', desc:'Neon lights, cherry blossoms & ramen',     price:80,  x:5530,  z:-3840 },
  { name:'France',    emoji:'🗼', desc:'Eiffel Tower, baguettes & haute couture',  price:90,  x:-8120, z:-1440 },
  { name:'Brazil',    emoji:'🌴', desc:'Carnival, rainforest & golden beaches',    price:75,  x:790,   z:9180  },
  { name:'Egypt',     emoji:'🏛️', desc:'Pyramids, pharaohs & golden sands',       price:100, x:5530,  z:6440  },
  { name:'UK',        emoji:'🎡', desc:'Big Ben, red buses & afternoon tea',       price:85,  x:-4600, z:-5630 },
  { name:'Australia', emoji:'🦘', desc:'Outback, opera house & surf beaches',     price:95,  x:7400,  z:1300  },
  { name:'Canada',    emoji:'🍁', desc:'Maple forests, mounties & hockey',        price:70,  x:-8120, z:4040  },
  { name:'Italy',     emoji:'🍕', desc:'Colosseum, pasta & Venice gondolas',      price:88,  x:790,   z:-6580 },
  { name:'Space Station', emoji:'🚀', desc:'Zero gravity, a real rocket & a sky full of stars', price:150, x:-4000, z:7530 }, // matches SPACE_ZONE.x, SPACE_ZONE.z+600 — declared later in the file, so hardcoded here to avoid a TDZ crash at parse time
];
const HOTEL_CITY_POS = { x:-15, z:-5 };
const MALL_COLS  = [];
const MALL_DOOR  = { x:80,  z:-4 };
const MALL_SPAWN = { x:20000, z:18 };
const MALL_EXIT  = { x:20000, z:22 };

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
let notifTimer;
function showNotif(msg) {
  const el = document.getElementById('notification');
  el.textContent = msg; el.style.opacity = '1';
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => el.style.opacity = '0', 2400);
}
function updateSIP() { document.getElementById('sipAmount').textContent = sipDollars; if(sipDollars > peakSip) peakSip = sipDollars; saveCurrentUser(); }
// Elite Coins — a real premium currency, deliberately NOT earnable by just walking around: only
// the toughest robots drop any, and only 1-3 at a time, so an Elite Shop item priced at 15-30
// actually takes real fights to afford, unlike S.I.P. which piles up from almost anything.
const ELITE_COIN_REWARD = { elite:3, tank:2, guard:1, spider:1, scout:0, drone:0 };
function updateElite() {
  const el = document.getElementById('eliteAmount');
  if (el) el.textContent = eliteCoins;
  if (eliteCoins > peakElite) peakElite = eliteCoins;
  saveCurrentUser();
}
function updateWood() {
  document.getElementById('woodAmount').textContent = woodCount;
  const cw = document.getElementById('craftWood'); if(cw) cw.textContent = woodCount;
  saveCurrentUser();
}
function updateScrapMetal() {
  document.getElementById('scrapAmount').textContent = scrapMetal;
  const cs = document.getElementById('craftScrap'); if(cs) cs.textContent = scrapMetal;
  saveCurrentUser();
}

// ─── ICE CREAM (edible: eating animation + 60% chance of brain freeze) ─────────
let _iceCreamBusy = false;
function eatIceCream(){
  if(_iceCreamBusy || _eatBusy) return;
  _iceCreamBusy = true;
  const cv = document.createElement('canvas');
  cv.width = 200; cv.height = 300;
  cv.style.cssText = 'position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:9998;pointer-events:none;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5));';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  const dur = 1500, start = performance.now();
  function frame(now){
    const p = Math.min(1,(now-start)/dur);
    ctx.clearRect(0,0,cv.width,cv.height);
    _drawIceCream(ctx,cv.width,cv.height,p,now);
    if(p<1) requestAnimationFrame(frame);
    else { cv.remove(); _finishIceCream(); }
  }
  requestAnimationFrame(frame);
}
function _drawIceCream(ctx,W,H,eaten,now){
  const cx=W/2, bob=Math.sin(now*0.012)*4;
  const coneTopY=H*0.52+bob, coneBotY=H*0.96+bob, coneHW=W*0.17;
  // waffle cone
  ctx.fillStyle='#e0b25a';
  ctx.beginPath();ctx.moveTo(cx-coneHW,coneTopY);ctx.lineTo(cx+coneHW,coneTopY);ctx.lineTo(cx,coneBotY);ctx.closePath();ctx.fill();
  ctx.save();ctx.beginPath();ctx.moveTo(cx-coneHW,coneTopY);ctx.lineTo(cx+coneHW,coneTopY);ctx.lineTo(cx,coneBotY);ctx.closePath();ctx.clip();
  ctx.strokeStyle='rgba(150,100,35,0.6)';ctx.lineWidth=2;
  for(let i=-6;i<=6;i++){ctx.beginPath();ctx.moveTo(cx-coneHW+i*16,coneTopY);ctx.lineTo(cx-coneHW+i*16+70,coneBotY);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+coneHW-i*16,coneTopY);ctx.lineTo(cx+coneHW-i*16-70,coneBotY);ctx.stroke();}
  ctx.restore();
  // scoops (eaten from the top down)
  const flavors=['#fff0a6','#9fe6d2','#ff9ec7'];
  const r=W*0.16, amountEaten=3*eaten;
  for(let s=0;s<3;s++){
    const order=2-s, eatenHere=Math.min(1,Math.max(0,amountEaten-order)), filled=1-eatenHere;
    if(filled<=0.03) continue;
    const scoopY=coneTopY - r*0.45 - s*r*0.85 + bob*0.5, rr=r*filled;
    ctx.fillStyle=flavors[s];ctx.beginPath();ctx.arc(cx,scoopY,rr,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.45)';ctx.beginPath();ctx.arc(cx-rr*0.32,scoopY-rr*0.32,rr*0.26,0,Math.PI*2);ctx.fill();
  }
  // cherry on top, before the first bite
  if(eaten<0.05){ const topY=coneTopY-r*0.45-2*r*0.85+bob*0.5; ctx.fillStyle='#e23b3b';ctx.beginPath();ctx.arc(cx,topY-r*0.95,r*0.18,0,Math.PI*2);ctx.fill(); }
}
function _finishIceCream(){
  // 60% of the time, eating it gives you brain freeze
  if(Math.random() < 0.6) _brainFreeze();
  else { _iceCreamBusy=false; tasteReaction('sweet','Ice Cream'); }
}
function _brainFreeze(){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9999;pointer-events:none;background:radial-gradient(circle at 50% 45%, rgba(180,230,255,0) 25%, rgba(120,195,255,0.55) 100%);transition:opacity .4s;';
  let flakes=''; for(let i=0;i<7;i++){ flakes+='<div style="position:absolute;font-size:'+(22+i*4)+'px;left:'+((i*17+5)%90)+'%;top:'+((i*23+8)%80)+'%;opacity:.85;">❄️</div>'; }
  ov.innerHTML=flakes+'<div style="position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);color:#0a3a66;font:bold 38px Arial;text-shadow:0 0 12px #fff,0 0 4px #fff;white-space:nowrap;">🥶 BRAIN FREEZE!</div>';
  document.body.appendChild(ov);
  showNotif('🥶 BRAIN FREEZE! Eat slower next time!');
  const dur=2200, start=performance.now();
  function f(now){ const p=(now-start)/dur, dx=Math.sin(now*0.045)*8*(1-p); ov.style.transform='translateX('+dx+'px)'; if(p<1) requestAnimationFrame(f); else { ov.style.opacity='0'; setTimeout(()=>ov.remove(),420); _iceCreamBusy=false; } }
  requestAnimationFrame(f);
}

// ─── EDIBLE FOOD (any food can be eaten; taste decides the reaction) ───────────
// C key eats the first item in playerBag (buy food first to fill it)
function addToBag(food){
  playerBag.push(food);
  updateBagHud();
  showNotif(food.emoji+' '+food.name+' added to bag! (C to eat)');
}
function eatFromBag(){
  if(_eatBusy||_iceCreamBusy) return;
  if(playerBag.length===0){ showNotif('🎒 Bag is empty — buy food first!'); return; }
  const food=playerBag.shift();
  updateBagHud();
  eatFood(food.emoji,food.name,food.taste);
}
function updateBagHud(){
  const el=document.getElementById('bagItems');
  if(!el) return;
  el.textContent=playerBag.length===0?'empty':playerBag.map(f=>f.emoji).join(' ');
}
// sweet & savory = GOOD, sour = OK, spicy = OK, bitter = BAD
const TASTE_REACTION = {
  sweet:  {face:'😋', word:'Sweet — yum!',    rating:'GOOD', col:'255,150,210'},
  savory: {face:'😋', word:'Savory — tasty!', rating:'GOOD', col:'255,200,90'},
  sour:   {face:'😝', word:'Sour — ok!',      rating:'OK',   col:'205,230,90'},
  spicy:  {face:'😤', word:'Spicy — whoa!',   rating:'OK',   col:'255,100,30'},
  bitter: {face:'🤢', word:'Bitter — yuck!',  rating:'BAD',  col:'120,200,60'},
};
let _eatBusy = false;
// Real, discrete bites — the food visibly loses a chunk each time instead of just uniformly
// shrinking in place. Each bite punches a permanent hole out of the emoji (alternating sides,
// working inward) via 'destination-out' compositing, redrawn fresh every frame so the hole
// stays correctly attached and scaled as the remaining food keeps shrinking toward the mouth.
const EAT_BITES = 4;
function eatFood(emoji,name,taste,restoreAmt){
  if(_eatBusy || _iceCreamBusy) return;
  _eatBusy = true;
  restoreHunger(restoreAmt || 35);
  const cv=document.createElement('canvas'); cv.width=240; cv.height=240;
  cv.style.cssText='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:9998;pointer-events:none;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5));';
  document.body.appendChild(cv);
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  const dur=1400, start=performance.now();
  let bitesTaken=0;
  function frame(now){
    const p=Math.min(1,(now-start)/dur), remaining=1-p, within=(p*EAT_BITES)%1, squash=1+Math.sin(within*Math.PI)*0.14;
    const biteIndex=Math.min(EAT_BITES-1, Math.floor(p*EAT_BITES));
    if(biteIndex>bitesTaken) bitesTaken=biteIndex; // a new bite lands the instant its time window starts
    ctx.clearRect(0,0,W,H);
    const base=H*0.55*(0.45+0.55*remaining);
    ctx.save();ctx.translate(W/2,H*0.55);ctx.scale(squash,2-squash);
    ctx.globalAlpha=Math.max(0,Math.min(1,remaining*1.3));
    ctx.font=base+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(emoji,0,0);
    ctx.globalCompositeOperation='destination-out';
    ctx.globalAlpha=1; // punch each bite hole at full strength, independent of how faded the
                        // remaining food currently is — otherwise a late, faded bite would only
                        // partially erase and barely show up as a real missing chunk
    for(let b=0;b<bitesTaken;b++){
      const angle=b*(Math.PI/2); // a different edge each time (right, top, left, bottom) so bites never just re-carve the same already-eaten spot
      const dist=0.30*base, r=0.28*base;
      ctx.beginPath(); ctx.arc(Math.cos(angle)*dist, Math.sin(angle)*dist, r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation='source-over';
    ctx.restore();
    for(let i=0;i<6;i++){ const a=now*0.01+i, cr=p*W*0.42; ctx.fillStyle='rgba(210,170,90,'+remaining+')'; ctx.beginPath(); ctx.arc(W/2+Math.cos(a)*cr,H*0.55+Math.sin(a)*cr,3,0,Math.PI*2); ctx.fill(); }
    if(p<1) requestAnimationFrame(frame);
    else { cv.remove(); _eatBusy=false; tasteReaction(taste,name); }
  }
  requestAnimationFrame(frame);
}
function tasteReaction(taste,name){
  const R=TASTE_REACTION[taste]||TASTE_REACTION.savory;
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9999;pointer-events:none;background:radial-gradient(circle at 50% 42%, rgba('+R.col+',0) 30%, rgba('+R.col+',0.42) 100%);transition:opacity .4s;';
  ov.innerHTML='<div style="position:absolute;top:38%;left:50%;transform:translate(-50%,-50%);text-align:center;white-space:nowrap;"><div style="font-size:72px;">'+R.face+'</div><div style="color:#fff;font:bold 30px Arial;text-shadow:0 0 8px #000;margin-top:4px;">'+R.word+'</div><div style="color:#fff;font:bold 15px Arial;opacity:.85;text-shadow:0 0 6px #000;margin-top:2px;">'+R.rating+'</div></div>';
  document.body.appendChild(ov);
  showNotif(R.face+' '+name+': '+R.word);
  const bad=(R.rating==='BAD'), dur=1600, start=performance.now();
  if (bad) setTimeout(() => vomit('bad food'), dur); // a real consequence for eating something gross, not just a face and a word
  function f(now){ const p=(now-start)/dur, dx=bad?Math.sin(now*0.05)*7*(1-p):0; ov.style.transform='translateX('+dx+'px)'; if(p<1) requestAnimationFrame(f); else { ov.style.opacity='0'; setTimeout(()=>ov.remove(),420); } }
  requestAnimationFrame(f);
}
// ─── VOMIT — user's own ask, right after Sickness. Two real triggers: eating something 'bitter'
// (BAD taste rating, above) or being sick (rolled in tickSickness()). Real cost either way — you
// lose the food you just "ate" back out as Hunger, and can't act for a moment — not just a gag.
function vomit(reason) {
  if (_eatBusy) return; // don't stack on top of an eating/vomiting animation already in progress
  _eatBusy = true;
  const lostHunger = 15 + Math.round(Math.random() * 10);
  hunger = Math.max(0, hunger - lostHunger);
  updateHungerHud();
  showNotif(`🤮 You threw up${reason ? ' from ' + reason : ''}! Lost ${lostHunger} Hunger.`);
  sfx.nope();
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;background:radial-gradient(circle at 50% 60%, rgba(120,200,60,0) 25%, rgba(120,200,60,0.45) 100%);transition:opacity .5s;';
  ov.innerHTML = '<div style="position:absolute;top:56%;left:50%;transform:translate(-50%,-50%);font-size:64px;">🤮</div>';
  document.body.appendChild(ov);
  setTimeout(() => { ov.style.opacity = '0'; setTimeout(() => ov.remove(), 500); }, 900);
  setTimeout(() => { _eatBusy = false; }, 1300); // real, felt "can't immediately act" beat
}

// ─── HOME ACTIVITIES — real functions any house interior's furniture zones call into
// (the player's own House AND every player-built land house share these, not separate copies) ──
function sleepAtHome() {
  restoreTiredness();
  if (hunger <= 0) { sleepWhileStarving(); return; }
  playerHealth = playerMaxHealth;
  updateHealthBar();
  const wasSick = sick;
  if (sick) { sick = false; updateSickHud(); }
  const msgs = wasSick ? ["😴 You slept it off — feeling much better now!"] : [
    '😴 You slept for 8 hours. Feel completely rested!',
    '💤 Dreamed about S.I.P. coins falling from the sky!',
    '🌙 Best sleep ever. The pillow was ultra fluffy!',
    '😪 You woke up feeling like a million S.I.P.!',
  ];
  showNotif(msgs[Math.floor(Date.now()/1000) % msgs.length]);
  sfx.earn();
}
function sitOnSofa() {
  playerSeated = true;
  showNotif('🛋️ You sit down. Press E to get up.');
}
const HOME_MEALS = [
  { emoji:'🍳', name:'Scrambled Eggs', taste:'savory' },
  { emoji:'🥪', name:'Sandwich',       taste:'savory' },
  { emoji:'🍝', name:'Spaghetti',      taste:'savory' },
  { emoji:'🥞', name:'Pancakes',       taste:'sweet'  },
  { emoji:'🍲', name:'Soup',           taste:'savory' },
];
function cookMeal() {
  const meal = HOME_MEALS[Math.floor(Math.random()*HOME_MEALS.length)];
  eatFood(meal.emoji, meal.name, meal.taste); // real eat animation + taste reaction, same system the Diner uses
}
const BOOK_FACTS = [
  '📚 Did you know? Octopuses have three hearts!',
  '📚 Fun fact: Honey never spoils — 3,000-year-old honey found in Egypt was still edible!',
  '📚 Did you know? A day on Venus is longer than a year on Venus!',
  "📚 Fun fact: Bananas are berries, but strawberries aren't!",
  '📚 Did you know? Sharks existed before trees!',
  '📚 Fun fact: The Eiffel Tower can grow over 6 inches taller in summer heat!',
  '📚 Did you know? Sound travels about 4x faster in water than in air!',
  '📚 Fun fact: A group of flamingos is called a "flamboyance"!',
  '📚 Did you know? Octopuses have blue blood!',
  '📚 Fun fact: A single cloud can weigh over a million pounds!',
];
let _lastBookIdx = -1;
function readBook() {
  let i = Math.floor(Math.random()*BOOK_FACTS.length);
  if (i === _lastBookIdx) i = (i+1) % BOOK_FACTS.length;
  _lastBookIdx = i;
  showNotif(BOOK_FACTS[i]);
  sfx.click();
}

// ─── COLLISION SYSTEM ─────────────────────────────────────────────────────────
const CITY_COLS = [];       // city building colliders
const HOUSE_COLS = [];      // house interior colliders

function addCol(arr, cx, cz, hw, hd) {
  // See scalePt()/scaleLen()'s own comment (HELPERS section, near box()) for why this is real
  // math and not a free ride on some parent transform.
  if (_buildOrigin) { [cx,cz] = scalePt(cx,cz); hw = scaleLen(hw); hd = scaleLen(hd); }
  const c = { cx, cz, hw, hd }; arr.push(c); return c;
}

function isBlocked(nx, nz, rOverride) {
  const r = rOverride !== undefined ? rOverride : 0.65; // real optional radius — cars (item 159 fix) pass a bigger one
  const cols = inMovieFight ? MOVIE_FIGHT_COLS : inArenaBattle ? ROBOT_ARENA_COLS : inPrison ? [] : inFriendHouse ? [] : inLandHouse ? LAND_HOUSE_COLS : inCountryHotel ? COUNTRY_HOTEL_COLS : inAirportLounge ? AIRPORT_LOUNGE_COLS : inArcade ? ARCADE_COLS : inHotel ? HOTEL_COLS : inHouse ? HOUSE_COLS : inMall ? MALL_COLS : inStore ? STORE_COLS : inBankInterior ? BANK_INTERIOR_COLS : CITY_COLS;
  for(const c of cols) {
    if(nx+r > c.cx-c.hw && nx-r < c.cx+c.hw &&
       nz+r > c.cz-c.hd && nz-r < c.cz+c.hd) return true;
  }
  return false;
}

// ─── JOB SYSTEM ──────────────────────────────────────────────────────────────
// Shopkeeper/Officer used to just pay out on a blind timer regardless of what the player
// was doing — you could walk away and still get paid. Now they work like the existing
// Cook & Serve job already does: you have to actually be there and respond to real tasks.
let activeJob = null, activeJobPay = 0, activeJobTaskText = '';
let jobTaskActive = false, jobTaskTimer = 0, jobNextTaskIn = 0;
const JOB_TASK_WINDOW = 4; // seconds you have to press E once a task appears

// ─── COOK & SERVE SYSTEM ─────────────────────────────────────────────────────
// cookState steps: idle → has_ingredients → preparing → prepared → cooking → ready → (serve) → idle
let cookState = 'idle';
let cookSubPresses = 0;
const PREP_PRESSES = 3;
const COOK_PRESSES = 3;
const DISH_NAMES = ['🍕 Pizza', '🍔 Burger', '🍜 Ramen', '🥗 Salad', '🍝 Pasta'];
let tableOrders = ['🍕 Pizza', '🍔 Burger', '🍜 Ramen'];
let orderBubbles = [];

