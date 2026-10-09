// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — ⚔️ TEAM BATTLE  (a "server" match: 20 on your team vs 25 opponents, plus vehicles)
//
//   TEAMS     YOUR TEAM has 20 slots: you, any REAL players who joined the battle server (they show up as your teammates), and NPC soldiers
//             filling every empty slot. The ENEMY team is 25 NPCs. Dead soldiers respawn at their base after a few seconds.
//   OBJECTIVE both teams start with tickets. Every death costs the team 1 ticket. Capture the 3 control points (stand near them with
//             more of your people than theirs): every point your team holds drains the enemy's tickets. Tickets hit 0 → that team loses.
//   VEHICLES  each base has a jeep ×2, an armoured car (APC) and a tank. Press F next to a vehicle to drive it (F again to get out).
//             Jeep/APC: machine gun (left click). Tank: cannon (left click, reload 2.8 s). The enemy drives theirs too — kill them with
//             tank shells, grenades (impact grenades are best) or lots of bullets. Run over soldiers for a roadkill.
//   CLASSES   Assault, Medic, Sniper, Support (LMG), Anti-Tank, Breacher — or bring your own equipped gun. No gear is lost when you die here.
//   REWARDS   XP and scrap for kills, captures and winning.
//
// IMPORTANT LIMIT: every player's computer simulates its OWN soldiers and vehicles (there is no game server for them), so real teammates
// are shown as teammates (position, name) but you do not see exactly the same bots, and their shots do not hurt your enemies.
// Built on the raid engine: raid-core.js exposes RAID (player state) and RDX.api; this file adds the map, bots, vehicles and rules.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const R = window.RAID, A = () => window.RDX.api, $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), rint = (a, b) => Math.floor(rnd(a, b + 1));
const BT = window.BATTLE = { on: false, half: 190, t: 0, duration: 900, A: { tickets: 150 }, B: { tickets: 150 }, allies: [], vehicles: [], points: [], stats: null, diff: 1, ended: false };
const TEAM_A = 20, TEAM_B = 25;
const COL = { A: 0x2a6fe0, B: 0xd8342a };

// ───────────────────────── classes (issued kits) ─────────────────────────
const CLASSES = {
  assault:  { name: 'Assault',   emoji: '🎖️', weapon: 'rifle_ak74',   ammo: '545_fmj',    mags: 8, meds: { bandage: 3, medkit: 1 }, nades: { frag_1: 2 },                 vest: 'vest_g3_11', helmet: 'helm_g2_01', desc: 'Balanced rifle, 2 frags' },
  medic:    { name: 'Medic',     emoji: '⚕️', weapon: 'smg_mp5',      ammo: '9mm_fmj',    mags: 8, meds: { bandage: 3, ifak: 3, medkit: 2 }, nades: { smoke_1: 2 },            vest: 'vest_g2_11', helmet: 'helm_g2_01', desc: 'SMG, lots of medicine, smoke' },
  sniper:   { name: 'Sniper',    emoji: '🎯', weapon: 'dmr_10',       ammo: '762_fmj',    mags: 8, meds: { bandage: 2 }, nades: { smoke_1: 1, flash_1: 1 },                    vest: 'vest_g2_01', helmet: 'helm_g1_01', desc: 'Marksman rifle, scope, smoke' },
  support:  { name: 'Support',   emoji: '🔥', weapon: 'lmg_40',       ammo: '762x39_fmj', mags: 3, meds: { bandage: 2 }, nades: { frag_1: 1 },                                vest: 'vest_g4_11', helmet: 'helm_g3_11', desc: 'LMG with a 75-round belt' },
  antitank: { name: 'Anti-Tank', emoji: '🚀', weapon: 'rifle_akm',    ammo: '762x39_ap',  mags: 6, meds: { bandage: 2 }, nades: { impact_2: 3, frag_1: 1 },                    vest: 'vest_g3_11', helmet: 'helm_g2_01', desc: 'AP rounds + 3 heavy impact grenades' },
  breacher: { name: 'Breacher',  emoji: '💥', weapon: 'shotgun_semi', ammo: '12g_buck',   mags: 5, meds: { bandage: 3, medkit: 1 }, nades: { flash_1: 2 },               vest: 'vest_g3_01', helmet: 'helm_g2_01', desc: 'Semi-auto shotgun, flash-bangs' }
};
const VEHICLES = {
  jeep: { name: 'Jeep',          emoji: '🚙', hp: 320,  speed: 27, accel: 16, turn: 1.9, r: 2.1, mg: true,  cam: 9,  roadkill: true },
  apc:  { name: 'Armored Car',   emoji: '🚐', hp: 900,  speed: 16, accel: 8,  turn: 1.3, r: 2.9, mg: true,  cam: 11, roadkill: true },
  tank: { name: 'Tank',          emoji: '🛡️', hp: 1700, speed: 10, accel: 5,  turn: 1.0, r: 3.3, cannon: true, cam: 13, roadkill: true },
  turret: { name: 'MG Turret',    emoji: '🔫', hp: 380,  speed: 0,  accel: 0,  turn: 0,   r: 1.6, mg: true, static: true, cam: 8 }       // fixed gun nests (No Mercy fortresses)
};
const VEH_RESIST = { jeep: 0.55, apc: 0.14, tank: 0.03, turret: 0.35 };              // how much of a bullet's damage a vehicle takes

// ───────────────────────── small helpers ─────────────────────────
let _seed = 0; function rng() { _seed |= 0; _seed = _seed + 0x6D2B79F5 | 0; let t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
function dist2(ax, az, bx, bz) { return Math.hypot(ax - bx, az - bz); }
function baseSpawn(team) { const z = team === 'A' ? BT.half - 22 : -(BT.half - 22); return { x: rnd(-34, 34), z: z + rnd(-6, 6) * (team === 'A' ? -1 : 1) }; }
function kill(msg, ms) { window.rdToast(msg, ms || 2200); }

// ───────────────────────── blockedAt for the big map ─────────────────────────
const origBlocked = window.blockedAt;
window.blockedAt = function (x, z) {
  if (!BT.on) return origBlocked(x, z);
  const r = 0.5; if (Math.abs(x) > BT.half - 1 || Math.abs(z) > BT.half - 1) return true;
  for (const b of currentBuildings) if (x > b.x - b.hw - r && x < b.x + b.hw + r && z > b.z - b.hd - r && z < b.z + b.hd + r) return true;
  return false;
};

// ───────────────────────── the map ─────────────────────────
function windowTexture(base, win) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d'); x.fillStyle = base; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.07})`; x.fillRect(Math.random() * 128, Math.random() * 128, 3, 3); }
  x.fillStyle = win; for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) x.fillRect(12 + q * 30, 14 + r * 30, 16, 18);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function buildBattleMap() {
  const H = BT.half; _seed = 90210; currentBuildings.length = 0;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(H * 2 + 120, H * 2 + 120), new THREE.MeshStandardMaterial({ color: 0x6b6f58, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  const gc = document.createElement('canvas'); gc.width = gc.height = 256; const gx = gc.getContext('2d'); gx.fillStyle = '#9a9a9a'; gx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3500; i++) { const v = 120 + Math.random() * 90 | 0; gx.fillStyle = `rgba(${v},${v},${v},0.32)`; gx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
  const gt = new THREE.CanvasTexture(gc); gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(110, 110); ground.material.map = gt; scene.add(ground);
  // main road between the bases + cross roads
  const roadM = new THREE.MeshStandardMaterial({ color: 0x3a3b3e, roughness: 0.95 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(16, H * 2), roadM); road.rotation.x = -Math.PI / 2; road.position.y = 0.02; road.receiveShadow = true; scene.add(road);
  const cross = new THREE.Mesh(new THREE.PlaneGeometry(H * 2, 12), roadM); cross.rotation.x = -Math.PI / 2; cross.position.y = 0.02; cross.receiveShadow = true; scene.add(cross);
  const dash = new THREE.MeshBasicMaterial({ color: 0xd8d2a0 }); for (let z = -H + 10; z < H - 10; z += 12) { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 5), dash); d.rotation.x = -Math.PI / 2; d.position.set(0, 0.04, z); scene.add(d); }
  const place = (w, h, d, x, z, mat, low) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, h / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); currentBuildings.push({ x, z, hw: w / 2, hd: d / 2, low: !!low }); return m; };
  // bases
  [['A', 1], ['B', -1]].forEach(([team, s]) => {
    const z0 = s * (H - 22), pad = new THREE.Mesh(new THREE.PlaneGeometry(90, 46), new THREE.MeshStandardMaterial({ color: 0x4a4c50, roughness: 0.9 })); pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.03, z0); pad.receiveShadow = true; scene.add(pad);
    const wallM = new THREE.MeshStandardMaterial({ color: team === 'A' ? 0x2c4a7a : 0x7a2c2a, roughness: 0.8 });
    place(92, 4, 2, 0, s * (H - 1), wallM); place(2, 4, 48, -45, z0, wallM); place(2, 4, 48, 45, z0, wallM);                    // back and side walls of the base
    place(24, 3, 2, -33, s * (H - 46), wallM, false); place(24, 3, 2, 33, s * (H - 46), wallM, false);                           // front wall pieces (gap in the middle)
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 14, 8), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.4 })); pole.position.set(0, 7, s * (H - 6)); pole.castShadow = true; scene.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), new THREE.MeshStandardMaterial({ color: COL[team], side: THREE.DoubleSide, roughness: 0.8 })); flag.position.set(2.6, 12, s * (H - 6)); scene.add(flag);
  });
  // control points
  BT.points = [{ x: -85, z: 0, name: 'West', own: 0 }, { x: 0, z: 0, name: 'Center', own: 0 }, { x: 85, z: 0, name: 'East', own: 0 }].map((p, i) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 0.12, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 })); ring.position.set(p.x, 0.08, p.z); scene.add(ring);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 10, 8), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.4 })); pole.position.set(p.x, 5, p.z); pole.castShadow = true; scene.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.4), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })); flag.position.set(p.x + 2.2, 8.5, p.z); scene.add(flag);
    for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28 + 0.3; place(4.5, 1.1, 1.0, p.x + Math.cos(a) * 9, p.z + Math.sin(a) * 9, new THREE.MeshStandardMaterial({ color: 0x8a7a55, roughness: 1 }), true).rotation.y = -a + Math.PI / 2; }
    return Object.assign(p, { id: i, ring, flag, r: 13 });
  });
  // buildings (windows), containers, low cover, trees
  const themes = [['#8d8f93', '#2a3140'], ['#b8a98a', '#3a3f4a'], ['#7a8088', '#1f2a38'], ['#a39a8c', '#30363f']];
  const wallTex = themes.map(t => windowTexture(t[0], t[1]));
  const free = (x, z, pad) => { if (BT.points.some(p => dist2(x, z, p.x, p.z) < 26 + pad)) return false; if (Math.abs(z) > H - 58) return false; if (Math.abs(x) < 11) return false; return currentBuildings.every(b => Math.abs(x - b.x) > b.hw + pad && Math.abs(z - b.z) > b.hd + pad); };
  for (let i = 0, n = 0; n < 62 && i < 900; i++) {
    const w = 7 + rng() * 11, d = 7 + rng() * 11, h = 5 + rng() * 11, x = (rng() * 2 - 1) * (H - 25), z = (rng() * 2 - 1) * (H - 60);
    if (!free(x, z, Math.max(w, d) / 2 + 5)) continue; n++;
    const tex = wallTex[n % 4].clone(); tex.needsUpdate = true; tex.repeat.set(Math.max(1, Math.round(w / 6)), Math.max(1, Math.round(h / 5)));
    place(w, h, d, x, z, new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: 0.9 }));
    place(w + 0.6, 0.5, d + 0.6, x, z, new THREE.MeshStandardMaterial({ color: 0x55575a, roughness: 1 })).position.y = h + 0.25;        // roof edge (visual only extra, shares AABB)
    currentBuildings.pop();
  }
  const contCols = [0x8a3a2a, 0x2a5a8a, 0x3a6a3a, 0xb88a2a, 0x555a60];
  for (let i = 0, n = 0; n < 26 && i < 500; i++) { const x = (rng() * 2 - 1) * (H - 30), z = (rng() * 2 - 1) * (H - 60), rot = rng() < 0.5; if (!free(x, z, 9)) continue; n++; place(rot ? 6.2 : 2.5, 2.6, rot ? 2.5 : 6.2, x, z, new THREE.MeshStandardMaterial({ color: contCols[n % 5], roughness: 0.6, metalness: 0.3 })); }
  const sandM = new THREE.MeshStandardMaterial({ color: 0x8a7a55, roughness: 1 });
  for (let i = 0, n = 0; n < 70 && i < 900; i++) { const x = (rng() * 2 - 1) * (H - 20), z = (rng() * 2 - 1) * (H - 50); if (!free(x, z, 3)) continue; n++; place(rng() < 0.5 ? 5 : 1.2, 1.1, rng() < 0.5 ? 1.2 : 5, x, z, sandM, true); }
  const trunkM = new THREE.MeshStandardMaterial({ color: 0x5a3e24, roughness: 1 }), leafM = [0x2f6a2a, 0x3a7a30, 0x4a8a3a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 1, flatShading: true }));
  for (let i = 0, n = 0; n < 90 && i < 900; i++) { const x = (rng() * 2 - 1) * (H - 8), z = (rng() * 2 - 1) * (H - 8); if (Math.abs(z) > H - 55 && Math.abs(x) < 50) continue; if (!free(x, z, 2) || Math.abs(x) < 9) continue; n++;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 3.6, 8), trunkM); t.position.set(x, 1.8, z); t.castShadow = true; scene.add(t);
    const c = new THREE.Mesh(new THREE.ConeGeometry(2.1 + rng(), 5.5 + rng() * 2, 8), leafM[n % 3]); c.position.set(x, 5.6, z); c.castShadow = true; scene.add(c); currentBuildings.push({ x, z, hw: 0.45, hd: 0.45, low: true }); }
}

// ───────────────────────── soldiers (bots) ─────────────────────────
const BOT_CLASSES = {
  rifle:  { name: 'Rifleman', hp: 100, ac: 1, acHead: 0, ammo: '545_fmj',    acc: 0.42, sight: 62, pref: [16, 38], speed: 3.4, gap: 0.2,  burst: [2, 4], rest: [1.1, 2.1] },
  smg:    { name: 'Assaulter',hp: 90,  ac: 0, acHead: 0, ammo: '9mm_fmj',    acc: 0.38, sight: 42, pref: [7, 20],  speed: 4.0, gap: 0.14, burst: [3, 6], rest: [1.0, 1.8] },
  marks:  { name: 'Marksman', hp: 90,  ac: 1, acHead: 1, ammo: '762_fmj',    acc: 0.58, sight: 95, pref: [40, 72], speed: 2.8, gap: 0.9,  burst: [1, 1], rest: [0.7, 1.4] },
  gunner: { name: 'Gunner',   hp: 130, ac: 2, acHead: 1, ammo: '762x39_fmj', acc: 0.36, sight: 58, pref: [18, 40], speed: 2.9, gap: 0.1,  burst: [6, 12], rest: [1.6, 2.8] }
};
const MIX = ['rifle', 'rifle', 'rifle', 'rifle', 'rifle', 'rifle', 'smg', 'smg', 'smg', 'marks', 'marks', 'gunner'];
function botMesh(team, cls) {
  if (window.RDSET && window.RDSET.smooth && window.rdHyperBot) return window.rdHyperBot(team, cls);
  const g = new THREE.Group(), tone = new THREE.MeshStandardMaterial({ color: team === 'A' ? 0x3c4a5a : 0x5a3c3a, roughness: 0.9 }), vest = new THREE.MeshStandardMaterial({ color: team === 'A' ? 0x2a5aa8 : 0xa83a2a, roughness: 0.8 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xb98a68, roughness: 0.8 }), dark = new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: 0.8, roughness: 0.4 });
  const P = (geo, mat, x, y, z, zone) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.userData.zone = zone; m.castShadow = true; g.add(m); return m; };
  [-1, 1].forEach(s => { P(new THREE.BoxGeometry(0.17, 0.86, 0.2), tone, s * 0.12, 0.43, 0, 'legs'); P(new THREE.BoxGeometry(0.12, 0.55, 0.14), tone, s * 0.35, 1.3, 0.08, 'arms'); });
  P(new THREE.BoxGeometry(0.46, 0.3, 0.26), tone, 0, 1.0, 0, 'stomach'); P(new THREE.BoxGeometry(0.54, 0.5, 0.3), vest, 0, 1.38, 0, 'chest');
  P(new THREE.SphereGeometry(0.16, 10, 8), skin, 0, 1.8, 0, 'head'); P(new THREE.SphereGeometry(0.19, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), vest, 0, 1.84, 0, 'head');
  if (cls === 'gunner') P(new THREE.BoxGeometry(0.3, 0.4, 0.14), vest, 0, 1.38, -0.22, 'chest');
  const gun = P(new THREE.BoxGeometry(0.07, 0.1, cls === 'marks' ? 0.95 : cls === 'smg' ? 0.5 : 0.75), dark, 0.18, 1.3, 0.36, 'arms');
  g.userData.isEnemyRoot = team === 'B'; g.userData.muzzle = new THREE.Vector3(0.18, 1.32, 0.36 + (cls === 'marks' ? 0.5 : cls === 'smg' ? 0.28 : 0.4)); void gun;
  return g;
}
function makeBot(team, clsKey, slot, pos, extra) {
  const d = BOT_CLASSES[clsKey], mesh = botMesh(team, clsKey), sp = pos || baseSpawn(team); mesh.position.set(sp.x, 0, sp.z); mesh.rotation.y = team === 'A' ? Math.PI : 0; scene.add(mesh);
  const hp = Math.round(d.hp * (BT.diff === 0 ? 0.8 : BT.diff === 2 ? 1.15 : 1) * (BT.hpMul || 1) * ((extra && extra.hpMul) || 1));
  const b = { mesh, team, cls: clsKey, d, hp, maxHp: hp, ac: d.ac, acHead: d.acHead, alive: true, slot, type: 'raider', tier: 2, def: { emoji: team === 'A' ? '🔵' : '🔴', name: d.name, tier: 2 }, alertT: 0, lastKnown: { x: sp.x, z: sp.z },
    target: null, scanT: rnd(0, 0.5), fireCd: rnd(0.4, 1.2), burstLeft: 0, restT: rnd(0.5, 2), strafe: Math.random() < 0.5 ? 1 : -1, strafeT: rnd(1, 2.5), side: Math.random() < 0.5 ? 1 : -1, stuck: 0, respawnAt: 0, goal: null };
  if (extra) { if (extra.ac !== undefined) { b.ac = extra.ac; b.acHead = extra.acHead !== undefined ? extra.acHead : b.acHead; } if (extra.guard) { b.guard = true; b.home = { x: sp.x, z: sp.z }; } if (extra.elite) b.def.name = 'Elite ' + d.name; if (extra.boss) { b.boss = true; b.def.name = 'WARLORD'; } }
  mesh.userData.enemy = b; return b;
}
function spawnTeams(realTeammates) {
  enemies = []; BT.allies = [];
  for (let i = 0; i < TEAM_B; i++) enemies.push(makeBot('B', MIX[i % MIX.length], i));
  const allyN = Math.max(0, TEAM_A - 1 - realTeammates); for (let i = 0; i < allyN; i++) BT.allies.push(makeBot('A', MIX[(i + 3) % MIX.length], i));
  BT.realTeammates = realTeammates;
}
function targetAlive(t) { if (t === 'player') return !R.dead; if (t.mesh && t.alive !== undefined) return t.alive; return false; }
function targetPos(t) { if (t === 'player') return { x: playerPos.x, z: playerPos.z }; if (t.pos) return { x: t.pos.x, z: t.pos.z }; return { x: t.mesh.position.x, z: t.mesh.position.z }; }
function hostiles(b) { const list = []; (b.team === 'A' ? enemies : BT.allies).forEach(o => { if (o.alive) list.push(o); }); BT.vehicles.forEach(v => { if (v.team !== b.team && v.alive) list.push(v); }); if (b.team === 'B' && !R.dead) list.push('player'); return list; }
function pickTarget(b) {
  const m = b.mesh.position, best = []; hostiles(b).forEach(t => { const p = targetPos(t), d = dist2(m.x, m.z, p.x, p.z); if (d < b.d.sight) best.push([d, t]); });
  best.sort((a, c) => a[0] - c[0]);
  for (let i = 0; i < Math.min(3, best.length); i++) { const p = targetPos(best[i][1]); if (A().lineClear(m.x, m.z, p.x, p.z)) return best[i][1]; }
  return null;
}
function moveBot(b, tx, tz, speed, dt) {
  const m = b.mesh.position, dx = tx - m.x, dz = tz - m.z, d = Math.hypot(dx, dz) || 1e-4, ang = Math.atan2(dx, dz) + (b.stuck > 0 ? b.side * 1.1 : 0);
  const nx = m.x + Math.sin(ang) * speed * dt, nz = m.z + Math.cos(ang) * speed * dt; let moved = false;
  if (!window.blockedAt(nx, m.z)) { m.x = nx; moved = true; } if (!window.blockedAt(m.x, nz)) { m.z = nz; moved = true; }
  if (!moved) { b.stuck = 0.7; if (Math.random() < 0.3) b.side *= -1; } else b.stuck = Math.max(0, b.stuck - dt); return d;
}
function objectiveFor(b) {
  if (BT.mode === 'nomercy') {                                    // fortress assault: attackers follow the breach route, defenders hold their posts
    if (b.guard) return { x: b.home.x + rnd(-5, 5), z: b.home.z + rnd(-5, 5) };
    if (!R.dead && !BT.ended) return { x: playerPos.x + rnd(-7, 7), z: playerPos.z + rnd(-3, 9) };           // your squad sticks with you: it advances when you do
    const path = BT.nmPath || [{ x: 0, z: 0 }]; b.wp = b.wp || 0; const w = path[Math.min(b.wp, path.length - 1)];
    if (dist2(b.mesh.position.x, b.mesh.position.z, w.x, w.z) < 6 && b.wp < path.length - 1) b.wp++; const n = path[Math.min(b.wp, path.length - 1)]; return { x: n.x + rnd(-3, 3), z: n.z + rnd(-3, 3) };
  }
  const pts = BT.points.slice().sort((p, q) => dist2(b.mesh.position.x, b.mesh.position.z, p.x, p.z) - dist2(b.mesh.position.x, b.mesh.position.z, q.x, q.z));
  const want = pts.find(p => (b.team === 'A' ? p.own < 0.95 : p.own > -0.95)); if (want) return { x: want.x + rnd(-6, 6), z: want.z + rnd(-6, 6) };
  const hz = b.team === 'A' ? -(BT.half - 40) : (BT.half - 40); return { x: rnd(-30, 30), z: hz };
}
function botShoot(b, t, dist) {
  const d = b.d, a = R_AMMO[d.ammo], m = b.mesh.userData.muzzle.clone(); b.mesh.localToWorld(m); const tp = targetPos(t), target = new THREE.Vector3(tp.x, t === 'player' ? (R.veh ? 1.6 : 1.45) : 1.3, tp.z);
  let p = d.acc * (BT.diff === 0 ? 0.7 : BT.diff === 2 ? 1.2 : 1) * (BT.nmAcc || 1) * clamp(1.15 - dist / (d.sight * 1.1), 0.12, 1);
  if (t === 'player' && !R.veh) p *= (R.crouch ? 0.85 : 1) * (R.ads > 0.5 ? 0.92 : 1) * ((moveState.w || moveState.a || moveState.s || moveState.d) ? 0.8 : 1);
  const pd = dist2(m.x, m.z, playerPos.x, playerPos.z), vol = clamp(1 - pd / 130, 0, 0.8); if (vol > 0.04) A().sfxShot(a.cal, vol * 0.5);
  const hit = Math.random() < p, API = A();
  if (hit) API.addTracer(m, target, a.tracer, 0.06); else { API.addTracer(m, target.clone().add(new THREE.Vector3(rnd(-1.6, 1.6), rnd(-0.8, 0.8), rnd(-1.6, 1.6))), a.tracer, 0.06); if (t === 'player' && dist < 45) API.sfx.whiz(); return; }
  if (t === 'player') { if (R.veh) damageVehicle(R.veh, a.dmg * (VEH_RESIST[R.veh.kind] || 0.1), b); else { const zone = [['chest', 42], ['stomach', 16], ['legs', 20], ['arms', 14], ['head', 8]]; let r = Math.random() * 100, z = 'chest'; for (const e of zone) { r -= e[1]; if (r <= 0) { z = e[0]; break; } } API.hurtPlayer(a, z, 0.9, b.mesh.position); } }
  else if (t.kind) damageVehicle(t, a.dmg * (VEH_RESIST[t.kind] || 0.1), b);
  else { const zr = Math.random(), dmg = a.dmg * (zr < 0.12 ? 2.4 : zr < 0.7 ? 1 : 0.6) * (1 - 0.1 * t.ac); t.hp -= dmg; if (t.hp <= 0 && t.alive) botDie(t, b.team === 'A' ? 'ally' : 'foe'); }
}
function botUpdate(b, dt) {
  if (!b.alive) { if (b.slot >= 0 && BT.t >= b.respawnAt && b.respawnAt > 0) respawnBot(b); return; }
  const m = b.mesh.position, d = b.d;
  if (b.burnT > 0) { b.burnT -= dt; b.hp -= 7 * dt; if (b.hp <= 0) { botDie(b, 'burn'); return; } }
  if (b.blind > 0) { b.blind -= dt; moveBot(b, m.x + Math.sin(b.mesh.rotation.y + b.blind) * 4, m.z + Math.cos(b.mesh.rotation.y + b.blind) * 4, 1.2, dt); return; }
  b.scanT -= dt; if (b.scanT <= 0) { b.scanT = 0.35 + Math.random() * 0.25; b.target = pickTarget(b); if (b.target) b.lostT = 5; }
  const t = b.target && targetAlive(b.target) ? b.target : null;
  if (t) {
    const tp = targetPos(t), dx = tp.x - m.x, dz = tp.z - m.z, dist = Math.hypot(dx, dz) || 1e-4; b.mesh.rotation.y = Math.atan2(dx, dz);
    if (dist > d.pref[1]) moveBot(b, tp.x, tp.z, d.speed, dt); else if (dist < d.pref[0]) moveBot(b, m.x - dx, m.z - dz, d.speed * 0.8, dt);
    else { b.strafeT -= dt; if (b.strafeT <= 0) { b.strafe *= -1; b.strafeT = rnd(1, 2.6); } moveBot(b, m.x + (-dz / dist) * b.strafe * 5, m.z + (dx / dist) * b.strafe * 5, d.speed * 0.6, dt); }
    if (dist < d.sight) {
      if (b.restT > 0) b.restT -= dt;
      else { if (b.burstLeft <= 0) { b.burstLeft = rint(d.burst[0], d.burst[1]); b.fireCd = rnd(0.2, 0.5); } b.fireCd -= dt; if (b.fireCd <= 0 && b.burstLeft > 0) { botShoot(b, t, dist); b.burstLeft--; b.fireCd = d.gap; if (b.burstLeft <= 0) b.restT = rnd(d.rest[0], d.rest[1]); } }
    }
  } else {
    if (b.heard && b.heard.until > BT.t) { b.goal = { x: b.heard.x, z: b.heard.z }; b.goalT = 3; b.heard.until -= 0; }       // gunfire / an alarm: go and look
    else if (!b.goal || dist2(m.x, m.z, b.goal.x, b.goal.z) < 4 || (b.goalT -= dt) < 0) { b.goal = objectiveFor(b); b.goalT = b.guard ? 5 : BT.mode === 'nomercy' ? 2.5 : 12; }
    b.mesh.rotation.y = Math.atan2(b.goal.x - m.x, b.goal.z - m.z); moveBot(b, b.goal.x, b.goal.z, d.speed, dt);
  }
}
function botDie(b, how) {
  if (!b.alive) return; b.alive = false; b.mesh.rotation.order = 'YXZ'; b.mesh.rotation.x = -Math.PI / 2; b.mesh.position.y = 0.22; b.respawnAt = BT.mode === 'nomercy' ? 0 : BT.t + 8 + Math.random() * 3;     // no respawns in No Mercy
  const team = BT[b.team]; team.tickets = Math.max(0, team.tickets - 1); b.target = null;
  if (b.team === 'B' && how === 'player') { BT.stats.kills++; }
  if (b.boss && window.rdNMBossDown) window.rdNMBossDown(how);
}
function respawnBot(b) {
  const sp = baseSpawn(b.team); b.mesh.position.set(sp.x, 0, sp.z); b.mesh.rotation.x = 0; b.hp = b.maxHp; b.alive = true; b.burnT = 0; b.blind = 0; b.target = null; b.goal = null; b.respawnAt = 0; b.restT = rnd(0.5, 1.5); b.burstLeft = 0;
}

// ───────────────────────── vehicles ─────────────────────────
function box(p, w, h, d, mat, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; }
function vehMesh(kind, team) {
  const g = new THREE.Group(), body = new THREE.MeshStandardMaterial({ color: kind === 'tank' ? (team === 'A' ? 0x3a4f3a : 0x4f3a30) : (team === 'A' ? 0x3d5a8a : 0x8a3d34), roughness: 0.7, metalness: 0.3 }), dark = new THREE.MeshStandardMaterial({ color: 0x1b1c1e, roughness: 0.6, metalness: 0.6 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x6a8aa8, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.6 }), tire = new THREE.MeshStandardMaterial({ color: 0x0e0e0f, roughness: 1 }), mark = new THREE.MeshStandardMaterial({ color: COL[team], roughness: 0.8 });
  const wheels = [], wheel = (x, y, z, r) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.45, 18), tire); w.rotation.z = Math.PI / 2; w.position.set(x, y, z); w.castShadow = true; g.add(w); wheels.push(w); };
  let turret = null, barrel = null;
  if (kind === 'jeep') {
    box(g, 2.0, 0.7, 3.8, body, 0, 0.9, 0); box(g, 1.9, 0.5, 1.3, body, 0, 1.15, 1.2); box(g, 1.9, 0.9, 0.12, glass, 0, 1.55, 0.35).rotation.x = -0.35; box(g, 0.1, 1, 0.1, dark, -0.85, 1.7, -0.6); box(g, 0.1, 1, 0.1, dark, 0.85, 1.7, -0.6); box(g, 1.8, 0.08, 0.1, dark, 0, 2.2, -0.6);
    box(g, 0.3, 0.2, 0.1, mark, -0.6, 1.2, 1.95); box(g, 0.3, 0.2, 0.1, mark, 0.6, 1.2, 1.95); [[-1, 1.3], [1, 1.3], [-1, -1.3], [1, -1.3]].forEach(w => wheel(w[0] * 1.05, 0.5, w[1], 0.5));
    turret = new THREE.Group(); turret.position.set(0, 1.9, -0.9); g.add(turret); box(turret, 0.25, 0.25, 1.2, dark, 0, 0, 0.5).position.z = 0.7;
  } else if (kind === 'apc') {
    box(g, 2.6, 1.3, 6.0, body, 0, 1.25, 0); box(g, 2.4, 0.5, 1.8, body, 0, 1.4, 2.7).rotation.x = 0.28; box(g, 2.0, 0.5, 0.15, glass, 0, 2.0, 1.8); box(g, 2.8, 0.2, 6.2, dark, 0, 0.6, 0);
    box(g, 2.7, 0.3, 0.15, mark, 0, 1.6, -3.05); [[-1, 2], [1, 2], [-1, 0.2], [1, 0.2], [-1, -1.8], [1, -1.8]].forEach(w => wheel(w[0] * 1.3, 0.6, w[1], 0.6));
    turret = new THREE.Group(); turret.position.set(0, 2.15, -0.4); g.add(turret); box(turret, 1.1, 0.6, 1.4, body, 0, 0.3, 0); box(turret, 0.2, 0.2, 1.6, dark, 0, 0.4, 1.2);
  } else if (kind === 'turret') {                       // a fixed gun nest: sandbag ring, steel base, swivelling machine gun
    const sand = new THREE.MeshStandardMaterial({ color: 0x8a7a55, roughness: 1 });
    for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28; box(g, 1.5, 0.9, 0.7, sand, Math.cos(a) * 1.9, 0.45, Math.sin(a) * 1.9).rotation.y = -a + Math.PI / 2; }
    box(g, 1.1, 0.5, 1.1, dark, 0, 0.55, 0); turret = new THREE.Group(); turret.position.set(0, 1.0, 0); g.add(turret); box(turret, 0.6, 0.45, 0.9, body, 0, 0.1, 0); box(turret, 0.16, 0.16, 1.5, dark, 0, 0.15, 1.0); box(turret, 0.9, 0.55, 0.12, dark, 0, 0.1, 0.55); box(turret, 0.25, 0.25, 0.25, mark, 0.4, 0.5, -0.3);
  } else {
    box(g, 3.6, 1.1, 6.6, body, 0, 1.0, 0); box(g, 2.6, 0.8, 1.6, body, 0, 1.0, 3.6).rotation.x = 0.35; [-1, 1].forEach(s => { box(g, 0.95, 1.2, 7.0, dark, s * 2.0, 0.65, 0); for (let i = 0; i < 6; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.9, 12), tire); w.rotation.z = Math.PI / 2; w.position.set(s * 2.0, 0.5, -2.8 + i * 1.12); g.add(w); wheels.push(w); } });
    turret = new THREE.Group(); turret.position.set(0, 1.9, -0.2); g.add(turret); box(turret, 2.5, 0.95, 3.0, body, 0, 0.35, 0); box(turret, 0.7, 0.35, 0.7, dark, 0.6, 1.0, -0.4); box(turret, 0.2, 0.2, 0.2, mark, -0.7, 0.9, 0.2);
    barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 4.8, 12), dark); barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.45, 3.3); barrel.castShadow = true; turret.add(barrel);
  }
  g.traverse(o => { if (o.isMesh) o.userData.vehicle = true; });
  return { g, turret, barrel, wheels };
}
function addVehicle(kind, team, x, z, yaw, ai) {
  const def = VEHICLES[kind], mm = vehMesh(kind, team); mm.g.position.set(x, 0, z); mm.g.rotation.y = yaw; scene.add(mm.g);
  const v = { kind, def, team, mesh: mm.g, turret: mm.turret, barrel: mm.barrel, wheels: mm.wheels, pos: mm.g.position, yaw, tyaw: yaw, speed: 0, hp: def.hp, maxHp: def.hp, alive: true, occ: null, ai, home: { x, z, yaw }, respawnAt: 0, cannonCd: 0, mgCd: 0, scanT: Math.random(), target: null, goal: null, goalT: 0, name: def.name, smokeT: 0 };
  BT.vehicles.push(v); return v;
}
function spawnVehicles() {
  BT.vehicles.forEach(v => scene.remove(v.mesh)); BT.vehicles = [];
  [['A', 1], ['B', -1]].forEach(([team, s]) => {
    [['jeep', -30], ['jeep', -16], ['apc', 16], ['tank', 32]].forEach(([kind, x], i) => addVehicle(kind, team, x, s * (BT.half - 34), s === 1 ? Math.PI : 0, team === 'B' || kind === 'apc' || i === 0));
  });
}
function damageVehicle(v, dmg, src) {
  if (!v.alive || dmg <= 0) return; v.hp -= dmg;
  if (v.hp <= 0) destroyVehicle(v, src);
}
function destroyVehicle(v, src) {
  v.alive = false; v.hp = 0; v.respawnAt = BT.mode === 'nomercy' ? 0 : BT.t + 50; const p = v.pos.clone().add(new THREE.Vector3(0, 1.2, 0)); A().noise(0.7, 3500, 100, 1.3, 'lowpass'); A().tone(60, 0.6, 0.9, 'sine', 0, 28);
  A().burst(p, 0xff9a33, 30, 10, 0.16, A().getFx().sparks, 7); A().burst(p, 0x333333, 16, 5, 0.3, A().getFx().blood, 1.4);
  v.mesh.traverse(o => { if (o.isMesh && o.material && o.material.color) { o.material = o.material.clone(); o.material.color.multiplyScalar(0.18); } });
  if (R.veh === v) { const veh = v; exitVehicle(true); ['chest', 'legs', 'arms', 'stomach'].forEach(z => A().hurtPlayer({ dmg: 45, pen: 6 }, z, 1)); veh.occ = null; kill('💥 Your vehicle was destroyed!', 2600); }
  explosion(p, 8, 140, v.team === 'A' ? 'B' : 'A', true);
  if (src === 'player' || (src && src.team === 'A' && v.team === 'B')) { BT.stats.vehicles++; kill(`💥 Enemy ${v.name} destroyed`, 2200); }
}
function respawnVehicle(v) {
  v.mesh.traverse(o => { if (o.isMesh && o.material && o.material.color) o.material.color.multiplyScalar(1 / 0.18); });
  v.hp = v.maxHp; v.alive = true; v.pos.set(v.home.x, 0, v.home.z); v.yaw = v.home.yaw; v.tyaw = v.yaw; v.speed = 0; v.mesh.rotation.y = v.yaw; v.occ = null; v.ai = v.team === 'B' || v.kind === 'apc' || v.home.x === -30; v.respawnAt = 0;
}
function enterVehicle(v) {
  if (R.dead || R.veh || !v.alive || v.occ || v.team !== 'A') return; R.veh = v; v.occ = 'player'; v.ai = false; R.use = null; R.adsHeld = false; moveState.w = moveState.a = moveState.s = moveState.d = false;
  camera.children.forEach(c => { c.visible = false; }); kill(`${v.def.emoji} In the ${v.name}: W/S drive · A/D steer · mouse aims ${v.def.cannon ? 'the cannon' : 'the machine gun'} · click to fire · F to get out`, 4200);
}
function exitVehicle(forced) {
  const v = R.veh; if (!v) return; R.veh = null; v.occ = null; v.speed = 0; camera.children.forEach(c => { c.visible = true; });
  const a = v.yaw + Math.PI / 2; playerPos.x = v.pos.x + Math.sin(a) * (v.def.r + 1.5); playerPos.z = v.pos.z + Math.cos(a) * (v.def.r + 1.5); if (window.blockedAt(playerPos.x, playerPos.z)) { playerPos.x = v.pos.x - Math.sin(a) * (v.def.r + 1.5); playerPos.z = v.pos.z - Math.cos(a) * (v.def.r + 1.5); }
  if (!forced) kill('Out of the vehicle', 1200); camera.fov = (window.RDSET && window.RDSET.fov) || 78; camera.updateProjectionMatrix();
}
function vehCollide(v, nx, nz) {
  const r = v.def.r; if (Math.abs(nx) > BT.half - r || Math.abs(nz) > BT.half - r) return true;
  for (const b of currentBuildings) { if (b.low) continue; const cx = clamp(nx, b.x - b.hw, b.x + b.hw), cz = clamp(nz, b.z - b.hd, b.z + b.hd); if (Math.hypot(nx - cx, nz - cz) < r) return true; }
  return false;
}
function moveVehicle(v, throttle, steer, dt) {
  const d = v.def; if (d.static) { v.speed = 0; return; } const target = throttle * d.speed * (throttle < 0 ? 0.5 : 1); v.speed += clamp(target - v.speed, -d.accel * dt * 1.6, d.accel * dt); if (!throttle) v.speed *= 1 - 0.8 * dt;
  v.yaw += steer * d.turn * dt * clamp(Math.abs(v.speed) / (d.speed * 0.35) + (d.cannon ? 0.5 : 0.25), 0, 1) * (v.speed >= 0 ? 1 : -1);
  const nx = v.pos.x + Math.sin(v.yaw) * v.speed * dt, nz = v.pos.z + Math.cos(v.yaw) * v.speed * dt;
  if (!vehCollide(v, nx, nz)) { v.pos.x = nx; v.pos.z = nz; } else if (!vehCollide(v, nx, v.pos.z)) { v.pos.x = nx; v.speed *= 0.6; } else if (!vehCollide(v, v.pos.x, nz)) { v.pos.z = nz; v.speed *= 0.6; } else { if (Math.abs(v.speed) > 6) damageVehicle(v, Math.abs(v.speed) * 4, null); v.speed *= -0.25; }
  v.mesh.rotation.y = v.yaw; v.wheels.forEach(w => { w.rotation.x += v.speed * dt / 0.5; });
  if (d.roadkill && Math.abs(v.speed) > 5) { const list = v.team === 'A' ? enemies : BT.allies; list.forEach(b => { if (b.alive && dist2(b.mesh.position.x, b.mesh.position.z, v.pos.x, v.pos.z) < d.r + 0.6) { botDie(b, v.occ === 'player' ? 'player' : 'veh'); if (v.occ === 'player') { R.kills++; BT.stats.roadkills++; kill('🚙 Roadkill!', 1400); } } });
    if (v.team === 'B' && !R.dead && !R.veh && dist2(playerPos.x, playerPos.z, v.pos.x, v.pos.z) < d.r + 0.5) { ['chest', 'legs', 'stomach'].forEach(z => A().hurtPlayer({ dmg: Math.abs(v.speed) * 3, pen: 6 }, z, 1)); } }
}
// shells and machine-gun bullets
const shells = [];
function fireShell(v, from, dir, team) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd080 })); m.position.copy(from); scene.add(m);
  shells.push({ m, v: dir.clone().multiplyScalar(95), team, life: 4, from: v }); A().noise(0.4, 2500, 120, 1.0, 'lowpass'); A().tone(80, 0.3, 0.8, 'sine', 0, 40); A().burst(from, 0xffaa44, 8, 6, 0.1, A().getFx().sparks, 4);
}
function updateShells(dt) {
  for (let i = shells.length - 1; i >= 0; i--) {
    const s = shells[i]; s.life -= dt; s.v.y -= 6 * dt; const prev = s.m.position.clone(); s.m.position.addScaledVector(s.v, dt); let hit = s.life <= 0 || s.m.position.y < 0.1 || window.blockedAt(s.m.position.x, s.m.position.z);
    if (!hit) for (const v of BT.vehicles) if (v.alive && v.team !== s.team && dist2(s.m.position.x, s.m.position.z, v.pos.x, v.pos.z) < v.def.r + 0.8 && s.m.position.y < 3.2) { hit = true; break; }
    if (!hit && s.team === 'B' && !R.dead && !R.veh && dist2(s.m.position.x, s.m.position.z, playerPos.x, playerPos.z) < 1.2) hit = true;
    if (!hit) for (const b of (s.team === 'A' ? enemies : BT.allies)) if (b.alive && dist2(s.m.position.x, s.m.position.z, b.mesh.position.x, b.mesh.position.z) < 0.9 && s.m.position.y < 2.1) { hit = true; break; }
    if (hit) { const p = s.m.position.clone(); scene.remove(s.m); s.m.geometry.dispose(); explosion(p, 8.5, 260, s.team); shells.splice(i, 1); } else A().addTracer(prev, s.m.position, 0xffd080, 0.05);
  }
}
// explosions hurt the OTHER team (and you, if the other team's shell lands near you)
function explosion(p, radius, dmg, team, wreck) {
  const API = A(); API.noise(0.7, 3200, 120, 1.2, 'lowpass'); API.tone(70, 0.5, 0.9, 'sine', 0, 30); API.burst(p, 0xffaa44, 22, 9, 0.12, API.getFx().sparks, 6); API.burst(p, 0x444444, 12, 5, 0.25, API.getFx().blood, 1.5);
  const list = team === 'A' ? enemies : BT.allies;
  list.forEach(b => { if (!b.alive) return; const d = dist2(b.mesh.position.x, b.mesh.position.z, p.x, p.z); if (d < radius) { const f = 1 - d / radius; b.hp -= dmg * f * f * 1.4 + dmg * 0.15 * f; if (b.hp <= 0) { botDie(b, team === 'A' ? 'player' : 'foe'); if (team === 'A') { R.kills++; kill('☠ Enemy killed by explosion', 1500); } } } });
  BT.vehicles.forEach(v => { if (!v.alive || (v.team === team && !wreck)) return; if (v.team === team) return; const d = dist2(v.pos.x, v.pos.z, p.x, p.z); if (d < radius + v.def.r) { const f = 1 - d / (radius + v.def.r); damageVehicle(v, dmg * f * (v.kind === 'tank' ? 0.55 : 1), team === 'A' ? 'player' : { team: 'B' }); } });
  if (team === 'B' && !R.dead) { const d = dist2(playerPos.x, playerPos.z, p.x, p.z); if (d < radius) { const f = 1 - d / radius; if (R.veh) damageVehicle(R.veh, dmg * f * 0.6, null); else { ['chest', 'legs', 'arms', 'stomach'].forEach(z => API.hurtPlayer({ dmg: dmg * f * 0.3, pen: 6 }, z, 1)); } R.shake = Math.min(1.5, R.shake + 1); } }
}
// ───────── player driving ─────────
window.rdBattleDrive = function (dt) {
  const v = R.veh; if (!v || !v.alive) { exitVehicle(true); return; }
  moveVehicle(v, (moveState.w ? 1 : 0) - (moveState.s ? 1 : 0), (moveState.a ? 1 : 0) - (moveState.d ? 1 : 0), dt);
  playerPos.x = v.pos.x; playerPos.z = v.pos.z; v.tyaw = yaw + Math.PI; if (v.turret) v.turret.rotation.y = v.tyaw - v.yaw;
  v.cannonCd = Math.max(0, v.cannonCd - dt); v.mgCd = Math.max(0, v.mgCd - dt);
  const d = v.def.cam, py = clamp(pitch, -0.6, 0.9), cx = v.pos.x + Math.sin(yaw) * Math.cos(py * 0.5) * d, cz = v.pos.z + Math.cos(yaw) * Math.cos(py * 0.5) * d, cy = 3.2 + d * 0.28 + Math.sin(py) * d * 0.6;
  camera.position.lerp(new THREE.Vector3(cx, Math.max(1.2, cy), cz), 1 - Math.pow(0.0004, dt)); camera.rotation.order = 'YXZ'; camera.rotation.y = yaw; camera.rotation.x = py * 0.55 - 0.22; camera.rotation.z = 0;
  if (camera.fov !== 70) { camera.fov = 70; camera.updateProjectionMatrix(); }
};
window.rdBattleVehFire = function (now) {
  const v = R.veh; if (!v) return; const API = A(); camera.updateMatrixWorld(); const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  if (v.def.cannon) {
    if (v.cannonCd > 0) return; v.cannonCd = 2.8; v.mesh.updateMatrixWorld(true); const muzzle = v.barrel.getWorldPosition(new THREE.Vector3());
    // the shell converges on whatever the crosshair is on (ground, wall, soldier, vehicle) and compensates a little for gravity
    const o = camera.position, hv = Math.max(0.0001, Math.hypot(dir.x, dir.z)); let D = 160;
    const wall = API.rayBuildings(o.x, o.z, dir.x, dir.z, 200) / hv; if (wall < D) D = wall; if (dir.y < -0.001) D = Math.min(D, -o.y / dir.y);
    const vr = vehicleRay(o, dir, D, 'B'); if (vr) D = Math.min(D, vr.dist);
    raycaster.set(o, dir); raycaster.far = D; const bh = raycaster.intersectObjects(enemies.filter(b => b.alive).map(b => b.mesh), true); if (bh.length) D = Math.min(D, bh[0].distance);
    const aimPt = o.clone().addScaledVector(dir, Math.max(D, 12)), aimDir = aimPt.sub(muzzle).normalize(), t = Math.max(12, D) / 95; aimDir.y += 0.5 * 6 * t * t / Math.max(12, D); aimDir.normalize();
    muzzle.addScaledVector(aimDir, 2.6); fireShell(v, muzzle, aimDir, 'A'); R.shake = Math.min(1.2, R.shake + 0.8); return;
  }
  if (v.mgCd > 0) return; v.mgCd = 0.085; const a = R_AMMO['762_fmj'], origin = camera.position.clone(), d2 = dir.clone(); d2.x += (Math.random() - 0.5) * 0.025; d2.y += (Math.random() - 0.5) * 0.025; d2.normalize();
  const muzzle = v.turret.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.5, 0)); muzzle.addScaledVector(new THREE.Vector3(Math.sin(v.tyaw), 0, Math.cos(v.tyaw)), 1.2);
  hitscan(origin, d2, 160, a, 'A', muzzle); API.sfxShot('762', 0.7);
};
// a bullet fired by the player's vehicle (or any team A shooter)
function hitscan(origin, dir, range, ammo, team, muzzle) {
  const raycast = raycaster; raycast.set(origin, dir); raycast.far = range; const list = (team === 'A' ? enemies : BT.allies).filter(b => b.alive).map(b => b.mesh); const hits = raycast.intersectObjects(list, true), API = A();
  const wall = API.rayBuildings(origin.x, origin.z, dir.x, dir.z, range) / Math.max(0.0001, Math.hypot(dir.x, dir.z)); let end = origin.clone().addScaledVector(dir, Math.min(wall, range));
  const vh = vehicleRay(origin, dir, Math.min(wall, range), team === 'A' ? 'B' : 'A');
  if (vh && (!hits.length || vh.dist < hits[0].distance)) { end = origin.clone().addScaledVector(dir, vh.dist); damageVehicle(vh.v, ammo.dmg * 1.3 * (VEH_RESIST[vh.v.kind] || 0.1), 'player'); }
  else if (hits.length && hits[0].distance < wall) { const h = hits[0], root = (team === 'A' ? enemies : BT.allies).find(b => { let o = h.object; while (o && o !== b.mesh) o = o.parent; return !!o; }); end = h.point.clone(); if (root) { const zone = h.object.userData.zone || 'chest'; root.hp -= ammo.dmg * 1.4 * ({ head: 2.4, chest: 1, stomach: 1.1, arms: 0.55, legs: 0.6 }[zone] || 1); if (root.hp <= 0 && root.alive) { botDie(root, team === 'A' ? 'player' : 'foe'); if (team === 'A') { R.kills++; kill('☠ Enemy down', 1200); } } } }
  API.addTracer(muzzle || origin, end, ammo.tracer, 0.05);
}
// ray vs vehicle boxes (used by the player's own bullets via the core hook below)
const _box = new THREE.Box3(), _hit = new THREE.Vector3();
function vehicleRay(origin, dir, maxD, enemyTeam) {
  let best = null; const ray = new THREE.Ray(origin, dir);
  BT.vehicles.forEach(v => { if (!v.alive || v.team !== enemyTeam) return; const r = v.def.r; _box.setFromCenterAndSize(new THREE.Vector3(v.pos.x, 1.2, v.pos.z), new THREE.Vector3(r * 2, 2.8, r * 2.6)); const p = ray.intersectBox(_box, _hit); if (p) { const d = origin.distanceTo(p); if (d < maxD && (!best || d < best.dist)) best = { v, dist: d }; } });
  return best;
}
window.rdBattleRay = function (origin, dir, maxD) { return vehicleRay(origin, dir, maxD, 'B'); };
window.rdBattleVehHit = function (v, ammo, dist) { damageVehicle(v, ammo.dmg * (ammo.pen >= 5 ? 1.4 : 1) * (VEH_RESIST[v.kind] || 0.1) * (ammo.pellets ? 1 : 1), 'player'); A().sfx.armor(); };
window.rdBattleBlastVeh = function (p, d) { BT.vehicles.forEach(v => { if (!v.alive || v.team !== 'B') return; const dd = dist2(v.pos.x, v.pos.z, p.x, p.z); if (dd < d.radius + v.def.r) { const f = 1 - dd / (d.radius + v.def.r); damageVehicle(v, d.dmg * (d.kind === 'impact' ? 1.6 : 1) * f * (v.kind === 'tank' ? 0.7 : 1.2), 'player'); } }); };
// AI-driven vehicles (both teams; your tank and one jeep are left for you). They roam towards control points, shoot whatever they see.
function vehicleAI(v, dt) {
  const d = v.def, m = v.pos, mine = v.team;
  v.scanT -= dt;
  if (v.scanT <= 0) {
    v.scanT = 0.6; let best = null, bd = d.cannon ? 95 : d.static ? 78 : 55; const cand = [];
    (mine === 'B' ? BT.allies : enemies).forEach(b => { if (b.alive) cand.push({ x: b.mesh.position.x, z: b.mesh.position.z, obj: b }); });
    if (mine === 'B' && !R.dead) cand.push({ x: playerPos.x, z: playerPos.z, obj: 'player' });
    BT.vehicles.forEach(o => { if (o.alive && o.team !== mine) cand.push({ x: o.pos.x, z: o.pos.z, obj: o }); });
    cand.forEach(c => { const dd = dist2(m.x, m.z, c.x, c.z); if (dd < bd && A().lineClear(m.x, m.z, c.x, c.z)) { bd = dd; best = c; } }); v.target = best;
  }
  let throttle = 0, gx, gz; const tg = v.target;
  if (d.static) v.goal = { x: m.x, z: m.z };                       // fixed turrets never go anywhere
  else if (!v.goal || dist2(m.x, m.z, v.goal.x, v.goal.z) < 10 || (v.goalT -= dt) < 0) { const pts = BT.points.filter(p => mine === 'B' ? p.own > -0.95 : p.own < 0.95); const p = pts.length ? pts[rint(0, pts.length - 1)] : BT.points[1]; v.goal = { x: p.x + rnd(-14, 14), z: p.z + rnd(-14, 14) }; v.goalT = 25; }
  if (tg && dist2(m.x, m.z, tg.x, tg.z) < (d.cannon ? 50 : 25)) { gx = tg.x; gz = tg.z; throttle = d.cannon ? 0.15 : 0.4; } else { gx = v.goal.x; gz = v.goal.z; throttle = 0.9; }
  const want = Math.atan2(gx - m.x, gz - m.z); let diff = want - v.yaw; while (diff > Math.PI) diff -= 6.283; while (diff < -Math.PI) diff += 6.283; const steer = Math.abs(diff) < 0.12 ? 0 : (diff > 0 ? 1 : -1);
  moveVehicle(v, Math.abs(diff) > 1.6 ? 0.2 : throttle, steer, dt);
  if (tg) {
    const ta = Math.atan2(tg.x - m.x, tg.z - m.z); let td = ta - v.tyaw; while (td > Math.PI) td -= 6.283; while (td < -Math.PI) td += 6.283; v.tyaw += clamp(td, -1.4 * dt, 1.4 * dt); if (v.turret) v.turret.rotation.y = v.tyaw - v.yaw; v.cannonCd -= dt; v.mgCd -= dt;
    const dd = dist2(m.x, m.z, tg.x, tg.z), aimed = Math.abs(td) < 0.2, API = A();
    if (d.cannon && v.cannonCd <= 0 && aimed && dd > 12) { v.cannonCd = 4.5; const dir = new THREE.Vector3(Math.sin(ta), 0.03 + dd * 0.0009, Math.cos(ta)).normalize(); const from = v.pos.clone().add(new THREE.Vector3(0, 2.4, 0)).addScaledVector(dir, 3); fireShell(v, from, dir.add(new THREE.Vector3(rnd(-0.02, 0.02), 0, rnd(-0.02, 0.02))).normalize(), mine); }
    else if (d.mg && v.mgCd <= 0 && aimed && dd < (d.static ? 78 : 55)) {
      v.mgCd = d.static ? 0.1 : 0.12; const a = R_AMMO['762_fmj'], from = v.pos.clone().add(new THREE.Vector3(0, d.static ? 1.2 : 2.2, 0)), tv = new THREE.Vector3(tg.x, 1.3, tg.z), hit = Math.random() < (d.static ? 0.38 * (BT.nmAcc || 1) : 0.3);
      API.sfxShot('762', clamp(1 - dist2(m.x, m.z, playerPos.x, playerPos.z) / 120, 0, 0.6)); API.addTracer(from, hit ? tv : tv.clone().add(new THREE.Vector3(rnd(-3, 3), rnd(-1, 1), rnd(-3, 3))), a.tracer, 0.05);
      if (hit) { const o = tg.obj;
        if (o === 'player') { if (R.veh) damageVehicle(R.veh, a.dmg * (VEH_RESIST[R.veh.kind] || 0.1), null); else API.hurtPlayer(a, ['chest', 'chest', 'stomach', 'legs', 'arms'][rint(0, 4)], 0.9, from); }
        else if (o.kind) damageVehicle(o, a.dmg * (VEH_RESIST[o.kind] || 0.1), null);
        else if (o.alive) { o.hp -= a.dmg; if (o.hp <= 0) botDie(o, mine === 'A' ? 'ally' : 'foe'); } }
    }
  }
}
function vehiclesUpdate(dt) {
  BT.vehicles.forEach(v => {
    if (!v.alive) { v.smokeT -= dt; if (v.smokeT <= 0) { v.smokeT = 0.25; A().burst(v.pos.clone().add(new THREE.Vector3(0, 1.6, 0)), 0x444444, 1, 1.4, 0.35, A().getFx().blood, -1.5); } if (BT.t >= v.respawnAt && v.respawnAt > 0) respawnVehicle(v); return; }
    if (v.occ === 'player') return;                       // driven by rdBattleDrive
    if (v.ai) vehicleAI(v, dt); else v.speed *= 1 - 1.5 * dt;
  });
}

// ───────────────────────── points, tickets, rules ─────────────────────────
function pointsUpdate(dt) {
  BT.pointT = (BT.pointT || 0) - dt; if (BT.pointT > 0) return; BT.pointT = 0.5;
  BT.points.forEach(p => {
    let nA = 0, nB = 0;
    const inside = (x, z) => dist2(x, z, p.x, p.z) < p.r;
    if (!R.dead && inside(playerPos.x, playerPos.z)) nA++; BT.allies.forEach(b => { if (b.alive && inside(b.mesh.position.x, b.mesh.position.z)) nA++; }); Object.values(remotePlayers).forEach(rp => { if (inside(rp.mesh.position.x, rp.mesh.position.z)) nA++; });
    enemies.forEach(b => { if (b.alive && inside(b.mesh.position.x, b.mesh.position.z)) nB++; });
    BT.vehicles.forEach(v => { if (v.alive && inside(v.pos.x, v.pos.z)) { if (v.team === 'A') nA += 2; else nB += 2; } });
    const before = p.own; p.own = clamp(p.own + (nA - nB) * 0.035, -1, 1);
    if (before < 0.99 && p.own >= 0.99) { kill(`🔵 ${p.name} point captured by YOUR team!`, 2600); BT.stats.captures++; } else if (before > -0.99 && p.own <= -0.99) kill(`🔴 ${p.name} point lost to the enemy!`, 2600);
    const col = p.own > 0.05 ? COL.A : p.own < -0.05 ? COL.B : 0xffffff; p.ring.material.color.setHex(col); p.ring.material.opacity = 0.2 + Math.abs(p.own) * 0.25; p.flag.material.color.setHex(col);
  });
  BT.drainT = (BT.drainT || 0) + 0.5; if (BT.drainT >= 5) { BT.drainT = 0; BT.points.forEach(p => { if (p.own >= 0.99) BT.B.tickets = Math.max(0, BT.B.tickets - 1); else if (p.own <= -0.99) BT.A.tickets = Math.max(0, BT.A.tickets - 1); }); }
}
function checkEnd() {
  if (BT.ended) return; let result = null;
  if (BT.B.tickets <= 0) result = 'win'; else if (BT.A.tickets <= 0) result = 'lose'; else if (BT.t >= BT.duration) result = BT.A.tickets > BT.B.tickets ? 'win' : BT.A.tickets < BT.B.tickets ? 'lose' : 'draw';
  if (result) endBattle(result);
}
// fill empty teammate slots with NPCs, remove NPCs when real players show up
function balanceTeam(dt) {
  BT.balT = (BT.balT || 0) - dt; if (BT.balT > 0) return; BT.balT = 3;
  const real = Object.keys(remotePlayers).length, want = Math.max(0, TEAM_A - 1 - real); BT.realTeammates = real;
  while (BT.allies.length < want) { const b = makeBot('A', MIX[(BT.allies.length + 3) % MIX.length], BT.allies.length); BT.allies.push(b); }
  while (BT.allies.length > want) { let k = -1, far = -1; BT.allies.forEach((b, i) => { const d = dist2(b.mesh.position.x, b.mesh.position.z, playerPos.x, playerPos.z); if (d > far) { far = d; k = i; } }); const b = BT.allies.splice(k, 1)[0]; scene.remove(b.mesh); kill('👥 A real player joined your team — one NPC slot freed', 2200); }
}
// ───────── player death / respawn ─────────
window.rdBattleDeath = function (reason) {
  if (BT.mode === 'nomercy' && window.rdNMFail) { window.rdNMFail(reason === 'mia' ? 'time' : 'died'); return; }      // No Mercy: one life
  if (reason === 'mia') { return; }                                   // the battle has its own clock
  if (R.dead || BT.ended) return; R.dead = true; BT.stats.deaths++; BT.A.tickets = Math.max(0, BT.A.tickets - 1); R.deadT = 6; if (R.veh) exitVehicle(true); R.use = null; R.reload = 0; fireHeld = false; R.adsHeld = false;
  document.exitPointerLock && document.pointerLockElement && document.exitPointerLock(); showDeath();
};
window.rdBattleKill = function (e, headshot) {                         // the player shot a soldier dead
  if (!e.alive) return; botDie(e, 'player'); R.kills++; BT.stats.score += headshot ? 15 : 10; const xp = headshot ? 14 : 10; R.xpGain += xp; userState.xp += xp; userState.kills++; try { checkLevelUp(); } catch (x) {}
  kill(`${e.team === 'B' ? '🔴' : '🔵'} ${e.d.name} killed${headshot ? ' — headshot' : ''}`, 1600); A().sfx.kill();
};
function giveKit() {
  const k = BT.kit, w = k.weaponId, g = R_GUN[w], pack = {};
  pack[k.ammo] = k.mags * g.mag; Object.keys(k.meds).forEach(id => pack[id] = k.meds[id]); Object.keys(k.nades).forEach(id => pack['gren:' + id] = k.nades[id]);
  R.pack = pack; R.vest = k.vest ? { id: k.vest, dur: R_ARMOR[k.vest].dur } : null; R.helmet = k.helmet ? { id: k.helmet, dur: R_ARMOR[k.helmet].dur } : null; R.bag = null;
  R.weaponId = w; R.startWeapon = w; R.ammoType = k.ammo; R.mods = {}; R.gs = rGunStats(w, R.mods); R.mode = g.mode === 'auto' ? 'auto' : 'semi';
  R.mag = Math.min(g.mag, R.pack[k.ammo]); R.pack[k.ammo] -= R.mag; R.nade = Object.keys(R.pack).find(id => id.startsWith('gren:')) || null; R.reload = 0; A().buildViewmodel();
}
function respawnPlayer(spawn) {
  R.dead = false; R.z = Object.assign({}, R_ZONES); R.bleed = 0; R.pain = 0; R.stamina = 100; R.buff = { speed: 0, regen: 0, regenT: 0, resist: 0, steady: 0 }; R.flashT = 0; R.smokes = []; R.nades = []; R.fires = [];
  giveKit(); A().syncHp(); playerPos.x = spawn.x; playerPos.z = spawn.z; yaw = spawn.z > 0 ? 0 : Math.PI; pitch = 0; $('btDead').style.display = 'none';
  if (renderer && !IS_TOUCH) renderer.domElement.requestPointerLock(); kill('✅ Deployed — fight!', 1500);
}
function showDeath() {
  const el = $('btDead'); el.style.display = 'flex'; el.dataset.t = 6;
  const owned = BT.points.filter(p => p.own >= 0.99), veh = BT.vehicles.filter(v => v.alive && v.team === 'A' && !v.occ);
  el.innerHTML = `<div style="font-size:30px;font-weight:900;color:#ff5544;letter-spacing:3px">ELIMINATED</div><div id="btDeadT" style="margin:6px 0 14px;color:#ddd">Respawn in 6…</div><div id="btSpawns" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"></div>`;
  const sp = $('btSpawns'); const add = (label, fn) => { const b = document.createElement('button'); b.className = 'rdBtnS'; b.textContent = label; b.onclick = () => { BT.chosen = fn; sp.querySelectorAll('button').forEach(x => x.style.outline = ''); b.style.outline = '2px solid #ff6a33'; }; sp.appendChild(b); return b; };
  add('🏠 Base', () => baseSpawn('A')).click(); owned.forEach(p => add('🚩 ' + p.name + ' point', () => ({ x: p.x + rnd(-6, 6), z: p.z + rnd(-6, 6) }))); void veh;
}
function deadTick(dt) {
  if (!R.dead) return; R.deadT -= dt; const t = $('btDeadT'); if (t) t.textContent = R.deadT > 0 ? 'Respawn in ' + Math.ceil(R.deadT) + '…' : 'Click to deploy!';
  camera.position.y = Math.max(0.5, camera.position.y - dt * 0.5);
  if (R.deadT <= 0 && !BT.ended) { respawnPlayer((BT.chosen || (() => baseSpawn('A')))()); }
}
// ───────── end of match + rewards ─────────
function endBattle(result) {
  BT.ended = true; R.on = false; R.over = true; inGame = false; if (document.pointerLockElement) document.exitPointerLock(); document.body.classList.remove('rdOn'); document.body.classList.remove('btOn');
  const st = BT.stats, xp = st.kills * 10 + st.captures * 40 + st.vehicles * 30 + (result === 'win' ? 150 : result === 'draw' ? 60 : 30), scrap = st.kills * 8 + st.captures * 25 + st.vehicles * 20 + (result === 'win' ? 120 : 20);
  userState.xp += xp; userState.scrap += scrap; try { checkLevelUp(); } catch (e) {} saveUserData();
  const el = $('btEnd'); el.style.display = 'flex'; const title = result === 'win' ? '🏆 VICTORY' : result === 'lose' ? '💀 DEFEAT' : '🤝 DRAW';
  el.innerHTML = `<div style="font-size:42px;font-weight:900;color:${result === 'win' ? '#7dffb0' : result === 'lose' ? '#ff5544' : '#ffd24a'}">${title}</div><div style="color:#9a8a80;margin:6px 0 14px">Tickets: your team ${BT.A.tickets} · enemy ${BT.B.tickets}</div>
   <div style="line-height:1.8;font-size:14px;text-align:left">Kills: <b>${st.kills}</b> · Deaths: <b>${st.deaths}</b> · Points captured: <b>${st.captures}</b> · Vehicles destroyed: <b>${st.vehicles}</b><br>Reward: <b>+${xp} XP</b> and <b>+${scrap} ⚙️ scrap</b> (no gear was at risk in this mode)</div><button class="rdBtnS go" id="btEndBtn" style="margin-top:20px">Back to menu</button>`;
  $('btEndBtn').onclick = () => { el.style.display = 'none'; cleanup(); goToMapSelect(); };
}
function cleanup() { BT.on = false; R.battle = false; R.dead = false; R.veh = null; camera.children.forEach(c => { c.visible = true; }); enemies = []; BT.allies = []; BT.vehicles = []; shells.length = 0; currentMapIndex = null; }

// ───────────────────────── HUD ─────────────────────────
function buildHud() {
  if ($('btHud')) return;
  const css = document.createElement('style'); css.textContent = `
  #btHud { position:fixed; inset:0; pointer-events:none; z-index:19; display:none; font-family:Arial,Helvetica,sans-serif; } body.btOn #btHud { display:block; } body.btOn #rdTimer, body.btOn #rdCompass { display:none; }
  #btTop { position:fixed; top:8px; left:50%; transform:translateX(-50%); display:flex; gap:10px; align-items:center; background:#000a; border-radius:10px; padding:6px 14px; color:#fff; font-weight:bold; font-size:14px; text-shadow:0 1px 3px #000; }
  .btTeam { min-width:92px; text-align:center; } .btPts { display:flex; gap:6px; } .btPt { width:22px; height:22px; border-radius:50%; border:2px solid #fff8; background:#888; display:flex; align-items:center; justify-content:center; font-size:11px; }
  #btVeh { position:fixed; bottom:18px; left:50%; transform:translateX(-50%); background:#000a; color:#fff; padding:8px 16px; border-radius:10px; font-size:13px; text-align:center; display:none; min-width:260px; } #btVehBar { height:8px; background:#333; border-radius:4px; overflow:hidden; margin:5px 0; } #btVehBar i { display:block; height:100%; background:linear-gradient(90deg,#ff4433,#ffd24a,#6cff8a); }
  #btDead { position:fixed; inset:0; background:#200a; display:none; flex-direction:column; align-items:center; justify-content:center; pointer-events:auto; z-index:30; color:#fff; }
  #btEnd { position:fixed; inset:0; background:#0a0a0cf2; display:none; flex-direction:column; align-items:center; justify-content:center; z-index:80; color:#e8e0d8; font-family:Arial,Helvetica,sans-serif; padding:20px; text-align:center; }
  #btPrompt { position:fixed; left:50%; top:70%; transform:translateX(-50%); color:#fff; font-weight:bold; text-shadow:0 1px 5px #000; font-size:15px; }
  #btLobby { position:fixed; inset:0; z-index:75; display:none; background:rgba(8,8,10,.96); color:#e8e0d8; overflow-y:auto; padding:20px 12px 60px; font-family:Arial,Helvetica,sans-serif; } #btLobby.active { display:block; }
  .btCls { cursor:pointer; } .btCls.sel { border-color:#ff6a33 !important; background:#241812 !important; }
  `; document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'btHud';
  hud.innerHTML = `<div id="btTop"><div class="btTeam" style="color:#7ab0ff">🔵 YOUR TEAM<br><span id="btTA">150</span> <small id="btAA"></small></div><div class="btPts"><div class="btPt" id="btP0">W</div><div class="btPt" id="btP1">C</div><div class="btPt" id="btP2">E</div></div><div class="btTeam" style="color:#ff8a7a">🔴 ENEMY<br><span id="btTB">150</span> <small id="btBA"></small></div><div id="btClock" style="margin-left:6px;font-size:12px;color:#cdbfb2"></div></div>
   <div id="btVeh"><b id="btVehName"></b><div id="btVehBar"><i></i></div><div id="btVehInfo" style="font-size:12px;color:#cdbfb2"></div></div><div id="btPrompt"></div><div id="btDead"></div>`;
  document.getElementById('gameScreen').appendChild(hud); const end = document.createElement('div'); end.id = 'btEnd'; document.body.appendChild(end);
}
function hudUpdate(dt) {
  BT.hudT = (BT.hudT || 0) - dt; if (BT.hudT > 0) return; BT.hudT = 0.12;
  if (BT.mode === 'nomercy' && window.rdNMHud) window.rdNMHud();
  $('btTA').textContent = BT.A.tickets; $('btTB').textContent = BT.B.tickets; const aliveA = BT.allies.filter(b => b.alive).length + (R.dead ? 0 : 1) + BT.realTeammates, aliveB = enemies.filter(b => b.alive).length;
  $('btAA').textContent = `(${aliveA}/${TEAM_A})`; $('btBA').textContent = `(${aliveB}/${TEAM_B})`; const left = Math.max(0, BT.duration - BT.t); $('btClock').textContent = '⏱ ' + Math.floor(left / 60) + ':' + String(Math.floor(left % 60)).padStart(2, '0') + ' · 👥 ' + BT.realTeammates + ' real';
  BT.points.forEach((p, i) => { const el = $('btP' + i); el.style.background = p.own > 0.05 ? '#2a6fe0' : p.own < -0.05 ? '#d8342a' : '#888'; el.style.opacity = 0.45 + Math.abs(p.own) * 0.55; });
  const v = R.veh; $('btVeh').style.display = v ? 'block' : 'none';
  if (v) { $('btVehName').textContent = v.def.emoji + ' ' + v.name; $('btVehBar').firstChild.style.width = Math.max(0, v.hp / v.maxHp * 100) + '%'; $('btVehInfo').textContent = v.def.cannon ? (v.cannonCd > 0 ? 'Cannon reloading ' + v.cannonCd.toFixed(1) + 's' : 'Cannon ready — click to fire') : 'Machine gun: hold click'; }
  let prompt = ''; if (!R.veh && !R.dead) { const nv = nearVehicle(); if (nv) prompt = `Press F to drive the ${nv.name}`; } else if (R.veh) prompt = ''; $('btPrompt').textContent = prompt;
}
function nearVehicle() { let best = null, bd = 6; BT.vehicles.forEach(v => { if (v.alive && !v.occ && v.team === 'A') { const d = dist2(v.pos.x, v.pos.z, playerPos.x, playerPos.z); if (d < bd) { bd = d; best = v; } } }); return best; }
document.addEventListener('keydown', e => { if (!BT.on || e.repeat) return; if (e.code === 'KeyF') { if (R.veh) exitVehicle(); else { const v = nearVehicle(); if (v) enterVehicle(v); } } });

// ───────────────────────── the per-frame tick (called by the raid loop in place of the old enemy AI) ─────────────────────────
const origTick = window.tickEnemyAI;
window.tickEnemyAI = function (dt) {
  if (!BT.on) return origTick(dt);
  if (BT.ended) return; BT.t += dt; R.t = BT.t;
  enemies.forEach(b => botUpdate(b, dt)); BT.allies.forEach(b => botUpdate(b, dt));
  vehiclesUpdate(dt); updateShells(dt);
  if (BT.mode === 'nomercy') { if (window.rdNMTick) window.rdNMTick(dt); hudUpdate(dt); return; }
  pointsUpdate(dt); balanceTeam(dt); deadTick(dt); hudUpdate(dt); checkEnd();
  // keep the shadow camera and presence happy while driving
};

// ───────────────────────── lobby + start ─────────────────────────
let lobbySel = { cls: 'assault', mine: false, diff: 1 };
async function countReal() { try { const r = await fetchWithTimeout(EXGUN_SERVER + '/api/exgun/presence?mapId=battle&exclude=' + encodeURIComponent(currentUser || ''), {}, 3500); if (!r.ok) return 0; const arr = await r.json(); return Array.isArray(arr) ? arr.length : 0; } catch (e) { return 0; } }
async function openLobby() {
  buildHud(); let lob = $('btLobby'); if (!lob) { lob = document.createElement('div'); lob.id = 'btLobby'; document.body.appendChild(lob); }
  lob.classList.add('active'); lob.innerHTML = '<div class="rdWrap"><h1>⚔️ TEAM BATTLE</h1><div style="color:#9a8a80">Looking for the server…</div></div>'; const real = await countReal();
  const mineW = weaponById(userState.equippedWeapon), mineOK = !!R_GUN[mineW.id];
  lob.innerHTML = `<div class="rdWrap"><div class="rdTop"><h1>⚔️ TEAM BATTLE</h1><button class="rdBtnS" id="btBack">← Back</button></div>
   <div class="rdCard" style="margin:10px 0;line-height:1.7">🖥️ <b>Battle server</b> — <span style="color:#7dffb0">${real} real player${real === 1 ? '' : 's'} online</span> (you would be joined by them on <b>your</b> team)<br>
   🔵 <b>Your team: ${TEAM_A}</b> (you${real ? ' + ' + real + ' real' : ''} + <b>${TEAM_A - 1 - real}</b> NPCs) &nbsp;vs&nbsp; 🔴 <b>Enemy: ${TEAM_B} NPCs</b><br>🚙 Each side has 2 jeeps, an armoured car and a tank. Capture the 3 points, drain the enemy's tickets.</div>
   <h2>CHOOSE YOUR CLASS</h2><div class="rdRow">${Object.keys(CLASSES).map(k => { const c = CLASSES[k]; return `<div class="rdCard btCls ${lobbySel.cls === k && !lobbySel.mine ? 'sel' : ''}" data-cls="${k}"><b>${c.emoji} ${c.name}</b><small>${weaponById(c.weapon).name}</small><small>${c.desc}</small></div>`; }).join('')}
   ${mineOK ? `<div class="rdCard btCls ${lobbySel.mine ? 'sel' : ''}" data-cls="mine"><b>🔫 My gun</b><small>${mineW.name}</small><small>Your equipped weapon with standard ammo</small></div>` : ''}</div>
   <h2>BOT SKILL</h2><div class="rdRow">${[['Easy', 0], ['Normal', 1], ['Hard', 2]].map(d => `<div class="rdCard btCls ${lobbySel.diff === d[1] ? 'sel' : ''}" data-diff="${d[1]}" style="flex:0 0 120px"><b>${d[0]}</b></div>`).join('')}</div>
   <div class="rdWarn" style="margin-top:14px">ℹ️ Everyone's computer runs its own soldiers and vehicles, so real teammates appear as teammates but you do not see exactly the same NPCs, and their shots do not hit your enemies. No gear is lost when you die here.</div>
   <div style="margin-top:18px;text-align:center"><button class="rdBtnS go" id="btJoin">⚔️ JOIN BATTLE</button></div></div>`;
  $('btBack').onclick = () => lob.classList.remove('active');
  lob.querySelectorAll('[data-cls]').forEach(el => el.onclick = () => { lobbySel.mine = el.dataset.cls === 'mine'; if (!lobbySel.mine) lobbySel.cls = el.dataset.cls; lob.querySelectorAll('[data-cls]').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); });
  lob.querySelectorAll('[data-diff]').forEach(el => el.onclick = () => { lobbySel.diff = parseInt(el.dataset.diff, 10); lob.querySelectorAll('[data-diff]').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); });
  $('btJoin').onclick = () => { lob.classList.remove('active'); startBattle(real); };
}
function startBattle(real) {
  if (window.rdAudioInit) window.rdAudioInit(); A().audioOn(); ensureRenderer(); A().buildHud(); buildHud(); clearMapScene(); A().clearFx();
  BT.on = true; BT.mode = 'battle'; BT.hpMul = 1; BT.nmAcc = 1; BT.nmPath = null; BT.ended = false; BT.t = 0; BT.A.tickets = 150; BT.B.tickets = 150; BT.diff = lobbySel.diff; BT.stats = { kills: 0, deaths: 0, captures: 0, vehicles: 0, roadkills: 0, score: 0 }; BT.chosen = null; BT.pointT = 0; BT.drainT = 0; BT.balT = 0;
  const c = CLASSES[lobbySel.cls]; let kit;
  if (lobbySel.mine) { const w = userState.equippedWeapon, g = R_GUN[w], ammo = R_CAL_DEFAULT[g.cal]; kit = { weaponId: w, ammo, mags: 8, meds: { bandage: 3, medkit: 1 }, nades: { frag_1: 2 }, vest: 'vest_g3_11', helmet: 'helm_g2_01' }; }
  else kit = { weaponId: c.weapon, ammo: c.ammo, mags: c.mags, meds: c.meds, nades: c.nades, vest: c.vest, helmet: c.helmet };
  BT.kit = kit;
  Object.assign(R, { on: true, over: false, battle: true, dead: false, veh: null, mapIndex: 25, t: 0, limit: BT.duration + 60, protect: true, containers: [], extracts: [], kills: 0, xpGain: 0, foundValue: 0, invOpen: false });
  R.diff = rDifficulty(25); buildBattleMap(); spawnVehicles(); spawnTeams(real);
  const sp = baseSpawn('A'); playerPos.x = sp.x; playerPos.z = sp.z; yaw = 0; pitch = 0; currentMapIndex = 'battle'; lastShotTime = -999;
  R.z = Object.assign({}, R_ZONES); R.bleed = 0; R.pain = 0; R.stamina = 100; R.buff = { speed: 0, regen: 0, regenT: 0, resist: 0, steady: 0 }; R.flashT = 0; R.nades = []; R.smokes = []; R.fires = []; R.use = null; R.hold = null;
  window.rdApplyLook(); scene.add(camera); giveKit(); A().syncHp();
  document.body.classList.add('rdOn', 'btOn'); document.getElementById('hudMapName').textContent = 'Team Battle'; inGame = true; showScreen('gameScreen'); userState.kills = userState.kills || 0;
  kill(`⚔️ Battle started — ${BT.diff === 0 ? 'Easy' : BT.diff === 2 ? 'Hard' : 'Normal'} bots. Capture the points 🚩 and use vehicles (F)!`, 5200);
}
// the button on the sector screen
(function addBtn() {
  const bar = document.querySelector('#mapSelectTop > div:last-child'); if (!bar || $('btOpenBtn')) return;
  const b = document.createElement('button'); b.className = 'msBtn'; b.id = 'btOpenBtn'; b.textContent = '⚔️ TEAM BATTLE'; b.style.background = 'linear-gradient(180deg,#3a6fe0,#2a4fb0)'; b.onclick = openLobby; bar.insertBefore(b, bar.firstChild);
})();
window.rdOpenBattle = openLobby; window.BTX = { BT, damageVehicle, explosion, enterVehicle, exitVehicle, startBattle, CLASSES, botDie, respawnPlayer, endBattle, lobbySel };
window.BTX.i = { makeBot, botUpdate, botDie, giveKit, addVehicle, damageVehicle, explosion, enterVehicle, exitVehicle, nearVehicle, cleanup, buildHud, kill, BOT_CLASSES, MIX, CLASSES, VEHICLES, VEH_RESIST, COL, rnd, rint, clamp, dist2, hitscan, vehicleRay, windowTexture, respawnPlayer, baseSpawn, hudUpdate };
})();
