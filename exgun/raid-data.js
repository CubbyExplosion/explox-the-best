// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN RAID — DATA  (ammo, gun handling stats, armor, medicine, loot, containers)
// Loaded after the main EXGUN script. Pure data + small helpers, no game logic.
// "Extraction shooter" idea: you bring gear into a raid, loot, fight, and must EXTRACT alive to keep what you carry.
// ═══════════════════════════════════════════════════════════════════════════════

// ---- ammunition: dmg = damage per bullet (per pellet for shotgun), pen = penetration class (compare with armor class 1-6) ----
const R_AMMO = {
  '9mm_fmj':  { cal: '9mm',  name: '9×19 FMJ',        dmg: 24, pen: 2, price: 1,  tracer: 0xffd27a },
  '9mm_ap':   { cal: '9mm',  name: '9×19 AP',         dmg: 21, pen: 4, price: 3,  tracer: 0xffb347 },
  '556_fmj':  { cal: '556',  name: '5.56×45 FMJ',     dmg: 36, pen: 3, price: 2,  tracer: 0xffe08a },
  '556_ap':   { cal: '556',  name: '5.56×45 AP',      dmg: 33, pen: 5, price: 5,  tracer: 0xff9955 },
  '762_fmj':  { cal: '762',  name: '7.62×51 FMJ',     dmg: 45, pen: 4, price: 3,  tracer: 0xffe08a },
  '762_ap':   { cal: '762',  name: '7.62×51 AP',      dmg: 42, pen: 6, price: 8,  tracer: 0xff8844 },
  '12g_buck': { cal: '12g',  name: '12ga Buckshot',   dmg: 11, pen: 1, price: 3,  tracer: 0xffffff, pellets: 8 },
  '12g_slug': { cal: '12g',  name: '12ga Slug',       dmg: 72, pen: 3, price: 6,  tracer: 0xffd27a },
  '338_ap':   { cal: '338',  name: '.338 AP',         dmg: 112, pen: 7, price: 14, tracer: 0xff7733 }
};
const R_CAL_NAMES = { '9mm': '9×19', '556': '5.56×45', '762': '7.62×51', '12g': '12 gauge', '338': '.338' };
const R_CAL_DEFAULT = { '9mm': '9mm_fmj', '556': '556_fmj', '762': '762_fmj', '12g': '12g_buck', '338': '338_ap' };
const R_BOX = 30;                                   // shop sells ammo in boxes of 30 (10 for .338)

// ---- gun handling (the base stats dmg/fireRate/range/spread still come from WEAPON_CATALOG) ----
//  mag = magazine size, reload = seconds, tac = tactical reload seconds (mag not empty), kickV/kickH = recoil per shot (degrees),
//  auto = full-auto allowed, mode: 'semi'|'auto'|'pump'|'bolt', zoom = ADS zoom factor, model = viewmodel shape
const R_GUN = {
  pistol_mk1:    { cal: '9mm', mag: 12, reload: 1.9, tac: 1.4, kickV: 1.0, kickH: 0.35, auto: false, mode: 'semi', zoom: 1.15, model: 'pistol' },
  pistol_mk2:    { cal: '9mm', mag: 15, reload: 1.9, tac: 1.4, kickV: 0.9, kickH: 0.30, auto: false, mode: 'semi', zoom: 1.15, model: 'pistol' },
  smg_ripper:    { cal: '9mm', mag: 30, reload: 2.4, tac: 1.8, kickV: 0.55, kickH: 0.40, auto: true,  mode: 'auto', zoom: 1.3,  model: 'smg' },
  smg_vortex:    { cal: '9mm', mag: 32, reload: 2.4, tac: 1.8, kickV: 0.50, kickH: 0.36, auto: true,  mode: 'auto', zoom: 1.3,  model: 'smg' },
  shotgun_buster:{ cal: '12g', mag: 6,  reload: 0.55, tac: 0.55, kickV: 3.2, kickH: 0.6, auto: false, mode: 'pump', zoom: 1.15, model: 'shotgun', perShell: true },
  shotgun_reaper:{ cal: '12g', mag: 8,  reload: 0.50, tac: 0.50, kickV: 3.0, kickH: 0.6, auto: false, mode: 'pump', zoom: 1.15, model: 'shotgun', perShell: true },
  rifle_falcon:  { cal: '556', mag: 30, reload: 2.7, tac: 2.0, kickV: 0.85, kickH: 0.45, auto: true,  mode: 'auto', zoom: 1.6,  model: 'rifle' },
  rifle_sentinel:{ cal: '762', mag: 20, reload: 2.9, tac: 2.2, kickV: 1.25, kickH: 0.55, auto: true,  mode: 'auto', zoom: 1.7,  model: 'rifle' },
  sniper_ghost:  { cal: '338', mag: 5,  reload: 3.4, tac: 3.0, kickV: 3.6, kickH: 0.5,  auto: false, mode: 'bolt', zoom: 3.2,  model: 'sniper', scope: true },
  sniper_wraith: { cal: '338', mag: 7,  reload: 3.2, tac: 2.8, kickV: 3.2, kickH: 0.45, auto: false, mode: 'bolt', zoom: 3.8,  model: 'sniper', scope: true }
};
function rGunOf(id) { return R_GUN[id] || null; }
function rRaidWeapons() { return WEAPON_CATALOG.filter(w => R_GUN[w.id]); }   // launchers are not allowed in raids

// ---- armor: ac = armor class (1-6), dur = durability points ----
const R_ARMOR = {
  vest_1:  { slot: 'vest',   name: 'Soft Vest (AC2)',      ac: 2, dur: 60,  price: 120,  emoji: '🦺' },
  vest_2:  { slot: 'vest',   name: 'Plate Carrier (AC3)',  ac: 3, dur: 85,  price: 340,  emoji: '🦺' },
  vest_3:  { slot: 'vest',   name: 'Heavy Plates (AC4)',   ac: 4, dur: 110, price: 900,  emoji: '🦺' },
  vest_4:  { slot: 'vest',   name: 'Assault Armor (AC5)',  ac: 5, dur: 130, price: 2200, emoji: '🦺' },
  vest_5:  { slot: 'vest',   name: 'Elite Armor (AC6)',    ac: 6, dur: 160, price: 5200, emoji: '🛡️' },
  helm_1:  { slot: 'helmet', name: 'Ballistic Cap (AC2)',  ac: 2, dur: 40,  price: 100,  emoji: '🪖' },
  helm_2:  { slot: 'helmet', name: 'Combat Helmet (AC3)',  ac: 3, dur: 60,  price: 320,  emoji: '🪖' },
  helm_3:  { slot: 'helmet', name: 'Heavy Helmet (AC4)',   ac: 4, dur: 85,  price: 950,  emoji: '🪖' },
  helm_4:  { slot: 'helmet', name: 'Elite Helmet (AC5)',   ac: 5, dur: 110, price: 2600, emoji: '⛑️' }
};

// ---- medicine (use time in seconds) ----
const R_MED = {
  bandage:    { name: 'Bandage',     emoji: '🩹', price: 20, use: 2.0, desc: 'Stops light bleeding' },
  medkit:     { name: 'Medkit',      emoji: '🧰', price: 90, use: 5.0, desc: 'Stops bleeding, heals 60 HP' },
  painkiller: { name: 'Painkillers', emoji: '💊', price: 60, use: 2.0, desc: 'Removes limp & shaky aim for 90s' }
};

// ---- loot: value = scrap when sold at the Hideout ----
const R_LOOT = {
  scrap_metal: { name: 'Scrap Metal',   emoji: '🔩', value: 15,  w: 30 },
  wires:       { name: 'Copper Wire',   emoji: '🧵', value: 28,  w: 24 },
  fuel:        { name: 'Fuel Can',      emoji: '⛽', value: 45,  w: 16 },
  hard_drive:  { name: 'Hard Drive',    emoji: '💾', value: 140, w: 8 },
  circuit:     { name: 'Circuit Board', emoji: '🔌', value: 85,  w: 10 },
  gold_watch:  { name: 'Gold Watch',    emoji: '⌚', value: 190, w: 5 },
  laptop:      { name: 'Laptop',        emoji: '💻', value: 300, w: 3 },
  gpu:         { name: 'Graphics Card', emoji: '🎛️', value: 480, w: 2 },
  cash_roll:   { name: 'Cash Roll',     emoji: '💵', value: 110, w: 6 }
};

// item lookup for any id used in packs/stash: ammo, armor, med, loot, or a found weapon ("wpn:id")
function rItem(id) {
  if (R_AMMO[id]) { const a = R_AMMO[id]; return { id, kind: 'ammo', name: a.name, emoji: '🔸', value: Math.round(a.price * 0.6) }; }
  if (R_ARMOR[id]) { const a = R_ARMOR[id]; return { id, kind: 'armor', name: a.name, emoji: a.emoji, value: Math.round(a.price * 0.5) }; }
  if (R_MED[id]) { const m = R_MED[id]; return { id, kind: 'med', name: m.name, emoji: m.emoji, value: Math.round(m.price * 0.5) }; }
  if (R_LOOT[id]) { const l = R_LOOT[id]; return { id, kind: 'loot', name: l.name, emoji: l.emoji, value: l.value }; }
  if (id.startsWith('wpn:')) { const w = weaponById(id.slice(4)); return { id, kind: 'weapon', name: w.name, emoji: '🔫', value: Math.round(weaponCost(w.tier) * 0.5) }; }
  return { id, kind: 'junk', name: id, emoji: '❔', value: 1 };
}

// ---- containers you can search (F): loot tables are [itemId, weight, min, max] ----
const R_CONTAINERS = {
  crate:  { name: 'Supply Crate',  color: 0x8a6a3a, size: [1.3, 0.9, 1.3], rolls: [2, 3], table: [
    ['scrap_metal', 30, 1, 3], ['wires', 18, 1, 2], ['fuel', 8, 1, 1], ['9mm_fmj', 24, 8, 24], ['556_fmj', 8, 8, 20], ['12g_buck', 8, 4, 8], ['bandage', 14, 1, 2], ['circuit', 4, 1, 1] ] },
  locker: { name: 'Locker',        color: 0x4d6a7a, size: [0.9, 1.9, 0.7], rolls: [2, 3], table: [
    ['bandage', 24, 1, 2], ['painkiller', 12, 1, 1], ['medkit', 7, 1, 1], ['vest_1', 8, 1, 1], ['helm_1', 8, 1, 1], ['9mm_fmj', 18, 10, 30], ['gold_watch', 3, 1, 1], ['cash_roll', 8, 1, 1] ] },
  safe:   { name: 'Safe',          color: 0x2b2f33, size: [1.0, 1.1, 1.0], rolls: [3, 4], table: [
    ['cash_roll', 24, 1, 2], ['gold_watch', 14, 1, 1], ['hard_drive', 14, 1, 1], ['laptop', 8, 1, 1], ['gpu', 5, 1, 1], ['vest_3', 5, 1, 1], ['helm_3', 4, 1, 1], ['762_fmj', 10, 10, 24], ['556_ap', 6, 10, 20], ['medkit', 8, 1, 1] ] },
  weaponbox: { name: 'Weapon Case', color: 0x2f4a2f, size: [1.4, 0.6, 0.7], rolls: [2, 3], table: [
    ['556_fmj', 18, 15, 30], ['762_fmj', 12, 12, 24], ['9mm_ap', 10, 12, 24], ['12g_slug', 8, 4, 8], ['338_ap', 4, 4, 8],
    ['wpn:smg_ripper', 3, 1, 1], ['wpn:rifle_falcon', 2, 1, 1], ['wpn:shotgun_buster', 2, 1, 1], ['vest_2', 8, 1, 1], ['helm_2', 6, 1, 1] ] }
};

// ---- enemy types: hp = total hit points, ac/acHead = armor classes on body/head, acc = accuracy, rpm = shots per burst timing, range = preferred distance ----
const R_ENEMY = {
  scav:  { name: 'Scav',     emoji: '🧟', hp: 90,  ac: 0, acHead: 0, ammo: '9mm_fmj', dmgMul: 0.8, acc: 0.24, burst: [1, 3],  gap: 0.36, rest: [1.6, 3.0], sight: 32, pref: [10, 22], speed: 2.5, tier: 1, color: 0x6b5a45, vest: 0x4a4036 },
  raider:{ name: 'Raider',   emoji: '🥷', hp: 120, ac: 2, acHead: 1, ammo: '556_fmj', dmgMul: 0.9, acc: 0.32, burst: [2, 4],  gap: 0.20, rest: [1.3, 2.4], sight: 42, pref: [14, 28], speed: 3.0, tier: 2, color: 0x3d4a3a, vest: 0x2c3329 },
  pmc:   { name: 'PMC',      emoji: '🪖', hp: 150, ac: 4, acHead: 3, ammo: '762_fmj', dmgMul: 1.0, acc: 0.42, burst: [2, 5],  gap: 0.16, rest: [1.0, 1.9], sight: 55, pref: [18, 34], speed: 3.3, tier: 4, color: 0x30343a, vest: 0x1d2024 },
  boss:  { name: 'Warlord',  emoji: '👹', hp: 320, ac: 5, acHead: 4, ammo: '762_ap',  dmgMul: 1.1, acc: 0.48, burst: [3, 6],  gap: 0.14, rest: [0.8, 1.5], sight: 62, pref: [16, 30], speed: 3.0, tier: 7, color: 0x5a1f1f, vest: 0x2a0f0f }
};
// what each enemy may drop on death: [itemId, chance, min, max]
const R_ENEMY_DROPS = {
  scav:   [['9mm_fmj', 0.85, 6, 18], ['bandage', 0.30, 1, 1], ['scrap_metal', 0.4, 1, 2], ['vest_1', 0.07, 1, 1], ['cash_roll', 0.10, 1, 1]],
  raider: [['556_fmj', 0.85, 10, 24], ['bandage', 0.35, 1, 2], ['painkiller', 0.20, 1, 1], ['vest_2', 0.18, 1, 1], ['helm_1', 0.20, 1, 1], ['cash_roll', 0.2, 1, 1]],
  pmc:    [['762_fmj', 0.85, 10, 20], ['medkit', 0.35, 1, 1], ['vest_3', 0.22, 1, 1], ['helm_2', 0.28, 1, 1], ['hard_drive', 0.25, 1, 1], ['gold_watch', 0.18, 1, 1]],
  boss:   [['762_ap', 1, 12, 24], ['vest_4', 0.5, 1, 1], ['helm_3', 0.5, 1, 1], ['medkit', 1, 1, 2], ['laptop', 0.6, 1, 1], ['gpu', 0.4, 1, 1], ['cash_roll', 1, 2, 3]]
};

// ---- player body zones ----
const R_ZONES = { head: 35, chest: 85, stomach: 70, arms: 70, legs: 80 };
const R_ZONE_MUL = { head: 2.6, chest: 1.0, stomach: 1.1, arms: 0.55, legs: 0.6 };      // damage multiplier when YOU hit an enemy there
const R_HIT_WEIGHTS = [['chest', 42], ['stomach', 16], ['legs', 20], ['arms', 14], ['head', 8]];   // where enemy bullets land on you

const R_PACK_SLOTS = 14;                           // backpack capacity
function rSlotsFor(id, n) { return R_AMMO[id] ? Math.ceil(n / 60) : id.startsWith('wpn:') ? 2 * n : n; }
function rSlotsUsed(pack) { let s = 0; for (const id in pack) if (pack[id] > 0) s += rSlotsFor(id, pack[id]); return s; }

// ═══════════════════════════════════════════════════════════════════════════════
// ARMORY EXPANSION — more calibers, 13 more guns, attachments
// (names are generic "pattern" names: realistic archetypes, no brand names)
// ═══════════════════════════════════════════════════════════════════════════════
Object.assign(R_AMMO, {
  '45_fmj':     { cal: '45',     name: '.45 ACP FMJ',      dmg: 30, pen: 2, price: 2, tracer: 0xffd27a },
  '45_ap':      { cal: '45',     name: '.45 ACP AP',       dmg: 27, pen: 4, price: 5, tracer: 0xffb347 },
  '357_fmj':    { cal: '357',    name: '.357 Magnum',      dmg: 54, pen: 3, price: 4, tracer: 0xffd27a },
  '545_fmj':    { cal: '545',    name: '5.45×39 FMJ',      dmg: 34, pen: 3, price: 2, tracer: 0xffe08a },
  '545_ap':     { cal: '545',    name: '5.45×39 AP',       dmg: 31, pen: 5, price: 5, tracer: 0xff9955 },
  '762x39_fmj': { cal: '762x39', name: '7.62×39 FMJ',      dmg: 41, pen: 3, price: 3, tracer: 0xffe08a },
  '762x39_ap':  { cal: '762x39', name: '7.62×39 AP',       dmg: 38, pen: 5, price: 7, tracer: 0xff8844 }
});
Object.assign(R_CAL_NAMES, { '45': '.45 ACP', '357': '.357 Magnum', '545': '5.45×39', '762x39': '7.62×39' });
Object.assign(R_CAL_DEFAULT, { '45': '45_fmj', '357': '357_fmj', '545': '545_fmj', '762x39': '762x39_fmj' });

// new guns: [catalog entry, handling]. cat 'LMG'/'DMR' are new categories; tiers are fractional so prices fall between the originals
const R_NEW_GUNS = [
  [{ id: 'pistol_45',     name: '.45 Service Pistol',   cat: 'Pistol',  tier: 2.6,  dmg: 30, fireRate: 3.0,  range: 38,  spread: 0.009 }, { cal: '45',     mag: 8,   reload: 1.9, tac: 1.4, kickV: 1.3, kickH: 0.4,  auto: false, mode: 'semi', zoom: 1.15, model: 'pistol45' }],
  [{ id: 'revolver_357',  name: '.357 Revolver',        cat: 'Pistol',  tier: 3.2,  dmg: 54, fireRate: 1.7,  range: 45,  spread: 0.007 }, { cal: '357',    mag: 6,   reload: 3.6, tac: 3.6, kickV: 2.4, kickH: 0.5,  auto: false, mode: 'semi', zoom: 1.2,  model: 'revolver' }],
  [{ id: 'smg_mp5',       name: 'MP5-pattern SMG',      cat: 'SMG',     tier: 3.6,  dmg: 24, fireRate: 12.0, range: 32,  spread: 0.018 }, { cal: '9mm',    mag: 30,  reload: 2.5, tac: 1.9, kickV: 0.45, kickH: 0.3, auto: true,  mode: 'auto', zoom: 1.35, model: 'smg' }],
  [{ id: 'smg_ump',       name: 'UMP-pattern SMG .45',  cat: 'SMG',     tier: 4.6,  dmg: 30, fireRate: 10.0, range: 34,  spread: 0.020 }, { cal: '45',     mag: 25,  reload: 2.6, tac: 2.0, kickV: 0.7, kickH: 0.4,  auto: true,  mode: 'auto', zoom: 1.35, model: 'smg' }],
  [{ id: 'shotgun_semi',  name: 'Semi-Auto Shotgun',    cat: 'Shotgun', tier: 6.4,  dmg: 11, fireRate: 3.2,  range: 20,  spread: 0.085, pellets: 8 }, { cal: '12g', mag: 8, reload: 0.55, tac: 0.55, kickV: 2.4, kickH: 0.6, auto: false, mode: 'semi', zoom: 1.2, model: 'shotgunSemi', perShell: true }],
  [{ id: 'rifle_hunter',  name: 'Hunting Rifle',        cat: 'Rifle',   tier: 5.6,  dmg: 45, fireRate: 1.0,  range: 90,  spread: 0.003 }, { cal: '762',    mag: 5,   reload: 3.0, tac: 2.6, kickV: 2.6, kickH: 0.4,  auto: false, mode: 'bolt', zoom: 2.4,  model: 'hunter', scope: true }],
  [{ id: 'rifle_ak74',    name: 'AK-74-pattern Rifle',  cat: 'Rifle',   tier: 6.9,  dmg: 34, fireRate: 9.0,  range: 62,  spread: 0.0085 }, { cal: '545',   mag: 30,  reload: 2.8, tac: 2.1, kickV: 0.8, kickH: 0.5,  auto: true,  mode: 'auto', zoom: 1.5,  model: 'ak' }],
  [{ id: 'carbine_m4',    name: 'M4-pattern Carbine',   cat: 'Rifle',   tier: 7.2,  dmg: 36, fireRate: 11.0, range: 66,  spread: 0.0065 }, { cal: '556',   mag: 30,  reload: 2.6, tac: 1.9, kickV: 0.7, kickH: 0.35, auto: true,  mode: 'auto', zoom: 1.6,  model: 'carbine' }],
  [{ id: 'rifle_akm',     name: 'AKM-pattern Rifle',    cat: 'Rifle',   tier: 7.8,  dmg: 41, fireRate: 9.0,  range: 66,  spread: 0.0085 }, { cal: '762x39', mag: 30,  reload: 2.9, tac: 2.2, kickV: 1.1, kickH: 0.6,  auto: true,  mode: 'auto', zoom: 1.5,  model: 'ak' }],
  [{ id: 'dmr_10',        name: 'DMR-10 Marksman',      cat: 'Sniper',  tier: 8.6,  dmg: 45, fireRate: 3.6,  range: 110, spread: 0.0025 }, { cal: '762',    mag: 10,  reload: 2.9, tac: 2.2, kickV: 1.5, kickH: 0.3,  auto: false, mode: 'semi', zoom: 2.8,  model: 'dmr', scope: true }],
  [{ id: 'rifle_battle',  name: 'Battle Rifle',         cat: 'Rifle',   tier: 9.2,  dmg: 45, fireRate: 8.0,  range: 80,  spread: 0.006 }, { cal: '762',    mag: 20,  reload: 3.0, tac: 2.3, kickV: 1.6, kickH: 0.65, auto: true,  mode: 'auto', zoom: 1.7,  model: 'battle' }],
  [{ id: 'lmg_40',        name: 'LMG-40 Machine Gun',   cat: 'LMG',     tier: 10.4, dmg: 41, fireRate: 10.0, range: 75,  spread: 0.011 }, { cal: '762x39', mag: 75,  reload: 6.4, tac: 6.4, kickV: 1.0, kickH: 0.7,  auto: true,  mode: 'auto', zoom: 1.4,  model: 'lmg' }]
];
R_NEW_GUNS.forEach(([cat, g]) => { if (!WEAPON_CATALOG.find(w => w.id === cat.id)) WEAPON_CATALOG.push(cat); R_GUN[cat.id] = g; });
// the original launchers are kept at the end of the catalog list; sort so the Armory lists guns by tier
WEAPON_CATALOG.sort((a, b) => a.tier - b.tier);

// ---- attachments: slot + stat changes. price in scrap ----
//  zoomAdd/zoomSet change ADS zoom, spreadMul/kickV/kickH multiply, magMul multiplies magazine size, suppressed hides the shot, reloadMul slows reload
const R_ATT = {
  opt_reddot: { slot: 'optic',  name: 'Red Dot Sight',        price: 350,  zoomAdd: 0.25, spreadMul: 0.95, emoji: '🔴' },
  opt_holo:   { slot: 'optic',  name: 'Holographic Sight',    price: 700,  zoomAdd: 0.3,  spreadMul: 0.92, emoji: '🟥' },
  opt_acog:   { slot: 'optic',  name: '4× Combat Scope',      price: 1500, zoomSet: 3.0,  spreadMul: 0.9,  emoji: '🔭' },
  opt_scope8: { slot: 'optic',  name: '8× Long-Range Scope',  price: 3400, zoomSet: 6.0,  spreadMul: 0.85, scope: true, emoji: '🔭', needs: ['sniper', 'dmr', 'hunter', 'battle', 'lmg'] },
  mz_supp:    { slot: 'muzzle', name: 'Suppressor',           price: 1300, kickV: 0.92, suppressed: true, dmgMul: 0.96, emoji: '🔇' },
  mz_comp:    { slot: 'muzzle', name: 'Compensator',          price: 520,  kickV: 0.8,  kickH: 0.85, emoji: '⚙️' },
  gr_vert:    { slot: 'grip',   name: 'Vertical Foregrip',    price: 420,  kickH: 0.68, kickV: 0.95, emoji: '🪝', needs: ['smg', 'carbine', 'ak', 'battle', 'lmg', 'dmr'] },
  gr_angled:  { slot: 'grip',   name: 'Angled Foregrip',      price: 470,  kickV: 0.86, emoji: '🪝', needs: ['smg', 'carbine', 'ak', 'battle', 'lmg', 'dmr'] },
  mg_ext:     { slot: 'mag',    name: 'Extended Magazine',    price: 640,  magMul: 1.35, reloadMul: 1.12, emoji: '📦', needs: ['pistol', 'pistol45', 'smg', 'carbine', 'ak', 'battle', 'dmr'] },
  sd_laser:   { slot: 'side',   name: 'Laser Sight',          price: 480,  spreadMul: 0.9,  emoji: '🔺' }
};
const R_ATT_SLOTS = [['optic', 'Optic'], ['muzzle', 'Muzzle'], ['grip', 'Foregrip'], ['mag', 'Magazine'], ['side', 'Side rail']];
function rAttFits(attId, weaponId) { const a = R_ATT[attId], g = R_GUN[weaponId]; if (!a || !g) return false; return !a.needs || a.needs.includes(g.model); }
// the gun's stats with its installed attachments applied (mods = {optic:'opt_x', muzzle:..., ...})
function rGunStats(weaponId, mods) {
  const base = R_GUN[weaponId]; const s = Object.assign({}, base, { spreadMul: 1, suppressed: false, dmgMul: 1, reloadMul: 1 });
  Object.keys(mods || {}).forEach(slot => {
    const a = R_ATT[mods[slot]]; if (!a || !rAttFits(mods[slot], weaponId)) return;
    if (a.zoomSet) s.zoom = Math.max(s.zoom, a.zoomSet); if (a.zoomAdd) s.zoom += a.zoomAdd; if (a.scope) s.scope = true;
    if (a.spreadMul) s.spreadMul *= a.spreadMul; if (a.kickV) s.kickV *= a.kickV; if (a.kickH) s.kickH *= a.kickH;
    if (a.magMul) s.mag = Math.round(s.mag * a.magMul); if (a.reloadMul) { s.reload *= a.reloadMul; s.tac *= a.reloadMul; }
    if (a.suppressed) s.suppressed = true; if (a.dmgMul) s.dmgMul *= a.dmgMul;
  });
  return s;
}
// attachments and ammo can also turn up as loot and in the stash (id "att:xxx")
const _rItemBase = rItem;
rItem = function (id) {
  if (id.startsWith('att:')) { const a = R_ATT[id.slice(4)]; if (a) return { id, kind: 'att', name: a.name, emoji: a.emoji, value: Math.round(a.price * 0.5) }; }
  return _rItemBase(id);
};
// richer loot
R_CONTAINERS.weaponbox.table.push(['att:opt_reddot', 5, 1, 1], ['att:mz_comp', 4, 1, 1], ['att:gr_vert', 4, 1, 1], ['att:mg_ext', 3, 1, 1], ['45_fmj', 8, 8, 20], ['545_fmj', 8, 10, 24], ['762x39_fmj', 8, 10, 24], ['wpn:carbine_m4', 1, 1, 1], ['wpn:rifle_ak74', 1, 1, 1], ['wpn:smg_mp5', 2, 1, 1]);
R_CONTAINERS.safe.table.push(['att:opt_holo', 4, 1, 1], ['att:opt_acog', 3, 1, 1], ['att:mz_supp', 3, 1, 1], ['att:opt_scope8', 1, 1, 1]);
R_CONTAINERS.locker.table.push(['45_fmj', 8, 8, 20], ['att:sd_laser', 2, 1, 1]);
R_ENEMY_DROPS.scav.push(['45_fmj', 0.25, 6, 14]);
R_ENEMY_DROPS.raider.push(['545_fmj', 0.4, 10, 24], ['att:opt_reddot', 0.06, 1, 1], ['att:mz_comp', 0.05, 1, 1]);
R_ENEMY_DROPS.pmc.push(['762x39_fmj', 0.4, 10, 24], ['att:opt_holo', 0.1, 1, 1], ['att:mz_supp', 0.08, 1, 1], ['att:mg_ext', 0.1, 1, 1]);
R_ENEMY_DROPS.boss.push(['att:opt_acog', 0.5, 1, 1], ['att:mz_supp', 0.4, 1, 1]);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTOR DIFFICULTY — low sector numbers are gentle, high ones are brutal (hidden sectors, every 5th, count as one level harder)
//  enemies [min,max], mix = chance of [scav, raider, pmc] (rest), boss = chance of a Warlord (bosses = how many when it appears),
//  acc = enemy accuracy multiplier, hp = enemy health multiplier, loot = loot amount multiplier, containers = [crate, locker, safe, weaponbox], time = raid minutes
// ═══════════════════════════════════════════════════════════════════════════════
const R_DIFFS = [
  { id: 0, name: 'Easy',      color: '#7dffb0', enemies: [5, 7],   mix: [0.85, 0.15, 0],    boss: 0,    bosses: 0, acc: 0.65, hp: 0.8,  loot: 0.9,  containers: [9, 5, 1, 1], time: 15, note: 'Mostly scavs, few guards. A good place to learn.' },
  { id: 1, name: 'Normal',    color: '#d6ff7d', enemies: [8, 10],  mix: [0.55, 0.35, 0.10], boss: 0.25, bosses: 1, acc: 0.85, hp: 0.95, loot: 1.0,  containers: [7, 4, 2, 2], time: 15, note: 'Scavs and raiders. A boss sometimes roams.' },
  { id: 2, name: 'Hard',      color: '#ffd24a', enemies: [11, 13], mix: [0.35, 0.40, 0.25], boss: 0.7,  bosses: 1, acc: 1.0,  hp: 1.0,  loot: 1.15, containers: [6, 4, 3, 2], time: 15, note: 'PMC squads and a likely Warlord.' },
  { id: 3, name: 'Very Hard', color: '#ff9a3a', enemies: [13, 15], mix: [0.2, 0.4, 0.4],    boss: 1,    bosses: 1, acc: 1.1,  hp: 1.15, loot: 1.3,  containers: [5, 4, 4, 3], time: 14, note: 'Heavily armed. Bring good armor.' },
  { id: 4, name: 'Extreme',   color: '#ff4a3a', enemies: [15, 17], mix: [0.1, 0.35, 0.55],  boss: 1,    bosses: 2, acc: 1.2,  hp: 1.3,  loot: 1.55, containers: [4, 4, 5, 4], time: 13, note: 'Elite PMCs and two Warlords. Rich loot.' }
];
function rDifficulty(mapIndex) {
  let lvl = mapIndex < 9 ? 0 : mapIndex < 25 ? 1 : mapIndex < 50 ? 2 : mapIndex < 80 ? 3 : 4;
  if (mapIndex % 5 === 0 && mapIndex > 1) lvl = Math.min(4, lvl + 1);          // hidden sectors are one step harder
  return R_DIFFS[lvl];
}
