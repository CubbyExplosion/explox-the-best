// ─── ADD ONS — free fun toggles/buttons, growing collection (goal: 100+) ────
// Every one below is real and live: toggles flip a genuine game-state flag that animate()
// (or a one-time apply call) actually reads; action buttons trigger a genuine one-shot effect.
// None are placeholders — a "coming soon" entry would violate the whole point of the feature.
const ADD_ON_CATEGORIES = ['Movement','Camera','Character','Trails','Buddy','Fun Buttons','Food Bombs','Dress Up Parties','Fights','Friends','Vehicles','Minigames','Weather'];
const ADD_ONS = [
  // MOVEMENT — real physics/gravity/speed tweaks, applied inside animate()'s movement block
  { id:'speedboost',  name:'Speed Boost',   emoji:'⚡', category:'Movement', type:'toggle', desc:'Move 60% faster.' },
  { id:'slowmo',       name:'Slow-Mo Walk',  emoji:'🐌', category:'Movement', type:'toggle', desc:'Move at half speed — great for screenshots.' },
  { id:'moonjump',     name:'Moon Jump',     emoji:'🌙', category:'Movement', type:'toggle', desc:'Lower gravity — huge floaty jumps.' },
  { id:'doublejump',   name:'Double Jump',   emoji:'🔁', category:'Movement', type:'toggle', desc:'Jump again in mid-air!' },
  { id:'bouncyshoes',  name:'Bouncy Shoes',  emoji:'🦘', category:'Movement', type:'toggle', desc:'Automatically bounce every time you land.' },
  { id:'rollerfeet',   name:'Roller Feet',   emoji:'🛼', category:'Movement', type:'toggle', desc:'Keep gliding a moment after you stop.' },
  // CAMERA — real CSS filters/transforms on the actual render canvas
  { id:'bw',           name:'Black & White', emoji:'⚫', category:'Camera', type:'toggle', desc:'Classic movie mode.' },
  { id:'sepia',        name:'Sepia Vibes',   emoji:'🟤', category:'Camera', type:'toggle', desc:'Old-timey photo look.' },
  { id:'trippy',       name:'Trippy Vision', emoji:'🌈', category:'Camera', type:'toggle', desc:'Colors cycle nonstop.' },
  { id:'mirror',       name:'Mirror World',  emoji:'🪞', category:'Camera', type:'toggle', desc:'Everything flipped left-right.' },
  { id:'upsidedown',   name:'Upside Down',   emoji:'🙃', category:'Camera', type:'toggle', desc:'Flip the whole screen over.' },
  { id:'blur',         name:'Dizzy Blur',    emoji:'💫', category:'Camera', type:'toggle', desc:'A soft dreamy blur.' },
  { id:'nightvision',  name:'Night Vision',  emoji:'🟢', category:'Camera', type:'toggle', desc:'Green goggles and a brighter world.' },
  // CHARACTER — real mesh scale/color/animation changes on the live player model
  { id:'bighead',      name:'Big Head',      emoji:'🗿', category:'Character', type:'toggle', desc:'Bobblehead-sized noggin.' },
  { id:'tinymode',     name:'Tiny Mode',     emoji:'🐜', category:'Character', type:'toggle', desc:'Shrink way down.' },
  { id:'giantmode',    name:'Giant Mode',    emoji:'🗼', category:'Character', type:'toggle', desc:'Tower over the city.' },
  { id:'rainbowskin',  name:'Rainbow Skin',  emoji:'🌈', category:'Character', type:'toggle', desc:'Skin cycles through every color.' },
  { id:'bobblehead',   name:'Bobblehead',    emoji:'🎎', category:'Character', type:'toggle', desc:'Head bobbles as you walk.' },
  { id:'noodlearms',   name:'Noodle Arms',   emoji:'🍜', category:'Character', type:'toggle', desc:'Big floppy arm swings.' },
  // TRAILS — real particles spawned behind you as you move
  { id:'sparkletrail', name:'Sparkle Trail', emoji:'✨', category:'Trails', type:'toggle', desc:'Leave sparkles behind you.' },
  { id:'firetrail',    name:'Fire Trail',    emoji:'🔥', category:'Trails', type:'toggle', desc:'Leave a trail of flame.' },
  { id:'icetrail',     name:'Frost Trail',   emoji:'❄️', category:'Trails', type:'toggle', desc:'Leave a trail of frost.' },
  { id:'confettijump', name:'Confetti Jump', emoji:'🎊', category:'Trails', type:'toggle', desc:'Burst confetti every time you jump.' },
  // BUDDY — only does anything once you've adopted a companion above
  { id:'petrainbow',   name:'Rainbow Buddy', emoji:'🌈', category:'Buddy', type:'toggle', desc:'Your buddy cycles through colors.', needsBuddy:true },
  { id:'petsparkle',   name:'Buddy Sparkles',emoji:'✨', category:'Buddy', type:'toggle', desc:'Your buddy leaves a sparkle trail too.', needsBuddy:true },
  { id:'petxl',        name:'XL Buddy',      emoji:'🐘', category:'Buddy', type:'toggle', desc:'Supersize your buddy.', needsBuddy:true },
  { id:'petmini',      name:'Mini Buddy',    emoji:'🐭', category:'Buddy', type:'toggle', desc:'Shrink your buddy down.', needsBuddy:true },
  // FUN BUTTONS — one-tap real effects, nothing to turn off
  { id:'diceroll',     name:'Roll a Dice',   emoji:'🎲', category:'Fun Buttons', type:'action', desc:'Roll a 6-sided die.' },
  { id:'coinflip',     name:'Flip a Coin',   emoji:'🪙', category:'Fun Buttons', type:'action', desc:'Heads or tails?' },
  { id:'eightball',    name:'Magic 8-Ball',  emoji:'🎱', category:'Fun Buttons', type:'action', desc:'Ask it anything.' },
  { id:'compliment',   name:'Random Compliment', emoji:'💖', category:'Fun Buttons', type:'action', desc:'Get a nice surprise.' },
  { id:'funfact',      name:'Random Fun Fact', emoji:'🧠', category:'Fun Buttons', type:'action', desc:'Learn something silly.' },
  { id:'airhorn',      name:'Air Horn',      emoji:'📯', category:'Fun Buttons', type:'action', desc:'HOOOONK.' },
  { id:'applause',     name:'Applause',      emoji:'👏', category:'Fun Buttons', type:'action', desc:'Give yourself a hand.' },
  { id:'fireworks',    name:'Fireworks',     emoji:'🎆', category:'Fun Buttons', type:'action', desc:'Light up the sky above you.' },
  // FOOD BOMBS — real cost, real taste: each one triggers the exact same eatFood() taste-reaction
  // popup the Diner/Airport/Home cooking already use, plus a food-colored particle burst.
  { id:'pizzabomb',    name:'Pizza Bomb',    emoji:'🍕', category:'Food Bombs', type:'action', desc:'Explode a whole pizza — and eat a slice.', cost:50,  taste:'savory' },
  { id:'donutbomb',    name:'Donut Bomb',    emoji:'🍩', category:'Food Bombs', type:'action', desc:'A sprinkle explosion, then a real bite.', cost:40,  taste:'sweet' },
  { id:'icecreambomb', name:'Ice Cream Bomb',emoji:'🍦', category:'Food Bombs', type:'action', desc:'A cold blast, then a real scoop.', cost:45,  taste:'sweet' },
  { id:'cakebomb',     name:'Cake Bomb',     emoji:'🎂', category:'Food Bombs', type:'action', desc:'The biggest burst — and a real slice.', cost:80,  taste:'sweet' },
  { id:'tacobomb',     name:'Taco Bomb',     emoji:'🌮', category:'Food Bombs', type:'action', desc:'Explodes hot — and a real spicy bite.', cost:55,  taste:'spicy' },
  { id:'lemonbomb',    name:'Lemon Bomb',    emoji:'🍋', category:'Food Bombs', type:'action', desc:'Zesty burst, then a real pucker.', cost:35,  taste:'sour' },
  // DRESS UP PARTIES — a real cost, a real instant costume change (rebuilds the live character
  // mesh, same as buying an outfit) plus a real confetti burst and cheer sound.
  { id:'birthdayparty',name:'Birthday Party',emoji:'🎉', category:'Dress Up Parties', type:'action', desc:'Bright party colors + confetti burst.', cost:150, shirt:'#ff4477', pants:'#ffcc00', shoes:'#44ddff' },
  { id:'superheroparty',name:'Superhero Party',emoji:'🦸', category:'Dress Up Parties', type:'action', desc:'Bold hero colors + confetti burst.', cost:200, shirt:'#dd2222', pants:'#1144aa', shoes:'#ffcc00' },
  { id:'spookyparty',  name:'Spooky Party',  emoji:'👻', category:'Dress Up Parties', type:'action', desc:'Dark spooky colors + confetti burst.', cost:150, shirt:'#4b0082', pants:'#111111', shoes:'#ff6600' },
  { id:'rainbowparty', name:'Rainbow Party', emoji:'🌈', category:'Dress Up Parties', type:'action', desc:'Every color at once + confetti burst.', cost:175, shirt:'#ff0000', pants:'#00cc44', shoes:'#0066ff' },
  { id:'westernparty', name:'Western Party', emoji:'🤠', category:'Dress Up Parties', type:'action', desc:'Dusty cowboy colors + confetti burst.', cost:150, shirt:'#8b5a2b', pants:'#5a3a1a', shoes:'#3a2a1a' },
  { id:'mermaidparty', name:'Mermaid Party', emoji:'🧜', category:'Dress Up Parties', type:'action', desc:'Shimmery ocean colors + confetti burst.', cost:175, shirt:'#00b3b3', pants:'#0077aa', shoes:'#00e6c3' },
  { id:'holidayparty', name:'Holiday Party', emoji:'🎄', category:'Dress Up Parties', type:'action', desc:'Festive red & green + confetti burst.', cost:150, shirt:'#cc2222', pants:'#1a7a3a', shoes:'#ffffff' },
  { id:'royalparty',   name:'Royal Party',   emoji:'👑', category:'Dress Up Parties', type:'action', desc:'Purple & gold regal look + confetti burst.', cost:250, shirt:'#6a0dad', pants:'#ffd700', shoes:'#4b0082' },
  // FIGHTS — real hooks into the one real damage/heal choke points (getWeaponDamage, damagePlayer,
  // tickHealth) every attack in the game already goes through, not a parallel combat system.
  { id:'berserker',    name:'Berserker Mode', emoji:'💪', category:'Fights', type:'toggle', desc:'Deal 50% more damage.' },
  { id:'ironskin',     name:'Iron Skin',      emoji:'🛡️', category:'Fights', type:'toggle', desc:'Take 30% less damage.' },
  { id:'fastheal',     name:'Fast Heal',      emoji:'❤️‍🩹', category:'Fights', type:'toggle', desc:'Regenerate HP 3x faster.' },
  { id:'luckycrits',   name:'Lucky Crits',    emoji:'🎯', category:'Fights', type:'toggle', desc:'20% chance to double your damage.' },
  { id:'warcry',       name:'War Cry',        emoji:'😤', category:'Fights', type:'action', desc:'Double damage for 8 seconds!', cost:20 },
  { id:'fullheal',     name:'Full Heal',      emoji:'🏥', category:'Fights', type:'action', desc:'Instantly restore all your HP.', cost:40 },
  // FRIENDS — reuse the real `friends`/`befriendNeighbor`/`houseGuest` system (item "FRIENDS" block)
  // instead of a parallel fake friends list.
  { id:'instantfriend',name:'Instant Friend', emoji:'🎲', category:'Friends', type:'action', desc:'A random neighbor becomes your friend.', cost:0 },
  { id:'giftfriends',  name:'Gift All Friends', emoji:'🎁', category:'Friends', type:'action', desc:'Treat every friend you have.', cost:50 },
  { id:'friendparty',  name:'Friend Party',   emoji:'🎉', category:'Friends', type:'action', desc:'Throw a party with a random friend.', cost:100 },
  { id:'shoutout',     name:'Random Shoutout',emoji:'💌', category:'Friends', type:'action', desc:'Give a random friend a shoutout.', cost:0 },
  { id:'surprisevisit',name:'Surprise Visit', emoji:'🏠', category:'Friends', type:'action', desc:'A random friend shows up at your house.', cost:30 },
  // VEHICLES — real hooks into the actual driving speed calc, crash-fee charge, and car mesh.
  { id:'turboboost',   name:'Turbo Boost',    emoji:'🚀', category:'Vehicles', type:'toggle', desc:'Drive 60% faster.' },
  { id:'crashinsurance',name:'Crash Insurance',emoji:'🛡️', category:'Vehicles', type:'toggle', desc:'No more S.I.P. fee for fender-benders.' },
  { id:'rainbowpaint', name:'Rainbow Paint',  emoji:'🌈', category:'Vehicles', type:'toggle', desc:'Your car cycles through every color.' },
  { id:'bumperbounce', name:'Bumper Bounce',  emoji:'🎈', category:'Vehicles', type:'toggle', desc:'Bounce backward when you crash.' },
  { id:'nitro',        name:'Nitro Boost',    emoji:'💨', category:'Vehicles', type:'action', desc:'A 3-second speed burst — must be driving!', cost:60 },
  { id:'partyhorn',    name:'Party Horn',     emoji:'📯', category:'Vehicles', type:'action', desc:'Honk your horn — must be driving!', cost:10 },
  // MINIGAMES — real shortcuts to the existing minigame files, plus a real toggle on the one
  // shared arcade-fee choke point (arcadeCharge()) every arcade game already goes through.
  { id:'launchthrone', name:'Play: Capture the Throne', emoji:'⚔️', category:'Minigames', type:'action', desc:'Jump straight into the castle fight.', cost:0 },
  { id:'launchobby',   name:'Play: Obby/Parkour', emoji:'🏃', category:'Minigames', type:'action', desc:'Jump straight into the obstacle course.', cost:0 },
  { id:'launchparkour',name:'Play: Rooftop Parkour', emoji:'🏙️', category:'Minigames', type:'action', desc:'Jump straight into rooftop running.', cost:0 },
  { id:'launchsf',     name:'Play: Special Forces', emoji:'🪖', category:'Minigames', type:'action', desc:'Jump straight into the FPS mission.', cost:0 },
  { id:'freearcade',   name:'Free Arcade',    emoji:'🎰', category:'Minigames', type:'toggle', desc:'Every arcade game (claw, snake, tetris & more) is free to play.' },
  { id:'hirekiller',   name:'Hire a Killer',  emoji:'🗡️', category:'Crime', type:'action', desc:'Pay to have someone hunted down by name — you get their money once the hit lands.', cost:0 },
  { id:'relieve',      name:'Duck Behind a Bush', emoji:'🌳', category:'Crime', type:'action', desc:'Relieve yourself outdoors instead of finding a real toilet — quick, but people sometimes notice.', cost:0 },
  // WEATHER — real hooks into the actual real-calendar weather-particle system.
  { id:'snowday',      name:'Snow Day',       emoji:'❄️', category:'Weather', type:'toggle', desc:'Force snow, no matter the season.' },
  { id:'leafstorm',    name:'Leaf Storm',     emoji:'🍂', category:'Weather', type:'toggle', desc:'Force falling leaves, no matter the season.' },
];
// Every add-on that doesn't already cost real S.I.P. (every toggle, every free/cost:0 action)
// costs 1 Elite Coin (💎) instead — the ones with a real `cost` above keep costing S.I.P.,
// completely untouched. Charged in toggleAddOn()/triggerAddOn() below.
ADD_ONS.forEach(a => { if (!a.cost) { delete a.cost; a.eliteCost = 1; } });
let activeAddOns = [];  // array of toggle-type ADD_ONS ids currently ON — persisted per account
let warCryEndTime = 0;  // clock.getElapsedTime() value War Cry's damage buff expires at (0 = not active)
let nitroEndTime = 0;   // clock.getElapsedTime() value Nitro Boost's speed buff expires at (0 = not active)
let trailParticles = []; // {mesh, life, maxLife, vx, vy, vz, gravity} — shared pool for trails/bursts/fireworks
let jumpsUsed = 0;       // for Double Jump — how many jumps used since last time onGround was true
let _trippyHue = 0;      // degrees, advances every frame while Trippy Vision is on

let sipDollars      = 0;
let woodCount       = 0;
let scrapMetal      = 0;
let playerHealth    = 100;
let playerMaxHealth = 100; // was a const 100 forever — now grows with Robot Level, see computePlayerMaxHealth()
// ─── HUNGER — user's own ask: "if you get too hungry you can starve [in your] sleep". Not
// persisted, same as playerHealth above — always starts full on login rather than surprising
// someone with an already-starving account days later. Full bar drains over 30 real minutes of
// play; eating (through the one shared eatFood(), so every meal source refills it) tops it back
// up. See tickHunger()/restoreHunger() near sleepAtHome().
let hunger = 100;
const HUNGER_DECAY_PER_SEC = 100 / (30 * 60);
const STARVE_DAMAGE_INTERVAL_SEC = 6, STARVE_DAMAGE_AMOUNT = 2;
let _starveDamageAt = 0; // playTimeSeconds value the next starvation tick lands at

// ─── SICKNESS — user's own ask (right after hunger): "make sickness". A real chance to catch
// something, rolled periodically, MUCH more likely while starving — a real second-order
// consequence for letting hunger run out, not just a coin-flip out of nowhere. Not persisted,
// same "always starts clean this session" treatment as health/hunger above.
let sick = false;
let sickUntil = 0;          // playTimeSeconds value it clears on its own
let _sickCheckAt = 0;        // playTimeSeconds value the next roll-to-catch-something happens
let _sickDamageAt = 0;       // playTimeSeconds value the next sickness HP tick lands at
const SICK_CHECK_INTERVAL_SEC = 60;
const SICK_CHANCE_NORMAL = 0.03, SICK_CHANCE_STARVING = 0.25; // per check
const SICK_DURATION_MIN = 240, SICK_DURATION_MAX = 420;       // 4-7 real minutes if it just runs its course
const SICK_DAMAGE_INTERVAL_SEC = 15, SICK_DAMAGE_AMOUNT = 1;  // milder drain than outright starving
let _sickVomitCheckAt = 0;          // playTimeSeconds value the next roll-to-vomit happens
const SICK_VOMIT_CHECK_INTERVAL_SEC = 45, SICK_VOMIT_CHANCE = 0.3; // per check, only while sick

// ─── TOILET / BLADDER — user's own ask, right after Vomit: "toilet". Same declining-meter shape
// as Hunger (100=comfortable, 0=crisis), drains a bit faster since real life works that way too.
// Not persisted, same "always starts clean this session" treatment as the others above. Real
// toilets live in the player's House and any player-built Land House — see useToilet() and the
// 🚽 zone entries in HOUSE_ZONES/LAND_HOUSE_ZONES.
let bladder = 100;
const BLADDER_DECAY_PER_SEC = 100 / (20 * 60); // full drain over ~20 real minutes
let embarrassedUntil = 0; // playTimeSeconds value the post-accident slowdown ends
const ACCIDENT_SLOW_DURATION_SEC = 20;

// ─── TIREDNESS / SLEEP — user's own ask: "make sleep and tiredness". Same declining-meter shape
// as Hunger/Bladder, but slower (sleep is a bigger commitment than a quick snack or bathroom
// break — you have to actually walk to a real bed). Sleeping (sleepAtHome/sleepInHotel) is the
// one real fix, same as Toilet fixes Bladder and food fixes Hunger — before this, sleep was just
// a free heal button with nothing actually making you need it. Not persisted, same "always starts
// clean this session" treatment as the others above.
let tiredness = 100;
const TIREDNESS_DECAY_PER_SEC = 100 / (45 * 60); // full drain over ~45 real minutes
let exhaustedSince = 0; // playTimeSeconds value tiredness first hit 0, or 0 if not currently exhausted
const COLLAPSE_AFTER_SEC = 30; // real seconds fully exhausted before you pass out on your own

let bankBalance     = 0;
let eliteCoins      = 0;
// User's own ask: "make it so the bank also has 100000000000000000000000000000000000000000000000000
// daimounds" — confirmed live (not a display-only flourish) that this should be a real, withdrawable
// Bank Diamond balance, same shape as the existing S.I.P. bankBalance above, just seeded absurdly
// high instead of starting at 0. A plain JS number can't hold this exactly (doubles only carry
// ~15-17 significant digits) but that's fine here — the balance is meant to functionally never run
// out, and formatBigNum() below switches to scientific notation past the point where toLocaleString()
// would otherwise print float-precision garbage digits.
const BANK_VAULT_ELITE_SEED = 1e53;
let bankEliteBalance = 0;
function formatBigNum(n) {
  return Math.abs(n) >= 1e21 ? n.toExponential(2) : n.toLocaleString();
}

// ─── QUESTS & ROBOT LEVEL — completing quests pays out Elite Coins; spending 100/500/1000/
// 1500/2000/3000/4500/... of them "levels up" the robots themselves (bigger, tougher, hit
// harder), but scales their rewards up to match so the loop stays worth playing.
let eliteLevel = 0;
let activeQuests = []; // [{id, type, icon, desc, target, rewardElite, startValue}]
let lifetimeRobotKills = 0; // Scrapyard-spawner robots
let lifetimeRogueKills = 0; // roaming rogue robots
let lifetimeWarHits    = 0; // hits landed on any War territory defender
let killerDefeats      = 0; // real persisted count — more of these means Killers spawn more often (see tickKillers)
let lifetimeShopsRobbed     = 0; // robShop() calls (game-alignment.js) — Crime Contracts below
let lifetimeCitizensDefeated = 0; // defeatNPC() non-cop/non-president kills (game-social.js)
let lifetimeCopsDefeated    = 0; // defeatNPC() Officer kills (game-social.js)
let totalContractsCompleted = 0; // Crime Contracts claimed — mirrors totalQuestsCompleted

// ─── CHURCH / DIVINE JUDGMENT — user's own ask: "make god god of Abraham" then, clarified across
// several follow-ups, a moral-consequence system for real killing (Killers/Robbers/Hire a Killer —
// NOT minigame kills like Capture the Throne, Arena, or Scrapyard/War robots, which are their own
// fictional combat systems). God is never something you fight — only the one judging. See
// triggerWrath()/tickWrath() (game-world.js) and the CHURCH zone (game-zones.js).
let totalKills          = 0; // real Killer/Robber/Hire-a-Killer kills — see checkWrathTrigger()
let wrathTriggerCount    = 0; // how many times Wrath has been sent after you — each one hits harder
let wrathActive          = false; // NOT persisted — a mid-chase reload just ends the chase, doesn't erase the kill count that caused it
let churchLastPrayed     = 0; // Date.now() ms of the last prayer — see PRAY_COOLDOWN_MS
let safePeriodEndsAt     = 0; // Date.now() ms — while now < this, no new Killers/Robbers spawn (the "everyone bows" cleansing after Wrath)
let satanBadUntil        = 0; // Date.now() ms — while now < this, Satan has WON this round: 5x evil spawns, black sky, bad luck
let satanCheckTimer      = 0; // NOT persisted — real-seconds accumulator, see tickSatanEvent()

// ─── RECORDS — user's own ask: "records like most diamonds, sip and more". peakSip/peakElite
// track the highest balance ever actually held (updated in updateSIP()/updateElite(), the same
// choke point every S.I.P./Elite Coin change already flows through) — NOT current balance, which
// can go back down after spending. eliteLevel and ownedWeapons.length are already real lifetime
// highs on their own (both only ever grow, never shrink), so they don't need separate tracking.
let peakSip = 0, peakElite = 0, totalQuestsCompleted = 0, totalBossesDefeated = 0;
function formatPlayTime(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${Math.floor(sec % 60)}s`;
}
// Every entry has a `key` matching LEADERBOARD_STATS in server-node/server.js — that's how a
// row's own stat gets matched up with the fetched leaderboard's holder+value for that same key.
// `fmt` formats a RAW NUMBER (used for the leaderboard holder's value); `mine` formats this
// account's own live value (usually the same formatting, just off local variables not a number).
const numFmt = n => Math.round(n).toLocaleString();
const RECORD_DEFS = [
  { key:'peakSip',              icon:'💰', label:'Most S.I.P. Ever Held',       mine:() => formatBigNum(Math.round(peakSip)), fmt: n => formatBigNum(Math.round(n)) },
  { key:'peakElite',            icon:'💎', label:'Most Diamonds Ever Held',      mine:() => formatBigNum(peakElite), fmt: n => formatBigNum(Math.round(n)) },
  { key:'eliteLevel',           icon:'🤖', label:'Highest Robot Level Reached',  mine:() => eliteLevel.toLocaleString(), fmt: numFmt },
  { key:'totalBossesDefeated',  icon:'⚔️', label:'Most Bosses Defeated',         mine:() => totalBossesDefeated.toLocaleString(), fmt: numFmt },
  { key:'totalQuestsCompleted', icon:'📜', label:'Most Quests Completed',        mine:() => totalQuestsCompleted.toLocaleString(), fmt: numFmt },
  { key:'totalContractsCompleted', icon:'🕴️', label:'Most Crime Contracts Completed', mine:() => totalContractsCompleted.toLocaleString(), fmt: numFmt },
  { key:'playTimeSeconds',      icon:'⏱️', label:'Longest Time Played',          mine:() => formatPlayTime(playTimeSeconds), fmt: formatPlayTime },
  { key:'ownedWeapons',         icon:'🗡️', label:'Most Weapons Collected',       mine:() => ownedWeapons.length.toLocaleString(), fmt: numFmt },
  // 20 more — every one below reads a real stat the game was already tracking somewhere else
  // (robot/PvP kill counters, owned-item arrays, etc.), just never surfaced as a record before.
  { key:'lifetimeRobotKills',   icon:'🤖', label:'Most Scrapyard Robots Defeated',    mine:() => lifetimeRobotKills.toLocaleString(), fmt: numFmt },
  { key:'lifetimeRogueKills',   icon:'🏃', label:'Most Rogue Robots Defeated',        mine:() => lifetimeRogueKills.toLocaleString(), fmt: numFmt },
  { key:'lifetimeWarHits',      icon:'⚔️', label:'Most War Hits Landed',              mine:() => lifetimeWarHits.toLocaleString(), fmt: numFmt },
  { key:'killerDefeats',        icon:'👻', label:'Most Killers Defeated',             mine:() => killerDefeats.toLocaleString(), fmt: numFmt },
  { key:'ffaKills',             icon:'🏟️', label:'Most Arena FFA Kills',              mine:() => ffaKills.toLocaleString(), fmt: numFmt },
  { key:'ownedCars',            icon:'🚗', label:'Most Cars Owned',                   mine:() => ownedCars.length.toLocaleString(), fmt: numFmt },
  { key:'ownedComputers',       icon:'🖥️', label:'Most Computers Owned',              mine:() => ownedComputers.length.toLocaleString(), fmt: numFmt },
  { key:'ownedFurniture',       icon:'🪑', label:'Most Furniture Owned',              mine:() => ownedFurniture.length.toLocaleString(), fmt: numFmt },
  { key:'ownedSkins',           icon:'🎽', label:'Most Skins Unlocked',               mine:() => ownedSkins.length.toLocaleString(), fmt: numFmt },
  { key:'ownedArmor',           icon:'🛡️', label:'Most Armor Pieces Collected',       mine:() => ownedArmor.length.toLocaleString(), fmt: numFmt },
  { key:'ownedItems',           icon:'🎨', label:'Most Customization Items Owned',    mine:() => ownedItems.length.toLocaleString(), fmt: numFmt },
  { key:'friends',              icon:'👥', label:'Most Friends Made',                 mine:() => friends.length.toLocaleString(), fmt: numFmt },
  { key:'children',             icon:'👶', label:'Most Kids Adopted',                 mine:() => children.length.toLocaleString(), fmt: numFmt },
  { key:'ownedStaff',           icon:'🧑‍💼', label:'Most Staff Hired',                 mine:() => ownedStaff.length.toLocaleString(), fmt: numFmt },
  { key:'myUploads',            icon:'📺', label:'Most STV Videos Uploaded',          mine:() => myUploads.length.toLocaleString(), fmt: numFmt },
  { key:'mySubscribers',        icon:'🔔', label:'Most STV Subscribers',              mine:() => mySubscribers.toLocaleString(), fmt: numFmt },
  { key:'ownedLand',            icon:'🏞️', label:'Most Land Plots Owned',             mine:() => ownedLand.length.toLocaleString(), fmt: numFmt },
  { key:'buildings',            icon:'🏗️', label:'Most Buildings Built',              mine:() => Object.values(plotBuildings).reduce((sum,arr) => sum+arr.length, 0).toLocaleString(), fmt: numFmt },
  { key:'storeSalesCount',      icon:'💰', label:'Most Store Sales Made',             mine:() => storeSalesCount.toLocaleString(), fmt: numFmt },
  { key:'installedApps',        icon:'📲', label:'Most Apps Downloaded',              mine:() => installedApps.length.toLocaleString(), fmt: numFmt },
];
let leaderboardData = null; // null until a fetch resolves; per key: {holder, value}
function toggleRecordsPanel() {
  const panel = document.getElementById('recordsPanel');
  if (panel.style.display === 'none') {
    if (document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    renderRecordsPanel();
    panel.style.display = 'flex';
    document.getElementById('recordsTab').style.display = 'none';
  } else { closeRecordsPanel(); }
}
function closeRecordsPanel() {
  document.getElementById('recordsPanel').style.display = 'none';
  document.getElementById('recordsTab').style.display = 'block';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function recordRowHtml(r, loadingLeader) {
  let leaderLine;
  if (serverMode !== 'online') {
    leaderLine = `<div style="color:#666;font-size:9px;margin-top:4px;">Go online to see who holds this record</div>`;
  } else if (loadingLeader) {
    leaderLine = `<div style="color:#666;font-size:9px;margin-top:4px;">Loading leader...</div>`;
  } else if (!leaderboardData) {
    // A real fetch failure (offline server, 404, timeout) — NOT the same as "fetched fine, this
    // stat just has no holder yet". Conflating the two used to print "No one holds this record
    // yet" on every row whenever the leaderboard endpoint was simply unreachable, which reads as
    // real data when it isn't.
    leaderLine = `<div style="color:#a55;font-size:9px;margin-top:4px;">Couldn't reach the leaderboard — try again</div>`;
  } else {
    const lb = leaderboardData[r.key];
    if (lb && lb.holder) {
      const isMe = lb.holder === currentUser;
      leaderLine = `<div style="color:#FFD700;font-size:10px;font-weight:bold;margin-top:4px;">🥇 ${isMe ? 'You!' : lb.holder} — ${r.fmt(lb.value)}</div>`;
    } else {
      leaderLine = `<div style="color:#666;font-size:9px;margin-top:4px;">No one holds this record yet</div>`;
    }
  }
  return `
    <div style="background:rgba(255,255,255,0.05);border:2px solid #333;border-radius:10px;padding:10px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <div style="color:#fff;font-size:12px;font-weight:bold;">${r.icon} ${r.label}</div>
        <div style="color:#bb66ff;font-size:13px;font-weight:bold;white-space:nowrap;">You: ${r.mine()}</div>
      </div>
      ${leaderLine}
    </div>`;
}
async function fetchLeaderboard() {
  try {
    const res = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/leaderboard', {}, 4000);
    // Real bug found live: fetch() only rejects on a network error, not on a 404/500 — a stale
    // server missing this route was returning {"error":"not found"} with a 404 status, which
    // parsed as valid "data" with no keys in it, so every single record silently rendered "No
    // one holds this record yet" instead of the honest "Couldn't reach the leaderboard" below.
    if (!res.ok) throw new Error('leaderboard fetch failed: ' + res.status);
    leaderboardData = await res.json();
  } catch (e) { leaderboardData = null; }
}
function renderRecordsPanel() {
  const list = document.getElementById('recordsList');
  if (!list) return; // panel HTML not loaded yet (e.g. called before startGame())
  const goingToFetch = serverMode === 'online';
  list.innerHTML = RECORD_DEFS.map(r => recordRowHtml(r, goingToFetch && !leaderboardData)).join('');
  if (goingToFetch) {
    fetchLeaderboard().then(() => {
      if (document.getElementById('recordsPanel').style.display !== 'none') {
        list.innerHTML = RECORD_DEFS.map(r => recordRowHtml(r, false)).join('');
      }
    });
  }
}
const ELITE_LEVEL_THRESHOLDS = [100, 500, 1000, 1500, 2000, 3000, 4500];
function eliteThresholdForLevel(level) { // cost in Elite Coins to go from level-1 to level
  if (level <= ELITE_LEVEL_THRESHOLDS.length) return ELITE_LEVEL_THRESHOLDS[level - 1];
  let last = ELITE_LEVEL_THRESHOLDS[ELITE_LEVEL_THRESHOLDS.length - 1];
  let delta = last - ELITE_LEVEL_THRESHOLDS[ELITE_LEVEL_THRESHOLDS.length - 2];
  for (let i = ELITE_LEVEL_THRESHOLDS.length + 1; i <= level; i++) { delta = Math.round(delta * 1.5 / 50) * 50; last += delta; }
  return last;
}
// User's own follow-up after seeing giant robots from the new bottomless Bank Diamond balance
// (item 229) let Robot Level climb way past anything normal grinding would ever reach: "no max
// level but cap the robot strenghth and size but you keep your strenghth you can also upgrade the
// wepon" — eliteLevel itself still climbs forever (no cap on leveling, no cap on the player's own
// computePlayerMaxHealth()/playerLevelDamageMult() below), only the ENEMY-side scale these two
// feed is clamped, so a maxed-out level still means a genuinely tougher/bigger swarm (roughly
// what old level ~20 used to look like) without literally spiraling into unkillable, screen-filling
// robots. The player's own weapon upgrades (Weapon Shop, WEAPON_DAMAGE/ROBOT_BONUS_DAMAGE below)
// stay a real, uncapped way to keep growing stronger against them regardless of this cap.
const ROBOT_POWER_MULT_CAP = 8;   // ≈ level 20 worth of the old uncapped formula
function robotPowerMult() { return Math.min(ROBOT_POWER_MULT_CAP, 1 + eliteLevel * 0.35); } // HP/damage/reward scale
// Robot SIZE used to also scale with the viewing player's own Robot Level, same formula as
// power above — but robots aren't networked objects (each client spawns its own local copies),
// so two players standing in the same spot saw genuinely different sizes for "the same" robot
// depending on whose Robot Level was higher. User's own report: "the robots are huge but the
// other player thinks they look normal." Size is now always 1 — a real, consistent look for
// everyone online — while power/reward stays personal, so Robot Level is still a real, felt
// upgrade (tougher, more rewarding fights), just not a mismatched visual anymore.
function robotSizeMult()  { return 1; }
// User's own ask: "when you level up you also level up" — Robot Level used to be a pure enemy-side
// scale (robots get tougher and worth more, item 199-ish) with nothing for the player themselves.
// Now leveling up genuinely makes YOU stronger too: +15 real Max HP per level, plus a real damage
// multiplier folded into applyDamageBuffs() below (the one shared choke point every outgoing hit
// already passes through), so it applies to every weapon swing automatically, not just a new stat
// nobody's damage math actually reads.
function computePlayerMaxHealth() { return 100 + eliteLevel * 15; }
function playerLevelDamageMult()  { return 1 + eliteLevel * 0.08; }
function levelUpElite() {
  const cost = eliteThresholdForLevel(eliteLevel + 1);
  if (eliteCoins < cost) { showNotif(`❌ Need ${cost.toLocaleString()} 💎 to reach Level ${eliteLevel + 1} (you have ${Math.floor(eliteCoins)})`); return; }
  eliteCoins -= cost;
  eliteLevel++;
  updateElite();
  // The level-up itself doubles as a real heal (added to current HP, not a full refill you have
  // to earn back) rather than just quietly raising a cap you won't notice until you're hurt.
  const oldMax = playerMaxHealth;
  playerMaxHealth = computePlayerMaxHealth();
  playerHealth += playerMaxHealth - oldMax;
  updateHealthBar();
  showNotif(`🆙 Robot Level ${eliteLevel}! Robots are bigger and stronger now — but worth more too. You're stronger too: +${playerMaxHealth-oldMax} Max HP, +${Math.round((playerLevelDamageMult()-1)*100)}% damage!`);
  sfx.buy();
  saveCurrentUser();
  renderQuestsPanel();
}

const QUEST_TEMPLATES = [
  { type:'robots', icon:'🤖', desc:n=>`Defeat ${n} Scrapyard robots`,               roll:()=>3+Math.floor(Math.random()*5),   reward:()=>15+Math.floor(Math.random()*20), lifetime:()=>lifetimeRobotKills },
  { type:'rogue',  icon:'⚠️', desc:n=>`Defeat ${n} rogue robots`,                    roll:()=>2+Math.floor(Math.random()*4),   reward:()=>20+Math.floor(Math.random()*25), lifetime:()=>lifetimeRogueKills },
  { type:'war',    icon:'🪖', desc:n=>`Land ${n} hits on a War territory defender`,  roll:()=>5+Math.floor(Math.random()*8),   reward:()=>15+Math.floor(Math.random()*20), lifetime:()=>lifetimeWarHits },
  { type:'sip',    icon:'💰', desc:n=>`Earn ${n} more S.I.P.`,                       roll:()=>200+Math.floor(Math.random()*400), reward:()=>10+Math.floor(Math.random()*10), lifetime:()=>sipDollars },
];
const MAX_ACTIVE_QUESTS = 3;
function generateQuest() {
  const t = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
  const target = t.roll();
  return { id: 'q' + Date.now() + Math.floor(Math.random() * 9999), type: t.type, icon: t.icon, desc: t.desc(target), target, rewardElite: t.reward(), startValue: t.lifetime() };
}
function ensureQuests() { while (activeQuests.length < MAX_ACTIVE_QUESTS) activeQuests.push(generateQuest()); }
// User's own ask: a paid way to swap out all 3 current quests for a fresh random set, in case
// none of them are ones you feel like doing right now.
const QUEST_REFRESH_COST = 10;
function refreshQuests() {
  if (eliteCoins < QUEST_REFRESH_COST) { showNotif(`❌ Need ${QUEST_REFRESH_COST} 💎 to refresh your quests!`); return; }
  eliteCoins -= QUEST_REFRESH_COST; updateElite();
  activeQuests = [];
  ensureQuests();
  saveCurrentUser();
  renderQuestsPanel();
  showNotif(`🔄 Quests refreshed! -${QUEST_REFRESH_COST} 💎`);
  sfx.buy();
}
function questProgress(q) {
  const tmpl = QUEST_TEMPLATES.find(t => t.type === q.type);
  return Math.max(0, Math.min(q.target, Math.floor(tmpl.lifetime() - q.startValue)));
}
function claimQuest(id) {
  const idx = activeQuests.findIndex(q => q.id === id);
  if (idx < 0) return;
  const q = activeQuests[idx];
  if (questProgress(q) < q.target) return;
  queueEarning(0, q.rewardElite, 'Quest');
  showNotif(`✅ Quest complete! Check Earnings to collect +${q.rewardElite} 💎`);
  sfx.buy();
  totalQuestsCompleted++;
  activeQuests.splice(idx, 1);
  ensureQuests();
  saveCurrentUser();
  renderQuestsPanel();
}
function toggleQuestsPanel() {
  const panel = document.getElementById('questsPanel');
  if (panel.style.display === 'none') {
    if (document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    ensureQuests();
    renderQuestsPanel();
    panel.style.display = 'flex';
    document.getElementById('questsTab').style.display = 'none';
  } else { closeQuestsPanel(); }
}
function closeQuestsPanel() {
  document.getElementById('questsPanel').style.display = 'none';
  document.getElementById('questsTab').style.display = 'block';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderQuestsPanel() {
  const nextCost = eliteThresholdForLevel(eliteLevel + 1);
  document.getElementById('questsLevelLine').innerHTML =
    `💎 Robot Level <b>${eliteLevel}</b><br>Next level: ${nextCost.toLocaleString()} 💎 (you have ${Math.floor(eliteCoins).toLocaleString()})`;
  const btn = document.getElementById('questsLevelUpBtn');
  const canLevel = eliteCoins >= nextCost;
  btn.disabled = !canLevel;
  btn.style.opacity = canLevel ? '1' : '0.5';
  btn.style.cursor = canLevel ? 'pointer' : 'not-allowed';
  btn.textContent = canLevel ? `⬆️ LEVEL UP! (-${nextCost.toLocaleString()} 💎)` : `⬆️ Need ${Math.ceil(nextCost - eliteCoins).toLocaleString()} more 💎`;
  const refreshBtn = document.getElementById('questsRefreshBtn');
  const canRefresh = eliteCoins >= QUEST_REFRESH_COST;
  refreshBtn.disabled = !canRefresh;
  refreshBtn.style.opacity = canRefresh ? '1' : '0.5';
  refreshBtn.style.cursor = canRefresh ? 'pointer' : 'not-allowed';
  refreshBtn.textContent = canRefresh ? `🔄 Refresh Quests (-${QUEST_REFRESH_COST} 💎)` : `🔄 Need ${QUEST_REFRESH_COST} 💎 to refresh`;
  const list = document.getElementById('questsList');
  list.innerHTML = activeQuests.map(q => {
    const prog = questProgress(q);
    const done = prog >= q.target;
    // Always derive the icon fresh from QUEST_TEMPLATES by type instead of trusting the
    // persisted q.icon — real bug found live: an old server-side encoding bug (now fixed)
    // had already baked a corrupted icon into some accounts' saved quests, and since a
    // client only re-pulls clean server data on a real fresh login, anyone who just kept
    // playing in an already-open tab would keep re-saving (and seeing) the same garbage
    // forever, no matter how many times the underlying data got repaired server-side. This
    // makes the display self-healing regardless of what's actually sitting in save data.
    const icon = (QUEST_TEMPLATES.find(t => t.type === q.type) || {}).icon || q.icon;
    return `<div style="background:rgba(255,255,255,0.05);border:2px solid ${done ? '#44ff88' : '#333'};border-radius:10px;padding:10px;margin-bottom:8px;">
      <div style="color:#fff;font-size:12px;font-weight:bold;margin-bottom:4px;">${icon} ${q.desc}</div>
      <div style="background:#222;border-radius:5px;height:8px;overflow:hidden;margin-bottom:6px;"><div style="background:${done ? '#44ff88' : '#00ccff'};height:100%;width:${Math.min(100, prog / q.target * 100)}%;"></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#888;font-size:10px;">${prog}/${q.target}</span>
        <button onclick="claimQuest('${q.id}')" ${done ? '' : 'disabled'} style="padding:5px 12px;background:${done ? '#2a7a2a' : '#333'};border:none;border-radius:6px;color:#fff;font-size:11px;cursor:${done ? 'pointer' : 'not-allowed'};">+${q.rewardElite} 💎</button>
      </div>
    </div>`;
  }).join('');
}

// ─── CRIME CONTRACTS — user's own ask: "the black market is there hq u can go theree once bad
// and they might ask to do crime stealing killing m0re". Same rolling roll/reward/lifetime-delta
// shape as QUEST_TEMPLATES above (reusing that exact pattern deliberately — it's already a proven
// "offer N random goals, track real progress against a persisted lifetime counter, claim for a
// reward" loop), just themed around crime actions that already exist (robShop() in
// game-alignment.js, defeatNPC() in game-social.js) and paid out in S.I.P. instead of Elite Coins
// since this is underworld cash, not Robot Level currency. Only offered once alignment==='bad' —
// gated in openBlackMarket()/toggleContractsPanel() below, same gate the Black Market itself uses.
const CRIME_CONTRACT_TEMPLATES = [
  { type:'shops',    icon:'🏪', desc:n=>`Rob ${n} shops`,           roll:()=>2+Math.floor(Math.random()*3), reward:()=>60+Math.floor(Math.random()*60), lifetime:()=>lifetimeShopsRobbed },
  { type:'citizens', icon:'🥊', desc:n=>`Mug ${n} citizens`,        roll:()=>3+Math.floor(Math.random()*4), reward:()=>50+Math.floor(Math.random()*50), lifetime:()=>lifetimeCitizensDefeated },
  { type:'cops',     icon:'👮', desc:n=>`Take down ${n} officers`,  roll:()=>2+Math.floor(Math.random()*2), reward:()=>90+Math.floor(Math.random()*80), lifetime:()=>lifetimeCopsDefeated },
];
let activeContracts = []; // [{id, type, icon, desc, target, rewardSip, startValue}]
const MAX_ACTIVE_CONTRACTS = 3;
function generateContract() {
  const t = CRIME_CONTRACT_TEMPLATES[Math.floor(Math.random() * CRIME_CONTRACT_TEMPLATES.length)];
  const target = t.roll();
  return { id: 'c' + Date.now() + Math.floor(Math.random() * 9999), type: t.type, icon: t.icon, desc: t.desc(target), target, rewardSip: t.reward(), startValue: t.lifetime() };
}
function ensureContracts() { while (activeContracts.length < MAX_ACTIVE_CONTRACTS) activeContracts.push(generateContract()); }
const CONTRACT_REFRESH_COST = 40;
function refreshContracts() {
  if (sipDollars < CONTRACT_REFRESH_COST) { showNotif(`❌ Need ${CONTRACT_REFRESH_COST} S.I.P. to refresh your contracts!`); return; }
  spendSip(CONTRACT_REFRESH_COST);
  activeContracts = [];
  ensureContracts();
  saveCurrentUser();
  renderContractsPanel();
  updateSIP();
  showNotif(`🔄 Contracts refreshed! -${CONTRACT_REFRESH_COST} S.I.P.`);
  sfx.buy();
}
function contractProgress(c) {
  const tmpl = CRIME_CONTRACT_TEMPLATES.find(t => t.type === c.type);
  return Math.max(0, Math.min(c.target, Math.floor(tmpl.lifetime() - c.startValue)));
}
function claimContract(id) {
  const idx = activeContracts.findIndex(c => c.id === id);
  if (idx < 0) return;
  const c = activeContracts[idx];
  if (contractProgress(c) < c.target) return;
  queueEarning(c.rewardSip, 0, 'Crime Contract');
  showNotif(`✅ Contract complete! Check Earnings to collect +${c.rewardSip} S.I.P.`);
  sfx.buy();
  totalContractsCompleted++;
  activeContracts.splice(idx, 1);
  ensureContracts();
  saveCurrentUser();
  renderContractsPanel();
}
function toggleContractsPanel() {
  if (alignment !== 'bad') { showNotif('🚫 Only bad guys get contracts. Talk to the Shady Dealer first.'); return; }
  const panel = document.getElementById('contractsPanel');
  if (panel.style.display === 'none') {
    if (document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    ensureContracts();
    renderContractsPanel();
    panel.style.display = 'flex';
    document.getElementById('contractsTab').style.display = 'none';
  } else { closeContractsPanel(); }
}
function closeContractsPanel() {
  document.getElementById('contractsPanel').style.display = 'none';
  document.getElementById('contractsTab').style.display = 'block';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderContractsPanel() {
  const refreshBtn = document.getElementById('contractsRefreshBtn');
  const canRefresh = sipDollars >= CONTRACT_REFRESH_COST;
  refreshBtn.disabled = !canRefresh;
  refreshBtn.style.opacity = canRefresh ? '1' : '0.5';
  refreshBtn.style.cursor = canRefresh ? 'pointer' : 'not-allowed';
  refreshBtn.textContent = canRefresh ? `🔄 Refresh Contracts (-${CONTRACT_REFRESH_COST} S.I.P.)` : `🔄 Need ${CONTRACT_REFRESH_COST} S.I.P. to refresh`;
  const list = document.getElementById('contractsList');
  list.innerHTML = activeContracts.map(c => {
    const prog = contractProgress(c);
    const done = prog >= c.target;
    const icon = (CRIME_CONTRACT_TEMPLATES.find(t => t.type === c.type) || {}).icon || c.icon;
    return `<div style="background:rgba(255,255,255,0.05);border:2px solid ${done ? '#ff4444' : '#333'};border-radius:10px;padding:10px;margin-bottom:8px;">
      <div style="color:#fff;font-size:12px;font-weight:bold;margin-bottom:4px;">${icon} ${c.desc}</div>
      <div style="background:#222;border-radius:5px;height:8px;overflow:hidden;margin-bottom:6px;"><div style="background:${done ? '#ff4444' : '#cc2222'};height:100%;width:${Math.min(100, prog / c.target * 100)}%;"></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#888;font-size:10px;">${prog}/${c.target}</span>
        <button onclick="claimContract('${c.id}')" ${done ? '' : 'disabled'} style="padding:5px 12px;background:${done ? '#7a2a2a' : '#333'};border:none;border-radius:6px;color:#fff;font-size:11px;cursor:${done ? 'pointer' : 'not-allowed'};">+${c.rewardSip} 💰</button>
      </div>
    </div>`;
  }).join('');
}

// ─── EARNINGS TAB — user's own ask: "when you earn money it goes there click the earning to
// get the earning ... if you let it sit for more than 30 min you get a notification and a big
// red ! on the tab." EVERY real S.I.P./Elite Coin reward in the game now queues here via
// queueEarning() instead of landing in the wallet instantly — collecting is a real, separate
// action. Persisted (it's real money owed to the player, shouldn't vanish on logout) with a
// real Date.now() timestamp per entry so the 30-minute check survives a relog, unlike the
// clock.getElapsedTime()-based timers used elsewhere in this file that reset every page load.
let pendingEarnings = []; // {id, sip, elite, source, ts} — persisted
const EARNING_OVERDUE_MS = 30 * 60 * 1000; // 30 real minutes
let _earningsOverdueNotified = new Set(); // which overdue ids already got their one nag — not persisted, fine to re-nag once after a relog
const EARNING_MERGE_WINDOW_MS = 6000; // rapid same-source earnings (boss hitSip per swing, gathering-event's 5s ticks) stack into one row instead of flooding the tab
function queueEarning(sip, elite, source) {
  sip = sip || 0; elite = elite || 0;
  if (!sip && !elite) return;
  const now = Date.now();
  const last = pendingEarnings[pendingEarnings.length - 1];
  if (last && last.source === source && now - last.ts <= EARNING_MERGE_WINDOW_MS) {
    last.sip += sip; last.elite += elite; last.ts = now; // extends its own 30-minute clock from the latest addition, same as a real running total would
  } else {
    pendingEarnings.push({ id:'earn'+now+'_'+Math.floor(Math.random()*99999), sip, elite, source, ts:now });
  }
  updateEarningsBadge();
  renderEarningsPanel();
  saveCurrentUser();
}
function collectEarning(id) {
  const idx = pendingEarnings.findIndex(e => e.id === id);
  if (idx < 0) return;
  const e = pendingEarnings[idx];
  pendingEarnings.splice(idx, 1);
  if (e.sip)   { sipDollars += e.sip; updateSIP(); }
  if (e.elite) { eliteCoins += e.elite; updateElite(); }
  sfx.coin();
  const parts = [e.sip ? `${e.sip.toLocaleString()} S.I.P.` : '', e.elite ? `${e.elite.toLocaleString()} 💎` : ''].filter(Boolean).join(' + ');
  showNotif(`💰 Collected ${parts} from ${e.source}!`);
  _earningsOverdueNotified.delete(id);
  saveCurrentUser();
  renderEarningsPanel();
  updateEarningsBadge();
}
function collectAllEarnings() {
  if (!pendingEarnings.length) return;
  let sip = 0, elite = 0;
  pendingEarnings.forEach(e => { sip += e.sip; elite += e.elite; });
  pendingEarnings = [];
  _earningsOverdueNotified.clear();
  if (sip)   { sipDollars += sip; updateSIP(); }
  if (elite) { eliteCoins += elite; updateElite(); }
  sfx.coin();
  showNotif(`💰 Collected everything: +${sip.toLocaleString()} S.I.P. +${elite.toLocaleString()} 💎!`);
  saveCurrentUser();
  renderEarningsPanel();
  updateEarningsBadge();
}
function updateEarningsBadge() {
  const countEl = document.getElementById('earningsCount');
  if (countEl) { countEl.textContent = pendingEarnings.length; countEl.style.display = pendingEarnings.length ? 'flex' : 'none'; }
  const now = Date.now();
  const hasOverdue = pendingEarnings.some(e => now - e.ts >= EARNING_OVERDUE_MS);
  const badge = document.getElementById('earningsBadge');
  if (badge) badge.style.display = hasOverdue ? 'flex' : 'none';
}
// Checked every real EARNINGS_CHECK_INTERVAL seconds (not every frame — a Date.now() diff over a
// small array is cheap, but there's no reason to touch the DOM 60x/sec for a 30-MINUTE threshold).
const EARNINGS_CHECK_INTERVAL = 5;
function tickEarnings() {
  if (!pendingEarnings.length) return;
  const now = Date.now();
  pendingEarnings.forEach(e => {
    if (now - e.ts >= EARNING_OVERDUE_MS && !_earningsOverdueNotified.has(e.id)) {
      _earningsOverdueNotified.add(e.id);
      showNotif(`🔔 ${e.source}'s earning has been sitting for 30+ min — go collect it!`);
      sfx.notify();
    }
  });
  updateEarningsBadge();
}
function toggleEarningsPanel() {
  const panel = document.getElementById('earningsPanel');
  if (panel.style.display === 'none') {
    if (document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    renderEarningsPanel();
    panel.style.display = 'flex';
    document.getElementById('earningsTab').style.display = 'none';
  } else { closeEarningsPanel(); }
}
function closeEarningsPanel() {
  document.getElementById('earningsPanel').style.display = 'none';
  document.getElementById('earningsTab').style.display = 'block';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderEarningsPanel() {
  const list = document.getElementById('earningsList');
  const btn = document.getElementById('earningsCollectAllBtn');
  if (btn) btn.style.display = pendingEarnings.length ? 'block' : 'none';
  if (!pendingEarnings.length) {
    list.innerHTML = `<div style="color:#555;font-size:12px;text-align:center;padding:24px 10px;">No pending earnings yet —<br>go earn some S.I.P. or 💎!</div>`;
    return;
  }
  const now = Date.now();
  list.innerHTML = pendingEarnings.slice().reverse().map(e => {
    const ageMin = Math.floor((now - e.ts) / 60000);
    const overdue = now - e.ts >= EARNING_OVERDUE_MS;
    const amountTxt = [e.sip ? `${e.sip.toLocaleString()} S.I.P.` : '', e.elite ? `${e.elite.toLocaleString()} 💎` : ''].filter(Boolean).join(' + ');
    return `<div onclick="collectEarning('${e.id}')" style="cursor:pointer;background:rgba(255,255,255,0.05);border:2px solid ${overdue ? '#ff3333' : '#333'};border-radius:10px;padding:10px;margin-bottom:8px;">
      <div style="color:#fff;font-size:12px;font-weight:bold;margin-bottom:3px;">💰 +${amountTxt}</div>
      <div style="color:${overdue ? '#ff6666' : '#888'};font-size:10px;">from ${e.source} — ${ageMin < 1 ? 'just now' : ageMin + 'm ago'}${overdue ? ' ⚠️ OVERDUE' : ''}</div>
    </div>`;
  }).join('');
}

// ─── GROWTH — a real, shared "age up" system driven by accumulated real PLAY seconds (same
// convention as elderLifespans below: only ticks while actually playing, not wall-clock time).
// Used by the player's own body AND by adopted/baby children so "growing up" means the same
// thing everywhere instead of three separate half-built systems. ───────────────────────────
const GROWTH_STAGES = [
  { id:'baby', label:'Baby',  emoji:'🍼', scale:0.55, at:0    },
  { id:'kid',  label:'Kid',   emoji:'🧒', scale:0.75, at:180  }, // 3 real min played
  { id:'teen', label:'Teen',  emoji:'🧑', scale:0.9,  at:600  }, // 10 real min played
  { id:'adult',label:'Adult', emoji:'🧑‍🦱', scale:1.0,  at:1800 }, // 30 real min played
];
function growthStageFor(seconds) {
  let s = GROWTH_STAGES[0];
  for (const st of GROWTH_STAGES) { if (seconds >= st.at) s = st; }
  return s;
}
let playTimeSeconds = 0; // persisted — real seconds actually played, drives the player's own growth stage
let lastGrowthStageId = 'adult'; // persisted — so a fresh login doesn't re-fire the "you grew!" notif every time
let ownedComputers = [];   // array of owned computer ids e.g. ['sic','sdic']
let ownedCars   = [];
let carLocation = 'Downtown Explox'; // where your FIRST-owned car currently sits — 'Downtown Explox' or a country name
let parkedCars  = [];      // [{def, group, carYaw}]
let activeCar   = null;
let inCar       = false;
let playerSeated = false; // toggled by sitting on a bench (your own or, if invited, someone else's) — freezes movement
let carYaw      = 0;
let playerInventory = {}; // { itemId: {name, emoji, qty} }
let safeBalance     = 0;
let safeCombo       = null;
let safeInventory   = null; // null = not yet initialised (will be filled on first open)
let playerBirthday  = '';      // stored as 'MM-DD'
let lastBirthdayGiftDate = ''; // persisted 'YYYY-MM-DD' — so the birthday gift/party only fires once per real day, even across reloads
let treeMeshes      = [];      // tree canopy mesh refs for seasonal color
let groundMesh      = null;    // ground mesh ref for seasonal color
let weatherParticles = [];     // snow / leaf particle meshes

// Items that cost S.I.P. — free items are not listed here
// Exactly 5 free options per section (hat/hair/shirt/pants/shoes), everything past that costs
// real S.I.P. — a section only needs an entry added here to make a 6th+ option paid, so this
// scales up to 50 options per section without any other code changing (refreshItemLocks() and
// setupBtnGroup() already key off whatever buttons exist in the HTML, not a hardcoded count).
// Pants/shoes only have 5 options total right now, so all 5 are free — the first new one added
// past that becomes the section's first paid item.
const ITEM_PRICES = {
  hat_helmet:60, hat_tophat:60, hat_pirate:80, hat_wizard:80, hat_crown:100, hat_santa:100,
  hair_ponytail:25, hair_afro:50,
  shirt_suit:60,
  // 50 new hat/shirt/pants/shoe styles (item ~236, user's own correction: "there is shirts hats
  // and stuff that is what i mean" — real new styles, not outfit color presets).
  hat_bandana:40, hat_headband:35, hat_partyhat:45, hat_bucket:55, hat_jester:75,
  hat_viking:85, hat_graduation:65, hat_flower:50, hat_backwards:40, hat_sombrero:70,
  hat_propeller:60, hat_antlers:65, hat_headphones:70, hat_chef:55, hat_turban:60,
  shirt_crewneck:35, shirt_vneck:40, shirt_flannel:55, shirt_polo:50, shirt_crop:45,
  shirt_turtleneck:50, shirt_buttonup:55, shirt_camo:60, shirt_graphic:45, shirt_raincoat:70,
  shirt_denim:65, shirt_tuxedo:90, shirt_sweater:55, shirt_crophoodie:60, shirt_overshirt:50,
  pants_overalls:50, pants_skirt:35, pants_leggings:35, pants_capri:40, pants_plaid:45,
  pants_bellbottom:50, pants_camopants:55, pants_skinny:40, pants_sweatpants:35, pants_kilt:65,
  shoe_flipflops:25, shoe_rainboots:45, shoe_cleats:55, shoe_slippers:25, shoe_platform:50,
  shoe_cowboyboots:70, shoe_crocs:35, shoe_wedges:50, shoe_moccasins:40, shoe_skates:80,
};

// ─── PRE-MADE SKINS ──────────────────────────────────────────────────────────
const SKINS = [
  // BOY SKINS
  { id:'skin_city_boy',     name:'City Boy',     icon:'🏙️', gender:'boy',  price:500,
    colors:{skin:'#f5c89a',shirt:'#1565C0',pants:'#1a237e',shoes:'#eeeeee',hair:'#1a0a00'},
    hat:'none',  hair:'short',   shirt:'hoodie',  pants:'long',   shoes:'sneakers' },
  { id:'skin_baller',       name:'Baller',       icon:'🏀', gender:'boy',  price:800,
    colors:{skin:'#c97a50',shirt:'#c62828',pants:'#111111',shoes:'#b71c1c',hair:'#1a0a00'},
    hat:'none',  hair:'afro',    shirt:'jersey',  pants:'shorts', shoes:'hightop' },
  { id:'skin_suit_up',      name:'Suit Up',      icon:'🤵', gender:'boy',  price:1500,
    colors:{skin:'#f5c89a',shirt:'#424242',pants:'#212121',shoes:'#111111',hair:'#1a0a00'},
    hat:'none',  hair:'short',   shirt:'suit',    pants:'long',   shoes:'boots' },
  { id:'skin_pirate_king',  name:'Pirate King',  icon:'🏴‍☠️', gender:'boy',  price:2000,
    colors:{skin:'#d4956a',shirt:'#8B4513',pants:'#333333',shoes:'#5d4037',hair:'#4e2600'},
    hat:'pirate',hair:'long',    shirt:'striped', pants:'ripped', shoes:'boots' },
  { id:'skin_dark_wizard',  name:'Dark Wizard',  icon:'🧙', gender:'boy',  price:3000,
    colors:{skin:'#e8c080',shirt:'#4a148c',pants:'#1a0033',shoes:'#212121',hair:'#6a1b9a'},
    hat:'wizard',hair:'spiky',   shirt:'hoodie',  pants:'cargo',  shoes:'boots' },
  // GIRL SKINS
  { id:'skin_cherry_pop',   name:'Cherry Pop',   icon:'🌸', gender:'girl', price:500,
    colors:{skin:'#f5c89a',shirt:'#f06292',pants:'#fce4ec',shoes:'#ffe0b2',hair:'#e91e63'},
    hat:'none',  hair:'ponytail',shirt:'plain',   pants:'shorts', shoes:'sandals' },
  { id:'skin_street_fire',  name:'Street Fire',  icon:'🔥', gender:'girl', price:800,
    colors:{skin:'#c97a50',shirt:'#e53935',pants:'#424242',shoes:'#111111',hair:'#e53935'},
    hat:'none',  hair:'spiky',   shirt:'tanktop', pants:'ripped', shoes:'hightop' },
  { id:'skin_pop_star',     name:'Pop Star',     icon:'⭐', gender:'girl', price:1500,
    colors:{skin:'#f5c89a',shirt:'#FDD835',pants:'#212121',shoes:'#FDD835',hair:'#FDD835'},
    hat:'crown', hair:'curly',   shirt:'jersey',  pants:'shorts', shoes:'hightop' },
  { id:'skin_ocean_queen',  name:'Ocean Queen',  icon:'🌊', gender:'girl', price:2000,
    colors:{skin:'#d4956a',shirt:'#00838f',pants:'#006064',shoes:'#80deea',hair:'#00bcd4'},
    hat:'none',  hair:'long',    shirt:'hoodie',  pants:'cargo',  shoes:'sandals' },
  { id:'skin_snow_princess',name:'Snow Princess',icon:'❄️', gender:'girl', price:3000,
    colors:{skin:'#f5c89a',shirt:'#e3f2fd',pants:'#f0f4ff',shoes:'#e3f2fd',hair:'#b3e5fc'},
    hat:'beanie',hair:'ponytail',shirt:'hoodie',  pants:'long',   shoes:'sneakers' },
  // ELITE SKINS — priced in 💎 Elite Coins (only earned from tough robot fights), not S.I.P.
  { id:'skin_diamond_champion', name:'Diamond Champion', icon:'💎', gender:'boy', price:25, currency:'elite',
    colors:{skin:'#f5c89a',shirt:'#4fd8ff',pants:'#0a2a3a',shoes:'#4fd8ff',hair:'#eaf7ff'},
    hat:'crown', hair:'spiky', shirt:'suit', pants:'long', shoes:'boots' },
  { id:'skin_crystal_star', name:'Crystal Star', icon:'💎', gender:'girl', price:25, currency:'elite',
    colors:{skin:'#f5c89a',shirt:'#e0d8ff',pants:'#2a1a4a',shoes:'#e0d8ff',hair:'#c9a8ff'},
    hat:'crown', hair:'long', shirt:'hoodie', pants:'long', shoes:'sneakers' },
];

function applySkin(idx) {
  const s = SKINS[idx];
  if(!s) return;
  const owned = ownedSkins.includes(s.id);
  const isElite = s.currency === 'elite';
  if(!owned) {
    const wallet = isElite ? eliteCoins : sipDollars;
    if(wallet < s.price) { showCustomMsg(isElite ? `❌ Need ${s.price} 💎 Elite Coins to unlock!` : `❌ Need ${s.price} S.I.P. to unlock!`); return; }
    if (isElite) { eliteCoins -= s.price; updateElite(); } else { spendSip(s.price); }
    ownedSkins.push(s.id);
    // auto-unlock individual items that come with this skin
    ['hat_'+s.hat,'hair_'+s.hair,'shirt_'+s.shirt,'pants_'+s.pants,'shoe_'+s.shoes].forEach(key => {
      if(ITEM_PRICES[key] && !ownedItems.includes(key)) ownedItems.push(key);
    });
    document.getElementById('customSip').textContent = sipDollars;
    showCustomMsg(`✅ ${s.name} unlocked!`, '#00e676');
    renderSkinsSection();
    refreshItemLocks();
  }
  // apply all properties
  playerColors = { ...s.colors };
  playerHat = s.hat; playerHair = s.hair;
  playerShirt = s.shirt; playerPants = s.pants; playerShoes = s.shoes;
  document.getElementById('skinColor').value  = s.colors.skin;
  document.getElementById('shirtColor').value = s.colors.shirt;
  document.getElementById('pantsColor').value = s.colors.pants;
  document.getElementById('shoeColor').value  = s.colors.shoes;
  document.getElementById('hairColor').value  = s.colors.hair;
  setBtn('hatBtns', s.hat); setBtn('hairBtns', s.hair);
  setBtn('shirtBtns', s.shirt); setBtn('pantsBtns', s.pants); setBtn('shoeBtns', s.shoes);
  refreshPreviews();
  saveCurrentUser();
  if(owned) showCustomMsg(`✅ ${s.name} applied!`, '#00e676');
}

function renderSkinsSection() {
  const el = document.getElementById('skinsSection');
  if(!el) return;
  el.innerHTML = '';
  ['boy','girl'].forEach(gender => {
    const label = document.createElement('div');
    label.style.cssText = 'color:#aaa;font-size:10px;letter-spacing:2px;font-weight:bold;margin:8px 0 4px;';
    label.textContent = gender === 'boy' ? '👦 BOY SKINS' : '👧 GIRL SKINS';
    el.appendChild(label);
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;';
    SKINS.forEach((s, i) => {
      if(s.gender !== gender) return;
      const owned = ownedSkins.includes(s.id);
      const card = document.createElement('div');
      card.style.cssText = `background:#12122a;border:2px solid ${owned?'#00e676':'#333'};border-radius:8px;padding:7px 6px;cursor:pointer;transition:border-color 0.2s;`;
      card.onmouseenter = () => { if(!owned) card.style.borderColor='#e94560'; };
      card.onmouseleave = () => { card.style.borderColor = owned?'#00e676':'#333'; };
      // color swatches
      const swatches = document.createElement('div');
      swatches.style.cssText = 'display:flex;gap:2px;margin-bottom:4px;';
      ['skin','hair','shirt','pants','shoes'].forEach(k => {
        const dot = document.createElement('div');
        dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${s.colors[k]};border:1px solid #555;`;
        swatches.appendChild(dot);
      });
      card.appendChild(swatches);
      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:11px;font-weight:bold;color:#fff;';
      nameEl.textContent = s.icon + ' ' + s.name;
      card.appendChild(nameEl);
      const btn = document.createElement('button');
      btn.style.cssText = `margin-top:5px;width:100%;padding:4px 0;border:none;border-radius:5px;font-size:10px;font-weight:bold;cursor:pointer;background:${owned?'#1b5e20':'#e94560'};color:#fff;`;
      btn.textContent = owned ? '▶ Apply' : s.price + (s.currency === 'elite' ? ' 💎 Buy' : ' 💰 Buy');
      btn.onclick = () => applySkin(i);
      card.appendChild(btn);
      grid.appendChild(card);
    });
    el.appendChild(grid);
  });
}

// ─── CUSTOM SHOP MESSAGE ─────────────────────────────────────────────────────
function showCustomMsg(txt, col='#ff4444') {
  const el = document.getElementById('customMsg');
  if(!el) return;
  el.style.color = col; el.textContent = txt;
  setTimeout(() => el.textContent = '', 2200);
}

// ─── ITEM LOCK BADGES ────────────────────────────────────────────────────────
function refreshItemLocks() {
  const groups = ['hatBtns','hairBtns','shirtBtns','pantsBtns','shoeBtns'];
  groups.forEach(gid => {
    const category = gid.replace('Btns','');
    document.getElementById(gid).querySelectorAll('.optBtn').forEach(btn => {
      const key = category + '_' + btn.dataset.val;
      const price = ITEM_PRICES[key];
      // Remove old badge
      const old = btn.querySelector('.priceTag, .ownedTag');
      if(old) old.remove();
      if(price) {
        const owned = ownedItems.includes(key);
        btn.classList.toggle('locked', !owned);
        const badge = document.createElement('span');
        badge.className = owned ? 'ownedTag' : 'priceTag';
        badge.textContent = owned ? '✓ owned' : price + ' 💰';
        btn.appendChild(badge);
      } else {
        btn.classList.remove('locked');
      }
    });
  });
}

// ─── BUTTON GROUPS ───────────────────────────────────────────────────────────
function setupBtnGroup(id, setter) {
  document.getElementById(id).querySelectorAll('.optBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = id.replace('Btns','');
      const key = category + '_' + btn.dataset.val;
      const price = ITEM_PRICES[key];

      // If item costs money and isn't owned yet
      if(price && !ownedItems.includes(key)) {
        if(sipDollars < price) {
          showCustomMsg(`❌ Need ${price} S.I.P. to unlock!`);
          return;
        }
        spendSip(price);
        ownedItems.push(key);
        saveCurrentUser();
        document.getElementById('customSip').textContent = sipDollars;
        showCustomMsg(`✅ Unlocked! -${price} S.I.P.`, '#44ff88');
        refreshItemLocks();
      }

      document.getElementById(id).querySelectorAll('.optBtn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      setter(btn.dataset.val);
      refreshPreviews();
    });
  });
}
setupBtnGroup('hatBtns',   v => playerHat   = v);
setupBtnGroup('hairBtns',  v => playerHair  = v);
setupBtnGroup('shirtBtns', v => playerShirt = v);
setupBtnGroup('pantsBtns', v => playerPants = v);
setupBtnGroup('shoeBtns',  v => playerShoes = v);
['skinColor','shirtColor','pantsColor','shoeColor','hairColor'].forEach(id =>
  document.getElementById(id).addEventListener('input', refreshPreviews)
);
document.getElementById('nameInput').addEventListener('input', refreshPreviews);

// ─── 2D PREVIEW ──────────────────────────────────────────────────────────────
function hexVal(id) { return document.getElementById(id).value; }
function rgb(h) { return `rgb(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)})`; }

function drawPreview() {
  const previewCanvas = document.getElementById('previewCanvas');
  if(!previewCanvas) return;
  const px = previewCanvas.getContext('2d');
  if(!px) return;
  px.clearRect(0,0,140,210);
  // gradient background - lighter at top so character stands out
  const bg = px.createLinearGradient(0,0,0,210);
  bg.addColorStop(0,'#1a1a4e'); bg.addColorStop(1,'#0d0d28');
  px.fillStyle=bg; px.fillRect(0,0,140,210);
  // floor line
  px.fillStyle='#2a2a5a'; px.fillRect(0,175,140,35);
  const skin=rgb(hexVal('skinColor')), shirt=rgb(hexVal('shirtColor'));
  const pants=rgb(hexVal('pantsColor')), shoes=rgb(hexVal('shoeColor')), hair=rgb(hexVal('hairColor'));
  const cx=70;

  px.fillStyle='rgba(0,0,0,0.18)'; px.beginPath(); px.ellipse(cx,200,20,5,0,0,Math.PI*2); px.fill();

  // Long/curly hair behind head
  px.fillStyle=hair;
  if(playerHair==='long')    { px.fillRect(cx-25,38,9,55); px.fillRect(cx+16,38,9,55); px.fillRect(cx-25,38,50,10); }
  if(playerHair==='ponytail'){ px.fillRect(cx-25,38,50,10); px.fillRect(cx+18,42,7,38); }
  if(playerHair==='afro')    { px.beginPath(); px.ellipse(cx,44,28,28,0,0,Math.PI*2); px.fill(); }
  if(playerHair==='curly')   { for(let i=0;i<6;i++){px.beginPath();px.arc(cx-20+i*9,38+Math.sin(i)*4,7,0,Math.PI*2);px.fill();} px.fillRect(cx-25,44,50,6); }

  // Shoes
  px.fillStyle=shoes;
  if(playerShoes==='boots')   { px.fillRect(cx-18,160,15,28); px.fillRect(cx+3,160,15,28); }
  else if(playerShoes==='sandals') { px.fillRect(cx-17,178,14,8); px.fillRect(cx+3,178,14,8); }
  else if(playerShoes==='hightop') { px.fillRect(cx-18,168,15,20); px.fillRect(cx+3,168,15,20); }
  // 10 new shoes
  else if(playerShoes==='flipflops')  { px.fillRect(cx-17,182,14,4); px.fillRect(cx+3,182,14,4); }
  else if(playerShoes==='rainboots')  { px.fillRect(cx-18,155,15,33); px.fillRect(cx+3,155,15,33); }
  else if(playerShoes==='cowboyboots'){ px.fillRect(cx-19,150,16,38); px.fillRect(cx+3,150,16,38); }
  else if(playerShoes==='platform')   { px.fillRect(cx-18,170,15,18); px.fillRect(cx+3,170,15,18); }
  else if(playerShoes==='cleats')     { px.fillRect(cx-18,178,15,10); px.fillRect(cx+3,178,15,10); px.fillStyle='#222'; for(let i=0;i<3;i++){px.fillRect(cx-16+i*5,188,2,4);px.fillRect(cx+5+i*5,188,2,4);} }
  else if(playerShoes==='slippers')   { px.beginPath(); px.ellipse(cx-10,183,9,7,0,0,Math.PI*2); px.fill(); px.beginPath(); px.ellipse(cx+10,183,9,7,0,0,Math.PI*2); px.fill(); }
  else if(playerShoes==='crocs')      { px.fillRect(cx-18,175,15,13); px.fillRect(cx+3,175,15,13); px.fillStyle='rgba(0,0,0,0.3)'; px.fillRect(cx-15,178,3,3); px.fillRect(cx-9,178,3,3); px.fillRect(cx+6,178,3,3); px.fillRect(cx+12,178,3,3); }
  else if(playerShoes==='wedges')     { px.fillRect(cx-18,168,15,20); px.fillRect(cx+3,168,15,20); }
  else if(playerShoes==='moccasins')  { px.fillRect(cx-17,180,14,8); px.fillRect(cx+3,180,14,8); }
  else if(playerShoes==='skates')     { px.fillRect(cx-18,178,15,10); px.fillRect(cx+3,178,15,10); px.fillStyle='#888'; [-14,-6,6,14].forEach(sx=>{px.beginPath();px.arc(cx+sx,190,3,0,Math.PI*2);px.fill();}); }
  else { px.fillRect(cx-18,178,15,10); px.fillRect(cx+3,178,15,10); }
  px.strokeStyle='rgba(255,255,255,0.18)'; px.lineWidth=1;
  px.strokeRect(cx-18,178,15,10); px.strokeRect(cx+3,178,15,10);

  // Pants
  px.fillStyle=pants;
  if(playerPants==='shorts')  { px.fillRect(cx-16,130,14,22); px.fillRect(cx+2,130,14,22); px.fillStyle=skin; px.fillRect(cx-15,152,13,24); px.fillRect(cx+2,152,13,24); px.fillStyle=pants; }
  else if(playerPants==='skirt' || playerPants==='kilt') { px.beginPath(); px.moveTo(cx-18,130); px.lineTo(cx+18,130); px.lineTo(cx+24,160); px.lineTo(cx-24,160); px.closePath(); px.fill(); px.fillStyle=skin; px.fillRect(cx-15,160,13,16); px.fillRect(cx+2,160,13,16); px.fillStyle=pants; }
  else { px.fillRect(cx-16,130,14,46); px.fillRect(cx+2,130,14,46); }
  if(playerPants==='ripped')  { px.fillStyle='rgba(0,0,0,0.25)'; px.fillRect(cx-14,148,10,4); px.fillRect(cx+4,155,10,4); }
  if(playerPants==='cargo')   { px.fillStyle='rgba(0,0,0,0.2)'; px.fillRect(cx-15,148,12,10); px.fillRect(cx+3,148,12,10); }
  // 10 new pants (2 new leg SHAPES above — skirt/kilt — plus 8 accent-only styles below).
  if(playerPants==='capri')      { px.fillStyle=skin; px.fillRect(cx-15,160,13,16); px.fillRect(cx+2,160,13,16); }
  if(playerPants==='leggings')   { px.fillStyle='rgba(0,0,0,0.15)'; px.fillRect(cx-16,130,3,46); px.fillRect(cx+13,130,3,46); }
  if(playerPants==='plaid')      { px.strokeStyle='rgba(0,0,0,0.3)'; px.lineWidth=1.5; for(let i=0;i<3;i++){px.beginPath();px.moveTo(cx-16,140+i*12);px.lineTo(cx+16,140+i*12);px.stroke();} }
  if(playerPants==='bellbottom') { px.fillStyle=pants; px.fillRect(cx-19,166,18,10); px.fillRect(cx+1,166,18,10); }
  if(playerPants==='camopants')  { px.fillStyle='rgba(40,60,20,0.5)'; [[cx-10,140],[cx+8,150],[cx-6,166]].forEach(([bx,by])=>{px.beginPath();px.ellipse(bx,by,6,5,0.4,0,Math.PI*2);px.fill();}); }
  if(playerPants==='skinny')     { px.fillStyle='rgba(0,0,0,0.1)'; px.fillRect(cx-16,130,3,46); px.fillRect(cx+13,130,3,46); }
  if(playerPants==='sweatpants') { px.fillStyle='rgba(255,255,255,0.3)'; px.fillRect(cx-16,172,14,4); px.fillRect(cx+2,172,14,4); }
  if(playerPants==='overalls')   { px.fillStyle=pants; px.fillRect(cx-10,90,6,42); px.fillRect(cx+4,90,6,42); px.fillRect(cx-14,120,28,20); }

  // Shirt
  px.fillStyle=shirt;
  if(playerShirt==='tanktop') {
    px.fillRect(cx-16,84,32,48); px.fillStyle=skin; px.fillRect(cx-10,82,20,8); px.fillRect(cx-20,84,6,20); px.fillRect(cx+14,84,6,20);
  } else if(playerShirt==='hoodie') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,40); px.fillRect(cx+18,84,10,40);
    px.strokeStyle='rgba(0,0,0,0.3)'; px.lineWidth=2; px.beginPath(); px.moveTo(cx-6,84); px.lineTo(cx-4,100); px.stroke(); px.beginPath(); px.moveTo(cx+6,84); px.lineTo(cx+4,100); px.stroke();
  } else if(playerShirt==='suit') {
    px.fillStyle='#222'; px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillStyle=shirt; px.beginPath(); px.moveTo(cx-10,82); px.lineTo(cx,95); px.lineTo(cx-10,105); px.closePath(); px.fill();
    px.beginPath(); px.moveTo(cx+10,82); px.lineTo(cx,95); px.lineTo(cx+10,105); px.closePath(); px.fill();
    px.fillStyle='#cc2222'; px.fillRect(cx-3,84,6,28);
  } else if(playerShirt==='striped') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillStyle='rgba(255,255,255,0.28)'; for(let i=0;i<5;i++) px.fillRect(cx-22,84+i*10,44,5);
  } else if(playerShirt==='jersey') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillStyle='rgba(255,255,255,0.8)'; px.font='bold 18px Arial'; px.textAlign='center'; px.fillText('10',cx,112);
  } else if(playerShirt==='crewneck') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.strokeStyle='rgba(0,0,0,0.3)'; px.lineWidth=2; px.beginPath(); px.arc(cx,84,10,0,Math.PI); px.stroke();
  } else if(playerShirt==='vneck') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillStyle=skin; px.beginPath(); px.moveTo(cx-8,82); px.lineTo(cx,100); px.lineTo(cx+8,82); px.closePath(); px.fill();
  } else if(playerShirt==='flannel') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.strokeStyle='rgba(0,0,0,0.3)'; px.lineWidth=2;
    for(let i=0;i<4;i++){px.beginPath();px.moveTo(cx-22,90+i*11);px.lineTo(cx+22,90+i*11);px.stroke();}
    for(let i=0;i<4;i++){px.beginPath();px.moveTo(cx-16+i*11,82);px.lineTo(cx-16+i*11,132);px.stroke();}
  } else if(playerShirt==='polo') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillStyle='#fff'; px.beginPath(); px.moveTo(cx-9,82); px.lineTo(cx,92); px.lineTo(cx-9,100); px.closePath(); px.fill();
    px.beginPath(); px.moveTo(cx+9,82); px.lineTo(cx,92); px.lineTo(cx+9,100); px.closePath(); px.fill();
    px.fillRect(cx-2,92,4,4); px.fillRect(cx-2,100,4,4);
  } else if(playerShirt==='crop') {
    px.fillRect(cx-22,82,44,30); px.fillRect(cx-28,84,10,26); px.fillRect(cx+18,84,10,26);
  } else if(playerShirt==='turtleneck') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillRect(cx-11,74,22,10);
  } else if(playerShirt==='buttonup') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillStyle='rgba(255,255,255,0.85)'; px.beginPath(); px.moveTo(cx-9,82); px.lineTo(cx,94); px.lineTo(cx-9,104); px.closePath(); px.fill();
    px.beginPath(); px.moveTo(cx+9,82); px.lineTo(cx,94); px.lineTo(cx+9,104); px.closePath(); px.fill();
    px.fillStyle='#333'; for(let i=0;i<4;i++) px.fillRect(cx-2,92+i*9,4,4);
  } else if(playerShirt==='camo') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillStyle='rgba(40,60,20,0.5)'; [[cx-16,90],[cx+2,100],[cx-8,118],[cx+8,88],[cx-2,128]].forEach(([bx,by])=>{px.beginPath();px.ellipse(bx,by,9,6,0.4,0,Math.PI*2);px.fill();});
  } else if(playerShirt==='graphic') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillStyle='#ffcc00'; px.fillRect(cx-9,98,18,18);
    px.fillStyle='#222'; px.font='bold 12px Arial'; px.textAlign='center'; px.fillText('★',cx,111);
  } else if(playerShirt==='raincoat') {
    px.fillRect(cx-24,80,48,56); px.fillRect(cx-30,82,10,48); px.fillRect(cx+20,82,10,48);
    px.fillStyle='rgba(255,255,255,0.3)'; px.fillRect(cx-24,80,48,4);
  } else if(playerShirt==='denim') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.strokeStyle='rgba(255,220,120,0.6)'; px.lineWidth=1.5;
    px.beginPath(); px.moveTo(cx-16,82); px.lineTo(cx-10,100); px.stroke(); px.beginPath(); px.moveTo(cx+16,82); px.lineTo(cx+10,100); px.stroke();
  } else if(playerShirt==='tuxedo') {
    px.fillStyle='#111'; px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillStyle='#fff'; px.beginPath(); px.moveTo(cx-9,82); px.lineTo(cx,95); px.lineTo(cx-9,105); px.closePath(); px.fill();
    px.beginPath(); px.moveTo(cx+9,82); px.lineTo(cx,95); px.lineTo(cx+9,105); px.closePath(); px.fill();
    px.fillStyle='#111'; px.beginPath(); px.moveTo(cx-6,84); px.lineTo(cx,88); px.lineTo(cx+6,84); px.lineTo(cx,92); px.closePath(); px.fill();
  } else if(playerShirt==='sweater') {
    px.fillRect(cx-23,82,46,50); px.fillRect(cx-29,84,10,44); px.fillRect(cx+19,84,10,44);
    px.fillStyle='rgba(0,0,0,0.15)'; for(let i=0;i<8;i++) px.fillRect(cx-23,86+i*6,46,3);
  } else if(playerShirt==='crophoodie') {
    px.fillRect(cx-22,82,44,32); px.fillRect(cx-28,84,10,28); px.fillRect(cx+18,84,10,28);
    px.strokeStyle='rgba(0,0,0,0.3)'; px.lineWidth=2; px.beginPath(); px.moveTo(cx-6,84); px.lineTo(cx-4,96); px.stroke(); px.beginPath(); px.moveTo(cx+6,84); px.lineTo(cx+4,96); px.stroke();
  } else if(playerShirt==='overshirt') {
    px.fillStyle=skin; px.fillRect(cx-16,84,32,44); px.fillStyle=shirt;
    px.fillRect(cx-24,82,48,50); px.fillRect(cx-30,84,10,44); px.fillRect(cx+20,84,10,44);
  } else {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
  }

  // Custom shirt design (drawn via the Paint Editor) — a simple centered overlay works across
  // every shirt style above rather than trying to match each one's unique silhouette.
  if (playerShirtPaint) {
    const spImg = pfpGetImage(playerShirtPaint);
    if (spImg.complete && spImg.naturalWidth) {
      px.imageSmoothingEnabled = false;
      px.drawImage(spImg, cx-18, 86, 36, 40);
    }
  }

  // Neck + head
  px.fillStyle=skin; px.fillRect(cx-7,72,14,14); px.fillRect(cx-20,36,40,38);
  px.strokeStyle='rgba(255,255,255,0.15)'; px.lineWidth=1; px.strokeRect(cx-20,36,40,38);
  px.fillStyle='#222'; px.fillRect(cx-12,47,8,8); px.fillRect(cx+4,47,8,8);
  px.fillStyle='#fff'; px.fillRect(cx-10,49,3,3); px.fillRect(cx+6,49,3,3);
  px.strokeStyle='#333'; px.lineWidth=2; px.beginPath(); px.arc(cx,61,7,0.2,Math.PI-0.2); px.stroke();

  // Hair on top
  px.fillStyle=hair;
  if(playerHair==='short')    { px.fillRect(cx-22,32,44,12); px.fillRect(cx-24,36,8,12); px.fillRect(cx+16,36,8,12); }
  if(playerHair==='spiky')    { px.fillRect(cx-20,30,40,10); [-14,-7,0,7,14].forEach(sx=>{px.beginPath();px.moveTo(cx+sx-5,30);px.lineTo(cx+sx,10);px.lineTo(cx+sx+5,30);px.closePath();px.fill();}); }
  if(playerHair==='ponytail') { px.fillRect(cx-22,30,44,12); }

  // Hat
  if(playerHat==='cap')    { px.fillStyle='#dd3333'; px.fillRect(cx-24,32,48,8); px.fillRect(cx-16,14,32,20); px.fillRect(cx+10,34,16,5); }
  else if(playerHat==='cowboy') { px.fillStyle='#8B4513'; px.fillRect(cx-30,32,60,6); px.fillRect(cx-14,10,28,24); }
  else if(playerHat==='crown')  { px.fillStyle='#FFD700'; px.fillRect(cx-20,32,40,6); [[-16,8],[-8,0],[0,6],[8,0],[16,8]].forEach(([x2,y])=>px.fillRect(cx+x2-4,32-20+y,8,22-y)); px.fillStyle='#e94560'; px.fillRect(cx-4,14,8,8); px.fillRect(cx-14,20,6,6); px.fillRect(cx+8,20,6,6); }
  else if(playerHat==='helmet') { px.fillStyle='#555'; px.fillRect(cx-24,18,48,22); px.fillRect(cx-22,14,44,8); px.fillStyle='rgba(100,200,255,0.45)'; px.fillRect(cx-18,20,36,16); }
  else if(playerHat==='tophat') { px.fillStyle='#111'; px.fillRect(cx-26,34,52,6); px.fillRect(cx-16,4,32,32); }
  else if(playerHat==='beanie') { px.fillStyle=rgb(hexVal('shirtColor')); px.fillRect(cx-22,14,44,28); px.fillStyle='#fff'; px.beginPath(); px.arc(cx,14,8,0,Math.PI*2); px.fill(); }
  else if(playerHat==='fedora') { px.fillStyle='#7a5c3a'; px.fillRect(cx-28,34,56,5); px.fillRect(cx-16,12,32,24); px.fillStyle='#333'; px.fillRect(cx-16,30,32,5); }
  else if(playerHat==='wizard') { px.fillStyle='#4444aa'; px.beginPath(); px.moveTo(cx,0); px.lineTo(cx-20,36); px.lineTo(cx+20,36); px.closePath(); px.fill(); px.fillRect(cx-28,34,56,6); }
  else if(playerHat==='pirate') { px.fillStyle='#111'; px.fillRect(cx-28,32,56,6); px.fillRect(cx-18,10,36,24); px.fillStyle='#fff'; px.beginPath(); px.arc(cx,24,9,0,Math.PI*2); px.fill(); px.fillStyle='#111'; px.fillRect(cx-6,26,5,6); px.fillRect(cx+1,26,5,6); px.fillRect(cx-8,20,5,5); px.fillRect(cx+3,20,5,5); }
  else if(playerHat==='santa')  { px.fillStyle='#dd2222'; px.fillRect(cx-22,32,44,6); px.beginPath(); px.moveTo(cx-18,32); px.lineTo(cx+8,4); px.lineTo(cx+20,32); px.closePath(); px.fill(); px.fillStyle='#fff'; px.fillRect(cx-24,30,48,8); px.beginPath(); px.arc(cx+10,6,6,0,Math.PI*2); px.fill(); }
  // 15 new hats (item ~236, user's own correction: "there is shirts hats and stuff that is what
  // i mean" — real new style options, not outfit color presets).
  else if(playerHat==='bandana')   { px.fillStyle='#cc3355'; px.fillRect(cx-22,20,44,10); px.beginPath(); px.moveTo(cx+20,25); px.lineTo(cx+32,20); px.lineTo(cx+32,30); px.closePath(); px.fill(); }
  else if(playerHat==='headband')  { px.fillStyle='#3388cc'; px.fillRect(cx-22,18,44,7); }
  else if(playerHat==='partyhat')  { px.fillStyle='#ffcc00'; px.beginPath(); px.moveTo(cx,-2); px.lineTo(cx-16,32); px.lineTo(cx+16,32); px.closePath(); px.fill(); px.fillStyle='#ff3366'; px.beginPath(); px.arc(cx,0,4,0,Math.PI*2); px.fill(); }
  else if(playerHat==='bucket')    { px.fillStyle='#4a7a4a'; px.fillRect(cx-30,30,60,7); px.fillRect(cx-18,14,36,20); }
  else if(playerHat==='jester')    { px.fillStyle='#8833cc'; [-14,0,14].forEach((jx,i)=>{px.beginPath();px.moveTo(cx+jx-8,32);px.lineTo(cx+jx,32-24-i%2*6);px.lineTo(cx+jx+8,32);px.closePath();px.fill();}); px.fillRect(cx-20,30,40,6); }
  else if(playerHat==='viking')    { px.fillStyle='#999999'; px.fillRect(cx-16,18,32,18); px.fillStyle='#eeeecc'; px.beginPath(); px.moveTo(cx-16,20); px.lineTo(cx-30,6); px.lineTo(cx-22,22); px.closePath(); px.fill(); px.beginPath(); px.moveTo(cx+16,20); px.lineTo(cx+30,6); px.lineTo(cx+22,22); px.closePath(); px.fill(); }
  else if(playerHat==='graduation'){ px.fillStyle='#111111'; px.fillRect(cx-16,20,32,16); px.fillRect(cx-26,14,52,5); px.strokeStyle='#FFD700'; px.lineWidth=2; px.beginPath(); px.moveTo(cx+22,16); px.lineTo(cx+22,34); px.stroke(); }
  else if(playerHat==='flower')    { px.fillStyle='#2d7a2d'; px.fillRect(cx-20,18,40,7); ['#ff69b4','#ffcc00','#ff6688','#cc88ff','#ffffff'].forEach((col,i)=>{px.fillStyle=col;px.beginPath();px.arc(cx-16+i*8,20,4,0,Math.PI*2);px.fill();}); }
  else if(playerHat==='backwards') { px.fillStyle='#3355aa'; px.fillRect(cx-16,14,32,20); px.fillRect(cx-16,30,32,6); px.fillRect(cx-6,10,12,8); }
  else if(playerHat==='sombrero')  { px.fillStyle='#d4a860'; px.fillRect(cx-38,30,76,6); px.fillRect(cx-16,10,32,22); px.fillStyle='#a8763a'; px.fillRect(cx-38,30,76,3); }
  else if(playerHat==='propeller') { px.fillStyle='#dd4444'; px.fillRect(cx-20,16,40,22); px.fillStyle='#888'; px.fillRect(cx-2,10,4,8); px.fillStyle='#ccc'; px.fillRect(cx-14,10,28,3); }
  else if(playerHat==='antlers')   { px.fillStyle=hair; px.fillRect(cx-18,16,36,18); px.fillStyle='#8B5A2B'; [-14,14].forEach(ax=>{px.fillRect(cx+ax-2,-2,4,20); px.fillRect(cx+ax-8,4,8,3); px.fillRect(cx+ax,10,8,3);}); }
  else if(playerHat==='headphones'){ px.fillStyle='#222222'; px.fillRect(cx-24,20,6,16); px.fillRect(cx+18,20,6,16); px.fillRect(cx-22,10,44,6); }
  else if(playerHat==='chef')      { px.fillStyle='#ffffff'; px.fillRect(cx-18,26,36,10); px.beginPath(); px.ellipse(cx,14,20,16,0,0,Math.PI*2); px.fill(); }
  else if(playerHat==='turban')    { px.fillStyle='#8833aa'; px.beginPath(); px.ellipse(cx,20,22,18,0,0,Math.PI*2); px.fill(); px.fillStyle='#ffcc00'; px.beginPath(); px.arc(cx,10,4,0,Math.PI*2); px.fill(); }

  // Nametag
  const name = document.getElementById('nameInput').value || 'Player';
  px.fillStyle='rgba(0,0,0,0.6)'; px.fillRect(cx-30,2,60,16);
  px.fillStyle='#fff'; px.font='bold 11px Arial'; px.textAlign='center';
  px.fillText(name.slice(0,10), cx, 14);
}

function refreshPreviews() {
  try { drawPreview(); } catch(e) { console.warn('drawPreview error:', e); }
  const av = document.getElementById('avatarPreview');
  if(av) { try { drawAvatarCard(av); } catch(e) { console.warn('drawAvatarCard error:', e); } }
}
try { refreshPreviews(); } catch(e) { console.warn('refreshPreviews startup error:', e); }
window.addEventListener('load', () => {
  refreshPreviews();
  loadLoginScreen();
  const createBtn = document.getElementById('createAccBtn');
  if(createBtn) createBtn.addEventListener('click', createAccount);
  const pwInput = document.getElementById('newAccPw');
  if(pwInput) pwInput.addEventListener('keydown', e => { if(e.key === 'Enter') createAccount(); });
  const nameInput2 = document.getElementById('newAccName');
  if(nameInput2) nameInput2.addEventListener('keydown', e => { if(e.key === 'Enter') document.getElementById('newAccPw').focus(); });
});

// ─── PLAY BUTTON ─────────────────────────────────────────────────────────────
document.getElementById('playBtn').addEventListener('click', () => {
  playerName  = document.getElementById('nameInput').value.trim() || 'Player';
  playerColors = { skin:hexVal('skinColor'), shirt:hexVal('shirtColor'), pants:hexVal('pantsColor'), shoes:hexVal('shoeColor'), hair:hexVal('hairColor') };
  const mm = document.getElementById('bdMonth')?.value;
  const dd = document.getElementById('bdDay')?.value;
  if(mm && dd) playerBirthday = mm + '-' + dd;
  saveCurrentUser();
  localStorage.setItem('explox_hat',       playerHat);
  localStorage.setItem('explox_hair',      playerHair);
  localStorage.setItem('explox_skin',      playerColors.skin);
  localStorage.setItem('explox_shirt',     playerColors.shirt);
  localStorage.setItem('explox_pants',     playerColors.pants);
  localStorage.setItem('explox_shoes',     playerColors.shoes);
  localStorage.setItem('explox_hairColor', playerColors.hair);
  localStorage.setItem('explox_name',      playerName);
  document.getElementById('customScreen').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  document.getElementById('sipAmount').textContent = sipDollars;
  document.getElementById('eliteAmount').textContent = eliteCoins;
  startGame();
});

