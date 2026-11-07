// ─── EXPLOX TV ───────────────────────────────────────────────────────────────────────────────
// The TV in your house, the hotel rooms, the country hotel and the airport lounge ("📺 Watch TV") now opens Explox TV:
//   🎬 every Explox Cinemas movie on your own screen — 100 S.I.P. for every real minute you watch, or rent the TV for 1,000 S.I.P. and watch free for one Explox day (30 real minutes)
//   📰 Explox News (made fresh each time, with the real new movies and real shop products), 🛍️ commercials for real Explox products, 😂 fun videos and 📺 a live mix of everything.
// Everything is drawn by the same 3D movie engine as the cinema. Only in-game S.I.P. is spent — never real money.
(function () {
  'use strict';
  if (typeof CINEMA_MOVIES === 'undefined') return;
  const PER_MIN = 100, RENT = 1000, DAYMS = (typeof DAY_LENGTH !== 'undefined' ? DAY_LENGTH : 1800) * 1000;
  const tv = { on: false, secs: 0, timer: null, queue: [], mode: '', slots: [], slotI: 0, channel: '' };
  const $ = (id) => document.getElementById(id);
  const hs = (a, b) => { let h = 2166136261; const s = a + '|' + b; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); };
  const pick = (arr, salt) => arr[Math.floor(Math.random() * arr.length * 1.0) % arr.length];
  const L = (w, e, a, t) => [w, e, a, t];
  const S = (place, tod, prop, say, lines) => ({ text: say, dur: 40, draw: function (ctx, w, h) { ctx.fillStyle = '#10131f'; ctx.fillRect(0, 0, w, h); }, script: { place: place, tod: tod, prop: prop, lines: lines } });
  const user = () => (typeof currentUser !== 'undefined' && currentUser) ? currentUser : 'guest';
  const rentKey = () => 'explox_tvrent_' + user();
  function rentEnd() { try { return +localStorage.getItem(rentKey()) || 0; } catch (e) { return 0; } }
  const rented = () => rentEnd() > Date.now();
  const sip = () => (typeof sipDollars !== 'undefined' ? sipDollars : 0);
  const note = (m) => { try { showNotif(m); } catch (e) { } };
  function pay(n) { try { spendSip(n); saveCurrentUser(); updateSIP(); } catch (e) { } }
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // ── reusable "TV" movie slots (hidden from the cinema lobby) ──────────────
  function slot() {
    if (!tv.slots.length) for (let i = 0; i < 14; i++) { CINEMA_MOVIES.push({ title: 'Explox TV', genre: '📺 TV', price: 0, bg: '#101828', icons: '📺', comedy: true, tv: true, tvTag: 'TV', narrator: 'TV Voice', cast: {}, trailer: [], scenes: [] }); tv.slots.push(CINEMA_MOVIES.length - 1); }
    const i = tv.slots[tv.slotI++ % tv.slots.length]; return i;
  }
  // every news scene happens at the anchor's counter; the anchor is dead serious and the reporter reports from beside it
  function deskify(scenes) { scenes.forEach(sc => { sc.script.place = 'cityhall'; sc.script.lines = sc.script.lines.map(l => [l[0], l[0] === 'A' ? 'serious' : l[1], 'desk', l[3]]); }); return scenes; }
  const C3 = (a, b, c) => ({ A: { role: a[0], kind: a[1], pers: a[2] }, B: { role: b[0], kind: b[1], pers: b[2] }, C: { role: c[0], kind: c[1], pers: c[2] } });
  function program(tag, title, narrator, cast, scenes) {
    if (/NEWS/.test(tag)) scenes = deskify(scenes);
    const idx = slot(), m = CINEMA_MOVIES[idx]; m.seamless = /\[SHOW\]/.test(tag); m.comedy = !/NEWS|SOCCER|FIGHT|SHOW/.test(tag); m.ticker = ''; m.title = title; m.tvTag = tag; m.narrator = narrator; m.cast = cast; m.scenes = scenes;
    try { window.__cinema3d.reset(idx); window.__cinema3d.wire(idx); } catch (e) { } return idx;
  }

  // ── real products from the real Explox shops ──────────────────────────────
  function products() {
    const out = [];
    try { (typeof OUTFITS !== 'undefined' ? OUTFITS : []).forEach(o => out.push({ name: o.name + ' outfit', price: o.cost, store: 'the Explox Boutique', cat: 'outfit', emoji: '👕' })); } catch (e) { }
    try { (typeof CINEMA_SNACKS !== 'undefined' ? CINEMA_SNACKS : []).forEach(o => out.push({ name: o.name, price: o.price, store: 'the Explox Cinemas snack bar', cat: 'snack', emoji: o.emoji })); } catch (e) { }
    try { (typeof LOUNGE_ELECTRONICS !== 'undefined' ? LOUNGE_ELECTRONICS : []).forEach(o => out.push({ name: o.name, price: o.cost, store: 'the Airport Lounge shop', cat: 'tech', emoji: o.emoji })); } catch (e) { }
    try { (typeof HOUSE_FURNITURE_CATALOG !== 'undefined' ? HOUSE_FURNITURE_CATALOG : []).filter(o => o.price).forEach(o => out.push({ name: o.name, price: o.price, store: 'the Explox Furniture Store', cat: 'home', emoji: o.emoji })); } catch (e) { }
    try { CINEMA_MOVIES.filter(m => !m.tv && m.price).slice(-6).forEach(m => out.push({ name: 'a ticket to ' + m.title, price: m.price, store: 'Explox Cinemas', cat: 'ticket', emoji: '🎟️' })); } catch (e) { }
    if (!out.length) out.push({ name: 'Mega Pizza Slice', price: 12, store: 'the Pizza Restaurant', cat: 'snack', emoji: '🍕' });
    return out;
  }
  const AD_FLAVOR = { snack: ['eat', 'party', 'Crunchy, yummy and perfect for movie night!', 'market', 'pizza'], outfit: ['photo', 'dance', 'I look so cool in it, everyone is looking at me!', 'market', 'heart'], tech: ['photo', 'play', 'It does everything, and it fits in my pocket!', 'airport', 'bolt'], home: ['build', 'party', 'My whole house looks better already!', 'house', 'house'], ticket: ['party', 'highfive', 'The best seats in Explox, and the popcorn is right there!', 'city', 'trophy'] };
  function adScene(p) {
    const f = AD_FLAVOR[p.cat] || AD_FLAVOR.snack, price = fmt(p.price), em = p.emoji;
    return S(f[3] === 'airport' ? 'airport' : f[3], 'day', f[4], '📢 COMMERCIAL: ' + p.name + ', only at ' + p.store + '.', [
      L('N', 'excited', 'shop', 'A message from our friends at ' + p.store + '.'),
      L('A', 'excited', 'shop', 'Tired of boring days? Meet ' + p.name + '! ' + em),
      L('B', 'surprised', 'look', 'Oh look! Is that ' + p.name + '? It looks amazing!'),
      L('A', 'happy', f[0], 'It is only ' + price + ' S.I.P., right here at ' + p.store + '!'),
      L('B', 'joy', f[1], f[2]),
      L('N', 'warm', 'sing', p.name + '! ' + p.name + '! Only at ' + p.store + '! Buy yours today!'),
    ]);
  }
  function adBreak(n) {
    const ps = products(), chosen = []; for (let i = 0; i < n; i++) chosen.push(ps[Math.floor(Math.random() * ps.length)]);
    return program('📢 COMMERCIAL BREAK', 'Commercial Break', 'Ad Voice', C3(['Shopper Sam', 'hero', 'goof'], ['Happy Hana', 'hero', 'sweet'], ['Mr. Deal', 'king', 'rival']), chosen.map(pp => { const sc = adScene(pp); sc.product = pp; return sc; }));
  }

  // ── Explox News (made fresh every time) ───────────────────────────────────
  const NEWS = [
    { place: 'market', prop: 'pizza', head: 'a giant robot got stuck in the pizza shop door', lines: [['B', 'surprised', 'look', 'Ava, I am outside the pizza shop and a giant robot is stuck in the door!'], ['A', 'shocked', 'talk', 'A robot? Is anybody hurt?'], ['B', 'happy', 'look', 'Nobody is hurt. The robot says it only wanted one slice.'], ['A', 'joy', 'talk', 'Oh dear. How did they get it out?'], ['B', 'joy', 'cook', 'Chef Gigi covered the door in butter, and the robot slid right through!'], ['A', 'happy', 'party', 'A happy ending, and a very buttery robot.']] },
    { place: 'park', prop: 'sun', head: 'a parade of friendly dinosaurs marched through the park', lines: [['B', 'excited', 'dance', 'Ava, the dinosaur parade is here and they are dancing!'], ['A', 'surprised', 'look', 'Dancing dinosaurs? Tell us more!'], ['B', 'joy', 'dance', 'Little Nugget the red dino is leading the whole band!'], ['A', 'happy', 'talk', 'And were the neighbors scared?'], ['B', 'happy', 'party', 'Not at all. Everybody joined in, even the mayor!'], ['A', 'joy', 'drum', 'Wonderful. Roar-some news indeed.']] },
    { place: 'beach', prop: 'sun', head: 'a snowman paid a surprise visit to the beach', lines: [['B', 'surprised', 'look', 'Ava, you will not believe it. A snowman is at the beach, in sunglasses!'], ['A', 'shocked', 'talk', 'A snowman? Will he melt?'], ['B', 'curious', 'fish', 'His friends brought a freezer wagon, and he is having a lovely cool evening.'], ['A', 'happy', 'talk', 'How sweet. Did he say hello to the sea?'], ['B', 'joy', 'dance', 'He did. And the little crabs held a dance party for him!'], ['A', 'warm', 'party', 'What a cool visitor. Thank you, Rex.']] },
    { place: 'arena', prop: 'trophy', head: 'a champion skater jumped twelve steps in one go', lines: [['B', 'excited', 'skate', 'Ava, I am at the skate park where Zippy Zed just jumped twelve steps!'], ['A', 'surprised', 'look', 'Twelve? That is a new record!'], ['B', 'joy', 'jump', 'And the crowd went wild. Even the judges jumped!'], ['A', 'happy', 'talk', 'Did Zippy have a secret?'], ['B', 'happy', 'talk', 'Zippy says: wheels up, and practice with a friend.'], ['A', 'joy', 'highfive', 'Great advice. Congratulations, Zippy!']] },
    { place: 'house', prop: 'fire', head: 'Chef Gigi\'s volcano cake was named the best dessert in Explox', lines: [['B', 'excited', 'cook', 'Ava, I am in the kitchen where the famous volcano cake was born!'], ['A', 'curious', 'look', 'The cake that exploded into party crumbs?'], ['B', 'joy', 'eat', 'The very one! It tastes like a birthday party in your mouth.'], ['A', 'happy', 'talk', 'And how did it happen?'], ['B', 'happy', 'cook', 'By accident! Beep-Boop turned the oven up a tiny bit too high.'], ['A', 'joy', 'party', 'Happy accidents are the sweetest. Back to you later, Rex.']] },
    { place: 'airport', prop: 'rocket', head: 'a little star puppy was brought home from space', lines: [['B', 'excited', 'fly', 'Ava, I am at the Space Dock where a little star puppy just landed!'], ['A', 'joy', 'talk', 'Twinkle is home? That is wonderful!'], ['B', 'warm', 'play', 'His family hugged him tight, and his tail is sparkling like fireworks.'], ['A', 'happy', 'talk', 'Who found him?'], ['B', 'happy', 'highfive', 'Captain Zip, a shy alien and a wise old robot.'], ['A', 'warm', 'party', 'Heroes come in all shapes. Thank you, Rex.']] },
    { place: 'city', prop: 'car', head: 'a balloon the size of a house floated over downtown', lines: [['B', 'surprised', 'look', 'Ava, look up! A giant red balloon is floating over downtown!'], ['A', 'surprised', 'look', 'Oh look! Whose balloon is that?'], ['B', 'curious', 'fly', 'Nobody knows. But it is carrying a basket of free cookies!'], ['A', 'joy', 'eat', 'Free cookies? Send some to the studio!'], ['B', 'joy', 'eat', 'Too late, Ava. The crowd already ate them all.'], ['A', 'joy', 'party', 'Ha ha! The tastiest mystery of the week.']] },
    { place: 'library', prop: 'book', head: 'the library found a very sleepy visitor', lines: [['B', 'curious', 'sneak', 'Ava, I am in the library, and I can hear snoring behind the shelves.'], ['A', 'surprised', 'talk', 'Snoring? In a library?'], ['B', 'surprised', 'look', 'It is a sleepwalking ghost named Wisp. She loves to nap on soft books.'], ['A', 'warm', 'talk', 'How cute. Is she in trouble?'], ['B', 'happy', 'talk', 'Not at all. The librarian gave her a blanket and a quiet corner.'], ['A', 'warm', 'party', 'Sweet dreams, Wisp. Now back to the studio.']] },
  ];
  const WEATHER = [['sunny', 'Blue skies and sunshine all day, perfect for the park and the beach.', 'play'], ['cloudy', 'A few fluffy clouds, but no rain. Bring a sweater for the evening.', 'walk'], ['rainy', 'A gentle shower this afternoon. Puddle jumping is allowed!', 'jump'], ['starry', 'A clear night with lots of stars. Great for camping and wishing.', 'camp']];
  const WAR = [
    [['A', 'serious', 'desk', 'Now, an update on the really boring war.'], ['A', 'serious', 'desk', 'Today, the Left Sock Army moved one step to the left. The Right Sock Army moved one step to the right. Neither army noticed.'], ['B', 'worried', 'desk', 'I am live in the field, sir. It is still a field. Nothing is happening behind me.'], ['A', 'serious', 'desk', 'Thank you, Ian. Please keep standing there.'], ['C', 'warm', 'desk', 'Experts say the war may be over by Thursday. Or possibly Friday. Or never.'], ['A', 'serious', 'desk', 'We will bring you more nothing as it happens.']],
    [['A', 'serious', 'desk', 'In the really boring war, both armies agreed to a ceasefire for lunch.'], ['A', 'serious', 'desk', 'Lunch lasted eleven minutes. Each army had one sandwich. It was a cheese sandwich.'], ['B', 'curious', 'desk', 'Sir, I can report that the sandwiches were also very boring.'], ['A', 'serious', 'desk', 'Thank you, Ian. That is exactly what our viewers expect.'], ['C', 'warm', 'desk', 'I would like to add that nobody cried, nobody cheered, and nobody even yawned.'], ['A', 'serious', 'desk', 'A calm day in the boring war. Back to the desk.']],
    [['A', 'serious', 'desk', 'Breaking, but not very breaking: news from the really boring war.'], ['A', 'serious', 'desk', 'General Left Sock has written a letter to General Right Sock. The letter says: hello.'], ['B', 'curious', 'desk', 'Sir, the reply has arrived. It says: hello.'], ['A', 'serious', 'desk', 'Thank you, Ian. Both generals say they are very pleased with the exchange.'], ['C', 'warm', 'desk', 'A third letter is expected next week. Possibly it will say: how are you.'], ['A', 'serious', 'desk', 'We will remain at this desk until further notice.']],
  ];
  function newsPrograms() {
    const day = (typeof playTimeSeconds !== 'undefined' ? Math.floor(playTimeSeconds / (DAYMS / 1000)) + 1 : 1), real = CINEMA_MOVIES.filter(m => !m.tv), latest = real[real.length - 1], ps = products(), prod = ps[Math.floor(Math.random() * ps.length)];
    const cast = C3(['Anchor Ava', 'hero', 'wise'], ['Reporter Rex', 'detective', 'goof'], ['Weather Wendy', 'wizard', 'sweet']);
    const shuffled = NEWS.slice().sort(() => Math.random() - .5), s1 = shuffled[0], s2 = shuffled[1], s3 = shuffled[2], w = WEATHER[Math.floor(Math.random() * WEATHER.length)];
    const hours = new Date().getHours(), greet = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';
    const part1 = program('📰 EXPLOX NEWS', 'Explox News Tonight', 'News Desk', cast, [
      S('cityhall', 'day', 'trophy', 'Explox News Tonight, live from City Hall.', [L('A', 'excited', 'talk', greet + ', Explox! It is Explox Day ' + day + ', and this is Explox News Tonight.'), L('A', 'happy', 'talk', 'Our top story: ' + s1.head + '.'), L('A', 'curious', 'talk', 'Also tonight: ' + s2.head + '.'), L('C', 'happy', 'magic', 'And I will have the weather, with a sprinkle of magic.'), L('A', 'warm', 'talk', 'But first, our top story. Rex, over to you.')]),
      S(s1.place, 'day', s1.prop, 'Top story: ' + s1.head + '.', s1.lines.map(l => L(l[0], l[1], l[2], l[3]))),
      S('cityhall', 'day', 'trophy', 'Back at the studio.', [L('A', 'happy', 'talk', 'Thank you, Rex. We will be right back after these commercial messages.'), L('B', 'joy', 'highfive', 'Do not go anywhere, Explox!')]),
    ]);
    const part2 = program('📰 EXPLOX NEWS', 'Explox News Tonight', 'News Desk', cast, [
      S('cityhall', 'day', 'trophy', 'Welcome back to Explox News.', [L('A', 'happy', 'talk', 'Welcome back to Explox News Tonight.'), L('A', 'excited', 'talk', 'Breaking: a brand-new movie just opened at Explox Cinemas. It is called ' + (latest ? latest.title : 'a surprise') + '!'), L('B', 'excited', 'photo', 'Ava, I am outside the cinema, and the line goes around the block!'), L('A', 'curious', 'talk', 'Is it worth the tickets, Rex?'), L('B', 'joy', 'party', 'Everyone leaving is smiling. I give it five popcorns out of five!')]),
      S(s2.place, 'day', s2.prop, 'Next story: ' + s2.head + '.', s2.lines.map(l => L(l[0], l[1], l[2], l[3]))),
      S('market', 'day', 'coins', 'On the shopping beat.', [L('A', 'curious', 'talk', 'In shopping news, Rex has been checking the stores.'), L('B', 'excited', 'shop', 'That is right, Ava! Today, ' + prod.name + ' is at ' + prod.store + ' for only ' + fmt(prod.price) + ' S.I.P.!'), L('A', 'surprised', 'talk', 'That is a great price!'), L('B', 'joy', 'shop', 'And the stores are open all day. Go and see for yourself!'), L('A', 'warm', 'talk', 'Thank you, Rex. Now, the weather.')]),
      S('park', 'day', 'sun', 'The weather with Wendy.', [L('C', 'happy', w[2], 'Hello, Explox! Here is your forecast. It will be ' + w[0] + ' today.'), L('C', 'warm', 'magic', w[1]), L('A', 'happy', 'talk', 'Thank you, Wendy. A little magic always helps.'), L('C', 'joy', 'magic', 'My pleasure, Ava!')]),
    ]);
    const part3 = program('📰 EXPLOX NEWS', 'Explox News Tonight', 'News Desk', cast, [
      S(s3.place, 'day', s3.prop, 'One more story: ' + s3.head + '.', s3.lines.map(l => L(l[0], l[1], l[2], l[3]))),
      S('cityhall', 'day', 'book', 'The really boring war.', WAR[Math.floor(Math.random() * WAR.length)].map(l => L(l[0], l[1], l[2], l[3]))),
      S('cityhall', 'dusk', 'trophy', 'That is all for tonight.', [L('A', 'warm', 'talk', 'That is all for tonight on Explox News.'), L('B', 'happy', 'talk', 'Stay curious, Explox, and be kind to your neighbors.'), L('C', 'joy', 'magic', 'Sweet dreams, everyone!'), L('A', 'joy', 'party', 'Good night, Explox!')]),
    ]);
    const tick = 'EXPLOX NEWS  \u2022  ' + s1.head + '  \u2022  ' + s2.head + '  \u2022  ' + s3.head + '  \u2022  the really boring war continues, but nothing is happening  \u2022  ' + prod.name + ' only ' + fmt(prod.price) + ' S.I.P. at ' + prod.store + '  \u2022  ';
    [part1, part2, part3].forEach(i => { CINEMA_MOVIES[i].ticker = tick; });
    return [part1, 'ad2', part2, 'ad2', part3];
  }

  // ── fun videos ────────────────────────────────────────────────────────────
  const FUN = [
    { title: 'Dancing Robots Go Wild', tag: '😂 FUN VIDEO', cast: C3(['Beep', 'robot', 'goof'], ['Boop', 'robot', 'sweet'], ['Clank', 'robot', 'rival']), place: 'city', prop: 'bolt', lines: [['N', 'excited', 'dance', 'Watch what happens when three robots hear their favorite song.'], ['A', 'joy', 'dance', 'Beep beep boop! Dance mode activated!'], ['B', 'joy', 'dance', 'Boop boop beep! My gears are grooving!'], ['C', 'surprised', 'drum', 'Clank! I only know the robot dance. Is that okay?'], ['A', 'joy', 'spinning', 'Everybody spin! Faster! Faster!'], ['B', 'shocked', 'panic', 'Whoa, I am dizzy! My head is spinning off!'], ['C', 'joy', 'highfive', 'Clank clank! Best dance party ever!']] },
    { title: 'Cat vs. the Laser Dot', tag: '😂 FUN VIDEO', cast: C3(['Mittens', 'cat', 'goof'], ['Whiskers', 'cat', 'nervous'], ['Professor Fluff', 'cat', 'wise']), place: 'house', prop: 'lantern', lines: [['N', 'curious', 'look', 'Every cat has one enemy: the little red dot.'], ['A', 'excited', 'jump', 'I see it! I will get it! Jump, jump, jump!'], ['B', 'worried', 'run', 'It is moving! It is too fast! Meow!'], ['C', 'serious', 'look', 'Stay calm. The dot cannot be caught. I have tried for nine lives.'], ['A', 'shocked', 'jump', 'It went up the wall! Climb, climb!'], ['B', 'scared', 'panic', 'I fell off the sofa! Meeeow!'], ['C', 'warm', 'eat', 'Never mind the dot. Let us have a snack instead.']] },
    { title: 'Pizza Flip Fail', tag: '😂 FUN VIDEO', cast: C3(['Chef Gigi', 'grandma', 'sweet'], ['Beep-Boop', 'robot', 'goof'], ['Tommy Slice', 'hero', 'rival']), place: 'market', prop: 'pizza', lines: [['N', 'excited', 'cook', 'Today, the Pizza Flip Contest. Who can flip the highest?'], ['B', 'excited', 'cook', 'I will flip it to the ceiling! Three, two, one!'], ['N', 'surprised', 'juggle', 'Up went the pizza, round and round and round.'], ['B', 'shocked', 'look', 'Where did it go? Is it stuck in the lamp?'], ['A', 'happy', 'look', 'Look, dear. It landed on Tommy\'s head.'], ['C', 'surprised', 'panic', 'Hey! I am wearing a pizza hat! It is hot!'], ['A', 'joy', 'eat', 'Well, we cannot waste it. Everybody, grab a slice!']] },
    { title: 'Dino Hide and Seek', tag: '😂 FUN VIDEO', cast: C3(['Nugget', 'dino', 'goof'], ['Rex Jr.', 'dino', 'nervous'], ['Mama Rex', 'dino', 'sweet']), place: 'park', prop: 'tree', lines: [['N', 'curious', 'sneak', 'The little dinosaurs are playing hide and seek in the park.'], ['A', 'happy', 'sneak', 'Ready or not, here I come! One, two, three...'], ['B', 'worried', 'sneak', 'Shh. I will hide behind this tiny tree. Nobody will see me.'], ['A', 'surprised', 'look', 'I see a big green tail sticking out of the little tree!'], ['B', 'shocked', 'panic', 'Oh no! My tail always gives me away!'], ['C', 'warm', 'play', 'Come out, my darlings. It is time for dinner.'], ['A', 'joy', 'eat', 'Dinner! Race you home, Rex Jr.!']] },
    { title: 'The Great Bubble Day', tag: '😂 FUN VIDEO', cast: C3(['Bubbles', 'hero', 'sweet'], ['Pop', 'robot', 'goof'], ['Giggles', 'ghost', 'nervous']), place: 'park', prop: 'sun', lines: [['N', 'joy', 'bubbles', 'It was a perfect day for blowing bubbles.'], ['A', 'joy', 'bubbles', 'Look at mine! It is as big as a balloon!'], ['B', 'excited', 'bubbles', 'Mine has a smaller bubble inside! A bubble family!'], ['C', 'surprised', 'look', 'Oh look! A bubble is carrying a leaf.'], ['A', 'happy', 'jump', 'Pop them all! Jump, jump, pop pop pop!'], ['B', 'joy', 'dance', 'Pop, pop, pop! Dancing bubbles everywhere!'], ['C', 'joy', 'party', 'Whoooo! Bubble party!']] },
    { title: 'Trampoline Chaos', tag: '😂 FUN VIDEO', cast: C3(['Zippy', 'racer', 'hero'], ['Bouncy Betty', 'grandma', 'goof'], ['Sir Hops-a-Lot', 'king', 'rival']), place: 'park', prop: 'tree', lines: [['N', 'excited', 'jump', 'The new trampoline park opened today, and the whole town came to jump.'], ['A', 'joy', 'jump', 'Boing boing boing! Higher! Higher!'], ['B', 'joy', 'jump', 'Wheee! I have not jumped this high since I was ninety!'], ['C', 'shocked', 'panic', 'My crown! My crown flew off! Where did my crown go?'], ['A', 'surprised', 'look', 'Look, it landed on the roof!'], ['B', 'excited', 'climb', 'I will get it! Hold my cookies!'], ['C', 'joy', 'highfive', 'Thank you, Betty! You are the bounciest grandma ever!']] },
    { title: 'Ghost Gets the Hiccups', tag: '😂 FUN VIDEO', cast: C3(['Boo-Boo', 'ghost', 'nervous'], ['Chef Gigi', 'grandma', 'wise'], ['Beep-Boop', 'robot', 'goof']), place: 'house', prop: 'lantern', lines: [['N', 'curious', 'look', 'Boo-Boo the ghost woke up with the worst hiccups of his life.'], ['A', 'worried', 'panic', 'Hic! Oh no! Hic! Every hic makes me jump!'], ['B', 'warm', 'cook', 'Drink a glass of water slowly, dear.'], ['C', 'excited', 'jump', 'I know! I will scare you! Boo!'], ['A', 'surprised', 'look', 'Scare me? I am the ghost. Hic!'], ['C', 'worried', 'talk', 'Oops. Wrong cure. Let me think again.'], ['B', 'joy', 'party', 'Look, the hiccups are gone. Sometimes laughing is the best cure!']] },
    { title: 'Snowball Surprise', tag: '😂 FUN VIDEO', cast: C3(['Flurry', 'hero', 'hero'], ['Mittens', 'cat', 'goof'], ['Professor Pip', 'wizard', 'wise']), place: 'snow', prop: 'tree', lines: [['N', 'joy', 'snowball', 'It was the first snowfall of the year in Explox, and everyone ran outside.'], ['A', 'excited', 'snowball', 'Snowball fight! Mittens, you are on my team!'], ['B', 'joy', 'snowball', 'Take that, Professor! Sneak attack!'], ['C', 'surprised', 'magic', 'Oh my! Hold on, I will turn the snow into confetti!'], ['N', 'surprised', 'magic', 'Poof! The snowballs became rainbow confetti.'], ['A', 'joy', 'party', 'Whoa! Confetti snowballs! That is the best idea ever!'], ['B', 'joy', 'dance', 'Everybody throw some! Confetti party!']] },
  ];
  function funProgram(v) {
    return program(v.tag, v.title, 'Fun Voice', v.cast, [S(v.place, 'day', v.prop, v.title + '.', v.lines.map(l => L(l[0], l[1], l[2], l[3]))), S(v.place, 'day', v.prop, 'And that is the end of the video.', [L('A', 'joy', 'highfive', 'Thank you for watching, Explox!'), L('B', 'joy', 'party', 'Like, share and have a great day!')])]);
  }
  function funBlock(n) { const out = [], pool = FUN.slice().sort(() => Math.random() - .5); for (let i = 0; i < n; i++) { out.push(funProgram(pool[i % pool.length])); if (i % 2 === 1 && i < n - 1) out.push('ad2'); } return out; }
  // ── ⚽ Soccer: Explox FC against teams from cities around the world. Real human players, fouls, penalties; every match is different and Explox does not always win ──
  const CITIES = [['Paris', 'Poodles', 0x1e88e5], ['Tokyo', 'Tigers', 0xff7043], ['Rio', 'Rockets', 0xfdd835], ['London', 'Lions', 0x8e24aa], ['Cairo', 'Cobras', 0x43a047], ['Sydney', 'Seagulls', 0x26c6da], ['Berlin', 'Bears', 0x6d4c41], ['Madrid', 'Mustangs', 0xd81b60], ['Rome', 'Roosters', 0xef6c00], ['Moscow', 'Moose', 0x546e7a], ['Delhi', 'Dragons', 0xc62828], ['Lima', 'Llamas', 0x7cb342], ['Oslo', 'Otters', 0x00acc1], ['Toronto', 'Turtles', 0x2e7d32], ['Seoul', 'Sharks', 0x3949ab], ['Dubai', 'Dolphins', 0x00897b], ['Lagos', 'Leopards', 0xf9a825], ['Athens', 'Owls', 0x5e35b1], ['Lisbon', 'Lynx', 0xe64a19], ['Vienna', 'Vikings', 0x78909c], ['Mexico City', 'Monkeys', 0xad1457], ['Nairobi', 'Nightingales', 0x558b2f], ['Bangkok', 'Butterflies', 0xec407a], ['Havana', 'Hummingbirds', 0x039be5]];
  const FIRST = ['Marco', 'Luca', 'Ben', 'Sam', 'Noah', 'Leo', 'Omar', 'Kai', 'Ravi', 'Tom', 'Eli', 'Jon', 'Max', 'Aiden', 'Hugo', 'Yuki', 'Ali', 'Pablo', 'Dan', 'Ivan', 'Theo', 'Jonas', 'Felix', 'Nico', 'Andre', 'Sven', 'Tariq', 'Mateo'], LAST = ['Ruiz', 'Stone', 'Park', 'Silva', 'Khan', 'Brooks', 'Rossi', 'Novak', 'Tanaka', 'Costa', 'Meyer', 'Dubois', 'Cole', 'Berg', 'Moreno', 'Lund', 'Okoye', 'Reyes', 'Hart', 'Vega', 'Frost', 'Ward', 'Diaz', 'Hale'];
  const rnd = (n) => Math.floor(Math.random() * n), pk = (a) => a[rnd(a.length)];
  function names11() { const out = []; while (out.length < 11) { const n = pk(FIRST) + ' ' + pk(LAST); if (out.indexOf(n) < 0) out.push(n); } return out; }
  function soccerMatch() {
    const city = pk(CITIES), opp = city[0] + ' ' + city[1], exN = names11(), opN = names11(), oppName = city[0].toUpperCase();
    let eg = pk([0, 1, 1, 1, 2, 2, 3, 4]), og = pk([0, 1, 1, 1, 2, 2, 3, 4]); while (eg + og > 6) { if (eg > og) eg--; else og--; }
    const plays = [], goalPlay = (att) => { const r = Math.random(); return r < .15 ? { att: att, type: 'penalty', result: 'goal' } : r < .3 ? { att: att, type: 'corner', result: 'goal' } : r < .42 ? { att: att, type: 'freekick', result: 'goal' } : r < .6 ? { att: att, type: 'trick' } : { att: att, type: 'goal' }; };
    for (let i = 0; i < eg; i++) plays.push(goalPlay('ex')); for (let i = 0; i < og; i++) plays.push(goalPlay('opp'));
    while (plays.length < 6) { const att = Math.random() < .5 ? 'ex' : 'opp', ty = pk(['save', 'miss', 'tackle', 'foul', 'penalty', 'brawl', 'brawl', 'scuffle', 'throwin', 'throwin', 'throwin', 'corner', 'corner', 'goalkick', 'goalkick', 'freekick', 'offside', 'offside', 'injury']); plays.push(ty === 'penalty' ? { att: att, type: 'penalty', result: pk(['save', 'save', 'miss', 'post']) } : ty === 'corner' ? { att: att, type: 'corner', result: pk(['save', 'miss', 'post', 'save']) } : ty === 'freekick' ? { att: att, type: 'freekick', result: pk(['save', 'miss', 'miss']) } : { att: att, type: ty, red: ty === 'foul' && Math.random() < .2 }); }
    plays.sort(() => Math.random() - .5);
    const mins = [8, 19, 31, 52, 67, 81].map(x => x + rnd(5)); let a = 0, b = 0;
    const cast = C3(['Commentator', 'hero', 'wise'], ['Referee', 'hero', 'wise'], ['Analyst', 'hero', 'wise']);
    const mk = (type, att, before, after, min, say, lines, cue, extra) => { const sc = S('park', 'day', 'trophy', say, lines.map(l => L('N', l[0], 'soccer', l[1]))); sc.script.soccer = Object.assign({ type: type, att: att, opp: oppName, col: city[2], before: before.slice(), after: after.slice(), min: min, cue: cue }, extra || {}); return sc; };
    const scenes = [mk('kickoff', 'ex', [0, 0], [0, 0], 1, 'Welcome to Explox Stadium.', [
      ['excited', 'Welcome to Explox Stadium! Today, Explox FC plays the ' + opp + '.'],
      ['joy', 'The stands are packed, the weather is perfect, and the players are walking out.'],
      ['excited', 'The referee blows the whistle, and the match begins!']], 2)];
    plays.forEach((pl, i) => {
      const before = [a, b], resType = (pl.type === 'penalty' || pl.type === 'corner' || pl.type === 'freekick') ? pl.result : pl.type, goal = resType === 'goal' || resType === 'trick'; if (goal) { if (pl.att === 'ex') a++; else b++; } const after = [a, b], min = mins[i];
      const atkN = pl.att === 'ex' ? exN : opN, defN = pl.att === 'ex' ? opN : exN, team = pl.att === 'ex' ? 'Explox' : 'the ' + opp, p1 = atkN[0], p2 = atkN[1], p3 = atkN[2], keeper = defN[10], defName = defN[1], score = 'Explox ' + a + ', ' + city[1] + ' ' + b + '.';
      let lines;
      if (pl.type === 'penalty') lines = [['serious', 'Penalty! The referee points to the spot.'], ['worried', p3 + ' steps up. The whole stadium holds its breath.'], ['excited', 'He shoots!'], [resType === 'goal' ? 'joy' : 'shocked', resType === 'goal' ? 'Goal! ' + p3 + ' scores from the spot!' : resType === 'save' ? keeper + ' saves the penalty!' : resType === 'post' ? 'It hits the post!' : 'Over the bar!'], ['warm', score]];
      else if (pl.type === 'foul') lines = [['excited', 'The ' + min + 'th minute. ' + team + ' on the attack.'], ['excited', p1 + ' to ' + p2 + ', and ' + p3 + ' runs forward.'], ['shocked', 'Oh! ' + defName + ' brings him down!'], ['serious', 'The referee blows the whistle. ' + (pl.red ? 'Red' : 'Yellow') + ' card for ' + defName + '.'], ['warm', score]];
      else if (pl.type === 'throwin') lines = [['excited', 'The ' + min + 'th minute. ' + team + ' on the attack.'], ['excited', p1 + ' to ' + p2 + ', and the defender clears it...'], ['surprised', 'It goes out of play!'], ['warm', 'Throw-in for ' + team + '. ' + p2 + ' picks up the ball.'], ['excited', p2 + ' throws it in quickly to ' + p1 + '.'], ['warm', score]];
      else if (pl.type === 'goalkick') lines = [['excited', 'The ' + min + 'th minute. ' + team + ' on the attack.'], ['excited', p1 + ' to ' + p2 + ', and ' + p3 + ' lets fly!'], ['surprised', 'It sails wide, and goes out behind the goal!'], ['warm', 'Goal kick. ' + keeper + ' sends it long.'], ['excited', 'A big kick up the pitch, and the game restarts!'], ['warm', score]];
      else if (pl.type === 'offside') lines = [['excited', 'The ' + min + 'th minute. ' + team + ' on the attack.'], ['excited', p1 + ' to ' + p2 + ', and now to ' + p3 + '!'], ['shocked', p3 + ' shoots, and it is in the net!'], ['serious', 'But wait! The flag is up. Offside!'], ['warm', 'No goal. The referee waves it off.'], ['warm', score]];
      else if (pl.type === 'injury') lines = [['excited', 'The ' + min + 'th minute. ' + team + ' on the attack.'], ['excited', p1 + ' to ' + p2 + ', and ' + p3 + ' runs forward.'], ['worried', 'Oh no! ' + p3 + ' is down on the ground.'], ['serious', 'The referee stops the game, and the medic runs on to help.'], ['relieved', p3 + ' gets up and walks off with a thumbs up. Good news.'], ['warm', score]];
      else if (pl.type === 'corner') lines = [['excited', 'The ' + min + 'th minute. ' + team + ' on the attack.'], ['excited', p1 + ' to ' + p2 + ', and ' + p3 + ' shoots!'], ['surprised', 'It is blocked, and goes behind for a corner!'], ['warm', 'Corner kick for ' + team + '. ' + p3 + ' takes it.'], [resType === 'goal' ? 'joy' : 'shocked', resType === 'goal' ? 'The cross comes in... ' + p1 + ' heads it in! Goal for ' + team + '!' : resType === 'save' ? 'The cross comes in... ' + p1 + ' heads it, and ' + keeper + ' saves it!' : resType === 'post' ? 'The cross comes in... and it hits the post!' : 'The cross comes in... and it goes over the bar!'], ['warm', score]];
      else if (pl.type === 'freekick') lines = [['excited', 'The ' + min + 'th minute. ' + team + ' on the attack.'], ['excited', p1 + ' to ' + p2 + ', and ' + p3 + ' is brought down!'], ['serious', 'Free kick for ' + team + ', just outside the box.'], ['excited', p3 + ' takes it, over the wall...'], [resType === 'goal' ? 'joy' : 'shocked', resType === 'goal' ? 'Goal! A beautiful free kick by ' + p3 + '!' : resType === 'save' ? keeper + ' dives and saves it!' : 'It goes over the bar!'], ['warm', score]];
      else if (pl.type === 'brawl' || pl.type === 'scuffle') lines = [['excited', 'The ' + min + 'th minute. ' + team + ' on the attack.'], ['excited', p1 + ' to ' + p2 + ', and ' + p3 + ' runs forward.'], ['shocked', 'Oh! ' + defName + ' brings him down, and the players are angry!'], ['shocked', pl.type === 'brawl' ? 'Oh no! A big fight breaks out on the pitch! Both teams are running in!' : 'A scuffle! ' + p3 + ' and ' + defName + ' are pushing each other!'], ['serious', 'The referee blows the whistle and shows red cards to ' + defName + ' and ' + p3 + '.'], ['warm', score]];
      else if (pl.type === 'tackle') lines = [['excited', 'The ' + min + 'th minute. ' + team + ' on the attack.'], ['excited', p1 + ' to ' + p2 + ', and ' + p3 + ' has the ball.'], ['surprised', defName + ' slides in...'], ['excited', 'Great tackle! ' + defName + ' wins the ball!'], ['warm', score]];
      else lines = [['excited', 'The ' + min + 'th minute. ' + team + ' on the attack.'], ['excited', p1 + ' to ' + p2 + ', and now to ' + p3 + '!'], [pl.type === 'trick' ? 'excited' : 'excited', pl.type === 'trick' ? p3 + ' goes for a bicycle kick!' : p3 + ' shoots!'], [goal ? 'joy' : 'shocked', pl.type === 'trick' ? 'What a goal! Unbelievable!' : resType === 'goal' ? 'Goal! ' + p3 + ' scores for ' + team + '!' : resType === 'save' ? keeper + ' makes the save!' : resType === 'post' ? 'It hits the post!' : 'Over the bar!'], ['warm', score]];
      scenes.push(mk(pl.type, pl.att, before, after, min, 'Minute ' + min + '.', lines, 2, { result: pl.result, red: pl.red }));
    });
    const res = a > b ? 'Explox wins!' : a === b ? 'It ends in a draw.' : 'The ' + city[1] + ' win this time.';
    scenes.push(mk('final', 'ex', [a, b], [a, b], 90, 'Full time.', [
      ['excited', 'The final whistle! The final score: Explox ' + a + ', the ' + opp + ' ' + b + '.'],
      [a > b ? 'joy' : a === b ? 'warm' : 'sad', res],
      ['warm', 'The players shake hands. What a match!']], 2));
    return program('\u26BD SOCCER', 'Explox vs ' + opp, 'Match Commentator', cast, scenes);
  }
  function soccerBlock(n) { const out = []; for (let i = 0; i < n; i++) { out.push(soccerMatch()); if (i < n - 1) out.push('ad2'); } return out; }
  // ── ⚔️ Fights: any fight you can imagine, from 10 to 1000 fighters a side, with bombs. A cartoon: knocked-out fighters tumble away and go poof, nothing bloody ──
  const FTEAMS = [['Explox Knights', 0xe53935, 0xf5c89a], ['Rival Robots', 0x90a4ae, 0xb0bec5], ['Dino Herd', 0x43a047, 0x66bb6a], ['Ninja Clan', 0x212121, 0x424242], ['Pirate Crew', 0x6d4c41, 0xf5c89a], ['Alien Fleet', 0x7e57c2, 0x9ccc65], ['Viking Raiders', 0x1e88e5, 0xffe0bd], ['Cowboy Gang', 0xff8f00, 0xd4956a], ['Wizard Guild', 0x8e24aa, 0xf5c89a], ['Chef Brigade', 0xffffff, 0xffe0bd], ['Penguin Platoon', 0x263238, 0xffffff], ['Pizza Pals', 0xf9a825, 0xf5c89a], ['Bunny Battalion', 0xf48fb1, 0xfce4ec], ['Cave Clan', 0x8d6e63, 0xd4956a], ['Jelly Army', 0x00bcd4, 0x80deea], ['Cactus Crew', 0x2e7d32, 0x81c784]];
  const FWEAP = [['swords', 0xcfd8dc, 1.7, .16, null], ['pies', 0xfff3c4, .6, .5, 'pies'], ['snowballs', 0xffffff, .3, .3, 'snow'], ['pillows', 0xffffff, .9, .8, null], ['water balloons', 0x4fc3f7, .5, .5, 'water'], ['boxing gloves', 0xe53935, .7, .6, null], ['bombs', 0x212121, .8, .5, null], ['big sticks', 0x8d6e3f, 1.6, .14, null], ['rubber hammers', 0xffd54f, 1.1, .35, null]];
  function fightMatch() {
    const r = Math.random(), kind = r < .7 ? 'war' : r < .85 ? 'royale' : 'giants', ta = pk(FTEAMS); let tb = pk(FTEAMS); while (tb === ta) tb = pk(FTEAMS);
    const n = kind === 'royale' ? pk([50, 100, 300, 500, 1000]) : kind === 'giants' ? pk([50, 100, 200]) : pk([10, 30, 50, 100, 200, 300, 500, 750, 1000, 1000]), w = pk(FWEAP), win = rnd(2), nm = kind === 'royale' ? '' : '';
    const SO = { kind: kind, n1: n, n2: n, name1: ta[0], name2: tb[0], cols: [ta[1], tb[1]], heads: [ta[2], tb[2]], weapon: w[0], wcol: w[1], wlen: w[2], wthick: w[3], proj: w[4], win: win, survivors: Math.max(1, Math.round(n * (n > 200 ? .08 : .2))), bombs: w[0] === 'bombs' ? 6 + rnd(5) : rnd(5), giants: kind === 'giants', seed: 1 + rnd(99999), ground: pk([0x6b8e3a, 0x7a9a4a, 0xa89a6a, 0x5f7d3a]) };
    if (SO.weapon === 'snowballs') SO.ground = 0xe8f0f8;
    const winner = kind === 'royale' ? 'the last fighter' : 'the ' + (win ? tb[0] : ta[0]), title = kind === 'royale' ? 'Battle Royale: ' + n + ' Fighters' : kind === 'giants' ? 'Giants Clash: ' + ta[0] + ' vs ' + tb[0] : n + ' vs ' + n + ': ' + ta[0] + ' vs ' + tb[0];
    const lines = kind === 'royale'
      ? [['excited', 'Tonight, the ultimate fight! ' + n + ' fighters, all against all, and only one will be left standing!'], ['joy', 'It is a big cartoon battle with ' + w[0] + ', so everybody who is knocked out just tumbles away and goes poof.'], ['excited', 'The fighters rush into the middle!'], ['shocked', 'It is chaos! Fighters are flying in every direction!'], [SO.bombs ? 'excited' : 'surprised', SO.bombs ? 'Here come the bombs! BOOM! A whole group is blasted out of the arena!' : 'Hundreds of fighters have been knocked out already!'], ['worried', 'Half of the fighters are out of the game!'], ['serious', 'Only a few are left now. Who will be the champion?'], ['joy', 'We have a winner! The last fighter standing! What a battle!']]
      : [['excited', 'Tonight, the biggest fight in Explox history! ' + n + ' ' + ta[0] + ' against ' + n + ' ' + tb[0] + '!'], ['joy', 'They are fighting with ' + w[0] + '. It is a cartoon battle, so everybody who is knocked out just tumbles away and goes poof.'], ['excited', 'Both armies charge!'], ['shocked', 'They crash together in the middle! Fighters are flying everywhere!'], [SO.bombs ? 'excited' : 'surprised', SO.bombs ? 'Here come the bombs! BOOM! A whole group of fighters flies away!' : 'Hundreds of fighters are knocked out already!'], ['worried', 'Half of them are already out of the game!'], ['serious', 'The ' + (win ? tb[0] : ta[0]) + ' are winning!'], ['joy', 'And ' + winner + ' win the battle! What a fight!']];
    if (kind === 'giants') lines.splice(3, 0, ['shocked', 'Wait! Two giants have joined the fight, and the ground is shaking!']);
    const sc = S('park', 'day', 'trophy', 'The big battle.', lines.map(l => L('N', l[0], 'battle', l[1]))); sc.script.battle = SO;
    return program('\u2694\uFE0F FIGHTS', title, 'Battle Commentator', C3(['Commentator', 'hero', 'wise'], ['Referee', 'hero', 'wise'], ['Analyst', 'hero', 'wise']), [sc]);
  }
  function fightBlock(n) { const out = []; for (let i = 0; i < n; i++) { out.push(fightMatch()); if (i < n - 1) out.push('ad2'); } return out; }
  // ── 📺 TV SHOWS: 20 action series, 50 episodes each, every episode a different story, with a title sequence and a theme tune ──
  const SHOWS = [
    ['Turbo Heroes', '\uD83C\uDFCE\uFE0F', '#ff5722', 'drive', 'track', 'racer', 'Zippy Zed', 'Nitro Nate', 'racer', ['Baron Rustbucket', 'Captain Smog', 'Dr. Gearshift', 'Lord Slowpoke', 'The Oil Slick'], 'Wheels up!'],
    ['Dino Rangers', '\uD83E\uDD96', '#43a047', 'run', 'nature', 'dino', 'Ranger Rex', 'Nugget', 'dino', ['Professor Meteor', 'The Egg Thief', 'Mister Asteroid', 'Lady Fossil', 'The Bone Baron'], 'Roar for justice!'],
    ['Robot Squad', '\uD83E\uDD16', '#90a4ae', 'fly', 'scrapyard', 'robot', 'Beep-Boop', 'Clank', 'robot', ['Dr. Rust', 'General Glitch', 'The Virus Queen', 'Mister Magnet', 'Captain Static'], 'Systems online!'],
    ['Ninja Academy', '\uD83E\uDD77', '#37474f', 'climb', 'dojo', 'ninja', 'Shadow Sam', 'Flip', 'ninja', ['Master Gloom', 'The Noodle Ninja', 'Lord Lantern', 'Iron Fan', 'Madame Mist'], 'Silent and swift!'],
    ['Sky Pilots', '\u2708\uFE0F', '#29b6f6', 'fly', 'airport', 'pilot', 'Captain Zip', 'Wingman Walt', 'pilot', ['Baron Cloud', 'The Storm Crow', 'Dr. Turbulence', 'Admiral Fog', 'Lord Lightning'], 'Up, up and away!'],
    ['Space Patrol', '\uD83D\uDE80', '#7e57c2', 'fly', 'space', 'alien', 'Commander Nova', 'Orbit', 'robot', ['Emperor Void', 'The Comet Bandit', 'Queen Black Hole', 'General Gravity', 'Captain Crater'], 'To infinity!'],
    ['Pirate Rescue', '\uD83C\uDFF4\u200D\u2620\uFE0F', '#8d6e63', 'fish', 'beach', 'hero', 'Captain Mabel', 'Cookie', 'hero', ['Captain Seagull', 'The Kraken Kid', 'Lady Anchor', 'Mister Mast', 'Blackbeard Jr.'], 'Sail for glory!'],
    ['Super Chefs', '\uD83D\uDC68\u200D\uD83C\uDF73', '#ffb300', 'cook', 'house', 'grandma', 'Chef Gigi', 'Whisk', 'robot', ['The Burnt Toast', 'Baron Bland', 'Lady Lump', 'Dr. Dough', 'The Salt Shaker'], 'Heat it up!'],
    ['Monster Busters', '\uD83D\uDC7B', '#8e24aa', 'sneak', 'library', 'ghost', 'Boo-Boo', 'Gus', 'ghost', ['Count Grumble', 'The Slime King', 'Madame Moan', 'Mister Mold', 'Lord Lumpy'], 'Who you gonna call?'],
    ['Treasure Hunters', '\uD83D\uDDFA\uFE0F', '#fbc02d', 'dig', 'nature', 'pioneer', 'Camper Cleo', 'Whiskers', 'cat', ['Baron Bagsley', 'The Map Thief', 'Captain Coin', 'Lady Loot', 'Doctor Dig'], 'X marks the spot!'],
    ['Cyber City Cops', '\uD83D\uDE93', '#1e88e5', 'drive', 'city', 'detective', 'Detective Dash', 'Officer Beep', 'robot', ['The Hacker', 'Mister Mayhem', 'Baron Bytes', 'Madame Malware', 'Captain Crash'], 'Serve and protect!'],
    ['Jungle Explorers', '\uD83C\uDF34', '#2e7d32', 'climb', 'jungle', 'hero', 'Jungle Jo', 'Banana', 'dino', ['The Vine King', 'Lady Leech', 'Doctor Drizzle', 'Mister Mud', 'The Swamp Boss'], 'Into the wild!'],
    ['Arctic Rescue', '\uD83D\uDC27', '#4dd0e1', 'skate', 'snow', 'hero', 'Flurry', 'Mittens', 'cat', ['The Ice Queen', 'Lord Frostbite', 'Mister Slush', 'Captain Chill', 'Doctor Blizzard'], 'Stay frosty!'],
    ['Wizard Wars', '\uD83E\uDDD9', '#6a1b9a', 'magic', 'castle', 'wizard', 'Professor Pip', 'Sparkle', 'wizard', ['The Dark Duster', 'Lord Hex', 'Madame Mirage', 'Mister Mix-up', 'The Spell Spoiler'], 'Magic never sleeps!'],
    ['Kung Fu Kitchen', '\uD83E\uDD4B', '#d84315', 'cook', 'market', 'ninja', 'Master Wok', 'Little Dumpling', 'hero', ['Chef Chaos', 'The Soup Snake', 'Lady Ladle', 'Baron Burnt', 'Iron Spatula'], 'Kick it up!'],
    ['Hover Racers', '\uD83D\uDEF8', '#00bcd4', 'fly', 'track', 'racer', 'Turbo Tina', 'Zoom', 'robot', ['Lord Lag', 'The Speed Thief', 'Dr. Drag', 'Captain Crawl', 'Madame Mirage'], 'Full throttle!'],
    ['Giant Robot Defenders', '\uD83E\uDDBE', '#607d8b', 'run', 'city', 'robot', 'Titan', 'Tiny', 'hero', ['Mega Meteor', 'The Rust Beast', 'General Gear', 'Dr. Doom-Doom', 'King Kaboom'], 'Defend the city!'],
    ['Secret Agents Kids', '\uD83D\uDD76\uFE0F', '#455a64', 'sneak', 'city', 'hero', 'Agent Alex', 'Agent Ace', 'hero', ['Doctor Doodle', 'The Gadget Goblin', 'Madame Mystery', 'Mister Mask', 'Baron Blunder'], 'Mission accepted!'],
    ['Sea Squad', '\uD83D\uDC2C', '#0288d1', 'fish', 'beach', 'hero', 'Skipper Sam', 'Bubbles', 'cat', ['Captain Clam', 'The Octopus Boss', 'Lady Lagoon', 'Mister Murk', 'Admiral Algae'], 'Dive in!'],
    ['Thunder Knights', '\uD83D\uDEE1\uFE0F', '#c62828', 'run', 'castle', 'king', 'Sir Bolt', 'Squire Sparks', 'hero', ['The Shadow Baron', 'Dragon Lord Drak', 'Lady Gloom', 'Sir Rotten', 'The Storm Wizard'], 'For the kingdom!'],
    ['Time Travelers', '⏳', '#ab47bc', 'run', 'castle', 'hero', 'Tempo Tess', 'Tock', 'robot', ['Lord Yesterday', 'Madame Later', 'The Clock Crow', 'Mister Meanwhile', 'Captain Tick-Tock'], 'Any time, any place!'],
    ['Skate Squad', '🛹', '#ff7043', 'skate', 'park', 'hero', 'Kickflip Kai', 'Rail', 'dino', ['Baron Bail', 'The Pothole', 'Lady Wipeout', 'Mister Grind', 'Doctor Dropout'], 'Roll with it!'],
    ['Dragon Riders', '🐲', '#00897b', 'fly', 'nature', 'wizard', 'Ember', 'Smokey', 'dino', ['The Frost Wyrm', 'Lord Lava', 'Madame Mist', 'Sir Soot', 'The Storm Drake'], 'Wings up!'],
    ['Mecha Pets', '🦾', '#7cb342', 'run', 'city', 'robot', 'Sparky', 'Bolt Jr', 'cat', ['Doctor Dogcatcher', 'The Fleabot', 'Lady Leash', 'Mister Mange', 'Baron Barkless'], 'Paws and power!'],
    ['Ghost Racers', '🏁', '#5c6bc0', 'drive', 'track', 'ghost', 'Phantom Phil', 'Spooky Sue', 'racer', ['Lord Lag', 'The Haunted Hubcap', 'Madame Mist', 'Count Crash', 'Mister Midnight'], 'Boo, then zoom!'],
    ['Cosmic Surfers', '🏄', '#26c6da', 'skate', 'space', 'alien', 'Surf Star', 'Wave', 'cat', ['Captain Comet', 'The Meteor Mob', 'Lady Gravity', 'Baron Black Hole', 'Doctor Dust'], 'Ride the stars!'],
    ['Volcano Rescue', '🌋', '#ef5350', 'climb', 'desert', 'hero', 'Captain Ash', 'Ember Jr', 'robot', ['Lord Lava', 'The Rock Slide', 'Madame Magma', 'Mister Smoke', 'Baron Boulder'], 'Hot rescue!'],
    ['Candy Kingdom Guards', '🍭', '#f06292', 'magic', 'castle', 'king', 'King Gumdrop', 'Sprinkles', 'wizard', ['The Sour Duke', 'Lady Licorice', 'Mister Melt', 'Baron Bitter', 'The Gobstopper'], 'Sweet justice!'],
    ['Storm Chasers', '⛈️', '#546e8a', 'drive', 'city', 'pilot', 'Captain Cloud', 'Drizzle', 'robot', ['Lord Thunder', 'The Gale', 'Madame Mist', 'Baron Blizzard', 'Doctor Drip'], 'Chase the sky!'],
    ['Glow Gang', '🔦', '#00e5ff', 'sneak', 'arena', 'hero', 'Neon Nia', 'Flash', 'dino', ['The Dim Duke', 'Lady Dark', 'Mister Murk', 'Baron Blackout', 'The Shadow Smudge'], 'Light it up!'],
  ];
  const PLANS = ['steal the Golden Pizza', 'turn the moon into cheese', 'fill the city with bubble gum', 'freeze the sun', 'shrink all the cars', 'make everybody sleepy', 'steal every sock in Explox', 'flood the park with soda', 'build a giant slide over the town', 'turn the river into jelly', 'make it rain spaghetti', 'switch off all the lights', 'steal the town clock', 'paint everything purple', 'take away all the trophies', 'tie every shoelace together', 'blow up a million balloons', 'hide the bank under a pile of hay', 'make all the dogs sing', 'steal the Explox sunshine', 'swap all the signs upside down', 'turn the school bus into a rocket', 'put the whole city on a conveyor belt', 'cover the town in glitter', 'make the wind blow backwards', 'steal all the pizza in the world', 'build a wall around the cinema', 'turn the ocean into soup', 'make the moon fall down', 'stop time for one whole minute'];
  const GADGETS = ['Turbo Boots', 'Bubble Blaster', 'Mega Magnet', 'Jet Backpack', 'Freeze Ray', 'Rocket Skates', 'Sticky Net', 'Super Shield', 'Echo Whistle', 'Hover Board', 'Grip Gloves', 'Laser Pointer', 'Pizza Cannon', 'Smoke Bombs', 'Spring Shoes', 'Thunder Hammer', 'Mini Drone', 'Glow Stick', 'Slime Launcher', 'Time Watch'];
  const ADJ = ['Golden', 'Frozen', 'Giant', 'Secret', 'Flying', 'Silent', 'Mighty', 'Crazy', 'Hidden', 'Lost', 'Sneaky', 'Electric', 'Cosmic', 'Stormy', 'Sparkly', 'Wobbly', 'Thunder', 'Midnight', 'Silver', 'Mega', 'Rocket', 'Turbo', 'Super', 'Mystery', 'Shadow'];
  const NOUN = ['Pizza', 'Moon', 'Robot', 'Bridge', 'Key', 'Storm', 'Treasure', 'Cannon', 'Mask', 'Crown', 'Map', 'Trap', 'Rocket', 'Bell', 'Tower', 'Egg', 'Engine', 'Clock', 'Shield', 'Comet', 'Garden', 'Diamond', 'Drum'];
  const TWISTS = [['Look! A secret door behind the poster!', 'It leads to the real hideout, and the whole plan was a decoy!'], ['Boss, my gadget is beeping at that crate!', 'The crate is empty. The villain stole nothing, and tricked us into leaving the city!'], ['I found a letter in the villain\'s pocket!', 'It says the villain only wanted to win a prize, and needs a friend!'], ['The villain\'s machine has a big red button.', 'It is not a weapon. It is a giant tickle machine, and everyone is laughing!'], ['A baby dragon is hiding behind the barrels!', 'The villain was only trying to find the lost baby dragon!'], ['The map is upside down!', 'The real treasure was on the other side of the town all along!'], ['Wait, that is not the villain. It is a robot copy!', 'The real villain is stuck in a lift on the top floor!'], ['The countdown clock says three seconds!', 'It is only a birthday party countdown, and the surprise is for us!']];
  const BRIEF = ['The heroes were relaxing at their secret base when the big alarm started to ring.', 'It was a quiet morning at headquarters, until the giant screen began to flash.', 'The team was eating breakfast when an emergency message popped up.', 'Training was almost over when the red phone started to buzz.'];
  const CLIFF = ['But in the shadows, a new villain was watching. To be continued.', 'But far away, a strange egg began to glow. To be continued.', 'But the mayor had one more secret mission. To be continued.', 'But a mysterious package had just arrived at the base. To be continued.', 'But somewhere in the dark, a robot opened its eyes. To be continued.'];
  const hsx = (a, b) => hs(String(a), String(b));
  function epTitle(si, ep) { return ADJ[(ep * 7 + si * 3) % ADJ.length] + ' ' + NOUN[(ep * 3 + si * 5) % NOUN.length]; }
  // line pools: the episode is built from many short scenes, so every episode runs 15+ minutes
  const POOLS = {
    aN: ['Dust and sparks filled the air!', 'The ground shook as the action rolled on!', 'Everything was happening at once!', 'Faster and faster, the action rolled along!', 'The heroes did not slow down for a second!', 'Everybody held their breath!', 'It was the most exciting moment of the whole season!', 'Right in front of them, the danger grew bigger!', 'Nobody knew who would win!', 'The air crackled with energy!', 'Time seemed to slow down for a second!', 'And then everything exploded into action!'],
    cN: ['Back at the {place}, everything was quiet, for now.', 'The sun was shining, but trouble was on the way.', 'The team caught their breath and looked around.', 'A gentle breeze blew across the {place}.', 'It was the calm before the next big storm.', 'The heroes were not afraid, because they had each other.', 'Everyone knew that {V} was still out there.', 'The clock was ticking, and time was running out.', 'The mission was far from over.', 'Something strange was in the air.', 'The team gathered close to make a plan.', 'It was going to be a long day.'],
    fN: ['Even heroes need a little fun.', 'The team took a short break from saving the day.', 'For a minute, nobody thought about {V} at all.', 'Laughter echoed across the {place}.', 'Sometimes the best medicine is a snack and a smile.', '{S} had a very silly idea.', 'It was the funniest moment of the week.', 'Nobody could stop giggling.'],
    hA: ['{tag}', 'Not today, {V}!', 'Hold on tight, {S}!', 'Here comes the {gadget}!', 'We can do this together!', 'Never give up!', 'Watch out! Left! Now right!', 'Stay with me, team!', 'This ends right here!', 'I will stop your plan to {plan}!', 'For everybody in Explox!', 'Super move, go!', 'Faster! We have no time to lose!', 'Jump! Now!'],
    hT: ['Listen, team. We have a mission.', '{V} will not win, as long as we stay together.', 'Every clue matters. Look carefully.', 'I have a feeling about this place.', 'We need to be quick and quiet.', 'Remember, we have the {gadget}.', 'Let us split up and look around.', 'I do not like the look of this.', 'Trust your training, team.', 'We have faced worse than this.', 'Stay sharp, and stay together.', 'The plan to {plan} must be stopped.', 'There has to be a way. Think!', 'I believe in all of you.'],
    hP: ['Here is the plan. {S}, you distract them. I will use the {gadget}.', 'First we sneak in. Then we find the control room.', 'If the plan goes wrong, we meet back at the {place}.', 'Timing is everything. We go on my signal.', 'We need the {gadget} to work. Check it twice.', 'Everyone has a job, and every job matters.', 'We attack from two sides at once.', 'Do not forget: {tag}', 'On three. One, two, three, go!', 'It is risky, but it is our best chance.'],
    hW: ['Thank you, {S}. I could not do this without you.', 'You are braver than you think.', 'We make a great team.', 'No matter what happens, we are friends.', 'That was a close one, but we made it.', 'Everybody did their best, and that is what counts.', 'I am proud of you, {S}.', 'Let us take a moment to say thank you.', 'Good work, team. Truly.', 'This is what heroes do. We help each other.'],
    sS: ['Oh no, oh no, oh no!', 'This is my least favorite part!', 'Boss, I have a very bad feeling!', 'Is it too late to go home?', 'My knees are shaking!', 'Please tell me that was not a monster!', 'I forgot my lucky socks!', 'Can we have a snack break first?', 'I am not scared. Okay, I am a little bit scared.', 'Somebody hold my hand!'],
    sC: ['Yes! We did it!', 'Go, boss, go!', 'That was amazing!', 'Best team ever!', 'I knew we could do it!', 'High five!', 'Whoo-hoo! Look at us!', 'Another win for the good guys!', 'This is the best day ever!', 'That was awesome! Can we do it again?', 'Nobody beats us!', 'I am so proud of us!'],
    sQ: ['Boss, look at this!', 'What is that over there?', 'I found something!', 'Hmm, this looks important.', 'Is that a clue, or is it a snack?', 'Wait. Did you hear that?', 'I think we are being followed.', 'Something does not look right.', 'This is very strange indeed.', 'There is a secret door behind the wall!'],
    sI: ['I have an idea! It is a little crazy, but it might work!', 'What if we use the {gadget} like this?', 'Boss, I think I know how to get out!', 'Maybe we can trick them with a disguise!', 'Wait, I remember something from training!', 'Let me try something. Stand back!', 'It is simple! We just need to push the big button!', 'I have got a plan. Well, half of a plan.'],
    vT: ['Ha ha ha! You are too late, {H}!', 'My plan to {plan} cannot be stopped!', 'You cannot beat me!', 'Feel my power!', 'Henchbots, attack!', 'You will never catch me!', 'This is my best plan yet!', 'Nobody ever listens to {V}. But now they will!', 'You are no match for me!', 'I have been waiting for this moment!', 'Try to stop me, if you can!', 'Muhaha! The {place} will be mine!', 'Do you really think you can win?', 'Everything is going exactly as I planned!'],
    vC: ['Oh no. They found out my secret.', 'I can explain everything!', 'Wait, that was not supposed to happen!', 'This is not fair!', 'How did you know that?', 'My plan! My beautiful plan!'],
    vS: ['Fine. You win this time, {H}.', 'Nobody ever invites me to the parties.', 'I only wanted a friend.', 'I just wanted to be the best at something.', 'I am tired of being the bad guy.', 'Maybe I was wrong about all of this.'],
    mA: ['I know you are hurting, {V}. I can see it in your eyes.', 'Nobody is born a villain. Something made you sad, and I want to understand.', 'You do not have to do this alone. We are here.', 'I was scared once too, and my friends helped me. Let us help you.', 'It is never too late to start again, {V}.', 'Everybody makes mistakes. The brave thing is to say sorry.', 'I am not angry at you. I only want you to be happy.', 'Come with us, and we will find a way together.'],
    mC: ['I do not like seeing anyone cry. Not even a villain.', 'Boss, I think {V} just needs a hug. A very big one.', 'I felt the same when I was alone. It hurts so much.', 'We could have a party for {V}. With cake and everything.', 'Please do not be sad anymore. It makes my heart heavy.', 'I am sorry I laughed at your plan. It was a bit silly, but I know you tried hard.', 'Everybody needs a friend, even a grumpy one.', 'I will share my best snack with you, {V}. That is a promise.'],
    mB: ['I only wanted somebody to notice me. Nobody ever does.', 'When I was small, they never let me join in the games.', 'I thought if I did something big, everybody would like me.', 'But now I see that I only made everyone afraid of me.', 'I am sorry, {H}. I am really, truly sorry.', 'I have been alone for so long, and it hurt more than I can say.', 'Nobody ever said they believed in me before.', 'Maybe I can be a hero too, one day.'],
    mN: ['For a long moment, nobody said a word.', 'A single tear rolled down the villain\'s cheek.', 'The wind grew soft, and the whole world seemed to listen.', 'It was the quietest and the most important moment of the whole story.', 'Even the sky seemed to hold its breath.', 'And somewhere, very softly, music began to play.'],
    vH: ['Boss {V} sent us to stop you!', 'You shall not pass!', 'Beep boop, stop the heroes! Or at least annoy them!', 'Surrender now!', 'We are the henchbots, and we are very, very scary!', 'Nobody gets past us!', 'Attack formation seven!', 'We will not fail the boss!'],
  };
  const PATTERNS = {
    brief: [['N', 'serious', 'talk', '$brief'], ['C', 'surprised', 'look', 'sQ'], ['A', 'serious', 'talk', '$mission'], ['C', 'worried', 'talk', 'sS'], ['A', 'determined', 'work', 'hP'], ['N', 'excited', 'work', 'cN'], ['A', 'excited', 'work', 'hA'], ['C', 'excited', 'highfive', 'sC']],
    gear: [['N', 'excited', 'exercise', 'fN'], ['A', 'determined', 'exercise', 'hT'], ['C', 'joy', 'jump', 'sC'], ['N', 'joy', 'build', 'cN'], ['A', 'happy', 'work', 'hP'], ['C', 'curious', 'talk', 'sQ'], ['N', 'warm', 'photo', 'fN'], ['A', 'warm', 'talk', 'hW']],
    chase: [['N', 'excited', '$veh', 'aN'], ['A', 'excited', '$veh', 'hA'], ['C', 'scared', 'panic', 'sS'], ['N', 'worried', 'panic', 'aN'], ['A', 'determined', 'jump', 'hA'], ['C', 'joy', 'highfive', 'sC'], ['N', 'excited', '$veh', 'aN'], ['A', 'joy', '$veh', 'hA']],
    ambush: [['N', 'shocked', 'fight', 'aN'], ['B', 'angry', 'fight', 'vH'], ['A', 'determined', 'fight', 'hA'], ['C', 'excited', 'fight', 'sC'], ['B', 'angry', 'fight', 'vH'], ['A', 'determined', 'fight', 'hA'], ['N', 'joy', 'fight', 'aN'], ['C', 'joy', 'highfive', 'sC']],
    search: [['N', 'curious', 'sneak', 'cN'], ['A', 'curious', 'sneak', 'hT'], ['C', 'scared', 'sneak', 'sS'], ['N', 'surprised', 'look', 'aN'], ['A', 'surprised', 'look', 'hT'], ['C', 'excited', 'look', 'sQ'], ['A', 'determined', 'talk', 'hP'], ['N', 'excited', 'run', 'aN']],
    funny: [['N', 'joy', 'eat', 'fN'], ['C', 'joy', 'eat', 'sC'], ['A', 'warm', 'talk', 'hW'], ['C', 'joy', 'dance', 'sC'], ['N', 'joy', 'dance', 'fN'], ['A', 'happy', 'play', 'hW'], ['C', 'joy', 'highfive', 'sC'], ['N', 'warm', 'talk', 'fN']],
    sidekick: [['N', 'warm', 'talk', 'fN'], ['C', 'worried', 'talk', 'sS'], ['A', 'warm', 'talk', 'hW'], ['C', 'determined', 'talk', 'sI'], ['A', 'happy', 'talk', 'hW'], ['N', 'joy', 'highfive', 'cN'], ['C', 'joy', 'jump', 'sC'], ['A', 'determined', 'talk', 'hT']],
    fight: [['N', 'excited', 'fight', 'aN'], ['B', 'angry', 'fight', 'vT'], ['A', 'determined', 'fight', 'hA'], ['C', 'worried', 'look', 'sQ'], ['B', 'angry', 'fight', 'vT'], ['A', 'determined', 'fight', 'hA'], ['N', 'shocked', 'fight', 'aN'], ['C', 'excited', 'jump', 'sC']],
    twist: [['N', 'curious', 'look', 'cN'], ['C', 'curious', 'look', '$tw0'], ['A', 'surprised', 'talk', '$tw1'], ['B', 'worried', 'sneak', 'vC'], ['A', 'warm', 'talk', 'hT'], ['B', 'angry', 'talk', 'vT'], ['C', 'scared', 'panic', 'sS'], ['A', 'determined', 'run', 'hA']],
    trap: [['N', 'shocked', 'panic', 'aN'], ['B', 'angry', 'talk', 'vT'], ['A', 'worried', 'panic', 'hT'], ['C', 'scared', 'panic', 'sS'], ['B', 'angry', 'talk', 'vT'], ['A', 'determined', 'talk', 'hP'], ['C', 'curious', 'look', 'sI'], ['N', 'excited', 'work', 'cN']],
    escape: [['A', 'determined', 'work', 'hA'], ['C', 'excited', 'work', 'sI'], ['N', 'excited', 'climb', 'aN'], ['A', 'joy', 'jump', 'hA'], ['C', 'joy', 'fly', 'sC'], ['N', 'relieved', 'run', 'aN'], ['A', 'determined', 'talk', 'hT'], ['C', 'determined', 'highfive', 'sC']],
    plan: [['A', 'serious', 'write', 'hP'], ['C', 'curious', 'talk', 'sQ'], ['A', 'serious', 'write', 'hP'], ['C', 'excited', 'talk', 'sI'], ['N', 'determined', 'build', 'cN'], ['A', 'determined', 'work', 'hT'], ['C', 'joy', 'highfive', 'sC'], ['N', 'excited', 'run', 'aN']],
    monologue: [['B', 'angry', 'talk', 'vT'], ['B', 'angry', 'talk', 'vT'], ['A', 'determined', 'talk', 'hT'], ['B', 'angry', 'talk', 'vT'], ['C', 'curious', 'look', 'sQ'], ['A', 'warm', 'talk', 'hW'], ['B', 'sad', 'talk', 'vS'], ['N', 'serious', 'talk', 'cN']],
    battle: [['N', 'excited', 'battle', 'aN'], ['A', 'determined', 'battle', 'hA'], ['N', 'shocked', 'battle', 'aN'], ['C', 'excited', 'battle', 'sC'], ['N', 'excited', 'battle', 'aN'], ['A', 'determined', 'battle', 'hA'], ['N', 'joy', 'battle', 'aN'], ['B', 'sad', 'talk', 'vS']],
    heart: [['N', 'sad', 'talk', 'mN'], ['B', 'sad', 'talk', 'mB'], ['A', 'warm', 'talk', 'mA'], ['C', 'sad', 'talk', 'mC'], ['B', 'sad', 'talk', 'mB'], ['A', 'warm', 'talk', 'mA'], ['C', 'warm', 'talk', 'mC'], ['B', 'relieved', 'talk', 'mB'], ['A', 'joy', 'talk', 'mA'], ['N', 'warm', 'talk', 'mN']],
    victory: [['N', 'joy', 'party', '$victory'], ['A', 'joy', 'highfive', 'hW'], ['C', 'joy', 'dance', 'sC'], ['B', 'sad', 'talk', 'vS'], ['A', 'warm', 'talk', 'hW'], ['C', 'happy', 'eat', 'sC'], ['N', 'warm', 'party', 'fN'], ['A', 'warm', 'talk', '$next']],
  };
  const SEQ = ['brief', 'gear', 'chase', 'ambush', 'search', 'funny', 'chase', 'sidekick', 'fight', 'twist', 'heart', 'trap', 'escape', 'plan', 'chase', 'fight', 'monologue', 'battle', 'fight', 'heart', 'victory'];
  const EXTRA = ['funny', 'search', 'sidekick', 'chase', 'ambush', 'gear', 'fight', 'escape'];
  const wcT = (x) => String(x).split(/\s+/).length;
  function estScene(sc) { let tt = .4 + wcT(sc.text) / 2.6 + .9; sc.script.lines.forEach(l => { tt += wcT(l[3]) / 2.4 + .5 + 1.5; }); return Math.max(6, tt); }
  function epProgram(si, ep) {
    const sh = SHOWS[si], name = sh[0], H = sh[6], SD = sh[7], vil = sh[9], tagl = sh[10], veh = sh[3];
    const R = (k) => (hsx(si * 1000 + ep, k) % 10000) / 10000, pickS = (a, k) => a[Math.floor(R(k) * a.length) % a.length];
    const V = pickS(vil, 1), plan = pickS(PLANS, 2), gadget = pickS(GADGETS, 3), tw = pickS(TWISTS, 4), brief = pickS(BRIEF, 5), cliff = pickS(CLIFF, 6), vkind = pickS(['robot', 'king', 'wizard', 'ghost', 'alien', 'dragon', 'ninja', 'detective', 'pizza'], 7);
    const places = [sh[4], 'city', 'park', 'airport', 'beach', 'market', 'scrapyard', 'arena', 'nature', 'castle'], epT = epTitle(si, ep);
    const cast = C3([H, sh[5], 'hero'], [V, vkind, 'rival'], [SD, sh[8], 'goof']);
    const counters = {}, fmtT = (s, place) => s.replace(/\{H\}/g, H).replace(/\{V\}/g, V).replace(/\{S\}/g, SD).replace(/\{plan\}/g, plan).replace(/\{gadget\}/g, gadget).replace(/\{tag\}/g, tagl).replace(/\{place\}/g, place || sh[4]);
    const draw = (pool, k) => { const arr = POOLS[pool]; counters[pool] = (counters[pool] || 0) + 1; return arr[(Math.floor(R(k + 40) * arr.length) + counters[pool] * 3) % arr.length]; };
    const SPECIAL = { '$brief': brief, '$mission': V + ' is planning to ' + plan + '! We must stop them.', '$tw0': tw[0], '$tw1': tw[1], '$victory': 'And so, ' + V + '\'s plan to ' + plan + ' was stopped, and the city was safe again.', '$next': 'Join us next time for another adventure.' };
    const make = (type, n) => {
      const place = (type === 'brief' || type === 'victory') ? sh[4] : pickS(places, 60 + n), pat = PATTERNS[type], prop = pickS(['trophy', 'book', 'car', 'bolt', 'lantern', 'coins', 'tree', 'shield', 'rocket', 'sun'], 80 + n);
      const lines = pat.map((p, j) => { let text = p[3].charAt(0) === '$' ? SPECIAL[p[3]] : draw(p[3], n * 8 + j); text = fmtT(text, place); const act = p[2] === '$veh' ? (veh === 'fish' ? 'run' : veh) : p[2]; return [p[0], p[1], act, text]; });
      const say = ({ brief: 'The mission.', gear: 'Getting ready.', chase: 'The chase.', ambush: 'An ambush!', search: 'The search.', funny: 'A funny moment.', sidekick: 'A talk between friends.', heart: 'A heartfelt moment.', fight: 'The fight.', twist: 'The twist.', trap: 'Trapped!', escape: 'The escape.', plan: 'The plan.', monologue: 'The villain speaks.', battle: 'The big battle.', victory: 'Victory.' })[type];
      const sc = S(type === 'battle' ? 'arena' : place, 'day', prop, say, lines);
      if (type === 'battle') { const n1 = 30 + Math.floor(R(90) * 7) * 10; sc.script.battle = { kind: 'war', n1: n1, n2: n1, name1: H + '\'s team', name2: V + '\'s army', cols: [parseInt(sh[2].replace('#', ''), 16), 0x455a64], heads: [0xf5c89a, 0x90a4ae], weapon: 'swords', wcol: 0xcfd8dc, wlen: 1.5, wthick: .16, win: 0, survivors: Math.max(3, Math.floor(n1 * .1)), bombs: 3 + Math.floor(R(91) * 3), seed: 1 + si * 50 + ep, ground: 0x6b8e3a }; sc.script.lines = sc.script.lines.map(l => [l[0], l[1], l[2], l[3]]); }
      return sc;
    };
    const scenes = []; let n = 0;
    scenes.push(S(sh[4], 'day', 'trophy', name, [['N', 'excited', 'fight', name + '!'], ['N', 'excited', 'run', seLabel(ep) + ': The ' + epT + '.'], ['N', 'determined', veh === 'fish' ? 'fight' : veh, tagl]]));
    SEQ.forEach(ty => { scenes.push(make(ty, n++)); });
    let total = scenes.reduce((a, sc) => a + estScene(sc), 0), k = 0;
    while (total < 960 && k < 12) { const sc = make(EXTRA[(k + si + ep) % EXTRA.length], n++); scenes.splice(scenes.length - 3 - (k % 3), 0, sc); total += estScene(sc); k++; }
    const epi = S(sh[4], 'day', 'trophy', 'Next time.', [['N', 'serious', 'talk', cliff]]); scenes.push(epi);
    const idx = program('\uD83C\uDFAC ' + name.toUpperCase() + ' \u2022 S' + seasonOf(ep) + ' E' + epIn(ep) + ' [SHOW]', name + ' \u2022 S' + seasonOf(ep) + ' E' + epIn(ep) + ': ' + epT, 'The Episode Narrator', cast, scenes.map(sc => { sc.text = ''; sc.script.lines = sc.script.lines.map(l => [l[0], l[1], l[2], l[3]]); return sc; }));
    CINEMA_MOVIES[idx].tvIntro = { emoji: sh[1], tag: sh[10], themeSeed: si * 7 + 1, name: name, ep: ep, label: 'SEASON ' + seasonOf(ep) + '  \u2022  EPISODE ' + epIn(ep), epTitle: epT, col: sh[2], seed: si * 50 + ep, cast: [H + '  (hero)', V + '  (villain)', SD + '  (sidekick)'] };
    return idx;
  }
  // 3 seasons of 20 episodes (60 episodes) are out already, and every show gets one brand-new episode every real day
  const SHOW_LAUNCH = new Date(2026, 10, 6).getTime(), released = () => Math.min(100, 60 + Math.max(0, Math.floor((Date.now() - SHOW_LAUNCH) / 86400000)));  // up to 5 seasons (100 episodes)
  const seasonOf = (ep) => Math.floor((ep - 1) / 20) + 1, epIn = (ep) => ((ep - 1) % 20) + 1, seLabel = (ep) => 'Season ' + seasonOf(ep) + ', Episode ' + epIn(ep);
  const progKey = (si) => 'explox_tvshow_' + user() + '_' + si;
  const lastEp = (si) => { try { return +localStorage.getItem(progKey(si)) || 0; } catch (e) { return 0; } };
  const saveEp = (si, ep) => { try { localStorage.setItem(progKey(si), String(ep)); } catch (e) { } };
  function startEpisode(si, ep) { tv.series = { si: si, ep: ep }; saveEp(si, ep); startTV(['ad1', epProgram(si, ep)], 'series'); }
  function openShows() {
    const b = $('tvBox'), rel = released(); let h = head('<div style="text-align:center;margin-bottom:6px"><button class="tvBtn" id="tvBack" style="background:#333;color:#ccc">\u2190 Channels</button></div><div class="tvGrid">');
    SHOWS.forEach((sh, i) => { const le = lastEp(i); h += '<div class="tvCard" data-i="' + i + '" style="background:linear-gradient(135deg,' + sh[2] + '55,#111)"><div style="font-size:30px">' + sh[1] + '</div><div style="font-weight:bold;font-size:13px;margin:3px 0">' + sh[0] + ' <span style="background:#e94560;border-radius:4px;padding:0 4px;font-size:10px">NEW TODAY</span></div><div style="color:#bbb;font-size:10px">' + seasonOf(rel) + ' seasons \u2022 ' + rel + ' episodes' + (le ? ' \u2022 you are on ' + seLabel(le).replace('Season ', 'S').replace(', Episode ', 'E') : '') + '</div></div>'; });
    h += '</div>'; b.innerHTML = h; $('tvBack').onclick = openMenu;
    Array.prototype.forEach.call(b.querySelectorAll('.tvCard'), c => { c.onclick = () => openEpisodes(+c.getAttribute('data-i')); });
  }
  let openSeason = 0;
  function openEpisodes(si, season) {
    const sh = SHOWS[si], b = $('tvBox'), le = lastEp(si), rel = released(), seasons = seasonOf(rel), sn = season || openSeason || seasonOf(le || 1); openSeason = sn;
    let h = head('<div style="text-align:center;margin-bottom:6px"><button class="tvBtn" id="tvBack" style="background:#333;color:#ccc">\u2190 All shows</button> <button class="tvBtn" id="tvNext" style="background:#e94560;color:#fff">\u25B6 ' + (le ? 'Continue: ' + seLabel(Math.min(rel, le + 1)) : 'Start: Season 1, Episode 1') + '</button> <button class="tvBtn" id="tvNew" style="background:#2e7d32;color:#fff">\u2B50 Newest episode</button> <button class="tvBtn" id="tvRand" style="background:#36507f;color:#fff">\uD83C\uDFB2 Random</button></div><div style="text-align:center;font-size:22px;margin:4px 0;color:' + sh[2] + '">' + sh[1] + ' <b>' + sh[0] + '</b></div><div class="tvSub">' + sh[10] + ' \u2022 ' + seasons + ' seasons \u2022 ' + rel + ' episodes \u2022 a new one every day</div><div style="text-align:center;margin:6px 0">');
    for (let s = 1; s <= seasons; s++) h += '<button class="tvBtn" data-s="' + s + '" style="background:' + (s === sn ? '#e94560' : '#243557') + ';color:#fff">Season ' + s + '</button>';
    h += '</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">';
    for (let e = 1; e <= 20; e++) { const g = (sn - 1) * 20 + e; if (g > rel) break; h += '<button class="tvBtn" data-e="' + g + '" title="' + epTitle(si, g) + '" style="background:' + (g <= le ? '#2e5d3a' : '#243557') + ';color:#fff;margin:0;font-size:11px;padding:6px 2px">' + e + (g === rel ? ' \u2B50' : '') + '<br><span style="font-weight:normal;font-size:9px">' + epTitle(si, g) + '</span></button>'; }
    h += '</div>'; b.innerHTML = h; $('tvBack').onclick = openShows; $('tvNext').onclick = () => startEpisode(si, le ? (le % rel) + 1 : 1); $('tvNew').onclick = () => startEpisode(si, rel); $('tvRand').onclick = () => startEpisode(si, 1 + rnd(rel));
    Array.prototype.forEach.call(b.querySelectorAll('[data-e]'), c => { c.onclick = () => startEpisode(si, +c.getAttribute('data-e')); });
    Array.prototype.forEach.call(b.querySelectorAll('[data-s]'), c => { c.onclick = () => openEpisodes(si, +c.getAttribute('data-s')); });
  }
  function shopBlock() { return ['ad2', 'ad2', 'ad2']; }
  function movieBlock(idx) { return ['ad1', idx, 'ad1']; }
  function liveBlock() { const m = CINEMA_MOVIES.filter(x => !x.tv); const mi = CINEMA_MOVIES.indexOf(m[Math.floor(Math.random() * m.length)]); const r = Math.random(); return r < .2 ? newsPrograms() : r < .4 ? funBlock(2).concat(['ad2']) : r < .5 ? [soccerMatch(), 'ad2'] : r < .65 ? [fightMatch(), 'ad2'] : ['ad2', mi]; }

  // ── the TV: queue, billing, screen ────────────────────────────────────────
  function resolve(it) { if (it === 'ad1') return adBreak(1); if (it === 'ad2') return adBreak(2); return it; }
  function showScreen() {
    try { if (document.pointerLockElement) document.exitPointerLock(); isPointerLocked = false; } catch (e) { }
    $('cinemaModal').style.display = 'flex'; $('cinemaLobby').style.display = 'none'; $('cinemaSnacks').style.display = 'none'; $('cinemaScreen').style.display = 'block'; $('cinemaSkip').style.display = 'block'; $('cinemaClose').style.display = 'none';
    const cv = $('cinemaCanvas'); cv.width = window.innerWidth; cv.height = window.innerHeight;
  }
  function playNow(idx) {
    const m = CINEMA_MOVIES[idx]; try { if (cinemaState.animFrame) cancelAnimationFrame(cinemaState.animFrame); window.speechSynthesis.cancel(); } catch (e) { }
    cinemaState = { movie: m, movieIdx: idx, snacks: [], phase: 'movie', sceneIndex: 0, sceneTimer: null, animFrame: null, trailerIndex: 0, sceneStart: performance.now(), tv: true };
    showScreen(); startCinemaMovie(); hud();
  }
  function nextItem() {
    if (!tv.on) return;
    if (!tv.queue.length && tv.mode === 'live') tv.queue = liveBlock();
    if (!tv.queue.length && tv.mode === 'series' && tv.series) { tv.series.ep = tv.series.ep % released() + 1; saveEp(tv.series.si, tv.series.ep); tv.queue = ['ad2', epProgram(tv.series.si, tv.series.ep)]; }
    if (!tv.queue.length) { endLikeMovie(); return; }
    const it = tv.queue.shift(); const idx = resolve(it); tv.channel = CINEMA_MOVIES[idx].tv ? (CINEMA_MOVIES[idx].tvTag || 'TV') : CINEMA_MOVIES[idx].title;
    playNow(idx);
  }
  function endLikeMovie() { const was = cinemaState && cinemaState.movie; stopBilling(); hudHide(); if (was && was.tv) { try { closeCinema_orig(); } catch (e) { } openMenu(); } else { try { showCinemaCredits_orig(); } catch (e) { } } }
  function startTV(items, mode) {
    if (!rented()) { if (sip() < PER_MIN) { note('❌ Not enough S.I.P.! TV costs ' + PER_MIN + ' S.I.P. per minute. Rent it for ' + fmt(RENT) + ' a day or earn more first.'); return; } pay(PER_MIN); note('📺 TV on! -' + PER_MIN + ' S.I.P. for your first minute.'); }
    closeMenu(); tv.on = true; tv.secs = 0; tv.queue = items.slice(); tv.mode = mode || ''; if (tv.timer) clearInterval(tv.timer); tv.timer = setInterval(tick, 1000); nextItem();
  }
  function tick() {
    if (!tv.on) return; tv.secs++;
    // safety net: if a program ended on its credits screen and nothing started the next one, start it (movies and shows must never get stuck on an ad)
    try { if (cinemaState && cinemaState.phase === 'credits' && cinemaState.tv && (!tv.credSince || Date.now() - tv.credSince > 4000) && (tv.credSince = tv.credSince || Date.now(), Date.now() - tv.credSince >= 2500)) { tv.credSince = 0; nextItem(); } else if (!cinemaState || cinemaState.phase !== 'credits') tv.credSince = 0; } catch (e) { }
    if (rented()) { hud(); return; }
    if (tv.secs % 60 === 0) { if (sip() < PER_MIN) { off('💸 Out of S.I.P.! Explox TV switched off.'); return; } pay(PER_MIN); note('📺 -' + PER_MIN + ' S.I.P. for the next minute of TV.'); }
    hud();
  }
  // BUY NOW: while a commercial is on, a button sends you to E.D (Explox Delivery) to buy that exact product
  function curProduct() { try { if (!tv.on || !cinemaState || cinemaState.phase !== 'movie') return null; const sc = cinemaState.movie.scenes[cinemaState.sceneIndex]; return (sc && sc.product) || null; } catch (e) { return null; } }
  setInterval(() => {
    try {
      const p = curProduct(); let b = $('tvBuyNow');
      if (!p) { if (b) b.style.display = 'none'; return; }
      if (!b) { b = document.createElement('button'); b.id = 'tvBuyNow'; b.style.cssText = 'position:fixed;left:50%;bottom:9%;transform:translateX(-50%);z-index:2147483050;background:#ff8f00;color:#fff;border:3px solid #fff;border-radius:26px;padding:12px 22px;font:900 17px Arial;cursor:pointer;box-shadow:0 4px 16px #000a;animation:tvBuyPulse 1s infinite alternate'; document.body.appendChild(b); const st = document.createElement('style'); st.textContent = '@keyframes tvBuyPulse{from{transform:translateX(-50%) scale(1)}to{transform:translateX(-50%) scale(1.07)}}'; document.head.appendChild(st); b.onclick = () => { const q = curProduct(); if (q && window.exploxBuyNow) window.exploxBuyNow(q); else note('E.D is not ready yet. Try again in a second!'); }; }
      b.textContent = '\uD83D\uDED2 BUY NOW \u2022 ' + p.emoji + ' ' + String(p.name).replace(/^a ticket to /, 'Ticket: ') + ' \u2022 ' + fmt(p.price) + ' S.I.P. \u2192 E.D'; b.style.display = 'block';
    } catch (e) { }
  }, 400);
  function stopBilling() { tv.on = false; if (tv.timer) { clearInterval(tv.timer); tv.timer = null; } }
  function off(msg) { stopBilling(); try { closeCinema_orig(); } catch (e) { } hudHide(); if (msg) note(msg); openMenu(); }
  function hud() {
    let h = $('tvHud'); if (!h) { h = document.createElement('div'); h.id = 'tvHud'; h.style.cssText = 'position:fixed;left:14px;top:12px;z-index:2147483000;background:rgba(0,0,0,.65);color:#fff;padding:8px 12px;border-radius:10px;font:bold 13px Arial;display:none;'; h.innerHTML = '<span id="tvHudTxt"></span> <button id="tvOff" style="margin-left:10px;padding:4px 10px;background:#e94560;color:#fff;border:0;border-radius:6px;cursor:pointer;font-weight:bold;">⏻ Off</button>'; document.body.appendChild(h); $('tvOff').onclick = () => off(''); }
    const left = 60 - (tv.secs % 60), t = rented() ? '📺 ' + (tv.channel || 'TV') + '  •  ✅ RENTED – free TV for ' + Math.max(0, Math.ceil((rentEnd() - Date.now()) / 60000)) + ' more min' : '📺 ' + (tv.channel || 'TV') + '  •  💰 ' + PER_MIN + ' S.I.P./min  •  next charge in ' + left + 's';
    $('tvHudTxt').textContent = t; h.style.display = 'block';
  }
  function hudHide() { const h = $('tvHud'); if (h) h.style.display = 'none'; }

  // wrap the cinema's own functions so TV items chain together and "Leave" returns to the TV menu
  let showCinemaCredits_orig = null, closeCinema_orig = null;
  let hookedCred = false, hookedClose = false;
  function hook() {
    if (window.showCinemaCredits && !window.showCinemaCredits.__tv) { const orig = window.showCinemaCredits; showCinemaCredits_orig = orig; const w = function () { if (tv.on) { nextItem(); return; } return orig.apply(this, arguments); }; w.__tv = true; window.showCinemaCredits = w; hookedCred = true; }   // re-hooks if the 3D cinema installs its credits after us
    if (!hookedClose && window.closeCinema) { const orig = window.closeCinema; closeCinema_orig = orig; window.closeCinema = function () { const was = tv.on || (cinemaState && cinemaState.tv); stopBilling(); const r = orig.apply(this, arguments); if (was) { hudHide(); openMenu(); } return r; }; hookedClose = true; }
  }
  setInterval(hook, 800); hook();

  // ── the menu ──────────────────────────────────────────────────────────────
  function css() {
    if ($('tvStyle')) return; const st = document.createElement('style'); st.id = 'tvStyle';
    st.textContent = '#tvModal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:2001;align-items:center;justify-content:center;font-family:Arial,sans-serif}#tvBox{background:linear-gradient(#2b2f3a,#161922);border:6px solid #444b5a;border-radius:26px;padding:18px 22px;max-width:760px;width:94%;max-height:92vh;overflow-y:auto;color:#fff;box-shadow:0 0 60px rgba(80,140,255,.35)}#tvBox h2{margin:0;color:#ffd54f;letter-spacing:2px;text-align:center}.tvSub{color:#9aa;text-align:center;font-size:12px;margin:4px 0 12px}.tvCh{display:block;width:100%;text-align:left;margin:7px 0;padding:12px 14px;background:#1d2a44;border:2px solid #36507f;border-radius:12px;color:#fff;font:bold 15px Arial;cursor:pointer}.tvCh:hover{border-color:#ffd54f;background:#243557}.tvCh small{display:block;color:#9fc;font-weight:normal;font-size:11px;margin-top:2px}.tvGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.tvCard{border:2px solid #333;border-radius:10px;padding:10px;text-align:center;cursor:pointer;color:#fff}.tvCard:hover{border-color:#ffd54f}.tvBtn{padding:9px 20px;border:0;border-radius:8px;cursor:pointer;font-weight:bold;margin:4px}';
    document.head.appendChild(st);
  }
  function box() { css(); let m = $('tvModal'); if (!m) { m = document.createElement('div'); m.id = 'tvModal'; m.innerHTML = '<div id="tvBox"></div>'; document.body.appendChild(m); } return m; }
  function closeMenu() { const m = $('tvModal'); if (m) m.style.display = 'none'; }
  function head(sub) {
    const r = rented(), mins = Math.max(0, Math.ceil((rentEnd() - Date.now()) / 60000));
    return '<div style="font-size:42px;text-align:center">📺</div><h2>EXPLOX TV</h2><div class="tvSub">💰 You have <b style="color:#ffd54f">' + fmt(sip()) + '</b> S.I.P. &nbsp;|&nbsp; ' + (r ? '✅ <b style="color:#7dff9a">RENTED</b> – watch free for ' + mins + ' more min' : 'Pay per minute: <b>' + PER_MIN + '</b> S.I.P.') + '</div>' + (sub || '');
  }
  function openMenu() {
    try { if (document.pointerLockElement) document.exitPointerLock(); isPointerLocked = false; } catch (e) { }
    const m = box(); m.style.display = 'flex'; const b = $('tvBox'); const r = rented();
    b.innerHTML = head() +
      '<button class="tvCh" id="tvMovies">🎬 All Movies<small>Every Explox Cinemas movie, with commercials before and after</small></button>' +
      '<button class="tvCh" id="tvNews">📰 Explox News<small>Fresh news every time, with the real new movies and real shop prices</small></button>' +
      '<button class="tvCh" id="tvFun">😂 Fun Videos<small>Dancing robots, cats, pizza fails, bubbles and more</small></button>' +
      '<button class="tvCh" id="tvSoccer">\u26BD Soccer: Explox vs the World<small>Cool matches against Paris, Tokyo, Rio and more. A brand-new match every time!</small></button>' +
      '<button class="tvCh" id="tvShows">\uD83D\uDCFA TV Shows<small>30 cool action series, up to 5 seasons each, a brand-new episode every day, with intros and theme music</small></button>' +
      '<button class="tvCh" id="tvFights">\u2694\uFE0F Fights<small>Any fight you can imagine, up to 1000 fighters, with bombs. All cartoon!</small></button>' +
      '<button class="tvCh" id="tvShop">🛍️ Shopping Channel<small>Non-stop commercials for real products in Explox</small></button>' +
      '<button class="tvCh" id="tvLive">📺 Explox TV Live<small>A never-ending mix: news, videos, commercials and movies</small></button>' +
      (r ? '' : '<button class="tvCh" id="tvRent" style="border-color:#ffd54f">🔑 Rent this TV for one Explox day – ' + fmt(RENT) + ' S.I.P.<small>Watch everything for free for 30 real minutes (one Explox day)</small></button>') +
      '<div style="text-align:center;margin-top:10px"><button class="tvBtn" id="tvLeave" style="background:#333;color:#ccc">⏻ Turn off</button></div>';
    $('tvMovies').onclick = openMovies; $('tvNews').onclick = () => startTV(newsPrograms(), ''); $('tvFun').onclick = () => startTV(funBlock(4), ''); $('tvSoccer').onclick = () => startTV(soccerBlock(2), ''); $('tvShows').onclick = openShows; $('tvFights').onclick = () => startTV(fightBlock(3), ''); $('tvShop').onclick = () => startTV(shopBlock(), ''); $('tvLive').onclick = () => startTV(liveBlock(), 'live'); $('tvLeave').onclick = closeMenu;
    if ($('tvRent')) $('tvRent').onclick = rent;
  }
  function rent() {
    if (rented()) { note('✅ Already rented.'); return; }
    if (sip() < RENT) { note('❌ Renting costs ' + fmt(RENT) + ' S.I.P. for one Explox day.'); return; }
    pay(RENT); try { localStorage.setItem(rentKey(), String(Date.now() + DAYMS)); } catch (e) { } note('🔑 TV rented for one Explox day. Everything is free!'); try { sfx.buy(); } catch (e) { } openMenu();
  }
  function openMovies() {
    const b = $('tvBox'); let h = head('<div style="text-align:center;margin-bottom:6px"><button class="tvBtn" id="tvBack" style="background:#333;color:#ccc">← Channels</button></div><div class="tvGrid">');
    const real = CINEMA_MOVIES.map((m, i) => [m, i]).filter(x => !x[0].tv).reverse();
    real.forEach(([m, i], n) => { h += '<div class="tvCard" data-i="' + i + '" style="background:' + m.bg + '"><div style="font-size:28px">' + m.icons + '</div><div style="font-weight:bold;font-size:12px;margin:3px 0">' + m.title + (n < 6 ? ' <span style="background:#e94560;border-radius:4px;padding:0 4px;font-size:10px">NEW</span>' : '') + '</div><div style="color:#bbb;font-size:10px">' + m.genre + '</div></div>'; });
    h += '</div>'; b.innerHTML = h; $('tvBack').onclick = openMenu;
    Array.prototype.forEach.call(b.querySelectorAll('.tvCard'), c => { c.onclick = () => startTV(movieBlock(+c.getAttribute('data-i')), ''); });
  }
  window.watchHotelTV = openMenu; window.watchExploxTV = openMenu;
  window.__exploxTV = { open: openMenu, status: () => ({ on: tv.on, rented: rented(), perMin: PER_MIN, rent: RENT }), news: newsPrograms, soccer: soccerMatch, fight: fightMatch, ep: epProgram, shows: SHOWS, ads: adBreak };
})();
