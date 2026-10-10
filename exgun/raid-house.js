// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — MY HOUSE + SAFES  (🏠 MY HOUSE button on the sector screen)
//   Your home: a cutaway house with a bedroom, armory, living room, garage and a SAFE ROOM. Buy safes and keep your most valuable things in them.
//   10 safes in three sizes:   3 slots: Pocket Safe, Steel Lockbox, Wall Safe, Key Case
//                              10 slots: Gun Case, Fire Safe, Cabinet Safe, Strongbox
//                              15 slots: Titan Vault, Fortress Safe
//   Equip one safe to BRING IT INTO RAIDS. Inside a raid, open the backpack (Tab) and press "→ Safe" on any item: whatever is in the safe
//   is SAFE EVEN IF YOU DIE — it is never lost. Items in the safe at home are your protected storage; move things between stash and safe here.
//   (Safes hold items — loot, ammo, medicine, grenades. Armour and guns are covered by their own insurance.)
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const $ = id => document.getElementById(id), RS = () => window.RDUI.raidState(), stashN = id => window.RDUI.stashN(id), stashAdd = (id, n) => window.RDUI.stashAdd(id, n);
const SAFES = [
  { id: 's1', name: 'Pocket Safe', slots: 3, price: 300, emoji: '🔒', col: '#8a8f96', desc: 'A tiny hidden safe. Fits your three best things.' },
  { id: 's2', name: 'Steel Lockbox', slots: 3, price: 450, emoji: '🔒', col: '#9aa3ad', desc: 'Welded steel box with a padlock.' },
  { id: 's3', name: 'Wall Safe', slots: 3, price: 600, emoji: '🔒', col: '#7d8a96', desc: 'Set into the wall behind a painting.' },
  { id: 's4', name: 'Key Case', slots: 3, price: 800, emoji: '🗝️', col: '#b0a37a', desc: 'Armoured case with a combination lock.' },
  { id: 's5', name: 'Gun Case', slots: 10, price: 1500, emoji: '🧰', col: '#4f7ab0', desc: 'Foam-lined hard case. Room for ten items.' },
  { id: 's6', name: 'Fire Safe', slots: 10, price: 2000, emoji: '🧯', col: '#4a6fa5', desc: 'Fireproof and waterproof, ten slots.' },
  { id: 's7', name: 'Cabinet Safe', slots: 10, price: 2600, emoji: '🗄️', col: '#3f6aa0', desc: 'A full steel cabinet with shelves.' },
  { id: 's8', name: 'Strongbox', slots: 10, price: 3300, emoji: '📦', col: '#35609a', desc: 'Reinforced strongbox with a time lock.' },
  { id: 's9', name: 'Titan Vault', slots: 15, price: 4500, emoji: '🏦', col: '#d0a93a', desc: 'Bank-grade vault door. Fifteen slots.' },
  { id: 's10', name: 'Fortress Safe', slots: 15, price: 6500, emoji: '🛡️', col: '#e6b830', desc: 'The best safe money can buy. Fifteen slots.' }
];
const byId = id => SAFES.find(s => s.id === id);
function H() { const r = RS(); if (!r.house) r.house = { owned: [], eq: null, box: {} }; if (!r.house.box) r.house.box = {}; return r.house; }
const used = items => { try { return rSlotsUsed(items); } catch (e) { return Object.keys(items).length; } };
const cap = id => (byId(id) || { slots: 0 }).slots;

// ───────── the house screen ─────────
let selSafe = null;
function houseSvg(h) {
  const cell = (s, i) => { const own = h.owned.includes(s.id), eq = h.eq === s.id, x = 36 + (i % 5) * 54, y = 26 + Math.floor(i / 5) * 46, n = Object.keys(h.box[s.id] || {}).length;
    return `<g class="hsafe" data-s="${s.id}" style="cursor:pointer"><rect x="${x}" y="${y}" width="44" height="38" rx="6" fill="${own ? s.col : '#2a2622'}" stroke="${eq ? '#7dffb0' : selSafe === s.id ? '#ff6a33' : '#555'}" stroke-width="${eq || selSafe === s.id ? 3 : 1.4}" opacity="${own ? 1 : 0.55}"/><text x="${x + 22}" y="${y + 20}" text-anchor="middle" font-size="16">${own ? s.emoji : '🔒'}</text><text x="${x + 22}" y="${y + 34}" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">${own ? n + '/' + s.slots : s.slots + ' sl'}</text></g>`; };
  return `<svg viewBox="0 0 760 420" style="width:100%;max-width:760px;display:block;margin:0 auto;border-radius:12px;background:linear-gradient(#17222e,#0d141b)">
    <polygon points="40,150 380,40 720,150" fill="#7a3a2a" stroke="#4a2018" stroke-width="3"/><rect x="60" y="150" width="640" height="236" fill="#d8cdb8" stroke="#6a5a48" stroke-width="3"/><rect x="60" y="268" width="640" height="6" fill="#6a5a48"/>
    <rect x="60" y="150" width="310" height="118" fill="#cfc0a6"/><rect x="370" y="150" width="330" height="118" fill="#bfae92"/>
    <text x="80" y="176" font-size="13" fill="#4a3a28" font-weight="bold">🛏️ Bedroom</text><text x="388" y="176" font-size="13" fill="#4a3a28" font-weight="bold">🔫 Armory room</text>
    <rect x="86" y="214" width="110" height="38" rx="5" fill="#8a3a3a"/><rect x="86" y="206" width="30" height="16" rx="4" fill="#eee"/><rect x="230" y="200" width="42" height="52" fill="#7a5a3a"/><text x="236" y="232" font-size="22">🕯️</text>
    <rect x="388" y="196" width="200" height="8" fill="#5a4a38"/>${[0, 1, 2, 3, 4].map(i => `<text x="${394 + i * 38}" y="194" font-size="22">${['🔫', '🔫', '🎯', '💣', '🪖'][i]}</text>`).join('')}<text x="608" y="244" font-size="12" fill="#4a3a28">Guns owned: ${(userState.ownedWeapons || []).length}</text>
    <text x="80" y="296" font-size="13" fill="#4a3a28" font-weight="bold">🛋️ Living room</text><text x="80" y="354" font-size="30">🛋️ 📺 🪴</text>
    <rect x="248" y="276" width="440" height="104" rx="8" fill="#2b2f36" stroke="#d0a93a" stroke-width="2"/><text x="262" y="296" font-size="13" fill="#e8d28a" font-weight="bold">🔐 SAFE ROOM — tap a safe</text><g transform="translate(236,266)">${SAFES.map(cell).join('')}</g>
    <rect x="700" y="268" width="30" height="118" fill="#555"/><text x="704" y="330" font-size="16">🚗</text><rect x="344" y="330" width="1" height="1" fill="none"/>
    <rect x="60" y="386" width="640" height="14" fill="#3a5a30"/><rect x="368" y="318" width="44" height="68" fill="#6a4a30" stroke="#3a2a18" stroke-width="2" opacity="0"/>
    <text x="380" y="30" text-anchor="middle" font-size="15" fill="#f0d8a8" font-weight="bold">🏠 ${currentUser || 'Your'} house</text></svg>`;
}
function itemRow(id, n, btns) { const it = rItem(id); return `<div class="rdCard" style="flex:0 1 190px"><b>${it.emoji} ${it.name} ×${n}</b><small>value ⚙️${it.value}</small>${btns}</div>`; }
function render() {
  const el = $('rdHouse'); if (!el) return; const h = H(), scrap = userState.scrap || 0, s = selSafe && byId(selSafe), own = s && h.owned.includes(s.id);
  let sec = '';
  if (s) {
    const box = h.box[s.id] || (h.box[s.id] = {}), u = used(box);
    sec = `<h2>${s.emoji} ${s.name} — ${u}/${s.slots} slots ${h.eq === s.id ? '<span style="color:#7dffb0">· BRINGING THIS INTO RAIDS</span>' : ''}</h2><div style="font-size:12.5px;color:#9a8a80">${s.desc}</div>`;
    if (!own) sec += `<div style="margin:10px 0"><button class="rdBtnS go" id="hsBuy" ${scrap >= s.price ? '' : 'disabled'}>Buy ⚙️${s.price}</button> <small style="color:#9a8a80">You have ⚙️${scrap}</small></div>`;
    else {
      sec += `<div style="margin:8px 0"><button class="rdBtnS ${h.eq === s.id ? '' : 'go'}" id="hsEq">${h.eq === s.id ? 'Leave at home' : '🎒 Bring this safe into raids'}</button></div><h2>IN THE SAFE</h2><div class="rdRow">`;
      const ids = Object.keys(box).filter(k => box[k] > 0); sec += ids.length ? ids.map(k => itemRow(k, box[k], `<button class="rdBtnS" data-take="${k}" data-n="1">Take 1</button><button class="rdBtnS" data-take="${k}" data-n="all">Take all</button>`)).join('') : `<div style="color:#9a8a80;font-size:12.5px">Empty. Put valuables from your stash below.</div>`; sec += `</div><h2>YOUR STASH → SAFE</h2><div class="rdRow">`;
      const st = RS().stash, sids = Object.keys(st).filter(k => st[k] > 0).sort((a, b) => rItem(b).value - rItem(a).value);
      sec += sids.length ? sids.map(k => itemRow(k, st[k], `<button class="rdBtnS" data-put="${k}" data-n="1">Put 1</button><button class="rdBtnS" data-put="${k}" data-n="all">Put all</button>`)).join('') : `<div style="color:#9a8a80;font-size:12.5px">Your stash is empty.</div>`; sec += `</div>`;
    }
  } else sec = `<div style="margin-top:12px;color:#9a8a80;font-size:13px">Tap a safe in the Safe Room above (or a card below) to buy it, fill it or bring it with you.</div>`;
  el.innerHTML = `<div class="rdWrap"><div class="rdTop"><div><h1>🏠 MY HOUSE</h1><div style="color:#9a8a80;font-size:12px">Your safe room. Anything inside a safe survives death — even in the middle of a raid.</div></div><div><span class="rdCard" style="display:inline-block;min-width:0;flex:none">⚙️ <b>${scrap}</b></span> <button class="rdBtnS" id="hsHide">🏚️ Hideout</button> <button class="rdBtnS" id="hsShop">🔫 Armory & Shop</button> <button class="rdBtnS" id="hsBack">← Back</button></div></div>
    ${houseSvg(h)}<h2>ALL 10 SAFES</h2><div class="rdRow">${SAFES.map(x => { const ow = h.owned.includes(x.id); return `<div class="rdCard ${selSafe === x.id ? 'sel' : ''}" data-card="${x.id}" style="cursor:pointer"><b>${x.emoji} ${x.name}</b><small>${x.slots} slots · ${ow ? (h.eq === x.id ? '✅ bringing it' : 'owned') : '⚙️' + x.price}</small></div>`; }).join('')}</div>${sec}</div>`;
  $('hsBack').onclick = () => el.classList.remove('active'); $('hsHide').onclick = () => { el.classList.remove('active'); window.rdOpenDeploy && window.rdOpenDeploy(null); }; $('hsShop').onclick = () => { el.classList.remove('active'); const b = document.getElementById('openArmoryBtn'); if (b) b.click(); };
  el.querySelectorAll('.hsafe,[data-card]').forEach(g => g.addEventListener('click', () => { selSafe = g.dataset.s || g.dataset.card; render(); }));
  if ($('hsBuy')) $('hsBuy').onclick = () => { if (userState.scrap >= s.price) { userState.scrap -= s.price; h.owned.push(s.id); h.box[s.id] = h.box[s.id] || {}; if (!h.eq) h.eq = s.id; saveUserData(); render(); } };
  if ($('hsEq')) $('hsEq').onclick = () => { h.eq = h.eq === s.id ? null : s.id; saveUserData(); render(); };
  el.querySelectorAll('[data-put]').forEach(b => b.onclick = () => { const id = b.dataset.put, box = h.box[s.id]; let want = b.dataset.n === 'all' ? stashN(id) : 1, moved = 0; while (want-- > 0 && stashN(id) > 0) { box[id] = (box[id] || 0) + 1; if (used(box) > s.slots) { box[id]--; if (!box[id]) delete box[id]; break; } stashAdd(id, -1); moved++; } if (!moved) alert('The safe is full (' + s.slots + ' slots).'); saveUserData(); render(); });
  el.querySelectorAll('[data-take]').forEach(b => b.onclick = () => { const id = b.dataset.take, box = h.box[s.id], n = b.dataset.n === 'all' ? box[id] : 1; box[id] -= n; if (box[id] <= 0) delete box[id]; stashAdd(id, n); saveUserData(); render(); });
}
function open() { if (!$('rdHouse')) { const d = document.createElement('div'); d.id = 'rdHouse'; d.className = 'rdScreen'; d.style.zIndex = 76; document.body.appendChild(d); } if (!selSafe) { const h = H(); selSafe = h.eq || h.owned[0] || null; } render(); $('rdHouse').classList.add('active'); if (document.pointerLockElement) document.exitPointerLock(); }
window.rdOpenHouse = open;
function addBtn() { const bar = document.querySelector('#mapSelectTop > div:last-child'); if (!bar || $('rdHouseBtn')) return; const b = document.createElement('button'); b.className = 'msBtn'; b.id = 'rdHouseBtn'; b.style.cssText = 'background:linear-gradient(#8a5a2a,#5a3a1a);color:#fff;border-color:#d0a93a'; b.textContent = '🏠 MY HOUSE'; b.onclick = () => (window.rdEnterHouse3D ? window.rdEnterHouse3D() : open()); bar.insertBefore(b, bar.firstChild); }
addBtn(); document.addEventListener('DOMContentLoaded', addBtn); setTimeout(addBtn, 400); setTimeout(addBtn, 1500); setInterval(addBtn, 3000);

// ───────── bringing the safe into a raid ─────────
const origEnter = window.rdEnterRaid;
window.rdEnterRaid = function (i, loadout) {
  const r = origEnter.apply(this, arguments); const h = H(), R = window.RAID;
  if (R.mapIndex === 103) { R.safe = null; return r; }
  if (h.eq && h.owned.includes(h.eq)) { const box = h.box[h.eq] || (h.box[h.eq] = {}); R.safe = { id: h.eq, cap: cap(h.eq), items: box }; window.rdToast(`🔐 ${byId(h.eq).name} brought along (${used(box)}/${cap(h.eq)} slots). Tab → "→ Safe" to protect loot.`, 4200); } else R.safe = null;
  return r;
};
const origRes = window.rdShowResults;
window.rdShowResults = function (res) { const R = window.RAID; if (R.safe) { const lines = Object.keys(R.safe.items).filter(k => R.safe.items[k] > 0).length; res.safeNote = lines; try { saveUserData(); } catch (e) { } } const r = origRes.apply(this, arguments); if (R.safe) { const w = document.querySelector('#rdResults .rdWrap div[style*="max-width:520px"]'); if (w) w.insertAdjacentHTML('beforeend', `<div>🔐 ${byId(R.safe.id).name}: ${used(R.safe.items)}/${R.safe.cap} slots — everything in the safe is kept${res.reason === 'extracted' ? '' : ', even though you died'}.</div>`); } return r; };

// ───────── the safe inside the backpack screen ─────────
function augment() {
  const R = window.RAID, box = $('rdInv'); if (!R || !R.on || !box || !box.classList.contains('active') || !R.safe) return; const wrap = box.querySelector('.rdWrap'); if (!wrap || wrap.dataset.safeAug) return; wrap.dataset.safeAug = '1';
  const S = R.safe, u = used(S.items);
  wrap.querySelectorAll('[data-drop]').forEach(b => { const id = b.dataset.drop; b.insertAdjacentHTML('beforebegin', `<button class="rdBtnS" data-tosafe="${id}" style="border-color:#d0a93a;color:#ffe08a">→ Safe</button>`); });
  const ids = Object.keys(S.items).filter(k => S.items[k] > 0);
  const html = `<h2 style="color:#ffe08a">🔐 SAFE — ${byId(S.id).name} · ${u}/${S.cap} slots (never lost, even if you die)</h2><div class="rdRow">${ids.length ? ids.map(id => { const it = rItem(id); return `<div class="rdCard" style="border-color:#d0a93a"><b>${it.emoji} ${it.name} ×${S.items[id]}</b><small>value ⚙️${it.value}</small><button class="rdBtnS" data-fromsafe="${id}">← Take out</button></div>`; }).join('') : '<div style="color:#9a8a80;font-size:12.5px">Empty. Press “→ Safe” on any item in your pack.</div>'}</div>`;
  const hs = wrap.querySelector('h2:nth-of-type(2)'); (hs || wrap.lastElementChild).insertAdjacentHTML(hs ? 'beforebegin' : 'afterend', html);
  wrap.querySelectorAll('[data-tosafe]').forEach(b => b.onclick = () => { const id = b.dataset.tosafe; let n = R.pack[id] || 0, moved = 0; while (n-- > 0) { S.items[id] = (S.items[id] || 0) + 1; if (used(S.items) > S.cap) { S.items[id]--; if (!S.items[id]) delete S.items[id]; break; } R.pack[id]--; moved++; } if (R.pack[id] <= 0) delete R.pack[id]; if (!moved) window.rdToast('🔐 The safe is full (' + S.cap + ' slots)', 1800); window.rdRefreshInventory && window.rdRefreshInventory(); });
  wrap.querySelectorAll('[data-fromsafe]').forEach(b => b.onclick = () => { const id = b.dataset.fromsafe; R.pack[id] = (R.pack[id] || 0) + S.items[id]; delete S.items[id]; window.rdRefreshInventory && window.rdRefreshInventory(); });
}
new MutationObserver(() => { try { augment(); } catch (e) { } }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
window.HOUSE = { SAFES, H, openSafe: id => { selSafe = id; open(); }, open2D: open };
})();
