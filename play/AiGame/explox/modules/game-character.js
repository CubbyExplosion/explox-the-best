// ─── AVATAR CARD (draws badge onto any 96×128 canvas) ────────────────────────
// ─── PAINT EDITOR — the same real pixel-art tool as Game Builder's Paint Editor (see
// game-builder.js's GB_PAINT_* / gbOpenPaintEditor and friends), reused here for TWO different
// targets instead of copy-pasting the whole tool twice: your account badge/nametag picture, and
// a custom design painted onto your shirt in 3D. pfpEditTarget picks which one Save/Remove
// writes to — everything else (grid, palette, canvas, mouse handling) is shared.
// Same shape: a 16x16 grid backed by a plain array, a big 16px-per-cell canvas for easy
// clicking, exported as a crisp 4px-per-cell 64x64 PNG saved onto the account (goes through
// saveCurrentUser(), so it syncs to the server the same as every other account field).
const PFP_COLORS = ['#000000','#ffffff','#ff0000','#ff8800','#ffdd00','#22cc44','#0088ff','#2244cc','#8822cc','#ff44aa','#8b5a2b','#888888'];
const PFP_SIZE = 16, PFP_CELL_PX = 16, PFP_EXPORT_CELL_PX = 4;
let pfpGrid = null;
let pfpColor = PFP_COLORS[0];
let pfpDrawing = false;
let pfpEditTarget = 'profile'; // 'profile' or 'shirt'
let _pfpImageCache = {};
function pfpBlankGrid() { return Array.from({length:PFP_SIZE}, () => Array(PFP_SIZE).fill(null)); }
function openProfilePicEditor() { pfpEditTarget = 'profile'; pfpOpenEditor('🖌️ DRAW YOUR PROFILE PICTURE'); }
function openShirtPaintEditor() { pfpEditTarget = 'shirt'; pfpOpenEditor('🖌️ DRAW YOUR SHIRT DESIGN'); }
function pfpOpenEditor(title) {
  pfpGrid = pfpBlankGrid();
  pfpColor = PFP_COLORS[0];
  document.getElementById('pfpModal').style.display = 'flex';
  document.getElementById('pfpModalTitle').textContent = title;
  document.getElementById('pfpMsg').textContent = '';
  pfpRenderPalette();
  pfpRenderCanvas();
}
function closeProfilePicEditor() { document.getElementById('pfpModal').style.display = 'none'; }
function pfpSetColor(c) { pfpColor = c; pfpRenderPalette(); }
function pfpRenderPalette() {
  const box = document.getElementById('pfpPalette');
  if (!box) return;
  box.innerHTML = PFP_COLORS.map(c => `<span onclick="pfpSetColor('${c}')" style="display:inline-block;width:22px;height:22px;background:${c};border:2px solid ${c===pfpColor?'#fff':'#333'};border-radius:4px;margin:2px;cursor:pointer;"></span>`).join('') +
    `<span onclick="pfpSetColor(null)" title="Eraser" style="display:inline-block;width:22px;height:22px;background:repeating-conic-gradient(#999 0% 25%, #666 0% 50%) 50%/8px 8px;border:2px solid ${pfpColor===null?'#fff':'#333'};border-radius:4px;margin:2px;cursor:pointer;"></span>`;
}
function pfpRenderCanvas() {
  const cv = document.getElementById('pfpCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  for (let r=0;r<PFP_SIZE;r++) for (let c2=0;c2<PFP_SIZE;c2++) {
    const x=c2*PFP_CELL_PX, y=r*PFP_CELL_PX;
    ctx.fillStyle = ((r+c2)%2===0) ? '#3a3a3a' : '#2a2a2a'; // checkerboard = transparent
    ctx.fillRect(x,y,PFP_CELL_PX,PFP_CELL_PX);
    if (pfpGrid[r][c2]) { ctx.fillStyle = pfpGrid[r][c2]; ctx.fillRect(x,y,PFP_CELL_PX,PFP_CELL_PX); }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  for (let i=0;i<=PFP_SIZE;i++) {
    ctx.beginPath(); ctx.moveTo(i*PFP_CELL_PX,0); ctx.lineTo(i*PFP_CELL_PX,cv.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*PFP_CELL_PX); ctx.lineTo(cv.width,i*PFP_CELL_PX); ctx.stroke();
  }
}
// Reads clientX/Y from a real touch point when this fires from a touch event (touchstart/move
// carry it on e.touches[0], touchend only on e.changedTouches[0]) — falls back to the event
// itself for a plain mouse event. Same function serves both input types, so mouse and touch can
// never compute the cell differently.
function pfpCellFromEvent(e) {
  const rect = e.target.getBoundingClientRect();
  const scaleX = e.target.width / rect.width, scaleY = e.target.height / rect.height;
  const point = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
  const x = (point.clientX - rect.left) * scaleX, y = (point.clientY - rect.top) * scaleY;
  return {
    row: Math.max(0, Math.min(PFP_SIZE-1, Math.floor(y / PFP_CELL_PX))),
    col: Math.max(0, Math.min(PFP_SIZE-1, Math.floor(x / PFP_CELL_PX))),
  };
}
function pfpPaintAt(e) {
  const {row,col} = pfpCellFromEvent(e);
  pfpGrid[row][col] = pfpColor;
  pfpRenderCanvas();
}
// pfpMouseDown/Move/Up double as the touch handlers too (see pfpCanvas's ontouchstart/move/end in
// EXPLOX.html) — touch-action:none on the canvas already stops the page from scrolling/zooming
// under a draw gesture, so all that's needed here is reading real touch coordinates, above.
function pfpMouseDown(e) { pfpDrawing = true; pfpPaintAt(e); }
function pfpMouseMove(e) { if (pfpDrawing) pfpPaintAt(e); }
function pfpMouseUp() { pfpDrawing = false; }
function pfpClear() { pfpGrid = pfpBlankGrid(); pfpRenderCanvas(); }
function pfpSaveDrawing() {
  if (!pfpGrid.some(row => row.some(cell => cell !== null))) {
    document.getElementById('pfpMsg').textContent = "Draw something first!";
    return;
  }
  const out = document.createElement('canvas');
  out.width = PFP_SIZE*PFP_EXPORT_CELL_PX; out.height = PFP_SIZE*PFP_EXPORT_CELL_PX;
  const octx = out.getContext('2d');
  for (let r=0;r<PFP_SIZE;r++) for (let c2=0;c2<PFP_SIZE;c2++) {
    if (pfpGrid[r][c2]) { octx.fillStyle = pfpGrid[r][c2]; octx.fillRect(c2*PFP_EXPORT_CELL_PX, r*PFP_EXPORT_CELL_PX, PFP_EXPORT_CELL_PX, PFP_EXPORT_CELL_PX); }
  }
  const dataUrl = out.toDataURL('image/png');
  if (pfpEditTarget === 'shirt') { playerShirtPaint = dataUrl; } else { playerProfilePic = dataUrl; }
  saveCurrentUser();
  refreshPreviews();
  if (pfpEditTarget === 'shirt') refreshShirtPaintTexture(); else refreshNametagAvatar();
  closeProfilePicEditor();
}
function pfpRemovePicture() {
  if (pfpEditTarget === 'shirt') { playerShirtPaint = null; } else { playerProfilePic = null; }
  saveCurrentUser();
  refreshPreviews();
  if (pfpEditTarget === 'shirt') refreshShirtPaintTexture(); else refreshNametagAvatar();
  closeProfilePicEditor();
}
function removeProfilePicture() { pfpEditTarget = 'profile'; pfpRemovePicture(); }
function removeShirtDesign() { pfpEditTarget = 'shirt'; pfpRemovePicture(); }
// ─── CHOOSE A REAL PICTURE (instead of drawing one) — reads a file the player picks with the
// browser's own file dialog (no permission concept applies; the browser only ever hands us bytes
// the player explicitly selected). Cropped to a square (cover-fit, so a rectangular photo doesn't
// get squished) and downscaled to 160x160 before saving, since the raw file could be several MB —
// this account blob autosaves through saveCurrentUser() constantly, including a POST to the
// server, so keeping it small matters a lot more here than for a one-off drawing.
function pfpChooseFile() { document.getElementById('pfpFileInput').click(); }
function pfpFileSelected(e) {
  const file = e.target.files[0];
  e.target.value = ''; // so picking the exact same file again still fires onchange next time
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const SIZE = 160;
      const out = document.createElement('canvas');
      out.width = SIZE; out.height = SIZE;
      const octx = out.getContext('2d');
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = 'high';
      const scale = Math.max(SIZE / img.width, SIZE / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      octx.drawImage(img, (SIZE - dw) / 2, (SIZE - dh) / 2, dw, dh);
      playerProfilePic = out.toDataURL('image/jpeg', 0.85);
      saveCurrentUser();
      refreshPreviews();
      refreshNametagAvatar();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
function pfpGetImage(dataUrl) {
  if (!_pfpImageCache[dataUrl]) {
    const img = new Image();
    // The image decodes async — by the time it's ready, drawAvatarCard() may already have run
    // once and drawn a blank square. Re-run the same redraws it would've done once it's real.
    img.onload = () => { refreshPreviews(); refreshNametagAvatar(); refreshShirtPaintTexture(); };
    img.src = dataUrl;
    _pfpImageCache[dataUrl] = img;
  }
  return _pfpImageCache[dataUrl];
}
// ─── SHIRT DESIGN — applies playerShirtPaint as a real THREE.js texture on the shirt mesh
// (BoxGeometry's default UVs map the full image onto every face, so the design shows on the
// front, back, and sides — like a sticker wrapped around the torso). Falls back to the plain
// shirt color captured in buildPlayer() when no design is set.
function refreshShirtPaintTexture() {
  if (!player || !player.torsoMesh) return;
  if (!playerShirtPaint) {
    player.torsoMesh.material.map = null;
    player.torsoMesh.material.color.setHex(player.torsoBaseColor);
    player.torsoMesh.material.needsUpdate = true;
    return;
  }
  const img = pfpGetImage(playerShirtPaint);
  if (!img.complete || !img.naturalWidth) return; // pfpGetImage's onload calls this again once ready
  const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
  const cctx = cv.getContext('2d');
  cctx.imageSmoothingEnabled = false;
  cctx.drawImage(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  player.torsoMesh.material.map = tex;
  player.torsoMesh.material.color.setHex(0xffffff); // white so the texture's own colors show true, not tinted
  player.torsoMesh.material.needsUpdate = true;
}
function refreshNametagAvatar() {
  if (player && player.nametag) player.nametag.material.map = new THREE.CanvasTexture(makeAvatarCanvas());
}

function drawAvatarCard(cv) {
  const c=cv.getContext('2d');
  if (playerProfilePic) {
    c.fillStyle='rgba(0,0,0,0.75)'; c.fillRect(0,0,96,152);
    c.strokeStyle='#e94560'; c.lineWidth=2; c.strokeRect(1,1,94,150);
    const img = pfpGetImage(playerProfilePic);
    c.imageSmoothingEnabled = false;
    if (img.complete && img.naturalWidth) c.drawImage(img, 8, 8, 80, 80);
    c.fillStyle='rgba(233,69,96,0.8)'; c.fillRect(0,132,96,20);
    c.fillStyle='#fff'; c.font='bold 9px Arial'; c.textAlign='center';
    c.fillText(playerName.slice(0,12), 48, 146);
    return;
  }
  const cx=48;
  const skin=rgb(playerColors.skin), shirtC=rgb(playerColors.shirt), hairC=rgb(playerColors.hair);
  const pantsC=rgb(playerColors.pants), shoeC=rgb(playerColors.shoes);

  // Background card
  c.fillStyle='rgba(0,0,0,0.75)'; c.fillRect(0,0,96,152);
  c.strokeStyle='#e94560'; c.lineWidth=2; c.strokeRect(1,1,94,150);

  // Shirt & arms
  c.fillStyle=playerShirt==='suit'?'#222':shirtC;
  c.fillRect(cx-20,80,40,36); c.fillRect(cx-28,82,10,24); c.fillRect(cx+18,82,10,24);
  if(playerShirt==='striped'){c.fillStyle='rgba(255,255,255,0.25)';for(let i=0;i<3;i++)c.fillRect(cx-20,82+i*9,40,5);}
  if(playerShirt==='suit'){c.fillStyle=shirtC;c.beginPath();c.moveTo(cx-8,80);c.lineTo(cx,90);c.lineTo(cx-8,102);c.closePath();c.fill();c.beginPath();c.moveTo(cx+8,80);c.lineTo(cx,90);c.lineTo(cx+8,102);c.closePath();c.fill();c.fillStyle='#cc2222';c.fillRect(cx-2,82,4,20);}
  // 15 new shirts — same accents as drawPreview() above, scaled to this canvas.
  if(playerShirt==='crewneck'){c.strokeStyle='rgba(0,0,0,0.3)';c.lineWidth=1.5;c.beginPath();c.arc(cx,80,7,0,Math.PI);c.stroke();}
  else if(playerShirt==='vneck'){c.fillStyle=skin;c.beginPath();c.moveTo(cx-6,80);c.lineTo(cx,92);c.lineTo(cx+6,80);c.closePath();c.fill();}
  else if(playerShirt==='flannel'){c.strokeStyle='rgba(0,0,0,0.3)';c.lineWidth=1.5;for(let i=0;i<3;i++){c.beginPath();c.moveTo(cx-20,84+i*10);c.lineTo(cx+20,84+i*10);c.stroke();}for(let i=0;i<3;i++){c.beginPath();c.moveTo(cx-14+i*14,80);c.lineTo(cx-14+i*14,116);c.stroke();}}
  else if(playerShirt==='polo'){c.fillStyle='#fff';c.beginPath();c.moveTo(cx-7,80);c.lineTo(cx,88);c.lineTo(cx-7,94);c.closePath();c.fill();c.beginPath();c.moveTo(cx+7,80);c.lineTo(cx,88);c.lineTo(cx+7,94);c.closePath();c.fill();}
  else if(playerShirt==='crop'){c.fillStyle='rgba(0,0,0,0.75)';c.fillRect(cx-20,106,40,10);}
  else if(playerShirt==='turtleneck'){c.fillRect(cx-8,74,16,8);}
  else if(playerShirt==='buttonup'){c.fillStyle='rgba(255,255,255,0.85)';c.beginPath();c.moveTo(cx-7,80);c.lineTo(cx,90);c.lineTo(cx-7,98);c.closePath();c.fill();c.beginPath();c.moveTo(cx+7,80);c.lineTo(cx,90);c.lineTo(cx+7,98);c.closePath();c.fill();}
  else if(playerShirt==='camo'){c.fillStyle='rgba(40,60,20,0.5)';[[cx-12,88],[cx+4,96],[cx-4,106]].forEach(([bx,by])=>{c.beginPath();c.ellipse(bx,by,7,5,0.4,0,Math.PI*2);c.fill();});}
  else if(playerShirt==='graphic'){c.fillStyle='#ffcc00';c.fillRect(cx-6,90,12,12);}
  else if(playerShirt==='raincoat'){c.fillStyle='rgba(255,255,255,0.3)';c.fillRect(cx-20,80,40,3);}
  else if(playerShirt==='denim'){c.strokeStyle='rgba(255,220,120,0.6)';c.lineWidth=1;c.beginPath();c.moveTo(cx-13,80);c.lineTo(cx-8,90);c.stroke();c.beginPath();c.moveTo(cx+13,80);c.lineTo(cx+8,90);c.stroke();}
  else if(playerShirt==='tuxedo'){c.fillStyle='#fff';c.beginPath();c.moveTo(cx-7,80);c.lineTo(cx,90);c.lineTo(cx-7,98);c.closePath();c.fill();c.beginPath();c.moveTo(cx+7,80);c.lineTo(cx,90);c.lineTo(cx+7,98);c.closePath();c.fill();c.fillStyle='#111';c.beginPath();c.moveTo(cx-4,81);c.lineTo(cx,84);c.lineTo(cx+4,81);c.lineTo(cx,88);c.closePath();c.fill();}
  else if(playerShirt==='sweater'){c.fillStyle='rgba(0,0,0,0.15)';for(let i=0;i<5;i++)c.fillRect(cx-20,84+i*5,40,2);}
  else if(playerShirt==='crophoodie'){c.fillStyle='rgba(0,0,0,0.75)';c.fillRect(cx-20,102,40,14);c.strokeStyle='rgba(0,0,0,0.3)';c.lineWidth=1.5;c.beginPath();c.moveTo(cx-5,80);c.lineTo(cx-3,92);c.stroke();}
  else if(playerShirt==='overshirt'){c.fillStyle=skin;c.fillRect(cx-12,84,24,30);}

  // Neck
  c.fillStyle=skin; c.fillRect(cx-5,68,10,14);

  // Long/afro/curly hair BEHIND head
  c.fillStyle=hairC;
  if(playerHair==='long'){c.fillRect(cx-22,34,8,46);c.fillRect(cx+14,34,8,46);}
  if(playerHair==='afro'){c.beginPath();c.ellipse(cx,40,24,24,0,0,Math.PI*2);c.fill();}
  if(playerHair==='curly'){for(let i=0;i<4;i++){c.beginPath();c.arc(cx-14+i*10,36,7,0,Math.PI*2);c.fill();}c.fillRect(cx-22,38,44,8);}
  if(playerHair==='ponytail'){c.fillRect(cx+16,38,7,36);}

  // Head
  c.fillStyle=skin; c.fillRect(cx-18,32,36,36);

  // Eyes
  c.fillStyle='#222'; c.fillRect(cx-10,42,7,7); c.fillRect(cx+3,42,7,7);
  c.fillStyle='#fff'; c.fillRect(cx-8,44,2,2); c.fillRect(cx+5,44,2,2);
  c.strokeStyle='#333'; c.lineWidth=1.5; c.beginPath(); c.arc(cx,54,5,0.2,Math.PI-0.2); c.stroke();

  // Hair on top
  c.fillStyle=hairC;
  if(playerHair==='short'){c.fillRect(cx-20,28,40,10);c.fillRect(cx-22,32,7,10);c.fillRect(cx+15,32,7,10);}
  if(playerHair==='spiky'){c.fillRect(cx-18,28,36,8);[-12,-6,0,6,12].forEach(sx=>{c.beginPath();c.moveTo(cx+sx-4,28);c.lineTo(cx+sx,13);c.lineTo(cx+sx+4,28);c.closePath();c.fill();});}
  if(playerHair==='ponytail'){c.fillRect(cx-20,28,40,10);}
  if(playerHair==='long'||playerHair==='curly'){c.fillRect(cx-20,28,40,10);}

  // Hat
  if(playerHat==='cap'){c.fillStyle='#dd3333';c.fillRect(cx-22,30,44,7);c.fillRect(cx-14,13,28,19);c.fillRect(cx+8,31,14,4);}
  else if(playerHat==='cowboy'){c.fillStyle='#8B4513';c.fillRect(cx-28,30,56,5);c.fillRect(cx-12,10,24,22);}
  else if(playerHat==='crown'){c.fillStyle='#FFD700';c.fillRect(cx-18,30,36,5);[[-14,6],[-7,0],[0,5],[7,0],[14,6]].forEach(([x2,y])=>c.fillRect(cx+x2-3,30-16+y,7,18-y));c.fillStyle='#e94560';c.fillRect(cx-3,14,6,6);}
  else if(playerHat==='helmet'){c.fillStyle='#555';c.fillRect(cx-22,15,44,20);c.fillRect(cx-20,11,40,8);c.fillStyle='rgba(100,200,255,0.4)';c.fillRect(cx-16,17,32,15);}
  else if(playerHat==='tophat'){c.fillStyle='#111';c.fillRect(cx-22,29,44,5);c.fillRect(cx-14,4,28,27);}
  else if(playerHat==='beanie'){c.fillStyle=shirtC;c.fillRect(cx-20,12,40,24);c.fillStyle='#fff';c.beginPath();c.arc(cx,12,7,0,Math.PI*2);c.fill();}
  else if(playerHat==='fedora'){c.fillStyle='#7a5c3a';c.fillRect(cx-26,29,52,5);c.fillRect(cx-14,9,28,22);c.fillStyle='#333';c.fillRect(cx-14,27,28,4);}
  else if(playerHat==='wizard'){c.fillStyle='#4444aa';c.beginPath();c.moveTo(cx,0);c.lineTo(cx-18,31);c.lineTo(cx+18,31);c.closePath();c.fill();c.fillRect(cx-26,29,52,6);}
  else if(playerHat==='pirate'){c.fillStyle='#111';c.fillRect(cx-24,29,48,6);c.fillRect(cx-16,8,32,23);c.fillStyle='#fff';c.beginPath();c.arc(cx,22,8,0,Math.PI*2);c.fill();c.fillStyle='#111';c.fillRect(cx-5,24,4,5);c.fillRect(cx+1,24,4,5);}
  else if(playerHat==='santa'){c.fillStyle='#dd2222';c.fillRect(cx-20,29,40,5);c.beginPath();c.moveTo(cx-16,29);c.lineTo(cx+7,3);c.lineTo(cx+18,29);c.closePath();c.fill();c.fillStyle='#fff';c.fillRect(cx-22,27,44,7);c.beginPath();c.arc(cx+9,4,5,0,Math.PI*2);c.fill();}
  // 15 new hats — same shapes as drawPreview() above, scaled down to this canvas's smaller head.
  else if(playerHat==='bandana')   { c.fillStyle='#cc3355'; c.fillRect(cx-16,15,32,7); c.beginPath(); c.moveTo(cx+14,18); c.lineTo(cx+22,14); c.lineTo(cx+22,22); c.closePath(); c.fill(); }
  else if(playerHat==='headband')  { c.fillStyle='#3388cc'; c.fillRect(cx-16,13,32,5); }
  else if(playerHat==='partyhat')  { c.fillStyle='#ffcc00'; c.beginPath(); c.moveTo(cx,-4); c.lineTo(cx-12,23); c.lineTo(cx+12,23); c.closePath(); c.fill(); c.fillStyle='#ff3366'; c.beginPath(); c.arc(cx,-2,3,0,Math.PI*2); c.fill(); }
  else if(playerHat==='bucket')    { c.fillStyle='#4a7a4a'; c.fillRect(cx-22,21,44,5); c.fillRect(cx-13,10,26,14); }
  else if(playerHat==='jester')    { c.fillStyle='#8833cc'; [-10,0,10].forEach((jx,i)=>{c.beginPath();c.moveTo(cx+jx-6,23);c.lineTo(cx+jx,23-17-i%2*4);c.lineTo(cx+jx+6,23);c.closePath();c.fill();}); c.fillRect(cx-14,21,28,4); }
  else if(playerHat==='viking')    { c.fillStyle='#999999'; c.fillRect(cx-11,13,22,13); c.fillStyle='#eeeecc'; c.beginPath(); c.moveTo(cx-11,14); c.lineTo(cx-21,4); c.lineTo(cx-15,16); c.closePath(); c.fill(); c.beginPath(); c.moveTo(cx+11,14); c.lineTo(cx+21,4); c.lineTo(cx+15,16); c.closePath(); c.fill(); }
  else if(playerHat==='graduation'){ c.fillStyle='#111111'; c.fillRect(cx-11,14,22,12); c.fillRect(cx-18,10,36,4); c.strokeStyle='#FFD700'; c.lineWidth=1.5; c.beginPath(); c.moveTo(cx+15,11); c.lineTo(cx+15,24); c.stroke(); }
  else if(playerHat==='flower')    { c.fillStyle='#2d7a2d'; c.fillRect(cx-14,13,28,5); ['#ff69b4','#ffcc00','#ff6688','#cc88ff','#ffffff'].forEach((col,i)=>{c.fillStyle=col;c.beginPath();c.arc(cx-11+i*5.5,14,3,0,Math.PI*2);c.fill();}); }
  else if(playerHat==='backwards') { c.fillStyle='#3355aa'; c.fillRect(cx-11,10,22,14); c.fillRect(cx-11,21,22,4); c.fillRect(cx-4,7,8,6); }
  else if(playerHat==='sombrero')  { c.fillStyle='#d4a860'; c.fillRect(cx-26,21,52,4); c.fillRect(cx-11,7,22,15); c.fillStyle='#a8763a'; c.fillRect(cx-26,21,52,2); }
  else if(playerHat==='propeller') { c.fillStyle='#dd4444'; c.fillRect(cx-14,11,28,15); c.fillStyle='#888'; c.fillRect(cx-1,7,3,6); c.fillStyle='#ccc'; c.fillRect(cx-10,7,20,2); }
  else if(playerHat==='antlers')   { c.fillStyle=hairC; c.fillRect(cx-12,11,24,13); c.fillStyle='#8B5A2B'; [-10,10].forEach(ax=>{c.fillRect(cx+ax-1,-4,3,15); c.fillRect(cx+ax-6,2,6,2); c.fillRect(cx+ax,7,6,2);}); }
  else if(playerHat==='headphones'){ c.fillStyle='#222222'; c.fillRect(cx-17,14,4,11); c.fillRect(cx+13,14,4,11); c.fillRect(cx-15,6,30,5); }
  else if(playerHat==='chef')      { c.fillStyle='#ffffff'; c.fillRect(cx-12,18,24,7); c.beginPath(); c.ellipse(cx,9,14,11,0,0,Math.PI*2); c.fill(); }
  else if(playerHat==='turban')    { c.fillStyle='#8833aa'; c.beginPath(); c.ellipse(cx,14,15,12,0,0,Math.PI*2); c.fill(); c.fillStyle='#ffcc00'; c.beginPath(); c.arc(cx,7,3,0,Math.PI*2); c.fill(); }

  // Pants & shoes — real match to the character's actual customization, not just the shirt/hair
  // colors this card already used. Drawn in the space freed by growing the card 24px taller
  // (128->152) rather than shrinking the existing head/hat/shirt layout, so none of the 25 hat
  // branches or 15 shirt-accent branches above needed their hand-tuned coordinates touched.
  c.fillStyle=pantsC; c.fillRect(cx-18,116,36,10);
  c.fillStyle=shoeC;  c.fillRect(cx-18,126,36,6);

  // Name + gold bar at bottom
  c.fillStyle='rgba(233,69,96,0.8)'; c.fillRect(0,132,96,20);
  c.fillStyle='#fff'; c.font='bold 9px Arial'; c.textAlign='center';
  c.fillText(playerName.slice(0,12), cx, 146);
}

function makeAvatarCanvas() {
  const cv=document.createElement('canvas'); cv.width=96; cv.height=152;
  drawAvatarCard(cv); return cv;
}

// ─── PLAYER CHARACTER ─────────────────────────────────────────────────────────
function c3(h) { return parseInt(h.replace('#',''),16); }

function buildPlayer() {
  // Real fix: buildPlayer() is called more than once (e.g. equipping a shirtId item, and now
  // the new Dress Up Party add-ons) but never removed the previous group first — leaving a stale
  // ghost copy of the character behind in the scene at the old position. Guard it here once so
  // every caller, old and new, rebuilds cleanly instead of duplicating.
  if(scene && playerGroup) scene.remove(playerGroup);
  playerGroup = new THREE.Group();
  player = {};
  const skin=c3(playerColors.skin), shirt=c3(playerColors.shirt);
  const pants=c3(playerColors.pants), shoes=c3(playerColors.shoes), hairC=c3(playerColors.hair);

  const skinMeshes = [];
  const mk=(w,h,d,color,x,y,z)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
    m.position.set(x,y,z); m.castShadow=true; playerGroup.add(m);
    if(color===skin) skinMeshes.push(m); // tags every skin-colored part real-time body paint can recolor live
    return m;
  };

  // Head & eyes
  player.headMesh = mk(1,1,1, skin, 0,2.8,0);
  const em=new THREE.MeshBasicMaterial({color:0x111111});
  [-0.22,0.22].forEach(ex=>{const e=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.14,0.05),em);e.position.set(ex,2.85,0.51);playerGroup.add(e);});

  // Hair
  if(playerHair==='short')    { mk(1.08,0.3,0.95,hairC,0,3.35,0); mk(0.25,0.5,0.9,hairC,-0.6,3.1,0); mk(0.25,0.5,0.9,hairC,0.6,3.1,0); }
  else if(playerHair==='long'){ mk(1.08,0.3,0.95,hairC,0,3.35,0); mk(0.28,1.4,0.9,hairC,-0.6,2.4,0); mk(0.28,1.4,0.9,hairC,0.6,2.4,0); mk(0.9,1.4,0.28,hairC,0,2.4,-0.5); }
  else if(playerHair==='spiky'){ mk(1.1,0.2,1.0,hairC,0,3.35,0); [-0.35,-0.17,0,0.17,0.35].forEach((sx,i)=>mk(0.18,0.5+i%2*0.2,0.18,hairC,sx,3.7+i%2*0.1,0)); }
  else if(playerHair==='afro') { mk(1.5,1.4,1.4,hairC,0,3.1,0); }
  else if(playerHair==='ponytail'){ mk(1.08,0.3,0.95,hairC,0,3.35,0); mk(0.25,0.5,0.9,hairC,-0.6,3.1,0); mk(0.28,1.8,0.28,hairC,0,2.2,-0.5); }
  else if(playerHair==='curly'){ [-0.3,0,0.3].forEach(cx2=>mk(0.5,0.55,0.5,hairC,cx2,3.4,0)); mk(0.28,1.2,0.28,hairC,-0.6,2.7,0); mk(0.28,1.2,0.28,hairC,0.6,2.7,0); }

  // Hat
  if(playerHat==='cap')     { mk(1.2,0.15,1.2,0xee4444,0,3.35,0); mk(0.9,0.5,0.8,0xee4444,0,3.63,-0.05); mk(0.5,0.12,0.4,0xee4444,0,3.28,0.7); }
  else if(playerHat==='cowboy'){ mk(1.7,0.12,1.7,0x8B4513,0,3.32,0); mk(0.9,0.7,0.9,0x8B4513,0,3.72,0); }
  else if(playerHat==='crown'){ mk(1.1,0.28,1.1,0xFFD700,0,3.35,0); [-0.35,0,0.35].forEach((cx2,i)=>mk(0.22,0.4+i%2*0.15,0.22,0xFFD700,cx2,3.7,0)); }
  else if(playerHat==='helmet'){ mk(1.15,0.85,1.15,0x555555,0,3.48,0); mk(0.7,0.3,0.15,0x88ccff,0,3.22,0.56); }
  else if(playerHat==='tophat'){ mk(1.35,0.1,1.35,0x111111,0,3.32,0); mk(0.9,0.9,0.9,0x111111,0,3.8,0); mk(0.92,0.08,0.92,0x333333,0,3.38,0); }
  else if(playerHat==='beanie'){ mk(1.05,0.7,1.05,shirt,0,3.5,0); mk(0.35,0.35,0.35,0xffffff,0,3.92,0); }
  else if(playerHat==='fedora'){ mk(1.5,0.1,1.5,0x7a5c3a,0,3.32,0); mk(0.9,0.65,0.9,0x7a5c3a,0,3.65,0); mk(0.91,0.08,0.91,0x333333,0,3.37,0); }
  else if(playerHat==='wizard'){ const w=new THREE.Mesh(new THREE.ConeGeometry(0.6,1.8,8),new THREE.MeshLambertMaterial({color:0x4444aa}));w.position.set(0,3.9,0);playerGroup.add(w); mk(1.3,0.12,1.3,0x4444aa,0,3.32,0); }
  else if(playerHat==='pirate'){ mk(1.4,0.1,1.4,0x111111,0,3.32,0); mk(0.9,0.6,0.5,0x111111,0,3.66,0); mk(0.3,0.3,0.15,0xffffff,0,3.7,0.3); }
  else if(playerHat==='santa') { mk(1.1,0.2,1.1,0xffffff,0,3.32,0); const cn=new THREE.Mesh(new THREE.ConeGeometry(0.5,1.0,8),new THREE.MeshLambertMaterial({color:0xdd2222}));cn.position.set(0.1,3.88,0);playerGroup.add(cn); mk(0.25,0.25,0.25,0xffffff,0.45,4.32,0); }
  // 15 new hats — real distinct meshes, same shape-language as the ones above.
  else if(playerHat==='bandana')   { mk(1.15,0.15,1.15,0xcc3355,0,3.32,0); mk(0.3,0.3,0.1,0xcc3355,0,3.2,-0.6); }
  else if(playerHat==='headband')  { mk(1.15,0.15,1.15,0x3388cc,0,3.35,0); }
  else if(playerHat==='partyhat')  { const ph=new THREE.Mesh(new THREE.ConeGeometry(0.55,1.3,8),new THREE.MeshLambertMaterial({color:0xffcc00}));ph.position.set(0,4.0,0);playerGroup.add(ph); mk(0.15,0.15,0.15,0xff3366,0,4.68,0); }
  else if(playerHat==='bucket')    { mk(1.5,0.15,1.5,0x4a7a4a,0,3.36,0); mk(0.9,0.5,0.9,0x4a7a4a,0,3.65,0); }
  else if(playerHat==='jester')    { mk(1.15,0.15,1.15,0x8833cc,0,3.35,0); [-0.35,0,0.35].forEach((jx,i)=>{const jc=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.5+i%2*0.2,4),new THREE.MeshLambertMaterial({color:0x8833cc}));jc.position.set(jx,3.7+i%2*0.1,0);playerGroup.add(jc);}); }
  else if(playerHat==='viking')    { mk(1.15,0.7,1.15,0x999999,0,3.5,0); const hL=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.6,6),new THREE.MeshLambertMaterial({color:0xeeeecc}));hL.position.set(-0.6,3.9,0);hL.rotation.z=0.5;playerGroup.add(hL); const hR=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.6,6),new THREE.MeshLambertMaterial({color:0xeeeecc}));hR.position.set(0.6,3.9,0);hR.rotation.z=-0.5;playerGroup.add(hR); }
  else if(playerHat==='graduation'){ mk(1.4,0.1,1.4,0x111111,0,3.6,0); mk(0.9,0.5,0.9,0x111111,0,3.35,0); mk(0.06,0.4,0.06,0xFFD700,0.6,3.5,0); }
  else if(playerHat==='flower')    { mk(1.15,0.15,1.15,0x2d7a2d,0,3.35,0); ['#ff69b4','#ffcc00','#ff6688','#cc88ff','#ffffff'].forEach((col,i)=>{const a2=i*Math.PI*2/5; mk(0.16,0.16,0.16,parseInt(col.slice(1),16),Math.cos(a2)*0.55,3.4,Math.sin(a2)*0.55);}); }
  else if(playerHat==='backwards') { mk(1.2,0.5,0.8,0x3355aa,0,3.63,0.05); mk(0.5,0.12,0.4,0x3355aa,0,3.28,-0.7); }
  else if(playerHat==='sombrero')  { mk(2.2,0.12,2.2,0xd4a860,0,3.35,0); mk(0.9,0.7,0.9,0xd4a860,0,3.75,0); }
  else if(playerHat==='propeller') { mk(1.05,0.7,1.05,0xdd4444,0,3.5,0); mk(0.7,0.06,0.12,0xcccccc,0,3.95,0); mk(0.1,0.15,0.1,0x888888,0,3.9,0); }
  else if(playerHat==='antlers')   { mk(1.1,0.7,1.1,hairC,0,3.5,0); [-0.4,0.4].forEach(ax=>{ mk(0.1,0.7,0.1,0x8B5A2B,ax,4.0,0); mk(0.3,0.1,0.1,0x8B5A2B,ax-0.15,3.85,0); mk(0.3,0.1,0.1,0x8B5A2B,ax+0.15,4.15,0); }); }
  else if(playerHat==='headphones'){ mk(0.18,0.5,0.5,0x222222,-0.62,3.15,0); mk(0.18,0.5,0.5,0x222222,0.62,3.15,0); mk(1.3,0.12,0.2,0x222222,0,3.75,0); }
  else if(playerHat==='chef')      { mk(1.0,0.3,1.0,0xffffff,0,3.45,0); mk(0.8,0.7,0.8,0xffffff,0,3.95,0); }
  else if(playerHat==='turban')    { mk(1.1,0.7,1.1,0x8833aa,0,3.55,0); mk(0.16,0.16,0.16,0xffcc00,0,3.95,0.4); }

  // Body & arms
  const bCol = playerShirt==='suit' ? 0x222222 : shirt;
  const aCol = playerShirt==='tanktop' ? skin : bCol;
  player.torsoMesh = mk(0.9,1.1,0.5, bCol, 0,1.75,0);
  player.torsoBaseColor = bCol;
  refreshShirtPaintTexture();
  player.lArm = mk(0.35,0.9,0.35, aCol,-0.65,1.75,0);
  player.rArm = mk(0.35,0.9,0.35, aCol, 0.65,1.75,0);
  mk(0.37,0.28,0.37, skin,-0.65,1.22,0); mk(0.37,0.28,0.37, skin,0.65,1.22,0);
  // 15 new shirts — real distinct accent meshes on top of the shared torso/arm shape above.
  if(playerShirt==='crop')          { mk(0.94,0.3,0.54, skin, 0,1.35,0); }
  else if(playerShirt==='vneck')    { mk(0.15,0.25,0.1, skin, 0,2.15,0.26); }
  else if(playerShirt==='crewneck') { mk(0.45,0.1,0.45, bCol, 0,2.3,0); }
  else if(playerShirt==='turtleneck'){ mk(0.5,0.22,0.5, bCol, 0,2.35,0); }
  else if(playerShirt==='polo')     { mk(0.5,0.1,0.1, 0xffffff, 0,2.15,0.26); }
  else if(playerShirt==='tuxedo')   { mk(0.5,0.1,0.1, 0xffffff, 0,2.15,0.26); mk(0.12,0.12,0.1, 0x111111, 0,2.2,0.3); }
  else if(playerShirt==='sweater')  { for(let i=0;i<3;i++) mk(0.92,0.06,0.52, 0x000000, 0,1.5+i*0.25,0.001); }
  else if(playerShirt==='raincoat') { mk(1.0,1.3,0.56, bCol, 0,1.7,0); mk(0.3,0.12,0.5, 0xffffff, 0,2.3,0); }
  else if(playerShirt==='denim')    { mk(0.15,0.5,0.05, 0xffdc78, -0.35,1.9,0.26); mk(0.15,0.5,0.05, 0xffdc78, 0.35,1.9,0.26); }
  else if(playerShirt==='camo')     { mk(0.3,0.3,0.1, 0x2a3a14, -0.2,1.9,0.26); mk(0.25,0.25,0.1, 0x3a4a1a, 0.2,1.6,0.26); }
  else if(playerShirt==='graphic')  { mk(0.3,0.3,0.05, 0xffcc00, 0,1.7,0.26); }
  else if(playerShirt==='flannel')  { for(let i=0;i<3;i++) mk(0.92,0.06,0.52, 0x000000, 0,1.5+i*0.25,0.001); mk(0.06,1.0,0.52, 0x000000, -0.2,1.75,0.001); }
  else if(playerShirt==='buttonup') { for(let i=0;i<4;i++) mk(0.06,0.06,0.06, 0x333333, 0,2.15-i*0.2,0.26); }
  else if(playerShirt==='crophoodie'){ mk(0.94,0.3,0.54, skin, 0,1.35,0); mk(0.08,0.4,0.08, bCol, -0.15,2.15,0.26); mk(0.08,0.4,0.08, bCol, 0.15,2.15,0.26); }
  else if(playerShirt==='overshirt'){ mk(0.5,1.1,0.1, skin, 0,1.75,0.26); }

  // Legs
  const legH = playerPants==='shorts' ? 0.5 : playerPants==='capri' ? 0.75 : 0.9;
  const legY = playerPants==='shorts' ? 0.9 : playerPants==='capri' ? 0.72 : 0.75;
  player.lLeg = mk(0.38,legH,0.38, pants,-0.22,legY,0);
  player.rLeg = mk(0.38,legH,0.38, pants, 0.22,legY,0);
  if(playerPants==='shorts'){mk(0.38,0.45,0.38,skin,-0.22,0.32,0);mk(0.38,0.45,0.38,skin,0.22,0.32,0);}
  if(playerPants==='cargo'){mk(0.15,0.25,0.4,0x333333,-0.38,0.9,0.1);mk(0.15,0.25,0.4,0x333333,0.38,0.9,0.1);}
  // 10 new pants — real distinct accents/shapes on the shared leg meshes above.
  if(playerPants==='capri')          { mk(0.4,0.2,0.4,skin,-0.22,0.42,0); mk(0.4,0.2,0.4,skin,0.22,0.42,0); }
  else if(playerPants==='leggings')  { mk(0.06,0.9,0.06,0x000000,-0.22,0.75,0.19); mk(0.06,0.9,0.06,0x000000,0.22,0.75,0.19); }
  else if(playerPants==='plaid')     { for(let i=0;i<3;i++) mk(0.4,0.06,0.4,0x000000,-0.22,0.5+i*0.25,0); for(let i=0;i<3;i++) mk(0.4,0.06,0.4,0x000000,0.22,0.5+i*0.25,0); }
  else if(playerPants==='bellbottom'){ mk(0.55,0.2,0.42,pants,-0.22,0.35,0); mk(0.55,0.2,0.42,pants,0.22,0.35,0); }
  else if(playerPants==='camopants') { mk(0.2,0.2,0.2,0x3a4a1a,-0.22,0.9,0.15); mk(0.2,0.2,0.2,0x2a3a14,0.22,0.6,0.15); }
  else if(playerPants==='skinny')    { mk(0.06,0.9,0.06,0x000000,-0.24,0.75,0); mk(0.06,0.9,0.06,0x000000,0.24,0.75,0); }
  else if(playerPants==='sweatpants'){ mk(0.4,0.1,0.4,0xffffff,-0.22,0.32,0); mk(0.4,0.1,0.4,0xffffff,0.22,0.32,0); }
  else if(playerPants==='overalls')  { mk(0.9,0.6,0.5,pants,0,1.5,0); mk(0.1,0.4,0.1,pants,-0.3,2.0,0); mk(0.1,0.4,0.1,pants,0.3,2.0,0); }
  else if(playerPants==='skirt' || playerPants==='kilt') { const sk=new THREE.Mesh(new THREE.ConeGeometry(0.55,0.65,4),new THREE.MeshLambertMaterial({color:pants})); sk.position.set(0,0.65,0); sk.rotation.y=Math.PI/4; playerGroup.add(sk); }

  // Shoes
  const shoeC=c3(playerColors.shoes);
  const shH=playerShoes==='boots'?0.45:playerShoes==='rainboots'?0.6:playerShoes==='cowboyboots'?0.55:playerShoes==='platform'?0.3:0.22;
  const shY=playerShoes==='boots'?0.18:playerShoes==='rainboots'?0.28:playerShoes==='cowboyboots'?0.25:playerShoes==='platform'?0.13:0.1;
  const shD=playerShoes==='sandals'?0.6:playerShoes==='flipflops'?0.55:0.52;
  mk(0.42,shH,shD, shoeC,-0.22,shY,0.05);
  mk(0.42,shH,shD, shoeC, 0.22,shY,0.05);
  if(playerShoes==='hightop'){mk(0.43,0.3,0.53,shoeC,-0.22,0.32,0.04);mk(0.43,0.3,0.53,shoeC,0.22,0.32,0.04);}
  // 6 more new shoes — real distinct accents (flipflops/rainboots/cowboyboots/platform already
  // handled above via shH/shY/shD).
  else if(playerShoes==='cleats')   { mk(0.06,0.06,0.06,0x222222,-0.3,0.02,0.2); mk(0.06,0.06,0.06,0x222222,0.3,0.02,0.2); }
  else if(playerShoes==='slippers') { mk(0.05,0.05,0.2,0xffffff,-0.22,0.2,0.2); mk(0.05,0.05,0.2,0xffffff,0.22,0.2,0.2); }
  else if(playerShoes==='crocs')    { mk(0.1,0.15,0.1,0x000000,-0.22,0.2,0.15); mk(0.1,0.15,0.1,0x000000,0.22,0.2,0.15); }
  else if(playerShoes==='wedges')   { mk(0.4,0.15,0.5,shoeC,-0.22,0.02,0.05); mk(0.4,0.15,0.5,shoeC,0.22,0.02,0.05); }
  else if(playerShoes==='moccasins'){ mk(0.1,0.05,0.4,0x6b4423,-0.22,0.22,0.05); mk(0.1,0.05,0.4,0x6b4423,0.22,0.22,0.05); }
  else if(playerShoes==='skates')   { mk(0.42,0.1,0.55,0x888888,-0.22,0.02,0.08); mk(0.42,0.1,0.55,0x888888,0.22,0.02,0.08); }

  player.skinMeshes = skinMeshes;

  // Weapon
  player.weaponGroup = null;
  updateWeaponMesh();

  // Armor
  player.armorMesh = null;
  updateArmorMesh();

  // Avatar picture nametag
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.6625),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(makeAvatarCanvas()),transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  tag.position.y=4.8; playerGroup.add(tag); player.nametag=tag;

  playerGroup.position.set(0,0,15);
  scene.add(playerGroup);
}

// ─── MULTIPLAYER: OTHER PLAYERS ──────────────────────────────────────────────
// A simplified, parameterized cousin of buildPlayer() — builds into its OWN
// group instead of the global playerGroup, so it never touches the local
// player's own avatar/weapon/armor state. Deliberately skips weapon/armor
// meshes (not worth the wire cost for a same-second-ish sync) and uses a
// plain text nametag instead of the heavier avatar-canvas one.
function buildOtherPlayerAvatar(a) {
  const g = new THREE.Group();
  const skin=c3(a.skin||'#f5c89a'), shirtC=c3(a.shirtColor||'#2196F3');
  const pantsC=c3(a.pantsColor||'#333333'), shoeC=c3(a.shoesColor||'#4e3b2a'), hairC=c3(a.hairColor||'#3a1f0a');
  const mk=(w,h,d,color,x,y,z)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
    m.position.set(x,y,z); m.castShadow=true; g.add(m); return m;
  };
  mk(1,1,1, skin, 0,2.8,0); // head
  const em=new THREE.MeshBasicMaterial({color:0x111111});
  [-0.22,0.22].forEach(ex=>{const e=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.14,0.05),em);e.position.set(ex,2.85,0.51);g.add(e);});
  const hair = a.hair||'none';
  if(hair==='short')    { mk(1.08,0.3,0.95,hairC,0,3.35,0); mk(0.25,0.5,0.9,hairC,-0.6,3.1,0); mk(0.25,0.5,0.9,hairC,0.6,3.1,0); }
  else if(hair==='long'){ mk(1.08,0.3,0.95,hairC,0,3.35,0); mk(0.28,1.4,0.9,hairC,-0.6,2.4,0); mk(0.28,1.4,0.9,hairC,0.6,2.4,0); mk(0.9,1.4,0.28,hairC,0,2.4,-0.5); }
  else if(hair==='spiky'){ mk(1.1,0.2,1.0,hairC,0,3.35,0); [-0.35,-0.17,0,0.17,0.35].forEach((sx,i)=>mk(0.18,0.5+i%2*0.2,0.18,hairC,sx,3.7+i%2*0.1,0)); }
  else if(hair==='afro') { mk(1.5,1.4,1.4,hairC,0,3.1,0); }
  else if(hair==='ponytail'){ mk(1.08,0.3,0.95,hairC,0,3.35,0); mk(0.25,0.5,0.9,hairC,-0.6,3.1,0); mk(0.28,1.8,0.28,hairC,0,2.2,-0.5); }
  else if(hair==='curly'){ [-0.3,0,0.3].forEach(cx2=>mk(0.5,0.55,0.5,hairC,cx2,3.4,0)); mk(0.28,1.2,0.28,hairC,-0.6,2.7,0); mk(0.28,1.2,0.28,hairC,0.6,2.7,0); }
  const bCol = a.shirt==='suit' ? 0x222222 : shirtC;
  const aCol = a.shirt==='tanktop' ? skin : bCol;
  mk(0.9,1.1,0.5, bCol, 0,1.75,0);
  g.lArm = mk(0.35,0.9,0.35, aCol,-0.65,1.75,0);
  g.rArm = mk(0.35,0.9,0.35, aCol, 0.65,1.75,0);
  mk(0.37,0.28,0.37, skin,-0.65,1.22,0); mk(0.37,0.28,0.37, skin,0.65,1.22,0);
  const legH = a.pants==='shorts' ? 0.5 : 0.9;
  const legY = a.pants==='shorts' ? 0.9 : 0.75;
  g.lLeg = mk(0.38,legH,0.38, pantsC,-0.22,legY,0);
  g.rLeg = mk(0.38,legH,0.38, pantsC, 0.22,legY,0);
  const shH=a.shoes==='boots'?0.45:0.22, shY=a.shoes==='boots'?0.18:0.1;
  mk(0.42,shH,a.shoes==='sandals'?0.6:0.52, shoeC,-0.22,shY,0.05);
  mk(0.42,shH,a.shoes==='sandals'?0.6:0.52, shoeC, 0.22,shY,0.05);

  const cv=document.createElement('canvas'); cv.width=256; cv.height=64;
  const cx2=cv.getContext('2d');
  cx2.fillStyle='rgba(0,0,0,0.55)'; cx2.fillRect(0,16,256,32);
  cx2.fillStyle='#fff'; cx2.font='bold 26px Arial'; cx2.textAlign='center';
  cx2.fillText((a.name||'Player').slice(0,16), 128, 40);
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(2.4,0.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  tag.position.y=4.6; g.add(tag); g.nametag=tag;

  return g;
}

// Builds an isolated preview character for the shop "Preview" buttons (weapons/armor/outfits/
// paint) — the same safe build-into-your-own-group pattern as buildOtherPlayerAvatar() above,
// so trying something on never touches the real playerGroup, never gets saved, and — important
// for a live multiplayer game — never reaches syncPresence(), which broadcasts playerColors to
// every other online player once a second. Defaults to the real player's current look; pass just
// the one property being tried on in `overrides` (e.g. {weapon:'sword'} or {shirt:'#2196F3'}).
function buildPreviewAvatar(overrides) {
  overrides = overrides || {};
  const g = new THREE.Group();
  const skin=c3(overrides.skin || playerColors.skin);
  const shirtC=c3(overrides.shirt || playerColors.shirt);
  const pantsC=c3(overrides.pants || playerColors.pants);
  const shoeC=c3(overrides.shoes || playerColors.shoes);
  const hairC=c3(playerColors.hair);
  const mk=(w,h,d,color,x,y,z)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
    m.position.set(x,y,z); g.add(m); return m;
  };
  mk(1,1,1, skin, 0,2.8,0); // head
  const em=new THREE.MeshBasicMaterial({color:0x111111});
  [-0.22,0.22].forEach(ex=>{const e=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.14,0.05),em);e.position.set(ex,2.85,0.51);g.add(e);});
  const hair = playerHair;
  if(hair==='short')    { mk(1.08,0.3,0.95,hairC,0,3.35,0); mk(0.25,0.5,0.9,hairC,-0.6,3.1,0); mk(0.25,0.5,0.9,hairC,0.6,3.1,0); }
  else if(hair==='long'){ mk(1.08,0.3,0.95,hairC,0,3.35,0); mk(0.28,1.4,0.9,hairC,-0.6,2.4,0); mk(0.28,1.4,0.9,hairC,0.6,2.4,0); mk(0.9,1.4,0.28,hairC,0,2.4,-0.5); }
  else if(hair==='spiky'){ mk(1.1,0.2,1.0,hairC,0,3.35,0); [-0.35,-0.17,0,0.17,0.35].forEach((sx,i)=>mk(0.18,0.5+i%2*0.2,0.18,hairC,sx,3.7+i%2*0.1,0)); }
  else if(hair==='afro') { mk(1.5,1.4,1.4,hairC,0,3.1,0); }
  else if(hair==='ponytail'){ mk(1.08,0.3,0.95,hairC,0,3.35,0); mk(0.25,0.5,0.9,hairC,-0.6,3.1,0); mk(0.28,1.8,0.28,hairC,0,2.2,-0.5); }
  else if(hair==='curly'){ [-0.3,0,0.3].forEach(cx2=>mk(0.5,0.55,0.5,hairC,cx2,3.4,0)); mk(0.28,1.2,0.28,hairC,-0.6,2.7,0); mk(0.28,1.2,0.28,hairC,0.6,2.7,0); }
  // Hat — same style set as buildPlayer(), built into this isolated preview group instead.
  const hat = playerHat;
  if(hat==='cap')     { mk(1.2,0.15,1.2,0xee4444,0,3.35,0); mk(0.9,0.5,0.8,0xee4444,0,3.63,-0.05); mk(0.5,0.12,0.4,0xee4444,0,3.28,0.7); }
  else if(hat==='cowboy'){ mk(1.7,0.12,1.7,0x8B4513,0,3.32,0); mk(0.9,0.7,0.9,0x8B4513,0,3.72,0); }
  else if(hat==='crown'){ mk(1.1,0.28,1.1,0xFFD700,0,3.35,0); [-0.35,0,0.35].forEach((cx2,i)=>mk(0.22,0.4+i%2*0.15,0.22,0xFFD700,cx2,3.7,0)); }
  else if(hat==='helmet'){ mk(1.15,0.85,1.15,0x555555,0,3.48,0); mk(0.7,0.3,0.15,0x88ccff,0,3.22,0.56); }
  else if(hat==='tophat'){ mk(1.35,0.1,1.35,0x111111,0,3.32,0); mk(0.9,0.9,0.9,0x111111,0,3.8,0); mk(0.92,0.08,0.92,0x333333,0,3.38,0); }
  else if(hat==='beanie'){ mk(1.05,0.7,1.05,shirtC,0,3.5,0); mk(0.35,0.35,0.35,0xffffff,0,3.92,0); }
  else if(hat==='fedora'){ mk(1.5,0.1,1.5,0x7a5c3a,0,3.32,0); mk(0.9,0.65,0.9,0x7a5c3a,0,3.65,0); mk(0.91,0.08,0.91,0x333333,0,3.37,0); }
  else if(hat==='wizard'){ const w=new THREE.Mesh(new THREE.ConeGeometry(0.6,1.8,8),new THREE.MeshLambertMaterial({color:0x4444aa}));w.position.set(0,3.9,0);g.add(w); mk(1.3,0.12,1.3,0x4444aa,0,3.32,0); }
  else if(hat==='pirate'){ mk(1.4,0.1,1.4,0x111111,0,3.32,0); mk(0.9,0.6,0.5,0x111111,0,3.66,0); mk(0.3,0.3,0.15,0xffffff,0,3.7,0.3); }
  else if(hat==='santa') { mk(1.1,0.2,1.1,0xffffff,0,3.32,0); const cn=new THREE.Mesh(new THREE.ConeGeometry(0.5,1.0,8),new THREE.MeshLambertMaterial({color:0xdd2222}));cn.position.set(0.1,3.88,0);g.add(cn); mk(0.25,0.25,0.25,0xffffff,0.45,4.32,0); }
  else if(hat==='bandana')   { mk(1.15,0.15,1.15,0xcc3355,0,3.32,0); mk(0.3,0.3,0.1,0xcc3355,0,3.2,-0.6); }
  else if(hat==='headband')  { mk(1.15,0.15,1.15,0x3388cc,0,3.35,0); }
  else if(hat==='partyhat')  { const ph=new THREE.Mesh(new THREE.ConeGeometry(0.55,1.3,8),new THREE.MeshLambertMaterial({color:0xffcc00}));ph.position.set(0,4.0,0);g.add(ph); mk(0.15,0.15,0.15,0xff3366,0,4.68,0); }
  else if(hat==='bucket')    { mk(1.5,0.15,1.5,0x4a7a4a,0,3.36,0); mk(0.9,0.5,0.9,0x4a7a4a,0,3.65,0); }
  else if(hat==='jester')    { mk(1.15,0.15,1.15,0x8833cc,0,3.35,0); [-0.35,0,0.35].forEach((jx,i)=>{const jc=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.5+i%2*0.2,4),new THREE.MeshLambertMaterial({color:0x8833cc}));jc.position.set(jx,3.7+i%2*0.1,0);g.add(jc);}); }
  else if(hat==='viking')    { mk(1.15,0.7,1.15,0x999999,0,3.5,0); const hL=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.6,6),new THREE.MeshLambertMaterial({color:0xeeeecc}));hL.position.set(-0.6,3.9,0);hL.rotation.z=0.5;g.add(hL); const hR=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.6,6),new THREE.MeshLambertMaterial({color:0xeeeecc}));hR.position.set(0.6,3.9,0);hR.rotation.z=-0.5;g.add(hR); }
  else if(hat==='graduation'){ mk(1.4,0.1,1.4,0x111111,0,3.6,0); mk(0.9,0.5,0.9,0x111111,0,3.35,0); mk(0.06,0.4,0.06,0xFFD700,0.6,3.5,0); }
  else if(hat==='flower')    { mk(1.15,0.15,1.15,0x2d7a2d,0,3.35,0); ['#ff69b4','#ffcc00','#ff6688','#cc88ff','#ffffff'].forEach((col,i)=>{const a2=i*Math.PI*2/5; mk(0.16,0.16,0.16,parseInt(col.slice(1),16),Math.cos(a2)*0.55,3.4,Math.sin(a2)*0.55);}); }
  else if(hat==='backwards') { mk(1.2,0.5,0.8,0x3355aa,0,3.63,0.05); mk(0.5,0.12,0.4,0x3355aa,0,3.28,-0.7); }
  else if(hat==='sombrero')  { mk(2.2,0.12,2.2,0xd4a860,0,3.35,0); mk(0.9,0.7,0.9,0xd4a860,0,3.75,0); }
  else if(hat==='propeller') { mk(1.05,0.7,1.05,0xdd4444,0,3.5,0); mk(0.7,0.06,0.12,0xcccccc,0,3.95,0); mk(0.1,0.15,0.1,0x888888,0,3.9,0); }
  else if(hat==='antlers')   { mk(1.1,0.7,1.1,hairC,0,3.5,0); [-0.4,0.4].forEach(ax=>{ mk(0.1,0.7,0.1,0x8B5A2B,ax,4.0,0); mk(0.3,0.1,0.1,0x8B5A2B,ax-0.15,3.85,0); mk(0.3,0.1,0.1,0x8B5A2B,ax+0.15,4.15,0); }); }
  else if(hat==='headphones'){ mk(0.18,0.5,0.5,0x222222,-0.62,3.15,0); mk(0.18,0.5,0.5,0x222222,0.62,3.15,0); mk(1.3,0.12,0.2,0x222222,0,3.75,0); }
  else if(hat==='chef')      { mk(1.0,0.3,1.0,0xffffff,0,3.45,0); mk(0.8,0.7,0.8,0xffffff,0,3.95,0); }
  else if(hat==='turban')    { mk(1.1,0.7,1.1,0x8833aa,0,3.55,0); mk(0.16,0.16,0.16,0xffcc00,0,3.95,0.4); }

  const shirtStyle = playerShirt, pantsStyle = playerPants, shoesStyle = playerShoes;
  const bCol = shirtStyle==='suit' ? 0x222222 : shirtC;
  const aCol = shirtStyle==='tanktop' ? skin : bCol;
  mk(0.9,1.1,0.5, bCol, 0,1.75,0);
  mk(0.35,0.9,0.35, aCol,-0.65,1.75,0);
  mk(0.35,0.9,0.35, aCol, 0.65,1.75,0);
  mk(0.37,0.28,0.37, skin,-0.65,1.22,0); mk(0.37,0.28,0.37, skin,0.65,1.22,0);
  const legH = pantsStyle==='shorts' ? 0.5 : pantsStyle==='capri' ? 0.75 : 0.9;
  const legY = pantsStyle==='shorts' ? 0.9 : pantsStyle==='capri' ? 0.72 : 0.75;
  mk(0.38,legH,0.38, pantsC,-0.22,legY,0);
  mk(0.38,legH,0.38, pantsC, 0.22,legY,0);
  if(pantsStyle==='shorts'){mk(0.38,0.45,0.38,skin,-0.22,0.32,0);mk(0.38,0.45,0.38,skin,0.22,0.32,0);}
  const shH=shoesStyle==='boots'?0.45:shoesStyle==='rainboots'?0.6:shoesStyle==='cowboyboots'?0.55:shoesStyle==='platform'?0.3:0.22;
  const shY=shoesStyle==='boots'?0.18:shoesStyle==='rainboots'?0.28:shoesStyle==='cowboyboots'?0.25:shoesStyle==='platform'?0.13:0.1;
  const shD=shoesStyle==='sandals'?0.6:shoesStyle==='flipflops'?0.55:0.52;
  mk(0.42,shH,shD, shoeC,-0.22,shY,0.05);
  mk(0.42,shH,shD, shoeC, 0.22,shY,0.05);

  // Weapon + armor — the two things buildOtherPlayerAvatar() deliberately skips, but the whole
  // point of this preview panel is showing exactly these.
  const wg = buildWeaponVisual(overrides.weapon || playerWeapon);
  if(wg) { wg.position.set(0.7,1.0,0.2); wg.rotation.z=-0.2; g.add(wg); }
  const am = buildArmorVisual(overrides.armor || playerArmor);
  if(am) g.add(am);

  return g;
}

// name -> {mesh, targetX, targetY, targetZ, targetYaw, walking}
let remotePlayers = {};
let _lastPresenceSync = -999;
const PRESENCE_SYNC_INTERVAL = 1; // seconds

// User's own ask: "if i an fighting a killer you can see that" — real-time visibility into what
// OTHER online players are currently fighting, piggybacked on the same free-form /api/presence
// POST every other field above already uses (server stores whatever's sent, no schema — see
// server.js). "owner:id" -> {mesh, targetX, targetZ, owner, killerId}. Deliberately a SEPARATE
// map from the local `killers` array (game-land.js) — these are pure visual echoes, never pushed
// into `killers`, so none of your own combat code (fightKiller/swingSword/tickKillers) can ever
// touch, damage, or be damaged by someone else's fight. Namespaced by owner name because each
// client's own ROBOT_ID_SEQ starts at 0, so two different players' first killer would otherwise
// both be "killer0" and collide.
let remoteKillers = {};
// Thin wrapper around the real buildKillerMesh()/buildRobberMesh() (game-land.js) — reuses the
// exact same models real killers/robbers use, then swaps the "▓▓ UNKNOWN ▓▓" nametag (correct
// for YOUR OWN killers, where the game deliberately hides who/what it is) for a real "fighting
// {name}" label, since here the whole point is showing whose fight this is.
function buildRemoteKillerMesh(x, z, isRobber, ownerName) {
  const g = isRobber ? buildRobberMesh(x, z) : buildKillerMesh(x, z);
  const oldTag = g.children.find(c => c.geometry && c.geometry.type === 'PlaneGeometry');
  if (oldTag) g.remove(oldTag);
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const cx2 = cv.getContext('2d');
  cx2.fillStyle = 'rgba(0,0,0,0.7)'; cx2.fillRect(0,16,256,32);
  cx2.fillStyle = '#ffaa00'; cx2.font = 'bold 18px Arial'; cx2.textAlign = 'center';
  cx2.fillText(`⚔️ fighting ${ownerName}`, 128, 38);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(2.4,0.6), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  tag.position.y = 4.5; g.add(tag);
  g.visible = true; // real killers start hidden until revealed; a synced one is only ever sent once already revealed
  return g;
}

// Every PointLight added anywhere in the city (there are 270+ once everything is
// built — one per lamp post, shop sign, car, etc.) stays permanently active in
// the scene, and three.js compiles ONE shared lit-material shader sized for
// however many lights are currently active — regardless of how far away each
// one is. On phones/tablets with a low fragment-uniform budget, that can
// overflow and silently fail to draw every MeshLambertMaterial object
// (buildings, ground, props) while unlit MeshBasicMaterial signs keep
// rendering fine — looking like "the whole city vanished, just floating
// signs left". Two layers of safety: hiding a light once the player is past
// its own falloff `distance` is visually lossless (it was already
// contributing zero light out there); on top of that, a hard cap on how many
// can be active at once (closest-first) protects dense areas where many
// lights' individual ranges overlap near the player at the same time.
let _lastLightCullSync = -999;
const LIGHT_CULL_INTERVAL = 0.3; // seconds
const LIGHT_CULL_MAX_ACTIVE = 24;
function cullDistantLights() {
  if(!scene || !playerGroup) return;
  const candidates = [];
  scene.traverse(o => {
    if(o.isPointLight) {
      const cutoff = o.distance > 0 ? o.distance : 150;
      const dist = playerGroup.position.distanceTo(o.position);
      candidates.push({ light: o, inRange: dist < cutoff, dist });
    }
  });
  candidates.sort((a, b) => a.dist - b.dist);
  let activeCount = 0;
  for(const c of candidates) {
    c.light.visible = c.inRange && activeCount < LIGHT_CULL_MAX_ACTIVE;
    if(c.light.visible) activeCount++;
  }
}

// A remote player's car is purely cosmetic - no CITY_COLS collider is added for
// it, so driving through/near one is always a harmless pass-through, never a
// crashIntoBuilding()-style fee. Reuses buildCar() exactly like NPC cars do.
function buildRemotePlayerCar(o) {
  const def = CAR_CATALOG.find(c => c.id === o.carId) || CAR_CATALOG[0];
  return buildCar(def, o.x, o.z, o.yaw || 0); // buildCar already adds it to the scene
}
async function syncPresence(t) {
  if(!currentUser || serverMode !== 'online' || !playerGroup) return;
  try {
    // While driving, the real position is the CAR's, not playerGroup's (which
    // just sits wherever you parked it until you get out) - report whichever is
    // actually true right now so other players don't see you frozen in place.
    const driving = !!(inCar && activeCar);
    const posSrc = driving ? activeCar.group.position : playerGroup.position;
    const yawSrc = driving ? carYaw : yaw;
    // "if i an fighting a killer you can see that" — only ever the REVEALED, ALIVE ones (an
    // unrevealed killer is still hidden from you, so it stays hidden from everyone else too),
    // and only the plain-data fields (never `.mesh` — a live THREE object can't go over JSON).
    const visibleKillers = (typeof killers !== 'undefined' ? killers : [])
      .filter(k => k.alive && k.revealed)
      .map(k => ({ id:k.id, x:k.x, z:k.z, robber:!!k.robber }));
    const body = {
      name: currentUser,
      x: posSrc.x, y: posSrc.y, z: posSrc.z,
      yaw: yawSrc,
      inCar: driving, carId: driving ? activeCar.def.id : null,
      hat: playerHat, hair: playerHair, shirt: playerShirt, pants: playerPants, shoes: playerShoes,
      skin: playerColors.skin, shirtColor: playerColors.shirt, pantsColor: playerColors.pants,
      shoesColor: playerColors.shoes, hairColor: playerColors.hair,
      killers: visibleKillers
    };
    fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/presence', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)
    }, 3000).catch(()=>{});

    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/presence?exclude=' + encodeURIComponent(currentUser), {}, 3000);
    if(!r.ok) return;
    const others = await r.json();
    const seen = new Set();
    const seenKillers = new Set();
    others.forEach(o => {
      seen.add(o.name);
      const wantCar = !!o.inCar;
      let rp = remotePlayers[o.name];
      if(!rp) {
        const mesh = wantCar ? buildRemotePlayerCar(o) : buildOtherPlayerAvatar(o);
        if(!wantCar) { mesh.position.set(o.x, o.y, o.z); scene.add(mesh); }
        rp = remotePlayers[o.name] = { mesh, targetX:o.x, targetY:o.y, targetZ:o.z, targetYaw:o.yaw||0, inCar:wantCar, carId:o.carId||null };
      } else {
        if(wantCar !== rp.inCar || (wantCar && o.carId !== rp.carId)) {
          // they just got in/out of a car (or swapped cars) - rebuild as the right mesh type
          scene.remove(rp.mesh);
          const mesh = wantCar ? buildRemotePlayerCar(o) : buildOtherPlayerAvatar(o);
          if(!wantCar) { mesh.position.set(o.x, o.y, o.z); scene.add(mesh); }
          rp.mesh = mesh; rp.inCar = wantCar; rp.carId = o.carId||null;
        }
        rp.targetX = o.x; rp.targetY = o.y; rp.targetZ = o.z; rp.targetYaw = o.yaw||0;
      }
      (o.killers || []).forEach(k => {
        const key = o.name + ':' + k.id;
        seenKillers.add(key);
        let rk = remoteKillers[key];
        if(!rk) {
          const mesh = buildRemoteKillerMesh(k.x, k.z, !!k.robber, o.name);
          remoteKillers[key] = { mesh, targetX:k.x, targetZ:k.z, owner:o.name };
        } else {
          rk.targetX = k.x; rk.targetZ = k.z;
        }
      });
    });
    Object.keys(remotePlayers).forEach(name => {
      if(!seen.has(name)) { scene.remove(remotePlayers[name].mesh); delete remotePlayers[name]; }
    });
    // A remote killer disappears the instant its owner stops reporting it — defeated, fled,
    // or the owner went offline (in which case they also vanish from `seen` above, same beat).
    Object.keys(remoteKillers).forEach(key => {
      if(!seenKillers.has(key)) { scene.remove(remoteKillers[key].mesh); delete remoteKillers[key]; }
    });
  } catch(e) { /* a dropped sync just means they'll look stale for a beat - not worth surfacing */ }
}

function updateRemotePlayers(dt) {
  Object.values(remotePlayers).forEach(rp => {
    rp.mesh.position.x += (rp.targetX - rp.mesh.position.x) * Math.min(1, dt*6);
    rp.mesh.position.y += (rp.targetY - rp.mesh.position.y) * Math.min(1, dt*6);
    rp.mesh.position.z += (rp.targetZ - rp.mesh.position.z) * Math.min(1, dt*6);
    let dYaw = rp.targetYaw - rp.mesh.rotation.y;
    while(dYaw > Math.PI) dYaw -= Math.PI*2;
    while(dYaw < -Math.PI) dYaw += Math.PI*2;
    rp.mesh.rotation.y += dYaw * Math.min(1, dt*6);
  });
}

function clearRemotePlayers() {
  Object.values(remotePlayers).forEach(rp => scene.remove(rp.mesh));
  remotePlayers = {};
}

function updateRemoteKillers(dt) {
  Object.values(remoteKillers).forEach(rk => {
    rk.mesh.position.x += (rk.targetX - rk.mesh.position.x) * Math.min(1, dt*6);
    rk.mesh.position.z += (rk.targetZ - rk.mesh.position.z) * Math.min(1, dt*6);
  });
}
function clearRemoteKillers() {
  Object.values(remoteKillers).forEach(rk => scene.remove(rk.mesh));
  remoteKillers = {};
}

// ─── PRESIDENTS — user's own ask: "make presidents", one per country. Same rule as the
// Celebrities above: every name here is ORIGINAL — none of these is any real president, prime
// minister, or other real political figure, past or present, of any country. Political figures
// are even higher-risk than a fictional YouTuber-style celebrity to depict in a game sold for
// real money, so this line is held even more firmly. Each President gets 2 named Bodyguards
// (their own unique names — deadNPCs' permanent-death tracking is keyed by name, so two NPCs
// sharing one name would incorrectly share death-state too) standing watch nearby; both are
// purely decorative escorts, walked by the exact same shared patrol tick every NPC already uses.
const PRESIDENT_ROSTER = [
  { country:'France',    name:'President Margaux Delacroix', skin:0xf0c8a0, shirt:0x1a3a8a, hair:'long',     hairColor:0x3a2410 },
  { country:'UK',        name:'President Edmund Hartley',     skin:0xe8c090, shirt:0x8a1a2a, hair:'short',    hairColor:0x2a2a2a },
  { country:'Italy',     name:'President Giulia Romano',      skin:0xd4a070, shirt:0x1a7a3a, hair:'curly',    hairColor:0x1a1108 },
  { country:'Japan',     name:'President Haruto Nishida',     skin:0xf0d0a8, shirt:0x2a2a5a, hair:'spiky',    hairColor:0x0a0a0a },
  { country:'Australia', name:'President Bailey Stirling',    skin:0xe0b080, shirt:0xccaa22, hair:'short',    hairColor:0x8a5a20 },
  { country:'Egypt',     name:'President Amara Hassan',       skin:0xc07840, shirt:0xddaa44, hair:'long',     hairColor:0x0a0a0a },
  { country:'Brazil',    name:'President Rafael Moreira',     skin:0xb87040, shirt:0x2a8a4a, hair:'curly',    hairColor:0x1a1108 },
  { country:'Canada',    name:'President Claire Beaumont',    skin:0xf5d5b5, shirt:0xcc2222, hair:'ponytail', hairColor:0xaa3311 },
];
function generatePresidentNPCs() {
  const out = [];
  PRESIDENT_ROSTER.forEach(p => {
    const c = COUNTRY_CENTERS[p.country];
    out.push({ name:p.name, role:'President', skin:p.skin, shirt:p.shirt, pants:0x111111,
      pos:[c.x+15, 0, c.z], patrol:[[c.x+15,c.z],[c.x+10,c.z+8],[c.x+18,c.z+4]], hair:p.hair, hairColor:p.hairColor });
    out.push({ name:p.name+"'s Bodyguard A", role:'Bodyguard', skin:0xd4a070, shirt:0x111111, pants:0x111111,
      pos:[c.x+18,0,c.z+3], patrol:[[c.x+18,c.z+3],[c.x+12,c.z-3]] });
    out.push({ name:p.name+"'s Bodyguard B", role:'Bodyguard', skin:0xc07840, shirt:0x111111, pants:0x111111,
      pos:[c.x+10,0,c.z-3], patrol:[[c.x+10,c.z-3],[c.x+16,c.z+5]] });
  });
  return out;
}

// ─── NPCS ────────────────────────────────────────────────────────────────────
const NPC_DEFS=[
  ...generatePresidentNPCs(),
  {name:'Sam',  role:'Shopkeeper',skin:0xf5c89a,shirt:0x2255aa,pants:0x333344,pos:[44,0,52],patrol:[[44,52],[52,52],[52,44],[44,44]],hair:'short',hairColor:0x2a1505},
  {name:'Mia',  role:'Shopkeeper',skin:0xd4956a,shirt:0x1166bb,pants:0x222233,pos:[58,0,52],patrol:[[58,52],[66,52],[66,44],[58,44]],hair:'long',hairColor:0x1a1a1a},
  {name:'Leo',  role:'Shopkeeper',skin:0xe8c080,shirt:0x0044cc,pants:0x111122,pos:[72,0,52],patrol:[[72,52],[80,52],[80,44],[72,44]],hair:'spiky',hairColor:0x3a2410},
  {name:'Tony', role:'Waiter',    skin:0xf5c89a,shirt:0xeeeeee,pants:0x111111,pos:[104,0,-30],hair:'short',hairColor:0x0a0a0a,seated:true},
  {name:'Rosa', role:'Waiter',    skin:0xc97a50,shirt:0xffffff,pants:0x111111,pos:[110,0,-30],hair:'ponytail',hairColor:0x4a2a10,seated:true},
  {name:'Kai',  role:'Waiter',    skin:0xd4a070,shirt:0xdddddd,pants:0x222222,pos:[116,0,-30],hair:'curly',hairColor:0x1a1008,seated:true},
  {name:'Cruz', role:'Officer',   skin:0xf0c8a0,shirt:0x223366,pants:0x1a2a55,pos:[-66,0,14],patrol:[[-66,14],[-58,14],[-58,6],[-66,6]],hat:'police'},
  {name:'Park', role:'Officer',   skin:0xd4956a,shirt:0x1a2a55,pants:0x111833,pos:[-74,0,8], patrol:[[-74,8],[-66,8],[-66,0],[-74,0]],hat:'police'},
  {name:'Blake',role:'Officer',   skin:0xe8c080,shirt:0x223366,pants:0x1a2a55,pos:[-62,0,18],patrol:[[-62,18],[-54,18],[-54,10],[-62,10]],hat:'police'},
  // Prison NPCs — see PRISON_SPAWN; only ever encountered while actually inPrison
  {name:'Rex',   role:'Guard',    skin:0xd4956a,shirt:0x3a3a3a,pants:0x1a1a1a,pos:[PRISON_SPAWN.x-10,0,PRISON_SPAWN.z+5.6],patrol:[[PRISON_SPAWN.x-10,PRISON_SPAWN.z+5.6],[PRISON_SPAWN.x+10,PRISON_SPAWN.z+5.6],[PRISON_SPAWN.x+6,PRISON_SPAWN.z+18],[PRISON_SPAWN.x-6,PRISON_SPAWN.z+18]],hat:'helmet'},
  {name:'Tanaka',role:'Guard',    skin:0xe8c080,shirt:0x3a3a3a,pants:0x1a1a1a,pos:[PRISON_SPAWN.x+10,0,PRISON_SPAWN.z+5.6],patrol:[[PRISON_SPAWN.x-10,PRISON_SPAWN.z+5.6],[PRISON_SPAWN.x+10,PRISON_SPAWN.z+5.6],[PRISON_SPAWN.x+6,PRISON_SPAWN.z+36],[PRISON_SPAWN.x-6,PRISON_SPAWN.z+36]],hat:'helmet'},
  {name:'Rocco', role:'Prisoner', skin:0xc07840,shirt:0xff8800,pants:0xff8800,pos:[PRISON_SPAWN.x-11,0,PRISON_SPAWN.z-1.5],patrol:[[PRISON_SPAWN.x-11,PRISON_SPAWN.z-1.5]],hair:'spiky',hairColor:0x1a1108},
  {name:'Dusty', role:'Prisoner', skin:0xf0c8a0,shirt:0xff8800,pants:0xff8800,pos:[PRISON_SPAWN.x+11,0,PRISON_SPAWN.z-1.5],patrol:[[PRISON_SPAWN.x+11,PRISON_SPAWN.z-1.5]],hair:'curly',hairColor:0x3a2010},
  // Celebrities — 3 real ORIGINAL characters (never a real person's name/likeness — see
  // CELEBRITY_DEFS' own comment), each roaming a big loop through a different part of the city.
  // tickCelebrities() runs their giveaways/challenges; tickCelebrityCrowds() makes regular
  // citizens flock to whichever one is nearest, both driven off this same `role:'Celebrity'` tag.
  {name:'Chaz Diamond', role:'Celebrity', skin:0xd4956a,shirt:0xFFD700,pants:0x111111,pos:[0,0,0],   patrol:[[0,0],[40,0],[40,40],[0,40]],hat:'crown'},
  {name:'Vex Nova',     role:'Celebrity', skin:0xf0c8a0,shirt:0xff2299,pants:0x1a1a2a,pos:[-40,0,10],patrol:[[-40,10],[-40,45],[-10,45],[-10,10]],hair:'spiky',hairColor:0x00e5ff},
  {name:'Bree Millions',role:'Celebrity', skin:0xe8c080,shirt:0x9933ff,pants:0xFFD700,pos:[50,0,-20], patrol:[[50,-20],[90,-20],[90,10],[50,10]],hair:'long',hairColor:0xff66cc},
  // City citizens
  {name:'Lily',  role:'Citizen', skin:0xf5d5b5,shirt:0xff88aa,pants:0x334499,pos:[5,0,25],    patrol:[[5,25],[15,25],[15,15],[5,15]],hair:'long',hairColor:0xffcc66},
  {name:'Marco', role:'Citizen', skin:0xd4956a,shirt:0x22aa55,pants:0x222222,pos:[25,0,8],    patrol:[[25,8],[35,8],[35,18],[25,18]],hair:'short',hairColor:0x0a0a0a},
  {name:'Zoe',   role:'Jogger',  skin:0xf5c89a,shirt:0xff4444,pants:0x111133,pos:[-10,0,20],  patrol:[[-10,20],[-20,20],[-20,35],[-10,35]],hair:'ponytail',hairColor:0xaa3311},
  {name:'Amir',  role:'Citizen', skin:0x8B5E3C,shirt:0x4488cc,pants:0x223355,pos:[0,0,-20],   patrol:[[0,-20],[12,-20],[12,-30],[0,-30]],hair:'curly',hairColor:0x1a1008,hat:'cap'},
  {name:'Emma',  role:'Citizen', skin:0xf8d8b8,shirt:0xddaa22,pants:0x446622,pos:[-20,0,30],  patrol:[[-20,30],[-30,30],[-30,20],[-20,20]],hair:'afro',hairColor:0x2a1a10},
  {name:'Josh',  role:'Citizen', skin:0xe0b080,shirt:0x224488,pants:0x333333,pos:[40,0,15],   patrol:[[40,15],[50,15],[50,5],[40,5]],hair:'short',hairColor:0x3a2410,hat:'beanie'},
  {name:'Nina',  role:'Tourist', skin:0xf5e5d5,shirt:0xee6622,pants:0x224477,pos:[-5,0,-10],  patrol:[[-5,-10],[5,-10],[5,-20],[-5,-20]],hair:'long',hairColor:0x552211,hat:'fedora'},
  {name:'Omar',  role:'Citizen', skin:0x7a4a2a,shirt:0x334422,pants:0x221100,pos:[15,0,-5],   patrol:[[15,-5],[25,-5],[25,5],[15,5]],hair:'spiky',hairColor:0x1a1108},
  {name:'Priya', role:'Citizen', skin:0xb87040,shirt:0xcc44aa,pants:0x1a1a2a,pos:[-30,0,10],  patrol:[[-30,10],[-40,10],[-40,20],[-30,20]],hair:'long',hairColor:0x0a0a0a},
  {name:'Tyler', role:'Jogger',  skin:0xf0c8a0,shirt:0x44ccee,pants:0x334455,pos:[30,0,-20],  patrol:[[30,-20],[20,-20],[20,-30],[30,-30]],hair:'short',hairColor:0x2a1a0a},
  {name:'Jade',  role:'Citizen', skin:0xd49060,shirt:0x88ccaa,pants:0x333322,pos:[-20,0,-5],  patrol:[[-20,-5],[-30,-5],[-30,5],[-20,5]],hair:'curly',hairColor:0x3a2010},
  {name:'Carlos',role:'Vendor',  skin:0xc07840,shirt:0xffcc00,pants:0x222222,pos:[10,0,40],   patrol:[[10,40],[20,40],[20,45],[10,45]],hair:'short',hairColor:0x1a1108,hat:'cap'},
  {name:'Mei',   role:'Citizen', skin:0xf0d0a8,shirt:0xff5588,pants:0x3366aa,pos:[-15,0,20],  patrol:[[-15,20],[-25,20],[-25,30],[-15,30]],hair:'long',hairColor:0x0a0a0a},
  {name:'Alex',  role:'Tourist', skin:0xe8c090,shirt:0x3388dd,pants:0x445544,pos:[5,0,-30],   patrol:[[5,-30],[15,-30],[15,-40],[5,-40]],hair:'spiky',hairColor:0x442200,hat:'cowboy'},
  {name:'Sasha', role:'Citizen', skin:0xf4d0b0,shirt:0xcc8844,pants:0x224422,pos:[-40,0,25],  patrol:[[-40,25],[-50,25],[-50,35],[-40,35]],hair:'ponytail',hairColor:0x220a05},
];
function makeNPC(def){
  const g=new THREE.Group();
  const mk=(w,h,d,color,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;};
  // hdy shifts every head/hair/hat/tag position down for seated NPCs (their head sits lower — see legs below)
  const hdy = def.seated ? -0.6 : 0;
  mk(0.9,0.9,0.9,def.skin,0,2.75+hdy,0); mk(0.8,1.0,0.45,def.shirt,0,1.75+hdy,0);
  mk(0.32,0.85,0.32,def.shirt,-0.6,1.75+hdy,0); mk(0.32,0.85,0.32,def.shirt,0.6,1.75+hdy,0);
  if(def.seated){
    // Seated pose: legs rotate to point forward (bent at the hip) at chair-seat height instead of hanging straight down
    const lLeg=mk(0.35,0.85,0.35,def.pants,-0.22,0.55,0.35); lLeg.rotation.x=-Math.PI/2;
    const rLeg=mk(0.35,0.85,0.35,def.pants, 0.22,0.55,0.35); rLeg.rotation.x=-Math.PI/2;
    mk(0.38,0.22,0.46,0x333333,-0.22,0.55,0.75); mk(0.38,0.22,0.46,0x333333,0.22,0.55,0.75);
  }else{
    mk(0.35,0.85,0.35,def.pants,-0.22,0.75,0); mk(0.35,0.85,0.35,def.pants,0.22,0.75,0);
    mk(0.38,0.22,0.46,0x333333,-0.22,0.15,0.05); mk(0.38,0.22,0.46,0x333333,0.22,0.15,0.05);
  }
  // Hair — the exact same box shapes buildPlayer() uses for the player, so NPCs match the player's art style
  const hc=def.hairColor;
  if(def.hair==='short')    { mk(1.08,0.3,0.95,hc,0,3.35+hdy,0); mk(0.25,0.5,0.9,hc,-0.6,3.1+hdy,0); mk(0.25,0.5,0.9,hc,0.6,3.1+hdy,0); }
  else if(def.hair==='long'){ mk(1.08,0.3,0.95,hc,0,3.35+hdy,0); mk(0.28,1.4,0.9,hc,-0.6,2.4+hdy,0); mk(0.28,1.4,0.9,hc,0.6,2.4+hdy,0); mk(0.9,1.4,0.28,hc,0,2.4+hdy,-0.5); }
  else if(def.hair==='spiky'){ mk(1.1,0.2,1.0,hc,0,3.35+hdy,0); [-0.35,-0.17,0,0.17,0.35].forEach((sx,i)=>mk(0.18,0.5+i%2*0.2,0.18,hc,sx,3.7+i%2*0.1+hdy,0)); }
  else if(def.hair==='afro') { mk(1.5,1.4,1.4,hc,0,3.1+hdy,0); }
  else if(def.hair==='ponytail'){ mk(1.08,0.3,0.95,hc,0,3.35+hdy,0); mk(0.25,0.5,0.9,hc,-0.6,3.1+hdy,0); mk(0.28,1.8,0.28,hc,0,2.2+hdy,-0.5); }
  else if(def.hair==='curly'){ [-0.3,0,0.3].forEach(cx2=>mk(0.5,0.55,0.5,hc,cx2,3.4+hdy,0)); mk(0.28,1.2,0.28,hc,-0.6,2.7+hdy,0); mk(0.28,1.2,0.28,hc,0.6,2.7+hdy,0); }
  // Hat — same shapes as the player's hat catalog
  if(def.hat==='police'){mk(1.0,0.15,1.0,0x1a2a55,0,3.25+hdy,0);mk(0.85,0.3,0.85,0x223366,0,3.45+hdy,0);mk(0.3,0.06,0.3,0xFFD700,0,3.32+hdy,0.42);}
  else if(def.hat==='cap')     { mk(1.2,0.15,1.2,0xee4444,0,3.35+hdy,0); mk(0.9,0.5,0.8,0xee4444,0,3.63+hdy,-0.05); mk(0.5,0.12,0.4,0xee4444,0,3.28+hdy,0.7); }
  else if(def.hat==='cowboy'){ mk(1.7,0.12,1.7,0x8B4513,0,3.32+hdy,0); mk(0.9,0.7,0.9,0x8B4513,0,3.72+hdy,0); }
  else if(def.hat==='crown'){ mk(1.1,0.28,1.1,0xFFD700,0,3.35+hdy,0); [-0.35,0,0.35].forEach((cx2,i)=>mk(0.22,0.4+i%2*0.15,0.22,0xFFD700,cx2,3.7+hdy,0)); }
  else if(def.hat==='helmet'){ mk(1.15,0.85,1.15,0x555555,0,3.48+hdy,0); mk(0.7,0.3,0.15,0x88ccff,0,3.22+hdy,0.56); }
  else if(def.hat==='tophat'){ mk(1.35,0.1,1.35,0x111111,0,3.32+hdy,0); mk(0.9,0.9,0.9,0x111111,0,3.8+hdy,0); mk(0.92,0.08,0.92,0x333333,0,3.38+hdy,0); }
  else if(def.hat==='beanie'){ mk(1.05,0.7,1.05,def.shirt,0,3.5+hdy,0); mk(0.35,0.35,0.35,0xffffff,0,3.92+hdy,0); }
  else if(def.hat==='fedora'){ mk(1.5,0.1,1.5,0x7a5c3a,0,3.32+hdy,0); mk(0.9,0.65,0.9,0x7a5c3a,0,3.65+hdy,0); mk(0.91,0.08,0.91,0x333333,0,3.37+hdy,0); }
  else if(def.hat==='wizard'){ const w=new THREE.Mesh(new THREE.ConeGeometry(0.6,1.8,8),new THREE.MeshLambertMaterial({color:0x4444aa}));w.position.set(0,3.9+hdy,0);g.add(w); mk(1.3,0.12,1.3,0x4444aa,0,3.32+hdy,0); }
  else if(def.hat==='pirate'){ mk(1.4,0.1,1.4,0x111111,0,3.32+hdy,0); mk(0.9,0.6,0.5,0x111111,0,3.66+hdy,0); mk(0.3,0.3,0.15,0xffffff,0,3.7+hdy,0.3); }
  else if(def.hat==='santa') { mk(1.1,0.2,1.1,0xffffff,0,3.32+hdy,0); const cn=new THREE.Mesh(new THREE.ConeGeometry(0.5,1.0,8),new THREE.MeshLambertMaterial({color:0xdd2222}));cn.position.set(0.1,3.88+hdy,0);g.add(cn); mk(0.25,0.25,0.25,0xffffff,0.45,4.32+hdy,0); }
  // Black sunglasses — user's own ask, Celebrities only. A separate accessory from the hat chain
  // above (not exclusive with it — Chaz Diamond keeps his crown AND gets shades), same low-poly
  // 2-3-box style as everything else here: one lens bar across the eyes, two temple arms back
  // toward the ears.
  if(def.role==='Celebrity'){
    mk(0.82,0.22,0.1,0x0a0a0a,0,2.82+hdy,0.47);
    mk(0.1,0.2,0.35,0x0a0a0a,-0.46,2.82+hdy,0.32);
    mk(0.1,0.2,0.35,0x0a0a0a,0.46,2.82+hdy,0.32);
  }
  const tc2=document.createElement('canvas'); tc2.width=256; tc2.height=56;
  const c2=tc2.getContext('2d');
  c2.fillStyle='rgba(0,0,0,0.7)'; c2.fillRect(0,0,256,56);
  c2.fillStyle='#fff'; c2.font='bold 17px Arial'; c2.textAlign='center'; c2.fillText(def.name,128,24);
  c2.fillStyle='#ffdd55'; c2.font='12px Arial'; c2.fillText(def.role,128,44);
  if(def.emotion){ c2.font='22px Arial'; c2.textAlign='left'; c2.fillText(def.emotion,4,30); }
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(2.8,0.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(tc2),transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  tag.position.y=3.8+hdy; g.add(tag);
  g.position.set(def.pos[0],def.pos[1],def.pos[2]); scene.add(g);
  return {group:g,tag,patrol:def.patrol,patrolIdx:0,speed:1.8+Math.random()*0.8,waitTime:0,name:def.name,role:def.role,isDown:false,seated:def.seated||false,emotion:def.emotion||null};
}
// Changes an NPC's emotion badge at runtime (the tag texture is baked once at creation, so
// this rebuilds it — same drawing logic as makeNPC's tag, just callable after the fact).
function setNPCEmotion(npc, emoji) {
  npc.emotion = emoji;
  const cv = document.createElement('canvas'); cv.width=256; cv.height=56;
  const cx = cv.getContext('2d');
  cx.fillStyle='rgba(0,0,0,0.7)'; cx.fillRect(0,0,256,56);
  cx.fillStyle='#fff'; cx.font='bold 17px Arial'; cx.textAlign='center'; cx.fillText(npc.name,128,24);
  cx.fillStyle='#ffdd55'; cx.font='12px Arial'; cx.fillText(npc.role,128,44);
  if(emoji){ cx.font='22px Arial'; cx.textAlign='left'; cx.fillText(emoji,4,30); }
  if(npc.tag.material.map) npc.tag.material.map.dispose();
  npc.tag.material.map = new THREE.CanvasTexture(cv);
  npc.tag.material.needsUpdate = true;
}
function buildNPCs(){
  NPC_DEFS.forEach(d => {
    if(deadNPCs[d.name]) { buildGrave(d.name, deadNPCs[d.name].x, deadNPCs[d.name].z); return; } // permanently gone — leave their grave instead of respawning them
    npcs.push(makeNPC(d));
  });
}

