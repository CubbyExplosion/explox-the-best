// ─── SAI — SUPER ARTIFICIAL INTELLIGENCE ─────────────────────────────────────
let saiCurrentTab = 'chat';
let saiTipIndex   = 0;
let navTarget     = null;
let navLineMesh   = null;
let navBeaconMesh = null;

const SAI_TIPS = [
  { icon:'💰', text:'Work as a Shopkeeper near Shopping Street or as an Officer at the Police Station to earn S.I.P. fast!' },
  { icon:'🏦', text:'Deposit your S.I.P. in the City Bank. It earns +10,000 S.I.P. interest every 60 seconds!' },
  { icon:'🔐', text:'Set a safe combo in the bank to unlock the vault — it starts loaded with items and secret weapons!' },
  { icon:'🏬', text:'The City Mall has exclusive items like Jewelry, Phones and Ice Cream not found on the street.' },
  { icon:'🎒', text:'Open your BAG tab on the right to see all the items you have collected around the city.' },
  { icon:'😈', text:'Talk to the Shady Dealer to join the underground — but watch your Wanted level rise!' },
  { icon:'🎮', text:'Play Mini Games to earn extra S.I.P. and unlock weapons that appear in your bank safe!' },
  { icon:'📅', text:'Click the season badge in the top-right to open the calendar and see holidays and your birthday.' },
  { icon:'🗺️', text:'Use the SAI Map tab to find any location and draw a path line on the ground to follow!' },
  { icon:'⌨️', text:'Fast tab shortcuts: press B for Bag, T for SAI, or M for Music — no mouse needed, even while looking around!' },
];

const SAI_LOCATIONS = [
  { label:'City Bank',       x:160,  z:210,  color:'#FFD700', emoji:'🏦' },
  { label:'Your House',      x:-30,  z:-110, color:'#44ff88', emoji:'🏠' },
  { label:'Shopping Street', x:60,   z:50,   color:'#00ccff', emoji:'🛍️' },
  { label:'City Mall',       x:80,   z:-20,  color:'#cc44ff', emoji:'🏬' },
  { label:'Police Station',  x:-70,  z:10,   color:'#4488ff', emoji:'🚔' },
  { label:'Restaurant',      x:20,   z:80,   color:'#ff8844', emoji:'🍕' },
  { label:'Black Market',    x:-80,  z:-71,  color:'#ff4444', emoji:'⚫' },
  { label:'Shady Dealer',    x:34,   z:3,    color:'#aa44ff', emoji:'🕴️' },
  { label:'Movie Theater',   x:50,   z:-85,  color:'#ff2244', emoji:'🎬' },
  { label:'Transit Hub',     x:0,    z:50,   color:'#ffcc00', emoji:'🚇' },
  { label:'City Hotel',      x:-15,  z:-5,   color:'#ffd700', emoji:'🏨' },
  { label:'Car Dealership',  x:130,  z:35,   color:'#ff8844', emoji:'🚗' },
  { label:'Computer Shop',   x:100,  z:58,   color:'#4488ff', emoji:'💻' },
  { label:'City Airport',    x:-200, z:-200, color:'#88ccff', emoji:'✈️' },
  { label:'The Diner',       x:110,  z:-25,  color:'#ffaa55', emoji:'🍽️' },
  { label:'Your Store',      x:160,  z:-25,  color:'#D8A657', emoji:'🏪' },
  { label:'Robo Arsenal',    x:282,  z:268,  color:'#00ffcc', emoji:'🤖' },
];
// World-zoom markers for the SAI map — kept OUT of SAI_LOCATIONS on purpose: that array also
// feeds buildShopperPopulation()'s wander pool, and a shopper randomly assigned "walk to Japan"
// as a patrol leg would try to cross 8000+ units of map. COUNTRY_CENTERS' own coords (real,
// 20x-scaled ring layout, see its own comment) are reused here as-is, not re-guessed.
const SAI_WORLD_MARKERS = [
  { label:'Downtown Explox', x:0, z:0, color:'#00ccff', emoji:'🏙️' },
  { label:'France',        x:COUNTRY_CENTERS.France.x,        z:COUNTRY_CENTERS.France.z,        color:'#4466ff', emoji:'🥐' },
  { label:'UK',             x:COUNTRY_CENTERS.UK.x,             z:COUNTRY_CENTERS.UK.z,             color:'#cc3333', emoji:'☕' },
  { label:'Italy',          x:COUNTRY_CENTERS.Italy.x,          z:COUNTRY_CENTERS.Italy.z,          color:'#44cc44', emoji:'🍝' },
  { label:'Japan',          x:COUNTRY_CENTERS.Japan.x,          z:COUNTRY_CENTERS.Japan.z,          color:'#ff88aa', emoji:'🌸' },
  { label:'Australia',      x:COUNTRY_CENTERS.Australia.x,      z:COUNTRY_CENTERS.Australia.z,      color:'#ffaa22', emoji:'🦘' },
  { label:'Egypt',          x:COUNTRY_CENTERS.Egypt.x,          z:COUNTRY_CENTERS.Egypt.z,          color:'#ddaa44', emoji:'🐫' },
  { label:'Brazil',         x:COUNTRY_CENTERS.Brazil.x,         z:COUNTRY_CENTERS.Brazil.z,         color:'#22cc66', emoji:'🌴' },
  { label:'Space Station',  x:COUNTRY_CENTERS['Space Station'].x, z:COUNTRY_CENTERS['Space Station'].z, color:'#aaccff', emoji:'🚀' },
  { label:'Canada',         x:COUNTRY_CENTERS.Canada.x,         z:COUNTRY_CENTERS.Canada.z,         color:'#ff4444', emoji:'🍁' },
];
let saiMapZoomedOut = false; // false = close-up city view (SC=0.7), true = whole-world view including every country

function toggleSAI() {
  const panel = document.getElementById('saiPanel');
  if(panel.style.display === 'none') {
    if(document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    panel.style.display = 'block';
    document.getElementById('saiTab').style.display = 'none';
    saiSwitchTab('chat');
  } else { closeSAI(); }
}
function closeSAI() {
  document.getElementById('saiPanel').style.display = 'none';
  document.getElementById('saiTab').style.display = 'block';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

function saiSwitchTab(tab) {
  saiCurrentTab = tab;
  ['chat','map','bosses','tips'].forEach(t => {
    const btn  = document.getElementById('saiTab' + t[0].toUpperCase() + t.slice(1));
    const view = document.getElementById('sai' + t[0].toUpperCase() + t.slice(1) + 'View');
    const active = t === tab;
    btn.style.background   = active ? '#00ff8833' : 'none';
    btn.style.borderColor  = active ? '#00ff88'   : '#444';
    btn.style.color        = active ? '#00ff88'   : '#888';
    view.style.display     = active ? 'block'     : 'none';
  });
  if(tab === 'map')    drawSAIMap();
  if(tab === 'bosses') renderSaiBossesView();
  if(tab === 'tips')   showSaiTip();
}
// Most bosses live FAR outside the SAI map's zoomed-in city view (some are 600-1200+ units out —
// literally off the 234x220 canvas at its SC=0.7 scale), so they were never actually clickable
// there. This gives them their own list, with real live distance and a Navigate button that
// calls the exact same saiNavigateTo() the map uses — works at any distance since the compass
// beacon is just angle/distance math, not tied to the map canvas at all.
function renderSaiBossesView() {
  const box = document.getElementById('saiBossesList'); if(!box) return;
  box.innerHTML = '';
  const px = playerGroup ? playerGroup.position.x : 0, pz = playerGroup ? playerGroup.position.z : 0;
  BOSS_DEFS.forEach(def => {
    const st = bossState[def.name];
    const alive = !st || st.alive;
    const dist = Math.round(Math.hypot(px - def.x, pz - def.z));
    const locked = def.minLevel > 0 && eliteLevel < def.minLevel;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;background:rgba(0,255,136,0.05);border:1px solid #00ff8833;border-radius:8px;padding:6px 8px;margin-bottom:6px;';
    row.innerHTML = `
      <div style="font-size:18px;">${def.emoji}</div>
      <div style="flex:1;min-width:0;">
        <div style="color:${alive ? '#fff' : '#666'};font-size:11px;font-weight:bold;">${def.name}${locked ? ' 🔒' : ''}</div>
        <div style="color:#00ff8877;font-size:9px;">${alive ? dist + 'm away' : 'Defeated — respawning'}${locked ? ` · needs Lv.${def.minLevel}` : ''}</div>
      </div>
      <button style="padding:5px 8px;background:#004422;border:1px solid #00ff88;border-radius:6px;color:#00ff88;font-size:10px;cursor:pointer;white-space:nowrap;">🧭 Go</button>
    `;
    row.querySelector('button').onclick = () => saiNavigateTo(def.x, def.z, def.emoji + ' ' + def.name);
    box.appendChild(row);
  });
}

// Real bugs caught live while adding the batch below (user's own ask, more than once now: "make
// the ai know more"): (1) saiAsk() used plain `.includes()`, a pure substring test — 'hi' (a
// greeting key) matched inside "claw maCHIne", so asking about the Claw Machine got SAI's hello
// reply instead. (2) A leading-boundary-only first fix attempt then let short key 'war' swallow
// the pre-existing 'warp' key's queries (e.g. "warp me somewhere" wrongly hit the new War Room
// reply), and let 'quest' swallow "question". Both fixed together by saiKeyMatches() below.
function saiKeyMatches(lq, key) {
  const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Real word boundary on BOTH ends (with an optional trailing "s" so "quest"/"weapon" still
  // match "quests"/"weapons") — a leading-only boundary was the first fix attempt, but it let
  // "war" swallow "warp" (a real pre-existing key) and let "quest" swallow "question". Full
  // boundaries fix both without needing a hand-written plural for every single key.
  return new RegExp('\\b' + esc + '(?:s)?\\b', 'i').test(lq);
}
const SAI_KB = [
  // New topics FIRST — SAI_KB.some() takes the first match, so anything more specific than the
  // older generic entries below (particularly 'job'/'work'/'earn' at the original #5 entry, which
  // would otherwise swallow "how does war work"/"job tab"/"earnings" queries meant for one of these)
  // needs to win the race by being checked first, not by being more "correct".
  { keys:['guard','siege','robber','attacker','defend the bank','bank job'], reply:"💂 Sign up as Bank Guard at x=160, z=246 (S.I.P.) or x=174, z=246 (💎). Killers attack the Bank for real during your shift — fight them off, call in 📣 Coin Bot backup (10 giant Coin Bots, 30s cooldown), and real Police officers show up too. Let the Bank's health hit 0 and the shift fails with no pay!" },
  { keys:['wall','shoot down','rooftop','snipe','bank wall'], reply:"🪜 While on Guard duty, climb the staircase on the Bank's east side (x=180, z=210) to reach the wall. Up there, press E to fire down at attackers instead of fighting in melee — press E again to climb back down once it's clear!" },
  { keys:['world event','earthquake','alien','pirate raid','crab invasion','gnome','stampede','invasion attempt'], reply:'🌍 The World Events board is at x=386, z=155. Pick from 23 shared events — everyone online sees the same one! Most (concerts, hazards, hostile factions) land at one of 8 fixed spots ringing the very edge of the city; Invasion Attempt always hits home turf at The Park (x=-10, z=-60).' },
  { keys:['wedding','marry','married','birthday party','grand opening','town event','host a concert'], reply:'🎉 The Town Events board is at x=378, z=155. Host a wedding, throw a birthday party, have a baby, open a grand opening, or throw a concert — real events with real S.I.P. rewards!' },
  { keys:['war','territory','countries to','capture the','conquer'], reply:"⚔️ The War Room is at x=250, z=-260 (ONLINE mode only). Fly to any of 9 countries and fight real soldiers + tanks to capture territory for Explox — permanently! Breach each country's wall first, then fight through to the garrison inside." },
  { keys:['quest','robot level','elite level','level up'], reply:'📜 Open the QUESTS tab (right side) for real quests that pay Elite Coins. Spend those to level up your Robot Level — real Max HP and damage for YOU forever, and enemy robots get tougher, bigger, and worth more too (capped, so they never get out of hand)!' },
  { keys:['job tab','hire on','any job','shop job'], reply:'💼 Click the JOB tab (right side) to hire on for ANY job in the game from one menu — no walking required! Every one of the 300+ shops in the city is a real job you can clock into.' },
  { keys:['earning','collect all','pending reward'], reply:'💰 Every S.I.P./Elite Coin reward in the game queues up in the EARNINGS tab (right side) instead of landing in your wallet instantly — click one (or hit Collect All) to actually collect it!' },
  { keys:['diamond deposit','shop tab','vip package','buy sip','buy diamonds'], reply:'🛍️ Click the SHOP tab (right side) for instant S.I.P./💎 packages, up to a bundled VIP Package. The Bank also holds its own real 💎 Diamond balance now — deposit or withdraw them right next to your S.I.P. balance!' },
  { keys:['scrapyard','grinder','rogue robot','wreckage','scrap metal'], reply:'🤖 The Scrapyard is at x=300, z=250 — 100 spawners scattered across the whole city send rogue robots after you! Fight them for rewards, then feed the wreckage into The Grinder (x=300, z=268) for real Scrap Metal and materials.' },
  { keys:['exploxtube','tube','video','upload','subscriber','channel','comment'], reply:"📺 ExploxTube lives inside SIB (your computer's browser) — watch videos, Like them, leave a real comment, or hit Upload to post your own and grow real subscribers!" },
  { keys:['neighbor','family','have a baby','spouse'], reply:"👋 40 named neighbors live in the Suburbs, each with a real house, car, and job. Befriend them, invite them over, marry two off at a Town Event, and they'll even have a baby together!" },
  { keys:['sunset plains','build on','my plot','own land'], reply:'🏗️ Buy your own plot at Sunset Plains (x=-400, z=150) and build real structures on it — furniture, decorations, even invite friends over to sit, paint, or hang out on your land!' },
  { keys:['arcade','cabinet','whack-a-mole','snake game','tetris','claw machine','simon says','memory match','brick breaker','quick draw'], reply:'🕹️ The Pixel Palace Arcade has 9 real cabinet games — Whack-a-Mole, Maze Chase, Memory Match, Simon Says, Snake, Brick Breaker, Quick Draw, Tetris, and a real Claw Machine!' },
  { keys:['duel','pvp','ffa','fight another player','fight arena'], reply:'⚔️ Challenge any other online player to a real 1v1 duel anywhere in the city, or head into the Fight Arena (x=250, z=-200) for free-for-all combat against everyone else there!' },
  { keys:['add-on','addon','power up','berserker','speed boost'], reply:'🧩 Click ADD ONS (left side) for 100+ real gameplay boosts — Berserker damage, Speed Boost, Moon Jump, Bouncy Shoes, and way more!' },
  { keys:['invest','shares','stock market'], reply:'📈 Open the Bank, then click Stock Market — buy and sell real shares in 6 companies at real-time prices, the same for everyone online!' },
  { keys:['killer','dagger','hooded','stranger danger'], reply:"⚠️ Hooded Killers roam the city and will attack for real if you get close — fight back to defeat them! They show up more often the more you've defeated." },
  { keys:['bank','vault'],           reply:'🏦 The City Bank is northeast of downtown near the Suburbs (x=160, z=210). A passcode is required. Your bank earns +10,000 S.I.P. interest every 60 seconds!' },
  { keys:['house','home'],           reply:'🏠 Your house is south of the city at x=-30, z=-110. Head south down the road past the park.' },
  { keys:['shop','buy'],     reply:'🛍️ Shopping Street is east of center (x=60, z=50). Coffee Shop, Toy Store, Outfit Shop and Weapon Shop are all there!' },
  { keys:['mall','directory'],       reply:'🏬 The City Mall is far east at x=80, z=-20. Past the fountain is a Shopping Wing with 200 more real shops, plus a 🗺️ Mall Directory kiosk to search all 300 shops in the game!' },
  { keys:['job','work','earn'],      reply:'💼 Work as a Shopkeeper (Shopping Street, +5 S.I.P./round) or Officer (Police Station, +10 S.I.P./round). Press E near the zone to start!' },
  { keys:['police','cop','officer'], reply:'🚔 The Police Station is west at x=-70, z=10. Work there as an Officer for 10 S.I.P. per round!' },
  { keys:['restaurant','food','pizza','cook'], reply:'🍕 Restaurant Row is north at x=20, z=80. Grab ingredients, cook at the stove, deliver meals for +20 S.I.P. each!' },
  { keys:['diner','eat','hungry','meal','taste'], reply:'🍽️ The Diner is south-east at x=110, z=-25 — a sit-down restaurant with a real menu (burgers, pizza, sushi, tacos, dessert, and more)! Order a dish, then press C to eat it and see your taste reaction.' },
  { keys:['store','own store','business','property'], reply:"🏪 Your Store is east of The Diner at x=160, z=-25! Buy one of 10 store tiers (100 to 15,000 S.I.P.) — bigger ones are 2-story and come furnished. Walk in, stock up on ingredients, set your price, then open the shop — you have to stay while it's open for customers to buy. Decorate the room with furniture too! Only one store at a time — buying a new one replaces the old one." },
  { keys:['black market','underground','dealer'], reply:'🕴️ Talk to the Shady Dealer (x=34, z=3) to go bad. The Black Market is southwest at x=-80, z=-71. Your Wanted level will rise!' },
  { keys:['weapon','sword','bat','axe'], reply:'⚔️ Buy weapons at the Weapon Shop (Shopping Street) or in the Mall. Open the bank safe too — it holds secret mini-game weapons!' },
  { keys:['robo arsenal','fight robot','emp hammer','plasma cutter','rail spike'], reply:'🤖 The Robo Arsenal shop is at The Scrapyard (x=282, z=268). It sells the EMP Hammer, Plasma Cutter and Rail Spike — weak against people, but they hit robots way harder than a regular sword!' },
  { keys:['safe','combo'],           reply:'🔐 Enter the bank and click "Open Safe". First time: create a combo. The safe holds secret items and mini-game weapons!' },
  { keys:['map','where'],            reply:'🗺️ Switch to the Map tab! Click any location dot to draw a navigation line on the ground to follow.' },
  { keys:['mini game','minigame','throne','obby','parkour'], reply:'🎮 Click MINI GAMES on the right to play Capture the Throne, Obby, or Rooftop Parkour!' },
  { keys:['season','winter','summer','holiday','calendar'],  reply:'📅 Click the season badge (top-right) to open the calendar. Holidays and your birthday are marked!' },
  { keys:['bag','inventory','item'], reply:'🎒 Click the BAG tab on the right to see all your items. Buy things from shops and they show up here!' },
  { keys:['money','sip','cash'],     reply:'💰 Earn S.I.P. by working jobs, cooking meals, or playing mini games. Bank it for interest!' },
  { keys:['car','drive','vehicle','dealership'], reply:'🚗 The Car Dealership is east of Shopping Street at x=130, z=35. Buy cars with S.I.P. and drive them around the city! Press E near your parked car to get in, E again to exit.' },
  { keys:['computer','sib','browser','internet','online'], reply:'💻 The Computer Shop is at x=100, z=58 — sells S.I.C., S.I.C.+, and S.D.I.C. computers. Buy one, then use it at the desk in your house to open SIB — the Super Important Browser! Shop online, read news, and more.' },
  { keys:['hello','hi','hey','sup'], reply:'🤖 Hello! I am SAI. Ask me about locations, jobs, the bank, transit, cars, weapons, shops, mini games, or anything in Explox!' },
  { keys:['tip','advice','help'],    reply:'💡 Switch to the Tips tab for 10 game tips that will help you level up fast!' },
  { keys:['sits','transit','bus','train','subway','metro','ride','transport'], reply:'🚇 S.I.T.S. (Super Important Transit System) is at the city center (x=0, z=-40)! Walk in and pick a route. 5 lines: 🔴 Red (2 SIP), 🔵 Blue (3 SIP), 🟢 Green (2 SIP), 🟡 Yellow (4 SIP), 🟣 Purple (3 SIP). Click any stop to teleport there instantly! Fares go to your bank.' },
  { keys:['cinema','movie','film','theater','watch'], reply:'🎬 The Movie Theater is south-east at x=50, z=-85. Walk in to pick from 14 movies — buy a ticket, grab snacks, and watch! Ticket prices: 20–40 SIP depending on the film.' },
  { keys:['fast travel','teleport','warp','shortcut'], reply:'🚇 Use S.I.T.S. at the Transit Hub (center of city, x=0, z=-40) to fast-travel anywhere! Pick a line, click your stop, and you\'re there in seconds.' },
  { keys:['airport','fly','flight','plane','airline','ticket'], reply:'✈️ The City Airport is southwest at x=-200, z=-200. Walk up and press E to enter! Buy a ticket (45–80 SIP) and fly to 5 destinations: Palm Beach 🌴, Mountain View 🏔️, Harbor Bay 🌊, Sky Tower District 🏙️, or Desert Sands 🏜️. Enjoy the window view!' },
  { keys:['boss','bosses','mega-bot','storm titan','scrap king','frost colossus','sahara golem','void serpent'], reply:'⚔️ 6 bosses guard the far edges of the map — some are hundreds of units out, way past the city! Switch to the new Bosses tab (next to Map) to see each one\'s live distance and hit 🧭 Go to drop a compass beacon straight to it, no matter how far away.' },
];

function saiAsk() {
  const input = document.getElementById('saiInput');
  const q = input.value.trim(); if(!q) return;
  input.value = '';
  saiAddMsg('You: ' + q, 'user');
  const lq = q.toLowerCase();
  let reply = '🤔 I\'m not sure about that. Try asking about: locations, jobs, bank, safe, weapons, shops, mini games, or the map!';
  for(const entry of SAI_KB) {
    if(entry.keys.some(k => saiKeyMatches(lq, k))) { reply = entry.reply; break; }
  }
  setTimeout(() => saiAddMsg('🤖 ' + reply, 'sai'), 400);
}

function saiAddMsg(text, who) {
  const box = document.getElementById('saiMessages');
  const div = document.createElement('div');
  div.style.cssText = who === 'user'
    ? 'background:rgba(255,255,255,0.07);border-radius:6px;padding:6px 8px;font-size:11px;color:#ccc;text-align:right;'
    : 'background:rgba(0,255,136,0.1);border-radius:6px;padding:6px 8px;font-size:11px;color:#00ff88;';
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// Single source of truth for SC + which location list is active, shared by drawSAIMap() AND
// saiMapClick() — the two used to hardcode SC=0.7 independently with a comment warning they had
// to be kept in sync by hand; deriving both from here removes that whole failure mode. World zoom
// (user's own ask: "make the map on sai bigger big enough to show the world") fits the real
// 8000-radius country ring (see COUNTRY_CENTERS) inside the canvas instead of the old SC=0.7,
// which only ever showed ~±167 units — countries and most bosses were literally off the canvas.
function saiMapConfig() {
  return saiMapZoomedOut
    ? { SC: 0.016, locations: SAI_WORLD_MARKERS }
    : { SC: 0.7,   locations: SAI_LOCATIONS };
}
function toggleSaiMapZoom() {
  saiMapZoomedOut = !saiMapZoomedOut;
  const btn = document.getElementById('saiMapZoomBtn');
  if(btn) btn.textContent = saiMapZoomedOut ? '🔍 Zoom In to City' : '🌍 Zoom Out to World';
  drawSAIMap();
}
function drawSAIMap() {
  const cv = document.getElementById('saiMapCanvas'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const { SC, locations } = saiMapConfig();
  const ox = W/2, oy = H/2;
  const mx = wx => ox + wx * SC;
  const mz = wz => oy - wz * SC;

  ctx.fillStyle = '#050f08'; ctx.fillRect(0,0,W,H);

  if(!saiMapZoomedOut) {
    // Grid
    ctx.strokeStyle = '#0a2010'; ctx.lineWidth = 1;
    for(let i=-5;i<=5;i++){
      ctx.beginPath(); ctx.moveTo(mx(i*50),0); ctx.lineTo(mx(i*50),H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,mz(i*50)); ctx.lineTo(W,mz(i*50)); ctx.stroke();
    }
    // Roads
    ctx.strokeStyle = '#1c3a1c'; ctx.lineWidth = 5;
    [ [[-150,0],[150,0]], [[0,-130],[0,100]], [[-150,50],[150,50]], [[-30,100],[-30,-130]] ]
    .forEach(([a,b]) => {
      ctx.beginPath(); ctx.moveTo(mx(a[0]),mz(a[1])); ctx.lineTo(mx(b[0]),mz(b[1])); ctx.stroke();
    });
  } else {
    // World ring — the real 8000-unit radius every country center sits on (see COUNTRY_CENTERS),
    // drawn as a guide so the layout reads as "a ring of countries around the city", not random dots.
    ctx.strokeStyle = '#0a3020'; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.arc(ox,oy,8000*SC,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Location dots
  const dotR = saiMapZoomedOut ? 7 : 5;
  locations.forEach(loc => {
    const lx = mx(loc.x), ly = mz(loc.z);
    const glowR = saiMapZoomedOut ? 16 : 12;
    const g = ctx.createRadialGradient(lx,ly,0,lx,ly,glowR);
    g.addColorStop(0, loc.color+'99'); g.addColorStop(1,'transparent');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx,ly,glowR,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = loc.color; ctx.beginPath(); ctx.arc(lx,ly,dotR,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
    ctx.fillText(loc.emoji+' '+loc.label, lx, ly-glowR-2);
  });

  // Nav line + target
  if(navTarget && playerGroup) {
    const px = playerGroup.position.x, pz = playerGroup.position.z;
    ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 2; ctx.setLineDash([5,3]);
    ctx.beginPath(); ctx.moveTo(mx(px),mz(pz)); ctx.lineTo(mx(navTarget.x),mz(navTarget.z)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(mx(navTarget.x),mz(navTarget.z),6,0,Math.PI*2); ctx.fill();
  }

  // Player dot
  if(playerGroup) {
    const px = mx(playerGroup.position.x), pz = mz(playerGroup.position.z);
    const pg = ctx.createRadialGradient(px,pz,0,px,pz,10);
    pg.addColorStop(0,'#ffffff'); pg.addColorStop(1,'transparent');
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px,pz,10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00aaff'; ctx.beginPath(); ctx.arc(px,pz,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 7px Arial'; ctx.textAlign = 'center';
    ctx.fillText('YOU', px, pz-12);
  }
}

function saiMapClick(event) {
  const cv = document.getElementById('saiMapCanvas');
  const rect = cv.getBoundingClientRect();
  const cx = event.clientX - rect.left, cy = event.clientY - rect.top;
  const { SC, locations } = saiMapConfig(); // shared with drawSAIMap() — see saiMapConfig()'s own comment
  const ox = cv.width/2, oy = cv.height/2;
  // Find nearest named location within 28px
  let hit = null, best = 28;
  locations.forEach(loc => {
    const lx = ox + loc.x*SC, ly = oy - loc.z*SC;
    const d = Math.sqrt((cx-lx)**2+(cy-ly)**2);
    if(d < best) { hit = loc; best = d; }
  });
  if(hit) saiNavigateTo(hit.x, hit.z, hit.label);
  else saiNavigateTo((cx-ox)/SC, (oy-cy)/SC, 'Custom Point');
  drawSAIMap();
}

function saiNavigateTo(wx, wz, label) {
  navTarget = { x:wx, z:wz, label };
  const el = document.getElementById('saiNavLabel');
  if(el) el.textContent = '🧭 Navigating to: ' + label;
  showNotif('🤖 SAI: Follow the blue beacon to ' + label + '!');
}

function updateNavLine() {
  if(navLineMesh)   { scene.remove(navLineMesh);   navLineMesh   = null; }
  if(navBeaconMesh) { scene.remove(navBeaconMesh); navBeaconMesh = null; }
  const navHud = document.getElementById('navHud');
  if(!navTarget || !playerGroup) { if(navHud) navHud.style.display='none'; return; }

  const px = playerGroup.position.x, pz = playerGroup.position.z;
  const dx = navTarget.x - px, dz = navTarget.z - pz;
  const dist = Math.sqrt(dx*dx + dz*dz);

  if(dist < 4) {
    navTarget = null;
    if(navHud) navHud.style.display = 'none';
    const el = document.getElementById('saiNavLabel'); if(el) el.textContent = '✅ Arrived!';
    showNotif('🤖 SAI: You have arrived!');
    return;
  }

  // Tall glowing beacon pillar — visible over all buildings
  if(!navBeaconMesh) {
    navBeaconMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 80, 8),
      new THREE.MeshBasicMaterial({ color:0x00ffff, transparent:true, opacity:0.5 })
    );
    navBeaconMesh.position.set(navTarget.x, 40, navTarget.z);
    scene.add(navBeaconMesh);
  }

  // HUD compass arrow — rotates to point toward destination relative to camera facing
  if(navHud) {
    navHud.style.display = 'block';
    const worldAngle = Math.atan2(dx, dz);
    const relAngle = worldAngle - yaw;
    const deg = relAngle * (180 / Math.PI);
    document.getElementById('navArrow').style.transform = `rotate(${deg}deg)`;
    document.getElementById('navHudLabel').textContent = '🧭 ' + navTarget.label;
    document.getElementById('navHudDist').textContent = Math.round(dist) + 'm away';
  }
}

function showSaiTip() {
  const tip = SAI_TIPS[saiTipIndex];
  document.getElementById('saiTipIcon').textContent = tip.icon;
  document.getElementById('saiTipText').textContent = tip.text;
  document.getElementById('saiTipCounter').textContent = (saiTipIndex+1) + ' / ' + SAI_TIPS.length;
}
function saiNextTip(dir) {
  saiTipIndex = (saiTipIndex + dir + SAI_TIPS.length) % SAI_TIPS.length;
  showSaiTip();
}

// Wire up login buttons immediately when script loads
(function() {
  var b = document.getElementById('createAccBtn');
  if(b) b.onclick = createAccount;
  var pi = document.getElementById('newAccPw');
  if(pi) pi.onkeydown = function(e){ if(e.key==='Enter') createAccount(); };
})();
