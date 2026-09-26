// ─── BANK ────────────────────────────────────────────────────────────────────
const BANK_PASSCODE = 'cubbyexplotionisthebest';

function openBankPasscode() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('bankPcInput').value = '';
  document.getElementById('bankPcError').textContent = '';
  document.getElementById('bankPasscodeModal').style.display = 'flex';
  setTimeout(() => document.getElementById('bankPcInput').focus(), 50);
}
function submitBankPasscode() {
  const entered = document.getElementById('bankPcInput').value;
  if(entered === BANK_PASSCODE) {
    document.getElementById('bankPasscodeModal').style.display = 'none';
    openBank();
  } else {
    document.getElementById('bankPcError').textContent = 'Wrong passcode! Access denied.';
    document.getElementById('bankPcInput').value = '';
    document.getElementById('bankPcInput').focus();
  }
}
// Skips the shared City Bank passcode entirely and goes straight to the player's
// OWN account — the existing Safe feature (its own balance, its own combo the
// player sets themselves, nothing to do with the shared BANK_PASSCODE).
function openMyOwnAccount() {
  document.getElementById('bankPasscodeModal').style.display = 'none';
  openSafeModal();
}
function cancelBankPasscode() {
  document.getElementById('bankPasscodeModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ─── SAFE ────────────────────────────────────────────────────────────────────
function openSafeModal() {
  const modal = document.getElementById('safeModal');
  modal.style.display = 'flex';
  document.getElementById('safeSetView').style.display   = safeCombo ? 'none'  : 'block';
  document.getElementById('safeEnterView').style.display = safeCombo ? 'block' : 'none';
  document.getElementById('safeOpenView').style.display  = 'none';
  if(!safeCombo) {
    document.getElementById('safeNewCombo').value     = '';
    document.getElementById('safeConfirmCombo').value = '';
    document.getElementById('safeSetErr').textContent  = '';
    setTimeout(() => document.getElementById('safeNewCombo').focus(), 50);
  } else {
    document.getElementById('safeComboInput').value    = '';
    document.getElementById('safeEnterErr').textContent = '';
    setTimeout(() => document.getElementById('safeComboInput').focus(), 50);
  }
}

function setSafeCombo() {
  const c1  = document.getElementById('safeNewCombo').value;
  const c2  = document.getElementById('safeConfirmCombo').value;
  const err = document.getElementById('safeSetErr');
  if(!c1)      { err.textContent = 'Enter a combo!';          return; }
  if(c1 !== c2){ err.textContent = "Combos don't match!";    return; }
  safeCombo = c1;
  saveCurrentUser();
  document.getElementById('safeSetView').style.display = 'none';
  showSafeOpen();
}

function submitSafeCombo() {
  const entered = document.getElementById('safeComboInput').value;
  if(entered === safeCombo) {
    document.getElementById('safeEnterView').style.display = 'none';
    showSafeOpen();
  } else {
    document.getElementById('safeEnterErr').textContent = 'Wrong combo! Try again.';
    document.getElementById('safeComboInput').value = '';
    document.getElementById('safeComboInput').focus();
  }
}

const MINI_GAME_WEAPONS = [
  { id:'mg_laser_sword',    name:'Laser Sword',    emoji:'⚡' },
  { id:'mg_plasma_blaster', name:'Plasma Blaster', emoji:'🔴' },
  { id:'mg_scatter_blast',  name:'Scatter Blast',  emoji:'💥' },
  { id:'mg_ghost_blade',    name:'Ghost Blade',    emoji:'👻' },
  { id:'mg_flame_sword',    name:'Flame Sword',    emoji:'🔥' },
  { id:'mg_cryo_cannon',    name:'Cryo Cannon',    emoji:'❄️' },
  { id:'mg_seeker_missile', name:'Seeker Missile', emoji:'🚀' },
  { id:'mg_void_arrow',     name:'Void Arrow',     emoji:'🌑' },
  { id:'mg_thunder_staff',  name:'Thunder Staff',  emoji:'🌩️' },
  { id:'mg_titan_fist',     name:'Titan Fist',     emoji:'👊' },
];

function initSafeInventory() {
  safeInventory = {};
  Object.entries(ITEM_INFO).forEach(([name, info]) => {
    safeInventory[info.id] = { name, emoji: info.emoji, qty: 1 };
  });
  MINI_GAME_WEAPONS.forEach(w => {
    safeInventory[w.id] = { name: w.name, emoji: w.emoji, qty: 1 };
  });
}

function refreshSafeItems() {
  const el = document.getElementById('safeItemsList');
  if(!el) return;
  const keys = Object.keys(safeInventory || {});
  if(keys.length === 0) {
    el.innerHTML = '<div style="color:#555;font-size:11px;text-align:center;padding:8px 0;">Safe items empty</div>';
    return;
  }
  el.innerHTML = '<div style="color:#886600;font-size:10px;letter-spacing:1px;margin-bottom:6px;">ITEMS IN SAFE</div>' +
    keys.map(id => {
      const it = safeInventory[id];
      return `<div style="display:flex;align-items:center;gap:8px;background:rgba(255,215,0,0.06);border:1px solid #443300;border-radius:6px;padding:6px 10px;margin-bottom:5px;">
        <span style="font-size:18px;">${it.emoji}</span>
        <span style="flex:1;color:#fff;font-size:12px;">${it.name}</span>
        <button onclick="takeFromSafe('${id}')" style="padding:3px 10px;background:#1a3a1a;border:1px solid #44aa44;border-radius:5px;color:#44ff88;font-size:11px;cursor:pointer;font-weight:bold;">Take</button>
      </div>`;
    }).join('');
}

function takeFromSafe(id) {
  if(!safeInventory || !safeInventory[id]) return;
  const it = safeInventory[id];
  addToInventory(id, it.name, it.emoji);
  delete safeInventory[id];
  saveCurrentUser();
  refreshSafeItems();
  const msg = document.getElementById('safeMsg');
  msg.style.color = '#44ff88';
  msg.textContent = '✅ Took ' + it.emoji + ' ' + it.name + ' into your bag!';
}

function showSafeOpen() {
  if(!safeInventory) initSafeInventory();
  document.getElementById('safeWalletDisplay').textContent = sipDollars.toLocaleString() + ' S.I.P.';
  document.getElementById('safeBalDisplay').textContent    = safeBalance.toLocaleString() + ' S.I.P.';
  document.getElementById('safeAmtInput').value = '';
  document.getElementById('safeMsg').textContent = '';
  document.getElementById('safeOpenView').style.display = 'block';
  refreshSafeItems();
}

function closeSafe() {
  document.getElementById('safeModal').style.display = 'none';
}

function safeDeposit() {
  const amt = parseInt(document.getElementById('safeAmtInput').value);
  const msg = document.getElementById('safeMsg');
  if(!amt || amt <= 0)  { msg.style.color='#ff8888'; msg.textContent='Enter a valid amount!';    return; }
  if(amt > sipDollars)  { msg.style.color='#ff8888'; msg.textContent="You don't have that much!"; return; }
  sipDollars  -= amt;
  safeBalance += amt;
  document.getElementById('sipAmount').textContent         = sipDollars;
  document.getElementById('safeWalletDisplay').textContent = sipDollars.toLocaleString()  + ' S.I.P.';
  document.getElementById('safeBalDisplay').textContent    = safeBalance.toLocaleString() + ' S.I.P.';
  msg.style.color = '#44ff88';
  msg.textContent = '✅ Locked in ' + amt.toLocaleString() + ' S.I.P.!';
  saveCurrentUser();
}

function safeWithdraw() {
  const amt = parseInt(document.getElementById('safeAmtInput').value);
  const msg = document.getElementById('safeMsg');
  if(!amt || amt <= 0)  { msg.style.color='#ff8888'; msg.textContent='Enter a valid amount!';    return; }
  if(amt > safeBalance) { msg.style.color='#ff8888'; msg.textContent='Not enough in the safe!'; return; }
  safeBalance -= amt;
  sipDollars  += amt;
  document.getElementById('sipAmount').textContent         = sipDollars;
  document.getElementById('safeWalletDisplay').textContent = sipDollars.toLocaleString()  + ' S.I.P.';
  document.getElementById('safeBalDisplay').textContent    = safeBalance.toLocaleString() + ' S.I.P.';
  msg.style.color = '#FFD700';
  msg.textContent = '✅ Took out ' + amt.toLocaleString() + ' S.I.P.!';
  saveCurrentUser();
}

// ─── TRASH SAFE — "add a trash safe you set a passcode others can't get it but can put stuff in
// the same trash can so you can put your stuff in". Two halves, deliberately asymmetric: GIVING
// needs no passcode at all (anyone, including you, can put something in — via sendMail() to a
// named account, same real cross-machine delivery the S.I.P./prayer gifts already use), but
// OPENING it to see or take anything back out is passcode-gated exactly like the existing
// per-account Safe above, just a second, separate combo.
function openTrashModal() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('trashModal').style.display = 'flex';
  trashShowGiveView();
}
function closeTrashModal() {
  document.getElementById('trashModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function trashShowGiveView() {
  document.getElementById('trashGiveView').style.display = 'block';
  document.getElementById('trashSafeSetView').style.display = 'none';
  document.getElementById('trashSafeEnterView').style.display = 'none';
  document.getElementById('trashSafeOpenView').style.display = 'none';
  document.getElementById('trashGiveTarget').value = '';
  document.getElementById('trashGiveItem').value = '';
  document.getElementById('trashGiveSip').value = '';
  document.getElementById('trashGiveMsg').textContent = '';
}
function trashShowMySafe() {
  document.getElementById('trashGiveView').style.display = 'none';
  document.getElementById('trashSafeOpenView').style.display = 'none';
  if(!trashSafeCombo) {
    document.getElementById('trashSafeSetView').style.display = 'block';
    document.getElementById('trashSafeEnterView').style.display = 'none';
    document.getElementById('trashSafeNewCombo').value = '';
    document.getElementById('trashSafeConfirmCombo').value = '';
    document.getElementById('trashSafeSetErr').textContent = '';
  } else {
    document.getElementById('trashSafeSetView').style.display = 'none';
    document.getElementById('trashSafeEnterView').style.display = 'block';
    document.getElementById('trashSafeComboInput').value = '';
    document.getElementById('trashSafeEnterErr').textContent = '';
  }
}
function setTrashSafeCombo() {
  const c1 = document.getElementById('trashSafeNewCombo').value;
  const c2 = document.getElementById('trashSafeConfirmCombo').value;
  const err = document.getElementById('trashSafeSetErr');
  if(!c1)       { err.textContent = 'Enter a passcode!';        return; }
  if(c1 !== c2) { err.textContent = "Passcodes don't match!";  return; }
  trashSafeCombo = c1;
  saveCurrentUser();
  document.getElementById('trashSafeSetView').style.display = 'none';
  trashShowSafeOpen();
}
function submitTrashSafeCombo() {
  const entered = document.getElementById('trashSafeComboInput').value;
  if(entered === trashSafeCombo) {
    document.getElementById('trashSafeEnterView').style.display = 'none';
    trashShowSafeOpen();
  } else {
    document.getElementById('trashSafeEnterErr').textContent = 'Wrong passcode! Try again.';
    document.getElementById('trashSafeComboInput').value = '';
  }
}
function trashShowSafeOpen() {
  document.getElementById('trashSafeOpenView').style.display = 'block';
  document.getElementById('trashSafeSipDisplay').textContent = trashSafeSip.toLocaleString() + ' S.I.P.';
  refreshTrashSafeItems();
}
function refreshTrashSafeItems() {
  const el = document.getElementById('trashSafeItemsList');
  if(!el) return;
  const keys = Object.keys(trashSafeItems || {});
  if(keys.length === 0) {
    el.innerHTML = '<div style="color:#555;font-size:11px;text-align:center;padding:8px 0;">Nothing in here yet</div>';
    return;
  }
  el.innerHTML = keys.map(id => {
    const it = trashSafeItems[id];
    return `<div style="display:flex;align-items:center;gap:8px;background:rgba(120,255,120,0.06);border:1px solid #335533;border-radius:6px;padding:6px 10px;margin-bottom:5px;">
      <span style="font-size:18px;">${it.emoji}</span>
      <span style="flex:1;color:#fff;font-size:12px;">${it.name}${it.qty > 1 ? ` x${it.qty}` : ''}</span>
      <button onclick="takeFromTrashSafe('${id}')" style="padding:3px 10px;background:#1a3a1a;border:1px solid #44aa44;border-radius:5px;color:#44ff88;font-size:11px;cursor:pointer;font-weight:bold;">Take</button>
    </div>`;
  }).join('');
}
function takeFromTrashSafe(id) {
  const it = trashSafeItems[id];
  if(!it) return;
  for(let i = 0; i < it.qty; i++) addToInventory(id, it.name, it.emoji);
  delete trashSafeItems[id];
  saveCurrentUser();
  refreshTrashSafeItems();
}
function withdrawTrashSafeSip() {
  if(trashSafeSip <= 0) return;
  sipDollars += trashSafeSip;
  updateSIP();
  trashSafeSip = 0;
  saveCurrentUser();
  trashShowSafeOpen();
}
function depositIntoOwnTrashSafe(id, name, emoji, qty) {
  if(trashSafeItems[id]) trashSafeItems[id].qty += qty; else trashSafeItems[id] = { name, emoji, qty };
  saveCurrentUser();
}
function trashGiveItem() {
  const target = document.getElementById('trashGiveTarget').value.trim() || currentUser;
  const query = document.getElementById('trashGiveItem').value.trim().toLowerCase();
  const msg = document.getElementById('trashGiveMsg');
  if(!query) { msg.style.color = '#ff8888'; msg.textContent = 'Type an item name!'; return; }
  if(target !== currentUser && serverMode !== 'online') { msg.style.color = '#ff8888'; msg.textContent = 'Giving to someone else needs ONLINE mode!'; return; }
  const entry = Object.entries(playerInventory).find(([id, it]) => it.name.toLowerCase().includes(query));
  if(!entry) { msg.style.color = '#ff8888'; msg.textContent = "You don't have that item!"; return; }
  const [id, it] = entry;
  const name = it.name, emoji = it.emoji;
  it.qty--;
  if(it.qty <= 0) delete playerInventory[id];
  saveCurrentUser();
  if(target === currentUser) {
    depositIntoOwnTrashSafe(id, name, emoji, 1);
    msg.style.color = '#44ff88'; msg.textContent = `✅ Put ${emoji} ${name} in your Trash Safe!`;
  } else {
    sendMail(target, 'trash_deposit', { kind: 'item', id, name, emoji, qty: 1 });
    msg.style.color = '#44ff88'; msg.textContent = `✅ Sent ${emoji} ${name} to ${target}'s Trash Safe!`;
  }
  document.getElementById('trashGiveItem').value = '';
}
function trashGiveSip() {
  const target = document.getElementById('trashGiveTarget').value.trim() || currentUser;
  const amt = parseInt(document.getElementById('trashGiveSip').value, 10);
  const msg = document.getElementById('trashGiveMsg');
  if(!Number.isFinite(amt) || amt <= 0) { msg.style.color = '#ff8888'; msg.textContent = 'Enter a valid amount!'; return; }
  if(amt > sipDollars) { msg.style.color = '#ff8888'; msg.textContent = "You don't have that much!"; return; }
  if(target !== currentUser && serverMode !== 'online') { msg.style.color = '#ff8888'; msg.textContent = 'Giving to someone else needs ONLINE mode!'; return; }
  sipDollars -= amt; updateSIP();
  if(target === currentUser) {
    trashSafeSip += amt; saveCurrentUser();
    msg.style.color = '#44ff88'; msg.textContent = `✅ Put ${amt.toLocaleString()} S.I.P. in your Trash Safe!`;
  } else {
    sendMail(target, 'trash_deposit', { kind: 'sip', amount: amt });
    msg.style.color = '#44ff88'; msg.textContent = `✅ Sent ${amt.toLocaleString()} S.I.P. to ${target}'s Trash Safe!`;
  }
  document.getElementById('trashGiveSip').value = '';
}

function openBank() {
  document.getElementById('bankWalletDisplay').textContent = sipDollars.toLocaleString() + ' S.I.P.';
  document.getElementById('bankBalDisplay').textContent = bankBalance.toLocaleString() + ' S.I.P.';
  document.getElementById('bankAmtInput').value = '';
  document.getElementById('bankEliteWalletDisplay').textContent = Math.floor(eliteCoins).toLocaleString() + ' 💎';
  document.getElementById('bankEliteBalDisplay').textContent = formatBigNum(bankEliteBalance) + ' 💎';
  document.getElementById('bankEliteAmtInput').value = '';
  // Cash/ATM feature — display-only here (an ATM is where you actually move money between this
  // and sipDollars); still worth showing while you're at the Bank so you can see your full real
  // financial picture in one place, same reason the Diamond Wallet sits in this same overlay.
  const bcd = document.getElementById('bankCashDisplay');
  if (bcd) bcd.textContent = '$' + Math.floor(cash).toLocaleString();
  document.getElementById('bankMsg').textContent = '';
  document.getElementById('bankOverlay').style.display = 'flex';
}
function closeBank() {
  document.getElementById('bankOverlay').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ─── STOCK MARKET — real shared prices, same for every online player ────────
const STOCK_DEFS = [
  { symbol:'CUBY', name:'Cubby Corp',        emoji:'🏢' },
  { symbol:'EXPL', name:'Explox Industries', emoji:'🏭' },
  { symbol:'ROBO', name:'RoboWorks',         emoji:'🤖' },
  { symbol:'SNAK', name:'Snack Co',          emoji:'🍿' },
  { symbol:'CARZ', name:'CarZone',           emoji:'🚗' },
  { symbol:'GAME', name:'GameSphere',        emoji:'🎮' },
];
let stockPrices = {}; // symbol -> price, synced from the server - same for everyone online
let myStocks = {};    // symbol -> shares owned, personal, persisted like everything else
let _lastStockSync = -999;
const STOCK_SYNC_INTERVAL = 5;
async function syncStocks() {
  if(serverMode !== 'online') return;
  try {
    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/stocks', {}, 4000);
    if(r.ok) { stockPrices = await r.json(); refreshStockMarketUI(); }
  } catch(e) { /* next sync will catch up */ }
}

// TRADING CENTER — the building's real door action (buildCity()'s TRADING CENTER block,
// game-buildings.js / CITY_ZONES, game-zones.js). Reuses the exact same Stock Market modal and
// state as the Bank's own menu button — buying/selling shares works identically either way.
function openTradingCenter() {
  showNotif('📈 Welcome to the Trading Center!');
  openStockMarket();
}
function openStockMarket() {
  document.getElementById('stockMarketModal').style.display = 'flex';
  refreshStockMarketUI();
}
function closeStockMarket() {
  document.getElementById('stockMarketModal').style.display = 'none';
}
function refreshStockMarketUI() {
  const list = document.getElementById('stockMarketList');
  if(!list || document.getElementById('stockMarketModal').style.display === 'none') return;
  if(serverMode !== 'online') {
    list.innerHTML = '<div style="color:#888;text-align:center;padding:20px;font-size:12px;">📡 The Stock Market needs you to be ONLINE.<br>Go back to the account screen and click ONLINE first.</div>';
    return;
  }
  if(Object.keys(stockPrices).length === 0) {
    list.innerHTML = '<div style="color:#888;text-align:center;padding:20px;font-size:12px;">Loading real-time prices...</div>';
    return;
  }
  list.innerHTML = STOCK_DEFS.map(def => {
    const price = stockPrices[def.symbol] || 0;
    const owned = myStocks[def.symbol] || 0;
    return `<div class="shopItem">
      <div class="siName">${def.emoji} ${def.name} <span style="color:#888;">(${def.symbol})</span></div>
      <div class="siCost">💰 ${price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} S.I.P./share${owned ? ` — you own ${owned}` : ''}</div>
      <div style="display:flex;gap:6px;">
        <button class="shopBtn" onclick="buyStockShares('${def.symbol}')">Buy 1</button>
        ${owned > 0 ? `<button class="shopBtn" onclick="sellStockShares('${def.symbol}')" style="background:#4a1a1a;">Sell 1</button>` : ''}
      </div>
    </div>`;
  }).join('');
}
// Every real S.I.P. payment anywhere in the game (shops, add-ons, bills, land, cars, food,
// clothes, everything) now also deposits that same amount straight into the real Bank balance
// — spending doesn't just vanish, it moves into savings, same as the handful of purchases
// (movie tickets etc.) that already did this by hand before. One shared choke point instead of
// duplicating "sipDollars -= X; bankBalance += X;" at every single spend site in the file.
function spendSip(amount) { sipDollars -= amount; bankBalance += amount; }
function buyStockShares(symbol) {
  const price = stockPrices[symbol];
  if(!price) { showNotif('❌ Price not available yet — try again in a moment.'); return; }
  if(sipDollars < price) { sfx.nope(); showNotif('❌ Not enough S.I.P.!'); return; }
  spendSip(price);
  myStocks[symbol] = (myStocks[symbol] || 0) + 1;
  updateSIP();
  sfx.buy();
  refreshStockMarketUI();
  saveCurrentUser();
}
function sellStockShares(symbol) {
  const owned = myStocks[symbol] || 0;
  if(owned <= 0) return;
  const price = stockPrices[symbol] || 0;
  queueEarning(price, 0, 'Stock Sale');
  myStocks[symbol] = owned - 1;
  if(myStocks[symbol] <= 0) delete myStocks[symbol];
  updateSIP();
  sfx.coin();
  refreshStockMarketUI();
  saveCurrentUser();
}

// Bank interval started in startGame() so it doesn't fire during login/customization
function bankDeposit() {
  const amt = parseInt(document.getElementById('bankAmtInput').value);
  const msg = document.getElementById('bankMsg');
  if(!amt || amt <= 0) { msg.style.color='#ff8888'; msg.textContent='Enter a valid amount!'; return; }
  if(amt > sipDollars) { sfx.nope(); msg.style.color='#ff8888'; msg.textContent="You don't have that much!"; return; }
  spendSip(amt);
  bankBalance += amt;
  document.getElementById('sipAmount').textContent = sipDollars;
  document.getElementById('bankWalletDisplay').textContent = sipDollars.toLocaleString() + ' S.I.P.';
  document.getElementById('bankBalDisplay').textContent = bankBalance.toLocaleString() + ' S.I.P.';
  sfx.bank();
  msg.style.color = '#44ff88';
  msg.textContent = '✅ Deposited ' + amt.toLocaleString() + ' S.I.P.!';
  saveCurrentUser();
}
function bankWithdraw() {
  const amt = parseInt(document.getElementById('bankAmtInput').value);
  const msg = document.getElementById('bankMsg');
  if(!amt || amt <= 0) { msg.style.color='#ff8888'; msg.textContent='Enter a valid amount!'; return; }
  if(amt > bankBalance) { sfx.nope(); msg.style.color='#ff8888'; msg.textContent='Not enough in your bank!'; return; }
  bankBalance -= amt;
  sipDollars += amt;
  document.getElementById('sipAmount').textContent = sipDollars;
  document.getElementById('bankWalletDisplay').textContent = sipDollars.toLocaleString() + ' S.I.P.';
  document.getElementById('bankBalDisplay').textContent = bankBalance.toLocaleString() + ' S.I.P.';
  sfx.coin();
  msg.style.color = '#FFD700';
  msg.textContent = '✅ Withdrew ' + amt.toLocaleString() + ' S.I.P.!';
  saveCurrentUser();
}
// Same shape as bankDeposit/bankWithdraw above, just for Elite Coins against the new
// bankEliteBalance (see its declaration for why that starts absurdly high instead of at 0).
function bankEliteDeposit() {
  const amt = parseInt(document.getElementById('bankEliteAmtInput').value);
  const msg = document.getElementById('bankMsg');
  if(!amt || amt <= 0) { msg.style.color='#ff8888'; msg.textContent='Enter a valid amount!'; return; }
  if(amt > eliteCoins) { sfx.nope(); msg.style.color='#ff8888'; msg.textContent="You don't have that many 💎!"; return; }
  eliteCoins -= amt;
  bankEliteBalance += amt;
  updateElite();
  document.getElementById('bankEliteWalletDisplay').textContent = Math.floor(eliteCoins).toLocaleString() + ' 💎';
  document.getElementById('bankEliteBalDisplay').textContent = formatBigNum(bankEliteBalance) + ' 💎';
  sfx.bank();
  msg.style.color = '#66ccff';
  msg.textContent = '✅ Deposited ' + amt.toLocaleString() + ' 💎!';
  saveCurrentUser();
}
function bankEliteWithdraw() {
  const amt = parseInt(document.getElementById('bankEliteAmtInput').value);
  const msg = document.getElementById('bankMsg');
  if(!amt || amt <= 0) { msg.style.color='#ff8888'; msg.textContent='Enter a valid amount!'; return; }
  if(amt > bankEliteBalance) { sfx.nope(); msg.style.color='#ff8888'; msg.textContent='Not enough in the vault!'; return; }
  bankEliteBalance -= amt;
  eliteCoins += amt;
  updateElite();
  document.getElementById('bankEliteWalletDisplay').textContent = Math.floor(eliteCoins).toLocaleString() + ' 💎';
  document.getElementById('bankEliteBalDisplay').textContent = formatBigNum(bankEliteBalance) + ' 💎';
  sfx.coin();
  msg.style.color = '#FFD700';
  msg.textContent = '✅ Withdrew ' + amt.toLocaleString() + ' 💎!';
  saveCurrentUser();
}

// ─── ATMs — small standalone cash kiosks around the city (see buildATM(), game-zones.js, and its
// CITY_ZONES.push() call sites in buildCity(), game-buildings.js). Same real amount-input/
// validate/settle shape as bankDeposit()/bankWithdraw() above, just moving money between
// sipDollars and the new carried `cash` instead of between sipDollars and bankBalance — and
// deliberately NOT routed through spendSip() (game-customization.js): spendSip's whole job is
// "every S.I.P. spend also deposits the same amount into the Bank," which is exactly backwards
// for a withdrawal (it would leave the player with both the withdrawn cash AND a phantom deposit
// of the same amount sitting in bankBalance — free money out of nowhere). Direct sipDollars/cash
// manipulation here matches bankWithdraw()'s own style above, which has the same "moving OUT of
// the safe balance" shape and also skips spendSip() for the same reason.
function openATM() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('atmAmtInput').value = '';
  document.getElementById('atmMsg').textContent = '';
  refreshATMDisplay();
  document.getElementById('atmModal').style.display = 'flex';
}
function refreshATMDisplay() {
  document.getElementById('atmSipDisplay').textContent = sipDollars.toLocaleString() + ' S.I.P.';
  document.getElementById('atmCashDisplay').textContent = '$' + Math.floor(cash).toLocaleString();
}
function closeATM() {
  document.getElementById('atmModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function atmWithdraw() {
  const amt = parseInt(document.getElementById('atmAmtInput').value);
  const msg = document.getElementById('atmMsg');
  if(!amt || amt <= 0) { msg.style.color='#ff8888'; msg.textContent='Enter a valid amount!'; return; }
  if(amt > sipDollars) { sfx.nope(); msg.style.color='#ff8888'; msg.textContent="You don't have that much S.I.P.!"; return; }
  sipDollars -= amt;
  cash += amt;
  updateSIP();
  updateCash();
  refreshATMDisplay();
  sfx.coin();
  msg.style.color = '#FFD700';
  msg.textContent = '✅ Withdrew $' + amt.toLocaleString() + ' cash!';
  saveCurrentUser();
}
function atmDeposit() {
  const amt = parseInt(document.getElementById('atmAmtInput').value);
  const msg = document.getElementById('atmMsg');
  if(!amt || amt <= 0) { msg.style.color='#ff8888'; msg.textContent='Enter a valid amount!'; return; }
  if(amt > cash) { sfx.nope(); msg.style.color='#ff8888'; msg.textContent="You don't have that much cash!"; return; }
  cash -= amt;
  sipDollars += amt;
  updateCash();
  updateSIP();
  refreshATMDisplay();
  sfx.bank();
  msg.style.color = '#44ff88';
  msg.textContent = '✅ Deposited $' + amt.toLocaleString() + ' to S.I.P.!';
  saveCurrentUser();
}

function backToLogin() {
  if(shopSalesTimer){ clearInterval(shopSalesTimer); shopSalesTimer=null; } // don't let a staffed shop's timer outlive the logged-in account
  shopOpen = false;
  saveCurrentUser();
  currentUser = null;
  clearRemotePlayers();
  clearRemoteKillers();
  clearRemoteBuddies();
  clearRemoteBodyguards();
  document.getElementById('customScreen').style.display = 'none';
  document.getElementById('loginScreen').style.display  = 'flex';
  loadLoginScreen();
}

// ─── PLAYER SETTINGS ─────────────────────────────────────────────────────────
let playerName  = 'Player';
let playerProfilePic = null; // data:image/png URL from the Profile Picture painter, or null = use the procedural badge
let playerShirtPaint = null; // data:image/png URL from the same painter, applied as a real texture on the shirt
let playerColors = { skin:'#f5c89a', shirt:'#2196F3', pants:'#333333', shoes:'#4e3b2a', hair:'#3a1f0a' };
let playerHat   = 'none';
let playerHair  = 'none';
let playerShirt = 'plain';
let playerPants = 'long';
let playerShoes   = 'sneakers';
let playerWeapon  = 'none';
let ownedWeapons  = [];
let ownedEmotes   = []; // variant ids from EMOTE_CATALOG (game-character.js) actually bought with real S.I.P. — only these are playable
let playerSwingStart = -999; // 't' (clock.getElapsedTime()) when the last swing began, read every frame in animate()
let playerSwingPower = 1; // 0-1, how charged the swing currently animating was — read alongside playerSwingStart
let pendingSwingPower = 1; // set right before the charge-release handleInteract() call, consumed once by the next triggerSwing()
const SWING_DURATION = 0.25;
function triggerSwing() { if(clock){ playerSwingStart = clock.getElapsedTime(); playerSwingPower = pendingSwingPower; } }
// Guns get their own real feedback — a visible tracer round (fireWarShot, game-world.js — same
// one war NPCs/the Bank wall already fire) plus the gunshot sound, instead of the melee
// clang/hit noise. Every combat function below routes its swing+sound through here rather than
// calling triggerSwing()+its own sfx directly, so equipping any gun (WEAPON_VISUALS archetype,
// game-shops.js) changes every fight the same way at once instead of needing a per-fight check.
function isGunEquipped() { const v = WEAPON_VISUALS[playerWeapon]; return !!v && v.archetype === 'gun'; }
function swingAndHit(targetX, targetZ, meleeSfxFn) {
  triggerSwing();
  if (isGunEquipped()) {
    fireWarShot(playerGroup.position.x, 1.6, playerGroup.position.z, targetX, targetZ);
    sfx.laser();
  } else if (meleeSfxFn) {
    meleeSfxFn();
  }
}

// Charge-and-release punch: holding E winds the arm back, releasing throws the punch —
// the longer it was held (up to PUNCH_MAX_CHARGE seconds), the harder it lands.
let chargingPunch = false;
let punchChargeStart = -999;
let punchChargeMult = 1; // read once by applyDamageBuffs() for the swing currently firing, then reset to 1
const PUNCH_MAX_CHARGE = 1.0; // seconds held for full power
const PUNCH_MAX_MULT = 2.5;   // damage multiplier at a full charge

// Knockback — a landed hit slides the target away from the player over a short real
// window instead of teleporting it, harder the more charged the punch was
// (playerSwingPower, same 0-1 value the swing arc itself already scales by). Works on
// anything with a settable x/z (NPCs, rogue robots) via a shared ticker so every hit
// site just calls startKnockback() once instead of re-deriving its own easing.
let activeKnockbacks = []; // {setXZ, x, z, vx, vz, life}
const KNOCKBACK_DURATION = 0.28; // seconds
const KNOCKBACK_MIN = 3, KNOCKBACK_MAX = 9; // total distance covered over KNOCKBACK_DURATION, scaled by charge
function startKnockback(fromX, fromZ, curX, curZ, setXZ) {
  const dx = curX - fromX, dz = curZ - fromZ;
  const dist = Math.hypot(dx, dz) || 1;
  const nx = dx / dist, nz = dz / dist;
  const force = (KNOCKBACK_MIN + playerSwingPower * (KNOCKBACK_MAX - KNOCKBACK_MIN)) / KNOCKBACK_DURATION;
  activeKnockbacks.push({ setXZ, x: curX, z: curZ, vx: nx * force, vz: nz * force, life: KNOCKBACK_DURATION });
}
function tickKnockbacks(dt) {
  for (let i = activeKnockbacks.length - 1; i >= 0; i--) {
    const k = activeKnockbacks[i];
    k.life -= dt;
    const ease = Math.max(0, k.life) / KNOCKBACK_DURATION; // eases out as it runs down
    k.x += k.vx * dt * ease; k.z += k.vz * dt * ease;
    k.setXZ(k.x, k.z);
    if (k.life <= 0) activeKnockbacks.splice(i, 1);
  }
}
// The training dummy is a fixed anchor point (its interact zone never moves), so it gets a
// tilt-and-spring bounce instead of sliding away — same charge-scaled feel without drifting
// out of its own hit zone after a few punches.
let dummyKnockStart = -999;
let dummyKnockDirX = 0, dummyKnockDirZ = 1; // horizontal direction the dummy tips away in — away from wherever the player was standing at hit time
const DUMMY_KNOCK_DURATION = 0.3;
function startDummyKnockback() {
  if (!clock) return;
  dummyKnockStart = clock.getElapsedTime();
  const dx = DUMMY.x - playerGroup.position.x, dz = DUMMY.z - playerGroup.position.z;
  const d = Math.hypot(dx, dz) || 1;
  dummyKnockDirX = dx / d; dummyKnockDirZ = dz / d;
}
let playerArmor   = 'none';
let ownedArmor    = [];
let ownedItems    = [];   // customization items bought in the shop
let ownedSkins    = [];   // pre-made skins bought

// ─── BUDDY — a permanent companion you design and paint yourself, never expires/lost ──
const BUDDY_SPECIES = [
  { id:'blob',   name:'Blobby', cost:500,  emoji:'🟢', desc:'A bouncy little blob — the cheapest way to never walk alone.' },
  { id:'cat',    name:'Kitty',  cost:1500, emoji:'🐱', desc:'A loyal cat that trots along at your heels.' },
  { id:'lion',   name:'Cubby',  cost:2000, emoji:'🦁', desc:'A playful baby lion cub — big head, stubby tail, no mane yet.' },
  { id:'dragon', name:'Draco',  cost:3000, emoji:'🐉', desc:'A tiny dragon with real wings and a tail.' },
  { id:'robot',  name:'Bolt',   cost:5000, emoji:'🤖', desc:'A high-tech robot buddy with a blinking antenna.' },
];
let buddyOwned   = false;
let buddySpecies = null;                 // one of BUDDY_SPECIES[].id
let buddyName    = 'Buddy';
let buddyColors  = { body:'#66ddff', accent:'#ffffff', eye:'#111111' };
let buddyGroup   = null;                 // THREE.Group, lives directly in scene (not a playerGroup child) so it can lag behind
let buddyMeshes  = null;                 // { body:[], accent:[], eye:[] } — tagged parts a repaint recolors live

// ─── BODYGUARDS — user's own ask: hire (with Elite Coins, not S.I.P.) real combat companions,
// each independently levelable up to a real cap of 10. Same "lives directly in scene, follows the
// player" convention as Buddy above, and plugs into the exact same landCompanionHit()/
// getCompanionCombatTarget() assist pipeline (game-world.js) tickCompanionAssist() already uses —
// see tickBodyguards() there. Unlike Buddy (one, forever), this is a real roster: hire up to
// BODYGUARD_MAX_COUNT, each its own {id,name,level} — see hireBodyguard()/levelUpBodyguard()/
// buildBodyguards() (game-shops.js).
let bodyguards = []; // [{id, name, level, group}] — group is a live THREE.Group reference, rebuilt fresh by buildBodyguards() every load, never itself persisted (see game-core.js save/load)
let hiredJetPilot = false; // Pro Pilot — a real one-time hire (game-vehicles.js hireJetPilot()), same "pay once, keep forever" shape as Buddy

// ─── ADOPTED CHILD — a real family member who follows you like Buddy, but a small person
// (reuses the box-figure style, not a pet shape) who visibly grows up via GROWTH_STAGES above. ──
const ADOPTABLE_KIDS = [
  { id:'k_riley', name:'Riley', cost:800,  emoji:'👦', skin:'#f5c89a', shirt:'#4fc3f7', hair:'#3a1f0a' },
  { id:'k_sunny', name:'Sunny', cost:800,  emoji:'👧', skin:'#e8b87a', shirt:'#ffb74d', hair:'#1a0a00' },
  { id:'k_max',   name:'Max',   cost:1200, emoji:'🧒', skin:'#c97a50', shirt:'#81c784', hair:'#000000' },
];
// Named familyKid*, NOT child* — the game already has an unrelated `children`/`childMeshes`
// system (married NPCs' baby cribs, see buildChildren() far below) and reusing child* here
// collided with it at parse time (SyntaxError: duplicate declaration).
let familyKidAdopted   = false;          // persisted
let familyKidId        = null;           // persisted — one of ADOPTABLE_KIDS[].id
let familyKidName      = 'Kiddo';        // persisted
let familyKidPlayTime  = 0;              // persisted — own growth clock, starts younger than the player's
let familyKidGroup     = null;           // THREE.Group in scene, same lag-behind-follow pattern as buddyGroup
let familyKidMeshes    = null;           // tagged parts, mirrors buddyMeshes
let familyKidInSchool  = false;          // persisted — enrolled while 'kid'/'teen' stage, grows up a bit faster + earns Smarts
let familyKidSmarts    = 0;              // persisted — accumulated while in school, pays out a S.I.P. bonus on reaching 'adult'
let familyKidLastStageId = 'baby';       // persisted — so a fresh login doesn't re-fire the growth/graduation notif

// ─── SCHOOL EVENTS — user's own ask: "make school events you participate if you have a kid
// that goes to school". Not persisted (short-lived, session state, same as other timed World
// Events/Celebrity-challenge style mechanics) — the clock only runs while a school-age kid is
// actually enrolled, and resets the moment they're pulled out or age past 'teen'.
const SCHOOL_EVENTS = [
  { id:'bakesale',    emoji:'🧁', name:'Bake Sale',    desc:'Help run the table and sell treats to other parents.' },
  { id:'sciencefair', emoji:'🔬', name:'Science Fair', desc:'Help set up their project display before judging.' },
  { id:'fieldday',    emoji:'🏃', name:'Field Day',    desc:'Cheer them on and help referee the games.' },
  { id:'talentshow',  emoji:'🎤', name:'Talent Show',  desc:'Help backstage before they go on.' },
  { id:'bookfair',    emoji:'📚', name:'Book Fair',    desc:'Volunteer at the book fair table.' },
];
const SCHOOL_EVENT_WINDOW_SEC = 60;    // once one starts, this long to actually go participate
const SCHOOL_EVENT_MIN_GAP = 120, SCHOOL_EVENT_MAX_GAP = 240; // real seconds between events
let schoolEventActive = null;   // {def, endsAt} in playTimeSeconds terms, or null
let schoolEventNextAt = null;   // playTimeSeconds value the next event fires at, or null while ineligible
let lastAllowanceAt = -999;              // persisted — playTimeSeconds of the last "Ask for Allowance" from a relative

// ─── BILLS — real recurring expenses for what you own (house, land, cars), paid with a real
// stack of cash-bill denominations instead of an abstract number disappearing. ──────────────
const BILL_CHECK_INTERVAL = 90; // real play-seconds between bill cycles — short enough to see happen
let unpaidBills   = [];  // persisted — [{id, label, amount, dueAt}], dueAt in playTimeSeconds
let lastBillCheck = 0;   // persisted — playTimeSeconds at last bill cycle
let billTimer     = 0;   // NOT persisted — real-time accumulator driving BILL_CHECK_INTERVAL

