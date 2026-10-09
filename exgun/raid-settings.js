// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — SETTINGS  (⚙️ button on the sector screen and in the Hideout)
//   Look: Blocky (default) or Smooth — Smooth builds every box in the game with rounded edges and every sphere/cylinder with more facets,
//         so guns, soldiers, crates and buildings stop looking like blocks. It takes effect on the next raid (and in the Armory previews).
//   Also: shadow quality, time of day (auto or fixed), mouse sensitivity, field of view, volume.
// Saved in this browser (localStorage "exgun_settings"). Loaded BEFORE the model files, because the smooth look works by wrapping
// THREE.BoxGeometry / SphereGeometry / CylinderGeometry / ConeGeometry so that every later `new THREE.BoxGeometry(...)` can come out rounded.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const DEFAULTS = { smooth: false, shadows: 'high', time: 'auto', sens: 1, fov: 78, vol: 0.55 };
let saved = {}; try { saved = JSON.parse(localStorage.getItem('exgun_settings') || '{}') || {}; } catch (e) {}
const S = window.RDSET = Object.assign({}, DEFAULTS, saved);
function save() { try { localStorage.setItem('exgun_settings', JSON.stringify(S)); } catch (e) {} }

// ───────── rounded geometry ─────────
const OB = THREE.BoxGeometry, OS = THREE.SphereGeometry, OC = THREE.CylinderGeometry, OK = THREE.ConeGeometry;
function rounded(w, h, d) {
  const r = Math.min(Math.min(w, h, d) * 0.3, 0.14), g = new OB(w, h, d, 3, 3, 3), P = g.attributes.position, N = g.attributes.normal;
  const ax = w / 2, ay = h / 2, az = d / 2, fix = (c, half) => (Math.abs(c) < half * 0.5 ? Math.sign(c) * (half - r) : c);
  for (let i = 0; i < P.count; i++) {
    let x = fix(P.getX(i), ax), y = fix(P.getY(i), ay), z = fix(P.getZ(i), az);
    const ix = Math.max(-ax + r, Math.min(ax - r, x)), iy = Math.max(-ay + r, Math.min(ay - r, y)), iz = Math.max(-az + r, Math.min(az - r, z));
    const dx = x - ix, dy = y - iy, dz = z - iz, len = Math.hypot(dx, dy, dz);
    if (len > 1e-7) { x = ix + dx / len * r; y = iy + dy / len * r; z = iz + dz / len * r; N.setXYZ(i, dx / len, dy / len, dz / len); }
    P.setXYZ(i, x, y, z);
  }
  P.needsUpdate = true; N.needsUpdate = true; g.computeBoundingSphere(); g.computeBoundingBox(); return g;
}
THREE.BoxGeometry = function (w, h, d, sx, sy, sz) { w = w === undefined ? 1 : w; h = h === undefined ? 1 : h; d = d === undefined ? 1 : d; return (S.smooth && !(sx > 1 || sy > 1 || sz > 1)) ? rounded(w, h, d) : new OB(w, h, d, sx, sy, sz); };
THREE.BoxGeometry.prototype = OB.prototype;
THREE.SphereGeometry = function (r, ws, hs, a, b, c, d) { return new OS(r, S.smooth ? Math.max(ws || 8, 28) : ws, S.smooth ? Math.max(hs || 6, 18) : hs, a, b, c, d); }; THREE.SphereGeometry.prototype = OS.prototype;
THREE.CylinderGeometry = function (rt, rb, h, rs, hs, oe, a, l) { return new OC(rt, rb, h, S.smooth ? Math.max(rs || 8, 28) : rs, hs, oe, a, l); }; THREE.CylinderGeometry.prototype = OC.prototype;
THREE.ConeGeometry = function (r, h, rs, hs, oe, a, l) { return new OK(r, h, S.smooth ? Math.max(rs || 8, 24) : rs, hs, oe, a, l); }; THREE.ConeGeometry.prototype = OK.prototype;

// ───────── settings screen ─────────
const css = document.createElement('style'); css.textContent = `
#rdSettings { position:fixed; inset:0; z-index:70; display:none; background:rgba(8,8,10,.94); color:#e8e0d8; overflow-y:auto; padding:20px 12px 60px; font-family:Arial,Helvetica,sans-serif; } #rdSettings.active { display:block; }
#rdSettings .box { max-width:560px; margin:0 auto; } #rdSettings h1 { color:#ff6a33; letter-spacing:3px; font-size:22px; margin:0 0 14px; }
.stRow { background:#17130f; border:1px solid #3a2c22; border-radius:10px; padding:11px 13px; margin:8px 0; } .stRow b { color:#ffd9b0; display:block; margin-bottom:3px; } .stRow small { color:#9a8a80; display:block; margin-bottom:7px; font-size:12px; }
.stOpt { display:inline-block; background:#241a12; border:1px solid #5a4030; color:#ffd9b0; border-radius:7px; padding:6px 13px; margin:3px 4px 0 0; cursor:pointer; font-size:13px; } .stOpt.on { background:#ff6a33; border-color:#ff6a33; color:#fff; font-weight:bold; }
.stRow input[type=range] { width:100%; }
`; document.head.appendChild(css);
const scr = document.createElement('div'); scr.id = 'rdSettings'; document.body.appendChild(scr);
const TIMES = [['auto', 'Auto (random)'], ['dawn', '🌅 Dawn'], ['morning', '☀️ Morning'], ['noon', '🌞 Midday'], ['golden', '🌇 Golden hour'], ['dusk', '🌆 Dusk'], ['night', '🌙 Night'], ['overcast', '☁️ Overcast']];
function opt(group, val, label) { return `<span class="stOpt ${String(S[group]) === String(val) ? 'on' : ''}" data-g="${group}" data-v="${val}">${label}</span>`; }
function render() {
  scr.innerHTML = `<div class="box"><h1>⚙️ SETTINGS</h1>
   <div class="stRow"><b>Model style</b><small>Blocky is the classic look. Smooth rounds every edge and uses finer curves — guns, soldiers and props look less like blocks. Applies from your next raid.</small>${opt('smooth', false, '🧱 Blocky')}${opt('smooth', true, '⚪ Smooth (realistic)')}</div>
   <div class="stRow"><b>Shadow quality</b><small>Lower this if the game runs slowly on your device.</small>${opt('shadows', 'high', 'High')}${opt('shadows', 'medium', 'Medium')}${opt('shadows', 'low', 'Low')}${opt('shadows', 'off', 'Off')}</div>
   <div class="stRow"><b>Time of day</b><small>Auto picks a random time for every raid (harder sectors lean towards dusk and night).</small>${TIMES.map(t => opt('time', t[0], t[1])).join('')}</div>
   <div class="stRow"><b>Mouse sensitivity: <span id="stSensV">${S.sens.toFixed(2)}×</span></b><input type="range" id="stSens" min="0.3" max="2.5" step="0.05" value="${S.sens}"></div>
   <div class="stRow"><b>Field of view: <span id="stFovV">${S.fov}°</span></b><input type="range" id="stFov" min="60" max="100" step="1" value="${S.fov}"></div>
   <div class="stRow"><b>Volume: <span id="stVolV">${Math.round(S.vol * 100)}%</span></b><input type="range" id="stVol" min="0" max="1" step="0.05" value="${S.vol}"></div>
   <div style="text-align:center;margin-top:16px"><button class="rdBtnS go" id="stClose">Done</button></div></div>`;
  scr.querySelectorAll('.stOpt').forEach(el => el.addEventListener('click', () => { const g = el.dataset.g, v = el.dataset.v; S[g] = (g === 'smooth') ? v === 'true' : v; save(); if (g === 'smooth' && typeof window.rdClearGunIcons === 'function') window.rdClearGunIcons(); render(); }));
  const sl = (id, key, out, fmt) => { const el = document.getElementById(id); el.addEventListener('input', () => { S[key] = parseFloat(el.value); document.getElementById(out).textContent = fmt(S[key]); save(); if (key === 'vol' && window.rdSetVolume) window.rdSetVolume(S.vol); }); };
  sl('stSens', 'sens', 'stSensV', v => v.toFixed(2) + '×'); sl('stFov', 'fov', 'stFovV', v => v + '°'); sl('stVol', 'vol', 'stVolV', v => Math.round(v * 100) + '%');
  document.getElementById('stClose').onclick = () => scr.classList.remove('active');
}
window.rdOpenSettings = function () { render(); scr.classList.add('active'); };

// buttons: sector screen, and the Hideout (added when it renders)
function addBtn() { const bar = document.querySelector('#mapSelectTop > div:last-child'); if (!bar || document.getElementById('rdSetBtn')) return; const b = document.createElement('button'); b.className = 'msBtn'; b.id = 'rdSetBtn'; b.textContent = '⚙️ SETTINGS'; b.onclick = window.rdOpenSettings; bar.insertBefore(b, bar.firstChild); }
addBtn(); document.addEventListener('DOMContentLoaded', addBtn); setTimeout(addBtn, 300);
const mo = new MutationObserver(() => { const back = document.getElementById('rdBack'); if (back && !document.getElementById('rdDepSet')) { const b = document.createElement('button'); b.className = 'rdBtnS'; b.id = 'rdDepSet'; b.textContent = '⚙️ Settings'; b.onclick = window.rdOpenSettings; back.parentNode.insertBefore(b, back); } });
document.addEventListener('DOMContentLoaded', () => { const dep = document.getElementById('rdDeploy'); if (dep) mo.observe(dep, { childList: true }); });
setTimeout(() => { const dep = document.getElementById('rdDeploy'); if (dep) mo.observe(dep, { childList: true }); }, 400);
})();
