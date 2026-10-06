// ─── EXPLOX × BLOCK OBBY ─────────────────────────────────────────────────────
// A 🧱 Block Obby button (under the Watch Ad button, shown once you're logged in) opens the endless obby mini game (obby/index.html, one folder up from
// the game page on the site: play/obby/index.html) in a full-screen frame. Every time you reach another 10 platforms the obby sends this page a message
// and you are paid 10 S.I.P. straight into your wallet through the game's normal reward function queueEarning() (so the usual notification, coin sound
// and saveCurrentUser() all happen).
// Safety rails: only messages that come from OUR frame (event.source) and from this same origin are accepted; each message is exactly one payout of
// 10 S.I.P. and payouts are limited to one per 4 seconds (a real 10-platform stretch takes longer than that), so a glitch can't flood the wallet.
// Esc inside the obby pauses it; the ✖ button (or the obby's own "Back to Explox" button) closes it. Remove this file's <script> tag to remove the feature.
(function () {
  'use strict';
  var frameWrap = null, lastPay = 0;

  function logged() { try { return typeof currentUser !== 'undefined' && !!currentUser; } catch (e) { return false; } }

  var btn = document.createElement('div');
  btn.id = 'obbyHud'; btn.textContent = '🧱 Block Obby (earn S.I.P.)';
  btn.style.cssText = 'position:fixed;top:620px;right:14px;color:#ffe9a8;font:bold 12px Arial,sans-serif;background:rgba(60,40,0,0.6);border:1px solid #d9a441;padding:7px 12px;border-radius:8px;cursor:pointer;z-index:50;display:none;';
  btn.onclick = open;
  document.body.appendChild(btn);
  setInterval(function () { btn.style.display = (logged() && !frameWrap) ? 'block' : 'none'; }, 1000);

  function open() {
    if (frameWrap) return;
    if (!logged()) { try { showNotif('🧱 Log in first to earn S.I.P. from Block Obby.'); } catch (e) {} return; }
    try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
    frameWrap = document.createElement('div');
    frameWrap.style.cssText = 'position:fixed;inset:0;z-index:100000;background:#000;';
    var f = document.createElement('iframe');
    f.src = new URL('obby/index.html?embed=1', location.href).href;
    f.style.cssText = 'border:0;width:100%;height:100%;';
    f.allow = 'autoplay';
    var x = document.createElement('div');
    x.textContent = '✖ Back to Explox';
    x.style.cssText = 'position:absolute;top:10px;right:10px;z-index:2;color:#fff;font:bold 13px Arial,sans-serif;background:#c0392b;padding:8px 14px;border-radius:8px;cursor:pointer;';
    x.onclick = close;
    frameWrap.appendChild(f); frameWrap.appendChild(x);
    document.body.appendChild(frameWrap);
    try { isPointerLocked = false; } catch (e) {}
    setTimeout(function () { try { f.focus(); } catch (e) {} }, 300);
  }
  function close() {
    if (!frameWrap) return;
    frameWrap.remove(); frameWrap = null;
    btn.style.display = logged() ? 'block' : 'none';
  }

  window.addEventListener('message', function (e) {
    if (!frameWrap || e.origin !== location.origin) return;
    var f = frameWrap.querySelector('iframe');
    if (!f || e.source !== f.contentWindow) return;
    var d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === 'blockobby-close') { close(); return; }
    if (d.type === 'blockobby-sip') {
      var now = Date.now();
      if (now - lastPay < 4000) return;                 // rate limit
      lastPay = now;
      try { queueEarning(10, 0, 'Block Obby (' + (d.platforms | 0) + ' platforms)'); } catch (err) {}
    }
  });
  window.exploxObby = { open: open, close: close };
})();
