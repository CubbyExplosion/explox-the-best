// ─── CONTROLS ────────────────────────────────────────────────────────────────
// Launch off the Space Station platform into real zero-gravity flight (see the gravity block in
// the main tick below, and tryCityJump()'s inOuterSpace branch for the thruster) — press E at the
// rocket again to toggle back, or just drift back down to the platform on your own.
function toggleSpaceLaunch(){
  if(inCar || playerSeated) return;
  if(inOuterSpace){
    inOuterSpace = false;
    playerGroup.position.y = 0; jumpVel = 0; onGround = true;
    showNotif('🌍 You touch back down on the Space Station platform.');
  } else {
    inOuterSpace = true;
    jumpVel = 45; onGround = false;
    sfx.earn && sfx.earn();
    showNotif('🚀 Blastoff! Floating in real zero gravity — tap Space/Jump to thrust, you\'ll drift down slowly otherwise.');
  }
}
function tryCityJump(){
  if(inCar) return;
  // Swimming: the same jump key dives you under or brings you back up instead of jumping — press
  // once near the surface to submerge, press again once under to come back up, like real swimming.
  if(inWater){ jumpVel = playerGroup.position.y > -0.3 ? -6 : 6; return; }
  // Zero-gravity thruster — unlimited, unlike the ground jump's onGround/doubleJump gating,
  // since floating in real outer space with a jetpack shouldn't run out after 1-2 taps.
  if(inOuterSpace){ jumpVel = 10; onGround = false; return; }
  if(onGround){
    jumpVel=13; onGround=false; jumpsUsed=1;
    if(activeAddOns.includes('confettijump')) burstConfetti(playerGroup.position.clone().setY(playerGroup.position.y+1), 10);
  } else if(activeAddOns.includes('doublejump') && jumpsUsed<2){
    jumpVel=13; jumpsUsed=2;
    if(activeAddOns.includes('confettijump')) burstConfetti(playerGroup.position.clone().setY(playerGroup.position.y+1), 10);
  }
}

function setupControls(){
  setupMobileControls();
  document.addEventListener('keydown',e=>{
    if(e.code==='KeyW') moveState.w=true;
    if(e.code==='KeyS') moveState.s=true;
    if(e.code==='KeyA') moveState.a=true;
    if(e.code==='KeyD') moveState.d=true;
    if(e.code==='KeyE' && !e.repeat) onInteractDown();
    if(e.code==='KeyI'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))) eatIceCream(); }
    if(e.code==='KeyC'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))) eatFromBag(); }
    // Keyboard shortcuts for the side tabs — these work even while the mouse
    // is locked for looking around, since keyboard input isn't affected by
    // Pointer Lock the way mouse clicks are. No need to press Escape first.
    if(e.code==='KeyB'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))) toggleInventory(); }
    if(e.code==='KeyT'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))) toggleSAI(); }
    if(e.code==='KeyG'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))) toggleAddOnsPanel(); }
    if(e.code==='KeyM'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))){ const p=document.getElementById('musicPanel'); if(p.style.display==='block') closeMusicPanel(); else openMusicPanel(); } }
    if(e.code==='KeyY'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))) tryGiveSip(); }
    if(e.code==='KeyP' && placingStore) confirmStorePlacement();
    if(e.code==='Escape' && placingStore) cancelStorePlacement();
    // Shift = run faster; Space = jump (ignore Space while typing in a text field)
    if(e.code==='ShiftLeft'||e.code==='ShiftRight') moveState.run=true;
    if(e.code==='Space'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))){ e.preventDefault(); tryCityJump(); } }
  });
  document.addEventListener('keyup',e=>{
    if(e.code==='KeyW') moveState.w=false;
    if(e.code==='KeyS') moveState.s=false;
    if(e.code==='KeyA') moveState.a=false;
    if(e.code==='KeyD') moveState.d=false;
    if(e.code==='KeyE') onInteractUp();
    if(e.code==='ShiftLeft'||e.code==='ShiftRight') moveState.run=false;
  });
  renderer.domElement.addEventListener('click',()=>renderer.domElement.requestPointerLock());
  document.addEventListener('pointerlockchange',()=>{ isPointerLocked=document.pointerLockElement===renderer.domElement; });
  document.addEventListener('mousemove',e=>{
    if(!isPointerLocked) return;
    yaw-=e.movementX*0.002; pitch-=e.movementY*0.002;
    pitch=Math.max(-0.5,Math.min(1.0,pitch));
  });
  // Resize is already handled by _resizeRenderer() (registered in _startGameInner,
  // includes the ResizeObserver + style-preserving fix) — a second handler used
  // to live here calling the plain renderer.setSize(w,h) with no style guard,
  // which fired on every resize AFTER _resizeRenderer and silently undid it.
}

// ─── MOBILE TOUCH CONTROLS ────────────────────────────────────────────────────
// Two independent touches are tracked by their own identifier: one drags the
// on-screen joystick (movement), the other drags anywhere else on the canvas
// to look around (replaces mouse-look, works with no Pointer Lock needed).
let joyTouchId = null, joyCenterX = 0, joyCenterY = 0;
let lookTouchId = null, lookLastX = 0, lookLastY = 0;

function setupMobileControls(){
  const joyBase     = document.getElementById('joyBase');
  const joyStick    = document.getElementById('joyStick');
  const jumpBtn     = document.getElementById('mobileJumpBtn');
  const interactBtn = document.getElementById('mobileInteractBtn');
  const runBtn      = document.getElementById('mobileRunBtn');
  if(!joyBase) return; // mobile controls markup not present

  function updateJoyStick(cx, cy){
    const r = 45; // max stick travel in px
    const dx = cx - joyCenterX, dy = cy - joyCenterY;
    const dist = Math.min(Math.sqrt(dx*dx + dy*dy), r);
    const angle = Math.atan2(dy, dx);
    const sx = Math.cos(angle) * dist, sy = Math.sin(angle) * dist;
    joyStick.style.transform = `translate(${sx}px, ${sy}px)`;
    const nx = sx / r, ny = sy / r;
    const threshold = 0.3;
    moveState.w = ny < -threshold;
    moveState.s = ny >  threshold;
    moveState.a = nx < -threshold;
    moveState.d = nx >  threshold;
  }
  function resetJoyStick(){
    moveState.w = moveState.a = moveState.s = moveState.d = false;
    joyStick.style.transform = 'translate(0px,0px)';
  }

  joyBase.addEventListener('touchstart', e=>{
    e.preventDefault();
    const t = e.changedTouches[0];
    joyTouchId = t.identifier;
    const r = joyBase.getBoundingClientRect();
    joyCenterX = r.left + r.width/2;
    joyCenterY = r.top + r.height/2;
    updateJoyStick(t.clientX, t.clientY);
  }, {passive:false});

  document.addEventListener('touchmove', e=>{
    for(const t of e.changedTouches){
      if(t.identifier === joyTouchId) updateJoyStick(t.clientX, t.clientY);
      if(t.identifier === lookTouchId){
        const dx = t.clientX - lookLastX, dy = t.clientY - lookLastY;
        yaw -= dx*0.004; pitch -= dy*0.004;
        pitch = Math.max(-0.5, Math.min(1.0, pitch));
        lookLastX = t.clientX; lookLastY = t.clientY;
      }
    }
  }, {passive:true});

  document.addEventListener('touchend', e=>{
    for(const t of e.changedTouches){
      if(t.identifier === joyTouchId){ joyTouchId = null; resetJoyStick(); }
      if(t.identifier === lookTouchId){ lookTouchId = null; }
    }
  });

  // Any touch that lands on the canvas itself (not the joystick or a button,
  // since those are separate elements the touch would never reach here) becomes
  // the look-around touch, if one isn't already active.
  renderer.domElement.addEventListener('touchstart', e=>{
    for(const t of e.changedTouches){
      if(t.identifier === joyTouchId) continue;
      if(lookTouchId === null){
        lookTouchId = t.identifier;
        lookLastX = t.clientX; lookLastY = t.clientY;
      }
    }
  }, {passive:true});

  jumpBtn.addEventListener('touchstart', e=>{ e.preventDefault(); tryCityJump(); });
  interactBtn.addEventListener('touchstart', e=>{ e.preventDefault(); onInteractDown(); });
  interactBtn.addEventListener('touchend',   e=>{ e.preventDefault(); onInteractUp(); });
  runBtn.addEventListener('touchstart', e=>{ e.preventDefault(); moveState.run=true; runBtn.classList.add('active'); });
  runBtn.addEventListener('touchend',   e=>{ e.preventDefault(); moveState.run=false; runBtn.classList.remove('active'); });
}

// ─── GAME LOOP ────────────────────────────────────────────────────────────────
const SPEED=8;
let _frames = 0;
function animate(){
  requestAnimationFrame(animate);
  _frames++;
  const _fc = document.getElementById('_dbgFrames');
  if(_fc) _fc.textContent = 'Frames: ' + _frames + ' | canvas: ' + (renderer&&renderer.domElement ? renderer.domElement.width+'x'+renderer.domElement.height : 'none');
  const dt=clock.getDelta(), t=clock.getElapsedTime();

  updateDayNight();
  tickKaraokeDisplay();
  if(t - _lastPresenceSync > PRESENCE_SYNC_INTERVAL) { _lastPresenceSync = t; syncPresence(t); }
  updateRemotePlayers(dt);
  updateRemoteKillers(dt);
  if(t - _lastLandSync > LAND_SYNC_INTERVAL) { _lastLandSync = t; syncLandOwners(); }
  if(t - _lastShopSync > SHOP_SYNC_INTERVAL) { _lastShopSync = t; syncShops(); }
  if(t - _lastStockSync > STOCK_SYNC_INTERVAL) { _lastStockSync = t; syncStocks(); }
  if(t - _lastMailboxSync > MAILBOX_SYNC_INTERVAL) { _lastMailboxSync = t; syncMailbox(); }
  if(t - _lastLightCullSync > LIGHT_CULL_INTERVAL) { _lastLightCullSync = t; cullDistantLights(); }
  if(activeKnockbacks.length) tickKnockbacks(dt);
  if(placingStore) updatePlacementMarker();

  // The Sea: real swim-zone detection (only counts once actually standing in the water, not just
  // on the sand), plus a few decorative fish gently bobbing for real atmosphere.
  inWater = inSea && Math.hypot(playerGroup.position.x - SEA_WATER_CENTER.x, playerGroup.position.z - SEA_WATER_CENTER.z) < SEA_WATER_RADIUS;
  if (inSea && seaFish.length) {
    seaFish.forEach(f => {
      f.mesh.position.x = f.baseX + Math.sin(t*0.6 + f.phase)*3;
      f.mesh.position.z = f.baseZ + Math.cos(t*0.4 + f.phase)*2;
      f.mesh.rotation.y = Math.atan2(Math.cos(t*0.4 + f.phase)*-2*0.4, Math.cos(t*0.6 + f.phase)*3*0.6);
    });
  }

  // Arena free-for-all: enter/exit detection, knockout-cooldown timer, leaderboard sync
  {
    const wasInArena = inArena;
    const dArena = Math.hypot(playerGroup.position.x - ARENA_CENTER.x, playerGroup.position.z - ARENA_CENTER.z);
    inArena = dArena < ARENA_RADIUS && !inHouse && !inMall && !inCar;
    if(inArena && !wasInArena) { ffaAlive = true; showNotif('⚔️ Fight Arena — anyone here can hit anyone! Press E to swing.'); }
    if(!inArena && wasInArena) { updateFfaLeaderboardUI(); }
    if(inArena && !ffaAlive && t >= ffaRespawnAt) { ffaAlive = true; showNotif('💪 Back in the fight!'); }
    if(inArena && t - _lastFfaSync > FFA_SYNC_INTERVAL) { _lastFfaSync = t; syncFfaLeaderboard(); }
  }
  if(serverMode === 'online' && t - _lastWorldEventSync > WORLD_EVENT_SYNC_INTERVAL) { _lastWorldEventSync = t; syncWorldEvent(); }
  tickWorldEvent(dt);
  tickInvasionCombat(dt);
  if(serverMode === 'online' && t - _lastTerritorySync > TERRITORY_SYNC_INTERVAL) { _lastTerritorySync = t; syncTerritories(); }
  tickWar(t);
  tickWarCombat(dt);
  if(serverMode === 'online' && t - _lastBossSync > BOSS_SYNC_INTERVAL) { _lastBossSync = t; syncBosses(); }
  if(t - _lastEarningsCheck > EARNINGS_CHECK_INTERVAL) { _lastEarningsCheck = t; tickEarnings(); }
  tickBossHud();
  tickBossChase(dt);
  tickMovieBossFight(dt);
  tickArenaRobots(dt);
  tickWrath(dt);
  tickSatanEvent(dt);

  // Movement with collision
  let moving=false;
  if(!inCar && !playerSeated && !onBankWall){
    const dir=new THREE.Vector3();
    const fwd=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
    const right=new THREE.Vector3(-Math.cos(yaw),0,Math.sin(yaw));
    if(moveState.w) dir.add(fwd);
    if(moveState.s) dir.sub(fwd);
    if(moveState.d) dir.add(right);
    if(moveState.a) dir.sub(right);
    moving=dir.length()>0;
    if(!rollerVel) rollerVel = new THREE.Vector3();
    if(moving){
      dir.normalize();
      const carryMult = carriedBoxes.length ? Math.max(0.65, 1 - carriedBoxes.length*0.1) : 1; // a light penalty for a full arm-load
      const sickMult = sick ? 0.6 : 1; // real, felt slowdown while sick — not just a HUD label
      const embarrassedMult = playTimeSeconds < embarrassedUntil ? 0.7 : 1; // after a toilet accident
      const swimMult = inWater ? 0.55 : 1; // real swimming, genuinely slower than running on land
      const tiredMult = tiredness <= 0 ? 0.7 : 1; // real, felt slowdown once exhausted — not just a HUD label
      const addonSpeedMult = (activeAddOns.includes('speedboost')?1.6:1) * (activeAddOns.includes('slowmo')?0.5:1) * carryMult * sickMult * embarrassedMult * swimMult * tiredMult;
      const step=SPEED*(moveState.run?1.85:1)*addonSpeedMult*dt;
      const nx=playerGroup.position.x+dir.x*step;
      const nz=playerGroup.position.z+dir.z*step;
      if(!isBlocked(nx, playerGroup.position.z)) playerGroup.position.x=nx;
      if(!isBlocked(playerGroup.position.x, nz)) playerGroup.position.z=nz;
      if(activeAddOns.includes('rollerfeet') && dt>0) rollerVel.set(dir.x*step/dt, 0, dir.z*step/dt);
      // Every pocket interior (House/Mall/Hotel/Store/FriendHouse/Prison/SportsPark/Hospital/Sea)
      // now lives 10,000+ units out from downtown, so none of them can be subject to the outdoor
      // city's boundary — before this only excluded inHouse/inMall, which silently worked only
      // because Hotel/Store/FriendHouse/Prison used to sit at 750-1200, still inside the old
      // +-1950 clamp by coincidence. Real bug found while adding the Sea: SportsPark/Hospital
      // were added later (own 130000/140000 lanes) without ever being added here — meaning any
      // movement key press inside either one snapped the player straight back to x=11000 in the
      // real outdoor city, since 130000/140000 is always outside WORLD_BOUND. Fixed here (and in
      // the 5 other copies of this same "am I outdoors" check) alongside adding Sea's own flag.
      if(!inHouse && !inMall && !inHotel && !inStore && !inFriendHouse && !inLandHouse && !inCountryHotel && !inAirportLounge && !inPrison && !inArcade && !inArenaBattle && !inMovieFight && !inBankInterior && !inSportsPark && !inHospital && !inSea){
        playerGroup.position.x=Math.max(-WORLD_BOUND,Math.min(WORLD_BOUND,playerGroup.position.x));
        playerGroup.position.z=Math.max(-WORLD_BOUND,Math.min(WORLD_BOUND,playerGroup.position.z));
        const _px=playerGroup.position.x, _pz=playerGroup.position.z;
        // Real bug fix: this used to trigger on ANY _pz below -2.5 with no lower bound — meaning
        // walking the direct route to Whispering Woods (crosses x:73-87 around z=-107 to -131,
        // FAR south of the actual mall doors at z≈-2.5 to -4) got sucked into the mall every time.
        // Bounded to the real doorway/entrance-canopy depth so only actually walking up to the
        // mall's own front door triggers it.
        if(_px>73 && _px<87 && _pz<-2.5 && _pz>-7) enterMall();
      }
      playerGroup.rotation.y=yaw;
    } else if(activeAddOns.includes('rollerfeet') && rollerVel.lengthSq()>0.01) {
      const nx=playerGroup.position.x+rollerVel.x*dt;
      const nz=playerGroup.position.z+rollerVel.z*dt;
      if(!isBlocked(nx, playerGroup.position.z)) playerGroup.position.x=nx; else rollerVel.x=0;
      if(!isBlocked(playerGroup.position.x, nz)) playerGroup.position.z=nz; else rollerVel.z=0;
      rollerVel.multiplyScalar(0.9);
    } else {
      rollerVel.set(0,0,0);
    }
  }
  // Jump / gravity (vertical motion, works even while standing still)
  if(!inCar && !playerSeated && !onBankWall && (!onGround || jumpVel!==0 || inOuterSpace || inWater)){
    // Real zero-g: barely any pull at all while inOuterSpace, so a tap of the thruster (tryCityJump)
    // carries you a long way up and you drift back down slowly — nothing like the merely-reduced
    // "moon gravity" the Space Station's ground platform already had before this. currentGravity()
    // now covers every real gravity zone (Space Station/Moon/Mars/Jupiter/Andromeda), not just one.
    jumpVel -= (inOuterSpace ? 3 : inWater ? 4 : activeAddOns.includes('moonjump') ? 14 : currentGravity())*dt;
    playerGroup.position.y += jumpVel*dt;
    if (inWater) {
      // Floating between the surface (0) and a real dive depth (-3) — swimming isn't standing on
      // a floor, so this is a soft range clamp instead of the hard ground-only landing below.
      if (playerGroup.position.y > 0) { playerGroup.position.y = 0; jumpVel = 0; }
      else if (playerGroup.position.y < -3) { playerGroup.position.y = -3; jumpVel = 0; }
      onGround = false; // never "landed" while swimming — tryCityJump always dives/surfaces here, never a ground jump
    } else if(playerGroup.position.y<=0){
      playerGroup.position.y=0;
      if(inOuterSpace) { inOuterSpace = false; showNotif('🌍 You drift back down and touch down on the Space Station platform.'); }
      if(activeAddOns.includes('bouncyshoes')) { jumpVel=12; onGround=false; }
      else { jumpVel=0; onGround=true; jumpsUsed=0; }
    }
  }
  if(inCar&&activeCar){
    const CAR_TURN=2.2;
    if(moveState.d) carYaw+=CAR_TURN*dt;
    if(moveState.a) carYaw-=CAR_TURN*dt;
    if(moveState.w||moveState.s){
      const vehicleSpeedMult = (activeAddOns.includes('turboboost')?1.6:1) * ((nitroEndTime && t<nitroEndTime)?2.2:1);
      if(nitroEndTime && t>=nitroEndTime) nitroEndTime = 0;
      const spd=activeCar.def.speed*vehicleSpeedMult*(moveState.s?-0.55:1);
      const nx=activeCar.group.position.x+Math.sin(carYaw)*spd*dt;
      const nz=activeCar.group.position.z+Math.cos(carYaw)*spd*dt;
      // Real bug fix: car movement never called isBlocked() at all — driving straight through
      // every building/wall in the game. Uses a real bigger radius matching the car's own body
      // (buildCar() is 4.2 wide x 8.5 long), split into separate x/z checks like on-foot movement
      // already does, so the car can still slide along a wall instead of just freezing dead on contact.
      const CAR_R = 2.3;
      // Ram check runs on the SAME candidate position/radius isBlocked() is about to use, and
      // BEFORE it, so a just-destroyed target's collider is already gone by the time isBlocked()
      // runs this same frame — the car smashes straight through instead of bouncing off a
      // now-invisible wall where the target used to stand.
      tickCarRam(nx, nz, CAR_R);
      const blockedX = isBlocked(nx, activeCar.group.position.z, CAR_R);
      const blockedZ = isBlocked(activeCar.group.position.x, nz, CAR_R);
      if(!blockedX) activeCar.group.position.x=Math.max(-WORLD_BOUND,Math.min(WORLD_BOUND,nx));
      if(!blockedZ) activeCar.group.position.z=Math.max(-WORLD_BOUND,Math.min(WORLD_BOUND,nz));
      // Buildings aren't destroyable like item 160's NPCs/robots/trees (they're permanent city
      // architecture) — ramming one instead charges a real repair fee, same spirit, different cost.
      if(blockedX || blockedZ) crashIntoBuilding(activeCar.group.position.x, activeCar.group.position.z);
    }
    activeCar.group.rotation.y=carYaw;
    activeCar.carYaw=carYaw;
    playerGroup.position.x=activeCar.group.position.x;
    playerGroup.position.z=activeCar.group.position.z;
    if(activeAddOns.includes('rainbowpaint') && activeCar.group.bodyMesh) {
      const carHue = (t*80) % 360;
      const cc = new THREE.Color(); cc.setHSL(carHue/360, 0.9, 0.55);
      activeCar.group.bodyMesh.material.color.copy(cc);
      activeCar.group.cabinMesh.material.color.copy(cc);
    }
  }

  // Walk animation
  if(!inCar){
    const swingAmp = activeAddOns.includes('noodlearms') ? 1.3 : 0.4;
    const swing=moving?Math.sin(t*8)*swingAmp:0;
    if(player.lArm) player.lArm.rotation.x= swing;
    if(player.rArm) player.rArm.rotation.x=-swing;
    // Real bug the user caught: strafing (A/D with no W/S held) used this exact same front-to-
    // back leg swing as walking forward, so sidestepping looked identical to walking straight
    // ahead. Pure strafing (no forward/back component at all) now swings the legs apart
    // side-to-side (rotation.z) instead of front-to-back (rotation.x) — a real, visually
    // distinct side-step shuffle. Forward/backward, and any diagonal that still has a
    // forward/back component, keep the original walk cycle. Legs only (not arms) — rArm's
    // rotation.z is already owned by the attack-swing animation just below and would get
    // stomped back to 0 every frame if reused here.
    const strafingOnly = moving && !moveState.w && !moveState.s && (moveState.a || moveState.d);
    if(strafingOnly){
      if(player.lLeg) { player.lLeg.rotation.x = 0; player.lLeg.rotation.z = -swing; }
      if(player.rLeg) { player.rLeg.rotation.x = 0; player.rLeg.rotation.z =  swing; }
    } else {
      if(player.lLeg) { player.lLeg.rotation.x = -swing; player.lLeg.rotation.z = 0; }
      if(player.rLeg) { player.rLeg.rotation.x =  swing; player.rLeg.rotation.z = 0; }
    }
    if(player.headMesh) {
      player.headMesh.rotation.z = (moving && activeAddOns.includes('bobblehead')) ? Math.sin(t*10)*0.25 : 0;
      player.headMesh.scale.setScalar(activeAddOns.includes('bighead') ? 1.7 : 1);
    }
  }
  // Character-scale add-ons — recomputed every frame so they self-correct after any rebuild
  if(playerGroup) {
    playerGroup.scale.setScalar(activeAddOns.includes('giantmode') ? 1.8 : activeAddOns.includes('tinymode') ? 0.5 : 1);
  }
  // Rainbow Skin — cycles the real skin-mesh hue live, same tagged-mesh array body paint uses
  if(activeAddOns.includes('rainbowskin') && player.skinMeshes) {
    const hue = (t*80) % 360;
    const rc = new THREE.Color(); rc.setHSL(hue/360, 0.9, 0.6);
    player.skinMeshes.forEach(m => m.material.color.copy(rc));
  }
  // Trippy Vision — the only camera filter that needs a per-frame update (continuous hue cycle)
  if(activeAddOns.includes('trippy')) { _trippyHue = (_trippyHue + dt*90) % 360; applyCameraFX(); }
  // Movement trails — real particles spawned behind the player while walking
  if(moving && !inCar) {
    if(activeAddOns.includes('sparkletrail') && Math.random()<0.45) spawnParticle(playerGroup.position, 0xffffaa, {size:0.09, life:0.5});
    if(activeAddOns.includes('firetrail') && Math.random()<0.55) spawnParticle(playerGroup.position, [0xff6600,0xff2200,0xffaa00][Math.floor(Math.random()*3)], {size:0.13, life:0.45});
    if(activeAddOns.includes('icetrail') && Math.random()<0.45) spawnParticle(playerGroup.position, 0x88ddff, {size:0.11, life:0.55});
  }
  // Advance every live trail/burst particle, real position+fade, remove when its life runs out
  for(let pi=trailParticles.length-1; pi>=0; pi--) {
    const p = trailParticles[pi];
    p.life -= dt;
    p.mesh.position.x += p.vx*dt;
    p.mesh.position.y += p.vy*dt;
    p.mesh.position.z += p.vz*dt;
    if(p.gravity) p.vy -= 3*dt;
    const lifeFrac = Math.max(0, p.life/p.maxLife);
    p.mesh.material.opacity = lifeFrac;
    p.mesh.scale.setScalar(0.4+lifeFrac*0.6);
    if(p.life<=0) { scene.remove(p.mesh); trailParticles.splice(pi,1); }
  }
  // Punch / weapon swing — charging (holding E near a fightable target) winds the right arm
  // back the longer it's held (capped at PUNCH_MAX_CHARGE), and releasing snaps it forward
  // into a real swing — same t-based arc technique as the walk cycle above, not a
  // fire-and-forget setTimeout chain that could drift out of sync with the render loop. A
  // harder charge (playerSwingPower, baked in by triggerSwing() at release time) swings both
  // the arm and any held weapon further and a touch slower, so it reads as heavier landing.
  if(chargingPunch) {
    const heldT = Math.min(t - punchChargeStart, PUNCH_MAX_CHARGE);
    const chargeFrac = heldT / PUNCH_MAX_CHARGE;
    if(player.rArm) { player.rArm.rotation.x = -0.3 - chargeFrac*1.1; player.rArm.rotation.z = -chargeFrac*0.35; }
    if(player.weaponGroup) { player.weaponGroup.rotation.z = -0.2 + chargeFrac*0.3; player.weaponGroup.rotation.x = -chargeFrac*0.3; }
    const chargeHud = document.getElementById('punchChargeHud');
    if(chargeHud) { chargeHud.style.display = 'block'; document.getElementById('punchChargeFill').style.width = (chargeFrac*100) + '%'; }
  } else {
    const chargeHud = document.getElementById('punchChargeHud');
    if(chargeHud) chargeHud.style.display = 'none';
    const swingElapsed = t - playerSwingStart;
    const swingWindow = SWING_DURATION + playerSwingPower*0.15;
    const swingActive = swingElapsed >= 0 && swingElapsed < swingWindow;
    const arc = swingActive ? Math.sin((swingElapsed/swingWindow)*Math.PI) : 0; // 0 -> 1 -> 0, smooth in and out
    if(player.rArm) {
      if(swingActive) { player.rArm.rotation.x = -0.3 + arc*(1.0 + playerSwingPower*0.9); player.rArm.rotation.z = -0.1 + arc*0.25; }
      else player.rArm.rotation.z = 0; // rotation.x while idle/walking is already owned by the walk cycle above
    }
    if(player.weaponGroup) {
      player.weaponGroup.rotation.z = -0.2 - arc*(1.3 + playerSwingPower*0.8);
      player.weaponGroup.rotation.x = arc*(0.5 + playerSwingPower*0.4);
    }
  }
  // Training dummy — tips away from the hit and springs back upright (same
  // charge-scaled feel as the real position knockback above, but it stays anchored
  // to its fixed interact zone instead of drifting off after a few punches).
  if(DUMMY.mesh && !DUMMY.defeated) {
    const dke = t - dummyKnockStart;
    if(dke >= 0 && dke < DUMMY_KNOCK_DURATION) {
      const p = dke / DUMMY_KNOCK_DURATION;
      const tilt = Math.sin(p*Math.PI) * (0.15 + playerSwingPower*0.35);
      DUMMY.mesh.rotation.x = -dummyKnockDirZ * tilt;
      DUMMY.mesh.rotation.z =  dummyKnockDirX * tilt;
    } else {
      DUMMY.mesh.rotation.x = 0; DUMMY.mesh.rotation.z = 0;
    }
  }
  if(player.nametag) player.nametag.lookAt(camera.position);

  // Buddy — lags a step behind the player toward a spot just behind-and-beside them, so it
  // reads as "following", not glued to the player's back like a backpack. UNLESS a robber is
  // nearby and revealed — then it breaks off and actually chases the robber instead (see
  // BUDDY_ROBBER_CHASE_RADIUS/nearestRevealedRobber, game-world.js), catching up faster than the
  // normal follow speed so it visibly reads as going after something, not just drifting.
  if(buddyGroup) {
    const chaseRobber = nearestRevealedRobber(playerGroup.position.x, playerGroup.position.z, BUDDY_ROBBER_CHASE_RADIUS);
    let targetX, targetZ, followLerp, faceYaw;
    if (chaseRobber) {
      const dx = chaseRobber.x - buddyGroup.position.x, dz = chaseRobber.z - buddyGroup.position.z;
      const d = Math.hypot(dx, dz) || 1;
      const standoff = Math.min(d, 1.2); // stop just short, don't stand on top of it
      targetX = chaseRobber.x - (dx/d)*standoff;
      targetZ = chaseRobber.z - (dz/d)*standoff;
      followLerp = Math.min(1, dt*6);
      faceYaw = Math.atan2(dx, dz);
    } else {
      targetX = playerGroup.position.x - Math.sin(yaw)*1.6 - Math.cos(yaw)*0.9;
      targetZ = playerGroup.position.z - Math.cos(yaw)*1.6 + Math.sin(yaw)*0.9;
      followLerp = Math.min(1, dt*3);
      faceYaw = yaw;
    }
    const buddyMoved = Math.hypot(targetX-buddyGroup.position.x, targetZ-buddyGroup.position.z) > 0.05;
    buddyGroup.position.x += (targetX - buddyGroup.position.x) * followLerp;
    buddyGroup.position.z += (targetZ - buddyGroup.position.z) * followLerp;
    buddyGroup.position.y = playerGroup.position.y + Math.sin(t*4)*0.06;
    buddyGroup.rotation.y += (faceYaw - buddyGroup.rotation.y) * followLerp;
    buddyGroup.scale.setScalar(activeAddOns.includes('petxl') ? 1.6 : activeAddOns.includes('petmini') ? 0.6 : 1);
    if(activeAddOns.includes('petrainbow') && buddyMeshes) {
      const phue = (t*80) % 360;
      const pc = new THREE.Color(); pc.setHSL(phue/360, 0.9, 0.6);
      buddyMeshes.body.forEach(m => m.material.color.copy(pc));
      buddyMeshes.accent.forEach(m => m.material.color.copy(pc));
    }
    if(activeAddOns.includes('petsparkle') && buddyMoved && Math.random()<0.4) spawnParticle(buddyGroup.position, 0xffddff, {size:0.08, life:0.5});
  }

  // Adopted child — same lag-behind-follow pattern as Buddy, opposite side so they don't overlap.
  // Scale is NOT set here (tickGrowth owns it, based on the child's own growth clock) — just position/facing.
  if(familyKidGroup) {
    const targetX = playerGroup.position.x - Math.sin(yaw)*1.6 + Math.cos(yaw)*0.9;
    const targetZ = playerGroup.position.z - Math.cos(yaw)*1.6 - Math.sin(yaw)*0.9;
    const followLerp = Math.min(1, dt*3);
    familyKidGroup.position.x += (targetX - familyKidGroup.position.x) * followLerp;
    familyKidGroup.position.z += (targetZ - familyKidGroup.position.z) * followLerp;
    familyKidGroup.position.y = playerGroup.position.y;
    familyKidGroup.rotation.y += (yaw - familyKidGroup.rotation.y) * followLerp;
  }

  // Camera — skipped entirely while a Cab ride or a flight is flying its own camera path through
  // the real scene (game-transit.js, startCabRide()/startFlightAnim()); this per-frame follow
  // logic would otherwise fight it every single frame and win, since it runs unconditionally after.
  if(inCabRide || inFlightRide){
    // no-op — the ride's own draw() loop owns camera.position/lookAt for its duration
  } else if(inCar&&activeCar){
    const camX=activeCar.group.position.x-Math.sin(carYaw)*18;
    const camY=activeCar.group.position.y+9;
    const camZ=activeCar.group.position.z-Math.cos(carYaw)*18;
    camera.position.lerp(new THREE.Vector3(camX,camY,camZ),0.08);
    camera.lookAt(activeCar.group.position.x,2,activeCar.group.position.z);
  } else {
    const interior = inHotel || inHouse || inMall || inStore || inArcade || inFriendHouse || inLandHouse || inCountryHotel || inAirportLounge || inBankInterior;
    const camDist = interior ? 4 : 9;
    const camHeight = interior ? 2.5 : 4;
    const camX=playerGroup.position.x-Math.sin(yaw)*camDist;
    const camY=playerGroup.position.y+camHeight+pitch*(interior?2:4);
    const camZ=playerGroup.position.z-Math.cos(yaw)*camDist;
    camera.position.lerp(new THREE.Vector3(camX,camY,camZ),0.12);
    camera.lookAt(playerGroup.position.x,playerGroup.position.y+2.2,playerGroup.position.z);
  }
  // Auto-exit interiors if player walks through door gap
  if(inHotel && playerGroup.position.z > 5.5)  checkoutHotel();
  if(inHouse && playerGroup.position.z > 8.5)  exitHouse();
  if(inMall  && playerGroup.position.z > 25)   exitMall();
  if(inStore && playerGroup.position.z > 8.5)  exitStore();
  if(inFriendHouse && playerGroup.position.z > FRIEND_HOUSE_SPAWN.z + 7.5) leaveFriendHouse();
  if(inLandHouse && playerGroup.position.z > LAND_HOUSE_SPAWN.z + 5.5) exitLandHouse();
  if(inCountryHotel && playerGroup.position.z > COUNTRY_HOTEL_SPAWN.z + 4.5) checkoutCountryHotel();
  if(inAirportLounge && playerGroup.position.z > AIRPORT_LOUNGE_SPAWN.z + 7.5) exitAirportLounge();
  if(inArcade && playerGroup.position.z > 16.5) leaveArcade();
  if(inBankInterior && playerGroup.position.z > BANK_INTERIOR_EXIT.z + 1.5) exitBankInterior();

  // NPC movement
  const shoppersToRemove = [];
  npcs.forEach((npc,ni)=>{
    if(npc.seated){ if(npc.tag) npc.tag.lookAt(camera.position); return; } // seated NPCs stay put in their chair
    if(npc.waitTime>0){npc.waitTime-=dt;return;}
    const tgt=npc.patrol[npc.patrolIdx];
    const dx=tgt[0]-npc.group.position.x, dz=tgt[1]-npc.group.position.z;
    const dist=Math.sqrt(dx*dx+dz*dz);
    if(dist<0.5){
      // A shopper reaching the door on its SECOND leg (patrolIdx already 1) means it's leaving — despawn it
      if(npc.isShopper && npc.patrolIdx===1){ shoppersToRemove.push(npc); return; }
      npc.patrolIdx=(npc.patrolIdx+1)%npc.patrol.length;
      npc.waitTime=0.8+Math.random()*1.2;
      if(npc.isShopper && npc.patrolIdx===1) npc.speed *= 2.5; // done at the register — runs out with joy
    }
    else{
      npc.group.position.x+=dx/dist*npc.speed*dt;
      npc.group.position.z+=dz/dist*npc.speed*dt;
      npc.group.rotation.y=Math.atan2(dx,dz);
      const sw=Math.sin(t*6+ni)*0.35;
      npc.group.children.forEach((c,ci)=>{if(ci===4)c.rotation.x=-sw;if(ci===5)c.rotation.x=sw;if(ci===2)c.rotation.x=sw;if(ci===3)c.rotation.x=-sw;});
    }
    if(npc.tag) npc.tag.lookAt(camera.position);
  });
  shoppersToRemove.forEach(npc=>{
    scene.remove(npc.group);
    const i = npcs.indexOf(npc); if(i>-1) npcs.splice(i,1);
    giveShopperTip();
  });

  // Robots wander near their spawner — real movement (not chase AI), fighting is still a walk-up-and-press-E deal
  robots.forEach(r => {
    if(!r.alive) return;
    const wdx = r.wanderX-r.x, wdz = r.wanderZ-r.z;
    const wdist = Math.sqrt(wdx*wdx+wdz*wdz);
    if(wdist < 0.4) {
      const ang = Math.random()*Math.PI*2, rad = 3+Math.random()*4;
      r.wanderX = r.homeX + Math.cos(ang)*rad;
      r.wanderZ = r.homeZ + Math.sin(ang)*rad;
    } else {
      r.x += wdx/wdist*r.speed*dt;
      r.z += wdz/wdist*r.speed*dt;
      r.mesh.position.set(r.x, 0, r.z);
      r.mesh.rotation.y = Math.atan2(wdx, wdz);
      r.zone.x = r.x; r.zone.z = r.z;
    }
  });

  // Systems
  tickJob(dt);
  tickBankJob(dt);
  tickPrinter(dt);
  tickCounter(dt);
  tickCook(dt);
  tickWanted(dt);
  tickCelebrities(dt);
  tickCelebrityCrowds(dt);
  tickPresidents(dt);
  tickElders(dt);
  tickGrowth(dt);
  tickSchoolEvent();
  tickHunger(dt);
  tickSickness();
  tickBladder(dt);
  tickTiredness(dt);
  tickTraffic(dt);
  tickMachines(dt);
  tickTubeWorld(dt);
  tickTubeGrowth(dt);
  tickRogueRobots(dt);
  tickKillers(dt);
  tickCoinBots(dt);
  tickPoliceHelpers(dt);
  tickCompanionAssist(dt);
  tickEvilAllies(dt);
  billTimerTick(dt);
  tickBillsOverdue();
  tickCarImpactDebris(dt);
  tickPrison(dt);
  tickHealth(dt);
  updatePrompt();

  // Location label
  if(inHotel) {
    const roomLabel = currentHotelRoom==='luxury'?'👑 Luxury Suite':currentHotelRoom==='standard'?'✨ Standard Room':'🛏️ Budget Room';
    document.getElementById('location').textContent=`🏨 Hotel – ${roomLabel}`;
  } else if(inHouse) {
    document.getElementById('location').textContent='🏠 Inside Your House';
  } else if(inMall) {
    document.getElementById('location').textContent='🏬 City Mall';
  } else if(inArcade) {
    document.getElementById('location').textContent='🕹️ Pixel Palace Arcade';
  } else {
    const px2=playerGroup.position.x, pz=playerGroup.position.z;
    let loc='Explox City';
    for(const z of LOC_ZONES){if(Math.sqrt((px2-z.x)**2+(pz-z.z)**2)<z.r){loc=z.name;break;}}
    document.getElementById('location').textContent='📍 '+loc;
  }

  weatherParticles.forEach(p => {
    p.position.y -= p._speed * dt;
    p.position.x += p._driftX;
    p.position.z += p._driftZ;
    if(p._spin) p.rotation.z += p._spin;
    if(p.position.y < -1) {
      p.position.y = 35 + Math.random() * 20;
      p.position.x = playerGroup.position.x + (Math.random()-0.5)*180;
      p.position.z = playerGroup.position.z + (Math.random()-0.5)*180;
    }
  });
  updateNavLine();
  renderer.render(scene,camera);
}

