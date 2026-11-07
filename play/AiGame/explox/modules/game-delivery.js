// ─── E.D – EXPLOX DELIVERY ─────────────────────────────────────────────────────────────────
// Order almost anything from anywhere in the world with S.I.P. Things from Explox arrive in up to 1 minute,
// things from far away countries take up to 5 minutes. Orders keep travelling even if you close the window.
// Family-safe: a kid-friendly catalog, and typed-in orders are checked against a block list.
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const user = () => (typeof currentUser !== 'undefined' && currentUser) ? String(currentUser) : 'guest';
  const KEY = () => 'explox_ed_' + user();
  const sip = () => (typeof sipDollars !== 'undefined' ? sipDollars : 0);
  const note = (m) => { try { showNotif(m); } catch (e) { } };
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hs = (a) => { let h = 2166136261; const s = String(a); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const MIN1 = 60000;

  // [name, emoji, price, country]  country 'Explox' = local (up to 1 minute); everything else = up to 5 minutes
  const CAT = [
    ['Explox Pizza Slice', '🍕', 20, 'Explox'], ['Explox Lemonade', '🍋', 10, 'Explox'], ['Explox Balloon', '🎈', 8, 'Explox'], ['Explox Sticker Pack', '⭐', 12, 'Explox'], ['Cozy Blanket', '🛏️', 40, 'Explox'], ['Pet Treats', '🦴', 15, 'Explox'], ['Skateboard', '🛹', 90, 'Explox'], ['Soccer Ball', '⚽', 35, 'Explox'], ['Birthday Cake', '🎂', 50, 'Explox'], ['Flower Bouquet', '💐', 30, 'Explox'],
    ['French Croissant', '🥐', 25, 'France'], ['Mini Eiffel Tower', '🗼', 70, 'France'], ['Artist Beret', '🎨', 45, 'France'],
    ['Sushi Roll Box', '🍣', 45, 'Japan'], ['Origami Paper Set', '📄', 18, 'Japan'], ['Lucky Cat Figure', '🐱', 55, 'Japan'], ['Ramen Bowl', '🍜', 30, 'Japan'],
    ['Italian Pasta Box', '🍝', 28, 'Italy'], ['Gelato Cup', '🍨', 22, 'Italy'], ['Pizza Oven Toy', '🍕', 60, 'Italy'],
    ['Mexican Taco Kit', '🌮', 30, 'Mexico'], ['Colorful Sombrero', '👒', 40, 'Mexico'], ['Maracas', '🪇', 25, 'Mexico'],
    ['Brazilian Soccer Jersey', '👕', 65, 'Brazil'], ['Samba Drum', '🥁', 55, 'Brazil'], ['Tropical Fruit Basket', '🍍', 35, 'Brazil'],
    ['Kangaroo Plush', '🦘', 40, 'Australia'], ['Boomerang Toy', '🪃', 30, 'Australia'], ['Koala Plush', '🐨', 40, 'Australia'],
    ['Egyptian Pyramid Puzzle', '🔺', 50, 'Egypt'], ['Golden Cat Statue', '🐈', 80, 'Egypt'],
    ['Indian Spice Box', '🌶️', 28, 'India'], ['Elephant Figure', '🐘', 45, 'India'], ['Colorful Kite', '🪁', 22, 'India'],
    ['Panda Plush', '🐼', 45, 'China'], ['Paper Lantern', '🏮', 25, 'China'], ['Dragon Kite', '🐉', 60, 'China'],
    ['Swiss Chocolate Bar', '🍫', 24, 'Switzerland'], ['Cuckoo Clock', '🕰️', 85, 'Switzerland'],
    ['Viking Helmet Toy', '⛑️', 50, 'Norway'], ['Warm Wool Mittens', '🧤', 30, 'Norway'],
    ['Canadian Maple Syrup', '🍁', 26, 'Canada'], ['Moose Plush', '🫎', 42, 'Canada'],
    ['Greek Olive Snack Box', '🫒', 24, 'Greece'], ['Toy Trireme Boat', '⛵', 55, 'Greece'],
    ['Safari Binoculars', '🔭', 65, 'Kenya'], ['Giraffe Plush', '🦒', 45, 'Kenya'], ['Wooden Drum', '🪘', 38, 'Ghana'],
    ['Penguin Plush', '🐧', 40, 'Antarctica'], ['Snow Globe', '🔮', 35, 'Antarctica'],
    ['Reindeer Plush', '🦌', 42, 'Finland'], ['Windmill Model', '🌬️', 48, 'Netherlands'], ['Tulip Bulbs', '🌷', 20, 'Netherlands'],
    ['Big Ben Clock Toy', '🕐', 52, 'United Kingdom'], ['Tea Party Set', '🫖', 38, 'United Kingdom'],
    ['Hawaiian Flower Necklace', '🌺', 25, 'Hawaii'], ['Ukulele', '🎸', 70, 'Hawaii'],
    ['Space Rocket Model', '🚀', 95, 'Moon'], ['Moon Rock Replica', '🌕', 120, 'Moon'], ['Alien Plush', '👽', 60, 'Mars'],
    ['Super Fast Race Car', '🏎️', 150, 'Germany'], ['Pretzel Box', '🥨', 20, 'Germany'], ['Telescope', '🔭', 110, 'Chile'], ['Rainbow Umbrella', '🌈', 28, 'Ireland'],
  ];
  const COUNTRIES = ['France', 'Japan', 'Italy', 'Mexico', 'Brazil', 'Australia', 'Egypt', 'India', 'China', 'Switzerland', 'Norway', 'Canada', 'Greece', 'Kenya', 'Ghana', 'Antarctica', 'Finland', 'Netherlands', 'United Kingdom', 'Hawaii', 'Moon', 'Mars', 'Germany', 'Chile', 'Ireland', 'Peru', 'Iceland', 'Thailand', 'Spain', 'New Zealand'];
  const EMO = [[/pizza/, '🍕'], [/cake/, '🎂'], [/ice ?cream|gelato/, '🍨'], [/dog|puppy/, '🐶'], [/cat|kitten/, '🐱'], [/bike|bicycle/, '🚲'], [/car\b/, '🚗'], [/book/, '📚'], [/ball/, '⚽'], [/robot/, '🤖'], [/dino/, '🦖'], [/rocket|space/, '🚀'], [/guitar/, '🎸'], [/piano/, '🎹'], [/drum/, '🥁'], [/pen|pencil/, '✏️'], [/hat/, '🎩'], [/shoe|boot|sneaker/, '👟'], [/plush|teddy|bear/, '🧸'], [/cookie/, '🍪'], [/apple/, '🍎'], [/banana/, '🍌'], [/burger/, '🍔'], [/kite/, '🪁'], [/lego|block|brick/, '🧱'], [/game/, '🎮'], [/fish/, '🐟'], [/flower|rose/, '🌹'], [/tree|plant/, '🌳'], [/boat|ship/, '⛵'], [/train/, '🚂'], [/plane|airplane/, '✈️']];
  // things we never deliver (real-world weapons, drugs, alcohol, grown-up stuff, gambling, people, personal info)
  const BLOCK = /(\bgun|rifle|pistol|firearm|ammo|bullet|grenade|explosive|\bknife|\bsword\b|weapon|drug|\bweed\b|cocaine|marijuana|alcohol|\bbeer\b|\bwine\b|vodka|whisk|liquor|cigar|tobacco|vape|\bsex|porn|nude|naked|\bbra\b|lingerie|casino|gambl|lottery|poker|\bbet\b|\bkill|blood|murder|suicide|\bhate|\bnazi|terror|\bperson\b|\bhuman\b|\bpeople\b|\bkid\b|\bchild|\bgirlfriend|\bboyfriend|passport|password|credit ?card|phone number|address)/i;
  const BAD_PERSONAL = /(@|\d{5,})/;

  function load() { try { const v = JSON.parse(localStorage.getItem(KEY()) || 'null'); if (v && Array.isArray(v.orders)) return v; } catch (e) { } return { orders: [], done: [], boxes: [] }; }
  function save(d) { try { localStorage.setItem(KEY(), JSON.stringify(d)); } catch (e) { } }
  const slug = (s) => 'ed_' + String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
  const emojiFor = (name) => { const l = name.toLowerCase(); for (const [r, e] of EMO) if (r.test(l)) return e; return '📦'; };
  const titleCase = (s) => s.trim().replace(/\s+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  // delivery time: Explox = 15–60 seconds, the rest of the world = 1–5 minutes, farther = longer
  function travelMs(country, name) {
    const r = (hs(name + '|' + country + '|' + Date.now()) % 1000) / 1000;
    if (country === 'Explox') return Math.round((0.25 + 0.75 * r) * MIN1);
    const far = FAR[country];
    const base = far === undefined ? .45 : far;
    return Math.round((1 + 4 * Math.min(1, base * .75 + r * .25)) * MIN1);
  }
  // shipping fee: 5 S.I.P. for every 100 metres (distances are Explox-map metres, so the world fits in a game)
  const FAR = { Moon: 1, Mars: 1, Antarctica: .85, Australia: .8, 'New Zealand': .8, Japan: .7, China: .7, Chile: .7, Brazil: .65, Kenya: .6, Ghana: .6, India: .65 };
  const METRES = { Explox: 200, Moon: 2000, Mars: 2400, Antarctica: 1700, Australia: 1600, 'New Zealand': 1700, Japan: 1400, China: 1300, Chile: 1400, Brazil: 1300, Kenya: 1200, Ghana: 1100, India: 1200, Egypt: 900, Greece: 800, Hawaii: 1500, Mexico: 700, Canada: 600 };
  const metres = (country) => METRES[country] || (500 + (hs(country) % 5) * 100);
  const shipFee = (country) => Math.ceil(metres(country) / 100) * 5;
  function fmtT(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  function order(name, emoji, price, country) {
    const fee = shipFee(country), total = price + fee;
    if (sip() < total) { note('❌ You need ' + total + ' S.I.P. (' + price + ' + ' + fee + ' shipping) for that.'); try { sfx.nope(); } catch (e) { } return false; }
    try { spendSip(total); updateSIP(); saveCurrentUser(); } catch (e) { return false; }
    const d = load(), t = travelMs(country, name), now = Date.now();
    d.orders.push({ id: slug(name), name: name, emoji: emoji, country: country, start: now, end: now + t, price: price, fee: fee });
    save(d); try { sfx.buy(); } catch (e) { }
    note('📦 E.D is bringing your ' + name + ' from ' + country + '! Paid ' + total + ' S.I.P. (shipping ' + fee + '). Arrives in ' + fmtT(t) + '.');
    render(); return true;
  }
  function deliverDue() {
    const d = load(), now = Date.now(); if (!d.orders.length) return;
    const keep = [];
    d.orders.forEach(o => {
      if (o.end <= now) {
        d.boxes = d.boxes || []; const pos = dropSpot();
        d.boxes.push({ bid: 'b' + now + '_' + d.boxes.length, id: o.id, name: o.name, emoji: o.emoji, country: o.country, at: now, x: pos.x, z: pos.z });
        note('📦 A box from ' + o.country + ' just arrived! Walk up to it and open it (press O).'); try { playTheme(true); } catch (e) { }
      } else keep.push(o);
    });
    if (keep.length !== d.orders.length) { d.orders = keep; save(d); if ($('edModal') && $('edModal').style.display === 'flex') render(); }
  }

  // ─── real boxes in the world ─────────────────────────────────────────────────────────
  function dropSpot() {
    try { const dir = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y = 0; if (dir.lengthSq() < .01) dir.set(0, 0, 1); dir.normalize(); const k = 4 + Math.random() * 1.5, side = (Math.random() - .5) * 2.5; return { x: playerGroup.position.x + dir.x * k - dir.z * side, z: playerGroup.position.z + dir.z * k + dir.x * side }; } catch (e) { return { x: 0, z: 0 }; }
  }
  const meshes = {};
  function makeBox() {
    const g = new THREE.Group(), card = new THREE.MeshLambertMaterial({ color: 0xc89358 }), tape = new THREE.MeshLambertMaterial({ color: 0xf3e2b3 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, .9, 1.3), card); body.position.y = .45; g.add(body);
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(.28, .02, 1.34), tape); t1.position.y = .91; g.add(t1);
    const t2 = new THREE.Mesh(new THREE.BoxGeometry(.3, .92, 1.34), tape); t2.position.y = .45; g.add(t2);
    const lbl = new THREE.Mesh(new THREE.PlaneGeometry(.5, .35), new THREE.MeshBasicMaterial({ color: 0xffffff })); lbl.position.set(.3, .5, .66); g.add(lbl);
    const flap = new THREE.Group(); flap.position.set(0, .9, -.65); const fl = new THREE.Mesh(new THREE.BoxGeometry(1.3, .03, .65), card); fl.position.z = .325; flap.add(fl); g.add(flap); g.userData.flap = flap;
    return g;
  }
  function syncMeshes() {
    if (typeof scene === 'undefined' || !scene || typeof THREE === 'undefined') return;
    const d = load(), ids = {};
    (d.boxes || []).forEach(b => { ids[b.bid] = 1; if (!meshes[b.bid]) { const m = makeBox(); let y = 0; try { y = groundHeightAt(b.x, b.z) || 0; } catch (e) { } m.position.set(b.x, y, b.z); m.rotation.y = (hs(b.bid) % 628) / 100; scene.add(m); meshes[b.bid] = m; } });
    Object.keys(meshes).forEach(k => { if (!ids[k]) { scene.remove(meshes[k]); delete meshes[k]; } });
  }
  function nearestBox() {
    if (typeof playerGroup === 'undefined' || !playerGroup) return null; const d = load(); let best = null, bd = 4.5;
    (d.boxes || []).forEach(b => { const q = Math.hypot(playerGroup.position.x - b.x, playerGroup.position.z - b.z); if (q < bd) { bd = q; best = b; } }); return best;
  }
  function openBox(bid) {
    const d = load(), i = (d.boxes || []).findIndex(b => b.bid === bid); if (i < 0) return; const b = d.boxes[i];
    const m = meshes[bid]; if (m && m.userData.flap) { let t = 0; const iv = setInterval(() => { t += .1; m.userData.flap.rotation.x = -Math.min(2.4, t * 3); if (t > 1) clearInterval(iv); }, 30); }
    try { addToInventory(b.id, b.name, b.emoji); addToInventory(BONUS.id, BONUS.name, BONUS.emoji); saveCurrentUser(); } catch (e) { return; }
    d.boxes.splice(i, 1); d.done.unshift({ name: b.name, emoji: b.emoji, country: b.country, at: Date.now() }); d.done = d.done.slice(0, 12); save(d);
    try { sfx.coin(); } catch (e) { }
    const pop = document.createElement('div'); pop.style.cssText = 'max-width:300px;position:fixed;left:50%;top:38%;transform:translate(-50%,-50%) scale(.3);z-index:2147483000;background:#1b1f33;color:#fff;border:3px solid #ff8f00;border-radius:18px;padding:18px 26px;text-align:center;font-family:Arial,sans-serif;transition:transform .45s cubic-bezier(.2,1.6,.4,1);pointer-events:none';
    pop.innerHTML = '<div style="font-size:20px;font-weight:bold">You opened the box!</div><div style="font-size:12px;color:#ffcc80;margin-bottom:6px">Inside the box:</div><div style="font-size:64px">' + b.emoji + '</div><div style="font-size:16px">' + esc(b.name) + '</div><div style="margin-top:6px;font-size:14px">+ ' + BONUS.emoji + ' a free ' + BONUS.name + '</div><div style="margin-top:6px;font-size:11px;color:#ffcc80">📝 Note: "Thanks for ordering from E.D! Use your stuff in the 🎒 My Stuff tab."</div><div style="font-size:11px;color:#aaa">from ' + esc(b.country) + '</div>';
    document.body.appendChild(pop); requestAnimationFrame(() => { pop.style.transform = 'translate(-50%,-50%) scale(1)'; });
    setTimeout(() => { pop.style.transition = 'opacity .5s'; pop.style.opacity = '0'; setTimeout(() => pop.remove(), 600); }, 4200);
    setTimeout(() => syncMeshes(), 1200); if ($('edModal') && $('edModal').style.display === 'flex') render();
  }
  function promptBox() {
    let p = $('edPrompt'); if (!p) { p = document.createElement('div'); p.id = 'edPrompt'; p.style.cssText = 'position:fixed;left:50%;bottom:22%;transform:translateX(-50%);z-index:1600;background:#ff8f00;color:#fff;border:2px solid #fff;border-radius:20px;padding:9px 18px;font:bold 15px Arial;cursor:pointer;display:none;box-shadow:0 2px 10px #0008'; p.onclick = () => { const b = nearestBox(); if (b) openBox(b.bid); }; document.body.appendChild(p); }
    const b = nearestBox(); if (b) { p.textContent = '📦 Open the box from ' + b.country + ' (press O or tap)'; p.style.display = 'block'; } else p.style.display = 'none';
  }
  document.addEventListener('keydown', (e) => { if ((e.key === 'o' || e.key === 'O') && !/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '') && !e.ctrlKey && !e.metaKey) { const b = nearestBox(); if (b) { e.preventDefault(); openBox(b.bid); } } });
  setInterval(() => { try { syncMeshes(); promptBox(); } catch (e) { } }, 400);

  // ─── intro + theme song (made with Web Audio, no files) ───────────────────────────────
  let AC = null, themeStop = null;
  function ac() { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { AC = null; } return AC; }
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const hz = (n, oct) => 440 * Math.pow(2, (NOTE[n] + (oct - 4) * 12 - 9) / 12);
  function tone(c, t, f, d, type, vol, out) {
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + d + .05);
  }
  function hat(c, t, out) {
    const len = c.sampleRate * .05, buf = c.createBuffer(1, len, c.sampleRate), dd = buf.getChannelData(0); for (let i = 0; i < len; i++) dd[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = .12; src.buffer = buf; src.connect(f); f.connect(g); g.connect(out); src.start(t);
  }
  // the E.D theme: a bouncy 8-bar tune, 120 bpm. Returns the length in seconds.
  const TUNE = [['E', 5, 1], ['E', 5, 1], ['G', 5, 2], ['E', 5, 1], ['E', 5, 1], ['C', 5, 2], ['D', 5, 1], ['E', 5, 1], ['F', 5, 1], ['E', 5, 1], ['D', 5, 4],
    ['E', 5, 1], ['E', 5, 1], ['G', 5, 2], ['A', 5, 1], ['G', 5, 1], ['E', 5, 2], ['D', 5, 1], ['E', 5, 1], ['D', 5, 1], ['C', 5, 1], ['C', 5, 4]];
  const BASS = ['C', 'C', 'F', 'G', 'C', 'C', 'F', 'G'];
  function playTheme(short) {
    const c = ac(); if (!c) return 0; const out = c.createGain(); out.gain.value = .5; out.connect(c.destination);
    const beat = .25, t0 = c.currentTime + .1; let t = t0;
    const notes = short ? [['E', 5, 1], ['G', 5, 1], ['C', 6, 2]] : TUNE;
    notes.forEach(n => { const d = n[2] * beat; tone(c, t, hz(n[0], n[1]), d * .9, 'square', .09, out); tone(c, t, hz(n[0], n[1] - 1), d * .9, 'triangle', .1, out); t += d; });
    const total = t - t0;
    if (!short) { for (let i = 0; i < total / (beat * 2); i++) { const bt = t0 + i * beat * 2, nm = BASS[Math.floor(i / 2) % BASS.length]; tone(c, bt, hz(nm, 2), beat * 1.6, 'sawtooth', .07, out); hat(c, bt, out); hat(c, bt + beat, out); } }
    const stop = () => { try { out.gain.setTargetAtTime(0, c.currentTime, .05); } catch (e) { } };
    themeStop = stop; return total;
  }
  const LYRICS = [[0, 'E-D! E-D!'], [1.4, 'Explox Delivery!'], [3.3, 'Anything, anywhere,'], [5.2, 'right to your door!'], [7.2, 'A box for you, a box for me,'], [9.5, 'E-D! E-D!'], [11, 'Hooray! \u{1F389}']];
  let introOn = false;
  function intro(done) {
    if (introOn) return; introOn = true; css();
    const ov = document.createElement('div'); ov.id = 'edIntro'; ov.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:linear-gradient(#0d1b3d,#ff8f00);overflow:hidden;font-family:Arial,sans-serif;color:#fff;text-align:center;cursor:pointer';
    ov.innerHTML = '<style>@keyframes edDrive{from{left:-25%}to{left:110%}}@keyframes edPop{0%{transform:scale(.2);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}@keyframes edBob{50%{transform:translateY(-8px)}}</style>' +
      '<div style="position:absolute;top:10%;left:0;right:0;font-size:min(14vw,90px);font-weight:900;letter-spacing:4px;text-shadow:0 4px 0 #b45309;animation:edPop .8s both">E.D</div>' +
      '<div style="position:absolute;top:30%;left:0;right:0;font-size:min(6vw,34px);font-weight:bold;animation:edPop .8s .5s both">EXPLOX DELIVERY</div>' +
      '<div style="position:absolute;bottom:26%;left:0;right:0;height:6px;background:#333"></div>' +
      '<div style="position:absolute;bottom:26%;font-size:min(16vw,100px);animation:edDrive 6s linear infinite"><span style="display:inline-block;animation:edBob .4s infinite">\u{1F69A}</span></div>' +
      '<div style="position:absolute;bottom:34%;left:0;right:0;font-size:min(10vw,64px);opacity:.9">\u{1F4E6} \u{1F381} \u{1F30D} \u2708\uFE0F</div>' +
      '<div id="edLyric" style="position:absolute;bottom:10%;left:0;right:0;font-size:min(6vw,32px);font-weight:bold;text-shadow:0 2px 6px #000"></div>' +
      '<div style="position:absolute;bottom:2%;left:0;right:0;font-size:12px;opacity:.7">tap to skip</div>';
    document.body.appendChild(ov);
    const len = playTheme(false), timers = [];
    LYRICS.forEach(l => timers.push(setTimeout(() => { const e = $('edLyric'); if (e) { e.textContent = l[1]; e.style.animation = 'none'; void e.offsetWidth; e.style.animation = 'edPop .4s both'; } }, l[0] * 1000)));
    const finish = () => { timers.forEach(clearTimeout); if (themeStop) themeStop(); ov.remove(); introOn = false; if (done) done(); };
    timers.push(setTimeout(finish, Math.max(7000, (len || 7) * 1000 + 600)));
    ov.onclick = finish;
  }
  let introSeen = false;

  // ─── real stuff: what is inside the box can really be used ──────────────────────────
  const FOOD_EMO = '🍕🍰🍪🍎🍌🍔🍨🥐🍣🍜🍝🌮🍍🍫🍁🫒🥨🍋🎂🍭🍟🌭🥞';
  function kindOf(name, emoji) {
    const l = String(name).toLowerCase();
    if (/plush|teddy|bear\b|doll/.test(l)) return 'plush';
    if (/drum|guitar|ukulele|maracas|trumpet|piano|samba|violin|flute|xylophone/.test(l)) return 'music';
    if (/pizza|croissant|sushi|ramen|pasta|gelato|taco|fruit|spice|chocolate|syrup|olive|pretzel|snack|lemonade|cake|cookie|pie\b|bread|burger|sandwich|candy|juice|soup|noodle|apple|banana|ice cream/.test(l) || String(FOOD_EMO).indexOf(emoji) >= 0 && emoji) return 'food';
    return 'thing';
  }
  function takeOne(id) { const it = playerInventory[id]; if (!it) return false; it.qty--; if (it.qty <= 0) delete playerInventory[id]; try { saveCurrentUser(); } catch (e) { } return true; }
  function floatEmoji(emoji, text) {
    const pop = document.createElement('div'); pop.style.cssText = 'position:fixed;left:50%;top:45%;transform:translate(-50%,-50%);z-index:2147483000;text-align:center;font-family:Arial,sans-serif;color:#fff;text-shadow:0 2px 6px #000;pointer-events:none;transition:all 1.6s ease-out';
    pop.innerHTML = '<div style="font-size:72px">' + emoji + '</div><div style="font-size:20px;font-weight:bold">' + esc(text) + '</div>'; document.body.appendChild(pop);
    requestAnimationFrame(() => { pop.style.top = '25%'; pop.style.opacity = '0'; }); setTimeout(() => pop.remove(), 1800);
  }
  function showInWorld(emoji) {
    try {
      if (typeof scene === 'undefined' || !scene || typeof THREE === 'undefined') return;
      const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'); x.font = '96px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(emoji, 64, 70);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true })); sp.scale.set(1.6, 1.6, 1);
      const dir = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y = 0; dir.normalize(); const bx = playerGroup.position.x + dir.x * 2.6, bz = playerGroup.position.z + dir.z * 2.6, t0 = performance.now();
      scene.add(sp); const iv = setInterval(() => { const t = (performance.now() - t0) / 1000; sp.position.set(bx, 1.9 + Math.sin(t * 3) * .15, bz); sp.material.rotation = Math.sin(t * 2) * .15; if (t > 8) { clearInterval(iv); scene.remove(sp); } }, 40);
    } catch (e) { }
  }
  function playMusic() {
    const c = ac(); if (!c) return; const out = c.createGain(); out.gain.value = .5; out.connect(c.destination); let t = c.currentTime + .05;
    [['C', 5, 1], ['E', 5, 1], ['G', 5, 1], ['E', 5, 1], ['A', 5, 2], ['G', 5, 2], ['E', 5, 1], ['D', 5, 1], ['C', 5, 4]].forEach(n => { const d = n[2] * .2; tone(c, t, hz(n[0], n[1]), d * .9, 'triangle', .14, out); t += d; });
  }
  function useItem(id, how) {
    const it = playerInventory[id]; if (!it) return; const k = it.food ? 'food' : kindOf(it.name, it.emoji);
    if (how === 'eat' && k === 'food') {
      if (!takeOne(id)) return; try { restoreHunger(35); } catch (e) { } try { playerHealth = Math.min(playerMaxHealth, playerHealth + 10); updateHealthBar(); } catch (e) { }
      floatEmoji(it.emoji, 'Yum! ' + it.name + ' tastes great! +hunger +health'); try { sfx.coin(); } catch (e) { }
    } else if (how === 'hug' && k === 'plush') {
      try { playerHealth = Math.min(playerMaxHealth, playerHealth + 5); updateHealthBar(); } catch (e) { } floatEmoji('💖', 'You hug your ' + it.name + '. So soft!'); showInWorld(it.emoji);
    } else if (how === 'play' && k === 'music') {
      playMusic(); floatEmoji('🎶', 'You play the ' + it.name + '!'); showInWorld(it.emoji);
    } else if (how === 'show') {
      showInWorld(it.emoji); floatEmoji(it.emoji, 'You hold up your ' + it.name + '!');
    }
    if ($('edModal') && $('edModal').style.display === 'flex') render();
  }
  const BONUS = { id: 'ed_free_cookie', name: 'E.D Cookie', emoji: '🍪' };

  // ─── window ──────────────────────────────────────────────────────────────────────────
  let tab = 'shop';
  function css() {
    if ($('edStyle')) return; const st = document.createElement('style'); st.id = 'edStyle';
    st.textContent = '#edBtn{position:fixed;left:14px;bottom:78px;z-index:1500;background:#ff8f00;color:#fff;border:2px solid #fff;border-radius:22px;padding:7px 12px;font:bold 13px Arial;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4);display:none}#edBtn small{background:#e94560;border-radius:9px;padding:0 6px;margin-left:5px}' +
      '#edModal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:2003;align-items:center;justify-content:center;font-family:Arial,sans-serif}#edBox{background:#1b1f33;color:#fff;border:3px solid #ff8f00;border-radius:16px;width:min(720px,94vw);max-height:90vh;overflow:auto;padding:16px}' +
      '.edTabs button,.edB{border:0;border-radius:8px;padding:7px 12px;font:bold 12px Arial;cursor:pointer;color:#fff;background:#243557;margin:2px}.edGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-top:8px}' +
      '.edCard{background:#262c47;border-radius:10px;padding:8px;text-align:center;font-size:12px}.edCard .e{font-size:30px}.edBar{height:10px;background:#0006;border-radius:6px;overflow:hidden;margin-top:4px}.edBar i{display:block;height:100%;background:linear-gradient(90deg,#ffb300,#7dff9a)}';
    document.head.appendChild(st);
  }
  function box() {
    css(); let m = $('edModal');
    if (!m) { m = document.createElement('div'); m.id = 'edModal'; m.innerHTML = '<div id="edBox"></div>'; m.addEventListener('mousedown', e => { if (e.target === m) close(); }); document.body.appendChild(m); }
    return m;
  }
  function open() { try { if (document.pointerLockElement) document.exitPointerLock(); isPointerLocked = false; } catch (e) { } const go = () => { box().style.display = 'flex'; render(); }; if (!introSeen) { introSeen = true; intro(go); } else go(); }
  function close() { const m = $('edModal'); if (m) m.style.display = 'none'; }
  function head() {
    const d = load();
    return '<div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:22px;font-weight:bold">📦 E.D – Explox Delivery</div><div style="font-size:12px;color:#ffcc80">Anything from the whole world! Shipping: 5 S.I.P. per 100 metres. Explox things arrive in up to 1 minute, far-away things in up to 5 minutes.</div></div><span><button class="edB" id="edTheme" style="background:#ff8f00">🎵 Theme</button><button class="edB" id="edX" style="background:#555">✖</button></span></div>' +
      '<div style="margin:6px 0">💰 You have <b style="color:#ffd54f">' + sip() + '</b> S.I.P.</div>' +
      '<div class="edTabs"><button data-t="shop" style="' + (tab === 'shop' ? 'background:#ff8f00' : '') + '">🛍️ Catalog</button><button data-t="any" style="' + (tab === 'any' ? 'background:#ff8f00' : '') + '">🌍 Order Anything</button><button data-t="stuff" style="' + (tab === 'stuff' ? 'background:#ff8f00' : '') + '">🎒 My Stuff</button><button data-t="boxes" style="' + (tab === 'boxes' ? 'background:#ff8f00' : '') + '">📦 Boxes (' + (d.boxes || []).length + ')</button><button data-t="track" style="' + (tab === 'track' ? 'background:#ff8f00' : '') + '">🚚 On the way (' + d.orders.length + ')</button></div>';
  }
  function render() {
    const m = $('edModal'); if (!m || m.style.display !== 'flex') return; const b = $('edBox'), d = load(); let h = head();
    if (tab === 'shop') {
      h += '<div class="edGrid">' + CAT.map((c, i) => '<div class="edCard"><div class="e">' + c[1] + '</div><b>' + esc(c[0]) + '</b><div style="color:#aaa">from ' + esc(c[3]) + '</div><div>' + (c[3] === 'Explox' ? '⚡ up to 1 min' : '✈️ up to 5 min') + '</div><div style="color:#ffcc80">🚚 ' + metres(c[3]) + ' m • shipping ' + shipFee(c[3]) + '</div><button class="edB" data-b="' + i + '" style="background:#2e7d32">Buy ' + (c[2] + shipFee(c[3])) + ' S.I.P.</button></div>').join('') + '</div>';
    } else if (tab === 'any') {
      h += '<div style="margin-top:10px;font-size:13px">Type anything you want from anywhere in the world (a toy, a snack, an animal plush, a game, a musical instrument...). E.D will find it!</div>' +
        '<div style="margin-top:8px"><input id="edName" maxlength="30" placeholder="What do you want? e.g. Giant Rubber Duck" style="width:62%;padding:8px;border-radius:8px;border:0;font-size:14px"> <select id="edFrom" style="padding:8px;border-radius:8px;border:0"><option value="">🌍 Anywhere</option>' + COUNTRIES.map(c => '<option>' + c + '</option>').join('') + '</select></div>' +
        '<div id="edMsg" style="margin:8px 0;color:#ffcc80;font-size:12px"></div><button class="edB" id="edFind" style="background:#ff8f00">🔎 Find it</button><div id="edFound"></div>';
    } else if (tab === 'stuff') {
      const mine = Object.keys(playerInventory).filter(id => /^(ed_|sm_)/.test(id) && playerInventory[id] && playerInventory[id].qty > 0);
      h += mine.length ? '<div style="margin-top:8px;font-size:12px;color:#ffcc80">Things from your E.D boxes. Eat the food, hug the plush, play the music!</div><div class="edGrid">' + mine.map(id => { const it = playerInventory[id], k = it.food ? 'food' : kindOf(it.name, it.emoji), act = k === 'food' ? ['eat', '🍴 Eat'] : k === 'plush' ? ['hug', '🤗 Hug'] : k === 'music' ? ['play', '🎵 Play'] : null;
        return '<div class="edCard"><div class="e">' + it.emoji + '</div><b>' + esc(it.name) + '</b><div style="color:#aaa">x' + it.qty + '</div>' + (act ? '<button class="edB" data-use="' + id + '|' + act[0] + '" style="background:#2e7d32">' + act[1] + '</button>' : '') + '<button class="edB" data-use="' + id + '|show">✨ Show</button></div>'; }).join('') + '</div>' : '<div style="margin-top:12px;color:#aaa">You have nothing from E.D yet. Order something!</div>';
    } else if (tab === 'boxes') {
      h += (d.boxes || []).length ? '<div style="margin-top:8px;font-size:12px;color:#ffcc80">Your boxes wait in the world where they arrived. Walk up to one and press O, or open it from here:</div>' + d.boxes.map(x => '<div class="edCard" style="margin-top:8px;text-align:left">📦 Box from <b>' + esc(x.country) + '</b> <button class="edB" data-open="' + x.bid + '" style="background:#2e7d32;float:right">Open</button></div>').join('') : '<div style="margin-top:12px;color:#aaa">No boxes waiting.</div>';
    } else {
      const now = Date.now();
      h += d.orders.length ? d.orders.map(o => '<div class="edCard" style="margin-top:8px;text-align:left"><b>' + o.emoji + ' ' + esc(o.name) + '</b> <span style="color:#aaa">from ' + esc(o.country) + '</span><div class="edBar"><i data-o="' + o.id + '|' + o.start + '" style="width:' + Math.min(100, (now - o.start) / (o.end - o.start) * 100) + '%"></i></div><div style="font-size:11px;color:#ffcc80" data-t2="' + o.end + '">' + (o.country === 'Explox' ? '🛵' : '✈️') + ' arrives in ' + fmtT(o.end - now) + '</div></div>').join('') : '<div style="margin-top:12px;color:#aaa">Nothing on the way. Order something!</div>';
      if (d.done.length) h += '<div style="margin-top:12px;font-size:12px;color:#7dff9a">✅ Delivered: ' + d.done.map(x => x.emoji + ' ' + esc(x.name)).join(', ') + '</div>';
    }
    b.innerHTML = h; $('edX').onclick = close; $('edTheme').onclick = () => { if (themeStop) themeStop(); b.parentNode.style.display = 'none'; intro(() => { b.parentNode.style.display = 'flex'; }); };
    Array.prototype.forEach.call(b.querySelectorAll('.edTabs button'), x => { x.onclick = () => { tab = x.getAttribute('data-t'); render(); }; });
    Array.prototype.forEach.call(b.querySelectorAll('[data-b]'), x => { x.onclick = () => { const c = CAT[+x.getAttribute('data-b')]; order(c[0], c[1], c[2], c[3]); }; });
    Array.prototype.forEach.call(b.querySelectorAll('[data-open]'), x => { x.onclick = () => openBox(x.getAttribute('data-open')); });
    Array.prototype.forEach.call(b.querySelectorAll('[data-use]'), x => { x.onclick = () => { const p = x.getAttribute('data-use').split('|'); useItem(p[0], p[1]); }; });
    if ($('edFind')) $('edFind').onclick = find;
    if ($('edName')) $('edName').onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') find(); };
  }
  function find() {
    const raw = ($('edName').value || '').trim(), msg = $('edMsg'), out = $('edFound');
    if (raw.length < 2) { msg.textContent = 'Type what you want first!'; return; }
    if (BLOCK.test(raw) || BAD_PERSONAL.test(raw)) { msg.textContent = '🚫 Sorry, E.D does not deliver that. Try something fun and safe!'; out.innerHTML = ''; return; }
    const name = titleCase(raw), from0 = $('edFrom').value, h = hs(name.toLowerCase());
    const from = from0 || COUNTRIES[h % COUNTRIES.length], price = 15 + (h % 180), em = emojiFor(name);
    msg.textContent = '';
    out.innerHTML = '<div class="edCard" style="margin-top:10px;text-align:left"><div style="font-size:34px">' + em + '</div><b>' + esc(name) + '</b><div style="color:#aaa">Found in ' + esc(from) + ' • ✈️ up to 5 min</div><div style="color:#ffcc80">Item ' + price + ' + 🚚 shipping ' + shipFee(from) + ' (' + metres(from) + ' m, 5 per 100 m)</div><button class="edB" id="edBuyAny" style="background:#2e7d32">Buy ' + (price + shipFee(from)) + ' S.I.P.</button></div>';
    $('edBuyAny').onclick = () => { if (order(name, em, price, from)) { tab = 'track'; render(); } };
  }

  // ─── BUY NOW from a TV commercial: a quick E.D checkout card ────────────────────────────
  function buyNow(prod) {
    try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) { }
    const old = $('edCheckout'); if (old) old.remove();
    const name = titleCase(String(prod.name).replace(/^a ticket to /i, 'Ticket to ')), price = Math.max(1, Math.round(prod.price || 10)), em = prod.emoji || '\uD83D\uDCE6', fee = shipFee('Explox');
    css(); const w = document.createElement('div'); w.id = 'edCheckout'; w.style.cssText = 'position:fixed;inset:0;z-index:2147483100;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif';
    w.innerHTML = '<div style="background:#1b1f33;color:#fff;border:3px solid #ff8f00;border-radius:16px;padding:18px 22px;width:min(380px,92vw);text-align:center"><div style="font-size:18px;font-weight:bold">\uD83D\uDCE6 E.D \u2013 Explox Delivery</div><div style="font-size:12px;color:#ffcc80">Seen on TV. Delivered to you in up to 1 minute!</div><div style="font-size:60px;margin:6px 0">' + em + '</div><div style="font-size:16px;font-weight:bold">' + esc(name) + '</div><div style="font-size:12px;color:#aaa">from ' + esc(prod.store || 'Explox') + '</div><div style="margin:8px 0;font-size:14px">Item ' + price + ' + \uD83D\uDE9A shipping ' + fee + ' = <b style="color:#ffd54f">' + (price + fee) + ' S.I.P.</b></div><div style="font-size:12px;margin-bottom:10px">\uD83D\uDCB0 You have ' + sip() + ' S.I.P.</div><button class="edB" id="edCoYes" style="background:#2e7d32;font-size:15px;padding:9px 18px">\u2705 Buy now</button> <button class="edB" id="edCoNo" style="background:#555;font-size:15px;padding:9px 18px">Not now</button></div>';
    document.body.appendChild(w);
    $('edCoNo').onclick = () => w.remove();
    $('edCoYes').onclick = () => { if (order(name, em, price, 'Explox')) { $('edCoYes').parentNode.innerHTML = '<div style="font-size:50px">\uD83D\uDE9A\uD83D\uDCE6</div><div style="font-size:16px;font-weight:bold;margin:6px 0">Ordered! E.D is on the way.</div><div style="font-size:12px;color:#ffcc80">A box will appear near you. Open it with O.</div><button class="edB" id="edCoOk" style="background:#ff8f00;margin-top:10px">OK</button>'; $('edCoOk').onclick = () => w.remove(); } else { w.remove(); } };
  }
  window.exploxBuyNow = buyNow;

  // ─── button + ticking ────────────────────────────────────────────────────────────────
  function tick() {
    try {
      const gameOn = typeof playerGroup !== 'undefined' && $('sipAmount');
      let btn = $('edBtn');
      if (!btn) { css(); btn = document.createElement('button'); btn.id = 'edBtn'; btn.textContent = '📦 E.D Delivery'; btn.onclick = open; document.body.appendChild(btn); }
      const modalOpen = [...document.querySelectorAll('[id$="Modal"]')].some(x => x !== $('edModal') && getComputedStyle(x).display !== 'none' && getComputedStyle(x).position === 'fixed');
      const dd = load(), n = gameOn ? dd.orders.length + (dd.boxes || []).length : 0;
      btn.style.display = (gameOn && !modalOpen) ? 'block' : 'none';
      btn.innerHTML = '📦 E.D Delivery' + (n ? '<small>' + n + '</small>' : '');
      deliverDue();
      const m = $('edModal');
      if (m && m.style.display === 'flex' && tab === 'track') {
        const now = Date.now();
        Array.prototype.forEach.call(m.querySelectorAll('[data-o]'), i => { const p = i.getAttribute('data-o').split('|'); const d = load().orders.find(o => o.id === p[0] && String(o.start) === p[1]); if (d) i.style.width = Math.min(100, (now - d.start) / (d.end - d.start) * 100) + '%'; });
        Array.prototype.forEach.call(m.querySelectorAll('[data-t2]'), i => { i.textContent = i.textContent.replace(/arrives in .*/, 'arrives in ' + fmtT(+i.getAttribute('data-t2') - now)); });
      }
    } catch (e) { }
  }
  setInterval(tick, 1000);
  window.openExploxDelivery = open;
  window.__exploxED = { open: open, catalog: CAT, load: load, order: order, deliverDue: deliverDue, useItem: useItem, kindOf: kindOf, intro: intro, theme: () => playTheme(false), openBox: openBox, nearestBox: nearestBox, blocked: (s) => BLOCK.test(s) || BAD_PERSONAL.test(s) };
})();
