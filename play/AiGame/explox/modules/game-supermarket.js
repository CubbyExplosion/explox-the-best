// ─── EXPLOX FRESH MARKET – a big, realistic supermarket you can walk into ─────────────────────
// A real building in the city (green awning, glass front, car park, big sign). Walk through the door and you are
// inside a full supermarket: tiled floor, ceiling lights, 6 shelf aisles with hundreds of real-looking products,
// a fridge wall, fresh produce tables, a bakery, a deli counter with a worker, shopping carts and baskets, two
// checkout lanes with a cashier, a PA system and shoppers walking around with their carts.
// Walk up to a product and press E to put it in your cart. Go to a checkout lane and press E to pay in S.I.P.
// The groceries go in your inventory (the food and drinks can be eaten from the E.D "My Stuff" tab).
(function () {
  'use strict';
  if (typeof populateShopInterior !== 'function' || typeof enterShopInterior !== 'function') return;
  const SMK = 'supermarket';
  const hs = (a) => { let h = 2166136261; const s = String(a); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sip = () => (typeof sipDollars !== 'undefined' ? sipDollars : 0);
  const note = (m) => { try { showNotif(m); } catch (e) { } };

  // [name, emoji, price, colour, shape, food]   shapes: box, can, bottle, bag, jar
  const P = (n, e, p, c, s, f) => ({ name: n, emoji: e, price: p, color: c, shape: s || 'box', food: f !== false });
  const SECTIONS = {
    breakfast: { sign: '\u{1F963} BREAKFAST', items: [P('Corn Flakes', '\u{1F963}', 6, 0xf4b400, 'box'), P('Chocolate Cereal', '\u{1F963}', 6, 0x6d4c41, 'box'), P('Oat Rings', '\u{1F963}', 5, 0xffb74d, 'box'), P('Peanut Butter', '\u{1F95C}', 5, 0xc68642, 'jar'), P('Strawberry Jam', '\u{1F353}', 4, 0xd32f2f, 'jar'), P('Pancake Mix', '\u{1F95E}', 4, 0xfff176, 'box'), P('Maple Syrup', '\u{1F341}', 6, 0x8d5524, 'bottle'), P('Sliced Bread', '\u{1F35E}', 3, 0xe0b97a, 'bag'), P('Honey', '\u{1F36F}', 5, 0xffc107, 'jar')] },
    canned: { sign: '\u{1F96B} PASTA & CANNED', items: [P('Tomato Soup', '\u{1F96B}', 2, 0xe53935, 'can'), P('Chicken Noodle Soup', '\u{1F96B}', 2, 0xffd54f, 'can'), P('Baked Beans', '\u{1F96B}', 2, 0xa1522a, 'can'), P('Sweet Corn', '\u{1F33D}', 2, 0xfdd835, 'can'), P('Tuna', '\u{1F41F}', 3, 0x4fc3f7, 'can'), P('Spaghetti', '\u{1F35D}', 3, 0xffe082, 'box'), P('Penne Pasta', '\u{1F35D}', 3, 0xffcc80, 'box'), P('Rice', '\u{1F35A}', 5, 0xeeeeee, 'bag'), P('Pasta Sauce', '\u{1F345}', 4, 0xc62828, 'jar')] },
    snacks: { sign: '\u{1F37F} SNACKS & SWEETS', items: [P('Potato Chips', '\u{1F35F}', 3, 0xffa000, 'bag'), P('Cheese Puffs', '\u{1F9C0}', 3, 0xff7043, 'bag'), P('Popcorn', '\u{1F37F}', 3, 0xfff59d, 'bag'), P('Chocolate Cookies', '\u{1F36A}', 4, 0x5d4037, 'box'), P('Crackers', '\u{1F958}', 3, 0xd7a86e, 'box'), P('Chocolate Bar', '\u{1F36B}', 2, 0x4e342e, 'box'), P('Gummy Bears', '\u{1F36C}', 2, 0xe91e63, 'bag'), P('Pretzels', '\u{1F968}', 3, 0xb87333, 'bag'), P('Granola Bars', '\u{1F36B}', 4, 0x8bc34a, 'box')] },
    drinks: { sign: '\u{1F964} DRINKS', items: [P('Spring Water', '\u{1F4A7}', 1, 0x81d4fa, 'bottle'), P('Orange Juice', '\u{1F9C3}', 4, 0xff9800, 'bottle'), P('Apple Juice', '\u{1F34E}', 4, 0xc0ca33, 'bottle'), P('Lemonade', '\u{1F34B}', 3, 0xfff176, 'bottle'), P('Cola', '\u{1F964}', 2, 0xb71c1c, 'can'), P('Sparkling Water', '\u{1FAE7}', 2, 0x26c6da, 'bottle'), P('Iced Tea', '\u{1F9CB}', 3, 0xa1662f, 'bottle'), P('Sports Drink', '⚡', 3, 0x00e676, 'bottle'), P('Hot Chocolate Mix', '☕', 4, 0x6d4c41, 'can')] },
    home: { sign: '\u{1F9FC} HOME & CARE', items: [P('Dish Soap', '\u{1F9FC}', 4, 0x66bb6a, 'bottle', false), P('Paper Towels', '\u{1F9FB}', 5, 0xffffff, 'bag', false), P('Toothpaste', '\u{1FAA5}', 3, 0x29b6f6, 'box', false), P('Shampoo', '\u{1F9F4}', 5, 0xab47bc, 'bottle', false), P('Bar Soap', '\u{1F9FC}', 2, 0xf8bbd0, 'box', false), P('Batteries', '\u{1F50B}', 5, 0xffd600, 'box', false), P('Sponges', '\u{1F9FD}', 3, 0xfdd835, 'bag', false), P('Trash Bags', '\u{1F5D1}️', 4, 0x424242, 'box', false), P('Light Bulbs', '\u{1F4A1}', 4, 0xfffde7, 'box', false)] },
    pets: { sign: '\u{1F415} PETS, BABY & MORE', items: [P('Dog Food', '\u{1F415}', 8, 0x8d6e63, 'bag', false), P('Cat Food', '\u{1F408}', 6, 0xef6c00, 'can', false), P('Fish Flakes', '\u{1F420}', 3, 0x29b6f6, 'jar', false), P('Bird Seed', '\u{1F426}', 4, 0xfbc02d, 'bag', false), P('Pet Toy Ball', '\u{1F3BE}', 3, 0xc6ff00, 'box', false), P('Crayons', '\u{1F58D}️', 3, 0xff5252, 'box', false), P('Notebook', '\u{1F4D3}', 3, 0x3f51b5, 'box', false), P('Balloons', '\u{1F388}', 2, 0xff4081, 'bag', false), P('Birthday Candles', '\u{1F56F}️', 2, 0xffee58, 'box', false)] },
    fridge: { sign: '\u{1F95B} DAIRY & FROZEN', items: [P('Fresh Milk', '\u{1F95B}', 3, 0xffffff, 'bottle'), P('Chocolate Milk', '\u{1F95B}', 3, 0x6d4c41, 'bottle'), P('Cheese Slices', '\u{1F9C0}', 4, 0xffc107, 'box'), P('Butter', '\u{1F9C8}', 4, 0xfff59d, 'box'), P('Strawberry Yogurt', '\u{1F353}', 2, 0xf06292, 'can'), P('Eggs (12)', '\u{1F95A}', 4, 0xefebe9, 'box'), P('Ice Cream', '\u{1F368}', 6, 0xf48fb1, 'can'), P('Frozen Pizza', '\u{1F355}', 7, 0xff7043, 'box'), P('Frozen Veggies', '\u{1F966}', 3, 0x43a047, 'bag')] },
    produce: { sign: '\u{1F34E} FRESH PRODUCE', items: [P('Apples', '\u{1F34E}', 2, 0xe53935, 'ball'), P('Bananas', '\u{1F34C}', 2, 0xfdd835, 'ball'), P('Oranges', '\u{1F34A}', 2, 0xfb8c00, 'ball'), P('Strawberries', '\u{1F353}', 4, 0xd81b60, 'ball'), P('Grapes', '\u{1F347}', 4, 0x7b1fa2, 'ball'), P('Carrots', '\u{1F955}', 2, 0xff7043, 'ball'), P('Tomatoes', '\u{1F345}', 3, 0xf44336, 'ball'), P('Lettuce', '\u{1F96C}', 2, 0x7cb342, 'ball'), P('Watermelon', '\u{1F349}', 5, 0x2e7d32, 'ball')] },
    bakery: { sign: '\u{1F950} BAKERY', items: [P('Croissant', '\u{1F950}', 3, 0xe0a850, 'ball'), P('Donut', '\u{1F369}', 2, 0xf48fb1, 'ball'), P('Cupcake', '\u{1F9C1}', 3, 0xf8bbd0, 'ball'), P('Birthday Cake', '\u{1F382}', 12, 0xfff176, 'ball'), P('Baguette', '\u{1F956}', 3, 0xd7a86e, 'ball')] },
    deli: { sign: '\u{1F357} DELI', items: [P('Roast Chicken', '\u{1F357}', 9, 0xc77d3a, 'ball'), P('Sandwich', '\u{1F96A}', 5, 0xe6c88b, 'ball'), P('Hot Dog', '\u{1F32D}', 4, 0xd2691e, 'ball'), P('Fresh Salad', '\u{1F957}', 5, 0x66bb6a, 'ball')] },
  };
  const slug = (s) => 'sm_' + String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  // ─── the cart ───────────────────────────────────────────────────────────────────────────
  let cart = {};   // name -> { p, qty }
  const cartCount = () => Object.keys(cart).reduce((a, k) => a + cart[k].qty, 0);
  const cartTotal = () => Object.keys(cart).reduce((a, k) => a + cart[k].qty * cart[k].p.price, 0);
  function beep(f, d) { try { const c = (window.AudioContext || window.webkitAudioContext); if (!c) return; window.__smAC = window.__smAC || new c(); const a = window.__smAC; if (a.state === 'suspended') a.resume(); const o = a.createOscillator(), g = a.createGain(); o.type = 'square'; o.frequency.value = f || 1800; g.gain.value = .05; g.gain.exponentialRampToValueAtTime(.0005, a.currentTime + (d || .09)); o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + (d || .09) + .02); } catch (e) { } }
  function addToCart(p) {
    if (cartCount() >= 40) { note('\u{1F6D2} Your cart is full! Go to the checkout.'); return; }
    cart[p.name] = cart[p.name] || { p: p, qty: 0 }; cart[p.name].qty++; beep(1400, .07);
    note('\u{1F6D2} ' + p.emoji + ' ' + p.name + ' added • ' + cartCount() + ' in cart • ' + cartTotal() + ' S.I.P.'); refreshCartBtn(); if ($('smCartBox')) renderCart();
  }
  const $ = (id) => document.getElementById(id);
  function cartBtn() {
    let b = $('smCartBtn');
    if (!b) { b = document.createElement('button'); b.id = 'smCartBtn'; b.style.cssText = 'position:fixed;right:14px;bottom:78px;z-index:1500;background:#2e7d32;color:#fff;border:2px solid #fff;border-radius:22px;padding:8px 14px;font:bold 14px Arial;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4);display:none'; b.onclick = openCart; document.body.appendChild(b); }
    return b;
  }
  function refreshCartBtn() { const b = cartBtn(); const here = inside(); b.style.display = here ? 'block' : 'none'; b.textContent = '\u{1F6D2} Cart (' + cartCount() + ') • ' + cartTotal() + ' S.I.P.'; }
  function openCart() {
    try { if (document.pointerLockElement) document.exitPointerLock(); isPointerLocked = false; } catch (e) { }
    let m = $('smCartModal'); if (!m) { m = document.createElement('div'); m.id = 'smCartModal'; m.style.cssText = 'position:fixed;inset:0;z-index:2003;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif'; m.innerHTML = '<div id="smCartBox" style="background:#fff;color:#222;border-radius:14px;width:min(420px,94vw);max-height:88vh;overflow:auto;padding:16px;border-top:10px solid #2e7d32"></div>'; m.addEventListener('mousedown', e => { if (e.target === m) m.style.display = 'none'; }); document.body.appendChild(m); }
    m.style.display = 'flex'; renderCart();
  }
  function renderCart() {
    const b = $('smCartBox'); if (!b) return; const ks = Object.keys(cart);
    b.innerHTML = '<div style="font-size:20px;font-weight:bold;color:#2e7d32">\u{1F6D2} Your Shopping Cart</div>' + (ks.length ? ks.map(k => '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #eee"><span style="font-size:22px">' + cart[k].p.emoji + '</span><span style="flex:1">' + esc(k) + '<br><small style="color:#888">' + cart[k].p.price + ' S.I.P. each</small></span><button data-m="' + esc(k) + '" style="width:26px;height:26px">−</button><b>' + cart[k].qty + '</b><button data-p="' + esc(k) + '" style="width:26px;height:26px">+</button></div>').join('') + '<div style="text-align:right;font-size:18px;margin:10px 0">Total: <b>' + cartTotal() + ' S.I.P.</b></div><div style="font-size:12px;color:#666">Take your cart to a checkout lane near the door and press E to pay.</div>' : '<div style="margin:14px 0;color:#888">Your cart is empty. Walk up to a product and press E.</div>') + '<div style="text-align:right;margin-top:10px"><button id="smCartClose" style="padding:8px 16px;border:0;border-radius:8px;background:#555;color:#fff;font-weight:bold;cursor:pointer">Close</button></div>';
    Array.prototype.forEach.call(b.querySelectorAll('[data-m]'), x => { x.onclick = () => { const k = x.getAttribute('data-m'); if (cart[k] && --cart[k].qty <= 0) delete cart[k]; refreshCartBtn(); renderCart(); }; });
    Array.prototype.forEach.call(b.querySelectorAll('[data-p]'), x => { x.onclick = () => { const k = x.getAttribute('data-p'); if (cart[k]) cart[k].qty++; refreshCartBtn(); renderCart(); }; });
    $('smCartClose').onclick = () => { $('smCartModal').style.display = 'none'; };
  }
  // checkout: the cashier scans everything (beep!), you pay in S.I.P., and the groceries go in your inventory
  let cashier = null, busy = false;
  function say(who, text) { try { if (who && typeof showSpeechBubble === 'function') showSpeechBubble(who.group, who.name, text); } catch (e) { } }
  function checkout() {
    if (busy) return; const ks = Object.keys(cart);
    if (!ks.length) { say(cashier, 'Your cart is empty. Grab some groceries first!'); note('\u{1F6D2} Your cart is empty. Walk up to a product and press E.'); return; }
    const total = cartTotal(); if (sip() < total) { say(cashier, 'Sorry, that is ' + total + ' S.I.P. and you have ' + sip() + '. Put something back?'); note('❌ Not enough S.I.P.! Total ' + total + ', you have ' + sip() + '. Open your cart and take something out.'); return; }
    busy = true; say(cashier, 'Hello! Did you find everything you need today?');
    const items = []; ks.forEach(k => { for (let i = 0; i < cart[k].qty; i++) items.push(cart[k].p); });
    let i = 0; const iv = setInterval(() => { beep(i % 2 ? 1700 : 1900, .08); i++; if (i >= items.length) { clearInterval(iv); finish(total); } }, Math.max(90, Math.min(260, 2600 / items.length)));
  }
  function finish(total) {
    try { spendSip(total); updateSIP(); saveCurrentUser(); } catch (e) { busy = false; return; }
    const lines = Object.keys(cart).map(k => ({ p: cart[k].p, qty: cart[k].qty }));
    lines.forEach(l => { for (let i = 0; i < l.qty; i++) { try { addToInventory(slug(l.p.name), l.p.name, l.p.emoji); } catch (e) { } } try { if (playerInventory[slug(l.p.name)]) playerInventory[slug(l.p.name)].food = !!l.p.food; } catch (e) { } });
    try { saveCurrentUser(); } catch (e) { } cart = {}; refreshCartBtn(); busy = false; beep(880, .25);
    say(cashier, 'That is ' + total + ' S.I.P. Thank you for shopping at Explox Fresh Market!');
    const now = new Date(); let m = $('smReceipt'); if (m) m.remove(); m = document.createElement('div'); m.id = 'smReceipt';
    m.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483000;background:#fffef6;color:#222;font-family:"Courier New",monospace;padding:16px 20px;width:min(320px,90vw);max-height:80vh;overflow:auto;box-shadow:0 6px 24px #000a;border-radius:4px';
    m.innerHTML = '<div style="text-align:center;font-weight:bold;font-size:15px">\u{1F6D2} EXPLOX FRESH MARKET</div><div style="text-align:center;font-size:11px">Fresh food • Low prices</div><div style="font-size:11px;margin:4px 0">' + now.toLocaleDateString() + ' ' + now.toLocaleTimeString() + ' • Lane 1</div><hr>' + lines.map(l => '<div style="display:flex;justify-content:space-between;font-size:12px"><span>' + l.qty + ' x ' + esc(l.p.name) + '</span><span>' + (l.qty * l.p.price) + '</span></div>').join('') + '<hr><div style="display:flex;justify-content:space-between;font-weight:bold"><span>TOTAL (S.I.P.)</span><span>' + total + '</span></div><div style="text-align:center;font-size:11px;margin-top:8px">THANK YOU! COME AGAIN!</div><div style="text-align:center;font-size:11px;color:#2e7d32;margin-top:4px">Your groceries are in your inventory. \u{1F392}</div><div style="text-align:center;margin-top:8px"><button id="smRcOk" style="padding:6px 16px;border:0;border-radius:6px;background:#2e7d32;color:#fff;font-weight:bold;cursor:pointer">OK</button></div>';
    document.body.appendChild(m); $('smRcOk').onclick = () => m.remove(); setTimeout(() => { if (m.parentNode) m.remove(); }, 12000);
  }

  // ─── building blocks ────────────────────────────────────────────────────────────────────
  const C0 = () => ({ x: SHOP_INTERIOR.x, z: SHOP_INTERIOR.z });
  const mine = [];            // every collider I add to SHOP_INTERIOR_COLS (removed again when you leave)
  const walkers = [];
  let animOn = false, pa = 0;
  const inside = () => (typeof inShopInterior !== 'undefined' && inShopInterior && currentShopInterior && currentShopInterior.kind === SMK);
  function col(cx, cz, hw, hd) { const c = addCol(SHOP_INTERIOR_COLS, cx, cz, hw, hd); mine.push(c); return c; }
  function clearCols() { mine.forEach(c => { const i = SHOP_INTERIOR_COLS.indexOf(c); if (i > -1) SHOP_INTERIOR_COLS.splice(i, 1); }); mine.length = 0; }
  const D = (o) => { try { shopDecor(o); } catch (e) { scene.add(o); } return o; };
  const lam = (c) => new THREE.MeshLambertMaterial({ color: c });
  function bx(w, h, d, c, x, y, z, parent) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(c)); m.position.set(x, y, z); if (parent) parent.add(m); else { scene.add(m); D(m); } return m; }

  function tileTexture() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'); c.fillStyle = '#e9edf0'; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#d5dce1' : '#eef1f3'; c.fillRect(i * 64, j * 64, 64, 64); }
    c.strokeStyle = '#b8c2c9'; c.lineWidth = 2; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, 256); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(256, i * 64); c.stroke(); }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 8); return t;
  }
  // humanoid made from simple shapes (cashier, deli worker, shoppers)
  function person(shirt, pants, skin, hat) {
    const g = new THREE.Group(), body = new THREE.Mesh(new THREE.BoxGeometry(.5, .7, .28), lam(shirt)); body.position.y = 1.15; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.21, 12, 10), lam(skin)); head.position.y = 1.7; g.add(head);
    if (hat) { const h = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .14, 12), lam(hat)); h.position.y = 1.93; g.add(h); }
    const legs = []; [-.13, .13].forEach(x => { const l = new THREE.Mesh(new THREE.BoxGeometry(.2, .8, .22), lam(pants)); l.position.set(x, .4, 0); g.add(l); legs.push(l); });
    const arms = []; [-.34, .34].forEach(x => { const a = new THREE.Mesh(new THREE.BoxGeometry(.14, .62, .16), lam(skin)); a.position.set(x, 1.12, 0); g.add(a); arms.push(a); });
    g.userData = { legs, arms }; scene.add(g); D(g); return g;
  }
  function shelfFace(sec, gx, gz, side, x0) {
    // one face of a gondola: 9 product bays, each with 3 shelves of the same product
    const z = gz + side * .33, items = SECTIONS[sec].items;
    items.forEach((p, i) => { const x = x0 + (i + .5) * 1.8; ZONES.push({ x: x, z: gz + side * 1.35, r: .95, label: '\u{1F6D2} Add ' + p.emoji + ' ' + p.name + ' – ' + p.price + ' S.I.P.', action: () => addToCart(p) }); slotProducts(p, x, z, side, 3); });
  }
  const PR = { box: 0, can: 1, bottle: 1, bag: 0, jar: 1, ball: 2 };
  let inst = null, instN = 0;
  function newInst() {
    const cap = 4200, mats = () => new THREE.MeshLambertMaterial({ color: 0xffffff });
    inst = { box: new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mats(), cap), cyl: new THREE.InstancedMesh(new THREE.CylinderGeometry(.5, .5, 1, 10), mats(), cap), ball: new THREE.InstancedMesh(new THREE.SphereGeometry(.5, 8, 6), mats(), 1500), n: { box: 0, cyl: 0, ball: 0 } };
    [inst.box, inst.cyl, inst.ball].forEach(m => { m.frustumCulled = false; scene.add(m); D(m); });
  }
  const DUM = () => new THREE.Object3D();
  function put(kind, x, y, z, sx, sy, sz, color) { const m = inst[kind], n = inst.n[kind]; if (n >= m.count) return; const d = DUM(); d.position.set(x, y, z); d.scale.set(sx, sy, sz); d.updateMatrix(); m.setMatrixAt(n, d.matrix); m.setColorAt(n, new THREE.Color(color)); inst.n[kind]++; }
  const lighter = (c) => { const k = new THREE.Color(c); k.offsetHSL(0, 0, .22); return k.getHex(); };
  function slotProducts(p, x, z, side, tiers) {
    const ys = [.28, .88, 1.48];
    for (let t = 0; t < (tiers || 3); t++) {
      for (let i = 0; i < 5; i++) {
        const px = x - .72 + i * .36, y0 = ys[t];
        if (p.shape === 'can') { put('cyl', px, y0 + .09, z, .24, .18, .24, p.color); put('cyl', px, y0 + .09, z, .245, .07, .245, 0xffffff); }
        else if (p.shape === 'bottle') { put('cyl', px, y0 + .17, z, .15, .34, .15, p.color); put('cyl', px, y0 + .37, z, .07, .1, .07, 0xffffff); }
        else if (p.shape === 'jar') { put('cyl', px, y0 + .1, z, .22, .2, .22, p.color); put('cyl', px, y0 + .22, z, .23, .05, .23, 0xdddddd); }
        else if (p.shape === 'bag') { put('box', px, y0 + .2, z, .3, .4, .1, p.color); put('box', px, y0 + .27, z + side * .055, .26, .14, .01, lighter(p.color)); }
        else { put('box', px, y0 + .21, z, .28, .42, .13, p.color); put('box', px, y0 + .26, z + side * .07, .22, .16, .01, lighter(p.color)); }
      }
    }
  }
  function gondola(gx, gz, secN, secS, x0) {
    const L = 16.2; bx(L, 2.3, .12, 0x9aa7b0, gx, 1.15, gz); [-1, 1].forEach(s => { bx(.12, 2.3, 1.2, 0x7e8c95, gx + s * L / 2, 1.15, gz); });
    [-1, 1].forEach(side => { [.12, .72, 1.32, 1.92].forEach(y => bx(L, .06, .55, 0xcfd8dc, gx, y, gz + side * .33)); bx(L, .18, .06, 0xe53935, gx, .12, gz + side * .62); });
    bx(L, .06, 1.15, 0xb0bec5, gx, 2.32, gz);
    col(gx, gz, L / 2 + .1, .72); shelfFace(secN, gx, gz, -1, x0); shelfFace(secS, gx, gz, 1, x0);
    const s1 = buildSign(SECTIONS[secN].sign, gx, 3.6, gz - .1, 0), s2 = buildSign(SECTIONS[secS].sign, gx, 3.6, gz + .1, 0); D(s1); D(s2);
  }
  function fridgeWall(x0, z) {
    const items = SECTIONS.fridge.items;
    items.forEach((p, i) => {
      const x = x0 + (i + .5) * 1.8; bx(1.76, 2.3, .9, 0xeceff1, x, 1.15, z); bx(1.6, 2.0, .05, 0x81d4fa, x, 1.15, z + .47).material = new THREE.MeshPhongMaterial({ color: 0x9ad8ff, transparent: true, opacity: .28, shininess: 90 });
      [.35, .95, 1.55].forEach(y => bx(1.6, .04, .7, 0xcfd8dc, x, y, z));
      slotProducts(p, x, z, 1, 3);
      ZONES.push({ x: x, z: z + 1.5, r: .95, label: '\u{1F6D2} Add ' + p.emoji + ' ' + p.name + ' – ' + p.price + ' S.I.P.', action: () => addToCart(p) });
    });
    col(x0 + 8.1, z, 8.2, .6); D(buildSign(SECTIONS.fridge.sign, 0, 3.6, z + .6));
  }
  function produceTables(x, z0) {
    SECTIONS.produce.items.forEach((p, i) => {
      const z = z0 + i * 2.1; bx(1.3, .75, 1.9, 0x8d6e43, x, .375, z); bx(1.2, .1, 1.8, 0xa1805a, x, .78, z);
      const dc = DUM(); for (let k = 0; k < 14; k++) { const a = (k % 4) * .3 - .45, b = Math.floor(k / 4) * .42 - .6; put('ball', x + a * 1, .98 + (k > 7 ? .17 : 0), z + b * .9 * (k > 7 ? .7 : 1), .3, .3, .3, p.color); }
      bx(.04, .3, .5, 0xffffff, x + .72, .95, z).rotation.z = .25;
      ZONES.push({ x: x + 1.5, z: z, r: .95, label: '\u{1F6D2} Add ' + p.emoji + ' ' + p.name + ' – ' + p.price + ' S.I.P.', action: () => addToCart(p) });
    });
    col(x, z0 + 8.4, .8, 10.2); D(buildSign(SECTIONS.produce.sign, x + 1, 3.6, z0 + 8.4, Math.PI / 2));
  }
  function counter(x, z0, sec, step, deli) {
    SECTIONS[sec].items.forEach((p, i) => {
      const z = z0 + i * step; bx(1.3, .95, step - .1, deli ? 0xeceff1 : 0xb08a5a, x, .475, z); bx(1.2, .08, step - .15, 0xf5f5f5, x, .98, z);
      if (deli) bx(1.1, .45, step - .3, 0x9ad8ff, x, 1.25, z).material = new THREE.MeshPhongMaterial({ color: 0x9ad8ff, transparent: true, opacity: .25 });
      for (let k = 0; k < 6; k++) put('ball', x + ((k % 2) * .4 - .2), 1.1 + (deli ? 0 : 0), z + (Math.floor(k / 2) - 1) * (step * .26), .3, .22, .3, p.color);
      ZONES.push({ x: x - 1.4, z: z, r: .95, label: '\u{1F6D2} Add ' + p.emoji + ' ' + p.name + ' – ' + p.price + ' S.I.P.', action: () => addToCart(p) });
    });
    col(x, z0 + (SECTIONS[sec].items.length - 1) * step / 2, .8, (SECTIONS[sec].items.length * step) / 2); D(buildSign(SECTIONS[sec].sign, x - .5, 3.6, z0 + (SECTIONS[sec].items.length - 1) * step / 2, -Math.PI / 2));
  }
  function cartModel(x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; const metal = lam(0xb0bec5);
    const basket = new THREE.Mesh(new THREE.BoxGeometry(.6, .35, .95), new THREE.MeshLambertMaterial({ color: 0xcfd8dc, transparent: true, opacity: .75 })); basket.position.set(0, .8, 0); g.add(basket);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(.5, .05, .8), metal); frame.position.y = .3; g.add(frame);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(.6, .05, .05), lam(0xe53935)); handle.position.set(0, 1.05, -.5); g.add(handle);
    [[-.22, .35], [.22, .35], [-.22, -.35], [.22, -.35]].forEach(w => { const wh = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .05, 8), lam(0x333333)); wh.rotation.z = Math.PI / 2; wh.position.set(w[0], .08, w[1]); g.add(wh); });
    scene.add(g); D(g); return g;
  }
  function checkoutLane(x, z) {
    bx(1.1, 1.0, 3.2, 0x546e7a, x, .5, z); bx(1.0, .06, 3.1, 0x212121, x, 1.02, z - .1);    // counter + conveyor belt
    bx(.5, .5, .6, 0x37474f, x + .9, .9, z + 1.1); bx(.4, .25, .02, 0x00e5ff, x + .9, 1.25, z + .8);   // till and screen
    bx(.2, .5, .06, 0xffeb3b, x, 2.4, z + 1.7); const lamp = D(buildSign('LANE ' + (x < 9 ? 1 : 2), x, 3.2, z + 1.2)); col(x + .1, z, 1.4, 1.7);
    return lamp;
  }
  function sign(text, x, y, z, rot) { D(buildSign(text, x, y, z, rot || 0)); }

  const ZONES = [];
  function buildInterior() {
    const c = C0(), cx = c.x, cz = c.z; clearCols(); ZONES.length = 0; walkers.length = 0; cashier = null; newInst();
    try { repaintShopInteriorShell(0xf3f6f8, 0xe9edf0, 0xfff7e0); } catch (e) { }
    // tiled floor + ceiling lights
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(32, 32), new THREE.MeshLambertMaterial({ map: tileTexture() })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, .095, cz); scene.add(fl); D(fl);
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const lp = new THREE.Mesh(new THREE.BoxGeometry(2.6, .08, .5), new THREE.MeshBasicMaterial({ color: 0xfffbea })); lp.position.set(cx + i * 4.4, 7.75, cz + j * 4.4); scene.add(lp); D(lp); }
    [[-8, -6], [8, -6], [-8, 6], [8, 6]].forEach(p => { const l = new THREE.PointLight(0xfff3d6, .45, 30); l.position.set(cx + p[0], 6.5, cz + p[1]); scene.add(l); D(l); });
    // wall base stripe in store colours
    [[0, -16, 32, .3], [-16, 0, .3, 32], [16, 0, .3, 32]].forEach(w => bx(w[2], .9, w[3], 0x2e7d32, cx + w[0], .45, cz + w[1] + (w[1] === -16 ? .3 : 0)));
    // shelf aisles
    const x0 = cx - 8.1;
    gondola(cx, cz - 10, 'breakfast', 'canned', x0);
    gondola(cx, cz - 4.5, 'snacks', 'drinks', x0);
    gondola(cx, cz + 1, 'home', 'pets', x0);
    // promo end-cap stacks
    [-9.6, 9.6].forEach((dx, k) => { for (let r = 0; r < 3; r++) for (let q = 0; q < 3 - r; q++) put('box', cx + dx + (q - (2 - r) / 2) * .5, .3 + r * .45, cz - 7.2 + (k ? .3 : -.3), .45, .4, .4, [0xff5252, 0xffd740, 0x40c4ff][(r + k) % 3]); sign('SPECIAL OFFER!', cx + dx, 2.4, cz - 7.2, k ? -Math.PI / 2 : Math.PI / 2); });
    fridgeWall(x0, cz - 15.2);
    produceTables(cx - 14.7, cz - 12);
    counter(cx + 15.0, cz - 12, 'bakery', 2.0, false);
    counter(cx + 14.0, cz - 0.5, 'deli', 2.0, true);
    // checkouts
    checkoutLane(cx + 6, cz + 10); checkoutLane(cx + 10.5, cz + 10);
    ZONES.push({ x: cx + 6, z: cz + 8, r: 1.9, label: '\u{1F4B3} Pay at Lane 1 – ' + '(press E)', action: checkout }); ZONES.push({ x: cx + 10.5, z: cz + 8, r: 1.9, label: '\u{1F4B3} Pay at Lane 2 (press E)', action: checkout });
    // carts and baskets at the door
    for (let i = 0; i < 5; i++) cartModel(cx - 12.5, cz + 10 + i * .55, 0);
    for (let i = 0; i < 4; i++) bx(.5, .2 + i * .05, .35, i % 2 ? 0xe53935 : 0x1e88e5, cx - 9.5, .12 + i * .24, cz + 13.5).rotation.y = i * .1;
    ZONES.push({ x: cx - 11.2, z: cz + 12, r: 1.8, label: '\u{1F6D2} Shopping carts – your cart is always with you (open it with the Cart button)', action: openCart });
    // front-of-store things: flowers + newspaper rack + welcome mat
    bx(1.6, .8, .8, 0x8d6e43, cx + 5, .4, cz + 14.2); for (let i = 0; i < 8; i++) put('ball', cx + 4.4 + (i % 4) * .4, 1.0 + Math.floor(i / 4) * .15, cz + 14.1 + Math.floor(i / 4) * .1, .28, .28, .28, [0xff4081, 0xffd740, 0xffffff, 0xba68c8][i % 4]);
    sign('WELCOME TO EXPLOX FRESH MARKET', cx, 5.4, cz + 15.4, Math.PI);
    sign('\u{1F6D2} CHECKOUT', cx + 8, 4.6, cz + 9, 0);
    // people
    cashier = { group: person(0x2e7d32, 0x263238, 0xe0b48f, 0xffffff), name: 'Cashier Casey' }; cashier.group.position.set(cx + 7.2, 0, cz + 10.2); cashier.group.rotation.y = -Math.PI / 2;
    const deli = { group: person(0xffffff, 0x263238, 0xd7a47a, 0xffffff), name: 'Deli Dana' }; deli.group.position.set(cx + 15.2, 0, cz + 2.5); deli.group.rotation.y = -Math.PI / 2; walkers.push({ g: deli.group, still: true });
    const cols = [0xe91e63, 0x3f51b5, 0xff9800, 0x009688, 0x9c27b0, 0x795548]; const lanes = [cz - 12.6, cz - 7.2, cz - 1.7, cz + 4.5];
    for (let i = 0; i < 5; i++) { const w = person(cols[i % 6], 0x37474f, [0xe0b48f, 0xc68642, 0xf1c9a5, 0x8d5524, 0xffdbac][i % 5]); const lane = lanes[i % 4]; w.position.set(cx - 7 + i * 3, 0, lane); const cm = cartModel(0, 0, 0); cm.position.set(w.position.x, 0, w.position.z + .9); walkers.push({ g: w, cart: cm, lane: lane, dir: i % 2 ? 1 : -1, x: w.position.x, spd: .8 + (i % 3) * .25, pause: 0, cx: cx }); }
    inst.box.count = inst.n.box; inst.cyl.count = inst.n.cyl; inst.ball.count = inst.n.ball; [inst.box, inst.cyl, inst.ball].forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
    ZONES.forEach(z => SHOP_INTERIOR_ZONES.push(z));
  }
  function animate() {
    if (!animOn) return;
    const t = performance.now() / 1000, dt = .033;
    walkers.forEach(w => {
      if (w.still) { w.g.userData.arms[0].rotation.x = Math.sin(t * 2) * .3; return; }
      if (w.pause > 0) { w.pause -= dt; return; }
      w.x += w.dir * w.spd * dt; const lo = w.cx - 9.5, hi = w.cx + 9.5; if (w.x > hi) { w.x = hi; w.dir = -1; } if (w.x < lo) { w.x = lo; w.dir = 1; }
      if (Math.random() < .004) w.pause = 1.5 + Math.random() * 2.5;
      w.g.position.x = w.x; w.g.rotation.y = w.dir > 0 ? Math.PI / 2 : -Math.PI / 2; const sw = Math.sin(t * 6 * w.spd) * .5; w.g.userData.legs[0].rotation.x = sw; w.g.userData.legs[1].rotation.x = -sw; w.g.userData.arms[0].rotation.x = -sw * .6; w.g.userData.arms[1].rotation.x = sw * .6;
      if (w.cart) { w.cart.position.set(w.x + w.dir * .7, 0, w.lane + .05); w.cart.rotation.y = w.dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
    });
    if (cashier && cashier.group) cashier.group.userData.arms[1].rotation.x = Math.sin(t * 3) * .25;
  }
  const PA = ['Attention shoppers: fresh bread is coming out of the bakery oven!', 'Attention shoppers: ice cream is on special in the freezer aisle!', 'Cleanup on aisle 4, please. Somebody dropped a banana!', 'Reminder: please return your cart to the cart corner.', 'Attention shoppers: the deli has fresh roast chicken today!', 'Lane 2 is now open. Thank you for shopping at Explox Fresh Market!'];
  setInterval(() => { if (!animOn) return; try { animate(); } catch (e) { } }, 33);
  setInterval(() => { if (inside() && Date.now() - pa > 45000) { pa = Date.now(); note('\u{1F4E2} ' + PA[Math.floor(Math.random() * PA.length)]); } refreshCartBtn(); }, 1500);

  // ─── hook into the shop-interior system ─────────────────────────────────────────────────
  const origPop = populateShopInterior, origExit = exitShopInterior;
  populateShopInterior = function (kind, refId) {
    clearCols(); animOn = false;
    const r = origPop.apply(this, arguments);
    if (kind === SMK) {
      try { const last = shopInteriorDecorMeshes.pop(); if (last) scene.remove(last); } catch (e) { }
      buildInterior(); animOn = true; pa = Date.now(); say(cashier, 'Welcome to Explox Fresh Market!'); note('\u{1F6D2} Welcome to Explox Fresh Market! Press E at a product to add it to your cart. Pay at a checkout lane.');
    }
    return r;
  };
  exitShopInterior = function () { const was = inside(); const r = origExit.apply(this, arguments); if (was) { clearCols(); animOn = false; } refreshCartBtn(); return r; };
  window.enterSupermarket = function () { try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) { } enterShopInterior(SMK, 'fresh'); };

  // ─── the building outside ───────────────────────────────────────────────────────────────
  let built = false, site = null;
  function findSite() {
    const bad = (x, z) => { for (const c of CITY_COLS) { if (Math.abs(x - c.cx) < c.hw + 34 && Math.abs(z - c.cz) < c.hd + 30) return true; } for (const q of CITY_ZONES) { if (Math.hypot(q.x - x, q.z - z) < 40) return true; } try { for (const dx of [-24, 0, 24]) for (const dz of [-20, 0, 20]) if (Math.abs(groundHeightAt(x + dx, z + dz)) > .15) return true; } catch (e) { } return false; };
    const cands = []; for (let x = -220; x <= 220; x += 12) for (let z = -220; z <= 220; z += 12) { const d = Math.hypot(x, z); if (d > 70 && d < 230) cands.push([x, z, d]); }
    cands.sort((a, b) => a[2] - b[2]); for (const c of cands) if (!bad(c[0], c[1])) return { x: c[0], z: c[1] };
    return null;
  }
  function buildOutside() {
    if (built || typeof scene === 'undefined' || !scene || typeof THREE === 'undefined' || typeof CITY_COLS === 'undefined' || !CITY_COLS.length || typeof playerGroup === 'undefined' || !playerGroup) return;
    site = findSite(); if (!site) { built = true; return; } built = true; const X = site.x, Z = site.z;
    const add = (o) => { scene.add(o); return o; }, B = (w, h, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(c)); m.position.set(X + x, y, Z + z); m.castShadow = m.receiveShadow = true; return add(m); };
    B(30, 9, 16, 0xf5f5f0, 0, 4.5, 0); B(30.4, .8, 16.4, 0x2e7d32, 0, 9.2, 0); B(30.2, 1.4, 16.2, 0x2e7d32, 0, .7, 0);
    const glass = B(18, 4.4, .3, 0x9ad8ff, -3, 2.6, 8.1); glass.material = new THREE.MeshPhongMaterial({ color: 0x9ad8ff, transparent: true, opacity: .45, shininess: 100 });
    B(3.4, 3.6, .35, 0x607d8b, 9.5, 1.9, 8.15);           // sliding doors frame
    const aw = B(30, .35, 4.2, 0x43a047, 0, 5.9, 10); aw.rotation.x = .18; [-14, -7, 0, 7, 14].forEach(x => B(.2, 5.5, .2, 0xcfd8dc, x, 2.75, 12));
    B(40, .1, 24, 0x424242, 0, .05, 15); [-14, -10, -6, -2, 2, 6, 10, 14].forEach(x => B(.2, .02, 4, 0xffffff, x, .12, 19));   // car park
    for (let i = 0; i < 4; i++) B(.9, 1, 1.4, 0x78909c, -16 + i * 1.1, .5, 12.3);   // cart corral
    const logo = buildLogoSign('Explox Fresh Market', '\u{1F6D2}', '#2e7d32', '#a5d6a7', X, 11.2, Z + 8.5); try { scene.add(logo); } catch (e) { }
    [-17, 17].forEach(x => { B(.25, 7, .25, 0x37474f, x, 3.5, 24); B(1.4, .25, .5, 0xfff59d, x, 7.1, 24); });
    addCol(CITY_COLS, X, Z, 15.3, 8.3);
    CITY_ZONES.push({ x: X + 9.5, z: Z + 11, r: 3.2, label: '\u{1F6D2} Enter Explox Fresh Market', action: () => window.enterSupermarket() });
    window.__supermarket.site = site;
  }
  setInterval(() => { if (!built) { try { buildOutside(); } catch (e) { built = true; } } }, 4000);
  window.__supermarket = { SECTIONS: SECTIONS, cart: () => cart, add: addToCart, total: cartTotal, checkout: checkout, enter: () => window.enterSupermarket(), buildInterior: buildInterior, site: null, zones: ZONES };
})();
