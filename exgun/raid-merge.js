// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — ONE MESH PER MAP
//   After a map is built, every static piece of it (buildings, floors, walls, furniture, fences, rocks, barriers, roads, decorations …) is welded
//   into ONE mesh. Hundreds or thousands of separate objects become a single object that the GPU draws in a handful of calls — much less lag.
//   • Colours are baked into vertex colours, so buildings that only differ by colour share one material (a handful of materials in total).
//   • Things that move or change are left out on purpose: soldiers, vehicles, containers, extraction rings, the sky, instanced trees/rocks/grass,
//     sprites, effects, and anything you are holding.
//   • The nuke can still flatten part of the map: window.rdMapRemove(test) rebuilds the single mesh without the destroyed parts.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const tmpV = new THREE.Vector3(), nm = new THREE.Matrix3();
function sig(mat) {
  return [mat.type, mat.map && mat.map.uuid, mat.normalMap && mat.normalMap.uuid, mat.roughnessMap && mat.roughnessMap.uuid, mat.metalnessMap && mat.metalnessMap.uuid, mat.roughness, mat.metalness, mat.transparent, mat.opacity, mat.side, mat.emissive && mat.emissive.getHex(), mat.emissiveIntensity, mat.blending, mat.depthWrite, mat.flatShading, mat.envMapIntensity, mat.alphaTest, mat.normalScale && mat.normalScale.x].join('|');
}
function build(parts) {
  const groups = new Map(), pos = [], nor = [], uv = [], col = []; let vbase = 0;
  parts.forEach(p => {
    const g = p.geo, pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv, mw = p.mw, mat = p.mat; nm.getNormalMatrix(mw); const c = mat.color || { r: 1, g: 1, b: 1 };
    for (let i = 0; i < pa.count; i++) {
      tmpV.fromBufferAttribute(pa, i).applyMatrix4(mw); pos.push(tmpV.x, tmpV.y, tmpV.z);
      if (na) { tmpV.fromBufferAttribute(na, i).applyMatrix3(nm).normalize(); nor.push(tmpV.x, tmpV.y, tmpV.z); } else nor.push(0, 1, 0);
      if (ua) uv.push(ua.getX(i), ua.getY(i)); else uv.push(0, 0);
      col.push(c.r, c.g, c.b);
    }
    const key = sig(mat); let gr = groups.get(key); if (!gr) { gr = { mat, idx: [] }; groups.set(key, gr); }
    if (g.index) { const ia = g.index; for (let i = 0; i < ia.count; i++) gr.idx.push(ia.getX(i) + vbase); } else for (let i = 0; i < pa.count; i++) gr.idx.push(i + vbase);
    vbase += pa.count;
  });
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const all = [], mats = []; let start = 0; groups.forEach(gr => { const m = gr.mat.clone(); m.vertexColors = true; if (m.color) m.color.set(0xffffff); m.shadowSide = THREE.BackSide; m.needsUpdate = true; geo.addGroup(start, gr.idx.length, mats.length); mats.push(m); start += gr.idx.length; for (let i = 0; i < gr.idx.length; i++) all.push(gr.idx[i]); });
  geo.setIndex(vbase > 65535 ? new THREE.Uint32BufferAttribute(all, 1) : new THREE.Uint16BufferAttribute(all, 1)); geo.computeBoundingSphere(); geo.computeBoundingBox();
  const mesh = new THREE.Mesh(geo, mats); mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.mapMesh = true; mesh.name = 'MAP'; return mesh;
}
function okMaterial(m) { return m && !Array.isArray(m) && (m.isMeshStandardMaterial || m.isMeshBasicMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial) && !m.isShaderMaterial; }
window.rdMergeMap = function () {
  if (typeof scene === 'undefined' || !scene) return null; const R = window.RAID;
  if (scene.userData.mapMeshObj && scene.children.includes(scene.userData.mapMeshObj)) return scene.userData.mapMeshObj;
  try { if (window.rdRealify) window.rdRealify(); } catch (e) { console.warn('realify', e); }
  scene.updateMatrixWorld(true); const skip = new Set();
  if (R) { (R.containers || []).forEach(c => { if (c.mesh) c.mesh.traverse(o => skip.add(o)); if (c.lid) skip.add(c.lid); }); (R.extracts || []).forEach(e => { if (e.ring) skip.add(e.ring); if (e.beam) skip.add(e.beam); }); }
  const parts = [], victims = [];
  (function walk(o) {
    if (o === camera) return; const u = o.userData || {};
    if (u.enemy || u.isEnemyRoot || u.vehicle || u.nuke || u.keepMesh || u.hy || u.mapMesh || u.isGun || u.noMerge) return;
    if (o.isLight || o.isSprite || o.isLine || o.isPoints || o.isInstancedMesh || o.isSkinnedMesh) return;
    if (o.isMesh && o.visible !== false && !skip.has(o) && okMaterial(o.material) && o.geometry && o.geometry.attributes && o.geometry.attributes.position && o.geometry.attributes.position.count) {
      const mw = o.matrixWorld.clone(), p = new THREE.Vector3().setFromMatrixPosition(mw); parts.push({ geo: o.geometry, mat: o.material, mw, x: p.x, y: p.y, z: p.z, gt: o.geometry.type }); victims.push(o);
    }
    for (let i = 0; i < o.children.length; i++) walk(o.children[i]);
  })(scene);
  if (parts.length < 8) return null;
  const mesh = build(parts); victims.forEach(o => { if (o.parent) o.parent.remove(o); }); scene.add(mesh); scene.userData.mapMeshObj = mesh; scene.userData.mergeParts = parts;
  mesh.userData.stats = { parts: parts.length, materials: mesh.material.length, tris: mesh.geometry.index.count / 3 }; window.MAPMERGE = mesh.userData.stats; return mesh;
};
// rebuild the single mesh without the parts `test(part)` selects (part = {x,y,z,gt}); returns how many were removed
window.rdMapRemove = function (test) {
  const parts = scene.userData.mergeParts, old = scene.userData.mapMeshObj; if (!parts || !old) return 0; const keep = parts.filter(p => !test(p)), n = parts.length - keep.length; if (!n) return 0;
  scene.remove(old); old.geometry.dispose(); old.material.forEach(m => m.dispose()); const mesh = build(keep); scene.add(mesh); scene.userData.mapMeshObj = mesh; scene.userData.mergeParts = keep; mesh.userData.stats = { parts: keep.length, materials: mesh.material.length, tris: mesh.geometry.index.count / 3 }; window.MAPMERGE = mesh.userData.stats; return n;
};
// after any raid map (sectors, Open World, Explox City, the house) is fully set up
const prevEnter = window.rdEnterRaid;
window.rdEnterRaid = function () { const r = prevEnter.apply(this, arguments); try { window.rdMergeMap(); } catch (e) { console.warn('map merge', e); } return r; };
})();
