/* bot-fuzzy.js — typo + "different wording" tolerance, shared by SAI (game-sai.js) and the
   website's Ask Explox FAQ bot (index.html). Both bots are keyword tables, not AIs, so this sits in
   FRONT of their existing exact matchers instead of replacing them:

     prepare()   fixes typos (edit distance against the bots' OWN keyword vocabulary), strips simple
                 endings (hired -> hire), and rewrites a short list of synonyms/phrasings
                 ("recruit people", "get killed") into the words the keys already use.
                 Words the bot already knows are never touched, so a correctly-spelled question
                 reaches the exact matcher exactly as before.
     retrieve()  only for questions the exact matcher still can't answer: scores every answer by how
                 many (IDF-weighted) keyword tokens the question shares with it, and either picks one
                 confidently or offers "did you mean" suggestions.

   Plain ES5 on purpose (it is loaded by both the game and the landing page). */
var BotFuzzy = (function () {
  'use strict';

  // Everyday words that must never be "corrected" into a game keyword (ship -> shop, walk -> wall...).
  var COMMON = ('a about above act add after again age ago all almost already also always am among an and another any anybody anyone anything are around as ask at away back bad be because become been before begin behind being believe below best better between big bit both boy but buy by call came can cannot care carry case change check child children choose city clean close come comes common could country course cut deal did different do does doing done door down draw during each early easy eat else end enough even ever every example eye face fact fall family far fast feel few find fine first follow food for form found friend from front full fun game games gave get gets getting girl give given go goes going gone good got great group grow guess had half hand happen hard has have he hear heard help her here high him his hold home hope hour house how however huge idea if important in inside instead into is it its job just keep kind knew know known large last late later learn least leave left less let life light like line list little live long look lot lots love low made make makes many may maybe me mean might mind miss more most move much must my name near need never new next nice night no none nor not nothing now number of off often oh old on once one only open or order other our out over own page part pass past people person place plan play please point possible power press pretty problem put question quick quite rather read ready real really reason red remember right room round run said same saw say school second see seem seen sense set several shall she short should show side since small so some someone something sometimes soon sort sound start state stay still stop story strong such sure take talk tell than thank thanks that the their them then there these they thing things think this those though thought three through time to today together told too took top toward town tried true try turn two under understand until up upon us use used useful usually very wait walk want wanted was watch water way we well went were what when where whether which while white who whole whose why will wish with within without won word words work world would write wrong year years yes yet you young your yours').split(' ');

  // Filler words that carry no topic — ignored when scoring which answer a question is closest to.
  var STOP = {};
  ('a an the and or but if so of to in on at by for from with as is are was were be been am do does did can could would should will shall may might must i me my you your we our it its they them their he she him her this that these those what when where which who why how there here any some about into over out up down not no yes please tell show want need know get gets got go going let like also just very really thing things stuff').split(' ').forEach(function (w) { STOP[w] = 1; });

  var CONTRACT = { whats: "what's", wheres: "where's", hows: "how's", whos: "who's", thats: "that's" };

  // Very common misspellings of small words (too short for the edit-distance pass to touch safely).
  var FIXES = { teh: 'the', hwo: 'how', wher: 'where', whre: 'where', waht: 'what', wnat: 'want', taht: 'that', adn: 'and', yuo: 'you', thier: 'their', tehy: 'they', becuase: 'because', woud: 'would', cna: 'can', wiht: 'with' };

  // Different wording -> the word the keys already use. Applied ONLY to words that are not themselves
  // a keyword in the bot, so it can never change the meaning of a question that already worked.
  var SYN = {
    employ: 'hire', employed: 'hire', employing: 'hire', employs: 'hire', recruit: 'hire', recruiting: 'hire', recruited: 'hire', enlist: 'hire',
    gun: 'weapon', guns: 'weapon', pistol: 'weapon', rifle: 'weapon', firearm: 'weapon', knife: 'weapon', spear: 'weapon', crossbow: 'weapon',
    cash: 'money', dollars: 'money', dollar: 'money', income: 'money', rich: 'money', riches: 'money', wealth: 'money', wealthy: 'money', funds: 'money', gold: 'money', coins: 'money', salary: 'money', wage: 'money', wages: 'money', paycheck: 'money',
    dead: 'die', perish: 'die', perished: 'die', faint: 'knocked out', fainted: 'knocked out', knockout: 'knocked out', ko: 'knocked out', killed: 'knocked out', slain: 'knocked out',
    buttons: 'controls', keybinds: 'controls', keybindings: 'controls', hotkeys: 'controls', hotkey: 'controls', control: 'controls', controller: 'controls', joystick: 'controls',
    program: 'apps', programs: 'apps', software: 'apps', application: 'apps', applications: 'apps',
    pc: 'computer', laptop: 'computer', browse: 'browser', browsing: 'browser', website: 'browser', websites: 'browser',
    humor: 'joke', humour: 'joke', pun: 'joke', puns: 'joke',
    animation: 'emote', animations: 'emote', gesture: 'emote', gestures: 'emote', taunt: 'emote', taunts: 'emote',
    easier: 'difficulty', harder: 'difficulty', hardcore: 'difficulty',
    pawn: 'sell', auction: 'sell',
    starving: 'hungry', famished: 'hungry', ravenous: 'hungry',
    career: 'job', occupation: 'job', employment: 'job', gig: 'job',
    stories: 'book', story: 'book', novel: 'book', novels: 'book',
    hurt: 'doctor', injured: 'doctor', wounded: 'doctor', health: 'doctor', hp: 'doctor',
    purchase: 'buy', purchased: 'buy', purchasing: 'buy',
    stuck: 'help', confused: 'help', clueless: 'help',
    greetings: 'hello', yo: 'hello', howdy: 'hello', hiya: 'hello', heya: 'hello',
    u: 'you', ur: 'your', r: 'are', pls: 'please', plz: 'please', ppl: 'people', thx: 'thanks', ty: 'thanks',
    wat: 'what', wut: 'what', hw: 'how', wen: 'when', wher: 'where', abt: 'about'
  };

  // Whole-phrase rewrites for common ways of asking that no single synonym can fix.
  var PHRASES = [
    [/\bex\s+gun\b/g, 'exgun'], // before the synonym pass turns "gun" into "weapon"
    [/\bhow\s+2\b/g, 'how to'],
    [/\b(?:get|have|make|let|can|could)\s+(?:other\s+)?(?:people|players|someone|somebody|friends|others)\s+(?:to\s+)?(?:work|chop|gather|collect|farm|mine|grind)\b/g, 'hire players'],
    [/\b(?:work|works|working|chop|chopping|gather|gathering|farm|farming|collect|collecting)\s+for\s+me\b/g, 'hire players'],
    [/\b(?:will|does|do|can|is|are)\b[^?.!]{0,25}\b(?:lose|lost|erase[ds]?|delete[ds]?|keep|remember|store[sd]?|saves?|saved|saving)\b[^?.!]{0,25}\b(?:game|progress|data|character|account|file)\b/g, 'does it save my progress'],
    [/\bhow\s+(?:do|can)\s+(?:i|you)\s+save\b/g, 'does it save my progress'],
    // Movement questions — anchored to the END of the question so "how do i walk to the bank" is
    // left alone for the bank answer instead of being turned into a controls question.
    [/\bhow\s+(?:do|can|could|would|to)\s+(?:i\s+|you\s+|we\s+)?(?:walk|steer|turn|sprint|aim|look around|control|use the keyboard|use the mouse)(?=\s*[?.!]*\s*$)/g, 'how do i move'],
    [/\bhow\s+(?:do|can|could|would|to)\s+(?:i\s+)?(?:make|get)\s+(?:my|the|a)\s+(?:character|player|guy|person|avatar)\s+(?:to\s+)?(?:walk|move|run|jump|look|turn)(?=\s*[?.!]*\s*$)/g, 'how do i move'],
    [/\bwhat\s+(?:are|is)\s+the\s+(?:buttons|keys|keybinds|hotkeys|key bindings)\b/g, 'controls'],
    [/\b(?:get|getting)\s+(?:killed|dead|beaten up|knocked out)\b/g, 'knocked out'],
    [/\bgame\s+over\b/g, 'knocked out'],
    [/\b(?:pay|paying)\b[^?.!]{0,20}\b(?:players|people|someone|somebody)\b[^?.!]{0,25}\b(?:collect|gather|chop|work|farm|mine|grind)\b/g, 'hire players'],
    [/\b(?:turn off|get rid of|remove|disable|stop|hide from|avoid)\b[^?.!]{0,20}\b(?:monsters?|enemies|enemy|mobs?|killers?|danger)\b/g, 'peaceful mode'],
    [/\bmake\b[^?.!]{0,12}\b(?:monsters?|enemies|mobs?)\b[^?.!]{0,12}\b(?:go away|leave|disappear|stop)\b/g, 'peaceful mode'],
    [/\bplay(?:ing)?\s+(?:together|with\s+(?:a\s+|my\s+|some\s+)?(?:friends?|buddy|buddies|others|people|family))\b/g, 'play with friends'],
    [/\b(?:fastest|quickest|easiest)\s+way\s+to\s+(?:travel|get around|go around|move around)\b/g, 'fast travel'],
    [/\b(?:buy|purchase|get|shop)\b[^?.!]{0,25}\b(?:from|off|at)\s+(?:other\s+|another\s+|a\s+|some\s+)?(?:players?|people|friends?)\b/g, 'buy from a player'],
    [/\bsell\b[^?.!]{0,25}\b(?:to|for)\s+(?:other\s+|another\s+)?(?:players?|people)\b/g, 'sell items'],
    [/\bhow\s+many\b[^?.!]{0,30}\b(?:kills?|defeated|killed|beaten)\b/g, 'total kills'],
    [/\bread(?:ing)?\s+(?:some\s+|a\s+)?(?:stories|story|novels?)\b/g, 'read a book'],
    [/\b(?:get|download|add)\s+(?:an?\s+|some\s+|new\s+)?(?:apps?|programs?|software)\b/g, 'install apps']
  ];

  // "crème brûlée" and "creme brulee" are the same word to a person.
  function fold(s) { s = String(s); return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s; }
  function tokenize(s) { return fold(String(s).toLowerCase()).replace(/[‘’´`]/g, "'").match(/[a-z0-9']+/g) || []; }
  function trimAp(t) { return t.replace(/^'+|'+$/g, ''); }

  // Optimal-string-alignment edit distance (insert / delete / substitute / swap two neighbours),
  // bailing out as soon as it can't stay within `max`.
  function dl(a, b, max) {
    var al = a.length, bl = b.length;
    if (Math.abs(al - bl) > max) return max + 1;
    var prev2 = null, prev = [], cur, i, j, rowMin, v, cost;
    for (j = 0; j <= bl; j++) prev[j] = j;
    for (i = 1; i <= al; i++) {
      cur = [i]; rowMin = i;
      for (j = 1; j <= bl; j++) {
        cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) v = Math.min(v, prev2[j - 2] + 1);
        cur[j] = v; if (v < rowMin) rowMin = v;
      }
      if (rowMin > max) return max + 1;
      prev2 = prev; prev = cur;
    }
    return prev[bl];
  }

  function undouble(s) { return s.length > 2 && s.charAt(s.length - 1) === s.charAt(s.length - 2) ? s.slice(0, -1) : s; }
  function stems(t) {
    var out = [], b;
    if (/ies$/.test(t) && t.length > 4) out.push(t.slice(0, -3) + 'y');
    if (/ing$/.test(t) && t.length > 5) { b = t.slice(0, -3); out.push(b, b + 'e', undouble(b)); }
    if (/ed$/.test(t) && t.length > 4) { b = t.slice(0, -2); out.push(b, b + 'e', undouble(b), t.slice(0, -1)); }
    if (/es$/.test(t) && t.length > 4) out.push(t.slice(0, -2), t.slice(0, -1));
    if (/s$/.test(t) && t.length > 3) out.push(t.slice(0, -1));
    if (/ly$/.test(t) && t.length > 5) out.push(t.slice(0, -2));
    return out;
  }

  // entries: [{ keys:[...], text:'...' }]. Only the first `handCount` entries take part in retrieval
  // (the FAQ bot appends hundreds of generated movie/neighbor/price entries after its hand-written
  // ones); ALL entries contribute to the vocabulary used to fix typos (so "mayaa" -> "maya").
  function build(entries, handCount) {
    var ctx = { n: handCount || entries.length, keyVocab: {}, known: {}, tokSets: [], keyLists: [], idf: {}, candidates: [] };
    var i, j, k, toks, t, seen, df = {}, N;
    for (i = 0; i < entries.length; i++) {
      seen = {};
      for (j = 0; j < entries[i].keys.length; j++) {
        toks = tokenize(entries[i].keys[j].replace(/-/g, ' '));
        for (k = 0; k < toks.length; k++) {
          t = trimAp(toks[k]); if (!t) continue;
          ctx.known[t] = 1;
          if (!seen[t]) { seen[t] = 1; ctx.keyVocab[t] = (ctx.keyVocab[t] || 0) + 1; }
        }
      }
      toks = tokenize(entries[i].text || '');
      for (k = 0; k < toks.length; k++) { t = trimAp(toks[k]); if (t) ctx.known[t] = 1; }
    }
    for (i = 0; i < COMMON.length; i++) ctx.known[COMMON[i]] = 1;

    N = ctx.n;
    for (i = 0; i < N; i++) {
      var set = {}, lists = [], kt;
      for (j = 0; j < entries[i].keys.length; j++) {
        kt = tokenize(entries[i].keys[j].replace(/-/g, ' ')).map(trimAp).filter(function (x) { return x && !STOP[x]; });
        for (k = 0; k < kt.length; k++) set[kt[k]] = 1;
        if (kt.length >= 2) lists.push(kt);
      }
      ctx.tokSets[i] = set; ctx.keyLists[i] = lists;
      for (t in set) df[t] = (df[t] || 0) + 1;
    }
    for (t in df) ctx.idf[t] = Math.log(1 + N / df[t]);
    for (t in ctx.keyVocab) if (t.length >= 4 && !/\d/.test(t)) ctx.candidates.push(t);
    return ctx;
  }

  // Every plausible replacement for an UNKNOWN word: simple-ending strips (hired -> hire) and the
  // closest keywords by edit distance. Several can tie ("mary" -> marry / many) — prepare() then
  // lets the bot's own matcher pick the one that produces the most specific answer.
  function candidatesFor(ctx, t) {
    if (CONTRACT[t] && !ctx.known[t]) return [{ to: CONTRACT[t], kind: 'stem' }];
    if (FIXES[t] && !ctx.keyVocab[t]) return [{ to: FIXES[t], kind: 'typo' }];
    if (t.length < 4 || /\d/.test(t) || ctx.known[t] || SYN[t]) return []; // a word we have a rewrite for is not a typo
    var out = [], seen = {}, s = stems(t), i;
    for (i = 0; i < s.length; i++) if (s[i].length >= 3 && ctx.keyVocab[s[i]] && !seen[s[i]]) { seen[s[i]] = 1; out.push({ to: s[i], kind: 'stem' }); }
    var maxd = t.length <= 7 ? 1 : 2, group = [], bd = 99, bsame = 0, c, d, same;
    for (i = 0; i < ctx.candidates.length; i++) {
      c = ctx.candidates[i];
      if (Math.abs(c.length - t.length) > maxd) continue;
      if (t.length <= 5 && c.charAt(0) !== t.charAt(0)) continue; // short words: a typo rarely changes the first letter, and guessing is riskiest here
      d = dl(t, c, maxd); if (d > maxd) continue;
      same = c.charAt(0) === t.charAt(0) ? 1 : 0;
      if (d < bd || (d === bd && same > bsame)) { group = [c]; bd = d; bsame = same; }
      else if (d === bd && same === bsame) group.push(c);
    }
    group.sort(function (a, b) { return ctx.keyVocab[a] - ctx.keyVocab[b]; }); // rarer (more specific) words first
    for (i = 0; i < group.length && i < 5; i++) if (!seen[group[i]]) { seen[group[i]] = 1; out.push({ to: group[i], kind: 'typo' }); }
    return out;
  }

  // Returns { text, display, typos }. `display` has only spelling fixes applied (safe to show the
  // player: 'Reading that as "…"'); `text` additionally has the synonym/phrase rewrites and is what
  // the bots' exact matchers should run on. `tester` (optional) is the bot's own matcher scored as
  // text -> number (0 = no match, bigger = more specific match); it breaks ties between candidates.
  function prepare(ctx, raw, tester) {
    var typos = [];
    var src = fold(String(raw).toLowerCase()).replace(/[‘’´`]/g, "'");
    var re = /[a-z0-9']+/g, parts = [], toks = [], last = 0, m, ti, ci, idx, mm, core, cands, pick, bestScore, sc;
    while ((m = re.exec(src))) { parts.push(src.slice(last, m.index)); parts.push(m[0]); toks.push(parts.length - 1); last = m.index + m[0].length; }
    parts.push(src.slice(last));
    for (ti = 0; ti < toks.length; ti++) {
      idx = toks[ti]; mm = /^('*)(.*?)('*)$/.exec(parts[idx]); core = mm[2];
      if (!core) continue;
      cands = candidatesFor(ctx, core);
      if (!cands.length) continue;
      pick = cands[0];
      if (cands.length > 1 && tester) {
        bestScore = -1;
        for (ci = 0; ci < cands.length; ci++) {
          parts[idx] = mm[1] + cands[ci].to + mm[3];
          sc = tester(parts.join('')) || 0;
          if (sc > bestScore) { bestScore = sc; pick = cands[ci]; }
        }
      }
      parts[idx] = mm[1] + pick.to + mm[3];
      if (pick.kind === 'typo') typos.push([core, pick.to]);
    }
    function rewrite(t) {
      var k;
      for (k = 0; k < PHRASES.length; k++) t = t.replace(PHRASES[k][0], PHRASES[k][1]);
      return t.replace(/[a-z0-9']+/g, function (tok) {
        var core = trimAp(tok), s = SYN[core];
        return (s && !ctx.keyVocab[core]) ? s : tok;
      });
    }
    var display = parts.join(''), text = rewrite(display);
    // A spelling "fix" must earn its keep: if the question ALREADY gets a match as typed, keep the
    // fixes only when they lead to a more specific one. (An unfamiliar real word like "cool" would
    // otherwise be "corrected" to "cook" and hijack a perfectly good question about stores.)
    if (typos.length && tester) {
      var textRaw = rewrite(src), s0 = tester(textRaw) || 0;
      if (s0 > 0 && (tester(text) || 0) <= s0) { display = src; text = textRaw; typos = []; }
    }
    return { text: text, display: display, typos: typos };
  }

  function retrieve(ctx, text) {
    var toks = tokenize(text), qt = [], seen = {}, i, j, k, t, out = { index: -1, confident: false, suggestions: [] };
    for (i = 0; i < toks.length; i++) {
      t = trimAp(toks[i]);
      if (!t || STOP[t] || /^\d+$/.test(t) || seen[t]) continue;
      seen[t] = 1; qt.push(t);
    }
    var scored = [], set, s, m, strong, w, lists, all;
    for (i = 0; i < ctx.n; i++) {
      set = ctx.tokSets[i]; s = 0; m = 0; strong = 0;
      for (j = 0; j < qt.length; j++) {
        t = qt[j];
        if (set[t]) { w = ctx.idf[t]; s += w; m++; if (t.length >= 5 && w >= 2.6) strong++; }
      }
      lists = ctx.keyLists[i];
      for (j = 0; j < lists.length; j++) {
        all = true;
        for (k = 0; k < lists[j].length; k++) if (!seen[lists[j][k]]) { all = false; break; }
        if (all) { s += 1.5; break; } // every word of a multi-word key is present, just not adjacent / in order
      }
      if (s > 0) scored.push({ i: i, s: s, m: m, strong: strong });
    }
    scored.sort(function (a, b) { return b.s - a.s; });
    var best = scored[0], second = scored[1];
    if (!best) return out;
    // Confident only if the answer is clearly ahead AND it explains a fair share of what was asked —
    // one shared word out of five ("who won the WORLD cup") is not enough to answer with World Events.
    var coverage = best.m / Math.max(1, qt.length);
    if (best.s >= 2.0 && (!second || best.s >= second.s * 1.35) && (best.m >= 2 || best.strong >= 1) && (coverage >= 0.5 || best.m >= 3)) { out.index = best.i; out.confident = true; return out; }
    for (i = 0; i < scored.length && out.suggestions.length < 2; i++) if (scored[i].s >= 1.0) out.suggestions.push(scored[i].i);
    return out;
  }

  return { build: build, prepare: prepare, retrieve: retrieve, tokenize: tokenize, fold: fold, _dl: dl };
})();
