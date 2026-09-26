// ─── INTERACTION ZONES ───────────────────────────────────────────────────────
const CITY_ZONES = [
  { x:HOUSE_DOOR.x, z:HOUSE_DOOR.z, r:5,  label:'Enter Your House',            action: () => enterHouse()},
  { x:-45, z:-107, r:3.5, label:'🅿️ Park Car Here', action: () => parkCarAtHome()},
  // The 5 shop zones are listed BEFORE "Work as Shopkeeper" below on purpose — updatePrompt()
  // checks zones in this exact array order and stops at the first radius match, and Shopkeeper's
  // big r:16 area (centered right behind the shops) actually overlaps Coffee Shop and Outfit
  // Shop's own r:8 zones. Real bug found live: standing right on top of either shop always showed
  // "Work as Shopkeeper" and could never rob (or even browse) them — Shopkeeper's broad zone was
  // winning every time regardless of alignment, since it was checked first. Listing the smaller,
  // more specific shop zones first means a shop's own prompt always wins over the shift job's,
  // and the Shopkeeper zone still works completely normally everywhere outside those two shops.
  { x:58,  z:54,  r:8,  label:'☕ Coffee Shop',  action: ()=>shopOrRob('Coffee Shop', 8,35),  isShop:true },
  { x:44,  z:54,  r:8,  label:'🧸 Toy Store',    action: ()=>shopOrRob('Toy Store',  15,50),  isShop:true },
  { x:70,  z:54,  r:8,  label:'👗 Outfit Shop',  action: ()=>{ alignment==='bad'?robShop('Outfit Shop',65):enterShopInterior('outfitshop'); }, isShop:true },
  { x:84,  z:54,  r:8,  label:'⚔️ Weapon Shop',  action: ()=>{ alignment==='bad'?robShop('Weapon Shop',80):enterShopInterior('armory'); }, isShop:true },
  { x:20,  z:88,  r:8,  label:'🍕 Pizza Place',  action: ()=>shopOrRob('Pizza Place', 10,30), isShop:true },
  { x:65,  z:48,  r:16, label:'Work as Shopkeeper (+5 S.I.P./task)',           action: ()=>toggleJob('Shopkeeper',5,'📦 A customer needs help!'), isJobZone:true, jobType:'Shopkeeper' },
  { x:12,  z:92,  r:3,  label:'🧊 Get Ingredients from Fridge',                action: () => getIngredients(),    isFridge:true },
  { x:28,  z:92,  r:3,  label:'🔪 Prep Counter — chop & prepare',              action: () => prepareFood(),       isPrep:true },
  { x:20,  z:92,  r:4,  label:'🔥 Cook at Stove',                              action: () => startCooking(),      isStove:true },
  { x:12,  z:96,  r:4,  label:'🍽️ Deliver to customer (+20 S.I.P.)',           action: ()=>serveAtTable(0), isServe:true },
  { x:20,  z:96,  r:4,  label:'🍽️ Deliver to customer (+20 S.I.P.)',           action: ()=>serveAtTable(1), isServe:true },
  { x:28,  z:96,  r:4,  label:'🍽️ Deliver to customer (+20 S.I.P.)',           action: ()=>serveAtTable(2), isServe:true },
  { x:-68, z:10,  r:14, label:'Work as Officer (+10 S.I.P./task)',             action: ()=>toggleJob('Officer',10,'🚨 Trouble downtown — respond!'), isJobZone:true, jobType:'Officer' },
  // FACTORIES — real Industrial District east of downtown (see FACTORY_DEFS/buildFactories(),
  // game-buildings.js, for the real exteriors + why this exact spot is clear of every other
  // building). Same generic toggleJob() pattern as Shopkeeper/Officer above, just 3 more of them —
  // pay scales up from Officer's +10 since this is real manual labor, same reasoning Bank Jobs pay
  // more for a bigger time commitment, but stays in a reasonable range rather than jumping wildly.
  { x:240, z:-29, r:14, label:'Work at Toy Factory (+12 S.I.P./task)',         action: ()=>toggleJob('Toy Factory Worker',12,'🧸 A toy needs assembling!'), isJobZone:true, jobType:'Toy Factory Worker' },
  { x:330, z:-29, r:14, label:'Work at Auto Parts Factory (+15 S.I.P./task)',  action: ()=>toggleJob('Auto Parts Worker',15,'🔧 A car part needs assembling!'), isJobZone:true, jobType:'Auto Parts Worker' },
  { x:420, z:-29, r:14, label:'Work at Robot Parts Factory (+18 S.I.P./task)', action: ()=>toggleJob('Robot Parts Worker',18,'⚙️ A robot chassis needs bolting together!'), isJobZone:true, jobType:'Robot Parts Worker' },
  // ACTOR — real "Work as an Actor" job (user's own ask: "add acting"), at the theater's own
  // Actors Entrance (game-buildings.js), clear of the main "Pick a Movie" zone below (x:50,z:-72,r:8).
  // r:9 (bigger than a normal job zone's walk-up radius) — once a task is live, E fights a real
  // stunt double spawned a couple units away (spawnActorStuntFight()/fightActorStunt(),
  // game-alignment.js), so there has to be room to actually stand next to it and swing.
  { x:30, z:-68, r:9, label:`🎭 Work as an Actor (+${ACTOR_PAY} S.I.P./task)`, action: () => startActingJob(), isJobZone:true, jobType:'Actor' },
  { x:34,  z:3,   r:5,  label:'🕴️ Talk to Shady Dealer',                       action: () => toggleAlignment(),   isDealerZone:true },
  { x:-80, z:-71, r:5,  label:'⬛ ???',                                         action: () => openBlackMarket(),   isBlackMarket:true },
  { x:160, z:218, r:7,  label:'🏦 Enter City Bank',                             action: () => openBankPasscode()},
  // Printer/Counter moved INSIDE the Bank (see BANK_INTERIOR_ZONES) — user's own ask: "to work as
  // money printer or counter you have to go inside th bank." This outdoor door leads there; Guard's
  // 2 zones below stay outdoor since Guard is exempt from the "go inside" requirement.
  { x:BANK_INTERIOR_ENTRANCE.x, z:BANK_INTERIOR_ENTRANCE.z, r:5, label:'🚪 Bank Employee Entrance', action: () => enterBankInterior()},
  { x:160, z:246, r:6,  label:'💂 Work as Guard (5,000 S.I.P. after 20 min)',              action: ()=>toggleBankJob('guard','sip'),     isBankJobZone:true, bankJobId:'guard',   currency:'sip' },
  { x:174, z:246, r:6,  label:'💂 Work as Guard (2,500 💎 after 20 min)',                   action: ()=>toggleBankJob('guard','elite'),   isBankJobZone:true, bankJobId:'guard',   currency:'elite' },
  { x:BANK_WALL_STAIR_BASE.x, z:BANK_WALL_STAIR_BASE.z, r:3, label:'🪜 Climb the Bank wall (Guard duty)', action: () => climbBankWall()},
  // Real bug found live via user's own follow-up: this used to jump STRAIGHT to the kid-
  // enrollment menu (openSchool(), game-shops.js) — the player's own character had no way to
  // actually go to school themselves, just to manage an adopted kid's enrollment. Now the door
  // opens a small real choice (openSchoolEntrance(), further down this file) between walking in
  // as yourself (enterSchool() — a real pocket-space classroom, game-land.js) or the existing
  // kid menu, which is untouched and still one click away.
  // Real bug found live: r:12 exactly equals the building's own addCol half-depth (game-buildings.js,
  // addCol(CITY_COLS,70,60,19,12)) — since the player's own collision radius (~0.65) keeps them
  // 12.7 units from center at the closest, pressed right against the wall, the zone circle (10)
  // never actually reached them. Bumped to 13 so standing at the wall is genuinely inside it.
  { x:70,  z:60,  r:13, label:'🏫 Enter School',                                action: () => openSchoolEntrance()},
  { x:50,  z:-72, r:8,  label:'🎬 Movie Theater – Pick a Movie!', action: () => openCinema()},
  { x:0,   z:50,  r:13, label:'🚇 S.I.T.S. Transit Hub – Ride anywhere!', action: () => openSITS()},
  { x:-15, z:4,   r:8,  label:'🏨 City Hotel – Check In!',               action: () => openHotel()},
  { x:130, z:35,  r:10, label:'🚗 Car Dealership – Buy a car!', action: () => openCarShop()},
  { x:100, z:58,  r:9,  label:'💻 Computer Shop – Buy a computer!', action: () => openComputerShop()},
  { x:-200,z:-182,r:18, label:'✈️ City Airport – Enter the Lounge!', action: () => enterAirportLounge('Downtown Explox', -200, -160, true) },
  { x:110, z:-13, r:8,  label:'🍽️ The Diner – Order a real meal!',  action: () => openRestaurant()},
  { x:160, z:-13, r:8,  label:'🏪 Your Store',    action: () => interactWithStorePlot()},
  { x:40,  z:93,  r:9,  label:'🕹️ Enter Pixel Palace Arcade', action: () => enterArcade()},
  { x:-10, z:-95, r:9,  label:'🏟️ Enter Sports Park', action: () => enterSportsPark()},
  { x:-40, z:74,  r:5,  label:'🏥 City Hospital – See a Doctor!', action: () => enterHospital()},
  { x:SEA_EXIT.x, z:SEA_EXIT.z, r:9, label:'🌊 Enter the Sea', action: () => enterSea()},
  // Real bug found live (user report: "can't get in church") — r:10 exactly equals the building's
  // own addCol half-width/half-depth (game-buildings.js, addCol(CITY_COLS,-40,20,10,10)). The
  // player's own collision radius (~0.65) keeps them 10.7 units from center at the closest,
  // pressed right against the wall, so the zone circle (10) never actually reached them — the
  // church was never enterable at all. Bumped to 11 so standing at the wall is genuinely inside it.
  { x:-40, z:20,  r:11, label:'⛪ Enter Church', action: () => openChurch()},
  // KING EXPLOX MONUMENT — user's own ask: a real statue + a real "origin of Explox" history
  // exhibit (openExploxHistory(), game-library.js), in the plaza between downtown and City Hall.
  { x:0, z:-10, r:6, label:'👑 King Explox Monument — Read the History', action: () => openExploxHistory()},
  // THE MANSION (was "The Office") — admin-only HQ, reskinned as a house per the user's own ask:
  // "the office is a house the biggest best." Same locked-for-everyone-else pattern as the Super
  // Tank/Jet/Motorcycle — openOfficeRequest() (game-admin.js) does its own isAdmin() check and
  // shows the honest locked message itself, so this zone doesn't need a separate gate here.
  { x:300, z:113, r:9, label:'🏠 The Mansion', action: () => openOfficeRequest()},
  // Deliberately placed just south of the Church itself — facing away from it, toward the dark —
  // rather than inside any interior. See challengeSatan() (game-world.js) for the full reasoning.
  { x:-40, z:3,   r:5,  label:'😈 Challenge Satan', action: () => challengeSatan()},
  { x:-75, z:60,  r:11, label:'📚 Enter Library', action: () => openLibrary()},
  { x:SCIENCE_LAB.x, z:SCIENCE_LAB.z, r:11, label:'🧪 Enter Science Lab', action: () => openScienceLab()},
  // CITY HALL — the building has stood in the city as pure decoration since the very first build
  // (buildCity()'s CITY HALL block, game-buildings.js: addCol(CITY_COLS,0,-35, 16,13)). Real first
  // interactive function: a Forms Office (openFormsOffice(), game-shops.js), same sealed-box +
  // circular-door-zone pattern as Library/Science Lab above, not a walk-in interior. Zone centered
  // on the building's own addCol center, radius matching its half-width (16) same ratio those two
  // use against their own half-widths (11).
  { x:0, z:-35, r:17, label:'🏛️ Enter City Hall — Forms Office', action: () => openFormsOffice()},
  { x:210, z:210, r:12, label:'📈 Enter Trading Center', action: () => openTradingCenter()},
];
const HOUSE_ZONES = [
  { x:HOUSE_EXIT.x, z:HOUSE_EXIT.z, r:3, label:'Exit House', action: () => exitHouse()},
  // The Computer and Guest-spot zones used to sit at pre-migration coordinates (x:358/346) — real
  // dead zones ever since the house interior moved out to the HOUSE_SPAWN.x=10000 pocket lane, over
  // 9,600 units away. Fixed to the room's real coordinates, matching where the desk/figure actually are.
  { x:HOUSE_SPAWN.x+8, z:0.5, r:2.2, label:'💻 Use Computer', action: () => openSIB(), isComputer:true },
  { x:HOUSE_SPAWN.x-7, z:HOUSE_SPAWN.z+6, r:2.5, label:'', action: () => sayGoodbyeToGuest(), isGuestSpot:true },
  { x:HOUSE_SPAWN.x+5.5, z:-5,   r:2.5, label:'🛏️ Sleep',        action: () => sleepAtHome()},
  { x:HOUSE_SPAWN.x-4,   z:3,    r:2.2, label:'🛋️ Sit on Sofa',  action: () => sitOnSofa()},
  { x:HOUSE_SPAWN.x+9.5, z:2,    r:1.8, label:'📺 Watch TV',     action: () => watchHotelTV()},
  { x:HOUSE_SPAWN.x-6,   z:-6.3, r:2.5, label:'🍳 Cook a Meal',  action: () => cookMeal()},
  { x:HOUSE_SPAWN.x-9.5, z:-2,   r:2,   label:'📚 Read a Book',  action: () => readBook()},
  { x:HOUSE_SPAWN.x+2.5, z:-6.8, r:1.8, label:'🚽 Use Toilet',   action: () => useToilet()},
];
const HOTEL_ZONES = [
  // Budget room (x=HOTEL_SPAWN.x+0)
  { x:HOTEL_SPAWN.x,   z:6,  r:3, label:'🚪 Check Out of Hotel', action: () => checkoutHotel()},
  { x:HOTEL_SPAWN.x+4, z:-3, r:3, label:'🛏️ Sleep in Bed',       action: () => sleepInHotel()},
  { x:HOTEL_SPAWN.x-4, z:0,  r:3, label:'📺 Watch TV',            action: () => watchHotelTV()},
  // Standard room (x=HOTEL_SPAWN.x+30)
  { x:HOTEL_SPAWN.x+30, z:6,  r:3, label:'🚪 Check Out of Hotel', action: () => checkoutHotel()},
  { x:HOTEL_SPAWN.x+34, z:-3, r:3, label:'🛏️ Sleep in Bed',       action: () => sleepInHotel()},
  { x:HOTEL_SPAWN.x+26, z:0,  r:3, label:'📺 Watch TV',            action: () => watchHotelTV()},
  // Luxury suite (x=HOTEL_SPAWN.x+60)
  { x:HOTEL_SPAWN.x+60, z:6,  r:3, label:'🚪 Check Out of Hotel', action: () => checkoutHotel()},
  { x:HOTEL_SPAWN.x+64, z:-3, r:3, label:'🛏️ Sleep in Bed',       action: () => sleepInHotel()},
  { x:HOTEL_SPAWN.x+56, z:0,  r:3, label:'📺 Watch TV',            action: () => watchHotelTV()},
];
const MALL_ZONES = [
  { x:MALL_EXIT.x, z:MALL_EXIT.z, r:5,  label:'Exit Mall',           action: () => exitMall()},
  { x:MALL_SPAWN.x-27, z:-16,      r:7,  label:'👗 Outfit Shop',       action: ()=>enterShopInterior('outfitshop') },
  { x:MALL_SPAWN.x+27, z:-16,      r:7,  label:'⚔️ Weapon Shop',       action: ()=>enterShopInterior('armory') },
  { x:MALL_SPAWN.x-27, z:-3,       r:7,  label:'💍 Buy Jewelry (30)',   action: ()=>buyItem('Jewelry',30) },
  { x:MALL_SPAWN.x+27, z:-3,       r:7,  label:'📱 Buy Phone (45)',     action: ()=>buyItem('Phone',45) },
  { x:MALL_SPAWN.x+27, z:10,       r:7,  label:'🍦 Buy Ice Cream (8)', action: ()=>buyItem('Ice Cream',8) },
];
// Filled by buildArcadeInterior() — one proximity zone per cabinet/claw machine, so walking
// up to a specific machine and pressing E plays it directly (no flat card-grid lobby anymore).
const ARCADE_ZONES = [];

// A rough, side-effect-free preview of whether E is currently a COMBAT action (mirrors the
// combat branches of handleInteract() below without actually triggering them) — used only to
// decide whether holding E should wind up a charged punch, or fire the normal instant
// interaction (open a shop, sit down, talk to a neighbor...) the moment it's pressed. It
// doesn't need to be perfectly exhaustive: if it under-detects, E just acts instantly like
// before; if it over-detects, the real check inside handleInteract() on release just finds
// nothing to hit and shows "Nothing nearby to interact with." like always.
function isNearCombatTarget() {
  if(playerSeated || inCar) return false;
  const px = playerGroup.position.x, pz = playerGroup.position.z;
  if(dueling) return true;
  if(inArena && ffaAlive) return true;
  if(!inArena && !inHouse && !inMall && !inArcade && !inStore && !inShopInterior && serverMode === 'online' && nearestRemotePlayer(35)) return true;
  if(alignment === 'bad' && playerWeapon !== 'none' && !inHouse && !inMall && !inArcade && !inShopInterior) {
    for(const npc of npcs) { if(Math.hypot(px-npc.group.position.x, pz-npc.group.position.z) < 3.5) return true; }
  }
  if(!inHouse && !inMall && !inArcade && !inStore && !inMovieFight && !inShopInterior) {
    for(const r of rogueRobots) { if(r.alive && Math.hypot(px-r.x, pz-r.z) < 3) return true; }
    for(const k of killers) { if(k.alive && k.revealed && Math.hypot(px-k.x, pz-k.z) < 3) return true; }
    for(const def of BOSS_DEFS) { const st = bossState[def.name]; if(st && st.alive && Math.hypot(px-st.curX, pz-st.curZ) < 4.5) return true; }
  }
  if(inMovieFight && movieBossFight && movieBossFight.alive && Math.hypot(px-movieBossFight.curX, pz-movieBossFight.curZ) < 4.5) return true;
  for(const z of CITY_ZONES) { if(z.action === hitDummy && Math.hypot(px-z.x, pz-z.z) < z.r) return true; }
  return false;
}
function onInteractDown() {
  if(chargingPunch) return; // already charging — a stray repeat/duplicate event, ignore
  if(isNearCombatTarget()) {
    if(activeEmote) cancelEmote(); // starting combat cancels any active emote, same rule as moving
    chargingPunch = true; punchChargeStart = clock.getElapsedTime();
  }
  else handleInteract();
}
function onInteractUp() {
  if(!chargingPunch) return;
  chargingPunch = false;
  const held = Math.min(clock.getElapsedTime() - punchChargeStart, PUNCH_MAX_CHARGE);
  pendingSwingPower = held / PUNCH_MAX_CHARGE;
  punchChargeMult = 1 + pendingSwingPower * (PUNCH_MAX_MULT - 1);
  handleInteract();
  // One-shot — don't let this charge leak into some later, unrelated triggerSwing() call
  // (War/world-event fights swing through the same function but aren't chargeable).
  punchChargeMult = 1;
  pendingSwingPower = 1;
}

function handleInteract() {
  const px2 = playerGroup.position.x, pz = playerGroup.position.z;
  // Stand up if seated — takes priority over everything else, same as exiting a car
  if(playerSeated) { playerSeated = false; showNotif('🪑 You stand up.'); return; }
  // Exit car
  if(inCar) { exitCar(); return; }
  // Bank Wall — takes priority over everything below (zone-check would otherwise pick up the
  // "Enter City Bank" zone by pure x/z proximity, since that check ignores height entirely).
  if(onBankWall) { shootFromWall(); return; }
  // Enter nearby parked car
  for(const pc of parkedCars) {
    const dx=px2-pc.group.position.x, dz=pz-pc.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { enterCar(pc); return; }
  }
  // The Super Tank — a permanent Car Dealership fixture, not in parkedCars/ownedCars (see
  // dealershipTank, game-vehicles.js), so it gets this one extra proximity check of its own.
  if (dealershipTank) {
    const dx=px2-dealershipTank.group.position.x, dz=pz-dealershipTank.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { enterPremiumVehicle(dealershipTank); return; }
  }
  // The Super Jet — same idea, parked on the Airport apron (dealershipJet, game-vehicles.js).
  if (dealershipJet) {
    const dx=px2-dealershipJet.group.position.x, dz=pz-dealershipJet.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { enterPremiumVehicle(dealershipJet); return; }
  }
  // The Future Jet — same idea, a second Airport apron pad next to the Super Jet's (dealershipFutureJet, game-vehicles.js).
  if (dealershipFutureJet) {
    const dx=px2-dealershipFutureJet.group.position.x, dz=pz-dealershipFutureJet.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { enterPremiumVehicle(dealershipFutureJet); return; }
  }
  // The Super Motorcycle — same idea, a second Car Dealership pad (dealershipMotorcycle, game-vehicles.js).
  if (dealershipMotorcycle) {
    const dx=px2-dealershipMotorcycle.group.position.x, dz=pz-dealershipMotorcycle.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { enterPremiumVehicle(dealershipMotorcycle); return; }
  }
  // The Private Cab — parked outside The Office. enterMysteryVehicle() (game-vehicles.js) never
  // reveals what it even is to a non-admin, on top of being locked.
  if (dealershipCab) {
    const dx=px2-dealershipCab.group.position.x, dz=pz-dealershipCab.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { enterMysteryVehicle(dealershipCab); return; }
  }
  // Money Printer press window (Bank Jobs) — a short real-time reaction that can happen from
  // anywhere in the city now that jobs don't require standing at a physical zone (item 217), so
  // it's checked here up front rather than tied to any CITY_ZONES entry.
  if (printerPressActive) { pressPrinter(); return; }
  // Store restocking: pick up a delivered box, or place a carried one on its matching shelf
  if(inStore) {
    // Try placing a carried box on the shelf you're standing at first; if that's not where
    // you are, try picking up a floor box instead — lets you keep grabbing more (up to
    // MAX_CARRY_BOXES) between shelf trips instead of one round trip per box.
    if(carriedBoxes.length && tryPlaceBox()) return;
    if(tryPickUpBox()) return;
  }
  // A duel you've already committed to (accepted a real challenge) always takes
  // priority, even inside the arena - real bug found live: without this, walking
  // into the arena mid-duel silently switched your E-press over to generic FFA
  // targeting instead of your actual opponent, with no way to keep fighting them.
  if(dueling && serverMode === 'online' && tryDuelInteract()) return;
  // Arena free-for-all takes priority over open-world 1v1 duels while standing in it
  if(inArena && serverMode === 'online' && tryFfaInteract()) return;
  // PvP duel: swing at your opponent if one's active, else challenge whoever's nearby
  if(!inArena && !inHouse && !inMall && !inArcade && !inStore && !inArenaBattle && !inMovieFight && !inShopInterior && serverMode === 'online' && tryDuelInteract()) return;
  // Bad guy with weapon: NPC attack takes priority over zone actions
  if(alignment === 'bad' && playerWeapon !== 'none' && !inHouse && !inMall && !inArcade && !inArenaBattle && !inMovieFight && !inShopInterior) {
    let closest = null, closestDist = 3.5;
    for(const npc of npcs) {
      const d = Math.sqrt((px2-npc.group.position.x)**2+(pz-npc.group.position.z)**2);
      if(d < closestDist) { closestDist = d; closest = npc; }
    }
    if(closest) { attackNPC(closest); return; }
  }
  // Rogue robots (item 156) roam freely into the city and can be fought back any time, same
  // priority tier as attacking an NPC — they aren't tied to a fixed CITY_ZONES position since they move.
  // The Movie Fight Room's single boss is its own dedicated combat target — none of the outdoor
  // rogue robot/killer/boss systems apply inside this pocket interior.
  if (inMovieFight && movieBossFight && movieBossFight.alive) {
    const d = Math.sqrt((px2-movieBossFight.curX)**2+(pz-movieBossFight.curZ)**2);
    if (d < 4.5) { fightMovieBoss(); return; }
  }
  if (!inHouse && !inMall && !inArcade && !inStore && !inArenaBattle && !inMovieFight && !inSportsPark && !inHospital && !inSchool && !inShopInterior) {
    let closestRogue = null, closestRogueDist = 3;
    for (const r of rogueRobots) {
      if (!r.alive) continue;
      const d = Math.sqrt((px2-r.x)**2+(pz-r.z)**2);
      if (d < closestRogueDist) { closestRogueDist = d; closestRogue = r; }
    }
    if (closestRogue) { fightRogueRobot(closestRogue); return; }
    // Killers (only once revealed — you can't fight what you haven't even seen yet), same tier.
    let closestKiller = null, closestKillerDist = 3;
    for (const k of killers) {
      if (!k.alive || !k.revealed) continue;
      const d = Math.sqrt((px2-k.x)**2+(pz-k.z)**2);
      if (d < closestKillerDist) { closestKillerDist = d; closestKiller = k; }
    }
    if (closestKiller) { if (closestKiller.robber) fightRobber(closestKiller); else if (closestKiller.demon) fightDemon(closestKiller); else if (closestKiller.satanBoss) fightSatanBoss(closestKiller); else if (closestKiller.killerSupreme) fightKillerSupreme(closestKiller); else fightKiller(closestKiller); return; }
    // Bosses now chase (see tickBossChase) instead of sitting at a fixed CITY_ZONES spot, so
    // fighting one has to be a live proximity check off its real curX/curZ, same as the two above.
    let closestBoss = null, closestBossDist = 4.5;
    for (const def of BOSS_DEFS) {
      const st = bossState[def.name];
      if (!st || !st.alive) continue;
      const d = Math.sqrt((px2-st.curX)**2+(pz-st.curZ)**2);
      if (d < closestBossDist) { closestBossDist = d; closestBoss = def; }
    }
    if (closestBoss) { fightBoss(closestBoss); return; }
  }
  const zones = inMovieFight ? MOVIE_FIGHT_ZONES : inArenaBattle ? ROBOT_ARENA_ZONES : inPrison ? PRISON_ZONES : inFriendHouse ? FRIEND_HOUSE_ZONES : inLandHouse ? LAND_HOUSE_ZONES : inCountryHotel ? COUNTRY_HOTEL_ZONES : inAirportLounge ? AIRPORT_LOUNGE_ZONES : inArcade ? ARCADE_ZONES : inHotel ? HOTEL_ZONES : inHouse ? HOUSE_ZONES : inMall ? MALL_ZONES : inStore ? STORE_ZONES : inVisitStore ? VISIT_STORE_ZONES : inBankInterior ? BANK_INTERIOR_ZONES : inSportsPark ? SPORTS_ZONES : inHospital ? HOSPITAL_ZONES : inSea ? SEA_ZONES : inSchool ? SCHOOL_ZONES : inShopInterior ? SHOP_INTERIOR_ZONES : CITY_ZONES;
  for(const z of zones) {
    if(Math.sqrt((px2-z.x)**2+(pz-z.z)**2) < z.r) { z.action(); return; }
  }
  if(!inHouse && !inHotel && !inMall && !inStore && !inFriendHouse && !inLandHouse && !inCountryHotel && !inAirportLounge && !inCar && !inArcade && !inArenaBattle && !inMovieFight && !inSportsPark && !inHospital && !inSea && !inSchool && !inVisitStore && !inShopInterior) {
    const neighbor = findNearestNeighbor(px2, pz, 3);
    if(neighbor) { openNeighborModal(neighbor.name); return; }
  }
  showNotif('Nothing nearby to interact with.');
}

function updatePrompt() {
  const px2 = playerGroup.position.x, pz = playerGroup.position.z;
  const el = document.getElementById('ePrompt');
  if(inCar) {
    // Jet hint built per-jet now that Normal Jet/High Speed Jet/Future Jet don't all share the
    // Super Jet's exact loadout (gunCount/hasBombs, game-vehicles.js) — showing "[F] Guns" on an
    // unarmed Normal Jet would just be a lie you'd discover by pressing it. [Shift] Boost is
    // real and free on every jet (the new afterburner above), so that part's unconditional.
    const jetHint = (def) => {
      const parts = ['[E] Exit Car'];
      if ((def.gunCount ?? 1) > 0) parts.push('[F] Guns');
      if (def.hasBombs !== false) parts.push('[V] Bomb');
      parts.push('[Shift] Boost');
      if (hiredJetPilot) parts.push(`[H] ${jetAutopilotActive?'Cancel':''} Autopilot`);
      return parts.join(' · ');
    };
    el.textContent = (activeCar && activeCar.def.isTank) ? '[E] Exit Car · [F] Fire Cannon'
      : (activeCar && activeCar.def.isJet) ? jetHint(activeCar.def)
      : (activeCar && activeCar.def.isMotorcycle) ? '[E] Exit Car · [F] Rockets'
      : '[E] Exit Car';
    el.style.display='block'; return;
  }
  if(onBankWall) { el.textContent='[E] 🏹 Shoot (or climb down if nothing\'s in range)'; el.style.display='block'; return; }
  for(const pc of parkedCars) {
    const dx=px2-pc.group.position.x, dz=pz-pc.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { el.textContent=`[E] ${pc.def.emoji} Get in ${pc.def.name}`; el.style.display='block'; return; }
  }
  // Tank/Jet/Motorcycle are real-money items (see enterPremiumVehicle(), game-vehicles.js) —
  // a non-admin sees an honest locked hint here instead of "Get in", same gate handleInteract() enforces.
  if (dealershipTank) {
    const dx=px2-dealershipTank.group.position.x, dz=pz-dealershipTank.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { el.textContent = isAdmin() ? `[E] ${dealershipTank.def.emoji} Get in ${dealershipTank.def.name}` : `🔒 ${dealershipTank.def.name} — buy in 🛍️ SHOP`; el.style.display='block'; return; }
  }
  if (dealershipJet) {
    const dx=px2-dealershipJet.group.position.x, dz=pz-dealershipJet.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { el.textContent = isAdmin() ? `[E] ${dealershipJet.def.emoji} Get in ${dealershipJet.def.name}` : `🔒 ${dealershipJet.def.name} — buy in 🛍️ SHOP`; el.style.display='block'; return; }
  }
  if (dealershipFutureJet) {
    const dx=px2-dealershipFutureJet.group.position.x, dz=pz-dealershipFutureJet.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { el.textContent = isAdmin() ? `[E] ${dealershipFutureJet.def.emoji} Get in ${dealershipFutureJet.def.name}` : `🔒 ${dealershipFutureJet.def.name} — buy in 🛍️ SHOP`; el.style.display='block'; return; }
  }
  if (dealershipMotorcycle) {
    const dx=px2-dealershipMotorcycle.group.position.x, dz=pz-dealershipMotorcycle.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { el.textContent = isAdmin() ? `[E] ${dealershipMotorcycle.def.emoji} Get in ${dealershipMotorcycle.def.name}` : `🔒 ${dealershipMotorcycle.def.name} — buy in 🛍️ SHOP`; el.style.display='block'; return; }
  }
  if (dealershipCab) {
    const dx=px2-dealershipCab.group.position.x, dz=pz-dealershipCab.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { el.textContent = isAdmin() ? `[E] ${dealershipCab.def.emoji} Get in ${dealershipCab.def.name}` : `❓ Unknown — locked`; el.style.display='block'; return; }
  }
  const zones = inMovieFight ? MOVIE_FIGHT_ZONES : inArenaBattle ? ROBOT_ARENA_ZONES : inPrison ? PRISON_ZONES : inFriendHouse ? FRIEND_HOUSE_ZONES : inLandHouse ? LAND_HOUSE_ZONES : inCountryHotel ? COUNTRY_HOTEL_ZONES : inAirportLounge ? AIRPORT_LOUNGE_ZONES : inArcade ? ARCADE_ZONES : inHotel ? HOTEL_ZONES : inHouse ? HOUSE_ZONES : inMall ? MALL_ZONES : inStore ? STORE_ZONES : inVisitStore ? VISIT_STORE_ZONES : inBankInterior ? BANK_INTERIOR_ZONES : inSportsPark ? SPORTS_ZONES : inHospital ? HOSPITAL_ZONES : inSea ? SEA_ZONES : inSchool ? SCHOOL_ZONES : inShopInterior ? SHOP_INTERIOR_ZONES : CITY_ZONES;
  for(const z of zones) {
    if(Math.sqrt((px2-z.x)**2+(pz-z.z)**2) < z.r) {
      if(z.isComputer) {
        el.textContent = ownedComputers.length>0 ? '[E] 💻 Open SIB Browser' : '[E] 💻 No computer (buy one at the Computer Shop)';
        el.style.display='block'; return;
      }
      if(z.isJobZone) {
        if(activeJob === z.jobType) {
          el.textContent = jobTaskActive ? `[E] ${activeJobTaskText}` : `[E] Stop working as ${z.jobType}`;
        } else {
          el.textContent = `[E]  ${z.label}`;
        }
        el.style.display='block'; return;
      }
      if(z.isBankJobZone) {
        const onThisShift = activeBankJob && activeBankJob.job.id === z.bankJobId && activeBankJob.currency === z.currency;
        el.textContent = onThisShift ? `[E] Stop working as ${activeBankJob.job.label}` : `[E]  ${z.label}`;
        el.style.display='block'; return;
      }
      if(z.isGuestSpot) {
        if(!houseGuest) { el.style.display='none'; return; }
        el.textContent = `[E] 👋 Say bye to ${houseGuest}`; el.style.display='block'; return;
      }
      if(z.isFridge) {
        if(cookState !== 'idle') { el.textContent = '🧺 Already have ingredients!'; el.style.display='block'; return; }
        el.textContent = '[E] 🧊 Get Ingredients'; el.style.display='block'; return;
      }
      if(z.isPrep) {
        if(cookState === 'idle')          { el.textContent = 'Get ingredients first!'; el.style.display='block'; return; }
        if(cookState === 'has_ingredients') { el.textContent = '[E] 🔪 Start Chopping!'; el.style.display='block'; return; }
        if(cookState === 'preparing')     { el.textContent = `[E] 🔪 Chop! (${cookSubPresses}/${PREP_PRESSES})`; el.style.display='block'; return; }
        el.textContent = 'Already prepped — go to the stove!'; el.style.display='block'; return;
      }
      if(z.isStove) {
        if(cookState === 'idle' || cookState === 'has_ingredients' || cookState === 'preparing') {
          el.textContent = 'Prep food first! (Fridge → Prep Counter)'; el.style.display='block'; return;
        }
        if(cookState === 'prepared')  { el.textContent = '[E] 🔥 Cook it!'; el.style.display='block'; return; }
        if(cookState === 'cooking')   { el.textContent = `[E] 🔥 Cooking... (${cookSubPresses}/${COOK_PRESSES})`; el.style.display='block'; return; }
        if(cookState === 'ready')     { el.textContent = '🍕 Food ready! Deliver to a customer!'; el.style.display='block'; return; }
      }
      if(z.isServe) {
        if(cookState !== 'ready') { el.style.display='none'; return; }
        const idx = [12,20,28].indexOf(z.x);
        const order = idx >= 0 ? tableOrders[idx] : 'order';
        el.textContent = `[E] 🍽️ Deliver ${order}`; el.style.display='block'; return;
      }
      if(z.isDealerZone) {
        el.textContent = alignment === 'bad' ? '[E] 😇 Go Straight' : '[E] 😈 Join the Underground';
        el.style.display='block'; return;
      }
      if(z.isBlackMarket) {
        el.textContent = alignment === 'bad' ? '[E] 🕴️ Enter Black Market' : '[E] ⬛ ??? (Bad guys only)';
        el.style.display='block'; return;
      }
      if(z.isShop && alignment === 'bad') {
        const cd = robbedCooldowns[z.label.replace(/[^a-zA-Z ]/g,'').trim()];
        el.textContent = (cd > 0) ? `⏳ ${z.label} on cooldown (${Math.ceil(cd)}s)` : `[E] 🔫 Rob ${z.label}`;
        el.style.display='block'; return;
      }
      el.textContent = `[E]  ${z.label}`; el.style.display='block'; return;
    }
  }
  // NPC attack prompt — checked after zones so zones still take priority
  if(alignment === 'bad' && playerWeapon !== 'none' && !inHouse && !inMall && !inArcade && !inShopInterior) {
    for(const npc of npcs) {
      const d = Math.sqrt((px2-npc.group.position.x)**2+(pz-npc.group.position.z)**2);
      if(d < 3.5) { el.textContent=`[E] 💥 Attack ${npc.name}`; el.style.display='block'; return; }
    }
  }
  // Talk to a nearby neighbor — lowest priority, only out in the open city
  if(!inHouse && !inHotel && !inMall && !inStore && !inFriendHouse && !inLandHouse && !inCountryHotel && !inAirportLounge && !inCar && !inArcade && !inArenaBattle && !inMovieFight && !inSportsPark && !inHospital && !inSea && !inSchool && !inVisitStore && !inShopInterior) {
    const neighbor = findNearestNeighbor(px2, pz, 3);
    if(neighbor) { el.textContent = `[E] 👋 Talk to ${neighbor.name}`; el.style.display='block'; return; }
  }
  el.style.display = 'none';
}

// ─── WAR TERRITORY COUNTRIES — 20x scale (item ~234, user: "lets make the countrys 20 times
// bigger"). Single source of truth for all 9 centers, read by LOC_ZONES below, WAR_TERRITORIES,
// COUNTRY_THEMES, and SPACE_ZONE further down the file — defined here, before all 4 consumers,
// specifically so none of them need to hardcode a duplicate copy (AIRPORT_FLIGHTS is the one
// exception: it runs at line ~2201, hundreds of lines before this, so it stays hand-computed —
// see its own comment). An even 9-point ring (radius 8000) replaces the original scattered
// layout — the tightest original pair, France/UK, was only 141 units apart (see the "141 units"
// comment further down at the real buildCountryZones() site), nowhere near enough clearance once
// each country's built footprint grows from ~90-100 units to ~1800-2000 units at 20x. Every
// adjacent pair on this ring is a guaranteed 5472 units center-to-center — roughly 1400+ units of
// clear ground between footprint edges even in the worst case, not just the closest pair.
const COUNTRY_SCALE = 20;
const COUNTRY_CENTERS = {
  France:        { x:-7520, z:-2740 },
  UK:             { x:-4000, z:-6930 },
  Italy:          { x:1390,  z:-7880 },
  Japan:          { x:6130,  z:-5140 },
  Australia:      { x:8000,  z:0     },
  Egypt:          { x:6130,  z:5140  },
  Brazil:         { x:1390,  z:7880  },
  'Space Station':{ x:-4000, z:6930  },
  Canada:         { x:-7520, z:2740  },
};
// Farthest possible building edge from origin is the 8000-radius ring plus each country's own
// ~2000-unit scaled footprint radius = 10000, plus a real walking margin — replaces the old
// ±1950 movement clamp (player, cars, and spawnKiller's scatter — all 3 needed the same value in
// lockstep, see each site's own comment) so a country actually reachable, not silently clipped.
const WORLD_BOUND = 11000;

// ─── LOCATION ZONES ──────────────────────────────────────────────────────────
const LOC_ZONES = [
  {name:'City Mall',       x:80,  z:-20, r:35},
  {name:'Westside Galleria', x:-250, z:-50, r:30},
  {name:'Uptown Plaza',      x:250,  z:150, r:30},
  {name:'Police Station',  x:-70, z:10,  r:26},
  {name:'Restaurant Row',  x:20,  z:80,  r:30},
  {name:'The Park',        x:-10, z:-60, r:28},
  {name:'Shopping Street', x:60,  z:50,  r:26},
  {name:'Your House',      x:-30, z:-110,r:20},
  {name:'Whispering Woods',x:WOODS_CENTER.x, z:WOODS_CENTER.z, r:30},
  {name:'Sunset Plains',   x:LAND_CENTER.x,  z:LAND_CENTER.z,  r:380},
  {name:'The Scrapyard',   x:SCRAPYARD_CENTER.x, z:SCRAPYARD_CENTER.z, r:30},
  {name:'Fight Arena',     x:ARENA_CENTER.x, z:ARENA_CENTER.z, r:52},
  {name:'The Dump',        x:DUMP_CENTER.x, z:DUMP_CENTER.z, r:25},
  {name:'City Hall',       x:0,   z:-35, r:22},
  {name:'Hospital',        x:-40, z:60,  r:22},
  {name:'School',          x:70,  z:60,  r:22},
  {name:'Apartments',      x:-50, z:-50, r:28},
  {name:'City Bank',       x:160, z:210, r:18},
  {name:'Movie Theater',   x:50,  z:-85, r:22},
  {name:'Transit Hub',     x:0,   z:50,  r:22},
  {name:'City Hotel',      x:-15, z:-5,  r:18},
  {name:'Car Dealership',  x:130, z:28,  r:30},
  {name:'Computer Shop',   x:100, z:50,  r:22},
  {name:'City Airport',    x:-200,z:-200,r:40},
  {name:'The Diner',       x:110, z:-25, r:18},
  {name:'Your Store',      x:160, z:-25, r:18},
  {name:'Toy Factory',         x:240, z:-55, r:24},
  {name:'Auto Parts Factory',  x:330, z:-55, r:24},
  {name:'Robot Parts Factory', x:420, z:-55, r:24},
  {name:'Japan',           x:COUNTRY_CENTERS.Japan.x,          z:COUNTRY_CENTERS.Japan.z,          r:85*COUNTRY_SCALE},
  {name:'France',          x:COUNTRY_CENTERS.France.x,         z:COUNTRY_CENTERS.France.z,         r:85*COUNTRY_SCALE},
  {name:'Brazil',          x:COUNTRY_CENTERS.Brazil.x,         z:COUNTRY_CENTERS.Brazil.z,         r:85*COUNTRY_SCALE},
  {name:'Egypt',           x:COUNTRY_CENTERS.Egypt.x,          z:COUNTRY_CENTERS.Egypt.z,          r:85*COUNTRY_SCALE},
  {name:'UK',              x:COUNTRY_CENTERS.UK.x,             z:COUNTRY_CENTERS.UK.z,             r:85*COUNTRY_SCALE},
  {name:'Australia',       x:COUNTRY_CENTERS.Australia.x,      z:COUNTRY_CENTERS.Australia.z,      r:85*COUNTRY_SCALE},
  {name:'Canada',          x:COUNTRY_CENTERS.Canada.x,         z:COUNTRY_CENTERS.Canada.z,         r:85*COUNTRY_SCALE},
  {name:'Italy',           x:COUNTRY_CENTERS.Italy.x,          z:COUNTRY_CENTERS.Italy.z,          r:85*COUNTRY_SCALE},
  {name:'Space Station',   x:COUNTRY_CENTERS['Space Station'].x, z:COUNTRY_CENTERS['Space Station'].z, r:65*COUNTRY_SCALE},
];

// ─── TERRAIN / HILLS — real elevation, but ONLY in open, undeveloped natural ground. Every
// developed footprint (city blocks, roads, every CITY_ZONES/LOC_ZONES building/door area,
// Sunset Plains' actual house plots, each country's landmark+town core) stays perfectly flat at
// y=0, exactly like before this was added — groundHeightAt() below returns EXACTLY 0 there, not
// just "close to 0". Hills exist only inside 4 kinds of named regions (defined further down):
// The Park (a small rolling patch away from City Hall/the pond), Whispering Woods (a real rolling
// forest floor), Sunset Plains' huge undeveloped outskirts (everything in its LOC_ZONES circle
// that isn't an actual owned/buyable plot), and a ring of rolling countryside just outside each
// War Territory country's built core. Every region fades smoothly to 0 over its last several
// units (regionMul/pocketMul/ringMul below) so there's never a hard cliff between hill and flat
// ground. groundHeightAt(x,z) is the single source of truth: the visual terrain mesh
// (buildHillPatchMesh/buildHillTerrain), the player's own ground-clamp (game-controls.js), and a
// driven car's ground-clamp (same file) all sample this exact same function, so what you see is
// what you (and everyone else, over online sync) actually stand on.
//
// hillMound() is deliberately NOT a full Perlin-noise library — just a real, deterministic,
// layered sine/cosine "value noise" (3 octaves, decreasing amplitude) — a common enough
// lightweight technique for exactly this kind of gentle rolling terrain. Remapped to [0,1] (never
// negative) on purpose: the hill patch meshes below are separate, small meshes layered ON TOP of
// the existing flat groundMesh rather than modifying it (groundMesh itself stays completely
// untouched, so the whole rest of the world is provably byte-for-byte unaffected) — a negative
// height would dip the patch BELOW the flat plane underneath it and either z-fight or get hidden,
// which is exactly the kind of visual regression this whole feature has to avoid. Mounds-only
// still reads as real rolling hills; it just never carves a valley below the original ground.
function hillMound(x, z) {
  const n = Math.sin(x*0.045)*Math.cos(z*0.045)
          + Math.sin(x*0.09 + 1.7)*Math.cos(z*0.075 + 0.6)*0.5
          + Math.sin(x*0.16 + 4.1)*Math.cos(z*0.13 + 2.3)*0.25; // roughly [-1.75, 1.75]
  return Math.min(1, Math.max(0, (n/1.75 + 1) / 2)); // remapped to [0,1]
}
// 1 inside fullR (full hill height), 0 at/beyond edgeR (flat), smooth linear fade between.
function regionMul(d, fullR, edgeR) {
  if (d <= fullR) return 1;
  if (d >= edgeR) return 0;
  return 1 - (d - fullR) / (edgeR - fullR);
}
// The inverse shape — 0 inside flatR (forced flat, e.g. right on top of a pond/bench/plot), 1
// at/beyond fadeR (full hill height), smooth linear fade between.
function pocketMul(d, flatR, fadeR) {
  if (d <= flatR) return 0;
  if (d >= fadeR) return 1;
  return (d - flatR) / (fadeR - flatR);
}
// A ring shape (flat core, hills in a band around it, flat again past the outer edge) — used for
// country outskirts, where the flat "developed" area is a whole disk in the MIDDLE, not the edge.
function ringMul(d, r0, r1, r2, r3) {
  if (d <= r0 || d >= r3) return 0;
  if (d < r1) return (d - r0) / (r1 - r0);
  if (d <= r2) return 1;
  return 1 - (d - r2) / (r3 - r2);
}

// The Park (LOC_ZONES 'The Park', x:-10,z:-60) is a small 54x54 grass square wedged tightly
// between City Hall, the Sports Park gate, a pond, a fountain and 2 benches (see buildCity()'s
// PARK section) — real hills only fit in its southern half, well clear of all of that, so the
// region is centered south of the grass square's own center with a real conservative radius.
// (Verified live: City Hall's own footprint — x:-15..15, z:-47..-23 — is 29 units past this
// region's outer edge at its very closest point, and the Sports Park gate at z=-95 is 7 units past
// it the other way, so neither one needs its own flat pocket — only the pond/fountain/benches,
// which actually sit inside the region, do.)
const PARK_HILL = { cx:-10, cz:-70, fullR:12, edgeR:18, amp:1.6,
  pockets: [ [-10,-58,8,12], [-4,-60,4,6], [-18,-68,3,5], [4,-52,3,5] ] }; // [x,z,flatR,fadeR] — pond, fountain, bench, bench
// Whispering Woods (game-housing.js) — the real 100-tree grove + crafting table + training dummy
// all get their own visual Y lifted to match the terrain right where they stand (buildWoodsArea()/
// chopTree()/fellTree()/hitDummy()), so hills can cover the WHOLE grove, not just gaps between
// trees — no flat pockets needed here at all.
const WOODS_HILL = { cx:WOODS_CENTER.x, cz:WOODS_CENTER.z, fullR:50, edgeR:75, amp:4.0 };
// Sunset Plains (game-land.js) — LOC_ZONES gives it a huge r:380 circle around LAND_CENTER, but
// the 10 real buyable land plots only occupy a small cluster near the middle of it (computed live
// below, not hand-copied, so a future plot added to LAND_PLOTS is automatically kept flat too) —
// everywhere else in that circle is real, genuinely undeveloped outskirts.
const PLAINS_HILL = { cx:LAND_CENTER.x, cz:LAND_CENTER.z, fullR:340, edgeR:380, amp:5.0 };
// Returns pocketMul() combined (the MINIMUM, i.e. "flattest wins") across every land plot's own
// fence footprint — a real fence half-extent (plotHalf()) plus a small buffer, so the plot,
// its fence, and its sign never sit on sloped ground, with the same smooth fade as everywhere else.
function sunsetPlainsPocketMul(x, z) {
  let m = 1;
  for (let i = 0; i < LAND_PLOTS.length; i++) {
    const { cx, cz } = landPlotPos(i);
    const half = plotHalf(LAND_PLOTS[i]);
    // Chebyshev ("square") distance matches the plots' own square fence shape better than a circle.
    const d = Math.max(Math.abs(x - cx), Math.abs(z - cz));
    const pm = pocketMul(d, half + 4, half + 14);
    if (pm < m) m = pm;
  }
  return m;
}
// War Territory countries (game-world.js/COUNTRY_CENTERS above) — Space Station is deliberately
// left out of this list, its own real zero-gravity platform (buildSpaceZone()) stays flat on
// purpose. Every other country gets a real ring of rolling countryside OUTSIDE its built core
// (landmark + buildTownExtras' shops/skyline/park/airport/hotel, all real-world-verified to sit
// within ~1341 units of the country's own center — see this file's own hill-region comment
// history) and INSIDE its own named LOC_ZONES circle (r:85*COUNTRY_SCALE), so hills never spill
// into the empty neutral ground between two countries. r0 deliberately matches tickWar's own
// "have I left this country behind" radius (70*COUNTRY_SCALE, game-world.js) — hills start
// exactly where the game already stops treating you as "in" that country's built city.
const HILL_COUNTRY_NAMES = ['France','UK','Italy','Japan','Australia','Egypt','Brazil','Canada'];
const COUNTRY_HILL_R0 = 70*COUNTRY_SCALE, COUNTRY_HILL_R1 = 74*COUNTRY_SCALE,
      COUNTRY_HILL_R2 = 81*COUNTRY_SCALE, COUNTRY_HILL_R3 = 85*COUNTRY_SCALE;
const COUNTRY_HILL_AMP = 4.5;

// The single source of truth for real elevation anywhere in the world — see the section comment
// above. Returns 0 for every (x,z) outside all 4 region kinds, and exactly 0 for any (x,z) inside
// one that also falls in a flat pocket (pond/bench/land-plot/etc) — both cases are the same
// "already-developed, stay flat" guarantee the rest of this file depends on.
function groundHeightAt(x, z) {
  // ROOFTOPS — a building with a roofY (addCol's optional 5th arg, game-engine.js) is a real
  // standing surface once you're on it: isBlocked() only ever lets the player's x/z cross into
  // that footprint at all once they're already at/above roofY, so if (x,z) lands inside one here,
  // they must already be up there — just hold them at roofY, same as any other floor.
  for (const c of CITY_COLS) {
    if (c.roofY === undefined) continue;
    if (x > c.cx-c.hw && x < c.cx+c.hw && z > c.cz-c.hd && z < c.cz+c.hd) return c.roofY;
  }
  // The real exterior staircases leading up to those rooftops (addRoofRamp(), game-engine.js) —
  // a straight ramp strip sampled the exact same way the hill regions below are.
  const rampY = roofRampHeightAt(x, z);
  if (rampY !== null) return rampY;
  { const dx = x-PARK_HILL.cx, dz = z-PARK_HILL.cz, d = Math.hypot(dx,dz);
    if (d < PARK_HILL.edgeR) {
      let rm = regionMul(d, PARK_HILL.fullR, PARK_HILL.edgeR);
      for (const [px,pz,fr,fdr] of PARK_HILL.pockets) rm = Math.min(rm, pocketMul(Math.hypot(x-px,z-pz), fr, fdr));
      return rm > 0 ? PARK_HILL.amp * rm * hillMound(x,z) : 0;
    }
  }
  { const dx = x-WOODS_HILL.cx, dz = z-WOODS_HILL.cz, d = Math.hypot(dx,dz);
    if (d < WOODS_HILL.edgeR) {
      const rm = regionMul(d, WOODS_HILL.fullR, WOODS_HILL.edgeR);
      return rm > 0 ? WOODS_HILL.amp * rm * hillMound(x,z) : 0;
    }
  }
  { const dx = x-PLAINS_HILL.cx, dz = z-PLAINS_HILL.cz, d = Math.hypot(dx,dz);
    if (d < PLAINS_HILL.edgeR) {
      const rm = Math.min(regionMul(d, PLAINS_HILL.fullR, PLAINS_HILL.edgeR), sunsetPlainsPocketMul(x,z));
      return rm > 0 ? PLAINS_HILL.amp * rm * hillMound(x,z) : 0;
    }
  }
  for (const name of HILL_COUNTRY_NAMES) {
    const c = COUNTRY_CENTERS[name], d = Math.hypot(x-c.x, z-c.z);
    if (d > COUNTRY_HILL_R0 && d < COUNTRY_HILL_R3) {
      const rm = ringMul(d, COUNTRY_HILL_R0, COUNTRY_HILL_R1, COUNTRY_HILL_R2, COUNTRY_HILL_R3);
      if (rm > 0) return COUNTRY_HILL_AMP * rm * hillMound(x,z);
    }
  }
  return 0;
}

// Builds ONE real subdivided terrain patch (not the flat 1x1-segment base groundMesh, which stays
// completely untouched) covering one hill region, vertex-displaced by the exact same
// groundHeightAt() the player/car ground-clamp uses. +0.015 keeps it a hair above the flat base
// groundMesh everywhere (including at 0 height, right at a region's own edge/pockets) so the two
// never z-fight — imperceptible next to a ~2-unit-tall player, same trick this file's box() calls
// already use for thin overlays (e.g. road strips sitting at y=0.01 above the ground).
function buildHillPatchMesh(cx, cz, size, segments, color) {
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI/2); // lie flat — local (x,z) now maps straight onto world (x,z), height along Y
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const wx = cx + pos.getX(i), wz = cz + pos.getZ(i);
    pos.setY(i, groundHeightAt(wx, wz) + 0.015);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
  m.position.set(cx, 0, cz);
  m.receiveShadow = true;
  scene.add(m);
  return m;
}
// Builds the real visual terrain for all 4 hill-region kinds. Called once at startup, after
// buildCity() (needs groundMesh's current color) and after buildSpaceZone() (world fully built).
function buildHillTerrain() {
  hillPatchMeshes.forEach(h => scene.remove(h.mesh));
  hillPatchMeshes = [];
  const baseColor = groundMesh ? groundMesh.material.color.getHex() : 0x5a9e3c;
  // The Park's own grass square is a fixed 0x4a9e2a (buildCity()'s PARK section) and — like that
  // square — is NOT part of the seasonal-color system, so this patch matches it exactly instead of
  // the plain city ground color, and doesn't ride along with season changes either (matchesGround:false).
  hillPatchMeshes.push({ mesh: buildHillPatchMesh(PARK_HILL.cx, PARK_HILL.cz, 44, 22, 0x4a9e2a), matchesGround:false });
  hillPatchMeshes.push({ mesh: buildHillPatchMesh(WOODS_HILL.cx, WOODS_HILL.cz, 160, 40, baseColor), matchesGround:true });
  hillPatchMeshes.push({ mesh: buildHillPatchMesh(PLAINS_HILL.cx, PLAINS_HILL.cz, 800, 70, baseColor), matchesGround:true });
  HILL_COUNTRY_NAMES.forEach(name => {
    const c = COUNTRY_CENTERS[name];
    hillPatchMeshes.push({ mesh: buildHillPatchMesh(c.x, c.z, 3500, 100, baseColor), matchesGround:true });
  });
}

// ─── START GAME ──────────────────────────────────────────────────────────────
function _showErr(msg) {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#c00;color:#fff;padding:20px;font-size:14px;z-index:99999;text-align:center;border-radius:10px;max-width:85%;word-break:break-all;line-height:1.5;';
  d.textContent = '❌ ' + msg;
  document.body.appendChild(d);
}
function startGame() {
  try { _startGameInner(); } catch(e) { _showErr('startGame crashed: ' + e.message); }
}
function _startGameInner() {
  // Start bank timer now (not at page load) so it never fires during login
  setInterval(() => {
    if(!currentUser) return;
    bankBalance += 10000;
    saveCurrentUser();
    const overlay = document.getElementById('bankOverlay');
    if(overlay && overlay.style.display !== 'none') {
      document.getElementById('bankBalDisplay').textContent = bankBalance.toLocaleString() + ' S.I.P.';
    }
    sfx.notify();
    showNotif('🏦 Bank earned +10,000 S.I.P.!');
  }, 60000);

  // Same "start it now, not at page load" reasoning as the bank timer above — keeps checking for a
  // real day-change while the session stays open (e.g. left running overnight past midnight),
  // instead of only ever checking once at login.
  setInterval(checkCalendarReminders, 60000);

  // User's own ask: "add a sighn saying do u want to go to heaven it appears once 5 min" — a real
  // periodic invite to Heaven (HEAVEN_ZONE/enterHeaven(), game-world.js — the existing Divine
  // Judgment redemption destination, reused here rather than building a second one), same
  // 5-minute cadence idea as the bank timer above. Skipped while already in Heaven so it doesn't
  // ask someone who already said yes.
  setInterval(maybeShowHeavenInvite, 300000);

  // Check WebGL is available
  const _tc = document.createElement('canvas');
  const _gl = _tc.getContext('webgl') || _tc.getContext('experimental-webgl');
  if (!_gl) {
    const err = document.createElement('div');
    err.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#111;color:#f55;font-size:22px;display:flex;align-items:center;justify-content:center;text-align:center;padding:30px;z-index:9999;';
    err.innerHTML = '⚠️ WebGL not available.<br>Try opening in Chrome or Firefox.';
    document.body.appendChild(err);
    return;
  }

  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  // Fog far + camera far both widened for the 20x-bigger War Territory countries (item ~234) —
  // at the old 1200/3000, a country out past WORLD_BOUND would render as solid gray fog (or not
  // render AT ALL past the camera's hard clip) even after every other part of this change landed.
  scene.fog = new THREE.Fog(0x87CEEB, 200, 6000);
  camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 16000);
  renderer = new THREE.WebGLRenderer({ antialias:false });
  renderer.shadowMap.enabled = false;
  document.body.appendChild(renderer.domElement);
  const rd = renderer.domElement;
  rd.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;';
  function _resizeRenderer() {
    const w = window.innerWidth  || document.documentElement.clientWidth  || 840;
    const h = window.innerHeight || document.documentElement.clientHeight || 360;
    // The 3rd arg (false) asks Three.js to update only the internal drawing
    // resolution, not the canvas's CSS width/height — but setPixelRatio below
    // can still reset the style back to fixed pixel values internally, so the
    // style is force-reasserted afterward as a guaranteed final step. Without
    // this, a resize that fires with a too-small reading (e.g. during an
    // itch.io mobile embed still settling) visually pins the canvas to that
    // small size until another resize happens to read bigger.
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rd.style.width = '100%';
    rd.style.height = '100%';
    camera.aspect = w / h;
    // Real bug fix: FOV used to be a fixed 70° vertical for every aspect ratio. On a portrait
    // phone (aspect ~0.46), that same 70° vertical FOV squeezes the HORIZONTAL field of view down
    // to roughly 36° (vs ~102° on a typical 16:9 desktop) — you only see a narrow forward sliver
    // of road/ground with no buildings visible on either side, which reads as "swimming in an
    // endless gray ocean" instead of a city (the actual reported symptom). Widen the vertical FOV
    // as the screen gets taller/narrower than it is wide, recovering a usable horizontal view,
    // capped so it never turns fisheye-extreme on very tall phones.
    camera.fov = camera.aspect >= 1 ? 70 : Math.min(100, 70 + (1 - camera.aspect) * 45);
    camera.updateProjectionMatrix();
  }
  _resizeRenderer();
  window.addEventListener('resize', _resizeRenderer);
  window.addEventListener('orientationchange', () => setTimeout(_resizeRenderer, 300));
  setTimeout(_resizeRenderer, 500);
  setTimeout(_resizeRenderer, 1500);
  // The fixed-delay calls above are a guess at when an itch.io mobile embed
  // settles into its final iframe size — if it takes longer than that, the
  // renderer keeps drawing at the wrong resolution while the canvas's CSS box
  // is already the right size, which stretches the image (looks "squished").
  // ResizeObserver reacts to the ACTUAL size change whenever it happens instead
  // of guessing a delay, so it catches slow-to-settle embeds the timers miss.
  if(window.ResizeObserver) {
    new ResizeObserver(_resizeRenderer).observe(document.body);
  }

  sunLight = new THREE.DirectionalLight(0xfff5e0, 1.2);
  sunLight.position.set(60,100,40);
  ambientLight = new THREE.AmbientLight(0x9ab8d8, 0.7);
  scene.add(sunLight, ambientLight);

  function _dbg(label, fn) {
    try { fn(); }
    catch(e) {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);background:red;color:#fff;padding:8px 16px;border-radius:8px;z-index:9999;font-size:13px;pointer-events:none;';
      d.textContent = '❌ Crash in ' + label + ': ' + e.message;
      document.body.appendChild(d);
      console.error(label, e);
    }
  }
  _dbg('buildCity', buildCity);
  _dbg('buildFactories', buildFactories);
  _dbg('buildLabNPCs', buildLabNPCs); // Scientist NPCs at the Science Lab — after buildCity so the Lab building already exists
  _dbg('buildBankInterior', buildBankInterior);
  _dbg('buildPlayerHouse', buildPlayerHouse);
  _dbg('buildHouseInterior', buildHouseInterior);
  _dbg('buildHotelInterior', buildHotelInterior);
  _dbg('buildMallInterior', buildMallInterior);
  _dbg('buildArcadeInterior', buildArcadeInterior);
  _dbg('buildWoodsArea', buildWoodsArea);
  _dbg('buildSunsetPlains', buildSunsetPlains);
  _dbg('buildExtraMalls', buildExtraMalls);
  _dbg('buildLandHouseInterior', buildLandHouseInterior);
  _dbg('buildCountryHotelInterior', buildCountryHotelInterior);
  _dbg('buildAirportLoungeInterior', buildAirportLoungeInterior);
  _dbg('buildScrapyard', buildScrapyard);
  _dbg('buildRobotArenaInterior', buildRobotArenaInterior);
  _dbg('buildBosses', buildBosses);
  _dbg('buildMovieFightRoom', buildMovieFightRoom);
  _dbg('buildFightArena', buildFightArena);
  _dbg('buildGlobalSpawners', buildGlobalSpawners);
  _dbg('buildDump', buildDump);
  _dbg('buildMallShopWing', buildMallShopWing);
  _dbg('buildOutfitShopWing', buildOutfitShopWing);
  _dbg('buildShopInteriorShell', buildShopInteriorShell); // walkable shop interiors — one shared pocket room, reskinned per shop on entry (game-shopinteriors.js)
  _dbg('buildCountryZones', buildCountryZones);
  _dbg('buildSpaceZone', buildSpaceZone);
  _dbg('buildHillTerrain', buildHillTerrain); // real hills — after buildCity (groundMesh color) and every region's own content (Woods/Plains/countries) is built
  _dbg('buildDeepSpaceZones', buildDeepSpaceZones);
  _dbg('buildSpaceZoneNPCs', buildSpaceZoneNPCs); // astronauts at the Space Station — after buildSpaceZone/buildDeepSpaceZones so their landmarks already exist
  _dbg('buildDeepSpaceNPCs', buildDeepSpaceNPCs); // astronauts on Moon/Mars, aliens on Jupiter/Andromeda
  _dbg('buildTraffic', buildTraffic);
  _dbg('buildSportsParkInterior', buildSportsParkInterior);
  _dbg('buildHospitalInterior', buildHospitalInterior);
  _dbg('buildSeaInterior', buildSeaInterior);
  _dbg('buildSchoolInterior', buildSchoolInterior);
  _dbg('buildSchoolNPCs', buildSchoolNPCs); // real teacher + seated classmates — after buildSchoolInterior so the room/desks already exist
  _dbg('spawnOwnedCars', spawnOwnedCars);
  _dbg('buildWeaponLevels', buildWeaponLevels); // must run before buildPlayer()/updateWeaponMesh() touch the currently-equipped weapon's damage — otherwise a returning player's weapon keeps dealing OLD (pre-rebalance) damage until they happen to open the shop
  _dbg('buildPlayer', buildPlayer);
  _dbg('buildBuddy', buildBuddy);
  _dbg('buildBodyguards', buildBodyguards);
  _dbg('buildChild', buildChild);
  _dbg('applyCameraFX', applyCameraFX);
  _dbg('buildNPCs', buildNPCs);
  _dbg('buildShopperPopulation', buildShopperPopulation);
  _dbg('buildRelatives', buildRelatives);
  _dbg('buildCountryNeighborhoods', buildCountryNeighborhoods);
  _dbg('refreshHouseGuest', refreshHouseGuest); // must run AFTER shoppers exist, in case a save loaded with a guest already set
  _dbg('buildCityShops', buildCityShops);
  _dbg('buildTownEventsBoard', buildTownEventsBoard);
  _dbg('buildWorldEventsBoard', buildWorldEventsBoard);
  _dbg('buildDetectiveCorkboard', buildDetectiveCorkboard); // Mysteries — game-world.js
  _dbg('resumeMysteryCase', resumeMysteryCase); // rebuilds an already-active case's props/NPCs after a reload — must run after buildDetectiveCorkboard/buildCity/buildFightArena/buildSunsetPlains etc. so every case location's real landmarks already exist
  _dbg('buildWarRoom', buildWarRoom);
  _dbg('buildElders', buildElders);
  _dbg('buildChildren', buildChildren); // must run AFTER shoppers exist — looks up parent NPCs by name for home position
  _dbg('buildPrisonInterior', buildPrisonInterior);
  _dbg('buildHellInterior', buildHellInterior); // Divine Judgment's real sentence location — see game-world.js
  _dbg('buildHeavenZone', buildHeavenZone); // Divine Judgment redemption destination — after buildDeepSpaceZones/GRAVITY_ZONES above so it sits alongside the other planet zones consistently
  _dbg('buildOwnedStore', buildOwnedStore);
  _dbg('applySeasonEffects', applySeasonEffects);
  _dbg('tickWeather', () => tickWeather(0)); // one call before the first frame renders, so the real dynamic weather (not just the old static season particle) is already picked and applied instead of flashing/overriding on frame 1
  _dbg('updateDayNight', updateDayNight); // one call before the first frame renders, so day/night colors are already correct instead of flashing default values
  _dbg('checkPendingNotices', checkPendingNotices);
  _dbg('checkCalendarReminders', checkCalendarReminders); // one call at game start, same as checkPendingNotices above, so a reminder due today notifies right away instead of waiting for the first 60s interval tick
  setupControls();
  // Snap camera to spawn position so first frame isn't black
  camera.position.set(
    playerGroup.position.x - Math.sin(yaw) * 9,
    playerGroup.position.y + 4 + pitch * 4,
    playerGroup.position.z - Math.cos(yaw) * 9
  );
  camera.lookAt(playerGroup.position.x, playerGroup.position.y + 2.2, playerGroup.position.z);
  animate();
  bgMusic.start();
  setTimeout(() => { if(_frames < 1) _showErr('animate() never ran — THREE may not have loaded. Check that three.min.js is in the ZIP.'); }, 3000);
  if(!hasSeenGuide) openGuide(); // first time in the world for this account — walk them through it before they get lost
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function mat(color) { return new THREE.MeshLambertMaterial({color}); }
// Transient "build context" — active ONLY while constructing a scaled-up War Territory country
// (see buildCountryZones()/buildSpaceZone(), item ~234, user: "lets make the countrys 20 times
// bigger"). null everywhere else in the file (the other ~99% of box()/addCol()/buildSignPanels()
// call sites), so scalePt()/scaleLen() below are provably a no-op for everything that isn't a
// country build. Deliberately NOT a THREE.Group-and-scale-the-group approach: buildTownExtras()
// computes several plain local variables (airport/hotel door spots) that get reused both as
// box()/addCol() position args AND passed straight into other functions (enterAirportLounge(),
// checkinCountryHotel()) and raw CITY_ZONES.push({x,z,...}) object literals that never go
// through any wrapper at all — a Group transform can't reach those non-mesh, non-collider call
// sites, so the scale has to be real, absolute-coordinate math applied consistently by hand
// (scalePt/scaleLen), not something a parent transform can quietly handle for free.
let _buildOrigin = null, _buildScale = 1;
// (worldX, worldZ) offset-from-origin, scaled — the one shared formula every transform below
// reduces to. Used directly by box()/addCol(), and exposed for the handful of buildTownExtras
// call sites (CITY_ZONES.push, enterAirportLounge, checkinCountryHotel) that bypass both.
function scalePt(x, z) {
  if (!_buildOrigin) return [x, z];
  return [_buildOrigin.x + (x - _buildOrigin.x) * _buildScale, _buildOrigin.z + (z - _buildOrigin.z) * _buildScale];
}
// User's own correction after seeing the countries at COUNTRY_SCALE: "why is the city for
// giants i meant make the citys bigger by giveing it more land not large[ness]" — the original
// "20x bigger" ask (item ~234) scaled BOTH each object's own size (via this function) AND its
// distance from the country's center (via scalePt below) by the same factor, which reads as
// "everything got giant" rather than "the country covers more land." Real fix: only scalePt
// keeps the 20x spread now — buildings/trees/walls stay their real, human-proportioned size,
// spread across the exact same big footprint as before. No change to any per-country layout
// code was needed; this one function is the only place object SIZE (as opposed to position)
// ever got scaled.
function scaleLen(n) { return n; }
function box(w,h,d, color, x,y,z) {
  if (_buildOrigin) { w=scaleLen(w); h=scaleLen(h); d=scaleLen(d); [x,z]=scalePt(x,z); y=scaleLen(y); }
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color));
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true;
  scene.add(m); return m;
}
// Shared two-panel builder used by both buildSign() and buildLogoSign(). A single mirrored
// texture on one DoubleSide plane can only ever be correct from ONE approach direction — the
// opposite direction always shows it backwards (this is what happened to the house nameplate,
// and evidently other signs too). The real fix: two COPLANAR meshes, same geometry, same
// transform, NOT rotated relative to each other — one THREE.FrontSide with a normal texture,
// one THREE.BackSide with a mirrored texture. FrontSide/BackSide change which face renders,
// NOT the coordinate mapping (rotating the mesh instead was tried first and was wrong — it
// flips the local-U-to-world-X mapping too, cancelling the mirror back out). Same mental model
// as text printed on glass: correct from either side of the pane.
function buildSignPanels(cvWidth, cvHeight, drawFn, x, y, z, rot, planeWidth, planeHeight) {
  function makeCanvas(mirror) {
    const cv = document.createElement('canvas'); cv.width = cvWidth; cv.height = cvHeight;
    const c = cv.getContext('2d');
    c.save();
    if (mirror) { c.scale(-1,1); c.translate(-cvWidth,0); }
    drawFn(c);
    c.restore();
    return cv;
  }
  if (_buildOrigin) { planeWidth=scaleLen(planeWidth); planeHeight=scaleLen(planeHeight); [x,z]=scalePt(x,z); y=scaleLen(y); }
  const geo = new THREE.PlaneGeometry(planeWidth, planeHeight);
  const front = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(makeCanvas(false)), side: THREE.FrontSide }));
  const back  = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(makeCanvas(true)),  side: THREE.BackSide }));
  const g = new THREE.Group();
  g.add(front); g.add(back);
  g.position.set(x,y,z); g.rotation.y = rot; scene.add(g);
  return g;
}
function buildSign(text, x, y, z, rot=0) {
  // Long text (e.g. a 50-character player name in "X's House") used to just run off the old
  // fixed 256px canvas and get clipped — shrinking the font wasn't enough on its own (a real
  // 50-char name still didn't fit even at the smallest readable size). Instead, WIDEN the
  // canvas/plane to fit the text at a fixed readable font — short text (every other sign in
  // the game) measures under the 256px floor, so its canvas/plane size never changes at all.
  const fontSize = 22;
  const mCv = document.createElement('canvas'); const mC = mCv.getContext('2d');
  mC.font = `bold ${fontSize}px Arial`;
  const cvWidth = Math.max(256, Math.ceil(mC.measureText(text).width) + 32);
  const planeWidth = 6 * (cvWidth / 256);
  return buildSignPanels(cvWidth, 64, (c) => {
    c.fillStyle='#fff'; c.fillRect(0,0,cvWidth,64);
    c.fillStyle='#111'; c.font=`bold ${fontSize}px Arial`; c.textAlign='center'; c.fillText(text,cvWidth/2,42);
  }, x, y, z, rot, planeWidth, 1.5);
}
// A real branded storefront sign: a colored circular logo badge (the shop's emoji) + its name
// as a wordmark beside it, instead of just plain emoji+text jammed together — matches how an
// actual storefront sign looks. `color`/`accentColor` are CSS color strings — a real 2-color
// theme (badge fill + ring, matching the storefront's own body + roof-trim colors) instead of
// a single flat color with a generic white ring.
function buildLogoSign(name, emoji, color, accentColor, x, y, z, rot=0) {
  const fontSize = 18;
  const mCv = document.createElement('canvas'); const mC = mCv.getContext('2d');
  mC.font = `bold ${fontSize}px Arial`;
  const cvWidth = Math.max(220, Math.ceil(mC.measureText(name).width) + 92);
  const cvHeight = 76;
  const planeWidth = 6.5 * (cvWidth / 220);
  return buildSignPanels(cvWidth, cvHeight, (c) => {
    c.fillStyle='#fff'; c.fillRect(0,0,cvWidth,cvHeight);
    c.strokeStyle=accentColor; c.lineWidth=3; c.strokeRect(1.5,1.5,cvWidth-3,cvHeight-3);
    const badgeX=40, badgeY=cvHeight/2, badgeR=28;
    c.beginPath(); c.arc(badgeX,badgeY,badgeR,0,Math.PI*2); c.fillStyle=color; c.fill();
    c.lineWidth=4; c.strokeStyle=accentColor; c.stroke();
    c.font='32px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(emoji,badgeX,badgeY+2);
    c.fillStyle='#111'; c.font=`bold ${fontSize}px Arial`; c.textAlign='left'; c.fillText(name,badgeX+badgeR+14,badgeY);
    c.fillStyle=accentColor; c.fillRect(badgeX+badgeR+14, badgeY+fontSize/2+4, mC.measureText(name).width, 3);
  }, x, y, z, rot, planeWidth, 1.9);
}
function buildChair(x, z, yaw=0) {
  const g=new THREE.Group();
  const wood=mat(0x5a3a1a), legWood=mat(0x3a2410);
  const seat=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.08,0.5), wood); seat.position.set(0,0.45,0); g.add(seat);
  const back=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.08), wood); back.position.set(0,0.75,-0.21); g.add(back);
  [[-0.2,-0.2],[0.2,-0.2],[-0.2,0.2],[0.2,0.2]].forEach(([lx,lz])=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.45,0.06), legWood); leg.position.set(lx,0.22,lz); g.add(leg);
  });
  g.children.forEach(c=>{c.castShadow=true;c.receiveShadow=true;});
  g.position.set(x,0,z); g.rotation.y=yaw; scene.add(g);
  return g;
}
// Simple static decoration car — NOT drivable/ownable (that's the real CAR_CATALOG/buildCar
// system), just background scenery for parking lots. No collider, matching how trees/benches/
// other pure set-dressing in the city doesn't block walking either.
function buildParkedDecorCar(x, z, color, yawAngle) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.2,1.1,2), mat(color)); body.position.set(0,0.75,0); g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2,0.9,1.8), mat(color)); cabin.position.set(-0.3,1.55,0); g.add(cabin);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.9,0.55,1.6), mat(0x223344)); glass.position.set(-0.3,1.6,0); g.add(glass);
  [[-1.5,-0.9],[-1.5,0.9],[1.4,-0.9],[1.4,0.9]].forEach(([wx,wz])=>{
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.3,12), mat(0x222222));
    wheel.rotation.z = Math.PI/2; wheel.position.set(wx,0.4,wz); g.add(wheel);
  });
  g.children.forEach(c=>{c.castShadow=true;c.receiveShadow=true;});
  g.position.set(x,0,z); g.rotation.y = yawAngle; scene.add(g);
  return g;
}
// Cash/ATM feature — a small standalone street kiosk, deliberately NOT built like a full building
// (no roof structure, no columns, tiny addCol() footprint): a dark metal body, a lit screen panel
// on the front face, and a floating "🏧 ATM" sign, same box()+buildSign() construction every other
// small prop in this file uses. Reused identically at each real placement (see buildCity(),
// game-buildings.js, for the 5 real city locations and the reasoning behind each spot), same
// "shared builder function" pattern as buildChair()/buildParkedDecorCar() above rather than
// hand-copying the same handful of box() calls 5 times.
function buildATM(x, z) {
  box(1.1, 2.0, 0.7, 0x2b3a4a, x, 1.0, z);           // kiosk body — dark blue-grey metal
  box(1.15, 0.15, 0.75, 0x1a2530, x, 2.02, z);       // small cap/roof lip
  box(0.6, 0.6, 0.06, 0x1fd8ff, x, 1.35, z + 0.36);  // lit screen panel, front face
  box(0.7, 0.12, 0.1, 0x0d0d0d, x, 0.9, z + 0.36);   // card/cash slot below the screen
  buildSign('🏧 ATM', x, 2.7, z);
  const atmLight = new THREE.PointLight(0x33ccff, 0.5, 6);
  atmLight.position.set(x, 1.5, z + 0.5); scene.add(atmLight);
  addCol(CITY_COLS, x, z, 0.55, 0.4);
}
// ─── TRAFFIC — user's own ask: "roads all over the world traffic". Downtown already had real
// paved roads (roadSegments()/the main-street slabs above); every country did not — buildRoadLoop()
// gives each one a real paved square loop it never had before, sized (650-unit half-width) to
// clear every country's own buildings with margin (France's ~580-unit footprint is the largest).
// Traffic cars are simple waypoint-followers — same seek-and-rotate math tickCelebrityCrowds()
// already uses for crowds — either looping a 4-corner square (countries) or driving back and
// forth along an existing street (Downtown, so nothing gets drawn twice).
let trafficCars = []; // NOT persisted — {mesh,x,z,waypoints,wpIndex,dir,pingpong,speed}
const TRAFFIC_CAR_COLORS = [0xcc3333,0x3366cc,0xdddddd,0x33aa55,0xffcc33,0x9955cc];
// User's own ask: "the cars need to be the same size as mine" — traffic used to be a separate,
// smaller decoration mesh (buildParkedDecorCar, still used for genuinely-empty parking-lot
// scenery elsewhere). Real fix: build traffic cars with the EXACT same buildCar() every player-
// ownable car uses (just a plain {color} in place of a real CAR_CATALOG entry, since buildCar
// only ever reads .color), so "same size" is a real guarantee, not two numbers kept in sync by hand.
const DRIVER_SKIN_TONES = [0xf5c89a,0xd9a066,0x8d5524,0xffe0bd,0xc68642];
const DRIVER_SHIRT_COLORS = [0x2196F3,0xe94560,0x33aa55,0xffaa33,0x9955cc,0x555555];
function buildTrafficCarMesh(color, x, z, yawAngle) {
  const g = buildCar({ color }, x, z, yawAngle);
  // A real driver, visible through the now-transparent windshield — seated low in the cabin,
  // toward the front where the windshield actually is (buildCar's cabin runs z -2.75..1.75).
  const skin = DRIVER_SKIN_TONES[Math.floor(Math.random()*DRIVER_SKIN_TONES.length)];
  const shirt = DRIVER_SHIRT_COLORS[Math.floor(Math.random()*DRIVER_SHIRT_COLORS.length)];
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.7,0.5), mat(shirt)); torso.position.set(-0.7,1.55,1.0); torso.castShadow=true; g.add(torso);
  const head  = new THREE.Mesh(new THREE.BoxGeometry(0.45,0.45,0.45), mat(skin)); head.position.set(-0.7,2.1,1.0); head.castShadow=true; g.add(head);
  return g;
}
function spawnTrafficCar(waypoints, opts) {
  opts = opts || {};
  const start = waypoints[0];
  const mesh = buildTrafficCarMesh(TRAFFIC_CAR_COLORS[trafficCars.length % TRAFFIC_CAR_COLORS.length], start.x, start.z, 0);
  trafficCars.push({ mesh, x:start.x, z:start.z, waypoints, wpIndex:1 % waypoints.length, dir:1, pingpong: !!opts.pingpong, speed: opts.speed || (9+Math.random()*4) });
}
function buildRoadLoop(cx, cz, half) {
  const w = 14;
  box(half*2+w, 0.05, w, 0x555566, cx, 0.01, cz-half);
  box(half*2+w, 0.05, w, 0x555566, cx, 0.01, cz+half);
  box(w, 0.05, half*2+w, 0x555566, cx-half, 0.01, cz);
  box(w, 0.05, half*2+w, 0x555566, cx+half, 0.01, cz);
}
function buildTraffic() {
  // Downtown — reuse the existing main streets (x=±9.5, z=±9.5), cars just drive back and forth.
  spawnTrafficCar([{x:9.5,z:-140},{x:9.5,z:140}], {pingpong:true});
  spawnTrafficCar([{x:-9.5,z:140},{x:-9.5,z:-140}], {pingpong:true});
  spawnTrafficCar([{x:-140,z:9.5},{x:140,z:9.5}], {pingpong:true});
  spawnTrafficCar([{x:140,z:-9.5},{x:-140,z:-9.5}], {pingpong:true});

  // Every country — a real road loop it didn't have before, 2 cars circling each one.
  Object.keys(COUNTRY_CENTERS).forEach(name => {
    const { x:cx, z:cz } = COUNTRY_CENTERS[name];
    const half = 650;
    buildRoadLoop(cx, cz, half);
    const corners = [
      {x:cx-half,z:cz-half}, {x:cx+half,z:cz-half},
      {x:cx+half,z:cz+half}, {x:cx-half,z:cz+half},
    ];
    spawnTrafficCar(corners);
    spawnTrafficCar([corners[2],corners[3],corners[0],corners[1]]); // starts on the far side of the same loop
  });
}
function tickTraffic(dt) {
  trafficCars.forEach(c => {
    // Distance-remaining loop (not a single step-and-check) so a big dt — a lag spike, a
    // backgrounded tab catching up — can't send a car flying past its waypoint and never
    // registering arrival; leftover movement always carries into the next leg instead.
    let remaining = c.speed * dt;
    let guard = 0;
    while (remaining > 0 && guard++ < 20) {
      const target = c.waypoints[c.wpIndex];
      const dx = target.x-c.x, dz = target.z-c.z, d = Math.hypot(dx,dz);
      if (d <= remaining) {
        c.x = target.x; c.z = target.z;
        remaining -= d;
        if (c.pingpong) {
          const next = c.wpIndex + c.dir;
          if (next < 0 || next >= c.waypoints.length) c.dir *= -1;
          c.wpIndex += c.dir;
        } else {
          c.wpIndex = (c.wpIndex+1) % c.waypoints.length;
        }
        if (d < 0.001) break;
      } else {
        c.x += dx/d*remaining; c.z += dz/d*remaining;
        c.mesh.rotation.y = Math.atan2(dx, dz);
        remaining = 0;
      }
    }
    c.mesh.position.set(c.x, 0, c.z);
  });
}
// Reusable roadside billboard — posts + backing + a canvas ad panel, same visual recipe
// buildCityShops() already proved for the 100 outdoor shops (item 104), just generalized
// to take custom text/rotation instead of being inlined once per shop. DoubleSide + a Group
// (rotates as one unit) so it can be placed facing either direction along a road.
function buildRoadBillboard(x, z, rotY, emoji, text) {
  const g = new THREE.Group();
  const postL = new THREE.Mesh(new THREE.BoxGeometry(0.25,3.5,0.25), mat(0x5a5a5a)); postL.position.set(-2,1.75,0); g.add(postL);
  const postR = new THREE.Mesh(new THREE.BoxGeometry(0.25,3.5,0.25), mat(0x5a5a5a)); postR.position.set(2,1.75,0); g.add(postR);
  const backing = new THREE.Mesh(new THREE.BoxGeometry(4.6,2.2,0.15), mat(0x222222)); backing.position.set(0,3.6,0); g.add(backing);
  const cv = document.createElement('canvas'); cv.width=300; cv.height=140;
  const cx = cv.getContext('2d');
  cx.fillStyle='#fffbe0'; cx.fillRect(4,4,292,132);
  cx.strokeStyle='#222'; cx.lineWidth=5; cx.strokeRect(4,4,292,132);
  cx.textAlign='center'; cx.textBaseline='middle';
  cx.font='40px Arial'; cx.fillText(emoji,150,40);
  cx.fillStyle='#222'; cx.font='bold 17px Arial';
  wrapText(cx, text, 150, 85, 260, 22);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(4.4,2.05), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv), transparent:true, side:THREE.DoubleSide}));
  board.position.set(0,3.6,-0.08);
  g.add(board);
  g.children.forEach(c=>{c.castShadow=true;c.receiveShadow=true;});
  g.position.set(x,0,z); g.rotation.y = rotY; scene.add(g);
}

// ─── SEASONS & CALENDAR ──────────────────────────────────────────────────────
const HOLIDAYS = {
  '01-01': {name:"New Year's Day",  emoji:'🎊'},
  '02-14': {name:"Valentine's Day", emoji:'❤️'},
  '03-17': {name:"St. Patrick's",   emoji:'🍀'},
  '04-01': {name:"April Fools",     emoji:'🃏'},
  '07-04': {name:"4th of July",     emoji:'🎆'},
  '10-31': {name:"Halloween",       emoji:'🎃'},
  '12-24': {name:"Christmas Eve",   emoji:'🌙'},
  '12-25': {name:"Christmas",       emoji:'🎄'},
  '12-31': {name:"New Year's Eve",  emoji:'🥂'},
};
const SEASONS = {
  winter: {sky:0xc8d8e8, fog:0xc8d8e8, ground:0xddeeff, tree:0x99aabb, particle:'snow',  emoji:'❄️', name:'Winter'},
  spring: {sky:0x87CEEB, fog:0x87CEEB, ground:0x5ab44c, tree:0x44cc44, particle:null,     emoji:'🌸', name:'Spring'},
  summer: {sky:0x5bbce0, fog:0x5bbce0, ground:0x3a8a2a, tree:0x228822, particle:null,     emoji:'☀️', name:'Summer'},
  fall:   {sky:0xc8a070, fog:0xd4a870, ground:0x8a5828, tree:0xcc6622, particle:'leaves', emoji:'🍂', name:'Fall'},
};

function getSeasonInfo() {
  const now  = new Date();
  const m    = now.getMonth() + 1;
  const d    = now.getDate();
  const mmdd = String(m).padStart(2,'0') + '-' + String(d).padStart(2,'0');
  const sk   = (m===12||m<=2)?'winter':m<=5?'spring':m<=8?'summer':'fall';
  const season = SEASONS[sk];
  let holiday  = HOLIDAYS[mmdd] || null;
  if(!holiday && playerBirthday && playerBirthday === mmdd)
    holiday = {name:'Happy Birthday ' + (playerName||'Player') + '!', emoji:'🎂'};
  let skySky = season.sky, fogFog = season.fog;
  if(m===10 && d===31){ skySky=0x1a0a2e; fogFog=0x220a1a; }
  return {season, sk, holiday, skySky, fogFog, mmdd};
}

// ─── DAY/NIGHT CYCLE — runs off playTimeSeconds (real seconds actually played, same clock
// tickGrowth already uses for growth stages), NOT the real-world wall clock, so it advances at
// the same steady pace no matter what timezone or time of day you actually play at. One full
// day+night takes DAY_LENGTH real seconds; brightness follows a smooth cosine curve (0 at
// midnight, 1 at noon) instead of hard day/night cuts, so dawn and dusk fade in and out. Season
// effects above still own the "full daylight" base sky/fog color (seasonSkyColor/seasonFogColor)
// — this system only darkens toward that base at night, it never fights season for ownership of
// scene.background/scene.fog.color. ──────────────────────────────────────────────────────────
const DAY_LENGTH = 1800; // real seconds for one full day+night cycle (30 minutes)
let seasonSkyColor, seasonFogColor; // THREE.Color, lazily created in applySeasonEffects (THREE isn't loaded yet at parse time)
let _dayNightColors = null;         // lazily built cache of THREE.Color helpers, see updateDayNight
let _judgmentColor = null;          // lazily built cache for the Wrath/Satan sky override, see updateDayNight
let _rainTintColor = null, _fogTintColor = null; // lazily built cache for the weather sky tint, see updateDayNight
let lastDayPhase = null;            // 'Day'|'Dawn'|'Dusk'|'Night' — only re-renders the HUD when this actually changes
let lastTimeZoneCountry = null;     // country name the last HUD render reflected, or null outside any country
// ─── SPACE/PLANET ZONE SKY OVERRIDE — "make it so it actually brings you to another planet not
// just a weird spot of rock on earth": the 5 space/planet zones (SPACE_ZONE + the 4 GRAVITY_ZONES
// entries beyond it, game-world.js) are small 110x110 platforms sitting directly on the SAME
// shared Earth ground/sky as the rest of the map (see buildPlanetZone()'s own comment there) —
// nothing about the ordinary season/weather/day-night sky above ever knew they existed, so
// standing on the Moon still showed Explox's ordinary blue daytime (or rainy!) Earth sky. This
// table gives each zone its own real, DISTINCT sky/fog/light — checked and applied as its own
// priority tier in updateDayNight() below, the same "top priority, early return" shape the
// Wrath/Satan judgment override above it already uses, just one tier further down (judgment still
// wins if somehow both are active at once — Satan's Reign is "the whole world" ending, not a
// per-zone problem, so it stays the higher-priority check). Colors lean on real astronomy where
// Explox has a real answer (Mars' sky really is a dusty red-orange from iron oxide dust; the Moon
// really has a black sky even at "midday" since it has no atmosphere to scatter light into a blue
// dome the way Earth's does) and a deliberate distinct mood where it's this game's own invention
// (the Space Station's near-Earth orbit vs. the Moon's flat black, Jupiter's outpost, Andromeda).
// fogNear/fogFar are tuned to each zone's own ~110-unit platform footprint (half-width 55, plus a
// little slack for the star scatter around it) — NOT GRAVITY_ZONES' own much larger gravity-EFFECT
// radius, which for the Space Station alone is 1200 (60*COUNTRY_SCALE): using that as the fog
// distance would leave over a thousand units of mismatched Earth ground plainly visible past the
// platform, the exact bug this table exists to fix.
const SPACE_ZONE_SKY = {
  'Space Station': { sky:0x02040c, fog:0x02040c, ambient:0x141428, sun:1.0,  ambientI:0.35, fogNear:50, fogFar:190 },
  Moon:            { sky:0x000000, fog:0x000000, ambient:0x1c1c22, sun:1.05, ambientI:0.3,  fogNear:50, fogFar:180 },
  Mars:            { sky:0xc9703f, fog:0xb3673f, ambient:0x5a3320, sun:0.75, ambientI:0.55, fogNear:50, fogFar:180 },
  Jupiter:         { sky:0x6e4a26, fog:0x6e4a26, ambient:0x3a2814, sun:0.55, ambientI:0.65, fogNear:55, fogFar:190 },
  Andromeda:       { sky:0x1a0a2a, fog:0x1a0a2a, ambient:0x2a1a3a, sun:0.3,  ambientI:0.55, fogNear:50, fogFar:180 }, // 0x1a0a2a is the exact ground color buildPlanetZone() already gives Andromeda — extended here to the sky too
  // HEAVEN — the Divine Judgment redemption destination (see HEAVEN_ZONE/buildHeavenZone(),
  // game-world.js). Warm radiant gold instead of any of the above's dark/alien palettes — the one
  // zone in this table that should feel welcoming rather than hostile or barren.
  Heaven:          { sky:0xfff2c9, fog:0xffe9a8, ambient:0xfff0cc, sun:1.3,  ambientI:0.75, fogNear:55, fogFar:190 },
};
let _wasInSpaceZone = false; // tracks the zone→no-zone transition so leaving a zone can restore the real base fog distance once, see updateDayNight
// A single shared "am I in a real indoor pocket space right now" check — the Sea/Space/War
// Territories are all outdoor real-world-ish locations (a beach or a planet's surface looking
// dark at night is normal), but these are actual roofed buildings, so they're the ones a real
// day/night cycle shouldn't be allowed to darken. Used by updateDayNight() below.
function isPlayerIndoors() {
  return inHouse || inMall || inHotel || inStore || inFriendHouse || inLandHouse || inCountryHotel || inAirportLounge || inPrison || inArcade || inArenaBattle || inMovieFight || inBankInterior || inSportsPark || inHospital || inSchool || inVisitStore || inShopInterior;
}
// ─── TIME ZONES — user's own ask: "and time zones". Each real Earth country gets a real-ish UTC
// offset matching its actual real-world zone, so the SAME moment of real playtime looks like a
// different time of day depending which country you're standing in — the same real reason time
// zones exist on the actual Earth. Downtown Explox and the Space Station stay on the base clock
// (no offset) — deep space doesn't have a real "time zone", and Downtown is the home reference.
const COUNTRY_TIME_ZONE_HOURS = { Japan:9, France:1, Brazil:-3, Egypt:2, UK:0, Australia:10, Canada:-5, Italy:1 };
function currentTimeZoneCountry() {
  if (!playerGroup) return null;
  for (const name in COUNTRY_TIME_ZONE_HOURS) {
    const c = COUNTRY_CENTERS[name];
    if (Math.hypot(playerGroup.position.x - c.x, playerGroup.position.z - c.z) < 85 * COUNTRY_SCALE) return name;
  }
  return null;
}
function getDayNightBrightness() {
  const zone = currentTimeZoneCountry();
  const offsetDayFrac = zone ? COUNTRY_TIME_ZONE_HOURS[zone] / 24 : 0;
  // adminTimeOffsetSeconds (game-admin.js, /time day|night) shifts ONLY this display calculation —
  // playTimeSeconds itself is left untouched since it also drives character growth/aging.
  const frac = ((((playTimeSeconds + adminTimeOffsetSeconds) / DAY_LENGTH) + offsetDayFrac) % 1 + 1) % 1; // 0..1, 0 = midnight; double-mod keeps negative UTC offsets positive
  const raw = (1 - Math.cos(frac * Math.PI * 2)) / 2;       // 0 at midnight, 1 at noon
  return { frac, raw, zone };
}
function updateDayNight() {
  if (!scene || !sunLight || !ambientLight || !seasonSkyColor) return;
  // "the safe period is when the sky is still red" — the blood-red sky isn't just for the Wrath
  // chase itself, it's a real visible marker for the whole 2-day grace period afterward too, so
  // there's always something to see that says "you're still living in the aftermath." "More black
  // sun" (Satan won this round) overrides even that, on top.
  const now = Date.now();
  // "he explodes in black consuming the whole world colapsing in a red sky" — the death-explosion
  // black beats even the Satan-won black, since it's the more recent/dramatic event; either way it
  // "collapses" back into the ordinary red once its own short timer runs out (see the fallthrough).
  if (wrathActive || now < safePeriodEndsAt || satanReignActive || now < satanDeathExplosionUntil) {
    if (!_judgmentColor) _judgmentColor = new THREE.Color();
    _judgmentColor.set((satanReignActive || now < satanDeathExplosionUntil) ? 0x050505 : 0x660000);
    scene.background.copy(_judgmentColor);
    scene.fog.color.copy(_judgmentColor);
    sunLight.intensity = 0.15;
    ambientLight.color.copy(_judgmentColor);
    ambientLight.intensity = 0.3;
    return;
  }
  // Space/planet zone override — 2nd priority tier, above the ordinary season/day-night/weather
  // code below it, same early-return shape as the judgment block just above. See SPACE_ZONE_SKY's
  // own comment for why each zone's colors were picked and why the fog distance is tied to the
  // zone's small ~110-unit platform, not GRAVITY_ZONES' own much larger gravity-effect radius.
  const _zone = currentSpaceZone(); // game-world.js — loads after this file, but only ever called here at real runtime, see that function's own comment
  const _zoneSky = _zone && SPACE_ZONE_SKY[_zone.name];
  if (_zoneSky) {
    _wasInSpaceZone = true;
    scene.background.set(_zoneSky.sky);
    scene.fog.color.set(_zoneSky.fog);
    scene.fog.near = _zoneSky.fogNear;
    scene.fog.far = _zoneSky.fogFar;
    sunLight.intensity = _zoneSky.sun;
    ambientLight.color.set(_zoneSky.ambient);
    ambientLight.intensity = _zoneSky.ambientI;
    return;
  } else if (_wasInSpaceZone) {
    // Just left a zone this frame — restore the REAL current base fog distance instead of leaving
    // it stuck at the tight zone value until the next natural weather roll (applyWeather() below
    // only re-touches scene.fog.near/far on an actual weather CHANGE, which could be minutes away).
    // Mirrors applyWeather()'s own Fog-weather shrink exactly (same 8/130 values, same condition)
    // rather than inventing a second fog-distance rule.
    _wasInSpaceZone = false;
    if (scene.fog && _baseFogNear !== null) {
      if (currentWeatherKey === 'fog') { scene.fog.near = 8; scene.fog.far = 130; }
      else { scene.fog.near = _baseFogNear; scene.fog.far = _baseFogFar; }
    }
  }
  if (!_dayNightColors) {
    _dayNightColors = {
      nightSky: new THREE.Color(0x0a1030), nightFog: new THREE.Color(0x0a1020),
      nightAmbient: new THREE.Color(0x1a2a55), dayAmbient: new THREE.Color(0x9ab8d8),
    };
  }
  const c = _dayNightColors;
  const { frac, raw: rawLocal, zone } = getDayNightBrightness();
  // A real indoor room doesn't go dark just because it's night outside (or in whatever time zone
  // the building happens to sit in) — generalizes item 269's mall-only fix to every indoor pocket
  // space at once, via the shared isPlayerIndoors() check above.
  const raw = isPlayerIndoors() ? 1 : rawLocal;
  const b = 0.12 + raw * 0.88; // floor so night dims but is never pitch black
  scene.background.copy(c.nightSky).lerp(seasonSkyColor, b);
  scene.fog.color.copy(c.nightFog).lerp(seasonFogColor, b);
  sunLight.intensity = 0.1 + raw * 1.15;
  ambientLight.color.copy(c.nightAmbient).lerp(c.dayAmbient, b);
  ambientLight.intensity = 0.25 + raw * 0.5;

  // Weather tint — layered ON TOP of the day/night colors just computed above, never in place of
  // them, and this whole function already returned early above during the Wrath/Satan judgment
  // override, so weather can never fight that priority. Clear/Snow/Breezy leave the sky exactly as
  // day/night computed it. Rain/Thunderstorm darken it toward a real storm-grey (Thunderstorm
  // darker + dims the sun more); Fog does a lighter grey-out to match its own near/far shrink
  // (applyWeather() below owns that shrink, this just makes the color agree with it).
  if (currentWeatherKey === 'rain' || currentWeatherKey === 'storm') {
    if (!_rainTintColor) _rainTintColor = new THREE.Color(0x3a4550);
    const amt = currentWeatherKey === 'storm' ? 0.55 : 0.35;
    scene.background.lerp(_rainTintColor, amt);
    scene.fog.color.lerp(_rainTintColor, amt);
    sunLight.intensity *= currentWeatherKey === 'storm' ? 0.55 : 0.75;
  } else if (currentWeatherKey === 'fog') {
    if (!_fogTintColor) _fogTintColor = new THREE.Color(0xc9d2d8);
    scene.background.lerp(_fogTintColor, 0.4);
    scene.fog.color.lerp(_fogTintColor, 0.55);
  }

  // The phase label always reflects the REAL local time where you're actually standing, even
  // indoors — being in a well-lit house at night shouldn't make the clock lie and say "Day".
  const phase = rawLocal >= 0.85 ? 'Day' : rawLocal < 0.3 ? 'Night' : (frac < 0.5 ? 'Dawn' : 'Dusk');
  if (phase !== lastDayPhase || zone !== lastTimeZoneCountry) { lastDayPhase = phase; lastTimeZoneCountry = zone; updateSeasonHud(); }
}

function applySeasonEffects() {
  if(!scene) return;
  const {season, holiday, skySky, fogFog, mmdd} = getSeasonInfo();
  // Sky/fog are no longer set directly here — they're the "full daylight" base color that
  // updateDayNight() darkens toward at night, every frame. See seasonSkyColor/seasonFogColor above.
  if (!seasonSkyColor) seasonSkyColor = new THREE.Color();
  if (!seasonFogColor) seasonFogColor = new THREE.Color();
  seasonSkyColor.set(skySky);
  seasonFogColor.set(fogFog);
  if(groundMesh) groundMesh.material.color.set(season.ground);
  hillPatchMeshes.forEach(h => { if(h.matchesGround) h.mesh.material.color.set(season.ground); });
  treeMeshes.forEach(m => m.material.color.set(season.tree));
  if(season.particle) startWeatherParticles(season.particle);
  updateSeasonHud();
  if(holiday) setTimeout(() => showNotif(holiday.emoji + ' ' + holiday.name + ' 🎉'), 1500);
  // On the player's ACTUAL birthday, throw the same kind of real party the neighbors get —
  // decor + a gift — instead of just a toast. Gated to once per real day (lastBirthdayGiftDate)
  // so reloading the page on your birthday doesn't hand out free money over and over.
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + mmdd;
  if(playerBirthday && playerBirthday === mmdd && lastBirthdayGiftDate !== todayStr) {
    lastBirthdayGiftDate = todayStr;
    saveCurrentUser();
    setTimeout(() => {
      buildEventDecor('birthday', TOWN_EVENT_SPOT.x, TOWN_EVENT_SPOT.z);
      queueEarning(30, 0, 'Birthday Gift');
      sfx.cheer();
      showNotif(`🎂 Happy Birthday, ${playerName || 'Player'}! The neighbors chipped in a gift. (+30 S.I.P. pending)`);
    }, 2000);
  }
}

const DAY_PHASE_EMOJI = { Day:'☀️', Dawn:'🌅', Dusk:'🌇', Night:'🌙' };
function updateSeasonHud() {
  const el = document.getElementById('seasonHud');
  if(!el) return;
  const {season, holiday} = getSeasonInfo();
  const phaseText = lastDayPhase ? '  |  ' + DAY_PHASE_EMOJI[lastDayPhase] + ' ' + lastDayPhase : '';
  const zoneText = lastTimeZoneCountry ? '  |  🌍 ' + lastTimeZoneCountry + ' Time' : '';
  const w = currentWeatherKey ? WEATHER_TYPES[currentWeatherKey] : null;
  const weatherText = w ? '  |  ' + w.emoji + ' ' + w.name : '';
  el.textContent = season.emoji + ' ' + season.name + weatherText + (holiday ? '  |  ' + holiday.emoji + ' ' + holiday.name : '') + phaseText + zoneText;
}

// ─── DYNAMIC WEATHER ──────────────────────────────────────────────────────────
// The old system was a static 1:1 function of season (winter=always snow, fall=always leaves,
// else always nothing). This replaces it with real day-to-day variety, using the EXACT same trick
// DAY_LENGTH/getDayNightBrightness() already use above: the current weather is DERIVED fresh from
// playTimeSeconds every time it's needed, split into WEATHER_CYCLE_SECONDS-long windows, instead of
// being a separately-persisted timer. Each window's weather is a deterministic weighted pick seeded
// from (window index + current season), so reloading the page resumes the SAME weather instead of
// rerolling — zero new save fields needed, exactly like day/night. 4 real minutes/state gives
// ~7-8 changes across one 30-minute DAY_LENGTH day, which reads as "weather actually changes today"
// without flickering between conditions every few seconds.
const WEATHER_CYCLE_SECONDS = 240;
const WEATHER_TYPES = {
  clear:  {emoji:'☀️',  name:'Clear',        particle:null},
  rain:   {emoji:'🌧️', name:'Rain',         particle:'rain'},
  storm:  {emoji:'⛈️',  name:'Thunderstorm', particle:'rain'},
  snow:   {emoji:'❄️',  name:'Snow',         particle:'snow'},
  fog:    {emoji:'🌫️', name:'Fog',          particle:null},
  leaves: {emoji:'🍂',  name:'Breezy',       particle:'leaves'},
};
// Odds per season, each row sums to 100. Winter leans Snow/Clear/Fog (no Rain/Breezy — it's cold,
// not leaf-blowing weather). Spring is Rain-heavy with a little Thunderstorm. Summer is mostly
// Clear with real occasional Thunderstorms and some Rain. Fall keeps the old 'leaves' look as its
// OWN weather state (a deliberate choice — see startWeatherParticles below — rather than folding it
// into a generic "windy" flag) mixed with Fog/Rain and a little Clear; Snow never happens outside
// winter and Breezy-leaves never happens outside fall, matching the old seasonal particle behavior.
const WEATHER_WEIGHTS = {
  winter: {clear:35, snow:40, fog:20, rain:0,  storm:0,  leaves:0},
  spring: {clear:30, rain:40, storm:10, fog:15, snow:0,  leaves:5},
  summer: {clear:55, storm:20, rain:15, fog:5,  snow:0,  leaves:5},
  fall:   {clear:20, leaves:30, fog:20, rain:25, storm:5, snow:0},
};
let currentWeatherKey = null;    // 'clear'|'rain'|'storm'|'snow'|'fog'|'leaves' — last APPLIED weather
let _lastWeatherWindow = null;   // WEATHER_CYCLE_SECONDS window index the above was computed for
let _lastWeatherSeasonKey = null;// season key the above was computed for (re-rolls on a season change even mid-window)
let lightningTimer = 0;          // real seconds until the next Thunderstorm flash
let weatherRainActive = false;   // whether sfx's rain loop is currently playing (tracks indoor pauses)
let _weatherRainKey = null;      // which of 'rain'/'storm' the currently-looping rain sound was started for
let _lightningFlashLight = null; // shared THREE.PointLight reused for every flash, see triggerLightning()
let _baseFogNear = null, _baseFogFar = null; // real base scene.fog distances, captured once so Fog weather can restore them exactly

// Deterministic 0..1 hash of a string (djb2-style) — the SAME window index + season always hashes
// to the SAME roll, so the SAME weather comes back after a reload instead of rerolling.
function _weatherHash01(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  return h / 4294967295;
}
function currentWeatherWindow() { return Math.floor(playTimeSeconds / WEATHER_CYCLE_SECONDS); }
function pickWeatherForWindow(windowIdx, sk) {
  const weights = WEATHER_WEIGHTS[sk];
  const roll = _weatherHash01(windowIdx + '_' + sk) * 100; // weight rows sum to 100
  let acc = 0;
  for (const key in weights) {
    acc += weights[key];
    if (roll < acc) return key;
  }
  return 'clear'; // float rounding fallback, never actually reached since weights sum to exactly 100
}

// Runs every frame (cheap — a hash + a handful of number ops). Only does real work — swapping
// particles/fog/HUD — on an ACTUAL weather change. The "Snow Day"/"Leaf Storm" shop add-ons
// (game-shops.js toggleAddOn) force a particle type directly and must win over natural weather —
// this bails out early while either is active, same spirit as updateDayNight()'s judgment override
// bailing out of the normal day/night math above.
function tickWeather(dt) {
  if (!scene) return;
  if (activeAddOns.includes('snowday') || activeAddOns.includes('leafstorm')) return;
  const { sk } = getSeasonInfo();
  const windowIdx = currentWeatherWindow();
  if (windowIdx !== _lastWeatherWindow || sk !== _lastWeatherSeasonKey) {
    _lastWeatherWindow = windowIdx;
    _lastWeatherSeasonKey = sk;
    applyWeather(pickWeatherForWindow(windowIdx, sk));
  }
  tickLightning(dt);
  tickRainAudio();
}

function applyWeather(key) {
  if (key === currentWeatherKey) return;
  const isFirstApply = currentWeatherKey === null;
  currentWeatherKey = key;
  const w = WEATHER_TYPES[key];
  startWeatherParticles(w.particle);
  // Fog weather temporarily shrinks the real fog near/far so visibility is actually limited; every
  // other weather restores the true base distance captured the first time this ever runs.
  if (scene.fog) {
    if (_baseFogNear === null) { _baseFogNear = scene.fog.near; _baseFogFar = scene.fog.far; }
    if (key === 'fog') { scene.fog.near = 8; scene.fog.far = 130; }
    else { scene.fog.near = _baseFogNear; scene.fog.far = _baseFogFar; }
  }
  lightningTimer = key === 'storm' ? 3 + Math.random()*6 : 0; // first strike lands a little sooner than the steady-state 8-20s gap below
  updateSeasonHud();
  if (!isFirstApply) showNotif(w.emoji + ' ' + w.name + ' moving in');
}

// Thunderstorm-only: a real random lightning flash every 8-20 real seconds, paired with a delayed
// thunder rumble (sfx.thunder() already existed for this exact sound). Skipped indoors — a flash
// lighting up your living room / the mall doesn't make sense, same "not intrusive indoors" spirit
// the rain sound loop below follows. Also skipped in a space/planet zone (currentSpaceZone(),
// game-world.js) — an Earth thunderstorm flashing over the Moon would be exactly the "still looks
// like Earth" bug the zone sky override above exists to fix.
function tickLightning(dt) {
  if (currentWeatherKey !== 'storm' || isPlayerIndoors() || currentSpaceZone()) return;
  lightningTimer -= dt;
  if (lightningTimer <= 0) {
    lightningTimer = 8 + Math.random()*12;
    triggerLightning();
  }
}
function triggerLightning() {
  if (!scene || !playerGroup) return;
  if (!_lightningFlashLight) {
    _lightningFlashLight = new THREE.PointLight(0xdfe8ff, 0, 500);
    scene.add(_lightningFlashLight);
  }
  _lightningFlashLight.position.set(
    playerGroup.position.x + (Math.random()-0.5)*80, 90, playerGroup.position.z + (Math.random()-0.5)*80
  );
  const L = _lightningFlashLight;
  // A quick bright-dim-bright-dark flicker (real lightning often double-strikes) instead of a flat
  // on/off flash — just staggered setTimeouts, same lightweight pattern showNotif()/birthday-gift
  // already use elsewhere in this file for "do this, then that, a beat later".
  L.intensity = 4.5;
  setTimeout(() => { if (L) L.intensity = 0.8; }, 90);
  setTimeout(() => { if (L) L.intensity = 3.2; }, 160);
  setTimeout(() => { if (L) L.intensity = 0; }, 260);
  setTimeout(() => sfx.thunder(), 350 + Math.random()*600); // thunder lags the flash like real light-before-sound
}

// Rain/Thunderstorm keep a real looping ambient rain sound going (sfx.startRain()/stopRain() in
// game-core.js — reuses the shared sfx AudioContext instead of a second audio engine). Paused
// (not just left running) while indoors via isPlayerIndoors(), matching how day/night already
// treats indoor pocket spaces as their own thing — restarts the instant you step back outside.
// Also paused in a space/planet zone (currentSpaceZone(), game-world.js), same reasoning as
// tickLightning() above — no Earth-side rain sound should follow the player to another planet.
function tickRainAudio() {
  const rainy = currentWeatherKey === 'rain' || currentWeatherKey === 'storm';
  const wantsRain = rainy && !isPlayerIndoors() && !currentSpaceZone();
  if (wantsRain && (!weatherRainActive || _weatherRainKey !== currentWeatherKey)) {
    weatherRainActive = true;
    _weatherRainKey = currentWeatherKey;
    sfx.startRain(currentWeatherKey === 'storm' ? 1.6 : 1);
  } else if (!wantsRain && weatherRainActive) {
    weatherRainActive = false;
    _weatherRainKey = null;
    sfx.stopRain();
  }
}

// Builds the falling-particle field for the given type: 'snow', 'leaves', 'rain', or null/absent
// (Clear/Fog — no particles). Spawn is centered on the PLAYER's position (not world origin) so
// weather is actually visible no matter where in the world you're standing — e.g. deep in a War
// Territory, not just near Downtown. The existing per-frame respawn logic in game-controls.js
// already recenters falling particles on the player once they pass below the ground, so this just
// makes the very FIRST spawn agree with that instead of starting the player's first ~20-100 real
// seconds (until the first respawn cycle) with no visible weather if they're far from the origin.
// Near Downtown (where the player normally starts) this looks identical to the old origin-centered
// spawn, since the player's spawn point IS close to the origin there — verified live, see report.
function startWeatherParticles(type) {
  weatherParticles.forEach(p => scene.remove(p));
  weatherParticles = [];
  if (!type) return; // Clear / Fog — an empty sky, no particles
  const cx = playerGroup ? playerGroup.position.x : 0;
  const cz = playerGroup ? playerGroup.position.z : 0;
  const count = type==='snow' ? 280 : type==='rain' ? 220 : 180;
  const leafColors = [0xcc6622,0xdd8833,0xaa4411,0xffaa00,0xdd5500];
  for(let i=0; i<count; i++) {
    const mesh = new THREE.Mesh(
      type==='snow' ? new THREE.SphereGeometry(0.12,4,4)
      : type==='rain' ? new THREE.CylinderGeometry(0.015,0.015,0.55,3)
      : new THREE.BoxGeometry(0.35,0.02,0.35),
      new THREE.MeshBasicMaterial({
        color: type==='snow' ? 0xffffff : type==='rain' ? 0x9fc6e0 : leafColors[Math.floor(Math.random()*leafColors.length)],
        transparent: type==='rain', opacity: type==='rain' ? 0.55 : 1
      })
    );
    mesh.position.set(cx + (Math.random()-0.5)*200, Math.random()*40, cz + (Math.random()-0.5)*200);
    mesh._speed  = type==='rain' ? 14 + Math.random()*6 : 0.5 + Math.random()*(type==='snow'?1.5:0.9);
    mesh._driftX = type==='rain' ? 0.6 : (Math.random()-0.5)*0.4;
    mesh._driftZ = type==='rain' ? 0.15 : (Math.random()-0.5)*0.2;
    mesh._spin   = type==='leaves' ? (Math.random()-0.5)*0.07 : 0;
    if (type==='rain') mesh.rotation.x = 0.35; // tilt the streak to match its drift — real wind-blown-rain look
    scene.add(mesh);
    weatherParticles.push(mesh);
  }
}

// Player-created calendar reminders — real persistence via game-core.js saveCurrentUser()/loginAs(),
// exactly the same pattern as unpaidBills/activeQuests elsewhere. Full 'YYYY-MM-DD' (not just
// 'MM-DD' like HOLIDAYS below) so a reminder is for one specific real date and can't collide across
// different years. `notified` starts false and flips to true the moment checkCalendarReminders()
// below fires it — a persisted per-reminder gate instead of one shared "last checked" date, because
// (unlike the fixed, always-known-in-advance playerBirthday lastBirthdayGiftDate gates on) a
// reminder can be freshly added for TODAY mid-session, after that day's check already ran; a single
// shared date gate would then never re-open until tomorrow and the reminder would silently never
// notify. Per-reminder `notified` fires exactly once, whenever it's actually due, with no such gap.
let calendarReminders = []; // persisted — [{id, date:'YYYY-MM-DD', text, notified}]

function openCalendar() {
  const info = getSeasonInfo();
  const now  = new Date();
  const year = now.getFullYear(), month = now.getMonth(), today = now.getDate();
  const MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const firstDay = new Date(year,month,1).getDay();
  const dim = new Date(year,month+1,0).getDate();
  // Bucket this player's reminders by full 'YYYY-MM-DD', but only for the month/year on screen —
  // openCalendar() has no month-navigation UI (it only ever shows the real current month), so a
  // reminder set for a different month would otherwise just silently vanish from view. otherMonthCount
  // below surfaces those instead of losing them.
  const remindersByDate = {};
  let otherMonthCount = 0;
  calendarReminders.forEach(r => {
    if(!r || !r.date) return;
    const p = r.date.split('-');
    if(p.length !== 3) return;
    if(+p[0] === year && +p[1] === month+1) (remindersByDate[r.date] = remindersByDate[r.date] || []).push(r);
    else otherMonthCount++;
  });
  let grid = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:10px;">';
  DN.forEach(n => { grid += `<div style="color:#666;font-size:9px;text-align:center;padding:2px;">${n}</div>`; });
  for(let i=0;i<firstDay;i++) grid += '<div></div>';
  for(let d=1;d<=dim;d++) {
    const mmdd = String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const fullDate = year+'-'+mmdd;
    const hol  = HOLIDAYS[mmdd];
    const isBd = playerBirthday === mmdd;
    const isTd = d===today;
    const dayReminders = remindersByDate[fullDate] || [];
    let bg='rgba(255,255,255,0.04)', col='#888', extra='';
    if(hol)  { bg='rgba(255,200,0,0.18)'; col='#FFD700'; extra=`<div style="font-size:9px;">${hol.emoji}</div>`; }
    if(isBd) { bg='rgba(255,80,200,0.22)'; col='#ff88ff'; extra=`<div style="font-size:9px;">🎂</div>`; }
    if(dayReminders.length) { extra += `<div style="font-size:9px;">📌</div>`; }
    if(isTd) { bg='#e94560'; col='#fff'; }
    const titleAttr = dayReminders.length ? ` title="${dayReminders.map(r=>escapeHtml(r.text)).join(', ')}"` : '';
    grid += `<div style="background:${bg};color:${col};border-radius:4px;padding:3px 1px;text-align:center;font-size:11px;font-weight:${isTd?'bold':'normal'};"${titleAttr}>${d}${extra}</div>`;
  }
  grid += '</div>';
  let upcoming = '';
  for(let d=today;d<=dim;d++){
    const mmdd=String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const fullDate = year+'-'+mmdd;
    const h=HOLIDAYS[mmdd];
    if(h)   upcoming += `<div style="color:#FFD700;font-size:11px;margin-bottom:3px;">${h.emoji} <b>${h.name}</b> — ${MN[month]} ${d}</div>`;
    if(playerBirthday===mmdd) upcoming += `<div style="color:#ff88ff;font-size:11px;margin-bottom:3px;">🎂 <b>Birthday!</b> — ${MN[month]} ${d}</div>`;
    (remindersByDate[fullDate] || []).forEach(r => {
      // A reminder that already fired (r.notified) stays listed as real history instead of
      // vanishing — just dimmed + checked off, so past reminders aren't silently lost.
      const fired = !!r.notified;
      upcoming += `<div style="color:${fired?'#888':'#ff8fa8'};font-size:11px;margin-bottom:3px;display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <span>${fired?'✅':'📌'} ${escapeHtml(r.text)} — ${MN[month]} ${d}</span>
        <span onclick="deleteCalendarReminder('${r.id}')" style="cursor:pointer;color:#888;flex-shrink:0;" title="Delete reminder">✕</span>
      </div>`;
    });
  }
  const otherMonthsNote = otherMonthCount>0 ? `<div style="color:#777;font-size:10px;margin-top:6px;">📌 +${otherMonthCount} reminder${otherMonthCount===1?'':'s'} in other months</div>` : '';
  const addForm = `
    <div style="border-top:1px solid #333;padding-top:8px;margin-top:8px;">
      <div style="color:#e94560;font-size:11px;font-weight:bold;letter-spacing:1px;margin-bottom:6px;">📌 ADD REMINDER</div>
      <input id="reminderDateInput" type="date" value="${year}-${String(month+1).padStart(2,'0')}-${String(today).padStart(2,'0')}" style="width:100%;box-sizing:border-box;padding:6px;margin-bottom:6px;border-radius:6px;border:1px solid #444;background:#0f0f1a;color:#fff;font-size:12px;">
      <input id="reminderTextInput" type="text" maxlength="60" placeholder="What do you want to remember?" style="width:100%;box-sizing:border-box;padding:6px;margin-bottom:6px;border-radius:6px;border:1px solid #444;background:#0f0f1a;color:#fff;font-size:12px;">
      <button onclick="addCalendarReminder()" style="width:100%;padding:7px;background:#e94560;border:none;border-radius:6px;color:#fff;font-weight:bold;font-size:12px;cursor:pointer;">＋ Add Reminder</button>
    </div>`;
  document.getElementById('calendarContent').innerHTML = `
    <div style="text-align:center;color:#e94560;font-size:14px;font-weight:bold;letter-spacing:2px;margin-bottom:6px;">${MN[month].toUpperCase()} ${year}</div>
    <div style="text-align:center;font-size:18px;margin-bottom:10px;">${info.season.emoji} ${info.season.name}</div>
    ${grid}
    ${upcoming?`<div style="border-top:1px solid #333;padding-top:8px;margin-top:2px;">${upcoming}</div>`:''}
    ${otherMonthsNote}
    ${addForm}
  `;
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('calendarOverlay').style.display='flex';
}
function closeCalendar() {
  document.getElementById('calendarOverlay').style.display='none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ─── CALENDAR REMINDER CRUD (real persistence — see calendarReminders in game-core.js save/load) ──
function addCalendarReminder() {
  const dateEl = document.getElementById('reminderDateInput');
  const textEl = document.getElementById('reminderTextInput');
  if(!dateEl || !textEl) return;
  const date = dateEl.value;
  const text = textEl.value.trim();
  if(!date || !text) { showNotif('📌 Pick a date and type what to remember first'); return; }
  calendarReminders.push({ id: 'rem_'+Date.now()+'_'+Math.floor(Math.random()*10000), date: date, text: text.slice(0,60), notified: false });
  saveCurrentUser();
  checkCalendarReminders(); // covers adding a reminder dated TODAY — fires the real notification right away instead of waiting for the next periodic tick
  openCalendar(); // re-render so the new reminder shows immediately in the grid + upcoming list
}
function deleteCalendarReminder(id) {
  calendarReminders = calendarReminders.filter(r => r.id !== id);
  saveCurrentUser();
  openCalendar();
}
// Real-time check that a reminder's date has actually arrived, so the player gets a real
// showNotif() the day it's due instead of having to remember to open the calendar and look. Called
// once at game start and every 60s after (see _startGameInner()/setInterval above) — "once per real
// day, not once per frame" like the lastBirthdayGiftDate idiom this is modeled on (see
// applySeasonEffects() above) — but the actual once-only gate here is per-reminder (r.notified),
// not one shared last-checked date: a reminder can be freshly added for TODAY mid-session (see
// addCalendarReminder() above), after any shared daily gate would have already tripped, and a
// shared gate would then silently never fire it. r.notified flips true and persists the moment it
// fires, so a reload never re-notifies, and the reminder deliberately stays in calendarReminders
// afterward (shown as history in the grid/upcoming list, see openCalendar()) instead of
// auto-deleting itself.
function checkCalendarReminders() {
  if(!currentUser) return;
  const now = new Date();
  const todayStr = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  const due = calendarReminders.filter(r => r && r.date === todayStr && !r.notified);
  if(due.length) {
    due.forEach((r,i) => {
      r.notified = true;
      setTimeout(() => showNotif('📌 Reminder: ' + r.text), 600*(i+1));
    });
    saveCurrentUser();
  }
}

