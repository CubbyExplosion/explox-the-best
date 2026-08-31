// ─── SUNSET PLAINS — real buyable land plots + building on them ──────────────
// Land ownership lives in a SHARED registry (explox_land_owners in localStorage), separate from any
// one account's own save — plots are physical spots in the shared city, so whichever local account
// claims one should show as owned no matter which account is logged in when someone else walks by.
// plotBuildings/landInvites/landColor/landForSale still live on the OWNER's own account blob (same
// shape as before) — a visitor just reads/patches the owner's blob directly via getUserData()/
// patchUserData() rather than through their own currentUser save.
const LAND_CENTER = { x:-400, z:150 };
// `footprint` is the REAL fence width/depth in units (a 100x100 plot has footprint:100, half:50) —
// deliberately decoupled from `slotGrid` (the NxN build-slot grid), since a 100-unit mansion lot
// doesn't need 700+ buildable slots, just more real open yard space around a reasonable build grid.
const LAND_PLOTS = [
  { id:'lot1',  name:'Lot 1 (Small)',    price:500,   footprint:20,  slotGrid:2 },
  { id:'lot2',  name:'Lot 2 (Small)',    price:800,   footprint:20,  slotGrid:2 },
  { id:'lot3',  name:'Lot 3 (Medium)',   price:1200,  footprint:35,  slotGrid:3 },
  { id:'lot4',  name:'Lot 4 (Medium)',   price:1800,  footprint:35,  slotGrid:3 },
  { id:'lot5',  name:'Lot 5 (Medium)',   price:2500,  footprint:35,  slotGrid:3 },
  { id:'lot6',  name:'Lot 6 (Large)',    price:3500,  footprint:50,  slotGrid:4 },
  { id:'lot7',  name:'Lot 7 (Large)',    price:5000,  footprint:50,  slotGrid:4 },
  { id:'lot8',  name:'Lot 8 (Estate)',   price:7000,  footprint:70,  slotGrid:5 },
  { id:'lot9',  name:'Lot 9 (Ranch)',    price:12000, footprint:85,  slotGrid:6 },
  { id:'lot10', name:'Lot 10 (Mega — 100x100)', price:20000, footprint:100, slotGrid:7 },
];
function buildSlotsFor(n) {
  const spacing = 3.5, half = (n-1)/2, slots = [];
  for (let r=0; r<n; r++) for (let c=0; c<n; c++) slots.push([(c-half)*spacing, (r-half)*spacing]);
  return slots;
}
LAND_PLOTS.forEach(p => p.slots = buildSlotsFor(p.slotGrid));
function plotHalf(plot) { return plot.footprint/2; } // real fence half-extent — 20→10 ... 100→50
let ownedLand   = []; // array of LAND_PLOTS ids this account has personally bought at some point, persisted
let landInvites = {}; // { lotId: { guestAccountName: {sit,smash,paint,buy} } }, persisted
let landColor   = {}; // { lotId: hexNumber } — owner's chosen paint, persisted
// Shared by findNearestPlacedHouse() and buildCustomHouse() below — every BUILD_CATALOG id that
// counts as "a real walk-in house", so a plot only ever has one and both places recognize it.
const HOUSE_IDS = ['house','brickhouse','house2','house3','house4','mansion','customhouse'];
let landForSale = {}; // { lotId: askingPriceOrUndefined } — persisted
let pendingNotices = []; // [{type,from,message}, ...] — real "while you were away" reports (invited/attacked), persisted, drained on next login
let LAND_PLOT_MESHES = []; // per-plot mesh refs, so buying/painting can tear down & rebuild just that plot
// 5 columns x 2 rows, spaced 130 apart both ways — comfortably clears even two adjacent 100-wide
// (half 50) plots regardless of which size lands in which slot, verified live via the same
// bounding-box check used for items 153/154.
function landPlotPos(idx) {
  const col = idx % 5, row = idx < 5 ? 0 : 1;
  return { cx: LAND_CENTER.x + (col-2)*130, cz: LAND_CENTER.z + (row===0?-65:65) };
}
function getLandOwners() {
  try { const d = JSON.parse(localStorage.getItem('explox_land_owners')); return (d && typeof d==='object') ? d : {}; }
  catch(e) { return {}; }
}
function setLandOwner(lotId, name) {
  const m = getLandOwners();
  if (name) m[lotId] = name; else delete m[lotId];
  localStorage.setItem('explox_land_owners', JSON.stringify(m));
  if(serverMode === 'online') {
    // Fire-and-forget, same pattern as saveCurrentUser() - the local write above
    // already made this instant for the buyer; this just tells everyone else.
    fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/land', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ lotId, owner: name || null })
    }, 4000).catch(()=>{});
  }
}

// Pulls the server's land registry into the SAME localStorage key getLandOwners()
// already reads, so every existing reader (buildLandPlot, enterLandPlot, etc.)
// sees fresh cross-player ownership with zero changes of their own.
let _lastLandSync = -999;
const LAND_SYNC_INTERVAL = 3; // seconds - land changes far less often than positions
async function syncLandOwners() {
  if(serverMode !== 'online') return;
  try {
    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/land', {}, 4000);
    if(!r.ok) return;
    const serverOwners = await r.json();
    localStorage.setItem('explox_land_owners', JSON.stringify(serverOwners));
    // Always rebuild rather than only-when-changed - cheap for 10 small plots, and
    // avoids a real bug where the very first sync can race ahead of buildSunsetPlains()
    // finishing, skip the rebuild since meshes don't exist yet, then never retry
    // because a "did it change" diff no longer sees a difference on later syncs.
    if(typeof LAND_PLOTS !== 'undefined' && LAND_PLOT_MESHES.length) {
      LAND_PLOTS.forEach((plot, idx) => buildLandPlot(idx));
    }
  } catch(e) { /* next sync will catch up */ }
}
function patchUserData(name, patchFn) {
  const data = getUserData(name);
  patchFn(data);
  localStorage.setItem('explox_user_' + name, JSON.stringify(data));
}
// Lazily claims this account's own already-owned plots (from the OLD per-account-only ownedLand
// array, item 137/138) into the new shared registry the first time this account logs in post-update.
function migrateLandOwnership() {
  const owners = getLandOwners();
  let changed = false;
  ownedLand.forEach(lotId => { if (!owners[lotId]) { owners[lotId] = currentUser; changed = true; } });
  if (changed) localStorage.setItem('explox_land_owners', JSON.stringify(owners));
}
function buildLandPlot(idx) {
  const plot = LAND_PLOTS[idx];
  const { cx, cz } = landPlotPos(idx);
  if(LAND_PLOT_MESHES[idx]) LAND_PLOT_MESHES[idx].forEach(m => scene.remove(m));
  const half = plotHalf(plot);
  const ownerName = getLandOwners()[plot.id] || null;
  const isMine = ownerName === currentUser;
  let fenceColor = 0x8a7050, emoji = '🏷️', label = `${plot.name} — ${plot.price.toLocaleString()} S.I.P.`;
  if (ownerName) {
    emoji = '🏡';
    const ownerData = isMine ? null : getUserData(ownerName);
    const customColor = isMine ? landColor[plot.id] : (ownerData.landColor && ownerData.landColor[plot.id]);
    fenceColor = (customColor !== undefined && customColor !== null) ? customColor : 0x3a9d3a;
    if (isMine) { label = `${plot.name} — Yours!`; }
    else {
      const forSale = ownerData.landForSale && ownerData.landForSale[plot.id];
      label = `${plot.name} — ${ownerName}'s Land${forSale ? ` (For Sale: ${forSale.toLocaleString()} S.I.P.)` : ''}`;
    }
  }
  const made = [];
  [[-half,-half],[half,-half],[half,half],[-half,half]].forEach(([dx,dz]) => made.push(box(0.3,1.2,0.3, fenceColor, cx+dx, 0.6, cz+dz)));
  made.push(box(half*2,0.15,0.15, fenceColor, cx, 0.9, cz-half));
  made.push(box(half*2,0.15,0.15, fenceColor, cx, 0.9, cz+half));
  made.push(box(0.15,0.15,half*2, fenceColor, cx-half, 0.9, cz));
  made.push(box(0.15,0.15,half*2, fenceColor, cx+half, 0.9, cz));
  made.push(buildLogoSign(label, emoji, ownerName?'#3a9d3a':'#8a7050', '#ffffff', cx, 2.4, cz+half+0.6));
  LAND_PLOT_MESHES[idx] = made;
  renderExistingBuildings(idx); // idempotent — restores anything already built here (world load or after a rebuild)
}
function buildSunsetPlains() {
  migrateLandOwnership();
  buildLogoSign('SUNSET PLAINS — LAND FOR SALE', '🗺️', '#8a7050', '#3a9d3a', LAND_CENTER.x, 5, LAND_CENTER.z-20);
  LAND_PLOTS.forEach((plot, idx) => {
    buildLandPlot(idx);
    const { cx, cz } = landPlotPos(idx);
    const half = plotHalf(plot);
    CITY_ZONES.push({ x:cx, z:cz, r:half*0.75, label:'🏗️ This Land Plot', action: () => enterLandPlot(idx) });
  });
}
function enterLandPlot(idx) {
  const plot = LAND_PLOTS[idx];
  const ownerName = getLandOwners()[plot.id] || null;
  if (!ownerName) { buyLand(idx); return; }
  const isMine = ownerName === currentUser;
  const ownerData = isMine ? null : getUserData(ownerName);
  const placed = isMine ? (plotBuildings[plot.id]||[]) : ((ownerData.plotBuildings && ownerData.plotBuildings[plot.id]) || []);
  const perm = isMine ? null : ((ownerData.landInvites && ownerData.landInvites[plot.id] && ownerData.landInvites[plot.id][currentUser]) || null);
  // Standing right at an actual placed house takes priority over the plot-wide build/visit menu —
  // same "walk up to the real structure" pattern as everything else. Owner always welcome in;
  // a guest needs SOME invite (any permission at all is enough to be let inside, not gated per-perm).
  const nearHouse = findNearestPlacedHouse(idx, placed);
  if (nearHouse && (isMine || perm)) { enterLandHouse(idx); return; }
  if (isMine) { openBuildMenu(idx); return; }
  openVisitLand(idx, ownerName);
}
function findNearestPlacedHouse(idx, placed) {
  const plot = LAND_PLOTS[idx];
  const { cx, cz } = landPlotPos(idx);
  const px = playerGroup.position.x, pz = playerGroup.position.z;
  for (const entry of placed) {
    if (!HOUSE_IDS.includes(entry.id)) continue;
    const [ox,oz] = plot.slots[entry.slot];
    if (Math.hypot(px-(cx+ox), pz-(cz+oz)) < 2.6) return entry;
  }
  return null;
}

// ─── A REAL WALK-IN INTERIOR for any 'house'/'brickhouse' built on a land plot — one shared
// pocket-space room (same "shared template" idea as the Hotel's 3 room types), reuses the exact
// same sleepAtHome/sitOnSofa/cookMeal/readBook functions the player's own House uses. ───────────
const LAND_HOUSE_SPAWN = { x:80000, z:0 };
const LAND_HOUSE_EXIT  = { x:80000, z:6 };
const LAND_HOUSE_COLS = [];
let inLandHouse = false;
let landHouseReturnIdx = null;
function buildLandHouseInterior() {
  const ix = LAND_HOUSE_SPAWN.x, iz = 0;
  box(14,0.3,10, 0xc8aa80, ix,0.15,iz);        // floor
  box(14,0.2,10, 0xf5f0e8, ix,4.5,iz);         // ceiling
  box(14,4.5,0.3, 0xf5efe0, ix,2.25,iz-5);     // back wall
  box(5,4.5,0.3,  0xf5efe0, ix-4.5,2.25,iz+5); // front wall left
  box(5,4.5,0.3,  0xf5efe0, ix+4.5,2.25,iz+5); // front wall right
  box(0.3,4.5,10, 0xf5efe0, ix-7,2.25,iz);     // left wall
  box(0.3,4.5,10, 0xf5efe0, ix+7,2.25,iz);     // right wall
  box(2,3,0.1, 0x8B5E3C, ix,1.5,iz+5.1);       // door
  buildSign('🏠 Land House', ix,5,iz-4.9);

  // Bed
  box(3,0.3,4, 0x7a5c3a, ix+4,0.4,iz-2.5);
  box(2.8,0.35,3.6, 0xf0f0f0, ix+4,0.68,iz-2.5);
  box(2.8,0.2,2.5, 0x4488cc, ix+4,0.9,iz-3.2);
  box(3,1,0.2, 0x7a5c3a, ix+4,1.0,iz-4.4);
  addCol(LAND_HOUSE_COLS, ix+4,iz-2.5, 1.6,2.2);

  // Sofa
  box(4,0.6,1.6, 0x994444, ix-3,0.55,iz+2);
  box(4,0.9,0.4, 0x994444, ix-3,1.1,iz+2.8);
  addCol(LAND_HOUSE_COLS, ix-3,iz+2, 2.1,0.9);

  // Kitchenette
  box(3.5,1.1,1.2, 0xe0d8c8, ix-4.5,0.75,iz-3.8);
  box(1,1.12,1.2,  0xaaaaaa, ix-5.6,0.75,iz-3.8);
  box(1.2,2.4,1,   0xdddddd, ix-2.8,1.2,iz-3.8);
  addCol(LAND_HOUSE_COLS, ix-4.2,iz-3.8, 2.2,0.8);

  // Bookshelf
  box(1.6,3,0.7, 0x8B5E3C, ix+5.8,1.5,iz-1);
  for (let s=0; s<3; s++) box(1.6,0.08,0.6, 0x7a5030, ix+5.8,0.5+s*0.9,iz-1);
  addCol(LAND_HOUSE_COLS, ix+5.8,iz-1, 0.9,0.5);

  // Toilet
  box(0.5,0.32,0.55, 0xffffff, ix+1,0.32,iz-3.8);
  box(0.55,0.5,0.16, 0xffffff, ix+1,0.78,iz-4.02);
  addCol(LAND_HOUSE_COLS, ix+1,iz-3.8, 0.45,0.45);

  // Windows
  box(2,1.5,0.15, 0x88ccff, ix-3,2.7,iz-4.9);
  box(2,1.5,0.15, 0x88ccff, ix+2,2.7,iz-4.9);

  addCol(LAND_HOUSE_COLS, ix,iz-5, 7,0.5);
  addCol(LAND_HOUSE_COLS, ix-4.5,iz+5, 2.5,0.5);
  addCol(LAND_HOUSE_COLS, ix+4.5,iz+5, 2.5,0.5);
  addCol(LAND_HOUSE_COLS, ix-7,iz, 0.5,5);
  addCol(LAND_HOUSE_COLS, ix+7,iz, 0.5,5);

  buildSign('🪑 FURNITURE', ix-1, 3.2, iz+4.85);
  renderHouseFurniture();
}
// ─── HOUSE FURNITURE — user's own ask: "sell and buy or build furniture". A parallel catalog to
// the Store's FURNITURE_CATALOG (that one decorates the Store, not this room), but each entry can
// be bought with S.I.P. OR built from real materials — canAffordRecipe()/spendMats() again, same
// shared shape every other cost in this game already uses. Fixed-slot placement, same simple
// model the Store's own furniture already uses (no drag-and-drop placement system exists for
// either one).
const HOUSE_FURNITURE_CATALOG = [
  { id:'diningtable',  name:'Dining Table',  emoji:'🍽️', price:80,  sellValue:80,  slot:{x:0,   z:1}   },
  { id:'tv',           name:'Television',    emoji:'📺', price:150, sellValue:150, slot:{x:-6,  z:0.5} },
  { id:'mirror',       name:'Wall Mirror',   emoji:'🪞', price:35,  sellValue:35,  slot:{x:6.7, z:3}    },
  { id:'wardrobe',     name:'Wardrobe',      emoji:'🚪', wood:15, scrap:5, sellValue:60, slot:{x:-6, z:-1.5} },
  { id:'sidebookcase', name:'Side Bookcase', emoji:'📚', wood:8,           sellValue:24, slot:{x:6,  z:2.5}  },
  { id:'nightstand',   name:'Nightstand',    emoji:'🛋️', wood:5,           sellValue:15, slot:{x:1.5,z:3.5}  },
];
let ownedHouseFurniture = []; // furniture ids owned for the Land House, persisted
let HOUSE_FURNITURE_MESHES = []; // NOT persisted — rebuilt whenever furniture changes, tracked so we can tear down without duplicating the whole room
function houseFurnitureCostText(def) { return def.price ? `💰 ${def.price} S.I.P.` : (craftCostText(def) || 'Free'); }
function openHouseFurnitureShop() {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('houseFurnitureModal').style.display = 'flex';
  renderHouseFurniturePanel();
}
function closeHouseFurnitureShop() {
  document.getElementById('houseFurnitureModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderHouseFurniturePanel() {
  const list = document.getElementById('houseFurnitureList');
  if (!list) return;
  list.innerHTML = HOUSE_FURNITURE_CATALOG.map((def,i) => {
    const owned = ownedHouseFurniture.includes(def.id);
    return `<div class="shopItem">
      <div class="siName">${def.emoji} ${def.name}</div>
      <div class="siCost">${houseFurnitureCostText(def)}</div>
      ${owned
        ? `<button class="shopBtn" style="background:#a33;" onclick="sellHouseFurniture(${i})">Sell (${Math.round(def.sellValue*0.5)} S.I.P.)</button>`
        : `<button class="shopBtn" onclick="buyHouseFurniture(${i})">${def.price?'Buy':'Build'}</button>`}
    </div>`;
  }).join('');
}
function buyHouseFurniture(idx) {
  const def = HOUSE_FURNITURE_CATALOG[idx];
  if (ownedHouseFurniture.includes(def.id)) { showNotif('You already have this!'); return; }
  if (def.price) {
    if (sipDollars < def.price) { sfx.nope(); showNotif(`❌ Need ${def.price} S.I.P.!`); return; }
    spendSip(def.price); updateSIP();
  } else {
    if (!canAffordRecipe(def)) { showNotif(`❌ Need ${craftCostText(def)}`); return; }
    if (def.wood)  { woodCount  -= def.wood;  updateWood(); }
    if (def.scrap) { scrapMetal -= def.scrap; updateScrapMetal(); }
    spendMats(def.mats);
  }
  ownedHouseFurniture.push(def.id);
  saveCurrentUser();
  sfx.buy();
  showNotif(`${def.emoji} ${def.name} added to your house!`);
  renderHouseFurniture();
  renderHouseFurniturePanel();
}
function sellHouseFurniture(idx) {
  const def = HOUSE_FURNITURE_CATALOG[idx];
  if (!ownedHouseFurniture.includes(def.id)) return;
  const refund = Math.round(def.sellValue * 0.5);
  ownedHouseFurniture = ownedHouseFurniture.filter(id => id !== def.id);
  queueEarning(refund, 0, `Sold ${def.name}`);
  saveCurrentUser();
  sfx.buy();
  showNotif(`Sold ${def.emoji} ${def.name} for ${refund} S.I.P. (pending in Earnings)!`);
  renderHouseFurniture();
  renderHouseFurniturePanel();
}
// Redraws ONLY the furniture layer (tracked separately from buildLandHouseInterior's one-time
// room build) so buying/selling never duplicates the floor/walls/bed/etc. by calling the whole
// room builder again.
function renderHouseFurniture() {
  HOUSE_FURNITURE_MESHES.forEach(m => scene.remove(m));
  HOUSE_FURNITURE_MESHES = [];
  const ix = LAND_HOUSE_SPAWN.x, iz = 0;
  ownedHouseFurniture.forEach(fid => {
    const f = HOUSE_FURNITURE_CATALOG.find(x => x.id === fid);
    if (!f) return;
    HOUSE_FURNITURE_MESHES.push(box(1.2, 1, 1, 0xAA8855, ix+f.slot.x, 0.6, iz+f.slot.z));
  });
}
const LAND_HOUSE_ZONES = [
  { x:LAND_HOUSE_EXIT.x,      z:LAND_HOUSE_EXIT.z, r:3,   label:'Exit House',     action: () => exitLandHouse()},
  { x:LAND_HOUSE_SPAWN.x+4,   z:-2.5, r:2.2, label:'🛏️ Sleep',        action: () => sleepAtHome()},
  { x:LAND_HOUSE_SPAWN.x-3,   z:2,    r:2.2, label:'🛋️ Sit on Sofa',  action: () => sitOnSofa()},
  { x:LAND_HOUSE_SPAWN.x-4.5, z:-3.8, r:2.2, label:'🍳 Cook a Meal',  action: () => cookMeal()},
  { x:LAND_HOUSE_SPAWN.x-1,   z:3.5,  r:2,   label:'🪑 Furniture Shop', action: () => openHouseFurnitureShop()},
  { x:LAND_HOUSE_SPAWN.x+5.8, z:-1,   r:2,   label:'📚 Read a Book',  action: () => readBook()},
  { x:LAND_HOUSE_SPAWN.x+1,   z:-3.8, r:1.8, label:'🚽 Use Toilet',   action: () => useToilet()},
];
function enterLandHouse(idx) {
  landHouseReturnIdx = idx;
  inLandHouse = true;
  playerGroup.position.set(LAND_HOUSE_SPAWN.x, 0, LAND_HOUSE_SPAWN.z);
  yaw = Math.PI;
  showNotif('🚪 Welcome home!');
}
function exitLandHouse() {
  inLandHouse = false;
  const idx = landHouseReturnIdx;
  landHouseReturnIdx = null;
  if (idx !== null) {
    const { cx, cz } = landPlotPos(idx);
    playerGroup.position.set(cx, 0, cz+3);
    yaw = 0;
  }
  showNotif('🚪 Leaving...');
}

// ─── A REAL SHARED HOTEL ROOM for every country's own hotel (item 154) — same "one shared pocket
// interior, remember which door to return to" pattern as the Land House above, and reuses the
// EXACT same sleepInHotel()/watchHotelTV() the Downtown Hotel already calls. ──────────────────
const COUNTRY_HOTEL_SPAWN = { x:100000, z:0 };
const COUNTRY_HOTEL_EXIT  = { x:100000, z:5 };
const COUNTRY_HOTEL_COLS = [];
let inCountryHotel = false;
let countryHotelReturn = null; // {x,z} — the exact door spot to teleport back to on checkout
function buildCountryHotelInterior() {
  const ix = COUNTRY_HOTEL_SPAWN.x, iz = 0;
  box(12,0.2,9, 0xD2B48C, ix,0.1,iz);           // floor
  box(12,0.2,9, 0xF5F0E8, ix,4,iz);             // ceiling
  box(12,4,0.3, 0xD8E0E8, ix,2,iz-4.5);         // back wall
  box(5.5,4,0.3, 0xD8E0E8, ix-3.5,2,iz+4.5);    // front wall left
  box(5.5,4,0.3, 0xD8E0E8, ix+3.5,2,iz+4.5);    // front wall right
  box(0.3,4,9, 0xD8E0E8, ix-6,2,iz);            // left wall
  box(0.3,4,9, 0xD8E0E8, ix+6,2,iz);            // right wall
  box(2.8,3,0.1, 0x7B5A3C, ix,1.5,iz+4.6);      // door
  box(10,0.05,7, 0x1A3A6C, ix,0.22,iz);         // carpet
  buildSign('🏨 Hotel Room', ix,4.5,iz-4.4);

  // Bed
  box(4,0.5,3, 0xffffff, ix-3,0.6,iz-1.5);
  box(4,0.2,1, 0xcc3333, ix-3,0.95,iz-2.6);
  addCol(COUNTRY_HOTEL_COLS, ix-3,iz-1.5, 2.2,1.7);

  // TV + dresser
  box(2,1.2,0.15, 0x111111, ix+4,2,iz-3.9);
  box(1.7,1,0.05, 0x1a3a5a, ix+4,2,iz-3.85);
  box(3,1,1, 0x5a4030, ix+4,0.5,iz+2);
  addCol(COUNTRY_HOTEL_COLS, ix+4,iz+2, 1.6,0.6);

  addCol(COUNTRY_HOTEL_COLS, ix,iz-4.5, 6,0.5);
  addCol(COUNTRY_HOTEL_COLS, ix-3.5,iz+4.5, 2.75,0.5);
  addCol(COUNTRY_HOTEL_COLS, ix+3.5,iz+4.5, 2.75,0.5);
  addCol(COUNTRY_HOTEL_COLS, ix-6,iz, 0.5,4.5);
  addCol(COUNTRY_HOTEL_COLS, ix+6,iz, 0.5,4.5);
}
const COUNTRY_HOTEL_ZONES = [
  { x:COUNTRY_HOTEL_EXIT.x,   z:COUNTRY_HOTEL_EXIT.z, r:3,   label:'🚪 Check Out', action: () => checkoutCountryHotel()},
  { x:COUNTRY_HOTEL_SPAWN.x-3, z:-1.5, r:2.2, label:'🛏️ Sleep in Bed', action: () => sleepInHotel()},
  { x:COUNTRY_HOTEL_SPAWN.x+4, z:-3,   r:2,   label:'📺 Watch TV',     action: () => watchHotelTV()},
];
function checkinCountryHotel(originName, doorX, doorZ) {
  const price = 50;
  if (sipDollars < price) { sfx.nope(); showNotif(`❌ Need ${price} S.I.P. for a room at the ${originName} Hotel!`); return; }
  spendSip(price); updateSIP(); saveCurrentUser();
  countryHotelReturn = { x:doorX, z:doorZ };
  inCountryHotel = true;
  playerGroup.position.set(COUNTRY_HOTEL_SPAWN.x, 0, COUNTRY_HOTEL_SPAWN.z);
  yaw = Math.PI;
  showNotif(`🏨 Welcome to the ${originName} Hotel! Enjoy your stay.`);
  sfx.earn();
}
function checkoutCountryHotel() {
  inCountryHotel = false;
  if (countryHotelReturn) { playerGroup.position.set(countryHotelReturn.x, 0, countryHotelReturn.z); yaw = 0; }
  countryHotelReturn = null;
  showNotif('🚪 Checking out...');
}

// ─── AIRPORT LOUNGE — a real walk-in interior every one of the 9 airports (Downtown + the 8
// countries, item 154) shares, same "one pocket room, remember the door" pattern as the Land House
// and Country Hotel above. You no longer just buy a ticket and blink to the destination — you walk
// in, eat a real local dish, buy a real souvenir, watch TV, buy real electronics, THEN board. ────
const AIRPORT_LOUNGE_SPAWN = { x:120000, z:0 };
const AIRPORT_LOUNGE_EXIT  = { x:120000, z:8 };
const AIRPORT_LOUNGE_COLS = [];
let inAirportLounge = false;
let airportLoungeOrigin = null; // {name, doorX, doorZ, isDowntown}
const LOCAL_DISHES = {
  'Downtown Explox': { emoji:'🍔', name:'Explox City Burger',   taste:'savory' },
  Japan:     { emoji:'🍣', name:'Sushi Platter',          taste:'savory' },
  France:    { emoji:'🥐', name:'Croissant & Escargot',   taste:'savory' },
  Brazil:    { emoji:'🍖', name:'Churrasco Skewers',      taste:'savory' },
  Egypt:     { emoji:'🧆', name:'Falafel Wrap',           taste:'savory' },
  UK:        { emoji:'🐟', name:'Fish & Chips',           taste:'savory' },
  Australia: { emoji:'🥧', name:'Meat Pie',               taste:'savory' },
  Canada:    { emoji:'🥞', name:'Poutine',                taste:'savory' },
  Italy:     { emoji:'🍝', name:'Spaghetti Carbonara',    taste:'savory' },
};
const SOUVENIRS = {
  'Downtown Explox': { emoji:'🏙️', name:'Explox City Snowglobe', cost:20 },
  Japan:     { emoji:'🎎', name:'Kimono Doll',        cost:25 },
  France:    { emoji:'🗼', name:'Mini Eiffel Tower',  cost:25 },
  Brazil:    { emoji:'🥥', name:'Carnival Mask',      cost:22 },
  Egypt:     { emoji:'🐫', name:'Camel Figurine',     cost:24 },
  UK:        { emoji:'☂️', name:'London Umbrella',    cost:20 },
  Australia: { emoji:'🐨', name:'Koala Plush',        cost:23 },
  Canada:    { emoji:'🍁', name:'Maple Leaf Pin',     cost:18 },
  Italy:     { emoji:'🎭', name:'Venetian Mask',      cost:26 },
};
const LOUNGE_ELECTRONICS = [
  { id:'lounge_phone',  emoji:'📱', name:'Travel Phone',  cost:60  },
  { id:'lounge_tablet', emoji:'📲', name:'Travel Tablet', cost:110 },
];
function buildAirportLoungeInterior() {
  const ix = AIRPORT_LOUNGE_SPAWN.x, iz = 0;
  box(20,0.3,16, 0xd8d0c0, ix,0.15,iz);          // floor
  box(20,0.2,16, 0xf0f4f8, ix,5,iz);             // ceiling
  box(20,5,0.3, 0xb8c4d0, ix,2.5,iz-8);          // back wall
  box(7,5,0.3,  0xb8c4d0, ix-6.5,2.5,iz+8);      // front wall left
  box(7,5,0.3,  0xb8c4d0, ix+6.5,2.5,iz+8);      // front wall right
  box(0.3,5,16, 0xb8c4d0, ix-10,2.5,iz);         // left wall
  box(0.3,5,16, 0xb8c4d0, ix+10,2.5,iz);         // right wall
  box(2,3,0.1, 0x7B5A3C, ix,1.5,iz+8.1);         // exit door
  buildSign('✈️ Airport Lounge', ix,5.5,iz-7.8);

  // Restaurant counter
  box(5,1.1,1.4, 0xe0d8c8, ix-5,0.75,iz-3);
  box(5.1,0.1,1.5, 0xf8f8f8, ix-5,1.35,iz-3);
  buildSign('🍽️ Local Eats', ix-5,2.4,iz-3.8);
  addCol(AIRPORT_LOUNGE_COLS, ix-5,iz-3, 2.6,0.8);

  // Souvenir shop
  box(5,1.6,1.4, 0x8B5A2B, ix+5,0.9,iz-3);
  box(5.1,0.1,1.5, 0xffd54a, ix+5,1.7,iz-3);
  buildSign('🎁 Souvenirs', ix+5,2.6,iz-3.8);
  addCol(AIRPORT_LOUNGE_COLS, ix+5,iz-3, 2.6,0.8);

  // TV lounge area
  box(4,0.6,1.8, 0x994444, ix-5,0.55,iz+2);
  box(3,2,0.15, 0x111111, ix-5,2.4,iz+3.9);
  addCol(AIRPORT_LOUNGE_COLS, ix-5,iz+2, 2.2,1.0);

  // Electronics kiosk
  box(3,1.5,1, 0x445566, ix+5,0.75,iz+2);
  buildSign('📱 Electronics', ix+5,2,iz+1.4);
  addCol(AIRPORT_LOUNGE_COLS, ix+5,iz+2, 1.6,0.6);

  // Boarding gate
  box(3,3.5,0.2, 0x2255aa, ix,1.75,iz-7.8);
  buildSign('🛫 Boarding Gate', ix,4,iz-7.6);

  addCol(AIRPORT_LOUNGE_COLS, ix,iz-8, 11,0.5);
  addCol(AIRPORT_LOUNGE_COLS, ix-6.5,iz+8, 3.5,0.5);
  addCol(AIRPORT_LOUNGE_COLS, ix+6.5,iz+8, 3.5,0.5);
  addCol(AIRPORT_LOUNGE_COLS, ix-10,iz, 0.5,9);
  addCol(AIRPORT_LOUNGE_COLS, ix+10,iz, 0.5,9);
}
const AIRPORT_LOUNGE_ZONES = [
  { x:AIRPORT_LOUNGE_EXIT.x,   z:AIRPORT_LOUNGE_EXIT.z, r:3,   label:'🚪 Leave Lounge',       action: () => exitAirportLounge()},
  { x:AIRPORT_LOUNGE_SPAWN.x-5, z:-3, r:2.3, label:'🍽️ Eat a Local Dish',   action: () => eatLoungeDish()},
  { x:AIRPORT_LOUNGE_SPAWN.x+5, z:-3, r:2.3, label:'🎁 Buy a Souvenir',     action: () => buyLoungeSouvenir()},
  { x:AIRPORT_LOUNGE_SPAWN.x-5, z:2,  r:2.3, label:'📺 Watch TV',          action: () => watchHotelTV()},
  { x:AIRPORT_LOUNGE_SPAWN.x+5, z:2,  r:1.8, label:'📱 Buy a Phone',       action: () => buyLoungeElectronic('lounge_phone') },
  { x:AIRPORT_LOUNGE_SPAWN.x+5, z:0.5,r:1.8, label:'📲 Buy a Tablet',      action: () => buyLoungeElectronic('lounge_tablet') },
  { x:AIRPORT_LOUNGE_SPAWN.x,   z:-7.6, r:2.5, label:'🛫 Board the Plane', action: () => boardPlane()},
];
function enterAirportLounge(name, doorX, doorZ, isDowntown) {
  airportLoungeOrigin = { name, doorX, doorZ, isDowntown };
  inAirportLounge = true;
  playerGroup.position.set(AIRPORT_LOUNGE_SPAWN.x, 0, AIRPORT_LOUNGE_SPAWN.z);
  yaw = Math.PI;
  showNotif(`🛫 Welcome to the ${name} Airport Lounge!`);
}
function exitAirportLounge() {
  inAirportLounge = false;
  if (airportLoungeOrigin) { playerGroup.position.set(airportLoungeOrigin.doorX, 0, airportLoungeOrigin.doorZ); yaw = 0; }
  airportLoungeOrigin = null;
  showNotif('🚪 Leaving the lounge...');
}
function eatLoungeDish() {
  const origin = airportLoungeOrigin ? airportLoungeOrigin.name : 'Downtown Explox';
  const dish = LOCAL_DISHES[origin] || LOCAL_DISHES['Downtown Explox'];
  eatFood(dish.emoji, dish.name, dish.taste);
}
function buyLoungeSouvenir() {
  const origin = airportLoungeOrigin ? airportLoungeOrigin.name : 'Downtown Explox';
  const sv = SOUVENIRS[origin] || SOUVENIRS['Downtown Explox'];
  if (sipDollars < sv.cost) { sfx.nope(); showNotif(`❌ Need ${sv.cost} S.I.P. for a ${sv.name}!`); return; }
  spendSip(sv.cost); updateSIP();
  addToInventory('souvenir_'+slug(sv.name), sv.name, sv.emoji);
  saveCurrentUser();
  sfx.buy();
  showNotif(`${sv.emoji} Bought a real ${sv.name}!`);
}
function buyLoungeElectronic(itemId) {
  const item = LOUNGE_ELECTRONICS.find(x => x.id === itemId);
  if (!item) return;
  if (sipDollars < item.cost) { sfx.nope(); showNotif(`❌ Need ${item.cost} S.I.P. for a ${item.name}!`); return; }
  spendSip(item.cost); updateSIP();
  addToInventory(item.id, item.name, item.emoji);
  saveCurrentUser();
  sfx.buy();
  showNotif(`${item.emoji} Bought a real ${item.name}!`);
}
function boardPlane() {
  if (!airportLoungeOrigin) return;
  const origin = airportLoungeOrigin;
  inAirportLounge = false; // no longer in the lounge — the flight animation places you at the real destination
  if (origin.isDowntown) openAirport(); else openCountryAirport(origin.name);
}
function buyLand(idx) {
  const plot = LAND_PLOTS[idx];
  const ownerName = getLandOwners()[plot.id] || null;
  if (ownerName) { showNotif(`🏡 ${plot.name} is already owned by ${ownerName===currentUser?'you':ownerName}!`); return; }
  if(sipDollars < plot.price) { sfx.nope(); showNotif(`❌ Need ${plot.price.toLocaleString()} S.I.P. for ${plot.name}!`); return; }
  spendSip(plot.price); updateSIP();
  if(!ownedLand.includes(plot.id)) ownedLand.push(plot.id);
  setLandOwner(plot.id, currentUser);
  saveCurrentUser();
  sfx.buy();
  showNotif(`🏡 You bought ${plot.name}! It's yours now. Press E again to build on it.`);
  buildLandPlot(idx);
}
// Move your land to any open (unclaimed) plot — "anywhere possible" within the real slot-based
// ownership system this game actually has, not literally anywhere in the 3D world (which a
// per-plot registry can't represent). Buildings are re-indexed into the new lot's own slot grid
// since the old slot numbers are meaningless in a differently-shaped grid.
function relocateLand(fromIdx, toIdx) {
  const fromPlot = LAND_PLOTS[fromIdx], toPlot = LAND_PLOTS[toIdx];
  if (getLandOwners()[toPlot.id]) { showNotif('❌ That plot is already taken!'); return; }
  const oldBuildings = plotBuildings[fromPlot.id] || [];
  if (oldBuildings.length > toPlot.slots.length) { showNotif(`❌ ${toPlot.name} only has ${toPlot.slots.length} slots — you have ${oldBuildings.length} things built. Demolish some first or pick a bigger lot.`); return; }
  plotBuildings[toPlot.id] = oldBuildings.map((b,i) => ({ ...b, slot:i }));
  delete plotBuildings[fromPlot.id];
  if (landInvites[fromPlot.id]) { landInvites[toPlot.id] = landInvites[fromPlot.id]; delete landInvites[fromPlot.id]; }
  if (landColor[fromPlot.id] !== undefined) { landColor[toPlot.id] = landColor[fromPlot.id]; delete landColor[fromPlot.id]; }
  if (landForSale[fromPlot.id] !== undefined) { landForSale[toPlot.id] = landForSale[fromPlot.id]; delete landForSale[fromPlot.id]; }
  if (!ownedLand.includes(toPlot.id)) ownedLand.push(toPlot.id);
  ownedLand = ownedLand.filter(id => id !== fromPlot.id);
  setLandOwner(fromPlot.id, null);
  setLandOwner(toPlot.id, currentUser);
  saveCurrentUser();
  Object.keys(PLOT_BUILDING_MESHES).forEach(key => { if (key.startsWith(fromPlot.id+'_')) { scene.remove(PLOT_BUILDING_MESHES[key]); delete PLOT_BUILDING_MESHES[key]; } });
  buildLandPlot(fromIdx);
  buildLandPlot(toIdx);
  renderExistingBuildings(toIdx);
  sfx.buy();
  showNotif(`🚚 Moved your land from ${fromPlot.name} to ${toPlot.name}!`);
  closeBuildMenu();
}
// A permitted guest buying an OWNED, for-sale plot right out from under its current owner — the
// seller genuinely gets paid, keeps nothing else of the plot, and it transfers as-is — buildings AND paint.
function buyLandFromOwner(idx, ownerName) {
  const plot = LAND_PLOTS[idx];
  const ownerData = getUserData(ownerName);
  const price = ownerData.landForSale && ownerData.landForSale[plot.id];
  if (!price) { showNotif('❌ This land is not for sale.'); return; }
  if (sipDollars < price) { sfx.nope(); showNotif(`❌ Need ${price.toLocaleString()} S.I.P. to buy ${plot.name}!`); return; }
  spendSip(price); updateSIP();
  const transferred = (ownerData.plotBuildings && ownerData.plotBuildings[plot.id]) || [];
  const transferredColor = ownerData.landColor && ownerData.landColor[plot.id];
  patchUserData(ownerName, d => {
    d.ownedLand = (d.ownedLand||[]).filter(id => id!==plot.id);
    if (d.plotBuildings) delete d.plotBuildings[plot.id];
    if (d.landInvites)   delete d.landInvites[plot.id];
    if (d.landColor)     delete d.landColor[plot.id];
    if (d.landForSale)   delete d.landForSale[plot.id];
    d.sip = (d.sip||0) + price;
  });
  if(!ownedLand.includes(plot.id)) ownedLand.push(plot.id);
  plotBuildings[plot.id] = transferred;
  if (transferredColor !== undefined && transferredColor !== null) landColor[plot.id] = transferredColor;
  setLandOwner(plot.id, currentUser);
  saveCurrentUser();
  sfx.buy();
  Object.keys(PLOT_BUILDING_MESHES).forEach(key => { if(key.startsWith(plot.id+'_')) { scene.remove(PLOT_BUILDING_MESHES[key]); delete PLOT_BUILDING_MESHES[key]; } });
  buildLandPlot(idx);
  renderExistingBuildings(idx);
  showNotif(`🏡 You bought ${plot.name} from ${ownerName} for ${price.toLocaleString()} S.I.P.!`);
  closeVisitLand();
}
const PAINT_SWATCHES = [
  { name:'Forest Green',  color:0x3a9d3a }, { name:'Ocean Blue',   color:0x2a6d9d },
  { name:'Sunset Orange', color:0xd9762a }, { name:'Royal Purple', color:0x6a3a9d },
  { name:'Charcoal',      color:0x333333 }, { name:'Rose Pink',    color:0xd94a8a },
];
function paintMyLand(idx, color) {
  const plot = LAND_PLOTS[idx];
  landColor[plot.id] = color;
  saveCurrentUser();
  buildLandPlot(idx);
  repaintPlotHouseMesh(idx, color); // buildLandPlot's renderExistingBuildings skips already-built meshes, so the house needs its own explicit rebuild to pick up the new color
  showNotif('🎨 Land painted!');
  renderBuildMenu(idx);
}
function setLandForSale(idx, price) {
  const plot = LAND_PLOTS[idx];
  if (price > 0) landForSale[plot.id] = price; else delete landForSale[plot.id];
  saveCurrentUser();
  buildLandPlot(idx);
  showNotif(price > 0 ? `🏷️ Listed for ${price.toLocaleString()} S.I.P.!` : '🏷️ Delisted.');
  renderBuildMenu(idx);
}
function setLandInvite(idx, guestName, perm) {
  const plot = LAND_PLOTS[idx];
  if (!guestName || guestName===currentUser || !getUsers().includes(guestName)) { showNotif('❌ Enter another real account name on this device.'); return; }
  landInvites[plot.id] = landInvites[plot.id] || {};
  landInvites[plot.id][guestName] = perm;
  saveCurrentUser();
  const permList = ['sit','smash','paint','buy','kill'].filter(k=>perm[k]).map(k=>k==='kill'?'Attack':k[0].toUpperCase()+k.slice(1)).join(', ') || 'visit only';
  pushNotice(guestName, `✉️ ${currentUser} invited you to ${plot.name}! You're allowed to: ${permList}.`);
  showNotif(`✉️ Invited ${guestName} to ${plot.name}!`);
  renderBuildMenu(idx);
}
function revokeLandInvite(idx, guestName) {
  const plot = LAND_PLOTS[idx];
  if (landInvites[plot.id]) delete landInvites[plot.id][guestName];
  saveCurrentUser();
  showNotif(`✉️ Revoked ${guestName}'s invite.`);
  renderBuildMenu(idx);
}
function ownerSit() {
  playerSeated = true;
  closeBuildMenu();
  showNotif('🪑 You sit down. Press E to get up.');
}
// Writes a real "while you were away" report onto ANOTHER account's own save — same
// cross-account patchUserData pattern as smashBuilding/visitPaint, read back on their next login.
function pushNotice(accountName, message) {
  patchUserData(accountName, d => {
    d.pendingNotices = Array.isArray(d.pendingNotices) ? d.pendingNotices : [];
    d.pendingNotices.push({ message });
  });
}
// A permitted guest attacking the OWNER's character itself, not just their buildings — real stakes:
// the owner's WALLET (sipDollars, not their banked money) is genuinely at risk, same as being
// mugged. Uses the same real weapon-damage system as NPC/robot combat so a better weapon matters.
function attackOwner(idx, ownerName) {
  const plot = LAND_PLOTS[idx];
  const roll = 1 + Math.floor(Math.random()*50); // flat 1-50 S.I.P. drop, regardless of weapon
  let lost = 0;
  patchUserData(ownerName, d => {
    const wallet = d.sip || 0;
    lost = Math.min(roll, wallet); // can't drop more than they're actually carrying
    d.sip = wallet - lost;
    d.pendingNotices = Array.isArray(d.pendingNotices) ? d.pendingNotices : [];
    d.pendingNotices.push({ message: `💀 ${currentUser} attacked you at ${plot.name} and you dropped ${lost.toLocaleString()} S.I.P.! (Money in the bank is always safe.)` });
  });
  if(lost>0) queueEarning(lost, 0, `Looted ${ownerName}`);
  sfx.boom();
  showNotif(lost>0 ? `⚔️ You defeated ${ownerName} and looted ${lost.toLocaleString()} S.I.P.! (pending in Earnings)` : `⚔️ You defeated ${ownerName}, but their wallet was empty!`);
  closeVisitLand();
}
// Shown right when a fresh world finishes loading — real "while you were away" reports
// (someone invited you, someone attacked you) that piled up on THIS account since its last login.
function checkPendingNotices() {
  if (!pendingNotices.length) return;
  const list = document.getElementById('noticesList');
  list.innerHTML = pendingNotices.map(n => `<div class="shopItem"><div class="siName" style="font-weight:normal;">${n.message}</div></div>`).join('');
  document.getElementById('noticesOverlay').style.display = 'flex';
}
function closeNotices() {
  document.getElementById('noticesOverlay').style.display = 'none';
  pendingNotices = [];
  saveCurrentUser();
}

// ── Visiting someone ELSE's owned land — real permission-gated actions, not just a viewer ──
function openVisitLand(idx, ownerName) {
  const plot = LAND_PLOTS[idx];
  const ownerData = getUserData(ownerName);
  const perm = (ownerData.landInvites && ownerData.landInvites[plot.id] && ownerData.landInvites[plot.id][currentUser]) || null;
  if (!perm) { showNotif(`🔒 ${plot.name} is private. Ask ${ownerName} to invite you!`); return; }
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('visitLandOverlay').style.display = 'flex';
  renderVisitLand(idx, ownerName);
}
function closeVisitLand() {
  document.getElementById('visitLandOverlay').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderVisitLand(idx, ownerName) {
  const plot = LAND_PLOTS[idx];
  const ownerData = getUserData(ownerName);
  const perm = (ownerData.landInvites && ownerData.landInvites[plot.id] && ownerData.landInvites[plot.id][currentUser]) || {};
  document.getElementById('visitPlotName').textContent = `${plot.name} — ${ownerName}'s Land`;
  const placed = (ownerData.plotBuildings && ownerData.plotBuildings[plot.id]) || [];
  const list = document.getElementById('visitBuildingList');
  list.innerHTML = placed.length ? '' : '<div style="color:#789;font-size:12px;">Nothing built here yet.</div>';
  placed.forEach(entry => {
    const isCustomHouse = entry.id === 'customhouse';
    const emoji = isCustomHouse ? HOUSE_MATERIALS[entry.houseMaterial].emoji : BUILD_CATALOG.find(b=>b.id===entry.id).emoji;
    const name = isCustomHouse ? `${entry.houseSize}x${entry.houseSize} ${HOUSE_MATERIALS[entry.houseMaterial].name} House` : BUILD_CATALOG.find(b=>b.id===entry.id).name;
    const d = document.createElement('div'); d.className='shopItem';
    d.innerHTML = `<div class="siName">${emoji} ${name}</div>
      ${perm.smash ? `<button class="shopBtn" style="background:#a33;" onclick="smashBuilding(${idx},'${ownerName}',${entry.slot})">🔨 Smash</button>` : ''}`;
    list.appendChild(d);
  });
  const hasBench = placed.some(p=>p.id==='bench');
  document.getElementById('visitSitBtn').style.display = (perm.sit && hasBench) ? 'block' : 'none';
  document.getElementById('visitAttackBtn').style.display = perm.kill ? 'block' : 'none';
  const paintPanel = document.getElementById('visitPaintPanel');
  if (perm.paint) {
    paintPanel.style.display = 'block';
    document.getElementById('visitPaintSwatches').innerHTML = PAINT_SWATCHES.map(s =>
      `<button onclick="visitPaint(${idx},'${ownerName}',${s.color})" title="${s.name}" style="width:26px;height:26px;border-radius:6px;border:2px solid #fff;background:#${s.color.toString(16).padStart(6,'0')};cursor:pointer;margin:3px;"></button>`
    ).join('');
  } else paintPanel.style.display = 'none';
  document.getElementById('visitAttackBtn').onclick = () => attackOwner(idx, ownerName);
  const forSale = ownerData.landForSale && ownerData.landForSale[plot.id];
  const buyBtn = document.getElementById('visitBuyBtn');
  if (perm.buy && forSale) {
    buyBtn.style.display = 'block';
    buyBtn.textContent = `💰 Buy for ${forSale.toLocaleString()} S.I.P.`;
    buyBtn.onclick = () => buyLandFromOwner(idx, ownerName);
  } else buyBtn.style.display = 'none';
}
function smashBuilding(idx, ownerName, slot) {
  const plot = LAND_PLOTS[idx];
  patchUserData(ownerName, d => {
    if (d.plotBuildings && d.plotBuildings[plot.id]) d.plotBuildings[plot.id] = d.plotBuildings[plot.id].filter(p=>p.slot!==slot);
  });
  const key = plot.id+'_'+slot;
  if (PLOT_BUILDING_MESHES[key]) { scene.remove(PLOT_BUILDING_MESHES[key]); delete PLOT_BUILDING_MESHES[key]; }
  sfx.boom();
  showNotif(`🔨 Smashed ${ownerName}'s building!`);
  renderVisitLand(idx, ownerName);
}
function visitSit() {
  playerSeated = true;
  closeVisitLand();
  showNotif('🪑 You sit down. Press E to get up.');
}
function visitPaint(idx, ownerName, color) {
  const plot = LAND_PLOTS[idx];
  const ownerData = getUserData(ownerName);
  patchUserData(ownerName, d => { d.landColor = d.landColor||{}; d.landColor[plot.id] = color; });
  buildLandPlot(idx);
  repaintPlotHouseMesh(idx, color, ownerData.plotBuildings && ownerData.plotBuildings[plot.id]);
  showNotif('🎨 Painted!');
}

// ── Building — real structures placed into a size-dependent slot grid on an OWNED plot ──
const BUILD_CATALOG = [
  { id:'tree',     name:'Garden Tree',  emoji:'🌳', wood:2,  sip:0   },
  { id:'flag',     name:'Flagpole',     emoji:'🚩', wood:4,  sip:20  },
  { id:'wall',     name:'Stone Wall',   emoji:'🧱', wood:0,  sip:50  },
  { id:'shed',     name:'Wooden Shed',  emoji:'🛖', wood:10, sip:0   },
  { id:'fountain', name:'Fountain',     emoji:'⛲', wood:0,  sip:150 },
  { id:'house',    name:'Small House (1-Story)',  emoji:'🏠', wood:20, sip:200 },
  { id:'brickhouse', name:'Brick House', emoji:'🧱', wood:10, mats:{ceramic_tile:4, clay_lump:6} },
  { id:'house2', name:'2-Story House', emoji:'🏘️', wood:35, sip:450 },
  { id:'house3', name:'3-Story House', emoji:'🏢', wood:45, sip:800,  mats:{steel_plate:5} },
  { id:'house4', name:'4-Story House', emoji:'🏙️', wood:55, sip:1300, mats:{steel_plate:10, steel_cable:5} },
  { id:'mansion', name:'Mansion',      emoji:'🏰', wood:70, sip:3500, mats:{granite_piece:15, steel_cable:10, gold_nugget:3} },
  { id:'greenhouse', name:'Greenhouse',  emoji:'🪴', mats:{glass_shard:8, steel_plate:2} },
  { id:'watchtower', name:'Watchtower',  emoji:'🗼', wood:8, mats:{granite_piece:5, steel_cable:3} },
  { id:'bench',      name:'Garden Bench', emoji:'🪑', wood:3, sip:0 },
  { id:'woodmill',    name:'Wood Mill',        emoji:'🏭', sip:100, produces:{type:'wood',  amount:1, everySec:15} },
  { id:'fabricator',  name:'Scrap Fabricator', emoji:'⚙️', sip:150, scrap:5, produces:{type:'scrap', amount:1, everySec:15} },
  { id:'printer',     name:'S.I.P. Printer',   emoji:'💰', sip:300, produces:{type:'sip',   amount:5, everySec:20} },
];
// ─── CUSTOM HOUSE — user's own ask: "you can choose 1x1 2x2 ... 20x20 wood concreet metal or
// glass". Instead of the fixed 5-tier house ladder above (house/house2/3/4/mansion), a real
// pick-a-size-and-material house: cost scales with actual footprint area, and the material
// changes what it's actually paid in (and how it looks), reusing the same {wood,scrap,sip,mats}
// recipe shape canAffordRecipe()/spendMats() already understand everywhere else in the game.
const HOUSE_SIZES = [1,2,3,4,5,6,7,8,9,10,15,20];
const HOUSE_MATERIALS = {
  wood:     { name:'Wood',     emoji:'🪵', color:0xB5895B },
  concrete: { name:'Concrete', emoji:'🧱', color:0x9a9a92 },
  metal:    { name:'Metal',    emoji:'⚙️', color:0xb8c0c8, metalness:true },
  glass:    { name:'Glass',    emoji:'🪟', color:0xbfe8ff, transparent:true },
};
function houseBuildCost(size, materialKey) {
  const area = size*size;
  if (materialKey==='concrete') return { scrap: Math.ceil(area*0.6), sip: Math.ceil(area*4) };
  if (materialKey==='metal')    return { mats:{steel_plate: Math.max(1,Math.ceil(area/6))}, sip: Math.ceil(area*6) };
  if (materialKey==='glass')    return { mats:{glass_shard: Math.max(1,Math.ceil(area/4))}, sip: Math.ceil(area*8) };
  return { wood: Math.ceil(area*3) }; // wood — the cheap, always-available default
}
// A house's real world width is 2 + size*2.2 (see buildStructureMesh's 'customhouse' branch) —
// capped per plot so a house always leaves real yard space inside the fence, rather than a
// giant house clipping straight through it (same real lesson as item 272's giant-scale fix).
function maxHouseSizeForPlot(plot) {
  const maxWorld = plot.footprint * 0.6;
  const maxSize = Math.floor((maxWorld - 2) / 2.2);
  return HOUSE_SIZES.filter(s => s <= maxSize).pop() || 1;
}
let selectedHouseSize = 1, selectedHouseMaterial = 'wood';
function setHouseSize(idx, size) { selectedHouseSize = size; renderBuildMenu(idx); }
function setHouseMaterial(idx, materialKey) { selectedHouseMaterial = materialKey; renderBuildMenu(idx); }
function buildCustomHouse(idx) {
  const plot = LAND_PLOTS[idx];
  const size = Math.min(selectedHouseSize, maxHouseSizeForPlot(plot));
  const materialKey = selectedHouseMaterial;
  const cost = houseBuildCost(size, materialKey);
  if (!canAffordRecipe(cost)) { showNotif(`❌ Need ${craftCostText(cost)}`); return; }
  const placed = plotBuildings[plot.id] || (plotBuildings[plot.id] = []);
  const existingIdx = placed.findIndex(p => HOUSE_IDS.includes(p.id));
  let slot;
  if (existingIdx > -1) {
    // A plot only ever has one house — building a new one replaces whatever was there.
    slot = placed[existingIdx].slot;
    const meshKey = plot.id+'_'+slot;
    if (PLOT_BUILDING_MESHES[meshKey]) { scene.remove(PLOT_BUILDING_MESHES[meshKey]); delete PLOT_BUILDING_MESHES[meshKey]; }
    placed.splice(existingIdx, 1);
  } else {
    if (placed.length >= plot.slots.length) { showNotif('🏗️ This plot is full!'); return; }
    const usedSlots = placed.map(p=>p.slot);
    for (let i=0;i<plot.slots.length;i++){ if(!usedSlots.includes(i)) { slot=i; break; } }
  }
  if (cost.wood)  { woodCount  -= cost.wood;  updateWood(); }
  if (cost.scrap) { scrapMetal -= cost.scrap; updateScrapMetal(); }
  if (cost.sip)   { spendSip(cost.sip); updateSIP(); }
  spendMats(cost.mats);
  placed.push({ slot, id:'customhouse', _t:0, houseSize:size, houseMaterial:materialKey });
  saveCurrentUser();
  const { cx, cz } = landPlotPos(idx);
  const [ox,oz] = plot.slots[slot];
  PLOT_BUILDING_MESHES[plot.id+'_'+slot] = buildStructureMesh('customhouse', cx+ox, cz+oz, { size, material:materialKey, color: landColor[plot.id] });
  sfx.buy();
  showNotif(`🏠 Built a ${size}x${size} ${HOUSE_MATERIALS[materialKey].name} house!`);
  renderBuildMenu(idx);
}
// Rebuilds JUST the house mesh in place with the current landColor — called after painting
// (paintMyLand/visitPaint), since a house is the one structure whose walls actually read the
// plot's paint color (everything else in BUILD_CATALOG keeps its own fixed color).
function repaintPlotHouseMesh(idx, color, placedOverride) {
  const plot = LAND_PLOTS[idx];
  // placedOverride lets visitPaint() pass the OWNER's plotBuildings (a guest's own local
  // plotBuildings variable is a completely different account's data, per-account like everything
  // else in this file — see patchUserData's own comment).
  const placed = placedOverride || plotBuildings[plot.id] || [];
  const houseEntry = placed.find(p => p.id === 'customhouse');
  if (!houseEntry) return;
  const meshKey = plot.id+'_'+houseEntry.slot;
  if (PLOT_BUILDING_MESHES[meshKey]) { scene.remove(PLOT_BUILDING_MESHES[meshKey]); delete PLOT_BUILDING_MESHES[meshKey]; }
  const { cx, cz } = landPlotPos(idx);
  const [ox,oz] = plot.slots[houseEntry.slot];
  PLOT_BUILDING_MESHES[meshKey] = buildStructureMesh('customhouse', cx+ox, cz+oz, { size:houseEntry.houseSize, material:houseEntry.houseMaterial, color });
}
let plotBuildings = {};       // { lotId: [{slot, id, _t}, ...] } — persisted; _t is a machine's own production timer
let PLOT_BUILDING_MESHES = {}; // NOT persisted — 'lotId_slot' -> THREE.Group, rebuilt every session
function buildStructureMesh(id, x, z, extra) {
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  if(id==='customhouse') {
    const size = (extra && extra.size) || 1;
    const materialKey = (extra && extra.material) || 'wood';
    const matDef = HOUSE_MATERIALS[materialKey] || HOUSE_MATERIALS.wood;
    const w = 2 + size * 2.2; // real footprint scales with size — see maxHouseSizeForPlot's own comment
    const h = 2.2 + Math.min(size, 10) * 0.15; // height grows only mildly — a 20x20 house is wide, not a tower
    const wallColor = (extra && extra.color !== undefined && extra.color !== null) ? extra.color : matDef.color;
    const wallMat = matDef.metalness
      ? new THREE.MeshStandardMaterial({ color: wallColor, metalness: 0.7, roughness: 0.35 })
      : new THREE.MeshLambertMaterial(matDef.transparent ? { color: wallColor, transparent:true, opacity:0.5 } : { color: wallColor });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w,h,w), wallMat); body.position.y = h/2; g.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w*0.75, h*0.5, 4), mat(0xaa3333)); roof.position.y = h + h*0.25; roof.rotation.y = Math.PI/4; g.add(roof);
    const doorH = Math.min(1.4, h*0.6), doorW = Math.min(1.2, w*0.25);
    const door = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.12), mat(0x5c3a1e)); door.position.set(0, doorH/2, w/2+0.06); g.add(door);
  } else if(id==='tree') {
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.4,1.6,0.4), mat(0x5c3a1e)); trunk.position.y=0.8; g.add(trunk);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,1.8), mat(0x2d7a2d)); canopy.position.y=2.2; g.add(canopy);
    treeMeshes.push(canopy); // rides along with the existing seasonal-color system
  } else if(id==='flag') {
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.12,2.4,0.12), mat(0xcccccc)); pole.position.y=1.2; g.add(pole);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.4,0.05), mat(0xe94560)); flag.position.set(0.32,2.0,0); g.add(flag);
  } else if(id==='wall') {
    const w = new THREE.Mesh(new THREE.BoxGeometry(2.4,1.2,0.3), mat(0x999999)); w.position.y=0.6; g.add(w);
  } else if(id==='shed') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2,1.6,2), mat(0x8B5A2B)); body.position.y=0.8; g.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.3,0.3,2.3), mat(0x5c3a1e)); roof.position.y=1.75; g.add(roof);
  } else if(id==='fountain') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,0.35,16), mat(0x88bbcc)); base.position.y=0.18; g.add(base);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,0.15,16), mat(0xaaddee)); water.position.y=0.4; g.add(water);
    const spout = new THREE.Mesh(new THREE.BoxGeometry(0.2,1,0.2), mat(0xcccccc)); spout.position.y=0.9; g.add(spout);
  } else if(id==='house') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(3,2.2,3), mat(0xE8DCC8)); body.position.y=1.1; g.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4,1.4,4), mat(0xaa3333)); roof.position.y=2.9; roof.rotation.y=Math.PI/4; g.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.6,1.2,0.1), mat(0x5c3a1e)); door.position.set(0,0.6,1.55); g.add(door);
  } else if(id==='brickhouse') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(3,2.4,3), mat(0xb85c3c)); body.position.y=1.2; g.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4,0.3,3.4), mat(0x6b3520)); roof.position.y=2.55; g.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.6,1.2,0.1), mat(0x3a2410)); door.position.set(0,0.6,1.55); g.add(door);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.6,0.08), mat(0xbfe8ff)); win.position.set(0.9,1.5,1.52); g.add(win);
  } else if(id==='greenhouse') {
    const glassMat = new THREE.MeshLambertMaterial({color:0xbfe8ff, transparent:true, opacity:0.45});
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.8,1.8,2.8), glassMat); body.position.y=0.9; g.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2,1.1,4), glassMat); roof.position.y=2.35; roof.rotation.y=Math.PI/4; g.add(roof);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.9,0.12,2.9), mat(0x99aabb)); frame.position.y=1.85; g.add(frame);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([px,pz])=>{ const plant = new THREE.Mesh(new THREE.BoxGeometry(0.4,0.6,0.4), mat(0x33aa44)); plant.position.set(px,0.3,pz); g.add(plant); });
  } else if(id==='house2' || id==='house3' || id==='house4') {
    const stories = { house2:2, house3:3, house4:4 }[id];
    for (let s=0; s<stories; s++) {
      const fy = 1.1 + s*2.1;
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.8,1.9,2.8), mat(s%2===0?0xE8DCC8:0xD8C8A8)); body.position.y=fy; g.add(body);
      const winMat = new THREE.MeshBasicMaterial({color:0xbfe8ff});
      [[-0.85,1.42],[0.85,1.42]].forEach(([wx,wz]) => { const win=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.05), winMat); win.position.set(wx,fy,wz); g.add(win); });
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2,1.2,4), mat(0xaa3333)); roof.position.y=1.1+stories*2.1+0.4; roof.rotation.y=Math.PI/4; g.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.6,1.2,0.1), mat(0x5c3a1e)); door.position.set(0,0.6,1.42); g.add(door);
  } else if(id==='mansion') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(6,3,5), mat(0xF0E8D8)); body.position.y=1.5; g.add(body);
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(2,2.4,4), mat(0xE8DCC8)); wingL.position.set(-4,1.2,0); g.add(wingL);
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(2,2.4,4), mat(0xE8DCC8)); wingR.position.set(4,1.2,0); g.add(wingR);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(6.4,0.4,5.4), mat(0x883333)); roof.position.y=3.2; g.add(roof);
    [[-2.2,2.4],[2.2,2.4]].forEach(([px,pz]) => { const p=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,3,8), mat(0xffffff)); p.position.set(px,1.5,pz); g.add(p); });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2,2,0.15), mat(0x5c3a1e)); door.position.set(0,1,2.55); g.add(door);
    const fountain = new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,0.3,12), mat(0x88bbcc)); fountain.position.set(0,0.15,4.5); g.add(fountain);
  } else if(id==='watchtower') {
    const legs = new THREE.Mesh(new THREE.BoxGeometry(1.4,3,1.4), mat(0x7a7a7a)); legs.position.y=1.5; g.add(legs);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.2,0.25,2.2), mat(0x5a5a5a)); deck.position.y=3.1; g.add(deck);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6,1.2,1.6), mat(0x8a8a8a)); cabin.position.y=3.85; g.add(cabin);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.4,0.8,4), mat(0x445566)); roof.position.y=4.85; roof.rotation.y=Math.PI/4; g.add(roof);
  } else if(id==='bench') {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4,0.15,0.5), mat(0x8B5A2B)); seat.position.y=0.5; g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.4,0.5,0.12), mat(0x6b4423)); back.position.set(0,0.8,-0.2); g.add(back);
    [[-0.6,0.25],[0.6,0.25]].forEach(([lx,ly])=>{ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.5,0.4), mat(0x4a2e15)); leg.position.set(lx,ly,0); g.add(leg); });
  } else if(id==='woodmill') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1,1.1,1.4,10), mat(0x5c3a1e)); base.position.y=0.7; g.add(base);
    const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,0.15,10), mat(0xccaa66)); blade.position.set(0,1.5,0); blade.rotation.x=Math.PI/2; g.add(blade);
  } else if(id==='fabricator') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4,1.6,1.2), mat(0x556677)); body.position.y=0.8; g.add(body);
    const light = new THREE.PointLight(0xff8800, 0.7, 6); light.position.y=1.6; g.add(light);
  } else if(id==='printer') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2,1.8,1), mat(0x2a4a3a)); body.position.y=0.9; g.add(body);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(1,0.15,0.9), mat(0xffd54a)); slot.position.y=1.75; g.add(slot);
  }
  return g;
}
function renderExistingBuildings(idx) {
  const plot = LAND_PLOTS[idx];
  const placed = plotBuildings[plot.id] || [];
  const { cx, cz } = landPlotPos(idx);
  placed.forEach(entry => {
    const key = plot.id+'_'+entry.slot;
    if(PLOT_BUILDING_MESHES[key]) return; // already rendered
    const [ox,oz] = plot.slots[entry.slot];
    const extra = entry.id === 'customhouse' ? { size: entry.houseSize, material: entry.houseMaterial, color: landColor[plot.id] } : undefined;
    PLOT_BUILDING_MESHES[key] = buildStructureMesh(entry.id, cx+ox, cz+oz, extra);
  });
}
function openBuildMenu(idx) {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('buildOverlay').style.display = 'flex';
  renderBuildMenu(idx);
}
function closeBuildMenu() {
  document.getElementById('buildOverlay').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderBuildMenu(idx) {
  const plot = LAND_PLOTS[idx];
  const placed = plotBuildings[plot.id] || [];
  document.getElementById('buildPlotName').textContent = plot.name;
  document.getElementById('buildWood').textContent = woodCount;
  document.getElementById('buildSip').textContent = sipDollars;
  document.getElementById('buildSlotsUsed').textContent = placed.length;
  document.getElementById('buildSlotsTotal').textContent = plot.slots.length;
  const full = placed.length >= plot.slots.length;
  const cat = document.getElementById('buildCatalog');
  cat.innerHTML = '';
  BUILD_CATALOG.forEach((b) => {
    const canAfford = canAffordRecipe(b); // shared with crafting — handles wood/scrap/sip/mats uniformly
    const d = document.createElement('div'); d.className='shopItem';
    d.innerHTML = `<div class="siName">${b.emoji} ${b.name}</div>
      <div class="siCost">${craftCostText(b) || 'Free'}${b.produces?` — makes ${b.produces.amount} ${b.produces.type==='sip'?'S.I.P.':b.produces.type==='wood'?'Wood':'Scrap'} every ${b.produces.everySec}s`:''}</div>
      <button class="shopBtn" onclick="placeBuilding(${idx},'${b.id}')" ${(!canAfford||full)?'disabled':''}>${full?'Plot Full':'Build'}</button>`;
    cat.appendChild(d);
  });
  const placedList = document.getElementById('buildPlaced');
  placedList.innerHTML = '';
  if(placed.length===0) { placedList.innerHTML = '<div style="color:#789;font-size:12px;">Nothing built yet.</div>'; }
  placed.forEach((entry) => {
    // customhouse isn't a BUILD_CATALOG entry (it's the size/material system above) — build its
    // display info from the entry's own saved size/material instead.
    const isCustomHouse = entry.id === 'customhouse';
    const emoji = isCustomHouse ? HOUSE_MATERIALS[entry.houseMaterial].emoji : BUILD_CATALOG.find(b=>b.id===entry.id).emoji;
    const name = isCustomHouse ? `${entry.houseSize}x${entry.houseSize} ${HOUSE_MATERIALS[entry.houseMaterial].name} House` : BUILD_CATALOG.find(b=>b.id===entry.id).name;
    const d = document.createElement('div'); d.className='shopItem';
    d.innerHTML = `<div class="siName">${emoji} ${name}</div>
      <button class="shopBtn" style="background:#a33;" onclick="demolishBuilding(${idx},${entry.slot})">Demolish</button>`;
    placedList.appendChild(d);
  });

  document.getElementById('buildSitBtn').style.display = placed.some(p=>p.id==='bench') ? 'block' : 'none';

  const maxSize = maxHouseSizeForPlot(plot);
  document.getElementById('houseSizeButtons').innerHTML = HOUSE_SIZES.map(s => {
    const tooBig = s > maxSize;
    return `<button class="optBtn ${s===selectedHouseSize?'selected':''}" ${tooBig?'disabled':''} onclick="setHouseSize(${idx},${s})" style="padding:5px 8px;font-size:11px;${tooBig?'opacity:0.35;':''}" title="${tooBig?'Too big for this land':''}">${s}x${s}</button>`;
  }).join('');
  document.getElementById('houseMaterialButtons').innerHTML = Object.keys(HOUSE_MATERIALS).map(k => {
    const m = HOUSE_MATERIALS[k];
    return `<button class="optBtn ${k===selectedHouseMaterial?'selected':''}" onclick="setHouseMaterial(${idx},'${k}')" style="padding:5px 8px;font-size:11px;">${m.emoji} ${m.name}</button>`;
  }).join('');
  const effSize = Math.min(selectedHouseSize, maxSize);
  const houseCost = houseBuildCost(effSize, selectedHouseMaterial);
  document.getElementById('houseBuildCostText').textContent = `${effSize}x${effSize} ${HOUSE_MATERIALS[selectedHouseMaterial].name} house costs: ${craftCostText(houseCost) || 'Free'}`;

  document.getElementById('buildPaintSwatches').innerHTML = PAINT_SWATCHES.map(s =>
    `<button onclick="paintMyLand(${idx},${s.color})" title="${s.name}" style="width:26px;height:26px;border-radius:6px;border:2px solid #fff;background:#${s.color.toString(16).padStart(6,'0')};cursor:pointer;margin:3px;"></button>`
  ).join('');

  const forSale = landForSale[plot.id];
  document.getElementById('buildSaleStatus').textContent = forSale ? `Listed for ${forSale.toLocaleString()} S.I.P.` : 'Not for sale.';
  document.getElementById('buildSalePriceInput').value = forSale || '';

  const invites = landInvites[plot.id] || {};
  const names = Object.keys(invites);
  const inviteList = document.getElementById('buildInviteList');
  inviteList.innerHTML = names.length ? names.map(n => {
    const p = invites[n];
    const tags = ['sit','smash','paint','buy','kill'].filter(k=>p[k]).map(k=>k==='kill'?'Attack':k[0].toUpperCase()+k.slice(1)).join(', ') || 'view only';
    return `<div class="shopItem"><div class="siName">${n}</div><div class="siCost">${tags}</div><button class="shopBtn" style="background:#a33;" onclick="revokeLandInvite(${idx},'${n}')">Revoke</button></div>`;
  }).join('') : '<div style="color:#789;font-size:12px;">No one invited yet.</div>';

  const owners = getLandOwners();
  const openPlots = LAND_PLOTS.filter((p,i) => i!==idx && !owners[p.id]);
  const moveList = document.getElementById('buildMoveList');
  moveList.innerHTML = openPlots.length ? openPlots.map(p => {
    const i = LAND_PLOTS.indexOf(p);
    return `<div class="shopItem"><div class="siName">${p.name}</div><div class="siCost">${p.footprint}x${p.footprint} — ${p.slots.length} slots</div><button class="shopBtn" onclick="relocateLand(${idx},${i})">Move Here</button></div>`;
  }).join('') : '<div style="color:#789;font-size:12px;">No open plots to move to right now.</div>';

  window._buildCtxIdx = idx;
}
function placeBuilding(idx, buildingId) {
  const plot = LAND_PLOTS[idx];
  const def = BUILD_CATALOG.find(b=>b.id===buildingId);
  const placed = plotBuildings[plot.id] || (plotBuildings[plot.id] = []);
  if(placed.length >= plot.slots.length) { showNotif('🏗️ This plot is full!'); return; }
  if(!canAffordRecipe(def)) { showNotif(`❌ Need ${craftCostText(def)}`); return; }
  const usedSlots = placed.map(p=>p.slot);
  let slot = -1;
  for(let i=0;i<plot.slots.length;i++){ if(!usedSlots.includes(i)) { slot=i; break; } }
  if(def.wood) { woodCount -= def.wood; updateWood(); }
  if(def.sip)  { spendSip(def.sip); updateSIP(); }
  if(def.scrap) { scrapMetal -= def.scrap; updateScrapMetal(); }
  spendMats(def.mats);
  placed.push({ slot, id: buildingId, _t:0 });
  saveCurrentUser();
  const { cx, cz } = landPlotPos(idx);
  const [ox,oz] = plot.slots[slot];
  PLOT_BUILDING_MESHES[plot.id+'_'+slot] = buildStructureMesh(buildingId, cx+ox, cz+oz);
  sfx.buy();
  showNotif(`🏗️ Built ${def.emoji} ${def.name}!`);
  renderBuildMenu(idx);
}
function demolishBuilding(idx, slot) {
  const plot = LAND_PLOTS[idx];
  const placed = plotBuildings[plot.id] || [];
  const i = placed.findIndex(p=>p.slot===slot);
  if(i<0) return;
  placed.splice(i,1);
  saveCurrentUser();
  const key = plot.id+'_'+slot;
  if(PLOT_BUILDING_MESHES[key]) { scene.remove(PLOT_BUILDING_MESHES[key]); delete PLOT_BUILDING_MESHES[key]; }
  showNotif('🏗️ Demolished.');
  renderBuildMenu(idx);
}
// Passive machine production — only ever ticks the CURRENT account's OWN placed buildings (an
// account's plotBuildings only ever holds lots it currently owns, since buyLandFromOwner moves
// entries between accounts on transfer) — real production while playing, not true offline/idle.
let machineTimer = 0;
function tickMachines(dt) {
  machineTimer += dt;
  if (machineTimer < 15) return;
  machineTimer = 0;
  let any = false;
  Object.values(plotBuildings).forEach(placed => {
    placed.forEach(entry => {
      const def = BUILD_CATALOG.find(b=>b.id===entry.id);
      if (!def || !def.produces) return;
      entry._t = (entry._t||0) + 15;
      if (entry._t >= def.produces.everySec) {
        entry._t = 0;
        const p = def.produces;
        if (p.type==='sip') { queueEarning(p.amount, 0, def.name || 'Land Building'); }
        else if (p.type==='wood') { woodCount += p.amount; updateWood(); }
        else if (p.type==='scrap') { scrapMetal += p.amount; updateScrapMetal(); }
        showNotif(`${def.emoji} ${def.name} produced ${p.amount} ${p.type==='sip'?'S.I.P.':p.type==='wood'?'Wood':'Scrap'}!`);
        any = true;
      }
    });
  });
  if (any) saveCurrentUser();
}

// ─── THE SCRAPYARD — robot spawners + real fightable robots ──────────────────
const SCRAPYARD_CENTER = { x:300, z:250 };
const ROBOT_SPAWNERS = [
  { x:SCRAPYARD_CENTER.x-15, z:SCRAPYARD_CENTER.z,    maxRobots:2 },
  { x:SCRAPYARD_CENTER.x,    z:SCRAPYARD_CENTER.z-15, maxRobots:2 },
  { x:SCRAPYARD_CENTER.x+15, z:SCRAPYARD_CENTER.z,    maxRobots:2 },
];
const ROBOT_TYPES = [
  { id:'scout', name:'Scout Bot', hp:35, color:0x557799, reward:[15,30], yields:['Wire Bundle','Sensor Chip'], weight:4 },
  { id:'guard', name:'Guard Bot', hp:65, color:0x775555, reward:[35,55], yields:['Servo Motor','Power Core','Steel Plate'], weight:3 },
  { id:'drone', name:'Drone Bot', hp:20, color:0x33aadd, reward:[10,20], yields:['Antenna Piece','Fiber Optic Cable'], shape:'drone', speedMult:1.6, weight:4 },
  { id:'tank',  name:'Tank Bot',  hp:120,color:0x557755, reward:[60,90], yields:['Titanium Shard','Hydraulic Piston','Chrome Trim'], shape:'tank', speedMult:0.6, weight:2 },
  { id:'spider',name:'Spider Bot',hp:45, color:0x664477, reward:[20,35], yields:['Rusty Chain','Bent Spring','Zip Tie Bundle'], shape:'spider', speedMult:1.3, weight:3 },
  { id:'elite', name:'Elite Bot', hp:150,color:0x6a4a99, reward:[80,120],yields:['Gold Nugget','Microchip','Crystal Fragment'], shape:'elite', speedMult:1.0, weight:1 },
];
function pickRobotType() {
  const total = ROBOT_TYPES.reduce((s,t) => s+(t.weight||1), 0);
  let roll = Math.random()*total;
  for (const t of ROBOT_TYPES) { roll -= (t.weight||1); if (roll <= 0) return t; }
  return ROBOT_TYPES[ROBOT_TYPES.length-1];
}
let robots = []; // active robot instances — NOT persisted, ambient enemies that just respawn over time
let ROBOT_ID_SEQ = 0;
function buildRobotMesh(x, z, color, shape) {
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  const eyeMat = new THREE.MeshBasicMaterial({color:0xff3333});
  if (shape === 'drone') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55,10,8), mat(color)); body.position.y=1.6; g.add(body);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75,0.07,6,16), mat(0x223344)); ring.position.y=1.6; ring.rotation.x=Math.PI/2; g.add(ring);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.05), eyeMat); eyeL.position.set(-0.18,1.6,0.5); g.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.05), eyeMat); eyeR.position.set(0.18,1.6,0.5); g.add(eyeR);
    const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.05,0.5,0.05), mat(0x888888)); antenna.position.y=2.2; g.add(antenna);
    return g;
  }
  if (shape === 'tank') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6,1.3,1.2), mat(color)); body.position.y=1.0; g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.5,0.7), mat(0x223344)); head.position.y=1.85; g.add(head);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.05), eyeMat); eyeL.position.set(-0.2,1.85,0.38); g.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.05), eyeMat); eyeR.position.set(0.2,1.85,0.38); g.add(eyeR);
    [[-0.9,0.4],[0.9,0.4]].forEach(([tx,ty]) => { const tread=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,1.5,8), mat(0x1a1a1a)); tread.rotation.z=Math.PI/2; tread.position.set(tx,ty,0); g.add(tread); });
    return g;
  }
  if (shape === 'spider') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55,8,6), mat(color)); body.position.y=0.9; g.add(body);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.09,0.09,0.05), eyeMat); eyeL.position.set(-0.15,0.95,0.45); g.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.09,0.09,0.05), eyeMat); eyeR.position.set(0.15,0.95,0.45); g.add(eyeR);
    for (let i=0; i<6; i++) {
      const ang = (i/6)*Math.PI*2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.9,4), mat(0x333333));
      leg.position.set(Math.cos(ang)*0.55, 0.55, Math.sin(ang)*0.55);
      leg.rotation.z = Math.cos(ang)*0.9; leg.rotation.x = Math.sin(ang)*0.9;
      g.add(leg);
    }
    return g;
  }
  if (shape === 'elite') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1,1.6,0.9), mat(color)); body.position.y=1.1; g.add(body);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.15,0.15,0.95), mat(0xffd54a)); trim.position.y=1.85; g.add(trim);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.65,0.55,0.65), mat(0x223344)); head.position.y=2.2; g.add(head);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.11,0.11,0.05), eyeMat); eyeL.position.set(-0.16,2.2,0.36); g.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.11,0.11,0.05), eyeMat); eyeR.position.set(0.16,2.2,0.36); g.add(eyeR);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), new THREE.MeshBasicMaterial({color:0xffd54a})); core.position.set(0,1.1,0.46); g.add(core);
    const pl = new THREE.PointLight(0xffd54a, 0.8, 6); pl.position.set(0,1.1,0.5); g.add(pl);
    [[-0.7,1.0],[0.7,1.0]].forEach(([ax,ay]) => { const arm=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.75,0.22), mat(0x445566)); arm.position.set(ax,ay,0); g.add(arm); });
    return g;
  }
  // default (scout/guard) — original humanoid body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1,1.4,0.8), mat(color)); body.position.y=1.0; g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.6), mat(0x223344)); head.position.y=1.95; g.add(head);
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.05), eyeMat); eyeL.position.set(-0.15,1.95,0.33); g.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.05), eyeMat); eyeR.position.set(0.15,1.95,0.33); g.add(eyeR);
  const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.05,0.4,0.05), mat(0x888888)); antenna.position.y=2.4; g.add(antenna);
  [[-0.65,0.9],[0.65,0.9]].forEach(([ax,ay]) => { const arm=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.7,0.2), mat(0x445566)); arm.position.set(ax,ay,0); g.add(arm); });
  return g;
}
function buildSpawnerMesh(x, z) {
  // Every part uses MeshBasicMaterial (renders full-bright regardless of scene lighting) after the
  // old MeshLambertMaterial base (near-black 0x2a2a3a, needs direct light to show at all) turned out
  // to be the real cause of "invisible" spawners — it wasn't missing, just too dark/small to see.
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.6,0.6,8), new THREE.MeshBasicMaterial({color:0xff8800})); base.position.y=0.3; g.add(base);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.2,0.15,6,8), new THREE.MeshBasicMaterial({color:0x333344})); rim.position.y=0.62; rim.rotation.x=Math.PI/2; g.add(rim);
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.3), new THREE.MeshBasicMaterial({color:0x00ffcc, transparent:true, opacity:0.85})); core.position.y=2.2; g.add(core);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,6,6), new THREE.MeshBasicMaterial({color:0x00ffcc, transparent:true, opacity:0.5})); beam.position.y=5.2; g.add(beam);
  const pl = new THREE.PointLight(0x00ffcc, 2, 25); pl.position.y=2.2; g.add(pl);
  return g;
}
function trySpawnRobot(spawnerIdx) {
  const sp = ROBOT_SPAWNERS[spawnerIdx];
  const aliveCount = robots.filter(r => r.spawnerIdx===spawnerIdx && r.alive).length;
  if (aliveCount >= sp.maxRobots) return;
  const type = pickRobotType();
  const angle = Math.random()*Math.PI*2, dist = 3+Math.random()*2;
  const x = sp.x + Math.cos(angle)*dist, z = sp.z + Math.sin(angle)*dist;
  const mesh = buildRobotMesh(x, z, type.color, type.shape);
  // Robot Level (Quests panel) scales each freshly-spawned robot's own stats — baked into the
  // INSTANCE, never the shared `type` object, so leveling up never retroactively corrupts
  // already-spawned robots or other spawners' base stats.
  const mult = robotPowerMult();
  mesh.scale.setScalar(robotSizeMult());
  const col = addCol(CITY_COLS, x, z, 0.6, 0.6); // real reference kept so defeat can actually remove it (was a known stale-collider quirk, item 146)
  const hp = Math.round(type.hp * mult);
  const robot = { id:ROBOT_ID_SEQ++, x, z, hp, maxHp:hp, type, mesh, spawnerIdx, alive:true, zone:null, col,
    homeX:sp.x, homeZ:sp.z, wanderX:x, wanderZ:z, speed:(2+Math.random()*1.3)*(type.speedMult||1),
    powerMult:mult, rewardRange:[Math.round(type.reward[0]*mult), Math.round(type.reward[1]*mult)],
    eliteReward: Math.round((ELITE_COIN_REWARD[type.id]||0)*mult) };
  const zone = { x, z, r:2.8, label:`🤖 Fight ${type.name}`, action: () => fightRobot(robot) };
  robot.zone = zone;
  CITY_ZONES.push(zone);
  robots.push(robot);
}
function fightRobot(robot) {
  if(!robot.alive) { showNotif('That robot is already scrap.'); return; }
  const dmg = getRobotDamage();
  robot.hp -= dmg;
  triggerSwing();
  sfx.clang();
  startKnockback(playerGroup.position.x, playerGroup.position.z, robot.x, robot.z,
    (x, z) => { robot.x = x; robot.z = z; robot.mesh.position.set(x, 0, z); });

  if(robot.hp > 0) {
    showNotif(`🤖 Hit ${robot.type.name} for ${dmg}! (${robot.hp} HP left)`);
    if (!isEvilImmune()) {
      const backDmg = Math.round((6 + Math.random()*8) * robot.powerMult);
      damagePlayer(backDmg, robot.type.name);
    }
    return;
  }
  defeatRobot(robot);
}
// Extracted so a car ram (item 160) triggers the exact same real reward/wreckage/respawn as melee.
function defeatRobot(robot) {
  robot.alive = false;
  scene.remove(robot.mesh);
  const zi = CITY_ZONES.indexOf(robot.zone); if(zi>-1) CITY_ZONES.splice(zi,1);
  // Real fix to a known pre-existing quirk (item 146): the collider was never removed on defeat,
  // leaving an invisible stale wall where the robot used to stand. Now genuinely removed too.
  if (robot.col) { const ci = CITY_COLS.indexOf(robot.col); if (ci>-1) CITY_COLS.splice(ci,1); }
  const [lo,hi] = robot.rewardRange;
  const reward = lo + Math.floor(Math.random()*(hi-lo+1));
  const eliteReward = robot.eliteReward;
  queueEarning(reward, eliteReward, robot.type.name);
  sfx.boom();
  showNotif(`🤖💥 ${robot.type.name} destroyed! +${reward} S.I.P.${eliteReward ? ` +${eliteReward} 💎` : ''}`);
  buildWreckage(robot.x, robot.z, robot.type); // leaves real scrap behind — take it to the Grinder for materials
  lifetimeRobotKills++;
  // The spawner sends out a replacement after a real cooldown, same idea as item 135's tree respawn.
  setTimeout(() => trySpawnRobot(robot.spawnerIdx), 7000);
}

// ── ROGUE ROBOTS (item 156) — genuinely different from the ambient Scrapyard/global-spawner
// robots above: these aren't tied to a spawner, they roam far into the city, actively chase the
// player once one appears, and attack for real without you pressing E first — "for no reason". ──
let rogueRobots = []; // NOT persisted — {id,type,mesh,x,z,hp,maxHp,alive,speed,attackTimer}
let rogueTimer = 0;
const ROGUE_ROBOT_SPEED = 1000/60; // user's own ask: "1km per min" — 1000m/60s, same unit scale as every other speed constant in the file

// Real bug fix: this used to spawn the robot 40-80 units from the PLAYER directly — it just
// popped into existence nearby with no real origin, which read as "teleporting in." Now it spawns
// at whichever of the real ROBOT_SPAWNERS (item 148's 100 scattered spawners) is actually closest
// to the player and has to genuinely walk the real distance from there to reach you.
function spawnRogueRobot() {
  if (!ROBOT_SPAWNERS.length) return;
  let closest = ROBOT_SPAWNERS[0], closestDist = Infinity;
  ROBOT_SPAWNERS.forEach(sp => {
    const d = Math.hypot(playerGroup.position.x-sp.x, playerGroup.position.z-sp.z);
    if (d < closestDist) { closestDist = d; closest = sp; }
  });
  const type = pickRobotType();
  const mesh = buildRobotMesh(closest.x, closest.z, type.color, type.shape);
  const mult = robotPowerMult();
  mesh.scale.setScalar(robotSizeMult());
  const hp = Math.round(type.hp * mult);
  rogueRobots.push({ id:'rogue'+ROBOT_ID_SEQ++, x:closest.x, z:closest.z, hp, maxHp:hp, type, mesh, alive:true, speed:ROGUE_ROBOT_SPEED, attackTimer:0,
    powerMult:mult, rewardRange:[Math.round(type.reward[0]*mult), Math.round(type.reward[1]*mult)],
    eliteReward: Math.round((ELITE_COIN_REWARD[type.id]||0)*mult) });
  showNotif(`⚠️ A ${type.name} broke off from a nearby spawner and is coming for you!`);
}
function tickRogueRobots(dt) {
  rogueTimer += dt;
  const outdoors = !inHouse && !inMall && !inHotel && !inStore && !inFriendHouse && !inLandHouse && !inCountryHotel && !inAirportLounge && !inPrison && !inArcade && !inCar && !inArenaBattle && !inMovieFight && !inBankInterior && !inSportsPark && !inHospital && !inSea;
  if (rogueTimer >= 20) {
    rogueTimer = 0;
    if (outdoors && rogueRobots.filter(r=>r.alive).length < 5) spawnRogueRobot();
  }
  if (!outdoors) return;
  rogueRobots.forEach(r => {
    if (!r.alive) return;
    const dx = playerGroup.position.x-r.x, dz = playerGroup.position.z-r.z;
    const dist = Math.hypot(dx,dz);
    if (dist < 2.5) {
      r.attackTimer += dt;
      if (r.attackTimer > 1.5) {
        r.attackTimer = 0;
        if (!isEvilImmune()) damagePlayer(Math.round((6+Math.floor(Math.random()*8))*r.powerMult), r.type.name+' (Rogue)');
      }
    } else {
      // Always closes the real distance now — spawning at the nearest real spawner (above) means
      // it's never absurdly far away, so the old 250-unit chase cap was just cutting the "walks to
      // you, not teleports" mechanic short; removed so it genuinely always makes its way to you.
      r.x += dx/dist*r.speed*dt;
      r.z += dz/dist*r.speed*dt;
      r.mesh.position.set(r.x, 0, r.z);
      r.mesh.rotation.y = Math.atan2(dx, dz);
    }
  });
}
function fightRogueRobot(robot) {
  if (!robot.alive) return;
  const dmg = getRobotDamage();
  robot.hp -= dmg;
  triggerSwing();
  startKnockback(playerGroup.position.x, playerGroup.position.z, robot.x, robot.z,
    (x, z) => { robot.x = x; robot.z = z; robot.mesh.position.set(x, 0, z); });
  sfx.clang();
  if (robot.hp > 0) {
    showNotif(`⚔️ Hit the rogue ${robot.type.name} for ${dmg}! (${robot.hp} HP left)`);
    return;
  }
  defeatRogueRobot(robot);
}
// Extracted so a car ram (item 160) triggers the same real reward as melee.
function defeatRogueRobot(robot) {
  robot.alive = false;
  scene.remove(robot.mesh);
  const [lo,hi] = robot.rewardRange;
  const reward = lo + Math.floor(Math.random()*(hi-lo+1));
  const eliteReward = robot.eliteReward;
  queueEarning(reward, eliteReward, robot.type.name);
  sfx.boom();
  showNotif(`💥 Defeated the rogue ${robot.type.name}! +${reward} S.I.P.${eliteReward ? ` +${eliteReward} 💎` : ''}`);
  lifetimeRogueKills++;
}

// ── Killers — no spawner, no warning notification, they're just suddenly there ────────────────
// User's own ask: "killers with no sign they just come at you." Unlike a rogue robot (which
// announces itself with a "⚠️ incoming!" notification and visibly walks in all the way from a
// real spawner), a Killer spawns silently at a real random point out in the city and its mesh
// stays completely invisible (mesh.visible=false) the whole time it's closing in — the only
// "warning" is genuinely just seeing it once it's already within KILLER_REVEAL_RANGE. Armed
// with a dagger (a real prop mesh, not just a text label) and tanky at a flat 200 HP — a real
// fight, not a quick mob — but a defeat pays out purely in Elite Coins, no S.I.P. at all.
let killers = []; // NOT persisted — {id,mesh,x,z,hp,maxHp,alive,speed,attackTimer,revealed}
let killerTimer = 0;
const KILLER_REVEAL_RANGE = 7, KILLER_ATTACK_RANGE = 2.5, KILLER_ATTACK_INTERVAL = 1.1;
const KILLER_HP = 200, KILLER_REWARD_ELITE = 500;
// User's own follow-up: "you see them more if you kill them, if not they're pretty rare." Both
// scale off the real persisted killerDefeats count — a fresh account waits a long 90s between
// checks and only ever sees 1 at a time; by 25 real defeats that's down to a 30s check with up
// to 4 active at once. Floors/caps keep it from ever being either instant or unbounded.
function killerSpawnInterval() { return Math.max(30, 90 - killerDefeats*3); }
function killerMaxActive() { return Math.min(4, 1 + Math.floor(killerDefeats/8)); }
// ─── ROBBERS — user's own ask: "robbers". A petty-crime counterpart to the assassin-tier ambient
// Killer above — same shared killers[] array/mesh/fight infrastructure (a 4th mode alongside
// guardKiller/hitTargetName/ambient), flagged `robber:true`. Low HP (easy to scare off if you
// catch one in time), and instead of dealing damage they make one grab at your WALLET (not the
// bank — a real reason to keep money deposited) then flee. Catch them before the grab and you get
// a bounty; catch them after, you don't get the money back, but they're stopped for good.
let robberTimer = 0;
const ROBBER_SPAWN_INTERVAL = 45, ROBBER_MAX_ACTIVE = 3;
const ROBBER_HP = 40, ROBBER_REVEAL_RANGE = 20, ROBBER_ATTACK_RANGE = 2.5;
const ROBBER_STEAL_PCT_MIN = 0.15, ROBBER_STEAL_PCT_MAX = 0.25;
const ROBBER_BOUNTY_MIN = 100; // floor so beating a robber while nearly broke still means something
// User's own ask: "kill the robber to get alot ove money like 15% of your money" — the same real
// percentage a robber's own theft roll uses (ROBBER_STEAL_PCT_MIN above), so beating one is a real
// mirror of what they'd have taken, not a flat token amount that stops mattering once you're rich.
const ROBBER_KILL_REWARD_PCT = 0.15;
// Guard Bank Job (item 215/217 follow-up), user's own ask: "alot of killers attack the bank" while
// on a Guard shift, and "you get nothing from the killers" — defeating one of these pays zero,
// unlike an ambient Killer's normal 500💎 (see defeatKiller() below), since the point is defending
// the bank as part of the job, not farming loot through it. These share the exact same `killers`
// array/mesh/movement code as ambient Killers (just tagged `guardKiller:true`) so the existing
// interact-priority loop still lets the player fight them directly for free — but their COMBAT
// targeting is entirely separate (see tickGuardKillerCombat below): a later correction from the
// user — "the bad guys attack the bank not you" — means a guard killer never touches the player at
// all any more, only the Bank's own health or a Coin Bot defender.
let guardKillerTimer = 0;
const GUARD_KILLER_SPAWN_INTERVAL = 6, GUARD_KILLER_MAX_ACTIVE = 5;
const BANK_ATTACK_POS = { x:160, z:214 }; // just outside the real City Bank entrance (160,218)/building (160,210)

// The Bank's own health — a real structure the Guard shift is defending, entirely separate from
// the player's own HP. Not persisted (resets to full at the start of every Guard shift, same
// category of state as the guard killers/coin bots themselves).
let bankHealth = 0, bankMaxHealth = 2000;
function resetBankHealth() { bankHealth = bankMaxHealth; } // displayed live via tickBankJob()'s own jobHud text, no separate UI push needed
// Real consequence if the killers win — the shift ends early with no payout (Guard is a
// lump-sum-at-the-end job, so failing before `durationSec` naturally means nothing was ever
// queued). Same cleanup shape as a normal shift-end/quit.
function failGuardShift() {
  if (!activeBankJob || activeBankJob.job.id !== 'guard') return;
  showNotif('🚨 The bank was breached! Guard shift failed — no pay.');
  sfx.alarm();
  activeBankJob = null;
  document.getElementById('jobHud').textContent = '💼 No Job';
  document.getElementById('jobHud').style.color = '#fff';
  clearGuardKillers();
  clearCoinBots();
  clearPoliceHelpers();
  resetBankHealth();
  renderJobsPanel();
}
function spawnGuardKiller() {
  const ang = Math.random()*Math.PI*2, dist = 6+Math.random()*12;
  const x = BANK_ATTACK_POS.x + Math.cos(ang)*dist;
  const z = BANK_ATTACK_POS.z + Math.sin(ang)*dist;
  const mesh = buildKillerMesh(x, z);
  mesh.visible = true; // no stealth reveal here — you know they're coming for the Bank
  const atkInterval = KILLER_ATTACK_INTERVAL * (0.8 + Math.random()*0.5);
  killers.push({ id:'killer'+ROBOT_ID_SEQ++, x, z, hp:KILLER_HP, maxHp:KILLER_HP, mesh, alive:true, speed:3.5+Math.random()*2, attackTimer:0, atkInterval, revealed:true, guardKiller:true });
}
function clearGuardKillers() {
  killers.filter(k => k.guardKiller && k.alive).forEach(k => { k.alive = false; scene.remove(k.mesh); });
  guardKillerTimer = 0;
}

// ── Bank Wall — user's own ask: "shoot down from the walls." A real elevated vantage point (not
// just a flag): the staircase built onto the Bank's east side (see buildCity's CITY BANK block)
// snaps the player up onto the front parapet, directly overlooking BANK_ATTACK_POS below. Only
// useful — and only reachable — during a Guard shift, since that's the only time there's anything
// down there to shoot at. Movement freezes while up there (same `!onBankWall` guard added to the
// animate loop's move/jump blocks as `!inCar`/`!playerSeated` already use) and E fires a ranged
// shot at the nearest guard killer instead of the usual melee fightKiller().
let onBankWall = false; // NOT persisted — ephemeral vantage state, same category as inCar/playerSeated
const BANK_WALL_POS = { x:160, z:213, y:19.5 };       // atop the roof, just behind the front parapet
const BANK_WALL_STAIR_BASE = { x:180, z:210 };        // ground spot at the foot of the built staircase
const BANK_WALL_SHOOT_RANGE = 45;                     // generous — you're overlooking the whole attack area from above
function climbBankWall() {
  if (!activeBankJob || activeBankJob.job.id !== 'guard') { showNotif('❌ Only worth climbing during a Guard shift — nothing to shoot at otherwise.'); return; }
  onBankWall = true;
  playerGroup.position.set(BANK_WALL_POS.x, BANK_WALL_POS.y, BANK_WALL_POS.z);
  jumpVel = 0; onGround = true;
  showNotif('🪜 You climb up onto the Bank wall. [E] Shoot the nearest attacker, or climb down once the coast is clear.');
}
function climbDownBankWall() {
  if (!onBankWall) return;
  onBankWall = false;
  playerGroup.position.set(BANK_WALL_STAIR_BASE.x, 0, BANK_WALL_STAIR_BASE.z);
  jumpVel = 0; onGround = true;
  showNotif('🪜 You climb back down off the wall.');
}
function shootFromWall() {
  let target = null, bestDist = Infinity;
  killers.forEach(k => {
    if (!k.alive || !k.guardKiller) return;
    const d = Math.hypot(k.x - BANK_WALL_POS.x, k.z - BANK_WALL_POS.z);
    if (d < bestDist) { bestDist = d; target = k; }
  });
  if (!target || bestDist > BANK_WALL_SHOOT_RANGE) { climbDownBankWall(); return; } // nothing left to shoot — E climbs back down instead
  const dmg = getWeaponDamage();
  target.hp -= dmg;
  fireWarShot(BANK_WALL_POS.x, BANK_WALL_POS.y, BANK_WALL_POS.z, target.x, target.z);
  sfx.laser();
  if (target.hp > 0) { showNotif(`🏹 Shot the attacker for ${dmg} from the wall! (${target.hp}/${target.maxHp} HP left)`); return; }
  defeatKiller(target);
}

// ── Coin Bots — Guard's "Call for Backup" ability (30s cooldown) ───────────────────────────────
// User's own spec, verbatim: 10 of them, 50 HP, 100 damage, look "like a giant credit card with
// limbs and eyes, blue, ten times bigger than you." Built at ~human proportions then scaled 10x as
// a whole group so that multiplier is exact, not eyeballed. They're allies, not enemies — they
// never target the player, only the nearest guardKiller, and fight entirely on their own once
// summoned (no further player input), same autonomous-combat shape as the guard killers themselves.
let coinBots = []; // NOT persisted — {id,mesh,x,z,hp,maxHp,alive,attackTimer}
let backupReadyAt = 0;
const BACKUP_COOLDOWN = 30, COINBOT_COUNT = 10, COINBOT_HP = 50, COINBOT_DAMAGE = 100;
const COINBOT_ATTACK_RANGE = 6, COINBOT_ATTACK_INTERVAL = 1.5, COINBOT_SPEED = 2.5;
function buildCoinBotMesh(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const blue = 0x2266ee, blueDark = 0x1a4fc0;
  const mk = (w,h,d,color,px,py,pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color})); m.position.set(px,py,pz); m.castShadow = true; g.add(m); return m; };
  mk(1.0,1.6,0.15, blue, 0,0.9,0);            // the "card" body
  mk(1.0,0.18,0.17, blueDark, 0,1.25,0.01);   // a magnetic-stripe detail band
  const eyeMat = new THREE.MeshBasicMaterial({color:0xffffff});
  const pupilMat = new THREE.MeshBasicMaterial({color:0x111111});
  [-0.22,0.22].forEach(ex => {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.22,0.22,0.05), eyeMat); e.position.set(ex,0.75,0.09); g.add(e);
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.09,0.09,0.05), pupilMat); p.position.set(ex,0.75,0.13); g.add(p);
  });
  mk(0.18,0.55,0.18, blue,-0.62,0.85,0); mk(0.18,0.55,0.18, blue,0.62,0.85,0); // arms
  mk(0.2,0.5,0.2, blueDark,-0.28,0.25,0); mk(0.2,0.5,0.2, blueDark,0.28,0.25,0); // legs
  g.scale.set(10,10,10); // "ten times bigger than you" — a group scale, so it's exact
  scene.add(g);
  return g;
}
function spawnCoinBot(i) {
  const ang = (i/COINBOT_COUNT)*Math.PI*2, dist = 25+Math.random()*10; // an even ring around the Bank — 10 giant bodies need real spacing
  const x = BANK_ATTACK_POS.x + Math.cos(ang)*dist;
  const z = BANK_ATTACK_POS.z + Math.sin(ang)*dist;
  const mesh = buildCoinBotMesh(x, z);
  coinBots.push({ id:'coinbot'+ROBOT_ID_SEQ++, x, z, hp:COINBOT_HP, maxHp:COINBOT_HP, mesh, alive:true, attackTimer:0 });
}
function callBackup() {
  if (!activeBankJob || activeBankJob.job.id !== 'guard') { showNotif('❌ Backup is only available while on Guard duty.'); return; }
  const remaining = backupReadyAt - clock.getElapsedTime();
  if (remaining > 0) { showNotif(`📣 Backup still on cooldown (${Math.ceil(remaining)}s)`); return; }
  backupReadyAt = clock.getElapsedTime() + BACKUP_COOLDOWN;
  for (let i = 0; i < COINBOT_COUNT; i++) spawnCoinBot(i);
  showNotif(`📣 Backup called! ${COINBOT_COUNT} Coin Bots are defending the bank!`);
  sfx.power();
  renderJobsPanel();
}
function defeatCoinBot(bot) {
  bot.alive = false;
  scene.remove(bot.mesh);
}
function clearCoinBots() {
  coinBots.forEach(b => { if (b.alive) { b.alive = false; scene.remove(b.mesh); } });
  coinBots = [];
  backupReadyAt = 0;
}
function tickCoinBots(dt) {
  if (!activeBankJob || activeBankJob.job.id !== 'guard') {
    if (coinBots.length) clearCoinBots();
    return;
  }
  coinBots.forEach(b => {
    if (!b.alive) return;
    let target = null, bestDist = Infinity;
    killers.forEach(k => { if (!k.alive || !k.guardKiller) return; const d = Math.hypot(k.x-b.x, k.z-b.z); if (d < bestDist) { bestDist = d; target = k; } });
    if (!target) return; // nothing to fight right now — stand guard
    if (bestDist < COINBOT_ATTACK_RANGE) {
      b.attackTimer += dt;
      if (b.attackTimer > COINBOT_ATTACK_INTERVAL) {
        b.attackTimer = 0;
        target.hp -= COINBOT_DAMAGE;
        if (target.hp <= 0) defeatKiller(target);
      }
    } else {
      const dx = target.x-b.x, dz = target.z-b.z, d = Math.hypot(dx,dz);
      b.x += dx/d*COINBOT_SPEED*dt; b.z += dz/d*COINBOT_SPEED*dt;
      b.mesh.position.set(b.x, 0, b.z);
      b.mesh.rotation.y = Math.atan2(dx, dz);
    }
  });
}

// ── Police Backup — user's follow-up: "police help protect too." Unlike Coin Bots (an explicit
// limited-use ability the player triggers), officers show up on their own as a steady passive
// reinforcement for the whole Guard shift — one more every POLICE_SPAWN_INTERVAL, capped at
// POLICE_MAX_ACTIVE. Deliberately a brand new, ephemeral, non-persisted array/mesh — NOT the real
// Cruz/Park/Blake NPCs from the Police Station (who are permanent, hand-placed, and whose only
// existing "defeat" path in this file is the PERMANENT one used against the player — reusing that
// for disposable Guard-shift combat would risk actually deleting one of the game's 3 named cops
// for good). Reuses the same 60 HP officers already carry as their established stat in `attackNPC`.
let policeHelpers = []; // NOT persisted — {id,mesh,x,z,hp,maxHp,alive,attackTimer}
let policeSpawnTimer = 0;
const POLICE_SPAWN_INTERVAL = 15, POLICE_MAX_ACTIVE = 3, POLICE_HP = 60, POLICE_DAMAGE = 25;
const POLICE_ATTACK_RANGE = 6, POLICE_ATTACK_INTERVAL = 1.2, POLICE_SPEED = 3.5;
function buildPoliceHelperMesh(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const uniform = 0x1a2a55, uniformDark = 0x223366, skin = 0xe0b090;
  const mk = (w,h,d,color,px,py,pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color})); m.position.set(px,py,pz); m.castShadow = true; g.add(m); return m; };
  mk(0.9,1.1,0.5, uniform, 0,1.75,0); // torso
  mk(1,1,1, skin, 0,2.8,0); // head
  mk(1.0,0.15,1.0, uniformDark, 0,3.35,0); mk(0.85,0.3,0.85, uniform, 0,3.2,0); // police cap
  mk(0.3,0.06,0.3, 0xFFD700, 0,3.15,0.45); // badge
  mk(0.35,0.9,0.35, uniform,-0.65,1.75,0); mk(0.35,0.9,0.35, uniform,0.65,1.75,0); // arms
  mk(0.38,0.9,0.38, uniformDark,-0.22,0.75,0); mk(0.38,0.9,0.38, uniformDark,0.22,0.75,0); // legs
  scene.add(g);
  return g;
}
function spawnPoliceHelper() {
  const ang = Math.random()*Math.PI*2, dist = 10+Math.random()*15;
  const x = BANK_ATTACK_POS.x + Math.cos(ang)*dist;
  const z = BANK_ATTACK_POS.z + Math.sin(ang)*dist;
  const mesh = buildPoliceHelperMesh(x, z);
  policeHelpers.push({ id:'police'+ROBOT_ID_SEQ++, x, z, hp:POLICE_HP, maxHp:POLICE_HP, mesh, alive:true, attackTimer:0 });
}
function defeatPoliceHelper(p) {
  p.alive = false;
  scene.remove(p.mesh);
}
function clearPoliceHelpers() {
  policeHelpers.forEach(p => { if (p.alive) { p.alive = false; scene.remove(p.mesh); } });
  policeHelpers = [];
  policeSpawnTimer = 0;
}
function tickPoliceHelpers(dt) {
  if (!activeBankJob || activeBankJob.job.id !== 'guard') {
    if (policeHelpers.length) clearPoliceHelpers();
    return;
  }
  policeSpawnTimer += dt;
  if (policeSpawnTimer >= POLICE_SPAWN_INTERVAL) {
    policeSpawnTimer = 0;
    if (policeHelpers.filter(p=>p.alive).length < POLICE_MAX_ACTIVE) spawnPoliceHelper();
  }
  policeHelpers.forEach(p => {
    if (!p.alive) return;
    let target = null, bestDist = Infinity;
    killers.forEach(k => { if (!k.alive || !k.guardKiller) return; const d = Math.hypot(k.x-p.x, k.z-p.z); if (d < bestDist) { bestDist = d; target = k; } });
    if (!target) return; // nothing to fight right now — stand guard
    if (bestDist < POLICE_ATTACK_RANGE) {
      p.attackTimer += dt;
      if (p.attackTimer > POLICE_ATTACK_INTERVAL) {
        p.attackTimer = 0;
        target.hp -= POLICE_DAMAGE;
        if (target.hp <= 0) defeatKiller(target);
      }
    } else {
      const dx = target.x-p.x, dz = target.z-p.z, d = Math.hypot(dx,dz);
      p.x += dx/d*POLICE_SPEED*dt; p.z += dz/d*POLICE_SPEED*dt;
      p.mesh.position.set(p.x, 0, p.z);
      p.mesh.rotation.y = Math.atan2(dx, dz);
    }
  });
}

function buildKillerMesh(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const dark = 0x0a0a0a;
  const mk = (w,h,d,color,px,py,pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color})); m.position.set(px,py,pz); m.castShadow = true; g.add(m); return m; };
  mk(1,1,1, dark, 0,2.8,0); // head
  const eyeMat = new THREE.MeshBasicMaterial({color:0xff0000});
  [-0.22,0.22].forEach(ex => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.14,0.14,0.05), eyeMat); e.position.set(ex,2.85,0.51); g.add(e); });
  mk(1.15,0.35,1.1, dark, 0,3.35,0); // hood
  mk(0.9,1.1,0.5, dark, 0,1.75,0); // torso
  mk(0.35,0.9,0.35, dark,-0.65,1.75,0); mk(0.35,0.9,0.35, dark,0.65,1.75,0); // arms
  mk(0.38,0.9,0.38, dark,-0.22,0.75,0); mk(0.38,0.9,0.38, dark,0.22,0.75,0); // legs
  mk(0.42,0.22,0.5, dark,-0.22,0.1,0.05); mk(0.42,0.22,0.5, dark,0.22,0.1,0.05); // feet
  // Dagger, held forward at the right hand — a real prop so the weapon reads visually, not
  // just in the attack text.
  const blade = mk(0.08,0.55,0.1, 0xc0c0c0, 0.65,1.32,0.28); blade.rotation.x = -0.5;
  const hilt = mk(0.14,0.2,0.14, 0x3a2a1a, 0.65,1.05,0.15); hilt.rotation.x = -0.5;
  // A real nametag like other players get would show a real name — this one deliberately shows
  // a glitchy "UNKNOWN" tag instead, since nobody's supposed to know who or what this is.
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const cx2 = cv.getContext('2d');
  cx2.fillStyle = 'rgba(20,0,0,0.75)'; cx2.fillRect(0,16,256,32);
  cx2.fillStyle = '#ff2222'; cx2.font = 'bold 24px monospace'; cx2.textAlign = 'center';
  cx2.fillText('▓▓ UNKNOWN ▓▓', 128, 40);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(2.4,0.6), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  tag.position.y = 4.5; g.add(tag);
  scene.add(g);
  return g;
}
function buildRobberMesh(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const mk = (w,h,d,color,px,py,pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color})); m.position.set(px,py,pz); m.castShadow = true; g.add(m); return m; };
  mk(0.9,0.9,0.9, 0xd9b38c, 0,2.7,0);            // head
  mk(0.3,0.15,0.95, 0x222222, 0,2.95,0.15);      // bandit eye mask
  mk(0.9,1.1,0.5, 0x5a4a3a, 0,1.7,0);            // torso — drab jacket, not an assassin's black
  mk(0.35,0.9,0.35, 0x5a4a3a,-0.65,1.7,0); mk(0.35,0.9,0.35, 0x5a4a3a,0.65,1.7,0); // arms
  mk(0.38,0.9,0.38, 0x3a3025,-0.22,0.7,0); mk(0.38,0.9,0.38, 0x3a3025,0.22,0.7,0); // legs
  mk(0.42,0.22,0.5, 0x3a3025,-0.22,0.05,0.05); mk(0.42,0.22,0.5, 0x3a3025,0.22,0.05,0.05); // feet
  const sack = mk(0.5,0.6,0.5, 0x8a7355, -0.8,2.0,0.15); sack.rotation.z = 0.35; // loot sack
  scene.add(g);
  return g;
}
function spawnRobber() {
  const ang = Math.random()*Math.PI*2, dist = 25+Math.random()*15;
  const x = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, playerGroup.position.x+Math.cos(ang)*dist));
  const z = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, playerGroup.position.z+Math.sin(ang)*dist));
  const mesh = buildRobberMesh(x, z);
  mesh.visible = false;
  if (Date.now() < satanBadUntil) demonizeMesh(mesh);
  killers.push({ id:'robber'+ROBOT_ID_SEQ++, x, z, hp:ROBBER_HP, maxHp:ROBBER_HP, mesh, alive:true, speed:4+Math.random()*1.5, revealed:false, robber:true, fleeing:false });
}
// "5x bad entites" — Satan won this round, so newly-spawned Killers/Robbers get a demonic
// recolor (dark red/black + a red glow) instead of their normal look. Purely visual — same
// hp/dmg/AI as always, just a real reason for "demons" to actually look different on-screen.
function demonizeMesh(mesh) {
  mesh.traverse(o => { if (o.isMesh && o.material && o.material.color && (!o.geometry || o.geometry.type !== 'PlaneGeometry')) o.material.color.setHex(0x220000); });
  const glow = new THREE.PointLight(0xff0000, 1.5, 8); glow.position.y = 3; mesh.add(glow);
}
function robMoney(k) {
  const stolen = Math.round(sipDollars * (ROBBER_STEAL_PCT_MIN + Math.random()*(ROBBER_STEAL_PCT_MAX-ROBBER_STEAL_PCT_MIN)));
  sipDollars = Math.max(0, sipDollars - stolen);
  updateSIP();
  showNotif(`🥷 A robber snatched ${stolen.toLocaleString()} S.I.P. right out of your wallet and ran off!`);
  sfx.nope();
  k.fleeing = true;
}
function tickRobberCombat(k, dt) {
  if (k.fleeing) {
    const dx = k.x-playerGroup.position.x, dz = k.z-playerGroup.position.z, dist = Math.hypot(dx,dz) || 0.01;
    if (dist > 40) { k.alive = false; scene.remove(k.mesh); return; }
    k.x += dx/dist*k.speed*1.4*dt; k.z += dz/dist*k.speed*1.4*dt;
    k.mesh.position.set(k.x, 0, k.z);
    k.mesh.rotation.y = Math.atan2(-dx, -dz);
    return;
  }
  const dx = playerGroup.position.x-k.x, dz = playerGroup.position.z-k.z, dist = Math.hypot(dx,dz);
  if (!k.revealed && dist <= ROBBER_REVEAL_RANGE) { k.revealed = true; k.mesh.visible = true; }
  if (dist < ROBBER_ATTACK_RANGE) {
    if (!isEvilImmune()) robMoney(k);
  } else {
    k.x += dx/dist*k.speed*dt; k.z += dz/dist*k.speed*dt;
    k.mesh.position.set(k.x, 0, k.z);
    k.mesh.rotation.y = Math.atan2(dx, dz);
  }
}
function fightRobber(k) {
  if (!k.alive) return;
  const dmg = getWeaponDamage();
  k.hp -= dmg;
  triggerSwing();
  startKnockback(playerGroup.position.x, playerGroup.position.z, k.x, k.z,
    (x, z) => { k.x = x; k.z = z; k.mesh.position.set(x, 0, z); });
  sfx.clang();
  if (k.hp > 0) { showNotif(`⚔️ Hit the robber for ${dmg}! (${k.hp}/${k.maxHp} HP left)`); return; }
  defeatRobber(k);
}
function defeatRobber(k) {
  k.alive = false;
  scene.remove(k.mesh);
  totalKills++; checkWrathTrigger();
  const badLuck = Date.now() < satanBadUntil;
  const reward = Math.round(Math.max(ROBBER_BOUNTY_MIN, Math.round(sipDollars * ROBBER_KILL_REWARD_PCT)) * (badLuck ? 0.5 : 1));
  if (k.fleeing) {
    queueEarning(reward, 0, 'Caught a robber');
    showNotif(`🥷 Too late to get back what THIS robber already took, but you shook ${reward} S.I.P. loose off them for the trouble!`);
    sfx.boom();
    return;
  }
  queueEarning(reward, 0, 'Caught a robber');
  showNotif(`🥷 Caught the robber before they could steal anything! +${reward} S.I.P.`);
  sfx.boom();
}
function spawnKiller() {
  const ang = Math.random()*Math.PI*2, dist = 30+Math.random()*20;
  const x = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, playerGroup.position.x+Math.cos(ang)*dist));
  const z = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, playerGroup.position.z+Math.sin(ang)*dist));
  const mesh = buildKillerMesh(x, z);
  mesh.visible = false; // hidden until it closes to KILLER_REVEAL_RANGE — no sign it's coming
  // Real bug the user caught: every killer shared the exact same KILLER_ATTACK_INTERVAL and
  // started attackTimer at 0, so once killerMaxActive() allows 2+ at a time (item 208), a pair
  // that both entered melee range around the same moment stayed locked in perfect sync forever —
  // every future hit landed on the SAME tick, turning "two independent threats" into a scripted
  // double-hit combo. Each killer now gets its own randomized cadence so they drift apart instead.
  const atkInterval = KILLER_ATTACK_INTERVAL * (0.8 + Math.random()*0.5);
  if (Date.now() < satanBadUntil) demonizeMesh(mesh); // "more demons" — Satan won this round, so what spawns looks the part
  killers.push({ id:'killer'+ROBOT_ID_SEQ++, x, z, hp:KILLER_HP, maxHp:KILLER_HP, mesh, alive:true, speed:3.5+Math.random()*2, attackTimer:0, atkInterval, revealed:false });
}
// Combat for an ambient Killer — always targets the player. Unchanged behavior from before this
// session's Guard-duty split, just extracted into its own function.
function tickAmbientKillerCombat(k, dt) {
  const dx = playerGroup.position.x-k.x, dz = playerGroup.position.z-k.z;
  const dist = Math.hypot(dx,dz);
  if (!k.revealed && dist <= KILLER_REVEAL_RANGE) { k.revealed = true; k.mesh.visible = true; sfx.tense(); }
  if (dist < KILLER_ATTACK_RANGE) {
    k.attackTimer += dt;
    if (k.attackTimer > k.atkInterval) {
      k.attackTimer = 0;
      if (!isEvilImmune()) damagePlayer(8+Math.floor(Math.random()*8), "a Killer's dagger");
    }
  } else {
    k.x += dx/dist*k.speed*dt; k.z += dz/dist*k.speed*dt;
    k.mesh.position.set(k.x, 0, k.z);
    k.mesh.rotation.y = Math.atan2(dx, dz);
  }
}
// Combat for a Guard-shift Killer — user's correction: "the bad guys attack the bank not you."
// Never touches the player at all. Prefers attacking the nearest Coin Bot defender within range
// (see tickCoinBots above); otherwise its real goal is BANK_ATTACK_POS itself, chipping away at
// bankHealth on the same attack cadence ambient Killers use against the player, just with bigger
// numbers since a whole building has far more effective HP than one person.
// Finds the nearest living defender (Coin Bot or Police Backup, see spawnCoinBot/spawnPoliceHelper
// above) to a given guard killer — generalized so tickGuardKillerCombat doesn't care which kind of
// ally it's fighting, just its position/hp/defeat-function.
function nearestDefender(k) {
  let best = null, bestDist = Infinity;
  coinBots.forEach(b => { if (!b.alive) return; const d = Math.hypot(b.x-k.x, b.z-k.z); if (d < bestDist) { bestDist = d; best = { ref:b, defeat:defeatCoinBot }; } });
  policeHelpers.forEach(p => { if (!p.alive) return; const d = Math.hypot(p.x-k.x, p.z-k.z); if (d < bestDist) { bestDist = d; best = { ref:p, defeat:defeatPoliceHelper }; } });
  return best ? { ...best, dist:bestDist } : null;
}
function tickGuardKillerCombat(k, dt) {
  const nearest = nearestDefender(k);
  const targetingDefender = nearest && nearest.dist < 40; // aggro range — don't beeline across the whole map for a defender that isn't actually relevant
  const tx = targetingDefender ? nearest.ref.x : BANK_ATTACK_POS.x;
  const tz = targetingDefender ? nearest.ref.z : BANK_ATTACK_POS.z;
  const dx = tx-k.x, dz = tz-k.z, dist = Math.hypot(dx,dz);
  const range = targetingDefender ? KILLER_ATTACK_RANGE + 5 : KILLER_ATTACK_RANGE + 4; // generous — a defender/building is a big target
  if (dist < range) {
    k.attackTimer += dt;
    if (k.attackTimer > k.atkInterval) {
      k.attackTimer = 0;
      if (targetingDefender) {
        nearest.ref.hp -= 8+Math.floor(Math.random()*8);
        if (nearest.ref.hp <= 0) nearest.defeat(nearest.ref);
      } else {
        bankHealth = Math.max(0, bankHealth - (20+Math.floor(Math.random()*16)));
        if (bankHealth <= 0) failGuardShift();
      }
    }
  } else {
    k.x += dx/dist*k.speed*dt; k.z += dz/dist*k.speed*dt;
    k.mesh.position.set(k.x, 0, k.z);
    k.mesh.rotation.y = Math.atan2(dx, dz);
  }
}
// "get rid of all evil entities for 2 days" / "5x bad entites" — one real multiplier both halves
// of the church/Wrath aftermath share: 0 while the cleansing period is blocking all evil, 5 if
// Satan won this round (also demonizeMesh()'d, above), otherwise the normal rate.
function evilSpawnMultiplier() {
  const now = Date.now();
  if (now < satanBadUntil) return 5;
  if (now < safePeriodEndsAt) return 0;
  return 1;
}
function tickKillers(dt) {
  killerTimer += dt;
  const outdoors = !inHouse && !inMall && !inHotel && !inStore && !inFriendHouse && !inLandHouse && !inCountryHotel && !inAirportLounge && !inPrison && !inArcade && !inCar && !inArenaBattle && !inMovieFight && !inBankInterior && !inSportsPark && !inHospital && !inSea;
  const evilMult = evilSpawnMultiplier();
  if (killerTimer >= killerSpawnInterval() / Math.max(1,evilMult)) {
    killerTimer = 0;
    // Only counts ambient killers against the ambient cap now — a Guard shift's own separate
    // GUARD_KILLER_MAX_ACTIVE pool used to count against this too, silently starving ambient
    // spawns for the whole 20-minute shift. Real bug, fixed while touching this code anyway.
    if (outdoors && evilMult>0 && killers.filter(k=>k.alive && !k.guardKiller && !k.hitTargetName && !k.hitTargetType && !k.robber).length < killerMaxActive()*evilMult) spawnKiller();
  }
  robberTimer += dt;
  if (robberTimer >= ROBBER_SPAWN_INTERVAL / Math.max(1,evilMult)) {
    robberTimer = 0;
    if (outdoors && evilMult>0 && killers.filter(k=>k.alive && k.robber).length < ROBBER_MAX_ACTIVE*evilMult) spawnRobber();
  }
  const onGuardShift = activeBankJob && activeBankJob.job.id === 'guard';
  if (onGuardShift) {
    if (bankHealth <= 0) resetBankHealth(); // a fresh shift always starts the bank at full health
    guardKillerTimer += dt;
    // No `outdoors` gate here any more — the guard-killer fight targets the Bank/Coin Bots, not
    // the player, so it keeps simulating even while you're indoors somewhere across the city
    // (which also matters for Guard's "no walking required" remote-start carve-out — a shift
    // started from clear across the map still needs killers to actually show up).
    if (guardKillerTimer >= GUARD_KILLER_SPAWN_INTERVAL) {
      guardKillerTimer = 0;
      if (killers.filter(k=>k.alive && k.guardKiller).length < GUARD_KILLER_MAX_ACTIVE) spawnGuardKiller();
    }
  } else if (killers.some(k => k.alive && k.guardKiller)) {
    clearGuardKillers(); // shift ended/quit mid-fight — don't leave the swarm standing there
    clearCoinBots();
    clearPoliceHelpers();
  }
  if (onBankWall && !onGuardShift) climbDownBankWall(); // shift ended/failed while up there — don't leave the player stranded on the wall
  killers.forEach(k => {
    if (!k.alive) return;
    if (k.guardKiller) { tickGuardKillerCombat(k, dt); return; }
    if (k.hitTargetName) { tickHitmanCombat(k, dt); return; } // hunts a specific NPC, not the player — keeps going indoors/outdoors same as a guard killer
    if (k.hitTargetType) { tickHitmanVsType(k, dt); return; } // hunts the nearest robot/robber, same "keeps going indoors" treatment
    if (!outdoors) return;
    if (k.robber) { tickRobberCombat(k, dt); return; }
    tickAmbientKillerCombat(k, dt);
  });
}
function fightKiller(killer) {
  if (!killer.alive) return;
  const dmg = getWeaponDamage();
  killer.hp -= dmg;
  triggerSwing();
  startKnockback(playerGroup.position.x, playerGroup.position.z, killer.x, killer.z,
    (x, z) => { killer.x = x; killer.z = z; killer.mesh.position.set(x, 0, z); });
  sfx.clang();
  if (killer.hp > 0) {
    showNotif(`⚔️ Hit the killer for ${dmg}! (${killer.hp}/${killer.maxHp} HP left)`);
    return;
  }
  defeatKiller(killer);
}
// User's own follow-up: "the killer drops down with blood, with a dead bloody body" — a real
// fallen-figure mesh + blood pool left behind at the exact spot, same "leave real evidence
// behind" idea as buildWreckage() below for robots, just a body instead of scrap.
let killerCorpses = []; // NOT persisted — purely decorative, same category as wreckagePiles
function buildKillerCorpse(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.random()*Math.PI*2;
  const dark = 0x0a0a0a;
  const mk = (w,h,d,color,px,py,pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color})); m.position.set(px,py,pz); g.add(m); return m; };
  const blood = new THREE.Mesh(new THREE.CircleGeometry(1.3, 12), new THREE.MeshBasicMaterial({color:0x7a0000}));
  blood.rotation.x = -Math.PI/2; blood.position.y = 0.015; g.add(blood);
  mk(1.7,0.35,0.6, dark, 0,0.18,0);       // torso, lying flat
  mk(0.7,0.35,0.6, dark, 1.05,0.18,0);    // head end
  mk(0.5,0.3,0.5, dark, -0.9,0.15,0.3); mk(0.5,0.3,0.5, dark, -0.9,0.15,-0.3); // legs, splayed
  const bloodSplat = new THREE.Mesh(new THREE.CircleGeometry(0.4, 8), new THREE.MeshBasicMaterial({color:0x990000}));
  bloodSplat.rotation.x = -Math.PI/2; bloodSplat.position.set(0.6,0.36,0.1); g.add(bloodSplat);
  scene.add(g);
  killerCorpses.push({ x, z, mesh:g });
  return g;
}
function defeatKiller(killer) {
  killer.alive = false;
  scene.remove(killer.mesh);
  buildKillerCorpse(killer.x, killer.z);
  if (killer.guardKiller) {
    // User's own words: "you get nothing from the killers" during Guard duty — no reward, and
    // doesn't count toward killerDefeats (that stat scales ambient Killer frequency/difficulty,
    // which shouldn't inflate just from doing Guard shifts).
    sfx.boom();
    showNotif('💀 Fought off a bank attacker! (Guard duty — no reward)');
    return;
  }
  killerDefeats++;
  totalKills++; checkWrathTrigger();
  const badLuck = Date.now() < satanBadUntil;
  const reward = badLuck ? Math.max(1, Math.round(KILLER_REWARD_ELITE*0.5)) : KILLER_REWARD_ELITE;
  queueEarning(0, reward, 'Killer');
  sfx.boom();
  showNotif(`💀 Defeated the killer! +${reward} 💎${badLuck ? ' (bad luck is cutting your rewards right now...)' : ''}`);
}

// ── The Grinder — turns real robot wreckage into Scrap Metal + the robot's real materials ──
const GRINDER_POS = { x:SCRAPYARD_CENTER.x, z:SCRAPYARD_CENTER.z+18 };
let wreckagePiles = []; // {x,z,mesh,type} — NOT persisted, same category as the ambient robots themselves
function buildWreckage(x, z, robotType) {
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  [[-0.3,0.15,-0.2],[0.25,0.1,0.15],[0,0.25,0]].forEach(([dx,dy,dz]) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.4,0.3,0.4), mat(0x556677));
    s.position.set(dx,dy,dz); s.rotation.set(Math.random(),Math.random(),Math.random());
    g.add(s);
  });
  wreckagePiles.push({ x, z, mesh:g, type:robotType });
}
function buildGrinderMesh() {
  const g = new THREE.Group(); g.position.set(GRINDER_POS.x,0,GRINDER_POS.z); scene.add(g);
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,1.6,10), mat(0x445566)); drum.position.y=1.0; drum.rotation.z=Math.PI/2*0.15; g.add(drum);
  const hopper = new THREE.Mesh(new THREE.ConeGeometry(0.9,0.9,4), mat(0x334455)); hopper.position.set(0,2.1,0); hopper.rotation.y=Math.PI/4; g.add(hopper);
  const pl = new THREE.PointLight(0xff8800, 0.6, 8); pl.position.y=1.5; g.add(pl);
}
function buildScrapyard() {
  buildLogoSign('THE SCRAPYARD', '🤖', '#556677', '#00ffcc', SCRAPYARD_CENTER.x, 5, SCRAPYARD_CENTER.z-20);
  ROBOT_SPAWNERS.forEach((sp, i) => {
    buildSpawnerMesh(sp.x, sp.z);
    for (let n=0; n<sp.maxRobots; n++) trySpawnRobot(i);
  });
  buildGrinderMesh();
  buildLogoSign('THE GRINDER', '⚙️', '#445566', '#ff8800', GRINDER_POS.x, 3.2, GRINDER_POS.z-1.5);
  CITY_ZONES.push({ x:GRINDER_POS.x, z:GRINDER_POS.z+2.5, r:2.5, label:'⚙️ Use the Grinder', action: () => useGrinder()});

  // Sell Kiosk — a small booth next to the Grinder, buys materials for real S.I.P.
  const kx = GRINDER_POS.x+6, kz = GRINDER_POS.z;
  box(2,2.2,1.6, 0x2a4a3a, kx, 1.1, kz);
  box(2.4,0.3,2, 0x1a3a2a, kx, 2.35, kz);
  box(1.6,0.7,0.3, 0x3a5a4a, kx, 0.9, kz+0.9);
  buildLogoSign('SELL KIOSK', '💰', '#2a4a3a', '#ffd54a', kx, 3.2, kz-1.2);
  addCol(CITY_COLS, kx, kz, 1.1, 0.9);
  CITY_ZONES.push({ x:kx, z:kz+2.3, r:2.3, label:'💰 Sell Materials', action: () => openSellKiosk()});

  // Robo Arsenal — a real specialized weapon shop right at the Scrapyard, selling WEAPONS'
  // robotShopOnly gear (EMP Hammer/Plasma Cutter/Rail Spike) that hits robots far harder than
  // the general Weapon Shop's bat/sword/axe, at the cost of being weaker against people.
  const rax = SCRAPYARD_CENTER.x-18, raz = GRINDER_POS.z;
  box(3,2.6,2, 0x223344, rax, 1.3, raz);
  box(3.4,0.3,2.4, 0x1a2733, rax, 2.65, raz);
  box(1.6,0.7,0.3, 0x2a3a4a, rax, 0.9, raz+0.9);
  box(0.08,1.0,0.06, 0x00ffcc, rax-0.5, 1.6, raz-1.05); // EMP hammer on wall
  box(0.08,0.9,0.06, 0xff6600, rax+0.5, 1.5, raz-1.05); // plasma cutter on wall
  buildLogoSign('ROBO ARSENAL', '🤖', '#223344', '#00ffcc', rax, 3.4, raz-1.3);
  addCol(CITY_COLS, rax, raz, 1.6, 1.1);
  CITY_ZONES.push({ x:rax, z:raz+2.5, r:2.3, label:'🤖 Robo Arsenal Shop', action: ()=>openShop('robotweapons'), isShop:true });

  buildRobotArenaEntranceSign();
}

// ─── ROBOT ARENA — a real horde-mode pocket space: fight through a player-chosen number of
// robots (1 to 200 as asked), with a small wave actually alive at once (so it's a playable
// fight, not 200 frozen meshes all at once) that refills as you clear it. Reuses the exact
// same Robot Level scaling (item 200's robotPowerMult()/robotSizeMult()) as the rest of the
// city, so a maxed-out level makes this a genuinely harder gauntlet, not just a longer one. ──
const ROBOT_ARENA_ENTRANCE = { x: SCRAPYARD_CENTER.x+35, z: SCRAPYARD_CENTER.z+10 };
const ROBOT_ARENA_SPAWN = { x:90000, z:0 }; // own 10,000-unit lane, next free one after AirportLounge(120000)
const ROBOT_ARENA_EXIT  = { x:90000, z:18 };
const ROBOT_ARENA_COLS  = [];
const ARENA_SIZE = 24; // half-width of the square floor
const ARENA_MAX_ACTIVE = 6;   // robots alive at once — the rest wait their turn
const ARENA_MAX_TOTAL  = 200; // hard cap on the configurable total, exactly as asked
let inArenaBattle   = false;
let arenaConfiguring = false; // count-picker open, fight not started yet
let arenaRunning     = false;
let arenaTotalRobots = 20;
let arenaDefeatedCount = 0;
let arenaActiveRobots = [];

function buildRobotArenaEntranceSign() {
  const ex = ROBOT_ARENA_ENTRANCE.x, ez = ROBOT_ARENA_ENTRANCE.z;
  box(4,3.4,3, 0x2a1a3a, ex, 1.7, ez);
  box(4.4,0.3,3.4, 0x1a0f28, ex, 3.5, ez);
  box(1.6,2.4,0.2, 0x110818, ex, 1.4, ez+1.55);
  buildLogoSign('ROBOT ARENA', '🤖', '#2a1a3a', '#ff4444', ex, 4.4, ez-1.7);
  addCol(CITY_COLS, ex, ez, 2.2, 1.6);
  CITY_ZONES.push({ x:ex, z:ez+2.6, r:2.6, label:'🤖 Enter Robot Arena', action: () => enterRobotArena()});
}
function buildRobotArenaInterior() {
  const ix = ROBOT_ARENA_SPAWN.x, iz = 0, S = ARENA_SIZE;
  box(S*2, 0.3, S*2, 0x33333d, ix, 0.15, iz);   // floor
  box(S*2, 6, 0.5, 0x1a1a22, ix, 3, iz-S);      // back wall
  box(S*2, 6, 0.5, 0x1a1a22, ix, 3, iz+S);      // front wall
  box(0.5, 6, S*2, 0x1a1a22, ix-S, 3, iz);      // left wall
  box(0.5, 6, S*2, 0x1a1a22, ix+S, 3, iz);      // right wall
  box(3, 4, 0.2, 0xff3333, ix, 2, iz+S-0.3);    // exit marker, front wall
  buildLogoSign('ROBOT ARENA', ix, 6.5, iz-S+1.5);
  buildSign('EXIT', ix, 3.7, iz+S-1.4);
  addCol(ROBOT_ARENA_COLS, ix, iz-S, S, 0.6);
  addCol(ROBOT_ARENA_COLS, ix, iz+S, S, 0.6);
  addCol(ROBOT_ARENA_COLS, ix-S, iz, 0.6, S);
  addCol(ROBOT_ARENA_COLS, ix+S, iz, 0.6, S);
  const pl1 = new THREE.PointLight(0xff4444, 1.3, 45); pl1.position.set(ix-S+5, 6, iz-S+5); scene.add(pl1);
  const pl2 = new THREE.PointLight(0x4488ff, 1.3, 45); pl2.position.set(ix+S-5, 6, iz+S-5); scene.add(pl2);
}
const ROBOT_ARENA_ZONES = [
  { x:ROBOT_ARENA_EXIT.x, z:ROBOT_ARENA_EXIT.z, r:3, label:'🚪 Leave Arena', action: () => exitRobotArena()},
];
function enterRobotArena() {
  inArenaBattle = true;
  arenaConfiguring = true;
  arenaRunning = false;
  playerGroup.position.set(ROBOT_ARENA_SPAWN.x, 0, ROBOT_ARENA_SPAWN.z-10);
  yaw = 0;
  showNotif('🤖 Welcome to the Robot Arena!');
  openArenaConfig();
}
function exitRobotArena() {
  clearArenaRobots();
  inArenaBattle = false;
  arenaConfiguring = false;
  arenaRunning = false;
  closeArenaConfig();
  document.getElementById('arenaHud').style.display = 'none';
  playerGroup.position.set(ROBOT_ARENA_ENTRANCE.x, 0, ROBOT_ARENA_ENTRANCE.z+3);
  yaw = Math.PI;
  showNotif('Leaving the Robot Arena...');
}
function openArenaConfig() {
  document.getElementById('arenaConfigModal').style.display = 'flex';
  document.getElementById('arenaCountInput').value = arenaTotalRobots;
}
function closeArenaConfig() {
  document.getElementById('arenaConfigModal').style.display = 'none';
}
function startArenaBattle() {
  const n = parseInt(document.getElementById('arenaCountInput').value);
  arenaTotalRobots = Math.max(1, Math.min(ARENA_MAX_TOTAL, isNaN(n) ? 20 : n));
  arenaDefeatedCount = 0;
  arenaConfiguring = false;
  arenaRunning = true;
  closeArenaConfig();
  updateArenaHud();
  document.getElementById('arenaHud').style.display = 'block';
  showNotif(`🤖⚔️ ${arenaTotalRobots} robots incoming — good luck!`);
  spawnArenaWave();
}
function spawnArenaWave() {
  if (!arenaRunning) return;
  const remaining = arenaTotalRobots - arenaDefeatedCount - arenaActiveRobots.length;
  const toSpawn = Math.max(0, Math.min(ARENA_MAX_ACTIVE - arenaActiveRobots.length, remaining));
  for (let i=0; i<toSpawn; i++) spawnOneArenaRobot();
}
// Arena robots used to be completely stationary (spawn point fixed forever, only ever moved by a
// knockback) and totally passive (the ONLY damage they ever dealt was a guaranteed counter-hit
// inside fightArenaRobot, i.e. exactly the "only attacks when you attack" bug already fixed for
// bosses in item 209). User's own ask: "make the robots move ... the robots need to attack."
// tickArenaRobots() below gives them the same real chase-then-attack behavior every other
// enemy in this game already has.
const ARENA_ROBOT_ATTACK_RANGE = 2.8, ARENA_ROBOT_ATTACK_INTERVAL = 1.5;
function spawnOneArenaRobot() {
  const type = pickRobotType();
  const angle = Math.random()*Math.PI*2, dist = 6+Math.random()*(ARENA_SIZE-8);
  const x = ROBOT_ARENA_SPAWN.x + Math.cos(angle)*dist, z = ROBOT_ARENA_SPAWN.z + Math.sin(angle)*dist;
  const mesh = buildRobotMesh(x, z, type.color, type.shape);
  const mult = robotPowerMult();
  mesh.scale.setScalar(robotSizeMult());
  const hp = Math.round(type.hp * mult);
  // No collider anymore — now that it moves, a fixed addCol() here would leave a ghost wall
  // behind at the spawn spot the moment it starts chasing (the exact bug already fixed for
  // bosses in item 209). Same walk-through-able convention every other mobile enemy uses.
  // Per-kill reward is deliberately smaller than the same robot out in the city (0.6x) — the
  // real payout here is the completion bonus in finishArenaBattle(), scaled by how many
  // robots were chosen, so picking a bigger fight is worth meaningfully more, not just longer.
  const robot = { id:'arena'+ROBOT_ID_SEQ++, x, z, hp, maxHp:hp, type, mesh, alive:true, zone:null, col:null,
    speed:2.5+Math.random()*1.5, attackTimer:0,
    powerMult:mult, rewardRange:[Math.round(type.reward[0]*mult*0.6), Math.round(type.reward[1]*mult*0.6)],
    eliteReward: Math.round((ELITE_COIN_REWARD[type.id]||0)*mult*0.6) };
  const zone = { x, z, r:2.8, label:`🤖 Fight ${type.name}`, action: () => fightArenaRobot(robot) };
  robot.zone = zone;
  ROBOT_ARENA_ZONES.push(zone);
  arenaActiveRobots.push(robot);
}
function tickArenaRobots(dt) {
  if (!inArenaBattle || !arenaRunning) return;
  arenaActiveRobots.forEach(robot => {
    if (!robot.alive) return;
    const dx = playerGroup.position.x-robot.x, dz = playerGroup.position.z-robot.z;
    const dist = Math.hypot(dx,dz);
    if (dist > ARENA_ROBOT_ATTACK_RANGE) {
      robot.attackTimer = 0;
      robot.x += dx/dist*robot.speed*dt; robot.z += dz/dist*robot.speed*dt;
      robot.mesh.position.set(robot.x, 0, robot.z);
      robot.mesh.rotation.y = Math.atan2(dx, dz);
      robot.zone.x = robot.x; robot.zone.z = robot.z; // the E-press fight zone has to follow it too
    } else {
      robot.attackTimer += dt;
      if (robot.attackTimer >= ARENA_ROBOT_ATTACK_INTERVAL) {
        robot.attackTimer = 0;
        if (!isEvilImmune()) {
          const dmg = Math.round((6 + Math.random()*8) * robot.powerMult);
          damagePlayer(dmg, robot.type.name + ' (Arena)');
          showNotif(`⚔️ ${robot.type.name} attacks!`);
        }
      }
    }
  });
}
function fightArenaRobot(robot) {
  if (!robot.alive || !arenaRunning) return;
  const dmg = getRobotDamage();
  robot.hp -= dmg;
  triggerSwing();
  startKnockback(playerGroup.position.x, playerGroup.position.z, robot.x, robot.z,
    (x, z) => { robot.x = x; robot.z = z; robot.mesh.position.set(x, 0, z); robot.zone.x = x; robot.zone.z = z; });
  sfx.clang();
  robot.attackTimer = 0; // landing a hit resets its swing timer, same as a real fight would
  if (robot.hp > 0) {
    // No counter-hit here anymore — tickArenaRobots() already attacks on its own timer whenever
    // it's in range, attacking or not. A guaranteed extra hit every time you landed one too would
    // just be double damage on top of that (same fix as item 209's bosses).
    showNotif(`🤖 Hit ${robot.type.name} for ${dmg}! (${robot.hp} HP left)`);
    return;
  }
  defeatArenaRobot(robot);
}
function defeatArenaRobot(robot) {
  robot.alive = false;
  scene.remove(robot.mesh);
  const zi = ROBOT_ARENA_ZONES.indexOf(robot.zone); if (zi>-1) ROBOT_ARENA_ZONES.splice(zi,1);
  if (robot.col) { const ci = ROBOT_ARENA_COLS.indexOf(robot.col); if (ci>-1) ROBOT_ARENA_COLS.splice(ci,1); }
  const ai = arenaActiveRobots.indexOf(robot); if (ai>-1) arenaActiveRobots.splice(ai,1);
  const [lo,hi] = robot.rewardRange;
  const reward = lo + Math.floor(Math.random()*(hi-lo+1));
  queueEarning(reward, robot.eliteReward, `Arena ${robot.type.name}`);
  sfx.boom();
  arenaDefeatedCount++;
  lifetimeRobotKills++; // a real robot kill either way — counts toward the Quests panel too
  updateArenaHud();
  if (arenaDefeatedCount >= arenaTotalRobots) finishArenaBattle();
  else spawnArenaWave();
}
function finishArenaBattle() {
  arenaRunning = false;
  // User's own ask: "100 sip 20 daimounds per 10 robots" — a flat 10 S.I.P. + 2 Elite Coins per
  // robot chosen (was 5 S.I.P. + 0.5 Elite Coins), so any count still scales cleanly.
  const bonusSip = arenaTotalRobots * 10;
  const bonusElite = arenaTotalRobots * 2;
  queueEarning(bonusSip, bonusElite, 'Robot Arena Clear');
  saveCurrentUser();
  document.getElementById('arenaHud').style.display = 'none';
  showNotif(`🏆 ARENA CLEARED! All ${arenaTotalRobots} robots defeated! +${bonusSip} S.I.P. +${bonusElite} 💎`);
}
function clearArenaRobots() {
  arenaActiveRobots.forEach(r => {
    if (!r.alive) return;
    scene.remove(r.mesh);
    const zi = ROBOT_ARENA_ZONES.indexOf(r.zone); if (zi>-1) ROBOT_ARENA_ZONES.splice(zi,1);
    if (r.col) { const ci = ROBOT_ARENA_COLS.indexOf(r.col); if (ci>-1) ROBOT_ARENA_COLS.splice(ci,1); }
  });
  arenaActiveRobots = [];
}
function updateArenaHud() {
  const el = document.getElementById('arenaHudText');
  if (el) el.textContent = `🤖 Arena: ${arenaDefeatedCount} / ${arenaTotalRobots} defeated`;
}

// ── Movie Fight Room — user's own ask: "make movie fight where the movie you want will fight
// you," clarified to a dedicated special room (not scattered outdoors like BOSS_DEFS) that you
// enter by picking a "⚔️ Fight" option on any movie card in the Cinema, same 14 movies you can
// already watch. One shared reflavored fight (name/color/shape/difficulty pulled straight from
// that movie's real title/genre/price — no hand-authored combat per movie) rather than 14 fully
// unique fights, covering every movie immediately. Free to fight (unlike watching, which costs
// a real ticket) — the payoff is the defeat reward, not a purchase. Own 10,000-unit pocket lane,
// same convention as every other interior (House/10000 ... AirportLounge/120000).
function movieBossShape(genre) {
  if (/Mecha|Sci-Fi/i.test(genre)) return 'tank';
  if (/Space|Sports/i.test(genre)) return 'drone';
  if (/Mystery|Thriller/i.test(genre)) return 'spider';
  if (/Epic/i.test(genre)) return 'elite';
  return 'guard';
}
const MOVIE_BOSS_DEFS = CINEMA_MOVIES.map((m, i) => {
  const maxHp = 2000 + (m.price-20)*50; // the existing 20-40 S.I.P. ticket price doubles as a real difficulty knob
  return {
    name: m.title, emoji: Array.from(m.icons)[0] || '🎬', movieIdx: i,
    maxHp, damage: Math.round(16 + (m.price-20)*0.5),
    color: parseInt(m.bg.slice(1), 16), shape: movieBossShape(m.genre),
    sipReward: [Math.round(maxHp*0.15), Math.round(maxHp*0.22)],
    eliteReward: Math.round(maxHp/60), hitSip:2, hitElite:0,
  };
});
const MOVIE_FIGHT_SPAWN = { x:110000, z:0 }; // own lane, the one free slot between RobotArena(90000)/CountryHotel(100000) and AirportLounge(120000)
const SPORTS_SPAWN = { x:130000, z:0 }; // own lane, next free one after AirportLounge(120000) — user's own ask: "sports"
const SPORTS_EXIT = { x:-10, z:-95 }; // real-world gate, just south of The Park (which had no room left)
let inSportsPark = false;
let soccerGoalieMesh = null;
const BB_SHOOT_SPOT = { x:SPORTS_SPAWN.x-25, z:SPORTS_SPAWN.z+3 };
const BB_HOOP_POS = { x:SPORTS_SPAWN.x-31.4, y:3.2, z:SPORTS_SPAWN.z+0.3 };
const SOCCER_KICK_SPOT = { x:SPORTS_SPAWN.x+25, z:SPORTS_SPAWN.z-6 };
const SOCCER_GOAL_X = { left:SPORTS_SPAWN.x+30, center:SPORTS_SPAWN.x+33, right:SPORTS_SPAWN.x+36 };
const SOCCER_GOAL_Z = SPORTS_SPAWN.z;
// User's follow-up: "more sports". Same field, a new row further in (north of the entry/
// basketball/soccer row) so nothing needed to move.
const BASEBALL_HOME = { x:SPORTS_SPAWN.x-15, z:SPORTS_SPAWN.z-18 };
const BOWLING_LANE  = { x:SPORTS_SPAWN.x+15, z:SPORTS_SPAWN.z-18 };
const GYM_SPOT = { x:SPORTS_SPAWN.x, z:SPORTS_SPAWN.z-18 }; // dead center between Baseball/Bowling's lanes
let gymBuffEndTime = 0; // read by applyDamageBuffs() near warCryEndTime — real +15% damage, not just a number on a screen
function enterSportsPark() {
  inSportsPark = true;
  playerGroup.position.set(SPORTS_SPAWN.x, 0, SPORTS_SPAWN.z+20);
  yaw = Math.PI;
  showNotif('🏟️ Welcome to the Sports Park!');
}
function leaveSportsPark() {
  inSportsPark = false;
  playerGroup.position.set(SPORTS_EXIT.x, 0, SPORTS_EXIT.z+3);
  yaw = 0;
  showNotif('Leaving the Sports Park...');
}
const SPORTS_ZONES = [
  { x:BB_SHOOT_SPOT.x, z:BB_SHOOT_SPOT.z, r:3.5, label:'🏀 Shoot Hoops', action: () => openBasketball()},
  { x:SOCCER_KICK_SPOT.x, z:SOCCER_KICK_SPOT.z, r:3.5, label:'⚽ Take a Penalty Kick', action: () => openSoccer()},
  { x:BASEBALL_HOME.x, z:BASEBALL_HOME.z, r:3.5, label:'⚾ Take a Swing', action: () => openBaseball()},
  { x:BOWLING_LANE.x, z:BOWLING_LANE.z, r:3.5, label:'🎳 Roll a Ball', action: () => openBowling()},
  { x:GYM_SPOT.x, z:GYM_SPOT.z, r:3.5, label:'🏋️ Work Out', action: () => openGym()},
  { x:SPORTS_SPAWN.x, z:SPORTS_SPAWN.z+20, r:4, label:'🚪 Leave Sports Park', action: () => leaveSportsPark()},
];
function buildSportsParkInterior() {
  const { x:sx, z:sz } = SPORTS_SPAWN;
  box(90,0.2,100, 0x4a9e2a, sx,0.1,sz-20); // grass field — deepened to fit Baseball/Bowling's own row
  buildSign('🏟️ SPORTS PARK', sx, 7, sz-68); // moved to the new far edge — used to sit right where Baseball/Bowling's row is now
  box(8,3,0.4, 0x8B5E3C, sx, 1.5, sz+23); // exit gate marker

  // ── BASKETBALL COURT (west side) ──
  const bx = BB_SHOOT_SPOT.x - 6.4; // court center, a bit past the shooting spot toward the hoop
  box(16,0.15,14, 0xcc8844, bx, 0.15, sz);
  box(0.4,3.5,0.4, 0x888888, BB_HOOP_POS.x, 1.75, sz); // pole
  box(2.2,1.6,0.15, 0xffffff, BB_HOOP_POS.x, 3.4, sz+0.3); // backboard
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5,0.06,8,16), new THREE.MeshLambertMaterial({color:0xff6600}));
  rim.position.set(BB_HOOP_POS.x, BB_HOOP_POS.y, BB_HOOP_POS.z); rim.rotation.x = Math.PI/2; scene.add(rim);
  buildSign('🏀 SHOOT HOOPS', BB_SHOOT_SPOT.x, 4, BB_SHOOT_SPOT.z+2.5);

  // ── SOCCER FIELD (east side) ──
  const cx = SOCCER_KICK_SPOT.x + 8;
  box(22,0.15,16, 0x3a9e3a, cx, 0.15, sz);
  box(0.25,2.4,0.25, 0xffffff, SOCCER_GOAL_X.left-0.5, 1.2, SOCCER_GOAL_Z);
  box(0.25,2.4,0.25, 0xffffff, SOCCER_GOAL_X.right+0.5, 1.2, SOCCER_GOAL_Z);
  box(7,0.25,0.25, 0xffffff, SOCCER_GOAL_X.center, 2.4, SOCCER_GOAL_Z);
  soccerGoalieMesh = box(1,2,0.6, 0x2244aa, SOCCER_GOAL_X.center, 1, SOCCER_GOAL_Z);
  buildSign('⚽ PENALTY KICK', SOCCER_KICK_SPOT.x, 4, SOCCER_KICK_SPOT.z-2.5);

  // ── BASEBALL DIAMOND (new row, west) — home plate + a real backstop, batting north into the field ──
  box(1.2,0.1,1.2, 0xeeeedd, BASEBALL_HOME.x, 0.06, BASEBALL_HOME.z); // home plate
  box(6,3,0.2, 0x777777, BASEBALL_HOME.x, 1.5, BASEBALL_HOME.z+2.5); // backstop
  buildSign('⚾ TAKE A SWING', BASEBALL_HOME.x, 4, BASEBALL_HOME.z+3);

  // ── BOWLING LANE (new row, east) — a real lane strip + 10 pins, rebuilt fresh each roll ──
  box(3,0.1,44, 0xddc88c, BOWLING_LANE.x, 0.08, BOWLING_LANE.z-18);
  box(0.3,0.6,44, 0x8a6d3a, BOWLING_LANE.x-1.6, 0.35, BOWLING_LANE.z-18);
  box(0.3,0.6,44, 0x8a6d3a, BOWLING_LANE.x+1.6, 0.35, BOWLING_LANE.z-18);
  buildSign('🎳 ROLL A BALL', BOWLING_LANE.x, 4, BOWLING_LANE.z+3);
  buildBowlingPins();

  // ── GYM (new row, center) — a real bench press station between Baseball and Bowling ──
  box(3.5,0.4,1.4, 0x333333, GYM_SPOT.x, 0.5, GYM_SPOT.z); // bench
  box(0.3,0.5,0.3, 0x555555, GYM_SPOT.x-1.5,0.7,GYM_SPOT.z-0.5); box(0.3,0.5,0.3, 0x555555, GYM_SPOT.x-1.5,0.7,GYM_SPOT.z+0.5);
  box(0.3,0.5,0.3, 0x555555, GYM_SPOT.x+1.5,0.7,GYM_SPOT.z-0.5); box(0.3,0.5,0.3, 0x555555, GYM_SPOT.x+1.5,0.7,GYM_SPOT.z+0.5);
  box(4.4,0.15,0.15, 0x777777, GYM_SPOT.x, 1.05, GYM_SPOT.z); // barbell
  [-2.1,2.1].forEach(off => {
    box(0.5,0.5,0.5, 0x111111, GYM_SPOT.x+off, 1.05, GYM_SPOT.z);
    box(0.5,0.5,0.5, 0x111111, GYM_SPOT.x+off*0.85, 1.05, GYM_SPOT.z);
  });
  buildSign('🏋️ WORK OUT', GYM_SPOT.x, 4, GYM_SPOT.z+3);
}

// ─── BASKETBALL — a real power meter (a live requestAnimationFrame loop drives both the DOM
// marker AND the value SHOOT reads, so what you see is exactly what gets scored, not two things
// that only look synced) plus a real ball that visibly arcs from the shooting spot to the hoop —
// dead-center for a make, offset to a side for a miss, not just a text result.
let bbAnimId = null, bbPower = 0, bbDir = 1;
function openBasketball() {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('basketballModal').style.display = 'flex';
  bbPower = 0; bbDir = 1;
  (function frame() {
    bbPower += bbDir * 2.2;
    if (bbPower >= 100) { bbPower = 100; bbDir = -1; }
    if (bbPower <= 0) { bbPower = 0; bbDir = 1; }
    const marker = document.getElementById('bbMarker');
    if (marker) marker.style.left = bbPower + '%';
    bbAnimId = requestAnimationFrame(frame);
  })();
}
function closeBasketball() {
  if (bbAnimId) cancelAnimationFrame(bbAnimId);
  document.getElementById('basketballModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function shootBasketball() {
  if (bbAnimId) cancelAnimationFrame(bbAnimId);
  const off = Math.abs(bbPower - 50); // 0 = dead center of the meter, 50 = worst possible timing
  let result, reward, missOffset;
  if (off < 8)       { result = "🏀🔥 SWISH!";          reward = 100; missOffset = 0; }
  else if (off < 20)  { result = '🏀 Nothing but net!';  reward = 60;  missOffset = 0; }
  else if (off < 35)  { result = '😅 Off the rim... IN!'; reward = 30;  missOffset = 0.4; }
  else                { result = '😔 Miss!';              reward = 0;   missOffset = 1; }
  document.getElementById('basketballModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
  animateBasketballShot(missOffset, () => {
    if (reward > 0) { queueEarning(reward, 0, 'Basketball'); showNotif(`${result} +${reward} S.I.P.`); sfx.buy(); }
    else { showNotif(result); sfx.nope(); }
  });
}
function animateBasketballShot(missOffset, onDone) {
  const start = { x:BB_SHOOT_SPOT.x, y:1.6, z:BB_SHOOT_SPOT.z };
  const missSide = Math.random() < 0.5 ? -1 : 1;
  const end = { x:BB_HOOP_POS.x + missSide*missOffset*1.6, y:BB_HOOP_POS.y, z:BB_HOOP_POS.z };
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.32,10,10), new THREE.MeshLambertMaterial({color:0xdd6622}));
  ball.position.set(start.x, start.y, start.z);
  scene.add(ball);
  const dur = 800, t0 = performance.now();
  (function step(now) {
    const p = Math.min(1, (now-t0)/dur);
    ball.position.x = start.x + (end.x-start.x)*p;
    ball.position.z = start.z + (end.z-start.z)*p;
    ball.position.y = start.y + (end.y-start.y)*p + Math.sin(p*Math.PI)*3.2;
    if (p < 1) requestAnimationFrame(step);
    else { scene.remove(ball); onDone(); }
  })(t0); // seed with t0, not undefined — an un-seeded first call makes p=NaN, and NaN<1 is
          // false, so the "still animating" branch never runs and this jumps straight to
          // "done" in the same synchronous tick: the ball is added and removed instantly,
          // zero visible arc, even though nothing here throws or looks wrong at a glance.
}

// ─── SOCCER — pick a side, a keeper independently picks a side to dive; different sides = a real
// goal, same side = saved. The keeper mesh actually moves to whichever side it dove, and the ball
// visibly flies there too — not just "you win" text.
function openSoccer() {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('soccerModal').style.display = 'flex';
}
function closeSoccer() {
  document.getElementById('soccerModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function kickSoccer(direction) {
  const sides = ['left','center','right'];
  const dive = sides[Math.floor(Math.random()*3)];
  const scored = dive !== direction;
  document.getElementById('soccerModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
  animateSoccerKick(direction, dive, () => {
    if (scored) { const reward = 50; queueEarning(reward, 0, 'Soccer'); showNotif(`⚽ GOAL! The keeper dove ${dive} — +${reward} S.I.P.`); sfx.buy(); }
    else { showNotif(`🧤 Saved! The keeper guessed ${dive} and got it right.`); sfx.nope(); }
  });
}
function animateSoccerKick(direction, dive, onDone) {
  if (soccerGoalieMesh) soccerGoalieMesh.position.x = SOCCER_GOAL_X[dive];
  const start = { x:SOCCER_KICK_SPOT.x, y:0.3, z:SOCCER_KICK_SPOT.z };
  const end = { x:SOCCER_GOAL_X[direction], y:0.5, z:SOCCER_GOAL_Z };
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.28,10,10), new THREE.MeshLambertMaterial({color:0xffffff}));
  ball.position.set(start.x, start.y, start.z);
  scene.add(ball);
  const dur = 650, t0 = performance.now();
  (function step(now) {
    const p = Math.min(1, (now-t0)/dur);
    ball.position.x = start.x + (end.x-start.x)*p;
    ball.position.z = start.z + (end.z-start.z)*p;
    ball.position.y = start.y + (end.y-start.y)*p + Math.sin(p*Math.PI)*0.6;
    if (p < 1) requestAnimationFrame(step);
    else { scene.remove(ball); onDone(); }
  })(t0); // same seeded-first-call fix as animateBasketballShot — see its comment
}

// ─── GENERIC POWER METER — user's follow-up "more sports". Basketball built its own meter first;
// Baseball and Bowling share this one instead of each duplicating the same rAF-driven marker.
let sportsMeterAnimId = null, sportsMeterPower = 0, sportsMeterDir = 1, sportsMeterOnLock = null;
function openSportsMeter(titleText, onLock) {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('sportsMeterTitle').textContent = titleText;
  document.getElementById('sportsMeterModal').style.display = 'flex';
  sportsMeterPower = 0; sportsMeterDir = 1; sportsMeterOnLock = onLock;
  (function frame() {
    sportsMeterPower += sportsMeterDir * 2.4;
    if (sportsMeterPower >= 100) { sportsMeterPower = 100; sportsMeterDir = -1; }
    if (sportsMeterPower <= 0) { sportsMeterPower = 0; sportsMeterDir = 1; }
    const marker = document.getElementById('sportsMeterMarker');
    if (marker) marker.style.left = sportsMeterPower + '%';
    sportsMeterAnimId = requestAnimationFrame(frame);
  })();
}
function closeSportsMeter() {
  if (sportsMeterAnimId) cancelAnimationFrame(sportsMeterAnimId);
  document.getElementById('sportsMeterModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function lockSportsMeter() {
  if (sportsMeterAnimId) cancelAnimationFrame(sportsMeterAnimId);
  const power = sportsMeterPower;
  document.getElementById('sportsMeterModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
  if (sportsMeterOnLock) sportsMeterOnLock(power);
}

// ─── BASEBALL — same timing-accuracy idea as Basketball, resolved through the shared meter above.
// A real ball flies off home plate, distance scaling with how close to dead-center the timing was.
function openBaseball() { openSportsMeter('⚾ Time your swing!', resolveBaseballSwing); }
function resolveBaseballSwing(power) {
  const off = Math.abs(power - 50);
  let result, reward, dist;
  if (off < 8)       { result = '⚾💥 HOME RUN!';  reward = 120; dist = 55; }
  else if (off < 20)  { result = '⚾ Double!';      reward = 50;  dist = 32; }
  else if (off < 35)  { result = '⚾ Single!';      reward = 20;  dist = 16; }
  else                 { result = '⚾ Strike out!'; reward = 0;   dist = 2; }
  animateBaseballHit(dist, () => {
    if (reward > 0) { queueEarning(reward, 0, 'Baseball'); showNotif(`${result} +${reward} S.I.P.`); sfx.buy(); }
    else { showNotif(result); sfx.nope(); }
  });
}
function animateBaseballHit(dist, onDone) {
  const start = { x:BASEBALL_HOME.x, y:1, z:BASEBALL_HOME.z };
  const end = { x:BASEBALL_HOME.x, y:0.3, z:BASEBALL_HOME.z-dist };
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.25,10,10), new THREE.MeshLambertMaterial({color:0xffffff}));
  ball.position.set(start.x, start.y, start.z);
  scene.add(ball);
  const dur = 900, t0 = performance.now();
  (function step(now) {
    const p = Math.min(1, (now-t0)/dur);
    ball.position.z = start.z + (end.z-start.z)*p;
    ball.position.y = start.y + (end.y-start.y)*p + Math.sin(p*Math.PI)*4;
    if (p < 1) requestAnimationFrame(step);
    else { scene.remove(ball); onDone(); }
  })(t0);
}

// ─── BOWLING — 10 real pins (rebuilt fresh each roll), knocked down (removed from the scene) in a
// count matching the meter's accuracy — a real strike visibly clears the whole rack, not a label.
let bowlingPins = [];
function buildBowlingPins() {
  bowlingPins.forEach(p => scene.remove(p));
  bowlingPins = [];
  const rows = [[0],[-0.3,0.3],[-0.6,0,0.6],[-0.9,-0.3,0.3,0.9]];
  rows.forEach((row, ri) => {
    row.forEach(off => {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.16,0.55,8), new THREE.MeshLambertMaterial({color:0xffffff}));
      pin.position.set(BOWLING_LANE.x+off, 0.28, BOWLING_LANE.z-40-ri*0.6);
      scene.add(pin);
      bowlingPins.push(pin);
    });
  });
}
function openBowling() { openSportsMeter('🎳 Time your roll!', resolveBowlingRoll); }
function resolveBowlingRoll(power) {
  const off = Math.abs(power - 50);
  let knocked, result, reward;
  if (off < 8)       { knocked = 10; result = '🎳 STRIKE!';       reward = 100; }
  else if (off < 20)  { knocked = 7;  result = '🎳 Nice roll!';    reward = 40; }
  else if (off < 35)  { knocked = 4;  result = '🎳 A few down.';   reward = 15; }
  else                 { knocked = 0;  result = '🎳 Gutter ball!'; reward = 0; }
  animateBowlingRoll(knocked, () => {
    buildBowlingPins(); // fresh rack for the next roll
    if (reward > 0) { queueEarning(reward, 0, 'Bowling'); showNotif(`${result} +${reward} S.I.P.`); sfx.buy(); }
    else { showNotif(result); sfx.nope(); }
  });
}
function animateBowlingRoll(knocked, onDone) {
  const start = { x:BOWLING_LANE.x, y:0.3, z:BOWLING_LANE.z-4 };
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.3,10,10), new THREE.MeshLambertMaterial({color:0x2244aa}));
  ball.position.set(start.x, start.y, start.z);
  scene.add(ball);
  const dur = 700, t0 = performance.now();
  (function step(now) {
    const p = Math.min(1, (now-t0)/dur);
    ball.position.z = start.z - 38*p;
    if (p < 1) requestAnimationFrame(step);
    else {
      scene.remove(ball);
      const shuffled = bowlingPins.slice().sort(() => Math.random()-0.5);
      for (let i = 0; i < knocked && i < shuffled.length; i++) scene.remove(shuffled[i]);
      onDone();
    }
  })(t0);
}

// ─── GYM — a real mechanic type instead of another timing bar: mash the button for a real 5
// real-time seconds, reps decided by actual clicks landed (setTimeout-driven, so the window
// closes on its own even if the player just stops clicking mid-challenge). Enough reps buys a
// real, felt payoff: +15% damage for a few real minutes, read by applyDamageBuffs() near
// warCryEndTime — the exact same mechanism War Cry already uses, not a separate fake stat.
let gymChallengeActive = false, gymClickCount = 0;
function openGym() {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  gymChallengeActive = false;
  gymClickCount = 0;
  document.getElementById('gymModal').style.display = 'flex';
  document.getElementById('gymRepsText').textContent = 'Reps: 0';
  document.getElementById('gymStatusText').textContent = 'Click PUMP! to start — 5 real seconds!';
}
function closeGym() {
  gymChallengeActive = false;
  document.getElementById('gymModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function gymPump() {
  if (document.getElementById('gymModal').style.display === 'none') return; // a stray click after closing
  if (!gymChallengeActive) {
    gymChallengeActive = true;
    gymClickCount = 0;
    document.getElementById('gymStatusText').textContent = 'GO GO GO!';
    setTimeout(() => { if (gymChallengeActive) finishGymChallenge(); }, 5000);
  }
  if (!gymChallengeActive) return; // window already closed via the timeout above
  gymClickCount++;
  document.getElementById('gymRepsText').textContent = `Reps: ${gymClickCount}`;
}
function finishGymChallenge() {
  gymChallengeActive = false;
  const reps = gymClickCount;
  let result, reward, buffMinutes;
  if (reps >= 30)      { result = '💪🔥 INCREDIBLE!';           reward = 100; buffMinutes = 5; }
  else if (reps >= 20)  { result = '💪 Great workout!';          reward = 50;  buffMinutes = 3; }
  else if (reps >= 10)  { result = '💪 Decent effort.';          reward = 20;  buffMinutes = 1; }
  else                   { result = '😅 Barely broke a sweat.';  reward = 0;   buffMinutes = 0; }
  document.getElementById('gymModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
  if (buffMinutes > 0) {
    gymBuffEndTime = clock.getElapsedTime() + buffMinutes*60;
    showNotif(`${result} ${reps} reps! +15% damage for ${buffMinutes} min${reward>0 ? `, +${reward} S.I.P.` : ''}`);
    sfx.buy();
  } else {
    showNotif(`${result} ${reps} reps — not enough for a real buff.`);
    sfx.nope();
  }
  if (reward > 0) queueEarning(reward, 0, 'Workout');
}

// ─── HOSPITAL — user's "keep building" follow-up. The building itself has existed since early
// in the city (real exterior, real sign, a real solid collider) but was never actually walkable
// in — no door gap, no interior, no doctor. Real door gap cut into the exterior collision above;
// this is the pocket-space interior + the one real service inside: a paid checkup that heals HP
// and — the actual point, tying straight into today's Sickness system — cures being sick. It does
// NOT touch hunger; a doctor fixing a growling stomach would be its own kind of unrealistic.
const HOSPITAL_SPAWN = { x:140000, z:0 }; // own lane, next free one after SportsPark(130000)
const HOSPITAL_EXIT = { x:-40, z:74 }; // real-world door, matches the gap cut into the exterior wall
let inHospital = false;
const DOCTOR_VISIT_COST = 80;
function enterHospital() {
  inHospital = true;
  playerGroup.position.set(HOSPITAL_SPAWN.x, 0, HOSPITAL_SPAWN.z+10);
  yaw = Math.PI;
  showNotif('🏥 Welcome to City Hospital!');
}
function leaveHospital() {
  inHospital = false;
  playerGroup.position.set(HOSPITAL_EXIT.x, 0, HOSPITAL_EXIT.z+3);
  yaw = 0;
  showNotif('Leaving the hospital...');
}
const DOCTOR_SPOT = { x:HOSPITAL_SPAWN.x, z:HOSPITAL_SPAWN.z-6 };
const HOSPITAL_ZONES = [
  { x:DOCTOR_SPOT.x, z:DOCTOR_SPOT.z, r:3.5, label:`🩺 See the Doctor (${DOCTOR_VISIT_COST} S.I.P.)`, action: () => seeDoctor()},
  { x:HOSPITAL_SPAWN.x, z:HOSPITAL_SPAWN.z+10, r:4, label:'🚪 Leave Hospital', action: () => leaveHospital()},
];
function seeDoctor() {
  if (sipDollars < DOCTOR_VISIT_COST) { showNotif(`❌ Need ${DOCTOR_VISIT_COST} S.I.P. for a visit.`); sfx.nope(); return; }
  sipDollars -= DOCTOR_VISIT_COST;
  updateSIP();
  playerHealth = playerMaxHealth;
  updateHealthBar();
  const wasSick = sick;
  if (sick) { sick = false; updateSickHud(); }
  showNotif(wasSick
    ? `🩺 The doctor treated you — not sick anymore, fully healed! (-${DOCTOR_VISIT_COST} S.I.P.)`
    : `🩺 Clean bill of health! Fully healed. (-${DOCTOR_VISIT_COST} S.I.P.)`);
  sfx.buy();
}
function buildHospitalInterior() {
  const { x:hx, z:hz } = HOSPITAL_SPAWN;
  box(40,0.2,36, 0xf0f0f8, hx,0.1,hz); // floor
  box(40,0.2,36, 0xffffff, hx,6,hz);   // ceiling
  box(40,6,0.3, 0xe0e0ee, hx,3,hz-18); // back wall
  box(0.3,6,36, 0xe0e0ee, hx-20,3,hz); // west wall
  box(0.3,6,36, 0xe0e0ee, hx+20,3,hz); // east wall
  box(17,6,0.3, 0xe0e0ee, hx-11.5,3,hz+18); box(17,6,0.3, 0xe0e0ee, hx+11.5,3,hz+18); // front wall, door gap centered
  buildSign('🏥 CITY HOSPITAL', hx, 6.6, hz-17.7);
  box(8,3,0.4, 0x8B5E3C, hx, 1.5, hz+18); // exit door marker

  // Doctor's exam area — a real table + a doctor NPC-style figure, not just an empty room
  box(3,0.9,1.6, 0xffffff, DOCTOR_SPOT.x, 0.45, DOCTOR_SPOT.z-3); // exam table
  box(3,0.15,1.6, 0xddeeff, DOCTOR_SPOT.x, 0.92, DOCTOR_SPOT.z-3); // table pad
  const doc = new THREE.Group();
  const mk = (w,h,d,color,px,py,pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color})); m.position.set(px,py,pz); doc.add(m); return m; };
  mk(0.8,0.8,0.8, 0xd9b38c, 0,2.6,0); // head
  mk(0.9,1.1,0.5, 0xffffff, 0,1.65,0); // white coat torso
  mk(0.35,0.9,0.35, 0xffffff,-0.6,1.65,0); mk(0.35,0.9,0.35, 0xffffff,0.6,1.65,0); // arms
  mk(0.38,0.9,0.38, 0x2244aa,-0.2,0.7,0); mk(0.38,0.9,0.38, 0x2244aa,0.2,0.7,0); // scrub pants
  doc.position.set(DOCTOR_SPOT.x, 0, DOCTOR_SPOT.z+2);
  scene.add(doc);
  buildSign('🩺 SEE THE DOCTOR', DOCTOR_SPOT.x, 4.2, DOCTOR_SPOT.z+3.5);

  // A couple of waiting-room chairs near the entrance, for real furnished feel
  [[-6,10],[6,10]].forEach(([cx2,cz2]) => {
    box(1.4,0.7,1.4, 0x88aacc, hx+cx2, 0.35, hz+cz2);
    box(1.4,1.2,0.2, 0x88aacc, hx+cx2, 0.9, hz+cz2-0.7);
  });
}
// ─── THE SEA — user's own ask: "make sea". A real place to swim, not just an "Ocean Blue" color
// swatch in a shop (the game had plenty of those already, and zero actual water). Sandy beach you
// walk on normally, and a real swim state the instant you step into the water itself: slower
// movement (real swimming, not full running speed) and the same jump key (tryCityJump) now dives
// you under or brings you back to the surface instead of jumping, while in the water.
const SEA_SPAWN = { x:150000, z:0 }; // own lane, next free one after Hospital(140000)
const SEA_EXIT = { x:220, z:90 }; // real-world gate, open ground past the Computer Shop/Car Dealership cluster
let inSea = false;
let inWater = false; // true only once actually standing IN the water, not just on the sand
let seaFish = []; // { mesh, baseX, baseZ, phase } — decorative, tickSeaFish'd in animate()
const SEA_WATER_CENTER = { x:SEA_SPAWN.x, z:SEA_SPAWN.z-15 };
const SEA_WATER_RADIUS = 26;
function enterSea() {
  inSea = true;
  playerGroup.position.set(SEA_SPAWN.x, 0, SEA_SPAWN.z+30);
  yaw = Math.PI;
  showNotif('🌊 Welcome to the Sea! Walk into the water to swim — press Jump to dive under or surface.');
}
function leaveSea() {
  inSea = false;
  inWater = false;
  playerGroup.position.set(SEA_EXIT.x, 0, SEA_EXIT.z+3);
  yaw = 0;
  showNotif('Leaving the Sea...');
}
const SEA_ZONES = [
  { x:SEA_SPAWN.x, z:SEA_SPAWN.z+30, r:5, label:'🚪 Leave the Sea', action: () => leaveSea()},
];
function buildSeaInterior() {
  const { x:sx, z:sz } = SEA_SPAWN;
  box(84, 0.3, 30, 0xe8d29a, sx, 0.15, sz+18);      // sandy beach — the walkable, non-swim part
  box(84, 0.25, 62, 0x1a6fb3, sx, 0.05, SEA_WATER_CENTER.z); // the sea itself, one big real water plane
  box(88, 0.2, 3, 0xffffff, sx, 0.22, sz+3);        // a thin foam line where sand meets water
  // A few palm trees along the sand for real beach atmosphere, not a bare rectangle.
  [[-32,20],[-18,26],[24,22],[34,15]].forEach(([dx,dz]) => {
    box(0.5, 4, 0.5, 0x8B5E3C, sx+dx, 2, sz+dz);
    [0,1,2,3,4].forEach(i => { const a=i*Math.PI*2/5; box(1.6,0.25,0.7, 0x2d7a2d, sx+dx+Math.cos(a)*0.9, 4.1, sz+dz+Math.sin(a)*0.9).rotation.y = a; });
  });
  // A few simple fish, gently bobbing in the water for real atmosphere (see tickSeaFish in animate()).
  seaFish = [0,1,2,3,4].map(i => {
    const f = box(0.5, 0.22, 0.22, [0xff8844,0xffcc44,0x66ccff,0xff6699,0x88dd66][i], sx+(i-2)*8, -0.3, SEA_WATER_CENTER.z+(i%2?6:-6));
    return { mesh:f, baseX:f.position.x, baseZ:f.position.z, phase:i*1.3 };
  });
  // Perimeter walls so the water has a real edge instead of trailing off into nothing.
  box(0.5, 6, 92, 0x2a2a3a, sx-42, 3, sz-15);
  box(0.5, 6, 92, 0x2a2a3a, sx+42, 3, sz-15);
  box(84, 6, 0.5, 0x2a2a3a, sx, 3, sz-46);
  box(38, 6, 0.5, 0x2a2a3a, sx-23, 3, sz+33); box(38, 6, 0.5, 0x2a2a3a, sx+23, 3, sz+33); // gate gap, centered
  buildSign('🌊 THE SEA', sx, 6.6, sz+32.3);
  box(8, 3, 0.4, 0x8B5E3C, sx, 1.5, sz+33); // exit gate marker
}
const MOVIE_FIGHT_EXIT  = { x:110000, z:18 };
const MOVIE_FIGHT_COLS  = [];
const MOVIE_FIGHT_SIZE  = 20;
const MOVIE_FIGHT_ATTACK_RANGE = 6, MOVIE_FIGHT_ATTACK_INTERVAL = 1.6;
let inMovieFight = false;
let movieBossFight = null; // {def, mesh, hp, maxHp, alive, curX, curZ, attackTimer} — NOT persisted, fresh every visit, no server/co-op involved (a personal instanced fight, same category as the Robot Arena)
const MOVIE_FIGHT_ZONES = [
  { x:MOVIE_FIGHT_EXIT.x, z:MOVIE_FIGHT_EXIT.z, r:3, label:'🚪 Leave', action: () => leaveMovieFight()},
];
function buildMovieFightRoom() {
  const ix = MOVIE_FIGHT_SPAWN.x, iz = 0, S = MOVIE_FIGHT_SIZE;
  box(S*2, 0.3, S*2, 0x1a0a2a, ix, 0.15, iz);   // floor — theater-purple, distinct from the Robot Arena's grey
  box(S*2, 6, 0.5, 0x2a1a3a, ix, 3, iz-S);      // back wall
  box(S*2, 6, 0.5, 0x2a1a3a, ix, 3, iz+S);      // front wall
  box(0.5, 6, S*2, 0x2a1a3a, ix-S, 3, iz);      // left wall
  box(0.5, 6, S*2, 0x2a1a3a, ix+S, 3, iz);      // right wall
  box(3, 4, 0.2, 0xff3333, ix, 2, iz+S-0.3);    // exit marker, front wall
  buildLogoSign('MOVIE FIGHT', '🎬', '#2a1a3a', '#ffcc44', ix, 6.5, iz-S+1.5);
  buildSign('EXIT', ix, 3.7, iz+S-1.4);
  addCol(MOVIE_FIGHT_COLS, ix, iz-S, S, 0.6);
  addCol(MOVIE_FIGHT_COLS, ix, iz+S, S, 0.6);
  addCol(MOVIE_FIGHT_COLS, ix-S, iz, 0.6, S);
  addCol(MOVIE_FIGHT_COLS, ix+S, iz, 0.6, S);
  const pl = new THREE.PointLight(0xffcc44, 1.3, 45); pl.position.set(ix, 8, iz); scene.add(pl);
}
function enterMovieFight(movieIdx) {
  const def = MOVIE_BOSS_DEFS[movieIdx];
  document.getElementById('cinemaModal').style.display = 'none';
  inMovieFight = true;
  playerGroup.position.set(MOVIE_FIGHT_SPAWN.x, 0, MOVIE_FIGHT_SPAWN.z-10);
  yaw = 0;
  const mesh = buildRobotMesh(MOVIE_FIGHT_SPAWN.x, MOVIE_FIGHT_SPAWN.z+6, def.color, def.shape);
  mesh.scale.setScalar(2.2); // huge, but a bit smaller than the outdoor BOSS_DEFS (3.2) — this room is tight
  buildLogoSign(def.name.toUpperCase(), def.emoji, '#220000', '#ff4444', MOVIE_FIGHT_SPAWN.x, 9, MOVIE_FIGHT_SPAWN.z+2);
  movieBossFight = { def, mesh, hp:def.maxHp, maxHp:def.maxHp, alive:true,
    curX:MOVIE_FIGHT_SPAWN.x, curZ:MOVIE_FIGHT_SPAWN.z+6, attackTimer:0 };
  showNotif(`${def.emoji} ${def.name} wants to fight!`);
}
// Shared by the real "Leave" zone AND a knockout mid-fight (knockoutPlayer's default branch) —
// same "don't leave an orphaned zone/collider/mesh behind" concern item 146/192/209 already
// fixed elsewhere; here there's only ever one boss and one exit zone, but the same rule applies.
function cleanupMovieFight() {
  if (movieBossFight && movieBossFight.mesh) scene.remove(movieBossFight.mesh);
  movieBossFight = null;
  inMovieFight = false;
  document.getElementById('bossHud').style.display = 'none';
}
function leaveMovieFight() {
  cleanupMovieFight();
  playerGroup.position.set(50, 0, -72+3); // right outside the real Cinema door in the city
  yaw = Math.PI;
  showNotif('Leaving the fight...');
}
function tickMovieBossFight(dt) {
  if (!inMovieFight || !movieBossFight || !movieBossFight.alive) return;
  const mb = movieBossFight;
  const dx = playerGroup.position.x-mb.curX, dz = playerGroup.position.z-mb.curZ;
  const dist = Math.hypot(dx,dz);
  // Always aggro, no detect range — you walked in here specifically to fight it, unlike an
  // outdoor boss you might stumble on by surprise.
  if (dist > MOVIE_FIGHT_ATTACK_RANGE) {
    mb.curX += dx/dist*BOSS_CHASE_SPEED*dt; mb.curZ += dz/dist*BOSS_CHASE_SPEED*dt;
    mb.mesh.rotation.y = Math.atan2(dx, dz);
    mb.attackTimer = 0;
  } else {
    mb.attackTimer += dt;
    if (mb.attackTimer >= MOVIE_FIGHT_ATTACK_INTERVAL) {
      mb.attackTimer = 0;
      damagePlayer(mb.def.damage, mb.def.name);
      showNotif(`${mb.def.emoji} ${mb.def.name} attacks!`);
    }
  }
  mb.mesh.position.set(mb.curX, 0, mb.curZ);
}
function fightMovieBoss() {
  if (!movieBossFight || !movieBossFight.alive) return;
  const mb = movieBossFight;
  const dmg = getWeaponDamage();
  mb.hp = Math.max(0, mb.hp - dmg); // no server involved here at all — always a real, immediate 0, same as an offline solo boss fight (item 209's fix)
  triggerSwing();
  sfx.clang();
  mb.attackTimer = 0;
  if (mb.hp <= 0) { defeatMovieBoss(); return; }
  showNotif(`⚔️ Hit ${mb.def.name} for ${dmg}! (${mb.hp}/${mb.maxHp} HP left)`);
}
function defeatMovieBoss() {
  const mb = movieBossFight;
  mb.alive = false;
  const [lo,hi] = mb.def.sipReward;
  const reward = lo + Math.floor(Math.random()*(hi-lo+1));
  queueEarning(reward, mb.def.eliteReward, mb.def.name);
  saveCurrentUser();
  sfx.boom();
  showNotif(`🏆 ${mb.def.emoji} ${mb.def.name} DEFEATED! +${reward} S.I.P. +${mb.def.eliteReward} 💎`);
  leaveMovieFight();
}
function showMovieBossHud() {
  if (!movieBossFight) { document.getElementById('bossHud').style.display = 'none'; return; }
  const mb = movieBossFight;
  document.getElementById('bossHud').style.display = 'block';
  document.getElementById('bossHudName').textContent = `${mb.def.emoji} ${mb.def.name}`;
  document.getElementById('bossHudFill').style.width = Math.max(0, mb.hp/mb.maxHp*100) + '%';
  document.getElementById('bossHudHp').textContent = `${Math.ceil(Math.max(0,mb.hp))} / ${mb.maxHp} HP`;
}

// ── 100 spawners scattered across the whole city (The Scrapyard's own 3 above + 97 more here) ──
// Jittered grid over the full player boundary (±1850, safely inside the ±1950 walk limit), with any
// candidate too close to a real named location (LOC_ZONES, defined further down — buildGlobalSpawners
// only ever RUNS at world-build time, well after the whole file, including LOC_ZONES, has evaluated)
// thrown out — same jittered-grid-plus-exclusion shape as item 145's generateWoodsOffsets.
function generateSpawnerSpots(count) {
  const bound = 1850, step = 320, buffer = 45;
  const exclusions = LOC_ZONES.concat([{ x:0, z:15, r:35 }]); // also keep clear of the player's own spawn point
  const spots = [];
  for (let gx=-bound; gx<=bound && spots.length<count; gx+=step) {
    for (let gz=-bound; gz<=bound && spots.length<count; gz+=step) {
      const x = gx + (Math.random()-0.5)*step*0.6;
      const z = gz + (Math.random()-0.5)*step*0.6;
      const blocked = exclusions.some(loc => Math.hypot(x-loc.x, z-loc.z) < loc.r+buffer);
      if (!blocked) spots.push({ x, z });
    }
  }
  return spots;
}
function buildGlobalSpawners() {
  const need = 100 - ROBOT_SPAWNERS.length; // The Scrapyard's 3 already count toward the 100
  generateSpawnerSpots(need).forEach(({x,z}) => {
    ROBOT_SPAWNERS.push({ x, z, maxRobots:1 }); // 1 per outpost (vs. Scrapyard's 2) — 100 spawners is already a lot of ambient robots
    const idx = ROBOT_SPAWNERS.length-1;
    buildSpawnerMesh(x, z);
    trySpawnRobot(idx);
  });
}
// ── Real materials (100 distinct, hand-authored, no filler) + The Dump — junk you
// pick up and bring to the Grinder to extract specific real materials from ──────
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'_'); }
const MATERIAL_DEFS = [
  // Metals & Alloys (20)
  ['Iron Scrap','🔩'],['Copper Wire','🔌'],['Aluminum Sheet','🥫'],['Steel Plate','🛡️'],['Tin Can','🥫'],
  ['Bronze Fragment','🟤'],['Silver Chip','⚪'],['Gold Nugget','🟡'],['Titanium Shard','⬜'],['Brass Fitting','🔶'],
  ['Lead Pipe','🪠'],['Zinc Coating','⚙️'],['Nickel Alloy','🔘'],['Chrome Trim','✨'],['Rusty Bolt','🔩'],
  ['Rusty Nail','📌'],['Metal Coil','➰'],['Metal Mesh','🕸️'],['Iron Filings','✨'],['Steel Cable','🔗'],
  // Electronics (18)
  ['Circuit Board','🖥️'],['Copper Coil','🌀'],['Battery Cell','🔋'],['LED Light','💡'],['Wire Bundle','🔌'],
  ['Microchip','💾'],['Capacitor','🔵'],['Resistor','🟠'],['Transistor','⚫'],['Fiber Optic Cable','🌈'],
  ['Speaker Magnet','🧲'],['Motor Part','⚙️'],['Sensor Chip','📡'],['Antenna Piece','📶'],['Solar Cell','☀️'],
  ['Power Core','🔆'],['Servo Motor','🦾'],['Hydraulic Piston','🛠️'],
  // Plastics & Rubber (12)
  ['Plastic Chunk','🧊'],['Rubber Strip','➖'],['Vinyl Sheet','📀'],['Foam Padding','🧽'],['Nylon Cord','🧶'],
  ['PVC Pipe','🚰'],['Bottle Cap','🧴'],['Bubble Wrap','🫧'],['Plastic Gear','⚙️'],['Rubber Tire Chunk','🛞'],
  ['Plastic Casing','📦'],['Silicone Seal','⭕'],
  // Glass & Ceramic (8)
  ['Glass Shard','🔺'],['Broken Mirror','🪞'],['Ceramic Tile','🧱'],['Porcelain Piece','🏺'],['Crystal Fragment','💎'],
  ['Frosted Glass','🧊'],['Stained Glass Piece','🌈'],['Glass Bottle','🍾'],
  // Fabric & Textile (8)
  ['Cloth Scrap','🧵'],['Leather Strip','🟫'],['Denim Patch','👖'],['Wool Fiber','🐑'],['Canvas Sheet','🎨'],
  ['Cotton Batting','☁️'],['Felt Pad','🟪'],['Burlap Sack','🛍️'],
  // Wood Products (7)
  ['Plywood Scrap','🪵'],['Splintered Wood','🪚'],['Wood Veneer','🌳'],['Sawdust Bag','💨'],['Wood Chips','🟤'],
  ['Cork Piece','🍾'],['Bamboo Strip','🎋'],
  // Stone & Mineral (10)
  ['Gravel','🪨'],['Sand Bag','🏖️'],['Clay Lump','🟠'],['Coal Chunk','⚫'],['Gemstone Fragment','💎'],
  ['Quartz Crystal','🔮'],['Marble Chip','⬜'],['Granite Piece','🗿'],['Limestone Chunk','⬛'],['Obsidian Shard','🖤'],
  // Paper & Cardboard (5)
  ['Cardboard Bundle','📦'],['Newspaper Stack','📰'],['Paper Pulp','📄'],['Magazine Stack','📖'],['Cardboard Tube','🎯'],
  // Misc Junk (12)
  ['Old Tire Rubber','🛞'],['Broken Toy Parts','🧸'],['Duct Tape Roll','🩹'],['Rope Coil','🪢'],['Bent Spring','🌀'],
  ['Rusty Chain','⛓️'],['Broken Gear','⚙️'],['Zip Tie Bundle','🔗'],['Old Sponge','🧽'],['Worn Bristle Brush','🖌️'],
  ['Cracked Handle','🔧'],['Bent Wire Hanger','👔'],
];
const MATERIALS = MATERIAL_DEFS.map(([name,emoji]) => ({ id:slug(name), name, emoji }));
function findMaterial(name) { return MATERIALS.find(m => m.name === name); }

// Real per-material sell prices: a base price band per category (by index range in
// MATERIAL_DEFS) + hand-picked premiums for genuinely valuable materials.
const MATERIAL_PRICE_BANDS = [ // [startIdx, endIdx, basePrice]
  [0,19,6],   // Metals & Alloys
  [20,37,8],  // Electronics
  [38,49,3],  // Plastics & Rubber
  [50,57,4],  // Glass & Ceramic
  [58,65,3],  // Fabric & Textile
  [66,72,3],  // Wood Products
  [73,82,5],  // Stone & Mineral
  [83,87,2],  // Paper & Cardboard
  [88,99,3],  // Misc Junk
];
const MATERIAL_PRICE_OVERRIDES = {
  gold_nugget:40, silver_chip:25, titanium_shard:30, chrome_trim:12,
  microchip:20, power_core:25, solar_cell:18, fiber_optic_cable:14, servo_motor:16,
  crystal_fragment:30, stained_glass_piece:10,
  gemstone_fragment:35, quartz_crystal:20, obsidian_shard:18, marble_chip:10,
  leather_strip:8,
};
function materialPrice(id) {
  if(MATERIAL_PRICE_OVERRIDES[id] !== undefined) return MATERIAL_PRICE_OVERRIDES[id];
  const idx = MATERIALS.findIndex(m => m.id === id);
  const band = MATERIAL_PRICE_BANDS.find(([s,e]) => idx >= s && idx <= e);
  return band ? band[2] : 3;
}

// ── Sell Kiosk — direct "hand over materials, get S.I.P." (no store ownership needed) ──
function openSellKiosk() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('sellKioskModal').style.display = 'flex';
  renderSellKiosk();
}
function closeSellKiosk() {
  document.getElementById('sellKioskModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderSellKiosk() {
  const list = document.getElementById('sellKioskList');
  const held = MATERIALS.filter(m => playerInventory[m.id] && playerInventory[m.id].qty > 0);
  document.getElementById('sellKioskSip').textContent = sipDollars;
  if(held.length === 0) {
    list.innerHTML = '<div style="color:#789;font-size:12px;">No materials to sell — grind junk from The Dump first!</div>';
    return;
  }
  list.innerHTML = '';
  held.forEach(m => {
    const qty = playerInventory[m.id].qty, price = materialPrice(m.id);
    const d = document.createElement('div'); d.className='shopItem';
    d.innerHTML = `<div class="siName">${m.emoji} ${m.name} <span style="color:#9ab;font-weight:normal;">x${qty}</span></div>
      <div class="siCost">💰 ${price} S.I.P. each</div>
      <button class="shopBtn" onclick="sellMaterial('${m.id}',1)">Sell 1</button>
      <button class="shopBtn" style="margin-left:6px;background:#3a9d3a;" onclick="sellMaterial('${m.id}',${qty})">Sell All (+${price*qty})</button>`;
    list.appendChild(d);
  });
}
function sellMaterial(id, qty) {
  const held = playerInventory[id];
  if(!held || held.qty < qty) { showNotif('❌ Not enough of that material!'); return; }
  const price = materialPrice(id);
  const total = price * qty;
  held.qty -= qty;
  if(held.qty <= 0) delete playerInventory[id];
  queueEarning(total, 0, 'Sold Materials');
  sfx.coin();
  const m = MATERIALS.find(x=>x.id===id);
  showNotif(`💰 Sold ${qty}x ${m.emoji} ${m.name} for ${total} S.I.P.!`);
  saveCurrentUser();
  renderSellKiosk();
  refreshInventory();
}

const DUMP_CENTER = { x:-300, z:-300 };
const DUMP_ITEM_DEFS = [
  ['Old TV','📺',['Circuit Board','Glass Shard','Copper Wire']],
  ['Broken Toaster','🍞',['Nickel Alloy','Plastic Chunk','Metal Coil']],
  ['Busted Radio','📻',['Circuit Board','Speaker Magnet','Plastic Casing']],
  ['Old Tire','🛞',['Rubber Tire Chunk','Steel Cable']],
  ['Broken Chair','🪑',['Splintered Wood','Foam Padding','Bent Spring']],
  ['Rusty Bike Frame','🚲',['Steel Plate','Rusty Bolt','Rubber Strip']],
  ['Dead Car Battery','🔋',['Battery Cell','Lead Pipe','Zinc Coating']],
  ['Cracked Mirror','🪞',['Broken Mirror','Wood Veneer']],
  ['Old Washing Machine','🧺',['Steel Plate','Motor Part','Silicone Seal']],
  ['Broken Computer','💻',['Circuit Board','Microchip','Aluminum Sheet']],
  ['Torn Couch','🛋️',['Foam Padding','Cloth Scrap','Wood Chips']],
  ['Old Mattress','🛏️',['Metal Coil','Cotton Batting','Cloth Scrap']],
  ['Broken Umbrella','☂️',['Steel Cable','Nylon Cord','Plastic Gear']],
  ['Shattered Window','🪟',['Glass Shard','Wood Veneer','Aluminum Sheet']],
  ['Old Newspaper Bundle','📰',['Newspaper Stack','Paper Pulp','Cardboard Bundle']],
  ['Broken Skateboard','🛹',['Plywood Scrap','Rubber Tire Chunk','Steel Cable']],
  ['Rusty Toolbox','🧰',['Rusty Nail','Bent Wire Hanger','Steel Plate']],
  ['Cracked Flowerpot','🪴',['Clay Lump','Ceramic Tile','Sand Bag']],
];
const DUMP_ITEMS = DUMP_ITEM_DEFS.map(([name,emoji,yieldNames]) => ({
  id:'junk_'+slug(name), name, emoji,
  yields: yieldNames.map(n => findMaterial(n).id),
}));
let JUNK_PILES = []; // {x,z,mesh,item,zone} — NOT persisted, same ambient category as wreckage/robots
function buildJunkPileMesh(x, z) {
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  [[-0.3,0.2,-0.15],[0.2,0.15,0.2],[0,0.3,0],[0.25,0.1,-0.2]].forEach(([dx,dy,dz]) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.4,0.5), mat(0x6b6b5a));
    s.position.set(dx,dy,dz); s.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    g.add(s);
  });
  return g;
}
function spawnJunkPile(x, z) {
  const item = DUMP_ITEMS[Math.floor(Math.random()*DUMP_ITEMS.length)];
  const mesh = buildJunkPileMesh(x, z);
  const pile = { x, z, mesh, item, zone:null };
  addCol(CITY_COLS, x, z, 0.6, 0.6);
  const zone = { x, z, r:2.5, label:`🗑️ Pick Up ${item.emoji} ${item.name}`, action: () => pickUpJunk(pile) };
  pile.zone = zone;
  CITY_ZONES.push(zone);
  JUNK_PILES.push(pile);
}
function pickUpJunk(pile) {
  if(!pile.mesh) return; // already collected, waiting to respawn
  addToInventory(pile.item.id, pile.item.name, pile.item.emoji);
  saveCurrentUser();
  scene.remove(pile.mesh); pile.mesh = null;
  const zi = CITY_ZONES.indexOf(pile.zone); if(zi>-1) CITY_ZONES.splice(zi,1);
  pile.zone = null;
  showNotif(`🗑️ Picked up ${pile.item.emoji} ${pile.item.name}! Bring it to the Grinder.`);
  sfx.click();
  setTimeout(() => {
    const idx = JUNK_PILES.indexOf(pile); if(idx>-1) JUNK_PILES.splice(idx,1);
    spawnJunkPile(pile.x, pile.z); // real respawn at the same spot, a fresh random item
  }, 30000);
}
function buildDump() {
  buildLogoSign('THE DUMP', '🗑️', '#6b6b5a', '#ffaa00', DUMP_CENTER.x, 5, DUMP_CENTER.z-16);
  const offsets = [[-10,-8],[-4,-11],[3,-9],[9,-6],[-8,2],[-2,5],[4,3],[10,6],[-6,9],[2,10]];
  offsets.forEach(([dx,dz]) => spawnJunkPile(DUMP_CENTER.x+dx, DUMP_CENTER.z+dz));
}
function useGrinder() {
  const messages = [];
  if(wreckagePiles.length > 0) {
    const count = wreckagePiles.length;
    wreckagePiles.forEach(w => {
      scene.remove(w.mesh);
      scrapMetal += 3;
      (w.type && w.type.yields || []).forEach(name => {
        const m = findMaterial(name);
        if(m) addToInventory(m.id, m.name, m.emoji);
      });
    });
    wreckagePiles = [];
    updateScrapMetal();
    messages.push(`${count} wreckage pile${count===1?'':'s'} → +${count*3} 🔩 Scrap Metal + real robot materials`);
  }
  let junkGroundCount = 0;
  DUMP_ITEMS.forEach(item => {
    const held = playerInventory[item.id];
    if(held && held.qty > 0) {
      for(let n=0; n<held.qty; n++) {
        item.yields.forEach(matId => {
          const m = MATERIALS.find(x => x.id === matId);
          addToInventory(m.id, m.name, m.emoji);
        });
      }
      junkGroundCount += held.qty;
      delete playerInventory[item.id];
    }
  });
  if(junkGroundCount > 0) messages.push(`${junkGroundCount} junk item${junkGroundCount===1?'':'s'} → real materials extracted`);

  if(messages.length === 0) { showNotif('⚙️ Nothing to grind — bring wreckage or pick up junk from The Dump!'); return; }
  sfx.power();
  showNotif(`⚙️ ${messages.join(' | ')}`);
  saveCurrentUser();
  refreshInventory();
}

