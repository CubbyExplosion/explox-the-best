// ─── EXPLOX SAFETY ───────────────────────────────────────────────────────────────────────────────
// Explox is an ONLINE game with a shared global chat, real-money purchases and a lot of flashing effects, and kids play it. This file adds the
// player-side protections. It loads LAST (after game-library.js) because it wraps functions defined by the other modules:
//
//   🧼 CHAT FILTER      exploxCleanChat(text): masks swearing / slurs, e-mail addresses, phone numbers and links. Applied to what you SEND
//                       (sendChatMessage), what you RECEIVE (chatAddMsg, showChatTabPreview) and speech bubbles (showSpeechBubble).
//                       The server has the same filter (explox/server-node/server.js) so nobody can skip it with a modified client —
//                       but the server must be RESTARTED to pick that up. A filter is never perfect: it is a safety net, not a guarantee.
//   🐌 RATE LIMIT       no more than 1 chat message per 1.2 s and 6 per 15 s (stops spam / flooding).
//   💳 PURCHASE GATE    a real-money purchase (buyCurrencyPackage / buyCurrencyPackageEmbedded) now asks first: "must be 18+ or have a parent's
//                       permission". It is a speed bump, not age verification — real age checks need the payment provider / the server.
//   ⚠️ SAFETY NOTICE    shown once (and any time via exploxSafety()): flashing-light / epilepsy warning, don't share personal info in chat,
//                       real purchases need an adult, and what online mode shares with the server.
(function () {
  'use strict';

  // ---------- 1. the filter ----------
  // stems that are masked wherever they appear in a word (after turning leet-speak back into letters)
  var BAD_STEMS = ['fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'bastard', 'nigg', 'fagg', 'faggot', 'retard', 'rape', 'rapist', 'nazi', 'porn', 'sex', 'nude', 'nudes', 'kys', 'cock', 'penis', 'vagina', 'boob', 'tits'];
  var LEET = { '@': 'a', '4': 'a', '0': 'o', '1': 'i', '!': 'i', '3': 'e', '$': 's', '5': 's', '7': 't', '+': 't', '8': 'b' };
  function plain(s) {
    var o = ''; s = String(s).toLowerCase();
    for (var i = 0; i < s.length; i++) { var c = s.charAt(i); o += LEET[c] !== undefined ? LEET[c] : c; }
    return o.replace(/[^a-z]/g, '').replace(/(.)\1{2,}/g, '$1$1');           // letters only, "fuuuuck" -> "fuuck"
  }
  function squash(s) { return s.replace(/(.)\1+/g, '$1'); }                   // "fuuck" -> "fuck"
  function isBad(token) {
    var p = plain(token); if (p.length < 3) return false;
    var q = squash(p);
    for (var i = 0; i < BAD_STEMS.length; i++) {
      var st = BAD_STEMS[i];
      if (st.length <= 4) { if (q === st || q === st + 's' || q === st + 'ing' || q === st + 'ed' || q === st + 'er' || q === st + 'y') return true; }   // short stems: whole word only ("sex" must not hide "essex")
      else if (q.indexOf(st) !== -1) return true;
    }
    return false;
  }
  function exploxCleanChat(text) {
    var t = String(text == null ? '' : text);
    t = t.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[hidden]');                                         // e-mail
    t = t.replace(/(https?:\/\/|www\.)\S+/gi, '[link hidden]');                                      // links
    t = t.replace(/\b[\w-]+\.(com|net|org|io|gg|me|tv|co|xyz|app|ly|to|us|uk)\b\S*/gi, '[link hidden]');
    t = t.replace(/\+?\d[\d\s().-]{6,}\d/g, '[hidden]');                                             // phone-like numbers
    t = t.split(/(\s+)/).map(function (tok) { return /\S/.test(tok) && isBad(tok) ? tok.replace(/[^\s]/g, '*') : tok; }).join('');
    // spaced-out swearing ("f u c k"): check runs of single letters
    t = t.replace(/\b(?:[a-z][\s.\-_*]+){2,}[a-z]\b/gi, function (m) { return isBad(m.replace(/[\s.\-_*]/g, '')) ? m.replace(/[^\s]/g, '*') : m; });
    return t.slice(0, 200);
  }
  window.exploxCleanChat = exploxCleanChat;

  // ---------- 2. wrap the game's chat functions ----------
  var sentAt = [];
  function rateOk() {
    var now = Date.now();
    sentAt = sentAt.filter(function (t) { return now - t < 15000; });
    if (sentAt.length && now - sentAt[sentAt.length - 1] < 1200) return false;
    if (sentAt.length >= 6) return false;
    sentAt.push(now); return true;
  }
  function wrapAll() {
    if (typeof sendChatMessage === 'function') {
      var origSend = sendChatMessage;
      sendChatMessage = function () {
        var input = document.getElementById('chatInput');
        if (input && input.value && !/^\s*\//.test(input.value) && !(typeof chatMode !== 'undefined' && chatMode === 'devtalk')) {   // (commands like /pay and the private Dev Talk are left alone)
          if (!rateOk()) { if (typeof showNotif === 'function') showNotif('🐌 Slow down a little — you are sending messages too fast.'); return; }
          input.value = exploxCleanChat(input.value);
        }
        return origSend.apply(this, arguments);
      };
    }
    if (typeof chatAddMsg === 'function') {
      var origAdd = chatAddMsg;
      chatAddMsg = function (label, text, isMine) { return origAdd.call(this, label, isMine ? text : exploxCleanChat(text), isMine); };
    }
    if (typeof showChatTabPreview === 'function') {
      var origPrev = showChatTabPreview;
      showChatTabPreview = function (name, text) { return origPrev.call(this, name, exploxCleanChat(text)); };
    }
    if (typeof showSpeechBubble === 'function') {
      var origBub = showSpeechBubble;
      showSpeechBubble = function (obj, name, text) { return origBub.call(this, obj, name, exploxCleanChat(text)); };
    }
  }

  // ---------- 3. real-money purchases ask an adult first ----------
  function purchaseGate() {
    return window.confirm('💳 REAL MONEY\n\nThis is a real purchase with real money.\n\nYou must be 18 or older, or have a parent or guardian\'s permission (and ask them to help).\n\nPress OK only if that is true.');
  }
  function wrapPurchases() {
    ['buyCurrencyPackage', 'buyCurrencyPackageEmbedded'].forEach(function (name) {
      var f = window[name];
      if (typeof f !== 'function') return;
      window[name] = function () { if (!purchaseGate()) { if (typeof showNotif === 'function') showNotif('👍 No problem — nothing was bought.'); return; } return f.apply(this, arguments); };
    });
  }
  window.exploxPurchaseGate = purchaseGate;

  // ---------- 4. the one-time safety notice ----------
  function showSafety(force) {
    var seen = false; try { seen = localStorage.getItem('explox_safety_ack') === '1'; } catch (e) {}
    if (seen && !force) return;
    if (document.getElementById('exploxSafety')) return;
    var d = document.createElement('div');
    d.id = 'exploxSafety';
    d.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(5,8,20,0.92);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Arial,sans-serif;';
    d.innerHTML = '<div style="max-width:460px;max-height:92vh;overflow-y:auto;background:#16213e;color:#fff;border:2px solid #e94560;border-radius:14px;padding:18px 20px;line-height:1.4;font-size:14px;">' +
      '<h2 style="margin:0 0 8px;color:#e94560;">⚠️ Before you play</h2>' +
      '<p><b>Flashing lights.</b> Explox has flashing lights, lightning, explosions and fast effects. It may not be suitable for people with <b>epilepsy or photosensitivity</b>. If you are sensitive, be careful or ask a grown-up first, and stop if you feel dizzy or unwell.</p>' +
      '<p><b>Chat is with real people.</b> Don\'t share your real name, address, phone number, school, passwords or photos. Messages are filtered, but filters are never perfect. If anything upsets you, stop and tell a trusted adult.</p>' +
      '<p><b>Real purchases need an adult.</b> The shop can charge real money. Only a parent/guardian (or someone 18+) should buy anything.</p>' +
      '<p><b>Online mode</b> sends your account name, your progress and where you are in the world to the Explox server so other players can see you.</p>' +
      '<button id="exploxSafetyOk" style="margin-top:6px;width:100%;padding:11px;border:none;border-radius:10px;background:#e94560;color:#fff;font-weight:bold;font-size:16px;cursor:pointer;">I understand — let me play</button></div>';
    document.body.appendChild(d);
    document.getElementById('exploxSafetyOk').onclick = function () { try { localStorage.setItem('explox_safety_ack', '1'); } catch (e) {} d.remove(); };
  }
  window.exploxSafety = function () { showSafety(true); };

  wrapAll(); wrapPurchases();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { showSafety(false); }); else showSafety(false);
})();
