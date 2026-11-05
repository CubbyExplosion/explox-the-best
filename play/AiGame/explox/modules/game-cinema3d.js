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
  let stage = null, stageKey = '', castKey = '', cast = [], fxGroup = new THREE.Group(), gagState = {}, words = [];
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
  function tagSprite(name) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = 'rgba(0,0,0,.65)'; x.fillRect(0, 8, 256, 48); x.fillStyle = '#fff'; x.font = 'bold 26px Arial'; x.textAlign = 'center'; x.fillText(name, 128, 42);
    const t = new THREE.CanvasTexture(c); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false }));
    s.scale.set(2.6, 0.65, 1); s.position.y = 4.3; return s;
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
    const tag = o.noTag ? null : tagSprite(o.name || def.name); if (tag) g.add(tag);
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

  // ---------- the crowd: hundreds of fans dressed like Cubby (red + white chef hat), Hubby (blue + red cap),
  // Gernaldst (yellow + duck hat) and other S.I.P. team fans. Drawn with instancing so 360 people cost 6 draw calls. ----------
  const CROWD_N = 360;
  let crowd = null;
  function buildCrowd() {
    const g = new THREE.Group(), r = rnd(777);
    const mk = (w, h, d) => { const m = new THREE.InstancedMesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: 0xffffff }), CROWD_N); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; g.add(m); return m; };
    const parts = { legs: mk(.8, .95, .4), torso: mk(.8, 1.0, .45), head: mk(.9, .9, .9), hat: mk(1.0, .5, 1.0), armL: mk(.3, .85, .3), armR: mk(.3, .85, .3) };
    const people = [], skins = [0xffcc80, 0xf5c89a, 0xd4956a, 0xe8c080, 0x8d5e3c, 0xf0c8a0], hairs = [0x212121, 0x5d4037, 0x3a2410, 0xffcc66, 0xaa3311, 0x1a1a1a], shirts = [0x42a5f5, 0x66bb6a, 0xab47bc, 0xff7043, 0x26c6da, 0xec407a, 0x8d6e63, 0x9ccc65];
    let i = 0, row = 0;
    while (i < CROWD_N) {
      const rad = 21 + row * 1.9, n = Math.floor(2 * Math.PI * rad / 2.0);
      for (let k = 0; k < n && i < CROWD_N; k++, i++) {
        const a = k / n * 6.283 + (row % 2) * .08 + (r() - .5) * .04, type = Math.floor(r() * 9);
        const pp = { x: Math.cos(a) * rad, z: Math.sin(a) * rad, ang: -a - Math.PI / 2, ph: r() * 6.28, type, sc: .95 + r() * .35, skin: skins[Math.floor(r() * skins.length)] };
        if (type <= 2) { pp.shirt = [0xef5350, 0x1e88e5, 0xfdd835][type]; pp.hatc = [0xffffff, 0xe53935, 0xffee58][type]; pp.hatS = [[1.0, 1.9, 1.0, 3.7], [1.2, .5, 1.3, 3.3], [1.0, .75, 1.0, 3.35]][type]; pp.pants = 0x37474f; }
        else { pp.shirt = shirts[Math.floor(r() * shirts.length)]; pp.hatc = hairs[Math.floor(r() * hairs.length)]; pp.hatS = [1.08, .35, 1.0, 3.3]; pp.pants = [0x37474f, 0x263238, 0x3949ab, 0x5d4037][Math.floor(r() * 4)]; }
        people.push(pp);
        const c = new THREE.Color();
        parts.legs.setColorAt(i, c.setHex(pp.pants)); parts.torso.setColorAt(i, c.setHex(pp.shirt)); parts.head.setColorAt(i, c.setHex(pp.skin));
        parts.hat.setColorAt(i, c.setHex(pp.hatc)); parts.armL.setColorAt(i, c.setHex(pp.shirt)); parts.armR.setColorAt(i, c.setHex(pp.shirt));
      }
      row++;
    }
    Object.values(parts).forEach(m => { m.instanceColor.needsUpdate = true; });
    crowd = { g, parts, people, P: new THREE.Matrix4(), L: new THREE.Matrix4(), M: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), v: new THREE.Vector3(), sv: new THREE.Vector3() };
    SC.add(g);
  }
  function updateCrowd(t, inten) {
    if (!crowd) buildCrowd();
    const c = crowd, P = c.P, L = c.L, M = c.M, ps = c.parts;
    const put = (mesh, i, x, y, z, rx, sx, sy, sz) => { c.e.set(rx || 0, 0, 0); c.q.setFromEuler(c.e); c.v.set(x, y, z); c.sv.set(sx || 1, sy || 1, sz || 1); L.compose(c.v, c.q, c.sv); M.multiplyMatrices(P, L); mesh.setMatrixAt(i, M); };
    for (let i = 0; i < c.people.length; i++) {
      const p = c.people[i];
      const jump = Math.max(0, Math.sin(t * (4 + p.type % 3) + p.ph)) * (.4 + .9 * inten);
      c.e.set(0, p.ang, 0); c.q.setFromEuler(c.e); c.v.set(p.x, jump, p.z); c.sv.set(p.sc, p.sc, p.sc); P.compose(c.v, c.q, c.sv);
      const arm = inten > .6 ? -2.7 + Math.sin(t * 9 + p.ph) * .6 : -.3 + Math.sin(t * 3 + p.ph) * .5;
      put(ps.legs, i, 0, .52, 0); put(ps.torso, i, 0, 1.75, 0); put(ps.head, i, 0, 2.75, 0);
      put(ps.hat, i, 0, p.hatS[3], 0, 0, p.hatS[0], p.hatS[1], p.hatS[2]);
      const ay = 2.2 - .4 * Math.cos(arm), az = -.4 * Math.sin(arm);
      put(ps.armL, i, -.6, ay, az, arm); put(ps.armR, i, .6, ay, az, arm);
    }
    Object.values(ps).forEach(m => { m.instanceMatrix.needsUpdate = true; });
  }

  // ---------- scene director ----------
  const STYLES = ['march', 'chase', 'fight', 'party', 'fly', 'sneak', 'talk'];
  function styleFor(text, mi, si) {
    const t = (text || '').toLowerCase();
    if (/fight|battle|attack|war|punch|kick|strike|clash|duel|defend/.test(t)) return 'fight';
    if (/run|race|chase|escape|rush|launch|speed|zoom|flee|dash/.test(t)) return 'chase';
    if (/dance|party|celebrat|cheer|win|victory|festival|laugh|joke|hooray|finally/.test(t)) return 'party';
    if (/fly|flight|sky|soar|wing|rocket|space|orbit|plane|cloud|warp/.test(t)) return 'fly';
    if (/secret|mystery|dark|night|ghost|shadow|search|sneak|clue|hid|silent/.test(t)) return 'sneak';
    if (/meet|talk|plan|council|learn|teach|train|speech|say|ask|decid/.test(t)) return 'talk';
    return STYLES[hash(mi, si, 7) % STYLES.length];
  }
  function npcPool() {
    const defs = (typeof NPC_DEFS !== 'undefined' ? NPC_DEFS : []).filter(d => d && ['Citizen', 'Shopkeeper', 'Waiter', 'Officer', 'Foreman', 'Jogger', 'Tourist', 'Vendor', 'Celebrity'].indexOf(d.role) >= 0);
    return defs.length ? defs : [{ name: 'Sam', skin: 0xf5c89a, shirt: 0x2255aa, pants: 0x333344, hair: 'short', hairColor: 0x2a1505 }, { name: 'Mia', skin: 0xd4956a, shirt: 0x1166bb, pants: 0x222233, hair: 'long', hairColor: 0x1a1a1a }];
  }
  function setupCast(mi, mv) {
    if (castKey === 'c' + mi && cast.length) return;
    cast.forEach(c => SC.remove(c.g)); cast = [];
    const pool = npcPool(), r = rnd(hash(mi, 11, 5)), tags = tagsFor(mv);
    const pick = () => pool[Math.floor(r() * pool.length)];
    // every Explox celebrity (Chaz Diamond, Vex Nova, Bree Millions) is a star of every movie
    const stars = (typeof NPC_DEFS !== 'undefined' ? NPC_DEFS : []).filter(d => d && d.role === 'Celebrity');
    ['hero', 'friend', 'villain'].forEach((role, i) => {
      const def = stars.length ? stars[(i + mi) % stars.length] : pick(), p = buildPerson(def, { name: '★ ' + def.name }); p.role = role; costume(p, tags[i % tags.length]); p.costume = tags[i % tags.length]; p.g.scale.setScalar(1.45); SC.add(p.g); cast.push(p);
    });
    const SIP = [
      { name: 'Cubby', skin: 0xffcc80, shirt: 0xef5350, pants: 0x37474f, hair: 'short', hairColor: 0x212121, hat: 'chef', prop: 'chips' },
      { name: 'Hubby', skin: 0xffcc80, shirt: 0x1e88e5, pants: 0x37474f, hair: 'short', hairColor: 0x5d4037, hat: 'cap', hatColor: 0xe53935, prop: 'blaster1' },
      { name: 'Gernaldst', skin: 0xffcc80, shirt: 0xfdd835, pants: 0x37474f, hair: 'short', hairColor: 0x5d4037, hat: 'duck', prop: 'blaster2' }];
    SIP.forEach(def => {
      const p = buildPerson(def, { name: def.name, hatColor: def.hatColor }); p.role = 'extra'; p.g.scale.setScalar(1.35);
      if (def.prop === 'chips') { const bg = box(p.armR, .5, .65, .22, 0xffd54f, 0, -.9, .25); box(bg, .36, .2, .06, 0xd84315, 0, 0, .13); }
      else { const bl = box(p.armR, .3, .3, 1.0, def.prop === 'blaster1' ? 0xab47bc : 0x43a047, 0, -.8, .6); box(bl, .2, .2, .2, 0xe1f5fe, 0, 0, .6, { transparent: true, opacity: .7 }); }
      if (def.name === 'Gernaldst') p.mouth.scale.set(1.5, 3, 1);
      SC.add(p.g); cast.push(p);
    });
    for (let i = 0; i < 3; i++) { const def = pick(), p = buildPerson(def, { name: def.name, noTag: true }); p.role = 'extra'; p.g.scale.setScalar(1.2); SC.add(p.g); cast.push(p); }
    castKey = 'c' + mi;
  }
  function stars(parent, y, t, n, color) {   // BONK stars spinning around a head
    for (let i = 0; i < n; i++) {
      const a = t * 6 + i * 6.283 / n; const s = new THREE.Mesh(new THREE.OctahedronGeometry(.18), new THREE.MeshBasicMaterial({ color: color || 0xffee33 }));
      s.position.set(Math.cos(a) * .9, y + Math.sin(t * 8 + i) * .1, Math.sin(a) * .9); s.userData.fx = true; fxGroup.add(s); s.userData.parent = parent;
    }
  }
  function clearFx() { while (fxGroup.children.length) { const c = fxGroup.children.pop(); if (c.geometry) c.geometry.dispose(); } }
  function confetti(t, n) {
    for (let i = 0; i < n; i++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(.25, .06, .25), new THREE.MeshBasicMaterial({ color: [0xff3366, 0xffcc00, 0x33ddff, 0x66ff66, 0xcc66ff][i % 5] }));
      const sd = (i * 97) % 13, fall = ((t * (1.5 + (i % 5) * .3) + sd * .37) % 5);
      c.position.set(((i * 0.618) % 1 - .5) * 26, 9 - fall * 2.2, (((i * 0.382) % 1) - .5) * 14);
      c.rotation.set(t * 3 + i, t * 2, i); fxGroup.add(c);
    }
  }
  function limbs(p, a, b, c, d) { p.armL.rotation.x = a; p.armR.rotation.x = b; p.legL.rotation.x = c; p.legR.rotation.x = d; }
  function pose(p) { p.g.rotation.set(0, p.g.rotation.y, 0); p.body.rotation.set(0, 0, 0); p.body.position.set(0, 0, 0); p.head.rotation.set(0, 0, 0); p.head.scale.setScalar(p.costume === 'alien' ? 1.25 : 1); limbs(p, 0, 0, 0, 0); p.armL.rotation.z = 0; p.armR.rotation.z = 0; p.mouth.scale.set(1, 1, 1); }
  function walk(p, t, sp, big) { const s = Math.sin(t * sp) * (big || .8); limbs(p, -s, s, s, -s); p.body.position.y = Math.abs(Math.sin(t * sp)) * .12; }
  function words2d(t, text, i) { words.push({ t0: t, text, i }); }

  function direct(mi, si, mv, sc, t) {
    const dur = sc.dur || 5, u = clamp(t / dur, 0, 1), style = styleFor(sc.text, mi, si), r = rnd(hash(mi, si, 3));
    const hero = cast[0], friend = cast[1], vil = cast[2], ex = cast.slice(3);
    cast.forEach(pose); clearFx(); words = [];
    const camStyle = ['orbit', 'dolly', 'crane', 'side'][hash(mi, si, 9) % 4];
    let look = new THREE.Vector3(0, 2.6, 0), shake = 0;
    const face = (p, ang) => { p.g.rotation.y = ang; };
    const kind = stageKey.split('|')[0];
    cast.forEach(p => { p.g.visible = true; });
    updateCrowd(t, style === 'party' ? 1 : style === 'fight' ? .9 : style === 'chase' ? .7 : .45);
    if (style === 'march') {
      const x0 = -14 + t * 2.6; [hero, friend, vil].forEach((p, i) => { p.g.position.set(x0 + i * 3.2 - 3, 0, 0 + (i - 1) * 1.6); face(p, Math.PI / 2); walk(p, t + i, 7); });
      ex.forEach((p, i) => { p.g.position.set(x0 - 6 - i * 2.4, 0, (i % 2 ? 3.4 : -3.4)); face(p, Math.PI / 2); walk(p, t + i * .4, 7); });
      look.set(x0, 2.5, 0);
      if (u > .45 && u < .75) { hero.head.scale.setScalar(1 + Math.sin((u - .45) * Math.PI / .3) * .9); words2d(.45, 'BIG HEAD!', 1); }
    } else if (style === 'chase') {
      const R0 = 8, w = t * 1.15; [[vil, 0], [hero, .95], [friend, 1.6]].forEach(([p, off], i) => { const a = w - off; p.g.position.set(Math.cos(a) * R0, 0, Math.sin(a) * R0 * .6); face(p, -a); walk(p, t + i, 12, 1.1); p.body.rotation.x = .25; });
      ex.forEach((p, i) => { p.g.position.set(-14 + i * 9, 0, -7); face(p, 0); limbs(p, Math.sin(t * 9 + i) * 2.2, -Math.sin(t * 9 + i) * 2.2, 0, 0); });
      const slipT = dur * .55;
      if (t > slipT && t < slipT + 1.2) { const q = (t - slipT) / 1.2; hero.body.rotation.x = -q * 6.283; hero.body.position.y = Math.sin(q * 3.14) * 2.2; limbs(hero, 2.5, 2.5, 1, -1); words2d(slipT, 'WHOA!', 2);
        const bn = new THREE.Mesh(new THREE.BoxGeometry(.9, .12, .3), new THREE.MeshLambertMaterial({ color: 0xffdd33 })); bn.position.set(hero.g.position.x, .1, hero.g.position.z); bn.rotation.y = 1; fxGroup.add(bn); }
      look.copy(vil.g.position).setY(2.4);
    } else if (style === 'fight') {
      hero.g.position.set(-2.6 + Math.sin(t * 2) * .4, 0, 0); vil.g.position.set(2.6 - Math.sin(t * 2) * .4, 0, 0); face(hero, Math.PI / 2); face(vil, -Math.PI / 2);
      const ph = t * 5; limbs(hero, -1.5 + Math.sin(ph) * 1.6, -1.5 - Math.sin(ph) * 1.6, Math.sin(ph) * .3, -Math.sin(ph) * .3); limbs(vil, -1.5 - Math.sin(ph + 1.7) * 1.6, -1.5 + Math.sin(ph + 1.7) * 1.6, 0, 0);
      friend.g.position.set(-6.5, 0, 3); face(friend, Math.PI / 3); limbs(friend, Math.sin(t * 7) * 2.4, -Math.sin(t * 7) * 2.4, 0, 0);
      ex.forEach((p, i) => { p.g.position.set(-9 + i * 6, 0, -6); face(p, 0); limbs(p, 2.6 + Math.sin(t * 6 + i) * .4, 2.6 - Math.sin(t * 6 + i) * .4, 0, 0); });
      const bt = (Math.floor(t / .9)), ph2 = (t % .9);
      if (ph2 < .35) { stars(vil, 4.0, t, 5); words2d(bt * .9, ['BONK!', 'POW!', 'SPLAT!', 'KAPOW!'][bt % 4], 3); vil.body.rotation.z = Math.sin(ph2 * 18) * .25; vil.mouth.scale.set(.5, 3, 1); shake = .35; }
      look.set(0, 2.6, 0);
    } else if (style === 'party') {
      const all = cast; all.forEach((p, i) => { const a = i * 6.283 / all.length + t * .5; p.g.position.set(Math.cos(a) * 5.2, 0, Math.sin(a) * 4.2); face(p, -a + Math.PI); p.g.position.y = Math.abs(Math.sin(t * 5 + i)) * 1.1; limbs(p, 2.8 + Math.sin(t * 9 + i) * .6, 2.8 - Math.sin(t * 9 + i) * .6, Math.sin(t * 9 + i) * .6, -Math.sin(t * 9 + i) * .6); p.body.rotation.y = Math.sin(t * 4 + i) * .5; p.mouth.scale.set(1.2, 2.2, 1); });
      confetti(t, 90); if (u > .3 && u < .6) words2d(.3, 'PARTY!', 4);
      look.set(0, 2.2, 0);
    } else if (style === 'fly') {
      cast.forEach((p, i) => { const k = i - 3; p.g.position.set(k * 2.4 + Math.sin(t + i) * .6, 5 + Math.sin(t * 2 + i) * .5 + (i === 0 ? 1.2 : 0), -1 + (i % 2) * 2.5); face(p, Math.PI / 2 * .0); p.g.rotation.x = -1.35; limbs(p, 2.9, 2.9, .1, -.1); p.body.rotation.z = Math.sin(t * 3 + i) * .08; });
      if (stage) stage.position.z = (t * 26) % 40;
      look.set(0, 5, 0);
    } else if (style === 'sneak') {
      cast.forEach((p, i) => { const a = -Math.PI / 2 + i * .55 - t * .3; p.g.position.set(-8 + ((t * 1.1 + i * 2.2) % 18), 0, -2 + Math.sin(i + t) * 1.5); face(p, Math.PI / 2); walk(p, t * .7 + i, 5, .5); p.body.rotation.x = .35; p.head.rotation.y = Math.sin(t * 2 + i) * .8; p.mouth.scale.set(.4, .6, 1); });
      if (u > .5 && u < .7) { vil.head.scale.setScalar(1.7); words2d(.5, 'BOO!', 5); }
      look.set(0, 2.2, 0); rim.intensity = 1.6;
    } else {   // talk
      cast.forEach((p, i) => { const a = i * 6.283 / cast.length; p.g.position.set(Math.cos(a) * 3.6, 0, Math.sin(a) * 3.6); face(p, -a - Math.PI / 2); const k = Math.sin(t * 2.2 + i * 2) > .2; limbs(p, k ? 2.2 + Math.sin(t * 8 + i) * .5 : 0, k ? -.4 : 0, 0, 0); p.head.rotation.y = Math.sin(t * 1.5 + i) * .3; p.mouth.scale.set(1, k ? 1.4 + Math.abs(Math.sin(t * 12 + i)) * 2 : 1, 1); });
      if (u > .55 && u < .8) { cast[3].head.scale.setScalar(1.8); words2d(.55, 'WHAT?!', 6); }
      look.set(0, 2.4, 0);
    }
    if (hero.costume === 'ghost' || cast.some(c => c.extras.ghost)) cast.forEach(c => { if (c.extras.ghost) c.g.position.y += .6 + Math.sin(t * 3) * .3; });
    cast.forEach(c => { if (c.extras.wings) { const f = Math.sin(t * 7) * .5; c.extras.wings[0].rotation.z = f; c.extras.wings[1].rotation.z = -f; } });
    // camera
    const seed = hash(mi, si, 2) % 628 / 100;
    if (camStyle === 'orbit') { const a = seed + t * .35; CAM.position.set(Math.cos(a) * 12, 4.6, Math.sin(a) * 12 + 3); }
    else if (camStyle === 'dolly') { CAM.position.set(Math.sin(seed) * 5, 3.4 + u * 1.0, 19 - u * 9); }
    else if (camStyle === 'crane') { CAM.position.set(-8, 1.4 + u * 9, 13 - u * 3); }
    else { CAM.position.set(look.x + 2, 3.6, 11); }
    if (shake) CAM.position.add(new THREE.Vector3((Math.random() - .5) * shake, (Math.random() - .5) * shake, 0));
    CAM.lookAt(look);
    rim.position.set(look.x - 8, 6, look.z + 4);
  }

  // ---------- public entry: replaces each scene's 2D drawing ----------
  function draw3D(mi, si, mv, sc, ctx, w, h, t) {
    const rd = renderer(w, h); if (!rd) return false;
    try {
      const vis = (typeof _MVIS !== 'undefined' && _MVIS[mi]) ? _MVIS[mi] : null;
      const kind = kindFor(mv, mi, sc.text);
      const accent = vis ? hexOf(vis[2]) : 0xff7733, skyTop = vis ? hexOf(vis[0]) : hexOf(mv.bg), skyMid = vis ? hexOf(vis[1]) : hexOf(mv.bg);
      const key = kind + '|' + mi + '|' + (kind === 'space' ? '' : (si % 2));
      if (key !== stageKey) {
        if (stage) { SC.remove(stage); stage.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
        stage = buildStage(kind, accent, skyTop, hash(mi, kind.length, 1)); SC.add(stage); stageKey = key;
      }
      setupCast(mi, mv);
      SC.background = new THREE.Color(kind === 'city' ? 0x1a2238 : kind === 'nature' ? 0x7ec8ff : skyTop);
      SC.fog = new THREE.Fog(SC.background.getHex(), 40, 130);
      hemi.color.setHex(kind === 'nature' ? 0xffffff : 0x9fb4ff); hemi.groundColor.setHex(skyMid); hemi.intensity = kind === 'nature' ? 1.1 : .8;
      sun.color.setHex(kind === 'nature' ? 0xfff2cc : accent); sun.intensity = 1.0; rim.color.setHex(accent); rim.intensity = 1.0;
      if (stage) stage.children.forEach(c => { if (c.userData && c.userData.spin) { c.rotation.x = t * c.userData.spin; c.rotation.y = t * c.userData.spin * .7; } if (c.userData && c.userData.drift) c.position.x += Math.sin(t * .4) * .01 * c.userData.drift; });
      if (stage && !/fly/.test(styleFor(sc.text, mi, si))) stage.position.z = 0;
      direct(mi, si, mv, sc, t);
      rd.render(SC, CAM);
      ctx.drawImage(rd.domElement, 0, 0, w, h);
      // funny sound-effect words on top of the picture
      words.forEach(wd => {
        const age = t - wd.t0, a = clamp(1 - age * .6, 0, 1); if (age < 0 || a <= 0) return;
        ctx.save(); ctx.translate(w * (.28 + (wd.i * .13) % .5), h * (.3 + (wd.i * .09) % .18)); ctx.rotate(((wd.i % 3) - 1) * .18); ctx.scale(1 + Math.min(age, .25) * 2, 1 + Math.min(age, .25) * 2);
        ctx.globalAlpha = a; ctx.font = `900 ${Math.round(h * .085)}px Arial Black, Arial`; ctx.textAlign = 'center'; ctx.lineWidth = h * .014; ctx.strokeStyle = '#220022'; ctx.fillStyle = ['#ffee33', '#ff5588', '#44e0ff', '#7dff6a'][wd.i % 4];
        ctx.strokeText(wd.text, 0, 0); ctx.fillText(wd.text, 0, 0); ctx.restore();
      });
      return true;
    } catch (e) { failed = true; if (window.console) console.warn('cinema3d fell back to 2D:', e); return false; }
  }

  CINEMA_MOVIES.forEach((mv, mi) => {
    (mv.scenes || []).forEach((sc, si) => {
      if (sc.draw3dWired) return; sc.draw3dWired = true; const d2 = sc.draw;
      sc.draw2d = d2;
      sc.draw = function (ctx, w, h, t) { if (!draw3D(mi, si, mv, sc, ctx, w, h, t)) d2.call(sc, ctx, w, h, t); };
    });
  });
  window.__cinema3d = { draw: draw3D, tagsFor, status: () => ({ failed, hasRenderer: !!R }) };
})();
