// ─── GAME BUILDER — user's own ask: "make something like scratch incase they have no coding
// experience for explox mini games". A real Scratch-style block editor: click blocks together
// (no typing code), multiple sprites, sounds (reuses the existing sfx synth so no new audio),
// backgrounds, variables, and a real generator-based interpreter that actually runs the result
// live on a canvas — not a mockup. Lives entirely in this one file, isolated from game.js: reads
// only sfx/showNotif from it, and saves under its own localStorage key so it can never corrupt or
// depend on the giant existing player-save blob.
//
// DATA MODEL
//   game   = { id, name, background:'#hex' (always kept in sync with the active backdrop's
//              color), backdrops:[{id,name,color}], currentBackdropId, variables:[{name,value}],
//              sprites:[sprite,...] }
//   sprite = { id, name, costume:'emoji' (always kept in sync with costumes[costumeIdx]),
//              costumes:['emoji',...], costumeIdx, x, y, dir, size, visible, scripts:[script,...] }
//   script = { id, trigger:{type:'greenFlag'|'keyPressed'|'msgReceived'|'backdropSwitch'|'cloneStart', ...},
//              blocks:[block,...] }
//   block  = { id, type, fields:{...}, children:[block,...], children2:[block,...] }
//     children/children2 only exist on repeat/forever/ifBlock/ifElse.
//     A field of type 'cond' holds { check, ...operand } — see GB_COND_DEFS.
//   background/backdrops and costume/costumes are both additive on purpose — every existing
//   block/render/interpreter path that already reads .background or .costume keeps working
//   completely unchanged; the list is just new bookkeeping kept in sync alongside it.
// CLONES — runtime-only sprite instances created by the "Create a clone" block. A clone is a
// shallow copy of its source sprite pushed into rt.sprites with a fresh id and a cloneOfId
// pointing back at its real definition in gbGame.sprites (gbDefFor() resolves either kind
// uniformly), so every trigger lookup (keyPressed/msgReceived/backdropSwitch) automatically
// covers clones too without any special-casing at each call site.

const GB_STAGE_W = 480, GB_STAGE_H = 360;

const GB_COSTUMES = ['🐷','🤖','👾','🐱','🐶','🐸','🚀','⭐','💎','🍎','🍌','🔥','❄️','⚽','🚗','👻'];
const GB_SOUNDS = [
  { id:'coin', label:'🪙 Coin' }, { id:'buy', label:'✨ Chime' }, { id:'boom', label:'💥 Boom' },
  { id:'hit', label:'👊 Hit' }, { id:'laser', label:'🔫 Laser' }, { id:'cheer', label:'🎉 Cheer' },
  { id:'honk', label:'📯 Honk' }, { id:'nope', label:'❌ Buzz' }, { id:'alarm', label:'🚨 Alarm' },
];
const GB_KEYS = [
  { id:'ArrowUp', label:'⬆️ Up' }, { id:'ArrowDown', label:'⬇️ Down' },
  { id:'ArrowLeft', label:'⬅️ Left' }, { id:'ArrowRight', label:'➡️ Right' }, { id:'Space', label:'␣ Space' },
];
const GB_COLORS = [
  { id:'#1a2a3a', label:'Night Blue' }, { id:'#4a90d9', label:'Sky Blue' }, { id:'#2a8a4a', label:'Grass Green' },
  { id:'#d9b04a', label:'Sand' }, { id:'#8a2a8a', label:'Purple' }, { id:'#2a2a2a', label:'Space Black' },
  { id:'#e08030', label:'Sunset Orange' }, { id:'#ffffff', label:'Snow White' },
];

// Every block type in one data-driven table — the palette, the script-list renderer, and the
// interpreter all read from this SAME table instead of three separate hand-written lists, so a
// new block only ever needs to be added in exactly one place.
const GB_BLOCK_DEFS = {
  moveSteps:   { cat:'motion', color:'#4a6fd9', label:'Move ▢ steps',              fields:[{k:'steps',t:'num',d:10}] },
  turnCW:      { cat:'motion', color:'#4a6fd9', label:'Turn ↻ ▢ degrees',          fields:[{k:'deg',t:'num',d:15}] },
  turnCCW:     { cat:'motion', color:'#4a6fd9', label:'Turn ↺ ▢ degrees',          fields:[{k:'deg',t:'num',d:15}] },
  pointDir:    { cat:'motion', color:'#4a6fd9', label:'Point in direction ▢ (0=right,90=up)', fields:[{k:'dir',t:'num',d:90}] },
  goToXY:      { cat:'motion', color:'#4a6fd9', label:'Go to x:▢ y:▢',             fields:[{k:'x',t:'num',d:240},{k:'y',t:'num',d:180}] },
  changeX:     { cat:'motion', color:'#4a6fd9', label:'Change x by ▢',             fields:[{k:'dx',t:'num',d:10}] },
  changeY:     { cat:'motion', color:'#4a6fd9', label:'Change y by ▢',             fields:[{k:'dy',t:'num',d:10}] },
  bounceEdge:  { cat:'motion', color:'#4a6fd9', label:'If on edge, bounce',        fields:[] },

  show:        { cat:'looks', color:'#9a4ad9', label:'Show',                       fields:[] },
  hide:        { cat:'looks', color:'#9a4ad9', label:'Hide',                       fields:[] },
  setCostume:  { cat:'looks', color:'#9a4ad9', label:'Switch costume to ▢',        fields:[{k:'costume',t:'ownCostume',d:'🐷'}] },
  nextCostume: { cat:'looks', color:'#9a4ad9', label:'Next costume',               fields:[] },
  say:         { cat:'looks', color:'#9a4ad9', label:'Say ▢ for ▢ seconds',        fields:[{k:'text',t:'text',d:'Hi!'},{k:'secs',t:'num',d:2}] },
  changeSize:  { cat:'looks', color:'#9a4ad9', label:'Change size by ▢ %',         fields:[{k:'amount',t:'num',d:10}] },

  playSound:   { cat:'sound', color:'#2aa07a', label:'Play sound ▢',               fields:[{k:'sound',t:'sound',d:'coin'}] },

  wait:        { cat:'control', color:'#d9962a', label:'Wait ▢ seconds',           fields:[{k:'secs',t:'num',d:1}] },
  repeat:      { cat:'control', color:'#d9962a', label:'Repeat ▢ times',           fields:[{k:'times',t:'num',d:10}], hasChildren:true },
  forever:     { cat:'control', color:'#d9962a', label:'Forever',                  fields:[], hasChildren:true },
  ifBlock:     { cat:'control', color:'#d9962a', label:'If ▢',                     fields:[{k:'cond',t:'cond',d:null}], hasChildren:true },
  ifElse:      { cat:'control', color:'#d9962a', label:'If ▢ else',                fields:[{k:'cond',t:'cond',d:null}], hasChildren:true, hasChildren2:true },
  stopScript:  { cat:'control', color:'#d9962a', label:'Stop this script',         fields:[] },
  broadcastMsg:{ cat:'control', color:'#d9962a', label:'Broadcast message ▢',      fields:[{k:'msg',t:'text',d:'go'}] },
  createClone: { cat:'control', color:'#d9962a', label:'Create a clone of ▢',      fields:[{k:'target',t:'cloneTarget',d:'self'}] },
  deleteClone: { cat:'control', color:'#d9962a', label:'Delete this clone',        fields:[] },

  setVar:      { cat:'variables', color:'#d94a6a', label:'Set ▢ to ▢',             fields:[{k:'varName',t:'var',d:''},{k:'value',t:'num',d:0}] },
  changeVar:   { cat:'variables', color:'#d94a6a', label:'Change ▢ by ▢',          fields:[{k:'varName',t:'var',d:''},{k:'amount',t:'num',d:1}] },
  mathOp:      { cat:'variables', color:'#d94a6a', label:'Set ▢ to ▢ ▢ ▢',         fields:[{k:'varName',t:'var',d:''},{k:'a',t:'numvar',d:'0'},{k:'op',t:'mathop',d:'+'},{k:'b',t:'numvar',d:'0'}] },

  setBackground:{ cat:'game', color:'#6a6a6a', label:'Set background to ▢',        fields:[{k:'color',t:'color',d:'#1a2a3a'}] },
  switchBackdrop:{cat:'game', color:'#6a6a6a', label:'Switch backdrop to ▢',       fields:[{k:'backdropId',t:'backdrop',d:''}] },
  winGame:     { cat:'game', color:'#6a6a6a', label:'🏆 Win the game',             fields:[] },
  loseGame:    { cat:'game', color:'#6a6a6a', label:'💀 Lose the game',            fields:[] },
};
const GB_CATEGORIES = [
  { id:'motion', label:'Motion', color:'#4a6fd9' }, { id:'looks', label:'Looks', color:'#9a4ad9' },
  { id:'sound', label:'Sound', color:'#2aa07a' }, { id:'control', label:'Control', color:'#d9962a' },
  { id:'variables', label:'Variables', color:'#d94a6a' }, { id:'game', label:'Game', color:'#6a6a6a' },
];
const GB_COND_DEFS = {
  touchingSprite: { label:'touching ▢ ?',      fields:[{k:'spriteId',t:'sprite',d:''}] },
  touchingEdge:   { label:'touching edge?',     fields:[] },
  keyDown:        { label:'key ▢ pressed?',     fields:[{k:'key',t:'key',d:'Space'}] },
  varCompare:     { label:'▢ ▢ ▢',              fields:[{k:'varName',t:'var',d:''},{k:'op',t:'op',d:'>'},{k:'value',t:'num',d:0}] },
};

// ─── STATE ───────────────────────────────────────────────────────────────────
let gbGames = [];          // this account's saved games — [{id,name,background,variables,sprites}]
let gbGame = null;         // the game currently open in the editor (a real reference into gbGames, or a fresh unsaved one)
let gbSpriteIdx = 0;       // which sprite in gbGame.sprites is selected for editing
let gbSelectedScriptIdx = 0;
let gbRunning = false;
let gbRuntime = null;      // { sprites:[{...sprite copy, ...}], variables:{}, keysDown:Set, startedAt, outcome:null|'win'|'lose' }
let gbFrameHandle = null;
let gbIdSeq = 1;
function gbNextId() { return 'gb' + (gbIdSeq++) + '_' + Math.random().toString(36).slice(2,7); }

function gbStorageKey() {
  const user = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : 'guest';
  return 'explox_gamebuilder_' + user;
}
function gbLoadGames() {
  try { gbGames = JSON.parse(localStorage.getItem(gbStorageKey())) || []; } catch(e) { gbGames = []; }
}
function gbSaveGames() {
  localStorage.setItem(gbStorageKey(), JSON.stringify(gbGames));
}

function gbNewSprite(name) {
  const c = GB_COSTUMES[Math.floor(Math.random()*GB_COSTUMES.length)];
  return { id:gbNextId(), name:name||'Sprite', costume:c, costumes:[c], costumeIdx:0,
    x:GB_STAGE_W/2, y:GB_STAGE_H/2, dir:0, size:100, visible:true,
    scripts:[{ id:gbNextId(), trigger:{type:'greenFlag'}, blocks:[] }] };
}
function gbNewGame(name) {
  const backdrops = [{id:gbNextId(), name:'Backdrop 1', color:'#1a2a3a'}];
  return { id:gbNextId(), name:name||'My Game', background:backdrops[0].color, backdrops, currentBackdropId:backdrops[0].id,
    variables:[{name:'Score',value:0}], sprites:[gbNewSprite('Player')] };
}
// Fills in costumes/backdrops for a game saved before this feature existed, so opening an old
// save never crashes — every OTHER field (background/costume) was already there and untouched.
function gbMigrateGame(g) {
  if (!g.backdrops) { g.backdrops = [{id:gbNextId(), name:'Backdrop 1', color:g.background||'#1a2a3a'}]; g.currentBackdropId = g.backdrops[0].id; }
  g.sprites.forEach(sp => { if (!sp.costumes) { sp.costumes = [sp.costume]; sp.costumeIdx = 0; } });
  return g;
}

// ─── PANEL OPEN/CLOSE ────────────────────────────────────────────────────────
function toggleGameBuilderPanel() {
  const panel = document.getElementById('gbModal');
  if (panel.style.display === 'none') {
    if (document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    gbLoadGames();
    gbRenderGamesList();
    panel.style.display = 'flex';
  } else { closeGameBuilderPanel(); }
}
function closeGameBuilderPanel() {
  gbStop();
  gbCloseModal();
  document.getElementById('gbModal').style.display = 'none';
  document.getElementById('gbEditor').style.display = 'none';
  document.getElementById('gbGamesScreen').style.display = 'block';
  if (typeof renderer !== 'undefined' && renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ─── CUSTOM MODALS ───────────────────────────────────────────────────────────
// Every "name this", "pick one", "are you sure" moment used window.prompt/confirm/alert
// here — the one file in all of Explox that did. In this pointer-locked, canvas-heavy game
// those native dialogs are unreliable (some browsers silently return null with no dialog
// ever appearing once one gets suppressed), which is exactly what made "+ New Game" look
// broken. These overlays replace them, styled like the rest of the Game Builder panel.
function gbCloseModal() {
  const el = document.getElementById('gbModalOverlay');
  if (el) el.remove();
}
function gbShowModal(innerHtml, wire) {
  gbCloseModal();
  const overlay = document.createElement('div');
  overlay.id = 'gbModalOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:400;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `<div style="background:#0f2418;border:2px solid #44dd88;border-radius:12px;padding:20px;min-width:260px;max-width:360px;">${innerHtml}</div>`;
  document.body.appendChild(overlay);
  wire(overlay);
  return overlay;
}
function gbModalPrompt(title, defaultValue, onSubmit) {
  gbShowModal(`
    <div style="color:#fff;font-size:14px;margin-bottom:10px;">${title}</div>
    <input id="gbModalInput" type="text" style="width:100%;padding:8px;border-radius:6px;border:1px solid #444;background:#1a1a1a;color:#fff;font-size:13px;box-sizing:border-box;margin-bottom:12px;">
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button id="gbModalCancel" style="padding:6px 14px;background:#333;border:none;border-radius:6px;color:#fff;cursor:pointer;">Cancel</button>
      <button id="gbModalOk" style="padding:6px 14px;background:#2a7a2a;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;">OK</button>
    </div>`, overlay => {
    const input = overlay.querySelector('#gbModalInput');
    input.value = defaultValue || '';
    input.focus(); input.select();
    const submit = () => { const v = input.value; gbCloseModal(); onSubmit(v); };
    const cancel = () => { gbCloseModal(); onSubmit(null); };
    overlay.querySelector('#gbModalOk').onclick = submit;
    overlay.querySelector('#gbModalCancel').onclick = cancel;
    input.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') submit(); else if (e.key === 'Escape') cancel(); });
  });
}
function gbModalConfirm(title, onResult) {
  gbShowModal(`
    <div style="color:#fff;font-size:14px;margin-bottom:14px;text-align:center;">${title}</div>
    <div style="display:flex;gap:8px;justify-content:center;">
      <button id="gbModalNo" style="padding:6px 14px;background:#333;border:none;border-radius:6px;color:#fff;cursor:pointer;">Cancel</button>
      <button id="gbModalYes" style="padding:6px 14px;background:#7a2a2a;border:none;border-radius:6px;color:#fff;font-weight:bold;cursor:pointer;">Delete</button>
    </div>`, overlay => {
    overlay.querySelector('#gbModalYes').onclick = () => { gbCloseModal(); onResult(true); };
    overlay.querySelector('#gbModalNo').onclick = () => { gbCloseModal(); onResult(false); };
  });
}
function gbModalChoose(title, options, onChoose) {
  gbShowModal(`
    <div style="color:#fff;font-size:14px;margin-bottom:10px;">${title}</div>
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${options.map((o,i) => `<button data-i="${i}" style="padding:8px 12px;background:#2a5a2a;border:none;border-radius:6px;color:#fff;font-size:12px;text-align:left;cursor:pointer;">${o.label}</button>`).join('')}
      <button id="gbModalCancel" style="padding:6px 12px;background:#333;border:none;border-radius:6px;color:#fff;font-size:12px;cursor:pointer;margin-top:4px;">Cancel</button>
    </div>`, overlay => {
    overlay.querySelectorAll('button[data-i]').forEach(btn => {
      btn.onclick = () => { const opt = options[+btn.dataset.i]; gbCloseModal(); onChoose(opt.value); };
    });
    overlay.querySelector('#gbModalCancel').onclick = () => { gbCloseModal(); onChoose(null); };
  });
}

// ─── GAMES LIST SCREEN ───────────────────────────────────────────────────────
function gbRenderGamesList() {
  const list = document.getElementById('gbGamesList');
  if (!list) return;
  if (!gbGames.length) {
    list.innerHTML = `<div style="color:#666;font-size:13px;text-align:center;padding:20px;">No games yet — hit "+ New Game" to build your first one!</div>`;
  } else {
    list.innerHTML = gbGames.map(g => `
      <div style="background:rgba(255,255,255,0.05);border:2px solid #444;border-radius:10px;padding:10px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
        <div style="color:#fff;font-size:14px;font-weight:bold;">🎮 ${g.name}</div>
        <div style="display:flex;gap:6px;">
          <button onclick="gbOpenGame('${g.id}')" style="padding:6px 12px;background:#2a6a9a;border:none;border-radius:6px;color:#fff;font-size:12px;cursor:pointer;">✏️ Edit</button>
          <button onclick="gbDeleteGame('${g.id}')" style="padding:6px 10px;background:#6a2a2a;border:none;border-radius:6px;color:#fff;font-size:12px;cursor:pointer;">🗑️</button>
        </div>
      </div>`).join('');
  }
}
function gbCreateNewGame() {
  gbModalPrompt('Name your game:', 'My Game', (name) => {
    if (name === null) return;
    const g = gbNewGame(name.trim() || 'My Game');
    gbGames.push(g);
    gbSaveGames();
    gbOpenGame(g.id);
  });
}
function gbDeleteGame(id) {
  gbModalConfirm('Delete this game for good?', (yes) => {
    if (!yes) return;
    gbGames = gbGames.filter(g => g.id !== id);
    gbSaveGames();
    gbRenderGamesList();
  });
}
function gbOpenGame(id) {
  gbGame = gbGames.find(g => g.id === id);
  if (!gbGame) return;
  gbMigrateGame(gbGame);
  gbSpriteIdx = 0; gbSelectedScriptIdx = 0;
  document.getElementById('gbGamesScreen').style.display = 'none';
  document.getElementById('gbEditor').style.display = 'flex';
  gbRenderEditor();
}
function gbBackToGamesList() {
  gbStop();
  gbSaveGames();
  document.getElementById('gbEditor').style.display = 'none';
  document.getElementById('gbGamesScreen').style.display = 'block';
  gbRenderGamesList();
}

// ─── EDITOR SCREEN ───────────────────────────────────────────────────────────
function gbRenderEditor() {
  document.getElementById('gbGameNameLabel').textContent = gbGame.name;
  gbRenderPalette();
  gbRenderSpriteList();
  gbRenderScriptTabs();
  gbRenderScript();
  gbRenderVariablesEditor();
  gbRenderBackgroundSelect();
  gbRenderCostumesEditor();
  gbDrawStaticStage();
}
// Renders the full backdrop/level list (name, a color picker per backdrop, delete, + add) —
// picking a backdrop here sets it as the game's STARTING backdrop; switching mid-game is done
// with the "Switch backdrop to" block instead.
function gbRenderBackgroundSelect() {
  const box = document.getElementById('gbBackdropsList');
  if (!box) return;
  box.innerHTML = gbGame.backdrops.map((b,i) => `
    <div style="display:flex;align-items:center;gap:5px;background:${b.id===gbGame.currentBackdropId?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.05)'};border-radius:6px;padding:4px 6px;margin-bottom:4px;">
      <span onclick="gbSetStartingBackdrop('${b.id}')" style="width:16px;height:16px;border-radius:4px;background:${b.color};border:2px solid ${b.id===gbGame.currentBackdropId?'#66ccff':'#666'};cursor:pointer;flex:0 0 auto;"></span>
      <span onclick="gbSetStartingBackdrop('${b.id}')" style="color:#fff;font-size:11px;flex:1;cursor:pointer;">${b.name}</span>
      <select onchange="gbSetBackdropColor('${b.id}',this.value)" style="font-size:10px;">${GB_COLORS.map(c=>`<option value="${c.id}" ${c.id===b.color?'selected':''}>${c.label}</option>`).join('')}</select>
      ${gbGame.backdrops.length>1?`<button onclick="gbRemoveBackdrop('${b.id}')" style="background:none;border:none;color:#d94a4a;cursor:pointer;font-size:11px;">✕</button>`:''}
    </div>`).join('') +
    `<button onclick="gbAddBackdrop()" style="width:100%;padding:4px;background:#2a5a2a;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;">+ Add Backdrop</button>`;
}
function gbAddBackdrop() {
  gbModalPrompt('Backdrop name:', 'Level ' + (gbGame.backdrops.length+1), (name) => {
    if (!name) return;
    gbGame.backdrops.push({ id:gbNextId(), name, color:GB_COLORS[gbGame.backdrops.length % GB_COLORS.length].id });
    gbSaveGames();
    gbRenderBackgroundSelect();
  });
}
function gbRemoveBackdrop(id) {
  if (gbGame.backdrops.length <= 1) return;
  gbGame.backdrops = gbGame.backdrops.filter(b => b.id !== id);
  if (gbGame.currentBackdropId === id) gbSetStartingBackdrop(gbGame.backdrops[0].id);
  else gbSaveGames();
  gbRenderBackgroundSelect();
}
function gbSetBackdropColor(id, color) {
  const b = gbGame.backdrops.find(x=>x.id===id);
  if (!b) return;
  b.color = color;
  if (id === gbGame.currentBackdropId) gbGame.background = color;
  gbSaveGames();
  gbRenderBackgroundSelect(); gbDrawStaticStage();
}
function gbSetStartingBackdrop(id) {
  const b = gbGame.backdrops.find(x=>x.id===id);
  if (!b) return;
  gbGame.currentBackdropId = id; gbGame.background = b.color;
  gbSaveGames();
  gbRenderBackgroundSelect(); gbDrawStaticStage();
}
function gbRenderPalette() {
  const box = document.getElementById('gbPalette');
  if (!box) return;
  box.innerHTML = GB_CATEGORIES.map(cat => `
    <div style="margin-bottom:10px;">
      <div style="color:${cat.color};font-size:11px;font-weight:bold;letter-spacing:1px;margin-bottom:4px;">${cat.label.toUpperCase()}</div>
      ${Object.entries(GB_BLOCK_DEFS).filter(([,d]) => d.cat === cat.id).map(([type,d]) => `
        <div onclick="gbAddBlock('${type}')" draggable="true" ondragstart="event.dataTransfer.setData('text/plain','palette:${type}')" style="background:${d.color};color:#fff;font-size:11px;font-weight:bold;padding:6px 8px;border-radius:6px;margin-bottom:4px;cursor:grab;">${d.label.replace(/▢/g,'_')}</div>
      `).join('')}
    </div>`).join('');
}
function gbRenderSpriteList() {
  const box = document.getElementById('gbSpriteList');
  if (!box) return;
  box.innerHTML = gbGame.sprites.map((s,i) => `
    <div onclick="gbSelectSprite(${i})" style="background:${i===gbSpriteIdx?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.05)'};border:2px solid ${i===gbSpriteIdx?'#66ccff':'#444'};border-radius:8px;padding:6px;margin-bottom:6px;cursor:pointer;text-align:center;">
      <div style="font-size:22px;">${s.costume}</div>
      <div style="color:#fff;font-size:10px;">${s.name}</div>
    </div>`).join('') +
    `<button onclick="gbAddSprite()" style="width:100%;padding:6px;background:#2a5a2a;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;margin-top:4px;">+ Add Sprite</button>` +
    (gbGame.sprites.length > 1 ? `<button onclick="gbDeleteSprite()" style="width:100%;padding:6px;background:#5a2a2a;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;margin-top:4px;">🗑️ Delete Sprite</button>` : '');
}
function gbAddSprite() {
  gbGame.sprites.push(gbNewSprite('Sprite ' + (gbGame.sprites.length+1)));
  gbSpriteIdx = gbGame.sprites.length - 1;
  gbSaveGames();
  gbRenderSpriteList(); gbRenderScriptTabs(); gbRenderScript(); gbRenderCostumesEditor(); gbDrawStaticStage();
}
function gbDeleteSprite() {
  if (gbGame.sprites.length <= 1) return;
  gbModalConfirm('Delete this sprite?', (yes) => {
    if (!yes) return;
    gbGame.sprites.splice(gbSpriteIdx, 1);
    gbSpriteIdx = 0; gbSelectedScriptIdx = 0;
    gbSaveGames();
    gbRenderSpriteList(); gbRenderScriptTabs(); gbRenderScript(); gbRenderCostumesEditor(); gbDrawStaticStage();
  });
}
function gbSelectSprite(i) {
  gbSpriteIdx = i; gbSelectedScriptIdx = 0;
  gbRenderSpriteList(); gbRenderScriptTabs(); gbRenderScript(); gbRenderCostumesEditor(); gbDrawStaticStage();
}
function gbIsDrawnCostume(c) { return typeof c === 'string' && c.startsWith('data:image'); }
function gbCostumeThumbHtml(c) { return gbIsDrawnCostume(c) ? `<img src="${c}" style="width:18px;height:18px;image-rendering:pixelated;vertical-align:middle;">` : c; }
function gbRenderCostumesEditor() {
  const box = document.getElementById('gbCostumesList');
  if (!box) return;
  const sp = gbCurrentSprite();
  box.innerHTML = sp.costumes.map((c,i) => `
    <span style="display:inline-block;background:${i===sp.costumeIdx?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.06)'};border:2px solid ${i===sp.costumeIdx?'#66ccff':'#444'};border-radius:6px;padding:3px 6px;margin:0 4px 4px 0;font-size:18px;cursor:pointer;" onclick="gbSetSpriteCostumeIdx(${i})">${gbCostumeThumbHtml(c)}${sp.costumes.length>1?` <span onclick="event.stopPropagation();gbRemoveCostume(${i})" style="font-size:10px;color:#d94a4a;">✕</span>`:''}</span>`
  ).join('') +
    `<select onchange="if(this.value){gbAddCostume(this.value);this.value='';}" style="font-size:11px;margin-top:4px;"><option value="">+ add preset costume...</option>${GB_COSTUMES.map(c=>`<option>${c}</option>`).join('')}</select>` +
    `<button onclick="gbOpenPaintEditor()" style="display:block;width:100%;padding:4px;margin-top:4px;background:#2a5a9a;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;">🖌️ Draw New Costume</button>`;
}
function gbAddCostume(emoji) {
  gbCurrentSprite().costumes.push(emoji);
  gbSaveGames();
  gbRenderCostumesEditor();
}
function gbRemoveCostume(i) {
  const sp = gbCurrentSprite();
  if (sp.costumes.length <= 1) return;
  sp.costumes.splice(i,1);
  if (sp.costumeIdx >= sp.costumes.length) sp.costumeIdx = 0;
  sp.costume = sp.costumes[sp.costumeIdx];
  gbSaveGames();
  gbRenderCostumesEditor(); gbRenderSpriteList(); gbDrawStaticStage();
}
function gbSetSpriteCostumeIdx(i) {
  const sp = gbCurrentSprite();
  sp.costumeIdx = i; sp.costume = sp.costumes[i];
  gbSaveGames();
  gbRenderCostumesEditor(); gbRenderSpriteList(); gbDrawStaticStage();
}
function gbCurrentSprite() { return gbGame.sprites[gbSpriteIdx]; }
function gbCurrentScript() { return gbCurrentSprite().scripts[gbSelectedScriptIdx]; }

function gbRenderScriptTabs() {
  const box = document.getElementById('gbScriptTabs');
  if (!box) return;
  const s = gbCurrentSprite();
  box.innerHTML = s.scripts.map((sc,i) => `<button onclick="gbSelectScript(${i})" style="padding:5px 10px;background:${i===gbSelectedScriptIdx?'#3a6a9a':'#333'};border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;margin-right:5px;margin-bottom:5px;">${gbTriggerLabel(sc.trigger)}</button>`
  ).join('') + `<button onclick="gbAddScript()" style="padding:5px 10px;background:#2a5a2a;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;">+ New Script</button>`;
}
function gbTriggerLabel(trigger) {
  if (trigger.type === 'greenFlag') return '🏁 Green Flag';
  if (trigger.type === 'keyPressed') return `⌨️ ${(GB_KEYS.find(k=>k.id===trigger.key)||{}).label||trigger.key}`;
  if (trigger.type === 'msgReceived') return `📩 "${trigger.msg}"`;
  if (trigger.type === 'backdropSwitch') return `🖼️ ${(gbGame.backdrops.find(b=>b.id===trigger.backdropId)||{}).name||'?'}`;
  if (trigger.type === 'cloneStart') return '👯 As a clone';
  return trigger.type;
}
function gbAddScript() {
  gbModalChoose('Start this script with:', [
    { label:'🏁 Green Flag', value:{type:'greenFlag'} },
    { label:'⌨️ Key press', value:'key' },
    { label:'📩 Receive a message', value:'msg' },
    { label:'🖼️ Backdrop switches', value:'backdrop' },
    { label:'👯 When I start as a clone', value:{type:'cloneStart'} },
  ], (choice) => {
    if (choice === null) return;
    if (choice === 'key') {
      gbModalChoose('Which key?', GB_KEYS.map(k => ({ label:k.label, value:{type:'keyPressed', key:k.id} })), (trigger) => {
        if (trigger) gbFinishAddScript(trigger);
      });
    } else if (choice === 'msg') {
      gbModalPrompt('Which message?', 'go', (msg) => {
        if (msg === null) return;
        gbFinishAddScript({ type:'msgReceived', msg: msg.trim() || 'go' });
      });
    } else if (choice === 'backdrop') {
      if (!gbGame.backdrops.length) { showNotif('Add a backdrop first!'); return; }
      gbFinishAddScript({ type:'backdropSwitch', backdropId: gbGame.backdrops[0].id });
    } else {
      gbFinishAddScript(choice);
    }
  });
}
function gbFinishAddScript(trigger) {
  gbCurrentSprite().scripts.push({ id:gbNextId(), trigger, blocks:[] });
  gbSelectedScriptIdx = gbCurrentSprite().scripts.length - 1;
  gbSaveGames();
  gbRenderScriptTabs(); gbRenderScript();
}
function gbSelectScript(i) { gbSelectedScriptIdx = i; gbRenderScriptTabs(); gbRenderScript(); }

// A block is found by id via a recursive search so add/move/remove/edit work uniformly
// regardless of how deep it's nested inside repeat/if children — no manual path-tracking needed.
function gbFindContainer(blocks, id) {
  const idx = blocks.findIndex(b => b.id === id);
  if (idx >= 0) return { arr:blocks, idx };
  for (const b of blocks) {
    if (b.children) { const r = gbFindContainer(b.children, id); if (r) return r; }
    if (b.children2) { const r = gbFindContainer(b.children2, id); if (r) return r; }
  }
  return null;
}
function gbMakeBlock(type) {
  const def = GB_BLOCK_DEFS[type];
  const fields = {};
  def.fields.forEach(f => { fields[f.k] = f.t === 'cond' ? { check:'touchingEdge' } : f.d; });
  const b = { id:gbNextId(), type, fields };
  if (def.hasChildren) b.children = [];
  if (def.hasChildren2) b.children2 = [];
  return b;
}
function gbAddBlock(type) {
  gbCurrentScript().blocks.push(gbMakeBlock(type));
  gbSaveGames();
  gbRenderScript();
}
function gbAddChildBlock(parentId, branch, type) {
  const parent = gbFindBlockById(gbCurrentScript().blocks, parentId);
  if (!parent) return;
  (branch === 2 ? parent.children2 : parent.children).push(gbMakeBlock(type));
  gbSaveGames();
  gbRenderScript();
}
function gbFindBlockById(blocks, id) {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children) { const r = gbFindBlockById(b.children, id); if (r) return r; }
    if (b.children2) { const r = gbFindBlockById(b.children2, id); if (r) return r; }
  }
  return null;
}
function gbRemoveBlock(id) {
  const c = gbFindContainer(gbCurrentScript().blocks, id);
  if (c) c.arr.splice(c.idx, 1);
  gbSaveGames();
  gbRenderScript();
}
function gbMoveBlock(id, dir) {
  const c = gbFindContainer(gbCurrentScript().blocks, id);
  if (!c) return;
  const j = c.idx + dir;
  if (j < 0 || j >= c.arr.length) return;
  [c.arr[c.idx], c.arr[j]] = [c.arr[j], c.arr[c.idx]];
  gbSaveGames();
  gbRenderScript();
}
function gbUpdateField(blockId, key, value, isNum) {
  const b = gbFindBlockById(gbCurrentScript().blocks, blockId);
  if (!b) return;
  b.fields[key] = isNum ? (parseFloat(value)||0) : value;
  gbSaveGames();
}
function gbUpdateCond(blockId, patch) {
  const b = gbFindBlockById(gbCurrentScript().blocks, blockId);
  if (!b) return;
  Object.assign(b.fields.cond, patch);
  gbSaveGames();
  gbRenderScript();
}

function gbFieldEditorHtml(blockId, field, currentVal) {
  const onN = `oninput="gbUpdateField('${blockId}','${field.k}',this.value,true)"`;
  const onT = `oninput="gbUpdateField('${blockId}','${field.k}',this.value,false)"`;
  if (field.t === 'num') return `<input type="number" value="${currentVal}" ${onN} style="width:52px;padding:2px 4px;border-radius:4px;border:none;font-size:11px;">`;
  if (field.t === 'text') return `<input type="text" value="${currentVal}" ${onT} style="width:70px;padding:2px 4px;border-radius:4px;border:none;font-size:11px;">`;
  if (field.t === 'costume') return `<select ${onT} style="font-size:11px;border-radius:4px;">${GB_COSTUMES.map(c=>`<option ${c===currentVal?'selected':''}>${c}</option>`).join('')}</select>`;
  if (field.t === 'sound') return `<select ${onT} style="font-size:11px;border-radius:4px;">${GB_SOUNDS.map(s=>`<option value="${s.id}" ${s.id===currentVal?'selected':''}>${s.label}</option>`).join('')}</select>`;
  if (field.t === 'key') return `<select ${onT} style="font-size:11px;border-radius:4px;">${GB_KEYS.map(k=>`<option value="${k.id}" ${k.id===currentVal?'selected':''}>${k.label}</option>`).join('')}</select>`;
  if (field.t === 'color') return `<select ${onT} style="font-size:11px;border-radius:4px;">${GB_COLORS.map(c=>`<option value="${c.id}" ${c.id===currentVal?'selected':''}>${c.label}</option>`).join('')}</select>`;
  if (field.t === 'var') return `<select ${onT} style="font-size:11px;border-radius:4px;"><option value="">(pick)</option>${gbGame.variables.map(v=>`<option value="${v.name}" ${v.name===currentVal?'selected':''}>${v.name}</option>`).join('')}</select>`;
  if (field.t === 'ownCostume') return `<select ${onT} style="font-size:11px;border-radius:4px;">${gbCurrentSprite().costumes.map((c,i)=>`<option value="${c}" ${c===currentVal?'selected':''}>${gbIsDrawnCostume(c)?'🎨 Drawing '+(i+1):c}</option>`).join('')}</select>`;
  if (field.t === 'numvar') return `<input type="text" value="${currentVal}" ${onT} title="Type a number, or a variable name" style="width:56px;padding:2px 4px;border-radius:4px;border:none;font-size:11px;">`;
  if (field.t === 'mathop') return `<select ${onT} style="font-size:11px;border-radius:4px;">${['+','-','×','÷'].map(o=>`<option ${o===currentVal?'selected':''}>${o}</option>`).join('')}</select>`;
  if (field.t === 'cloneTarget') return `<select ${onT} style="font-size:11px;border-radius:4px;"><option value="self" ${currentVal==='self'?'selected':''}>myself</option>${gbGame.sprites.filter(s=>s.id!==gbCurrentSprite().id).map(s=>`<option value="${s.id}" ${s.id===currentVal?'selected':''}>${s.costume} ${s.name}</option>`).join('')}</select>`;
  if (field.t === 'backdrop') return `<select ${onT} style="font-size:11px;border-radius:4px;">${gbGame.backdrops.map(b=>`<option value="${b.id}" ${b.id===currentVal?'selected':''}>${b.name}</option>`).join('')}</select>`;
  return '';
}
function gbCondEditorHtml(blockId, cond) {
  const checkSel = `<select onchange="gbUpdateCond('${blockId}',{check:this.value})" style="font-size:11px;border-radius:4px;">
    ${Object.entries(GB_COND_DEFS).map(([id,d]) => `<option value="${id}" ${id===cond.check?'selected':''}>${d.label.replace(/▢.*$/,'').trim()}</option>`).join('')}
  </select>`;
  const def = GB_COND_DEFS[cond.check];
  const extra = def.fields.map(f => {
    if (f.t === 'op') return `<select onchange="gbUpdateCond('${blockId}',{op:this.value})" style="font-size:11px;">${['>','<','='].map(o=>`<option ${o===cond.op?'selected':''}>${o}</option>`).join('')}</select>`;
    if (f.t === 'sprite') return `<select onchange="gbUpdateCond('${blockId}',{spriteId:this.value})" style="font-size:11px;">${gbGame.sprites.filter(s=>s.id!==gbCurrentSprite().id).map(s=>`<option value="${s.id}" ${s.id===cond.spriteId?'selected':''}>${s.costume} ${s.name}</option>`).join('')}</select>`;
    if (f.t === 'key') return `<select onchange="gbUpdateCond('${blockId}',{key:this.value})" style="font-size:11px;">${GB_KEYS.map(k=>`<option value="${k.id}" ${k.id===cond.key?'selected':''}>${k.label}</option>`).join('')}</select>`;
    if (f.t === 'var') return `<select onchange="gbUpdateCond('${blockId}',{varName:this.value})" style="font-size:11px;"><option value="">(pick)</option>${gbGame.variables.map(v=>`<option value="${v.name}" ${v.name===cond.varName?'selected':''}>${v.name}</option>`).join('')}</select>`;
    if (f.t === 'num') return `<input type="number" value="${cond.value||0}" oninput="gbUpdateCond('${blockId}',{value:parseFloat(this.value)||0})" style="width:44px;font-size:11px;">`;
    return '';
  }).join(' ');
  return checkSel + ' ' + extra;
}
function gbRenderBlockRow(b, depth) {
  const def = GB_BLOCK_DEFS[b.type];
  const indent = depth * 18;
  let label = def.label;
  const fieldHtml = def.fields.map(f => {
    if (f.t === 'cond') return gbCondEditorHtml(b.id, b.fields.cond);
    return gbFieldEditorHtml(b.id, f, b.fields[f.k]);
  });
  fieldHtml.forEach(h => { label = label.replace('▢', `##FIELD##`); });
  let parts = label.split('##FIELD##');
  let rowInner = parts[0];
  for (let i=1;i<parts.length;i++) rowInner += (fieldHtml[i-1]||'') + parts[i];

  let html = `<div draggable="true"
    ondragstart="event.dataTransfer.setData('text/plain','existing:${b.id}');event.stopPropagation()"
    ondragover="event.preventDefault();event.stopPropagation();this.style.outline='2px dashed #fff'"
    ondragleave="this.style.outline='none'"
    ondrop="this.style.outline='none';gbHandleDropOnRow(event,'${b.id}')"
    style="margin-left:${indent}px;background:${def.color};border-radius:6px;padding:5px 8px;margin-bottom:3px;display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;cursor:grab;">
    <span style="color:#fff;font-size:11px;font-weight:bold;">${rowInner}</span>
    <span style="white-space:nowrap;">
      <button onclick="gbMoveBlock('${b.id}',-1)" style="background:none;border:none;color:#fff;cursor:pointer;font-size:11px;">▲</button>
      <button onclick="gbMoveBlock('${b.id}',1)" style="background:none;border:none;color:#fff;cursor:pointer;font-size:11px;">▼</button>
      <button onclick="gbRemoveBlock('${b.id}')" style="background:none;border:none;color:#fff;cursor:pointer;font-size:11px;">✕</button>
    </span>
  </div>`;
  if (def.hasChildren) {
    html += `<div ondragover="event.preventDefault();event.stopPropagation()" ondrop="gbHandleDropOnContainer(event,'${b.id}',1)" style="margin-left:${indent+18}px;min-height:14px;">` +
      (b.children.length ? b.children.map(c=>gbRenderBlockRow(c,0)).join('') : `<div style="color:#666;font-size:10px;padding:2px 0;">(empty — drop a block here)</div>`) + `</div>`;
    html += gbMiniAddRow(b.id, 1, indent+18);
  }
  if (def.hasChildren2) {
    html += `<div style="margin-left:${indent}px;color:#d9962a;font-size:10px;font-weight:bold;">ELSE:</div>`;
    html += `<div ondragover="event.preventDefault();event.stopPropagation()" ondrop="gbHandleDropOnContainer(event,'${b.id}',2)" style="margin-left:${indent+18}px;min-height:14px;">` +
      (b.children2.length ? b.children2.map(c=>gbRenderBlockRow(c,0)).join('') : `<div style="color:#666;font-size:10px;padding:2px 0;">(empty — drop a block here)</div>`) + `</div>`;
    html += gbMiniAddRow(b.id, 2, indent+18);
  }
  return html;
}
// Dropping a block ONTO another block's row inserts it immediately before that row — the block
// being dropped is either a brand new one from the palette ("palette:type") or an existing one
// being moved ("existing:id"), removed from its old spot first so it's never duplicated.
function gbHandleDropOnRow(event, targetBlockId) {
  event.preventDefault(); event.stopPropagation();
  const data = event.dataTransfer.getData('text/plain');
  if (data.startsWith('palette:')) {
    const target = gbFindContainer(gbCurrentScript().blocks, targetBlockId);
    if (!target) return;
    target.arr.splice(target.idx, 0, gbMakeBlock(data.slice(8)));
  } else if (data.startsWith('existing:')) {
    const srcId = data.slice(9);
    if (srcId === targetBlockId) return;
    const src = gbFindContainer(gbCurrentScript().blocks, srcId);
    if (!src) return;
    const moved = src.arr[src.idx];
    src.arr.splice(src.idx, 1);
    const target = gbFindContainer(gbCurrentScript().blocks, targetBlockId);
    if (!target) { gbCurrentScript().blocks.push(moved); gbSaveGames(); gbRenderScript(); return; }
    target.arr.splice(target.idx, 0, moved);
  } else return;
  gbSaveGames();
  gbRenderScript();
}
// Dropping directly on a container (the script background, or an empty/non-empty repeat/if
// branch) appends to the END of that branch instead of inserting before a specific row.
function gbHandleDropOnContainer(event, parentId, branch) {
  event.preventDefault(); event.stopPropagation();
  const data = event.dataTransfer.getData('text/plain');
  const arr = parentId ? (branch===2 ? gbFindBlockById(gbCurrentScript().blocks, parentId).children2 : gbFindBlockById(gbCurrentScript().blocks, parentId).children) : gbCurrentScript().blocks;
  if (data.startsWith('palette:')) {
    arr.push(gbMakeBlock(data.slice(8)));
  } else if (data.startsWith('existing:')) {
    const srcId = data.slice(9);
    const src = gbFindContainer(gbCurrentScript().blocks, srcId);
    if (!src) return;
    const moved = src.arr[src.idx];
    src.arr.splice(src.idx, 1);
    arr.push(moved);
  } else return;
  gbSaveGames();
  gbRenderScript();
}
function gbMiniAddRow(parentId, branch, indent) {
  return `<div style="margin-left:${indent}px;margin-bottom:6px;">
    <select onchange="if(this.value){gbAddChildBlock('${parentId}',${branch},this.value);this.value='';}" style="font-size:10px;border-radius:4px;">
      <option value="">+ add block inside...</option>
      ${Object.entries(GB_BLOCK_DEFS).map(([type,d])=>`<option value="${type}">${d.label.replace(/▢/g,'_')}</option>`).join('')}
    </select>
  </div>`;
}
function gbRenderScript() {
  const box = document.getElementById('gbScriptArea');
  if (!box || !gbGame) return;
  const sc = gbCurrentScript();
  box.innerHTML = (sc.blocks.length ? sc.blocks.map(b => gbRenderBlockRow(b,0)).join('') : `<div style="color:#666;font-size:12px;padding:10px;text-align:center;">Click a block on the left to add it here!</div>`);
}
function gbRenderVariablesEditor() {
  const box = document.getElementById('gbVarsList');
  if (!box) return;
  box.innerHTML = gbGame.variables.map((v,i) => `
    <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.06);border-radius:6px;padding:4px 8px;margin-bottom:4px;">
      <span style="color:#fff;font-size:11px;">${v.name} = ${v.value}</span>
      <button onclick="gbDeleteVariable(${i})" style="background:none;border:none;color:#d94a4a;cursor:pointer;font-size:11px;">✕</button>
    </div>`).join('') +
    `<button onclick="gbAddVariable()" style="width:100%;padding:5px;background:#d94a6a;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;">+ New Variable</button>`;
}
function gbAddVariable() {
  gbModalPrompt('Variable name:', 'Lives', (name) => {
    if (!name) return;
    if (gbGame.variables.some(v=>v.name===name)) { showNotif('Already have a variable with that name!'); return; }
    gbGame.variables.push({name, value:0});
    gbSaveGames();
    gbRenderVariablesEditor();
  });
}
function gbDeleteVariable(i) {
  gbGame.variables.splice(i,1);
  gbSaveGames();
  gbRenderVariablesEditor();
}
// ─── STAGE DRAWING (shared by the static editor preview and the live running game) ──────────
// A costume is either a plain emoji character (the original/default) or a hand-drawn one — a
// data: URL PNG exported by the Paint Editor. Cached Image objects (keyed by the data URL
// itself) so a drawn costume only ever gets decoded once, not every single frame.
const gbCostumeImageCache = {};
function gbGetCostumeImage(dataUrl) {
  if (!gbCostumeImageCache[dataUrl]) { const img = new Image(); img.src = dataUrl; gbCostumeImageCache[dataUrl] = img; }
  return gbCostumeImageCache[dataUrl];
}
function gbDrawSprite(ctx, sp) {
  if (!sp.visible) return;
  ctx.save();
  ctx.translate(sp.x, sp.y);
  const fontSize = 40 * (sp.size/100);
  if (typeof sp.costume === 'string' && sp.costume.startsWith('data:image')) {
    const img = gbGetCostumeImage(sp.costume);
    const s = fontSize; // drawn costumes are sized to match the emoji font-size box, so Change Size affects both the same way
    if (img.complete && img.naturalWidth) { ctx.imageSmoothingEnabled = false; ctx.drawImage(img, -s/2, -s/2, s, s); }
  } else {
    ctx.font = fontSize + 'px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(sp.costume, 0, 0);
  }
  if (sp.sayText && sp.sayUntil > performance.now()) {
    ctx.font = '11px Arial'; ctx.fillStyle = '#000';
    const w = ctx.measureText(sp.sayText).width + 12;
    ctx.fillStyle = '#fff'; ctx.fillRect(-w/2, -fontSize/2-24, w, 18);
    ctx.strokeStyle = '#333'; ctx.strokeRect(-w/2, -fontSize/2-24, w, 18);
    ctx.fillStyle = '#000'; ctx.fillText(sp.sayText, 0, -fontSize/2-15);
  }
  ctx.restore();
}
function gbDrawStaticStage() {
  const cv = document.getElementById('gbStageCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = gbGame.background; ctx.fillRect(0,0,GB_STAGE_W,GB_STAGE_H);
  gbGame.sprites.forEach(sp => gbDrawSprite(ctx, {...sp}));
}

// ─── INTERPRETER ─────────────────────────────────────────────────────────────
// Every block executes as a tiny generator that yields at least once — running the whole tree
// one requestAnimationFrame tick at a time (via gbTick calling .next() once per frame) is what
// gives every sprite's scripts real simultaneous, cooperative execution, the same "everything
// happens at once, frame by frame" feel Scratch itself has, without ever blocking the browser.
function gbSpriteRadius(sp) { return 40 * (sp.size/100) * 0.35; }
function gbTouching(a, b) { return Math.hypot(a.x-b.x, a.y-b.y) < gbSpriteRadius(a) + gbSpriteRadius(b); }
function gbEvalCond(cond, sp, rt) {
  if (cond.check === 'touchingEdge') return sp.x<=gbSpriteRadius(sp) || sp.x>=GB_STAGE_W-gbSpriteRadius(sp) || sp.y<=gbSpriteRadius(sp) || sp.y>=GB_STAGE_H-gbSpriteRadius(sp);
  if (cond.check === 'touchingSprite') { const other = rt.sprites.find(s=>s.id===cond.spriteId); return other ? gbTouching(sp, other) : false; }
  if (cond.check === 'keyDown') return rt.keysDown.has(cond.key);
  if (cond.check === 'varCompare') {
    const v = rt.variables[cond.varName] || 0;
    return cond.op === '>' ? v > cond.value : cond.op === '<' ? v < cond.value : v === cond.value;
  }
  return false;
}
// Resolves the sprite DEFINITION (in gbGame.sprites) behind any runtime sprite instance,
// original or clone alike — every trigger lookup (keys, messages, backdrops, clone-start) goes
// through this so clones automatically respond to the exact same events their original would.
function gbDefFor(rtSprite) { return gbGame.sprites.find(s => s.id === (rtSprite.cloneOfId || rtSprite.id)) || null; }
// Starts a fresh generator for every script (across every current sprite/clone) whose trigger
// passes matchFn — the shared engine behind broadcast messages and backdrop-switch events.
function gbSpawnMatchingScripts(rt, matchFn) {
  rt.sprites.forEach(sp => {
    const def = gbDefFor(sp);
    if (!def) return;
    def.scripts.forEach(sc => { if (matchFn(sc.trigger)) rt.generators.push(gbRunScriptGen(sc, sp, rt)); });
  });
}
// A math-block operand can be typed as a plain number OR an existing variable's name — this is
// the one place that gets resolved, so every math block reads live variable values automatically.
function gbResolveNumVar(str, rt) {
  if (Object.prototype.hasOwnProperty.call(rt.variables, str)) return rt.variables[str];
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}
function* gbRunBlocks(blocks, sp, rt) {
  for (const b of blocks) { yield* gbRunBlock(b, sp, rt); if (rt.stopScriptFlag) return; }
}
function* gbRunBlock(b, sp, rt) {
  const f = b.fields;
  switch (b.type) {
    case 'moveSteps': { const rad = f.steps>=0 ? sp.dir*Math.PI/180 : (sp.dir+180)*Math.PI/180; const d=Math.abs(f.steps); sp.x += Math.cos(rad)*d; sp.y -= Math.sin(rad)*d; yield; break; }
    case 'turnCW':  sp.dir -= f.deg; yield; break;
    case 'turnCCW': sp.dir += f.deg; yield; break;
    case 'pointDir': sp.dir = f.dir; yield; break;
    case 'goToXY': sp.x = f.x; sp.y = f.y; yield; break;
    case 'changeX': sp.x += f.dx; yield; break;
    case 'changeY': sp.y -= f.dy; yield; break;
    case 'bounceEdge': {
      const r = gbSpriteRadius(sp);
      if (sp.x < r) { sp.x = r; sp.dir = 180 - sp.dir; }
      if (sp.x > GB_STAGE_W-r) { sp.x = GB_STAGE_W-r; sp.dir = 180 - sp.dir; }
      if (sp.y < r) { sp.y = r; sp.dir = -sp.dir; }
      if (sp.y > GB_STAGE_H-r) { sp.y = GB_STAGE_H-r; sp.dir = -sp.dir; }
      yield; break;
    }
    case 'show': sp.visible = true; yield; break;
    case 'hide': sp.visible = false; yield; break;
    case 'setCostume': sp.costume = f.costume; { const i = sp.costumes ? sp.costumes.indexOf(f.costume) : -1; if (i>=0) sp.costumeIdx = i; } yield; break;
    case 'nextCostume': if (sp.costumes && sp.costumes.length) { sp.costumeIdx = (sp.costumeIdx+1) % sp.costumes.length; sp.costume = sp.costumes[sp.costumeIdx]; } yield; break;
    case 'say': sp.sayText = f.text; sp.sayUntil = performance.now() + f.secs*1000; yield; break;
    case 'changeSize': sp.size = Math.max(10, sp.size + f.amount); yield; break;
    case 'playSound': if (typeof sfx !== 'undefined' && sfx[f.sound]) sfx[f.sound](); yield; break;
    case 'wait': { const until = performance.now() + f.secs*1000; while (performance.now() < until) yield; break; }
    case 'repeat': for (let i=0;i<f.times;i++) { yield* gbRunBlocks(b.children, sp, rt); if (rt.stopScriptFlag) return; } break;
    case 'forever': while (rt.active) { yield* gbRunBlocks(b.children, sp, rt); if (rt.stopScriptFlag) return; yield; } break;
    case 'ifBlock': if (gbEvalCond(f.cond, sp, rt)) yield* gbRunBlocks(b.children, sp, rt); else yield; break;
    case 'ifElse': if (gbEvalCond(f.cond, sp, rt)) yield* gbRunBlocks(b.children, sp, rt); else yield* gbRunBlocks(b.children2, sp, rt); break;
    case 'stopScript': rt.stopScriptFlag = true; yield; break;
    case 'broadcastMsg': gbSpawnMatchingScripts(rt, t => t.type==='msgReceived' && t.msg===f.msg); yield; break;
    case 'createClone': {
      const sourceRt = f.target === 'self' ? sp : rt.sprites.find(s => s.id === f.target);
      if (sourceRt) {
        const originalDefId = sourceRt.cloneOfId || sourceRt.id;
        const clone = {...sourceRt, id: gbNextId(), cloneOfId: originalDefId, _dead:false};
        rt.sprites.push(clone);
        const def = gbGame.sprites.find(s => s.id === originalDefId);
        if (def) def.scripts.forEach(sc => { if (sc.trigger.type === 'cloneStart') rt.generators.push(gbRunScriptGen(sc, clone, rt)); });
      }
      yield; break;
    }
    case 'deleteClone': if (sp.cloneOfId) { sp._dead = true; rt.stopScriptFlag = true; } yield; break;
    case 'setBackground': rt.background = f.color; yield; break;
    case 'switchBackdrop': {
      const bd = gbGame.backdrops.find(b => b.id === f.backdropId);
      if (bd) { rt.background = bd.color; gbSpawnMatchingScripts(rt, t => t.type==='backdropSwitch' && t.backdropId===f.backdropId); }
      yield; break;
    }
    case 'winGame': rt.outcome = 'win'; rt.active = false; yield; break;
    case 'loseGame': rt.outcome = 'lose'; rt.active = false; yield; break;
    case 'setVar': rt.variables[f.varName] = f.value; yield; break;
    case 'changeVar': rt.variables[f.varName] = (rt.variables[f.varName]||0) + f.amount; yield; break;
    case 'mathOp': {
      const a = gbResolveNumVar(f.a, rt), b = gbResolveNumVar(f.b, rt);
      rt.variables[f.varName] = f.op==='+' ? a+b : f.op==='-' ? a-b : f.op==='×' ? a*b : (b===0 ? 0 : a/b);
      yield; break;
    }
    default: yield;
  }
}
function* gbRunScriptGen(script, sp, rt) {
  rt.stopScriptFlag = false;
  yield* gbRunBlocks(script.blocks, sp, rt);
}

function gbStart() {
  if (gbRunning) return;
  gbRunning = true;
  const rt = { sprites: gbGame.sprites.map(s => ({...s})), variables: {}, keysDown: new Set(), background: gbGame.background, active: true, outcome: null };
  gbGame.variables.forEach(v => rt.variables[v.name] = v.value);
  rt.generators = [];
  gbSpawnMatchingScripts(rt, t => t.type === 'greenFlag');
  rt.keydownHandler = (e) => {
    const key = e.key === ' ' ? 'Space' : e.key;
    rt.keysDown.add(key);
    gbSpawnMatchingScripts(rt, t => t.type === 'keyPressed' && t.key === key);
  };
  rt.keyupHandler = (e) => rt.keysDown.delete(e.key === ' ' ? 'Space' : e.key);
  window.addEventListener('keydown', rt.keydownHandler);
  window.addEventListener('keyup', rt.keyupHandler);
  gbRuntime = rt;
  document.getElementById('gbOutcomeBanner').style.display = 'none';
  gbFrameHandle = requestAnimationFrame(gbTick);
}
function gbStop() {
  if (!gbRunning) return;
  gbRunning = false;
  if (gbRuntime) {
    window.removeEventListener('keydown', gbRuntime.keydownHandler);
    window.removeEventListener('keyup', gbRuntime.keyupHandler);
  }
  if (gbFrameHandle) cancelAnimationFrame(gbFrameHandle);
  gbRuntime = null;
  if (gbGame) gbDrawStaticStage();
}
function gbTick() {
  const rt = gbRuntime;
  if (!rt) return;
  // Deliberately a for-of loop, NOT rt.generators.filter(...): a block like broadcastMsg or
  // createClone can push a brand-new generator into rt.generators mid-tick (from inside another
  // generator's own .next() call). Array.prototype.filter snapshots the array length before it
  // starts, so anything pushed during the callback gets silently dropped from the result — a
  // real bug this caught live (a broadcast's receiver never ran). for-of re-reads the array's
  // current length on every step, so a freshly spawned generator is naturally picked up too.
  const stillAlive = [];
  for (const gen of rt.generators) { if (!gen.next().done) stillAlive.push(gen); }
  rt.generators = stillAlive;
  if (rt.sprites.some(s => s._dead)) rt.sprites = rt.sprites.filter(s => !s._dead); // clones deleted this frame
  const cv = document.getElementById('gbStageCanvas');
  const ctx = cv.getContext('2d');
  ctx.fillStyle = rt.background; ctx.fillRect(0,0,GB_STAGE_W,GB_STAGE_H);
  rt.sprites.forEach(sp => gbDrawSprite(ctx, sp));
  if (rt.outcome) {
    const banner = document.getElementById('gbOutcomeBanner');
    banner.textContent = rt.outcome === 'win' ? '🏆 YOU WIN!' : '💀 GAME OVER';
    banner.style.color = rt.outcome === 'win' ? '#44ff88' : '#ff4444';
    banner.style.display = 'block';
    gbRunning = false;
    window.removeEventListener('keydown', rt.keydownHandler);
    window.removeEventListener('keyup', rt.keyupHandler);
    return; // don't schedule another frame — the run has ended
  }
  gbFrameHandle = requestAnimationFrame(gbTick);
}

// ─── PAINT EDITOR — a real pixel-art tool, like Scratch's own Paint Editor, so a costume never
// has to be limited to the preset emoji list. Draws onto a 16x16 grid (backed by a plain 2D
// array, not the canvas pixels themselves, so Clear/redraw is always exact) at a big 16px-per-
// cell size for easy clicking, then exports a small crisp 4px-per-cell PNG (64x64) as the actual
// saved costume — the same data: URL format gbDrawSprite() already knows how to render.
const GB_PAINT_COLORS = ['#000000','#ffffff','#ff0000','#ff8800','#ffdd00','#22cc44','#0088ff','#2244cc','#8822cc','#ff44aa','#8b5a2b','#888888'];
const GB_PAINT_SIZE = 16, GB_PAINT_CELL_PX = 16, GB_PAINT_EXPORT_CELL_PX = 4;
let gbPaintGrid = null;
let gbPaintColor = GB_PAINT_COLORS[0];
let gbPaintDrawing = false;
function gbBlankPaintGrid() { return Array.from({length:GB_PAINT_SIZE}, () => Array(GB_PAINT_SIZE).fill(null)); }
function gbOpenPaintEditor() {
  gbPaintGrid = gbBlankPaintGrid();
  gbPaintColor = GB_PAINT_COLORS[0];
  document.getElementById('gbPaintModal').style.display = 'flex';
  gbRenderPaintPalette();
  gbRenderPaintCanvas();
}
function gbClosePaintEditor() { document.getElementById('gbPaintModal').style.display = 'none'; }
function gbSetPaintColor(c) { gbPaintColor = c; gbRenderPaintPalette(); }
function gbRenderPaintPalette() {
  const box = document.getElementById('gbPaintPalette');
  if (!box) return;
  box.innerHTML = GB_PAINT_COLORS.map(c => `<span onclick="gbSetPaintColor('${c}')" style="display:inline-block;width:22px;height:22px;background:${c};border:2px solid ${c===gbPaintColor?'#fff':'#333'};border-radius:4px;margin:2px;cursor:pointer;"></span>`).join('') +
    `<span onclick="gbSetPaintColor(null)" title="Eraser" style="display:inline-block;width:22px;height:22px;background:repeating-conic-gradient(#999 0% 25%, #666 0% 50%) 50%/8px 8px;border:2px solid ${gbPaintColor===null?'#fff':'#333'};border-radius:4px;margin:2px;cursor:pointer;"></span>`;
}
function gbRenderPaintCanvas() {
  const cv = document.getElementById('gbPaintCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  for (let r=0;r<GB_PAINT_SIZE;r++) for (let c=0;c<GB_PAINT_SIZE;c++) {
    const x=c*GB_PAINT_CELL_PX, y=r*GB_PAINT_CELL_PX;
    ctx.fillStyle = ((r+c)%2===0) ? '#3a3a3a' : '#2a2a2a'; // checkerboard = transparent
    ctx.fillRect(x,y,GB_PAINT_CELL_PX,GB_PAINT_CELL_PX);
    if (gbPaintGrid[r][c]) { ctx.fillStyle = gbPaintGrid[r][c]; ctx.fillRect(x,y,GB_PAINT_CELL_PX,GB_PAINT_CELL_PX); }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  for (let i=0;i<=GB_PAINT_SIZE;i++) {
    ctx.beginPath(); ctx.moveTo(i*GB_PAINT_CELL_PX,0); ctx.lineTo(i*GB_PAINT_CELL_PX,cv.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*GB_PAINT_CELL_PX); ctx.lineTo(cv.width,i*GB_PAINT_CELL_PX); ctx.stroke();
  }
}
function gbPaintCellFromEvent(e) {
  const rect = e.target.getBoundingClientRect();
  const scaleX = e.target.width / rect.width, scaleY = e.target.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX, y = (e.clientY - rect.top) * scaleY;
  return {
    row: Math.max(0, Math.min(GB_PAINT_SIZE-1, Math.floor(y / GB_PAINT_CELL_PX))),
    col: Math.max(0, Math.min(GB_PAINT_SIZE-1, Math.floor(x / GB_PAINT_CELL_PX))),
  };
}
function gbPaintAt(e) {
  const {row,col} = gbPaintCellFromEvent(e);
  gbPaintGrid[row][col] = gbPaintColor;
  gbRenderPaintCanvas();
}
function gbPaintMouseDown(e) { gbPaintDrawing = true; gbPaintAt(e); }
function gbPaintMouseMove(e) { if (gbPaintDrawing) gbPaintAt(e); }
function gbPaintMouseUp() { gbPaintDrawing = false; }
function gbClearPaint() { gbPaintGrid = gbBlankPaintGrid(); gbRenderPaintCanvas(); }
function gbSaveDrawnCostume() {
  const out = document.createElement('canvas');
  out.width = GB_PAINT_SIZE*GB_PAINT_EXPORT_CELL_PX; out.height = GB_PAINT_SIZE*GB_PAINT_EXPORT_CELL_PX;
  const octx = out.getContext('2d');
  for (let r=0;r<GB_PAINT_SIZE;r++) for (let c=0;c<GB_PAINT_SIZE;c++) {
    if (gbPaintGrid[r][c]) { octx.fillStyle = gbPaintGrid[r][c]; octx.fillRect(c*GB_PAINT_EXPORT_CELL_PX, r*GB_PAINT_EXPORT_CELL_PX, GB_PAINT_EXPORT_CELL_PX, GB_PAINT_EXPORT_CELL_PX); }
  }
  gbCurrentSprite().costumes.push(out.toDataURL('image/png'));
  gbSaveGames();
  gbRenderCostumesEditor();
  gbClosePaintEditor();
}
