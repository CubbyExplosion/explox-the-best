// ─── ALIGNMENT & BAD GUY ─────────────────────────────────────────────────────
let alignment   = 'good'; // 'good' | 'bad'
let wantedLevel = 0;      // 0-3 stars; officers chase at 1+
const robbedCooldowns = {}; // shopName → seconds remaining

const BLACK_MARKET_ITEMS = [
  { name:'🗡️ Stiletto Knife', cost:35,  weaponId:'stiletto' },
  { name:'🥷 Shadow Hoodie',   cost:50,  shirtId:'shadow' },
];

// User's own ask: "if you are bad evil entitys eg robot robber killers won't harm you and work
// for free" — three real pieces, not just flavor text: (1) immunity from Scrapyard/Rogue/Arena
// robots, robbers, and ambient/hired-against-you killers, gated at each real damage/steal call
// site rather than a fragile label-matching hack in damagePlayer() itself; (2) Hire a Killer
// (both modes) is free for a Bad player — see confirmHireKiller()/hireKillerAgainstType()
// (game-social.js); (3) any nearby robot/robber/killer periodically lands a real hit on whatever
// the player is currently fighting, reusing the exact landCompanionHit()/getCompanionCombatTarget()
// pipeline Buddy already uses — a genuine assist, not a stat bump. Deliberately does NOT cover War
// Territory soldiers/tanks, World Event mobs, or Invasion Attempt invaders — those are different
// systems (armies/events), not literally "robots, robbers, or killers".
function isEvilImmune() { return alignment === 'bad'; }
const EVIL_ALLY_RADIUS = 10, EVIL_ALLY_INTERVAL = 3, EVIL_ALLY_DAMAGE_MULT = 0.3, EVIL_ALLY_MAX_HELPERS = 3;
function tickEvilAllies(dt) {
  if (!isEvilImmune()) return;
  const target = getCompanionCombatTarget();
  if (!target) return;
  const px = playerGroup.position.x, pz = playerGroup.position.z;
  const candidates = [
    ...killers.filter(k => k.alive && !k.guardKiller && !k.hitTargetName && !k.hitTargetType),
    ...rogueRobots.filter(r => r.alive),
  ];
  let helpers = 0;
  for (const e of candidates) {
    if (helpers >= EVIL_ALLY_MAX_HELPERS) break;
    if (Math.hypot(px-e.x, pz-e.z) > EVIL_ALLY_RADIUS) continue;
    helpers++;
    e._evilAllyTimer = (e._evilAllyTimer || 0) + dt;
    if (e._evilAllyTimer < EVIL_ALLY_INTERVAL) continue;
    e._evilAllyTimer = 0;
    const label = e.robber ? '🥷 A robber' : e.demon ? `${e.demonDef.emoji} ${e.demonDef.name}` : e.spy ? '🕵️ A Spy' : (e.type ? `🤖 ${e.type.name}` : '🔪 A killer');
    landCompanionHit(target, EVIL_ALLY_DAMAGE_MULT, label);
  }
}

function toggleJob(type, pay, taskText) {
  if(activeJob !== type && activeBankJob) { showNotif('❌ Already working a Bank job — quit that one first!'); return; }
  if(activeJob === type) {
    if(jobTaskActive) { completeJobTask(); return; } // E during an active task completes it, doesn't quit
    quitJob('Stopped working.');
  } else {
    activeJob = type; activeJobPay = pay; activeJobTaskText = taskText;
    jobTaskActive = false;
    jobNextTaskIn = 2 + Math.random()*3; // first task arrives soon after clocking in
    showNotif(`Started working as ${type}! You'll need to help out when asked.`);
  }
  renderJobsPanel();
}
// ACTOR — user's own ask: "add acting," followed up with "it will be a fighting movie." Starting/
// quitting still goes through the shared toggleJob()/tickJob() engine (Shopkeeper/Officer/Factory
// jobs all rely on that same shared plumbing, untouched) — but completing a task is NOT the
// generic instant "press E," since a fight needs more than a heartbeat. While a task is active,
// pressing E instead spawns/fights a real stunt double (actorFightTarget) right there; only
// defeating it calls completeJobTask() for real pay. tickActorFight() (called from the main loop,
// game-controls.js, right after tickJob()) keeps the job HUD's normal 4-second miss-timer from
// ever expiring mid-fight and cleans up if the job gets quit/interrupted with a fight still live.
const ACTOR_PAY = 18;
let actorFightTarget = null; // {hp, maxHp, mesh} — a real, ephemeral opponent, never persisted
function startActingJob() {
  if (activeJob === 'Actor' && jobTaskActive) {
    if (!actorFightTarget) spawnActorStuntFight(); else fightActorStunt();
    return;
  }
  if (activeJob === 'Actor') { toggleJob('Actor', ACTOR_PAY, ''); return; } // no live task — this is the quit path
  const m = CINEMA_MOVIES[Math.floor(Math.random()*CINEMA_MOVIES.length)];
  toggleJob('Actor', ACTOR_PAY, `🎬 Action! Fight the stunt double in "${m.title}"!`);
}
function buildStuntMesh(x, z) {
  const g = new THREE.Group();
  function b(w,h,d,color,px,py,pz) { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color)); m.position.set(px,py,pz); m.castShadow=true; g.add(m); return m; }
  b(0.55,0.85,0.32, 0x556677, 0,1.15,0);   // padded stunt suit torso
  b(0.4,0.4,0.4, 0xd4a070, 0,1.85,0);      // head
  b(0.42,0.16,0.35, 0x222222, 0,1.95,0);   // stunt helmet
  b(0.5,0.75,0.3, 0x333333, 0,0.55,0);     // stunt suit legs
  g.position.set(x,0,z);
  scene.add(g);
  return g;
}
const ACTOR_STUNT_HP = 30, ACTOR_STUNT_RANGE = 3.5;
function spawnActorStuntFight() {
  const x = playerGroup.position.x + Math.sin(yaw)*2.5, z = playerGroup.position.z + Math.cos(yaw)*2.5;
  actorFightTarget = { hp: ACTOR_STUNT_HP, maxHp: ACTOR_STUNT_HP, mesh: buildStuntMesh(x, z) };
  showNotif('🎬 Stunt double is ready — walk up and press E to fight!');
}
function fightActorStunt() {
  if (!actorFightTarget) return;
  const dx = playerGroup.position.x - actorFightTarget.mesh.position.x, dz = playerGroup.position.z - actorFightTarget.mesh.position.z;
  if (Math.hypot(dx, dz) > ACTOR_STUNT_RANGE) { showNotif('🎬 Get closer to the stunt double!'); return; }
  actorFightTarget.hp -= getWeaponDamage();
  sfx.clang();
  if (actorFightTarget.hp > 0) { showNotif(`🎬 Hit! (${actorFightTarget.hp} HP left)`); return; }
  scene.remove(actorFightTarget.mesh);
  actorFightTarget = null;
  showNotif('🎬 Cut! Great scene!');
  completeJobTask();
}
// Keeps the shared job HUD/timer from expiring mid-fight (a real fight takes longer than the
// normal 4-second reaction window every other job uses) and tidies up a leftover stunt double if
// the Actor job ever ends some other way (quitting, or something else clocking you out) while one
// is still on screen. Purely additive — tickJob() itself is completely untouched.
function tickActorFight(dt) {
  if (activeJob !== 'Actor' || !actorFightTarget) {
    if (actorFightTarget) { scene.remove(actorFightTarget.mesh); actorFightTarget = null; }
    return;
  }
  jobTaskTimer = 999; // self-paced — you're not racing a clock mid-fight
  const el = document.getElementById('jobHud');
  if (el) { el.textContent = `🎬 Fight the stunt double! [E] (${actorFightTarget.hp}/${actorFightTarget.maxHp} HP)`; el.style.color = '#ff2244'; }
}
// FACTORY JOBS — same reaction-task engine as Shopkeeper/Officer above (toggleJob()/tickJob()),
// just 3 more real jobs at the Industrial District (FACTORY_DEFS/buildFactories(), game-buildings.js;
// job zones in CITY_ZONES, game-zones.js). Kept as its own small local array (not read FROM
// game-zones.js/game-buildings.js, nor read BY them) purely so renderJobsPanel() below — which
// lets every job be started remotely from the Jobs tab, same as Shopkeeper/Officer/Bank Jobs — has
// one thing to map over instead of 3 more hand-written cards; the CITY_ZONES walk-up entries carry
// their own matching literal type/pay/taskText independently, same as Shopkeeper/Officer do.
const FACTORY_JOBS = [
  { type:'Toy Factory Worker',  emoji:'🧸', pay:12, taskText:'🧸 A toy needs assembling!' },
  { type:'Auto Parts Worker',   emoji:'🔧', pay:15, taskText:'🔧 A car part needs assembling!' },
  { type:'Robot Parts Worker',  emoji:'🤖', pay:18, taskText:'⚙️ A robot chassis needs bolting together!' },
];
// ─── BANK JOBS — long, low-attention shifts with a real currency choice, unlike the reaction-task
// jobs above (Shopkeeper/Officer). User's own ask: "you can work at the bank as [Money Printer,
// Guard, Money Counter]" with specific S.I.P.-or-diamonds numbers per shift length. Money Printer
// pays out every real minute for a 5-minute shift; Guard and Money Counter are a single lump sum
// at the end of a longer/shorter shift. Mutually exclusive with the regular job system above (and
// vice versa) since both would otherwise fight over the same #jobHud element.
const BANK_JOBS = [
  { id:'printer', label:'Money Printer', durationSec:300,  repeatSec:60, sipPay:1000,  elitePay:500  },
  { id:'guard',   label:'Guard',         durationSec:1200, repeatSec:0,  sipPay:5000,  elitePay:2500 },
  { id:'counter', label:'Money Counter', durationSec:300,  repeatSec:0,  sipPay:10000, elitePay:5000 },
];
let activeBankJob = null; // {job, currency:'sip'|'elite', elapsed, sinceLastPay} — NOT persisted, same as the regular job system
// User's own follow-up correction: "to work as money printer or counter you have to go inside th
// bank" — an outdoor zone wasn't good enough, so this now checks a REAL walk-in interior
// (BANK_INTERIOR, its own 10,000-unit pocket lane like every other building's interior in this
// file — see enterBankInterior/exitBankInterior/buildBankInterior below) instead of distance to an
// outdoor CITY_ZONES circle. Guard is still deliberately exempt: defending against the killer
// swarm means moving around freely outdoors (see tickGuardKillerCombat), and it can still be
// started remotely from the Jobs tab (item 217).
function nearBankJobZone(jobId, currency) {
  return inBankInterior;
}
function enterBankInterior() {
  inBankInterior = true;
  playerGroup.position.set(BANK_INTERIOR.x, 0, BANK_INTERIOR.z);
  yaw = Math.PI;
  showNotif('🏦 Bank employee area — the Money Printer and Money Counter stations are here.');
}
function exitBankInterior() {
  inBankInterior = false;
  playerGroup.position.set(BANK_INTERIOR_ENTRANCE.x, 0, BANK_INTERIOR_ENTRANCE.z - 8);
  yaw = 0;
  showNotif('Leaving the Bank employee area...');
}
// Same flat-array shape every other pocket interior's own _ZONES array uses (see STORE_ZONES,
// HOUSE_ZONES, etc.) — wired into isBlocked()/handleInteract()/updatePrompt()'s existing
// inX-ternary chains alongside them, not a new mechanism.
const BANK_INTERIOR_ZONES = [
  { x:BANK_INTERIOR_EXIT.x,   z:BANK_INTERIOR_EXIT.z,   r:3,   label:'Exit Bank',                       action: () => exitBankInterior()},
  { x:BANK_INTERIOR.x-5, z:BANK_INTERIOR.z-3, r:2.2, label:'🖨️ Work as Money Printer (1,000 S.I.P./min, 5 min shift)', action: ()=>toggleBankJob('printer','sip'),   isBankJobZone:true, bankJobId:'printer', currency:'sip' },
  { x:BANK_INTERIOR.x-5, z:BANK_INTERIOR.z+3, r:2.2, label:'🖨️ Work as Money Printer (500 💎/min, 5 min shift)',        action: ()=>toggleBankJob('printer','elite'), isBankJobZone:true, bankJobId:'printer', currency:'elite' },
  { x:BANK_INTERIOR.x+5, z:BANK_INTERIOR.z-3, r:2.2, label:'🧮 Work as Money Counter (10,000 S.I.P. after 5 min)',      action: ()=>toggleBankJob('counter','sip'),   isBankJobZone:true, bankJobId:'counter', currency:'sip' },
  { x:BANK_INTERIOR.x+5, z:BANK_INTERIOR.z+3, r:2.2, label:'🧮 Work as Money Counter (5,000 💎 after 5 min)',           action: ()=>toggleBankJob('counter','elite'), isBankJobZone:true, bankJobId:'counter', currency:'elite' },
];
function toggleBankJob(jobId, currency) {
  if(activeJob) { showNotif('❌ Already working a regular job — quit that one first!'); return; }
  if(activeBankJob && activeBankJob.job.id === jobId && activeBankJob.currency === currency) {
    quitBankJob('Stopped working.');
    return;
  }
  if(activeBankJob) { showNotif(`❌ Already working as ${activeBankJob.job.label} — quit that shift first!`); return; }
  if (jobId !== 'guard' && !nearBankJobZone(jobId, currency)) {
    showNotif(`❌ You need to go inside the Bank to work as ${BANK_JOBS.find(j=>j.id===jobId).label}! Use the employee entrance.`);
    return;
  }
  const job = BANK_JOBS.find(j => j.id === jobId);
  activeBankJob = { job, currency, elapsed:0, sinceLastPay:0 };
  if (jobId === 'guard') resetBankHealth(); // start every shift with the Bank at full health, not whatever it was left at
  const payTxt = currency === 'sip' ? `${job.sipPay.toLocaleString()} S.I.P.` : `${job.elitePay.toLocaleString()} 💎`;
  showNotif(`💼 Clocked in as ${job.label}! ${job.repeatSec ? `${payTxt}/min` : payTxt} for ${Math.round(job.durationSec/60)} min.`);
  renderJobsPanel();
}
function quitBankJob(msg) {
  activeBankJob = null;
  document.getElementById('jobHud').textContent = '💼 No Job';
  document.getElementById('jobHud').style.color = '#fff';
  showNotif(msg);
  renderJobsPanel();
}
function payBankJob(job, currency, ratio=1) {
  const sip = currency==='sip' ? Math.round(job.sipPay*ratio) : 0;
  const elite = currency==='elite' ? Math.round(job.elitePay*ratio) : 0;
  if (sip || elite) queueEarning(sip, elite, job.label);
}
function tickBankJob(dt) {
  if(!activeBankJob) return;
  const bj = activeBankJob;
  // Printer/Counter require staying physically at the Bank for the whole shift; Guard is exempt
  // (see nearBankJobZone's comment above) and keeps the old "no stay-near-zone rule" freedom.
  if (bj.job.id !== 'guard' && !nearBankJobZone(bj.job.id, bj.currency)) {
    showNotif(`❌ You left the Bank — ${bj.job.label} shift cancelled, no pay.`);
    activeBankJob = null;
    document.getElementById('jobHud').textContent = '💼 No Job';
    document.getElementById('jobHud').style.color = '#fff';
    renderJobsPanel();
    return;
  }
  bj.elapsed += dt; bj.sinceLastPay += dt;
  if(bj.job.repeatSec > 0 && bj.sinceLastPay >= bj.job.repeatSec && bj.elapsed < bj.job.durationSec) {
    bj.sinceLastPay = 0;
    if (bj.job.id === 'printer') {
      // User's own ask: "you print money alot" — pay scales with how many real presses (see
      // tickPrinter/pressPrinter below) landed this minute instead of paying blindly on the timer.
      const ratio = Math.min(1, printerPressesThisMin / PRINTER_TARGET_PRESSES);
      payBankJob(bj.job, bj.currency, ratio);
      if (printerPressesThisMin === 0) showNotif('🖨️ No sheets printed this minute — no pay.');
      else if (ratio < 1) showNotif(`🖨️ Printed ${printerPressesThisMin}/${PRINTER_TARGET_PRESSES} sheets — partial pay this minute.`);
      printerPressesThisMin = 0;
    } else {
      payBankJob(bj.job, bj.currency);
    }
  }
  if(bj.elapsed >= bj.job.durationSec) {
    // Counter pays per-round as each count is solved (see tickCounter/finishCounterRound) instead
    // of one blind lump sum here — user's own ask for a real counting minigame, not an idle wait.
    if(bj.job.repeatSec === 0 && bj.job.id !== 'counter') payBankJob(bj.job, bj.currency); // one lump sum at the very end
    showNotif(`🏁 ${bj.job.label} shift complete!`);
    activeBankJob = null;
    document.getElementById('jobHud').textContent = '💼 No Job';
    document.getElementById('jobHud').style.color = '#fff';
    renderJobsPanel();
    return;
  }
  const remaining = Math.max(0, bj.job.durationSec - bj.elapsed);
  const mm = Math.floor(remaining/60), ss = Math.floor(remaining%60);
  const bankHpTxt = bj.job.id === 'guard' ? ` | 🏦 ${bankHealth}/${bankMaxHealth} HP` : '';
  document.getElementById('jobHud').textContent = `💼 ${bj.job.label} — ${mm}:${ss.toString().padStart(2,'0')} left${bankHpTxt}`;
  document.getElementById('jobHud').style.color = '#FFD700';
}

// ─── MONEY PRINTER — active click-to-print, user's own ask: "you print money alot." A silent
// per-minute timer used to pay out on its own; now a short real press window pops up every few
// seconds (works from anywhere, same as the rest of the Bank Jobs since item 217 dropped the
// zone-proximity rule) and pressing E during it prints one sheet. tickBankJob() above scales that
// minute's payout by how many of PRINTER_TARGET_PRESSES you actually landed — same "miss the
// reaction, no pay" convention the Shopkeeper/Officer reaction jobs already use.
let printerPressActive = false, printerPressTimer = 0, printerNextPressIn = 2, printerPressesThisMin = 0;
const PRINTER_PRESS_WINDOW = 1.4, PRINTER_TARGET_PRESSES = 10;
function tickPrinter(dt) {
  const onPrinter = activeBankJob && activeBankJob.job.id === 'printer';
  if (!onPrinter) {
    if (printerPressActive || printerPressesThisMin) { printerPressActive = false; printerPressesThisMin = 0; printerNextPressIn = 2; }
    return;
  }
  if (printerPressActive) {
    printerPressTimer -= dt;
    document.getElementById('jobHud').textContent = `🖨️ PRESS [E] TO PRINT! (${Math.max(0,printerPressTimer).toFixed(1)}s)`;
    document.getElementById('jobHud').style.color = '#ff6644';
    if (printerPressTimer <= 0) { printerPressActive = false; printerNextPressIn = 2.5 + Math.random()*2; }
    return;
  }
  printerNextPressIn -= dt;
  if (printerNextPressIn <= 0) {
    printerPressActive = true;
    printerPressTimer = PRINTER_PRESS_WINDOW;
    sfx.notify();
  }
}
// Called from handleInteract() (E key) — returns true if it consumed the press.
function pressPrinter() {
  if (!printerPressActive) return false;
  printerPressActive = false;
  printerPressesThisMin++;
  printerNextPressIn = 2.5 + Math.random()*2;
  sfx.clang();
  showNotif(`🖨️ Printed a sheet! (${printerPressesThisMin}/${PRINTER_TARGET_PRESSES} this minute)`);
  return true;
}

// ─── MONEY COUNTER — real counting minigame, user's own ask: "you count money froum like 10 20
// dollar bills and 40 10 dollar bills like that." Instead of one silent 5-minute wait, the shift
// is split into COUNTER_ROUNDS timed rounds — each shows two random bill-stack counts and the
// player has to do the real arithmetic and type the total before time runs out. Correct answers
// each pay 1/COUNTER_ROUNDS of the job's normal payout; wrong or timed-out rounds pay nothing,
// same convention as every other reaction-based job in this file.
const COUNTER_ROUNDS = 5, COUNTER_ROUND_WINDOW = 60; // a real person doing real mental math needs more than a few seconds — user's own ask: "give them 1 min they are not ai"
let counterRoundActive = false, counterRoundTimer = 0, counterNextRoundIn = 3, counterRoundsDone = 0;
let counterTwenties = 0, counterTens = 0, counterAnswer = 0;
function tickCounter(dt) {
  const onCounter = activeBankJob && activeBankJob.job.id === 'counter';
  if (!onCounter) {
    if (counterRoundActive) { counterRoundActive = false; document.getElementById('counterModal').style.display = 'none'; }
    counterRoundsDone = 0; counterNextRoundIn = 3;
    return;
  }
  if (counterRoundActive) {
    counterRoundTimer -= dt;
    const el = document.getElementById('counterTimer');
    if (el) el.textContent = Math.max(0,counterRoundTimer).toFixed(1) + 's';
    if (counterRoundTimer <= 0) finishCounterRound(false);
    return;
  }
  if (counterRoundsDone >= COUNTER_ROUNDS) return; // all rounds resolved — just ride out the rest of the shift
  counterNextRoundIn -= dt;
  const jobsPanelOpen = document.getElementById('jobsPanel') && document.getElementById('jobsPanel').style.display !== 'none';
  if (counterNextRoundIn <= 0 && !jobsPanelOpen) openCounterRound();
}
function openCounterRound() {
  counterTwenties = 2 + Math.floor(Math.random()*18); // 2-19
  counterTens = 2 + Math.floor(Math.random()*38);     // 2-39
  counterAnswer = counterTwenties*20 + counterTens*10;
  counterRoundActive = true;
  counterRoundTimer = COUNTER_ROUND_WINDOW;
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('counterStacksText').textContent = `${counterTwenties} × 💵 $20 bills + ${counterTens} × 💵 $10 bills`;
  document.getElementById('counterAnswerInput').value = '';
  document.getElementById('counterTimer').textContent = COUNTER_ROUND_WINDOW.toFixed(1) + 's';
  document.getElementById('counterModal').style.display = 'flex';
  setTimeout(() => document.getElementById('counterAnswerInput').focus(), 50);
  sfx.notify();
}
function submitCounterAnswer() {
  if (!counterRoundActive) return;
  const val = parseInt(document.getElementById('counterAnswerInput').value, 10);
  finishCounterRound(val === counterAnswer);
}
function finishCounterRound(correct) {
  counterRoundActive = false;
  counterRoundsDone++;
  document.getElementById('counterModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
  const stillCounting = activeBankJob && activeBankJob.job.id === 'counter';
  if (correct && stillCounting) {
    payBankJob(activeBankJob.job, activeBankJob.currency, 1/COUNTER_ROUNDS);
    sfx.coin();
    showNotif(`🧮 Correct — $${counterAnswer.toLocaleString()}! Payout added to Earnings.`);
  } else if (stillCounting) {
    sfx.nope();
    showNotif(`🧮 Wrong! It was $${counterAnswer.toLocaleString()}. No pay this round.`);
  }
  counterNextRoundIn = 4 + Math.random()*3;
}
// ─── JOB TAB — user's own ask: "go to the job tab click bank and than you actually work as the
// job" — every job in the game (Shopkeeper/Officer above, plus the 3 Bank Jobs) can now be
// started from one menu instead of needing to find and walk to each one's physical spot. Removed
// the "wander off and lose the job" rule from tickJob()/tickBankJob() above to match — hiring on
// remotely and then still needing to stand in one specific spot forever would defeat the point.
function toggleJobsPanel() {
  const panel = document.getElementById('jobsPanel');
  if (panel.style.display === 'none') {
    if (document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    renderJobsPanel();
    panel.style.display = 'flex';
    document.getElementById('jobsTab').style.display = 'none';
  } else { closeJobsPanel(); }
}
function closeJobsPanel() {
  document.getElementById('jobsPanel').style.display = 'none';
  document.getElementById('jobsTab').style.display = 'block';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ─── CURRENCY SHOP TAB — user's own ask: a shop tab to buy S.I.P./diamond packages, up to a
// bundled "VIP Package", now with real dollar price tags. No payment processor is wired up yet —
// that needs a parent to actually create a Stripe/PayPal business account first — so tapping a
// package shows a real "coming soon" message instead of a fake charge, and instead of secretly
// still handing out free currency behind a price tag (which would make the price meaningless).
const CURRENCY_SHOP_PACKAGES = [
  { id:'sip100',      sip:100,     elite:0,    label:'100 S.I.P.',       price:'$5'  },
  { id:'sip500',      sip:500,     elite:0,    label:'500 S.I.P.',       price:'$8'  },
  { id:'sip1000',     sip:1000,    elite:0,    label:'1,000 S.I.P.',     price:'$10' },
  { id:'sip5000',     sip:5000,    elite:0,    label:'5,000 S.I.P.',     price:'$15' },
  { id:'sip10000',    sip:10000,   elite:0,    label:'10,000 S.I.P.',    price:'$20' },
  { id:'sip25000',    sip:25000,   elite:0,    label:'25,000 S.I.P.',    price:'$21' },
  { id:'sip50000',    sip:50000,   elite:0,    label:'50,000 S.I.P.',    price:'$22' },
  { id:'sip100000',   sip:100000,  elite:0,    label:'100,000 S.I.P.',   price:'$25' },
  { id:'sip1000000',  sip:1000000, elite:0,    label:'1,000,000 S.I.P.', price:'$35' },
  { id:'elite100',     sip:0, elite:100,      label:'100 💎',       price:'$5'  },
  { id:'elite500',     sip:0, elite:500,      label:'500 💎',       price:'$8'  },
  { id:'elite1000',    sip:0, elite:1000,     label:'1,000 💎',     price:'$10' },
  { id:'elite5000',    sip:0, elite:5000,     label:'5,000 💎',     price:'$15' },
  { id:'elite25000',   sip:0, elite:25000,    label:'25,000 💎',    price:'$20' },
  { id:'elite50000',   sip:0, elite:50000,    label:'50,000 💎',    price:'$25' },
  { id:'elite100000',  sip:0, elite:100000,   label:'100,000 💎',   price:'$35' },
  { id:'elite1000000', sip:0, elite:1000000,  label:'1,000,000 💎', price:'$45' },
  { id:'starter', sip:1000, elite:100, label:'🌱 Starter Pack', desc:'1,000 S.I.P. + 100 💎', price:'$8' },
  { id:'vip', sip:100000, elite:5000, label:'👑 VIP Package', desc:'100,000 S.I.P. + 5,000 💎', price:'$25', vip:true },
  // VIP Discount — user's own ask: a real $5.00 listing, same permanently-disabled pattern as
  // every other real-money entry here. sip/elite are 0 since it isn't a currency grant — it
  // describes a real 20% discount on every OTHER package on this list, same "shown honestly, not
  // actually appliable yet" rule as everything else (no real payment processor exists to apply a
  // discount to in the first place).
  { id:'vip_discount', sip:0, elite:0, label:'👑 VIP Discount', desc:'20% off every other package in this Shop.', price:'$5.00' },
  { id:'mega', sip:2000000, elite:2000000, label:'💥 Mega Bundle', desc:'2,000,000 S.I.P. + 2,000,000 💎', price:'$60', vip:true },
  // Super Tank — user's own correction: this real-money listing belongs in the SHOP tab itself,
  // not the separate Car Dealership modal (TANK_DEF, game-vehicles.js). sip/elite are 0 on purpose
  // — unlike every entry above, a real future payment for THIS one should unlock the vehicle, not
  // credit currency, so whoever wires up real payments later must not treat it like the others.
  { id:'super_tank', sip:0, elite:0, label:'🛡️ Super Tank', desc:'A real rideable super weapon with a cannon — parked at the Car Dealership.', price:'$10.00' },
  // Super Armor — same real-item-behind-an-honest-inert-price-tag pattern as the Super Tank right
  // above (SUPER_ARMOR_DEF, game-shops.js). sip/elite are 0 for the same reason: a real future
  // payment for this one should unlock the armor, not credit currency.
  { id:'super_armor', sip:0, elite:0, label:'⭐ Super Armor', desc:'Blocks 93% of incoming damage — the strongest armor in the game.', price:'$10.00' },
  // Super Jet — same real-item-behind-an-honest-inert-price-tag pattern as the Tank and Armor
  // above (JET_DEF, game-vehicles.js). Driven, not flown (user's own correction).
  { id:'super_jet', sip:0, elite:0, label:'✈️ Super Jet', desc:'A real driveable super weapon with guns, bombs, and armor — parked at the City Airport.', price:'$15.00' },
  // Super Motorcycle — same real-item-behind-an-honest-inert-price-tag pattern as the Tank/Armor/
  // Jet above (MOTORCYCLE_DEF, game-vehicles.js).
  { id:'super_motorcycle', sip:0, elite:0, label:'🏍️ Super Motorcycle', desc:'A real rideable super weapon with rockets — parked at the Car Dealership.', price:'$8.00' },
  // Future Jet — same real-item-behind-an-honest-inert-price-tag pattern as the Tank/Armor/Jet/
  // Motorcycle above (FUTURE_JET_DEF, game-vehicles.js), just with a S.I.P. cost stacked on top
  // of the real $ price (user's own ask: "future 1 99 500000 sip") — the extra 500,000 S.I.P.
  // is shown here as flavor text on the same honest, permanently-inert listing, not something
  // this entry actually deducts (there's nowhere for a currency shop entry to charge S.I.P. from
  // — it's a real-money purchase flow that doesn't exist yet, same as every other price here).
  { id:'future_jet', sip:0, elite:0, label:'🚀 Future Jet', desc:'20 guns, rockets, and lasers — the strongest jet in the game. Parked at the City Airport.', price:'$1.99 + 500,000 S.I.P.' },
  // Super Package — user's own ask: the big combo bundle, bigger than VIP/Mega above since it
  // bundles three real items (Tank + Jet + Motorcycle, already parked and drivable in the world
  // either way) on top of a currency grant. grantsTank/grantsJet/grantsMotorcycle flag the
  // non-currency part for whoever wires up real payments later — same "credit currency directly,
  // but unlock these some other real way, don't just queueEarning() them" rule super_tank/
  // super_jet/super_motorcycle's own comments already spell out. Price bumped +$5 (user's own
  // follow-up) after the Motorcycle was added to the bundle's contents.
  { id:'super_package', sip:10000, elite:1000, label:'💎 Super Package', desc:'🛡️ Super Tank + ✈️ Super Jet + 🏍️ Super Motorcycle + 10,000 S.I.P. + 1,000 💎', price:'$35.00', vip:true, grantsTank:true, grantsJet:true, grantsMotorcycle:true },
];
function toggleCurrencyShopPanel() {
  const panel = document.getElementById('currencyShopPanel');
  if (panel.style.display === 'none') {
    if (document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    renderCurrencyShopPanel();
    panel.style.display = 'flex';
    document.getElementById('currencyShopTab').style.display = 'none';
  } else { closeCurrencyShopPanel(); }
}
function closeCurrencyShopPanel() {
  document.getElementById('currencyShopPanel').style.display = 'none';
  document.getElementById('currencyShopTab').style.display = 'block';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderCurrencyShopPanel() {
  const list = document.getElementById('currencyShopList');
  if (!list) return; // panel HTML not loaded yet (e.g. called before startGame())
  list.innerHTML = `<div style="color:#ffcc66;font-size:10.5px;text-align:center;background:rgba(255,204,102,0.1);border:1px dashed #886600;border-radius:8px;padding:6px;margin-bottom:8px;">Sorry, payments are unavailable.</div>` +
    CURRENCY_SHOP_PACKAGES.map(p => `
    <div style="background:${p.vip ? 'linear-gradient(90deg,#3a2a00,#4a3800)' : 'rgba(255,255,255,0.05)'};border:2px solid ${p.vip ? '#FFD700' : '#333'};border-radius:10px;padding:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
      <div>
        <div style="color:#fff;font-size:12px;font-weight:bold;">${p.label}</div>
        ${p.desc ? `<div style="color:#aaa;font-size:10px;">${p.desc}</div>` : ''}
        <div style="color:#7CFC00;font-size:12px;font-weight:bold;margin-top:2px;">${p.price}</div>
      </div>
      <button onclick="buyCurrencyPackage('${p.id}')" style="padding:7px 12px;background:#444;border:none;border-radius:6px;color:#ccc;font-size:11px;font-weight:bold;cursor:pointer;white-space:nowrap;">🚧 Soon</button>
    </div>`).join('');
}
// No payment processor is wired up yet — that needs a parent to actually create a Stripe/PayPal
// business account first. IMPORTANT for whoever implements this later, user's own explicit rule:
// once a real USD purchase succeeds, credit sipDollars/eliteCoins directly (updateSIP()/
// updateElite()) — NEVER route it through queueEarning()/the Earnings tab. Earnings is a fun
// "go collect it" delay for stuff you earned playing (robbery, quests, giveaways); a customer who
// just paid real money needs to get exactly what they paid for immediately, with zero risk of it
// sitting uncollected, getting lost, or looking like it wasn't delivered — that's the kind of
// thing that gets a real business sued, not just a bad review.
function buyCurrencyPackage(id) {
  const pkg = CURRENCY_SHOP_PACKAGES.find(p => p.id === id);
  if (!pkg) return;
  showNotif(`Sorry, payments are unavailable.`);
}

// ─── TEST LAB TAB — user's own ask: a private place to drop new mini-game files and try them
// before deciding whether they're good enough to become real. Nothing in DRAFT_GAMES is wired
// into the real Minigames menu, and this file only lives locally (not synced to explox_site),
// so a draft game is automatically private until the user chooses to publish it for real.
const DRAFT_GAMES = [
  // Add one entry per file dropped into explox/minigames/drafts/, e.g.:
  // { id:'mygame', name:'My Game', emoji:'🎮', file:'mygame.html' },
];
function toggleTestLabPanel() {
  const panel = document.getElementById('testLabPanel');
  if (panel.style.display === 'none') {
    if (document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    renderTestLabPanel();
    panel.style.display = 'flex';
    document.getElementById('testLabTab').style.display = 'none';
  } else { closeTestLabPanel(); }
}
function closeTestLabPanel() {
  document.getElementById('testLabPanel').style.display = 'none';
  document.getElementById('testLabTab').style.display = 'block';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderTestLabPanel() {
  const list = document.getElementById('testLabList');
  if (!list) return; // panel HTML not loaded yet (e.g. called before startGame())
  if (!DRAFT_GAMES.length) {
    list.innerHTML = `<div style="color:#555;font-size:12px;text-align:center;padding:24px 10px;">No draft games yet —<br>drop one in explox/minigames/drafts/<br>and add it to DRAFT_GAMES.</div>`;
    return;
  }
  list.innerHTML = DRAFT_GAMES.map(g => `
    <div style="background:rgba(255,255,255,0.05);border:2px solid #333;border-radius:10px;padding:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
      <div style="color:#fff;font-size:12px;font-weight:bold;">${g.emoji} ${g.name}</div>
      <button onclick="playDraftGame('${g.file}')" style="padding:7px 12px;background:#5a2a00;border:none;border-radius:6px;color:#fff;font-size:11px;font-weight:bold;cursor:pointer;white-space:nowrap;">▶ Test Play</button>
    </div>`).join('');
}
// A draft game only gets to open once it passes two real checks, run on its actual file text
// (fetched fresh every click, not trusted from whenever it was added to DRAFT_GAMES): if it has
// real code (<script>), that code must be at least DRAFT_MIN_CODE_LINES lines — a real, substantial
// game, not a stub — and it can't contain self-promotion telling the player to like/subscribe/go
// play a different game.
const DRAFT_MIN_CODE_LINES = 10000;
const DRAFT_AD_PHRASES = [
  'like and subscribe', 'please like', 'subscribe to', 'smash that like',
  'like this game', 'rate this game', 'give me a like', 'follow me on',
  'play my game', 'play my other game', 'check out my other', 'like my game',
  'play more of my games', 'go play my',
];
// Stored base64-encoded (decoded only at check time) so the actual words never sit as plain
// readable text in this file — same idea real profanity filters use to keep a word list from
// being casually read by anyone browsing the source. Matched on real word boundaries so it
// doesn't false-positive on unrelated words that merely contain one as a substring.
const DRAFT_AGE_BLOCKLIST_B64 = [
  'ZGFtbg==','aGVsbA==','YXNz','Yml0Y2g=','YmFzdGFyZA==','Y3JhcA==','c2hpdA==',
  'ZnVjaw==','cGlzcw==','ZGljaw==','Y29jaw==','cHVzc3k=','d2hvcmU=','c2x1dA==',
];
function draftHasBadWord(text) {
  const lower = text.toLowerCase();
  return DRAFT_AGE_BLOCKLIST_B64.some(b64 => new RegExp('\\b' + atob(b64) + '\\b', 'i').test(lower));
}
async function playDraftGame(file) {
  showNotif('🔍 Checking ' + file + '...');
  let text;
  try {
    const res = await fetch('AiGame/explox/minigames/drafts/' + file);
    if (!res.ok) { showNotif('❌ Could not find ' + file + '.'); return; }
    text = await res.text();
  } catch (e) {
    showNotif('❌ Could not read ' + file + '.');
    return;
  }
  const hasScript = /<script[\s>]/i.test(text);
  const lineCount = text.split('\n').length;
  if (hasScript && lineCount < DRAFT_MIN_CODE_LINES) {
    showNotif(`🚫 Blocked: needs at least ${DRAFT_MIN_CODE_LINES.toLocaleString()} lines of code (this has ${lineCount.toLocaleString()}).`);
    return;
  }
  const lower = text.toLowerCase();
  const adHit = DRAFT_AD_PHRASES.find(p => lower.includes(p));
  if (adHit) {
    showNotif(`🚫 Blocked: found ad-like text ("${adHit}") — no asking players to like or play other games.`);
    return;
  }
  if (draftHasBadWord(text)) {
    showNotif(`🚫 Blocked: found language that's not appropriate for your age.`);
    return;
  }
  window.open('AiGame/explox/minigames/drafts/' + file, '_blank');
}

// ─── SHOP JOBS — a real job at each of the 340 generated shops (100 CITY_SHOPS + 200 MALL_SHOPS +
// 40 OUTFIT_SHOPS), not just the one fixed Shopkeeper corner. User's own ask: "make a job for each
// shop." Reuses the exact same generic toggleJob()/tickJob()/completeJobTask() reaction-task engine
// already driving Shopkeeper/Officer — a shop job is just toggleJob() called with that specific
// shop's own name as the job "type" (unique in practice — every shop's emoji+name combo is
// generated distinctly), so the shared engine needed zero changes. Pay is derived live from each
// shop's own real price data (its items' or outfits' average cost / 8, clamped 4-25) instead of a
// flat rate, so a Furniture Store job pays more than a Candy Shop job.
function findAnyShop(id) {
  return CITY_SHOPS.find(s => s.id === id) || MALL_SHOPS.find(s => s.id === id) || OUTFIT_SHOPS.find(s => s.id === id);
}
function shopJobPay(shop) {
  const prices = shop.items ? shop.items.map(it => it.price) : shop.outfits.map(o => o.cost);
  const avg = prices.reduce((a,b) => a+b, 0) / prices.length;
  return Math.min(25, Math.max(4, Math.round(avg / 8)));
}
function startShopJob(shopId) {
  const shop = findAnyShop(shopId);
  if (!shop) return;
  toggleJob(`${shop.emoji} ${shop.name}`, shopJobPay(shop), `📦 A customer at ${shop.name} needs help!`);
}
// No separate "which shop am I working at" state to keep in sync — derived fresh from activeJob
// every time it's needed, so there's nothing to go stale if the player switches jobs directly.
function findActiveShopJob() {
  if (!activeJob) return null;
  return [...CITY_SHOPS, ...MALL_SHOPS, ...OUTFIT_SHOPS].find(s => `${s.emoji} ${s.name}` === activeJob) || null;
}
function filterShopJobList() {
  const input = document.getElementById('shopJobSearch');
  const results = document.getElementById('shopJobResults');
  if (!input || !results) return;
  const q = input.value.trim().toLowerCase();
  if (q.length < 2) { results.innerHTML = `<div style="color:#666;font-size:10px;text-align:center;padding:6px 0;">Type at least 2 letters to search all 340 shops...</div>`; return; }
  const busy = !!activeJob || !!activeBankJob;
  const matches = [...CITY_SHOPS, ...MALL_SHOPS, ...OUTFIT_SHOPS].filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)).slice(0, 20);
  results.innerHTML = matches.length ? matches.map(s => `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:4px 2px;border-bottom:1px solid #222;">
      <span style="color:#ddd;font-size:11px;">${s.emoji} ${s.name}</span>
      <button ${busy ? 'disabled' : ''} onclick="startShopJob('${s.id}')" style="padding:3px 8px;background:${busy?'#333':'#1a5a7a'};border:none;border-radius:5px;color:#fff;font-size:10px;cursor:${busy?'not-allowed':'pointer'};opacity:${busy?'0.5':'1'};white-space:nowrap;">+${shopJobPay(s)} Work</button>
    </div>`).join('') : `<div style="color:#888;font-size:10px;text-align:center;padding:6px 0;">No shops match "${q}"</div>`;
}
function renderJobsPanel() {
  const list = document.getElementById('jobsList');
  if (!list) return; // panel HTML not loaded yet (e.g. called before startGame())
  const busy = !!activeJob || !!activeBankJob;
  const card = (active) => `background:rgba(255,255,255,0.05);border:2px solid ${active ? '#44ddff' : '#333'};border-radius:10px;padding:10px;margin-bottom:8px;`;
  const startBtn = (onclick, label) => `<button ${busy ? 'disabled' : ''} onclick="${onclick}" style="width:100%;padding:6px;background:${busy ? '#333' : '#1a5a7a'};border:none;border-radius:6px;color:#fff;font-size:11px;cursor:${busy ? 'not-allowed' : 'pointer'};opacity:${busy ? '0.5' : '1'};">${label}</button>`;
  const stopBtn = (onclick, label) => `<button onclick="${onclick}" style="width:100%;padding:6px;background:#7a1a1a;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;">${label}</button>`;

  const shopActive = activeJob === 'Shopkeeper';
  const copActive = activeJob === 'Officer';
  const actorActive = activeJob === 'Actor';
  let html = `
    <div style="${card(shopActive)}">
      <div style="color:#fff;font-size:12px;font-weight:bold;margin-bottom:6px;">📦 Shopkeeper — +5 S.I.P./task</div>
      ${shopActive ? stopBtn("quitJob('Stopped working.')", 'Stop Working') : startBtn(`toggleJob('Shopkeeper',5,'📦 A customer needs help!')`, 'Start Working')}
    </div>
    <div style="${card(copActive)}">
      <div style="color:#fff;font-size:12px;font-weight:bold;margin-bottom:6px;">🚨 Officer — +10 S.I.P./task</div>
      ${copActive ? stopBtn("quitJob('Stopped working.')", 'Stop Working') : startBtn(`toggleJob('Officer',10,'🚨 Trouble downtown — respond!')`, 'Start Working')}
    </div>
    <div style="${card(actorActive)}">
      <div style="color:#fff;font-size:12px;font-weight:bold;margin-bottom:6px;">🎭 Actor — +${ACTOR_PAY} S.I.P./task</div>
      ${actorActive ? stopBtn("quitJob('Stopped working.')", 'Stop Working') : startBtn(`startActingJob()`, 'Start Working')}
    </div>
    <div style="color:#88ccff;font-size:11px;font-weight:bold;letter-spacing:2px;text-align:center;margin:12px 0 8px;">🏭 FACTORIES</div>
  `;
  html += FACTORY_JOBS.map(fj => {
    const active = activeJob === fj.type;
    return `<div style="${card(active)}">
      <div style="color:#fff;font-size:12px;font-weight:bold;margin-bottom:6px;">${fj.emoji} ${fj.type} — +${fj.pay} S.I.P./task</div>
      ${active ? stopBtn("quitJob('Stopped working.')", 'Stop Working') : startBtn(`toggleJob('${fj.type}',${fj.pay},'${fj.taskText}')`, 'Start Working')}
    </div>`;
  }).join('');
  html += `<div style="color:#88ccff;font-size:11px;font-weight:bold;letter-spacing:2px;text-align:center;margin:12px 0 8px;">🏦 BANK</div>`;
  html += BANK_JOBS.map(job => {
    const active = activeBankJob && activeBankJob.job.id === job.id;
    const payTxt = job.id === 'printer'
      ? `Up to ${job.sipPay.toLocaleString()} S.I.P. or ${job.elitePay.toLocaleString()} 💎/min — press [E] fast enough when it flashes! Must be inside the Bank.`
      : job.id === 'counter'
      ? `Up to ${job.sipPay.toLocaleString()} S.I.P. or ${job.elitePay.toLocaleString()} 💎 — count 5 real bill stacks correctly. Must be inside the Bank.`
      : `${job.sipPay.toLocaleString()} S.I.P. or ${job.elitePay.toLocaleString()} 💎 after ${Math.round(job.durationSec/60)} min. Killers attack the Bank itself — fight them off, call backup, or let the police help!`;
    // Guard's own "Call for Backup" ability — user's spec: 30s cooldown, 10 Coin Bots. Only shown
    // while actively on a Guard shift, since it's meaningless otherwise.
    const backupCooldown = active && job.id === 'guard' ? Math.max(0, Math.ceil(backupReadyAt - clock.getElapsedTime())) : 0;
    const backupBtn = active && job.id === 'guard'
      ? `<button ${backupCooldown > 0 ? 'disabled' : ''} onclick="callBackup()" style="width:100%;padding:6px;margin-top:6px;background:${backupCooldown > 0 ? '#333' : '#2a5a4a'};border:none;border-radius:6px;color:#fff;font-size:11px;cursor:${backupCooldown > 0 ? 'not-allowed' : 'pointer'};opacity:${backupCooldown > 0 ? '0.5' : '1'};">${backupCooldown > 0 ? `📣 Backup (${backupCooldown}s)` : '📣 Call for Backup (10 Coin Bots)'}</button>`
      : '';
    return `<div style="${card(active)}">
      <div style="color:#fff;font-size:12px;font-weight:bold;margin-bottom:3px;">${job.label}</div>
      <div style="color:#888;font-size:10px;margin-bottom:6px;">${payTxt}</div>
      ${active
        ? stopBtn("quitBankJob('Stopped working.')", `Stop Working (${activeBankJob.currency === 'sip' ? 'S.I.P.' : '💎'})`)
        : `<div style="display:flex;gap:6px;">${startBtn(`toggleBankJob('${job.id}','sip')`, '💰 S.I.P.')}${startBtn(`toggleBankJob('${job.id}','elite')`, '💎 Diamonds')}</div>`}
      ${backupBtn}
    </div>`;
  }).join('');

  html += `<div style="color:#88ccff;font-size:11px;font-weight:bold;letter-spacing:2px;text-align:center;margin:12px 0 8px;">🏪 SHOPS (340)</div>`;
  const activeShop = findActiveShopJob();
  if (activeShop) {
    html += `<div style="${card(true)}">
      <div style="color:#fff;font-size:12px;font-weight:bold;margin-bottom:6px;">${activeShop.emoji} Working at ${activeShop.name}</div>
      ${stopBtn("quitJob('Stopped working.')", 'Stop Working')}
    </div>`;
  } else {
    html += `<div style="${card(false)}">
      <div style="color:#aaa;font-size:10px;margin-bottom:6px;">Every shop in the city &amp; mall is a real job — search by name or category.</div>
      <input id="shopJobSearch" oninput="filterShopJobList()" placeholder="Search shops..." ${busy ? 'disabled' : ''}
        style="width:100%;box-sizing:border-box;padding:6px 8px;background:rgba(255,255,255,0.08);border:1px solid #444;border-radius:6px;color:#fff;font-size:11px;margin-bottom:6px;outline:none;">
      <div id="shopJobResults"></div>
    </div>`;
  }
  list.innerHTML = html;
}
function quitJob(msg) {
  activeJob = null; activeJobPay = 0; activeJobTaskText = '';
  jobTaskActive = false; jobTaskTimer = 0; jobNextTaskIn = 0;
  document.getElementById('jobHud').textContent = '💼 No Job';
  document.getElementById('jobHud').style.color = '#fff';
  showNotif(msg);
  renderJobsPanel();
}
function completeJobTask() {
  if(!jobTaskActive) return;
  jobTaskActive = false;
  jobNextTaskIn = 3 + Math.random()*4;
  queueEarning(activeJobPay, 0, activeJob);
  showNotif(`✅ Nice work! +${activeJobPay} S.I.P. pending in Earnings`);
}

function tickJob(dt) {
  if(!activeJob) return;
  // No "stay near the zone" rule anymore — see tickBankJob()'s note above, same reasoning:
  // jobs can now be started from the Job tab from anywhere, so once you're clocked in you're
  // working regardless of where you roam.
  if(jobTaskActive) {
    jobTaskTimer -= dt;
    document.getElementById('jobHud').textContent = `💼 ${activeJobTaskText} [E] (${Math.max(0,jobTaskTimer).toFixed(1)}s)`;
    document.getElementById('jobHud').style.color = '#ff6644';
    if(jobTaskTimer <= 0) {
      jobTaskActive = false;
      jobNextTaskIn = 3 + Math.random()*4;
      showNotif('❌ Missed it — no pay that round.');
    }
    return;
  }
  jobNextTaskIn -= dt;
  document.getElementById('jobHud').textContent = `💼 ${activeJob} — on duty...`;
  document.getElementById('jobHud').style.color = '#FFD700';
  if(jobNextTaskIn <= 0) {
    jobTaskActive = true;
    jobTaskTimer = JOB_TASK_WINDOW;
    sfx.notify();
  }
}

function getIngredients() {
  if(cookState !== 'idle') { showNotif('Finish your current cooking first!'); return; }
  cookState = 'has_ingredients';
  cookSubPresses = 0;
  document.getElementById('jobHud').textContent = '🧺 Got ingredients!';
  document.getElementById('jobHud').style.color = '#88ff88';
  showNotif('🧺 Ingredients grabbed! Go to the Prep Counter →');
}

function prepareFood() {
  if(cookState === 'idle') { showNotif('Get ingredients from the fridge first!'); return; }
  if(cookState === 'prepared' || cookState === 'cooking' || cookState === 'ready') {
    showNotif('Already prepped! Head to the stove.'); return;
  }
  if(cookState === 'has_ingredients') { cookState = 'preparing'; cookSubPresses = 0; }
  cookSubPresses++;
  if(cookSubPresses >= PREP_PRESSES) {
    cookState = 'prepared';
    document.getElementById('jobHud').textContent = '✅ Prepped! Go cook!';
    document.getElementById('jobHud').style.color = '#FFD700';
    showNotif('✅ Food prepped! Head to the stove now.');
  } else {
    document.getElementById('jobHud').textContent = `🔪 Chopping ${cookSubPresses}/${PREP_PRESSES}`;
    showNotif(`🔪 Chop chop! (${cookSubPresses}/${PREP_PRESSES})`);
  }
}

function startCooking() {
  if(cookState === 'idle' || cookState === 'has_ingredients' || cookState === 'preparing') {
    showNotif('Prepare the food at the Prep Counter first!'); return;
  }
  if(cookState === 'ready') { showNotif('🍕 Food is ready! Deliver it to a customer.'); return; }
  if(cookState === 'prepared') { cookState = 'cooking'; cookSubPresses = 0; }
  cookSubPresses++;
  if(cookSubPresses >= COOK_PRESSES) {
    cookState = 'ready';
    document.getElementById('jobHud').textContent = '🍕 Food ready! Deliver it!';
    document.getElementById('jobHud').style.color = '#ff6600';
    showNotif('🍕 Food is cooked! Walk to a customer who ordered.');
  } else {
    document.getElementById('jobHud').textContent = `🔥 Cooking ${cookSubPresses}/${COOK_PRESSES}`;
    document.getElementById('jobHud').style.color = '#FFD700';
    showNotif(`🔥 Cooking... (${cookSubPresses}/${COOK_PRESSES})`);
  }
}

function serveAtTable(idx) {
  if(cookState !== 'ready') { showNotif('❌ Cook food first! (Fridge → Prep → Stove)'); return; }
  cookState = 'idle';
  cookSubPresses = 0;
  const dish = tableOrders[idx];
  queueEarning(20, 0, 'Diner Job');
  showNotif(`✅ ${dish} delivered! +20 S.I.P. pending in Earnings`);
  document.getElementById('jobHud').textContent = '💼 No Job';
  document.getElementById('jobHud').style.color = '#fff';
  tableOrders[idx] = '✅ Thank you!';
  updateOrderBubble(idx, '✅ Thank you!');
  setTimeout(() => {
    tableOrders[idx] = DISH_NAMES[Math.floor(Math.random() * DISH_NAMES.length)];
    updateOrderBubble(idx, tableOrders[idx]);
  }, 8000);
}

function makeOrderBubble(text, x, y, z) {
  const cv = document.createElement('canvas'); cv.width = 220; cv.height = 64;
  const c = cv.getContext('2d');
  c.fillStyle = 'rgba(255,255,220,0.92)'; c.beginPath(); c.roundRect(4,4,212,56,10); c.fill();
  c.fillStyle = '#111'; c.font = 'bold 22px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(text, 110, 32);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 0.85),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, side: THREE.DoubleSide })
  );
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}

function updateOrderBubble(idx, text) {
  const mesh = orderBubbles[idx];
  if(!mesh) return;
  const cv = document.createElement('canvas'); cv.width = 220; cv.height = 64;
  const c = cv.getContext('2d');
  c.fillStyle = text.startsWith('✅') ? 'rgba(180,255,180,0.92)' : 'rgba(255,255,220,0.92)';
  c.beginPath(); c.roundRect(4,4,212,56,10); c.fill();
  c.fillStyle = '#111'; c.font = 'bold 22px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(text, 110, 32);
  mesh.material.map = new THREE.CanvasTexture(cv);
  mesh.material.needsUpdate = true;
}

function updateWantedHud() {
  const el = document.getElementById('wantedHud');
  if(wantedLevel <= 0) { el.style.display='none'; return; }
  el.style.display = 'block';
  el.textContent = '⭐'.repeat(wantedLevel) + ' WANTED';
}

function increaseWanted(n) {
  wantedLevel = Math.min(3, wantedLevel + n);
  updateWantedHud();
  showNotif(`🚔 Wanted level: ${'⭐'.repeat(wantedLevel)}`);
}

// ─── PRISON — getting arrested used to just teleport you to (-70,10), which is literally the
// CENTER of the police station's own solid exterior box — i.e. inside a plain gray building
// shell with nothing in it. Now arrest() sends you to a real furnished cell (same teleported
// pocket-space trick as House/Store/Hotel/Friend's House) and you actually serve real time.
// User's own follow-up ask ("the prison is not real enough") added: patrolling guards, real
// cellmates you can talk to, activities (yard/cafeteria), and a real risk-based escape — a
// whole small Cell Block, not just one lonely room. Guard/Prisoner NPCs live out in this same
// remote pocket-space lane (see PRISON_SPAWN), so — same trick every other interior's own NPCs
// use — they're only ever actually encountered while inPrison.
const PRISON_SPAWN = { x:60000, z:0 };
const PRISON_ESCAPE_DIGS_NEEDED = 5, PRISON_DIG_COOLDOWN = 4, PRISON_GUARD_CATCH_RADIUS = 6;
const PRISON_WORKOUT_COOLDOWN = 8, PRISON_WORKOUT_TIME_OFF = 10;
const PRISON_ZONES = [
  { x:PRISON_SPAWN.x+2, z:PRISON_SPAWN.z+2, r:1.3, label:'🥄 Dig at the Loose Brick', action: () => digEscape() },
  { x:PRISON_SPAWN.x, z:PRISON_SPAWN.z+18, r:3, label:'🏋️ Work Out (Good Behavior)', action: () => prisonWorkout() },
  { x:PRISON_SPAWN.x, z:PRISON_SPAWN.z+36, r:3, label:'🍽️ Eat Prison Food', action: () => prisonEat() },
  { x:PRISON_SPAWN.x-11, z:PRISON_SPAWN.z-1.5, r:2, label:'💬 Talk to Rocco', action: () => openPrisonNpcModal('Rocco', '🦝 "Third time in here, not that I\'m counting. Word of advice — the guards always swing back through this hallway. Time it right if you\'re thinking about that loose brick."') },
  { x:PRISON_SPAWN.x+11, z:PRISON_SPAWN.z-1.5, r:2, label:'💬 Talk to Dusty', action: () => openPrisonNpcModal('Dusty', '😎 "Food\'s terrible, bunks are lumpy, but hey, free rent. You thinking about digging out? Wait for the guard to walk past first, rookie."') },
];
let inPrison = false, prisonTimeLeft = 0, prisonEscapeProgress = 0, prisonDigCooldown = 0, prisonWorkoutCooldown = 0;
// NOT persisted (same as inPrison above — a reload just ends the physical stay early, same
// pre-existing behavior every ordinary arrest already has). Set alongside inPrison in
// executeDivineJudgment() (game-world.js) so tickPrison() below can show Hell-specific HUD/release
// text without needing an entire second copy of Prison's outdoor-exclusion/HUD/release plumbing.
let inDivineSentence = false;
// One 8x8 cell shell — the player's own cell (withCot) keeps its exact original furniture;
// Rocco's and Dusty's cells reuse the same shell so the whole row of 3 lines up in the hallway.
function buildPrisonCell(cx, cz, withCot) {
  box(8, 0.3, 8, 0x888888, cx, 0.15, cz);        // stone floor
  box(8, 0.2, 8, 0x666666, cx, 5, cz);           // ceiling
  box(8, 5, 0.3, 0x777777, cx, 2.5, cz - 4);     // back wall
  box(0.3, 5, 8, 0x777777, cx - 4, 2.5, cz);     // left wall
  box(0.3, 5, 8, 0x777777, cx + 4, 2.5, cz);     // right wall
  for(let i = -3; i <= 3; i++) box(0.12, 5, 0.12, 0x2a2a2a, cx + i*0.9, 2.5, cz + 4); // jail bars instead of a 4th solid wall
  box(8, 0.3, 0.3, 0x2a2a2a, cx, 4.9, cz + 4);   // top bar rail
  if(withCot) {
    box(2.5, 0.4, 1.2, 0x5a4a3a, cx - 2, 0.5, cz - 2.5); // cot frame
    box(2.3, 0.3, 1.0, 0xccccdd, cx - 2, 0.72, cz - 2.5); // cot mattress
  }
  box(1.2, 1, 0.2, 0x334455, cx, 3, cz - 3.9);   // small barred window
}
function buildPrisonInterior() {
  const ix = PRISON_SPAWN.x, iz = PRISON_SPAWN.z;
  buildPrisonCell(ix, iz, true);        // your cell
  buildPrisonCell(ix - 11, iz, false);  // Rocco's cell
  buildPrisonCell(ix + 11, iz, false);  // Dusty's cell
  buildSign('🔒 CELL', ix, 5.3, iz + 4.2);

  // Hallway running past all 3 cell fronts — this is the strip guards patrol back and forth,
  // close enough to the bars that timing a dig against their patrol actually matters.
  box(30, 0.3, 3.2, 0x555555, ix, 0.15, iz + 5.6);
  buildSign('🔒 CELL BLOCK B', ix, 5, iz + 8.6);

  // Walkway out to the Yard
  box(4, 0.3, 3, 0x555555, ix, 0.15, iz + 8.5);
  // Yard — a fenced dirt patch, real activity zone (Work Out) at its center
  box(16, 0.3, 16, 0x8d6e4a, ix, 0.15, iz + 18);
  [[-8,-8],[8,-8],[-8,8],[8,8],[0,-8],[0,8],[-8,0],[8,0]].forEach(([dx,dz]) => box(0.25, 2, 0.25, 0x4a3a28, ix+dx, 1, iz+18+dz)); // fence posts
  box(1.4, 0.5, 0.5, 0x555555, ix - 3, 0.4, iz + 18); box(0.15, 0.9, 0.15, 0x333333, ix - 3, 0.7, iz + 16.7); // simple weight bench + bar
  buildSign('🏋️ YARD', ix, 3, iz + 25.8);

  // Walkway out to the Cafeteria
  box(4, 0.3, 3, 0x555555, ix, 0.15, iz + 27);
  // Cafeteria — open toward the yard, real activity zone (Eat) at its center
  box(16, 0.3, 16, 0x888888, ix, 0.15, iz + 36);
  box(16, 0.2, 16, 0x666666, ix, 5, iz + 36);           // ceiling
  box(16, 5, 0.3, 0x777777, ix, 2.5, iz + 44);          // back wall
  box(0.3, 5, 16, 0x777777, ix - 8, 2.5, iz + 36);      // left wall
  box(0.3, 5, 16, 0x777777, ix + 8, 2.5, iz + 36);      // right wall
  [-4, 4].forEach(dx => { // 2 tables with benches
    box(2.4, 0.5, 1.2, 0x6a5238, ix+dx, 0.65, iz+36);
    box(2.2, 0.3, 0.3, 0x5a4a3a, ix+dx, 0.35, iz+35); box(2.2, 0.3, 0.3, 0x5a4a3a, ix+dx, 0.35, iz+37);
  });
  buildSign('🍽️ CAFETERIA', ix, 5.3, iz + 43.7);
}
function digEscape() {
  if(!inPrison || prisonDigCooldown > 0) return;
  prisonDigCooldown = PRISON_DIG_COOLDOWN;
  const spotX = PRISON_SPAWN.x + 2, spotZ = PRISON_SPAWN.z + 2;
  const guardNear = npcs.some(n => n.role === 'Guard' && Math.hypot(n.group.position.x - spotX, n.group.position.z - spotZ) < PRISON_GUARD_CATCH_RADIUS);
  if(guardNear) {
    prisonEscapeProgress = 0;
    prisonTimeLeft += 15;
    showNotif('🚨 A guard spotted you digging! Progress reset — +15s added to your sentence.');
    return;
  }
  prisonEscapeProgress++;
  showNotif(`🥄 You loosen the brick a little more... (${prisonEscapeProgress}/${PRISON_ESCAPE_DIGS_NEEDED})`);
  if(prisonEscapeProgress >= PRISON_ESCAPE_DIGS_NEEDED) {
    inPrison = false;
    prisonEscapeProgress = 0;
    increaseWanted(1); // breaking out is itself a crime
    playerGroup.position.set(-70, 0, 26);
    yaw = Math.PI;
    showNotif('🏃💨 You broke out! Guards are on alert now — wanted level up.');
    const hud = document.getElementById('jobHud'); hud.textContent = '💼 No Job'; hud.style.color = '#fff';
  }
}
function prisonWorkout() {
  if(!inPrison || prisonWorkoutCooldown > 0) return;
  prisonWorkoutCooldown = PRISON_WORKOUT_COOLDOWN;
  prisonTimeLeft = Math.max(0, prisonTimeLeft - PRISON_WORKOUT_TIME_OFF);
  showNotif(`🏋️ Worked out — good behavior knocks ${PRISON_WORKOUT_TIME_OFF}s off your sentence!`);
}
function prisonEat() {
  if(!inPrison) return;
  eatFood('🍞', 'Mystery Prison Mush', 'bitter'); // real bite animation, just for the (bad) flavor reaction
}
function openPrisonNpcModal(name, line) {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('neighborModalTitle').textContent = `🔒 ${name}`;
  document.getElementById('neighborModalBody').innerHTML = `<p style="color:#ddd;font-size:13px;line-height:1.5;">${line}</p>`;
  document.getElementById('neighborModal').style.display = 'flex';
}
function arrest() {
  // Sentence length is based on how wanted you were BEFORE it resets — worse crimes, more time served.
  const sentence = 20 + wantedLevel * 15;
  const fine = Math.min(sipDollars, 40 * wantedLevel);
  spendSip(fine);
  wantedLevel = 0;
  updateSIP();
  updateWantedHud();
  inPrison = true; inDivineSentence = false; // an ordinary arrest is never a Hell sentence — see triggerDivineJudgment()/executeDivineJudgment() (game-world.js) for the one path that sets this true
  prisonTimeLeft = sentence;
  prisonEscapeProgress = 0; prisonDigCooldown = 0; prisonWorkoutCooldown = 0;
  playerGroup.position.set(PRISON_SPAWN.x, 0, PRISON_SPAWN.z);
  yaw = Math.PI;
  showNotif(`🚔 ARRESTED! Lost ${fine} S.I.P. — locked up for ${sentence}s.`);
}
function tickPrison(dt) {
  if(!inPrison) return;
  prisonTimeLeft -= dt;
  if(prisonDigCooldown > 0) prisonDigCooldown = Math.max(0, prisonDigCooldown - dt);
  if(prisonWorkoutCooldown > 0) prisonWorkoutCooldown = Math.max(0, prisonWorkoutCooldown - dt);
  const hud = document.getElementById('jobHud');
  // inDivineSentence (game-world.js's executeDivineJudgment()) is the one real difference from an
  // ordinary arrest — same countdown/release mechanism, just Hell-flavored HUD/release text.
  hud.textContent = inDivineSentence ? `🔥 Serving your Divine Sentence: ${Math.ceil(Math.max(0, prisonTimeLeft))}s`
                                      : `🔒 Serving time: ${Math.ceil(Math.max(0, prisonTimeLeft))}s`;
  hud.style.color = '#ff6644';
  if(prisonTimeLeft <= 0) {
    inPrison = false;
    prisonEscapeProgress = 0;
    playerGroup.position.set(-70, 0, 26); // just outside the station
    yaw = Math.PI;
    showNotif(inDivineSentence ? '🔥 Released from Hell — but the sentence isn\'t truly over until the years are served. Go live your life; it will find you when it\'s time.'
                                : '🔓 Released! Stay out of trouble...');
    inDivineSentence = false;
    hud.textContent = '💼 No Job';
    hud.style.color = '#fff';
  }
}

function robShop(shopName, gain) {
  if(robbedCooldowns[shopName] > 0) {
    showNotif(`🚫 ${shopName} already robbed! Wait ${Math.ceil(robbedCooldowns[shopName])}s`); return;
  }
  queueEarning(gain, 0, `Robbed ${shopName}`);
  robbedCooldowns[shopName] = 60;
  increaseWanted(1);
  lifetimeShopsRobbed++;
  showNotif(`🔫 Robbed ${shopName}! +${gain} S.I.P. pending in Earnings`);
}

