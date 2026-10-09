// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN RAID — ATMOSPHERE  (real-life sun, sky, shadows and surroundings)
//
//   TIME OF DAY   every raid rolls dawn / morning / noon / golden hour / dusk / night / overcast (harder sectors lean towards dusk & night;
//                 caves and subways are dim and sunless; the space wreck is always night). The sun's height, direction, colour and strength
//                 follow the time of day, so shadows are long and orange at golden hour and short and hard at noon.
//   SKY           a gradient sky dome with a glowing sun disc, haze at the horizon, drifting clouds and, at night, stars and a moon light.
//   SHADOWS       one big soft sun shadow that FOLLOWS you (sharp near you, snapped to the shadow-map texels so it never shimmers).
//   AIR           exponential distance haze tinted like the horizon, floating dust motes in the sunlight.
//   GROUND        scattered rocks, pebbles and (on suitable maps) grass tufts so the floor is not a flat plane.
//   REFLECTIONS   the real sky is baked into the reflection map, so gun metal reflects the actual sun and sky.
//
// rdAtmosphere(...) returns { label, update(dt) }. It replaces the simple lights the original map builder added.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const rnd = (a, b) => a + Math.random() * (b - a);
const C = h => new THREE.Color(h);

// elev = sun height in degrees, az = compass direction in degrees (random), sun/moon light colour + strength, sky colours, fog density, exposure
const PRESETS = {
  dawn:     { label: '🌅 Dawn',        elev: 9,   sun: 0xffb27a, sunI: 1.0, top: 0x486a9a, hor: 0xffc79a, ground: 0x3a3a40, hemiS: 0xaab8d8, hemiG: 0x4a4040, hemiI: 0.45, fog: 0xe9c3a0, dens: 0.0085, exp: 1.05, clouds: 0.5, stars: 0.0 },
  morning:  { label: '☀️ Morning',     elev: 32,  sun: 0xfff1da, sunI: 1.9, top: 0x4f88cc, hor: 0xcfe4f4, ground: 0x4a4a44, hemiS: 0xbcd6f0, hemiG: 0x5a5448, hemiI: 0.55, fog: 0xd2e2ee, dens: 0.0048, exp: 1.0,  clouds: 0.6, stars: 0.0 },
  noon:     { label: '🌞 Midday',      elev: 66,  sun: 0xfffaf0, sunI: 2.3, top: 0x2f70c4, hor: 0xbfdaef, ground: 0x4a4a44, hemiS: 0xc4dcf4, hemiG: 0x625a4c, hemiI: 0.6,  fog: 0xc4dcee, dens: 0.0036, exp: 0.95, clouds: 0.5, stars: 0.0 },
  golden:   { label: '🌇 Golden hour', elev: 13,  sun: 0xff9d4e, sunI: 2.0, top: 0x375e96, hor: 0xffb878, ground: 0x3a3430, hemiS: 0xb8c4e0, hemiG: 0x584438, hemiI: 0.45, fog: 0xf0b588, dens: 0.0062, exp: 1.05, clouds: 0.7, stars: 0.0 },
  dusk:     { label: '🌆 Dusk',        elev: 3,   sun: 0xff6a38, sunI: 1.1, top: 0x1c2e58, hor: 0xff7c54, ground: 0x22201f, hemiS: 0x6678a8, hemiG: 0x3a2a2a, hemiI: 0.4,  fog: 0xb8705a, dens: 0.008,  exp: 1.15, clouds: 0.6, stars: 0.25 },
  night:    { label: '🌙 Night',       elev: -28, sun: 0x8aa8e0, sunI: 0.5, top: 0x040810, hor: 0x16223c, ground: 0x0a0c12, hemiS: 0x3a4c7a, hemiG: 0x14161c, hemiI: 0.5,  fog: 0x0c1428, dens: 0.0058, exp: 1.5,  clouds: 0.2, stars: 1.0, moon: true },
  overcast: { label: '☁️ Overcast',    elev: 40,  sun: 0xdfe6ee, sunI: 0.45, top: 0x8c98a6, hor: 0xb4bcc4, ground: 0x4a4a4c, hemiS: 0xc4ccd6, hemiG: 0x58585a, hemiI: 1.0, fog: 0xb0b8c0, dens: 0.0095, exp: 1.05, clouds: 1.0, stars: 0.0, flat: true },
  indoor:   { label: '🕯️ Dim light',   elev: 50,  sun: 0xc8d0d8, sunI: 0.25, top: 0x30343a, hor: 0x464c52, ground: 0x24262a, hemiS: 0x8a929a, hemiG: 0x3a3a3c, hemiI: 0.9, fog: 0x40464c, dens: 0.014,  exp: 1.25, clouds: 0.0, stars: 0.0, flat: true }
};
function pickPreset(theme, diff) {
  const st = theme && theme.style;
  if (st === 'wreck') return 'night'; if (st === 'tunnel' || st === 'subway') return 'indoor'; if (st === 'bunker') return 'overcast';
  if (st === 'lava') return Math.random() < 0.5 ? 'dusk' : 'night';
  if (st === 'dune') return ['noon', 'golden', 'morning'][Math.floor(Math.random() * 3)];
  const d = diff ? diff.id : 1;
  const w = d <= 0 ? [['morning', 3], ['noon', 3], ['golden', 1.5], ['overcast', 1.5], ['dawn', 1]]
    : d === 1 ? [['dawn', 1], ['morning', 2], ['noon', 2], ['golden', 1.5], ['dusk', 1], ['overcast', 1.5], ['night', 0.7]]
    : [['dawn', 1.2], ['morning', 1.2], ['noon', 1.2], ['golden', 1.5], ['dusk', 2], ['night', 2.2], ['overcast', 1.5]];
  let t = 0; w.forEach(x => t += x[1]); let r = Math.random() * t; for (const x of w) { r -= x[1]; if (r <= 0) return x[0]; } return 'noon';
}

const SKY_VS = 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const SKY_FS = `uniform vec3 top; uniform vec3 hor; uniform vec3 ground; uniform vec3 sunDir; uniform vec3 sunCol; uniform float glow; uniform float boost; varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir); float h = d.y;
  vec3 col = mix(hor, top, pow(clamp(h, 0.0, 1.0), 0.42));
  col = mix(col, ground, 1.0 - smoothstep(-0.22, 0.0, h));
  float s = max(dot(d, normalize(sunDir)), 0.0);
  col += sunCol * (pow(s, 5.0) * 0.20 * glow + pow(s, 60.0) * 0.55 * glow);
  col += sunCol * smoothstep(0.99975, 0.99992, s) * 5.0 * boost;
  gl_FragColor = vec4(col, 1.0);
}`;
function skyMaterial(P, sunDir, boost) {
  return new THREE.ShaderMaterial({ vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: C(P.top) }, hor: { value: C(P.hor) }, ground: { value: C(P.ground) }, sunDir: { value: sunDir.clone() }, sunCol: { value: C(P.sun) }, glow: { value: P.elev < -5 ? 0.0 : 1.0 }, boost: { value: boost } } });
}
function cloudTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  for (let i = 0; i < 26; i++) { const cx = 40 + Math.random() * 176, cy = 44 + Math.random() * 40, r = 22 + Math.random() * 34; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 6.3); x.fill(); }
  const t = new THREE.CanvasTexture(c); return t;
}
function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c);
}

window.rdAtmosphere = function (scene, renderer, camera, theme, mapIndex, diff, buildings, blocked) {
  const forced = window.RDSET && window.RDSET.time && PRESETS[window.RDSET.time] ? window.RDSET.time : null;       // Settings → Time of day
  const key = forced || pickPreset(theme, diff), P = PRESETS[key], touch = matchMedia('(pointer: coarse)').matches;
  const shq = (window.RDSET && window.RDSET.shadows) || 'high';
  // remove the simple lights the original map builder created
  const old = []; scene.traverse(o => { if (o.isAmbientLight || o.isDirectionalLight || o.isHemisphereLight) old.push(o); }); old.forEach(o => scene.remove(o));
  const az = rnd(0, Math.PI * 2), el = P.elev * Math.PI / 180;
  const sunDir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).normalize();
  const lightDir = P.elev < -3 ? new THREE.Vector3(-sunDir.x, Math.abs(sunDir.y) + 0.5, -sunDir.z).normalize() : sunDir.clone();   // at night the "moon" shines from the opposite side, high up
  const stuff = [];                                                                           // everything we add, for clean-up

  // sky dome (follows the camera, so it is always infinitely far away)
  const dome = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 20), skyMaterial(P, P.elev < -3 ? new THREE.Vector3(-sunDir.x, Math.abs(sunDir.y) + 0.35, -sunDir.z).normalize() : sunDir, 1)); dome.renderOrder = -10; dome.frustumCulled = false; scene.add(dome); stuff.push(dome);
  if (P.elev < -3) { dome.material.uniforms.sunCol.value = C(0xcfe0ff); dome.material.uniforms.glow.value = 0.35; }
  scene.background = null;

  // lights
  const hemi = new THREE.HemisphereLight(P.hemiS, P.hemiG, P.hemiI); scene.add(hemi); stuff.push(hemi);
  const sun = new THREE.DirectionalLight(P.sun, P.sunI); sun.castShadow = shq !== 'off' && (!P.flat || key === 'overcast'); const SZ = shq === 'low' ? 1024 : shq === 'medium' || touch ? 2048 : 4096, HALF = 52;
  sun.shadow.mapSize.set(SZ, SZ); const sc = sun.shadow.camera; sc.left = -HALF; sc.right = HALF; sc.top = HALF; sc.bottom = -HALF; sc.near = 1; sc.far = 320; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05;
  if (P.flat) { sun.shadow.radius = 4; }
  scene.add(sun, sun.target); stuff.push(sun);
  renderer.shadowMap.enabled = shq !== 'off'; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = P.exp;

  // haze that fades the distance into the horizon colour
  scene.fog = new THREE.FogExp2(P.fog, P.dens * (theme && theme.style === 'foliage' ? 1.5 : 1));

  // reflections: bake THIS sky (with a very bright sun) into the environment map
  scene.environment = window.rdMakeSkyEnv ? window.rdMakeSkyEnv(renderer, P, dome.material.uniforms.sunDir.value) : null;

  // clouds
  const clouds = [], ctex = cloudTexture();
  if (P.clouds > 0) {
    const n = Math.round(14 * P.clouds + 3), tint = C(P.hor).lerp(C(0xffffff), key === 'overcast' ? 0.2 : 0.55);
    if (P.elev < 10) tint.lerp(C(P.sun), 0.5); if (key === 'night') tint.multiplyScalar(0.25);
    for (let i = 0; i < n; i++) {
      const m = new THREE.SpriteMaterial({ map: ctex, color: tint, transparent: true, opacity: (key === 'overcast' ? 0.85 : 0.55) * rnd(0.6, 1), depthWrite: false, fog: false });
      const s = new THREE.Sprite(m), a = rnd(0, 6.28), r = rnd(250, 420); s.position.set(Math.cos(a) * r, rnd(70, 190), Math.sin(a) * r); s.scale.set(rnd(160, 300), rnd(60, 110), 1); s.renderOrder = -9; scene.add(s); clouds.push({ s, a, r, h: s.position.y, sp: rnd(0.0006, 0.0018) }); stuff.push(s);
    }
  }
  // stars
  let stars = null;
  if (P.stars > 0) {
    const pos = new Float32Array(1400 * 3); for (let i = 0; i < 1400; i++) { const u = Math.random(), v = Math.random() * 0.95 + 0.05, th = u * 6.283, ph = Math.acos(v); pos[i * 3] = Math.sin(ph) * Math.cos(th) * 420; pos[i * 3 + 1] = Math.cos(ph) * 420; pos[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * 420; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.7, sizeAttenuation: false, transparent: true, opacity: P.stars, depthWrite: false, fog: false })); stars.renderOrder = -9; stars.frustumCulled = false; scene.add(stars); stuff.push(stars);
  }
  // sun / moon glare sprite (hidden behind buildings because it is depth-tested)
  const glare = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color: P.elev < -3 ? 0xcfe0ff : P.sun, transparent: true, opacity: P.elev < -3 ? 0.5 : 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  glare.scale.set(P.elev < -3 ? 40 : 120, P.elev < -3 ? 40 : 120, 1); glare.renderOrder = -8; scene.add(glare); stuff.push(glare);
  const skyDirForGlare = dome.material.uniforms.sunDir.value.clone();

  // dust motes in the light
  const dustN = 160, dpos = new Float32Array(dustN * 3); for (let i = 0; i < dustN; i++) { dpos[i * 3] = rnd(-24, 24); dpos[i * 3 + 1] = rnd(0.3, 9); dpos[i * 3 + 2] = rnd(-24, 24); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: key === 'night' ? 0x8899bb : 0xfff1d8, size: 2.2, sizeAttenuation: false, transparent: true, opacity: key === 'night' || P.flat ? 0.12 : 0.32, map: dotTexture(), depthWrite: false })); dust.frustumCulled = false; scene.add(dust); stuff.push(dust);

  // ground clutter: rocks everywhere, grass where it makes sense
  const style = theme ? theme.style : 'ruin', gcol = C(theme ? theme.ground : 0x444444);
  const spots = (n, minD) => { const out = []; for (let i = 0; i < n * 4 && out.length < n; i++) { const x = rnd(-62, 62), z = rnd(-62, 62); if (!blocked(x, z)) out.push([x, z]); } return out; };
  const rockMat = new THREE.MeshStandardMaterial({ color: gcol.clone().lerp(C(0x808080), 0.35).multiplyScalar(1.15), roughness: 1, flatShading: true });
  const rocks = spots(style === 'lava' ? 320 : 240), rim = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), rockMat, rocks.length), tmp = new THREE.Object3D();
  rocks.forEach((p, i) => { const s = Math.pow(Math.random(), 2.2) * 0.7 + 0.1; tmp.position.set(p[0], s * 0.3, p[1]); tmp.scale.set(s * rnd(0.8, 1.5), s * rnd(0.5, 0.9), s * rnd(0.8, 1.5)); tmp.rotation.set(rnd(0, 3), rnd(0, 6), rnd(0, 3)); tmp.updateMatrix(); rim.setMatrixAt(i, tmp.matrix); });
  rim.castShadow = true; rim.receiveShadow = true; scene.add(rim); stuff.push(rim);
  const grassy = ['ruin', 'foliage', 'farm', 'dock', 'overpass', 'mall', 'skyline', 'dune'].includes(style);
  if (grassy) {
    const dry = style === 'dune' || style === 'farm' || style === 'ruin', gp = spots(style === 'foliage' ? 1900 : 1100);
    const gm = new THREE.InstancedMesh(new THREE.ConeGeometry(0.07, 0.55, 4), new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }), gp.length);
    gp.forEach((p, i) => { const s = rnd(0.6, 1.6); tmp.position.set(p[0], 0.25 * s, p[1]); tmp.scale.set(s, s, s); tmp.rotation.set(rnd(-0.3, 0.3), rnd(0, 6), rnd(-0.3, 0.3)); tmp.updateMatrix(); gm.setMatrixAt(i, tmp.matrix);
      const col = dry ? C(0x8a7a3e).lerp(C(0x5a6a30), Math.random() * 0.6) : C(0x2f6a2a).lerp(C(0x5a8a34), Math.random()); gm.setColorAt(i, col); });
    gm.receiveShadow = true; scene.add(gm); stuff.push(gm);
  }

  const lookTmp = new THREE.Vector3(); let t = 0;
  const ctl = {
    key, label: P.label, preset: P, sunDir: lightDir,
    update(dt) {
      t += dt; const cp = camera.position;
      dome.position.copy(cp); if (stars) stars.position.copy(cp);
      glare.position.copy(cp).addScaledVector(skyDirForGlare, 400);
      // follow the player with the shadow, snapped to whole shadow texels so it does not shimmer
      const texel = (HALF * 2) / SZ; lookTmp.set(Math.round(cp.x / texel) * texel, 0, Math.round(cp.z / texel) * texel);
      sun.target.position.copy(lookTmp); sun.position.copy(lookTmp).addScaledVector(lightDir, 130); sun.target.updateMatrixWorld();
      clouds.forEach(c => { c.a += c.sp * dt; c.s.position.set(cp.x + Math.cos(c.a) * c.r, c.h, cp.z + Math.sin(c.a) * c.r); });
      // dust motes drift and wrap around the camera
      const arr = dust.geometry.attributes.position.array;
      for (let i = 0; i < dustN; i++) { arr[i * 3] += Math.sin(t * 0.3 + i) * 0.004; arr[i * 3 + 1] += Math.sin(t * 0.5 + i * 2) * 0.003; arr[i * 3 + 2] += Math.cos(t * 0.4 + i) * 0.004; }
      dust.geometry.attributes.position.needsUpdate = true; dust.position.set(Math.round(cp.x / 48) * 48, 0, Math.round(cp.z / 48) * 48);
    },
    dispose() { stuff.forEach(o => { if (o._rt) { try { o._rt.dispose(); } catch (e) {} return; } scene.remove(o); }); }
  };
  return ctl;
};
})();
