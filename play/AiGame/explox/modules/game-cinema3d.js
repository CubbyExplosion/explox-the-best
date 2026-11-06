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
    if (/for a spin|\b(drive|drives|drove|driving|driver)\b/.test(t)) return 'drive';
    if (/\b(spin|spins|spun|spinning|twirl|twirls|twirling|whirl|whirls|whirling|pirouette)\b/.test(t)) return 'spinning';
    if (/\b(run|runs|running|ran|race|races|racing|chase|chases|chasing|escape|escapes|rush|rushes|flee|flees|fleeing|sprint|sprints|speed|speeds)\b/.test(t)) return 'run';
    if (/for a spin|\b(drive|drives|drove|driving|driver)\b/.test(t)) return 'drive';
    if (/\b(spin|spins|spun|spinning|twirl|twirls|twirling|whirl|whirls|whirling|pirouette)\b/.test(t)) return 'spinning';
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
  function pose(p) { if (p.weirdScaled) { p.g.scale.setScalar(1.45); p.weirdScaled = false; } p.head.scale.setScalar(1);
 p.g.rotation.set(0, p.g.rotation.y, 0); p.body.rotation.set(0, 0, 0); p.body.position.set(0, 0, 0); p.head.rotation.set(0, 0, 0); p.head.scale.setScalar(p.costume === 'alien' ? 1.25 : 1); limbs(p, 0, 0, 0, 0); p.armL.rotation.z = 0; p.armR.rotation.z = 0; p.mouth.scale.set(1, 1, 1); p.g.position.y = 0; }
  function walk(p, t, sp, big) { const s = Math.sin(t * sp) * (big || .8); limbs(p, -s, s, s, -s); p.body.position.y = Math.abs(Math.sin(t * sp)) * .12; }
  let soccerHud = null, battleHud = null; let beatOffset = 0, lastSceneKey = '', flashA = 0, zoomPunch = 0, titleKey = -1, fightKey = '', fightHud = null, fightCam = null; const fightT0 = {}, fightLast = {};
  const auraMat = { A: new THREE.MeshBasicMaterial({ color: 0xffd54a, transparent: true, opacity: .33 }), B: new THREE.MeshBasicMaterial({ color: 0x40c4ff, transparent: true, opacity: .33 }) }, dustMat = new THREE.MeshBasicMaterial({ color: 0xc8b28a });
  const fxTorus = new THREE.TorusGeometry(1, .08, 6, 28), fxStar = new THREE.OctahedronGeometry(.22), fxMatW = new THREE.MeshBasicMaterial({ color: 0xffffff }), fxMatY = new THREE.MeshBasicMaterial({ color: 0xffe033 });
  function words2d(t0, text, i) { words.push({ t0: t0 + beatOffset, text, i }); }
  let shown = [], curActors = [], curInfoNow = null;

  // ---------- things to DO: jump, dance, play ball, eat, paint, dig, climb, work out, shop, sing, high-five ----------
  const ACT_STYLES = ['jump', 'dance', 'play', 'eat', 'write', 'dig', 'climb', 'exercise', 'shop', 'sing', 'highfive', 'fish', 'camp', 'magic', 'bubbles', 'photo', 'skate', 'snowball', 'juggle', 'tugwar', 'cook', 'drum', 'build', 'drive', 'spinning', 'desk'], ACT_SET = new Set(ACT_STYLES); ACT_SET.add('soccer'); ACT_SET.add('battle');
  function chatActivity(mi, si, k, info, txt) {   // what are they doing while they talk?
    const vs = verbStyle(String(txt || '').toLowerCase(), mi, si); if (ACT_SET.has(vs)) return vs;
    if (info && info.dark) return null;
    const pool = info && info.comedy ? ACT_STYLES.filter(x => x !== 'desk') : ['write', 'exercise', 'play', 'jump', 'dig', 'shop', 'eat', 'climb', 'fish', 'camp', 'photo', 'build', 'cook', 'drum', 'skate', 'magic'];
    return hash(mi, si + k, 31) % 100 < 70 ? pool[hash(mi, si * 3 + k, 17) % pool.length] : null;
  }
  const ballGeo = new THREE.SphereGeometry(.45, 14, 10), ballMat = new THREE.MeshBasicMaterial({ color: 0xff5533 }), soccerMat = new THREE.MeshBasicMaterial({ color: 0xffffff }), pieMat = new THREE.MeshBasicMaterial({ color: 0xfff3c4 }), snowMat = new THREE.MeshBasicMaterial({ color: 0xffffff }), waterMat = new THREE.MeshBasicMaterial({ color: 0x4fc3f7 }), bombMat = new THREE.MeshBasicMaterial({ color: 0x111111 }), boomMat = new THREE.MeshBasicMaterial({ color: 0xff7a18, transparent: true, opacity: .75 }), boomMat2 = new THREE.MeshBasicMaterial({ color: 0xffe14d, transparent: true, opacity: .85 }), smokeMat = new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, opacity: .55 }), netMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .22 });
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
    if (style === 'drive') {   // take the car for a spin: round and round in donuts, skid marks, smoke, everyone hanging on
      const R = 3.8, a = t * 1.5, th = -(a + Math.PI / 2), cy = Math.cos(th), sy = Math.sin(th), face0 = -a, cxp = Math.cos(a) * R, czp = Math.sin(a) * R * .55 - 1.5;
      const pg = new THREE.Group(); pg.userData.shared = true; pg.position.set(cxp, 0, czp); pg.rotation.set(0, th, Math.sin(t * 6) * .04);
      const pm = (sx, sy2, sz, c, x, y, z) => { const m = new THREE.Mesh(wGeo, wM(tintC(c))); m.scale.set(sx, sy2, sz); m.position.set(x, y, z); pg.add(m); return m; };
      pm(4.6, .9, 2.2, 0xe53935, 0, .9, 0); pm(2.4, .8, 2.0, 0xe53935, -.3, 1.7, 0); pm(.12, .7, 1.9, 0x88ccee, .95, 1.75, 0); pm(.12, .6, 1.8, 0xffffff, 2.3, 1.0, 0); pm(.2, .4, .5, 0xfff59d, 2.35, 1.0, .7); pm(.2, .4, .5, 0xfff59d, 2.35, 1.0, -.7);
      [[1.5, 1.15], [-1.5, 1.15], [1.5, -1.15], [-1.5, -1.15]].forEach(([wx, wz]) => { const w1 = pm(.9, .9, .35, 0x222222, wx, .45, wz); w1.rotation.z = -t * 14; pm(.5, .12, .38, 0xcccccc, wx, .45, wz).rotation.z = -t * 14; });
      fxGroup.add(pg);
      const place = (lx, lz, ly) => ({ x: cxp + lx * cy + lz * sy, z: czp - lx * sy + lz * cy, y: ly });
      act.forEach((p, i) => { const q = place(i === 0 ? .55 : -.5, i === 2 ? 0 : (i === 0 ? .5 : -.5), 1.15); p.g.position.set(q.x, q.y, q.z); p.g.rotation.y = face0; p.legL.rotation.x = p.legR.rotation.x = -1.4; p.mouth.scale.set(1.3, 2.2, 1);
        if (i === 0) { p.armL.rotation.x = p.armR.rotation.x = -1.2; p.body.rotation.z = Math.sin(t * 3) * .12; } else if (i === 1) { p.armL.rotation.x = p.armR.rotation.x = 2.8; p.armL.rotation.z = -.5; p.armR.rotation.z = .5; p.body.rotation.z = -Math.sin(t * 3) * .15; } else { p.armR.rotation.x = 2.6; p.armR.rotation.z = Math.sin(t * 9) * .5; } });
      for (let k = 1; k < 26; k++) { const ak = a - k * .1; wMesh(.4, .03, 1.0, 0x1a1a1a, Math.cos(ak) * R + Math.sin(ak) * 0, .02, Math.sin(ak) * R * .8).rotation.y = -(ak + Math.PI / 2) + Math.PI / 2 * 0; }
      for (let k = 0; k < 8; k++) { const ag = (t * 1.6 + k * .125) % 1, ak = a - .12 - ag * .5; wMesh(.7 + ag * 1.2, .5 + ag * 1.0, .7 + ag * 1.2, 0xeeeeee, Math.cos(ak) * R, .6 + ag * 1.6, Math.sin(ak) * R * .8); }
      ex.forEach((p, i) => { const ae = i * Math.PI * 2 / Math.max(1, ex.length) + .4; p.g.position.set(Math.cos(ae) * 11, Math.abs(sn(t * 6 + i)) * .4, -3 - Math.abs(Math.sin(ae)) * 6); toward(p, 0, 0); limbs(p, 2.7 + sn(t * 8 + i) * .5, 2.7 - sn(t * 8 + i) * .5, 0, 0); });
      look.set(0, 1.6, -1.5); return 16;
    }
    if (style === 'spinning') {   // they really spin, faster and faster, with a dizzy ending
      const all2 = all, k = clamp((t % 4) / 3, 0, 1);
      all2.forEach((p, i) => { const sp = 6 + i * 1.7 + k * 14; p.g.position.set((i - (n - 1) / 2) * 2.8, 0, (i % 2) * -1.5); p.g.rotation.y = t * sp * .5; p.armL.rotation.z = -1.5; p.armR.rotation.z = 1.5; p.legL.rotation.z = -.2; p.legR.rotation.z = .2; p.g.position.y = Math.abs(sn(t * 3 + i)) * .3; p.mouth.scale.set(1.3, 2.4, 1); p.head.rotation.z = sn(t * 8 + i) * .12;
        for (let q = 0; q < 3; q++) { const rg = new THREE.Mesh(fxTorus, fxMatW); rg.userData.shared = true; rg.rotation.x = -Math.PI / 2; rg.scale.setScalar(Math.max(.01, .9 + q * .45)); rg.position.set(p.g.position.x, .1 + q * .9 + (t * 2 % 1) * .3, p.g.position.z); fxGroup.add(rg); }
        if ((t % 4) > 3) for (let q = 0; q < 3; q++) spr('\u{1F4AB}', p.g.position.x + Math.cos(t * 5 + q * 2.1) * .9, 4.2, p.g.position.z + Math.sin(t * 5 + q * 2.1) * .5, .8); });
      words2d(Math.floor(t / 4) * 4 + .2, 'WHEEE!', 2); if ((t % 4) > 3) words2d(Math.floor(t / 4) * 4 + 3.1, 'WOW, DIZZY!', 4);
      look.set(0, 2.3, 0); return 8;
    }
    if (style === 'battle') {   // a huge cartoon battle
      const mvv = CINEMA_MOVIES[mi], scc = mvv.scenes[si], SO = (scc.script && scc.script.battle) || { n1: 100, n2: 100, kind: 'war', win: 0, survivors: 5, bombs: 3, name1: 'RED', name2: 'BLUE' };
      const dlg = getDialogue(mi, si, mvv, scc), T = Math.max(20, dlg.total - 3), ST = t + beatOffset, key = mi + '_' + si + '_' + SO.n1 + '_' + SO.n2 + '_' + (SO.seed || 0);
      if (stage) stage.visible = false; ex.forEach(pp => { pp.g.visible = false; }); act.forEach(pp => { pp.g.visible = false; });
      wMesh(260, .1, 210, SO.ground || 0x6b8e3a, 0, -.05, 0); wMesh(40, .1, 74, 0x8a7448, 0, 0, 0);
      const camT = battleDraw(SO, key, ST, T, mi);
      if (SO.giants) {   // two giants join the fight
        const R = soccerRoster(), g1 = R[0], g2 = R[11]; kit(g1, (SO.cols || [])[0] || 0xe53935, 0x263238); kit(g2, (SO.cols || [])[1] || 0x1e88e5, 0x263238);
        [g1, g2].forEach((gg, i) => { gg.g.visible = true; if (shown.indexOf(gg) < 0) shown.push(gg); gg.g.scale.setScalar(7); gg.weirdScaled = true; const sg = i ? 1 : -1, cyc = (ST * .45 + i * .5) % 1, hitv = cyc > .55 && cyc < .7; gg.g.position.set(sg * (11 - ((ST * .5) % 1) * 0 - (hitv ? 1.5 : 0)), 0, 0); gg.g.rotation.y = sg > 0 ? -Math.PI / 2 : Math.PI / 2; pose(gg); limbs(gg, -1, -1, sn(ST * 3 + i) * .3, -sn(ST * 3 + i) * .3); if (cyc > .3 && cyc < .55) { gg.armR.rotation.x = lrp(1.3, -1.9, (cyc - .3) / .25); gg.body.rotation.y = -sg * .4; } else if (hitv) { gg.armR.rotation.x = -1.9; } else { gg.armR.rotation.x = -1.0; }
          if (hitv && cyc < .6) { const rg = new THREE.Mesh(fxTorus, fxMatW); rg.userData.shared = true; rg.scale.setScalar(2 + (cyc - .55) * 90); rg.position.set(0, 14, 0); rg.lookAt(CAM.position); fxGroup.add(rg); flashA = Math.max(flashA, .25); zoomPunch = Math.max(zoomPunch, .4); if (playing(mi)) csOnce(key + 'g' + Math.floor(ST * .45 + i * .5), 'smash'); } });
      }
      const ch0 = clamp(ST / (T * .24), 0, 1), che = ch0 * ch0 * (3 - 2 * ch0), wide = new THREE.Vector3(sn(ST * .1) * 22 * che, lrp(52, 26, che), lrp(100, 48, che)), wlook = new THREE.Vector3(0, 1.5, 0);
      if (camT) { const k = camT.k; fightCam = { pos: wide.clone().lerp(new THREE.Vector3(camT.x * .6 + 12, 18, camT.z * .6 + 34), k), look: wlook.clone().lerp(new THREE.Vector3(camT.x, 2, camT.z), k), k: 1 }; } else fightCam = { pos: wide, look: wlook, k: 1 };
      look.set(0, 2, 0); return 40;
    }
    if (style === 'soccer') {   // real-looking soccer: 22 human players and a referee, fast play, fouls, penalties, real kicks; the commentary and the action line up
      const mvv = CINEMA_MOVIES[mi], scc = mvv.scenes[si], SO = (scc.script && scc.script.soccer) || { att: 'ex', type: 'kickoff', opp: 'THEM', col: 0x1e88e5, before: [0, 0], after: [0, 0], min: 1 };
      const dlg = getDialogue(mi, si, mvv, scc), ST = t + beatOffset, dir = SO.att === 'opp' ? -1 : 1, kind0 = SO.type, K = SK, isPen = kind0 === 'penalty', isThrow = kind0 === 'throwin', isCor = kind0 === 'corner', isGK = kind0 === 'goalkick', isFK = kind0 === 'freekick', isInj = kind0 === 'injury', isOff = kind0 === 'offside', sideS = hash(mi + si, 5, 3) % 2 ? 1 : -1, res = (isPen || isCor || isFK) ? (SO.result || 'goal') : (isOff ? 'goal' : kind0), goalish = (res === 'goal' || res === 'trick') && !isOff;
      const play = (kind0 !== 'kickoff' && kind0 !== 'final'), cueL = dlg[SO.cue != null ? SO.cue : 2], tShot = (cueL ? cueL.start : 8) + .3;
      const fpr = ST < tShot ? .58 * ST / tShot : .58 + .42 * clamp((ST - tShot) / Math.max(6.5, dlg.total - 2.5 - tShot), 0, 1), f = play ? fpr : clamp(ST / Math.max(10, dlg.total - 2), 0, 1);
      const cl = (x) => clamp(x, 0, 1), P = (x, z) => ({ x: x, z: z }), mixp = (a, b, k) => ({ x: lrp(a.x, b.x, k), z: lrp(a.z, b.z, k) }), key = (n) => mi + '_' + si + '_' + n, Wd = (fr, text, i) => words2d((play ? tShot : 0) + (fr - .58) * 8 - beatOffset, text, i), ease2 = (x) => x * x * (3 - 2 * x);
      if (stage) stage.visible = false; ex.forEach(pp => { pp.g.visible = false; }); act.forEach(pp => { pp.g.visible = false; });
      // the giant pitch
      wMesh(220, .1, 170, 0x2a7d34, 0, -.04, 0); wMesh(26 * K, .1, 16 * K, 0x2e9b3a, 0, .05, 0); for (let q = 0; q < 7; q++) wMesh(2 * K, .12, 16 * K, 0x37a944, (-12 + q * 4) * K, .06, 0);
      [[26 * K, .14, .35, 0, -8 * K], [26 * K, .14, .35, 0, 8 * K], [.35, .14, 16 * K, -13 * K, 0], [.35, .14, 16 * K, 13 * K, 0], [.3, .14, 16 * K, 0, 0], [.3, .14, 9 * K, -10.5 * K, 0], [.3, .14, 9 * K, 10.5 * K, 0], [3 * K, .14, .3, -11.8 * K, -4.5 * K], [3 * K, .14, .3, -11.8 * K, 4.5 * K], [3 * K, .14, .3, 11.8 * K, -4.5 * K], [3 * K, .14, .3, 11.8 * K, 4.5 * K]].forEach(l => wMesh(l[0], l[1], l[2], 0xffffff, l[3], .13, l[4]));
      const cc = new THREE.Mesh(fxTorus, fxMatW); cc.userData.shared = true; cc.rotation.x = -Math.PI / 2; cc.scale.setScalar(2.6 * K); cc.position.set(0, .15, 0); fxGroup.add(cc);
      const rip = (goalish && f > .7) ? 1 + Math.sin((f - .7) * 60) * .08 * (1 - cl((f - .7) / .2)) : 1;
      [-1, 1].forEach(sg => { wMesh(.3, 3.6, .3, 0xffffff, sg * 13 * K, 1.8, -2.8); wMesh(.3, 3.6, .3, 0xffffff, sg * 13 * K, 1.8, 2.8); wMesh(.3, .3, 5.9, 0xffffff, sg * 13 * K, 3.6, 0); const nt = new THREE.Mesh(wGeo, netMat); nt.userData.shared = true; nt.scale.set(2.6 * rip, 3.5, 5.6); nt.position.set(sg * (13 * K + 1.3), 1.75, 0); fxGroup.add(nt); });
      // 11 against 11 plus the referee (all plain humans)
      const R = soccerRoster(), exK = 0xe53935, opK = SO.col || 0x1e88e5, exT = R.slice(0, 11), opT = R.slice(11, 22), ref = R[22];
      exT.forEach((pr, i) => i === 10 ? kit(pr, 0x43a047, 0x2e7d32) : kit(pr, exK, 0xffffff)); opT.forEach((pr, i) => i === 10 ? kit(pr, 0xff9800, 0x6d4c41) : kit(pr, opK, 0x263238)); kit(ref, 0x111111, 0x111111);
      const all23 = exT.concat(opT, [ref]); all23.forEach(pp => { pp.g.visible = true; if (shown.indexOf(pp) < 0) shown.push(pp); pp.g.scale.setScalar(.8); pp.weirdScaled = true; });
      const atkT = dir > 0 ? exT : opT, defT = dir > 0 ? opT : exT, keeperD = defT[10], a1 = atkT[0], a2 = atkT[1], a3 = atkT[2], scripted = isPen ? [a3] : [a1, a2, a3];
      const cheer = (pp, k) => { pp.armL.rotation.x = pp.armR.rotation.x = 2.8; pp.armL.rotation.z = -.5; pp.armR.rotation.z = .5; pp.g.position.y = Math.abs(sn(t * 8 + k)) * .5; pp.mouth.scale.set(1.3, 2.4, 1); }, sad = (pp) => { pp.armL.rotation.x = pp.armR.rotation.x = 2.3; pp.head.rotation.x = .5; };
      const kick = (pp, t0) => { const k = cl((f - t0) / .07); if (f > t0 - .02 && f < t0 + .08) { pp.legR.rotation.x = k < .4 ? lrp(0, .9, k / .4) : k < .6 ? lrp(.9, -1.7, (k - .4) / .2) : lrp(-1.7, 0, (k - .6) / .4); pp.body.rotation.x = .18 * sn(Math.PI * k); pp.armL.rotation.x = -.9; pp.armR.rotation.x = .9; } };
      let bp = { x: 0, y: .5, z: 0 }, pa1 = null, pa2 = null, pa3 = null, W0 = P(0, 0), W1 = P(-dir * 2.5, 3), W2 = P(dir * 4.2, -1.5), spot = P(dir * 8.6, 0), tgt = { x: dir * 13.4, y: .9, z: .9 };
      const E_th = P(clamp(W2.x + dir * 2.5, -10, 10), sideS * 9.4), S_th = P(E_th.x, sideS * 8.2), R_th = P(S_th.x - dir * 3.4, sideS * 5.6), C_cor = P(dir * 12.6, sideS * 7.8), BOX = P(dir * 11, 0), G_gk = P(dir * 10, 0), SPOT = P(dir * 7.6, sideS * 3.2), WALLX = SPOT.x + dir * 3.6;
      if (play) {
        if (isPen) { W2 = spot; pa3 = f < .5 ? mixp(P(spot.x - dir * 5, 2.4), P(spot.x - dir * 1.4, .5), ease2(cl(f / .5))) : P(spot.x - dir * 1.4, .5); }
        else { pa1 = f < .2 ? mixp(P(-dir * 1.6, .8), W0, ease2(cl(f / .2))) : mixp(W0, P(dir * 1, -4.5), ease2(cl((f - .2) / .5))); pa2 = f < .34 ? mixp(P(-dir * 6, 4), W1, ease2(cl(f / .34))) : mixp(W1, P(dir * 7, 3), ease2(cl((f - .34) / .36))); pa3 = f < .48 ? mixp(P(-dir * 3, -3.5), W2, ease2(cl(f / .48))) : W2; }
        tgt = goalish ? { x: dir * 13.4, y: .9, z: (hash(mi + si, 9, 3) % 2 ? .95 : -.95) } : res === 'save' ? { x: dir * 12, y: 1.1, z: .2 } : res === 'post' ? { x: dir * 13, y: 1.5, z: 2.1 } : { x: dir * 13.6, y: 5.2, z: 1.2 };
        let setpBall = null;
        if (f >= .48 && (isThrow || isCor || isGK || isFK)) {
          const e0 = P(W2.x + dir * .8, W2.z);
          if (isThrow) { if (f < .58) { const k = (f - .48) / .1; setpBall = { x: lrp(e0.x, E_th.x, k), y: .4 + sn(Math.PI * k) * .8, z: lrp(e0.z, E_th.z, k) }; } else if (f < .62) { const k = (f - .58) / .04; setpBall = { x: E_th.x, y: .3, z: lrp(E_th.z, S_th.z, k) }; } else if (f < .74) setpBall = { x: S_th.x, y: 3.9, z: S_th.z }; else if (f < .84) { const k = (f - .74) / .1; setpBall = { x: lrp(S_th.x, R_th.x, k), y: .5 + sn(Math.PI * k) * 1.7, z: lrp(S_th.z, R_th.z, k) }; } else setpBall = { x: R_th.x + dir * (f - .84) * 6, y: .35, z: R_th.z }; }
          else if (isCor) { if (f < .58) { const k = (f - .48) / .1; setpBall = { x: lrp(e0.x, dir * 14.6, k), y: .5 + sn(Math.PI * k) * 1.2, z: lrp(e0.z, sideS * 2.8, k) }; } else if (f < .66) setpBall = { x: C_cor.x, y: .3, z: C_cor.z }; else if (f < .74) { const k = (f - .66) / .08; setpBall = { x: lrp(C_cor.x, BOX.x, k), y: .5 + sn(Math.PI * k) * 5.2, z: lrp(C_cor.z, BOX.z, k) }; } else if (f < .8) { const k = (f - .74) / .06; setpBall = { x: lrp(BOX.x, tgt.x, k), y: lrp(1.2, tgt.y, k), z: lrp(BOX.z, tgt.z, k) }; } else setpBall = res === 'miss' ? { x: lrp(tgt.x, dir * 17, cl((f - .8) / .2)), y: 2, z: tgt.z } : res === 'post' ? { x: lrp(tgt.x, dir * 9.5, cl((f - .8) / .1)), y: Math.abs(sn((f - .8) * 30)) * .7 + .3, z: lrp(tgt.z, 4, cl((f - .8) / .1)) } : { x: tgt.x, y: res === 'save' ? 1.0 : .5, z: tgt.z }; }
          else if (isGK) { if (f < .58) { const k = (f - .48) / .1; setpBall = { x: lrp(e0.x, dir * 14.6, k), y: .6 + sn(Math.PI * k) * 1.6, z: lrp(e0.z, sideS * 4.6, k) }; } else if (f < .66) setpBall = { x: G_gk.x, y: .3, z: G_gk.z }; else if (f < .82) { const k = (f - .66) / .16; setpBall = { x: lrp(G_gk.x, -dir * 1, k), y: .4 + sn(Math.PI * k) * 8, z: lrp(G_gk.z, sideS * 2, k) }; } else setpBall = { x: -dir * (1 + (f - .82) * 8), y: .35, z: sideS * 2 }; }
          else if (isFK) { if (f < .64) setpBall = { x: SPOT.x, y: .3, z: SPOT.z }; else if (f < .74) { const k = (f - .64) / .1; setpBall = { x: lrp(SPOT.x, tgt.x, k), y: lrp(.4, tgt.y, k) + sn(Math.PI * k) * 3.4, z: lrp(SPOT.z, tgt.z, k) }; } else setpBall = res === 'miss' ? { x: lrp(tgt.x, dir * 17, cl((f - .74) / .26)), y: 2, z: tgt.z } : { x: tgt.x, y: res === 'save' ? 1.0 : .5, z: tgt.z }; }
        }
        else if (f >= .48 && isInj) setpBall = { x: W2.x + dir * .8, y: .3, z: W2.z };
        if (isPen) { if (f < .58) bp = { x: spot.x, y: .3, z: spot.z }; else if (f < .7) { const k = (f - .58) / .12; bp = { x: lrp(spot.x, tgt.x, k), y: lrp(.4, tgt.y, k) + sn(Math.PI * k) * .5, z: lrp(spot.z, tgt.z, k) }; } else bp = res === 'save' ? { x: tgt.x, y: 1.0, z: tgt.z } : res === 'miss' ? { x: lrp(tgt.x, dir * 17, cl((f - .7) / .3)), y: 2, z: tgt.z } : { x: tgt.x, y: .55, z: tgt.z }; }
        else if (setpBall) bp = setpBall;
        else if (f < .2) bp = { x: pa1.x + dir * .9, y: .3 + Math.abs(sn(f * 60)) * .12, z: pa1.z };
        else if (f < .34) { const k = (f - .2) / .14; bp = { x: lrp(W0.x + dir * .9, W1.x, k), y: .35 + sn(Math.PI * k) * .7, z: lrp(W0.z, W1.z, k) }; }
        else if (f < .48) { const k = (f - .34) / .14; bp = { x: lrp(W1.x, W2.x, k), y: .35 + sn(Math.PI * k) * .8, z: lrp(W1.z, W2.z, k) }; }
        else if (f < .58) bp = { x: W2.x + dir * .8, y: .3, z: W2.z };
        else if (kind0 === 'foul' || kind0 === 'brawl' || kind0 === 'scuffle') bp = { x: W2.x + dir * .8, y: .3, z: W2.z };
        else if (kind0 === 'tackle') { const k = cl((f - .58) / .3); bp = { x: lrp(W2.x + dir * .8, -dir * 4, k), y: .3 + Math.abs(sn(k * 9)) * .25, z: lrp(W2.z, 2.5, k) }; }
        else if (f < .7) { const k = (f - .58) / .12; bp = { x: lrp(W2.x + dir * .8, tgt.x, k), y: lrp(.4, tgt.y, k) + sn(Math.PI * k) * .7, z: lrp(W2.z, tgt.z, k) }; }
        else if (res === 'post') { const k = cl((f - .7) / .14); bp = { x: lrp(tgt.x, dir * 9.5, k), y: Math.abs(sn(k * 6)) * .7 + .3, z: lrp(tgt.z, 4, k) }; }
        else if (res === 'miss') { const k = cl((f - .7) / .3); bp = { x: lrp(tgt.x, dir * 17, k), y: lrp(tgt.y, 1, k), z: tgt.z }; }
        else bp = { x: tgt.x, y: res === 'save' ? 1.0 : .5, z: tgt.z };
      } else { const k5 = cl((ST - 6) / 1.4); bp = { x: kind0 === 'final' ? 0 : lrp(0, -3.2, k5), y: .3 + (kind0 === 'final' ? 0 : sn(Math.PI * k5) * .5), z: 0 }; }
      const bw = { x: bp.x * K, z: bp.z * K }, place = (pp, q) => { pp.g.position.set(clamp(q.x, -13.2, 13.2) * K, 0, clamp(q.z, -8, 8) * K); toward(pp, bw.x, bw.z); walk(pp, t * 1.7 + q.x * .5, 13, .95); pp.body.rotation.x = .12; };
      const win = SO.after[0] >= SO.after[1], celeb = goalish && f > .72, ck = cl((f - .72) / .15);
      [[exT, 1], [opT, -1]].forEach(([tm, sd]) => tm.forEach((pp, i) => {
        if (scripted.indexOf(pp) >= 0 && play) return; if (pp === keeperD && play) return;
        if (i === 10) { place(pp, P(0, clamp(bp.z * .35, -1.6, 1.6))); pp.g.position.x = (sd === 1 ? -12.6 : 12.6) * K; pp.armL.rotation.x = pp.armR.rotation.x = 1.4; pp.legL.rotation.x = sn(t * 6) * .25; pp.legR.rotation.x = -sn(t * 6) * .25; return; }
        const sl = SOC_SLOTS[i], hx = sl[0] * sd, hz = sl[1] * sd, w = sl[2] * (play && !isPen && (tm === atkT ? 1.1 : 1));
        let q = P(hx + (bp.x - hx) * w + sn(t * .8 + i) * .5, hz + (bp.z - hz) * w * .7 + Math.cos(t * .7 + i) * .5);
        if (isPen) q = P(dir * 10.4 + (i % 2) * dir * .6, -7 + i * 1.4);
        if (celeb && tm === atkT) { const cq = P(lrp(q.x, pa3.x - dir * (1 + (i % 4) * .8), ck * .8), lrp(q.z, pa3.z + ((i % 5) - 2) * 1.0, ck * .8)); place(pp, cq); cheer(pp, i); return; }
        place(pp, q); if (kind0 === 'final') { if ((sd === 1) === win) cheer(pp, i); else sad(pp); } else if (celeb) sad(pp);
      }));
      // the referee follows the play
      { const rq = isPen ? P(spot.x - dir * 4, -5) : P(clamp(bp.x - dir * 3, -11, 11), clamp(bp.z + 4, -7, 7)); place(ref, rq); }
      if (play) {
        const pm = (pp, q) => { pp.g.position.set(q.x * K, 0, q.z * K); toward(pp, bw.x, bw.z); walk(pp, t * 1.7 + q.x, 14, .95); pp.body.rotation.x = .14; };
        if (!isPen) { pm(a1, pa1); pm(a2, pa2); } pm(a3, pa3);
        if (!isPen) { kick(a1, .2); kick(a2, .34); } kick(a3, .58);
        if ((kind0 === 'tackle' || kind0 === 'foul' || kind0 === 'brawl' || kind0 === 'scuffle') && defT[1] && f > .46 && f < .75) { const d0 = defT[1], k = cl((f - .46) / .2); d0.g.position.set(lrp(W2.x + dir * 3, W2.x + dir * .6, ease2(k)) * K, .2, W2.z * K); d0.g.rotation.y = dir > 0 ? -Math.PI / 2 : Math.PI / 2; d0.g.rotation.z = (dir > 0 ? -1 : 1) * 1.3 * sn(Math.PI * Math.min(k * 1.2, 1) * .8); if (f > .5 && playing(mi)) csOnce(key('tackle'), 'smack'); }
        if ((kind0 === 'foul' || kind0 === 'brawl' || kind0 === 'scuffle') && f > .53) { const lie = ease2(cl((f - .53) / .08)) * (1 - ease2(cl((f - (kind0 === 'foul' ? .88 : .66)) / .1))); a3.g.rotation.z = (dir > 0 ? 1 : -1) * 1.45 * lie; a3.g.position.y = .25 * lie; a3.mouth.scale.set(.6, 3, 1);
          if (f > .56) { ref.armR.rotation.x = f > .66 ? 2.8 : 1.6; if (f > .66 && kind0 === 'foul') spr(SO.red ? '\u{1F7E5}' : '\u{1F7E8}', ref.g.position.x, 5.2, ref.g.position.z, 1.1); if (playing(mi)) csOnce(key('whistle'), 'whistle'); } }
        if (isPen && f > .45 && f < .6 && playing(mi)) csOnce(key('whistle'), 'whistle');
        if (kind0 === 'trick' && f > .5 && f < .66) { const k = cl((f - .5) / .14); a3.g.position.y = sn(Math.PI * k) * 2.4; a3.body.rotation.x = dir * -Math.PI * 2 * k; a3.legR.rotation.x = -1.4; a3.armL.rotation.z = -1.3; a3.armR.rotation.z = 1.3; }
        if (kind0 === 'brawl' || kind0 === 'scuffle') {   // a cartoon fight on the pitch: the players run in and trade punches, kicks and shoves, then the referee breaks it up with red cards
          const big = kind0 === 'brawl', k0 = cl((f - .58) / .08), kk = ease2(k0) * (1 - ease2(cl((f - .9) / .08))), pairs = big ? 10 : 2;
          if (f > .56) for (let i = 0; i < pairs; i++) {
            const ang = i * Math.PI * 2 / pairs + .4, rad = big ? 1.1 + (i % 3) * 1.0 : .15, cx = W2.x + Math.cos(ang) * rad * 1.3, cz = W2.z + Math.sin(ang) * rad, sep = .55 + sn(t * 5 + i) * .12;
            const e = exT[i], o = opT[i], qe = P(cx - sep * .7, cz), qo = P(cx + sep * .7, cz), ph = t * 6 + i * 1.3;
            [[e, qe, qo, 0], [o, qo, qe, 1]].forEach(([pp, q, opp, j]) => {
              pp.g.position.set(lrp(pp.g.position.x / K, q.x, kk) * K, 0, lrp(pp.g.position.z / K, q.z, kk) * K); toward(pp, opp.x * K, opp.z * K);
              if (kk > .4) { const v = sn(ph + j * Math.PI), kickMove = (i + j) % 3 === 0;
                if (v > .5) { if (kickMove) { pp.legR.rotation.x = -1.6; pp.body.rotation.x = -.25; pp.armL.rotation.x = -.8; pp.armR.rotation.x = .9; } else { pp.armR.rotation.x = -1.9; pp.body.rotation.y = .5 * (j ? -1 : 1); pp.armL.rotation.x = 1.0; } } else { pp.armL.rotation.x = -1.0; pp.armR.rotation.x = -1.0 + sn(ph * 2) * .3; pp.body.rotation.x = .15; }
                pp.mouth.scale.set(1.2, 2.2, 1);
                if (i % 3 === 0 && j === 1 && ((t * .3 + i * .37) % 1) > .78 && ((t * .3 + i * .37) % 1) < .95) { pp.g.rotation.z = 1.3 * (dir > 0 ? -1 : 1); pp.g.position.y = .2; pp.armL.rotation.x = pp.armR.rotation.x = 2.2; }
              } });
            if (kk > .4 && sn(ph) > .85) { for (let k = 0; k < 6; k++) { const a2 = k * Math.PI * 2 / 6 + t * 4, st = new THREE.Mesh(fxStar, fxMatY); st.userData.shared = true; st.position.set(cx * K + Math.cos(a2) * 1.2, 2.6 + Math.sin(a2) * 1.0, cz * K); st.scale.setScalar(.9); fxGroup.add(st); } }
            if (big && kk > .4 && i % 2 === 0) { const ag = (t * 1.3 + i * .21) % 1; wMesh(1.4 + ag, 1.0 + ag, 1.4 + ag, 0xe9e4d8, cx * K, .8 + ag * 1.4, cz * K); }
          }
          if (f > .64 && playing(mi)) csOnce(key('whistle'), 'whistle'); if (f > .6 && f < .9 && playing(mi)) csOnce(key('b' + Math.floor(t * 3)), 'bam');
          if (f > .68) { place(ref, P(W2.x - dir * 1.5, W2.z + 2.5)); ref.armR.rotation.x = 2.8; spr('\u{1F7E5}', ref.g.position.x, 5.4, ref.g.position.z, 1.2); }
          if (f > .78) { [exT[0], opT[0]].forEach(pp => spr('\u{1F7E5}', pp.g.position.x, 5.2, pp.g.position.z, 1.1)); }
          Wd(.62, big ? 'BRAWL!' : 'SCUFFLE!', 3); if (f > .78) Wd(.8, 'RED CARDS!', 2);
          if (f > .56 && f < .66) { zoomPunch = Math.max(zoomPunch, .4); }
        }
        const kx = dir * 12.6, kz = (f > .6 && f < .86) ? (res === 'save' ? clamp(tgt.z, -2.2, 2.2) * cl((f - .6) / .1) : goalish ? -Math.sign(tgt.z) * 2.2 * cl((f - .6) / .1) : 0) : clamp(bp.z * .4, -1.8, 1.8);
        keeperD.g.position.set(kx * K, 0, kz * K); toward(keeperD, 0, bp.z * K); keeperD.armL.rotation.x = keeperD.armR.rotation.x = 1.4; keeperD.legL.rotation.x = sn(t * 6) * .25; keeperD.legR.rotation.x = -sn(t * 6) * .25;
        if (f > .62 && f < .8 && (res === 'save' || goalish)) { const k = cl((f - .62) / .1); keeperD.g.rotation.z = (kz >= 0 ? -1 : 1) * (dir > 0 ? 1 : -1) * 1.2 * k; keeperD.g.position.y = sn(Math.PI * k) * .8 + .3; keeperD.armL.rotation.x = keeperD.armR.rotation.x = 2.8; }
        if (isThrow && f >= .5) { const T = a2, kT = ease2(cl((f - .5) / .12)); place(T, mixp(pa2, S_th, kT)); toward(T, R_th.x * K, R_th.z * K);
          if (f >= .62 && f < .74) { T.armL.rotation.x = T.armR.rotation.x = 2.9; } else if (f >= .74 && f < .82) { const kk = cl((f - .74) / .08); T.armL.rotation.x = T.armR.rotation.x = lrp(2.9, -.8, kk); T.body.rotation.x = .25 * kk; }
          place(a1, mixp(pa1, R_th, ease2(cl((f - .5) / .3)))); Wd(.6, 'THROW-IN!', 3); }
        if (isCor && f >= .5) { place(a3, mixp(pa3, C_cor, ease2(cl((f - .5) / .14)))); toward(a3, BOX.x * K, BOX.z * K); kick(a3, .68);
          exT.slice(0, 10).concat(opT.slice(0, 10)).forEach((pp, i) => { if (pp === a3 || pp === a1) return; const cur = { x: pp.g.position.x / K, z: pp.g.position.z / K }, q = P(dir * (9.2 + (i % 4) * .9) + sn(t * 3 + i) * .25, -5.2 + (i % 8) * 1.5 + Math.cos(t * 2.4 + i) * .25); place(pp, mixp(cur, q, ease2(cl((f - .52) / .14)))); });
          place(a1, P(BOX.x - dir * .6, .4)); if (f > .72 && f < .8) a1.g.position.y = sn(Math.PI * cl((f - .72) / .08)) * 1.6; Wd(.6, 'CORNER KICK!', 3); }
        if (isGK && f >= .5) { keeperD.g.position.set(lrp(dir * 12.6, G_gk.x - dir * .8, ease2(cl((f - .56) / .08))) * K, 0, 0); toward(keeperD, 0, 0); kick(keeperD, .68); Wd(.6, 'GOAL KICK', 3); }
        if (isFK && f >= .5) { place(a3, mixp(pa3, P(SPOT.x - dir * 2.2, SPOT.z + 1.2), ease2(cl((f - .46) / .12)))); if (f > .56) place(a3, mixp(P(SPOT.x - dir * 2.2, SPOT.z + 1.2), P(SPOT.x - dir * .9, SPOT.z + .3), ease2(cl((f - .56) / .08)))); kick(a3, .64);
          [2, 3, 4, 5].forEach((ix, j) => { const pp = defT[ix]; place(pp, P(WALLX, SPOT.z * .45 + (j - 1.5) * 1.1)); toward(pp, SPOT.x * K, SPOT.z * K); pp.armL.rotation.x = pp.armR.rotation.x = 0; pp.armL.rotation.z = pp.armR.rotation.z = .1; if (f > .64 && f < .72) pp.g.position.y = sn(Math.PI * cl((f - .64) / .08)) * .9; });
          if (f > .5 && f < .6 && playing(mi)) csOnce(key('whistle'), 'whistle'); Wd(.52, 'FREE KICK!', 2); }
        if (isInj && f >= .5) { const lie = ease2(cl((f - .5) / .06)) * (1 - ease2(cl((f - .92) / .06))); a3.g.rotation.z = (dir > 0 ? 1 : -1) * 1.45 * lie; a3.g.position.y = .25 * lie; a3.mouth.scale.set(.6, 3, 1);
          if (f > .54 && playing(mi)) csOnce(key('whistle'), 'whistle'); place(ref, mixp(P(clamp(bp.x - dir * 3, -11, 11), clamp(bp.z + 4, -7, 7)), P(W2.x - dir * 1.2, W2.z + 1.6), ease2(cl((f - .56) / .1))));
          const medic = R[23]; medic.g.visible = true; if (shown.indexOf(medic) < 0) shown.push(medic); medic.g.scale.setScalar(.8); medic.weirdScaled = true; kit(medic, 0xffffff, 0xffffff);
          const mq = mixp(P(W2.x - dir * 3, sideS * 8.6), P(W2.x + dir * .6, W2.z + .9), ease2(cl((f - .6) / .16))), mq2 = mixp(P(W2.x + dir * .6, W2.z + .9), P(W2.x - dir * 4, sideS * 8.6), ease2(cl((f - .9) / .1)));
          place(medic, f < .9 ? mq : mq2); if (f > .76 && f < .9) { medic.g.position.y = -.2; medic.body.rotation.x = .5; }
          [exT[3], opT[3]].forEach((pp, j) => { if (f > .62) { place(pp, P(W2.x + dir * (1.2 - j * 2.4), W2.z - 1.2)); if (f > .7 && f < .9) pp.g.position.y = -.3; } });
          Wd(.56, 'INJURY!', 2); }
        if (isOff && f > .7) { if (playing(mi)) csOnce(key('whistle'), 'whistle'); ref.armR.rotation.x = 2.8; spr('\u{1F6A9}', ref.g.position.x, 5.4, ref.g.position.z, 1.3); [a1, a2, a3].forEach(sad); defT.slice(0, 10).forEach((pp, i) => cheer(pp, i)); if (f > .74) Wd(.76, 'OFFSIDE!', 2); }
        if (playing(mi)) { if (!isPen && f > .2 && f < .24) csOnce(key('k1'), 'thump'); if (!isPen && f > .34 && f < .38) csOnce(key('k2'), 'thump'); if (f > .58 && f < .62 && kind0 !== 'foul' && kind0 !== 'tackle') csOnce(key('shot'), 'bam'); if (f > .7 && goalish) { csOnce(key('goal'), 'applause'); csOnce(key('goal2'), 'cheer2'); } if (f > .7 && res === 'save') csOnce(key('sv'), 'clap2'); if (f > .7 && res === 'miss') csOnce(key('ms'), 'sigh'); if (f > .7 && res === 'post') csOnce(key('ps'), 'clink'); }
        if (goalish && f > .7 && f < .75) { flashA = Math.max(flashA, (1 - (f - .7) / .05) * .5); zoomPunch = Math.max(zoomPunch, .4); }
        if (kind0 === 'foul' && f > .56) Wd(.58, 'FOUL!', 2); if (isPen && f > .4) Wd(.5, 'PENALTY!', 3);
        if (celeb) confetti(t, 60);
        else if (f > .72 && res === 'save') keeperD.armL.rotation.x = keeperD.armR.rotation.x = 1.0;
        else if (f > .72 && (res === 'miss' || res === 'post')) { a3.armL.rotation.x = a3.armR.rotation.x = 2.4; a3.head.rotation.x = .3; }
        if (celeb) { [a1, a2, a3].forEach((pp, i) => { if (pp !== a3 && !isPen) pp.g.position.x = lrp(pp.g.position.x, a3.g.position.x - dir * (1.5 + i), .3); cheer(pp, i); }); sad(keeperD); }
      } else {
        if (kind0 === 'kickoff' && ST < 2 && playing(mi)) csOnce(key('whistle'), 'whistle');
        if (kind0 === 'final') { if (ST < 2 && playing(mi)) csOnce(key('whistle'), 'whistle'); if (win) confetti(t, 70); }
      }
      crowdUpdate(t, celeb ? 1 : (kind0 === 'final' ? .8 : (res === 'save' && f > .7) ? .5 : .2), opK);
      const ball = new THREE.Mesh(ballGeo, soccerMat); ball.userData.shared = true; ball.scale.setScalar(1.5); ball.position.set(bw.x, bp.y * .8 + .5, bw.z); { const rg = new THREE.Mesh(fxTorus, fxMatY); rg.userData.shared = true; rg.rotation.x = -Math.PI / 2; rg.scale.setScalar(1.1); rg.position.set(bw.x, .16, bw.z); fxGroup.add(rg); } ball.rotation.set(t * 11, 0, t * 7); fxGroup.add(ball);
      const done = goalish && f > .72; soccerHud = { a: SO.opp, sa: done ? SO.after[0] : SO.before[0], sb: done ? SO.after[1] : SO.before[1], min: SO.min, col: SO.col }; if (SO.type === 'final') soccerHud.min = 90;
      const wide = new THREE.Vector3(clamp(bw.x * .45, -22, 22), 15, 31), wlook = new THREE.Vector3(clamp(bw.x * .7, -26, 26), .5, 0), brw = kind0 === 'brawl' || kind0 === 'scuffle', cin = play ? (brw ? eas(cl((f - .5) / .08)) * (1 - eas(cl((f - .93) / .05))) : eas(cl((f - .45) / .1)) * (1 - eas(cl((f - .8) / .12)))) : 0;
      const nz = Math.abs(bw.z) > 9 ? -Math.sign(bw.z) * 15 : bw.z + 17, near = brw ? new THREE.Vector3(bw.x + 2, 7, clamp(bw.z + 13, -15, 15)) : new THREE.Vector3(bw.x * .75 + dir * 6, 8, clamp(nz, -15, 16)), nlook = new THREE.Vector3(bw.x, 1.4, bw.z), cpos = wide.clone().lerp(near, cin), clk = wlook.clone().lerp(nlook, cin);
      fightCam = { pos: cpos, look: clk, k: 1 };
      look.set(clamp(bw.x * .7, -26, 26), 1, 0); return 22;
    }
    if (style === 'desk') {   // one serious person sits behind a counter, perfectly still, while nothing at all happens
      wmT(7.5, 1.5, 2.2, 0x8a6a4a, 0, .75, .4); wmT(7.8, .18, 2.5, 0xb08a5e, 0, 1.6, .4); wmT(1.8, .45, .1, 0xffffff, 0, 1.2, 1.55); wmT(1, .35, .8, 0xffffff, -2.6, 1.85, .4); wmT(.9, .3, .7, 0xfff9c4, -2.4, 2.1, .3);
      wmT(.6, 1.4, .6, 0x2e7d32, 3.3, 2.1, -.2); wmT(1.3, 1.3, .12, 0xffffff, 3.6, 5.4, -4.2); const hand = wmT(.12, .55, .1, 0x111111, 3.6, 5.6, -4.1); hand.rotation.z = -t * .05;
      if (CINEMA_MOVIES[mi].tv && /NEWS/.test(CINEMA_MOVIES[mi].tvTag || '')) { wmT(10, 3.6, .2, 0x1e3a8a, 0, 3.6, -3.4); wmT(10, .35, .24, 0xe53935, 0, 5.6, -3.3); wmT(10, .2, .24, 0xffffff, 0, 1.9, -3.3); for (let q = 0; q < 6; q++) wmT(.9, .9, .1, 0x90caf9, -4 + q * 1.6, 3.6, -3.25); wmT(2.6, .5, .12, 0xffffff, 0, 5.0, -3.2); }
      if (A) { A.g.position.set(0, -.45, -1.5); A.g.rotation.y = 0; A.legL.rotation.x = A.legR.rotation.x = -1.4; A.armL.rotation.x = A.armR.rotation.x = -1.25; A.armL.rotation.z = -.15; A.armR.rotation.z = .15; A.head.rotation.y = sn(t * .35) * .08; A.head.rotation.x = .04; A.mouth.scale.set(1, .5, 1); }
      if (B) { B.g.position.set(-4.6, 0, -.4); B.g.rotation.y = .5; B.armL.rotation.x = B.armR.rotation.x = .2; B.head.rotation.x = .15; B.body.position.y = sn(t * .5) * .03; }
      if (act[2]) { act[2].g.position.set(4.4, -.45, -.8); act[2].g.rotation.y = -.5; act[2].legL.rotation.x = act[2].legR.rotation.x = -1.4; act[2].head.rotation.x = .3 + sn(t * .4) * .1; act[2].armL.rotation.x = act[2].armR.rotation.x = -.5; }
      ex.forEach((p, i) => { p.g.position.set((i - (ex.length - 1) / 2) * 2.2, -.45, -5); p.g.rotation.y = 0; p.legL.rotation.x = p.legR.rotation.x = -1.4; p.head.rotation.x = .35 + sn(t * .3 + i) * .08; p.armL.rotation.x = p.armR.rotation.x = -.4; });
      look.set(0, 2.5, -1); return 10;
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
    HUE = (style === 'soccer' || style === 'battle') ? 0 : vr.hue; const tt = (style === 'soccer' || style === 'battle') ? t : t * vr.tempo, sp = activityBase(style, act, ex, tt, u, look, mi, si); HUE = 0;
    act.concat(ex).forEach((p, i) => { const T = 3.3, c = Math.floor((tt + i * .73) / T), q = ((tt + i * .73) % T) / T / .28; if (q < 1 && hash(c, i + vr.fl, 4) % 3 !== 0 && !(style === 'dance' || style === 'highfive' || style === 'drive' || style === 'spinning' || style === 'desk' || style === 'soccer' || style === 'battle')) flourish(p, FLOURISH[hash(c, i + vr.fl, 9) % 8], q); });
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
    cheer2() { for (let i = 0; i < 5; i++) tn(300 + Math.random() * 300, 'sawtooth', .03, .25, Math.random() * .2, 500); }, clap2() { for (let i = 0; i < 3; i++) nz(.1, .04, i * .09, 'bandpass', 1800, 1); }, whoosh2() { tn(1400, 'sine', .08, .9, 0, 200); nz(.06, .9, 0, 'bandpass', 1500, 1, 300); }, boom2() { tn(60, 'sawtooth', .3, .5, 0, 30); nz(.25, .45, 0, 'lowpass', 700, .5, 120); }, bam() { tn(160, 'square', .2, .07); tn(80, 'sine', .18, .12, .04); nz(.12, .06, 0, 'bandpass', 1800, 1); },
    charge() { tn(120, 'sawtooth', .09, 1.1, 0, 1100); tn(240, 'square', .05, 1.1, 0, 1600); }, smash() { tn(55, 'sawtooth', .35, .7, 0, 25); nz(.3, .6, 0, 'lowpass', 900, .5, 120); nz(.15, .15, 0, 'highpass', 3000); tn(1800, 'sine', .08, .3, .05, 300); },
    rocketLaunch() { nz(.2, 1.0, 0, 'lowpass', 400, .5, 1800); tn(70, 'sawtooth', .15, 1, 0, 200); }, yum() { tn(500, 'sine', .09, .15, 0, 700); tn(700, 'sine', .08, .2, .12, 900); }, doorbell() { tn(660, 'sine', .12, .35); tn(523, 'sine', .12, .5, .35); },
    rustle() { nz(.07, .5, 0, 'bandpass', 3000, .8); }, warp() { tn(150, 'sine', .12, .7, 0, 1400); tn(300, 'triangle', .08, .7, 0, 2000); }, chime() { tn(988, 'sine', .08, .7); tn(1319, 'sine', .06, .7, .1); },
    fanfare() { [523, 659, 784, 1047].forEach((f, i) => tn(f, 'square', .06, i === 3 ? .5 : .16, i * .12)); }, pageflip() { nz(.08, .12, 0, 'highpass', 4000); nz(.06, .1, .1, 'bandpass', 3000); }, flame() { nz(.1, .5, 0, 'bandpass', 900, .7, 2500); },
    heartbeat() { tn(70, 'sine', .2, .12); tn(60, 'sine', .16, .12, .18); }, zap() { tn(2000, 'sawtooth', .1, .25, 0, 100); nz(.1, .2, 0, 'highpass', 3000); }, roar() { tn(90, 'sawtooth', .2, .9, 0, 180); tn(140, 'sawtooth', .12, .8, .05, 70); nz(.1, .8, 0, 'lowpass', 500); },
    beepbeep() { tn(1000, 'square', .06, .07); tn(1000, 'square', .06, .07, .12); tn(1400, 'square', .06, .09, .26); }, woo() { tn(350, 'sine', .1, .5, 0, 550); tn(550, 'sine', .1, .5, .45, 300); }, warble() { tn(700, 'sine', .09, .5, 0, 1100); tn(1100, 'sine', .08, .5, .1, 650); },
    meow() { tn(700, 'triangle', .1, .4, 0, 1100); tn(1100, 'triangle', .08, .3, .15, 600); }, trumpet() { tn(392, 'sawtooth', .07, .2); tn(523, 'sawtooth', .07, .4, .2); }, chuckle() { for (let i = 0; i < 4; i++) tn(320 + i * 20, 'triangle', .06, .09, i * .14, 260); },
    sob() { tn(420, 'sine', .07, .35, 0, 300); tn(400, 'sine', .07, .35, .4, 280); }, gasp() { nz(.1, .25, 0, 'bandpass', 1500, 1, 3000); }, chatter() { for (let i = 0; i < 6; i++) tn(1500, 'square', .03, .03, i * .05); }, sigh() { nz(.07, .7, 0, 'bandpass', 1200, .5, 400); },
    hmm() { tn(180, 'sine', .08, .5, 0, 230); }, smack() { nz(.2, .05, 0, 'bandpass', 1800, 1); tn(250, 'square', .06, .05); }, knock() { for (let i = 0; i < 3; i++) tn(200, 'sine', .2, .08, i * .2, 150); }, bell() { tn(880, 'sine', .12, .9); tn(1760, 'sine', .05, .7); },
    screech() { tn(900, 'sawtooth', .05, .8, 0, 1250); nz(.08, .8, 0, 'highpass', 3500); }, tick() { tn(1800, 'square', .05, .03); tn(1500, 'square', .05, .03, .5); }, jingle() { [2093, 2637, 3136, 2349].forEach((f, i) => tn(f, 'sine', .05, .15, i * .06)); }, wind() { nz(.07, 1.2, 0, 'bandpass', 500, .6, 900); }, crack() { nz(.2, .08, 0, 'highpass', 3500); tn(2500, 'sine', .06, .05); },
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
    highfive: [.34, 'slap'], party: [1.2, 'pop'], fish: [.28, 'splash'], camp: [3.5, 'crackle'], magic: [.6, 'sparkle'], bubbles: [3.2, 'pop'], photo: [.38, 'shutter'], skate: [2.6, 'swish'], snowball: [.85, 'whump'], juggle: [4.2, 'toss'], tugwar: [1.1, 'creak'], cook: [2.4, 'sizzle'], drum: [4.6, 'drum'], build: [1.15, 'thump'], work: [2.6, 'hammer'], drive: [.5, 'honk2'], spinning: [1.6, 'swish'], desk: [.5, 'tick'], panic: [1.5, 'squeak'], look: [.0, null], talk: [.0, null] };
  const csState = { style: '', idx: -1, once: {}, eng: null, amb: null, ambKey: '', ambTimer: 0 };
  function csFlow(style, t, mi) {
    try {
      if (!playing(mi)) return;
      const d = CS_STYLE[style]; if (csState.style !== style) { csState.style = style; csState.idx = d && d[0] ? Math.floor(t * d[0]) : -1; }
      if (d && d[0]) { const idx = Math.floor(t * d[0]); if (idx !== csState.idx) { csState.idx = idx; CSFX[d[1]](); } }
      if (style === 'fly' || style === 'drive') csEngine(true); else csEngine(false);
      if (style === 'drive' && Math.floor(t * .9) !== csState.scr) { csState.scr = Math.floor(t * .9); CSFX.screech(); }
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
  // ---------- weird stuff: pizza rain, floating cows, no gravity, a giant duck, big heads, tiny people, fish in the sky, an upside-down world, a sun in sunglasses ----------
  const WEIRD = ['pizzaRain', 'cows', 'gravity', 'duck', 'bigHead', 'tiny', 'fishSky', 'upsideDown', 'coolSun', 'donutRain'];
  let weirdFlip = false;
  Object.assign(CSFX, { quack() { tn(520, 'sawtooth', .1, .14, 0, 360); tn(470, 'sawtooth', .09, .16, .2, 330); }, moo() { tn(150, 'sawtooth', .12, .9, 0, 105); } });
  function weirdFx(mi, si, mv, t, u, style, act, ex, beatNo) {
    const always = mv.tv && /WEIRD/.test(mv.tvTag || ''), roll = hash(mi, si, 41) % 100;
    if (!always && !(roll < 60 && beatNo === hash(mi, si, 43) % 3)) return; if (u < .1 || u > .9) return;
    const type = always ? WEIRD[hash(mi + si, beatNo, 47) % WEIRD.length] : WEIRD[hash(mi, si, 47) % WEIRD.length], all = act.concat(ex), calm = ['fight', 'fly', 'drive', 'spinning'].indexOf(style) < 0, sn = Math.sin, key = mi + '_' + si + '_' + beatNo + '_w';
    const say = (txt, snd) => { words2d(.8, txt, 5); if (playing(mi)) csOnce(key, snd || 'warp'); };
    if (type === 'pizzaRain' || type === 'donutRain') { const em = type === 'pizzaRain' ? ['\u{1F355}', '\u{1F354}', '\u{1F32D}'] : ['\u{1F369}', '\u{1F36A}', '\u{1F382}']; for (let k = 0; k < 20; k++) { const ag = (t * .45 + k * .137) % 1; spr(em[k % 3], (k * 2.7 % 20) - 10, 11 - ag * 11, -3 + (k * 1.9 % 7), 1.5); } say(type === 'pizzaRain' ? 'IT IS RAINING PIZZA?!' : 'DONUTS FROM THE SKY?!', 'pop'); }
    else if (type === 'cows') { for (let k = 0; k < 3; k++) spr('\u{1F404}', -9 + ((t * .8 + k * 6) % 22), 7 + k * 1.6 + sn(t * 2 + k) * .6, -9, 4); say('MOO?!', 'moo'); }
    else if (type === 'gravity' && calm) { all.forEach((p, i) => { p.g.position.y += 2.6 + sn(t * 1.5 + i) * 1.6; p.armL.rotation.z = -1.2 + sn(t * 3 + i) * .5; p.armR.rotation.z = 1.2 - sn(t * 3 + i) * .5; p.g.rotation.x = sn(t + i) * .4; }); say('NO GRAVITY!', 'warp'); }
    else if (type === 'duck') { const x = -16 + ((t * 2.6) % 32), dk = [[3.6, 3, 3.6, 0xffd93b, 0, 2, 0], [2.2, 2.2, 2.2, 0xffd93b, 1.6, 4.1, 0], [1.1, .6, 1.4, 0xff8a1f, 3, 4, 0]]; dk.forEach(d => { const m = wMesh(d[0], d[1], d[2], d[3], x + d[4], d[5] + Math.abs(sn(t * 5)) * .3, -8.5); m.rotation.z = sn(t * 5) * .08; }); wMesh(.5, .5, .5, 0x222222, x + 2.2, 4.8, -8.2); say('QUACK!', 'quack'); }
    else if (type === 'bigHead' && calm) { all.forEach(p => { p.head.scale.setScalar(2.3); }); say('BIG HEAD MODE!', 'boing'); }
    else if (type === 'tiny' && calm) { all.forEach(p => { p.g.scale.setScalar(.7); p.weirdScaled = true; }); say('EVERYONE IS TINY!', 'boing'); }
    else if (type === 'fishSky') { for (let k = 0; k < 6; k++) spr(k % 2 ? '\u{1F41F}' : '\u{1F420}', -10 + ((t * 1.5 + k * 4) % 22), 4 + k * 1.1 + sn(t * 3 + k) * .8, -6, 2.2); say('FISH IN THE SKY?!', 'splash'); }
    else if (type === 'upsideDown') { weirdFlip = true; say('UPSIDE DOWN DAY!', 'warp'); }
    else if (type === 'coolSun') { spr('\u{1F31E}', 9, 11, -14, 9); spr('\u{1F60E}', 9, 11.2, -13.5, 4.4); say('THE SUN GOT SUNGLASSES!', 'chime'); }
  }
  // ---------- soccer: 22 players (11 a side), goalkeepers, a giant pitch and a real crowd ----------
  let socRoster = null, crowd = null; const SK = 1.9, SOC_SLOTS = [[2, -2.5, .6], [2, 2.5, .6], [-3.5, -5.5, .45], [-3.5, -1.8, .45], [-3.5, 1.8, .45], [-3.5, 5.5, .45], [-9, -5.5, .3], [-9, -2, .3], [-9, 2, .3], [-9, 5.5, .3], [-12.2, 0, 0]];
  function soccerRoster() {
    if (socRoster) return socRoster; const pool = npcPool().concat(SIPDEFS), out = [];
    for (let i = 0; i < 24; i++) { const def = pool[(i * 5 + 2) % pool.length], pr = buildPerson(def, { noTag: true, hat: null }); pr.costume = null; pr.g.visible = false; SC.add(pr.g); out.push(pr); }
    return (socRoster = out);
  }
  function kit(pr, shirt, pants) { try { pr.torso.material.color.setHex(shirt); pr.armL.children[0].material.color.setHex(shirt); pr.armR.children[0].material.color.setHex(shirt); pr.legL.children[0].material.color.setHex(pants); pr.legR.children[0].material.color.setHex(pants); } catch (e) { } }
  function ensureCrowd() {
    if (crowd) return crowd; const g = new THREE.Group(), pos = []; SC.add(g);
    const stepMat = [new THREE.MeshLambertMaterial({ color: 0x7b7f8c }), new THREE.MeshLambertMaterial({ color: 0x6a6e7a })];
    const addStep = (x, y, z, w, h, d, k) => { const m = new THREE.Mesh(wGeo, stepMat[k % 2]); m.scale.set(w, h, d); m.position.set(x, y, z); g.add(m); };
    for (let sd = -1; sd <= 1; sd += 2) {
      for (let r = 0; r < 10; r++) { const z = sd * (17.5 + r * 1.7), y = .6 + r * 1.15; addStep(0, y / 2, z, 64, y, 1.8, r); for (let x = -30; x <= 30; x += 1.5) pos.push([x + (r % 2) * .5, y, z]); }
      for (let r = 0; r < 8; r++) { const x = sd * (28 + r * 1.7), y = .6 + r * 1.15; addStep(x, y / 2, 0, 1.8, y, 34, r); for (let z = -15; z <= 15; z += 1.5) pos.push([x, y, z + (r % 2) * .5]); }
    }
    [[-34, -26], [34, -26], [-34, 26], [34, 26]].forEach(q => { const m = new THREE.Mesh(wGeo, new THREE.MeshBasicMaterial({ color: 0x555a66 })); m.scale.set(.6, 16, .6); m.position.set(q[0], 8, q[1]); g.add(m); const l = new THREE.Mesh(wGeo, new THREE.MeshBasicMaterial({ color: 0xfffbe0 })); l.scale.set(3.2, 1.2, .5); l.position.set(q[0], 16.4, q[1]); g.add(l); });
    const N = pos.length, geo = wGeo, bm = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff }), N), hm = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff }), N);
    const skins = [0xf5c89a, 0xd4956a, 0x8d5a3b, 0xffe0bd, 0xc68642], dummy = new THREE.Object3D(); g.add(bm); g.add(hm);
    crowd = { g, pos, N, bm, hm, dummy, skins, col: -1 };
    for (let i = 0; i < N; i++) { try { hm.setColorAt(i, new THREE.Color(skins[(i * 7) % 5])); } catch (e) { } }
    return crowd;
  }
  function crowdUpdate(t, cheer, visCol) {
    const c = ensureCrowd(); c.g.visible = true;
    if (c.col !== visCol) { c.col = visCol; for (let i = 0; i < c.N; i++) { try { c.bm.setColorAt(i, new THREE.Color((i * 13) % 10 < 6 ? 0xe53935 : visCol)); } catch (e) { } } if (c.bm.instanceColor) c.bm.instanceColor.needsUpdate = true; if (c.hm.instanceColor) c.hm.instanceColor.needsUpdate = true; }
    const d = c.dummy;
    for (let i = 0; i < c.N; i++) { const q = c.pos[i], b = Math.abs(Math.sin(t * 5 + (i * 37 % 11))) * (cheer * .7 + .05), sw = Math.sin(t * 2 + i) * .06;
      d.position.set(q[0] + sw, q[1] + .65 + b, q[2]); d.scale.set(.9, 1.3, .6); d.updateMatrix(); c.bm.setMatrixAt(i, d.matrix);
      d.position.set(q[0] + sw, q[1] + 1.6 + b, q[2]); d.scale.set(.62, .62, .62); d.updateMatrix(); c.hm.setMatrixAt(i, d.matrix); }
    c.bm.instanceMatrix.needsUpdate = true; c.hm.instanceMatrix.needsUpdate = true;
  }
  // ---------- big cartoon battles: up to 1000 fighters a side, charging armies, falling bombs and big explosions; knocked-out fighters tumble away (no blood) ----------
  let battleObj = null; const battleCache = {};
  function ensureBattle() {
    if (battleObj) return battleObj; const g = new THREE.Group(), MAXN = 2100; SC.add(g);
    const mk = () => { const m = new THREE.InstancedMesh(wGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), MAXN); m.frustumCulled = false; g.add(m); return m; };
    return (battleObj = { g, bm: mk(), hm: mk(), wm: mk(), MAXN, d: new THREE.Object3D(), key: '' });
  }
  function battleData(key, SO, T) {
    if (battleCache[key]) return battleCache[key];
    const royale = SO.kind === 'royale', n1 = SO.n1, n2 = royale ? 0 : SO.n2, N = royale ? n1 : n1 + n2, seed = hash(SO.seed || 1, N, 7), rnd = (i, k) => (hash(i * 31 + k, seed, k + 3) % 10000) / 10000, cl = (x) => clamp(x, 0, 1);
    const a = { N, side: new Uint8Array(N), hx: new Float32Array(N), hz: new Float32Array(N), ox: new Float32Array(N), oz: new Float32Array(N), ko: new Float32Array(N), vx: new Float32Array(N), vz: new Float32Array(N), ph: new Float32Array(N), bombs: [] };
    const cols = [clamp(Math.ceil(Math.sqrt(Math.max(n1, 1) / 1.6)), 3, 40), clamp(Math.ceil(Math.sqrt(Math.max(n2, 1) / 1.6)), 3, 40)], rows = [Math.ceil(n1 / cols[0]), Math.ceil(Math.max(n2, 1) / cols[1])], win = SO.win | 0, nWin = win ? n2 : n1, sv = Math.min(SO.survivors || 1, nWin);
    for (let i = 0; i < N; i++) {
      const sd = royale ? i % 6 : (i < n1 ? 0 : 1), idx = royale ? Math.floor(i / 6) : (sd ? i - n1 : i); a.side[i] = sd; a.ph[i] = rnd(i, 9) * 6.283;
      if (royale) { const ang = rnd(i, 1) * 6.283, r1 = 36 + rnd(i, 2) * 14, r2 = Math.sqrt(rnd(i, 3)) * 17, ang2 = rnd(i, 4) * 6.283; a.hx[i] = Math.cos(ang) * r1; a.hz[i] = Math.sin(ang) * r1 * .8; a.ox[i] = Math.cos(ang2) * r2; a.oz[i] = Math.sin(ang2) * r2; const rank = (i * 7919) % N; a.ko[i] = rank === N - 1 ? 1e9 : T * (.18 + .8 * rank / N); }
      else {
        const nc = cols[sd], nr = rows[sd], col = idx % nc, row = Math.floor(idx / nc), sg = sd ? 1 : -1, zs = Math.min(1.6, 30 / nr);
        a.hx[i] = sg * (28 + col * 1.7); a.hz[i] = (row - nr / 2) * 1.6; a.ox[i] = sg * (.8 + rnd(i, 1) * 11); a.oz[i] = (row - nr / 2) * zs + (rnd(i, 2) - .5) * 2;
        const surv = sd === win && sv > 0 && (((idx * 2654435761) >>> 0) % Math.max(1, nWin)) < sv, r = rnd(i, 5);
        a.ko[i] = sd === win ? (surv ? 1e9 : T * (.5 + .47 * r)) : T * (.3 + .62 * r);
      }
      const ang3 = rnd(i, 6) * 6.283, sp = 5 + rnd(i, 7) * 9; a.vx[i] = Math.cos(ang3) * sp; a.vz[i] = Math.sin(ang3) * sp;
    }
    const B = SO.bombs | 0;
    for (let k = 0; k < B; k++) { const tb = T * (.3 + .6 * (k + .5) / B), big = (k === B - 1 && B > 3), r = big ? 12 : 6.8, ang = rnd(k + 500, 1) * 6.283, rr = Math.sqrt(rnd(k + 500, 2)) * 15; const bx = royale ? Math.cos(ang) * rr : -12 + 24 * rnd(k + 500, 3), bz = royale ? Math.sin(ang) * rr : -(Math.max(rows[0], rows[1]) * .55) + Math.max(rows[0], rows[1]) * 1.1 * rnd(k + 500, 4) * .9; a.bombs.push({ t: tb, x: bx, z: Math.max(-26, Math.min(26, bz)), r, big }); }
    a.bombs.forEach((bm, k) => { for (let i = 0; i < N; i++) { const dx = a.ox[i] - bm.x, dz = a.oz[i] - bm.z, d = Math.hypot(dx, dz); if (d < bm.r && bm.t < a.ko[i]) { a.ko[i] = bm.t + rnd(i, 20 + k) * .12; const sp = 8 + (1 - d / bm.r) * 14, nn = d || 1; a.vx[i] = dx / nn * sp; a.vz[i] = dz / nn * sp; } } });
    return (battleCache[key] = a);
  }
  function battleDraw(SO, key, ST, T, mi) {
    const b = ensureBattle(), a = battleData(key, SO, T), N = a.N, d = b.d, sn = Math.sin, ease = (x) => x * x * (3 - 2 * x), cl = (x) => clamp(x, 0, 1), royale = SO.kind === 'royale';
    b.g.visible = true; b.bm.count = b.hm.count = b.wm.count = N;
    if (b.key !== key) { b.key = key; const cols = SO.cols || [0xe53935, 0x1e88e5], heads = SO.heads || [0xf5c89a, 0xf5c89a], royaleCols = [0xe53935, 0x1e88e5, 0x43a047, 0xfdd835, 0x8e24aa, 0xff7043]; for (let i = 0; i < N; i++) { const sd = a.side[i]; try { b.bm.setColorAt(i, new THREE.Color(royale ? royaleCols[sd] : cols[sd])); b.hm.setColorAt(i, new THREE.Color(royale ? 0xf5c89a : heads[sd])); b.wm.setColorAt(i, new THREE.Color(SO.wcol || 0xcfd8dc)); } catch (e) { } } if (b.bm.instanceColor) b.bm.instanceColor.needsUpdate = true; if (b.hm.instanceColor) b.hm.instanceColor.needsUpdate = true; if (b.wm.instanceColor) b.wm.instanceColor.needsUpdate = true; }
    const charge = ease(cl(ST / (T * .24))); let alive = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < N; i++) {
      const sd = a.side[i], ph = a.ph[i], koT = a.ko[i], dt = ST - koT; let x, y = 1.3, z, sc = 1, rz = 0, ry = 0, wscale = 1;
      x = a.hx[i] + (a.ox[i] - a.hx[i]) * charge; z = a.hz[i] + (a.oz[i] - a.hz[i]) * charge;
      if (charge < 1) y += Math.abs(sn(ST * 9 + ph)) * .35; else { x += sn(ST * 3 + ph) * .9; z += Math.cos(ST * 2.6 + ph) * .9; y += Math.abs(sn(ST * 7 + ph)) * .25; }
      if (dt > 0) { const e = Math.min(dt, 1.6); x += a.vx[i] * e; z += a.vz[i] * e; y += Math.max(0, 5 * e - 5 * e * e * 1.6) + (e > 1.55 ? 0 : 0); rz = dt * 9; ry = dt * 5; if (dt > 1.6) { y = .45; rz = 1.5; } sc = dt > 2.4 ? Math.max(0, 1 - (dt - 2.4) / .8) : 1; }
      else alive[sd]++;
      const sw = sn(ST * 8 + ph);
      d.position.set(x, y, z); d.rotation.set(0, ry, rz); d.scale.set(1.5 * sc, 2.25 * sc, 1.05 * sc); d.updateMatrix(); b.bm.setMatrixAt(i, d.matrix);
      d.position.set(x, y + 1.9 * sc, z); d.rotation.set(0, ry, rz); d.scale.set(1.2 * sc, 1.2 * sc, 1.2 * sc); d.updateMatrix(); b.hm.setMatrixAt(i, d.matrix);
      const wl = SO.wlen || 1.5, side = royale ? 1 : (sd ? -1 : 1);
      d.position.set(x + side * 1.1, y + .8 + (dt > 0 ? 0 : sw * .6), z); d.rotation.set(0, ry, dt > 0 ? rz : -sw * .9 * side); d.scale.set((SO.wthick || .16) * 1.4 * sc, wl * 1.4 * sc, (SO.wthick || .16) * 1.4 * sc); d.updateMatrix(); b.wm.setMatrixAt(i, d.matrix);
    }
    b.bm.instanceMatrix.needsUpdate = b.hm.instanceMatrix.needsUpdate = b.wm.instanceMatrix.needsUpdate = true;
    // projectiles: pies, snowballs, water balloons flying between the armies
    if (SO.proj) { const pm = SO.proj === 'pies' ? 0xfff3c4 : SO.proj === 'snow' ? 0xffffff : 0x4fc3f7; const mt = SO.proj === 'pies' ? pieMat : SO.proj === 'snow' ? snowMat : waterMat; for (let k = 0; k < 40; k++) { const ph2 = (ST * .6 + k * .173) % 1, dirp = k % 2 ? 1 : -1, zz = -20 + ((k * 37) % 40), m = new THREE.Mesh(ballGeo, mt); m.userData.shared = true; m.scale.setScalar(1.1); m.position.set(dirp * (22 - ph2 * 44), 1 + sn(Math.PI * ph2) * 9, zz + sn(k) * 3); fxGroup.add(m); } }
    // bombs: a black bomb falls, then a big cartoon explosion
    const bombs = a.bombs; let camT = null;
    bombs.forEach((bm, k) => {
      const q = ST - bm.t, key2 = key + '_b' + k;
      if (q > -1.1 && q < 0) { const fall = (q + 1.1) / 1.1, m = new THREE.Mesh(ballGeo, bombMat); m.userData.shared = true; m.scale.setScalar(bm.big ? 3.4 : 2); m.position.set(bm.x, 38 * (1 - fall * fall) + .8, bm.z); fxGroup.add(m); const f2 = new THREE.Mesh(fxStar, fxMatY); f2.userData.shared = true; f2.position.set(bm.x, m.position.y + (bm.big ? 1.9 : 1.2), bm.z); f2.scale.setScalar(.9 + sn(ST * 40) * .3); fxGroup.add(f2); if (playing(mi)) csOnce(key2 + 'w', 'whoosh2'); }
      if (q >= 0 && q < 2.2) {
        const e = cl(q / .45), rr = bm.r * (.4 + .9 * ease(e)), fade = q > 1.2 ? 1 - (q - 1.2) / 1 : 1;
        const ex1 = new THREE.Mesh(ballGeo, boomMat); ex1.userData.shared = true; ex1.scale.setScalar(rr * 2.2 * fade + .01); ex1.position.set(bm.x, rr * .5, bm.z); fxGroup.add(ex1);
        const ex2 = new THREE.Mesh(ballGeo, boomMat2); ex2.userData.shared = true; ex2.scale.setScalar(rr * 1.4 * (q < .8 ? 1 : fade) + .01); ex2.position.set(bm.x, rr * .5, bm.z); fxGroup.add(ex2);
        const ring = new THREE.Mesh(fxTorus, fxMatW); ring.userData.shared = true; ring.rotation.x = -Math.PI / 2; ring.scale.setScalar(Math.max(.01, bm.r * 1.8 * e * fade)); ring.position.set(bm.x, .3, bm.z); fxGroup.add(ring);
        for (let j = 0; j < 7; j++) { const sm = new THREE.Mesh(ballGeo, smokeMat); sm.userData.shared = true; const aj = j * 0.9; sm.scale.setScalar((1.6 + q * 1.6) * (1 + (j % 3) * .3)); sm.position.set(bm.x + Math.cos(aj) * bm.r * .5 * e, 2 + q * 5 + j * .5, bm.z + Math.sin(aj) * bm.r * .5 * e); fxGroup.add(sm); }
        if (q < .12) flashA = Math.max(flashA, (1 - q / .12) * (bm.big ? .9 : .5)); zoomPunch = Math.max(zoomPunch, q < .3 ? 1 - q / .3 : 0);
        if (playing(mi)) csOnce(key2 + 'x', bm.big ? 'smash' : 'boom2'); if (q < 1.2) words2d(bm.t - beatOffset + .05, bm.big ? 'MEGA BOMB!' : 'BOOM!', 3 + (k % 3));
        camT = { x: bm.x, z: bm.z, k: ease(cl(q / .4)) * (1 - ease(cl((q - 1.6) / .6))) };
      }
    });
    let t1 = 0, t2 = 0; if (royale) { t1 = alive[0] + alive[1] + alive[2] + alive[3] + alive[4] + alive[5]; } else { t1 = alive[0]; t2 = alive[1]; }
    battleHud = { royale, a: SO.name1, b: SO.name2, n1: SO.n1, n2: SO.n2, left1: t1, left2: t2, col1: (SO.cols || [])[0], col2: (SO.cols || [])[1], weapon: SO.weapon, finished: ST > T * .98 };
    return camT;
  }
  // ---------- TV show intros: a title sequence with a logo, the episode title, the cast, and a theme tune made for each show ----------
  function introTheme(seed) {
    try {
      const c = CA(), now = c.currentTime + .05, midi = (m) => 440 * Math.pow(2, (m - 69) / 12), minor = seed % 3 !== 0, sc = minor ? [0, 2, 3, 5, 7, 8, 10, 12] : [0, 2, 4, 5, 7, 9, 11, 12], root = [45, 47, 48, 50, 52][seed % 5], bpm = 128 + (seed % 5) * 6, st = 60 / bpm / 2, motif = []; for (let i = 0; i < 8; i++) motif.push(sc[(seed * (i + 3) * 7 + i * 5) % 8]);
      const note = (f, type, v, d, at) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, now + at); g.gain.setValueAtTime(v, now + at); g.gain.exponentialRampToValueAtTime(.0008, now + at + d); o.connect(g); g.connect(c.destination); o.start(now + at); o.stop(now + at + d + .02); };
      const hit = (v, d, at, hp) => { const s2 = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s2.buffer = NB(); fl.type = hp ? 'highpass' : 'lowpass'; fl.frequency.value = hp ? 4500 : 300; g.gain.setValueAtTime(v, now + at); g.gain.exponentialRampToValueAtTime(.0008, now + at + d); s2.connect(fl); fl.connect(g); g.connect(c.destination); s2.start(now + at); s2.stop(now + at + d + .02); };
      for (let i = 0; i < 32; i++) { const at = i * st; note(midi(root - 12 + (i % 8 < 4 ? 0 : sc[2])), 'sawtooth', .09, st * .9, at); note(midi(root + sc[(i * 3 + seed) % 8]), 'square', .035, st * .8, at); if (i % 4 === 0) { note(110, 'sine', .22, .22, at); hit(.1, .12, at, false); } if (i % 4 === 2) hit(.08, .1, at, true); if (i % 2 === 1) hit(.03, .05, at, true); }
      for (let i = 0; i < 16; i++) { const at = 8 * st + i * st * 1; note(midi(root + 12 + motif[i % 8]), 'triangle', .1, st * (i % 4 === 3 ? 2.2 : .9), at); }
      note(midi(root + 12), 'sawtooth', .1, 1.4, 28 * st); note(midi(root + 19), 'sawtooth', .08, 1.4, 28 * st); note(55, 'sine', .3, 1.2, 28 * st);
    } catch (e) { }
  }
  CSFX.introNow = function () { introTheme(window.__introSeed || 1); };
  // how long each feeling lingers after the line is said (seconds)
  const EMO_HOLD = { sad: 3.4, joy: 2.6, scared: 2.6, warm: 2.6, relieved: 2.6, angry: 2.2, shocked: 2.2, worried: 2.6, excited: 1.8, surprised: 1.8, happy: 2.0, determined: 1.6, serious: 1.6, curious: 1.4 };
  // ---------- the director: puts the right characters in the right place doing what the caption says ----------
  function directBeat(mi, si, mv, sc, t, info, dur, camSeed) {
    const u = clamp(t / dur, 0, 1); flashA = 0; zoomPunch = 0; fightHud = null; fightCam = null; soccerHud = null; battleHud = null; if (crowd) crowd.g.visible = false; if (battleObj) battleObj.g.visible = false; weirdFlip = false;
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
    { const tS0 = t + beatOffset, dlgE = getDialogue(mi, si, mv, sc); act.forEach((pp, ii) => { const who = info.present[ii]; let e = emo[ii] || emo[0] || 'neutral'; const hl = dlgE.filter(l => l.who === who && tS0 >= l.start - .2 && tS0 <= l.end + (EMO_HOLD[l.emo] || 2.5) + 1.5).pop(); if (hl && hl.emo) e = hl.emo; emote(pp, e, t, true); }); } ex.forEach(pp => emote(pp, xe, t, false));
    { const tS = t + beatOffset, dlg = getDialogue(mi, si, mv, sc), ln = dlg.find(l => l.who !== 'N' && tS >= l.start - .15 && tS <= l.end + (EMO_HOLD[l.emo] || .6));
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
      if (/\b(explod\w*|explosion\w*|boom|crash\w*|bang|blast\w*|kaboom|thunder\w*)\b/.test(lt) && age >= 0 && age < 1.2) { if (playing(mi)) csOnce(mi + '_' + si + '_' + t0 + 'b', 'boom2'); if (age < .35) { flashA = Math.max(flashA, (1 - age / .35) * .9); shake = Math.max(shake, .6 * (1 - age / .35)); } words2d(t0 - beatOffset + .05, 'BOOM!', 3); }
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
    CAM.up.set(0, weirdFlip ? -1 : 1, 0); CAM.lookAt(look); rim.position.set(look.x - 8, 6, look.z + 4);
    return info;
  }
  // what is being SAID right now (the narrator's caption at the start, then every line) decides what is being DONE
  function wordsStyle(dl, sc, mi, si, t) {
    if (/BORING|NEWS|SOCCER|FIGHT|SHOW/.test((CINEMA_MOVIES[mi] && CINEMA_MOVIES[mi].tvTag) || '')) return null;   // the Boring Channel never does anything exciting, whatever the words say
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
        if (mv.seamless) fade = (si === 0 && bi === 0) ? Math.max(0, 1 - t / 0.8) : (si === mv.scenes.length - 1 && bi === (dlx.beats.length - 1) && pos > BL - .8) ? (pos - (BL - .8)) / .8 : 0;
        if (fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, fade) + ')'; ctx.fillRect(0, 0, w, h); } }
      { const nEnd = 0.4 + wc(sc.text) / 2.6 + (si === 0 ? (wc(mv.title) + 17) / 2.6 + 1.0 : 0) + 0.3;
        if (t >= 0.3 && t <= nEnd && !mv.seamless) { const fs = Math.max(14, Math.round(h * .034)), nm = narratorPersona(mi, mv); ctx.save(); ctx.textAlign = 'center'; ctx.font = 'bold ' + fs + 'px Arial';
          const txt = '\uD83C\uDF99\uFE0F  NARRATOR  \u2022  ' + nm, tw = ctx.measureText(txt).width; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(w / 2 - tw / 2 - fs, h * .8 - fs * 1.05, tw + fs * 2, fs * 1.5);
          ctx.fillStyle = '#ffd54f'; ctx.fillText(txt, w / 2, h * .8); ctx.restore(); } }
      if (t < 3.6 && !mv.seamless) {
        const a = t < .5 ? t / .5 : (t > 2.9 ? Math.max(0, (3.6 - t) / .7) : 1), fs = Math.max(14, Math.round(h * .036)), nm = '\uD83D\uDCCD  ' + placeNameFor(mv, info.kind).toUpperCase();
        ctx.save(); ctx.globalAlpha = a; ctx.font = 'bold ' + fs + 'px Arial'; ctx.textAlign = 'left'; const tw = ctx.measureText(nm).width;
        ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(w * .04, h * .12, tw + fs * 1.6, fs * 1.7); ctx.fillStyle = '#7dffb2'; ctx.fillRect(w * .04, h * .12, fs * .25, fs * 1.7); ctx.fillStyle = '#fff'; ctx.fillText(nm, w * .04 + fs * .8, h * .12 + fs * 1.2); ctx.restore();
      }
      if (si === 0 && !mv.tv && t > .1 && t < 1 && titleKey !== mi && playing(mi)) { titleKey = mi; try { sfx.power(); setTimeout(() => { try { sfx.cheer(); } catch (e) { } }, 350); } catch (e) { } }
      if (si === 0 && !mv.tv && t < 6.5) {
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
      {   // it looks like a real show: film vignette and grain, widescreen bars, a channel logo, scene counter, cast introductions
        const vg = ctx.createRadialGradient(w / 2, h / 2, h * .35, w / 2, h / 2, h * .95); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.38)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255,255,255,.07)'; for (let q = 0; q < 70; q++) ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h * .045); ctx.fillRect(0, h * .955, w, h * .045);
        const fs0 = Math.max(11, Math.round(h * .026)); ctx.save(); ctx.font = '900 ' + fs0 + 'px Arial Black, Arial'; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(0,0,0,.55)'; const bt = 'EXPLOX TV  \u2022  HD', btw = ctx.measureText(bt).width; ctx.fillRect(w * .965 - btw - fs0, h * .052, btw + fs0 * 1.6, fs0 * 1.7); ctx.fillStyle = '#ff4d6d'; ctx.beginPath(); ctx.arc(w * .965 - btw - fs0 * .35, h * .052 + fs0 * .85, fs0 * .28, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(bt, w * .965 + fs0 * .2, h * .052 + fs0 * 1.25); ctx.restore();
        if (t < 3.6 && !mv.seamless) { ctx.save(); ctx.font = 'bold ' + Math.round(fs0 * .95) + 'px Arial'; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.globalAlpha = t < .5 ? t / .5 : (t > 2.9 ? Math.max(0, (3.6 - t) / .7) : 1); ctx.fillText(mv.tv ? String(mv.tvTag || 'TV') : 'SCENE ' + (si + 1) + ' OF ' + mv.scenes.length + '  \u2022  ' + String(info.tod || 'day').toUpperCase(), w * .04 + fs0 * .8, h * .12 + fs0 * 3.4); ctx.restore(); }
        if (mv.tv && mv.ticker) { const tf = Math.max(12, Math.round(h * .03)); ctx.save(); ctx.fillStyle = 'rgba(10,20,60,.88)'; ctx.fillRect(0, h * .905, w, tf * 1.6); ctx.fillStyle = '#e53935'; ctx.fillRect(0, h * .905, tf * 5.2, tf * 1.6); ctx.fillStyle = '#fff'; ctx.font = '900 ' + tf + 'px Arial Black, Arial'; ctx.textAlign = 'left'; ctx.fillText('LIVE', tf * .8, h * .905 + tf * 1.15); ctx.beginPath(); ctx.rect(tf * 5.3, h * .905, w, tf * 1.6); ctx.clip(); ctx.font = 'bold ' + tf + 'px Arial'; const tw2 = ctx.measureText(mv.ticker).width + w * .3; ctx.fillText(mv.ticker, w - ((t * w * .09) % (tw2 + w)), h * .905 + tf * 1.15); ctx.restore(); }
        if (si === 0 && !mv.tv && t > 6.8 && t < 13.2) { const cl3 = castList(mi, mv), k = Math.min(2, Math.floor((t - 6.8) / 2.1)), q = (t - 6.8) - k * 2.1, c3 = cl3[k], a3 = q < .35 ? q / .35 : (q > 1.75 ? Math.max(0, (2.1 - q) / .35) : 1), fs3 = Math.max(14, Math.round(h * .042));
          if (c3) { ctx.save(); ctx.globalAlpha = a3; ctx.translate((1 - a3) * -w * .1, 0); const bx = w * .04, by = h * .6, bw3 = w * .46, bh3 = fs3 * 3.4; ctx.fillStyle = 'rgba(0,0,0,.62)'; ctx.fillRect(bx, by, bw3, bh3); ctx.fillStyle = ['#ffd54f', '#4fc3f7', '#ff8ab3'][k]; ctx.fillRect(bx, by, fs3 * .3, bh3); ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = '900 ' + fs3 + 'px Arial Black, Arial'; ctx.fillText(String(c3.role).toUpperCase(), bx + fs3 * .8, by + fs3 * 1.15); ctx.font = 'bold ' + Math.round(fs3 * .62) + 'px Arial'; ctx.fillStyle = '#9fe3ff'; ctx.fillText('played by \u2605 ' + c3.actor, bx + fs3 * .8, by + fs3 * 2.05); ctx.fillStyle = '#ffd54f'; ctx.font = 'italic ' + Math.round(fs3 * .6) + 'px Arial'; ctx.fillText(c3.tag || '', bx + fs3 * .8, by + fs3 * 2.8); ctx.restore(); } }
      }
        if (mv.tv && mv.tvIntro && si === 0 && t < 10.5) {   // the title sequence
          const I = mv.tvIntro, k = clamp(t / 1.2, 0, 1), e = k * k * (3 - 2 * k), sc2 = 2.4 - 1.4 * e, fade = t < 9 ? 1 : Math.max(0, (10.5 - t) / 1.5), hx = '#' + String(I.col || '#ff5722').replace('#', '');
          if (playing(mi)) { window.__introSeed = I.seed; csOnce('intro_' + mi + '_' + I.seed + '_' + I.ep, 'introNow'); }
          ctx.save(); ctx.globalAlpha = fade; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, w, h);
          for (let q = 0; q < 9; q++) { const ang = q * .7 + t * .6; ctx.fillStyle = 'rgba(255,255,255,' + (.05 + .04 * Math.sin(t * 3 + q)) + ')'; ctx.beginPath(); ctx.moveTo(w / 2, h * .46); ctx.lineTo(w / 2 + Math.cos(ang) * w, h * .46 + Math.sin(ang) * w); ctx.lineTo(w / 2 + Math.cos(ang + .12) * w, h * .46 + Math.sin(ang + .12) * w); ctx.closePath(); ctx.fill(); }
          ctx.textAlign = 'center'; ctx.lineJoin = 'round'; let fsz = Math.round(h * .15 * sc2); ctx.font = '900 ' + fsz + 'px Arial Black, Arial'; const tw3 = ctx.measureText(I.name.toUpperCase()).width; if (tw3 > w * .92) { fsz = Math.floor(fsz * w * .92 / tw3); ctx.font = '900 ' + fsz + 'px Arial Black, Arial'; }
          const gr = ctx.createLinearGradient(0, h * .3, 0, h * .5); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, hx); ctx.shadowColor = hx; ctx.shadowBlur = h * .05; ctx.lineWidth = h * .014; ctx.strokeStyle = '#1a0010'; ctx.strokeText(I.name.toUpperCase(), w / 2, h * .46); ctx.fillStyle = gr; ctx.fillText(I.name.toUpperCase(), w / 2, h * .46); ctx.shadowBlur = 0;
          ctx.font = 'bold ' + Math.round(h * .04) + 'px Arial'; ctx.fillStyle = '#ffd54f'; if (t > .8) ctx.fillText('\u2605  EXPLOX TV ORIGINAL SERIES  \u2605', w / 2, h * .3);
          if (t > 2) { ctx.globalAlpha = fade * Math.min(1, (t - 2) / .6); ctx.font = '900 ' + Math.round(h * .05) + 'px Arial Black, Arial'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = h * .01; const et = (I.label || ('EPISODE ' + I.ep)) + ': ' + I.epTitle.toUpperCase(); ctx.strokeText(et, w / 2, h * .56); ctx.fillText(et, w / 2, h * .56); }
          (I.cast || []).forEach((cr, qi) => { const t0 = 3.8 + qi * .9; if (t > t0) { ctx.globalAlpha = fade * Math.min(1, (t - t0) / .4); ctx.textAlign = 'left'; ctx.font = '900 ' + Math.round(h * .04) + 'px Arial Black, Arial'; ctx.fillStyle = ['#ffd54f', '#ff8a80', '#80d8ff'][qi]; ctx.strokeStyle = '#000'; ctx.lineWidth = h * .008; const x0 = w * .06 + (1 - Math.min(1, (t - t0) / .4)) * -w * .1; ctx.strokeText(cr, x0, h * (.68 + qi * .06)); ctx.fillText(cr, x0, h * (.68 + qi * .06)); } });
          ctx.restore();
        }
      if (battleHud) {   // how many fighters are left on each side
        const bh = battleHud, fs6 = Math.max(13, Math.round(h * .042)), by = h * .07; ctx.save(); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
        ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(w * .12, by, w * .76, fs6 * 2.3); ctx.font = '900 ' + fs6 + 'px Arial Black, Arial'; ctx.fillStyle = '#fff';
        if (bh.royale) { ctx.fillText('BATTLE ROYALE  \u2022  ' + bh.left1 + ' of ' + bh.n1 + ' fighters left', w / 2, by + fs6 * 1.5); }
        else { ctx.fillStyle = '#' + ('000000' + ((bh.col1 || 0xe53935).toString(16))).slice(-6); ctx.fillRect(w * .12, by, fs6 * .5, fs6 * 2.3); ctx.fillStyle = '#' + ('000000' + ((bh.col2 || 0x1e88e5).toString(16))).slice(-6); ctx.fillRect(w * .88 - fs6 * .5, by, fs6 * .5, fs6 * 2.3); ctx.fillStyle = '#fff'; ctx.fillText(String(bh.a).toUpperCase() + '  ' + bh.left1 + '   vs   ' + bh.left2 + '  ' + String(bh.b).toUpperCase(), w / 2, by + fs6 * 1.5); }
        ctx.font = 'bold ' + Math.round(fs6 * .6) + 'px Arial'; ctx.fillStyle = '#ffd54f'; ctx.fillText(String(bh.weapon || '').toUpperCase(), w / 2, by + fs6 * 2.9);
        if (bh.finished) { const winner = bh.royale ? 'LAST FIGHTER STANDING!' : (bh.left1 > bh.left2 ? String(bh.a).toUpperCase() : bh.left2 > bh.left1 ? String(bh.b).toUpperCase() : 'IT IS A DRAW') + (bh.left1 === bh.left2 ? '!' : ' WIN!'); ctx.font = '900 ' + Math.round(fs6 * 1.5) + 'px Arial Black, Arial'; ctx.lineWidth = fs6 * .25; ctx.strokeStyle = '#220022'; ctx.fillStyle = '#ffee33'; ctx.strokeText(winner, w / 2, h * .5); ctx.fillText(winner, w / 2, h * .5); }
        ctx.restore();
      }
      if (soccerHud) {   // the scoreboard
        const sh2 = soccerHud, fs5 = Math.max(13, Math.round(h * .034)), bwid = w * .66, bx = w / 2 - bwid / 2, by = h * .06;
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.78)'; ctx.fillRect(bx, by, bwid, fs5 * 1.9); ctx.fillStyle = '#e53935'; ctx.fillRect(bx, by, fs5 * .5, fs5 * 1.9); ctx.fillStyle = '#' + ('000000' + (sh2.col || 0x1e88e5).toString(16)).slice(-6); ctx.fillRect(bx + bwid - fs5 * .5, by, fs5 * .5, fs5 * 1.9);
        ctx.font = '900 ' + fs5 + 'px Arial Black, Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('EXPLOX  ' + sh2.sa + ' : ' + sh2.sb + '  ' + String(sh2.a).toUpperCase(), w / 2, by + fs5 * 1.3);
        ctx.font = 'bold ' + Math.round(fs5 * .7) + 'px Arial'; ctx.fillStyle = '#ffd54f'; ctx.fillText(sh2.min + "'", bx + fs5 * 2.2, by + fs5 * 1.25); ctx.restore();
      }
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
  function narratorPersona(mi, mv) { if (mv && mv.narrator) return mv.narrator; const g = (mv && mv.genre) || ''; for (const [re, names] of NARRATORS) if (re.test(g)) return names[mi % names.length]; return 'The Explox Storyteller'; }

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
    const roles = castRoles(mi, mv), nameOf = { A: roles[0].role, B: roles[1].role, C: roles[2].role, N: (mv.tv ? '' : 'NARRATOR \u2022 ') + narratorPersona(mi, mv) };
    let tcur = mv.seamless ? 0.3 : 0.4 + wc(sc.text) / 2.6 + 0.9 + (si === 0 && !mv.tv ? (wc(mv.title) + 17) / 2.6 + 1.0 : 0);
    const base = scriptLines(mi, si, mv, sc), lines = base.map(l => { const o = { who: l[0], emo: l[1], act: l[2], text: l[3], role: nameOf[l[0]], pers: l[0] === 'N' ? null : persFor(mi, mv, 'ABC'.indexOf(l[0])), start: tcur }; o.end = o.start + wc(o.text) / 2.4 + 0.5; tcur = o.end + (({ sad: 3.0, relieved: 2.6, warm: 2.4, scared: 2.2, shocked: 2.4, joy: 2.0, worried: 2.2 })[o.emo] || 1.5); res.push(o); return o; });
    for (let i = 0; i < lines.length; i += 2) {
      const grp = lines.slice(i, i + 2), first = grp[0], who = {};
      grp.forEach(l => { if (l.who !== 'N') who[l.who] = l; });
      const present = ['A', 'B'].concat(who.C ? ['C'] : []);
      const emo = present.map(w => { if (who[w]) return who[w].emo; const sp = grp.find(l => l.who !== 'N' && l.who !== w); return sp ? listenerEmo(sp.emo) : 'neutral'; });
      { const a0s = first.act || 'talk', grpTxt = grp.map(l => l.text).join(' '); res.beats.push({ style: ((a0s === 'talk' || a0s === 'look' || a0s === 'walk') && !grp.some(l => ['sad', 'warm', 'scared', 'relieved', 'shocked'].indexOf(l.emo) >= 0)) ? (chatActivity(mi, si, i, { dark: sc.script.tod === 'night' || sc.script.tod === 'storm', comedy: !!mv.comedy }, grpTxt + ' ' + (sc.text || '')) || a0s) : a0s, present, emo }); }
      res.beatStarts.push(i === 0 ? 0 : Math.max(0.5, first.start - 0.6));
    }
    for (let k = 0; k < res.beatStarts.length; k++) res.beatEnds.push(k + 1 < res.beatStarts.length ? res.beatStarts[k + 1] : 0);
    res.total = Math.max(mv.tv ? 6 : 60, tcur + 0.8); res.beatEnds[res.beatEnds.length - 1] = res.total;
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
  const STYLE_MOOD = { fight: 'fight', run: 'chase', sneak: 'sneak', panic: 'scared', party: 'party', dance: 'party', highfive: 'joy', sing: 'happy', drum: 'excited', magic: 'magic', fly: 'adventure', climb: 'determined', exercise: 'determined', build: 'determined', skate: 'excited', jump: 'excited', play: 'happy', eat: 'happy', cook: 'happy', camp: 'warm', fish: 'relieved', write: 'curious', shop: 'curious', dig: 'curious', photo: 'happy', snowball: 'joy', juggle: 'joy', bubbles: 'joy', tugwar: 'determined', drive: 'adventure', spinning: 'joy', desk: 'serious', soccer: 'excited', battle: 'fight' };
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
      const mv = CINEMA_MOVIES[mi] || CINEMA_MOVIES[0], synth = window.speechSynthesis; clearSpeechTimers(); synth.cancel(); if (cinemaState.sceneIndex === 0 && !mv.tv) text = 'Hello. I am ' + narratorPersona(mi, mv) + '. Tonight, ' + mv.title + '. Meet ' + introCast(mi, mv) + '. ' + text;
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
    lines.push(['head', 'DIRECTED BY']); lines.push(['actor', 'Explox Cinemas']); lines.push(['gap', '']);
    [['PRODUCED BY', 'The Explox Movie Club'], ['MUSIC', 'The Explox Studio Orchestra'], ['SOUND EFFECTS', 'The Boing and Splash Department'], ['STUNTS', 'The Brave Explox Stunt Team'], ['SPECIAL EFFECTS', 'Sparkles, Dust and Confetti Inc.'], ['CAMERA AND LIGHTING', 'The Sunny Side Crew'], ['CATERING', 'Pizza Palace, always on time']].forEach(r => { lines.push(['head', r[0]]); lines.push(['actor', r[1]]); lines.push(['gap', '']); });
    lines.push(['small', 'NO ROBOTS WERE HARMED IN THE MAKING OF THIS MOVIE']); lines.push(['gap', '']); lines.push(['gap', '']);
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
      const m = CINEMA_MOVIES[i]; if (!m) return; card.style.display = (m.tv || !re.test(m.genre)) ? 'none' : '';
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
  window.__cinema3d = { wire: function (mi) { const mv = CINEMA_MOVIES[mi]; (mv.scenes || []).forEach((sc, si) => { if (sc.draw3dWired) return; sc.draw3dWired = true; const d2 = sc.draw; sc.draw2d = d2; sc.draw = function (ctx, w, h, t) { if (!draw3D(mi, si, mv, sc, ctx, w, h, t)) d2.call(sc, ctx, w, h, t); }; try { sc.dur = getDialogue(mi, si, mv, sc).total; } catch (e) { sc.dur = Math.max(sc.dur || 5, 12); } }); }, reset: function (mi) { const pre = mi + '_'; [sceneInfoCache, dlgCache].forEach(o => Object.keys(o).forEach(k => { if (k.indexOf(pre) === 0) delete o[k]; })); delete castCache[mi]; delete usedLines[mi]; Object.keys(people).forEach(k => { if (k === 'm' + mi + 'A' || k === 'm' + mi + 'B' || k === 'm' + mi + 'C') { try { SC.remove(people[k].g); } catch (e) { } delete people[k]; } }); Object.keys(fightT0).forEach(k => { if (k.indexOf(pre) === 0) delete fightT0[k]; }); }, sfx: CSFX, mood: moodAt, draw: draw3D, tagsFor, info: getInfo, castList, drawCredits, dialogue: getDialogue, status: () => ({ failed, hasRenderer: !!R }) };
})();
