// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — HYPER-REALISTIC MODE   (switched on by ⚙️ Settings → Model style → Smooth; the Blocky style is untouched)
//
//   Everything here is generated in code (no photo-scanned assets), so it is "as realistic as a browser can get without art files":
//
//   LENS      the whole 3D view goes through a post-processing pipeline: HDR bloom around the sun, muzzle flashes and lamps · screen-space
//             ambient occlusion (contact shadows in corners and under things) · god-rays (light shafts) towards the sun · filmic ACES
//             colour · chromatic aberration at the screen edges · depth-of-field blur at the edges while you aim · film grain · FXAA anti-aliasing.
//   SURFACES  procedural PBR materials: concrete, brick-like walls, asphalt, dirt, bark and rock get albedo + NORMAL + ROUGHNESS maps (so light
//             rakes across bumps), every prop becomes a physically-based material that reflects the sky, plus rain puddles that mirror the sky.
//   PEOPLE    soldiers with human proportions: tapered limbs, joints, boots, a real face texture, helmets/caps, vests and a real gun in hand.
//             They have a walk cycle and fall over when shot instead of snapping flat.
//   DETAIL    ejected brass shell casings that bounce and clink, bullet-hole decals on walls, a magazine that drops when you reload.
//   SOUND     a reverb tail on every sound (gunshots echo across the field) and a quiet wind bed.
//
// raid-core.js calls rdHyperInit() at the end of every map build and rdPostRender() instead of renderer.render() while it is active.
// Quality (Settings): High (everything) · Medium (no ambient occlusion) · Low (bloom only, lighter). Phones default to Medium.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const S = () => window.RDSET || {}, touch = matchMedia('(pointer: coarse)').matches;
const quality = () => { const q = S().hyper; return q && q !== 'auto' ? q : (touch ? 'medium' : 'high'); };
const rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ───────────────────────── procedural PBR textures ─────────────────────────
function hash2(ix, iy, seed) { let h = (ix * 374761393 + iy * 668265263 + seed * 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function vnoise(x, y, per, seed) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), x1 = (xi + 1) % per, y1 = (yi + 1) % per, x0 = xi % per, y0 = yi % per; const a = hash2(x0, y0, seed), b = hash2(x1, y0, seed), c = hash2(x0, y1, seed), d = hash2(x1, y1, seed); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function fbm(x, y, per, oct, seed) { let s = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, y * f, per * f, seed + i); n += a; a *= 0.5; f *= 2; } return s / n; }
const KINDS = {
  concrete: { s: 2.4, f: (u, v) => 0.25 + 0.55 * fbm(u * 6, v * 6, 6, 5, 1) + 0.12 * fbm(u * 40, v * 40, 40, 2, 9) - (Math.abs(((v * 5) % 1) - 0.5) > 0.47 ? 0.12 : 0) },
  dirt: { s: 3.0, f: (u, v) => 0.2 + 0.7 * fbm(u * 8, v * 8, 8, 5, 3) + 0.15 * fbm(u * 50, v * 50, 50, 2, 4) },
  asphalt: { s: 3.4, f: (u, v) => 0.35 + 0.35 * fbm(u * 64, v * 64, 64, 3, 5) + 0.2 * fbm(u * 6, v * 6, 6, 3, 6) },
  brick: { s: 4.2, f: (u, v) => { const row = Math.floor(v * 8), bx = (u * 4 + (row % 2) * 0.5) % 1, by = (v * 8) % 1; const m = (bx < 0.05 || by < 0.1) ? 0.1 : 0.55; return m + 0.35 * fbm(u * 20, v * 20, 20, 3, 7); } },
  metal: { s: 2.6, f: (u, v) => 0.5 + 0.35 * Math.sin(u * Math.PI * 2 * 12) + 0.1 * fbm(u * 30, v * 30, 30, 2, 8) },
  bark: { s: 4.5, f: (u, v) => 0.3 + 0.3 * fbm(u * 8, v * 8, 8, 4, 10) + 0.4 * Math.abs(Math.sin(u * Math.PI * 2 * 9 + fbm(u * 6, v * 6, 6, 2, 11) * 5)) },
  rock: { s: 4.0, f: (u, v) => Math.pow(fbm(u * 5, v * 5, 5, 5, 12), 1.3) * 1.3 }
};
const PBR = {};
function pbr(kind) {
  if (PBR[kind]) return PBR[kind]; const N = 256, def = KINDS[kind], H = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) H[y * N + x] = clamp(def.f(x / N, y / N), 0, 1);
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; return c; }, ca = mk(), cn = mk(), cr = mk(), xa = ca.getContext('2d'), xn = cn.getContext('2d'), xr = cr.getContext('2d');
  const ia = xa.createImageData(N, N), inn = xn.createImageData(N, N), ir = xr.createImageData(N, N), at = (x, y) => H[((y + N) % N) * N + ((x + N) % N)];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = (y * N + x) * 4, h = H[y * N + x], nx = -(at(x + 1, y) - at(x - 1, y)) * def.s, ny = (at(x, y + 1) - at(x, y - 1)) * def.s, il = 1 / Math.hypot(nx, ny, 1);
    inn.data[i] = (nx * il * 0.5 + 0.5) * 255; inn.data[i + 1] = (ny * il * 0.5 + 0.5) * 255; inn.data[i + 2] = (il * 0.5 + 0.5) * 255; inn.data[i + 3] = 255;
    const al = (0.55 + h * 0.45) * 255; ia.data[i] = ia.data[i + 1] = ia.data[i + 2] = al; ia.data[i + 3] = 255;
    const ro = (0.62 + (1 - h) * 0.36) * 255; ir.data[i] = ir.data[i + 1] = ir.data[i + 2] = ro; ir.data[i + 3] = 255;
  }
  xa.putImageData(ia, 0, 0); xn.putImageData(inn, 0, 0); xr.putImageData(ir, 0, 0);
  const t = c => { const x = new THREE.CanvasTexture(c); x.wrapS = x.wrapT = THREE.RepeatWrapping; x.anisotropy = 8; return x; };
  return (PBR[kind] = { map: t(ca), normalMap: t(cn), roughnessMap: t(cr) });
}
const TEXCACHE = {};
function tex(kind, key, rx, ry) { const k = kind + key + '|' + rx + '|' + ry; if (!TEXCACHE[k]) { const b = pbr(kind)[key], t = b.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; TEXCACHE[k] = t; } return TEXCACHE[k]; }
function lum(c) { return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; }
// swaps the simple materials of the map for PBR ones with real relief
function upgradeScene(scene) {
  const matCache = new Map();
  scene.traverse(o => {
    if (!o.isMesh || o.userData.hyperDone || o.isSprite) return; const g = o.geometry, m = o.material; if (o.isInstancedMesh && g.type !== 'IcosahedronGeometry') return; if (!m || Array.isArray(m) || m.isShaderMaterial || m.isMeshBasicMaterial || !m.color) return;
    for (let p = o; p; p = p.parent) if (p.isCamera) return;
    const type = g.type, pr = g.parameters || {}; let kind = null, rx = 1, ry = 1, ns = 1;
    if (type === 'PlaneGeometry') { if (Math.abs(o.rotation.x + Math.PI / 2) < 0.05 && pr.width > 60) { kind = lum(m.color) < 0.18 ? 'asphalt' : 'dirt'; rx = Math.round(pr.width / 5); ry = Math.round(pr.height / 5); ns = 1.3; } else if (Math.abs(o.rotation.x + Math.PI / 2) < 0.05 && pr.width > 8 && lum(m.color) < 0.12) { kind = 'asphalt'; rx = Math.max(1, Math.round(pr.width / 4)); ry = Math.max(1, Math.round(pr.height / 4)); } }
    else if (type === 'BoxGeometry') { const w = pr.width, h = pr.height, d = pr.depth; if (Math.max(w, h, d) < 2.2) return; kind = (m.map || lum(m.color) > 0.5) ? 'concrete' : (lum(m.color) > 0.25 && h > 4 && Math.max(w, d) > 8 ? 'brick' : 'concrete'); rx = Math.max(1, Math.round(Math.max(w, d) / 3)); ry = Math.max(1, Math.round(h / 3)); }
    else if (type === 'CylinderGeometry' || type === 'ConeGeometry') { const r = pr.radiusBottom !== undefined ? Math.max(pr.radiusBottom, pr.radiusTop || 0) : pr.radius; if (pr.height > 2.5 && r < 0.7) { kind = 'bark'; rx = 2; ry = Math.max(1, Math.round(pr.height / 2)); } else if (type === 'ConeGeometry') { kind = 'rock'; ns = 0.6; } else return; }
    else if (type === 'IcosahedronGeometry' || type === 'SphereGeometry') { if ((pr.radius || 1) < 0.5) return; kind = 'rock'; }
    if (!kind) return;
    const key = kind + rx + ry + m.color.getHex() + (m.map ? m.map.uuid : ''); let mat = matCache.get(key);
    if (!mat) { mat = new THREE.MeshStandardMaterial({ color: m.color.clone(), roughness: 1, metalness: m.metalness || 0, map: m.map || tex(kind, 'map', rx, ry), normalMap: tex(kind, 'normalMap', rx, ry), roughnessMap: tex(kind, 'roughnessMap', rx, ry), normalScale: new THREE.Vector2(ns, ns), flatShading: false }); matCache.set(key, mat); }
    o.material = mat; o.receiveShadow = true; o.userData.hyperDone = true;
  });
}
// rain puddles that mirror the sky, plus dark dirt patches
function puddles(scene, atmo) {
  const style = themeForMap(RAID.mapIndex || 1).style; if (['dune', 'lava', 'wreck', 'tunnel', 'subway'].includes(style)) return;
  const half = (window.BATTLE && window.BATTLE.on ? window.BATTLE.half * 0.7 : 58), mat = new THREE.MeshStandardMaterial({ color: 0x0a0e13, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.8, envMapIntensity: 2.0, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  for (let i = 0, n = 0; n < 26 && i < 200; i++) { const x = rnd(-half, half), z = rnd(-half, half); if (window.blockedAt(x, z) || window.blockedAt(x + 3, z) || window.blockedAt(x - 3, z) || window.blockedAt(x, z + 3) || window.blockedAt(x, z - 3)) continue; n++;
    const r = rnd(1.2, 3.6), p = new THREE.Mesh(new THREE.CircleGeometry(r, 24), mat); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.06, z); p.scale.set(1, rnd(0.6, 1.1), 1); p.rotation.z = rnd(0, 6.28); p.receiveShadow = true; scene.add(p); }
  const dc = document.createElement('canvas'); dc.width = dc.height = 64; const x = dc.getContext('2d'), g = x.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const dm = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(dc), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  for (let i = 0; i < 30; i++) { const x0 = rnd(-half, half), z0 = rnd(-half, half); if (window.blockedAt(x0, z0)) continue; const d = new THREE.Mesh(new THREE.PlaneGeometry(rnd(3, 8), rnd(3, 8)), dm); d.rotation.x = -Math.PI / 2; d.position.set(x0, 0.05, z0); scene.add(d); }
  void atmo;
}

// ───────────────────────── post-processing pipeline ─────────────────────────
const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const FS_BRIGHT = 'uniform sampler2D tColor; uniform float thr; varying vec2 vUv; void main(){ vec3 c = texture2D(tColor, vUv).rgb; float l = max(max(c.r, c.g), c.b); float k = smoothstep(thr, thr + 0.9, l); gl_FragColor = vec4(c * k, 1.0); }';
const FS_BLUR = 'uniform sampler2D tColor; uniform vec2 dir; varying vec2 vUv; void main(){ vec3 s = texture2D(tColor, vUv).rgb * 0.227027; for (int i = 1; i < 5; i++) { float w = i == 1 ? 0.1945946 : i == 2 ? 0.1216216 : i == 3 ? 0.054054 : 0.016216; s += (texture2D(tColor, vUv + dir * float(i)).rgb + texture2D(tColor, vUv - dir * float(i)).rgb) * w; } gl_FragColor = vec4(s, 1.0); }';
const FS_FINAL = `uniform sampler2D tColor; uniform sampler2D tBloom; uniform sampler2D tRays; uniform sampler2D tDepth;
uniform vec2 res; uniform float near; uniform float far; uniform float aspect; uniform float focal; uniform float exposure; uniform float ssao; uniform float bloomK; uniform float rayK; uniform float ads; uniform float time; uniform float sat; uniform float contrast; uniform vec2 sunUV; uniform float sunOn;
varying vec2 vUv;
float lin(vec2 uv){ float z = texture2D(tDepth, uv).x; if (z >= 0.99999) return far; float n = z * 2.0 - 1.0; return (2.0 * near * far) / (far + near - n * (far - near)); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec3 aces(vec3 x){ x *= exposure; return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main(){
  vec2 uv = vUv; vec2 c = uv - 0.5; float r2 = dot(c, c);
  vec2 ca = c * (0.0014 + 0.0012 * ads) * r2 * 6.0;
  vec3 col = vec3(texture2D(tColor, uv - ca).r, texture2D(tColor, uv).g, texture2D(tColor, uv + ca).b);
  if (ads > 0.01) { float k = smoothstep(0.07, 0.3, r2) * ads; vec3 acc = col; for (int i = 0; i < 8; i++) { float a = float(i) * 0.785; acc += texture2D(tColor, uv + vec2(cos(a), sin(a)) * 0.0045 * k).rgb; } col = mix(col, acc / 9.0, k); }
  if (ssao > 0.0) { float d = lin(uv); if (d < far * 0.9) { float occ = 0.0; float ang = hash(uv * res) * 6.2831; float rad = 1.1; vec2 scale = vec2(1.0 / aspect, 1.0) * rad * focal / d;
      for (int i = 0; i < 10; i++) { float fi = float(i); float a = ang + fi * 2.399; float rr = (fi + 1.0) / 10.0; vec2 off = vec2(cos(a), sin(a)) * rr * scale; float diff = d - lin(uv + off); occ += smoothstep(0.03, 0.35, diff) * (1.0 - smoothstep(rad * 1.4, rad * 2.6, diff)); }
      col *= 1.0 - clamp(occ / 10.0 * 1.9, 0.0, 0.7) * ssao; } }
  col += texture2D(tBloom, uv).rgb * bloomK;
  if (sunOn > 0.5 && rayK > 0.0) { vec2 dv = (sunUV - uv) / 28.0 * 0.9; vec2 p = uv; float dec = 1.0; vec3 sh = vec3(0.0); for (int i = 0; i < 28; i++) { p += dv; sh += texture2D(tRays, p).rgb * dec; dec *= 0.955; } col += sh / 28.0 * rayK; }
  col = aces(col);
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722)); col = mix(vec3(l), col, sat); col = (col - 0.5) * contrast + 0.5;
  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));
  col *= 1.0 - 0.32 * smoothstep(0.1, 0.6, r2 * 2.0);
  col += (hash(uv * res + time) - 0.5) * 0.022;
  gl_FragColor = vec4(col, 1.0);
}`;
const FS_FXAA = `uniform sampler2D tColor; uniform vec2 inv; varying vec2 vUv;
float luma(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
void main(){
  vec3 rgbM = texture2D(tColor, vUv).rgb; vec3 rNW = texture2D(tColor, vUv + vec2(-1.0, -1.0) * inv).rgb; vec3 rNE = texture2D(tColor, vUv + vec2(1.0, -1.0) * inv).rgb; vec3 rSW = texture2D(tColor, vUv + vec2(-1.0, 1.0) * inv).rgb; vec3 rSE = texture2D(tColor, vUv + vec2(1.0, 1.0) * inv).rgb;
  float lM = luma(rgbM), lNW = luma(rNW), lNE = luma(rNE), lSW = luma(rSW), lSE = luma(rSE); float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE))), lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
  vec2 dir; dir.x = -((lNW + lNE) - (lSW + lSE)); dir.y = ((lNW + lSW) - (lNE + lSE));
  float dr = max((lNW + lNE + lSW + lSE) * 0.25 * 0.125, 1.0 / 128.0); float rcp = 1.0 / (min(abs(dir.x), abs(dir.y)) + dr); dir = clamp(dir * rcp, vec2(-8.0), vec2(8.0)) * inv;
  vec3 rA = 0.5 * (texture2D(tColor, vUv + dir * (1.0 / 3.0 - 0.5)).rgb + texture2D(tColor, vUv + dir * (2.0 / 3.0 - 0.5)).rgb);
  vec3 rB = rA * 0.5 + 0.25 * (texture2D(tColor, vUv + dir * -0.5).rgb + texture2D(tColor, vUv + dir * 0.5).rgb); float lB = luma(rB);
  gl_FragColor = vec4((lB < lMin || lB > lMax) ? rA : rB, 1.0);
}`;
const post = { thr: 1.8, ok: false, rt: null, bright: null, blurA: null, blurB: null, ldr: null, w: 0, h: 0, scene: null, cam: null, quad: null, mats: null, exposure: 1, atmo: null, last: 0 };
function sm(frag, uniforms) { return new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false }); }
function buildPost(r) {
  const size = r.getDrawingBufferSize(new THREE.Vector2()), w = Math.max(2, size.x), h = Math.max(2, size.y); if (post.ok && post.w === w && post.h === h) return;
  ['rt', 'bright', 'blurA', 'blurB', 'ldr'].forEach(k => { if (post[k]) { post[k].dispose(); post[k] = null; } });
  const hf = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false };
  post.rt = new THREE.WebGLRenderTarget(w, h, Object.assign({}, hf, { depthBuffer: true })); post.rt.depthTexture = new THREE.DepthTexture(w, h); post.rt.depthTexture.type = THREE.UnsignedIntType;
  post.bright = new THREE.WebGLRenderTarget(w >> 1, h >> 1, hf); post.blurA = new THREE.WebGLRenderTarget(w >> 2, h >> 2, hf); post.blurB = new THREE.WebGLRenderTarget(w >> 2, h >> 2, hf);
  post.ldr = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  if (!post.scene) {
    post.scene = new THREE.Scene(); post.cam = new THREE.Camera(); post.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null); post.quad.frustumCulled = false; post.scene.add(post.quad);
    post.mats = { bright: sm(FS_BRIGHT, { tColor: { value: null }, thr: { value: 1.05 } }), blur: sm(FS_BLUR, { tColor: { value: null }, dir: { value: new THREE.Vector2() } }),
      fin: sm(FS_FINAL, { tColor: { value: null }, tBloom: { value: null }, tRays: { value: null }, tDepth: { value: null }, res: { value: new THREE.Vector2() }, near: { value: 0.1 }, far: { value: 500 }, aspect: { value: 1 }, focal: { value: 1 }, exposure: { value: 1 }, ssao: { value: 1 }, bloomK: { value: 0.5 }, rayK: { value: 0.3 }, ads: { value: 0 }, time: { value: 0 }, sat: { value: 1.12 }, contrast: { value: 1.1 }, sunUV: { value: new THREE.Vector2(0.5, 0.5) }, sunOn: { value: 0 } }),
      fxaa: sm(FS_FXAA, { tColor: { value: null }, inv: { value: new THREE.Vector2() } }) };
  }
  post.w = w; post.h = h; post.ok = true;
}
function pass(r, target, mat) { post.quad.material = mat; r.setRenderTarget(target); r.render(post.scene, post.cam); }
window.rdPostRender = function (scene, camera, dt) {
  const r = renderer; buildPost(r); animate(dt || 0.016); const M = post.mats, q = quality(), U = M.fin.uniforms;
  r.setRenderTarget(post.rt); r.render(scene, camera);                                              // 1) the world, in linear HDR colour, with depth
  M.bright.uniforms.thr.value = post.thr; M.bright.uniforms.tColor.value = post.rt.texture; pass(r, post.bright, M.bright);                 // 2) bright parts → bloom
  M.blur.uniforms.tColor.value = post.bright.texture; M.blur.uniforms.dir.value.set(1.4 / post.blurA.width, 0); pass(r, post.blurA, M.blur);
  M.blur.uniforms.tColor.value = post.blurA.texture; M.blur.uniforms.dir.value.set(0, 1.4 / post.blurA.height); pass(r, post.blurB, M.blur);
  U.tColor.value = post.rt.texture; U.tBloom.value = post.blurB.texture; U.tRays.value = post.bright.texture; U.tDepth.value = post.rt.depthTexture;       // 3) combine: AO, bloom, god rays, tone map
  U.res.value.set(post.w, post.h); U.near.value = camera.near; U.far.value = camera.far; U.aspect.value = camera.aspect; U.focal.value = 0.5 / Math.tan(camera.fov * Math.PI / 360); U.exposure.value = post.exposure;
  U.ssao.value = q === 'high' ? 0.8 : 0; U.bloomK.value = q === 'low' ? 0.3 : 0.42; U.ads.value = RAID.ads || 0; U.time.value = (performance.now() % 10000) / 1000;
  const at = post.atmo; let sunOn = 0, rk = 0;
  if (at && at.sunDir && at.preset && q !== 'low') { const wp = camera.position.clone().addScaledVector(at.sunDir, 400); const cv = wp.clone().applyMatrix4(camera.matrixWorldInverse); if (cv.z < 0 && at.preset.elev > -3) { const nd = wp.project(camera); U.sunUV.value.set(nd.x * 0.5 + 0.5, nd.y * 0.5 + 0.5); sunOn = 1; rk = (at.key === 'overcast' || at.key === 'indoor') ? 0.08 : (q === 'high' ? 0.4 : 0.26); } }
  U.sunOn.value = sunOn; U.rayK.value = rk; pass(r, post.ldr, M.fin);
  M.fxaa.uniforms.tColor.value = post.ldr.texture; M.fxaa.uniforms.inv.value.set(1 / post.w, 1 / post.h); pass(r, null, M.fxaa);                         // 4) anti-alias to the screen
};

// ───────────────────────── realistic people ─────────────────────────
function faceTexture(skin) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); const sc = '#' + new THREE.Color(skin).getHexString();
  x.fillStyle = sc; x.fillRect(0, 0, 256, 128); const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, 'rgba(0,0,0,0.18)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.22)'); x.fillStyle = g; x.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 600; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`; x.fillRect(Math.random() * 256, Math.random() * 128, 2, 2); }
  const fx = 64;                                       // the face looks at +z, which maps to the quarter-way column of the sphere texture
  x.fillStyle = '#f4f1ea'; x.beginPath(); x.ellipse(fx - 11, 60, 5.5, 3.2, 0, 0, 6.3); x.ellipse(fx + 11, 60, 5.5, 3.2, 0, 0, 6.3); x.fill();
  x.fillStyle = '#3a2a1a'; x.beginPath(); x.arc(fx - 11, 60, 2.6, 0, 6.3); x.arc(fx + 11, 60, 2.6, 0, 6.3); x.fill(); x.fillStyle = '#000'; x.beginPath(); x.arc(fx - 11, 60, 1.2, 0, 6.3); x.arc(fx + 11, 60, 1.2, 0, 6.3); x.fill();
  x.strokeStyle = '#2a1c10'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(fx - 18, 52); x.lineTo(fx - 5, 50); x.moveTo(fx + 5, 50); x.lineTo(fx + 18, 52); x.stroke();
  x.strokeStyle = 'rgba(80,40,30,0.55)'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(fx, 62); x.lineTo(fx - 2, 74); x.lineTo(fx + 2, 75); x.stroke(); x.beginPath(); x.moveTo(fx - 7, 86); x.quadraticCurveTo(fx, 89, fx + 7, 86); x.stroke();
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}
// a gun is ~50 tiny boxes; merge them per material into a handful of meshes so a battlefield full of soldiers stays fast
function mergeGun(src) {
  const out = new THREE.Group(), byMat = new Map();
  src.children.forEach(ch => { if (!ch.isMesh) return; ch.updateMatrix(); let e = byMat.get(ch.material.uuid); if (!e) { e = { mat: ch.material, list: [] }; byMat.set(ch.material.uuid, e); } e.list.push(ch); });
  byMat.forEach(({ mat, list }) => {
    let vc = 0, ic = 0; list.forEach(m => { const g = m.geometry; vc += g.attributes.position.count; ic += g.index ? g.index.count : g.attributes.position.count; });
    const pos = new Float32Array(vc * 3), nor = new Float32Array(vc * 3), uv = new Float32Array(vc * 2), idx = new Uint32Array(ic); let vo = 0, io = 0; const v = new THREE.Vector3(), nm = new THREE.Matrix3();
    list.forEach(m => { const g = m.geometry, p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv; nm.getNormalMatrix(m.matrix);
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrix); pos[(vo + i) * 3] = v.x; pos[(vo + i) * 3 + 1] = v.y; pos[(vo + i) * 3 + 2] = v.z; v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); nor[(vo + i) * 3] = v.x; nor[(vo + i) * 3 + 1] = v.y; nor[(vo + i) * 3 + 2] = v.z; if (u) { uv[(vo + i) * 2] = u.getX(i); uv[(vo + i) * 2 + 1] = u.getY(i); } }
      if (g.index) for (let i = 0; i < g.index.count; i++) idx[io++] = g.index.getX(i) + vo; else for (let i = 0; i < p.count; i++) idx[io++] = vo + i; vo += p.count; });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(new THREE.BufferAttribute(idx, 1));
    const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.userData.zone = 'arms'; out.add(mesh);
  });
  out.position.copy(src.position); out.rotation.copy(src.rotation); out.scale.copy(src.scale); return out;
}
const HY = []; const FACE = {};
function hyHuman(o) {
  const M = window.rdMats(), g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  const cloth = new THREE.MeshStandardMaterial({ color: o.cloth, roughness: 0.95, map: tex('concrete', 'map', 3, 3), normalMap: tex('concrete', 'normalMap', 3, 3), normalScale: new THREE.Vector2(0.6, 0.6) }), vest = new THREE.MeshStandardMaterial({ color: o.vest, roughness: 0.85, normalMap: tex('concrete', 'normalMap', 2, 2), normalScale: new THREE.Vector2(0.8, 0.8) });
  const skinM = new THREE.MeshStandardMaterial({ color: o.skin, roughness: 0.62, map: FACE[o.skin] || (FACE[o.skin] = faceTexture(o.skin)) }), skinPlain = new THREE.MeshStandardMaterial({ color: o.skin, roughness: 0.65 }), boot = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: 0.7, map: tex('rock', 'map', 1, 1) }), dark = M.dark, glove = M.glove;
  const P = (parent, geo, mat, x, y, z, zone, rx, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx) m.rotation.x = rx; if (rz) m.rotation.z = rz; m.userData.zone = zone; m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const cyl = (rt, rb, h, seg) => new THREE.CylinderGeometry(rt, rb, h, seg || 14);
  // legs: hip pivot → thigh → knee pivot → shin → boot
  const leg = s => { const hip = new THREE.Group(); hip.position.set(s * 0.1, 0.96, 0); inner.add(hip); P(hip, cyl(0.085, 0.062, 0.46), cloth, 0, -0.23, 0, 'legs'); const knee = new THREE.Group(); knee.position.set(0, -0.46, 0); hip.add(knee); P(knee, cyl(0.06, 0.045, 0.44), cloth, 0, -0.22, 0.005, 'legs'); P(knee, new THREE.BoxGeometry(0.1, 0.09, 0.27), boot, 0, -0.47, 0.05, 'legs'); P(knee, new THREE.SphereGeometry(0.07, 12, 10), vest, 0, 0, 0.04, 'legs'); return { hip, knee }; };
  const L = leg(-1), Rg = leg(1);
  P(inner, new THREE.BoxGeometry(0.34, 0.2, 0.22), cloth, 0, 1.0, 0, 'stomach'); P(inner, new THREE.BoxGeometry(0.37, 0.07, 0.24), dark, 0, 1.07, 0, 'stomach');                  // pelvis + belt
  const torso = P(inner, cyl(0.2, 0.165, 0.5, 16), cloth, 0, 1.32, 0, 'chest'); torso.scale.z = 0.66; P(inner, new THREE.BoxGeometry(0.36, 0.33, 0.1), vest, 0, 1.36, 0.115, 'chest'); P(inner, new THREE.BoxGeometry(0.3, 0.36, 0.08), vest, 0, 1.36, -0.12, 'chest');
  for (let i = -1; i <= 1; i++) P(inner, new THREE.BoxGeometry(0.08, 0.1, 0.05), dark, i * 0.105, 1.16, 0.17, 'chest');                                                      // magazine pouches
  [-1, 1].forEach(s => P(inner, new THREE.SphereGeometry(0.075, 12, 10), cloth, s * 0.25, 1.53, 0, 'chest'));
  if (o.pack) P(inner, new THREE.BoxGeometry(0.34, 0.42, 0.17), vest, 0, 1.36, -0.24, 'chest');
  P(inner, cyl(0.045, 0.05, 0.1, 10), skinPlain, 0, 1.62, 0, 'head');                                                                                                                // neck
  const head = P(inner, new THREE.SphereGeometry(0.105, 24, 18), skinM, 0, 1.76, 0.005, 'head'); head.scale.set(1, 1.13, 1.04);
  if (o.mask) { const mk = P(inner, new THREE.BoxGeometry(0.2, 0.1, 0.07), dark, 0, 1.725, 0.085, 'head'); mk.scale.y = 0.9; }
  if (o.helmet === 'helmet') { const sh = P(inner, new THREE.SphereGeometry(0.125, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), vest, 0, 1.79, 0, 'head'); sh.scale.set(1, 1.05, 1.1); P(inner, new THREE.BoxGeometry(0.06, 0.07, 0.05), dark, 0, 1.9, 0.1, 'head'); [-1, 1].forEach(s => P(inner, new THREE.BoxGeometry(0.03, 0.09, 0.1), dark, s * 0.125, 1.76, 0, 'head')); }
  else if (o.helmet === 'cap') { const cp = P(inner, new THREE.SphereGeometry(0.112, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), cloth, 0, 1.79, 0, 'head'); cp.scale.y = 0.8; P(inner, new THREE.BoxGeometry(0.17, 0.015, 0.09), cloth, 0, 1.78, 0.11, 'head'); }
  // arms hold the gun across the chest: right hand on the grip, left hand under the handguard
  const gun = window.rdBuildGunModel(o.gun, {}, { noShadow: false }), gs = o.gunScale || 0.78; gun.group.scale.setScalar(gs); gun.group.rotation.y = Math.PI; gun.group.position.set(0.1, 1.26, 0.12); { const gm = mergeGun(gun.group); gm.userData.isGun = true; inner.add(gm); }
  const limb = (a, b, r0, r1, mat) => { const d = new THREE.Vector3().subVectors(b, a), len = d.length(), m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 12), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.userData.zone = 'arms'; m.castShadow = true; inner.add(m); return m; };
  const arm = (s, hx, hy, hz) => { const sh = new THREE.Vector3(s * 0.25, 1.5, 0), hand = new THREE.Vector3(hx, hy, hz), el = sh.clone().lerp(hand, 0.52).add(new THREE.Vector3(s * 0.07, -0.09, -0.03));
    limb(sh, el, 0.055, 0.045, cloth); limb(el, hand, 0.045, 0.036, cloth); [el].forEach(p => { const e = P(inner, new THREE.SphereGeometry(0.047, 10, 8), cloth, p.x, p.y, p.z, 'arms'); void e; }); P(inner, new THREE.SphereGeometry(0.048, 10, 8), glove, hx, hy, hz, 'arms'); };
  arm(1, 0.1, 1.2, 0.14); arm(-1, 0.1, 1.24, 0.42);
  g.userData.isEnemyRoot = !!o.root; g.userData.muzzle = new THREE.Vector3(0.1, 1.28, 0.12 + Math.abs(gun.muzzleZ) * gs);
  const hy = { g, inner, hipL: L.hip, kneeL: L.knee, hipR: Rg.hip, kneeR: Rg.knee, phase: Math.random() * 6, lx: 0, lz: 0, dead: false, deadT: 0, init: false, spd: 0, torso }; g.userData.hy = hy; HY.push(hy); return g;
}
const SKINS = [0xe0b090, 0xc99a74, 0x9a6b4a, 0x6e4a32, 0xf0c8a8];
window.rdHyperBot = function (team, cls) { return hyHuman({ cloth: team === 'A' ? 0x3a4a5e : 0x5a3a36, vest: team === 'A' ? 0x2a5aa8 : 0xa83a2a, skin: SKINS[Math.floor(Math.random() * SKINS.length)], helmet: 'helmet', pack: cls === 'gunner' || cls === 'marks', mask: cls === 'smg', gun: { rifle: 'rifle_ak74', smg: 'smg_mp5', marks: 'dmr_10', gunner: 'lmg_40' }[cls] || 'rifle_ak74', root: team === 'B' }); };
const origEnemyMesh = window.rdBuildEnemyMesh;
window.rdBuildEnemyMesh = function (type, def) {
  if (!(window.RDSET && window.RDSET.smooth)) return origEnemyMesh(type, def);
  return hyHuman({ cloth: def.color, vest: def.vest, skin: SKINS[Math.floor(Math.random() * SKINS.length)], helmet: type === 'scav' ? 'cap' : 'helmet', pack: type !== 'scav', mask: type === 'pmc' || type === 'boss', gun: { scav: 'pistol_mk1', raider: 'rifle_ak74', pmc: 'carbine_m4', boss: 'lmg_40' }[type] || 'pistol_mk1', gunScale: type === 'scav' ? 0.9 : 0.78, root: true });
};
// walk cycle + a proper fall when shot
function animate(dt) {
  for (let i = HY.length - 1; i >= 0; i--) {
    const h = HY[i], g = h.g; if (!g.parent) { HY.splice(i, 1); continue; }
    const en = g.userData.enemy;
    if (en && !en.alive && !h.dead) { h.dead = true; h.deadT = 0; g.rotation.x = 0; g.position.y = 0; h.side = Math.random() < 0.5 ? 1 : -1; }          // the game flattened the body at once; we animate the fall ourselves
    if (en && en.alive && h.dead) { h.dead = false; h.inner.rotation.set(0, 0, 0); h.inner.position.set(0, 0, 0); }
    if (h.dead) { h.deadT += dt; const p = Math.min(1, h.deadT / 0.6), e = 1 - Math.pow(1 - p, 3); h.inner.rotation.x = -Math.PI / 2 * e; h.inner.rotation.z = h.side * 0.35 * Math.sin(p * Math.PI); h.inner.position.y = 0.22 * e; h.hipL.rotation.x = h.hipR.rotation.x = -0.4 * e; continue; }
    const px = g.position.x, pz = g.position.z; if (!h.init) { h.lx = px; h.lz = pz; h.init = true; } const sp = Math.hypot(px - h.lx, pz - h.lz) / Math.max(dt, 0.001); h.lx = px; h.lz = pz; h.spd += (Math.min(sp, 7) - h.spd) * Math.min(1, dt * 8);
    h.phase += h.spd * dt * 1.9; const sw = clamp(h.spd / 3.2, 0, 1), s = Math.sin(h.phase);
    h.hipL.rotation.x = s * 0.62 * sw; h.hipR.rotation.x = -s * 0.62 * sw; h.kneeL.rotation.x = Math.max(0, -Math.cos(h.phase)) * 0.85 * sw; h.kneeR.rotation.x = Math.max(0, Math.cos(h.phase)) * 0.85 * sw;
    h.inner.position.y = Math.abs(s) * 0.035 * sw; h.torso.rotation.z = s * 0.025 * sw;
  }
  stepParticles(dt);
}

// ───────────────────────── casings, bullet holes, dropped magazines ─────────────────────────
const parts = [], decals = []; let casingGeo = null, brass = null, decalMat = null;
window.rdHyperShot = function (muzzle, cam) {
  if (!window.rdPostEnabled) return; if (!casingGeo) { casingGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.03, 8); brass = new THREE.MeshStandardMaterial({ color: 0xb8913a, metalness: 0.9, roughness: 0.3 }); }
  const m = new THREE.Mesh(casingGeo, brass); cam.updateMatrixWorld(); const p = cam.localToWorld(new THREE.Vector3(0.1, -0.1, -0.35)); m.position.copy(p); scene.add(m);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), up = new THREE.Vector3(0, 1, 0), back = new THREE.Vector3(0, 0, 1).applyQuaternion(cam.quaternion);
  parts.push({ m, v: right.multiplyScalar(rnd(2, 3.4)).add(up.multiplyScalar(rnd(1.4, 2.6))).add(back.multiplyScalar(rnd(0.2, 0.8))), w: new THREE.Vector3(rnd(-18, 18), rnd(-18, 18), rnd(-18, 18)), t: 3.5, kind: 'casing', bounces: 0 }); if (parts.length > 60) { const o = parts.shift(); scene.remove(o.m); }
  try { const api = window.RDX.api; api.burst(muzzle, 0x9a9a9a, 3, 0.8, 0.07, api.getFx().blood, -0.9); } catch (e) { }          // a wisp of muzzle smoke
};
window.rdHyperReload = function () {
  if (!window.rdPostEnabled) return; const m = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.13, 0.065), new THREE.MeshStandardMaterial({ color: 0x1d1f22, metalness: 0.7, roughness: 0.45 })); camera.updateMatrixWorld(); m.position.copy(camera.localToWorld(new THREE.Vector3(0.1, -0.24, -0.4))); m.castShadow = true; scene.add(m);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion); setTimeout(() => { parts.push({ m, v: right.multiplyScalar(0.5).add(new THREE.Vector3(0, -0.2, 0)), w: new THREE.Vector3(rnd(-4, 4), rnd(-4, 4), rnd(-4, 4)), t: 5, kind: 'mag', bounces: 0 }); }, 280);
};
function stepParticles(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.t -= dt; p.v.y -= 14 * dt; p.m.position.addScaledVector(p.v, dt); p.m.rotation.x += p.w.x * dt; p.m.rotation.y += p.w.y * dt; p.m.rotation.z += p.w.z * dt; const floor = p.kind === 'mag' ? 0.065 : 0.01;
    if (p.m.position.y < floor) { p.m.position.y = floor; if (Math.abs(p.v.y) > 0.9 && p.bounces < 3) { if (window.RDX && window.RDX.api.tone) window.RDX.api.tone(p.kind === 'mag' ? 520 : 3200 - p.bounces * 500, 0.05, p.kind === 'mag' ? 0.14 : 0.05, 'triangle'); p.v.y *= -0.32; p.v.x *= 0.55; p.v.z *= 0.55; p.w.multiplyScalar(0.6); p.bounces++; } else { p.v.set(0, 0, 0); p.w.set(0, 0, 0); } }
    if (p.t <= 0) { scene.remove(p.m); if (p.kind === 'mag') p.m.geometry.dispose(); parts.splice(i, 1); }
  }
}
window.rdHyperImpact = function (p, dir) {
  if (!window.rdPostEnabled) return; if (!decalMat) { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 1, 32, 32, 30); g.addColorStop(0, 'rgba(8,8,8,0.95)'); g.addColorStop(0.35, 'rgba(25,22,20,0.8)'); g.addColorStop(0.7, 'rgba(60,55,50,0.35)'); g.addColorStop(1, 'rgba(60,55,50,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); decalMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }); }
  let best = null, bd = 0.6; for (const b of currentBuildings) { if (b.low) continue; const dx = Math.min(Math.abs(p.x - (b.x - b.hw)), Math.abs(p.x - (b.x + b.hw))), dz = Math.min(Math.abs(p.z - (b.z - b.hd)), Math.abs(p.z - (b.z + b.hd))); const inx = p.x > b.x - b.hw - 0.3 && p.x < b.x + b.hw + 0.3, inz = p.z > b.z - b.hd - 0.3 && p.z < b.z + b.hd + 0.3; if (!inx || !inz) continue; const d = Math.min(dx, dz); if (d < bd) { bd = d; best = dx < dz ? new THREE.Vector3(p.x < b.x ? -1 : 1, 0, 0) : new THREE.Vector3(0, 0, p.z < b.z ? -1 : 1); } }
  if (!best) return; const d = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.17), decalMat); d.position.copy(p).addScaledVector(best, 0.025); d.lookAt(p.clone().add(best)); d.rotateZ(rnd(0, 6.28)); scene.add(d); decals.push(d); if (decals.length > 90) { const o = decals.shift(); scene.remove(o); }
  void dir;
};

// ───────────────────────── sound: reverb + wind ─────────────────────────
let audioFor = null;
function setupAudio() {
  const api = window.RDX && window.RDX.api; if (!api || !api.getAudio) return; const { AC, master } = api.getAudio(); if (!AC || audioFor === AC) return; audioFor = AC;
  try {
    const len = Math.floor(AC.sampleRate * 2.4), ir = AC.createBuffer(2, len, AC.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); let lp = 0; for (let i = 0; i < len; i++) { const e = Math.pow(1 - i / len, 2.6); lp += ((Math.random() * 2 - 1) - lp) * (0.25 + 0.7 * (1 - i / len)); d[i] = lp * e; } }
    const conv = AC.createConvolver(); conv.buffer = ir; const send = AC.createGain(); send.gain.value = 0.26; master.connect(send); send.connect(conv); conv.connect(AC.destination);
    const nb = AC.createBuffer(1, AC.sampleRate * 3, AC.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; const src = AC.createBufferSource(); src.buffer = nb; src.loop = true;
    const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 0.6; const wg = AC.createGain(); wg.gain.value = 0.035; const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 0.11; lg.gain.value = 0.02; lfo.connect(lg); lg.connect(wg.gain); src.connect(bp); bp.connect(wg); wg.connect(master); src.start(); lfo.start();
  } catch (e) { }
}

// ───────────────────────── switch it on ─────────────────────────
window.rdHyperInit = function (scene, renderer, camera, atmo) {
  const on = !!S().smooth; window.rdPostEnabled = false;
  if (!on) { renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.5 : 2));
  post.atmo = atmo || null; post.exposure = atmo && atmo.preset ? atmo.preset.exp : 1; post.thr = 1.45 + 0.5 * (atmo && atmo.preset ? atmo.preset.sunI : 1); if (scene.fog && scene.fog.density) scene.fog.density *= 0.62;     // clearer air: the sky haze comes from the post pass now
  // the scene pass is rendered in plain linear light into a float target; the final shader does the tone mapping and gamma
  renderer.outputEncoding = THREE.LinearEncoding; renderer.toneMapping = THREE.NoToneMapping; post.ok = false;
  try { upgradeScene(scene); puddles(scene, atmo); } catch (e) { console.warn('hyper material pass failed', e); }
  setupAudio(); window.rdPostEnabled = true;
};
// ───────────────────────── the gun in your hands (Smooth mode) ─────────────────────────
// gloved hands with jointed fingers, knuckle guards, a velcro wrist strap and a camo sleeve (with a watch on the support hand)
window.rdHyperHand = function (left, pistol) {
  const M = window.rdMats(), h = new THREE.Group(), side = left ? -1 : 1;
  const glove = new THREE.MeshStandardMaterial({ color: 0x1d1f22, roughness: 0.82, map: tex('rock', 'map', 2, 2), normalMap: tex('rock', 'normalMap', 3, 3), normalScale: new THREE.Vector2(0.55, 0.55) });
  const hard = M.dark, sleeve = new THREE.MeshStandardMaterial({ color: 0x4a5238, roughness: 0.95, map: tex('concrete', 'map', 2, 2), normalMap: tex('concrete', 'normalMap', 2, 2), normalScale: new THREE.Vector2(0.8, 0.8) });
  const add = (parent, geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  add(h, new THREE.BoxGeometry(0.078, 0.038, 0.092), glove, 0, 0, 0);                                         // palm
  add(h, new THREE.BoxGeometry(0.068, 0.012, 0.03), hard, 0, 0.024, -0.048);                                  // knuckle guard
  const curl = left && !pistol ? 0.85 : -0.95;                                                                // support hand wraps up under the handguard, trigger hand wraps down round the grip
  for (let i = 0; i < 4; i++) {
    const f1 = new THREE.Group(); f1.position.set(-0.0285 + i * 0.019, -0.002, -0.046); f1.rotation.x = curl * (i === 0 ? 0.55 : 1); h.add(f1);
    add(f1, new THREE.BoxGeometry(0.017, 0.017, 0.036), glove, 0, 0, -0.018);
    const f2 = new THREE.Group(); f2.position.set(0, 0, -0.036); f2.rotation.x = curl * 1.1; f1.add(f2); add(f2, new THREE.BoxGeometry(0.0155, 0.015, 0.03), glove, 0, 0, -0.015);
    const f3 = new THREE.Group(); f3.position.set(0, 0, -0.03); f3.rotation.x = curl * 0.9; f2.add(f3); add(f3, new THREE.BoxGeometry(0.014, 0.013, 0.024), glove, 0, 0, -0.012);
  }
  const th = new THREE.Group(); th.position.set(-side * 0.042, 0.004, -0.014); th.rotation.set(-0.15, side * 0.6, -side * 0.2); h.add(th); add(th, new THREE.BoxGeometry(0.02, 0.018, 0.04), glove, 0, 0, -0.02);
  const th2 = new THREE.Group(); th2.position.set(0, 0, -0.04); th2.rotation.y = side * 0.25; th.add(th2); add(th2, new THREE.BoxGeometry(0.018, 0.016, 0.03), glove, 0, 0, -0.015);
  const wr = add(h, new THREE.CylinderGeometry(0.043, 0.047, 0.07, 16), glove, 0, 0, 0.078); wr.rotation.x = Math.PI / 2;                    // wrist cuff
  add(h, new THREE.BoxGeometry(0.1, 0.014, 0.03), hard, 0, 0.002, 0.08);                                                                   // velcro strap
  const fa = add(h, new THREE.CylinderGeometry(0.052, 0.062, 0.36, 16), sleeve, 0, -0.012, 0.29); fa.rotation.x = Math.PI / 2 + 0.12;       // forearm in a camo sleeve
  const cuff = add(h, new THREE.CylinderGeometry(0.064, 0.064, 0.04, 16), sleeve, 0, -0.004, 0.125); cuff.rotation.x = Math.PI / 2 + 0.12; cuff.scale.set(1.06, 1, 1.06);
  if (left) { add(h, new THREE.BoxGeometry(0.036, 0.01, 0.04), hard, 0, 0.05, 0.1); add(h, new THREE.CylinderGeometry(0.013, 0.013, 0.004, 14), new THREE.MeshStandardMaterial({ color: 0xcfd6dc, metalness: 0.8, roughness: 0.2 }), 0, 0.058, 0.1); }   // wristwatch
  return h;
};
const _tmp = new THREE.Vector3(), ease = t => t * t * (3 - 2 * t), seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
// per-frame: inertia when you turn, breathing, and the full reload choreography (support hand drops the mag, fetches a new one, seats it, returns)
window.rdHyperVm = function (vm, dt, R, yaw, pitch, moving, sprint) {
  vm.t = (vm.t || 0) + dt; const ads = R.ads || 0, g = vm.g;
  const vy = (yaw - vm.yy) / Math.max(dt, 0.001), vp = (pitch - vm.py) / Math.max(dt, 0.001); vm.yy = yaw; vm.py = pitch;                          // turning speed in rad/s
  vm.lagY += (clamp(vy * 0.012, -0.14, 0.14) - vm.lagY) * Math.min(1, dt * 9); vm.lagX += (clamp(-vp * 0.010, -0.1, 0.1) - vm.lagX) * Math.min(1, dt * 9);
  g.rotation.y += vm.lagY * (1 - ads * 0.7); g.rotation.x += vm.lagX * (1 - ads * 0.7); g.position.x += vm.lagY * 0.04 * (1 - ads); g.position.y += vm.lagX * 0.04 * (1 - ads);
  g.position.y += Math.sin(vm.t * 1.4) * 0.0014 * (1 - ads * 0.75) + (moving && !sprint ? Math.sin(vm.t * 9) * 0.0016 : 0); g.rotation.z += Math.sin(vm.t * 0.9) * 0.004 * (1 - ads * 0.8);
  // reload
  const hL = vm.handL, mg = vm.magGroup; hL.position.copy(vm.lRest); hL.rotation.z = 0; if (mg) { mg.position.set(0, 0, 0); mg.visible = true; }
  const p = R.reload > 0 && R.reloadTotal > 0 ? 1 - R.reload / R.reloadTotal : -1; if (p < 0) return;
  const a = vm.anch || {}, well = new THREE.Vector3((a.magX || 0) + 0.0, (a.magY || -0.09) - 0.06, a.magZ || -0.15), low = well.clone().add(new THREE.Vector3(0.0, -0.2, 0.02)), pouch = new THREE.Vector3(-0.12, -0.34, 0.1);
  g.rotation.z += 0.22 * Math.sin(Math.min(1, p / 0.2) * Math.PI / 2) * (p < 0.82 ? 1 : 1 - seg(p, 0.82, 1)); g.rotation.x += 0.1 * Math.sin(Math.min(1, p / 0.2) * Math.PI / 2) * (p < 0.82 ? 1 : 1 - seg(p, 0.82, 1));
  if (!mg || vm.pistolInt) { hL.position.lerp(well, Math.sin(p * Math.PI) * 0.6); return; }
  if (p < 0.18) hL.position.lerpVectors(vm.lRest, well, ease(p / 0.18));
  else if (p < 0.38) { const k = ease(seg(p, 0.18, 0.38)); hL.position.lerpVectors(well, low, k); mg.position.copy(hL.position).sub(well); }
  else if (p < 0.6) { const k = ease(seg(p, 0.38, 0.6)); hL.position.lerpVectors(low, pouch, k); mg.visible = false; }
  else if (p < 0.78) { const k = ease(seg(p, 0.6, 0.78)); hL.position.lerpVectors(pouch, low, k); mg.position.copy(hL.position).sub(well); }
  else if (p < 0.9) { const k = ease(seg(p, 0.78, 0.9)); hL.position.lerpVectors(low, well, k); mg.position.copy(hL.position).sub(well); }
  else { const k = ease(seg(p, 0.9, 1)); hL.position.lerpVectors(well, vm.lRest, k); if (p > 0.9 && p < 0.93) g.position.y -= 0.01; }
  hL.rotation.z = Math.sin(clamp(p / 0.9, 0, 1) * Math.PI) * 0.5; void _tmp;
};
window.rdHyper = { pbr, tex, upgradeScene, post, HY, quality };
})();
