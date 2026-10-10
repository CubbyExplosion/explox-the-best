// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — HIT REACTIONS + KNIFE FIGHTERS
//   Hit reactions: every soldier is a spring-loaded body. A bullet shoves it from the direction it came from, and the reaction depends on
//   where it landed — a head shot snaps the head back and twists them, chest shots rock them backwards, stomach shots double them over,
//   leg shots make them stumble forward, arm shots spin them. They get knocked back a step, and a flinch spoils their aim for a moment.
//   Knife fighters ("Cutthroats"): built from the normal soldier model with the gun swapped for a combat knife. They sprint at you,
//   lunge and stab (the AI is in raid-core.js; the lunge animation, knife and sound are here).
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ───────── knife model ─────────
function makeKnife() {
  const g = new THREE.Group(), steel = new THREE.MeshStandardMaterial({ color: 0xc9ced4, metalness: 0.95, roughness: 0.22 }), grip = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.045, 0.19), steel); blade.position.set(0, 0, 0.145); g.add(blade);
  const tip = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, 0.05), steel); tip.position.set(0, -0.006, 0.255); tip.rotation.x = 0.5; g.add(tip);
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.012), grip); guard.position.set(0, 0, 0.048); g.add(guard);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.015, 0.11, 10), grip); handle.rotation.x = Math.PI / 2; handle.position.set(0, 0, -0.005); g.add(handle);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.userData.zone = 'arms'; } }); return g;
}
const baseMesh = window.rdBuildEnemyMesh;
window.rdBuildEnemyMesh = function (type, def) {
  const g = baseMesh(type, def); if (type !== 'knifer') return g;
  const guns = []; g.traverse(o => { if (o.userData && o.userData.isGun) guns.push(o); }); guns.forEach(o => o.parent && o.parent.remove(o));
  const hy = g.userData.hy, host = hy ? hy.inner : g, k = makeKnife(); k.position.set(hy ? 0.12 : 0.2, hy ? 1.2 : 1.12, hy ? 0.16 : 0.22); k.rotation.x = -0.25; host.add(k); g.userData.knife = k; g.userData.knifeRest = k.position.clone();
  g.userData.muzzle = new THREE.Vector3(0.1, 1.2, 0.4); return g;
};
// stab sound: cloth whoosh + a short wet thud
window.rdStab = function (e) {
  const api = window.RDX && window.RDX.api; if (!api) return; try { api.noise(0.16, 5000, 1200, 0.5, 'bandpass'); api.noise(0.1, 700, 200, 0.7, 'lowpass', 0.09); api.tone(120, 0.1, 0.4, 'sine', 0.09, 60); if (window.rdVoice && Math.random() < 0.6) window.rdVoice('shout', e); } catch (x) { }
};

// ───────── hit reaction springs ─────────
function lst() { const l = (typeof enemies !== 'undefined' && enemies) ? enemies.slice() : []; try { if (window.BATTLE && window.BATTLE.allies) l.push.apply(l, window.BATTLE.allies); } catch (x) { } return l; }
function react(e, s, dmg) {
  const m = e.mesh, pp = (typeof playerPos !== 'undefined') ? playerPos : null; if (!pp) return;
  const zone = (e.hitSeq !== s.seq) ? 'chest' : (e.hitZone || 'chest'); s.seq = e.hitSeq;
  let dx = m.position.x - pp.x, dz = m.position.z - pp.z; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
  const ry = m.rotation.y, lx = dx * Math.cos(ry) - dz * Math.sin(ry), lz = dx * Math.sin(ry) + dz * Math.cos(ry);               // push direction in the soldier's own frame
  const mag = clamp(dmg / 30, 0.45, 1.8) * (e.type === 'boss' ? 0.45 : 1);
  s.vx += lz * mag * 7; s.vz += -lx * mag * 7;
  if (zone === 'head') { s.vt += (Math.random() < 0.5 ? -1 : 1) * 9 * mag; s.vx += lz * mag * 9; }               // head snap
  else if (zone === 'stomach') { s.vx += 9 * mag; }                                                                                       // doubled over
  else if (zone === 'legs') { s.vx += 6 * mag; s.vz += (Math.random() < 0.5 ? -4 : 4) * mag; s.stumble = 0.4; }                          // stumble
  else if (zone === 'arms') { s.vt += (lx > 0 ? 1 : -1) * 12 * mag; }                                                                    // spun by the hit
  else { s.vx += lz * mag * 4; }                                                                                                          // chest: rocked back
  s.px += dx * mag * 2.8; s.pz += dz * mag * 2.8;                                                                                         // knockback shove (m/s, decays)
  e.fireCd = Math.max(e.fireCd || 0, 0.16 + mag * 0.2);                                                                                   // a flinch spoils the next shot
  if (e.blind === undefined && mag > 0.9 && Math.random() < 0.35) e.alertT = Math.max(e.alertT || 0, 9);
}
function frame(dt) {
  const R = window.RAID; if (!R || !R.on || R.over) return;
  lst().forEach(e => {
    const m = e.mesh; if (!m) return; const s = e._rx || (e._rx = { hp: e.hp, seq: e.hitSeq, ax: 0, az: 0, vx: 0, vz: 0, tw: 0, vt: 0, px: 0, pz: 0, stumble: 0 });
    const hy = m.userData && m.userData.hy, tgt = hy ? hy.inner : m;
    if (e.alive === false) { if (s.dirty) { tgt.rotation.z = 0; if (hy) tgt.rotation.y = 0; s.dirty = false; } s.hp = e.hp; return; }
    if (e.hp < s.hp - 0.4) react(e, s, s.hp - e.hp); s.hp = e.hp;
    const k = 95, c = 11;                                                           // critically-damped-ish spring back to upright
    s.vx += (-k * s.ax - c * s.vx) * dt; s.vz += (-k * s.az - c * s.vz) * dt; s.vt += (-k * s.tw - c * s.vt * 0.8) * dt;
    s.ax = clamp(s.ax + s.vx * dt, -0.55, 0.65); s.az = clamp(s.az + s.vz * dt, -0.5, 0.5); s.tw = clamp(s.tw + s.vt * dt, -0.7, 0.7);
    const sp = Math.hypot(s.px, s.pz);
    if (sp > 0.05) { const nx = m.position.x + s.px * dt, nz = m.position.z + s.pz * dt; if (typeof blockedAt !== 'function' || !blockedAt(nx, nz)) { m.position.x = nx; m.position.z = nz; } s.px *= Math.max(0, 1 - dt * 7); s.pz *= Math.max(0, 1 - dt * 7); }
    const lunge = e.lunge || 0, lean = Math.sin(lunge * Math.PI) * 0.4;
    if (Math.abs(s.ax) + Math.abs(s.az) + Math.abs(s.tw) > 0.002 || lunge > 0) {
      if (!hy) m.rotation.order = 'YXZ';
      tgt.rotation.x = s.ax + lean; tgt.rotation.z = s.az; if (hy) tgt.rotation.y = s.tw; s.dirty = true;
    }
    const kn = m.userData && m.userData.knife; if (kn) { const r = m.userData.knifeRest; kn.position.set(r.x - lunge * 0.04, r.y + Math.sin(lunge * Math.PI) * 0.06, r.z + Math.sin(lunge * Math.PI) * 0.45); kn.rotation.x = -0.25 - Math.sin(lunge * Math.PI) * 0.4; }
  });
}
let last = performance.now();
function tick() { const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now; try { frame(dt); } catch (e) { } }
function loop() { tick(); requestAnimationFrame(loop); }
requestAnimationFrame(loop); setInterval(() => { if (document.hidden) tick(); }, 33);
window.rdReactTest = frame;
})();
