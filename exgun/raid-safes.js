// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — HARDER = BETTER REWARDS  +  SAFES YOU HAVE TO CRACK
//   REWARDS  The harder the map, the better everything pays:
//     • loot: rare valuable items turn up more often (weights scale with difficulty) and ammo stacks are bigger,
//     • results: your XP and scrap bonus are multiplied by a difficulty bonus (×1.0 on Easy up to ×2.1 on the deadliest maps — the results
//       screen shows it). Open World, Explox City and the countries count as hard maps.
//   SAFES  The safes lying around the world and the bank vault safes are LOCKED. Hold F on one and you have to CRACK THE CODE:
//     a code-breaking puzzle (like Mastermind): type a guess and it tells you how many digits are right and in the right place (●) and how many
//     are right but in the wrong place (○). Harder maps mean longer codes (3 → 6 digits), fewer tries and less time; bank vaults are tougher
//     still and set off the alarm. Fail and the safe locks you out for 60 s. (Your own house safes open normally.)
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const $ = id => document.getElementById(id), R = window.RAID, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function level() { const id = R.diff ? R.diff.id || 0 : 0; return id >= 10 ? Math.min(6, (id - 10) / 3.3) : id >= 5 ? 4 : Math.min(6, id); }     // 0 (easy) … 6 (deadly)
const mult = () => 1 + 0.18 * level();
// rarer / more valuable loot with difficulty
window.rdLootPick = function (table) {
  const lv = level(); let tot = 0; const w = table.map(e => { let k = e[1]; try { const v = rItem(e[0]).value || 0; if (v >= 140) k *= 1 + 0.4 * lv; else if (v <= 30) k *= Math.max(0.5, 1 - 0.07 * lv); } catch (x) { } tot += k; return k; });
  let r = Math.random() * tot; for (let i = 0; i < table.length; i++) { r -= w[i]; if (r <= 0) return table[i]; } return table[table.length - 1];
};
// bonus on the results screen
const prevRes = window.rdShowResults;
window.rdShowResults = function (res) {
  const m = mult(), extra = [];
  if (res && res.mapIndex !== 103 && m > 1.001 && (res.reason === 'extracted' || res.xp > 0)) {
    const bx = Math.round((res.xp || 0) * (m - 1)); let bs = 0;
    if (res.reason === 'extracted') bs = Math.round((15 * (res.kills || 0) + 25 + (res.found || 0) * 0.1) * (m - 1));
    if (bx > 0) userState.xp += bx; if (bs > 0) userState.scrap += bs; if (bx || bs) { try { saveUserData(); } catch (e) { } extra.push(`⭐ Difficulty bonus ×${m.toFixed(2)} (${R.diff ? R.diff.name : ''}): +${bx} XP${bs ? ' and +' + bs + ' ⚙️' : ''}`); }
  }
  const r = prevRes.apply(this, arguments);
  if (extra.length) { const w = document.querySelector('#rdResults .rdWrap div[style*="max-width:520px"]'); if (w) extra.forEach(l => w.insertAdjacentHTML('beforeend', '<div style="color:#ffd24a">' + l + '</div>')); }
  return r;
};
// ───────── lock the safes ─────────
const prevEnter = window.rdEnterRaid;
window.rdEnterRaid = function () { const r = prevEnter.apply(this, arguments); try { (window.RAID.containers || []).forEach(c => { if ((c.type === 'safe' || c.type === 'bankvault') && !c.safeId) { c.locked = true; c.time = 0.5; if (!/🔒/.test(c.name)) c.name = '🔒 ' + c.name + ' (locked — crack the code)'; } }); } catch (e) { } return r; };
const css = document.createElement('style'); css.textContent = `
#scrk { position:fixed; inset:0; z-index:97; background:rgba(4,6,10,.92); display:none; align-items:center; justify-content:center; font-family:Arial,sans-serif; } #scrk.on { display:flex; }
#scBox { background:#12181f; border:2px solid #d0a93a; border-radius:14px; padding:16px 18px; width:min(94vw,420px); color:#e8f0f8; box-shadow:0 0 40px #000; }
#scBox h1 { margin:0 0 4px; font-size:18px; color:#ffd24a; letter-spacing:2px; } #scBox small { color:#8aa0b8; }
#scSlots { display:flex; gap:7px; justify-content:center; margin:12px 0; } .scS { width:40px; height:50px; background:#0b1118; border:2px solid #3a4a5a; border-radius:7px; font:bold 28px monospace; display:flex; align-items:center; justify-content:center; color:#7dffb0; }
#scKeys { display:grid; grid-template-columns:repeat(5,1fr); gap:6px; } #scKeys button { background:#1d2b3a; border:1px solid #3a5a7a; color:#cfe8ff; border-radius:7px; padding:9px 0; font-size:17px; cursor:pointer; } #scKeys button.go { background:#2f8a4a; border-color:#4dffa0; } #scKeys button.bk { background:#5a2a1a; }
#scHist { margin-top:10px; max-height:130px; overflow:auto; font:14px monospace; } #scHist div { display:flex; justify-content:space-between; padding:3px 8px; background:#0b1118; border-radius:5px; margin:3px 0; }
#scBar { height:7px; background:#222; border-radius:4px; overflow:hidden; margin-top:8px; } #scBar i { display:block; height:100%; background:#d0a93a; width:100%; }
`; document.head.appendChild(css);
const ui = document.createElement('div'); ui.id = 'scrk'; document.body.appendChild(ui);
let cur = null;
function close(success) { if (!cur) return; ui.classList.remove('on'); clearInterval(cur.tm); const c = cur.c; cur = null; if (R && R.on) { R.invOpen = false; try { if (renderer && !IS_TOUCH) renderer.domElement.requestPointerLock(); } catch (e) { } } return c; }
window.rdSafeCrack = function (c) {
  if (c.type === 'killsafe') { window.rdKillSafe(c); return; }
  const now = performance.now(); if (c._lockUntil && now < c._lockUntil) { window.rdToast('🔒 The safe is jammed — locked out for ' + Math.ceil((c._lockUntil - now) / 1000) + ' s', 2200); return; }
  const lv = level(), vault = c.type === 'bankvault', len = clamp((vault ? 4 : 3) + Math.floor(lv * 0.65), 3, 6), tries = clamp(17 - len - (vault ? 1 : 0), 10, 14), time = Math.max(75, Math.round(190 - lv * 12 - (vault ? 30 : 0)));
  if (!c._code || c._code.length !== len) c._code = Array.from({ length: len }, () => Math.floor(Math.random() * 10));
  if (vault) c._items0 = {};      // touching a bank vault safe sets off the alarm
  cur = { c, len, tries, time, left: time, guess: [], hist: [] }; if (document.pointerLockElement) document.exitPointerLock(); R.invOpen = true; draw(); ui.classList.add('on');
  cur.tm = setInterval(() => { if (!cur) return; cur.left -= 0.25; const b = $('scBarI'); if (b) b.style.width = Math.max(0, cur.left / cur.time * 100) + '%'; if (cur.left <= 0) fail('⏱ Time ran out'); }, 250);
};
function draw() {
  if (!cur) return; const { len, tries, hist, guess } = cur;
  ui.innerHTML = `<div id="scBox"><h1>🔐 CRACK THE SAFE</h1><small>${cur.c.type === 'bankvault' ? 'Bank vault — ' : ''}${len}-digit code · <b>${tries - hist.length}</b> tries left · type 0–9, Enter to try</small>
   <div id="scBar"><i id="scBarI" style="width:${Math.max(0, cur.left / cur.time * 100)}%"></i></div>
   <div id="scSlots">${Array.from({ length: len }, (_, i) => `<div class="scS">${guess[i] !== undefined ? guess[i] : '·'}</div>`).join('')}</div>
   <div id="scKeys">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => `<button data-d="${d}">${d}</button>`).join('')}<button class="bk" id="scBk">⌫</button><button class="go" id="scGo" style="grid-column:span 2">TRY</button><button id="scX" style="grid-column:span 2">Give up</button></div>
   <div id="scHist">${hist.map(h => `<div><span>${h.g.join(' ')}</span><span>● ${h.exact} right place · ○ ${h.near} wrong place</span></div>`).reverse().join('')}</div><small style="display:block;margin-top:6px">● = right digit in the right spot · ○ = right digit, wrong spot</small></div>`;
  ui.querySelectorAll('[data-d]').forEach(b => b.onclick = () => add(parseInt(b.dataset.d, 10))); $('scBk').onclick = () => { cur.guess.pop(); draw(); }; $('scGo').onclick = submit; $('scX').onclick = () => fail('You gave up');
}
const add = d => { if (cur && cur.guess.length < cur.len) { cur.guess.push(d); draw(); } };
function submit() {
  if (!cur || cur.guess.length !== cur.len) return; const code = cur.c._code, g = cur.guess.slice(); let exact = 0; const cl = [], gl = []; g.forEach((d, i) => { if (d === code[i]) exact++; else { cl.push(code[i]); gl.push(d); } }); let near = 0; gl.forEach(d => { const k = cl.indexOf(d); if (k >= 0) { near++; cl.splice(k, 1); } });
  cur.hist.push({ g, exact, near }); cur.guess = [];
  if (exact === cur.len) { const c = close(true); c.locked = false; c.time = 0.2; c._code = null; c.name = c.name.replace('🔒 ', '').replace(' (locked — crack the code)', ''); window.rdToast('🔓 CRACKED! Hold F to take what is inside', 3200); try { window.RDX.api.tone(880, 0.12, 0.3, 'square'); window.RDX.api.tone(1320, 0.2, 0.3, 'square', 0.12); } catch (e) { } return; }
  try { window.RDX.api.tone(exact ? 700 : 300, 0.08, 0.2, 'square'); } catch (e) { } if (cur.hist.length >= cur.tries) fail('Out of tries'); else draw();
}
function fail(why) { if (!cur) return; const c = close(false); c._lockUntil = performance.now() + 60000; c._code = null; if (c.type === 'bankvault') c._items0 = {}; window.rdToast('🔒 ' + why + ' — the safe locked up for 60 s' + (c.type === 'bankvault' ? ' (the alarm was triggered!)' : ''), 3200); try { window.RDX.api.noise(0.4, 600, 150, 0.5, 'lowpass'); } catch (e) { } }
document.addEventListener('keydown', e => { if (!cur) return; if (/^Digit[0-9]$|^Numpad[0-9]$/.test(e.code)) { add(parseInt(e.code.slice(-1), 10)); e.preventDefault(); } else if (e.code === 'Backspace') { cur.guess.pop(); draw(); e.preventDefault(); } else if (e.code === 'Enter' || e.code === 'NumpadEnter') { submit(); e.preventDefault(); } else if (e.code === 'Escape') { fail('You gave up'); e.preventDefault(); } }, true);
})();

// ═══════════════════════════════════════════════════════════════════════════════
// ARMORED SAFES — 1500 HP and up (more on harder maps), big steel vaults. No code, no lock to pick: you SHOOT or BOMB the safe until it breaks (grenades, C4, mines, shells, even a nuke).
// Armour-piercing rounds hurt it much more than pistol ammo; once it is broken open you can loot a big stash of rare items.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  const R = window.RAID, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const HP = 1500; let hpSafes = [];       // base health; harder maps add 400 per difficulty step
  function barTex(c) { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const x = cv.getContext('2d'); x.fillStyle = 'rgba(10,10,12,.82)'; x.fillRect(0, 0, 256, 64); x.strokeStyle = '#ffb000'; x.lineWidth = 3; x.strokeRect(2, 2, 252, 60); x.fillStyle = '#ffd24a'; x.font = 'bold 20px Arial'; x.textAlign = 'center'; x.fillText(c.broken ? '💥 BROKEN — hold F to loot' : '🛡️ ARMORED SAFE · shoot or bomb it', 128, 24); x.fillStyle = '#331'; x.fillRect(16, 36, 224, 14); const f = clamp(c.hp / c.maxHp, 0, 1); x.fillStyle = f > 0.5 ? '#6adf5a' : f > 0.25 ? '#ffb000' : '#ff3a2a'; x.fillRect(16, 36, 224 * f, 14); x.fillStyle = '#fff'; x.font = '12px Arial'; x.fillText(Math.max(0, Math.round(c.hp)) + ' / ' + c.maxHp + ' HP', 128, 48); return new THREE.CanvasTexture(cv); }
  function refresh(c) { c.sprite.material.map = barTex(c); c.sprite.material.needsUpdate = true; const f = clamp(c.hp / c.maxHp, 0, 1); c.mesh.material.color.setRGB(0.2 + (1 - f) * 0.1, 0.22 - (1 - f) * 0.08, 0.26 - (1 - f) * 0.1); c.mesh.material.emissive.setRGB((1 - f) * 0.5, (1 - f) * 0.12, 0); }
  function lootFor(lv) { const t = R_CONTAINERS.safe.table, rich = t.filter(x => { try { return rItem(x[0]).value >= 140; } catch (e) { return false; } }), pool = t.concat(rich), out = {}; const n = 5 + Math.floor(lv / 2); for (let i = 0; i < n; i++) { const e = (window.rdLootPick || (tb => tb[Math.floor(Math.random() * tb.length)]))(pool), base = Math.floor(e[2] + Math.random() * (e[3] - e[2] + 1)); out[e[0]] = (out[e[0]] || 0) + (R_AMMO[e[0]] ? Math.round(base * 1.4) : base); } if (lv >= 2) out.gold_bar = (out.gold_bar || 0) + 1; return out; }
  function breakIt(c) {
    if (c.broken) return; c.broken = true; c.hp = 0; c.locked = false; c.time = 0.3; c.name = '💥 Broken armored safe (loot it)'; const d = window.RAID.diff, k = d ? (d.id >= 10 ? Math.min(6, (d.id - 10) / 3.3) : d.id) : 0; c.items = lootFor(k); c._items0 = c.items; c.opened = false;
    try { const api = window.RDX.api, p = new THREE.Vector3(c.x, 0.9, c.z); api.burst(p, 0xffaa44, 26, 8, 0.1, api.getFx().sparks, 8); api.burst(p, 0x333333, 12, 4, 0.3, api.getFx().blood, 1); api.noise(0.5, 3000, 150, 1.0, 'lowpass'); api.tone(90, 0.4, 0.8, 'sine', 0, 40); } catch (e) { }
    c.mesh.scale.y = 0.72; c.mesh.rotation.z = 0.1; c.mesh.position.y = 0.83; refresh(c); const i = currentBuildings.indexOf(c._col); if (i >= 0) currentBuildings.splice(i, 1); window.rdToast('💥 The armored safe BREAKS OPEN — hold F to loot it!', 3000);
  }
  function damage(c, dmg, hitP) {
    if (c.broken || dmg <= 0) return; c.hp -= dmg; try { const api = window.RDX.api; if (hitP) api.burst(hitP, 0xffd080, 5, 5, 0.05, api.getFx().sparks, 10); api.tone(1900 + Math.random() * 600, 0.05, 0.2, 'square'); } catch (e) { }
    if (c.hp <= 0) breakIt(c); else refresh(c);
  }
  // a bullet: closest approach of the ray to the safe's centre
  window.rdSafeShot = function (origin, dir, wallDist, enemyDist, dmg, ammo) {
    for (let i = 0; i < hpSafes.length; i++) { const c = hpSafes[i]; if (c.broken || !c.mesh.parent) continue; const cx = c.x - origin.x, cy = 1.15 - origin.y, cz = c.z - origin.z, t = cx * dir.x + cy * dir.y + cz * dir.z; if (t < 0.3 || t > wallDist + 2.4 || t > enemyDist) continue; const px = cx - dir.x * t, py = cy - dir.y * t, pz = cz - dir.z * t; if (Math.hypot(px, py, pz) < 1.6) { const m = clamp(0.12 + ((ammo && ammo.pen) || 1) * 0.075, 0.12, 1.0); damage(c, dmg * m, origin.clone().addScaledVector(dir, t - 0.5)); return; } }
  };
  window.rdSafeBlast = function (p, d) { hpSafes.forEach(c => { if (c.broken) return; const dd = Math.hypot(c.x - p.x, c.z - p.z), rad = (d.radius || 6) + 2.4; if (dd < rad) damage(c, (d.dmg || 100) * (1 - dd / rad) * 1.1, new THREE.Vector3(c.x, 1.2, c.z)); }); };
  const prev = window.rdEnterRaid;
  window.rdEnterRaid = function (i) {
    const r = prev.apply(this, arguments); hpSafes = []; const m = window.RAID; if (i === 103 || (window.HOUSE3D && window.HOUSE3D.on)) return r;
    try {
      const d = m.diff, lv = d ? (d.id >= 10 ? Math.min(6, (d.id - 10) / 3.3) : d.id) : 0, n = 3 + Math.round(lv), half = (typeof ARENA_HALF !== 'undefined' ? ARENA_HALF : 66) - 8;
      for (let k = 0; k < n; k++) for (let t = 0; t < 60; t++) {
        const x = rnd(-half, half), z = rnd(-half, half); if (window.blockedAt(x, z) || window.blockedAt(x + 2.4, z) || window.blockedAt(x - 2.4, z) || window.blockedAt(x, z + 2.4) || window.blockedAt(x, z - 2.4) || Math.hypot(x - m.spawn.x, z - m.spawn.z) < 25) continue;
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.3, 2.0), new THREE.MeshStandardMaterial({ color: 0x2a2f36, metalness: 0.85, roughness: 0.35 })); body.position.set(x, 1.15, z); body.rotation.y = rnd(0, 6.28); body.castShadow = true; scene.add(body);
        [-1, 1].forEach(s => { const st = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.32, 2.04), new THREE.MeshStandardMaterial({ color: 0xe0b020, roughness: 0.6 })); st.position.x = s * 0.85; body.add(st); });
        const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 18), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 })); dial.rotation.x = Math.PI / 2; dial.position.set(0, 0.15, 1.04); const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 20), new THREE.MeshStandardMaterial({ color: 0x777b80, metalness: 0.9, roughness: 0.3 })); wheel.position.set(0, 0.15, 1.08); body.add(wheel); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(q => { const rv = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8), new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.9 })); rv.rotation.x = Math.PI / 2; rv.position.set(q[0] * 1.1, q[1] * 0.95, 1.03); body.add(rv); }); body.add(dial);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: null, transparent: true })); sprite.scale.set(3.2, 0.8, 1); sprite.position.set(x, 3.3, z); scene.add(sprite);
        const col = { x, z, hw: 1.6, hd: 1.4 }; currentBuildings.push(col);
        const c = { type: 'hpsafe', name: '🛡️ Armored Safe — ' + (HP + Math.round(lv * 400)) + ' HP (shoot or bomb it!)', x, z, items: {}, mesh: body, lid: null, opened: false, time: 0.3, hp: HP + Math.round(lv * 400), maxHp: HP + Math.round(lv * 400), locked: true, sprite, _col: col }; c._items0 = c.items; refresh(c); m.containers.push(c); hpSafes.push(c); break;
      }
    } catch (e) { console.warn('hp safes', e); }
    return r;
  };
})();

// ═══════════════════════════════════════════════════════════════════════════════
// KILL-LOCK SAFES — a black-and-red safe with a skull on it that will not open until you have KILLED 5 ENEMIES.
// Hold F on it to arm it: 5 guards storm out of the hills towards you. Every enemy you kill (any enemy) counts; the sign above shows 0/5…5/5.
// At 5/5 it unlocks with a rich stash. 2 per map.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  const R = window.RAID, rnd = (a, b) => a + Math.random() * (b - a), NEED = 5; let ks = [];
  function lvl() { const d = window.RAID.diff; return d ? (d.id >= 10 ? Math.min(6, (d.id - 10) / 3.3) : d.id >= 5 ? 4 : d.id) : 0; }
  function label(c) { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 80; const x = cv.getContext('2d'); x.fillStyle = 'rgba(10,6,6,.85)'; x.fillRect(0, 0, 256, 80); x.strokeStyle = c.open ? '#6adf5a' : '#ff3a2a'; x.lineWidth = 3; x.strokeRect(2, 2, 252, 76); x.textAlign = 'center'; x.fillStyle = '#ffd24a'; x.font = 'bold 20px Arial'; x.fillText(c.open ? '🔓 UNLOCKED — hold F to loot' : c.armed ? '💀 KILL 5 ENEMIES' : '💀 KILL-LOCK SAFE · hold F to arm', 128, 28); if (!c.open) { for (let i = 0; i < NEED; i++) { x.fillStyle = i < c.kills ? '#ff3a2a' : '#3a2020'; x.beginPath(); x.arc(46 + i * 41, 56, 13, 0, 6.3); x.fill(); x.strokeStyle = '#ff9a8a'; x.lineWidth = 1.5; x.stroke(); } } else { x.fillStyle = '#9fd'; x.font = '16px Arial'; x.fillText('5/5 enemies killed', 128, 58); } return new THREE.CanvasTexture(cv); }
  function repaint(c) { c.sprite.material.map = label(c); c.sprite.material.needsUpdate = true; c.mesh.material.emissive.setRGB(c.open ? 0 : c.armed ? 0.35 : 0.08, 0, 0); }
  function loot() { const t = R_CONTAINERS.safe.table, lv = lvl(), out = {}, n = 5 + Math.floor(lv / 2); for (let i = 0; i < n; i++) { const e = (window.rdLootPick || (tb => tb[Math.floor(Math.random() * tb.length)]))(t), base = Math.floor(e[2] + Math.random() * (e[3] - e[2] + 1)); out[e[0]] = (out[e[0]] || 0) + (R_AMMO[e[0]] ? Math.round(base * 1.3) : base); } if (lvl() >= 1) out.gold_bar = (out.gold_bar || 0) + 1; return out; }
  window.rdKillSafe = function (c) {
    if (c.open) return; if (c.armed) { window.rdToast('💀 Kill ' + (NEED - c.kills) + ' more enem' + (NEED - c.kills === 1 ? 'y' : 'ies') + ' to open it (' + c.kills + '/' + NEED + ')', 2200); return; }
    c.armed = true; c.base = R.kills || 0; c.kills = 0; repaint(c); window.rdToast('💀 The safe is armed — guards are coming! Kill 5 enemies to open it.', 3500);
    try { window.RDX.api.tone(220, 0.5, 0.4, 'sawtooth', 0, 90); window.RDX.api.noise(0.6, 900, 200, 0.4, 'lowpass'); } catch (e) { }
    const lv = lvl(), pool = lv < 1 ? ['scav', 'scav', 'raider', 'knifer', 'scav'] : lv < 3 ? ['raider', 'raider', 'pmc', 'knifer', 'scav'] : ['pmc', 'pmc', 'raider', 'knifer', 'pmc'], h = window.OW && window.OW.h;
    if (h) for (let i = 0; i < NEED; i++) for (let t = 0; t < 30; t++) { const a = rnd(0, 6.28), r = rnd(20, 30), x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r; if (!window.blockedAt(x, z)) { const e = h.spawnEnemy(pool[i % pool.length], x, z); e.alertT = 14; e.lastKnown.x = c.x; e.lastKnown.z = c.z; e.home = { x: c.x, z: c.z }; e.wp = { x: c.x, z: c.z }; break; } }
  };
  setInterval(() => {
    const m = window.RAID; if (!m || !m.on) return;
    ks.forEach(c => { if (!c.armed || c.open) return; const k = Math.min(NEED, (m.kills || 0) - c.base); if (k !== c.kills) { c.kills = k; if (k >= NEED) { c.open = true; c.locked = false; c.time = 0.3; c.name = '🔓 Kill-lock safe (open — loot it)'; c.items = loot(); c._items0 = c.items; window.rdToast('🔓 5 kills! The safe clicks open — hold F to loot it!', 3500); try { window.RDX.api.tone(880, 0.12, 0.3, 'square'); window.RDX.api.tone(1320, 0.2, 0.3, 'square', 0.12); } catch (e) { } } else window.rdToast('💀 ' + k + '/' + NEED + ' enemies killed', 1000); repaint(c); } });
  }, 150);
  const prev = window.rdEnterRaid;
  window.rdEnterRaid = function (i) {
    const r = prev.apply(this, arguments); ks = []; const m = window.RAID; if (i === 103 || (window.HOUSE3D && window.HOUSE3D.on)) return r;
    try { const half = (typeof ARENA_HALF !== 'undefined' ? ARENA_HALF : 66) - 8;
      for (let k = 0; k < 2; k++) for (let t = 0; t < 60; t++) {
        const x = rnd(-half, half), z = rnd(-half, half); if (window.blockedAt(x, z) || window.blockedAt(x + 2, z) || window.blockedAt(x - 2, z) || window.blockedAt(x, z + 2) || window.blockedAt(x, z - 2) || Math.hypot(x - m.spawn.x, z - m.spawn.z) < 30) continue;
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.7, 1.5), new THREE.MeshStandardMaterial({ color: 0x1a1214, metalness: 0.8, roughness: 0.4, emissive: 0x140000 })); body.position.set(x, 0.85, z); body.rotation.y = rnd(0, 6.28); body.castShadow = true; scene.add(body);
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 0.08), new THREE.MeshStandardMaterial({ color: 0x8a1818, metalness: 0.7, roughness: 0.4 })); door.position.set(0, 0, 0.77); body.add(door);
        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.6 })); skull.position.set(0, 0.15, 0.85); skull.scale.set(1, 1.1, 0.5); body.add(skull); [-1, 1].forEach(s => { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2a1a })); eye.position.set(s * 0.1, 0.2, 0.95); body.add(eye); });
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: null, transparent: true })); sprite.scale.set(3.0, 0.94, 1); sprite.position.set(x, 2.7, z); scene.add(sprite);
        const col = { x, z, hw: 1.3, hd: 1.2 }; currentBuildings.push(col);
        const c = { type: 'killsafe', name: '💀 Kill-lock safe (kill 5 enemies to open)', x, z, items: {}, mesh: body, lid: null, opened: false, time: 0.4, locked: true, armed: false, open: false, kills: 0, base: 0, sprite, _col: col }; c._items0 = c.items; repaint(c); m.containers.push(c); ks.push(c); break; } } catch (e) { console.warn('kill safes', e); }
    return r;
  };
})();
