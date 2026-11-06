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
    const idx = slot(), m = CINEMA_MOVIES[idx]; m.comedy = !/NEWS|SOCCER/.test(tag); m.ticker = ''; m.title = title; m.tvTag = tag; m.narrator = narrator; m.cast = cast; m.scenes = scenes;
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
    return program('📢 COMMERCIAL BREAK', 'Commercial Break', 'Ad Voice', C3(['Shopper Sam', 'hero', 'goof'], ['Happy Hana', 'hero', 'sweet'], ['Mr. Deal', 'king', 'rival']), chosen.map(adScene));
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
    const plays = [], goalPlay = (att) => { const r = Math.random(); return r < .25 ? { att: att, type: 'penalty', result: 'goal' } : r < .5 ? { att: att, type: 'trick' } : { att: att, type: 'goal' }; };
    for (let i = 0; i < eg; i++) plays.push(goalPlay('ex')); for (let i = 0; i < og; i++) plays.push(goalPlay('opp'));
    while (plays.length < 6) { const att = Math.random() < .5 ? 'ex' : 'opp', ty = pk(['save', 'miss', 'post', 'tackle', 'foul', 'foul', 'penalty', 'save', 'miss']); plays.push(ty === 'penalty' ? { att: att, type: 'penalty', result: pk(['save', 'save', 'miss', 'post']) } : { att: att, type: ty, red: ty === 'foul' && Math.random() < .2 }); }
    plays.sort(() => Math.random() - .5);
    const mins = [8, 19, 31, 52, 67, 81].map(x => x + rnd(5)); let a = 0, b = 0;
    const cast = C3(['Commentator', 'hero', 'wise'], ['Referee', 'hero', 'wise'], ['Analyst', 'hero', 'wise']);
    const mk = (type, att, before, after, min, say, lines, cue, extra) => { const sc = S('park', 'day', 'trophy', say, lines.map(l => L('N', l[0], 'soccer', l[1]))); sc.script.soccer = Object.assign({ type: type, att: att, opp: oppName, col: city[2], before: before.slice(), after: after.slice(), min: min, cue: cue }, extra || {}); return sc; };
    const scenes = [mk('kickoff', 'ex', [0, 0], [0, 0], 1, 'Welcome to Explox Stadium.', [
      ['excited', 'Welcome to Explox Stadium! Today, Explox FC plays the ' + opp + '.'],
      ['joy', 'The stands are packed, the weather is perfect, and the players are walking out.'],
      ['excited', 'The referee blows the whistle, and the match begins!']], 2)];
    plays.forEach((pl, i) => {
      const before = [a, b], resType = pl.type === 'penalty' ? pl.result : pl.type, goal = resType === 'goal' || resType === 'trick'; if (goal) { if (pl.att === 'ex') a++; else b++; } const after = [a, b], min = mins[i];
      const atkN = pl.att === 'ex' ? exN : opN, defN = pl.att === 'ex' ? opN : exN, team = pl.att === 'ex' ? 'Explox' : 'the ' + opp, p1 = atkN[0], p2 = atkN[1], p3 = atkN[2], keeper = defN[10], defName = defN[1], score = 'Explox ' + a + ', ' + city[1] + ' ' + b + '.';
      let lines;
      if (pl.type === 'penalty') lines = [['serious', 'Penalty! The referee points to the spot.'], ['worried', p3 + ' steps up. The whole stadium holds its breath.'], ['excited', 'He shoots!'], [resType === 'goal' ? 'joy' : 'shocked', resType === 'goal' ? 'Goal! ' + p3 + ' scores from the spot!' : resType === 'save' ? keeper + ' saves the penalty!' : resType === 'post' ? 'It hits the post!' : 'Over the bar!'], ['warm', score]];
      else if (pl.type === 'foul') lines = [['excited', 'The ' + min + 'th minute. ' + team + ' on the attack.'], ['excited', p1 + ' to ' + p2 + ', and ' + p3 + ' runs forward.'], ['shocked', 'Oh! ' + defName + ' brings him down!'], ['serious', 'The referee blows the whistle. ' + (pl.red ? 'Red' : 'Yellow') + ' card for ' + defName + '.'], ['warm', score]];
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
  function shopBlock() { return ['ad2', 'ad2', 'ad2']; }
  function movieBlock(idx) { return ['ad1', idx, 'ad1']; }
  function liveBlock() { const m = CINEMA_MOVIES.filter(x => !x.tv); const mi = CINEMA_MOVIES.indexOf(m[Math.floor(Math.random() * m.length)]); const r = Math.random(); return r < .2 ? newsPrograms() : r < .4 ? funBlock(2).concat(['ad2']) : r < .6 ? [soccerMatch(), 'ad2'] : ['ad2', mi]; }

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
    if (rented()) { hud(); return; }
    if (tv.secs % 60 === 0) { if (sip() < PER_MIN) { off('💸 Out of S.I.P.! Explox TV switched off.'); return; } pay(PER_MIN); note('📺 -' + PER_MIN + ' S.I.P. for the next minute of TV.'); }
    hud();
  }
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
    if (!hookedCred && window.showCinemaCredits) { const orig = window.showCinemaCredits; showCinemaCredits_orig = orig; window.showCinemaCredits = function () { if (tv.on) { nextItem(); return; } return orig.apply(this, arguments); }; hookedCred = true; }
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
      '<button class="tvCh" id="tvShop">🛍️ Shopping Channel<small>Non-stop commercials for real products in Explox</small></button>' +
      '<button class="tvCh" id="tvLive">📺 Explox TV Live<small>A never-ending mix: news, videos, commercials and movies</small></button>' +
      (r ? '' : '<button class="tvCh" id="tvRent" style="border-color:#ffd54f">🔑 Rent this TV for one Explox day – ' + fmt(RENT) + ' S.I.P.<small>Watch everything for free for 30 real minutes (one Explox day)</small></button>') +
      '<div style="text-align:center;margin-top:10px"><button class="tvBtn" id="tvLeave" style="background:#333;color:#ccc">⏻ Turn off</button></div>';
    $('tvMovies').onclick = openMovies; $('tvNews').onclick = () => startTV(newsPrograms(), ''); $('tvFun').onclick = () => startTV(funBlock(4), ''); $('tvSoccer').onclick = () => startTV(soccerBlock(2), ''); $('tvShop').onclick = () => startTV(shopBlock(), ''); $('tvLive').onclick = () => startTV(liveBlock(), 'live'); $('tvLeave').onclick = closeMenu;
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
  window.__exploxTV = { open: openMenu, status: () => ({ on: tv.on, rented: rented(), perMin: PER_MIN, rent: RENT }), news: newsPrograms, soccer: soccerMatch, ads: adBreak };
})();
