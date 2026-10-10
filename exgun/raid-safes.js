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
  const now = performance.now(); if (c._lockUntil && now < c._lockUntil) { window.rdToast('🔒 The safe is jammed — locked out for ' + Math.ceil((c._lockUntil - now) / 1000) + ' s', 2200); return; }
  const lv = level(), vault = c.type === 'bankvault', len = clamp((vault ? 4 : 3) + Math.floor(lv * 0.65), 3, 6), tries = clamp(13 - len - (vault ? 1 : 0), 6, 10), time = Math.max(35, Math.round(120 - lv * 11 - (vault ? 25 : 0)));
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
