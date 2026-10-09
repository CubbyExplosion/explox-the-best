// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN RAID — ARMORY EXPANSION (≈10× more gear)
// Generated from families so every item has its own name, price and stats:
//   WEAPONS      every base gun × 9 variants (Compact, Tactical, CQB, Marksman, Heavy, Silent, Match Grade, Elite, Prototype)  → ~220 guns
//   ATTACHMENTS  optics (red dots, holos, prisms, 1.5×–12× scopes), muzzles (suppressors/compensators/brakes/hiders), grips, magazines (extended,
//                quick-draw, drums), side rail (laser/flashlight/IR), stocks, barrels — mostly in three grades          → ~100 parts
//   AMMO         every caliber × 8 loads (JHP, +P, AP, tracer, subsonic, match, incendiary, armor-piercing+)             → ~90 loads
//   ARMOR        vests AC1–AC6 × 3 designs × 3 builds, helmets AC1–AC5 × 3 designs × 3 builds, 14 backpacks             → ~110 pieces
//   MEDICAL      bandages, tourniquets, splints, kits, painkillers, stims, food…                                          → ~30 items
//   THROWABLES   frag, impact, smoke, flash, molotov in several grades (key G throws, 4 changes type)                     → ~14 items
// Loaded after raid-data.js (it extends the tables defined there) and before raid-guns.js / raid-core.js.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const G3 = ['Basic', 'Advanced', 'Elite'], PM = [1, 1.9, 3.4];
const LONG = ['carbine', 'ak', 'battle', 'dmr', 'hunter', 'lmg', 'sniper'], CARB = ['smg', 'carbine', 'ak', 'battle', 'dmr', 'lmg'], ALLM = ['pistol', 'pistol45', 'revolver', 'smg', 'carbine', 'ak', 'battle', 'dmr', 'hunter', 'lmg', 'shotgun', 'shotgunSemi', 'sniper'];
const NOREV = ALLM.filter(m => m !== 'revolver'), STOCKM = ALLM.filter(m => !/^pistol|revolver/.test(m));
const MAGM = ['pistol', 'pistol45', 'smg', 'carbine', 'ak', 'battle', 'dmr'];
const r2 = v => Math.round(v * 100) / 100;

// ───────────────────────── attachments ─────────────────────────
// vis = which 3D part to draw, g = grade 1..3 (bigger/longer for better grades)
Object.assign(R_ATT.opt_reddot, { vis: 'reddot', g: 2 }); Object.assign(R_ATT.opt_holo, { vis: 'holo', g: 2 }); Object.assign(R_ATT.opt_acog, { vis: 'scope', g: 2 }); Object.assign(R_ATT.opt_scope8, { vis: 'scope', g: 3 });
Object.assign(R_ATT.mz_supp, { vis: 'supp', g: 2 }); Object.assign(R_ATT.mz_comp, { vis: 'comp', g: 2 }); Object.assign(R_ATT.gr_vert, { vis: 'vgrip', g: 2 }); Object.assign(R_ATT.gr_angled, { vis: 'agrip', g: 2 }); Object.assign(R_ATT.mg_ext, { vis: 'mag', g: 2 }); Object.assign(R_ATT.sd_laser, { vis: 'laser', g: 2 });
function fam(prefix, slot, name, emoji, vis, needs, base, price, gradeFx) {
  for (let g = 0; g < 3; g++) { const fx = gradeFx(g); R_ATT[prefix + (g + 1)] = Object.assign({ slot, name: `${G3[g]} ${name}`, price: Math.round(price * PM[g] / 10) * 10, emoji, vis, g: g + 1, needs }, fx); }
}
fam('opt_red_', 'optic', 'Red Dot', '🔴', 'reddot', ALLM, 0, 250, g => ({ zoomAdd: 0.2 + 0.05 * g, spreadMul: r2(0.96 - 0.02 * g) }));
fam('opt_holo_', 'optic', 'Holo Sight', '🟥', 'holo', NOREV, 0, 520, g => ({ zoomAdd: 0.25 + 0.05 * g, spreadMul: r2(0.94 - 0.02 * g) }));
fam('opt_prism_', 'optic', 'Prism Sight', '🔷', 'scope', NOREV, 0, 700, g => ({ zoomSet: r2(1.9 + 0.35 * g), spreadMul: r2(0.93 - 0.02 * g) }));
fam('opt_reflex_', 'optic', 'Mini Reflex', '🔸', 'reddot', ['pistol', 'pistol45', 'smg'], 0, 220, g => ({ zoomAdd: 0.15 + 0.05 * g, spreadMul: r2(0.97 - 0.02 * g) }));
[1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12].forEach((z, i) => { R_ATT['opt_x' + String(z).replace('.', '_')] = { slot: 'optic', name: z + '× Scope', price: Math.round((380 + z * 260) / 10) * 10, emoji: '🔭', vis: 'scope', g: z >= 8 ? 3 : z >= 4 ? 2 : 1, zoomSet: z, spreadMul: r2(0.95 - i * 0.01), scope: z >= 6, needs: z >= 6 ? ['dmr', 'hunter', 'sniper', 'battle', 'lmg'] : z >= 3 ? LONG.concat(['smg', 'battle']) : NOREV }; });
fam('mz_sup_', 'muzzle', 'Suppressor', '🔇', 'supp', NOREV, 0, 900, g => ({ suppressed: true, kickV: r2(0.95 - 0.035 * g), dmgMul: r2(0.97 - 0.015 * g) }));
fam('mz_cmp_', 'muzzle', 'Compensator', '⚙️', 'comp', NOREV, 0, 420, g => ({ kickV: r2(0.88 - 0.06 * g), kickH: r2(0.9 - 0.05 * g) }));
fam('mz_brk_', 'muzzle', 'Muzzle Brake', '🛠️', 'brake', NOREV, 0, 480, g => ({ kickV: r2(0.9 - 0.05 * g), kickH: r2(0.95 - 0.05 * g) }));
fam('mz_hid_', 'muzzle', 'Flash Hider', '✨', 'hider', NOREV, 0, 350, g => ({ kickV: r2(0.96 - 0.01 * g), kickH: r2(0.96 - 0.02 * g), spreadMul: r2(0.99 - 0.01 * g) }));
fam('gr_v', 'grip', 'Vertical Grip', '🪝', 'vgrip', CARB, 0, 340, g => ({ kickH: r2(0.75 - 0.05 * g), kickV: r2(0.96 - 0.02 * g) }));
fam('gr_a', 'grip', 'Angled Grip', '🪝', 'agrip', CARB, 0, 380, g => ({ kickV: r2(0.9 - 0.04 * g) }));
fam('gr_s', 'grip', 'Stubby Grip', '🪝', 'stubby', CARB, 0, 300, g => ({ reloadMul: r2(0.95 - 0.03 * g), kickV: r2(0.97 - 0.01 * g) }));
fam('gr_e', 'grip', 'Ergo Grip', '🪝', 'agrip', CARB, 0, 420, g => ({ reloadMul: r2(0.92 - 0.04 * g), spreadMul: r2(0.97 - 0.01 * g) }));
fam('gr_h', 'grip', 'Hand Stop', '🪝', 'stubby', CARB, 0, 320, g => ({ kickV: r2(0.92 - 0.03 * g), kickH: r2(0.92 - 0.03 * g) }));
fam('mg_e', 'mag', 'Extended Magazine', '📦', 'mag', MAGM, 0, 520, g => ({ magMul: r2(1.25 + 0.15 * g), reloadMul: r2(1.06 + 0.04 * g) }));
fam('mg_q', 'mag', 'Quick-Draw Magazine', '📦', 'mag', MAGM, 0, 560, g => ({ reloadMul: r2(0.88 - 0.08 * g), magMul: 1.1 }));
fam('mg_d', 'mag', 'Drum Magazine', '🥁', 'drum', ['smg', 'carbine', 'ak', 'battle'], 0, 900, g => ({ magMul: r2(2.0 + 0.3 * g), reloadMul: r2(1.25 + 0.05 * g) }));
fam('sd_l', 'side', 'Laser Sight', '🔺', 'laser', NOREV, 0, 420, g => ({ spreadMul: r2(0.93 - 0.03 * g) }));
fam('sd_f', 'side', 'Tactical Light', '🔦', 'flashlight', NOREV, 0, 300, g => ({ spreadMul: r2(0.99 - 0.01 * g) }));
fam('sd_i', 'side', 'IR Laser', '🟣', 'laser', NOREV, 0, 650, g => ({ spreadMul: r2(0.92 - 0.04 * g) }));
fam('st_s', 'stock', 'Skeleton Stock', '🧱', 'stock', STOCKM, 0, 380, g => ({ kickV: r2(0.96 - 0.03 * g), reloadMul: r2(0.97 - 0.02 * g) }));
fam('st_p', 'stock', 'Padded Stock', '🧱', 'stock', STOCKM, 0, 460, g => ({ kickV: r2(0.9 - 0.05 * g), kickH: r2(0.92 - 0.04 * g), reloadMul: 1.03 }));
fam('st_h', 'stock', 'Heavy Stock', '🧱', 'stock', STOCKM, 0, 520, g => ({ kickV: r2(0.85 - 0.05 * g), kickH: r2(0.88 - 0.04 * g), reloadMul: 1.07 }));
fam('br_s', 'barrel', 'Short Barrel', '📏', 'barrel', NOREV, 0, 360, g => ({ reloadMul: r2(0.93 - 0.02 * g), rangeMul: r2(0.9 - 0.02 * g), spreadMul: 1.03 }));
fam('br_l', 'barrel', 'Long Barrel', '📏', 'barrel', NOREV, 0, 520, g => ({ rangeMul: r2(1.15 + 0.1 * g), spreadMul: r2(0.95 - 0.03 * g), reloadMul: 1.03 }));
fam('br_m', 'barrel', 'Match Barrel', '📏', 'barrel', NOREV, 0, 780, g => ({ spreadMul: r2(0.9 - 0.04 * g), rangeMul: r2(1.1 + 0.05 * g) }));
fam('br_h', 'barrel', 'Heavy Barrel', '📏', 'barrel', NOREV, 0, 640, g => ({ kickV: r2(0.9 - 0.04 * g), rateMul: 0.96, dmgMul: r2(1.02 + 0.015 * g) }));
R_ATT_SLOTS.push(['stock', 'Stock'], ['barrel', 'Barrel']);
// better stats function: base + preinstalled parts (variants) + the player's parts; also fire rate / range multipliers
rGunStats = function (weaponId, mods) {
  const base = R_GUN[weaponId], all = Object.assign({}, base.preMods || {}, mods || {});
  const s = Object.assign({}, base, { spreadMul: 1, suppressed: false, dmgMul: base.dmgMul || 1, reloadMul: 1, rateMul: base.rateMul || 1, rangeMul: base.rangeMul || 1 });
  Object.keys(all).forEach(slot => {
    const a = R_ATT[all[slot]]; if (!a || !rAttFits(all[slot], weaponId)) return;
    if (a.zoomSet) s.zoom = Math.max(s.zoom, a.zoomSet); if (a.zoomAdd) s.zoom += a.zoomAdd; if (a.scope) s.scope = true;
    if (a.spreadMul) s.spreadMul *= a.spreadMul; if (a.kickV) s.kickV *= a.kickV; if (a.kickH) s.kickH *= a.kickH;
    if (a.magMul) s.mag = Math.round(s.mag * a.magMul); if (a.reloadMul) { s.reload *= a.reloadMul; s.tac *= a.reloadMul; }
    if (a.suppressed) s.suppressed = true; if (a.dmgMul) s.dmgMul *= a.dmgMul; if (a.rateMul) s.rateMul *= a.rateMul; if (a.rangeMul) s.rangeMul *= a.rangeMul;
  });
  return s;
};

// ───────────────────────── ammunition ─────────────────────────
const BASE_AMMO = { '9mm': '9mm_fmj', '45': '45_fmj', '357': '357_fmj', '556': '556_fmj', '545': '545_fmj', '762': '762_fmj', '762x39': '762x39_fmj', '12g': '12g_buck', '338': '338_ap' };
const AMMO_VARIANTS = [
  ['jhp', 'Hollow Point', 1.18, -1, 1.4, {}], ['p', '+P', 1.1, 0, 1.5, {}], ['tr', 'Tracer', 0.95, 0, 1.2, { tracerBright: true }], ['sub', 'Subsonic', 0.9, 0, 1.3, { sub: true }],
  ['match', 'Match', 1.05, 1, 1.8, { acc: 0.92 }], ['inc', 'Incendiary', 1.0, 0, 2.2, { fire: true }], ['ap2', 'AP+ Tungsten', 0.92, 2, 2.6, {}], ['std', 'Standard Ball', 1.0, 0, 0.85, {}]
];
Object.keys(BASE_AMMO).forEach(cal => {
  const b = R_AMMO[BASE_AMMO[cal]]; if (!b) return;
  AMMO_VARIANTS.forEach(v => {
    const id = cal + '_' + v[0]; if (R_AMMO[id]) return;
    R_AMMO[id] = Object.assign({ cal, name: `${R_CAL_NAMES[cal]} ${v[1]}`, dmg: Math.round(b.dmg * v[2]), pen: Math.max(1, Math.min(8, b.pen + v[3])), price: Math.max(1, Math.round(b.price * v[4] * 10) / 10), tracer: v[5].tracerBright ? 0x66ffcc : b.tracer, pellets: b.pellets }, v[5]);
  });
});
// shotgun specials
Object.assign(R_AMMO, {
  '12g_flech': { cal: '12g', name: '12ga Flechette', dmg: 14, pen: 5, price: 7, tracer: 0xffffff, pellets: 8 }, '12g_fire': { cal: '12g', name: '12ga Dragon Breath', dmg: 9, pen: 1, price: 9, tracer: 0xff8a33, pellets: 10, fire: true },
  '12g_bird': { cal: '12g', name: '12ga Birdshot', dmg: 6, pen: 0.5, price: 1.5, tracer: 0xffffff, pellets: 14 }, '12g_magnum': { cal: '12g', name: '12ga Magnum Buck', dmg: 14, pen: 2, price: 5, tracer: 0xffffff, pellets: 8 }
});

// ───────────────────────── armor, helmets, backpacks ─────────────────────────
const VEST_NAMES = { 1: ['Padded Jacket', 'Kevlar Vest', 'Work Vest'], 2: ['Soft Vest', 'Police Vest', 'Trauma Vest'], 3: ['Plate Carrier', 'Tactical Carrier', 'Light Rig'], 4: ['Heavy Plates', 'Assault Carrier', 'Riot Armor'], 5: ['Operator Armor', 'Ceramic Plates', 'Fortress Rig'], 6: ['Spartan Suit', 'Titan Plates', 'Warlord Armor'] };
const BUILD = [['Light', 0.7, 0.7, 1.0], ['Standard', 1, 1, 0.97], ['Reinforced', 1.35, 1.5, 0.92]];       // [name, durability, price, speed]
Object.keys(VEST_NAMES).forEach(ac => { ac = +ac; VEST_NAMES[ac].forEach((n, ni) => BUILD.forEach((b, bi) => {
  const id = `vest_g${ac}_${ni}${bi}`; R_ARMOR[id] = { slot: 'vest', name: `${n} (${b[0]}, AC${ac})`, ac, dur: Math.round((40 + ac * 22) * b[1]), price: Math.round((70 + Math.pow(ac, 2.6) * 55) * b[2] / 10) * 10, emoji: ac >= 5 ? '🛡️' : '🦺', speed: b[3] - (ac - 2) * 0.008 };
})); });
const HELM_NAMES = { 1: ['Baseball Cap', 'Bump Cap', 'Hood'], 2: ['Ballistic Cap', 'Patrol Helmet', 'Rider Helmet'], 3: ['Combat Helmet', 'Tactical Helmet', 'Bump Helmet'], 4: ['Heavy Helmet', 'Assault Helmet', 'Face-Shield Helmet'], 5: ['Elite Helmet', 'Titan Helmet', 'Juggernaut Helmet'] };
Object.keys(HELM_NAMES).forEach(ac => { ac = +ac; HELM_NAMES[ac].forEach((n, ni) => BUILD.forEach((b, bi) => {
  const id = `helm_g${ac}_${ni}${bi}`; R_ARMOR[id] = { slot: 'helmet', name: `${n} (${b[0]}, AC${ac})`, ac, dur: Math.round((24 + ac * 16) * b[1]), price: Math.round((60 + Math.pow(ac, 2.6) * 45) * b[2] / 10) * 10, emoji: ac >= 4 ? '⛑️' : '🪖', speed: 1 };
})); });
[['Small Pouch', 2], ['Daypack', 4], ['School Bag', 6], ['Hiking Pack', 8], ['Tactical Bag', 10], ['Assault Pack', 12], ['Raid Pack', 14], ['Expedition Pack', 16], ['Alpine Pack', 18], ['Rucksack', 20], ['Bergen', 22], ['Mega Pack', 24], ['Hauler', 26], ['Titan Pack', 30]].forEach((b, i) => {
  R_ARMOR['bag_' + (i + 1)] = { slot: 'bag', name: `${b[0]} (+${b[1]} slots)`, ac: 0, dur: 1, slots: b[1], price: Math.round((80 + b[1] * b[1] * 6) / 10) * 10, emoji: '🎒', speed: 1 - b[1] * 0.0016 };
});

// ───────────────────────── medicine (effects: bleed, heal, zone, pain, speed, regen, resist, steady, stam) ─────────────────────────
Object.assign(R_MED.bandage, { bleed: 1 }); Object.assign(R_MED.medkit, { bleed: 2, heal: 60 }); Object.assign(R_MED.painkiller, { pain: 90 });
Object.assign(R_MED, {
  gauze:       { name: 'Gauze Roll',        emoji: '🩹', price: 12,  use: 1.6, desc: 'Stops light bleeding fast', bleed: 1 },
  bandage_pro: { name: 'Pro Bandage',       emoji: '🩹', price: 40,  use: 2.0, desc: 'Stops bleeding, heals 8', bleed: 1, heal: 8 },
  tourniquet:  { name: 'Tourniquet',        emoji: '🪢', price: 55,  use: 3.0, desc: 'Stops even heavy bleeding', bleed: 2 },
  hemostat:    { name: 'Hemostatic Powder', emoji: '🧂', price: 85,  use: 2.5, desc: 'Stops all bleeding, heals 12', bleed: 2, heal: 12 },
  splint:      { name: 'Leg Splint',        emoji: '🦵', price: 70,  use: 4.0, desc: 'Fixes broken legs (legs to 40)', zone: 'legs', zoneMin: 40 },
  arm_splint:  { name: 'Arm Splint',        emoji: '💪', price: 60,  use: 3.5, desc: 'Fixes broken arms (arms to 35)', zone: 'arms', zoneMin: 35 },
  ifak:        { name: 'IFAK Kit',          emoji: '🧰', price: 130, use: 4.0, desc: 'Stops bleeding, heals 45', bleed: 2, heal: 45 },
  trauma:      { name: 'Trauma Kit',        emoji: '🚑', price: 220, use: 6.0, desc: 'Stops bleeding, heals 100', bleed: 2, heal: 100 },
  surgical:    { name: 'Surgical Kit',      emoji: '🏥', price: 380, use: 9.0, desc: 'Heals 160 and fixes limbs', bleed: 2, heal: 160, fixLimbs: true },
  painkiller_x:{ name: 'Strong Painkillers',emoji: '💊', price: 110, use: 2.0, desc: 'No limp/shake for 4 minutes', pain: 240 },
  morphine:    { name: 'Morphine',          emoji: '💉', price: 150, use: 1.5, desc: 'Pain gone 5 min, steadier aim', pain: 300, steady: 60 },
  adrenaline:  { name: 'Adrenaline',        emoji: '⚡', price: 160, use: 1.5, desc: 'Run faster for 30 s, refills stamina', speed: 30, stam: true },
  stim_speed:  { name: 'Speed Stim',        emoji: '🧪', price: 190, use: 1.2, desc: '+20% speed for 45 s', speed: 45 },
  stim_regen:  { name: 'Regen Stim',        emoji: '💚', price: 230, use: 1.5, desc: 'Heals 1.5 HP/s for 40 s', regen: [1.5, 40] },
  stim_resist: { name: 'Armor Stim',        emoji: '🛡️', price: 260, use: 1.5, desc: 'Take 20% less damage for 40 s', resist: 40 },
  stim_steady: { name: 'Steady Stim',       emoji: '🎯', price: 210, use: 1.5, desc: 'Recoil −25% for 60 s', steady: 60 },
  stim_combat: { name: 'Combat Cocktail',   emoji: '🔥', price: 420, use: 2.0, desc: 'Speed, regen and less damage for 30 s', speed: 30, regen: [1.2, 30], resist: 30, steady: 30 },
  antibiotic:  { name: 'Antibiotics',       emoji: '💊', price: 75,  use: 2.0, desc: 'Heals 25', heal: 25 },
  salve:       { name: 'Healing Salve',     emoji: '🫙', price: 65,  use: 2.5, desc: 'Heals 35 over time', regen: [1.2, 30] },
  burn_gel:    { name: 'Burn Gel',          emoji: '🧴', price: 45,  use: 2.0, desc: 'Heals 20', heal: 20 },
  vitamins:    { name: 'Vitamins',          emoji: '🍊', price: 35,  use: 1.5, desc: 'Heals 10, refills stamina', heal: 10, stam: true },
  water:       { name: 'Bottled Water',     emoji: '💧', price: 8,   use: 1.5, desc: 'Refills stamina', stam: true },
  energy_bar:  { name: 'Energy Bar',        emoji: '🍫', price: 12,  use: 1.5, desc: 'Refills stamina, heals 5', stam: true, heal: 5 },
  energy_drink:{ name: 'Energy Drink',      emoji: '🥤', price: 30,  use: 1.5, desc: 'Speed for 25 s, refills stamina', speed: 25, stam: true },
  honey:       { name: 'Jar of Honey',      emoji: '🍯', price: 50,  use: 2.0, desc: 'Heals 30', heal: 30 },
  field_ration:{ name: 'Field Ration',      emoji: '🥫', price: 40,  use: 3.0, desc: 'Heals 25, refills stamina', heal: 25, stam: true },
  eye_drops:   { name: 'Eye Drops',         emoji: '👁️', price: 18,  use: 1.0, desc: 'Clears flash-bang blindness', unflash: true },
  cold_med:    { name: 'Cold Medicine',     emoji: '🤧', price: 25,  use: 2.0, desc: 'Heals 8', heal: 8 },
  splint_kit:  { name: 'Limb Repair Kit',   emoji: '🛠️', price: 140, use: 5.0, desc: 'Fixes legs AND arms (to 40)', zone: 'legs', zoneMin: 40, fixLimbs: true }
});

// ───────────────────────── throwables ─────────────────────────
//  kind: frag (explodes after fuse), impact (explodes on contact), smoke (blocks sight), flash (blinds), fire (burns)
const R_NADE = window.R_NADE = {
  frag_1:  { kind: 'frag',   name: 'Frag Grenade',        emoji: '💣', price: 140, dmg: 170, radius: 6.5, fuse: 3.4 }, frag_2: { kind: 'frag', name: 'Heavy Frag',     emoji: '💣', price: 260, dmg: 230, radius: 7.5, fuse: 3.4 }, frag_3: { kind: 'frag', name: 'Mini Frag', emoji: '💣', price: 90, dmg: 120, radius: 5, fuse: 2.8 },
  impact_1:{ kind: 'impact', name: 'Impact Grenade',      emoji: '🧨', price: 190, dmg: 150, radius: 5.5, fuse: 6 },    impact_2: { kind: 'impact', name: 'Heavy Impact', emoji: '🧨', price: 320, dmg: 210, radius: 6.5, fuse: 6 },
  smoke_1: { kind: 'smoke',  name: 'Smoke Grenade',       emoji: '☁️', price: 70,  radius: 7, time: 18, col: 0xdddddd, fuse: 1.4 }, smoke_2: { kind: 'smoke', name: 'Big Smoke', emoji: '☁️', price: 130, radius: 10, time: 24, col: 0xcfd6dc, fuse: 1.4 }, smoke_3: { kind: 'smoke', name: 'Black Smoke', emoji: '🌑', price: 110, radius: 8, time: 20, col: 0x2a2a2e, fuse: 1.4 },
  flash_1: { kind: 'flash',  name: 'Flash-Bang',          emoji: '✨', price: 120, radius: 18, time: 6, fuse: 1.8 }, flash_2: { kind: 'flash', name: 'Stun Grenade',  emoji: '✨', price: 210, radius: 24, time: 9, fuse: 1.8 },
  fire_1:  { kind: 'fire',   name: 'Molotov',             emoji: '🔥', price: 100, dmg: 14, radius: 4, time: 8, fuse: 0.01 }, fire_2: { kind: 'fire', name: 'Thermite Grenade', emoji: '🔥', price: 240, dmg: 24, radius: 5, time: 10, fuse: 2.0 }, fire_3: { kind: 'fire', name: 'Incendiary Bomb', emoji: '🔥', price: 300, dmg: 20, radius: 7, time: 12, fuse: 2.2 }
};

// ───────────────────────── weapon variants ─────────────────────────
const FIN = { black: 0x2a2c30, tan: 0x8c7d5a, olive: 0x4a5238, white: 0xd6dade, camo: 0x55603f, gold: 0xc8a13a, chrome: 0xb8bcc2, blue: 0x28384e, red: 0x7a2424 };
const OPTIC_FOR = { pistol: 'opt_reflex_1', pistol45: 'opt_reflex_2', revolver: null, smg: 'opt_red_2', shotgun: 'opt_red_1', shotgunSemi: 'opt_red_2', sniper: 'opt_x8', hunter: 'opt_x4', dmr: 'opt_x6', carbine: 'opt_holo_2', ak: 'opt_red_2', battle: 'opt_x3', lmg: 'opt_holo_1' };
const VARS = [
  { k: 'compact', n: 'Compact', price: 0.85, rate: 1.06, range: 0.86, spread: 1.1, kickV: 0.9, kickH: 0.9, reload: 0.88, mag: 0.82, fin: 'tan', len: 0.9 },
  { k: 'tactical', n: 'Tactical', price: 1.3, spread: 0.92, kickV: 0.94, kickH: 0.9, fin: 'black', pre: m => ({ optic: OPTIC_FOR[m], grip: 'gr_v2' }) },
  { k: 'cqb', n: 'CQB', price: 1.15, rate: 1.1, range: 0.82, spread: 0.9, reload: 0.86, fin: 'olive', pre: () => ({ side: 'sd_l1' }) },
  { k: 'marksman', n: 'Marksman', price: 1.45, rate: 0.88, range: 1.3, spread: 0.72, kickV: 1.05, fin: 'camo', len: 1.1, pre: m => ({ optic: m === 'revolver' ? null : OPTIC_FOR.dmr, barrel: 'br_l1' }) },
  { k: 'heavy', n: 'Heavy', price: 1.4, rate: 0.9, dmg: 1.1, kickV: 1.2, kickH: 1.1, mag: 1.25, fin: 'blue' },
  { k: 'silent', n: 'Silent', price: 1.5, dmg: 0.96, spread: 0.95, kickV: 0.92, fin: 'black', pre: () => ({ muzzle: 'mz_sup_2' }) },
  { k: 'match', n: 'Match Grade', price: 1.65, rate: 0.92, spread: 0.7, range: 1.1, fin: 'chrome', pre: () => ({ barrel: 'br_m1' }) },
  { k: 'elite', n: 'Elite', price: 2.0, rate: 1.08, spread: 0.85, kickV: 0.85, kickH: 0.85, reload: 0.9, mag: 1.12, fin: 'gold', pre: m => ({ optic: OPTIC_FOR[m], muzzle: 'mz_cmp_3' }) },
  { k: 'proto', n: 'Prototype', price: 2.4, rate: 1.2, dmg: 1.06, spread: 0.82, kickV: 1.1, range: 1.15, fin: 'red', pre: () => ({ stock: 'st_p2', mag: 'mg_q2' }) }
];
const baseList = WEAPON_CATALOG.filter(w => R_GUN[w.id] && !w.variantOf).slice();
baseList.forEach(w => {
  const g = R_GUN[w.id];
  VARS.forEach(v => {
    const id = w.id + '__' + v.k, tier = Math.round(Math.max(w.tier, 1.01) * Math.pow(v.price, 0.5556) * 100) / 100;
    const pre = v.pre ? v.pre(g.model) : null; const preClean = {}; if (pre) Object.keys(pre).forEach(s => { if (pre[s] && R_ATT[pre[s]] && rAttFits(pre[s], w.id)) preClean[s] = pre[s]; });
    const calAmmo = R_AMMO[R_CAL_DEFAULT[g.cal]];
    WEAPON_CATALOG.push({ id, name: `${w.name} ${v.n}`, cat: w.cat, tier, dmg: w.dmg, fireRate: Math.round(w.fireRate * (v.rate || 1) * 100) / 100, range: Math.round(w.range * (v.range || 1)), spread: w.spread * (v.spread || 1), pellets: w.pellets, variantOf: w.id, finish: v.fin, lenScale: v.len || 1 });
    R_GUN[id] = Object.assign({}, g, { mag: Math.max(2, Math.round(g.mag * (v.mag || 1))), reload: Math.round(g.reload * (v.reload || 1) * 100) / 100, tac: Math.round(g.tac * (v.reload || 1) * 100) / 100, kickV: Math.round(g.kickV * (v.kickV || 1) * 100) / 100, kickH: Math.round(g.kickH * (v.kickH || 1) * 100) / 100, dmgMul: v.dmg || 1, preMods: preClean, finish: v.fin, lenScale: v.len || 1, base: w.id });
    void calAmmo;
  });
});
WEAPON_CATALOG.sort((a, b) => a.tier - b.tier);

// ───────────────────────── items & loot ─────────────────────────
const _rItem2 = rItem;
rItem = function (id) {
  if (id.startsWith('gren:')) { const n = R_NADE[id.slice(5)]; if (n) return { id, kind: 'gren', name: n.name, emoji: n.emoji, value: Math.round(n.price * 0.5) }; }
  return _rItem2(id);
};
rSlotsFor = function (id, n) { return R_AMMO[id] ? Math.ceil(n / 60) : id.startsWith('wpn:') ? 2 * n : n; };
window.rPackCap = function (bag) { return 14 + (bag && R_ARMOR[bag.id] ? R_ARMOR[bag.id].slots : 0); };
// the new gear can be found in raids too
const rareAmmo = ['9mm_jhp', '556_ap2', '762_match', '545_inc', '762x39_p', '45_jhp', '12g_flech', '338_match'];
R_CONTAINERS.weaponbox.table.push(...Object.keys(R_NADE).slice(0, 8).map(k => ['gren:' + k, 3, 1, 2]), ...rareAmmo.map(a => [a, 3, 8, 20]), ['wpn:smg_mp5__tactical', 1, 1, 1], ['wpn:carbine_m4__cqb', 1, 1, 1], ['wpn:rifle_akm__silent', 0.6, 1, 1], ['att:opt_x3', 3, 1, 1], ['att:mz_cmp_2', 3, 1, 1], ['att:gr_v2', 3, 1, 1], ['att:st_p1', 3, 1, 1], ['att:br_l1', 2, 1, 1]);
R_CONTAINERS.locker.table.push(['gauze', 14, 1, 2], ['tourniquet', 5, 1, 1], ['splint', 4, 1, 1], ['water', 8, 1, 2], ['energy_bar', 8, 1, 2], ['bag_2', 3, 1, 1], ['bag_3', 2, 1, 1], ['vest_g2_01', 2, 1, 1], ['helm_g1_01', 3, 1, 1], ['helm_g2_01', 2, 1, 1]);
R_CONTAINERS.safe.table.push(['bag_5', 3, 1, 1], ['bag_7', 1.5, 1, 1], ['surgical', 2, 1, 1], ['stim_regen', 3, 1, 1], ['stim_combat', 1, 1, 1], ['adrenaline', 3, 1, 1], ['vest_g3_11', 2, 1, 1], ['vest_g4_01', 1, 1, 1], ['helm_g3_11', 2, 1, 1], ['helm_g4_01', 1, 1, 1], ['att:opt_x6', 2, 1, 1], ['att:mz_sup_3', 2, 1, 1], ['wpn:rifle_battle__match', 0.6, 1, 1]);
R_CONTAINERS.crate.table.push(['gren:smoke_1', 3, 1, 1], ['gren:frag_3', 2, 1, 1], ['water', 6, 1, 1], ['gauze', 6, 1, 2], ['bag_1', 3, 1, 1]);
R_ENEMY_DROPS.raider.push(['gren:frag_1', 0.1, 1, 1], ['tourniquet', 0.1, 1, 1], ['bag_2', 0.05, 1, 1]); R_ENEMY_DROPS.pmc.push(['gren:flash_1', 0.12, 1, 1], ['gren:smoke_1', 0.12, 1, 1], ['ifak', 0.12, 1, 1], ['bag_4', 0.06, 1, 1], ['stim_speed', 0.06, 1, 1]);
R_ENEMY_DROPS.boss.push(['gren:frag_2', 0.6, 1, 2], ['surgical', 0.4, 1, 1], ['bag_8', 0.3, 1, 1], ['stim_combat', 0.4, 1, 1]);
window.R_COUNTS = { guns: WEAPON_CATALOG.filter(w => R_GUN[w.id]).length, att: Object.keys(R_ATT).length, ammo: Object.keys(R_AMMO).length, armor: Object.keys(R_ARMOR).length, med: Object.keys(R_MED).length, nade: Object.keys(R_NADE).length };
})();
