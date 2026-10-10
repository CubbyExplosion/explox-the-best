// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — ENDLESS  (🌊 ENDLESS button on the sector screen)
//   You and 99 NPC soldiers (100 on your side) hold the field against endless waves — 100 enemy soldiers per wave, no end.
//   Between waves you get a 12 s breather: your army is brought back up to 100, you are resupplied and healed. Every wave is a bit tougher
//   (more health, better aim, more elites, harder soldier types) and from wave 5 enemy vehicles join in. You have 3 lives — when you fall you
//   respawn at your base after 6 s, and when the lives run out the run is over. Every 5 waves you earn a ☢️ nuke (N). Survive as long as you can.
//   Rewards (XP + scrap) grow with every wave you survive. Built on the Team Battle engine; far soldiers are drawn as simple silhouettes so a
//   battle of 200 runs smoothly.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const BTX = window.BTX, BT = BTX.BT, R = window.RAID, I = () => BTX.i, $ = id => document.getElementById(id);
const sel = { cls: 'assault', mine: false };
const ARMY = 100, WAVE = 100, BREAK = 12, LIVES = 3, HALF = 125;

function openLobby() {
  I().buildHud(); let lob = $('enLobby'); if (!lob) { lob = document.createElement('div'); lob.id = 'enLobby'; lob.className = 'rdScreen'; lob.style.zIndex = 76; document.body.appendChild(lob); }
  const mineW = weaponById(userState.equippedWeapon), mineOK = !!R_GUN[mineW.id], best = (userState.raid && userState.raid.endlessBest) || 0;
  lob.classList.add('active');
  lob.innerHTML = `<div class="rdWrap"><div class="rdTop"><div><h1>🌊 ENDLESS</h1><div style="color:#9a8a80;font-size:12px">You + 99 soldiers vs endless waves of 100. How many waves can you hold?</div></div><div><span class="rdCard" style="display:inline-block;min-width:0;flex:none">🏆 Best wave: <b>${best}</b></span> <button class="rdBtnS" id="enBack">← Back</button></div></div>
   <div class="rdWarn">🌊 <b>Rules:</b> ${ARMY} on your side (you + ${ARMY - 1} NPCs) against <b>${WAVE} enemies every wave</b>, forever. 12 s break between waves: your army is refilled and you are resupplied. Waves get tougher; enemy vehicles from wave 5; a ☢️ nuke every 5 waves (N). You have <b>${LIVES} lives</b>. No gear is lost — you keep XP and scrap for every wave.</div>
   <h2>CLASS</h2><div class="rdRow">${Object.keys(I().CLASSES).map(k => { const c = I().CLASSES[k]; return `<div class="rdCard btCls ${sel.cls === k && !sel.mine ? 'sel' : ''}" data-cls="${k}"><b>${c.emoji} ${c.name}</b><small>${weaponById(c.weapon).name}</small><small>${c.desc}</small></div>`; }).join('')}
   ${mineOK ? `<div class="rdCard btCls ${sel.mine ? 'sel' : ''}" data-cls="mine"><b>🔫 My gun</b><small>${mineW.name}</small></div>` : ''}</div>
   <div style="margin-top:18px;text-align:center"><button class="rdBtnS go" id="enGo">🌊 START</button></div></div>`;
  $('enBack').onclick = () => lob.classList.remove('active');
  lob.querySelectorAll('[data-cls]').forEach(el => el.onclick = () => { sel.mine = el.dataset.cls === 'mine'; if (!sel.mine) sel.cls = el.dataset.cls; lob.querySelectorAll('[data-cls]').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); });
  $('enGo').onclick = () => { lob.classList.remove('active'); start(); };
}
function start() {
  const L = BTX.lobbySel; L.cls = sel.cls; L.mine = sel.mine; L.diff = 1; BT.half = HALF; BTX.startBattle(0);
  BT.mode = 'endless'; BT.duration = 99999; BT.A.tickets = 999; BT.B.tickets = 9999; BT.ended = false; R.limit = 99999 + 60; BT.nmAcc = 1; BT.hpMul = 1;
  BT.en = { wave: 0, queue: 0, spawned: 0, lives: LIVES, state: 'break', t: 5, over: false, nukes: 0, waveStart: 0, clearedAt: 0 };
  R.diff = { id: 2, name: 'Endless', color: '#4aa8ff', loot: 1, acc: 1, hp: 1 };
  enemies.forEach(b => scene.remove(b.mesh)); enemies = []; BT.allies.forEach(b => scene.remove(b.mesh)); BT.allies = []; BT.vehicles.forEach(v => scene.remove(v.mesh)); BT.vehicles = [];
  window.HOUSE3D.build({ endless: true }); buildBattlefield(); scene.add(camera); window.rdApplyLook(); playerPos.x = 0; playerPos.z = 15; yaw = Math.PI; pitch = 0; BT.covers = COVERS; BT.en.mortarT = 30; BT.en.ambT = 2; BT.en.insideT = 0; sky(); try { window.rdMergeMap(); } catch (e) { }
  const I_ = I(); [['jeep', 24, 22], ['jeep', 30, 22], ['apc', -26, 24], ['tank', -34, 24]].forEach(([k, x, z]) => I_.addVehicle(k, 'A', x, z, Math.PI, false));
  fillArmy(true); document.body.classList.add('hcOn'); ensureHud(); document.getElementById('hudMapName').textContent = 'Endless';
  I_.kill('🌊 ENDLESS — you and 99 soldiers vs waves of 100. Wave 1 starts in 5 seconds. Hold the line!', 6000);
}
function ensureHud() { if ($('enHud')) return; if (!$('hcHud')) { const css = document.createElement('style'); css.textContent = 'body.hcOn #btTop{display:none!important}'; document.head.appendChild(css); } const css2 = document.createElement('style'); css2.textContent = '#enHud{position:fixed;top:8px;left:50%;transform:translateX(-50%);background:#000b;color:#fff;border:1px solid #4aa8ff;border-radius:10px;padding:6px 16px;z-index:19;font:bold 14px Arial;text-shadow:0 1px 3px #000;text-align:center;display:none} body.hcOn #enHud{display:block} #enHud small{display:block;font-weight:normal;color:#cfe3ff;font-size:11.5px} #enBanner{position:fixed;top:30%;left:50%;transform:translateX(-50%);z-index:40;color:#fff;font:900 46px Arial;text-shadow:0 0 18px #4aa8ff,0 3px 6px #000;letter-spacing:4px;opacity:0;transition:opacity .5s;pointer-events:none;text-align:center}'; document.head.appendChild(css2); const h = document.createElement('div'); h.id = 'enHud'; document.body.appendChild(h); const b = document.createElement('div'); b.id = 'enBanner'; document.body.appendChild(b); }
function banner(t, ms) { const b = $('enBanner'); if (!b) return; b.textContent = t; b.style.opacity = '1'; clearTimeout(banner.t); banner.t = setTimeout(() => { b.style.opacity = '0'; }, ms || 2500); }
// build soldiers; big crowds use plain blocky bodies so they stay fast
function withBlocky(fn) { const keep = window.RDSET.smooth; window.RDSET.smooth = false; try { return fn(); } finally { window.RDSET.smooth = keep; } }
function spawnAlly(pos) { const cls = I().MIX[Math.floor(Math.random() * I().MIX.length)]; const b = I().makeBot('A', cls, -1, pos); BT.allies.push(b); return b; }
function fillArmy(first) {
  const need = ARMY - 1 - BT.allies.filter(b => b.alive).length; if (need <= 0) return; let n = 0;
  withBlocky(() => { for (let i = 0; i < need * 8 && n < need; i++) { const x = rnd(-38, 38), z = 16 + rnd(0, 34); if (window.blockedAt(x, z)) continue; spawnAlly({ x, z }); n++; } });
  if (!first && n) I().kill(`🛡️ ${n} reinforcements joined your army`, 2500);
}
function rnd(a, b) { return a + Math.random() * (b - a); }
// ───────── the battlefield: cover, wrecks, burning barrels ─────────
const COVERS = [];
function buildBattlefield() {
  COVERS.length = 0; const h = window.OW.h, S = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.9 }, o || {})), conc = S(0x8d8f8c, { roughness: 0.95 }), sand = S(0xb4a06c, { roughness: 1 }), rust = S(0x6a4a30, { roughness: 1, metalness: 0.4 }), ok = (x, z) => Math.hypot(x, z) > 24 && !(Math.abs(x) < 9 && z > 10 && z < 30) && !window.blockedAt(x, z);
  const put = (w, ht, d, x, z, mat, rot) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, ht, d), mat); m.position.set(x, ht / 2, z); m.rotation.y = rot || 0; m.castShadow = true; m.receiveShadow = true; scene.add(m); const rw = Math.abs(Math.cos(rot || 0)) * w + Math.abs(Math.sin(rot || 0)) * d, rd = Math.abs(Math.sin(rot || 0)) * w + Math.abs(Math.cos(rot || 0)) * d; h.col(x, z, rw, rd, false, 0.05); COVERS.push({ x, z }); return m; };
  for (let k = 0; k < 34; k++) {
    for (let t = 0; t < 12; t++) {
      const a = rnd(0, 6.2832), r = rnd(26, HALF - 22), x = Math.cos(a) * r, z = Math.sin(a) * r; if (!ok(x, z)) continue; const rot = rnd(0, 3.14), type = k % 4;
      if (type === 0) { put(3.2, 1.25, 0.8, x, z, conc, rot); put(3.2, 1.25, 0.8, x + Math.cos(rot) * 3.3, z - Math.sin(rot) * 3.3, conc, rot); }
      else if (type === 1) { for (let q = 0; q < 3; q++) put(2.4, 0.5 + (q % 2) * 0.45, 0.8, x + Math.cos(rot) * q * 2.5, z - Math.sin(rot) * q * 2.5, sand, rot); }
      else if (type === 2) { put(4.2, 1.0, 1.9, x, z, S([0x3d5a8a, 0x8a3d34, 0x5a5a5e][k % 3], { metalness: 0.5, roughness: 0.5 }), rot); const roof = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 1.7), S(0x20242a, { roughness: 0.3 })); roof.position.set(x, 1.35, z); roof.rotation.y = rot; scene.add(roof); }
      else { put(1.5, 1.2, 1.5, x, z, rust, rot); put(1.4, 1.1, 1.4, x + 1.7, z + 0.4, rust, rot + 0.4); put(1.3, 1.0, 1.3, x + 0.8, z - 1.5, rust, rot + 1); }
      break;
    }
  }
  for (let k = 0; k < 8; k++) { const a = rnd(0, 6.2832), r = rnd(30, HALF - 20), x = Math.cos(a) * r, z = Math.sin(a) * r; if (!ok(x, z)) continue; const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.0, 10), S(0x7a2a1a, { roughness: 0.6, metalness: 0.5 })); bar.position.set(x, 0.5, z); scene.add(bar); h.col(x, z, 0.8, 0.8, false, 0.05); const fl = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 7), new THREE.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })); fl.position.set(x, 1.4, z); fl.userData.keepMesh = true; scene.add(fl); PLUMES.push({ x, z, sprites: [], fl }); }
  for (let k = 0; k < 14; k++) { const a = rnd(0, 6.2832), r = rnd(34, HALF - 6), x = Math.cos(a) * r, z = Math.sin(a) * r; if (!ok(x, z)) continue; const s = rnd(1.2, 3), m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), S(0x6b6a66, { roughness: 1 })); m.position.set(x, s * 0.5, z); m.castShadow = true; scene.add(m); h.col(x, z, s * 1.4, s * 1.4, false, 0); COVERS.push({ x, z }); }
}
// ───────── smoke plumes from the burning barrels, ambient gunfire / explosions, enemy mortars ─────────
const PLUMES = []; let puffT = null;
function puffTex() { if (puffT) return puffT; const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return puffT = new THREE.CanvasTexture(c); }
function plumes(dt) {
  PLUMES.forEach(p => {
    if (Math.hypot(p.x - playerPos.x, p.z - playerPos.z) > 160) return; p.t = (p.t || 0) + dt; p.fl.scale.y = 0.8 + Math.random() * 0.5;
    if (p.t > 0.35 && p.sprites.length < 16) { p.t = 0; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex(), color: 0x2a2826, transparent: true, depthWrite: false, opacity: 0.6 })); sp.position.set(p.x, 1.6, p.z); sp.scale.setScalar(1.2); scene.add(sp); sp.userData.age = 0; p.sprites.push(sp); }
    for (let i = p.sprites.length - 1; i >= 0; i--) { const sp = p.sprites[i]; sp.userData.age += dt; const a = sp.userData.age; sp.position.y = 1.6 + a * 3.2; sp.position.x = p.x + Math.sin(a * 0.8 + p.x) * a * 0.5 + a * 0.6; sp.scale.setScalar(1.2 + a * 1.6); sp.material.opacity = Math.max(0, 0.6 * (1 - a / 7)); if (a > 7) { scene.remove(sp); sp.material.dispose(); p.sprites.splice(i, 1); } }
  });
}
function sky() { try { scene.background = new THREE.Color(0x7d8794); if (scene.fog) scene.fog.color.set(0x7d8794); } catch (e) { } }
function mortar() {
  const api = window.RDX.api, ally = BT.allies.filter(b => b.alive);
  const tgt = (Math.random() < 0.5 || !ally.length) ? { x: playerPos.x + rnd(-22, 22), z: playerPos.z + rnd(-22, 22) } : (a => ({ x: a.mesh.position.x + rnd(-6, 6), z: a.mesh.position.z + rnd(-6, 6) }))(ally[Math.floor(Math.random() * ally.length)]);
  if (Math.hypot(tgt.x, tgt.z) < 18) return; const ring = new THREE.Mesh(new THREE.RingGeometry(5.5, 7, 32), new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(tgt.x, 0.15, tgt.z); scene.add(ring);
  try { api.tone(1500, 1.7, 0.2, 'sine', 0, 450); } catch (e) { } I().kill('💥 Incoming mortar!', 1600);
  setTimeout(() => { scene.remove(ring); if (!R.on || BT.ended) return; try { api.blast(new THREE.Vector3(tgt.x, 0, tgt.z), { kind: 'frag', dmg: 140, radius: 7.5 }); } catch (e) { } BT.allies.forEach(b => { if (b.alive && Math.hypot(b.mesh.position.x - tgt.x, b.mesh.position.z - tgt.z) < 7.5) I().botDie(b, 'foe'); }); }, 1700);
}
function ambience(dt) {
  const E = BT.en; E.ambT -= dt;
  if (E.ambT <= 0) { E.ambT = rnd(0.25, 0.8); try { window.RDX.api.sfxShot(Math.random() < 0.5 ? '556' : '762', rnd(0.04, 0.12), 0); } catch (e) { } if (Math.random() < 0.06) try { window.RDX.api.noise(1.2, 900, 80, rnd(0.1, 0.25), 'lowpass'); } catch (e) { } }
  E.mortarT -= dt; if (E.wave >= 2 && E.mortarT <= 0) { E.mortarT = rnd(18, 32) / Math.min(2, 1 + E.wave * 0.1); mortar(); }
}
// ───────── inside the house the world freezes: no enemies, no waves, no loading — and you recover ─────────
window.rdENFrozen = function (dt) {
  const E = BT.en; if (!E || E.over) return false; const inside = !R.dead && Math.abs(playerPos.x) < 16.2 && Math.abs(playerPos.z) < 10.1;
  if (inside !== !!E.frozen) {
    E.frozen = inside; const set = v => { enemies.forEach(b => { if (b.mesh) b.mesh.visible = v; }); BT.allies.forEach(b => { if (b.mesh) b.mesh.visible = v; }); BT.vehicles.forEach(x => { if (x.mesh) x.mesh.visible = v; }); }; set(!inside);
    if (inside) { I().kill('🏠 Safe inside your house — the battle is frozen. You recover here.', 2600); E.insideT = 0; } else I().kill('⚔️ Back outside — the battle resumes!', 1800);
  }
  if (inside) { E.insideT += dt; R.z = Object.keys(R.z).reduce((o, k) => { o[k] = Math.min(R_ZONES[k], R.z[k] + dt * 14); return o; }, {}); R.bleed = 0; R.stamina = Math.min(100, R.stamina + dt * 30); if (E.insideT > 4 && !E.resup) { E.resup = true; try { I().giveKit(); } catch (e) { } window.RDX.api.syncHp && window.RDX.api.syncHp(); } }
  else E.resup = false;
  return inside;
};

function spawnEnemyBatch(k) {
  const W = BT.en.wave, hp = 1 + 0.07 * (W - 1), acc = 1 + 0.035 * (W - 1), pElite = Math.min(0.5, 0.05 + W * 0.02), pHeavy = Math.min(0.5, W * 0.03);
  withBlocky(() => { for (let i = 0; i < k && BT.en.queue > 0; i++) {
    const a = rnd(0, 6.2832), rr = HALF - 14 + rnd(-6, 4), x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (Math.abs(x) > HALF - 5 || Math.abs(z) > HALF - 5 || window.blockedAt(x, z)) continue; const r = Math.random(), cls = r < pHeavy * 0.5 ? 'gunner' : r < pHeavy ? 'marks' : I().MIX[Math.floor(Math.random() * I().MIX.length)], el = Math.random() < pElite;
    const b = I().makeBot('B', cls, -1, { x, z }, { hpMul: hp * (el ? 1.4 : 1), elite: el, ac: el ? (I().BOT_CLASSES[cls].ac || 0) + 1 : undefined }); b.alertT = 10; b._accMul = acc; enemies.push(b); BT.en.queue--; BT.en.spawned++; } });
  BT.nmAcc = 1 + 0.035 * (W - 1);
}
function startWave() {
  const E = BT.en; E.wave++; E.queue = WAVE; E.spawned = 0; E.state = 'fight'; E.waveStart = BT.t; E.batchT = 0;
  enemies = enemies.filter(b => b.alive || (scene.remove(b.mesh), false));
  if (E.wave > 1 && E.wave % 5 === 1 && E.wave > 1) { E.nukes = (E.nukes || 0) + 1; I().kill('☢️ You earned a nuke for surviving 5 waves — aim and press N', 4500); }
  if (E.wave >= 5 && (E.wave % 2 === 1)) { const kinds = ['jeep', 'apc', 'tank'], kk = kinds[Math.min(2, Math.floor((E.wave - 5) / 4))], n = Math.min(3, 1 + Math.floor((E.wave - 5) / 6)); for (let i = 0; i < n; i++) I().addVehicle(kk, 'B', -30 + i * 30, -(HALF - 14), 0, true); }
  banner('🌊 WAVE ' + E.wave, 3000); I().kill(`🌊 WAVE ${E.wave}: ${WAVE} enemies incoming — soldiers ${E.wave > 1 ? 'are tougher' : 'attack'}!`, 3500);
}
window.rdENTick = function (dt) {
  const E = BT.en; if (!E || E.over) return; ambience(dt); plumes(dt);
  if (R.dead) { E.deadT = (E.deadT === undefined ? 6 : E.deadT) - dt; const el = $('btDead'); if (el && E.lives > 0) el.innerHTML = `<div style="font-size:30px;font-weight:900;color:#ff5544;letter-spacing:3px">YOU FELL</div><div style="margin:8px 0;color:#ddd">${E.lives} li${E.lives === 1 ? 'fe' : 'ves'} left · respawn in ${Math.max(0, Math.ceil(E.deadT))}…</div>`; if (E.deadT <= 0 && E.lives > 0) { E.deadT = undefined; I().respawnPlayer(I().baseSpawn('A')); } }
  if (E.state === 'break') { E.t -= dt; if (E.t <= 0) startWave(); return; }
  E.batchT -= dt; if (E.batchT <= 0 && E.queue > 0) { E.batchT = 0.45; spawnEnemyBatch(10); }
  E.cT = (E.cT || 0) - dt; if (E.cT <= 0) { E.cT = 2; enemies = enemies.filter(b => { if (b.alive) return true; if (b._dd === undefined) b._dd = BT.t; if (BT.t - b._dd > 8) { scene.remove(b.mesh); return false; } return true; }); BT.allies = BT.allies.filter(b => { if (b.alive) return true; if (b._dd === undefined) b._dd = BT.t; if (BT.t - b._dd > 8) { scene.remove(b.mesh); return false; } return true; }); }
  const alive = enemies.filter(b => b.alive).length;
  if (E.queue <= 0 && alive === 0) {                                                       // wave cleared
    E.state = 'break'; E.t = BREAK; banner(`✅ WAVE ${E.wave} CLEARED`, 3500); I().kill(`✅ Wave ${E.wave} cleared! ${BREAK} s to regroup — your army is being refilled`, 4000);
    withBlocky(() => fillArmy(false)); try { I().giveKit(); const el = $('btDead'); if (R && !R.dead) { R.z = Object.assign({}, R_ZONES); R.bleed = 0; R.stamina = 100; } void el; } catch (e) { }
    window.RDX.api.syncHp && window.RDX.api.syncHp(); try { userState.raid = userState.raid || {}; userState.raid.endlessBest = Math.max(userState.raid.endlessBest || 0, E.wave); } catch (e) { }
  }
};
window.rdENHud = function () {
  const h = $('enHud'), E = BT.en; if (!h || !E) return; const alive = enemies.filter(b => b.alive).length, ally = BT.allies.filter(b => b.alive).length + (R.dead ? 0 : 1);
  h.innerHTML = E.frozen ? `🏠 INSIDE THE HOUSE — battle frozen · you are recovering<small>🌊 wave ${Math.max(1, E.wave)} · 🛡️ army ${ally}/${ARMY} · ❤️ lives ${E.lives}</small>` : `🌊 WAVE ${Math.max(1, E.wave)} — ${E.state === 'break' ? '<span style="color:#7dffb0">next wave in ' + Math.ceil(E.t) + 's</span>' : 'enemies left <span style="color:#ff8a6a">' + (alive + E.queue) + '</span>/' + WAVE}<small>🛡️ your army ${ally}/${ARMY} · ❤️ lives ${E.lives} · kills ${BT.stats.kills} · ☢️ nukes ${E.nukes || 0}</small>`;
};
window.rdENDeath = function (reason) {
  const E = BT.en; if (!E || E.over || R.dead || BT.ended) return; if (reason === 'mia') return; R.dead = true; BT.stats.deaths++; E.lives--; E.deadT = 6; R.use = null; R.reload = 0; fireHeld = false; R.adsHeld = false; if (R.veh) I().exitVehicle(true);
  if (document.pointerLockElement) document.exitPointerLock(); const el = $('btDead'); if (el) { el.style.display = 'flex'; el.dataset.t = 6; } if (E.lives <= 0) setTimeout(() => finish(), 2200);
};
function finish() {
  const E = BT.en; if (!E || E.over) return; E.over = true; BT.ended = true; R.on = false; R.over = true; inGame = false; if (document.pointerLockElement) document.exitPointerLock(); document.body.classList.remove('rdOn', 'btOn', 'hcOn'); const dd = $('btDead'); if (dd) dd.style.display = 'none';
  const waves = Math.max(0, E.wave - (E.state === 'fight' ? 1 : 0)), k = BT.stats.kills, xp = waves * 90 + k * 4, scrap = waves * 110 + k * 3; userState.xp += xp; userState.scrap += scrap; try { checkLevelUp(); } catch (e) { } userState.raid = userState.raid || {}; const newBest = waves > (userState.raid.endlessBest || 0); userState.raid.endlessBest = Math.max(userState.raid.endlessBest || 0, waves); saveUserData();
  const el = $('btEnd'); el.style.display = 'flex'; el.innerHTML = `<div style="font-size:40px;font-weight:900;color:#ff5544">💀 YOUR ARMY FELL</div><div style="color:#9a8a80;margin:6px 0 14px">Endless${newBest ? ' · 🏆 NEW BEST' : ''}</div><div style="line-height:1.8;font-size:15px;text-align:left">Waves survived: <b>${waves}</b><br>Soldiers killed by you: <b>${k}</b><br>Reward: <b>+${xp} XP</b> and <b>+${scrap} ⚙️ scrap</b></div><button class="rdBtnS go" id="enEndBtn" style="margin-top:18px">Continue</button>`;
  $('enEndBtn').onclick = () => { el.style.display = 'none'; I().cleanup(); BT.en = null; BT.half = 190; BT.mode = 'battle'; goToMapSelect(); };
}
function addBtn() { const bar = document.querySelector('#mapSelectTop > div:last-child'); if (!bar || $('enBtn')) return; const b = document.createElement('button'); b.className = 'msBtn'; b.id = 'enBtn'; b.style.cssText = 'background:linear-gradient(#2f7ad0,#1b4a8a);color:#fff;border-color:#4aa8ff'; b.textContent = '🌊 ENDLESS'; b.onclick = openLobby; bar.insertBefore(b, bar.firstChild); }
addBtn(); document.addEventListener('DOMContentLoaded', addBtn); setTimeout(addBtn, 400); setTimeout(addBtn, 1500); setInterval(addBtn, 3000);
window.rdOpenEndless = openLobby; window.ENX = { start, finish };
})();
