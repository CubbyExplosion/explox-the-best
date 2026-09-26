// ─── WALKABLE SHOP INTERIORS ───────────────────────────────────────────────────
// User's own ask: every shop that used to open a flat 2D list overlay (#shopOverlay /
// #cityShopModal) when you walked up and pressed E should instead teleport you into a REAL
// walkable 3D interior — furniture placed around a room, walk up to an item, press E to
// buy/craft it, walk to the door to leave — and the interior has to visibly look different
// depending on what the shop sells (an armory vs a bakery vs a jewelry store), not one
// identical room reused everywhere.
//
// Same "one shared pocket interior, rebuilt/reskinned on entry" pattern City Mall already uses
// for its 3 real doors (enterMall(returnX,returnZ) / EXTRA_MALLS, game-housing.js) — rather than
// hand-building ~700 unique rooms (300 CITY_SHOPS+MALL_SHOPS, 40-80 OUTFIT_SHOPS, the Weapon
// Shop, the Armor Shop, the original Outfit Shop), ONE physical room shell is built once at its
// own pocket-dimension lane (SHOP_INTERIOR below, the next free 10,000-unit lane after
// VisitStore's 180000 — see HOUSE_SPAWN/MALL_SPAWN/etc.'s own comments, game-engine.js) and its
// walls/floor/light are just re-tinted plus its furniture/items rebuilt every time a DIFFERENT
// shop is entered. Since only the currently-entered shop's decor ever exists at once, this scales
// fine to the 5,000+ real WEAPONS entries without ever building more than ~30 meshes at a time.
//
// The "look different per what it sells" requirement is solved the same way this codebase already
// scales any other big catalog (robot shapes, boss silhouettes, the 65-weapon-archetype shop
// itself): a small set of reusable FURNITURE ARCHETYPES (shelf, display case, clothing rack,
// weapon rack, armor stand) driven by a CATEGORY -> LOOK config table (SHOP_LOOK_KITS/
// CATEGORY_LOOK/CATEGORY_ACCENT below) — not dozens of hand-built bespoke rooms.
//
// Every real purchase/craft/equip function this taps (buyItem/craftMallItem/buyWeapon/
// craftWeaponHard/buyArmor/craftArmorHard/buyOutfit/craftOutfit/buyBoutiqueOutfit/
// craftBoutiqueOutfit/buyBodyPaint, all game-shops.js/game-district.js) is called EXACTLY as the
// old modal buttons already called it — nothing about the economy/inventory/equip logic changes,
// only the interaction (walk up + E) and the visual context (a themed room instead of a flat list).

let inShopInterior = false;
let currentShopInterior = null; // { kind, refId, returnX, returnZ } — set by enterShopInterior()

// Own 10,000-unit lane, the next free one after VisitStore(180000) — see every other pocket
// interior's own "own lane" comment (game-engine.js/game-land.js/game-vehicles.js) for the scheme.
const SHOP_INTERIOR = { x: 190000, z: 0 };
const SHOP_INTERIOR_HALF_W = 16, SHOP_INTERIOR_HALF_D = 16;
// Sized for the Armory's ~28 racks (20 weapon price-tier racks + 8 armor tier racks) — the
// biggest real case — so every smaller shop (a 5-outfit boutique, a 10-item mall shop) just gets
// a roomier, more spacious version of the same real walkable room instead of needing its own
// differently-sized shell (which would also need its own SHOP_INTERIOR_COLS).
const SHOP_INTERIOR_SPAWN = { x: SHOP_INTERIOR.x, z: SHOP_INTERIOR.z + SHOP_INTERIOR_HALF_D - 2 };
const SHOP_INTERIOR_EXIT  = { x: SHOP_INTERIOR.x, z: SHOP_INTERIOR.z + SHOP_INTERIOR_HALF_D + 1 };
const SHOP_INTERIOR_COLS = [];
let shopInteriorWalls = [], shopInteriorFloor = null, shopInteriorCeiling = null, shopInteriorLight = null;
let shopInteriorDecorMeshes = []; // every mesh/group built for the CURRENTLY entered shop's furniture/items — wiped and rebuilt on every entry
let SHOP_INTERIOR_ZONES = []; // rebuilt fresh per entry, same flat {x,z,r,label,action} shape every other _ZONES array uses (game-zones.js)

// Builds the static shell ONCE at game start (see the _dbg('buildShopInteriorShell', ...) call,
// game-zones.js) — floor/ceiling/4 walls with a real door gap in the south wall, matching the
// exact two-collider-segments-either-side-of-a-gap pattern every other pocket interior with a
// walkable doorway uses.
function buildShopInteriorShell() {
  const cx = SHOP_INTERIOR.x, cz = SHOP_INTERIOR.z;
  const hw = SHOP_INTERIOR_HALF_W, hd = SHOP_INTERIOR_HALF_D;
  const doorHalf = 2.2;
  shopInteriorFloor = box(hw * 2, 0.15, hd * 2, 0xdec9a3, cx, 0, cz);
  shopInteriorCeiling = box(hw * 2, 0.4, hd * 2, 0xeeeeee, cx, 8, cz);
  // North wall (back, solid)
  shopInteriorWalls.push(box(hw * 2, 8, 0.4, 0x6b4a2f, cx, 4, cz - hd));
  addCol(SHOP_INTERIOR_COLS, cx, cz - hd, hw, 0.5);
  // West / East walls (solid)
  shopInteriorWalls.push(box(0.4, 8, hd * 2, 0x6b4a2f, cx - hw, 4, cz));
  shopInteriorWalls.push(box(0.4, 8, hd * 2, 0x6b4a2f, cx + hw, 4, cz));
  addCol(SHOP_INTERIOR_COLS, cx - hw, cz, 0.5, hd);
  addCol(SHOP_INTERIOR_COLS, cx + hw, cz, 0.5, hd);
  // South wall (door side) — 2 segments flanking a real walkable gap
  const segLen = hw - doorHalf, segOffset = (hw + doorHalf) / 2;
  shopInteriorWalls.push(box(segLen, 8, 0.4, 0x6b4a2f, cx - segOffset, 4, cz + hd));
  shopInteriorWalls.push(box(segLen, 8, 0.4, 0x6b4a2f, cx + segOffset, 4, cz + hd));
  addCol(SHOP_INTERIOR_COLS, cx - segOffset, cz + hd, segLen / 2, 0.5);
  addCol(SHOP_INTERIOR_COLS, cx + segOffset, cz + hd, segLen / 2, 0.5);
  buildSign('🚪 EXIT', cx, 7.4, cz + hd - 0.35);
  shopInteriorLight = new THREE.PointLight(0xffffff, 0.6, 44);
  shopInteriorLight.position.set(cx, 7, cz);
  scene.add(shopInteriorLight);
}

// Re-tints the shared static shell for whichever shop is currently entered — this (plus the
// furniture archetype + item colors) is what actually makes an Armory look like an Armory and a
// Bakery look like a Bakery, without rebuilding any wall/floor/collider geometry.
function repaintShopInteriorShell(wallColor, floorColor, lightColor) {
  shopInteriorWalls.forEach(w => w.material.color.setHex(wallColor));
  if (shopInteriorFloor) shopInteriorFloor.material.color.setHex(floorColor);
  if (shopInteriorLight) shopInteriorLight.color.setHex(lightColor);
}

function shopDecor(meshOrGroup) { shopInteriorDecorMeshes.push(meshOrGroup); return meshOrGroup; }

// ─── FURNITURE ARCHETYPES — the small reusable kit every category's look is built from ────────
// Each returns { group, itemLocal } — `group` is the THREE.Group already added to the scene
// (world-positioned/rotated), `itemLocal` is where the caller should position the actual item
// prop (weapon mesh / armor mesh / mannequin / emoji-box) as a CHILD of that group, so it inherits
// the furniture's own position/rotation for free.
function buildShelfUnit(x, z, ry, wallColor, accent) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  scene.add(g); shopDecor(g);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.3, 0.1), new THREE.MeshLambertMaterial({ color: wallColor }));
  back.position.set(0, 1.3, -0.4); g.add(back);
  const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.07, 0.6), new THREE.MeshLambertMaterial({ color: accent }));
  shelf1.position.set(0, 1.25, -0.15); g.add(shelf1);
  const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.07, 0.6), new THREE.MeshLambertMaterial({ color: accent }));
  shelf2.position.set(0, 1.9, -0.15); g.add(shelf2);
  return { group: g, itemLocal: { x: 0, y: 1.5, z: -0.15 } };
}
function buildDisplayCase(x, z, ry, wallColor, accent) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  scene.add(g); shopDecor(g);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.7), new THREE.MeshLambertMaterial({ color: accent }));
  base.position.set(0, 0.45, 0); g.add(base);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 0.6), new THREE.MeshPhongMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.35, shininess: 90 }));
  glass.position.set(0, 1.075, 0); g.add(glass);
  return { group: g, itemLocal: { x: 0, y: 1.05, z: 0 } };
}
function buildClothingRackFurniture(x, z, ry, wallColor, accent) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  scene.add(g); shopDecor(g);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.06, 12), new THREE.MeshLambertMaterial({ color: accent }));
  base.position.set(0, 0.03, 0); g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 8), new THREE.MeshLambertMaterial({ color: 0x555555 }));
  pole.position.set(0, 0.88, 0); g.add(pole);
  return { group: g, itemLocal: { x: 0, y: 0.06, z: 0 } };
}
function buildWeaponRackFurniture(x, z, ry, wallColor, accent) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  scene.add(g); shopDecor(g);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 0.15), new THREE.MeshLambertMaterial({ color: 0x2a2a2a }));
  back.position.set(0, 1.1, -0.3); g.add(back);
  [0.7, 1.5].forEach(y => {
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.2), new THREE.MeshLambertMaterial({ color: accent }));
    bracket.position.set(0, y, -0.15); g.add(bracket);
  });
  return { group: g, itemLocal: { x: 0, y: 1.1, z: -0.1 } };
}
function buildArmorStandFurniture(x, z, ry, wallColor, accent) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  scene.add(g); shopDecor(g);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.08, 10), new THREE.MeshLambertMaterial({ color: accent }));
  base.position.set(0, 0.04, 0); g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 8), new THREE.MeshLambertMaterial({ color: 0x444444 }));
  pole.position.set(0, 0.7, 0); g.add(pole);
  return { group: g, itemLocal: { x: 0, y: 1.4, z: 0 } };
}
function buildFurnitureByKind(kind, x, z, ry, wallColor, accent) {
  switch (kind) {
    case 'case':       return buildDisplayCase(x, z, ry, wallColor, accent);
    case 'rack':       return buildClothingRackFurniture(x, z, ry, wallColor, accent);
    case 'weaponrack': return buildWeaponRackFurniture(x, z, ry, wallColor, accent);
    case 'armorstand': return buildArmorStandFurniture(x, z, ry, wallColor, accent);
    default:           return buildShelfUnit(x, z, ry, wallColor, accent);
  }
}
// A simple low-poly mannequin (cylinder torso + box legs/shoes + sphere head), recolored per real
// outfit — the SAME shirt/pants/shoes colors that outfit actually grants, so what you see on the
// mannequin is exactly what you'd be wearing after buying it.
function buildOutfitMannequinProp(shirt, pants, shoes) {
  const g = new THREE.Group();
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.7, 0.2), new THREE.MeshLambertMaterial({ color: pants }));
  legs.position.set(0, 0.35, 0); g.add(legs);
  const shoesM = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.26), new THREE.MeshLambertMaterial({ color: shoes }));
  shoesM.position.set(0, 0.06, 0.02); g.add(shoesM);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.6, 10), new THREE.MeshLambertMaterial({ color: shirt }));
  torso.position.set(0, 1.0, 0); g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), new THREE.MeshLambertMaterial({ color: 0xf5c89a }));
  head.position.set(0, 1.42, 0); g.add(head);
  return g;
}
// A small colored base + the item's own real emoji floating above it (buildThrownItemSprite,
// game-land.js — the same canvas-emoji-sprite technique this session's throw-any-item feature
// already uses), for the ~300 CITY_SHOPS/MALL_SHOPS items that don't have a dedicated 3D model.
function itemEmojiFor(name) {
  const special = ITEM_INFO[name];
  return (special && special.emoji) || SHOP_ITEM_EMOJI[name] || '📦';
}
function buildMallItemPropVisual(item, accentColor) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshLambertMaterial({ color: accentColor }));
  g.add(base);
  const spr = buildThrownItemSprite(itemEmojiFor(item.name));
  spr.scale.setScalar(1.0);
  spr.position.set(0, 0.55, 0);
  g.add(spr);
  return g;
}
function buildRegisterCounterDecor() {
  const cx = SHOP_INTERIOR.x, cz = SHOP_INTERIOR.z;
  shopDecor(box(2.2, 0.9, 0.7, 0x5a4a3a, cx, 0.45, cz + SHOP_INTERIOR_HALF_D - 3));
  shopDecor(box(2.3, 0.08, 0.8, 0x3a2a1a, cx, 0.94, cz + SHOP_INTERIOR_HALF_D - 3));
}

// Distributes `n` display slots along the back wall + both side walls (never the door/south
// wall), proportional to each wall's real usable length — a plain, reusable formula rather than a
// hand-placed layout per shop, so it works unchanged whether n is 5 (a boutique) or 28 (the Armory).
function layoutSlotsAroundRoom(n, cx, cz, halfW, halfD) {
  const slots = [];
  if (n <= 0) return slots;
  const backLen = halfW * 2 - 4;
  const sideLen = halfD * 2 - 7; // leaves clearance near the door corner and the back corner
  const totalLen = backLen + 2 * sideLen;
  let nBack = Math.max(1, Math.min(n, Math.round(n * backLen / totalLen)));
  let remaining = n - nBack;
  let nLeft = Math.ceil(remaining / 2), nRight = remaining - nLeft;
  for (let i = 0; i < nBack; i++) {
    const t = (i + 1) / (nBack + 1);
    slots.push({ x: cx - halfW + 2 + t * backLen, z: cz - halfD + 0.7, ry: 0 });
  }
  for (let i = 0; i < nLeft; i++) {
    const t = (i + 1) / (nLeft + 1);
    slots.push({ x: cx - halfW + 0.7, z: cz - halfD + 3 + t * sideLen, ry: Math.PI / 2 });
  }
  for (let i = 0; i < nRight; i++) {
    const t = (i + 1) / (nRight + 1);
    slots.push({ x: cx + halfW - 0.7, z: cz - halfD + 3 + t * sideLen, ry: -Math.PI / 2 });
  }
  return slots.slice(0, n);
}

// ─── CATEGORY -> LOOK CONFIG ────────────────────────────────────────────────────────────────────
// A small set of reusable "looks" (wall/floor/ceiling tint, furniture archetype, light tint), not
// 25+ bespoke room designs — grouped exactly the way the task's own suggestion did (Book/Comic/
// Stationery share a shelf-lined reading room, Candy/Bakery/Jewelry share a display-case look,
// etc.), with every category still keeping its OWN accent color (CATEGORY_ACCENT) so shops in the
// same look group are still visibly distinct from each other, not identical palette-swaps.
const SHOP_LOOK_KITS = {
  reading:  { wallBase: 0x6b4a2f, floor: 0xdec9a3, furniture: 'shelf',       light: 0xfff0d0 },
  display:  { wallBase: 0xf7d7e0, floor: 0xf7f0e0, furniture: 'case',        light: 0xfff5f8 },
  tech:     { wallBase: 0x1a1f2e, floor: 0x11141c, furniture: 'shelf',       light: 0x66d9ff },
  sport:    { wallBase: 0x1f5f8a, floor: 0xcfd6da, furniture: 'rack',        light: 0xffffff },
  boutique: { wallBase: 0xf4e0ea, floor: 0xf8f0f4, furniture: 'rack',        light: 0xfff0f5 },
  toy:      { wallBase: 0xff9f61, floor: 0xfff4cc, furniture: 'shelf',       light: 0xffffff },
  nature:   { wallBase: 0x2f6b3a, floor: 0xc9b28a, furniture: 'case',        light: 0xd8ffd8 },
  home:     { wallBase: 0x8a6a4a, floor: 0xe0d0b8, furniture: 'case',        light: 0xffe8c0 },
  music:    { wallBase: 0x5a1f2a, floor: 0x2a1a1a, furniture: 'shelf',       light: 0xffd0d0 },
  // Jewelry Store gets its own dark, elegant "luxury" look instead of sharing Candy/Bakery's
  // cheerful pastel "display" look — same display-case furniture archetype (a real jewelry store
  // and a bakery both plausibly use glass cases), but different enough at a glance (near-black
  // walls + warm gold light vs pale pink walls) to satisfy the actual point of this feature: an
  // interior should read as what it sells, not as a palette-swapped copy of an unrelated shop.
  luxury:   { wallBase: 0x1a1a2e, floor: 0x2a2a3a, furniture: 'case',        light: 0xffd9a0 },
};
const CATEGORY_LOOK = {
  book_store: 'reading', comic_book_shop: 'reading', stationery_shop: 'reading',
  card_gift_shop: 'reading', craft_store: 'reading', art_supplies_store: 'reading', hobby_shop: 'reading',
  candy_shop: 'display', bakery: 'display', jewelry_store: 'luxury',
  electronics_store: 'tech', video_game_store: 'tech', phone_accessories_store: 'tech',
  sports_store: 'sport', skate_shop: 'sport', bike_shop: 'sport',
  fashion_boutique: 'boutique', shoe_store: 'boutique',
  toy_store: 'toy', party_supplies_store: 'toy',
  plant_shop: 'nature', aquarium_fish_store: 'nature', pet_shop: 'nature',
  furniture_store: 'home',
  music_store: 'music',
};
const CATEGORY_ACCENT = {
  book_store: 0x3a6ea5, comic_book_shop: 0xd94f2b, stationery_shop: 0x7a4fd9, card_gift_shop: 0xd94f8f,
  craft_store: 0x2fa86b, art_supplies_store: 0xe0a52f, hobby_shop: 0x2fa8a0,
  candy_shop: 0xff6fa5, bakery: 0xd98a3a, jewelry_store: 0xb08a2f,
  electronics_store: 0x2fd9d0, video_game_store: 0x9a4fd9, phone_accessories_store: 0x2f8ad9,
  sports_store: 0xe0522f, skate_shop: 0x3a3ae0, bike_shop: 0x2fa83a,
  fashion_boutique: 0xd92fa0, shoe_store: 0x2f5fd9,
  toy_store: 0x2f8ad9, party_supplies_store: 0xd92fd0,
  plant_shop: 0x3a8a2f, aquarium_fish_store: 0x2f8ad9, pet_shop: 0xd9a52f,
  furniture_store: 0x8a5a2f,
  music_store: 0xd92f5a,
};

// Same 8-theme palette buildOutfitShopWing() (game-shops.js) already paints every Fashion Wing
// storefront with — reused here so a boutique's INTERIOR wall color matches its own real
// storefront color instead of introducing a second, disconnected theme system.
const OUTFIT_BOUTIQUE_THEMES = [
  { wall: 0xF4C2C2, accent: 0xE08A8A }, { wall: 0xC2D4F4, accent: 0x7A9EDD },
  { wall: 0xD8C2F4, accent: 0xA47ADD }, { wall: 0xC2F4D8, accent: 0x6ADD9E },
  { wall: 0xF4E2C2, accent: 0xDDB56A }, { wall: 0xC2F4F0, accent: 0x6ADDD5 },
  { wall: 0xF4C2E2, accent: 0xDD6ABA }, { wall: 0xE0E0E0, accent: 0xA0A0A0 },
];

// ─── ENTER / EXIT ────────────────────────────────────────────────────────────────────────────
// Same shape as enterMall(returnX,returnZ)/exitMall() (game-housing.js) — remembers exactly which
// real outdoor/mall spot to return the player to, teleports into the shared pocket interior, and
// rebuilds that one shop's own furniture/items fresh.
function enterShopInterior(kind, refId) {
  currentShopInterior = { kind, refId, returnX: playerGroup.position.x, returnZ: playerGroup.position.z };
  inShopInterior = true;
  playerGroup.position.set(SHOP_INTERIOR_SPAWN.x, 0, SHOP_INTERIOR_SPAWN.z);
  yaw = Math.PI;
  populateShopInterior(kind, refId);
}
function exitShopInterior() {
  if (!inShopInterior) return;
  const ret = currentShopInterior;
  inShopInterior = false;
  currentShopInterior = null;
  if (ret) playerGroup.position.set(ret.returnX, 0, ret.returnZ);
  yaw = 0;
  showNotif('🚪 Leaving the shop...');
}

function populateShopInterior(kind, refId) {
  shopInteriorDecorMeshes.forEach(m => scene.remove(m));
  shopInteriorDecorMeshes = [];
  SHOP_INTERIOR_ZONES = [
    { x: SHOP_INTERIOR_EXIT.x, z: SHOP_INTERIOR_EXIT.z, r: 3, label: '🚪 Exit Shop', action: () => exitShopInterior() },
  ];
  let title = '🏪 Shop';
  if (kind === 'mall') {
    const shop = CITY_SHOPS.find(s => s.id === refId) || MALL_SHOPS.find(s => s.id === refId);
    if (shop) { title = `${shop.emoji} ${shop.name}`; populateMallShopInterior(shop); }
  } else if (kind === 'boutique') {
    const shop = OUTFIT_SHOPS.find(s => s.id === refId);
    if (shop) { title = `${shop.emoji} ${shop.name}`; populateBoutiqueInterior(shop); }
  } else if (kind === 'outfitshop') {
    title = '👗 Outfit Shop';
    populateOriginalOutfitShopInterior();
  } else if (kind === 'armory') {
    title = '⚔️ Armory';
    populateArmoryInterior();
  }
  shopDecor(buildSign(title, SHOP_INTERIOR.x, 7.5, SHOP_INTERIOR.z - SHOP_INTERIOR_HALF_D + 0.3));
  showNotif(`🚪 Welcome to ${title}!`);
}

// ─── CITY_SHOPS / MALL_SHOPS (300 real shops) ──────────────────────────────────────────────────
function interactWithMallItemProp(name, price) {
  if (sipDollars >= price) { buyItem(name, price); return; }
  const special = ITEM_INFO[name];
  const craftId = (special && special.id) || name.toLowerCase().replace(/\s+/g, '_');
  const cost = craftCostForPrice(price, craftId);
  if (canAffordCraftCost(cost)) { craftMallItem(name, price); return; }
  sfx.nope();
  showNotif(`❌ Need 💰${price} S.I.P. or ${craftCostForPriceText(cost)}`);
}
function populateMallShopInterior(shop) {
  const lookId = CATEGORY_LOOK[shop.catId] || 'toy';
  const look = SHOP_LOOK_KITS[lookId];
  const accent = CATEGORY_ACCENT[shop.catId] || look.wallBase;
  repaintShopInteriorShell(look.wallBase, look.floor, look.light);
  buildRegisterCounterDecor();
  const slots = layoutSlotsAroundRoom(shop.items.length, SHOP_INTERIOR.x, SHOP_INTERIOR.z, SHOP_INTERIOR_HALF_W, SHOP_INTERIOR_HALF_D);
  shop.items.forEach((item, i) => {
    const slot = slots[i]; if (!slot) return;
    const built = buildFurnitureByKind(look.furniture, slot.x, slot.z, slot.ry, look.wallBase, accent);
    const prop = buildMallItemPropVisual(item, accent);
    prop.position.set(built.itemLocal.x, built.itemLocal.y, built.itemLocal.z);
    built.group.add(prop);
    SHOP_INTERIOR_ZONES.push({ x: slot.x, z: slot.z, r: 1.9, label: `${itemEmojiFor(item.name)} ${item.name} — 💰${item.price}`, action: () => interactWithMallItemProp(item.name, item.price) });
  });
}

// ─── 40/80 FASHION WING BOUTIQUES (OUTFIT_SHOPS) ───────────────────────────────────────────────
function interactWithBoutiqueOutfit(shopId, i) {
  const shop = OUTFIT_SHOPS.find(s => s.id === shopId); if (!shop) return;
  const o = shop.outfits[i];
  if (sipDollars >= o.cost) { buyBoutiqueOutfit(shopId, i); return; }
  const craftId = 'boutique_' + shopId + '_' + o.name.toLowerCase().replace(/\s+/g, '_');
  const cost = craftCostForPrice(o.cost, craftId);
  if (canAffordCraftCost(cost)) { craftBoutiqueOutfit(shopId, i); return; }
  sfx.nope();
  showNotif(`❌ Need 💰${o.cost} S.I.P. or ${craftCostForPriceText(cost)}`);
}
function populateBoutiqueInterior(shop) {
  const idx = Math.max(0, OUTFIT_SHOPS.indexOf(shop));
  const theme = OUTFIT_BOUTIQUE_THEMES[idx % OUTFIT_BOUTIQUE_THEMES.length];
  repaintShopInteriorShell(theme.wall, 0xf8f0f4, 0xfff0f5);
  buildRegisterCounterDecor();
  const slots = layoutSlotsAroundRoom(shop.outfits.length, SHOP_INTERIOR.x, SHOP_INTERIOR.z, SHOP_INTERIOR_HALF_W, SHOP_INTERIOR_HALF_D);
  shop.outfits.forEach((o, i) => {
    const slot = slots[i]; if (!slot) return;
    const built = buildClothingRackFurniture(slot.x, slot.z, slot.ry, theme.wall, theme.accent);
    const mannequin = buildOutfitMannequinProp(o.shirt, o.pants, o.shoes);
    mannequin.position.set(built.itemLocal.x, built.itemLocal.y, built.itemLocal.z);
    built.group.add(mannequin);
    SHOP_INTERIOR_ZONES.push({ x: slot.x, z: slot.z, r: 1.9, label: `👗 ${o.name} — 💰${o.cost}`, action: () => interactWithBoutiqueOutfit(shop.id, i) });
  });
}

// ─── ORIGINAL OUTFIT SHOP (6 OUTFITS + Body Paint corner) ──────────────────────────────────────
function interactWithClassicOutfit(i) {
  const o = OUTFITS[i];
  if (sipDollars >= o.cost) { buyOutfit(i); return; }
  const craftId = 'outfit_' + o.name.toLowerCase().replace(/\s+/g, '_');
  const cost = craftCostForPrice(o.cost, craftId);
  if (canAffordCraftCost(cost)) { craftOutfit(i); return; }
  sfx.nope();
  showNotif(`❌ Need 💰${o.cost} S.I.P. or ${craftCostForPriceText(cost)}`);
}
function populateOriginalOutfitShopInterior() {
  repaintShopInteriorShell(0xf4c2c2, 0xf8f0f4, 0xfff0f5);
  buildRegisterCounterDecor();
  const combinedCount = OUTFITS.length + BODY_PAINTS.length;
  const slots = layoutSlotsAroundRoom(combinedCount, SHOP_INTERIOR.x, SHOP_INTERIOR.z, SHOP_INTERIOR_HALF_W, SHOP_INTERIOR_HALF_D);
  let si = 0;
  OUTFITS.forEach((o, i) => {
    const slot = slots[si++]; if (!slot) return;
    const built = buildClothingRackFurniture(slot.x, slot.z, slot.ry, 0xf4c2c2, 0xE08A8A);
    const mannequin = buildOutfitMannequinProp(o.shirt, o.pants, o.shoes);
    mannequin.position.set(built.itemLocal.x, built.itemLocal.y, built.itemLocal.z);
    built.group.add(mannequin);
    SHOP_INTERIOR_ZONES.push({ x: slot.x, z: slot.z, r: 1.9, label: `👗 ${o.name} — 💰${o.cost}`, action: () => interactWithClassicOutfit(i) });
  });
  BODY_PAINTS.forEach((p, i) => {
    const slot = slots[si++]; if (!slot) return;
    const built = buildDisplayCase(slot.x, slot.z, slot.ry, 0xf4c2c2, 0xE08A8A);
    const swatch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.5), new THREE.MeshLambertMaterial({ color: p.color }));
    swatch.position.set(built.itemLocal.x, built.itemLocal.y, built.itemLocal.z);
    built.group.add(swatch);
    SHOP_INTERIOR_ZONES.push({ x: slot.x, z: slot.z, r: 1.9, label: `🎨 ${p.name}${p.cost ? ` — 💰${p.cost}` : ' — Free'}`, action: () => buyBodyPaint(i) });
  });
}

// ─── ARMORY (Weapon Shop + Armor Shop combined, the 2 highest-catalog-size cases) ──────────────
// ~5,013 real WEAPONS and 85 real ARMOR pieces obviously can't each get a unique physical mesh in
// a walkable room — grouped into real price-sorted buckets (20 weapon tiers, 8 armor tiers) shown
// as racks/stands carrying one REAL representative mesh (buildWeaponVisual()/buildArmorVisual(),
// the exact same builders that render what you'd see equipped), each opening a compact real
// picker of just that bucket's items — still granting/equipping via the exact existing
// buyWeapon()/craftWeaponHard()/buyArmor()/craftArmorHard(), never reimplemented.
function getWeaponBuckets() {
  buildWeaponLevels();
  const list = WEAPONS.filter(w => !w.blackMarketOnly && !w.craftOnly && !w.robotShopOnly).slice().sort((a, b) => a.cost - b.cost);
  const BUCKETS = 20;
  const per = Math.max(1, Math.ceil(list.length / BUCKETS));
  const buckets = [];
  for (let i = 0; i < list.length; i += per) {
    const chunk = list.slice(i, i + per);
    if (!chunk.length) continue;
    buckets.push({ label: `💰${chunk[0].cost.toLocaleString()}–💰${chunk[chunk.length - 1].cost.toLocaleString()}`, items: chunk });
  }
  return buckets;
}
function getArmorBuckets() {
  const list = ARMOR.filter(a => !a.craftOnly && (!a.premiumOnly || ownedArmor.includes(a.id))).slice().sort((a, b) => a.cost - b.cost);
  const BUCKETS = 8;
  const per = Math.max(1, Math.ceil(list.length / BUCKETS));
  const buckets = [];
  for (let i = 0; i < list.length; i += per) {
    const chunk = list.slice(i, i + per);
    if (!chunk.length) continue;
    buckets.push({ label: `💰${chunk[0].cost.toLocaleString()}–💰${chunk[chunk.length - 1].cost.toLocaleString()}`, items: chunk });
  }
  return buckets;
}
function populateArmoryInterior() {
  repaintShopInteriorShell(0x3a3a3a, 0x2a2a2a, 0xffaa55);
  buildRegisterCounterDecor();
  const weaponBuckets = getWeaponBuckets();
  const armorBuckets = getArmorBuckets();
  const combined = [
    ...weaponBuckets.map(b => ({ type: 'weapon', bucket: b })),
    ...armorBuckets.map(b => ({ type: 'armor', bucket: b })),
  ];
  const slots = layoutSlotsAroundRoom(combined.length, SHOP_INTERIOR.x, SHOP_INTERIOR.z, SHOP_INTERIOR_HALF_W, SHOP_INTERIOR_HALF_D);
  combined.forEach((entry, i) => {
    const slot = slots[i]; if (!slot) return;
    if (entry.type === 'weapon') {
      const built = buildWeaponRackFurniture(slot.x, slot.z, slot.ry, 0x3a3a3a, 0x8a6a3a);
      const rep = entry.bucket.items[Math.floor(entry.bucket.items.length / 2)];
      const mesh = buildWeaponVisual(rep.id);
      if (mesh) { mesh.scale.multiplyScalar(1.5); mesh.position.set(built.itemLocal.x, built.itemLocal.y, built.itemLocal.z); built.group.add(mesh); }
      const bucketIdx = weaponBuckets.indexOf(entry.bucket);
      SHOP_INTERIOR_ZONES.push({ x: slot.x, z: slot.z, r: 2.1, label: `⚔️ Weapons ${entry.bucket.label}`, action: () => openWeaponBucketPicker(bucketIdx) });
    } else {
      const built = buildArmorStandFurniture(slot.x, slot.z, slot.ry, 0x3a3a3a, 0x6a7a8a);
      const rep = entry.bucket.items[Math.floor(entry.bucket.items.length / 2)];
      const mesh = buildArmorVisual(rep.id);
      if (mesh) { mesh.position.set(built.itemLocal.x, built.itemLocal.y, built.itemLocal.z); built.group.add(mesh); }
      const bucketIdx = armorBuckets.indexOf(entry.bucket);
      SHOP_INTERIOR_ZONES.push({ x: slot.x, z: slot.z, r: 2.1, label: `🛡️ Armor ${entry.bucket.label}`, action: () => openArmorBucketPicker(bucketIdx) });
    }
  });
}
function buyWeaponFromPicker(idx, bucketIdx) { buyWeapon(idx); openWeaponBucketPicker(bucketIdx); }
function craftWeaponFromPicker(idx, bucketIdx) { craftWeaponHard(idx); openWeaponBucketPicker(bucketIdx); }
function weaponPickerRowHtml(w, bucketIdx) {
  const realIdx = WEAPONS.indexOf(w);
  const owned = ownedWeapons.includes(w.id);
  const equipped = playerWeapon === w.id;
  const need = weaponRequiredLevel(w.id);
  const locked = need > eliteLevel;
  const craftCost = craftCostForPrice(w.cost, w.id);
  const canCraft = !owned && !locked && canAffordCraftCost(craftCost);
  return `<div class="shopItem">
    <div class="siName">${w.name}</div>
    <div class="siCost">${owned ? (equipped ? '✅ Equipped' : '✔ Owned') : '💰 ' + w.cost + ' S.I.P.'}${need > 0 ? ` — 🔒 Lv.${need}` : ''}</div>
    ${owned ? '' : `<div class="siCost" style="color:#8ac9ff;">🔨 ${craftCostForPriceText(craftCost)}</div>`}
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      <button class="shopBtn" onclick="buyWeaponFromPicker(${realIdx},${bucketIdx})" ${(equipped || locked) ? 'disabled' : ''}>${locked ? `Lv.${need}` : (owned ? (equipped ? 'Equipped' : 'Equip') : 'Buy')}</button>
      ${owned ? '' : `<button class="shopBtn" style="background:#3a6a4a;" onclick="craftWeaponFromPicker(${realIdx},${bucketIdx})" ${(locked || !canCraft) ? 'disabled' : ''}>🔨 Craft</button>`}
    </div>
  </div>`;
}
function openWeaponBucketPicker(bucketIdx) {
  const buckets = getWeaponBuckets();
  const bucket = buckets[bucketIdx]; if (!bucket) return;
  openShopInteriorPicker(`⚔️ Weapons ${bucket.label}`, bucket.items.map(w => weaponPickerRowHtml(w, bucketIdx)).join(''));
}
function buyArmorFromPicker(idx, bucketIdx) { buyArmor(idx); openArmorBucketPicker(bucketIdx); }
function craftArmorFromPicker(idx, bucketIdx) { craftArmorHard(idx); openArmorBucketPicker(bucketIdx); }
function armorPickerRowHtml(a, bucketIdx) {
  const realIdx = ARMOR.indexOf(a);
  const owned = ownedArmor.includes(a.id);
  const equipped = playerArmor === a.id;
  const craftCost = craftCostForPrice(a.cost, a.id);
  const canCraft = !owned && canAffordCraftCost(craftCost);
  return `<div class="shopItem">
    <div class="siName">${a.name}</div>
    <div class="siCost">${owned ? (equipped ? '✅ Equipped' : '✔ Owned') : '💰 ' + a.cost + ' S.I.P.'} — blocks ${Math.round(a.reduction * 100)}% damage</div>
    ${owned ? '' : `<div class="siCost" style="color:#8ac9ff;">🔨 ${craftCostForPriceText(craftCost)}</div>`}
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      <button class="shopBtn" onclick="buyArmorFromPicker(${realIdx},${bucketIdx})" ${equipped ? 'disabled' : ''}>${owned ? (equipped ? 'Equipped' : 'Equip') : 'Buy'}</button>
      ${owned ? '' : `<button class="shopBtn" style="background:#3a6a4a;" onclick="craftArmorFromPicker(${realIdx},${bucketIdx})" ${canCraft ? '' : 'disabled'}>🔨 Craft</button>`}
    </div>
  </div>`;
}
function openArmorBucketPicker(bucketIdx) {
  const buckets = getArmorBuckets();
  const bucket = buckets[bucketIdx]; if (!bucket) return;
  openShopInteriorPicker(`🛡️ Armor ${bucket.label}`, bucket.items.map(a => armorPickerRowHtml(a, bucketIdx)).join(''));
}

// ─── COMPACT IN-WORLD PICKER — a small real overlay (built once, lazily) for browsing one
// weapon/armor price bucket at a time. Not the old #shopOverlay/#cityShopModal — a new, smaller
// panel reusing the exact same .shopItem/.siName/.siCost/.shopBtn CSS classes those already use
// (defined globally in EXPLOX.html, not scoped to either old overlay) so it looks consistent.
function ensureShopInteriorPickerDom() {
  if (document.getElementById('shopInteriorPicker')) return;
  const d = document.createElement('div');
  d.id = 'shopInteriorPicker';
  d.style.cssText = 'display:none;position:fixed;inset:0;z-index:55;background:rgba(0,0,0,0.75);align-items:center;justify-content:center;';
  d.innerHTML = `<div style="background:#1a1a2e;border:2px solid #e94560;border-radius:14px;padding:20px;max-width:420px;width:92%;max-height:80vh;overflow-y:auto;">
    <h3 id="shopInteriorPickerTitle" style="color:#e94560;letter-spacing:1px;margin:0 0 10px;font-size:16px;"></h3>
    <div id="shopInteriorPickerItems" style="display:flex;flex-direction:column;gap:10px;"></div>
    <button onclick="closeShopInteriorPicker()" style="margin-top:12px;width:100%;padding:8px;background:#333;border:none;border-radius:8px;color:#fff;cursor:pointer;">Close</button>
  </div>`;
  document.body.appendChild(d);
}
function openShopInteriorPicker(title, itemsHtml) {
  ensureShopInteriorPickerDom();
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('shopInteriorPickerTitle').textContent = title;
  document.getElementById('shopInteriorPickerItems').innerHTML = itemsHtml;
  document.getElementById('shopInteriorPicker').style.display = 'flex';
}
function closeShopInteriorPicker() {
  const el = document.getElementById('shopInteriorPicker');
  if (el) el.style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
