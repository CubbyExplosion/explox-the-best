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
const NEED = 15, KILL_R = 150, BURN_R = 230, WAVE_SPEED = 220, SAFE_R = 65, HURT_R = 150;      // you must aim at least SAFE_R from yourself (the Endless arena is only 250 m wide); within SAFE_R of ground zero you die, out to HURT_R you are hurt
Object.assign(R_NADE, {
  pipe_1:  { kind: 'frag', name: 'Pipe Bomb', emoji: '🔩', price: 80, dmg: 140, radius: 5.5, fuse: 2.2 },
  dyn_1:   { kind: 'frag', name: 'Dynamite Bundle', emoji: '🧨', price: 320, dmg: 320, radius: 9, fuse: 4 },
  cluster_1: { kind: 'frag', name: 'Cluster Grenade', emoji: '💥', price: 380, dmg: 210, radius: 11, fuse: 3 },
  c4_1:    { kind: 'c4', name: 'C4 Charge (press X)', emoji: '📦', price: 450, dmg: 430, radius: 9.5, fuse: 9999 },
  mine_1:  { kind: 'mine', name: 'Proximity Mine', emoji: '⭕', price: 260, dmg: 300, radius: 7.5, fuse: 9999 },
  nuke_1:  { kind: 'nuke', name: 'Tactical Nuke', emoji: '☢️', price: 500, fuse: 9999 },
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
    const k = n.def.kind; if (k !== 'c4' && k !== 'mine' && k !== 'airstrike' && k !== 'nuke') return; const m = n.m;
    if (k === 'nuke') { if (m.position.y <= 0.1 && n.age > 0.15) { const j = R.nades.indexOf(n); if (j >= 0) R.nades.splice(j, 1); scene.remove(m); const d = Math.hypot(m.position.x - playerPos.x, m.position.z - playerPos.z); if (d < SAFE_R) { R.pack['gren:nuke_1'] = (R.pack['gren:nuke_1'] || 0) + 1; window.rdToast('☢️ Too close to your own feet — throw it at least ' + SAFE_R + ' m away! (nuke returned)', 3200); } else if (!BT.nukePending) launch(m.position.x, m.position.z, true); } return; }
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
const en = () => BT.on && BT.mode === 'endless' && BT.en && !BT.en.over, hc = () => (BT.on && BT.mode === 'hardcore' && BT.hc && !BT.hc.over) || en(), nukesLeft = () => { if (en()) return BT.en.nukes || 0; if (!hc()) return 0; if (BT.hc.nukes === undefined) BT.hc.nukes = 2; return BT.hc.nukes; };
// nukes you bought (Armory & Shop → Throwables, ⚙️500) live in your stash; the free ones (Hardcore: 2, Team Battle: after 15 kills) are used first
const owned = () => { try { return window.RDUI.stashN('gren:nuke_1'); } catch (e) { return 0; } };
const freeLeft = () => hc() ? nukesLeft() : (BT.on && BT.mode === 'battle' && !BT.nukeUsed && BT.stats && BT.stats.kills >= NEED ? 1 : 0);
function ready() { return freeLeft() + owned() > 0; }
function takeNuke() { if (en() && nukesLeft() > 0) BT.en.nukes = nukesLeft() - 1; else if (hc() && nukesLeft() > 0) BT.hc.nukes = nukesLeft() - 1; else if (!hc() && freeLeft() > 0) BT.nukeUsed = true; else if (owned() > 0) { window.RDUI.stashAdd('gren:nuke_1', -1); try { saveUserData(); } catch (e) { } } }
setInterval(() => {
  nadeTick(); const okMode = BT.on && (BT.mode === 'battle' || BT.mode === 'endless' || hc()); if (!okMode || !R.on) { if (hud) hud.style.display = 'none'; return; } ensureHud(); const f = freeLeft(), o = owned(); hud.style.display = (BT.mode === 'battle' && BT.nukeUsed && !o) || (hc() && !f && !o) ? 'none' : 'block';
  hud.textContent = ready() ? '☢️ Nukes: ' + (f + o) + (o ? ' (' + o + ' bought)' : '') + ' — aim at the ground 65 m+ away and press N' : '☢️ Nuke: ' + (BT.stats ? BT.stats.kills : 0) + '/' + NEED + ' kills (or buy one in the Armory)';
  hud.style.color = ready() ? '#ff7a4a' : '#ffe08a';
}, 120);
document.addEventListener('keydown', e => {
  if (e.code !== 'KeyN' || e.repeat || !BT.on || !(BT.mode === 'battle' || BT.mode === 'endless' || hc()) || !R.on || R.dead) return; ensureHud();
  if (BT.nukePending) return; if (!ready()) { window.rdToast(`☢️ No nuke: earn one with ${NEED} kills (you have ${BT.stats.kills}) or buy one in the Armory & Shop for ⚙️500`, 3000); return; }
  const dir = new THREE.Vector3(); camera.getWorldDirection(dir); const o = camera.position; let x, z;
  if (dir.y < -0.02) { const t = -o.y / dir.y; x = o.x + dir.x * t; z = o.z + dir.z * t; } else { x = o.x + dir.x * 220; z = o.z + dir.z * 220; }
  x = clamp(x, -BT.half + 10, BT.half - 10); z = clamp(z, -BT.half + 10, BT.half - 10); const d = Math.hypot(x - playerPos.x, z - playerPos.z);
  if (d < SAFE_R) { window.rdToast(`☢️ Too close — you would die in the blast. Aim at least ${SAFE_R} m away (that spot is ${Math.round(d)} m from you).`, 3200); return; }
  launch(x, z);
});
// ───────── the bomber: a jet flies in, drops the nuke 2.5 s before impact and leaves a contrail ─────────
function makeJet() {
  const g = new THREE.Group(), steel = new THREE.MeshStandardMaterial({ color: 0x6d737a, metalness: 0.7, roughness: 0.35 }), dark = new THREE.MeshStandardMaterial({ color: 0x25282c, metalness: 0.6, roughness: 0.5 }); steel.fog = false; dark.fog = false;
  const fus = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.8, 16, 12), steel); fus.rotation.x = Math.PI / 2; g.add(fus);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(1.1, 5, 12), steel); nose.rotation.x = Math.PI / 2; nose.position.z = 10.5; g.add(nose);
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), new THREE.MeshStandardMaterial({ color: 0x1a2a3a, metalness: 0.9, roughness: 0.1, fog: false })); canopy.scale.set(0.8, 0.7, 2.2); canopy.position.set(0, 0.95, 5); g.add(canopy);
  const wingShape = new THREE.Shape(); wingShape.moveTo(0, 3); wingShape.lineTo(11, -3.5); wingShape.lineTo(11, -5.2); wingShape.lineTo(0, -6); wingShape.closePath();
  [-1, 1].forEach(s => { const w = new THREE.Mesh(new THREE.ExtrudeGeometry(wingShape, { depth: 0.18, bevelEnabled: false }), steel); w.rotation.x = Math.PI / 2; w.rotation.z = s < 0 ? Math.PI : 0; w.scale.x = 1; w.position.set(0, -0.2, 1); if (s < 0) { w.scale.x = -1; } g.add(w); const fin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.6, 2.4), dark); fin.position.set(s * 1.6, 1.3, -7.2); fin.rotation.z = s * 0.2; g.add(fin); const tail = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 1.8), steel); tail.position.set(s * 2.2, 0.2, -7.8); g.add(tail); const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.7, 4, 10), dark); eng.rotation.x = Math.PI / 2; eng.position.set(s * 1.5, -0.25, -6.6); g.add(eng); });
  const flames = [-1, 1].map(s => { const f = new THREE.Mesh(new THREE.ConeGeometry(0.55, 7, 8), new THREE.MeshBasicMaterial({ color: 0xffa24a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); f.rotation.x = -Math.PI / 2; f.position.set(s * 1.5, -0.25, -12.2); g.add(f); return f; });
  const bay = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 4), dark); bay.position.set(0, -1.05, 1); g.add(bay);
  const strobe = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff2a2a, fog: false })); strobe.position.set(0, 2.6, -7.2); g.add(strobe);
  g.userData.nuke = true; g.userData.flames = flames; g.userData.strobe = strobe; g.scale.setScalar(1.6); return g;
}
function jetFlight(x, z, t0) {
  const ang = Math.random() * 6.2832, dx = Math.sin(ang), dz = Math.cos(ang), SP = 200, ALT = 230, REL = 5.5, LEAD = 500;                              // flies along (dx,dz) over the target, releases the bomb 500 m before it
  const jet = makeJet(); jet.userData.nuke = true; jet.rotation.y = Math.atan2(dx, dz); scene.add(jet);
  const trail = [], puffMat = () => new THREE.SpriteMaterial({ map: cloudTex(1), color: 0xffffff, transparent: true, depthWrite: false, opacity: 0.5, fog: false });
  const missile = new THREE.Group(), body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 7, 10), new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.6, roughness: 0.4, fog: false })); missile.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2, 10), new THREE.MeshStandardMaterial({ color: 0xaa2a2a, fog: false })); nose.position.y = -4.5; nose.rotation.x = Math.PI; missile.add(nose);
  const flame = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.1, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); flame.position.y = 9; missile.add(flame);
  missile.scale.setScalar(1.8); missile.visible = false; missile.userData.nuke = true; scene.add(missile);
  const startX = x - dx * (LEAD + SP * REL), startZ = z - dz * (LEAD + SP * REL), relX = x - dx * LEAD, relZ = z - dz * LEAD; let puffT = 0, last = performance.now(), dead = false;
  const vel = new THREE.Vector3(), nextP = new THREE.Vector3();
  (function step() {
    if (dead) return; if (!R.on) { scene.remove(jet); scene.remove(missile); trail.forEach(p => scene.remove(p.s)); return; }
    const now = performance.now(), t = (now - t0) / 1000, dt = Math.min(0.1, (now - last) / 1000); last = now;
    jet.position.set(startX + dx * SP * t, ALT, startZ + dz * SP * t); jet.rotation.z = Math.sin(t * 1.3) * 0.03; jet.userData.flames.forEach(f => { f.scale.y = 0.8 + Math.random() * 0.4; }); jet.userData.strobe.visible = Math.sin(t * 9) > 0.6;
    puffT -= dt; if (puffT <= 0 && t < 14) { puffT = 0.06; [-1.5, 1.5].forEach(s => { const sp = new THREE.Sprite(puffMat()); sp.position.copy(jet.position).add(new THREE.Vector3(dx * -20 + dz * s * 1.6 * 1.6, -0.5, dz * -20 - dx * s * 1.6 * 1.6)); sp.scale.setScalar(5); scene.add(sp); sp.userData.nuke = true; trail.push({ s: sp, age: 0 }); }); }
    for (let i = trail.length - 1; i >= 0; i--) { const p = trail[i]; p.age += dt; p.s.scale.setScalar(5 + p.age * 9); p.s.material.opacity = Math.max(0, 0.5 * (1 - p.age / 9)); if (p.age > 9) { scene.remove(p.s); p.s.material.dispose(); trail.splice(i, 1); } }
    if (t >= REL) { missile.visible = true; const k = Math.min(1, (t - REL) / 2.5), kk = Math.min(1, (t - REL + 0.05) / 2.5); missile.position.set(relX + (x - relX) * k, ALT * (1 - k * k) + 5, relZ + (z - relZ) * k); nextP.set(relX + (x - relX) * kk, ALT * (1 - kk * kk) + 5, relZ + (z - relZ) * kk); vel.copy(nextP).sub(missile.position); if (vel.lengthSq() > 1e-6) missile.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vel.normalize().negate()); if (k >= 1) missile.visible = false; }
    if (t < 20) { requestAnimationFrame(step); setTimeout(() => { if (document.hidden) step(); }, 50); } else { dead = true; scene.remove(jet); scene.remove(missile); setTimeout(() => trail.forEach(p => scene.remove(p.s)), 9000); }
  })();
  return { dx, dz, SP, startX, startZ, REL };
}
// ───────── sound: jet flyby, bomb whistle, and a layered, echoing detonation ─────────
let revIR = null;
function audioCtx() { const a = window.RDX.api.getAudio(); return a && a.AC ? a : null; }
function noiseBuf(AC, sec) { const b = AC.createBuffer(1, Math.ceil(AC.sampleRate * sec), AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
function reverb(AC) { if (revIR) return revIR; const len = AC.sampleRate * 5, b = AC.createBuffer(2, len, AC.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); } const cv = AC.createConvolver(); cv.buffer = b; return revIR = cv; }
function jetSound(flight, tx, tz) {
  const A = audioCtx(); if (!A) return; const AC = A.AC, t0 = AC.currentTime, pass = flight.REL;                                                       // closest approach to the target at t = pass (+0.9 s: it is 500 m past by then)
  const o1 = AC.createOscillator(), o2 = AC.createOscillator(), n = AC.createBufferSource(), lp = AC.createBiquadFilter(), bp = AC.createBiquadFilter(), g = AC.createGain(), pan = AC.createStereoPanner ? AC.createStereoPanner() : null;
  o1.type = 'sawtooth'; o2.type = 'sawtooth'; n.buffer = noiseBuf(AC, 3); n.loop = true; lp.type = 'lowpass'; bp.type = 'bandpass'; bp.Q.value = 0.7;
  const pp = playerPos, rel = (flight.dx * (pp.z - tz) - flight.dz * (pp.x - tx)), side = rel > 0 ? 1 : -1, lat = Math.abs(rel) + 40, DUR = 14;
  o1.frequency.setValueAtTime(310, t0); o1.frequency.linearRampToValueAtTime(310, t0 + pass); o1.frequency.exponentialRampToValueAtTime(205, t0 + pass + 3); o2.frequency.setValueAtTime(468, t0); o2.frequency.exponentialRampToValueAtTime(310, t0 + pass + 3);        // Doppler: pitch falls once it passes
  lp.frequency.setValueAtTime(700, t0); lp.frequency.linearRampToValueAtTime(2600, t0 + pass); lp.frequency.exponentialRampToValueAtTime(500, t0 + pass + 5); bp.frequency.setValueAtTime(900, t0); bp.frequency.exponentialRampToValueAtTime(380, t0 + DUR);
  const vol = clamp(1.1 - lat / 1500, 0.25, 0.9); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.05 * vol, t0 + 1.5); g.gain.exponentialRampToValueAtTime(0.5 * vol, t0 + pass + 0.4); g.gain.exponentialRampToValueAtTime(0.0008, t0 + DUR);
  const nz = AC.createGain(); nz.gain.value = 1.4; o1.connect(lp); o2.connect(lp); n.connect(bp); bp.connect(nz); nz.connect(lp); lp.connect(g); if (pan) { pan.pan.setValueAtTime(-side * 0.95, t0); pan.pan.linearRampToValueAtTime(-side * 0.1, t0 + pass); pan.pan.linearRampToValueAtTime(side * 0.95, t0 + DUR); g.connect(pan); pan.connect(A.master); } else g.connect(A.master);
  o1.start(t0); o2.start(t0); n.start(t0); o1.stop(t0 + DUR + 0.2); o2.stop(t0 + DUR + 0.2); n.stop(t0 + DUR + 0.2);
  // the bomb falling: a descending whistle with a wobble
  const w = AC.createOscillator(), wg = AC.createGain(), wl = AC.createOscillator(), wlg = AC.createGain(); w.type = 'sine'; const ws = t0 + pass; w.frequency.setValueAtTime(3200, ws); w.frequency.exponentialRampToValueAtTime(700, ws + 2.5); wl.frequency.value = 9; wlg.gain.value = 60; wl.connect(wlg); wlg.connect(w.frequency); wg.gain.setValueAtTime(0.0001, ws); wg.gain.exponentialRampToValueAtTime(0.16, ws + 2.3); wg.gain.linearRampToValueAtTime(0, ws + 2.52); w.connect(wg); wg.connect(A.master); w.start(ws); wl.start(ws); w.stop(ws + 2.6); wl.stop(ws + 2.6);
}
function nukeSound(delay, dist) {
  const A = audioCtx(); if (!A) return; const AC = A.AC, t = AC.currentTime + delay, vol = clamp(1.25 - dist / 1100, 0.45, 1.25), rv = reverb(AC), wet = AC.createGain(), dry = AC.createGain(), out = AC.createGain(); wet.gain.value = 0.55; dry.gain.value = 1; out.gain.value = vol; rv.connect(wet); wet.connect(out); dry.connect(out); out.connect(A.master);
  const sat = AC.createWaveShaper(), curve = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * 3.2); } sat.curve = curve;
  const nb = noiseBuf(AC, 6), src = (buf, off) => { const s = AC.createBufferSource(); s.buffer = buf; s.start(t + (off || 0), Math.random()); return s; }, send = n => { n.connect(dry); n.connect(rv); };
  // 1) the crack: a very short, very bright burst
  { const s = src(nb), hp = AC.createBiquadFilter(), g = AC.createGain(); hp.type = 'highpass'; hp.frequency.value = 2500; g.gain.setValueAtTime(1.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12); s.connect(hp); hp.connect(g); send(g); s.stop(t + 0.2); }
  // 2) the blast: a roaring wall of noise that darkens as it rolls away
  { const s = src(nb), lp = AC.createBiquadFilter(), g = AC.createGain(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(5000, t); lp.frequency.exponentialRampToValueAtTime(70, t + 5); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1.7, t + 0.05); g.gain.exponentialRampToValueAtTime(0.5, t + 1.2); g.gain.exponentialRampToValueAtTime(0.001, t + 6); s.connect(lp); lp.connect(sat); sat.connect(g); send(g); s.stop(t + 6.2); }
  // 3) the thump you feel in your chest: sub-bass sweeps with distortion
  { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(24, t + 2.8); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1.8, t + 0.04); g.gain.exponentialRampToValueAtTime(0.001, t + 4.2); o.connect(sat); sat.connect(g); send(g); o.start(t); o.stop(t + 4.4);
    const o2 = AC.createOscillator(), g2 = AC.createGain(); o2.type = 'triangle'; o2.frequency.setValueAtTime(52, t); o2.frequency.exponentialRampToValueAtTime(18, t + 4); g2.gain.setValueAtTime(0.0001, t + 0.1); g2.gain.exponentialRampToValueAtTime(1.1, t + 0.4); g2.gain.exponentialRampToValueAtTime(0.001, t + 5); o2.connect(g2); send(g2); o2.start(t); o2.stop(t + 5.2); }
  // 4) the long rolling rumble with slow pulsing, then fire crackle, then a distant echo of the blast bouncing back
  { const s = src(nb, 0.6), lp = AC.createBiquadFilter(), g = AC.createGain(), lfo = AC.createOscillator(), lg = AC.createGain(); lp.type = 'lowpass'; lp.frequency.value = 130; lfo.frequency.value = 3.2; lg.gain.value = 0.25; lfo.connect(lg); lg.connect(g.gain); g.gain.setValueAtTime(0.0001, t + 0.6); g.gain.exponentialRampToValueAtTime(0.9, t + 1.4); g.gain.exponentialRampToValueAtTime(0.001, t + 9); s.connect(lp); lp.connect(g); send(g); lfo.start(t); lfo.stop(t + 9.5); s.stop(t + 9.6); }
  { const s = src(nb, 1.8), bp = AC.createBiquadFilter(), g = AC.createGain(); bp.type = 'lowpass'; bp.frequency.value = 600; g.gain.setValueAtTime(0.0001, t + 1.8); g.gain.exponentialRampToValueAtTime(0.45, t + 2.0); g.gain.exponentialRampToValueAtTime(0.001, t + 5.5); s.connect(bp); bp.connect(g); send(g); s.stop(t + 6); }                  // echo
  for (let i = 0; i < 60; i++) { const at = t + 2 + Math.random() * 9, s = AC.createBufferSource(), g = AC.createGain(), hp = AC.createBiquadFilter(); s.buffer = nb; hp.type = 'bandpass'; hp.frequency.value = 1500 + Math.random() * 3000; g.gain.setValueAtTime(0.14 * (1 - (at - t) / 12), at); g.gain.exponentialRampToValueAtTime(0.001, at + 0.05); s.connect(hp); hp.connect(g); g.connect(dry); s.start(at, Math.random() * 3); s.stop(at + 0.07); }   // fire crackle
}

function launch(x, z, noTake) {
  BT.nukePending = true; if (!noTake) takeNuke(); const cnt = document.getElementById('nukeCount'); cnt.style.display = 'block'; let left = 8; window.rdToast('☢️ TACTICAL NUKE LAUNCHED — everyone within ' + KILL_R + ' m of the target will die!', 4500);
  const t0 = performance.now(), siren = setInterval(() => { try { api().tone(((performance.now() - t0) / 450 | 0) % 2 ? 520 : 760, 0.45, 0.4, 'square'); } catch (e) { } }, 450);
  const tick = setInterval(() => { left--; cnt.textContent = '☢️ NUKE IN ' + left; if (left <= 0) { clearInterval(tick); clearInterval(siren); cnt.style.display = 'none'; } }, 1000); cnt.textContent = '☢️ NUKE IN 8';
  const flight = jetFlight(x, z, t0); jetSound(flight, x, z);
  setTimeout(() => { detonate(x, z); }, 8000);
}
const gm = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c, transparent: true, depthWrite: false }, o || {}));
// ── realistic mushroom cloud: hundreds of billowing smoke/fire puffs, a rolling vortex cap, a swirling stem, a ground dust wall, a shock dome,
//    a condensation ring, debris and embers ──
let ctex = null;
function cloudTex(i) {
  if (!ctex) { ctex = []; for (let v = 0; v < 3; v++) { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); for (let k = 0; k < 26; k++) { const px = 64 + (Math.random() - 0.5) * 60, py = 64 + (Math.random() - 0.5) * 60, r = 14 + Math.random() * 28, g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `rgba(255,255,255,${0.22 + Math.random() * 0.2})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); } const m = x.createRadialGradient(64, 64, 30, 64, 64, 64); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = m; x.fillRect(0, 0, 128, 128); ctex.push(new THREE.CanvasTexture(c)); } }
  return ctex[i % 3];
}
function cloudFx(x, z, tag) {
  const P = [], sprite = (o) => { const mat = new THREE.SpriteMaterial({ map: cloudTex(o.tex || 0), color: o.c, transparent: true, depthWrite: false, opacity: 0, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, rotation: Math.random() * 6.28 }); const s = new THREE.Sprite(mat); s.position.set(x, 1, z); s.scale.setScalar(1); tag(s); P.push(Object.assign({ s, life: 6, size: 20, grow: 1.6 }, o)); return P[P.length - 1]; };
  const tmp = new THREE.Color(), brown = new THREE.Color(0x6a5a4c);
  const col = (k, out) => { if (k < 0.35) out.setRGB(1, 0.95 - k * 1.1, 0.75 - k * 2.0); else if (k < 0.7) out.setRGB(1 - (k - 0.35) * 0.9, 0.56 - (k - 0.35) * 0.9, 0.05 + (k - 0.35) * 0.1); else out.setRGB(0.68 - (k - 0.7) * 0.9, 0.24 + (k - 0.7) * 0.5, 0.09 + (k - 0.7) * 0.4); return out; };
  for (let i = 0; i < 70; i++) { const a = Math.random() * 6.28, el = Math.random() * 1.2, r = Math.random(); sprite({ kind: 'fire', add: true, tex: i, c: 0xffffff, size: 26 + Math.random() * 30, grow: 2.0, life: 2.6 + Math.random() * 2.4, delay: Math.random() * 0.8, vx: Math.cos(a) * Math.cos(el) * (18 + 35 * r), vy: 14 + Math.sin(el) * 30 + 16 * r, vz: Math.sin(a) * Math.cos(el) * (18 + 35 * r), drag: 1.1 }); }
  for (let i = 0; i < 150; i++) sprite({ kind: 'stem', tex: i, c: 0x6a5a4c, size: 16 + Math.random() * 14, grow: 1.7, life: 14 + Math.random() * 10, delay: 0.3 + i * 0.055 + Math.random() * 0.1, rad: 4 + Math.random() * 7, ang: Math.random() * 6.28, rise: 36 + Math.random() * 14 });
  for (let i = 0; i < 160; i++) sprite({ kind: 'cap', tex: i, c: 0x7a6a5c, size: 22 + Math.random() * 20, grow: 1.35, life: 36, delay: 2.0 + Math.random() * 1.2, phi: Math.random() * 6.28, th: Math.random() * 6.28, rr: 0.7 + Math.random() * 0.5 });
  for (let i = 0; i < 70; i++) { const a = i / 70 * 6.28 + Math.random() * 0.1; sprite({ kind: 'dust', tex: i, c: 0x9a8668, size: 28 + Math.random() * 30, grow: 1.4, life: 9 + Math.random() * 5, delay: 0, ang: a, h: 6 + Math.random() * 14 }); }
  for (let i = 0; i < 90; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(rnd(0.6, 2.2), rnd(0.4, 1.6), rnd(0.6, 2.2)), new THREE.MeshStandardMaterial({ color: 0x14110f, roughness: 1 })); m.position.set(x, 2, z); tag(m); const a = Math.random() * 6.28, v = rnd(30, 120); P.push({ kind: 'debris', m, vx: Math.cos(a) * v, vy: rnd(40, 140), vz: Math.sin(a) * v, wx: rnd(-6, 6), wz: rnd(-6, 6), life: 9, delay: 0.1 }); }
  for (let i = 0; i < 120; i++) sprite({ kind: 'ember', add: true, tex: 0, c: 0xff8a30, size: 3 + Math.random() * 4, grow: 0.3, life: 8 + Math.random() * 8, delay: 0.4 + Math.random() * 3, ex: rnd(-60, 60), ey: rnd(30, 150), ez: rnd(-60, 60) });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xfff0d8, transparent: true, opacity: 0.3, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); dome.position.set(x, 0, z); tag(dome);
  const cond = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); cond.rotation.x = -Math.PI / 2; tag(cond);
  const glow = document.createElement('div'); glow.style.cssText = 'position:fixed;inset:0;z-index:89;pointer-events:none;background:radial-gradient(ellipse at 50% 60%,rgba(255,150,40,.35),rgba(255,60,0,.12) 55%,transparent 80%);opacity:0'; document.body.appendChild(glow);
  return {
    update(t, dt) {
      const capC = Math.min(210, 22 + t * 24), capR = Math.min(78, 14 + t * 9), minor = Math.min(34, 8 + t * 3.2);
      P.forEach(p => {
        const age = t - (p.delay || 0); if (age < 0) return;
        if (p.kind === 'debris') { p.vy -= 55 * dt; p.m.position.x += p.vx * dt; p.m.position.y = Math.max(0.3, p.m.position.y + p.vy * dt); p.m.position.z += p.vz * dt; p.m.rotation.x += p.wx * dt; p.m.rotation.z += p.wz * dt; if (p.m.position.y <= 0.31) { p.vx *= 0.9; p.vz *= 0.9; p.vy = 0; } p.m.visible = age < 12; return; }
        const k = age / p.life; const mat = p.s.material, s = p.s; if (k >= 1) { mat.opacity = 0; return; }
        if (p.kind === 'fire') { p.vx *= (1 - p.drag * dt); p.vz *= (1 - p.drag * dt); p.vy *= (1 - 0.5 * dt); s.position.x += p.vx * dt; s.position.y += p.vy * dt; s.position.z += p.vz * dt; col(clamp(k * 1.05, 0, 1), mat.color); mat.opacity = (k < 0.08 ? k / 0.08 : 1) * clamp(1.15 - k, 0, 1) * 0.9; s.scale.setScalar(p.size * (1 + k * p.grow)); }
        else if (p.kind === 'stem') { const y = Math.min(capC - 10, age * p.rise); p.ang += dt * (0.6 + 6 / (p.rad + 3)); const rr = p.rad + age * 0.5; s.position.set(x + Math.cos(p.ang) * rr, 4 + y, z + Math.sin(p.ang) * rr); const hot = clamp(1 - age / 3.5, 0, 1); col(0.45 + (1 - hot) * 0.5, tmp); mat.color.copy(tmp).lerp(brown, 1 - hot * 0.6); mat.opacity = (k < 0.05 ? k / 0.05 : 1) * clamp(1.0 - k, 0, 1) * 0.72; s.scale.setScalar(p.size * (1 + Math.min(age, 14) * 0.35)); }
        else if (p.kind === 'cap') { p.phi += dt * (0.55 + 0.25 * p.rr); p.th += dt * 0.35; const ringR = capR + Math.cos(p.phi) * minor * p.rr, h = capC + Math.sin(p.phi) * minor * 0.8 * p.rr; s.position.set(x + Math.cos(p.th) * ringR, 8 + h, z + Math.sin(p.th) * ringR); const under = clamp(0.5 - Math.sin(p.phi) * 0.5, 0, 1), cool = clamp(age / 14, 0, 1); col(clamp(0.38 + cool * 0.45 - under * 0.3, 0, 1), mat.color); mat.opacity = (age < 1.2 ? age / 1.2 : 1) * clamp(1.35 - k * 1.1, 0, 1) * 0.8; s.scale.setScalar(p.size * (1 + Math.min(age, 20) * 0.1)); }
        else if (p.kind === 'dust') { const Rr = Math.min(t * 200, 330) * (1 - 0.15 * clamp(t / 4, 0, 1)); s.position.set(x + Math.cos(p.ang) * Rr, p.h * (1 + age * 0.15), z + Math.sin(p.ang) * Rr); mat.opacity = (age < 0.5 ? age / 0.5 : 1) * clamp(1 - k * 1.1, 0, 1) * 0.55; s.scale.setScalar(p.size * (1 + age * 0.5)); }
        else if (p.kind === 'ember') { s.position.set(x + p.ex + Math.sin(age * 2 + p.ey) * 6, p.ey - age * 4 + 20, z + p.ez + Math.cos(age * 2 + p.ey) * 6); mat.opacity = clamp(1 - k, 0, 1) * (0.5 + 0.5 * Math.sin(age * 12 + p.ex)); s.scale.setScalar(p.size); }
      });
      const dk = clamp(t / 1.4, 0, 1); dome.scale.setScalar(Math.max(1, 330 * (1 - Math.pow(1 - dk, 2.4)))); dome.material.opacity = 0.3 * clamp(1.15 - t / 1.9, 0, 1);
      const ck = clamp((t - 3.5) / 7, 0, 1); cond.position.set(x, capC * 0.55 + 20, z); cond.scale.setScalar(30 + ck * 120); cond.material.opacity = Math.sin(ck * Math.PI) * 0.35;
      glow.style.opacity = String(clamp(1.1 - t / 9, 0, 0.9));
    },
    done() { glow.remove(); }
  };
}

function detonate(x, z) {
  if (!R.on) return; BT.nukePending = false; const pp = playerPos, pd = Math.hypot(x - pp.x, z - pp.z), t0 = performance.now(), objs = [], tag = o => { o.userData.nuke = true; scene.add(o); objs.push(o); return o; };
  // white-out + shake + light
  flashEl.style.transition = 'none'; flashEl.style.opacity = String(clamp(1.7 - pd / 280, 0.35, 1)); setTimeout(() => { flashEl.style.transition = 'opacity 3.5s ease-out'; flashEl.style.opacity = '0'; }, 120); R.shake = 2.2;
  const light = window.rdLightPool.take(0xffd8a0, 60, 900, new THREE.Vector3(x, 60, z), 0);
  // fireball, inner core, shock ring, dust wall, mushroom stem + cap, scorch
  const cl = cloudFx(x, z, tag);
  const ring = tag(new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 64), gm(0xffe9b8, { side: THREE.DoubleSide, blending: THREE.AdditiveBlending, opacity: 0.8 }))); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.5, z);
  const scorch = new THREE.Mesh(new THREE.CircleGeometry(150, 40), new THREE.MeshBasicMaterial({ color: 0x0b0907, transparent: true, opacity: 0.82, depthWrite: false })); scorch.rotation.x = -Math.PI / 2; scorch.position.set(x, 0.06, z); scorch.userData.nuke = true; scene.add(scorch);
  // sound (arrives later the farther you are)
  const delay = Math.min(2.6, pd / 340), a = api(); try { nukeSound(delay, pd); } catch (e) { }
  // everyone caught by the shockwave
  const I = window.BTX.i, hit = new Set(), ents = () => [].concat(enemies, BT.allies);
  const dead = [], arrival = d => d / WAVE_SPEED * 1000;
  function wave() {
    if (!R.on) return; const el = performance.now() - t0;
    ents().forEach(b => { if (!b.alive || hit.has(b)) return; const d = Math.hypot(b.mesh.position.x - x, b.mesh.position.z - z); if (el < arrival(d)) return; hit.add(b); b.hp -= 1000; if (true) { const foe = b.team === 'B'; I.botDie(b, foe ? 'player' : 'ally'); if (foe) { R.xpGain += 6; userState.xp += 6; } b.mesh.position.y = 0.22; } else { b.hp = Math.max(1, b.hp * 0.2); } });
    BT.vehicles.forEach(v => { if (!v.alive || hit.has(v)) return; const d = Math.hypot(v.pos.x - x, v.pos.z - z); if (el < arrival(d)) return; hit.add(v); I.damageVehicle(v, d < 300 ? 99999 : 1000, 'player'); });
    if (!hit.has('p') && !R.dead) { const d = Math.hypot(playerPos.x - x, playerPos.z - z); if (d <= HURT_R && el >= arrival(d)) { hit.add('p'); R.shake = 2; if (d < SAFE_R) { ['chest', 'head', 'stomach'].forEach(zn => a.hurtPlayer({ dmg: 900, pen: 9 }, zn, 1)); } else a.hurtPlayer({ dmg: 70, pen: 6 }, 'chest', 1); flashEl.style.transition = 'none'; flashEl.style.opacity = '0.9'; setTimeout(() => { flashEl.style.transition = 'opacity 2.5s'; flashEl.style.opacity = '0'; }, 80); } }
    if (!wave.merged && scene.userData.mapMeshObj && el >= arrival(60)) { wave.merged = true; const rm = window.rdMapRemove(p => Math.hypot(p.x - x, p.z - z) < KILL_R * 0.9 && p.y < 80 && p.gt !== 'PlaneGeometry' && p.gt !== 'CircleGeometry' && p.gt !== 'RingGeometry'); for (let q = 0; q < Math.min(60, rm); q++) { const rb = new THREE.Mesh(new THREE.BoxGeometry(rnd(1, 4), rnd(0.5, 2), rnd(1, 4)), new THREE.MeshStandardMaterial({ color: 0x1c1a18, roughness: 1 })); const a = Math.random() * 6.28, r = Math.random() * KILL_R * 0.8; rb.position.set(x + Math.cos(a) * r, 0.5, z + Math.sin(a) * r); rb.rotation.y = rnd(0, 3); rb.userData.nuke = true; scene.add(rb); } }
    // buildings and trees inside the zone are flattened as the shockwave passes
    scene.children.slice().forEach(o => { if (!o.isMesh || o.userData.nuke || o.userData.vehicle || !o.geometry || o.geometry.type === 'PlaneGeometry' || o.geometry.type === 'CircleGeometry' || !o.visible) return; const d = Math.hypot(o.position.x - x, o.position.z - z); if (d < KILL_R * 0.9 && el >= arrival(d) && o.position.y < 80) { o.visible = false; if (d < 70 && Math.random() < 0.5) { const r = new THREE.Mesh(new THREE.BoxGeometry(rnd(1, 4), rnd(0.5, 2), rnd(1, 4)), new THREE.MeshStandardMaterial({ color: 0x1c1a18, roughness: 1 })); r.position.set(o.position.x + rnd(-3, 3), 0.5, o.position.z + rnd(-3, 3)); r.rotation.y = rnd(0, 3); r.userData.nuke = true; scene.add(r); } } });
    if (el < 7500) { requestAnimationFrame(wave); setTimeout(() => { if (document.hidden) wave(); }, 60); } else { currentBuildings.splice(0, currentBuildings.length, ...currentBuildings.filter(b => Math.hypot(b.x - x, b.z - z) > KILL_R * 0.9)); }
  } wave();
  // animation of the cloud
  (function anim() {
    const t = (performance.now() - t0) / 1000, dt = Math.min(0.1, (t - (anim.last || 0))); anim.last = t; if (!R.on) { objs.forEach(o => scene.remove(o)); cl.done(); return; }
    const rk = clamp(t * WAVE_SPEED, 1, 330); ring.scale.setScalar(rk); ring.material.opacity = clamp(0.8 - t / 2.4, 0, 0.8); cl.update(t, dt);
    light.intensity = clamp(60 - t * 9, 0, 60) * (0.9 + Math.random() * 0.2); scorch.material.opacity = 0.82;
    if (t < 44) { requestAnimationFrame(anim); setTimeout(() => { if (document.hidden) anim(); }, 60); } else { objs.forEach(o => { scene.remove(o); if (o.material && o.material.dispose) o.material.dispose(); }); light.intensity = 0; light.userData.free = true; cl.done(); }
  })();
  // ringing ears for anyone who was close
  if (pd < 420) try { const A = a.getAudio(), m = A.master, v0 = m.gain.value, tt = A.AC.currentTime + delay; m.gain.setValueAtTime(v0, tt); m.gain.linearRampToValueAtTime(v0 * 0.2, tt + 0.1); m.gain.linearRampToValueAtTime(v0, tt + 7); const o = A.AC.createOscillator(), g = A.AC.createGain(); o.frequency.value = 5200; g.gain.setValueAtTime(0.0001, tt); g.gain.linearRampToValueAtTime(0.08, tt + 0.2); g.gain.exponentialRampToValueAtTime(0.0005, tt + 7); o.connect(g); g.connect(m); o.start(tt); o.stop(tt + 7.5); } catch (e) { }
  window.rdToast('☢️ NUKE DETONATED', 3000);
}
window.rdNukeAt = (x, z) => { if (!hc()) BT.nukeUsed = true; detonate(x, z); };
})();
