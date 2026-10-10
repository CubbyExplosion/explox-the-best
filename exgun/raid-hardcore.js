// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — HARDCORE  (☠️ HARDCORE button on the sector screen)
//   You, alone, against an army. One life. The whole army knows where you are and marches at you; enemy vehicles hunt you down.
//   Four levels:   HARDCORE   50 NPCs ·  2 vehicles            MEDIUM   200 NPCs ·  4 vehicles
//                  HARD      500 NPCs ·  6 vehicles            BREATHTAKING  1000 NPCs · 10 vehicles
//   Vehicles are split between the sides (a jeep, armoured car or tank on your side to drive with F, the rest hunt you).
//   To keep it playable the army arrives in waves: only a limited number are on the field at once and the rest march in from the edges as
//   soldiers fall (the counter shows everybody left). Big levels use simple blocky soldiers so a crowd of 100+ runs smoothly.
//   Win by killing every last NPC. Die or run out of time and the mission fails (no gear is lost, you keep XP/scrap for kills).
// Built on the Team Battle engine (raid-battle.js), like No Mercy.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const BTX = window.BTX, BT = BTX.BT, R = window.RAID, I = () => BTX.i, $ = id => document.getElementById(id);
const TIERS = [
  { id: 'hardcore', label: 'HARDCORE', emoji: '☠️', color: '#ff9a3a', npcs: 50, veh: 2, half: 190, cap: 50, minutes: 15, hp: 1.0, acc: 0.9, xp: 400, scrap: 500, note: 'You vs 50 soldiers and 2 vehicles.' },
  { id: 'medium', label: 'MEDIUM', emoji: '💀', color: '#ff6a33', npcs: 200, veh: 4, half: 205, cap: 70, minutes: 25, hp: 1.0, acc: 1.0, xp: 1200, scrap: 1500, note: '200 soldiers, 4 vehicles. They keep coming.' },
  { id: 'hard', label: 'HARD', emoji: '🔥', color: '#ff3a3a', npcs: 500, veh: 6, half: 235, cap: 90, minutes: 35, hp: 1.1, acc: 1.1, xp: 3000, scrap: 3500, note: '500 tougher soldiers, 6 vehicles.' },
  { id: 'breath', label: 'BREATHTAKING', emoji: '🌋', color: '#c46aff', npcs: 1000, veh: 10, half: 265, cap: 120, minutes: 50, hp: 1.15, acc: 1.15, xp: 8000, scrap: 9000, note: '1000 soldiers and 10 vehicles. Good luck.' }
];
const sel = { tier: 0, cls: 'assault', mine: false };
const PLAYER_VEH = ['jeep', 'tank', 'apc', 'jeep', 'tank'], ENEMY_VEH = ['jeep', 'tank', 'apc', 'tank', 'apc'];

function openLobby() {
  I().buildHud(); let lob = $('hcLobby'); if (!lob) { lob = document.createElement('div'); lob.id = 'hcLobby'; lob.className = 'rdScreen'; lob.style.zIndex = 76; document.body.appendChild(lob); }
  const mineW = weaponById(userState.equippedWeapon), mineOK = !!R_GUN[mineW.id];
  lob.classList.add('active');
  lob.innerHTML = `<div class="rdWrap"><div class="rdTop"><div><h1>☠️ HARDCORE</h1><div style="color:#9a8a80;font-size:12px">You alone against an army. One life. Kill every last one.</div></div><button class="rdBtnS" id="hcBack">← Back</button></div>
   <div class="rdWarn">☠️ <b>Hardcore rules:</b> one life and a time limit. The enemy always knows where you are and marches at you; their vehicles hunt you. Press <b>F</b> near your vehicles to drive them. Big armies arrive in waves from the map edges. No gear is lost if you fail.</div>
   <h2>CHOOSE YOUR WAR</h2><div class="rdRow">${TIERS.map((t, i) => `<div class="rdCard btCls ${sel.tier === i ? 'sel' : ''}" data-tier="${i}"><b style="color:${t.color}">${t.emoji} ${t.label}</b><small><b>${t.npcs}</b> NPCs · <b>${t.veh}</b> vehicles</small><small>${t.note}</small><small>⏱ ${t.minutes} min · reward up to +${t.xp} XP / +${t.scrap} ⚙️</small></div>`).join('')}</div>
   <h2>CLASS</h2><div class="rdRow">${Object.keys(I().CLASSES).map(k => { const c = I().CLASSES[k]; return `<div class="rdCard btCls ${sel.cls === k && !sel.mine ? 'sel' : ''}" data-cls="${k}"><b>${c.emoji} ${c.name}</b><small>${weaponById(c.weapon).name}</small><small>${c.desc}</small></div>`; }).join('')}
   ${mineOK ? `<div class="rdCard btCls ${sel.mine ? 'sel' : ''}" data-cls="mine"><b>🔫 My gun</b><small>${mineW.name}</small></div>` : ''}</div>
   <div style="margin-top:18px;text-align:center"><button class="rdBtnS go" id="hcGo">☠️ START WAR</button></div></div>`;
  $('hcBack').onclick = () => lob.classList.remove('active');
  lob.querySelectorAll('[data-tier]').forEach(el => el.onclick = () => { sel.tier = parseInt(el.dataset.tier, 10); lob.querySelectorAll('[data-tier]').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); });
  lob.querySelectorAll('[data-cls]').forEach(el => el.onclick = () => { sel.mine = el.dataset.cls === 'mine'; if (!sel.mine) sel.cls = el.dataset.cls; lob.querySelectorAll('[data-cls]').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); });
  $('hcGo').onclick = () => { lob.classList.remove('active'); start(TIERS[sel.tier]); };
}

// ───────── start ─────────
function start(T) {
  const L = BTX.lobbySel; L.cls = sel.cls; L.mine = sel.mine; L.diff = 1; BT.half = T.half; BTX.startBattle(0);                // builds the arena, kit, HUD, player at the south base
  BT.mode = 'hardcore'; BT.hc = { T, queue: T.npcs, spawned: 0, killedAt: 0, over: false }; BT.duration = T.minutes * 60; BT.hpMul = T.hp; BT.nmAcc = T.acc; BT.A.tickets = 99; BT.B.tickets = 9999; BT.ended = false;
  R.limit = BT.duration + 60; R.diff = { id: 2, name: 'Hardcore ' + T.label, color: T.color, loot: 1, acc: 1, hp: 1 };
  enemies.forEach(b => scene.remove(b.mesh)); enemies = []; BT.allies.forEach(b => scene.remove(b.mesh)); BT.allies = []; BT.vehicles.forEach(v => scene.remove(v.mesh)); BT.vehicles = [];
  const half = Math.ceil(T.veh / 2), I_ = I();
  for (let i = 0; i < half; i++) I_.addVehicle(PLAYER_VEH[i % 5], 'A', -26 + i * 13, T.half - 36, Math.PI, false);
  for (let i = 0; i < T.veh - half; i++) I_.addVehicle(ENEMY_VEH[i % 5], 'B', -40 + i * 20, -(T.half - 36), 0, true);
  document.body.classList.add('hcOn'); ensureHud(); wave(true); document.getElementById('hudMapName').textContent = 'Hardcore · ' + T.label;
  I_.kill(`☠️ ${T.label}: ${T.npcs} NPCs and ${T.veh} vehicles vs you. One life. Press F by your vehicle to drive it.`, 6500);
}
function ensureHud() {
  if ($('hcHud')) return; const css = document.createElement('style'); css.textContent = 'body.hcOn #btTop{display:none!important} #hcHud{position:fixed;top:8px;left:50%;transform:translateX(-50%);background:#000b;color:#fff;border:1px solid #ff6a33;border-radius:10px;padding:6px 16px;z-index:19;font:bold 14px Arial;text-shadow:0 1px 3px #000;text-align:center;display:none} body.hcOn #hcHud{display:block} #hcHud small{display:block;font-weight:normal;color:#ffd9b0;font-size:11.5px}'; document.head.appendChild(css);
  const h = document.createElement('div'); h.id = 'hcHud'; document.body.appendChild(h);
}
// the army arrives: keep `cap` soldiers on the field until the queue is empty
function spawnBot() {
  const T = BT.hc.T, half = BT.half; const keep = window.RDSET.smooth; if (T.cap > 60) window.RDSET.smooth = false;        // a crowd of 100+ uses plain blocky soldiers
  try {
    for (let k = 0; k < 40; k++) {
      const a = Math.random() * 6.2832, d = 95 + Math.random() * 80, x = playerPos.x + Math.cos(a) * d, z = playerPos.z + Math.sin(a) * d;
      if (Math.abs(x) > half - 10 || Math.abs(z) > half - 10 || window.blockedAt(x, z)) continue;
      const elite = Math.random() < 0.08 + T.npcs / 20000, cls = I().MIX[Math.floor(Math.random() * I().MIX.length)];
      const b = I().makeBot('B', cls, -1, { x, z }, elite ? { elite: true, hpMul: 1.4, ac: (I().BOT_CLASSES[cls].ac || 0) + 1 } : undefined); b.alertT = 10; enemies.push(b); BT.hc.queue--; BT.hc.spawned++; return true;
    }
  } finally { window.RDSET.smooth = keep; }
  return false;
}
function wave(first) { const T = BT.hc.T; let alive = enemies.filter(b => b.alive).length, guard = 0; while (BT.hc.queue > 0 && alive < T.cap && guard++ < (first ? 200 : 6)) { if (spawnBot()) alive++; else break; } }
window.rdHCTick = function (dt) {
  if (!BT.hc || BT.hc.over) return; BT.hc.t = (BT.hc.t || 0) + dt;
  BT.hc.wT = (BT.hc.wT || 0) - dt; if (BT.hc.wT <= 0) { BT.hc.wT = 0.5; wave(false); }
  BT.hc.cT = (BT.hc.cT || 0) - dt; if (BT.hc.cT <= 0) { BT.hc.cT = 2; enemies = enemies.filter(b => { if (b.alive) return true; if (b._dd === undefined) b._dd = BT.t; if (BT.t - b._dd > 20) { scene.remove(b.mesh); return false; } return true; }); }     // clear old corpses
  const alive = enemies.filter(b => b.alive).length, left = alive + BT.hc.queue;
  if (left <= 0 && BT.hc.spawned >= BT.hc.T.npcs) { finish('win'); return; }
  if (BT.t >= BT.duration) finish('time');
};
window.rdHCHud = function () {
  const h = $('hcHud'); if (!h || !BT.hc) return; const T = BT.hc.T, alive = enemies.filter(b => b.alive).length, left = alive + BT.hc.queue, rem = Math.max(0, BT.duration - BT.t);
  const myV = BT.vehicles.filter(v => v.team === 'A' && v.alive).length, foeV = BT.vehicles.filter(v => v.team === 'B' && v.alive).length;
  h.innerHTML = `${T.emoji} ${T.label} — NPCs left: <span style="color:#ff8a6a">${left}</span> / ${T.npcs}<small>⚔️ on the field ${alive} · ⏱ ${Math.floor(rem / 60)}:${String(Math.floor(rem % 60)).padStart(2, '0')} · 🚙 yours ${myV} · 🛡️ enemy ${foeV} · kills ${BT.stats.kills}</small>`;
};
window.rdHCFail = function (why) { if (BT.hc && !BT.hc.over) { R.dead = true; BT.stats.deaths++; finish(why === 'time' ? 'time' : 'died'); } };
function finish(result) {
  if (!BT.hc || BT.hc.over) return; BT.hc.over = true; BT.ended = true; R.on = false; R.over = true; inGame = false; if (document.pointerLockElement) document.exitPointerLock(); document.body.classList.remove('rdOn', 'btOn', 'hcOn');
  const T = BT.hc.T, k = BT.stats.kills, win = result === 'win', xp = win ? T.xp + k * 4 : Math.round(k * 5), scrap = win ? T.scrap + k * 4 : Math.round(k * 4);
  userState.xp += xp; userState.scrap += scrap; try { checkLevelUp(); } catch (e) { } saveUserData();
  const el = $('btEnd'); el.style.display = 'flex'; el.innerHTML = `<div style="font-size:42px;font-weight:900;color:${win ? '#7dffb0' : '#ff5544'}">${win ? '🏆 THE ARMY IS DEAD' : result === 'time' ? '⏱ TIME RAN OUT' : '💀 YOU FELL'}</div><div style="color:#9a8a80;margin:6px 0 14px">${T.emoji} ${T.label} · ${T.npcs} NPCs, ${T.veh} vehicles</div>
   <div style="line-height:1.8;font-size:14px;text-align:left">Soldiers killed: <b>${k}</b> of ${T.npcs}<br>Reward: <b>+${xp} XP</b> and <b>+${scrap} ⚙️ scrap</b></div><button class="rdBtnS go" id="hcEndBtn" style="margin-top:18px">Continue</button>`;
  $('hcEndBtn').onclick = () => { el.style.display = 'none'; I().cleanup(); BT.hc = null; BT.half = 190; BT.mode = 'battle'; goToMapSelect(); };
}
function addBtn() { const bar = document.querySelector('#mapSelectTop > div:last-child'); if (!bar || $('hcBtn')) return; const b = document.createElement('button'); b.className = 'msBtn'; b.id = 'hcBtn'; b.style.cssText = 'background:linear-gradient(#c0392b,#7b1f16);color:#fff;border-color:#ff6a33'; b.textContent = '☠️ HARDCORE'; b.onclick = openLobby; bar.insertBefore(b, bar.firstChild); }
addBtn(); document.addEventListener('DOMContentLoaded', addBtn); setTimeout(addBtn, 400); setTimeout(addBtn, 1500); setInterval(addBtn, 3000);
setInterval(() => { if (!BT.on && BT.half !== 190) BT.half = 190; }, 2000);
window.rdOpenHardcore = openLobby; window.HCX = { TIERS, start, finish };
})();
