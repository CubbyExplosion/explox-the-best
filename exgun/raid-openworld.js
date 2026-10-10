// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — OPEN WORLD  (🌍 OPEN WORLD button on the sector screen; deploys like a normal raid, so your stash, gear and extraction all work)
//   A whole country, 720 m × 720 m — about 30× the area of a normal sector: 7 towns joined by roads, forests, mountains on the horizon,
//   6 military camps, loot crates and safes everywhere — and NO civilians, only hostile soldiers (scavs, raiders, knife fighters, PMCs).
//   🏦 5 BANKS to rob: walk in through the lobby, cross to the vault, and hold F on the safes (gold bars, cash, jewellery, hard drives).
//   The first safe you touch sets off the ALARM: sirens, every soldier nearby is alerted, and a reinforcement squad arrives from the hills.
//   Navigation: a minimap (top right) and a full world map on M. Extract at any of the 4 corner zones (green beams).
//   The world is the same every time (fixed seed) so you can learn where everything is; loot, patrols and weather are random.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const IDX = 101, IDX2 = 102, HALF = 360, R = window.RAID, rnd = (a, b) => a + Math.random() * (b - a), rint = (a, b) => Math.floor(a + Math.random() * (b - a + 1)), rdToast = (...a) => window.RDX.api.rdToast(...a);
function rollLoot(table, rolls) { const mul = R.diff ? R.diff.loot : 1, out = {}, n = rint(rolls[0], rolls[1]), tot = table.reduce((s, e) => s + e[1], 0); for (let i = 0; i < n; i++) { let r = Math.random() * tot, e = table[0]; for (const t of table) { r -= t[1]; if (r <= 0) { e = t; break; } } const base = rint(e[2], e[3]); out[e[0]] = (out[e[0]] || 0) + (R_AMMO[e[0]] ? Math.max(1, Math.round(base * mul)) : base); } return out; }
const OW = window.OW = { on: false, banks: [], towns: [], extracts: [], camps: [], prevHighest: 1 };
const origTheme = window.themeForMap, origName = window.mapNameForMap, origDiff = window.rDifficulty, origBuild = window.buildMapScene, origEnd = window.rdEnd;
const THEME = { name: 'Open World', style: 'ruin', sky: 0x9cc4ec, ground: 0x56683f, colors: [0xb9b2a4, 0xa39b8c, 0x8d8578, 0xc9c1b0] };
const THEME2 = { name: 'Explox City', style: 'ruin', sky: 0x8fb6e0, ground: 0x5a6b45, colors: [0xb9b2a4, 0xa39b8c] };
const DIFF2 = Object.assign({}, R_DIFFS[3], { id: 6, name: 'Explox City', color: '#c46aff', enemies: [0, 0], containers: [0, 0, 0, 0], time: 45, loot: 1.3, acc: 1.0, hp: 1.0, note: 'The real Explox map — killers, robots, demons and cartel.' });
const DIFF = Object.assign({}, R_DIFFS[2], { id: 5, name: 'Open World', color: '#6ad0ff', enemies: [0, 0], containers: [0, 0, 0, 0], time: 45, loot: 1.25, acc: 1.0, hp: 1.0, note: 'A whole country. Rob the banks, survive, extract.' });
window.themeForMap = i => i === IDX ? THEME : i === IDX2 ? THEME2 : origTheme(i);
window.mapNameForMap = i => i === IDX ? '🌍 OPEN WORLD' : i === IDX2 ? '🏙️ EXPLOX CITY' : origName(i);
window.rDifficulty = i => i === IDX ? DIFF : i === IDX2 ? DIFF2 : origDiff(i);
R_LOOT.gold_bar = { name: 'Gold Bar', emoji: '🪙', value: 950, w: 6 };
const BANKDEF = { name: 'Vault Safe', color: 0x8a6d1d, size: [1.4, 1.5, 0.9], rolls: [3, 4], table: [['gold_bar', 30, 1, 2], ['cash_roll', 40, 2, 3], ['gold_watch', 16, 1, 2], ['hard_drive', 9, 1, 1], ['laptop', 6, 1, 1], ['gpu', 6, 1, 1]] };
const TELLERDEF = { name: 'Teller Drawer', color: 0x555b60, size: [0.8, 0.5, 0.6], rolls: [1, 2], table: [['cash_roll', 60, 1, 2], ['gold_watch', 8, 1, 1], ['9mm_fmj', 20, 10, 24], ['bandage', 10, 1, 1]] };
R_CONTAINERS.bankvault = BANKDEF; R_CONTAINERS.teller = TELLERDEF;

// ───────── seeded random so the world is always the same ─────────
function rng32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let rg = rng32(90210); const rr = (a, b) => a + rg() * (b - a);

const TOWNS = [
  { name: 'Central City', x: 0, z: 0, c: 6, r: 6, bank: true }, { name: 'Port Haven', x: -250, z: -220, c: 5, r: 4, bank: true }, { name: 'Eastgate', x: 250, z: -200, c: 5, r: 4, bank: true },
  { name: 'Ridgeview', x: -260, z: 210, c: 4, r: 5, bank: true }, { name: 'Northfall', x: 230, z: 250, c: 5, r: 4, bank: true }, { name: 'Millford', x: -110, z: -120, c: 3, r: 3 }, { name: 'Stonebridge', x: 120, z: 110, c: 3, r: 3 }
];
const CAMPS = [[-300, -20], [300, 30], [-90, 290], [60, -300], [-170, 100], [180, -110]];
const SPAWNS = [[-335, 0], [335, 0], [0, -335], [0, 335]];
const EXTRACTS = [['NW Harbor Boat', -318, -318], ['NE Rail Depot', 318, -318], ['SW Airfield Heli', -318, 318], ['SE Border Gate', 318, 318]];

// ───────── building blocks ─────────
const winTexCache = {}; let winBase = null;
function winTex(w, h) {
  const key = Math.round(w / 3) + '_' + Math.round(h / 3); if (winTexCache[key]) return winTexCache[key];
  if (!winBase) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#d4d4d4'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#39485a'; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) x.fillRect(6 + i * 30, 8 + j * 30, 20, 20); x.fillStyle = 'rgba(0,0,0,.15)'; x.fillRect(0, 62, 64, 2); winBase = new THREE.CanvasTexture(c); winBase.wrapS = winBase.wrapT = THREE.RepeatWrapping; }
  const t = winBase.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(w / 4.5)), Math.max(1, Math.round(h / 4.5))); winTexCache[key] = t; return t;
}
const matCache = {}; const stdMat = (color, o) => { const k = color + JSON.stringify(o || {}); return matCache[k] || (matCache[k] = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.9 }, o || {}))); };
function box(w, h, d, x, y, z, mat, cast) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = cast !== false && h > 1.5; m.receiveShadow = true; scene.add(m); return m; }
function col(x, z, w, d, low, margin) { const m = margin === undefined ? 0.6 : margin; const b = { x, z, hw: w / 2 + m, hd: d / 2 + m }; if (low) b.low = true; currentBuildings.push(b); return b; }
function free(x, z, r) { r = r || 1.2; return !blockedAt(x, z) && !blockedAt(x + r, z) && !blockedAt(x - r, z) && !blockedAt(x, z + r) && !blockedAt(x, z - r); }
function plane(w, d, x, z, color, y, rough) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color, roughness: rough || 1 })); m.rotation.x = -Math.PI / 2; m.position.set(x, y || 0.03, z); m.receiveShadow = true; scene.add(m); return m; }
function signTex(text, sub) { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#12301f'; x.fillRect(0, 0, 512, 128); x.strokeStyle = '#d8b24a'; x.lineWidth = 6; x.strokeRect(6, 6, 500, 116); x.fillStyle = '#f1d27a'; x.font = 'bold ' + Math.min(50, Math.floor(470 / (text.length * 0.68))) + 'px Georgia,serif'; x.textAlign = 'center'; x.fillText(text, 256, 66); x.font = '24px Georgia,serif'; x.fillText(sub, 256, 104); return new THREE.CanvasTexture(c); }
function placeContainer(type, x, z, def, extra) {
  def = def || R_CONTAINERS[type]; const mat = new THREE.MeshStandardMaterial({ color: def.color, metalness: (type === 'safe' || type === 'bankvault') ? 0.7 : 0.2, roughness: 0.55 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(def.size[0], def.size[1], def.size[2]), mat); m.position.set(x, def.size[1] / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(def.size[0] * 1.02, 0.06, def.size[2] * 1.02), new THREE.MeshStandardMaterial({ color: 0xffd24a, emissive: 0x553d00, roughness: 0.5 })); lid.position.set(0, def.size[1] / 2 + 0.03, 0); m.add(lid);
  const c = Object.assign({ type, name: def.name, x, z, items: rollLoot(def.table, def.rolls), mesh: m, lid, opened: false, time: type === 'bankvault' ? 4.5 : type === 'safe' ? 2.2 : 1.4 }, extra || {}); c._items0 = c.items; R.containers.push(c); return c;
}
function spawnEnemy(type, x, z) {
  const d = R_ENEMY[type], df = R.diff, mesh = window.rdBuildEnemyMesh(type, d); mesh.position.set(x, 0, z); mesh.rotation.y = rnd(0, 6.28); scene.add(mesh); const hp = Math.round(d.hp * df.hp);
  const e = { mesh, type, def: { emoji: d.emoji, name: d.name, tier: d.tier }, tier: d.tier, hp, maxHp: hp, ac: d.ac, acHead: d.acHead, vestDur: 1, alive: true, alertT: 0, lastKnown: { x, z }, fireCd: rnd(0.5, 1.5), burstLeft: 0, restT: rnd(0.5, 2), strafe: Math.random() < 0.5 ? 1 : -1, strafeT: rnd(1, 2.5), wp: { x, z }, wpWait: rnd(0, 3), home: { x, z }, side: 1, stuck: 0 };
  mesh.userData.enemy = e; enemies.push(e); return e;
}
const pickType = (hard) => { const r = Math.random(); if (hard > 0.7) return r < 0.1 ? 'scav' : r < 0.3 ? 'knifer' : r < 0.6 ? 'raider' : 'pmc'; if (hard > 0.35) return r < 0.25 ? 'scav' : r < 0.4 ? 'knifer' : r < 0.75 ? 'raider' : 'pmc'; return r < 0.5 ? 'scav' : r < 0.65 ? 'knifer' : 'raider'; };

// ───────── a bank ─────────
function buildBank(cx, cz, name) {
  const W = 26, D = 18, T = 0.8, H = 7, stone = stdMat(0xcfc7b4, { roughness: 0.8 }), dark = stdMat(0x2d2f33, { metalness: 0.7, roughness: 0.35 }), floor = stdMat(0x8a8478, { roughness: 0.4 });
  const b = { name, x: cx, z: cz, front: { x: cx, z: cz + D / 2 + 3 }, conts: [], alarm: false, cleared: false, total: 0, looted: 0 };
  const wall = (x0, x1, z0, z1, h, mat) => { const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; box(w, h || H, d, cx + mx, (h || H) / 2, cz + mz, mat || stone); col(cx + mx, cz + mz, w, d, false, 0); };
  wall(-W / 2, W / 2, -D / 2, -D / 2 + T);                                      // back wall
  wall(-W / 2, -W / 2 + T, -D / 2, D / 2); wall(W / 2 - T, W / 2, -D / 2, D / 2);  // side walls
  wall(-W / 2, -3.5, D / 2 - T, D / 2); wall(3.5, W / 2, D / 2 - T, D / 2);        // front wall with a 7 m doorway
  box(7, 1.8, T, cx, H - 0.9, cz + D / 2 - T / 2, stone, false);                    // lintel over the doorway
  box(W + 1, 0.6, D + 1, cx, H + 0.3, cz, stdMat(0x4a4540), true);                  // roof (you cannot shoot through the walls, the roof is just for looks)
  const fl = plane(W - 2 * T, D - 2 * T, cx, cz, 0x9b968a, 0.05, 0.35); void fl; void floor;
  for (let i = -3; i <= 3; i++) for (let j = -1; j <= 1; j++) if ((i + j) % 2 === 0) plane(3.2, 3.2, cx + i * 3.4, cz + 3 + j * 3.4, 0x6e6a60, 0.06, 0.35);   // chequered lobby tiles
  // vault room at the back
  wall(-6.6, -5.4, -D / 2, -1, 5, dark); wall(5.4, 6.6, -D / 2, -1, 5, dark); wall(-6.6, -2, -1.6, -0.4, 5, dark); wall(2, 6.6, -1.6, -0.4, 5, dark);   // 4 m vault doorway
  box(6, 0.3, 8.6, cx, 5.15, cz - 5, dark, false);
  const vd = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.7, 28), new THREE.MeshStandardMaterial({ color: 0x9aa3ab, metalness: 0.95, roughness: 0.25 })); vd.rotation.x = Math.PI / 2; vd.position.set(cx - 3.6, 2.4, cz - 1.0); vd.rotation.z = 0; vd.castShadow = true; scene.add(vd);      // open vault door
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.09, 8, 20), new THREE.MeshStandardMaterial({ color: 0x555b60, metalness: 0.9, roughness: 0.3 })); wheel.position.set(cx - 3.6, 2.4, cz - 0.6); scene.add(wheel);
  // shelves of cash and gold inside (decoration) + the safes you rob
  for (let i = 0; i < 6; i++) { const gold = i % 2; box(0.9, 0.4, 0.5, cx - 5 + i * 0.0, 0.2 + (i >> 1) * 0.0, cz - 3 - i * 1.0, stdMat(gold ? 0xd6a92a : 0x3f7a45, gold ? { metalness: 0.9, roughness: 0.25 } : {}), false); }
  [-4.2, -1.4, 1.4, 4.2].forEach(x => { const c = placeContainer('bankvault', cx + x, cz - D / 2 + 1.2, BANKDEF, { bank: b }); b.conts.push(c); });
  [[-5, -4.5], [5, -4.5]].forEach(p => { const c = placeContainer('bankvault', cx + p[0], cz + p[1], BANKDEF, { bank: b }); c.mesh.rotation.y = p[0] < 0 ? Math.PI / 2 : -Math.PI / 2; b.conts.push(c); });
  b.total = b.conts.length;
  // lobby: two long teller counters with drawers behind them, a desk, plants, ropes
  [[-8, 2.4, 8], [8, 2.4, 8]].forEach(p => { box(p[2], 1.1, 1.2, cx + p[0], 0.55, cz + p[1], stdMat(0x5b3d28, { roughness: 0.5 })); col(cx + p[0], cz + p[1], p[2], 1.2, false, 0); box(p[2], 1.2, 0.08, cx + p[0], 1.7, cz + p[1], stdMat(0x9fd0e8, { transparent: true, opacity: 0.35, roughness: 0.1 }), false); });
  [[-8, 4.1], [8, 4.1]].forEach(p => placeContainer('teller', cx + p[0] + (p[0] < 0 ? 1.5 : -1.5), cz + p[1] - 3.2, TELLERDEF, { bankTeller: true }));
  [[-11, 6], [11, 6], [-11, -4], [11, -4]].forEach(p => { box(0.5, 0.9, 0.5, cx + p[0], 0.45, cz + p[1], stdMat(0x3e6b3a), false); });
  // facade: sign, columns, steps
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshBasicMaterial({ map: signTex(name.toUpperCase(), 'FIRST NATIONAL · EST. 1921') })); sign.position.set(cx, H - 1.7, cz + D / 2 + 0.06); scene.add(sign);
  [-4.4, 4.4].forEach(x => { const cl = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, H - 0.5, 14), stone); cl.position.set(cx + x, (H - 0.5) / 2, cz + D / 2 + 0.7); cl.castShadow = true; scene.add(cl); });
  box(10, 0.3, 1.6, cx, 0.15, cz + D / 2 + 1.6, stdMat(0xa9a395), false);
  [-9, 9].forEach(x => box(3.2, 2.4, 0.1, cx + x, 3.2, cz + D / 2 + 0.05, stdMat(0x9fd0e8, { transparent: true, opacity: 0.45, roughness: 0.1 }), false));
  const L = new THREE.PointLight(0xffe2b0, 1.1, 24); L.position.set(cx, 5.2, cz); L.visible = false; scene.add(L); b.light = L;
  // a short sandbag barricade across the road and a parked armoured truck out the front
  box(7, 2.6, 2.6, cx + 12, 1.3, cz + D / 2 + 7, stdMat(0x3b4a3a, { roughness: 0.6 })); col(cx + 12, cz + D / 2 + 7, 7, 2.6, false);
  // guards
  for (let i = 0; i < 3; i++) { const e = spawnEnemy(i === 0 ? 'pmc' : 'pmc', cx + rr(-6, 6), cz + rr(2, 6)); e.home = { x: e.mesh.position.x, z: e.mesh.position.z }; e.wp = Object.assign({}, e.home); }
  for (let i = 0; i < 2; i++) { const e = spawnEnemy('raider', cx + rr(-9, 9), cz + D / 2 + rr(3, 8)); e.home = { x: e.mesh.position.x, z: e.mesh.position.z }; e.wp = Object.assign({}, e.home); }
  OW.banks.push(b); return b;
}

// ───────── towns, roads, camps, forests ─────────
function buildTown(t, idx) {
  const S = 30, palette = [0xb9b2a4, 0xa39b8c, 0x9c9486, 0xc9c1b0, 0xa8845e, 0x8e9aa3], reserved = [];
  const wx = t.c * S, wz = t.r * S;
  plane(wx + 10, wz + 10, t.x, t.z, 0x4a4b4e, 0.04, 0.9);                                                    // paved area
  for (let i = 0; i <= t.c; i++) { const x = t.x - wx / 2 + i * S; plane(8, wz + 10, x, t.z, 0x2c2d30, 0.05, 0.85); plane(0.3, wz + 10, x, t.z, 0xd8c85a, 0.06, 0.8); }
  for (let j = 0; j <= t.r; j++) { const z = t.z - wz / 2 + j * S; plane(wx + 10, 8, t.x, z, 0x2c2d30, 0.05, 0.85); plane(wx + 10, 0.3, t.x, z, 0xd8c85a, 0.06, 0.8); }
  let bankCell = null; if (t.bank) { bankCell = [Math.floor(t.c / 2), Math.floor(t.r / 2)]; }
  for (let i = 0; i < t.c; i++) for (let j = 0; j < t.r; j++) {
    const cx = t.x - wx / 2 + S / 2 + i * S, cz = t.z - wz / 2 + S / 2 + j * S;
    if (bankCell && i === bankCell[0] && j === bankCell[1]) { const b = buildBank(cx, cz, t.name + ' Bank'); b.town = t; continue; }
    if (rg() < 0.2) { for (let k = 0; k < 3; k++) { const tx = cx + rr(-8, 8), tz = cz + rr(-8, 8); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 1.8, 8), stdMat(0x5a4028)); tr.position.set(tx, 0.9, tz); scene.add(tr); const cr = new THREE.Mesh(new THREE.SphereGeometry(1.6, 10, 8), stdMat(0x3c6a34)); cr.position.set(tx, 3, tz); cr.castShadow = true; scene.add(cr); col(tx, tz, 0.5, 0.5, false, 0.1); } continue; }   // a small park
    const w = rr(11, 19), d = rr(11, 19), h = rr(6, idx === 0 ? 34 : 18), c0 = palette[Math.floor(rg() * palette.length)];
    const mat = new THREE.MeshStandardMaterial({ color: c0, roughness: 0.9, map: winTex(Math.max(w, d), h) });
    box(w, h, d, cx, h / 2, cz, mat); box(w + 0.5, 0.5, d + 0.5, cx, h + 0.25, cz, stdMat(0x45413c), false); col(cx, cz, w, d, false);
    if (rg() < 0.35) { const rb = rr(1, 2.2); box(rb, rb * 0.7, rb, cx + w / 2 + 1.5, rb * 0.35, cz + rr(-d / 2, d / 2), stdMat(0x7a7468), false); }
  }
  OW.towns.push(t);
}
function buildRoads() {
  const link = (a, b) => { const x0 = a.x, z0 = a.z, x1 = b.x, z1 = b.z; const len1 = Math.abs(x1 - x0), len2 = Math.abs(z1 - z0); plane(len1, 9, (x0 + x1) / 2, z0, 0x2c2d30, 0.035, 0.9); plane(len1, 0.35, (x0 + x1) / 2, z0, 0xcfc050, 0.045, 0.8); plane(9, len2, x1, (z0 + z1) / 2, 0x2c2d30, 0.035, 0.9); plane(0.35, len2, x1, (z0 + z1) / 2, 0xcfc050, 0.045, 0.8); };
  const T = TOWNS; link(T[0], T[1]); link(T[0], T[2]); link(T[0], T[3]); link(T[0], T[4]); link(T[0], T[5]); link(T[0], T[6]);
  CAMPS.forEach(c => link({ x: c[0], z: c[1] }, T[0]));
  plane(2 * HALF, 6, 0, -HALF + 6, 0x3a3b3e, 0.03, 0.9); plane(2 * HALF, 6, 0, HALF - 6, 0x3a3b3e, 0.03, 0.9);
}
function buildCamp(c, i) {
  const [cx, cz] = c, sand = stdMat(0xb6a272, { roughness: 1 });
  for (let k = 0; k < 14; k++) { const a = k / 14 * 6.2832; if (k % 7 === 0) continue; box(2.6, 1.0, 0.8, cx + Math.cos(a) * 11, 0.5, cz + Math.sin(a) * 11, sand, false).rotation.y = -a + 1.5708; col(cx + Math.cos(a) * 11, cz + Math.sin(a) * 11, 2.6, 1.0, true, 0.2); }
  for (let k = 0; k < 3; k++) { const a = k * 2.1 + 0.5, tx = cx + Math.cos(a) * 5, tz = cz + Math.sin(a) * 5; const tent = new THREE.Mesh(new THREE.ConeGeometry(2.6, 2.4, 4), stdMat(0x59623f)); tent.position.set(tx, 1.2, tz); tent.rotation.y = a + 0.78; tent.castShadow = true; scene.add(tent); col(tx, tz, 3.6, 3.6, false, 0.2); }
  box(3, 8, 3, cx, 4, cz, stdMat(0x5a4a38)); col(cx, cz, 3, 3, false); box(4.4, 0.4, 4.4, cx, 8.2, cz, stdMat(0x4a3a2a), false);                  // watchtower
  placeContainer('weaponbox', cx + 2.5, cz + 4); placeContainer('crate', cx - 3, cz + 4); placeContainer('safe', cx + 6, cz - 2); placeContainer('crate', cx - 6, cz - 3);
  const n = 5 + (i % 3); for (let k = 0; k < n; k++) { const a = rg() * 6.28, r = rr(4, 10), e = spawnEnemy(pickType(0.5 + i * 0.08), cx + Math.cos(a) * r, cz + Math.sin(a) * r); e.home = { x: cx, z: cz }; e.wp = { x: cx, z: cz }; }
  OW.camps.push({ x: cx, z: cz });
}
function buildNature() {
  const trunkG = new THREE.CylinderGeometry(0.22, 0.34, 2.4, 6), crownG = new THREE.ConeGeometry(2.1, 6.2, 7), N = 1100;
  const trunks = new THREE.InstancedMesh(trunkG, stdMat(0x5a4028), N), crowns = new THREE.InstancedMesh(crownG, stdMat(0x2f5a2c, { roughness: 0.95 }), N), M = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  let n = 0, colN = 0;
  const nearTown = (x, z) => TOWNS.some(t => Math.abs(x - t.x) < t.c * 15 + 22 && Math.abs(z - t.z) < t.r * 15 + 22) || CAMPS.some(c => Math.hypot(x - c[0], z - c[1]) < 22);
  for (let k = 0; k < 6000 && n < N; k++) {
    const x = rr(-HALF + 6, HALF - 6), z = rr(-HALF + 6, HALF - 6), fz = Math.sin(x * 0.013) + Math.cos(z * 0.011) + Math.sin((x + z) * 0.007);
    if (fz < 0.1 || nearTown(x, z) || Math.abs(z) < 7 || Math.abs(x) < 7 || Math.abs(Math.abs(z) - (HALF - 6)) < 6) continue;
    const s = rr(0.8, 1.5); pos.set(x, 1.2 * s, z); sc.set(s, s, s); M.compose(pos, q, sc); trunks.setMatrixAt(n, M); pos.set(x, 2.4 * s + 3.0 * s, z); M.compose(pos, q, sc); crowns.setMatrixAt(n, M); n++;
    if (colN < 220) { col(x, z, 0.5, 0.5, false, 0.1); colN++; }
  }
  trunks.count = n; crowns.count = n; trunks.castShadow = true; scene.add(trunks); scene.add(crowns);
  const rock = stdMat(0x6b6a66, { roughness: 1 });
  for (let k = 0; k < 44; k++) { const a = k / 44 * 6.2832, r = HALF + rr(50, 130), h = rr(50, 150), m = new THREE.Mesh(new THREE.ConeGeometry(rr(55, 100), h, 7), k % 5 === 0 ? stdMat(0xe8eef2) : rock); m.position.set(Math.cos(a) * r, h / 2 - 5, Math.sin(a) * r); scene.add(m); }     // mountains on the horizon
  for (let k = 0; k < 60; k++) { const x = rr(-HALF, HALF), z = rr(-HALF, HALF); if (nearTown(x, z)) continue; const s = rr(1.5, 4), m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rock); m.position.set(x, s * 0.5, z); m.castShadow = true; scene.add(m); col(x, z, s * 1.4, s * 1.4, false, 0); }
}
function placeExtracts() {
  EXTRACTS.forEach(e => {
    let x = e[1], z = e[2]; for (let k = 0; k < 30 && blockedAt(x, z); k++) { x -= Math.sign(x) * 2; z -= Math.sign(z) * 2; }
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.1, 32), new THREE.MeshBasicMaterial({ color: 0x22ff88, transparent: true, opacity: 0.35 })); ring.position.set(x, 0.1, z); scene.add(ring);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 60, 8), new THREE.MeshBasicMaterial({ color: 0x66ffaa, transparent: true, opacity: 0.35 })); beam.position.set(x, 30, z); scene.add(beam);
    R.extracts.push({ x, z, r: 4.5, ring, beam, name: e[0] }); OW.extracts.push({ x, z, name: e[0] });
  });
}
function buildWorld() {
  clearMapScene(); rg = rng32(90210); OW.banks = []; OW.towns = []; OW.camps = []; OW.extracts = [];
  scene.background = new THREE.Color(THEME.sky); scene.fog = new THREE.Fog(THEME.sky, 60, 420);
  scene.add(new THREE.AmbientLight(0xffffff, 0.55)); const sun = new THREE.DirectionalLight(0xffeecc, 0.85); sun.position.set(40, 60, 20); scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2 + 700, HALF * 2 + 700), new THREE.MeshStandardMaterial({ color: THEME.ground, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  OW.labels = TOWNS.map(t => ({ x: t.x, z: t.z, name: t.name, dy: t.r * 15 + 8 }));
  buildRoads(); TOWNS.forEach(buildTown); CAMPS.forEach(buildCamp); buildNature();
  // loot lying around in the towns
  TOWNS.forEach((t, ti) => { const n = ti === 0 ? 22 : t.bank ? 12 : 9; for (let k = 0; k < n; k++) { for (let tr = 0; tr < 12; tr++) { const x = t.x + rr(-t.c * 15, t.c * 15), z = t.z + rr(-t.r * 15, t.r * 15); if (!free(x, z, 1.4)) continue; const r = Math.random(); placeContainer(r < 0.4 ? 'crate' : r < 0.7 ? 'locker' : r < 0.9 ? 'weaponbox' : 'safe', x, z); break; } } });
  // patrols: soldiers walking the streets (no civilians!). Harder further from your start side.
  TOWNS.forEach((t, ti) => { const n = ti === 0 ? 14 : t.bank ? 9 : 6, hard = ti === 0 ? 0.85 : t.bank ? 0.55 : 0.25; for (let k = 0; k < n; k++) for (let tr = 0; tr < 12; tr++) { const x = t.x + rr(-t.c * 15, t.c * 15), z = t.z + rr(-t.r * 15, t.r * 15); if (!free(x, z, 1.2)) continue; const e = spawnEnemy(pickType(hard), x, z); e.home = { x: t.x + rr(-20, 20), z: t.z + rr(-20, 20) }; e.wp = { x, z }; break; } });
  const sp = SPAWNS[Math.floor(Math.random() * 4)]; R.spawn = { x: sp[0] + rr(-10, 10), z: sp[1] + rr(-10, 10) }; for (let k = 0; k < 40 && !free(R.spawn.x, R.spawn.z, 2); k++) { R.spawn.x -= Math.sign(R.spawn.x) * 2; R.spawn.z -= Math.sign(R.spawn.z) * 2; }
  enemies.forEach(e => { if (Math.hypot(e.mesh.position.x - R.spawn.x, e.mesh.position.z - R.spawn.z) < 70) { e.alive = false; scene.remove(e.mesh); } }); enemies = enemies.filter(e => e.alive);
  R.limit = DIFF.time * 60; yaw = Math.atan2(R.spawn.x, R.spawn.z);
  if (camera) { camera.far = 1200; camera.updateProjectionMatrix(); }
}
window.buildMapScene = function (i) {
  if (i !== IDX && i !== IDX2) { ARENA_HALF = 66; OW.on = false; if (camera) { camera.far = 500; camera.updateProjectionMatrix(); } return origBuild(i); }
  OW.on = true; OW.prevHighest = (typeof userState !== 'undefined' && userState && userState.highestMapUnlocked) || 1; ARENA_HALF = HALF; OW.mode = i === IDX2 ? 'explox' : 'world'; if (i === IDX2) window.rdBuildExplox(); else buildWorld(); setTimeout(() => { try { userState.highestMapUnlocked = OW.prevHighest; saveUserData(); } catch (e) { } }, 50);
};
window.rdOWSpawn = function () { if (!OW.on) return false; if (OW.mode === 'explox') window.rdExploxExtracts(); else placeExtracts(); return true; };
window.rdEnd = function (reason) { const was = OW.on; if (was) { try { userState.highestMapUnlocked = OW.prevHighest; } catch (e) { } } const r = origEnd.apply(this, arguments); if (was) { OW.on = false; ARENA_HALF = 66; if (camera) { camera.far = 500; camera.updateProjectionMatrix(); } hideHud(); } return r; };
window.rdOWLook = function () { if (!OW.on || !scene.fog) return; if (scene.fog.isFogExp2) scene.fog.density *= 0.4; else { scene.fog.near = 80; scene.fog.far = 520; } };

// ───────── alarm + banks status ─────────
let sirenT = null;
function alarm(b) {
  b.alarm = true; const api = window.RDX.api; rdToast(`🚨 ALARM at ${b.name}! Guards are coming — grab the loot and get out!`, 5200);
  let k = 0; clearInterval(sirenT); sirenT = setInterval(() => { try { api.tone(k++ % 2 ? 640 : 880, 0.4, 0.35, 'square'); } catch (e) { } if (k > 40 || !R.on) clearInterval(sirenT); }, 450);
  enemies.forEach(e => { if (e.alive && Math.hypot(e.mesh.position.x - b.x, e.mesh.position.z - b.z) < 170) { e.alertT = Math.max(e.alertT, 20); e.lastKnown.x = b.front.x; e.lastKnown.z = b.front.z; } });
  for (let i = 0; i < 6; i++) { const a = rg() * 6.28 + i, r = 85 + Math.random() * 30; let x = b.x + Math.cos(a) * r, z = b.z + Math.sin(a) * r; x = Math.max(-HALF + 8, Math.min(HALF - 8, x)); z = Math.max(-HALF + 8, Math.min(HALF - 8, z)); if (!free(x, z, 1.4)) continue; const e = spawnEnemy(i < 4 ? 'pmc' : 'raider', x, z); e.alertT = 40; e.lastKnown.x = b.front.x; e.lastKnown.z = b.front.z; }
}
function bankTick() {
  if (!OW.on || !R.on) return; let looted = 0;
  OW.banks.forEach(b => {
    const touched = b.conts.filter(c => c.opened || c.items !== c._items0).length; b.looted = b.conts.filter(c => c.opened).length; if (touched && !b.alarm) alarm(b);
    if (!b.cleared && b.looted === b.total) { b.cleared = true; R.xpGain += 150; userState.xp += 150; rdToast(`🏦 ${b.name} cleaned out! +150 XP`, 4200); }
    if (b.cleared) looted++; if (b.light) b.light.visible = Math.hypot(playerPos.x - b.x, playerPos.z - b.z) < 80;
  });
  OW.cleared = looted; const h = document.getElementById('owHud'); if (h) h.textContent = `🏦 Banks robbed ${looted}/${OW.banks.length}` + (OW.banks.some(b => b.alarm && !b.cleared) ? '  🚨 ALARM' : '') + '   ·  M = map';
}

// ───────── minimap + world map ─────────
let mini = null, big = null, hud = null, showBig = false;
function ensureHud() {
  if (mini) return;
  const css = document.createElement('style'); css.textContent = '#owMini{position:fixed;right:12px;top:58px;width:170px;height:170px;border-radius:50%;border:2px solid #ffffffaa;box-shadow:0 0 14px #000;z-index:19;display:none;background:#10171a} #owBig{position:fixed;inset:0;margin:auto;max-width:94vmin;max-height:94vmin;width:94vmin;height:94vmin;border:2px solid #d8b24a;border-radius:10px;z-index:75;display:none;background:#0b1316;box-shadow:0 0 40px #000} #owHud{position:fixed;left:12px;top:84px;z-index:19;color:#ffe6a8;font:bold 13px Arial;text-shadow:0 1px 4px #000;display:none}';
  document.head.appendChild(css);
  mini = document.createElement('canvas'); mini.id = 'owMini'; mini.width = mini.height = 170; document.body.appendChild(mini);
  big = document.createElement('canvas'); big.id = 'owBig'; big.width = big.height = 760; document.body.appendChild(big);
  hud = document.createElement('div'); hud.id = 'owHud'; document.body.appendChild(hud);
  document.addEventListener('keydown', e => { if ((e.key === 'm' || e.key === 'M') && OW.on && window.RAID && RAID.on) { showBig = !showBig; big.style.display = showBig ? 'block' : 'none'; } });
}
function hideHud() { if (mini) { mini.style.display = 'none'; big.style.display = 'none'; hud.style.display = 'none'; showBig = false; } }
function draw(cv, scale, follow) {
  const g = cv.getContext('2d'), W = cv.width, c = W / 2; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, W); g.fillStyle = follow ? '#18241a' : '#17261b'; g.fillRect(0, 0, W, W);
  const k = scale, ca = follow ? Math.cos(yaw) : 1, sa = follow ? Math.sin(yaw) : 0, px = follow ? playerPos.x : 0, pz = follow ? playerPos.z : 0;
  g.setTransform(ca * k, sa * k, -sa * k, ca * k, c - (ca * k * px - sa * k * pz), c - (sa * k * px + ca * k * pz));
  g.fillStyle = '#1f3a24'; g.fillRect(-HALF, -HALF, HALF * 2, HALF * 2); g.strokeStyle = '#6a5a2a'; g.lineWidth = 3 / k; g.strokeRect(-HALF, -HALF, HALF * 2, HALF * 2);
  g.fillStyle = '#34383d'; OW.towns.forEach(t => g.fillRect(t.x - t.c * 15 - 4, t.z - t.r * 15 - 4, t.c * 30 + 8, t.r * 30 + 8));
  g.fillStyle = '#8b8678'; const lim = follow ? 150 : 1e9; currentBuildings.forEach(b => { if (b.low || b.hw < 1.5) return; if (follow && (Math.abs(b.x - px) > lim || Math.abs(b.z - pz) > lim)) return; g.fillRect(b.x - b.hw, b.z - b.hd, b.hw * 2, b.hd * 2); });
  OW.banks.forEach(b => { g.fillStyle = b.cleared ? '#777' : b.alarm ? '#ff4a3a' : '#ffd24a'; g.beginPath(); g.arc(b.x, b.z, (follow ? 7 : 9) / k * (follow ? 1 : 1.6), 0, 6.3); g.fill(); });
  OW.extracts.forEach(e => { g.strokeStyle = '#4dffa0'; g.lineWidth = 2 / k; g.beginPath(); g.arc(e.x, e.z, 6 / k * (follow ? 1 : 1.5), 0, 6.3); g.stroke(); });
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (!follow) { g.font = 'bold 15px Arial'; g.fillStyle = '#e8e0d0'; g.textAlign = 'center'; (OW.labels || []).forEach(t => g.fillText(t.name, c + t.x * k, c + t.z * k - (t.dy || 12))); g.fillStyle = '#ffd24a'; OW.banks.forEach(b => g.fillText('🏦', c + b.x * k, c + b.z * k + 5)); g.fillStyle = '#4dffa0'; OW.extracts.forEach(e => g.fillText(e.name, c + e.x * k, c + e.z * k + (e.z > 0 ? -12 : 20))); g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText('Hold M to close · yellow = bank · ring = extraction · you are the arrow', 14, 22);
    const ax = c + playerPos.x * k, az = c + playerPos.z * k; g.save(); g.translate(ax, az); g.rotate(-yaw + Math.PI); g.fillStyle = '#ff3a3a'; g.beginPath(); g.moveTo(0, -11); g.lineTo(7, 8); g.lineTo(-7, 8); g.closePath(); g.fill(); g.restore(); }
  else { g.fillStyle = '#ff3a3a'; g.beginPath(); g.moveTo(c, c - 8); g.lineTo(c + 5, c + 6); g.lineTo(c - 5, c + 6); g.closePath(); g.fill(); g.strokeStyle = '#ffffff44'; g.lineWidth = 1; g.beginPath(); g.arc(c, c, c - 2, 0, 6.3); g.stroke(); }
}
setInterval(() => {
  if (!OW.on || !window.RAID || !RAID.on) { if (mini && mini.style.display !== 'none') hideHud(); return; }
  ensureHud(); mini.style.display = 'block'; hud.style.display = 'block'; bankTick(); try { draw(mini, 0.55, true); if (showBig) draw(big, 760 / (HALF * 2 + 40), false); } catch (e) { }
}, 120);
// entry button next to NO MERCY / TEAM BATTLE on the sector screen
function addBtn() { const bar = document.querySelector('#mapSelectTop > div:last-child'); if (!bar || document.getElementById('owBtn')) return; const b = document.createElement('button'); b.className = 'msBtn'; b.id = 'owBtn'; b.style.cssText = 'background:linear-gradient(#2f8a4a,#1f5f33);color:#fff;border-color:#4dffa0'; b.textContent = '🌍 OPEN WORLD'; b.onclick = () => window.enterMap(IDX); bar.insertBefore(b, bar.firstChild); }
addBtn(); document.addEventListener('DOMContentLoaded', addBtn); setTimeout(addBtn, 400); setTimeout(addBtn, 1500); setInterval(addBtn, 3000);
OW.h = { box, col, free, plane, stdMat, winTex, placeContainer, spawnEnemy, buildBank, signTex, rr: rnd, rnd, rint, HALF, rollLoot, labelsReset: () => { OW.banks = []; OW.towns = []; OW.camps = []; OW.extracts = []; OW.labels = []; } };
function addBtn2() { const bar = document.querySelector('#mapSelectTop > div:last-child'); if (!bar || document.getElementById('exBtn')) return; const b = document.createElement('button'); b.className = 'msBtn'; b.id = 'exBtn'; b.style.cssText = 'background:linear-gradient(#7a3fb0,#4f2a78);color:#fff;border-color:#c46aff'; b.textContent = '🏙️ EXPLOX CITY'; b.onclick = () => window.enterMap(IDX2); bar.insertBefore(b, bar.firstChild); }
addBtn2(); document.addEventListener('DOMContentLoaded', addBtn2); setTimeout(addBtn2, 400); setTimeout(addBtn2, 1500); setInterval(addBtn2, 3000);
})();
