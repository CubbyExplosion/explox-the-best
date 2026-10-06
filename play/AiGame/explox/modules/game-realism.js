// ─── EXPLOX REALISM ──────────────────────────────────────────────────────────────────────────────
// "make explox more realistic" — a self-contained graphics upgrade that does NOT touch the game's own logic.
// It loads right after three.min.js (BEFORE game-core.js) and upgrades THREE itself, so everything the game builds afterwards gets it:
//
//   🌞 SOFT SHADOWS   the sun (the first DirectionalLight the game makes) casts real shadows around the player; its direction follows the
//                     game's own time of day (getDayNightBrightness) and it turns off when the sun is under the horizon.
//   🪨 SURFACE LOOK   every MeshLambertMaterial gets a subtle world-space mottling (two scales of noise) so big flat walls and ground stop
//                     looking like flat paint — no textures to download, nothing to stretch on the huge world.
//   ☁️ A REAL SKY     a gradient dome (zenith -> horizon colour taken from the game's own fog/sky colours, so day/night/weather/season keep
//                     working), a sun glow + disc, drifting clouds (more and darker in rain/storms), stars and a moon at night.
//                     It hides itself in space zones, the Wrath / Satan judgment skies and anywhere the game wants its own flat sky.
//   ✨ SMOOTHER PICTURE  antialiasing on, filmic tone mapping (nicer highlights), and a very light vignette.
//
//   QUALITY: phones/tablets (coarse pointer or narrow screen) default to 'low' = no shadows, no mottling, no tone mapping, no antialias
//   (the sky is kept: it is cheap). Desktops default to 'high'. Override: localStorage 'explox_gfx' = 'low' | 'high', or  exploxGfx.set('low')
//   (reloads). If anything here ever misbehaves:  localStorage.explox_gfx = 'off'  turns the whole file off.
//
// Tested against three.js r128 (the version Explox ships). Every risky part is wrapped in try/catch so a failure can never stop the game.
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;
  var saved = null; try { saved = localStorage.getItem('explox_gfx'); } catch (e) {}
  if (saved === 'off') return;
  var coarse = false; try { coarse = window.matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 700; } catch (e) {}
  var QUALITY = saved === 'low' || saved === 'high' ? saved : (coarse ? 'low' : 'high');
  var HIGH = QUALITY === 'high';
  window.exploxGfx = { quality: QUALITY, set: function (q) { try { localStorage.setItem('explox_gfx', q); } catch (e) {} location.reload(); }, get sun() { return sun; } };

  var sun = null;

  // ---- 1. the main renderer: antialias, shadows, tone mapping (the shop-preview renderer passes its own canvas and is left alone) ----
  try {
    var OrigRenderer = THREE.WebGLRenderer;
    THREE.WebGLRenderer = function (params) {
      var isMain = !params || !params.canvas;
      if (isMain) { params = Object.assign({}, params, { antialias: HIGH, powerPreference: 'high-performance' }); }
      var r = new OrigRenderer(params);
      if (isMain && HIGH) {
        try {
          r.shadowMap.type = THREE.PCFSoftShadowMap;
          // the game sets  renderer.shadowMap.enabled = false  right after creating the renderer — keep shadows on regardless
          Object.defineProperty(r.shadowMap, 'enabled', { get: function () { return true; }, set: function () {}, configurable: true });
          r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.45;
        } catch (e) {}
      }
      return r;
    };
    THREE.WebGLRenderer.prototype = OrigRenderer.prototype;
    for (var k in OrigRenderer) { try { THREE.WebGLRenderer[k] = OrigRenderer[k]; } catch (e) {} }
  } catch (e) {}

  // ---- 2. every mesh casts + receives shadows (glass and see-through things don't cast) ----
  var windowMats = [], windowSeen = typeof Set !== 'undefined' ? new Set() : null, _hsl = { h: 0, s: 0, l: 0 };
  function geoSize(g) {                                                   // the biggest dimension of a mesh's geometry (cheap, from its constructor parameters)
    var p = g && g.parameters; if (!p) return 99;
    if (p.width !== undefined) return Math.max(p.width, p.height || 0, p.depth || 0);
    if (p.radius !== undefined) return p.radius * 2;
    if (p.radiusTop !== undefined) return Math.max(p.radiusTop, p.radiusBottom || 0) * 2 + 0 * (p.height || 0);
    return 99;
  }
  function geoThin(g) {                                                   // a flat pane (a window): one dimension is small
    var p = g && g.parameters; if (!p || p.width === undefined) return false;
    return Math.min(p.width, p.height, p.depth || 99) <= 0.6 && Math.max(p.width, p.height, p.depth || 0) >= 1.2;
  }
  function looksLikeWindowColor(c) {                                      // pale blue / cyan glass
    if (!c || !c.getHSL) return false;
    c.getHSL(_hsl);
    return _hsl.h >= 0.48 && _hsl.h <= 0.60 && _hsl.s >= 0.45 && _hsl.l >= 0.62 && _hsl.l <= 0.92;
  }
  if (HIGH) {
    try {
      var OrigMesh = THREE.Mesh;
      THREE.Mesh = function (geometry, material) {
        var m = new OrigMesh(geometry, material);
        var mat = Array.isArray(material) ? material[0] : material;
        var seeThrough = mat && (mat.transparent || mat.opacity < 1);
        m.castShadow = !seeThrough && geoSize(geometry) >= 0.4;          // glass and tiny things (coins, buttons, stickers) don't cast shadows
        m.receiveShadow = true;
        // windows: thin pale-blue panes get a warm glow at night (see updateWindows)
        try {
          if (mat && mat.isMeshLambertMaterial && !mat.userData.xrWin && mat.emissive && mat.emissive.getHex() === 0 && geoThin(geometry) && looksLikeWindowColor(mat.color)) {
            mat.userData.xrWin = true; windowMats.push(mat);
          }
        } catch (e) {}
        return m;
      };
      THREE.Mesh.prototype = OrigMesh.prototype;
      for (var mk in OrigMesh) { try { THREE.Mesh[mk] = OrigMesh[mk]; } catch (e) {} }
    } catch (e) {}
  }

  // ---- 3. the sun: the game's own `sunLight` (modules build) — or, in the older single-file build where it is a local variable, the first
  //         DirectionalLight the game creates — becomes the shadow-casting sun (adopted in updateSun below) ----
  var firstDir = null;
  try {
    var OrigDir = THREE.DirectionalLight;
    THREE.DirectionalLight = function (color, intensity) { var l = new OrigDir(color, intensity); if (!firstDir) firstDir = l; return l; };
    THREE.DirectionalLight.prototype = OrigDir.prototype;
  } catch (e) {}
  function adoptSun(l) {
    sun = l; l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    var c = l.shadow.camera; c.left = -70; c.right = 70; c.top = 70; c.bottom = -70; c.near = 1; c.far = 420;
    l.shadow.bias = -0.0006; l.shadow.normalBias = 0.04; l.shadow.radius = 3;
    if (l.shadow.map) { l.shadow.map.dispose(); l.shadow.map = null; }
  }

  // ---- 4. surface mottling: world-space noise multiplied into every Lambert material (two scales) ----
  if (HIGH) {
    try {
      var OrigLambert = THREE.MeshLambertMaterial;
      THREE.MeshLambertMaterial = function (params) {
        var m = new OrigLambert(params);
        m.customProgramCacheKey = function () { return 'xr-lambert-1'; };
        m.onBeforeCompile = function (shader) {
          shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nvarying vec3 vXrWorld;')
            .replace('#include <begin_vertex>', '#include <begin_vertex>\n vec4 xrP = vec4(transformed, 1.0);\n #ifdef USE_INSTANCING\n xrP = instanceMatrix * xrP;\n #endif\n vXrWorld = (modelMatrix * xrP).xyz;');
          shader.fragmentShader = shader.fragmentShader
            .replace('#include <common>', '#include <common>\nvarying vec3 vXrWorld;\n' +
              'float xrHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }\n' +
              'float xrNoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);\n' +
              ' return mix(mix(mix(xrHash(i), xrHash(i + vec3(1,0,0)), f.x), mix(xrHash(i + vec3(0,1,0)), xrHash(i + vec3(1,1,0)), f.x), f.y),\n' +
              '            mix(mix(xrHash(i + vec3(0,0,1)), xrHash(i + vec3(1,0,1)), f.x), mix(xrHash(i + vec3(0,1,1)), xrHash(i + vec3(1,1,1)), f.x), f.y), f.z); }')
            .replace('#include <color_fragment>', '#include <color_fragment>\n' +
              ' float xrFine = xrNoise(vXrWorld * 3.1), xrBig = xrNoise(vXrWorld * 0.18);\n' +
              ' diffuseColor.rgb *= 0.90 + 0.13 * xrFine + 0.10 * xrBig;');
        };
        return m;
      };
      THREE.MeshLambertMaterial.prototype = OrigLambert.prototype;
    } catch (e) {}
  }

  // ---- 5. the sky: dome + sun + clouds + stars (built once the game has a scene and a camera) ----
  var dome = null, domeMat = null, vignette = null, t0 = performance.now();
  function skyOverride() {                                      // places where the game wants its own flat sky
    try {
      if (typeof wrathActive !== 'undefined' && (wrathActive || (typeof safePeriodEndsAt !== 'undefined' && Date.now() < safePeriodEndsAt))) return true;
      if (typeof satanReignActive !== 'undefined' && satanReignActive) return true;
      if (typeof currentSpaceZone === 'function' && currentSpaceZone()) return true;
    } catch (e) {}
    return false;
  }
  function buildSky() {
    var vs = 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
    var fs = [
      'precision highp float; varying vec3 vDir;',
      'uniform vec3 uHorizon, uZenith, uSunDir, uMoonDir; uniform float uDay, uTime, uCover, uDark, uStars;',
      'float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
      'float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h2(i), h2(i+vec2(1,0)), f.x), mix(h2(i+vec2(0,1)), h2(i+vec2(1,1)), f.x), f.y); }',
      'float fbm(vec2 p){ float a = 0.5, s = 0.0; for(int i=0;i<5;i++){ s += a*n2(p); p = p*2.03 + 7.1; a *= 0.5; } return s; }',
      'void main(){',
      ' vec3 d = normalize(vDir); float up = max(d.y, 0.0);',
      ' vec3 col = mix(uHorizon, uZenith, pow(up, 0.55));',
      ' if (d.y < 0.0) col = uHorizon;',
      ' float sd = max(dot(d, uSunDir), 0.0);',
      ' col += vec3(1.0, 0.85, 0.6) * (pow(sd, 6.0) * 0.22 + pow(sd, 90.0) * 0.55) * uDay * (1.0 - uCover * 0.7);',
      ' col += vec3(1.0, 0.97, 0.88) * smoothstep(0.9993, 0.9997, sd) * uDay * (1.0 - uCover);',
      ' float md = max(dot(d, uMoonDir), 0.0);',
      ' col += vec3(0.85, 0.9, 1.0) * smoothstep(0.9990, 0.9994, md) * (1.0 - uDay) * (1.0 - uCover);',
      ' if (uStars > 0.01 && d.y > 0.02) { vec2 sp = d.xz / (d.y + 0.35) * 55.0; float s = h2(floor(sp)); float tw = 0.6 + 0.4 * sin(uTime * 2.0 + s * 40.0);',
      '   col += vec3(1.0) * step(0.9965, s) * tw * uStars * smoothstep(0.02, 0.25, d.y) * (1.0 - uCover); }',
      ' if (d.y > 0.0) { vec2 cp = d.xz / (d.y + 0.18) * 1.4 + vec2(uTime * 0.012, uTime * 0.004);',
      '   float c = fbm(cp); float cov = mix(0.50, 0.30, uCover); float m = smoothstep(cov, cov + 0.22, c) * smoothstep(0.0, 0.22, d.y);',
      '   vec3 cc = mix(vec3(1.0), vec3(0.42, 0.45, 0.5), uDark); cc = mix(cc * 0.18, cc, max(uDay, 0.0));',
      '   cc = mix(cc, uHorizon * 1.15, 0.25); col = mix(col, cc, m * (0.75 + 0.2 * uCover)); }',
      ' gl_FragColor = vec4(col, 1.0); }'
    ].join('\n');
    domeMat = new THREE.ShaderMaterial({
      vertexShader: vs, fragmentShader: fs, side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { uHorizon: { value: new THREE.Color() }, uZenith: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uMoonDir: { value: new THREE.Vector3(0, -1, 0) },
                  uDay: { value: 1 }, uTime: { value: 0 }, uCover: { value: 0.25 }, uDark: { value: 0 }, uStars: { value: 0 } }
    });
    dome = new THREE.Mesh(new THREE.SphereGeometry(5200, 32, 16), domeMat);
    dome.castShadow = false; dome.receiveShadow = false; dome.renderOrder = -100; dome.frustumCulled = false;
    scene.add(dome);
    // a very light vignette (a soft darkening toward the corners)
    if (HIGH && !vignette) {
      vignette = document.createElement('div');
      vignette.style.cssText = 'position:fixed;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse at center, rgba(0,0,0,0) 62%, rgba(0,0,0,0.16) 100%);';
      document.body.appendChild(vignette);
    }
  }
  var _hz = new THREE.Color(), _zn = new THREE.Color(), _blue = new THREE.Color(0x2a62c8), _sd = new THREE.Vector3();
  function updateSky(now) {
    if (typeof scene === 'undefined' || !scene || typeof camera === 'undefined' || !camera || !scene.fog) return;
    if (!dome || dome.parent !== scene) { if (dome && dome.parent) dome.parent.remove(dome); try { buildSky(); } catch (e) { dome = null; return; } }
    var override = skyOverride();
    dome.visible = !override;
    if (vignette) vignette.style.display = override ? 'none' : 'block';
    if (override) return;
    dome.position.copy(camera.position);
    var day = 1, frac = 0.5;
    try { if (typeof getDayNightBrightness === 'function') { var b = getDayNightBrightness(); day = b.raw; frac = b.frac; } } catch (e) {}
    if (typeof isPlayerIndoors === 'function') { try { if (isPlayerIndoors()) { dome.visible = false; return; } } catch (e) {} }
    var wk = typeof currentWeatherKey !== 'undefined' ? currentWeatherKey : 'clear';
    var cover = wk === 'storm' ? 1 : wk === 'rain' ? 0.85 : wk === 'fog' ? 0.7 : 0.25 + 0.15 * Math.sin(now * 0.00002);
    _hz.copy(scene.fog.color);                                        // the horizon IS the fog colour, so ground fades into the sky seamlessly
    _zn.copy(scene.background).lerp(_blue, 0.35 * day * (1 - cover)).multiplyScalar(0.82 + 0.1 * day);   // overhead is a deeper version of the sky colour
    domeMat.uniforms.uHorizon.value.copy(_hz); domeMat.uniforms.uZenith.value.copy(_zn);
    var a = (frac - 0.25) * Math.PI * 2;                              // 0 = sunrise (frac .25), PI/2 = noon (.5), PI = sunset (.75)
    _sd.set(Math.cos(a) * 0.82, Math.sin(a), 0.4).normalize();
    domeMat.uniforms.uSunDir.value.copy(_sd); domeMat.uniforms.uMoonDir.value.copy(_sd).multiplyScalar(-1);
    domeMat.uniforms.uDay.value = Math.max(0, Math.min(1, (day - 0.15) / 0.5));
    domeMat.uniforms.uStars.value = Math.max(0, Math.min(1, (0.35 - day) / 0.3));
    domeMat.uniforms.uCover.value = cover; domeMat.uniforms.uDark.value = (wk === 'storm' ? 1 : wk === 'rain' ? 0.7 : 0.1);
    domeMat.uniforms.uTime.value = (now - t0) / 1000;
  }

  // ---- 6. keep the sun's shadow around the player and pointing the way the sun really is ----
  function updateSun() {
    if (!HIGH || typeof scene === 'undefined' || !scene) return;
    var cand = (typeof sunLight !== 'undefined' && sunLight && sunLight.isDirectionalLight) ? sunLight : firstDir;
    if (cand && sun !== cand) adoptSun(cand);
    if (!sun || typeof playerGroup === 'undefined' || !playerGroup) return;
    if (!sun.target.parent) scene.add(sun.target);
    var px = playerGroup.position.x, pz = playerGroup.position.z, frac = 0.5;
    try { if (typeof getDayNightBrightness === 'function') frac = getDayNightBrightness().frac; } catch (e) {}
    var a = (frac - 0.25) * Math.PI * 2, elev = Math.sin(a);
    var dx = Math.cos(a) * 0.82, dy = Math.max(0.5, elev), dz = 0.4, len = Math.hypot(dx, dy, dz);   // (never lower than ~30 degrees: a grazing sun made dusk streets far too dark to play in)
    sun.position.set(px + dx / len * 150, dy / len * 150, pz + dz / len * 150);
    sun.target.position.set(px, 0, pz); sun.target.updateMatrixWorld();
    var shouldCast = elev > 0.1 && !skyOverride() && !shadowsOff;   // no shadows from a sun that has set (or in space / judgment skies, or on a slow machine)
    if (sun.castShadow !== shouldCast) sun.castShadow = shouldCast;
  }

  // ---- 6b. moonlight: a soft cool fill that fades in outdoors at night so streets stay readable (the game's own night ambient is only 0.25) ----
  var moon = null;
  function updateMoon() {
    if (typeof scene === 'undefined' || !scene) return;
    if (!moon || moon.parent !== scene) {
      if (moon && moon.parent) moon.parent.remove(moon);
      moon = new THREE.HemisphereLight(0x7f95e0, 0x1b1b2e, 0); scene.add(moon);   // (added at intensity 0 right away so the shaders compile once, up front)
    }
    var day = 1; try { if (typeof getDayNightBrightness === 'function') day = getDayNightBrightness().raw; } catch (e) {}
    var night = Math.max(0, Math.min(1, (0.4 - day) / 0.3));
    var inside = false; try { inside = typeof isPlayerIndoors === 'function' && isPlayerIndoors(); } catch (e) {}
    var target = (inside || skyOverride()) ? 0 : 0.42 * night;
    if (Math.abs(moon.intensity - target) > 0.005) moon.intensity += (target - moon.intensity) * 0.2;
  }

  // ---- 7. windows glow at night (about 2 in 3 are lit; they're dark by day) ----
  var _lastNight = -1;
  function updateWindows() {
    if (!windowMats.length) return;
    var day = 1; try { if (typeof getDayNightBrightness === 'function') day = getDayNightBrightness().raw; } catch (e) {}
    var night = Math.max(0, Math.min(1, (0.45 - day) / 0.3));          // 0 by day ... 1 deep night
    if (Math.abs(night - _lastNight) < 0.02) return;
    _lastNight = night;
    for (var i = 0; i < windowMats.length; i++) {
      var m = windowMats[i], lit = (m.id % 3) !== 0;
      m.emissive.setHex(lit ? 0xffcf75 : 0x000000);
      m.emissiveIntensity = lit ? night * 0.9 : 0;
    }
  }

  // ---- 8. adaptive quality: if the game stays slow, shadows turn themselves off (then the pixel ratio drops) so it stays playable ----
  var shadowsOff = false, fpsFrames = 0, fpsStart = performance.now(), slowRuns = 0, ladder = 0;
  try { shadowsOff = localStorage.getItem('explox_gfx_shadows_off') === '1'; } catch (e) {}
  function adaptive(now) {
    if (!HIGH) return;
    if (document.hidden) { fpsFrames = 0; fpsStart = now; return; }
    fpsFrames++;
    if (now - fpsStart < 3000) return;
    var fps = fpsFrames * 1000 / (now - fpsStart); fpsFrames = 0; fpsStart = now;
    slowRuns = fps < 26 ? slowRuns + 1 : 0;
    if (slowRuns >= 2 && ladder < 2) {
      slowRuns = 0; ladder++;
      if (ladder === 1) { shadowsOff = true; try { localStorage.setItem('explox_gfx_shadows_off', '1'); } catch (e) {} if (typeof showNotif === 'function') showNotif('⚡ Shadows turned off to keep the game smooth.'); }
      else { try { renderer.setPixelRatio(1); } catch (e) {} if (typeof showNotif === 'function') showNotif('⚡ Picture sharpness lowered to keep the game smooth.'); }
    }
  }
  window.exploxGfx.set = function (q) { try { localStorage.setItem('explox_gfx', q); localStorage.removeItem('explox_gfx_shadows_off'); } catch (e) {} location.reload(); };

  function loop(now) {
    requestAnimationFrame(loop);
    try { updateSky(now); updateSun(); updateMoon(); updateWindows(); adaptive(now); } catch (e) { /* never break the game */ }
  }
  window.exploxGfx._tick = function (now) { updateSky(now || performance.now()); updateSun(); updateMoon(); updateWindows(); };     // (for testing in a tab that isn't drawing frames)
  window.addEventListener('load', function () { requestAnimationFrame(loop); });
})();
