// ─── SAI IS NOW MUCH FRIENDLIER ───────────────────────────────────────────────────────────────
// SAI (Super Artificial Intelligence) is the helper in the T menu. This makes it warm and kind: it greets you by name,
// chats about how you feel, tells jokes, cheers you on, cheers you up, says thank you and goodbye nicely, gives a
// kind answer even when it does not know, reminds you to stay safe online, and now knows about the newest things
// (Explox Fresh Market, E.D delivery, Explox TV). Everything is written text on your own computer. No outside AI.
(function () {
  'use strict';
  if (typeof saiAnswer !== 'function' || typeof SAI_KB === 'undefined') return;
  const me = () => { try { const n = (typeof currentUser !== 'undefined' && currentUser) ? String(currentUser) : ''; return (n && n !== 'guest') ? n : 'friend'; } catch (e) { return 'friend'; } };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const hasWord = (t, re) => re.test(t);

  // ── new knowledge, so SAI can answer questions about the newest parts of the game ───────────
  const NEW = [
    { keys: ['supermarket', 'fresh market', 'groceries', 'grocery', 'food shop', 'buy food'], reply: '🛒 Explox Fresh Market is a big supermarket with a green awning! Walk in, press E at a product to put it in your cart, then pay at a checkout lane. You can eat the food from the E.D "My Stuff" tab. Check the Map tab to find it!' },
    { keys: ['e.d', 'ed delivery', 'explox delivery', 'delivery', 'deliver', 'shipping'], reply: '📦 E.D (Explox Delivery) brings anything from anywhere! Press the orange E.D button, pick an item or type what you want, and pay the price plus shipping (5 S.I.P. per 100 metres). A real box arrives near you. Press O next to it to open it!' },
    { keys: ['tv', 'television', 'tv shows', 'shows', 'channel', 'watch tv'], reply: '📺 Explox TV has movies, news, soccer, fights and 20 action shows with a new episode every day! Rent the TV for a day, or pay a little per minute. During commercials, press BUY NOW to order the product with E.D!' },
    { keys: ['theme song', 'intro'], reply: '🎵 Every TV show has its own intro and theme song with sing-along words. E.D has a theme song too. Press the 🎵 Theme button in the E.D window!' },
    { keys: ['hungry', 'hunger', 'starving'], reply: '🍽️ If your hunger bar is low, eat! Buy food at Explox Fresh Market or order it with E.D, then press Eat in the E.D "My Stuff" tab. Yum!' },
  ];
  NEW.slice().reverse().forEach(e => { if (!SAI_KB.some(k => k.keys[0] === e.keys[0])) SAI_KB.unshift(e); });   // first, so they win over the generic 'work' entry

  // ── small talk ──────────────────────────────────────────────────────────────────────────────
  const JOKES = ['Why did the robot go to the Explox Cinema? It wanted to watch a bolt-buster! 🤖', 'What do you call a dinosaur that never gives up? A try-ceratops! 🦖', 'Why was the pizza so happy? It was on a roll! 🍕', 'What did the ghost say in the supermarket? Boo-nanas! 👻🍌', 'Why did the cookie go to the doctor? It felt crumby! 🍪'];
  const FACTS = ['Did you know? A bank is a safe place to keep your S.I.P. so you do not lose it! 🏦', 'Fun fact: a group of dinosaurs is called a herd! 🦖', 'Fun tip: the Explox Cinema gets a brand new movie every 30 minutes! 🎬', 'Fun tip: try the Explox TV shows. There is a new episode every day! 📺'];
  function chat(t) {
    const n = me();
    if (hasWord(t, /\b(thank|thanks|thx|ty)\b/)) return pick(['🤖 You are so welcome, ' + n + '! Helping you makes my day! 😊', '🤖 Anytime, ' + n + '! That is what friends are for! 💚', '🤖 My pleasure! Ask me anything, any time! ✨']);
    if (hasWord(t, /\b(bye|goodbye|good night|goodnight|see you|cya|gtg)\b/)) return pick(['🤖 Bye, ' + n + '! Have a super day, and come back soon! 👋', '🤖 Goodbye, ' + n + '! Be kind, have fun, and see you next time! 🌟']);
    if (hasWord(t, /\b(how are you|how r u|hows it going|how is it going|you ok|whats up|what's up)\b/)) return pick(['🤖 I am wonderful, thank you for asking, ' + n + '! 😄 How are YOU today?', '🤖 Happy and ready to help! How is your day going, ' + n + '? 💚']);
    if (hasWord(t, /\b(i am good|i'm good|im good|i am fine|i'm fine|im fine|i am great|i'm great|im great|im happy|i am happy|i'm happy)\b/)) return '🤖 Yay, I am so glad to hear that, ' + n + '! 🎉 What would you like to do today?';
    if (hasWord(t, /\b(who are you|what are you|your name|what is sai|what's sai)\b/)) return '🤖 I am SAI, your friendly helper in Explox! I know about the city, the shops, the jobs and lots more. I am here to help you, and I will never be mean. 💚';
    if (hasWord(t, /\b(who made you|who built you|who created you)\b/)) return '🤖 I was made by the people who build Explox, and I got friendlier with a lot of help from you! 😊';
    if (hasWord(t, /\b(joke|funny|make me laugh|laugh)\b/)) return '🤖 ' + pick(JOKES) + ' 😂 Want another one?';
    if (hasWord(t, /\b(fact|tell me something|something cool)\b/)) return '🤖 ' + pick(FACTS);
    if (hasWord(t, /\b(bored|boring|nothing to do)\b/)) return pick(['🤖 Let us fix that, ' + n + '! Try the Explox TV, ride on the obby, order something with E.D, or go shopping at Explox Fresh Market! 🎉', '🤖 Boredom, begone! 🎈 How about a movie at Explox Cinemas, or a game at the arcade? There is so much to do!']);
    if (hasWord(t, /\b(sad|lonely|alone|unhappy|upset|cry|crying|scared|afraid)\b/)) return '🤖 Oh no, I am sorry you feel that way, ' + n + '. 💙 You are not alone, and your feelings matter. Take a slow, deep breath. If something is really bothering you, tell a grown-up you trust, like a parent. I am here for you too.';
    if (hasWord(t, /\b(angry|mad|annoyed|frustrated)\b/)) return '🤖 It is okay to feel mad sometimes, ' + n + '. 💛 Try taking three slow breaths. Then we can try again together. You are doing great!';
    if (hasWord(t, /\b(love you|like you|best|you are great|you are awesome|you rock|you are nice)\b/)) return '🤖 Aww, thank you, ' + n + '! You are awesome too! 🥰💚';
    if (hasWord(t, /\b(i am lost|im lost|i'm lost|i cant find|i can't find|help me)\b/)) return '🤖 Do not worry, ' + n + ', I will help! Open the Map tab, tap where you want to go, and a line shows you the way. Or ask me about any place! 🗺️';
    if (hasWord(t, /\b(stupid|dumb|hate you|shut up)\b/)) return '🤖 That is okay, ' + n + '. Maybe you are having a tough moment. 💙 I will still be kind and I am still here to help whenever you want.';
    if (hasWord(t, /\b(my name|my address|phone number|my school|where do i live|password|my age)\b/) || hasWord(t, /\b(i live|i go to)\b/)) return '🤖 Great job being careful, ' + n + '! 🛡️ Never share your real name, address, school, phone number or passwords online. If anyone asks for them, stop talking to them and tell a parent right away.';
    return null;
  }

  // ── friendly wrapper around the normal answers ──────────────────────────────────────────────
  const OPEN = ['', '', '', 'Great question, ' + '@' + '! ', 'Happy to help, ' + '@' + '! ', 'Sure thing, ' + '@' + '! ', 'Ooh, good one! '];
  const CLOSE = ['', '', ' 😊', ' Anything else I can help with?', ' You are doing great! 🌟', ' Have fun out there! 🎉'];
  const orig = saiAnswer;
  saiAnswer = function (q) {
    const t = String(q || '').toLowerCase();
    const c = chat(t); if (c) return c;
    let r = orig.apply(this, arguments);
    const n = me();
    if (/^🤔 I'm not sure about that/.test(r) || r.indexOf("I'm not sure about that") === 0) {
      return '🤔 Hmm, I am not sure about that one yet, ' + n + ', but I am still learning! 💚 Try asking me about controls, places, jobs, the bank, weapons, shops, E.D delivery, the supermarket, TV, mini games or the map. Or ask for a joke! 😄' + (r.indexOf('Did you mean') > -1 ? ' ' + r.slice(r.indexOf('Did you mean')) : '');
    }
    const o = pick(OPEN).replace('@', n), cl = pick(CLOSE);
    return (o ? '🤖 ' + o : '') + r.replace(/^🤖 /, '') + cl;
  };

  // ── friendly welcome message, and the supermarket on SAI's map ──────────────────────────────
  function welcome() {
    try {
      const box = document.getElementById('saiMessages'); if (!box || box.__friendly) return; box.__friendly = true;
      const first = box.firstElementChild; const n = me();
      if (first) first.textContent = '🤖 Hello, ' + n + '! 💚 I am SAI, your friendly helper. Ask me anything about Explox, or just say hi! I can also tell jokes. 😄';
    } catch (e) { }
  }
  let mapped = false;
  function map() {
    if (mapped || typeof SAI_LOCATIONS === 'undefined' || !window.__supermarket || !window.__supermarket.site) return;
    const s = window.__supermarket.site; mapped = true; SAI_LOCATIONS.push({ label: 'Fresh Market', x: s.x, z: s.z + 12, color: '#66bb6a', emoji: '🛒' });
  }
  setInterval(() => { welcome(); map(); }, 2000);
  window.__saiFriendly = { chat: chat, answer: (q) => saiAnswer(q) };
})();
