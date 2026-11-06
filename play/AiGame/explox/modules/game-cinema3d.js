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
    const eyeL = box(head, 0.24, 0.26, 0.05, 0xffffff, -0.2, 0.08, 0.46), eyeR = box(head, 0.24, 0.26, 0.05, 0xffffff, 0.2, 0.08, 0.46);
    box(head, 0.1, 0.12, 0.06, 0x111111, -0.18, 0.06, 0.49); box(head, 0.1, 0.12, 0.06, 0x111111, 0.22, 0.06, 0.49);
    const mouth = box(head, 0.3, 0.09, 0.05, 0x7a2a1a, 0, -0.22, 0.47);
    const browL = box(head, .3, .07, .05, 0x2a1a0a, -.2, .3, .47), browR = box(head, .3, .07, .05, 0x2a1a0a, .2, .3, .47);
    const mouthL = box(head, .15, .08, .05, 0x7a2a1a, -.22, -.22, .47), mouthR = box(head, .15, .08, .05, 0x7a2a1a, .22, -.22, .47);
    const tearL = box(head, .07, .2, .04, 0x66ccff, -.28, -.05, .49, { emissive: 0x2266aa }), tearR = box(head, .07, .2, .04, 0x66ccff, .28, -.05, .49, { emissive: 0x2266aa });
    const sweat = box(head, .12, .2, .08, 0x66ccff, .5, .4, .3, { emissive: 0x2266aa }); tearL.visible = tearR.visible = sweat.visible = false;
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
    return { g, body, head, torso, armL, armR, legL, legR, mouth, def, tag, baseY: 0, extras: {}, face: { eyeL, eyeR, browL, browR, mouthL, mouthR, tearL, tearR, sweat } };
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

  // ---------- emotions: faces and bodies that show how a character feels ----------
  const EMODEF = {
    neutral: { bL: 0, bR: 0, by: 0, mL: 0, mR: 0, mw: 1, mh: 1, eye: 1 },
    happy: { bL: .1, bR: -.1, by: .04, mL: -.5, mR: .5, mw: 1.15, mh: 1.1, eye: 1 },
    joy: { bL: .15, bR: -.15, by: .08, mL: -.6, mR: .6, mw: 1.3, mh: 2.4, eye: .55, open: true, bounce: true },
    relieved: { bL: .25, bR: -.25, by: .02, mL: -.35, mR: .35, mw: 1.1, mh: 1, eye: .6 },
    sad: { bL: .45, bR: -.45, by: -.02, mL: .55, mR: -.55, mw: .9, mh: .8, eye: .85, tear: true, head: .35 },
    angry: { bL: -.55, bR: .55, by: -.03, mL: .3, mR: -.3, mw: 1.2, mh: 1.4, eye: .9, lean: .2 },
    scared: { bL: .4, bR: -.4, by: .1, mL: .25, mR: -.25, mw: .7, mh: 2.8, eye: 1.45, sweat: true, open: true, shake: true, lean: -.15 },
    surprised: { bL: .1, bR: -.1, by: .12, mL: 0, mR: 0, mw: .6, mh: 2.8, eye: 1.5, open: true },
    worried: { bL: .4, bR: -.4, by: .05, mL: .3, mR: -.3, mw: .9, mh: .9, eye: 1.1 },
    determined: { bL: -.35, bR: .35, by: -.02, mL: -.05, mR: .05, mw: 1, mh: .8, eye: .9, lean: .12 },
    curious: { bL: .1, bR: -.45, by: .06, mL: -.15, mR: .15, mw: .9, mh: 1, eye: 1.1, tilt: .25 },
    serious: { bL: -.15, bR: .15, by: 0, mL: 0, mR: 0, mw: .9, mh: .8, eye: 1 },
  };
  EMODEF.excited = EMODEF.joy; EMODEF.warm = EMODEF.happy; EMODEF.shocked = EMODEF.surprised;
  const EMOJI = { scared: '\u{1F631}', surprised: '\u{1F62E}', shocked: '\u{1F632}', angry: '\u{1F620}', sad: '\u{1F622}', joy: '\u{1F604}', excited: '\u{1F929}', worried: '\u{1F61F}', determined: '\u{1F4AA}', happy: '\u{1F60A}', warm: '\u{1F970}', relieved: '\u{1F60C}', curious: '\u{1F914}' };
  const emoTex = {};
  function emoSprite(p, name) {
    const em = EMOJI[name];
    if (!em) { if (p.emoS) p.emoS.visible = false; return; }
    if (!p.emoS) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false })); s.scale.set(1.5, 1.5, 1); s.position.y = 5.9; p.g.add(s); p.emoS = s; }
    if (!emoTex[name]) { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.font = '96px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(em, 64, 68); emoTex[name] = new THREE.CanvasTexture(c); }
    if (p.emoS.material.map !== emoTex[name]) { p.emoS.material.map = emoTex[name]; p.emoS.material.needsUpdate = true; }
    p.emoS.visible = true;
  }
  function emote(p, name, t, showEmoji) {
    const e = EMODEF[name] || EMODEF.neutral, f = p.face; if (!f) return;
    f.browL.rotation.z = e.bL; f.browR.rotation.z = e.bR; f.browL.position.y = f.browR.position.y = .3 + e.by;
    f.mouthL.rotation.z = e.mL; f.mouthR.rotation.z = e.mR; f.mouthL.visible = f.mouthR.visible = !e.open;
    f.mouthL.position.y = f.mouthR.position.y = -.22 + (e.mL < 0 ? .03 : e.mL > 0 ? -.02 : 0);
    p.mouth.scale.x *= e.mw; p.mouth.scale.y *= e.mh;
    f.eyeL.scale.set(e.eye > 1 ? e.eye : 1, e.eye, 1); f.eyeR.scale.set(e.eye > 1 ? e.eye : 1, e.eye, 1);
    f.tearL.visible = f.tearR.visible = !!e.tear; if (e.tear) { const k = (t * 1.6) % 1; f.tearL.position.y = f.tearR.position.y = -.05 - k * .4; f.tearL.scale.y = f.tearR.scale.y = .4 + k * .6; }
    f.sweat.visible = !!e.sweat; if (e.sweat) f.sweat.position.y = .45 - ((t * 1.2) % 1) * .3;
    if (e.head) p.head.rotation.x += e.head; if (e.lean) p.body.rotation.x += e.lean; if (e.tilt) p.head.rotation.z += e.tilt;
    if (e.shake) p.g.position.x += Math.sin(t * 45) * .04; if (e.bounce) p.g.position.y += Math.abs(Math.sin(t * 6 + p.g.id)) * .25;
    emoSprite(p, showEmoji ? name : null);
  }

  // ---------- emotes: while someone speaks they act it out with the same emotes the game has (wave, laugh, cry, cheer, bow, shrug ...) ----------
  const EMOTE_EMOJI = { wave: '\u{1F44B}', dance: '\u{1F483}', laugh: '\u{1F602}', salute: '\u{1FAE1}', facepalm: '\u{1F926}', cry: '\u{1F622}', bow: '\u{1F647}', point: '\u{1F449}', clap: '\u{1F44F}', spin: '\u{1F300}', flex: '\u{1F4AA}', shrug: '\u{1F937}', cheer: '\u{1F64C}', gasp: '\u{1F62E}', shiver: '\u{1F976}', sigh: '\u{1F62E}\u200D\u{1F4A8}' };
  const EMOTE_MAP = { joy: ['laugh', 'cheer', 'clap', 'dance'], excited: ['cheer', 'spin', 'clap'], happy: ['wave', 'clap', 'laugh'], warm: ['bow', 'wave'], sad: ['cry'], angry: ['point', 'flex'], scared: ['shiver'], shocked: ['gasp'], surprised: ['gasp'], worried: ['facepalm', 'shrug'], curious: ['shrug', 'point'], determined: ['flex', 'salute'], serious: ['point'], relieved: ['sigh', 'bow'] };
  function pickEmote(ln) {
    const t = String(ln.text || '').toLowerCase(), e = ln.emo || 'neutral';
    if (/^(hello|hi|hey|morning|good morning|welcome)\b/.test(t)) return 'wave';
    if (/thank|sorry|apolog/.test(t)) return 'bow';
    if (/we did it|we won|champion|hooray|woohoo|yes!|best (day|moment)/.test(t)) return 'cheer';
    if (/\bha\b|hee hee|funny|joke|laugh/.test(t)) return 'laugh';
    if (/oh no|this is bad|terrible/.test(t)) return 'facepalm';
    if (/\bready\b|on it|yes sir|at your service/.test(t)) return 'salute';
    if (/look at|over here|this way|look out|oh,? look|look there|look over|over there|there'?s a|what is that|what'?s that|is that a/.test(t) && e !== 'sad') return 'point';
    if (/\?\s*$/.test(t)) return 'shrug';
    const opts = EMOTE_MAP[e]; return opts ? opts[hash(t.length, (ln.start * 10) | 0, 2) % opts.length] : null;
  }
  const emoteMat = {};
  function emojiMat(em) {
    if (emoteMat[em]) return emoteMat[em];
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.font = '92px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(em, 64, 68);
    return (emoteMat[em] = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  }
  function applyEmote(p, kind, age) {
    const sn = Math.sin, t = age; const AL = p.armL, AR = p.armR;
    switch (kind) {
      case 'wave': AR.rotation.x = 2.6; AR.rotation.z = sn(t * 10) * .5; p.head.rotation.z = sn(t * 3) * .08; break;
      case 'laugh': p.body.rotation.x = .25 + sn(t * 18) * .12; p.head.rotation.x = -.4; AL.rotation.x = AR.rotation.x = -.9; p.mouth.scale.set(1.3, 3, 1); break;
      case 'cheer': AL.rotation.x = 2.6 + sn(t * 10) * .4; AR.rotation.x = 2.6 - sn(t * 10) * .4; p.g.position.y += Math.abs(sn(t * 7)) * .5; break;
      case 'clap': AL.rotation.x = AR.rotation.x = -1.3; AL.rotation.z = -(.35 + .35 * sn(t * 14)); AR.rotation.z = .35 + .35 * sn(t * 14); break;
      case 'cry': p.head.rotation.x = .5; AL.rotation.x = AR.rotation.x = 2.0; AL.rotation.z = .5; AR.rotation.z = -.5; p.body.rotation.z = sn(t * 20) * .05; break;
      case 'facepalm': AR.rotation.x = 2.4; AR.rotation.z = -.3; p.head.rotation.x = .35; break;
      case 'bow': p.body.rotation.x = .85 * (.5 + .5 * sn(t * 2.2 - 1)); AL.rotation.x = AR.rotation.x = .3; break;
      case 'point': AR.rotation.x = -1.5; p.body.rotation.x = .1; p.body.rotation.y = -.15; break;
      case 'spin': p.g.rotation.y += t * 9; break;
      case 'flex': AL.rotation.z = -1.3; AR.rotation.z = 1.3; AL.rotation.x = AR.rotation.x = 1.0; p.body.position.y += sn(t * 8) * .04; break;
      case 'shrug': AL.rotation.z = -.9; AR.rotation.z = .9; AL.rotation.x = AR.rotation.x = -.3; p.head.rotation.z = .2; p.body.position.y += Math.abs(sn(t * 5)) * .08; break;
      case 'salute': AR.rotation.x = 2.3; AR.rotation.z = -.5; p.body.rotation.x = -.05; break;
      case 'dance': p.body.rotation.z = sn(t * 7) * .15; AL.rotation.x = 1.5 + sn(t * 7) * 1.2; AR.rotation.x = 1.5 - sn(t * 7) * 1.2; p.legL.rotation.x = sn(t * 7) * .6; p.legR.rotation.x = -sn(t * 7) * .6; p.g.position.y += Math.abs(sn(t * 7)) * .3; break;
      case 'gasp': AL.rotation.x = AR.rotation.x = 2.2; AL.rotation.z = .5; AR.rotation.z = -.5; p.body.rotation.x = -.15; break;
      case 'shiver': AL.rotation.x = AR.rotation.x = -.9; AL.rotation.z = .8; AR.rotation.z = -.8; p.g.position.x += sn(t * 50) * .04; break;
      case 'sigh': AR.rotation.x = -.6; AR.rotation.z = -.5; p.head.rotation.x = -.3; p.body.rotation.x = -.08 + sn(t * 2) * .05; break;
    }
    const em = EMOTE_EMOJI[kind]; if (!em) return;
    for (let k = 0; k < 3; k++) {   // little emojis float up from their head
      const ag = (t * .9 + k * .33) % 1.4, sp = new THREE.Sprite(emojiMat(em)); sp.userData.shared = true;
      sp.position.set(p.g.position.x + Math.cos(k * 2.1 + t) * .9, p.g.position.y + 5.6 + ag * 1.2, p.g.position.z + Math.sin(k * 2.1 + t) * .5); sp.scale.setScalar(Math.max(.01, 1.0 * (1 - ag / 1.4))); fxGroup.add(sp);
    }
  }
  // ---------- settings: the place a scene happens in (picked from the caption, then from the movie itself) ----------
  const SETTING_RE = [
    ['library', /library|bookshel|\bbook\b|chapter|almanac/],
    ['hospital', /hospital|clinic|patient|nurse|sickbed|medicine|\bdoctor/],
    ['police', /police|\bbadge|patrol|arrest|\bstation\b/],
    ['cityhall', /city hall|\bmayor|\boak\b|election/],
    ['prison', /prison|\bjail|\bcell\b|warden|chisel|crooked stone/],
    ['airport', /airport|airplane|\bplane\b|runway|\bgates?\b|take ?off|flight|propeller/],
    ['suburbs', /suburb|\bporch|lamppost|streetlamp|lamp by lamp|neighbou?rs/],
    ['park', /\bpark\b|picnic|playground|\bbench|\bpond\b/],
    ['space', /space|planet|galax|rocket|orbit|\bstars?\b|asteroid|mothership|warp|comet|cosmic|universe|alien ship|scanner/],
    ['vault', /\bbank\b|vault|\bsafe\b|fingerprint|treasury|robber/],
    ['track', /\brace\b|\brace day|racing|\btrack\b|\blaps?\b|starting grid|slalom|circuit|finish line|pit stop|drivers?\b/],
    ['arena', /games\b|arena|stadium|tournament|scoreboard|medal|contestants|\bevent \d|finals?\b|champion/],
    ['dojo', /dojo|ninja training|training montage|sensei|martial|tea shop|\bclan\b|ninja academy|thunder kick/],
    ['temple', /temple|ancient|altar|shrine|church|chapel|candle|sacred|before explox|\bthe light\b/],
    ['castle', /castle|\bking\b|throne|palace|royal|\bcourt\b|kingdom/],
    ['snow', /\bsnow|winter|\bice\b|frozen|blizzard|freezing/],
    ['beach', /beach|ocean|\bsea\b|\bisland\b|harbor|\bpier\b|\bboat\b|waves?\b|sailing/],
    ['desert', /desert|frontier|canyon|saloon|outlaw|\bsand\b|sheriff|prairie|dusty|wild west|bounty|the sky starts/],
    ['jungle', /jungle|swamp|vines|rainforest/],
    ['scrapyard', /scrapyard|\bjunk\b|salvage|\bscrap\b|garage|workshop|robot battle|washing machine|toaster/],
    ['market', /market|\bstalls?\b|baker|baguette|bread|vendor|bazaar|merchant|fruit|carrots?/],
    ['lab', /\blab\b|laborator|time machine|experiment|portal|invent|machine/],
    ['school', /school|academy|classroom|student|lesson/],
    ['house', /\bhouse\b|\bhome\b|kitchen|\broom\b|\bbed\b|cabin|hospital|clinic|doorstep|inside|hideout|\bcafe\b|restaurant|curtain/],
    ['nature', /forest|woods|\bfield|farm|mountain|river|\blake\b|valley|garden|meadow|\bsky\b|cloud|wings|village|\boak\b|\btree\b/],
    ['city', /\bcity\b|street|\btown\b|building|alley|\broof|downtown|square|suburb|\bblock\b/],
  ];
  const MOVIE_SETTING = [
    [/wings over explox/i, 'airport'], [/doctor who stayed/i, 'hospital'], [/badge was made/i, 'police'], [/first mayor/i, 'cityhall'], [/wall that became/i, 'prison'],
    [/fist war|first war/i, 'suburbs'], [/one who dreamed|almanac/i, 'library'], [/arena's first/i, 'arena'], [/first coin/i, 'vault'],
    [/grand prix/i, 'track'], [/explox games/i, 'arena'], [/ninja academy|ninja grandma/i, 'dojo'], [/time travel/i, 'lab'], [/scrapyard/i, 'scrapyard'], [/market day/i, 'market'],
    [/dragon and the robot|wings over/i, 'nature'], [/robot dinosaurs|grandma in space|space/i, 'space'], [/first war|first wrath|doctor who stayed|wall that became|first house|first mayor|badge was made|arena's first|one who dreamed|newcomer/i, 'desert'],
  ];
  // the Explox history movies (the last 15) only ever happen in real Explox places
  const REAL_REMAP = { snow: 'suburbs', jungle: 'park', temple: 'suburbs', dojo: 'arena', lab: 'library', track: 'city', space: 'city', school: 'house', shop: 'market' };
  function pickKind(mi, mv, lc) {
    let k = null;
    for (const [kk, re] of SETTING_RE) if (re.test(lc)) { k = kk; break; }
    if (!k) for (const [re, kk] of MOVIE_SETTING) if (re.test(mv.title)) { k = kk; break; }
    if (!k) k = kindFor(mv, mi, '');
    if (mi >= 14 && REAL_REMAP[k]) k = REAL_REMAP[k];
    return k;
  }
  const PLACE_NAME = { space: 'Explox Space Dock', city: 'Downtown Explox', vault: 'Explox Bank', track: 'The Grand Prix Track', arena: 'The Fight Arena', dojo: 'The Dojo', temple: 'The Old Chapel', castle: 'The Royal Court', snow: 'The Snowy Hills', beach: 'Explox Beach', desert: 'Old Explox, the Frontier', jungle: 'The Jungle', scrapyard: 'The Scrapyard', market: 'The Mall', lab: 'The Time Lab', school: 'Explox School', house: 'A House in Explox', shop: 'An Explox Shop', nature: 'The Explox Countryside', airport: 'Explox Airport', library: 'The Explox Library', hospital: 'Explox General Hospital', police: 'The Police Station', cityhall: 'City Hall', prison: 'Explox Prison', suburbs: 'The Suburbs', park: 'The Park' };
  const placeNameFor = (mv, kind) => (kind === 'arena' && /games/i.test(mv.title)) ? 'The Explox Sports Park' : (PLACE_NAME[kind] || 'Explox');
  const INDOOR = { vault: 1, shop: 1, dojo: 1, lab: 1, house: 1, school: 1, library: 1, hospital: 1, police: 1, prison: 1 };
  function todOf(lc) {
    if (/storm|thunder|lightning|\brain|flood/.test(lc)) return 'storm';
    if (/night|midnight|\bdark|2am|\bmoon|shadow|ghost|haunt|silent|dim\b/.test(lc)) return 'night';
    if (/dawn|sunrise|morning/.test(lc)) return 'dawn';
    if (/dusk|evening|sunset|twilight|lamp by lamp|lantern/.test(lc)) return 'dusk';
    return 'day';
  }
  function weatherOf(lc, kind, tod) {
    if (/\brain|storm|thunder|flood|\bwet\b/.test(lc)) return 'rain';
    if (kind === 'snow' || /\bsnow|blizzard|winter/.test(lc)) return 'snow';
    if (/\bfire\b|flame|burn|torch|candle|ember/.test(lc)) return 'embers';
    if (kind === 'desert') return 'dust';
    if (tod === 'night' && (kind === 'nature' || kind === 'jungle' || kind === 'beach')) return 'fireflies';
    return null;
  }
  function buildExtraStage(kind, seed) {
    const g = new THREE.Group(), r = rnd(seed), b = (w, h, d, c, x, y, z, o) => box(g, w, h, d, c, x, y, z, o), E = (c) => ({ emissive: c });
    const room = (wallC, floorC, h) => {
      b(70, .6, 60, floorC, 0, -.3, -4); b(70, h, 1, wallC, 0, h / 2, -26); b(1, h, 60, wallC, -35, h / 2, -4); b(1, h, 60, wallC, 35, h / 2, -4); b(70, 1, 60, 0x3a3028, 0, h + .5, -4);
      for (let i = -2; i <= 2; i++) b(3.4, .5, 3.4, 0xfff1c0, i * 11, h - .3, -8, E(0xffe9a0));
    };
    switch (kind) {
      case 'airport': {
        b(170, .6, 120, 0x3b3f45, 0, -.35, -10); for (let i = -12; i <= 12; i++) b(5, .1, .8, 0xffffff, i * 7, .02, 10);
        b(90, 12, 16, 0xcfd8e3, -10, 6, -52); b(88, 6, .4, 0x7fb6e8, -10, 7, -43.6, E(0x335577)); b(100, 1, 20, 0x5f6b78, -10, 12.5, -52);
        b(5, 26, 5, 0xe0e5ea, 48, 13, -50); b(10, 4, 10, 0x7fb6e8, 48, 27, -50, E(0x335577)); b(11, 1, 11, 0xd32f2f, 48, 29.4, -50);
        b(26, 3.2, 3.2, 0xf8f8f8, 14, 3.4, -18); const nose = new THREE.Mesh(new THREE.ConeGeometry(1.7, 5, 12), mat(0xf8f8f8)); nose.rotation.z = -Math.PI / 2; nose.position.set(29.6, 3.4, -18); g.add(nose);
        b(4, .3, 22, 0xdde3ea, 14, 2.6, -18); b(3, 6, .4, 0xd32f2f, -1.5, 6.4, -18); b(3, .3, 8, 0xdde3ea, -1.5, 5.4, -18); b(26, .5, 3.4, 0x1e88e5, 14, 3.4, -18.2);
        for (let i = 0; i < 8; i++) b(5, 3, 2.6, [0xe53935, 0x43a047, 0xfdd835, 0x1e88e5][i % 4], -42 + i * 6.2, 1.5, -34); for (let i = 0; i < 8; i++) b(3.6, 1.6, .3, 0xffffff, -34 + i * 11, 10, -43.3, E(0x445566)); break; }
      case 'library': { room(0x6b4a30, 0x5a3b24, 18);
        for (let x = -3; x <= 3; x++) { b(7, 14, 2, 0x4a2f1c, x * 9, 7, -24); for (let y = 0; y < 5; y++) for (let k = 0; k < 6; k++) b(.8, 2, 1.4, [0xc62828, 0x1565c0, 0xf9a825, 0x2e7d32, 0x6a1b9a, 0xff7043][(x + k + y + 9) % 6], x * 9 - 2.8 + k * 1.1, 2 + y * 2.7, -22.8); }
        for (let i = 0; i < 3; i++) { b(8, .4, 3.4, 0x8d6e63, -14 + i * 14, 2.6, -8); b(.4, 2.4, .4, 0x5d4037, -17 + i * 14, 1.2, -8); b(.4, 2.4, .4, 0x5d4037, -11 + i * 14, 1.2, -8); b(.8, 1.4, .8, 0x2e7d32, -14 + i * 14, 3.6, -8, E(0x114411)); }
        const gl = new THREE.Mesh(new THREE.SphereGeometry(1.8, 14, 10), mat(0x3a7bd5, E(0x112244))); gl.position.set(26, 3.6, -10); g.add(gl); b(.3, 2, .3, 0x8d6e63, 26, 1, -10); break; }
      case 'hospital': { room(0xf2f6f8, 0xcfe3ea, 14);
        for (let i = 0; i < 4; i++) { b(4.4, 1.2, 8, 0xffffff, -24 + i * 14, 1.6, -18); b(4.6, 1.3, 5.2, 0x5aa9e6, -24 + i * 14, 2, -16.4); b(4.4, 3, .3, 0xb0bec5, -24 + i * 14, 2.4, -22); b(2.2, 1.6, .2, 0x66ffcc, -22.4 + i * 14, 5, -22.5, E(0x118866)); }
        b(1.6, 6, .4, 0xd32f2f, 0, 9, -25.2, E(0x660000)); b(6, 1.6, .4, 0xd32f2f, 0, 9, -25.2, E(0x660000)); for (let i = 0; i < 3; i++) b(.4, 7, 7, 0x9ec7e8, -30 + i * 0, 4, -4 + i * 8); break; }
      case 'police': { room(0x3d4a63, 0x2a2f3a, 14);
        b(18, 3, 4, 0x5d4037, 0, 1.5, -14); b(4, 1.2, 2, 0x222222, -4, 3.5, -14, E(0x113322)); b(8, 6, .3, 0x8d6e63, -22, 7, -25); b(4, 5, .3, 0xfff8e1, -22, 7, -24.7); for (let i = 0; i < 4; i++) b(3, 1.2, .1, 0x222222, -23.5 + (i % 2) * 3, 6 + Math.floor(i / 2) * 2, -24.5);
        b(7, 6, 3, 0x37474f, 24, 3, -22); b(6, 4.6, .3, 0x9ad0ff, 24, 3.4, -20.4, E(0x224466)); const bd = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, .3, 6), mat(0xffd54f, E(0xaa7700))); bd.rotation.x = Math.PI / 2; bd.position.set(24, 3.6, -20.2); g.add(bd); b(10, 1.2, .3, 0x1e63c9, 0, 11, -25.3, E(0x112255)); break; }
      case 'cityhall': {
        b(150, .6, 110, 0x9b9488, 0, -.35, -10); for (let i = 0; i < 6; i++) b(54 - i * 6, .7, 28 - i * 2.4, 0xb9b3a6, 0, .3 + i * .7, -34);
        b(40, 20, 16, 0xe6dfd0, 0, 12, -46); for (let i = -4; i <= 4; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 16, 12), mat(0xf4efe4)); c.position.set(i * 4.4, 8.2, -37.6); g.add(c); } b(44, 2, 6, 0xcfc8b8, 0, 22, -40);
        b(10, 14, 10, 0xe6dfd0, 0, 29, -46); b(5, 5, .5, 0xffffff, 0, 31, -40.8, E(0x555555)); const cn = new THREE.Mesh(new THREE.ConeGeometry(7, 7, 4), mat(0x3b6ea5)); cn.position.set(0, 39.5, -46); cn.rotation.y = Math.PI / 4; g.add(cn);
        b(2.4, 12, 2.4, 0x6d4c41, -26, 6, -14); b(14, 9, 14, 0x2e7d32, -26, 15, -14); b(10, 7, 10, 0x388e3c, -26, 21, -14); b(.3, 22, .3, 0xcccccc, 26, 11, -16); b(5, 3, .2, 0xe53935, 28.5, 20.5, -16); break; }
      case 'prison': { room(0x58534b, 0x3b3833, 14);
        for (let i = 0; i < 22; i++) b(.3, 11, .3, 0x222222, -26 + i * 2.4, 5.5, -10); b(60, .5, .5, 0x222222, 0, 10.5, -10); b(60, .5, .5, 0x222222, 0, .4, -10); b(5, 1.4, 9, 0x6d6a60, -22, .9, -20); b(5, .6, 9, 0x8d8a80, -22, 1.8, -20);
        b(5, 6, .6, 0x1a1a1a, 14, 8, -25.4); b(3.6, 4.4, .4, 0xfff3b0, 14, 8, -25.1, E(0xddc04a)); const ray = new THREE.Mesh(new THREE.BoxGeometry(3.4, .2, 16), new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: .22 })); ray.position.set(14, 3.4, -17); ray.rotation.x = .38; g.add(ray); break; }
      case 'suburbs': {
        b(160, .6, 100, 0x4f7f3b, 0, -.35, -10); b(160, .5, 14, 0x3a3d44, 0, -.2, 8); for (let i = -12; i <= 12; i++) b(3, .1, .6, 0xffee88, i * 6.4, .02, 8);
        for (let i = -6; i <= 6; i++) { const c = [0xf1d6a8, 0xe6a07a, 0xb7d3e8, 0xd9c2e6, 0xc9e0b0][(i + 6) % 5], x = i * 11; b(7, 5, 6, c, x, 2.5, -20); const r = new THREE.Mesh(new THREE.ConeGeometry(5.6, 3, 4), mat(0x8b3a2f)); r.position.set(x, 6.5, -20); r.rotation.y = Math.PI / 4; g.add(r); b(1.2, 2.4, .2, 0x5d4037, x, 1.2, -16.9); b(1.4, 1.4, .2, 0xffee99, x + 2, 3, -16.9, E(0x998833)); b(1.4, 1.4, .2, 0xffee99, x - 2, 3, -16.9, E(0x998833)); for (let k = -3; k <= 3; k++) b(.3, 1.4, .3, 0xffffff, x + k * 1.0, .7, -12); b(.5, .5, .5, 0xfff1a8, x + 3, 2.4, -16.7, E(0xaa8833)); }
        for (let i = -4; i <= 4; i++) { b(.3, 7, .3, 0x333333, i * 16, 3.5, 1.4); b(1.2, .9, 1.2, 0xffe9a0, i * 16, 7.3, 1.4, E(0xbb9933)); } break; }
      case 'park': {
        const gr = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, .6, 40), mat(0x59a14a)); gr.position.y = -.3; g.add(gr);
        const pd = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, .2, 28), mat(0x4aa3e0)); pd.position.set(-22, .05, -22); g.add(pd);
        b(120, .15, 5, 0xd9c6a0, 0, .05, -4); for (let i = 0; i < 5; i++) { b(4, .5, 1.4, 0x8d6e63, -30 + i * 14, 1.2, -9); b(4, 1.2, .3, 0x8d6e63, -30 + i * 14, 2, -9.6); }
        for (let i = 0; i < 26; i++) { const x = (r() - .5) * 120, z = -26 - r() * 30; b(1, 4, 1, 0x6d4c41, x, 2, z); b(5, 4, 5, 0x2e7d32 + (i % 3) * 0x0a1400, x, 6, z); } for (let i = 0; i < 16; i++) b(.5, 1.8, .5, [0xe53935, 0xfdd835, 0xab47bc][i % 3], (r() - .5) * 60, .9, -10 - r() * 10); break; }
      case 'vault': { room(0x59636e, 0x2a3036, 16);
        const d = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 1.2, 28), mat(0x9aa7b3, E(0x111820))); d.rotation.x = Math.PI / 2; d.position.set(0, 7, -25); g.add(d);
        const w = new THREE.Mesh(new THREE.TorusGeometry(4.2, .4, 8, 24), mat(0xffd54f, E(0x886600))); w.position.set(0, 7, -24.2); g.add(w); b(.8, 6, .8, 0xffd54f, 0, 7, -24, E(0x886600)); b(6, .8, .8, 0xffd54f, 0, 7, -24, E(0x886600));
        for (let i = 0; i < 18; i++) b(2.2, 1, 1.2, 0xffd54f, -26 + (i % 6) * 2.6, .5 + Math.floor(i / 6) * 1.05, -21 + (i % 2), E(0x886600));
        for (let x = -3; x <= 3; x++) for (let y = 0; y < 3; y++) { b(2.4, 1.6, .3, 0x7a8794, 26 + x * 0.0, 2 + y * 1.8, -25.4); }
        break; }
      case 'dojo': { room(0xe8dcc0, 0x9a6b3b, 14);
        for (let i = -2; i <= 2; i++) { b(8, .15, 8, 0xd7c28a, i * 9, .1, -2); b(.5, 3, .5, 0xcc2222, i * 12, 8, -25, E(0x661111)); }
        b(10, 5, .4, 0x8d1b1b, 0, 8, -25.3); for (let i = 0; i < 4; i++) { b(.15, 5, .15, 0x6d4c41, -28 + i * .8, 3, -22); b(.5, .5, .5, 0xcccccc, -28 + i * .8, 5.6, -22); } break; }
      case 'lab': { room(0x394455, 0x1f2730, 16);
        for (let i = -3; i <= 3; i++) { b(5, 2.2, 3, 0x56667d, i * 9, 1.1, -22); b(4, 2, .3, 0x66ffcc, i * 9, 3.4, -21, E(0x118866)); }
        for (let i = 0; i < 5; i++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 8, 14), mat(0x66ddff, { emissive: 0x2288aa, transparent: true, opacity: .55 })); t.position.set(-24 + i * 4, 4, -16); g.add(t); }
        const c = new THREE.Mesh(new THREE.TorusGeometry(3, .35, 8, 28), mat(0xffffff, E(0x445566))); c.position.set(26, 9, -25); g.add(c); b(.2, 2.2, .2, 0x222222, 26, 9.6, -24.8); b(1.6, .2, .2, 0x222222, 26.6, 9, -24.8); break; }
      case 'house': { room(0xd7b98e, 0x8a6a4a, 14);
        b(10, 3.4, 4, 0x7b4a3a, -22, 1.7, -20); b(10, 1, 3.6, 0xf2e8d8, -22, 3.6, -20); b(8, .5, 5, 0x6d4c41, 18, 2.6, -20); [-1, 1].forEach(x => b(.5, 2.6, .5, 0x6d4c41, 18 + x * 3.4, 1.3, -20));
        b(7, 5, 1, 0x6d4c41, 0, 2.5, -25); b(4.2, 2.8, .4, 0xff7a2a, 0, 1.5, -24.4, E(0xaa3300)); b(8, 5, .3, 0x88ccff, 22, 8, -25.4, E(0x223344)); break; }
      case 'school': { room(0xe8e1c8, 0x8f7a5a, 14);
        b(22, 7, .3, 0x1d3a2b, 0, 8, -25.3); for (let rz = 0; rz < 3; rz++) for (let cx = -3; cx <= 3; cx++) { b(3, .2, 2, 0xb2824a, cx * 7, 2.2, -12 + rz * 6); b(.3, 2.1, .3, 0x555555, cx * 7, 1, -12 + rz * 6); } break; }
      case 'shop': { room(0x8a5a3a, 0x6b4a30, 14);
        for (let i = 0; i < 4; i++) { b(8, 8, 1.6, 0x5a3b24, -26 + i * 17, 4, -24); for (let k = 0; k < 4; k++) b(1.4, 1.2, 1, [0xe53935, 0x43a047, 0xfdd835, 0x1e88e5][(i + k) % 4], -29 + i * 17 + k * 2, 2 + k * 1.8 % 4, -22.8); }
        b(16, 3, 3, 0x4a2f1c, 0, 1.5, -12); break; }
      case 'track': {
        b(160, .6, 70, 0x3f7f3a, 0, -.35, -10); b(160, .5, 20, 0x2e3035, 0, -.2, 2);
        for (let i = -16; i <= 16; i++) { b(4, .6, .7, i % 2 ? 0xe53935 : 0xffffff, i * 4.8, 0, 12.4); b(4, .6, .7, i % 2 ? 0xe53935 : 0xffffff, i * 4.8, 0, -8.4); }
        for (let i = 0; i < 10; i++) b(1.6, .1, 20, 0xffffff, -34 + i * 0 + (i % 2) * 1.6, .06, 2); for (let k = 0; k < 14; k++) b(1.6, .1, 1.6, k % 2 ? 0x111111 : 0xffffff, -36 + (k % 2) * 1.6, .07, -7 + k * 1.4);
        for (let s = 0; s < 6; s++) for (let row = 0; row < 5; row++) b(24, 1.1, 2.4, [0xc62828, 0x1565c0, 0xf9a825, 0x2e7d32][(s + row) % 4], -60 + s * 24, .55 + row * 1.2, -18 - row * 2.4);
        for (let i = 0; i < 80; i++) b(.8, .8, .8, [0xff8a65, 0xffcc80, 0x80deea, 0xce93d8][i % 4], -62 + r() * 124, 1.5 + Math.floor(r() * 5) * 1.2, -18 - Math.floor(r() * 5) * 2.4);
        for (let i = -6; i <= 6; i++) { b(.4, 4, .4, 0x888888, i * 12, 2, 16); b(8, 1.6, .2, [0xe53935, 0x1e88e5, 0xfdd835][(i + 6) % 3], i * 12, 5, 16); } break; }
      case 'arena': {
        const fl = new THREE.Mesh(new THREE.CylinderGeometry(26, 26, .6, 40), mat(0x4f9a3f)); fl.position.y = -.3; g.add(fl); const ring = new THREE.Mesh(new THREE.TorusGeometry(15, .25, 6, 44), mat(0xffffff)); ring.rotation.x = Math.PI / 2; ring.position.y = .05; g.add(ring);
        for (let k = 0; k < 6; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(28 + k * 2.6, 28 + k * 2.6, 1.3, 40, 1, true), new THREE.MeshLambertMaterial({ color: [0xb71c1c, 0x1565c0, 0xf9a825, 0x2e7d32, 0x6a1b9a, 0xff7043][k], side: THREE.DoubleSide })); c.position.y = .65 + k * 1.3; g.add(c); }
        for (let i = 0; i < 4; i++) { const a = i * 1.57 + .78; b(.8, 18, .8, 0x777777, Math.cos(a) * 34, 9, Math.sin(a) * 34); b(3.4, 1.4, 1.4, 0xffffee, Math.cos(a) * 34, 18.4, Math.sin(a) * 34, E(0xffeeaa)); }
        for (let i = 0; i < 160; i++) { const a = r() * 6.283, rr = 29 + r() * 14; b(.7, .7, .7, [0xff8a65, 0xffcc80, 0x80deea, 0xce93d8, 0xffffff][i % 5], Math.cos(a) * rr, 1.7 + Math.floor((rr - 28) / 2.6) * 1.3, Math.sin(a) * rr); } break; }
      case 'desert': {
        const gr = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, .6, 40), mat(0xe0c27a)); gr.position.y = -.3; g.add(gr);
        for (let i = 0; i < 8; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(10 + r() * 8, 14, 10), mat(0xd9b562)); d.scale.y = .35; d.position.set(-60 + i * 17, -1, -48 - r() * 14); g.add(d); }
        for (let i = 0; i < 12; i++) { const x = (r() - .5) * 80, z = -34 - r() * 22; b(.8, 3.4, .8, 0x2e7d32, x, 1.7, z); b(.5, 1.4, .5, 0x2e7d32, x + .9, 2.4, z); b(.5, 1.2, .5, 0x2e7d32, x - .9, 2.6, z); }
        for (let i = 0; i < 4; i++) { const x = -36 + i * 24; b(14, 7, 8, 0x9c6b3a, x, 3.5, -40); b(15, .6, 9, 0x6d4c41, x, 7.3, -40); b(4, 5, .3, 0x4e342e, x, 2.5, -35.8); }
        for (let i = 0; i < 14; i++) b(2 + r() * 3, 1.6 + r() * 2.4, 2 + r() * 3, 0x8d7b68, (r() - .5) * 110, .9, -26 - r() * 40); break; }
      case 'snow': {
        const gr = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, .6, 40), mat(0xf4f8ff)); gr.position.y = -.3; g.add(gr);
        for (let i = 0; i < 7; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(12 + r() * 8, 14, 10), mat(0xe8f0fa)); h.scale.y = .6; h.position.set(-54 + i * 18, -2, -46 - r() * 10); g.add(h); }
        for (let i = 0; i < 34; i++) { const x = (r() - .5) * 100, z = -26 - r() * 34, h = 5 + r() * 5; b(.8, 2, .8, 0x6d4c41, x, 1, z); const c = new THREE.Mesh(new THREE.ConeGeometry(2.4, h, 8), mat(0x1f6b45)); c.position.set(x, 2 + h / 2, z); g.add(c); const sn = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.6, 8), mat(0xffffff)); sn.position.set(x, 2 + h - .4, z); g.add(sn); } break; }
      case 'beach': {
        b(120, .6, 60, 0xf0d9a0, 0, -.3, 6); const w = new THREE.Mesh(new THREE.BoxGeometry(220, .5, 90), new THREE.MeshLambertMaterial({ color: 0x2f9de3, transparent: true, opacity: .85 })); w.position.set(0, -.2, -60); g.add(w);
        for (let i = 0; i < 12; i++) { const x = (r() - .5) * 90, z = -10 - r() * 18, h = 7 + r() * 4; b(.7, h, .7, 0x8d6e63, x, h / 2, z); for (let k = 0; k < 5; k++) b(.4, .3, 4, 0x2e9a3a, x, h + .2, z).rotation.y = k * 1.26; }
        const sn = new THREE.Mesh(new THREE.SphereGeometry(4, 14, 10), mat(0xffee66, E(0xaa8800))); sn.position.set(26, 24, -70); g.add(sn); break; }
      case 'jungle': {
        const gr = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, .6, 40), mat(0x1f5a2a)); gr.position.y = -.3; g.add(gr);
        for (let i = 0; i < 40; i++) { const x = (r() - .5) * 110, z = -24 - r() * 40, h = 10 + r() * 10; b(1.2, h, 1.2, 0x5b3d26, x, h / 2, z); b(7, 3, 7, 0x1e6b2c, x, h + 1, z); b(5, 2, 5, 0x2a8a3a, x + 1, h + 3, z); }
        for (let i = 0; i < 24; i++) b(.15, 8 + r() * 6, .15, 0x2c7a38, (r() - .5) * 80, 10, -20 - r() * 30); for (let i = 0; i < 20; i++) { const l = b(5, .15, 2.4, 0x3aa84a, (r() - .5) * 60, 1 + r() * 3, -12 - r() * 16); l.rotation.set(.3, r() * 3, .2); } break; }
      case 'scrapyard': {
        const gr = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, .6, 40), mat(0x6e5a44)); gr.position.y = -.3; g.add(gr);
        for (let i = 0; i < 30; i++) b(2 + r() * 5, 1.5 + r() * 5, 2 + r() * 5, [0x8d6e63, 0x607d8b, 0xb0463a, 0x78909c, 0xc9a227][i % 5], (r() - .5) * 90, 1, -16 - r() * 36);
        for (let i = 0; i < 16; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(1.1, .5, 8, 16), mat(0x222222)); t.position.set((r() - .5) * 60, 1.2 + Math.floor(r() * 3) * 1, -8 - r() * 24); t.rotation.set(r(), r(), r()); g.add(t); }
        b(1.2, 22, 1.2, 0xd9a21b, 30, 11, -30); b(22, 1, 1, 0xd9a21b, 20, 22, -30); b(.2, 12, .2, 0x333333, 10, 16, -30); b(2.6, 2, 2.6, 0x777777, 10, 9, -30); break; }
      case 'market': {
        const gr = new THREE.Mesh(new THREE.BoxGeometry(120, .6, 90), mat(0x8a8176)); gr.position.set(0, -.3, -8); g.add(gr);
        for (let i = 0; i < 7; i++) { const x = -42 + i * 14; b(8, 1, 4, 0x8d6e63, x, 2.2, -24); [-1, 1].forEach(s2 => b(.4, 5, .4, 0x6d4c41, x + s2 * 3.8, 2.5, -22.2)); b(9, .5, 6, [0xe53935, 0x43a047, 0xfdd835, 0x1e88e5, 0xab47bc, 0xff7043, 0x26c6da][i], x, 5.4, -23.4);
          for (let k = 0; k < 6; k++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.5, 8, 6), mat([0xe53935, 0xfb8c00, 0x7cb342, 0xfdd835][(i + k) % 4])); f.position.set(x - 3 + k * 1.2, 3.2, -24); g.add(f); } }
        for (let i = 0; i < 16; i++) b(2, 1.6, 2, 0x9b7a4c, (r() - .5) * 90, .8, -30 - r() * 16);
        for (let i = -7; i <= 7; i++) b(.5, .5, .5, 0xffee99, i * 6, 8 + Math.sin(i) * .6, -18, E(0xaa8833)); break; }
      case 'castle': {
        b(110, .6, 90, 0x8b8b8b, 0, -.3, -8); b(100, 12, 3, 0x8d8a85, 0, 6, -40); for (let i = -16; i <= 16; i++) b(2, 2, 3, 0x8d8a85, i * 3, 13, -40);
        [-50, 50].forEach(x => { const t = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.5, 26, 14), mat(0x9a9791)); t.position.set(x, 13, -36); g.add(t); const c = new THREE.Mesh(new THREE.ConeGeometry(7.5, 8, 14), mat(0xb23b2e)); c.position.set(x, 30, -36); g.add(c); });
        b(14, 16, 3, 0x7a756f, 0, 8, -39); b(7, 9, 1, 0x3e2a1a, 0, 4.5, -37.3); for (let i = 0; i < 5; i++) { b(.4, 7, .4, 0x555555, -24 + i * 12, 3.5, -34); b(3, 5, .2, [0xc62828, 0x1565c0, 0xfdd835][i % 3], -24 + i * 12, 8, -34); b(.6, .6, .6, 0xffaa33, -24 + i * 12, 1.6, -32, E(0xaa5500)); } break; }
      case 'temple': {
        b(70, .6, 60, 0x8f8a80, 0, -.3, -6); for (let i = 0; i < 5; i++) b(46 - i * 6, .6, 30 - i * 4, 0xa59f93, 0, .3 + i * .6, -30); for (let i = -4; i <= 4; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 16, 12), mat(0xcfc8b8)); c.position.set(i * 9, 8, -36); g.add(c); } b(80, 2, 6, 0xb5ae9e, 0, 17, -36);
        b(4, 3.4, 4, 0x6d6a60, 0, 3.2, -26); b(2, .6, 2, 0xffd54f, 0, 5.2, -26, E(0xaa7700)); for (let i = 0; i < 6; i++) { b(1.2, 3, 1.2, 0x555555, -24 + i * 9.6, 1.5, -20); b(1.6, 1, 1.6, 0xff9a33, -24 + i * 9.6, 3.4, -20, E(0xaa4400)); } break; }
    }
    return g;
  }
  function buildAnyStage(kind, skyTop, seed) {
    if (kind === 'space' || kind === 'city' || kind === 'nature') return buildStage(kind, 0xff7733, skyTop, seed);
    return buildExtraStage(kind, seed);
  }
  // weather and floating bits
  const wGeo = new THREE.BoxGeometry(1, 1, 1), wMat = {};
  const wM = (c) => wMat[c] || (wMat[c] = new THREE.MeshBasicMaterial({ color: c }));
  function wMesh(sx, sy, sz, c, x, y, z) { const m = new THREE.Mesh(wGeo, wM(c)); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.userData.shared = true; fxGroup.add(m); return m; }
  function weatherFx(t, info) {
    const w = info.weather; if (!w) return;
    if (w === 'rain') for (let i = 0; i < 150; i++) wMesh(.04, .9, .04, 0xbcd4ff, ((i * 7.31) % 40) - 20, 14 - ((t * 17 + i * 1.7) % 15), ((i * 3.7) % 26) - 14).rotation.z = .15;
    else if (w === 'snow') for (let i = 0; i < 130; i++) wMesh(.13, .13, .13, 0xffffff, ((i * 5.13) % 36) - 18 + Math.sin(t + i) * .6, 12 - ((t * 2.2 + i * .37) % 13), ((i * 2.9) % 24) - 12);
    else if (w === 'fireflies') for (let i = 0; i < 34; i++) wMesh(.12, .12, .12, 0xeaff66, ((i * 6.1) % 30) - 15 + Math.sin(t * .8 + i) * 1.4, 1.2 + (i % 5) * .9 + Math.sin(t * 1.3 + i) * .4, ((i * 3.3) % 20) - 12);
    else if (w === 'dust') for (let i = 0; i < 50; i++) wMesh(.12, .12, .12, 0xd7b878, ((t * 3 + i * 2.3) % 44) - 22, 1 + (i % 6) * .7, ((i * 3.1) % 22) - 12);
    else if (w === 'embers') for (let i = 0; i < 44; i++) wMesh(.1, .1, .1, i % 2 ? 0xff8a1f : 0xffd54f, ((i * 1.7) % 8) - 4 + Math.sin(t * 2 + i) * .5, ((t * 2.2 + i * .61) % 8), ((i * 2.3) % 6) - 3);
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
    if (mv.cast) return [mv.cast.A.kind, mv.cast.B.kind, mv.cast.C.kind];
    if (!fnKind) fnKind = FN_KIND();
    const vis = (typeof _MVIS !== 'undefined') ? _MVIS[mi] : null; const tags = tagsFor(mv);
    const a = (vis && fnKind.get(vis[3])) || tags[0] || 'hero', b = (vis && fnKind.get(vis[4])) || tags[1] || 'robot';
    return [a, b === a ? (tags.find(t => t !== a) || 'hero') : b, tags.find(t => t !== a && t !== b) || 'hero'];
  }

  // ---------- reading a scene's caption ----------
  const sceneInfoCache = {};
  function verbStyle(t, mi, si, strict) {
    if (/fight|battle|attack|punch|kick|strike|clash|duel|defend|brawl|war\b|fist/.test(t)) return 'fight';
    if (/\b(run|runs|running|ran|race|races|racing|chase|chases|chasing|escape|escapes|rush|rushes|flee|flees|fleeing|sprint|sprints|speed|speeds)\b/.test(t)) return 'run';
    if (/\b(launch|launches|launched|fly|flies|flying|flight|soar|soars|wings|take off|takes off|orbit|orbits|warp|cruise|cruising)\b/.test(t)) return 'fly';
    if (/\b(dance|dances|danced|dancing|disco|twirl|twirls|groove|boogie)\b/.test(t)) return 'dance';
    if (/high.?five|\b(hug|hugs|hugged|reunite|reunited|reunion|congratulat\w*)\b/.test(t)) return 'highfive';
    if (/\b(sing|sings|sang|singing|song|songs|concert|singer|karaoke|choir)\b/.test(t)) return 'sing';
    if (/dance|party|celebrat|cheer|victory|win\b|wins\b|festival|hooray|finally|parade|laugh|joke/.test(t)) return 'party';
    if (/sneak|creep|tiptoe|secret|hid\b|hide|hiding|silent|quiet|search|investigat|follow/.test(t)) return 'sneak';
    if (/scream|panic|afraid|scared|terrified|horror|run for|trembl/.test(t)) return 'panic';
    if (/\b(fish|fishes|fishing|pond|angler)\b/.test(t)) return 'fish';
    if (/\b(camp|camping|campfire|marshmallow|marshmallows|bonfire)\b/.test(t)) return 'camp';
    if (/\b(magic|magician|wand|spell|spells|abracadabra|trick|tricks)\b/.test(t)) return 'magic';
    if (/\b(bubble|bubbles|soap)\b/.test(t)) return 'bubbles';
    if (/\b(photo|photos|picture|pictures|camera|selfie|smile)\b/.test(t)) return 'photo';
    if (/\b(skate|skates|skateboard|scooter|surf|surfs|skating)\b/.test(t)) return 'skate';
    if (/\b(snow|snowball|snowballs|snowman|snowy)\b/.test(t)) return 'snowball';
    if (/\b(juggle|juggles|juggling|circus|clown)\b/.test(t)) return 'juggle';
    if (/\b(tug|pull|pulls|pulling|tug-of-war)\b/.test(t)) return 'tugwar';
    if (/\b(cook|cooks|cooking|bake|bakes|baking|kitchen|chef|stir|stirs|oven)\b/.test(t)) return 'cook';
    if (/\b(drum|drums|drummer|band|guitar|rock|bass)\b/.test(t)) return 'drum';
    if (/\b(block|blocks|stack|stacks|tower|towers|brick|bricks|lego)\b/.test(t)) return 'build';
    if (/\b(jump|jumps|jumped|leap|leaps|leapt|hop|hops|vault|vaults|parkour|hurdle|hurdles|bounce|bounces)\b/.test(t)) return 'jump';
    if (/\b(climb|climbs|climbed|climbing|ladder|ladders|scale|scales|cliff|cliffs|rope|ropes|ascend|ascends)\b/.test(t)) return 'climb';
    if (/\b(dig|digs|dug|digging|shovel|plant|plants|planted|garden|gardens|bury|buried|treasure|farm|farms|seed|seeds)\b/.test(t)) return 'dig';
    if (/\b(catch|catches|throw|throws|threw|toss|tosses|ball|balls|soccer|football|basketball|frisbee|play|plays|playing)\b/.test(t)) return 'play';
    if (/\b(eat|eats|ate|eating|lunch|dinner|breakfast|feast|snack|snacks|taste|tastes|bite|bites|hungry|dessert|picnic|meal|cake|soup)\b/.test(t)) return 'eat';
    if (/\b(paint|paints|painted|painting|draw|draws|drew|drawing|write|writes|wrote|written|sketch|canvas|artist|mural|read|reads|reading|book|books)\b/.test(t)) return 'write';
    if (/\b(train|trains|trained|training|exercise|exercises|practice|practices|practiced|workout|stretch|stretches|lift|lifts|lifting|muscle|muscles|gym|strong|stronger|push-ups?)\b/.test(t)) return 'exercise';
    if (/\b(buy|buys|bought|pay|pays|paid|coin|coins|money|shop|shops|store|sell|sells|sold|trade|trades|price|prices|cash|rich|richest)\b/.test(t)) return 'shop';
    if (/scan|look|watch|spot|notice|stare|gaze|horizon|wonder|realiz|discover|find|found/.test(t)) return 'look';
    if (/build|hammer|raise|rises|construct|work|craft|cook|bake|fix|repair/.test(t)) return 'work';
    if (/walk|march|travel|journey|arrive|head to|heads to|steps|stroll|enter|leav|return|wander/.test(t)) return 'walk';
    if (/meet|talk|say|says|ask|speak|tell|warn|call|plan|council|decid|learn|teach|train|whisper|shout|speech|announce|promise|\"/.test(t)) return 'talk';
    return strict ? null : ['talk', 'look', 'walk'][hash(mi, si, 4) % 3];
  }
  function getInfo(mi, si, mv, sc) {
    const key = mi + '_' + si; if (sceneInfoCache[key]) return sceneInfoCache[key];
    if (sc.script) { const sI = scriptInfo(mi, si, mv, sc); sceneInfoCache[key] = sI; return sI; }
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
    let kind = pickKind(mi, mv, lc);
    const dark = /night|dark|shadow|ghost|mystery|midnight|2am|secret|cave|storm|villain|fear|silent|empty|nobody|lost|missing|danger|trap|alone|war\b/.test(lc);
    const info = { text, style, present, extraN: g ? (big ? 6 : 4) : 0, extraKind, kinds: { A: ka, B: kb, C: kc }, prop: propFor(lc), kind, dark, comedy, surprise: /[!?]/.test(text), tod: todOf(lc), weather: weatherOf(lc, kind, todOf(lc)) };
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
    if (mv.cast) return [mv.cast.A, mv.cast.B, mv.cast.C].map(c => ({ role: c.role, kind: c.kind }));
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
    return roles.map((r, i) => ({ actor: stars.length ? stars[(i + mi) % stars.length].name : 'Explox Star', role: r.role, kind: r.kind, tag: PERS[persFor(mi, mv, i)].tag }));
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
  function clearFx() { while (fxGroup.children.length) { const c = fxGroup.children.pop(); if (c.geometry && !c.userData.shared) c.geometry.dispose(); } }
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
  let beatOffset = 0, lastSceneKey = '', flashA = 0, zoomPunch = 0, titleKey = -1, fightKey = '', fightHud = null, fightCam = null; const fightT0 = {}, fightLast = {};
  const auraMat = { A: new THREE.MeshBasicMaterial({ color: 0xffd54a, transparent: true, opacity: .33 }), B: new THREE.MeshBasicMaterial({ color: 0x40c4ff, transparent: true, opacity: .33 }) }, dustMat = new THREE.MeshBasicMaterial({ color: 0xc8b28a });
  const fxTorus = new THREE.TorusGeometry(1, .08, 6, 28), fxStar = new THREE.OctahedronGeometry(.22), fxMatW = new THREE.MeshBasicMaterial({ color: 0xffffff }), fxMatY = new THREE.MeshBasicMaterial({ color: 0xffe033 });
  function words2d(t0, text, i) { words.push({ t0: t0 + beatOffset, text, i }); }
  let shown = [], curActors = [], curInfoNow = null;

  // ---------- things to DO: jump, dance, play ball, eat, paint, dig, climb, work out, shop, sing, high-five ----------
  const ACT_STYLES = ['jump', 'dance', 'play', 'eat', 'write', 'dig', 'climb', 'exercise', 'shop', 'sing', 'highfive', 'fish', 'camp', 'magic', 'bubbles', 'photo', 'skate', 'snowball', 'juggle', 'tugwar', 'cook', 'drum', 'build'], ACT_SET = new Set(ACT_STYLES);
  function chatActivity(mi, si, k, info, txt) {   // what are they doing while they talk?
    const vs = verbStyle(String(txt || '').toLowerCase(), mi, si); if (ACT_SET.has(vs)) return vs;
    if (info && info.dark) return null;
    const pool = info && info.comedy ? ACT_STYLES : ['write', 'exercise', 'play', 'jump', 'dig', 'shop', 'eat', 'climb', 'fish', 'camp', 'photo', 'build', 'cook', 'drum', 'skate', 'magic'];
    return hash(mi, si + k, 31) % 100 < 70 ? pool[hash(mi, si * 3 + k, 17) % pool.length] : null;
  }
  const ballGeo = new THREE.SphereGeometry(.45, 14, 10), ballMat = new THREE.MeshBasicMaterial({ color: 0xff5533 });
  function spr(em, x, y, z, sz) { const sp = new THREE.Sprite(emojiMat(em)); sp.userData.shared = true; sp.position.set(x, y, z); sp.scale.setScalar(Math.max(.01, sz)); fxGroup.add(sp); return sp; }
  function notes(t, cx, cz, n) { for (let k = 0; k < n; k++) { const ag = (t * .6 + k / n) % 1; spr(k % 2 ? '\u{1F3B5}' : '\u{1F3B6}', cx + Math.sin(k * 2.3 + t) * 2.8, 3.4 + ag * 3.4, cz + Math.cos(k * 1.7) * 1.2, 1.2 * (1 - ag * .5)); } }
  function toward(p, x, z) { p.g.rotation.y = Math.atan2(x - p.g.position.x, z - p.g.position.z); }
  const lrp = (a, b, k) => a + (b - a) * k, eas = (x) => x * x * (3 - 2 * x);
  function activityBase(style, act, ex, t, u, look, mi, si) {
    const all = act.concat(ex), n = all.length, A = act[0], B = act[1] || ex[0], sn = Math.sin; let spread = 5;
    const crowd = (z, face0) => ex.forEach((p, i) => { p.g.position.set((i - (ex.length - 1) / 2) * 2.4, Math.abs(sn(t * 6 + i)) * .4, z); p.g.rotation.y = face0; limbs(p, 2.7 + sn(t * 8 + i) * .5, 2.7 - sn(t * 8 + i) * .5, 0, 0); });
    if (style === 'jump') {   // parkour: run up, leap the hurdle, flips for some
      wmT(.4, 1.3, 4.4, 0xcc6633, 0, .65, 0); wmT(.5, .22, 4.6, 0xffffff, 0, 1.4, 0);
      all.forEach((p, i) => { const ph = (t * .5 + i * .31) % 1, lane = (i - (n - 1) / 2) * 1.5; p.g.position.set(-7 + ph * 14, 0, lane); p.g.rotation.y = Math.PI / 2; walk(p, t * 1.3 + i, 12, 1); p.body.rotation.x = .2;
        const j = clamp((ph - .4) / .22, 0, 1); if (j > 0 && j < 1) { p.g.position.y = sn(Math.PI * j) * 2.8; limbs(p, 2.7, 2.7, -1.2, -1.2); p.body.rotation.x = i % 2 ? -6.283 * j : .3; p.mouth.scale.set(1.2, 2.2, 1); } });
      look.set(0, 2.2, 0); return 10;
    }
    if (style === 'dance') {   // everybody has their own move: twirl, disco point, or the robot arms
      all.forEach((p, i) => { const m = i % 3, b = sn(t * 8 + i * .7); p.g.position.set((i - (n - 1) / 2) * 2.4, Math.abs(sn(t * 4 + i)) * .35, (i % 2) * -1.2); p.g.rotation.y = 0;
        if (m === 0) { p.body.rotation.y = t * 4 + i; limbs(p, 2.8, 2.8, b * .4, -b * .4); }
        else if (m === 1) { p.armR.rotation.z = -.9; p.armR.rotation.x = Math.floor(t * 2 + i) % 2 ? 2.8 : .3; p.armL.rotation.x = 0; p.legL.rotation.x = b * .5; p.body.rotation.z = b * .12; }
        else { p.armL.rotation.z = -1.2 * b; p.armR.rotation.z = -1.2 * b; p.armL.rotation.x = p.armR.rotation.x = .5; p.body.rotation.y = b * .5; p.legL.rotation.x = sn(t * 8) * .3; p.legR.rotation.x = -sn(t * 8) * .3; }
        p.mouth.scale.set(1.1, 1.8, 1); });
      notes(t, 0, -1, 6); look.set(0, 2.4, 0); return 9;
    }
    if (style === 'play') {   // catch the ball: it flies in an arc between the two (or they dribble it)
      if (B) { const ph = (t * .7) % 1, fl = Math.floor(t * .7) % 2, Th = fl ? B : A, Ca = fl ? A : B;
        A.g.position.set(-3.4, 0, 0); B.g.position.set(3.4, 0, 0); A.g.rotation.y = Math.PI / 2; B.g.rotation.y = -Math.PI / 2;
        Th.armR.rotation.x = lrp(1.6, -1.9, eas(clamp(ph / .3, 0, 1))); Th.body.rotation.y = lrp(-.4, .3, clamp(ph / .3, 0, 1)) * (Th === A ? 1 : -1);
        Ca.armL.rotation.x = Ca.armR.rotation.x = -1.5; if (ph > .85) { Ca.g.position.y = sn(Math.PI * (ph - .85) / .15) * .5; }
        [A, B].forEach((pp, k) => { pp.legL.rotation.x = sn(t * 6 + k) * .25; pp.legR.rotation.x = -sn(t * 6 + k) * .25; });
        const bx = lrp(Th.g.position.x, Ca.g.position.x, ph), b = new THREE.Mesh(ballGeo, ballMat); b.userData.shared = true; b.position.set(bx, 2.4 + sn(Math.PI * ph) * 2.6, 0); b.rotation.set(t * 8, 0, t * 6); fxGroup.add(b); }
      else { A.g.position.set(0, 0, 0); A.g.rotation.y = 0; A.armR.rotation.x = -.9 + sn(t * 8) * .5; const b = new THREE.Mesh(ballGeo, ballMat); b.userData.shared = true; b.position.set(1.2, .5 + Math.abs(sn(t * 4)) * 2.2, .5); fxGroup.add(b); }
      ex.forEach((p, i) => { const left = i % 2 === 0; p.g.position.set((left ? -1 : 1) * (6 + Math.floor(i / 2) * 2), Math.abs(sn(t * 6 + i)) * .4, -1.5); p.g.rotation.y = left ? Math.PI / 2 : -Math.PI / 2; limbs(p, 2.7 + sn(t * 8 + i) * .5, 2.7 - sn(t * 8 + i) * .5, 0, 0); });
      look.set(0, 2.6, 0); return 9;
    }
    if (style === 'eat') {   // a table with food: fork up to the mouth, chewing, happy faces
      wmT(7, .22, 2.4, 0x8d5a2b, 0, 1.55, 0); [-3, 3].forEach(x => [-.9, .9].forEach(z => wmT(.25, 1.5, .25, 0x6d4220, x, .75, z)));
      all.slice(0, 3).forEach((p, i) => { const x = (i - (Math.min(n, 3) - 1) / 2) * 2.6; wmT(1.2, .1, 1.2, 0xffffff, x, 1.7, 0); wmT(.7, .3, .7, [0xe53935, 0xffb300, 0x7cb342][i % 3], x, 1.9, 0);
        p.g.position.set(x, 0, -1.7); p.g.rotation.y = 0; const sv = sn(t * 3 + i * 1.3), k = (sv + 1) / 2;
        p.armR.rotation.x = lrp(-1.1, 2.1, k); p.armL.rotation.x = -.6; p.head.rotation.x = .1 + k * .1; p.mouth.scale.set(1, 1 + Math.abs(sn(t * 9 + i)) * 1.8, 1); p.body.position.y = -.05; p.legL.rotation.x = p.legR.rotation.x = -1.4; p.g.position.y = -.45; });
      ex.forEach((p, i) => { p.g.position.set((i - (ex.length - 1) / 2) * 2.6, 0, -4.2); p.g.rotation.y = 0; p.armR.rotation.x = lrp(-1, 2, (sn(t * 3 + i) + 1) / 2); });
      const yum = spr('\u{1F60B}', sn(t) * 2, 4.4 + Math.abs(sn(t * 2)) * .5, -1.7, 1.1);
      look.set(0, 2.2, 0); return 8;
    }
    if (style === 'write') {   // painting on a big canvas: the picture fills up as the scene goes on
      const cx = 0, cz = -2.6; wmT(.18, 4.2, .18, 0x6d4220, -2, 2.1, cz); wmT(.18, 4.2, .18, 0x6d4220, 2, 2.1, cz); wmT(4.6, 3.2, .16, 0xfffdf5, 0, 3.4, cz);
      const nstr = Math.min(18, Math.floor(t * 1.6 + 1)); for (let k = 0; k < nstr; k++) wmT(.5 + (k % 3) * .25, .35 + (k % 2) * .2, .1, [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0x8e24aa][k % 5], -1.6 + (k * 0.9) % 3.4, 2.4 + ((k * 0.55) % 2), cz + .12);
      if (A) { A.g.position.set(-3.6, 0, -1); toward(A, cx, cz); A.armR.rotation.x = -1.4 + sn(t * 6) * .5; A.armR.rotation.z = sn(t * 3) * .4; A.body.rotation.x = .1; }
      if (B) { B.g.position.set(3.6, 0, -.6); toward(B, cx, cz); B.armR.rotation.x = 2.0; B.head.rotation.z = .2 + sn(t * 1.5) * .1; B.head.rotation.y = -.2; }
      ex.forEach((p, i) => { p.g.position.set((i - (ex.length - 1) / 2) * 2.4, 0, -5); p.g.rotation.y = 0; });
      look.set(0, 2.6, -1); return 8;
    }
    if (style === 'dig') {   // dig a hole together, dirt flies, and at the end they find a treasure chest
      const found = u > .68; wmT(2.6, .06, 2.6, 0x2a1a0e, 0, .04, 0); const pile = .35 + Math.min(u / .68, 1) * .65; wmT(2.2 * pile, 1.0 * pile, 1.6 * pile, 0x6d4c2e, 0, .45 * pile, -2.2);
      for (let k = 0; k < 5; k++) { const ph = (t * 1.5 + k * .2) % 1; wmT(.28, .28, .28, 0x6d4c2e, lrp(-0.6, 0.7, ph) * (k % 2 ? 1 : -1) * 1.5, .6 + sn(Math.PI * ph) * 2.2, .4); }
      if (found) { wmT(1.5, .9, 1, 0x8a5a1c, 0, .5, 0); wmT(1.5, .25, 1, 0xffd54a, 0, 1.05, 0); for (let k = 0; k < 4; k++) spr('\u2728', sn(t * 3 + k * 1.7) * 1.6, 2 + Math.abs(sn(t * 2 + k)) * 1.2, .8, .9); }
      [A, B].forEach((pp, k) => { if (!pp) return; pp.g.position.set(k ? 2.6 : -2.6, 0, 0); pp.g.rotation.y = k ? -Math.PI / 2 : Math.PI / 2;
        if (found) { limbs(pp, 2.8, 2.8, 0, 0); pp.g.position.y = Math.abs(sn(t * 7 + k)) * .8; pp.mouth.scale.set(1.2, 2.4, 1); }
        else { const d = sn(t * 5 + k * 2); pp.body.rotation.x = .55; pp.armL.rotation.x = pp.armR.rotation.x = -1.0 + d * .9; } });
      ex.forEach((p, i) => { p.g.position.set((i - (ex.length - 1) / 2) * 2.4, 0, -3.6); p.g.rotation.y = 0; if (found) limbs(p, 2.7 + sn(t * 8 + i) * .5, 2.7 - sn(t * 8 + i) * .5, 0, 0); });
      look.set(0, 1.8, 0); return 9;
    }
    if (style === 'climb') {   // up a rocky wall with a rope, the other one cheers from the ground
      wmT(.8, 11, 8, 0x8a8aa0, 4.9, 5.5, 0); for (let j = 0; j < 9; j++) wmT(.4, .35, .9, [0xff7043, 0xffee58, 0x66bb6a][j % 3], 4.4, .8 + j * 1.15, (j % 2 ? 1 : -1) * 1.2); wmT(.12, 11, .12, 0xd2a24c, 4.2, 5.5, .2);
      if (A) { const y = 3 + 2.7 * sn(t * .55); A.g.position.set(3.6, y, 0); A.g.rotation.y = Math.PI / 2; const c = sn(t * 4); A.armL.rotation.x = 2.6 + c * .3; A.armR.rotation.x = 2.6 - c * .3; A.legL.rotation.x = c * .6; A.legR.rotation.x = -c * .6; A.body.rotation.x = -.1; A.head.rotation.x = -.5; }
      if (B) { B.g.position.set(1.4, 0, .6); B.g.rotation.y = Math.PI / 2; B.head.rotation.x = -.7; B.armR.rotation.x = 2.8 + sn(t * 6) * .3; B.armL.rotation.x = 2.5; B.mouth.scale.set(1.2, 2.4, 1); }
      ex.forEach((p, i) => { p.g.position.set(-2.4 - i * 2.2, Math.abs(sn(t * 6 + i)) * .4, (i % 2) * 2 - 1); p.g.rotation.y = Math.PI / 2; limbs(p, 2.7 + sn(t * 8 + i) * .5, 2.7 - sn(t * 8 + i) * .5, 0, 0); });
      look.set(2.6, 3.4, 0); return 12;
    }
    if (style === 'exercise') {   // jumping jacks, squats and weight lifting
      all.forEach((p, i) => { const m = i % 3, k = (sn(t * 6 + (i > 2 ? .6 : 0)) + 1) / 2; p.g.position.set((i - (n - 1) / 2) * 2.5, 0, (i % 2) * -1); p.g.rotation.y = 0;
        if (m === 0) { p.armL.rotation.z = -k * 2.8; p.armR.rotation.z = k * 2.8; p.legL.rotation.z = -k * .5; p.legR.rotation.z = k * .5; p.g.position.y = k * .55; }
        else if (m === 1) { p.g.position.y = -.5 * k; p.legL.rotation.x = p.legR.rotation.x = -k * 1.0; p.body.rotation.x = .3 * k; p.armL.rotation.x = p.armR.rotation.x = -1.4; }
        else { p.armL.rotation.x = p.armR.rotation.x = 2.6; const by = 3.4 + k * 1.3; wmT(2.4, .16, .16, 0x333333, p.g.position.x, by, p.g.position.z); wmT(.5, .7, .5, 0x222222, p.g.position.x - 1.2, by, p.g.position.z); wmT(.5, .7, .5, 0x222222, p.g.position.x + 1.2, by, p.g.position.z); p.mouth.scale.set(1.1, 2, 1); }
        if (k > .8) spr('\u{1F4A6}', p.g.position.x + .9, 4.4 + p.g.position.y, p.g.position.z, .8); });
      look.set(0, 2.4, 0); return 9;
    }
    if (style === 'shop') {   // a shop counter: coins go one way, the goods come back
      wmT(6, 1.6, 1.2, 0xa66a32, 0, .8, -1.6); wmT(7.5, .2, 1.5, 0xe0b070, 0, 1.7, -1.6); for (let j = 0; j < 5; j++) wmT(1, 1, .8, [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0xab47bc][j], -3.6 + j * 1.8, 3.4 + (j % 2) * .9, -3.6); wmT(8.5, .18, 1, 0x6d4220, 0, 2.9, -3.6);
      if (B) { B.g.position.set(0, 0, -2.6); B.g.rotation.y = 0; B.armR.rotation.x = 2.3 * (sn(t * 2) > .6 ? 1 : 0); B.head.rotation.z = sn(t * 2) * .12; B.p = 1; }
      if (A) { A.g.position.set(-3.4, 0, -.6); toward(A, 0, -1.6); }
      const c = (t * .5) % 1; if (A) { if (c < .5) { const q = c / .5; spr('\u{1FA99}', lrp(-3.2, 0, q), 2.8 + sn(Math.PI * q) * 1.4, -1, 1); A.armR.rotation.x = -1.3 * sn(Math.PI * Math.min(q * 1.4, 1)); } else { const q = (c - .5) / .5; spr('\u{1F381}', lrp(0, -3.2, q), 2.8 + sn(Math.PI * q) * 1.4, -1, 1.2); A.armL.rotation.x = A.armR.rotation.x = -1.2; A.g.position.y = q > .9 ? .3 : 0; } }
      ex.forEach((p, i) => { p.g.position.set(-5.4 - i * 2.2, 0, 1 - (i % 2) * 2); p.g.rotation.y = Math.PI / 2; p.armR.rotation.x = 2.2; });
      look.set(-1, 2.4, -1); return 9;
    }
    if (style === 'sing') {   // a little stage with a singer, backup dancers and music notes
      wmT(9, .4, 4.2, 0x7b1fa2, 0, .2, -1.4); wmT(.1, 2.6, .1, 0x333333, 1.2, 1.7, -.6); wmT(.3, .3, .3, 0x333333, 1.2, 3, -.6);
      if (A) { A.g.position.set(0, .4, -1.2); A.g.rotation.y = 0; A.armR.rotation.x = 2.1; A.armL.rotation.x = 2.8 * (sn(t * 3) > 0 ? 1 : .2); A.head.rotation.x = -.35; A.mouth.scale.set(1.2, 1.8 + Math.abs(sn(t * 9)) * 2.2, 1); A.body.rotation.z = sn(t * 3) * .08; }
      if (B) { B.g.position.set(-3, .4, -1.4); B.g.rotation.y = .3; limbs(B, 2.6 + sn(t * 5) * .5, 2.6 - sn(t * 5) * .5, 0, 0); B.body.rotation.z = sn(t * 5) * .15; B.mouth.scale.set(1.1, 1.8, 1); }
      if (act[2]) { act[2].g.position.set(3, .4, -1.4); act[2].g.rotation.y = -.3; limbs(act[2], 2.6 - sn(t * 5) * .5, 2.6 + sn(t * 5) * .5, 0, 0); act[2].body.rotation.z = -sn(t * 5) * .15; act[2].mouth.scale.set(1.1, 1.8, 1); }
      ex.forEach((p, i) => { p.g.position.set((i % 2 ? 1 : -1) * (6 + Math.floor(i / 2) * 2), Math.abs(sn(t * 5 + i)) * .4, 0); p.g.rotation.y = i % 2 ? -Math.PI / 2 : Math.PI / 2; p.armL.rotation.x = 2.8; p.armR.rotation.x = 2.8; p.body.rotation.z = sn(t * 3 + i) * .15; });
      notes(t, 0, -1, 7); look.set(0, 2.8, 0); return 10;
    }
    if (style === 'highfive') {   // run at each other, SMACK a high five, then jump for joy
      const T = 3, cyc = Math.floor(t / T), ph = (t % T) / T;
      const dx = ph < .4 ? lrp(5, .75, eas(ph / .4)) : ph < .65 ? .75 : lrp(.75, 3.2, eas((ph - .65) / .35));
      [A, B].forEach((pp, k) => { if (!pp) return; const sg = k ? 1 : -1; pp.g.position.set(sg * dx, 0, 0); pp.g.rotation.y = k ? -Math.PI / 2 : Math.PI / 2;
        if (ph < .4) { walk(pp, t, 14, 1); pp.body.rotation.x = .15; if (ph > .22) { pp.armR.rotation.x = 2.9; } }
        else if (ph < .65) { pp.armR.rotation.x = 2.9; pp.armL.rotation.x = 0; pp.mouth.scale.set(1.3, 2.4, 1); pp.g.position.y = ph > .45 ? Math.abs(sn((ph - .45) * 14)) * .5 : 0; }
        else { limbs(pp, 2.8, 2.8, 0, 0); pp.g.position.y = Math.abs(sn((ph - .65) * 22 + k)) * 1.0; pp.mouth.scale.set(1.3, 2.4, 1); } });
      if (ph > .38 && ph < .52) { const age = ph - .38; for (let k = 0; k < 9; k++) { const a2 = k * Math.PI * 2 / 9, d = age * 20, st = new THREE.Mesh(fxStar, fxMatY); st.userData.shared = true; st.position.set(Math.cos(a2) * d, 3.6 + Math.sin(a2) * d, .3); st.scale.setScalar(1.3 - age * 5); fxGroup.add(st); } words2d(cyc * T + .4 * T, 'HIGH FIVE!', 2 + cyc % 3); zoomPunch = 0; }
      ex.forEach((p, i) => { const left = i % 2 === 0; p.g.position.set((left ? -1 : 1) * (6 + Math.floor(i / 2) * 2), Math.abs(sn(t * 6 + i)) * .4, -1.5); p.g.rotation.y = left ? Math.PI / 2 : -Math.PI / 2; limbs(p, 2.7 + sn(t * 8 + i) * .5, 2.7 - sn(t * 8 + i) * .5, 0, 0); });
      look.set(0, 2.6, 0); return 9;
    }
    if (style === 'fish') {   // fishing at a pond: the bobber dips, a fish jumps out
      wmT(10, .1, 6.5, 0x2e9fd6, 0, .06, -1.8); wmT(11, .3, 1.4, 0x8d6e3f, 0, .12, 2.1);
      [A, B].forEach((pp, k) => { if (!pp) return; const sg = k ? 1 : -1, off = k * 1.7, ph = ((t + off) % 4.2) / 4.2, bite = ph > .8; pp.g.position.set(sg * 3.4, 0, 1.2); toward(pp, sg * .8, -1.2);
        const hx = pp.g.position.x - sg * -.5, hy = 2.0, tipx = sg * 1.2, tipy = 4.4; for (let q = 0; q <= 6; q++) wmT(.1, .1, .1, 0x6d4220, lrp(hx, tipx, q / 6), lrp(hy, tipy, q / 6), .4);
        const by = .25 + (bite ? Math.abs(sn(t * 16)) * .5 : sn(t * 2 + k) * .06); for (let q = 1; q < 6; q++) wmT(.04, .04, .04, 0xffffff, lrp(tipx, sg * .9, q / 6), lrp(tipy, by, q / 6), lrp(.4, -1.2, q / 6)); wmT(.35, .35, .35, 0xe53935, sg * .9, by, -1.2);
        pp.armL.rotation.x = pp.armR.rotation.x = bite ? 2.4 : -1.1; pp.body.rotation.x = bite ? -.35 : .05; if (ph > .9) spr('\u{1F41F}', lrp(sg * .9, pp.g.position.x - sg * .6, (ph - .9) / .1), 1 + sn(Math.PI * (ph - .9) / .1) * 3, lrp(-1.2, .5, (ph - .9) / .1), 1.1); });
      ex.forEach((p, i) => { p.g.position.set((i % 2 ? 1 : -1) * (6.4 + Math.floor(i / 2) * 2), 0, 1.2); toward(p, 0, -1); p.armR.rotation.x = -1.1; });
      look.set(0, 2.2, 0); return 10;
    }
    if (style === 'camp') {   // around a campfire, roasting marshmallows
      wmT(1.8, .3, .35, 0x5d4037, 0, .2, .3); wmT(1.8, .3, .35, 0x5d4037, 0, .2, -.3); for (let q = 0; q < 4; q++) wmT(.6, .9 + Math.abs(sn(t * 9 + q * 2)) * .8, .6, [0xff7a18, 0xffb300, 0xff5722, 0xffee58][q], (q % 2 ? .2 : -.2), .6, (q < 2 ? -.15 : .15)); for (let q = 0; q < 6; q++) { const ag = (t * .9 + q * .17) % 1; wmT(.12, .12, .12, 0xffee58, sn(q * 3 + t) * .7, 1.2 + ag * 3.2, sn(q * 5) * .5); }
      all.forEach((p, i) => { const a = i * Math.PI * 2 / n + .5, r = i < act.length ? 3.2 : 5.2; p.g.position.set(Math.cos(a) * r, -.45, Math.sin(a) * r * .8); toward(p, 0, 0); p.legL.rotation.x = p.legR.rotation.x = -1.4; if (i < act.length) { p.armR.rotation.x = -1.2 + sn(t * 2 + i) * .1; p.armL.rotation.x = -.5; const hx = p.g.position.x * .6, hz = p.g.position.z * .6; wmT(.1, .1, 1.8, 0x8d6e3f, hx, 1.5, hz); wmT(.3, .3, .3, 0xfff8e1, p.g.position.x * .3, 1.5, p.g.position.z * .3); p.mouth.scale.set(1, 1 + Math.abs(sn(t * 3 + i)) * .8, 1); } else { p.armR.rotation.x = -.8; } });
      look.set(0, 1.6, 0); return 9;
    }
    if (style === 'magic') {   // a wizard waves a wand, sparkles, a rabbit pops out of a hat
      const ph = (t % 4.4) / 4.4; wmT(1.1, .9, 1.1, 0x222222, 2.8, .45, -.4); wmT(1.5, .12, 1.5, 0x222222, 2.8, .92, -.4); wmT(.6, .2, .6, 0x7b1fa2, 2.8, .98, -.4);
      if (A) { A.g.position.set(-1.2, 0, 0); A.g.rotation.y = .5; A.armR.rotation.x = 2.2 + sn(t * 7) * .5; A.armR.rotation.z = -.3 + sn(t * 5) * .3; const wx = -1.2 + .8, wy = 4 + sn(t * 7) * .5; wmT(.12, 1.1, .12, 0x222222, wx, wy, .5); for (let q = 0; q < 5; q++) spr('\u2728', wx + sn(t * 4 + q * 1.3) * 1.3, wy + .3 + Math.abs(sn(t * 3 + q)) * 1.4, .6, .8); }
      if (ph > .45 && ph < .95) { const q = (ph - .45) / .5; spr('\u{1F407}', 2.8, 1.2 + eas(Math.min(q * 1.6, 1)) * 1.7 + (q > .8 ? sn((q - .8) * 30) * .3 : 0), -.4, 1.4); }
      if (B) { B.g.position.set(1.0, 0, 1.4); B.g.rotation.y = -.4; if (ph > .45) { B.armL.rotation.x = B.armR.rotation.x = 2.2; B.armL.rotation.z = .5; B.armR.rotation.z = -.5; B.mouth.scale.set(1.2, 2.6, 1); } else B.armR.rotation.x = 2.0; }
      ex.forEach((p, i) => { p.g.position.set((i - (ex.length - 1) / 2) * 2.4, 0, -4); p.g.rotation.y = 0; if (ph > .45) limbs(p, 2.7, 2.7, 0, 0); });
      look.set(.6, 2.6, 0); return 8;
    }
    if (style === 'bubbles') {   // bubble blasters!
      const bg = new THREE.SphereGeometry(.5, 10, 8), bm = new THREE.MeshBasicMaterial({ color: 0xbfefff, transparent: true, opacity: .45 });
      all.forEach((p, i) => { const sg = i % 2 ? 1 : -1; p.g.position.set((i - (n - 1) / 2) * 2.7, 0, (i % 2) * -1.4); p.g.rotation.y = sg * Math.PI / 3; p.armR.rotation.x = -1.2 + sn(t * 5 + i) * .15; p.armL.rotation.x = -.6; wmT(.9, .35, .35, [0xff4081, 0x40c4ff, 0xffd740][i % 3], p.g.position.x + sg * .9, 2.2, p.g.position.z);
        for (let q = 0; q < 5; q++) { const ag = (t * .45 + i * .21 + q * .2) % 1, b = new THREE.Mesh(bg, bm); b.userData.shared = true; b.position.set(p.g.position.x + sg * (1.3 + ag * 4.2) + sn(q + t) * .5, 2.3 + ag * 3.2 + sn(q * 2 + t * 2) * .3, p.g.position.z + sn(q * 4) * .6); b.scale.setScalar(.45 + (q % 3) * .35); fxGroup.add(b); } });
      look.set(0, 3, 0); return 9;
    }
    if (style === 'photo') {   // a photo shoot: poses, a camera and flashes
      const ph = (t % 2.6) / 2.6, snap = Math.floor(t / 2.6);
      if (A) { A.g.position.set(-3.8, 0, 2.2); toward(A, 0, 0); A.armL.rotation.x = A.armR.rotation.x = -1.4; wmT(.8, .55, .5, 0x222222, -3.0, 2.5, 1.8); wmT(.3, .3, .3, 0x90caf9, -2.7, 2.5, 1.6); }
      const sub = all.slice(1); sub.forEach((p, i) => { p.g.position.set((i - (sub.length - 1) / 2) * 2.2, 0, -1 + (i % 2) * -.8); p.g.rotation.y = 0; const pz = (i + snap) % 4; if (pz === 0) { p.armR.rotation.x = 2.8; p.armL.rotation.x = 2.8; } else if (pz === 1) { p.armL.rotation.z = -.9; p.armR.rotation.z = .9; p.body.rotation.z = .1; } else if (pz === 2) { p.armR.rotation.x = 2.6; p.armR.rotation.z = -.4; p.head.rotation.z = .2; } else { p.armL.rotation.z = -1.3; p.armR.rotation.z = 1.3; p.armL.rotation.x = p.armR.rotation.x = 1.0; } p.mouth.scale.set(1.3, 1.6, 1); });
      if (ph < .08) { flashA = (1 - ph / .08) * .9; spr('\u{1F4F8}', -2.4, 3.6, 1.8, 1); }
      look.set(0, 2.4, 0); return 9;
    }
    if (style === 'skate') {   // skateboards: gliding, leaning and ollie tricks
      wmT(10, .25, 5, 0x8e8e9a, 0, .12, 0);
      all.forEach((p, i) => { const sp = .8 + (i % 3) * .15, x = sn(t * sp + i * 1.1) * 5.4, vx = Math.cos(t * sp + i * 1.1), z = (i - (n - 1) / 2) * 1.4, k = (t * .5 + i * .3) % 1, oll = k > .8 ? sn(Math.PI * (k - .8) / .2) * 1.8 : 0;
        p.g.position.set(x, .3 + oll, z); p.g.rotation.y = vx > 0 ? Math.PI / 2 : -Math.PI / 2; p.armL.rotation.z = -1.0; p.armR.rotation.z = 1.0; p.legL.rotation.x = .3; p.legR.rotation.x = -.3; p.body.rotation.z = vx * .25; if (oll) { p.body.rotation.y = 6.283 * ((k - .8) / .2); p.mouth.scale.set(1.2, 2.2, 1); } const bd = wmT(1.7, .15, .6, [0xe53935, 0x1e88e5, 0xfdd835][i % 3], x, .22 + oll * .9, z); bd.rotation.y = p.g.rotation.y === Math.PI / 2 ? 0 : 0; });
      look.set(0, 1.8, 0); return 10;
    }
    if (style === 'snowball') {   // snowball fight!
      const sm = new THREE.MeshBasicMaterial({ color: 0xffffff });
      wmT(30, .08, 20, 0xf4f8ff, 0, .04, 0); wmT(2.2, 1.2, 1.4, 0xffffff, -6.2, .6, 0); wmT(2.2, 1.2, 1.4, 0xffffff, 6.2, .6, 0);
      [A, B].forEach((pp, k) => { if (!pp) return; const sg = k ? 1 : -1, ph = ((t * .85 + k * .5) % 1); pp.g.position.set(sg * 4.2, 0, 0); pp.g.rotation.y = k ? -Math.PI / 2 : Math.PI / 2; const oth = k ? A : B;
        pp.armR.rotation.x = lrp(1.6, -1.9, eas(clamp(ph / .22, 0, 1))); if (!(ph < .22)) { const q = (ph - .22) / .78, b = new THREE.Mesh(ballGeo, sm); b.userData.shared = true; b.position.set(lrp(pp.g.position.x, -sg * 4.2, q), 2.4 + sn(Math.PI * q) * 2.4, 0); b.scale.setScalar(.75); fxGroup.add(b); if (q > .85) { oth.body.rotation.x = .6; oth.head.rotation.x = -.5; oth.mouth.scale.set(.7, 3, 1); } }
        const th = [A, B][1 - k]; });
      ex.forEach((p, i) => { const left = i % 2 === 0; p.g.position.set((left ? -1 : 1) * (7.2 + Math.floor(i / 2) * 2), Math.abs(sn(t * 6 + i)) * .3, 2 * (i % 3 - 1)); p.g.rotation.y = left ? Math.PI / 2 : -Math.PI / 2; p.armR.rotation.x = sn(t * 5 + i) > 0 ? 2.4 : -1.2; });
      look.set(0, 2.2, 0); return 10;
    }
    if (style === 'juggle') {   // a juggling show with a clapping audience
      if (A) { A.g.position.set(0, 0, 0); A.g.rotation.y = 0; A.armL.rotation.x = 2.2 + sn(t * 5) * .4; A.armR.rotation.x = 2.2 - sn(t * 5) * .4; A.mouth.scale.set(1.3, 1.6, 1); A.head.rotation.z = sn(t * 2) * .1;
        for (let q = 0; q < 4; q++) { const ang = t * 5 + q * Math.PI / 2, b = new THREE.Mesh(ballGeo, new THREE.MeshBasicMaterial({ color: [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047][q] })); b.userData.shared = true; b.position.set(Math.sin(ang) * 1.3, 4 + Math.cos(ang) * .9, .4); b.scale.setScalar(.6); fxGroup.add(b); } }
      all.slice(1).forEach((p, i) => { p.g.position.set((i % 2 ? 1 : -1) * (3.4 + Math.floor(i / 2) * 2.2), 0, 1.4 + (i % 3) * -1); p.g.rotation.y = 0; p.armL.rotation.x = p.armR.rotation.x = -1.3; p.armL.rotation.z = -(.35 + .35 * sn(t * 12 + i)); p.armR.rotation.z = .35 + .35 * sn(t * 12 + i); p.mouth.scale.set(1.2, 2, 1); });
      look.set(0, 3, 0); return 9;
    }
    if (style === 'tugwar') {   // tug of war: the flag swings between the two teams
      const off = sn(t * .8) * 1.5; wmT(11, .14, .14, 0xd2a24c, 0, 1.8, 0); wmT(.4, .8, .1, 0xe53935, off, 2.5, 0); wmT(.1, 1.2, .1, 0x333333, off, 2.2, 0);
      const teamL = [A].concat(ex.filter((_, i) => i % 2 === 0)), teamR = [B].concat(ex.filter((_, i) => i % 2 === 1));
      [teamL, teamR].forEach((team, k) => team.forEach((p, i) => { if (!p) return; const sg = k ? 1 : -1; p.g.position.set(sg * (2.4 + i * 1.9) + off, 0, 0); p.g.rotation.y = k ? -Math.PI / 2 : Math.PI / 2; p.body.rotation.x = -.5; p.armL.rotation.x = p.armR.rotation.x = -1.3; p.legL.rotation.x = .4 + sn(t * 8 + i) * .2; p.legR.rotation.x = -.4; p.mouth.scale.set(1.1, 2, 1); }));
      if (act[2]) { act[2].g.position.set(0, 0, -2.4); act[2].g.rotation.y = 0; act[2].armR.rotation.x = 2.8 + sn(t * 8) * .3; }
      look.set(0, 2.2, 0); return 11;
    }
    if (style === 'cook') {   // a kitchen: stirring a pot, steam, and a taste test
      wmT(3.4, 1.4, 1.6, 0x666666, 0, .7, -1.6); wmT(1.3, .9, 1.3, 0x9e9e9e, 0, 1.85, -1.6); wmT(1.0, .12, 1.0, 0xe53935, 0, 2.35, -1.6); for (let q = 0; q < 5; q++) { const ag = (t * .8 + q * .2) % 1; wmT(.4 + ag * .5, .4 + ag * .5, .4 + ag * .5, 0xffffff, sn(q * 2 + t) * .5, 2.7 + ag * 2.4, -1.6); }
      if (A) { A.g.position.set(0, 0, -2.9); A.g.rotation.y = 0; A.armR.rotation.x = -1.2 + sn(t * 5) * .3; A.armR.rotation.z = Math.cos(t * 5) * .3; A.armL.rotation.x = -.5; A.mouth.scale.set(1, 1.3, 1); }
      if (B) { const ph = (t % 3.4) / 3.4; B.g.position.set(3.2, 0, -.6); toward(B, 0, -1.6); B.armR.rotation.x = ph < .5 ? lrp(-1, 2.1, ph / .5) : 2.1; if (ph > .6) { B.armR.rotation.x = 2.8; B.armR.rotation.z = -.4; B.mouth.scale.set(1.2, 2.2, 1); spr('\u{1F44D}', 3.2, 4.4, -.6, 1); } }
      ex.forEach((p, i) => { p.g.position.set(-3.4 - i * 2.2, 0, -.6 - (i % 2)); toward(p, 0, -1.6); p.armR.rotation.x = 2.1; });
      look.set(.6, 2.4, -1); return 8;
    }
    if (style === 'drum') {   // a rock band: drums, guitar and tambourine
      const hit = Math.abs(sn(t * 9)); wmT(1.8, 1.8, 1.2, 0xc62828, 0, .9, -1.8); wmT(1.2, .9, 1.2, 0x1565c0, -1.5, 1.4, -1.4); wmT(1.2, .9, 1.2, 0x1565c0, 1.5, 1.4, -1.4); wmT(1.5, .06, 1.5, 0xffd54a, -2.6, 3.3 + hit * .1, -1.6); wmT(1.5, .06, 1.5, 0xffd54a, 2.6, 3.3 + (1 - hit) * .1, -1.6);
      if (A) { A.g.position.set(0, -.4, -2.8); A.g.rotation.y = 0; A.legL.rotation.x = A.legR.rotation.x = -1.4; A.armL.rotation.x = -1.6 + sn(t * 9) * .8; A.armR.rotation.x = -1.6 - sn(t * 9) * .8; A.head.rotation.z = sn(t * 4.5) * .15; A.mouth.scale.set(1.1, 1.6, 1); }
      if (B) { B.g.position.set(-3.6, 0, -.4); B.g.rotation.y = .4; B.armL.rotation.x = -.9; B.armR.rotation.x = -1.2 + sn(t * 12) * .4; B.body.rotation.z = sn(t * 4) * .15; wmT(1.8, .35, .2, 0x8d6e3f, -3.2, 1.8, .2); }
      if (act[2]) { act[2].g.position.set(3.6, 0, -.4); act[2].g.rotation.y = -.4; act[2].armR.rotation.x = 2.6 + sn(t * 14) * .5; act[2].body.rotation.z = -sn(t * 4) * .15; }
      ex.forEach((p, i) => { p.g.position.set((i % 2 ? 1 : -1) * (6.4 + Math.floor(i / 2) * 2), Math.abs(sn(t * 5 + i)) * .4, 0); p.g.rotation.y = i % 2 ? -Math.PI / 2 : Math.PI / 2; p.armL.rotation.x = p.armR.rotation.x = 2.8; });
      notes(t, 0, -1, 7); look.set(0, 2.4, -1); return 10;
    }
    if (style === 'build') {   // stacking blocks into a pyramid, together
      const nb = Math.min(15, Math.floor(t * 1.1)), cols = [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0xab47bc]; let q = 0;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5 - r; c++) { if (q >= nb) break; wmT(1, 1, 1, cols[q % 5], (c - (4 - r) / 2) * 1.05, .5 + r * 1.02, -1); q++; }
      const done = nb >= 15; [A, B].forEach((pp, k) => { if (!pp) return; const sg = k ? 1 : -1, ph = (t * .9 + k * .5) % 1; pp.g.position.set(sg * 4.4, 0, 0); pp.g.rotation.y = k ? -Math.PI / 2 : Math.PI / 2;
        if (done) { limbs(pp, 2.8, 2.8, 0, 0); pp.g.position.y = Math.abs(sn(t * 7 + k)) * .8; pp.mouth.scale.set(1.2, 2.4, 1); } else { pp.armL.rotation.x = pp.armR.rotation.x = -1.2; pp.body.rotation.x = .15; wmT(.9, .9, .9, cols[(k + 2) % 5], lrp(pp.g.position.x - sg * .9, -sg * 1.4, ph) , 2 + sn(Math.PI * ph) * 1.2, 0); } });
      ex.forEach((p, i) => { p.g.position.set((i - (ex.length - 1) / 2) * 2.4, 0, -4); p.g.rotation.y = 0; if (done) limbs(p, 2.7 + sn(t * 8 + i) * .5, 2.7 - sn(t * 8 + i) * .5, 0, 0); });
      look.set(0, 2.2, 0); return 10;
    }
    return 5;
  }
  // every scene gets its own tempo, colour theme and signature flourishes, so there are thousands of different looks
  const FLOURISH = ['spin', 'flip', 'hop', 'wave', 'bow', 'clap', 'cheer', 'cartwheel'], HUES = [0, 0, 0, .08, .17, .25, .33, .5, .58, .67, .75, .9], TEMPO = [.75, .9, 1, 1.15, 1.35];
  let HUE = 0; const tintCache = {};
  function tintC(c) { if (!HUE) return c; const k = c + '_' + HUE; return tintCache[k] || (tintCache[k] = new THREE.Color(c).offsetHSL(HUE, 0, 0).getHex()); }
  function wmT(sx, sy, sz, c, x, y, z) { return wMesh(sx, sy, sz, tintC(c), x, y, z); }
  function flourish(p, k, q) {
    const sn = Math.sin;
    switch (k) {
      case 'spin': p.body.rotation.y += 6.283 * eas(q); break;
      case 'flip': p.body.rotation.x = -6.283 * eas(q); p.g.position.y += sn(Math.PI * q) * 1.8; break;
      case 'hop': p.g.position.y += sn(Math.PI * q) * 1.1; p.armL.rotation.x = p.armR.rotation.x = 2.6; break;
      case 'wave': p.armR.rotation.x = 2.6; p.armR.rotation.z = sn(q * 40) * .5; break;
      case 'bow': p.body.rotation.x = .9 * sn(Math.PI * q); p.armL.rotation.x = p.armR.rotation.x = .3; break;
      case 'clap': p.armL.rotation.x = p.armR.rotation.x = -1.3; p.armL.rotation.z = -(.35 + .35 * sn(q * 60)); p.armR.rotation.z = .35 + .35 * sn(q * 60); break;
      case 'cheer': p.armL.rotation.x = p.armR.rotation.x = 2.7; p.mouth.scale.set(1.3, 2.4, 1); p.g.position.y += Math.abs(sn(q * 12)) * .5; break;
      case 'cartwheel': p.g.rotation.z = 6.283 * eas(q); p.g.position.y += sn(Math.PI * q) * 1.2; break;
    }
  }
  function activity(style, act, ex, t, u, look, mi, si, beatNo) {
    const h = hash(mi * 7 + si, beatNo || 0, 3), vr = { tempo: TEMPO[h % 5], hue: HUES[hash(h, 5, 2) % 12], fl: hash(h, 7, 5) };
    HUE = vr.hue; const tt = t * vr.tempo, sp = activityBase(style, act, ex, tt, u, look, mi, si); HUE = 0;
    act.concat(ex).forEach((p, i) => { const T = 3.3, c = Math.floor((tt + i * .73) / T), q = ((tt + i * .73) % T) / T / .28; if (q < 1 && hash(c, i + vr.fl, 4) % 3 !== 0 && !(style === 'dance' || style === 'highfive')) flourish(p, FLOURISH[hash(c, i + vr.fl, 9) % 8], q); });
    return sp;
  }
  // ---------- what they see, you see: when a line talks about something, it appears in the scene, everyone turns to look at it, and the camera cuts to over their shoulder ----------
  const SIGHT_PROP = [[/rocket|spaceship|mothership/i, 'rocket'], [/pizza/i, 'pizza'], [/treasure|\bcoins?\b|\bgold\b|money/i, 'coins'], [/\bcars?\b|truck|\bbus\b/i, 'car'], [/\bhouse\b|cabin/i, 'house'], [/\btree\b|forest/i, 'tree'], [/portal|time machine/i, 'portal'], [/\bmoon\b/i, 'moon'], [/\bsun\b|sunrise/i, 'sun'], [/trophy|medal|\bcup\b/i, 'trophy'], [/\bbook\b|\bmap\b|letter/i, 'book'], [/\bfire\b|flames?\b|torch|campfire/i, 'fire'], [/lantern|flashlight|\blamp\b/i, 'lantern'], [/lightning|thunder|storm/i, 'bolt'], [/shield|badge/i, 'shield']];
  const SIGHT_BEING = [[/dragon/i, 'dragon'], [/\bdino(saurs?)?\b/i, 'dino'], [/\brobots?\b|android/i, 'robot'], [/ghost/i, 'ghost'], [/\baliens?\b|martian/i, 'alien'], [/ninjas?\b/i, 'ninja'], [/\bcats?\b|kitty/i, 'cat'], [/wizard/i, 'wizard'], [/\bkings?\b|queen/i, 'king'], [/detective/i, 'detective'], [/grandma|granny/i, 'grandma'], [/doctor/i, 'doctor']];
  // "oh look!": with no thing named, they spot something that really belongs in the place they are in
  const LOOKCUE = /\b(oh,? look|look at|look there|look over|look,|look!|i see|you see|see that|see it|there'?s a|there is a|over there|what is that|what'?s that|check (that )?out|behold|spot(ted)?|is that a)\b/i;
  const SETTING_SIGHT = { library: [['prop', 'book'], ['being', 'ghost']], hospital: [['prop', 'heart'], ['being', 'doctor']], police: [['prop', 'shield'], ['being', 'detective']], cityhall: [['prop', 'trophy'], ['being', 'king']], prison: [['prop', 'wall'], ['prop', 'lantern']],
    suburbs: [['prop', 'house'], ['prop', 'car'], ['being', 'cat']], park: [['prop', 'tree'], ['being', 'cat'], ['prop', 'sun']], airport: [['prop', 'rocket'], ['being', 'pilot']], city: [['prop', 'car'], ['prop', 'house'], ['being', 'robot']], space: [['prop', 'rocket'], ['prop', 'moon'], ['being', 'alien']],
    vault: [['prop', 'coins'], ['prop', 'shield']], track: [['prop', 'car'], ['being', 'racer']], arena: [['prop', 'trophy'], ['being', 'athlete']], dojo: [['being', 'ninja'], ['prop', 'shield']], lab: [['prop', 'portal'], ['being', 'robot'], ['prop', 'bolt']], house: [['prop', 'lantern'], ['prop', 'heart'], ['being', 'cat']],
    school: [['prop', 'book'], ['prop', 'trophy']], shop: [['prop', 'pizza'], ['prop', 'coins']], market: [['prop', 'pizza'], ['prop', 'coins'], ['being', 'grandma']], desert: [['prop', 'sun'], ['being', 'dino']], snow: [['prop', 'lantern'], ['prop', 'fire']], beach: [['prop', 'sun'], ['prop', 'heart']],
    jungle: [['prop', 'tree'], ['being', 'dino']], castle: [['being', 'dragon'], ['prop', 'shield'], ['being', 'king']], scrapyard: [['prop', 'car'], ['being', 'robot']], temple: [['prop', 'fire'], ['prop', 'lantern'], ['being', 'ghost']], nature: [['prop', 'tree'], ['prop', 'sun'], ['being', 'dino']] };
  function settingThing(kind, h) { const L = SETTING_SIGHT[kind] || [['prop', 'tree'], ['prop', 'sun']], pick = L[h % L.length]; return pick[0] === 'prop' ? { prop: pick[1] } : { being: pick[1] }; }
  function sightFor(text) {
    const t = String(text || ''); for (const [re, k] of SIGHT_BEING) if (re.test(t)) return { being: k };
    for (const [re, k] of SIGHT_PROP) if (re.test(t)) return { prop: k };
    return null;
  }
  // ---------- sound effects for everything: footsteps, boings, splashes, crunches, shutter clicks, drums ... plus the sound of the place itself ----------
  let cA = null, nbuf = null;
  function CA() { cA = cA || new (window.AudioContext || window.webkitAudioContext)(); if (cA.state === 'suspended') cA.resume(); return cA; }
  function NB() { const c = CA(); if (!nbuf) { nbuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return nbuf; }
  function tn(f, type, v, d, del, fe) { const c = CA(), o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + (del || 0); o.type = type; o.frequency.setValueAtTime(f, t0); if (fe) o.frequency.exponentialRampToValueAtTime(fe, t0 + d); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(.0008, t0 + d); o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + d + .02); }
  function nz(v, d, del, ft, f, q, fe) { const c = CA(), s2 = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), t0 = c.currentTime + (del || 0); s2.buffer = NB(); fl.type = ft; fl.frequency.setValueAtTime(f, t0); if (fe) fl.frequency.exponentialRampToValueAtTime(fe, t0 + d); fl.Q.value = q || 1; g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(.0008, t0 + d); s2.connect(fl); fl.connect(g); g.connect(c.destination); s2.start(t0, Math.random() * .5); s2.stop(t0 + d + .02); }
  const CSFX = {
    step() { nz(.1, .07, 0, 'lowpass', 520); tn(95, 'sine', .08, .06); }, tiptoe() { nz(.04, .08, 0, 'lowpass', 320); }, run() { nz(.12, .06, 0, 'lowpass', 650); tn(110, 'sine', .09, .05); },
    boing() { tn(220, 'sine', .14, .3, 0, 640); tn(640, 'sine', .08, .25, .05, 260); }, pop() { tn(900, 'sine', .12, .07, 0, 200); }, splash() { nz(.13, .35, 0, 'bandpass', 1400, .6, 300); },
    crunch() { for (let i = 0; i < 3; i++) nz(.1, .04, i * .05, 'highpass', 1800 + i * 300); }, scribble() { nz(.05, .13, 0, 'bandpass', 3500, 2); }, scoop() { nz(.11, .16, 0, 'lowpass', 900, .7, 300); tn(80, 'sine', .1, .1, .12); },
    clink() { tn(2400, 'sine', .08, .12); tn(3100, 'sine', .05, .1, .02); }, ching() { tn(1318, 'sine', .1, .25); tn(1760, 'sine', .08, .3, .07); }, shutter() { nz(.15, .03, 0, 'highpass', 2000); nz(.12, .03, .07, 'highpass', 1500); },
    sizzle() { nz(.08, .45, 0, 'highpass', 4500); }, crackle() { for (let i = 0; i < 3; i++) nz(.09, .02, Math.random() * .25, 'highpass', 2500); }, thump() { tn(120, 'sine', .22, .15, 0, 50); },
    slap() { nz(.2, .05, 0, 'bandpass', 2000, 1); tn(300, 'square', .08, .04); }, sparkle() { [1568, 2093, 2637, 3136].forEach((f, i) => tn(f, 'sine', .06, .14, i * .05)); }, snore() { tn(115, 'sawtooth', .05, .55, 0, 75); },
    drum() { tn(150, 'sine', .22, .15, 0, 55); nz(.07, .05, 0, 'highpass', 3000); }, creak() { tn(190, 'sawtooth', .04, .35, 0, 130); }, whump() { nz(.16, .16, 0, 'lowpass', 420); }, toss() { tn(500, 'sine', .06, .06, 0, 850); },
    hammer() { tn(900, 'square', .09, .04); nz(.1, .04, 0, 'bandpass', 1500); }, squeak() { tn(1400, 'sine', .07, .13, 0, 1950); }, ding() { tn(1568, 'sine', .1, .35); tn(2349, 'sine', .06, .3, .05); },
    grunt() { tn(125, 'sawtooth', .09, .16, 0, 80); }, swish() { nz(.06, .22, 0, 'bandpass', 900, .5, 1800); }, bird() { tn(2600, 'sine', .05, .09, 0, 3500); tn(3000, 'sine', .04, .08, .11, 2400); },
    cheer2() { for (let i = 0; i < 5; i++) tn(300 + Math.random() * 300, 'sawtooth', .03, .25, Math.random() * .2, 500); }, clap2() { for (let i = 0; i < 3; i++) nz(.1, .04, i * .09, 'bandpass', 1800, 1); }, boom2() { tn(60, 'sawtooth', .3, .5, 0, 30); nz(.25, .45, 0, 'lowpass', 700, .5, 120); }, bam() { tn(160, 'square', .2, .07); tn(80, 'sine', .18, .12, .04); nz(.12, .06, 0, 'bandpass', 1800, 1); },
    charge() { tn(120, 'sawtooth', .09, 1.1, 0, 1100); tn(240, 'square', .05, 1.1, 0, 1600); }, smash() { tn(55, 'sawtooth', .35, .7, 0, 25); nz(.3, .6, 0, 'lowpass', 900, .5, 120); nz(.15, .15, 0, 'highpass', 3000); tn(1800, 'sine', .08, .3, .05, 300); },
    rocketLaunch() { nz(.2, 1.0, 0, 'lowpass', 400, .5, 1800); tn(70, 'sawtooth', .15, 1, 0, 200); }, yum() { tn(500, 'sine', .09, .15, 0, 700); tn(700, 'sine', .08, .2, .12, 900); }, doorbell() { tn(660, 'sine', .12, .35); tn(523, 'sine', .12, .5, .35); },
    rustle() { nz(.07, .5, 0, 'bandpass', 3000, .8); }, warp() { tn(150, 'sine', .12, .7, 0, 1400); tn(300, 'triangle', .08, .7, 0, 2000); }, chime() { tn(988, 'sine', .08, .7); tn(1319, 'sine', .06, .7, .1); },
    fanfare() { [523, 659, 784, 1047].forEach((f, i) => tn(f, 'square', .06, i === 3 ? .5 : .16, i * .12)); }, pageflip() { nz(.08, .12, 0, 'highpass', 4000); nz(.06, .1, .1, 'bandpass', 3000); }, flame() { nz(.1, .5, 0, 'bandpass', 900, .7, 2500); },
    heartbeat() { tn(70, 'sine', .2, .12); tn(60, 'sine', .16, .12, .18); }, zap() { tn(2000, 'sawtooth', .1, .25, 0, 100); nz(.1, .2, 0, 'highpass', 3000); }, roar() { tn(90, 'sawtooth', .2, .9, 0, 180); tn(140, 'sawtooth', .12, .8, .05, 70); nz(.1, .8, 0, 'lowpass', 500); },
    beepbeep() { tn(1000, 'square', .06, .07); tn(1000, 'square', .06, .07, .12); tn(1400, 'square', .06, .09, .26); }, woo() { tn(350, 'sine', .1, .5, 0, 550); tn(550, 'sine', .1, .5, .45, 300); }, warble() { tn(700, 'sine', .09, .5, 0, 1100); tn(1100, 'sine', .08, .5, .1, 650); },
    meow() { tn(700, 'triangle', .1, .4, 0, 1100); tn(1100, 'triangle', .08, .3, .15, 600); }, trumpet() { tn(392, 'sawtooth', .07, .2); tn(523, 'sawtooth', .07, .4, .2); }, chuckle() { for (let i = 0; i < 4; i++) tn(320 + i * 20, 'triangle', .06, .09, i * .14, 260); },
    sob() { tn(420, 'sine', .07, .35, 0, 300); tn(400, 'sine', .07, .35, .4, 280); }, gasp() { nz(.1, .25, 0, 'bandpass', 1500, 1, 3000); }, chatter() { for (let i = 0; i < 6; i++) tn(1500, 'square', .03, .03, i * .05); }, sigh() { nz(.07, .7, 0, 'bandpass', 1200, .5, 400); },
    hmm() { tn(180, 'sine', .08, .5, 0, 230); }, smack() { nz(.2, .05, 0, 'bandpass', 1800, 1); tn(250, 'square', .06, .05); }, knock() { for (let i = 0; i < 3; i++) tn(200, 'sine', .2, .08, i * .2, 150); }, bell() { tn(880, 'sine', .12, .9); tn(1760, 'sine', .05, .7); },
    tick() { tn(1800, 'square', .05, .03); tn(1500, 'square', .05, .03, .5); }, jingle() { [2093, 2637, 3136, 2349].forEach((f, i) => tn(f, 'sine', .05, .15, i * .06)); }, wind() { nz(.07, 1.2, 0, 'bandpass', 500, .6, 900); }, crack() { nz(.2, .08, 0, 'highpass', 3500); tn(2500, 'sine', .06, .05); },
    scream() { tn(900, 'sawtooth', .05, .6, 0, 1700); }, whistle() { tn(1800, 'sine', .07, .5, 0, 2400); }, applause() { for (let i = 0; i < 10; i++) nz(.08, .04, i * .07, 'bandpass', 1800 + Math.random() * 600, 1); }, sneeze() { nz(.1, .15, 0, 'bandpass', 2500); tn(500, 'sine', .08, .2, .15, 200); },
    honk2() { tn(220, 'sawtooth', .12, .3, 0, 180); tn(280, 'sawtooth', .1, .3, .02, 230); }, ring() { for (let i = 0; i < 4; i++) tn(900, 'square', .035, .1, i * .16); }, splash2() { nz(.13, .35, 0, 'bandpass', 1400, .6, 300); },
  };
  // a sound for every thing that can appear, every emote and every word that makes a noise
  const SIGHT_SFX = { rocket: 'rocketLaunch', pizza: 'yum', coins: 'ching', car: 'honk2', house: 'doorbell', wall: 'thump', tree: 'rustle', portal: 'warp', moon: 'chime', sun: 'chime', trophy: 'fanfare', book: 'pageflip', fire: 'flame', lantern: 'flame', heart: 'heartbeat', bolt: 'zap', shield: 'clink',
    dragon: 'roar', dino: 'roar', robot: 'beepbeep', ghost: 'woo', alien: 'warble', ninja: 'swish', cat: 'meow', wizard: 'sparkle', king: 'trumpet', detective: 'hmm', grandma: 'chuckle', doctor: 'beepbeep' };
  const EMOTE_SFX = { wave: 'chime', dance: 'clap2', laugh: 'chuckle', salute: 'tick', facepalm: 'smack', cry: 'sob', bow: 'swish', point: 'ding', clap: 'applause', spin: 'swish', flex: 'grunt', shrug: 'hmm', cheer: 'cheer2', gasp: 'gasp', shiver: 'chatter', sigh: 'sigh' };
  const WORD_SFX = [[/\b(knock|knocks|knocked)\b/, 'knock'], [/\b(door|doorbell)\b/, 'doorbell'], [/\b(bell|bells)\b/, 'bell'], [/\b(phone|call|calls|ring|rings)\b/, 'ring'], [/\b(clock|ticking|timer)\b/, 'tick'], [/\b(key|keys)\b/, 'jingle'], [/\b(honk|horn|beep)\b/, 'honk2'],
    [/\b(rocket|launch|blast off|lift off)\b/, 'rocketLaunch'], [/\b(wind|windy|breeze)\b/, 'wind'], [/\b(ice|frozen|freeze)\b/, 'crack'], [/\b(water|sea|ocean|wave|waves|lake|river|splash)\b/, 'splash2'], [/\b(cake|pizza|cookie|cookies|snack|yum|delicious)\b/, 'yum'],
    [/\b(magic|spell|sparkle|wand)\b/, 'sparkle'], [/\b(scream|screams|yell|shout|shouts)\b/, 'scream'], [/\b(whistle|whistles)\b/, 'whistle'], [/\b(applause|clap|claps|cheer|cheers|hooray)\b/, 'applause'], [/\b(sneeze|achoo)\b/, 'sneeze'], [/\b(coin|coins|money|gold|treasure)\b/, 'ching'],
    [/\b(page|book|map|letter)\b/, 'pageflip'], [/\b(fire|flame|flames|torch)\b/, 'flame'], [/\b(lightning|zap|electric)\b/, 'zap'], [/\b(roar|roars|dragon|dinosaur)\b/, 'roar'], [/\b(ghost|spooky|haunted)\b/, 'woo'], [/\b(cat|kitty|meow)\b/, 'meow'], [/\b(robot|beep|boop)\b/, 'beepbeep'], [/\b(heart|love)\b/, 'heartbeat']];
  const CS_STYLE = { walk: [2.9, 'step'], run: [4.4, 'run'], sneak: [1.7, 'tiptoe'], jump: [.9, 'boing'], dance: [2.2, 'clap2'], play: [.75, 'thump'], eat: [2.6, 'crunch'], write: [2.2, 'scribble'], dig: [1.6, 'scoop'], climb: [1.4, 'clink'], exercise: [1.6, 'grunt'], shop: [.55, 'ching'], sing: [1.1, 'sparkle'],
    highfive: [.34, 'slap'], party: [1.2, 'pop'], fish: [.28, 'splash'], camp: [3.5, 'crackle'], magic: [.6, 'sparkle'], bubbles: [3.2, 'pop'], photo: [.38, 'shutter'], skate: [2.6, 'swish'], snowball: [.85, 'whump'], juggle: [4.2, 'toss'], tugwar: [1.1, 'creak'], cook: [2.4, 'sizzle'], drum: [4.6, 'drum'], build: [1.15, 'thump'], work: [2.6, 'hammer'], panic: [1.5, 'squeak'], look: [.0, null], talk: [.0, null] };
  const csState = { style: '', idx: -1, once: {}, eng: null, amb: null, ambKey: '', ambTimer: 0 };
  function csFlow(style, t, mi) {
    try {
      if (!playing(mi)) return;
      const d = CS_STYLE[style]; if (csState.style !== style) { csState.style = style; csState.idx = d && d[0] ? Math.floor(t * d[0]) : -1; }
      if (d && d[0]) { const idx = Math.floor(t * d[0]); if (idx !== csState.idx) { csState.idx = idx; CSFX[d[1]](); } }
      if (style === 'fly') csEngine(true); else csEngine(false);
    } catch (e) { }
  }
  function csOnce(key, name) { try { if (csState.once[key]) return; csState.once[key] = 1; CSFX[name](); } catch (e) { } }
  function csEngine(on) {
    try {
      if (on && !csState.eng) { const c = CA(), o = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), l = c.createOscillator(), lg = c.createGain(); o.type = 'sawtooth'; o.frequency.value = 62; o2.type = 'square'; o2.frequency.value = 94; f.type = 'lowpass'; f.frequency.value = 420; g.gain.value = .05; l.frequency.value = 17; lg.gain.value = .02; l.connect(lg); lg.connect(g.gain); o.connect(f); o2.connect(f); f.connect(g); g.connect(c.destination); o.start(); o2.start(); l.start(); csState.eng = { stop() { try { g.gain.setTargetAtTime(0, c.currentTime, .15); setTimeout(() => { o.stop(); o2.stop(); l.stop(); }, 600); } catch (e) { } } }; }
      else if (!on && csState.eng) { csState.eng.stop(); csState.eng = null; }
    } catch (e) { }
  }
  function csAmbience(mi, info) {   // the sound of the place: waves, wind, city hum, space hum, crickets, birds, thunder
    try {
      if (!playing(mi)) { csStop(); return; }
      const key = info.kind + '|' + info.tod; const now = performance.now();
      if (csState.ambKey !== key) {
        if (csState.amb) csState.amb.stop(); csState.ambKey = key; csState.amb = null; const c = CA(), k = info.kind, nz2 = (ft, f, q, v, lfo) => { const s2 = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s2.buffer = NB(); s2.loop = true; fl.type = ft; fl.frequency.value = f; fl.Q.value = q; g.gain.value = v; s2.connect(fl); fl.connect(g); g.connect(c.destination); s2.start(); let l = null; if (lfo) { l = c.createOscillator(); const lg = c.createGain(); l.frequency.value = lfo[0]; lg.gain.value = lfo[1]; l.connect(lg); lg.connect(g.gain); l.start(); } return { stop() { try { g.gain.setTargetAtTime(0, c.currentTime, .3); setTimeout(() => { s2.stop(); if (l) l.stop(); }, 1200); } catch (e) { } } }; };
        if (k === 'beach') csState.amb = nz2('lowpass', 700, .5, .05, [.13, .04]); else if (k === 'snow' || k === 'desert' || info.tod === 'storm') csState.amb = nz2('bandpass', 420, .6, .035, [.17, .015]); else if (k === 'city' || k === 'market' || k === 'track') csState.amb = nz2('lowpass', 230, .5, .03);
        else if (k === 'space') { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = 55; g.gain.value = .03; o.connect(g); g.connect(c.destination); o.start(); csState.amb = { stop() { try { g.gain.setTargetAtTime(0, c.currentTime, .3); setTimeout(() => o.stop(), 1200); } catch (e) { } } }; }
        else if (info.tod === 'night') { const o = c.createOscillator(), g = c.createGain(), l = c.createOscillator(), lg = c.createGain(); o.type = 'sine'; o.frequency.value = 4300; g.gain.value = .008; l.type = 'square'; l.frequency.value = 11; lg.gain.value = .008; l.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(c.destination); o.start(); l.start(); csState.amb = { stop() { try { g.gain.setTargetAtTime(0, c.currentTime, .3); setTimeout(() => { o.stop(); l.stop(); }, 1200); } catch (e) { } } }; }
      }
      if (now - csState.ambTimer > 2800 + Math.random() * 3000) { csState.ambTimer = now; if (['park', 'nature', 'jungle', 'suburbs'].indexOf(info.kind) >= 0 && info.tod !== 'night') CSFX.bird(); if (info.tod === 'storm' && Math.random() < .5) { try { sfx.thunder(); } catch (e) { } } }
    } catch (e) { }
  }
  function csStop() { try { if (csState.amb) csState.amb.stop(); csState.amb = null; csState.ambKey = ''; csEngine(false); csState.style = ''; csState.once = {}; } catch (e) { } }
  // ---------- the director: puts the right characters in the right place doing what the caption says ----------
  function directBeat(mi, si, mv, sc, t, info, dur, camSeed) {
    const u = clamp(t / dur, 0, 1); flashA = 0; zoomPunch = 0; fightHud = null; fightCam = null;
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
    if (prop && (ACT_SET.has(style) || style === 'fly')) prop.visible = false;   // the activity brings its own props
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
      // 100x fights: a 3-hit combo, a charged SUPER MOVE (leap-slam, energy blast or tornado), slow-motion impacts, launches, shockwaves, dust, cracks, health bars and a combo counter
      const A = a0, B = a1 || ex[0]; if (B && !a1) B.g.visible = true;
      const ST = t + beatOffset, fk = mi + '_' + si; if (fightT0[fk] === undefined || ST < (fightLast[fk] || 0) - .5) fightT0[fk] = ST; fightLast[fk] = ST;
      const f0 = fightT0[fk], FT = ST - f0, CY = 3.8, cyc = Math.floor(FT / CY), tr = FT - cyc * CY, tw = tr < 1.95 ? tr : tr < 2.2 ? 1.95 + (tr - 1.95) * .2 : tr - .2;
      const W = (rel, text, i) => words2d(f0 + rel - beatOffset, text, i), hsh = hash(mi, si, 3), ROLEA = [1, 0, 1, 1, 0, 0, 1, 0];
      const isA = (c) => ROLEA[(c + hsh) % 8] === 1, atkA = isA(cyc);
      const atk = atkA ? A : B, def = atkA ? B : A, dir = atkA ? 1 : -1, prof = profileOf(mi, mv, atkA ? 0 : 1), fin = hash(cyc, si + mi, 13) % 3;
      const ease = (x) => x * x * (3 - 2 * x), cl = (x) => clamp(x, 0, 1), lerp = (a, b, k) => a + (b - a) * k;
      const homeA = -3.1, homeB = 3.1, home = (pp) => pp === A ? homeA : homeB;
      const HIT = [.6, .9, 1.2], hts = [0, 1, 2].map(q => ['punch', 'kick', 'punch', 'kick', 'jumpkick', 'spin'][hash(cyc * 3 + q, mi + si, 9) % 6]);
      const landed = HIT.filter(h2 => tw >= h2).length, push = HIT.reduce((a2, h2) => a2 + ease(cl((tw - h2) / .14)) * .3, 0);
      // positions
      const dx0 = home(def) + dir * push, dashK = ease(cl(tw / .5));
      face(A, Math.PI / 2); face(B, -Math.PI / 2);
      [A, B].forEach((pp, k) => { pp.g.position.set(home(pp) + Math.sin(t * 2 + k) * .15, 0, 0); pp.body.position.y = -.1 + Math.sin(t * 6 + k) * .05; limbs(pp, -1.0, -1.0 + Math.sin(t * 7 + k) * .15, Math.sin(t * 5 + k) * .3, -Math.sin(t * 5 + k) * .3); });
      def.g.position.x = dx0; atk.g.position.x = lerp(home(atk), dx0 - dir * 1.7, dashK);
      const IMPT = 2.0, q2 = cl((tw - IMPT) / .9), fl2 = tw >= IMPT && tw < IMPT + .9, afterIm = tw >= IMPT;
      // dash: a speed blur
      if (tw < .5 && tw > .05) for (let k = 0; k < 6; k++) wMesh(2.2, .05, .05, 0xffffff, atk.g.position.x - dir * (1 + k * .3), 1.3 + k * .4, (k - 3) * .3);
      // the 3-hit combo
      HIT.forEach((h2, i) => {
        const u = tw - h2; if (u < -.2 || u > .5 || tw >= 1.35) return; const ph = cl((u + .15) / .3), sw = Math.sin(Math.PI * ph), tp = hts[i];
        if (u > -.2 && u < .3) {
          if (tp === 'punch') { (i % 2 ? atk.armL : atk.armR).rotation.x = lerp(1.3, -1.9, ease(ph)); atk.body.rotation.y = dir * (i % 2 ? .5 : -.5) * sw; }
          else if (tp === 'kick') { atk.legR.rotation.x = lerp(.5, -1.7, ease(ph)); atk.body.rotation.x = -.3 * sw; atk.armL.rotation.x = -.8; atk.armR.rotation.x = .9; }
          else if (tp === 'jumpkick') { atk.g.position.y = sw * 1.5; atk.legL.rotation.x = -1.2; atk.legR.rotation.x = -.9; atk.body.rotation.x = -.5; atk.armL.rotation.x = 1.3; atk.armR.rotation.x = 1.1; }
          else { atk.body.rotation.y = Math.PI * 2 * ease(ph); atk.armL.rotation.z = -1.4; atk.armR.rotation.z = 1.4; atk.legR.rotation.x = -.8; }
        }
        if (u >= 0 && u < .45) {   // the hit lands: the other one snaps back, sparks, a word, a thud
          const a2 = u, ix2 = def.g.position.x - dir * .6, r2 = cl(u / .35);
          def.head.rotation.x = -.7 * Math.sin(Math.PI * r2); def.body.rotation.x = -.35 * Math.sin(Math.PI * r2); def.mouth.scale.set(.6, 3, 1);
          const ring = new THREE.Mesh(fxTorus, fxMatW); ring.userData.shared = true; ring.scale.setScalar(Math.max(.01, .4 + a2 * 6)); ring.position.set(ix2, 2.4, .2); ring.lookAt(CAM.position); fxGroup.add(ring);
          for (let k = 0; k < 7; k++) { const aa = k * Math.PI * 2 / 7, dd = a2 * 8, st = new THREE.Mesh(fxStar, fxMatY); st.userData.shared = true; st.position.set(ix2 + Math.cos(aa) * dd, 2.4 + Math.sin(aa) * dd, .3 * Math.sin(k)); st.scale.setScalar(Math.max(.01, 1.1 - a2 * 2.2)); fxGroup.add(st); }
          W(cyc * CY + h2, ['POW!', 'WHAM!', 'BAM!', 'BIFF!', 'ZAP!', 'WHACK!'][hash(cyc * 3 + i, si, 9) % 6], 3 + i); if (u < .08) { flashA = Math.max(flashA, .35); zoomPunch = Math.max(zoomPunch, .6); shake = Math.max(shake, .45); }
          if (playing(mi)) csOnce(mi + '_' + si + '_' + cyc + '_hit' + i, 'bam');
        }
      });
      // charge-up: aura, rings, 'SUPER MOVE'
      const hudSuper = tw > 1.4 && tw < 2.0;
      if (tw > 1.35 && tw < IMPT + .05) {
        const cK = cl((tw - 1.35) / .6), aura = new THREE.Mesh(ballGeo, auraMat[atkA ? 'A' : 'B']); aura.userData.shared = true; aura.scale.setScalar(1.7 + cK * 1.6 + Math.sin(t * 30) * .2); aura.position.set(atk.g.position.x, 2.3, 0); fxGroup.add(aura);
        for (let k = 0; k < 3; k++) { const ag = ((tw * 1.8) + k / 3) % 1, rg = new THREE.Mesh(fxTorus, fxMatY); rg.userData.shared = true; rg.rotation.x = -Math.PI / 2; rg.scale.setScalar(Math.max(.01, 3.2 * (1 - ag))); rg.position.set(atk.g.position.x, .1 + ag * .3, 0); fxGroup.add(rg); }
        if (fin !== 1 || tw < 1.75) { atk.body.rotation.x = .35; atk.armL.rotation.x = atk.armR.rotation.x = 1.0; atk.g.position.y = fin === 0 ? 0 : 0; }
        def.armL.rotation.x = def.armR.rotation.x = 2.2; def.armL.rotation.z = .6; def.armR.rotation.z = -.6; def.mouth.scale.set(1, 2.2, 1); shake = Math.max(shake, .12 + cK * .2);
        if (playing(mi)) csOnce(mi + '_' + si + '_' + cyc + '_chg', 'charge');
      }
      // the SUPER MOVE (3 kinds)
      if (fin === 0 && tw >= 1.5 && tw < IMPT + .3) { const q = cl((tw - 1.5) / .5); atk.g.position.y = Math.sin(Math.PI * q) * 4.3; atk.g.position.x = lerp(dx0 - dir * 1.7, dx0 - dir * 1.1, q); limbs(atk, 2.8, 2.8, -.4, .4); atk.body.rotation.x = q > .5 ? .6 : -.2; }
      if (fin === 1 && tw >= 1.4 && tw < IMPT + .02) {
        const ball = new THREE.Mesh(ballGeo, auraMat[atkA ? 'A' : 'B']); ball.userData.shared = true; const rel = cl((tw - 1.8) / .2);
        if (tw < 1.8) { ball.scale.setScalar(.6 + (tw - 1.4) * 4.5); ball.position.set(atk.g.position.x + dir * 1.2, 2.5, .3); atk.armL.rotation.x = atk.armR.rotation.x = -1.4; }
        else { ball.scale.setScalar(2.4); ball.position.set(lerp(atk.g.position.x + dir * 1.2, def.g.position.x, rel), 2.5, .3); atk.armL.rotation.x = atk.armR.rotation.x = -1.7; for (let k = 1; k < 5; k++) { const tr2 = new THREE.Mesh(ballGeo, auraMat[atkA ? 'A' : 'B']); tr2.userData.shared = true; tr2.scale.setScalar(2.2 - k * .4); tr2.position.set(ball.position.x - dir * k * .9, 2.5, .3); fxGroup.add(tr2); } }
        fxGroup.add(ball);
      }
      if (fin === 2 && tw >= 1.5 && tw < IMPT + .3) { const q = cl((tw - 1.5) / .5); atk.body.rotation.y = tw * 24; atk.g.position.x = lerp(dx0 - dir * 1.7, dx0 - dir * 1.0, q); atk.armL.rotation.z = -1.5; atk.armR.rotation.z = 1.5; atk.armL.rotation.x = atk.armR.rotation.x = 0; for (let k = 0; k < 5; k++) { const rg = new THREE.Mesh(fxTorus, fxMatW); rg.userData.shared = true; rg.rotation.x = -Math.PI / 2; rg.scale.setScalar(.8 + k * .5); rg.position.set(atk.g.position.x, .4 + k * .85, 0); fxGroup.add(rg); } }
      // the impact: freeze-frame slow motion, a giant shockwave, cracks, and the other one flies
      if (afterIm) {
        const age = tw - IMPT;
        def.g.position.x = dx0 + dir * q2 * 2.2; def.g.position.y = Math.sin(Math.PI * q2) * (fin === 2 ? 3.6 : 4.8); def.g.rotation.z = dir * Math.PI * 2 * (fin === 2 ? 2.5 : 1.3) * q2; def.armL.rotation.z = -1.4; def.armR.rotation.z = 1.4; def.mouth.scale.set(1, 3.2, 1);
        if (tw < IMPT + .9) { atk.g.position.y = 0; atk.body.rotation.x = 0; }
        if (age < .7) {
          for (let k = 0; k < 2; k++) { const ring = new THREE.Mesh(fxTorus, k ? fxMatY : fxMatW); ring.userData.shared = true; ring.scale.setScalar(Math.max(.01, .5 + age * (k ? 11 : 17))); ring.position.set(dx0 - dir * .3, 2.4, .2); ring.lookAt(CAM.position); fxGroup.add(ring); }
          if (age < .5) for (let k = 0; k < 16; k++) { const aa = k * Math.PI * 2 / 16, dd = age * 16, st = new THREE.Mesh(fxStar, fxMatY); st.userData.shared = true; st.position.set(dx0 + Math.cos(aa) * dd, 2.4 + Math.sin(aa) * dd, .3 * Math.sin(k)); st.scale.setScalar(Math.max(.01, 1.6 - age * 3)); fxGroup.add(st); }
          if (age < .15) { flashA = Math.max(flashA, (1 - age / .15)); } zoomPunch = Math.max(zoomPunch, 1 - age / .4); shake = Math.max(shake, 1.0 * (1 - age / .5));
          if (age < .6) { W(cyc * CY + 2.0, prof.move + '!', 7); W(cyc * CY + 2.1, 'K.O. HIT!', 2 + cyc % 3); }
          if (playing(mi)) csOnce(mi + '_' + si + '_' + cyc + '_smash', 'smash');
        }
        if (fin === 0 || fin === 2) { const ck2 = Math.min(1, age * 8); for (let k = 0; k < 9; k++) { const cr = wMesh(.14, .05, 3.2 * ck2, 0x1a1a1a, dx0 - dir * .3 + Math.cos(k * .7) * 1.6 * ck2, .03, Math.sin(k * .7) * 1.6 * ck2); cr.rotation.y = k * .7 + Math.PI / 2; } }
        // landing: dust and a thud
        const la = tw - (IMPT + .9); if (la > 0 && la < .6) { const dr = new THREE.Mesh(fxTorus, dustMat); dr.userData.shared = true; dr.rotation.x = -Math.PI / 2; dr.scale.setScalar(Math.max(.01, .5 + la * 9)); dr.position.set(def.g.position.x, .15, 0); fxGroup.add(dr); shake = Math.max(shake, .6 * (1 - la / .6)); W(cyc * CY + 3.0, ['CRASH!', 'THUD!', 'WHUMP!'][cyc % 3], 3); if (playing(mi)) csOnce(mi + '_' + si + '_' + cyc + '_land', 'thump'); }
        if (tw > IMPT + .9) {   // dizzy on the ground, then they get up while the winner poses
          const lie = 1 - ease(cl((tw - 3.15) / .5)); def.g.rotation.z = dir * 1.4 * lie; def.g.position.y = .3 * lie; for (let k = 0; k < 3; k++) spr('\u{1F4AB}', def.g.position.x + Math.cos(t * 5 + k * 2.1) * .9, 4 + Math.sin(t * 3 + k) * .2, Math.sin(t * 5 + k * 2.1) * .5, .9 * lie + .01);
          atk.armL.rotation.x = atk.armR.rotation.x = 2.7; atk.mouth.scale.set(1.3, 2.4, 1); atk.g.position.y = Math.abs(Math.sin(t * 8)) * .35;
        }
        if (tw > 3.3) { const hk = ease(cl((tw - 3.3) / .5)); def.g.position.x = lerp(def.g.position.x, home(def), hk); atk.g.position.x = lerp(atk.g.position.x, home(atk), hk); }
      }
      // cameras: wide, a low close-up while charging, then pulling back and following the launch
      let cpos = null, clook = null, ck = 0;
      if (tw > 1.35 && tw < IMPT) { ck = ease(cl((tw - 1.35) / .2)); cpos = new THREE.Vector3(atk.g.position.x - dir * 1.5, 1.9, 10.5); clook = new THREE.Vector3(atk.g.position.x + dir * 1.2, 2.8, 0); }
      else if (afterIm && tw < 3.4) { ck = tw > 3.1 ? 1 - (tw - 3.1) / .3 : 1; cpos = new THREE.Vector3(def.g.position.x * .35, 3.8, 15.5); clook = new THREE.Vector3(def.g.position.x * .8, 2.6 + def.g.position.y * .4, 0); }
      fightCam = cpos ? { pos: cpos, look: clook, k: ck } : null;
      // health bars and the combo counter
      const dmg = 3 * 3 + 12; let hpA = 100, hpB = 100; for (let c = 0; c < cyc; c++) { if (isA(c)) hpB -= dmg; else hpA -= dmg; }
      { const dd = landed * 3 + (afterIm ? 12 : 0); if (atkA) hpB -= dd; else hpA -= dd; }
      fightHud = { a: Math.max(10, hpA), b: Math.max(10, hpB), nameA: String(castRoles(mi, mv)[0].role).toUpperCase(), nameB: String(castRoles(mi, mv)[1].role).toUpperCase(), combo: tw < 1.35 ? landed : 0, sup: hudSuper ? prof.move : '' };
      if (a2) { a2.g.position.set(-6.2, 0, 3); face(a2, Math.PI / 3); limbs(a2, 2.5 + Math.sin(t * 8) * .5, 2.5 - Math.sin(t * 8) * .5, 0, 0); a2.g.position.y = Math.abs(Math.sin(t * 6)) * .5; }
      let n = 0; ex.forEach((p, k) => { if (p === B) return; const left = (k % 2 === 0); p.g.position.set((left ? -1 : 1) * (6.6 + Math.floor(n / 2) * 2.4), Math.abs(Math.sin(t * 6 + k)) * (afterIm && tw < 3 ? 1.0 : .5), (left ? 1 : -1) * 3); face(p, left ? Math.PI / 2 : -Math.PI / 2); limbs(p, 2.6 + Math.sin(t * 8 + k) * .5, 2.6 - Math.sin(t * 8 + k) * .5, 0, 0); n++; });
      look.set((A.g.position.x + B.g.position.x) / 2, 2.6, 0); spread = 6;
    } else if (style === 'party') {
      const all = act.concat(ex); all.forEach((p, i) => { const a = i * 6.283 / all.length + t * .5; p.g.position.set(Math.cos(a) * 4.4, Math.abs(Math.sin(t * 5 + i)) * 1.1, Math.sin(a) * 3.6); face(p, -a + Math.PI); limbs(p, 2.8 + Math.sin(t * 9 + i) * .6, 2.8 - Math.sin(t * 9 + i) * .6, Math.sin(t * 9 + i) * .6, -Math.sin(t * 9 + i) * .6); p.body.rotation.y = Math.sin(t * 4 + i) * .5; p.mouth.scale.set(1.2, 2.2, 1); });
      confetti(t, 90); look.set(0, 2.2, 0); spread = 6;
    } else if (style === 'fly') {
      // they ride in a real little airplane: cockpit seats, wings, a spinning propeller, wing-walkers and clouds rushing past
      const yaw = -.9, cy = Math.cos(yaw), sy = Math.sin(yaw), bob = Math.sin(t * 2) * .25, bank = Math.sin(t * .9) * .12, face0 = Math.atan2(cy, -sy);
      const pg = new THREE.Group(); pg.userData.shared = true; pg.rotation.set(0, yaw, bank); pg.position.y = bob;
      const pm = (sx, sy2, sz, c, x, y, z) => { const m = new THREE.Mesh(wGeo, wM(c)); m.scale.set(sx, sy2, sz); m.position.set(x, y, z); pg.add(m); return m; };
      pm(9, 1.5, 1.9, 0xe53935, 0, 4.2, 0); pm(1.5, 1.2, 1.6, 0xffffff, 5.2, 4.2, 0); pm(2.8, .25, 13, 0xffffff, .5, 4.35, 0); pm(2.8, .27, 1.1, 0xe53935, .5, 4.35, 6); pm(2.8, .27, 1.1, 0xe53935, .5, 4.35, -6);
      pm(1.6, 2.3, .25, 0xe53935, -4.4, 5.6, 0); pm(1.5, .2, 4.2, 0xffffff, -4.3, 4.7, 0); pm(.15, 1.0, 1.9, 0x90caf9, 2.1, 5.3, 0); pm(.9, .9, .3, 0x222222, 1.6, 3.2, 1.2); pm(.9, .9, .3, 0x222222, 1.6, 3.2, -1.2); pm(.15, 1, .15, 0x555555, 1.6, 3.7, 1.2); pm(.15, 1, .15, 0x555555, 1.6, 3.7, -1.2);
      const prop2 = pm(.3, 3.4, .4, 0x333333, 6.05, 4.2, 0); prop2.rotation.x = t * 40; pm(.4, .5, .5, 0xffd54a, 6.0, 4.2, 0);
      fxGroup.add(pg);
      const place = (lx, lz, ly) => ({ x: lx * cy + lz * sy, z: -lx * sy + lz * cy, y: ly + bob });
      act.forEach((p, i) => { const q = place(1.2 - i * 1.9, 0, 3.55); p.g.position.set(q.x, q.y, q.z); p.g.rotation.y = face0; p.legL.rotation.x = p.legR.rotation.x = -1.4; p.mouth.scale.set(1.2, 1.8, 1);
        if (i === 0) { p.armL.rotation.x = p.armR.rotation.x = -1.1; p.head.rotation.y = Math.sin(t * .8) * .2; } else if (i === 1) { p.armR.rotation.x = 2.6; p.armR.rotation.z = Math.sin(t * 9) * .5; p.head.rotation.y = .5; } else { p.armL.rotation.x = p.armR.rotation.x = 2.8 + Math.sin(t * 8) * .3; } });
      ex.forEach((p, i) => { if (i >= 4) { p.g.visible = false; return; } const side = i % 2 ? 1 : -1, q = place(1.5 - Math.floor(i / 2) * 1.8, side * (4 + (i > 1 ? .5 : 0)), 4.6); p.g.position.set(q.x, q.y, q.z); p.g.rotation.y = face0; p.armL.rotation.z = -1.2; p.armR.rotation.z = 1.2; p.body.rotation.x = .25; p.mouth.scale.set(1.3, 2.2, 1); });
      for (let k = 0; k < 9; k++) { const z = ((t * 34 + k * 9) % 70) - 30; wMesh(4 + (k % 3) * 2, 1.2, 2 + (k % 2), 0xffffff, (k % 2 ? 1 : -1) * (7 + (k * 3) % 11), 1 + (k % 4) * 2.4, z); }
      if (stage) stage.position.z = (t * 26) % 40;
      look.set(0, 4.3, 0); spread = 15;
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
    } else if (ACT_SET.has(style)) {
      spread = activity(style, act, ex, t, u, look, mi, si, camSeed);
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
    csFlow(style, t, mi);
    const emo = info.emo || [], xe = style === 'party' ? 'joy' : (emo[1] || emo[0] || 'neutral');
    act.forEach((pp, ii) => emote(pp, emo[ii] || emo[0] || 'neutral', t, true)); ex.forEach(pp => emote(pp, xe, t, false));
    { const tS = t + beatOffset, dlg = getDialogue(mi, si, mv, sc), ln = dlg.find(l => l.who !== 'N' && tS >= l.start - .15 && tS <= l.end + .5);
      if (ln && ACT_SET.has(style)) { const pi = info.present.indexOf(ln.who), sp = pi >= 0 ? act[pi] : null; if (sp) sp.mouth.scale.set(1, 1.4 + Math.abs(Math.sin(t * 12)) * 2.4, 1); }
      else if (ln) { const pi = info.present.indexOf(ln.who), sp = pi >= 0 ? act[pi] : null, ek = pickEmote(ln); if (sp && ek) { applyEmote(sp, ek, Math.max(0, tS - ln.start + .15)); if (sp.emoS) sp.emoS.visible = false; if (playing(mi) && tS - ln.start < .6 && EMOTE_SFX[ek]) csOnce(mi + '_' + si + '_' + ln.start + 'e', EMOTE_SFX[ek]); } } }
    let sightCam = null;
    { const tS = t + beatOffset, dlg = getDialogue(mi, si, mv, sc), ln = dlg.find(l => tS >= l.start - .1 && tS <= l.end + .6), sg = ln && (sightFor(ln.text) || (LOOKCUE.test(ln.text) ? settingThing(info.kind, hash(mi * 3 + si, (ln.start * 10) | 0, 5)) : null));
      if (sg) {
        const side = hash(mi + si, (ln.start * 10) | 0, 2) % 2 ? 1 : -1, P = new THREE.Vector3(side * 8.2, 0, -4.6);
        if (sg.prop) { const o = makeProp(sg.prop); if (prop && prop !== o) prop.visible = false; o.visible = true; o.rotation.set(0, 0, 0); o.scale.setScalar(1); o.position.copy(P); if (o.userData.spin === 'y') o.rotation.y = t * 1.2; if (o.userData.spin === 'z') o.rotation.z = t * .8; if (o.userData.float) o.position.y = Math.sin(t * 2) * .5 + 1; if (o.userData.flicker) o.scale.setScalar(.95 + Math.abs(Math.sin(t * 17)) * .15); }
        else { const def = npcPool()[hash(mi, si, 6) % npcPool().length], cp = personFor('sight_' + sg.being, def, sg.being, null); pose(cp); cp.g.visible = true; cp.g.scale.setScalar(2.1); cp.g.position.set(P.x, 0, P.z); cp.g.rotation.y = Math.atan2(-P.x, -P.z); limbs(cp, 2.6 + Math.sin(t * 6) * .4, 0, Math.sin(t * 4) * .3, -Math.sin(t * 4) * .3); shown.push(cp); }
        if (style === 'talk' || style === 'look' || style === 'work') act.concat(ex).forEach(pp => { pp.g.rotation.y = Math.atan2(P.x - pp.g.position.x, P.z - pp.g.position.z); pp.head.rotation.y = 0; });
        if (playing(mi)) { csOnce(mi + '_' + si + '_' + ln.start + 's', 'ding'); const so = SIGHT_SFX[sg.prop || sg.being]; if (so) setTimeout(() => csOnce(mi + '_' + si + '_' + ln.start + 'o', so), 280); }
        sightCam = { sp: act[Math.max(0, info.present.indexOf(ln.who))] || act[0], P, k: eas(clamp((tS - ln.start + .1) / .35, 0, 1)) };
      } }
    { const tS = t + beatOffset, dlg = getDialogue(mi, si, mv, sc), ln = dlg.find(l => tS >= l.start - .1 && tS <= l.end + 1.4), first = dlg.length ? dlg[0].start : 0;
      const txt = ln ? ln.text : (tS < first ? sc.text : ''), lt = String(txt || '').toLowerCase(), t0 = ln ? ln.start : 0, age = tS - t0, who = ln && ln.who !== 'N' ? Math.max(0, info.present.indexOf(ln.who)) : hash(mi, si, 8) % Math.max(1, act.length);
      if (ln && playing(mi) && age >= 0 && age < .7) { let n2 = 0; for (const [re, nm] of WORD_SFX) { if (n2 >= 2) break; if (re.test(lt)) { n2++; csOnce(mi + '_' + si + '_' + t0 + 'w' + nm, nm); } } }
      if (/\b(explo\w*|boom|crash\w*|bang|blast\w*|kaboom|thunder\w*)\b/.test(lt) && age >= 0 && age < 1.2) { if (playing(mi)) csOnce(mi + '_' + si + '_' + t0 + 'b', 'boom2'); if (age < .35) { flashA = Math.max(flashA, (1 - age / .35) * .9); shake = Math.max(shake, .6 * (1 - age / .35)); } words2d(t0 - beatOffset + .05, 'BOOM!', 3); }
      if (/\b(fall|falls|fell|falling|trip|trips|tripped|slip|slips|slipped|tumble\w*)\b/.test(lt) && age >= 0 && age < 1.8) { if (playing(mi)) csOnce(mi + '_' + si + '_' + t0 + 'f', 'thump'); const v = act[who % act.length], lie = eas(Math.min(age / .4, 1)) * (1 - eas(clamp((age - 1.3) / .4, 0, 1))); v.g.rotation.x = -1.4 * lie; v.g.position.y += .5 * lie; v.mouth.scale.set(1, 3, 1); if (lie > .5) { spr('\u{1F4AB}', v.g.position.x, 5.2, v.g.position.z, 1.1); words2d(t0 - beatOffset + .2, 'OOF!', 2); } }
      if (/\b(sleep|sleeps|asleep|sleeping|nap|naps|snore\w*|yawn\w*|dream\w*)\b/.test(lt) && age >= 0 && age < 6) { if (playing(mi) && Math.floor(age / 2.4) !== csState.snoreIdx) { csState.snoreIdx = Math.floor(age / 2.4); try { CSFX.snore(); } catch (e) { } } const v = act[who % act.length]; v.head.rotation.x = .55; v.body.rotation.x = .25; v.armL.rotation.x = v.armR.rotation.x = .2; v.mouth.scale.set(1, .5, 1); for (let k = 0; k < 3; k++) { const ag = (t * .5 + k / 3) % 1; spr('\u{1F4A4}', v.g.position.x + .8 + ag * .8, 5 + ag * 1.8, v.g.position.z, 1 - ag * .5); } }
    }
    act.concat(ex).forEach(c => { if (c.costume === 'ghost') c.g.position.y += .6 + Math.sin(t * 3) * .3; if (c.extras.wings) { const f = Math.sin(t * 7) * .5; c.extras.wings[0].rotation.z = f; c.extras.wings[1].rotation.z = -f; } });
    // camera: close enough to see the actors, moving in a different way for each scene
    const camStyle = ['orbit', 'dolly', 'crane', 'side'][hash(mi, si, 9 + camSeed) % 4], seed = hash(mi, si, 2 + camSeed) % 628 / 100, D = clamp(7 + spread * .9, 9, 17) * (camSeed > 0 ? .78 : 1) * (1 - zoomPunch * .22);
    if (camStyle === 'orbit') { const a = seed + t * .3; CAM.position.set(look.x + Math.cos(a) * D * .8, 4.2, look.z + Math.sin(a) * D * .8 + D * .4); }
    else if (camStyle === 'dolly') { CAM.position.set(look.x + Math.sin(seed) * 4, 3.2 + u * .8, look.z + D * 1.15 - u * D * .5); }
    else if (camStyle === 'crane') { CAM.position.set(look.x - 6, 1.6 + u * 7, look.z + D * .9 - u * 2); }
    else { CAM.position.set(look.x + 2, 3.4, look.z + D); }
    if (fightCam) { CAM.position.lerp(fightCam.pos, fightCam.k); look.lerp(fightCam.look, fightCam.k); }
    if (sightCam) {   // over the shoulder of whoever is looking: you see exactly what they see
      const S = sightCam.sp.g.position, P = sightCam.P, dx = P.x - S.x, dz = P.z - S.z, L = Math.hypot(dx, dz) || 1, nx = dx / L, nz = dz / L;
      CAM.position.lerp(new THREE.Vector3(S.x - nx * 6.5 - nz * 5.2, 5.4, S.z - nz * 6.5 + nx * 5.2), sightCam.k); look.lerp(new THREE.Vector3(P.x * .75, 2.4, P.z * .8), sightCam.k);
    }
    if (shake) CAM.position.add(new THREE.Vector3((Math.random() - .5) * shake, (Math.random() - .5) * shake, 0));
    CAM.lookAt(look); rim.position.set(look.x - 8, 6, look.z + 4);
    return info;
  }
  // what is being SAID right now (the narrator's caption at the start, then every line) decides what is being DONE
  function wordsStyle(dl, sc, mi, si, t) {
    const first = dl.length ? dl[0].start : 0, ln = dl.find(l => t >= l.start - .1 && t <= l.end + .4);
    const txt = ln ? ln.text : (t < first - .1 ? sc.text : null); if (!txt) return null;
    const v = verbStyle(String(txt).toLowerCase(), mi, si, true); return v && v !== 'talk' && v !== 'look' ? v : null;
  }
  // a scene is a sequence of shots; each shot has its own camera, action and dialogue
  function direct(mi, si, mv, sc, t) {
    const info = getInfo(mi, si, mv, sc), dl = getDialogue(mi, si, mv, sc), nb = dl.beats ? dl.beats.length : 1;
    if (dl.beatStarts) {
      let bt = 0; for (let k = 0; k < dl.beatStarts.length; k++) if (t >= dl.beatStarts[k]) bt = k;
      const bs = dl.beatStarts[bt], be = dl.beatEnds[bt], bb = dl.beats[bt]; beatOffset = bs;
      return directBeat(mi, si, mv, sc, t - bs, Object.assign({}, info, { style: wordsStyle(dl, sc, mi, si, t) || bb.style, present: bb.present, emo: bb.emo }), Math.max(2, be - bs), bt);
    }
    const BL = dl.beatLen || 4, beat = Math.min(nb - 1, Math.floor(t / BL)), b = (dl.beats && dl.beats[beat]) || { style: info.style, present: info.present };
    beatOffset = beat * BL;
    return directBeat(mi, si, mv, sc, t - beat * BL, Object.assign({}, info, { style: wordsStyle(dl, sc, mi, si, t) || b.style, present: b.present, emo: b.emo }), BL, beat);
  }

  // ---------- sets: each of the three is built once and shown or hidden ----------
  const stages = {};
  // ---------- public entry: replaces each scene's 2D drawing ----------
  function draw3D(mi, si, mv, sc, ctx, w, h, t) {
    const rd = renderer(w, h); if (!rd) return false;
    if (lastSceneKey !== mi + '_' + si) { lastSceneKey = mi + '_' + si; clearSpeechTimers(); }
    try {
      const vis = (typeof _MVIS !== 'undefined' && _MVIS[mi]) ? _MVIS[mi] : null;
      const info = getInfo(mi, si, mv, sc); moodScore(mi, si, mv, sc, t); csAmbience(mi, info);
      const accent = vis ? hexOf(vis[2]) : 0xff7733, skyTop = vis ? hexOf(vis[0]) : hexOf(mv.bg), skyMid = vis ? hexOf(vis[1]) : hexOf(mv.bg);
      Object.keys(stages).forEach(k => { stages[k].visible = (k === info.kind); });
      if (!stages[info.kind]) { stages[info.kind] = buildAnyStage(info.kind, skyTop, hash(7, info.kind.length, 1)); SC.add(stages[info.kind]); }
      stage = stages[info.kind]; stage.visible = true; if (info.style !== 'fly') stage.position.z = 0;
      const indoor = !!INDOOR[info.kind], tod = info.tod, space = info.kind === 'space';
      const SKY = { day: 0x7ec8ff, night: 0x0e1424, dawn: 0xffb88a, dusk: 0x7a5aa0, storm: 0x4a5566 };
      const bg = space ? 0x05071a : indoor ? (tod === 'night' ? 0x1a1612 : 0x2a2622) : (info.kind === 'city' && tod === 'day' ? 0x6fa8dc : SKY[tod]);
      SC.background = new THREE.Color(bg); SC.fog = new THREE.Fog(bg, indoor ? 70 : 38, indoor ? 140 : 120);
      const dim = (tod === 'night' || tod === 'storm') && !space;
      hemi.color.setHex(indoor ? 0xfff1d0 : space ? 0x7788bb : tod === 'dawn' ? 0xffd9b0 : tod === 'dusk' ? 0xc9a8ff : dim ? 0x7788bb : 0xffffff); hemi.groundColor.setHex(skyMid);
      hemi.intensity = indoor ? (tod === 'night' ? .75 : .95) : space ? .6 : dim ? .5 : tod === 'dusk' ? .75 : 1.0;
      sun.color.setHex(tod === 'dawn' ? 0xffc27a : tod === 'dusk' ? 0xb890ff : dim || space ? 0x99aaff : 0xfff2cc); sun.intensity = indoor ? .5 : dim ? .5 : 1.0; rim.color.setHex(accent); rim.intensity = (info.dark || tod === 'night') ? 1.5 : 1.0;
      stage.children.forEach(c => { if (c.userData && c.userData.spin) { c.rotation.x = t * c.userData.spin; c.rotation.y = t * c.userData.spin * .7; } });
      direct(mi, si, mv, sc, t);
      weatherFx(t, info);
      if (info.tod === 'storm' && ((t * .43 + si * .21) % 1) < .07) { hemi.intensity = 2.6; SC.background = new THREE.Color(0xdde6ff); }
      rd.render(SC, CAM);
      ctx.drawImage(rd.domElement, 0, 0, w, h);
      if (flashA > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (flashA * .5) + ')'; ctx.fillRect(0, 0, w, h); }
      { const dlx = getDialogue(mi, si, mv, sc); let BL, bi, pos; if (dlx.beatStarts) { bi = 0; for (let k = 0; k < dlx.beatStarts.length; k++) if (t >= dlx.beatStarts[k]) bi = k; BL = dlx.beatEnds[bi] - dlx.beatStarts[bi]; pos = t - dlx.beatStarts[bi]; } else { BL = dlx.beatLen || 4; bi = Math.min(2, Math.floor(t / BL)); pos = t - bi * BL; }
        let fade = bi === 0 ? Math.max(0, 1 - t / 0.45) : Math.max(0, 1 - pos / 0.22); if (pos > BL - 0.18) fade = Math.max(fade, (pos - (BL - 0.18)) / 0.18);
        if (fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, fade) + ')'; ctx.fillRect(0, 0, w, h); } }
      { const nEnd = 0.4 + wc(sc.text) / 2.6 + (si === 0 ? (wc(mv.title) + 17) / 2.6 + 1.0 : 0) + 0.3;
        if (t >= 0.3 && t <= nEnd) { const fs = Math.max(14, Math.round(h * .034)), nm = narratorPersona(mi, mv); ctx.save(); ctx.textAlign = 'center'; ctx.font = 'bold ' + fs + 'px Arial';
          const txt = '\uD83C\uDF99\uFE0F  NARRATOR  \u2022  ' + nm, tw = ctx.measureText(txt).width; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(w / 2 - tw / 2 - fs, h * .8 - fs * 1.05, tw + fs * 2, fs * 1.5);
          ctx.fillStyle = '#ffd54f'; ctx.fillText(txt, w / 2, h * .8); ctx.restore(); } }
      if (t < 3.6) {
        const a = t < .5 ? t / .5 : (t > 2.9 ? Math.max(0, (3.6 - t) / .7) : 1), fs = Math.max(14, Math.round(h * .036)), nm = '\uD83D\uDCCD  ' + placeNameFor(mv, info.kind).toUpperCase();
        ctx.save(); ctx.globalAlpha = a; ctx.font = 'bold ' + fs + 'px Arial'; ctx.textAlign = 'left'; const tw = ctx.measureText(nm).width;
        ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(w * .04, h * .12, tw + fs * 1.6, fs * 1.7); ctx.fillStyle = '#7dffb2'; ctx.fillRect(w * .04, h * .12, fs * .25, fs * 1.7); ctx.fillStyle = '#fff'; ctx.fillText(nm, w * .04 + fs * .8, h * .12 + fs * 1.2); ctx.restore();
      }
      if (si === 0 && t > .1 && t < 1 && titleKey !== mi && playing(mi)) { titleKey = mi; try { sfx.power(); setTimeout(() => { try { sfx.cheer(); } catch (e) { } }, 350); } catch (e) { } }
      if (si === 0 && t < 6.5) {
        const a = t < .6 ? t / .6 : (t > 5.2 ? Math.max(0, (6.5 - t) / 1.3) : 1); ctx.save(); ctx.globalAlpha = a * .92;
        const gg = ctx.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, 'rgba(0,0,0,.85)'); gg.addColorStop(.5, 'rgba(0,0,0,.35)'); gg.addColorStop(1, 'rgba(0,0,0,.85)'); ctx.fillStyle = gg; ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,213,79,.9)'; ctx.font = 'bold ' + Math.round(h * .032) + 'px Arial'; ctx.fillText('EXPLOX CINEMAS PRESENTS', w / 2, h * .36);
        let fs = Math.round(h * .1); ctx.font = '900 ' + fs + 'px Arial Black, Arial'; const tw = ctx.measureText(mv.title).width; if (tw > w * .9) { fs = Math.floor(fs * w * .9 / tw); ctx.font = '900 ' + fs + 'px Arial Black, Arial'; }
        ctx.lineJoin = 'round'; ctx.lineWidth = h * .012; ctx.strokeStyle = '#220033'; ctx.strokeText(mv.title, w / 2, h * .5); ctx.fillStyle = '#ffffff'; ctx.fillText(mv.title, w / 2, h * .5);
        ctx.font = 'bold ' + Math.round(h * .04) + 'px Arial'; ctx.fillStyle = '#9fe3ff'; ctx.fillText(mv.genre || '', w / 2, h * .6); ctx.restore();
      }
      words.forEach(wd => {
        const age = t - wd.t0, a = clamp(1 - age * .6, 0, 1); if (age < 0 || a <= 0) return;
        ctx.save(); ctx.translate(w * (.28 + (wd.i * .13) % .5), h * (.3 + (wd.i * .09) % .18)); ctx.rotate(((wd.i % 3) - 1) * .18); ctx.scale(1 + Math.min(age, .25) * 2, 1 + Math.min(age, .25) * 2);
        ctx.globalAlpha = a; ctx.font = `900 ${Math.round(h * .085)}px Arial Black, Arial`; { const fw = ctx.measureText(wd.text).width; if (fw > w * .8) ctx.font = `900 ${Math.floor(h * .085 * w * .8 / fw)}px Arial Black, Arial`; } ctx.textAlign = 'center'; ctx.lineWidth = h * .014; ctx.strokeStyle = '#220022'; ctx.fillStyle = ['#ffee33', '#ff5588', '#44e0ff', '#7dff6a'][wd.i % 4];
        ctx.strokeText(wd.text, 0, 0); ctx.fillText(wd.text, 0, 0); ctx.restore();
      });
      if (fightHud) {   // fighting-game health bars, a combo counter and the SUPER MOVE banner
        const f = fightHud, bw = w * .36, bh = h * .034, y = h * .075, col = (v) => v > 50 ? '#5dff6a' : v > 25 ? '#ffd23f' : '#ff4040';
        ctx.save(); ctx.font = '900 ' + Math.round(h * .03) + 'px Arial Black, Arial'; ctx.lineJoin = 'round';
        [[w * .04, f.a, f.nameA, 'left'], [w * .96 - bw, f.b, f.nameB, 'right']].forEach(([x, hp, nm, side]) => {
          ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(x - 4, y - 4, bw + 8, bh + 8); ctx.fillStyle = '#3a1010'; ctx.fillRect(x, y, bw, bh); ctx.fillStyle = col(hp);
          const fw = bw * hp / 100; ctx.fillRect(side === 'left' ? x : x + bw - fw, y, fw, bh); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(side === 'left' ? x : x + bw - fw, y, fw, bh * .35);
          ctx.textAlign = side; ctx.lineWidth = h * .008; ctx.strokeStyle = '#000'; ctx.fillStyle = '#fff'; const tx = side === 'left' ? x : x + bw; ctx.strokeText(nm, tx, y - h * .012); ctx.fillText(nm, tx, y - h * .012);
        });
        ctx.textAlign = 'center'; ctx.font = '900 ' + Math.round(h * .045) + 'px Arial Black, Arial'; ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#000'; ctx.lineWidth = h * .01; ctx.strokeText('VS', w / 2, y + bh); ctx.fillText('VS', w / 2, y + bh);
        if (f.combo >= 2) { ctx.save(); ctx.translate(w * .16, h * .3); ctx.rotate(-.12); ctx.font = '900 ' + Math.round(h * .075) + 'px Arial Black, Arial'; ctx.textAlign = 'center'; ctx.lineWidth = h * .014; ctx.strokeStyle = '#220022'; ctx.fillStyle = '#ffee33'; const tx = f.combo + ' HIT COMBO!'; ctx.strokeText(tx, 0, 0); ctx.fillText(tx, 0, 0); ctx.restore(); }
        if (f.sup) { ctx.globalAlpha = .75 + .25 * Math.sin(t * 30); ctx.font = '900 ' + Math.round(h * .055) + 'px Arial Black, Arial'; ctx.fillStyle = '#ff4d4d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = h * .008; const tx = 'SUPER MOVE: ' + f.sup; ctx.strokeText(tx, w / 2, h * .2); ctx.fillText(tx, w / 2, h * .2); }
        ctx.restore();
      }
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
  const NARRATORS = [
    [/comedy|family|slice|sports/i, ['Captain Chuckles', 'Giggles the Narrator', 'Uncle Laughs']],
    [/mystery|thriller/i, ['Inspector Whisper', 'Mister Midnight']],
    [/sci-fi|space|mecha/i, ['Commander Orbit', 'Star Captain Nova']],
    [/epic|origin|founders|historical|drama|frontier|hometown|newcomer|founding|romance|underdog/i, ['The Old Storyteller', 'Grandpa Tales', 'Sage Explox']],
  ];
  function narratorPersona(mi, mv) { const g = (mv && mv.genre) || ''; for (const [re, names] of NARRATORS) if (re.test(g)) return names[mi % names.length]; return 'The Explox Storyteller'; }

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
  // ---------- scripted movies: the scene itself says where it is, when, what is there and what everybody says ----------
  function scriptInfo(mi, si, mv, sc) {
    const S = sc.script, who = [];
    S.lines.forEach(l => { if (l[0] !== 'N' && who.indexOf(l[0]) < 0) who.push(l[0]); });
    const [ka, kb, kc] = mainKinds(mi, mv), tod = S.tod || 'day', kind = S.place || 'city';
    return { text: sc.text || '', style: (S.lines[0] && S.lines[0][2]) || 'talk', present: ['A', 'B', 'C'].filter(w => who.indexOf(w) >= 0 || w !== 'C'), extraN: S.crowd || 0, extraKind: S.crowdKind || ka,
      kinds: { A: ka, B: kb, C: kc }, prop: S.prop || null, kind, dark: tod === 'night' || tod === 'storm', comedy: !!mv.comedy, surprise: false, tod, weather: S.weather || weatherOf('', kind, tod), script: true };
  }
  function listenerEmo(e) { return ({ angry: 'scared', scared: 'worried', joy: 'joy', excited: 'happy', sad: 'worried', surprised: 'surprised', shocked: 'surprised', determined: 'determined', curious: 'curious', worried: 'worried', happy: 'happy', serious: 'serious', warm: 'happy', relieved: 'happy' })[e] || 'neutral'; }
  function scriptDialogue(mi, si, mv, sc, key) {
    const S = sc.script, res = []; res.beats = []; res.beatStarts = []; res.beatEnds = []; dlgCache[key] = res;
    const roles = castRoles(mi, mv), nameOf = { A: roles[0].role, B: roles[1].role, C: roles[2].role, N: 'NARRATOR \u2022 ' + narratorPersona(mi, mv) };
    let tcur = 0.4 + wc(sc.text) / 2.6 + 0.9 + (si === 0 ? (wc(mv.title) + 17) / 2.6 + 1.0 : 0);
    const base = scriptLines(mi, si, mv, sc), lines = base.map(l => { const o = { who: l[0], emo: l[1], act: l[2], text: l[3], role: nameOf[l[0]], pers: l[0] === 'N' ? null : persFor(mi, mv, 'ABC'.indexOf(l[0])), start: tcur }; o.end = o.start + wc(o.text) / 2.4 + 0.5; tcur = o.end + 1.5; res.push(o); return o; });
    for (let i = 0; i < lines.length; i += 2) {
      const grp = lines.slice(i, i + 2), first = grp[0], who = {};
      grp.forEach(l => { if (l.who !== 'N') who[l.who] = l; });
      const present = ['A', 'B'].concat(who.C ? ['C'] : []);
      const emo = present.map(w => { if (who[w]) return who[w].emo; const sp = grp.find(l => l.who !== 'N' && l.who !== w); return sp ? listenerEmo(sp.emo) : 'neutral'; });
      { const a0s = first.act || 'talk', grpTxt = grp.map(l => l.text).join(' '); res.beats.push({ style: (a0s === 'talk' || a0s === 'look' || a0s === 'walk') ? (chatActivity(mi, si, i, { dark: sc.script.tod === 'night' || sc.script.tod === 'storm', comedy: !!mv.comedy }, grpTxt + ' ' + (sc.text || '')) || a0s) : a0s, present, emo }); }
      res.beatStarts.push(i === 0 ? 0 : Math.max(0.5, first.start - 0.6));
    }
    for (let k = 0; k < res.beatStarts.length; k++) res.beatEnds.push(k + 1 < res.beatStarts.length ? res.beatStarts[k + 1] : 0);
    res.total = Math.max(60, tcur + 0.8); res.beatEnds[res.beatEnds.length - 1] = res.total;
    return res;
  }
  // ---------- personalities: every character talks in their own way (brave, funny, nervous, boastful, wise or kind) ----------
  const PERS = {
    hero:    { tag: 'the brave one', rate: 1.0, dp: -.05, open: ['Alright.', 'Okay.', 'Right.', 'Listen.', '', '', ''], close: ['Stay sharp.', 'I have got this.', 'Together.', 'Eyes up.', '', '', ''], catch: "Let's roll!" },
    goof:    { tag: 'the funny one', rate: 1.12, dp: .18, open: ['Whoa!', 'Uh oh!', 'Hee hee!', 'Ooh!', 'Hey hey!', '', ''], close: ['Is there a snack involved?', 'My tummy says hi.', 'Wow, wow, wow!', 'I need a nap after this.', 'Hee hee!', '', ''], catch: 'Is there a snack involved?' },
    nervous: { tag: 'the worrier', rate: 1.15, dp: .25, open: ['Oh no, oh no.', 'Um...', 'Okay, okay, okay.', 'I knew it.', 'Eep!', '', ''], close: ['Please be okay!', 'I am shaking!', 'Can we go home?', 'My knees are knocking.', '', '', ''], catch: 'I have a bad feeling about this.' },
    rival:   { tag: 'the rival', rate: .94, dp: -.18, open: ['Pfft.', 'Please.', 'Watch and learn.', 'Ha.', 'Amateurs.', '', ''], close: ['Try to keep up.', 'You are welcome.', 'Obviously.', 'How adorable.', '', '', ''], catch: 'Too easy.' },
    wise:    { tag: 'the wise one', rate: .9, dp: -.12, open: ['Hmm.', 'Patience.', 'Remember this.', 'Slowly now.', '', '', ''], close: ['Think before you leap.', 'Every storm passes.', 'Listen with your heart.', 'Take your time.', '', '', ''], catch: 'Patience, my friend.' },
    sweet:   { tag: 'the kind one', rate: 1.03, dp: .1, open: ['Hey.', 'It is okay.', 'Aww.', 'Easy now.', '', '', ''], close: ["You're doing great.", 'We are a team.', 'I believe in you.', 'I am right here.', '', '', ''], catch: 'We are a team.' },
  };
  function persFor(mi, mv, i) {
    const c = mv.cast && mv.cast['ABC'[i]]; if (c && c.pers) return c.pers;
    const hist = mi >= 14 && mi < 29, A = hist ? ['wise', 'hero', 'sweet', 'hero'] : ['hero', 'hero', 'wise', 'sweet'], B = hist ? ['sweet', 'nervous', 'wise', 'sweet'] : ['goof', 'nervous', 'goof', 'sweet', 'goof'];
    const a0 = A[mi % A.length]; let b0 = B[mi % B.length]; if (b0 === a0) b0 = B[(mi + 1) % B.length] === a0 ? (a0 === 'sweet' ? 'goof' : 'sweet') : B[(mi + 1) % B.length];
    return i === 0 ? a0 : i === 1 ? b0 : 'rival';
  }
  const CORE_A = {
    danger: ['Look out, {o}!', 'Watch out, {o}!', 'Behind you, {o}!', 'Get back, {o}!', 'Danger, {o}!', 'Duck, {o}!'],
    discover: ['{o}, look at this!', '{o}, did you see that?', 'Wait. What is that?', 'I think I found something!', '{o}, over here!', 'Hold on. There is something there.'],
    trouble: ['Oh no!', 'This is bad, {o}.', 'Something is wrong.', 'We have a problem, {o}.', 'That cannot be right.', 'It is gone!'],
    win: ['We did it, {o}!', 'Yes!', 'We won!', 'Look at that, {o}!', 'It worked!', 'Best moment ever!'],
    start: ['Are you ready, {o}?', 'This is it.', 'Here we go.', 'Time to begin, {o}.', 'Everyone in position.', 'Let us start.'],
    plan: ['Listen, {o}.', 'I have a plan.', 'Here is the idea.', 'We stay together, {o}.', 'First, we need to think.', 'Let us split the work.'],
    travel: ['This way, {o}.', 'Keep up, {o}.', 'We are getting close.', 'Eyes open, {o}.', 'We are almost at {place}.', 'Follow me.'],
    build: ['Hand me that, {o}.', 'One more piece.', 'Hold it steady, {o}.', 'Almost done.', 'Let us build this.', 'Pass me the tools.'],
    fight: ['Take that, {o}!', 'Not today!', 'Here I come!', 'This ends now!', 'You cannot win, {o}!', 'Come on, then!'],
    chase: ['Faster, {o}!', 'Keep running!', 'This way, quick!', 'Do not stop!', 'Jump, {o}!', 'They are right behind us!'],
    race: ['Start your engines!', 'Catch me if you can!', 'Floor it, {o}!', 'Here we go!', 'Hold on tight!', 'Nobody passes me today!'],
  };
  const CORE_B = {
    danger: ['I see it!', 'I am on it!', 'Stay behind me!', 'We can handle this!', 'Cover me!', 'Not on my watch!'],
    discover: ['What is it?', 'Let me see.', 'Careful, {o}.', 'Show me!', 'I see it too.', 'Is it safe?'],
    trouble: ['Do not panic.', 'We will fix it.', 'Think, think.', 'Let us start over.', 'There must be a way.', 'Stay calm, {o}.'],
    win: ['I knew we could!', 'Together we never lose.', 'Let us celebrate!', 'What a team!', 'Unbelievable!', 'High five, {o}!'],
    start: ['Ready!', 'Let us do this.', 'I am right behind you.', 'Lead the way.', 'Say the word.', 'Born ready.'],
    plan: ['I am listening.', 'That might work.', 'Tell me what to do.', 'Okay, go on.', 'I will follow your lead.', 'What if it goes wrong?'],
    travel: ['Right behind you.', 'Lead on.', 'I see {place}.', 'How much farther?', 'Watch your step.', 'On my way.'],
    build: ['Here you go.', 'Looks great.', 'Nice work.', 'Is this right?', 'Almost there.', 'Got it.'],
    fight: ['Try again!', 'You cannot stop me!', 'Nice try!', 'We will see!', 'Is that all?', 'Bring it!'],
    chase: ['Wait for me!', 'I am right behind you!', 'Almost there!', 'I cannot keep up!', 'Go go go!', 'Do not look back!'],
    race: ['Not a chance!', 'Right behind you!', 'This is going to be close!', 'Watch the turn!', 'I see the finish!', 'Eat my dust!'],
    mood: ['I feel it too, {o}.', 'Stay alert.', 'Hmm.', 'Let us see what happens.', 'Me too.', 'Keep going.', 'Good point.', 'I was thinking the same thing.', 'Lead the way, {o}.', 'You said it.'],
  };
  const CORE_MOOD = {
    night: ['It is so quiet tonight, {o}.', 'The dark feels different.', 'I can hear our footsteps.', 'Look at those stars, {o}.', 'Even the crickets are whispering.', 'Do you ever wonder who else is awake?'],
    storm: ['That storm is getting closer, {o}.', 'Hear that thunder?', 'The wind is picking up.', 'Hold on to your hat, {o}.', 'The sky looks angry today.', 'Let us find shelter soon.'],
    dawn: ['A new day begins, {o}.', 'Look at that sunrise.', 'Everything is so still this early.', 'Morning, {o}.', 'The whole sky is turning gold.', 'Fresh start, {o}.'],
    dusk: ['The light is fading, {o}.', 'What a sunset.', 'The lamps are coming on.', 'Evening already.', 'Look how long our shadows are.', 'The day went by fast.'],
    day: ['Something feels different today, {o}.', 'What a day, {o}.', 'Everything looks so bright.', 'I have a good feeling.', 'Take a deep breath, {o}.', 'Look around, {o}. Really look.', 'I could stay here all day.', 'Funny how quiet it is.', 'Today is going to be interesting.', 'Do you hear that, {o}?'],
    dark: ['Something feels wrong here, {o}.', 'Too quiet, {o}.', 'I do not like this.', 'Stay close.', 'Did you feel that chill?', 'Keep your voice down.'],
  };

  const usedLines = {}, coreUse = {};
  function compose(mi, pers, bank, side, vars, h) {
    const P = PERS[pers] || PERS.hero, used = usedLines[mi] || (usedLines[mi] = new Set()), cu = coreUse[mi] || (coreUse[mi] = {});
    for (let k = 0; k < 24; k++) {
      const core = bank[(h + k * 5) % bank.length], ck = side + '|' + core; if ((cu[ck] || 0) >= 3) continue;
      let op = P.open[((h >>> 2) + k * 3) % P.open.length]; const cl = P.close[((h >>> 5) + k * 7) % P.close.length];
      const fk = 'fav|' + side; if (k === 0 && h % 5 === 0 && (cu[fk] || 0) < 3) { op = vars.fav || P.catch; cu[fk] = (cu[fk] || 0) + 1; }
      if (cl === (vars.fav || P.catch) || (op && cl && op === cl) || (cl && core.indexOf(cl) >= 0) || (op && core.indexOf(op) >= 0)) continue;
      let t = [op, core, cl].filter(Boolean).join(' ').replace(/\{o\}/g, vars.o).replace(/\{place\}/g, vars.place).replace(/\{thing\}/g, vars.thing || 'thing');
      t = t.replace(/(^|[.!?]\s+)([a-z])/g, (m, pre, c) => pre + c.toUpperCase());
      if (used.has(t)) continue; used.add(t); cu[ck] = (cu[ck] || 0) + 1; return t;
    }
    return null;
  }
  // ---------- character profiles: a signature fighting move, a favorite sentence and a biggest problem ----------
  const MOVE_BY_KIND = { robot: ['LASER PUNCH', 'punch'], dino: ['TAIL WHIP', 'spin'], ninja: ['SHADOW FLIP KICK', 'jumpkick'], grandma: ['ROLLING PIN SMASH', 'punch'], cat: ['CLAW FLURRY', 'kick'], pizza: ['CHEESE SPIN', 'spin'], detective: ['MAGNIFYING FLASH', 'kick'], ghost: ['SPOOKY SPIN', 'spin'], alien: ['UFO FLYING KICK', 'jumpkick'], dragon: ['FIRE-BREATH PUNCH', 'punch'], racer: ['TURBO DRIFT KICK', 'kick'], athlete: ['SLAM DUNK PUNCH', 'jumpkick'], king: ['ROYAL SMACK', 'punch'], doctor: ['BANDAGE SPIN', 'spin'], pioneer: ['LASSO SPIN', 'spin'], pilot: ['PROPELLER SPIN', 'spin'], wizard: ['SPARKLE BLAST KICK', 'kick'], hero: ['HERO PUNCH', 'punch'] };
  const PROB = {
    hero: ['I know, I should ask for help. I just hate asking.', 'I always say I can do it alone. I cannot.', 'Being proud is my biggest problem. Do not tell anyone.'],
    goof: ['Sorry, I got hungry again.', 'I cannot help it. Snacks are my weakness.', 'My biggest problem? I forgot what we were doing.'],
    nervous: ['I am scared, okay? I am scared of everything.', 'My knees will not stop shaking.', 'Worrying is my full-time job.'],
    rival: ['I cannot stand losing. You know that.', 'Fine, I hate when someone else is better.', 'My pride is my biggest problem.'],
    wise: ['Sorry. I am talking too much again.', 'Wise people also get lost sometimes.', 'I think too long before I act. It is a flaw.'],
    sweet: ['I could not say no. I never can.', 'I want everyone to be happy. It is exhausting.', 'My biggest problem is trusting too fast.'],
  };
  function profileOf(mi, mv, i) {
    const c = mv.cast && mv.cast['ABC'[i]], pers = persFor(mi, mv, i), kind = castRoles(mi, mv)[i].kind, mk = MOVE_BY_KIND[kind] || MOVE_BY_KIND.hero;
    return { pers, move: (c && c.move) || mk[0], mtype: (c && c.mtype) || mk[1], fav: (c && c.fav) || (PERS[pers] || PERS.hero).catch, say: (c && c.say) || null };
  }
  // scripted scenes also get the favorite sentence and the confession about the biggest problem now and then
  function scriptLines(mi, si, mv, sc) {
    const base = sc.script.lines.slice(), prA = profileOf(mi, mv, 0), prB = profileOf(mi, mv, 1);
    if (si > 0 && si % 3 === 1 && prA.fav) base.push(['A', 'determined', 'talk', prA.fav]);
    if (si % 3 === 2 && prB.fav) base.push(['B', 'happy', 'talk', prB.fav]);
    if (si > 0 && si % 4 === 3) { const who = si % 8 === 3 ? 'B' : 'A', pr = who === 'A' ? prA : prB; if (pr.say) base.push([who, 'worried', 'talk', pr.say]); }
    return base;
  }
  function introCast(mi, mv) { const r = castRoles(mi, mv); return r[0].role + ', ' + PERS[persFor(mi, mv, 0)].tag + ', and ' + r[1].role + ', ' + PERS[persFor(mi, mv, 1)].tag; }
  // Every caption is one story moment of about 11 seconds, shown as three shots (wide, talking, reaction) with fades between them.
  // The two characters talk to each other by name about what is happening, where they are and what is in the scene.
  const BEATS = 3;
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
  const LINES = {
    danger:   [['Look out, {B}!', 'Watch out, {B}! Behind you!', 'Danger! Get back, {B}!'], ['I see it, {A}! Stay behind me!', 'We can handle this together, {A}!', 'Do not worry, {A}. I am ready!']],
    discover: [['{B}, come and look at this!', '{B}, did you see that?', 'I think I found something, {B}!'], ['What is it, {A}? Be careful!', 'Let me see, {A}.', 'Stay careful, {A}. We do not know what it is.']],
    trouble:  [['Oh no, {B}!', '{B}, this is bad. Really bad.', 'We have a big problem, {B}.'], ['Do not panic, {A}. We will find a way.', 'Stay calm, {A}. Think!', 'We can fix this, {A}. Together.']],
    win:      [['We did it, {B}!', 'Yes! Best day ever, {B}!', '{B}, we are champions!'], ['I knew we could, {A}!', 'Together we never lose!', 'Let us celebrate, {A}!']],
    start:    [['Are you ready, {B}?', 'This is the moment, {B}.', 'Here we go, {B}!'], ['Ready when you are, {A}!', 'Let us do this, {A}!', 'I am right behind you, {A}.']],
    plan:     [['Listen, {B}. Here is my plan.', '{B}, I have an idea.', 'We need to stay together, {B}.'], ['I am listening, {A}.', 'That might just work, {A}!', 'Tell me what to do, {A}.']],
    travel:   [['Follow me to {place}, {B}.', '{place} is not far now, {B}.', 'Keep your eyes open, {B}.'], ['Right behind you, {A}!', 'Lead the way, {A}.', 'I can see {place} ahead, {A}!']],
    build:    [['Hand me that, {B}.', 'Together we can build this, {B}!', 'One more piece, {B}.'], ['Here you go, {A}!', 'Looks great, {A}!', 'We are almost done, {A}.']],
    fight:    [['Take that, {B}!', 'Not today, {B}!', 'This ends now, {B}!'], ['Ha! Try again, {A}!', 'You cannot stop me, {A}!', 'We will see about that, {A}!']],
    chase:    [['Faster, {B}! Faster!', 'Do not let them catch us, {B}!', 'This way, {B}! Quick!'], ['Wait for me, {A}!', 'I am right behind you, {A}!', 'Keep running, {A}!']],
    race:     [['Start your engines, {B}!', 'Catch me if you can, {B}!', 'Here we go, {B}!'], ['Not a chance, {A}!', 'I am right behind you, {A}!', 'This is going to be close, {A}!']],
  };
  const PROPLINE = { danger: 'Get behind the {thing}, {B}!', start: 'To the {thing}, {B}!', win: 'Look at the {thing}, {B}! We did it!', travel: 'We must reach the {thing}, {B}.', discover: '{B}, look at that {thing}!' };
  const THING = { rocket: 'rocket', pizza: 'pizza', coins: 'S.I.P.', house: 'house', wall: 'wall', portal: 'portal', trophy: 'trophy', car: 'car', book: 'book', shield: 'shield', fire: 'fire', tree: 'old tree', lantern: 'light', moon: 'moon', sun: 'sun', heart: 'heart', bolt: 'lightning' };
  const PLACE = { airport: 'the airport', library: 'the library', hospital: 'the hospital', police: 'the police station', cityhall: 'City Hall', prison: 'the prison', suburbs: 'the suburbs', park: 'the park', vault: 'the vault', track: 'the track', arena: 'the arena', dojo: 'the dojo', temple: 'the temple', castle: 'the castle', snow: 'the snow', beach: 'the beach', desert: 'the frontier', jungle: 'the jungle', scrapyard: 'the scrapyard', market: 'the market', lab: 'the lab', school: 'the school', house: 'the house', shop: 'the shop', nature: 'the countryside', city: 'the city', space: 'space' };
  const MOOD = { night: 'It is so quiet tonight, {B}.', storm: 'That storm is getting closer, {B}.', dawn: 'A new day begins, {B}.', dusk: 'The light is fading, {B}.', day: 'Something feels different today, {B}.' };
  const MOODB = ['I feel it too, {A}.', 'Stay alert, {A}.', 'Let us see what happens, {A}.'];
  const EMOCAT = { danger: ['scared', 'determined'], discover: ['surprised', 'curious'], trouble: ['sad', 'worried'], win: ['joy', 'joy'], start: ['determined', 'excited'], plan: ['serious', 'happy'], travel: ['determined', 'happy'], build: ['determined', 'happy'], fight: ['angry', 'angry'], chase: ['scared', 'excited'], race: ['excited', 'determined'], mood: ['curious', 'happy'] };
  const REACT_EMO = { danger: ['determined', 'worried'], trouble: ['worried', 'worried'], discover: ['surprised', 'surprised'], fight: ['determined', 'scared'], chase: ['excited', 'scared'] };
  const REACT_STYLE = { danger: 'panic', trouble: 'panic', win: 'party', fight: 'fight', chase: 'run', race: 'run', discover: 'look', mood: 'look' };
  const addr = (n) => String(n || '').replace(/^The\s+/i, '');
  function getDialogue(mi, si, mv, sc) {
    const key = mi + '_' + si; if (dlgCache[key]) return dlgCache[key];
    if (sc.script) return scriptDialogue(mi, si, mv, sc, key);
    const info = getInfo(mi, si, mv, sc), roles = castRoles(mi, mv), nameOf = { A: roles[0].role, B: roles[1].role, C: roles[2].role };
    const text = String(sc.text || ''), h = hash(mi, si, 21), res = [];
    res.beats = []; res.beatLen = 4; res.total = 12; dlgCache[key] = res;
    const mature = MATURE.test(text);
    let cat = null;
    if (!mature) {
      cat = /\b(race|races|racing|raced|racer|racers|grid|slalom|lap|laps)\b/i.test(text) ? 'race' : info.style === 'fight' ? 'fight' : info.style === 'run' ? 'chase' : info.style === 'sneak' ? 'discover' : null;
      if (!cat) { const f = CAT_RE.find(c => c[1].test(text)); cat = f ? f[0] : null; }
    }
    const mood = !cat; if (mood) cat = 'mood';
    const a = addr(nameOf.A), b = addr(nameOf.B), place = PLACE[info.kind] || 'there', thing = THING[info.prop] || '';
    const fill = (x) => x.replace(/\{A\}/g, a).replace(/\{B\}/g, b).replace(/\{place\}/g, place).replace(/\{thing\}/g, thing);
    const quote = mature ? null : text.match(/["\u201C]([^"\u201D]{3,90})["\u201D]/), who = text.match(/^([A-Z][A-Za-z' -]{2,26}):\s*["\u201C]/), label = who ? who[1] : null;
    const lines = [], persA = persFor(mi, mv, 0), persB = persFor(mi, mv, 1);
    const bankA = mood ? (CORE_MOOD[info.dark && info.tod === 'day' ? 'dark' : info.tod] || CORE_MOOD.day) : CORE_A[cat], bankB = mood ? CORE_B.mood : CORE_B[cat];
    const prA = profileOf(mi, mv, 0), prB = profileOf(mi, mv, 1);
    const tA = compose(mi, persA, bankA, 'A', { o: b, place, thing, fav: prA.fav }, h); let tB = compose(mi, persB, bankB, 'B', { o: a, place, thing, fav: prB.fav }, hash(h, 3, 9));
    if (si > 1 && si % 5 === 2) { const pl = PROB[persB][((si / 5) | 0) % 3], us = usedLines[mi] || (usedLines[mi] = new Set()); if (!us.has(pl)) { us.add(pl); tB = pl; } }
    if (quote) { lines.push(['A', quote[1].replace(/\s+/g, ' ').trim(), label]); if (tB) lines.push(['B', tB]); }
    else { if (tA) lines.push(['A', tA]); if (tB) lines.push(['B', tB]); }
    let tcur = 0.4 + wc(text) / 2.6 + 0.5 + (si === 0 ? (wc(mv.title) + 17) / 2.6 + 1.0 : 0);
    lines.forEach(l => { const o = { who: l[0], text: l[1], role: l[2] || nameOf[l[0]], pers: l[0] === 'A' ? persA : persB, emo: (EMOCAT[cat] || ['neutral', 'neutral'])[l[0] === 'A' ? 0 : 1], start: tcur }; o.end = o.start + wc(o.text) / 2.6 + 0.3; tcur = o.end + 0.45; res.push(o); });
    const dur = clamp(Math.max(11.4, tcur + 1.0), 11.4, 20); res.total = dur; res.beatLen = dur / BEATS;
    const e0 = EMOCAT[cat] || ['neutral', 'neutral'], e2 = REACT_EMO[cat] || (cat === 'win' ? ['joy', 'joy'] : e0);
    const calm = (st) => (st === 'talk' || st === 'look' || st === 'walk' || st === 'work');
    const sA = calm(info.style) ? (chatActivity(mi, si, 0, info, text) || info.style) : info.style, sB = chatActivity(mi, si, 1, info, lines.map(l => l[1]).join(' ')) || 'talk', rr = REACT_STYLE[cat] || 'talk', sC = rr === 'talk' ? (chatActivity(mi, si, 2, info, '') || 'talk') : rr;
    res.beats.push({ style: sA, present: ['A', 'B'], emo: e0 }, { style: sB, present: ['A', 'B'].concat(info.present.indexOf('C') >= 0 ? ['C'] : []), emo: e0.concat(['neutral']) }, { style: sC, present: ['A', 'B'], emo: e2 });
    return res;
  }
  function charVoice(who, narrator) {
    if (!VOICES.length) loadVoices();
    const ranked = VOICES.map(v => [vScore(v), v]).filter(x => x[0] >= 0).sort((a, b) => b[0] - a[0]).map(x => x[1]);
    const others = ranked.filter(v => !narrator || v.name !== narrator.name), pool = others.length ? others : ranked;
    if (!pool.length) return { voice: null };
    const idx = { A: 0, B: 1, C: 2 }[who] || 0, v = pool[idx % pool.length];
    return { voice: v, rate: { A: .96, B: 1.04, C: 1.1 }[who] || 1, pitch: pool.length >= 3 ? { A: .95, B: 1.05, C: 1.12 }[who] : { A: .82, B: 1.22, C: 1.45 }[who] };
  }
  // ---------- show feel: a music score under every scene, sound effects for the big moments, audience laughs and cheers ----------
  const playing = (mi) => typeof cinemaState !== 'undefined' && cinemaState && cinemaState.phase === 'movie' && cinemaState.movieIdx === mi;
  const SCORES = {
    action: ['action_zone', 'speed_run', 'champion_run', 'solar_blast', 'rush_hour'], adventure: ['mission_zone', 'arcade_jam', 'beach_cruise', 'robot_dance'],
    thriller: ['midnight_city', 'late_night', 'night_watch', 'rain_and_jazz'], comedy: ['night_drive', 'alley_cats', 'morning_jog', 'hip_hop_city'],
    scifi: ['galaxy_drive', 'golden_hour', 'street_life'], drama: ['rainy_day', 'quiet_evening', 'river_walk'],
  };
  function scoreFor(mi, mv) {
    const g = (mv.genre || '').toLowerCase();
    const k = /action|mecha/.test(g) ? 'action' : /adventure|racing/.test(g) ? 'adventure' : /thriller|mystery|ghost/.test(g) ? 'thriller' : /comedy|family|slice/.test(g) ? 'comedy' : /sci-fi|space/.test(g) ? 'scifi' : 'drama';
    const list = SCORES[k]; return 'AiGame/explox/music/tracks/' + list[mi % list.length] + '.mp3';
  }
  const scoreState = { audio: null, key: '', muted: false, mood: null, since: 0, track: '' };
  function startScore(mi, mv) {
    try {
      const key = mi + ''; if (scoreState.audio && scoreState.key === key) return;
      if (scoreState.audio) { scoreState.audio.pause(); }
      if (!scoreState.muted && typeof bgMusic !== 'undefined' && bgMusic.isMuted && !bgMusic.isMuted() && typeof toggleBgMusic === 'function') { toggleBgMusic(); scoreState.muted = true; }
      const a = new Audio(scoreFor(mi, mv)); a.loop = true; a.volume = .2; a.play().catch(() => { }); scoreState.audio = a; scoreState.key = key;
    } catch (e) { }
  }
  function stopScore(restore) {
    try { csStop(); } catch (e) { }
    try {
      const a = scoreState.audio; if (a) { let v = a.volume; const iv = setInterval(() => { v -= .04; if (v <= 0) { clearInterval(iv); a.pause(); } else a.volume = v; }, 90); }
      scoreState.audio = null; scoreState.key = ''; scoreState.mood = null;
      if (restore && scoreState.muted && typeof toggleBgMusic === 'function') { toggleBgMusic(); scoreState.muted = false; }
    } catch (e) { }
  }
  // ---------- mood music: 21 moods, and the music changes with the scene (scared, happy, fight, sneaking, party ...) ----------
  const MOOD_TRACKS = {
    joy: ['sunrise_ride', 'morning_jog', 'park_walk'], excited: ['arcade_jam', 'robot_dance', 'skate_park'], happy: ['beach_cruise', 'market_day', 'lunch_break'], warm: ['golden_hour', 'sunset_chill', 'quiet_evening'],
    sad: ['rainy_day', 'rain_and_jazz'], angry: ['storm_chaser', 'solar_blast'], scared: ['night_watch', 'late_night'], shocked: ['cyber_city', 'tower_block'], surprised: ['crystal_city', 'times_square'],
    worried: ['midnight_city', 'bus_stop'], curious: ['jazz_cafe', 'corner_store', 'study_hall'], determined: ['mission_zone', 'champion_run'], serious: ['office_hours', 'tower_block'], relieved: ['river_walk', 'chill_lounge'],
    fight: ['action_zone', 'speed_run'], chase: ['speed_run', 'rush_hour', 'sport_mode'], sneak: ['night_drive', 'alley_cats'], party: ['club_night', 'funk_town', 'downtown_groove'],
    magic: ['penthouse_view', 'neon_lights', 'galaxy_drive'], night: ['neon_district', 'metro_groove'], adventure: ['mission_zone', 'galaxy_drive', 'beach_cruise'],
  };
  const MOOD_VOL = { scared: .15, sad: .17, serious: .16, night: .16, worried: .16, sneak: .15, fight: .26, chase: .26, party: .24, angry: .24, excited: .24, joy: .22 };
  const STYLE_MOOD = { fight: 'fight', run: 'chase', sneak: 'sneak', panic: 'scared', party: 'party', dance: 'party', highfive: 'joy', sing: 'happy', drum: 'excited', magic: 'magic', fly: 'adventure', climb: 'determined', exercise: 'determined', build: 'determined', skate: 'excited', jump: 'excited', play: 'happy', eat: 'happy', cook: 'happy', camp: 'warm', fish: 'relieved', write: 'curious', shop: 'curious', dig: 'curious', photo: 'happy', snowball: 'joy', juggle: 'joy', bubbles: 'joy', tugwar: 'determined' };
  const TOD_MOOD = { night: 'night', storm: 'angry', dawn: 'joy', dusk: 'warm', day: 'happy' };
  function moodAt(mi, si, mv, sc, t) {
    const info = getInfo(mi, si, mv, sc), dl = getDialogue(mi, si, mv, sc), ln = dl.find(l => t >= l.start - .1 && t <= l.end + .6); let bb = null;
    if (dl.beatStarts) { let b = 0; for (let k = 0; k < dl.beatStarts.length; k++) if (t >= dl.beatStarts[k]) b = k; bb = dl.beats[b]; } else if (dl.beats && dl.beats.length) bb = dl.beats[Math.min(dl.beats.length - 1, Math.floor(t / (dl.beatLen || 4)))];
    const style = wordsStyle(dl, sc, mi, si, t) || (bb && bb.style) || info.style, emo = (ln && ln.emo) || (bb && bb.emo && bb.emo[0]) || null;
    if (ln && ln.emo && ['scared', 'shocked', 'angry', 'sad', 'worried'].indexOf(ln.emo) >= 0) return ln.emo;
    if (STYLE_MOOD[style]) return STYLE_MOOD[style];
    if (emo && MOOD_TRACKS[emo]) return emo;
    return TOD_MOOD[info.tod] || 'happy';
  }
  let moodClock = 0;
  function moodScore(mi, si, mv, sc, t) {
    const now = performance.now(); if (now - moodClock < 300) return; moodClock = now;
    try {
      if (!playing(mi) || !scoreState.audio || scoreState.key !== mi + '') return;
      const m = moodAt(mi, si, mv, sc, t); if (m === scoreState.mood) return;
      const strong = ['scared', 'fight', 'chase', 'shocked', 'angry', 'sneak'].indexOf(m) >= 0;
      if (scoreState.mood && now - scoreState.since < (strong ? 3000 : 6500)) return;
      const list = MOOD_TRACKS[m] || MOOD_TRACKS.happy, name = list[hash(mi, m.length + si, 6) % list.length], vol = MOOD_VOL[m] || .2;
      const old = scoreState.audio, a = new Audio('AiGame/explox/music/tracks/' + name + '.mp3'); a.loop = true; a.volume = 0; a.play().catch(() => { });
      let v = 0; const iv = setInterval(() => { v += .02; if (v >= vol) { a.volume = vol; clearInterval(iv); } else a.volume = v; }, 70);
      let ov = old.volume; const io2 = setInterval(() => { ov -= .02; if (ov <= 0) { clearInterval(io2); old.pause(); } else old.volume = ov; }, 70);
      scoreState.audio = a; scoreState.mood = m; scoreState.since = now; scoreState.track = name;
    } catch (e) { }
  }
  let actx = null;
  function laugh() {   // a little audience laugh: a few voices going ha-ha-ha
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const c = actx, now = c.currentTime;
      for (let v = 0; v < 4; v++) {
        const base = 190 + Math.random() * 110, n = 5 + Math.floor(Math.random() * 3), t0 = now + Math.random() * .15;
        for (let i = 0; i < n; i++) {
          const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter(), tt = t0 + i * (.1 + v * .004);
          o.type = 'sawtooth'; o.frequency.setValueAtTime(base * (1.15 - i * .03), tt); o.frequency.exponentialRampToValueAtTime(base * (.95 - i * .02), tt + .09);
          f.type = 'bandpass'; f.frequency.value = 850 + Math.random() * 250; f.Q.value = 1.4;
          g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(.05 * (1 - i / (n + 2)), tt + .015); g.gain.exponentialRampToValueAtTime(.0008, tt + .09);
          o.connect(f); f.connect(g); g.connect(c.destination); o.start(tt); o.stop(tt + .1);
        }
      }
    } catch (e) { }
  }
  function lineSfx(l, mv) {
    if (!playing(CINEMA_MOVIES.indexOf(mv))) return;
    const E = l.emo, delay = Math.max(0, (l.end - l.start) * 1000 - 100);
    speechTimers.push(setTimeout(() => {
      try {
        if (E === 'scared' || E === 'shocked') sfx.tense(); else if (E === 'surprised') sfx.reveal(); else if (E === 'angry') sfx.clang(); else if (E === 'sad') sfx.mystery(); else if (E === 'joy' || E === 'excited') sfx.cheer();
        if (mv.comedy && ['happy', 'joy', 'excited', 'surprised', 'curious'].indexOf(E) >= 0 && hash((l.start * 10) | 0, l.text.length, 5) % 100 < 50) laugh();
      } catch (e) { }
    }, delay));
  }
  let speechTimers = [];
  function clearSpeechTimers() { speechTimers.forEach(clearTimeout); speechTimers = []; }
  function speakDialogue(mi, si, narratorVoice) {
    const mv = CINEMA_MOVIES[mi], sc = mv && mv.scenes[si]; if (!sc) return;
    getDialogue(mi, si, mv, sc).forEach(l => {
      speechTimers.push(setTimeout(() => {
        try {
          const u = new SpeechSynthesisUtterance(cleanForSpeech(l.text)), cv = l.who === 'N' ? { voice: narratorVoice, rate: .95, pitch: 1 } : charVoice(l.who, narratorVoice);
          if (cv.voice) { u.voice = cv.voice; u.lang = cv.voice.lang; }
          u.rate = clamp(cv.rate || 1, .7, 1.3); u.pitch = clamp(cv.pitch || 1, .5, 1.8); u.volume = 1;
          if (l.emo) { const EV = { angry: [1.1, -.08], scared: [1.2, .25], sad: [.82, -.12], joy: [1.12, .14], excited: [1.15, .14], worried: [1.1, .12], surprised: [1.1, .2], shocked: [1.15, .22], curious: [1.0, .12], determined: [.92, -.06], serious: [.9, -.1], relieved: [.88, -.04], warm: [.95, .04], happy: [1.05, .08] }[l.emo]; if (l.emo === 'sad') u.volume = .8; if (l.emo === 'worried') u.volume = .9; if (EV) { u.rate = clamp(u.rate * EV[0], .6, 1.4); u.pitch = clamp(u.pitch + EV[1], .4, 1.9); } }
          { const PP = PERS[l.pers]; if (PP) { u.rate = clamp(u.rate * PP.rate, .6, 1.4); u.pitch = clamp(u.pitch + PP.dp, .4, 1.9); } }
          if (/!/.test(l.text)) { u.rate *= 1.05; u.pitch = clamp(u.pitch + .05, .5, 1.8); }
          window.speechSynthesis.speak(u); lineSfx(l, mv);
        } catch (e) { }
      }, Math.max(0, (l.start - 0.45) * 1000)));
    });
  }
  // the characters' lines are shown as movie-style captions at the bottom of the screen, above the narrator's caption
  function drawDialogueCaption(ctx, w, h, line) {
    const fs = Math.max(16, Math.round(w / 40)), col = { A: '#ffd54f', B: '#4fc3f7', C: '#ff8ab3', N: '#b9f6ca' }[line.who] || '#ffffff';
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
      const mv = CINEMA_MOVIES[mi] || CINEMA_MOVIES[0], synth = window.speechSynthesis; clearSpeechTimers(); synth.cancel(); if (cinemaState.sceneIndex === 0) text = 'Hello. I am ' + narratorPersona(mi, mv) + '. Tonight, ' + mv.title + '. Meet ' + introCast(mi, mv) + '. ' + text;
      startScore(mi, mv);
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
    cl.forEach(c => { lines.push(['actor', '\u2605 ' + c.actor]); lines.push(['role', 'as  ' + c.role + (c.tag ? '  \u2022  ' + c.tag : '')]); lines.push(['gap', '']); });
    lines.push(['head', 'ALSO STARRING']); lines.push(['actor', 'Cubby  \u2022  Hubby  \u2022  Gernaldst']); lines.push(['role', 'and the people of Explox']); lines.push(['gap', '']);
    lines.push(['head', 'NARRATED BY']); lines.push(['actor', narratorPersona(mi, mv)]); lines.push(['gap', '']);
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
    window.speechSynthesis.cancel(); stopScore(false);
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
  const installClose = () => { if (window.closeCinema && !window.closeCinema.__wrapped) { const oc = window.closeCinema; const nw = function () { clearSpeechTimers(); stopScore(true); return oc.apply(this, arguments); }; nw.__wrapped = true; window.closeCinema = nw; } };
  installClose(); window.addEventListener('load', installClose);


  // ---------- the movie lobby: filter buttons, and the new movies first with a NEW badge ----------
  const FILTERS = [['All', /./], ['\uD83E\uDDED Adventure', /adventure/i], ['\uD83D\uDD26 Thriller', /thriller|mystery/i], ['\uD83D\uDCA5 Action', /action|mecha|racing/i], ['\uD83D\uDE02 Comedy', /comedy|family/i], ['\uD83D\uDE80 Sci-Fi', /sci-fi|space/i], ['\uD83D\uDCDC History', /drama|epic|origin|founders|frontier|hometown|romance|slice|newcomer|historical|underdog|founding/i]];
  const OLD_COUNT = 29;
  window.__movieFilter = 0;
  function paintLobby() {
    const bar = document.getElementById('movieFilters');
    if (bar) {
      bar.innerHTML = '';
      FILTERS.forEach((f, i) => {
        const b = document.createElement('button'), on = i === window.__movieFilter; b.textContent = f[0];
        b.style.cssText = 'padding:6px 12px;border-radius:999px;border:1px solid ' + (on ? '#ffcc00' : '#444') + ';background:' + (on ? '#ffcc00' : '#222') + ';color:' + (on ? '#000' : '#ccc') + ';font-weight:bold;font-size:12px;cursor:pointer;';
        b.onclick = () => { window.__movieFilter = i; window.buildMovieGrid(); }; bar.appendChild(b);
      });
    }
    const grid = document.getElementById('movieGrid'); if (!grid) return;
    const re = FILTERS[window.__movieFilter][1], cards = Array.prototype.slice.call(grid.children);
    cards.forEach((card, i) => {
      const m = CINEMA_MOVIES[i]; if (!m) return; card.style.display = re.test(m.genre) ? '' : 'none';
      if (i >= OLD_COUNT && !card.querySelector('.newbadge')) { const nb = document.createElement('div'); nb.className = 'newbadge'; nb.textContent = '\u2728 NEW'; nb.style.cssText = 'color:#7dffb2;font-weight:bold;font-size:11px;margin-bottom:4px;'; card.insertBefore(nb, card.firstChild); }
    });
    for (let i = cards.length - 1; i >= OLD_COUNT; i--) grid.insertBefore(cards[i], grid.firstChild);   // the new movies come first
  }
  const installLobby = () => {
    if (window.buildMovieGrid && !window.buildMovieGrid.__wrapped) {
      const ob = window.buildMovieGrid, nw = function () { const r = ob.apply(this, arguments); try { paintLobby(); } catch (e) { } return r; }; nw.__wrapped = true; window.buildMovieGrid = nw;
    }
  };
  installLobby(); window.addEventListener('load', installLobby);

  CINEMA_MOVIES.forEach((mv, mi) => {
    (mv.scenes || []).forEach((sc, si) => {
      if (sc.draw3dWired) return; sc.draw3dWired = true; const d2 = sc.draw;
      sc.draw2d = d2;
      sc.draw = function (ctx, w, h, t) { if (!draw3D(mi, si, mv, sc, ctx, w, h, t)) d2.call(sc, ctx, w, h, t); };
      try { sc.dur = getDialogue(mi, si, mv, sc).total; } catch (e) { sc.dur = Math.max(sc.dur || 5, 12); }
    });
  });
  window.__cinema3d = { sfx: CSFX, mood: moodAt, draw: draw3D, tagsFor, info: getInfo, castList, drawCredits, dialogue: getDialogue, status: () => ({ failed, hasRenderer: !!R }) };
})();
