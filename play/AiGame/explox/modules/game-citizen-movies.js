// ─── CITIZENS TALK ABOUT THE COOLEST MOVIES ─────────────────────────────────────────────────
// People walking around Explox now chat about the coolest movies in a speech bubble when you are near,
// and the neighbours in the Suburbs tell you their favourite when you talk to them.
// Every line uses the real movies from Explox Cinemas, including the newest ones.
(function () {
  'use strict';
  const COOL = ['The S.I.P. Team', 'The Great Pizza Delivery Dash', 'The Night the Moon Lost Its Glow', 'The Little Dragon Who Was Afraid to Fly', 'The Great Skate Showdown', 'The Concert That Lost Its Power', 'Turbo Heroes: Runaway Truck', 'Dino Rangers', 'The Great Treehouse Build-Off', 'The Treasure of the First S.I.P.', 'The Great Explox Balloon Race', 'The Snowman Who Wanted the Beach'];
  const hs = (a) => { let h = 2166136261; const s = String(a); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const real = () => (typeof CINEMA_MOVIES !== 'undefined' ? CINEMA_MOVIES.filter(m => m && !m.tv && m.title) : []);
  // the movies made since the first 35 (newest first), so citizens always know the latest ones
  const newest = () => { const r = real(); return r.length > 35 ? r.slice(35) : r.slice(-3).reverse(); };
  function chart() {
    const all = real(), byTitle = {}; all.forEach(m => { byTitle[m.title] = m; });
    const out = COOL.map(t => byTitle[t]).filter(Boolean);
    newest().slice(0, 6).forEach(m => { if (out.indexOf(m) < 0) out.push(m); });   // the newest movies are always in the talk
    return out;
  }
  function hook(mv) {
    const g = String(mv.genre || '').toLowerCase();
    if (/action|fight|mecha/.test(g)) return 'fight scenes';
    if (/space|sci/.test(g)) return 'rocket flights';
    if (/mystery|thriller|detective/.test(g)) return 'clues and twists';
    if (/music/.test(g)) return 'songs';
    if (/sport/.test(g)) return 'big match';
    if (/magic|fantasy/.test(g)) return 'magic';
    if (/rescue/.test(g)) return 'rescue';
    if (/comedy|family/.test(g)) return 'funniest jokes';
    if (/beach|camp|adventure|winter/.test(g)) return 'adventure';
    return 'ending';
  }
  const em = (mv) => (String(mv.icons || '🎬').match(/\p{Extended_Pictographic}/u) || ['🎬'])[0];
  // a citizen's line: what they say depends on who they are, and they remember their own favourite
  function line(name, salt) {
    const ch = chart(); if (!ch.length) return 'Have you been to Explox Cinemas? The movies are so cool!';
    const h = hs(name + '|' + (salt || 0)), fav = ch[hs(name) % ch.length], other = ch[(hs(name) + 3 + (h % 5)) % ch.length], news = newest()[0] || fav, k = h % 10;
    const T = (m) => '“' + m.title + '”';
    switch (k) {
      case 0: return T(fav) + ' is the COOLEST movie in Explox! ' + em(fav);
      case 1: return 'Have you seen ' + T(fav) + '? I love the ' + hook(fav) + '!';
      case 2: return 'I watched ' + T(fav) + ' three times. Best movie ever!';
      case 3: return 'My favorite movie is ' + T(fav) + '. What is yours?';
      case 4: return 'Everybody is talking about ' + T(news) + ', the newest movie at Explox Cinemas! ' + em(news);
      case 5: return 'I think ' + T(fav) + ' is cooler than ' + T(other) + '. No way, I say the other one!';
      case 6: return 'The top 3 coolest movies: ' + (ch[0] ? T(ch[0]) : '') + ', ' + (ch[1] ? T(ch[1]) : '') + ' and ' + (ch[2] ? T(ch[2]) : '') + '.';
      case 7: return 'You can watch every movie on the TV at home too! Or rent the TV for a whole day.';
      case 8: return 'The ' + hook(fav) + ' in ' + T(fav) + ' made me jump out of my seat! ' + em(fav);
      default: return 'There is a brand-new movie every 30 minutes at Explox Cinemas. Go and see the cool ones!';
    }
  }
  // 1. floating speech bubbles from people near you
  const lastSaid = {};
  function ambient() {
    try {
      if (typeof npcs === 'undefined' || !npcs.length || typeof playerGroup === 'undefined' || typeof showSpeechBubble !== 'function') return;
      const px = playerGroup.position.x, pz = playerGroup.position.z, now = Date.now(); let best = null, bd = 16;
      for (const n of npcs) { if (!n || !n.group || n.group.visible === false || !n.name) continue; const d = Math.hypot(px - n.group.position.x, pz - n.group.position.z); if (d < bd && (now - (lastSaid[n.name] || 0) > 28000)) { bd = d; best = n; } }
      if (!best) return;
      lastSaid[best.name] = now; let tx = '', tries = 0; do { tx = line(best.name, Math.floor(now / 60000) + tries); tries++; } while (tx.length > 118 && tries < 8); if (tx.length > 118) tx = 'Have you seen the new movies at Explox Cinemas? So cool!'; showSpeechBubble(best.group, best.name, tx);
    } catch (e) { }
  }
  setInterval(ambient, 7000);
  // 2. neighbours in the Suburbs: their favourite movie shows up when you talk to them
  let hooked = false;
  function hook2() {
    if (hooked || typeof window.openNeighborModal !== 'function') return;
    const orig = window.openNeighborModal; hooked = true;
    window.openNeighborModal = function (name) {
      const r = orig.apply(this, arguments);
      try {
        const body = document.getElementById('neighborModalBody'); if (!body) return r;
        const box = document.createElement('div'); box.id = 'neighborMovieChat'; box.style.cssText = 'margin:8px 0;padding:8px 10px;background:rgba(255,213,79,.1);border:1px solid #665500;border-radius:8px;font-size:12px;color:#ffe082;text-align:left;';
        let n = 0; const say = () => { box.innerHTML = '🎬 <b>' + name + ':</b> “' + line(name, n++).replace(/</g, '&lt;') + '” <button style="margin-left:6px;padding:2px 8px;border-radius:6px;border:0;cursor:pointer;background:#e94560;color:#fff;font-size:11px;">Ask again</button>'; box.querySelector('button').onclick = say; };
        say(); body.insertBefore(box, body.firstChild);
      } catch (e) { }
      return r;
    };
  }
  setInterval(hook2, 1000); hook2();
  window.__citizenMovies = { line: line, chart: () => chart().map(m => m.title) };
})();
