// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — REALISTIC VEHICLES  (Team Battle, No Mercy, Hardcore: jeeps, armoured cars, tanks, MG turrets — yours and the enemy's)
//   Models: camouflage-painted hulls with weathering, wheel rims and lug nuts, bumpers, grilles, mirrors, headlights/tail-lights, roll bars, spare
//   wheels, jerry cans, antennas, smoke launchers, hatches, side skirts; tanks get real track links, sprockets, a commander's cupola MG, a barrel
//   with a muzzle brake, stowage and mud flaps. Enemy vehicles are painted dark with red markings and unit numbers.
//   Behaviour: bodies pitch when braking/accelerating and roll in turns, the cannon recoils, exhaust smoke, dust and mud kicked up behind the
//   wheels, muzzle flashes, damaged vehicles smoke then burn, wrecks stay black and burning, and every vehicle has an engine sound
//   (jeep growl, APC diesel, tank rumble + track clatter) that you hear in 3D.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const BT = window.BATTLE, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
const M = {};
function mats() {
  if (M.dark) return M; const S = o => new THREE.MeshStandardMaterial(o);
  M.dark = S({ color: 0x1d1e20, roughness: 0.55, metalness: 0.7 }); M.rubber = S({ color: 0x0c0c0d, roughness: 1 }); M.rim = S({ color: 0x9aa0a6, roughness: 0.3, metalness: 0.9 }); M.steel = S({ color: 0x55595e, roughness: 0.4, metalness: 0.85 });
  const tc = document.createElement('canvas'); tc.width = 32; tc.height = 128; const tx = tc.getContext('2d'); tx.fillStyle = '#1a1a1a'; tx.fillRect(0, 0, 32, 128); tx.fillStyle = '#3a3836'; for (let i = 0; i < 16; i++) tx.fillRect(2, i * 8 + 1, 28, 5); const tt = new THREE.CanvasTexture(tc); tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(1, 10); M.track = S({ color: 0xffffff, map: tt, roughness: 1 });
  M.lamp = new THREE.MeshBasicMaterial({ color: 0xfff2c0 }); M.tail = new THREE.MeshBasicMaterial({ color: 0xc01010 }); M.canvas = S({ color: 0x4a5238, roughness: 1 }); M.olive = S({ color: 0x3f4a35, roughness: 0.8, metalness: 0.3 });
  return M;
}
function camoTex(base, spots) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = base; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 60; i++) { x.fillStyle = spots[i % spots.length]; x.beginPath(); const px = Math.random() * 256, py = Math.random() * 256; x.ellipse(px, py, 10 + Math.random() * 30, 6 + Math.random() * 18, Math.random() * 3, 0, 6.3); x.fill(); }
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.07})`; x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 3); }
  const g = x.createLinearGradient(0, 160, 0, 256); g.addColorStop(0, 'rgba(70,55,35,0)'); g.addColorStop(1, 'rgba(70,55,35,.45)'); x.fillStyle = g; x.fillRect(0, 160, 256, 96);          // mud splash along the bottom
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t;
}
const camoA = () => camoTex('#4a5a40', ['#3a4630', '#6b6a48', '#2f3a2a', '#7a7550']), camoB = () => camoTex('#4a3b34', ['#33271f', '#5b4a3a', '#262021', '#6a4a3a']);
const numTex = (n, col) => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = col; x.font = 'bold 46px Arial'; x.textAlign = 'center'; x.fillText(String(n), 32, 50); const t = new THREE.CanvasTexture(c); return new THREE.MeshBasicMaterial({ map: t, transparent: true }); };
let puffTex = null;
function puffT() { if (puffTex) return puffTex; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return puffTex = new THREE.CanvasTexture(c); }

function decorate(v) {
  const m = mats(), g = v.mesh, k = v.kind, enemy = v.team === 'B', D = (w, h, d, mat, x, y, z, parent) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x, y, z); o.castShadow = true; o.userData.vehicle = true; (parent || g).add(o); return o; };
  const Cy = (r0, r1, h, mat, x, y, z, parent, rx, rz) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, 12), mat); o.position.set(x, y, z); if (rx) o.rotation.x = rx; if (rz) o.rotation.z = rz; o.castShadow = true; o.userData.vehicle = true; (parent || g).add(o); return o; };
  // paint: camouflage + weathering (replaces the plain body colour)
  const camo = new THREE.MeshStandardMaterial({ color: 0xffffff, map: enemy ? camoB() : camoA(), roughness: 0.62, metalness: 0.35 });
  const bodyCols = [0x3d5a8a, 0x8a3d34, 0x3a4f3a, 0x4f3a30]; g.traverse(o => { if (o.isMesh && o.material && o.material.color && bodyCols.includes(o.material.color.getHex())) o.material = camo; });
  v._camo = camo;
  // wheels: rims, hubs, lug nuts
  v.wheels.forEach(w => { const r = w.geometry.parameters.radiusTop; const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.62, r * 0.62, 0.5, 14), m.rim); w.add(rim); [-1, 1].forEach(s => { const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.06, 8), m.dark); hub.position.y = s * 0.27; w.add(hub); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28, n = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), m.dark); n.position.set(Math.cos(a) * r * 0.36, s * 0.27, Math.sin(a) * r * 0.36); w.add(n); } }); });
  if (k === 'jeep') {
    D(1.5, 0.45, 0.14, m.dark, 0, 1.0, 1.98); D(1.0, 0.3, 0.05, m.dark, 0, 1.1, 2.0).userData.grille = 1; [-1, 1].forEach(s => { D(0.3, 0.3, 0.1, m.lamp, s * 0.7, 1.15, 2.0); D(0.16, 0.14, 0.06, m.tail, s * 0.88, 1.0, -1.93); D(0.12, 0.12, 0.35, m.dark, s * 1.08, 1.45, 0.6); D(0.18, 0.2, 0.04, m.dark, s * 1.1, 1.52, 0.78); D(0.5, 0.06, 1.4, m.dark, s * 1.05, 0.62, 1.2); D(0.5, 0.06, 1.0, m.dark, s * 1.05, 0.62, -1.3); });
    D(1.9, 0.14, 0.2, m.dark, 0, 0.55, 2.0); D(1.9, 0.14, 0.2, m.dark, 0, 0.55, -2.0); Cy(0.45, 0.45, 0.3, m.rubber, 0, 1.4, -2.05, g, Math.PI / 2); Cy(0.25, 0.25, 0.4, m.olive, 0.7, 1.25, -1.9); Cy(0.02, 0.02, 2.2, m.dark, -0.9, 2.2, -1.6);
    D(0.7, 0.02, 0.5, m.canvas, 0, 1.28, -0.6).visible = false; const sh = D(0.9, 0.7, 0.08, m.dark, 0, 0.45, 0.45, v.turret); sh.rotation.x = 0.1; const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), numTex(Math.floor(rnd(11, 99)), enemy ? '#ffeeee' : '#eef'));
    pl.position.set(1.01, 1.0, 0); pl.rotation.y = Math.PI / 2; g.add(pl); const pl2 = pl.clone(); pl2.position.x = -1.01; pl2.rotation.y = -Math.PI / 2; g.add(pl2); v._exh = [new THREE.Vector3(0.7, 0.55, -1.95)]; v._eng = new THREE.Vector3(0, 1.45, 1.2);
  } else if (k === 'apc') {
    [-1, 1].forEach(s => { D(0.12, 0.7, 5.2, m.dark, s * 1.34, 0.75, 0); D(0.08, 0.5, 1.2, m.steel, s * 1.34, 1.5, 0.4); Cy(0.1, 0.1, 0.5, m.dark, s * 0.5, 2.2, 2.2, g, Math.PI / 2); D(0.3, 0.3, 0.1, m.lamp, s * 0.9, 1.3, 3.5); D(0.2, 0.18, 0.06, m.tail, s * 1.1, 1.3, -3.02); }); for (let i = 0; i < 4; i++) Cy(0.09, 0.09, 0.45, m.dark, -0.7 + i * 0.45, 2.1, 0.3, g, 0, 0).rotation.x = 0.8;
    D(0.9, 0.1, 0.9, m.dark, 0.7, 1.96, -1.4); D(0.7, 0.05, 0.7, m.steel, 0.7, 2.03, -1.4); Cy(0.02, 0.02, 2.4, m.dark, 1.2, 3.0, -2.4); Cy(0.02, 0.02, 1.8, m.dark, -1.2, 2.8, -2.4); Cy(0.5, 0.5, 0.3, m.rubber, 0, 1.6, -3.1, g, Math.PI / 2);
    D(1.3, 0.5, 0.1, m.dark, 0, 0.9, 3.15); const sh = D(1.0, 0.6, 0.08, m.dark, 0, 0.7, 0.75, v.turret); void sh; const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), numTex(Math.floor(rnd(100, 999)), enemy ? '#ffeeee' : '#eef')); pl.position.set(1.31, 1.4, 0.6); pl.rotation.y = Math.PI / 2; g.add(pl); v._exh = [new THREE.Vector3(-1.2, 0.8, -3.0)]; v._eng = new THREE.Vector3(0, 1.8, 2.6);
  } else if (k === 'tank') {
    const tl = (s) => { D(1.0, 0.1, 6.8, m.track, s * 2.0, 1.32, 0); D(1.0, 0.1, 6.8, m.track, s * 2.0, 0.05, 0); [-3.4, 3.4].forEach(z => Cy(0.62, 0.62, 0.9, m.steel, s * 2.0, 0.68, z, g, 0, Math.PI / 2)); D(0.12, 0.8, 6.0, m.steel, s * 2.55, 0.9, 0); D(0.2, 0.3, 1.8, m.dark, s * 2.2, 1.45, 2.6); };
    [-1, 1].forEach(tl); [-1, 1].forEach(s => { D(0.3, 0.06, 0.9, m.dark, s * 2.0, 1.45, -3.6); D(0.35, 0.35, 0.1, m.lamp, s * 1.0, 1.35, 4.05); D(0.2, 0.2, 0.06, m.tail, s * 1.3, 1.3, -3.34); });
    D(2.2, 0.1, 1.6, m.dark, 0, 1.62, -2.6); for (let i = 0; i < 6; i++) D(2.0, 0.03, 0.08, m.steel, 0, 1.68, -3.2 + i * 0.22); D(0.8, 0.6, 0.8, m.olive, 1.2, 1.9, -3.0); D(0.5, 0.4, 0.6, m.canvas, -1.1, 1.9, -3.0); Cy(0.025, 0.025, 3.0, m.dark, -1.4, 3.4, -3.2); D(1.2, 0.04, 0.5, m.dark, 0, 1.0, 4.2);
    const T = v.turret; Cy(0.45, 0.5, 0.2, m.dark, -0.6, 1.15, -0.3, T); Cy(0.05, 0.05, 0.9, m.dark, -0.6, 1.5, -0.3, T); D(0.4, 0.15, 0.2, m.dark, -0.6, 1.2, 0.1, T); for (let i = 0; i < 3; i++) { Cy(0.07, 0.07, 0.3, m.dark, -1.3, 0.8, 0.3 + i * 0.25, T, Math.PI / 2); Cy(0.07, 0.07, 0.3, m.dark, 1.3, 0.8, 0.3 + i * 0.25, T, Math.PI / 2); }
    D(2.2, 0.5, 0.7, m.canvas, 0, 0.6, -1.7, T); D(0.35, 0.2, 0.35, m.dark, 0.9, 0.95, 0.9, T); Cy(0.025, 0.025, 2.4, m.dark, 1.0, 2.1, -1.4, T);
    if (v.barrel) { Cy(0.22, 0.22, 0.5, m.dark, 0, 0.6, 0, v.barrel); D(0.5, 0.5, 0.3, m.steel, 0, 2.55, 0, v.barrel); }
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), numTex(Math.floor(rnd(100, 999)), enemy ? '#ffeeee' : '#eef')); pl.position.set(1.27, 0.4, 0.5); pl.rotation.y = Math.PI / 2; T.add(pl); const pl2 = pl.clone(); pl2.position.x = -1.27; pl2.rotation.y = -Math.PI / 2; T.add(pl2); v._exh = [new THREE.Vector3(0.9, 1.5, -3.3), new THREE.Vector3(-0.9, 1.5, -3.3)]; v._eng = new THREE.Vector3(0, 1.8, -2.4);
  } else if (k === 'turret') { v._exh = []; v._eng = new THREE.Vector3(0, 1.2, 0); }
  g.rotation.order = 'YXZ'; v._dec = true; v._tilt = { p: 0, r: 0, lastSpeed: 0 }; v._exh = v._exh || []; v._eng = v._eng || new THREE.Vector3(0, 1.4, 1);
}

// ───────── particles (smoke / dust / fire / flashes) ─────────
const parts = [];
function puff(pos, o) {
  const mat = new THREE.SpriteMaterial({ map: puffT(), color: o.color, transparent: true, depthWrite: false, opacity: o.op, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending }); const s = new THREE.Sprite(mat); s.position.copy(pos); s.scale.setScalar(o.s0); scene.add(s);
  parts.push({ s, v: o.v || new THREE.Vector3(0, 1, 0), t: 0, life: o.life, s0: o.s0, s1: o.s1, op: o.op });
}
function stepParts(dt) { for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.t += dt; const k = p.t / p.life; if (k >= 1) { scene.remove(p.s); p.s.material.dispose(); parts.splice(i, 1); continue; } p.s.position.addScaledVector(p.v, dt); p.s.scale.setScalar(p.s0 + (p.s1 - p.s0) * k); p.s.material.opacity = p.op * (1 - k) * (k < 0.1 ? k * 10 : 1); } }

// ───────── engine sounds ─────────
let voices = null, AC = null;
function audio() {
  if (voices) return; const a = window.RDX && window.RDX.api && window.RDX.api.getAudio && window.RDX.api.getAudio(); if (!a || !a.AC) return; AC = a.AC; voices = [];
  for (let i = 0; i < 3; i++) { const o1 = AC.createOscillator(), o2 = AC.createOscillator(), lp = AC.createBiquadFilter(), g = AC.createGain(); o1.type = 'sawtooth'; o2.type = 'square'; lp.type = 'lowpass'; lp.frequency.value = 300; g.gain.value = 0; o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(a.master); o1.start(); o2.start(); voices.push({ o1, o2, lp, g, v: null }); }
}
function engines() {
  audio(); if (!voices || !BT.on) return; const cam = camera; const list = BT.vehicles.filter(v => v.alive && !v.def.static && (v.ai || v.occ)).map(v => ({ v, d: Math.hypot(v.pos.x - cam.position.x, v.pos.z - cam.position.z) })).filter(o => o.d < 110).sort((a, b) => a.d - b.d).slice(0, 3);
  voices.forEach((vo, i) => { const e = list[i], t = AC.currentTime; if (!e) { vo.g.gain.setTargetAtTime(0, t, 0.1); return; } const v = e.v, sp = Math.abs(v.speed), base = v.kind === 'tank' ? 24 : v.kind === 'apc' ? 36 : 52, f = base + sp * (v.kind === 'tank' ? 3.2 : v.kind === 'apc' ? 4.5 : 5.5) + (v.occ === 'player' ? 6 : 0);
    vo.o1.frequency.setTargetAtTime(f, t, 0.12); vo.o2.frequency.setTargetAtTime(f * 0.5 + 1.3, t, 0.12); vo.lp.frequency.setTargetAtTime(220 + sp * 25, t, 0.2); vo.g.gain.setTargetAtTime((v.occ === 'player' ? 0.09 : 0.14) / (1 + e.d * 0.07) * (0.55 + Math.min(1, sp / 12) * 0.45), t, 0.15); });
}
let clackT = 0;
function tankClack(dt) { clackT -= dt; if (clackT > 0) return; clackT = 0.09; const cam = camera, api = window.RDX.api; BT.vehicles.forEach(v => { if (v.kind !== 'tank' || !v.alive || Math.abs(v.speed) < 2) return; const d = Math.hypot(v.pos.x - cam.position.x, v.pos.z - cam.position.z); if (d < 60) api.noise(0.04, 1800, 700, 0.12 / (1 + d * 0.1), 'bandpass'); }); }

// ───────── per-frame behaviour ─────────
let last = performance.now(), acc = 0, engT = 0;
function frame(dt) {
  if (!BT.on || !window.RAID || !RAID.on) return; const cam = camera; acc += dt; engT -= dt;
  BT.vehicles.forEach(v => {
    if (!v._dec) decorate(v); const m = v.mesh, d = Math.hypot(v.pos.x - cam.position.x, v.pos.z - cam.position.z); if (d > 200) return;
    const sp = v.speed || 0, ax = (sp - v._tilt.lastSpeed) / Math.max(dt, 0.001); v._tilt.lastSpeed = sp;
    if (v.alive && !v.def.static) { v._tilt.p += (clamp(-ax * 0.004, -0.06, 0.06) - v._tilt.p) * Math.min(1, dt * 5); const steerRate = (v.yaw - (v._lastYaw === undefined ? v.yaw : v._lastYaw)) / Math.max(dt, 0.001); v._tilt.r += (clamp(-steerRate * sp * 0.0025, -0.07, 0.07) - v._tilt.r) * Math.min(1, dt * 5); m.rotation.x = v._tilt.p + Math.sin(performance.now() / 90 + v.pos.x) * 0.004 * Math.min(1, Math.abs(sp) / 8); m.rotation.z = v._tilt.r; }
    v._lastYaw = v.yaw;
    if (v.barrel) { const kick = v._kick || 0; v.barrel.position.z = 3.3 - kick; v._kick = Math.max(0, kick - dt * 2.2); }
    if (v.cannonCd > (v._cd || 0) + 0.5 && v.kind === 'tank') { v._kick = 0.55; flash(v, 2.2); }
    if (v.mgCd > (v._mg || 0) + 0.02 && v.turret) flash(v, 0.5);
    v._cd = v.cannonCd; v._mg = v.mgCd;
    if (!v.alive) { if (!v._wreck) { v._wreck = true; v._camo.color.set(0x1a1816); v._camo.map = null; v._camo.needsUpdate = true; v._camo.roughness = 1; } v._fireT = (v._fireT || 0) - dt; if (v._fireT <= 0 && d < 140) { v._fireT = 0.09; const p = v.pos.clone().add(new THREE.Vector3(rnd(-0.8, 0.8), 1.5, rnd(-0.8, 0.8))); puff(p, { color: 0xff7a22, s0: 0.8, s1: 1.8, life: 0.5, op: 0.85, add: true, v: new THREE.Vector3(0, 2.5, 0) }); if (Math.random() < 0.6) puff(p.clone().add(new THREE.Vector3(0, 0.6, 0)), { color: 0x151515, s0: 1.2, s1: 4.5, life: 2.8, op: 0.7, v: new THREE.Vector3(rnd(-0.4, 0.4), 3, rnd(-0.4, 0.4)) }); } return; }
    const ratio = v.hp / v.maxHp; v._smT = (v._smT || 0) - dt;
    if (v._smT <= 0 && d < 120) {
      v._smT = 0.1; const eng = v._eng.clone().applyMatrix4(m.matrixWorld);
      if (ratio < 0.5) puff(eng, { color: ratio < 0.25 ? 0x151515 : 0x77736e, s0: 0.5, s1: 2.6, life: 1.8, op: 0.7, v: new THREE.Vector3(rnd(-0.3, 0.3), 2.2, rnd(-0.3, 0.3)) });
      if (ratio < 0.25) puff(eng, { color: 0xff7a22, s0: 0.6, s1: 1.4, life: 0.45, op: 0.85, add: true, v: new THREE.Vector3(0, 2.5, 0) });
      if (Math.abs(sp) > 1 || v.occ === 'player' || v.ai) v._exh.forEach(e => puff(e.clone().applyMatrix4(m.matrixWorld), { color: v.kind === 'tank' ? 0x3a3835 : 0x6a6865, s0: 0.15, s1: 0.8, life: 0.9, op: 0.35 + Math.min(0.3, Math.abs(sp) / 40), v: new THREE.Vector3(-Math.sin(v.yaw) * 0.6, 0.8, -Math.cos(v.yaw) * 0.6) }));
      if (Math.abs(sp) > 6) { const back = new THREE.Vector3(-Math.sin(v.yaw), 0, -Math.cos(v.yaw)); (v.kind === 'tank' ? [-2, 2] : [-1, 1]).forEach(s => puff(new THREE.Vector3(v.pos.x + Math.cos(v.yaw) * s - back.x * 2.6, 0.3, v.pos.z - Math.sin(v.yaw) * s - back.z * 2.6), { color: 0xa8967a, s0: 0.6, s1: 2.8, life: 1.1, op: 0.38, v: new THREE.Vector3(back.x * 1.2, 0.8, back.z * 1.2) })); }
    }
  });
  if (acc > 0) { stepParts(acc); tankClack(acc); acc = 0; } if (engT <= 0) { engT = 0.1; try { engines(); } catch (e) { } }
}
function flash(v, size) { const p = (v.barrel ? new THREE.Vector3(0, 0.45, 5.7).applyMatrix4(v.turret.matrixWorld) : new THREE.Vector3(0, 0.3, 1.7).applyMatrix4((v.turret || v.mesh).matrixWorld)); puff(p, { color: 0xffd9a0, s0: size, s1: size * 2, life: 0.12, op: 1, add: true, v: new THREE.Vector3() }); if (v.kind === 'tank') puff(p, { color: 0x8a8580, s0: 1.2, s1: 5, life: 1.6, op: 0.5, v: new THREE.Vector3(0, 0.8, 0) }); }
function tick() { const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now; try { frame(dt); } catch (e) { } }
function loop() { tick(); requestAnimationFrame(loop); } requestAnimationFrame(loop); setInterval(() => { if (document.hidden) tick(); }, 33);
})();
