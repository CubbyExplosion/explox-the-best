// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — SCOPES THAT WORK
//   • Any gun with 2.4× or more zoom (snipers, DMRs, the 4× Combat Scope, 8× scope …) looks through a real scope picture: the rifle is hidden,
//     the view is a round lens with a mil-dot reticle, thick posts, range marks, glare and a dark eyepiece ring. (Before, the 4× scope was a
//     solid dark blob you could not see through.)
//   • Mouse wheel while aiming changes the magnification (variable zoom), and the mouse slows down to match.
//   • Scopes sway with your breathing — hold SHIFT while aiming to hold your breath for a steady shot (about 4 s, then you gasp and it sways harder).
//   • Red dots / holos / iron sights (under 2.4×) get a small centre dot so you always have something to aim with.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
window.rdScoped = g => !!g && (!!g.scope || g.zoom >= 2.4);
let zk = 1, lastGun = null, breath = 4, held = false, gasp = 0, readout = null;
window.rdZoomMul = g => (window.rdScoped(g) ? zk : 1);
document.addEventListener('keydown', e => { if (e.key === 'Shift') held = true; }); document.addEventListener('keyup', e => { if (e.key === 'Shift') held = false; });
window.addEventListener('blur', () => { held = false; });
document.addEventListener('wheel', e => {
  const R = window.RAID; if (!R || !R.on || R.ads < 0.5) return; const g = R.gs; if (!window.rdScoped(g)) return;
  zk = clamp(zk * (e.deltaY < 0 ? 1.12 : 1 / 1.12), 0.55, 1.6); e.preventDefault();
}, { passive: false });

function ensure() {
  const sc = document.getElementById('rdScope'); if (!sc || sc.dataset.up) return; sc.dataset.up = 1;
  sc.style.background = 'radial-gradient(circle at center, rgba(0,0,0,0) 0, rgba(0,0,0,0) 25vmin, rgba(10,12,14,.92) 25.4vmin, #000 27vmin)';
  const st = document.createElement('style'); st.textContent = '#rdScope:before,#rdScope:after{display:none!important}'; document.head.appendChild(st);
  sc.innerHTML = `<svg viewBox="-100 -100 200 200" style="position:absolute;left:50%;top:50%;width:52vmin;height:52vmin;transform:translate(-50%,-50%)">
    <defs><radialGradient id="rsG" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".35" stop-color="#9cf" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="rsV" cx="50%" cy="50%" r="50%"><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>
    <circle r="100" fill="url(#rsV)"/><circle r="100" fill="url(#rsG)"/>
    <g stroke="#0a0a0a" stroke-opacity=".92" fill="#0a0a0a">
      <line x1="-100" y1="0" x2="-14" y2="0" stroke-width="2.4"/><line x1="14" y1="0" x2="100" y2="0" stroke-width="2.4"/><line x1="0" y1="-100" x2="0" y2="-14" stroke-width="2.4"/><line x1="0" y1="14" x2="0" y2="100" stroke-width="2.4"/>
      <line x1="-14" y1="0" x2="14" y2="0" stroke-width=".35"/><line x1="0" y1="-14" x2="0" y2="14" stroke-width=".35"/>
      ${[-60, -45, -30, -15, 15, 30, 45, 60].map(v => `<circle cx="${v}" cy="0" r="1.3" stroke="none"/><circle cx="0" cy="${v}" r="1.3" stroke="none"/>`).join('')}
      ${[-24, -12, 12, 24].map(v => `<line x1="${v}" y1="-3" x2="${v}" y2="3" stroke-width=".5"/>`).join('')}
      ${[20, 40, 60, 80].map(v => `<line x1="-4" y1="${v}" x2="4" y2="${v}" stroke-width=".5"/>`).join('')}
      <circle cx="0" cy="0" r=".6" fill="#e22" stroke="none"/>
    </g>
    <text id="rsZoom" x="-92" y="-82" font-size="7" fill="#ddd" font-family="Arial" opacity=".8">6.0×</text><text id="rsBreath" x="92" y="-82" text-anchor="end" font-size="6" fill="#9f9" font-family="Arial" opacity=".85"></text></svg>`;
  readout = { z: sc.querySelector('#rsZoom'), b: sc.querySelector('#rsBreath') };
  const dot = document.createElement('div'); dot.id = 'rdSightDot'; dot.style.cssText = 'position:fixed;left:50%;top:50%;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;border-radius:50%;background:#ff2a1a;box-shadow:0 0 6px 2px rgba(255,40,20,.7);display:none;pointer-events:none;z-index:19'; document.body.appendChild(dot);
}
window.rdScopeFrame = function (dt, g, R) {
  ensure(); const scoped = window.rdScoped(g), ads = R.ads > 0.85;
  if (lastGun !== g.name && lastGun !== null) zk = 1; lastGun = g.name;
  const dot = document.getElementById('rdSightDot'); if (dot) dot.style.display = (!scoped && R.ads > 0.7 && R.mods && (R.mods.optic)) ? 'block' : 'none';
  if (!scoped || !ads) { breath = Math.min(4, breath + dt * 1.5); gasp = Math.max(0, gasp - dt); return; }
  const holding = held && breath > 0 && gasp <= 0; if (holding) { breath -= dt; if (breath <= 0) { gasp = 2.2; } } else breath = Math.min(4, breath + dt * (gasp > 0 ? 0.3 : 1)); gasp = Math.max(0, gasp - dt);
  const amp = (holding ? 0.0 : gasp > 0 ? 2.6 : 1) * 0.0011 * (g.zoom * zk >= 5 ? 1.3 : 1) * (1 + (R.z && R.z.arms < 20 ? 2 : 0)), t = performance.now() / 1000;
  camera.rotation.x += Math.sin(t * 1.3) * amp + Math.sin(t * 3.1) * amp * 0.3; camera.rotation.y += Math.cos(t * 1.05) * amp * 1.2;
  if (readout) { readout.z.textContent = (g.zoom * zk).toFixed(1) + '×'; readout.b.textContent = holding ? '● BREATH HELD ' + breath.toFixed(1) + 's' : gasp > 0 ? '… catching breath' : 'hold SHIFT to steady'; readout.b.setAttribute('fill', gasp > 0 ? '#f96' : '#9f9'); }
};
})();
