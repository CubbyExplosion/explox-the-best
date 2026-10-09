// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — ☠️ NO MERCY  (assault a fortress; one life; the defenders show none)
//
//   12 fortress maps:  3 EASY (needs level 10)   4 MEDIUM (needs level 15)   5 HARD (needs level 20)
//   MISSION   break into the fortress and SEIZE THE COMMAND POST inside the keep (stand by the war table and hold E for 8 seconds). Killing the
//             WARLORD who guards it is optional but pays a 50% bonus. You have one life and 14–18 minutes. If you die or the time runs out, the mission fails.
//   FORTRESS  1–3 rings of high walls with a gate each (the gates are not lined up, so you have to fight your way across courtyards), corner towers,
//             barracks, a stone keep, fixed MG turrets, and 16–52 guards who hold their posts, come running when they hear shooting, and never give up.
//   YOUR SIDE easy maps give you a 4-soldier squad and vehicles (a tank, jeep or armoured car), medium maps a 2-soldier squad and a jeep, hard maps: you are alone.
//             Squad soldiers do not respawn. Supply crates (press F) refill your ammo, grenades and medicine.
//   REWARDS   XP, scrap and gear for the stash (armor, backpacks, attachments, even new guns). The harder the fortress, the better the gear.
//
// Built on the Team Battle engine (raid-battle.js): bots, vehicles (incl. the fixed turret), explosions, the kit/class system and the result screen.
// Like Team Battle, this is single-player: everything is simulated on your own computer.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const R = window.RAID, BT = window.BATTLE, $ = id => document.getElementById(id), I = () => window.BTX.i, A = () => window.RDX.api;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), rint = (a, b) => Math.floor(rnd(a, b + 1)), dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
const LEVEL_REQ = { easy: 10, medium: 15, hard: 20 };
const TIERS = {
  easy:   { label: 'EASY',   color: '#7dffb0', hpMul: 1.0,  acc: 1.0,  diff: 1, xp: 250,  scrap: 180,  time: 14, items: 3 },
  medium: { label: 'MEDIUM', color: '#ffd24a', hpMul: 1.15, acc: 1.12, diff: 2, xp: 600,  scrap: 420,  time: 16, items: 4 },
  hard:   { label: 'HARD',   color: '#ff5a44', hpMul: 1.35, acc: 1.3,  diff: 2, xp: 1400, scrap: 1000, time: 18, items: 5 }
};
const REWARD_ITEMS = {
  easy:   ['att:opt_red_2', 'att:mz_cmp_2', 'att:gr_v2', 'bandage_pro', 'gren:frag_1', 'bag_3', 'att:sd_l1', 'ifak'],
  medium: ['vest_g4_01', 'helm_g3_11', 'bag_6', 'att:opt_x4', 'att:mz_sup_2', 'stim_regen', 'surgical', 'wpn:smg_ump__tactical', 'wpn:rifle_ak74__tactical', 'att:mg_d1', 'gren:impact_1'],
  hard:   ['vest_g5_11', 'vest_g6_01', 'helm_g5_01', 'bag_10', 'bag_12', 'att:opt_x8', 'att:mz_sup_3', 'wpn:rifle_battle__elite', 'wpn:dmr_10__match', 'stim_combat', 'trauma', 'gren:frag_2', 'wpn:carbine_m4__proto', 'att:br_m3']
};
// 12 fortresses. S = half-size of the outer wall, rings = number of wall rings, theme = which EXGUN setting colours it, time = time of day
const MAPS = [
  { id: 1, tier: 'easy',   name: 'Border Outpost',      theme: 0,  time: 'morning',  S: 38, rings: 1, def: 16, elite: 2, turrets: 2, allies: 4, vehicles: ['tank', 'jeep'], wall: 0x8a857a, desc: 'A small guard post on the old border. One wall, one gate.' },
  { id: 2, tier: 'easy',   name: 'Desert Watchpost',    theme: 1,  time: 'noon',     S: 40, rings: 1, def: 18, elite: 2, turrets: 3, allies: 4, vehicles: ['tank', 'jeep'], wall: 0xc4a574, desc: 'Sandstone walls baking in the sun.' },
  { id: 3, tier: 'easy',   name: 'Forest Stockade',     theme: 3,  time: 'dawn',     S: 42, rings: 1, def: 20, elite: 3, turrets: 3, allies: 4, vehicles: ['apc'],          wall: 0x6b5a40, desc: 'A timber-and-stone stockade hidden in the trees.' },
  { id: 4, tier: 'medium', name: 'Stone Keep',          theme: 12, time: 'overcast', S: 52, rings: 2, def: 28, elite: 4, turrets: 5, allies: 2, vehicles: ['jeep'],         wall: 0x7d7f84, desc: 'Two rings of grey stone and a staggered inner gate.' },
  { id: 5, tier: 'medium', name: 'Arctic Redoubt',      theme: 2,  time: 'morning',  S: 54, rings: 2, def: 30, elite: 4, turrets: 5, allies: 2, vehicles: ['jeep'],         wall: 0xcfd9de, desc: 'Ice-crusted walls and a long white approach with no cover.' },
  { id: 6, tier: 'medium', name: 'Harbor Fort',         theme: 9,  time: 'golden',   S: 56, rings: 2, def: 32, elite: 5, turrets: 6, allies: 2, vehicles: ['jeep'],         wall: 0x5a6e78, desc: 'A sea fort with dock cranes and heavy turrets.' },
  { id: 7, tier: 'medium', name: 'Jungle Temple',       theme: 3,  time: 'dusk',     S: 52, rings: 2, def: 30, elite: 5, turrets: 5, allies: 2, vehicles: ['jeep'],         wall: 0x6f7a5a, desc: 'Overgrown temple walls, guards in the dusk.' },
  { id: 8, tier: 'hard',   name: 'Citadel of Ash',      theme: 8,  time: 'dusk',     S: 66, rings: 2, def: 40, elite: 8, turrets: 8, allies: 0, vehicles: [],               wall: 0x3a2a26, desc: 'A volcanic citadel. Ash, lava light, and no mercy.' },
  { id: 9, tier: 'hard',   name: 'Iron Bastion',        theme: 14, time: 'overcast', S: 68, rings: 3, def: 44, elite: 9, turrets: 9, allies: 0, vehicles: [],               wall: 0x4a5238, desc: 'A three-ring military bastion built to stop armies.' },
  { id: 10, tier: 'hard',  name: 'Ruined Palace',      theme: 0,  time: 'night',    S: 66, rings: 2, def: 42, elite: 8, turrets: 8, allies: 0, vehicles: [],               wall: 0x6a645c, desc: 'A burned palace. The guards own the night.' },
  { id: 11, tier: 'hard',  name: 'Mountain Fortress',  theme: 2,  time: 'dawn',     S: 70, rings: 3, def: 46, elite: 10, turrets: 10, allies: 0, vehicles: [],             wall: 0x7a7f86, desc: 'Cut into the mountainside: three rings, one road.' },
  { id: 12, tier: 'hard',  name: "The Warlord's Fortress", theme: 4, time: 'night', S: 76, rings: 3, def: 52, elite: 12, turrets: 12, allies: 0, vehicles: [],            wall: 0x2c2224, desc: 'The final fortress. Fifty-two guards, twelve guns, and the Warlord himself.' }
];
function done() { const r = window.RDUI.raidState(); if (!r.nm) r.nm = { done: {} }; return r.nm.done; }

// ───────────────────────── fortress builder ─────────────────────────
function buildFortress(m) {
  const S = m.S, th = TIERS[m.tier], H = S + 110, keepK = m.tier === 'hard' ? 16 : 13;
  BT.half = H; currentBuildings.length = 0;
  const T = themeForMap(m.theme), gcol = T.ground;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(H * 2 + 160, H * 2 + 160), new THREE.MeshStandardMaterial({ color: gcol, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(12, S + 130), new THREE.MeshStandardMaterial({ color: new THREE.Color(gcol).multiplyScalar(0.7), roughness: 1 })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.03, (S + 130) / 2 - 10); road.receiveShadow = true; scene.add(road);
  const wallM = new THREE.MeshStandardMaterial({ color: m.wall, roughness: 0.95 }), darkM = new THREE.MeshStandardMaterial({ color: new THREE.Color(m.wall).multiplyScalar(0.6), roughness: 1 });
  const add = (w, h, d, x, y, z, mat, aabb, low) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x, y, z); o.castShadow = !!aabb || h > 3; o.receiveShadow = true; scene.add(o); if (aabb) currentBuildings.push({ x, z, hw: w / 2, hd: d / 2, low: !!low }); return o; };
  const wall = (x0, z0, x1, z1, thick, h) => { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = Math.abs(x1 - x0) || thick, d = Math.abs(z1 - z0) || thick; add(w, h, d, cx, h / 2, cz, wallM, true);
    const len = Math.max(w, d), n = Math.floor(len / 3.2); for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; add(1.3, 1.3, 1.3, w > d ? x0 + (x1 - x0) * t : cx, h + 0.65, w > d ? cz : z0 + (z1 - z0) * t, darkM, false); } };
  const tower = (x, z, s, h) => { add(s, h, s, x, h / 2, z, wallM, true); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => add(1.8, 1.8, 1.8, x + c[0] * (s / 2 - 0.9), h + 0.9, z + c[1] * (s / 2 - 0.9), darkM, false));
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7, 6), new THREE.MeshStandardMaterial({ color: 0xcccccc })); pole.position.set(x, h + 3.5, z); scene.add(pole); const fl = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.9), new THREE.MeshStandardMaterial({ color: 0xb02a22, side: THREE.DoubleSide })); fl.position.set(x + 1.7, h + 5.8, z); scene.add(fl); };
  const GW = 12, rings = [], oxs = [0, 0.5, -0.5];
  for (let k = 0; k < m.rings; k++) {
    const Sk = Math.round(S * (1 - 0.38 * k)), ox = k === 0 ? 0 : Math.round(Sk * oxs[k] * (m.tier === 'hard' ? 1 : 0.8)), h = k === 0 ? 11 : 9.5;
    rings.push({ S: Sk, ox });
    wall(-Sk, Sk, ox - GW / 2, Sk, 3, h); wall(ox + GW / 2, Sk, Sk, Sk, 3, h); wall(-Sk, -Sk, Sk, -Sk, 3, h); wall(-Sk, -Sk, -Sk, Sk, 3, h); wall(Sk, -Sk, Sk, Sk, 3, h);
    [[-Sk, -Sk], [Sk, -Sk], [-Sk, Sk], [Sk, Sk]].forEach(c => tower(c[0], c[1], k === 0 ? 8 : 6.5, h + 5)); if (k === 0) { tower(0, -Sk, 7, h + 4); tower(-Sk, 0, 7, h + 4); tower(Sk, 0, 7, h + 4); }
    [ox - GW / 2 - 2.2, ox + GW / 2 + 2.2].forEach(px => add(4.4, h + 4, 4.4, px, (h + 4) / 2, Sk, wallM, true)); add(GW + 8, 1.2, 4, ox, h + 4.6, Sk, darkM, false);   // gate posts + a lintel (decoration, you walk through)
  }
  // the keep
  const K = keepK; wall(-K, K, -4, K, 2.4, 12); wall(4, K, K, K, 2.4, 12); wall(-K, -K, K, -K, 2.4, 12); wall(-K, -K, -K, K, 2.4, 12); wall(K, -K, K, K, 2.4, 12); wall(-K, 0, -6, 0, 1.6, 6); wall(6, 0, K, 0, 1.6, 6);
  add(K * 2 + 3, 0.6, K * 2 + 3, 0, 12.3, 0, darkM, false);                                                                    // roof slab (visual only)
  const table = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.0, 1.8), new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.8 })); table.position.set(0, 0.5, -K + 7); table.castShadow = true; scene.add(table);
  const obj = { x: 0, z: -K + 7 }; const beacon = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.12, 24), new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0.4 })); beacon.position.set(obj.x, 0.08, obj.z + 2.6); scene.add(beacon); obj.z += 2.6;
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), new THREE.MeshStandardMaterial({ color: 0xb02a22, side: THREE.DoubleSide })); flag.position.set(0, 3.4, -K + 7); scene.add(flag);
  // barracks, crates, barrels, sandbags
  const barM = new THREE.MeshStandardMaterial({ color: new THREE.Color(m.wall).lerp(new THREE.Color(0x55575a), 0.35), roughness: 0.95 });
  const tex = I().windowTexture('#' + new THREE.Color(m.wall).getHexString(), '#222a34'); tex.repeat.set(2, 1); barM.map = tex;
  const corridor = (x, z) => rings.some(r => Math.abs(x - r.ox) < 13 && Math.abs(z - r.S) < 18) || (Math.abs(x) < 12 && z > K - 2 && z < S + 4);
  const free = (x, z, hw, hd) => !corridor(x, z) && Math.abs(x) < S - 6 && Math.abs(z) < S - 6 && !(Math.abs(x) < K + 6 && Math.abs(z) < K + 6) && currentBuildings.every(b => Math.abs(x - b.x) > b.hw + hw + 2.5 && Math.abs(z - b.z) > b.hd + hd + 2.5) && !(m.rings > 1 && Math.abs(Math.abs(x) - rings[1].S) < 5 && Math.abs(z) < rings[1].S + 5) && !(m.rings > 1 && Math.abs(Math.abs(z) - rings[1].S) < 5 && Math.abs(x) < rings[1].S + 5);
  for (let i = 0, n = 0; n < 2 + m.rings * 2 && i < 300; i++) { const w = 9 + Math.random() * 4, d = 6 + Math.random() * 3, x = rnd(-S + 10, S - 10), z = rnd(-S + 10, S - 10); if (!free(x, z, w / 2, d / 2)) continue; n++; add(w, 5.5, d, x, 2.75, z, barM, true); add(w + 0.8, 0.5, d + 0.8, x, 5.75, z, darkM, false); }
  const crateM = new THREE.MeshStandardMaterial({ color: 0x7a5a32, roughness: 0.9 }), barrelM = new THREE.MeshStandardMaterial({ color: 0x3a5a4a, roughness: 0.6, metalness: 0.4 }), sandM = new THREE.MeshStandardMaterial({ color: 0x8a7a55, roughness: 1 });
  for (let i = 0, n = 0; n < 30 + m.rings * 12 && i < 600; i++) { const x = rnd(-S + 6, S - 6), z = rnd(-S + 6, S - 6); if (!free(x, z, 2, 2)) continue; n++; if (n % 3 === 0) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.2, 10), barrelM); b.position.set(x, 0.6, z); b.castShadow = true; scene.add(b); currentBuildings.push({ x, z, hw: 0.55, hd: 0.55, low: true }); } else if (n % 3 === 1) add(2, 1.8, 2, x, 0.9, z, crateM, true); else add(5, 1.1, 1.2, x, 0.55, z, sandM, true, true); }
  for (let i = 0, n = 0; n < 40 && i < 400; i++) { const x = rnd(-46, 46), z = rnd(S + 12, S + 62); if (Math.abs(x) < 8 && z < S + 70) continue; if (currentBuildings.some(b => Math.abs(x - b.x) < b.hw + 3 && Math.abs(z - b.z) < b.hd + 3)) continue; n++; if (n % 4 === 0) add(5.5, 1.9, 2.8, x, 0.95, z, new THREE.MeshStandardMaterial({ color: 0x3a3c3e, roughness: 0.8 }), true); else add(5, 1.1, 1.2, x, 0.55, z, sandM, true, true); }   // cover on the approach
  const rockM = new THREE.MeshStandardMaterial({ color: new THREE.Color(gcol).lerp(new THREE.Color(0x888888), 0.4), roughness: 1, flatShading: true });
  for (let i = 0; i < 60; i++) { const x = rnd(-H + 10, H - 10), z = rnd(-H + 10, H - 10); if (Math.abs(x) < S + 12 && Math.abs(z) < S + 12) continue; const r = new THREE.Mesh(new THREE.IcosahedronGeometry(rnd(0.8, 2.6), 0), rockM); r.position.set(x, 0.5, z); r.castShadow = true; scene.add(r); }
  // path for the attackers, supplies, spawn
  const path = [{ x: 0, z: S + 45 }, { x: 0, z: S + 10 }, { x: 0, z: S - 5 }, { x: 0, z: S - 14 }];
  for (let k = 1; k < m.rings; k++) { const r = rings[k]; path.push({ x: r.ox, z: r.S + 10 }, { x: r.ox, z: r.S - 5 }, { x: r.ox, z: r.S - 14 }); }
  path.push({ x: 0, z: K + 9 }, { x: 0, z: K - 2 }, { x: 0, z: -K + 9 });
  const supplies = [{ x: 8, z: S + 66 }, { x: -9, z: K + 6 }]; supplies.forEach(s => { const c = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.0), new THREE.MeshStandardMaterial({ color: 0x2f5a2f, roughness: 0.7 })); c.position.set(s.x, 0.5, s.z); c.castShadow = true; scene.add(c); const cross = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshBasicMaterial({ color: 0xffffff })); cross.position.set(s.x, 1.02, s.z); cross.rotation.x = -Math.PI / 2; scene.add(cross); s.t = 0; });
  return { S, K, rings, obj, path, supplies, spawn: { x: 0, z: S + 70 }, th };
}
function placeDefenders(m, F) {
  const S = F.S, K = F.K, posts = [];
  const g0 = F.rings[0], push = (x, z, cls) => posts.push({ x, z, cls });
  [[-9, S - 7, 'gunner'], [9, S - 7, 'gunner'], [-5, S - 13, 'rifle'], [5, S - 13, 'rifle']].forEach(p => push(g0.ox + p[0], p[1], p[2]));                 // gate guards
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => push(c[0] * (S - 9), c[1] * (S - 9), 'marks'));                                                   // tower guards
  for (let k = 1; k < m.rings; k++) { const r = F.rings[k]; push(r.ox - 8, r.S - 7, 'gunner'); push(r.ox + 8, r.S - 7, 'rifle'); push(r.ox, r.S - 15, 'smg'); [[-1, -1], [1, -1]].forEach(c => push(c[0] * (r.S - 8), c[1] * (r.S - 8), 'marks')); }
  [[-7, K - 3], [7, K - 3], [-9, 5], [9, 5], [-9, -K + 5], [9, -K + 5], [-4, -K + 3], [4, -K + 3]].forEach(p => push(p[0], p[1], 'smg'));              // inside the keep
  let tries = 0; while (posts.length < m.def && tries++ < 800) { const x = rnd(-S + 6, S - 6), z = rnd(-S + 6, S - 6); if (window.blockedAt(x, z) || (Math.abs(x) < K + 3 && Math.abs(z) < K + 3)) continue; push(x, z, ['rifle', 'rifle', 'smg', 'gunner', 'marks'][rint(0, 4)]); }
  posts.length = Math.min(posts.length, m.def); const th = TIERS[m.tier]; let eliteLeft = m.elite;
  enemies = [];
  posts.forEach((p, i) => { const inner = Math.abs(p.x) < K + 3 && Math.abs(p.z) < K + 3, el = eliteLeft > 0 && (inner || i % 4 === 0); if (el) eliteLeft--;
    const b = I().makeBot('B', p.cls, i, { x: p.x, z: p.z }, { guard: true, elite: el, hpMul: el ? 1.4 : 1, ac: undefined }); if (el) { b.ac += 1; b.acHead += 1; } b.mesh.rotation.y = rnd(0, 6.28); enemies.push(b); });
  // the Warlord
  const boss = I().makeBot('B', 'gunner', 900, { x: 0, z: -K + 4 }, { guard: true, boss: true, hpMul: m.tier === 'hard' ? 3.6 : m.tier === 'medium' ? 2.6 : 1.8, ac: 4, acHead: 3 }); boss.mesh.scale.setScalar(1.18); boss.d = Object.assign({}, boss.d, { acc: boss.d.acc * 1.15, sight: 75, gap: 0.09 }); enemies.push(boss); BT.nmBoss = boss;
  void th;
}
function placeTurrets(m, F) {
  const S = F.S, K = F.K, g0 = F.rings[0], spots = [[g0.ox - 17, S - 12], [g0.ox + 17, S - 12], [-S + 12, -S + 12], [S - 12, -S + 12], [-S + 12, S - 20], [S - 12, S - 20], [-S * 0.55, 0], [S * 0.55, 0], [0, -S + 10], [-K - 7, K + 4], [K + 7, K + 4], [0, K + 14]];
  for (let k = 1; k < m.rings; k++) { const r = F.rings[k]; spots.splice(2 + k, 0, [r.ox - 14, r.S - 11], [r.ox + 14, r.S - 11], [-(r.S - 8), 6], [r.S - 8, 6]); }
  let n = 0; for (const s of spots) { if (n >= m.turrets) break; if (window.blockedAt(s[0], s[1])) continue; I().addVehicle('turret', 'B', s[0], s[1], Math.PI, true); n++; }
}

// ───────────────────────── lobby ─────────────────────────
let sel = { map: null, cls: 'assault', mine: false };
function openLobby() {
  I().buildHud(); let lob = $('nmLobby'); if (!lob) { lob = document.createElement('div'); lob.id = 'nmLobby'; lob.className = 'rdScreen'; lob.style.zIndex = 76; document.body.appendChild(lob); }
  const lvl = userState.level || 1, d = done(), mineW = weaponById(userState.equippedWeapon), mineOK = !!R_GUN[mineW.id];
  const card = m => { const th = TIERS[m.tier], locked = lvl < LEVEL_REQ[m.tier];
    return `<div class="rdCard ${sel.map === m.id ? 'sel' : ''}" data-map="${m.id}" style="${locked ? 'opacity:.5;' : ''}cursor:${locked ? 'not-allowed' : 'pointer'}"><b>${m.id}. ${m.name}</b><small style="color:${th.color}">${th.label} · ${locked ? '🔒 Level ' + LEVEL_REQ[m.tier] : 'Level ' + LEVEL_REQ[m.tier] + '+'}</small><small>${m.desc}</small><small>${m.def} guards · ${m.turrets} turrets · ${m.rings} wall ring${m.rings > 1 ? 's' : ''} · ${m.allies ? m.allies + ' squad mates' : 'solo'}${m.vehicles.length ? ' · ' + m.vehicles.join(', ') : ''}</small>${d[m.id] ? '<small style="color:#7dffb0">✔ Completed</small>' : ''}</div>`; };
  lob.classList.add('active');
  lob.innerHTML = `<div class="rdWrap"><div class="rdTop"><div><h1>☠️ NO MERCY</h1><div style="color:#9a8a80;font-size:12px">Assault a fortress. One life. Seize the command post in the keep.</div></div><div><span class="rdCard" style="display:inline-block;min-width:0;flex:none">Your level: <b>${lvl}</b></span> <button class="rdBtnS" id="nmBack">← Back</button></div></div>
   <div class="rdWarn">☠️ <b>No mercy:</b> you have <b>one life</b> and a time limit. If you die or time runs out, the mission fails. Guards hear gunfire and come running; fixed turrets cover the gates. Press <b>F</b> at supply crates to refill. Hold <b>E</b> at the war table in the keep for 8 s to win.</div>
   <h2 style="color:${TIERS.easy.color}">EASY — needs level 10</h2><div class="rdRow">${MAPS.filter(m => m.tier === 'easy').map(card).join('')}</div>
   <h2 style="color:${TIERS.medium.color}">MEDIUM — needs level 15</h2><div class="rdRow">${MAPS.filter(m => m.tier === 'medium').map(card).join('')}</div>
   <h2 style="color:${TIERS.hard.color}">HARD — needs level 20</h2><div class="rdRow">${MAPS.filter(m => m.tier === 'hard').map(card).join('')}</div>
   <h2>CLASS</h2><div class="rdRow">${Object.keys(I().CLASSES).map(k => { const c = I().CLASSES[k]; return `<div class="rdCard btCls ${sel.cls === k && !sel.mine ? 'sel' : ''}" data-cls="${k}"><b>${c.emoji} ${c.name}</b><small>${weaponById(c.weapon).name}</small><small>${c.desc}</small></div>`; }).join('')}
   ${mineOK ? `<div class="rdCard btCls ${sel.mine ? 'sel' : ''}" data-cls="mine"><b>🔫 My gun</b><small>${mineW.name}</small></div>` : ''}</div>
   <div style="margin-top:18px;text-align:center"><button class="rdBtnS go" id="nmGo">☠️ START MISSION</button><div id="nmMsg" style="color:#ff8a7a;margin-top:8px;font-size:13px"></div></div></div>`;
  $('nmBack').onclick = () => lob.classList.remove('active');
  lob.querySelectorAll('[data-map]').forEach(el => el.onclick = () => { const m = MAPS[parseInt(el.dataset.map, 10) - 1]; if (lvl < LEVEL_REQ[m.tier]) { $('nmMsg').textContent = `🔒 ${m.name} needs level ${LEVEL_REQ[m.tier]} (you are level ${lvl}).`; return; } $('nmMsg').textContent = ''; sel.map = m.id; lob.querySelectorAll('[data-map]').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); });
  lob.querySelectorAll('[data-cls]').forEach(el => el.onclick = () => { sel.mine = el.dataset.cls === 'mine'; if (!sel.mine) sel.cls = el.dataset.cls; lob.querySelectorAll('[data-cls]').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); });
  $('nmGo').onclick = () => { if (!sel.map) { $('nmMsg').textContent = 'Pick a fortress first.'; return; } const m = MAPS[sel.map - 1]; if ((userState.level || 1) < LEVEL_REQ[m.tier]) { $('nmMsg').textContent = `🔒 Needs level ${LEVEL_REQ[m.tier]}.`; return; } lob.classList.remove('active'); start(m); };
}

// ───────────────────────── start ─────────────────────────
function start(m) {
  const th = TIERS[m.tier], api = A(); api.audioOn(); ensureRenderer(); api.buildHud(); I().buildHud(); clearMapScene(); api.clearFx();
  BT.on = true; BT.mode = 'nomercy'; BT.ended = false; BT.t = 0; BT.diff = th.diff; BT.hpMul = th.hpMul; BT.nmAcc = th.acc; BT.A.tickets = 99; BT.B.tickets = 999; BT.stats = { kills: 0, deaths: 0, captures: 0, vehicles: 0, roadkills: 0, score: 0 }; BT.realTeammates = 0; BT.nmMap = m; BT.nmBossDead = false; BT.nmProg = 0; BT.limit = th.time * 60; BT.chosen = null;
  const kit = sel.mine ? { weaponId: userState.equippedWeapon, ammo: R_CAL_DEFAULT[R_GUN[userState.equippedWeapon].cal], mags: 8, meds: { bandage: 3, medkit: 1 }, nades: { frag_1: 2 }, vest: 'vest_g3_11', helmet: 'helm_g2_01' } : (c => ({ weaponId: c.weapon, ammo: c.ammo, mags: c.mags, meds: c.meds, nades: c.nades, vest: c.vest, helmet: c.helmet }))(I().CLASSES[sel.cls]);
  BT.kit = kit;
  Object.assign(R, { on: true, over: false, battle: true, dead: false, veh: null, mapIndex: m.theme, t: 0, limit: BT.limit + 60, protect: true, containers: [], extracts: [], kills: 0, xpGain: 0, foundValue: 0, invOpen: false });
  R.diff = { id: 2, name: 'No Mercy ' + th.label, color: th.color, loot: 1, acc: 1, hp: 1 };
  const F = buildFortress(m); BT.nmF = F; BT.nmPath = F.path; BT.nmObj = F.obj; BT.nmSupplies = F.supplies;
  BT.vehicles.forEach(v => scene.remove(v.mesh)); BT.vehicles = []; enemies = []; BT.allies = [];
  placeDefenders(m, F); placeTurrets(m, F);
  for (let i = 0; i < m.allies; i++) { const b = I().makeBot('A', ['rifle', 'smg', 'rifle', 'marks'][i % 4], -1, { x: -6 + i * 4, z: F.spawn.z - 6 }); b.wp = 0; BT.allies.push(b); }
  m.vehicles.forEach((kind, i) => I().addVehicle(kind, 'A', (i ? 1 : -1) * 18, F.spawn.z + 4, Math.PI, false));
  playerPos.x = 0; playerPos.z = F.spawn.z; yaw = 0; pitch = 0; currentMapIndex = 'nm' + m.id; lastShotTime = -999; BT.lastShotSeen = lastShotTime;
  R.z = Object.assign({}, R_ZONES); R.bleed = 0; R.pain = 0; R.stamina = 100; R.buff = { speed: 0, regen: 0, regenT: 0, resist: 0, steady: 0 }; R.flashT = 0; R.nades = []; R.smokes = []; R.fires = []; R.use = null; R.hold = null;
  const prevT = window.RDSET.time; window.RDSET.time = m.time; window.rdApplyLook(); window.RDSET.time = prevT; scene.add(camera); I().giveKit(); api.syncHp();
  buildNmHud(); document.body.classList.add('rdOn', 'btOn', 'nmOn'); document.getElementById('hudMapName').textContent = m.name; inGame = true; showScreen('gameScreen');
  I().kill(`☠️ ${m.name} (${th.label}): fight through the gate, cross the courtyards and hold E at the war table in the keep. One life!`, 6500);
}
// ───────────────────────── per-frame ─────────────────────────
function alertNear(x, z, radius, until) { enemies.forEach(b => { if (b.alive && dist2(b.mesh.position.x, b.mesh.position.z, x, z) < radius) b.heard = { x, z, until: BT.t + (until || 8) }; }); }
window.rdNMTick = function (dt) {
  const m = BT.nmMap; if (!m || BT.ended) return;
  if (BT.t >= BT.limit) { window.rdNMFail('time'); return; }
  // gunfire draws guards (suppressors only carry 15 m)
  if (lastShotTime !== BT.lastShotSeen) { BT.lastShotSeen = lastShotTime; const g = R.gs, q = R_AMMO[R.ammoType]; alertNear(playerPos.x, playerPos.z, (g && g.suppressed) || (q && q.sub) ? 15 : 62, 9); }
  if (R.veh && fireHeld) alertNear(playerPos.x, playerPos.z, 80, 8);
  // the objective
  const o = BT.nmObj, near = !R.veh && dist2(playerPos.x, playerPos.z, o.x, o.z) < 4.2, holding = near && A().keysDown.E;
  if (holding) { if (BT.nmProg === 0) { alertNear(o.x, o.z, 400, 20); I().kill('🚨 ALARM! The guards know you are at the command post!', 3000); } BT.nmProg = Math.min(1, BT.nmProg + dt / 8); if (BT.nmProg >= 1) { win(); return; } }
  else BT.nmProg = Math.max(0, BT.nmProg - dt * 0.12);
  BT.nmNear = near;
  // supply crates
  BT.nmSupplies.forEach(s => { s.t = Math.max(0, s.t - dt); });
};
document.addEventListener('keydown', e => {
  if (!BT.on || BT.mode !== 'nomercy' || e.repeat || e.code !== 'KeyF' || R.veh || R.dead) return;
  const s = BT.nmSupplies.find(c => dist2(c.x, c.z, playerPos.x, playerPos.z) < 3.6); if (!s) return; if (s.t > 0) { I().kill('Supply crate is restocking (' + Math.ceil(s.t) + 's)', 1200); return; }
  const z = Object.assign({}, R.z), bleed = R.bleed; I().giveKit(); R.z = z; R.bleed = bleed; s.t = 20; A().sfx.loot(); I().kill('📦 Resupplied: ammo, grenades and medicine restored', 2200);
});
window.rdNMBossDown = function (how) { if (!BT.nmBossDead) { BT.nmBossDead = true; I().kill('👹 THE WARLORD IS DEAD! +50% reward if you take the command post', 4200); alertNear(0, 0, 0, 0); } };
window.rdNMHud = function () {
  const bar = $('nmBar'); if (!bar) return; const m = BT.nmMap, left = Math.max(0, BT.limit - BT.t), alive = enemies.filter(b => b.alive && !b.boss).length, squad = BT.allies.filter(b => b.alive).length, tur = BT.vehicles.filter(v => v.team === 'B' && v.alive).length;
  const o = BT.nmObj, d = Math.round(dist2(playerPos.x, playerPos.z, o.x, o.z)), th = TIERS[m.tier];
  $('nmTitle').innerHTML = `<b style="color:${th.color}">☠️ ${m.name}</b> · ${th.label}`;
  $('nmInfo').innerHTML = `⏱ ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')} &nbsp;·&nbsp; 🔴 Guards ${alive} &nbsp;·&nbsp; 🔫 Turrets ${tur} &nbsp;·&nbsp; 👹 Warlord ${BT.nmBossDead ? '<span style="color:#7dffb0">DEAD</span>' : 'alive'}${m.allies ? ' &nbsp;·&nbsp; 🔵 Squad ' + squad + '/' + m.allies : ''}`;
  $('nmObj').textContent = BT.nmProg > 0 ? `Seizing the command post… ${Math.round(BT.nmProg * 100)}% — hold E` : BT.nmNear ? 'Hold E to seize the command post' : `🎯 Objective: the war table in the keep (${d} m)`;
  $('nmProgFill').style.width = BT.nmProg * 100 + '%';
  const s = BT.nmSupplies.find(c => dist2(c.x, c.z, playerPos.x, playerPos.z) < 3.6 && !R.veh); if (s && !BT.nmProg) $('nmObj').textContent = s.t > 0 ? '📦 Restocking… ' + Math.ceil(s.t) + 's' : '📦 Press F to resupply';
};
function buildNmHud() {
  if ($('nmBar')) return; const css = document.createElement('style'); css.textContent = `body.nmOn #btTop { display:none !important; } #nmBar { position:fixed; top:8px; left:50%; transform:translateX(-50%); background:#000b; color:#fff; border-radius:10px; padding:7px 16px; text-align:center; font-size:13px; text-shadow:0 1px 3px #000; display:none; min-width:320px; } body.nmOn #nmBar { display:block; } #nmProg { height:7px; background:#333; border-radius:4px; overflow:hidden; margin-top:5px; } #nmProgFill { height:100%; background:#ffd24a; width:0; }`; document.head.appendChild(css);
  const d = document.createElement('div'); d.id = 'nmBar'; d.innerHTML = `<div id="nmTitle"></div><div id="nmInfo" style="margin:3px 0"></div><div id="nmObj" style="color:#ffd24a;font-weight:bold"></div><div id="nmProg"><div id="nmProgFill"></div></div>`; document.getElementById('gameScreen').appendChild(d);
}
// ───────────────────────── end of mission ─────────────────────────
function finish(result) {
  BT.ended = true; R.on = false; R.over = true; inGame = false; fireHeld = false; if (document.pointerLockElement) document.exitPointerLock(); document.body.classList.remove('rdOn', 'btOn', 'nmOn'); if (R.veh) { camera.children.forEach(c => { c.visible = true; }); }
  const m = BT.nmMap, th = TIERS[m.tier], st = BT.stats, el = $('btEnd'); let html = '';
  if (result === 'win') {
    const bonus = BT.nmBossDead ? 1.5 : 1, xp = Math.round((th.xp + st.kills * 5) * bonus), scrap = Math.round(th.scrap * bonus), n = th.items + (BT.nmBossDead ? 1 : 0), got = {};
    userState.xp += xp; userState.scrap += scrap; const r = window.RDUI.raidState(), pool = REWARD_ITEMS[m.tier];
    for (let i = 0; i < n; i++) { const id = pool[rint(0, pool.length - 1)]; got[id] = (got[id] || 0) + 1; }
    const lines = []; Object.keys(got).forEach(id => { const it = rItem(id), c = got[id];
      if (id.startsWith('wpn:')) { const wid = id.slice(4); if (!userState.ownedWeapons.includes(wid)) { userState.ownedWeapons.push(wid); lines.push(`🔫 NEW GUN: ${weaponById(wid).name}`); } else { const v = it.value * c; userState.scrap += v; lines.push(`🔫 Duplicate ${weaponById(wid).name} sold for ⚙️${v}`); } }
      else if (R_ARMOR[id]) { for (let k = 0; k < c; k++) r.gear.push({ id, dur: R_ARMOR[id].dur }); lines.push(`${it.emoji} ${it.name}${c > 1 ? ' ×' + c : ''} (added to your gear)`); }
      else { window.RDUI.stashAdd(id, c); lines.push(`${it.emoji} ${it.name}${c > 1 ? ' ×' + c : ''}`); } });
    done()[m.id] = true; try { checkLevelUp(); } catch (e) {} saveUserData();
    html = `<div style="font-size:42px;font-weight:900;color:#7dffb0">☠️ FORTRESS TAKEN</div><div style="color:#9a8a80;margin:6px 0 14px">${m.name} · ${th.label}${BT.nmBossDead ? ' · Warlord killed (+50%)' : ''}</div><div style="line-height:1.8;font-size:14px;text-align:left;max-width:460px">Kills: <b>${st.kills}</b> · Time: <b>${Math.floor(BT.t / 60)}:${String(Math.floor(BT.t % 60)).padStart(2, '0')}</b><br>Reward: <b>+${xp} XP</b> and <b>+${scrap} ⚙️ scrap</b><br><b>Spoils:</b><br>${lines.join('<br>') || '—'}</div>`;
  } else {
    const xp = st.kills * 5; userState.xp += xp; try { checkLevelUp(); } catch (e) {} saveUserData();
    html = `<div style="font-size:42px;font-weight:900;color:#ff5544">☠️ MISSION FAILED</div><div style="color:#9a8a80;margin:6px 0 14px">${result === 'time' ? 'Time ran out.' : 'You fell. They showed no mercy.'} · ${m.name} · ${th.label}</div><div style="line-height:1.8;font-size:14px">Kills: <b>${st.kills}</b> · Guards left: <b>${enemies.filter(b => b.alive).length}</b><br>Consolation: +${xp} XP</div>`;
  }
  el.style.display = 'flex'; el.innerHTML = html + `<button class="rdBtnS go" id="nmEndBtn" style="margin-top:20px">Back to menu</button>`;
  $('nmEndBtn').onclick = () => { el.style.display = 'none'; I().cleanup(); BT.mode = 'battle'; BT.nmMap = null; goToMapSelect(); };
}
function win() { finish('win'); }
window.rdNMFail = function (why) { if (BT.ended) return; R.dead = true; BT.stats.deaths++; finish(why); };

// ───────────────────────── the button ─────────────────────────
(function addBtn() {
  const bar = document.querySelector('#mapSelectTop > div:last-child'); if (!bar || $('nmOpenBtn')) return;
  const b = document.createElement('button'); b.className = 'msBtn'; b.id = 'nmOpenBtn'; b.textContent = '☠️ NO MERCY'; b.style.background = 'linear-gradient(180deg,#b02a22,#7a1a14)'; b.onclick = openLobby; bar.insertBefore(b, bar.firstChild);
})();
window.rdOpenNoMercy = openLobby; window.NMX = { MAPS, TIERS, LEVEL_REQ, start, finish, buildFortress, sel };
})();
