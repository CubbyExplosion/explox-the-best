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
// The one thing Satan smashed most recently (see satanDestroyBuild() below), so a later God win
// can repair that exact spot instead of just handing out an unrelated gift — not persisted
// (resets on reload), it's just a short-lived link between two events in the same play session.
let lastSatanDestroyed = null; // {plotId, ownerName, isMine, entry} or null
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
// "make it so you and your freind can see your housers" — syncLandOwners() above only pulls WHO
// owns each plot, not what they've actually BUILT there. renderExistingBuildings() reads a
// non-owner's data via getUserData(ownerName), which only works if that account's data is
// already sitting in this browser's localStorage — true for another account on the SAME PC, but
// a real friend on a different machine needs their build data actually fetched from the server
// first. Pulls each other owner's full save (same /api/user/<name> GET doLogin() already uses)
// into the same localStorage key getUserData() reads, then rebuilds so new/changed buildings
// actually appear.
let _lastLandOwnerDataSync = -999;
const LAND_OWNER_DATA_SYNC_INTERVAL = 5; // seconds - a bit slower than land ownership itself, since this pulls a full save per owner
async function syncOtherLandOwnersData() {
  if(serverMode !== 'online') return;
  const owners = getLandOwners();
  const otherOwners = [...new Set(Object.values(owners))].filter(name => name && name !== currentUser);
  if(!otherOwners.length) return;
  await Promise.all(otherOwners.map(async name => {
    try {
      const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/user/' + encodeURIComponent(name), {}, 4000);
      if(r.ok) localStorage.setItem('explox_user_' + name, JSON.stringify(await r.json()));
    } catch(e) { /* next sync will catch up */ }
  }));
  if(LAND_PLOT_MESHES.length) LAND_PLOTS.forEach((plot, idx) => buildLandPlot(idx));
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
// Real "red tape for real construction" gate — City Hall's Forms Office Building Permit
// (approvedPermits/hasPermitFor()/consumePermitFor(), game-shops.js). Only the BIG/pricier tier
// needs one — the starter decorations (tree/flag/wall/shed/fountain/bench/basic house/producers)
// stay exactly as frictionless as before this feature existed. Picked by the same "sip:450+" line
// that already separates the small Small House from the 2-Story House and up in BUILD_CATALOG.
const PERMIT_REQUIRED_BUILDING_IDS = ['house2','house3','house4','mansion'];
const PERMIT_REQUIRED_CUSTOM_HOUSE_MIN_SIZE = 10; // a 10x10+ custom house is the same "big build" tier — HOUSE_SIZES below tops out at 20
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
  // Same real Building Permit gate as placeBuilding() above, for the custom house's own "big
  // build" tier (PERMIT_REQUIRED_CUSTOM_HOUSE_MIN_SIZE) — checked before affordability so an
  // approved permit is never wasted on a house the player can't actually pay for yet.
  const needsPermit = size >= PERMIT_REQUIRED_CUSTOM_HOUSE_MIN_SIZE;
  if (needsPermit && !hasPermitFor(plot.id)) { showNotif(`🏛️ A ${size}x${size} house needs a Building Permit for this plot first — apply at City Hall's Forms Office.`); return; }
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
  if (needsPermit) consumePermitFor(plot.id); // real consequence — spent the moment this big build actually completes
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
// "make it so you and your freind can see your housers" — real bug found while building the
// divine-clash feature (item 304): this always read the CURRENT account's OWN plotBuildings,
// even for a plot someone ELSE owns, so an owner's house/buildings only ever rendered in 3D on
// their own screen — a friend walking up to it just saw an empty fenced lot with a sign, same
// gap already flagged for shops (item 181). Now reads whichever account actually owns this plot.
function renderExistingBuildings(idx) {
  const plot = LAND_PLOTS[idx];
  const ownerName = getLandOwners()[plot.id] || null;
  const isMine = ownerName === currentUser;
  const ownerData = ownerName ? (isMine ? null : getUserData(ownerName)) : null;
  const placed = isMine ? (plotBuildings[plot.id] || []) : (ownerData ? (ownerData.plotBuildings || {})[plot.id] || [] : []);
  const ownerLandColor = isMine ? landColor : (ownerData ? (ownerData.landColor || {}) : {});
  const { cx, cz } = landPlotPos(idx);
  placed.forEach(entry => {
    const key = plot.id+'_'+entry.slot;
    if(PLOT_BUILDING_MESHES[key]) return; // already rendered
    const [ox,oz] = plot.slots[entry.slot];
    const extra = entry.id === 'customhouse' ? { size: entry.houseSize, material: entry.houseMaterial, color: ownerLandColor[plot.id] } : undefined;
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
    const needsPermit = PERMIT_REQUIRED_BUILDING_IDS.includes(b.id);
    const hasPermit = !needsPermit || hasPermitFor(plot.id);
    const d = document.createElement('div'); d.className='shopItem';
    d.innerHTML = `<div class="siName">${b.emoji} ${b.name}</div>
      <div class="siCost">${craftCostText(b) || 'Free'}${b.produces?` — makes ${b.produces.amount} ${b.produces.type==='sip'?'S.I.P.':b.produces.type==='wood'?'Wood':'Scrap'} every ${b.produces.everySec}s`:''}${needsPermit?` — 🏛️ ${hasPermit?'Permit ready':'Needs a Building Permit'}`:''}</div>
      <button class="shopBtn" onclick="placeBuilding(${idx},'${b.id}')" ${(!canAfford||full||!hasPermit)?'disabled':''}>${full?'Plot Full':(!hasPermit?'🏛️ Need Permit':'Build')}</button>`;
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
  const houseNeedsPermit = effSize >= PERMIT_REQUIRED_CUSTOM_HOUSE_MIN_SIZE;
  const houseHasPermit = !houseNeedsPermit || hasPermitFor(plot.id);
  document.getElementById('houseBuildCostText').textContent = `${effSize}x${effSize} ${HOUSE_MATERIALS[selectedHouseMaterial].name} house costs: ${craftCostText(houseCost) || 'Free'}`
    + (houseNeedsPermit ? (houseHasPermit ? ' — 🏛️ Permit ready' : ' — 🏛️ Needs a Building Permit from City Hall') : '');

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
  const needsPermit = PERMIT_REQUIRED_BUILDING_IDS.includes(buildingId);
  // hasPermitFor() is checked (not consumed) BEFORE the affordability check below on purpose — a
  // real bug this avoids: consuming the permit here and THEN finding out the player can't actually
  // afford the build would waste a real approved permit on a build that never happened.
  if(needsPermit && !hasPermitFor(plot.id)) { showNotif(`🏛️ ${def.name} needs a Building Permit for this plot first — apply at City Hall's Forms Office.`); return; }
  if(!canAffordRecipe(def)) { showNotif(`❌ Need ${craftCostText(def)}`); return; }
  const usedSlots = placed.map(p=>p.slot);
  let slot = -1;
  for(let i=0;i<plot.slots.length;i++){ if(!usedSlots.includes(i)) { slot=i; break; } }
  if(def.wood) { woodCount -= def.wood; updateWood(); }
  if(def.sip)  { spendSip(def.sip); updateSIP(); }
  if(def.scrap) { scrapMetal -= def.scrap; updateScrapMetal(); }
  spendMats(def.mats);
  placed.push({ slot, id: buildingId, _t:0 });
  if(needsPermit) consumePermitFor(plot.id); // real consequence — the permit is spent the moment the build actually completes
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

// ── Divine create/destroy — called from tickDivineClash() in game-world.js when a clash
// resolves. Satan smashes one real placed building somewhere in Sunset Plains (yours or another
// real owner's — same cross-account patchUserData()/pendingNotices pattern as attackOwner() and
// smashBuilding() above, so an offline owner finds out next login); God either repairs that exact
// spot back or, if there's nothing to repair, blesses the CURRENT player with a free decoration.
// Both return a message string (or null if there was truly nothing to do) rather than calling
// showNotif() directly — the clash's own "Satan/God won" notif already occupies the single
// #notification element, so the caller staggers this one in after it, same as endWrathAfterDeath().
function landOwnerBuildingsList(ownerName, isMine, plotId) {
  return isMine ? (plotBuildings[plotId] || []) : ((getUserData(ownerName).plotBuildings || {})[plotId] || []);
}
function buildingDisplayName(entry) {
  if (entry.id === 'customhouse') return `${entry.houseSize}x${entry.houseSize} House`;
  const def = BUILD_CATALOG.find(b => b.id === entry.id);
  return def ? `${def.emoji} ${def.name}` : entry.id;
}
function satanDestroyBuild() {
  const owners = getLandOwners();
  const candidates = [];
  LAND_PLOTS.forEach((plot, idx) => {
    const ownerName = owners[plot.id];
    if (!ownerName) return;
    const isMine = ownerName === currentUser;
    if (landOwnerBuildingsList(ownerName, isMine, plot.id).length) candidates.push({ idx, plot, ownerName, isMine });
  });
  if (!candidates.length) return null; // nothing built anywhere yet for Satan to smash
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const placed = landOwnerBuildingsList(pick.ownerName, pick.isMine, pick.plot.id);
  const victimIdx = Math.floor(Math.random() * placed.length);
  const entry = placed[victimIdx];
  const name = buildingDisplayName(entry);
  lastSatanDestroyed = { plotId: pick.plot.id, ownerName: pick.ownerName, isMine: pick.isMine, entry: { ...entry } };
  if (pick.isMine) {
    plotBuildings[pick.plot.id].splice(victimIdx, 1);
    saveCurrentUser();
    const key = pick.plot.id + '_' + entry.slot;
    if (PLOT_BUILDING_MESHES[key]) { scene.remove(PLOT_BUILDING_MESHES[key]); delete PLOT_BUILDING_MESHES[key]; }
    return `🔥 Satan struck down your ${name} at ${pick.plot.name}!`;
  }
  patchUserData(pick.ownerName, d => {
    d.plotBuildings = d.plotBuildings || {};
    const list = d.plotBuildings[pick.plot.id] || [];
    const i = list.findIndex(p => p.slot === entry.slot && p.id === entry.id);
    if (i >= 0) list.splice(i, 1);
    d.plotBuildings[pick.plot.id] = list;
    d.pendingNotices = Array.isArray(d.pendingNotices) ? d.pendingNotices : [];
    d.pendingNotices.push({ message: `🔥 Satan struck down your ${name} at ${pick.plot.name} while the world was in bad hands!` });
  });
  return `🔥 Satan struck down ${pick.ownerName}'s ${name} at ${pick.plot.name}!`;
}
const BLESSING_ITEMS = ['tree', 'flag', 'wall', 'shed', 'fountain', 'bench', 'watchtower', 'greenhouse']; // decorations only — never a machine or a house, that'd be a free-money exploit
// Places one free BUILD_CATALOG item on the current player's own land — the first owned plot
// with an open slot. Returns a real "<name> at <plot>" description, or null if there's genuinely
// nowhere to put it (no owned land, or every owned plot is full). Shared by godFreeGift() (picks
// a random decoration) and interpretPrayerGrant() below (places whatever the player asked for).
function placeFreeBuildingOnOwnedLand(id) {
  let targetIdx = -1;
  for (const lotId of ownedLand) {
    const idx = LAND_PLOTS.findIndex(p => p.id === lotId);
    if (idx < 0) continue;
    const plot = LAND_PLOTS[idx];
    if ((plotBuildings[plot.id] || []).length < plot.slots.length) { targetIdx = idx; break; }
  }
  if (targetIdx < 0) return null;
  const plot = LAND_PLOTS[targetIdx];
  const placed = plotBuildings[plot.id] || (plotBuildings[plot.id] = []);
  const usedSlots = placed.map(p => p.slot);
  let slot = -1;
  for (let i = 0; i < plot.slots.length; i++) { if (!usedSlots.includes(i)) { slot = i; break; } }
  placed.push({ slot, id, _t: 0 });
  saveCurrentUser();
  const { cx, cz } = landPlotPos(targetIdx);
  const [ox, oz] = plot.slots[slot];
  PLOT_BUILDING_MESHES[plot.id + '_' + slot] = buildStructureMesh(id, cx + ox, cz + oz);
  return `${buildingDisplayName({ id })} at ${plot.name}`;
}
function godFreeGift() {
  const id = BLESSING_ITEMS[Math.floor(Math.random() * BLESSING_ITEMS.length)];
  const placedDesc = placeFreeBuildingOnOwnedLand(id);
  if (placedDesc) return `✨ God blessed your land with a free ${placedDesc}!`;
  const gift = 25;
  woodCount += gift; updateWood(); saveCurrentUser();
  return `✨ God blessed you with ${gift} 🪵 wood!`;
}
// ── "you type what u want theb god can grant it" — real keyword matching on the player's own
// typed prayer text, same idea as SAI's keyword-matched answers (game-sai.js), just applied
// here. Numbers are capped so a huge typed number can't be used to break the economy.
// Split into two steps — parse (figure out WHAT is being asked for, no side effects) and
// apply (actually grant it) — so "wish for others" (below) can parse the same way but ship
// the result to someone else's mailbox instead of applying it to the current player.
const PRAYER_SIP_CAP = 1000, PRAYER_WOOD_CAP = 200, PRAYER_ELITE_CAP = 10;
function parsePrayerGrant(text) {
  const lower = text.toLowerCase();
  const numMatch = lower.match(/\d[\d,]*/);
  const num = numMatch ? parseInt(numMatch[0].replace(/,/g, ''), 10) : null;
  if (num !== null && /(sip|s\.i\.p|money|dollar|cash|rich)/.test(lower)) return { type: 'sip', amount: Math.min(num, PRAYER_SIP_CAP) };
  if (num !== null && /wood/.test(lower)) return { type: 'wood', amount: Math.min(num, PRAYER_WOOD_CAP) };
  if (num !== null && /(elite|diamond)/.test(lower)) return { type: 'elite', amount: Math.min(num, PRAYER_ELITE_CAP) };
  const item = BLESSING_ITEMS.find(id => lower.includes(id) || lower.includes(BUILD_CATALOG.find(b => b.id === id).name.toLowerCase()));
  if (item) return { type: 'item', id: item };
  return null;
}
// Actually grants a parsed wish to the CURRENT player. Returns a real "you received X"
// description, or null if there was nothing to grant (unrecognized text, or a decoration
// with nowhere left to put it) — prayAtChurch() falls back to the generic reward in that
// case, so a grant always does SOMETHING even when the wording doesn't match anything real.
function applyPrayerGrant(parsed) {
  if (!parsed) return null;
  if (parsed.type === 'sip') { queueEarning(parsed.amount, 0, 'Prayer Granted'); return `${parsed.amount.toLocaleString()} S.I.P.`; }
  if (parsed.type === 'wood') { woodCount += parsed.amount; updateWood(); saveCurrentUser(); return `${parsed.amount.toLocaleString()} 🪵 wood`; }
  if (parsed.type === 'elite') { queueEarning(0, parsed.amount, 'Prayer Granted'); return `${parsed.amount.toLocaleString()} 💎 Elite Coins`; }
  return placeFreeBuildingOnOwnedLand(parsed.id); // may be null if there's no open slot anywhere
}
function interpretPrayerGrant(text) {
  return applyPrayerGrant(parsePrayerGrant(text));
}
function godBlessing() {
  if (!lastSatanDestroyed) return godFreeGift();
  const { plotId, ownerName, isMine, entry } = lastSatanDestroyed;
  lastSatanDestroyed = null;
  const plotIdx = LAND_PLOTS.findIndex(p => p.id === plotId);
  if (plotIdx < 0 || getLandOwners()[plotId] !== ownerName) return godFreeGift(); // plot's gone or changed hands since
  const plot = LAND_PLOTS[plotIdx];
  const placed = landOwnerBuildingsList(ownerName, isMine, plotId);
  if (placed.some(p => p.slot === entry.slot)) return godFreeGift(); // someone already rebuilt that exact spot
  const name = buildingDisplayName(entry);
  if (isMine) {
    plotBuildings[plotId].push({ ...entry });
    saveCurrentUser();
    const { cx, cz } = landPlotPos(plotIdx);
    const [ox, oz] = plot.slots[entry.slot];
    const extra = entry.id === 'customhouse' ? { size: entry.houseSize, material: entry.houseMaterial, color: landColor[plotId] } : undefined;
    PLOT_BUILDING_MESHES[plotId + '_' + entry.slot] = buildStructureMesh(entry.id, cx + ox, cz + oz, extra);
    return `✨ God repaired your ${name} at ${plot.name}!`;
  }
  patchUserData(ownerName, d => {
    d.plotBuildings = d.plotBuildings || {};
    const list = d.plotBuildings[plotId] || [];
    list.push({ ...entry });
    d.plotBuildings[plotId] = list;
    d.pendingNotices = Array.isArray(d.pendingNotices) ? d.pendingNotices : [];
    d.pendingNotices.push({ message: `✨ God repaired your ${name} at ${plot.name}!` });
  });
  return `✨ God repaired ${ownerName}'s ${name} at ${plot.name}!`;
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
  if (isPeacefulMode()) return; // user's own ask: "a peaceful so no one will spawn" (game-customization.js)
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
// "/spawn robot" (game-admin.js) — same real robot object trySpawnRobot() above builds, just
// placed next to the player instead of at a spawner, and with spawnerIdx:null since it has no
// home spawner to send a replacement to on defeat (see the null check in defeatRobot() below).
function adminSpawnRobotNearPlayer() {
  const type = pickRobotType();
  const angle = Math.random()*Math.PI*2, dist = 4;
  const x = playerGroup.position.x + Math.cos(angle)*dist, z = playerGroup.position.z + Math.sin(angle)*dist;
  const mesh = buildRobotMesh(x, z, type.color, type.shape);
  const mult = robotPowerMult();
  mesh.scale.setScalar(robotSizeMult());
  const col = addCol(CITY_COLS, x, z, 0.6, 0.6);
  const hp = Math.round(type.hp * mult);
  const robot = { id:ROBOT_ID_SEQ++, x, z, hp, maxHp:hp, type, mesh, spawnerIdx:null, alive:true, zone:null, col,
    homeX:x, homeZ:z, wanderX:x, wanderZ:z, speed:(2+Math.random()*1.3)*(type.speedMult||1),
    powerMult:mult, rewardRange:[Math.round(type.reward[0]*mult), Math.round(type.reward[1]*mult)],
    eliteReward: Math.round((ELITE_COIN_REWARD[type.id]||0)*mult) };
  const zone = { x, z, r:2.8, label:`🤖 Fight ${type.name}`, action: () => fightRobot(robot) };
  robot.zone = zone;
  CITY_ZONES.push(zone);
  robots.push(robot);
  return type.name;
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
  // spawnerIdx is null for an admin-spawned robot (adminSpawnRobotNearPlayer(), game-controls.js) —
  // it has no home spawner to send a replacement, so skip rather than call trySpawnRobot(null).
  if (robot.spawnerIdx != null) setTimeout(() => trySpawnRobot(robot.spawnerIdx), 7000);
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
  if (isPeacefulMode()) return; // user's own ask: "a peaceful so no one will spawn" (game-customization.js)
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
  const outdoors = !inHouse && !inMall && !inHotel && !inStore && !inFriendHouse && !inLandHouse && !inCountryHotel && !inAirportLounge && !inPrison && !inArcade && !inCar && !inArenaBattle && !inMovieFight && !inBankInterior && !inSportsPark && !inHospital && !inSea && !inSchool && !inVisitStore;
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
function KILLER_HP() { return Math.round(200 * mobDifficultyMult()); }
function KILLER_REWARD_ELITE() { return Math.round(500 * mobDifficultyMult()); }
// KILLER SUPREME — user's own ask: "a killer you only see once [per] 2 days explox ones and is 10
// times better and can summon killers at demand." A real ambient encounter, same "just appears in
// the world on its own" spirit as a regular Killer/Robber — NOT a walk-up-and-pay challenge like
// Satan. Gated by the exact same cooldown shape as SATAN_BOSS_COOLDOWN_DAYS/lastSatanBossFightAt
// (game-world.js), just far shorter (2 Explox days instead of 500) — see killerSupremeReady()
// below and the spawn check in tickKillers(). 10x HP, 10x damage, 10x reward, exactly as asked.
let killerSupremeTimer = 0;
const KILLER_SUPREME_CHECK_INTERVAL = 10; // how often to re-check the cooldown, not a spawn chance — spawns the instant it's ready
const KILLER_SUPREME_COOLDOWN_DAYS = 2;
// NOT `KILLER_SUPREME_COOLDOWN_DAYS * DAY_LENGTH` computed here as a top-level const — DAY_LENGTH
// lives in game-zones.js, which loads AFTER this file (see modules/README.md's own warning on
// this exact trap), so a top-level reference here would silently evaluate as NaN. Computed live
// inside killerSupremeSecondsRemaining() below instead, by which time every script has loaded.
function KILLER_SUPREME_HP() { return KILLER_HP() * 10; }
const KILLER_SUPREME_DMG_MIN = 80, KILLER_SUPREME_DMG_MAX = 150; // 10x the ambient Killer's 8-15 — scaled by mobDifficultyMult() at the one place these are actually used, below
function KILLER_SUPREME_REWARD_ELITE() { return KILLER_REWARD_ELITE() * 10; }
const KILLER_SUPREME_SUMMON_INTERVAL = 15, KILLER_SUPREME_SUMMON_MAX = 3; // "summon killers at demand" — real ordinary Killers pushed into killers[], same shape Satan's own summon already uses
function killerSupremeSecondsRemaining() {
  return Math.max(0, KILLER_SUPREME_COOLDOWN_DAYS*DAY_LENGTH - (playTimeSeconds - lastKillerSupremeFightAt));
}
function killerSupremeReady() {
  return killerSupremeSecondsRemaining() <= 0;
}
function buildKillerSupremeMesh(x, z) {
  const g = buildKillerMesh(x, z);
  g.scale.setScalar(1.6); // visibly bigger than an ordinary Killer, reads as "10 times better" at a glance
  const crownMat = new THREE.MeshLambertMaterial({color:0xFFD700});
  const crown = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.35,0.9), crownMat);
  crown.position.set(0, 3.75, 0); g.add(crown);
  [-0.35,0,0.35].forEach(cx => { const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12,0.3,4), crownMat); spike.position.set(cx,3.98,0); g.add(spike); });
  return g;
}
function spawnKillerSupreme() {
  if (isPeacefulMode()) return; // user's own ask: "a peaceful so no one will spawn" (game-customization.js)
  const angle = Math.random()*Math.PI*2, dist = 40+Math.random()*30;
  const x = playerGroup.position.x + Math.cos(angle)*dist, z = playerGroup.position.z + Math.sin(angle)*dist;
  const mesh = buildKillerSupremeMesh(x, z);
  mesh.visible = false;
  killers.push({ id:'killersupreme'+ROBOT_ID_SEQ++, x, z, hp:KILLER_SUPREME_HP(), maxHp:KILLER_SUPREME_HP(), mesh, alive:true,
    speed:3.5+Math.random()*2, attackTimer:0, summonTimer:0, revealed:false, killerSupreme:true });
  lastKillerSupremeFightAt = playTimeSeconds;
  saveCurrentUser();
  showNotif("👑 Something powerful stirs in the city tonight...");
}
function killerSupremeSummon(k) {
  if (!k.alive) return;
  if (isPeacefulMode()) return; // user's own ask: "a peaceful so no one will spawn" — covers switching to Peaceful mid-fight against an already-alive Killer Supreme, not just the initial spawn above

  if (killers.filter(x => x.alive && x.summonedBySupreme).length >= KILLER_SUPREME_SUMMON_MAX) return;
  const angle = Math.random()*Math.PI*2, dist = 5+Math.random()*4;
  const x = playerGroup.position.x + Math.cos(angle)*dist, z = playerGroup.position.z + Math.sin(angle)*dist;
  const mesh = buildKillerMesh(x, z);
  mesh.visible = true;
  killers.push({ id:'killer'+ROBOT_ID_SEQ++, x, z, hp:KILLER_HP(), maxHp:KILLER_HP(), mesh, alive:true,
    speed:3.5+Math.random()*2, attackTimer:0, atkInterval:KILLER_ATTACK_INTERVAL, revealed:true, summonedBySupreme:true });
  showNotif('👑 Killer Supreme summons a Killer to their side!');
  sfx.tense();
}
function tickKillerSupremeCombat(k, dt) {
  const dx = playerGroup.position.x-k.x, dz = playerGroup.position.z-k.z, dist = Math.hypot(dx,dz);
  if (!k.revealed && dist <= KILLER_REVEAL_RANGE) { k.revealed = true; k.mesh.visible = true; sfx.tense(); showNotif('👑 Killer Supreme has appeared!'); }
  if (dist > KILLER_ATTACK_RANGE) {
    k.attackTimer = 0;
    k.x += dx/dist*k.speed*dt; k.z += dz/dist*k.speed*dt;
    k.mesh.position.set(k.x, 0, k.z);
    k.mesh.rotation.y = Math.atan2(dx, dz);
  } else {
    k.attackTimer += dt;
    if (k.attackTimer >= KILLER_ATTACK_INTERVAL) {
      k.attackTimer = 0;
      damagePlayer(Math.round((KILLER_SUPREME_DMG_MIN + Math.floor(Math.random()*(KILLER_SUPREME_DMG_MAX-KILLER_SUPREME_DMG_MIN+1))) * mobDifficultyMult()), "Killer Supreme's blade");
    }
  }
  k.summonTimer += dt;
  if (k.summonTimer >= KILLER_SUPREME_SUMMON_INTERVAL) { k.summonTimer = 0; killerSupremeSummon(k); }
}
function fightKillerSupreme(killer) {
  if (!killer.alive) return;
  const dmg = getWeaponDamage();
  killer.hp -= dmg;
  triggerSwing();
  startKnockback(playerGroup.position.x, playerGroup.position.z, killer.x, killer.z,
    (x, z) => { killer.x = x; killer.z = z; killer.mesh.position.set(x, 0, z); });
  sfx.clang();
  if (killer.hp > 0) {
    showNotif(`👑 Hit Killer Supreme for ${dmg}! (${killer.hp}/${killer.maxHp} HP left)`);
    return;
  }
  defeatKillerSupreme(killer);
}
function defeatKillerSupreme(killer) {
  killer.alive = false;
  scene.remove(killer.mesh);
  buildKillerCorpse(killer.x, killer.z);
  killerDefeats++;
  totalKills++; checkWrathTrigger(); checkDivineJudgment();
  const kSupReward = KILLER_SUPREME_REWARD_ELITE();
  queueEarning(0, kSupReward, 'Killer Supreme');
  sfx.boom();
  showNotif(`👑 You defeated Killer Supreme! +${kSupReward.toLocaleString()} 💎 — a legendary victory!`);
}
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
function ROBBER_HP() { return Math.round(40 * mobDifficultyMult()); }
const ROBBER_REVEAL_RANGE = 20, ROBBER_ATTACK_RANGE = 2.5;
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
  killers.push({ id:'killer'+ROBOT_ID_SEQ++, x, z, hp:KILLER_HP(), maxHp:KILLER_HP(), mesh, alive:true, speed:3.5+Math.random()*2, attackTimer:0, atkInterval, revealed:true, guardKiller:true });
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
// ── SPY AMBUSHERS — the real payoff of the ambient Spy-watcher system (spawnSpy/tickSpies and
// the favorite-spot tracking, both game-world.js): once the Spies have quietly tracked enough
// real time at one of the player's favorite hangouts, this is what shows up there. Same shared
// killers[] array/mesh/fight infrastructure as every other Killer sub-type above (guardKiller/
// robber/demon), flagged `spy:true`, and same body shape as buildKillerMesh right above (reusing
// that exact geometry on purpose — these ARE the Spies, finally showing their hand), just
// recolored into a trench coat + fedora + dark glasses instead of a black hood, so the connection
// to the ambient watchers reads on sight.
function buildSpyAmbusherMesh(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const coat = 0x3a3226, skinC = 0xd9b38c, dark = 0x1f1a12;
  const mk = (w,h,d,color,px,py,pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color})); m.position.set(px,py,pz); m.castShadow = true; g.add(m); return m; };
  mk(0.9,0.9,0.9, skinC, 0,2.8,0); // head
  // Dark glasses — the exact same 3-box shape as playerHat==='sunglasses' (game-character.js),
  // reused here instead of inventing a new accessory.
  mk(0.9,0.22,0.1, 0x111111, 0,2.87,0.52);
  mk(0.15,0.15,0.35, 0x222222, -0.5,2.87,0.35);
  mk(0.15,0.15,0.35, 0x222222, 0.5,2.87,0.35);
  mk(1.5,0.1,1.5, 0x2a2418, 0,3.32,0); mk(0.9,0.65,0.9, 0x2a2418, 0,3.65,0); // fedora — same 2-box shape as makeNPC's hat==='fedora'
  mk(0.9,1.1,0.5, coat, 0,1.75,0); // torso — trench coat, not an ordinary Killer's black hood
  mk(0.35,0.9,0.35, coat,-0.65,1.75,0); mk(0.35,0.9,0.35, coat,0.65,1.75,0); // arms
  mk(0.38,0.9,0.38, dark,-0.22,0.75,0); mk(0.38,0.9,0.38, dark,0.22,0.75,0); // legs
  mk(0.42,0.22,0.5, dark,-0.22,0.1,0.05); mk(0.42,0.22,0.5, dark,0.22,0.1,0.05); // feet
  // Same dagger prop as an ordinary Killer — combat is the exact same shared pipeline, only the look differs.
  const blade = mk(0.08,0.55,0.1, 0xc0c0c0, 0.65,1.32,0.28); blade.rotation.x = -0.5;
  const hilt = mk(0.14,0.2,0.14, 0x3a2a1a, 0.65,1.05,0.15); hilt.rotation.x = -0.5;
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const cx2 = cv.getContext('2d');
  cx2.fillStyle = 'rgba(20,20,20,0.75)'; cx2.fillRect(0,16,256,32);
  cx2.fillStyle = '#cccccc'; cx2.font = 'bold 22px monospace'; cx2.textAlign = 'center';
  cx2.fillText('▓▓ THE SPY ▓▓', 128, 40);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(2.4,0.6), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  tag.position.y = 4.5; g.add(tag);
  scene.add(g);
  return g;
}
// Called by triggerSpyAmbush() (game-world.js) once the discovery threshold + return-visit
// condition are both met. No stealth reveal (mesh.visible=true, revealed:true from the start) —
// the whole point of the moment is "they were WAITING for you here," not another slow approach.
// Combat itself is 100% the existing tickAmbientKillerCombat() dispatch path in tickKillers()
// below (spy isn't guardKiller/hitTarget/robber/demon, so it falls straight through to that same
// final branch) — no new combat code, only spawn + flag + a defeat-message branch in
// defeatKiller() below, per the ask not to duplicate the combat system.
function spawnSpyAmbusher(x, z) {
  const mesh = buildSpyAmbusherMesh(x, z);
  mesh.visible = true;
  const atkInterval = KILLER_ATTACK_INTERVAL * (0.8 + Math.random()*0.5);
  killers.push({ id:'spy'+ROBOT_ID_SEQ++, x, z, hp:KILLER_HP(), maxHp:KILLER_HP(), mesh, alive:true, speed:3.5+Math.random()*2, attackTimer:0, atkInterval, revealed:true, spy:true });
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
  if (isPeacefulMode()) return; // user's own ask: "a peaceful so no one will spawn" (game-customization.js)
  const ang = Math.random()*Math.PI*2, dist = 25+Math.random()*15;
  const x = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, playerGroup.position.x+Math.cos(ang)*dist));
  const z = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, playerGroup.position.z+Math.sin(ang)*dist));
  const mesh = buildRobberMesh(x, z);
  mesh.visible = false;
  if (satanReignActive) demonizeMesh(mesh);
  killers.push({ id:'robber'+ROBOT_ID_SEQ++, x, z, hp:ROBBER_HP(), maxHp:ROBBER_HP(), mesh, alive:true, speed:4+Math.random()*1.5, revealed:false, robber:true, fleeing:false });
}
// "5x bad entites" — Satan won this round, so newly-spawned Killers/Robbers get a demonic
// recolor (dark red/black + a red glow) instead of their normal look. Purely visual — same
// hp/dmg/AI as always, just a real reason for "demons" to actually look different on-screen.
function demonizeMesh(mesh) {
  mesh.traverse(o => { if (o.isMesh && o.material && o.material.color && (!o.geometry || o.geometry.type !== 'PlaneGeometry')) o.material.color.setHex(0x220000); });
  const glow = new THREE.PointLight(0xff0000, 1.5, 8); glow.position.y = 3; mesh.add(glow);
}
// Cash/ATM feature — a real mugger takes the cash out of your actual pocket first (more
// realistic than skimming your bank-tracked S.I.P. balance out of thin air, and it's the same
// "cash is the vulnerable one" tradeoff the whole feature is built around — see the matching
// cash-loss branch in knockoutPlayer(), game-social.js). Only falls back to the old S.I.P.-steal
// behavior when the player isn't carrying any cash at all, so a robber encounter still means
// something for a player who banks everything.
function robMoney(k) {
  const pct = ROBBER_STEAL_PCT_MIN + Math.random()*(ROBBER_STEAL_PCT_MAX-ROBBER_STEAL_PCT_MIN);
  if (cash > 0) {
    const stolen = Math.max(1, Math.round(cash * pct));
    cash = Math.max(0, cash - stolen);
    updateCash();
    showNotif(`🥷 A robber snatched $${stolen.toLocaleString()} cash right out of your pocket and ran off!`);
    sfx.nope();
    k.fleeing = true;
    return;
  }
  const stolen = Math.round(sipDollars * pct);
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
  totalKills++; checkWrathTrigger(); checkDivineJudgment();
  const badLuck = satanReignActive;
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
  if (isPeacefulMode()) return; // user's own ask: "a peaceful so no one will spawn" (game-customization.js)
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
  if (satanReignActive) demonizeMesh(mesh); // "more demons" — Satan won this round, so what spawns looks the part
  killers.push({ id:'killer'+ROBOT_ID_SEQ++, x, z, hp:KILLER_HP(), maxHp:KILLER_HP(), mesh, alive:true, speed:3.5+Math.random()*2, attackTimer:0, atkInterval, revealed:false });
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
      if (!isEvilImmune()) damagePlayer(Math.round((8+Math.floor(Math.random()*8))*mobDifficultyMult()), "a Killer's dagger");
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
  if (satanReignActive) return 5;
  if (now < safePeriodEndsAt) return 0;
  return 1;
}

// ─── DEMONS — real named followers of Satan, NOT Satan itself. God and Satan stay exactly what
// the game-world.js comment above tickDivineClash() already established: an abstract light-vs-
// shadow clash over the Church, never a literal character to hit or click on. These are Satan's
// own troops sent out while he's actually winning — same shared killers[] array/mesh/fight
// infrastructure as everything else here (a 5th mode alongside robber/guardKiller/hitTargetName/
// hitTargetType), flagged `demon:true`, but they ONLY ever spawn while satanReignActive is true
// (see tickSatanEvent()/endSatanReign() in game-world.js) — once the reign ends they don't just
// linger, tickKillers() below clears them out the same way a Guard shift's own killers get cleared
// when the shift ends. Tougher than an ambient Killer and themed in SATAN_COLOR (game-world.js's
// established "satan purple power") so they read as Satan's own on sight, not just another
// re-skinned mob. Defeating one is also real progress toward ending the reign — see
// satanReignProgress in defeatDemon() below.
const DEMON_DEFS = [
  { name:'Vraxis',  emoji:'😈', line:'"The boss owns the world for a while. I plan on making the most of it."' },
  { name:'Ghorlak', emoji:'👹', line:'"Every time the light wins, we just come back stronger. You should be more worried than that."' },
  { name:'Skreel',  emoji:'💀', line:"\"Don't take it personal. Down here, everybody gets a turn.\"" },
  { name:'Malchor', emoji:'🔥', line:'"Beat one of us and three more show up. That\'s just how the bad hands go."' },
];
function DEMON_HP() { return Math.round(260 * mobDifficultyMult()); }
const DEMON_REVEAL_RANGE = 9, DEMON_ATTACK_RANGE = 2.5, DEMON_ATTACK_INTERVAL = 1.0;
function DEMON_REWARD_ELITE() { return Math.round(650 * mobDifficultyMult()); } // a step up from an ambient Killer's 500 — these are Satan's own troops, not petty street crime
const DEMON_MAX_ACTIVE = 3, DEMON_SPAWN_INTERVAL = 40; // real seconds between spawn rolls, only ever checked while satanReignActive is true
let demonTimer = 0;
function buildDemonMesh(x, z, def) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const dark = 0x1a0022; // near-black with a purple cast, distinct from an ordinary Killer's flat 0x0a0a0a
  const mk = (w,h,d,color,px,py,pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color})); m.position.set(px,py,pz); m.castShadow = true; g.add(m); return m; };
  mk(1,1,1, dark, 0,2.8,0); // head
  const eyeMat = new THREE.MeshBasicMaterial({color:SATAN_COLOR}); // purple eyes, not a Killer's red — Satan's own, not just another crook
  [-0.22,0.22].forEach(ex => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.14,0.14,0.05), eyeMat); e.position.set(ex,2.85,0.51); g.add(e); });
  mk(0.9,1.1,0.5, dark, 0,1.75,0); // torso
  mk(0.35,0.9,0.35, dark,-0.65,1.75,0); mk(0.35,0.9,0.35, dark,0.65,1.75,0); // arms
  mk(0.38,0.9,0.38, dark,-0.22,0.75,0); mk(0.38,0.9,0.38, dark,0.22,0.75,0); // legs
  mk(0.42,0.22,0.5, dark,-0.22,0.1,0.05); mk(0.42,0.22,0.5, dark,0.22,0.1,0.05); // feet
  // A pair of curved horns — the one silhouette detail an ambient Killer's hood never has, so even
  // at a glance (before the nametag is readable) these read as something else entirely.
  [-1,1].forEach(side => {
    const horn = mk(0.12,0.55,0.12, 0x0a0010, side*0.32,3.55,0);
    horn.rotation.z = side*0.35;
  });
  const glow = new THREE.PointLight(SATAN_COLOR, 2, 12); glow.position.y = 3; g.add(glow); // same purple as the Satan clash beam, not a Killer's red
  // A real nametag with the demon's actual name — unlike a plain Killer's glitchy "UNKNOWN" tag,
  // these are named enough to have their own line of dialogue (DEMON_DEFS above).
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const cx2 = cv.getContext('2d');
  cx2.fillStyle = 'rgba(30,0,45,0.8)'; cx2.fillRect(0,16,256,32);
  cx2.fillStyle = '#cc88ff'; cx2.font = 'bold 22px monospace'; cx2.textAlign = 'center';
  cx2.fillText(`${def.emoji} ${def.name}`, 128, 40);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(2.4,0.6), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  tag.position.y = 4.5; g.add(tag);
  scene.add(g);
  return g;
}
function spawnDemon() {
  if (isPeacefulMode()) return; // user's own ask: "a peaceful so no one will spawn" (game-customization.js) — the Satan-summoned demons during a Satan Reign world event go through their own separate inline spawn, not this function, since that's a deliberate story event the player already opted into rather than random ambient danger
  const def = DEMON_DEFS[Math.floor(Math.random()*DEMON_DEFS.length)];
  const ang = Math.random()*Math.PI*2, dist = 30+Math.random()*20;
  const x = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, playerGroup.position.x+Math.cos(ang)*dist));
  const z = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, playerGroup.position.z+Math.sin(ang)*dist));
  const mesh = buildDemonMesh(x, z, def);
  mesh.visible = false; // same "no sign it's coming" reveal-on-approach as an ambient Killer
  const atkInterval = DEMON_ATTACK_INTERVAL * (0.8 + Math.random()*0.5);
  killers.push({ id:'demon'+ROBOT_ID_SEQ++, x, z, hp:DEMON_HP(), maxHp:DEMON_HP(), mesh, alive:true, speed:4+Math.random()*2, attackTimer:0, atkInterval, revealed:false, demon:true, demonDef:def });
}
// "/spawn demon" (game-admin.js) — same real demon object spawnDemon() above builds, just placed
// next to the player and already revealed, so an admin can test-fight one without waiting on the
// real Satan-wins roll (or the outdoors/satanReignActive gate tickKillers() enforces below).
function adminSpawnDemonNearPlayer() {
  const def = DEMON_DEFS[Math.floor(Math.random()*DEMON_DEFS.length)];
  const angle = Math.random()*Math.PI*2, dist = 2.5;
  const x = playerGroup.position.x + Math.cos(angle)*dist, z = playerGroup.position.z + Math.sin(angle)*dist;
  const mesh = buildDemonMesh(x, z, def);
  mesh.visible = true;
  killers.push({ id:'demon'+ROBOT_ID_SEQ++, x, z, hp:DEMON_HP(), maxHp:DEMON_HP(), mesh, alive:true, speed:4+Math.random()*2, attackTimer:0, atkInterval:DEMON_ATTACK_INTERVAL, revealed:true, demon:true, demonDef:def });
  return def.name;
}
function tickDemonCombat(k, dt) {
  const dx = playerGroup.position.x-k.x, dz = playerGroup.position.z-k.z;
  const dist = Math.hypot(dx,dz);
  if (!k.revealed && dist <= DEMON_REVEAL_RANGE) {
    k.revealed = true; k.mesh.visible = true; sfx.tense();
    showNotif(`${k.demonDef.emoji} ${k.demonDef.name}: ${k.demonDef.line}`);
  }
  if (dist < DEMON_ATTACK_RANGE) {
    k.attackTimer += dt;
    if (k.attackTimer > k.atkInterval) {
      k.attackTimer = 0;
      if (!isEvilImmune()) damagePlayer(Math.round((10+Math.floor(Math.random()*10))*mobDifficultyMult()), `${k.demonDef.name}'s claws`);
    }
  } else {
    k.x += dx/dist*k.speed*dt; k.z += dz/dist*k.speed*dt;
    k.mesh.position.set(k.x, 0, k.z);
    k.mesh.rotation.y = Math.atan2(dx, dz);
  }
}
function tickKillers(dt) {
  killerTimer += dt;
  const outdoors = !inHouse && !inMall && !inHotel && !inStore && !inFriendHouse && !inLandHouse && !inCountryHotel && !inAirportLounge && !inPrison && !inArcade && !inCar && !inArenaBattle && !inMovieFight && !inBankInterior && !inSportsPark && !inHospital && !inSea && !inSchool && !inVisitStore;
  const evilMult = evilSpawnMultiplier();
  if (killerTimer >= killerSpawnInterval() / Math.max(1,evilMult)) {
    killerTimer = 0;
    // Only counts ambient killers against the ambient cap now — a Guard shift's own separate
    // GUARD_KILLER_MAX_ACTIVE pool used to count against this too, silently starving ambient
    // spawns for the whole 20-minute shift. Real bug, fixed while touching this code anyway.
    // `!k.spy` alongside the existing exclusions — a one-time favorite-spot ambush (game-world.js's
    // triggerSpyAmbush) shouldn't count against or suppress the normal ambient Killer spawn rate.
    if (outdoors && evilMult>0 && killers.filter(k=>k.alive && !k.guardKiller && !k.hitTargetName && !k.hitTargetType && !k.robber && !k.demon && !k.spy && !k.killerSupreme && !k.summonedBySupreme).length < killerMaxActive()*evilMult) spawnKiller();
  }
  // KILLER SUPREME — real ambient spawn the instant the 2-Explox-day cooldown clears (checked
  // periodically, not on the same fast timer as ordinary Killers — there's no random chance here,
  // just a wait), same "just shows up in the world" spirit as everything else in this function.
  killerSupremeTimer += dt;
  if (killerSupremeTimer >= KILLER_SUPREME_CHECK_INTERVAL) {
    killerSupremeTimer = 0;
    if (outdoors && killerSupremeReady() && !killers.some(k => k.alive && k.killerSupreme)) spawnKillerSupreme();
  }
  robberTimer += dt;
  if (robberTimer >= ROBBER_SPAWN_INTERVAL / Math.max(1,evilMult)) {
    robberTimer = 0;
    if (outdoors && evilMult>0 && killers.filter(k=>k.alive && k.robber).length < ROBBER_MAX_ACTIVE*evilMult) spawnRobber();
  }
  // Demons only ever spawn while Satan's Reign is active — this is what actually ties them to the
  // Satan storyline instead of just being reskinned Killers. Once the reign ends, any still
  // standing get cleared out the same beat a Guard shift's own killers do.
  if (satanReignActive) {
    demonTimer += dt;
    if (demonTimer >= DEMON_SPAWN_INTERVAL) {
      demonTimer = 0;
      if (outdoors && killers.filter(k=>k.alive && k.demon).length < DEMON_MAX_ACTIVE) spawnDemon();
    }
  } else if (killers.some(k => k.demon && k.alive)) {
    clearDemons();
    demonTimer = 0;
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
    if (k.demon) { tickDemonCombat(k, dt); return; }
    if (k.satanBoss) { tickSatanBossCombat(k, dt); return; }
    if (k.killerSupreme) { tickKillerSupremeCombat(k, dt); return; }
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
  totalKills++; checkWrathTrigger(); checkDivineJudgment();
  const badLuck = satanReignActive;
  const reward = badLuck ? Math.max(1, Math.round(KILLER_REWARD_ELITE()*0.5)) : KILLER_REWARD_ELITE();
  queueEarning(0, reward, killer.spy ? 'Spy Ambusher' : 'Killer');
  sfx.boom();
  if (killer.spy) {
    // Distinct flavor text only — same reward math, same totalKills/Wrath/Judgment counting as an
    // ordinary Killer above, per the ask not to duplicate the combat/reward system.
    showNotif(`💀 Fought off one of the Spies! +${reward} 💎${badLuck ? ' (bad luck is cutting your rewards right now...)' : ''}`);
    if (!killers.some(k => k.alive && k.spy)) showNotif('🕵️ The ambush is over — they won\'t be back again for a long while.');
  } else {
    showNotif(`💀 Defeated the killer! +${reward} 💎${badLuck ? ' (bad luck is cutting your rewards right now...)' : ''}`);
  }
}
// Fight/defeat for a Demon (spawn/mesh/combat-tick live up above, before tickKillers, same
// ordering the rest of this Killer section already uses) — same shape as fightKiller/defeatKiller
// just above, with its own name-aware messages and Elite-only reward.
function fightDemon(demon) {
  if (!demon.alive) return;
  const dmg = getWeaponDamage();
  demon.hp -= dmg;
  triggerSwing();
  startKnockback(playerGroup.position.x, playerGroup.position.z, demon.x, demon.z,
    (x, z) => { demon.x = x; demon.z = z; demon.mesh.position.set(x, 0, z); });
  sfx.clang();
  if (demon.hp > 0) {
    showNotif(`⚔️ Hit ${demon.demonDef.name} for ${dmg}! (${demon.hp}/${demon.maxHp} HP left)`);
    return;
  }
  defeatDemon(demon);
}
function defeatDemon(demon) {
  demon.alive = false;
  scene.remove(demon.mesh);
  buildKillerCorpse(demon.x, demon.z); // same fallen-body/blood-pool treatment as an ambient Killer
  killerDefeats++;
  totalKills++; checkWrathTrigger(); checkDivineJudgment();
  // Real progress toward ending Satan's Reign — see SATAN_REIGN_GOAL/endSatanReign() in
  // game-world.js. Guarded on satanReignActive (not just "demons only exist during the reign
  // anyway") so a stray hit landing the same tick the reign already ended can't double-count.
  if (satanReignActive) satanReignProgress++;
  const demonReward = DEMON_REWARD_ELITE();
  queueEarning(0, demonReward, demon.demonDef.name);
  sfx.boom();
  showNotif(`💀 ${demon.demonDef.emoji} ${demon.demonDef.name} is struck down! +${demonReward} 💎`);
}
// Satan's window closing shouldn't leave his minions standing around in the now-ordinary world —
// same "shift ended mid-fight, don't leave the swarm standing there" treatment tickKillers()
// already gives a Guard shift's own killers once that trigger condition ends (see clearGuardKillers above).
function clearDemons() {
  killers.filter(k => k.demon && k.alive).forEach(k => { k.alive = false; scene.remove(k.mesh); });
}

// ─── SATAN BOSS combat — same shared killers[]/fightX()/tickXCombat() shape every other fightable
// thing in this file uses (a 6th mode alongside guardKiller/hitTargetName/hitTargetType/robber/
// demon), summoned only via challengeSatan() (game-world.js) rather than spawned ambiently — see
// that function's own comment for the God/Satan boundary reasoning. Real combat both ways, unlike
// Wrath (game-world.js), which is deliberately unfightable — this is meant to be won.
// Real flight, not walking — hovers at SATAN_FLY_HEIGHT with a gentle sine bob, updated every
// frame regardless of whether he's currently chasing or standing in attack range.
function satanFlyY(k) {
  k.flyT = (k.flyT || 0) + 0.016; // a fixed small step is fine here — this only drives a cosmetic bob, not real motion, so it doesn't need dt precision
  return SATAN_FLY_HEIGHT + Math.sin(k.flyT*1.6)*SATAN_FLY_BOB;
}
function tickSatanBossCombat(k, dt) {
  k.mesh.position.y = satanFlyY(k);
  // "he can... summon demons and killers" — a real, capped, repeating ability during the fight,
  // not just flavor text. See satanSummon() below.
  k.summonTimer = (k.summonTimer || 0) + dt;
  if (k.summonTimer >= SATAN_SUMMON_INTERVAL) { k.summonTimer = 0; satanSummon(k); }
  const dx = playerGroup.position.x-k.x, dz = playerGroup.position.z-k.z;
  const dist = Math.hypot(dx,dz);
  if (dist < SATAN_BOSS_ATTACK_RANGE) {
    k.attackTimer += dt;
    if (k.attackTimer > k.atkInterval) {
      k.attackTimer = 0;
      if (!isEvilImmune()) damagePlayer(SATAN_BOSS_DMG, "Satan's own hand");
    }
  } else {
    k.x += dx/dist*k.speed*dt; k.z += dz/dist*k.speed*dt;
    k.mesh.position.x = k.x; k.mesh.position.z = k.z;
    k.mesh.rotation.y = Math.atan2(dx, dz);
  }
}
// Summons a real Demon or Killer to fight alongside Satan, same real meshes/combat as their
// ordinary spawns (buildDemonMesh/buildKillerMesh, tickDemonCombat/tickAmbientKillerCombat via the
// normal killers[] dispatch in tickKillers() — nothing new to simulate here). Capped by
// SATAN_SUMMON_MAX (counting only what SATAN summoned, via the summonedBySatan tag) so a long
// 100k-HP fight can't spiral into an unbounded swarm — once some are defeated, he'll summon more.
function satanSummon(k) {
  if (!k.alive) return;
  if (killers.filter(x => x.alive && x.summonedBySatan).length >= SATAN_SUMMON_MAX) return;
  const angle = Math.random()*Math.PI*2, dist = 5+Math.random()*4;
  const x = playerGroup.position.x + Math.cos(angle)*dist, z = playerGroup.position.z + Math.sin(angle)*dist;
  if (Math.random() < 0.5) {
    const def = DEMON_DEFS[Math.floor(Math.random()*DEMON_DEFS.length)];
    const mesh = buildDemonMesh(x, z, def);
    mesh.visible = true;
    killers.push({ id:'demon'+ROBOT_ID_SEQ++, x, z, hp:DEMON_HP(), maxHp:DEMON_HP(), mesh, alive:true, speed:4+Math.random()*2, attackTimer:0, atkInterval:DEMON_ATTACK_INTERVAL, revealed:true, demon:true, demonDef:def, summonedBySatan:true });
    showNotif(`😈 Satan summons ${def.emoji} ${def.name} to his side!`);
  } else {
    const mesh = buildKillerMesh(x, z);
    mesh.visible = true;
    killers.push({ id:'killer'+ROBOT_ID_SEQ++, x, z, hp:KILLER_HP(), maxHp:KILLER_HP(), mesh, alive:true, speed:3.5+Math.random()*2, attackTimer:0, atkInterval:KILLER_ATTACK_INTERVAL, revealed:true, summonedBySatan:true });
    showNotif('😈 Satan summons a Killer from the shadows!');
  }
  sfx.tense();
}
function fightSatanBoss(satan) {
  if (!satan.alive) return;
  const dmg = getWeaponDamage();
  satan.hp -= dmg;
  triggerSwing();
  startKnockback(playerGroup.position.x, playerGroup.position.z, satan.x, satan.z,
    (x, z) => { satan.x = x; satan.z = z; satan.mesh.position.x = x; satan.mesh.position.z = z; });
  sfx.clang();
  if (satan.hp > 0) {
    showNotif(`⚔️ Struck Satan for ${dmg}! (${satan.hp.toLocaleString()}/${satan.maxHp.toLocaleString()} HP left)`);
    return;
  }
  defeatSatanBoss(satan);
}
function defeatSatanBoss(satan) {
  satan.alive = false;
  scene.remove(satan.mesh);
  triggerSatanDeathExplosion(); // the same real black-sky/particle-burst sequence the automatic clash outcome already uses — Satan "dying" always looks like this, whether it's the abstract clash or a real fought win
  // The reward is explicitly framed as GRANTED by God's judgment for the win, not loot Satan
  // dropped — see the section header comment above (game-world.js) for why that framing matters.
  queueEarning(SATAN_BOSS_SIP_REWARD, SATAN_BOSS_ELITE_REWARD, 'Satan defeated');
  sfx.boom();
  showNotif(`✨ Satan is struck down! God grants you ${SATAN_BOSS_SIP_REWARD.toLocaleString()} S.I.P. and ${SATAN_BOSS_ELITE_REWARD.toLocaleString()} 💎 for the win.`);
  setTimeout(() => showNotif(`😈 He'll be back in ${SATAN_BOSS_COOLDOWN_DAYS} Explox days — not gone, just beaten back again.`), 2400);
}

// ─── COMBAT GRENADE — user's own ask: "make grenades... for daily combats." A real, repeatable Q-
// key ability (not a limited carried item — this is a combat TOOL for everyday fights, not a rare
// consumable), dealing real area damage to every fightable thing near the player at once: Killers,
// Robbers, Demons, and even the Satan Boss. Deliberately does NOT touch guardKiller/hitTargetName/
// hitTargetType entries — those aren't fighting the player (they hunt the Bank or another NPC), so
// an AoE centered on the player has no business reaching them. On a real cooldown so it's a genuine
// "when things get chaotic" panic button, not a way to trivially one-key every fight.
const GRENADE_COOLDOWN_MS = 15000, GRENADE_BLAST_RADIUS = 9, GRENADE_DAMAGE_MULT = 1.5;
let grenadeCooldownUntil = 0; // Date.now() ms — NOT persisted, same category as wrathActive (a mid-cooldown reload just clears it)
function throwCombatGrenade() {
  if (!playerGroup) return;
  const now = Date.now();
  if (now < grenadeCooldownUntil) {
    showNotif(`💣 Grenade recharging — ${Math.ceil((grenadeCooldownUntil-now)/1000)}s left.`);
    return;
  }
  grenadeCooldownUntil = now + GRENADE_COOLDOWN_MS;
  const dmg = Math.round(getWeaponDamage() * GRENADE_DAMAGE_MULT);
  let hitCount = 0, killCount = 0;
  killers.filter(k => k.alive && !k.guardKiller && !k.hitTargetName && !k.hitTargetType).forEach(k => {
    if (Math.hypot(playerGroup.position.x-k.x, playerGroup.position.z-k.z) > GRENADE_BLAST_RADIUS) return;
    hitCount++;
    k.hp -= dmg;
    if (k.hp > 0) return;
    killCount++;
    if (k.satanBoss) defeatSatanBoss(k);
    else if (k.demon) defeatDemon(k);
    else if (k.robber) defeatRobber(k);
    else defeatKiller(k);
  });
  spawnGrenadeBlastFx(playerGroup.position.x, playerGroup.position.z);
  sfx.boom();
  showNotif(hitCount ? `💣 Grenade hits ${hitCount} enem${hitCount===1?'y':'ies'} for ${dmg}!${killCount?` (${killCount} defeated)`:''}` : '💣 Grenade goes off — nothing in range.');
}
// A self-contained particle burst, deliberately NOT wired into the main animate() loop like
// tickSatanDeathParticles — a short setInterval is enough for a one-off effect like this and keeps
// the change local to this one function instead of touching game-controls.js's tick order.
function spawnGrenadeBlastFx(x, z) {
  const parts = [];
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.18+Math.random()*0.15,6,6), new THREE.MeshBasicMaterial({color: i%2?0xff8800:0xffcc00, transparent:true, opacity:0.95}));
    m.position.set(x, 0.6, z);
    scene.add(m);
    const dir = new THREE.Vector3((Math.random()-0.5)*2, Math.random()*0.7, (Math.random()-0.5)*2).normalize();
    parts.push({ mesh:m, vel: dir.multiplyScalar(6+Math.random()*5) });
  }
  let elapsed = 0;
  const iv = setInterval(() => {
    elapsed += 0.05;
    parts.forEach(p => {
      p.mesh.position.addScaledVector(p.vel, 0.05);
      p.mesh.material.opacity = Math.max(0, 1 - elapsed/0.5);
    });
    if (elapsed >= 0.5) {
      clearInterval(iv);
      parts.forEach(p => scene.remove(p.mesh));
    }
  }, 50);
}

// ── THROW ANY ITEM — user's own ask: "make it so you can throw any of your items with damage
// and each one is 3d when you throw it", corrected right after a first auto-target pass to "NO YOU
// get to choose and it will have dotted lines to aim" — so this is a real aim-and-release mechanic,
// not an auto-lock. Every item in the Inventory panel (playerInventory) and every food in the Bag
// (playerBag) gets a real "🎯 Throw" button (refreshInventory(), game-housing.js): clicking it enters
// AIM MODE — a dashed line traces the exact real arc the item will fly (reusing your existing mouse-
// look yaw to aim direction and pitch to control throw distance, the same look controls you already
// use to move the camera, so aiming needs no new input scheme), and a click/tap RELEASES it as a
// genuine 3D object — an emoji billboard, so a thrown 🍕 actually looks like a flying pizza, same
// "draw to a canvas, wrap it in a CanvasTexture" pattern nametags already use (game-character.js) —
// arcing through the air over real travel time to wherever you aimed, then dealing real damage to
// whatever's actually standing there using the same hp -= dmg / defeat-on-death shape every other
// hit in this game uses (see fightKiller above). Damage is a fraction of your equipped weapon's
// damage (weaker than an actual swing or the Grenade's real explosive blast — this is "whatever you
// happened to be holding", not a purpose-built weapon), so it scales with progression exactly like
// everything else instead of needing a hand-tuned value for the ~300 different throwable items here.
const ITEM_THROW_COOLDOWN_MS = 500, ITEM_THROW_MAX_RANGE = 16, ITEM_THROW_MIN_RANGE = 4,
      ITEM_THROW_DAMAGE_MULT = 0.5, ITEM_THROW_DURATION = 0.38, ITEM_THROW_ARC_HEIGHT = 2.6,
      ITEM_THROW_HIT_RADIUS = 3.2; // how close to the landing point something has to be standing to actually get hit
let itemThrowCooldownUntil = 0; // Date.now() ms — same "not persisted" category as grenadeCooldownUntil
let thrownItems = []; // {mesh, startX,startY,startZ, tx,ty,tz, elapsed, dur, dmg, emoji} — ticked by tickThrownItems() (game-controls.js animate())
let aimingThrow = null; // {source:'inventory'|'food', key, emoji, name} while a throw is being aimed, else null
let throwAimLine = null; // THREE.Line (dashed) previewing the real flight arc, rebuilt every frame while aiming

// Where the aimed throw would land right now, using the SAME yaw the player already steers with
// (Math.sin/cos(yaw) — the exact forward-vector convention the Tank cannon/Jet guns/melee all use)
// for direction, and pitch (already mouse/touch-look driven, range -0.5..1.0 — game-controls.js) for
// distance: looking up throws further/higher, looking down keeps it close, so "aiming" is just using
// the look controls you already have, no new input scheme needed.
function computeThrowLanding() {
  if (!playerGroup) return null;
  const t = Math.max(0, Math.min(1, (pitch + 0.5) / 1.5)); // pitch's real range is -0.5..1.0
  const dist = ITEM_THROW_MIN_RANGE + (ITEM_THROW_MAX_RANGE - ITEM_THROW_MIN_RANGE) * t;
  const x = playerGroup.position.x + Math.sin(yaw) * dist;
  const z = playerGroup.position.z + Math.cos(yaw) * dist;
  return { x, z, y: groundHeightAt(x, z) };
}

// Same "who's actually fightable" filter as throwCombatGrenade's killers check, but centered on a
// chosen POINT (the landing spot) rather than the player, since the player is now aiming — not
// auto-locking onto whatever happens to be nearest to themselves.
function findEnemyNearPoint(x, z, radius) {
  let best = null, bestDist = radius;
  killers.filter(k => k.alive && !k.guardKiller && !k.hitTargetName && !k.hitTargetType).forEach(k => {
    const d = Math.hypot(x-k.x, z-k.z);
    if (d < bestDist) { bestDist = d; best = { ref:k, kind:'killer' }; }
  });
  robots.filter(r => r.alive).forEach(r => {
    const d = Math.hypot(x-r.x, z-r.z);
    if (d < bestDist) { bestDist = d; best = { ref:r, kind:'robot' }; }
  });
  rogueRobots.filter(r => r.alive).forEach(r => {
    const d = Math.hypot(x-r.x, z-r.z);
    if (d < bestDist) { bestDist = d; best = { ref:r, kind:'rogue' }; }
  });
  return best;
}

// A small always-faces-camera billboard showing the item's own emoji, exactly like the "draw to a
// canvas, wrap it in a CanvasTexture" nametag/sign pattern used all over this game — just on a
// THREE.Sprite instead of a name-tag plane so it needs no rotation math while it flies.
function buildThrownItemSprite(emoji) {
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
  const ctx = cv.getContext('2d');
  ctx.font = '46px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(emoji || '📦', 32, 36);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent:true, depthTest:true }));
  sprite.scale.set(0.6, 0.6, 0.6);
  return sprite;
}

// ── AIM MODE — entered by the "🎯 Throw" button (throwInventoryItem()/throwFoodItem() below),
// exited by confirmAimThrow() (release) or cancelAimThrow() (Escape/right-click/the ✕ button). Input
// wiring (click-to-confirm, right-click/Escape-to-cancel, the on-screen confirm/cancel buttons for
// touch) lives in game-controls.js, right next to the rest of setupControls()/setupMobileControls().
function startAimThrow(source, key, emoji, name) {
  if (aimingThrow) return; // already aiming something else — finish or cancel that throw first
  if (Date.now() < itemThrowCooldownUntil) { showNotif('🎯 Wait a moment before throwing again.'); return; }
  aimingThrow = { source, key, emoji, name };
  closeInventory(); // let them see the world to aim
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock(); // re-lock so mouse-look keeps steering the aim
  showThrowAimHud(emoji, name);
}
function cancelAimThrow(showMsg) {
  if (!aimingThrow) return;
  const a = aimingThrow;
  aimingThrow = null;
  hideThrowAimHud();
  if (throwAimLine) { scene.remove(throwAimLine); throwAimLine.geometry.dispose(); throwAimLine.material.dispose(); throwAimLine = null; }
  if (showMsg) showNotif(`🎯 Put the ${a.emoji} ${a.name} away.`);
}
// Small always-on-top overlay shown only while aiming — names what you're about to throw and gives
// touch players a real confirm/cancel button (desktop can also just click the canvas / press Esc,
// wired in setupControls(), game-controls.js).
function showThrowAimHud(emoji, name) {
  const hud = document.getElementById('throwAimHud');
  if (!hud) return;
  document.getElementById('throwAimLabel').textContent = `${emoji} Aiming ${name}`;
  hud.style.display = 'flex';
}
function hideThrowAimHud() {
  const hud = document.getElementById('throwAimHud');
  if (hud) hud.style.display = 'none';
}
function confirmAimThrow() {
  if (!aimingThrow) return;
  const a = aimingThrow;
  const landing = computeThrowLanding();
  cancelAimThrow(false); // clear aim state/line first — the flight below is a completely separate tracked effect
  itemThrowCooldownUntil = Date.now() + ITEM_THROW_COOLDOWN_MS;
  const dmg = Math.round(getWeaponDamage() * ITEM_THROW_DAMAGE_MULT);
  const startX = playerGroup.position.x, startZ = playerGroup.position.z, startY = playerGroup.position.y + 1.3;
  const sprite = buildThrownItemSprite(a.emoji);
  sprite.position.set(startX, startY, startZ);
  scene.add(sprite);
  thrownItems.push({
    mesh: sprite, startX, startY, startZ,
    tx: landing.x, tz: landing.z, ty: landing.y + 0.4,
    elapsed: 0, dur: ITEM_THROW_DURATION, dmg, emoji: a.emoji
  });
  sfx.whoosh();
  // Consume it now — you released it, it's gone either way, same as any real thrown object.
  if (a.source === 'inventory') {
    const it = playerInventory[a.key];
    if (it) { it.qty--; if (it.qty <= 0) delete playerInventory[a.key]; saveCurrentUser(); }
  } else {
    const idx = playerBag.findIndex(f => f.name === a.key);
    if (idx !== -1) playerBag.splice(idx, 1);
    updateBagHud();
  }
  refreshInventory();
}

// Per-frame aim-line update — hooked into the main animate() loop (game-controls.js) right next to
// tickThrownItems below. Rebuilds a DASHED line (LineDashedMaterial — a real "dotted line", the
// user's own ask) each frame along the same parabola the real throw will fly, from your hand out to
// wherever you're currently aiming, so it always reflects your current look direction live. Colored
// green when something's actually standing in the hit radius at the current landing point, white
// otherwise — real, useful aim feedback rather than just a decorative line.
const THROW_AIM_SEGMENTS = 16;
function tickThrowAim() {
  if (!aimingThrow || !playerGroup) return;
  const landing = computeThrowLanding();
  const startX = playerGroup.position.x, startZ = playerGroup.position.z, startY = playerGroup.position.y + 1.3;
  const willHit = !!findEnemyNearPoint(landing.x, landing.z, ITEM_THROW_HIT_RADIUS);
  const pts = [];
  for (let i = 0; i <= THROW_AIM_SEGMENTS; i++) {
    const p = i / THROW_AIM_SEGMENTS;
    pts.push(new THREE.Vector3(
      startX + (landing.x-startX)*p,
      startY + (landing.y+0.4-startY)*p + Math.sin(p*Math.PI)*ITEM_THROW_ARC_HEIGHT,
      startZ + (landing.z-startZ)*p
    ));
  }
  if (!throwAimLine) {
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({ color:0xffffff, dashSize:0.35, gapSize:0.25, linewidth:2 });
    throwAimLine = new THREE.Line(geo, mat);
    scene.add(throwAimLine);
  } else {
    throwAimLine.geometry.setFromPoints(pts);
  }
  throwAimLine.material.color.setHex(willHit ? 0x44ff66 : 0xffffff);
  throwAimLine.computeLineDistances(); // required every time the geometry changes, or the dashes stop rendering correctly
}

// Per-frame flight update — hooked into the main animate() loop (game-controls.js), same category
// AND same dt-accumulates-toward-a-duration idiom as tickKnockbacks above: a short-lived list of
// in-flight effects, each ticked and pruned every frame, driven by the real per-frame dt rather than
// wall-clock time (so it behaves correctly regardless of frame rate, a paused debugger, etc.).
function tickThrownItems(dt) {
  for (let i = thrownItems.length-1; i >= 0; i--) {
    const it = thrownItems[i];
    it.elapsed += dt;
    const p = Math.min(1, it.elapsed / it.dur);
    it.mesh.position.x = it.startX + (it.tx-it.startX)*p;
    it.mesh.position.z = it.startZ + (it.tz-it.startZ)*p;
    it.mesh.position.y = it.startY + (it.ty-it.startY)*p + Math.sin(p*Math.PI)*ITEM_THROW_ARC_HEIGHT;
    if (p < 1) continue;
    scene.remove(it.mesh);
    thrownItems.splice(i, 1);
    applyThrownItemHit(it);
  }
}

// Lands the hit — searches for whatever's actually standing near where it landed (the player aimed,
// they don't get a guaranteed lock-on) and applies the same hp -= dmg / "still alive? notify :
// defeat" shape as fightKiller/fightRobot above, dispatching to the right defeat function for
// whichever of the three enemy arrays it found the target in.
function applyThrownItemHit(it) {
  const found = findEnemyNearPoint(it.tx, it.tz, ITEM_THROW_HIT_RADIUS);
  if (!found) { showNotif(`🎯 The ${it.emoji} lands... nothing there.`); return; }
  const target = found.ref;
  burstConfetti(new THREE.Vector3(target.x, 1, target.z), 6);
  sfx.hit();
  target.hp -= it.dmg;
  if (target.hp > 0) {
    const label = found.kind === 'killer' ? 'the killer' : ((target.type && target.type.name) || 'the target');
    showNotif(`🎯 Hit ${label} for ${it.dmg}!`);
    return;
  }
  if (found.kind === 'robot') { defeatRobot(target); return; }
  if (found.kind === 'rogue') { defeatRogueRobot(target); return; }
  if (target.satanBoss) defeatSatanBoss(target);
  else if (target.demon) defeatDemon(target);
  else if (target.robber) defeatRobber(target);
  else defeatKiller(target);
}

// ── Public entry points — one per item source, since playerInventory (id-keyed, has a real qty)
// and playerBag (a plain array — duplicates just push more entries, game-engine.js) are shaped
// completely differently. Both are wired to a "🎯 Throw" button in refreshInventory() (game-
// housing.js), the same panel the "🎒 BAG" tab already opens — both just START aim mode; the actual
// throw (and item consumption) happens on release, in confirmAimThrow() above. ──
function throwInventoryItem(id) {
  const it = playerInventory[id];
  if (!it) return;
  startAimThrow('inventory', id, it.emoji, it.name);
}
function throwFoodItem(name) {
  const idx = playerBag.findIndex(f => f.name === name);
  if (idx === -1) return;
  const food = playerBag[idx];
  startAimThrow('food', name, food.emoji, food.name);
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
let inEventBattle = false; // true only while the CURRENT arena run came from Today's Event's own button (startTodaysChallenge() below) — NOT persisted, same ephemeral category as inArenaBattle itself

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
  inEventBattle = false; // leaving early forfeits nothing (the day isn't marked claimed until a real win) but the flag itself must not survive into the next normal arena visit
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
  document.getElementById('arenaHud').style.display = 'none';
  showNotif(`🏆 ARENA CLEARED! All ${arenaTotalRobots} robots defeated! +${bonusSip} S.I.P. +${bonusElite} 💎`);
  // Today's Event challenge (startTodaysChallenge() below) rides on top of the normal arena clear
  // above — a real once-per-real-day surprise bonus, on top of the normal per-robot/completion pay,
  // only when this particular run came from that button (not a normal Robot Arena visit).
  if (inEventBattle) {
    inEventBattle = false;
    lastEventBattleClaim = todayDateString();
    const surpriseSip = EVENT_BATTLE_BONUS_SIP_MIN + Math.floor(Math.random()*(EVENT_BATTLE_BONUS_SIP_MAX-EVENT_BATTLE_BONUS_SIP_MIN+1));
    queueEarning(surpriseSip, 0, "Today's Event Challenge");
    showNotif(`🎁 Today's Event bonus: +${surpriseSip.toLocaleString()} S.I.P.!`);
  }
  saveCurrentUser();
}
// TODAY'S EVENT CHALLENGE — the Daily Events tab's own button ("make it so the daily events tab is
// like a special map you play in, could be fighting, and in the tab is a button" — user's own ask,
// with "random" enemies and "random" reward as the follow-up answer). Reuses the real Robot Arena
// above wholesale (same pocket space, same tickArenaRobots() chase-and-attack fight, same
// fightArenaRobot() combat) instead of building a second fake copy of it — the "random enemies"
// part is already exactly what pickRobotType() does every time a robot spawns (a weighted pick
// across all 6 real robot types), so a random robot COUNT here is enough to make every run feel
// different without inventing a whole second enemy roster. Skips the manual count-picker modal
// (this is meant to be today's one-tap challenge, not a difficulty choice) and grants one surprise
// S.I.P. bonus in finishArenaBattle() above, once per real calendar day.
const EVENT_BATTLE_MIN_ROBOTS = 5, EVENT_BATTLE_MAX_ROBOTS = 20;
const EVENT_BATTLE_BONUS_SIP_MIN = 200, EVENT_BATTLE_BONUS_SIP_MAX = 2000;
function startTodaysChallenge() {
  const today = todayDateString();
  if (lastEventBattleClaim === today) { showNotif("⚔️ Already fought today's challenge — come back tomorrow!"); return; }
  document.getElementById('neighborModal').style.display = 'none';
  inArenaBattle = true;
  inEventBattle = true;
  arenaConfiguring = false;
  playerGroup.position.set(ROBOT_ARENA_SPAWN.x, 0, ROBOT_ARENA_SPAWN.z-10);
  yaw = 0;
  arenaTotalRobots = EVENT_BATTLE_MIN_ROBOTS + Math.floor(Math.random()*(EVENT_BATTLE_MAX_ROBOTS-EVENT_BATTLE_MIN_ROBOTS+1));
  arenaDefeatedCount = 0;
  arenaRunning = true;
  updateArenaHud();
  document.getElementById('arenaHud').style.display = 'block';
  spawnArenaWave();
  showNotif(`⚔️ Today's Challenge: defeat ${arenaTotalRobots} robots for a surprise bonus!`);
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
// Real bone-rigged Doctor NPC (built once by buildHospitalInterior() below) — set here so
// animate()'s per-frame patrol/walk-cycle code (game-controls.js) can reach its bones without a
// separate lookup. Patrols a short real lane along X centered on DOCTOR_SPOT, using the exact
// same WALK_CYCLE_CADENCE/WALK_CYCLE_SWING_AMP brisk-gait formula the player's own walk uses.
let doctorRig = null;
const DOCTOR_PATROL_RANGE = 1.8; // half-width of the pacing lane (units either side of DOCTOR_SPOT.x) — short, stays clear of the exam table/sign
const DOCTOR_PATROL_SPEED = 2.6; // units/sec the lane position advances — brisk, not a shuffle
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

  // Doctor's exam area — a real table + a doctor NPC-style figure, not just an empty room.
  // Real THREE.Bone rig below (hipsBone/spineBone/headBone/leftShoulderBone/rightShoulderBone/
  // leftHipBone/rightHipBone) — the SAME bone names/hierarchy buildPlayer()/buildOtherPlayerAvatar()
  // already use (game-character.js), just re-scaled to this figure's own box proportions — so the
  // brisk walk-cycle bone-rotation code in animate() (game-controls.js) has real joints to swing
  // instead of rotating a raw mesh around its own center.
  box(3,0.9,1.6, 0xffffff, DOCTOR_SPOT.x, 0.45, DOCTOR_SPOT.z-3); // exam table
  box(3,0.15,1.6, 0xddeeff, DOCTOR_SPOT.x, 0.92, DOCTOR_SPOT.z-3); // table pad
  const doc = new THREE.Group();
  const DOC_SPINE_Y = 1.65, DOC_HEAD_Y = 2.2, DOC_SHOULDER_X = 0.6, DOC_SHOULDER_Y = 2.1, DOC_HIP_X = 0.2, DOC_HIP_Y = 1.15;
  const docHips = new THREE.Bone(); docHips.position.set(0, DOC_SPINE_Y, 0); doc.add(docHips);
  const docSpine = new THREE.Bone(); docHips.add(docSpine); // same local-origin-as-hips simplification buildPlayer() uses
  const docHead = new THREE.Bone(); docHead.position.set(0, DOC_HEAD_Y-DOC_SPINE_Y, 0); docSpine.add(docHead);
  const docLSh = new THREE.Bone(); docLSh.position.set(-DOC_SHOULDER_X, DOC_SHOULDER_Y-DOC_SPINE_Y, 0); docSpine.add(docLSh);
  const docRSh = new THREE.Bone(); docRSh.position.set(DOC_SHOULDER_X, DOC_SHOULDER_Y-DOC_SPINE_Y, 0); docSpine.add(docRSh);
  const docLHip = new THREE.Bone(); docLHip.position.set(-DOC_HIP_X, DOC_HIP_Y-DOC_SPINE_Y, 0); docHips.add(docLHip);
  const docRHip = new THREE.Bone(); docRHip.position.set(DOC_HIP_X, DOC_HIP_Y-DOC_SPINE_Y, 0); docHips.add(docRHip);
  doc.hipsBone=docHips; doc.spineBone=docSpine; doc.headBone=docHead;
  doc.leftShoulderBone=docLSh; doc.rightShoulderBone=docRSh;
  doc.leftHipBone=docLHip; doc.rightHipBone=docRHip;
  doc.skeleton = new THREE.Skeleton([docHips, docSpine, docHead, docLSh, docRSh, docLHip, docRHip]);
  const mkDoc = (bone,bwx,bwy,bwz,w,h,d,color,px,py,pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color})); m.position.set(px-bwx,py-bwy,pz-bwz); bone.add(m); return m; };
  mkDoc(docHead,0,DOC_HEAD_Y,0, 0.8,0.8,0.8, 0xd9b38c, 0,2.6,0); // head
  mkDoc(docSpine,0,DOC_SPINE_Y,0, 0.9,1.1,0.5, 0xffffff, 0,1.65,0); // white coat torso
  mkDoc(docLSh,-DOC_SHOULDER_X,DOC_SHOULDER_Y,0, 0.35,0.9,0.35, 0xffffff,-0.6,1.65,0); // arms
  mkDoc(docRSh,DOC_SHOULDER_X,DOC_SHOULDER_Y,0, 0.35,0.9,0.35, 0xffffff,0.6,1.65,0);
  mkDoc(docLHip,-DOC_HIP_X,DOC_HIP_Y,0, 0.38,0.9,0.38, 0x2244aa,-0.2,0.7,0); // scrub pants
  mkDoc(docRHip,DOC_HIP_X,DOC_HIP_Y,0, 0.38,0.9,0.38, 0x2244aa,0.2,0.7,0);
  doc.position.set(DOCTOR_SPOT.x, 0, DOCTOR_SPOT.z+2);
  scene.add(doc);
  doctorRig = doc; // hands the rig to animate()'s real patrol/walk-cycle tick (game-controls.js)
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

// ─── SCHOOL — CLASSROOM (real walk-in pocket space for the PLAYER'S OWN character). The School
// building has existed in the city since early on (real exterior, real sign — see buildCity() in
// game-buildings.js) but its door only ever opened the kid-enrollment menu (openSchool(),
// game-shops.js — enroll an adopted child, passive growth bonus). That system stays completely
// untouched below; this adds a genuinely separate, fully optional way to go yourself: a real
// pocket-space classroom (same pattern as the Hospital/Sports Park/Sea above). The city door opens
// a small choice between the two (openSchoolEntrance()), instead of jumping straight into the kid
// menu — see CITY_ZONES's 'Enter School' entry.
//
// ─── REBUILT into a real SCHOOL DAY (coordinator's ask: port City Life's real school system —
// citylife/src/school.js — into Explox's own engine/economy). What used to be "walk to a desk,
// answer 10 questions back to back, done" is now a real multi-stage visit with pacing:
//   1. A real period schedule (SCHOOL_PERIODS, further down) — 5 class periods, each a different
//      subject (SCHOOL_QUESTIONS_PER_CLASS questions apiece = 10 total, the same total the old flat
//      quiz always asked), interleaved with a snack break, a lunch break, and P.E., ending in
//      dismissal — see advanceSchoolPeriod() further down.
//   2. A real teacher NPC (buildSchoolNPCs()/tickSchoolNPCs() below) that wanders near the board
//      during class periods and, on its own real timer, WALKS OVER to the player and asks the
//      question itself — the question modal isn't a button you press, it force-opens the instant
//      the teacher arrives (openSchoolQuestion(), further down), same "it comes to you" feel as
//      City Life's teacherApproachState/updateSchoolNPCs(). You can close the modal and watch it
//      happen in 3D.
//   3. Real seated classmate NPCs at the room's actual desks (ambient presence + a one-line "talk"
//      chat each), same makeNPC()+flavor-text-zone pattern the Science Lab's Scientists
//      (buildLabNPCs(), game-world.js) and the Prison's Rocco/Dusty already use elsewhere.
//   4. Real subject rotation per period, reusing Explox's OWN existing content instead of inventing
//      a new bank: the 4 age-band SCHOOL_QUESTIONS_* pools below (now tagged Math/Reading/Social by
//      classifySchoolQuestion()'s real keyword rules further down — see the comment above that
//      function for why a keyword classifier instead of retyping 552 hand-written questions by
//      hand), the Science Lab's own real 95-question SCIENCE_QUESTIONS bank (further down this
//      file) for the Science period, and a small new hand-written Art bank (SCHOOL_ART_* below)
//      since Art genuinely didn't exist in either pool yet.
//   5. Real exam days — every 10th school day actually started (schoolVisitCount) — with real
//      Explox-shaped stakes (double S.I.P. per correct AND a real S.I.P. penalty at dismissal if
//      too many were wrong) instead of City Life's happiness/health hit, since Explox doesn't track
//      those. See the SCHOOL_EXAM_* consts further down for the exact numbers and reasoning.
//   6. Real homework — assigned at dismissal, doable any time before the NEXT school day from the
//      new homeworkTab HUD button (EXPLOX.html), with a real modest S.I.P. penalty if it's still
//      unfinished when the next school day starts. Wrong attempts don't penalize or clear it — same
//      "keep trying" shape as City Life's answerHomework().
//   7. Real snack/lunch breaks that reuse Explox's OWN eatFood() (game-engine.js) instead of a
//      parallel food system — 2-3 real choices per break, same function every bag-eaten food uses.
//   8. A real bully encounter. City Life's HTML intro text ("Bullies sometimes show up at
//      school...") turned out to be a REAL implemented mechanic on closer inspection — it just
//      lives in citylife/src/events.js (maybeSpawnBully/spawnBully/showBullyChoice/bullyChoice),
//      not school.js itself. Ported with the same 3 real choices (stand up / walk away / tell the
//      teacher — the safest) and real Explox-shaped stakes: S.I.P. + a real damagePlayer() hit
//      instead of happiness/health.
//
// Deliberate deviation from City Life's actual source: read closely, updateSchoolNPCs() there only
// ever moves the teacher out of 'wandering' when isExamDay is true — the teacher literally never
// approaches (and no question ever gets asked) on a REGULAR day in City Life's real code, which
// contradicts its own "chat with classmates!" flavor text and would leave this feature almost
// pointless most days. Treated as a genuine oversight in that source rather than intended behavior
// worth preserving: here, the teacher approaches every class period regardless of exam day; exam
// days just pay double and add real risk on top, matching what the flavor text (and the original
// game's evident intent) actually describes.
const SCHOOL_SPAWN = { x:160000, z:0 }; // own lane, next free one after Sea(150000)
const SCHOOL_EXIT = { x:70, z:60 }; // real-world door — matches CITY_ZONES's 'Enter School' zone center
let inSchool = false;
function openSchoolEntrance() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('schoolEntranceModal').style.display = 'flex';
}
function closeSchoolEntrance() {
  document.getElementById('schoolEntranceModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function enterSchool() {
  inSchool = true;
  playerGroup.position.set(SCHOOL_SPAWN.x, 0, SCHOOL_SPAWN.z+10);
  yaw = Math.PI;
  showNotif('🏫 Welcome to class!');
}
function leaveSchool() {
  inSchool = false;
  // Walking all the way back out mid-day forfeits the real in-progress school day — same
  // "abandoning it starts clean next time" rule the old single-quiz version had, just scoped to the
  // whole multi-period day now. No homework is assigned unless dismissal was actually reached
  // (assignSchoolHomework() only ever runs from renderSchoolDismissalUI()), so bailing early costs
  // the day's progress but never leaves a phantom homework assignment behind.
  schoolDayState = null;
  removeSchoolBully();
  document.getElementById('classroomModal').style.display = 'none';
  // +6, not the more common +3 other buildings use — real bug found live: the School door zone
  // (CITY_ZONES, r:12 around 70,60) overlaps the much bigger pre-existing "Work as Shopkeeper"
  // zone (r:16 around 65,48) along its whole southern edge (that overlap already existed before
  // this feature — Shopkeeper is listed earlier in CITY_ZONES so it always wins there, same
  // documented issue as the Coffee/Outfit Shop zones above it). +3 (z=63) landed the player
  // inside that overlap sliver, so leaving school and immediately pressing E again showed "Work as
  // Shopkeeper" instead of letting them back in. +6 (z=66) clears Shopkeeper's r:16 with room to
  // spare while staying well inside School's own r:12.
  playerGroup.position.set(SCHOOL_EXIT.x, 0, SCHOOL_EXIT.z+6);
  yaw = 0;
  showNotif('Leaving School...');
}
const CLASS_DESK_SPOT = { x:SCHOOL_SPAWN.x, z:SCHOOL_SPAWN.z-6 };
const SCHOOL_ZONES = [
  { x:CLASS_DESK_SPOT.x, z:CLASS_DESK_SPOT.z, r:4, label:'📝 Start the School Day', action: () => openClassroom()},
  { x:SCHOOL_SPAWN.x, z:SCHOOL_SPAWN.z+10, r:4, label:'🚪 Leave School', action: () => leaveSchool()},
]; // classmate "talk" zones are pushed onto this same array by buildSchoolNPCs() below; a
   // temporary bully zone is pushed/removed by spawnSchoolBully()/removeSchoolBully() below
function buildSchoolInterior() {
  const { x:hx, z:hz } = SCHOOL_SPAWN;
  box(40,0.2,36, 0xf5e6c8, hx,0.1,hz); // floor — warm wood-tone classroom floor
  box(40,0.2,36, 0xffffff, hx,6,hz);   // ceiling
  box(40,6,0.3, 0xe8dcc0, hx,3,hz-18); // back wall (chalkboard wall, north)
  box(0.3,6,36, 0xe8dcc0, hx-20,3,hz); // west wall
  box(0.3,6,36, 0xe8dcc0, hx+20,3,hz); // east wall
  box(17,6,0.3, 0xe8dcc0, hx-11.5,3,hz+18); box(17,6,0.3, 0xe8dcc0, hx+11.5,3,hz+18); // front wall, door gap centered
  buildSign('🏫 CLASSROOM', hx, 6.6, hz-17.7);
  box(8,3,0.4, 0x8B5E3C, hx, 1.5, hz+18); // exit door marker

  // Chalkboard, front and center — a real green board with a chalk tray, not just a plain wall.
  box(11,4,0.15, 0x1a3a24, hx, 3.4, hz-17.75);
  box(11.4,0.25,0.3, 0x8B5E3C, hx, 1.3, hz-17.6); // chalk tray

  // Teacher's desk, right in front of the chalkboard — also where the quiz sign sits (CLASS_DESK_SPOT).
  box(3,1,1.6, 0x8B5E3C, CLASS_DESK_SPOT.x, 0.5, CLASS_DESK_SPOT.z-3.5);
  box(3,0.1,1.6, 0x6a4a2a, CLASS_DESK_SPOT.x, 1.02, CLASS_DESK_SPOT.z-3.5);
  buildSign('📝 START SCHOOL DAY', CLASS_DESK_SPOT.x, 3.6, CLASS_DESK_SPOT.z-2.2);

  // Rows of student desks + chairs, 3 rows x 4 columns — real furnished feel, box-based like every
  // other interior in the game (Hospital's exam table, Sports Park's benches, etc.). Kept as the
  // single source of truth for desk geometry — schoolDeskChairPos() below duplicates this exact
  // row/col formula so buildSchoolNPCs() can seat classmates in these exact real chairs instead of
  // guessing separate coordinates.
  for (let row = 0; row < 3; row++) {
    const dz = hz + 1 + row * 4.2;
    for (let col = -1; col <= 2; col++) {
      const dx = hx + (col - 0.5) * 5.6;
      box(1.6,0.85,1.1, 0xcc9966, dx, 0.42, dz);    // desk body
      box(1.7,0.12,1.2, 0xffe8c0, dx, 0.9, dz);     // desktop
      box(0.9,0.9,0.8, 0x4488cc, dx, 0.45, dz+1.5); // chair
    }
  }

  // A globe on a stand near the west wall — one real non-box shape for flavor, same spirit as the
  // Sports Park's basketball rim (a THREE.TorusGeometry) sitting among otherwise box geometry.
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), new THREE.MeshLambertMaterial({ color: 0x3a7fbf }));
  globe.position.set(hx-17, 2.6, hz-4); globe.castShadow = true; scene.add(globe);
  box(0.15,2,0.15, 0x5c3a1e, hx-17, 1.4, hz-4); // globe stand pole

  // A small bookshelf along the west wall for real furnished feel.
  box(0.6,3,4, 0x6a4a2a, hx-19.5, 1.5, hz-11);
  [0,1,2].forEach(i => box(0.5,0.15,3.8, 0x8B5E3C, hx-19.5, 0.6+i*1, hz-11));
}
// Real chair coordinates for one of the 12 desks buildSchoolInterior() just built (row 0-2,
// col -1..2) — duplicates that function's own dx/dz formula on purpose (small, static, proven
// geometry) rather than refactoring working code just to share it.
function schoolDeskChairPos(row, col) {
  const { x:hx, z:hz } = SCHOOL_SPAWN;
  const dz = hz + 1 + row * 4.2;
  const dx = hx + (col - 0.5) * 5.6;
  return { x: dx, z: dz + 1.5 };
}

// ─── SCHOOL NPCs — a real teacher + real seated classmates, built ONCE at game startup (same
// "always exists in its own pocket lane, ticked every frame regardless of whether the player is
// there" pattern the Prison's guards/prisoners and the Science Lab's Scientists already use — see
// buildLabNPCs(), game-world.js). Classmates are seated (makeNPC's own seated:true — the exact
// same shape the Diner's 3 waiters already use) and kept OUT of the global npcs[] array/generic
// patrol tick (game-controls.js): seated NPCs there just sit still forever, which is right for
// classmates, but the teacher needs a real custom wander/approach state machine (tickSchoolNPCs()
// below) that a shared generic tick would fight. makeNPC() (game-character.js) still does the real
// character-building for both, same function buildScientistNPC() wraps.
let schoolTeacherNPC = null;
let schoolClassmateNPCs = [];
const SCHOOL_CLASSMATE_DATA = [
  { name:'Milo',   skin:0xe0b28c, shirt:0x3388dd, pants:0x223355, hair:'short',    hairColor:0x2a1a10, desk:[0,0], line:'"Did you finish the homework? I totally forgot until this morning."' },
  { name:'Ruby',   skin:0xf0c8a0, shirt:0xff5588, pants:0x552244, hair:'ponytail', hairColor:0x7a2a10, desk:[0,1], line:'"I really hope it\'s pizza day at lunch!"' },
  { name:'Theo',   skin:0xc07840, shirt:0x33aa66, pants:0x1a1a1a, hair:'curly',    hairColor:0x1a1108, desk:[0,2], line:'"Have you seen the new kid? ...wait, that\'s you!"' },
  { name:'Ivy',    skin:0xf5d5b5, shirt:0x9955cc, pants:0x2a2a44, hair:'long',     hairColor:0x2a1a0a, desk:[1,-1], line:'"I drew a dragon in Art class yesterday. Wanna see it later?"' },
  { name:'Jasper', skin:0xd4956a, shirt:0xffaa33, pants:0x333322, hair:'spiky',    hairColor:0x1a1108, desk:[1,0], line:'"Race you to the door the second the bell rings!"' },
  { name:'Nora',   skin:0xe8c090, shirt:0x44ccee, pants:0x224422, hair:'afro',     hairColor:0x2a1a10, desk:[1,1], line:'"The teacher\'s actually really nice once you get to know them."' },
  { name:'Finn',   skin:0x8B5E3C, shirt:0xdddddd, pants:0x223355, hair:'short',    hairColor:0x0a0a0a, desk:[2,-1], line:'"I am SO ready for P.E. today. Been waiting all week."' },
  { name:'Stella', skin:0xf8d8b8, shirt:0xee6688, pants:0x442255, hair:'long',     hairColor:0x552211, desk:[2,1], line:'"Did you study for the pop quiz? I definitely did not."' },
  { name:'Ezra',   skin:0x7a4a2a, shirt:0x66aadd, pants:0x1a1a1a, hair:'curly',    hairColor:0x1a1108, desk:[2,2], line:'"Lunch better not be mystery meat again. Please."' },
]; // 9 of the room's 12 real desks are filled — desks (0,-1), (1,2) and (2,0) left empty on
   // purpose, same "not every seat is full" realism City Life's own classroom art goes for.
function talkToClassmate(kid) {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('neighborModalTitle').textContent = `💬 ${kid.name}`;
  document.getElementById('neighborModalBody').innerHTML = `<p style="color:#ddd;font-size:13px;line-height:1.5;">${kid.line}</p>`;
  document.getElementById('neighborModal').style.display = 'flex';
}
function buildSchoolNPCs() {
  SCHOOL_CLASSMATE_DATA.forEach(kid => {
    const { x, z } = schoolDeskChairPos(kid.desk[0], kid.desk[1]);
    const npc = makeNPC({ name:kid.name, role:'Classmate', skin:kid.skin, shirt:kid.shirt, pants:kid.pants,
      hair:kid.hair, hairColor:kid.hairColor, pos:[x,0,z], seated:true });
    schoolClassmateNPCs.push(npc);
    SCHOOL_ZONES.push({ x, z, r:2.2, label:`💬 Talk to ${kid.name}`, action: () => talkToClassmate(kid) });
  });
  schoolTeacherNPC = makeNPC({ name:'Ms. Holt', role:'Teacher', skin:0xe8c080, shirt:0x2a5f8f, pants:0x1a1a2a,
    hair:'short', hairColor:0x3a2410, pos:[CLASS_DESK_SPOT.x, 0, CLASS_DESK_SPOT.z] });
}
// Teacher AI — wanders a small area near the board, then on a real timer (schoolNextApproachAt)
// walks straight to the player and asks a real question the instant it arrives (openSchoolQuestion()
// force-opens the modal itself — this is NOT a button, it happens TO the player). Movement uses the
// generic patrol tick's own speed*dt style (game-controls.js), not a fixed-per-frame lerp like City
// Life's original teacherApproachState code — Explox's tick loop is real delta-time, so this stays
// framerate-independent the same way every other moving thing in this game already is.
let schoolTeacherState = 'wandering'; // 'wandering' | 'approaching'
let schoolNextApproachAt = 0;
let schoolTeacherTarget = null;
const SCHOOL_TEACHER_SPEED = 2.6;
function schoolTeacherWanderTarget() {
  const { x:hx, z:hz } = SCHOOL_SPAWN;
  return { x: hx + (Math.random()-0.5)*10, z: hz - 14 + Math.random()*5 }; // between the board (hz-17.75) and the front desk row (hz+1)
}
function tickSchoolNPCs(dt) {
  if (!inSchool || !schoolTeacherNPC) return;
  schoolClassmateNPCs.forEach(npc => { if (npc.tag) npc.tag.lookAt(camera.position); });
  if (schoolBully) {
    const bp = schoolBully.group.position;
    if (schoolBully.target) {
      const bdx = schoolBully.target.x - bp.x, bdz = schoolBully.target.z - bp.z, bdist = Math.hypot(bdx, bdz);
      if (bdist > 0.3) { bp.x += bdx/bdist*1.3*dt; bp.z += bdz/bdist*1.3*dt; schoolBully.group.rotation.y = Math.atan2(bdx,bdz); }
    }
    if (schoolBully.tag) schoolBully.tag.lookAt(camera.position);
  }
  const teacher = schoolTeacherNPC;
  const isClassPeriod = !!(schoolDayState && SCHOOL_PERIODS[schoolDayState.period] && SCHOOL_PERIODS[schoolDayState.period].type === 'class' && !schoolDayState.awaitingAnswer);
  if (isClassPeriod && schoolTeacherState === 'wandering' && Date.now() > schoolNextApproachAt) {
    schoolTeacherState = 'approaching';
    schoolTeacherTarget = null;
    showNotif(`🧑‍🏫 ${teacher.name} is coming over!`);
  }
  if (schoolTeacherState === 'approaching') {
    schoolTeacherTarget = { x: playerGroup.position.x + 1.4, z: playerGroup.position.z };
  } else if (!schoolTeacherTarget) {
    schoolTeacherTarget = schoolTeacherWanderTarget();
  }
  const p = teacher.group.position;
  const dx = schoolTeacherTarget.x - p.x, dz = schoolTeacherTarget.z - p.z, dist = Math.hypot(dx, dz);
  const arriveDist = schoolTeacherState === 'approaching' ? 1.0 : 0.2;
  if (dist > arriveDist) {
    p.x += dx/dist*SCHOOL_TEACHER_SPEED*dt;
    p.z += dz/dist*SCHOOL_TEACHER_SPEED*dt;
    teacher.group.rotation.y = Math.atan2(dx, dz);
  } else if (schoolTeacherState === 'approaching') {
    schoolTeacherState = 'wandering';
    schoolTeacherTarget = null;
    schoolNextApproachAt = Date.now() + 7000 + Math.random()*9000;
    if (isClassPeriod) openSchoolQuestion();
  } else {
    schoolTeacherTarget = null;
  }
  if (teacher.tag) teacher.tag.lookAt(camera.position);
}

// ─── SCHOOL BULLY — a real confrontation with 3 real choices, ported from citylife/src/events.js
// (maybeSpawnBully/spawnBully/showBullyChoice/bullyChoice — a real implemented mechanic there,
// just living in a different file than school.js itself, not merely the intro-text promise it
// first looked like). Explox stakes use real S.I.P. + a real damagePlayer() hit (game-social.js)
// instead of City Life's happiness/health pair, since Explox already tracks health for combat and
// has no happiness stat at all.
let schoolBully = null; // {group, tag, name, target, zoneEntry} — session-only, never persisted
const SCHOOL_BULLY_DATA = [
  { name:'Buck', skin:0xd4956a, shirt:0x992222, pants:0x1a1a1a, hair:'spiky', hairColor:0x1a1108 },
  { name:'Tank', skin:0xc07840, shirt:0x555555, pants:0x222222, hair:'short', hairColor:0x0a0a0a },
  { name:'Vic',  skin:0xe0b28c, shirt:0x664422, pants:0x1a1a1a, hair:'curly', hairColor:0x2a1a08 },
];
function maybeSpawnSchoolBully() {
  if (!inSchool || !schoolDayState || schoolDayState.isExamDay || schoolBully) return;
  if (Math.random() < SCHOOL_BULLY_CHANCE) spawnSchoolBully();
}
function spawnSchoolBully() {
  if (!inSchool || schoolBully) return;
  const data = SCHOOL_BULLY_DATA[Math.floor(Math.random()*SCHOOL_BULLY_DATA.length)];
  const { x:hx, z:hz } = SCHOOL_SPAWN;
  const spawnX = hx + (Math.random()-0.5)*6, spawnZ = hz + 3;
  const npc = makeNPC({ name:data.name, role:'Bully', skin:data.skin, shirt:data.shirt, pants:data.pants, hair:data.hair, hairColor:data.hairColor, pos:[spawnX,0,spawnZ] });
  const target = { x: SCHOOL_SPAWN.x, z: SCHOOL_SPAWN.z + 6 }; // wanders toward the player's usual entry point
  const zoneEntry = { x:spawnX, z:spawnZ, r:3, label:`😠 Deal with ${data.name}`, action: () => showSchoolBullyChoice() };
  SCHOOL_ZONES.push(zoneEntry);
  schoolBully = { group:npc.group, tag:npc.tag, name:data.name, target, zoneEntry };
  showNotif(`😠 ${data.name} is looking for trouble! Walk up and press E to deal with it.`);
  setTimeout(() => { if (schoolBully && schoolBully.name === data.name && schoolBully.zoneEntry === zoneEntry) removeSchoolBully(); }, 40000);
}
function removeSchoolBully() {
  if (!schoolBully) return;
  if (scene) scene.remove(schoolBully.group);
  const i = SCHOOL_ZONES.indexOf(schoolBully.zoneEntry);
  if (i > -1) SCHOOL_ZONES.splice(i, 1);
  schoolBully = null;
}
function showSchoolBullyChoice() {
  if (!schoolBully) return;
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('schoolBullyName').textContent = `😠 ${schoolBully.name} blocks your way`;
  document.getElementById('schoolBullyModal').style.display = 'flex';
}
function schoolBullyChoice(choice) {
  document.getElementById('schoolBullyModal').style.display = 'none';
  if (!schoolBully) { if(renderer && renderer.domElement) renderer.domElement.requestPointerLock(); return; }
  const name = schoolBully.name;
  if (choice === 'standup') {
    if (Math.random() < 0.6) {
      queueEarning(12, 0, '😤 Stood up to a bully');
      showNotif(`💪 You stood your ground! ${name} backed off. +12 S.I.P. pending.`);
    } else {
      damagePlayer(5, name);
      showNotif(`😢 ${name} shoved you!`);
    }
  } else if (choice === 'walkaway') {
    sipDollars = Math.max(0, sipDollars - 5);
    updateSIP();
    showNotif(`🚶 You walked away. ${name} grabbed a few coins on the way out. -5 S.I.P.`);
  } else if (choice === 'teacher') {
    queueEarning(8, 0, '🙋 Told the teacher');
    showNotif(`🙋 A teacher stepped in — ${name} had to apologize! +8 S.I.P. pending.`);
  }
  removeSchoolBully();
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ─── SCHOOL DAY SCHEDULE — 5 real class periods (one subject each), a snack break, a lunch break,
// and P.E., ending in dismissal. SCHOOL_QUESTIONS_PER_CLASS(2) x 5 class periods = 10 total real
// quiz questions per full day — the SAME total the old flat 10-question pop quiz always asked, this
// rebuild changes HOW they're delivered (spread through a real paced day) rather than how many, so
// SCHOOL_SIP_PER_CORRECT/SCHOOL_QUIZ_COOLDOWN_MS below still add up the same way they always did
// and didn't need to change.
const SCHOOL_PERIODS = [
  { type:'class', subject:'Math',    label:'📐 Math Class' },
  { type:'break', kind:'snack',      label:'🍎 Snack Break' },
  { type:'class', subject:'Reading', label:'📖 Reading Class' },
  { type:'class', subject:'Science', label:'🔬 Science Class' },
  { type:'break', kind:'lunch',      label:'🍽️ Lunch Break' },
  { type:'class', subject:'Social',  label:'🌍 Social Studies' },
  { type:'class', subject:'Art',     label:'🎨 Art Class' },
  { type:'pe',                       label:'🏃 P.E.' },
  { type:'dismissal',                label:'🎒 Dismissal' },
];
const SCHOOL_QUESTIONS_PER_CLASS = 2;
const SCHOOL_SIP_PER_CORRECT = 15;      // unchanged from the old flat quiz — see the comment above SCHOOL_PERIODS for why the total pacing still works out the same
const SCHOOL_QUIZ_COOLDOWN_MS = 20 * 60 * 1000; // unchanged — a real multi-period day now takes real wall-clock minutes to finish on its own (teacher approach delays, walking between periods), so it's naturally harder to spam than the old instant 10-question modal ever was; the same cooldown is if anything more conservative now, not less
const SCHOOL_EXAM_SIP_MULT = 2;         // exam-day correct answers pay double — real extra reward for the real extra risk below
// Real bug found live during this feature's own testing: a class period only ever advances once
// the player lands SCHOOL_QUESTIONS_PER_CLASS correct answers — a wrong answer just makes the
// teacher ask again, it never lets the period move on. That means correctTotal is ALWAYS exactly
// 10 by the time dismissal is reached, no matter how badly the day went — a "pass if correctTotal
// >= 6" check could never actually fail. wrongTotal (how many WRONG attempts it took to get there)
// is the real, reachable signal for "struggled on exam day" instead.
const SCHOOL_EXAM_MAX_WRONG_ALLOWED = 4; // more than 4 wrong attempts across the whole exam day = fail, real penalty applies at dismissal
const SCHOOL_EXAM_FAIL_PENALTY = 60;    // real S.I.P. penalty for failing an exam day — Explox has no happiness/health-drain pair to borrow from City Life's own "-15 happiness, -10 health" exam-fail consequence, so this is a real wallet hit instead, sized to roughly 4 questions' worth of base-rate S.I.P. (60 = 4 x 15) — enough to genuinely sting on a bad exam day without wiping out a whole session's other earnings
const SCHOOL_HOMEWORK_SIP_REWARD = 20;  // one real question, slightly above the per-class-question rate (15) since it's a single shot rather than 10 tries across a whole day
const SCHOOL_HOMEWORK_MISS_PENALTY = 15; // real S.I.P. penalty if homework is still unfinished when the NEXT school day starts — matches SCHOOL_SIP_PER_CORRECT's own size, same "one question's worth" logic as the reward above
const SCHOOL_PE_SIP_MAX = 30;           // P.E.'s own click-mash challenge tops out lower than the Sports Park Gym's real +100 max (gymPump()/finishGymChallenge(), above) since P.E. is one short period inside a bigger school day, not the whole point of a visit
const SCHOOL_BULLY_CHANCE = 0.15;       // matches City Life's own real 15% roll (events.js maybeSpawnBully())
const SCHOOL_AGE_BANDS = [
  { id:'young', label:'Ages 5-7'   },
  { id:'kid',   label:'Ages 8-10'  },
  { id:'tween', label:'Ages 11-13' },
  { id:'teen',  label:'Ages 14-18' },
];
function ageToSchoolBand(age) {
  if (age <= 7) return 'young';
  if (age <= 10) return 'kid';
  if (age <= 13) return 'tween';
  return 'teen'; // also the fallback for any adult player typing their real (18+) age
}
let schoolLastQuizAt = 0;  // persisted — Date.now() ms of the last school day START, see SCHOOL_QUIZ_COOLDOWN_MS
let schoolVisitCount = 0;  // persisted — total real school days STARTED (not just walked into); every 10th is an exam day, see startSchoolDay() below
let schoolHomework = null; // persisted — {subject, bandId} assigned at dismissal, cleared by a CORRECT homework answer; still set when the next day starts = SCHOOL_HOMEWORK_MISS_PENALTY
let schoolDayState = null; // NOT persisted — fresh every visit, same as the old classroomState it replaces

// ─── AGE-BAND QUESTION BANKS — each a real, hand-written bank of 110+ non-repeating,
// age-appropriate questions (q/c[4 choices]/a[correct index 0-3]) mixing math, reading &
// language, science, and social studies, difficulty-spread within the band. SCHOOL_QUESTIONS
// just below is the single lookup table every quiz function reads from.

const SCHOOL_QUESTIONS_YOUNG = [
  {q:"What is 2 + 3?", c:["4","5","6","7"], a:1},
  {q:"Which word rhymes with cat?", c:["Dog","Hat","Sun","Fish"], a:1},
  {q:"How many legs does a dog have?", c:["2","3","4","6"], a:2},
  {q:"What color do you get when you mix blue and yellow?", c:["Purple","Green","Orange","Red"], a:1},
  {q:"What is 4 + 1?", c:["3","4","5","6"], a:2},
  {q:"Which word rhymes with sun?", c:["Fun","Cat","Tree","Bird"], a:0},
  {q:"How many legs does a spider have?", c:["6","8","4","10"], a:1},
  {q:"What color do you get when you mix red and blue?", c:["Green","Purple","Orange","Yellow"], a:1},
  {q:"What is 5 - 2?", c:["2","3","4","5"], a:1},
  {q:"Which word rhymes with log?", c:["Frog","Cat","Bird","Fish"], a:0},
  {q:"Which sense do you use to hear music?", c:["Sight","Hearing","Smell","Taste"], a:1},
  {q:"What color do you get when you mix red and yellow?", c:["Purple","Green","Orange","Blue"], a:2},
  {q:"What is 6 - 3?", c:["2","3","4","5"], a:1},
  {q:"What sound does the letter B make at the start of the word ball?", c:["The buh sound","The suh sound","The tuh sound","The muh sound"], a:0},
  {q:"Which sense do you use to smell flowers?", c:["Sight","Hearing","Smell","Touch"], a:2},
  {q:"Who helps put out fires?", c:["Doctor","Firefighter","Teacher","Chef"], a:1},
  {q:"How many wheels does a bicycle have?", c:["1","2","3","4"], a:1},
  {q:"Which letter comes after C in the alphabet?", c:["B","D","E","A"], a:1},
  {q:"Which body part do you use to see?", c:["Ears","Nose","Eyes","Mouth"], a:2},
  {q:"Who helps you when you are sick?", c:["Firefighter","Doctor","Police officer","Mail carrier"], a:1},
  {q:"What shape has 3 sides?", c:["Circle","Square","Triangle","Rectangle"], a:2},
  {q:"Which letter comes right before M in the alphabet?", c:["N","L","O","K"], a:1},
  {q:"Which body part do you use to hear?", c:["Eyes","Ears","Nose","Hands"], a:1},
  {q:"Who helps keep our streets safe?", c:["Chef","Police officer","Farmer","Artist"], a:1},
  {q:"What shape has 4 equal sides?", c:["Triangle","Square","Circle","Oval"], a:1},
  {q:"What is the opposite of big?", c:["Small","Tall","Fast","Loud"], a:0},
  {q:"Besides water and sunlight, what do plants need to grow?", c:["Soil","Rocks","Ice","Sand"], a:0},
  {q:"Who teaches you at school?", c:["Doctor","Teacher","Firefighter","Farmer"], a:1},
  {q:"What shape is round with no corners?", c:["Square","Triangle","Circle","Rectangle"], a:2},
  {q:"What is the opposite of hot?", c:["Warm","Cold","Wet","Dry"], a:1},
  {q:"What do bees make?", c:["Milk","Honey","Bread","Juice"], a:1},
  {q:"Who delivers letters and packages?", c:["Mail carrier","Doctor","Teacher","Firefighter"], a:0},
  {q:"Which number comes after 7?", c:["6","7","8","9"], a:2},
  {q:"What is the opposite of up?", c:["Down","Out","Left","Near"], a:0},
  {q:"Which animal says moo?", c:["Dog","Cat","Cow","Duck"], a:2},
  {q:"What day comes right after Monday?", c:["Sunday","Tuesday","Wednesday","Friday"], a:1},
  {q:"Which number comes before 5?", c:["3","4","5","6"], a:1},
  {q:"What is the opposite of happy?", c:["Silly","Sad","Tired","Loud"], a:1},
  {q:"Which animal says quack?", c:["Duck","Pig","Horse","Sheep"], a:0},
  {q:"What day comes right before Sunday?", c:["Friday","Saturday","Monday","Thursday"], a:1},
  {q:"What is 3 + 3?", c:["5","6","7","8"], a:1},
  {q:"What is the plural of cat, meaning more than one?", c:["Cat","Cats","Cating","Catty"], a:1},
  {q:"What do we call baby dogs?", c:["Kittens","Puppies","Cubs","Chicks"], a:1},
  {q:"How many days are in one week?", c:["5","6","7","8"], a:2},
  {q:"What is 8 - 4?", c:["3","4","5","6"], a:1},
  {q:"What is the plural of dog?", c:["Doggy","Dogs","Dog","Doged"], a:1},
  {q:"What do we call baby cats?", c:["Puppies","Kittens","Foals","Calves"], a:1},
  {q:"What is the first day of the school week for most people?", c:["Sunday","Monday","Saturday","Friday"], a:1},
  {q:"Which group has more, 5 apples or 2 apples?", c:["2 apples","5 apples","They are the same","Neither"], a:1},
  {q:"Which word means more than one box?", c:["Boxs","Boxes","Box","Boxies"], a:1},
  {q:"Is the sun out during the day or at night?", c:["Day","Night","Both","Neither"], a:0},
  {q:"If something is near you, is it close or far away?", c:["Close","Far away","Both","Neither"], a:0},
  {q:"What is 10 - 5?", c:["4","5","6","7"], a:1},
  {q:"Which of these is a common sight word?", c:["Elephant","The","Umbrella","Giraffe"], a:1},
  {q:"What do we see in the night sky that gives off light?", c:["Sun","Moon","Cloud","Rainbow"], a:1},
  {q:"If something is far from you, is it close or far away?", c:["Close","Far away","Both","Neither"], a:1},
  {q:"What is 7 + 2?", c:["8","9","10","11"], a:1},
  {q:"Which word rhymes with tree?", c:["Bee","Car","Sun","Dog"], a:0},
  {q:"What season comes right after winter?", c:["Summer","Fall","Spring","Autumn leaves"], a:2},
  {q:"On most maps, which direction is shown at the top?", c:["Down","Up","Sideways","Diagonal"], a:1},
  {q:"What number is missing: 1, 2, __, 4?", c:["2","3","5","6"], a:1},
  {q:"Which word starts with the same sound as moon?", c:["Sun","Milk","Ball","Rain"], a:1},
  {q:"Which season is usually the hottest?", c:["Winter","Spring","Summer","Fall"], a:2},
  {q:"What season comes right before winter?", c:["Spring","Summer","Fall","None of these"], a:2},
  {q:"What is 9 - 6?", c:["2","3","4","5"], a:1},
  {q:"What is the opposite of fast?", c:["Quick","Slow","Loud","Small"], a:1},
  {q:"What falls from the sky when it rains?", c:["Snow","Water","Leaves","Sand"], a:1},
  {q:"What do we call the place where you live with your family?", c:["School","Home","Store","Park"], a:1},
  {q:"How many sides does a rectangle have?", c:["2","3","4","5"], a:2},
  {q:"What is the opposite of day?", c:["Night","Sun","Bright","Morning"], a:0},
  {q:"What falls from the sky when it is very cold outside?", c:["Rain","Snow","Sand","Leaves"], a:1},
  {q:"What do we call a place where you can borrow books?", c:["Library","Bakery","Garage","Farm"], a:0},
  {q:"What is 6 + 3?", c:["8","9","10","11"], a:1},
  {q:"Which word rhymes with star?", c:["Car","Sun","Tree","Moon"], a:0},
  {q:"Which animal lives in water and breathes with fins?", c:["Dog","Fish","Bird","Cat"], a:1},
  {q:"Who grows food like fruits and vegetables on a farm?", c:["Farmer","Doctor","Teacher","Pilot"], a:0},
  {q:"Which is fewer, 3 balls or 6 balls?", c:["6 balls","3 balls","They are the same","Neither"], a:1},
  {q:"What letter does the word dog start with?", c:["D","B","G","O"], a:0},
  {q:"Which animal can fly using wings?", c:["Fish","Bird","Dog","Cow"], a:1},
  {q:"Who flies an airplane?", c:["Pilot","Farmer","Doctor","Chef"], a:0},
  {q:"What is 15 + 10?", c:["20","24","25","26"], a:2},
  {q:"What letter does the word fish start with?", c:["S","H","F","I"], a:2},
  {q:"What do you use your skin for?", c:["Seeing","Feeling things","Hearing","Smelling"], a:1},
  {q:"What color is the sky on a clear, sunny day?", c:["Green","Blue","Purple","Brown"], a:1},
  {q:"What is 12 + 13?", c:["24","25","26","27"], a:1},
  {q:"Which word means the opposite of open?", c:["Shut","Wide","Loud","Big"], a:0},
  {q:"What do you use your tongue for?", c:["Seeing","Hearing","Tasting","Smelling"], a:2},
  {q:"What color is grass usually?", c:["Blue","Green","Red","Purple"], a:1},
  {q:"What is 20 - 10?", c:["5","10","15","20"], a:1},
  {q:"Which word rhymes with book?", c:["Look","Ball","Tree","Sun"], a:0},
  {q:"What color do many leaves turn in the fall?", c:["Green","Brown and orange","Blue","Purple"], a:1},
  {q:"What do we call the colorful arc of colors you see after rain?", c:["Rainbow","Sunset","Cloud","Storm"], a:0},
  {q:"What comes next in the pattern: red, blue, red, blue, __?", c:["Red","Green","Yellow","Blue"], a:0},
  {q:"What is the opposite of wet?", c:["Cold","Dry","Soft","Warm"], a:1},
  {q:"What do caterpillars turn into?", c:["Frogs","Butterflies","Birds","Bees"], a:1},
  {q:"What do we call a group of people who live and work in the same area?", c:["Community","Ocean","Forest","Desert"], a:0},
  {q:"What is 4 + 4?", c:["6","7","8","9"], a:2},
  {q:"Which of these words is a sight word?", c:["Dinosaur","And","Butterfly","Rainbow"], a:1},
  {q:"Where do fish live?", c:["Trees","Water","Sand","Grass"], a:1},
  {q:"Who cooks food at a restaurant?", c:["Chef","Pilot","Farmer","Teacher"], a:0},
  {q:"What is 10 - 3?", c:["6","7","8","9"], a:1},
  {q:"What sound does S make at the start of the word sun?", c:["The sss sound","The tuh sound","The buh sound","The rrr sound"], a:0},
  {q:"What is the closest star to Earth?", c:["The moon","The sun","A planet","A cloud"], a:1},
  {q:"In which season do leaves usually fall off the trees?", c:["Summer","Fall","Spring","Winter"], a:1},
  {q:"Which shape has no straight sides?", c:["Square","Triangle","Circle","Rectangle"], a:2},
  {q:"Which word rhymes with pig?", c:["Big","Cat","Sun","Dog"], a:0},
  {q:"How many eyes does a person usually have?", c:["1","2","3","4"], a:1},
  {q:"If you walk up the stairs, are you going higher or lower?", c:["Higher","Lower","Sideways","Neither"], a:0},
  {q:"What is 5 + 5?", c:["9","10","11","12"], a:1},
  {q:"What is the opposite of in?", c:["Out","Near","Down","Left"], a:0},
  {q:"What part of a plant grows underground?", c:["Leaves","Flower","Roots","Stem"], a:2},
  {q:"What do we call the last day of the weekend, right before Monday?", c:["Friday","Saturday","Sunday","Thursday"], a:2},
  {q:"How many fingers are on one hand?", c:["4","5","6","10"], a:1},
  {q:"What is 18 - 9?", c:["7","8","9","10"], a:2}
];

const SCHOOL_QUESTIONS_KID = [
  {q:"What is 7 x 6?", c:["42","36","48","49"], a:0},
  {q:"Which word is a synonym for \"happy\"?", c:["Sad","Joyful","Angry","Tired"], a:1},
  {q:"Which planet is known as the Red Planet?", c:["Venus","Mars","Jupiter","Saturn"], a:1},
  {q:"How many continents are there on Earth?", c:["5","6","7","8"], a:2},
  {q:"What is 9 x 8?", c:["81","72","64","56"], a:1},
  {q:"Which word is an antonym for \"big\"?", c:["Large","Huge","Small","Giant"], a:2},
  {q:"How many planets are in our solar system?", c:["7","8","9","10"], a:1},
  {q:"Which is the largest ocean on Earth?", c:["Atlantic Ocean","Indian Ocean","Arctic Ocean","Pacific Ocean"], a:3},
  {q:"What is 45 divided by 5?", c:["8","9","7","10"], a:1},
  {q:"In the sentence \"The dog ran quickly,\" which word is the verb?", c:["The","dog","ran","quickly"], a:2},
  {q:"Which planet is closest to the sun?", c:["Earth","Venus","Mercury","Mars"], a:2},
  {q:"What is the capital of the United States?", c:["New York City","Los Angeles","Washington D.C.","Chicago"], a:2},
  {q:"What is 12 x 4?", c:["46","48","44","52"], a:1},
  {q:"Which word is a noun in this sentence: \"The bright sun warmed the field\"?", c:["bright","sun","warmed","the"], a:1},
  {q:"What do we call an animal that eats only plants?", c:["Carnivore","Herbivore","Omnivore","Predator"], a:1},
  {q:"Which direction is opposite of North on a compass?", c:["East","South","West","Northeast"], a:1},
  {q:"What is 100 minus 37?", c:["63","73","67","53"], a:0},
  {q:"What is the plural form of \"mouse\"?", c:["Mouses","Mices","Mice","Mouse"], a:2},
  {q:"What do we call an animal that eats both plants and meat?", c:["Herbivore","Carnivore","Omnivore","Scavenger"], a:2},
  {q:"Which continent is Egypt located on?", c:["Asia","Africa","Europe","South America"], a:1},
  {q:"If you eat 3/4 of a pizza and then eat 1/4 more, how much pizza have you eaten?", c:["A whole pizza","Half a pizza","Two pizzas","A quarter pizza"], a:0},
  {q:"Which word is an adjective in this sentence: \"She wore a shiny necklace\"?", c:["wore","she","shiny","necklace"], a:2},
  {q:"What is the first stage of a plant's life cycle?", c:["Flower","Seed","Root","Stem"], a:1},
  {q:"Who is known for inventing the light bulb?", c:["Alexander Graham Bell","Thomas Edison","Benjamin Franklin","Isaac Newton"], a:1},
  {q:"Which fraction is the same as one half?", c:["2/4","1/3","3/8","1/5"], a:0},
  {q:"What is the plural of \"child\"?", c:["Childs","Children","Childes","Childrens"], a:1},
  {q:"Which state of matter has no fixed shape and no fixed volume?", c:["Solid","Liquid","Gas","Plasma"], a:2},
  {q:"Who is known for inventing the telephone?", c:["Thomas Edison","Alexander Graham Bell","Nikola Tesla","Henry Ford"], a:1},
  {q:"If a movie starts at 3:00 and lasts 1 hour and 30 minutes, when does it end?", c:["4:00","4:15","4:30","5:00"], a:2},
  {q:"Which word means almost the same as \"quick\"?", c:["Slow","Lazy","Fast","Calm"], a:2},
  {q:"Which state of matter has a fixed shape and a fixed volume?", c:["Gas","Liquid","Solid","Steam"], a:2},
  {q:"What is the elected leader of a city usually called?", c:["Governor","President","Mayor","Senator"], a:2},
  {q:"How many minutes are in one hour?", c:["50","60","100","30"], a:1},
  {q:"What is the opposite of \"begin\"?", c:["Start","Finish","Open","Continue"], a:1},
  {q:"What do plants need, along with water and air, to make their own food?", c:["Soil only","Sunlight","Darkness","Salt"], a:1},
  {q:"What is the elected leader of a U.S. state usually called?", c:["Mayor","Governor","Principal","Judge"], a:1},
  {q:"How many days are in the month of April?", c:["31","28","30","29"], a:2},
  {q:"Which sentence uses correct punctuation?", c:["Where are you going","Where are you going?","where are you going.","Where are you going,"], a:1},
  {q:"About how many bones are in the adult human body?", c:["106","206","306","406"], a:1},
  {q:"Which ocean is located between Africa and Australia?", c:["Atlantic Ocean","Pacific Ocean","Indian Ocean","Arctic Ocean"], a:2},
  {q:"If you have 3 quarters, how much money do you have?", c:["50 cents","75 cents","100 cents","25 cents"], a:1},
  {q:"What is the plural of \"leaf\"?", c:["Leafs","Leaves","Leafes","Leaven"], a:1},
  {q:"What is the main organ that pumps blood through your body?", c:["Lungs","Brain","Heart","Liver"], a:2},
  {q:"What is the capital of California?", c:["Los Angeles","San Francisco","Sacramento","San Diego"], a:2},
  {q:"How many sides does a hexagon have?", c:["5","6","7","8"], a:1},
  {q:"Which word is a pronoun in this sentence: \"She gave the book to him\"?", c:["gave","book","she","to"], a:2},
  {q:"What do we call animals that have a backbone?", c:["Invertebrates","Vertebrates","Mammals","Reptiles"], a:1},
  {q:"What is the capital of New York State?", c:["New York City","Buffalo","Albany","Rochester"], a:2},
  {q:"What is 8 x 8?", c:["56","72","64","81"], a:2},
  {q:"Which of these words rhymes with \"cake\"?", c:["Cat","Lake","Cup","Dog"], a:1},
  {q:"Which organ do you use to breathe?", c:["Lungs","Stomach","Kidneys","Liver"], a:0},
  {q:"What is the capital of Texas?", c:["Houston","Dallas","Austin","San Antonio"], a:2},
  {q:"What is 63 divided by 7?", c:["9","8","7","6"], a:0},
  {q:"Which word means the opposite of \"loud\"?", c:["Noisy","Quiet","Booming","Loud"], a:1},
  {q:"What is water called when it turns into a gas?", c:["Ice","Vapor","Frost","Sleet"], a:1},
  {q:"Which direction does the sun rise from?", c:["North","South","East","West"], a:2},
  {q:"How many centimeters are in a meter?", c:["10","100","1000","50"], a:1},
  {q:"What do you call a word that describes a noun?", c:["Verb","Adverb","Adjective","Pronoun"], a:2},
  {q:"What is the process called when water falls from clouds as rain or snow?", c:["Evaporation","Precipitation","Condensation","Collection"], a:1},
  {q:"Which direction does the sun set in?", c:["North","South","East","West"], a:3},
  {q:"Sarah has 24 stickers and wants to split them evenly among 4 friends. How many does each friend get?", c:["4","6","8","5"], a:1},
  {q:"What is the plural of \"box\"?", c:["Boxs","Boxes","Boxies","Box"], a:1},
  {q:"What is the process called when water turns from a liquid into vapor?", c:["Evaporation","Precipitation","Condensation","Freezing"], a:0},
  {q:"Which continent is the largest by land area?", c:["Africa","Asia","North America","Europe"], a:1},
  {q:"What is 15 x 3?", c:["45","35","40","50"], a:0},
  {q:"Which word is a synonym for \"smart\"?", c:["Clever","Dull","Slow","Silly"], a:0},
  {q:"Which planet is famous for its large rings?", c:["Mars","Saturn","Mercury","Earth"], a:1},
  {q:"Which continent is known for being covered almost entirely in ice?", c:["Africa","Antarctica","Australia","Europe"], a:1},
  {q:"Which number is bigger than 3/8 but smaller than 3/4?", c:["1/2","1/8","1/10","1/16"], a:0},
  {q:"Yesterday, the cat ___ up the tree. Which word completes the sentence?", c:["climb","climbed","climbs","climbing"], a:1},
  {q:"What do you call baby frogs before they grow legs?", c:["Cubs","Tadpoles","Larvae","Kits"], a:1},
  {q:"Who is credited with inventing the airplane along with his brother?", c:["Orville Wright","Henry Ford","Albert Einstein","Samuel Morse"], a:0},
  {q:"What is the value of 6 x 0?", c:["6","1","0","60"], a:2},
  {q:"What punctuation mark ends a question?", c:["Period","Comma","Question mark","Exclamation point"], a:2},
  {q:"Which gas do humans breathe in that our bodies need to survive?", c:["Carbon dioxide","Oxygen","Nitrogen","Helium"], a:1},
  {q:"What tool on a map helps you understand what its symbols mean?", c:["Compass rose","Map key","Scale bar","Border"], a:1},
  {q:"How many inches are in a foot?", c:["10","12","16","14"], a:1},
  {q:"Which word means the same as \"tiny\"?", c:["Huge","Small","Wide","Tall"], a:1},
  {q:"What do we call animals that do not have a backbone?", c:["Vertebrates","Mammals","Invertebrates","Reptiles"], a:2},
  {q:"What is the smallest continent by land area?", c:["Europe","Australia","Antarctica","South America"], a:1},
  {q:"If a pencil costs 35 cents and you pay with a dollar, how much change do you get?", c:["55 cents","65 cents","75 cents","45 cents"], a:1},
  {q:"What do you call a word that takes the place of a noun, like \"he\" or \"they\"?", c:["Adjective","Verb","Pronoun","Adverb"], a:2},
  {q:"What is the largest planet in our solar system?", c:["Earth","Saturn","Jupiter","Neptune"], a:2},
  {q:"What do we call the group of people elected to make laws for a country?", c:["Court","Congress","Council","Committee"], a:1},
  {q:"What is 90 divided by 9?", c:["9","10","8","11"], a:1},
  {q:"Which word is spelled correctly?", c:["Recieve","Receive","Receeve","Receve"], a:1},
  {q:"Which part of a plant absorbs water from the soil?", c:["Leaves","Roots","Petals","Stem"], a:1},
  {q:"Which U.S. state is known for being an island chain in the Pacific Ocean?", c:["Florida","Hawaii","Alaska","Maine"], a:1},
  {q:"What is 1/3 plus 1/3?", c:["2/3","2/6","1/3","3/3"], a:0},
  {q:"What is the plural of \"tooth\"?", c:["Tooths","Teeth","Toothes","Teethes"], a:1},
  {q:"What do we call the process by which a caterpillar becomes a butterfly?", c:["Hibernation","Migration","Metamorphosis","Pollination"], a:2},
  {q:"Which ocean lies along the east coast of the United States?", c:["Pacific Ocean","Atlantic Ocean","Indian Ocean","Arctic Ocean"], a:1},
  {q:"How many grams are in a kilogram?", c:["100","500","1000","10000"], a:2},
  {q:"Which sentence is a complete sentence?", c:["Running fast down.","The boy ran fast.","Down the street quickly.","Fast and running."], a:1},
  {q:"What is the closest star to Earth?", c:["The North Star","The Moon","The Sun","Sirius"], a:2},
  {q:"Which ocean lies along the west coast of the United States?", c:["Atlantic Ocean","Pacific Ocean","Indian Ocean","Southern Ocean"], a:1},
  {q:"What is 11 x 11?", c:["111","121","122","112"], a:1},
  {q:"What do we call a group of sentences about one main idea?", c:["A word","A paragraph","A letter","A title"], a:1},
  {q:"Which sense organ do you use to hear sounds?", c:["Eyes","Ears","Nose","Skin"], a:1},
  {q:"What do we call people, like firefighters and police officers, who are paid to serve and protect the community?", c:["Volunteers","Public servants","Tourists","Visitors"], a:1},
  {q:"A rectangle has a length of 8 and a width of 3. What is its perimeter?", c:["22","24","11","19"], a:0},
  {q:"Which word means the opposite of \"wet\"?", c:["Damp","Dry","Soggy","Moist"], a:1},
  {q:"What do we call the layer of gases that surrounds Earth?", c:["Atmosphere","Crust","Core","Mantle"], a:0},
  {q:"What is the capital of Florida?", c:["Miami","Orlando","Tallahassee","Tampa"], a:2},
  {q:"What is 7 x 9?", c:["56","63","72","54"], a:1},
  {q:"What part of speech is the word \"run\" in the sentence \"I like to run\"?", c:["Noun","Adjective","Verb","Adverb"], a:2},
  {q:"What is the boiling point of water in Celsius, at sea level?", c:["50 degrees","100 degrees","150 degrees","200 degrees"], a:1},
  {q:"What symbol on a map shows directions like north, south, east, and west?", c:["Compass rose","Legend","Scale","Grid"], a:0},
  {q:"About how many weeks are in a year?", c:["48","50","52","54"], a:2},
  {q:"Which of these is an example of an adverb?", c:["Quickly","Table","Green","Dog"], a:0},
  {q:"What do we call a scientist who studies weather?", c:["Biologist","Geologist","Meteorologist","Astronomer"], a:2},
  {q:"Which continent is Brazil located on?", c:["Africa","South America","Asia","Europe"], a:1},
  {q:"What is 144 divided by 12?", c:["11","12","13","14"], a:1},
  {q:"What is the plural of \"city\"?", c:["Citys","Cities","Citees","Cityes"], a:1},
  {q:"Which of these is an example of a mammal?", c:["Frog","Snake","Dolphin","Eagle"], a:2},
  {q:"Who is credited with inventing the printing press with movable type in Europe?", c:["Thomas Edison","Johannes Gutenberg","Leonardo da Vinci","Isaac Newton"], a:1}
];

const SCHOOL_QUESTIONS_TWEEN = [
  {q:"Solve for x: 2x + 4 = 12", c:["3","4","6","8"], a:1},
  {q:"Which of these sentences contains a simile?", c:["The wind whispered through the trees.","Her smile was as bright as the sun.","Time is a thief.","The classroom was a zoo."], a:1},
  {q:"What is the process by which rock slowly changes from one type to another over long periods of time called?", c:["The water cycle","The rock cycle","The carbon cycle","The nitrogen cycle"], a:1},
  {q:"Which river is traditionally considered the longest river in the world?", c:["Amazon","Nile","Yangtze","Mississippi"], a:1},
  {q:"What is 3 + 4 × 2 using the correct order of operations?", c:["14","11","10","9"], a:1},
  {q:"What figure of speech gives human qualities to non-human things?", c:["Metaphor","Simile","Personification","Hyperbole"], a:2},
  {q:"What type of rock forms when melted rock (magma or lava) cools and hardens?", c:["Sedimentary","Igneous","Metamorphic","Mineral"], a:1},
  {q:"What is the largest ocean on Earth?", c:["Atlantic","Pacific","Indian","Arctic"], a:1},
  {q:"What is 25% of 80?", c:["15","20","25","30"], a:1},
  {q:"What best defines a metaphor?", c:["A comparison using 'like' or 'as'","A direct comparison that says one thing IS another","An exaggeration for effect","A word that imitates a sound"], a:1},
  {q:"What type of rock forms from layers of sediment pressed and cemented together?", c:["Igneous","Metamorphic","Sedimentary","Organic"], a:2},
  {q:"What is the tallest mountain range in the world, home to Mount Everest?", c:["Andes","Rockies","Himalayas","Alps"], a:2},
  {q:"What is the ratio 8:12 written in simplest form?", c:["2:3","4:6","1:2","3:4"], a:0},
  {q:"What is hyperbole?", c:["A quiet understatement","An extreme exaggeration not meant to be taken literally","A rhyme at the end of a line","A question with an obvious answer"], a:1},
  {q:"What type of rock forms when existing rock is changed by intense heat and pressure?", c:["Igneous","Sedimentary","Metamorphic","Crystalline"], a:2},
  {q:"What is the capital of France?", c:["Lyon","Paris","Marseille","Nice"], a:1},
  {q:"What is the area of a rectangle with length 6 and width 4?", c:["20","24","10","12"], a:1},
  {q:"Which word is a synonym for 'enormous'?", c:["Huge","Tiny","Calm","Quick"], a:0},
  {q:"What is the outermost layer of the Earth called?", c:["Crust","Mantle","Outer core","Inner core"], a:0},
  {q:"What is the capital of Japan?", c:["Osaka","Kyoto","Tokyo","Nagoya"], a:2},
  {q:"What is the perimeter of a square with side length 5?", c:["10","15","20","25"], a:2},
  {q:"Which word is an antonym for 'generous'?", c:["Stingy","Kind","Wealthy","Cheerful"], a:0},
  {q:"What is the scientific theory that explains how Earth's continents slowly move over time?", c:["The water cycle","Plate tectonics","Photosynthesis","The rock cycle"], a:1},
  {q:"What is the capital of Egypt?", c:["Cairo","Alexandria","Giza","Luxor"], a:0},
  {q:"What is -5 + 8?", c:["-13","3","13","-3"], a:1},
  {q:"Which part of speech describes an action or state of being?", c:["Noun","Verb","Adjective","Adverb"], a:1},
  {q:"What are the huge slabs of Earth's crust called that move slowly over time?", c:["Fault lines","Tectonic plates","Volcanoes","Glaciers"], a:1},
  {q:"What is the capital of Australia?", c:["Sydney","Melbourne","Canberra","Perth"], a:2},
  {q:"What is -3 × -4?", c:["-12","12","-7","7"], a:1},
  {q:"Which part of speech modifies or describes a noun?", c:["Verb","Adverb","Adjective","Conjunction"], a:2},
  {q:"What is it called when two blocks of Earth's crust crack and shift, sometimes causing earthquakes?", c:["A fault","A crater","A canyon","A ridge"], a:0},
  {q:"What is the capital of Brazil?", c:["Rio de Janeiro","Sao Paulo","Brasilia","Salvador"], a:2},
  {q:"Solve for x: x - 7 = 10", c:["3","17","-3","70"], a:1},
  {q:"Which of these is an independent clause that can stand alone as a sentence?", c:["Although it was raining","Because she was tired","The dog barked loudly","Running down the street"], a:2},
  {q:"Which three states of matter are most commonly studied in science class?", c:["Solid, liquid, gas","Solid, liquid, plasma","Rock, water, air","Ice, steam, fire"], a:0},
  {q:"What continent is the Sahara Desert located on?", c:["Asia","Africa","Australia","South America"], a:1},
  {q:"What is 3/4 written as a percent?", c:["50%","75%","34%","80%"], a:1},
  {q:"Which punctuation mark can join two independent clauses without using a conjunction?", c:["Comma","Semicolon","Hyphen","Apostrophe"], a:1},
  {q:"What is it called when a liquid changes into a gas?", c:["Condensation","Evaporation","Freezing","Melting"], a:1},
  {q:"Which ancient civilization built the pyramids at Giza?", c:["Ancient Greeks","Ancient Egyptians","Ancient Romans","Ancient Mayans"], a:1},
  {q:"A triangle has angles of 60 degrees and 70 degrees. What is the measure of the third angle?", c:["40 degrees","50 degrees","60 degrees","70 degrees"], a:1},
  {q:"Which sentence correctly shows possession for more than one dog?", c:["The dog's bones","The dogs's bones","The dogs' bones","The doges bones"], a:2},
  {q:"What is it called when a gas changes into a liquid?", c:["Evaporation","Condensation","Sublimation","Melting"], a:1},
  {q:"Which ancient civilization is credited with developing an early form of democracy?", c:["Ancient Rome","Ancient Greece","Ancient Egypt","Ancient China"], a:1},
  {q:"What is the sum of the interior angles of any triangle?", c:["90 degrees","180 degrees","270 degrees","360 degrees"], a:1},
  {q:"What do you call the main character in a story?", c:["Antagonist","Protagonist","Narrator","Setting"], a:1},
  {q:"What is the smallest unit of an element that still has the properties of that element?", c:["Molecule","Atom","Cell","Compound"], a:1},
  {q:"Which ancient civilization built the Great Wall to help defend its borders?", c:["Ancient Rome","Ancient China","Ancient Persia","Ancient Egypt"], a:1},
  {q:"What is 7 squared?", c:["14","49","42","56"], a:1},
  {q:"What do you call the character who opposes the main character?", c:["Protagonist","Antagonist","Narrator","Author"], a:1},
  {q:"What do you call a substance made of two or more elements chemically combined?", c:["Mixture","Compound","Solution","Atom"], a:1},
  {q:"Which river valley civilization arose along the Tigris and Euphrates rivers?", c:["Indus Valley","Mesopotamia","Nile Valley","Yellow River Valley"], a:1},
  {q:"Simplify: 5 × (3 + 2)", c:["17","20","25","10"], a:2},
  {q:"What term describes where and when a story takes place?", c:["Plot","Theme","Setting","Tone"], a:2},
  {q:"What is the chemical formula for water?", c:["CO2","H2O","O2","NaCl"], a:1},
  {q:"What term describes a government where citizens elect representatives to make decisions?", c:["Monarchy","Republic","Empire","Dictatorship"], a:1},
  {q:"Solve for x: 3x = 21", c:["6","7","8","63"], a:1},
  {q:"What term describes the central message or lesson of a story?", c:["Plot","Theme","Climax","Setting"], a:1},
  {q:"What do you call the chart that organizes all known chemical elements?", c:["Elemental chart","Periodic table","Molecular grid","Atomic map"], a:1},
  {q:"In approximately what year did World War II end?", c:["1918","1939","1945","1953"], a:2},
  {q:"What is 0.6 written as a fraction in simplest form?", c:["6/10","3/5","2/3","3/10"], a:1},
  {q:"What term describes the sequence of events in a story?", c:["Theme","Plot","Mood","Symbol"], a:1},
  {q:"Which planet is closest to the sun?", c:["Venus","Mercury","Earth","Mars"], a:1},
  {q:"Which invention by Johannes Gutenberg dramatically changed how information spread in the 1400s?", c:["The telephone","The printing press","The steam engine","The compass"], a:1},
  {q:"Using pi ≈ 3.14, what is the area of a circle with radius 3?", c:["9.42","18.84","28.26","6.28"], a:2},
  {q:"What do you call the highest point of tension in a story?", c:["Exposition","Climax","Resolution","Rising action"], a:1},
  {q:"Which planet is best known for its large, visible rings?", c:["Jupiter","Saturn","Uranus","Neptune"], a:1},
  {q:"What imaginary line divides Earth into Northern and Southern Hemispheres?", c:["The prime meridian","The equator","The Tropic of Cancer","The International Date Line"], a:1},
  {q:"What is the additive inverse (opposite) of 9?", c:["9","0","-9","1/9"], a:2},
  {q:"What do you call a word that means nearly the same as another word?", c:["Antonym","Synonym","Homophone","Prefix"], a:1},
  {q:"Which is the largest planet in our solar system?", c:["Saturn","Jupiter","Neptune","Earth"], a:1},
  {q:"What imaginary line running through Greenwich, England divides Earth into Eastern and Western Hemispheres?", c:["The equator","The prime meridian","The Arctic Circle","The tropic line"], a:1},
  {q:"What is the perimeter of a rectangle with sides 5 and 3?", c:["8","15","16","30"], a:2},
  {q:"What do you call a word that sounds the same as another word but has a different meaning and spelling?", c:["Synonym","Antonym","Homophone","Homograph"], a:2},
  {q:"What is the name of Earth's only natural satellite?", c:["Mars","The Moon","Titan","Europa"], a:1},
  {q:"On a map, what tool shows direction, such as which way is north or south?", c:["A legend","A compass rose","A scale bar","A grid"], a:1},
  {q:"Solve: -12 divided by 4", c:["3","-3","-8","48"], a:1},
  {q:"What term describes who is telling a story?", c:["Theme","Point of view","Setting","Plot"], a:1},
  {q:"What galaxy is our solar system located in?", c:["Andromeda","Milky Way","Triangulum","Whirlpool"], a:1},
  {q:"On a map, what feature explains what the symbols and colors represent?", c:["The compass rose","The legend","The scale","The title"], a:1},
  {q:"What is 40% written as a decimal?", c:["4.0","0.4","0.04","40"], a:1},
  {q:"In first-person point of view, which pronoun is most commonly used?", c:["He","She","I","They"], a:2},
  {q:"What do we call a body like Pluto that orbits the sun but hasn't cleared its orbital path?", c:["An asteroid","A dwarf planet","A comet","A moon"], a:1},
  {q:"Lines of latitude measure distance from what reference line?", c:["The prime meridian","The equator","The North Pole","The poles"], a:1},
  {q:"A recipe uses a 2:3 ratio of sugar to flour. If you use 4 cups of sugar, how many cups of flour are needed?", c:["5","6","8","4"], a:1},
  {q:"What is a prefix?", c:["A word part added to the end of a word","A word part added to the beginning of a word","A word that means the opposite","A punctuation mark"], a:1},
  {q:"What mainly causes Earth's seasons to change?", c:["Earth's distance from the sun changing a lot","Earth's tilt on its axis","The moon's gravity","Solar flares"], a:1},
  {q:"Lines of longitude measure distance from what reference line?", c:["The equator","The prime meridian","The Arctic Circle","The South Pole"], a:1},
  {q:"What is the measure of a right angle?", c:["45 degrees","90 degrees","180 degrees","360 degrees"], a:1},
  {q:"In the word 'hopeful,' what is '-ful'?", c:["A prefix","A root word","A suffix","A synonym"], a:2},
  {q:"What does a food chain show?", c:["How rocks change over time","The path of energy from one living thing to another","The layers of Earth's atmosphere","How weather patterns form"], a:1},
  {q:"In economics, what term describes how much of a good or service is available?", c:["Demand","Supply","Budget","Trade"], a:1},
  {q:"What do you call a shape with exactly 5 sides?", c:["Hexagon","Pentagon","Octagon","Quadrilateral"], a:1},
  {q:"Which sentence uses commas correctly?", c:["I bought apples bananas and oranges.","I bought apples, bananas, and oranges.","I bought, apples bananas and oranges.","I bought apples bananas, and oranges."], a:1},
  {q:"In a food chain, what do we call organisms that make their own food using sunlight?", c:["Consumers","Producers","Decomposers","Predators"], a:1},
  {q:"In economics, what term describes how much people want to buy a good or service?", c:["Supply","Demand","Currency","Tariff"], a:1},
  {q:"Simplify: 10 - 3 × 2", c:["14","4","2","17"], a:1},
  {q:"What is an idiom?", c:["A phrase whose meaning can't be understood from the literal words alone","A word that rhymes with another","A type of punctuation mark","A formal way of speaking"], a:0},
  {q:"What do we call organisms that break down dead plants and animals for nutrients?", c:["Producers","Consumers","Decomposers","Predators"], a:2},
  {q:"According to supply and demand, what usually happens to price when demand rises but supply stays the same?", c:["Price falls","Price rises","Price stays flat","Price disappears"], a:1},
  {q:"What is the least common multiple of 4 and 6?", c:["24","12","10","6"], a:1},
  {q:"Which sentence is written in past tense?", c:["She walks to school.","She will walk to school.","She walked to school.","She is walking to school."], a:2},
  {q:"What is an ecosystem?", c:["A community of living things interacting with their environment","A single type of rock","A chart of the planets","A tool for measuring temperature"], a:0},
  {q:"What term describes things people must have to survive, like food, water, and shelter?", c:["Wants","Needs","Luxuries","Goods"], a:1},
  {q:"What is the greatest common factor of 18 and 24?", c:["3","6","9","12"], a:1},
  {q:"Which sentence uses the correct superlative form of the adjective 'tall'?", c:["She is the more tall student in class.","She is the tallest student in class.","She is the tallerest student in class.","She is the most tallest student in class."], a:1},
  {q:"What do you call an animal that eats only plants?", c:["Carnivore","Herbivore","Omnivore","Decomposer"], a:1},
  {q:"What term describes things people would like to have but don't need to survive, like a video game?", c:["Needs","Wants","Resources","Currency"], a:1},
  {q:"A shirt costs $40 and is on sale for 25% off. What is the sale price?", c:["$35","$30","$10","$32"], a:1},
  {q:"What is alliteration?", c:["Repeating the same first sound in nearby words","Comparing two things using 'like'","Giving human traits to animals","A word that imitates a sound"], a:0},
  {q:"What do you call an animal that eats both plants and animals?", c:["Carnivore","Herbivore","Omnivore","Producer"], a:2},
  {q:"What is it called when countries exchange goods and services with one another?", c:["Taxation","Trade","Currency exchange","Production"], a:1},
  {q:"What is the value of |-8|?", c:["-8","8","0","1/8"], a:1},
  {q:"What is onomatopoeia?", c:["A word that imitates the sound it describes, such as 'buzz'","A word with the opposite meaning of another word","A five-line poem","A type of question"], a:0},
  {q:"What gas do plants absorb from the air during photosynthesis?", c:["Oxygen","Carbon dioxide","Nitrogen","Hydrogen"], a:1},
  {q:"What ancient trade route connected China to Europe and the Middle East, carrying silk and other goods?", c:["The Amber Road","The Silk Road","The Spice Route","The Royal Road"], a:1},
  {q:"What is 6 cubed?", c:["18","36","216","64"], a:2},
  {q:"Which of these words is a conjunction?", c:["Quickly","Beautiful","And","Under"], a:2},
  {q:"What gas do plants release during photosynthesis that animals need to breathe?", c:["Carbon dioxide","Oxygen","Nitrogen","Methane"], a:1},
  {q:"Which continent has the greatest number of individual countries?", c:["Asia","Europe","Africa","South America"], a:2}
];

const SCHOOL_QUESTIONS_TEEN = [
  {q:"Solve for x: 3x - 7 = 14",c:["5","6","7","8"],a:2},
  {q:"What is the chemical symbol for gold?",c:["Go","Gd","Au","Ag"],a:2},
  {q:"Which word most nearly means brief and to the point?",c:["verbose","concise","vague","elaborate"],a:1},
  {q:"In what year was the U.S. Declaration of Independence signed?",c:["1763","1776","1789","1800"],a:1},
  {q:"Solve for x: 2x + 5 = 17",c:["4","5","6","7"],a:2},
  {q:"What is the chemical symbol for sodium?",c:["So","Sd","Na","Nu"],a:2},
  {q:"Which word most nearly means showing great enthusiasm?",c:["indifferent","ardent","apathetic","reluctant"],a:1},
  {q:"In what year did World War II end?",c:["1918","1939","1945","1950"],a:2},
  {q:"Solve for x: 5x = 45",c:["7","8","9","10"],a:2},
  {q:"What is the chemical formula for water?",c:["CO2","H2O","O2","HO2"],a:1},
  {q:"Which word is most nearly opposite in meaning to benevolent?",c:["kind","malicious","generous","charitable"],a:1},
  {q:"Who was the first President of the United States?",c:["Thomas Jefferson","John Adams","George Washington","James Madison"],a:2},
  {q:"If y = 2x + 3 and x = 4, what is y?",c:["9","10","11","12"],a:2},
  {q:"What is the pH value of a neutral solution?",c:["0","5","7","14"],a:2},
  {q:"Which word means to make something less severe?",c:["aggravate","mitigate","intensify","amplify"],a:1},
  {q:"The Cold War was primarily a rivalry between the United States and which nation?",c:["Germany","Soviet Union","China","France"],a:1},
  {q:"Simplify: x^2 * x^3",c:["x^5","x^6","x^8","x^9"],a:0},
  {q:"How many protons does a hydrogen atom have?",c:["0","1","2","3"],a:1},
  {q:"Which word means lacking experience or judgment?",c:["naive","astute","cynical","shrewd"],a:0},
  {q:"The Renaissance, a period of renewed art and learning, began in which country?",c:["France","Spain","Italy","England"],a:2},
  {q:"What is the slope of the line y = 3x + 2?",c:["2","3","5","-3"],a:1},
  {q:"What is the most abundant gas in Earth's atmosphere?",c:["Oxygen","Carbon Dioxide","Nitrogen","Hydrogen"],a:2},
  {q:"Which word means widespread or common?",c:["scarce","prevalent","obsolete","isolated"],a:1},
  {q:"What writing system did the ancient Egyptians use?",c:["cuneiform","hieroglyphics","runes","calligraphy"],a:1},
  {q:"Solve for x: x/4 = 12",c:["36","40","44","48"],a:3},
  {q:"What is the chemical symbol for iron?",c:["Ir","In","Fe","Fr"],a:2},
  {q:"Which word means stubbornly refusing to change?",c:["flexible","obstinate","compliant","agreeable"],a:1},
  {q:"In what year did World War I begin?",c:["1905","1914","1929","1939"],a:1},
  {q:"Factor: x^2 - 9",c:["(x-3)(x+3)","(x-9)(x+1)","(x-3)^2","(x+9)(x-1)"],a:0},
  {q:"What is the basic building block of matter called?",c:["cell","atom","molecule","electron"],a:1},
  {q:"Which word is a synonym for abundant?",c:["scarce","plentiful","limited","sparse"],a:1},
  {q:"In what year did the U.S. Civil War end?",c:["1861","1865","1877","1900"],a:1},
  {q:"Solve for x: 2(x+3) = 16",c:["4","5","6","7"],a:1},
  {q:"Which state of matter has a fixed shape and a fixed volume?",c:["gas","liquid","solid","plasma"],a:2},
  {q:"A comparison using like or as is called a:",c:["metaphor","simile","hyperbole","personification"],a:1},
  {q:"Who is most commonly credited with developing the practical incandescent light bulb?",c:["Nikola Tesla","Thomas Edison","Alexander Graham Bell","Benjamin Franklin"],a:1},
  {q:"What is the sum of the interior angles of a triangle?",c:["90 degrees","180 degrees","270 degrees","360 degrees"],a:1},
  {q:"What is the chemical formula for table salt?",c:["NaCl","KCl","CaCl2","NaOH"],a:0},
  {q:"A direct comparison between two unlike things that does not use like or as is called a:",c:["simile","metaphor","alliteration","irony"],a:1},
  {q:"Which ancient wonder still standing today is located in Egypt?",c:["Colossus of Rhodes","Hanging Gardens","Great Pyramid of Giza","Lighthouse of Alexandria"],a:2},
  {q:"Which formula gives the area of a circle with radius r?",c:["2 * pi * r","pi * r^2","pi * d","4 * pi * r^2"],a:1},
  {q:"What is the chemical symbol for oxygen?",c:["Ox","O","Og","Oy"],a:1},
  {q:"Giving human traits to non-human things or objects is called:",c:["personification","symbolism","foreshadowing","satire"],a:0},
  {q:"Which is the largest continent by land area?",c:["Africa","Asia","North America","Europe"],a:1},
  {q:"How many sides does a hexagon have?",c:["5","6","7","8"],a:1},
  {q:"What is the basic unit of life called?",c:["atom","cell","tissue","organ"],a:1},
  {q:"A contrast between what is expected and what actually happens is called:",c:["irony","imagery","tone","mood"],a:0},
  {q:"The Nile River, one of the longest rivers in the world, is located on which continent?",c:["Asia","South America","Africa","Australia"],a:2},
  {q:"In a right triangle with legs 3 and 4, what is the length of the hypotenuse?",c:["5","6","7","8"],a:0},
  {q:"Which organelle is known as the powerhouse of the cell?",c:["nucleus","ribosome","mitochondria","vacuole"],a:2},
  {q:"The main character of a story is called the:",c:["antagonist","narrator","protagonist","author"],a:2},
  {q:"Which is the largest ocean on Earth?",c:["Atlantic","Indian","Arctic","Pacific"],a:3},
  {q:"What is the sum of the interior angles of a quadrilateral?",c:["180 degrees","270 degrees","360 degrees","450 degrees"],a:2},
  {q:"Which molecule carries an organism's genetic information?",c:["RNA","DNA","ATP","protein"],a:1},
  {q:"The character who opposes the main character is called the:",c:["protagonist","antagonist","narrator","foil"],a:1},
  {q:"What is the capital city of France?",c:["Lyon","Marseille","Paris","Nice"],a:2},
  {q:"What is the area of a rectangle with length 8 and width 5?",c:["13","35","40","45"],a:2},
  {q:"How many chromosomes are typically found in a human body cell?",c:["23","44","46","48"],a:2},
  {q:"The repetition of initial consonant sounds in nearby words is called:",c:["assonance","alliteration","rhyme","onomatopoeia"],a:1},
  {q:"Which is the smallest continent by land area?",c:["Europe","Australia","Antarctica","South America"],a:1},
  {q:"A right angle measures how many degrees?",c:["45","60","90","180"],a:2},
  {q:"Which organ is primarily responsible for pumping blood through the body?",c:["lungs","liver","heart","kidney"],a:2},
  {q:"Deliberate exaggeration used for effect is called:",c:["hyperbole","understatement","irony","metaphor"],a:0},
  {q:"The Sahara, the world's largest hot desert, is located on which continent?",c:["Asia","Africa","Australia","South America"],a:1},
  {q:"In a right triangle, sine equals the opposite side divided by which side?",c:["adjacent","hypotenuse","opposite","base"],a:1},
  {q:"What is the process by which plants use sunlight to make food called?",c:["respiration","photosynthesis","fermentation","digestion"],a:1},
  {q:"A hint or clue about events that will happen later in a story is called:",c:["flashback","foreshadowing","climax","resolution"],a:1},
  {q:"Mount Everest, the tallest mountain above sea level, is part of which mountain range?",c:["Andes","Rockies","Himalayas","Alps"],a:2},
  {q:"What is cos(0 degrees)?",c:["0","1","-1","undefined"],a:1},
  {q:"Which gas do plants absorb from the air during photosynthesis?",c:["oxygen","nitrogen","carbon dioxide","hydrogen"],a:2},
  {q:"The vantage point from which a story is narrated is called its:",c:["theme","point of view","setting","plot"],a:1},
  {q:"The Amazon Rainforest is located primarily in which country?",c:["Peru","Colombia","Brazil","Venezuela"],a:2},
  {q:"What is tan(45 degrees)?",c:["0","1","-1","undefined"],a:1},
  {q:"What is the largest organ of the human body?",c:["liver","brain","skin","lungs"],a:2},
  {q:"The central message or underlying idea of a literary work is called its:",c:["plot","setting","theme","tone"],a:2},
  {q:"How many branches does the United States federal government have?",c:["Two","Three","Four","Five"],a:1},
  {q:"What is the probability of flipping heads on a fair coin?",c:["1/6","1/4","1/2","1/3"],a:2},
  {q:"What is the basic unit of heredity called?",c:["cell","gene","chromosome","protein"],a:1},
  {q:"Which part of speech describes or modifies a noun?",c:["verb","adjective","adverb","preposition"],a:1},
  {q:"Which branch of a typical government is responsible for making laws?",c:["executive","judicial","legislative","administrative"],a:2},
  {q:"What is the mean of the numbers 2, 4, 6, and 8?",c:["4","5","6","8"],a:1},
  {q:"Which organ system is primarily responsible for breathing?",c:["circulatory system","respiratory system","digestive system","nervous system"],a:1},
  {q:"Which part of speech expresses an action or a state of being?",c:["noun","verb","conjunction","interjection"],a:1},
  {q:"Which branch of a typical government is responsible for enforcing laws?",c:["legislative","executive","judicial","regulatory"],a:1},
  {q:"What is the median of the data set 3, 7, 9, 15, 20?",c:["7","9","15","11"],a:1},
  {q:"What is the standard unit used to measure force?",c:["Joule","Watt","Newton","Pascal"],a:2},
  {q:"Which part of speech is used in place of a noun?",c:["adjective","pronoun","adverb","preposition"],a:1},
  {q:"Which branch of a typical government is responsible for interpreting laws?",c:["executive","legislative","judicial","local"],a:2},
  {q:"What is the probability of rolling a 4 on a standard six-sided die?",c:["1/2","1/3","1/6","1/4"],a:2},
  {q:"Newton's first law of motion is closely associated with which concept?",c:["momentum","inertia","friction","gravity"],a:1},
  {q:"A group of words containing a subject and a verb that expresses a complete thought is called a:",c:["phrase","clause","sentence","fragment"],a:2},
  {q:"How many justices typically sit on the U.S. Supreme Court?",c:["7","9","11","13"],a:1},
  {q:"What is the mode of the data set 2, 2, 3, 5, 7?",c:["2","3","5","7"],a:0},
  {q:"Speed is calculated by dividing distance by which quantity?",c:["mass","time","force","acceleration"],a:1},
  {q:"Which punctuation mark can be used to join two independent clauses without a conjunction?",c:["comma","semicolon","hyphen","colon"],a:1},
  {q:"A term of office for a U.S. president lasts how many years?",c:["2","4","6","8"],a:1},
  {q:"What is the range of the data set 4, 9, 15, and 21?",c:["11","15","17","21"],a:2},
  {q:"What is the standard unit of electrical resistance?",c:["Volt","Amp","Watt","Ohm"],a:3},
  {q:"Which part of speech connects words, phrases, or clauses?",c:["conjunction","interjection","pronoun","article"],a:0},
  {q:"What is the name for the document that outlines a nation's fundamental laws and government structure?",c:["treaty","charter","constitution","statute"],a:2},
  {q:"What is the probability of drawing an ace from a standard deck of 52 cards?",c:["1/52","1/26","1/13","1/4"],a:2},
  {q:"What force pulls objects toward the center of the Earth?",c:["magnetism","friction","gravity","tension"],a:2},
  {q:"What is the plural form of the word child?",c:["childs","children","childes","childrens"],a:1},
  {q:"According to basic economics, if demand increases while supply stays the same, price tends to:",c:["decrease","stay the same","increase","become zero"],a:2},
  {q:"What is 15% of 200?",c:["15","20","30","35"],a:2},
  {q:"What term describes the energy of motion?",c:["potential energy","kinetic energy","thermal energy","chemical energy"],a:1},
  {q:"In the sentence The dog wagged its tail, which word is a possessive pronoun?",c:["dog","wagged","its","tail"],a:2},
  {q:"What economic term describes a general rise in prices over time?",c:["deflation","inflation","recession","surplus"],a:1},
  {q:"Expand: 4(x - 2)",c:["4x - 2","4x - 6","4x - 8","x - 8"],a:2},
  {q:"What term describes energy stored due to an object's position?",c:["kinetic energy","potential energy","radiant energy","nuclear energy"],a:1},
  {q:"A word that describes or modifies a verb, adjective, or another adverb is called a(n):",c:["noun","adverb","preposition","article"],a:1},
  {q:"In an economic system based on private ownership and free markets, what is this system commonly called?",c:["socialism","capitalism","communism","feudalism"],a:1},
  {q:"What is the formula for the circumference of a circle?",c:["pi * r^2","2 * pi * r","pi * d^2","4 * pi * r"],a:1},
  {q:"Approximately how fast does light travel in a vacuum?",c:["300 km/s","3,000 km/s","300,000 km/s","3,000,000 km/s"],a:2},
  {q:"The turning point of highest tension in a story's plot is called the:",c:["exposition","climax","resolution","rising action"],a:1},
  {q:"What term describes goods and services that a country sells to other countries?",c:["imports","exports","tariffs","subsidies"],a:1},
  {q:"Solve the inequality: x + 5 > 12",c:["x > 5","x > 6","x > 7","x > 8"],a:2},
  {q:"Which state of matter has no fixed shape and no fixed volume?",c:["solid","liquid","gas","plasma only"],a:2},
  {q:"A brief story that teaches a moral lesson, often using animal characters, is called a:",c:["myth","legend","fable","biography"],a:2},
  {q:"What basic economic term describes the amount of a good that producers are willing to sell?",c:["demand","supply","surplus","deficit"],a:1}
];
const SCHOOL_QUESTIONS = {
  young: SCHOOL_QUESTIONS_YOUNG,
  kid: SCHOOL_QUESTIONS_KID,
  tween: SCHOOL_QUESTIONS_TWEEN,
  teen: SCHOOL_QUESTIONS_TEEN,
};

// ─── SUBJECT TAGGING — City Life's real school day rotates a different SUBJECT each class period
// (SUBJECT_BY_PERIOD). The 4 age-band pools above were written pre-mixed (math/reading/language/
// science/social-studies all together, "naturally mixed" — see their own header comment) rather
// than pre-split by subject, and retyping 552 hand-written questions by hand just to add a label
// risked introducing a typo into content that already works. Instead, each question is tagged
// AFTER the fact by a real, deterministic keyword classifier — not perfect (a few questions land in
// a slightly loose bucket, e.g. a "who invented the telephone" history question tagging as Social
// rather than some finer "history" bucket that doesn't exist here), but real and consistent every
// time, and checked live against actual per-band/per-subject counts during this feature's own
// testing rather than assumed correct. Runs once, right after the 4 bank arrays above are declared,
// mutating each question object in place with a `.subj` field.
function classifySchoolQuestion(q) {
  const t = q.q.toLowerCase();
  if (/color.*mix|mix.*color|primary color|secondary color|warm color|cool color/.test(t)) return 'Art';
  if (/\d\s*[+\-×x]\s*\d|divided by|÷|fraction|percent|number is missing|pattern:|which group has (more|fewer)|how (much|many) .*(left|total|in all|altogether)|minutes are in|hours are in|days are in one|half of|quarter of|solve|inequality|\bequation\b|expression|evaluate|simplify|coefficient|exponent|square root|\bratio\b|proportion|\balgebra\b|perimeter|area of|volume of|circumference|\bslope\b|\bmean\b|\bmedian\b|\bmode\b|probability|\bdegrees\b|multiply|multiplication|division|subtract|\bsum\b|\bproduct\b|\bdifference\b|\bquotient\b|whole numbers?|decimals?|\binteger/.test(t)) return 'Math';
  if (/rhymes with|synonym|antonym|opposite of|plural (of|form)|sight word|which word (is|means|starts)|sound does|\bvowel\b|syllable|prefix|suffix|\bnoun\b|\bverb\b|adjective|adverb|\bsentence\b|\bspell\b|letter comes|starts with the (same|letter)/.test(t)) return 'Reading';
  if (/planet|solar system|galaxy|\bmoon\b|\bstar\b|gravity|\batom\b|molecule|\bcell\b|\borgan\b|\banimal\b|herbivore|carnivore|omnivore|habitat|ecosystem|photosynthesis|chlorophyll|state of matter|\bliquid\b|\bgas\b|\bsolid\b|evaporat|condens|weather|water cycle|life cycle|caterpillar|butterfly|\bsense\b|senses|body part|breathe|skeleton|species|vertebrate|magnet|electricity|\bforce\b|\benergy\b|temperature|thermometer|\bocean\b|\bfish\b|\bbird\b|insect|\bplant\b|\bseed\b|\bsun\b/.test(t)) return 'Science';
  return 'Social'; // community helpers, geography, civics, calendar, history/inventors, money — the real "everything else" bucket
}
function tagSchoolQuestionBank(bank) { bank.forEach(q => { q.subj = classifySchoolQuestion(q); }); }
[SCHOOL_QUESTIONS_YOUNG, SCHOOL_QUESTIONS_KID, SCHOOL_QUESTIONS_TWEEN, SCHOOL_QUESTIONS_TEEN].forEach(tagSchoolQuestionBank);

// ─── ART QUESTIONS — genuinely missing from both the age-band pools above and the Science Lab's
// bank, so this is a real small new hand-written bank (not a stub) covering color theory/mixing,
// art tools and vocabulary, and (tween/teen) real art history — the same "who invented the
// telephone → Alexander Graham Bell" style of factual trivia the age-band pools already use for
// long-dead historical figures, just for art (Van Gogh, Picasso, da Vinci, Michelangelo).
const SCHOOL_ART_YOUNG = [
  {q:"What color do you get when you mix red and yellow paint?", c:["Purple","Green","Orange","Blue"], a:2, subj:'Art'},
  {q:"What color do you get when you mix blue and yellow paint?", c:["Green","Orange","Purple","Red"], a:0, subj:'Art'},
  {q:"What color do you get when you mix red and blue paint?", c:["Orange","Green","Purple","Yellow"], a:2, subj:'Art'},
  {q:"Which of these is a primary color that can't be made by mixing others?", c:["Orange","Purple","Blue","Green"], a:2, subj:'Art'},
  {q:"What tool do you use to paint a picture?", c:["A fork","A paintbrush","A pillow","A shoe"], a:1, subj:'Art'},
  {q:"What shape do artists usually start with when drawing a sun?", c:["Square","Triangle","Circle","Star"], a:2, subj:'Art'},
  {q:"What color is the sky on a clear day?", c:["Green","Blue","Brown","Purple"], a:1, subj:'Art'},
  {q:"What color are most leaves in the summer?", c:["Blue","Green","Purple","Gray"], a:1, subj:'Art'},
  {q:"What do artists call the little board they hold to mix their paint colors?", c:["A palette","A plate","A frame","A canvas"], a:0, subj:'Art'},
  {q:"If you mix white paint into a color, does it get lighter or darker?", c:["Darker","Lighter","It stays the same","It disappears"], a:1, subj:'Art'},
  {q:"What do we call a picture made by pressing a paint-covered hand onto paper?", c:["A footprint","A handprint","A fingerprint","A stamp"], a:1, subj:'Art'},
  {q:"What do you call a picture of yourself that you draw or paint?", c:["A landscape","A self-portrait","A cartoon","A sketch"], a:1, subj:'Art'},
];
const SCHOOL_ART_KID = [
  {q:"What are red, yellow, and blue called, since you can't mix other colors to make them?", c:["Secondary colors","Primary colors","Warm colors","Neutral colors"], a:1, subj:'Art'},
  {q:"What are orange, green, and purple called, since they're made by mixing two primary colors?", c:["Primary colors","Secondary colors","Cool colors","Pastel colors"], a:1, subj:'Art'},
  {q:"Which of these is considered a 'cool' color?", c:["Red","Orange","Blue","Yellow"], a:2, subj:'Art'},
  {q:"Which of these is considered a 'warm' color?", c:["Blue","Purple","Green","Red"], a:3, subj:'Art'},
  {q:"What is the flat surface artists mix their paint on called?", c:["A canvas","A palette","An easel","A frame"], a:1, subj:'Art'},
  {q:"What do we call the wooden stand artists use to hold their canvas while painting?", c:["A palette","An easel","A frame","A loom"], a:1, subj:'Art'},
  {q:"What do we call a picture that shows an outdoor scene, like mountains or fields?", c:["A portrait","A landscape","A still life","An abstract"], a:1, subj:'Art'},
  {q:"What do we call a drawing or painting of a person's face?", c:["A landscape","A portrait","A mural","A sketch"], a:1, subj:'Art'},
  {q:"What do we call art made by carving or shaping materials like clay or stone into a 3D object?", c:["A painting","A sculpture","A sketch","A collage"], a:1, subj:'Art'},
  {q:"What do you call it when an artist mixes white into a color to make it lighter?", c:["A shade","A tint","A hue","A tone"], a:1, subj:'Art'},
  {q:"What do you call it when an artist mixes black into a color to make it darker?", c:["A tint","A shade","A hue","A blend"], a:1, subj:'Art'},
  {q:"Which shapes are considered 'geometric' shapes, like squares and triangles?", c:["Free-form shapes","Organic shapes","Geometric shapes","Abstract shapes"], a:2, subj:'Art'},
];
const SCHOOL_ART_TWEEN = [
  {q:"On the color wheel, which colors sit directly across from each other and make each other look brighter?", c:["Similar colors","Complementary colors","Primary colors","Neutral colors"], a:1, subj:'Art'},
  {q:"What do we call colors like red, orange, and yellow that sit next to each other on the color wheel and share a hue family?", c:["Analogous colors","Complementary colors","Monochromatic colors","Cool colors"], a:0, subj:'Art'},
  {q:"What do we call a piece of art that uses only different shades and tints of ONE single color?", c:["A complementary piece","A monochromatic piece","An analogous piece","A collage"], a:1, subj:'Art'},
  {q:"Which of these is one of the basic 'elements of art' that every drawing is built from?", c:["Rhythm","Line","Melody","Tempo"], a:1, subj:'Art'},
  {q:"In art, what does 'texture' describe?", c:["How loud a piece of art is","How a surface looks or feels, like rough or smooth","How big a piece of art is","How old a piece of art is"], a:1, subj:'Art'},
  {q:"What do we call art made by gluing different materials like paper, fabric, or photos onto a surface?", c:["A mural","A collage","A fresco","A mosaic"], a:1, subj:'Art'},
  {q:"What do we call a huge painting made directly on a wall?", c:["A mural","A miniature","A sketch","A print"], a:0, subj:'Art'},
  {q:"What is 'perspective' in a drawing used to create?", c:["The illusion of depth or distance","Bright colors only","A frame around the picture","A signature"], a:0, subj:'Art'},
  {q:"What do we call the 3 properties of color — hue, value, and saturation — together?", c:["The color harmony","The color wheel","The color properties","The palette rule"], a:2, subj:'Art'},
  {q:"What famous Dutch painter is known for 'The Starry Night'?", c:["Pablo Picasso","Vincent van Gogh","Claude Monet","Leonardo da Vinci"], a:1, subj:'Art'},
  {q:"What do we call art that doesn't try to look like anything real, using only shapes and colors?", c:["Realism","Abstract art","Portraiture","Still life"], a:1, subj:'Art'},
];
const SCHOOL_ART_TEEN = [
  {q:"Leonardo da Vinci, who painted the Mona Lisa, lived during which famous historical art period?", c:["The Renaissance","The Stone Age","The Industrial Revolution","The Roman Empire"], a:0, subj:'Art'},
  {q:"Which art movement, led by artists like Claude Monet, focused on capturing light and fleeting moments with loose brushstrokes?", c:["Cubism","Impressionism","Surrealism","Pop Art"], a:1, subj:'Art'},
  {q:"Pablo Picasso helped pioneer which art movement, known for showing subjects from multiple angles at once?", c:["Impressionism","Cubism","Baroque","Romanticism"], a:1, subj:'Art'},
  {q:"Which art movement, associated with artists like Salvador Dalí, explored dreamlike and bizarre imagery?", c:["Realism","Surrealism","Minimalism","Classicism"], a:1, subj:'Art'},
  {q:"What do we call the technique of using light and shadow to create the illusion of 3D form in a 2D artwork?", c:["Chiaroscuro","Pointillism","Collage","Fresco"], a:0, subj:'Art'},
  {q:"What do we call a painting technique made entirely of small, distinct dots of color?", c:["Pointillism","Chiaroscuro","Impasto","Cubism"], a:0, subj:'Art'},
  {q:"What is the term for the specific range of colors an artist chooses to use in a piece?", c:["A palette","A gallery","A gradient","A vignette"], a:0, subj:'Art'},
  {q:"What do we call a museum or space specifically dedicated to displaying and selling art?", c:["A studio","A gallery","A workshop","An atelier"], a:1, subj:'Art'},
  {q:"Michelangelo famously painted the ceiling of which chapel in Vatican City?", c:["The Notre Dame","The Sistine Chapel","Westminster Abbey","St. Basil's Cathedral"], a:1, subj:'Art'},
  {q:"What do we call the golden-ratio-based compositional rule many artists use to place the focal point of an image off-center?", c:["The rule of thirds","The golden frame","The center rule","The symmetry rule"], a:0, subj:'Art'},
  {q:"What art medium involves carving an image into a surface and pressing it onto paper, used for making multiple copies?", c:["Sculpture","Printmaking","Fresco","Mosaic"], a:1, subj:'Art'},
];
const SCHOOL_ART_QUESTIONS = { young:SCHOOL_ART_YOUNG, kid:SCHOOL_ART_KID, tween:SCHOOL_ART_TWEEN, teen:SCHOOL_ART_TEEN };

// Picks the real pool for one band+subject. Deliberately NOT built as a top-level const at parse
// time — SCIENCE_QUESTIONS (the Science Lab's own bank) is declared FURTHER DOWN this same file,
// and a bare top-level reference to it here would hit exactly the load-order hazard modules/
// README.md warns about (a `const` that hasn't executed yet). Called only from inside other
// functions, at real gameplay time, long after the whole file has finished loading — completely
// safe by the time it's ever actually invoked.
function schoolSubjectPool(bandId, subject) {
  if (subject === 'Science') return SCIENCE_QUESTIONS; // the Science Lab's own real bank, shared across every age band — the Lab itself doesn't age-gate its Science Test either
  if (subject === 'Art') return SCHOOL_ART_QUESTIONS[bandId];
  return SCHOOL_QUESTIONS[bandId].filter(q => q.subj === subject);
}
function pickSchoolQuestion(bandId, subject, askedSet) {
  const fullPool = schoolSubjectPool(bandId, subject);
  let pool = askedSet ? fullPool.filter(q => !askedSet.has(q.q)) : fullPool;
  if (pool.length === 0) pool = fullPool; // a genuinely thin bucket ran out of fresh ones — a rare repeat beats a crash
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── SCHOOL DAY FLOW — openClassroom() is the real entry point (SCHOOL_ZONES's desk zone), same
// name the old single-quiz version used so the zone/HTML entry point didn't need to change, but
// now dispatches to a whole real multi-period day (renderSchoolDayView()) instead of one flat quiz.
function openClassroom() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('classroomModal').style.display = 'flex';
  renderSchoolDayView();
}
function closeClassroom() {
  document.getElementById('classroomModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderSchoolDayView() {
  const pickerView = document.getElementById('classroomPickerView');
  const dayView = document.getElementById('classroomDayView');
  if (!schoolDayState) {
    pickerView.style.display = 'block';
    dayView.style.display = 'none';
    refreshClassroomPickerUI();
    return;
  }
  pickerView.style.display = 'none';
  dayView.style.display = 'block';
  const period = SCHOOL_PERIODS[schoolDayState.period];
  document.getElementById('schoolPeriodLabel').textContent = `${period.label}${schoolDayState.isExamDay ? ' — 📝 EXAM DAY' : ''}`;
  document.getElementById('schoolPeriodDots').innerHTML = SCHOOL_PERIODS.map((p,i) =>
    `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin:0 2px;background:${i<schoolDayState.period?'#4CAF50':i===schoolDayState.period?'#FFD700':'#445'};"></span>`).join('');
  ['schoolClassView','schoolBreakView','schoolPEView','schoolDismissalView','schoolWaitingView'].forEach(id => document.getElementById(id).style.display = 'none');
  if (period.type === 'class') {
    if (schoolDayState.awaitingAnswer) { document.getElementById('schoolClassView').style.display = 'block'; renderSchoolQuestionUI(); }
    else {
      document.getElementById('schoolWaitingView').style.display = 'block';
      document.getElementById('schoolWaitingText').textContent = `Class is in session. ${schoolTeacherNPC ? schoolTeacherNPC.name : 'The teacher'} will call on you soon — feel free to close this and look around the room.`;
    }
  } else if (period.type === 'break') {
    document.getElementById('schoolBreakView').style.display = 'block';
    renderSchoolBreakUI(period.kind);
  } else if (period.type === 'pe') {
    document.getElementById('schoolPEView').style.display = 'block';
    renderSchoolPEUI();
  } else if (period.type === 'dismissal') {
    document.getElementById('schoolDismissalView').style.display = 'block';
    renderSchoolDismissalUI();
  }
}
function refreshClassroomPickerUI() {
  const box2 = document.getElementById('classroomPickerBox');
  const remainMs = SCHOOL_QUIZ_COOLDOWN_MS - (Date.now() - schoolLastQuizAt);
  if (remainMs > 0) {
    const mins = Math.ceil(remainMs/60000);
    box2.innerHTML = `<div style="color:#aaa;">📚 You already had class recently. Come back in ${mins} minute${mins===1?'':'s'}.</div>`;
    return;
  }
  const homeworkNote = schoolHomework ? `<div style="color:#ff8888;font-size:11px;margin-bottom:8px;">⚠️ You still have unfinished ${schoolHomework.subject} homework — starting today's class without it will cost you ${SCHOOL_HOMEWORK_MISS_PENALTY} S.I.P.!</div>` : '';
  box2.innerHTML = `
    ${homeworkNote}
    <div style="margin-bottom:10px;">How old are you? Class picks real questions to match your age.</div>
    <input id="classroomAgeInput" type="number" min="5" max="99" placeholder="Your age"
      style="width:100%;box-sizing:border-box;padding:8px;margin-bottom:10px;border-radius:6px;border:1px solid #446;background:#0a1428;color:#fff;font-size:13px;text-align:center;">
    <button class="shopBtn" style="width:100%;" onclick="startSchoolDay()">📝 Start School Day</button>`;
}
function startSchoolDay() {
  const remainMs = SCHOOL_QUIZ_COOLDOWN_MS - (Date.now() - schoolLastQuizAt);
  if (remainMs > 0) { refreshClassroomPickerUI(); return; } // real race guard, same shape as prayAtChurch()'s own re-check
  const input = document.getElementById('classroomAgeInput');
  const age = Math.max(3, Math.min(99, parseInt(input && input.value, 10) || 10));
  const bandId = ageToSchoolBand(age);
  schoolLastQuizAt = Date.now();
  schoolVisitCount++;
  const isExamDay = schoolVisitCount % 10 === 0;
  // Missed homework from last time — the teacher notices, same real consequence City Life's own
  // enterSchool() applies, just in S.I.P. instead of happiness.
  if (schoolHomework) {
    const missed = schoolHomework;
    schoolHomework = null;
    if (document.getElementById('homeworkTab')) document.getElementById('homeworkTab').style.display = 'none';
    sipDollars = Math.max(0, sipDollars - SCHOOL_HOMEWORK_MISS_PENALTY);
    updateSIP();
    showNotif(`😠 You never finished your ${missed.subject} homework! -${SCHOOL_HOMEWORK_MISS_PENALTY} S.I.P.`);
  }
  schoolDayState = { bandId, period:0, isExamDay, correctThisPeriod:0, correctTotal:0, wrongTotal:0,
    sipEarned:0, awaitingAnswer:false, currentQuestion:null, askedSet:new Set() };
  saveCurrentUser();
  showNotif(isExamDay ? '📝 Exam day! The teacher will test you for real today.' : '📚 School day started — good luck!');
  schoolTeacherState = 'wandering';
  schoolTeacherTarget = null;
  schoolNextApproachAt = Date.now() + 3000 + Math.random()*4000; // first question comes a bit sooner than the normal between-question gap
  if (!isExamDay) setTimeout(maybeSpawnSchoolBully, 4500);
  renderSchoolDayView();
}
function openSchoolQuestion() {
  if (!schoolDayState) return;
  const period = SCHOOL_PERIODS[schoolDayState.period];
  if (period.type !== 'class') return;
  const q = pickSchoolQuestion(schoolDayState.bandId, period.subject, schoolDayState.askedSet);
  schoolDayState.askedSet.add(q.q);
  schoolDayState.currentQuestion = q;
  schoolDayState.awaitingAnswer = true;
  schoolDayState.answered = false;
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('classroomModal').style.display = 'flex';
  renderSchoolDayView();
}
function renderSchoolQuestionUI() {
  const st = schoolDayState;
  const period = SCHOOL_PERIODS[st.period];
  const q = st.currentQuestion;
  const left = SCHOOL_QUESTIONS_PER_CLASS - st.correctThisPeriod;
  document.getElementById('schoolClassProgress').textContent =
    `${period.label.toUpperCase()} — ${left} MORE TO FINISH THIS PERIOD${st.isExamDay ? ' — EXAM: DOUBLE S.I.P.' : ''}`;
  document.getElementById('schoolClassQuestion').textContent = `👩‍🏫 Ms. Holt asks: ${q.q}`;
  const choicesEl = document.getElementById('schoolClassChoices');
  choicesEl.innerHTML = q.c.map((c,i) => `<button onclick="answerSchoolQuiz(${i})" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:2px solid #446;border-radius:8px;color:#fff;font-size:12px;cursor:pointer;text-align:left;">${c}</button>`).join('');
  document.getElementById('schoolClassFeedback').innerHTML = '';
  document.getElementById('schoolClassNextBtn').style.display = 'none';
}
function answerSchoolQuiz(choiceIdx) {
  const st = schoolDayState;
  if (!st || st.answered) return; // guard double-clicks / stray repeats
  const q = st.currentQuestion;
  st.answered = true;
  Array.from(document.getElementById('schoolClassChoices').children).forEach((btn,i) => {
    btn.style.pointerEvents = 'none';
    if (i === q.a) btn.style.borderColor = '#4CAF50';
    else if (i === choiceIdx) btn.style.borderColor = '#ff5555';
  });
  const feedback = document.getElementById('schoolClassFeedback');
  if (choiceIdx === q.a) {
    const reward = SCHOOL_SIP_PER_CORRECT * (st.isExamDay ? SCHOOL_EXAM_SIP_MULT : 1);
    st.correctThisPeriod++; st.correctTotal++; st.sipEarned += reward;
    queueEarning(reward, 0, st.isExamDay ? '📝 Exam' : '🏫 School');
    feedback.innerHTML = `<span style="color:#4CAF50;">✅ Correct! +${reward} S.I.P. pending in Earnings.</span>`;
    sfx.cheer ? sfx.cheer() : sfx.buy();
  } else {
    st.wrongTotal++;
    feedback.innerHTML = `<span style="color:#ff8888;">❌ Not quite — the answer was "${q.c[q.a]}". The teacher will ask again.</span>`;
    sfx.nope();
  }
  document.getElementById('schoolClassNextBtn').style.display = 'block';
}
function advanceSchoolClassAfterAnswer() {
  const st = schoolDayState;
  if (!st) return;
  st.awaitingAnswer = false;
  st.currentQuestion = null;
  if (st.correctThisPeriod >= SCHOOL_QUESTIONS_PER_CLASS) {
    advanceSchoolPeriod();
  } else {
    schoolTeacherState = 'wandering';
    schoolTeacherTarget = null;
    schoolNextApproachAt = Date.now() + 3000 + Math.random()*5000;
    renderSchoolDayView();
  }
}
function advanceSchoolPeriod() {
  const st = schoolDayState;
  if (!st) return;
  st.period++;
  st.correctThisPeriod = 0;
  st.awaitingAnswer = false;
  st.currentQuestion = null;
  schoolTeacherState = 'wandering';
  schoolTeacherTarget = null;
  const period = SCHOOL_PERIODS[st.period];
  if (period.type === 'class') {
    schoolNextApproachAt = Date.now() + 3000 + Math.random()*5000;
    showNotif(`🔔 ${period.label} starting!`);
  } else if (period.type === 'break') {
    showNotif(`🔔 ${period.label}!`);
  } else if (period.type === 'pe') {
    showNotif('🏃 Time for P.E.! Get ready to move!');
  } else if (period.type === 'dismissal') {
    showNotif('🎒 School day done!');
  }
  saveCurrentUser();
  renderSchoolDayView();
}

// Snack/lunch breaks reuse Explox's OWN eatFood() (game-engine.js) — the exact same real bite-
// animation/taste-reaction flow every bagged food already uses — instead of a parallel food system.
const SCHOOL_SNACK_CHOICES = [
  { emoji:'🍎', name:'Apple',        taste:'sweet'  },
  { emoji:'🧀', name:'Cheese Cubes', taste:'savory' },
  { emoji:'🍋', name:'Lemonade',     taste:'sour'   },
];
const SCHOOL_LUNCH_CHOICES = [
  { emoji:'🍕', name:'Pizza Slice',  taste:'savory' },
  { emoji:'🥪', name:'Sandwich',     taste:'savory' },
  { emoji:'🥗', name:'Salad',        taste:'sweet'  },
];
function renderSchoolBreakUI(kind) {
  const isLunch = kind === 'lunch';
  const choices = isLunch ? SCHOOL_LUNCH_CHOICES : SCHOOL_SNACK_CHOICES;
  document.getElementById('schoolBreakTitle').textContent = isLunch ? '🍽️ Lunch Time!' : '🍎 Snack Time!';
  document.getElementById('schoolBreakChoices').innerHTML = choices.map((f,i) =>
    `<button onclick="schoolEatAndAdvance(${i}, ${isLunch})" style="display:block;width:100%;margin-bottom:8px;padding:12px;background:rgba(255,255,255,0.06);border:2px solid #446;border-radius:8px;color:#fff;font-size:13px;cursor:pointer;text-align:left;">${f.emoji} ${f.name}</button>`).join('');
}
function schoolEatAndAdvance(idx, isLunch) {
  const f = (isLunch ? SCHOOL_LUNCH_CHOICES : SCHOOL_SNACK_CHOICES)[idx];
  if (!f) return;
  eatFood(f.emoji, f.name, f.taste);
  document.getElementById('schoolBreakChoices').innerHTML = '<div style="color:#4CAF50;text-align:center;">Yum!</div>';
  setTimeout(advanceSchoolPeriod, 1600); // gives eatFood()'s own ~1.4s bite animation room to finish first
}

// P.E. reuses the Sports Park Gym's own real "mash a button for a real 5 real-time seconds" shape
// (gymPump()/finishGymChallenge(), above) — a separate copy with School's own state/DOM/reward
// scale rather than sharing gymPump() directly, same "each area gets its own copy of the mechanic"
// convention every other minigame in this file already follows.
let schoolPEActive = false, schoolPEClicks = 0;
function renderSchoolPEUI() {
  schoolPEActive = false; schoolPEClicks = 0;
  document.getElementById('schoolPEReps').textContent = 'Reps: 0';
  document.getElementById('schoolPEStatus').textContent = "Ms. Holt blows the whistle — click GO! to start, 5 real seconds!";
}
function schoolPEPump() {
  if (document.getElementById('classroomModal').style.display === 'none') return; // a stray click after closing
  if (!schoolPEActive) {
    schoolPEActive = true; schoolPEClicks = 0;
    document.getElementById('schoolPEStatus').textContent = 'GO GO GO!';
    setTimeout(() => { if (schoolPEActive) finishSchoolPE(); }, 5000);
  }
  if (!schoolPEActive) return; // window already closed via the timeout above
  schoolPEClicks++;
  document.getElementById('schoolPEReps').textContent = `Reps: ${schoolPEClicks}`;
}
function finishSchoolPE() {
  schoolPEActive = false;
  const reps = schoolPEClicks;
  let result, reward;
  if (reps >= 25)      { result = '🏃🔥 AMAZING!';   reward = SCHOOL_PE_SIP_MAX; }
  else if (reps >= 15) { result = '🏃 Great effort!'; reward = 18; }
  else if (reps >= 8)  { result = '🏃 Decent job.';   reward = 8; }
  else                  { result = '😅 Barely moved.'; reward = 0; }
  if (reward > 0) { queueEarning(reward, 0, '🏃 P.E.'); showNotif(`${result} ${reps} reps! +${reward} S.I.P. pending.`); sfx.buy(); }
  else { showNotif(`${result} ${reps} reps — no reward this time.`); sfx.nope(); }
  setTimeout(advanceSchoolPeriod, 1200);
}

function renderSchoolDismissalUI() {
  const st = schoolDayState;
  const box2 = document.getElementById('schoolDismissalBox');
  let examLine = '';
  if (st.isExamDay) {
    const passed = st.wrongTotal <= SCHOOL_EXAM_MAX_WRONG_ALLOWED;
    if (!passed) {
      sipDollars = Math.max(0, sipDollars - SCHOOL_EXAM_FAIL_PENALTY);
      updateSIP();
      examLine = `<div style="color:#ff6666;margin-bottom:8px;">📝 ${st.wrongTotal} wrong answers today — too many mistakes to pass the exam. -${SCHOOL_EXAM_FAIL_PENALTY} S.I.P.!</div>`;
    } else {
      examLine = `<div style="color:#4CAF50;margin-bottom:8px;">📝 You passed the exam with only ${st.wrongTotal} wrong answer${st.wrongTotal===1?'':'s'} all day! Great work.</div>`;
    }
  }
  assignSchoolHomework(st.bandId);
  box2.innerHTML = `
    ${examLine}
    <div style="margin-bottom:6px;">🎒 School's out! You got ${st.correctTotal} out of 10 real quiz questions right.</div>
    <div style="color:${st.sipEarned>0?'#4CAF50':'#aaa'};margin-bottom:10px;">${st.sipEarned>0 ? `Earned ${st.sipEarned} S.I.P. total today — pending in Earnings!` : 'No S.I.P. today — better luck next visit.'}</div>
    <div style="color:#FFD700;font-size:11px;">📝 Homework assigned: ${schoolHomework.subject}. Finish it before your next school day (📝 H.WORK tab, top of screen) or it'll cost you ${SCHOOL_HOMEWORK_MISS_PENALTY} S.I.P.!</div>
  `;
  schoolDayState = null; // day is fully resolved — reopening the modal now shows the picker (still cooldown-gated by schoolLastQuizAt, set back in startSchoolDay())
}

// ─── HOMEWORK — assigned at dismissal above, doable any time before the next school day from a
// real always-available HUD tab (only shown while genuinely pending) rather than requiring a trip
// back to School.
function assignSchoolHomework(bandId) {
  const subjects = ['Math','Reading','Science','Social','Art'];
  const subject = subjects[Math.floor(Math.random()*subjects.length)];
  schoolHomework = { subject, bandId };
  if (document.getElementById('homeworkTab')) document.getElementById('homeworkTab').style.display = 'block';
  saveCurrentUser();
}
let _schoolHomeworkQuestion = null;
function renderSchoolHomeworkUI() {
  const q = pickSchoolQuestion(schoolHomework.bandId, schoolHomework.subject, null);
  _schoolHomeworkQuestion = q;
  document.getElementById('homeworkSubject').textContent = `📝 ${schoolHomework.subject} Homework`;
  document.getElementById('homeworkQuestion').textContent = q.q;
  document.getElementById('homeworkChoices').innerHTML = q.c.map((c,i) =>
    `<button onclick="answerSchoolHomework(${i})" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:2px solid #446;border-radius:8px;color:#fff;font-size:12px;cursor:pointer;text-align:left;">${c}</button>`).join('');
  document.getElementById('homeworkFeedback').innerHTML = '';
}
function toggleSchoolHomeworkPanel() {
  const panel = document.getElementById('homeworkModal');
  if (panel.style.display === 'none' || !panel.style.display) {
    if (!schoolHomework) { showNotif('📝 No homework right now — nice!'); return; }
    if (document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    renderSchoolHomeworkUI();
    panel.style.display = 'flex';
  } else {
    closeSchoolHomeworkPanel();
  }
}
function closeSchoolHomeworkPanel() {
  document.getElementById('homeworkModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function answerSchoolHomework(choiceIdx) {
  const q = _schoolHomeworkQuestion;
  if (!q || !schoolHomework) return;
  if (choiceIdx === q.a) {
    queueEarning(SCHOOL_HOMEWORK_SIP_REWARD, 0, '📝 Homework');
    showNotif(`🎉 Homework done! +${SCHOOL_HOMEWORK_SIP_REWARD} S.I.P. pending.`);
    schoolHomework = null;
    document.getElementById('homeworkTab').style.display = 'none';
    saveCurrentUser();
    closeSchoolHomeworkPanel();
  } else {
    document.getElementById('homeworkFeedback').innerHTML = `<span style="color:#ff8888;">❌ Not quite — the answer was "${q.c[q.a]}". Try again!</span>`;
  }
}

// ─── SCIENCE LAB — a new civic building, coordinator's own ask: real "Science Tests" administered
// by real in-game Scientist characters, not just a menu screen. Real walk-up exterior + real
// collision live in buildCity() (game-buildings.js, right after the Library); 3 named ambient
// Scientist NPCs stand just outside it (buildLabNPCs(), game-world.js — same makeNPC()/patrol
// pattern the Space Station's astronauts already use). The door opens a real modal directly from
// the city (openScienceLab() below), same "Church"/"Library" pattern — NOT a walk-in pocket-space
// interior, since a Science Test doesn't need physical desks (Library's own reasoning, reused here).
// The actual Science Test mechanic below is a direct copy of the School's real Pop Quiz shape just
// above (openClassroom()/answerClassQuiz()/renderQuizResults()) — same session/cooldown/
// queueEarning() flow — just ONE flat SCIENCE-only question pool instead of 4 age-banded pools (a
// Science Test doesn't need an age picker the way homeschool-style trivia did).
const SCIENCE_LAB = { x:-70, z:36 }; // building center — real open lot checked against every addCol() in game-buildings.js: clear of the Police Station (ends z:22) to the south and the Library (starts z:50) to the north, same west side of downtown as both
const SCIENCE_QUIZ_LENGTH = 10;                  // questions per test — matches SCHOOL_QUIZ_LENGTH
const SCIENCE_SIP_PER_CORRECT = 15;              // matches SCHOOL_SIP_PER_CORRECT exactly — same established per-question economy, no new number invented
const SCIENCE_QUIZ_COOLDOWN_MS = 20 * 60 * 1000; // matches SCHOOL_QUIZ_COOLDOWN_MS exactly — a full 10/10 run pays at most 150 S.I.P., same cap logic as School
let scienceLastQuizAt = 0;   // persisted, Date.now() ms of the last test START — see SCIENCE_QUIZ_COOLDOWN_MS
let scienceTestState = null; // {questions:[SCIENCE_QUIZ_LENGTH picked from the pool], idx, answered, correctCount, sipEarned} — NOT persisted, fresh every visit, same as classroomState

// ─── SCIENCE QUESTION BANK — a real, hand-written bank of 80+ non-repeating, age-appropriate
// science questions (q/c[4 choices]/a[correct index 0-3]) spanning physics, chemistry, biology,
// astronomy, and earth science, difficulty-spread and deliberately picking DIFFERENT facts than the
// School's own science-flavored questions where School already covers a fact (e.g. School already
// asks the water formula, the closest/biggest/ringed planets, and "what is a cell" — this bank asks
// about other formulas, other planets, and other cell parts instead) so the two pools stay genuinely
// distinct rather than reskinning the same trivia.
const SCIENCE_QUESTIONS = [
  // Physics
  {q:"What do we call a push or pull on an object?", c:["Force","Speed","Mass","Energy"], a:0},
  {q:"What is the force that gives you weight and pulls objects back down to the ground?", c:["Magnetism","Friction","Gravity","Tension"], a:2},
  {q:"What is the SI (scientific) unit used to measure force?", c:["Joule","Newton","Watt","Pascal"], a:1},
  {q:"Which simple machine is basically a flat, sloped surface used to raise objects?", c:["Lever","Pulley","Inclined plane","Wedge"], a:2},
  {q:"Which travels faster through air: light or sound?", c:["Sound","Light","They travel at the same speed","Neither one moves"], a:1},
  {q:"What do we call a material that lets electricity flow through it easily, like copper wire?", c:["Insulator","Magnet","Conductor","Resistor"], a:2},
  {q:"What force acts between two touching surfaces to slow down or resist motion?", c:["Friction","Gravity","Magnetism","Buoyancy"], a:0},
  {q:"Which branch of science studies matter, energy, and how things move?", c:["Biology","Chemistry","Physics","Geology"], a:2},
  {q:"What happens to the pitch of a sound as its frequency gets higher?", c:["It gets lower","It gets higher","It disappears","It stays the same"], a:1},
  {q:"What do we call the type of energy stored in a stretched rubber band or compressed spring?", c:["Kinetic energy","Elastic potential energy","Thermal energy","Sound energy"], a:1},
  {q:"What is it called when light bends as it passes from air into water?", c:["Reflection","Absorption","Refraction","Diffusion"], a:2},
  {q:"What do we call the invisible area around a magnet where its pull or push can be felt?", c:["Force field","Magnetic field","Gravity well","Energy zone"], a:1},
  {q:"Which color of visible light has the longest wavelength?", c:["Violet","Blue","Green","Red"], a:3},
  {q:"What tool is used to measure temperature?", c:["Barometer","Thermometer","Speedometer","Compass"], a:1},
  {q:"Which simple machine uses a fixed point called a fulcrum to lift things?", c:["Wheel and axle","Lever","Screw","Pulley"], a:1},
  {q:"What do we call energy that is actually in motion, like a rolling ball?", c:["Potential energy","Kinetic energy","Nuclear energy","Chemical energy"], a:1},
  // Chemistry
  {q:"What are the tiny particles that all matter is made of called?", c:["Cells","Atoms","Molecules only","Photons"], a:1},
  {q:"What do we call a pure substance made of two or more elements chemically bonded together?", c:["Mixture","Solution","Compound","Alloy"], a:2},
  {q:"What is the chemical symbol for gold?", c:["Gd","Go","Au","Ag"], a:2},
  {q:"What is the chemical symbol for sodium?", c:["So","Sd","S","Na"], a:3},
  {q:"Which state of matter has both a definite shape and a definite volume?", c:["Gas","Liquid","Solid","Plasma"], a:2},
  {q:"Which state of matter takes the shape of its container but keeps the same volume?", c:["Solid","Liquid","Gas","Plasma"], a:1},
  {q:"What is it called when a liquid turns into a gas?", c:["Condensation","Freezing","Evaporation","Melting"], a:2},
  {q:"What is it called when a solid changes directly into a gas without ever becoming a liquid?", c:["Condensation","Sublimation","Evaporation","Precipitation"], a:1},
  {q:"What is the chemical formula for ordinary table salt?", c:["NaCl","CO2","KCl","CaCO3"], a:0},
  {q:"What is the chemical formula for carbon dioxide, the gas we breathe out?", c:["O2","CO2","CO","H2O"], a:1},
  {q:"What gas makes up about 78% of the air in Earth's atmosphere?", c:["Oxygen","Carbon dioxide","Nitrogen","Hydrogen"], a:2},
  {q:"Which particle inside an atom carries a negative electric charge?", c:["Proton","Neutron","Electron","Nucleus"], a:2},
  {q:"Which particle inside an atom carries a positive electric charge?", c:["Electron","Proton","Neutron","Ion"], a:1},
  {q:"Which particle inside an atom has no electric charge at all?", c:["Proton","Electron","Neutron","Photon"], a:2},
  {q:"What do we call a mixture, like salt stirred into water, where the parts are evenly spread out and can't be seen separately?", c:["Suspension","Solution","Compound","Colloid"], a:1},
  {q:"On the pH scale, what number is considered exactly neutral (neither acidic nor basic)?", c:["0","7","10","14"], a:1},
  {q:"What is the name of the chart scientists use to organize all the known chemical elements?", c:["Element wheel","Molecule map","Periodic table","Atom grid"], a:2},
  // Biology
  {q:"What part of a cell is often called its 'powerhouse' because it produces energy?", c:["Nucleus","Mitochondria","Cell wall","Ribosome"], a:1},
  {q:"What is the green pigment in plants called that captures sunlight for making food?", c:["Carotene","Chlorophyll","Melanin","Xylem"], a:1},
  {q:"What do we call an animal that eats only plants?", c:["Carnivore","Omnivore","Herbivore","Decomposer"], a:2},
  {q:"What do we call an animal that eats only meat?", c:["Herbivore","Carnivore","Omnivore","Producer"], a:1},
  {q:"What do we call an animal that eats both plants and meat?", c:["Herbivore","Carnivore","Omnivore","Scavenger"], a:2},
  {q:"Which organ pumps blood through the human body?", c:["Lungs","Liver","Heart","Kidney"], a:2},
  {q:"Which pair of organs mainly filters waste out of the blood in humans?", c:["Lungs","Kidneys","Stomach","Liver"], a:1},
  {q:"Which organs do humans use to breathe?", c:["Lungs","Heart","Kidneys","Stomach"], a:0},
  {q:"How many chambers does a healthy human heart have?", c:["2","3","4","5"], a:2},
  {q:"What is the largest organ of the human body?", c:["The liver","The brain","The skin","The heart"], a:2},
  {q:"Which type of blood cell mainly helps the body fight off infections?", c:["Red blood cells","White blood cells","Platelets","Plasma cells"], a:1},
  {q:"What is the passing of traits from parents to their children called?", c:["Metamorphosis","Photosynthesis","Heredity","Pollination"], a:2},
  {q:"What molecule carries the genetic instructions in nearly every living thing?", c:["ATP","DNA","RNA only","Protein"], a:1},
  {q:"What do we call animals that have a backbone, like fish, birds, and mammals?", c:["Invertebrates","Vertebrates","Amphibians only","Arachnids"], a:1},
  {q:"What do we call animals that do NOT have a backbone, like insects and worms?", c:["Vertebrates","Invertebrates","Mammals","Reptiles"], a:1},
  {q:"What is the process called in which a caterpillar transforms into a butterfly?", c:["Pollination","Germination","Metamorphosis","Hibernation"], a:2},
  {q:"What do bees do when they move pollen from flower to flower, helping plants reproduce?", c:["Photosynthesis","Pollination","Respiration","Migration"], a:1},
  {q:"What term describes all the members of one species living together in the same area?", c:["Ecosystem","Habitat","Population","Community"], a:2},
  {q:"What do we call the natural place where an animal or plant normally lives?", c:["Habitat","Territory","Colony","Biome only"], a:0},
  {q:"Which part of the eye is a light-sensitive layer that helps you see images?", c:["Cornea","Retina","Pupil","Iris"], a:1},
  // Astronomy
  {q:"What is the name of the galaxy that contains our solar system?", c:["Andromeda","Milky Way","Whirlpool Galaxy","Triangulum"], a:1},
  {q:"What do we call a huge collection of billions of stars, dust, and gas held together by gravity?", c:["A nebula","A galaxy","A comet","An asteroid belt"], a:1},
  {q:"What causes the Moon to appear to change shape in the sky over the course of a month?", c:["The Moon spinning very fast","Clouds covering the Moon","Different parts of the sunlit Moon facing Earth","The Moon changing size"], a:2},
  {q:"What do we call a giant ball of hot, glowing gas held together by its own gravity, like our Sun?", c:["A planet","A star","A moon","An asteroid"], a:1},
  {q:"About how long does it take Earth to complete one full orbit around the Sun?", c:["One day","One month","One year","Ten years"], a:2},
  {q:"About how long does it take Earth to spin once all the way around on its axis?", c:["One hour","One day","One week","One year"], a:1},
  {q:"What do we call a small piece of rock or dust that burns up in Earth's atmosphere, creating a 'shooting star'?", c:["A comet","A meteor","An asteroid","A satellite"], a:1},
  {q:"What do we call a large chunk of rock that orbits the Sun, with many found in a belt between Mars and Jupiter?", c:["A comet","A meteorite","An asteroid","A moon"], a:2},
  {q:"What do we call a ball of ice, dust, and rock that grows a glowing tail as it gets close to the Sun?", c:["An asteroid","A comet","A meteor","A satellite"], a:1},
  {q:"What was the name of the first artificial satellite ever launched into orbit around Earth?", c:["Apollo 11","Sputnik","Voyager 1","Hubble"], a:1},
  {q:"Who was the first human being to walk on the surface of the Moon?", c:["Buzz Aldrin","Yuri Gagarin","Neil Armstrong","John Glenn"], a:2},
  {q:"What do we call the layer of gases that surrounds a planet?", c:["Crust","Atmosphere","Magnetosphere","Exosphere"], a:1},
  {q:"Which planet is unusual because it spins almost completely on its side?", c:["Venus","Uranus","Neptune","Mercury"], a:1},
  {q:"Which planet is often called Earth's 'twin' because it is close to Earth in size?", c:["Mars","Mercury","Venus","Jupiter"], a:2},
  {q:"What do we call it when the Moon passes directly between the Sun and Earth, blocking out sunlight?", c:["A lunar eclipse","A solar eclipse","A supermoon","A meteor shower"], a:1},
  {q:"What force keeps the planets moving in orbit around the Sun instead of flying off into space?", c:["Magnetism","Gravity","Friction","Air pressure"], a:1},
  // Earth Science
  {q:"What is the thin, outermost solid layer of the Earth called?", c:["Core","Mantle","Crust","Atmosphere"], a:2},
  {q:"What do we call the hot, liquid rock found beneath Earth's crust?", c:["Lava","Magma","Ash","Sediment"], a:1},
  {q:"What do we call melted rock once it has erupted onto Earth's surface from a volcano?", c:["Magma","Lava","Obsidian","Slag"], a:1},
  {q:"What is the continuous natural movement of water between the ocean, the sky, and the land called?", c:["The rock cycle","The carbon cycle","The water cycle","The food chain"], a:2},
  {q:"What is it called when water vapor in the air cools down and turns back into tiny liquid droplets, forming clouds?", c:["Evaporation","Condensation","Precipitation","Sublimation"], a:1},
  {q:"What are the three main categories that all rocks are classified into?", c:["Hard, soft, and crumbly","Igneous, sedimentary, and metamorphic","Light, medium, and heavy","Old, new, and ancient"], a:1},
  {q:"What type of rock forms when melted magma or lava cools and hardens?", c:["Sedimentary rock","Metamorphic rock","Igneous rock","Fossil rock"], a:2},
  {q:"What type of rock forms when layers of sand, mud, and other sediment get pressed and cemented together over time?", c:["Igneous rock","Sedimentary rock","Metamorphic rock","Volcanic rock"], a:1},
  {q:"What instrument do scientists use to measure and record the strength of an earthquake?", c:["Barometer","Anemometer","Seismograph","Thermometer"], a:2},
  {q:"What do we call a huge, destructive ocean wave often triggered by an underwater earthquake?", c:["A hurricane","A tsunami","A whirlpool","A riptide"], a:1},
  {q:"What is the name of the layer of the atmosphere closest to Earth's surface, where nearly all weather happens?", c:["Stratosphere","Troposphere","Mesosphere","Exosphere"], a:1},
  {q:"What is the name of the imaginary line circling the middle of the Earth, exactly halfway between the North and South Poles?", c:["Prime Meridian","Equator","Tropic line","Horizon"], a:1},
  {q:"Which type of rock is most likely to contain preserved fossils of ancient plants and animals?", c:["Igneous rock","Metamorphic rock","Sedimentary rock","Volcanic glass"], a:2},
];
function pickRandomScienceQuestions(n) {
  const pool = SCIENCE_QUESTIONS.slice();
  for (let i = pool.length - 1; i > 0; i--) { // real Fisher-Yates shuffle, same as pickRandomQuestions() above
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(n, pool.length));
}
function openScienceLab() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('scienceLabModal').style.display = 'flex';
  if (scienceTestState && scienceTestState.idx < scienceTestState.questions.length) {
    // Resume an in-progress test (player closed the modal mid-test and walked back to the door) —
    // same "real state, don't silently discard it" treatment openClassroom() gives classroomState.
    document.getElementById('scienceLabPickerView').style.display = 'none';
    document.getElementById('scienceLabQuizView').style.display = 'block';
    renderScienceQuestion();
  } else {
    scienceTestState = null;
    document.getElementById('scienceLabPickerView').style.display = 'block';
    document.getElementById('scienceLabQuizView').style.display = 'none';
    refreshScienceLabPickerUI();
  }
}
// Opens directly from a city door zone with nothing else open underneath it — same as openLibrary()
// (see that function's own comment for why it's always safe to re-request pointer lock on close).
function closeScienceLab() {
  document.getElementById('scienceLabModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function refreshScienceLabPickerUI() {
  const box2 = document.getElementById('scienceLabPickerBox');
  const remainMs = SCIENCE_QUIZ_COOLDOWN_MS - (Date.now() - scienceLastQuizAt);
  if (remainMs > 0) {
    const mins = Math.ceil(remainMs/60000);
    box2.innerHTML = `<div style="color:#aaa;">🧪 The lab just ran a test with you. Come back in ${mins} minute${mins===1?'':'s'}.</div>`;
    return;
  }
  box2.innerHTML = `
    <div style="margin-bottom:10px;">Dr. Greenwood hands you a clipboard: "Ready for a real Science Test? ${SCIENCE_QUIZ_LENGTH} questions — physics, chemistry, biology, space, and earth science."</div>
    <button class="shopBtn" style="width:100%;" onclick="startScienceTest()">🧪 Start Science Test (${SCIENCE_QUIZ_LENGTH} questions)</button>`;
}
function startScienceTest() {
  const remainMs = SCIENCE_QUIZ_COOLDOWN_MS - (Date.now() - scienceLastQuizAt);
  if (remainMs > 0) { refreshScienceLabPickerUI(); return; } // real race guard, same shape as startClassSession()'s own re-check
  scienceLastQuizAt = Date.now();
  scienceTestState = { questions: pickRandomScienceQuestions(SCIENCE_QUIZ_LENGTH), idx:0, answered:false, correctCount:0, sipEarned:0 };
  saveCurrentUser();
  document.getElementById('scienceLabPickerView').style.display = 'none';
  document.getElementById('scienceLabQuizView').style.display = 'block';
  renderScienceQuestion();
}
function renderScienceQuestion() {
  const st = scienceTestState;
  if (!st) return;
  if (st.idx >= st.questions.length) { renderScienceResults(); return; }
  const q = st.questions[st.idx];
  document.getElementById('scienceLabProgress').textContent = `QUESTION ${st.idx+1} OF ${st.questions.length} — ${st.correctCount} CORRECT SO FAR`;
  document.getElementById('scienceLabQuestion').textContent = q.q;
  const choicesEl = document.getElementById('scienceLabChoices');
  choicesEl.innerHTML = q.c.map((c,i) => `<button onclick="answerScienceTest(${i})" style="width:100%;padding:10px;background:rgba(255,255,255,0.06);border:2px solid #2a6653;border-radius:8px;color:#fff;font-size:12px;cursor:pointer;text-align:left;">${c}</button>`).join('');
  document.getElementById('scienceLabFeedback').innerHTML = '';
  document.getElementById('scienceLabNextBtn').style.display = 'none';
}
function answerScienceTest(choiceIdx) {
  const st = scienceTestState;
  if (!st || st.answered) return; // guard double-clicks / stray repeats
  const q = st.questions[st.idx];
  st.answered = true;
  Array.from(document.getElementById('scienceLabChoices').children).forEach((btn,i) => {
    btn.style.pointerEvents = 'none';
    if (i === q.a) btn.style.borderColor = '#4CAF50';
    else if (i === choiceIdx) btn.style.borderColor = '#ff5555';
  });
  const feedback = document.getElementById('scienceLabFeedback');
  if (choiceIdx === q.a) {
    st.correctCount++;
    st.sipEarned += SCIENCE_SIP_PER_CORRECT;
    queueEarning(SCIENCE_SIP_PER_CORRECT, 0, '🧪 Science Test');
    feedback.innerHTML = `<span style="color:#4CAF50;">✅ Correct! +${SCIENCE_SIP_PER_CORRECT} S.I.P. pending in Earnings.</span>`;
    sfx.cheer ? sfx.cheer() : sfx.buy();
  } else {
    feedback.innerHTML = `<span style="color:#ff8888;">❌ Not quite — the answer was "${q.c[q.a]}".</span>`;
    sfx.nope();
  }
  document.getElementById('scienceLabNextBtn').style.display = 'block';
}
function advanceScienceTest() {
  const st = scienceTestState;
  if (!st) return;
  st.idx++;
  st.answered = false;
  renderScienceQuestion();
}
function renderScienceResults() {
  const st = scienceTestState;
  document.getElementById('scienceLabProgress').textContent = 'TEST COMPLETE';
  document.getElementById('scienceLabQuestion').textContent = `You got ${st.correctCount} out of ${st.questions.length} right!`;
  document.getElementById('scienceLabChoices').innerHTML = '';
  document.getElementById('scienceLabFeedback').innerHTML = st.sipEarned > 0
    ? `<span style="color:#4CAF50;">🎉 Earned ${st.sipEarned} S.I.P. total this visit — pending in your Earnings tab!</span>`
    : `<span style="color:#aaa;">No S.I.P. this time — come back after the cooldown for another shot.</span>`;
  document.getElementById('scienceLabNextBtn').style.display = 'none';
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

