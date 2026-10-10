// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — EXPLOX CITY  (🏙️ EXPLOX CITY button; also a pin on the world map)
//   The real map of the Explox game, at its real coordinates: Downtown with City Hall, the Transit Hub, Hotel, Church, Hospital, Library, the
//   shop row (Coffee, Toy, Outfit, Weapon), Pizza Place, the Pixel Palace Arcade, School, Theater, Sports Park, the Car Dealership, the Diner;
//   the City Bank (rob it!), the Trading Center, the Mansion, the Industrial District (Toy / Auto Parts / Robot Parts factories), the Scrapyard
//   in the south-east and the City Airport in the far west. Satan's Gate is where it always was.
//   And the killers from Explox: street KILLERS with knives, the Scrapyard ROBOTS (Scout, Guard, Drone, Tank, Spider, Elite), Satan's DEMONS
//   and cartel gunmen. Extract at the Transit Hub, the Airport, the factory Cargo Truck or the Mansion helipad.
// Uses the same engine as the Open World (raid-openworld.js): minimap, M map, bank alarm, loot, extraction.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const OW = window.OW, H = OW.h, R = window.RAID, OX = 110, OZ = 35;                                           // Explox coordinates → map coordinates (the city is centred in the arena)
const P = (x, z) => [x - OX, z - OZ];

// ───────── the Explox enemies ─────────
const E = (o) => Object.assign({ ac: 0, acHead: 0, ammo: '9mm_fmj', dmgMul: 1, acc: 0.35, burst: [1, 3], gap: 0.3, rest: [1, 2], sight: 40, pref: [10, 24], speed: 3, tier: 2, vest: 0x222222 }, o);
Object.assign(R_ENEMY, {
  robot_scout:  E({ name: 'Scout Bot', emoji: '🤖', hp: 55, dmgMul: 0.7, acc: 0.3, sight: 36, speed: 3.2, tier: 1, color: 0x557799, robot: 1 }),
  robot_guard:  E({ name: 'Guard Bot', emoji: '🤖', hp: 115, ac: 2, acHead: 2, ammo: '556_fmj', dmgMul: 0.9, acc: 0.4, speed: 2.7, tier: 2, color: 0x775555, robot: 1 }),
  robot_drone:  E({ name: 'Drone Bot', emoji: '🛸', hp: 35, dmgMul: 0.6, acc: 0.35, speed: 5.2, tier: 1, color: 0x33aadd, robot: 1, fly: 1 }),
  robot_tank:   E({ name: 'Tank Bot', emoji: '🛡️', hp: 270, ac: 6, acHead: 6, ammo: '762_ap', dmgMul: 1.2, acc: 0.35, burst: [3, 6], gap: 0.25, speed: 1.8, tier: 5, color: 0x557755, robot: 1 }),
  robot_spider: E({ name: 'Spider Bot', emoji: '🕷️', hp: 75, melee: true, dmg: 18, gap: 0.6, burst: [1, 1], rest: [0, 0], pref: [1, 2], speed: 5.4, tier: 2, color: 0x664477, robot: 1 }),
  robot_elite:  E({ name: 'Elite Bot', emoji: '👾', hp: 320, ac: 5, acHead: 5, ammo: '762_ap', dmgMul: 1.1, acc: 0.5, burst: [2, 5], gap: 0.18, sight: 55, speed: 3.3, tier: 6, color: 0x6a4a99, robot: 1 }),
  killer:       E({ name: 'Killer', emoji: '🔪', hp: 135, melee: true, dmg: 28, gap: 0.9, burst: [1, 1], rest: [0, 0], pref: [1, 2], speed: 4.4, tier: 3, color: 0x14110f, vest: 0x2b0a0a }),
  demon:        E({ name: 'Demon', emoji: '👹', hp: 340, ac: 3, acHead: 3, melee: true, dmg: 42, gap: 1.1, burst: [1, 1], rest: [0, 0], pref: [1, 2], speed: 3.7, tier: 6, color: 0x1a0022 }),
  cartel:       E({ name: 'Cartel Gunman', emoji: '🕶️', hp: 135, ac: 3, acHead: 2, ammo: '556_fmj', acc: 0.42, burst: [2, 4], gap: 0.2, sight: 48, speed: 3.2, tier: 3, color: 0x2a2a2e, vest: 0x7a1f1f })
});
Object.assign(R_ENEMY_DROPS, {
  robot_scout: [['scrap_metal', 0.8, 1, 3], ['wires', 0.6, 1, 2], ['circuit', 0.25, 1, 1]], robot_guard: [['scrap_metal', 0.9, 2, 4], ['wires', 0.6, 1, 3], ['circuit', 0.35, 1, 1], ['556_fmj', 0.4, 6, 12]],
  robot_drone: [['wires', 0.7, 1, 2], ['circuit', 0.3, 1, 1]], robot_tank: [['scrap_metal', 1, 3, 6], ['circuit', 0.6, 1, 2], ['gpu', 0.2, 1, 1], ['762_ap', 0.5, 8, 16]],
  robot_spider: [['scrap_metal', 0.8, 1, 3], ['wires', 0.5, 1, 2]], robot_elite: [['gpu', 0.5, 1, 1], ['circuit', 0.8, 1, 2], ['762_ap', 0.6, 10, 20], ['gold_watch', 0.25, 1, 1], ['hard_drive', 0.3, 1, 1]],
  killer: [['cash_roll', 0.35, 1, 1], ['bandage', 0.4, 1, 1], ['gold_watch', 0.15, 1, 1], ['9mm_fmj', 0.5, 8, 16]], demon: [['gold_bar', 0.5, 1, 1], ['medkit', 0.5, 1, 1], ['gold_watch', 0.5, 1, 2], ['helm_3', 0.2, 1, 1]],
  cartel: [['556_fmj', 0.85, 10, 24], ['cash_roll', 0.45, 1, 2], ['bandage', 0.35, 1, 1], ['vest_2', 0.2, 1, 1], ['gold_watch', 0.2, 1, 1]]
});

// robot / demon bodies (blocky Explox style, with proper hit zones)
function robotMesh(type, def) {
  const g = new THREE.Group(), col = def.color, body = new THREE.MeshStandardMaterial({ color: col, metalness: 0.6, roughness: 0.45 }), dark = new THREE.MeshStandardMaterial({ color: 0x1b1d20, metalness: 0.8, roughness: 0.4 }), glow = new THREE.MeshBasicMaterial({ color: type === 'demon' ? 0xb04aff : 0xff3a3a });
  const P3 = (w, h, d, x, y, z, mat, zone) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.userData.zone = zone; g.add(m); return m; };
  const eyes = (y, z, s) => [-1, 1].forEach(k => P3(0.07 * s, 0.05 * s, 0.03, k * 0.09 * s, y, z, glow, 'head'));
  const gun = (x, y, len) => { P3(0.08, 0.1, len, x, y, len / 2 + 0.12, dark, 'arms'); g.userData.muzzle = new THREE.Vector3(x, y, len + 0.2); };
  const k = type.replace('robot_', '');
  if (k === 'scout') { [-1, 1].forEach(s => P3(0.13, 0.8, 0.15, s * 0.1, 0.4, 0, body, 'legs')); P3(0.42, 0.55, 0.26, 0, 1.1, 0, body, 'chest'); P3(0.28, 0.26, 0.24, 0, 1.55, 0, body, 'head'); eyes(1.57, 0.13, 1.3); [-1, 1].forEach(s => P3(0.1, 0.5, 0.1, s * 0.3, 1.05, 0.05, dark, 'arms')); gun(0.28, 1.1, 0.5); P3(0.03, 0.3, 0.03, 0.08, 1.85, 0, dark, 'head'); }
  else if (k === 'guard') { [-1, 1].forEach(s => P3(0.2, 0.9, 0.22, s * 0.16, 0.45, 0, body, 'legs')); P3(0.7, 0.7, 0.38, 0, 1.25, 0, body, 'chest'); P3(0.9, 0.18, 0.4, 0, 1.58, 0, dark, 'chest'); P3(0.3, 0.28, 0.28, 0, 1.78, 0, body, 'head'); eyes(1.8, 0.15, 1.5); [-1, 1].forEach(s => P3(0.16, 0.6, 0.16, s * 0.46, 1.2, 0.05, dark, 'arms')); gun(0.46, 1.2, 0.7); }
  else if (k === 'drone') { P3(0.5, 0.26, 0.5, 0, 2.2, 0, body, 'chest'); P3(0.26, 0.18, 0.26, 0, 2.02, 0.12, glow, 'head'); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => { P3(0.6, 0.03, 0.12, c[0] * 0.42, 2.34, c[1] * 0.42, dark, 'arms'); }); gun(0, 2.1, 0.4); }
  else if (k === 'tank') { P3(1.6, 0.5, 2.0, 0, 0.5, 0, dark, 'legs'); [-1, 1].forEach(s => P3(0.35, 0.55, 2.2, s * 0.85, 0.35, 0, dark, 'legs')); P3(1.3, 0.7, 1.4, 0, 1.1, 0, body, 'chest'); P3(0.6, 0.4, 0.6, 0, 1.65, 0, body, 'head'); eyes(1.68, 0.31, 2); P3(0.2, 0.2, 1.5, 0, 1.55, 1.0, dark, 'arms'); g.userData.muzzle = new THREE.Vector3(0, 1.55, 1.8); }
  else if (k === 'spider') { P3(0.8, 0.35, 1.0, 0, 0.7, 0, body, 'chest'); P3(0.4, 0.3, 0.4, 0, 0.78, 0.6, body, 'head'); eyes(0.8, 0.82, 1.2); for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, z = -0.35 + (i >> 1) * 0.35; const l = P3(0.9, 0.08, 0.08, s * 0.8, 0.45, z, dark, 'legs'); l.rotation.z = s * 0.7; } g.userData.muzzle = new THREE.Vector3(0, 0.8, 0.9); }
  else if (k === 'elite') { [-1, 1].forEach(s => P3(0.22, 1.0, 0.24, s * 0.18, 0.5, 0, body, 'legs')); P3(0.72, 0.8, 0.4, 0, 1.4, 0, body, 'chest'); P3(1.0, 0.2, 0.46, 0, 1.78, 0, dark, 'chest'); P3(0.32, 0.32, 0.3, 0, 2.05, 0, body, 'head'); eyes(2.07, 0.16, 1.7); P3(0.5, 0.1, 0.1, 0, 2.3, 0, glow, 'head'); [-1, 1].forEach(s => P3(0.18, 0.7, 0.18, s * 0.5, 1.4, 0.06, dark, 'arms')); gun(0.5, 1.4, 0.85); const cape = P3(0.7, 1.0, 0.04, 0, 1.3, -0.26, new THREE.MeshStandardMaterial({ color: 0x3a2a66, roughness: 0.9 }), 'chest'); void cape; }
  else if (type === 'demon') { [-1, 1].forEach(s => P3(0.34, 1.2, 0.34, s * 0.24, 0.6, 0, body, 'legs')); P3(0.95, 1.1, 0.5, 0, 1.75, 0, body, 'chest'); P3(0.9, 0.9, 0.9, 0, 2.75, 0, body, 'head'); [-1, 1].forEach(s => { P3(0.14, 0.14, 0.05, s * 0.22, 2.82, 0.46, glow, 'head'); const horn = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.6, 6), dark); horn.position.set(s * 0.34, 3.32, 0); horn.rotation.z = -s * 0.35; horn.userData.zone = 'head'; g.add(horn); P3(0.32, 1.0, 0.32, s * 0.68, 1.75, 0.1, body, 'arms'); }); }
  if (!g.userData.muzzle) g.userData.muzzle = new THREE.Vector3(0.1, 1.3, 0.5);
  g.userData.isEnemyRoot = true; return g;
}
const baseMesh = window.rdBuildEnemyMesh;
window.rdBuildEnemyMesh = function (type, def) {
  if (type.startsWith('robot_') || type === 'demon') return robotMesh(type, def);
  if (type === 'killer') return baseMesh('knifer', def);
  if (type === 'cartel') return baseMesh('raider', def);
  return baseMesh(type, def);
};

// ───────── the map ─────────
const LAND = [   // name, emoji, explox x, z, w, d, h, colour
  ['City Hall', '🏛️', 0, -35, 30, 20, 16, 0xd8d2c0], ['S.I.T.S. Transit Hub', '🚇', 0, 50, 26, 18, 9, 0x3a6ea5], ['City Hotel', '🏨', -15, 4, 18, 14, 26, 0xb08d57], ['Church', '⛪', -40, 22, 14, 18, 14, 0xe8e0d0],
  ['City Hospital', '🏥', -40, 74, 22, 18, 14, 0xf0f0f0], ['Library', '📚', -75, 60, 18, 14, 10, 0x8a6b4e], ['Police HQ', '🚔', -68, 10, 16, 14, 9, 0x2f4f8f], ['Shady Alley', '🕴️', 34, 3, 7, 7, 5, 0x3a3a3a],
  ['Coffee Shop', '☕', 58, 54, 10, 9, 6, 0xc9a37a], ['Toy Store', '🧸', 44, 54, 10, 9, 6, 0xe8b04a], ['Outfit Shop', '👗', 70, 54, 10, 9, 6, 0xd07aa0], ['Weapon Shop', '⚔️', 84, 54, 10, 9, 6, 0x5a6a52],
  ['School', '🏫', 70, 80, 26, 16, 9, 0xb8553a], ['Computer Shop', '💻', 100, 58, 12, 10, 6, 0x4a6a8a], ['Car Dealership', '🚗', 130, 35, 24, 14, 6, 0x7a8a9a], ['The Diner', '🍽️', 110, -13, 14, 10, 5, 0xc84a3a],
  ['Your Store', '🏪', 160, -13, 12, 10, 5, 0x4a9a6a], ['Pizza Place', '🍕', 20, 88, 14, 10, 6, 0xd8603a], ['Pixel Palace Arcade', '🕹️', 40, 100, 14, 10, 7, 0x6a3ab0], ['Movie Theater', '🎬', 50, -72, 24, 16, 12, 0x7a1f2f],
  ['Trading Center', '📈', 210, 210, 22, 16, 22, 0x5a8aaa], ['The Mansion', '🏠', 300, 113, 26, 20, 14, 0xe0d8c8], ['Toy Factory', '🧸', 240, -55, 30, 24, 16, 0x4a7fd6], ['Auto Parts Factory', '🔧', 330, -55, 30, 24, 16, 0xc8742a], ['Robot Parts Factory', '⚙️', 420, -55, 30, 24, 16, 0x8a8f96],
  ['Airport Terminal', '✈️', -200, -182, 34, 16, 9, 0xcfd6dc], ['Airport Hangar', '🛩️', -250, -182, 24, 22, 11, 0x7a828a]
];
function landmark(L) {
  const [name, emoji, ex, ez, w, d, h, color] = L, [x, z] = P(ex, ez); const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, map: H.winTex(Math.max(w, d), h) });
  H.box(w, h, d, x, h / 2, z, mat); H.box(w + 0.5, 0.5, d + 0.5, x, h + 0.25, z, H.stdMat(0x4a4540), false); H.col(x, z, w, d, false);
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(12, w), 2.2), new THREE.MeshBasicMaterial({ map: H.signTex(name.toUpperCase(), emoji + ' EXPLOX') })); sc.position.set(x, Math.min(h - 1.5, 4), z + d / 2 + 0.06); scene.add(sc);
  OW.labels.push({ x, z, name: emoji + ' ' + name, dy: d / 2 + 6 });
  if (name === 'Weapon Shop') { H.placeContainer('weaponbox', x - 2, z + d / 2 + 2); H.placeContainer('weaponbox', x + 2, z + d / 2 + 2); }
  else if (name === 'City Hospital') { for (let i = 0; i < 3; i++) H.placeContainer('locker', x - 6 + i * 6, z + d / 2 + 1.5); }
  else if (/Factory/.test(name)) { for (let i = 0; i < 3; i++) H.placeContainer('crate', x - 8 + i * 8, z + d / 2 + 3); H.placeContainer('safe', x + w / 2 + 3, z); }
  else if (/Hall|Trading|Mansion|Hotel|Hangar|Terminal/.test(name)) { H.placeContainer('safe', x + w / 2 + 2, z + 2); H.placeContainer('locker', x - w / 2 - 2, z + 2); }
  else if (!/Shady/.test(name)) H.placeContainer(Math.random() < 0.5 ? 'crate' : 'locker', x + w / 2 + 2, z - 1);
}
function monument() { const [x, z] = P(0, -10); H.box(5, 1.2, 5, x, 0.6, z, H.stdMat(0xb8b0a0)); H.box(1.6, 7, 1.6, x, 4.7, z, H.stdMat(0xc8c0b0)); const k = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10), H.stdMat(0xd8b24a, { metalness: 0.8, roughness: 0.3 })); k.position.set(x, 8.9, z); scene.add(k); H.col(x, z, 5, 5, false); OW.labels.push({ x, z, name: '👑 King Explox Monument', dy: 8 }); }
function satanGate() {
  const [x, z] = P(-40, 3), red = new THREE.MeshStandardMaterial({ color: 0x3a0808, emissive: 0x5a0a0a, roughness: 0.7 }), fire = new THREE.MeshBasicMaterial({ color: 0xff5a1a, transparent: true, opacity: 0.8 });
  H.box(3, 11, 3, x - 5, 5.5, z, red); H.box(3, 11, 3, x + 5, 5.5, z, red); H.box(13, 3, 3, x, 11, z, red); H.col(x - 5, z, 3, 3, false); H.col(x + 5, z, 3, 3, false);
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(7, 9), fire); portal.position.set(x, 4.8, z); scene.add(portal); const L = new THREE.PointLight(0xff4a10, 2.2, 38); L.position.set(x, 5, z + 2); scene.add(L);
  OW.labels.push({ x, z, name: '😈 Satan\'s Gate', dy: 14 }); H.placeContainer('bankvault', x + 9, z + 3, undefined, {});
  for (let i = 0; i < 3; i++) { const e = H.spawnEnemy('demon', x + (i - 1) * 6, z + 6 + i * 2); e.home = { x, z: z + 8 }; e.wp = { x: e.home.x, z: e.home.z }; }
}
function scrapyard() {
  const [x, z] = P(300, 250); const rust = H.stdMat(0x7a4a2a, { roughness: 1 }), metal = H.stdMat(0x66696d, { metalness: 0.6, roughness: 0.6 });
  for (let k = 0; k < 24; k++) { const a = k / 24 * 6.2832; if (k % 6 === 0) continue; H.box(5, 3, 1, x + Math.cos(a) * 34, 1.5, z + Math.sin(a) * 34, metal).rotation.y = -a + 1.5708; H.col(x + Math.cos(a) * 34, z + Math.sin(a) * 34, 5, 1, false, 0.2); }
  for (let k = 0; k < 26; k++) { const px = x + H.rr(-26, 26), pz = z + H.rr(-26, 26), s = H.rr(2, 5); H.box(s, s * 0.7, s, px, s * 0.35, pz, k % 2 ? rust : metal).rotation.y = H.rr(0, 3); H.col(px, pz, s, s, false, 0.2); }
  for (let k = 0; k < 5; k++) H.placeContainer(k % 2 ? 'safe' : 'crate', x + H.rr(-20, 20), z + H.rr(-20, 20));
  OW.labels.push({ x, z, name: '🤖 Scrapyard', dy: 38 }); const types = ['robot_scout', 'robot_scout', 'robot_guard', 'robot_drone', 'robot_drone', 'robot_tank', 'robot_spider', 'robot_spider', 'robot_elite'];
  for (let k = 0; k < 16; k++) { for (let t = 0; t < 12; t++) { const px = x + H.rr(-28, 28), pz = z + H.rr(-28, 28); if (!H.free(px, pz, 1.4)) continue; const e = H.spawnEnemy(types[k % types.length], px, pz); e.home = { x, z }; e.wp = { x: px, z: pz }; break; } }
}
function city() {
  OW.h.labelsReset(); const half = H.HALF;
  scene.background = new THREE.Color(0x8fb6e0); scene.fog = new THREE.Fog(0x8fb6e0, 60, 420); scene.add(new THREE.AmbientLight(0xffffff, 0.55)); const sun = new THREE.DirectionalLight(0xffeecc, 0.85); sun.position.set(40, 60, 20); scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(half * 2 + 700, half * 2 + 700), new THREE.MeshStandardMaterial({ color: 0x5a6b45, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // downtown paving + the real avenues
  const road = (x0, z0, x1, z1, wd) => { const [a, b] = P(x0, z0), [c, d] = P(x1, z1); H.plane(Math.abs(c - a) || wd, Math.abs(d - b) || wd, (a + c) / 2, (b + d) / 2, 0x2c2d30, 0.04, 0.9); };
  const [dx, dz] = P(30, 20); H.plane(260, 230, dx, dz, 0x4a4b4e, 0.035, 0.9);
  road(-230, 0, 460, 0, 10); road(-230, 90, 130, 90, 9); road(-230, -29, 460, -29, 9); road(0, -220, 0, 290, 10); road(100, -60, 100, 230, 9); road(-45, -220, -45, 100, 8); road(300, -60, 300, 270, 9); road(160, 0, 160, 230, 9); road(-200, -182, 0, -182, 8); road(-200, -182, -200, 0, 8);
  // sports park field + Pixel/uptown lot + airport runway
  const [spx, spz] = P(-10, -95); H.plane(60, 40, spx, spz, 0x3f8a3a, 0.05, 1); OW.labels.push({ x: spx, z: spz, name: '🏟️ Sports Park', dy: 24 });
  const [ulx, ulz] = P(60, 110); H.plane(30, 20, ulx, ulz, 0x3a3a3e, 0.05, 0.9); OW.labels.push({ x: ulx, z: ulz, name: '🅿️ Uptown Lot', dy: 14 });
  const [rwx, rwz] = P(-200, -215); H.plane(150, 14, rwx, rwz, 0x2a2a2e, 0.05, 0.9); H.plane(140, 0.6, rwx, rwz, 0xeeeeee, 0.06, 0.8);
  LAND.forEach(landmark); monument(); satanGate(); scrapyard();
  // the City Bank — a real vault to rob
  const [bx, bz] = P(160, 218); const b = H.buildBank(bx, bz, 'City Bank'); void b; OW.labels.push({ x: bx, z: bz, name: '🏦 City Bank', dy: 16 });
  // trees (the park, residential strips) + a few rocks
  for (let k = 0; k < 220; k++) { const x = H.rr(-half + 10, half - 10), z = H.rr(-half + 10, half - 10); if (!H.free(x, z, 3) || Math.hypot(x - dx, z - dz) < 60 && Math.random() < 0.8) continue; const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 2.2, 6), H.stdMat(0x5a4028)); tr.position.set(x, 1.1, z); scene.add(tr); const cr = new THREE.Mesh(new THREE.ConeGeometry(2, 5.5, 7), H.stdMat(0x2f5a2c)); cr.position.set(x, 4.6, z); cr.castShadow = true; scene.add(cr); H.col(x, z, 0.5, 0.5, false, 0.1); }
  for (let k = 0; k < 30; k++) { const a = k / 30 * 6.2832, r = half + H.rr(60, 140), hh = H.rr(50, 140), m = new THREE.Mesh(new THREE.ConeGeometry(H.rr(55, 100), hh, 7), H.stdMat(k % 5 ? 0x6b6a66 : 0xe8eef2)); m.position.set(Math.cos(a) * r, hh / 2 - 5, Math.sin(a) * r); scene.add(m); }
  // street loot
  for (let k = 0; k < 40; k++) for (let t = 0; t < 14; t++) { const x = H.rr(-300, 330), z = H.rr(-200, 250); if (!H.free(x, z, 1.4)) continue; const r = Math.random(); H.placeContainer(r < 0.45 ? 'crate' : r < 0.75 ? 'locker' : r < 0.92 ? 'weaponbox' : 'safe', x, z); break; }
  // people: killers on the streets, cartel at the bank / trading centre / mansion / airport, robots round the factories
  const group = (type, ex, ez, n, spread, home) => { for (let k = 0; k < n; k++) for (let t = 0; t < 12; t++) { const [cx, cz] = P(ex, ez), x = cx + H.rr(-spread, spread), z = cz + H.rr(-spread, spread); if (!H.free(x, z, 1.2)) continue; const e = H.spawnEnemy(type, x, z); e.home = { x: cx + H.rr(-home, home), z: cz + H.rr(-home, home) }; e.wp = { x, z }; break; } };
  group('killer', 20, 20, 8, 70, 40); group('killer', 120, 30, 4, 50, 30); group('killer', -60, 50, 4, 40, 25); group('killer', 60, -40, 3, 40, 25);
  group('cartel', 160, 235, 6, 25, 14); group('cartel', 210, 195, 5, 20, 12); group('cartel', 300, 113, 5, 25, 14); group('cartel', -200, -170, 5, 30, 16); group('cartel', 95, 200, 4, 30, 16);
  group('robot_guard', 240, -35, 3, 25, 12); group('robot_scout', 330, -35, 3, 25, 12); group('robot_drone', 420, -35, 3, 30, 14); group('robot_tank', 330, -20, 1, 10, 6); group('robot_elite', 420, -20, 1, 10, 6);
  group('demon', -40, 22, 1, 10, 6);
  const sp = [P(-45, -107), P(60, 128), P(-75, 80)][Math.floor(Math.random() * 3)]; R.spawn = { x: sp[0], z: sp[1] }; for (let k = 0; k < 30 && !H.free(R.spawn.x, R.spawn.z, 2); k++) { R.spawn.x += H.rr(-3, 3); R.spawn.z += H.rr(-3, 3); }
  enemies.forEach(e => { if (Math.hypot(e.mesh.position.x - R.spawn.x, e.mesh.position.z - R.spawn.z) < 55) { e.alive = false; scene.remove(e.mesh); } }); enemies = enemies.filter(e => e.alive);
  R.limit = 45 * 60; yaw = Math.atan2(R.spawn.x, R.spawn.z); if (camera) { camera.far = 1200; camera.updateProjectionMatrix(); }
}
window.rdBuildExplox = function () { clearMapScene(); city(); };
window.rdExploxExtracts = function () {
  [['S.I.T.S. Transit Hub', 0, 70], ['City Airport Jet', -200, -150], ['Factory Cargo Truck', 330, -15], ['Mansion Helipad', 300, 140]].forEach(e => {
    let [x, z] = P(e[1], e[2]); for (let k = 0; k < 40 && !H.free(x, z, 2); k++) { x += H.rr(-3, 3); z += H.rr(-3, 3); }
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.1, 32), new THREE.MeshBasicMaterial({ color: 0x22ff88, transparent: true, opacity: 0.35 })); ring.position.set(x, 0.1, z); scene.add(ring);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 60, 8), new THREE.MeshBasicMaterial({ color: 0x66ffaa, transparent: true, opacity: 0.35 })); beam.position.set(x, 30, z); scene.add(beam);
    RAID.extracts.push({ x, z, r: 4.5, ring, beam, name: e[0] }); OW.extracts.push({ x, z, name: e[0] });
  });
};
})();
