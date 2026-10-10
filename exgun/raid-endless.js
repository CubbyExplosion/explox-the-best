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
const ARMY = 100, WAVE = 100, BREAK = 12, LIVES = 3, HALF = 270;

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
  const I_ = I(); [['jeep', -30], ['jeep', -16], ['apc', 16], ['tank', 32]].forEach(([k, x]) => I_.addVehicle(k, 'A', x, HALF - 40, Math.PI, false));
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
  withBlocky(() => { for (let i = 0; i < need * 8 && n < need; i++) { const x = rnd(-70, 70), z = HALF - 25 - rnd(0, 30); if (window.blockedAt(x, z)) continue; spawnAlly({ x, z }); n++; } });
  if (!first && n) I().kill(`🛡️ ${n} reinforcements joined your army`, 2500);
}
function rnd(a, b) { return a + Math.random() * (b - a); }
function spawnEnemyBatch(k) {
  const W = BT.en.wave, hp = 1 + 0.07 * (W - 1), acc = 1 + 0.035 * (W - 1), pElite = Math.min(0.5, 0.05 + W * 0.02), pHeavy = Math.min(0.5, W * 0.03);
  withBlocky(() => { for (let i = 0; i < k && BT.en.queue > 0; i++) {
    const x = rnd(-HALF + 30, HALF - 30), z = -(HALF - 24) + rnd(-8, 22); if (window.blockedAt(x, z)) continue; const r = Math.random(), cls = r < pHeavy * 0.5 ? 'gunner' : r < pHeavy ? 'marks' : I().MIX[Math.floor(Math.random() * I().MIX.length)], el = Math.random() < pElite;
    const b = I().makeBot('B', cls, -1, { x, z }, { hpMul: hp * (el ? 1.4 : 1), elite: el, ac: el ? (I().BOT_CLASSES[cls].ac || 0) + 1 : undefined }); b.alertT = 10; b._accMul = acc; enemies.push(b); BT.en.queue--; BT.en.spawned++; } });
  BT.nmAcc = 1 + 0.035 * (W - 1);
}
function startWave() {
  const E = BT.en; E.wave++; E.queue = WAVE; E.spawned = 0; E.state = 'fight'; E.waveStart = BT.t; E.batchT = 0;
  enemies = enemies.filter(b => b.alive || (scene.remove(b.mesh), false));
  if (E.wave > 1 && E.wave % 5 === 1 && E.wave > 1) { E.nukes = (E.nukes || 0) + 1; I().kill('☢️ You earned a nuke for surviving 5 waves — aim and press N', 4500); }
  if (E.wave >= 5 && (E.wave % 2 === 1)) { const kinds = ['jeep', 'apc', 'tank'], kk = kinds[Math.min(2, Math.floor((E.wave - 5) / 4))], n = Math.min(3, 1 + Math.floor((E.wave - 5) / 6)); for (let i = 0; i < n; i++) I().addVehicle(kk, 'B', -40 + i * 30, -(HALF - 40), 0, true); }
  banner('🌊 WAVE ' + E.wave, 3000); I().kill(`🌊 WAVE ${E.wave}: ${WAVE} enemies incoming — soldiers ${E.wave > 1 ? 'are tougher' : 'attack'}!`, 3500);
}
window.rdENTick = function (dt) {
  const E = BT.en; if (!E || E.over) return;
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
  h.innerHTML = `🌊 WAVE ${Math.max(1, E.wave)} — ${E.state === 'break' ? '<span style="color:#7dffb0">next wave in ' + Math.ceil(E.t) + 's</span>' : 'enemies left <span style="color:#ff8a6a">' + (alive + E.queue) + '</span>/' + WAVE}<small>🛡️ your army ${ally}/${ARMY} · ❤️ lives ${E.lives} · kills ${BT.stats.kills} · ☢️ nukes ${E.nukes || 0}</small>`;
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
