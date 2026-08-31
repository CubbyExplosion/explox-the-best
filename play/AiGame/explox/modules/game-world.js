// ─── WORLD EVENTS ──────────────────────────────────────────────────────────────
// Different from the Town Events board above — these are SHARED with everyone
// online (via the generic /api/event endpoint, one active event at a time,
// server enforces the lock) and can involve real danger or combat, not just an
// instant flavor reward. Every one of the 23 events reuses ONE of three real
// mechanics instead of needing 23 separate systems:
//  - gathering: stand near the spot, earn steady S.I.P. every few seconds while there
//  - hazard: real periodic damage in a radius; a bonus for surviving to the end
//  - hostileFaction: real fightable NPCs (reuses the exact Scrapyard robot combat
//    pattern - press E in range, they hit back, defeat for a reward), spawned
//    independently per client like Throne's co-op enemies (item 183's precedent -
//    no shared enemy-health authority needed for this to feel real and shared)
const WORLD_EVENTS = [
  { id:'concert', name:'Concert', emoji:'🎤', template:'gathering',
    description:'A stage lights up and a live show draws a crowd — stick around to cheer.',
    params:{ rewardPerTick:4, radius:14, durationSec:180 } },
  { id:'earthquake', name:'Earthquake', emoji:'🌍', template:'hazard',
    description:'The ground shakes and cracks — stay safe until it settles down.',
    params:{ damagePerTick:10, tickSeconds:3, radius:22, rewardOnSurvive:100, durationSec:60 } },
  { id:'cartel-turf-war', name:'Cartel Turf War', emoji:'🕶️', template:'hostileFaction',
    description:'A rival gang rolls in to claim turf — fight them off for the reward.',
    params:{ count:6, npcHealth:60, npcDamage:14, rewardPerKill:28, durationSec:180 } },
  { id:'ice-cream-parade', name:'Ice Cream Parade', emoji:'🍦', template:'gathering',
    description:'A parade of ice cream trucks rolls through town handing out free scoops to anyone who joins the line.',
    params:{ rewardPerTick:3, radius:12, durationSec:150 } },
  { id:'firework-festival', name:'Firework Festival', emoji:'🎆', template:'gathering',
    description:'The night sky fills with dazzling fireworks and players who watch from the park earn coins for cheering along.',
    params:{ rewardPerTick:4, radius:15, durationSec:180 } },
  { id:'street-magic-show', name:'Street Magic Show', emoji:'🎩', template:'gathering',
    description:'A traveling magician pulls off jaw-dropping tricks downtown and tosses coins to the crowd that gathers to watch.',
    params:{ rewardPerTick:2, radius:10, durationSec:120 } },
  { id:'food-truck-rally', name:'Food Truck Rally', emoji:'🌮', template:'gathering',
    description:'A lineup of food trucks parks in the plaza, serving free samples to hungry players who stick around.',
    params:{ rewardPerTick:3, radius:14, durationSec:150 } },
  { id:'beach-bonfire', name:'Beach Bonfire Bash', emoji:'🔥', template:'gathering',
    description:'Friends gather around a crackling beach bonfire to roast marshmallows and swap stories under the stars.',
    params:{ rewardPerTick:2, radius:10, durationSec:200 } },
  { id:'snow-globe-wonderland', name:'Snow Globe Wonderland', emoji:'❄️', template:'gathering',
    description:'A patch of the city magically turns into a sparkling winter wonderland with snowmen and hot cocoa stands.',
    params:{ rewardPerTick:3, radius:16, durationSec:240 } },
  { id:'double-rainbow', name:'Double Rainbow Bloom', emoji:'🌈', template:'gathering',
    description:'A giant double rainbow arcs over the city and players who stand beneath it collect shimmering rainbow coins.',
    params:{ rewardPerTick:5, radius:20, durationSec:90 } },
  { id:'meteor-shower', name:'Meteor Shower', emoji:'☄️', template:'hazard',
    description:'Glowing space rocks rain down on a city block, and anyone who dodges them long enough earns a big reward.',
    params:{ damagePerTick:8, tickSeconds:3, radius:18, rewardOnSurvive:90, durationSec:60 } },
  { id:'giant-wave', name:'Giant Wave', emoji:'🌊', template:'hazard',
    description:'A towering wave rolls in from the harbor and soaks the streets, so players race to higher ground before it hits.',
    params:{ damagePerTick:10, tickSeconds:3, radius:25, rewardOnSurvive:100, durationSec:45 } },
  { id:'silly-sinkhole', name:'Silly Sinkhole', emoji:'🕳️', template:'hazard',
    description:'A wobbly sinkhole opens up in the road and slowly swallows the sidewalk, so players scramble to stay clear of the edge.',
    params:{ damagePerTick:6, tickSeconds:4, radius:12, rewardOnSurvive:60, durationSec:60 } },
  { id:'blizzard-whiteout', name:'Blizzard Whiteout', emoji:'🌨️', template:'hazard',
    description:'A sudden blizzard blankets the block in swirling snow, chilling anyone caught outside without shelter.',
    params:{ damagePerTick:5, tickSeconds:4, radius:20, rewardOnSurvive:70, durationSec:90 } },
  { id:'lightning-storm', name:'Lightning Storm', emoji:'⚡', template:'hazard',
    description:'Crackling bolts of lightning zap the ground near the tower, daring players to weave through and survive the storm.',
    params:{ damagePerTick:12, tickSeconds:3, radius:15, rewardOnSurvive:110, durationSec:45 } },
  { id:'food-fight-frenzy', name:'Food Fight Frenzy', emoji:'🍕', template:'hazard',
    description:'A cafeteria food fight spills into the street, splattering anyone nearby with flying pies and spaghetti.',
    params:{ damagePerTick:4, tickSeconds:2, radius:14, rewardOnSurvive:50, durationSec:60 } },
  { id:'runaway-snowball', name:'Runaway Giant Snowball', emoji:'⛄', template:'hazard',
    description:'A massive snowball rolls loose down the hill, growing bigger and forcing players to scatter out of its path.',
    params:{ damagePerTick:14, tickSeconds:3, radius:16, rewardOnSurvive:95, durationSec:40 } },
  { id:'alien-scout-landing', name:'Alien Scout Landing', emoji:'👽', template:'hostileFaction',
    description:'A small squad of goofy alien scouts lands their saucer in the park and starts zapping anyone who gets close.',
    params:{ count:5, npcHealth:40, npcDamage:8, rewardPerKill:20, durationSec:150 } },
  { id:'robot-malfunction', name:'Robot Malfunction', emoji:'🤖', template:'hostileFaction',
    description:'A batch of helper robots short-circuits at the factory and starts chasing players around with clanky antics.',
    params:{ count:6, npcHealth:50, npcDamage:10, rewardPerKill:18, durationSec:150 } },
  { id:'pirate-raiders', name:'Pirate Raiders', emoji:'🏴‍☠️', template:'hostileFaction',
    description:'A crew of cartoonish pirates storms the docks looking for treasure, and players band together to fend them off.',
    params:{ count:7, npcHealth:45, npcDamage:9, rewardPerKill:22, durationSec:180 } },
  { id:'giant-crab-invasion', name:'Giant Crab Invasion', emoji:'🦀', template:'hostileFaction',
    description:'Oversized crabs scuttle out of the sea and pinch their way across the boardwalk until players chase them off.',
    params:{ count:8, npcHealth:30, npcDamage:6, rewardPerKill:15, durationSec:120 } },
  { id:'garden-gnome-uprising', name:'Garden Gnome Uprising', emoji:'🧙', template:'hostileFaction',
    description:'A yard full of garden gnomes comes to life and starts a mischievous rampage through the neighborhood.',
    params:{ count:6, npcHealth:25, npcDamage:5, rewardPerKill:12, durationSec:100 } },
  { id:'wild-stampede', name:'Wild Animal Stampede', emoji:'🐗', template:'hostileFaction',
    description:'A herd of runaway farm animals stampedes through downtown and players work together to herd them back.',
    params:{ count:9, npcHealth:35, npcDamage:7, rewardPerKill:16, durationSec:130 } },
  { id:'invasion-attempt', name:'Invasion Attempt', emoji:'🚨', template:'hostileFaction',
    description:'A real army of 20 invaders lands right in Explox — but 40 Explox Citizens rally to defend the homeland. Fight alongside them! (Explox can never actually be conquered, no matter how many times they try.)',
    params:{ count:20, npcHealth:50, npcDamage:12, rewardPerKill:22, durationSec:150 } },
];

const WORLD_EVENT_SPOT = { x: TOWN_EVENT_SPOT.x + 8, z: TOWN_EVENT_SPOT.z }; // same proven-open ground as the Town Events board, just a few units over
let activeWorldEvent = null;   // synced from the server: {type, startedBy, startedAt, endsAt, data:{name,emoji,template,params,x,z,locName}}
let _lastWorldEventSync = -999;
const WORLD_EVENT_SYNC_INTERVAL = 3;
let worldEventDecor = [];
let worldEventNpcs = [];       // {x,z,hp,maxHp,mesh,col,alive,zone}
let invasionCitizens = [];     // {hp,maxHp,mesh,alive,x,z,attackTimer} — only during an active Invasion Attempt, defenders fighting FOR the player
let worldEventGatherAccum = 0, worldEventHazardAccum = 0;
// The concert World Event used to just be an empty stage despite its own description
// promising "draws a crowd" — now it actually spawns one (real townsfolk colors, cheap
// 2-box figures so a real crowd of 20 costs almost nothing to render) and really plays
// one of the game's music tracks through the real bgMusic engine, not just flavor text.
let worldEventCrowd = []; // [{meshes:[body,head], baseY:[y,y], phase}]
function clearWorldEventCrowd() { worldEventCrowd.forEach(p => p.meshes.forEach(m => scene.remove(m))); worldEventCrowd = []; }
function spawnConcertCrowd(x, z) {
  clearWorldEventCrowd();
  const COUNT = 20;
  for (let i = 0; i < COUNT; i++) {
    const person = SHOPPER_IDENTITIES[Math.floor(Math.random()*SHOPPER_IDENTITIES.length)];
    const angle = Math.random()*Math.PI*2, dist = 3.5 + Math.random()*6.5;
    const px = x + Math.cos(angle)*dist, pz = z + Math.sin(angle)*dist;
    const bodyY = 0.7, headY = 1.4;
    const body = box(0.5, 1.0, 0.4, person.shirt, px, bodyY, pz);
    const head = box(0.4, 0.4, 0.4, person.skin, px, headY, pz);
    worldEventCrowd.push({ meshes:[body, head], baseY:[bodyY, headY], phase: Math.random()*Math.PI*2 });
  }
}

function buildWorldEventsBoard() {
  const { x, z } = WORLD_EVENT_SPOT;
  box(0.15, 2.4, 0.15, 0x2a5a3a, x - 1.4, 1.2, z);
  box(0.15, 2.4, 0.15, 0x2a5a3a, x + 1.4, 1.2, z);
  box(3.2, 1.7, 0.15, 0xeaffea, x, 2.1, z);
  buildSign('🌍 World Events', x, 3.2, z - 0.2);
  CITY_ZONES.push({ x, z: z + 1.5, r: 3.5, label: '🌍 World Events Board', action: () => openWorldEventsBoard()});
}

// User's own ask: "make all the events at the border of the city" — these used to draw from
// LOC_ZONES (the same skip-filtered list as hostGrandOpening), so a random pick could land
// literally anywhere from City Hall in the heart of downtown to a War Territory country a
// thousand+ units out. Every event's own flavor text already reads as something arriving FROM
// outside (aliens landing, pirates raiding the docks, a wave rolling in from the harbor, animals
// stampeding through) — a fixed ring of 8 named spots right at the map's outer edge (radius 1800,
// safely inside the real ±1950 walk clamp and well past every War Territory country's max
// distance of ~1200, so there's no overlap with that separate system) fits the theme better than
// downtown ever did, and keeps events from interrupting whatever's going on in the middle of town.
const WORLD_EVENT_BORDER_SPOTS = [
  { name:'North Border',     x:0,     z:1800  },
  { name:'Northeast Border', x:1273,  z:1273  },
  { name:'East Border',      x:1800,  z:0     },
  { name:'Southeast Border', x:1273,  z:-1273 },
  { name:'South Border',     x:0,     z:-1800 },
  { name:'Southwest Border', x:-1273, z:-1273 },
  { name:'West Border',      x:-1800, z:0     },
  { name:'Northwest Border', x:-1273, z:1273  },
];
function pickWorldEventLocation() {
  return WORLD_EVENT_BORDER_SPOTS[Math.floor(Math.random() * WORLD_EVENT_BORDER_SPOTS.length)];
}
// User's own ask: "make it so people attack us in our country" — Invasion Attempt used to be just
// another random draw from pickWorldEventLocation()'s ~26 spots, meaning it could land in Brazil
// or the Space Station just as easily as downtown, despite its own flavor text promising an
// attack on Explox itself. A real fixed "at home" spot instead — The Park, verified clear of any
// CITY_COLS colliders in a 40-unit radius before picking it.
const INVASION_SPOT = { x: -10, z: -60, name: 'The Park' };
const INVASION_CITIZEN_COUNT = 40;
// User's follow-up: "every country has a wall including explox" — Explox's own wall (built via the
// shared buildWallRing() helper defined down in the War section) rebuilds at full health at the
// start of every Invasion Attempt, matching "Explox can never actually be conquered" — no matter
// how many times invaders tear it down, the next attempt starts against a fresh one. Invaders
// attack ONLY the wall while it stands (see tickInvasionCombat) — the player and citizens are
// fully safe from direct fire until it's breached, then combat proceeds exactly as before.
const EXPLOX_WALL_RADIUS = 26;
let exploxWallHp = 0, exploxWallMaxHp = 1500, exploxWallMesh = null, exploxWallCols = [];
function resetExploxWall() {
  clearExploxWallMesh();
  exploxWallHp = exploxWallMaxHp;
  const built = buildWallRing(INVASION_SPOT.x, INVASION_SPOT.z, EXPLOX_WALL_RADIUS, 14, 0x557799);
  exploxWallMesh = built.mesh;
  exploxWallCols = built.cols;
}
function clearExploxWallMesh() {
  if (exploxWallMesh) {
    scene.remove(exploxWallMesh);
    exploxWallCols.forEach(c => { const ci = CITY_COLS.indexOf(c); if (ci > -1) CITY_COLS.splice(ci, 1); });
  }
  exploxWallMesh = null; exploxWallCols = [];
}

function openWorldEventsBoard() {
  if (serverMode !== 'online') { showNotif('🌍 World Events need ONLINE mode!'); return; }
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('worldEventsBody').innerHTML = WORLD_EVENTS.map(e => `
    <button onclick="triggerWorldEvent('${e.id}')" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#26402e;text-align:left;">
      ${e.emoji} ${e.name}<br><span style="font-weight:normal;font-size:11px;opacity:.8">${e.description}</span>
    </button>`).join('');
  document.getElementById('worldEventsModal').style.display = 'flex';
}
function closeWorldEvents() {
  document.getElementById('worldEventsModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
async function triggerWorldEvent(id) {
  const def = WORLD_EVENTS.find(e => e.id === id);
  if (!def) return;
  const loc = def.id === 'invasion-attempt' ? INVASION_SPOT : pickWorldEventLocation();
  try {
    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/event', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: def.id, startedBy: currentUser, durationSec: def.params.durationSec,
        data: { name: def.name, emoji: def.emoji, template: def.template, params: def.params, x: loc.x, z: loc.z, locName: loc.name }
      })
    }, 4000);
    if (r.status === 409) { showNotif('⚠️ An event is already happening — wait for it to end!'); return; }
    if (!r.ok) { showNotif('❌ Could not start the event — try again.'); return; }
    showNotif(`${def.emoji} You kicked off ${def.name} at ${loc.name}!`);
    closeWorldEvents();
  } catch (e) { showNotif('❌ Could not reach the server.'); }
}

function clearWorldEventDecor() { worldEventDecor.forEach(m => scene.remove(m)); worldEventDecor = []; }
function buildWorldEventDecor(ev) {
  clearWorldEventDecor();
  const { x, z, template, params } = ev.data;
  const add = (m) => { worldEventDecor.push(m); return m; };
  if (template === 'gathering') {
    add(box(6, 0.4, 4, 0x333344, x, 0.2, z));
    add(box(0.3, 3, 0.3, 0x222222, x - 3, 1.7, z - 2)); add(box(1, 1.5, 1, 0xffcc44, x - 3, 2.5, z - 2));
    add(box(0.3, 3, 0.3, 0x222222, x + 3, 1.7, z - 2)); add(box(1, 1.5, 1, 0xffcc44, x + 3, 2.5, z - 2));
  } else if (template === 'hazard') {
    const r = params.radius;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      add(box(0.4, 1.6, 0.4, 0xff4444, x + Math.cos(a) * r, 0.8, z + Math.sin(a) * r));
    }
  } else if (template === 'hostileFaction') {
    add(box(2, 2.6, 0.2, 0x3a1a1a, x, 1.3, z));
  }
}

// Robot meshes/colors are reused for event NPCs (same combat model as the
// Scrapyard) but each event id gets its own consistent-but-automatic color/shape
// via the same string-hash-to-appearance trick STV's channel art already uses —
// no need to hand-author 23 unique enemy designs for this to feel distinct.
function worldEventNpcLook(eventId) {
  let h = 5381;
  for (let i = 0; i < eventId.length; i++) h = (Math.imul(h, 33) ^ eventId.charCodeAt(i)) >>> 0;
  const shapes = ['drone', 'tank', 'spider', 'elite', undefined];
  return { color: h & 0xffffff, shape: shapes[h % shapes.length] };
}
function clearWorldEventNpcs() {
  worldEventNpcs.forEach(n => {
    if (!n.alive) return;
    scene.remove(n.mesh);
    const zi = CITY_ZONES.indexOf(n.zone); if (zi > -1) CITY_ZONES.splice(zi, 1);
    if (n.col) { const ci = CITY_COLS.indexOf(n.col); if (ci > -1) CITY_COLS.splice(ci, 1); }
  });
  worldEventNpcs = [];
}
function spawnWorldEventNpcs(ev) {
  clearWorldEventNpcs();
  const { x, z, params } = ev.data;
  const look = worldEventNpcLook(ev.type);
  for (let i = 0; i < params.count; i++) {
    const angle = (i / params.count) * Math.PI * 2, dist = 3 + Math.random() * 4;
    const nx = x + Math.cos(angle) * dist, nz = z + Math.sin(angle) * dist;
    const mesh = buildRobotMesh(nx, nz, look.color, look.shape);
    const col = addCol(CITY_COLS, nx, nz, 0.6, 0.6);
    const npc = { x: nx, z: nz, hp: params.npcHealth, maxHp: params.npcHealth, mesh, col, alive: true, zone: null };
    // r:8 (not the classic robot zones' r:2.8) - a MOVING player target during a fast-paced
    // event needs the same generous range item 184 already proved matters for PvP (looks
    // close on screen but tighter than it feels once a character model's real width counts)
    const zone = { x: nx, z: nz, r: 8, label: `${ev.data.emoji} Fight ${ev.data.name}`, action: () => fightWorldEventNpc(npc, ev) };
    npc.zone = zone;
    CITY_ZONES.push(zone);
    worldEventNpcs.push(npc);
  }
}
// Shared cleanup+reward path for a defeated event NPC — called both when the PLAYER lands the
// killing blow (fightWorldEventNpc) and, for Invasion Attempt specifically, when a defending
// Explox Citizen does (tickInvasionCombat), so citizen kills pay out exactly like the player's own.
function defeatWorldEventNpc(npc, ev) {
  npc.alive = false;
  scene.remove(npc.mesh);
  const zi = CITY_ZONES.indexOf(npc.zone); if (zi > -1) CITY_ZONES.splice(zi, 1);
  if (npc.col) { const ci = CITY_COLS.indexOf(npc.col); if (ci > -1) CITY_COLS.splice(ci, 1); }
  queueEarning(ev.data.params.rewardPerKill, 0, ev.data.name);
  sfx.boom();
}
function fightWorldEventNpc(npc, ev) {
  if (!npc.alive || !activeWorldEvent || activeWorldEvent.startedAt !== ev.startedAt) { showNotif('That fight is over.'); return; }
  const dmg = getRobotDamage();
  npc.hp -= dmg;
  triggerSwing(); sfx.clang();
  startKnockback(playerGroup.position.x, playerGroup.position.z, npc.x, npc.z,
    (x, z) => { npc.x = x; npc.z = z; npc.mesh.position.set(x, 0, z); });
  if (npc.hp > 0) {
    showNotif(`${ev.data.emoji} Hit for ${dmg}! (${npc.hp} HP left)`);
    // Invasion Attempt's invaders fight back through their own active tick (tickInvasionCombat)
    // instead of a free counter-hit on every player swing — the other 7 hostileFaction events stay
    // exactly as they were, still just passive counter-punchers.
    if (ev.type !== 'invasion-attempt') damagePlayer(ev.data.params.npcDamage, ev.data.name);
    return;
  }
  showNotif(`${ev.data.emoji} Defeated! +${ev.data.params.rewardPerKill} S.I.P. pending`);
  defeatWorldEventNpc(npc, ev);
}

// ─── INVASION ATTEMPT — real active combat, user's own ask: "make it so people attack us in our
// country" + "they attack but you have 40 alies they have 20." Deliberately NOT built on the
// shared spawnWorldEventNpcs()/fightWorldEventNpc() passive path the other 7 hostileFaction events
// keep using — reuses the exact War Territory active-combat pattern instead (buildWarCitizenMesh,
// fireWarShot, the WAR_TANK_*/WAR_ATTACK_*/WAR_CITIZEN_* constants) since that's the proven "two
// autonomous factions actively fight, the player joins in" template already built this session.
// Citizens do NOT auto-respawn here (unlike War Territories' 8s reinforcement) — a 150s event has
// a real end, not an ongoing siege, so losing citizens is a real, lasting cost for that one fight.
function spawnOneInvasionNpc(ev, isTank) {
  const { x, z } = ev.data;
  const angle = Math.random() * Math.PI * 2, dist = 5 + Math.random() * 18;
  const nx = x + Math.cos(angle) * dist, nz = z + Math.sin(angle) * dist;
  const color = isTank ? 0x3a4a2a : WAR_SOLDIER_COLORS[Math.floor(Math.random() * WAR_SOLDIER_COLORS.length)];
  const shape = isTank ? 'tank' : ['drone', 'spider', 'elite'][Math.floor(Math.random() * 3)];
  const mesh = buildRobotMesh(nx, nz, color, shape);
  if (isTank) mesh.scale.set(1.6, 1.6, 1.6);
  const gunLen = isTank ? 1.4 : 0.7;
  const gun = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, gunLen), new THREE.MeshLambertMaterial({ color: 0x222222 }));
  gun.position.set(0.4, isTank ? 1.1 : 1.7, 0.5);
  mesh.add(gun);
  const baseHp = ev.data.params.npcHealth;
  const hp = isTank ? Math.round(baseHp * WAR_TANK_HP_MULT) : baseHp;
  const npc = { hp, maxHp: hp, mesh, alive: true, zone: null, x: nx, z: nz, attackTimer: Math.random() * WAR_ATTACK_INTERVAL, isTank: !!isTank };
  const zone = { x: nx, z: nz, r: isTank ? 10 : 8, label: isTank ? `${ev.data.emoji} Fight the Invasion Tank` : `${ev.data.emoji} Fight ${ev.data.name}`, action: () => fightWorldEventNpc(npc, ev) };
  npc.zone = zone;
  CITY_ZONES.push(zone);
  worldEventNpcs.push(npc); // no addCol collider — these move, a fixed collider would leave a ghost wall behind
}
function spawnOneInvasionCitizen(ev) {
  const { x, z } = ev.data;
  const angle = Math.random() * Math.PI * 2, dist = 5 + Math.random() * 22;
  const nx = x + Math.cos(angle) * dist, nz = z + Math.sin(angle) * dist;
  const mesh = buildWarCitizenMesh(nx, nz);
  const hp = ev.data.params.npcHealth;
  invasionCitizens.push({ hp, maxHp: hp, mesh, alive: true, x: nx, z: nz, attackTimer: Math.random() * WAR_CITIZEN_ATTACK_INTERVAL });
}
function clearInvasionCitizens() {
  invasionCitizens.forEach(c => { if (c.alive) scene.remove(c.mesh); });
  invasionCitizens = [];
}
function defeatInvasionCitizen(c) {
  c.alive = false;
  scene.remove(c.mesh); // no respawn — see comment above
}
function spawnInvasionForces(ev) {
  clearWorldEventNpcs();
  clearInvasionCitizens();
  resetExploxWall();
  const tankCount = 2;
  for (let i = 0; i < ev.data.params.count - tankCount; i++) spawnOneInvasionNpc(ev, false);
  for (let i = 0; i < tankCount; i++) spawnOneInvasionNpc(ev, true);
  for (let i = 0; i < INVASION_CITIZEN_COUNT; i++) spawnOneInvasionCitizen(ev);
}
function tickInvasionCombat(dt) {
  if (!activeWorldEvent || activeWorldEvent.type !== 'invasion-attempt') return;
  const ev = activeWorldEvent;
  const wallUp = exploxWallHp > 0;
  worldEventNpcs.forEach(npc => {
    if (!npc.alive) return;
    if (wallUp) {
      // While the wall stands, EVERY invader's real target is the wall itself — the player and
      // citizens are fully out of reach of direct fire until it comes down.
      const dx = INVASION_SPOT.x - npc.x, dz = INVASION_SPOT.z - npc.z, dist = Math.hypot(dx, dz);
      const range = (npc.isTank ? WAR_TANK_ATTACK_RANGE : WAR_ATTACK_RANGE) + EXPLOX_WALL_RADIUS;
      if (dist < range) {
        npc.attackTimer += dt;
        if (npc.attackTimer > WAR_ATTACK_INTERVAL) {
          npc.attackTimer = 0;
          const dmg = npc.isTank ? Math.round(ev.data.params.npcDamage * WAR_TANK_DMG_MULT) : ev.data.params.npcDamage;
          exploxWallHp = Math.max(0, exploxWallHp - dmg);
          fireWarShot(npc.x, npc.isTank ? 1.4 : 1.7, npc.z, INVASION_SPOT.x, INVASION_SPOT.z);
          sfx.laser();
          if (exploxWallHp <= 0) { clearExploxWallMesh(); sfx.alarm(); showNotif('🧱💥 The Explox wall has been breached! Defend the city!'); }
        }
      } else {
        const speed = npc.isTank ? WAR_TANK_SPEED : WAR_SOLDIER_SPEED;
        npc.x += dx / dist * speed * dt; npc.z += dz / dist * speed * dt;
        npc.mesh.position.set(npc.x, 0, npc.z);
        npc.mesh.rotation.y = Math.atan2(dx, dz);
        npc.zone.x = npc.x; npc.zone.z = npc.z;
      }
      return;
    }
    let tx = playerGroup.position.x, tz = playerGroup.position.z, targetCitizen = null;
    let bestDist = Math.hypot(tx - npc.x, tz - npc.z);
    invasionCitizens.forEach(c => {
      if (!c.alive) return;
      const d = Math.hypot(c.x - npc.x, c.z - npc.z);
      if (d < bestDist) { bestDist = d; tx = c.x; tz = c.z; targetCitizen = c; }
    });
    const range = npc.isTank ? WAR_TANK_ATTACK_RANGE : WAR_ATTACK_RANGE;
    const dx = tx - npc.x, dz = tz - npc.z, dist = Math.hypot(dx, dz);
    if (dist < range) {
      npc.attackTimer += dt;
      if (npc.attackTimer > WAR_ATTACK_INTERVAL) {
        npc.attackTimer = 0;
        const dmg = npc.isTank ? Math.round(ev.data.params.npcDamage * WAR_TANK_DMG_MULT) : ev.data.params.npcDamage;
        fireWarShot(npc.x, npc.isTank ? 1.4 : 1.7, npc.z, tx, tz);
        sfx.laser();
        if (targetCitizen) { targetCitizen.hp -= dmg; if (targetCitizen.hp <= 0) defeatInvasionCitizen(targetCitizen); }
        else damagePlayer(dmg, npc.isTank ? 'an Invasion Tank' : 'an Invader');
      }
    } else {
      const speed = npc.isTank ? WAR_TANK_SPEED : WAR_SOLDIER_SPEED;
      npc.x += dx / dist * speed * dt; npc.z += dz / dist * speed * dt;
      npc.mesh.position.set(npc.x, 0, npc.z);
      npc.mesh.rotation.y = Math.atan2(dx, dz);
      npc.zone.x = npc.x; npc.zone.z = npc.z;
    }
  });
  invasionCitizens.forEach(c => {
    if (!c.alive) return;
    let target = null, bestDist = Infinity;
    worldEventNpcs.forEach(npc => { if (!npc.alive) return; const d = Math.hypot(npc.x - c.x, npc.z - c.z); if (d < bestDist) { bestDist = d; target = npc; } });
    if (!target) return;
    if (bestDist < WAR_CITIZEN_ATTACK_RANGE) {
      c.attackTimer += dt;
      if (c.attackTimer > WAR_CITIZEN_ATTACK_INTERVAL) {
        c.attackTimer = 0;
        fireWarShot(c.x, 1.7, c.z, target.x, target.z);
        sfx.laser();
        target.hp -= ev.data.params.npcDamage; // citizens hit exactly as hard as invaders — parity, same as the War Territory citizens
        if (target.hp <= 0) {
          showNotif(`🎖️ Explox Citizens took down an invader! +${ev.data.params.rewardPerKill} S.I.P. pending`);
          defeatWorldEventNpc(target, ev);
        }
      }
    } else {
      const dx = target.x - c.x, dz = target.z - c.z, d = Math.hypot(dx, dz);
      c.x += dx / d * WAR_CITIZEN_SPEED * dt; c.z += dz / d * WAR_CITIZEN_SPEED * dt;
      c.mesh.position.set(c.x, 0, c.z);
      c.mesh.rotation.y = Math.atan2(dx, dz);
    }
  });
}

function updateWorldEventBanner() {
  const el = document.getElementById('worldEventBanner');
  if (!el) return;
  if (!activeWorldEvent) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  const secsLeft = Math.max(0, Math.ceil(activeWorldEvent.endsAt - Date.now() / 1000));
  document.getElementById('worldEventBannerText').textContent =
    `${activeWorldEvent.data.emoji} ${activeWorldEvent.data.name} at ${activeWorldEvent.data.locName || 'the city'} — ${secsLeft}s left`;
}

async function syncWorldEvent() {
  if (serverMode !== 'online' || !currentUser) return;
  try {
    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/event', {}, 4000);
    if (!r.ok) return;
    const ev = await r.json();
    const prev = activeWorldEvent;
    const changed = (ev && (!prev || prev.startedAt !== ev.startedAt)) || (!ev && prev);
    activeWorldEvent = ev;
    if (changed) {
      const survivedHazard = prev && prev.data.template === 'hazard' && !ev && playerHealth > 0;
      clearWorldEventDecor();
      clearWorldEventNpcs();
      clearInvasionCitizens();
      clearExploxWallMesh();
      clearWorldEventCrowd();
      worldEventGatherAccum = 0; worldEventHazardAccum = 0;
      if (ev) {
        showNotif(`${ev.data.emoji} ${ev.data.name} started at ${ev.data.locName || 'the city'}!${ev.startedBy === currentUser ? '' : ' Started by ' + ev.startedBy + '.'}`);
        buildWorldEventDecor(ev);
        if (ev.type === 'invasion-attempt') spawnInvasionForces(ev);
        else if (ev.data.template === 'hostileFaction') spawnWorldEventNpcs(ev);
        if (ev.type === 'concert') {
          spawnConcertCrowd(ev.data.x, ev.data.z);
          bgMusic.switchTrack(Math.floor(Math.random()*bgMusic.TRACKS.length));
        }
      } else if (prev) {
        showNotif(`The ${prev.data.name} event ended.`);
        if (survivedHazard) {
          queueEarning(prev.data.params.rewardOnSurvive, 0, `Survived ${prev.data.name}`);
          showNotif(`🎉 You survived ${prev.data.name}! +${prev.data.params.rewardOnSurvive} S.I.P. pending`);
        }
      }
    }
    updateWorldEventBanner();
  } catch (e) { /* next sync will catch up */ }
}

// ─── WAR — permanently capture the 9 named countries for Explox ──────────────
// User: "your country(explox) vs others", capture territory, "bigger and longer"
// than a timed World Event. Real, permanent, persisted server-side (like land/
// shops, not ephemeral like presence/events) so progress adds up across many
// separate sessions and everyone online contributes to the same fight. Reuses
// the exact same robot-combat pattern as World Events' hostileFaction (built
// Scrapyard-mesh NPCs, press-E-in-range, counter-damage, defeat = reward) —
// the only new piece is the server tracking a persistent kill count per
// territory and flipping it to permanently captured once the count is reached.
const WAR_TERRITORIES = [
  { name:'Japan',         x:COUNTRY_CENTERS.Japan.x,          z:COUNTRY_CENTERS.Japan.z,          killsNeeded:15, npcCount:4, npcHealth:55, npcDamage:12, rewardPerKill:20, captureBonus:300 },
  { name:'France',        x:COUNTRY_CENTERS.France.x,         z:COUNTRY_CENTERS.France.z,         killsNeeded:15, npcCount:4, npcHealth:55, npcDamage:12, rewardPerKill:20, captureBonus:300 },
  { name:'Brazil',        x:COUNTRY_CENTERS.Brazil.x,         z:COUNTRY_CENTERS.Brazil.z,         killsNeeded:15, npcCount:4, npcHealth:55, npcDamage:12, rewardPerKill:20, captureBonus:300 },
  { name:'Egypt',         x:COUNTRY_CENTERS.Egypt.x,          z:COUNTRY_CENTERS.Egypt.z,          killsNeeded:15, npcCount:4, npcHealth:55, npcDamage:12, rewardPerKill:20, captureBonus:300 },
  { name:'UK',            x:COUNTRY_CENTERS.UK.x,             z:COUNTRY_CENTERS.UK.z,             killsNeeded:15, npcCount:4, npcHealth:55, npcDamage:12, rewardPerKill:20, captureBonus:300 },
  { name:'Australia',     x:COUNTRY_CENTERS.Australia.x,      z:COUNTRY_CENTERS.Australia.z,      killsNeeded:15, npcCount:4, npcHealth:55, npcDamage:12, rewardPerKill:20, captureBonus:300 },
  { name:'Canada',        x:COUNTRY_CENTERS.Canada.x,         z:COUNTRY_CENTERS.Canada.z,         killsNeeded:15, npcCount:4, npcHealth:55, npcDamage:12, rewardPerKill:20, captureBonus:300 },
  { name:'Italy',         x:COUNTRY_CENTERS.Italy.x,          z:COUNTRY_CENTERS.Italy.z,          killsNeeded:15, npcCount:4, npcHealth:55, npcDamage:12, rewardPerKill:20, captureBonus:300 },
  { name:'Space Station', x:COUNTRY_CENTERS['Space Station'].x, z:COUNTRY_CENTERS['Space Station'].z, killsNeeded:20, npcCount:5, npcHealth:70, npcDamage:15, rewardPerKill:25, captureBonus:400 },
];
const WAR_ROOM_SPOT = { x: ARENA_CENTER.x, z: ARENA_CENTER.z - 60 }; // just outside the arena's sand, same neighborhood thematically

// User's follow-up ask: "war needs to be like the other country attacks you guns tanks and more
// their citizens also attack same as yours" — territory defenders used to be pure passive
// counter-punchers standing still forever; a real Tank unit joins each territory's soldiers, both
// sides are actively armed (see fireWarShot's tracer), and defenders now chase+shoot whichever is
// closer: the player or a real Explox Citizen ally (see tickWarCombat below).
const WAR_TANK_HP_MULT = 3, WAR_TANK_DMG_MULT = 1.8;
const WAR_SOLDIER_SPEED = 3.5, WAR_TANK_SPEED = 1.8;
const WAR_ATTACK_RANGE = 13, WAR_TANK_ATTACK_RANGE = 16, WAR_ATTACK_INTERVAL = 1.6;
const WAR_CITIZEN_SPEED = 3.5, WAR_CITIZEN_ATTACK_RANGE = 12, WAR_CITIZEN_ATTACK_INTERVAL = 1.6;

let territoryState = {};   // synced from server: {name: {captured, kills, capturedBy}}
let _lastTerritorySync = -999;
const TERRITORY_SYNC_INTERVAL = 5;
// ─── BOSSES — real, huge enemies with a SHARED health pool tracked on the server (via
// /api/bosses, same "server just tracks the counter, client owns the config" split as
// territories) so co-op damage from different real players' clients actually adds up
// against one real total. Works solo too — offline (or if the server hit fails) resolves
// entirely with a local copy instead, so "fight alone" never requires anyone else online. ──
// User's own ask: "add multiple bosses to fight in different areas and certaint level to fight
// a boss" — grew from 2 to 6, spread across real named spots already on the map (the Dump, the
// Canada/Egypt/Space Station War Territories) instead of two isolated coordinates nobody else
// uses, plus a real `minLevel` gate per boss (checked against the player's existing Robot Level —
// `eliteLevel`, the only real player-progression level this game already has, see item ~199's
// "spend Elite Coins to level up" system). A boss still chases and attacks ANYONE regardless of
// level — the gate only blocks fightBoss() from letting an under-leveled player actually damage
// it back, so wandering into a high-level boss's area early is genuinely dangerous, not a wall.
// Each boss shape id below (the 'boss-*' prefix) is its own hand-built silhouette in
// buildBossMesh() — bosses used to just call buildRobotMesh() with the SAME shape strings as
// the small rogue robots ('tank'/'spider'/'elite'/'drone'/'guard') scaled up 3.2x, so a boss
// was literally just a giant regular robot. User's own ask: make them look different from the
// robots, not just bigger. No shared geometry with buildRobotMesh() anymore — every boss has a
// silhouette a robot enemy could never have (a mech isn't just a big Tank Bot, a serpent isn't
// just a big Drone Bot, etc).
const BOSS_DEFS = [
  { name:'Mega-Bot', emoji:'🤖', x: SCRAPYARD_CENTER.x, z: SCRAPYARD_CENTER.z+55, maxHp:3000, damage:22, minLevel:0,
    color:0xaa2222, shape:'boss-mech', sipReward:[400,600], eliteReward:50, hitSip:2, hitElite:0 },
  { name:'Storm Titan', emoji:'⚡', x:-650, z:650, maxHp:2500, damage:18, minLevel:0,
    color:0x3355cc, shape:'boss-titan', sipReward:[350,550], eliteReward:40, hitSip:2, hitElite:0 },
  { name:'Scrap King', emoji:'🗑️', x: DUMP_CENTER.x+40, z: DUMP_CENTER.z-20, maxHp:2000, damage:16, minLevel:0,
    color:0x778833, shape:'boss-scrapking', sipReward:[250,400], eliteReward:30, hitSip:2, hitElite:0 },
  // These 3 bosses stand right next to their thematically-matching country (ice guard/Canada,
  // desert guard/Egypt, cosmic guard/Space Station) — moved in lockstep with item ~234's 20x
  // country resize (same old-offset-from-old-center, ×20, applied to the new center) so they
  // don't end up guarding empty ground where the country used to be.
  { name:'Frost Colossus', emoji:'❄️', x:-7520, z:3540, maxHp:4000, damage:26, minLevel:1,
    color:0x66ccff, shape:'boss-frost', sipReward:[500,750], eliteReward:60, hitSip:2, hitElite:0 },
  { name:'Sahara Golem', emoji:'🏜️', x:6930, z:5940, maxHp:5000, damage:30, minLevel:2,
    color:0xd2a679, shape:'boss-golem', sipReward:[650,900], eliteReward:75, hitSip:3, hitElite:0 },
  { name:'Void Serpent', emoji:'🌌', x:-3200, z:7730, maxHp:6000, damage:36, minLevel:3,
    color:0x440088, shape:'boss-serpent', sipReward:[800,1200], eliteReward:100, hitSip:3, hitElite:1 },
];
let bossState  = {}; // name -> {hp, maxHp, alive, level, defeats} — local mirror, synced from the server when online
let bossMeshes = {}; // name -> {mesh, col}
let currentNearBoss = null;
let _lastBossSync = -999;
let _lastEarningsCheck = -999;
const BOSS_SYNC_INTERVAL = 5;
function initBossState() {
  BOSS_DEFS.forEach(def => { if (!bossState[def.name]) bossState[def.name] = { hp: def.maxHp, maxHp: def.maxHp, alive: true, level: 0, defeats: 0, attackTimer: 0, curX: def.x, curZ: def.z, aggro: false }; });
}
// A leveled-up boss hits harder too, same +20%-per-level formula as its HP — but capped at 3x
// base (level 10+), or a level 50 boss would deal ~200 damage a swing and one-shot-kill anyone
// through a full health bar. HP keeps scaling forever (a high-level boss is meant to be a real
// long fight), damage dealt is deliberately a different, capped curve so it stays survivable
// no matter how high the level climbs.
function bossHitDamage(def, st) { return Math.round(def.damage * Math.min(3, 1 + (st.level||0)*0.2)); }
// User's own ask: "the boss needs to do more than just stand and attack it needs to chase you
// until you die quit or win." A boss used to be a fixed statue that only ever hit back as a
// counter-attack (and later, once it got its own timer, still never actually MOVED from its
// spawn spot). Now it has a real live position (bossState[name].curX/curZ, separate from its
// fixed BOSS_DEFS home spot) and genuinely gives chase — same "close the real distance" style
// tickRogueRobots() uses, just gated by three real end conditions instead of running forever:
// WIN (you defeat it — alive flips false, handled in fightBoss/syncBosses), DIE (knockoutPlayer's
// default branch below calls resetAllBossAggro(), snapping every boss back home), and QUIT (get
// far enough away — BOSS_DEAGGRO_RANGE — and it gives up and walks back to its post itself).
const BOSS_DETECT_RANGE = 20, BOSS_DEAGGRO_RANGE = 55, BOSS_ATTACK_RANGE = 6, BOSS_ATTACK_INTERVAL = 1.8;
const BOSS_CHASE_SPEED = 9.5; // faster than the player's 8 walk speed, slower than 14.8 run — outrunnable, not out-walkable
function tickBossChase(dt) {
  if (!inHouse && !inMall && !inHotel && !inStore && !inFriendHouse && !inLandHouse && !inCountryHotel && !inAirportLounge && !inPrison && !inArcade && !inCar && !inArenaBattle && !inMovieFight && !inBankInterior && !inSportsPark && !inHospital && !inSea) {
    BOSS_DEFS.forEach(def => {
      const st = bossState[def.name];
      if (!st || !st.alive) return;
      const bm = bossMeshes[def.name]; if (!bm) return;
      const dx = playerGroup.position.x-st.curX, dz = playerGroup.position.z-st.curZ;
      const dist = Math.hypot(dx,dz);
      if (!st.aggro && dist <= BOSS_DETECT_RANGE) st.aggro = true;
      if (st.aggro && dist > BOSS_DEAGGRO_RANGE) { st.aggro = false; showNotif(`${def.emoji} ${def.name} gives up the chase!`); }
      if (st.aggro) {
        if (dist > BOSS_ATTACK_RANGE) {
          st.attackTimer = 0;
          st.curX += dx/dist*BOSS_CHASE_SPEED*dt; st.curZ += dz/dist*BOSS_CHASE_SPEED*dt;
          bm.mesh.rotation.y = Math.atan2(dx, dz);
        } else {
          st.attackTimer += dt;
          if (st.attackTimer >= BOSS_ATTACK_INTERVAL) {
            st.attackTimer = 0;
            damagePlayer(bossHitDamage(def, st), def.name);
            showNotif(`${def.emoji} ${def.name} attacks!`);
          }
        }
      } else {
        // Given up (or never aggroed) — walk itself back to its own home spot instead of
        // freezing wherever it happens to be, same as a real guard returning to its post.
        const hx = def.x-st.curX, hz = def.z-st.curZ, hd = Math.hypot(hx,hz);
        if (hd > 0.5) { st.curX += hx/hd*BOSS_CHASE_SPEED*dt; st.curZ += hz/hd*BOSS_CHASE_SPEED*dt; bm.mesh.rotation.y = Math.atan2(hx, hz); }
      }
      bm.mesh.position.set(st.curX, 0, st.curZ);
      if (bm.light) bm.light.position.set(st.curX, 8, st.curZ);
    });
  }
}
// Called on a real player knockout (see knockoutPlayer's default branch) — the chase is truly
// over, so every currently-chasing boss snaps back to its post rather than resuming the hunt
// the instant the player wakes up somewhere across the map.
function resetAllBossAggro() {
  BOSS_DEFS.forEach(def => {
    const st = bossState[def.name]; if (!st) return;
    st.aggro = false; st.attackTimer = 0; st.curX = def.x; st.curZ = def.z;
    const bm = bossMeshes[def.name];
    if (bm) { bm.mesh.position.set(def.x, 0, def.z); if (bm.light) bm.light.position.set(def.x, 8, def.z); }
  });
}

// ─── WRATH — the real consequence for crossing 100 real kills (Killers/Robbers/Hire a Killer —
// see totalKills++ at each of those call sites). Unlike a Boss, Wrath has no BOSS_DEAGGRO_RANGE
// and can't be fought back — it's a punishment to survive, not a fight to win. "and attacks
// untill you die" — the chase only ever ends in knockoutPlayer(), never by outrunning it. God is
// only ever the one judging here, never the one being fought — see checkWrathTrigger().
const WRATH_KILL_THRESHOLD = 100;
const WRATH_BASE_DMG = 20, WRATH_SPEED = 10.5, WRATH_ATTACK_RANGE = 3, WRATH_ATTACK_INTERVAL = 1.2;
const WRATH_SIP_PENALTY = 10000, WRATH_ELITE_PENALTY = 100000;
let wrath = null; // {mesh, curX, curZ, attackTimer}
function checkWrathTrigger() {
  // "gets worse the more you kill" — re-triggerable every further WRATH_KILL_THRESHOLD kills,
  // each one hitting harder (see the dmg scaling in tickWrath below).
  if (totalKills >= WRATH_KILL_THRESHOLD * (wrathTriggerCount + 1)) triggerWrath();
}
function triggerWrath() {
  if (wrathActive || !playerGroup) return;
  wrathActive = true; wrathTriggerCount++;
  showNotif('🩸 The sky turns blood red... something terrible has come for you.');
  const ang = Math.random()*Math.PI*2, dist = 30;
  const x = playerGroup.position.x + Math.cos(ang)*dist, z = playerGroup.position.z + Math.sin(ang)*dist;
  wrath = { mesh: buildWrathMesh(x,z), curX:x, curZ:z, attackTimer:0 };
}
function tickWrath(dt) {
  if (!wrathActive || !wrath || !playerGroup) return;
  // Same "can't reach you through a wall/interior" gate every other outdoor threat already uses.
  if (inHouse || inMall || inHotel || inStore || inFriendHouse || inLandHouse || inCountryHotel || inAirportLounge || inPrison || inArcade || inCar || inArenaBattle || inMovieFight || inBankInterior || inSportsPark || inHospital || inSea) return;
  const dx = playerGroup.position.x-wrath.curX, dz = playerGroup.position.z-wrath.curZ, dist = Math.hypot(dx,dz);
  if (dist > WRATH_ATTACK_RANGE) {
    wrath.attackTimer = 0;
    wrath.curX += dx/dist*WRATH_SPEED*dt; wrath.curZ += dz/dist*WRATH_SPEED*dt;
    wrath.mesh.rotation.y = Math.atan2(dx,dz);
  } else {
    wrath.attackTimer += dt;
    if (wrath.attackTimer >= WRATH_ATTACK_INTERVAL) {
      wrath.attackTimer = 0;
      damagePlayer(WRATH_BASE_DMG + (wrathTriggerCount-1)*5, 'a shadow of judgment');
      // That hit may have just killed the player — knockoutPlayer() already called
      // endWrathAfterDeath() synchronously inside damagePlayer() above, tearing wrath down
      // (wrath is now null). Bail out before touching it below.
      if (!wrathActive) return;
    }
  }
  wrath.mesh.position.set(wrath.curX, 0, wrath.curZ);
}
// Called from knockoutPlayer() — the punishment lands, then "everyone will bow and will get rid
// of all evil entities for 2 days": every Killer/Robber alive right now is gone, and none spawn
// again until safePeriodEndsAt (see evilSpawnMultiplier() in game-land.js).
function endWrathAfterDeath() {
  wrathActive = false;
  if (wrath) { scene.remove(wrath.mesh); wrath = null; }
  // "and if he wins the world in bad hand" — this IS that price: real, clamped so it can't go
  // negative on an account that already can't afford it.
  const lostSip = Math.min(sipDollars, WRATH_SIP_PENALTY);
  const lostElite = Math.min(eliteCoins, WRATH_ELITE_PENALTY);
  sipDollars -= lostSip; eliteCoins -= lostElite;
  updateSIP(); updateElite();
  killers.forEach(k => { if (k.mesh) scene.remove(k.mesh); });
  killers.length = 0;
  safePeriodEndsAt = Date.now() + 2*DAY_LENGTH*1000; // "for 2 days" — 2 real in-game days
  satanBadUntil = 0; satanCheckTimer = 0;
  showNotif(`⚡ Struck down for your sins — lost ${lostSip.toLocaleString()} S.I.P. and ${lostElite.toLocaleString()} 💎.`);
  setTimeout(() => showNotif('🙏 The world bows — every Killer and Robber is gone, and none will return for 2 days...'), 2200);
}
function buildWrathMesh(x, z) {
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  const darkMat = new THREE.MeshBasicMaterial({color:0x0a0005});
  const eyeMat = new THREE.MeshBasicMaterial({color:0xff0000});
  const robe = new THREE.Mesh(new THREE.ConeGeometry(1.3,3.4,8), darkMat); robe.position.y=1.9; g.add(robe);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.55,8,8), darkMat); head.position.y=3.9; g.add(head);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.09,6,6), eyeMat); eyeL.position.set(-0.2,3.95,0.45); g.add(eyeL);
  const eyeR = eyeL.clone(); eyeR.position.x=0.2; g.add(eyeR);
  const pl = new THREE.PointLight(0xff2222, 2.5, 14); pl.position.y=3; g.add(pl);
  [-1,1].forEach(side => {
    const wing = new THREE.Mesh(new THREE.ConeGeometry(0.5,2.2,4), darkMat);
    wing.position.set(side*1.1,2.4,-0.3); wing.rotation.z = side*0.9; wing.rotation.x = 0.3; g.add(wing);
  });
  return g;
}

// ─── SATAN — during the cleansing period, sometimes "satan attack god nnot us" — never the
// player directly. Most rounds God holds; if Satan wins this round, "the world in bad hand": 5x
// Killers/Robbers (as real demons — see demonizeMesh() in game-land.js), a black sky, and worse
// rewards from beating them (see the badLuck checks in defeatKiller/defeatRobber), until it passes.
const SATAN_CHECK_INTERVAL = 300;  // real seconds between rolls, only while the cleansing period is active
const SATAN_ATTACK_CHANCE  = 0.20; // "20 present of this time" Satan attacks at all, per roll
const SATAN_WIN_CHANCE     = 0.25; // of those attacks, how often Satan actually wins
const SATAN_BAD_DURATION   = 600;  // real seconds the bad outcome lasts if Satan wins
function tickSatanEvent(dt) {
  const now = Date.now();
  if (now >= safePeriodEndsAt) return; // no cleansing period active right now — nothing for Satan to attack
  if (now < satanBadUntil) return; // already mid-bad-window — let it run its course
  satanCheckTimer += dt;
  if (satanCheckTimer < SATAN_CHECK_INTERVAL) return;
  satanCheckTimer = 0;
  if (Math.random() >= SATAN_ATTACK_CHANCE) return; // no attack this round
  if (Math.random() < SATAN_WIN_CHANCE) {
    satanBadUntil = now + SATAN_BAD_DURATION*1000;
    startDivineClash('satan');
  } else {
    startDivineClash('god');
  }
}
// "you can see him fight" — an abstract light-vs-shadow clash over the Church, never a literal
// God/Satan character to hit or click on (that would cross the same line as fighting God
// directly). Two beams push toward the center over CLASH_DURATION_MS; whichever side the roll
// already decided (see tickSatanEvent above) visibly wins the push, so the notif at the end
// matches what you just watched happen instead of coming out of nowhere.
const CLASH_DURATION_MS = 6000;
const CLASH_POS = new THREE.Vector3(-40, 34, 20); // above the real Church building (game-buildings.js)
let divineClash = null; // {startTime, outcome, lightMesh, darkMesh, glow}
function startDivineClash(outcome) {
  if (divineClash) { scene.remove(divineClash.lightMesh); scene.remove(divineClash.darkMesh); scene.remove(divineClash.glow); }
  const lightMesh = new THREE.Mesh(new THREE.ConeGeometry(2.2,16,8), new THREE.MeshBasicMaterial({color:0xFFD700, transparent:true, opacity:0.8}));
  lightMesh.rotation.z = Math.PI/2; lightMesh.position.copy(CLASH_POS).add(new THREE.Vector3(-7,0,0)); scene.add(lightMesh);
  const darkMesh = new THREE.Mesh(new THREE.ConeGeometry(2.2,16,8), new THREE.MeshBasicMaterial({color:0x220022, transparent:true, opacity:0.8}));
  darkMesh.rotation.z = -Math.PI/2; darkMesh.position.copy(CLASH_POS).add(new THREE.Vector3(7,0,0)); scene.add(darkMesh);
  const glow = new THREE.PointLight(outcome==='god' ? 0xFFD700 : 0x880000, 3, 60);
  glow.position.copy(CLASH_POS); scene.add(glow);
  divineClash = { startTime: Date.now(), outcome, lightMesh, darkMesh, glow };
  showNotif('⚡ Light and shadow clash in the sky above the Church...');
}
function tickDivineClash() {
  if (!divineClash) return;
  const elapsed = Date.now() - divineClash.startTime;
  const t = Math.min(1, elapsed / CLASH_DURATION_MS);
  const push = (divineClash.outcome === 'god' ? 1 : -1) * t * 6;
  divineClash.lightMesh.position.x = CLASH_POS.x - 7 + push;
  divineClash.darkMesh.position.x = CLASH_POS.x + 7 + push;
  divineClash.glow.intensity = 3 + t*3;
  if (elapsed >= CLASH_DURATION_MS) {
    scene.remove(divineClash.lightMesh); scene.remove(divineClash.darkMesh); scene.remove(divineClash.glow);
    const outcome = divineClash.outcome;
    divineClash = null;
    showNotif(outcome==='god' ? '✨ The light held. The world stays safe... for now.' : '🔥 Satan has struck down the light — the world is in bad hands for a while...');
  }
}

// "more people go there in the safe period" — real extra NPCs (the same makeNPC()/patrol system
// every other NPC in the city already uses, not a decorative stand-in), drawn to the Church while
// it's a safe/blessed time. Tracked separately from the permanent NPC_DEFS roster so they can be
// cleanly added/removed without touching anyone else in npcs[].
let churchWorshippers = [];
let churchWorshippersActive = false;
const WORSHIPPER_NAMES = ['Grace','Faith','Noah','Hope','Eli','Ruth','Amos','June'];
function tickChurchWorshippers() {
  const active = Date.now() < safePeriodEndsAt;
  if (active && !churchWorshippersActive) { churchWorshippersActive = true; spawnChurchWorshippers(); }
  else if (!active && churchWorshippersActive) { churchWorshippersActive = false; clearChurchWorshippers(); }
}
function spawnChurchWorshippers() {
  clearChurchWorshippers();
  const n = 4 + Math.floor(Math.random()*3);
  const shirts = [0x8899aa,0x776655,0x557766,0x887766,0x665577];
  for (let i=0; i<n; i++) {
    const ang = Math.random()*Math.PI*2, r = 6+Math.random()*8;
    const x = -40+Math.cos(ang)*r, z = 20+Math.sin(ang)*r;
    const w = makeNPC({
      name: WORSHIPPER_NAMES[i % WORSHIPPER_NAMES.length], role: 'Worshipper',
      skin: 0xf5c89a, shirt: shirts[i % shirts.length], pants: 0x333333, hairColor: 0x3a1f0a, hair: 'short',
      pos: [x,0,z], patrol: [[x,z],[x+3,z+2],[x-2,z+3]]
    });
    w.isWorshipper = true;
    npcs.push(w);
    churchWorshippers.push(w);
  }
}
function clearChurchWorshippers() {
  churchWorshippers.forEach(w => {
    const i = npcs.indexOf(w);
    if (i > -1) npcs.splice(i,1);
    scene.remove(w.group);
  });
  churchWorshippers = [];
}
// One hand-built silhouette per boss — deliberately NOT reusing buildRobotMesh()'s shapes (a
// boss used to just be a 3.2x-scaled Tank/Spider/Elite/Drone/Guard Bot, same geometry as the
// small rogue robots you fight everywhere else). Each shape here is something no regular robot
// enemy has: a bipedal war-mech instead of a treaded box, a limbless energy titan instead of an
// armored humanoid, a segmented snake instead of a sphere-and-ring drone, etc.
function buildBossMesh(x, z, color, shape) {
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  const eyeMat = new THREE.MeshBasicMaterial({color:0xff3333});

  if (shape === 'boss-mech') { // Mega-Bot — bipedal war-mech, not Tank Bot's treaded box
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.9,1.5,1.3), mat(color)); torso.position.y=1.9; g.add(torso);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.3,8,6), new THREE.MeshBasicMaterial({color:0xffcc44})); core.position.set(0,1.9,0.68); g.add(core);
    const pl = new THREE.PointLight(0xffcc44, 1.2, 8); pl.position.set(0,1.9,0.7); g.add(pl);
    [[-1.15,2.3],[1.15,2.3]].forEach(([sx,sy]) => { const p=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.5,0.9), mat(0x333333)); p.position.set(sx,sy,0); g.add(p); });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.75,0.4,0.6), mat(0x1a1a1a)); head.position.y=2.75; g.add(head);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.08,0.05), eyeMat); visor.position.set(0,2.75,0.33); g.add(visor);
    [[-0.6,1.3],[0.6,1.3]].forEach(([ax,ay]) => { const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.28,1.5,8), mat(0x2a2a2a)); arm.position.set(ax,ay,0); g.add(arm);
      const fist=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.4,0.4), mat(color)); fist.position.set(ax,ay-0.85,0); g.add(fist); });
    [[-0.55,0],[0.55,0]].forEach(([lx]) => { const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.38,1.6,8), mat(0x2a2a2a)); leg.position.set(lx,0.8,0); g.add(leg);
      const foot=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.3,0.85), mat(0x1a1a1a)); foot.position.set(lx,0.05,0.15); g.add(foot); });
    return g;
  }
  if (shape === 'boss-titan') { // Storm Titan — floating energy giant, not Elite Bot's armored body
    const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85,0), new THREE.MeshBasicMaterial({color, transparent:true, opacity:0.85})); coreMesh.position.y=2.3; g.add(coreMesh);
    const pl = new THREE.PointLight(0x88bbff, 2, 12); pl.position.y=2.3; g.add(pl);
    [[0.05,0.9,1.05],[0.35,1.15,0.85],[-0.2,1.25,0.7]].forEach(([rx,ry,scale],i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(scale,0.06,6,16), new THREE.MeshBasicMaterial({color:0xaaddff})); ring.position.y=2.3; ring.rotation.set(rx+i,ry,0); g.add(ring);
    });
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.35,0.9,6), mat(0xccebff)); spike.position.y=3.5; g.add(spike);
    [-1,1].forEach(side => { // jagged lightning-bolt limbs instead of straight rectangular arms
      const seg1 = new THREE.Mesh(new THREE.BoxGeometry(0.22,0.7,0.2), new THREE.MeshBasicMaterial({color:0xccebff})); seg1.position.set(side*0.95,1.9,0); seg1.rotation.z=side*0.5; g.add(seg1);
      const seg2 = new THREE.Mesh(new THREE.BoxGeometry(0.18,0.6,0.18), new THREE.MeshBasicMaterial({color:0xccebff})); seg2.position.set(side*1.35,1.25,0); seg2.rotation.z=side*-0.4; g.add(seg2);
    });
    return g;
  }
  if (shape === 'boss-scrapking') { // Scrap King — lumpy junk-pile arachnid, not Spider Bot's smooth sphere
    [[0,1.15,0.6,0],[0.35,1.35,0.4,0.5],[-0.3,1.4,0.35,-0.4],[0,0.95,0.45,0.2]].forEach(([bx,by,s,rz]) => {
      const chunk = new THREE.Mesh(new THREE.BoxGeometry(s*1.6,s*1.3,s*1.4), mat(color)); chunk.position.set(bx,by,0); chunk.rotation.z=rz; g.add(chunk);
    });
    for (let i=0;i<3;i++) { const spike=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.5,5), mat(0x554422)); spike.position.set((i-1)*0.35,1.95,-0.1); spike.rotation.z=(i-1)*0.3; g.add(spike); }
    [[-0.18,1.4,0.6],[0.05,1.42,0.62],[0.28,1.38,0.58]].forEach(([ex,ey,ez]) => { const eye=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.05), eyeMat); eye.position.set(ex,ey,ez); g.add(eye); });
    for (let i=0; i<8; i++) { // 8 uneven legs, not 6 matched ones — genuinely scrappy, not symmetric
      const ang = (i/8)*Math.PI*2;
      const len = 0.85 + (i%3)*0.15;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.05,len,4), mat(0x3a3a3a));
      leg.position.set(Math.cos(ang)*0.6, 0.6, Math.sin(ang)*0.6);
      leg.rotation.z = Math.cos(ang)*0.9; leg.rotation.x = Math.sin(ang)*0.9;
      g.add(leg);
    }
    return g;
  }
  if (shape === 'boss-frost') { // Frost Colossus — faceted ice crystal, not Tank Bot's boxy treads
    const iceMat = new THREE.MeshBasicMaterial({color, transparent:true, opacity:0.88});
    const torso = new THREE.Mesh(new THREE.OctahedronGeometry(1.05,0), iceMat); torso.position.y=1.9; g.add(torso);
    const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.5,0), iceMat); head.position.y=3.0; g.add(head);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.05), new THREE.MeshBasicMaterial({color:0x1155aa})); eyeL.position.set(-0.18,3.0,0.35); g.add(eyeL);
    const eyeR = eyeL.clone(); eyeR.position.x = 0.18; g.add(eyeR);
    [[-1.0,2.3,0.6],[1.0,2.3,-0.5],[0,3.5,0.2]].forEach(([sx,sy,rz]) => { const spike=new THREE.Mesh(new THREE.ConeGeometry(0.25,1.0,6), iceMat); spike.position.set(sx,sy,0); spike.rotation.z=rz; g.add(spike); });
    [[-0.6,0],[0.6,0]].forEach(([lx]) => { const leg=new THREE.Mesh(new THREE.ConeGeometry(0.5,1.4,6), iceMat); leg.position.set(lx,0.7,0); leg.rotation.x=Math.PI; g.add(leg); });
    const pl = new THREE.PointLight(0xaaddff, 1, 10); pl.position.y=2; g.add(pl);
    return g;
  }
  if (shape === 'boss-golem') { // Sahara Golem — stacked sandstone blocks, not the default smooth humanoid
    const stackMat = new THREE.MeshBasicMaterial({color});
    [[0,0.55,1.5,1.3,0.08],[0,1.5,1.25,1.0,-0.06],[0,2.3,0.95,0.75,0.09]].forEach(([bx,by,w,h,rz]) => {
      const block = new THREE.Mesh(new THREE.BoxGeometry(w,h,0.95), stackMat); block.position.set(bx,by,0); block.rotation.z=rz; g.add(block);
    });
    const runeMat = new THREE.MeshBasicMaterial({color:0xffaa33});
    [1.0,1.7,2.4].forEach(ry => { const rune=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.06,0.05), runeMat); rune.position.set(0,ry,0.5); g.add(rune); });
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.35,0.06), runeMat); face.position.set(0,2.35,0.5); g.add(face);
    const pl = new THREE.PointLight(0xffaa33, 1, 8); pl.position.set(0,1.6,0.6); g.add(pl);
    [[-0.55,0],[0.55,0]].forEach(([lx]) => { const leg=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.7), stackMat); leg.position.set(lx,0.3,0); g.add(leg); });
    return g;
  }
  if (shape === 'boss-serpent') { // Void Serpent — a real segmented snake, not Drone Bot's sphere+ring
    const segMat = new THREE.MeshBasicMaterial({color});
    const segCount = 6;
    for (let i=0; i<segCount; i++) {
      const t = i/(segCount-1);
      const segSize = 0.75 - t*0.4;
      const seg = new THREE.Mesh(new THREE.SphereGeometry(segSize,8,6), segMat);
      seg.position.set(Math.sin(t*Math.PI*1.3)*1.4, 1.8 + Math.cos(t*Math.PI*1.6)*0.5, -t*2.6+1.3);
      g.add(seg);
      if (i>0 && i%2===0) { const ring=new THREE.Mesh(new THREE.TorusGeometry(segSize+0.15,0.05,6,12), new THREE.MeshBasicMaterial({color:0xcc88ff})); ring.position.copy(seg.position); ring.rotation.x=Math.PI/2; g.add(ring); }
    }
    const headPos = new THREE.Vector3(0, 1.8, 1.3);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.85,10,8), segMat); head.position.copy(headPos); g.add(head);
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.12,6,6), eyeMat); eyeL.position.set(-0.35,1.95,1.85); g.add(eyeL);
    const eyeR = eyeL.clone(); eyeR.position.x = 0.35; g.add(eyeR);
    const jaw = new THREE.Mesh(new THREE.ConeGeometry(0.3,0.6,6), segMat); jaw.position.set(0,1.55,1.95); jaw.rotation.x=Math.PI/2; g.add(jaw);
    const pl = new THREE.PointLight(0xcc88ff, 1.5, 10); pl.position.copy(headPos); g.add(pl);
    return g;
  }
  return buildRobotMesh(x, z, color, shape); // fallback — never hit while every BOSS_DEFS entry uses a 'boss-*' shape above
}
function buildBosses() {
  initBossState();
  BOSS_DEFS.forEach(def => {
    const mesh = buildBossMesh(def.x, def.z, def.color, def.shape);
    mesh.scale.setScalar(3.2); // genuinely huge — that's the whole point of a boss
    // No collision wall anymore — a boss that moves can't be a static addCol() collider (it'd
    // leave a ghost wall behind at the spawn spot the moment it starts chasing). Same
    // walk-through-able convention rogue robots and Killers already use.
    buildLogoSign(def.name.toUpperCase(), def.emoji, '#220000', '#ff4444', def.x, 9, def.z-4.5);
    const light = new THREE.PointLight(def.color, 2, 60); light.position.set(def.x, 8, def.z); scene.add(light);
    bossMeshes[def.name] = { mesh, light };
  });
}
async function syncBosses() {
  if (serverMode !== 'online') return;
  try {
    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/bosses', {}, 4000);
    if (!r.ok) return;
    const data = await r.json();
    BOSS_DEFS.forEach(def => {
      const srv = data[def.name];
      if (!srv) return; // nobody's ever hit it — local full-health default is already correct
      const st = bossState[def.name];
      const wasAlive = st.alive, wasLevel = st.level;
      st.hp = srv.hp; st.maxHp = srv.maxHp; st.alive = srv.alive;
      if (srv.level !== undefined) st.level = srv.level;
      if (srv.defeats !== undefined) st.defeats = srv.defeats;
      const bm = bossMeshes[def.name];
      if (!wasAlive && st.alive) {
        showNotif(st.level > wasLevel ? `${def.emoji} ${def.name} has returned — now Level ${st.level}!` : `${def.emoji} ${def.name} has returned!`);
        // Back at its own post on respawn, not stuck wherever the chase last left it.
        st.aggro = false; st.curX = def.x; st.curZ = def.z;
        if (bm) { bm.mesh.position.set(def.x, 0, def.z); if (bm.light) bm.light.position.set(def.x, 8, def.z); }
      }
      if (bm) bm.mesh.visible = st.alive;
      if (currentNearBoss === def) showBossHud(def);
    });
  } catch(e) { /* next sync will catch up */ }
}
function showBossHud(def) {
  const st = bossState[def.name];
  document.getElementById('bossHud').style.display = 'block';
  const locked = def.minLevel > 0 && eliteLevel < def.minLevel;
  document.getElementById('bossHudName').textContent = `${def.emoji} ${def.name}${st.level > 0 ? ` — Lv.${st.level}` : ''}${locked ? ` 🔒 Requires Robot Lv.${def.minLevel}` : ''}`;
  document.getElementById('bossHudFill').style.width = Math.max(0, st.hp/st.maxHp*100) + '%';
  document.getElementById('bossHudHp').textContent = st.alive ? `${Math.ceil(Math.max(0,st.hp))} / ${st.maxHp} HP` : 'Down — respawning...';
}
function tickBossHud() {
  // The Movie Fight Room shares this same HUD panel (only one of the two fights can ever be
  // active at once) — delegate entirely while inside it so the outdoor loop below doesn't
  // fight over the same DOM elements and force-hide it every frame.
  if (inMovieFight) { showMovieBossHud(); return; }
  // Measured off each boss's real LIVE position now, not its fixed home spot — once one's
  // chasing you it could be nowhere near where it started.
  let nearest = null, nearestDist = 30;
  BOSS_DEFS.forEach(def => {
    const st = bossState[def.name]; if (!st) return;
    const d = Math.hypot(playerGroup.position.x-st.curX, playerGroup.position.z-st.curZ);
    if (d < nearestDist) { nearestDist = d; nearest = def; }
  });
  currentNearBoss = nearest;
  if (nearest) showBossHud(nearest);
  else document.getElementById('bossHud').style.display = 'none';
}
async function fightBoss(def) {
  const st = bossState[def.name];
  if (!st.alive) { showNotif(`${def.emoji} ${def.name} is down — back in a bit...`); return; }
  // The level gate only blocks YOU from hurting it back — tickBossChase() still chases/attacks
  // an under-leveled player exactly the same as anyone else, on purpose (see BOSS_DEFS comment).
  if (def.minLevel > 0 && eliteLevel < def.minLevel) {
    showNotif(`🔒 ${def.name} is too strong — reach Robot Level ${def.minLevel} first! (you're Lv.${eliteLevel})`);
    return;
  }
  const dmg = getWeaponDamage();
  triggerSwing();
  sfx.clang();
  // Real pre-existing bug found while verifying the new chase feature: this floor used to be
  // Math.max(1, ...) UNCONDITIONALLY, even in offline mode — which meant an offline solo boss
  // fight could NEVER actually reach 0 HP, so the boss could never be won against without a
  // server. The floor-at-1 (never letting the optimistic local guess claim a kill the server
  // hasn't confirmed yet) only makes sense ONLINE, where the server is what's allowed to declare
  // a real kill (via justDefeated below) and a dropped request could otherwise drift the guess to
  // a fake "0/HP defeated." Offline has no server to wait for, so it can just floor at the real 0.
  st.hp = Math.max(serverMode === 'online' ? 1 : 0, st.hp - dmg);
  showBossHud(def);
  showNotif(`${def.emoji} Hit ${def.name} for ${dmg}!`);
  queueEarning(def.hitSip, def.hitElite, def.name); // small per-hit ticks merge into one Earnings row (EARNING_MERGE_WINDOW_MS) instead of flooding it during a long fight
  updateSIP(); if (def.hitElite) updateElite();
  // No counter-hit here anymore — tickBossAttacks() already swings at the player on its own
  // timer whenever they're in range, attacking or not. A guaranteed extra hit every time you
  // landed a hit too would just be double damage on top of that.
  st.attackTimer = 0; // landing your own hit resets its swing timer, same as a real fight would
  st.aggro = true; // attacking it guarantees the chase starts, even if you somehow reached it from outside BOSS_DETECT_RANGE
  if (serverMode !== 'online') {
    // Offline solo fight — no server to share this with, resolve entirely locally.
    if (st.hp <= 0) {
      st.alive = false;
      const bm = bossMeshes[def.name]; if (bm) bm.mesh.visible = false;
      showBossHud(def);
      awardBossDefeat(def);
      // No server here to run the real respawn timer, so mirror it locally — same
      // BOSS_RESPAWN wait either way, just not shared with anyone else since offline play
      // by definition has no one else to share it with.
      setTimeout(() => {
        st.alive = true; st.hp = st.maxHp;
        // Respawns back at its own post, not wherever the chase happened to end — same reset
        // resetAllBossAggro() does on a player knockout.
        st.aggro = false; st.curX = def.x; st.curZ = def.z;
        if (bm) { bm.mesh.visible = true; bm.mesh.position.set(def.x, 0, def.z); if (bm.light) bm.light.position.set(def.x, 8, def.z); }
        if (currentNearBoss === def) showBossHud(def);
      }, 600000);
    }
    return;
  }
  try {
    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/bosses/hit', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name: def.name, maxHp: def.maxHp, damage: dmg, attackerName: currentUser })
    }, 4000);
    if (!r.ok) return;
    const res = await r.json();
    const wasAlive = st.alive;
    st.hp = res.hp; st.alive = res.alive; st.maxHp = res.maxHp;
    if (res.level !== undefined) st.level = res.level;
    if (res.defeats !== undefined) st.defeats = res.defeats;
    showBossHud(def);
    const bm = bossMeshes[def.name]; if (bm) bm.mesh.visible = st.alive;
    if (res.justDefeated && wasAlive) awardBossDefeat(def);
  } catch(e) { /* the local hit above already landed — next sync reconciles */ }
}
function awardBossDefeat(def) {
  const [lo,hi] = def.sipReward;
  const reward = lo + Math.floor(Math.random()*(hi-lo+1));
  queueEarning(reward, def.eliteReward, def.name);
  lifetimeRobotKills++; // a real robot kill either way, just a huge one — counts toward the Quests panel too
  totalBossesDefeated++;
  saveCurrentUser();
  sfx.boom();
  showNotif(`🏆 ${def.emoji} ${def.name} DEFEATED! +${reward} S.I.P. +${def.eliteReward} 💎`);
}

// ─── COMPANION COMBAT — Buddy and the adopted kid land their own real hits on whatever
// you're fighting, PvE (rogue robots, killers, bosses) and PvP (duels, Arena FFA) alike —
// not just cosmetic followers anymore. Each has its own pacing timer and deals a fraction
// of the player's own weapon/robot damage stat, so gearing up still matters. A baby-stage
// kid sits fights out (same 'kid'/'teen'/'adult'-only gate the School feature already uses).
const BUDDY_ATTACK_INTERVAL = 2.4, KID_ATTACK_INTERVAL = 2.8;
const BUDDY_DAMAGE_MULT = 0.4, KID_DAMAGE_MULT = 0.3; // a real assist, not a full second fighter
let buddyAttackTimer = 0, kidAttackTimer = 0; // NOT persisted — just pacing, like every other attackTimer in the file

// User's own ask: "make pets chase robbers" — a real visible chase, not just a bonus hit fired
// from wherever Buddy happens to be standing. Deliberately includes a k.fleeing robber (one that
// already stole from the player and is running off) — that's the single most fitting moment for
// this: the robber grabbed your money and ran, and your pet goes after it. Scoped to Buddy only
// (not the adopted kid) — chasing down a real threat isn't something to hand a child companion.
const BUDDY_ROBBER_CHASE_RADIUS = 14;
function nearestRevealedRobber(px, pz, maxDist) {
  let best = null, bestDist = maxDist;
  for (const k of killers) {
    if (!k.alive || !k.revealed || !k.robber) continue;
    const d = Math.hypot(px-k.x, pz-k.z);
    if (d < bestDist) { bestDist = d; best = k; }
  }
  return best;
}

// Finds whatever the player is actively fighting right now, in the same priority order
// handleInteract() itself checks: an active duel > Arena FFA > a killer/boss/rogue robot in
// range. Read-only — doesn't consume/trigger anything, just tells the companions where to swing.
function getCompanionCombatTarget() {
  const px = playerGroup.position.x, pz = playerGroup.position.z;
  if (dueling && serverMode === 'online') {
    const rp = remotePlayers[dueling];
    if (rp) {
      const d = Math.hypot(px-rp.mesh.position.x, pz-rp.mesh.position.z);
      if (d <= 8) return { type:'duel', name: dueling };
    }
  }
  if (inArena && serverMode === 'online' && ffaAlive) {
    let target = null, targetDist = 8;
    Object.keys(remotePlayers).forEach(name => {
      const rp = remotePlayers[name];
      const dToArena = Math.hypot(rp.mesh.position.x-ARENA_CENTER.x, rp.mesh.position.z-ARENA_CENTER.z);
      if (dToArena > ARENA_RADIUS) return;
      const d = Math.hypot(px-rp.mesh.position.x, pz-rp.mesh.position.z);
      if (d < targetDist) { targetDist = d; target = name; }
    });
    if (target) return { type:'ffa', name: target };
  }
  if (!inHouse && !inMall && !inArcade && !inStore) {
    let closestKiller = null, closestKillerDist = Infinity;
    for (const k of killers) {
      if (!k.alive || !k.revealed) continue;
      const d = Math.hypot(px-k.x, pz-k.z);
      // A robber Buddy is actively chasing (see BUDDY_ROBBER_CHASE_RADIUS) may by now be well
      // ahead of the player — also count it in range if BUDDY has actually caught up to it, even
      // if the player hasn't, so a chase that lands doesn't just stand there not attacking.
      const dFromBuddy = (k.robber && buddyOwned && buddyGroup) ? Math.hypot(buddyGroup.position.x-k.x, buddyGroup.position.z-k.z) : Infinity;
      if (d >= 3.5 && dFromBuddy >= 3.5) continue;
      const effectiveDist = Math.min(d, dFromBuddy);
      if (effectiveDist < closestKillerDist) { closestKillerDist = effectiveDist; closestKiller = k; }
    }
    if (closestKiller) return { type:'killer', ref: closestKiller };
    let closestBoss = null, closestBossDist = 6;
    // st.curX/curZ (a live chase position) may not exist on every deployment yet — fall back
    // to the boss's fixed home spot (def.x/def.z) so this still works either way.
    for (const def of BOSS_DEFS) {
      const st = bossState[def.name]; if (!st || !st.alive) continue;
      const bx = st.curX !== undefined ? st.curX : def.x, bz = st.curZ !== undefined ? st.curZ : def.z;
      const d = Math.hypot(px-bx, pz-bz);
      if (d < closestBossDist) { closestBossDist = d; closestBoss = def; }
    }
    if (closestBoss) return { type:'boss', ref: closestBoss };
    let closestRobot = null, closestRobotDist = 3.5;
    for (const r of rogueRobots) { if (!r.alive) continue; const d = Math.hypot(px-r.x, pz-r.z); if (d < closestRobotDist) { closestRobotDist = d; closestRobot = r; } }
    if (closestRobot) return { type:'robot', ref: closestRobot };
  }
  return null;
}
// A lighter-weight sibling of fightBoss() for a companion's own hit — same HP-sync/defeat/
// respawn handling (online via the server, offline mirrored locally), just no player swing
// animation and its own attacker label instead of a generic one.
function companionHitBoss(def, dmg, label) {
  const st = bossState[def.name];
  if (!st || !st.alive) return;
  st.hp = Math.max(serverMode === 'online' ? 1 : 0, st.hp - dmg);
  st.attackTimer = 0; st.aggro = true;
  showBossHud(def);
  showNotif(`${label} hits ${def.name} for ${dmg}!`);
  sfx.clang();
  if (serverMode !== 'online') {
    if (st.hp <= 0) {
      st.alive = false;
      const bm = bossMeshes[def.name]; if (bm) bm.mesh.visible = false;
      showBossHud(def);
      awardBossDefeat(def);
      setTimeout(() => {
        st.alive = true; st.hp = st.maxHp; st.aggro = false; st.curX = def.x; st.curZ = def.z;
        const bm2 = bossMeshes[def.name];
        if (bm2) { bm2.mesh.visible = true; bm2.mesh.position.set(def.x, 0, def.z); if (bm2.light) bm2.light.position.set(def.x, 8, def.z); }
        if (currentNearBoss === def) showBossHud(def);
      }, 600000);
    }
    return;
  }
  fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/bosses/hit', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ name: def.name, maxHp: def.maxHp, damage: dmg, attackerName: currentUser })
  }, 4000).then(async r => {
    if (!r.ok) return;
    const res = await r.json();
    const wasAlive = st.alive;
    st.hp = res.hp; st.alive = res.alive; st.maxHp = res.maxHp;
    if (res.level !== undefined) st.level = res.level;
    if (res.defeats !== undefined) st.defeats = res.defeats;
    showBossHud(def);
    const bm = bossMeshes[def.name]; if (bm) bm.mesh.visible = st.alive;
    if (res.justDefeated && wasAlive) awardBossDefeat(def);
  }).catch(()=>{});
}
function landCompanionHit(target, mult, label) {
  if (target.type === 'duel') {
    const dmg = Math.max(1, Math.round(getWeaponDamage() * mult));
    sendMail(target.name, 'duel_hit', { damage: dmg });
    showNotif(`${label} hits ${target.name} for ${dmg}!`);
    sfx.hit();
  } else if (target.type === 'ffa') {
    const dmg = Math.max(1, Math.round(getWeaponDamage() * mult));
    sendMail(target.name, 'ffa_hit', { damage: dmg });
    showNotif(`${label} hits ${target.name} for ${dmg}!`);
    sfx.hit();
  } else if (target.type === 'killer') {
    const k = target.ref; if (!k.alive) return;
    const dmg = Math.max(1, Math.round(getWeaponDamage() * mult));
    k.hp -= dmg;
    sfx.clang();
    // Robbers live in the same `killers` array as hired killers (tagged k.robber), but they're a
    // real different kind of kill with their own reward (defeatRobber's bounty S.I.P.) and message
    // — dispatching every companion-assisted kill here through defeatKiller() regardless would have
    // silently paid Elite currency and shown "Defeated the killer!" for a robber kill instead.
    if (k.hp > 0) { showNotif(`${label} hits the ${k.robber ? 'robber' : 'killer'} for ${dmg}! (${k.hp}/${k.maxHp} HP left)`); return; }
    showNotif(`${label} lands the final hit!`);
    if (k.robber) defeatRobber(k); else defeatKiller(k);
  } else if (target.type === 'boss') {
    const dmg = Math.max(1, Math.round(getWeaponDamage() * mult));
    companionHitBoss(target.ref, dmg, label);
  } else if (target.type === 'robot') {
    const r = target.ref; if (!r.alive) return;
    const dmg = Math.max(1, Math.round(getRobotDamage() * mult));
    r.hp -= dmg;
    sfx.clang();
    if (r.hp > 0) { showNotif(`${label} hits the rogue ${r.type.name} for ${dmg}! (${r.hp} HP left)`); return; }
    showNotif(`${label} lands the final hit!`);
    defeatRogueRobot(r);
  }
}
function tickCompanionAssist(dt) {
  if (!buddyOwned && !familyKidAdopted) return;
  const target = getCompanionCombatTarget();
  if (buddyOwned) {
    buddyAttackTimer += dt;
    if (buddyAttackTimer >= BUDDY_ATTACK_INTERVAL) {
      buddyAttackTimer = 0;
      if (target) landCompanionHit(target, BUDDY_DAMAGE_MULT, `🐾 ${buddyName}`);
    }
  }
  if (familyKidAdopted && growthStageFor(familyKidPlayTime).id !== 'baby') {
    kidAttackTimer += dt;
    if (kidAttackTimer >= KID_ATTACK_INTERVAL) {
      kidAttackTimer = 0;
      if (target) landCompanionHit(target, KID_DAMAGE_MULT, `👦 ${familyKidName}`);
    }
  }
}

let warGarrisons = {};     // territory name -> [{hp,maxHp,mesh,alive,zone,x,z,attackTimer,isTank}] — enemy soldiers + a Tank unit
let warCitizens  = {};     // territory name -> [{hp,maxHp,mesh,alive,x,z,attackTimer}] — Explox allies, fight FOR the player
let warFlags = {};         // territory name -> flag Group, once captured
let currentWarZone = null; // the WAR_TERRITORIES entry I'm currently near, or null
// ─── WAR DEATH — user's own ask: "death in war". War used to be the one death path in the whole
// game with zero real cost (instant full heal, right back to fighting). Follow-up correction:
// not a plain countdown either — "when you die you have to choose where to respawn", a real
// interruption (can't fight, can't be hit) until warDeathModal's choice is made, plus a real
// S.I.P. loss either way. See knockoutPlayer()'s currentWarZone branch / showWarDeathModal().
let warAlive = true;
const WAR_DEATH_SIP_LOSS_PCT = 0.1; // lose 10% of your CURRENT wallet — lost gear, not a bank deposit

function buildWarRoom() {
  const { x, z } = WAR_ROOM_SPOT;
  box(4, 3, 0.3, 0x1a2a4a, x, 1.5, z);
  buildSign('⚔️ War Room', x, 4, z - 0.3);
  addCol(CITY_COLS, x, z, 2, 0.6);
  CITY_ZONES.push({ x, z: z + 1.5, r: 3.5, label: '⚔️ War Room', action: () => openWarRoom()});
}
function openWarRoom() {
  if (serverMode !== 'online') { showNotif('⚔️ The War Room needs ONLINE mode!'); return; }
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  const rows = WAR_TERRITORIES.map(t => {
    const st = territoryState[t.name] || { captured: false, kills: 0 };
    const status = st.captured
      ? `✅ Captured for Explox${st.capturedBy ? ' by ' + st.capturedBy : ''}`
      : `⚔️ ${st.kills}/${t.killsNeeded} defenders defeated`;
    return `<div style="padding:7px 0;border-bottom:1px solid #2a3a5a;"><b>${t.name}</b><br><span style="font-size:11px;opacity:.8">${status}</span></div>`;
  }).join('');
  const capturedCount = WAR_TERRITORIES.filter(t => territoryState[t.name] && territoryState[t.name].captured).length;
  const exploxRow = `<div style="padding:7px 0;border-bottom:2px solid #4488ff;margin-bottom:4px;"><b>🛡️ Explox (Home)</b><br><span style="font-size:11px;color:#66ff88;">✅ UNCONQUERED — the other countries keep sending armies to try and take it (see 🚨 Invasion Attempt in World Events), but they can never actually succeed</span></div>`;
  document.getElementById('warRoomBody').innerHTML =
    `<p style="text-align:center;color:#88ccff;margin-bottom:10px;">🌍 ${capturedCount} / ${WAR_TERRITORIES.length} territories captured for Explox!</p>` + exploxRow + rows;
  document.getElementById('warRoomModal').style.display = 'flex';
}
function closeWarRoom() {
  document.getElementById('warRoomModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

function buildWarFlag(terr) {
  if (warFlags[terr.name]) return;
  const g = new THREE.Group(); g.position.set(terr.x, 0, terr.z); scene.add(g);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 8, 6), new THREE.MeshBasicMaterial({ color: 0x999999 }));
  pole.position.y = 4; g.add(pole);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.1), new THREE.MeshBasicMaterial({ color: 0x2196F3 }));
  flag.position.set(1.5, 7, 0); g.add(flag);
  warFlags[terr.name] = g;
}

function clearWarGarrison(name) {
  (warGarrisons[name] || []).forEach(n => {
    if (!n.alive) return;
    scene.remove(n.mesh);
    const zi = CITY_ZONES.indexOf(n.zone); if (zi > -1) CITY_ZONES.splice(zi, 1);
  });
  warGarrisons[name] = [];
}
// Deliberately NO addCol() collider any more — these units now actively move (see
// tickWarCombat), and a fixed collider at spawn position would leave a "ghost wall" behind
// exactly where it started, same class of bug already fixed once for Robot Arena robots when
// THEY started moving. Killers/Coin Bots/Police Backup are all similarly walk-through for the
// same reason — combat here is proximity-based, not physical blocking.
// Real bug the user caught live ("why is there pink?"): World Events' worldEventNpcLook() picks a
// soldier's color from the FULL 24-bit hash of the territory name — fine for a Garden Gnome
// Uprising, but Space Station happened to hash to bright pink (#fbb2db) and Italy to magenta
// (#d764ec), which undercuts the "real armed invasion" tone this whole overhaul is going for.
// Same hash trick, but constrained to an actual military palette instead of the full rainbow.
const WAR_SOLDIER_COLORS = [0x4a5a3a, 0x5a5a4a, 0x3a4a3a, 0x555555, 0x6b5a3a, 0x445544];
function warSoldierColor(name) {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return WAR_SOLDIER_COLORS[h % WAR_SOLDIER_COLORS.length];
}
function spawnOneWarNpc(terr, isTank) {
  const angle = Math.random() * Math.PI * 2, dist = (5 + Math.random() * 15) * COUNTRY_SCALE; // scaled with the 20x country resize (item ~234) — old range spawned NPCs almost inside a now much-bigger landmark
  const nx = terr.x + Math.cos(angle) * dist, nz = terr.z + Math.sin(angle) * dist;
  const look = worldEventNpcLook(terr.name); // still used for shape variety — only the color was the problem
  const mesh = buildRobotMesh(nx, nz, isTank ? 0x3a4a2a : warSoldierColor(terr.name), isTank ? 'tank' : look.shape);
  if (isTank) mesh.scale.set(1.6, 1.6, 1.6); // a real dedicated Tank unit, not just a reskinned soldier
  const gunLen = isTank ? 1.4 : 0.7;
  const gun = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, gunLen), new THREE.MeshLambertMaterial({ color: 0x222222 }));
  gun.position.set(0.4, isTank ? 1.1 : 1.7, 0.5);
  mesh.add(gun); // a visible gun prop — user's own ask: "guns"
  const hp = isTank ? Math.round(terr.npcHealth * WAR_TANK_HP_MULT) : terr.npcHealth;
  const npc = { hp, maxHp: hp, mesh, alive: true, zone: null, x: nx, z: nz, attackTimer: Math.random() * WAR_ATTACK_INTERVAL, isTank: !!isTank };
  const zone = { x: nx, z: nz, r: isTank ? 10 : 8, label: isTank ? `🪖 Fight the ${terr.name} Tank` : `🪖 Fight for ${terr.name}`, action: () => fightWarNpc(npc, terr) };
  npc.zone = zone;
  CITY_ZONES.push(zone);
  if (!warGarrisons[terr.name]) warGarrisons[terr.name] = [];
  warGarrisons[terr.name].push(npc);
}
function spawnWarGarrison(terr) {
  clearWarGarrison(terr.name);
  for (let i = 0; i < terr.npcCount; i++) spawnOneWarNpc(terr, false);
  const tankCount = terr.name === 'Space Station' ? 2 : 1;
  for (let i = 0; i < tankCount; i++) spawnOneWarNpc(terr, true);
}
// ── Explox Citizens — the player's own side, fighting back "same as yours" (user's own words).
// Spawned in the same count as the enemy garrison (terr.npcCount) whenever a territory becomes
// active, and torn down the same way — see spawnWarGarrison above for the exact parallel.
function buildWarCitizenMesh(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const uniform = 0x2299ee, uniformDark = 0x1a6fbb, skin = 0xe0b090; // Explox's own cyan — reads as "yours" at a glance next to the enemy's per-territory robot look
  const mk = (w, h, d, color, px, py, pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color })); m.position.set(px, py, pz); m.castShadow = true; g.add(m); return m; };
  mk(0.9, 1.1, 0.5, uniform, 0, 1.75, 0);      // torso
  mk(1, 1, 1, skin, 0, 2.8, 0);                 // head
  mk(0.35, 0.9, 0.35, uniform, -0.65, 1.75, 0); mk(0.35, 0.9, 0.35, uniform, 0.65, 1.75, 0); // arms
  mk(0.38, 0.9, 0.38, uniformDark, -0.22, 0.75, 0); mk(0.38, 0.9, 0.38, uniformDark, 0.22, 0.75, 0); // legs
  const rifle = mk(0.1, 0.1, 0.9, 0x333333, 0.65, 1.6, 0.3); rifle.rotation.x = -0.3; // armed too — same "guns" flavor as the enemy soldiers
  scene.add(g);
  return g;
}
function spawnOneWarCitizen(terr) {
  const angle = Math.random() * Math.PI * 2, dist = (5 + Math.random() * 15) * COUNTRY_SCALE; // scaled with the 20x country resize (item ~234) — old range spawned NPCs almost inside a now much-bigger landmark
  const nx = terr.x + Math.cos(angle) * dist, nz = terr.z + Math.sin(angle) * dist;
  const mesh = buildWarCitizenMesh(nx, nz);
  const c = { hp: terr.npcHealth, maxHp: terr.npcHealth, mesh, alive: true, x: nx, z: nz, attackTimer: Math.random() * WAR_CITIZEN_ATTACK_INTERVAL };
  if (!warCitizens[terr.name]) warCitizens[terr.name] = [];
  warCitizens[terr.name].push(c);
}
function spawnWarCitizens(terr) {
  clearWarCitizens(terr.name);
  for (let i = 0; i < terr.npcCount; i++) spawnOneWarCitizen(terr); // matches the enemy soldier count exactly — "same as yours"
}
function clearWarCitizens(name) {
  (warCitizens[name] || []).forEach(c => { if (c.alive) scene.remove(c.mesh); });
  warCitizens[name] = [];
}
function defeatWarCitizen(c, terr) {
  c.alive = false;
  scene.remove(c.mesh);
  // reinforcements, same 8s idea as the enemy's own replacement below
  setTimeout(() => {
    const st = territoryState[terr.name];
    if (!st || !st.captured) spawnOneWarCitizen(terr);
  }, 8000);
}
// A quick visual tracer round — cheap (one box, removed after 90ms, no persistent state) so it's
// safe to fire from many units at once. sfx.laser() doubles as the gunshot sound.
function fireWarShot(x1, y1, z1, x2, z2) {
  const dx = x2 - x1, dz = z2 - z1, len = Math.max(0.5, Math.hypot(dx, dz));
  const tracer = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, len), new THREE.MeshBasicMaterial({ color: 0xffee66 }));
  tracer.position.set((x1 + x2) / 2, y1, (z1 + z2) / 2);
  tracer.rotation.y = Math.atan2(dx, dz);
  scene.add(tracer);
  setTimeout(() => scene.remove(tracer), 90);
}
// Shared cleanup+reward path for a defeated enemy — called both when the PLAYER lands the
// killing blow (fightWarNpc) and when a Citizen ally does (tickWarCombat), so citizen kills pay
// out and count toward capture exactly like the player's own kills do.
function defeatWarNpc(npc, terr) {
  npc.alive = false;
  scene.remove(npc.mesh);
  const zi = CITY_ZONES.indexOf(npc.zone); if (zi > -1) CITY_ZONES.splice(zi, 1);
  queueEarning(terr.rewardPerKill, 0, `${terr.name} Defender`);
  sfx.boom();
  reportWarKill(terr);
  // a replacement shows up after a cooldown, same idea as the Scrapyard's robot
  // spawners - but only if the territory hasn't just been captured out from under it
  setTimeout(() => {
    const st = territoryState[terr.name];
    if (!st || !st.captured) spawnOneWarNpc(terr, npc.isTank);
  }, 8000);
}
// ─── WAR DEATH RESPAWN CHOICE — see knockoutPlayer()'s currentWarZone branch, which flips
// warAlive false and opens this instead of just healing you back up in place.
function showWarDeathModal(terr, lostSip) {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('warDeathLossText').textContent =
    `Downed by ${terr.name}'s defenders — lost ${lostSip.toLocaleString()} S.I.P.`;
  document.getElementById('warDeathModal').style.display = 'flex';
}
function respawnFromWarDeath(where) {
  document.getElementById('warDeathModal').style.display = 'none';
  if (where === 'home') {
    playerGroup.position.set(HOUSE_DOOR.x, 0, HOUSE_DOOR.z + 3);
    yaw = 0;
    showNotif('🏠 Respawned at Home.');
  } else if (where === 'warroom') {
    playerGroup.position.set(WAR_ROOM_SPOT.x, 0, WAR_ROOM_SPOT.z);
    showNotif('🪖 Respawned at the War Room.');
  } else {
    showNotif('📍 Back in the fight, right where you fell.');
  }
  warAlive = true;
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function fightWarNpc(npc, terr) {
  if (!npc.alive) { showNotif('That fight is over.'); return; }
  if (!warAlive) { showNotif('⏳ Still down — pick where to respawn first!'); return; }
  const dmg = getRobotDamage();
  npc.hp -= dmg;
  triggerSwing(); sfx.clang();
  startKnockback(playerGroup.position.x, playerGroup.position.z, npc.x, npc.z,
    (x, z) => { npc.x = x; npc.z = z; npc.mesh.position.set(x, 0, z); });
  lifetimeWarHits++;
  if (npc.hp > 0) {
    showNotif(`🪖 Hit for ${dmg}! (${npc.hp} HP left)`);
    return;
  }
  showNotif(`🪖 Defender defeated! +${terr.rewardPerKill} S.I.P. pending`);
  defeatWarNpc(npc, terr);
}
// ── Active combat tick — the actual "attacks you" / "citizens also attack" behavior. Every
// living enemy (soldier or Tank) in the CURRENT territory hunts down whichever is closer, the
// player or the nearest living Citizen, closing distance and firing once in range; every living
// Citizen does the same in reverse, always targeting the nearest living enemy. Only
// currentWarZone's forces ever run this, matching the existing "one territory's forces exist at
// a time" architecture (see tickWar below).
function tickWarCombat(dt) {
  if (!currentWarZone) return;
  // No auto-restore on a timer — warAlive only flips back true from respawnFromWarDeath(),
  // once the player actually picks where to come back.
  const terr = currentWarZone;
  const enemies = warGarrisons[terr.name] || [];
  const citizens = warCitizens[terr.name] || [];

  enemies.forEach(npc => {
    if (!npc.alive) return;
    let tx = playerGroup.position.x, tz = playerGroup.position.z, targetCitizen = null;
    let bestDist = Math.hypot(tx - npc.x, tz - npc.z);
    citizens.forEach(c => {
      if (!c.alive) return;
      const d = Math.hypot(c.x - npc.x, c.z - npc.z);
      if (d < bestDist) { bestDist = d; tx = c.x; tz = c.z; targetCitizen = c; }
    });
    const range = npc.isTank ? WAR_TANK_ATTACK_RANGE : WAR_ATTACK_RANGE;
    const dx = tx - npc.x, dz = tz - npc.z, dist = Math.hypot(dx, dz);
    if (dist < range) {
      npc.attackTimer += dt;
      if (npc.attackTimer > WAR_ATTACK_INTERVAL) {
        npc.attackTimer = 0;
        const dmg = npc.isTank ? Math.round(terr.npcDamage * WAR_TANK_DMG_MULT) : terr.npcDamage;
        fireWarShot(npc.x, npc.isTank ? 1.4 : 1.7, npc.z, tx, tz);
        sfx.laser();
        if (targetCitizen) { targetCitizen.hp -= dmg; if (targetCitizen.hp <= 0) defeatWarCitizen(targetCitizen, terr); }
        else if (warAlive) damagePlayer(dmg, npc.isTank ? `a ${terr.name} Tank` : `a ${terr.name} soldier`);
      }
    } else {
      const speed = npc.isTank ? WAR_TANK_SPEED : WAR_SOLDIER_SPEED;
      npc.x += dx / dist * speed * dt; npc.z += dz / dist * speed * dt;
      npc.mesh.position.set(npc.x, 0, npc.z);
      npc.mesh.rotation.y = Math.atan2(dx, dz);
      npc.zone.x = npc.x; npc.zone.z = npc.z; // keep the E-interact fight zone following it
    }
  });

  citizens.forEach(c => {
    if (!c.alive) return;
    let target = null, bestDist = Infinity;
    enemies.forEach(npc => { if (!npc.alive) return; const d = Math.hypot(npc.x - c.x, npc.z - c.z); if (d < bestDist) { bestDist = d; target = npc; } });
    if (!target) return;
    if (bestDist < WAR_CITIZEN_ATTACK_RANGE) {
      c.attackTimer += dt;
      if (c.attackTimer > WAR_CITIZEN_ATTACK_INTERVAL) {
        c.attackTimer = 0;
        fireWarShot(c.x, 1.7, c.z, target.x, target.z);
        sfx.laser();
        target.hp -= terr.npcDamage; // citizens hit exactly as hard as the enemy soldiers — "same as yours"
        if (target.hp <= 0) {
          showNotif(`🎖️ Your citizens took down a ${terr.name} defender! +${terr.rewardPerKill} S.I.P. pending`);
          defeatWarNpc(target, terr);
        }
      }
    } else {
      const dx = target.x - c.x, dz = target.z - c.z, d = Math.hypot(dx, dz);
      c.x += dx / d * WAR_CITIZEN_SPEED * dt; c.z += dz / d * WAR_CITIZEN_SPEED * dt;
      c.mesh.position.set(c.x, 0, c.z);
      c.mesh.rotation.y = Math.atan2(dx, dz);
    }
  });
}
// ── WALLS — user's own ask: "every country has a wall including explox," and specifically wants
// a REAL defense you must breach (not just a decoration, not just a non-lethal barrier) — a real
// solid ring with its own HP, blocking the player's actual movement (real addCol colliders) until
// it's beaten down. One shared builder for both the 8 (well, 9 — Space Station included, since it
// already shares every other War Territory mechanic) territory walls AND Explox's own.
function buildWallRing(cx, cz, radius, segments, color) {
  const g = new THREE.Group(); scene.add(g);
  const cols = [];
  const segLen = (2 * Math.PI * radius / segments) * 1.15; // slight overlap so there's no gap to slip through
  for (let i = 0; i < segments; i++) {
    const ang = (i / segments) * Math.PI * 2;
    const sx = cx + Math.cos(ang) * radius, sz = cz + Math.sin(ang) * radius;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(segLen, 6, 1.2), new THREE.MeshLambertMaterial({ color }));
    seg.position.set(sx, 3, sz);
    seg.rotation.y = -ang + Math.PI / 2; // face tangent to the circle, wall-like
    g.add(seg);
    cols.push(addCol(CITY_COLS, sx, sz, segLen / 2, 0.7));
  }
  return { mesh: g, cols };
}
function clearWallStructure(w) {
  if (!w || !w.alive) return;
  scene.remove(w.mesh);
  w.cols.forEach(c => { const ci = CITY_COLS.indexOf(c); if (ci > -1) CITY_COLS.splice(ci, 1); });
  w.alive = false;
}

const WALL_HP_MULT = 5; // a real fight to bring down, not a speed bump
const WAR_WALL_RADIUS = 28 * COUNTRY_SCALE; // scaled with the 20x country resize (item ~234) — still needs to clear the largest scaled landmark half-width (Italy: 22*20=440)
let warWalls = {};        // territory name -> {hp, maxHp, alive, mesh, cols, zone}
let breachedWarWalls = new Set(); // stays breached for the rest of THIS session once knocked down (matches warGarrisons/warCitizens' own session-only, non-persisted state)
function spawnWarWall(terr) {
  if (breachedWarWalls.has(terr.name)) return; // already fought through it this session
  const hp = Math.round(terr.npcHealth * WALL_HP_MULT);
  const built = buildWallRing(terr.x, terr.z, WAR_WALL_RADIUS, 12, 0x6b5a3a);
  const zone = { x: terr.x, z: terr.z, r: WAR_WALL_RADIUS + 4, label: `🧱 Attack the ${terr.name} Wall`, action: () => hitWarWall(terr) };
  CITY_ZONES.push(zone);
  warWalls[terr.name] = { hp, maxHp: hp, alive: true, mesh: built.mesh, cols: built.cols, zone };
}
function clearWarWall(name) {
  const w = warWalls[name]; if (!w) return;
  clearWallStructure(w);
  const zi = CITY_ZONES.indexOf(w.zone); if (zi > -1) CITY_ZONES.splice(zi, 1);
  delete warWalls[name];
}
function hitWarWall(terr) {
  const w = warWalls[terr.name];
  if (!w || !w.alive) { showNotif('The wall is already down — go fight for the territory!'); return; }
  const dmg = getRobotDamage();
  w.hp -= dmg;
  triggerSwing(); sfx.clang();
  if (w.hp > 0) { showNotif(`🧱 Hit the wall for ${dmg}! (${w.hp}/${w.maxHp} HP left)`); return; }
  clearWallStructure(w);
  breachedWarWalls.add(terr.name);
  sfx.boom();
  showNotif(`🧱💥 The ${terr.name} wall is breached! Fight your way in and take the territory!`);
}
async function reportWarKill(terr) {
  if (serverMode !== 'online') return;
  try {
    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/territories/hit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: terr.name, killerName: currentUser, threshold: terr.killsNeeded })
    }, 4000);
    if (!r.ok) return;
    const res = await r.json();
    territoryState[terr.name] = { captured: res.captured, kills: res.kills };
    if (res.justCaptured) {
      queueEarning(terr.captureBonus, 0, `${terr.name} Captured`);
      showNotif(`🏆🎉 ${terr.name} CAPTURED for Explox! +${terr.captureBonus} S.I.P. bonus pending!`);
      clearWarGarrison(terr.name);
      clearWarCitizens(terr.name);
      clearWarWall(terr.name);
      buildWarFlag(terr);
    }
  } catch (e) { /* next report/sync will catch up */ }
}
async function syncTerritories() {
  if (serverMode !== 'online' || !currentUser) return;
  try {
    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/territories', {}, 4000);
    if (!r.ok) return;
    const data = await r.json();
    Object.keys(data).forEach(name => {
      territoryState[name] = data[name];
      if (data[name].captured) {
        const terr = WAR_TERRITORIES.find(t => t.name === name);
        if (terr) { buildWarFlag(terr); clearWarGarrison(name); clearWarCitizens(name); clearWarWall(name); }
      }
    });
  } catch (e) { /* next sync will catch up */ }
}
// Called every frame — lazily spawns/despawns a territory's garrison as you
// approach/leave (these 9 spots are scattered far across the map, so nothing is
// kept alive when nobody's anywhere near it).
function tickWar(t) {
  if (serverMode !== 'online') return;
  let nearest = null, nearestDist = 70 * COUNTRY_SCALE; // scaled with the 20x country resize (item ~234) so the garrison/wall trigger distance still makes sense at the new city size
  WAR_TERRITORIES.forEach(terr => {
    const d = Math.hypot(playerGroup.position.x - terr.x, playerGroup.position.z - terr.z);
    if (d < nearestDist) { nearestDist = d; nearest = terr; }
  });
  if (nearest !== currentWarZone) {
    if (currentWarZone) { clearWarGarrison(currentWarZone.name); clearWarCitizens(currentWarZone.name); clearWarWall(currentWarZone.name); }
    currentWarZone = nearest;
    if (nearest) {
      const st = territoryState[nearest.name];
      if (!st || !st.captured) { spawnWarGarrison(nearest); spawnWarCitizens(nearest); spawnWarWall(nearest); }
    }
  }
}

// Called every frame from animate() — applies the gathering/hazard mechanic for
// whichever event is currently active; hostileFaction needs no per-frame tick,
// its NPCs are fought the same press-E way as regular robots.
function tickWorldEvent(dt) {
  if (!activeWorldEvent) return;
  if (worldEventCrowd.length && activeWorldEvent.type === 'concert') {
    const t = clock.getElapsedTime();
    worldEventCrowd.forEach(p => {
      const bob = Math.sin(t*4 + p.phase) * 0.12;
      p.meshes[0].position.y = p.baseY[0] + bob;
      p.meshes[1].position.y = p.baseY[1] + bob;
    });
  }
  const { template, x, z, params } = activeWorldEvent.data;
  if (template !== 'gathering' && template !== 'hazard') return;
  const d = Math.hypot(playerGroup.position.x - x, playerGroup.position.z - z);
  const inRange = d <= params.radius;
  if (template === 'gathering') {
    if (!inRange) { worldEventGatherAccum = 0; return; }
    worldEventGatherAccum += dt;
    if (worldEventGatherAccum >= 5) {
      worldEventGatherAccum -= 5;
      queueEarning(params.rewardPerTick, 0, activeWorldEvent.data.name);
      showNotif(`${activeWorldEvent.data.emoji} +${params.rewardPerTick} S.I.P. enjoying ${activeWorldEvent.data.name}!`);
    }
  } else if (template === 'hazard') {
    if (!inRange) { worldEventHazardAccum = 0; return; }
    worldEventHazardAccum += dt;
    if (worldEventHazardAccum >= params.tickSeconds) {
      worldEventHazardAccum -= params.tickSeconds;
      damagePlayer(params.damagePerTick, activeWorldEvent.data.name);
    }
  }
}

// ─── BABIES — married couples (at least one of whom is your friend) can welcome a baby.
// Kept deliberately simple: a baby is a real, permanent, visible addition to the family (a
// crib + nameplate by one parent's house, tracked forever in `children`) rather than a full
// wandering NPC — that would mean inventing a whole child-appearance system and a "growing up"
// simulation, well beyond what a crib and a name need to feel real. ──────────────────────────
const BABY_NAMES = ['Wren','Sage','Fig','Rowan','Pip','Lark','Bo','Nova','Juniper','Milo','Coco','Otto','Ivy','Remy','Bree','Kit','Poppy','Sunny','Arlo','Dot'];
let children = []; // persisted — [{name, parentA, parentB}]
let childMeshes = [];
function buildChildren() {
  childMeshes.forEach(m => scene.remove(m));
  childMeshes = [];
  children.forEach(kid => {
    const parentNpc = npcs.find(n => n.name === kid.parentA) || npcs.find(n => n.name === kid.parentB);
    if (!parentNpc || !parentNpc.home) return;
    const { x, z } = parentNpc.home;
    const cx0 = x - 3, cz0 = z + 1; // a couple units off the house, clear of the driveway/mailbox
    const add = (m) => { childMeshes.push(m); return m; };
    add(box(1.2, 0.5, 0.7, 0xf5efe0, cx0, 0.25, cz0));   // crib base
    add(box(1.2, 0.5, 0.08, 0xf5efe0, cx0, 0.5, cz0 - 0.35)); // crib end panel
    add(box(0.35, 0.2, 0.2, 0xffe0c0, cx0, 0.55, cz0));  // swaddled baby peeking out
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 36;
    const cvx = cv.getContext('2d');
    cvx.fillStyle = 'rgba(0,0,0,0.65)'; cvx.fillRect(0, 0, 128, 36);
    cvx.fillStyle = '#fff'; cvx.font = 'bold 14px Arial'; cvx.textAlign = 'center'; cvx.textBaseline = 'middle';
    cvx.fillText('👶 ' + kid.name, 64, 18);
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.26), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
    tag.position.set(cx0, 1.0, cz0);
    scene.add(tag);
    add(tag);
  });
}
function haveBaby() {
  if (marriages.length === 0) { showNotif('No married couples yet — host a wedding first! 💍'); closeTownEvents(); return; }
  const friendCouples = marriages.filter(m => friends.includes(m.a) || friends.includes(m.b));
  const pool = friendCouples.length ? friendCouples : marriages;
  const couple = pool[Math.floor(Math.random() * pool.length)];
  const usedNames = new Set(children.map(k => k.name));
  const namePool = BABY_NAMES.filter(n => !usedNames.has(n));
  const name = (namePool.length ? namePool : BABY_NAMES)[Math.floor(Math.random() * (namePool.length ? namePool.length : BABY_NAMES.length))];
  children.push({ name, parentA: couple.a, parentB: couple.b });
  saveCurrentUser();
  buildChildren();
  [couple.a, couple.b].forEach(n => { const npc = npcs.find(x => x.name === n); if (npc) setNPCEmotion(npc, '🥰'); });
  queueEarning(15, 0, `${name}'s Birth`);
  sfx.cheer();
  showNotif(`👶 ${couple.a} and ${couple.b} welcomed a baby named ${name}! (+15 S.I.P. baby gift pending)`);
  closeTownEvents();
}

// ─── ELDERS — a small set of elderly townsfolk (deliberately NOT any of your 40 friends) who
// sit near the Town Events board and, after a while of real play, peacefully pass from old age.
// Kept separate from your friends on purpose: your friends are always safe to invest in — invite
// them over, marry them off, hire them — without the risk of losing someone you built a
// relationship with. The elders are the ones whose story is "a long, happy life nearing its end"
// from the moment you meet them, so their eventual passing is bittersweet, not a shock. ────────
const ELDER_IDENTITIES = [
  { id:'rose',   name:'Grandma Rose',   skin:0xf0d0b0, shirt:0x8899bb, pants:0x556677, hairColor:0xe8e8e8 },
  { id:'walter', name:'Grandpa Walter', skin:0xe0b088, shirt:0x77997a, pants:0x445544, hairColor:0xf0f0f0 },
  { id:'mabel',  name:'Grandma Mabel',  skin:0xc9986a, shirt:0xcc8899, pants:0x554455, hairColor:0xdcdcdc },
  { id:'gus',    name:'Grandpa Gus',    skin:0xf5d5b5, shirt:0xaa8855, pants:0x443322, hairColor:0xe0e0e0 },
  { id:'edith',  name:'Grandma Edith',  skin:0xd4a070, shirt:0x88aacc, pants:0x334455, hairColor:0xf5f5f5 },
  { id:'sal',    name:'Grandpa Sal',    skin:0xb87850, shirt:0x998866, pants:0x332211, hairColor:0xd8d8d8 },
];
const ELDER_SPOT = { x:378, z:145 }; // just south of the Town Events board, clear of it
let elderLifespans = {}; // persisted — {elderId: secondsOfPlaytimeRemaining}, seeded lazily on first tick
let elderPassed = {};    // persisted — {elderId: true} once they've gone; permanent
let elderMeshes = {};    // NOT persisted — {elderId: [meshes]} for the living figure or memorial marker
function buildElderFigure(elder, x, z) {
  const made = [];
  made.push(box(0.85, 0.85, 0.85, elder.skin, x, 2.6, z));      // head (sits a little lower — elders stand a bit stooped)
  made.push(box(0.75, 0.9, 0.42, elder.shirt, x, 1.65, z));     // body
  made.push(box(1.0, 0.25, 0.9, elder.hairColor, x, 3.05, z));  // white/gray hair
  made.push(box(0.3, 0.8, 0.3, elder.pants, x - 0.2, 0.7, z));
  made.push(box(0.3, 0.8, 0.3, elder.pants, x + 0.2, 0.7, z));
  made.push(box(0.06, 1.1, 0.06, 0x6b4a2a, x + 0.55, 0.55, z)); // cane
  const cv = document.createElement('canvas'); cv.width = 160; cv.height = 40;
  const cx = cv.getContext('2d');
  cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(0, 0, 160, 40);
  cx.fillStyle = '#fff'; cx.font = 'bold 14px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText(elder.name, 80, 20);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.32), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
  tag.position.set(x, 3.6, z);
  scene.add(tag);
  made.push(tag);
  return made;
}
function buildMemorialMarker(elder, x, z) {
  const made = [];
  made.push(box(0.6, 0.9, 0.15, 0xaaaaaa, x, 0.45, z));
  const cv = document.createElement('canvas'); cv.width = 160; cv.height = 60;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#eee'; cx.fillRect(0, 0, 160, 60);
  cx.fillStyle = '#333'; cx.font = 'bold 13px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText(elder.name, 80, 22);
  cx.font = '11px Arial'; cx.fillText('Fondly remembered 💐', 80, 42);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.42), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
  plaque.position.set(x, 0.85, z + 0.09);
  scene.add(plaque);
  made.push(plaque);
  return made;
}
function buildElders() {
  ELDER_IDENTITIES.forEach((elder, i) => {
    const x = ELDER_SPOT.x + (i - 2.5) * 1.8, z = ELDER_SPOT.z;
    if (elderMeshes[elder.id]) { elderMeshes[elder.id].forEach(m => scene.remove(m)); }
    elderMeshes[elder.id] = elderPassed[elder.id] ? buildMemorialMarker(elder, x, z) : buildElderFigure(elder, x, z);
  });
}
function elderPasses(elder) {
  elderPassed[elder.id] = true;
  saveCurrentUser();
  elderMeshes[elder.id].forEach(m => scene.remove(m));
  const i = ELDER_IDENTITIES.indexOf(elder);
  const x = ELDER_SPOT.x + (i - 2.5) * 1.8, z = ELDER_SPOT.z;
  elderMeshes[elder.id] = buildMemorialMarker(elder, x, z);
  buildEventDecor('funeral', x, z + 1.5);
  sfx.notify();
  showNotif(`🕊️ ${elder.name} passed peacefully, surrounded by a long, happy life in this town. Everyone left a flower. 💐`);
}
function tickElders(dt) {
  ELDER_IDENTITIES.forEach(elder => {
    if (elderPassed[elder.id]) return;
    if (elderLifespans[elder.id] === undefined) elderLifespans[elder.id] = 480 + Math.random() * 720; // 8-20 min of real play
    elderLifespans[elder.id] -= dt;
    if (elderLifespans[elder.id] <= 0) elderPasses(elder);
  });
}

// ─── PRODUCT SHAPES — one real-looking little shape per BASE ingredient (40 entries, matching
// BASE_INGREDIENTS 1-for-1). All 25 styles of a base ("Organic Tomato", "Frozen Tomato", ...)
// share the same shape — only the price/name changes with style, so 40 entries is all we need,
// same "hand-made seed table" trick used elsewhere in this file (STORE_INGREDIENTS, TRACKS...).
const PRODUCT_SHAPES = {
  tomato:{shape:'sphere', color:0xE84C3D, stem:0x2ECC71},
  carrot:{shape:'cone', color:0xE8871E, stem:0x2ECC71},
  cheese:{shape:'wedge', color:0xF5D76E},
  bread:{shape:'box', color:0xC9974C, dims:[1.3,0.8,0.9], label:true},
  milk:{shape:'carton', color:0xFFFFFF, accent:0x3B7DD8},
  eggs:{shape:'carton', color:0xE8D9B5, accent:0xE8D9B5, eggTop:true},
  chicken:{shape:'sphere', color:0xE8B87A, squash:0.6},
  apple:{shape:'sphere', color:0xD2373B, stem:0x6B4423},
  onion:{shape:'sphere', color:0xE8D9C0, stem:0x8BC34A},
  banana:{shape:'curved', color:0xF3D250},
  grapes:{shape:'cluster', color:0x8E44AD},
  fish:{shape:'sphere', color:0x7FA8C9, squash:0.55},
  rice:{shape:'box', color:0xF7F3E8, dims:[1,1.2,0.7], bagTop:true, label:true},
  butter:{shape:'box', color:0xF5DEB0, dims:[1.2,0.5,0.7]},
  potato:{shape:'sphere', color:0xC8A165},
  corn:{shape:'cylinder', color:0xF6D743, accent:0x6FA84A},
  broccoli:{shape:'sphere', color:0x3D8B3D, stem:0x6FA84A, stemPos:'bottom'},
  strawberry:{shape:'cone', color:0xE0324F, stem:0x2ECC71},
  orange:{shape:'sphere', color:0xF0932B},
  watermelon:{shape:'sphere', color:0x2ECC71},
  pepper:{shape:'sphere', color:0xE74C3C, stem:0x2ECC71},
  mushroom:{shape:'mushroom', color:0xC9B79C},
  garlic:{shape:'sphere', color:0xF5F0E0},
  lemon:{shape:'sphere', color:0xF6E625},
  avocado:{shape:'sphere', color:0x5B7F3A},
  bacon:{shape:'box', color:0xD26B6B, dims:[1.4,0.25,0.7]},
  shrimp:{shape:'curved', color:0xF0A0A0},
  honey:{shape:'cylinder', color:0xE8A93B, lid:0xC9974C},
  yogurt:{shape:'cylinder', color:0xFFFFFF, lid:0xE84C8A},
  pasta:{shape:'box', color:0xF3D89A, dims:[0.9,1.3,0.6], label:true},
  cereal:{shape:'box', color:0xE8A93B, dims:[1.1,1.5,0.6], label:true},
  cookie:{shape:'cylinder', color:0xC9974C, flat:true},
  chocolate:{shape:'box', color:0x5C3A21, dims:[1.3,0.35,0.8]},
  pretzel:{shape:'ring', color:0xA9713D},
  peanuts:{shape:'box', color:0xC9974C, dims:[1,1.2,0.6], bagTop:true, label:true},
  icecream:{shape:'cone-scoop', color:0xE8C39E, accent:0xF5E1C8},
  soda:{shape:'cylinder', color:0xD23C3C, label:true},
  coffee:{shape:'cylinder', color:0x4A2E1E, label:true},
  tea:{shape:'box', color:0x3D8B5C, dims:[0.9,1.1,0.6], label:true},
  chips:{shape:'box', color:0xE8A93B, dims:[1,1.3,0.6], bagTop:true, label:true},
};
// A small emoji-on-a-card label stuck to the front face of a boxed/bagged/canned product,
// so packaged goods read as "a box OF something" instead of an anonymous colored block.
function addProductLabel(g, x, y, z, baseId, size) {
  const base = BASE_INGREDIENTS.find(b => b.id === baseId);
  const cv = document.createElement('canvas'); cv.width = 48; cv.height = 48;
  const cx = cv.getContext('2d');
  cx.fillStyle = 'rgba(255,255,255,0.92)'; cx.fillRect(3, 3, 42, 42);
  cx.font = '26px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText(base ? base.emoji : '❓', 24, 25);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
  plane.position.set(x, y, z);
  g.add(plane);
}
// Builds one real-shaped product item sitting on a shelf. g/x/z are the same LOCAL group/coords
// every other piece in this room uses; shelfTopY is the shelf surface the item's base sits on.
// size is the item's rough scale (~0.16-0.22, the old "cube size"); jitterSeed lightens/darkens
// the color a little per-item so a full shelf of the same product doesn't look perfectly cloned.
function addProductItem(g, x, shelfTopY, z, baseId, size, jitterSeed) {
  const spec = PRODUCT_SHAPES[baseId] || { shape: 'box', color: 0x9a9a9a };
  let color = spec.color;
  if (jitterSeed !== undefined) {
    const hsl = {};
    new THREE.Color(color).getHSL(hsl);
    const j = ((jitterSeed % 10) - 5) * 0.02;
    color = new THREE.Color().setHSL(hsl.h, hsl.s, Math.min(0.85, Math.max(0.15, hsl.l + j))).getHex();
  }
  const s = size;
  const mkP = (geo, col, dx, dy, dz) => {
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: col }));
    m.position.set(x + dx, shelfTopY + dy, z + dz);
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
    return m;
  };
  switch (spec.shape) {
    case 'sphere': {
      const r = s, squash = spec.squash || 1;
      let baseY = r * squash;
      if (spec.stem && spec.stemPos === 'bottom') {
        const stemH = r * 0.7;
        mkP(new THREE.CylinderGeometry(r * 0.22, r * 0.22, stemH, 6), spec.stem, 0, stemH / 2, 0);
        baseY = stemH + r * squash * 0.8;
      }
      const sph = mkP(new THREE.SphereGeometry(r, 7, 6), color, 0, baseY, 0);
      sph.scale.y = squash;
      if (spec.stem && spec.stemPos !== 'bottom') {
        mkP(new THREE.ConeGeometry(r * 0.22, r * 0.4, 5), spec.stem, 0, baseY + r * squash - r * 0.15, 0);
      }
      break;
    }
    case 'cone': { // point-down cone (carrot, strawberry) — apex touches the shelf, wide end on top
      const rTop = s * 0.55, h = s * 1.6;
      const cone = mkP(new THREE.ConeGeometry(rTop, h, 6), color, 0, h / 2, 0);
      cone.rotation.x = Math.PI;
      if (spec.stem) mkP(new THREE.ConeGeometry(rTop * 0.35, rTop * 0.6, 5), spec.stem, 0, h - rTop * 0.1, 0);
      break;
    }
    case 'cone-scoop': { // ice cream — same point-down cone, plus a scoop sphere on top
      const rTop = s * 0.5, h = s * 1.5;
      const cone = mkP(new THREE.ConeGeometry(rTop, h, 7), color, 0, h / 2, 0);
      cone.rotation.x = Math.PI;
      mkP(new THREE.SphereGeometry(rTop * 1.05, 8, 6), spec.accent || color, 0, h + rTop * 0.7, 0);
      break;
    }
    case 'cylinder': {
      const r = s * 0.55, h = spec.flat ? s * 0.5 : s * 1.7;
      mkP(new THREE.CylinderGeometry(r, r, h, 8), color, 0, h / 2, 0);
      if (spec.accent) mkP(new THREE.CylinderGeometry(r * 1.02, r * 1.02, h * 0.18, 8), spec.accent, 0, h * 0.12, 0);
      if (spec.lid) mkP(new THREE.CylinderGeometry(r * 0.9, r * 0.9, h * 0.12, 8), spec.lid, 0, h + h * 0.06, 0);
      if (spec.label) addProductLabel(g, x, shelfTopY + h * 0.55, z + r + 0.005, baseId, r * 1.5);
      break;
    }
    case 'wedge': { // triangular-prism cheese wedge — a 3-sided cylinder is a wedge block
      const r = s * 0.75, len = s * 1.3;
      const w = mkP(new THREE.CylinderGeometry(r, r, len, 3), color, 0, r * 0.85, 0);
      w.rotation.z = Math.PI / 2;
      w.rotation.y = Math.PI / 6;
      break;
    }
    case 'carton': { // milk/eggs — a box with a small cap/spout block; eggs peek out white domes
      const w = s * 1.1, h = s * 1.6, d = s * 1.0;
      mkP(new THREE.BoxGeometry(w, h, d), color, 0, h / 2, 0);
      mkP(new THREE.BoxGeometry(w * 0.5, h * 0.18, d * 0.5), spec.accent || color, 0, h + h * 0.09, 0);
      if (spec.eggTop) [-w * 0.2, w * 0.2].forEach(ox => mkP(new THREE.SphereGeometry(s * 0.22, 6, 5), 0xffffff, ox, h + s * 0.16, 0));
      break;
    }
    case 'curved': { // banana/shrimp — a tilted tapered cylinder
      const r = s * 0.35, h = s * 1.6;
      const m = mkP(new THREE.CylinderGeometry(r * 0.6, r, h, 6), color, 0, h / 2, 0);
      m.rotation.z = 0.35;
      break;
    }
    case 'cluster': { // grapes — a little pyramid of small spheres
      const r = s * 0.35;
      [[0, 0, 0], [r * 1.3, 0, r * 0.4], [-r * 1.3, 0, r * 0.4], [r * 0.7, -r * 1.1, -r * 0.3], [-r * 0.7, -r * 1.1, -r * 0.3], [0, -r * 1.9, 0.1]]
        .forEach(([ox, oy, oz]) => mkP(new THREE.SphereGeometry(r, 6, 5), color, ox, r * 1.9 + oy, oz));
      break;
    }
    case 'mushroom': {
      const stemH = s * 0.9, stemR = s * 0.22;
      mkP(new THREE.CylinderGeometry(stemR, stemR, stemH, 6), 0xF0EAD6, 0, stemH / 2, 0);
      mkP(new THREE.SphereGeometry(s * 0.55, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), color, 0, stemH, 0);
      break;
    }
    case 'ring': { // pretzel
      const ring = mkP(new THREE.TorusGeometry(s * 0.5, s * 0.17, 6, 10), color, 0, s * 0.55, 0);
      ring.rotation.x = Math.PI / 2;
      break;
    }
    case 'box': default: {
      const dims = spec.dims || [1, 1, 1];
      const w = s * 1.3 * dims[0], h = s * 1.3 * dims[1], d = s * 1.2 * dims[2];
      mkP(new THREE.BoxGeometry(w, h, d), color, 0, h / 2, 0);
      if (spec.bagTop) {
        const top = mkP(new THREE.BoxGeometry(w * 0.75, h * 0.22, d * 0.7), color, 0, h + h * 0.09, 0);
        top.rotation.z = 0.25;
      }
      if (spec.label) addProductLabel(g, x, shelfTopY + h * 0.5, z + d / 2 + 0.005, baseId, Math.min(w, h) * 0.85);
      break;
    }
  }
}

// A simple standing staff figure behind a counter — g/mk match everything else in this room
// (mk(w,h,d,color,dx,dy,dz) adds a LOCAL-space box to g); name shows on a small floating tag.
function addStaffFigure(g, mk, x, z, name) {
  const skin = 0xE8B87A, shirt = 0x557799, apron = 0xf5f0e0;
  mk(0.5, 0.9, 0.3, shirt, x, 0.75, z);          // body
  mk(0.42, 0.55, 0.06, apron, x, 0.55, z + 0.16); // apron
  mk(0.4, 0.4, 0.4, skin, x, 1.35, z);            // head
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 40;
  const cx = cv.getContext('2d');
  cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(0, 0, 128, 40);
  cx.fillStyle = '#fff'; cx.font = 'bold 16px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText('👤 ' + name, 64, 20);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.32), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
  tag.position.set(x, 1.75, z);
  g.add(tag);
}

// ─── STORE 3D MODELS — shelf unit, exterior facade dressing, interior layout dressing ──
// g: THREE.Group to add meshes to (already positioned in the room, so use LOCAL coords)
// x, z: local floor position for this shelf unit (baseline y=0)
// ing: {id, name, emoji, price, taste} — the ingredient stocked here
// count: current stock number (0 = empty)
function buildShelfUnit(g, x, z, ing, count) {
  ing = ing || { id: 'unknown', name: 'Unknown Item', emoji: '❓', price: 0, taste: '' };
  count = count || 0;

  // small deterministic string hash so colors/jitter are stable per-ingredient (not random each rebuild)
  const hashStr = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  };

  const addBox = (w, h, d, color, dx, dy, dz) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
    mesh.position.set(dx, dy, dz);
    mesh.castShadow = true; mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  };

  // ─── frame: base plinth, 2 side posts, 2 shelf boards, top cap ───
  const UNIT_W = 1.6, UNIT_D = 0.5, POST_H = 1.5;
  const LOWER_Y = 0.55, UPPER_Y = 1.15;
  const postColor = 0x6b4423, boardColor = 0x8B5A2B, plinthColor = 0x5c3a1e;

  addBox(UNIT_W, 0.06, UNIT_D + 0.05, plinthColor, x, 0.03, z);              // base plinth (foot, grounds the unit)
  addBox(0.08, POST_H, 0.08, postColor, x - 0.72, POST_H / 2, z);            // left side post
  addBox(0.08, POST_H, 0.08, postColor, x + 0.72, POST_H / 2, z);            // right side post
  addBox(1.5, 0.05, UNIT_D, boardColor, x, LOWER_Y, z);                      // lower shelf board
  addBox(1.5, 0.05, UNIT_D, boardColor, x, UPPER_Y, z);                      // upper shelf board
  addBox(UNIT_W, 0.05, UNIT_D + 0.05, boardColor, x, POST_H - 0.025, z);     // top cap board

  // ─── real product shapes on the upper shelf, one row, count-driven so stock is visible at a glance ───
  // Up to 6 items shown; more than that (count>6) is still visible on the price tag as a number.
  const n = Math.min(count, 6);
  if (n > 0) {
    const shelfTopY = UPPER_Y + 0.025;
    const spanW = 1.2;
    const step = n > 1 ? spanW / (n - 1) : 0;
    for (let i = 0; i < n; i++) {
      const px = n > 1 ? -spanW / 2 + i * step : 0;
      const pz = z + (i % 2 === 0 ? -0.04 : 0.04); // slight front/back stagger so the row isn't robotic
      const size = 0.16 + (hashStr(ing.id + '_s' + i) % 5) * 0.015; // 0.16 - 0.22
      addProductItem(g, x + px, shelfTopY, pz, ing.baseId, size, hashStr(ing.id + '_l' + i));
    }
  }
  // count === 0 -> no products added, shelf stays visibly bare.

  // ─── tilted price-tag placard, standing at the front edge of the lower shelf ───
  const cv = document.createElement('canvas'); cv.width = 200; cv.height = 140;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#fffbe8'; cx.fillRect(0, 0, 200, 140);
  cx.strokeStyle = '#333'; cx.lineWidth = 4; cx.strokeRect(2, 2, 196, 136);
  cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.font = '46px Arial';
  cx.fillText(ing.emoji, 100, 40);
  cx.fillStyle = '#222'; cx.font = 'bold 16px Arial';
  const displayName = ing.name.length > 16 ? ing.name.slice(0, 15) + '…' : ing.name;
  cx.fillText(displayName, 100, 80);
  cx.fillStyle = '#0a7a2f'; cx.font = 'bold 20px Arial';
  cx.fillText('$' + ing.price, 100, 105);
  cx.fillStyle = count > 0 ? '#0a7a2f' : '#b02020';
  cx.font = 'bold 14px Arial';
  cx.fillText(count > 0 ? (count + ' in stock') : 'EMPTY', 100, 126);

  const tex = new THREE.CanvasTexture(cv);
  const placard = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.35),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  placard.position.set(x, LOWER_Y + 0.025 + 0.175, z + UNIT_D / 2 + 0.03);
  placard.rotation.x = -0.3; // leans back slightly like a real shelf-edge price tag stand
  g.add(placard);
}

// g: THREE.Group the main store building is already added to (LOCAL coords, since g gets positioned once at the end)
// mkBox(w,h,d,color,dx,dy,dz): helper defined by the caller — builds a BoxGeometry mesh, adds it to g
// def: the store tier definition {id, name, price, size, floors, furnished}
// sz: {w, d, fh} for this tier's footprint; totalH: total building height (fh * floors)
function buildStoreFacade(g, mkBox, def, sz, totalH) {
  const isKiosk = def.size === 'small' && !def.furnished; // bare-bones smallest tier — trim back the decor
  const scale = sz.w / 14;                 // 1.0 at the "medium" footprint; shrinks on kiosk, grows on large/xlarge
  const frontZ = sz.d/2 + 0.16;            // matches the existing glass-front pane's z offset

  // Striped awning/canopy over the entrance — teal/cream is an original combo (deliberately
  // not Shopee orange or any single real chain's palette).
  const awningY = sz.fh * 0.62;
  const awningDepth = isKiosk ? 1.1 : 1.6;
  const slatW = Math.max(0.8, (sz.w - 2) / 8);
  const slatCount = Math.max(2, Math.round((sz.w - 2) / slatW));
  for (let i = 0; i < slatCount; i++) {
    const sx = -sz.w/2 + 1 + slatW/2 + i*slatW;
    const stripeColor = (i % 2 === 0) ? 0x1FA6A0 : 0xFFF6E5; // teal / cream stripes
    const slat = mkBox(slatW - 0.05, 0.18, awningDepth, stripeColor, sx, awningY, frontZ + awningDepth/2 - 0.05);
    slat.rotation.x = -0.12;
  }
  mkBox(sz.w - 1.8, 0.12, 0.12, 0x14403E, 0, awningY - 0.5, frontZ + awningDepth - 0.1); // fascia trim

  // Planter boxes flanking the entrance
  if (!isKiosk) {
    const planterOffset = Math.min(sz.w/2 - 0.8, 3.2 + (sz.w - 14) * 0.15);
    [-1, 1].forEach(side => {
      const px = side * planterOffset;
      mkBox(1.1*scale + 0.5, 0.7, 1.1*scale + 0.5, 0x8B5A3C, px, 0.35, frontZ + 0.6);
      mkBox(0.9*scale + 0.3, 0.6, 0.9*scale + 0.3, 0x2E7D46, px, 0.95, frontZ + 0.6);
    });
  } else {
    mkBox(0.8, 0.55, 0.8, 0x8B5A3C, sz.w/2 - 1, 0.28, frontZ + 0.5);
    mkBox(0.6, 0.5, 0.6, 0x2E7D46, sz.w/2 - 1, 0.78, frontZ + 0.5);
  }

  // Entrance step / floor mat
  const matW = Math.min(sz.w - 2, 4 + (sz.w - 10) * 0.3);
  mkBox(matW, 0.08, 1.4, 0x5B3A29, 0, 0.04, frontZ + 0.9);

  // Small illuminated secondary sign board — distinct from the big floating name sign
  const boardW = isKiosk ? 0.9 : 1.3;
  const boardH = isKiosk ? 0.6 : 0.9;
  const boardX = sz.w/2 - boardW/2 - 0.3;
  const boardY = Math.min(totalH - 0.6, 2.1);
  mkBox(boardW, boardH, 0.08, 0x0E2E4D, boardX, boardY, frontZ + 0.06);
  mkBox(boardW - 0.14, boardH - 0.14, 0.1, 0xFFE28A, boardX, boardY, frontZ + 0.1);

  // Shopping-cart corral — only once the store is big enough to plausibly stock carts
  if (sz.w >= 14) {
    const corralX = -Math.min(sz.w/2 - 1.4, 5);
    const corralZ = frontZ + 2.4;
    const barColor = 0xBFC4C8;
    [-0.9, 0.9].forEach(dz => mkBox(0.06, 0.9, 0.06, barColor, corralX - 0.9, 0.45, corralZ + dz));
    [-0.9, 0.9].forEach(dz => mkBox(0.06, 0.9, 0.06, barColor, corralX + 0.9, 0.45, corralZ + dz));
    mkBox(1.9, 0.06, 0.06, barColor, corralX, 0.85, corralZ - 0.9);
    mkBox(1.9, 0.06, 0.06, barColor, corralX, 0.85, corralZ + 0.9);
    mkBox(1.9, 0.06, 0.06, barColor, corralX, 0.15, corralZ - 0.9);
    mkBox(1.9, 0.06, 0.06, barColor, corralX, 0.15, corralZ + 0.9);
  }
}

// g: THREE.Group the room is already built inside (LOCAL coords); mk = local box helper
// roomW, roomD: this store's current interior room width/depth
function buildStoreLayoutExtras(g, mk, roomW, roomD) {
  function makeCanvasTexture(w, h, draw) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d');
    draw(cx, w, h);
    return new THREE.CanvasTexture(cv);
  }

  // ── checkerboard floor tile overlay, laid just above the existing plain floor box ──
  const tileTex = makeCanvasTexture(64, 64, (cx) => {
    cx.fillStyle = '#d9d2c0'; cx.fillRect(0, 0, 64, 64);
    cx.fillStyle = '#b9ab8c';
    cx.fillRect(0, 0, 32, 32);
    cx.fillRect(32, 32, 32, 32);
  });
  tileTex.wrapS = THREE.RepeatWrapping;
  tileTex.wrapT = THREE.RepeatWrapping;
  tileTex.repeat.set(Math.max(2, Math.round(roomW / 1.5)), Math.max(2, Math.round(roomD / 1.5)));
  const floorTiles = new THREE.Mesh(
    new THREE.PlaneGeometry(roomW, roomD),
    new THREE.MeshLambertMaterial({ map: tileTex })
  );
  floorTiles.rotation.x = -Math.PI / 2;
  floorTiles.position.set(0, 0.305, 0);
  floorTiles.receiveShadow = true;
  g.add(floorTiles);

  // Welcome mat decal near the door — only drawn once its near edge can't possibly reach the manager trigger circle
  const matZ = roomD / 2 - 1.7;
  if ((matZ - 0.7) - 2 > 2.5) {
    const matTex = makeCanvasTexture(128, 64, (cx, w, h) => {
      cx.fillStyle = '#7a3b2e'; cx.fillRect(0, 0, w, h);
      cx.fillStyle = '#c98a5b'; cx.fillRect(6, 6, w - 12, h - 12);
      cx.fillStyle = '#3a2018'; cx.font = 'bold 16px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText('WELCOME', w / 2, h / 2);
    });
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.4), new THREE.MeshBasicMaterial({ map: matTex }));
    mat.rotation.x = -Math.PI / 2;
    mat.position.set(0, 0.31, matZ);
    g.add(mat);
  }

  // ── checkout-style counter dressing — stays within the existing counter footprint ──
  function dressCounter(cx, cz, baseColor) {
    mk(2.0, 0.3, 0.5, baseColor, cx, 1.15, cz - 0.25);          // raised back ledge
    mk(0.55, 0.35, 0.4, 0x333333, cx + 0.45, 1.48, cz - 0.35);  // register/till body
    const screen = mk(0.32, 0.22, 0.05, 0x224466, cx + 0.45, 1.68, cz - 0.55);
    screen.rotation.x = -0.3;
    mk(2.1, 1.3, 0.12, 0xe8e2d5, cx, 0.65, cz + 0.56);          // front kick-panel
    mk(2.1, 0.15, 0.14, baseColor, cx, 1.05, cz + 0.57);        // accent stripe
    const signTex = makeCanvasTexture(160, 64, (sc) => {
      sc.fillStyle = 'rgba(20,20,20,0.85)'; sc.fillRect(0, 0, 160, 64);
      sc.fillStyle = '#ffd54a'; sc.font = 'bold 22px Arial'; sc.textAlign = 'center'; sc.textBaseline = 'middle';
      sc.fillText('CHECKOUT', 80, 32);
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.6), new THREE.MeshBasicMaterial({ map: signTex, transparent: true }));
    sign.position.set(cx, 2.3, cz - 0.2);
    g.add(sign);
  }
  dressCounter(-3, -4, 0x8B5A2B); // ingredients counter
  dressCounter(3, -4, 0x557799);  // furniture counter

  // ── hanging ceiling light fixtures, scaled to stay inside the walls at every store tier ──
  const lightSpots = [
    { x: -roomW * 0.22, z: -roomD * 0.25 },
    { x: roomW * 0.22, z: -roomD * 0.25 },
    { x: -roomW * 0.22, z: roomD * 0.20 },
    { x: roomW * 0.22, z: roomD * 0.20 },
  ];
  lightSpots.forEach(({ x, z }) => {
    mk(0.06, 0.25, 0.06, 0x555555, x, 4.93, z);
    mk(0.8, 0.15, 0.8, 0x333333, x, 4.80, z);
    mk(0.55, 0.06, 0.55, 0xfff8dc, x, 4.71, z);
  });

  // ── basket/cart stack near the entrance, tucked clear of the door gap and all trigger circles ──
  const bx = roomW / 2 - 0.9;
  const bz = roomD / 2 - 1.3;
  const cartGeo = new THREE.BoxGeometry(0.7, 0.5, 0.5);
  const cartWire = new THREE.LineSegments(
    new THREE.EdgesGeometry(cartGeo),
    new THREE.LineBasicMaterial({ color: 0x88aa88 })
  );
  cartWire.position.set(bx, 0.35, bz - 0.4);
  g.add(cartWire);
  mk(0.5, 0.2, 0.4, 0x3fae5c, bx, 0.15, bz + 0.4);
  mk(0.42, 0.18, 0.34, 0xd23f3f, bx, 0.33, bz + 0.4);
  mk(0.36, 0.16, 0.3, 0x3f7fd2, bx, 0.5, bz + 0.4);

  // ── "WELCOME" sign over the doorway ──
  const openTex = makeCanvasTexture(256, 96, (cx) => {
    cx.fillStyle = '#1c1c1c'; cx.fillRect(0, 0, 256, 96);
    cx.strokeStyle = '#ffffff'; cx.lineWidth = 4; cx.strokeRect(6, 6, 244, 84);
    cx.fillStyle = '#3fe25a'; cx.font = 'bold 36px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('WELCOME', 128, 50);
  });
  const openSign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.85), new THREE.MeshBasicMaterial({ map: openTex, transparent: true }));
  openSign.position.set(0, 4.3, roomD / 2 - 0.18);
  g.add(openSign);
}

// Builds (or rebuilds) the player's owned store at STORE_PLOT. Safe to call with no store
// owned — it just clears whatever was there before and leaves the plot empty.
function buildOwnedStore(){
  if(storeGroup){ scene.remove(storeGroup); storeGroup=null; }
  if(storeSignMesh){ scene.remove(storeSignMesh); storeSignMesh=null; }
  storeCustomerNPCs.forEach(npc => {
    scene.remove(npc.group);
    const i = npcs.indexOf(npc); if(i>-1) npcs.splice(i,1);
  });
  storeCustomerNPCs = [];
  if(window._storeColIdx != null){ CITY_COLS.splice(window._storeColIdx,1); window._storeColIdx=null; }

  if(!ownedStore) return;
  const def = STORE_CATALOG.find(s => s.id === ownedStore.id);
  const sz = STORE_SIZES[def.size];
  const {x,z} = ownedStore.location || STORE_PLOT; // older saves from before free placement fall back to the old fixed spot
  const totalH = sz.fh * def.floors;

  const g = new THREE.Group();
  const mkBox=(w,h,d,color,dx,dy,dz)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color}));
    m.position.set(dx,dy,dz); m.castShadow=true; m.receiveShadow=true; g.add(m); return m;
  };
  const wallColor = def.furnished ? 0xD8A657 : 0xB0B0B0;
  mkBox(sz.w, totalH, sz.d, wallColor, 0, totalH/2, 0);              // main body
  mkBox(sz.w+1, 0.5, sz.d+1, 0x333333, 0, totalH+0.25, 0);            // roof
  mkBox(sz.w-2, totalH-1, 0.3, 0xAEE3FF, 0, totalH/2, sz.d/2+0.16);   // glass front
  if(def.floors===2) mkBox(sz.w+0.4, 0.3, sz.d+0.4, 0x333333, 0, sz.fh, 0); // floor divider band
  if(def.furnished)  mkBox(sz.w-4, 1.2, 1, 0x8B5A2B, 0, 1.2, sz.d/2-1.5);   // shelf visible through the glass
  buildStoreFacade(g, mkBox, def, sz, totalH);
  g.position.set(x,0,z);
  scene.add(g);
  storeGroup = g;
  buildSign('🏪 ' + (ownedStore.customName || def.name), x, totalH+1.4, z+sz.d/2+0.2);

  window._storeColIdx = CITY_COLS.length;
  addCol(CITY_COLS, x, z, sz.w/2, sz.d/2);

  // Real bug report: "when you place your shop in a random location the door won't open" — the
  // ONLY interact zone for your store was the old fixed pre-free-placement spot (x:160,z:-13, see
  // CITY_ZONES' own initial list), which never moved even though this function has genuinely
  // built the real store wherever you placed it (via `ownedStore.location`) since free placement
  // was added. Confirmed the mismatch by reading confirmStorePlacement()/isStoreSpotValid() — they
  // let you pick ANY open ground, not just that one spot. Registering a real zone at the actual
  // built location — found-and-removed by object reference (same `indexOf` pattern the robot
  // zones already use below), not a cached index, since CITY_ZONES is shared/spliced by plenty of
  // other systems and a raw index could silently point at the wrong entry by the next rebuild.
  if (window._storeZone) { const zi = CITY_ZONES.indexOf(window._storeZone); if (zi > -1) CITY_ZONES.splice(zi, 1); }
  window._storeZone = { x, z: z + sz.d/2 + 3, r:8, label:'🏪 ' + (ownedStore.customName || def.name), action: () => interactWithStorePlot()};
  CITY_ZONES.push(window._storeZone);

  // Customer NPCs patrol between the sidewalk and the door, giving the "people shopping" look
  const doorZ = z + sz.d/2 + 3;
  [-4, 4].forEach((ox,i) => {
    const cdef = {
      name:'Shopper'+(i+1), role:'Customer', skin: i===0?0xe0b080:0xc07840, shirt:0x557799, pants:0x333333,
      pos:[x+ox, 0, doorZ+6],
      patrol:[[x+ox, doorZ+6],[x, doorZ],[x+ox, doorZ+6],[x-ox, doorZ+6]],
      hair: i===0 ? 'short' : 'long', hairColor:0x2a1505,
    };
    const npc = makeNPC(cdef);
    npcs.push(npc);
    storeCustomerNPCs.push(npc);
  });

  buildStoreInterior();
  updateStoreSign();
}

// Rebuilds the walk-in interior at STORE_INTERIOR. Room size follows the current store's
// tier; furniture pieces are placed at their fixed slot so they never overlap.
function buildStoreInterior(){
  if(storeInteriorGroup){ scene.remove(storeInteriorGroup); storeInteriorGroup=null; }
  if(!ownedStore) return;
  const def = STORE_CATALOG.find(s => s.id === ownedStore.id);
  const sz = STORE_SIZES[def.size];
  const roomW = sz.w, roomD = currentRoomDepth(); // a bit deeper than the exterior footprint for walking room + shelves

  const g = new THREE.Group();
  const mk=(w,h,d,color,dx,dy,dz)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color}));
    m.position.set(dx,dy,dz); m.castShadow=true; m.receiveShadow=true; g.add(m); return m;
  };
  mk(roomW, 0.3, roomD, 0xc8aa80, 0, 0.15, 0);          // floor
  mk(roomW, 0.2, roomD, 0xf5f0e8, 0, 5, 0);             // ceiling
  mk(roomW, 5, 0.3, 0xf5efe0, 0, 2.5, -roomD/2);        // back wall
  mk(7, 5, 0.3, 0xf5efe0, -roomW/2+3.5, 2.5, roomD/2);  // front wall left (door gap between)
  mk(7, 5, 0.3, 0xf5efe0,  roomW/2-3.5, 2.5, roomD/2);  // front wall right
  mk(0.3, 5, roomD, 0xf5efe0, -roomW/2, 2.5, 0);        // left wall
  mk(0.3, 5, roomD, 0xf5efe0,  roomW/2, 2.5, 0);        // right wall

  // Windows — can't literally see the outside city (this room is its own teleported space,
  // same trick your House/Hotel use), so these are a painted sky/street scene instead
  const winTex = buildWindowSceneTexture();
  [-roomD/4, roomD/4].forEach(wz => {
    [-roomW/2+0.2, roomW/2-0.2].forEach(wx => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.8), new THREE.MeshBasicMaterial({map:winTex}));
      win.position.set(wx, 2.8, wz);
      win.rotation.y = wx<0 ? Math.PI/2 : -Math.PI/2;
      g.add(win);
    });
  });

  // Counter blocks — visual markers matching STORE_ZONES' fixed trigger positions
  mk(2, 1, 1, 0x8B5A2B, -3, 0.5, -4);  // ingredients counter
  mk(2, 1, 1, 0x557799,  3, 0.5, -4);  // furniture counter

  // Ingredient shelves — one labeled shelf per type, showing what's stocked there and how many
  getShelfSlots().forEach(slot => {
    const lp = shelfLocalPos(slot, roomD);
    const ing = STORE_INGREDIENTS.find(i => i.id === slot.id);
    const count = storeStock[slot.id] || 0;
    buildShelfUnit(g, lp.x, lp.z, ing, count);
  });

  // Owned furniture — one fixed slot per piece, so pieces never overlap regardless of order bought
  ownedFurniture.forEach(fid => {
    const f = FURNITURE_CATALOG.find(x => x.id === fid);
    if(!f) return;
    mk(1.2, 1, 1, 0xAA8855, f.slot.x, 0.6, f.slot.z);
  });

  buildStoreLayoutExtras(g, mk, roomW, roomD);

  // Hired staff stand behind the two counters — a visible reason the shop can run without you
  const staffSpots = [{x:-3, z:-4.35}, {x:3, z:-4.35}];
  ownedStaff.forEach((staff, i) => {
    if(staffSpots[i]) addStaffFigure(g, mk, staffSpots[i].x, staffSpots[i].z, staff.name);
  });

  g.position.set(STORE_INTERIOR.x, 0, STORE_INTERIOR.z);
  scene.add(g);
  storeInteriorGroup = g;
}
// A simple painted "looking outside" scene reused for every window pane
let _windowSceneTexture = null;
function buildWindowSceneTexture(){
  if(_windowSceneTexture) return _windowSceneTexture;
  const cv = document.createElement('canvas'); cv.width=256; cv.height=180;
  const c = cv.getContext('2d');
  const sky = c.createLinearGradient(0,0,0,180);
  sky.addColorStop(0,'#87CEEB'); sky.addColorStop(1,'#c8e8f5');
  c.fillStyle=sky; c.fillRect(0,0,256,180);
  c.fillStyle='#5a9e3c'; c.fillRect(0,140,256,40); // ground strip
  c.fillStyle='#ffffff';
  [[30,40,18],[70,55,14],[190,35,20],[220,50,12]].forEach(([x,y,r])=>{ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); });
  c.fillStyle='#ffdd55'; c.beginPath(); c.arc(220,30,16,0,Math.PI*2); c.fill(); // sun
  _windowSceneTexture = new THREE.CanvasTexture(cv);
  return _windowSceneTexture;
}

// ─── COUNTRY ZONES ────────────────────────────────────────────────────────────
// ─── COUNTRY TOWN THEMES ──────────────────────────────────────────────────────
// Instead of writing shop/park/lamp code 8 separate times (once per country),
// we write it ONCE in buildTownExtras() and feed it a different "theme" object
// for each country. Same function, different data in = different town out.
const COUNTRY_THEMES = [
  { name:'Japan',     cx:COUNTRY_CENTERS.Japan.x,     cz:COUNTRY_CENTERS.Japan.z,     wall:0xf5e6d3, roof:0xcc3333, glass:0xffc9dd, tree:0xffaabb, lamp:0xff88aa, shops:['🍣 Sushi Bar','🍜 Ramen Shop','🎎 Kimono Store','🍙 Onigiri Stand','🎏 Origami Studio','🥋 Dojo'] },
  { name:'France',    cx:COUNTRY_CENTERS.France.x,    cz:COUNTRY_CENTERS.France.z,    wall:0xf0e8d8, roof:0x8899bb, glass:0xcfe6ff, tree:0x5c8a4a, lamp:0xffd700, shops:['🥐 Bakery','☕ Café','🎨 Art Shop','🧀 Cheese Shop','🍷 Wine Cellar','👗 Fashion Boutique'] },
  { name:'Brazil',    cx:COUNTRY_CENTERS.Brazil.x,    cz:COUNTRY_CENTERS.Brazil.z,    wall:0xffdd88, roof:0x00aa44, glass:0x9fe8ff, tree:0x22aa33, lamp:0xff8800, shops:['⚽ Soccer Shop','🥥 Juice Bar','🎉 Carnival Store','🎶 Samba Studio','🏖️ Beach Shop','🦜 Rainforest Tours'] },
  { name:'Egypt',     cx:COUNTRY_CENTERS.Egypt.x,     cz:COUNTRY_CENTERS.Egypt.z,     wall:0xe8cf9a, roof:0xcc9944, glass:0xffe9b8, tree:0xb8934a, lamp:0xffdd88, shops:['🏺 Pottery Shop','🐫 Camel Rides','💎 Gem Market','🌶️ Spice Market','📜 Papyrus Shop','⛵ Nile Cruise Booth'] },
  { name:'UK',        cx:COUNTRY_CENTERS.UK.x,        cz:COUNTRY_CENTERS.UK.z,        wall:0x9aabcc, roof:0x667799, glass:0xcfe0ff, tree:0x4a7a4a, lamp:0xaabbcc, shops:['🫖 Tea House','📚 Book Shop','☂️ Umbrella Store','🎻 Music Hall','🍺 Pub','🎩 Hat Shop'] },
  { name:'Australia', cx:COUNTRY_CENTERS.Australia.x, cz:COUNTRY_CENTERS.Australia.z, wall:0xf5f5f5, roof:0xffcc00, glass:0xbfe8ff, tree:0x2d7a2d, lamp:0xffbb44, shops:['🏄 Surf Shop','🍬 Candy Shack','🐨 Wildlife Store','🦘 Outback Tours','🥧 Meat Pie Shop','🏊 Dive Shop'] },
  { name:'Canada',    cx:COUNTRY_CENTERS.Canada.x,    cz:COUNTRY_CENTERS.Canada.z,    wall:0xffffff, roof:0xcc2222, glass:0xcfe6ff, tree:0x1a7a1a, lamp:0xff4444, shops:['🏒 Hockey Shop','🥞 Pancake House','🧣 Winter Gear','🍁 Maple Syrup Shop','🎣 Fishing Store','🛶 Canoe Rentals'] },
  { name:'Italy',     cx:COUNTRY_CENTERS.Italy.x,     cz:COUNTRY_CENTERS.Italy.z,     wall:0xddb870, roof:0xcc9944, glass:0xffe0b0, tree:0x2d7a2d, lamp:0xffcc88, shops:['🍝 Pasta House','🍦 Gelato Shop','🎭 Mask Shop','🍷 Vineyard Shop','🏛️ Museum Gift Shop','🚤 Gondola Rides'] },
];

// A real city now, not a one-block "little town": a plaza, TWO rows of named shops (6 total, up
// from 3), a filler skyline of varied-height apartment/office towers flanking both sides, a bigger
// park, and a longer lit street — every country got the same real upgrade, not a cosmetic tweak
// to just one. Deliberately kept the filler towers UNNAMED/non-interactive (real named shops still
// come from COUNTRY_THEMES.shops) so the "6 real shops per country" count stays honest, not padded.
function buildTownExtras(t){
  const {cx,cz,wall,roof,glass,tree,lamp,shops}=t;
  // Stone plaza pad behind the landmark — widened/lengthened for the bigger city behind it.
  // NOTE: France and UK's landmarks sit only 141 units apart (the closest of any two countries) —
  // every distance below was sized and then verified (live bounding-box check) to keep that closest
  // pair clear, which automatically keeps every other, much-further-apart pair clear too.
  box(64,0.08,52, 0x999988, cx,0.04,cz+38);

  // Two rows of 3 named shops each (6 real distinct shops per country)
  shops.forEach((name,i)=>{
    const row = i < 3 ? 0 : 1;
    const col = i % 3;
    const sx = cx-16+col*16, sz = cz+34+row*14;
    box(11,8,11, wall, sx,4,sz);          // shop body
    box(11,0.5,11, roof, sx,8.3,sz);      // roof cap
    box(4,6,0.3, glass, sx,3,sz-5.6);     // glass front
    buildSign(name, sx,9,sz-6);
    addCol(CITY_COLS, sx,sz, 5.5,5.5);
  });

  // Filler skyline — varied-height towers flanking both sides of the shop blocks, real windows.
  // The LAST slot on each side (i%4===3) is skipped here and built as a real Airport/Hotel below
  // instead — same verified-safe footprint a filler tower would have used, so swapping in a real
  // named building there adds zero new overlap risk with the neighboring country's city.
  const winMat = new THREE.MeshBasicMaterial({color:0xffee99});
  [-30,-30,-30,-30, 30,30,30,30].forEach((dx,i)=>{
    if (i%4 === 3) return;
    const dz = cz + 16 + (i%4)*13;
    const h = 12 + ((i*37) % 22); // deterministic pseudo-variety, no Math.random() needed for a stable skyline
    box(9,h,9, wall, cx+dx,h/2,dz);
    box(9.4,0.4,9.4, roof, cx+dx,h+0.2,dz);
    for(let wRow=0; wRow*3+2<h; wRow+=3){
      // A manually-built mesh, not routed through box() — needs the same scalePt()/scaleLen()
      // treatment box() applies internally, done by hand here (see those functions' own comment).
      const [wx,wz] = scalePt(cx+dx, dz-4.55);
      const win = new THREE.Mesh(new THREE.BoxGeometry(scaleLen(7.2),scaleLen(1.2),scaleLen(0.1)), winMat);
      win.position.set(wx, scaleLen(wRow+2), wz);
      scene.add(win);
    }
    addCol(CITY_COLS, cx+dx,dz, 4.5,4.5);
  });

  // A real Airport + a real Hotel per country (item 154) — reusing the (-30/+30, dz+55) slot
  // the filler loop above deliberately skipped. apX/apZ/htX/htZ stay UNSCALED (box()/addCol()/
  // buildSign() below scale them automatically, same as everywhere else in this function) — but
  // CITY_ZONES.push and the enterAirportLounge()/checkinCountryHotel() calls bypass all 3 of
  // those helpers entirely, so they need a real, explicitly-scaled copy of the same point.
  const apX = cx-30, apZ = cz+16+3*13, htX = cx+30, htZ = apZ;
  const [apXs,apZs] = scalePt(apX,apZ), [htXs,htZs] = scalePt(htX,htZ);
  box(9,3,9, 0xcccccc, apX,1.5,apZ);
  box(1.6,6,1.6, 0x888888, apX,6,apZ);
  { const [bx,bz] = scalePt(apX,apZ);
    const bulb=new THREE.Mesh(new THREE.SphereGeometry(scaleLen(0.4),8,8), new THREE.MeshBasicMaterial({color:0xff3333})); bulb.position.set(bx,scaleLen(9.2),bz); scene.add(bulb);
    const pl=new THREE.PointLight(0xff3333,0.8,scaleLen(14)); pl.position.set(bx,scaleLen(9.2),bz); scene.add(pl); }
  buildSign(`✈️ ${t.name} Airport`, apX,5,apZ-5.2);
  addCol(CITY_COLS, apX,apZ, 4.5,4.5);
  CITY_ZONES.push({ x:apXs, z:apZs-scaleLen(4.6), r:scaleLen(3.2), label:`✈️ ${t.name} Airport`, action: () => enterAirportLounge(t.name, apXs, apZs-scaleLen(8), false) });

  box(9,10,9, 0xddccbb, htX,5,htZ);
  box(9.4,0.4,9.4, 0x8a6a4a, htX,10.2,htZ);
  buildSign(`🏨 ${t.name} Hotel`, htX,11,htZ-5.2);
  addCol(CITY_COLS, htX,htZ, 4.5,4.5);
  CITY_ZONES.push({ x:htXs, z:htZs-scaleLen(4.6), r:scaleLen(3.2), label:`🏨 ${t.name} Hotel`, action: () => checkinCountryHotel(t.name, htXs, htZs-scaleLen(7)) });

  // A real park strip down the middle, wider than before
  [[cx-26,cz+14],[cx+26,cz+14],[cx-26,cz+58],[cx+26,cz+58],[cx-26,cz+36],[cx+26,cz+36]].forEach(([tx,tz])=>{
    box(0.6,3.5,0.6, 0x5c3a1e, tx,1.75,tz);
    treeMeshes.push(box(3.4,3.4,3.4, tree, tx,5,tz));
  });

  // Street lamps lining the whole longer plaza, not just flanking the front
  [cz+16, cz+30, cz+44, cz+58].forEach(lz=>{
    [[cx-23,lz],[cx+23,lz]].forEach(([lx])=>{
      box(0.25,6,0.25, 0x444444, lx,3,lz);
      const [bx,bz] = scalePt(lx,lz);
      const bulb=new THREE.Mesh(new THREE.SphereGeometry(scaleLen(0.35),8,8), new THREE.MeshBasicMaterial({color:lamp}));
      bulb.position.set(bx,scaleLen(6),bz); scene.add(bulb);
      const pl=new THREE.PointLight(lamp,0.6,scaleLen(16)); pl.position.set(bx,scaleLen(5.8),bz); scene.add(pl);
    });
  });
}

function buildCountryZones(){
  // Every country's landmark block below sets a transient build-context (_buildOrigin/
  // _buildScale, see box()'s own comment in HELPERS) for the duration of that ONE country, then
  // resets it — box()/addCol()/buildSign() all read it automatically. jx/jz (etc.) are now the
  // real, final, 20x-scaled centers (item ~234, user: "lets make the countrys 20 times bigger" —
  // see COUNTRY_CENTERS' own comment for the new ring layout) — every "jx-8"/"jz+12"-style local
  // offset used throughout each block is untouched from the original, still expressed the exact
  // same way it always was; box() scales just that small offset by 20x automatically, so none of
  // these ~100 call sites needed hand-editing individually.

  // JAPAN
  const jx=COUNTRY_CENTERS.Japan.x, jz=COUNTRY_CENTERS.Japan.z;
  _buildOrigin={x:jx,z:jz}; _buildScale=COUNTRY_SCALE;
  box(20,15,16, 0xf5e6d3, jx,7.5,jz);
  box(24,1.2,20, 0xcc3333, jx,15.8,jz);
  box(22,0.5,18, 0xaa2222, jx,17,jz);
  box(1.5,12,1.5, 0xcc2200, jx-8,6,jz+12); box(1.5,12,1.5, 0xcc2200, jx+8,6,jz+12);
  box(18,1.8,2, 0xcc2200, jx,13,jz+12); box(18,1,1.5, 0xcc2200, jx,11,jz+12);
  [-12,-6,0,6,12].forEach(i=>{ box(0.5,5,0.5,0x4a2800,jx+i,2.5,jz+18); box(5,4,5,0xffaabb,jx+i,6,jz+18); });
  buildSign('🌸 JAPAN',jx,18,jz+10);
  { const [px,pz]=scalePt(jx,jz); const pl=new THREE.PointLight(0xff88aa,1.2,scaleLen(50)); pl.position.set(px,scaleLen(8),pz); scene.add(pl); }
  addCol(CITY_COLS,jx,jz,12,10);
  _buildOrigin=null; _buildScale=1;

  // FRANCE
  const fx=COUNTRY_CENTERS.France.x, fz=COUNTRY_CENTERS.France.z;
  _buildOrigin={x:fx,z:fz}; _buildScale=COUNTRY_SCALE;
  box(16,12,14, 0xf0e8d8, fx,6,fz);
  box(18,0.6,16, 0xddccaa, fx,12.4,fz);
  // Mini Eiffel Tower
  box(14,1.5,14, 0x666677, fx+22,0.75,fz);
  box(9,2,9,    0x666677, fx+22,2.5, fz);
  box(5,2,5,    0x777788, fx+22,4.5, fz);
  box(2,20,2,   0x888899, fx+22,7,   fz);
  box(0.4,8,0.4, 0x999900, fx+22,28, fz);
  { const [px,pz]=scalePt(fx+22,fz); const pl=new THREE.PointLight(0xffd700,1.2,scaleLen(60)); pl.position.set(px,scaleLen(18),pz); scene.add(pl); }
  buildSign('🗼 FRANCE',fx,14,fz+8);
  addCol(CITY_COLS,fx,fz,10,9);
  _buildOrigin=null; _buildScale=1;

  // BRAZIL
  const brx=COUNTRY_CENTERS.Brazil.x, brz=COUNTRY_CENTERS.Brazil.z;
  _buildOrigin={x:brx,z:brz}; _buildScale=COUNTRY_SCALE;
  box(22,14,16, 0xffaa00, brx,7,brz);
  box(24,0.6,18, 0x00aa44, brx,14.4,brz);
  box(10,10,10, 0xff4422, brx+18,5,brz);
  box(10,12,10, 0x00aadd, brx-18,6,brz);
  [-12,-6,0,6,12].forEach(i=>{ box(0.5,8,0.5,0x4a2800,brx+i,4,brz+14); box(7,3,7,0x22aa33,brx+i,9,brz+14); });
  buildSign('🌴 BRAZIL',brx,17,brz+10);
  { const [px,pz]=scalePt(brx,brz); const pl=new THREE.PointLight(0xff8800,1.5,scaleLen(50)); pl.position.set(px,scaleLen(10),pz); scene.add(pl); }
  addCol(CITY_COLS,brx,brz,13,10);
  _buildOrigin=null; _buildScale=1;

  // EGYPT
  const ex=COUNTRY_CENTERS.Egypt.x, ez=COUNTRY_CENTERS.Egypt.z;
  _buildOrigin={x:ex,z:ez}; _buildScale=COUNTRY_SCALE;
  for(let i=0;i<9;i++){ const s=18-i*1.9; box(s,2,s,0xddb860,ex,i*2+1,ez); }
  box(14,5,7,  0xcc9944, ex+28,2.5,ez);
  box(4,6,4,   0xddb860, ex+35,5.5,ez);
  box(2,3,8,   0xcc9944, ex+25,1,ez);
  buildSign('🏛️ EGYPT',ex,20,ez+10);
  { const [px,pz]=scalePt(ex,ez); const pl=new THREE.PointLight(0xffdd88,2.0,scaleLen(70)); pl.position.set(px,scaleLen(12),pz); scene.add(pl); }
  addCol(CITY_COLS,ex,ez,10,10);
  _buildOrigin=null; _buildScale=1;

  // UK
  const ux=COUNTRY_CENTERS.UK.x, uz=COUNTRY_CENTERS.UK.z;
  _buildOrigin={x:ux,z:uz}; _buildScale=COUNTRY_SCALE;
  box(20,14,16, 0x8899bb, ux,7,uz);
  box(22,0.5,18, 0x667799, ux,14.4,uz);
  box(2.2,5.5,2.2, 0xdd2222, ux+12,2.8,uz+10);
  box(2.4,0.5,2.4,  0xcc1111, ux+12,5.7,uz+10);
  box(9,45,9,   0x998877, ux-20,22.5,uz);
  box(11,4,11,  0x887766, ux-20,46,uz);
  box(0.6,12,0.6, 0x555544, ux-20,52,uz);
  buildSign('🎡 UK',ux,16,uz+10);
  { const [px,pz]=scalePt(ux,uz); const pl=new THREE.PointLight(0xaabbcc,1.2,scaleLen(50)); pl.position.set(px,scaleLen(10),pz); scene.add(pl); }
  addCol(CITY_COLS,ux,uz,12,10);
  _buildOrigin=null; _buildScale=1;

  // AUSTRALIA
  const ax=COUNTRY_CENTERS.Australia.x, az=COUNTRY_CENTERS.Australia.z;
  _buildOrigin={x:ax,z:az}; _buildScale=COUNTRY_SCALE;
  box(28,6,18, 0xf0f0f0, ax,3,az);
  box(14,16,10, 0xf5f5f5, ax-6,11,az);
  box(12,12,8,  0xeeeeee, ax+7,9,az);
  box(8,8,6,    0xffffff, ax,6.5,az+10);
  box(0.2,5,3, 0xffcc00, ax+18,2.5,az+8);
  buildSign('🦘 AUSTRALIA',ax,20,az+10);
  { const [px,pz]=scalePt(ax,az); const pl=new THREE.PointLight(0xffbb44,1.5,scaleLen(50)); pl.position.set(px,scaleLen(10),pz); scene.add(pl); }
  addCol(CITY_COLS,ax,az,15,11);
  _buildOrigin=null; _buildScale=1;

  // CANADA
  const cx2=COUNTRY_CENTERS.Canada.x, cz2=COUNTRY_CENTERS.Canada.z;
  _buildOrigin={x:cx2,z:cz2}; _buildScale=COUNTRY_SCALE;
  box(22,14,16, 0xcc2222, cx2,7,cz2);
  box(24,0.5,18, 0xffffff, cx2,14.4,cz2);
  box(14,10,14, 0xdd3333, cx2+22,5,cz2);
  [-12,-6,0,6,12].forEach(i=>{
    box(0.4,6,0.4,0x2a1400,cx2+i,3,cz2+14);
    box(5,3,5,0x1a5e1a,cx2+i,6.5,cz2+14);
    box(4,2,4,0x1a7a1a,cx2+i,8.5,cz2+14);
    box(2,2,2,0x22aa22,cx2+i,10.5,cz2+14);
  });
  buildSign('🍁 CANADA',cx2,17,cz2+10);
  { const [px,pz]=scalePt(cx2,cz2); const pl=new THREE.PointLight(0xff4444,1.2,scaleLen(50)); pl.position.set(px,scaleLen(10),pz); scene.add(pl); }
  addCol(CITY_COLS,cx2,cz2,13,10);
  _buildOrigin=null; _buildScale=1;

  // ITALY
  const ix=COUNTRY_CENTERS.Italy.x, iz=COUNTRY_CENTERS.Italy.z;
  _buildOrigin={x:ix,z:iz}; _buildScale=COUNTRY_SCALE;
  for(let a=0;a<8;a++){
    const ang=a*Math.PI/4, rx=Math.cos(ang)*20, rz=Math.sin(ang)*20;
    box(5,20,5, 0xddb870, ix+rx,10,iz+rz);
    box(6,2,6,  0xcc9944, ix+rx,21,iz+rz);
  }
  box(0.6,18,42, 0xccaa66, ix,9,iz-20);
  box(0.6,18,42, 0xccaa66, ix,9,iz+20);
  buildSign('🍕 ITALY',ix,24,iz+22);
  { const [px,pz]=scalePt(ix,iz); const pl=new THREE.PointLight(0xffcc88,1.8,scaleLen(70)); pl.position.set(px,scaleLen(12),pz); scene.add(pl); }
  addCol(CITY_COLS,ix,iz,22,22);
  _buildOrigin=null; _buildScale=1;

  // Give every country its own little town (shops + park + lamps)
  COUNTRY_THEMES.forEach(t => {
    _buildOrigin = {x:t.cx, z:t.cz}; _buildScale = COUNTRY_SCALE;
    buildTownExtras(t);
    _buildOrigin = null; _buildScale = 1;
  });
}

// ─── SPACE STATION — a real 9th flight destination, reached through the exact same
// openAirport()/buyFlight()/startFlightAnim() every country already uses (that whole pipeline
// is generic over dest.x/dest.z/name/emoji/desc, so a new AIRPORT_FLIGHTS entry is all it takes
// to make it bookable — see SPACE_ZONE below for the real low-gravity effect once you're there). ──
const SPACE_ZONE = { x:COUNTRY_CENTERS['Space Station'].x, z:COUNTRY_CENTERS['Space Station'].z, r:60*COUNTRY_SCALE };
function buildSpaceZone(){
  const { x:sx, z:sz } = SPACE_ZONE;
  _buildOrigin = {x:sx, z:sz}; _buildScale = COUNTRY_SCALE; // item ~234, "lets make the countrys 20 times bigger" — see box()'s own comment
  // Gray cratered "moon" platform, raised slightly above the default ground so it visually reads
  // as its own surface rather than just city grass with props scattered on it.
  box(110, 0.6, 110, 0x8a8a8a, sx, 0.3, sz);
  const craterSpots = [[-25,-20],[18,-12],[-8,22],[30,18],[0,0],[-30,10]];
  craterSpots.forEach(([dx,dz]) => box(10+Math.random()*6, 0.3, 10+Math.random()*6, 0x6f6f6f, sx+dx, 0.55, sz+dz));
  // Rocket ship — nose cone + body + fins, the real landmark for the zone. Already its own
  // self-contained local-origin THREE.Group, so scaling it 20x is a real, direct group.scale —
  // unlike everywhere else in this file, box()'s scalePt()/scaleLen() can't reach INSIDE an
  // existing group's own local-space children, so this one spot uses the group-scale approach
  // the rest of this refactor deliberately avoided (see box()'s own comment for why).
  const [rx,rz] = scalePt(sx, sz-18);
  // Real, human-proportioned rocket now (see scaleLen()'s own comment) — only its LAND POSITION
  // is spread out with everything else, not its own size.
  const rocket = new THREE.Group(); rocket.position.set(rx, 0, rz); rocket.scale.setScalar(1); scene.add(rocket);
  rocket.add(new THREE.Mesh(new THREE.CylinderGeometry(3,3,16,10), mat(0xe0e0e0)).translateY(9));
  const nose = new THREE.Mesh(new THREE.ConeGeometry(3,7,10), mat(0xcc3333)); nose.position.y = 20.5; rocket.add(nose);
  [0,1,2,3].forEach(i => { const ang=i*Math.PI/2; const fin=new THREE.Mesh(new THREE.BoxGeometry(0.4,4,2.5), mat(0xcc3333)); fin.position.set(Math.cos(ang)*3.2, 2, Math.sin(ang)*3.2); fin.rotation.y=ang; rocket.add(fin); });
  const glow = new THREE.PointLight(0x66ccff, 2, scaleLen(40)); glow.position.set(rx, scaleLen(10), rz); scene.add(glow);
  // Planted flag — a small "someone was here" landmark, matches the Moon-landing fantasy
  box(0.15, 6, 0.15, 0xcccccc, sx+14, 3, sz+6);
  box(2.2, 1.4, 0.1, 0x4fd8ff, sx+15, 5.3, sz+6);
  // A scatter of real stars overhead — small emissive spheres, cheap and reads fine against the sky
  for(let i=0;i<40;i++){
    const s = i*137.508;
    const [px,pz] = scalePt(sx + ((s*0.618)%1 - 0.5)*140, sz + ((s*0.382)%1 - 0.5)*140);
    const star = new THREE.Mesh(new THREE.SphereGeometry(scaleLen(0.25),4,4), new THREE.MeshBasicMaterial({color:0xffffff}));
    star.position.set(px, scaleLen(26+((s*0.214)%1)*14), pz);
    scene.add(star);
  }
  buildSign('🚀 SPACE STATION', sx, 26, sz+24);
  addCol(CITY_COLS, sx, sz-18, 4, 4); // real collider so you can't just walk through the rocket
  // User's own follow-up: "need to go into space" — the platform/rocket/low-gravity walk were all
  // real, but there was never an actual way to LEAVE the ground and fly up into the stars. rx,rz
  // is the rocket's own already-scaled world position (computed above), reused here rather than
  // calling scalePt() a second time. toggleSpaceLaunch() is a real zero-g thruster flight, not a
  // teleport-and-look — see its own comment.
  CITY_ZONES.push({ x: rx, z: rz, r: 100, label: '🚀 Launch into Space', action: () => toggleSpaceLaunch()});
  _buildOrigin = null; _buildScale = 1;
}

// ─── DEEP SPACE — user's own follow-up: "lets make mars moon and more the farther longer and
// more expensive". 4 more real flight destinations past the Space Station, booked from a real
// terminal there through the exact same openAirport()/buyFlight()/startFlightAnim() pipeline
// (see SPACE_FLIGHTS below) — farther in actual world distance from Explox genuinely costs more
// and genuinely takes longer to fly (startFlightAnim's DURATION is now per-flight, not a flat
// 12s for everyone). No _buildOrigin/COUNTRY_SCALE dance here — these are placed directly at
// their real final coordinates, comfortably inside the existing ±12000 ground plane, so box()/
// addCol() run in their plain unscaled mode.
const MOON_ZONE      = { name:'Moon',      x:8457,  z:3078,   r:120, gravity:12 }; // real Moon gravity ~1/6 Earth's — stylized, same idea SPACE_ZONE already used
const MARS_ZONE      = { name:'Mars',      x:-1702, z:9652,   r:120, gravity:20 }; // real Mars gravity ~1/3 Earth's
const JUPITER_ZONE   = { name:'Jupiter',   x:-10500,z:0,      r:120, gravity:50 }; // real Jupiter gravity is HEAVIER than Earth's — a fun twist, jumping is harder here
const ANDROMEDA_ZONE = { name:'Andromeda', x:-1980, z:-11227, r:120, gravity:3  }; // deep space — true zero-g, same value inOuterSpace uses
// Every real gravity zone in the game, checked in the main jump/gravity tick below — replaces the
// single hardcoded inSpaceZone check the Space Station used to own alone.
const GRAVITY_ZONES = [
  { x:SPACE_ZONE.x, z:SPACE_ZONE.z, r:SPACE_ZONE.r, gravity:14 },
  MOON_ZONE, MARS_ZONE, JUPITER_ZONE, ANDROMEDA_ZONE,
];
function currentGravity() {
  if (!playerGroup) return 34;
  for (const g of GRAVITY_ZONES) {
    if (Math.hypot(playerGroup.position.x-g.x, playerGroup.position.z-g.z) < g.r) return g.gravity;
  }
  return 34;
}
// Shared builder for all 4 — same real "platform + craters + landmark + stars + sign" shape
// buildSpaceZone() already established, just parameterized so a genuinely different landmark per
// world (buildLandmark) is the only thing that has to vary.
function buildPlanetZone(zone, groundColor, craterColor, buildLandmark) {
  const { x:px, z:pz } = zone;
  box(110, 0.6, 110, groundColor, px, 0.3, pz);
  [[-25,-20],[18,-12],[-8,22],[30,18],[0,0],[-30,10]].forEach(([dx,dz]) => box(10+Math.random()*6, 0.3, 10+Math.random()*6, craterColor, px+dx, 0.55, pz+dz));
  buildLandmark(px, pz);
  for(let i=0;i<40;i++){
    const s = i*137.508;
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.3,4,4), new THREE.MeshBasicMaterial({color:0xffffff}));
    star.position.set(px + ((s*0.618)%1 - 0.5)*140, 26+((s*0.214)%1)*14, pz + ((s*0.382)%1 - 0.5)*140);
    scene.add(star);
  }
  buildSign(`🪐 ${zone.name.toUpperCase()}`, px, 26, pz+24);
  addCol(CITY_COLS, px, pz, 10, 10);
}
function buildDeepSpaceZones() {
  // MOON — grey dust, a real lander (box body + 4 angled legs), planted flag.
  buildPlanetZone(MOON_ZONE, 0x999999, 0x777777, (px,pz) => {
    box(4, 3, 4, 0xdddddd, px, 1.5, pz-14);
    [[-2,-2],[2,-2],[-2,2],[2,2]].forEach(([dx,dz]) => { const leg = box(0.3,3,0.3,0x888888, px+dx, 0.3, pz-14+dz); leg.rotation.z = dx<0?0.3:-0.3; });
    box(0.15, 5, 0.15, 0xcccccc, px+14, 2.5, pz+6);
    box(2.2, 1.4, 0.1, 0xffffff, px+15, 4.8, pz+6);
  });
  // MARS — red dust, real rover (box body + 4 wheels + antenna).
  buildPlanetZone(MARS_ZONE, 0xaa4422, 0x882211, (px,pz) => {
    box(5, 1.6, 3.2, 0xcc6633, px, 1.6, pz-14);
    [[-2,-1.3],[2,-1.3],[-2,1.3],[2,1.3]].forEach(([dx,dz]) => { const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.6,0.4,10), mat(0x222222)); wheel.rotation.x=Math.PI/2; wheel.position.set(px+dx,0.6,pz-14+dz); scene.add(wheel); });
    box(0.12, 3, 0.12, 0xcccccc, px, 3.2, pz-14);
    box(0.6, 0.6, 0.1, 0x88ccff, px, 4.6, pz-14);
  });
  // JUPITER — a floating outpost platform above the storm bands (a huge banded sphere below).
  buildPlanetZone(JUPITER_ZONE, 0x998866, 0x776644, (px,pz) => {
    const planet = new THREE.Mesh(new THREE.SphereGeometry(90,16,16), new THREE.MeshLambertMaterial({color:0xcc9955}));
    planet.position.set(px, -70, pz); scene.add(planet);
    [0xddaa66,0xbb8844,0xeecc99].forEach((c,i) => { const band = new THREE.Mesh(new THREE.TorusGeometry(90,6,6,24), new THREE.MeshBasicMaterial({color:c})); band.position.set(px,-70+i*18-18,pz); band.rotation.x=Math.PI/2; scene.add(band); });
    box(3, 6, 3, 0xaaaaaa, px, 3, pz-14);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(1.6,8,8,0,Math.PI), new THREE.MeshLambertMaterial({color:0xdddddd}));
    dish.position.set(px, 6.5, pz-14); dish.rotation.x = -Math.PI/2.5; scene.add(dish);
  });
  // ANDROMEDA — alien deep space: dark ground, glowing crystal formations, a beacon.
  buildPlanetZone(ANDROMEDA_ZONE, 0x1a0a2a, 0x2a1a3a, (px,pz) => {
    [[-3,-3,4],[3,-2,6],[0,3,5],[-2,4,3.5]].forEach(([dx,dz,h]) => {
      const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.8,h,5), new THREE.MeshLambertMaterial({color:0x9933ff, emissive:0x6600cc}));
      crystal.position.set(px+dx,h/2,pz-14+dz); scene.add(crystal);
    });
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.2,10,10), new THREE.MeshBasicMaterial({color:0xff66ff}));
    beacon.position.set(px, 4, pz-14); scene.add(beacon);
    scene.add(new THREE.PointLight(0xff66ff, 2, 60));
  });
  // Real terminal at the Space Station itself, a short walk from the rocket (not overlapping its
  // own r:100 zone) — pressing E here opens the exact same generic flight-picker every airport uses.
  box(3, 3, 3, 0x445566, SPACE_ZONE.x+30, 1.5, SPACE_ZONE.z+20);
  buildSign('🛰️ DEEP SPACE TERMINAL', SPACE_ZONE.x+30, 5, SPACE_ZONE.z+20-2);
  addCol(CITY_COLS, SPACE_ZONE.x+30, SPACE_ZONE.z+20, 2, 2);
  CITY_ZONES.push({ x:SPACE_ZONE.x+30, z:SPACE_ZONE.z+20, r:8, label:'🛰️ Deep Space Terminal — Fly Farther', action: () => openSpaceTravel()});
}
// Booked from a real terminal at the Space Station (not mixed into AIRPORT_FLIGHTS — these aren't
// Earth countries) through the exact same generic openAirport()/buyFlight() every other flight
// uses. price/duration both scale with real distance from Explox (Math.hypot from the origin) —
// farther is genuinely pricier and genuinely slower, not just flavor text.
const SPACE_FLIGHTS = [
  // User's own follow-up: "too cheap" — bumped well past the Earth countries (70-150ish) to feel
  // like a real milestone purchase relative to this game's actual currency scale, not pocket change.
  { name:'Moon',      emoji:'🌕', desc:'Grey dust, a real lander, and 1/6 gravity',        price:5000,   duration:15000, x:MOON_ZONE.x,      z:MOON_ZONE.z      },
  { name:'Mars',      emoji:'🔴', desc:'Red dust, a real rover, and lighter gravity',       price:15000,  duration:20000, x:MARS_ZONE.x,      z:MARS_ZONE.z      },
  { name:'Jupiter',   emoji:'🟠', desc:'An outpost above the storm bands — heavier gravity',price:50000,  duration:28000, x:JUPITER_ZONE.x,   z:JUPITER_ZONE.z   },
  { name:'Andromeda', emoji:'💫', desc:'Deep space — alien crystals and true zero gravity', price:150000, duration:40000, x:ANDROMEDA_ZONE.x, z:ANDROMEDA_ZONE.z },
  { name:'Space Station', emoji:'🚀', desc:'Back to the Space Station', price:20, duration:8000, x:SPACE_ZONE.x, z:SPACE_ZONE.z+600 },
];
function openSpaceTravel() { openAirport(SPACE_FLIGHTS); }

