// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — REAL-LOOKING PEOPLE  (Real life / Smooth look)
//   • Every soldier gets: ears, a nose, hair (under caps), a camouflage-printed uniform, radio with antenna, dog tags, knee pads, a rifle sling,
//     different height and build, and a breathing chest.
//   • In big battles (Team Battle, No Mercy, Hardcore, Endless) the ~8 soldiers closest to you are swapped for the full detailed human model
//     (the rest are simpler so the game stays fast); the swap is seamless, soldiers keep walking and fighting.
//   • Your real party members appear as proper named soldiers instead of blue tubes.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const rnd = (a, b) => a + Math.random() * (b - a), K = 8, RANGE = 30;
let camo = null, hold = null; const pool = { A: [], B: [] };
function camoTexture() { if (camo) return camo; const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#9a9a9a'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 70; i++) { const l = 80 + Math.random() * 150 | 0; x.fillStyle = `rgb(${l},${l},${l})`; x.beginPath(); x.ellipse(Math.random() * 256, Math.random() * 256, 8 + Math.random() * 28, 5 + Math.random() * 16, Math.random() * 3, 0, 6.3); x.fill(); } for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`; x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 2); } camo = new THREE.CanvasTexture(c); camo.wrapS = camo.wrapT = THREE.RepeatWrapping; camo.repeat.set(2, 2); camo.anisotropy = 4; return camo; }
function enhance(g, opts) {
  const hy = g.userData && g.userData.hy; if (!hy || hy._enh) return g; hy._enh = true; opts = opts || {}; const inner = hy.inner, skin = (() => { let c = 0xc99a74; g.traverse(o => { if (o.isMesh && o.material && o.material.map && o.material.roughness === 0.62) c = o.material.color.getHex(); }); return c; })();
  const S = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.8 }, o || {})), sk = S(skin, { roughness: 0.62 }), add = (geo, mat, x, y, z, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; (parent || inner).add(m); return m; };
  // uniform: camouflage print
  let done = false; g.traverse(o => { if (!done && o.isMesh && o.material && o.material.roughness === 0.95 && o.material.map) { o.material.map = camoTexture(); o.material.needsUpdate = true; done = true; } });
  // head details
  add(new THREE.SphereGeometry(0.018, 8, 6), sk, 0, 1.755, 0.108); const nz = add(new THREE.ConeGeometry(0.018, 0.04, 6), sk, 0, 1.745, 0.115); nz.rotation.x = Math.PI / 2 - 0.2;
  [-1, 1].forEach(s => { const e = add(new THREE.SphereGeometry(0.022, 8, 6), sk, s * 0.104, 1.76, 0.0); e.scale.set(0.5, 1.2, 0.8); });
  if (opts.hair) { const hair = add(new THREE.SphereGeometry(0.108, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), S([0x2a1c12, 0x4a3020, 0x16120e, 0x6a5030, 0x8a7a50][Math.floor(Math.random() * 5)], { roughness: 1 }), 0, 1.775, -0.005); hair.scale.set(1.02, 1.1, 1.06); }
  // gear
  const dark = S(0x16181a, { roughness: 0.6, metalness: 0.3 }), metal = S(0xaaaaaa, { metalness: 0.9, roughness: 0.3 });
  add(new THREE.BoxGeometry(0.05, 0.1, 0.04), dark, -0.19, 1.5, 0.07); add(new THREE.CylinderGeometry(0.004, 0.004, 0.28, 5), dark, -0.19, 1.68, 0.07);              // radio + antenna
  add(new THREE.BoxGeometry(0.03, 0.04, 0.004), metal, 0.0, 1.5, 0.132); add(new THREE.BoxGeometry(0.03, 0.04, 0.004), metal, 0.012, 1.46, 0.132);                       // dog tags
  const sling = add(new THREE.BoxGeometry(0.035, 0.46, 0.012), dark, 0.0, 1.36, 0.135); sling.rotation.z = 0.55;                                                       // rifle sling across the chest
  [hy.kneeL, hy.kneeR].forEach(k => { if (k) add(new THREE.BoxGeometry(0.1, 0.1, 0.045), dark, 0, 0.0, 0.065, k); });                                                     // knee pads
  [-1, 1].forEach(s => add(new THREE.BoxGeometry(0.06, 0.02, 0.1), dark, s * 0.1, 0.0, 0.12, s < 0 ? hy.kneeL : hy.kneeR));
  inner.scale.set(rnd(0.97, 1.07), rnd(0.95, 1.07), rnd(0.97, 1.07)); hy.breath = Math.random() * 6;
  return g;
}
window.rdEnhanceHuman = enhance;
const bm = window.rdBuildEnemyMesh, hb = window.rdHyperBot;
window.rdBuildEnemyMesh = function (type, def) { const g = bm(type, def); if (g && g.userData && g.userData.hy) enhance(g, { hair: type === 'scav' || type === 'junglescav' }); return g; };
window.rdHyperBot = function (team, cls) { const g = hb(team, cls); return enhance(g, { hair: false }); };
// remote party members: real soldiers with a name tag
const rpb = window.buildRemotePlayerMesh;
window.buildRemotePlayerMesh = function (o) {
  if (!(window.RDSET && window.RDSET.smooth) || !window.rdHyperBot) return rpb(o);
  try { const g = window.rdHyperBot('A', ['rifle', 'smg', 'marks'][Math.floor(Math.random() * 3)]); g.userData.isEnemyRoot = false; const cv = document.createElement('canvas'); cv.width = 192; cv.height = 40; const x = cv.getContext('2d'); x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, 192, 40); x.fillStyle = '#7dffb0'; x.font = 'bold 22px Arial'; x.textAlign = 'center'; x.fillText(String(o.name || '?').slice(0, 14), 96, 28); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), depthTest: false })); sp.scale.set(2.2, 0.46, 1); sp.position.y = 2.35; g.add(sp); return g; } catch (e) { return rpb(o); }
};
// ───────── breathing + the closest soldiers get the full model ─────────
let t = 0, last = performance.now(), swapT = 0;
function holder() { if (!hold || !hold.parent) { hold = new THREE.Group(); hold.visible = false; hold.userData.nuke = true; hold.userData.keepMesh = true; scene.add(hold); } return hold; }
function bodyFor(team) { const p = pool[team]; let b = p.find(x => !x.userData._used); if (!b && p.length < K + 2) { b = window.rdHyperBot(team, ['rifle', 'rifle', 'smg', 'marks', 'gunner'][Math.floor(Math.random() * 5)]); b.userData.isEnemyRoot = false; p.push(b); holder().add(b); } if (b && !b.parent) holder().add(b); return b; }
function release(bot) { const b = bot._hyBody; if (!b) return; b.userData._used = false; b.userData.enemy = null; holder().add(b); bot._hyBody = null; if (b.userData.hy) { b.userData.hy.dead = false; b.userData.hy.inner.rotation.set(0, 0, 0); b.userData.hy.inner.position.set(0, 0, 0); } bot.mesh.children.forEach(c => { if (c._lo) c.visible = !bot._near; else if (c !== b) { c.visible = !!bot._near; } }); }
function assign(bot) { const b = bodyFor(bot.team); if (!b) return false; b.userData._used = true; b.userData.enemy = bot; b.position.set(0, 0, 0); b.rotation.set(0, 0, 0); b.visible = true; bot.mesh.add(b); bot._hyBody = b; bot.mesh.children.forEach(c => { if (c !== b) c.visible = false; }); const hy = b.userData.hy; if (hy) { hy.dead = false; hy.init = false; hy.inner.rotation.set(0, 0, 0); hy.inner.position.set(0, 0, 0); if (!bot.alive) { hy.dead = true; hy.deadT = 1; } } return true; }
function swap() {
  const BT = window.BATTLE, R = window.RAID; if (!(window.RDSET && window.RDSET.smooth && window.RDSET.real) || !BT || !BT.on || !R || !R.on || (BT.en && BT.en.frozen)) { return; }
  const list = (typeof enemies !== 'undefined' ? enemies : []).concat(BT.allies || []), pp = playerPos, cand = [];
  list.forEach(b => { if (!b.mesh || b.mesh.userData.hy || !b._up) return; const d = Math.hypot(b.mesh.position.x - pp.x, b.mesh.position.z - pp.z); if (b.alive ? d < RANGE : (b._dd !== undefined && BT.t - b._dd < 6 && d < RANGE)) cand.push([d, b]); });
  cand.sort((a, c) => a[0] - c[0]); const want = new Set(cand.slice(0, K).map(c => c[1]));
  list.forEach(b => { if (b._hyBody && !want.has(b)) release(b); }); want.forEach(b => { if (!b._hyBody) assign(b); });
}
function frame(dt) {
  t += dt; const HY = window.rdHyper && window.rdHyper.HY; if (HY) for (let i = 0; i < HY.length; i++) { const h = HY[i]; if (h.breath !== undefined && !h.dead && h.torso) h.torso.scale.y = 1 + Math.sin(t * 1.7 + h.breath) * 0.014; }
  swapT -= dt; if (swapT <= 0) { swapT = 0.35; try { swap(); } catch (e) { console.warn('people swap', e); } }
}
(function loop() { const now = performance.now(); frame(Math.min(0.1, (now - last) / 1000)); last = now; requestAnimationFrame(loop); })(); setInterval(() => { if (document.hidden) { const now = performance.now(); frame(Math.min(0.1, (now - last) / 1000)); last = now; } }, 60);
})();
