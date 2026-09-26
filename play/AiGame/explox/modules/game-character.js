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
  else if(playerHat==='sunglasses'){ c.fillStyle='#111111'; c.fillRect(cx-13,15,26,6); c.fillRect(cx-16,15,4,5); c.fillRect(cx+12,15,4,5); }
  else if(playerHat==='propeller') { c.fillStyle='#dd4444'; c.fillRect(cx-14,11,28,15); c.fillStyle='#888'; c.fillRect(cx-1,7,3,6); c.fillStyle='#ccc'; c.fillRect(cx-10,7,20,2); }
  else if(playerHat==='antlers')   { c.fillStyle=hairC; c.fillRect(cx-12,11,24,13); c.fillStyle='#8B5A2B'; [-10,10].forEach(ax=>{c.fillRect(cx+ax-1,-4,3,15); c.fillRect(cx+ax-6,2,6,2); c.fillRect(cx+ax,7,6,2);}); }
  else if(playerHat==='headphones'){ c.fillStyle='#222222'; c.fillRect(cx-17,14,4,11); c.fillRect(cx+13,14,4,11); c.fillRect(cx-15,6,30,5); }
  else if(playerHat==='chef')      { c.fillStyle='#ffffff'; c.fillRect(cx-12,18,24,7); c.beginPath(); c.ellipse(cx,9,14,11,0,0,Math.PI*2); c.fill(); }
  else if(playerHat==='turban')    { c.fillStyle='#8833aa'; c.beginPath(); c.ellipse(cx,14,15,12,0,0,Math.PI*2); c.fill(); c.fillStyle='#ffcc00'; c.beginPath(); c.arc(cx,7,3,0,Math.PI*2); c.fill(); }
  // Cat Ears — real user request (a fan playing the deployed game): "Pls add cat ears... As an hat".
  else if(playerHat==='catears')   { c.fillStyle='#333333'; c.beginPath(); c.moveTo(cx-16,10); c.lineTo(cx-8,-6); c.lineTo(cx-1,10); c.closePath(); c.fill(); c.beginPath(); c.moveTo(cx+1,10); c.lineTo(cx+8,-6); c.lineTo(cx+16,10); c.closePath(); c.fill(); c.fillStyle='#ff88aa'; c.beginPath(); c.moveTo(cx-13,8); c.lineTo(cx-8,-1); c.lineTo(cx-4,8); c.closePath(); c.fill(); c.beginPath(); c.moveTo(cx+4,8); c.lineTo(cx+8,-1); c.lineTo(cx+13,8); c.closePath(); c.fill(); }

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

  // ── REAL SKELETAL RIG ── actual THREE.Bone objects (real THREE.Object3D subclasses), parented
  // into a real joint hierarchy, with a real THREE.Skeleton registered over them. Every body/
  // cosmetic mesh below now hangs off the bone for its body part instead of sitting flat under
  // playerGroup, so game-controls.js's walk/punch/etc. animation can rotate the BONE (a real
  // joint) instead of the raw box mesh — a swinging arm now pivots from the shoulder instead of
  // spinning around its own geometric center. Bone world-Y values below are in playerGroup space
  // (none of these bones sit rotated away from identity here, so "world" == "rest-pose local sum"
  // for every number already hand-tuned into the branches further down).
  const SPINE_Y = 1.75;   // torso vertical center — hips sit at the same height in this simplified rig
  const HEAD_Y = 2.3;     // neck / base of the head box (head box is 1 unit tall, centered at 2.8)
  const SHOULDER_X = 0.65, SHOULDER_Y = 2.2; // top of the arm box (0.9 tall, centered at 1.75)
  const legH = playerPants==='shorts' ? 0.5 : playerPants==='capri' ? 0.75 : 0.9;
  const legY = playerPants==='shorts' ? 0.9 : playerPants==='capri' ? 0.72 : 0.75;
  const HIP_X = 0.22, HIP_Y = legY + legH/2; // top of the leg box — the real hip joint

  const hipsBone = new THREE.Bone(); hipsBone.position.set(0, SPINE_Y, 0); playerGroup.add(hipsBone);
  const spineBone = new THREE.Bone(); hipsBone.add(spineBone); // stays at local (0,0,0) — same point as hips here
  const headBone = new THREE.Bone(); headBone.position.set(0, HEAD_Y-SPINE_Y, 0); spineBone.add(headBone);
  const leftShoulderBone = new THREE.Bone(); leftShoulderBone.position.set(-SHOULDER_X, SHOULDER_Y-SPINE_Y, 0); spineBone.add(leftShoulderBone);
  const rightShoulderBone = new THREE.Bone(); rightShoulderBone.position.set(SHOULDER_X, SHOULDER_Y-SPINE_Y, 0); spineBone.add(rightShoulderBone);
  const leftHipBone = new THREE.Bone(); leftHipBone.position.set(-HIP_X, HIP_Y-SPINE_Y, 0); hipsBone.add(leftHipBone);
  const rightHipBone = new THREE.Bone(); rightHipBone.position.set(HIP_X, HIP_Y-SPINE_Y, 0); hipsBone.add(rightHipBone);
  player.hipsBone=hipsBone; player.spineBone=spineBone; player.headBone=headBone;
  player.leftShoulderBone=leftShoulderBone; player.rightShoulderBone=rightShoulderBone;
  player.leftHipBone=leftHipBone; player.rightHipBone=rightHipBone;
  player.skeleton = new THREE.Skeleton([hipsBone, spineBone, headBone, leftShoulderBone, rightShoulderBone, leftHipBone, rightHipBone]);

  const skinMeshes = [];
  // mkOn(bone, boneWX,boneWY,boneWZ, w,h,d,color,x,y,z) — same box-mesh builder as the old flat
  // mk(), but every branch below still passes the SAME playerGroup-relative x,y,z it always used;
  // this just re-expresses that position relative to the target bone by subtracting the bone's
  // own world offset, so none of the ~150 hand-tuned coordinate literals below had to change.
  const mkOn=(bone,bwx,bwy,bwz,w,h,d,color,x,y,z)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
    m.position.set(x-bwx,y-bwy,z-bwz); m.castShadow=true; bone.add(m);
    if(color===skin) skinMeshes.push(m); // tags every skin-colored part real-time body paint can recolor live
    return m;
  };
  const mkHead=(w,h,d,color,x,y,z)=>mkOn(headBone,0,HEAD_Y,0,w,h,d,color,x,y,z);
  const mkTorso=(w,h,d,color,x,y,z)=>mkOn(spineBone,0,SPINE_Y,0,w,h,d,color,x,y,z);
  const mkHips=(w,h,d,color,x,y,z)=>mkOn(hipsBone,0,SPINE_Y,0,w,h,d,color,x,y,z);
  const mkArmL=(w,h,d,color,x,y,z)=>mkOn(leftShoulderBone,-SHOULDER_X,SHOULDER_Y,0,w,h,d,color,x,y,z);
  const mkArmR=(w,h,d,color,x,y,z)=>mkOn(rightShoulderBone,SHOULDER_X,SHOULDER_Y,0,w,h,d,color,x,y,z);
  const mkLegL=(w,h,d,color,x,y,z)=>mkOn(leftHipBone,-HIP_X,HIP_Y,0,w,h,d,color,x,y,z);
  const mkLegR=(w,h,d,color,x,y,z)=>mkOn(rightHipBone,HIP_X,HIP_Y,0,w,h,d,color,x,y,z);

  // Head & eyes
  player.headMesh = mkHead(1,1,1, skin, 0,2.8,0);
  const em=new THREE.MeshBasicMaterial({color:0x111111});
  [-0.22,0.22].forEach(ex=>{const e=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.14,0.05),em);e.position.set(ex,2.85-HEAD_Y,0.51);headBone.add(e);});

  // Hair
  if(playerHair==='short')    { mkHead(1.08,0.3,0.95,hairC,0,3.35,0); mkHead(0.25,0.5,0.9,hairC,-0.6,3.1,0); mkHead(0.25,0.5,0.9,hairC,0.6,3.1,0); }
  else if(playerHair==='long'){ mkHead(1.08,0.3,0.95,hairC,0,3.35,0); mkHead(0.28,1.4,0.9,hairC,-0.6,2.4,0); mkHead(0.28,1.4,0.9,hairC,0.6,2.4,0); mkHead(0.9,1.4,0.28,hairC,0,2.4,-0.5); }
  else if(playerHair==='spiky'){ mkHead(1.1,0.2,1.0,hairC,0,3.35,0); [-0.35,-0.17,0,0.17,0.35].forEach((sx,i)=>mkHead(0.18,0.5+i%2*0.2,0.18,hairC,sx,3.7+i%2*0.1,0)); }
  else if(playerHair==='afro') { mkHead(1.5,1.4,1.4,hairC,0,3.1,0); }
  else if(playerHair==='ponytail'){ mkHead(1.08,0.3,0.95,hairC,0,3.35,0); mkHead(0.25,0.5,0.9,hairC,-0.6,3.1,0); mkHead(0.28,1.8,0.28,hairC,0,2.2,-0.5); }
  else if(playerHair==='curly'){ [-0.3,0,0.3].forEach(cx2=>mkHead(0.5,0.55,0.5,hairC,cx2,3.4,0)); mkHead(0.28,1.2,0.28,hairC,-0.6,2.7,0); mkHead(0.28,1.2,0.28,hairC,0.6,2.7,0); }

  // Hat
  if(playerHat==='cap')     { mkHead(1.2,0.15,1.2,0xee4444,0,3.35,0); mkHead(0.9,0.5,0.8,0xee4444,0,3.63,-0.05); mkHead(0.5,0.12,0.4,0xee4444,0,3.28,0.7); }
  else if(playerHat==='cowboy'){ mkHead(1.7,0.12,1.7,0x8B4513,0,3.32,0); mkHead(0.9,0.7,0.9,0x8B4513,0,3.72,0); }
  else if(playerHat==='crown'){ mkHead(1.1,0.28,1.1,0xFFD700,0,3.35,0); [-0.35,0,0.35].forEach((cx2,i)=>mkHead(0.22,0.4+i%2*0.15,0.22,0xFFD700,cx2,3.7,0)); }
  else if(playerHat==='helmet'){ mkHead(1.15,0.85,1.15,0x555555,0,3.48,0); mkHead(0.7,0.3,0.15,0x88ccff,0,3.22,0.56); }
  else if(playerHat==='tophat'){ mkHead(1.35,0.1,1.35,0x111111,0,3.32,0); mkHead(0.9,0.9,0.9,0x111111,0,3.8,0); mkHead(0.92,0.08,0.92,0x333333,0,3.38,0); }
  else if(playerHat==='beanie'){ mkHead(1.05,0.7,1.05,shirt,0,3.5,0); mkHead(0.35,0.35,0.35,0xffffff,0,3.92,0); }
  else if(playerHat==='fedora'){ mkHead(1.5,0.1,1.5,0x7a5c3a,0,3.32,0); mkHead(0.9,0.65,0.9,0x7a5c3a,0,3.65,0); mkHead(0.91,0.08,0.91,0x333333,0,3.37,0); }
  else if(playerHat==='wizard'){ const w=new THREE.Mesh(new THREE.ConeGeometry(0.6,1.8,8),new THREE.MeshLambertMaterial({color:0x4444aa}));w.position.set(0,3.9-HEAD_Y,0);headBone.add(w); mkHead(1.3,0.12,1.3,0x4444aa,0,3.32,0); }
  else if(playerHat==='pirate'){ mkHead(1.4,0.1,1.4,0x111111,0,3.32,0); mkHead(0.9,0.6,0.5,0x111111,0,3.66,0); mkHead(0.3,0.3,0.15,0xffffff,0,3.7,0.3); }
  else if(playerHat==='santa') { mkHead(1.1,0.2,1.1,0xffffff,0,3.32,0); const cn=new THREE.Mesh(new THREE.ConeGeometry(0.5,1.0,8),new THREE.MeshLambertMaterial({color:0xdd2222}));cn.position.set(0.1,3.88-HEAD_Y,0);headBone.add(cn); mkHead(0.25,0.25,0.25,0xffffff,0.45,4.32,0); }
  // 15 new hats — real distinct meshes, same shape-language as the ones above.
  else if(playerHat==='bandana')   { mkHead(1.15,0.15,1.15,0xcc3355,0,3.32,0); mkHead(0.3,0.3,0.1,0xcc3355,0,3.2,-0.6); }
  else if(playerHat==='headband')  { mkHead(1.15,0.15,1.15,0x3388cc,0,3.35,0); }
  else if(playerHat==='partyhat')  { const ph=new THREE.Mesh(new THREE.ConeGeometry(0.55,1.3,8),new THREE.MeshLambertMaterial({color:0xffcc00}));ph.position.set(0,4.0-HEAD_Y,0);headBone.add(ph); mkHead(0.15,0.15,0.15,0xff3366,0,4.68,0); }
  else if(playerHat==='bucket')    { mkHead(1.5,0.15,1.5,0x4a7a4a,0,3.36,0); mkHead(0.9,0.5,0.9,0x4a7a4a,0,3.65,0); }
  else if(playerHat==='jester')    { mkHead(1.15,0.15,1.15,0x8833cc,0,3.35,0); [-0.35,0,0.35].forEach((jx,i)=>{const jc=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.5+i%2*0.2,4),new THREE.MeshLambertMaterial({color:0x8833cc}));jc.position.set(jx,3.7+i%2*0.1-HEAD_Y,0);headBone.add(jc);}); }
  else if(playerHat==='viking')    { mkHead(1.15,0.7,1.15,0x999999,0,3.5,0); const hL=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.6,6),new THREE.MeshLambertMaterial({color:0xeeeecc}));hL.position.set(-0.6,3.9-HEAD_Y,0);hL.rotation.z=0.5;headBone.add(hL); const hR=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.6,6),new THREE.MeshLambertMaterial({color:0xeeeecc}));hR.position.set(0.6,3.9-HEAD_Y,0);hR.rotation.z=-0.5;headBone.add(hR); }
  else if(playerHat==='graduation'){ mkHead(1.4,0.1,1.4,0x111111,0,3.6,0); mkHead(0.9,0.5,0.9,0x111111,0,3.35,0); mkHead(0.06,0.4,0.06,0xFFD700,0.6,3.5,0); }
  else if(playerHat==='flower')    { mkHead(1.15,0.15,1.15,0x2d7a2d,0,3.35,0); ['#ff69b4','#ffcc00','#ff6688','#cc88ff','#ffffff'].forEach((col,i)=>{const a2=i*Math.PI*2/5; mkHead(0.16,0.16,0.16,parseInt(col.slice(1),16),Math.cos(a2)*0.55,3.4,Math.sin(a2)*0.55);}); }
  else if(playerHat==='backwards') { mkHead(1.2,0.5,0.8,0x3355aa,0,3.63,0.05); mkHead(0.5,0.12,0.4,0x3355aa,0,3.28,-0.7); }
  else if(playerHat==='sombrero')  { mkHead(2.2,0.12,2.2,0xd4a860,0,3.35,0); mkHead(0.9,0.7,0.9,0xd4a860,0,3.75,0); }
  else if(playerHat==='sunglasses'){ mkHead(0.9,0.22,0.1,0x111111,0,2.87,0.52); mkHead(0.15,0.15,0.35,0x222222,-0.5,2.87,0.35); mkHead(0.15,0.15,0.35,0x222222,0.5,2.87,0.35); }
  else if(playerHat==='propeller') { mkHead(1.05,0.7,1.05,0xdd4444,0,3.5,0); mkHead(0.7,0.06,0.12,0xcccccc,0,3.95,0); mkHead(0.1,0.15,0.1,0x888888,0,3.9,0); }
  else if(playerHat==='antlers')   { mkHead(1.1,0.7,1.1,hairC,0,3.5,0); [-0.4,0.4].forEach(ax=>{ mkHead(0.1,0.7,0.1,0x8B5A2B,ax,4.0,0); mkHead(0.3,0.1,0.1,0x8B5A2B,ax-0.15,3.85,0); mkHead(0.3,0.1,0.1,0x8B5A2B,ax+0.15,4.15,0); }); }
  else if(playerHat==='headphones'){ mkHead(0.18,0.5,0.5,0x222222,-0.62,3.15,0); mkHead(0.18,0.5,0.5,0x222222,0.62,3.15,0); mkHead(1.3,0.12,0.2,0x222222,0,3.75,0); }
  else if(playerHat==='chef')      { mkHead(1.0,0.3,1.0,0xffffff,0,3.45,0); mkHead(0.8,0.7,0.8,0xffffff,0,3.95,0); }
  else if(playerHat==='turban')    { mkHead(1.1,0.7,1.1,0x8833aa,0,3.55,0); mkHead(0.16,0.16,0.16,0xffcc00,0,3.95,0.4); }
  // Cat Ears — real user request (a fan playing the deployed game): "Pls add cat ears... As an hat".
  else if(playerHat==='catears')   { mkHead(0.32,0.5,0.14,0x333333,-0.35,3.75,0); mkHead(0.32,0.5,0.14,0x333333,0.35,3.75,0); mkHead(0.18,0.3,0.06,0xff88aa,-0.35,3.68,0.06); mkHead(0.18,0.3,0.06,0xff88aa,0.35,3.68,0.06); }

  // Body & arms
  const bCol = playerShirt==='suit' ? 0x222222 : shirt;
  const aCol = playerShirt==='tanktop' ? skin : bCol;
  player.torsoMesh = mkTorso(0.9,1.1,0.5, bCol, 0,1.75,0);
  player.torsoBaseColor = bCol;
  refreshShirtPaintTexture();
  player.lArm = mkArmL(0.35,0.9,0.35, aCol,-0.65,1.75,0);
  player.rArm = mkArmR(0.35,0.9,0.35, aCol, 0.65,1.75,0);
  mkArmL(0.37,0.28,0.37, skin,-0.65,1.22,0); mkArmR(0.37,0.28,0.37, skin,0.65,1.22,0);
  // 15 new shirts — real distinct accent meshes on top of the shared torso/arm shape above.
  if(playerShirt==='crop')          { mkTorso(0.94,0.3,0.54, skin, 0,1.35,0); }
  else if(playerShirt==='vneck')    { mkTorso(0.15,0.25,0.1, skin, 0,2.15,0.26); }
  else if(playerShirt==='crewneck') { mkTorso(0.45,0.1,0.45, bCol, 0,2.3,0); }
  else if(playerShirt==='turtleneck'){ mkTorso(0.5,0.22,0.5, bCol, 0,2.35,0); }
  else if(playerShirt==='polo')     { mkTorso(0.5,0.1,0.1, 0xffffff, 0,2.15,0.26); }
  else if(playerShirt==='tuxedo')   { mkTorso(0.5,0.1,0.1, 0xffffff, 0,2.15,0.26); mkTorso(0.12,0.12,0.1, 0x111111, 0,2.2,0.3); }
  else if(playerShirt==='sweater')  { for(let i=0;i<3;i++) mkTorso(0.92,0.06,0.52, 0x000000, 0,1.5+i*0.25,0.001); }
  else if(playerShirt==='raincoat') { mkTorso(1.0,1.3,0.56, bCol, 0,1.7,0); mkTorso(0.3,0.12,0.5, 0xffffff, 0,2.3,0); }
  else if(playerShirt==='denim')    { mkTorso(0.15,0.5,0.05, 0xffdc78, -0.35,1.9,0.26); mkTorso(0.15,0.5,0.05, 0xffdc78, 0.35,1.9,0.26); }
  else if(playerShirt==='camo')     { mkTorso(0.3,0.3,0.1, 0x2a3a14, -0.2,1.9,0.26); mkTorso(0.25,0.25,0.1, 0x3a4a1a, 0.2,1.6,0.26); }
  else if(playerShirt==='graphic')  { mkTorso(0.3,0.3,0.05, 0xffcc00, 0,1.7,0.26); }
  else if(playerShirt==='flannel')  { for(let i=0;i<3;i++) mkTorso(0.92,0.06,0.52, 0x000000, 0,1.5+i*0.25,0.001); mkTorso(0.06,1.0,0.52, 0x000000, -0.2,1.75,0.001); }
  else if(playerShirt==='buttonup') { for(let i=0;i<4;i++) mkTorso(0.06,0.06,0.06, 0x333333, 0,2.15-i*0.2,0.26); }
  else if(playerShirt==='crophoodie'){ mkTorso(0.94,0.3,0.54, skin, 0,1.35,0); mkTorso(0.08,0.4,0.08, bCol, -0.15,2.15,0.26); mkTorso(0.08,0.4,0.08, bCol, 0.15,2.15,0.26); }
  else if(playerShirt==='overshirt'){ mkTorso(0.5,1.1,0.1, skin, 0,1.75,0.26); }

  // Legs
  player.lLeg = mkLegL(0.38,legH,0.38, pants,-0.22,legY,0);
  player.rLeg = mkLegR(0.38,legH,0.38, pants, 0.22,legY,0);
  if(playerPants==='shorts'){mkLegL(0.38,0.45,0.38,skin,-0.22,0.32,0);mkLegR(0.38,0.45,0.38,skin,0.22,0.32,0);}
  if(playerPants==='cargo'){mkLegL(0.15,0.25,0.4,0x333333,-0.38,0.9,0.1);mkLegR(0.15,0.25,0.4,0x333333,0.38,0.9,0.1);}
  // 10 new pants — real distinct accents/shapes on the shared leg meshes above.
  if(playerPants==='capri')          { mkLegL(0.4,0.2,0.4,skin,-0.22,0.42,0); mkLegR(0.4,0.2,0.4,skin,0.22,0.42,0); }
  else if(playerPants==='leggings')  { mkLegL(0.06,0.9,0.06,0x000000,-0.22,0.75,0.19); mkLegR(0.06,0.9,0.06,0x000000,0.22,0.75,0.19); }
  else if(playerPants==='plaid')     { for(let i=0;i<3;i++) mkLegL(0.4,0.06,0.4,0x000000,-0.22,0.5+i*0.25,0); for(let i=0;i<3;i++) mkLegR(0.4,0.06,0.4,0x000000,0.22,0.5+i*0.25,0); }
  else if(playerPants==='bellbottom'){ mkLegL(0.55,0.2,0.42,pants,-0.22,0.35,0); mkLegR(0.55,0.2,0.42,pants,0.22,0.35,0); }
  else if(playerPants==='camopants') { mkLegL(0.2,0.2,0.2,0x3a4a1a,-0.22,0.9,0.15); mkLegR(0.2,0.2,0.2,0x2a3a14,0.22,0.6,0.15); }
  else if(playerPants==='skinny')    { mkLegL(0.06,0.9,0.06,0x000000,-0.24,0.75,0); mkLegR(0.06,0.9,0.06,0x000000,0.24,0.75,0); }
  else if(playerPants==='sweatpants'){ mkLegL(0.4,0.1,0.4,0xffffff,-0.22,0.32,0); mkLegR(0.4,0.1,0.4,0xffffff,0.22,0.32,0); }
  else if(playerPants==='overalls')  { mkHips(0.9,0.6,0.5,pants,0,1.5,0); mkLegL(0.1,0.4,0.1,pants,-0.3,2.0,0); mkLegR(0.1,0.4,0.1,pants,0.3,2.0,0); }
  else if(playerPants==='skirt' || playerPants==='kilt') { const sk=new THREE.Mesh(new THREE.ConeGeometry(0.55,0.65,4),new THREE.MeshLambertMaterial({color:pants})); sk.position.set(0,0.65-SPINE_Y,0); sk.rotation.y=Math.PI/4; hipsBone.add(sk); }

  // Shoes
  const shoeC=c3(playerColors.shoes);
  const shH=playerShoes==='boots'?0.45:playerShoes==='rainboots'?0.6:playerShoes==='cowboyboots'?0.55:playerShoes==='platform'?0.3:0.22;
  const shY=playerShoes==='boots'?0.18:playerShoes==='rainboots'?0.28:playerShoes==='cowboyboots'?0.25:playerShoes==='platform'?0.13:0.1;
  const shD=playerShoes==='sandals'?0.6:playerShoes==='flipflops'?0.55:0.52;
  mkLegL(0.42,shH,shD, shoeC,-0.22,shY,0.05);
  mkLegR(0.42,shH,shD, shoeC, 0.22,shY,0.05);
  if(playerShoes==='hightop'){mkLegL(0.43,0.3,0.53,shoeC,-0.22,0.32,0.04);mkLegR(0.43,0.3,0.53,shoeC,0.22,0.32,0.04);}
  // 6 more new shoes — real distinct accents (flipflops/rainboots/cowboyboots/platform already
  // handled above via shH/shY/shD).
  else if(playerShoes==='cleats')   { mkLegL(0.06,0.06,0.06,0x222222,-0.3,0.02,0.2); mkLegR(0.06,0.06,0.06,0x222222,0.3,0.02,0.2); }
  else if(playerShoes==='slippers') { mkLegL(0.05,0.05,0.2,0xffffff,-0.22,0.2,0.2); mkLegR(0.05,0.05,0.2,0xffffff,0.22,0.2,0.2); }
  else if(playerShoes==='crocs')    { mkLegL(0.1,0.15,0.1,0x000000,-0.22,0.2,0.15); mkLegR(0.1,0.15,0.1,0x000000,0.22,0.2,0.15); }
  else if(playerShoes==='wedges')   { mkLegL(0.4,0.15,0.5,shoeC,-0.22,0.02,0.05); mkLegR(0.4,0.15,0.5,shoeC,0.22,0.02,0.05); }
  else if(playerShoes==='moccasins'){ mkLegL(0.1,0.05,0.4,0x6b4423,-0.22,0.22,0.05); mkLegR(0.1,0.05,0.4,0x6b4423,0.22,0.22,0.05); }
  else if(playerShoes==='skates')   { mkLegL(0.42,0.1,0.55,0x888888,-0.22,0.02,0.08); mkLegR(0.42,0.1,0.55,0x888888,0.22,0.02,0.08); }

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

// ─── EMOTES ────────────────────────────────────────────────────────────────────
// Coordinator's own scope expansion: "MORE THAN 100 distinct emotes, each purchasable with real
// S.I.P." — hand-authoring 100+ fully separate animation routines isn't realistic, so this follows
// the exact same "derive variety from a formula/seed, don't hand-type a huge table" rule the rest of
// this codebase already uses for its huge generated catalogs (buildWeaponLevels()'s cost curve,
// game-social.js; generateArmorBatch()'s Math.pow cost curve; craftCostForPrice()'s per-item recipe,
// game-housing.js — craftHash()/craftRng() are reused directly below rather than redefined).
//
// 14 real bone-driven animation FAMILIES below (Wave/Dance/Sit/Laugh/Salute/Facepalm/Cry/Bow/Point/
// Clap/Spin/Flex/Shrug/Cheer) are the genuine building blocks — each is a distinct per-frame
// rotation routine over the real skeletal rig (buildPlayer()'s hipsBone/spineBone/headBone/
// leftShoulderBone/rightShoulderBone/leftHipBone/rightHipBone), same sine-eased style as the
// walk-cycle/punch-swing code in game-controls.js's animate(). Every emote a player can actually buy
// is a NAMED VARIANT of one family: the SAME real animation function (applyEmotePose below), just
// parametrized differently (speed/amplitude/repeat-count/which-side/flourish) by a seeded PRNG, so
// e.g. "Friendly Wave" and "Cosmic Wave" are genuinely different playbacks of the same wave rig-
// motion, not identical motion with a different label. 14 families x 4 rarity tiers x 2 variants per
// tier = 112 real, distinct, purchasable emotes.
const EMOTE_FAMILIES = {
  wave:     { name:'Wave',     baseDuration:2.2 },
  dance:    { name:'Dance',    baseDuration:0   }, // loops for as long as it's active
  sit:      { name:'Sit',      baseDuration:0   }, // holds a seated pose until cancelled
  laugh:    { name:'Laugh',    baseDuration:2.0 },
  salute:   { name:'Salute',   baseDuration:1.8 },
  facepalm: { name:'Facepalm', baseDuration:1.8 },
  cry:      { name:'Cry',      baseDuration:2.4 },
  bow:      { name:'Bow',      baseDuration:1.8 },
  point:    { name:'Point',    baseDuration:1.6 },
  clap:     { name:'Clap',     baseDuration:2.0 },
  spin:     { name:'Spin',     baseDuration:1.4 },
  flex:     { name:'Flex',     baseDuration:2.0 },
  shrug:    { name:'Shrug',    baseDuration:1.6 },
  cheer:    { name:'Cheer',    baseDuration:1.8 },
};
const EMOTE_FAMILY_EMOJI = {
  wave:'👋', dance:'💃', sit:'🧘', laugh:'😂', salute:'🫡', facepalm:'🤦', cry:'😢', bow:'🙇',
  point:'👉', clap:'👏', spin:'🌀', flex:'💪', shrug:'🤷', cheer:'🙌',
};
// Rarity tiers — same "bigger number = rarer/pricier" idea as WEAPON tiers/ARMOR tiers elsewhere,
// just applied to emotes. basePrice feeds craftEmotePriceFor() below (real S.I.P., not a craft recipe).
const EMOTE_TIERS = {
  common:    { label:'Common',    color:'#9aa0a6', basePrice:120  },
  rare:      { label:'Rare',      color:'#4fc3f7', basePrice:500  },
  epic:      { label:'Epic',      color:'#c77dff', basePrice:2000 },
  legendary: { label:'Legendary', color:'#ffd700', basePrice:8000 },
};
const EMOTE_TIER_ORDER = ['common','rare','epic','legendary'];
// Adjective pools variants draw their display name from — 4 per tier is plenty since each
// family+tier only ever needs 2 (EMOTE_VARIANTS_PER_TIER below), and craftRng() shuffles which 2
// a given family gets so e.g. "Wave" and "Bow" don't always show the exact same 2 words.
const EMOTE_ADJ = {
  common:    ['Friendly','Quick','Casual','Classic'],
  rare:      ['Smooth','Confident','Stylish','Sharp'],
  epic:      ['Dramatic','Grand','Electric','Fierce'],
  legendary: ['Legendary','Mythic','Cosmic','Ultimate'],
};
const EMOTE_VARIANTS_PER_TIER = 2; // x14 families x4 tiers = 112 real purchasable emotes
// Deterministically generated ONCE at load — every player's game generates the exact identical 112
// variants (same ids/names/prices/params forever), since craftHash()/craftRng() are seeded purely
// from the family+tier+index strings below, never Math.random().
const EMOTE_CATALOG = (function(){
  const out = [];
  Object.keys(EMOTE_FAMILIES).forEach(famId => {
    const fam = EMOTE_FAMILIES[famId];
    EMOTE_TIER_ORDER.forEach(tierId => {
      const tier = EMOTE_TIERS[tierId];
      // Shuffle this family+tier's own copy of the adjective pool (Fisher-Yates, seeded) so
      // different families reliably get different adjectives for the same tier.
      const shuffleRng = craftRng(craftHash('emoteadj:'+famId+':'+tierId));
      const pool = EMOTE_ADJ[tierId].slice();
      for(let i=pool.length-1;i>0;i--){ const j=Math.floor(shuffleRng()*(i+1)); const tmp=pool[i]; pool[i]=pool[j]; pool[j]=tmp; }
      for(let v=0; v<EMOTE_VARIANTS_PER_TIER; v++){
        const id = 'emote_'+famId+'_'+tierId+'_'+v;
        const name = `${pool[v % pool.length]} ${fam.name}`;
        const rng = craftRng(craftHash(id));
        const params = {
          speed:    0.8 + rng()*0.7,             // 0.8x-1.5x playback speed (also scales a one-shot's real finish time)
          amp:      0.8 + rng()*0.8,              // 0.8x-1.6x motion amplitude
          repeat:   2 + Math.floor(rng()*3),      // 2-4 repeats, for the families that oscillate (wave/clap/cheer/laugh/cry/spin)
          side:     rng() < 0.5 ? 1 : -1,         // mirrors one-armed emotes left/right
          flourish: rng(),                         // 0-1 dial a few families use for a bonus flick/hop/twist
        };
        const price = Math.max(50, Math.round(tier.basePrice * (0.85 + rng()*0.3) / 5) * 5); // jittered +/-15%, same "derive off a base, don't hand-type" spirit as craftCostForPrice()'s material weights
        out.push({ id, family:famId, tier:tierId, name, price, params, emoji: EMOTE_FAMILY_EMOJI[famId] });
      }
    });
  });
  return out;
})();
const EMOTE_CATALOG_BY_ID = {};
EMOTE_CATALOG.forEach(v => { EMOTE_CATALOG_BY_ID[v.id] = v; });

// Resets every bone an emote could ever touch back to rest — called once whenever an emote ends or
// is cancelled so it can never leave an arm/head/hip stuck mid-gesture. Works on either the local
// player object or a remote player's mesh group — both expose the identical bone names.
function resetEmotePose(b) {
  if(!b || !b.hipsBone) return;
  b.hipsBone.rotation.set(0,0,0);
  if(b.hipsBone._emoteRestY !== undefined) b.hipsBone.position.y = b.hipsBone._emoteRestY;
  b.spineBone.rotation.set(0,0,0);
  b.headBone.rotation.set(0,0,0);
  b.leftShoulderBone.rotation.set(0,0,0);
  b.rightShoulderBone.rotation.set(0,0,0);
  b.leftHipBone.rotation.set(0,0,0);
  b.rightHipBone.rotation.set(0,0,0);
}
// Drives ONE frame of the given emote FAMILY on the given bone-set, parametrized by `params`
// (speed/amp/repeat/side/flourish — see EMOTE_CATALOG above). `b` is either the local `player`
// object (game-controls.js's animate() calls this with `player`) or a remote player's mesh group
// (buildOtherPlayerAvatar() builds the identical bone names onto it) — the SAME function plays the
// SAME real motion on either, just aimed at different bones, so there's no duplicated animation
// logic between local and remote playback. `elapsed` is real seconds since the emote started.
function applyEmotePose(b, familyId, elapsed, params) {
  if(!b || !b.hipsBone) return;
  const hips=b.hipsBone, spine=b.spineBone, head=b.headBone, lSh=b.leftShoulderBone, rSh=b.rightShoulderBone, lHip=b.leftHipBone, rHip=b.rightHipBone;
  if(hips._emoteRestY === undefined) hips._emoteRestY = hips.position.y;
  // Every branch below only sets the joints it actually uses — starting from a clean rest pose each
  // frame means switching families/variants (or ending one) never leaves a stray rotation behind.
  hips.rotation.set(0,0,0); hips.position.y = hips._emoteRestY;
  spine.rotation.set(0,0,0); head.rotation.set(0,0,0);
  lSh.rotation.set(0,0,0); rSh.rotation.set(0,0,0);
  lHip.rotation.set(0,0,0); rHip.rotation.set(0,0,0);
  const p = params || {speed:1,amp:1,repeat:3,side:1,flourish:0};
  const speed=p.speed||1, amp=p.amp||1, repeat=p.repeat||3, side=p.side>=0?1:-1, flourish=p.flourish||0;
  const et = elapsed*speed; // "logical" time — a faster variant simply reaches every stage sooner
  const fam = EMOTE_FAMILIES[familyId];
  const dur = fam ? fam.baseDuration : 0;
  const leadSh = side>=0 ? rSh : lSh; // the "acting" arm for one-armed emotes — flips per-variant via `side`
  switch(familyId){
    case 'wave': {
      const raise = Math.min(1, et/0.3);
      const swayPhase = et*Math.PI*repeat*0.9;
      leadSh.rotation.x = -1.3*raise;
      leadSh.rotation.z = -side*(0.3 + Math.sin(swayPhase)*0.35*amp*raise);
      head.rotation.y = Math.sin(et*2)*0.05*amp;
      // Hip sway / body lean riding the same wave beat — bigger `flourish` waves put more of the
      // whole body into it instead of just the arm.
      hips.rotation.z = side*flourish*0.15*Math.sin(swayPhase)*raise;
      spine.rotation.z = side*flourish*0.08*Math.sin(swayPhase - 0.4)*raise;
      break;
    }
    case 'dance': {
      const beat = et*2*Math.PI*0.9; // keeps climbing the whole time it's active — a real loop, not a one-shot
      // A secondary wiggle layered on top of the main beat, whose rate depends on `repeat` — low-repeat
      // variants dance smooth and simple, high-repeat variants get a busier, fidgetier style.
      const styleBeat = Math.sin(beat*(0.5 + repeat*0.25));
      hips.rotation.y = Math.sin(beat)*0.25*amp*side;
      hips.position.y = hips._emoteRestY + Math.abs(Math.sin(beat))*0.12*amp + flourish*0.05;
      spine.rotation.z = Math.sin(beat*0.5)*0.12*amp + styleBeat*0.06*amp;
      lSh.rotation.x = Math.sin(beat+Math.PI)*0.9*amp - 0.3 + styleBeat*0.15*amp;
      rSh.rotation.x = Math.sin(beat)*0.9*amp - 0.3 - styleBeat*0.15*amp;
      lSh.rotation.z = Math.cos(beat)*0.2*amp;
      rSh.rotation.z = -Math.cos(beat)*0.2*amp;
      lHip.rotation.x = Math.sin(beat)*0.3*amp;
      rHip.rotation.x = -Math.sin(beat)*0.3*amp;
      head.rotation.z = Math.sin(beat*0.5)*0.15*amp;
      head.rotation.y = styleBeat*0.08*flourish;
      break;
    }
    case 'sit': {
      // Legs swing forward at the hip (no knee joint on this rig, so a straight-leg seated
      // silhouette — same simplification makeNPC()'s def.seated pose already uses), held until cancelled.
      // The idle fidget below runs on REAL `elapsed` time (not `et`), since a hold pose never
      // finishes and shouldn't visibly speed up just because a variant's `speed` is higher.
      const fidget = Math.sin(elapsed*0.35*repeat)*flourish;
      lHip.rotation.x = -1.4; rHip.rotation.x = -1.4;
      hips.position.y = hips._emoteRestY - 0.35;
      // Amplified from the first pass — measured too subtle in testing (a seated pose has no
      // other structural difference between variants, so the fidget IS the whole distinction).
      spine.rotation.x = 0.15 + fidget*0.18*amp;
      spine.rotation.z = Math.sin(elapsed*0.22*repeat + 1.1)*flourish*0.15*amp;
      head.rotation.x = fidget*0.22*amp;
      head.rotation.z = Math.cos(elapsed*0.3*repeat)*flourish*0.15*amp;
      lSh.rotation.x = 0.1*amp + fidget*0.12; rSh.rotation.x = 0.1*amp - fidget*0.12;
      lHip.rotation.z = flourish*0.1*Math.sin(elapsed*0.18*repeat); rHip.rotation.z = -flourish*0.1*Math.sin(elapsed*0.18*repeat);
      break;
    }
    case 'laugh': {
      const bob = Math.sin(et*Math.PI*2*(repeat/dur));
      const hunch = flourish*0.2; // how much the body leans/hunches into the laugh
      head.rotation.x = -0.15 + bob*0.15*amp - hunch*0.3;
      spine.rotation.x = -0.08 + Math.abs(bob)*0.08*amp + hunch;
      spine.rotation.z = side*0.04*amp;
      lSh.rotation.x = -0.4 + bob*0.2*amp - hunch*0.15;
      rSh.rotation.x = -0.4 - bob*0.2*amp - hunch*0.15;
      break;
    }
    case 'salute': {
      const raise = Math.min(1, et/0.25);
      // Raise-drop-raise: `repeat` crisp salute bumps front-loaded early in the gesture, decaying
      // out so the arm settles into a held salute well before the emote's real end.
      const bumpWindow = Math.min(1, et/(dur*0.7));
      const bump = Math.sin(bumpWindow*Math.PI*repeat) * (1-bumpWindow) * 0.3*amp;
      leadSh.rotation.x = -1.75*raise + bump;
      leadSh.rotation.z = side*0.5*raise;
      head.rotation.x = -0.05*raise;
      head.rotation.y = -side*0.08*raise*amp;
      // Heel-click/heel-dip synced to the first bump, sized by `flourish`.
      const heel = Math.max(0, Math.sin(bumpWindow*Math.PI*2)) * flourish;
      hips.position.y = hips._emoteRestY - heel*0.05;
      lHip.rotation.x = -heel*0.15; rHip.rotation.x = -heel*0.15;
      break;
    }
    case 'facepalm': {
      const raise = Math.min(1, et/0.3);
      // Bigger `flourish` = a harder, more dramatic palm-drop with a brief overshoot past the
      // resting pose before it settles.
      const overshoot = Math.sin(raise*Math.PI)*flourish*0.35;
      leadSh.rotation.x = -1.9*raise - overshoot;
      leadSh.rotation.z = -side*0.35*raise;
      head.rotation.x = 0.25*raise*amp + overshoot*0.4;
      head.rotation.z = -side*0.1*raise;
      // Slow head-shake once the palm has landed — `repeat` sets how many shakes fit in the rest
      // of the gesture's real duration.
      const afterDur = Math.max(0.1, dur-0.3);
      const afterT = Math.max(0, et-0.3);
      head.rotation.y = Math.sin(afterT*Math.PI*2*(repeat/afterDur))*0.12*amp*Math.min(1, afterT*3);
      break;
    }
    case 'cry': {
      const shake = Math.sin(et*Math.PI*2*(repeat/Math.max(dur,1)))*0.06*amp;
      const hunch = flourish*0.25; // how much the body leans/hunches into the crying
      head.rotation.x = 0.35 + hunch*0.3;
      head.rotation.z = shake*1.5;
      spine.rotation.x = hunch;
      lSh.rotation.x = -0.15 + shake - hunch*0.2; rSh.rotation.x = -0.15 - shake - hunch*0.2;
      lSh.rotation.z = shake*1.5; rSh.rotation.z = -shake*1.5;
      break;
    }
    case 'bow': {
      const pr = Math.min(1, et/dur);
      // Higher `repeat` variants do a full double-bow (bow-rise-bow) instead of a single bow.
      const bowCount = repeat >= 4 ? 2 : 1;
      const arc = Math.sin(pr*Math.PI*bowCount)*amp; // down, then back up (x bowCount)
      spine.rotation.x = arc*1.0;
      hips.rotation.x = arc*0.15;
      hips.rotation.y = flourish*0.3*arc*side;
      lSh.rotation.x = arc*0.2; rSh.rotation.x = arc*0.2;
      break;
    }
    case 'point': {
      const raise = Math.min(1, et/0.25);
      // Accusatory side-to-side wag once the arm is up — `repeat` sets how many wags, `flourish`
      // sets how big each wag is.
      const wag = Math.sin(et*Math.PI*2*(repeat/Math.max(dur,1)))*0.12*flourish*raise;
      leadSh.rotation.x = -1.5*raise;
      leadSh.rotation.z = -side*0.15 + wag;
      head.rotation.y = -side*0.15*raise + wag*0.5;
      break;
    }
    case 'clap': {
      const beat = Math.sin(et*Math.PI*2*(repeat/dur));
      const raise = Math.min(1, et/0.2);
      // Head-bob / torso bounce synced to each clap, sized by `flourish`.
      const bounce = Math.max(0, beat)*flourish;
      lSh.rotation.x = (-1.1 + beat*0.2*amp)*raise;
      rSh.rotation.x = (-1.1 - beat*0.2*amp)*raise;
      lSh.rotation.z = (0.5 + beat*0.25*amp)*raise;
      rSh.rotation.z = (-0.5 - beat*0.25*amp)*raise;
      head.rotation.x = -0.05*raise - bounce*0.08;
      hips.position.y = hips._emoteRestY + bounce*0.05*raise;
      spine.rotation.x = -bounce*0.05*raise;
      break;
    }
    case 'spin': {
      // Spins the WHOLE rig (hipsBone is the root every other bone hangs from) in place, without
      // touching playerGroup.rotation.y — so the character's actual facing/movement direction is
      // untouched once the emote ends.
      hips.rotation.y = et*Math.PI*2*(repeat/dur)*side;
      // Higher `flourish` twirls with arms raised overhead instead of held at the sides.
      const armsUp = flourish;
      lSh.rotation.x = -0.15 - armsUp*1.6; rSh.rotation.x = -0.15 - armsUp*1.6;
      lSh.rotation.z = armsUp*0.4; rSh.rotation.z = -armsUp*0.4;
      break;
    }
    case 'flex': {
      // Flex-relax-flex pump: `repeat` full pumps fit inside the family's real duration window.
      const pump = Math.abs(Math.sin(et*Math.PI*(repeat/Math.max(dur,1))));
      const shake = et>0.3 ? Math.sin(et*10)*0.03*amp : 0;
      // Higher `flourish` does a single-arm flex (the acting `side` arm) instead of a double-arm flex.
      const singleArm = flourish > 0.5;
      const lAmt = singleArm && side<0 ? 0.15 : pump;
      const rAmt = singleArm && side>=0 ? 0.15 : pump;
      lSh.rotation.x = -1.4*lAmt*amp + shake; rSh.rotation.x = -1.4*rAmt*amp - shake;
      lSh.rotation.z = 0.6*lAmt; rSh.rotation.z = -0.6*rAmt;
      head.rotation.x = -0.1*pump;
      head.rotation.y = singleArm ? side*0.12*pump : 0;
      break;
    }
    case 'shrug': {
      const pr = Math.min(1, et/dur);
      // Multi-shrug: shrug-drop-shrug — more `repeat` means more shrugs (capped at 3 so it never
      // gets too frantic for the family's short baseDuration).
      const shrugCount = Math.min(3, Math.max(1, repeat-1));
      const arc = Math.sin(pr*Math.PI*shrugCount)*amp;
      lSh.rotation.z = 0.5*arc; rSh.rotation.z = -0.5*arc;
      lSh.rotation.x = -0.3*arc; rSh.rotation.x = -0.3*arc;
      // Questioning head tilt — how far it tilts is sized by `flourish`.
      head.rotation.z = Math.sin(pr*Math.PI*2)*0.05*arc + flourish*0.15*Math.sin(pr*Math.PI);
      head.rotation.x = flourish*0.1*Math.sin(pr*Math.PI);
      hips.position.y = hips._emoteRestY + arc*0.03;
      break;
    }
    case 'cheer': {
      const beat = Math.sin(et*Math.PI*2*(repeat/dur));
      const raise = Math.min(1, et/0.25);
      // `flourish` adds extra jump height on top of the base bounce.
      const jump = Math.max(0,beat)*(0.1 + flourish*0.15)*amp*raise;
      lSh.rotation.x = (-2.4 + beat*0.3*amp)*raise;
      rSh.rotation.x = (-2.4 - beat*0.3*amp)*raise;
      hips.position.y = hips._emoteRestY + jump;
      spine.rotation.x = -jump*0.3; // leans back slightly at the peak of a bigger jump
      head.rotation.x = -0.1*raise;
      break;
    }
  }
}
// A loop/hold family (Dance/Sit — baseDuration:0) never auto-finishes; every other family is a real
// one-shot that ends once its (speed-scaled) real duration has elapsed.
function emoteIsFinished(variant, elapsed) {
  const fam = EMOTE_FAMILIES[variant.family];
  if (!fam || !fam.baseDuration) return false;
  return elapsed >= fam.baseDuration / (variant.params.speed || 1);
}

let activeEmote = null; // {id, startT} or null — real per-frame animation, driven every frame in animate() (game-controls.js) via applyEmotePose(player, ...)
// Plays an OWNED emote on the local player. Switching straight to a new emote while one's already
// playing just replaces activeEmote — the very next frame's applyEmotePose() call re-poses every
// bone it touches from a clean rest state (see above), so there's no stacking/glitching between them.
function playEmote(id) {
  const v = EMOTE_CATALOG_BY_ID[id];
  if (!v) return;
  if (!ownedEmotes.includes(id)) { showNotif(`🔒 Buy the ${v.name} emote first — ${v.price.toLocaleString()} S.I.P.`); return; }
  if (!player || !player.hipsBone) return;
  if (inCar || playerSeated || chargingPunch) { showNotif('❌ Can\'t emote right now.'); return; }
  activeEmote = { id, startT: clock.getElapsedTime() };
  // Refresh the panel immediately if it's open, so the "Stop <name>" bar and the "Playing" state
  // on this row show up right away instead of only appearing the next time the panel is reopened.
  const panelEl = document.getElementById('emotesPanel');
  if (panelEl && panelEl.style.display !== 'none') renderEmotesPanel();
}
function cancelEmote() {
  if (!activeEmote) return;
  activeEmote = null;
  const panelEl = document.getElementById('emotesPanel');
  if (panelEl && panelEl.style.display !== 'none') renderEmotesPanel();
  resetEmotePose(player);
}
// Real S.I.P. purchase — same spendSip()/showNotif()/saveCurrentUser() pattern buyArmor()/
// buyWeapon() already use (game-shops.js), just granting into ownedEmotes instead of ownedArmor/
// ownedWeapons. Already-owned just plays it instead of trying to buy it again.
function buyEmoteVariant(id) {
  const v = EMOTE_CATALOG_BY_ID[id];
  if (!v) return;
  if (ownedEmotes.includes(id)) { playEmote(id); return; }
  if (sipDollars < v.price) { showNotif(`❌ Need ${v.price.toLocaleString()} S.I.P.`); return; }
  spendSip(v.price); updateSIP();
  ownedEmotes.push(id);
  saveCurrentUser();
  sfx.buy();
  showNotif(`✅ Got the ${v.name} emote!`);
  playEmote(id); // start it BEFORE re-rendering, so the panel's "Stop <name>" button reflects the emote just bought, not whichever was active before this purchase
  renderEmotesPanel();
}
// ── EMOTES PANEL (rightTabStack's #emotesTab / #emotesPanel, EXPLOX.html) — same toggle/close/
// render trio every other side-panel in this game already follows (see toggleQuestsPanel() /
// closeQuestsPanel() / renderQuestsPanel(), game-customization.js).
function toggleEmotesPanel() {
  const panel = document.getElementById('emotesPanel');
  if (!panel) return;
  if (panel.style.display === 'none') {
    if (document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    renderEmotesPanel();
    panel.style.display = 'flex';
    document.getElementById('emotesTab').style.display = 'none';
  } else { closeEmotesPanel(); }
}
function closeEmotesPanel() {
  document.getElementById('emotesPanel').style.display = 'none';
  document.getElementById('emotesTab').style.display = 'block';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderEmotesPanel() {
  const list = document.getElementById('emotesList');
  if (!list) return;
  let html = '';
  if (activeEmote) {
    const activeV = EMOTE_CATALOG_BY_ID[activeEmote.id];
    html += `<button class="shopBtn" style="width:100%;background:#5a1a1a;margin-bottom:8px;" onclick="cancelEmote();renderEmotesPanel();">⏹ Stop ${activeV ? activeV.name : 'Emote'}</button>`;
  }
  Object.keys(EMOTE_FAMILIES).forEach(famId => {
    const fam = EMOTE_FAMILIES[famId];
    html += `<div style="color:#ff8ecf;font-weight:bold;font-size:12px;margin:10px 0 4px;border-bottom:1px solid #442233;padding-bottom:3px;">${EMOTE_FAMILY_EMOJI[famId]} ${fam.name.toUpperCase()}</div>`;
    EMOTE_CATALOG.filter(v => v.family === famId).forEach(v => {
      const owned = ownedEmotes.includes(v.id);
      const tier = EMOTE_TIERS[v.tier];
      const playing = activeEmote && activeEmote.id === v.id;
      html += `<div class="shopItem" style="margin-bottom:6px;border-color:${tier.color};${playing?'box-shadow:0 0 8px '+tier.color+';':''}">
        <div class="siName">${v.emoji} ${v.name} <span style="color:${tier.color};font-size:10px;">${tier.label}</span></div>
        <div class="siCost">${owned ? '✅ Owned' : `💰 ${v.price.toLocaleString()} S.I.P.`}</div>
        <button class="shopBtn" onclick="${owned ? `playEmote('${v.id}')` : `buyEmoteVariant('${v.id}')`}">${owned ? (playing?'▶ Playing':'▶ Play') : '🔒 Buy'}</button>
      </div>`;
    });
  });
  list.innerHTML = html;
}

// ─── MULTIPLAYER: OTHER PLAYERS ──────────────────────────────────────────────
// A simplified, parameterized cousin of buildPlayer() — builds into its OWN
// group instead of the global playerGroup, so it never touches the local
// player's own avatar/weapon/armor state. Uses a plain text nametag instead
// of the heavier avatar-canvas one. User's own ask: "make the houses badges
// weapons money all in the server" — weapon/armor reuse the same lightweight
// buildWeaponVisual()/buildArmorVisual() (game-shops.js) the local player's
// own updateWeaponMesh()/updateArmorMesh() already use (a few boxes, cheap),
// the profile picture ("badge") is a small separate plane loaded via
// THREE.TextureLoader (handles the data-URL load asynchronously on its own —
// no blocking, no extra code needed here), and money rides on the same
// nametag canvas the name was already drawn on.
function buildOtherPlayerAvatar(a) {
  const g = new THREE.Group();
  const skin=c3(a.skin||'#f5c89a'), shirtC=c3(a.shirtColor||'#2196F3');
  const pantsC=c3(a.pantsColor||'#333333'), shoeC=c3(a.shoesColor||'#4e3b2a'), hairC=c3(a.hairColor||'#3a1f0a');

  // Same real bone rig as buildPlayer() (see there for the full explanation of the numbers below)
  // — kept here too, even though remote players aren't animated yet (out of scope for this pass),
  // so every player in the world shares one real THREE.Bone skeleton shape, not just the local one.
  const SPINE_Y = 1.75, HEAD_Y = 2.3, SHOULDER_X = 0.65, SHOULDER_Y = 2.2;
  const legH = a.pants==='shorts' ? 0.5 : 0.9;
  const legY = a.pants==='shorts' ? 0.9 : 0.75;
  const HIP_X = 0.22, HIP_Y = legY + legH/2;
  const hipsBone = new THREE.Bone(); hipsBone.position.set(0, SPINE_Y, 0); g.add(hipsBone);
  const spineBone = new THREE.Bone(); hipsBone.add(spineBone);
  const headBone = new THREE.Bone(); headBone.position.set(0, HEAD_Y-SPINE_Y, 0); spineBone.add(headBone);
  const leftShoulderBone = new THREE.Bone(); leftShoulderBone.position.set(-SHOULDER_X, SHOULDER_Y-SPINE_Y, 0); spineBone.add(leftShoulderBone);
  const rightShoulderBone = new THREE.Bone(); rightShoulderBone.position.set(SHOULDER_X, SHOULDER_Y-SPINE_Y, 0); spineBone.add(rightShoulderBone);
  const leftHipBone = new THREE.Bone(); leftHipBone.position.set(-HIP_X, HIP_Y-SPINE_Y, 0); hipsBone.add(leftHipBone);
  const rightHipBone = new THREE.Bone(); rightHipBone.position.set(HIP_X, HIP_Y-SPINE_Y, 0); hipsBone.add(rightHipBone);
  g.hipsBone=hipsBone; g.spineBone=spineBone; g.headBone=headBone;
  g.leftShoulderBone=leftShoulderBone; g.rightShoulderBone=rightShoulderBone;
  g.leftHipBone=leftHipBone; g.rightHipBone=rightHipBone;
  g.skeleton = new THREE.Skeleton([hipsBone, spineBone, headBone, leftShoulderBone, rightShoulderBone, leftHipBone, rightHipBone]);

  const mkOn=(bone,bwx,bwy,bwz,w,h,d,color,x,y,z)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
    m.position.set(x-bwx,y-bwy,z-bwz); m.castShadow=true; bone.add(m); return m;
  };
  const mkHead=(w,h,d,color,x,y,z)=>mkOn(headBone,0,HEAD_Y,0,w,h,d,color,x,y,z);
  const mkTorso=(w,h,d,color,x,y,z)=>mkOn(spineBone,0,SPINE_Y,0,w,h,d,color,x,y,z);
  const mkArmL=(w,h,d,color,x,y,z)=>mkOn(leftShoulderBone,-SHOULDER_X,SHOULDER_Y,0,w,h,d,color,x,y,z);
  const mkArmR=(w,h,d,color,x,y,z)=>mkOn(rightShoulderBone,SHOULDER_X,SHOULDER_Y,0,w,h,d,color,x,y,z);
  const mkLegL=(w,h,d,color,x,y,z)=>mkOn(leftHipBone,-HIP_X,HIP_Y,0,w,h,d,color,x,y,z);
  const mkLegR=(w,h,d,color,x,y,z)=>mkOn(rightHipBone,HIP_X,HIP_Y,0,w,h,d,color,x,y,z);

  mkHead(1,1,1, skin, 0,2.8,0); // head
  const em=new THREE.MeshBasicMaterial({color:0x111111});
  [-0.22,0.22].forEach(ex=>{const e=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.14,0.05),em);e.position.set(ex,2.85-HEAD_Y,0.51);headBone.add(e);});
  const hair = a.hair||'none';
  if(hair==='short')    { mkHead(1.08,0.3,0.95,hairC,0,3.35,0); mkHead(0.25,0.5,0.9,hairC,-0.6,3.1,0); mkHead(0.25,0.5,0.9,hairC,0.6,3.1,0); }
  else if(hair==='long'){ mkHead(1.08,0.3,0.95,hairC,0,3.35,0); mkHead(0.28,1.4,0.9,hairC,-0.6,2.4,0); mkHead(0.28,1.4,0.9,hairC,0.6,2.4,0); mkHead(0.9,1.4,0.28,hairC,0,2.4,-0.5); }
  else if(hair==='spiky'){ mkHead(1.1,0.2,1.0,hairC,0,3.35,0); [-0.35,-0.17,0,0.17,0.35].forEach((sx,i)=>mkHead(0.18,0.5+i%2*0.2,0.18,hairC,sx,3.7+i%2*0.1,0)); }
  else if(hair==='afro') { mkHead(1.5,1.4,1.4,hairC,0,3.1,0); }
  else if(hair==='ponytail'){ mkHead(1.08,0.3,0.95,hairC,0,3.35,0); mkHead(0.25,0.5,0.9,hairC,-0.6,3.1,0); mkHead(0.28,1.8,0.28,hairC,0,2.2,-0.5); }
  else if(hair==='curly'){ [-0.3,0,0.3].forEach(cx2=>mkHead(0.5,0.55,0.5,hairC,cx2,3.4,0)); mkHead(0.28,1.2,0.28,hairC,-0.6,2.7,0); mkHead(0.28,1.2,0.28,hairC,0.6,2.7,0); }
  const bCol = a.shirt==='suit' ? 0x222222 : shirtC;
  const aCol = a.shirt==='tanktop' ? skin : bCol;
  mkTorso(0.9,1.1,0.5, bCol, 0,1.75,0);
  g.lArm = mkArmL(0.35,0.9,0.35, aCol,-0.65,1.75,0);
  g.rArm = mkArmR(0.35,0.9,0.35, aCol, 0.65,1.75,0);
  mkArmL(0.37,0.28,0.37, skin,-0.65,1.22,0); mkArmR(0.37,0.28,0.37, skin,0.65,1.22,0);
  g.lLeg = mkLegL(0.38,legH,0.38, pantsC,-0.22,legY,0);
  g.rLeg = mkLegR(0.38,legH,0.38, pantsC, 0.22,legY,0);
  const shH=a.shoes==='boots'?0.45:0.22, shY=a.shoes==='boots'?0.18:0.1;
  mkLegL(0.42,shH,a.shoes==='sandals'?0.6:0.52, shoeC,-0.22,shY,0.05);
  mkLegR(0.42,shH,a.shoes==='sandals'?0.6:0.52, shoeC, 0.22,shY,0.05);

  g.weaponMesh = buildWeaponVisual(a.weapon);
  if(g.weaponMesh) g.add(g.weaponMesh);
  g.weapon = a.weapon || 'none';
  g.armorMesh = buildArmorVisual(a.armor);
  if(g.armorMesh) g.add(g.armorMesh);
  g.armor = a.armor || 'none';

  if(a.profilePic) {
    const badgeTex = new THREE.TextureLoader().load(a.profilePic);
    const badgeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.55,0.55), new THREE.MeshBasicMaterial({map:badgeTex,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
    badgeMesh.position.set(-1.35,4.6,0); g.add(badgeMesh); g.badgeMesh = badgeMesh;
  }

  g.moneySip = a.sip || 0;
  const cv=document.createElement('canvas'); cv.width=256; cv.height=88;
  drawRemoteNametag(cv, a.name, g.moneySip);
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(2.4,0.82),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  tag.position.y=4.7; g.add(tag); g.nametag=tag; g.nametagCanvas=cv;

  return g;
}
// Shared by buildOtherPlayerAvatar() (first build) and syncPresence() (refreshed only when the
// money shown would actually change, not every single sync tick — a canvas redraw for every
// online player every second is exactly the kind of extra cost worth avoiding after the real
// stutter found testing live multiplayer for the first time).
function drawRemoteNametag(cv, name, sip) {
  const cx2=cv.getContext('2d');
  cx2.clearRect(0,0,256,88);
  cx2.fillStyle='rgba(0,0,0,0.55)'; cx2.fillRect(0,10,256,68);
  cx2.fillStyle='#fff'; cx2.font='bold 24px Arial'; cx2.textAlign='center';
  cx2.fillText((name||'Player').slice(0,16), 128, 40);
  cx2.fillStyle='#FFD700'; cx2.font='bold 18px Arial';
  cx2.fillText(`💰 ${Math.floor(sip||0).toLocaleString()}`, 128, 65);
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
  else if(hat==='sunglasses'){ mk(0.9,0.22,0.1,0x111111,0,2.87,0.52); mk(0.15,0.15,0.35,0x222222,-0.5,2.87,0.35); mk(0.15,0.15,0.35,0x222222,0.5,2.87,0.35); }
  else if(hat==='propeller') { mk(1.05,0.7,1.05,0xdd4444,0,3.5,0); mk(0.7,0.06,0.12,0xcccccc,0,3.95,0); mk(0.1,0.15,0.1,0x888888,0,3.9,0); }
  else if(hat==='antlers')   { mk(1.1,0.7,1.1,hairC,0,3.5,0); [-0.4,0.4].forEach(ax=>{ mk(0.1,0.7,0.1,0x8B5A2B,ax,4.0,0); mk(0.3,0.1,0.1,0x8B5A2B,ax-0.15,3.85,0); mk(0.3,0.1,0.1,0x8B5A2B,ax+0.15,4.15,0); }); }
  else if(hat==='headphones'){ mk(0.18,0.5,0.5,0x222222,-0.62,3.15,0); mk(0.18,0.5,0.5,0x222222,0.62,3.15,0); mk(1.3,0.12,0.2,0x222222,0,3.75,0); }
  else if(hat==='chef')      { mk(1.0,0.3,1.0,0xffffff,0,3.45,0); mk(0.8,0.7,0.8,0xffffff,0,3.95,0); }
  else if(hat==='turban')    { mk(1.1,0.7,1.1,0x8833aa,0,3.55,0); mk(0.16,0.16,0.16,0xffcc00,0,3.95,0.4); }
  else if(hat==='catears')   { mk(0.32,0.5,0.14,0x333333,-0.35,3.75,0); mk(0.32,0.5,0.14,0x333333,0.35,3.75,0); mk(0.18,0.3,0.06,0xff88aa,-0.35,3.68,0.06); mk(0.18,0.3,0.06,0xff88aa,0.35,3.68,0.06); }

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

// User's own correction after the first version only showed who's online RIGHT NOW: "no it shows
// how many people are playing al togetnher in the site" — every account that's ever signed up on
// this server (/api/users, the same endpoint the online login screen's account list already
// uses), not just the tiny in-memory presence list that forgets someone the moment they've been
// quiet for 8 seconds (game-core.js's PRESENCE_TIMEOUT_SEC on the server side). Changes rarely,
// so a real 30-second interval is plenty — no reason to hit this every second like presence.
// Second correction: "any one can see how many people are playoing any time any wheree" — this is
// a real, deliberate exception to "Offline means no network calls" every other sync in this file
// follows: it always tries the server regardless of serverMode, since the whole point is a public
// number anyone should see, on the login screen or in-game, online or off.
let _lastSitePlayersSync = -999;
const SITE_PLAYERS_SYNC_INTERVAL = 30; // seconds
async function syncSitePlayerCount() {
  try {
    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/users', {}, 4000);
    if (!r.ok) return;
    const allUsers = await r.json();
    const count = allUsers.length.toLocaleString();
    // Whichever of the two HUD locations exists right now (login screen vs. in-game) gets it —
    // harmless no-op on the one that isn't currently in the DOM.
    const loginEl = document.getElementById('loginSitePlayerCount');
    if (loginEl) loginEl.textContent = count;
    const inGameEl = document.getElementById('sitePlayerCount');
    if (inGameEl) inGameEl.textContent = count;
  } catch(e) { /* next sync will catch up */ }
}

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
// User's own ask: "pets body gards and and also npcs u fight" — the killers/robbers/demons half
// was already covered above; this adds the other two personal companions. Same "owner:key ->
// {mesh, targetX, targetZ, owner}" shape as remoteKillers, and the same reasoning for why these
// are a separate map instead of touching the real local `buddyGroup`/`bodyguards` — pure visual
// echoes of someone else's stuff, never able to affect your own. Position is never sent over the
// wire at all: it's recomputed from the owner's own already-synced x/z using the exact same fixed
// offset buildBuddy()/buildBodyguards() (game-shops.js) use locally, so there's nothing extra to
// interpolate wrong and no extra bytes on every single presence tick.
let remoteBuddies = {};     // ownerName -> {mesh, targetX, targetZ}
let remoteBodyguards = {};  // "ownerName:index" -> {mesh, targetX, targetZ}
// Thin wrapper around the real buildKillerMesh()/buildRobberMesh() (game-land.js) — reuses the
// exact same models real killers/robbers use, then swaps the "▓▓ UNKNOWN ▓▓" nametag (correct
// for YOUR OWN killers, where the game deliberately hides who/what it is) for a real "fighting
// {name}" label, since here the whole point is showing whose fight this is.
function buildRemoteKillerMesh(x, z, isRobber, ownerName, isDemon, demonName, demonEmoji) {
  const g = isDemon ? buildDemonMesh(x, z, { name: demonName || 'Demon', emoji: demonEmoji || '😈' }) : (isRobber ? buildRobberMesh(x, z) : buildKillerMesh(x, z));
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
  if (o.carId === 'super_jet') return buildJetMesh(o.x, o.z, o.yaw || 0);
  const def = CAR_CATALOG.find(c => c.id === o.carId) || CAR_CATALOG[0];
  return buildOwnedVehicleMesh(def, o.x, o.z, o.yaw || 0); // real jet shape for isJet entries, buildCar() otherwise — both already add to the scene
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
      .map(k => ({ id:k.id, x:k.x, z:k.z, robber:!!k.robber, demon:!!k.demon, demonName:k.demon?k.demonDef.name:null, demonEmoji:k.demon?k.demonDef.emoji:null }));
    const body = {
      name: currentUser,
      x: posSrc.x, y: posSrc.y, z: posSrc.z,
      yaw: yawSrc,
      inCar: driving, carId: driving ? activeCar.def.id : null,
      hat: playerHat, hair: playerHair, shirt: playerShirt, pants: playerPants, shoes: playerShoes,
      skin: playerColors.skin, shirtColor: playerColors.shirt, pantsColor: playerColors.pants,
      shoesColor: playerColors.shoes, hairColor: playerColors.hair,
      weapon: playerWeapon, armor: playerArmor, profilePic: playerProfilePic, sip: sipDollars,
      emote: activeEmote ? activeEmote.id : null,
      killers: visibleKillers,
      buddy: (buddyOwned && buddySpecies) ? { species: buddySpecies, colors: buddyColors } : null,
      bodyguardCount: bodyguards.length
    };
    fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/presence', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)
    }, 3000).catch(()=>{});

    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/presence?exclude=' + encodeURIComponent(currentUser), {}, 3000);
    if(!r.ok) return;
    const others = await r.json();
    const seen = new Set();
    const seenKillers = new Set();
    const seenBuddies = new Set();
    const seenBodyguards = new Set();
    others.forEach(o => {
      seen.add(o.name);
      const wantCar = !!o.inCar;
      let rp = remotePlayers[o.name];
      if(!rp) {
        // Real bug found live: buildCar()/buildRemotePlayerCar() only ever takes x/z/yaw, never
        // y — a remote Super Jet mid-flight used to appear stuck on the ground and only climb to
        // its real altitude over the next second as updateRemotePlayers()'s own lerp caught up.
        // Setting the group's y explicitly right after building it (car or avatar, doesn't
        // matter which — position.set() on a THREE.Group just repositions the whole thing, safe
        // either way) means it shows up at the right height from the very first frame instead.
        const mesh = wantCar ? buildRemotePlayerCar(o) : buildOtherPlayerAvatar(o);
        mesh.position.set(o.x, o.y, o.z);
        if(!wantCar) scene.add(mesh);
        rp = remotePlayers[o.name] = { mesh, targetX:o.x, targetY:o.y, targetZ:o.z, targetYaw:o.yaw||0, inCar:wantCar, carId:o.carId||null, emote:o.emote||null, emoteStartT:t };
      } else {
        if(wantCar !== rp.inCar || (wantCar && o.carId !== rp.carId)) {
          // they just got in/out of a car (or swapped cars) - rebuild as the right mesh type
          scene.remove(rp.mesh);
          const mesh = wantCar ? buildRemotePlayerCar(o) : buildOtherPlayerAvatar(o);
          mesh.position.set(o.x, o.y, o.z);
          if(!wantCar) scene.add(mesh);
          rp.mesh = mesh; rp.inCar = wantCar; rp.carId = o.carId||null;
        } else if(!wantCar) {
          // Same avatar mesh as last tick — swap just the weapon/armor pieces if they actually
          // changed (cheap: buildWeaponVisual()/buildArmorVisual() are a few boxes, same cost as
          // the local player's own updateWeaponMesh()/updateArmorMesh()), and only redraw the
          // nametag canvas when the displayed money actually moves, not every single sync tick.
          const oWeapon = o.weapon || 'none', oArmor = o.armor || 'none';
          if(oWeapon !== rp.mesh.weapon) {
            if(rp.mesh.weaponMesh) rp.mesh.remove(rp.mesh.weaponMesh);
            rp.mesh.weaponMesh = buildWeaponVisual(o.weapon);
            if(rp.mesh.weaponMesh) rp.mesh.add(rp.mesh.weaponMesh);
            rp.mesh.weapon = oWeapon;
          }
          if(oArmor !== rp.mesh.armor) {
            if(rp.mesh.armorMesh) rp.mesh.remove(rp.mesh.armorMesh);
            rp.mesh.armorMesh = buildArmorVisual(o.armor);
            if(rp.mesh.armorMesh) rp.mesh.add(rp.mesh.armorMesh);
            rp.mesh.armor = oArmor;
          }
          if(Math.floor(o.sip||0) !== Math.floor(rp.mesh.moneySip||0) && rp.mesh.nametagCanvas) {
            rp.mesh.moneySip = o.sip || 0;
            drawRemoteNametag(rp.mesh.nametagCanvas, o.name, rp.mesh.moneySip);
            rp.mesh.nametag.material.map.needsUpdate = true;
          }
        }
        rp.targetX = o.x; rp.targetY = o.y; rp.targetZ = o.z; rp.targetYaw = o.yaw||0;
        // Emotes — real bone animation, reusing the exact same applyEmotePose()/resetEmotePose()
        // functions the local player uses (this file), just driven by THIS remote player's own
        // synced emote id/start-time instead of local input (see updateRemotePlayers() below, which
        // actually calls applyEmotePose() every frame while rp.emote is set). Independent of the
        // position/yaw lerp just above — an emoting remote player might not be moving at all.
        const oEmote = o.emote || null;
        if (oEmote !== rp.emote) {
          rp.emote = oEmote;
          rp.emoteStartT = t;
          if (!oEmote && !wantCar) resetEmotePose(rp.mesh);
        }
      }
      (o.killers || []).forEach(k => {
        const key = o.name + ':' + k.id;
        seenKillers.add(key);
        let rk = remoteKillers[key];
        if(!rk) {
          const mesh = buildRemoteKillerMesh(k.x, k.z, !!k.robber, o.name, !!k.demon, k.demonName, k.demonEmoji);
          remoteKillers[key] = { mesh, targetX:k.x, targetZ:k.z, owner:o.name };
        } else {
          rk.targetX = k.x; rk.targetZ = k.z;
        }
      });
      // Same fixed offset buildBuddy() (game-shops.js) plants a real buddy at, just relative to
      // this OTHER player's own synced x/z instead of the local playerGroup.
      if(o.buddy && o.buddy.species) {
        seenBuddies.add(o.name);
        const targetX = o.x - 1, targetZ = o.z - 1;
        let rb = remoteBuddies[o.name];
        if(!rb || rb.species !== o.buddy.species) {
          if(rb) scene.remove(rb.mesh);
          const built = buildBuddyMesh(o.buddy.species, o.buddy.colors || {body:'#88cc88',accent:'#ffffff',eye:'#111111'});
          built.group.position.set(targetX, o.y, targetZ);
          scene.add(built.group);
          rb = remoteBuddies[o.name] = { mesh: built.group, species: o.buddy.species, targetX, targetZ };
        } else {
          rb.targetX = targetX; rb.targetZ = targetZ;
        }
      }
      // Same fixed per-index offset buildBodyguards() (game-shops.js) uses locally.
      for(let i = 0; i < (o.bodyguardCount || 0); i++) {
        const key = o.name + ':' + i;
        seenBodyguards.add(key);
        const targetX = o.x - 1.5 - i*0.9, targetZ = o.z + 1;
        let rg = remoteBodyguards[key];
        if(!rg) {
          const mesh = buildBodyguardMesh(targetX, targetZ);
          remoteBodyguards[key] = { mesh, targetX, targetZ };
        } else {
          rg.targetX = targetX; rg.targetZ = targetZ;
        }
      }
    });
    Object.keys(remotePlayers).forEach(name => {
      if(!seen.has(name)) { scene.remove(remotePlayers[name].mesh); delete remotePlayers[name]; }
    });
    // A remote killer disappears the instant its owner stops reporting it — defeated, fled,
    // or the owner went offline (in which case they also vanish from `seen` above, same beat).
    Object.keys(remoteKillers).forEach(key => {
      if(!seenKillers.has(key)) { scene.remove(remoteKillers[key].mesh); delete remoteKillers[key]; }
    });
    Object.keys(remoteBuddies).forEach(name => {
      if(!seenBuddies.has(name)) { scene.remove(remoteBuddies[name].mesh); delete remoteBuddies[name]; }
    });
    Object.keys(remoteBodyguards).forEach(key => {
      if(!seenBodyguards.has(key)) { scene.remove(remoteBodyguards[key].mesh); delete remoteBodyguards[key]; }
    });
  } catch(e) { /* a dropped sync just means they'll look stale for a beat - not worth surfacing */ }
}

function updateRemotePlayers(dt, t) {
  Object.values(remotePlayers).forEach(rp => {
    rp.mesh.position.x += (rp.targetX - rp.mesh.position.x) * Math.min(1, dt*6);
    rp.mesh.position.y += (rp.targetY - rp.mesh.position.y) * Math.min(1, dt*6);
    rp.mesh.position.z += (rp.targetZ - rp.mesh.position.z) * Math.min(1, dt*6);
    let dYaw = rp.targetYaw - rp.mesh.rotation.y;
    while(dYaw > Math.PI) dYaw -= Math.PI*2;
    while(dYaw < -Math.PI) dYaw += Math.PI*2;
    rp.mesh.rotation.y += dYaw * Math.min(1, dt*6);
    // Emotes — independent of the position/yaw lerp above (an emoting remote player might be
    // standing perfectly still), driven off the SAME real applyEmotePose() function the local
    // player uses, aimed at this remote avatar's own bones and this remote player's own synced
    // emote id/start-time (set in syncPresence() above).
    if (rp.emote && rp.mesh.hipsBone) {
      const variant = EMOTE_CATALOG_BY_ID[rp.emote];
      if (variant) {
        const elapsed = t - rp.emoteStartT;
        if (emoteIsFinished(variant, elapsed)) resetEmotePose(rp.mesh);
        else applyEmotePose(rp.mesh, variant.family, elapsed, variant.params);
      }
    }
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
function updateRemoteBuddies(dt) {
  Object.values(remoteBuddies).forEach(rb => {
    rb.mesh.position.x += (rb.targetX - rb.mesh.position.x) * Math.min(1, dt*6);
    rb.mesh.position.z += (rb.targetZ - rb.mesh.position.z) * Math.min(1, dt*6);
  });
}
function clearRemoteBuddies() {
  Object.values(remoteBuddies).forEach(rb => scene.remove(rb.mesh));
  remoteBuddies = {};
}
function updateRemoteBodyguards(dt) {
  Object.values(remoteBodyguards).forEach(rg => {
    rg.mesh.position.x += (rg.targetX - rg.mesh.position.x) * Math.min(1, dt*6);
    rg.mesh.position.z += (rg.targetZ - rg.mesh.position.z) * Math.min(1, dt*6);
  });
}
function clearRemoteBodyguards() {
  Object.values(remoteBodyguards).forEach(rg => scene.remove(rg.mesh));
  remoteBodyguards = {};
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
  // Factory Foremen — one per FACTORY_DEFS entry (game-buildings.js), standing right at their own
  // loading dock, same short-pace-patrol ambient style as Sam/Mia/Leo outside the shops above.
  {name:'Gus',  role:'Foreman',  skin:0xd4956a,shirt:0xFFD700,pants:0x223355,pos:[240,0,-27],patrol:[[236,-27],[244,-27]],hair:'short',hairColor:0x2a1505,hat:'cap'},
  {name:'Rita', role:'Foreman',  skin:0xc97a50,shirt:0xFF6600,pants:0x1a1a1a,pos:[330,0,-27],patrol:[[326,-27],[334,-27]],hair:'ponytail',hairColor:0x3a2010,hat:'cap'},
  {name:'Dex',  role:'Foreman',  skin:0xe8c080,shirt:0x33aa77,pants:0x111111,pos:[420,0,-27],patrol:[[416,-27],[424,-27]],hat:'helmet'},
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
  // Dark glasses as an actual def.hat option for NPCs — the exact same 3-box shape (lens bar +
  // 2 temple arms) buildPlayer() uses for playerHat==='sunglasses' (this file, ~line 350), just
  // reused here instead of inventing a new accessory. Unlike the Celebrity-only block just below
  // (which is keyed off role, not hat, and stacks on top of whatever hat a Celebrity already has),
  // this is a real selectable hat like 'fedora'/'cap'/etc — the Spy NPCs (game-world.js) are the
  // first to use it, going for a "trench coat + dark glasses" look without a hat on top of it.
  else if(def.hat==='sunglasses'){ mk(0.9,0.22,0.1,0x111111,0,2.87+hdy,0.52); mk(0.15,0.15,0.35,0x222222,-0.5,2.87+hdy,0.35); mk(0.15,0.15,0.35,0x222222,0.5,2.87+hdy,0.35); }
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

