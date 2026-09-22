// ─── ADMIN CHAT — "make a chat that has commands only for me" ────────────────────────────────
// A real command console, gated TWO real ways, not just a hidden button: isAdmin() (which
// account you're logged in as) AND adminUnlocked (whether the passcode's been entered this
// session). Both are checked again independently inside adminExecute() itself — someone who
// isn't logged in as one of these accounts never even sees the tab, and even a correct account
// can't run a command through the console before typing the passcode, since the check lives at
// the point the command actually runs, not just in the UI that leads there.
const ADMIN_ACCOUNTS = ['cubby explosion', 'gurnaldst'];
const ADMIN_PASSCODE = '12321';
// Real bug found live: this used to be an exact ADMIN_ACCOUNTS.includes(currentUser) check, but
// account names elsewhere in this game are never case-normalized (createAccount()'s own "that name
// is taken" check is exact-match too, game-core.js) — so the REAL account (stored as "Cubby
// Explosion", capitalized) silently never matched the lowercase 'cubby explosion' entry here and
// quietly lost admin. Comparing case-insensitively (and trimmed) is the real fix, not just adding
// one more exact string to the list — it survives however the name happens to be typed/stored from
// here on, the same way a login should already behave.
function isAdmin() {
  if (!currentUser) return false;
  const me = currentUser.trim().toLowerCase();
  return ADMIN_ACCOUNTS.some(a => a.toLowerCase() === me);
}

let adminUnlocked = false;           // real passcode gate — resets to false on every reload/fresh login, on purpose
let adminGodMode = false;            // /godmode — checked in damagePlayer() (game-social.js)
let adminFlying  = false;            // /fly — checked in tryCityJump()/the gravity tick (game-controls.js)
let adminTimeOffsetSeconds = 0;      // /time day|night — checked in getDayNightBrightness() (game-zones.js)

// THE OFFICE — user's own ask: a personal HQ ("but they work for me") where staff can get you
// "anything u can want." Same isAdmin() gate as the Super Tank/Jet/Motorcycle (game-vehicles.js) —
// real for the account it's built for, since this is exactly the same category of admin-only
// convenience the console's /godmode and /fly commands already are, just with a real front door
// and real staff instead of typed commands. Everyone else gets the honest locked message.
const OFFICE_PRESETS = [10000, 1000000, 100000000];
function openOfficeRequest() {
  if (!isAdmin()) { showNotif('🔒 The Mansion is staff-only.'); return; }
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('neighborModalTitle').textContent = '🏠 The Mansion';
  const presetBtn = (currency, amt) => `<button onclick="officeGive('${currency}',${amt})" style="flex:1;padding:8px;border-radius:6px;border:none;cursor:pointer;font-weight:bold;color:#111;background:${currency==='sip'?'#7CFC00':'#66ccff'};font-size:11px;">+${amt.toLocaleString()} ${currency==='sip'?'S.I.P.':'💎'}</button>`;
  document.getElementById('neighborModalBody').innerHTML = `
    <div style="color:#ccc;font-size:12px;margin-bottom:12px;">Your staff can get you anything. Just ask.</div>
    <div style="display:flex;gap:6px;margin-bottom:6px;">${OFFICE_PRESETS.map(a=>presetBtn('sip',a)).join('')}</div>
    <div style="display:flex;gap:6px;margin-bottom:14px;">${OFFICE_PRESETS.map(a=>presetBtn('elite',a)).join('')}</div>
    <div style="color:#999;font-size:11px;margin-bottom:6px;">Or ask for a custom amount:</div>
    <div style="display:flex;gap:6px;">
      <select id="officeCurrency" style="padding:8px;border-radius:6px;border:1px solid #555;background:#0a0a1a;color:#fff;font-size:12px;">
        <option value="sip">S.I.P.</option>
        <option value="elite">💎 Elite</option>
      </select>
      <input id="officeAmount" type="text" inputmode="numeric" maxlength="500" oninput="this.value=this.value.replace(/[^0-9eE+.]/g,'')" placeholder="Amount, or 9e98" style="flex:1;padding:8px;border-radius:6px;border:1px solid #555;background:#0a0a1a;color:#fff;font-size:12px;">
      <button onclick="officeGiveCustom()" style="padding:8px 14px;border-radius:6px;border:none;cursor:pointer;font-weight:bold;color:#111;background:#FFD700;">Get it</button>
    </div>
    <div style="color:#666;font-size:10px;margin-top:6px;">Plain digits (up to 500 of them) or scientific notation like 9e98. Anything bigger than a real number can hold gets capped instead of breaking your account.</div>
  `;
  document.getElementById('neighborModal').style.display = 'flex';
}
function officeGive(currency, amount, capped) {
  if (!isAdmin()) return;
  if (currency === 'sip') { sipDollars += amount; updateSIP(); }
  else { eliteCoins += amount; updateElite(); }
  saveCurrentUser();
  showNotif(capped
    ? `🏢 That's bigger than any real number can hold — capped at the biggest real amount instead: +${amount.toLocaleString()} ${currency==='sip'?'S.I.P.':'💎'}!`
    : `🏢 Your staff delivers +${amount.toLocaleString()} ${currency==='sip'?'S.I.P.':'💎'}!`);
  openOfficeRequest();
}
// User's own ask: "do the max js can do" — Number.MAX_VALUE itself, the largest finite value a
// real JS number can ever hold (~1.7976931348623157e+308). Nothing bigger than this can exist as
// a real number in this game without becoming Infinity, so this really is the true ceiling.
const OFFICE_MAX_GRANT = Number.MAX_VALUE;
function officeGiveCustom() {
  if (!isAdmin()) return;
  const currency = document.getElementById('officeCurrency').value;
  const raw = document.getElementById('officeAmount').value.trim();
  if (!raw) { showNotif('Type a real amount first.'); return; }
  // Real bug found live (user's own test: "9e+98" silently became 998) — the old digit-only
  // filter stripped the e/+ before Number() ever saw them, mangling valid scientific notation
  // into a totally different, much smaller number instead of rejecting or honoring it. Both a
  // plain digit string AND real scientific notation (9e98, 1.5e50, etc.) are checked on their own
  // terms now, instead of blindly stripping to digits first.
  const isPlainDigits = /^\d+$/.test(raw);
  const isSciNotation = /^\d+(\.\d+)?e[+-]?\d+$/i.test(raw);
  if (!isPlainDigits && !isSciNotation) { showNotif('❌ Numbers only — digits, or scientific notation like 9e98.'); return; }
  if (isPlainDigits && raw.length > 500) { showNotif('❌ Max 500 digits.'); return; }
  // A real JS number physically can't hold more than ~309 digits before becoming Infinity — and
  // once sipDollars/eliteCoins IS Infinity, every % / comparison / save touching it downstream
  // turns into NaN, for good (that's a real corrupted-account bug, not a display quirk). On top of
  // that hard floor, OFFICE_MAX_GRANT above is now the user's own explicit, smaller ceiling —
  // whichever bound actually applies, real feedback either way, not a silent failure.
  let amount = Number(raw);
  const capped = !isFinite(amount) || amount > OFFICE_MAX_GRANT;
  if (capped) amount = OFFICE_MAX_GRANT;
  officeGive(currency, amount, capped);
}

function refreshAdminTabVisibility() {
  const tab = document.getElementById('adminChatTab');
  if (tab) tab.style.display = isAdmin() ? 'block' : 'none';
  adminUnlocked = false; // a fresh login always starts locked again, even switching between your own 2 accounts
}

function toggleAdminChat() {
  if (!isAdmin()) return; // real gate, not just a hidden button
  const panel = document.getElementById('adminChatPanel');
  if (panel.style.display === 'none') {
    if (document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    panel.style.display = 'flex';
    document.getElementById('adminChatTab').style.display = 'none';
    adminShowCorrectView();
  } else {
    closeAdminChat();
  }
}
function adminShowCorrectView() {
  document.getElementById('adminLockView').style.display = adminUnlocked ? 'none' : 'block';
  document.getElementById('adminChatView').style.display = adminUnlocked ? 'block' : 'none';
  if (!adminUnlocked) {
    document.getElementById('adminPasscodeInput').value = '';
    document.getElementById('adminPasscodeError').textContent = '';
  }
}
function adminSubmitPasscode() {
  if (!isAdmin()) return;
  const input = document.getElementById('adminPasscodeInput');
  const val = input.value.trim();
  input.value = '';
  if (val === ADMIN_PASSCODE) {
    adminUnlocked = true;
    adminShowCorrectView();
  } else {
    document.getElementById('adminPasscodeError').textContent = '❌ Wrong passcode.';
  }
}
function closeAdminChat() {
  document.getElementById('adminChatPanel').style.display = 'none';
  document.getElementById('adminChatTab').style.display = 'block';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
// Real bug found live: "i can't close my admin tab when i do long commands" — a long command
// with no spaces (e.g. one big run-together word) never wrapped, so it stretched this div wider
// than the panel, which stretched the panel's own layout wide enough to shove the real Close
// button hundreds of pixels off to the right, past the panel's own overflow:hidden edge — not
// just hard to see, genuinely unreachable. word-break/overflow-wrap force it to wrap instead of
// pushing the container wider, and max-width:100% is a second real backstop even if a browser's
// wrap behavior ever let a single token through anyway.
function adminAddMsg(text, kind) {
  const box = document.getElementById('adminChatMessages');
  const div = document.createElement('div');
  div.style.cssText = (kind === 'you'
    ? 'background:rgba(255,255,255,0.07);border-radius:6px;padding:6px 8px;font-size:11px;color:#ccc;text-align:right;margin-bottom:6px;'
    : kind === 'error'
      ? 'background:rgba(255,80,80,0.14);border-radius:6px;padding:6px 8px;font-size:11px;color:#ff8888;margin-bottom:6px;'
      : kind === 'devtalk'
        ? 'background:rgba(204,136,255,0.14);border-radius:6px;padding:6px 8px;font-size:11px;color:#cc88ff;margin-bottom:6px;'
        : 'background:rgba(0,255,136,0.1);border-radius:6px;padding:6px 8px;font-size:11px;color:#00ff88;margin-bottom:6px;')
    + 'max-width:100%;word-break:break-word;overflow-wrap:break-word;';
  div.textContent = text; // textContent, never innerHTML — this echoes back whatever was typed
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

const ADMIN_TP_EXTRA = [
  { label: 'Church', x: -40, z: 20 },
  { label: 'Sunset Plains', x: LAND_CENTER.x, z: LAND_CENTER.z },
];
const ADMIN_HELP = '/give <amount> sip|wood|elite — /give <weapon name> — /heal — /tp <place> — /spawn robot — /spawn demon — /clear robots — /godmode — /fly — /time day|night — /event god|satan — /level <n>|infinity|reset — /help';

function adminRunCommand() {
  if (!isAdmin()) return;
  const input = document.getElementById('adminChatInput');
  const raw = input.value.trim();
  if (!raw) return;
  input.value = '';
  adminAddMsg('> ' + raw, 'you');
  const result = adminExecute(raw);
  adminAddMsg(result, result.startsWith('❌') ? 'error' : 'sys');
}

// Pure-ish dispatcher: parses `raw`, performs the real effect, and returns the message to show.
// Kept separate from adminRunCommand() (which only touches the DOM) so this half is easy to
// call directly (and test directly) without needing the chat panel open at all.
function adminExecute(raw) {
  if (!isAdmin()) return '❌ Not authorized.';
  if (!adminUnlocked) return '🔒 Locked — enter the passcode first.';
  const text = raw.startsWith('/') ? raw.slice(1) : raw;
  const parts = text.trim().split(/\s+/);
  const cmd = (parts[0] || '').toLowerCase();

  if (cmd === 'help' || cmd === '') return ADMIN_HELP;

  if (cmd === 'give') {
    const amount = parseInt(parts[1], 10);
    const kind = (parts[2] || '').toLowerCase();
    if (Number.isFinite(amount) && amount > 0 && ['sip', 'wood', 'elite'].includes(kind)) {
      if (kind === 'sip') { sipDollars += amount; updateSIP(); }
      else if (kind === 'wood') { woodCount += amount; updateWood(); }
      else { eliteCoins += amount; updateElite(); }
      saveCurrentUser();
      const unit = kind === 'sip' ? 'S.I.P.' : kind === 'wood' ? '🪵 wood' : '💎 Elite Coins';
      return `✅ Gave you ${amount.toLocaleString()} ${unit}`; // no trailing period — S.I.P. already ends in one
    }
    const weaponQuery = parts.slice(1).join(' ').toLowerCase();
    const weapon = weaponQuery && WEAPONS.find(w => w.id.toLowerCase() === weaponQuery || w.name.toLowerCase().includes(weaponQuery));
    if (weapon) {
      if (!ownedWeapons.includes(weapon.id)) ownedWeapons.push(weapon.id);
      equipWeapon(weapon.id);
      saveCurrentUser();
      return `✅ Gave and equipped ${weapon.name}.`;
    }
    return '❌ Try: /give 1000 sip, /give 50 wood, /give 10 elite, or /give <weapon name>.';
  }

  if (cmd === 'heal') {
    playerHealth = playerMaxHealth;
    updateHealthBar();
    return '✅ Fully healed.';
  }

  if (cmd === 'tp') {
    const query = parts.slice(1).join(' ').toLowerCase();
    // A couple of real spots missing from SAI_LOCATIONS (Church/Sunset Plains were added after
    // that list was last touched) — kept as a SEPARATE small list rather than added into
    // SAI_LOCATIONS itself, since that array also feeds the shopper NPC wander pool (see its
    // own comment) and Sunset Plains is far enough from downtown to send a shopper on an odd trek.
    const spot = query && [ADMIN_TP_EXTRA, SAI_LOCATIONS, SAI_WORLD_MARKERS].flat().find(l => l.label.toLowerCase().includes(query));
    if (!spot) return '❌ Try: /tp church, /tp sunset plains, /tp japan...';
    playerGroup.position.set(spot.x, 0, spot.z);
    jumpVel = 0; onGround = true;
    return `✅ Teleported to ${spot.label}.`;
  }

  if (cmd === 'spawn' && (parts[1] || '').toLowerCase() === 'robot') {
    const name = adminSpawnRobotNearPlayer();
    return `✅ Spawned a ${name} nearby.`;
  }

  // Test hook for the Satan-storyline demons (game-land.js) — spawns one already revealed right
  // next to the player, bypassing the real satanReignActive/outdoors gate tickKillers() enforces, so
  // this doesn't need a real Satan-wins roll to test.
  if (cmd === 'spawn' && (parts[1] || '').toLowerCase() === 'demon') {
    const name = adminSpawnDemonNearPlayer();
    return `✅ Spawned ${name} nearby.`;
  }

  if (cmd === 'clear' && (parts[1] || '').toLowerCase() === 'robots') {
    const alive = robots.filter(r => r.alive);
    alive.forEach(r => {
      r.alive = false;
      scene.remove(r.mesh);
      if (r.col) { const ci = CITY_COLS.indexOf(r.col); if (ci > -1) CITY_COLS.splice(ci, 1); }
      const zi = CITY_ZONES.indexOf(r.zone); if (zi > -1) CITY_ZONES.splice(zi, 1);
    });
    robots = robots.filter(r => r.alive);
    return `✅ Cleared ${alive.length} robot${alive.length === 1 ? '' : 's'}.`;
  }

  if (cmd === 'godmode') {
    adminGodMode = !adminGodMode;
    return `✅ God mode ${adminGodMode ? 'ON — you take no damage' : 'OFF'}.`;
  }

  if (cmd === 'fly') {
    adminFlying = !adminFlying;
    if (adminFlying) onGround = false;
    return `✅ Fly mode ${adminFlying ? 'ON — press Space to rise' : 'OFF'}.`;
  }

  if (cmd === 'time') {
    const target = (parts[1] || '').toLowerCase();
    if (target !== 'day' && target !== 'night') return '❌ Try: /time day or /time night.';
    const zone = currentTimeZoneCountry();
    const offsetDayFrac = zone ? COUNTRY_TIME_ZONE_HOURS[zone] / 24 : 0;
    const desiredFrac = target === 'day' ? 0.5 : 0;
    adminTimeOffsetSeconds = DAY_LENGTH * (desiredFrac - offsetDayFrac) - playTimeSeconds;
    return `✅ Time set to ${target}.`;
  }

  if (cmd === 'event') {
    const target = (parts[1] || '').toLowerCase();
    if (target !== 'god' && target !== 'satan') return '❌ Try: /event god or /event satan.';
    startDivineClash(target);
    return `✅ Triggered the ${target === 'god' ? 'God' : 'Satan'} clash.`;
  }

  // Sets Robot Level directly instead of grinding levelUpElite() one Elite-Coin-costly level at a
  // time — mainly for reaching `infinity`, which the normal level-up flow can never actually land
  // on (eliteThresholdForLevel() itself overflows to a real Infinity cost around level ~1750,
  // capping how far grinding alone can ever go — see the comments there and on levelUpEliteMax(),
  // game-customization.js). Heaven's periodic invite (maybeShowHeavenInvite(), game-world.js) only
  // fires at Robot Level Infinity — this is the real, intended way to actually reach that state,
  // not a decorative flag with no way in.
  if (cmd === 'level') {
    const arg = (parts[1] || '').toLowerCase();
    let newLevel;
    if (arg === 'infinity' || arg === 'inf' || arg === 'max') newLevel = Infinity;
    else if (arg === 'reset' || arg === '0') newLevel = 0;
    else { newLevel = parseInt(parts[1], 10); if (!Number.isFinite(newLevel) || newLevel < 0) return '❌ Try: /level <number>, /level infinity, or /level reset.'; }
    eliteLevel = newLevel;
    updateElite();
    // Same real HP-bump-not-just-a-cap-raise treatment levelUpElite() gives a normal level-up — via
    // the shared helper (game-customization.js), which is what actually guards against the
    // Infinity-to-finite jump this command can do (unlike normal leveling, which only ever moves by
    // 1 and never touches Infinity) silently corrupting current HP to NaN.
    applyPlayerMaxHealthChange();
    saveCurrentUser();
    renderQuestsPanel();
    return newLevel === Infinity
      ? '✅ Robot Level set to ∞. Heaven may call soon — the invite check runs every 5 minutes.'
      : `✅ Robot Level set to ${eliteLevel.toLocaleString()}.`;
  }

  return `❌ Unknown command "${cmd}". Type /help for the list.`;
}
