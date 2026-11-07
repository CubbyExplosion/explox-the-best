// ─── EXPLOX ROADS: 500 roads around the world, green direction signs, and rows of shops ───────────────────────
// • 500 real roads: a big new city grid, highways from Downtown to every country, a ring road around the whole world,
//   and streets in each country.
// • Green highway signs (white letters, arrows, distances) point you to every country, Downtown, the airport and more.
// • Rows of shops line the streets. Walk up to any shop door and press E to go in (they use the real Explox shops).
// Everything is drawn with a few instanced meshes, and shops appear only near you, so the game stays fast.
(function () {
  'use strict';
  if (typeof THREE === 'undefined' || typeof CITY_ZONES === 'undefined' || typeof CITY_COLS === 'undefined') return;
  try { if (localStorage.getItem('explox_noroads') === '1') return; } catch (e) { }   // a switch to turn the new roads off: localStorage.setItem('explox_noroads','1')
  const TAU = Math.PI * 2;
  const rnd = (() => { let a = 20261108; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const hash = (s) => { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const NAMES1 = ['Rainbow', 'Sunny', 'Candy', 'Dino', 'Rocket', 'Pizza', 'Happy', 'Maple', 'Cloud', 'Star', 'Bubble', 'Jolly', 'Cozy', 'Lucky', 'Silver', 'Golden', 'Berry', 'Mint', 'Panda', 'Comet', 'Tulip', 'Zippy', 'Cookie', 'Breeze', 'Sparkle', 'Pebble', 'Daisy', 'Turbo', 'Moonlight', 'Cherry'];
  const NAMES2 = ['Street', 'Avenue', 'Road', 'Lane', 'Way', 'Boulevard', 'Drive', 'Place'];

  // ── 1. plan the 500 roads ──────────────────────────────────────────────────────────────────
  const COUNTRIES = (typeof COUNTRY_CENTERS !== 'undefined') ? Object.keys(COUNTRY_CENTERS).map(k => ({ name: k, x: COUNTRY_CENTERS[k].x, z: COUNTRY_CENTERS[k].z })) : [];
  const GOALS = [{ name: 'DOWNTOWN', x: 0, z: 0 }, { name: 'SHOPPING DISTRICT', x: 0, z: 500 }, { name: 'THE AIRPORT', x: -200, z: -200 }, { name: 'THE SUBURBS', x: 300, z: 100 }].concat(COUNTRIES.map(c => ({ name: c.name.toUpperCase(), x: c.x, z: c.z })));
  function planRoads() {
    const roads = []; let id = 0;
    const R = (kind, name, x1, z1, x2, z2, w) => roads.push({ id: id++, kind: kind, name: name, x1: x1, z1: z1, x2: x2, z2: z2, w: w });
    // highways: Downtown -> each country, in segments
    COUNTRIES.forEach((c, ci) => { const d = Math.hypot(c.x, c.z), segs = Math.max(3, Math.round(d / 1300)); for (let k = 0; k < segs; k++) { const a = k / segs, b = (k + 1) / segs; R('highway', c.name + ' Highway ' + (k + 1), c.x * a, c.z * a, c.x * b, c.z * b, 18); } });
    // the ring road around the whole world (radius ~8000)
    const RING = 8000, RS = 40; for (let i = 0; i < RS; i++) { const a = i / RS * TAU, b = (i + 1) / RS * TAU; R('ring', 'World Ring Road ' + (i + 1), Math.cos(a) * RING, Math.sin(a) * RING, Math.cos(b) * RING, Math.sin(b) * RING, 20); }
    // a street grid in every country (outside the ring so it never runs through country buildings)
    COUNTRIES.forEach((c) => { const d = Math.hypot(c.x, c.z) || 1, ux = c.x / d, uz = c.z / d, ox = c.x + ux * 2500, oz = c.z + uz * 2500, nm = c.name; for (let i = 0; i < 4; i++) { for (let j = 0; j < 4; j++) { if (i < 4 && j < 3) R('local', nm + ' ' + pick(NAMES1) + ' ' + pick(NAMES2), ox + (i - 1.5) * 70 - 35 + 35, oz + (j - 1.5) * 70, ox + (i - 1.5) * 70 + 35, oz + (j - 1.5) * 70, 10); if (j < 4 && i < 3) R('local', nm + ' ' + pick(NAMES1) + ' ' + pick(NAMES2), ox + (i - 1.5) * 70 + 35, oz + (j - 1.5) * 70 - 35 + 35, ox + (i - 1.5) * 70 + 35, oz + (j - 1.5) * 70 + 35, 10); } } });
    // the big new Explox Metro grid
    const MX = -1300, MZ = 700; for (let i = 0; i < 20; i++) for (let j = 0; j < 20; j++) { const x = MX + i * 70, z = MZ + j * 70; if (i < 19) R('street', pick(NAMES1) + ' ' + pick(NAMES2), x, z, x + 70, z, 12); if (j < 19) R('street', pick(NAMES1) + ' ' + pick(NAMES2), x, z, x, z + 70, 12); }
    return roads;
  }
  const ORDER = { highway: 0, ring: 1, street: 2, local: 3 }, CAP = { highway: 999, ring: 999, street: 300, local: 999 };   // 94 highways + 300 city streets + the rest country streets = 500

  // ── 2. wait for the world, then build ─────────────────────────────────────────────────────
  let built = false, roads = [], signs = [], shopsData = {}, loaded = {}, stats = { roads: 0, signs: 0, shops: 0 };
  const CH = 200;
  const ckey = (x, z) => Math.floor(x / CH) + ',' + Math.floor(z / CH);
  const colGrid = {}; function gridCols() { CITY_COLS.forEach(c => { for (let gx = Math.floor((c.cx - c.hw) / 60); gx <= Math.floor((c.cx + c.hw) / 60); gx++) for (let gz = Math.floor((c.cz - c.hd) / 60); gz <= Math.floor((c.cz + c.hd) / 60); gz++) (colGrid[gx + ',' + gz] = colGrid[gx + ',' + gz] || []).push(c); }); }
  const blocked = (x, z, m) => { const l = colGrid[Math.floor(x / 60) + ',' + Math.floor(z / 60)]; if (!l) return false; for (const c of l) if (Math.abs(x - c.cx) < c.hw + m && Math.abs(z - c.cz) < c.hd + m) return true; return false; };
  const flat = (x, z) => { try { return Math.abs(groundHeightAt(x, z)) < .25; } catch (e) { return true; } };
  const zoneNear = (x, z, r) => { for (const q of CITY_ZONES) if (Math.abs(q.x - x) < r && Math.abs(q.z - z) < r) return true; return false; };

  function build() {
    gridCols();
    const all = planRoads().sort((a, b) => ORDER[a.kind] - ORDER[b.kind]);
    // keep only roads that do not run through existing buildings, on flat ground; keep the first 500
    const cnt = {}; for (const r of all) { if (roads.length >= 500) break; if ((cnt[r.kind] || 0) >= CAP[r.kind]) continue; const mx = (r.x1 + r.x2) / 2, mz = (r.z1 + r.z2) / 2; if (r.kind !== 'highway' && r.kind !== 'ring') { if (blocked(mx, mz, 6) || blocked(r.x1, r.z1, 3) || blocked(r.x2, r.z2, 3) || !flat(mx, mz)) continue; } r.dx = r.x2 - r.x1; r.dz = r.z2 - r.z1; r.len = Math.hypot(r.dx, r.dz); r.ux = r.dx / r.len; r.uz = r.dz / r.len; r.rot = Math.atan2(r.dx, r.dz); r.cx = (r.x1 + r.x2) / 2; r.cz = (r.z1 + r.z2) / 2; roads.push(r); cnt[r.kind] = (cnt[r.kind] || 0) + 1; }
    // if some candidates were skipped, fill up from the leftover street candidates so the total is exactly 500 when possible
    if (roads.length < 500) { for (const r of all) { if (roads.length >= 500) break; if (roads.includes(r) || r.kind === 'highway' || r.kind === 'ring') continue; r.dx = r.x2 - r.x1; r.dz = r.z2 - r.z1; r.len = Math.hypot(r.dx, r.dz); r.ux = r.dx / r.len; r.uz = r.dz / r.len; r.rot = Math.atan2(r.dx, r.dz); r.cx = (r.x1 + r.x2) / 2; r.cz = (r.z1 + r.z2) / 2; if (!blocked(r.cx, r.cz, 1)) roads.push(r); } }
    drawRoads(); planSigns(); drawSigns(); planShops();
    stats.roads = roads.length; stats.signs = signs.length; built = true;
  }

  // ── roads: a handful of instanced meshes ────────────────────────────────────────────────
  const dummy = new THREE.Object3D();
  function drawRoads() {
    let nDash = 0; roads.forEach(r => { nDash += Math.floor(r.len / (r.kind === 'highway' || r.kind === 'ring' ? 22 : 14)) + 1; });
    const nSide = roads.filter(r => r.kind === 'street' || r.kind === 'local').length * 2;
    const surf = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), roads.length);
    const dash = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xffdd00 }), nDash);
    const edge = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xf5f5f5 }), roads.length * 2);
    const side = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xb0b6bd }), Math.max(1, nSide));
    let is = 0, id = 0, ie = 0, ik = 0;
    roads.forEach(r => {
      const hw = r.kind === 'highway' || r.kind === 'ring';
      dummy.position.set(r.cx, .03, r.cz); dummy.rotation.set(0, r.rot, 0); dummy.scale.set(r.w, .06, r.len + .5); dummy.updateMatrix(); surf.setMatrixAt(is, dummy.matrix); surf.setColorAt(is, new THREE.Color(hw ? 0x3a3f48 : 0x4a4f5a)); is++;
      [-1, 1].forEach(s => { const o = s * (r.w / 2 - .6); dummy.position.set(r.cx - r.uz * o, .07, r.cz + r.ux * o); dummy.scale.set(.25, .06, r.len); dummy.updateMatrix(); edge.setMatrixAt(ie++, dummy.matrix); });
      if (!hw) [-1, 1].forEach(s => { const o = s * (r.w / 2 + 1.5); dummy.position.set(r.cx - r.uz * o, .09, r.cz + r.ux * o); dummy.scale.set(3, .18, r.len); dummy.updateMatrix(); side.setMatrixAt(ik++, dummy.matrix); });
      const step = hw ? 22 : 14, n = Math.floor(r.len / step); for (let i = 0; i < n; i++) { const t = (i + .5) * step; dummy.position.set(r.x1 + r.ux * t, .08, r.z1 + r.uz * t); dummy.rotation.set(0, r.rot, 0); dummy.scale.set(.3, .06, hw ? 9 : 5); dummy.updateMatrix(); dash.setMatrixAt(id++, dummy.matrix); }
    });
    [[surf, is], [dash, id], [edge, ie], [side, ik]].forEach(a => { a[0].count = a[1]; a[0].instanceMatrix.needsUpdate = true; a[0].frustumCulled = false; a[0].receiveShadow = true; if (a[0].instanceColor) a[0].instanceColor.needsUpdate = true; scene.add(a[0]); });
  }

  // ── green direction signs ───────────────────────────────────────────────────────────────
  function planSigns() {
    const want = (r) => r.kind === 'highway' || r.kind === 'ring';
    roads.forEach((r, i) => {
      if (want(r)) { [[0, 1], [.5, -1]].forEach(([t, dirS]) => { const dir = dirS; signs.push(mkSign(r.x1 + r.dx * t, r.z1 + r.dz * t, r.ux * dir, r.uz * dir, r.w, r)); }); }
      else if (r.kind === 'street' && i % 7 === 0) signs.push(mkSign(r.cx, r.cz, r.ux, r.uz, r.w, r)); else if (r.kind === 'local' && i % 5 === 0) signs.push(mkSign(r.cx, r.cz, r.ux, r.uz, r.w, r));
    });
  }
  function mkSign(x, z, ux, uz, w, r) {
    // sign stands on the driver's right, facing the oncoming driver
    const px = x - uz * (w / 2 + 3.5), pz = z + ux * (w / 2 + 3.5);
    return { x: px, z: pz, rot: Math.atan2(-ux, -uz), ux: ux, uz: uz, road: r };
  }
  function signLines(s) {
    const goals = GOALS.map(g => { const tx = g.x - s.x, tz = g.z - s.z, d = Math.hypot(tx, tz) || 1, cr = s.ux * (tz / d) - s.uz * (tx / d), dot = s.ux * (tx / d) + s.uz * (tz / d); return { g: g, d: d, dot: dot, cr: cr }; });
    const near = s.road.kind === 'highway' || s.road.kind === 'ring' ? goals.filter(o => o.d > 250).sort((a, b) => (b.dot * 1.2 - b.d / 20000) - (a.dot * 1.2 - a.d / 20000)).slice(0, 3) : goals.filter(o => o.d < 3000 || o.g.name === 'DOWNTOWN').sort((a, b) => a.d - b.d).slice(0, 3);
    return near.map(o => ({ name: o.g.name, m: Math.round(o.d / 10) * 10, arrow: o.dot > .55 ? '↑' : o.dot < -.55 ? '↓' : (o.cr > 0 ? '→' : '←') }));
  }
  const SIGN_POOL = 16, pool = [];
  function drawSigns() {
    const n = signs.length, boardG = new THREE.BoxGeometry(1, 1, 1);
    const boards = new THREE.InstancedMesh(boardG, new THREE.MeshLambertMaterial({ color: 0x0a7a35 }), n), rims = new THREE.InstancedMesh(boardG, new THREE.MeshLambertMaterial({ color: 0xffffff }), n), posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(.12, .12, 1, 8), new THREE.MeshLambertMaterial({ color: 0x9aa3ad }), n * 2);
    signs.forEach((s, i) => {
      dummy.position.set(s.x, 5.2, s.z); dummy.rotation.set(0, s.rot, 0); dummy.scale.set(8, 2.8, .2); dummy.updateMatrix(); boards.setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x - Math.sin(s.rot) * .12, 5.2, s.z - Math.cos(s.rot) * .12); dummy.scale.set(8.4, 3.2, .16); dummy.updateMatrix(); rims.setMatrixAt(i, dummy.matrix);
      [-3, 3].forEach((o, k) => { dummy.position.set(s.x + Math.cos(s.rot) * o, 2.6, s.z - Math.sin(s.rot) * o); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 5.2, 1); dummy.updateMatrix(); posts.setMatrixAt(i * 2 + k, dummy.matrix); });
    });
    [boards, rims, posts].forEach(m => { m.instanceMatrix.needsUpdate = true; m.frustumCulled = false; scene.add(m); });
    for (let i = 0; i < SIGN_POOL; i++) { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 176; const tex = new THREE.CanvasTexture(cv); const m = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 2.6), new THREE.MeshBasicMaterial({ map: tex })); m.visible = false; scene.add(m); pool.push({ mesh: m, cv: cv, tex: tex, sign: null }); }
  }
  function paintSign(p, s) {
    const x = p.cv.getContext('2d'); x.fillStyle = '#0a7a35'; x.fillRect(0, 0, 512, 176); x.strokeStyle = '#ffffff'; x.lineWidth = 8; x.strokeRect(6, 6, 500, 164); const lines = s.lines || (s.lines = signLines(s)); x.fillStyle = '#ffffff'; x.textBaseline = 'middle';
    if (s.road.kind === 'street' || s.road.kind === 'local') { x.font = 'bold 40px Arial'; x.textAlign = 'center'; x.fillText(s.road.name.toUpperCase().slice(0, 24), 256, 40); x.font = 'bold 26px Arial'; lines.slice(0, 2).forEach((l, i) => { x.textAlign = 'left'; x.fillText(l.arrow + ' ' + l.name, 24, 92 + i * 34); x.textAlign = 'right'; x.fillText(l.m + ' m', 488, 92 + i * 34); }); }
    else { x.font = 'bold 30px Arial'; lines.slice(0, 3).forEach((l, i) => { x.textAlign = 'left'; x.fillText(l.arrow + '  ' + l.name, 20, 30 + i * 52); x.textAlign = 'right'; x.fillText(l.m.toLocaleString() + ' m', 492, 30 + i * 52); }); }
    p.tex.needsUpdate = true;
  }

  // ── rows of shops along the streets (made only near the player) ─────────────────────────────
  function planShops() {
    const SD = 10, SW = 14;
    roads.forEach(r => {
      if ((r.kind !== 'street' && r.kind !== 'local') || (Math.abs(r.dx) > .01 && Math.abs(r.dz) > .01)) return;
      const n = Math.floor(r.len / (SW + 2));
      [-1, 1].forEach(side => { for (let i = 0; i < n; i++) { const t = (i + .5) * (SW + 2) + 1, off = side * (r.w / 2 + 4.5 + SD / 2), x = r.x1 + r.ux * t - r.uz * off, z = r.z1 + r.uz * t + r.ux * off; if (blocked(x, z, 8)) continue; const k = ckey(x, z); (shopsData[k] = shopsData[k] || []).push({ x: x, z: z, nx: r.uz * side, nz: -r.ux * side, h: 5 + (hash(x + '' + z) % 5), col: [0xff8a65, 0x4fc3f7, 0xffd54f, 0xba68c8, 0x81c784, 0xf06292, 0x4db6ac, 0xa1887f][hash(x + 'c' + z) % 8], idx: hash(r.id + ':' + i + ':' + side) }); stats.shops++; } });
    });
  }
  const shopList = () => (typeof CITY_SHOPS !== 'undefined' ? CITY_SHOPS : []).concat(typeof MALL_SHOPS !== 'undefined' ? MALL_SHOPS : []);
  const signTex = {}; function shopSignTex(name, emoji) { const key = name; if (signTex[key]) return signTex[key]; const cv = document.createElement('canvas'); cv.width = 256; cv.height = 80; const x = cv.getContext('2d'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, 256, 80); x.strokeStyle = '#1b1b2f'; x.lineWidth = 5; x.strokeRect(2, 2, 252, 76); x.fillStyle = '#1b1b2f'; x.font = '34px Arial'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(emoji || '', 12, 42); x.font = 'bold 20px Arial'; x.fillText(String(name).slice(0, 18), 58, 42); return signTex[key] = new THREE.CanvasTexture(cv); }
  const mats = {}; const mat = (c) => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }));
  const GB = new THREE.BoxGeometry(1, 1, 1);
  function loadChunk(k) {
    const list = shopsData[k]; if (!list) { loaded[k] = { objs: [], zones: [], cols: [] }; return; }
    const sl = shopList(); const L = { objs: [], zones: [], cols: [] }; loaded[k] = L;
    list.forEach(s => {
      const shop = sl.length ? sl[s.idx % sl.length] : null; const g = new THREE.Group(); g.position.set(s.x, 0, s.z); g.rotation.y = Math.atan2(s.nx, s.nz);
      const body = new THREE.Mesh(GB, mat(s.col)); body.scale.set(14, s.h, 10); body.position.y = s.h / 2; g.add(body);
      const roof = new THREE.Mesh(GB, mat(0x37474f)); roof.scale.set(14.6, .5, 10.6); roof.position.y = s.h + .25; g.add(roof);
      const door = new THREE.Mesh(GB, mat(0x5d4037)); door.scale.set(2, 3, .3); door.position.set(0, 1.5, 5.05); g.add(door);
      [-4.5, 4.5].forEach(x => { const w = new THREE.Mesh(GB, new THREE.MeshLambertMaterial({ color: 0xfff59d, emissive: 0xffe082, emissiveIntensity: .45 })); w.scale.set(2.6, 2, .2); w.position.set(x, 2.2, 5.05); g.add(w); });
      if (shop) { const sg = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.2), new THREE.MeshBasicMaterial({ map: shopSignTex(shop.name, shop.emoji) })); sg.position.set(0, 4.2, 5.2); g.add(sg); }
      scene.add(g); L.objs.push(g);
      const col = addCol(CITY_COLS, s.x, s.z, 7, 5); L.cols.push(col);
      if (shop) { const z = { x: s.x + s.nx * 7.6, z: s.z + s.nz * 7.6, r: 3, label: (shop.emoji || '') + ' ' + shop.name, action: () => { try { enterShopInterior('mall', shop.id); } catch (e) { } } }; CITY_ZONES.push(z); L.zones.push(z); }
    });
  }
  function unloadChunk(k) { const L = loaded[k]; if (!L) return; L.objs.forEach(o => { scene.remove(o); }); L.zones.forEach(z => { const i = CITY_ZONES.indexOf(z); if (i > -1) CITY_ZONES.splice(i, 1); }); L.cols.forEach(c => { const i = CITY_COLS.indexOf(c); if (i > -1) CITY_COLS.splice(i, 1); }); delete loaded[k]; }

  // ── keep what is near the player ──────────────────────────────────────────────────────────
  const indoors = () => { try { return typeof isPlayerIndoors === 'function' && isPlayerIndoors(); } catch (e) { return false; } };
  function stream() {
    if (!built || typeof playerGroup === 'undefined' || !playerGroup || indoors()) return;
    const px = playerGroup.position.x, pz = playerGroup.position.z, cx = Math.floor(px / CH), cz = Math.floor(pz / CH), want = {};
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) want[(cx + i) + ',' + (cz + j)] = 1;
    Object.keys(want).forEach(k => { if (!loaded[k]) loadChunk(k); });
    Object.keys(loaded).forEach(k => { if (!want[k]) unloadChunk(k); });
    // green signs: text only on the 16 nearest
    const near = []; for (const s of signs) { const d = Math.abs(s.x - px) + Math.abs(s.z - pz); if (d < 420) near.push([d, s]); } near.sort((a, b) => a[0] - b[0]);
    pool.forEach((p, i) => { const e = near[i]; if (!e) { p.mesh.visible = false; p.sign = null; return; } const s = e[1]; if (p.sign !== s) { p.sign = s; paintSign(p, s); } p.mesh.visible = true; p.mesh.position.set(s.x + Math.sin(s.rot) * .22, 5.2, s.z + Math.cos(s.rot) * .22); p.mesh.rotation.y = s.rot; });
  }
  let tries = 0;
  const boot = setInterval(() => {
    tries++; if (built) { clearInterval(boot); return; }
    if (typeof scene === 'undefined' || !scene || typeof playerGroup === 'undefined' || !playerGroup || !CITY_COLS.length) { if (tries > 600) clearInterval(boot); return; }
    if (tries < 6) return;     // let the rest of the world finish building first
    try { build(); } catch (e) { built = true; console.warn('roads failed', e); }
  }, 1500);
  setInterval(() => { try { stream(); } catch (e) { } }, 500);
  window.__exploxRoads = { build: build, stats: stats, roads: () => roads, signs: () => signs, planRoads: planRoads, shopsData: () => shopsData, stream: stream };
})();
