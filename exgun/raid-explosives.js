// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — MORE EXPLOSIVES + TACTICAL NUKE
//   New throwables (buy them in the Armory & Shop → Throwables, find them in weapon cases):
//     🧨 Pipe Bomb (short fuse) · 🧨 Dynamite Bundle (huge) · 💥 Cluster Grenade (wide) · 📦 C4 Charge (sticks where it lands — press X to detonate)
//     ⭕ Proximity Mine (arms after 1.5 s, explodes when an enemy walks near) · ✈️ Airstrike Marker (smoke, then 8 bombs rain on the spot)
//   Team Battle kits now carry some: Anti-Tank gets C4, Support gets mines, Sniper gets an airstrike marker.
//   ☢️ TACTICAL NUKE — in Team Battle, get 15 kills to earn it, then press N while aiming at the ground at least 150 m away. 8-second siren, a missile
//     streaks in, a white flash, a fireball, a shockwave that rolls out and destroys soldiers, vehicles and buildings (and your own team too!),
//     a mushroom cloud and a scorched crater. Stay out of the 150 m blast zone — you cannot nuke closer than that.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const R = window.RAID, BT = window.BATTLE, api = () => window.RDX.api, rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const NEED = 15, KILL_R = 150, BURN_R = 230, WAVE_SPEED = 220;
Object.assign(R_NADE, {
  pipe_1:  { kind: 'frag', name: 'Pipe Bomb', emoji: '🔩', price: 80, dmg: 140, radius: 5.5, fuse: 2.2 },
  dyn_1:   { kind: 'frag', name: 'Dynamite Bundle', emoji: '🧨', price: 320, dmg: 320, radius: 9, fuse: 4 },
  cluster_1: { kind: 'frag', name: 'Cluster Grenade', emoji: '💥', price: 380, dmg: 210, radius: 11, fuse: 3 },
  c4_1:    { kind: 'c4', name: 'C4 Charge (press X)', emoji: '📦', price: 450, dmg: 430, radius: 9.5, fuse: 9999 },
  mine_1:  { kind: 'mine', name: 'Proximity Mine', emoji: '⭕', price: 260, dmg: 300, radius: 7.5, fuse: 9999 },
  air_1:   { kind: 'airstrike', name: 'Airstrike Marker', emoji: '✈️', price: 900, dmg: 270, radius: 9.5, fuse: 9999 }
});
try { R_CONTAINERS.weaponbox.table.push(['gren:c4_1', 2, 1, 1], ['gren:mine_1', 3, 1, 2], ['gren:pipe_1', 5, 1, 3], ['gren:dyn_1', 2, 1, 1], ['gren:air_1', 1, 1, 1]); } catch (e) { }
try { const C = window.BTX.i.CLASSES; C.antitank.nades.c4_1 = 2; C.support.nades.mine_1 = 2; C.sniper.nades.air_1 = 1; C.breacher.nades.pipe_1 = 2; } catch (e) { }

// ───────── placed explosives: C4, mines, airstrike ─────────
function det(n) { const i = R.nades.indexOf(n); if (i >= 0) R.nades.splice(i, 1); const p = n.m.position.clone(); scene.remove(n.m); try { api().blast(p, { kind: 'frag', dmg: n.def.dmg, radius: n.def.radius }); } catch (e) { } }
function bomb(n, p, delay) {
  setTimeout(() => { if (!R.on) return; const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.3, 8), new THREE.MeshStandardMaterial({ color: 0x3a3d40, metalness: 0.7, roughness: 0.4 })); m.position.set(p.x, 70, p.z); scene.add(m); try { api().tone(1400, 0.6, 0.18, 'sine', 0, 500); } catch (e) { }
    const t0 = performance.now(); (function fall() { const k = (performance.now() - t0) / 600; if (k >= 1 || !R.on) { scene.remove(m); if (R.on) { try { api().blast(new THREE.Vector3(p.x, 0, p.z), { kind: 'frag', dmg: n.def.dmg, radius: n.def.radius }); } catch (e) { } } return; } m.position.y = 70 * (1 - k * k); requestAnimationFrame(fall); setTimeout(() => { if (document.hidden) fall(); }, 40); })(); }, delay);
}
let wasLanded = new WeakSet();
function nadeTick() {
  if (!R.on || !R.nades) return; const now = performance.now();
  R.nades.slice().forEach(n => {
    const k = n.def.kind; if (k !== 'c4' && k !== 'mine' && k !== 'airstrike') return; const m = n.m;
    if (!n._landed) { if (m.position.y <= 0.1 && n.age > 0.15) { n._landed = true; n._t0 = now; n.v.set(0, 0, 0); m.position.y = 0.08; if (k === 'c4') { m.scale.set(2.4, 1.3, 1.6); m.material.color.set(0x5a5a3a); window.rdToast('📦 C4 planted — press X to detonate (' + (R.nades.filter(x => x.def.kind === 'c4').length) + ' charge(s))', 2600); } else if (k === 'mine') { m.scale.set(2.2, 0.35, 2.2); m.material.color.set(0x3a3a2a); window.rdToast('⭕ Mine armed in 1.5 s', 1800); } else { m.material.color.set(0xff3a2a); m.material.emissive = new THREE.Color(0xff2a10); window.rdToast('✈️ Airstrike inbound in 3 s — get clear!', 2600); } } return; }
    n.v.set(0, 0, 0); m.position.y = 0.08;
    if (k === 'mine') { if (now - n._t0 < 1500) return; m.material.emissive = new THREE.Color(Math.sin(now / 150) > 0 ? 0xff0000 : 0x000000); const L = (typeof enemies !== 'undefined' ? enemies : []).some(e => e.alive && Math.hypot(e.mesh.position.x - m.position.x, e.mesh.position.z - m.position.z) < 3.4) || (BT.on && BT.vehicles.some(v => v.alive && v.team === 'B' && Math.hypot(v.pos.x - m.position.x, v.pos.z - m.position.z) < v.def.r + 1.5)); if (L) det(n); }
    else if (k === 'airstrike') { if (now - n._t0 > 3000 && !n._go) { n._go = true; const c = m.position.clone(); for (let i = 0; i < 8; i++) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * 26; bomb(n, { x: c.x + Math.cos(a) * r, z: c.z + Math.sin(a) * r }, i * 430); } setTimeout(() => { scene.remove(m); const j = R.nades.indexOf(n); if (j >= 0) R.nades.splice(j, 1); }, 4500); try { api().tone(180, 1.2, 0.3, 'sawtooth', 0, 90); api().noise(1.4, 900, 200, 0.4, 'bandpass'); } catch (e) { } } }
  });
}
document.addEventListener('keydown', e => { if (e.code === 'KeyX' && R.on && !e.repeat) { const cs = R.nades.filter(n => n.def.kind === 'c4' && n._landed); if (cs.length) { cs.forEach((n, i) => setTimeout(() => det(n), i * 90)); } } });

// ───────── the nuke ─────────
let hud = null, flashEl = null;
function ensureHud() {
  if (hud) return; const css = document.createElement('style'); css.textContent = '#nukeHud{position:fixed;left:14px;bottom:150px;z-index:19;color:#ffe08a;font:bold 13px Arial;text-shadow:0 1px 4px #000;background:#000a;border:1px solid #ffb300;border-radius:8px;padding:5px 10px;display:none} #nukeFlash{position:fixed;inset:0;background:#fff;opacity:0;z-index:90;pointer-events:none} #nukeCount{position:fixed;top:90px;left:50%;transform:translateX(-50%);z-index:91;color:#ff5a3a;font:900 34px Arial;text-shadow:0 0 14px #f00,0 2px 4px #000;display:none;letter-spacing:3px;text-align:center}';
  document.head.appendChild(css); hud = document.createElement('div'); hud.id = 'nukeHud'; document.body.appendChild(hud); flashEl = document.createElement('div'); flashEl.id = 'nukeFlash'; document.body.appendChild(flashEl);
  const c = document.createElement('div'); c.id = 'nukeCount'; document.body.appendChild(c);
}
function ready() { return BT.on && BT.mode === 'battle' && !BT.nukeUsed && BT.stats && BT.stats.kills >= NEED; }
setInterval(() => {
  nadeTick(); if (!BT.on || BT.mode !== 'battle' || !R.on) { if (hud) hud.style.display = 'none'; return; } ensureHud(); hud.style.display = BT.nukeUsed ? 'none' : 'block';
  hud.textContent = ready() ? '☢️ NUKE READY — aim at the ground 150 m+ away and press N' : '☢️ Nuke: ' + (BT.stats ? BT.stats.kills : 0) + '/' + NEED + ' kills';
  hud.style.color = ready() ? '#ff7a4a' : '#ffe08a';
}, 120);
document.addEventListener('keydown', e => {
  if (e.code !== 'KeyN' || e.repeat || !BT.on || BT.mode !== 'battle' || !R.on || R.dead) return; ensureHud();
  if (BT.nukeUsed || BT.nukePending) return; if (!ready()) { window.rdToast(`☢️ The nuke needs ${NEED} kills (you have ${BT.stats.kills})`, 2200); return; }
  const dir = new THREE.Vector3(); camera.getWorldDirection(dir); const o = camera.position; let x, z;
  if (dir.y < -0.02) { const t = -o.y / dir.y; x = o.x + dir.x * t; z = o.z + dir.z * t; } else { x = o.x + dir.x * 220; z = o.z + dir.z * 220; }
  x = clamp(x, -BT.half + 10, BT.half - 10); z = clamp(z, -BT.half + 10, BT.half - 10); const d = Math.hypot(x - playerPos.x, z - playerPos.z);
  if (d < KILL_R + 5) { window.rdToast(`☢️ Too close — the blast kills everything within ${KILL_R} m. Aim farther away (you are ${Math.round(d)} m from that spot).`, 3200); return; }
  launch(x, z);
});
function launch(x, z) {
  BT.nukePending = true; BT.nukeUsed = true; const cnt = document.getElementById('nukeCount'); cnt.style.display = 'block'; let left = 8; window.rdToast('☢️ TACTICAL NUKE LAUNCHED — everyone within ' + KILL_R + ' m of the target will die!', 4500);
  const t0 = performance.now(), siren = setInterval(() => { try { api().tone(((performance.now() - t0) / 450 | 0) % 2 ? 520 : 760, 0.45, 0.4, 'square'); } catch (e) { } }, 450);
  const tick = setInterval(() => { left--; cnt.textContent = '☢️ NUKE IN ' + left; if (left <= 0) { clearInterval(tick); clearInterval(siren); cnt.style.display = 'none'; } }, 1000); cnt.textContent = '☢️ NUKE IN 8';
  // the missile: a glowing streak that falls through the last 2.5 s
  const missile = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 9, 10), new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.6, roughness: 0.4 })); missile.add(body); const nose = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2, 10), new THREE.MeshStandardMaterial({ color: 0xaa2a2a })); nose.position.y = -5.5; nose.rotation.x = Math.PI; missile.add(nose);
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.2, 60, 10), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })); tail.position.y = 34; missile.add(tail); missile.userData.nuke = true; scene.add(missile);
  const fallStart = t0 + 5500; (function fall() { const now = performance.now(); if (!R.on) { scene.remove(missile); return; } if (now < fallStart) { missile.position.set(x, 900, z); } else { const k = Math.min(1, (now - fallStart) / 2500); missile.position.set(x, 900 * (1 - k * k) + 6, z); if (k >= 1) { scene.remove(missile); return; } } requestAnimationFrame(fall); setTimeout(() => { if (document.hidden) fall(); }, 40); })();
  setTimeout(() => { scene.remove(missile); detonate(x, z); }, 8000);
}
const gm = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c, transparent: true, depthWrite: false }, o || {}));
function detonate(x, z) {
  if (!R.on) return; BT.nukePending = false; const pp = playerPos, pd = Math.hypot(x - pp.x, z - pp.z), t0 = performance.now(), objs = [], tag = o => { o.userData.nuke = true; scene.add(o); objs.push(o); return o; };
  // white-out + shake + light
  flashEl.style.transition = 'none'; flashEl.style.opacity = String(clamp(1.7 - pd / 280, 0.35, 1)); setTimeout(() => { flashEl.style.transition = 'opacity 3.5s ease-out'; flashEl.style.opacity = '0'; }, 120); R.shake = 2.2;
  const light = tag(new THREE.PointLight(0xffd8a0, 60, 900)); light.position.set(x, 60, z);
  // fireball, inner core, shock ring, dust wall, mushroom stem + cap, scorch
  const fire = tag(new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), gm(0xfff2c8, { blending: THREE.AdditiveBlending }))); fire.position.set(x, 0, z);
  const core = tag(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), gm(0xffffff, { blending: THREE.AdditiveBlending }))); core.position.set(x, 0, z);
  const ring = tag(new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 64), gm(0xffe9b8, { side: THREE.DoubleSide, blending: THREE.AdditiveBlending, opacity: 0.8 }))); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.5, z);
  const wall = tag(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 48, 1, true), gm(0x9a8468, { side: THREE.DoubleSide, opacity: 0.6 }))); wall.position.set(x, 0, z);
  const stem = tag(new THREE.Mesh(new THREE.CylinderGeometry(1, 1.6, 1, 24, 1, true), gm(0x6a4a32, { side: THREE.DoubleSide, opacity: 0.85 }))); stem.position.set(x, 0, z);
  const cap = tag(new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), gm(0x8a5a38, { opacity: 0.9 }))); cap.scale.set(1, 0.55, 1); cap.position.set(x, 0, z);
  const capGlow = tag(new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), gm(0xff7a22, { blending: THREE.AdditiveBlending, opacity: 0.6 }))); capGlow.position.set(x, 0, z);
  const scorch = new THREE.Mesh(new THREE.CircleGeometry(150, 40), new THREE.MeshBasicMaterial({ color: 0x0b0907, transparent: true, opacity: 0.82, depthWrite: false })); scorch.rotation.x = -Math.PI / 2; scorch.position.set(x, 0.06, z); scorch.userData.nuke = true; scene.add(scorch);
  // sound (arrives later the farther you are)
  const delay = Math.min(2.6, pd / 340), a = api(); try { a.noise(4.5, 3000, 40, 1.6, 'lowpass', delay); a.tone(32, 3.2, 1.2, 'sine', delay, 18); a.tone(58, 1.6, 0.9, 'sawtooth', delay, 28); a.noise(0.35, 8000, 1500, 1.0, 'highpass', delay); a.noise(5, 700, 50, 0.7, 'lowpass', delay + 0.5); a.noise(3, 500, 60, 0.5, 'lowpass', delay + 2); } catch (e) { }
  // everyone caught by the shockwave
  const I = window.BTX.i, hit = new Set(), ents = () => [].concat(enemies, BT.allies);
  const dead = [], arrival = d => d / WAVE_SPEED * 1000;
  function wave() {
    if (!R.on) return; const el = performance.now() - t0;
    ents().forEach(b => { if (!b.alive || hit.has(b)) return; const d = Math.hypot(b.mesh.position.x - x, b.mesh.position.z - z); if (d > BURN_R || el < arrival(d)) return; hit.add(b); if (d < KILL_R + 25) { const foe = b.team === 'B'; I.botDie(b, foe ? 'player' : 'ally'); if (foe) { R.xpGain += 6; userState.xp += 6; } b.mesh.position.y = 0.22; } else { b.hp = Math.max(1, b.hp * 0.3); } });
    BT.vehicles.forEach(v => { if (!v.alive || hit.has(v)) return; const d = Math.hypot(v.pos.x - x, v.pos.z - z); if (d > BURN_R + 30 || el < arrival(d)) return; hit.add(v); I.damageVehicle(v, d < KILL_R + 40 ? 99999 : v.maxHp * 0.6, 'player'); });
    if (!hit.has('p') && !R.dead) { const d = Math.hypot(playerPos.x - x, playerPos.z - z); if (d <= BURN_R && el >= arrival(d)) { hit.add('p'); R.shake = 2; if (d < KILL_R + 25) { ['chest', 'head', 'stomach'].forEach(zn => a.hurtPlayer({ dmg: 900, pen: 9 }, zn, 1)); } else a.hurtPlayer({ dmg: 70, pen: 6 }, 'chest', 1); flashEl.style.transition = 'none'; flashEl.style.opacity = '0.9'; setTimeout(() => { flashEl.style.transition = 'opacity 2.5s'; flashEl.style.opacity = '0'; }, 80); } }
    // buildings and trees inside the zone are flattened as the shockwave passes
    scene.children.slice().forEach(o => { if (!o.isMesh || o.userData.nuke || o.userData.vehicle || !o.geometry || o.geometry.type === 'PlaneGeometry' || o.geometry.type === 'CircleGeometry' || !o.visible) return; const d = Math.hypot(o.position.x - x, o.position.z - z); if (d < KILL_R * 0.9 && el >= arrival(d) && o.position.y < 80) { o.visible = false; if (d < 70 && Math.random() < 0.5) { const r = new THREE.Mesh(new THREE.BoxGeometry(rnd(1, 4), rnd(0.5, 2), rnd(1, 4)), new THREE.MeshStandardMaterial({ color: 0x1c1a18, roughness: 1 })); r.position.set(o.position.x + rnd(-3, 3), 0.5, o.position.z + rnd(-3, 3)); r.rotation.y = rnd(0, 3); r.userData.nuke = true; scene.add(r); } } });
    if (el < 6500) { requestAnimationFrame(wave); setTimeout(() => { if (document.hidden) wave(); }, 60); } else { currentBuildings.splice(0, currentBuildings.length, ...currentBuildings.filter(b => Math.hypot(b.x - x, b.z - z) > KILL_R * 0.9)); }
  } wave();
  // animation of the cloud
  (function anim() {
    const t = (performance.now() - t0) / 1000; if (!R.on) { objs.forEach(o => scene.remove(o)); return; }
    const fk = clamp(t / 2.2, 0, 1), fr = 8 + 82 * (1 - Math.pow(1 - fk, 2)); fire.scale.setScalar(fr); fire.position.y = fr * 0.55; fire.material.opacity = clamp(1.25 - t / 6, 0, 1); fire.material.color.setRGB(1, clamp(0.95 - t * 0.1, 0.35, 0.95), clamp(0.8 - t * 0.2, 0.1, 0.8));
    core.scale.setScalar(fr * 0.55); core.position.y = fr * 0.55; core.material.opacity = clamp(1 - t / 1.6, 0, 1);
    const rk = clamp(t * WAVE_SPEED, 1, 300); ring.scale.setScalar(rk); ring.material.opacity = clamp(0.8 - t / 2.2, 0, 0.8);
    wall.scale.set(rk * 0.98, clamp(30 - t * 6, 4, 30), rk * 0.98); wall.position.y = wall.scale.y / 2; wall.material.opacity = clamp(0.6 - t / 9, 0, 0.6);
    const rise = clamp(t * 38, 0, 170); stem.scale.set(14 + t * 2.2, rise, 14 + t * 2.2); stem.position.y = rise / 2; stem.material.opacity = clamp(1.1 - t / 26, 0, 0.85);
    const capR = clamp(20 + t * 14, 20, 75), capY = rise + capR * 0.3; cap.scale.set(capR, capR * 0.55, capR); cap.position.y = capY; cap.material.opacity = clamp(1.1 - t / 30, 0, 0.9); cap.material.color.setRGB(clamp(0.54 - t * 0.008, 0.28, 0.54), clamp(0.35 - t * 0.006, 0.2, 0.35), clamp(0.22 - t * 0.004, 0.14, 0.22));
    capGlow.scale.set(capR * 0.85, capR * 0.5, capR * 0.85); capGlow.position.y = capY - capR * 0.08; capGlow.material.opacity = clamp(0.7 - t / 12, 0, 0.7);
    light.intensity = clamp(60 - t * 14, 0, 60) * (0.9 + Math.random() * 0.2); scorch.material.opacity = 0.82;
    if (t < 34) { requestAnimationFrame(anim); setTimeout(() => { if (document.hidden) anim(); }, 60); } else objs.forEach(o => { scene.remove(o); });
  })();
  // ringing ears for anyone who was close
  if (pd < 420) try { const A = a.getAudio(), m = A.master, v0 = m.gain.value, tt = A.AC.currentTime + delay; m.gain.setValueAtTime(v0, tt); m.gain.linearRampToValueAtTime(v0 * 0.2, tt + 0.1); m.gain.linearRampToValueAtTime(v0, tt + 7); const o = A.AC.createOscillator(), g = A.AC.createGain(); o.frequency.value = 5200; g.gain.setValueAtTime(0.0001, tt); g.gain.linearRampToValueAtTime(0.08, tt + 0.2); g.gain.exponentialRampToValueAtTime(0.0005, tt + 7); o.connect(g); g.connect(m); o.start(tt); o.stop(tt + 7.5); } catch (e) { }
  window.rdToast('☢️ NUKE DETONATED', 3000);
}
window.rdNukeAt = (x, z) => { BT.nukeUsed = true; detonate(x, z); };
})();
