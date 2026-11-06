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
  const C3 = (a, b, c) => ({ A: { role: a[0], kind: a[1], pers: a[2] }, B: { role: b[0], kind: b[1], pers: b[2] }, C: { role: c[0], kind: c[1], pers: c[2] } });
  function program(tag, title, narrator, cast, scenes) {
    const idx = slot(), m = CINEMA_MOVIES[idx]; m.title = title; m.tvTag = tag; m.narrator = narrator; m.cast = cast; m.scenes = scenes;
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
      S('cityhall', 'dusk', 'trophy', 'That is all for tonight.', [L('A', 'warm', 'talk', 'That is all for tonight on Explox News.'), L('B', 'happy', 'talk', 'Stay curious, Explox, and be kind to your neighbors.'), L('C', 'joy', 'magic', 'Sweet dreams, everyone!'), L('A', 'joy', 'party', 'Good night, Explox!')]),
    ]);
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
  // ── the Weird Channel ─────────────────────────────────────────────────────
  const WEIRDV = [
    { title: 'It Is Raining Pizza', place: 'park', prop: 'pizza', cast: C3(['Pizza Pete', 'hero', 'goof'], ['Umbrella Uma', 'grandma', 'nervous'], ['Cloud Carl', 'wizard', 'wise']), lines: [['N', 'surprised', 'look', 'It was a normal Tuesday in Explox Park. Then the sky got cheesy.'], ['A', 'shocked', 'look', 'Oh look! Pizza is falling from the sky! Pepperoni, mushroom and extra cheese!'], ['B', 'scared', 'panic', 'Everybody run! A hot slice is about to land on my umbrella!'], ['C', 'curious', 'magic', 'Fascinating. I only asked for a little drizzle. Not a whole pizzeria.'], ['A', 'joy', 'eat', 'Who cares! Open wide and catch a slice!'], ['B', 'joy', 'eat', 'It is delicious! The best weather in the world!'], ['C', 'happy', 'party', 'Tomorrow, I will try a forecast of ice cream.']] },
    { title: 'The Cow Who Wanted to Fly', place: 'nature', prop: 'tree', cast: C3(['Daisy the Cow', 'dino', 'sweet'], ['Farmer Fred', 'hero', 'nervous'], ['Captain Cluck', 'pilot', 'goof']), lines: [['N', 'curious', 'look', 'Daisy the cow had one big dream: to fly above the clouds.'], ['A', 'excited', 'jump', 'Moo! I will flap my ears very hard. Watch me go!'], ['B', 'worried', 'panic', 'Daisy, cows do not fly. Please come down from that hay bale!'], ['C', 'excited', 'fly', 'Cluck cluck! Take my little rocket seat. Oh look! You are floating!'], ['N', 'surprised', 'fly', 'And up she went, past the barn, past the birds and past the moon.'], ['A', 'joy', 'fly', 'Mooooo! The whole world looks like a green blanket!'], ['B', 'relieved', 'party', 'She is happy. That is all that matters. Somebody get a ladder.']] },
    { title: 'Upside-Down Day', place: 'city', prop: 'car', cast: C3(['Wobbly Walt', 'hero', 'goof'], ['Dizzy Dora', 'racer', 'nervous'], ['Mayor Topsy', 'king', 'wise']), lines: [['N', 'curious', 'walk', 'On Upside-Down Day, the whole city flipped over, and so did everyone in it.'], ['A', 'surprised', 'jump', 'My feet are on the ceiling and my head is on the sidewalk. How fun!'], ['B', 'scared', 'panic', 'My hair is falling up! Is that normal?'], ['C', 'happy', 'talk', 'Perfectly normal. It happens once a year. The mayor even says so.'], ['A', 'joy', 'dance', 'Then let us dance upside down! Left foot up, right foot up!'], ['B', 'joy', 'dance', 'I can see the clouds from underneath! They look like pillows!'], ['C', 'warm', 'party', 'Enjoy it, my friends. Tomorrow, everything goes back to normal. Probably.']] },
    { title: 'The Talking Toaster', place: 'house', prop: 'lantern', cast: C3(['Toasty', 'robot', 'goof'], ['Little Lily', 'hero', 'sweet'], ['Grandpa Gus', 'grandma', 'wise']), lines: [['N', 'curious', 'cook', 'Lily put two slices of bread in the toaster. The toaster said hello.'], ['A', 'excited', 'cook', 'Good morning! I am Toasty! Would you like it light, medium, or very, very golden?'], ['B', 'surprised', 'look', 'Grandpa! The toaster is talking to me!'], ['C', 'curious', 'talk', 'Hmm. Does it also do the dishes?'], ['A', 'happy', 'dance', 'I can sing, too! Pop, pop, popcorn is my favorite song!'], ['B', 'joy', 'eat', 'The toast is perfect. And it came with a joke!'], ['C', 'warm', 'party', 'Best breakfast helper in Explox, I would say.']] },
    { title: 'Banana Phone Mix-Up', place: 'market', prop: 'coins', cast: C3(['Chatty Chad', 'hero', 'goof'], ['Fruit Fran', 'grandma', 'sweet'], ['Ring Ron', 'robot', 'nervous']), lines: [['N', 'surprised', 'shop', 'Chad picked up his phone. It was a banana. He had not noticed.'], ['A', 'happy', 'talk', 'Hello? Hello? Mom? You sound very yellow today.'], ['B', 'surprised', 'look', 'Chad, that is not your phone. That is my best banana.'], ['A', 'shocked', 'look', 'No way! Then what did I just eat for lunch?'], ['C', 'worried', 'panic', 'Oh no, oh no. You ate the phone. Beep boop, call the doctor.'], ['B', 'joy', 'dance', 'Do not worry. It is a very healthy phone. Full of potassium!'], ['A', 'joy', 'party', 'Best lunch call ever. Ring ring, banana!']] },
    { title: 'Fish on Bicycles', place: 'beach', prop: 'sun', cast: C3(['Finn', 'hero', 'goof'], ['Gilly', 'cat', 'sweet'], ['Old Marlin', 'wizard', 'wise']), lines: [['N', 'curious', 'fish', 'Under the Explox waves, the fish had invented something new: bicycles.'], ['A', 'excited', 'skate', 'Pedal, pedal, splash! This is so much faster than swimming!'], ['B', 'happy', 'skate', 'Look, I have a basket and a little bell! Ring ring!'], ['C', 'surprised', 'look', 'Fascinating. A fish needs a bicycle like a bicycle needs a fish.'], ['A', 'joy', 'jump', 'Try the ramp, Old Marlin! It makes a big, big splash!'], ['C', 'joy', 'jump', 'Whoa! I am flying! Fish can fly on bikes!'], ['B', 'joy', 'party', 'Bubble party at the coral! Bring your helmet!']] },
    { title: 'The Giant Duck Parade', place: 'city', prop: 'trophy', cast: C3(['Quackers', 'hero', 'goof'], ['Waddle Wendy', 'grandma', 'sweet'], ['Mr. Pond', 'king', 'rival']), lines: [['N', 'excited', 'party', 'Once a year, the biggest rubber duck in the world waddles through Explox.'], ['A', 'excited', 'look', 'Here it comes! Look at that giant yellow beak!'], ['B', 'joy', 'photo', 'Quack! Everybody say quack! Click!'], ['C', 'surprised', 'look', 'It is bigger than last year. And it is wearing a hat.'], ['A', 'joy', 'dance', 'Everybody waddle with the duck! Quack, quack, quack!'], ['B', 'joy', 'drum', 'Squeak, squeak, boom! The parade band is here!'], ['C', 'joy', 'highfive', 'Best parade ever. Quack to you too, big duck!']] },
    { title: 'Spaghetti Hair Salon', place: 'shop', prop: 'pizza', cast: C3(['Stylist Stella', 'hero', 'goof'], ['Customer Carl', 'robot', 'nervous'], ['Madame Meatball', 'grandma', 'wise']), lines: [['N', 'curious', 'cook', 'At the most unusual salon in Explox, every haircut is made of noodles.'], ['A', 'excited', 'cook', 'Welcome, Carl! Today we will give you spaghetti curls with extra sauce!'], ['B', 'worried', 'look', 'Will it come out? I have a wedding to go to. Of robots.'], ['C', 'warm', 'photo', 'Do not worry, darling. A little cheese makes any hairstyle stay.'], ['A', 'joy', 'dance', 'Voila! Your new hair is long, wavy and slightly spicy!'], ['B', 'joy', 'photo', 'I love it! Beep, I smell like dinner! Everyone will be so hungry.'], ['C', 'joy', 'party', 'Style and snacks. The Madame is always right.']] },
  ];
  function weirdProgram(v) {
    return program('\uD83C\uDF00 WEIRD VIDEO', v.title, 'Weird Voice', v.cast, [S(v.place, 'day', v.prop, v.title + '.', v.lines.map(l => L(l[0], l[1], l[2], l[3]))), S(v.place, 'day', v.prop, 'That was weird.', [L('A', 'joy', 'highfive', 'That was the weirdest thing ever!'), L('B', 'joy', 'party', 'Weirder than weird. Wonderful!')])]);
  }
  function weirdBlock(n) { const out = [], pool = WEIRDV.slice().sort(() => Math.random() - .5); for (let i = 0; i < n; i++) { out.push(weirdProgram(pool[i % pool.length])); if (i % 2 === 1 && i < n - 1) out.push('ad2'); } return out; }
  function shopBlock() { return ['ad2', 'ad2', 'ad2']; }
  function movieBlock(idx) { return ['ad1', idx, 'ad1']; }
  function liveBlock() { const m = CINEMA_MOVIES.filter(x => !x.tv); const mi = CINEMA_MOVIES.indexOf(m[Math.floor(Math.random() * m.length)]); const r = Math.random(); return r < .25 ? newsPrograms() : r < .45 ? funBlock(2).concat(['ad2']) : r < .6 ? weirdBlock(2).concat(['ad2']) : ['ad2', mi]; }

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
      '<button class="tvCh" id="tvWeird">\uD83C\uDF00 Weird Channel<small>Pizza rain, flying cows, talking toasters and other very weird things</small></button>' +
      '<button class="tvCh" id="tvShop">🛍️ Shopping Channel<small>Non-stop commercials for real products in Explox</small></button>' +
      '<button class="tvCh" id="tvLive">📺 Explox TV Live<small>A never-ending mix: news, videos, commercials and movies</small></button>' +
      (r ? '' : '<button class="tvCh" id="tvRent" style="border-color:#ffd54f">🔑 Rent this TV for one Explox day – ' + fmt(RENT) + ' S.I.P.<small>Watch everything for free for 30 real minutes (one Explox day)</small></button>') +
      '<div style="text-align:center;margin-top:10px"><button class="tvBtn" id="tvLeave" style="background:#333;color:#ccc">⏻ Turn off</button></div>';
    $('tvMovies').onclick = openMovies; $('tvNews').onclick = () => startTV(newsPrograms(), ''); $('tvFun').onclick = () => startTV(funBlock(4), ''); $('tvWeird').onclick = () => startTV(weirdBlock(4), ''); $('tvShop').onclick = () => startTV(shopBlock(), ''); $('tvLive').onclick = () => startTV(liveBlock(), 'live'); $('tvLeave').onclick = closeMenu;
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
  window.__exploxTV = { open: openMenu, status: () => ({ on: tv.on, rented: rented(), perMin: PER_MIN, rent: RENT }), news: newsPrograms, ads: adBreak };
})();
