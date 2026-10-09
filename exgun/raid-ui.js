// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN RAID — MENUS  (hideout: stash / shop / loadout, in-raid backpack, results screen)
// Loaded after raid-data.js and raid-core.js.
//
// Save data: userState.raid = { stash: {itemId: count}, gear: [{id, dur}] }   (saved with the player, also on the server)
//   stash = ammo, medicine, loot (anything stackable). gear = armor pieces with their remaining durability.
// Flow:  sector card -> Hideout/Deploy screen -> raid (raid-core.js) -> results screen -> back to the sector list.
//   Extracted: everything in your backpack goes to the stash (found guns are added to your armory) + a small scrap bonus.
//   Died / ran out of time: everything you brought is lost, including the gun unless insured (or it is the free Pistol Mk1).
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const $ = id => document.getElementById(id);

function raidState() {
  if (!userState.raid || typeof userState.raid !== 'object') userState.raid = {};
  const r = userState.raid;
  if (!r.stash) { r.stash = { '9mm_fmj': 60, bandage: 2 }; }
  if (!r.gear) r.gear = [];
  return r;
}
const stashN = id => raidState().stash[id] || 0;
function stashAdd(id, n) { const s = raidState().stash; s[id] = (s[id] || 0) + n; if (s[id] <= 0) delete s[id]; }
const boxSize = id => (R_AMMO[id] && R_AMMO[id].cal === '338') ? 10 : R_BOX;

// the server stores whatever object we send, so the raid state rides along with the normal save
window.saveUserData = function () {
  if (!currentUser || !userState) return;
  raidState();
  const blob = { xp: userState.xp, level: userState.level, scrap: userState.scrap, ownedWeapons: userState.ownedWeapons, equippedWeapon: userState.equippedWeapon,
    kills: userState.kills, deaths: userState.deaths, highestMapUnlocked: userState.highestMapUnlocked, createdAt: userState.createdAt, raid: userState.raid };
  localStorage.setItem('exgun_user_' + currentUser, JSON.stringify(blob));
  fetchWithTimeout(EXGUN_SERVER + '/api/exgun/user/' + encodeURIComponent(currentUser), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(blob) }, 6000).catch(() => {});
};

// ───────────────────────── styles + containers ─────────────────────────
const css = document.createElement('style'); css.textContent = `
.rdScreen { position:fixed; inset:0; z-index:60; display:none; background:rgba(8,8,10,.96); color:#e8e0d8; overflow-y:auto; padding:18px 12px 60px; font-family:Arial,Helvetica,sans-serif; }
.rdScreen.active { display:block; }
.rdWrap { max-width:960px; margin:0 auto; }
.rdWrap h1 { color:#ff6a33; letter-spacing:3px; font-size:24px; margin:0 0 4px; } .rdWrap h2 { color:#ffb088; font-size:14px; letter-spacing:2px; margin:18px 0 8px; border-bottom:1px solid #3a2c22; padding-bottom:5px; }
.rdWarn { background:#3a1410; border:1px solid #8a2a1a; color:#ffb3a0; padding:8px 12px; border-radius:8px; font-size:12.5px; margin:8px 0; }
.rdRow { display:flex; flex-wrap:wrap; gap:8px; } .rdCard { background:#17130f; border:1px solid #3a2c22; border-radius:10px; padding:9px 11px; font-size:12.5px; min-width:150px; flex:1 1 170px; }
.rdCard.sel { border-color:#ff6a33; background:#241812; } .rdCard b { color:#ffd9b0; } .rdCard small { color:#9a8a80; display:block; margin-top:2px; }
.rdBtnS { background:#2a2018; border:1px solid #5a4030; color:#ffd9b0; border-radius:7px; padding:5px 10px; font-size:12px; cursor:pointer; margin:3px 3px 0 0; } .rdBtnS:hover { background:#3a2c20; } .rdBtnS:disabled { opacity:.4; cursor:default; }
.rdBtnS.go { background:linear-gradient(180deg,#ff6a33,#e2481a); border:none; color:#fff; font-weight:bold; font-size:15px; padding:12px 28px; border-radius:9px; letter-spacing:1px; }
.rdBtnS.red { background:#4a1a14; border-color:#8a2a1a; }
.rdTop { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
.rdStep { display:inline-flex; align-items:center; gap:6px; } .rdStep span { min-width:30px; text-align:center; font-weight:bold; }
`; document.head.appendChild(css);
['rdDeploy', 'rdInv', 'rdResults'].forEach(id => { const d = document.createElement('div'); d.id = id; d.className = 'rdScreen'; document.body.appendChild(d); });

// ───────────────────────── Hideout / Deploy ─────────────────────────
let sel = null;           // current loadout choices
function defaultSel() {
  const owned = rRaidWeapons().filter(w => userState.ownedWeapons.includes(w.id));
  const eq = owned.find(w => w.id === userState.equippedWeapon) || owned[0] || WEAPON_CATALOG[0];
  const cal = R_GUN[eq.id].cal;
  const ammoId = Object.keys(R_AMMO).filter(id => R_AMMO[id].cal === cal).sort((a, b) => stashN(b) - stashN(a))[0];
  return { weaponId: eq.id, ammoId, ammoN: Math.min(stashN(ammoId), 90), vest: -1, helmet: -1, bag: -1, nades: {}, meds: { bandage: Math.min(2, stashN('bandage')) }, protect: false };
}
window.rdOpenDeploy = function (mapIndex) {
  raidState();
  if (!sel || !userState.ownedWeapons.includes(sel.weaponId)) sel = defaultSel();
  sel.map = mapIndex || null;
  renderDeploy(); $('rdDeploy').classList.add('active');
};
function closeDeploy() { $('rdDeploy').classList.remove('active'); }
window.enterMap = function (i) { window.rdOpenDeploy(i); };        // sector cards now open the hideout first

function renderDeploy() {
  const r = raidState(), g = R_GUN[sel.weaponId], w = weaponById(sel.weaponId);
  const owned = rRaidWeapons().filter(x => userState.ownedWeapons.includes(x.id));
  const calAmmo = Object.keys(R_AMMO).filter(id => R_AMMO[id].cal === g.cal);
  const gearOf = slot => r.gear.map((it, idx) => ({ it, idx })).filter(o => R_ARMOR[o.it.id].slot === slot);
  const wcost = weaponCost(w.tier), fee = Math.round(wcost * 0.2);
  const stashItems = Object.keys(r.stash).filter(id => r.stash[id] > 0).map(id => ({ id, n: r.stash[id], it: rItem(id) }));
  const valuables = stashItems.filter(o => o.it.kind === 'loot' || o.it.kind === 'weapon');
  const df = sel.map ? rDifficulty(sel.map) : null;
  let h = `<div class="rdWrap"><div class="rdTop"><div><h1>🏚️ HIDEOUT</h1><div style="color:#9a8a80;font-size:12px">${sel.map ? 'Deploying to ' + mapNameForMap(sel.map) + ` · <b style="color:${df.color}">${df.name.toUpperCase()}</b> — ${df.note}` : 'Browsing your stash and shop'}</div></div>
    <div><span class="rdCard" style="display:inline-block;min-width:0;flex:none">⚙️ <b>${userState.scrap}</b> scrap</span> <button class="rdBtnS" id="rdBack">← Back to sectors</button></div></div>
    <div class="rdWarn">⚠️ <b>Extraction rules:</b> everything you bring into a raid can be lost. Reach a green <b>extraction zone</b> alive (hold <b>E</b> for 8 s) to keep your gear and loot. If you die or time runs out, it is gone. Protect your gun with insurance, or bring the free Pistol Mk1.</div>`;

  h += `<h2>🔫 WEAPON</h2><div class="rdRow">` + owned.map(x => { const gg = R_GUN[x.id]; return `<div class="rdCard ${x.id === sel.weaponId ? 'sel' : ''}" data-w="${x.id}"><b>${x.name}</b><small>${R_CAL_NAMES[gg.cal]} · mag ${gg.mag} · ${gg.mode.toUpperCase()}${gg.auto ? '/AUTO' : ''}</small><small>Range ${x.range}m · ${x.fireRate}/s</small></div>`; }).join('') + `</div>`;
  if (sel.weaponId !== 'pistol_mk1') h += `<label style="display:block;margin-top:8px;font-size:12.5px"><input type="checkbox" id="rdIns" ${sel.protect ? 'checked' : ''}> 🛡️ Insure this gun (⚙️${fee}) — you keep it even if you die</label>`;

  h += `<h2>🔸 AMMO (${R_CAL_NAMES[g.cal]})</h2><div class="rdRow">` + calAmmo.map(id => { const a = R_AMMO[id], bs = boxSize(id), bp = a.price * bs;
    return `<div class="rdCard ${id === sel.ammoId ? 'sel' : ''}" data-a="${id}"><b>${a.name}</b><small>dmg ${a.dmg}${a.pellets ? '×' + a.pellets : ''} · penetration ${a.pen}</small><small>Stash: ${stashN(id)}</small>
      <button class="rdBtnS" data-buy="${id}" ${userState.scrap >= bp ? '' : 'disabled'}>Buy ${bs} · ⚙️${bp}</button></div>`; }).join('') + `</div>`;
  const maxA = stashN(sel.ammoId); sel.ammoN = Math.min(sel.ammoN, maxA);
  h += `<div style="margin-top:8px" class="rdStep">Bring <button class="rdBtnS" data-ast="-30">−30</button><span>${sel.ammoN}</span><button class="rdBtnS" data-ast="30">+30</button><button class="rdBtnS" data-ast="max">All</button> rounds</div>`;
  if (!Object.keys(R_AMMO).some(id => R_AMMO[id].cal === g.cal && stashN(id) > 0) && g.cal === '9mm') h += `<div class="rdWarn" style="margin-top:8px">No 9mm left. <button class="rdBtnS" id="rdFreeAmmo">Take 30 free scav rounds</button></div>`;

  const gearCard = (o, key) => { const a = R_ARMOR[o.it.id]; return `<div class="rdCard ${sel[key] === o.idx ? 'sel' : ''}" data-${key === 'vest' ? 'v' : key === 'helmet' ? 'h' : 'b'}="${o.idx}"><b>${a.emoji} ${a.name}</b><small>${a.slot === 'bag' ? '+' + a.slots + ' backpack slots' : 'Durability ' + Math.round(o.it.dur) + '/' + a.dur}${a.speed && a.speed < 0.99 ? ' · speed ' + Math.round(a.speed * 100) + '%' : ''}</small>${a.slot !== 'bag' && o.it.dur < a.dur ? `<button class="rdBtnS" data-rep="${o.idx}">Repair ⚙️${Math.ceil((a.dur - o.it.dur) * a.price / a.dur * 0.35)}</button>` : ''}</div>`; };
  h += `<h2>🦺 ARMOR · 🪖 HELMET · 🎒 BACKPACK</h2><div style="font-size:12px;color:#9a8a80;margin-bottom:6px">Higher armor class stops stronger bullets but is heavier. Bigger backpacks hold more loot (base ${rPackCap(null)} slots).</div>
    <div class="rdRow"><div class="rdCard ${sel.vest < 0 ? 'sel' : ''}" data-v="-1"><b>No vest</b><small>Light and fast, fragile</small></div>` + gearOf('vest').map(o => gearCard(o, 'vest')).join('') + `</div>
    <div class="rdRow" style="margin-top:8px"><div class="rdCard ${sel.helmet < 0 ? 'sel' : ''}" data-h="-1"><b>No helmet</b><small>One headshot can end you</small></div>` + gearOf('helmet').map(o => gearCard(o, 'helmet')).join('') + `</div>
    <div class="rdRow" style="margin-top:8px"><div class="rdCard ${sel.bag < 0 ? 'sel' : ''}" data-b="-1"><b>No backpack</b><small>${rPackCap(null)} slots</small></div>` + gearOf('bag').map(o => gearCard(o, 'bag')).join('') + `</div>`;

  const medsHere = Object.keys(R_MED).filter(id => stashN(id) > 0);
  h += `<h2>🩹 MEDICAL (bring)</h2>` + (medsHere.length ? `<div class="rdRow">` + medsHere.map(id => { const m = R_MED[id]; return `<div class="rdCard"><b>${m.emoji} ${m.name}</b><small>${m.desc}</small><small>Stash: ${stashN(id)}</small>
    <div class="rdStep"><button class="rdBtnS" data-mst="${id}:-1">−</button><span>${sel.meds[id] || 0}</span><button class="rdBtnS" data-mst="${id}:1">+</button></div></div>`; }).join('') + `</div>` : `<div style="color:#9a8a80;font-size:12.5px">No medicine in your stash. Buy some in the Armory &amp; Shop.</div>`);
  const nadesHere = Object.keys(R_NADE).filter(id => stashN('gren:' + id) > 0);
  h += `<h2>💣 THROWABLES (bring)</h2>` + (nadesHere.length ? `<div class="rdRow">` + nadesHere.map(id => { const n = R_NADE[id]; return `<div class="rdCard"><b>${n.emoji} ${n.name}</b><small>${n.kind === 'frag' || n.kind === 'impact' ? 'Damage ' + n.dmg + ' · radius ' + n.radius + 'm' : n.kind === 'smoke' ? 'Blocks sight ' + n.time + 's' : n.kind === 'flash' ? 'Blinds ' + n.time + 's' : 'Burns ' + n.time + 's'}</small><small>Stash: ${stashN('gren:' + id)}</small>
    <div class="rdStep"><button class="rdBtnS" data-nst="${id}:-1">−</button><span>${sel.nades[id] || 0}</span><button class="rdBtnS" data-nst="${id}:1">+</button></div></div>`; }).join('') + `</div>` : `<div style="color:#9a8a80;font-size:12.5px">No grenades. Buy some in the Armory &amp; Shop (Throwables tab).</div>`);
  h += `<div style="margin-top:14px"><button class="rdBtnS" id="rdOpenShopBig">🔫 Open the Armory &amp; Shop — ${R_COUNTS.guns} guns, ${R_COUNTS.att} attachments, ${R_COUNTS.ammo} ammo types, ${R_COUNTS.armor} armor pieces…</button></div>`;

  h += `<h2>📦 STASH — sell loot for scrap</h2>`;
  h += valuables.length ? `<div class="rdRow">` + valuables.map(o => `<div class="rdCard"><b>${o.it.emoji} ${o.it.name} ×${o.n}</b><small>⚙️${o.it.value} each</small><button class="rdBtnS" data-sell="${o.id}">Sell all · ⚙️${o.it.value * o.n}</button></div>`).join('') + `</div>
    <button class="rdBtnS" id="rdSellAll" style="margin-top:8px">Sell ALL loot · ⚙️${valuables.reduce((s, o) => s + o.it.value * o.n, 0)}</button>` : `<div style="color:#9a8a80;font-size:12.5px">No loot in the stash yet. Find valuables in raids, extract, then sell them here.</div>`;
  const rest = stashItems.filter(o => o.it.kind !== 'loot' && o.it.kind !== 'weapon');
  if (rest.length) h += `<div style="margin-top:8px;font-size:12px;color:#9a8a80">Also in stash: ` + rest.map(o => `${o.it.emoji} ${o.it.name} ×${o.n}`).join(' · ') + `</div>`;

  h += `<div style="margin-top:22px;text-align:center">${sel.map ? `<button class="rdBtnS go" id="rdGo">🪂 DEPLOY</button>` : '<div style="color:#9a8a80">Pick a sector from the list to deploy.</div>'}</div></div>`;
  const box = $('rdDeploy'), keep = box.scrollTop; box.innerHTML = h; box.scrollTop = keep;
  wireDeploy();
}
function wireDeploy() {
  const box = $('rdDeploy'), r = raidState();
  const on = (selq, fn) => box.querySelectorAll(selq).forEach(el => el.addEventListener('click', e => { e.stopPropagation(); fn(el); }));
  $('rdBack').onclick = () => { closeDeploy(); goToMapSelect(); };
  on('[data-w]', el => { sel.weaponId = el.dataset.w; const cal = R_GUN[sel.weaponId].cal; sel.ammoId = Object.keys(R_AMMO).filter(id => R_AMMO[id].cal === cal).sort((a, b) => stashN(b) - stashN(a))[0]; sel.ammoN = Math.min(stashN(sel.ammoId), 90); sel.protect = false; userState.equippedWeapon = sel.weaponId; renderDeploy(); });
  on('[data-a]', el => { sel.ammoId = el.dataset.a; sel.ammoN = Math.min(stashN(sel.ammoId), 90); renderDeploy(); });
  on('[data-ast]', el => { const v = el.dataset.ast; sel.ammoN = v === 'max' ? stashN(sel.ammoId) : Math.max(0, Math.min(stashN(sel.ammoId), sel.ammoN + parseInt(v, 10))); renderDeploy(); });
  on('[data-buy]', el => { const id = el.dataset.buy, a = R_AMMO[id], bs = boxSize(id), cost = a.price * bs; if (userState.scrap >= cost) { userState.scrap -= cost; stashAdd(id, bs); saveUserData(); renderDeploy(); } });
  on('[data-v]', el => { sel.vest = parseInt(el.dataset.v, 10); renderDeploy(); });
  on('[data-h]', el => { sel.helmet = parseInt(el.dataset.h, 10); renderDeploy(); });
  on('[data-b]', el => { sel.bag = parseInt(el.dataset.b, 10); renderDeploy(); });
  on('[data-nst]', el => { const [id, d] = el.dataset.nst.split(':'); sel.nades[id] = Math.max(0, Math.min(stashN('gren:' + id), (sel.nades[id] || 0) + parseInt(d, 10))); renderDeploy(); });
  const big = $('rdOpenShopBig'); if (big) big.onclick = () => window.rdOpenShop && window.rdOpenShop('weapons');
  on('[data-rep]', el => { const it = r.gear[parseInt(el.dataset.rep, 10)], a = R_ARMOR[it.id], cost = Math.ceil((a.dur - it.dur) * a.price / a.dur * 0.35); if (userState.scrap >= cost) { userState.scrap -= cost; it.dur = a.dur; saveUserData(); renderDeploy(); } });
  on('[data-mst]', el => { const [id, d] = el.dataset.mst.split(':'); sel.meds[id] = Math.max(0, Math.min(stashN(id), (sel.meds[id] || 0) + parseInt(d, 10))); renderDeploy(); });
  on('[data-buyg]', el => { const id = el.dataset.buyg, a = R_ARMOR[id]; if (userState.scrap >= a.price) { userState.scrap -= a.price; r.gear.push({ id, dur: a.dur }); saveUserData(); renderDeploy(); } });
  on('[data-buym]', el => { const id = el.dataset.buym, m = R_MED[id]; if (userState.scrap >= m.price) { userState.scrap -= m.price; stashAdd(id, 1); saveUserData(); renderDeploy(); } });
  on('[data-sell]', el => { const id = el.dataset.sell, n = stashN(id); userState.scrap += rItem(id).value * n; stashAdd(id, -n); saveUserData(); renderDeploy(); });
  const sa = $('rdSellAll'); if (sa) sa.onclick = () => { Object.keys(r.stash).forEach(id => { const it = rItem(id); if (it.kind === 'loot' || it.kind === 'weapon') { userState.scrap += it.value * r.stash[id]; delete r.stash[id]; } }); saveUserData(); renderDeploy(); };
  const fa = $('rdFreeAmmo'); if (fa) fa.onclick = () => { stashAdd('9mm_fmj', 30); sel.ammoId = '9mm_fmj'; sel.ammoN = 30; renderDeploy(); };
  const ins = $('rdIns'); if (ins) ins.onchange = () => { sel.protect = ins.checked; };
  const go = $('rdGo'); if (go) go.onclick = deploy;
}
function deploy() {
  const r = raidState(), w = weaponById(sel.weaponId);
  if (sel.map == null) return;
  if (sel.protect) { const fee = Math.round(weaponCost(w.tier) * 0.2); if (userState.scrap < fee) { alert('Not enough scrap for insurance.'); return; } userState.scrap -= fee; }
  const pack = {};
  if (sel.ammoN > 0) { pack[sel.ammoId] = sel.ammoN; stashAdd(sel.ammoId, -sel.ammoN); }
  Object.keys(sel.meds).forEach(id => { const n = Math.min(sel.meds[id], stashN(id)); if (n > 0) { pack[id] = n; stashAdd(id, -n); } });
  Object.keys(sel.nades || {}).forEach(id => { const n = Math.min(sel.nades[id], stashN('gren:' + id)); if (n > 0) { pack['gren:' + id] = n; stashAdd('gren:' + id, -n); } });
  // pull the chosen gear pieces out of the stash (highest index first so the other indexes stay valid)
  const picked = { vest: sel.vest, helmet: sel.helmet, bag: sel.bag }, got = { vest: null, helmet: null, bag: null };
  Object.keys(picked).filter(k => picked[k] >= 0 && r.gear[picked[k]]).sort((a, b) => picked[b] - picked[a]).forEach(k => { got[k] = r.gear.splice(picked[k], 1)[0]; });
  sel.vest = sel.helmet = sel.bag = -1; sel.nades = {};
  saveUserData(); closeDeploy();
  window.rdEnterRaid(sel.map, { weaponId: sel.weaponId, ammoType: sel.ammoId, pack, vest: got.vest, helmet: got.helmet, bag: got.bag, protect: sel.protect, mods: (r.mods && r.mods[sel.weaponId]) || {} });
}

// ───────────────────────── in-raid backpack (Tab) ─────────────────────────
window.rdToggleInventory = function () {
  const R = window.RAID;
  if (R.invOpen) { R.invOpen = false; $('rdInv').classList.remove('active'); if (renderer && !IS_TOUCH) renderer.domElement.requestPointerLock(); return; }
  R.invOpen = true; if (document.pointerLockElement) document.exitPointerLock(); renderInv(); $('rdInv').classList.add('active');
};
window.rdRefreshInventory = function () { if (window.RAID.invOpen) renderInv(); };
function renderInv() {
  const R = window.RAID, ids = Object.keys(R.pack).filter(id => R.pack[id] > 0);
  let h = `<div class="rdWrap"><div class="rdTop"><h1>🎒 BACKPACK</h1><button class="rdBtnS" id="rdInvClose">Close (Tab)</button></div>
    <div style="font-size:12.5px;color:#9a8a80">Slots ${rSlotsUsed(R.pack)}/${rPackCap(R.bag)} · Raid time left ${Math.max(0, Math.round(R.limit - R.t))}s · The raid is paused while this is open.</div>
    <h2>EQUIPPED</h2><div class="rdRow"><div class="rdCard"><b>🔫 ${weaponById(R.weaponId).name}</b><small>${R.mag} in mag · ${R_AMMO[R.ammoType].name}</small></div>
    <div class="rdCard"><b>🦺 ${R.vest ? R_ARMOR[R.vest.id].name : 'No vest'}</b><small>${R.vest ? 'Durability ' + Math.round(R.vest.dur) : ''}</small></div>
    <div class="rdCard"><b>🪖 ${R.helmet ? R_ARMOR[R.helmet.id].name : 'No helmet'}</b><small>${R.helmet ? 'Durability ' + Math.round(R.helmet.dur) : ''}</small></div>
    <div class="rdCard"><b>🎒 ${R.bag ? R_ARMOR[R.bag.id].name : 'No backpack'}</b><small>${rPackCap(R.bag)} slots</small></div></div><h2>PACK</h2><div class="rdRow">`;
  if (!ids.length) h += `<div style="color:#9a8a80;font-size:12.5px">Empty.</div>`;
  ids.forEach(id => { const it = rItem(id), n = R.pack[id], btns = [];
    if (it.kind === 'med') btns.push(`<button class="rdBtnS" data-use="${id}">Use</button>`);
    if (it.kind === 'armor') btns.push(`<button class="rdBtnS" data-eq="${id}">Equip</button>`);
    if (it.kind === 'gren') btns.push(`<button class="rdBtnS" data-nade="${id}">Select (G throws)</button>`);
    if (it.kind === 'ammo' && R_AMMO[id].cal === R_GUN[R.weaponId].cal && id !== R.ammoType) btns.push(`<button class="rdBtnS" data-ammo="${id}">Use this ammo</button>`);
    btns.push(`<button class="rdBtnS red" data-drop="${id}">Drop</button>`);
    h += `<div class="rdCard"><b>${it.emoji} ${it.name} ×${n}</b><small>${it.kind === 'ammo' ? 'pen ' + R_AMMO[id].pen + ' · dmg ' + R_AMMO[id].dmg : 'value ⚙️' + it.value}</small>${btns.join('')}</div>`; });
  h += `</div></div>`;
  const box = $('rdInv'); box.innerHTML = h;
  $('rdInvClose').onclick = window.rdToggleInventory;
  box.querySelectorAll('[data-use]').forEach(b => b.onclick = () => { window.rdToggleInventory(); RDX.startUse(b.dataset.use); });
  box.querySelectorAll('[data-nade]').forEach(b => b.onclick = () => { R.nade = b.dataset.nade; renderInv(); });
  box.querySelectorAll('[data-drop]').forEach(b => b.onclick = () => { delete R.pack[b.dataset.drop]; renderInv(); });
  box.querySelectorAll('[data-ammo]').forEach(b => b.onclick = () => { window.rdToggleInventory(); R.pack[R.ammoType] = (R.pack[R.ammoType] || 0) + R.mag; R.mag = 0; R.ammoType = b.dataset.ammo; RDX.startReload(); });
  box.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => {
    const id = b.dataset.eq, a = R_ARMOR[id], key = a.slot === 'vest' ? 'vest' : a.slot === 'bag' ? 'bag' : 'helmet', old = R[key];
    R.pack[id]--; if (R.pack[id] <= 0) delete R.pack[id];
    if (old) R.pack[old.id] = (R.pack[old.id] || 0) + 1;            // the swapped piece goes back into the pack (at full durability when found again)
    R[key] = { id, dur: a.dur }; renderInv();
  });
}

// ───────────────────────── results screen ─────────────────────────
window.rdShowResults = function (res) {
  const r = raidState(); let lines = [], title = '', color = '#7dffb0';
  if (res.reason === 'extracted') {
    title = '✅ EXTRACTED'; const kept = {}; const pack = res.pack;
    if (res.mag > 0) pack[res.ammoType] = (pack[res.ammoType] || 0) + res.mag;
    Object.keys(pack).forEach(id => {
      const n = pack[id];
      if (id.startsWith('wpn:')) { const wid = id.slice(4); if (!userState.ownedWeapons.includes(wid)) { userState.ownedWeapons.push(wid); lines.push(`🔫 New weapon: ${weaponById(wid).name}`); } else { userState.scrap += rItem(id).value * n; lines.push(`Sold duplicate ${weaponById(wid).name} for ⚙️${rItem(id).value * n}`); } }
      else if (R_ARMOR[id]) { for (let i = 0; i < n; i++) r.gear.push({ id, dur: R_ARMOR[id].dur }); kept[id] = n; }
      else { stashAdd(id, n); kept[id] = n; }
    });
    if (res.vest) r.gear.push({ id: res.vest.id, dur: res.vest.dur }); if (res.helmet) r.gear.push({ id: res.helmet.id, dur: res.helmet.dur }); if (res.bag) r.gear.push({ id: res.bag.id, dur: 1 });
    const bonus = 15 * res.kills + 25; userState.scrap += bonus;
    lines.unshift(`Kills: ${res.kills} · XP +${res.xp} · Loot value ⚙️${res.found} · Raid bonus ⚙️${bonus}`);
    Object.keys(kept).forEach(id => lines.push(`${rItem(id).emoji} ${rItem(id).name} ×${kept[id]} → stash`));
  } else {
    title = res.reason === 'died' ? '☠️ YOU DIED' : '📡 MISSING IN ACTION'; color = '#ff5544'; userState.deaths++;
    lines.push(res.reason === 'died' ? 'Everything you brought into the raid is lost.' : 'You ran out of time. Everything you brought is lost.');
    lines.push(`Kills: ${res.kills} · XP kept +${res.xp}`);
    const w = weaponById(res.weaponId);
    if (res.weaponId !== 'pistol_mk1' && !res.protect) {
      userState.ownedWeapons = userState.ownedWeapons.filter(x => x !== res.weaponId); lines.push(`🔫 ${w.name} was lost (it was not insured)${r.mods && r.mods[res.weaponId] && Object.keys(r.mods[res.weaponId]).length ? ' along with its attachments' : ''}.`);
      if (r.mods) delete r.mods[res.weaponId];
      if (userState.equippedWeapon === res.weaponId) userState.equippedWeapon = 'pistol_mk1';
    } else if (res.weaponId !== 'pistol_mk1') lines.push(`🛡️ ${w.name} was insured — you still have it.`);
  }
  saveUserData();
  $('rdResults').innerHTML = `<div class="rdWrap" style="text-align:center;padding-top:40px"><h1 style="font-size:40px;color:${color}">${title}</h1>
    <div style="color:#9a8a80;margin-bottom:14px">${mapNameForMap(res.mapIndex)} · raid time ${Math.floor(res.time / 60)}:${String(Math.floor(res.time % 60)).padStart(2, '0')}</div>
    <div style="max-width:520px;margin:0 auto;text-align:left;line-height:1.7;font-size:14px">${lines.map(l => '<div>' + l + '</div>').join('')}</div>
    <div style="margin-top:26px"><button class="rdBtnS go" id="rdResBack">Back to hideout</button></div></div>`;
  $('rdResults').classList.add('active');
  $('rdResBack').onclick = () => { $('rdResults').classList.remove('active'); sel = null; goToMapSelect(); };
};

// the "back to sector list" buttons / death overlay of the original game should not interfere
const origExit = window.exitToMapSelect;
window.exitToMapSelect = function () { if (window.RAID && window.RAID.on && !window.RAID.over) { window.rdEnd('died'); return; } origExit(); };
document.getElementById('exitBtn').addEventListener('click', e => { if (window.RAID && window.RAID.on && !window.RAID.over) { e.stopImmediatePropagation(); if (confirm('Leave the raid now? You will lose everything you brought (like dying).')) window.rdEnd('died'); } }, true);

// a "stash & shop" button on the sector screen
(function addBtn() {
  const bar = document.querySelector('#mapSelectTop > div:last-child'); if (!bar || $('rdStashBtn')) return;
  const b = document.createElement('button'); b.className = 'msBtn'; b.id = 'rdStashBtn'; b.textContent = '🏚️ HIDEOUT'; b.onclick = () => window.rdOpenDeploy(null); bar.insertBefore(b, bar.firstChild);
})();

// sector cards show their difficulty (low sector numbers are easier)
const origGrid = window.renderMapGrid;
window.renderMapGrid = function () {
  origGrid();
  document.querySelectorAll('#mapGrid .mapCard').forEach(card => {
    const m = /SECTOR (\d+)/.exec(card.textContent); if (!m) return; const d = rDifficulty(parseInt(m[1], 10));
    const tag = document.createElement('div'); tag.style.cssText = `margin-top:5px;font-size:11px;font-weight:bold;color:${d.color}`; tag.textContent = '● ' + d.name.toUpperCase() + ' · ' + d.enemies[0] + '-' + d.enemies[1] + ' enemies'; card.appendChild(tag); card.style.borderColor = d.color + '88';
  });
};
// (goToMapSelect calls renderMapGrid by name, so the wrapper above is used from now on)

window.RDUI = { raidState, stashN, stashAdd, boxSize, renderDeploy: () => renderDeploy() };
})();
