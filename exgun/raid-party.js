// ═══════════════════════════════════════════════════════════════════════════════
// EXGUN — INVITE REAL PEOPLE TO ANY GAME  (👥 INVITE button, or press J in a game)
//   Press 👥 INVITE (top-left, on the sector screen and inside every mode) to get an invite LINK for the game you are in — Team Battle, No Mercy,
//   Hardcore (any level), Endless, Open World, Explox City, any country, any sector. Send the link to a friend; when they open it and log in
//   they get a "Join" button that drops them into the SAME mode and map. You can also share a short PARTY CODE to type in.
//   Everyone in the same party sees each other in the game as a named teammate (blue soldier with a name tag) and a roster shows who is online,
//   how far away they are and what they are playing. Players outside your party never see you.
//   (Like Team Battle: everyone's computer runs its own enemies, so you fight side by side but the NPCs are not shared; the maps are identical.)
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const $ = id => document.getElementById(id);
const PARTY = window.PARTY = { code: null, host: null };
try { const s = JSON.parse(sessionStorage.getItem('exgun_party') || 'null'); if (s && s.code) { PARTY.code = s.code; PARTY.host = s.host; } } catch (e) { }
const save = () => { try { sessionStorage.setItem('exgun_party', JSON.stringify(PARTY.code ? { code: PARTY.code, host: PARTY.host } : null)); } catch (e) { } };
const newCode = () => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 5; i++) c += a[Math.floor(Math.random() * a.length)]; return c; };
function ensureParty() { if (!PARTY.code) { PARTY.code = newCode(); PARTY.host = (typeof currentUser !== 'undefined' && currentUser) || 'me'; save(); } return PARTY.code; }
// what game are we in right now?
function descriptor() {
  const BT = window.BATTLE, R = window.RAID;
  if (BT && BT.on) { if (BT.mode === 'hardcore' && BT.hc) return { m: 'hardcore', v: window.HCX ? window.HCX.TIERS.indexOf(BT.hc.T) : 0, label: 'Hardcore · ' + BT.hc.T.label }; if (BT.mode === 'endless') return { m: 'endless', v: 0, label: 'Endless' }; if (BT.mode === 'nomercy' && BT.nmMap) return { m: 'nomercy', v: BT.nmMap.id, label: 'No Mercy · ' + BT.nmMap.name }; return { m: 'battle', v: 0, label: 'Team Battle' }; }
  if (R && R.on && R.mapIndex !== undefined && R.mapIndex !== null) { const i = R.mapIndex; return { m: 'raid', v: i, label: typeof mapNameForMap === 'function' ? mapNameForMap(i) : 'Sector ' + i }; }
  return null;
}
function linkFor(d) { const u = new URL(location.href); u.search = ''; u.hash = ''; u.searchParams.set('party', ensureParty()); u.searchParams.set('host', PARTY.host || ''); if (d) { u.searchParams.set('m', d.m); u.searchParams.set('v', d.v); } return u.toString(); }
// ───────── joining ─────────
function startDescriptor(d) {
  try {
    if (d.m === 'hardcore' && window.HCX) window.HCX.start(window.HCX.TIERS[d.v] || window.HCX.TIERS[0]);
    else if (d.m === 'endless' && window.ENX) window.ENX.start();
    else if (d.m === 'nomercy' && window.NMX) window.NMX.start(window.NMX.MAPS[d.v - 1] || window.NMX.MAPS[0]);
    else if (d.m === 'battle' && window.BTX) window.BTX.startBattle(0);
    else if (d.m === 'raid') window.enterMap(parseInt(d.v, 10));
  } catch (e) { console.warn('join start', e); }
}
const q = new URLSearchParams(location.search); let pending = null;
if (q.get('party')) { PARTY.code = q.get('party').toUpperCase().slice(0, 8); PARTY.host = q.get('host') || PARTY.host; save(); if (q.get('m')) pending = { m: q.get('m'), v: parseInt(q.get('v') || '0', 10) || 0 }; try { history.replaceState(null, '', location.pathname); } catch (e) { } }
// ───────── UI ─────────
const css = document.createElement('style'); css.textContent = `
#ptBtn { position:fixed; left:10px; top:8px; z-index:64; background:linear-gradient(#2f7ad0,#1b4a8a); color:#fff; border:1px solid #4aa8ff; border-radius:8px; padding:5px 10px; font:bold 12px Arial; cursor:pointer; }
#ptBtn.in { background:linear-gradient(#2f8a4a,#1f5f33); border-color:#4dffa0; }
#ptModal { position:fixed; inset:0; z-index:96; background:rgba(5,8,12,.9); display:none; align-items:center; justify-content:center; padding:14px; font-family:Arial,sans-serif; } #ptModal.on { display:flex; }
#ptBox { background:#111820; border:1px solid #3a6a9a; border-radius:14px; padding:18px; max-width:520px; width:100%; color:#e8f0f8; max-height:90vh; overflow:auto; }
#ptBox h1 { margin:0 0 6px; font-size:20px; color:#7ab8ff; letter-spacing:2px; } #ptBox small { color:#8aa0b8; }
#ptBox input { width:100%; box-sizing:border-box; background:#0b1118; border:1px solid #2a4a6a; color:#cfe8ff; border-radius:7px; padding:8px; font-size:13px; margin:6px 0; }
#ptBox .b { background:#1d3a5a; border:1px solid #3a6a9a; color:#cfe8ff; border-radius:7px; padding:7px 12px; cursor:pointer; margin:3px 4px 3px 0; font-size:13px; } #ptBox .b.go { background:linear-gradient(#2f8a4a,#1f5f33); border-color:#4dffa0; font-weight:bold; } #ptBox .b.red { background:#4a1a14; border-color:#8a2a1a; }
#ptBox .mem { display:flex; justify-content:space-between; background:#0b1118; border-radius:7px; padding:6px 10px; margin:4px 0; font-size:13px; }
#ptJoin { position:fixed; left:50%; top:60px; transform:translateX(-50%); z-index:97; background:#0c2038f2; border:2px solid #4aa8ff; border-radius:12px; padding:12px 18px; color:#fff; font:14px Arial; text-align:center; display:none; box-shadow:0 0 30px #000; } #ptJoin button { margin:8px 6px 0; padding:8px 16px; border-radius:8px; border:none; cursor:pointer; font-weight:bold; }
`; document.head.appendChild(css);
const btn = document.createElement('button'); btn.id = 'ptBtn'; btn.textContent = '👥 INVITE'; document.body.appendChild(btn);
const modal = document.createElement('div'); modal.id = 'ptModal'; document.body.appendChild(modal);
const joinBox = document.createElement('div'); joinBox.id = 'ptJoin'; document.body.appendChild(joinBox);
let members = [];
async function roster() {
  if (!PARTY.code) { members = []; return; } try { const r = await fetchWithTimeout(EXGUN_SERVER + '/api/exgun/presence', {}, 4000); if (!r.ok) return; const all = await r.json(); members = all.filter(p => p.name !== currentUser && String(p.mapId).endsWith('~' + PARTY.code)); } catch (e) { }
}
function render() {
  const d = descriptor(), code = PARTY.code, link = linkFor(d), pp = typeof playerPos !== 'undefined' ? playerPos : { x: 0, z: 0 };
  modal.innerHTML = `<div id="ptBox"><h1>👥 PLAY WITH FRIENDS</h1><small>${d ? 'Your invite takes friends to: <b style="color:#ffd24a">' + d.label + '</b>' : 'You are in the menus — friends will join your party and pick a game.'}</small>
   <div style="margin-top:10px"><b>Invite link</b><input id="ptLink" readonly value="${link}"><button class="b go" id="ptCopy">📋 Copy link</button>${navigator.share ? '<button class="b" id="ptShare">📤 Share…</button>' : ''}</div>
   <div style="margin-top:8px"><b>Party code:</b> <span style="font:bold 22px monospace;color:#7dffb0;letter-spacing:4px">${code || '—'}</span> <small>(friends can type it below)</small></div>
   <div style="margin-top:10px"><b>Join a friend's party</b><input id="ptCode" placeholder="Enter a party code" maxlength="8" style="text-transform:uppercase"><button class="b" id="ptJoinBtn">Join party</button></div>
   <h3 style="margin:14px 0 4px;color:#7ab8ff;font-size:14px">IN YOUR PARTY NOW (${members.length})</h3>${members.length ? members.map(m => `<div class="mem"><span>🟦 <b>${String(m.name).replace(/</g, '')}</b> · Lv ${m.level || 1}</span><span style="color:#9fd">${Math.round(Math.hypot((m.x || 0) - pp.x, (m.z || 0) - pp.z))} m · map ${String(m.mapId).split('~')[0]}</span></div>`).join('') : '<small>Nobody else is in a game yet — send the link!</small>'}
   <div style="margin-top:14px;text-align:right">${code ? '<button class="b red" id="ptLeave">Leave party</button>' : ''}<button class="b" id="ptClose">Close</button></div></div>`;
  $('ptCopy').onclick = () => { const i = $('ptLink'); i.select(); try { navigator.clipboard.writeText(i.value); } catch (e) { document.execCommand('copy'); } $('ptCopy').textContent = '✅ Copied!'; };
  if ($('ptShare')) $('ptShare').onclick = () => navigator.share({ title: 'Join my EXGUN game', text: 'Join me in EXGUN' + (d ? ' — ' + d.label : '') + '! Party ' + code, url: link }).catch(() => { });
  $('ptClose').onclick = close; if ($('ptLeave')) $('ptLeave').onclick = () => { PARTY.code = null; save(); members = []; refreshBtn(); render(); };
  $('ptJoinBtn').onclick = () => { const c = ($('ptCode').value || '').trim().toUpperCase(); if (c.length >= 3) { PARTY.code = c; PARTY.host = null; save(); refreshBtn(); roster().then(render); } };
}
function open() { ensureParty(); refreshBtn(); const R = window.RAID; if (document.pointerLockElement) document.exitPointerLock(); if (R && R.on) R.invOpen = true; roster().then(() => { render(); modal.classList.add('on'); }); render(); modal.classList.add('on'); }
function close() { modal.classList.remove('on'); const R = window.RAID; if (R && R.on && R.invOpen && !($('rdInv') && $('rdInv').classList.contains('active'))) { R.invOpen = false; try { if (renderer && !IS_TOUCH) renderer.domElement.requestPointerLock(); } catch (e) { } } }
function refreshBtn() { btn.classList.toggle('in', !!PARTY.code); btn.textContent = PARTY.code ? '👥 PARTY ' + PARTY.code + (members.length ? ' · ' + members.length + ' online' : '') : '👥 INVITE'; }
btn.onclick = open;
document.addEventListener('keydown', e => { if (e.code === 'KeyJ' && !e.repeat && typeof currentUser !== 'undefined' && currentUser && !/INPUT|TEXTAREA/.test((e.target || {}).tagName || '')) { if (modal.classList.contains('on')) close(); else open(); } });
refreshBtn(); setInterval(() => { if (PARTY.code) roster().then(refreshBtn); }, 6000);
// ───────── "Join" banner when you arrive through a link ─────────
const wait = setInterval(() => {
  if (typeof currentUser === 'undefined' || !currentUser || typeof userState === 'undefined' || !userState) return; if (!PARTY.code) { clearInterval(wait); return; } clearInterval(wait); refreshBtn();
  if (!pending) { if (q.get('party')) { joinBox.innerHTML = `👥 You joined party <b style="color:#7dffb0">${PARTY.code}</b>${PARTY.host ? ' (host: ' + String(PARTY.host).replace(/</g, '') + ')' : ''}.<br><small>Pick any game — everyone in the party sees each other in the same mode.</small><br><button style="background:#2f8a4a;color:#fff" id="ptOk">OK</button>`; joinBox.style.display = 'block'; $('ptOk').onclick = () => { joinBox.style.display = 'none'; }; } return; }
  const names = { hardcore: 'Hardcore', endless: 'Endless', nomercy: 'No Mercy', battle: 'Team Battle', raid: 'a raid' };
  joinBox.innerHTML = `👥 <b>${PARTY.host ? String(PARTY.host).replace(/</g, '') : 'A friend'}</b> invited you to <b style="color:#ffd24a">${names[pending.m] || pending.m}</b>${pending.m === 'raid' && typeof mapNameForMap === 'function' ? ' — ' + mapNameForMap(pending.v) : ''}<br><small>Party ${PARTY.code}</small><br><button style="background:#2f8a4a;color:#fff" id="ptYes">▶ Join their game</button><button style="background:#3a3a44;color:#ddd" id="ptNo">Not now</button>`; joinBox.style.display = 'block';
  $('ptYes').onclick = () => { joinBox.style.display = 'none'; const p = pending; pending = null; startDescriptor(p); }; $('ptNo').onclick = () => { joinBox.style.display = 'none'; pending = null; };
}, 1000);
})();
