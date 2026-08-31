// ─── INVENTORY ───────────────────────────────────────────────────────────────
function toggleInventory() {
  const panel = document.getElementById('inventoryPanel');
  if(panel.style.display === 'none') {
    if(document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    refreshInventory();
    panel.style.display = 'block';
    document.getElementById('inventoryTab').style.display = 'none';
  } else {
    closeInventory();
  }
}
function closeInventory() {
  document.getElementById('inventoryPanel').style.display = 'none';
  document.getElementById('inventoryTab').style.display = 'block';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function refreshInventory() {
  const list  = document.getElementById('inventoryList');
  const empty = document.getElementById('inventoryEmpty');

  // Owned weapons switch right here now instead of needing a trip back to whichever shop
  // sold them — ownedWeapons was always a real persisted list, this panel just never
  // showed it. Bare fists is always offered once you own at least one real weapon, so you
  // can go unarmed again without losing track of what you own.
  let weaponsHtml = '';
  if (ownedWeapons.length > 0) {
    const options = [{ id: 'none', name: '✊ Bare Fists' }, ...WEAPONS.filter(w => ownedWeapons.includes(w.id))];
    weaponsHtml = `<div style="color:#ff8888;font-size:11px;font-weight:bold;letter-spacing:1px;margin-bottom:6px;">⚔️ WEAPONS</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">
        ${options.map(w => {
          const equipped = playerWeapon === w.id;
          return `<div style="background:rgba(255,255,255,0.06);border:1px solid ${equipped ? '#ff8888' : '#444'};border-radius:8px;padding:8px 10px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span style="color:#fff;font-size:12px;">${w.name}</span>
            <button onclick="equipWeapon('${w.id}')" ${equipped ? 'disabled' : ''} style="padding:4px 10px;background:${equipped ? '#333' : '#7a2a2a'};border:none;border-radius:6px;color:#fff;font-size:10px;cursor:${equipped ? 'default' : 'pointer'};">${equipped ? '✓ Equipped' : 'Equip'}</button>
          </div>`;
        }).join('')}
      </div>`;
  }

  const keys  = Object.keys(playerInventory);
  if(keys.length === 0 && !weaponsHtml) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  const itemsHtml = keys.map(id => {
    const it = playerInventory[id];
    if (!it || typeof it.name !== 'string' || typeof it.emoji !== 'string' || typeof it.qty !== 'number') return '';
    return `<div style="background:rgba(255,255,255,0.06);border:1px solid #444;border-radius:8px;padding:10px;display:flex;align-items:center;gap:10px;">
      <span style="font-size:22px;">${it.emoji}</span>
      <div style="flex:1;">
        <div style="color:#fff;font-size:13px;font-weight:bold;">${it.name}</div>
        <div style="color:#aaa;font-size:11px;">x${it.qty}</div>
      </div>
    </div>`;
  }).join('');
  list.innerHTML = weaponsHtml + itemsHtml;
}

// ─── HOUSE SYSTEM ────────────────────────────────────────────────────────────
const HOUSE_DOOR  = { x:-30, z:-103 }; // exterior door
const HOUSE_SPAWN = { x:10000, z:0 };    // inside spawn — center of room, clear of all furniture
const HOUSE_EXIT  = { x:10000, z:7 };    // exit zone inside

function enterHouse() {
  inHouse = true;
  playerGroup.position.set(HOUSE_SPAWN.x, 0, HOUSE_SPAWN.z);
  yaw = Math.PI;
  showNotif('🏠 Welcome home!');
}
function exitHouse() {
  inHouse = false;
  playerGroup.position.set(HOUSE_DOOR.x, 0, HOUSE_DOOR.z + 3);
  yaw = 0;
  showNotif('Leaving home...');
}
let mallReturn = { x:MALL_DOOR.x, z:MALL_DOOR.z+4 }; // which real door to return to on exit — item 156 added more malls sharing this one interior
function enterMall(returnX, returnZ) {
  inMall = true;
  mallReturn = { x: returnX!==undefined ? returnX : MALL_DOOR.x, z: returnZ!==undefined ? returnZ : MALL_DOOR.z+4 };
  playerGroup.position.set(MALL_SPAWN.x, 0, MALL_SPAWN.z);
  yaw = Math.PI;
  showNotif('🏬 Welcome to City Mall!');
}
function exitMall() {
  inMall = false;
  playerGroup.position.set(mallReturn.x, 0, mallReturn.z);
  yaw = 0;
  showNotif('Leaving mall...');
}
// 2 more real mall entrances (item 156) — deliberately share the SAME big City Mall interior
// (200+ shops, the Directory kiosk, everything) rather than building 2 more full malls from
// scratch; same honest "one shared interior, several real doors" pattern as the Land House/Country
// Hotel/Airport Lounge above. exitMall() remembers exactly which door you came in through.
const EXTRA_MALLS = [
  { name:'Westside Galleria', x:-250, z:-50, color:0x8855cc },
  { name:'Uptown Plaza',      x:250,  z:150, color:0xcc7733 },
];
function buildExtraMalls() {
  EXTRA_MALLS.forEach(m => {
    box(30,12,20, m.color, m.x, 6, m.z);
    box(32,0.6,22, 0xffffff, m.x, 12.3, m.z);
    box(6,5,0.3, 0x88ccff, m.x, 2.5, m.z+10.1);
    buildLogoSign(m.name, '🏬', '#'+m.color.toString(16).padStart(6,'0'), '#ffffff', m.x, 13.5, m.z-11);
    addCol(CITY_COLS, m.x, m.z, 16, 11);
    CITY_ZONES.push({ x:m.x, z:m.z+11, r:5, label:`🏬 ${m.name}`, action: () => enterMall(m.x, m.z+11) });
  });
}
function enterArcade() {
  inArcade = true;
  playerGroup.position.set(ARCADE_SPAWN.x, 0, ARCADE_SPAWN.z);
  yaw = Math.PI;
  showNotif('🕹️ Welcome to Pixel Palace Arcade!');
}
function leaveArcade() {
  inArcade = false;
  ARCADE_STOPPERS();
  document.getElementById('arcadeModal').style.display = 'none';
  playerGroup.position.set(ARCADE_EXIT.x, 0, ARCADE_EXIT.z);
  yaw = 0;
  showNotif('Leaving the arcade...');
}

// ─── ARCADE — PIXEL PALACE (8 real playable games, all cost real S.I.P. to play) ──
let arcadeState = {
  whackScore:0, whackTimer:null, whackEndTime:0, whackSpawnTimer:null, whackActiveHole:-1,
  mazeGrid:null, mazePlayer:{x:1,y:1}, mazeGhost:{x:9,y:7}, mazePellets:0, mazeGhostTimer:null, mazeOver:false,
  memCards:[], memFlipped:[], memMoves:0, memMatches:0, memLock:false,
  simSequence:[], simPlayerIdx:0, simRound:0, simLocked:true,
  snakeBody:[], snakeDir:{x:1,y:0}, snakeNextDir:{x:1,y:0}, snakeFood:{x:0,y:0}, snakeTimer:null, snakeOver:false, snakeScore:0,
  brkBall:{x:0,y:0,vx:0,vy:0}, brkPaddleX:0, brkBricks:[], brkKeys:{left:false,right:false}, brkAnimId:null, brkOver:false, brkBroken:0,
  rxnState:'idle', rxnStart:0, rxnTimer:null, simSequenceTimer:null,
  tetGrid:null, tetPiece:null, tetTimer:null, tetOver:false, tetLines:0
};
const ARCADE_SCREENS = ['whackScreen','mazeScreen','memoryScreen','simonScreen','snakeScreen','breakoutScreen','reactionScreen','tetrisScreen','clawScreen'];
const ARCADE_FEES = { whack:10, maze:15, memory:15, simon:10, snake:10, breakout:15, reaction:5, tetris:15, claw:8 };
const ARCADE_STOPPERS = () => { stopWhack(); stopMaze(); stopMemory(); stopSimon(); stopSnake(); stopBreakout(); stopReaction(); stopTetris(); stopClaw(); };

// Charges the entry fee for a game before it starts. Returns false (and shows a real
// "not enough S.I.P." message instead of starting) if the player can't afford it.
function arcadeCharge(fee, resultElId) {
  if (activeAddOns.includes('freearcade')) return true;
  if (sipDollars < fee) {
    const el = document.getElementById(resultElId);
    if (el) el.textContent = `You need ${fee} S.I.P. to play this — you only have ${sipDollars}.`;
    return false;
  }
  spendSip(fee); updateSIP();
  return true;
}

// Walking up to a specific cabinet/claw machine and pressing E opens that game directly —
// arcadeGoTo() is the single chokepoint every open*() function routes through, so it's the
// one place that needs to show the modal and release pointer lock (mouse clicks on cards/
// buttons don't work while the pointer is locked for 3D camera look).
function arcadeGoTo(screenId) {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('arcadeModal').style.display = 'flex';
  ARCADE_SCREENS.forEach(id=>{
    document.getElementById(id).style.display = id===screenId ? 'block' : 'none';
  });
}
function closeArcade() {
  ARCADE_STOPPERS();
  document.getElementById('arcadeModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ── Whack-a-Mole ──
function buildWhackGrid() {
  const grid = document.getElementById('whackGrid');
  if(grid.children.length) return; // build once
  for(let i=0;i<9;i++){
    const hole = document.createElement('div');
    hole.style.cssText = 'background:#1a1a2e;border-radius:50%;border:3px solid #333;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;width:90px;height:90px;';
    hole.onclick = () => hitMole(i);
    const mole = document.createElement('div');
    mole.id = 'mole'+i;
    mole.textContent = '🐹';
    mole.style.cssText = 'font-size:40px;transform:translateY(60px);transition:transform 0.12s;';
    hole.appendChild(mole);
    grid.appendChild(hole);
  }
}
function openWhack() {
  buildWhackGrid();
  arcadeGoTo('whackScreen');
  startWhack();
}
function startWhack() {
  if (!arcadeCharge(ARCADE_FEES.whack, 'whackResult')) return;
  stopWhack();
  arcadeState.whackScore = 0;
  arcadeState.whackActiveHole = -1;
  document.getElementById('whackScore').textContent = '0';
  document.getElementById('whackResult').textContent = '';
  document.getElementById('whackTimeLeft').textContent = '30';
  for(let i=0;i<9;i++){ const m=document.getElementById('mole'+i); if(m) m.style.transform='translateY(60px)'; }
  arcadeState.whackEndTime = Date.now() + 30000;
  spawnMoleLoop();
  arcadeState.whackTimer = setInterval(()=>{
    const left = Math.max(0, Math.ceil((arcadeState.whackEndTime - Date.now())/1000));
    document.getElementById('whackTimeLeft').textContent = left;
    if(left<=0) endWhack();
  }, 250);
}
function spawnMoleLoop() {
  if(Date.now() >= arcadeState.whackEndTime) return;
  if(arcadeState.whackActiveHole >= 0){ const prev=document.getElementById('mole'+arcadeState.whackActiveHole); if(prev) prev.style.transform='translateY(60px)'; }
  const hole = Math.floor(Math.random()*9);
  arcadeState.whackActiveHole = hole;
  const m = document.getElementById('mole'+hole);
  if(m) m.style.transform = 'translateY(0)';
  arcadeState.whackSpawnTimer = setTimeout(spawnMoleLoop, 550 + Math.random()*450);
}
function hitMole(i) {
  if(i !== arcadeState.whackActiveHole) return;
  const m = document.getElementById('mole'+i);
  if(m) m.style.transform = 'translateY(60px)';
  arcadeState.whackActiveHole = -1;
  arcadeState.whackScore++;
  document.getElementById('whackScore').textContent = arcadeState.whackScore;
  sfx.cheer();
}
function endWhack() {
  clearInterval(arcadeState.whackTimer);
  clearTimeout(arcadeState.whackSpawnTimer);
  for(let i=0;i<9;i++){ const m=document.getElementById('mole'+i); if(m) m.style.transform='translateY(60px)'; }
  const reward = arcadeState.whackScore * 3;
  queueEarning(reward, 0, 'Whack-a-Mole');
  document.getElementById('whackResult').textContent = `Time's up! You whacked ${arcadeState.whackScore} moles — +${reward} S.I.P.!`;
  showNotif(`🐹 Whack-a-Mole: ${arcadeState.whackScore} hits (+${reward} S.I.P.)`);
}
function stopWhack() {
  clearInterval(arcadeState.whackTimer);
  clearTimeout(arcadeState.whackSpawnTimer);
}

// ── Maze Chase (Pac-Man style) ──
const MAZE_ROWS = [
  "###########",
  "#.........#",
  "#.#.###.#.#",
  "#.#.....#.#",
  "#.#.###.#.#",
  "#.........#",
  "#.###.###.#",
  "#.........#",
  "###########"
];
const MAZE_CELL = 38;
function openMaze() {
  arcadeGoTo('mazeScreen');
  startMaze();
}
function startMaze() {
  if (!arcadeCharge(ARCADE_FEES.maze, 'mazeResult')) return;
  stopMaze();
  arcadeState.mazeGrid = MAZE_ROWS.map(r=>r.split(''));
  arcadeState.mazePlayer = {x:1,y:1};
  arcadeState.mazeGhost = {x:9,y:7};
  arcadeState.mazeOver = false;
  arcadeState.mazePellets = 0;
  for(const row of arcadeState.mazeGrid) for(const c of row) if(c==='.') arcadeState.mazePellets++;
  document.getElementById('mazeResult').textContent = '';
  const cv = document.getElementById('mazeCanvas');
  cv.width = MAZE_ROWS[0].length * MAZE_CELL;
  cv.height = MAZE_ROWS.length * MAZE_CELL;
  document.addEventListener('keydown', mazeKeydown);
  arcadeState.mazeGhostTimer = setInterval(moveGhost, 450);
  drawMaze();
}
function mazeKeydown(e) {
  if(arcadeState.mazeOver) return;
  let dx=0, dy=0;
  if(e.code==='ArrowUp'||e.code==='KeyW') dy=-1;
  else if(e.code==='ArrowDown'||e.code==='KeyS') dy=1;
  else if(e.code==='ArrowLeft'||e.code==='KeyA') dx=-1;
  else if(e.code==='ArrowRight'||e.code==='KeyD') dx=1;
  else return;
  e.preventDefault();
  const p = arcadeState.mazePlayer;
  const nx = p.x+dx, ny = p.y+dy;
  if(arcadeState.mazeGrid[ny] && arcadeState.mazeGrid[ny][nx] !== '#') {
    p.x = nx; p.y = ny;
    if(arcadeState.mazeGrid[ny][nx] === '.') {
      arcadeState.mazeGrid[ny][nx] = ' ';
      arcadeState.mazePellets--;
    }
  }
  checkMazeCollision();
  if(!arcadeState.mazeOver && arcadeState.mazePellets<=0) { mazeWin(); return; }
  drawMaze();
}
function moveGhost() {
  if(arcadeState.mazeOver) return;
  const g = arcadeState.mazeGhost, p = arcadeState.mazePlayer;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let best=null, bestDist=Infinity;
  dirs.forEach(([dx,dy])=>{
    const nx=g.x+dx, ny=g.y+dy;
    if(arcadeState.mazeGrid[ny] && arcadeState.mazeGrid[ny][nx] !== '#') {
      const dist = Math.abs(nx-p.x)+Math.abs(ny-p.y);
      if(dist < bestDist) { bestDist = dist; best = {x:nx,y:ny}; }
    }
  });
  if(best) { g.x = best.x; g.y = best.y; }
  checkMazeCollision();
  drawMaze();
}
function checkMazeCollision() {
  if(!arcadeState.mazeOver && arcadeState.mazePlayer.x === arcadeState.mazeGhost.x && arcadeState.mazePlayer.y === arcadeState.mazeGhost.y) {
    mazeLose();
  }
}
function drawMaze() {
  const cv = document.getElementById('mazeCanvas');
  const ctx = cv.getContext('2d');
  const s = MAZE_CELL, grid = arcadeState.mazeGrid;
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,cv.width,cv.height);
  for(let y=0;y<grid.length;y++) for(let x=0;x<grid[y].length;x++) {
    const c = grid[y][x];
    if(c==='#') { ctx.fillStyle='#2a2a6a'; ctx.fillRect(x*s,y*s,s,s); }
    else if(c==='.') { ctx.fillStyle='#ffd54a'; ctx.beginPath(); ctx.arc(x*s+s/2,y*s+s/2,3,0,Math.PI*2); ctx.fill(); }
  }
  ctx.fillStyle='#ffe600'; ctx.beginPath(); ctx.arc(arcadeState.mazePlayer.x*s+s/2, arcadeState.mazePlayer.y*s+s/2, s*0.38, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#ff4d6d'; ctx.beginPath(); ctx.arc(arcadeState.mazeGhost.x*s+s/2, arcadeState.mazeGhost.y*s+s/2, s*0.38, 0, Math.PI*2); ctx.fill();
  const lbl = document.getElementById('mazePelletsLeft'); if(lbl) lbl.textContent = arcadeState.mazePellets;
}
function mazeWin() {
  arcadeState.mazeOver = true;
  clearInterval(arcadeState.mazeGhostTimer);
  document.removeEventListener('keydown', mazeKeydown);
  drawMaze();
  const reward = 40;
  queueEarning(reward, 0, 'Maze Chase');
  document.getElementById('mazeResult').textContent = `You cleared the maze! +${reward} S.I.P.`;
  showNotif(`👻 Maze Chase cleared! (+${reward} S.I.P.)`);
}
function mazeLose() {
  arcadeState.mazeOver = true;
  clearInterval(arcadeState.mazeGhostTimer);
  document.removeEventListener('keydown', mazeKeydown);
  document.getElementById('mazeResult').textContent = 'The ghost got you! Try again?';
}
function stopMaze() {
  clearInterval(arcadeState.mazeGhostTimer);
  document.removeEventListener('keydown', mazeKeydown);
}

// ── Memory Match ──
const MEMORY_EMOJIS = ['🍕','🎮','🚀','🎸','🐱','⚽','🎨','🌟'];
function buildMemoryGrid() {
  const grid = document.getElementById('memoryGrid');
  if(grid.dataset.built) return;
  grid.dataset.built = '1';
  for(let i=0;i<16;i++){
    const card = document.createElement('div');
    card.style.cssText = 'width:70px;height:70px;background:#2a1a4a;border:2px solid #444;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer;user-select:none;';
    card.textContent = '❓';
    card.onclick = () => flipMemoryCard(i);
    grid.appendChild(card);
  }
}
function openMemory() {
  arcadeGoTo('memoryScreen');
  buildMemoryGrid();
  startMemory();
}
function startMemory() {
  if (!arcadeCharge(ARCADE_FEES.memory, 'memResult')) return;
  stopMemory();
  const pairs = MEMORY_EMOJIS.concat(MEMORY_EMOJIS);
  for(let i=pairs.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pairs[i],pairs[j]]=[pairs[j],pairs[i]]; }
  arcadeState.memCards = pairs.map(e=>({emoji:e, matched:false}));
  arcadeState.memFlipped = [];
  arcadeState.memMoves = 0;
  arcadeState.memMatches = 0;
  arcadeState.memLock = false;
  document.getElementById('memMoves').textContent = '0';
  document.getElementById('memResult').textContent = '';
  document.querySelectorAll('#memoryGrid > div').forEach(c=>{ c.textContent='❓'; c.style.background='#2a1a4a'; });
}
function flipMemoryCard(i) {
  if(arcadeState.memLock) return;
  const card = arcadeState.memCards[i];
  if(!card || card.matched) return;
  if(arcadeState.memFlipped.includes(i)) return;
  const cells = document.querySelectorAll('#memoryGrid > div');
  cells[i].textContent = card.emoji;
  cells[i].style.background = '#3a2a6a';
  arcadeState.memFlipped.push(i);
  if(arcadeState.memFlipped.length === 2) {
    arcadeState.memMoves++;
    document.getElementById('memMoves').textContent = arcadeState.memMoves;
    const [a,b] = arcadeState.memFlipped;
    if(arcadeState.memCards[a].emoji === arcadeState.memCards[b].emoji) {
      arcadeState.memCards[a].matched = true;
      arcadeState.memCards[b].matched = true;
      cells[a].style.background = '#1a5a3a';
      cells[b].style.background = '#1a5a3a';
      arcadeState.memFlipped = [];
      arcadeState.memMatches++;
      if(arcadeState.memMatches === 8) memoryWin();
    } else {
      arcadeState.memLock = true;
      setTimeout(()=>{
        cells[a].textContent = '❓'; cells[a].style.background = '#2a1a4a';
        cells[b].textContent = '❓'; cells[b].style.background = '#2a1a4a';
        arcadeState.memFlipped = [];
        arcadeState.memLock = false;
      }, 700);
    }
  }
}
function memoryWin() {
  const reward = Math.max(80 - arcadeState.memMoves*3, 20);
  queueEarning(reward, 0, 'Memory Match');
  document.getElementById('memResult').textContent = `Solved in ${arcadeState.memMoves} moves! +${reward} S.I.P.`;
  showNotif(`🧠 Memory Match cleared in ${arcadeState.memMoves} moves (+${reward} S.I.P.)`);
}
function stopMemory() { arcadeState.memLock = true; }

// ── Simon Says ──
const SIMON_COLORS = ['#ff4d6d','#4dd2ff','#4dff88','#ffe14d'];
function openSimon() { arcadeGoTo('simonScreen'); startSimon(); }
function startSimon() {
  if (!arcadeCharge(ARCADE_FEES.simon, 'simResult')) return;
  stopSimon();
  arcadeState.simSequence = [];
  arcadeState.simPlayerIdx = 0;
  arcadeState.simRound = 0;
  arcadeState.simLocked = true;
  document.getElementById('simRound').textContent = '0';
  document.getElementById('simResult').textContent = '';
  simonNextRound();
}
function simonNextRound() {
  arcadeState.simSequence.push(Math.floor(Math.random()*4));
  arcadeState.simRound++;
  document.getElementById('simRound').textContent = arcadeState.simRound;
  simonPlaySequence();
}
function simonPlaySequence() {
  arcadeState.simLocked = true;
  arcadeState.simPlayerIdx = 0;
  const seq = arcadeState.simSequence;
  let i = 0;
  function step() {
    if(i > 0) simonFlash(seq[i-1], false);
    if(i >= seq.length) { arcadeState.simLocked = false; return; }
    simonFlash(seq[i], true);
    i++;
    arcadeState.simSequenceTimer = setTimeout(step, 550);
  }
  arcadeState.simSequenceTimer = setTimeout(step, 400);
}
function simonFlash(idx, on) {
  const btn = document.querySelectorAll('#simonPad > div')[idx];
  if(!btn) return;
  btn.style.opacity = on ? '1' : '0.55';
  btn.style.boxShadow = on ? '0 0 20px 6px ' + SIMON_COLORS[idx] : 'none';
}
function simonClick(idx) {
  if(arcadeState.simLocked) return;
  simonFlash(idx, true);
  setTimeout(()=>simonFlash(idx, false), 200);
  if(idx === arcadeState.simSequence[arcadeState.simPlayerIdx]) {
    arcadeState.simPlayerIdx++;
    if(arcadeState.simPlayerIdx === arcadeState.simSequence.length) {
      arcadeState.simLocked = true;
      arcadeState.simSequenceTimer = setTimeout(simonNextRound, 700);
    }
  } else {
    simonOver();
  }
}
function simonOver() {
  arcadeState.simLocked = true;
  const reward = (arcadeState.simRound-1) * 5;
  if(reward > 0) queueEarning(reward, 0, 'Simon Says');
  document.getElementById('simResult').textContent = `Game over at round ${arcadeState.simRound}! +${reward} S.I.P.`;
  showNotif(`🎵 Simon Says: reached round ${arcadeState.simRound} (+${reward} S.I.P.)`);
}
function stopSimon() {
  clearTimeout(arcadeState.simSequenceTimer);
  arcadeState.simLocked = true;
}

// ── Snake ──
const SNAKE_COLS = 15, SNAKE_ROWS = 15, SNAKE_CELL = 24;
function openSnake() { arcadeGoTo('snakeScreen'); startSnake(); }
function startSnake() {
  if (!arcadeCharge(ARCADE_FEES.snake, 'snakeResult')) return;
  stopSnake();
  arcadeState.snakeBody = [{x:7,y:7},{x:6,y:7},{x:5,y:7}];
  arcadeState.snakeDir = {x:1,y:0};
  arcadeState.snakeNextDir = {x:1,y:0};
  arcadeState.snakeOver = false;
  arcadeState.snakeScore = 0;
  document.getElementById('snakeScore').textContent = '0';
  document.getElementById('snakeResult').textContent = '';
  const cv = document.getElementById('snakeCanvas');
  cv.width = SNAKE_COLS*SNAKE_CELL; cv.height = SNAKE_ROWS*SNAKE_CELL;
  snakePlaceFood();
  document.addEventListener('keydown', snakeKeydown);
  arcadeState.snakeTimer = setInterval(snakeTick, 160);
  drawSnake();
}
function snakePlaceFood() {
  let fx, fy, onSnake;
  do {
    fx = Math.floor(Math.random()*SNAKE_COLS);
    fy = Math.floor(Math.random()*SNAKE_ROWS);
    onSnake = arcadeState.snakeBody.some(s=>s.x===fx&&s.y===fy);
  } while(onSnake);
  arcadeState.snakeFood = {x:fx,y:fy};
}
function snakeKeydown(e) {
  const d = arcadeState.snakeDir;
  if((e.code==='ArrowUp'||e.code==='KeyW') && d.y===0) arcadeState.snakeNextDir = {x:0,y:-1};
  else if((e.code==='ArrowDown'||e.code==='KeyS') && d.y===0) arcadeState.snakeNextDir = {x:0,y:1};
  else if((e.code==='ArrowLeft'||e.code==='KeyA') && d.x===0) arcadeState.snakeNextDir = {x:-1,y:0};
  else if((e.code==='ArrowRight'||e.code==='KeyD') && d.x===0) arcadeState.snakeNextDir = {x:1,y:0};
  else return;
  e.preventDefault();
}
function snakeTick() {
  if(arcadeState.snakeOver) return;
  arcadeState.snakeDir = arcadeState.snakeNextDir;
  const body = arcadeState.snakeBody;
  const head = {x: body[0].x + arcadeState.snakeDir.x, y: body[0].y + arcadeState.snakeDir.y};
  if(head.x<0||head.x>=SNAKE_COLS||head.y<0||head.y>=SNAKE_ROWS || body.some(s=>s.x===head.x&&s.y===head.y)) {
    snakeGameOver(); return;
  }
  body.unshift(head);
  if(head.x===arcadeState.snakeFood.x && head.y===arcadeState.snakeFood.y) {
    arcadeState.snakeScore++;
    document.getElementById('snakeScore').textContent = arcadeState.snakeScore;
    snakePlaceFood();
  } else {
    body.pop();
  }
  drawSnake();
}
function drawSnake() {
  const cv = document.getElementById('snakeCanvas');
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,cv.width,cv.height);
  const s = SNAKE_CELL;
  ctx.fillStyle = '#ff4d6d';
  ctx.fillRect(arcadeState.snakeFood.x*s+3, arcadeState.snakeFood.y*s+3, s-6, s-6);
  arcadeState.snakeBody.forEach((seg,i)=>{
    ctx.fillStyle = i===0 ? '#4dff88' : '#2fae66';
    ctx.fillRect(seg.x*s+1, seg.y*s+1, s-2, s-2);
  });
}
function snakeGameOver() {
  arcadeState.snakeOver = true;
  clearInterval(arcadeState.snakeTimer);
  document.removeEventListener('keydown', snakeKeydown);
  const reward = arcadeState.snakeScore * 4;
  queueEarning(reward, 0, 'Snake');
  document.getElementById('snakeResult').textContent = `Game over! Ate ${arcadeState.snakeScore} — +${reward} S.I.P.`;
  showNotif(`🐍 Snake: ${arcadeState.snakeScore} eaten (+${reward} S.I.P.)`);
}
function stopSnake() {
  clearInterval(arcadeState.snakeTimer);
  document.removeEventListener('keydown', snakeKeydown);
}

// ── Brick Breaker ──
function openBreakout() { arcadeGoTo('breakoutScreen'); startBreakout(); }
function startBreakout() {
  if (!arcadeCharge(ARCADE_FEES.breakout, 'breakoutResult')) return;
  stopBreakout();
  const cv = document.getElementById('breakoutCanvas');
  cv.width = 400; cv.height = 300;
  arcadeState.brkPaddleX = 165;
  arcadeState.brkBall = {x:200, y:250, vx:2.6, vy:-3.2};
  arcadeState.brkBricks = [];
  const cols=6, rows=4, bw=60, bh=16, gap=4, offX=8, offY=24;
  const colors = ['#ff4d6d','#ffa64d','#ffe14d','#4dff88'];
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
    arcadeState.brkBricks.push({x:offX+c*(bw+gap), y:offY+r*(bh+gap), w:bw, h:bh, alive:true, color:colors[r%colors.length]});
  }
  arcadeState.brkOver = false;
  arcadeState.brkBroken = 0;
  arcadeState.brkKeys = {left:false, right:false};
  document.getElementById('breakoutResult').textContent = '';
  document.getElementById('breakoutBroken').textContent = '0';
  document.addEventListener('keydown', breakoutKeydown);
  document.addEventListener('keyup', breakoutKeyup);
  breakoutLoop();
}
function breakoutKeydown(e) {
  if(e.code==='ArrowLeft'||e.code==='KeyA') arcadeState.brkKeys.left = true;
  else if(e.code==='ArrowRight'||e.code==='KeyD') arcadeState.brkKeys.right = true;
  else return;
  e.preventDefault();
}
function breakoutKeyup(e) {
  if(e.code==='ArrowLeft'||e.code==='KeyA') arcadeState.brkKeys.left = false;
  else if(e.code==='ArrowRight'||e.code==='KeyD') arcadeState.brkKeys.right = false;
}
function breakoutLoop() {
  if(arcadeState.brkOver) return;
  const cv = document.getElementById('breakoutCanvas');
  if(arcadeState.brkKeys.left) arcadeState.brkPaddleX = Math.max(0, arcadeState.brkPaddleX - 5);
  if(arcadeState.brkKeys.right) arcadeState.brkPaddleX = Math.min(cv.width-70, arcadeState.brkPaddleX + 5);
  const b = arcadeState.brkBall;
  b.x += b.vx; b.y += b.vy;
  if(b.x < 6 || b.x > cv.width-6) b.vx *= -1;
  if(b.y < 6) b.vy *= -1;
  if(b.y > 274 && b.y < 284 && b.x > arcadeState.brkPaddleX && b.x < arcadeState.brkPaddleX+70 && b.vy > 0) {
    const hitPos = (b.x - (arcadeState.brkPaddleX+35)) / 35;
    b.vx = hitPos * 4;
    b.vy = -Math.abs(b.vy);
  }
  for(const brick of arcadeState.brkBricks) {
    if(!brick.alive) continue;
    if(b.x > brick.x && b.x < brick.x+brick.w && b.y > brick.y && b.y < brick.y+brick.h) {
      brick.alive = false;
      b.vy *= -1;
      arcadeState.brkBroken++;
      document.getElementById('breakoutBroken').textContent = arcadeState.brkBroken;
      break;
    }
  }
  if(b.y > cv.height) { breakoutLose(); return; }
  if(arcadeState.brkBricks.every(br=>!br.alive)) { breakoutWin(); return; }
  drawBreakout();
  arcadeState.brkAnimId = requestAnimationFrame(breakoutLoop);
}
function drawBreakout() {
  const cv = document.getElementById('breakoutCanvas');
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,cv.width,cv.height);
  arcadeState.brkBricks.forEach(br=>{ if(br.alive){ ctx.fillStyle=br.color; ctx.fillRect(br.x,br.y,br.w,br.h); } });
  ctx.fillStyle = '#00e5ff'; ctx.fillRect(arcadeState.brkPaddleX, 278, 70, 8);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(arcadeState.brkBall.x, arcadeState.brkBall.y, 6, 0, Math.PI*2); ctx.fill();
}
function breakoutWin() {
  arcadeState.brkOver = true;
  stopBreakout();
  const reward = 100;
  queueEarning(reward, 0, 'Brick Breaker');
  document.getElementById('breakoutResult').textContent = `All bricks cleared! +${reward} S.I.P.`;
  showNotif(`🧱 Brick Breaker cleared! (+${reward} S.I.P.)`);
}
function breakoutLose() {
  arcadeState.brkOver = true;
  stopBreakout();
  const reward = arcadeState.brkBroken * 3;
  queueEarning(reward, 0, 'Brick Breaker');
  document.getElementById('breakoutResult').textContent = `Ball dropped! Broke ${arcadeState.brkBroken} bricks — +${reward} S.I.P.`;
  showNotif(`🧱 Brick Breaker: ${arcadeState.brkBroken} broken (+${reward} S.I.P.)`);
}
function stopBreakout() {
  cancelAnimationFrame(arcadeState.brkAnimId);
  document.removeEventListener('keydown', breakoutKeydown);
  document.removeEventListener('keyup', breakoutKeyup);
}

// ── Quick Draw (Reaction Test) ──
function openReaction() { arcadeGoTo('reactionScreen'); startReaction(); }
function startReaction() {
  if (!arcadeCharge(ARCADE_FEES.reaction, 'reactionResult')) return;
  stopReaction();
  arcadeState.rxnState = 'waiting';
  const box = document.getElementById('reactionBox');
  box.style.background = '#552222';
  box.textContent = 'Wait for green...';
  document.getElementById('reactionResult').textContent = '';
  const delay = 1200 + Math.random()*2500;
  arcadeState.rxnTimer = setTimeout(()=>{
    arcadeState.rxnState = 'ready';
    arcadeState.rxnStart = performance.now();
    box.style.background = '#1a7a3a';
    box.textContent = 'CLICK NOW!';
  }, delay);
}
function reactionClick() {
  const box = document.getElementById('reactionBox');
  if(arcadeState.rxnState === 'waiting') {
    clearTimeout(arcadeState.rxnTimer);
    arcadeState.rxnState = 'idle';
    box.style.background = '#552222';
    box.textContent = 'Too soon! Tap to retry';
    document.getElementById('reactionResult').textContent = 'You clicked before it turned green — no reward this round.';
    return;
  }
  if(arcadeState.rxnState === 'ready') {
    const ms = Math.round(performance.now() - arcadeState.rxnStart);
    arcadeState.rxnState = 'idle';
    let reward;
    if(ms < 250) reward = 40; else if(ms < 400) reward = 25; else if(ms < 600) reward = 15; else reward = 8;
    queueEarning(reward, 0, 'Quick Draw');
    box.style.background = '#552222';
    box.textContent = 'Tap to try again';
    document.getElementById('reactionResult').textContent = `${ms}ms reaction time! +${reward} S.I.P.`;
    showNotif(`⚡ Quick Draw: ${ms}ms (+${reward} S.I.P.)`);
    return;
  }
  startReaction();
}
function stopReaction() {
  clearTimeout(arcadeState.rxnTimer);
  arcadeState.rxnState = 'idle';
}

// ── Tetris ──
const TETRIS_COLS = 10, TETRIS_ROWS = 20, TETRIS_CELL = 18;
const TETROMINOES = {
  I: [[[0,1],[1,1],[2,1],[3,1]], [[2,0],[2,1],[2,2],[2,3]], [[0,2],[1,2],[2,2],[3,2]], [[1,0],[1,1],[1,2],[1,3]]],
  O: [[[1,0],[2,0],[1,1],[2,1]], [[1,0],[2,0],[1,1],[2,1]], [[1,0],[2,0],[1,1],[2,1]], [[1,0],[2,0],[1,1],[2,1]]],
  T: [[[1,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[2,1],[1,2]], [[0,1],[1,1],[2,1],[1,2]], [[1,0],[0,1],[1,1],[1,2]]],
  S: [[[1,0],[2,0],[0,1],[1,1]], [[1,0],[1,1],[2,1],[2,2]], [[1,1],[2,1],[0,2],[1,2]], [[0,0],[0,1],[1,1],[1,2]]],
  Z: [[[0,0],[1,0],[1,1],[2,1]], [[2,0],[1,1],[2,1],[1,2]], [[0,1],[1,1],[1,2],[2,2]], [[1,0],[0,1],[1,1],[0,2]]],
  J: [[[0,0],[0,1],[1,1],[2,1]], [[1,0],[2,0],[1,1],[1,2]], [[0,1],[1,1],[2,1],[2,2]], [[1,0],[1,1],[0,2],[1,2]]],
  L: [[[2,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,2]], [[0,1],[1,1],[2,1],[0,2]], [[0,0],[1,0],[1,1],[1,2]]]
};
const TETRO_COLORS = { I:'#4dd2ff', O:'#ffe14d', T:'#c04dff', S:'#4dff88', Z:'#ff4d6d', J:'#4d6dff', L:'#ffa64d' };

function openTetris() { arcadeGoTo('tetrisScreen'); startTetris(); }
function startTetris() {
  if (!arcadeCharge(ARCADE_FEES.tetris, 'tetrisResult')) return;
  stopTetris();
  arcadeState.tetGrid = Array.from({length:TETRIS_ROWS}, ()=>Array(TETRIS_COLS).fill(null));
  arcadeState.tetOver = false;
  arcadeState.tetLines = 0;
  document.getElementById('tetrisLines').textContent = '0';
  document.getElementById('tetrisResult').textContent = '';
  const cv = document.getElementById('tetrisCanvas');
  cv.width = TETRIS_COLS*TETRIS_CELL; cv.height = TETRIS_ROWS*TETRIS_CELL;
  tetSpawnPiece();
  document.addEventListener('keydown', tetKeydown);
  arcadeState.tetTimer = setInterval(tetDrop, 500);
  drawTetris();
}
function tetCells(piece) {
  return TETROMINOES[piece.type][piece.rot].map(([dx,dy])=>({x:piece.x+dx, y:piece.y+dy}));
}
function tetCollides(piece) {
  return tetCells(piece).some(c => c.x<0 || c.x>=TETRIS_COLS || c.y>=TETRIS_ROWS || (c.y>=0 && arcadeState.tetGrid[c.y][c.x]));
}
function tetSpawnPiece() {
  const types = Object.keys(TETROMINOES);
  const type = types[Math.floor(Math.random()*types.length)];
  arcadeState.tetPiece = { type, rot:0, x:3, y:0 };
  if (tetCollides(arcadeState.tetPiece)) tetGameOver();
}
function tetKeydown(e) {
  if(arcadeState.tetOver) return;
  const p = arcadeState.tetPiece;
  if(e.code==='ArrowLeft') { const np={type:p.type,rot:p.rot,x:p.x-1,y:p.y}; if(!tetCollides(np)) arcadeState.tetPiece=np; }
  else if(e.code==='ArrowRight') { const np={type:p.type,rot:p.rot,x:p.x+1,y:p.y}; if(!tetCollides(np)) arcadeState.tetPiece=np; }
  else if(e.code==='ArrowDown') { tetDrop(); return; }
  else if(e.code==='ArrowUp'||e.code==='KeyX') { const np={type:p.type,rot:(p.rot+1)%4,x:p.x,y:p.y}; if(!tetCollides(np)) arcadeState.tetPiece=np; }
  else return;
  e.preventDefault();
  drawTetris();
}
function tetDrop() {
  if(arcadeState.tetOver) return;
  const p = arcadeState.tetPiece;
  const np = {type:p.type, rot:p.rot, x:p.x, y:p.y+1};
  if(!tetCollides(np)) {
    arcadeState.tetPiece = np;
  } else {
    tetLockPiece();
    tetClearLines();
    tetSpawnPiece();
  }
  drawTetris();
}
function tetLockPiece() {
  const color = TETRO_COLORS[arcadeState.tetPiece.type];
  tetCells(arcadeState.tetPiece).forEach(c => { if(c.y>=0) arcadeState.tetGrid[c.y][c.x] = color; });
}
function tetClearLines() {
  let cleared = 0;
  for(let y=TETRIS_ROWS-1; y>=0; y--) {
    if(arcadeState.tetGrid[y].every(cell=>cell)) {
      arcadeState.tetGrid.splice(y,1);
      arcadeState.tetGrid.unshift(Array(TETRIS_COLS).fill(null));
      cleared++;
      y++;
    }
  }
  if(cleared > 0) {
    arcadeState.tetLines += cleared;
    document.getElementById('tetrisLines').textContent = arcadeState.tetLines;
  }
}
function drawTetris() {
  const cv = document.getElementById('tetrisCanvas');
  const ctx = cv.getContext('2d');
  const s = TETRIS_CELL;
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,cv.width,cv.height);
  for(let y=0;y<TETRIS_ROWS;y++) for(let x=0;x<TETRIS_COLS;x++) {
    if(arcadeState.tetGrid[y][x]) { ctx.fillStyle=arcadeState.tetGrid[y][x]; ctx.fillRect(x*s+1,y*s+1,s-2,s-2); }
  }
  if(arcadeState.tetPiece) {
    ctx.fillStyle = TETRO_COLORS[arcadeState.tetPiece.type];
    tetCells(arcadeState.tetPiece).forEach(c=>{ if(c.y>=0) ctx.fillRect(c.x*s+1,c.y*s+1,s-2,s-2); });
  }
}
function tetGameOver() {
  arcadeState.tetOver = true;
  clearInterval(arcadeState.tetTimer);
  document.removeEventListener('keydown', tetKeydown);
  const reward = arcadeState.tetLines * 15;
  queueEarning(reward, 0, 'Tetris');
  document.getElementById('tetrisResult').textContent = `Game over! Cleared ${arcadeState.tetLines} lines — +${reward} S.I.P.`;
  showNotif(`🧩 Tetris: ${arcadeState.tetLines} lines (+${reward} S.I.P.)`);
}
function stopTetris() {
  clearInterval(arcadeState.tetTimer);
  document.removeEventListener('keydown', tetKeydown);
}

// ── Claw Machines — 10 real machines, each with its own 5-prize pool. Unlike the other 8
// games (pay once per round), a claw machine charges per DROP, same as a real one — you can
// keep dropping as long as you can afford it and prizes remain. Rarer/pricier prizes are
// genuinely harder to grab (lower success chance), not just cosmetic flavor text.
const CLAW_MACHINES = [
  { name:'Plushie Palace',  color:0xff69b4, prizes:[{emoji:'🐸',name:'Frog Plush',value:25},{emoji:'🧸',name:'Teddy Bear',value:30},{emoji:'🐰',name:'Bunny Plush',value:35},{emoji:'🐼',name:'Panda Plush',value:40},{emoji:'🦄',name:'Unicorn Plush',value:55}] },
  { name:'Dino Dig',        color:0x4caf50, prizes:[{emoji:'🌋',name:'Volcano Rock Toy',value:25},{emoji:'🥚',name:'Dino Egg',value:20},{emoji:'🦴',name:'Fossil Bone',value:30},{emoji:'🦕',name:'Brontosaurus Toy',value:35},{emoji:'🦖',name:'T-Rex Toy',value:45}] },
  { name:'Space Cadets',    color:0x3f51b5, prizes:[{emoji:'🌟',name:'Star Charm',value:20},{emoji:'🧑‍🚀',name:'Astronaut Figure',value:40},{emoji:'👽',name:'Alien Figure',value:35},{emoji:'🚀',name:'Rocket Toy',value:40},{emoji:'🛸',name:'UFO Toy',value:50}] },
  { name:'Ocean Critters',  color:0x00bcd4, prizes:[{emoji:'🦀',name:'Crab Toy',value:20},{emoji:'🐢',name:'Turtle Toy',value:30},{emoji:'🐬',name:'Dolphin Plush',value:35},{emoji:'🐙',name:'Octopus Plush',value:35},{emoji:'🐳',name:'Whale Plush',value:45}] },
  { name:'Robo Workshop',   color:0x9e9e9e, prizes:[{emoji:'⚙️',name:'Gear Charm',value:15},{emoji:'🔋',name:'Battery Bot',value:25},{emoji:'🛠️',name:'Tool Set Toy',value:30},{emoji:'📡',name:'Satellite Toy',value:35},{emoji:'🤖',name:'Robot Toy',value:45}] },
  { name:'Candy Corner',    color:0xff4081, prizes:[{emoji:'🍭',name:'Lollipop Plush',value:15},{emoji:'🍬',name:'Candy Charm',value:15},{emoji:'🍫',name:'Chocolate Bar Charm',value:20},{emoji:'🧁',name:'Cupcake Toy',value:25},{emoji:'🍩',name:'Donut Pillow',value:30}] },
  { name:"Dragon's Hoard",  color:0xd32f2f, prizes:[{emoji:'🗡️',name:'Toy Sword',value:35},{emoji:'👑',name:'Tiny Crown',value:45},{emoji:'🐉',name:'Dragon Figure',value:50},{emoji:'🔥',name:'Fire Gem',value:55},{emoji:'💎',name:'Gem Charm',value:60}] },
  { name:'Barnyard Buddies',color:0xffb300, prizes:[{emoji:'🐔',name:'Chicken Toy',value:20},{emoji:'🐷',name:'Pig Plush',value:25},{emoji:'🐮',name:'Cow Plush',value:30},{emoji:'🐑',name:'Sheep Plush',value:30},{emoji:'🐴',name:'Horse Plush',value:35}] },
  { name:'Hero HQ',         color:0x1976d2, prizes:[{emoji:'⚡',name:'Bolt Charm',value:20},{emoji:'🎭',name:'Mask Charm',value:25},{emoji:'💥',name:'Power Fist',value:30},{emoji:'🛡️',name:'Shield Toy',value:35},{emoji:'🦸',name:'Hero Figure',value:45}] },
  { name:'Gem Vault',       color:0x8e24aa, prizes:[{emoji:'🪙',name:'Gold Coin Toy',value:25},{emoji:'💠',name:'Crystal Charm',value:40},{emoji:'💍',name:'Ring Charm',value:35},{emoji:'🔮',name:'Crystal Ball',value:55},{emoji:'💎',name:'Diamond Charm',value:65}] },
];
const CLAW_SLOTS = 5; // one prize per slot, claw moves in slot increments
let clawState = { machineId:0, clawX:2, prizes:[], dropping:false, won:[] };
function openClaw(id) {
  arcadeGoTo('clawScreen');
  const m = CLAW_MACHINES[id];
  clawState.machineId = id;
  clawState.clawX = Math.floor(CLAW_SLOTS/2);
  clawState.prizes = m.prizes.map(p=>({...p}));
  clawState.dropping = false;
  clawState.won = [];
  document.getElementById('clawTitle').textContent = `🧸 ${m.name}`;
  document.getElementById('clawResult').textContent = '';
  const cv = document.getElementById('clawCanvas');
  cv.width = 340; cv.height = 260;
  document.addEventListener('keydown', clawKeydown);
  drawClaw();
}
function clawKeydown(e) {
  if(clawState.dropping) return;
  if(e.code==='ArrowLeft')  { clawState.clawX = Math.max(0, clawState.clawX-1); drawClaw(); }
  else if(e.code==='ArrowRight') { clawState.clawX = Math.min(CLAW_SLOTS-1, clawState.clawX+1); drawClaw(); }
  else if(e.code==='ArrowDown'||e.code==='Space') { e.preventDefault(); clawDrop(); }
}
function clawDrop() {
  if(clawState.dropping) return;
  if(clawState.prizes.every(p=>!p)) return; // machine already empty
  const target = clawState.prizes[clawState.clawX];
  const resultEl = document.getElementById('clawResult');
  if(!target) { resultEl.textContent = 'Empty slot — move to a prize first!'; return; }
  if (!arcadeCharge(ARCADE_FEES.claw, 'clawResult')) return;
  clawState.dropping = true;
  resultEl.textContent = '🦾 Dropping...';
  let step = 0;
  const anim = setInterval(() => {
    step++;
    drawClaw(step*0.18);
    if(step >= 5) {
      clearInterval(anim);
      // Rarer/pricier prizes are genuinely harder to win — real risk/reward, not decoration.
      const chance = Math.max(0.2, Math.min(0.75, 0.9 - target.value*0.01));
      const success = Math.random() < chance;
      if(success) {
        clawState.prizes[clawState.clawX] = null;
        clawState.won.push(target);
        queueEarning(target.value, 0, 'Claw Machine');
        resultEl.textContent = `You grabbed the ${target.emoji} ${target.name}! +${target.value} S.I.P.`;
        showNotif(`🧸 Claw win: ${target.emoji} ${target.name} (+${target.value} S.I.P.)`);
      } else {
        resultEl.textContent = `So close! The ${target.emoji} ${target.name} slipped away.`;
      }
      clawState.dropping = false;
      drawClaw();
      if(clawState.prizes.every(p=>!p)) {
        const total = clawState.won.reduce((s,p)=>s+p.value,0);
        resultEl.textContent = `Machine empty! You won ${clawState.won.length} prizes worth ${total} S.I.P. total.`;
      }
    }
  }, 90);
}
function drawClaw(dropProgress) {
  const cv = document.getElementById('clawCanvas');
  const ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,w,h);
  const slotW = w/CLAW_SLOTS;
  // prizes on the floor
  clawState.prizes.forEach((p,i)=>{
    if(!p) return;
    ctx.font = '32px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(p.emoji, slotW*i+slotW/2, h-40);
    ctx.fillStyle='#9ab'; ctx.font='10px Arial';
    ctx.fillText(p.name, slotW*i+slotW/2, h-16);
  });
  // claw
  const clawCX = slotW*clawState.clawX + slotW/2;
  const clawY = 20 + (dropProgress ? Math.min(dropProgress,1)*(h-90) : 0);
  ctx.strokeStyle = '#ccc'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(clawCX, 0); ctx.lineTo(clawCX, clawY); ctx.stroke();
  ctx.font = '26px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('🦾', clawCX, clawY);
}
function stopClaw() {
  document.removeEventListener('keydown', clawKeydown);
  clawState.dropping = false;
}

// ─── WHISPERING WOODS — real choppable trees + a crafting table ──────────────
const WOODS_CENTER = { x:200, z:-320 };
const CRAFT_TABLE = { x:WOODS_CENTER.x, z:WOODS_CENTER.z+14 };
let WOOD_TREES = [];
function chopTree(tree) {
  if (tree.fallen) {
    const secsLeft = Math.max(0, Math.ceil((tree.respawnAt - Date.now())/1000));
    showNotif(`🌳 This tree is down — regrowing in ${secsLeft}s`);
    return;
  }
  tree.hp--;
  triggerSwing();
  sfx.chop();
  woodCount += 1;
  if (tree.hp <= 0) {
    woodCount += 2; // felling bonus on top of this hit's +1 — matches fellTree()'s own +3 total
    fellTree(tree);
  } else {
    updateWood();
    showNotif(`🪓 Chop! +1 🪵 Wood (${tree.hp} hit${tree.hp===1?'':'s'} left)`);
  }
}
// Extracted so a car ram (item 160) can instantly fell a tree in one hit (a real car obviously
// doesn't need 3 chops) while still granting the SAME real +3 wood total and respawn timer as
// normally chopping one down — no economy exploit from ramming instead of chopping.
function fellTree(tree) {
  tree.fallen = true;
  tree.canopy.visible = false;
  tree.trunk.scale.y = 0.15;
  tree.trunk.position.y = tree.baseY * 0.15;
  sfx.earn();
  updateWood();
  showNotif('🌳 Tree down! +3 🪵 Wood total');
  const respawnMs = 45000;
  tree.respawnAt = Date.now() + respawnMs;
  setTimeout(() => {
    tree.fallen = false; tree.hp = tree.maxHp;
    tree.canopy.visible = true;
    tree.trunk.scale.y = 1;
    tree.trunk.position.y = tree.baseY;
    showNotif('🌱 A tree grew back in Whispering Woods!');
  }, respawnMs);
}
// Real 11x11 jittered grid (not hand-listed) so it scales cleanly to a real forest —
// spacing (10) keeps worst-case neighbor distance well above 2x the chop-zone radius (2.5),
// and cells too close to the Crafting Table or Training Dummy's own fixed relative positions
// are dropped before the first 100 survivors are kept, so neither zone can ever overlap a tree's.
function generateWoodsOffsets(count) {
  const SPACING = 10, COLS = 11, ROWS = 11, HALF = (COLS-1)/2;
  const craftRel = { x:0, z:14 }, dummyRel = { x:25, z:0 };
  const candidates = [];
  for (let row=0; row<ROWS; row++) {
    for (let col=0; col<COLS; col++) {
      const dx = (col-HALF)*SPACING + (Math.random()-0.5)*3;
      const dz = (row-HALF)*SPACING + (Math.random()-0.5)*3;
      if (Math.hypot(dx-craftRel.x, dz-craftRel.z) < 8) continue;
      if (Math.hypot(dx-dummyRel.x, dz-dummyRel.z) < 8) continue;
      candidates.push([dx,dz]);
    }
  }
  return candidates.slice(0, count);
}
function buildWoodsArea() {
  buildLogoSign('WHISPERING WOODS', '🌲', '#2d7a2d', '#8B5A2B', WOODS_CENTER.x, 7, WOODS_CENTER.z-12);
  const offsets = generateWoodsOffsets(100);
  offsets.forEach(([dx,dz]) => {
    const x = WOODS_CENTER.x+dx, z = WOODS_CENTER.z+dz, baseY = 2.5;
    const trunk = box(0.7,5,0.7, 0x5c3a1e, x, baseY, z);
    const canopy = box(4,4,4, 0x2d7a2d, x, 6.5, z);
    treeMeshes.push(canopy); // rides along with the existing seasonal-color system too
    addCol(CITY_COLS, x, z, 0.5, 0.5);
    const tree = { x, z, baseY, hp:3, maxHp:3, fallen:false, respawnAt:0, trunk, canopy };
    WOOD_TREES.push(tree);
    CITY_ZONES.push({ x, z, r:2.5, label:'🌳 Chop Tree for Wood', action: () => chopTree(tree) });
  });

  // Crafting Table, a short walk south of the grove
  box(2.4,0.9,1.4, 0x6b4423, CRAFT_TABLE.x, 0.45, CRAFT_TABLE.z);
  box(2.6,0.15,1.6, 0x5c3a1e, CRAFT_TABLE.x, 0.95, CRAFT_TABLE.z);
  buildLogoSign('CRAFTING TABLE', '🔨', '#8B5A2B', '#ffd54a', CRAFT_TABLE.x, 2.4, CRAFT_TABLE.z-1.4);
  addCol(CITY_COLS, CRAFT_TABLE.x, CRAFT_TABLE.z, 1.3, 0.8);
  CITY_ZONES.push({ x:CRAFT_TABLE.x, z:CRAFT_TABLE.z+2.5, r:2.5, label:'🔨 Open Crafting Table', action: () => openCrafting()});

  // Practice Dummy, well clear of the trees/table so its zone can't overlap theirs
  DUMMY.x = WOODS_CENTER.x + 25; DUMMY.z = WOODS_CENTER.z;
  const dg = new THREE.Group(); dg.position.set(DUMMY.x, 0, DUMMY.z); scene.add(dg);
  const dpost = new THREE.Mesh(new THREE.BoxGeometry(0.3,3,0.3), mat(0x5c3a1e)); dpost.position.set(0,1.5,0); dg.add(dpost);
  const dbody = new THREE.Mesh(new THREE.BoxGeometry(0.8,1.6,0.5), mat(0xc9a06a)); dbody.position.set(0,2.6,0); dg.add(dbody);
  DUMMY.mesh = dg;
  buildLogoSign('TRAINING DUMMY', '🥊', '#c9a06a', '#ff4444', DUMMY.x, 4.2, DUMMY.z-1.4);
  addCol(CITY_COLS, DUMMY.x, DUMMY.z, 0.6, 0.6);
  CITY_ZONES.push({ x:DUMMY.x, z:DUMMY.z+2.5, r:2.5, label:'🥊 Punch Training Dummy', action: hitDummy });
}

// ── Crafting — wood/scrap/S.I.P./material recipes; weapon/armor recipes plug into the real WEAPONS/ARMOR system ──
// `mats` = {material_id: qty} consumed from playerInventory (the 100 Dump-extracted materials)
const CRAFT_RECIPES = [
  { id:'club',       name:'Wooden Club',        emoji:'🏏', wood:5,  type:'weapon' },
  { id:'chair',      name:'Wooden Chair',       emoji:'🪑', wood:4,  type:'item' },
  { id:'frame',      name:'Wood Picture Frame', emoji:'🖼️', wood:3,  type:'item' },
  { id:'campfire',   name:'Campfire Kit',       emoji:'🔥', wood:6,  type:'item' },
  { id:'metalsword', name:'Metal Sword',        emoji:'🗡️', scrap:10, sip:100, type:'weapon' },
  { id:'scrap',      name:'Scrap Armor',        emoji:'🔩', scrap:15, type:'armor' },
  { id:'statue',     name:'Scrap Statue',       emoji:'🤖', scrap:8,  type:'item' },
  { id:'battleaxe',  name:'Battle Axe',         emoji:'🪓', wood:4, mats:{steel_plate:4, splintered_wood:2}, type:'weapon' },
  { id:'crystalsword',name:'Crystal Sword',     emoji:'💎', mats:{crystal_fragment:3, titanium_shard:2, gold_nugget:1}, type:'weapon' },
  { id:'titanium',   name:'Titanium Armor',     emoji:'🦾', mats:{titanium_shard:5, steel_plate:3, nylon_cord:2}, type:'armor' },
  { id:'lantern',    name:'Junk Lantern',       emoji:'🏮', mats:{glass_shard:2, led_light:1, copper_wire:2}, type:'item' },
  { id:'toolbox',    name:'Restored Toolbox',   emoji:'🧰', mats:{rusty_bolt:3, cracked_handle:1, steel_plate:1}, type:'item' },
];
function craftCostText(r) {
  const parts = [];
  if(r.wood)  parts.push(`🪵 ${r.wood} Wood`);
  if(r.scrap) parts.push(`🔩 ${r.scrap} Scrap`);
  if(r.sip)   parts.push(`💰 ${r.sip} S.I.P.`);
  if(r.mats) Object.entries(r.mats).forEach(([id,qty]) => {
    const m = MATERIALS.find(x=>x.id===id);
    parts.push(`${m.emoji} ${qty} ${m.name}`);
  });
  return parts.join(' + ');
}
function hasMats(mats) {
  if(!mats) return true;
  return Object.entries(mats).every(([id,qty]) => playerInventory[id] && playerInventory[id].qty >= qty);
}
function spendMats(mats) {
  if(!mats) return;
  Object.entries(mats).forEach(([id,qty]) => {
    playerInventory[id].qty -= qty;
    if(playerInventory[id].qty <= 0) delete playerInventory[id];
  });
}
function canAffordRecipe(r) {
  return woodCount >= (r.wood||0) && scrapMetal >= (r.scrap||0) && sipDollars >= (r.sip||0) && hasMats(r.mats);
}
function openCrafting() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('craftOverlay').style.display = 'flex';
  renderCraftItems();
}
function closeCrafting() {
  document.getElementById('craftOverlay').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderCraftItems() {
  document.getElementById('craftWood').textContent = woodCount;
  const cs = document.getElementById('craftScrap'); if(cs) cs.textContent = scrapMetal;
  const list = document.getElementById('craftItems');
  list.innerHTML = '';
  CRAFT_RECIPES.forEach((r,i) => {
    const owned = (r.type==='weapon' && ownedWeapons.includes(r.id)) || (r.type==='armor' && ownedArmor.includes(r.id));
    const d = document.createElement('div'); d.className='shopItem';
    d.innerHTML = `<div class="siName">${r.emoji} ${r.name}</div>
      <div class="siCost">${craftCostText(r)}</div>
      <button class="shopBtn" onclick="craftItem(${i})" ${(!owned && !canAffordRecipe(r))?'disabled':''}>${owned?'Equip':'Craft'}</button>`;
    list.appendChild(d);
  });
}
function craftItem(i) {
  const r = CRAFT_RECIPES[i];
  if(r.type==='weapon' && ownedWeapons.includes(r.id)) { if(equipWeapon(r.id)) showNotif(`✅ Equipped ${r.emoji} ${r.name}!`); renderCraftItems(); return; }
  if(r.type==='armor' && ownedArmor.includes(r.id)) { equipArmor(r.id); showNotif(`✅ Equipped ${r.emoji} ${r.name}!`); renderCraftItems(); return; }
  if(!canAffordRecipe(r)) { showNotif(`❌ Need ${craftCostText(r)}`); return; }
  if(r.wood)  { woodCount -= r.wood; updateWood(); }
  if(r.scrap) { scrapMetal -= r.scrap; updateScrapMetal(); }
  if(r.sip)   { spendSip(r.sip); updateSIP(); }
  spendMats(r.mats);
  if(r.type==='weapon') {
    ownedWeapons.push(r.id);
    equipWeapon(r.id);
  } else if(r.type==='armor') {
    ownedArmor.push(r.id);
    equipArmor(r.id);
  } else {
    addToInventory(r.id, r.name, r.emoji);
    saveCurrentUser();
  }
  sfx.buy();
  showNotif(`🔨 Crafted ${r.emoji} ${r.name}!`);
  renderCraftItems();
}

// ── Training Dummy — safe target to feel out weapon damage, zero risk to the player ──
let DUMMY = { x:0, z:0, hp:100, maxHp:100, defeated:false, mesh:null };
function hitDummy() {
  if(DUMMY.defeated) { showNotif('🪵 The dummy is down — repairing itself...'); return; }
  const dmg = getWeaponDamage();
  DUMMY.hp -= dmg;
  triggerSwing();
  startDummyKnockback();
  sfx.hit();
  if(DUMMY.hp <= 0) {
    DUMMY.defeated = true;
    DUMMY.mesh.rotation.z = Math.PI/2.2;
    DUMMY.mesh.position.y = -0.8;
    showNotif(`🥊 Dummy defeated! Final hit for ${dmg}`);
    setTimeout(() => {
      DUMMY.hp = DUMMY.maxHp;
      DUMMY.defeated = false;
      DUMMY.mesh.rotation.z = 0;
      DUMMY.mesh.position.y = 0;
      showNotif('🪵 Training dummy repaired and ready!');
    }, 8000);
  } else {
    showNotif(`🥊 Hit dummy for ${dmg}! (${DUMMY.hp} HP left)`);
  }
}

