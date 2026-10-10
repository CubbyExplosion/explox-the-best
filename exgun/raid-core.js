// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN RAID — CORE GAMEPLAY  (extraction shooter layer on top of the original EXGUN)
//
//  GUNPLAY   ADS (right mouse / button), recoil that kicks and recovers, spread by moving/crouch/ADS, magazines + reload (R, tactical reload),
//            ammo types with penetration (T to swap), fire modes (B), bolt/pump actions, distance damage falloff, bullets stopped by buildings.
//  BODY      5 body zones with their own HP (head, chest, stomach, arms, legs). Armor vest + helmet with armor class and durability:
//            bullets either PENETRATE (full-ish damage) or are STOPPED (blunt damage) depending on ammo penetration vs armor class.
//            Bleeding (bandage/medkit), broken legs = limp, broken arms = shaky aim, painkillers, stamina, crouch.
//  RAID      loot containers (hold F), enemy corpses to search, 2 extraction zones (hold E for 8 s), 15-minute raid timer.
//            Extract = keep everything. Die / time out = lose everything you carried.
//  ENEMIES   humans with guns: Scav, Raider, PMC, Warlord boss. They patrol, hear shots, need line of sight, strafe, fire bursts, miss at range.
//  LOOK      first-person gun model, muzzle flash, tracers, impact sparks, blood, shadows, filmic tone mapping, grain/vignette, synthesized sound.
//
// It reuses the original EXGUN globals (scene, camera, renderer, enemies, playerPos, yaw, pitch, moveState, fireHeld, userState ...) and overrides
// a few original functions by re-assigning them (animate, tickEnemyAI, spawnWave, updatePlayerMovement, tryFire, handlePlayerDeath, ...).
// The menus (hideout, loadout, shop, inventory, results) live in raid-ui.js; the data tables in raid-data.js.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
function wpick(list) { let t = 0; list.forEach(e => t += e[1]); let r = Math.random() * t; for (const e of list) { r -= e[1]; if (r <= 0) return e; } return list[0]; }

// ───────────────────────── state ─────────────────────────
const R = window.RAID = {
  on: false, over: false, mapIndex: 1, t: 0, limit: 900,
  pack: {}, vest: null, helmet: null, weaponId: null, protect: false, startWeapon: null,
  ammoType: null, mag: 0, reload: 0, reloadTotal: 0, reloadFull: 0, semiReady: true, mode: 'auto', cycle: 0,
  z: Object.assign({}, R_ZONES), bleed: 0, pain: 0, stamina: 100, ads: 0, adsHeld: false, crouch: false, crouchT: 0,
  recoilP: 0, recoilY: 0, bloom: 0, shake: 0, kick: 0,
  use: null, hold: null, holdT: 0, containers: [], extracts: [], particles: [], kills: 0, xpGain: 0, foundValue: 0,
  buff: { speed: 0, regen: 0, regenT: 0, resist: 0, steady: 0 }, flashT: 0, bag: null, nade: null, nades: [], smokes: [], fires: [],
  spawn: { x: 0, z: 0 }, flash: 0, stepAcc: 0, lastHurt: 0, msgT: 0
};
const gun = () => R.gs || R_GUN[R.weaponId];            // R.gs = the gun's stats with its attachments applied (set when a raid starts)
const wcat = () => weaponById(R.weaponId);
const ammo = () => R_AMMO[R.ammoType];
const packCount = id => R.pack[id] || 0;
function totalHp() { let s = 0; for (const k in R.z) s += R.z[k]; return s; }
const MAX_TOTAL = Object.values(R_ZONES).reduce((a, b) => a + b, 0);

// ───────────────────────── audio (all synthesized) ─────────────────────────
let AC = null, master = null, noiseBuf = null;
function audioOn() {
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      master = AC.createGain(); master.gain.value = (window.RDSET && window.RDSET.vol !== undefined) ? window.RDSET.vol : 0.55; master.connect(AC.destination);
      const len = AC.sampleRate * 1.5; noiseBuf = AC.createBuffer(1, len, AC.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (AC.state === 'suspended') AC.resume();
  } catch (e) { AC = null; }
}
function noise(dur, f0, f1, vol, type, delay) {
  if (!AC) return; const t0 = AC.currentTime + (delay || 0);
  const s = AC.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = rnd(0.8, 1.2);
  const f = AC.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
  const g = AC.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t0, Math.random()); s.stop(t0 + dur + 0.05);
}
function tone(freq, dur, vol, type, delay, slide) {
  if (!AC) return; const t0 = AC.currentTime + (delay || 0);
  const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t0 + dur);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
}
function sfxShot(cal, vol, delay) {
  const big = { '9mm': 0.6, '556': 0.85, '762': 1.0, '12g': 1.1, '338': 1.3 }[cal] || 0.8;
  noise(0.28 * big + 0.1, 5200, 260, 0.9 * vol, 'lowpass', delay);                // crack + body
  noise(0.06, 9000, 2500, 0.5 * vol, 'highpass', delay);                          // sharp edge
  tone(120 * (2 - big * 0.7), 0.18 * big + 0.05, 0.7 * vol, 'sine', delay, 45);   // thump
}
const sfx = {
  click() { tone(1800, 0.03, 0.15, 'square'); noise(0.03, 4000, 3000, 0.15, 'bandpass'); },
  reloadOut() { noise(0.07, 3000, 1500, 0.3, 'bandpass'); tone(300, 0.05, 0.12, 'square'); },
  reloadIn() { noise(0.09, 2500, 900, 0.4, 'bandpass'); tone(220, 0.07, 0.2, 'square'); },
  rack() { noise(0.1, 3500, 800, 0.4, 'bandpass'); noise(0.08, 2500, 700, 0.35, 'bandpass', 0.12); },
  hit() { tone(1500, 0.05, 0.25, 'triangle'); },
  headHit() { tone(2100, 0.07, 0.35, 'triangle'); tone(1400, 0.1, 0.25, 'triangle', 0.04); },
  kill() { tone(900, 0.12, 0.3, 'triangle'); tone(1300, 0.18, 0.3, 'triangle', 0.08); },
  armor() { tone(900, 0.08, 0.3, 'square', 0, 400); noise(0.08, 3500, 1500, 0.25, 'bandpass'); },
  flesh() { noise(0.16, 700, 160, 0.7, 'lowpass'); tone(90, 0.15, 0.5, 'sine', 0, 50); },
  whiz() { noise(0.12, 4000, 1800, 0.15, 'bandpass'); },
  impact() { noise(0.1, 2200, 400, 0.25, 'lowpass'); },
  step(run) { noise(0.06, run ? 900 : 700, 250, run ? 0.28 : 0.18, 'lowpass'); },
  heal() { tone(520, 0.2, 0.18, 'sine'); tone(780, 0.3, 0.18, 'sine', 0.12); },
  extract() { tone(440, 0.25, 0.25, 'triangle'); tone(660, 0.25, 0.25, 'triangle', 0.15); tone(880, 0.4, 0.25, 'triangle', 0.3); },
  loot() { noise(0.12, 2500, 800, 0.25, 'bandpass'); tone(700, 0.08, 0.15, 'square', 0.05); },
  beat() { tone(60, 0.12, 0.5, 'sine', 0, 40); tone(55, 0.14, 0.4, 'sine', 0.2, 38); }
};
setInterval(() => { if (R.on && !R.over && totalHp() < MAX_TOTAL * 0.32) sfx.beat(); }, 1000);

// ───────────────────────── small visual effects ─────────────────────────
let fx = { tracers: [], sparks: [], blood: [], decals: [] };
function addTracer(from, to, color, life) {
  const g = new THREE.BufferGeometry().setFromPoints([from, to]);
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
  scene.add(l); fx.tracers.push({ m: l, t: life || 0.07, life: life || 0.07 });
}
function burst(pos, color, n, speed, size, arr, grav) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshBasicMaterial({ color, transparent: true }));
    m.position.copy(pos); scene.add(m);
    arr.push({ m, v: new THREE.Vector3(rnd(-1, 1) * speed, rnd(0.2, 1) * speed, rnd(-1, 1) * speed), t: rnd(0.25, 0.6), grav: grav });
  }
}
function updateFx(dt) {
  fx.tracers = fx.tracers.filter(o => { o.t -= dt; o.m.material.opacity = Math.max(0, o.t / o.life); if (o.t <= 0) { scene.remove(o.m); o.m.geometry.dispose(); o.m.material.dispose(); return false; } return true; });
  [fx.sparks, fx.blood].forEach((arr, idx) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i]; p.t -= dt; p.v.y -= p.grav * dt; p.m.position.addScaledVector(p.v, dt); p.m.material.opacity = Math.max(0, p.t * 2.2);
      if (p.t <= 0 || p.m.position.y < 0) { scene.remove(p.m); p.m.geometry.dispose(); p.m.material.dispose(); arr.splice(i, 1); }
    }
  });
}
function clearFx() {
  [fx.tracers, fx.sparks, fx.blood].forEach(arr => arr.forEach(o => scene && scene.remove(o.m))); fx = { tracers: [], sparks: [], blood: [], decals: [] };
}

// ───────────────────────── geometry helpers (buildings are axis-aligned footprints) ─────────────────────────
// distance along a horizontal ray to the first building it enters (Infinity if none)
function rayBuildings(ox, oz, dx, dz, maxD) {
  const len = Math.hypot(dx, dz) || 1e-6; let best = Infinity;
  for (const b of currentBuildings) {
    if (b.low) continue;                                       // low cover (sandbags, barriers) does not stop bullets or sight
    let t0 = 0, t1 = maxD;
    const ax = [ox, dx, b.x - b.hw, b.x + b.hw], az = [oz, dz, b.z - b.hd, b.z + b.hd];
    let ok = true;
    for (const a of [ax, az]) {
      const o = a[0], d = a[1];
      if (Math.abs(d) < 1e-6) { if (o < a[2] || o > a[3]) { ok = false; break; } }
      else { let ta = (a[2] - o) / d, tb = (a[3] - o) / d; if (ta > tb) { const s = ta; ta = tb; tb = s; } t0 = Math.max(t0, ta); t1 = Math.min(t1, tb); if (t0 > t1) { ok = false; break; } }
    }
    if (ok && t0 < best) best = t0;
  }
  return best;
}
// is the straight line between two ground points free of buildings?
function lineClear(ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, d = Math.hypot(dx, dz); if (d < 0.01) return true;
  if (R.smokes && R.smokes.length) for (const s of R.smokes) {                         // smoke clouds block line of sight
    const t = clamp(((s.x - ax) * dx + (s.z - az) * dz) / (d * d), 0, 1);
    if (Math.hypot(ax + dx * t - s.x, az + dz * t - s.z) < s.r) return false;
  }
  return rayBuildings(ax, az, dx / d, dz / d, d) >= d;
}

// ───────────────────────── first-person weapon model ─────────────────────────
let vm = null;      // { g, parts, flash, light, base }
const MAT = {
  metal: () => new THREE.MeshStandardMaterial({ color: 0x1b1d20, metalness: 0.85, roughness: 0.38 }),
  steel: () => new THREE.MeshStandardMaterial({ color: 0x4a4f55, metalness: 0.9, roughness: 0.3 }),
  poly: () => new THREE.MeshStandardMaterial({ color: 0x24262a, metalness: 0.1, roughness: 0.75 }),
  wood: () => new THREE.MeshStandardMaterial({ color: 0x5a3a22, metalness: 0.05, roughness: 0.7 }),
  skin: () => new THREE.MeshStandardMaterial({ color: 0xc89a78, metalness: 0, roughness: 0.8 }),
  sleeve: () => new THREE.MeshStandardMaterial({ color: 0x2f3b2a, metalness: 0, roughness: 0.9 })
};
function box(w, h, d, mat, x, y, z, parent) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m; }
function buildViewmodel() {
  if (typeof window.rdBuildGunModel !== 'function') return buildViewmodelBasic();
  if (vm) camera.remove(vm.g);
  const M = window.rdMats(), m = window.rdBuildGunModel(R.weaponId, R.mods), a = m.anchors, g = new THREE.Group(); g.add(m.group);
  const pistol = /^pistol|revolver/.test(gun().model);
  const hand = (window.rdPostEnabled && window.rdHyperHand) ? ((x, y, z, ry, left) => { const h = window.rdHyperHand(!!left, pistol); h.position.set(x, y, z); h.rotation.y = ry || 0; g.add(h); return h; })        // Smooth: gloved hands with real fingers
    : (x, y, z, ry) => { const h = new THREE.Group(); const palm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.05, 0.095), M.glove); h.add(palm);
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.016, 0.06), M.glove); f.position.set(-0.026 + i * 0.0175, -0.03, -0.02); f.rotation.x = 0.7; h.add(f); }
    const th = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.018, 0.06), M.glove); th.position.set(0.045, 0.0, -0.03); th.rotation.y = 0.4; h.add(th);
    const cuff = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.07, 0.06), M.camo); cuff.position.set(0, 0.0, 0.08); h.add(cuff);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.085, 0.4), M.camo); arm.position.set(0.02, -0.03, 0.3); arm.rotation.x = 0.18; h.add(arm);
    h.position.set(x, y, z); h.rotation.y = ry || 0; g.add(h); return h; };
  const handR = hand(0.0, pistol ? -0.05 : -0.1, 0.012, 0);                                         // trigger hand on the grip
  const handL = hand(pistol ? -0.035 : -0.012, (a.gripY || -0.02) - 0.03, pistol ? -0.0 : (a.gripZ || -0.4), 0.15, true);      // support hand under the handguard (or cupping the pistol grip)
  const flash = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); if (window.rdPostEnabled) flash.material.color.setRGB(5.5, 4.2, 2.8);   // HDR flash so it blooms in hyper mode
  const mz = m.muzzleZ - (R.mods && R.mods.muzzle === 'mz_supp' ? 0.2 : 0); flash.position.set(0, 0.034, mz - 0.03); flash.rotation.y = 0; g.add(flash);
  const flash2 = flash.clone(); flash2.rotation.y = Math.PI / 2; flash.add(flash2);
  const light = new THREE.PointLight(0xffb060, 0, 14); light.position.set(0, 0.05, mz - 0.25); g.add(light);
  const len = Math.abs(m.muzzleZ) + 0.35, sc = Math.max(0.55, Math.min(0.95, 0.95 / len));
  const ax = 0.14 * Math.max(0.45, Math.min(1, camera.aspect / 1.6));             // on a tall phone screen keep the gun nearer the middle
  g.scale.setScalar(sc * Math.max(0.8, Math.min(1, camera.aspect / 1.2))); g.position.set(ax, -0.16, -0.38); camera.add(g);
  vm = { g, flash, light, muzzleZ: mz, base: g.position.clone(), model: gun().model, sightY: m.sightY, railZ: a.railZ || -0.1, scale: g.scale.x,
    handR, handL, rRest: handR.position.clone(), lRest: handL.position.clone(), anch: a, magGroup: m.group.userData.magGroup || null, gunGroup: m.group, pistol, lagX: 0, lagY: 0, py: pitch, yy: yaw };
}
function buildViewmodelBasic() {
  if (vm) { camera.remove(vm.g); }
  const g = new THREE.Group(), model = gun().model, metal = MAT.metal(), poly = MAT.poly(), steel = MAT.steel();
  let muzzleZ = -0.7;
  if (model === 'pistol') {
    box(0.07, 0.09, 0.34, steel, 0, 0.04, -0.22, g); box(0.065, 0.16, 0.085, poly, 0, -0.07, -0.08, g); box(0.02, 0.02, 0.05, metal, 0, 0.1, -0.06, g); muzzleZ = -0.42;
  } else if (model === 'smg') {
    box(0.075, 0.1, 0.5, metal, 0, 0.03, -0.3, g); box(0.07, 0.2, 0.08, poly, 0, -0.1, -0.12, g); box(0.05, 0.22, 0.07, metal, 0, -0.14, -0.34, g);
    box(0.05, 0.08, 0.2, poly, 0, 0.02, 0.05, g); box(0.025, 0.03, 0.14, steel, 0, 0.1, -0.4, g); muzzleZ = -0.58;
  } else if (model === 'shotgun') {
    box(0.08, 0.09, 0.7, metal, 0, 0.03, -0.36, g); box(0.055, 0.055, 0.7, steel, 0, 0.0, -0.4, g); box(0.07, 0.07, 0.24, MAT.wood(), 0, -0.02, -0.5, g);
    box(0.07, 0.13, 0.3, MAT.wood(), 0, -0.04, 0.02, g); muzzleZ = -0.78;
  } else if (model === 'sniper') {
    box(0.07, 0.09, 0.95, metal, 0, 0.03, -0.45, g); box(0.07, 0.13, 0.34, MAT.wood(), 0, -0.04, 0.12, g); box(0.045, 0.045, 0.3, steel, 0, 0.12, -0.3, g);
    const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.32, 10), metal); sc.rotation.x = Math.PI / 2; sc.position.set(0, 0.145, -0.28); g.add(sc);
    box(0.03, 0.03, 0.2, steel, 0, 0.03, -1.0, g); muzzleZ = -1.1;
  } else {
    box(0.075, 0.1, 0.75, metal, 0, 0.03, -0.42, g); box(0.07, 0.2, 0.08, poly, 0, -0.1, -0.1, g); box(0.055, 0.2, 0.08, metal, 0, -0.13, -0.35, g);
    box(0.06, 0.12, 0.34, poly, 0, 0.0, 0.1, g); box(0.07, 0.05, 0.3, poly, 0, 0.07, -0.55, g); box(0.025, 0.04, 0.2, steel, 0, 0.12, -0.3, g); muzzleZ = -0.85;
  }
  // hands + sleeves
  box(0.09, 0.09, 0.14, MAT.skin(), 0.02, -0.08, -0.06, g); box(0.1, 0.1, 0.3, MAT.sleeve(), 0.1, -0.15, 0.2, g);
  if (model !== 'pistol') { box(0.09, 0.09, 0.14, MAT.skin(), -0.03, -0.03, -0.42, g); box(0.1, 0.1, 0.34, MAT.sleeve(), -0.12, -0.1, -0.12, g); }
  // muzzle flash (sprite-like plane + light)
  const flash = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  flash.position.set(0, 0.03, muzzleZ); g.add(flash);
  const light = new THREE.PointLight(0xffb060, 0, 12); light.position.set(0, 0.05, muzzleZ - 0.2); g.add(light);
  g.traverse(o => { if (o.isMesh && o !== flash) o.frustumCulled = false; });
  g.scale.setScalar(0.78); g.position.set(0.15, -0.17, -0.36); camera.add(g);
  vm = { g, flash, light, muzzleZ, base: g.position.clone(), model, sightY: 0.12, railZ: -0.3, scale: 0.78 };
}

// ───────────────────────── containers, corpses, extraction zones ─────────────────────────
function freeSpot(minFromSpawn, tries) {
  for (let i = 0; i < (tries || 60); i++) {
    const x = rnd(-ARENA_HALF + 5, ARENA_HALF - 5), z = rnd(-ARENA_HALF + 5, ARENA_HALF - 5);
    if (!blockedAt(x, z) && !blockedAt(x + 1.2, z) && !blockedAt(x - 1.2, z) && !blockedAt(x, z + 1.2) && !blockedAt(x, z - 1.2) && Math.hypot(x - R.spawn.x, z - R.spawn.z) >= (minFromSpawn || 0)) return { x, z };
  }
  return { x: 0, z: 0 };
}
function rollLoot(table, rolls) {
  const out = {}; const n = rint(rolls[0], rolls[1]); const lootMul = R.diff ? R.diff.loot : 1;
  for (let i = 0; i < n; i++) { const e = (window.rdLootPick || wpick)(table); const base = rint(e[2], e[3]); const qty = (R_AMMO[e[0]] ? Math.max(1, Math.round(base * lootMul)) : base); out[e[0]] = (out[e[0]] || 0) + qty; }
  return out;
}
function spawnContainers() {
  const cc = (R.diff || R_DIFFS[1]).containers;
  const plan = [['crate', cc[0]], ['locker', cc[1]], ['safe', cc[2]], ['weaponbox', cc[3]]];
  plan.forEach(([type, count]) => {
    for (let i = 0; i < count; i++) {
      const def = R_CONTAINERS[type], p = freeSpot(14);
      const mat = new THREE.MeshStandardMaterial({ color: def.color, metalness: type === 'safe' ? 0.7 : 0.2, roughness: 0.6 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(def.size[0], def.size[1], def.size[2]), mat);
      m.position.set(p.x, def.size[1] / 2, p.z); m.rotation.y = rnd(0, Math.PI); m.castShadow = true; m.receiveShadow = true; scene.add(m);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(def.size[0] * 1.02, 0.06, def.size[2] * 1.02), new THREE.MeshStandardMaterial({ color: 0xffd24a, emissive: 0x553d00, roughness: 0.5 }));
      lid.position.set(0, def.size[1] / 2 + 0.03, 0); m.add(lid);
      R.containers.push({ type, name: def.name, x: p.x, z: p.z, items: rollLoot(def.table, def.rolls), mesh: m, lid, opened: false, time: type === 'safe' ? 2.2 : 1.4 });
    }
  });
}
function spawnExtracts() {
  const sides = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(s => Math.hypot(s[0] * 60 - R.spawn.x, s[1] * 60 - R.spawn.z) > 70);
  const picks = sides.sort(() => Math.random() - 0.5).slice(0, 2);
  picks.forEach((s, i) => {
    let x = s[0] * (ARENA_HALF - 8) + (s[0] ? 0 : rnd(-30, 30)), z = s[1] * (ARENA_HALF - 8) + (s[1] ? 0 : rnd(-30, 30));
    for (let k = 0; k < 30 && blockedAt(x, z); k++) { x += rnd(-3, 3); z += rnd(-3, 3); }
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.1, 32), new THREE.MeshBasicMaterial({ color: 0x22ff88, transparent: true, opacity: 0.35 }));
    ring.position.set(x, 0.06, z); scene.add(ring);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 40, 8), new THREE.MeshBasicMaterial({ color: 0x66ffaa, transparent: true, opacity: 0.35 }));
    beam.position.set(x, 20, z); scene.add(beam);
    R.extracts.push({ x, z, r: 4, ring, beam, name: i === 0 ? 'Extract A' : 'Extract B' });
  });
}

// ───────────────────────── enemies ─────────────────────────
function buildRaidEnemyMesh(type) {
  if (window.rdBuildEnemyMesh) return window.rdBuildEnemyMesh(type, R_ENEMY[type]);          // detailed soldiers from raid-guns.js
  return buildRaidEnemyMeshBasic(type);
}
function buildRaidEnemyMeshBasic(type) {
  const d = R_ENEMY[type], g = new THREE.Group();
  const clothes = new THREE.MeshStandardMaterial({ color: d.color, roughness: 0.9 }), vest = new THREE.MeshStandardMaterial({ color: d.vest, roughness: 0.8 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xb98a68, roughness: 0.85 }), dark = new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: 0.8, roughness: 0.4 });
  const part = (geo, mat, x, y, z, zone) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.userData.zone = zone; m.castShadow = true; g.add(m); return m; };
  part(new THREE.BoxGeometry(0.2, 0.85, 0.24), clothes, -0.14, 0.43, 0, 'legs'); part(new THREE.BoxGeometry(0.2, 0.85, 0.24), clothes, 0.14, 0.43, 0, 'legs');
  part(new THREE.BoxGeometry(0.5, 0.28, 0.28), clothes, 0, 0.98, 0, 'stomach');
  part(new THREE.BoxGeometry(0.56, 0.5, 0.32), type === 'scav' ? clothes : vest, 0, 1.38, 0, 'chest');
  part(new THREE.BoxGeometry(0.14, 0.55, 0.16), clothes, -0.36, 1.3, 0.05, 'arms'); part(new THREE.BoxGeometry(0.14, 0.55, 0.16), clothes, 0.36, 1.3, 0.1, 'arms');
  part(new THREE.SphereGeometry(0.18, 10, 10), skin, 0, 1.78, 0, 'head');
  if (d.acHead > 0 || type === 'scav') part(new THREE.CylinderGeometry(0.2, 0.21, 0.12, 10), type === 'scav' ? clothes : vest, 0, 1.9, 0, 'head');
  const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.7), dark); rifle.position.set(0.18, 1.3, 0.38); rifle.castShadow = true; rifle.userData.zone = 'arms'; g.add(rifle);
  g.userData.isEnemyRoot = true; g.userData.muzzle = new THREE.Vector3(0.18, 1.3, 0.78);
  return g;
}
function spawnRaidEnemies() {
  const df = R.diff || R_DIFFS[1];
  const n = rint(df.enemies[0], df.enemies[1]);
  const list = [];
  for (let i = 0; i < n; i++) { const r = Math.random(); list.push(r < df.mix[0] ? 'scav' : r < df.mix[0] + df.mix[1] ? 'raider' : 'pmc'); }
  for (let i = 0; i < list.length; i++) if ((list[i] === 'scav' || list[i] === 'raider') && Math.random() < 0.2) list[i] = 'knifer';            // some enemies rush you with knives
  if (Math.random() < df.boss) for (let b = 0; b < df.bosses; b++) list.push('boss');
  list.forEach(type => {
    const d = R_ENEMY[type], p = freeSpot(type === 'scav' ? 26 : 38);
    const mesh = buildRaidEnemyMesh(type); mesh.position.set(p.x, 0, p.z); mesh.rotation.y = rnd(0, 6.28); scene.add(mesh);
    const hp = Math.round(d.hp * df.hp);
    const e = { mesh, type, def: { emoji: d.emoji, name: d.name, tier: d.tier }, tier: d.tier, hp, maxHp: hp, ac: d.ac, acHead: d.acHead, vestDur: 1, alive: true,
      alertT: 0, lastKnown: { x: p.x, z: p.z }, fireCd: rnd(0.5, 1.5), burstLeft: 0, restT: rnd(0.5, 2), strafe: Math.random() < 0.5 ? 1 : -1, strafeT: rnd(1, 2.5),
      wp: { x: p.x, z: p.z }, wpWait: rnd(0, 3), home: { x: p.x, z: p.z }, side: Math.random() < 0.5 ? 1 : -1, stuck: 0 };
    mesh.userData.enemy = e; enemies.push(e);
  });
}
// the original calls spawnWave() at the end of buildMapScene(); during a raid we place raid enemies + containers instead
window.spawnWave = function () { if (R.building) { spawnRaidEnemies(); } };

function killEnemy(e, headshot) {
  if (R.battle && window.rdBattleKill) { window.rdBattleKill(e, headshot); return; }
  e.alive = false;
  e.mesh.rotation.order = 'YXZ'; e.mesh.rotation.x = -Math.PI / 2; e.mesh.position.y = 0.22;
  const drops = {}; (R_ENEMY_DROPS[e.type] || []).forEach(d => { if (Math.random() < d[1]) drops[d[0]] = (drops[d[0]] || 0) + rint(d[2], d[3]); });
  R.containers.push({ type: 'body', name: R_ENEMY[e.type].name + ' (dead)', x: e.mesh.position.x, z: e.mesh.position.z, items: drops, mesh: e.mesh, opened: false, time: 1.1 });
  R.kills++;
  const xp = xpForKill(e.tier, R.mapIndex); R.xpGain += xp; userState.xp += xp; userState.kills++;
  rdToast(`${e.def.emoji} ${e.def.name} killed${headshot ? ' — headshot' : ''} · +${xp} XP`);
  sfx.kill(); try { checkLevelUp(); } catch (x) {}
}
window.killEnemy = killEnemy;
window.applyDamageToEnemy = function (e, dmg) { e.hp -= dmg; if (e.hp <= 0 && e.alive) killEnemy(e, false); };

function enemyShoot(e, dist) {
  const d = R_ENEMY[e.type], a = R_AMMO[d.ammo];
  e.mesh.updateMatrixWorld(true); const m = e.mesh.userData.muzzle.clone(); e.mesh.localToWorld(m); if (window.rdNpcFlash) window.rdNpcFlash(e, m);
  const target = new THREE.Vector3(playerPos.x, EYE_HEIGHT - 0.25, playerPos.z);
  const moving = moveState.w || moveState.a || moveState.s || moveState.d;
  let p = d.acc * (R.diff ? R.diff.acc : 1) * clamp(1.15 - dist / (d.sight * 1.1), 0.12, 1) * (R.crouch ? 0.85 : 1) * (moving ? 0.8 : 1) * (R.ads > 0.5 ? 0.92 : 1);
  const hit = Math.random() < p && lineClear(m.x, m.z, playerPos.x, playerPos.z);
  const vol = clamp(1 - dist / 90, 0.12, 0.85);
  sfxShot(a.cal, vol * 0.55);
  if (hit) {
    addTracer(m, target, a.tracer, 0.06);
    const zone = wpick(R_HIT_WEIGHTS)[0]; hurtPlayer(a, zone, d.dmgMul, e.mesh.position);
  } else {
    const miss = target.clone().add(new THREE.Vector3(rnd(-1.4, 1.4), rnd(-0.8, 0.8), rnd(-1.4, 1.4)));
    addTracer(m, miss, a.tracer, 0.06); if (dist < 40) sfx.whiz(); R.shake = Math.max(R.shake, 0.25);
  }
}
function moveEnemy(e, tx, tz, speed, dt) {
  const m = e.mesh, dx = tx - m.position.x, dz = tz - m.position.z, d = Math.hypot(dx, dz) || 1e-4;
  let ang = Math.atan2(dx, dz) + (e.stuck > 0 ? e.side * 1.1 : 0);
  const nx = m.position.x + Math.sin(ang) * speed * dt, nz = m.position.z + Math.cos(ang) * speed * dt;
  let moved = false;
  if (!blockedAt(nx, m.position.z)) { m.position.x = nx; moved = true; }
  if (!blockedAt(m.position.x, nz)) { m.position.z = nz; moved = true; }
  if (!moved) { e.stuck = 0.7; if (Math.random() < 0.3) e.side *= -1; } else e.stuck = Math.max(0, e.stuck - dt);
  return d;
}
window.tickEnemyAI = function (dt) {
  if (!R.on || R.over) return;
  enemies.forEach(e => {
    if (!e.alive) return;
    const d = R_ENEMY[e.type], m = e.mesh;
    const dx = playerPos.x - m.position.x, dz = playerPos.z - m.position.z, dist = Math.hypot(dx, dz) || 1e-4;
    const fwd = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), m.rotation.y);
    const facing = (dx * fwd.x + dz * fwd.z) / dist;
    const sightMul = (R.crouch ? 0.8 : 1) * (R.ads > 0.5 ? 1 : 1);
    if (e.burnT > 0) { e.burnT -= dt; e.hp -= 7 * dt; if (e.hp <= 0) { killEnemy(e, false); return; } }          // incendiary rounds / molotovs keep burning
    if (e.blind > 0) { e.blind -= dt; e.alertT = Math.max(e.alertT, 2); moveEnemy(e, m.position.x + Math.sin(e.mesh.rotation.y + e.blind) * 4, m.position.z + Math.cos(e.mesh.rotation.y + e.blind) * 4, 1.2, dt); return; }   // flash-banged: stumbles around, cannot shoot
    const sees = dist < d.sight * sightMul && (facing > -0.2 || dist < 10 || e.alertT > 0) && lineClear(m.position.x, m.position.z, playerPos.x, playerPos.z);
    if (sees) { e.alertT = 9; e.lastKnown.x = playerPos.x; e.lastKnown.z = playerPos.z; }
    else e.alertT = Math.max(0, e.alertT - dt);
    if (e.alertT > 0) {
      const lk = e.lastKnown; const ddx = lk.x - m.position.x, ddz = lk.z - m.position.z;
      { const want = Math.atan2(sees ? dx : ddx, sees ? dz : ddz); let da = want - m.rotation.y; while (da > Math.PI) da -= 6.2832; while (da < -Math.PI) da += 6.2832; m.rotation.y += clamp(da, -9 * dt, 9 * dt); }
      const dd = sees ? dist : Math.hypot(ddx, ddz);
      if (d.melee) {                                                           // knife fighter: sprints straight at you and stabs when close
        e.fireCd -= dt; e.lunge = Math.max(0, (e.lunge || 0) - dt * 4);
        if (dd > 1.5) moveEnemy(e, lk.x, lk.z, d.speed * (sees && dd < 16 ? 1.3 : 1), dt);
        else if (sees && e.fireCd <= 0) {
          e.fireCd = d.gap * rnd(0.85, 1.2); e.lunge = 1; if (window.rdStab) window.rdStab(e);
          if (!R.dead) { hurtPlayer({ dmg: d.dmg, pen: 1.5 }, ['chest', 'stomach', 'arms', 'legs', 'chest'][rint(0, 4)], 1, e.mesh.position); if (R.bleed < 1 && Math.random() < 0.45) { R.bleed = 1; } R.shake = Math.min(1.4, R.shake + 0.5); }
        }
        return;
      }
      if (!sees || dd > d.pref[1]) moveEnemy(e, lk.x, lk.z, d.speed, dt);
      else if (dd < d.pref[0]) moveEnemy(e, m.position.x - ddx, m.position.z - ddz, d.speed * 0.8, dt);
      else {
        e.strafeT -= dt; if (e.strafeT <= 0) { e.strafe *= -1; e.strafeT = rnd(1, 2.6); }
        const px = -dz / dist, pz = dx / dist; moveEnemy(e, m.position.x + px * e.strafe * 5, m.position.z + pz * e.strafe * 5, d.speed * 0.6, dt);
      }
      if (sees && dist < d.sight) {
        if (e.restT > 0) e.restT -= dt;
        else { if (e.burstLeft <= 0) { e.burstLeft = rint(d.burst[0], d.burst[1]); e.fireCd = rnd(0.25, 0.5); }
          e.fireCd -= dt; if (e.fireCd <= 0 && e.burstLeft > 0) { enemyShoot(e, dist); e.burstLeft--; e.fireCd = d.gap; if (e.burstLeft <= 0) e.restT = rnd(d.rest[0], d.rest[1]); } }
      }
    } else {                                       // patrol around its home point
      e.wpWait -= dt;
      if (e.wpWait <= 0) {
        const dd = moveEnemy(e, e.wp.x, e.wp.z, 1.3, dt); m.rotation.y = Math.atan2(e.wp.x - m.position.x, e.wp.z - m.position.z);
        if (dd < 0.8) { e.wpWait = rnd(2, 6); e.wp = { x: e.home.x + rnd(-12, 12), z: e.home.z + rnd(-12, 12) }; if (blockedAt(e.wp.x, e.wp.z)) e.wp = { x: e.home.x, z: e.home.z }; }
      }
    }
  });
};

// ───────────────────────── player damage, armor, bleeding, healing ─────────────────────────
function armorFor(zone) { return zone === 'head' ? R.helmet : (zone === 'chest' || zone === 'stomach') ? R.vest : null; }
function hurtPlayer(a, zone, mul, fromPos) {
  if (!R.on || R.over || R.dead) return;                          // a dead player cannot be hurt again (this used to freeze the respawn timer)
  let dmg = a.dmg * (mul || 1) * (R.buff.resist > 0 ? 0.8 : 1);
  const item = armorFor(zone); let pen = true;
  if (item && item.dur > 0) {
    const A = R_ARMOR[item.id], wear = 1 - item.dur / A.dur;
    const chance = clamp(0.55 + (a.pen - A.ac) * 0.18 + wear * 0.25, 0.04, 0.97);
    pen = Math.random() < chance;
    item.dur = Math.max(0, item.dur - dmg * (pen ? 0.3 : 0.55));
    dmg *= pen ? 0.8 : 0.25;
    sfx.armor(); rdToast(pen ? `⚠️ ${zone === 'head' ? 'Helmet' : 'Armor'} penetrated` : `🛡️ ${zone === 'head' ? 'Helmet' : 'Armor'} stopped it`, 900);
  } else sfx.flesh();
  if (zone === 'head') dmg *= 1.6;
  R.z[zone] -= dmg;
  if (R.z[zone] < 0) { const over = -R.z[zone]; R.z[zone] = 0; if (zone !== 'head' && zone !== 'chest') R.z.chest -= over * 0.4; }
  if (pen && dmg > 6 && Math.random() < (zone === 'legs' || zone === 'stomach' ? 0.34 : 0.22)) { const lvl = dmg > 28 ? 2 : 1; if (lvl > R.bleed) { R.bleed = lvl; rdToast(lvl === 2 ? '🩸 HEAVY BLEEDING — use a medkit!' : '🩸 Bleeding — use a bandage', 1800); } }
  R.shake = Math.min(1.2, R.shake + dmg / 40); R.lastHurt = performance.now();
  const hf = document.getElementById('hitFlash'); if (hf) { hf.style.background = `rgba(160,0,0,${clamp(dmg / 50, 0.15, 0.55)})`; setTimeout(() => hf.style.background = 'rgba(255,0,0,0)', 160); }
  syncHp();
  if (R.z.head <= 0 || R.z.chest <= 0) rdEnd('died');
}
function syncHp() { playerHp = totalHp(); playerMaxHp = MAX_TOTAL; }
// medicine: every item in R_MED declares its effects (bleed stop level, heal, a limb to fix, pain, speed/regen/resist/steady buffs, stamina)
function healPool(pool) { Object.keys(R.z).sort((a, b) => (R_ZONES[b] - R.z[b]) / R_ZONES[b] - (R_ZONES[a] - R.z[a]) / R_ZONES[a]).forEach(k => { const add = Math.min(pool, R_ZONES[k] - R.z[k]); if (add > 0) { R.z[k] += add; pool -= add; } }); }
function medNeeded(m) {
  const hurt = totalHp() < MAX_TOTAL - 1;
  if (m.bleed && R.bleed > 0) return true; if ((m.heal || m.regen) && hurt) return true;
  if (m.zone && R.z[m.zone] < m.zoneMin) return true; if (m.fixLimbs && (R.z.legs < 40 || R.z.arms < 40)) return true;
  if (m.pain && R.pain < m.pain * 0.5) return true; if (m.speed || m.resist || m.steady || m.stam) return true; if (m.unflash && R.flashT > 0) return true;
  return false;
}
function startUse(id) {
  if (!R.on || R.over || R.use || packCount(id) <= 0 || R.reload > 0) return;
  const m = R_MED[id]; if (!m) return;
  if (!medNeeded(m)) { rdToast(m.bleed && !m.heal ? 'Not bleeding' : 'You do not need that right now', 1000); return; }
  R.use = { id, t: m.use, total: m.use }; audioOn(); sfx.click(); rdToast(`${m.emoji} Using ${m.name}…`, 900);
}
function finishUse() {
  const u = R.use; R.use = null; if (!u || packCount(u.id) <= 0) return; const m = R_MED[u.id];
  R.pack[u.id]--; if (R.pack[u.id] <= 0) delete R.pack[u.id];
  if (m.bleed) R.bleed = m.bleed >= R.bleed ? 0 : R.bleed - m.bleed;
  if (m.heal) healPool(m.heal);
  if (m.zone) R.z[m.zone] = Math.max(R.z[m.zone], m.zoneMin);
  if (m.fixLimbs) { R.z.legs = Math.max(R.z.legs, 40); R.z.arms = Math.max(R.z.arms, 40); }
  if (m.pain) R.pain = Math.max(R.pain, m.pain);
  if (m.stam) R.stamina = 100;
  if (m.unflash) R.flashT = 0;
  const B = R.buff; if (m.speed) B.speed = Math.max(B.speed, m.speed); if (m.regen) { B.regen = m.regen[0]; B.regenT = Math.max(B.regenT, m.regen[1]); } if (m.resist) B.resist = Math.max(B.resist, m.resist); if (m.steady) B.steady = Math.max(B.steady, m.steady);
  sfx.heal(); syncHp(); if (m.speed || m.regen || m.resist || m.steady) rdToast(`${m.emoji} ${m.name} active`, 1500);
}
// quick-use keys: 1 = stop bleeding (smallest fix that works), 2 = heal, 3 = pain / stims
const QUICK = {
  bleed: ['gauze', 'bandage', 'bandage_pro', 'tourniquet', 'hemostat', 'ifak', 'medkit', 'trauma', 'surgical'],
  heal: ['honey', 'antibiotic', 'burn_gel', 'salve', 'field_ration', 'ifak', 'medkit', 'trauma', 'surgical'],
  pain: ['painkiller', 'painkiller_x', 'morphine', 'adrenaline', 'stim_speed', 'stim_regen', 'stim_resist', 'stim_steady', 'stim_combat']
};
function quickUse(group) {
  const list = QUICK[group].filter(id => packCount(id) > 0); if (!list.length) { rdToast('Nothing like that in your pack', 900); return; }
  if (group === 'bleed') { const need = R.bleed; const fit = list.find(id => (R_MED[id].bleed || 0) >= need && R_MED[id].bleed); startUse(fit || list[list.length - 1]); }
  else if (group === 'heal') { const missing = MAX_TOTAL - totalHp(); const fit = list.find(id => (R_MED[id].heal || 0) >= Math.min(missing, 45)); startUse(fit || list[list.length - 1]); }
  else startUse(list[0]);
}
window.handlePlayerDeath = function () { rdEnd('died'); };
window.applyDamageToPlayer = function (d) { hurtPlayer({ dmg: d, pen: 3 }, 'chest', 1); };

// ───────────────────────── player weapon ─────────────────────────
function magCapacity() { return gun().mag; }
function ammoReserve() { return packCount(R.ammoType); }
function startReload() {
  if (!R.on || R.over || R.reload > 0 || R.use) return;
  const g = gun(), cap = magCapacity();
  if (R.mag >= cap + (g.perShell ? 0 : 1)) return;
  if (ammoReserve() <= 0) { rdToast('No ammo for this type — press T to swap', 1200); return; }
  audioOn();
  R.reloadTotal = g.perShell ? g.reload : (R.mag > 0 ? g.tac : g.reload); R.reload = R.reloadTotal; R.reloadFull = R.mag === 0 ? 1 : 0; R.ads = Math.max(0, R.ads - 0.4);
  if (window.rdHyperReload && !g.perShell) window.rdHyperReload(); sfx.reloadOut(); if (!g.perShell) setTimeout(() => sfx.reloadIn(), R.reloadTotal * 600);
}
function finishReload() {
  const g = gun(); R.reload = 0;
  if (g.perShell) {                              // one shell at a time; keep going until full or interrupted
    if (ammoReserve() > 0 && R.mag < g.mag) { R.mag++; R.pack[R.ammoType]--; sfx.reloadIn(); if (R.pack[R.ammoType] <= 0) delete R.pack[R.ammoType]; if (R.mag < g.mag && ammoReserve() > 0) { R.reload = R.reloadTotal; } }
    return;
  }
  const cap = g.mag + (R.mag > 0 ? 1 : 0), need = cap - R.mag, take = Math.min(need, ammoReserve());
  R.mag += take; R.pack[R.ammoType] = ammoReserve() - take; if (R.pack[R.ammoType] <= 0) delete R.pack[R.ammoType];
  sfx.reloadIn();
}
function cycleAmmo() {
  const g = gun(); const opts = Object.keys(R_AMMO).filter(id => R_AMMO[id].cal === g.cal && packCount(id) > 0);
  if (opts.length < 2) { rdToast('No other ammo type in your pack', 900); return; }
  const i = opts.indexOf(R.ammoType); const next = opts[(i + 1) % opts.length];
  if (R.mag > 0 && !g.perShell) { R.pack[R.ammoType] = ammoReserve() + R.mag; R.mag = 0; }      // unload what's in the gun
  R.ammoType = next; rdToast(`Ammo: ${R_AMMO[next].name} (pen ${R_AMMO[next].pen})`, 1200); sfx.click(); startReload();
}
function toggleMode() { const g = gun(); if (g.mode === 'auto') { R.mode = R.mode === 'auto' ? 'semi' : 'auto'; rdToast('Fire mode: ' + R.mode.toUpperCase(), 900); sfx.click(); } }
function spreadNow() {
  const w = wcat(), moving = moveState.w || moveState.a || moveState.s || moveState.d;
  let s = w.spread * (gun().spreadMul || 1); if (moving) s *= moveState.run ? 2.4 : 1.5; if (R.crouch) s *= 0.7; s *= 1 - R.ads * 0.65;
  if (R.z.arms < R_ZONES.arms * 0.3 && R.pain <= 0) s *= 1.7;
  const am = R_AMMO[R.ammoType]; if (am && am.acc) s *= am.acc;                       // match ammo groups tighter
  return s + R.bloom;
}
window.tryFire = function (nowSec) {
  if (!R.on || R.over) return;
  if (R.battle) { if (R.dead) return; if (R.veh && window.rdBattleVehFire) { window.rdBattleVehFire(nowSec); return; } }
  const g = gun(), w = wcat();
  if (R.reload > 0 && !(g.perShell && R.mag > 0)) return;
  if (R.use) return;
  if (g.perShell && R.reload > 0) { R.reload = 0; }                                  // fire interrupts shell loading
  if (R.hold) return;
  const interval = 1 / ((g.mode === 'bolt' ? 0.9 : g.mode === 'pump' ? 1.5 : w.fireRate) * (g.rateMul || 1));
  if (nowSec - lastShotTime < interval) return;
  const automatic = g.auto && R.mode === 'auto';
  if (!automatic && !R.semiReady) return;
  if (R.mag <= 0) { if (R.semiReady || automatic) { sfx.click(); R.semiReady = false; if (ammoReserve() > 0) startReload(); else rdToast('Out of ammo', 900); } return; }
  R.semiReady = false; lastShotTime = nowSec; R.mag--;
  audioOn(); fireBullets();
  if (R.mag <= 0 && ammoReserve() <= 0) rdToast('Magazine empty', 900);
};
function fireBullets() {
  const g = gun(), a = ammo(), w = wcat();
  camera.updateMatrixWorld();
  const origin = new THREE.Vector3(); camera.getWorldPosition(origin);
  const baseDir = new THREE.Vector3(); camera.getWorldDirection(baseDir);
  const pellets = a.pellets || 1, spr = spreadNow();
  const muzzle = new THREE.Vector3(0.17, -0.12, -0.9 + (vm ? vm.muzzleZ + 0.4 : 0)); camera.localToWorld(muzzle);
  let anyHit = false, anyKill = false, anyHead = false;
  const aliveMeshes = enemies.filter(e => e.alive).map(e => e.mesh);
  for (let p = 0; p < pellets; p++) {
    const dir = baseDir.clone(); const sp = spr * (a.pellets ? 4.2 : 1);
    dir.x += (Math.random() - 0.5) * sp * 2; dir.y += (Math.random() - 0.5) * sp * 2; dir.z += (Math.random() - 0.5) * sp * 2; dir.normalize();
    raycaster.set(origin, dir); raycaster.far = Math.max(w.range * 2, 80);
    const hits = raycaster.intersectObjects(aliveMeshes, true);
    const wall = rayBuildings(origin.x, origin.z, dir.x, dir.z, raycaster.far) / Math.max(0.0001, Math.hypot(dir.x, dir.z));
    if (window.rdSafeShot) window.rdSafeShot(origin, dir, Math.min(wall, w.range * 2), hits.length ? hits[0].distance : 1e9, a.dmg * (g.dmgMul || 1), a);
    let end = origin.clone().addScaledVector(dir, Math.min(wall, w.range * 2, 120));
    const vh = (R.battle && window.rdBattleRay) ? window.rdBattleRay(origin, dir, Math.min(wall, w.range * 2)) : null;
    if (vh && (!hits.length || vh.dist < hits[0].distance)) { end = origin.clone().addScaledVector(dir, vh.dist); window.rdBattleVehHit(vh.v, a, vh.dist); anyHit = true; }
    else if (hits.length && hits[0].distance < wall) {
      const h = hits[0], e = findRootEnemy(h.object);
      if (e && e.alive) {
        const zone = h.object.userData.zone || 'chest', dist = h.distance;
        const RG = w.range * (g.rangeMul || 1);
        let dmg = a.dmg * (g.dmgMul || 1) * R_ZONE_MUL[zone] * (dist > RG ? clamp(1 - (dist - RG) / (RG * 1.8), 0.45, 1) : 1);
        if (a.fire) e.burnT = 3;
        const A = zone === 'head' ? e.acHead : (zone === 'chest' || zone === 'stomach') ? e.ac : 0;
        if (A > 0) { const chance = clamp(0.55 + (a.pen - A) * 0.18, 0.04, 0.97); dmg *= Math.random() < chance ? 0.85 : 0.25; }
        e.hitZone = zone; e.hitSeq = (e.hitSeq || 0) + 1; e.hp -= dmg; e.alertT = 10; e.lastKnown.x = playerPos.x; e.lastKnown.z = playerPos.z; end = h.point.clone();
        burst(h.point, 0x8a0f0f, 5, 3, 0.05, fx.blood, 9);
        anyHit = true; if (zone === 'head') anyHead = true;
        if (e.hp <= 0 && e.alive) { killEnemy(e, zone === 'head'); anyKill = true; }
      }
    } else if (wall < w.range * 2) { burst(end, 0xffc070, 4, 4, 0.04, fx.sparks, 12); sfx.impact(); if (window.rdHyperImpact) window.rdHyperImpact(end, dir); }
    addTracer(muzzle, end, a.tracer, 0.05);
  }
  // recoil, camera kick, flash, gunshot sound, alert enemies that can hear it
  const kv = g.kickV * (R.buff.steady > 0 ? 0.75 : 1) * (1 - R.ads * 0.28) * (R.crouch ? 0.85 : 1), kh = g.kickH * rnd(-1, 1) * (1 - R.ads * 0.2);
  R.recoilP += kv * Math.PI / 180; R.recoilY += kh * Math.PI / 180; R.bloom = Math.min(0.04, R.bloom + 0.0035); R.kick = Math.min(1, R.kick + 0.6);
  const sup = !!g.suppressed || !!a.sub;
  if (vm) { vm.flash.material.opacity = sup ? 0.2 : 1; vm.flash.rotation.z = Math.random() * 6.28; vm.light.intensity = sup ? 0.4 : 2.2; R.flash = 0.05; }
  sfxShot(g.cal, sup ? 0.3 : 1);
  const hearR = sup ? 14 : 60;                     // a suppressed gun is only heard up close
  enemies.forEach(e => { if (e.alive && e.alertT <= 0 && Math.hypot(e.mesh.position.x - playerPos.x, e.mesh.position.z - playerPos.z) < hearR) { e.alertT = 9; e.lastKnown.x = playerPos.x; e.lastKnown.z = playerPos.z; } });
  if (anyHit) showHitMarker(anyKill ? 'kill' : anyHead ? 'head' : 'hit');
  if (window.rdHyperShot) window.rdHyperShot(muzzle, camera);
  if (g.mode === 'bolt' || g.mode === 'pump') setTimeout(() => sfx.rack(), 280);
}
function showHitMarker(kind) {
  const el = document.getElementById('rdHitmark'); if (!el) return;
  el.style.opacity = 1; el.style.color = kind === 'kill' ? '#ff3a3a' : kind === 'head' ? '#ffd24a' : '#fff';
  el.style.transform = 'translate(-50%,-50%) scale(' + (kind === 'kill' ? 1.4 : 1) + ')'; clearTimeout(showHitMarker.t); showHitMarker.t = setTimeout(() => el.style.opacity = 0, 130);
  kind === 'head' ? sfx.headHit() : sfx.hit();
}

// ───────────────────────── interaction: search containers, extract ─────────────────────────
function nearestContainer() {
  let best = null, bd = 2.8; const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
  R.containers.forEach(c => { if (c.opened) return; const dx = c.x - playerPos.x, dz = c.z - playerPos.z, d = Math.hypot(dx, dz); if (d < bd && (dx * fx + dz * fz) / (d || 1) > 0.25) { bd = d; best = c; } });
  return best;
}
function nearbyExtract() { return R.extracts.find(x => Math.hypot(x.x - playerPos.x, x.z - playerPos.z) < x.r) || null; }
function takeItems(c) {
  const taken = [], left = {};
  Object.keys(c.items).forEach(id => {
    let n = c.items[id];
    while (n > 0) {                                                            // take as many as fit
      const room = rPackCap(R.bag) - rSlotsUsed(R.pack);
      if (R_AMMO[id]) { const stackFree = (Math.ceil(packCount(id) / 60) * 60) - packCount(id); const need = stackFree > 0 ? Math.min(n, stackFree) : (room >= 1 ? Math.min(n, 60) : 0); if (need <= 0) break; R.pack[id] = packCount(id) + need; n -= need; taken.push([id, need]); }
      else { if (room < rSlotsFor(id, 1)) break; R.pack[id] = packCount(id) + 1; n--; taken.push([id, 1]); }
    }
    if (n > 0) left[id] = n;
  });
  c.items = left; if (!Object.keys(left).length) { c.opened = true; if (c.lid) c.lid.material.color.set(0x333333); if (c.lid) c.lid.material.emissive.set(0x000000); }
  const txt = taken.length ? taken.map(t => rItem(t[0]).emoji + ' ' + rItem(t[0]).name + (t[1] > 1 ? ' ×' + t[1] : '')).join(', ') : 'Nothing';
  rdToast((c.opened ? '' : '🎒 Pack full — some left. ') + 'Looted: ' + txt, 2600); sfx.loot();
  taken.forEach(t => { R.foundValue += rItem(t[0]).value * (R_AMMO[t[0]] ? t[1] : 1); });
  if (typeof window.rdRefreshInventory === 'function') window.rdRefreshInventory();
}

// ───────────────────────── movement + camera ─────────────────────────
window.updatePlayerMovement = function (dt) {
  if (R.battle) { if (R.veh && window.rdBattleDrive) { window.rdBattleDrive(dt); return; } if (R.dead) { moveState.w = moveState.a = moveState.s = moveState.d = false; } }
  const g = gun(); let speed = 4.0;
  const moving = moveState.w || moveState.a || moveState.s || moveState.d;
  const limp = R.z.legs <= 0 && R.pain <= 0;
  const sprint = moveState.run && R.stamina > 4 && moving && !R.ads && !R.crouch && !R.hold && !limp && moveState.w;
  if (sprint) { speed = 6.8; R.stamina = Math.max(0, R.stamina - 14 * dt); R.reload = R.reload > 0 ? R.reload + dt * 0.4 : 0; }
  else R.stamina = Math.min(100, R.stamina + (moving ? 8 : 18) * dt);
  speed *= ((R.vest && R_ARMOR[R.vest.id] && R_ARMOR[R.vest.id].speed) || 1) * ((R.bag && R_ARMOR[R.bag.id] && R_ARMOR[R.bag.id].speed) || 1) * (R.buff.speed > 0 ? 1.2 : 1);   // heavy armor and big packs slow you; speed stims speed you up
  if (R.crouch) speed *= 0.5; if (R.ads > 0.5) speed *= 0.6; if (limp) speed *= 0.55; if (R.hold) speed *= 0.5; if (R.use) speed *= 0.6;
  if (R.stamina <= 0.5) moveState.run = false;
  let mx = 0, mz = 0; if (moveState.w) mz -= 1; if (moveState.s) mz += 1; if (moveState.a) mx -= 1; if (moveState.d) mx += 1;
  if (mx || mz) {
    const len = Math.hypot(mx, mz); mx /= len; mz /= len; const sy = Math.sin(yaw), cy = Math.cos(yaw);
    // W goes where you LOOK: forward = (-sin yaw, -cos yaw) (the camera's direction), right = (cos yaw, -sin yaw). (The original game's formula mirrored the sideways part.)
    const nx = playerPos.x + (mx * cy + mz * sy) * speed * dt, nz = playerPos.z + (-mx * sy + mz * cy) * speed * dt;
    if (!blockedAt(nx, playerPos.z)) playerPos.x = nx; if (!blockedAt(playerPos.x, nz)) playerPos.z = nz;
    R.stepAcc += speed * dt; if (R.stepAcc > (sprint ? 1.9 : 1.5)) { R.stepAcc = 0; audioOn(); sfx.step(sprint); }
  }
  R.sprinting = sprint;
  // crouch eases the eye height
  R.crouchT += ((R.crouch ? 1 : 0) - R.crouchT) * Math.min(1, dt * 10);
  const eye = EYE_HEIGHT - R.crouchT * 0.6;
  const bob = moving ? Math.sin(performance.now() / (sprint ? 90 : 135)) * (sprint ? 0.045 : 0.022) : Math.sin(performance.now() / 900) * 0.004;
  camera.position.set(playerPos.x, eye + bob, playerPos.z);
  camera.rotation.order = 'YXZ';
  const sway = Math.sin(performance.now() / 700) * 0.0009 * (1 + (R.z.arms < 20 && R.pain <= 0 ? 4 : 0)) * (1 - R.ads * 0.6);
  const shk = R.shake * 0.012;
  camera.rotation.y = yaw + R.recoilY + sway + (Math.random() - 0.5) * shk;
  camera.rotation.x = pitch + R.recoilP + sway * 0.7 + (Math.random() - 0.5) * shk;
  camera.rotation.z = (moveState.d ? -0.012 : moveState.a ? 0.012 : 0) * (1 - R.ads);
  // ADS zoom
  const baseFov = (window.RDSET && window.RDSET.fov) || 78, targetFov = baseFov - R.ads * (baseFov - baseFov / (g.zoom * window.rdZoomMul(g))); if (Math.abs(camera.fov - targetFov) > 0.05) { camera.fov = targetFov; camera.updateProjectionMatrix(); }
  // gun model: sway, recoil kick, ADS centre, reload dip, sprint tilt
  if (vm) {
    const adsPos = new THREE.Vector3(0, -vm.sightY * vm.scale, -(window.rdScoped(g) ? 0.22 : 0.3) - vm.railZ * vm.scale);      // puts the gun's sight on the screen centre
    const rl = R.reload > 0 ? Math.sin((1 - R.reload / R.reloadTotal) * Math.PI) : 0;
    const tx = vm.base.x + (adsPos.x - vm.base.x) * R.ads + (sprint ? 0.05 : 0), ty = vm.base.y + (adsPos.y - vm.base.y) * R.ads - rl * 0.18 + (moving ? Math.sin(performance.now() / 130) * 0.004 * (1 - R.ads) : 0);
    const tz = vm.base.z + (adsPos.z - vm.base.z) * R.ads + R.kick * 0.07;
    vm.g.position.x += (tx - vm.g.position.x) * Math.min(1, dt * 18); vm.g.position.y += (ty - vm.g.position.y) * Math.min(1, dt * 18); vm.g.position.z += (tz - vm.g.position.z) * Math.min(1, dt * 22);
    vm.g.rotation.x = R.kick * 0.09 + rl * 0.5 + (sprint ? 0.35 : 0); vm.g.rotation.y = sprint ? -0.5 : 0; vm.g.rotation.z = rl * 0.3;
    if (window.rdPostEnabled && window.rdHyperVm && vm.handL) window.rdHyperVm(vm, dt, R, yaw, pitch, moving, sprint);       // Smooth: weapon sway, breathing, hand animations, reload
    vm.g.visible = !(window.rdScoped(g) && R.ads > 0.85); if (window.rdScopeFrame) window.rdScopeFrame(dt, g, R);
    if (R.flash > 0) { R.flash -= dt; if (R.flash <= 0) { vm.flash.material.opacity = 0; vm.light.intensity = 0; } }
  }
};

// ───────────────────────── throwables (G throws, 4 changes type) ─────────────────────────
//  frag: explodes after its fuse · impact: explodes on first contact · smoke: blocks sight for ~20 s · flash: blinds enemies (and you, if you look at it)
//  fire (molotov / thermite): burns whoever stands in the flames. Grenades live in the backpack as items "gren:<type>".
let smokeTex = null;
function getSmokeTex() { if (smokeTex) return smokeTex; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.6, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return (smokeTex = new THREE.CanvasTexture(c)); }
function cycleNade() {
  const list = Object.keys(R.pack).filter(id => id.startsWith('gren:') && R.pack[id] > 0);
  if (!list.length) { R.nade = null; rdToast('No throwables in your pack', 900); return; }
  const i = list.indexOf(R.nade); R.nade = list[(i + 1) % list.length]; const n = R_NADE[R.nade.slice(5)]; rdToast(`${n.emoji} ${n.name} ×${R.pack[R.nade]}`, 1200); sfx.click();
}
function throwNade() {
  if (!R.on || R.over || R.use) return;
  if (!R.nade || packCount(R.nade) <= 0) { cycleNade(); if (!R.nade || packCount(R.nade) <= 0) return; }
  const def = R_NADE[R.nade.slice(5)]; R.pack[R.nade]--; if (R.pack[R.nade] <= 0) delete R.pack[R.nade];
  const col = def.kind === 'smoke' ? 0x8a8e92 : def.kind === 'fire' ? 0x9a5a2a : def.kind === 'flash' ? 0xcccc66 : 0x3a4a30;
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, metalness: 0.5 })); m.castShadow = true;
  camera.updateMatrixWorld(); const dir = new THREE.Vector3(); camera.getWorldDirection(dir); const pos = camera.position.clone().addScaledVector(dir, 0.6); pos.y -= 0.15; m.position.copy(pos); scene.add(m);
  R.nades.push({ def, m, v: dir.clone().multiplyScalar(15).add(new THREE.Vector3(0, 3.2, 0)), t: def.fuse, age: 0 }); audioOn(); sfx.click(); noise(0.12, 2000, 600, 0.2, 'bandpass');
  if (!R.pack[R.nade]) R.nade = Object.keys(R.pack).find(id => id.startsWith('gren:')) || null;
}
function blast(p, d) {
  if (window.rdSafeBlast) window.rdSafeBlast(p, d);
  if (R.battle && window.rdBattleBlastVeh) window.rdBattleBlastVeh(p, d);
  noise(0.6, 3000, 120, 1.2, 'lowpass'); tone(70, 0.5, 0.9, 'sine', 0, 30); if (window.rdExplosion) window.rdExplosion(p, d); else { burst(p, 0xffaa44, 26, 9, 0.12, fx.sparks, 6); burst(p, 0x444444, 14, 5, 0.25, fx.blood, 1.5); }
  if (window.rdLightPool) window.rdLightPool.take(0xffa050, 4, 24, p.clone().add(new THREE.Vector3(0, 1, 0)), 120); else { const light = new THREE.PointLight(0xffa050, 4, 24); light.position.copy(p).add(new THREE.Vector3(0, 1, 0)); scene.add(light); setTimeout(() => scene.remove(light), 120); }
  enemies.forEach(e => { if (!e.alive) return; const dist = Math.hypot(e.mesh.position.x - p.x, e.mesh.position.z - p.z); if (dist < d.radius) { const f = 1 - dist / d.radius; e.hp -= d.dmg * f * f * 1.4 + d.dmg * 0.15 * f; if (e.hp <= 0) { e.blastP = { x: p.x, z: p.z, f }; killEnemy(e, false); } } });
  const pd = Math.hypot(playerPos.x - p.x, playerPos.z - p.z);
  if (pd < d.radius) { const f = 1 - pd / d.radius; ['chest', 'legs', 'arms', 'stomach'].forEach(z => hurtPlayer({ dmg: d.dmg * f * 0.35, pen: 6 }, z, 1)); R.shake = Math.min(1.5, R.shake + 1); }
  enemies.forEach(e => { if (e.alive && Math.hypot(e.mesh.position.x - p.x, e.mesh.position.z - p.z) < 60) { e.alertT = Math.max(e.alertT, 9); e.lastKnown.x = p.x; e.lastKnown.z = p.z; } });
}
function flashBang(p, d) {
  noise(0.3, 6000, 800, 0.8, 'highpass'); tone(3000, 0.6, 0.25, 'sine', 0, 2000);
  enemies.forEach(e => { if (!e.alive) return; const dist = Math.hypot(e.mesh.position.x - p.x, e.mesh.position.z - p.z); if (dist < d.radius && lineClear(p.x, p.z, e.mesh.position.x, e.mesh.position.z)) e.blind = d.time * (1 - dist / d.radius * 0.5); });
  const pd = Math.hypot(playerPos.x - p.x, playerPos.z - p.z), fx0 = -Math.sin(yaw), fz0 = -Math.cos(yaw), dot = ((p.x - playerPos.x) * fx0 + (p.z - playerPos.z) * fz0) / (pd || 1);
  if (pd < d.radius && lineClear(p.x, p.z, playerPos.x, playerPos.z)) R.flashT = d.time * (1 - pd / d.radius * 0.5) * (dot > 0 ? 1 : 0.35);
}
function explodeNade(n) {
  const p = n.m.position.clone(), d = n.def; scene.remove(n.m);
  if (d.kind === 'frag' || d.kind === 'impact') blast(p, d);
  else if (d.kind === 'flash') flashBang(p, d);
  else if (d.kind === 'smoke') {
    const sprites = []; for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: getSmokeTex(), color: d.col, transparent: true, opacity: 0.8, depthWrite: false })); s.position.set(p.x + rnd(-d.radius * 0.6, d.radius * 0.6), rnd(0.6, 3.6), p.z + rnd(-d.radius * 0.6, d.radius * 0.6)); const sc = rnd(d.radius * 0.7, d.radius * 1.2); s.scale.set(sc, sc, 1); scene.add(s); sprites.push(s); }
    R.smokes.push({ x: p.x, z: p.z, r: d.radius * 0.85, t: d.time, total: d.time, sprites }); noise(0.4, 1600, 300, 0.35, 'lowpass');
  } else if (d.kind === 'fire') { R.fires.push({ x: p.x, z: p.z, r: d.radius, t: d.time, dmg: d.dmg, acc: 0 }); noise(0.3, 1800, 400, 0.3, 'lowpass'); }
}
function updateNades(dt) {
  for (let i = R.nades.length - 1; i >= 0; i--) {
    const n = R.nades[i], m = n.m; n.age += dt; n.v.y -= 18 * dt; const px = m.position.x, pz = m.position.z;
    m.position.addScaledVector(n.v, dt); let contact = false;
    if (m.position.y < 0.08) { m.position.y = 0.08; if (Math.abs(n.v.y) > 1.5) contact = true; n.v.y *= -0.35; n.v.x *= 0.7; n.v.z *= 0.7; }
    if (blockedAt(m.position.x, m.position.z)) { m.position.x = px; m.position.z = pz; n.v.x *= -0.4; n.v.z *= -0.4; contact = true; }
    n.t -= dt; const hitNow = contact && n.age > 0.12;
    if (n.t <= 0 || (hitNow && (n.def.kind === 'impact' || (n.def.kind === 'fire' && n.def.fuse < 0.1)))) { explodeNade(n); R.nades.splice(i, 1); }
  }
  for (let i = R.smokes.length - 1; i >= 0; i--) {
    const s = R.smokes[i]; s.t -= dt; const fade = Math.min(1, s.t / 3), grow = Math.min(1, (s.total - s.t) / 1.5);
    s.sprites.forEach(sp => { sp.material.opacity = 0.8 * fade * grow; sp.position.y += dt * 0.05; });
    if (s.t <= 0) { s.sprites.forEach(sp => { scene.remove(sp); sp.material.dispose(); }); R.smokes.splice(i, 1); }
  }
  for (let i = R.fires.length - 1; i >= 0; i--) {
    const f = R.fires[i]; f.t -= dt; f.acc += dt;
    if (Math.random() < 0.7) burst(new THREE.Vector3(f.x + rnd(-f.r, f.r) * 0.8, 0.1, f.z + rnd(-f.r, f.r) * 0.8), Math.random() < 0.5 ? 0xff7a22 : 0xffc040, 1, 1.4, 0.16, fx.sparks, -3);
    enemies.forEach(e => { if (e.alive && Math.hypot(e.mesh.position.x - f.x, e.mesh.position.z - f.z) < f.r) { e.burnT = Math.max(e.burnT || 0, 2); e.hp -= f.dmg * dt; e.alertT = Math.max(e.alertT, 5); if (e.hp <= 0) killEnemy(e, false); } });
    if (f.acc >= 0.5) { f.acc = 0; if (Math.hypot(playerPos.x - f.x, playerPos.z - f.z) < f.r) hurtPlayer({ dmg: f.dmg * 0.5, pen: 6 }, 'legs', 1); }
    if (f.t <= 0) R.fires.splice(i, 1);
  }
  if (R.flashT > 0) R.flashT = Math.max(0, R.flashT - dt);
}
// buffs from stims and food
function updateBuffs(dt) {
  const B = R.buff; B.speed = Math.max(0, B.speed - dt); B.resist = Math.max(0, B.resist - dt); B.steady = Math.max(0, B.steady - dt);
  if (B.regenT > 0) { B.regenT -= dt; if (totalHp() < MAX_TOTAL) { healPool(B.regen * dt); syncHp(); } }
}

// ───────────────────────── per-frame raid update ─────────────────────────
function rdUpdate(dt, elapsed) {
  R.t += dt;
  // ADS / crouch inputs ease
  R.ads += ((R.adsHeld && !R.sprinting && R.reload <= 0 ? 1 : 0) - R.ads) * Math.min(1, dt * 11);
  R.kick = Math.max(0, R.kick - dt * 9); R.shake = Math.max(0, R.shake - dt * 2.4);
  R.bloom = Math.max(0, R.bloom - dt * 0.03);
  // recoil recovers toward zero (pitch recovers faster than yaw)
  const rec = Math.min(1, dt * (R.ads > 0.5 ? 5.5 : 4.5)); R.recoilP -= R.recoilP * rec; R.recoilY -= R.recoilY * rec * 0.8;
  if (R.pain > 0) R.pain -= dt;
  // reload / item use timers
  if (R.reload > 0) { R.reload -= dt; if (R.reload <= 0) finishReload(); }
  if (R.use) { R.use.t -= dt; if (R.use.t <= 0) finishUse(); }
  updateBuffs(dt); updateNades(dt);
  // bleeding
  if (R.bleed > 0 && !R.dead) { const d = R.bleed * 0.7 * dt; R.z.stomach -= d; if (R.z.stomach < 0) { R.z.chest += R.z.stomach * 0.8; R.z.stomach = 0; } syncHp(); if (R.z.chest <= 0) { rdEnd('died'); return; } }
  // fire
  if (fireHeld) window.tryFire(elapsed);
  // enemies
  window.tickEnemyAI(dt);
  // hold-to-interact (F search, E extract)
  handleHold(dt);
  updateFx(dt);
  if (R.atmo) R.atmo.update(dt);
  // raid timer
  if (R.t >= R.limit) { rdEnd('mia'); return; }
  rdHud(dt);
}
const keysDown = { F: false, E: false };
function handleHold(dt) {
  let target = null, kind = null, need = 0;
  if (keysDown.E) { const x = nearbyExtract(); if (x) { target = x; kind = 'extract'; need = 8; } }
  if (!target && keysDown.F) { const c = nearestContainer(); if (c) { target = c; kind = 'search'; need = c.time; } }
  const moving = moveState.w || moveState.a || moveState.s || moveState.d;
  if (target && !(kind === 'extract' && moving && false)) {
    if (!R.hold || R.hold.target !== target) { R.hold = { target, kind, need }; R.holdT = 0; }
    R.holdT += dt;
    if (R.holdT >= need) {
      R.hold = null; R.holdT = 0; keysDown.E = keysDown.F = false;
      if (kind === 'extract') rdEnd('extracted'); else if (target.locked && window.rdSafeCrack) window.rdSafeCrack(target); else takeItems(target);
    }
  } else { R.hold = null; R.holdT = 0; }
}

// ───────────────────────── HUD ─────────────────────────
function rdToast(text, ms) {
  const box = document.getElementById('rdToasts'); if (!box) return;
  const d = document.createElement('div'); d.className = 'rdToast'; d.textContent = text; box.appendChild(d);
  setTimeout(() => { d.style.opacity = 0; setTimeout(() => d.remove(), 400); }, ms || 2200); while (box.children.length > 5) box.removeChild(box.firstChild);
}
window.rdToast = rdToast;
let hudAcc = 0;
function rdHud(dt) {
  hudAcc += dt; if (hudAcc < 0.05) return; hudAcc = 0;
  const $ = id => document.getElementById(id); const g = gun(), a = ammo();
  $('rdAmmo').textContent = R.mag + ' / ' + ammoReserve();
  $('rdAmmoSub').textContent = wcat().name + ' · ' + (a ? a.name : '—') + ' · ' + (g.mode === 'auto' ? R.mode.toUpperCase() : g.mode.toUpperCase());
  Object.keys(R_ZONES).forEach(z => {
    const el = $('rdz_' + z); if (!el) return; const f = R.z[z] / R_ZONES[z]; el.style.background = f <= 0 ? '#111' : `hsl(${Math.round(f * 110)},75%,${35 + f * 12}%)`; el.title = z + ' ' + Math.round(R.z[z]);
  });
  $('rdHpNum').textContent = Math.round(totalHp()) + ' HP';
  $('rdVest').textContent = R.vest ? `🦺 ${Math.round(R.vest.dur)}/${R_ARMOR[R.vest.id].dur}` : '🦺 —';
  $('rdHelm').textContent = R.helmet ? `🪖 ${Math.round(R.helmet.dur)}/${R_ARMOR[R.helmet.id].dur}` : '🪖 —';
  $('rdStatus').textContent = (R.bleed ? '🩸 BLEEDING ' : '') + (R.z.legs <= 0 && R.pain <= 0 ? '🦵 LIMP ' : '') + (R.pain > 0 ? '💊 ' + Math.ceil(R.pain) + 's ' : '');
  $('rdStam').style.width = R.stamina + '%';
  const nd = R.nade && packCount(R.nade) > 0 ? R_NADE[R.nade.slice(5)] : null; $('rdNade').textContent = nd ? `${nd.emoji} ${nd.name} ×${packCount(R.nade)}  [G throw · 4 switch]` : '';
  $('rdFlash').style.opacity = R.flashT > 0 ? Math.min(1, R.flashT / 1.5) : 0;
  const b = R.buff, buffs = (b.speed > 0 ? '⚡' : '') + (b.regenT > 0 ? '💚' : '') + (b.resist > 0 ? '🛡️' : '') + (b.steady > 0 ? '🎯' : ''); if (buffs) $('rdStatus').textContent += ' ' + buffs;
  const left = Math.max(0, R.limit - R.t); $('rdTimer').textContent = '⏱ ' + Math.floor(left / 60) + ':' + String(Math.floor(left % 60)).padStart(2, '0') + ' · 💰 ' + R.foundValue + ' · ☠ ' + R.kills + (R.atmo ? ' · ' + R.atmo.label : '') + (R.diff ? ' · ' + R.diff.name : '');
  $('rdTimer').style.color = left < 120 ? '#ff6644' : '#fff';
  // extraction compass
  const ex = R.extracts.map(x => { const dx = x.x - playerPos.x, dz = x.z - playerPos.z; const ang = Math.atan2(-dx, -dz) - yaw; let rel = ((ang + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return `${x.name} ${Math.round(Math.hypot(dx, dz))}m ${Math.abs(rel) > 2.5 ? '⬇ behind you' : rel > 0.4 ? '⬅' : rel < -0.4 ? '➡' : '⬆'}`; }).join('   ');
  $('rdCompass').textContent = ex;
  // prompt / progress bar
  const p = $('rdPrompt'), bar = $('rdBar'), barFill = $('rdBarFill'); let txt = '', prog = -1;
  if (R.use) { txt = R_MED[R.use.id].name + '…'; prog = 1 - R.use.t / R.use.total; }
  else if (R.reload > 0) { txt = 'Reloading…'; prog = 1 - R.reload / R.reloadTotal; }
  else if (R.hold) { txt = R.hold.kind === 'extract' ? 'EXTRACTING — stay in the zone' : 'Searching…'; prog = R.holdT / R.hold.need; }
  else { const x = nearbyExtract(); const c = nearestContainer(); if (x) txt = 'Hold E to extract'; else if (c) txt = 'Hold F to search ' + c.name; }
  p.textContent = txt; bar.style.display = prog >= 0 ? 'block' : 'none'; if (prog >= 0) barFill.style.width = clamp(prog, 0, 1) * 100 + '%';
  // damage vignette + low-health desaturation
  const low = 1 - clamp(totalHp() / (MAX_TOTAL * 0.45), 0, 1);
  $('rdVignette').style.opacity = 0.35 + low * 0.55;
  if (renderer) renderer.domElement.style.filter = low > 0.05 ? `saturate(${1 - low * 0.75}) contrast(${1 + low * 0.1})` : 'none';
  $('crosshair').style.display = R.ads > 0.3 ? 'none' : 'block';
  $('rdScope').style.display = (window.rdScoped(g) && R.ads > 0.85) ? 'block' : 'none';
}

// ───────────────────────── raid start / end ─────────────────────────
function buildHud() {
  if (document.getElementById('rdHud')) return;
  const css = document.createElement('style'); css.textContent = `
  #rdHud { position:fixed; inset:0; pointer-events:none; z-index:18; display:none; font-family:Arial,Helvetica,sans-serif; }
  body.rdOn #rdHud { display:block; } body.rdOn #hudBottom, body.rdOn #hudTop, body.rdOn #lockHint, body.rdOn #killFeed { display:none !important; }
  #rdVignette { position:fixed; inset:0; background:radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%); opacity:.35; }
  #rdGrain { position:fixed; inset:0; opacity:.06; background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>"); mix-blend-mode:overlay; }
  #rdScope { position:fixed; inset:0; display:none; background:radial-gradient(circle at center, rgba(0,0,0,0) 0, rgba(0,0,0,0) 26vmin, #000 27vmin); }
  #rdScope:before,#rdScope:after { content:''; position:absolute; background:#000a; } #rdScope:before { left:50%; top:calc(50% - 26vmin); width:1px; height:52vmin; } #rdScope:after { top:50%; left:calc(50% - 26vmin); height:1px; width:52vmin; }
  #rdHitmark { position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); font-size:34px; font-weight:900; opacity:0; text-shadow:0 0 6px #000; transition:opacity .1s; }
  #rdAmmoBox { position:fixed; right:18px; bottom:16px; text-align:right; color:#fff; text-shadow:0 2px 6px #000; }
  #rdAmmo { font-size:34px; font-weight:900; letter-spacing:1px; } #rdAmmoSub { font-size:11.5px; color:#ffcc88; margin-top:2px; }
  #rdBody { position:fixed; left:16px; bottom:16px; width:118px; color:#fff; font-size:11px; text-shadow:0 1px 4px #000; }
  #rdBodyFig { position:relative; width:64px; height:108px; margin:0 0 4px 8px; } .rdz { position:absolute; border:1px solid #000a; border-radius:4px; }
  #rdz_head { left:22px; top:0; width:20px; height:20px; border-radius:50%; } #rdz_chest { left:16px; top:22px; width:32px; height:26px; } #rdz_stomach { left:18px; top:50px; width:28px; height:18px; }
  #rdz_arms { left:0; top:22px; width:14px; height:44px; box-shadow:50px 0 0 0 transparent; } #rdz_legs { left:18px; top:70px; width:28px; height:38px; }
  #rdarm2 { position:absolute; left:50px; top:22px; width:14px; height:44px; border:1px solid #000a; border-radius:4px; }
  #rdStamWrap { height:5px; background:#0008; border-radius:3px; overflow:hidden; margin-top:3px; } #rdStam { height:100%; background:#ffd24a; width:100%; }
  #rdTop { position:fixed; top:10px; left:50%; transform:translateX(-50%); text-align:center; color:#fff; text-shadow:0 1px 5px #000; }
  #rdTimer { font-size:15px; font-weight:bold; background:#0007; padding:4px 12px; border-radius:8px; } #rdCompass { font-size:12px; margin-top:5px; color:#7dffb0; }
  #rdMid { position:fixed; left:50%; top:63%; transform:translateX(-50%); text-align:center; color:#fff; text-shadow:0 1px 5px #000; min-width:240px; }
  #rdPrompt { font-size:15px; font-weight:bold; } #rdBar { display:none; height:7px; background:#0009; border-radius:4px; overflow:hidden; margin-top:6px; border:1px solid #fff4; } #rdBarFill { height:100%; background:#7dffb0; width:0; }
  #rdToasts { position:fixed; left:16px; top:56px; display:flex; flex-direction:column; gap:4px; max-width:340px; }
  .rdToast { background:#000a; border-left:3px solid #ff8844; padding:5px 9px; color:#ffe0c0; font-size:12.5px; border-radius:4px; transition:opacity .4s; }
  #rdBtns { display:none; } @media (pointer:coarse) { body.rdOn #rdBtns { display:block; } #rdBody { bottom:140px; } }
  .rdBtn { position:fixed; width:54px; height:54px; border-radius:50%; background:#0007; border:2px solid #fff6; color:#fff; font-size:20px; display:flex; align-items:center; justify-content:center; pointer-events:auto; touch-action:none; user-select:none; z-index:26; }
  `; document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'rdHud';
  hud.innerHTML = `<div id="rdVignette"></div><div id="rdGrain"></div><div id="rdScope"></div><div id="rdHitmark">✕</div>
   <div id="rdTop"><div id="rdTimer"></div><div id="rdCompass"></div></div>
   <div id="rdMid"><div id="rdPrompt"></div><div id="rdBar"><div id="rdBarFill"></div></div></div>
   <div id="rdToasts"></div>
   <div id="rdBody"><div id="rdBodyFig"><div class="rdz" id="rdz_head"></div><div class="rdz" id="rdz_chest"></div><div class="rdz" id="rdz_stomach"></div><div class="rdz" id="rdz_arms"></div><div id="rdarm2" class="rdz"></div><div class="rdz" id="rdz_legs"></div></div>
     <div id="rdHpNum"></div><div id="rdVest"></div><div id="rdHelm"></div><div id="rdStatus" style="color:#ff7766;font-weight:bold"></div><div id="rdStamWrap"><div id="rdStam"></div></div></div>
   <div id="rdAmmoBox"><div id="rdAmmo"></div><div id="rdAmmoSub"></div><div id="rdNade" style="font-size:12px;color:#9fe3ff;margin-top:3px"></div></div>
   <div id="rdFlash" style="position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none"></div>
   <div id="rdBtns">
     <div class="rdBtn" id="rdbRel" style="right:112px;bottom:112px">🔄</div><div class="rdBtn" id="rdbAds" style="right:24px;bottom:122px">🎯</div>
     <div class="rdBtn" id="rdbUse" style="right:112px;bottom:178px">🩹</div><div class="rdBtn" id="rdbAct" style="right:24px;bottom:188px">✋</div>
     <div class="rdBtn" id="rdbCro" style="right:180px;bottom:60px">⬇</div></div>`;
  document.getElementById('gameScreen').appendChild(hud);
  // mirror the arms zone colour on the second arm box
  const sync = setInterval(() => { const a = document.getElementById('rdz_arms'), b = document.getElementById('rdarm2'); if (a && b) b.style.background = a.style.background; }, 200); void sync;
  // touch buttons
  const hold = (id, on, off) => { const el = document.getElementById(id); el.addEventListener('pointerdown', e => { e.preventDefault(); audioOn(); on(); }); if (off) { el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off); } };
  hold('rdbRel', startReload); hold('rdbAds', () => { R.adsHeld = !R.adsHeld; }); hold('rdbUse', () => { const best = R.bleed ? (packCount('bandage') ? 'bandage' : 'medkit') : (packCount('medkit') ? 'medkit' : 'painkiller'); startUse(best); });
  hold('rdbAct', () => { keysDown.F = true; keysDown.E = !!nearbyExtract(); }, () => { keysDown.F = keysDown.E = false; }); hold('rdbCro', () => { R.crouch = !R.crouch; });
}

// raid entry. loadout = { weaponId, ammoType, pack:{}, vest:{id,dur}|null, helmet:{id,dur}|null, protect:boolean }
window.rdEnterRaid = function (mapIndex, loadout) {
  audioOn(); ensureRenderer(); buildHud();
  Object.assign(R, { on: true, over: false, mapIndex, t: 0, pack: Object.assign({}, loadout.pack), vest: loadout.vest, helmet: loadout.helmet, weaponId: loadout.weaponId, protect: !!loadout.protect,
    startWeapon: loadout.weaponId, ammoType: loadout.ammoType, reload: 0, semiReady: true, z: Object.assign({}, R_ZONES), bleed: 0, pain: 0, stamina: 100, ads: 0, adsHeld: false, crouch: false, crouchT: 0,
    recoilP: 0, recoilY: 0, bloom: 0, shake: 0, kick: 0, use: null, hold: null, holdT: 0, containers: [], extracts: [], kills: 0, xpGain: 0, foundValue: 0, limit: 900, flash: 0,
    bag: loadout.bag || null, buff: { speed: 0, regen: 0, regenT: 0, resist: 0, steady: 0 }, flashT: 0, nades: [], smokes: [], fires: [] });
  R.nade = Object.keys(R.pack).find(id => id.startsWith('gren:')) || null;
  R.diff = rDifficulty(mapIndex); R.limit = R.diff.time * 60;                     // sector difficulty: enemy count/mix/accuracy/health, loot, containers, timer
  R.mods = Object.assign({}, loadout.mods || {}); R.gs = rGunStats(loadout.weaponId, R.mods);
  R.mode = gun().mode === 'auto' ? 'auto' : 'semi';
  // load the first magazine from the pack
  R.mag = Math.min(gun().mag, packCount(R.ammoType)); R.pack[R.ammoType] = packCount(R.ammoType) - R.mag; if (R.pack[R.ammoType] <= 0) delete R.pack[R.ammoType];
  // spawn at a random edge
  const edge = [[0, 58], [0, -58], [58, 0], [-58, 0]][rint(0, 3)]; R.spawn = { x: edge[0] + (edge[0] ? 0 : rnd(-25, 25)), z: edge[1] + (edge[1] ? 0 : rnd(-25, 25)) };
  currentMapIndex = mapIndex; yaw = Math.atan2(R.spawn.x, R.spawn.z) ; pitch = 0; lastShotTime = -999; fx = { tracers: [], sparks: [], blood: [], decals: [] };
  R.building = true; buildMapScene(mapIndex); R.building = false;
  playerPos.x = R.spawn.x; playerPos.z = R.spawn.z; for (let i = 0; i < 40 && blockedAt(playerPos.x, playerPos.z); i++) { playerPos.x *= 0.95; playerPos.z *= 0.95; }
  R.spawn = { x: playerPos.x, z: playerPos.z };
  // enemies were placed during buildMapScene, using the (possibly stale) spawn: push any that ended up too close to the player away
  enemies.forEach(e => { if (Math.hypot(e.mesh.position.x - playerPos.x, e.mesh.position.z - playerPos.z) < 24) { const p = freeSpot(40); e.mesh.position.set(p.x, 0, p.z); e.home = { x: p.x, z: p.z }; e.wp = { x: p.x, z: p.z }; } });
  if (!(window.rdOWSpawn && window.rdOWSpawn())) { spawnContainers(); spawnExtracts(); }
  applyLook(); scene.add(camera); buildViewmodel();
  document.body.classList.add('rdOn');
  document.getElementById('hudMapName').textContent = mapNameForMap(mapIndex);
  userState.highestMapUnlocked = Math.max(userState.highestMapUnlocked || 1, mapIndex);
  syncHp(); inGame = true; showScreen('gameScreen'); saveUserData();
  rdToast(`Raid started — ${R.diff.name.toUpperCase()} sector. Find loot, survive, EXTRACT (hold E in a green zone).`, 4600);
};

// lighting, shadows, tone mapping and a grainy ground — applied on top of whatever map was just built
function applyLook() {
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.traverse(o => {
    if (o.isDirectionalLight) { o.intensity = 1.15; o.castShadow = true; o.shadow.mapSize.set(2048, 2048); const c = o.shadow.camera; c.left = -90; c.right = 90; c.top = 90; c.bottom = -90; c.near = 1; c.far = 220; o.shadow.bias = -0.0006; }
    else if (o.isAmbientLight) o.intensity = 0.38;
    else if (o.isMesh && o.geometry && o.geometry.type !== 'PlaneGeometry') { o.castShadow = true; o.receiveShadow = true; }
    else if (o.isMesh && o.geometry.type === 'PlaneGeometry') { o.receiveShadow = true; }
  });
  const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x3a3326, 0.45); scene.add(hemi);
  // procedural grit on the ground
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const cx = cv.getContext('2d'); cx.fillStyle = '#888'; cx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3500; i++) { const v = rint(90, 190); cx.fillStyle = `rgba(${v},${v},${v},0.35)`; cx.fillRect(Math.random() * 256, Math.random() * 256, rnd(1, 3), rnd(1, 3)); }
  const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(40, 40); tex.anisotropy = 4;
  scene.traverse(o => { if (o.isMesh && o.geometry.type === 'PlaneGeometry' && !o.userData.keepMat && Math.abs(o.rotation.x + Math.PI / 2) < 0.01 && o.material && o.material.color) { o.material = new THREE.MeshStandardMaterial({ color: o.material.color.getHex(), map: tex, roughness: 0.95, metalness: 0 }); o.receiveShadow = true; } });
  scene.fog = new THREE.Fog(scene.background ? scene.background.getHex() : 0x222222, 30, 170);
  // reflections for the metal gun and props: a sky/ground environment tinted like this sector
  if (R.env) { try { R.env.dispose(); } catch (e) {} R.env = null; }
  if (R.atmo) { try { R.atmo.dispose(); } catch (e) {} R.atmo = null; }
  if (window.rdAtmosphere) {                                         // real sun, sky, clouds, haze, shadows that follow you (raid-sky.js)
    R.atmo = window.rdAtmosphere(scene, renderer, camera, themeForMap(R.mapIndex), R.mapIndex, R.diff, currentBuildings, blockedAt);
  } else if (window.rdMakeEnv) { const th = themeForMap(R.mapIndex); R.env = window.rdMakeEnv(renderer, th.sky, th.ground); if (R.env) scene.environment = R.env; }
  if (window.rdOWLook) window.rdOWLook();
  if (window.rdHyperInit) window.rdHyperInit(scene, renderer, camera, R.atmo);                    // Smooth model style = hyper-realistic rendering (raid-hyper.js); does nothing in Blocky
}

// end of raid. reason: 'extracted' | 'died' | 'mia'
function rdEnd(reason) {
  if (R.battle && (reason === 'died' || reason === 'mia') && window.rdBattleDeath) { window.rdBattleDeath(reason); return; }      // team battle: dying = respawn, not the end
  if (R.over) return; R.over = true; R.on = false; fireHeld = false;
  if (document.pointerLockElement) document.exitPointerLock();
  if (renderer) renderer.domElement.style.filter = 'none';
  const result = { reason, kills: R.kills, xp: R.xpGain, found: R.foundValue, pack: Object.assign({}, R.pack), time: R.t, vest: R.vest, helmet: R.helmet, bag: R.bag,
    weaponId: R.startWeapon, protect: R.protect, mag: R.mag, ammoType: R.ammoType, mapIndex: R.mapIndex };
  if (reason === 'extracted') sfx.extract();
  document.body.classList.remove('rdOn'); inGame = false;
  if (typeof window.rdShowResults === 'function') window.rdShowResults(result); else { exitToMapSelect(); }
}
window.rdEnd = rdEnd;

// ───────────────────────── input ─────────────────────────
// registered at load time, BEFORE the original game's own listeners, so stopImmediatePropagation() can keep the original from treating right-click as fire
document.addEventListener('mousedown', e => {
  if (!inGame || !R.on) return;
  if (e.button === 2) { e.stopImmediatePropagation(); if (isLocked) R.adsHeld = true; }
}, true);
document.addEventListener('mouseup', e => { if (e.button === 2) R.adsHeld = false; if (e.button === 0) R.semiReady = true; }, true);
// mouse look with the Settings sensitivity (replaces the original handler during a raid); looking slows down a little while aiming down sights
document.addEventListener('mousemove', e => {
  if (!inGame || !R.on || !isLocked) return; e.stopImmediatePropagation();
  const s = ((window.RDSET && window.RDSET.sens) || 1) * (1 - R.ads * 0.45) * (R.ads > 0.5 ? 1 / Math.sqrt(gun().zoom * window.rdZoomMul(gun())) : 1);
  yaw -= e.movementX * 0.0022 * s; pitch -= e.movementY * 0.0020 * s; pitch = Math.max(-1.3, Math.min(1.3, pitch));
}, true);
window.rdSetVolume = function (v) { if (master) master.gain.value = v; };
window.addEventListener('pointerup', () => { R.semiReady = true; });
document.addEventListener('wheel', e => { if (R.on && R.ads > 0.5 && window.rdScoped(gun())) e.preventDefault(); }, { passive: false });
document.addEventListener('keydown', e => {
  if (!inGame || !R.on || e.repeat) return;
  const k = e.code;
  if (k === 'KeyR') startReload();
  else if (k === 'KeyF') keysDown.F = true;
  else if (k === 'KeyE') keysDown.E = true;
  else if (k === 'KeyB') toggleMode();
  else if (k === 'KeyT') cycleAmmo();
  else if (k === 'KeyC' || k === 'ControlLeft') R.crouch = !R.crouch;
  else if (k === 'Digit1') quickUse('bleed'); else if (k === 'Digit2') quickUse('heal'); else if (k === 'Digit3') quickUse('pain');
  else if (k === 'KeyG') throwNade(); else if (k === 'Digit4') cycleNade();
  else if (k === 'Tab') { e.preventDefault(); if (typeof window.rdToggleInventory === 'function') window.rdToggleInventory(); }
});
document.addEventListener('keyup', e => { if (e.code === 'KeyF') keysDown.F = false; if (e.code === 'KeyE') keysDown.E = false; });
window.addEventListener('blur', () => { keysDown.F = keysDown.E = false; R.adsHeld = false; });

// the original loop, extended: raid update replaces the arcade AI/fire logic
window.animate = function () {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1), elapsed = clock.getElapsedTime();
  if (inGame && R.on) {
    if (!R.invOpen) { updatePlayerMovement(dt); rdUpdate(dt, elapsed); }
    updateRemotePlayers(dt); syncExgunPresence(elapsed);
  }
  if (renderer) { if (window.rdPostEnabled && window.rdPostRender) window.rdPostRender(scene, camera, dt); else renderer.render(scene, camera); }
};
// expose a few things for the UI file and tests
window.rdApplyLook = applyLook;
window.RDX = { api: { getAudio: () => ({ AC, master }), buildHud, sfx, noise, tone, burst, addTracer, sfxShot, blast, lineClear, rayBuildings, buildViewmodel, healPool, rdToast, getFx: () => fx, audioOn, keysDown, hurtPlayer, startReload, syncHp, totalHp, packCount, spreadNow, clearFx, takeItems }, quickUse, throwNade, cycleNade, explodeNade, updateNades, healPool, startUse, startReload, cycleAmmo, toggleMode, hurtPlayer, fireBullets, totalHp, takeItems, nearestContainer, nearbyExtract, buildViewmodel, syncHp, MAX_TOTAL, rdUpdate };
})();
