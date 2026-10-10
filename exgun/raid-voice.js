// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — SOLDIER VOICES + DEATH ANIMATION
//   Every soldier (raid enemies, Team Battle bots, No Mercy guards) now makes human sounds, synthesised live:
//   a buzzing "vocal cord" source shaped by vowel formants (ah / oh / eh / uh) plus breath noise.
//     shout when they spot you ("HEY!", "AAH!"), grunts when hit ("ugh", "oof", "agh"), death cries ("aaaahh", "ehh", "bla…" gurgle,
//     "oh…" sigh), screams when blown up, and the odd cough from the badly wounded.
//   Sounds are 3D: louder when close, panned left/right, muffled when far. Dead soldiers also collapse, twist and bleed out a pool.
// It only watches the existing enemy state (hp / alive / alertT), so it needs no changes to the AI.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const VOW = { ah: [800, 1200, 2600], oh: [500, 900, 2500], eh: [600, 1750, 2600], uh: [520, 1150, 2500], ee: [300, 2200, 3000], oo: [330, 800, 2400] };
let last = 0;
function ctx() { try { const a = window.RDX && window.RDX.api && window.RDX.api.getAudio(); return a && a.AC ? a : null; } catch (e) { return null; } }
// one syllable: vowel `v`, pitch f0→f1 Hz, length dur, loudness vol, optional breathiness/rasp, formants glide to vowel `v2`
function syl(A, out, t0, v, f0, f1, dur, vol, o) {
  o = o || {}; const AC = A.AC, src = AC.createOscillator(), vib = AC.createOscillator(), vg = AC.createGain(), env = AC.createGain(); src.type = 'sawtooth';
  src.frequency.setValueAtTime(f0, t0); src.frequency.exponentialRampToValueAtTime(Math.max(50, f1), t0 + dur);
  vib.frequency.value = 5 + Math.random() * 2; vg.gain.value = o.vib === undefined ? f0 * 0.012 : o.vib; vib.connect(vg); vg.connect(src.frequency);
  const F1 = VOW[v], F2 = VOW[o.v2 || v], mix = AC.createGain(); mix.gain.value = 1;
  F1.forEach((fr, i) => {
    const b = AC.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = i === 0 ? 5 : 8; b.frequency.setValueAtTime(fr, t0); b.frequency.linearRampToValueAtTime(F2[i], t0 + dur);
    const gg = AC.createGain(); gg.gain.value = [1, 0.55, 0.25][i]; src.connect(b); b.connect(gg); gg.connect(mix);
  });
  env.gain.setValueAtTime(0.0001, t0); env.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.04, dur * 0.3)); env.gain.setValueAtTime(vol, t0 + dur * 0.6); env.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  mix.connect(env); env.connect(out); src.start(t0); vib.start(t0); src.stop(t0 + dur + 0.05); vib.stop(t0 + dur + 0.05);
  if (o.breath !== false) {                                                         // breath / rasp: filtered noise riding on the vowel
    const nz = AC.createBufferSource(), len = Math.ceil(AC.sampleRate * (dur + 0.1)), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    nz.buffer = buf; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = o.rasp ? 1800 : 1200; bp.Q.value = 0.9; const ng = AC.createGain();
    ng.gain.setValueAtTime(0.0001, t0); ng.gain.exponentialRampToValueAtTime(vol * (o.rasp ? 0.9 : 0.35), t0 + 0.03); ng.gain.exponentialRampToValueAtTime(0.001, t0 + dur); nz.connect(bp); bp.connect(ng); ng.connect(out); nz.start(t0); nz.stop(t0 + dur + 0.1);
  }
}
// a plosive "b"/"p" burst or a wet gurgle in front of a vowel
function burst(A, out, t0, vol, wet) {
  const AC = A.AC, n = AC.createBufferSource(), len = Math.ceil(AC.sampleRate * 0.12), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  n.buffer = buf; const f = AC.createBiquadFilter(); f.type = wet ? 'bandpass' : 'lowpass'; f.frequency.value = wet ? 500 : 900; f.Q.value = wet ? 4 : 0.7; const g = AC.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + (wet ? 0.12 : 0.05));
  n.connect(f); f.connect(g); g.connect(out); n.start(t0); n.stop(t0 + 0.15);
  if (wet) { const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 22; lg.gain.value = 250; lfo.connect(lg); lg.connect(f.frequency); lfo.start(t0); lfo.stop(t0 + 0.15); }
}
const P = { // voices: high/low pitch for variety
  say(kind, big, pitch) {
    const a = ctx(); if (!a) return; return a;
  }
};
const SOUNDS = {
  shout(A, o, t, p) { const r = Math.random(); if (r < 0.5) { syl(A, o, t, 'eh', 170 * p, 210 * p, 0.2, 0.9, { v2: 'ee' }); syl(A, o, t + 0.2, 'ah', 190 * p, 150 * p, 0.28, 1, { rasp: true }); }   // "heyyy!"
    else if (r < 0.8) syl(A, o, t, 'ah', 200 * p, 260 * p, 0.55, 1, { rasp: true });                                                                                            // "AAAH!"
    else { syl(A, o, t, 'oh', 150 * p, 175 * p, 0.16, 0.9); syl(A, o, t + 0.17, 'eh', 175 * p, 150 * p, 0.2, 0.9); syl(A, o, t + 0.4, 'ah', 160 * p, 130 * p, 0.3, 1, { rasp: true }); } },                    // "oh—eh-aah!"
  hurt(A, o, t, p) { const r = Math.random(); if (r < 0.34) { burst(A, o, t, 0.5); syl(A, o, t + 0.02, 'uh', 150 * p, 95 * p, 0.2, 1, { rasp: true }); }                        // "ugh"
    else if (r < 0.67) { syl(A, o, t, 'oh', 175 * p, 110 * p, 0.12, 1); burst(A, o, t + 0.1, 0.35); syl(A, o, t + 0.12, 'uh', 120 * p, 85 * p, 0.14, 0.7, { rasp: true }); }      // "oof"
    else syl(A, o, t, 'ah', 230 * p, 130 * p, 0.3, 1, { rasp: true }); },                                                                                                       // "agh!"
  death(A, o, t, p) { const r = Math.random();
    if (r < 0.28) { syl(A, o, t, 'ah', 260 * p, 120 * p, 1.1, 1, { rasp: true, vib: 14 }); syl(A, o, t + 0.9, 'uh', 110 * p, 60 * p, 0.5, 0.5, { rasp: true }); }                // long falling "aaaaaahh…"
    else if (r < 0.52) { syl(A, o, t, 'eh', 200 * p, 140 * p, 0.28, 1, { rasp: true }); syl(A, o, t + 0.3, 'ah', 150 * p, 70 * p, 0.45, 0.7, { rasp: true }); }                  // "eh… ahh"
    else if (r < 0.76) { burst(A, o, t, 0.9); syl(A, o, t + 0.04, 'oh', 180 * p, 95 * p, 0.22, 1, { rasp: true }); syl(A, o, t + 0.3, 'uh', 100 * p, 60 * p, 0.35, 0.5, { rasp: true }); } // "off… uh"
    else { burst(A, o, t, 0.9); syl(A, o, t + 0.05, 'ah', 190 * p, 100 * p, 0.3, 1, { rasp: true }); burst(A, o, t + 0.35, 0.8, true); burst(A, o, t + 0.55, 0.6, true); }       // "bla…" + gurgle
  },
  scream(A, o, t, p) { syl(A, o, t, 'ah', 330 * p, 480 * p, 0.45, 1, { rasp: true, vib: 18 }); syl(A, o, t + 0.45, 'ah', 450 * p, 190 * p, 0.7, 1, { rasp: true, vib: 18 }); },
  cough(A, o, t, p) { burst(A, o, t, 0.6, true); syl(A, o, t + 0.02, 'uh', 130 * p, 100 * p, 0.12, 0.7, { rasp: true }); syl(A, o, t + 0.2, 'uh', 125 * p, 95 * p, 0.12, 0.6, { rasp: true }); }
};
function speak(kind, e, big) {
  const A = ctx(); if (!A || !e || !e.mesh) return; const cam = camera, m = e.mesh.position; if (!cam) return;
  const dx = m.x - cam.position.x, dz = m.z - cam.position.z, dist = Math.hypot(dx, dz); if (dist > 70) return;
  if (!e._pitch) e._pitch = 0.82 + Math.random() * 0.36;
  if (e.type === 'demon') e._pitch = 0.45;
  if (e.def && /Bot$/.test(e.def.name)) {                                              // robots do not scream: beeps, zaps and a dying whine
    if (kind === 'cough') return; const api = window.RDX.api, v = Math.max(0.06, 1 / (1 + dist * 0.12)) * 0.5;
    try { if (kind === 'shout') { api.tone(880, 0.09, v, 'square'); api.tone(1320, 0.09, v, 'square', 0.1); } else if (kind === 'hurt') { api.noise(0.12, 5000, 800, v * 1.2, 'bandpass'); api.tone(300, 0.08, v * 0.6, 'sawtooth', 0, 120); } else { api.tone(700, 0.7, v, 'sawtooth', 0, 60); api.noise(0.5, 4000, 300, v, 'bandpass'); api.noise(0.2, 6000, 1000, v, 'highpass', 0.5); } } catch (x) { }
    return;
  }
  const AC = A.AC, out = AC.createGain(), pan = AC.createStereoPanner ? AC.createStereoPanner() : null, lp = AC.createBiquadFilter();
  const yw = (typeof yaw !== "undefined" ? yaw : 0), rx = dx * Math.cos(yw) - dz * Math.sin(yw);                       // sideways offset relative to where you look
  const vol = Math.max(0.02, 1 / (1 + dist * 0.12)) * 0.75; out.gain.value = vol; lp.type = 'lowpass'; lp.frequency.value = Math.max(900, 7000 - dist * 90);
  out.connect(lp); if (pan) { pan.pan.value = Math.max(-1, Math.min(1, rx / Math.max(6, dist) * -1)); lp.connect(pan); pan.connect(A.master); } else lp.connect(A.master);
  (SOUNDS[kind] || SOUNDS.hurt)(A, out, AC.currentTime + 0.01, e._pitch * (big ? 0.85 : 1));
}
window.rdVoice = speak;

// ───────── watch every soldier ─────────
const dying = [];
// blown-up soldiers are launched away from the blast, tumbling, and land far off
const flying = [];
function startFly(e) {
  const m = e.mesh, b = e.blastP; if (!m || !b) return false; let dx = m.position.x - b.x, dz = m.position.z - b.z; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
  const far = 10 + b.f * 26 + Math.random() * 6; m.rotation.order = 'YXZ';
  flying.push({ e, m, x0: m.position.x, z0: m.position.z, dx, dz, far, up: 6 + b.f * 9, t0: performance.now(), dur: 1500 + b.f * 900, sx: (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 5), sz: (Math.random() - 0.5) * 8 });
  return true;
}
function stepFly() {
  const now = performance.now();
  for (let i = flying.length - 1; i >= 0; i--) {
    const f = flying[i], k = Math.min(1, (now - f.t0) / f.dur), d = f.far * (1 - (1 - k) * (1 - k));
    f.m.position.x = f.x0 + f.dx * d; f.m.position.z = f.z0 + f.dz * d; f.m.position.y = Math.max(0.22, 4 * f.up * k * (1 - k));
    f.m.rotation.x = -Math.PI / 2 * Math.min(1, k * 3) - f.sx * k * 2; f.m.rotation.z = f.sz * k;
    if (k >= 1) { f.m.rotation.x = -Math.PI / 2; f.m.rotation.z = 0; f.m.position.y = 0.22; const R = window.RAID; (R.containers || []).forEach(c => { if (c.mesh === f.m) { c.x = f.m.position.x; c.z = f.m.position.z; } }); flying.splice(i, 1); }
  }
}
function list() { const l = (typeof enemies !== 'undefined' && enemies) ? enemies.slice() : []; try { if (window.BATTLE && window.BATTLE.allies) l.push.apply(l, window.BATTLE.allies); } catch (x) {} return l; }
function tick() {
  const R = window.RAID; if (!R || !R.on || R.over) return; const now = performance.now() / 1000;
  list().forEach(e => {
    if (!e.mesh) return; const s = e._v || (e._v = { hp: e.hp, alive: e.alive !== false, alert: false, t: 0, cough: now + 6 + Math.random() * 8 });
    const al = e.alive !== false;
    if (s.alive && !al) { if (e.blastP && startFly(e)) speak('scream', e); else { speak('death', e, e.type === 'heavy' || e.type === 'boss'); startFall(e); } }
    else if (al) {
      if (e.hp < s.hp - 0.5 && now - s.t > 0.45) { speak('hurt', e); s.t = now; }
      const alerted = (e.alertT || 0) > 0; if (alerted && !s.alert && now - s.t > 0.3 && Math.random() < 0.75) { speak('shout', e); s.t = now; } s.alert = alerted;
      if (e.hp < (e.maxHp || 100) * 0.35 && now > s.cough) { speak('cough', e); s.cough = now + 7 + Math.random() * 9; }
    }
    s.hp = e.hp; s.alive = al;
  });
}
// dead soldiers topple instead of snapping flat, then a blood pool spreads under them
function startFall(e) {
  const m = e.mesh; if (!m || e._fell) return; e._fell = true; const flatX = m.rotation.x, flatY = m.position.y; if (m.userData.hy) return;
  m.rotation.order = 'YXZ'; const side = Math.random() < 0.5 ? -1 : 1, spin = (Math.random() - 0.5) * 0.9, t0 = performance.now();
  m.rotation.x = 0; m.position.y = 0; let pool = null;
  try { pool = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshStandardMaterial({ color: 0x4a0707, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); pool.rotation.x = -Math.PI / 2; pool.position.set(m.position.x, 0.02, m.position.z); pool.scale.setScalar(0.01); scene.add(pool); } catch (x) {}
  dying.push({ e, m, flatX, flatY, side, spin, t0, pool });
}
function step() {
  stepFly();
  const now = performance.now();
  for (let i = dying.length - 1; i >= 0; i--) {
    const d = dying[i], k = Math.min(1, (now - d.t0) / 650), ease = k * k * (3 - 2 * k), bounce = k > 0.85 ? Math.sin((k - 0.85) / 0.15 * Math.PI) * 0.03 : 0;
    d.m.rotation.x = d.flatX * ease; d.m.rotation.z = d.side * 0.5 * Math.sin(ease * Math.PI) * 0.6 + d.spin * ease; d.m.position.y = Math.max(d.flatY, (1 - ease) * 0.4 * (1 - ease)) + bounce;
    if (d.pool) d.pool.scale.setScalar(0.01 + Math.min(1, (now - d.t0) / 9000) * 0.75);
    if (k >= 1 && (!d.pool || now - d.t0 > 9000)) dying.splice(i, 1);
  }
}
function animate() { step(); requestAnimationFrame(animate);
}
setInterval(() => { tick(); if (document.hidden) step(); }, 70); requestAnimationFrame(animate);
// explosions: remember so the next death sounds like a scream
const _blast = window.RDX && window.RDX.api && window.RDX.api.blast;
})();
