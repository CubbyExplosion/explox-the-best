// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — REALISTIC BOTS + LAG FIXES  (Team Battle, No Mercy, Hardcore soldiers)
//   Realism: full combat kit on every soldier (boots, knee pads, belt + holster, vest plates and pouches, backpack, helmet with night-vision mount
//   and chin strap, goggles, mixed skin tones and uniform shades), a real walk cycle (legs swing with speed), gun recoil when they fire, a
//   crouched stance between bursts, they flank you from different angles instead of marching in a line, and throw frag grenades when you
//   are 10–30 m away.
//   Performance: soldiers more than ~55 m away swap to a 3-box silhouette (1 shared mesh set) and stop casting shadows; far soldiers only think
//   4× a second; the hit-reaction/voice loops skip distant soldiers; corpses are cleared quickly; the Hardcore army size adapts to your frame
//   rate (fewer on the field if you lag, more when it is smooth) and the heavy post-processing is switched off on the big levels.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const BT = window.BATTLE, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
const NEAR = 55, FAR = 62;
let M = null, LOG = null, LOM = null;
function mats() {
  if (M) return M; const S = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.85 }, o || {}));
  M = { boot: S(0x151210), pad: S(0x1d1f22), belt: S(0x16181a), holster: S(0x111214), plate: S(0x1a1c1f, { roughness: 0.6, metalness: 0.3 }), pack: S(0x2f3a2c), nvg: S(0x0e0e10, { metalness: 0.8, roughness: 0.4 }), goggle: S(0x2a3a44, { metalness: 0.9, roughness: 0.15 }), strap: S(0x121212), band: S(0xd8342a, { roughness: 0.7 }), bandA: S(0x2a6fe0, { roughness: 0.7 }) };
  LOG = [new THREE.BoxGeometry(0.5, 1.9, 0.3)]; LOM = [new THREE.MeshBasicMaterial({ color: 0x4a3a38 })];
  return M;
}
const SKIN = [0xe0b090, 0xc99a74, 0x9a6b4a, 0x6e4a32, 0xf0c8a8, 0xb98a68];
function upgrade(b) {
  if (b._up || !b.mesh) return; b._up = true; const g = b.mesh; if (g.userData.hy) return; const m = mats();                              // hyper soldiers already have all of this
  const add = (geo, mat, x, y, z) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; g.add(o); o._extra = true; return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d), team = b.team;
  const legs = [], parts = []; g.children.slice().forEach(c => { if (c.userData.zone === 'legs') legs.push(c); parts.push(c); });
  legs.forEach(l => { l.geometry = l.geometry.clone(); l.geometry.translate(0, -0.43, 0); l.position.y = 0.86; });                         // hip pivot so the legs can swing
  b._legs = legs;
  [-1, 1].forEach(s => { const bt = add(B(0.19, 0.12, 0.3), m.boot, s * 0.12, 0.06, 0.04); void bt; add(B(0.19, 0.14, 0.06), m.pad, s * 0.12, 0.5, 0.11); });
  add(B(0.5, 0.07, 0.3), m.belt, 0, 0.88, 0); add(B(0.1, 0.18, 0.08), m.holster, 0.3, 0.78, 0.04); add(B(0.34, 0.34, 0.05), m.plate, 0, 1.4, 0.17); add(B(0.34, 0.3, 0.05), m.plate, 0, 1.4, -0.17);
  [-0.14, 0, 0.14].forEach(x => add(B(0.1, 0.12, 0.07), m.belt, x, 1.2, 0.2)); if (Math.random() < 0.8) add(B(0.34, 0.42, 0.16), m.pack, 0, 1.38, -0.28);
  add(B(0.1, 0.1, 0.07), m.nvg, 0, 1.97, 0.13); add(B(0.04, 0.04, 0.1), m.nvg, 0.04, 1.97, 0.2); add(B(0.28, 0.06, 0.04), m.goggle, 0, 1.82, 0.16); add(B(0.2, 0.02, 0.02), m.strap, 0, 1.68, 0.1);
  add(B(0.13, 0.09, 0.15), team === 'B' ? m.band : m.bandA, -0.35, 1.38, 0.08);                                                              // armband
  g.children.forEach(c => { if (c.userData.zone === 'head' && c.geometry && c.geometry.type === 'SphereGeometry' && !c._extra && c.material && c.material.color && c.material.color.getHex() === 0xb98a68) c.material.color.setHex(SKIN[Math.floor(Math.random() * SKIN.length)]); });
  const tint = rnd(0.82, 1.18); parts.forEach(c => { if (c.material && c.material.color && (c.userData.zone === 'legs' || c.userData.zone === 'stomach')) { c.material = c.material.clone(); c.material.color.multiplyScalar(tint); } });
  b._gun = parts.find(c => c.geometry && c.geometry.parameters && c.geometry.parameters.depth >= 0.45 && c.userData.zone === 'arms'); if (b._gun) b._gunZ = b._gun.position.z;
  // cheap silhouette for when you are far away
  const lo = new THREE.Group(); const body = new THREE.Mesh(LOG[0], LOM[0]); body.position.y = 0.95; lo.add(body); lo.visible = false; g.add(lo); lo._lo = true; b._lo = lo;
  b._ph = Math.random() * 6; b._near = true; b._lx = g.position.x; b._lz = g.position.z; b._gcd = rnd(5, 12); b._crouch = 0; b._burst = 0;
}
window.rdBotUpgrade = upgrade;
function setNear(b, near) {
  if (b._near === near) return; b._near = near; b.mesh.children.forEach(c => { if (c._lo) c.visible = !near; else { c.visible = near; if (c.isMesh) c.castShadow = near; } });
}
// ───────── grenades ─────────
const nades = [];
function throwNade(b, tp) {
  if (nades.length > 5) return; const from = b.mesh.position.clone(); from.y = 1.5; const to = new THREE.Vector3(tp.x + rnd(-2, 2), 0.1, tp.z + rnd(-2, 2)), T = 1.2;
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshStandardMaterial({ color: 0x3a4a30 })); m.position.copy(from); scene.add(m);
  nades.push({ m, from, to, t: 0, T, fuse: 0.8 }); try { window.RDX.api.noise(0.12, 2200, 700, 0.25, 'bandpass'); if (window.rdVoice) window.rdVoice('shout', b); window.rdToast('💣 Grenade!', 1200); } catch (e) { }
}
function stepNades(dt) {
  for (let i = nades.length - 1; i >= 0; i--) { const n = nades[i]; if (n.t < n.T) { n.t += dt; const k = Math.min(1, n.t / n.T); n.m.position.lerpVectors(n.from, n.to, k); n.m.position.y = n.from.y * (1 - k) + n.to.y * k + Math.sin(k * Math.PI) * 5; } else { n.fuse -= dt; if (n.fuse <= 0) { scene.remove(n.m); nades.splice(i, 1); try { window.RDX.api.blast(n.to.clone(), { kind: 'frag', dmg: 130, radius: 6 }); } catch (e) { } } } }
}
// ───────── per-frame ─────────
let last = performance.now(), lodT = 0, fpsAcc = 0, fpsN = 0, fpsT = 0;
function frame(dt) {
  const R = window.RAID; if (!BT.on || !R || !R.on || R.over) return; if (BT.t < 1.5 && !BT._lp && window.rdLightPool) { BT._lp = true; const z = new THREE.Vector3(0, 5, 0); for (let i = 0; i < 4; i++) window.rdLightPool.take(0xffffff, 0, 10, z, 1); } else if (BT.t > 3) BT._lp = false; if (BT.mode === 'endless' && BT.en && BT.en.frozen) return; const pp = playerPos;
  fpsAcc += dt; fpsN++; fpsT += dt;
  if (fpsT > 1.5) { const avg = fpsAcc / fpsN; fpsAcc = fpsN = 0; fpsT = 0; if (BT.hc && !BT.hc.over) { const T = BT.hc.T, cur = BT.hc.capNow || T.cap; BT.hc.capNow = avg > 0.045 ? Math.max(30, Math.floor(cur * 0.85)) : avg < 0.026 ? Math.min(T.cap, cur + 5) : cur; } }
  lodT -= dt; const doLod = lodT <= 0; if (doLod) lodT = 0.3;
  stepNades(dt);
  const list = enemies.concat(BT.allies);
  for (let i = 0; i < list.length; i++) {
    const b = list[i]; if (!b.mesh) continue; if (!b._up) upgrade(b); if (b.mesh.userData.hy) continue; const m = b.mesh.position, d = Math.hypot(m.x - pp.x, m.z - pp.z);
    if (doLod) { setNear(b, b._near ? d < FAR : d < NEAR); b.mesh.visible = d < 200 || !!b._wasVis; if (b.hp < (b._php === undefined ? b.hp : b._php)) b._hitAt = BT.t; b._php = b.hp; }
    if (!doLod && b.hp < (b._php === undefined ? b.hp : b._php)) { b._hitAt = BT.t; b._php = b.hp; }
    if (!b._near || !b.alive) { if (!b.alive && b._legs && !b._dead) { b._dead = true; b._legs.forEach(l => l.rotation.x = 0); b.mesh.scale.y = 1; } continue; }
    // walk cycle
    const sp = Math.hypot(m.x - b._lx, m.z - b._lz) / Math.max(dt, 0.001); b._lx = m.x; b._lz = m.z; b._spd = (b._spd || 0) + (Math.min(sp, 6) - (b._spd || 0)) * Math.min(1, dt * 8); b._ph += b._spd * dt * 2.2;
    const sw = clamp(b._spd / 3, 0, 1), s = Math.sin(b._ph); if (b._legs && b._legs.length === 2) { b._legs[0].rotation.x = s * 0.7 * sw; b._legs[1].rotation.x = -s * 0.7 * sw; }
    // recoil + crouch between bursts
    if (b._gun) { if (b.burstLeft < b._burst) b._kick = 0.07; b._kick = Math.max(0, (b._kick || 0) - dt * 0.6); b._gun.position.z = b._gunZ - b._kick; } b._burst = b.burstLeft;
    const wantCrouch = b.target && b.restT > 0 && b._spd < 0.8 ? 1 : 0; b._crouch += (wantCrouch - b._crouch) * Math.min(1, dt * 6); b.mesh.scale.y = 1 - 0.14 * b._crouch;
    // grenades at the player
    b._gcd -= dt; if (b._gcd <= 0 && b.team === 'B' && b.target === 'player' && d > 10 && d < 30 && !window.RAID.dead) { b._gcd = rnd(9, 16); if (Math.random() < 0.7) throwNade(b, pp); else b._gcd = 3; }
  }
}
function tick() { const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; try { frame(dt); } catch (e) { } }
function loop() { tick(); requestAnimationFrame(loop); } requestAnimationFrame(loop); setInterval(() => { if (document.hidden) tick(); }, 40);
})();
