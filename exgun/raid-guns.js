// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN RAID — MODELS & LOOK
//   • procedural canvas textures (brushed steel, polymer grain, wood grain, camo cloth) so the blocky parts look like real materials
//   • rdBuildGunModel(weaponId, mods): detailed "blocky but realistic" guns, with every attachment visible on the gun
//   • rdBuildEnemyMesh(type): soldiers with boots, knee pads, plate carrier, pouches, backpack, helmet, mask, gloves, and a real gun
//   • rdMakeEnv(renderer, ...): a reflection environment so metal actually reflects the sky
//   • rdGunIcon / rdGunPreview: pictures and a rotating 3D view of any gun for the Armory shop
// Plain data/geometry only — no game logic. Loaded after raid-data.js, before raid-core.js.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const rnd = (a, b) => a + Math.random() * (b - a);

// ───────────────────────── textures + materials ─────────────────────────
function ctex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; if (rep) t.repeat.set(rep[0], rep[1]); return t;
}
let MATS = null;
function mats() {
  if (MATS) return MATS;
  // gentle textures: the parts are tiny, so strong noise would shimmer; these only add a hint of grain and brushing
  const brushed = ctex(128, 128, (x, w, h) => { x.fillStyle = '#b4b6ba'; x.fillRect(0, 0, w, h); for (let i = 0; i < 120; i++) { const v = 150 + Math.random() * 70 | 0; x.fillStyle = `rgba(${v},${v},${v + 4},0.22)`; x.fillRect(0, Math.random() * h, w, 1 + Math.random() * 2); } });
  const grain = ctex(64, 64, (x, w, h) => { x.fillStyle = '#b0b0b0'; x.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { const v = 150 + Math.random() * 60 | 0; x.fillStyle = `rgba(${v},${v},${v},0.3)`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } });
  const wood = ctex(256, 256, (x, w, h) => { x.fillStyle = '#8a5a32'; x.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { const y0 = Math.random() * h, a = Math.random() * 8 + 2, f = Math.random() * 0.05 + 0.01; x.strokeStyle = `rgba(${40 + Math.random() * 40 | 0},${20 + Math.random() * 20 | 0},10,0.28)`; x.lineWidth = Math.random() * 2 + 0.5; x.beginPath(); for (let px = 0; px <= w; px += 8) x.lineTo(px, y0 + Math.sin(px * f + i) * a); x.stroke(); } });
  const camo = ctex(256, 256, (x, w, h) => { x.fillStyle = '#4a5238'; x.fillRect(0, 0, w, h); const cols = ['#3a4228', '#5e6446', '#2e3322', '#6b6a4c']; for (let i = 0; i < 70; i++) { x.fillStyle = cols[i % 4]; x.beginPath(); const cx = Math.random() * w, cy = Math.random() * h; for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28, r = rnd(8, 30); x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.7); } x.fill(); } }, [2, 2]);
  const S = (o) => new THREE.MeshStandardMaterial(Object.assign({ metalness: 0, roughness: 0.8 }, o));
  MATS = {
    metal: S({ color: 0x2c2f33, metalness: 0.92, roughness: 0.38, map: brushed }),
    dark: S({ color: 0x131517, metalness: 0.85, roughness: 0.42, map: brushed }),
    steel: S({ color: 0x777b80, metalness: 0.95, roughness: 0.28, map: brushed }),
    poly: S({ color: 0x25272a, roughness: 0.72, map: grain }),
    tan: S({ color: 0x8c7d5a, roughness: 0.7, map: grain }),
    wood: S({ color: 0xa06a3c, roughness: 0.55, map: wood }),
    skin: S({ color: 0xc89a78, roughness: 0.75 }), glove: S({ color: 0x1b1d20, roughness: 0.92, map: grain }),
    camo: S({ color: 0xffffff, roughness: 0.95, map: camo }), rubber: S({ color: 0x0c0c0d, roughness: 1 }),
    glass: S({ color: 0x4a7aa0, metalness: 0.9, roughness: 0.04, transparent: true, opacity: 0.55 }),
    dot: new THREE.MeshBasicMaterial({ color: 0xff2a1a }), brass: S({ color: 0xb8913a, metalness: 0.9, roughness: 0.3 })
  };
  return MATS;
}
window.rdMats = mats;

// ───────────────────────── geometry helpers ─────────────────────────
function B(p, w, h, d, m, x, y, z, rx, ry, rz) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (rx) o.rotation.x = rx; if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz; p.add(o); return o; }
function Cz(p, rT, rB, len, m, x, y, z, seg) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, len, seg || 12), m); o.rotation.x = Math.PI / 2; o.position.set(x, y, z); p.add(o); return o; }
function Cy(p, rT, rB, len, m, x, y, z, seg) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, len, seg || 12), m); o.position.set(x, y, z); p.add(o); return o; }
// repeated small boxes along z (rails, serrations, cooling holes)
function teeth(p, n, x, y, z0, dz, w, h, d, m) { for (let i = 0; i < n; i++) B(p, w, h, d, m, x, y, z0 + i * dz); }

// ───────────────────────── guns ─────────────────────────
// each builder fills group g and returns anchors: { muzzle (z), railY, railZ (optic mount), gripY/gripZ (foregrip), magPos, sideZ }
const GUNS = {
  pistol(g, M, o) {
    B(g, 0.03, 0.03, 0.2, M.poly, 0, 0.012, -0.09); B(g, 0.034, 0.042, 0.205, M.metal, 0, 0.048, -0.1);
    teeth(g, 5, 0.019, 0.05, 0.0, -0.007, 0.004, 0.03, 0.003, M.dark); teeth(g, 5, -0.019, 0.05, 0.0, -0.007, 0.004, 0.03, 0.003, M.dark);
    Cz(g, 0.0085, 0.0085, 0.025, M.steel, 0, 0.044, -0.212, 10); B(g, 0.032, 0.125, 0.05, M.poly, 0, -0.058, 0.012, 0.18); B(g, 0.03, 0.012, 0.054, M.metal, 0, -0.123, 0.02, 0.18);
    B(g, 0.006, 0.008, 0.05, M.poly, 0, -0.012, -0.05); B(g, 0.006, 0.026, 0.006, M.poly, 0, -0.026, -0.072); B(g, 0.006, 0.02, 0.006, M.steel, 0, -0.02, -0.034);
    B(g, 0.009, 0.016, 0.014, M.steel, 0, 0.078, 0.004); B(g, 0.006, 0.012, 0.01, M.dark, 0, 0.076, -0.196); B(g, 0.016, 0.01, 0.008, M.dark, 0, 0.076, -0.01); B(g, 0.004, 0.012, 0.01, M.dot, 0.0, 0.0, 0.0).visible = false;
    B(g, 0.036, 0.008, 0.07, M.poly, 0, -0.012, -0.14);  // dust cover rail
    return { muzzle: -0.225, railY: 0.07, railZ: -0.05, gripZ: -0.13, gripY: -0.02, sideZ: -0.14, magX: 0, magY: -0.07, noMag: true, magZ: 0.012 };
  },
  pistol45(g, M, o) {
    const a = GUNS.pistol(g, M, o); B(g, 0.036, 0.05, 0.02, M.poly, 0, 0.0, -0.17); B(g, 0.01, 0.012, 0.05, M.steel, 0, 0.073, -0.02); return a;
  },
  revolver(g, M) {
    B(g, 0.034, 0.05, 0.1, M.metal, 0, 0.02, -0.03); Cz(g, 0.02, 0.02, 0.085, M.dark, 0, 0.028, -0.115, 8);
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; Cz(g, 0.0065, 0.0065, 0.086, M.brass, Math.cos(a) * 0.013, 0.028 + Math.sin(a) * 0.013, -0.115, 6); }
    Cz(g, 0.011, 0.011, 0.19, M.steel, 0, 0.038, -0.27, 10); B(g, 0.016, 0.014, 0.19, M.metal, 0, 0.012, -0.27);
    B(g, 0.036, 0.1, 0.05, M.wood, 0, -0.05, 0.03, 0.3); B(g, 0.007, 0.018, 0.012, M.steel, 0, 0.062, 0.025, -0.4); B(g, 0.006, 0.012, 0.01, M.dark, 0, 0.056, -0.36);
    B(g, 0.007, 0.012, 0.03, M.dark, 0, 0.062, -0.01); B(g, 0.006, 0.02, 0.006, M.steel, 0, -0.012, -0.02);
    return { muzzle: -0.37, railY: 0.06, railZ: -0.1, gripZ: -0.2, gripY: -0.02, sideZ: -0.2, magX: 0, magY: 0, magZ: 0, noMag: true };
  },
  smg(g, M, o) {
    B(g, 0.05, 0.062, 0.34, M.metal, 0, 0.03, -0.17); teeth(g, 9, 0.027, 0.03, -0.04, -0.03, 0.003, 0.022, 0.012, M.dark); teeth(g, 9, -0.027, 0.03, -0.04, -0.03, 0.003, 0.022, 0.012, M.dark);
    B(g, 0.056, 0.058, 0.17, M.poly, 0, 0.026, -0.42); Cz(g, 0.012, 0.012, 0.1, M.steel, 0, 0.032, -0.55, 8); Cz(g, 0.02, 0.02, 0.02, M.steel, 0, 0.036, -0.54, 12);
    B(g, 0.04, 0.12, 0.05, M.poly, 0, -0.07, -0.05, 0.25); B(g, 0.01, 0.016, 0.006, M.steel, 0, 0.074, -0.51); B(g, 0.022, 0.018, 0.014, M.dark, 0, 0.074, -0.05);
    B(g, 0.014, 0.012, 0.03, M.steel, 0.032, 0.04, -0.01); // cocking handle
    Cy(g, 0.004, 0.004, 0.2, M.steel, 0.0, 0.02, 0.12, 6).rotation.x = Math.PI / 2; B(g, 0.03, 0.06, 0.15, M.poly, 0, 0.02, 0.2); B(g, 0.03, 0.01, 0.014, M.rubber, 0, 0.0, 0.28);
    return { muzzle: -0.6, railY: 0.065, railZ: -0.12, gripZ: -0.4, gripY: -0.04, sideZ: -0.4, magX: 0, magY: -0.01, magZ: -0.18, curvedMag: true };
  },
  carbine(g, M, o) {
    B(g, 0.05, 0.075, 0.25, M.metal, 0, 0.03, -0.12); B(g, 0.046, 0.05, 0.26, M.metal, 0, -0.03, -0.12);
    B(g, 0.05, 0.045, 0.34, M.poly, 0, 0.02, -0.42); teeth(g, 12, 0.0, 0.0475 + 0.0, -0.3, -0.026, 0.02, 0.008, 0.012, M.dark); teeth(g, 12, 0.0, 0.0425, -0.3, -0.026, 0.02, 0.002, 0.014, M.steel);
    Cz(g, 0.008, 0.008, 0.2, M.steel, 0, 0.026, -0.68, 8); Cz(g, 0.014, 0.014, 0.07, M.dark, 0, 0.026, -0.8, 10);
    B(g, 0.008, 0.07, 0.008, M.dark, 0, 0.082, -0.62); B(g, 0.015, 0.014, 0.012, M.dark, 0, 0.1, -0.62); B(g, 0.03, 0.03, 0.05, M.dark, 0, 0.1, -0.02); B(g, 0.036, 0.03, 0.04, M.metal, 0, 0.008, -0.28);
    B(g, 0.03, 0.01, 0.05, M.steel, 0.027, 0.04, -0.09); B(g, 0.04, 0.13, 0.05, M.poly, 0, -0.1, 0.0, 0.3);
    Cz(g, 0.016, 0.016, 0.16, M.metal, 0, 0.03, 0.12, 8); B(g, 0.05, 0.1, 0.14, M.poly, 0, 0.0, 0.22); B(g, 0.05, 0.02, 0.05, M.rubber, 0, -0.05, 0.29);
    return { muzzle: -0.84, railY: 0.056, railZ: -0.1, gripZ: -0.5, gripY: -0.02, sideZ: -0.6, magX: 0, magY: -0.05, magZ: -0.13, curvedMag: true, magW: 0.03 };
  },
  ak(g, M, o) {
    B(g, 0.05, 0.075, 0.38, M.metal, 0, 0.026, -0.17); B(g, 0.05, 0.012, 0.36, M.dark, 0, 0.068, -0.2);
    B(g, 0.048, 0.056, 0.2, M.wood, 0, 0.018, -0.48); B(g, 0.046, 0.026, 0.2, M.wood, 0, 0.056, -0.48);
    Cz(g, 0.012, 0.012, 0.3, M.steel, 0, 0.066, -0.48, 8); Cz(g, 0.0075, 0.0075, 0.3, M.steel, 0, 0.028, -0.66, 8);
    Cz(g, 0.014, 0.014, 0.065, M.dark, 0, 0.028, -0.82, 10); Cz(g, 0.018, 0.018, 0.01, M.dark, 0, 0.028, -0.78, 10); B(g, 0.007, 0.05, 0.007, M.dark, 0, 0.066, -0.78); B(g, 0.016, 0.018, 0.012, M.dark, 0, 0.088, -0.78);
    B(g, 0.02, 0.02, 0.08, M.dark, 0, 0.088, -0.3); B(g, 0.02, 0.01, 0.01, M.steel, 0, 0.1, -0.33); B(g, 0.032, 0.026, 0.05, M.steel, 0.027, 0.045, -0.12);
    B(g, 0.04, 0.12, 0.05, M.wood, 0, -0.06, 0.0, 0.3); B(g, 0.045, 0.1, 0.26, M.wood, 0, 0.0, 0.15); B(g, 0.05, 0.12, 0.016, M.rubber, 0, 0.0, 0.29);
    return { muzzle: -0.86, railY: 0.075, railZ: -0.22, gripZ: -0.48, gripY: -0.025, sideZ: -0.4, magX: 0, magY: -0.012, magZ: -0.16, curvedMag: true, magW: 0.032, magWood: false };
  },
  battle(g, M, o) {
    GUNS.carbine(g, M, o); B(g, 0.056, 0.05, 0.12, M.poly, 0, 0.02, -0.72); B(g, 0.05, 0.1, 0.1, M.poly, 0, 0.01, 0.2); B(g, 0.056, 0.018, 0.14, M.poly, 0, 0.065, 0.26);
    return { muzzle: -0.88, railY: 0.056, railZ: -0.1, gripZ: -0.52, gripY: -0.02, sideZ: -0.6, magX: 0, magY: -0.05, magZ: -0.13, straightMag: true, magW: 0.034 };
  },
  dmr(g, M, o) {
    B(g, 0.05, 0.075, 0.3, M.metal, 0, 0.03, -0.14); B(g, 0.052, 0.05, 0.4, M.poly, 0, 0.02, -0.5); teeth(g, 14, 0.0, 0.0495, -0.32, -0.026, 0.02, 0.008, 0.012, M.dark);
    Cz(g, 0.011, 0.011, 0.3, M.steel, 0, 0.026, -0.82, 8); Cz(g, 0.017, 0.017, 0.08, M.dark, 0, 0.026, -1.0, 10);
    B(g, 0.036, 0.13, 0.05, M.poly, 0, -0.07, 0.0, 0.3); B(g, 0.05, 0.12, 0.3, M.tan, 0, 0.01, 0.17); B(g, 0.05, 0.03, 0.16, M.tan, 0, 0.075, 0.2); B(g, 0.05, 0.02, 0.05, M.rubber, 0, -0.05, 0.33);
    Cy(g, 0.004, 0.004, 0.22, M.steel, -0.03, -0.045, -0.82, 6).rotation.z = 0.5; Cy(g, 0.004, 0.004, 0.22, M.steel, 0.03, -0.045, -0.82, 6).rotation.z = -0.5;  // folded bipod
    B(g, 0.014, 0.012, 0.03, M.steel, 0.032, 0.04, -0.06);
    return { muzzle: -1.04, railY: 0.056, railZ: -0.12, gripZ: -0.55, gripY: -0.02, sideZ: -0.7, magX: 0, magY: -0.01, magZ: -0.14, straightMag: true, magW: 0.034 };
  },
  hunter(g, M, o) {
    B(g, 0.045, 0.06, 0.35, M.metal, 0, 0.03, -0.18); Cz(g, 0.012, 0.012, 0.52, M.steel, 0, 0.034, -0.58, 10); Cz(g, 0.016, 0.016, 0.03, M.dark, 0, 0.034, -0.84, 10);
    B(g, 0.05, 0.062, 0.38, M.wood, 0, 0.0, -0.42); B(g, 0.05, 0.13, 0.36, M.wood, 0, -0.01, 0.2); B(g, 0.05, 0.03, 0.18, M.wood, 0, 0.06, 0.26); B(g, 0.05, 0.12, 0.016, M.rubber, 0, 0.0, 0.38);
    Cz(g, 0.006, 0.006, 0.05, M.steel, 0.035, 0.044, -0.06, 8); B(g, 0.012, 0.012, 0.012, M.steel, 0.052, 0.044, -0.05); B(g, 0.035, 0.1, 0.05, M.wood, 0, -0.06, 0.0, 0.25);
    B(g, 0.006, 0.014, 0.01, M.dark, 0, 0.064, -0.8);
    return { muzzle: -0.86, railY: 0.07, railZ: -0.1, gripZ: -0.5, gripY: -0.02, sideZ: -0.4, magX: 0, magY: -0.03, magZ: -0.18, noMag: true };
  },
  lmg(g, M, o) {
    B(g, 0.06, 0.085, 0.5, M.metal, 0, 0.03, -0.2); B(g, 0.05, 0.02, 0.4, M.dark, 0, 0.088, -0.2); B(g, 0.06, 0.06, 0.34, M.poly, 0, 0.02, -0.66);
    Cz(g, 0.014, 0.014, 0.55, M.steel, 0, 0.034, -1.0, 8); Cz(g, 0.02, 0.02, 0.08, M.dark, 0, 0.034, -1.28, 10);
    B(g, 0.05, 0.13, 0.05, M.poly, 0, -0.07, 0.0, 0.3); B(g, 0.06, 0.12, 0.3, M.poly, 0, 0.0, 0.2); B(g, 0.05, 0.02, 0.05, M.rubber, 0, -0.05, 0.37);
    B(g, 0.07, 0.11, 0.13, M.tan, 0, -0.1, -0.2);   // ammo box
    Cz(g, 0.01, 0.01, 0.08, M.brass, 0.0, -0.04, -0.2, 6).rotation.z = Math.PI / 2;
    B(g, 0.01, 0.1, 0.06, M.steel, 0, 0.14, -0.3); B(g, 0.03, 0.01, 0.2, M.steel, 0, 0.19, -0.3);   // carry handle
    Cy(g, 0.005, 0.005, 0.25, M.steel, -0.035, -0.05, -1.05, 6).rotation.z = 0.55; Cy(g, 0.005, 0.005, 0.25, M.steel, 0.035, -0.05, -1.05, 6).rotation.z = -0.55;
    return { muzzle: -1.32, railY: 0.1, railZ: -0.06, gripZ: -0.7, gripY: -0.02, sideZ: -0.7, magX: 0, magY: 0, magZ: 0, noMag: true };
  },
  shotgun(g, M, o) {
    B(g, 0.05, 0.07, 0.3, M.metal, 0, 0.03, -0.14); Cz(g, 0.014, 0.014, 0.6, M.steel, 0, 0.044, -0.55, 10); Cz(g, 0.016, 0.016, 0.5, M.metal, 0, 0.0, -0.5, 10);
    B(g, 0.056, 0.058, 0.2, M.wood, 0, 0.006, -0.46); teeth(g, 7, 0.029, 0.006, -0.38, -0.024, 0.003, 0.03, 0.008, M.dark);
    B(g, 0.04, 0.12, 0.05, M.wood, 0, -0.05, 0.0, 0.3); B(g, 0.05, 0.12, 0.3, M.wood, 0, 0.0, 0.16); B(g, 0.05, 0.12, 0.016, M.rubber, 0, 0.0, 0.32);
    B(g, 0.007, 0.012, 0.01, M.brass, 0, 0.066, -0.84); B(g, 0.02, 0.01, 0.2, M.steel, 0, 0.068, -0.4);
    return { muzzle: -0.86, railY: 0.075, railZ: -0.1, gripZ: -0.46, gripY: -0.04, sideZ: -0.3, magX: 0, magY: 0, magZ: 0, noMag: true };
  },
  shotgunSemi(g, M, o) {
    B(g, 0.052, 0.08, 0.34, M.metal, 0, 0.03, -0.16); Cz(g, 0.014, 0.014, 0.52, M.steel, 0, 0.046, -0.54, 10); Cz(g, 0.018, 0.018, 0.42, M.metal, 0, 0.0, -0.5, 10);
    B(g, 0.056, 0.06, 0.26, M.poly, 0, 0.01, -0.46); teeth(g, 8, 0.0, 0.0425, -0.3, -0.03, 0.02, 0.008, 0.012, M.dark);
    B(g, 0.04, 0.13, 0.05, M.poly, 0, -0.06, 0.0, 0.3); B(g, 0.05, 0.12, 0.3, M.poly, 0, 0.0, 0.16); B(g, 0.05, 0.12, 0.016, M.rubber, 0, 0.0, 0.32);
    B(g, 0.01, 0.014, 0.012, M.dark, 0, 0.076, -0.78); Cz(g, 0.02, 0.02, 0.04, M.dark, 0, 0.046, -0.83, 10);
    return { muzzle: -0.86, railY: 0.07, railZ: -0.1, gripZ: -0.46, gripY: -0.04, sideZ: -0.4, magX: 0, magY: 0, magZ: 0, noMag: true };
  },
  sniper(g, M, o) {
    B(g, 0.05, 0.075, 0.4, M.metal, 0, 0.03, -0.2); Cz(g, 0.014, 0.014, 0.75, M.steel, 0, 0.034, -0.78, 10); Cz(g, 0.02, 0.02, 0.1, M.dark, 0, 0.034, -1.2, 10); Cz(g, 0.024, 0.024, 0.03, M.dark, 0, 0.034, -1.0, 10);
    B(g, 0.056, 0.07, 0.46, M.poly, 0, 0.004, -0.5); B(g, 0.05, 0.13, 0.34, M.poly, 0, 0.0, 0.19); B(g, 0.05, 0.04, 0.2, M.poly, 0, 0.075, 0.21); B(g, 0.05, 0.13, 0.016, M.rubber, 0, 0.0, 0.36);
    B(g, 0.036, 0.12, 0.05, M.poly, 0, -0.09, 0.0, 0.3); Cz(g, 0.006, 0.006, 0.07, M.steel, 0.038, 0.046, -0.06, 8); B(g, 0.016, 0.016, 0.016, M.steel, 0.07, 0.046, -0.06);
    B(g, 0.05, 0.016, 0.42, M.dark, 0, 0.075, -0.22);
    Cy(g, 0.005, 0.005, 0.3, M.steel, -0.04, -0.06, -0.82, 6).rotation.z = 0.5; Cy(g, 0.005, 0.005, 0.3, M.steel, 0.04, -0.06, -0.82, 6).rotation.z = -0.5;
    return { muzzle: -1.28, railY: 0.085, railZ: -0.15, gripZ: -0.6, gripY: -0.02, sideZ: -0.7, magX: 0, magY: -0.01, magZ: -0.14, straightMag: true, magW: 0.03, magShort: true, sniperBuiltInScope: true };
  }
};
const MODEL_FOR = { pistol: 'pistol', pistol45: 'pistol45', revolver: 'revolver', smg: 'smg', carbine: 'carbine', ak: 'ak', battle: 'battle', dmr: 'dmr', hunter: 'hunter', lmg: 'lmg', shotgun: 'shotgun', shotgunSemi: 'shotgunSemi', rifle: 'carbine', sniper: 'sniper' };

function addMagazine(g, M, a, magAtt) {
  if (a.noMag) return;
  const att = magAtt && R_ATT[magAtt], mul = att && att.magMul ? Math.min(1.9, att.magMul) : 1, drum = att && att.vis === 'drum', w = a.magW || 0.03;
  if (drum) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.06, 20), M.dark); d.rotation.z = Math.PI / 2; d.position.set(a.magX, a.magY - 0.07, a.magZ - 0.02); g.add(d); B(g, 0.026, 0.05, 0.05, M.dark, a.magX, a.magY - 0.02, a.magZ - 0.01); B(g, 0.064, 0.012, 0.06, M.poly, a.magX, a.magY - 0.07, a.magZ - 0.02); return; }
  const len = (a.magShort ? 0.1 : 0.15) * mul;
  if (a.curvedMag) { for (let i = 0; i < 4; i++) { const t = i / 3; B(g, w, len / 3.2, 0.055, M.dark, a.magX, a.magY - t * len * 0.8, a.magZ - t * t * 0.07 - 0.0, 0.18 + t * 0.12); } }
  else B(g, w, len, 0.05, M.dark, a.magX, a.magY - len / 2 + 0.02, a.magZ, 0.04);
  B(g, w + 0.004, 0.012, 0.058, M.poly, a.magX, a.magY - len + (a.curvedMag ? -0.0 : 0.02), a.magZ - (a.curvedMag ? 0.07 : 0), 0.1);
  if (a.pistolGrip && mul > 1) B(g, 0.031, 0.04 * (mul - 1) * 2, 0.054, M.metal, 0, -0.14, 0.02, 0.18);       // longer grip for pistol magazines
}
// every attachment draws itself from its "vis" tag (see raid-armory.js); g = grade 1..3 makes the better parts a little bigger
function addAttachments(g, M, a, mods) {
  const get = slot => (mods[slot] && R_ATT[mods[slot]]) || null, ry = a.railY, rz = a.railZ;
  const o = get('optic'), m = get('muzzle'), gr = get('grip'), sd = get('side'), st = get('stock'), br = get('barrel');
  if (o) {
    const gg = o.g || 2;
    if (o.vis === 'reddot') { B(g, 0.036, 0.012, 0.05, M.dark, 0, ry + 0.006, rz); B(g, 0.032, 0.036, 0.012, M.dark, 0, ry + 0.03, rz + 0.02); B(g, 0.028, 0.03, 0.004, M.glass, 0, ry + 0.032, rz + 0.012); B(g, 0.004, 0.004, 0.004, M.dot, 0, ry + 0.034, rz + 0.01); B(g, 0.036, 0.008, 0.05, M.dark, 0, ry + 0.052, rz + 0.005); }
    else if (o.vis === 'holo') { B(g, 0.04, 0.012, 0.07, M.dark, 0, ry + 0.006, rz); B(g, 0.038, 0.044, 0.06, M.dark, 0, ry + 0.034, rz); B(g, 0.03, 0.034, 0.004, M.glass, 0, ry + 0.036, rz - 0.032); B(g, 0.03, 0.034, 0.004, M.glass, 0, ry + 0.036, rz + 0.032); }
    else { const z = o.zoomSet || 2, L = Math.min(0.34, 0.12 + z * 0.018), R0 = 0.016 + Math.min(0.012, z * 0.0012) + gg * 0.001;
      Cz(g, R0, R0, L, M.dark, 0, ry + 0.04, rz, 14); Cz(g, R0 * 1.5, R0 * 1.2, 0.05, M.dark, 0, ry + 0.04, rz - L / 2 - 0.02, 14); Cz(g, R0 * 1.3, R0 * 1.3, 0.04, M.dark, 0, ry + 0.04, rz + L / 2 + 0.015, 14);
      Cz(g, R0 * 1.25, R0 * 1.25, 0.004, M.glass, 0, ry + 0.04, rz - L / 2 - 0.047, 14); B(g, 0.014, 0.014, 0.014, M.dark, 0, ry + 0.07, rz); B(g, 0.014, 0.014, 0.014, M.dark, 0.026, ry + 0.04, rz); B(g, 0.03, 0.02, 0.02, M.dark, 0, ry + 0.012, rz - 0.05); B(g, 0.03, 0.02, 0.02, M.dark, 0, ry + 0.012, rz + 0.05); }
  }
  if (m) {
    const z = a.muzzle, gg = m.g || 2;
    if (m.vis === 'supp') { const L = 0.12 + 0.03 * gg; Cz(g, 0.022 + 0.002 * gg, 0.022 + 0.002 * gg, L, M.dark, 0, 0.032, z - L / 2 + 0.03, 14); Cz(g, 0.012, 0.026, 0.02, M.metal, 0, 0.032, z + 0.03, 14); }
    else if (m.vis === 'comp') { Cz(g, 0.017, 0.017, 0.06, M.dark, 0, 0.032, z, 10); for (let i = 0; i < 3; i++) B(g, 0.036, 0.004, 0.008, M.metal, 0, 0.032, z - 0.02 + i * 0.016); }
    else if (m.vis === 'brake') { Cz(g, 0.018, 0.018, 0.07, M.dark, 0, 0.032, z - 0.01, 10); B(g, 0.05, 0.012, 0.03, M.metal, 0, 0.032, z - 0.02); B(g, 0.012, 0.05, 0.03, M.metal, 0, 0.032, z - 0.02); }
    else if (m.vis === 'hider') { Cz(g, 0.015, 0.02, 0.07, M.dark, 0, 0.032, z - 0.01, 10); for (let i = 0; i < 4; i++) B(g, 0.006, 0.006, 0.03, M.metal, Math.cos(i * 1.57) * 0.017, 0.032 + Math.sin(i * 1.57) * 0.017, z - 0.05); }
  }
  if (gr) {
    if (gr.vis === 'vgrip') { Cy(g, 0.012, 0.014, 0.085, M.poly, 0, a.gripY - 0.045, a.gripZ, 10); B(g, 0.03, 0.01, 0.03, M.dark, 0, a.gripY, a.gripZ); }
    else if (gr.vis === 'agrip') { B(g, 0.026, 0.065, 0.034, M.poly, 0, a.gripY - 0.03, a.gripZ - 0.01, -0.7); B(g, 0.03, 0.01, 0.03, M.dark, 0, a.gripY, a.gripZ); }
    else { Cy(g, 0.014, 0.016, 0.04, M.poly, 0, a.gripY - 0.022, a.gripZ, 10); B(g, 0.03, 0.01, 0.03, M.dark, 0, a.gripY, a.gripZ); }
  }
  if (sd) {
    if (sd.vis === 'laser') { B(g, 0.022, 0.026, 0.05, M.dark, 0.037, 0.03, a.sideZ); B(g, 0.01, 0.01, 0.004, M.dot, 0.037, 0.03, a.sideZ - 0.027); }
    else { Cz(g, 0.014, 0.014, 0.06, M.dark, 0.04, 0.03, a.sideZ, 10); Cz(g, 0.012, 0.012, 0.004, new THREE.MeshBasicMaterial({ color: 0xfff6d0 }), 0.04, 0.03, a.sideZ - 0.032, 10); }
  }
  if (st && a.stockZ !== undefined) { B(g, 0.034, 0.05, 0.12, M.tan, 0, 0.0, a.stockZ); B(g, 0.05, 0.014, 0.06, M.dark, 0, 0.04, a.stockZ + 0.02); }
  if (br) { const L = 0.08 + 0.03 * (br.g || 2); Cz(g, 0.021, 0.021, L, M.steel, 0, 0.034, a.muzzle + L / 2 + 0.01, 12); }
}
const FINISH = { black: null, tan: 0x8c7d5a, olive: 0x4a5238, white: 0xd6dade, camo: 0x55603f, gold: 0xc8a13a, chrome: 0xb8bcc2, blue: 0x28384e, red: 0x7a2424 };
const tintCache = {};
function tinted(mat, hex) { const k = mat.uuid + hex; if (!tintCache[k]) { const c = mat.clone(); c.color.setHex(hex); if (hex === FINISH.gold || hex === FINISH.chrome) { c.metalness = 0.95; c.roughness = 0.22; } tintCache[k] = c; } return tintCache[k]; }

// returns { group, muzzleZ, sightY, anchors }. mods = parts the player installed; variants may also ship with parts (cfg.preMods).
window.rdBuildGunModel = function (weaponId, mods, opts) {
  opts = opts || {};
  const M = mats(), cfg = R_GUN[weaponId] || R_GUN.pistol_mk1, g = new THREE.Group();
  const all = Object.assign({}, cfg.preMods || {}, mods || {});
  Object.keys(all).forEach(s => { if (!all[s] || !R_ATT[all[s]] || !rAttFits(all[s], weaponId)) delete all[s]; });
  const kind = MODEL_FOR[cfg.model] || 'pistol';
  const a = GUNS[kind](g, M, all) || {}; if (/^pistol|revolver/.test(cfg.model) && kind !== 'revolver') a.pistolGrip = true;
  addMagazine(g, M, a, all.mag);
  addAttachments(g, M, a, all);
  const builtInScope = cfg.scope && !all.optic && (kind === 'sniper' || kind === 'hunter' || kind === 'dmr');
  if (builtInScope) {          // snipers ship with a scope
    const ry = a.railY, rz = a.railZ; Cz(g, 0.022, 0.022, 0.28, M.dark, 0, ry + 0.04, rz, 14); Cz(g, 0.03, 0.026, 0.05, M.dark, 0, ry + 0.04, rz - 0.16, 14); Cz(g, 0.026, 0.026, 0.04, M.dark, 0, ry + 0.04, rz + 0.15, 14); Cz(g, 0.028, 0.028, 0.004, M.glass, 0, ry + 0.04, rz - 0.187, 14);
    B(g, 0.014, 0.016, 0.014, M.dark, 0, ry + 0.07, rz); B(g, 0.03, 0.02, 0.02, M.dark, 0, ry + 0.012, rz - 0.06); B(g, 0.03, 0.02, 0.02, M.dark, 0, ry + 0.012, rz + 0.06);
  }
  const fin = cfg.finish && FINISH[cfg.finish];                       // colourway of this variant
  g.traverse(o => { if (o.isMesh) { o.castShadow = !opts.noShadow; o.frustumCulled = false; if (fin && (o.material === M.poly || o.material === M.tan || o.material === M.metal)) o.material = tinted(o.material, fin); } });
  const len = cfg.lenScale || 1; if (len !== 1) g.scale.z = len;
  const hasOptic = !!all.optic || builtInScope;
  return { group: g, muzzleZ: a.muzzle * len, sightY: hasOptic ? a.railY + 0.04 : (a.railY || 0.07) + 0.005, anchors: Object.assign({}, a, { railZ: a.railZ * len, muzzle: a.muzzle * len, gripZ: a.gripZ * len }) };
};

// ───────────────────────── soldiers ─────────────────────────
window.rdBuildEnemyMesh = function (type, def) {
  const M = mats(), g = new THREE.Group();
  const tone = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.92, map: M.camo.map }), vest = new THREE.MeshStandardMaterial({ color: def.vest, roughness: 0.85, map: M.glove.map });
  const skin = new THREE.MeshStandardMaterial({ color: 0xb98a68, roughness: 0.8 }), rubber = M.rubber, dark = M.dark;
  const P = (geo, mat, x, y, z, zone) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.userData.zone = zone; g.add(m); return m; };
  const bx = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  [-1, 1].forEach(s => {
    P(bx(0.17, 0.42, 0.2), tone, s * 0.12, 0.62, 0, 'legs'); P(bx(0.15, 0.4, 0.17), tone, s * 0.12, 0.25, 0.01, 'legs'); P(bx(0.16, 0.1, 0.27), rubber, s * 0.12, 0.05, 0.04, 'legs'); P(bx(0.15, 0.09, 0.05), vest, s * 0.12, 0.44, 0.1, 'legs');
    P(bx(0.12, 0.3, 0.14), tone, s * 0.35, 1.33, 0.02, 'arms'); P(bx(0.11, 0.28, 0.12), tone, s * 0.36, 1.07, 0.1, 'arms'); P(bx(0.11, 0.1, 0.12), M.glove, s * 0.36, 0.9, 0.14, 'arms');
  });
  P(bx(0.46, 0.1, 0.27), vest, 0, 0.9, 0, 'stomach'); P(bx(0.44, 0.18, 0.24), tone, 0, 1.03, 0, 'stomach'); [-0.16, 0.0, 0.16].forEach(x => P(bx(0.11, 0.1, 0.07), vest, x, 0.91, 0.15, 'stomach'));
  P(bx(0.5, 0.52, 0.3), type === 'scav' ? tone : vest, 0, 1.35, 0, 'chest'); if (type !== 'scav') { P(bx(0.34, 0.34, 0.05), dark, 0, 1.38, 0.17, 'chest'); [-0.14, 0, 0.14].forEach(x => P(bx(0.1, 0.12, 0.07), vest, x, 1.16, 0.18, 'chest')); P(bx(0.07, 0.12, 0.05), dark, 0.2, 1.52, 0.17, 'chest'); }
  P(bx(0.5, 0.12, 0.22), tone, 0, 1.64, 0, 'chest');
  if (type !== 'scav') P(bx(0.34, 0.42, 0.16), vest, 0, 1.38, -0.22, 'chest');                  // backpack
  P(new THREE.SphereGeometry(0.15, 12, 10), skin, 0, 1.8, 0.01, 'head');
  if (type === 'scav') { P(bx(0.3, 0.1, 0.3), tone, 0, 1.93, 0, 'head'); P(bx(0.3, 0.1, 0.12), tone, 0, 1.87, 0.17, 'head'); }                       // cap
  else { P(new THREE.SphereGeometry(0.19, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), vest, 0, 1.84, 0.0, 'head'); P(bx(0.06, 0.1, 0.06), dark, 0, 1.96, 0.09, 'head'); P(bx(0.08, 0.1, 0.05), dark, 0.18, 1.82, 0, 'head'); P(bx(0.27, 0.1, 0.1), dark, 0, 1.78, 0.14, 'head'); }
  if (type === 'pmc' || type === 'boss') P(bx(0.28, 0.13, 0.06), type === 'boss' ? new THREE.MeshStandardMaterial({ color: 0x8a1818, roughness: 0.9 }) : dark, 0, 1.74, 0.14, 'head');  // face mask
  // weapon
  const gunId = { scav: 'pistol_mk1', raider: 'rifle_ak74', pmc: 'carbine_m4', boss: 'lmg_40' }[type] || 'pistol_mk1';
  const m = window.rdBuildGunModel(gunId, {}, { noShadow: false }), s = type === 'scav' ? 0.9 : 0.8;
  m.group.scale.setScalar(s); m.group.rotation.y = Math.PI; m.group.position.set(0.2, 1.22, 0.22);
  m.group.traverse(o => { if (o.isMesh) o.userData.zone = 'arms'; }); g.add(m.group);
  g.userData.isEnemyRoot = true; g.userData.muzzle = new THREE.Vector3(0.2, 1.24, 0.22 + Math.abs(m.muzzleZ) * s);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
};

// ───────────────────────── reflections ─────────────────────────
// a soft sky/ground gradient with a bright sun, baked into a PMREM environment so metals reflect something real
window.rdMakeEnv = function (renderer, skyHex, groundHex, studio) {
  try {
    const sky = new THREE.Color(skyHex || 0x8aa0c0), gr = new THREE.Color(groundHex || 0x444444); if (studio) { sky.set(0xdde4ee); gr.set(0x333840); }
    const sc = new THREE.Scene(), geo = new THREE.SphereGeometry(50, 32, 16), cols = [], pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const t = (pos.getY(i) / 50 + 1) / 2; const c = gr.clone().lerp(sky.clone().multiplyScalar(1.2), Math.pow(t, 0.8)); if (t > 0.45 && t < 0.55) c.multiplyScalar(1.3); cols.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    sc.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const sun = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.95, 0.85).multiplyScalar(14) })); sun.position.set(30, 32, 18); sc.add(sun);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(30, 3, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(6) })); strip.position.set(-20, 24, -25); sc.add(strip);
    const pm = new THREE.PMREMGenerator(renderer); const rt = pm.fromScene(sc, 0.04); pm.dispose(); geo.dispose();
    return rt.texture;
  } catch (e) { return null; }
};

// reflection map for a raid: the same sky colours as the real sky dome (top / horizon / ground) plus a very bright sun, baked with PMREM
window.rdMakeSkyEnv = function (renderer, P, sunDir) {
  try {
    const sc = new THREE.Scene(), geo = new THREE.SphereGeometry(50, 32, 20), pos = geo.attributes.position, cols = [];
    const top = new THREE.Color(P.top), hor = new THREE.Color(P.hor), gr = new THREE.Color(P.ground);
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 50; const c = y >= 0 ? hor.clone().lerp(top, Math.pow(y, 0.45)) : hor.clone().lerp(gr, Math.min(1, -y * 4)); c.multiplyScalar(1.15); cols.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    sc.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const sun = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(P.sun).multiplyScalar(Math.max(2, P.sunI * 7)) })); sun.position.copy(sunDir).multiplyScalar(38); sc.add(sun);
    const pm = new THREE.PMREMGenerator(renderer), rt = pm.fromScene(sc, 0.04); pm.dispose(); geo.dispose(); return rt.texture;
  } catch (e) { return null; }
};

// ───────────────────────── Armory previews ─────────────────────────
let iconRenderer = null, iconEnv = null; const iconCache = {};
window.rdClearGunIcons = function () { Object.keys(iconCache).forEach(k => delete iconCache[k]); };   // called when the model style changes
function getIconRenderer() {
  if (iconRenderer) return iconRenderer;
  iconRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  iconRenderer.outputEncoding = THREE.sRGBEncoding; iconRenderer.toneMapping = THREE.ACESFilmicToneMapping; iconRenderer.toneMappingExposure = 1.0;
  iconEnv = window.rdMakeEnv(iconRenderer, 0xb8c4d6, 0x303338, true); return iconRenderer;
}
function stage(weaponId, mods) {
  const sc = new THREE.Scene(); sc.environment = iconEnv; const m = window.rdBuildGunModel(weaponId, mods, { noShadow: true });
  const bb = new THREE.Box3().setFromObject(m.group), size = bb.getSize(new THREE.Vector3()), ctr = bb.getCenter(new THREE.Vector3());
  m.group.position.sub(ctr); const pivot = new THREE.Group(); pivot.add(m.group); sc.add(pivot);
  const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(2, 3, 3); sc.add(key); sc.add(new THREE.AmbientLight(0xffffff, 0.35));
  const rim = new THREE.DirectionalLight(0x9ab8ff, 0.7); rim.position.set(-3, 1, -2); sc.add(rim);
  return { sc, pivot, size };
}
function frame(cam, size, aspect) {            // size = (length, height, depth) of the gun; fit it to ~80% of the picture
  const L = size.x, H = size.y, t = Math.tan(cam.fov * Math.PI / 360);
  const z = Math.max((L / 2 * 1.25) / (t * aspect), (H / 2 * 1.7) / t) + size.z / 2;
  cam.position.set(0, 0.02, z); cam.lookAt(0, 0, 0);
}
window.rdGunIcon = function (weaponId, mods, w, h) {
  w = w || 260; h = h || 120; const key = weaponId + '|' + JSON.stringify(mods || {}) + '|' + w;
  if (iconCache[key]) return iconCache[key];
  try {
    const r = getIconRenderer(); r.setSize(w, h, false); r.setPixelRatio(1);
    const st = stage(weaponId, mods || {}); st.pivot.rotation.y = -Math.PI / 2 + 0.25;                        // side view, slightly angled
    const cam = new THREE.PerspectiveCamera(30, w / h, 0.05, 20); frame(cam, new THREE.Vector3(st.size.z, st.size.y, st.size.x), w / h);   // pivot turned 90°: on-screen length = model z
    r.render(st.sc, cam); return (iconCache[key] = r.domElement.toDataURL('image/png'));
  } catch (e) { return ''; }
};
// live rotating preview inside a div; returns { set(weaponId, mods), dispose() }
window.rdGunPreview = function (container, weaponId, mods) {
  const w = container.clientWidth || 420, h = container.clientHeight || 200;
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true }); r.setSize(w, h); r.setPixelRatio(Math.min(devicePixelRatio, 2));
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; container.innerHTML = ''; container.appendChild(r.domElement);
  const env = window.rdMakeEnv(r, 0xb8c4d6, 0x303338, true); let st = null, alive = true, ang = -1.2, drag = false, lx = 0;
  const cam = new THREE.PerspectiveCamera(30, w / h, 0.05, 20);
  function set(id, md) { st = stage(id, md || {}); st.sc.environment = env; frame(cam, new THREE.Vector3(st.size.z, st.size.y, st.size.x), w / h); }
  set(weaponId, mods);
  r.domElement.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; }); window.addEventListener('pointerup', () => drag = false);
  window.addEventListener('pointermove', e => { if (drag) { ang += (e.clientX - lx) * 0.01; lx = e.clientX; } });
  (function loop() { if (!alive) return; requestAnimationFrame(loop); if (!drag) ang += 0.008; if (st) { st.pivot.rotation.y = ang; r.render(st.sc, cam); } })();
  return { set, dispose() { alive = false; r.dispose(); } };
};
})();
