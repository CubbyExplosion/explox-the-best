// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN RAID — ARMORY & SHOP  (browse ~220 guns, ~100 attachments, ~90 ammo types, ~120 armor pieces, medicine and throwables)
//   Every tab has search, filters, sorting and pages (24 per page). Gun pictures are drawn a few at a time so the page never freezes.
//   WEAPONS      pick a gun: rotating 3D preview you can drag, stat bars, buy / equip, and fit attachments (7 slots). Variants can ship with built-in parts.
//   ATTACHMENTS  optics, muzzles, grips, magazines, side rail, stocks, barrels.   AMMO by caliber.   ARMOR vests + helmets.   BACKPACKS.
//   MEDICAL      incl. stims.   THROWABLES   grenades.   SELL   loot, spare parts and gear → scrap.
// Installed attachments belong to the gun: if the gun is lost in a raid (and was not insured) they are lost with it.
// Uses raid-ui.js's stash helpers through window.RDUI.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const $ = id => document.getElementById(id), U = () => window.RDUI, PAGE = 24;
let tab = 'weapons', selW = null, preview = null;
const F = {};       // per-tab filter state: { q, cat, sort, page, owned }
function fs(t) { return F[t] || (F[t] = { q: '', cat: 'all', sort: 'price', page: 0, owned: false }); }

const css = document.createElement('style'); css.textContent = `
#rdShop { z-index:61; }
.shTabs { display:flex; flex-wrap:wrap; gap:6px; margin:12px 0; } .shTab { background:#1c1611; border:1px solid #3a2c22; color:#cdbfb2; border-radius:8px; padding:8px 13px; cursor:pointer; font-size:13px; font-weight:bold; }
.shTab.on { background:#ff6a33; border-color:#ff6a33; color:#fff; }
.shCtl { display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin:10px 0; } .shCtl input[type=text] { background:#17130f; border:1px solid #4a3828; color:#ffd9b0; border-radius:8px; padding:7px 10px; font-size:13px; min-width:160px; }
.shCtl select { background:#17130f; border:1px solid #4a3828; color:#ffd9b0; border-radius:8px; padding:7px; font-size:13px; }
.shChip { background:#1c1611; border:1px solid #3a2c22; color:#cdbfb2; border-radius:99px; padding:4px 11px; cursor:pointer; font-size:12px; } .shChip.on { background:#3a2c20; border-color:#ff8a44; color:#ffd9b0; font-weight:bold; }
.shGrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:10px; }
.shCard { background:#17130f; border:1px solid #3a2c22; border-radius:10px; padding:8px; cursor:pointer; position:relative; } .shCard:hover { border-color:#7a5a40; } .shCard.on { border-color:#ff6a33; background:#221811; }
.shCard img { width:100%; height:78px; object-fit:contain; display:block; background:radial-gradient(circle at 50% 40%,#3a342c,#14110e); border-radius:6px; min-height:78px; }
.shCard b { color:#ffd9b0; font-size:12.5px; display:block; margin-top:3px; } .shCard small { color:#9a8a80; display:block; font-size:11px; } .shPrice { color:#ffd54a; font-weight:bold; font-size:12px; } .shOwned { color:#7dffb0; font-weight:bold; font-size:11px; }
.shPager { display:flex; gap:8px; align-items:center; justify-content:center; margin:14px 0; color:#cdbfb2; font-size:13px; }
.shDetail { display:grid; grid-template-columns:minmax(260px,1.1fr) minmax(240px,1fr); gap:14px; background:#120f0c; border:1px solid #3a2c22; border-radius:12px; padding:12px; margin-bottom:12px; }
@media (max-width:760px) { .shDetail { grid-template-columns:1fr; } }
#shPrev { width:100%; height:220px; border-radius:8px; background:radial-gradient(circle at 50% 35%,#4a4238,#14110e); overflow:hidden; cursor:grab; }
.shBar { display:flex; align-items:center; gap:8px; margin:5px 0; font-size:12px; } .shBar span { width:92px; color:#cdbfb2; } .shBar i { flex:1; height:8px; background:#2a2118; border-radius:4px; overflow:hidden; display:block; } .shBar em { display:block; height:100%; background:linear-gradient(90deg,#ff8a44,#ffd54a); } .shBar u { width:50px; text-align:right; text-decoration:none; color:#ffd9b0; }
.shSlot { display:flex; align-items:center; justify-content:space-between; gap:6px; background:#1a1510; border:1px solid #33271d; border-radius:8px; padding:5px 8px; margin:4px 0; font-size:12px; } .shSlot select { background:#241a12; color:#ffd9b0; border:1px solid #5a4030; border-radius:6px; padding:4px; font-size:12px; max-width:200px; }
`; document.head.appendChild(css);
const box = document.createElement('div'); box.id = 'rdShop'; box.className = 'rdScreen'; document.body.appendChild(box);

function openShop(t) { tab = t || 'weapons'; render(); box.classList.add('active'); }
function closeShop() { if (preview) { preview.dispose(); preview = null; } box.classList.remove('active'); }
window.rdOpenShop = openShop;

function bar(label, v, max, txt) { return `<div class="shBar"><span>${label}</span><i><em style="width:${Math.max(3, Math.min(100, v / max * 100))}%"></em></i><u>${txt}</u></div>`; }
function statsFor(w, mods) {
  const base = R_GUN[w.id], eff = rGunStats(w.id, mods), a = R_AMMO[R_CAL_DEFAULT[base.cal]], rate = (base.mode === 'bolt' ? 0.9 : base.mode === 'pump' ? 1.5 : w.fireRate) * (eff.rateMul || 1);
  return { dmg: a.dmg * (a.pellets || 1) * eff.dmgMul, pellets: a.pellets, rate, recoil: Math.max(0, 100 - eff.kickV * 22 - eff.kickH * 10), handling: Math.max(0, 100 - eff.reload * 12), range: Math.round(w.range * (eff.rangeMul || 1)), mag: eff.mag, zoom: eff.zoom, supp: eff.suppressed, acc: Math.max(0, 100 - w.spread * eff.spreadMul * 2800) };
}
function fxText(a) { const fx = []; if (a.zoomSet) fx.push(a.zoomSet + '× zoom'); if (a.zoomAdd) fx.push('+' + a.zoomAdd.toFixed(2) + ' zoom'); if (a.spreadMul && a.spreadMul < 1) fx.push('accuracy +' + Math.round((1 - a.spreadMul) * 100) + '%'); if (a.spreadMul && a.spreadMul > 1) fx.push('accuracy −' + Math.round((a.spreadMul - 1) * 100) + '%'); if (a.kickV) fx.push('vert. recoil −' + Math.round((1 - a.kickV) * 100) + '%'); if (a.kickH) fx.push('side recoil −' + Math.round((1 - a.kickH) * 100) + '%'); if (a.magMul) fx.push('magazine ×' + a.magMul); if (a.reloadMul) fx.push(a.reloadMul < 1 ? 'reload faster' : 'reload slower'); if (a.rangeMul) fx.push('range ' + (a.rangeMul >= 1 ? '+' : '−') + Math.round(Math.abs(a.rangeMul - 1) * 100) + '%'); if (a.rateMul) fx.push('fire rate ' + (a.rateMul >= 1 ? '+' : '−') + Math.round(Math.abs(a.rateMul - 1) * 100) + '%'); if (a.dmgMul && a.dmgMul !== 1) fx.push('damage ' + (a.dmgMul > 1 ? '+' : '−') + Math.round(Math.abs(a.dmgMul - 1) * 100) + '%'); if (a.suppressed) fx.push('quiet shots'); return fx.join(' · '); }

// ───────── generic list: search + chips + sort + pages ─────────
function listHtml(t, items, opts) {          // items: [{ key, name, price, sortVal, cat, html }]
  const f = fs(t); let list = items.filter(o => (f.cat === 'all' || o.cat === f.cat) && (!f.q || o.name.toLowerCase().includes(f.q.toLowerCase())) && (!f.owned || o.owned));
  const sorters = { price: (a, b) => a.price - b.price, priceD: (a, b) => b.price - a.price, name: (a, b) => a.name.localeCompare(b.name), stat: (a, b) => (b.sortVal || 0) - (a.sortVal || 0) };
  list.sort(sorters[f.sort] || sorters.price); const pages = Math.max(1, Math.ceil(list.length / PAGE)); f.page = Math.min(f.page, pages - 1);
  const cats = opts.cats ? `<div class="shCtl">${opts.cats.map(c => `<span class="shChip ${f.cat === c[0] ? 'on' : ''}" data-cat="${c[0]}">${c[1]}</span>`).join('')}</div>` : '';
  const ctl = `<div class="shCtl"><input type="text" id="shQ" placeholder="Search…" value="${f.q.replace(/"/g, '&quot;')}"><select id="shSort"><option value="price" ${f.sort === 'price' ? 'selected' : ''}>Price ↑</option><option value="priceD" ${f.sort === 'priceD' ? 'selected' : ''}>Price ↓</option><option value="name" ${f.sort === 'name' ? 'selected' : ''}>Name</option>${opts.statLabel ? `<option value="stat" ${f.sort === 'stat' ? 'selected' : ''}>${opts.statLabel}</option>` : ''}</select>${opts.owned ? `<span class="shChip ${f.owned ? 'on' : ''}" id="shOwned">✔ Owned only</span>` : ''}<span style="color:#9a8a80;font-size:12px">${list.length} items</span></div>`;
  const slice = list.slice(f.page * PAGE, f.page * PAGE + PAGE);
  const pager = pages > 1 ? `<div class="shPager"><button class="rdBtnS" data-pg="-1" ${f.page ? '' : 'disabled'}>◀ Prev</button><span>Page ${f.page + 1} / ${pages}</span><button class="rdBtnS" data-pg="1" ${f.page < pages - 1 ? '' : 'disabled'}>Next ▶</button></div>` : '';
  return ctl + cats + `<div class="shGrid">${slice.map(o => o.html).join('') || '<div style="color:#9a8a80">Nothing matches.</div>'}</div>` + pager;
}
function wireList() {
  const f = fs(tab), st = U();
  const q = $('shQ'); if (q) q.addEventListener('input', () => { f.q = q.value; f.page = 0; clearTimeout(wireList.t); wireList.t = setTimeout(() => render(true), 250); });
  const so = $('shSort'); if (so) so.onchange = () => { f.sort = so.value; render(true); };
  const ow = $('shOwned'); if (ow) ow.onclick = () => { f.owned = !f.owned; f.page = 0; render(true); };
  box.querySelectorAll('[data-cat]').forEach(el => el.onclick = () => { f.cat = el.dataset.cat; f.page = 0; render(true); });
  box.querySelectorAll('[data-pg]').forEach(el => el.onclick = () => { f.page += parseInt(el.dataset.pg, 10); render(true); box.scrollTop = box.querySelector('.shGrid').offsetTop - 80; });
  void st;
}
// draw gun pictures a few at a time
function fillIcons() {
  const imgs = [...box.querySelectorAll('img[data-ic]')]; let i = 0;
  (function next() { const t0 = performance.now(); while (i < imgs.length && performance.now() - t0 < 22) { const im = imgs[i++]; const mods = (U().raidState().mods || {})[im.dataset.ic] || {}; im.src = rdGunIcon(im.dataset.ic, mods); } if (i < imgs.length && box.classList.contains('active')) setTimeout(next, 16); })();
}

// ───────── cards ─────────
function weaponCard(w) {
  const owned = userState.ownedWeapons.includes(w.id), g = R_GUN[w.id];
  return { key: w.id, name: w.name, price: weaponCost(w.tier), sortVal: w.fireRate, cat: w.cat, owned,
    html: `<div class="shCard ${selW === w.id ? 'on' : ''}" data-w="${w.id}"><img data-ic="${w.id}" alt=""><b>${w.name}</b><small>${w.cat} · ${R_CAL_NAMES[g.cal]}${g.preMods && Object.keys(g.preMods).length ? ' · 🔧 built-in parts' : ''}</small>${owned ? '<span class="shOwned">✔ OWNED</span>' : `<span class="shPrice">⚙️ ${weaponCost(w.tier)}</span>`}</div>` };
}
function render(keepScroll) {
  const st = U(), r = st.raidState(); if (!r.mods) r.mods = {};
  const tabs = [['weapons', '🔫 Weapons'], ['att', '🔧 Attachments'], ['ammo', '🔸 Ammo'], ['armor', '🦺 Armor'], ['bag', '🎒 Backpacks'], ['med', '🩹 Medical'], ['nade', '💣 Throwables'], ['sell', '💰 Sell']];
  let h = `<div class="rdWrap"><div class="rdTop"><div><h1>🔫 ARMORY &amp; SHOP</h1><div style="color:#9a8a80;font-size:12px">${R_COUNTS.guns} guns · ${R_COUNTS.att} attachments · ${R_COUNTS.ammo} ammo types · ${R_COUNTS.armor} armor pieces · ${R_COUNTS.med} medical · ${R_COUNTS.nade} throwables</div></div>
    <div><span class="rdCard" style="display:inline-block;min-width:0;flex:none">⚙️ <b>${userState.scrap}</b> scrap</span> <button class="rdBtnS" id="shClose">← Back</button></div></div>
    <div class="shTabs">${tabs.map(t => `<div class="shTab ${tab === t[0] ? 'on' : ''}" data-tab="${t[0]}">${t[1]}</div>`).join('')}</div>`;
  const keep = box.scrollTop;
  if (tab === 'weapons') {
    const all = WEAPON_CATALOG.filter(w => R_GUN[w.id]);
    if (!selW || !R_GUN[selW]) selW = (all.find(w => w.id === userState.equippedWeapon) || all[0]).id;
    const w = weaponById(selW), owned = userState.ownedWeapons.includes(w.id), mods = r.mods[w.id] || {}, s = statsFor(w, mods), base = statsFor(w, {}), pre = R_GUN[w.id].preMods || {};
    const diff = (a, b) => (b - a > 0.5 ? ` <span style="color:#7dffb0">▲</span>` : b - a < -0.5 ? ` <span style="color:#ff8a6a">▼</span>` : '');
    h += `<div class="shDetail"><div><div id="shPrev"></div><div style="margin-top:6px;text-align:center"><small style="color:#9a8a80">Drag to rotate</small></div></div>
      <div><div style="font-size:18px;font-weight:bold;color:#ffd9b0">${w.name}</div><div style="color:#9a8a80;font-size:12px;margin-bottom:8px">${w.cat} · ${R_CAL_NAMES[R_GUN[w.id].cal]} · ${R_GUN[w.id].mode.toUpperCase()}${R_GUN[w.id].auto ? '/AUTO' : ''}${R_GUN[w.id].finish ? ' · ' + R_GUN[w.id].finish + ' finish' : ''}</div>
      ${bar('Damage', s.dmg, 140, Math.round(s.dmg))}${s.pellets ? `<div style="font-size:11px;color:#9a8a80;margin:-2px 0 4px 100px">${s.pellets} pellets per shot</div>` : ''}
      ${bar('Fire rate', s.rate, 14, s.rate.toFixed(1) + '/s')}${bar('Accuracy', s.acc, 100, Math.round(s.acc))}${bar('Recoil control', s.recoil, 100, Math.round(s.recoil) + diff(base.recoil, s.recoil))}
      ${bar('Handling', s.handling, 100, Math.round(s.handling))}${bar('Range', s.range, 200, s.range + 'm')}${bar('Magazine', s.mag, 120, s.mag + diff(base.mag, s.mag))}${bar('Zoom', s.zoom, 12, s.zoom.toFixed(1) + '×' + diff(base.zoom, s.zoom))}
      ${s.supp ? '<div style="color:#7dffb0;font-size:12px">🔇 Suppressed: enemies only hear you up close</div>' : ''}
      <div style="margin-top:10px">${owned ? (userState.equippedWeapon === w.id ? '<button class="rdBtnS" disabled>✔ Equipped for raids</button>' : `<button class="rdBtnS" id="shEquip">Equip</button>`) : `<button class="rdBtnS go" id="shBuyW" ${userState.scrap >= weaponCost(w.tier) ? '' : 'disabled'}>Buy ⚙️${weaponCost(w.tier)}</button>`}</div></div></div>`;
    h += owned ? `<h2>🔧 ATTACHMENTS ON THIS GUN</h2>` + R_ATT_SLOTS.map(([slot, label]) => {
      const opts = Object.keys(R_ATT).filter(id => R_ATT[id].slot === slot && rAttFits(id, w.id) && st.stashN('att:' + id) > 0), cur = mods[slot], built = pre[slot];
      return `<div class="shSlot"><span><b>${label}</b>: ${cur ? R_ATT[cur].emoji + ' ' + R_ATT[cur].name : built ? '<span style="color:#9fe3ff">' + R_ATT[built].emoji + ' ' + R_ATT[built].name + ' (built-in)</span>' : '<span style="color:#7a6a5f">empty</span>'}</span><span>${cur ? `<button class="rdBtnS" data-rm="${slot}">Remove</button>` : ''}${opts.length ? `<select data-inst="${slot}"><option value="">Install…</option>${opts.map(id => `<option value="${id}">${R_ATT[id].name} (×${st.stashN('att:' + id)})</option>`).join('')}</select>` : (!cur ? '<small style="color:#7a6a5f">none in stash — buy in Attachments</small>' : '')}</span></div>`; }).join('')
      : `<div class="rdWarn">Buy this gun to fit attachments.</div>`;
    h += `<h2>ALL WEAPONS</h2>` + listHtml('weapons', all.map(weaponCard), { cats: [['all', 'All'], ['Pistol', 'Pistols'], ['SMG', 'SMGs'], ['Rifle', 'Rifles'], ['Shotgun', 'Shotguns'], ['Sniper', 'Snipers'], ['LMG', 'LMGs']], owned: true, statLabel: 'Fire rate ↓' });
  } else if (tab === 'att') {
    const items = Object.keys(R_ATT).map(id => { const a = R_ATT[id]; return { key: id, name: a.name, price: a.price, cat: a.slot, sortVal: a.price, html: `<div class="shCard" style="cursor:default"><div style="font-size:28px;text-align:center">${a.emoji}</div><b>${a.name}</b><small>${R_ATT_SLOTS.find(s => s[0] === a.slot)[1]} · ${fxText(a)}</small><small>${a.needs ? 'Fits ' + a.needs.length + ' gun types' : 'Fits all guns'} · in stash: ${st.stashN('att:' + id)}</small><button class="rdBtnS" data-buya="${id}" ${userState.scrap >= a.price ? '' : 'disabled'}>Buy ⚙️${a.price}</button></div>` }; });
    h += `<div style="font-size:12.5px;color:#9a8a80">Buy attachments, then install them on a gun in the Weapons tab. You can also find them as loot.</div>` + listHtml('att', items, { cats: [['all', 'All'], ...R_ATT_SLOTS.map(s => [s[0], s[1]])] });
  } else if (tab === 'ammo') {
    const items = Object.keys(R_AMMO).map(id => { const a = R_AMMO[id], bs = st.boxSize(id), cost = Math.round(a.price * bs); return { key: id, name: a.name, price: cost, cat: a.cal, sortVal: a.dmg, html: `<div class="shCard" style="cursor:default"><b>${a.name}</b><small>${R_CAL_NAMES[a.cal]} · dmg ${a.dmg}${a.pellets ? '×' + a.pellets : ''} · pen ${a.pen}${a.sub ? ' · quiet' : ''}${a.fire ? ' · burns' : ''}${a.acc ? ' · accurate' : ''}</small><small>In stash: ${st.stashN(id)}</small><button class="rdBtnS" data-buyammo="${id}" ${userState.scrap >= cost ? '' : 'disabled'}>Buy ${bs} · ⚙️${cost}</button></div>` }; });
    h += listHtml('ammo', items, { cats: [['all', 'All'], ...Object.keys(R_CAL_NAMES).map(c => [c, R_CAL_NAMES[c]])], statLabel: 'Damage ↓' });
  } else if (tab === 'armor' || tab === 'bag') {
    const want = tab === 'bag' ? ['bag'] : ['vest', 'helmet'];
    const items = Object.keys(R_ARMOR).filter(id => want.includes(R_ARMOR[id].slot)).map(id => { const a = R_ARMOR[id]; return { key: id, name: a.name, price: a.price, cat: a.slot === 'bag' ? 'all' : a.slot + (a.ac ? ':' + a.ac : ''), sortVal: a.ac || a.slots, html: `<div class="shCard" style="cursor:default"><div style="font-size:28px;text-align:center">${a.emoji}</div><b>${a.name}</b><small>${a.slot === 'bag' ? '+' + a.slots + ' slots' : (a.slot === 'vest' ? 'Chest + stomach' : 'Head') + ' · AC' + a.ac + ' · dur ' + a.dur}</small>${a.speed && a.speed < 0.995 ? `<small>Speed ${Math.round(a.speed * 100)}%</small>` : ''}<button class="rdBtnS" data-buyarm="${id}" ${userState.scrap >= a.price ? '' : 'disabled'}>Buy ⚙️${a.price}</button></div>` }; });
    const cats = tab === 'bag' ? null : [['all', 'All'], ...[1, 2, 3, 4, 5, 6].map(ac => ['vest:' + ac, 'Vest AC' + ac]), ...[1, 2, 3, 4, 5].map(ac => ['helmet:' + ac, 'Helmet AC' + ac])];
    const f = fs(tab); if (cats && f.cat !== 'all') { /* cat filter compares cat strings exactly */ }
    h += listHtml(tab, items, { cats, statLabel: tab === 'bag' ? 'Capacity ↓' : 'Armor class ↓' });
  } else if (tab === 'med') {
    const items = Object.keys(R_MED).map(id => { const m = R_MED[id]; return { key: id, name: m.name, price: m.price, cat: 'all', sortVal: m.heal || 0, html: `<div class="shCard" style="cursor:default"><div style="font-size:28px;text-align:center">${m.emoji}</div><b>${m.name}</b><small>${m.desc} · use ${m.use}s</small><small>In stash: ${st.stashN(id)}</small><button class="rdBtnS" data-buymed="${id}" ${userState.scrap >= m.price ? '' : 'disabled'}>Buy ⚙️${m.price}</button></div>` }; });
    h += listHtml('med', items, { statLabel: 'Healing ↓' });
  } else if (tab === 'nade') {
    const items = Object.keys(R_NADE).map(id => { const n = R_NADE[id]; return { key: id, name: n.name, price: n.price, cat: n.kind, sortVal: n.dmg || n.radius, html: `<div class="shCard" style="cursor:default"><div style="font-size:28px;text-align:center">${n.emoji}</div><b>${n.name}</b><small>${n.kind === 'frag' || n.kind === 'impact' ? 'Damage ' + n.dmg + ' · radius ' + n.radius + 'm' : n.kind === 'smoke' ? 'Blocks sight for ' + n.time + 's · radius ' + n.radius + 'm' : n.kind === 'flash' ? 'Blinds enemies ' + n.time + 's' : n.kind === 'c4' ? 'Sticks where it lands · X detonates · dmg ' + n.dmg + ' · radius ' + n.radius + 'm' : n.kind === 'mine' ? 'Arms in 1.5s · explodes near enemies · dmg ' + n.dmg : n.kind === 'airstrike' ? 'Smoke marker, then 8 bombs · dmg ' + n.dmg + ' each' : n.kind === 'nuke' ? 'KILLS EVERY SOLDIER on the field. Team Battle / Hardcore: aim + N · in a raid: throw it 150m+ away' : 'Burns for ' + n.time + 's · ' + n.dmg + '/s'}${n.kind === 'impact' ? ' · explodes on hit' : ''}</small><small>In stash: ${st.stashN('gren:' + id)}</small><button class="rdBtnS" data-buyn="${id}" ${userState.scrap >= n.price ? '' : 'disabled'}>Buy ⚙️${n.price}</button></div>` }; });
    h += `<div style="font-size:12.5px;color:#9a8a80">In a raid: <b>G</b> throws the selected one, <b>4</b> switches type. Smoke blocks enemy sight, flash-bangs blind them, frags and fire hurt anyone nearby — including you.</div>` + listHtml('nade', items, { cats: [['all', 'All'], ['frag', 'Frag'], ['impact', 'Impact'], ['smoke', 'Smoke'], ['flash', 'Flash'], ['fire', 'Fire']], statLabel: 'Power ↓' });
  } else {
    const sellable = Object.keys(r.stash).filter(id => r.stash[id] > 0).map(id => ({ id, n: r.stash[id], it: rItem(id) })).filter(o => ['loot', 'att', 'weapon', 'gren', 'med', 'ammo'].includes(o.it.kind));
    const items = sellable.map(o => ({ key: o.id, name: o.it.name, price: o.it.value, cat: o.it.kind, sortVal: o.it.value * o.n, html: `<div class="shCard" style="cursor:default"><div style="font-size:28px;text-align:center">${o.it.emoji}</div><b>${o.it.name} ×${o.n}</b><small>⚙️${o.it.value} each</small><button class="rdBtnS" data-sell="${o.id}">Sell all · ⚙️${o.it.value * o.n}</button></div>` }));
    const gear = r.gear.map((g, i) => { const a = R_ARMOR[g.id], v = Math.round(a.price * 0.5 * (a.slot === 'bag' ? 1 : g.dur / a.dur)); return { key: 'g' + i, name: a.name, price: v, cat: 'gear', sortVal: v, html: `<div class="shCard" style="cursor:default"><div style="font-size:28px;text-align:center">${a.emoji}</div><b>${a.name}</b><small>${a.slot === 'bag' ? '' : 'Durability ' + Math.round(g.dur) + '/' + a.dur}</small><button class="rdBtnS" data-sellg="${i}">Sell · ⚙️${v}</button></div>` }; });
    h += `<div style="font-size:12.5px;color:#9a8a80;margin-bottom:6px">Sell loot, spare parts, ammo and gear from your stash. (Items you keep for raids stay in the Hideout.)</div>` + listHtml('sell', items.concat(gear), { cats: [['all', 'All'], ['loot', 'Loot'], ['att', 'Parts'], ['ammo', 'Ammo'], ['med', 'Medical'], ['gren', 'Throwables'], ['gear', 'Gear']] });
    h += items.length ? `<button class="rdBtnS" id="shSellLoot" style="margin-top:10px">Sell all loot · ⚙️${sellable.filter(o => o.it.kind === 'loot').reduce((s, o) => s + o.it.value * o.n, 0)}</button>` : '';
  }
  h += `</div>`;
  if (preview) { preview.dispose(); preview = null; } box.innerHTML = h; box.scrollTop = keepScroll ? keep : keep; wire(); fillIcons();
  if (tab === 'weapons') { const w = weaponById(selW); preview = rdGunPreview($('shPrev'), w.id, r.mods[w.id] || {}); }
}
function wire() {
  const st = U(), r = st.raidState(), on = (q, fn) => box.querySelectorAll(q).forEach(el => el.addEventListener('click', e => { e.stopPropagation(); fn(el); }));
  $('shClose').onclick = () => { closeShop(); const dep = $('rdDeploy'); if (dep && dep.classList.contains('active')) st.renderDeploy(); else if (inGame === false) goToMapSelect(); };
  on('[data-tab]', el => { tab = el.dataset.tab; render(); box.scrollTop = 0; });
  on('[data-w]', el => { selW = el.dataset.w; render(true); box.scrollTop = 0; });
  wireList();
  const buyW = $('shBuyW'); if (buyW) buyW.onclick = () => { const w = weaponById(selW), c = weaponCost(w.tier); if (userState.scrap >= c && !userState.ownedWeapons.includes(w.id)) { userState.scrap -= c; userState.ownedWeapons.push(w.id); userState.equippedWeapon = w.id; saveUserData(); render(true); } };
  const eq = $('shEquip'); if (eq) eq.onclick = () => { userState.equippedWeapon = selW; saveUserData(); render(true); };
  box.querySelectorAll('[data-inst]').forEach(sel => sel.addEventListener('change', () => { const id = sel.value; if (!id) return; if (!r.mods[selW]) r.mods[selW] = {}; const slot = sel.dataset.inst, old = r.mods[selW][slot]; if (old) st.stashAdd('att:' + old, 1); r.mods[selW][slot] = id; st.stashAdd('att:' + id, -1); window.rdClearGunIcons && 0; saveUserData(); render(true); }));
  on('[data-rm]', el => { const slot = el.dataset.rm, cur = r.mods[selW] && r.mods[selW][slot]; if (cur) { st.stashAdd('att:' + cur, 1); delete r.mods[selW][slot]; saveUserData(); render(true); } });
  const buy = (sel, fn) => on(sel, el => { fn(el.dataset[Object.keys(el.dataset)[0]]); saveUserData(); render(true); });
  buy('[data-buya]', id => { const p = R_ATT[id].price; if (userState.scrap >= p) { userState.scrap -= p; st.stashAdd('att:' + id, 1); } });
  buy('[data-buyammo]', id => { const bs = st.boxSize(id), c = Math.round(R_AMMO[id].price * bs); if (userState.scrap >= c) { userState.scrap -= c; st.stashAdd(id, bs); } });
  buy('[data-buyarm]', id => { const p = R_ARMOR[id].price; if (userState.scrap >= p) { userState.scrap -= p; r.gear.push({ id, dur: R_ARMOR[id].dur }); } });
  buy('[data-buymed]', id => { const p = R_MED[id].price; if (userState.scrap >= p) { userState.scrap -= p; st.stashAdd(id, 1); } });
  buy('[data-buyn]', id => { const p = R_NADE[id].price; if (userState.scrap >= p) { userState.scrap -= p; st.stashAdd('gren:' + id, 1); } });
  buy('[data-sell]', id => { const n = st.stashN(id); userState.scrap += rItem(id).value * n; st.stashAdd(id, -n); });
  buy('[data-sellg]', i => { const g = r.gear[parseInt(i, 10)]; if (!g) return; const a = R_ARMOR[g.id]; userState.scrap += Math.round(a.price * 0.5 * (a.slot === 'bag' ? 1 : g.dur / a.dur)); r.gear.splice(parseInt(i, 10), 1); });
  const sl = $('shSellLoot'); if (sl) sl.onclick = () => { Object.keys(r.stash).forEach(id => { const it = rItem(id); if (it.kind === 'loot') { userState.scrap += it.value * r.stash[id]; delete r.stash[id]; } }); saveUserData(); render(true); };
}
// the 🔫 ARMORY button opens this shop instead of the original small popup
const ab = $('openArmoryBtn'); if (ab) ab.addEventListener('click', e => { e.stopImmediatePropagation(); openShop('weapons'); }, true);
const hideout = $('rdDeploy'); if (hideout) new MutationObserver(() => {
  const back = $('rdBack'); if (back && !$('rdOpenShopBtn')) { const b = document.createElement('button'); b.className = 'rdBtnS'; b.id = 'rdOpenShopBtn'; b.textContent = '🔫 Armory & Shop'; b.onclick = () => openShop('weapons'); back.parentNode.insertBefore(b, back); }
}).observe(hideout, { childList: true });
})();
