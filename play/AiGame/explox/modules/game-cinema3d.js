// ─── CINEMA 3D — user's own ask: "make all the movies 3d funny cool and the people will be explox people".
// Every movie in CINEMA_MOVIES keeps its title, scenes, captions, narrator voice and sound effects, but each
// scene's picture is now a real 3D scene (three.js) starring Explox people (the same blocky people as the city's
// NPCs) in costumes, with funny gags (banana slips, BONK stars, big heads, spins), cool camera moves and
// confetti. It is drawn into the same cinema canvas the old 2D scenes used (scene.draw(ctx,w,h,t)), so skip,
// narration, sounds and credits all keep working. If WebGL is not available the old 2D drawing is used instead.
(function () {
  if (typeof THREE === 'undefined' || typeof CINEMA_MOVIES === 'undefined') return;

  // ---------- small helpers ----------
  const hash = (a, b, c) => { let h = (a * 73856093) ^ (b * 19349663) ^ ((c || 0) * 83492791); h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0); };
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hexOf = (css) => { try { return new THREE.Color(css).getHex(); } catch (e) { return 0x223344; } };

  let R = null, failed = false;
  const SC = new THREE.Scene();
  const CAM = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 400);
  const hemi = new THREE.HemisphereLight(0xbbccff, 0x332211, 0.9); SC.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(10, 20, 12); SC.add(sun);
  const rim = new THREE.PointLight(0xff88aa, 0.8, 60); rim.position.set(-8, 6, -6); SC.add(rim);
  let stage = null, fxGroup = new THREE.Group(), words = [];
  SC.add(fxGroup);

  function renderer(w, h) {
    if (failed) return null;
    if (!R) {
      try {
        R = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: false });
        R.setPixelRatio(1);
      } catch (e) { failed = true; return null; }
    }
    const rw = Math.max(320, Math.min(1280, w)), rh = Math.round(rw * h / w);
    if (R.domElement.width !== rw || R.domElement.height !== rh) { R.setSize(rw, rh, false); CAM.aspect = w / h; CAM.fov = (w / h < 1.3) ? 82 : 55; CAM.updateProjectionMatrix(); }
    return R;
  }

  // ---------- Explox people (same box shapes, proportions and hair/hat styles as the city NPCs) ----------
  const mat = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
  function box(parent, w, h, d, color, x, y, z, o) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, o)); m.position.set(x, y, z); parent.add(m); return m;
  }
  function tagSprite(name, role) {
    const c = document.createElement('canvas'); c.width = 320; c.height = 110; const x = c.getContext('2d');
    x.fillStyle = 'rgba(0,0,0,.7)'; x.fillRect(0, role ? 4 : 30, 320, role ? 102 : 52);
    x.fillStyle = '#fff'; x.font = 'bold 32px Arial'; x.textAlign = 'center'; x.fillText(name, 160, role ? 44 : 66);
    if (role) { x.fillStyle = '#ffd54f'; x.font = 'italic bold 28px Arial'; x.fillText('as ' + role, 160, 90); }
    const t = new THREE.CanvasTexture(c); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false }));
    s.scale.set(3.4, 1.17, 1); s.position.y = 4.6; return s;
  }
  function buildPerson(def, o) {
    o = o || {};
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const skin = o.skin != null ? o.skin : def.skin, shirt = o.shirt != null ? o.shirt : def.shirt, pants = o.pants != null ? o.pants : def.pants;
    const mkLimb = (px, py, w, h, color, hh) => { const p = new THREE.Group(); p.position.set(px, py, 0); body.add(p); box(p, w, h, w, color, 0, -h / 2 + 0.05, 0); return p; };
    const legL = mkLimb(-0.22, 1.2, 0.35, 0.85, pants), legR = mkLimb(0.22, 1.2, 0.35, 0.85, pants);
    box(legL, 0.38, 0.22, 0.46, 0x333333, 0, -0.8, 0.05); box(legR, 0.38, 0.22, 0.46, 0x333333, 0, -0.8, 0.05);
    const torso = box(body, 0.8, 1.0, 0.45, shirt, 0, 1.75, 0);
    const armL = mkLimb(-0.6, 2.2, 0.32, 0.85, shirt), armR = mkLimb(0.6, 2.2, 0.32, 0.85, shirt);
    box(armL, 0.3, 0.2, 0.3, skin, 0, -0.78, 0); box(armR, 0.3, 0.2, 0.3, skin, 0, -0.78, 0);
    const head = new THREE.Group(); head.position.set(0, 2.75, 0); body.add(head);
    box(head, 0.9, 0.9, 0.9, skin, 0, 0, 0);
    // face: big funny eyes + smile
    box(head, 0.24, 0.26, 0.05, 0xffffff, -0.2, 0.08, 0.46); box(head, 0.24, 0.26, 0.05, 0xffffff, 0.2, 0.08, 0.46);
    box(head, 0.1, 0.12, 0.06, 0x111111, -0.18, 0.06, 0.49); box(head, 0.1, 0.12, 0.06, 0x111111, 0.22, 0.06, 0.49);
    const mouth = box(head, 0.4, 0.09, 0.05, 0x7a2a1a, 0, -0.22, 0.47);
    const hc = def.hairColor != null ? def.hairColor : 0x2a1a0a, hy = 0.6;
    const H = (w, h, d, c, x, y, z) => box(head, w, h, d, c, x, y, z);
    switch (def.hair) {
      case 'short': H(1.08, .3, .95, hc, 0, .6, 0); H(.25, .5, .9, hc, -.6, .35, 0); H(.25, .5, .9, hc, .6, .35, 0); break;
      case 'long': H(1.08, .3, .95, hc, 0, .6, 0); H(.28, 1.4, .9, hc, -.6, -.35, 0); H(.28, 1.4, .9, hc, .6, -.35, 0); H(.9, 1.4, .28, hc, 0, -.35, -.5); break;
      case 'spiky': H(1.1, .2, 1.0, hc, 0, .6, 0); [-.35, -.17, 0, .17, .35].forEach((sx, i) => H(.18, .5 + i % 2 * .2, .18, hc, sx, .95 + i % 2 * .1, 0)); break;
      case 'afro': H(1.5, 1.4, 1.4, hc, 0, .35, 0); break;
      case 'ponytail': H(1.08, .3, .95, hc, 0, .6, 0); H(.25, .5, .9, hc, -.6, .35, 0); H(.28, 1.8, .28, hc, 0, -.55, -.5); break;
      case 'curly': [-.3, 0, .3].forEach(cx => H(.5, .55, .5, hc, cx, .65, 0)); H(.28, 1.2, .28, hc, -.6, -.05, 0); H(.28, 1.2, .28, hc, .6, -.05, 0); break;
      default: H(1.0, .22, .95, hc, 0, .58, 0);
    }
    const hat = o.hat !== undefined ? o.hat : def.hat;
    const hatCol = o.hatColor != null ? o.hatColor : null;
    if (hat === 'police') { H(1.0, .15, 1.0, 0x1a2a55, 0, .5, 0); H(.85, .3, .85, 0x223366, 0, .7, 0); H(.3, .06, .3, 0xFFD700, 0, .57, .42); }
    else if (hat === 'cap') { H(1.2, .15, 1.2, hatCol || 0xee4444, 0, .6, 0); H(.9, .5, .8, hatCol || 0xee4444, 0, .88, -.05); H(.5, .12, .4, hatCol || 0xee4444, 0, .53, .7); }
    else if (hat === 'cowboy') { H(1.7, .12, 1.7, 0x8B4513, 0, .57, 0); H(.9, .7, .9, 0x8B4513, 0, .97, 0); }
    else if (hat === 'crown') { H(1.1, .28, 1.1, 0xFFD700, 0, .6, 0); [-.35, 0, .35].forEach((cx, i) => H(.22, .4 + i % 2 * .15, .22, 0xFFD700, cx, .95, 0)); }
    else if (hat === 'helmet') { H(1.15, .85, 1.15, hatCol || 0x667788, 0, .73, 0); H(.7, .3, .15, 0x88ccff, 0, .47, .56); }
    else if (hat === 'tophat') { H(1.35, .1, 1.35, 0x111111, 0, .57, 0); H(.9, .9, .9, 0x111111, 0, 1.05, 0); }
    else if (hat === 'beanie') { H(1.05, .7, 1.05, hatCol || shirt, 0, .75, 0); H(.35, .35, .35, 0xffffff, 0, 1.17, 0); }
    else if (hat === 'fedora') { H(1.5, .1, 1.5, 0x7a5c3a, 0, .57, 0); H(.9, .65, .9, 0x7a5c3a, 0, .9, 0); H(.91, .08, .91, 0x333333, 0, .62, 0); }
    else if (hat === 'wizard') { const w = new THREE.Mesh(new THREE.ConeGeometry(.6, 1.8, 8), mat(0x4444aa)); w.position.set(0, 1.45, 0); head.add(w); H(1.3, .12, 1.3, 0x4444aa, 0, .56, 0); }
    else if (hat === 'sunglasses') { H(.9, .22, .1, 0x111111, 0, .1, .5); }
    else if (hat === 'chef') { H(1.1, .3, 1.1, 0xffffff, 0, .62, 0); H(.95, 1.0, .95, 0xffffff, 0, 1.15, 0); }
    else if (hat === 'duck') { H(1.0, .34, 1.0, 0xffee58, 0, .62, 0); H(.7, .5, .7, 0xffee58, .1, .98, 0); H(.5, .16, .3, 0xfb8c00, .1, .95, .5); H(.14, .14, .08, 0x222222, .3, 1.05, .36); }
    if (def.role === 'Celebrity') { H(.82, .22, .1, 0x0a0a0a, 0, .1, .5); }
    const tag = o.noTag ? null : tagSprite(o.name || def.name, o.role); if (tag) g.add(tag);
    return { g, body, head, torso, armL, armR, legL, legR, mouth, def, tag, baseY: 0, extras: {} };
  }

  // ---------- costumes (everybody is still an Explox person, just dressed up) ----------
  function costume(p, kind) {
    const e = p.extras, b = p.body, hd = p.head;
    const add = (w, h, d, c, x, y, z, parent, o) => box(parent || b, w, h, d, c, x, y, z, o);
    switch (kind) {
      case 'robot': {
        const grey = 0x9aa5b1; [p.torso, p.legL.children[0], p.legR.children[0], p.armL.children[0], p.armR.children[0]].forEach(m => m.material.color.setHex(grey));
        hd.children[0].material.color.setHex(0xb8c2cc);
        add(.1, .8, .1, 0x667788, 0, .8, 0, hd); add(.3, .3, .3, 0xff2222, 0, 1.25, 0, hd, { emissive: 0x880000 });
        add(.65, .2, .1, 0x00ddff, 0, .08, .5, hd, { emissive: 0x006688 });
        add(.35, .35, .1, 0xff5522, 0, 1.8, .26, b);
        break; }
      case 'dino': {
        const green = 0x4caf50; hd.children[0].material.color.setHex(green); [p.armL.children[0], p.armR.children[0]].forEach(m => m.material.color.setHex(green)); p.torso.material.color.setHex(0x388e3c);
        for (let i = 0; i < 5; i++) add(.22, .4 + (i % 2) * .15, .22, 0xffcc00, 0, 2.2 - i * .3, -.34 - i * .02, b);
        for (let i = 0; i < 4; i++) add(.5 - i * .1, .4 - i * .06, .55, green, 0, 1.2 - i * .1, -.5 - i * .5, b);
        add(.8, .35, .6, green, 0, -.15, .55, hd); add(.12, .12, .1, 0xffffff, -.2, -.3, .85, hd); add(.12, .12, .1, 0xffffff, .2, -.3, .85, hd);
        break; }
      case 'ninja': {
        [p.torso, p.legL.children[0], p.legR.children[0], p.armL.children[0], p.armR.children[0]].forEach(m => m.material.color.setHex(0x111111));
        add(1.0, .26, 1.0, 0xcc0000, 0, .25, 0, hd); add(.5, .15, .2, 0xcc0000, .6, .25, -.5, hd);
        add(.92, .38, .06, 0x111111, 0, -.2, .47, hd);
        break; }
      case 'grandma': {
        add(1.1, .8, .7, 0x9b59b6, 0, 1.0, 0); add(.9, .06, .1, 0xcccccc, 0, .12, .5, hd);
        add(.28, .26, .05, 0x222222, -.22, .08, .5, hd); add(.28, .26, .05, 0x222222, .22, .08, .5, hd);
        add(.45, .35, .2, 0xcc3366, .75, .9, .1, p.armR);
        break; }
      case 'cat': {
        const gray = 0xff9933; hd.children[0].material.color.setHex(gray);
        add(.3, .4, .15, gray, -.3, .65, 0, hd); add(.3, .4, .15, gray, .3, .65, 0, hd); add(.1, .1, .1, 0xff88aa, 0, -.05, .5, hd);
        for (let i = 0; i < 6; i++) add(.18, .18, .18, gray, 0, 1.0 - i * .05, -.3 - i * .22, b);
        add(1.4, 1.5, .08, 0xdd1111, 0, 1.7, -.3, b);   // hero cape
        break; }
      case 'pizza': {
        const d = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, .3, 20), mat(0xf4b942)); d.rotation.x = Math.PI / 2; d.position.set(0, 1.9, -.4); b.add(d);
        for (let i = 0; i < 7; i++) { const pp = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .08, 10), mat(0xcc2222)); pp.rotation.x = Math.PI / 2; pp.position.set(Math.cos(i * 2.4) * .7, 1.9 + Math.sin(i * 2.4) * .7, -.22); b.add(pp); }
        add(.5, .12, .08, 0x220000, -.2, .35, .5, hd).rotation.z = .5; add(.5, .12, .08, 0x220000, .2, .35, .5, hd).rotation.z = -.5;
        break; }
      case 'detective': {
        p.torso.material.color.setHex(0xb08850); add(1.0, 1.2, .55, 0xb08850, 0, 1.2, 0);
        const lens = new THREE.Mesh(new THREE.TorusGeometry(.3, .06, 8, 16), mat(0x222222)); lens.position.set(.1, -.7, .2); p.armR.add(lens);
        break; }
      case 'ghost': {
        [p.torso, p.legL.children[0], p.legR.children[0], p.armL.children[0], p.armR.children[0], hd.children[0]].forEach(m => { m.material.color.setHex(0xeeeeff); m.material.transparent = true; m.material.opacity = .55; m.material.emissive = new THREE.Color(0x6677aa); });
        e.ghost = true; break; }
      case 'alien': {
        const gr = 0x66dd66; hd.children[0].material.color.setHex(gr); hd.scale.set(1.25, 1.25, 1.25); [p.armL.children[0], p.armR.children[0]].forEach(m => m.material.color.setHex(gr));
        add(.08, .6, .08, gr, -.25, .85, 0, hd); add(.08, .6, .08, gr, .25, .85, 0, hd); add(.2, .2, .2, 0xffee00, -.25, 1.2, 0, hd, { emissive: 0x887700 }); add(.2, .2, .2, 0xffee00, .25, 1.2, 0, hd, { emissive: 0x887700 });
        break; }
      case 'dragon': {
        const rd = 0xc0392b; [p.torso, p.armL.children[0], p.armR.children[0]].forEach(m => m.material.color.setHex(rd)); hd.children[0].material.color.setHex(0xd35400);
        const w1 = box(b, 1.6, 1.3, .08, 0x7b241c, -1.1, 2.2, -.4), w2 = box(b, 1.6, 1.3, .08, 0x7b241c, 1.1, 2.2, -.4); e.wings = [w1, w2];
        add(.18, .5, .18, 0xf1c40f, -.3, .7, 0, hd); add(.18, .5, .18, 0xf1c40f, .3, .7, 0, hd);
        for (let i = 0; i < 5; i++) add(.3 - i * .04, .3 - i * .04, .3, rd, 0, .9 - i * .08, -.45 - i * .3, b);
        break; }
      case 'racer': {
        add(1.2, .9, 1.2, 0xffee00, 0, 0, 0, hd).position.y = .3; add(.9, .3, .2, 0x113355, 0, .1, .6, hd);
        p.torso.material.color.setHex(0xff3300); add(.9, .5, .2, 0xffffff, 0, 1.8, .24, b); break; }
      case 'athlete': {
        add(1.0, .2, 1.0, 0xffffff, 0, .25, 0, hd); add(.3, .3, .06, 0xFFD700, 0, 2.0, .26, b); break; }
      case 'king': {
        add(1.6, 1.8, .08, 0x6a1b9a, 0, 1.6, -.3, b); p.torso.material.color.setHex(0x4B0082); break; }
      case 'doctor': {
        p.torso.material.color.setHex(0xffffff); add(1.0, 1.15, .55, 0xffffff, 0, 1.2, 0); add(.1, .35, .06, 0xdd2222, 0, 1.9, .3, b); add(.35, .1, .06, 0xdd2222, 0, 1.9, .3, b);
        add(.32, .32, .08, 0xcccccc, 0, .5, .45, hd); break; }
      case 'pioneer': {
        add(1.0, 1.0, .5, 0x6d4c41, 0, 1.75, .02); break; }
      case 'pilot': {
        add(1.1, .3, .15, 0x442200, 0, .2, .46, hd); add(.35, .25, .1, 0x88ddff, -.2, .2, .55, hd); add(.35, .25, .1, 0x88ddff, .2, .2, .55, hd);
        add(1.1, .25, .5, 0xdddddd, 0, 2.3, .1, b); break; }
      case 'wizard': {
        add(1.4, 1.9, .08, 0x1a237e, 0, 1.4, -.28, b); const st = box(p.armR, .1, 2.2, .1, 0x8d6e63, 0, -.5, .2); box(st, .35, .35, .35, 0x00e5ff, 0, 1.2, 0, { emissive: 0x006688 }); break; }
      case 'hero':
      default: {
        add(1.2, 1.6, .08, 0xe91e63, 0, 1.6, -.3, b); }
    }
  }
  const KEYS = [
    [/robot|android|mecha|bot|cyber/i, 'robot'], [/dino|rex/i, 'dino'], [/ninja|fist|shadow/i, 'ninja'], [/grandma/i, 'grandma'], [/cat/i, 'cat'], [/pizza/i, 'pizza'],
    [/detective|mystery|missing/i, 'detective'], [/ghost/i, 'ghost'], [/alien|space|galactic|galaxy/i, 'alien'], [/dragon/i, 'dragon'], [/prix|racing|race|grand prix/i, 'racer'],
    [/games|sports|athlete/i, 'athlete'], [/king|mayor|wrath|war|badge/i, 'king'], [/doctor/i, 'doctor'], [/house|market|wall|almanac|first|dreamed/i, 'pioneer'], [/wings|fly|pilot/i, 'pilot'], [/time|travel|magic/i, 'wizard'],
  ];
  function tagsFor(mv) {
    const s = mv.title + ' ' + mv.genre, out = [];
    KEYS.forEach(([re, k]) => { if (re.test(s) && out.indexOf(k) < 0) out.push(k); });
    ['hero', 'alien', 'robot', 'wizard', 'athlete', 'racer'].forEach(k => { if (out.length < 3 && out.indexOf(k) < 0) out.push(k); });
    return out;
  }

  // ---------- stages (3D sets) ----------
  function winTex() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d');
    x.fillStyle = '#1d2433'; x.fillRect(0, 0, 64, 128);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) { x.fillStyle = Math.random() < .55 ? '#ffe9a0' : '#27324a'; x.fillRect(6 + j * 14, 6 + i * 15, 9, 10); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  function buildStage(kind, accent, sky, seed) {
    const g = new THREE.Group(), r = rnd(seed);
    if (kind === 'space') {
      const pts = new Float32Array(2400); for (let i = 0; i < 800; i++) { const a = r() * 6.283, b = Math.acos(2 * r() - 1), d = 90 + r() * 40; pts[i * 3] = d * Math.sin(b) * Math.cos(a); pts[i * 3 + 1] = Math.abs(d * Math.cos(b)) * .8 + 2; pts[i * 3 + 2] = d * Math.sin(b) * Math.sin(a); }
      const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      g.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, sizeAttenuation: false })));
      [[-30, 22, -45, 9, 0xcc5522], [38, 30, -60, 14, 0x3366cc], [8, 12, -80, 5, 0xaaaa33]].forEach(([x, y, z, rr, c], i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(rr, 20, 14), mat(c, { emissive: new THREE.Color(c).multiplyScalar(.25) })); m.position.set(x, y, z); g.add(m); if (i === 1) { const ring = new THREE.Mesh(new THREE.TorusGeometry(rr * 1.7, .5, 6, 36), mat(0xddccaa)); ring.rotation.x = 1.2; ring.position.copy(m.position); g.add(ring); } });
      const fl = new THREE.Mesh(new THREE.BoxGeometry(110, .6, 110), mat(0x2a3040)); fl.position.y = -.3; g.add(fl);
      const grid = new THREE.GridHelper(110, 55, accent, 0x334466); grid.position.y = .02; g.add(grid);
      for (let i = 0; i < 14; i++) { const a = box(g, 1 + r() * 2, 1 + r() * 2, 1 + r() * 2, 0x777788, (r() - .5) * 70, 4 + r() * 16, -18 - r() * 30); a.userData.spin = r() * 1.2 + .3; }
    } else if (kind === 'city') {
      const road = new THREE.Mesh(new THREE.BoxGeometry(150, .4, 150), mat(0x34373d)); road.position.y = -.2; g.add(road);
      for (let i = -4; i <= 4; i++) box(g, 3, .06, .5, 0xffee88, i * 9, .02, 4);
      const wt = winTex(); const wm = new THREE.MeshLambertMaterial({ map: wt });
      for (let row = 0; row < 2; row++) for (let i = -6; i <= 6; i++) { const h = 8 + r() * 22; const b = new THREE.Mesh(new THREE.BoxGeometry(6, h, 6), wm.clone()); b.material.map = wt.clone(); b.material.map.needsUpdate = true; b.material.map.repeat.set(1, Math.max(1, Math.round(h / 8))); b.position.set(i * 8 + r() * 2, h / 2, -52 - row * 16); b.material.color.setHex(row ? 0x8899aa : 0xaabbcc); g.add(b); }
      for (let i = -3; i <= 3; i++) { box(g, .3, 6, .3, 0x333333, i * 12, 3, 9); const l = box(g, .9, .5, .9, 0xffeeaa, i * 12, 6.2, 9, { emissive: 0xaa8833 }); }
    } else {
      const gr = new THREE.Mesh(new THREE.CylinderGeometry(70, 70, .6, 40), mat(0x4a8c3a)); gr.position.y = -.3; g.add(gr);
      for (let i = 0; i < 7; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(10 + r() * 8, 14, 10), mat(0x3d7a31)); h.scale.y = .55; h.position.set(-50 + i * 17, -2, -62 - r() * 12); g.add(h); }
      for (let i = 0; i < 26; i++) { const x = (r() - .5) * 90, z = -40 - r() * 26; box(g, .8, 3, .8, 0x6d4c41, x, 1.5, z); box(g, 3.2, 3.2, 3.2, 0x2e7d32 + ((i % 3) * 0x0a1400), x, 4.2, z); }
      const sn = new THREE.Mesh(new THREE.SphereGeometry(4, 14, 10), mat(0xffee88, { emissive: 0xaa8800 })); sn.position.set(30, 32, -70); g.add(sn);
      for (let i = 0; i < 8; i++) { const c = box(g, 6 + r() * 5, 1.4, 3, 0xffffff, (r() - .5) * 90, 22 + r() * 12, -40 - r() * 20, { transparent: true, opacity: .9 }); c.userData.drift = .5 + r(); }
    }
    return g;
  }
  function kindFor(mv, mi, sceneText) {
    const t = (mv.title + ' ' + mv.genre + ' ' + (sceneText || '')).toLowerCase();
    if (/space|galax|planet|rocket|alien|orbit|star|robot dino|prix|time travel|mothership/.test(t)) return 'space';
    if (/forest|tree|nature|dragon|island|village|farm|mountain|wings|grandma|ninja|valley|river|cabin|garden/.test(t)) return 'nature';
    return 'city';
  }

  // ---------- props: the 3D things a scene's caption talks about ----------
  const propCache = {};
  function makeProp(kind) {
    if (propCache[kind]) return propCache[kind];
    const g = new THREE.Group();
    const E = (c) => ({ emissive: c });
    switch (kind) {
      case 'rocket': { box(g, 1.6, 4, 1.6, 0xeeeeee, 0, 2.5, 0); const n = new THREE.Mesh(new THREE.ConeGeometry(.95, 1.8, 10), mat(0xdd3322)); n.position.y = 5.4; g.add(n); box(g, .4, 1.8, 3, 0xdd3322, 0, 1, 0); box(g, 3, 1.8, .4, 0xdd3322, 0, 1, 0); box(g, .8, .8, .1, 0x66ccff, 0, 3.4, .85, E(0x225577)); g.userData.flame = box(g, .9, 1.6, .9, 0xff9922, 0, -.6, 0, E(0xff6600)); break; }
      case 'pizza': { const d = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, .4, 24), mat(0xf4b942)); d.rotation.x = Math.PI / 2; d.position.y = 3.4; g.add(d); for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, .1, 10), mat(0xcc2222)); p.rotation.x = Math.PI / 2; p.position.set(Math.cos(i * 2.4) * 1.3, 3.4 + Math.sin(i * 2.4) * 1.3, .25); g.add(p); } g.userData.spin = 'z'; break; }
      case 'coins': { for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .14, 14), mat(0xffd54f, E(0x886600))); c.position.set((i % 6 - 2.5) * .8 + (i % 2) * .2, .1 + Math.floor(i / 6) * .22, (Math.floor(i / 6) - 2) * .7); c.rotation.z = Math.random() * .6; g.add(c); } break; }
      case 'car': { box(g, 4.2, .9, 2, 0xe53935, 0, .9, 0); box(g, 2.2, .8, 1.8, 0xe53935, -.2, 1.7, 0); box(g, 1.0, .6, 1.85, 0x88ccee, .5, 1.7, 0); [[-1.3, 1], [1.3, 1], [-1.3, -1], [1.3, -1]].forEach(([x, z]) => box(g, .8, .8, .4, 0x222222, x, .4, z * 1.0)); break; }
      case 'house': { box(g, 6, 3.6, 5, 0xd7b98e, 0, 1.8, 0); const r = new THREE.Mesh(new THREE.ConeGeometry(4.6, 2.4, 4), mat(0xb23b2e)); r.rotation.y = Math.PI / 4; r.position.y = 4.8; g.add(r); box(g, 1, 2, .2, 0x5d4037, 0, 1, 2.55); box(g, 1, 1, .2, 0xffee99, -2, 2.2, 2.55, E(0x998833)); box(g, 1, 1, .2, 0xffee99, 2, 2.2, 2.55, E(0x998833)); break; }
      case 'wall': { for (let y = 0; y < 5; y++) for (let x = -5; x <= 5; x++) box(g, 1.9, .9, 1, ((x + y) % 2) ? 0x9e5b45 : 0xb36b50, x * 2 + (y % 2), .45 + y, 0); break; }
      case 'tree': { box(g, 1, 4, 1, 0x6d4c41, 0, 2, 0); box(g, 4.4, 3.4, 4.4, 0x2e7d32, 0, 5.4, 0); box(g, 3, 2.4, 3, 0x388e3c, 0, 7.6, 0); break; }
      case 'portal': { const t = new THREE.Mesh(new THREE.TorusGeometry(2.6, .35, 10, 32), mat(0x66ddff, E(0x2288aa))); t.position.y = 3.2; g.add(t); const d = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), new THREE.MeshBasicMaterial({ color: 0x99ffff, transparent: true, opacity: .35 })); d.position.y = 3.2; g.add(d); g.userData.spin = 'portal'; break; }
      case 'moon': { const m = new THREE.Mesh(new THREE.SphereGeometry(3, 18, 12), mat(0xfffbe0, E(0xaaa070))); m.position.set(0, 14, 0); g.add(m); break; }
      case 'sun': { const m = new THREE.Mesh(new THREE.SphereGeometry(3.2, 18, 12), mat(0xffee66, E(0xaa8800))); m.position.set(0, 14, 0); g.add(m); break; }
      case 'trophy': { const c = new THREE.Mesh(new THREE.CylinderGeometry(1.5, .8, 2, 14), mat(0xffd54f, E(0x886600))); c.position.y = 3.6; g.add(c); box(g, .4, 1.2, .4, 0xffd54f, 0, 2.2, 0, E(0x886600)); box(g, 2, .4, 2, 0xffd54f, 0, 1.4, 0, E(0x886600)); box(g, 2.6, .9, 2.6, 0x6d4c41, 0, .45, 0); g.userData.spin = 'y'; break; }
      case 'book': { box(g, 3.6, .5, 2.6, 0x6a1b9a, 0, 1.2, 0); box(g, 3.4, .35, 2.4, 0xfffde7, 0, 1.55, 0); g.userData.spin = 'y'; break; }
      case 'fire': { for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(.7 - i * .06, 2.2 + (i % 2), 6), mat(i % 2 ? 0xff5522 : 0xffaa22, E(0x883300))); c.position.set((i - 2) * .6, 1.1, (i % 2) * .4); g.add(c); } g.userData.flicker = true; break; }
      case 'lantern': { box(g, .12, 4, .12, 0x333333, 0, 2, 0); box(g, .9, 1.1, .9, 0xffee99, 0, 4.4, 0, E(0xbb9933)); box(g, 1.1, .2, 1.1, 0x333333, 0, 5.05, 0); break; }
      case 'heart': { for (let i = 0; i < 6; i++) { const h = new THREE.Group(); [-.3, .3].forEach(x => { const s = new THREE.Mesh(new THREE.SphereGeometry(.38, 10, 8), mat(0xff4081, E(0x661133))); s.position.set(x, .2, 0); h.add(s); }); const c = new THREE.Mesh(new THREE.ConeGeometry(.62, .9, 4), mat(0xff4081, E(0x661133))); c.rotation.z = Math.PI; c.position.y = -.3; h.add(c); h.position.set((i - 2.5) * 1.6, 5 + (i % 3), -2 - (i % 2)); g.add(h); } g.userData.float = true; break; }
      case 'bolt': { for (let i = 0; i < 4; i++) box(g, .4, 3, .4, 0xffee33, (i % 2 ? .8 : -.8), 11 - i * 2.6, -3, E(0xffcc00)).rotation.z = (i % 2 ? .5 : -.5); g.userData.flicker = true; break; }
      case 'shield': { box(g, 2.6, 3.2, .4, 0x1e63c9, 0, 3.2, 0); box(g, 1.2, 1.6, .5, 0xffd54f, 0, 3.2, 0, E(0x665500)); g.userData.spin = 'y'; break; }
    }
    g.visible = false; SC.add(g); propCache[kind] = g; return g;
  }
  const PROPS = [
    [/rocket|spaceship|mothership|fleet|launch|warp|blast off|engines?\b/i, 'rocket'], [/pizza|cheese|calzone|pepperoni|slice/i, 'pizza'],
    [/\$|money|coins?\b|s\.i\.p|treasure|bank|rich|gold|paid|salary|market/i, 'coins'], [/\bcars?\b|racing|race\b|kart|truck|\bbus\b|grand prix|track\b|engine/i, 'car'],
    [/house|home\b|cabin|roof|doorstep|\broom\b|build/i, 'house'], [/\bwall\b|\bgate\b|fence|prison|bars\b|cell\b/i, 'wall'], [/\btree\b|forest|\boak\b|woods/i, 'tree'],
    [/clock|time\b|portal|future|machine|yesterday|tomorrow/i, 'portal'], [/moon|midnight|2am|nighttime|night\b/i, 'moon'], [/\bsun\b|sunrise|dawn|morning|daylight/i, 'sun'],
    [/trophy|champion|medal|winner|tournament|games\b|cup\b/i, 'trophy'], [/\bbook\b|almanac|\bmap\b|letter|page\b|chapter/i, 'book'], [/\bfire\b|flame|burn|torch|candle/i, 'fire'],
    [/lantern|\blamp\b|glow|flashlight/i, 'lantern'], [/heart|love\b|wedding|romance|kiss/i, 'heart'], [/storm|lightning|thunder|\bbolt\b|wrath|zap|power/i, 'bolt'], [/badge|shield|protect|defend|guard\b/i, 'shield'],
  ];
  function propFor(text) { for (const [re, k] of PROPS) if (re.test(text)) return k; return null; }

  // ---------- who plays whom: the movie's own two main characters (from its picture settings) played by Explox people ----------
  const FN_KIND = () => {
    const m = new Map(), add = (n, k) => { try { const f = (0, eval)('typeof ' + n + " === 'function' ? " + n + ' : null'); if (f) m.set(f, k); } catch (e) { } };
    [['_cRobot', 'robot'], ['_cDino', 'dino'], ['_cGrandma', 'grandma'], ['_cNinja', 'ninja'], ['_cCat', 'cat'], ['_cPizza', 'pizza'], ['_cDetective', 'detective'], ['_cAlien', 'alien'], ['_cDragon', 'dragon'],
      ['_cRocket', 'pilot'], ['_cCar', 'racer'], ['_cKiller', 'ninja'], ['_cDoc', 'doctor'], ['_cMason', 'pioneer'], ['_cSettler', 'pioneer'], ['_cOak', 'hero'], ['_cLantern', 'wizard'], ['_cCabin', 'pioneer'], ['_cJake', 'athlete']].forEach(([n, k]) => add(n, k));
    return m;
  };
  let fnKind = null;
  const KIND_WORDS = { robot: /robo|robot|android|\bbot\b|mecha/i, dino: /dino|rex\b|reptile/i, ninja: /ninja|shadow|clan|sensei/i, grandma: /grandma|granny|nana/i, cat: /\bcat\b|kitty|feline/i, pizza: /pizza|calzone|pepperoni/i,
    detective: /detective|inspector|clue|sleuth/i, ghost: /ghost|spirit|phantom/i, alien: /alien|martian|visitor/i, dragon: /dragon/i, racer: /racer|driver|racing/i, pilot: /pilot|rocket|captain/i, king: /king|queen|mayor|crown|royal/i,
    doctor: /doctor|nurse|medic/i, athlete: /athlete|player|champion|team/i, wizard: /wizard|magic|time traveler/i };
  function mainKinds(mi, mv) {
    if (!fnKind) fnKind = FN_KIND();
    const vis = (typeof _MVIS !== 'undefined') ? _MVIS[mi] : null; const tags = tagsFor(mv);
    const a = (vis && fnKind.get(vis[3])) || tags[0] || 'hero', b = (vis && fnKind.get(vis[4])) || tags[1] || 'robot';
    return [a, b === a ? (tags.find(t => t !== a) || 'hero') : b, tags.find(t => t !== a && t !== b) || 'hero'];
  }

  // ---------- reading a scene's caption ----------
  const sceneInfoCache = {};
  function verbStyle(t, mi, si) {
    if (/fight|battle|attack|punch|kick|strike|clash|duel|defend|brawl|war\b|fist/.test(t)) return 'fight';
    if (/\b(run|runs|running|ran|race|races|racing|chase|chases|chasing|escape|escapes|rush|rushes|flee|flees|fleeing|sprint|sprints|speed|speeds)\b/.test(t)) return 'run';
    if (/\b(launch|launches|launched|fly|flies|flying|flight|soar|soars|wings|take off|takes off|orbit|orbits|warp|cruise|cruising)\b/.test(t)) return 'fly';
    if (/dance|party|celebrat|cheer|victory|win\b|wins\b|festival|hooray|finally|parade|laugh|joke/.test(t)) return 'party';
    if (/sneak|creep|tiptoe|secret|hid\b|hide|hiding|silent|quiet|search|investigat|follow/.test(t)) return 'sneak';
    if (/scream|panic|afraid|scared|terrified|horror|run for|trembl/.test(t)) return 'panic';
    if (/scan|look|watch|spot|notice|stare|gaze|horizon|wonder|realiz|discover|find|found/.test(t)) return 'look';
    if (/build|hammer|raise|rises|construct|work|craft|cook|bake|fix|repair/.test(t)) return 'work';
    if (/walk|march|travel|journey|arrive|head to|heads to|steps|stroll|enter|leav|return|wander/.test(t)) return 'walk';
    if (/meet|talk|say|says|ask|speak|tell|warn|call|plan|council|decid|learn|teach|train|whisper|shout|speech|announce|promise|\"/.test(t)) return 'talk';
    return ['talk', 'look', 'walk'][hash(mi, si, 4) % 3];
  }
  function getInfo(mi, si, mv, sc) {
    const key = mi + '_' + si; if (sceneInfoCache[key]) return sceneInfoCache[key];
    const text = (sc.text || ''), lc = text.toLowerCase(), [ka, kb, kc] = mainKinds(mi, mv);
    const bWords = (typeof _MCHARS !== 'undefined' && _MCHARS[mi]) ? _MCHARS[mi] : [];
    const mentionB = bWords.some(k => (' ' + lc + ' ').indexOf(k) !== -1) || (KIND_WORDS[kb] && KIND_WORDS[kb].test(lc));
    const mentionA = (KIND_WORDS[ka] && KIND_WORDS[ka].test(lc)) || /\bhero|captain|\bhe\b|\bshe\b|\bwe\b|\bi\b|\bour\b/.test(lc);
    const style = verbStyle(lc, mi, si);
    const present = [];
    if (!(mentionB && !mentionA && style !== 'fight' && style !== 'talk')) present.push('A');
    if (mentionB || ['fight', 'run', 'talk', 'party'].indexOf(style) >= 0) present.push('B');
    if (style === 'party' || /sidekick|friend|team|together|\bthey\b|\ball\b|family|everyone|both/.test(lc)) present.push('C');
    if (!present.length) present.push('A');
    const groupRe = /army|fleet|soldiers|troops|villagers|townsfolk|\btown\b|everyone|citizens|clan|ninjas|guards|\bteam\b|family|friends|students|crew|warriors|settlers|neighbou?rs|dinos\b|robots\b|aliens\b|pizzas\b/;
    const g = groupRe.exec(lc); const big = /army|fleet|clan|students|troops|\btown\b|everyone/.test(lc);
    const extraKind = mentionB ? kb : ka;
    const comedy = /comedy|family|slice|friendship/i.test(mv.genre) || /pizza|grandma|cat|alien/i.test(mv.title);
    const spaceRe = /space|planet|galaxy|rocket|orbit|star\b|stars\b|asteroid|moon base|mothership|warp/, natureRe = /forest|woods|field|farm|mountain|river|lake|valley|garden|island|ocean|sea\b|beach|sky\b|cloud|cabin|meadow|wings/, cityRe = /city|street|town|market|shop|store|bank|building|house|school|academy|stadium|road|track|alley|roof/;
    let kind = spaceRe.test(lc) ? 'space' : natureRe.test(lc) ? 'nature' : cityRe.test(lc) ? 'city' : kindFor(mv, mi, '');
    const dark = /night|dark|shadow|ghost|mystery|midnight|2am|secret|cave|storm|villain|fear|silent|empty|nobody|lost|missing|danger|trap|alone|war\b/.test(lc);
    const info = { text, style, present, extraN: g ? (big ? 6 : 4) : 0, extraKind, kinds: { A: ka, B: kb, C: kc }, prop: propFor(lc), kind, dark, comedy, surprise: /[!?]/.test(text) };
    sceneInfoCache[key] = info; return info;
  }

  // ---------- cast: the movie's characters are played by Explox people ----------
  const people = {};     // cache of built people by key
  function npcPool() {
    const defs = (typeof NPC_DEFS !== 'undefined' ? NPC_DEFS : []).filter(d => d && ['Citizen', 'Shopkeeper', 'Waiter', 'Officer', 'Foreman', 'Jogger', 'Tourist', 'Vendor'].indexOf(d.role) >= 0);
    return defs.length ? defs : [{ name: 'Sam', skin: 0xf5c89a, shirt: 0x2255aa, pants: 0x333344, hair: 'short', hairColor: 0x2a1505 }, { name: 'Mia', skin: 0xd4956a, shirt: 0x1166bb, pants: 0x222233, hair: 'long', hairColor: 0x1a1a1a }];
  }
  const SIPDEFS = [
    { name: 'Cubby', skin: 0xffcc80, shirt: 0xef5350, pants: 0x37474f, hair: 'short', hairColor: 0x212121, hat: 'chef' },
    { name: 'Hubby', skin: 0xffcc80, shirt: 0x1e88e5, pants: 0x37474f, hair: 'short', hairColor: 0x5d4037, hat: 'cap', hatColor: 0xe53935 },
    { name: 'Gernaldst', skin: 0xffcc80, shirt: 0xfdd835, pants: 0x37474f, hair: 'short', hairColor: 0x5d4037, hat: 'duck' }];
  function personFor(key, def, kind, label, role) {
    if (people[key]) return people[key];
    const p = buildPerson(def, { name: label || def.name, role: role, hat: kind && kind !== 'hero' ? null : def.hat, hatColor: def.hatColor, noTag: !label });
    p.costume = kind; if (kind) costume(p, kind); p.g.visible = false; p.g.scale.setScalar(1.45); SC.add(p.g); people[key] = p; return p;
  }
  const STOPW = new Set(['The', 'A', 'An', 'In', 'On', 'At', 'But', 'And', 'With', 'Then', 'Now', 'They', 'He', 'She', 'It', 'We', 'This', 'That', 'Every', 'Meanwhile', 'Suddenly', 'Soon', 'Later', 'Finally', 'Once', 'One', 'Two', 'Three', 'Our', 'His', 'Her', 'Their', 'If', 'When', 'As', 'After', 'Before', 'Behind', 'Deep', 'Far', 'Long', 'Back', 'Not', 'No', 'Yes', 'Who', 'What', 'Where', 'Why', 'How', 'All', 'Some', 'Even', 'Just', 'Still', 'Only', 'Explox', 'City', 'Night', 'Day', 'Time', 'Life', 'Citizens', 'Everyone', 'Inside', 'Outside', 'Together', 'Somewhere', 'Nobody', 'Someone', 'Welcome', 'Today', 'Tonight', 'Tomorrow', 'Yesterday']);
  const FALLBACK_ROLE = { robot: 'Robo', dino: 'Dino', ninja: 'Ninja', grandma: 'Grandma', cat: 'Super Cat', pizza: 'Evil Pizza', detective: 'The Detective', ghost: 'The Ghost', alien: 'The Alien', dragon: 'The Dragon', racer: 'The Racer', pilot: 'The Pilot', king: 'The King', doctor: 'The Doctor', athlete: 'The Champion', pioneer: 'The Pioneer', wizard: 'The Wizard', hero: 'The Hero' };
  const castCache = {};
  function castRoles(mi, mv) {
    if (castCache[mi]) return castCache[mi];
    const counts = {};
    (mv.scenes || []).forEach(sc => {
      const found = (sc.text || '').match(/\b[A-Z][a-z]+(?:-[A-Z][a-z]+)*(?: [A-Z][a-z]+(?:-[A-Z][a-z]+)*)*/g) || [];
      found.forEach(m => { let n = m.split(' '); while (n.length && STOPW.has(n[0])) n.shift(); n = n.join(' '); if (n.length < 3) return; if (n.indexOf(' ') < 0 && n.indexOf('-') < 0 && /s$/.test(n)) return; counts[n] = (counts[n] || 0) + 1; });
    });
    const cands = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || b.length - a.length);
    const kinds = mainKinds(mi, mv), used = new Set(), stars = (typeof NPC_DEFS !== 'undefined' ? NPC_DEFS : []).filter(d => d && d.role === 'Celebrity');
    // only things that sound like a character (not a place, an object or a group)
    const BADW = /\b(Bank|Church|Library|Event|Racing|Clue|Academy|Market|School|Square|Tower|City|Hall|Court|Wall|House|Road|Street|Park|Arena|Games|War|Supper|Rise|Mission|Chapter|Scene|Planet|Galaxy|Space|Station|Ship|Race|Grand|Prix|Fist|Clan|Army|Fleet|Council|Team|Crew|Gang|Squad|Badge|Coin|Wrath|Mayor's|Pizza Shop|Satan|Devil|Demon|Trial|Scrapyard|Mall)\b/;
    const person = (c) => !BADW.test(c) && (/^(Captain|Detective|Doctor|Dr|Mayor|King|Queen|Sensei|Super|Mr|Mrs|Miss|Professor|Officer|Chief|Coach|Lord|Lady|Sir|General|Major|Evil|Dino|Robo|Grandma|Ghost|Baby)\b/.test(c) || c.indexOf('-') >= 0 || (c.indexOf(' ') < 0 && counts[c] >= 3));
    const good = cands.filter(person);
    const roles = kinds.map((k, i) => {
      const re = KIND_WORDS[k]; let name = (i < 2) ? (good.find(c => !used.has(c) && re && re.test(c)) || good.find(c => !used.has(c) && counts[c] >= 2)) : null;
      if (!name) name = (i === 2 && k === 'hero') ? 'The Sidekick' : (FALLBACK_ROLE[k] || 'The Hero'); used.add(name);
      return { role: name, kind: k };
    });
    castCache[mi] = roles; return roles;
  }
  function castList(mi, mv) {
    const roles = castRoles(mi, mv), stars = (typeof NPC_DEFS !== 'undefined' ? NPC_DEFS : []).filter(d => d && d.role === 'Celebrity');
    return roles.map((r, i) => ({ actor: stars.length ? stars[(i + mi) % stars.length].name : 'Explox Star', role: r.role, kind: r.kind }));
  }
  function actorsFor(mi, mv, info) {
    const stars = (typeof NPC_DEFS !== 'undefined' ? NPC_DEFS : []).filter(d => d && d.role === 'Celebrity');
    const star = (i) => stars.length ? stars[(i + mi) % stars.length] : npcPool()[i % npcPool().length];
    const out = [];
    const cl = castList(mi, mv);
    info.present.forEach((who, idx) => {
      const i = ['A', 'B', 'C'].indexOf(who), kind = info.kinds[who];
      out.push(personFor('m' + mi + who, star(i), kind, '\u2605 ' + star(i).name, cl[i].role));
    });
    return out;
  }
  function extrasFor(mi, info, n) {
    const pool = SIPDEFS.concat(npcPool()), out = [];
    for (let i = 0; i < n; i++) { const def = pool[(i + hash(mi, 5, 1)) % pool.length]; out.push(personFor('x' + info.extraKind + '_' + i + '_' + (def.name), def, info.extraKind, null)); }
    return out;
  }

  // ---------- animation helpers ----------
  function clearFx() { while (fxGroup.children.length) { const c = fxGroup.children.pop(); if (c.geometry) c.geometry.dispose(); } }
  function stars(y, t, n, at) {
    for (let i = 0; i < n; i++) { const a = t * 6 + i * 6.283 / n; const s = new THREE.Mesh(new THREE.OctahedronGeometry(.2), new THREE.MeshBasicMaterial({ color: 0xffee33 })); s.position.set(at.x + Math.cos(a) * 1.0, y, at.z + Math.sin(a) * 1.0); fxGroup.add(s); }
  }
  function confetti(t, n) {
    for (let i = 0; i < n; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(.25, .06, .25), new THREE.MeshBasicMaterial({ color: [0xff3366, 0xffcc00, 0x33ddff, 0x66ff66, 0xcc66ff][i % 5] }));
      const sd = (i * 97) % 13, fall = ((t * (1.5 + (i % 5) * .3) + sd * .37) % 5);
      c.position.set(((i * 0.618) % 1 - .5) * 20, 9 - fall * 2.2, (((i * 0.382) % 1) - .5) * 12); c.rotation.set(t * 3 + i, t * 2, i); fxGroup.add(c);
    }
  }
  function limbs(p, a, b, c, d) { p.armL.rotation.x = a; p.armR.rotation.x = b; p.legL.rotation.x = c; p.legR.rotation.x = d; }
  function pose(p) { p.g.rotation.set(0, p.g.rotation.y, 0); p.body.rotation.set(0, 0, 0); p.body.position.set(0, 0, 0); p.head.rotation.set(0, 0, 0); p.head.scale.setScalar(p.costume === 'alien' ? 1.25 : 1); limbs(p, 0, 0, 0, 0); p.armL.rotation.z = 0; p.armR.rotation.z = 0; p.mouth.scale.set(1, 1, 1); p.g.position.y = 0; }
  function walk(p, t, sp, big) { const s = Math.sin(t * sp) * (big || .8); limbs(p, -s, s, s, -s); p.body.position.y = Math.abs(Math.sin(t * sp)) * .12; }
  function words2d(t0, text, i) { words.push({ t0, text, i }); }
  let shown = [], curActors = [], curInfoNow = null;

  // ---------- the director: puts the right characters in the right place doing what the caption says ----------
  function direct(mi, si, mv, sc, t) {
    const info = getInfo(mi, si, mv, sc), dur = sc.dur || 5, u = clamp(t / dur, 0, 1);
    shown.forEach(p => { p.g.visible = false; }); shown = []; clearFx(); words = [];
    Object.keys(propCache).forEach(k => { propCache[k].visible = false; });
    const act = actorsFor(mi, mv, info), ex = info.extraN ? extrasFor(mi, info, info.extraN) : [];
    act.concat(ex).forEach(p => { pose(p); p.g.visible = true; shown.push(p); });
    const a0 = act[0], a1 = act[1], a2 = act[2], style = info.style; curActors = act; curInfoNow = info;
    const face = (p, ang) => { p.g.rotation.y = ang; };
    const look = new THREE.Vector3(0, 2.6, 0); let shake = 0, spread = 4;
    const prop = info.prop ? makeProp(info.prop) : null;
    if (prop) {
      prop.visible = true; prop.rotation.set(0, 0, 0); prop.scale.setScalar(1); const k = info.prop;
      if (k === 'moon' || k === 'sun') prop.position.set(-14, 0, -30);
      else if (k === 'wall') { prop.position.set(0, 0, -7); }
      else if (k === 'house') prop.position.set(8, 0, -6);
      else if (k === 'tree') prop.position.set(-9, 0, -5);
      else if (k === 'rocket') { prop.position.set(9, style === 'fly' ? u * 3 : 0, -4); }
      else if (k === 'coins') prop.position.set(-3.6, 0, 3);
      else if (k === 'car') prop.position.set(-8, 0, -3);
      else if (k === 'heart' || k === 'bolt') prop.position.set(0, 0, 0);
      else prop.position.set(7.5, 0, -2.5);
      if (prop.userData.spin === 'y') prop.rotation.y = t * 1.2; if (prop.userData.spin === 'z') prop.rotation.z = t * .8; if (prop.userData.spin === 'portal') prop.rotation.y = t * .7;
      if (prop.userData.flame) prop.userData.flame.scale.y = .8 + Math.abs(Math.sin(t * 25)) * .9;
      if (prop.userData.flicker) prop.scale.setScalar(.95 + Math.abs(Math.sin(t * 17)) * .15);
      if (prop.userData.float) prop.position.y = Math.sin(t * 2) * .5 + 1;
    }
    if (style === 'walk') {
      const x0 = -11 + t * 2.7;
      act.forEach((p, i) => { p.g.position.set(x0 + i * 3 - 1.5, 0, (i - (act.length - 1) / 2) * 1.8); face(p, Math.PI / 2); walk(p, t + i, 7); });
      ex.forEach((p, i) => { p.g.position.set(x0 - 4 - Math.floor(i / 2) * 2.6, 0, (i % 2 ? 2.6 : -2.6)); face(p, Math.PI / 2); walk(p, t + i * .4, 7); });
      look.set(x0, 2.5, 0); spread = 6;
    } else if (style === 'run') {
      const R0 = 7.5, w = t * 1.2; act.forEach((p, i) => { const a = w - i * 1.05; p.g.position.set(Math.cos(a) * R0, 0, Math.sin(a) * R0 * .6); face(p, -a); walk(p, t + i, 12, 1.1); p.body.rotation.x = .25; });
      ex.forEach((p, i) => { const a = w - 2.4 - i * .45; p.g.position.set(Math.cos(a) * R0, 0, Math.sin(a) * R0 * .6); face(p, -a); walk(p, t + i, 12, 1.1); p.body.rotation.x = .25; });
      if (info.comedy && a0) { const sT = dur * .55; if (t > sT && t < sT + 1.1) { const q = (t - sT) / 1.1; a0.body.rotation.x = -q * 6.283; a0.body.position.y = Math.sin(q * 3.14) * 2.2; limbs(a0, 2.5, 2.5, 1, -1); words2d(sT, 'WHOA!', 2); } }
      look.copy(a0.g.position).setY(2.4); spread = 9;
    } else if (style === 'fight') {
      const A = a0, B = a1 || ex[0];
      if (B && !a1) { B.g.visible = true; }
      A.g.position.set(-2.6 + Math.sin(t * 2) * .4, 0, 0); B.g.position.set(2.6 - Math.sin(t * 2) * .4, 0, 0); face(A, Math.PI / 2); face(B, -Math.PI / 2);
      const ph = t * 5; limbs(A, -1.5 + Math.sin(ph) * 1.6, -1.5 - Math.sin(ph) * 1.6, Math.sin(ph) * .3, -Math.sin(ph) * .3); limbs(B, -1.5 - Math.sin(ph + 1.7) * 1.6, -1.5 + Math.sin(ph + 1.7) * 1.6, 0, 0);
      if (a2) { a2.g.position.set(-6, 0, 3); face(a2, Math.PI / 3); limbs(a2, Math.sin(t * 7) * 2.4, -Math.sin(t * 7) * 2.4, 0, 0); }
      let n = 0; ex.forEach((p, i) => { if (p === B) return; const left = (i % 2 === 0); p.g.position.set((left ? -1 : 1) * (6 + Math.floor(n / 2) * 2.4), 0, (left ? 1 : -1) * 3); face(p, left ? Math.PI / 2 : -Math.PI / 2); limbs(p, -1.5 + Math.sin(t * 5 + i) * 1.4, -1.5 - Math.sin(t * 5 + i) * 1.4, 0, 0); n++; });
      const bt = Math.floor(t / .9), ph2 = t % .9;
      if (ph2 < .35) { stars(4.1, t, 5, B.g.position); words2d(bt * .9, ['BONK!', 'POW!', 'SPLAT!', 'KAPOW!'][bt % 4], 3); B.body.rotation.z = Math.sin(ph2 * 18) * .25; B.mouth.scale.set(.5, 3, 1); shake = .3; }
      look.set(0, 2.6, 0); spread = 6;
    } else if (style === 'party') {
      const all = act.concat(ex); all.forEach((p, i) => { const a = i * 6.283 / all.length + t * .5; p.g.position.set(Math.cos(a) * 4.4, Math.abs(Math.sin(t * 5 + i)) * 1.1, Math.sin(a) * 3.6); face(p, -a + Math.PI); limbs(p, 2.8 + Math.sin(t * 9 + i) * .6, 2.8 - Math.sin(t * 9 + i) * .6, Math.sin(t * 9 + i) * .6, -Math.sin(t * 9 + i) * .6); p.body.rotation.y = Math.sin(t * 4 + i) * .5; p.mouth.scale.set(1.2, 2.2, 1); });
      confetti(t, 90); look.set(0, 2.2, 0); spread = 6;
    } else if (style === 'fly') {
      const all = act.concat(ex); all.forEach((p, i) => { p.g.position.set((i - (all.length - 1) / 2) * 2.6 + Math.sin(t + i) * .5, 5 + Math.sin(t * 2 + i) * .5, -(i % 2) * 2); face(p, 0); p.g.rotation.x = -1.35; limbs(p, 2.9, 2.9, .1, -.1); });
      if (stage) stage.position.z = (t * 26) % 40;
      look.set(0, 5, 0); spread = 7;
    } else if (style === 'sneak') {
      act.forEach((p, i) => { p.g.position.set(-8 + ((t * 1.1 + i * 2.6) % 18), 0, -1 + Math.sin(i + t) * 1.2); face(p, Math.PI / 2); walk(p, t * .7 + i, 5, .5); p.body.rotation.x = .35; p.head.rotation.y = Math.sin(t * 2 + i) * .8; p.mouth.scale.set(.4, .6, 1); });
      ex.forEach((p, i) => { p.g.position.set(-12 + ((t * 1.1 + i * 2.2) % 22), 0, 2.6 - (i % 2) * 5); face(p, Math.PI / 2); walk(p, t * .7 + i, 5, .5); p.body.rotation.x = .35; });
      look.set(act[0].g.position.x, 2.2, 0); spread = 8;
    } else if (style === 'panic') {
      act.concat(ex).forEach((p, i) => { const a = t * 3 + i * 1.7; p.g.position.set(Math.cos(a) * 2.6 + (i - 1) * 2, 0, Math.sin(a) * 1.8); face(p, -a); limbs(p, 2.6 + Math.sin(t * 14 + i) * .7, 2.6 - Math.sin(t * 14 + i) * .7, Math.sin(t * 12 + i) * 1, -Math.sin(t * 12 + i) * 1); p.mouth.scale.set(1.3, 3.4, 1); p.head.rotation.z = Math.sin(t * 10 + i) * .2; p.g.position.y = Math.abs(Math.sin(t * 7 + i)) * .5; });
      shake = .15; look.set(0, 2.4, 0); spread = 5;
    } else if (style === 'look') {
      act.forEach((p, i) => { p.g.position.set((i - (act.length - 1) / 2) * 3.4, 0, 0); face(p, Math.sin(t * .6 + i) * .8); p.head.rotation.y = Math.sin(t * 1.4 + i) * .9; p.armR.rotation.x = 2.4; p.armR.rotation.z = -.2; p.body.position.y = Math.sin(t * 2 + i) * .05; });
      ex.forEach((p, i) => { p.g.position.set((i - (ex.length - 1) / 2) * 2.6, 0, -3.6); face(p, 0); p.head.rotation.y = Math.sin(t * 1.4 + i) * .9; });
      look.set(0, 2.6, 0); spread = 4;
    } else if (style === 'work') {
      act.forEach((p, i) => { p.g.position.set((i - (act.length - 1) / 2) * 3.4 - 1, 0, 1); face(p, -.3); p.armR.rotation.x = -1.4 + Math.sin(t * 8 + i) * 1.2; p.armL.rotation.x = -.6; p.body.rotation.x = .15; });
      ex.forEach((p, i) => { p.g.position.set(-5 + i * 2.4, 0, -2.6); face(p, 0); p.armR.rotation.x = -1.4 + Math.sin(t * 8 + i) * 1.2; });
      look.set(0, 2.4, 0); spread = 5;
    } else {  // talk
      act.forEach((p, i) => {
        const side = act.length === 1 ? 0 : (i === 0 ? -1 : 1) * 2.2 + (i === 2 ? 2.4 : 0); p.g.position.set(side, 0, i === 2 ? 1.5 : 0); face(p, act.length === 1 ? .35 : (i === 1 ? -Math.PI / 2 + .5 : Math.PI / 2 - .5));
        const speaking = Math.floor(t / 1.6 + i) % act.length === i || act.length === 1;
        limbs(p, speaking ? 1.8 + Math.sin(t * 7 + i) * .6 : 0, speaking ? -.3 : 0, 0, 0); p.head.rotation.y = Math.sin(t * 1.5 + i) * .25; p.mouth.scale.set(1, speaking ? 1.4 + Math.abs(Math.sin(t * 12 + i)) * 2.4 : 1, 1);
      });
      ex.forEach((p, i) => { p.g.position.set((i - (ex.length - 1) / 2) * 2.4, 0, -3.8); face(p, 0); p.head.rotation.y = Math.sin(t * 1.3 + i) * .3; });
      if (info.comedy && info.surprise && u > .55 && u < .8 && a1) { a1.head.scale.setScalar(1.7); words2d(.55 * dur, 'WHAT?!', 6); }
      look.set(0, 2.4, 0); spread = 4.5;
    }
    act.concat(ex).forEach(c => { if (c.costume === 'ghost') c.g.position.y += .6 + Math.sin(t * 3) * .3; if (c.extras.wings) { const f = Math.sin(t * 7) * .5; c.extras.wings[0].rotation.z = f; c.extras.wings[1].rotation.z = -f; } });
    // camera: close enough to see the actors, moving in a different way for each scene
    const camStyle = ['orbit', 'dolly', 'crane', 'side'][hash(mi, si, 9) % 4], seed = hash(mi, si, 2) % 628 / 100, D = clamp(7 + spread * .9, 9, 17);
    if (camStyle === 'orbit') { const a = seed + t * .3; CAM.position.set(look.x + Math.cos(a) * D * .8, 4.2, look.z + Math.sin(a) * D * .8 + D * .4); }
    else if (camStyle === 'dolly') { CAM.position.set(look.x + Math.sin(seed) * 4, 3.2 + u * .8, look.z + D * 1.15 - u * D * .5); }
    else if (camStyle === 'crane') { CAM.position.set(look.x - 6, 1.6 + u * 7, look.z + D * .9 - u * 2); }
    else { CAM.position.set(look.x + 2, 3.4, look.z + D); }
    if (shake) CAM.position.add(new THREE.Vector3((Math.random() - .5) * shake, (Math.random() - .5) * shake, 0));
    CAM.lookAt(look); rim.position.set(look.x - 8, 6, look.z + 4);
    return info;
  }

  // ---------- sets: each of the three is built once and shown or hidden ----------
  const stages = {};
  // ---------- public entry: replaces each scene's 2D drawing ----------
  function draw3D(mi, si, mv, sc, ctx, w, h, t) {
    const rd = renderer(w, h); if (!rd) return false;
    try {
      const vis = (typeof _MVIS !== 'undefined' && _MVIS[mi]) ? _MVIS[mi] : null;
      const info = getInfo(mi, si, mv, sc);
      const accent = vis ? hexOf(vis[2]) : 0xff7733, skyTop = vis ? hexOf(vis[0]) : hexOf(mv.bg), skyMid = vis ? hexOf(vis[1]) : hexOf(mv.bg);
      Object.keys(stages).forEach(k => { stages[k].visible = (k === info.kind); });
      if (!stages[info.kind]) { stages[info.kind] = buildStage(info.kind, 0xff7733, skyTop, hash(7, info.kind.length, 1)); SC.add(stages[info.kind]); }
      stage = stages[info.kind]; stage.visible = true; if (info.style !== 'fly') stage.position.z = 0;
      const dark = info.dark || info.kind === 'space';
      const bg = info.kind === 'space' ? 0x05071a : info.dark ? (info.kind === 'nature' ? 0x16253a : 0x0e1424) : info.kind === 'nature' ? 0x7ec8ff : 0x1f2a44;
      SC.background = new THREE.Color(bg); SC.fog = new THREE.Fog(bg, 38, 120);
      hemi.color.setHex(dark ? 0x7788bb : 0xffffff); hemi.groundColor.setHex(skyMid); hemi.intensity = dark ? .55 : 1.0;
      sun.color.setHex(dark ? 0x99aaff : 0xfff2cc); sun.intensity = dark ? .6 : 1.0; rim.color.setHex(accent); rim.intensity = info.dark ? 1.5 : 1.0;
      stage.children.forEach(c => { if (c.userData && c.userData.spin) { c.rotation.x = t * c.userData.spin; c.rotation.y = t * c.userData.spin * .7; } });
      direct(mi, si, mv, sc, t);
      rd.render(SC, CAM);
      ctx.drawImage(rd.domElement, 0, 0, w, h);
      words.forEach(wd => {
        const age = t - wd.t0, a = clamp(1 - age * .6, 0, 1); if (age < 0 || a <= 0) return;
        ctx.save(); ctx.translate(w * (.28 + (wd.i * .13) % .5), h * (.3 + (wd.i * .09) % .18)); ctx.rotate(((wd.i % 3) - 1) * .18); ctx.scale(1 + Math.min(age, .25) * 2, 1 + Math.min(age, .25) * 2);
        ctx.globalAlpha = a; ctx.font = `900 ${Math.round(h * .085)}px Arial Black, Arial`; ctx.textAlign = 'center'; ctx.lineWidth = h * .014; ctx.strokeStyle = '#220022'; ctx.fillStyle = ['#ffee33', '#ff5588', '#44e0ff', '#7dff6a'][wd.i % 4];
        ctx.strokeText(wd.text, 0, 0); ctx.fillText(wd.text, 0, 0); ctx.restore();
      });
      const dl = getDialogue(mi, si, mv, sc).find(l => t >= l.start && t <= l.end);
      if (dl) drawDialogueCaption(ctx, w, h, dl);
      return true;
    } catch (e) { failed = true; if (window.console) console.warn('cinema3d fell back to 2D:', e); return false; }
  }


  // ---------- the narrator: picks the best natural voice on this computer, speaks in short dramatic phrases ----------
  let VOICES = [];
  const loadVoices = () => { try { VOICES = window.speechSynthesis.getVoices() || []; } catch (e) { VOICES = []; } };
  loadVoices(); try { window.speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch (e) { }
  const vScore = (v) => {
    const n = v.name || '', l = v.lang || ''; if (!/^en/i.test(l)) return -1; let s = 0;
    if (/natural/i.test(n)) s += 100; if (/neural|online/i.test(n)) s += 60; if (/google/i.test(n)) s += 35; if (/microsoft/i.test(n)) s += 8;
    if (/en-US|en-GB|en-AU/i.test(l)) s += 10; if (/daniel|alex|samantha|karen|moira|fiona|tessa|serena|oliver|susan/i.test(n)) s += 30;
    if (/zira|hazel|mark|george|james|catherine/i.test(n) && !/natural|online/i.test(n)) s -= 6;
    if (/espeak|robot|compact/i.test(n)) s -= 40; return s;
  };
  const MALE = /guy|davis|ryan|daniel|david|alex|mark|george|roger|christopher|eric|brian|male|fred|tom|aaron|james|liam|william|thomas|oliver|steffan|andrew|jason/i;
  const FEMALE = /jenny|aria|sonia|libby|samantha|zira|karen|moira|fiona|tessa|hazel|susan|emma|michelle|female|natasha|clara|ava|ana|nancy|jane|sara|serena/i;
  function pickVoice(mi, mv) {
    if (!VOICES.length) loadVoices();
    const ranked = VOICES.map(v => [vScore(v), v]).filter(x => x[0] >= 0).sort((a, b) => b[0] - a[0]).map(x => x[1]);
    if (!ranked.length) return null;
    const lightGenre = /comedy|family|slice|friend|romance|sports/i.test(mv.genre || '') || /pizza|grandma|cat/i.test(mv.title || '');
    const want = lightGenre ? FEMALE : MALE, pool = ranked.filter(v => want.test(v.name));
    const top = (pool.length ? pool : ranked).slice(0, 2);
    return top[mi % top.length];
  }
  function cleanForSpeech(txt) {
    return String(txt || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\bS\.I\.P\b/g, ' S I P ').replace(/\bSIP\b/g, ' S I P ')
      .replace(/\b([A-Z]{2,})\b/g, (m) => m.charAt(0) + m.slice(1).toLowerCase()).replace(/\s+/g, ' ').trim();
  }
  let narratorName = '';

  // ---------- dialogue: the characters talk (speech bubbles + their own voices) ----------
  const STYLE_LINES = {
    fight: [[['A', 'Take that, {B}!'], ['B', "You can't beat me!"]], [['A', 'Not today!'], ['B', 'Ha! Try again!']], [['A', 'This ends now!'], ['B', 'We will see about that!']]],
    run: [[['A', 'Faster! Faster!'], ['B', 'Come back here!']], [['B', "You can't escape!"], ['A', 'Watch me!']], [['A', 'Keep running!'], ['B', 'Wait for me!']]],
    talk: [[['A', 'Listen to me. We have a plan.'], ['B', 'I am with you.']], [['A', 'Are you ready?'], ['B', 'Always ready!']], [['B', 'What do we do now?'], ['A', 'We stay together.']]],
    look: [[['A', 'Wait... do you see that?']], [['A', 'Something is out there.']], [['A', 'I have a funny feeling.'], ['B', 'Let us go and look.']]],
    party: [[['A', 'Woohoo! We did it!'], ['B', 'Best day ever!']], [['B', 'Hooray!'], ['A', 'Everybody dance!']]],
    sneak: [[['A', 'Shhh. Be very quiet.'], ['B', 'I think someone is following us.']], [['A', 'Step slowly...'], ['B', 'I am so nervous.']]],
    panic: [[['A', 'Aaaah! Run!'], ['B', 'Wait for me!']], [['B', 'What is that?!'], ['A', 'I do not want to find out!']]],
    work: [[['A', 'Almost done. Hand me that.'], ['B', 'Here you go!']], [['A', 'Together we can build anything!']]],
    walk: [[['A', "Let's go. It's this way."], ['B', 'Right behind you!']], [['A', 'Stay close to me.']], [['B', 'Are we there yet?'], ['A', 'Almost!']]],
    fly: [[['A', 'Hold on tight!'], ['B', 'Whoa! This is amazing!']], [['A', 'Here we go!']]],
  };
  const PROP_LINES = { rocket: 'Engines at full power!', coins: 'Look at all that S.I.P.!', pizza: 'Mmm... pizza!', house: 'What a beautiful home!', wall: 'We built this wall together.', portal: 'The portal is opening!', trophy: 'We are the champions!',
    fire: 'It is getting hot in here!', heart: 'I love this place.', bolt: 'Run! Lightning!', book: 'It is all written in this book.', shield: 'Stand behind me!', car: 'Start your engines!', moon: 'What a quiet night.', sun: 'What a beautiful morning!', tree: 'This old tree has seen everything.', lantern: 'Follow the light.' };
  const dlgCache = {};
  const wc = (t) => String(t || '').trim().split(/\s+/).length;
  // The lines come from the caption itself: a character either says what the caption says about them (in the first person),
  // reacts to the event in it, or answers the other character. Pure scene-setting and dark lore captions are left to the narrator.
  const MATURE = /satan|devil|demon|kill|blood|bleed|death|dead\b|\bdie\b|dies\b|murder|weapon|blade|grave|curse|bounty|hunter|wrath/i;
  const EVENT = /attack|escape|chase|race|fight|battle|find|found|discover|jump|run\b|ran\b|fall|fell|win\b|won\b|lose|lost|steal|stolen|arriv|launch|land|\bhit\b|crash|explo|rescue|save|build|open|catch|throw|danc|celebrat|cheer|scan|search|examin|follow|hid|sneak|warn|shout|scream|flee|zoom|fly|climb|fix|cook|bake|meet|talk|ask|answer|plan|decid|train|learn|teach|lead|begin|start|gather|march|enter|leave|return|prepar|regroup|surround|signal|roar|surpris|adjust|survey|tame|clue|suspic|breaking|shock/i;
  const IRREG = { is: 'am', has: 'have', does: 'do', goes: 'go' };
  function firstSentence(t) {
    t = String(t || '').replace(/\s+/g, ' ').trim(); const m = t.match(/^[^.!?\u2026]+[.!?\u2026]?/); let x = (m ? m[0] : t).trim();
    if (x.split(' ').length > 13) x = x.split(/\s[\u2014:;,-]\s|[\u2014:;,]/)[0].trim();
    if (x.split(' ').length > 13) x = x.split(' ').slice(0, 12).join(' ');
    if (!/[.!?\u2026]$/.test(x)) x += '.'; return x;
  }
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function firstPerson(sentence, nameOf) {
    for (const who of ['A', 'B', 'C']) {
      const n = nameOf[who]; if (!n) continue;
      const m = sentence.match(new RegExp('^(?:The )?' + esc(n) + ' ([a-z]+)(.*)$', 'i')); if (!m) continue;
      let v = m[1]; if (!/s$/i.test(v) && !IRREG[v.toLowerCase()]) continue;
      v = IRREG[v.toLowerCase()] || (/ies$/i.test(v) ? v.slice(0, -3) + 'y' : /(ches|shes|sses|xes|zes)$/i.test(v) ? v.slice(0, -2) : /ss$/i.test(v) ? v : v.slice(0, -1));
      return { who, text: 'I ' + v + m[2].replace(/\b(their|his|her|its)\b/gi, 'my') };
    }
    return null;
  }
  // Natural spoken lines that fit what is happening in the scene (never the narration read back). Scenes that are only
  // scene-setting or lore are left to the narrator, so nobody says anything that does not fit.
  const CATS = {
    fight:  [['Take that!', 'Not today!', 'You will not win!'], ['Ha! Try again!', 'You cannot stop me!', 'We will see about that!']],
    race:   [['Start your engines!', 'Pedal to the metal!', 'Here we go, racers!'], ['Catch me if you can!', 'I am right behind you!', 'This is going to be close!']],
    chase:  [['Faster! Faster!', 'Do not let them catch us!', 'Keep running!'], ['Wait for me!', 'I am right behind you!', 'Come back here!']],
    danger: [['Look out!', 'Watch out!', 'Danger ahead!'], ['Stay close to me!', 'I am ready for them!', 'We can handle this together!']],
    discover: [['Wait... what is that?', 'Did you see that?', 'I think I found something!'], ['Let us take a closer look.', 'Stay careful. Let us find out.', 'What do you think it is?']],
    start:  [['Here we go!', 'This is it!', 'Let us get started!'], ['I am ready!', 'Let us do this!', 'Right behind you!']],
    win:    [['Yes! We did it!', 'Woohoo!', 'Hooray!'], ['We did it together!', 'Best day ever!', 'I knew we could do it!']],
    trouble: [['Oh no!', 'This is bad!', 'That cannot be!'], ['Do not give up. We can fix this.', 'We will find a way.', 'Stay calm. Think!']],
    plan:   [['Here is the plan.', 'Listen to me, everyone.', 'We need to work together.'], ['Understood.', 'I am with you.', 'Tell us what to do.']],
    travel: [['This way. Stay close.', 'Keep your eyes open.', 'We are getting closer.'], ['Right behind you!', 'I see something up ahead.', 'Lead the way!']],
    build:  [['Hand me that!', 'Almost done!', 'Together we can build anything!'], ['Here you go!', 'Looks great!', 'Nice work!']],
  };
  const CAT_RE = [
    ['danger', /\b(attacks?|attacked|explosion|hit|crash(es)?|danger|monsters?|alarm|warning|traps?|trapped|ambush(es)?|invade[sd]?|threat|enem(y|ies)|surrounded)\b/i],
    ['discover', /\b(discover(s|ed)?|found|finds?|notices?|noticed|spots?|spotted|clue|scanner|strange|temple|hidden|secret)\b/i],
    ['trouble', /\b(stolen|lost|missing|falls?|fell|fails?|failed|broke|broken|trouble|stuck|crisis|shock|gone)\b/i],
    ['win', /\b(wins?|won|victory|celebrates?|celebrated|cheers?|cheered|fireworks|success|finally|saved|rescues?|rescued|comeback)\b/i],
    ['start', /\b(arrives?|arrived|launch(es|ed)?|begins?|starts?|started|prepares?|prepared|regroups?|marches|marched|set off|take off|takes off)\b/i],
    ['plan', /\b(plans?|decides?|decided|meets?|asks?|answers?|council|learns?|teach(es)?|train(s|ing)?|speech|announces?|announced|promises?|promised|whispers?|whispered|warns?|warned)\b/i],
    ['travel', /\b(walks?|walked|journey|travels?|traveled|wanders?|follows?|followed|returns?|returned|leaves?|explores?|explored|examin(e|es|ing)|surveys?|investigat(e|es|ing))\b/i],
    ['build', /\b(builds?|building|built|fix(es|ed)?|repairs?|repaired|cooks?|cooked|bakes?|baked|crafts?|crafted|raises?|raised|hammers?|invents?|invented|paints?|painted)\b/i],
  ];
  function getDialogue(mi, si, mv, sc) {
    const key = mi + '_' + si; if (dlgCache[key]) return dlgCache[key];
    const info = getInfo(mi, si, mv, sc), roles = castRoles(mi, mv), nameOf = { A: roles[0].role, B: roles[1].role, C: roles[2].role };
    const text = String(sc.text || ''), h = hash(mi, si, 21), res = [];
    res.total = 0.4 + wc(text) / 2.6 + 0.4; dlgCache[key] = res;
    if (MATURE.test(text)) return res;
    const quote = text.match(/["\u201C]([^"\u201D]{3,90})["\u201D]/);
    let cat = /\b(race|races|racing|raced|racer|racers|grid|slalom|lap|laps)\b/i.test(text) ? 'race' : info.style === 'fight' ? 'fight' : info.style === 'run' ? 'chase' : info.style === 'sneak' ? 'discover' : null;
    if (!cat) { const f = CAT_RE.find(c => c[1].test(text)); cat = f ? f[0] : null; }
    const hasB = info.present.indexOf('B') >= 0 || info.present.indexOf('C') >= 0;
    const lines = [];
    const who = text.match(/^([A-Z][A-Za-z' -]{2,26}):\s*["\u201C]/); const label = who ? who[1] : null;
    if (quote) { lines.push(['A', quote[1].replace(/\s+/g, ' ').trim()]); if (hasB && cat) lines.push(['B', CATS[cat][1][h % 3]]); }
    else if (cat) {
      let a = CATS[cat][0][h % 3];
      if (['rocket', 'pizza', 'trophy', 'car', 'portal', 'house'].indexOf(info.prop) >= 0 && (cat === 'start' || cat === 'win') && h % 2 === 0) a = PROP_LINES[info.prop];
      lines.push(['A', a]); if (hasB) lines.push(['B', CATS[cat][1][(h >>> 2) % 3]]);
    }
    lines.slice(0, 2).forEach((l, n) => { let w = l[0]; if (info.present.indexOf(w) < 0) w = info.present[0]; if (res.length && res[res.length - 1].who === w) return; res.push({ who: w, text: l[1], role: (n === 0 && label && quote) ? label : nameOf[w] }); });
    if (!res.length) return res;
    let tcur = 0.4 + wc(text) / 2.6 + 0.45;
    res.forEach(l => { l.start = tcur; l.end = tcur + wc(l.text) / 2.6 + 0.3; tcur = l.end + 0.25; });
    res.total = tcur + 0.5; return res;
  }
  function charVoice(who, narrator) {
    if (!VOICES.length) loadVoices();
    const ranked = VOICES.map(v => [vScore(v), v]).filter(x => x[0] >= 0).sort((a, b) => b[0] - a[0]).map(x => x[1]);
    const others = ranked.filter(v => !narrator || v.name !== narrator.name), pool = others.length ? others : ranked;
    if (!pool.length) return { voice: null };
    const idx = { A: 0, B: 1, C: 2 }[who] || 0, v = pool[idx % pool.length];
    return { voice: v, rate: { A: .96, B: 1.04, C: 1.1 }[who] || 1, pitch: pool.length >= 3 ? { A: .95, B: 1.05, C: 1.12 }[who] : { A: .82, B: 1.22, C: 1.45 }[who] };
  }
  function speakDialogue(mi, si, narratorVoice) {
    const mv = CINEMA_MOVIES[mi], sc = mv && mv.scenes[si]; if (!sc) return;
    getDialogue(mi, si, mv, sc).forEach(l => {
      const u = new SpeechSynthesisUtterance(cleanForSpeech(l.text)), cv = charVoice(l.who, narratorVoice);
      if (cv.voice) { u.voice = cv.voice; u.lang = cv.voice.lang; }
      u.rate = clamp(cv.rate || 1, .7, 1.3); u.pitch = clamp(cv.pitch || 1, .5, 1.8); u.volume = 1;
      if (/!/.test(l.text)) { u.rate *= 1.05; u.pitch = clamp(u.pitch + .05, .5, 1.8); }
      window.speechSynthesis.speak(u);
    });
  }
  // the characters' lines are shown as movie-style captions at the bottom of the screen, above the narrator's caption
  function drawDialogueCaption(ctx, w, h, line) {
    const fs = Math.max(16, Math.round(w / 40)), col = { A: '#ffd54f', B: '#4fc3f7', C: '#ff8ab3' }[line.who] || '#ffffff';
    ctx.save(); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    const name = String(line.role || '').toUpperCase() + ': ', quote = '\u201C' + line.text + '\u201D';
    ctx.font = `900 ${fs}px Arial`; const nw = ctx.measureText(name).width; ctx.font = `bold ${fs}px Arial`;
    const maxW = w * .86, rows = []; let cur = '';
    quote.split(' ').forEach(wd => { const tt = cur ? cur + ' ' + wd : wd; if (nw + ctx.measureText(tt).width > maxW && cur) { rows.push(cur); cur = wd; } else cur = tt; }); if (cur) rows.push(cur);
    const y0 = h * .80 - (rows.length - 1) * fs * 1.2, tw = Math.max.apply(null, rows.map((r, i) => ctx.measureText(r).width + (i === 0 ? nw : 0)));
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(w / 2 - tw / 2 - fs * .8, y0 - fs * 1.1, tw + fs * 1.6, rows.length * fs * 1.2 + fs * .5);
    rows.forEach((r, i) => {
      const y = y0 + i * fs * 1.2; ctx.lineWidth = fs * .18; ctx.strokeStyle = 'rgba(0,0,0,.9)';
      if (i === 0) {
        const total = nw + ctx.measureText(r).width, x0 = w / 2 - total / 2; ctx.textAlign = 'left';
        ctx.font = `900 ${fs}px Arial`; ctx.strokeText(name, x0, y); ctx.fillStyle = col; ctx.fillText(name, x0, y);
        ctx.font = `bold ${fs}px Arial`; ctx.strokeText(r, x0 + nw, y); ctx.fillStyle = '#fff'; ctx.fillText(r, x0 + nw, y); ctx.textAlign = 'center';
      } else { ctx.font = `bold ${fs}px Arial`; ctx.strokeText(r, w / 2, y); ctx.fillStyle = '#fff'; ctx.fillText(r, w / 2, y); }
    });
    ctx.restore();
  }
  function drawBubble(ctx, w, h, line, actor) {
    if (!actor) return;
    const v = new THREE.Vector3(actor.g.position.x, actor.g.position.y + 5.6 * (actor.g.scale.y / 1.45), actor.g.position.z).project(CAM);
    if (v.z > 1) return;
    let sx = (v.x * .5 + .5) * w, sy = (-v.y * .5 + .5) * h;
    const fs = Math.max(14, Math.round(h * .042)); ctx.save(); ctx.font = `bold ${fs}px Arial`; ctx.textAlign = 'left';
    const maxW = w * .38, words = line.text.split(' '), rows = []; let cur = '';
    words.forEach(wd => { const tt = cur ? cur + ' ' + wd : wd; if (ctx.measureText(tt).width > maxW && cur) { rows.push(cur); cur = wd; } else cur = tt; }); if (cur) rows.push(cur);
    const tw = Math.max.apply(null, rows.map(r => ctx.measureText(r).width).concat([ctx.measureText(line.role || '').width * .7])), pad = fs * .6, bw = tw + pad * 2, bh = rows.length * fs * 1.2 + pad * 2 + fs * .8;
    let bx = clamp(sx - bw / 2, 8, w - bw - 8), by = clamp(sy - bh - fs * 1.2, h * .09, h * .6);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = Math.max(2, fs * .12); ctx.beginPath();
    const r = fs * .6; ctx.moveTo(bx + r, by); ctx.arcTo(bx + bw, by, bx + bw, by + bh, r); ctx.arcTo(bx + bw, by + bh, bx, by + bh, r); ctx.arcTo(bx, by + bh, bx, by, r); ctx.arcTo(bx, by, bx + bw, by, r); ctx.closePath(); ctx.fill(); ctx.stroke();
    const tx = clamp(sx, bx + r * 1.5, bx + bw - r * 1.5); ctx.beginPath(); ctx.moveTo(tx - fs * .5, by + bh - 1); ctx.lineTo(sx, Math.min(sy, by + bh + fs * 1.4)); ctx.lineTo(tx + fs * .5, by + bh - 1); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillRect(tx - fs * .45, by + bh - 3, fs * .9, 5);
    ctx.fillStyle = '#c2185b'; ctx.font = `italic bold ${Math.round(fs * .7)}px Arial`; ctx.fillText(line.role || '', bx + pad, by + pad + fs * .6);
    ctx.fillStyle = '#111'; ctx.font = `bold ${fs}px Arial`; rows.forEach((row, i) => ctx.fillText(row, bx + pad, by + pad + fs * .8 + (i + 1) * fs * 1.2 - fs * .2));
    ctx.restore();
  }

  window.__cinemaNarrate = function (text, mi, dur) {
    try {
      const mv = CINEMA_MOVIES[mi] || CINEMA_MOVIES[0], synth = window.speechSynthesis; synth.cancel();
      const v = pickVoice(mi, mv); const natural = v && /natural|neural|online|google/i.test(v.name);
      narratorName = v ? v.name.replace(/Microsoft\s+/i, '').replace(/\s*(Online)?\s*\(Natural\).*$/i, '').replace(/\s*-\s*English.*$/i, '').replace(/\s+Desktop.*/i, '').replace(/^Google\s+/i, '').trim() : '';
      const serious = /drama|epic|mystery|thriller|action|mecha|sacred|origin|war|frontier|hometown/i.test(mv.genre || '');
      const baseRate = serious ? .92 : (/comedy|family|slice/i.test(mv.genre || '') ? 1.02 : .98), basePitch = natural ? (serious ? .95 : 1.02) : (serious ? .88 : 1.0);
      const parts = cleanForSpeech(text).match(/[^.!?\u2026]+[.!?\u2026]*/g) || [cleanForSpeech(text)];
      parts.forEach((ph) => {
        ph = ph.trim(); if (!ph) return;
        const u = new SpeechSynthesisUtterance(ph); if (v) { u.voice = v; u.lang = v.lang; }
        let rate = baseRate, pitch = basePitch, vol = .95;
        if (/!/.test(ph)) { rate *= 1.06; pitch += .06; vol = 1; }
        if (/\?/.test(ph)) { pitch += .08; }
        if (/\u2026|\.\.\./.test(ph)) { rate *= .86; pitch -= .04; }
        if (ph.length < 24) { rate *= .93; }                 // short lines are delivered slowly and heavily
        u.rate = clamp(rate, .6, 1.3); u.pitch = clamp(pitch, .5, 1.5); u.volume = vol;
        synth.speak(u);
      });
      speakDialogue(mi, cinemaState.sceneIndex, v);
    } catch (e) { }
  };

  function drawCredits(mv, mi, elapsed) {
    const cv = document.getElementById('cinemaCanvas'); if (!cv) return; const ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
    ctx.fillStyle = '#05050c'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { const a = .3 + .5 * Math.abs(Math.sin(elapsed * .8 + i * 2.3)); ctx.fillStyle = `rgba(255,240,180,${a})`; ctx.fillRect((i * 137.5 % 1) * w * 0 + ((i * 97.3) % w), (i * 61.7 + elapsed * 6) % h, 2, 2); }
    const cl = castList(mi, mv), lines = [];
    lines.push(['title', mv.title.toUpperCase()]); lines.push(['small', 'AN EXPLOX CINEMAS PRODUCTION']); lines.push(['gap', '']);
    lines.push(['head', 'STARRING']);
    cl.forEach(c => { lines.push(['actor', '\u2605 ' + c.actor]); lines.push(['role', 'as  ' + c.role]); lines.push(['gap', '']); });
    lines.push(['head', 'ALSO STARRING']); lines.push(['actor', 'Cubby  \u2022  Hubby  \u2022  Gernaldst']); lines.push(['role', 'and the people of Explox']); lines.push(['gap', '']);
    lines.push(['head', 'NARRATED BY']); lines.push(['actor', narratorName ? narratorName + ' (the Explox Cinemas voice)' : 'The Explox Cinemas Voice']); lines.push(['gap', '']);
    lines.push(['head', 'DIRECTED BY']); lines.push(['actor', 'Explox Cinemas']); lines.push(['gap', '']); lines.push(['gap', '']);
    lines.push(['end', '\u2726  THE END  \u2726']);
    const lh = Math.max(34, h * .075), total = lines.length * lh;
    const speed = lh * 1.15, y0 = h + 20 - elapsed * speed, stop = h / 2 - total + h * .1;   // scroll up, then the last lines rest in the middle
    const yTop = Math.max(y0, h * .5 - total + lh * 2.6 + 0);
    ctx.textAlign = 'center';
    lines.forEach((l, i) => {
      const y = yTop + i * lh; if (y < -lh || y > h + lh) return; const [k, tx] = l;
      if (k === 'title') { ctx.fillStyle = '#ffd54f'; ctx.font = `900 ${Math.round(lh * .95)}px Arial Black, Arial`; }
      else if (k === 'head') { ctx.fillStyle = '#ff9acb'; ctx.font = `bold ${Math.round(lh * .55)}px Arial`; }
      else if (k === 'actor') { ctx.fillStyle = '#ffffff'; ctx.font = `bold ${Math.round(lh * .72)}px Arial`; }
      else if (k === 'role') { ctx.fillStyle = '#9fe3ff'; ctx.font = `italic ${Math.round(lh * .6)}px Arial`; }
      else if (k === 'end') { ctx.fillStyle = '#ffd54f'; ctx.font = `900 ${Math.round(lh * 1.0)}px Arial Black, Arial`; }
      else { ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.font = `${Math.round(lh * .42)}px Arial`; }
      const mw = ctx.measureText(tx).width; if (mw > w * .92) { const fs = parseInt(ctx.font.match(/(\d+)px/)[1], 10); ctx.font = ctx.font.replace(/\d+px/, Math.floor(fs * w * .92 / mw) + 'px'); }
      ctx.fillText(tx, w / 2, y);
    });
    if (typeof cinemaState !== 'undefined' && cinemaState.snacks && cinemaState.snacks.length) { ctx.fillStyle = 'rgba(255,204,0,.8)'; ctx.font = `${Math.max(12, w / 60)}px Arial`; ctx.fillText('You enjoyed: ' + cinemaState.snacks.map(x => x.emoji).join(' '), w / 2, 36); }
  }
  const creditsFn = function () {
    cinemaState.phase = 'credits';
    try { sfx.credits(); } catch (e) { }
    window.speechSynthesis.cancel();
    setTimeout(() => { if (cinemaState.phase !== 'credits') return; window.__cinemaNarrate('The end.', cinemaState.movieIdx, 3); }, 800);
    if (cinemaState.animFrame) cancelAnimationFrame(cinemaState.animFrame);
    const cv = document.getElementById('cinemaCanvas'), mv = cinemaState.movie, mi = cinemaState.movieIdx, t0 = performance.now();
    document.getElementById('cinemaSkip').style.display = 'none'; document.getElementById('cinemaClose').style.display = 'block';
    const tick = () => { if (cinemaState.phase !== 'credits') return; drawCredits(mv, mi, (performance.now() - t0) / 1000); cinemaState.animFrame = requestAnimationFrame(tick); };
    tick();
  };
  // game-social.js loads after this file and defines its own showCinemaCredits, so take over once everything has loaded
  const installCredits = () => { window.showCinemaCredits = creditsFn; };
  installCredits(); window.addEventListener('load', installCredits);

  CINEMA_MOVIES.forEach((mv, mi) => {
    (mv.scenes || []).forEach((sc, si) => {
      if (sc.draw3dWired) return; sc.draw3dWired = true; const d2 = sc.draw;
      sc.draw2d = d2;
      sc.draw = function (ctx, w, h, t) { if (!draw3D(mi, si, mv, sc, ctx, w, h, t)) d2.call(sc, ctx, w, h, t); };
      try { const dl = getDialogue(mi, si, mv, sc); sc.dur = Math.max(sc.dur || 5, Math.min(11, dl.total || 5)); } catch (e) { }
    });
  });
  window.__cinema3d = { draw: draw3D, tagsFor, info: getInfo, castList, drawCredits, dialogue: getDialogue, status: () => ({ failed, hasRenderer: !!R }) };
})();
