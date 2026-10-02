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
  { icon:'🎒', text:'Press B to open your Bag and see all the items you have collected around the city. You can even throw them!' },
  { icon:'😈', text:'Talk to the Shady Dealer to join the underground — but watch your Wanted level rise!' },
  { icon:'🎮', text:'Play Mini Games to earn extra S.I.P. and unlock weapons that appear in your bank safe!' },
  { icon:'📅', text:'Click the season badge in the top-right to open the calendar and see holidays and your birthday.' },
  { icon:'🗺️', text:'Use the SAI Map tab to find any location and draw a path line on the ground to follow!' },
  { icon:'⌨️', text:'Fast tab shortcuts: press B for Bag, T for SAI, or M for Music — no mouse needed, even while looking around!' },
  { icon:'☰', text:'Every tab lives in the ☰ Menu in the bottom-left corner — Job, Hire, Profile, Stats, Quests, Emotes, Moves, Difficulty, Help and more.' },
  { icon:'☠️', text:'If you get knocked out you lose what you are CARRYING (your wallet, bag, weapons). Keep your S.I.P. in the City Bank or your Safe — those are never lost!' },
  { icon:'💼', text:'Online? Open ☰ Menu → HIRE to pay other real players to chop wood, collect scrap, or do a custom job for you. You can fire them any time.' },
  { icon:'💻', text:'Buy a computer, then use it at your house desk for a real Desktop — a web browser, an App Store with 100 working apps, and more.' },
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
  { label:'Church',          x:-40,  z:20,   color:'#FFD700', emoji:'⛪' },
  { label:'Library',         x:-75,  z:60,   color:'#c9a876', emoji:'📚' },
  { label:'School',          x:70,   z:60,   color:'#3388cc', emoji:'🏫' },
  { label:'Hospital',        x:-40,  z:74,   color:'#ff5566', emoji:'🏥' },
  { label:'Sports Park',     x:-10,  z:-95,  color:'#33cc66', emoji:'🏟️' },
  { label:'The Sea',         x:220,  z:90,   color:'#00aaff', emoji:'🌊' },
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
    if(activeEmote) cancelEmote(); // opening another overlay cancels any active emote
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
  //
  // Batch below (Library through Tower Defense Fight) added in one real accuracy pass, cross-
  // checked against the actual game modules — see each entry's own coordinate/mechanic for the
  // real source. Kept ahead of the older entries for the same reason as every entry above them.
  // ── Newer systems (2026-10-02 accuracy pass — "make ... sai updated"): Menu, Hire, Desktop/App
  // Store, selling, death, difficulty, emotes/moves, online vs offline, crafting. Keys are
  // deliberately multi-word where a bare word would hijack older entries (e.g. 'menu' alone would
  // swallow "diner menu", bare 'hire' would swallow "hire on" in the JOB tab entry).
  { keys:['controls','keyboard','shortcuts','how do i move','how to move','how do i play','how to play','how do i run','how do i jump','wasd','how do i look around'], reply:'⌨️ Computer: W/A/S/D move, Shift run, Space jump, mouse look (click the screen first), E interact, F attack, Q grenade, B Bag, C eat, T ask me, G Add-Ons, M music, Enter chat, Y give S.I.P. to the nearest player, P view their profile. Phone: left joystick to move, drag to look, ⬆ jump, E interact, RUN sprint. Everything else is in the ☰ Menu (bottom-left) — ❓ HELP in there replays the Welcome guide, and the Explox website has a full How to Play guide too!' },
  { keys:['tab menu','where are the tabs','where did the tabs go','where is the menu','main menu','menu button','menu tab','open the menu'], reply:'☰ The Menu button in the bottom-left corner opens a grid of EVERY tab: Bag, Job, Hire, Profile, Stats, Quests, Emotes, Moves, Records, Shop, Mini Games, Chat, SAI, Music, Add-Ons, Difficulty, Daily Events, Help and more. The old side-of-screen tabs all live in there now.' },
  { keys:['hire a player','hire players','hire someone','hire people','hire a worker','hire workers','employee','employees','worker','workers','fire someone','fire an employee','custom job','my employees','pay someone to work','how do i hire','how to hire','hiring'], reply:'💼 Open ☰ Menu → HIRE (ONLINE mode) to pay other real players to work for you! Type their exact account name, pick a task — 🪵 Chop Wood, 🔩 Kill Robots (scrap), or ✍️ Custom Job (you describe it) — then set the pay per unit and a total budget. The budget comes out of your wallet right away, so the pay is always real. They can Accept or Decline — nobody is forced. Wood/scrap they gather goes to you and they are paid on the spot; for a Custom Job they press ✅ Report Work Done and YOU judge if it was good. Not happy? 🔥 Fire them any time and your unspent budget is refunded.' },
  { keys:['job offer','job offers','work for a player','work for another player','get hired by a player','report work done'], reply:"💼 A job offer from another player shows up under ☰ Menu → HIRE → Job Offers For You — Accept or Decline, you are never forced. While you work for someone, wood you chop in Whispering Woods or robot wreckage you grind at The Grinder goes to your boss and pays you instantly; a Custom Job is paid when you press ✅ Report Work Done. 🚪 Quit Job any time in the same menu. (Regular shop and bank jobs are under ☰ Menu → JOB.)" },
  { keys:['app store','apps','install an app','install apps','download an app','desktop','my desktop','calculator'], reply:'📱 At your house desk the computer opens a real Desktop with separate windows: 🌐 SIB (a web browser), 📱 App Store, and every app you install (an icon appears on your Desktop). The App Store needs a phone or tablet (Airport Lounge Electronics kiosk), is passcode-locked, and holds 100 real working apps — calculators, converters, games, tools, a Joke Generator, and even a Shop app that buys any item for its real price!' },
  { keys:['joke','jokes','tell me a joke','funny'], reply:"😂 Install the Joke Generator from the App Store on your computer's Desktop — it pulls real jokes from a live joke database, so there are thousands to find!" },
  { keys:['search the web','web search','search for something','look something up','look up something','wikipedia','google'], reply:"🔍 In SIB (your computer's browser), type a plain question or phrase in the address bar and press Go to run a real web search — real Wikipedia results you can click through. Type an actual website address like wikipedia.org instead and SIB opens that real site." },
  { keys:['sell my car','sell a car','sell my stuff','sell items','sell an item','sell things','list an item','listing','shelf','shelves','visit a store','visit a player store','buy from a player','buy from another player','player stores','asking price'], reply:"🏪 At a player store (yours, or one you are visiting) you can sell almost anything you own — even a car! Pick the item and choose YOUR asking price; it goes on the shelf for others to buy. A fair price sells fast, an overpriced one just sits there. You can also visit another player's store and buy what is on their shelf with S.I.P. — the seller is paid even if they are offline." },
  { keys:['profile','stats','statistics','my stats','bio','total kills','playtime','play time'], reply:'👤 ☰ Menu → PROFILE shows your bio, total kills and level (you can edit your bio). 📊 STATS shows your full lifetime numbers — kills, quests, bosses, contracts, store sales, daily streak, play time, peak S.I.P. and more. Press P near another online player to see their profile.' },
  { keys:['die','dying','died','death','knocked out','lose my stuff','lose my items','lose everything','respawn','drop pile','what happens when i die'], reply:'☠️ If you get knocked out you lose everything you are CARRYING — wallet S.I.P./💎, cash, Bag items, weapons/armor, wood and scrap. It drops as a pile where you fell: walk back and press E to pick it up. NEVER lost: Bank & Safe contents, houses & land, cars, outfits/cosmetics, and anything bought with real money. Bank your S.I.P. before you go looking for trouble!' },
  { keys:['difficulty','peaceful','peaceful mode','mob difficulty','too hard','too many killers','no enemies','turn off enemies'], reply:'⚔️ ☰ Menu → DIFFICULTY sets how dangerous the world is — 10 tiers from the gentle Baby Steps all the way up to Apocalypse — and changing it affects enemies that are already out there right away. Peaceful mode turns off roaming danger completely (no Killers, Robots, Robbers or Demons).' },
  { keys:['emote','emotes','dance','dances','dancing'], reply:'🎭 ☰ Menu → EMOTES has over 100 emotes across 14 styles — dances, sits and more — and variants of the same style really do move differently. Many unlock with S.I.P.' },
  { keys:['fight move','fight moves','moves tab','my moves','equip a move','combat moves'], reply:'🥊 ☰ Menu → MOVES has 30 fight moves — 10 free and 20 you unlock with S.I.P. — and you equip 3 at a time. They change how your F swing looks and feels.' },
  { keys:['daily event','daily events','daily reward','daily rewards','daily streak','streak','event of the day'], reply:"🎁 ☰ Menu → DAILY EVENTS opens today's Event of the Day — claim your reward, and come back day after day to build a streak!" },
  { keys:['offline','offline mode','online mode','play online','play with friends','play with others','multiplayer','save my progress','does it save','is my progress saved','my account','forgot my password','create an account'], reply:'🌍 On the account screen pick 🟢 ONLINE (a shared world — chat, hiring, buying from player stores, S.I.P. gifts, and your progress is saved to your account on any device) or 🔴 OFFLINE (just you; progress is saved in that one browser only, so clearing site data erases it). Online runs on a free server that can take up to a minute to wake up — just wait for the loading bar.' },
  { keys:['pay a player','send sip','give sip','gift sip','send money','give money','give someone sip','tip a player'], reply:'💸 ONLINE only: type /pay name amount in chat (like /pay Sam 50) to send S.I.P. to someone who is online right now — or stand next to them and press Y.' },
  { keys:['hunger','hungry','bladder','toilet','bathroom','sleep','sleepy','tired','vomit','throw up'], reply:'🍔 Watch Hunger, Bladder and energy in the corner HUD. Eat from your Bag with C (one bite per press), buy a meal at the Diner (x=110, z=-25), or cook at home. Use the toilet and sleep in the bed inside your house. Eat too much too fast and you will throw up!' },
  { keys:['craft','crafting','crafting table','whispering woods','chop','chop wood','chopping','wood','trees','lumber'], reply:'🪓 Whispering Woods (x=200, z=-320) is full of choppable trees — each gives 🪵 3 wood and grows back after about 45 seconds. Use the Crafting Table there, and feed robot wreckage into The Grinder (x=300, z=268) for 🔩 scrap. Lots of shop items also have a 🔨 Craft button that costs wood, scrap and materials instead of S.I.P. — but crafting is HARD, so expect a big pile. Short on time? Hire players to gather for you (☰ Menu → HIRE)!' },
  { keys:['throw','throw an item','throw items','throwing'], reply:'🎯 Open your Bag (B) and press the 🎯 Throw button on an item or food, aim the dashed line, then click to confirm (right-click or Esc cancels; on a phone use the THROW / Cancel buttons).' },
  { keys:['trade','trading','trade items','swap items','exchange items','trade with players'], reply:"🤝 There is no direct trade window between players, but there are good ways to get stuff to each other: sell almost anything you own (even a car) at a player store for your own asking price and buy what other players have on their shelves, or send S.I.P. with /pay name amount (ONLINE mode). You can also hire players to gather for you (☰ Menu → HIRE)." },
  { keys:['exgun','rpg shooter'], reply:'🔫 EXGUN is a separate RPG shooter from the same creator — look for the "Try EXGUN" link on the Explox account screen or on the Explox website.' },
  { keys:['elite coin','elite coins','get diamonds','more diamonds','earn diamonds','free diamonds','drop diamonds','get elite coins'], reply:"💎 Elite Coins are rarer than S.I.P. — tough robots at the Scrapyard (x=300, z=250) drop them, and quests pay them too (☰ Menu → QUESTS). Spend them to level up your Robot Level. The Bank keeps its own 💎 balance, and ☰ Menu → SHOP has optional packs that cost real money (ask a parent first)." },
  { keys:['outfit','outfits','clothes','clothing','dress up','customize','customise','customization','change my look','change my appearance','skins'], reply:"👕 Make your character look like YOU: pick hair, hats, skin, shirt, pants and shoes on the Customize Your Character screen, buy full outfit sets at the Outfit Shop on Shopping Street and the boutiques in the Mall, and unlock whole matching skin bundles. Some items cost S.I.P., and your look saves with your account." },
  { keys:['library','book','bookshelf','read a book','lore'], reply:'📚 The Library is at x=-75, z=60 — walk in and pick a book off the shelf! Every book is a real, original Explox story: city origin myths, side adventures, and more, all written just for this world. New books get added over time, so check back!' },
  { keys:['church','pray','prayer','worship','blessing'], reply:"⛪ The Church is at x=-40, z=20 — a real, peaceful building you can walk into. Type what's on your heart and pray (once per real hour): sometimes you're just healed, sometimes you're granted a real reward, and sometimes you get a genuine quest to complete!" },
  { keys:['bible','bible stories','scripture'], reply:'📖 Click the Bible Stories button inside the Church to read all 66 real books of the Bible retold as original Explox stories, from Genesis all the way to Revelation!' },
  { keys:["satan's reign",'satan','demon','demons','divine clash'], reply:"😈 Sometimes the world tips into a real Satan's Reign — 4 named demons (Vraxis, Ghorlak, Skreel, Malchor) start spawning around the city, tougher than an ordinary Killer. Watch the sky above the Church for a real light-vs-shadow clash, then push the darkness back: defeat demons or pray at the Church — both count toward ending the Reign!" },
  { keys:['school','pop quiz','classroom','quiz'], reply:'🏫 Enter School at x=70, z=60 and pick "Walk in as yourself" for a real Pop Quiz! Type your real age, then answer 10 real age-matched questions (math, reading, science, social studies) — +15 S.I.P. per correct answer, once every 20 minutes. The old kid-enrollment menu is still there too, for your adopted child.' },
  { keys:['eating competition','eating contest','buffet contest','out-eat'], reply:'🏆 At any Diner buffet, challenge a real opponent to an Eating Competition! Pay a 100 S.I.P. entry, then out-eat them in 60 real seconds — win and you pocket 250 S.I.P. (+150 more on a new personal best). Lose and you still get a small consolation payout.' },
  { keys:['cab','taxi','call a cab'], reply:'🚕 Open ☰ Menu → CAB to call a real taxi to ANY location in the city, or any of the 8 countries/Space Station! Fare scales with real distance (a flat 4 S.I.P. plus more per 1000 units, +60 S.I.P. surcharge for a country run) — bring up to 3 friends along for +5 S.I.P. each.' },
  { keys:['trash safe'], reply:"🗑️ Open ☰ Menu → TRASH — it's a real shared drop box! ANYONE can put S.I.P. or items into your Trash Safe for you, no passcode needed. But only YOUR passcode can open it back up to take things out." },
  { keys:['global chat','chat with other players','talk to other players','dev talk','message the admin','message the developer'], reply:'💬 Press Enter (or open ☰ Menu → CHAT) in ONLINE mode to talk with every other player in the world in real time — there is an emoji picker too! Switch it to Dev Talk mode to send a message straight and private to the developer instead.' },
  { keys:['weather','rain','snowstorm','thunderstorm','fog','hills','terrain'], reply:'🌦️ The weather actually changes on its own — clear skies, rain, thunderstorms with real lightning, snow, fog, or breezy leaves, all shifting over real time and matching the season. Open ground like The Park, Whispering Woods, Sunset Plains, and the land around each country now has real rolling hills too!' },
  { keys:['hospital','doctor','sick','heal me'], reply:'🏥 City Hospital is at x=-40, z=74. See the Doctor for 80 S.I.P. to fully heal AND cure being sick — the one real fix for the Sickness system!' },
  { keys:['sports park','basketball','soccer','baseball','bowling','gym'], reply:'🏟️ Sports Park is at x=-10, z=-95 — shoot real hoops, take a penalty kick, swing at baseball, roll a bowling ball, or hit the gym for a real workout buff, all in one place!' },
  { keys:['sea','swim','beach','ocean'], reply:'🌊 The Sea is at x=220, z=90 — a real sandy beach with real swimmable water. Walk in to swim (you move slower, like real swimming), then press Jump to dive under or surface!' },
  { keys:['prison','jail','arrest','escape prison','wanted level'], reply:"🔒 Get arrested and you serve real time in a real Cell Block — talk to cellmates Rocco and Dusty, work out for good behavior (-10s off your sentence), or dig at the loose brick 5 times to escape (time it between guard patrols, or you're caught and it costs you +15s)!" },
  { keys:['robot war','robot war kingdoms','robot army'], reply:"🤖 Robot War (Mini Games panel) is a real 100-level campaign across 5 Kingdoms on an overworld map — command your army and take down every faction's boss, ending with The Overlord. Build up your own Castle for a real Army Cap + Defense bonus, and buy a rideable vehicle in the Garage (Scrap Racer bike, Siege Hauler tank, or Titan Frame mech) — a totally separate system from the main city's Car Dealership!" },
  { keys:['survival horde','endless waves'], reply:'🧟 Survival Horde (Mini Games panel) throws endless waves at you from every direction — pick Easy, Medium, or Hard, then choose one real upgrade (12 to pick from) after every wave you clear. See how long you can last!' },
  { keys:['tower defense','frost trap','build a turret','barricade'], reply:"🏯 Tower Defense Fight (Mini Games panel) — defend your tower across 3 lanes and 18 waves (a real boss on Wave 18)! Build Turrets or Frost Traps on the glowing pads and Barricades on the road gates, and jump into the fight yourself with a real sword." },
  { keys:['guard','siege','robber','attacker','defend the bank','bank job'], reply:"💂 Sign up as Bank Guard at x=160, z=246 (S.I.P.) or x=174, z=246 (💎). Killers attack the Bank for real during your shift — fight them off, call in 📣 Coin Bot backup (10 giant Coin Bots, 30s cooldown), and real Police officers show up too. Let the Bank's health hit 0 and the shift fails with no pay!" },
  { keys:['wall','shoot down','rooftop','snipe','bank wall'], reply:"🪜 While on Guard duty, climb the staircase on the Bank's east side (x=180, z=210) to reach the wall. Up there, press E to fire down at attackers instead of fighting in melee — press E again to climb back down once it's clear!" },
  { keys:['world event','earthquake','alien','pirate raid','crab invasion','gnome','stampede','invasion attempt'], reply:'🌍 The World Events board is at x=386, z=155. Pick from 23 shared events — everyone online sees the same one! Most (concerts, hazards, hostile factions) land at one of 8 fixed spots ringing the very edge of the city; Invasion Attempt always hits home turf at The Park (x=-10, z=-60).' },
  { keys:['wedding','marry','married','birthday party','grand opening','town event','host a concert'], reply:'🎉 The Town Events board is at x=378, z=155. Host a wedding, throw a birthday party, have a baby, open a grand opening, or throw a concert — real events with real S.I.P. rewards!' },
  { keys:['war','territory','countries to','capture the','conquer'], reply:"⚔️ The War Room is at x=250, z=-260 (ONLINE mode only). Fly to any of 9 countries and fight real soldiers + tanks to capture territory for Explox — permanently! Breach each country's wall first, then fight through to the garrison inside." },
  { keys:['quest','robot level','elite level','level up'], reply:'📜 Open ☰ Menu → QUESTS for real quests that pay Elite Coins. Spend those to level up your Robot Level — real Max HP and damage for YOU forever, and enemy robots get tougher, bigger, and worth more too (capped, so they never get out of hand)!' },
  { keys:['job tab','hire on','any job','shop job'], reply:'💼 Open ☰ Menu → JOB to hire on for ANY job in the game from one menu — no walking required! Every one of the 300+ shops in the city is a real job you can clock into. (Want to pay OTHER players to work for you instead? That is ☰ Menu → HIRE.)' },
  { keys:['earning','earnings','collect all','pending reward'], reply:'💰 Rewards land in your wallet the moment you earn them — S.I.P. and 💎 Elite Coins both show up instantly with a +amount pop-up, no collecting needed. (The old Earnings tab is gone.)' },
  { keys:['diamond deposit','shop tab','vip package','buy sip','buy diamonds'], reply:'🛍️ ☰ Menu → SHOP has OPTIONAL S.I.P./💎 packs that cost real money, up to a bundled VIP Package — you never need them, since everything can be earned by playing, and kids should always ask a parent first. The Bank also holds its own real 💎 Diamond balance — deposit or withdraw them right next to your S.I.P. balance!' },
  { keys:['scrapyard','grinder','rogue robot','wreckage','scrap metal'], reply:'🤖 The Scrapyard is at x=300, z=250 — 100 spawners scattered across the whole city send rogue robots after you! Fight them for rewards, then feed the wreckage into The Grinder (x=300, z=268) for real Scrap Metal and materials.' },
  { keys:['exploxtube','tube','video','upload','subscriber','channel','comment'], reply:"📺 ExploxTube lives inside SIB (your computer's browser) — watch videos, Like them, leave a real comment, or hit Upload to post your own and grow real subscribers!" },
  { keys:['neighbor','family','have a baby','spouse'], reply:"👋 40 named neighbors live in the Suburbs, each with a real house, car, and job. Befriend them, invite them over, marry two off at a Town Event, and they'll even have a baby together!" },
  { keys:['sunset plains','build on','my plot','own land'], reply:'🏗️ Buy your own plot at Sunset Plains (x=-400, z=150) and build real structures on it — furniture, decorations, even invite friends over to sit, paint, or hang out on your land!' },
  { keys:['arcade','cabinet','whack-a-mole','snake game','tetris','claw machine','simon says','memory match','brick breaker','quick draw'], reply:'🕹️ The Pixel Palace Arcade has 9 real cabinet games — Whack-a-Mole, Maze Chase, Memory Match, Simon Says, Snake, Brick Breaker, Quick Draw, Tetris, and a real Claw Machine!' },
  { keys:['duel','pvp','ffa','fight another player','fight arena'], reply:'⚔️ Challenge any other online player to a real 1v1 duel anywhere in the city, or head into the Fight Arena (x=250, z=-200) for free-for-all combat against everyone else there!' },
  { keys:['add-on','addon','power up','berserker','speed boost'], reply:'🧩 Press G (or open ☰ Menu → ADD ONS) for 100+ real gameplay boosts — Berserker damage, Speed Boost, Moon Jump, Bouncy Shoes, and way more!' },
  { keys:['invest','shares','stock market'], reply:'📈 Open the Bank, then click Stock Market — buy and sell real shares in 6 companies at real-time prices, the same for everyone online!' },
  { keys:['killer','dagger','hooded','stranger danger'], reply:"⚠️ Hooded Killers roam the city and will attack for real if you get close — fight back to defeat them! They show up more often the more you've defeated." },
  { keys:['bank','vault'],           reply:'🏦 The City Bank is northeast of downtown near the Suburbs (x=160, z=210). A passcode is required. Your bank earns +10,000 S.I.P. interest every 60 seconds!' },
  { keys:['house','home'],           reply:'🏠 Your house is south of the city at x=-30, z=-110. Head south down the road past the park.' },
  { keys:['weapon','sword','bat','axe','armory','armor','armour'], reply:'⚔️ The Weapon Shop is a real walk-in Armory — on Shopping Street (x=84, z=54) and in the Mall. Walk in and browse the racks of weapons and armor (higher tiers unlock as you level up). Many items have a 🔨 Craft option too. Open the bank safe as well — it holds secret mini-game weapons!' },
  { keys:['car','drive','vehicle','dealership'], reply:'🚗 The Car Dealership is east of Shopping Street at x=130, z=35. Buy cars with S.I.P. and drive them around the city! Press E near your parked car to get in, E again to exit.' },
  { keys:['computer','sib','browser','internet'], reply:'💻 The Computer Shop is at x=100, z=58 — sells S.I.C., S.I.C.+, and S.D.I.C. computers. Buy one, then use the desk in your house to open a real Desktop with 🌐 SIB (the Super Important Browser — real web search and real websites, plus Shop, News, Mail and ExploxTube) and a 📱 App Store with 100 working apps.' },
  { keys:['shop','buy'],     reply:'🛍️ Shopping Street is east of center (x=60, z=50). Coffee Shop, Toy Store, Outfit Shop and Weapon Shop are all there!' },
  { keys:['mall','directory'],       reply:'🏬 The City Mall is far east at x=80, z=-20. Past the fountain is a Shopping Wing with 200 more real shops, plus a 🗺️ Mall Directory kiosk to search all 300 shops in the game!' },
  { keys:['job','work','earn'],      reply:'💼 Work as a Shopkeeper (Shopping Street, +5 S.I.P./round) or Officer (Police Station, +10 S.I.P./round) — press E near the zone to start — or open ☰ Menu → JOB to clock into any of the 300+ shops. You can also chop wood, fight robots, run a store, or hire other players (☰ Menu → HIRE)!' },
  { keys:['police','cop','officer'], reply:'🚔 The Police Station is west at x=-70, z=10. Work there as an Officer for 10 S.I.P. per round!' },
  { keys:['restaurant','food','pizza','cook'], reply:'🍕 Restaurant Row is north at x=20, z=80. Grab ingredients, cook at the stove, deliver meals for +20 S.I.P. each!' },
  { keys:['diner','eat','hungry','meal','taste'], reply:'🍽️ The Diner is south-east at x=110, z=-25 — a sit-down restaurant with a real menu (burgers, pizza, sushi, tacos, dessert, and more)! Order a dish, then press C to eat it and see your taste reaction.' },
  { keys:['store','own store','business','property'], reply:"🏪 Your Store is east of The Diner at x=160, z=-25! Buy one of 10 store tiers (100 to 15,000 S.I.P.) — bigger ones are 2-story and come furnished. Walk in, stock up on ingredients, set your price, then open the shop — you have to stay while it's open for customers to buy. Decorate the room with furniture too! Only one store at a time — buying a new one replaces the old one." },
  { keys:['black market','underground','dealer'], reply:'🕴️ Talk to the Shady Dealer (x=34, z=3) to go bad. The Black Market is southwest at x=-80, z=-71. Your Wanted level will rise!' },
  { keys:['robo arsenal','fight robot','emp hammer','plasma cutter','rail spike'], reply:'🤖 The Robo Arsenal shop is at The Scrapyard (x=282, z=268). It sells the EMP Hammer, Plasma Cutter and Rail Spike — weak against people, but they hit robots way harder than a regular sword!' },
  { keys:['safe','combo'],           reply:'🔐 Enter the bank and click "Open Safe". First time: create a combo. The safe holds secret items and mini-game weapons!' },
  { keys:['mini game','minigame','throne','obby','parkour','geo dash','geodash','geometry dash','special forces'], reply:'🎮 Open ☰ Menu → MINI GAMES for 29 real mini-games! The big ones: Capture the Throne, Robot War, Survival Horde, Tower Defense Fight, Olympics Parkour, Obby, Rooftop Parkour, Geo Dash and Survival Life — plus classics like 2048, Minesweeper, Connect Four, Blackjack, Pong, Air Hockey, Archery, Fishing Derby, Flappy Cube and Space Invaders.' },
  { keys:['season','winter','summer','holiday','calendar'],  reply:'📅 Click the season badge (top-right) to open the calendar. Holidays and your birthday are marked!' },
  { keys:['bag','inventory','item'], reply:'🎒 Press B (or open ☰ Menu → BAG) to see all your items. Buy things from shops and they show up here — and you can throw them or eat food from it too!' },
  { keys:['money','sip','cash'],     reply:'💰 Earn S.I.P. by working jobs, cooking meals, selling things, fighting robots, running a store, or playing mini games. Bank it for interest — and remember, a knockout costs you what you are carrying, but never your Bank or Safe!' },
  { keys:['hello','hi','hey','sup'], reply:'🤖 Hello! I am SAI. Ask me about controls, locations, jobs, hiring players, the bank, your computer and apps, cars, weapons, shops, mini games, what happens when you die, or anything in Explox!' },
  { keys:['tip','advice','help'],    reply:'💡 Switch to the Tips tab for 14 game tips that will help you level up fast!' },
  { keys:['sits','transit','bus','train','subway','metro','ride','transport'], reply:'🚇 S.I.T.S. (Super Important Transit System) is at the city center (x=0, z=-40)! Walk in and pick a route. 5 lines: 🔴 Red (2 SIP), 🔵 Blue (3 SIP), 🟢 Green (2 SIP), 🟡 Yellow (4 SIP), 🟣 Purple (3 SIP). Click any stop to teleport there instantly! Fares go to your bank.' },
  { keys:['cinema','movie','film','theater','watch'], reply:'🎬 The Movie Theater is south-east at x=50, z=-85. Walk in to pick from 14 movies — buy a ticket, grab snacks, and watch! Ticket prices: 20–40 SIP depending on the film.' },
  { keys:['fast travel','teleport','warp','shortcut'], reply:'🚇 Use S.I.T.S. at the Transit Hub (center of city, x=0, z=-40) to fast-travel anywhere! Pick a line, click your stop, and you\'re there in seconds.' },
  { keys:['airport','fly','flight','plane','airline','ticket'], reply:"✈️ The City Airport is southwest at x=-200, z=-200. Walk up and press E to enter the real Airport Lounge — eat a local dish, buy a souvenir and travel electronics, THEN board! Real destinations: all 8 countries (70-100 S.I.P.) plus the Space Station (150 S.I.P.). Land and check into a real Country Hotel for 50 S.I.P.!" },
  { keys:['boss','bosses','mega-bot','storm titan','scrap king','frost colossus','sahara golem','void serpent'], reply:'⚔️ 6 bosses guard the far edges of the map — some are hundreds of units out, way past the city! Switch to the new Bosses tab (next to Map) to see each one\'s live distance and hit 🧭 Go to drop a compass beacon straight to it, no matter how far away.' },
  { keys:['map','where'],            reply:'🗺️ Switch to the Map tab! Click any location dot to draw a navigation line on the ground to follow.' },
];

const SAI_FALLBACK = '🤔 I\'m not sure about that. Try asking about: controls, locations, jobs, hiring players, bank, safe, weapons, shops, your computer, mini games, dying, or the map!';
function saiFindEntry(lq) {
  for(const entry of SAI_KB) {
    if(entry.keys.some(k => saiKeyMatches(lq, k))) return entry;
  }
  return null;
}
// User's own ask: "make it so it understands different wording and typos." bot-fuzzy.js sits in
// FRONT of the exact keyword matcher above — it fixes spelling against SAI's own keyword list,
// rewrites a few common paraphrases into the words the keys already use, and (only if nothing
// matches) picks the closest answer or offers "did you mean". A correctly-spelled question is
// passed through untouched, so everything that worked before still works the same. Kept free of
// DOM access so it can be tested directly.
let _saiFuzzy = null;
function saiAnswer(q) {
  const lq = q.toLowerCase();
  if(typeof BotFuzzy === 'undefined') { const e0 = saiFindEntry(lq); return e0 ? e0.reply : SAI_FALLBACK; }
  if(!_saiFuzzy) _saiFuzzy = BotFuzzy.build(SAI_KB.map(e => ({ keys: e.keys, text: e.reply })), SAI_KB.length);
  // Tie-breaker for spelling guesses: how specific an answer would this wording produce?
  const tester = t => { let best = 0; for(const en of SAI_KB) for(const k of en.keys) if(k.length > best && saiKeyMatches(t, k)) best = k.length; return best; };
  const p = BotFuzzy.prepare(_saiFuzzy, lq, tester);
  const e = saiFindEntry(p.text);
  if(e) return (p.typos.length ? `(Reading that as "${p.display.trim()}") ` : '') + e.reply;
  const r = BotFuzzy.retrieve(_saiFuzzy, p.text);
  if(r.confident) return 'Not 100% sure what you meant, but this should help — ' + SAI_KB[r.index].reply;
  if(r.suggestions.length) return SAI_FALLBACK + ' Did you mean: ' + r.suggestions.map(i => '"' + SAI_KB[i].keys[0] + '"').join(' or ') + '?';
  return SAI_FALLBACK;
}
function saiAsk() {
  const input = document.getElementById('saiInput');
  const q = input.value.trim(); if(!q) return;
  input.value = '';
  saiAddMsg('You: ' + q, 'user');
  const reply = saiAnswer(q);
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
