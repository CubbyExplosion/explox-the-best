// ─── EXPLOX AMBIENCE ─────────────────────────────────────────────────────────────────────────────
// The world used to be silent while you walked: rain + thunder + the music were the only "place" sounds. This adds the quiet things that make a
// place feel real — all synthesized live with Web Audio (no files):
//   👣 FOOTSTEPS   one step per ~1.6 world units walked on foot (not in a car/seat/water/space/flying): wood indoors, pavement outdoors,
//                  a wetter splashier step in rain. Quicker when you run.
//   🐦 BIRDSONG    short bird calls in the daytime outdoors when the weather is clear.
//   🦗 CRICKETS    a soft chirrup at night outdoors.
//   🍃 WIND        a very faint breeze outdoors (louder in 'breezy' weather and storms).
// It follows the game's own M (mute) — bgMusic.isMuted() — and can be switched off with  localStorage.explox_ambience = 'off'  or
// exploxAmbience.set('off'). It uses its OWN AudioContext (created on your first click/key, a browser rule) so it never disturbs the music/sfx.
(function () {
  'use strict';
  var off = false; try { off = localStorage.getItem('explox_ambience') === 'off'; } catch (e) {}
  window.exploxAmbience = { set: function (v) { try { localStorage.setItem('explox_ambience', v); } catch (e) {} location.reload(); } };
  if (off) return;

  var ctx = null, master = null, noise = null, windG = null, last = null, stepAcc = 0, nextBird = 0, nextCricket = 0;

  function start() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
    var len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    noise = buf;
    // wind: filtered noise loop, volume set each tick
    var src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
    windG = ctx.createGain(); windG.gain.value = 0;
    src.connect(lp); lp.connect(windG); windG.connect(master); src.start();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, start, { passive: true }); });
  document.addEventListener('visibilitychange', function () { if (ctx) { if (document.hidden) ctx.suspend(); else ctx.resume(); } });

  function muted() { try { return typeof bgMusic !== 'undefined' && bgMusic.isMuted && bgMusic.isMuted(); } catch (e) { return false; } }
  function indoors() { try { return typeof isPlayerIndoors === 'function' && isPlayerIndoors(); } catch (e) { return false; } }
  function weather() { return typeof currentWeatherKey !== 'undefined' ? currentWeatherKey : 'clear'; }
  function dayAmount() { try { return typeof getDayNightBrightness === 'function' ? getDayNightBrightness().raw : 1; } catch (e) { return 1; } }

  // one footstep: a short burst of filtered noise (+ a low thump for hard floors)
  function step(surface, running) {
    var t = ctx.currentTime, p = { wood: { f: 330, q: 1.2, v: 0.30, d: 0.09, tone: 95 }, pavement: { f: 900, q: 0.8, v: 0.22, d: 0.07, tone: 0 }, wet: { f: 1500, q: 0.6, v: 0.24, d: 0.12, tone: 0 } }[surface];
    var s = ctx.createBufferSource(); s.buffer = noise;
    var bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = 'bandpass'; bp.frequency.value = p.f * (0.85 + Math.random() * 0.3); bp.Q.value = p.q;
    var vol = p.v * (running ? 1.25 : 1) * (0.85 + Math.random() * 0.3);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.001, t + p.d);
    s.connect(bp); bp.connect(g); g.connect(master); s.start(t, Math.random() * 1.5, p.d + 0.05);
    if (p.tone) { var o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.setValueAtTime(p.tone, t); o.frequency.exponentialRampToValueAtTime(p.tone * 0.5, t + 0.06); og.gain.setValueAtTime(vol * 0.5, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.07); o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.08); }
  }
  function chirp() {
    var t0 = ctx.currentTime, n = 2 + Math.floor(Math.random() * 3), base = 2300 + Math.random() * 1800, up = Math.random() < 0.6;
    for (var i = 0; i < n; i++) {
      var t = t0 + i * (0.09 + Math.random() * 0.03), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(base * (up ? 0.8 : 1.15), t); o.frequency.exponentialRampToValueAtTime(base * (up ? 1.2 : 0.85), t + 0.07);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.085);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.1);
    }
  }
  function cricket() {
    var t0 = ctx.currentTime, f = 4200 + Math.random() * 500;
    for (var i = 0; i < 5; i++) {
      var t = t0 + i * 0.075, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.025, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.06);
    }
  }

  function tick() {
    if (!ctx || typeof playerGroup === 'undefined' || !playerGroup) return;
    var now = performance.now() / 1000, silent = muted() || document.hidden;
    var inside = indoors(), w = weather(), day = dayAmount();
    // wind
    var wv = silent || inside ? 0 : (w === 'storm' ? 0.07 : w === 'rain' ? 0.04 : w === 'breezy' ? 0.05 : 0.012);
    try { windG.gain.setTargetAtTime(wv, ctx.currentTime, 0.6); } catch (e) {}
    if (silent) { last = null; return; }
    // footsteps
    var x = playerGroup.position.x, z = playerGroup.position.z;
    var onFoot = !(typeof inCar !== 'undefined' && inCar) && !(typeof playerSeated !== 'undefined' && playerSeated) && (typeof onGround === 'undefined' || onGround) &&
                 !(typeof inWater !== 'undefined' && inWater) && !(typeof inOuterSpace !== 'undefined' && inOuterSpace) && !(typeof adminFlying !== 'undefined' && adminFlying);
    if (last && onFoot) {
      var d = Math.hypot(x - last.x, z - last.z), dt = Math.max(0.001, now - last.t);
      if (d < 6) {                                                     // a bigger jump is a teleport, not a walk
        stepAcc += d;
        var speed = d / dt, stride = speed > 11 ? 2.4 : 1.6;           // running = longer, quicker strides
        if (stepAcc >= stride) { stepAcc = 0; step(inside ? 'wood' : (w === 'rain' || w === 'storm') ? 'wet' : 'pavement', speed > 11); }
      } else stepAcc = 0;
    }
    last = { x: x, z: z, t: now };
    // birds by day, crickets by night (outdoors only)
    if (!inside) {
      if (day > 0.5 && (w === 'clear' || w === 'breezy') && now > nextBird) { chirp(); nextBird = now + 3 + Math.random() * 7; }
      if (day < 0.3 && w !== 'rain' && w !== 'storm' && now > nextCricket) { cricket(); nextCricket = now + 1.2 + Math.random() * 3; }
    }
  }
  setInterval(tick, 80);
})();
