// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — REALISTIC EXPLOSIONS  (grenades, impact grenades, rockets, vehicle blasts)
//   white-hot flash → rolling orange fireball → black billowing smoke column, a ground shockwave ring + dust wave, flying debris chunks
//   and sparks with gravity, a scorch mark that stays on the ground, a light that flickers and fades, camera shake that falls off with
//   distance, a deep boom with a cracking tail, and — if it goes off close to you — ringing ears (muffled sound + a high whine).
// Called from blast() in raid-core.js:  window.rdExplosion(position, def)
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
// ───────── fixed pool of lights (never add/remove lights during play: that recompiles every shader) ─────────
const LP = []; let lpI = 0;
window.rdLightPool = {
  take(color, intensity, dist, pos, ms) {
    if (typeof scene === 'undefined' || !scene) return { intensity: 0, userData: {} }; while (LP.length < 4) { const l = new THREE.PointLight(0xffffff, 0, 10); l.userData = { free: true }; LP.push(l); }
    let L = LP.find(l => l.userData.free) || LP[lpI++ % LP.length]; if (!L.parent || L.parent !== scene) scene.add(L);
    L.color.set(color); L.intensity = intensity; L.distance = dist; L.position.copy(pos); L.userData.free = false; L.userData.t0 = performance.now(); L.userData.ms = ms || 0; L.userData.i0 = intensity;
    if (ms) { clearTimeout(L.userData.to); L.userData.to = setTimeout(() => { L.intensity = 0; L.userData.free = true; }, ms); } return L;
  }
};

let texFire = null, texSmoke = null, texFlash = null, texRing = null, scorchTex = null;
function mk(size, draw) { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size); const t = new THREE.CanvasTexture(c); return t; }
function textures() {
  if (texFire) return;
  texFlash = mk(128, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(0.25, 'rgba(255,230,160,.8)'); g.addColorStop(1, 'rgba(255,160,40,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); });
  const puff = (cols) => (x, s) => { for (let i = 0; i < 14; i++) { const px = s / 2 + (Math.random() - 0.5) * s * 0.4, py = s / 2 + (Math.random() - 0.5) * s * 0.4, r = s * (0.18 + Math.random() * 0.2), g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, cols[i % cols.length]); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); } const m = x.createRadialGradient(s / 2, s / 2, s * 0.25, s / 2, s / 2, s / 2); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = m; x.fillRect(0, 0, s, s); };
  texFire = mk(128, puff(['rgba(255,190,70,.9)', 'rgba(255,120,30,.85)', 'rgba(230,70,15,.8)']));
  texSmoke = mk(128, puff(['rgba(70,66,62,.75)', 'rgba(40,38,36,.8)', 'rgba(95,90,84,.6)']));
  texRing = mk(128, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, s * 0.36, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,240,210,0)'); g.addColorStop(0.7, 'rgba(255,235,200,.55)'); g.addColorStop(1, 'rgba(255,235,200,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); });
  scorchTex = mk(128, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(8,6,5,.92)'); g.addColorStop(0.55, 'rgba(14,11,9,.7)'); g.addColorStop(1, 'rgba(14,11,9,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); for (let i = 0; i < 40; i++) { x.strokeStyle = 'rgba(8,6,5,.5)'; x.beginPath(); const a = Math.random() * 6.28, r0 = s * 0.15, r1 = s * (0.3 + Math.random() * 0.2); x.moveTo(s / 2 + Math.cos(a) * r0, s / 2 + Math.sin(a) * r0); x.lineTo(s / 2 + Math.cos(a) * r1, s / 2 + Math.sin(a) * r1); x.stroke(); } });
}
const live = [], scorches = [];
let dbGeo = null, dbMat = null;
function spr(tex, color, blend, x, y, z, s, op) { const m = new THREE.SpriteMaterial({ map: tex, color, transparent: true, depthWrite: false, blending: blend, opacity: op }); const sp = new THREE.Sprite(m); sp.position.set(x, y, z); sp.scale.setScalar(s); scene.add(sp); return sp; }
function ringMesh(x, z, c) { const m = new THREE.Mesh(new THREE.RingGeometry(0.6, 1, 40), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.08, z); scene.add(m); return m; }

window.rdExplosion = function (p, d) {
  try {
    if (typeof scene === 'undefined' || !scene) return; textures();
    const R = Math.max(5, (d && d.radius) || 8), scale = Math.min(1.6, R / 8), t0 = performance.now(), gy = Math.max(0, p.y || 0);
    const o = { t0, parts: [], scale };
    // 1) the flash: a hot white core + light
    o.flash = spr(texFlash, 0xffffff, THREE.AdditiveBlending, p.x, gy + 1, p.z, 5 * scale, 1); o.light = window.rdLightPool.take(0xffb060, 14, 40 * scale, new THREE.Vector3(p.x, gy + 1.6, p.z), 0);
    // 2) the fireball: overlapping fire puffs that rise and swell, then cool to smoke
    for (let i = 0; i < 16; i++) { const a = Math.random() * 6.28, r = Math.random() * 0.8 * scale, s = (1.6 + Math.random() * 1.8) * scale; const sp = spr(texFire, 0xffffff, THREE.AdditiveBlending, p.x + Math.cos(a) * r, gy + 0.5 + Math.random() * 0.8, p.z + Math.sin(a) * r, s, 0.95); o.parts.push({ sp, kind: 'fire', vx: Math.cos(a) * (1.5 + Math.random() * 2.2) * scale, vy: (1.8 + Math.random() * 3) * scale, vz: Math.sin(a) * (1.5 + Math.random() * 2.2) * scale, s0: s, life: 0.55 + Math.random() * 0.45, rot: (Math.random() - 0.5) * 2 }); }
    // 3) the smoke column: dark puffs that rise, widen and linger for several seconds
    for (let i = 0; i < 22; i++) { const a = Math.random() * 6.28, r = Math.random() * 1.2 * scale, s = (2 + Math.random() * 2) * scale; const sp = spr(texSmoke, 0xffffff, THREE.NormalBlending, p.x + Math.cos(a) * r, gy + 0.6, p.z + Math.sin(a) * r, s, 0.0); o.parts.push({ sp, kind: 'smoke', vx: Math.cos(a) * (0.5 + Math.random()) * scale, vy: (2 + Math.random() * 2.6) * scale, vz: Math.sin(a) * (0.5 + Math.random()) * scale, s0: s, life: 3.2 + Math.random() * 2.6, delay: 0.1 + Math.random() * 0.5, rot: 0 }); }
    // 4) ground dust wave + shockwave ring
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28 + Math.random() * 0.3, s = (1.4 + Math.random()) * scale; const sp = spr(texSmoke, 0xb4a48a, THREE.NormalBlending, p.x, gy + 0.35, p.z, s, 0.0); o.parts.push({ sp, kind: 'dust', vx: Math.cos(a) * (6 + Math.random() * 4) * scale, vy: 0.4 + Math.random() * 0.6, vz: Math.sin(a) * (6 + Math.random() * 4) * scale, s0: s, life: 1.2 + Math.random() * 0.8, delay: 0, rot: 0 }); }
    o.ring = ringMesh(p.x, p.z, 0xfff0d0); o.ring.userData.max = R * 1.1;
    // 5) debris chunks + sparks
    if (!dbGeo) { dbGeo = new THREE.BoxGeometry(0.12, 0.09, 0.1); dbMat = new THREE.MeshStandardMaterial({ color: 0x3a342e, roughness: 1 }); }
    for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(dbGeo, dbMat); const s = 0.5 + Math.random() * 1.1; m.scale.setScalar(s); m.position.set(p.x, gy + 0.3, p.z); const a = Math.random() * 6.28, h = 5 + Math.random() * 9; scene.add(m); o.parts.push({ m, kind: 'debris', vx: Math.cos(a) * (3 + Math.random() * 7) * scale, vy: h * scale, vz: Math.sin(a) * (3 + Math.random() * 7) * scale, wx: (Math.random() - 0.5) * 12, wz: (Math.random() - 0.5) * 12, life: 2.2 }); }
    for (let i = 0; i < 26; i++) { const sp = spr(texFlash, 0xffc060, THREE.AdditiveBlending, p.x, gy + 0.4, p.z, 0.3, 1); const a = Math.random() * 6.28, v = 6 + Math.random() * 14; o.parts.push({ sp, kind: 'spark', vx: Math.cos(a) * v * scale, vy: (4 + Math.random() * 10) * scale, vz: Math.sin(a) * v * scale, life: 0.5 + Math.random() * 0.7 }); }
    // 6) scorch mark on the ground
    const sc = new THREE.Mesh(new THREE.CircleGeometry(R * 0.45, 24), new THREE.MeshBasicMaterial({ map: scorchTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 })); sc.rotation.x = -Math.PI / 2; sc.position.set(p.x, gy + 0.03, p.z); sc.rotation.z = Math.random() * 6.28; scene.add(sc); scorches.push(sc); if (scorches.length > 14) { const old = scorches.shift(); scene.remove(old); old.geometry.dispose(); old.material.dispose(); }
    // 7) shake + deafening: depends on how close the player is
    const rr = window.RAID, pp = (typeof playerPos !== 'undefined') ? playerPos : null;
    if (rr && pp) { const dist = Math.hypot(pp.x - p.x, pp.z - p.z), f = Math.max(0, 1 - dist / (R * 3.2)); rr.shake = Math.max(rr.shake || 0, 0.5 + f * 2.2); if (dist < R * 1.1) ring(1 - dist / (R * 1.1)); thump(dist, R); }
    live.push(o);
  } catch (e) { }
};

// sound: deep boom + crack tail with echo, heard from any distance, and ringing ears when it is close
function thump(dist, R) {
  const a = window.RDX && window.RDX.api && window.RDX.api.getAudio && window.RDX.api.getAudio(); if (!a || !a.AC) return; const AC = a.AC, delay = Math.min(1.2, dist / 340), vol = Math.max(0.15, 1 / (1 + dist * 0.035));
  const api = window.RDX.api; try { api.tone(48, 0.9, 1.1 * vol, 'sine', delay, 24); api.tone(90, 0.5, 0.7 * vol, 'sawtooth', delay, 35); api.noise(1.4, 1800, 90, 1.0 * vol, 'lowpass', delay); api.noise(0.25, 7000, 1500, 0.8 * vol, 'highpass', delay); api.noise(2.4, 600, 60, 0.5 * vol, 'lowpass', delay + 0.18); api.noise(0.9, 900, 120, 0.3 * vol, 'bandpass', delay + 0.45); } catch (e) { }   // the last two are the rumbling echo
}
function ring(k) {                                                                                  // tinnitus: master volume ducks, a thin whine fades in and out
  const a = window.RDX.api.getAudio(); if (!a.AC || !a.master) return; const AC = a.AC, m = a.master, v0 = m.gain.value, t = AC.currentTime;
  try { m.gain.cancelScheduledValues(t); m.gain.setValueAtTime(v0, t); m.gain.linearRampToValueAtTime(v0 * (1 - 0.7 * k), t + 0.05); m.gain.linearRampToValueAtTime(v0, t + 1.5 + k * 3.5);
    const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = 5400; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.07 * k, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0005, t + 1.5 + k * 3.5); o.connect(g); g.connect(m); o.start(t); o.stop(t + 5.5); } catch (e) { }
}

// NPC muzzle flash: a short bright burst + light at the barrel so you can see who is shooting and where they point
let fT = null;
window.rdNpcFlash = function (e, pos) {
  try {
    if (typeof scene === 'undefined' || !scene) return; textures(); const dir = new THREE.Vector3(Math.sin(e.mesh.rotation.y), 0, Math.cos(e.mesh.rotation.y));
    const sp = spr(texFlash, 0xffd9a0, THREE.AdditiveBlending, pos.x + dir.x * 0.12, pos.y, pos.z + dir.z * 0.12, 0.9 + Math.random() * 0.4, 1); if (typeof playerPos !== 'undefined' && Math.abs(pos.x - playerPos.x) + Math.abs(pos.z - playerPos.z) < 45) window.rdLightPool.take(0xffb060, 2.5, 9, pos, 55);
    setTimeout(() => { scene.remove(sp); sp.material.dispose(); }, 55);
  } catch (x) { }
};
function step(now) {
  for (let i = live.length - 1; i >= 0; i--) {
    const SL = window.__expSlow || 1, o = live[i], t = (now - o.t0) / 1000 * SL, dt = Math.min(0.05, (now - (o.last || o.t0)) / 1000) * SL; o.last = now; const s = o.scale;
    if (o.flash) { const k = Math.min(1, t / 0.18); o.flash.scale.setScalar((5 + k * 10) * s); o.flash.material.opacity = Math.max(0, 1 - k); if (k >= 1) { scene.remove(o.flash); o.flash.material.dispose(); o.flash = null; } }
    if (o.light) { const f = Math.max(0, 1 - t / 0.9); o.light.intensity = 14 * f * f * (0.85 + Math.random() * 0.3); if (f <= 0) { o.light.intensity = 0; o.light.userData.free = true; o.light = null; } }
    if (o.ring) { const k = Math.min(1, t / 0.55), r = 0.6 + k * o.ring.userData.max; o.ring.scale.setScalar(r); o.ring.material.opacity = 0.7 * (1 - k); if (k >= 1) { scene.remove(o.ring); o.ring.geometry.dispose(); o.ring.material.dispose(); o.ring = null; } }
    let any = !!(o.flash || o.light || o.ring);
    o.parts.forEach(q => {
      if (q.dead) return; const life = q.life, age = t - (q.delay || 0); if (age < 0) { any = true; return; }
      if (age >= life) { q.dead = true; if (q.sp) { scene.remove(q.sp); q.sp.material.dispose(); } if (q.m) scene.remove(q.m); return; } any = true; const k = age / life, tgt = q.sp || q.m;
      if (q.kind === 'fire') { q.vy *= (1 - dt * 1.2); tgt.position.x += q.vx * dt; tgt.position.y += q.vy * dt; tgt.position.z += q.vz * dt; q.vx *= (1 - dt * 2); q.vz *= (1 - dt * 2); const sc = q.s0 * (1 + k * 1.6); tgt.scale.setScalar(sc); const c = tgt.material.color; c.setRGB(1, 1 - k * 0.55, 1 - k * 0.9); tgt.material.opacity = 0.95 * (1 - k * k); tgt.material.rotation += q.rot * dt; }
      else if (q.kind === 'smoke') { tgt.position.x += q.vx * dt; tgt.position.y += q.vy * dt; tgt.position.z += q.vz * dt; q.vy *= (1 - dt * 0.35); tgt.scale.setScalar(q.s0 * (1 + k * 2.4)); tgt.material.opacity = (k < 0.12 ? k / 0.12 : 1 - (k - 0.12) / 0.88) * 0.62; tgt.material.rotation += 0.2 * dt; }
      else if (q.kind === 'dust') { tgt.position.x += q.vx * dt; tgt.position.z += q.vz * dt; q.vx *= (1 - dt * 2.2); q.vz *= (1 - dt * 2.2); tgt.scale.setScalar(q.s0 * (1 + k * 3)); tgt.material.opacity = (1 - k) * 0.5; }
      else if (q.kind === 'spark') { q.vy -= 22 * dt; tgt.position.x += q.vx * dt; tgt.position.y = Math.max(0.05, tgt.position.y + q.vy * dt); tgt.position.z += q.vz * dt; tgt.material.opacity = 1 - k; tgt.scale.setScalar(0.3 * (1 - k * 0.7)); }
      else if (q.kind === 'debris') { q.vy -= 22 * dt; tgt.position.x += q.vx * dt; tgt.position.y += q.vy * dt; tgt.position.z += q.vz * dt; tgt.rotation.x += q.wx * dt; tgt.rotation.z += q.wz * dt; if (tgt.position.y < 0.05) { tgt.position.y = 0.05; q.vy *= -0.3; q.vx *= 0.6; q.vz *= 0.6; q.wx *= 0.5; q.wz *= 0.5; } }
    });
    if (!any) live.splice(i, 1);
  }
}
function loop() { step(performance.now()); requestAnimationFrame(loop); }
requestAnimationFrame(loop); setInterval(() => { if (document.hidden) step(performance.now()); }, 50);
})();
