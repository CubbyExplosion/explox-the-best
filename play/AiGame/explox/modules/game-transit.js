// ─── HOTEL SYSTEM ─────────────────────────────────────────────────────────────
function openHotel() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('hotelSip').textContent = sipDollars.toLocaleString();
  document.getElementById('hotelModal').style.display = 'flex';
}
function closeHotel() {
  document.getElementById('hotelModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ─── AIRPORT ────────────────────────────────────────────────────────────────
// `flights` defaults to the Downtown airport's own destination list — passing a different real
// array (see openCountryAirport below) lets ANY airport, anywhere, sell real tickets through the
// exact same modal/booking/flight-animation code, with zero duplication.
let ACTIVE_FLIGHTS = AIRPORT_FLIGHTS;
const CAR_BRING_FEE = 50; // flat extra fee to bring your (first-owned) car along on any flight
function openAirport(flights) {
  ACTIVE_FLIGHTS = flights || AIRPORT_FLIGHTS;
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('airportSip').textContent = sipDollars.toLocaleString();
  const bringRow = document.getElementById('airportBringCarRow');
  bringRow.style.display = ownedCars.length ? 'block' : 'none';
  document.getElementById('airportBringCarFee').textContent = CAR_BRING_FEE;
  document.getElementById('airportBringCar').checked = false;
  const mealSelect = document.getElementById('airportMealSelect');
  mealSelect.innerHTML = FLIGHT_MEALS.map(m => `<option value="${m.id}">${m.emoji} ${m.name}</option>`).join('');
  mealSelect.value = 'chicken'; // default to an actual meal, not "no meal" — matches "you have to preorder" intent
  const list = document.getElementById('airportFlightList');
  list.innerHTML = '';
  ACTIVE_FLIGHTS.forEach((f, i) => {
    const canAfford = sipDollars >= f.price;
    const card = document.createElement('div');
    card.onclick = () => buyFlight(i);
    card.style.cssText = `background:#050e1a;border:2px solid ${canAfford?'#2255aa55':'#1a1a1a'};border-radius:10px;padding:12px 14px;cursor:${canAfford?'pointer':'not-allowed'};display:flex;align-items:center;gap:12px;opacity:${canAfford?1:0.5};transition:border-color 0.2s;`;
    if(canAfford){ card.onmouseover=()=>card.style.borderColor='#4488cc'; card.onmouseout=()=>card.style.borderColor='#2255aa55'; }
    card.innerHTML = `<span style="font-size:26px">${f.emoji}</span><div style="flex:1"><div style="color:#ddeeff;font-weight:bold;font-size:13px">${f.name}</div><div style="color:#334466;font-size:10px;margin-top:2px">${f.desc}</div></div><div style="color:#88ccff;font-weight:bold;font-size:15px;white-space:nowrap">${f.price} S.I.P.</div>`;
    list.appendChild(card);
  });
  document.getElementById('airportModal').style.display = 'flex';
}
function closeAirport() {
  document.getElementById('airportModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function buyFlight(idx) {
  const flight = ACTIVE_FLIGHTS[idx];
  const bringCar = ownedCars.length>0 && document.getElementById('airportBringCar').checked;
  const mealId = document.getElementById('airportMealSelect').value;
  const meal = FLIGHT_MEALS.find(m => m.id === mealId) || FLIGHT_MEALS[0];
  const total = flight.price + (bringCar ? CAR_BRING_FEE : 0);
  if(sipDollars < total) { showNotif(`❌ Need ${total} S.I.P. for this flight${bringCar?' (with your car)':''}!`); sfx.nope&&sfx.nope(); return; }
  spendSip(total); saveCurrentUser(); updateSIP();
  document.getElementById('airportModal').style.display = 'none';
  sfx.earn&&sfx.earn();
  startFlightAnim(flight, bringCar, meal);
}
// Every country now has its own real airport (item 154) — connects to the other 7 countries at a
// real discounted connector fare, plus a real flight straight back to Downtown, all through the
// exact same openAirport()/buyFlight()/startFlightAnim() the City Airport already uses.
function openCountryAirport(originName) {
  const flights = AIRPORT_FLIGHTS
    .filter(f => f.name !== originName)
    .map(f => ({ ...f, price: Math.max(20, Math.round(f.price*0.6)) }));
  // Real Downtown Airport door spot (matches enterAirportLounge('Downtown Explox', -200, -160, true)
  // below) — was off by 5 units before; harmless by luck (still outside the airport's own collider)
  // but now landing-by-plane and walking-out-the-door agree on the exact same real spot.
  flights.push({ name:'Downtown Explox', emoji:'🏠', desc:'Back to the city', price:30, x:-200, z:-160 });
  openAirport(flights);
}
// Real "normal airplane stuff" during the flight — a preordered meal (picked at booking, not
// during the flight — matches how real airlines work) and a seatback entertainment screen, not
// just a passive progress bar. Single shared state since only one flight can be active at a time
// (same pattern as _eatBusy/_iceCreamBusy above).
const FLIGHT_MEALS = [
  { id:'none',    emoji:'🚫', name:'No meal, thanks',  taste:null     },
  { id:'chicken', emoji:'🍗', name:'Chicken & Rice',   taste:'savory' },
  { id:'pasta',   emoji:'🍝', name:'Pasta Primavera',  taste:'savory' },
  { id:'veggie',  emoji:'🌯', name:'Veggie Wrap',      taste:'savory' },
  { id:'fish',    emoji:'🐟', name:'Fish & Rice',      taste:'savory' },
  { id:'kids',    emoji:'🧃', name:'Kids Snack Box',   taste:'sweet'  },
];
let flightShowingScreen = false, flightSceneKey = null, flightMeal = FLIGHT_MEALS[0], flightMealAvailable = false, flightMealServed = false, flightLandingWarned = false;
function serveFlightMeal() {
  if (!flightMealAvailable || flightMealServed || flightMeal.id === 'none') return;
  flightMealServed = true;
  eatFood(flightMeal.emoji, flightMeal.name, flightMeal.taste); // real eat animation + taste reaction, same system the Diner/Lounge use
  const btn = document.getElementById('flightSnackBtn');
  if (btn) { btn.textContent = `✅ Enjoyed your ${flightMeal.name}!`; btn.disabled = true; btn.style.cursor = 'default'; btn.style.color = '#66aa77'; btn.style.borderColor = '#335533'; }
}
function toggleFlightScreen() {
  flightShowingScreen = !flightShowingScreen;
  const btn = document.getElementById('flightScreenBtn');
  if (btn) btn.textContent = flightShowingScreen ? '🪟 Window View' : '📺 Watch Show';
}
function startFlightAnim(dest, bringCar, meal) {
  const overlay = document.getElementById('flightOverlay');
  overlay.style.display = 'block';
  document.getElementById('flightDestName').textContent = `${dest.emoji} ${dest.name}`;
  document.getElementById('flightDestDesc').textContent = dest.desc;

  // Reset the real in-flight service state for this flight
  flightShowingScreen = false; flightMealAvailable = false; flightMealServed = false; flightLandingWarned = false;
  flightMeal = meal || FLIGHT_MEALS[0];
  const sceneKeys = Object.keys(SCENE_LIBRARY);
  flightSceneKey = sceneKeys[Math.floor(Math.random()*sceneKeys.length)]; // reuses the SAME cartoon scenes Cinema/ExploxTube already draw — no new art system
  const screenBtn = document.getElementById('flightScreenBtn');
  if (screenBtn) screenBtn.textContent = '📺 Watch Show';
  const snackBtn = document.getElementById('flightSnackBtn');
  if (snackBtn) {
    snackBtn.disabled = true; snackBtn.style.cursor = 'not-allowed'; snackBtn.style.color = '#556677'; snackBtn.style.borderColor = '#334455';
    snackBtn.textContent = flightMeal.id === 'none' ? "🚫 You didn't preorder a meal" : `🍽️ ${flightMeal.name} is coming...`;
  }
  showNotif('🔔 Seatbelt sign is on — buckle up for takeoff!');

  const canvas = document.getElementById('flightWindowCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 700;
  canvas.height = canvas.offsetHeight || 280;

  // Deterministic clouds — no Math.random() so no flicker
  const clouds = Array.from({length:22}, (_,i) => {
    const s = i * 137.508;
    return { x: i*190+(s*0.4321%1)*100, y: 15+(s*0.3333%1)*90, r: 28+(s*0.2222%1)*45 };
  });
  const TOTAL_W = 22 * 190;
  // was a flat 12000 for every flight — user's own ask for the deep-space destinations ("farther
  // longer and more expensive") made a real per-flight duration worth doing everywhere, not just
  // space: dest.duration is set on SPACE_FLIGHTS entries, undefined on the regular AIRPORT_FLIGHTS
  // ones (which keep the original 12s).
  const DURATION = dest.duration || 12000;
  const t0 = performance.now();
  let animId = null;

  function draw() {
    const W = canvas.width, H = canvas.height;
    const elapsed = performance.now() - t0;
    const prog = Math.min(elapsed / DURATION, 1);

    if (flightShowingScreen) {
      // In-flight entertainment — the real same SCENE_LIBRARY draw functions Cinema/ExploxTube use
      SCENE_LIBRARY[flightSceneKey](ctx, W, H, elapsed/1000);
    } else {
      const camX = prog * TOTAL_W * 0.55;

      // Sky gradient
      const skyG = ctx.createLinearGradient(0,0,0,H);
      skyG.addColorStop(0, `hsl(${210+prog*20},70%,${55-prog*15}%)`);
      skyG.addColorStop(0.7, `hsl(${200+prog*30},60%,${45-prog*15}%)`);
      skyG.addColorStop(1, `hsl(${190+prog*40},50%,${35-prog*10}%)`);
      ctx.fillStyle = skyG; ctx.fillRect(0,0,W,H);

      // Tiny ground strip far below
      ctx.fillStyle = '#1a3a0a'; ctx.fillRect(0, H*0.85, W, H*0.15);
      ctx.fillStyle = '#0d1f05'; ctx.fillRect(0, H*0.88, W, H*0.04);

      // Scrolling clouds
      clouds.forEach(c => {
        const cx = ((c.x - camX) % TOTAL_W + TOTAL_W) % TOTAL_W;
        if(cx > W + c.r*2) return;
        ctx.fillStyle = `rgba(255,255,255,${0.72+prog*0.1})`;
        ctx.beginPath();
        ctx.arc(cx,           c.y,          c.r*0.75, 0, Math.PI*2);
        ctx.arc(cx+c.r*0.55,  c.y-c.r*0.25, c.r*0.55, 0, Math.PI*2);
        ctx.arc(cx-c.r*0.45,  c.y+c.r*0.1,  c.r*0.45, 0, Math.PI*2);
        ctx.fill();
      });

      // Wing visible through window
      ctx.fillStyle = '#b8ccdd';
      ctx.beginPath();
      ctx.moveTo(W*0.22, H*0.83); ctx.lineTo(W*0.78, H*0.79);
      ctx.lineTo(W*0.82, H); ctx.lineTo(W*0.18, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7a8fa0';
      ctx.fillRect(W*0.54, H*0.81, W*0.13, H*0.04);
      ctx.fillRect(W*0.56, H*0.79, W*0.09, H*0.025);
    }

    // Flight progress bar
    document.getElementById('flightProgressBar').style.width = (prog*100)+'%';

    // Meal cart reaches you partway through the flight — real one-time state flip, not cosmetic
    if (!flightMealAvailable && prog >= 0.3) {
      flightMealAvailable = true;
      const btn = document.getElementById('flightSnackBtn');
      if (btn && flightMeal.id !== 'none') { btn.disabled = false; btn.textContent = `🍽️ Enjoy your ${flightMeal.name}`; btn.style.cursor = 'pointer'; btn.style.color = '#88ccff'; btn.style.borderColor = '#2a4a7a'; }
    }
    // Seatbelt sign back on for landing — a real flavor moment tied to actual flight progress
    if (!flightLandingWarned && prog >= 0.85) {
      flightLandingWarned = true;
      showNotif('🔔 Prepare for landing — seatbelt sign is back on!');
    }

    if(prog < 1) {
      animId = requestAnimationFrame(draw);
    } else {
      setTimeout(() => {
        overlay.style.display = 'none';
        playerGroup.position.set(dest.x, 0, dest.z);
        yaw = Math.PI;
        // Snap camera instantly — skip lerp by setting position directly
        const snapX = dest.x - Math.sin(yaw) * 9;
        const snapZ = dest.z - Math.cos(yaw) * 9;
        camera.position.set(snapX, 4, snapZ);
        if (bringCar) {
          carLocation = dest.name;
          saveCurrentUser();
          spawnOwnedCars();
          showNotif(`✈️ Welcome to ${dest.name}! Your car came with you — look for it parked nearby!`);
        } else {
          showNotif(`✈️ Welcome to ${dest.name}! Enjoy your visit!`);
        }
        if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
      }, 400);
    }
  }

  animId = requestAnimationFrame(draw);
  setTimeout(() => { if(overlay.style.display!=='none'){ cancelAnimationFrame(animId); overlay.style.display='none'; } }, DURATION + 4500); // real safety net, kept comfortably past DURATION so it never fires during a normal flight
}
function bookRoom(type) {
  const prices = { budget:40, standard:80, luxury:200 };
  const price = prices[type];
  if(sipDollars < price) { showNotif(`❌ Need ${price} S.I.P. to book this room!`); return; }
  spendSip(price); saveCurrentUser(); updateSIP();
  document.getElementById('hotelModal').style.display = 'none';
  inHotel = true;
  currentHotelRoom = type;
  const roomX = type==='luxury' ? HOTEL_SPAWN.x+60 : type==='standard' ? HOTEL_SPAWN.x+30 : HOTEL_SPAWN.x;
  playerGroup.position.set(roomX, 0, 0);
  yaw = Math.PI;
  camera.position.set(roomX, 4, 9); // snap camera — no lerp glide
  const label = type==='luxury'?'👑 Luxury Suite':type==='standard'?'✨ Standard Room':'🛏️ Budget Room';
  showNotif(`🏨 Welcome! Enjoy your ${label}!`);
  sfx.earn();
}
function checkoutHotel() {
  inHotel = false; currentHotelRoom = null;
  const cx = HOTEL_CITY_POS.x, cz = HOTEL_CITY_POS.z + 12;
  playerGroup.position.set(cx, 0, cz);
  yaw = Math.PI;
  camera.position.set(cx, 4, cz - 9); // snap camera outside hotel
  showNotif('🏨 Thanks for staying at City Hotel! Come back soon!');
}
function sleepInHotel() {
  restoreTiredness();
  if (hunger <= 0) { sleepWhileStarving(); return; }
  const wasSick = sick;
  if (sick) { sick = false; updateSickHud(); }
  const msgs = wasSick ? ["😴 You slept it off — feeling much better now!"] : [
    '😴 You slept for 8 hours. Feel completely rested!',
    '💤 Dreamed about SIP coins falling from the sky!',
    '🌙 Best sleep ever. The pillow was ultra fluffy!',
    '😪 You woke up feeling like a million SIP!',
  ];
  showNotif(msgs[Math.floor(Date.now()/1000) % msgs.length]);
  sfx.earn();
}
// Shared by sleepAtHome()/sleepInHotel() — starving through the night is a real bad night's
// sleep, not the usual full heal: you wake up having lost health instead of recovering it, with
// a real nudge that food (not more sleep) is what actually fixes this.
function sleepWhileStarving() {
  const lost = Math.min(playerHealth, Math.round(playerMaxHealth * 0.15));
  playerHealth = Math.max(1, playerHealth - lost); // starving in your sleep is dangerous, not fatal on its own
  updateHealthBar();
  showNotif(`😫 You tossed and turned all night, starving. Woke up ${lost} HP worse off — go eat something!`);
  sfx.nope();
}
function watchHotelTV() {
  const channels = [
    '📺 Explox City News: "SIP Market hits all-time high!"',
    '📺 Cooking Show: Chef makes a 5-star meal from city ingredients.',
    '📺 Car Races: Speed Racer wins the championship!',
    '📺 Weather Channel: Sunny skies over Explox City all week.',
    '📺 Documentary: The History of S.I.P. Currency.',
  ];
  showNotif(channels[Math.floor(Date.now()/1000) % channels.length]);
}

// ─── S.I.T.S. — SUPER IMPORTANT TRANSIT SYSTEM ────────────────────────────────
const SITS_ROUTES = [
  { id:'red',    name:'Red Line',    emoji:'🔴', tagline:'Uptown Express',    fare:2,
    stops:[
      { name:'City Bank',        x:160, z:210,  emoji:'🏦' },
      { name:'Your House',       x:-30, z:-107, emoji:'🏠' },
      { name:'Shady Dealer',     x:34,  z:3,    emoji:'🕴️' },
    ]},
  { id:'blue',   name:'Blue Line',   emoji:'🔵', tagline:'Downtown Metro',    fare:3,
    stops:[
      { name:'Shopping Street',  x:60,  z:50,   emoji:'🛍️' },
      { name:'Pizza Restaurant', x:20,  z:80,   emoji:'🍕' },
      { name:'City Mall',        x:80,  z:-20,  emoji:'🏬' },
    ]},
  { id:'green',  name:'Green Line',  emoji:'🟢', tagline:'Eastside Route',    fare:2,
    stops:[
      { name:'Police Station',   x:-70, z:10,   emoji:'🚔' },
      { name:'Transit Hub',      x:0,   z:50,   emoji:'🚇' },
      { name:'City Bank',        x:160, z:210,  emoji:'🏦' },
    ]},
  { id:'yellow', name:'Yellow Line', emoji:'🟡', tagline:'Westside Loop',     fare:4,
    stops:[
      { name:'Black Market',     x:-80, z:-71,  emoji:'⚫' },
      { name:'Police Station',   x:-70, z:10,   emoji:'🚔' },
      { name:'City Mall',        x:80,  z:-20,  emoji:'🏬' },
    ]},
  { id:'purple', name:'Purple Line', emoji:'🟣', tagline:'Cinema Express',    fare:3,
    stops:[
      { name:'Movie Theater',    x:50,  z:-85,  emoji:'🎬' },
      { name:'Shopping Street',  x:60,  z:50,   emoji:'🛍️' },
      { name:'Your House',       x:-30, z:-107, emoji:'🏠' },
    ]},
];

function openSITS() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('sitsSip').textContent = sipDollars.toLocaleString();
  const modal = document.getElementById('sitsModal');
  modal.style.display = 'block';
  _drawSITSMap();
  _buildSITSRoutes();
}

function closeSITS() {
  document.getElementById('sitsModal').style.display = 'none';
  document.getElementById('gameCanvas').requestPointerLock();
}

function buySITSTicket(routeId, stop) {
  const route = SITS_ROUTES.find(r => r.id === routeId);
  if(!route) return;
  if(sipDollars < route.fare) { showNotif(`❌ Need ${route.fare} S.I.P. for a ticket!`); return; }
  spendSip(route.fare);
  saveCurrentUser();
  updateSIP();
  closeSITS();
  startBusRide(route, stop);
}

function startBusRide(route, destStop) {
  const LINE_COLORS = {red:'#ff4444',blue:'#4488ff',green:'#44cc44',yellow:'#ffcc00',purple:'#cc44ff'};
  const col = LINE_COLORS[route.id] || '#ffcc00';

  const overlay = document.getElementById('busRideOverlay');
  overlay.style.display = 'block';
  document.getElementById('busRouteBadge').innerHTML = `🚌 ${route.name.toUpperCase()} <span style="color:${col}">●</span>`;

  // Only visit stops up to and including the destination
  const destIdx = route.stops.findIndex(s => s.name === destStop.name);
  const stopsToVisit = route.stops.slice(0, destIdx + 1);

  // Build stops bar
  const stopsBar = document.getElementById('busStopsBar');
  stopsBar.innerHTML = '';
  stopsToVisit.forEach((s, i) => {
    if(i > 0) {
      const ln = document.createElement('div');
      ln.style.cssText = `flex:1;height:3px;background:${col}33;margin:0 4px;border-radius:2px;`;
      ln.id = `busLine_${i}`;
      stopsBar.appendChild(ln);
    }
    const dot = document.createElement('div');
    dot.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;min-width:54px;';
    dot.innerHTML = `<div id="busDot_${i}" style="width:14px;height:14px;border-radius:50%;background:#222;border:2px solid #333;transition:all 0.4s;"></div><div id="busLabel_${i}" style="color:#444;font-size:9px;text-align:center;max-width:54px;line-height:1.2;">${s.emoji}<br>${s.name}</div>`;
    stopsBar.appendChild(dot);
  });

  // Set up canvas
  const canvas = document.getElementById('busWindowCanvas');
  const ctx = canvas.getContext('2d');
  const setSize = () => { canvas.width = canvas.offsetWidth || 700; canvas.height = canvas.offsetHeight || 280; };
  setSize();

  // Pre-generate buildings (no Math.random in draw loop = no flicker)
  const BLD_COUNT = 60, BLD_GAP = 160;
  const buildings = Array.from({length: BLD_COUNT}, (_, i) => {
    const s = i * 137.508;
    const w = 40 + (s * 0.6180339 % 1) * 80;
    const h = 50 + (s * 0.3819660 % 1) * 140;
    const hue = 200 + (s * 0.1231 % 1) * 50;
    const wins = [];
    for(let wy = 10; wy < h - 20; wy += 18)
      for(let wx = 8; wx < w - 10; wx += 14)
        if((i * 17 + Math.floor(wy) * 7 + Math.floor(wx) * 3) % 10 > 3)
          wins.push([wx, wy]);
    return { x: i * BLD_GAP + (s * 0.5312 % 1) * 80, w, h, hue, wins };
  });
  const TOTAL_W = BLD_COUNT * BLD_GAP;

  let camX = 0, animId = null;

  function draw() {
    const W = canvas.width, H = canvas.height;
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
    sky.addColorStop(0, '#04030f'); sky.addColorStop(1, '#0c0820');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // Ground
    ctx.fillStyle = '#080808'; ctx.fillRect(0, H * 0.62, W, H);
    ctx.fillStyle = '#161616'; ctx.fillRect(0, H * 0.64, W, 2);
    // Road dashes
    ctx.fillStyle = '#1e1e1e';
    for(let i = 0; i < 14; i++) {
      const rx = ((i * 160 - camX * 0.15) % (W + 200) + W + 200) % (W + 200) - 100;
      ctx.fillRect(rx, H * 0.8, 70, 3);
    }
    // Buildings
    buildings.forEach(b => {
      const bx = ((b.x - camX % TOTAL_W) % TOTAL_W + TOTAL_W) % TOTAL_W;
      if(bx < W + b.w) {
        const by = H * 0.62 - b.h;
        ctx.fillStyle = `hsl(${b.hue},18%,9%)`; ctx.fillRect(bx, by, b.w, b.h);
        ctx.fillStyle = 'rgba(255,200,80,0.22)';
        b.wins.forEach(([wx, wy]) => ctx.fillRect(bx + wx, by + wy, 8, 10));
      }
    });
    // Vignette
    const vig = ctx.createRadialGradient(W/2, H/2, H * 0.15, W/2, H/2, H * 0.75);
    vig.addColorStop(0, 'transparent'); vig.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  function loop() { camX = (camX + 14) % TOTAL_W; draw(); animId = requestAnimationFrame(loop); }
  animId = requestAnimationFrame(loop);

  // Announce stops one by one
  function showStop(i) {
    const stop = stopsToVisit[i];
    const isLast = i === stopsToVisit.length - 1;
    document.getElementById('busNextStop').textContent = isLast ? '🛑 NOW ARRIVING' : '⏩ NEXT STOP';
    document.getElementById('busStopName').textContent = `${stop.emoji} ${stop.name}`;
    // Light up dot + line
    const dot = document.getElementById(`busDot_${i}`);
    if(dot) { dot.style.background = col; dot.style.borderColor = col; dot.style.boxShadow = `0 0 8px ${col}`; }
    const lbl = document.getElementById(`busLabel_${i}`);
    if(lbl) lbl.style.color = '#fff';
    if(i > 0) { const ln = document.getElementById(`busLine_${i}`); if(ln) ln.style.background = col; }

    setTimeout(() => {
      if(isLast) {
        cancelAnimationFrame(animId);
        overlay.style.display = 'none';
        playerGroup.position.set(stop.x, 0, stop.z);
        yaw = 0;
        showNotif(`🚌 Arrived at ${stop.emoji} ${stop.name}!`);
        sfx.earn();
      } else {
        showStop(i + 1);
      }
    }, isLast ? 2200 : 1800);
  }

  setTimeout(() => showStop(0), 400);
}

function _buildSITSRoutes() {
  const LINE_COLORS = {red:'#ff4444',blue:'#4488ff',green:'#44cc44',yellow:'#ffcc00',purple:'#cc44ff'};
  const container = document.getElementById('sitsRoutes');
  container.innerHTML = '';
  SITS_ROUTES.forEach(route => {
    const col = LINE_COLORS[route.id];
    const card = document.createElement('div');
    card.style.cssText = `background:#111820;border:2px solid ${col}44;border-radius:14px;margin-bottom:14px;overflow:hidden;`;
    // Route header
    const hdr = document.createElement('div');
    hdr.style.cssText = `background:${col}22;padding:12px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid ${col}33;`;
    hdr.innerHTML = `<span style="font-size:22px;">${route.emoji}</span><div><div style="color:${col};font-weight:bold;font-size:14px;">${route.name} — ${route.tagline}</div><div style="color:#888;font-size:11px;">🎟️ ${route.fare} S.I.P. per ride</div></div>`;
    card.appendChild(hdr);
    // Stops
    const stopRow = document.createElement('div');
    stopRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px;';
    route.stops.forEach(stop => {
      const btn = document.createElement('button');
      btn.style.cssText = `background:#0d1420;border:2px solid ${col}55;color:#ddd;border-radius:10px;padding:8px 14px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:6px;transition:background 0.2s;`;
      btn.innerHTML = `<span style="font-size:18px;">${stop.emoji}</span><span>${stop.name}</span><span style="color:${col};font-weight:bold;margin-left:4px;">🎟️ ${route.fare}</span>`;
      btn.onmouseenter = () => btn.style.background = `${col}22`;
      btn.onmouseleave = () => btn.style.background = '#0d1420';
      btn.onclick = () => buySITSTicket(route.id, stop);
      stopRow.appendChild(btn);
    });
    card.appendChild(stopRow);
    container.appendChild(card);
  });
}

function _drawSITSMap() {
  const canvas = document.getElementById('sitsMap');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);
  // Dark map background
  ctx.fillStyle = '#0d1420'; ctx.fillRect(0,0,W,H);
  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
  for(let i=0;i<W;i+=40){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke();}
  for(let i=0;i<H;i+=40){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(W,i);ctx.stroke();}
  // World → canvas mapping (world range ~-100 to 100 → canvas)
  const mx = x => (x + 100) / 200 * W;
  const mz = z => (z + 120) / 240 * H;
  const LINE_COLORS = {red:'#ff4444',blue:'#4488ff',green:'#44cc44',yellow:'#ffcc00',purple:'#cc44ff'};
  // Draw route lines
  SITS_ROUTES.forEach(route => {
    const col = LINE_COLORS[route.id];
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([8,4]); ctx.globalAlpha = 0.7;
    ctx.beginPath();
    route.stops.forEach((s,i) => { if(i===0) ctx.moveTo(mx(s.x),mz(s.z)); else ctx.lineTo(mx(s.x),mz(s.z)); });
    ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    // Stop dots
    route.stops.forEach(s => {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(mx(s.x),mz(s.z),5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(mx(s.x),mz(s.z),2,0,Math.PI*2); ctx.fill();
    });
  });
  // YOU ARE HERE dot
  const px = mx(playerGroup ? playerGroup.position.x : 0);
  const pz = mz(playerGroup ? playerGroup.position.z : -40);
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px,pz,7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(px,pz,4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
  ctx.fillText('YOU', px, pz-11);
  // Legend label
  ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'left';
  ctx.fillText('S.I.T.S. NETWORK MAP', 8, 16);
}

// ─── CAB — user's own ask: "make a cab tab on the right 10 options some are for multiple
// peaple", then a real follow-up: "the cab can go any where in the timing as any driver". Two
// real fixes from that second message: (1) go ANYWHERE — built off LOC_ZONES (game-zones.js),
// the game's own full list of every real named place, not a hand-picked 10; (2) real elapsed
// drive TIME scaled by actual distance from wherever you're standing right now, like a real
// driver would take, instead of an instant teleport. Fare is distance-based too for the same
// reason — a real driver charges more for a longer trip, which also naturally keeps a cab to
// another COUNTRY pricier than just booking a flight at the Airport, without hard-blocking it.
// Every destination can now bring along up to 3 befriended neighbors (the same `friends` array
// befriendNeighbor() in game-district.js builds) for a real per-seat fare — they really show up
// standing next to you at the destination via buildResidentFigure(), the same figure the House
// Guest system already uses for "someone's really here", not just a notification.
//
// NOTE: game-transit.js loads BEFORE game-zones.js (see the <script> order in EXPLOX.html), so
// LOC_ZONES doesn't exist yet at THIS file's top-level parse time — getCabDestinations() below
// builds the list lazily, only once the game is actually running and every script has loaded.
const CAB_EMOJI = {
  'City Mall':'🏬', 'Westside Galleria':'🛍️', 'Uptown Plaza':'🏙️', 'Police Station':'🚔',
  'Restaurant Row':'🍽️', 'The Park':'🌳', 'Shopping Street':'🛒', 'Your House':'🏠',
  'Whispering Woods':'🌲', 'Sunset Plains':'🏞️', 'The Scrapyard':'🔩', 'Fight Arena':'🥊',
  'The Dump':'🗑️', 'City Hall':'🏛️', 'Hospital':'🏥', 'School':'🏫', 'Apartments':'🏢',
  'City Bank':'🏦', 'Movie Theater':'🎬', 'Transit Hub':'🚇', 'City Hotel':'🏨',
  'Car Dealership':'🚗', 'Computer Shop':'🖥️', 'City Airport':'✈️', 'The Diner':'🍔',
  'Your Store':'🏪', 'Japan':'🌸', 'France':'🗼', 'Brazil':'🌴', 'Egypt':'🏛️', 'UK':'🎡',
  'Australia':'🦘', 'Canada':'🍁', 'Italy':'🍕', 'Space Station':'🚀',
};
const CAB_BASE_FARE = 4;
const CAB_FARE_PER_1000_UNITS = 6; // scales fare with real distance — a long haul costs real money
const CAB_COUNTRY_SURCHARGE = 60;  // countries/space sit ~8000 units out on their own ring — this
// keeps a cab there noticeably pricier than the Airport's 70-150 flat fare (real driver, not a
// budget flight), without hard-blocking the trip.
const CAB_COUNTRIES = new Set(['Japan','France','Brazil','Egypt','UK','Australia','Canada','Italy','Space Station']);
function cabFareFor(dist, name) {
  const base = CAB_BASE_FARE + Math.round(dist / 1000 * CAB_FARE_PER_1000_UNITS);
  return CAB_COUNTRIES.has(name) ? base + CAB_COUNTRY_SURCHARGE : base;
}
function getCabDestinations() {
  const px = playerGroup.position.x, pz = playerGroup.position.z;
  return LOC_ZONES.map(z => {
    const dist = Math.hypot(px - z.x, pz - z.z);
    return { name: z.name, x: z.x, z: z.z, emoji: CAB_EMOJI[z.name] || '📍', dist, fare: cabFareFor(dist, z.name) };
  });
}
const CAB_FRIEND_FARE = 5; // extra S.I.P. per friend brought along
const CAB_MAX_FRIENDS = 3;
const CAB_SPEED = 60; // world units/sec a cab "drives" — sets how long a real trip there takes
function cabRideDuration(dist) { return Math.max(2000, Math.min(20000, (dist / CAB_SPEED) * 1000)); }
let cabSelectedFriends = {}; // destination name -> Set of friend names currently picked
let cabCompanionMeshes = []; // "came along" figures standing at your last cab dropoff
// The full-screen cabRideOverlay physically blocks clicking a new ride mid-drive in real play,
// but this token still guards startCabRide() against ever running two draw() loops at once (e.g.
// a stale one somehow left alive) stomping on each other's writes to the same shared DOM/progress
// bar — a stale loop just checks this and quietly stops instead of racing the current ride.
let cabRideToken = 0;

function toggleCabPanel() {
  const panel = document.getElementById('cabPanel');
  if (panel.style.display === 'none') {
    if (document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    renderCabPanel();
    panel.style.display = 'flex';
    document.getElementById('cabTab').style.display = 'none';
  } else { closeCabPanel(); }
}
function closeCabPanel() {
  document.getElementById('cabPanel').style.display = 'none';
  document.getElementById('cabTab').style.display = 'block';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function toggleCabFriend(destName, friendName) {
  if (!cabSelectedFriends[destName]) cabSelectedFriends[destName] = new Set();
  const set = cabSelectedFriends[destName];
  if (set.has(friendName)) set.delete(friendName);
  else if (set.size < CAB_MAX_FRIENDS) set.add(friendName);
  renderCabPanel();
}
function renderCabPanel() {
  const list = document.getElementById('cabList');
  list.innerHTML = getCabDestinations().map(d => {
    const picked = cabSelectedFriends[d.name] || new Set();
    const total = d.fare + picked.size * CAB_FRIEND_FARE;
    const canAfford = sipDollars >= total;
    let friendPickerHtml;
    if (friends.length === 0) {
      friendPickerHtml = `<div style="color:#666;font-size:9px;margin:6px 0;">Make a friend first to bring one along!</div>`;
    } else {
      friendPickerHtml = `<div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0;">${friends.map(f => {
        const isOn = picked.has(f);
        const safeF = f.replace(/'/g, "\\'");
        return `<button onclick="toggleCabFriend('${d.name}','${safeF}')" style="padding:4px 8px;border-radius:6px;font-size:9px;cursor:pointer;border:1px solid ${isOn?'#ffcc00':'#333'};background:${isOn?'#ffcc0033':'#111'};color:${isOn?'#ffcc00':'#999'};">${isOn?'✓ ':''}${f}</button>`;
      }).join('')}</div>`;
    }
    const etaSec = Math.round(cabRideDuration(d.dist) / 1000);
    return `<div style="background:rgba(255,255,255,0.05);border:2px solid #333;border-radius:10px;padding:10px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="color:#fff;font-size:12px;font-weight:bold;">${d.emoji} ${d.name}</div>
        <span style="color:#888;font-size:9px;">🕐 ~${etaSec}s</span>
      </div>
      ${friendPickerHtml}
      <button onclick="takeCab('${d.name}')" ${canAfford?'':'disabled'} style="width:100%;margin-top:6px;padding:7px;background:${canAfford?'#2a7a2a':'#333'};border:none;border-radius:6px;color:#fff;font-size:11px;font-weight:bold;cursor:${canAfford?'pointer':'not-allowed'};">🚕 Go — ${total} S.I.P.${picked.size?` (${picked.size} friend${picked.size===1?'':'s'})`:''}</button>
    </div>`;
  }).join('');
}
function takeCab(destName) {
  const d = getCabDestinations().find(x => x.name === destName);
  if (!d) return;
  const picked = Array.from(cabSelectedFriends[destName] || []);
  const total = d.fare + picked.length * CAB_FRIEND_FARE;
  if (sipDollars < total) { showNotif(`❌ Need ${total} S.I.P. for this ride!`); return; }
  spendSip(total); saveCurrentUser(); updateSIP();
  cabSelectedFriends[destName] = new Set();
  closeCabPanel();
  startCabRide(d, picked);
}
function startCabRide(dest, pickedFriends) {
  const myToken = ++cabRideToken; // stale draw()/timeout calls from an earlier ride check this and bail
  const overlay = document.getElementById('cabRideOverlay');
  overlay.style.display = 'block';
  document.getElementById('cabRideDest').textContent = `${dest.emoji} ${dest.name}`;
  const DURATION = cabRideDuration(dest.dist);
  const canvas = document.getElementById('cabRideCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 700;
  canvas.height = canvas.offsetHeight || 400;

  // Deterministic scrolling buildings — no Math.random in the draw loop, so no flicker.
  const BLD_COUNT = 30, BLD_GAP = 140;
  const bldgs = Array.from({ length: BLD_COUNT }, (_, i) => {
    const s = i * 137.508;
    return { x: i * BLD_GAP + (s * 0.4321 % 1) * 60, w: 30 + (s * 0.31 % 1) * 50, h: 60 + (s * 0.53 % 1) * 140, hue: 40 + (s * 0.21 % 1) * 20 };
  });
  const TOTAL_W = BLD_COUNT * BLD_GAP;
  const t0 = performance.now();
  let animId = null;

  function draw() {
    if (myToken !== cabRideToken) return; // a newer ride took over — this loop stops touching shared DOM
    const W = canvas.width, H = canvas.height;
    const elapsed = performance.now() - t0;
    const prog = Math.min(elapsed / DURATION, 1);
    ctx.fillStyle = '#0f0d05'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1a1608'; ctx.fillRect(0, H * 0.6, W, H * 0.4);
    const camX = prog * TOTAL_W * 0.7;
    bldgs.forEach(b => {
      const bx = ((b.x - camX) % TOTAL_W + TOTAL_W) % TOTAL_W;
      if (bx < W + b.w) { ctx.fillStyle = `hsl(${b.hue},30%,15%)`; ctx.fillRect(bx, H * 0.6 - b.h, b.w, b.h); }
    });
    ctx.strokeStyle = '#443311'; ctx.lineWidth = 3; ctx.setLineDash([20, 15]);
    ctx.beginPath(); ctx.moveTo(0, H * 0.8); ctx.lineTo(W, H * 0.8); ctx.stroke(); ctx.setLineDash([]);

    document.getElementById('cabRideProgressBar').style.width = (prog * 100) + '%';
    const secsLeft = Math.max(0, Math.ceil((DURATION - elapsed) / 1000));
    document.getElementById('cabRideEta').textContent = prog < 1 ? `${secsLeft}s left` : 'Arriving!';

    if (prog < 1) { animId = requestAnimationFrame(draw); }
    else { setTimeout(() => { if (myToken === cabRideToken) finishCabRide(dest, pickedFriends); }, 300); }
  }
  animId = requestAnimationFrame(draw);
  setTimeout(() => { if (myToken === cabRideToken && overlay.style.display !== 'none') { cancelAnimationFrame(animId); finishCabRide(dest, pickedFriends); } }, DURATION + 4000); // real safety net, same pattern startFlightAnim() uses
}
function finishCabRide(dest, pickedFriends) {
  document.getElementById('cabRideOverlay').style.display = 'none';
  cabCompanionMeshes.forEach(m => scene.remove(m));
  cabCompanionMeshes = [];
  playerGroup.position.set(dest.x, 0, dest.z);
  yaw = 0;
  pickedFriends.forEach((name, i) => {
    const npc = npcs.find(n => n.name === name);
    if (!npc) return;
    const ang = (i / Math.max(1, pickedFriends.length)) * Math.PI * 2;
    cabCompanionMeshes.push(...buildResidentFigure(dest.x + Math.cos(ang) * 2.5, dest.z + Math.sin(ang) * 2.5, npc));
  });
  showNotif(pickedFriends.length ? `🚕 Arrived at ${dest.emoji} ${dest.name} with ${pickedFriends.join(', ')}!` : `🚕 Arrived at ${dest.emoji} ${dest.name}!`);
  sfx.earn();
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

let cinemaState = {movie:null,snacks:[],phase:null,sceneIndex:0,sceneTimer:null,animFrame:null,trailerIndex:0,sceneStart:0};

function openCinema() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  sfx.cinema();
  cinemaState = {movie:null,snacks:[],phase:'lobby',sceneIndex:0,sceneTimer:null,animFrame:null,trailerIndex:0,sceneStart:0};
  document.getElementById('cinemaModal').style.display = 'flex';
  document.getElementById('cinemaLobby').style.display = 'block';
  document.getElementById('cinemaSnacks').style.display = 'none';
  document.getElementById('cinemaScreen').style.display = 'none';
  document.getElementById('cinemaSipLobby').textContent = sipDollars;
  buildMovieGrid();
}

function buildMovieGrid() {
  const grid = document.getElementById('movieGrid');
  grid.innerHTML = '';
  CINEMA_MOVIES.forEach((m,i) => {
    const card = document.createElement('div');
    card.style.cssText = `background:${m.bg};border:2px solid #333;border-radius:12px;padding:16px 12px;cursor:pointer;text-align:center;transition:border-color 0.2s;`;
    card.onmouseenter = () => card.style.borderColor='#ffcc00';
    card.onmouseleave = () => card.style.borderColor='#333';
    card.innerHTML = `<div style="font-size:32px;margin-bottom:6px;">${m.icons}</div>
      <div style="color:#fff;font-weight:bold;font-size:12px;margin-bottom:3px;">${m.title}</div>
      <div style="color:#aaa;font-size:10px;margin-bottom:8px;">${m.genre}</div>
      <div style="background:#e94560;color:#fff;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:bold;margin-bottom:6px;">🎟️ ${m.price} S.I.P.</div>
      <div class="movieFightBtn" style="background:#333;color:#ff8844;border:1px solid #ff8844;padding:4px 10px;border-radius:6px;font-size:10px;font-weight:bold;">⚔️ Fight (Free)</div>`;
    card.onclick = () => selectCinemaMovie(i);
    card.querySelector('.movieFightBtn').onclick = (e) => { e.stopPropagation(); enterMovieFight(i); };
    grid.appendChild(card);
  });
}

function selectCinemaMovie(idx) {
  const m = CINEMA_MOVIES[idx];
  if(sipDollars < m.price) { showNotif(`❌ Need ${m.price} S.I.P. for a ticket!`); return; }
  spendSip(m.price); saveCurrentUser(); updateSIP();
  cinemaState.movie = m;
  cinemaState.movieIdx = idx;
  document.getElementById('cinemaLobby').style.display = 'none';
  document.getElementById('cinemaSnacks').style.display = 'block';
  document.getElementById('cinemaSnackSip').textContent = sipDollars;
  buildSnackBar();
}

function buildSnackBar() {
  const grid = document.getElementById('snackGrid');
  grid.innerHTML = '';
  CINEMA_SNACKS.forEach(s => {
    const card = document.createElement('div');
    card.style.cssText = 'background:#1a1a2e;border:2px solid #333;border-radius:10px;padding:12px;text-align:center;cursor:pointer;transition:border-color 0.2s;';
    card.onmouseenter = () => card.style.borderColor='#ffcc00';
    card.onmouseleave = () => card.style.borderColor='#333';
    card.innerHTML = `<div style="font-size:26px;">${s.emoji}</div><div style="color:#fff;font-size:12px;font-weight:bold;margin:4px 0;">${s.name}</div><div style="color:#ffcc00;font-size:11px;">${s.price} 💰</div>`;
    card.onclick = () => buyCinemaSnack(s);
    grid.appendChild(card);
  });
  updateSnackCart();
}

function buyCinemaSnack(s) {
  if(sipDollars < s.price) { showNotif(`❌ Need ${s.price} S.I.P.!`); return; }
  spendSip(s.price); saveCurrentUser(); updateSIP();
  cinemaState.snacks.push(s);
  document.getElementById('cinemaSnackSip').textContent = sipDollars;
  updateSnackCart();
  addToBag(s);
}

