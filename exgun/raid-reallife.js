// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — REAL LIFE LOOK  (Settings → "Real life" — on by default on computers)
//   Turns everything up to look like a real place:
//   • Smooth, rounded models + the full hyper-realistic render pipeline (bloom, ambient occlusion, light shafts, film colour) are switched on.
//   • Ground: large-scale patches of grass / dirt / dust with a fine surface relief instead of a flat colour.
//   • Grass: thousands of grass blades around you that sway in the wind (countryside maps).
//   • Streets: lamp posts, parked cars and benches beside the buildings.
//   • Weather: clear days, overcast rain with lightning and thunder, or fog — picked at random for each outdoor map.
//   • Sound: wind and birdsong outdoors, rain on the ground.
//   • If your frame rate drops, the grass and rain switch themselves off.
// Runs once per map just before the map is merged into a single mesh (raid-merge.js), so all the static extras cost almost nothing.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const rnd = (a, b) => a + Math.random() * (b - a), S = () => window.RDSET || {};
const WX = window.WEATHER = { kind: 'clear', on: false };
let texG = null, texN = null, grassTex = null, lite = false, grass = null, rain = null, ambient = null, lastCenter = { x: 1e9, z: 1e9 }, timeU = { value: 0 };
function ctex(w, ht, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = ht; draw(c.getContext('2d'), w, ht); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (rep) t.repeat.set(rep, rep); return t; }
function groundTex() {
  if (texG) return; const big = 512;
  texG = ctex(big, big, (x, W, H) => { x.fillStyle = '#c8c8c8'; x.fillRect(0, 0, W, H); for (let i = 0; i < 90; i++) { const r = 30 + Math.random() * 90, px = Math.random() * W, py = Math.random() * H, g = x.createRadialGradient(px, py, 0, px, py, r), l = 150 + Math.random() * 100 | 0; g.addColorStop(0, `rgba(${l},${l},${l},.35)`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2); } for (let i = 0; i < 9000; i++) { const l = 120 + Math.random() * 130 | 0; x.fillStyle = `rgba(${l},${l},${l},.25)`; x.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 2, 1 + Math.random() * 3); } }, 70);
  const hgt = new Float32Array(256 * 256); for (let i = 0; i < 5; i++) { const f = 2 + i * 3, a = 1 / (i + 1), ph = Math.random() * 9; for (let y = 0; y < 256; y++) for (let x2 = 0; x2 < 256; x2++) hgt[y * 256 + x2] += Math.sin(x2 / 256 * 6.283 * f + ph) * Math.cos(y / 256 * 6.283 * f * 1.3 + ph) * a; }
  texN = ctex(256, 256, (x, W, H) => { const im = x.createImageData(W, H); for (let y = 0; y < H; y++) for (let x2 = 0; x2 < W; x2++) { const gx = hgt[y * W + (x2 + 1) % W] - hgt[y * W + (x2 + W - 1) % W], gy = hgt[((y + 1) % H) * W + x2] - hgt[((y + H - 1) % H) * W + x2], i = (y * W + x2) * 4; im.data[i] = 128 + gx * 40; im.data[i + 1] = 128 + gy * 40; im.data[i + 2] = 255; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); }, 70);
}
function grassTexture() { if (grassTex) return grassTex; const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d'); for (let i = 0; i < 26; i++) { const bx = 8 + Math.random() * 112, h = 70 + Math.random() * 54, lean = (Math.random() - 0.5) * 22, g = x.createLinearGradient(0, 128, 0, 128 - h); g.addColorStop(0, '#2a4a1c'); g.addColorStop(1, '#a8d070'); x.strokeStyle = g; x.lineWidth = 2.2 + Math.random() * 2; x.beginPath(); x.moveTo(bx, 128); x.quadraticCurveTo(bx + lean * 0.3, 128 - h * 0.5, bx + lean, 128 - h); x.stroke(); } grassTex = new THREE.CanvasTexture(c); return grassTex; }
// ───────── ground ─────────
function upgradeGround() {
  groundTex(); scene.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width >= 150 && Math.abs(o.rotation.x + Math.PI / 2) < 0.01 && o.material && o.material.color) { const col = o.material.color.getHex(); o.material = new THREE.MeshStandardMaterial({ color: col, map: texG, normalMap: texN, normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.96, metalness: 0 }); o.receiveShadow = true; o.userData.keepMat = true; o.userData.isGround = true; } });
}
function groundColor() { let c = null; scene.traverse(o => { if (!c && o.userData && o.userData.isGround) c = o.material.color.clone(); }); return c; }
// ───────── grass that follows you and sways ─────────
const GN = 7000, GR = 40;
let gLimit = GN;
function makeGrass(gc, dry) {
  const geo = new THREE.BufferGeometry(), p = [], uv = [], idx = [], w = 0.55, h = 0.9; [0, Math.PI / 2].forEach((a, k) => { const c = Math.cos(a) * w / 2, s = Math.sin(a) * w / 2; p.push(-c, 0, -s, c, 0, s, c, h, s, -c, h, -s); uv.push(0, 0, 1, 0, 1, 1, 0, 1); const b = k * 4; idx.push(b, b + 1, b + 2, b, b + 2, b + 3); });
  geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({ map: grassTexture(), alphaTest: 0.45, side: THREE.DoubleSide, color: dry ? gc.clone().multiplyScalar(0.8).lerp(new THREE.Color(0x9a8a4a), 0.55) : gc.clone().multiplyScalar(0.5).lerp(new THREE.Color(0x4a7a2a), 0.5) });
  mat.onBeforeCompile = sh => { sh.uniforms.uTime = timeU; sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed.x += sin(uTime * 1.8 + instanceMatrix[3].x * 0.55 + instanceMatrix[3].z * 0.4) * 0.14 * position.y * position.y; transformed.z += cos(uTime * 1.4 + instanceMatrix[3].z * 0.5) * 0.08 * position.y * position.y;'); };
  const im = new THREE.InstancedMesh(geo, mat, GN); im.frustumCulled = false; im.userData.noMerge = true; im.userData.keepMesh = true; im.receiveShadow = false; return im;
}
function seatGrass(cx, cz) {
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pos = new THREE.Vector3(), sc = new THREE.Vector3(); let n = 0, tries = 0; const house = window.HOUSE3D && (window.HOUSE3D.on || (window.BATTLE && window.BATTLE.mode === 'endless'));
  while (n < gLimit && tries++ < gLimit * 2) { const a = Math.random() * 6.2832, r = Math.sqrt(Math.random()) * GR, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (house && Math.abs(x) < 17 && Math.abs(z) < 11) continue; if ((n & 3) === 0 && window.blockedAt(x, z)) continue; const s = rnd(0.7, 1.3); e.set(0, rnd(0, 6.28), 0); q.setFromEuler(e); pos.set(x, 0, z); sc.set(s, s * rnd(0.4, 0.75), s); M.compose(pos, q, sc); grass.setMatrixAt(n++, M); }
  grass.count = n; grass.instanceMatrix.needsUpdate = true; lastCenter = { x: cx, z: cz };
}
// ───────── street furniture ─────────
function streetFurniture() {
  const bl = (typeof currentBuildings !== 'undefined' ? currentBuildings : []).filter(b => !b.low && b.hw > 5 && b.hw < 22 && b.hd > 5 && b.hd < 22); if (bl.length < 14) return; const h = window.OW && window.OW.h; if (!h) return;
  const dark = new THREE.MeshStandardMaterial({ color: 0x2c2f33, metalness: 0.7, roughness: 0.4 }), lampM = new THREE.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffe9b0, emissiveIntensity: 0.9 }), tire = new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 1 }), glass = new THREE.MeshStandardMaterial({ color: 0x20303c, metalness: 0.8, roughness: 0.15 });
  const carCols = [0xb0b4b8, 0x1c2430, 0x8a1c1c, 0x2a4a7a, 0xd8d8d8, 0x3a3a3e, 0x6a7a5a], mk = (g, m, x, y, z, sx, sy, sz, ry) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); if (ry) o.rotation.y = ry; o.castShadow = true; scene.add(o); return o; };
  const bx = new THREE.BoxGeometry(1, 1, 1), cy = new THREE.CylinderGeometry(1, 1, 1, 12); let lamps = 0, cars = 0, benches = 0;
  bl.forEach(b => {
    if (lamps < 130 && Math.random() < 0.45) { const sx = Math.random() < 0.5 ? -1 : 1, sz = Math.random() < 0.5 ? -1 : 1, x = b.x + sx * (b.hw + 1.8), z = b.z + sz * (b.hd + 1.8); if (!window.blockedAt(x, z)) { mk(cy, dark, x, 2.4, z, 0.08, 4.8, 0.08); mk(bx, dark, x + sx * -0.5, 4.75, z, 1.1, 0.07, 0.07); mk(bx, lampM, x + sx * -1.0, 4.66, z, 0.5, 0.12, 0.25); lamps++; } }
    if (cars < 42 && Math.random() < 0.22) { const side = Math.random() < 0.5 ? -1 : 1, x = b.x + side * (b.hw + 3.6), z = b.z + rnd(-b.hd * 0.6, b.hd * 0.6), col = carCols[Math.floor(Math.random() * carCols.length)], body = new THREE.MeshStandardMaterial({ color: col, metalness: 0.65, roughness: 0.28 }); if (!window.blockedAt(x, z) && !window.blockedAt(x, z + 2.3) && !window.blockedAt(x, z - 2.3)) { mk(bx, body, x, 0.62, z, 1.8, 0.62, 4.3); mk(bx, body, x, 1.12, z - 0.15, 1.6, 0.5, 2.3); mk(bx, glass, x, 1.14, z - 0.15, 1.62, 0.38, 2.1); [[-0.9, 1.35], [0.9, 1.35], [-0.9, -1.35], [0.9, -1.35]].forEach(w => { const wh = mk(cy, tire, x + w[0], 0.32, z + w[1], 0.32, 0.26, 0.32); wh.rotation.z = Math.PI / 2; }); h.col(x, z, 1.9, 4.4, false, 0.1); cars++; } }
    if (benches < 30 && Math.random() < 0.12) { const x = b.x + (b.hw + 2.4) * (Math.random() < 0.5 ? -1 : 1), z = b.z + rnd(-b.hd, b.hd); if (!window.blockedAt(x, z)) { const wood = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.8 }); mk(bx, wood, x, 0.5, z, 0.6, 0.08, 1.8); mk(bx, wood, x + 0.28, 0.85, z, 0.06, 0.6, 1.8); mk(bx, dark, x, 0.25, z - 0.7, 0.5, 0.5, 0.08); mk(bx, dark, x, 0.25, z + 0.7, 0.5, 0.5, 0.08); benches++; } }
  });
}
// ───────── weather ─────────
function pickWeather() { const w = S().weather || 'auto'; if (w !== 'auto') return w; const r = Math.random(); return r < 0.62 ? 'clear' : r < 0.86 ? 'rain' : 'fog'; }
function setupWeather() {
  WX.kind = pickWeather(); WX.on = true; WX.flashT = rnd(8, 20);
  if (WX.kind === 'fog') { scene.fog = new THREE.Fog(0xaab4bc, 6, 120); scene.background = new THREE.Color(0xaab4bc); }
  if (WX.kind === 'rain') {
    const N = 2600, g = new THREE.BufferGeometry(), p = new Float32Array(N * 6); for (let i = 0; i < N; i++) { const x = rnd(-35, 35), y = rnd(0, 30), z = rnd(-35, 35); p.set([x, y, z, x - 0.05, y - 0.7, z], i * 6); } g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xb8c8d8, transparent: true, opacity: 0.38, depthWrite: false })); rain.frustumCulled = false; rain.userData.noMerge = true; rain.userData.keepMesh = true; scene.add(rain);
    scene.fog = new THREE.Fog(0x8a949c, 25, 260); scene.background = new THREE.Color(0x8a949c);
    scene.traverse(o => { if (o.isMesh && o.userData && o.userData.isGround) { o.material.roughness = 0.35; o.material.color.multiplyScalar(0.7); } });
  }
  window.rdToast && WX.kind !== 'clear' && window.rdToast(WX.kind === 'rain' ? '🌧️ It is raining' : '🌫️ Thick fog', 3000);
}
function rainSound(on) { const a = window.RDX && window.RDX.api && window.RDX.api.getAudio && window.RDX.api.getAudio(); if (!a || !a.AC) return; const AC = a.AC; if (!ambient) { ambient = {}; const nb = AC.createBuffer(1, AC.sampleRate * 3, AC.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const mk = (f, type) => { const s = AC.createBufferSource(); s.buffer = nb; s.loop = true; const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f; const g = AC.createGain(); g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(a.master); s.start(); return { g, fl }; }; ambient.rain = mk(3200, 'highpass'); ambient.wind = mk(420, 'lowpass'); ambient.birdT = 3; }
  ambient.rain.g.gain.setTargetAtTime(on && WX.kind === 'rain' ? 0.06 : 0, AC.currentTime, 0.6); }
function ambientTick(dt) {
  const a = window.RDX && window.RDX.api && window.RDX.api.getAudio && window.RDX.api.getAudio(); if (!a || !a.AC || !ambient) return; const AC = a.AC, t = AC.currentTime, outdoors = !(window.HOUSE3D && window.HOUSE3D.on) && !(window.BATTLE && window.BATTLE.en && window.BATTLE.en.frozen);
  ambient.wind.g.gain.setTargetAtTime(outdoors ? 0.035 + 0.025 * Math.sin(performance.now() / 4000) : 0, t, 0.8); ambient.wind.fl.frequency.setTargetAtTime(300 + 200 * Math.sin(performance.now() / 2500), t, 0.5);
  if (outdoors && WX.kind === 'clear' && !(window.BATTLE && window.BATTLE.on)) { ambient.birdT -= dt; if (ambient.birdT <= 0) { ambient.birdT = rnd(2.5, 8); const o = AC.createOscillator(), g = AC.createGain(), f = rnd(2200, 4200); o.type = 'sine'; for (let i = 0; i < 3; i++) { o.frequency.setValueAtTime(f, t + i * 0.13); o.frequency.exponentialRampToValueAtTime(f * rnd(1.2, 1.6), t + i * 0.13 + 0.08); } g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.035, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45); o.connect(g); g.connect(a.master); o.start(t); o.stop(t + 0.5); } }
}
// ───────── per-frame ─────────
let last = performance.now(), fpsA = 0, fpsN = 0, fpsT = 0;
function frame(dt) {
  const R = window.RAID; if (!R || !R.on || R.over) return; timeU.value += dt; fpsA += dt; fpsN++; fpsT += dt;
  if (fpsT > 3) { const avg = fpsA / fpsN; fpsA = fpsN = fpsT = 0; if (avg > 0.055 && !lite) { lite = true; if (grass) grass.visible = false; if (rain) rain.visible = false; try { window.rdToast('⚙️ Real-life extras switched off to keep the game smooth', 2500); } catch (e) { } } }
  if (grass && !lite) { const dx = playerPos.x - lastCenter.x, dz = playerPos.z - lastCenter.z; if (dx * dx + dz * dz > 14 * 14) seatGrass(playerPos.x, playerPos.z); }
  if (rain && !lite) { rain.position.set(playerPos.x, 0, playerPos.z); const p = rain.geometry.attributes.position.array; for (let i = 0; i < p.length; i += 6) { const f = 24 * dt; p[i + 1] -= f; p[i + 4] -= f; if (p[i + 1] < 0) { const x = rnd(-35, 35), z = rnd(-35, 35), y = rnd(22, 32); p[i] = x; p[i + 1] = y; p[i + 2] = z; p[i + 3] = x - 0.05; p[i + 4] = y - 0.7; p[i + 5] = z; } } rain.geometry.attributes.position.needsUpdate = true; }
  if (WX.on && WX.kind === 'rain') { WX.flashT -= dt; if (WX.flashT <= 0) { WX.flashT = rnd(10, 26); const fl = document.createElement('div'); fl.style.cssText = 'position:fixed;inset:0;background:#dfe8ff;opacity:.75;z-index:88;pointer-events:none;transition:opacity .5s'; document.body.appendChild(fl); setTimeout(() => { fl.style.opacity = '0'; }, 70); setTimeout(() => fl.remove(), 700); try { window.RDX.api.noise(2.6, 700, 50, 0.7, 'lowpass', rnd(0.5, 2.5)); } catch (e) { } } }
  ambientTick(dt);
}
function tick() { const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; try { frame(dt); } catch (e) { } }
(function loop() { tick(); requestAnimationFrame(loop); })(); setInterval(() => { if (document.hidden) tick(); }, 50);
// ───────── applied to every map just before it is merged ─────────
window.rdRealify = function () {
  if (!S().real || typeof scene === 'undefined' || !scene) return; const R = window.RAID; if (!R) return;
  try { upgradeGround(); } catch (e) { console.warn('ground', e); }
  const big = R.mapIndex >= 100 || (window.BATTLE && window.BATTLE.on), houseInterior = window.HOUSE3D && window.HOUSE3D.on;
  if (!houseInterior) { try { streetFurniture(); } catch (e) { console.warn('street', e); } }
  if (grass) { scene.remove(grass); grass = null; } if (rain) { scene.remove(rain); rain = null; } lastCenter = { x: 1e9, z: 1e9 }; lite = false;
  const gc = groundColor(); if (big && gc && !houseInterior) { const lum = (gc.r + gc.g + gc.b) / 3, lush = gc.g > gc.r * 0.98, dry = !lush && gc.g > gc.r * 0.8; if (lum < 0.78 && (lush || dry)) { gLimit = dry ? 2200 : GN; grass = makeGrass(gc, dry); scene.add(grass); seatGrass(playerPos.x, playerPos.z); } }
  if (!houseInterior) { try { setupWeather(); } catch (e) { console.warn('weather', e); } } else WX.on = false;
  rainSound(WX.on && WX.kind === 'rain');
};
})();
