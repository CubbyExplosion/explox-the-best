// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — MY HOUSE IN 3D  (🏠 MY HOUSE button: you walk around your own house in first person)
//   A real house you can walk through (WASD + mouse): living room with a TV showing your stats, kitchen and dining area, bedroom, an ARMORY ROOM
//   with every gun you own hanging on the wall, and the SAFE ROOM with all 10 safes standing along the walls (small = 3 slots, medium = 10,
//   big = 15; owned ones shine, locked ones are dark). Walk up to a safe and hold F to open it: buy it, fill it from your stash, take things out,
//   or choose which one to bring into raids. Walk to the front door and hold E to leave. There are no enemies — it is your home.
// Uses the raid engine (movement, camera, lighting) like the Open World, as sector 103.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const IDX = 103, HALF = 60, R = window.RAID, OW = window.OW, h = OW.h, H3 = window.HOUSE3D = { on: false };
const prevTheme = window.themeForMap, prevName = window.mapNameForMap, prevDiff = window.rDifficulty, prevBuild = window.buildMapScene, prevSpawn = window.rdOWSpawn, prevRes = window.rdShowResults;
const THEME = { name: 'My House', style: 'ruin', sky: 0x9cc4ec, ground: 0x4f7a3a, colors: [0xb9b2a4, 0xa39b8c] };
const DIFF = Object.assign({}, R_DIFFS[0], { id: 7, name: 'Home', color: '#d0a93a', enemies: [0, 0], containers: [0, 0, 0, 0], time: 999, note: 'Your house.' });
window.themeForMap = i => i === IDX ? THEME : prevTheme(i);
window.mapNameForMap = i => i === IDX ? '🏠 MY HOUSE' : prevName(i);
window.rDifficulty = i => i === IDX ? DIFF : prevDiff(i);
const st = h.stdMat, B = h.box, C = h.col;
const tex = (w, ht, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = ht; draw(c.getContext('2d'), w, ht); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; };
const label = (lines, w, ht, col) => tex(w || 256, ht || 96, (x, W, Ht) => { x.fillStyle = 'rgba(12,12,14,.78)'; x.fillRect(0, 0, W, Ht); x.strokeStyle = col || '#d0a93a'; x.lineWidth = 4; x.strokeRect(2, 2, W - 4, Ht - 4); x.textAlign = 'center'; lines.forEach((l, i) => { x.fillStyle = l.c || '#fff'; x.font = (l.f || 'bold 26px Arial'); x.fillText(l.t, W / 2, 34 + i * 30); }); });
function wallBox(x0, x1, z0, z1, hgt, mat) { const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; B(w, hgt || 3.6, d, mx, (hgt || 3.6) / 2, mz, mat || WALL); C(mx, mz, w, d, false, 0); }
let WALL = null;
const furn = (w, ht, d, x, y, z, mat, solid) => { const m = B(w, ht, d, x, y, z, mat, false); m.castShadow = true; if (solid !== false) C(x, z, w, d, false, 0.05); return m; };

function safeDims(s) { return s.slots >= 15 ? [1.5, 1.8, 1.05] : s.slots >= 10 ? [1.15, 1.35, 0.9] : [0.85, 0.85, 0.7]; }
const SAFE_SLOTS = [[-4, -9.3, 0], [-2, -9.3, 0], [0, -9.3, 0], [2, -9.3, 0], [4, -9.3, 0], [-5.3, -7.5, Math.PI / 2], [-5.3, -5, Math.PI / 2], [-5.3, -2.5, Math.PI / 2], [5.3, -7.5, -Math.PI / 2], [5.3, -4.5, -Math.PI / 2]];
let safeObjs = [], sig = '';
function safeLabel(s) { const hh = window.HOUSE.H(), own = hh.owned.includes(s.id), eq = hh.eq === s.id, n = Object.keys(hh.box[s.id] || {}).length;
  return label([{ t: s.name, c: own ? '#ffe08a' : '#aaa', f: 'bold 24px Arial' }, { t: s.slots + ' slots' + (own ? ' · ' + (window.rSlotsUsedSafe ? window.rSlotsUsedSafe(hh.box[s.id] || {}) : n) + '/' + s.slots : ''), c: '#cfe' }, { t: own ? (eq ? '✅ bringing it' : 'owned — hold F') : '🔒 ⚙️' + s.price + ' — hold F to buy', c: own ? (eq ? '#7dffb0' : '#9fd') : '#ff9a7a', f: '20px Arial' }], 320, 112, own ? '#d0a93a' : '#666'); }
function refreshSafes() {
  const hh = window.HOUSE.H(), nsig = JSON.stringify([hh.owned, hh.eq, Object.keys(hh.box).map(k => Object.keys(hh.box[k]).length + ':' + Object.values(hh.box[k]).reduce((a, b) => a + b, 0))]); if (nsig === sig) return; sig = nsig;
  safeObjs.forEach(o => { const own = hh.owned.includes(o.s.id), eq = hh.eq === o.s.id; o.body.material.color.set(own ? o.s.col : 0x2a2a2e); o.body.material.metalness = own ? 0.7 : 0.4; o.body.material.emissive.set(eq ? 0x0f5a2a : 0x000000); o.sprite.material.map = safeLabel(o.s); o.sprite.material.needsUpdate = true; o.cont.name = o.s.name + (own ? '' : ' (buy ⚙️' + o.s.price + ')'); });
}
function build() {
  clearMapScene(); safeObjs = []; sig = ''; OW.h.labelsReset(); WALL = st(0xe6dcc6, { roughness: 0.9 });
  scene.background = new THREE.Color(0x9cc4ec); scene.fog = new THREE.Fog(0x9cc4ec, 40, 170); scene.add(new THREE.AmbientLight(0xffffff, 0.62)); const sun = new THREE.DirectionalLight(0xfff0d8, 0.85); sun.position.set(40, 60, 20); scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: 0x4f7a3a, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // house shell: 32 × 20 m
  const T = 0.4; WALL.color.set(0xe6dcc6);
  wallBox(-16, 16, -10, -10 + T); wallBox(-16, -16 + T, -10, 10); wallBox(16 - T, 16, -10, 10); wallBox(-16, -1.5, 10 - T, 10); wallBox(1.5, 16, 10 - T, 10); B(3.4, 0.7, T, 0, 3.25, 10 - T / 2, WALL, false);
  [[-16, -12.6], [-9.4, -1.6], [1.6, 9.4], [12.6, 16]].forEach(s => wallBox(s[0], s[1], -0.2, 0.2)); wallBox(-6.2, -5.8, -10, -0.2); wallBox(5.8, 6.2, -10, -0.2);                   // interior walls with three doorways
  [-11, 0, 11].forEach(x => B(3.4, 0.7, 0.4, x, 3.25, 0, WALL, false));
  const roofM = st(0x6b3a2a, { roughness: 0.8 }); B(33, 0.35, 21, 0, 3.78, 0, st(0x4a4540), true); [-1, 1].forEach(s => { const r = B(33, 0.3, 11.5, 0, 5.0, s * 5.0, roofM, true); r.rotation.x = -s * 0.38; });
  // floors per room
  const floor = (x0, x1, z0, z1, c, rough) => h.plane(x1 - x0, z1 - z0, (x0 + x1) / 2, (z0 + z1) / 2, c, 0.06, rough || 0.5);
  floor(-16, 16, 0, 10, 0x9a7a52); floor(-16, -6, -10, 0, 0x6a4a58, 0.95); floor(-6, 6, -10, 0, 0x4a4e54, 0.3); floor(6, 16, -10, 0, 0x6e6e6a, 0.8); h.plane(7, 6, -9, 5.4, 0x8a3a3a, 0.08, 1);
  // lights
  { const ce = new THREE.Mesh(new THREE.PlaneGeometry(32, 20), new THREE.MeshStandardMaterial({ color: 0xf2eee4, roughness: 1 })); ce.rotation.x = Math.PI / 2; ce.position.set(0, 3.58, 0); scene.add(ce); }
  [[-8, 5], [8, 5], [-11, -5], [0, -5], [11, -5]].forEach(p => { const L = new THREE.PointLight(0xffe6c0, 0.95, 20); L.position.set(p[0], 3.0, p[1]); scene.add(L); B(0.5, 0.06, 0.5, p[0], 3.55, p[1], st(0xffffee, { emissive: 0xffeecc }), false); });
  // windows (decorative glass in the front and side walls)
  const glass = st(0x9fd0e8, { transparent: true, opacity: 0.4, roughness: 0.1, metalness: 0.2 }); [-12, -6, 6, 12].forEach(x => { B(2.6, 1.6, 0.06, x, 1.9, 9.9, glass, false); B(2.8, 0.08, 0.1, x, 2.74, 9.9, st(0x3a2a1a), false); }); [-5, 5].forEach(z => { B(0.06, 1.6, 2.6, -15.9, 1.9, z, glass, false); B(0.06, 1.6, 2.6, 15.9, 1.9, z, glass, false); });
  // living room
  const sofaM = st(0x3f5a8a, { roughness: 0.9 }); furn(5, 0.55, 1.4, -9, 0.3, 8.4, sofaM); furn(5, 0.9, 0.35, -9, 0.75, 9.3, sofaM, false); furn(0.4, 0.8, 1.4, -11.7, 0.5, 8.4, sofaM, false); furn(0.4, 0.8, 1.4, -6.3, 0.5, 8.4, sofaM, false);
  furn(2, 0.45, 1, -9, 0.23, 5.6, st(0x5a3a22)); furn(3.2, 0.6, 0.5, -9, 0.3, 0.8, st(0x3a2a1c)); const tvTex = tex(512, 288, (x, W, Ht) => { x.fillStyle = '#0b1622'; x.fillRect(0, 0, W, Ht); x.fillStyle = '#ff6a33'; x.font = 'bold 40px Arial'; x.textAlign = 'center'; x.fillText('EXGUN HOME', W / 2, 52); x.fillStyle = '#cfe8ff'; x.font = '26px Arial'; const u = (typeof userState !== 'undefined' && userState) || {}; [`Level ${u.level || 1}   ·   XP ${u.xp || 0}`, `Kills ${u.kills || 0}   ·   Deaths ${u.deaths || 0}`, `Scrap ⚙️ ${u.scrap || 0}`, `Guns owned ${(u.ownedWeapons || []).length}`, `Safes ${window.HOUSE.H().owned.length}/10`].forEach((l, i) => x.fillText(l, W / 2, 100 + i * 36)); });
  const tv = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.46), new THREE.MeshBasicMaterial({ map: tvTex })); tv.position.set(-9, 1.55, 1.04); tv.rotation.y = Math.PI; tv.rotation.y = 0; scene.add(tv); B(2.8, 1.6, 0.08, -9, 1.55, 0.98, st(0x111113), false);
  furn(1.2, 2.3, 0.4, -15.5, 1.15, 6, st(0x5a3a22)); [0, 1, 2, 3].forEach(i => B(0.9, 0.3, 0.3, -15.3, 0.6 + i * 0.55, 6 + (i % 2) * 0.1, st([0x8a3a3a, 0x3a6a8a, 0x6a8a3a, 0xaa8a3a][i]), false));
  const pot = B(0.5, 0.5, 0.5, -3.2, 0.25, 9, st(0x8a5a3a)); const plant = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8), st(0x2f7a34)); plant.position.set(-3.2, 1.1, 9); scene.add(plant); void pot; C(-3.2, 9, 0.6, 0.6, false, 0.05);
  // kitchen + dining
  const cm = st(0xd8d4cc, { roughness: 0.5 }); furn(8, 0.9, 0.8, 8.5, 0.45, 1.0, st(0x4a4f56)); B(8, 0.08, 0.9, 8.5, 0.94, 1.0, cm, false); furn(1.0, 2.0, 0.9, 13.4, 1.0, 1.0, st(0xcfd4d8, { metalness: 0.6, roughness: 0.3 })); furn(1.1, 0.9, 0.8, 4.2, 0.45, 1.0, st(0x222426)); [0, 1, 2, 3].forEach(i => B(0.3, 0.02, 0.3, 3.9 + (i % 2) * 0.6, 0.92, 0.85 + (i >> 1) * 0.4, st(0x111111), false));
  furn(2.6, 0.08, 1.4, 9, 0.76, 6, st(0x7a5a38)); furn(0.12, 0.76, 0.12, 8, 0.38, 5.5, st(0x4a3a28), false); [[-1.5, -0.8], [-1.5, 0.8], [1.5, -0.8], [1.5, 0.8], [-0.4, 1.3], [0.4, -1.3]].forEach(p => furn(0.5, 0.5, 0.5, 9 + p[0], 0.25, 6 + p[1], st(0x6a4a2a), false));
  // bedroom
  furn(2.2, 0.55, 3.1, -13.2, 0.28, -7.8, st(0x8a3a3a)); furn(2.2, 0.15, 0.9, -13.2, 0.7, -9.2, st(0xeeeeee), false); furn(2.0, 1.1, 0.2, -13.2, 0.9, -9.8, st(0x5a3a22), false); furn(0.8, 0.5, 0.8, -11.6, 0.25, -9.2, st(0x5a3a22)); furn(2.4, 2.3, 0.8, -8, 1.15, -9.4, st(0x6a4a2a)); furn(1.8, 0.8, 0.8, -15.2, 0.4, -4, st(0x5a3a22)); const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe9b0 })); lamp.position.set(-15.2, 1.1, -4); scene.add(lamp);
  // armory room: every gun you own hangs on the wall
  const owned = ((typeof userState !== 'undefined' && userState && userState.ownedWeapons) || []).filter(id => typeof R_GUN !== 'undefined' && R_GUN[id]).slice(0, 18);
  B(9.4, 0.12, 0.3, 11, 2.3, -9.6, st(0x3a3a3c), false); B(9.4, 0.12, 0.3, 11, 1.4, -9.6, st(0x3a3a3c), false); B(9.4, 2.6, 0.08, 11, 1.7, -9.78, st(0x23252a), false);
  owned.forEach((id, i) => { try { const gm = window.rdBuildGunModel(id, {}, { noShadow: true }), g = gm.group; g.scale.setScalar(1.15); g.rotation.y = -Math.PI / 2; g.position.set(6.9 + (i % 9) * 1.0, i < 9 ? 2.52 : 1.62, -9.5); scene.add(g); } catch (e) { } });
  const arSign = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: label([{ t: '🔫 ARMORY — ' + owned.length + ' gun' + (owned.length === 1 ? '' : 's'), f: 'bold 30px Arial' }], 400, 70) })); arSign.position.set(11, 3.1, -9.7); scene.add(arSign);
  furn(1.6, 0.8, 0.9, 14.6, 0.4, -2, st(0x3a4a2a)); furn(1.6, 0.8, 0.9, 14.6, 0.4, -4, st(0x3a4a2a)); furn(0.5, 1.8, 0.3, 8, 0.9, -3, st(0x2a2a2e)); const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), st(0x3a3a3c)); head.position.set(8, 2.0, -3); scene.add(head);
  // safe room: ten safes
  B(12, 0.1, 0.1, 0, 3.2, -9.6, st(0xd0a93a), false); const hh = window.HOUSE.H(); h.plane(5.5, 1.4, 0, -9.2, 0x8a6a28, 0.07, 0.6);
  window.HOUSE.SAFES.forEach((s, i) => {
    const [sx, sz, rot] = SAFE_SLOTS[i], d = safeDims(s), body = new THREE.Mesh(new THREE.BoxGeometry(d[0], d[1], d[2]), new THREE.MeshStandardMaterial({ color: s.col, metalness: 0.7, roughness: 0.35 })); body.position.set(sx, d[1] / 2, sz); body.rotation.y = rot; body.castShadow = true; scene.add(body);
    const door = new THREE.Mesh(new THREE.BoxGeometry(d[0] * 0.82, d[1] * 0.78, 0.05), new THREE.MeshStandardMaterial({ color: 0x20232a, metalness: 0.8, roughness: 0.3 })); door.position.set(0, 0, d[2] / 2 + 0.02); body.add(door);
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 14), new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.9, roughness: 0.2 })); dial.rotation.x = Math.PI / 2; dial.position.set(0.1, 0.05, d[2] / 2 + 0.07); body.add(dial); const hd = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.06), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 })); hd.position.set(-d[0] * 0.28, 0, d[2] / 2 + 0.07); body.add(hd);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: safeLabel(s), fog: false, transparent: true })); sp.scale.set(1.9, 0.67, 1); const off = new THREE.Vector3(0, d[1] / 2 + 0.55, 0); sp.position.set(sx, d[1] + 0.6, sz); scene.add(sp); void off;
    C(sx, sz, rot ? d[2] : d[0], rot ? d[0] : d[2], false, 0.05);
    const cont = { type: 'housesafe', name: s.name, x: sx + (rot === 0 ? 0 : Math.sign(Math.sin(rot)) * 0.0), z: sz + (rot === 0 ? 0.0 : 0), items: {}, mesh: body, lid: null, opened: false, time: 0.25, safeId: s.id }; R.containers.push(cont); safeObjs.push({ s, body, sprite: sp, cont });
  });
  refreshSafes();
  // outside: path, fence, trees, car, mailbox, street
  h.plane(3.2, 60, 0, 40, 0x9a968c, 0.05, 0.9); h.plane(400, 12, 0, 70, 0x2c2d30, 0.04, 0.9); h.plane(400, 0.4, 0, 70, 0xd8c85a, 0.05, 0.8);
  for (let x = -40; x <= 40; x += 4) [-30, 40].forEach(z => { if (z === 40 && Math.abs(x) < 3) return; B(0.15, 1.1, 0.15, x, 0.55, z, st(0xe8e8e8), false); B(4, 0.1, 0.06, x + 2, 0.9, z, st(0xe8e8e8), false); }); [-40, 40].forEach(x => { for (let z = -30; z <= 40; z += 4) { B(0.15, 1.1, 0.15, x, 0.55, z, st(0xe8e8e8), false); B(0.06, 0.1, 4, x, 0.9, z + 2, st(0xe8e8e8), false); } });
  for (let k = 0; k < 40; k++) { const a = Math.random() * 6.28, r = 24 + Math.random() * 22, x = Math.cos(a) * r, z = Math.sin(a) * r + 5; if (Math.abs(x) < 20 && Math.abs(z) < 14) continue; const t = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.4, 7), st(0x5a4028)); t.position.set(x, 1.2, z); scene.add(t); const c = new THREE.Mesh(new THREE.ConeGeometry(2.0, 5.4, 8), st(0x2f6a30)); c.position.set(x, 5, z); c.castShadow = true; scene.add(c); C(x, z, 0.5, 0.5, false, 0.1); }
  B(2.2, 1.0, 4.4, 22, 0.8, 16, st(0x3d5a8a, { metalness: 0.5, roughness: 0.4 })); B(1.9, 0.8, 2.2, 22, 1.6, 15.6, st(0x9fd0e8, { transparent: true, opacity: 0.5 }), false); [[-1, -1.4], [1, -1.4], [-1, 1.4], [1, 1.4]].forEach(p => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14), st(0x111111)); w.rotation.z = Math.PI / 2; w.position.set(22 + p[0] * 1.1, 0.42, 16 + p[1]); scene.add(w); }); C(22, 16, 2.2, 4.4, false, 0.1);
  B(0.2, 1.3, 0.2, 4, 0.65, 14, st(0x5a3a22), false); B(0.5, 0.35, 0.8, 4, 1.4, 14, st(0xaa2a2a), false);
  // spawn + front-door exit
  R.spawn = { x: 0, z: 6.5 }; yaw = 0; pitch = 0; R.limit = 999 * 60;
  if (camera) { camera.far = 600; camera.updateProjectionMatrix(); }
}
window.buildMapScene = function (i) {
  if (i !== IDX) { H3.on = false; return prevBuild(i); }
  OW.on = false; H3.on = true; H3.prevHighest = (typeof userState !== 'undefined' && userState && userState.highestMapUnlocked) || 1; ARENA_HALF = HALF; build(); setTimeout(() => { try { userState.highestMapUnlocked = H3.prevHighest; saveUserData(); } catch (e) { } }, 60);
};
window.rdOWSpawn = function () {
  if (!H3.on) return prevSpawn();
  const x = 0, z = 8.4, ring = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.08, 28), new THREE.MeshBasicMaterial({ color: 0x22ff88, transparent: true, opacity: 0.35 })); ring.position.set(x, 0.12, z); scene.add(ring);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.4, 8), new THREE.MeshBasicMaterial({ color: 0x66ffaa, transparent: true, opacity: 0.3 })); beam.position.set(x, 1.7, z); scene.add(beam); R.extracts.push({ x, z, r: 2.3, ring, beam, name: '🚪 Front door (hold E to leave)' }); return true;
};
window.rdShowResults = function (res) { if (res && res.mapIndex === IDX) { H3.on = false; try { ARENA_HALF = 66; } catch (e) { } goToMapSelect(); return; } return prevRes.apply(this, arguments); };
// opening a safe: holding F on it "searches" it (instantly empty) → open the safe manager, then give the container back
setInterval(() => {
  if (!H3.on || !R.on) return; try { refreshSafes(); } catch (e) { }
  R.containers.forEach(c => { if (c.type === 'housesafe' && c.opened) { c.opened = false; c.items = {}; c._items0 = c.items; if (window.HOUSE.openSafe) window.HOUSE.openSafe(c.safeId); } });
}, 120);
// pause while the safe manager is open, resume (and re-lock the mouse) when it closes
setInterval(() => { const el = document.getElementById('rdHouse'); if (!H3.on || !R.on || !el) return; const open = el.classList.contains('active'); if (open && !R.invOpen) { R.invOpen = true; if (document.pointerLockElement) document.exitPointerLock(); } else if (!open && R.invOpen && !document.getElementById('rdInv').classList.contains('active')) { R.invOpen = false; try { if (renderer && !IS_TOUCH) renderer.domElement.requestPointerLock(); } catch (e) { } } }, 150);
window.rdEnterHouse3D = function () {
  const u = userState, w = (u.equippedWeapon && typeof R_GUN !== 'undefined' && R_GUN[u.equippedWeapon]) ? u.equippedWeapon : 'pistol_mk1';
  window.rdEnterRaid(IDX, { pack: {}, vest: null, helmet: null, bag: null, weaponId: w, ammoType: '9mm_fmj', protect: true, mods: {} }); R.safe = null;
};
})();
