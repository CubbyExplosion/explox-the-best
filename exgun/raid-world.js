// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — WORLD MAP  (sector select)
//   The 100 sectors are no longer a flat list: they sit on a map of the world, grouped into 16 countries that get more dangerous as you
//   travel from the quiet north-west towards the front lines in the east. Tap a country to zoom in and see its sectors, tap a sector to deploy.
//   "📋 List" switches back to the old card list. Hidden sectors (★) appear on the map when your level unlocks them.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const W = 1000, H = 500, X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
const LAND = [
  [[-168,66],[-162,70],[-140,70],[-125,70],[-95,72],[-82,69],[-78,62],[-92,58],[-82,52],[-78,57],[-64,60],[-56,52],[-66,45],[-70,42],[-76,35],[-81,31],[-80,25],[-83,29],[-90,30],[-97,27],[-97,21],[-87,21],[-88,16],[-83,10],[-79,9],[-86,13],[-92,15],[-105,20],[-110,24],[-115,30],[-110,23],[-117,32],[-124,40],[-124,48],[-135,57],[-150,60],[-165,55],[-158,58]],
  [[-55,60],[-45,60],[-20,70],[-20,80],[-45,83],[-65,80],[-70,76],[-55,68]],
  [[-79,9],[-72,12],[-62,10],[-52,5],[-50,0],[-35,-6],[-39,-14],[-41,-22],[-48,-26],[-58,-35],[-63,-40],[-66,-47],[-69,-52],[-72,-52],[-74,-45],[-72,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0],[-77,7]],
  [[-10,36],[-9,43],[-2,44],[-5,48],[2,51],[8,54],[10,58],[5,62],[15,69],[28,71],[40,67],[42,60],[30,56],[28,46],[40,45],[30,41],[26,40],[22,37],[18,40],[12,44],[16,38],[8,44],[3,42],[-1,37],[-6,36]],
  [[-6,50],[1,51],[2,53],[-2,57],[-3,59],[-6,58],[-5,54],[-4,52]], [[-10,52],[-6,52],[-6,55],[-10,54]],
  [[-17,21],[-10,30],[-6,36],[10,37],[11,33],[20,31],[32,31],[35,28],[43,12],[51,12],[40,-3],[40,-15],[35,-24],[32,-29],[20,-35],[18,-32],[12,-17],[13,-5],[9,4],[-8,4],[-17,14]],
  [[35,29],[43,13],[52,16],[57,24],[56,26],[50,30],[48,29],[39,22]],
  [[40,67],[60,70],[80,73],[105,77],[140,72],[170,70],[180,66],[160,60],[155,52],[142,53],[135,44],[130,42],[127,35],[122,40],[121,31],[120,24],[110,20],[108,15],[105,9],[100,13],[100,3],[98,8],[93,16],[88,22],[80,15],[77,8],[73,18],[68,24],[58,25],[56,27],[50,30],[44,37],[36,37],[30,41],[40,45],[42,60]],
  [[130,32],[135,34],[141,38],[141,43],[145,44],[140,41],[136,36],[131,34]],
  [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[131,-31],[115,-34],[114,-26]],
  [[95,5],[105,-6],[106,-6],[96,2]], [[109,1],[117,7],[119,1],[115,-4],[110,-3]], [[172,-34],[178,-38],[175,-41],[171,-44],[168,-46],[172,-41]], [[44,-25],[50,-15],[49,-13],[44,-17]]
];
// countries run from safe (sector 1) to deadly (sector 100)
const COUNTRIES = [
  ['Canada', '🇨🇦', -100, 58, 14, 'Frostline'], ['Brazil', '🇧🇷', -52, -10, 9, 'Green Hell'], ['Australia', '🇦🇺', 134, -25, 11, 'Red Outback'], ['United Kingdom', '🇬🇧', -2, 54, 2.6, 'Old Harbour'],
  ['France', '🇫🇷', 2, 46.5, 3.2, 'Iron Coast'], ['Mexico', '🇲🇽', -102, 23, 6, 'Dust Border'], ['Egypt', '🇪🇬', 30, 27, 4, 'Sand Ruins'], ['South Africa', '🇿🇦', 24, -29, 5, 'Gold Veldt'],
  ['India', '🇮🇳', 79, 22, 6, 'Monsoon Zone'], ['Japan', '🇯🇵', 138, 37, 3, 'Neon Ruins'], ['Germany', '🇩🇪', 10.5, 51, 3, 'Steel Valley'], ['Turkey', '🇹🇷', 35, 39, 5, 'Crossroads'],
  ['Poland', '🇵🇱', 19, 52, 3, 'Black Forest'], ['China', '🇨🇳', 103, 35, 10, 'Dragon Wall'], ['Ukraine', '🇺🇦', 31, 49, 5, 'Iron Steppe'], ['Russia', '🇷🇺', 90, 61, 18, 'Dead Tundra']
];
const PER = 100 / COUNTRIES.length;
const countryOf = i => Math.min(COUNTRIES.length - 1, Math.floor((i - 1) / PER));
function pos(i) {                                                              // deterministic spot inside the country
  const c = COUNTRIES[countryOf(i)], k = (i - 1) - Math.ceil(countryOf(i) * PER - 0.001), n = 7, a = (i * 2.399963) % 6.2832, r = c[4] * 2.78 * (0.25 + 0.75 * Math.sqrt(((i * 37) % 11 + 1) / 11));
  void k; void n; return { x: X(c[2]) + Math.cos(a) * r, y: Y(c[3]) + Math.sin(a) * r * 0.9 };
}
let sel = -1, mode = 'world'; try { mode = localStorage.getItem('exgun_mapmode') || 'world'; } catch (e) { }
const css = document.createElement('style'); css.textContent = `
#rdWorld { margin:0 0 14px; } #rdWorld svg { width:100%; height:auto; display:block; border:1px solid #3a2c22; border-radius:12px; background:#07131c; touch-action:manipulation; }
#rdWorld .cty { cursor:pointer; } #rdWorld .cty:hover circle.zone { fill-opacity:.32; } #rdWorld text { font-family:Arial,sans-serif; pointer-events:none; }
#rdWorld .pill { display:inline-block; margin:3px 4px 0 0; padding:5px 10px; background:#17130f; border:1px solid #3a2c22; border-radius:16px; color:#ffd9b0; font-size:12px; cursor:pointer; }
#rdWorld .pill.on { background:#ff6a33; border-color:#ff6a33; color:#fff; font-weight:bold; }
#rdWorld .sbtn { display:inline-block; margin:4px 5px 0 0; padding:7px 11px; background:#1d1712; border:1px solid #5a4030; border-radius:8px; color:#ffd9b0; font-size:12px; cursor:pointer; } #rdWorld .sbtn:hover { background:#2a1e15; }
#rdModeBtn { margin-left:8px; }`; document.head.appendChild(css);

function build() {
  const us = window.userState || (typeof userState !== 'undefined' ? userState : { level: 1 });
  const sectors = []; for (let i = 1; i <= 100; i++) { const hid = isHiddenMap(i); if (hid && us.level < requiredLevelForMap(i)) continue; sectors.push(i); }
  const c = sel >= 0 ? COUNTRIES[sel] : null, zr = c ? Math.max(70, c[4] * 2.78 * 2.6) : W, vw = c ? zr * 2 : W, vh = vw * H / W;
  let vx = c ? X(c[2]) - vw / 2 : 0, vy = c ? Y(c[3]) - vh / 2 : 0; vx = Math.max(0, Math.min(W - vw, vx)); vy = Math.max(0, Math.min(H - vh, vy));
  const mr = vw * 0.0085;                                                                                        // marker size stays about the same on screen
  let s = `<svg viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet"><defs><radialGradient id="rwOc" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#0d2535"/><stop offset="1" stop-color="#050c12"/></radialGradient></defs><rect x="0" y="0" width="${W}" height="${H}" fill="url(#rwOc)"/>`;
  for (let lo = -180; lo <= 180; lo += 30) s += `<line x1="${X(lo)}" y1="0" x2="${X(lo)}" y2="${H}" stroke="#12303f" stroke-width="${vw * 0.0012}"/>`;
  for (let la = -60; la <= 60; la += 30) s += `<line x1="0" y1="${Y(la)}" x2="${W}" y2="${Y(la)}" stroke="#12303f" stroke-width="${vw * 0.0012}"/>`;
  LAND.forEach(poly => { s += `<polygon points="${poly.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ')}" fill="#1b2b22" stroke="#3f6a50" stroke-width="${vw * 0.0016}" stroke-linejoin="round"/>`; });
  COUNTRIES.forEach((k, idx) => {
    const first = Math.ceil(idx * PER - 0.001) || 1, d = rDifficulty(Math.min(100, Math.max(1, Math.round((idx + 0.5) * PER)))), rr = k[4] * 2.78;
    s += `<g class="cty" data-c="${idx}"><circle class="zone" cx="${X(k[2])}" cy="${Y(k[3])}" r="${rr}" fill="${d.color}" fill-opacity="${idx === sel ? 0.28 : 0.13}" stroke="${d.color}" stroke-opacity=".55" stroke-width="${vw * 0.0016}"/>`;
    if (sel < 0) s += `<text x="${X(k[2])}" y="${Y(k[3]) - rr - vw * 0.004}" text-anchor="middle" font-size="${vw * 0.0125}" fill="#d9e6dc" stroke="#050c12" stroke-width="${vw * 0.002}" paint-order="stroke">${k[1]} ${k[0]}</text>`;
    s += `</g>`; void first;
  });
  sectors.forEach(i => {
    const p = pos(i), d = rDifficulty(i), hid = isHiddenMap(i), ci = countryOf(i), show = sel < 0 || sel === ci; if (!show) return;
    s += `<g class="sec" data-i="${i}" style="cursor:pointer"><title>Sector ${i} — ${COUNTRIES[ci][0]} · ${d.name}${hid ? ' · hidden' : ''}</title>`
      + (hid ? `<polygon points="${p.x},${p.y - mr * 1.5} ${p.x + mr},${p.y} ${p.x},${p.y + mr * 1.5} ${p.x - mr},${p.y}" fill="#ffd34a" stroke="#fff" stroke-width="${mr * 0.18}"/>` : `<circle cx="${p.x}" cy="${p.y}" r="${mr}" fill="${d.color}" stroke="#fff" stroke-width="${mr * 0.2}"/>`)
      + (sel >= 0 ? `<text x="${p.x}" y="${p.y - mr * 1.5}" text-anchor="middle" font-size="${mr * 1.9}" fill="#fff" stroke="#000" stroke-width="${mr * 0.3}" paint-order="stroke">${i}</text>` : '') + `<circle cx="${p.x}" cy="${p.y}" r="${mr * 2.2}" fill="transparent"/></g>`;
  });
  if (sel < 0) [[102, '🏙️ EXPLOX CITY', -32, 8, '#c46aff'], [101, '🌍 OPEN WORLD', -32, -14, '#4dffa0']].forEach(p => { const x = X(p[2]), y = Y(p[3]); s += `<g class="pin" data-m="${p[0]}" style="cursor:pointer"><title>${p[1]} — click to deploy</title><circle cx="${x}" cy="${y}" r="${vw * 0.011}" fill="${p[4]}" stroke="#fff" stroke-width="${vw * 0.002}"/><text x="${x}" y="${y - vw * 0.017}" text-anchor="middle" font-size="${vw * 0.0125}" fill="#fff" stroke="#000" stroke-width="${vw * 0.002}" paint-order="stroke">${p[1]}</text></g>`; });
  s += `</svg>`;
  let pills = `<span class="pill ${sel < 0 ? 'on' : ''}" data-c="-1">🌍 World</span>` + COUNTRIES.map((k, idx) => { const a = Math.ceil(idx * PER - 0.001) || 1, b = idx === COUNTRIES.length - 1 ? 100 : Math.floor((idx + 1) * PER - 0.001); return `<span class="pill ${idx === sel ? 'on' : ''}" data-c="${idx}">${k[1]} ${k[0]} <small>${a}–${b}</small></span>`; }).join('');
  let list = '';
  if (c) { list = `<div style="margin:8px 0"><button class="rdBtnS go" data-explore="${sel}">🗺️ EXPLORE ${c[0].toUpperCase()} — open country map</button> <small style="color:#9a8a80">a full map of ${c[0]} with its own landmarks, enemies, bank and extraction points</small></div>` + `<div style="margin-top:8px;color:#9a8a80;font-size:12px">${c[1]} <b style="color:#ffd9b0">${c[0]}</b> — region “${c[5]}”. Or tap a sector to deploy:</div>` + sectors.filter(i => countryOf(i) === sel).map(i => { const d = rDifficulty(i); return `<span class="sbtn" data-i="${i}" style="border-color:${d.color}88">${isHiddenMap(i) ? '★ ' : ''}Sector ${i} · <b style="color:${d.color}">${d.name}</b></span>`; }).join(''); }
  else list = `<div style="margin-top:8px;color:#9a8a80;font-size:12px">Green zones are safe, red are deadly. Tap a country to zoom in. ${sectors.length} sectors available.</div>`;
  return `${s}<div>${pills}</div>${list}`;
}
function render() {
  const wrap = document.getElementById('mapGridWrap'), grid = document.getElementById('mapGrid'); if (!wrap || !grid) return;
  let box = document.getElementById('rdWorld'); if (!box) { box = document.createElement('div'); box.id = 'rdWorld'; wrap.insertBefore(box, grid); }
  const title = document.getElementById('mapGridTitle'); let btn = document.getElementById('rdModeBtn');
  if (title && !btn) { btn = document.createElement('button'); btn.id = 'rdModeBtn'; btn.className = 'rdBtnS'; btn.onclick = () => { mode = mode === 'world' ? 'list' : 'world'; try { localStorage.setItem('exgun_mapmode', mode); } catch (e) { } render(); }; title.appendChild(btn); }
  if (btn) btn.textContent = mode === 'world' ? '📋 List' : '🌍 World map';
  grid.style.display = mode === 'world' ? 'none' : ''; box.style.display = mode === 'world' ? '' : 'none'; if (mode !== 'world') return;
  box.innerHTML = build();
  box.querySelectorAll('.cty,.pill').forEach(el => el.addEventListener('click', () => { sel = el.classList.contains('pill') || sel !== parseInt(el.dataset.c, 10) ? parseInt(el.dataset.c, 10) : sel; render(); }));
  box.querySelectorAll('.pin').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); enterMap(parseInt(el.dataset.m, 10)); }));
  box.querySelectorAll('[data-explore]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); enterMap((window.COUNTRY_BASE || 200) + parseInt(el.dataset.explore, 10)); }));
  box.querySelectorAll('.sec,.sbtn').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); enterMap(parseInt(el.dataset.i, 10)); }));
}
const prev = window.renderMapGrid;
window.renderMapGrid = function () { prev(); try { render(); } catch (e) { console.warn('world map', e); } };
})();
