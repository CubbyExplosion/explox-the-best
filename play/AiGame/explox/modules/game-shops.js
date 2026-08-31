// ─── OUTFIT & WEAPON SHOPS ───────────────────────────────────────────────────
const OUTFITS = [
  { name:'Street Red',  cost:40,  shirt:'#e74c3c', pants:'#2c3e50', shoes:'#444444' },
  { name:'All Black',   cost:60,  shirt:'#111111', pants:'#111111', shoes:'#222222' },
  { name:'Ninja',       cost:80,  shirt:'#1a1a1a', pants:'#1a1a1a', shoes:'#111111' },
  { name:'Ocean Blue',  cost:70,  shirt:'#0088cc', pants:'#005599', shoes:'#003366' },
  { name:'Space Suit',  cost:120, shirt:'#aaccdd', pants:'#6688aa', shoes:'#445566' },
  { name:'Golden Star', cost:200, shirt:'#FFD700', pants:'#DAA520', shoes:'#b8860b' },
];
const WEAPONS = [
  { id:'bat',      name:'⚾ Baseball Bat', cost:50,  color:0x8B4513 },
  { id:'sword',    name:'⚔️ Sword',        cost:100, color:0xcccccc },
  { id:'axe',      name:'🪓 Axe',          cost:180, color:0x888888 },
  { id:'stiletto', name:'🗡️ Stiletto',     cost:0,   color:0x444444, blackMarketOnly:true },
  { id:'club',     name:'🏏 Wooden Club',  cost:0,   color:0x8B5A2B, craftOnly:true },
  { id:'metalsword', name:'🗡️ Metal Sword', cost:0, color:0xdddddd, craftOnly:true },
  { id:'battleaxe',  name:'🪓 Battle Axe',   cost:0, color:0x99aabb, craftOnly:true },
  { id:'crystalsword', name:'💎 Crystal Sword', cost:0, color:0x99eeff, craftOnly:true },
  // Robo Arsenal (The Scrapyard) — specialized anti-robot gear: weak against people, devastating
  // against ROBOT_TYPES/rogue robots (see ROBOT_BONUS_DAMAGE) so buying one is a real trade-off,
  // not a strictly-better weapon.
  { id:'emphammer',    name:'⚡ EMP Hammer',   cost:250, color:0x00ffcc, robotShopOnly:true },
  { id:'plasmacutter', name:'🔥 Plasma Cutter',cost:500, color:0xff6600, robotShopOnly:true },
  { id:'railspike',    name:'🔩 Rail Spike',   cost:900, color:0x8899ff, robotShopOnly:true },
  // 47 new regular Weapon Shop items — no blackMarketOnly/craftOnly/robotShopOnly flag, so
  // openShop()'s default branch lists all of them, bringing the shop to a real 50 total
  // (these 47 + bat/sword/axe above). See WEAPON_DAMAGE's own comment for the tier ladder.
  { id:'wood_club',  name:'🏏 Wooden Cudgel',    cost:20, color:0x8B5A2B },
  { id:'wood_staff', name:'🪄 Whittled Staff',   cost:25, color:0x8B5A2B },
  { id:'wood_spear', name:'🔱 Sharpened Branch', cost:30, color:0x8B5A2B },
  { id:'stone_club',   name:'🏏 Stone Bludgeon',    cost:65, color:0x999999 },
  { id:'stone_hammer', name:'🔨 Rockcrusher Hammer',cost:75, color:0x999999 },
  { id:'stone_mace',   name:'⭐ Boulder Mace',      cost:85, color:0x999999 },
  { id:'bronze_sword',  name:'⚔️ Bronze Shortblade', cost:130, color:0xcd7f32 },
  { id:'bronze_axe',    name:'🪓 Bronze Hatchet',    cost:145, color:0xcd7f32 },
  { id:'bronze_dagger', name:'🗡️ Bronze Dirk',       cost:160, color:0xcd7f32 },
  { id:'iron_sword',     name:'⚔️ Iron Longsword',   cost:210, color:0x8a8a99 },
  { id:'iron_doubleaxe', name:'🪓 Iron Cleavemaw',   cost:230, color:0x8a8a99 },
  { id:'iron_warhammer', name:'🔨 Iron Sledgehammer',cost:250, color:0x8a8a99 },
  { id:'steel_sword',   name:'⚔️ Steel Shortblade', cost:320, color:0xcccccc },
  { id:'steel_cleaver', name:'🔪 Steel Cleaver',    cost:345, color:0xcccccc },
  { id:'steel_spear',   name:'🔱 Steel Pike',       cost:370, color:0xcccccc },
  { id:'silver_sword',   name:'⚔️ Silver Longsword', cost:450, color:0xe0e0e8 },
  { id:'silver_trident',  name:'🔱 Silver Trident',   cost:475, color:0xe0e0e8 },
  { id:'silver_dagger',   name:'🗡️ Silver Fang',      cost:500, color:0xe0e0e8 },
  { id:'titanium_axe',      name:'🪓 Titanium Hatchet',      cost:600, color:0xb0c4de },
  { id:'titanium_warhammer',name:'🔨 Titanium Maul',         cost:635, color:0xb0c4de },
  { id:'titanium_mace',     name:'⭐ Titanium Flanged Mace', cost:670, color:0xb0c4de },
  { id:'obsidian_dagger', name:'🗡️ Obsidian Shard',   cost:760, color:0x2a1a3a },
  { id:'obsidian_scythe', name:'🌙 Obsidian Reaper',  cost:805, color:0x2a1a3a },
  { id:'obsidian_claw',   name:'🐾 Obsidian Talons',  cost:850, color:0x2a1a3a },
  { id:'frost_sword', name:'⚔️ Frostbite Blade', cost:950,  color:0x99eeff },
  { id:'frost_staff', name:'🪄 Glacier Staff',   cost:1000, color:0x99eeff },
  { id:'frost_spear', name:'🔱 Icicle Lance',    cost:1050, color:0x99eeff },
  { id:'ember_axe',      name:'🪓 Ember Hatchet',      cost:1150, color:0xff6633 },
  { id:'ember_cleaver',  name:'🔪 Molten Cleaver',     cost:1215, color:0xff6633 },
  { id:'ember_doubleaxe',name:'🪓 Inferno Cleavemaw',  cost:1280, color:0xff6633 },
  { id:'venom_dagger', name:'🗡️ Venomfang Dagger', cost:1400, color:0x55dd55 },
  { id:'venom_claw',   name:'🐾 Serpent Claws',    cost:1475, color:0x55dd55 },
  { id:'venom_scythe', name:'🌙 Toxic Reaper',     cost:1550, color:0x55dd55 },
  { id:'shadow_scythe', name:'🌙 Shadowreaper',     cost:1700, color:0x3a1a4a },
  { id:'shadow_dagger', name:'🗡️ Nightshade Blade', cost:1790, color:0x3a1a4a },
  { id:'shadow_staff',  name:'🪄 Umbral Staff',      cost:1880, color:0x3a1a4a },
  { id:'holy_sword',   name:'⚔️ Radiant Longsword', cost:2050, color:0xffe066 },
  { id:'holy_spear',   name:'🔱 Seraphim Lance',    cost:2150, color:0xffe066 },
  { id:'holy_trident', name:'🔱 Divine Trident',    cost:2250, color:0xffe066 },
  { id:'storm_warhammer', name:'🔨 Thunderstrike Maul',  cost:2450, color:0x66aaff },
  { id:'storm_mace',      name:'⭐ Tempest Mace',        cost:2575, color:0x66aaff },
  { id:'storm_trident',   name:'🔱 Stormcaller Trident', cost:2700, color:0x66aaff },
  { id:'void_scythe', name:'🌙 Voidreaper',       cost:3000, color:0x2a1040 },
  { id:'void_claw',   name:'🐾 Voidling Talons',  cost:3150, color:0x2a1040 },
  { id:'void_dagger', name:'🗡️ Voidshard Dagger', cost:3300, color:0x2a1040 },
  { id:'cosmic_sword', name:'⚔️ Starforged Blade', cost:3800, color:0xffffff },
  { id:'cosmic_staff', name:'🪄 Celestial Staff',  cost:4200, color:0xffffff },
  // Batch 2 (50 more, item ~236) — see WEAPON_DAMAGE's own comment for why this continues the
  // same ladder instead of starting a separate one.
  { id:'meteor_hammer', name:'🔨 Meteor Warhammer', cost:4600, color:0x8b4513 },
  { id:'meteor_axe',    name:'🪓 Meteor Cleaver',   cost:4800, color:0x8b4513 },
  { id:'meteor_spear',  name:'🔱 Meteor Lance',     cost:5000, color:0x8b4513 },
  { id:'solar_blade',   name:'⚔️ Solarflare Blade', cost:5300, color:0xffcc00 },
  { id:'solar_mace',    name:'⭐ Solar Mace',        cost:5500, color:0xffcc00 },
  { id:'solar_trident', name:'🔱 Sunfire Trident',  cost:5800, color:0xffcc00 },
  { id:'nebula_dagger', name:'🗡️ Nebula Fang',      cost:6100, color:0x9933ff },
  { id:'nebula_scythe', name:'🌙 Nebula Reaper',     cost:6500, color:0x9933ff },
  { id:'nebula_claw',   name:'🐾 Nebula Talons',     cost:6800, color:0x9933ff },
  { id:'quantum_staff',     name:'🪄 Quantum Staff',    cost:7200, color:0x00ffff },
  { id:'quantum_cleaver',   name:'🔪 Quantum Cleaver',  cost:7650, color:0x00ffff },
  { id:'quantum_doubleaxe', name:'🪓 Quantum Splitter', cost:8100, color:0x00ffff },
  { id:'prism_warhammer', name:'🔨 Prism Maul',  cost:8600, color:0xff66ff },
  { id:'prism_longsword', name:'⚔️ Prism Edge',  cost:9100, color:0xff66ff },
  { id:'prism_club',      name:'🏏 Prism Bludgeon',cost:9600, color:0xff66ff },
  { id:'diamond_shortsword', name:'⚔️ Diamond Shortblade', cost:10200, color:0xb9f2ff },
  { id:'diamond_axe',       name:'🪓 Diamond Hatchet',    cost:10800, color:0xb9f2ff },
  { id:'diamond_dagger',    name:'🗡️ Diamond Shard',      cost:11400, color:0xb9f2ff },
  { id:'mythic_hammer', name:'🔨 Mythic Warhammer', cost:12100, color:0xffd700 },
  { id:'mythic_mace',   name:'⭐ Mythic Mace',       cost:12750, color:0xffd700 },
  { id:'mythic_spear',  name:'🔱 Mythic Lance',      cost:13400, color:0xffd700 },
  { id:'dragon_trident', name:'🔱 Dragonfang Trident', cost:14200, color:0xcc0000 },
  { id:'dragon_scythe',  name:'🌙 Dragon Reaper',      cost:15000, color:0xcc0000 },
  { id:'dragon_claw',    name:'🐾 Dragon Talons',      cost:15700, color:0xcc0000 },
  { id:'phoenix_staff',      name:'🪄 Phoenix Staff', cost:16600, color:0xff4400 },
  { id:'phoenix_cleaver',    name:'🔪 Phoenix Cleaver',cost:17400, color:0xff4400 },
  { id:'phoenix_doubleaxe',  name:'🪓 Phoenix Wings', cost:18300, color:0xff4400 },
  { id:'abyssal_warhammer', name:'🔨 Abyssal Maul',  cost:19200, color:0x001a33 },
  { id:'abyssal_longsword', name:'⚔️ Abyssal Edge',  cost:20200, color:0x001a33 },
  { id:'abyssal_club',      name:'🏏 Abyssal Crusher',cost:21250, color:0x001a33 },
  { id:'arcane_shortsword', name:'⚔️ Arcane Blade',   cost:22400, color:0x6600cc },
  { id:'arcane_axe',        name:'🪓 Arcane Cleaver', cost:23500, color:0x6600cc },
  { id:'arcane_dagger',     name:'🗡️ Arcane Fang',    cost:24700, color:0x6600cc },
  { id:'runic_hammer', name:'🔨 Runic Warhammer', cost:26000, color:0x445566 },
  { id:'runic_mace',   name:'⭐ Runic Mace',       cost:27400, color:0x445566 },
  { id:'runic_spear',  name:'🔱 Runic Lance',      cost:28700, color:0x445566 },
  { id:'ancient_trident', name:'🔱 Ancient Trident', cost:30200, color:0x554422 },
  { id:'ancient_scythe',  name:'🌙 Ancient Reaper',  cost:31700, color:0x554422 },
  { id:'ancient_claw',    name:'🐾 Ancient Talons',  cost:33200, color:0x554422 },
  { id:'divine_staff',     name:'🪄 Divine Staff', cost:34850, color:0xffffee },
  { id:'divine_cleaver',   name:'🔪 Divine Cleaver',cost:36550, color:0xffffee },
  { id:'divine_doubleaxe', name:'🪓 Divine Wings', cost:38250, color:0xffffee },
  { id:'eternal_warhammer', name:'🔨 Eternal Maul',   cost:40100, color:0x220044 },
  { id:'eternal_longsword', name:'⚔️ Eternal Edge',   cost:42100, color:0x220044 },
  { id:'eternal_club',      name:'🏏 Eternal Crusher',cost:44100, color:0x220044 },
  { id:'omega_shortsword', name:'⚔️ Omega Blade',   cost:46200, color:0x000000 },
  { id:'omega_axe',        name:'🪓 Omega Cleaver', cost:48500, color:0x000000 },
  { id:'omega_dagger',     name:'🗡️ Omega Fang',    cost:50900, color:0x000000 },
  { id:'genesis_blade', name:'⚔️ Genesis Blade', cost:53500, color:0xffffff },
  { id:'genesis_orb',   name:'🪄 Genesis Orb',   cost:56100, color:0xffffff },
];
// archetype/color(main)/accent/glow/scale per new weapon — see buildWeaponArchetype() near
// updateWeaponMesh() for what each archetype actually looks like.
const WEAPON_VISUALS = {
  wood_club: {archetype:'club', color:0x8B5A2B, accent:0x6b4423, glow:null, scale:1.0},
  wood_staff:{archetype:'staff',color:0x8B5A2B, accent:0x6b4423, glow:null, scale:1.0},
  wood_spear:{archetype:'spear',color:0x8B5A2B, accent:0x6b4423, glow:null, scale:1.0},
  stone_club:  {archetype:'club',  color:0x999999, accent:0x666666, glow:null, scale:1.0},
  stone_hammer:{archetype:'hammer',color:0x999999, accent:0x666666, glow:null, scale:1.0},
  stone_mace:  {archetype:'mace',  color:0x999999, accent:0x666666, glow:null, scale:1.0},
  bronze_sword: {archetype:'shortsword',color:0xcd7f32, accent:0x8b5a2b, glow:null, scale:1.0},
  bronze_axe:   {archetype:'axe',       color:0xcd7f32, accent:0x8b5a2b, glow:null, scale:1.0},
  bronze_dagger:{archetype:'dagger',    color:0xcd7f32, accent:0x8b5a2b, glow:null, scale:1.0},
  iron_sword:     {archetype:'longsword',color:0x8a8a99, accent:0x666677, glow:null, scale:1.05},
  iron_doubleaxe: {archetype:'doubleaxe',color:0x8a8a99, accent:0x666677, glow:null, scale:1.05},
  iron_warhammer: {archetype:'warhammer',color:0x8a8a99, accent:0x666677, glow:null, scale:1.05},
  steel_sword:  {archetype:'shortsword',color:0xcccccc, accent:0x999999, glow:null, scale:1.05},
  steel_cleaver:{archetype:'cleaver',   color:0xcccccc, accent:0x999999, glow:null, scale:1.05},
  steel_spear:  {archetype:'spear',     color:0xcccccc, accent:0x999999, glow:null, scale:1.05},
  silver_sword:  {archetype:'longsword',color:0xe0e0e8, accent:0xaaaaaa, glow:null, scale:1.05},
  silver_trident:{archetype:'trident',  color:0xe0e0e8, accent:0xaaaaaa, glow:null, scale:1.05},
  silver_dagger: {archetype:'dagger',   color:0xe0e0e8, accent:0xaaaaaa, glow:null, scale:1.05},
  titanium_axe:      {archetype:'axe',      color:0xb0c4de, accent:0x778899, glow:null, scale:1.1},
  titanium_warhammer:{archetype:'warhammer',color:0xb0c4de, accent:0x778899, glow:null, scale:1.1},
  titanium_mace:     {archetype:'mace',     color:0xb0c4de, accent:0x778899, glow:null, scale:1.1},
  obsidian_dagger:{archetype:'dagger',color:0x2a1a3a, accent:0x1a0d22, glow:0x330044, scale:1.1},
  obsidian_scythe:{archetype:'scythe',color:0x2a1a3a, accent:0x1a0d22, glow:0x330044, scale:1.1},
  obsidian_claw:  {archetype:'claw',  color:0x2a1a3a, accent:0x1a0d22, glow:0x330044, scale:1.1},
  frost_sword:{archetype:'longsword',color:0x99eeff, accent:0x3388cc, glow:0x2266aa, scale:1.1},
  frost_staff:{archetype:'staff',    color:0x99eeff, accent:0x3388cc, glow:0x2266aa, scale:1.1},
  frost_spear:{archetype:'spear',    color:0x99eeff, accent:0x3388cc, glow:0x2266aa, scale:1.1},
  ember_axe:      {archetype:'axe',      color:0xff6633, accent:0xcc3300, glow:0xaa2200, scale:1.15},
  ember_cleaver:  {archetype:'cleaver',  color:0xff6633, accent:0xcc3300, glow:0xaa2200, scale:1.15},
  ember_doubleaxe:{archetype:'doubleaxe',color:0xff6633, accent:0xcc3300, glow:0xaa2200, scale:1.15},
  venom_dagger:{archetype:'dagger',color:0x55dd55, accent:0x226622, glow:0x115511, scale:1.15},
  venom_claw:  {archetype:'claw',  color:0x55dd55, accent:0x226622, glow:0x115511, scale:1.15},
  venom_scythe:{archetype:'scythe',color:0x55dd55, accent:0x226622, glow:0x115511, scale:1.15},
  shadow_scythe:{archetype:'scythe',color:0x3a1a4a, accent:0x1a0d22, glow:0x440066, scale:1.15},
  shadow_dagger:{archetype:'dagger',color:0x3a1a4a, accent:0x1a0d22, glow:0x440066, scale:1.15},
  shadow_staff: {archetype:'staff', color:0x3a1a4a, accent:0x1a0d22, glow:0x440066, scale:1.15},
  holy_sword:  {archetype:'longsword',color:0xffe066, accent:0xffaa00, glow:0xcc8800, scale:1.2},
  holy_spear:  {archetype:'spear',    color:0xffe066, accent:0xffaa00, glow:0xcc8800, scale:1.2},
  holy_trident:{archetype:'trident',  color:0xffe066, accent:0xffaa00, glow:0xcc8800, scale:1.2},
  storm_warhammer:{archetype:'warhammer',color:0x66aaff, accent:0x2255cc, glow:0x1144aa, scale:1.2},
  storm_mace:     {archetype:'mace',     color:0x66aaff, accent:0x2255cc, glow:0x1144aa, scale:1.2},
  storm_trident:  {archetype:'trident',  color:0x66aaff, accent:0x2255cc, glow:0x1144aa, scale:1.2},
  void_scythe:{archetype:'scythe',color:0x2a1040, accent:0x0d0518, glow:0x6600cc, scale:1.25},
  void_claw:  {archetype:'claw',  color:0x2a1040, accent:0x0d0518, glow:0x6600cc, scale:1.25},
  void_dagger:{archetype:'dagger',color:0x2a1040, accent:0x0d0518, glow:0x6600cc, scale:1.25},
  cosmic_sword:{archetype:'longsword',color:0xffffff, accent:0xaa88ff, glow:0x8844ff, scale:1.3},
  cosmic_staff:{archetype:'staff',    color:0xffffff, accent:0xaa88ff, glow:0x8844ff, scale:1.3},
  // Batch 2 — scale keeps climbing past cosmic's 1.3 the exact same way it climbed to get there,
  // and every tier keeps a real glow (established from Obsidian onward above), not just the last few.
  meteor_hammer:{archetype:'hammer',color:0x8b4513, accent:0xff4500, glow:0xff6600, scale:1.32},
  meteor_axe:   {archetype:'axe',   color:0x8b4513, accent:0xff4500, glow:0xff6600, scale:1.32},
  meteor_spear: {archetype:'spear', color:0x8b4513, accent:0xff4500, glow:0xff6600, scale:1.32},
  solar_blade:  {archetype:'shortsword',color:0xffcc00, accent:0xff8800, glow:0xffee00, scale:1.34},
  solar_mace:   {archetype:'mace',      color:0xffcc00, accent:0xff8800, glow:0xffee00, scale:1.34},
  solar_trident:{archetype:'trident',   color:0xffcc00, accent:0xff8800, glow:0xffee00, scale:1.34},
  nebula_dagger:{archetype:'dagger',color:0x9933ff, accent:0x3366ff, glow:0xaa66ff, scale:1.36},
  nebula_scythe:{archetype:'scythe',color:0x9933ff, accent:0x3366ff, glow:0xaa66ff, scale:1.36},
  nebula_claw:  {archetype:'claw',  color:0x9933ff, accent:0x3366ff, glow:0xaa66ff, scale:1.36},
  quantum_staff:    {archetype:'staff',    color:0x00ffff, accent:0x0088ff, glow:0x00ffff, scale:1.38},
  quantum_cleaver:  {archetype:'cleaver',  color:0x00ffff, accent:0x0088ff, glow:0x00ffff, scale:1.38},
  quantum_doubleaxe:{archetype:'doubleaxe',color:0x00ffff, accent:0x0088ff, glow:0x00ffff, scale:1.38},
  prism_warhammer:{archetype:'warhammer',color:0xff66ff, accent:0x66ffff, glow:0xff99ff, scale:1.40},
  prism_longsword:{archetype:'longsword',color:0xff66ff, accent:0x66ffff, glow:0xff99ff, scale:1.40},
  prism_club:     {archetype:'club',     color:0xff66ff, accent:0x66ffff, glow:0xff99ff, scale:1.40},
  diamond_shortsword:{archetype:'shortsword',color:0xb9f2ff, accent:0xffffff, glow:0xaaffff, scale:1.42},
  diamond_axe:       {archetype:'axe',       color:0xb9f2ff, accent:0xffffff, glow:0xaaffff, scale:1.42},
  diamond_dagger:    {archetype:'dagger',    color:0xb9f2ff, accent:0xffffff, glow:0xaaffff, scale:1.42},
  mythic_hammer:{archetype:'hammer',color:0xffd700, accent:0x8b008b, glow:0xffee88, scale:1.44},
  mythic_mace:  {archetype:'mace',  color:0xffd700, accent:0x8b008b, glow:0xffee88, scale:1.44},
  mythic_spear: {archetype:'spear', color:0xffd700, accent:0x8b008b, glow:0xffee88, scale:1.44},
  dragon_trident:{archetype:'trident',color:0xcc0000, accent:0xff9900, glow:0xff3300, scale:1.46},
  dragon_scythe: {archetype:'scythe', color:0xcc0000, accent:0xff9900, glow:0xff3300, scale:1.46},
  dragon_claw:   {archetype:'claw',   color:0xcc0000, accent:0xff9900, glow:0xff3300, scale:1.46},
  phoenix_staff:    {archetype:'staff',    color:0xff4400, accent:0xffee00, glow:0xff8800, scale:1.48},
  phoenix_cleaver:  {archetype:'cleaver',  color:0xff4400, accent:0xffee00, glow:0xff8800, scale:1.48},
  phoenix_doubleaxe:{archetype:'doubleaxe',color:0xff4400, accent:0xffee00, glow:0xff8800, scale:1.48},
  abyssal_warhammer:{archetype:'warhammer',color:0x001a33, accent:0x00ffcc, glow:0x00ffcc, scale:1.50},
  abyssal_longsword:{archetype:'longsword',color:0x001a33, accent:0x00ffcc, glow:0x00ffcc, scale:1.50},
  abyssal_club:     {archetype:'club',     color:0x001a33, accent:0x00ffcc, glow:0x00ffcc, scale:1.50},
  arcane_shortsword:{archetype:'shortsword',color:0x6600cc, accent:0x00ffff, glow:0x9933ff, scale:1.52},
  arcane_axe:       {archetype:'axe',       color:0x6600cc, accent:0x00ffff, glow:0x9933ff, scale:1.52},
  arcane_dagger:    {archetype:'dagger',    color:0x6600cc, accent:0x00ffff, glow:0x9933ff, scale:1.52},
  runic_hammer:{archetype:'hammer',color:0x445566, accent:0x00ffaa, glow:0x00ffaa, scale:1.54},
  runic_mace:  {archetype:'mace',  color:0x445566, accent:0x00ffaa, glow:0x00ffaa, scale:1.54},
  runic_spear: {archetype:'spear', color:0x445566, accent:0x00ffaa, glow:0x00ffaa, scale:1.54},
  ancient_trident:{archetype:'trident',color:0x554422, accent:0xffd700, glow:0xffd700, scale:1.56},
  ancient_scythe: {archetype:'scythe', color:0x554422, accent:0xffd700, glow:0xffd700, scale:1.56},
  ancient_claw:   {archetype:'claw',   color:0x554422, accent:0xffd700, glow:0xffd700, scale:1.56},
  divine_staff:    {archetype:'staff',    color:0xffffee, accent:0xffd700, glow:0xffffaa, scale:1.58},
  divine_cleaver:  {archetype:'cleaver',  color:0xffffee, accent:0xffd700, glow:0xffffaa, scale:1.58},
  divine_doubleaxe:{archetype:'doubleaxe',color:0xffffee, accent:0xffd700, glow:0xffffaa, scale:1.58},
  eternal_warhammer:{archetype:'warhammer',color:0x220044, accent:0xff00ff, glow:0xff00ff, scale:1.60},
  eternal_longsword:{archetype:'longsword',color:0x220044, accent:0xff00ff, glow:0xff00ff, scale:1.60},
  eternal_club:     {archetype:'club',     color:0x220044, accent:0xff00ff, glow:0xff00ff, scale:1.60},
  omega_shortsword:{archetype:'shortsword',color:0x000000, accent:0xff0000, glow:0xff0000, scale:1.62},
  omega_axe:       {archetype:'axe',       color:0x000000, accent:0xff0000, glow:0xff0000, scale:1.62},
  omega_dagger:    {archetype:'dagger',    color:0x000000, accent:0xff0000, glow:0xff0000, scale:1.62},
  genesis_blade:{archetype:'longsword',color:0xffffff, accent:0xffffff, glow:0xffffff, scale:1.65},
  genesis_orb:  {archetype:'staff',    color:0xffffff, accent:0xffffff, glow:0xffffff, scale:1.65},
};
// ─── WEAPON BATCH GENERATOR — batches 1-2 above (100 weapons) are hand-authored; the user's own
// follow-up ask ("lets make 5 more baches (250)") makes hand-typing every single object clearly
// unsustainable toward the stated 5,000-weapon goal, so from here on a batch is just a compact
// one-line-per-tier table fed through this generator instead. Damage/scale interpolate smoothly
// (exponential curve, so early items in a batch don't jump too hard) from a start value picked to
// continue right where the previous batch's last weapon left off, to an end value for that batch's
// capstone tier — fully deterministic, not random, so the same id always produces the same weapon
// for every player. Archetype selection uses one shared cursor across every generateWeaponBatch()
// call so shapes keep rotating instead of resetting per batch, and since each tier's 3 (or 2, for
// a capstone) items are always CONSECUTIVE draws from a 15-archetype cycle, no tier can ever
// accidentally get the same shape twice.
const WEAPON_ARCHETYPE_CYCLE = ['shortsword','longsword','dagger','axe','doubleaxe','hammer','warhammer','mace','spear','trident','scythe','club','staff','claw','cleaver'];
const WEAPON_ARCHETYPE_EMOJI = { shortsword:'⚔️',longsword:'⚔️',dagger:'🗡️',axe:'🪓',doubleaxe:'🪓',hammer:'🔨',warhammer:'🔨',mace:'⭐',spear:'🔱',trident:'🔱',scythe:'🌙',club:'🏏',staff:'🪄',claw:'🐾',cleaver:'🔪' };
const WEAPON_ARCHETYPE_LABEL = { shortsword:'Blade',longsword:'Edge',dagger:'Fang',axe:'Cleaver',doubleaxe:'Splitter',hammer:'Warhammer',warhammer:'Maul',mace:'Mace',spear:'Lance',trident:'Trident',scythe:'Reaper',club:'Crusher',staff:'Staff',claw:'Talons',cleaver:'Cleaver' };
let _weaponArchCursor = 0;
function generateWeaponBatch(tiers, startDmg, endDmg, startScale, endScale) {
  const totalItems = tiers.reduce((n,t) => n + (t.capstone ? 2 : 3), 0);
  let itemIdx = 0;
  tiers.forEach(t => {
    const count = t.capstone ? 2 : 3;
    // Handles both single-word tiers ('wood' -> 'Wood') and the generator's compound ones
    // ('ironclad_warden' -> 'Ironclad Warden') the same way.
    // Also spaces out nextTierNames()'s numeric-suffix fallback ('warden2' -> 'Warden 2') so it
    // reads as a real name, not a typo.
    const label = t.tier.split('_').map(w => (w.charAt(0).toUpperCase() + w.slice(1)).replace(/(\D)(\d+)$/, '$1 $2')).join(' ');
    for (let i=0; i<count; i++) {
      const frac = totalItems > 1 ? itemIdx/(totalItems-1) : 0;
      const dmg = Math.round(startDmg * Math.pow(endDmg/startDmg, frac));
      const scale = +(startScale + (endScale-startScale)*frac).toFixed(2);
      const cost = Math.round(dmg*17/5)*5;
      const archetype = WEAPON_ARCHETYPE_CYCLE[_weaponArchCursor % WEAPON_ARCHETYPE_CYCLE.length]; _weaponArchCursor++;
      const id = `${t.tier}_${archetype}`;
      WEAPON_DAMAGE[id] = dmg;
      WEAPON_VISUALS[id] = { archetype, color:t.color, accent:t.accent, glow:t.glow, scale };
      WEAPONS.push({ id, name:`${WEAPON_ARCHETYPE_EMOJI[archetype]} ${label} ${WEAPON_ARCHETYPE_LABEL[archetype]}`, cost, color:t.color });
      itemIdx++;
    }
  });
}
function t(tier,color,accent,glow,capstone){ return {tier,color,accent,glow,capstone:!!capstone}; }
// User's own follow-up: "next 10 batches" (170 more tier names + colors needed just for that one
// ask) is well past where hand-typing every single one stays sane toward the stated 5,000-weapon
// goal. Combining two short word lists guarantees every tier name is unique BY CONSTRUCTION (every
// prefix+root pair is distinct) instead of needing to manually track ~300 words already used —
// and colors come from rotating hue by a golden-angle-style step (same trick this file already
// uses for star scatter/shop placement) so they stay visually spread out instead of clustering,
// with zero hand-picked hex values.
// Expanded for the "10" more batches right after the first 10 — 60x20 = 1200 combos comfortably
// covers the rest of the road to 5,000. The dedup Set above means growing these lists again later
// is always safe, never a silent collision risk.
const TIER_NAME_PREFIXES = ['ironclad','stormforged','doombringer','starforged','voidtouched','soulbound','ragefueled','frostbitten','sunblessed','nightborn','bloodforged','skyrending','earthshaking','stormcalling','flamewrought','iceforged','thunderstruck','shadowbound','direforged','warforged',
  'astralforged','chaosbound','orderbound','timeforged','spaceforged','voidforged','starbound','moonforged','sunforged','stormbound','fireforged','frostforged','thunderbound','lightningforged','shadowforged','lightbound','darkforged','dawnbound','duskforged','twilightbound',
  'emberforged','glacierbound','infernobound','tempestforged','radiantbound','umbralforged','spectralbound','etherealforged','primalbound','savageforged','wildbound','feralforged','huntersbound','predatorforged','apexbound','zenithforged','pinnaclebound','summitforged','crestbound','peakforged'];
const TIER_NAME_ROOTS = ['warden','harbinger','sentinel','reaper','warlord','oracle','vanguard','marauder','paragon',
  'executioner','conqueror','dominator','obliterator','annihilator','vanquisher','destroyer','ravager','plunderer','invader','colossus'];
let _tierNameCursor = 0;
// Real dedup, not just trusted math — resizing either word list later (which the very next "10
// more batches" ask already needed) shifts what floor(cursor/rootsLen) and cursor%rootsLen land
// on, so a name generated under the OLD list sizes could otherwise coincidentally reappear under
// the NEW ones. Skipping anything already handed out makes that impossible regardless of how the
// lists change, instead of requiring hand-verified modular-arithmetic proofs every time.
const _usedTierNames = new Set();
function nextTierNames(count) {
  const names = [];
  while (names.length < count) {
    const p = TIER_NAME_PREFIXES[Math.floor(_tierNameCursor / TIER_NAME_ROOTS.length) % TIER_NAME_PREFIXES.length];
    const r = TIER_NAME_ROOTS[_tierNameCursor % TIER_NAME_ROOTS.length];
    _tierNameCursor++;        // these still group sensibly by prefix in the shop, not one header per tier
    // User's own "continue on the last 3000" needs far more tiers than the 1200 prefix×root combos
    // hold — rather than expanding the word lists a third time, once every combo's used up this
    // just appends a counter (ironclad_warden, then ironclad_warden2, _warden3, ...), so the SAME
    // finite word lists generate names forever, no matter how many more batches ever get asked for.
    let name = p + '_' + r, suffix = 2;
    while (_usedTierNames.has(name)) { name = p + '_' + r + suffix; suffix++; }
    _usedTierNames.add(name);
    names.push(name);
  }
  return names;
}
function tierColorFromIndex(i) {
  const hue = (i * 47) % 360; // 47 shares no small factor with 360, so hues spread out instead of repeating a short cycle
  const c1 = new THREE.Color(); c1.setHSL(hue/360, 0.65, 0.5);
  const c2 = new THREE.Color(); c2.setHSL(((hue+40)%360)/360, 0.6, 0.32);
  const c3 = new THREE.Color(); c3.setHSL(hue/360, 0.9, 0.68);
  return { color:c1.getHex(), accent:c2.getHex(), glow:c3.getHex() };
}
// Convenience wrapper around generateWeaponBatch() that pulls its own tier names/colors from the
// generators above instead of a hand-written tier list — this is what every batch from 21 onward
// actually calls.
function generateAutoWeaponBatch(count, startDmg, endDmg, startScale, endScale) {
  const startIdx = _tierNameCursor;
  const names = nextTierNames(count);
  const tiers = names.map((name, i) => {
    const { color, accent, glow } = tierColorFromIndex(startIdx + i);
    return t(name, color, accent, glow, i === count - 1);
  });
  generateWeaponBatch(tiers, startDmg, endDmg, startScale, endScale);
}
// Batch 3 — mystic/elemental
generateWeaponBatch([
  t('infernal',0xdd2200,0x220000,0xff4400), t('glacial',0x88ddff,0x224466,0xaaeeff), t('volcanic',0x662200,0xff6600,0xff8800),
  t('tempest',0x4466aa,0xaaccff,0x88bbff), t('radiant',0xffee88,0xffaa00,0xffffaa), t('umbral',0x1a0a2a,0x6600aa,0x9933dd),
  t('spectral',0xaaffee,0x44aa99,0xccffee), t('ethereal',0xddeeff,0x88aacc,0xeeffff), t('primal',0x557722,0x88aa33,0xaadd44),
  t('feral',0x774422,0xaa6633,0xffaa66), t('vicious',0x991122,0xff3344,0xff5566), t('wrathful',0xaa0000,0xff0000,0xff2222),
  t('furious',0xff4400,0xffaa00,0xffcc44), t('relentless',0x445566,0x88aabb,0xaaccdd), t('unstoppable',0x222222,0xff0000,0xff0000),
  t('apex',0xffd700,0x000000,0xffee00), t('zenith',0xffffff,0xffd700,0xffffff,true),
], 3450, 8000, 1.67, 1.85);
// Batch 4 — cosmic/astral
generateWeaponBatch([
  t('astral',0x6644cc,0xaaccff,0x8866ff), t('lunar',0xccccdd,0x8888aa,0xddddff), t('stellar',0xffffcc,0xffee88,0xffffaa),
  t('galactic',0x330066,0x9933cc,0xaa66ff), t('quasar',0x00ffff,0xff00ff,0x88ffff), t('pulsar',0xffffff,0x00aaff,0xaaeeff),
  t('supernova',0xff8800,0xffff00,0xffcc00), t('vortex',0x220044,0x8800ff,0xaa44ff), t('eclipse',0x000000,0xff6600,0xff8800),
  t('comet',0x88ccff,0xffffff,0xaaeeff), t('meteorite',0x554433,0xff6622,0xff8844), t('asteroid',0x776655,0x998877,0xaa9988),
  t('orbital',0x3366cc,0x66aaff,0x99ccff), t('infinite',0xffffff,0x000000,0xcccccc), t('boundless',0x00ccff,0xffffff,0x66eeff),
  t('transcendent',0xffee00,0xffffff,0xffff88), t('paramount',0xffd700,0xffffff,0xffee00,true),
], 8200, 18000, 1.87, 2.05);
// Batch 5 — gems/minerals
generateWeaponBatch([
  t('crimson',0xdc143c,0x8b0000,0xff4466), t('azure',0x007fff,0x0055aa,0x66bbff), t('emerald',0x50c878,0x228844,0x88ffaa),
  t('sapphire',0x0f52ba,0x0a3a7a,0x66aaff), t('ruby',0xe0115f,0x9a0a3f,0xff4488), t('amber',0xffbf00,0xcc8800,0xffdd66),
  t('jade',0x00a86b,0x006644,0x66ffcc), t('onyx',0x0a0a0a,0x333333,0x666666), t('platinum',0xe5e4e2,0xaaaaaa,0xffffff),
  t('mercury',0xc0c0c0,0x888888,0xddddee), t('tungsten',0x707070,0x444444,0x999999), t('quartz',0xffffff,0xccccee,0xeeeeff),
  t('granite',0x676767,0x444444,0x888888), t('marble',0xf0f0f0,0xcccccc,0xffffff), t('alabaster',0xfaf0e6,0xddccbb,0xffffee),
  t('ivory',0xfffff0,0xeeeecc,0xffffff), t('pearl',0xfdeef4,0xffccdd,0xffffff,true),
], 18500, 38000, 2.07, 2.25);
// Batch 6 — weather disasters
generateWeaponBatch([
  t('thunder',0x333366,0xffff00,0xffff44), t('lightning',0xffff44,0xffffff,0xffff88), t('hurricane',0x336699,0x88bbdd,0xaaccff),
  t('cyclone',0x556677,0x99aabb,0xbbccdd), t('tsunami',0x0066aa,0x00aadd,0x66ddff), t('avalanche',0xddeeff,0xaaccee,0xffffff),
  t('blizzard',0xeeffff,0xaaddff,0xffffff), t('wildfire',0xff3300,0xff9900,0xffcc00), t('earthquake',0x664422,0x996633,0xcc9966),
  t('tidal',0x0088aa,0x00ccdd,0x66eeff), t('monsoon',0x224466,0x4488aa,0x66aacc), t('typhoon',0x336688,0x66aacc,0x99ccee),
  t('whirlwind',0x88aabb,0xccddee,0xffffff), t('maelstrom',0x220044,0x6600aa,0x9933dd), t('cataclysm',0x440000,0xff0000,0xff4444),
  t('apocalypse',0x1a0000,0xff0000,0xff0000), t('armageddon',0x000000,0xff0000,0xff2200,true),
], 39000, 75000, 2.27, 2.45);
// Batch 7 — legendary/monstrous
generateWeaponBatch([
  t('draconic',0x882200,0xffaa00,0xff6600), t('seraphic',0xffffee,0xffdd88,0xffffaa), t('angelic',0xffeecc,0xffffff,0xffffee),
  t('demonic',0x330000,0xff0000,0xff2222), t('titanic',0x445566,0x778899,0xaabbcc), t('colossal',0x554433,0x998866,0xccaa88),
  t('gigantic',0x336633,0x559955,0x77cc77), t('monstrous',0x442222,0x884444,0xcc6666), t('leviathan',0x004466,0x0088aa,0x66ccee),
  t('behemoth',0x554422,0x998855,0xccbb88), t('juggernaut',0x333333,0x666666,0x999999), t('vanquisher',0xaa0000,0xffaa00,0xffcc44),
  t('conqueror',0x665500,0xffd700,0xffee88), t('dominator',0x220022,0xaa00aa,0xff44ff), t('obliterator',0x111111,0xff0000,0xff0000),
  t('annihilator',0x000000,0xffffff,0xffffff), t('ultimate',0xffffff,0xffd700,0xffffff,true),
], 77000, 140000, 2.47, 2.65);
// Batch 8 — reality/god-tier
generateWeaponBatch([
  t('sovereign',0x4b0082,0xffd700,0xdaa520), t('imperial',0x800020,0xffd700,0xffcc00), t('absolute',0xffffff,0x000000,0xffffff),
  t('primordial',0x1a3300,0x66aa33,0x99ff66), t('elemental',0xff6600,0x0099ff,0xffcc00), t('universal',0x000033,0xffffff,0xaaccff),
  t('immortal',0xeeeeee,0xffd700,0xffffff), t('invincible',0x333333,0xff0000,0xff3333), t('unbreakable',0x555555,0x999999,0xcccccc),
  t('indestructible',0x222222,0x00ff00,0x66ff66), t('supreme',0xffd700,0x8b008b,0xffee88), t('exalted',0xffffcc,0xffaa00,0xffffee),
  t('hallowed',0xffffff,0xffee88,0xffffcc), t('sanctified',0xaaddff,0xffffff,0xccffff), t('forsaken',0x1a0000,0x660000,0x990000),
  t('forbidden',0x220033,0x9900cc,0xcc00ff), t('godly',0xffffff,0xffd700,0xffffff,true),
], 145000, 280000, 2.67, 2.85);
// Batch 9 — mythical creatures
generateWeaponBatch([
  t('phantom',0x2a2a4a,0x6666aa,0x9999ff), t('wraith',0x1a1a2a,0x4444aa,0x8888ff), t('banshee',0xccccff,0x8888cc,0xffffff),
  t('revenant',0x330011,0x991144,0xff2266), t('specter',0xaaccff,0x6699cc,0xddeeff), t('poltergeist',0x442266,0x9944cc,0xcc88ff),
  t('wendigo',0x1a3311,0x557733,0x88aa55), t('kraken',0x002233,0x006699,0x33aadd), t('hydra',0x1a3300,0x338822,0x66cc44),
  t('chimera',0xaa5522,0xffaa22,0xffcc66), t('griffin',0xccaa66,0x8b5a2b,0xffdd99), t('basilisk',0x224411,0x66aa22,0x99ff44),
  t('cerberus',0x220000,0x880000,0xff2200), t('minotaur',0x553322,0x885533,0xbb9977), t('sphinx',0xddbb77,0xaa8844,0xffeecc),
  t('colossus',0x666677,0x9999aa,0xccccdd), t('olympian',0xffffff,0xffd700,0xffffcc,true),
], 290000, 550000, 2.87, 3.05);
// Batch 10 — sci-fi tech
generateWeaponBatch([
  t('plasma',0xff00ff,0x00ffff,0xff66ff), t('ion',0x00ffcc,0x0088ff,0x66ffee), t('laser',0xff0000,0xffffff,0xff6666),
  t('photon',0xffffff,0xffff00,0xffffaa), t('neutron',0x888888,0xffffff,0xcccccc), t('positron',0x00ff00,0xffffff,0x88ff88),
  t('antimatter',0x000000,0xff00ff,0xff00ff), t('hyperspace',0x6600ff,0x00ffff,0xaa88ff), t('warp',0x0044ff,0x00ffff,0x66aaff),
  t('graviton',0x220044,0x8800ff,0xaa66ff), t('tachyon',0x00ffff,0xffffff,0xaaffff), t('fusion',0xff6600,0xffff00,0xffaa44),
  t('fission',0x00ff00,0xffff00,0xaaff44), t('cryo',0x88eeff,0xffffff,0xccffff), t('nano',0x00ffaa,0x000000,0x66ffcc),
  t('cyber',0x00ffff,0xff00ff,0x88ffff), t('digital',0x00ff00,0x000000,0x00ff88,true),
], 570000, 1050000, 3.07, 3.25);
// Batch 11 — royalty
generateWeaponBatch([
  t('royal',0x4b0082,0xffd700,0x8866cc), t('majestic',0x800080,0xffd700,0xcc88ff), t('noble',0x000080,0xc0c0c0,0x6688cc),
  t('regal',0x8b008b,0xffd700,0xdd88ff), t('princely',0x9370db,0xffd700,0xccaaff), t('ducal',0x483d8b,0xc0c0c0,0x8888cc),
  t('baronial',0x556b2f,0xffd700,0x99cc66), t('chivalrous',0xc0c0c0,0x4169e1,0xeeeeff), t('valiant',0xdc143c,0xffd700,0xff6688),
  t('heroic',0xffd700,0xff0000,0xffee88), t('gallant',0x4169e1,0xffffff,0x88aaff), t('honorable',0xdaa520,0xffffff,0xffdd88),
  t('virtuous',0xffffff,0xffd700,0xffffcc), t('righteous',0xffffee,0xffd700,0xffffaa), t('pious',0xf0e68c,0xffffff,0xffffcc),
  t('sacred',0xffffff,0xffd700,0xffffee), t('blessed',0xffffff,0xffd700,0xffffff,true),
], 1090000, 2000000, 3.27, 3.45);
// Batch 12 — time/reality
generateWeaponBatch([
  t('chrono',0x336699,0xffcc00,0x66aaff), t('temporal',0x6699cc,0xffffff,0xaaccff), t('dimensional',0x9933cc,0x00ffff,0xcc66ff),
  t('spatial',0x000033,0xffffff,0x6688ff), t('paradox',0x000000,0xffffff,0x888888), t('causality',0x444488,0xffcc00,0x8888ff),
  t('entropy',0x330000,0x888888,0xff4444), t('chaos',0x660000,0xff6600,0xff2200), t('harmony',0x88ccff,0xffffff,0xccffff),
  t('discord',0x660066,0xff00ff,0xcc00cc), t('equilibrium',0xcccccc,0x333333,0xffffff), t('flux',0x00ffcc,0xff00cc,0x88ffee),
  t('continuum',0x3366aa,0x66ccff,0x99ddff), t('reality',0xffffff,0x000000,0xdddddd), t('illusion',0xaa88ff,0xffffff,0xccaaff),
  t('mirage',0xffccaa,0x88ccff,0xffddcc), t('phantasm',0xeeeeff,0x8888ff,0xffffff,true),
], 2080000, 3800000, 3.47, 3.65);
// Batch 13 — warrior titles
generateWeaponBatch([
  t('berserker',0x880000,0xff0000,0xff4444), t('gladiator',0xaa8844,0xffd700,0xffee88), t('warlord',0x440000,0x888888,0xff2222),
  t('marauder',0x553322,0x886644,0xccaa88), t('raider',0x333333,0x996633,0xaa8866), t('plunderer',0x664422,0xffd700,0xffee88),
  t('pillager',0x442211,0x996644,0xccaa88), t('ravager',0x660000,0xff3300,0xff6644), t('destroyer',0x222222,0xff0000,0xff0000),
  t('slayer',0x000000,0xcc0000,0xff2222), t('executioner',0x1a0000,0x880000,0xcc0000), t('headhunter',0x442200,0xaa6600,0xffaa44),
  t('bloodhunter',0x660011,0xff0033,0xff4466), t('warmonger',0x443300,0xff6600,0xffaa44), t('crusader',0xcccccc,0xffd700,0xffffff),
  t('paladin',0xffffff,0xffd700,0xffffee), t('champion',0xffd700,0xffffff,0xffee88,true),
], 3950000, 7200000, 3.67, 3.85);
// Batch 14 — predators
generateWeaponBatch([
  t('locust',0x88aa44,0x556622,0xaadd66), t('scorpion',0x442211,0x996633,0xffaa44), t('tarantula',0x1a0a05,0x442211,0x663311),
  t('wasp',0xffcc00,0x000000,0xffee44), t('hornet',0xff9900,0x1a0a00,0xffcc44), t('viper',0x225522,0x88aa22,0x66ff44),
  t('cobra',0x333322,0xaaaa44,0xccdd66), t('python',0x445533,0x778855,0xaacc77), t('panther',0x0a0a0a,0x222222,0x444444),
  t('tiger',0xff8800,0x000000,0xffaa22), t('lion',0xd4a017,0x8b5a1a,0xffcc55), t('wolf',0x666666,0x333333,0x999999),
  t('bear',0x553322,0x332211,0x886644), t('eagle',0x8b4513,0xffffff,0xcc8844), t('falcon',0x4a4a4a,0x8899aa,0xaabbcc),
  t('hawk',0x6b4423,0xaa8855,0xccaa77), t('raptor',0x223311,0xff0000,0x66ff22,true),
], 7500000, 14000000, 3.87, 4.05);
// Batch 15 — aesthetic light
generateWeaponBatch([
  t('crystalline',0xccffff,0xffffff,0xeeffff), t('prismatic',0xff66cc,0x66ccff,0xffaaee), t('luminous',0xffffaa,0xffffff,0xffffcc),
  t('iridescent',0xaaffcc,0xffaacc,0xccffee), t('opalescent',0xeeeeff,0xffccee,0xffffff), t('translucent',0xddffff,0xffffff,0xeeffff),
  t('refractive',0x88ccff,0xffffff,0xccffff), t('chromatic',0xff0000,0x00ff00,0xffff00), t('vibrant',0xff00aa,0x00ffaa,0xff66cc),
  t('resplendent',0xffd700,0xffffff,0xffee88), t('gleaming',0xffffff,0xcccccc,0xffffff), t('shimmering',0xaaeeff,0xffffff,0xccffff),
  t('glistening',0x88ffee,0xffffff,0xaaffee), t('dazzling',0xffffff,0xffff00,0xffffaa), t('brilliant',0xffffff,0x00ffff,0xaaffff),
  t('magnificent',0xffd700,0x8b008b,0xffee88), t('sublime',0xffffff,0xffd700,0xffffff,true),
], 14500000, 27000000, 4.07, 4.25);
// Batch 16 — geography
generateWeaponBatch([
  t('northern',0x88ccff,0xffffff,0xaaeeff), t('southern',0xffaa44,0xff6600,0xffcc88), t('eastern',0xff6699,0xffcc00,0xffaacc),
  t('western',0xcc8844,0x996633,0xffcc99), t('arctic',0xeeffff,0xaaddff,0xffffff), t('tropical',0x00cc88,0xffcc00,0x66ffcc),
  t('desert',0xddaa55,0xcc8833,0xffddaa), t('oceanic',0x0066aa,0x00aadd,0x66ccff), t('mountain',0x778899,0xccccdd,0xaabbcc),
  t('forest',0x225522,0x66aa33,0x88cc55), t('canyon',0xaa6644,0x884422,0xccaa88), t('tundra',0xccddcc,0x88aa88,0xeeffee),
  t('savanna',0xccaa55,0x998833,0xffddaa), t('glacier',0xaaddff,0xffffff,0xccffff), t('volcano',0xff3300,0x220000,0xff6622),
  t('geyser',0x66ccff,0xffffff,0xaaeeff), t('oasis',0x00ddaa,0x0088cc,0x66ffdd,true),
], 28000000, 52000000, 4.27, 4.45);
// Batch 17 — military rank
generateWeaponBatch([
  t('private',0x556655,0x334433,0x778877), t('corporal',0x556677,0x334455,0x7799aa), t('sergeant',0x664422,0x442211,0x996633),
  t('lieutenant',0x445588,0x2233aa,0x6688cc), t('captain',0x223366,0x4466aa,0x6699cc), t('major',0x8b0000,0xffd700,0xcc4444),
  t('colonel',0x556b2f,0xaa8844,0x99cc66), t('general',0x000080,0xffd700,0x6688ff), t('admiral',0x00008b,0xc0c0c0,0x6666cc),
  t('commander',0x2f4f4f,0xffd700,0x668877), t('marshal',0x800000,0xffd700,0xcc6666), t('commodore',0x191970,0xc0c0c0,0x6677aa),
  t('brigadier',0x4a3c2a,0xaa8844,0x887755), t('tactician',0x333344,0x8899aa,0x6677aa), t('strategist',0x442244,0x9944cc,0xaa66cc),
  t('overlord',0x220022,0xff00ff,0xaa00aa), t('emperor',0xffd700,0x800020,0xffee88,true),
], 54000000, 100000000, 4.47, 4.65);
// Batch 18 — transcendence
generateWeaponBatch([
  t('pinnacle',0xffffff,0xffd700,0xffffee), t('culmination',0xffd700,0xffffff,0xffee88), t('epitome',0xffffee,0xffd700,0xffffff),
  t('quintessence',0xeeffff,0xaaffff,0xffffff), t('perfection',0xffffff,0xffffff,0xffffff), t('transcendence',0xaaeeff,0xffffff,0xccffff),
  t('apotheosis',0xffee88,0xffffff,0xffffcc), t('ascension',0x88ccff,0xffffff,0xaaeeff), t('enlightenment',0xffffcc,0xffd700,0xffffee),
  t('awakening',0xffaa66,0xffffcc,0xffcc88), t('revelation',0xffffff,0xffee88,0xffffcc), t('epiphany',0xccffff,0xffffff,0xeeffff),
  t('nirvana',0xffffee,0xffd700,0xffffff), t('utopia',0x88ffcc,0xffffff,0xaaffdd), t('paradise',0x00ddaa,0xffee88,0x66ffcc),
  t('elysium',0xaaffee,0xffffff,0xccffee), t('valhalla',0xffd700,0xff0000,0xffee88,true),
], 104000000, 195000000, 4.67, 4.85);
// Batch 19 — space exploration
generateWeaponBatch([
  t('satellite',0x778899,0xffffff,0xaabbcc), t('telescope',0x445566,0xffd700,0x6688aa), t('observatory',0x223344,0x88aaff,0x4466aa),
  t('spacecraft',0xcccccc,0xff6600,0xffffff), t('rover',0xaa8855,0xff4400,0xccaa77), t('probe',0x8899aa,0x00ffff,0xaaccdd),
  t('launchpad',0x555555,0xff6600,0xff9944), t('thruster',0x0088ff,0xffaa00,0x66ccff), t('propulsion',0xff4400,0x00ffff,0xff8866),
  t('navigation',0x0044aa,0x00ffcc,0x66aaff), t('trajectory',0x00ccff,0xffffff,0x88eeff), t('docking',0x999999,0xffff00,0xcccccc),
  t('module',0xaaaaaa,0x0088ff,0xcccccc), t('capsule',0xffffff,0xff0000,0xffcccc), t('mission',0x334455,0xffd700,0x6688aa),
  t('expedition',0x556644,0xffaa00,0x88aa66), t('voyage',0xffffff,0x0088ff,0xaaccff,true),
], 203000000, 380000000, 4.87, 5.05);
// Batch 20 — craftsmanship
generateWeaponBatch([
  t('forged',0xff6600,0x442200,0xff9944), t('tempered',0x4488cc,0x224466,0x66aadd), t('hammered',0x888888,0x555555,0xaaaaaa),
  t('sharpened',0xdddddd,0x999999,0xffffff), t('polished',0xeeeeee,0xcccccc,0xffffff), t('engraved',0xaa8844,0x664422,0xccaa66),
  t('enchanted',0x8844ff,0x00ffff,0xaa66ff), t('inscribed',0xccaa66,0x8b5a2b,0xffdd99), t('gilded',0xffd700,0xaa8800,0xffee88),
  t('embossed',0xc0a060,0x8b6914,0xffdd88), t('filigreed',0xe5c158,0xffd700,0xffee99), t('wrought',0x333333,0x666666,0x888888),
  t('honed',0xeeeeee,0x888888,0xffffff), t('whetted',0xcccccc,0x666666,0xeeeeee), t('chiseled',0x999999,0x555555,0xbbbbbb),
  t('sculpted',0xaaaaaa,0x777777,0xcccccc), t('masterwork',0xffd700,0xffffff,0xffee88,true),
], 395000000, 740000000, 5.07, 5.25);
// Batches 21-30 — user's own ask: "next 10 batches". Generated (names/colors) rather than
// hand-typed from here on, see generateAutoWeaponBatch()'s own comment above for why.
generateAutoWeaponBatch(17, 770000000, 1450000000, 5.27, 5.45);
generateAutoWeaponBatch(17, 1500000000, 2800000000, 5.47, 5.65);
generateAutoWeaponBatch(17, 2900000000, 5500000000, 5.67, 5.85);
generateAutoWeaponBatch(17, 5700000000, 10500000000, 5.87, 6.05);
generateAutoWeaponBatch(17, 11000000000, 20000000000, 6.07, 6.25);
generateAutoWeaponBatch(17, 21000000000, 39000000000, 6.27, 6.45);
generateAutoWeaponBatch(17, 40000000000, 76000000000, 6.47, 6.65);
generateAutoWeaponBatch(17, 78000000000, 148000000000, 6.67, 6.85);
generateAutoWeaponBatch(17, 150000000000, 285000000000, 6.87, 7.05);
generateAutoWeaponBatch(17, 290000000000, 550000000000, 7.07, 7.25);
// Batches 31-40 — user's own ask: "10" (more, right after the previous 10).
generateAutoWeaponBatch(17, 570000000000, 1050000000000, 7.27, 7.45);
generateAutoWeaponBatch(17, 1100000000000, 2000000000000, 7.47, 7.65);
generateAutoWeaponBatch(17, 2050000000000, 3900000000000, 7.67, 7.85);
generateAutoWeaponBatch(17, 4000000000000, 7400000000000, 7.87, 8.05);
generateAutoWeaponBatch(17, 7600000000000, 14000000000000, 8.07, 8.25);
generateAutoWeaponBatch(17, 14500000000000, 27000000000000, 8.27, 8.45);
generateAutoWeaponBatch(17, 27500000000000, 52000000000000, 8.47, 8.65);
generateAutoWeaponBatch(17, 53000000000000, 99000000000000, 8.67, 8.85);
generateAutoWeaponBatch(17, 100000000000000, 190000000000000, 8.87, 9.05);
generateAutoWeaponBatch(17, 195000000000000, 370000000000000, 9.07, 9.25);
// Batches 41-100 — user's own "coun tin ue on the last 3000", finishing the road to the stated
// 5,000-weapon goal (2008 so far + 3000 = 5008). A real loop instead of 60 more hand-typed lines:
// safe to do now because buildWeaponLevels() (see its own comment) immediately re-derives every
// weapon's REAL damage/level from relative ranking the first time anything asks for one — so the
// exact raw magnitude generated here is thrown away the moment that runs. All that matters is each
// new batch ranks above the last, which the same ×1.9-per-batch growth already guarantees.
{
  let batchDmg = 400000000000000, batchScale = 9.27;
  for (let i = 0; i < 60; i++) {
    const nextDmg = Math.round(batchDmg * 1.9);
    const nextScale = Math.min(12, batchScale + 0.18);
    generateAutoWeaponBatch(17, batchDmg, nextDmg, batchScale, nextScale);
    batchDmg = nextDmg + 1000;
    batchScale = nextScale;
  }
}
// Real damage reduction, not a cosmetic — applied for real in damagePlayer().
const ARMOR = [
  { id:'leather', name:'🥋 Leather Armor', cost:80,  reduction:0.15, color:0x8B5A2B },
  { id:'iron',    name:'🛡️ Iron Armor',    cost:250, reduction:0.30, color:0x999999 },
  { id:'gold',    name:'👑 Golden Armor',  cost:600, reduction:0.45, color:0xFFD700 },
  { id:'scrap',   name:'🔩 Scrap Armor',   cost:0,   reduction:0.35, color:0x667788, craftOnly:true },
  { id:'titanium',name:'🦾 Titanium Armor',cost:0,   reduction:0.50, color:0xcfd8e0, craftOnly:true },
];
// User's own follow-up: "add armor using the same batch system" — reuses the exact same tier-name
// generator (and its dedup Set, so it can never collide with a weapon tier id) and hue-rotation
// colors the weapon batches use, scaled to ~4% as many pieces as weapons. reduction is deliberately
// capped well short of 1.0 (would mean literally unkillable) — smoothly interpolated up from just
// above Titanium's 0.50 instead.
function generateArmorBatch(count, startReduction, endReduction, startCost, endCost) {
  const startIdx = _tierNameCursor;
  const names = nextTierNames(count);
  names.forEach((tierId, i) => {
    const frac = count > 1 ? i / (count - 1) : 0;
    const reduction = +(startReduction + (endReduction - startReduction) * frac).toFixed(3);
    const cost = Math.round(startCost * Math.pow(endCost / startCost, frac));
    const { color } = tierColorFromIndex(startIdx + i);
    const label = tierId.split('_').map(w => (w.charAt(0).toUpperCase() + w.slice(1)).replace(/(\D)(\d+)$/, '$1 $2')).join(' ');
    ARMOR.push({ id: 'armor_' + tierId, name: `🛡️ ${label} Armor`, cost, reduction, color });
  });
}
generateArmorBatch(80, 0.52, 0.90, 700, 250000);

// ─── SHOP PREVIEW PANEL ──────────────────────────────────────────────────────
// A small isolated 3D scene (its own camera+renderer, separate from the main game scene) showing
// what a weapon/armor/outfit/paint item would look like before buying it. Built via
// buildPreviewAvatar() so trying something on never touches the real playerGroup, never gets
// saved, and — important for a live multiplayer game — never reaches syncPresence(), which
// broadcasts playerColors to every other online player once a second. Purely local, fully
// reversible, closes back to your real look the moment the shop closes.
let shopPreviewScene = null, shopPreviewCamera = null, shopPreviewRenderer = null;
let shopPreviewGroup = null, shopPreviewRAF = null;
function initShopPreview() {
  const canvas = document.getElementById('shopPreviewCanvas');
  if(!canvas || shopPreviewRenderer) return;
  shopPreviewScene = new THREE.Scene();
  shopPreviewCamera = new THREE.PerspectiveCamera(40, canvas.width/canvas.height, 0.1, 50);
  shopPreviewCamera.position.set(0, 2.3, 5.2);
  shopPreviewCamera.lookAt(0, 2.0, 0);
  shopPreviewRenderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  shopPreviewRenderer.setSize(canvas.width, canvas.height, false);
  shopPreviewScene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dl = new THREE.DirectionalLight(0xffffff, 0.7);
  dl.position.set(2, 4, 3);
  shopPreviewScene.add(dl);
}
function renderShopPreview(overrides, label) {
  initShopPreview();
  if(!shopPreviewRenderer) return; // canvas missing (stale cached page) — preview just no-ops
  if(shopPreviewGroup) shopPreviewScene.remove(shopPreviewGroup);
  shopPreviewGroup = buildPreviewAvatar(overrides || {});
  shopPreviewScene.add(shopPreviewGroup);
  const labelEl = document.getElementById('shopPreviewLabel');
  if(labelEl) labelEl.textContent = label ? `👁 Previewing: ${label}` : '👁 Your current look';
  const resetBtn = document.getElementById('shopPreviewResetBtn');
  if(resetBtn) resetBtn.style.display = label ? 'inline-block' : 'none';
}
function startShopPreviewLoop() {
  stopShopPreviewLoop();
  renderShopPreview(null);
  const tick = () => {
    if(shopPreviewGroup) shopPreviewGroup.rotation.y += 0.012;
    if(shopPreviewRenderer) shopPreviewRenderer.render(shopPreviewScene, shopPreviewCamera);
    shopPreviewRAF = requestAnimationFrame(tick);
  };
  shopPreviewRAF = requestAnimationFrame(tick);
}
function stopShopPreviewLoop() {
  if(shopPreviewRAF) { cancelAnimationFrame(shopPreviewRAF); shopPreviewRAF = null; }
}
function openShop(type) {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  startShopPreviewLoop();
  document.getElementById('shopOverlay').style.display = 'flex';
  document.getElementById('shopTitle').textContent = type==='outfits' ? '👗 Outfit Shop' : type==='armor' ? '🛡️ Armor Shop' : type==='paint' ? '🎨 Body Paint' : type==='robotweapons' ? '🤖 Robo Arsenal' : '⚔️ Weapon Shop';
  const items = document.getElementById('shopItems');
  items.innerHTML = '';
  if(type==='outfits') {
    OUTFITS.forEach((o,i) => {
      const d = document.createElement('div'); d.className='shopItem';
      const safeName = o.name.replace(/'/g, "\\'");
      d.innerHTML=`<div class="siName">${o.name}</div>
        <div class="siCost">💰 ${o.cost} S.I.P.</div>
        <div class="siSwatch" style="display:flex;gap:4px;margin:4px 0">
          <div style="width:18px;height:18px;background:${o.shirt};border-radius:3px"></div>
          <div style="width:18px;height:18px;background:${o.pants};border-radius:3px"></div>
          <div style="width:18px;height:18px;background:${o.shoes};border-radius:3px"></div>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="shopBtn" onclick="renderShopPreview({shirt:'${o.shirt}',pants:'${o.pants}',shoes:'${o.shoes}'},'${safeName}')" style="background:#2a4a5a;">👁 Preview</button>
          <button class="shopBtn" onclick="buyOutfit(${i})">Buy</button>
        </div>`;
      items.appendChild(d);
    });
  } else if(type==='armor') {
    ARMOR.filter(a => !a.craftOnly).forEach((a) => {
      const realIdx = ARMOR.indexOf(a);
      const owned = ownedArmor.includes(a.id);
      const equipped = playerArmor === a.id;
      const d = document.createElement('div'); d.className='shopItem';
      const safeName = a.name.replace(/'/g, "\\'");
      d.innerHTML=`<div class="siName">${a.name}</div>
        <div class="siCost">${owned ? (equipped?'✅ Equipped':'✔ Owned') : '💰 '+a.cost+' S.I.P.'} — blocks ${Math.round(a.reduction*100)}% damage</div>
        <div style="display:flex;gap:6px;">
          <button class="shopBtn" onclick="renderShopPreview({armor:'${a.id}'},'${safeName}')" style="background:#2a4a5a;">👁 Preview</button>
          <button class="shopBtn" onclick="buyArmor(${realIdx})" ${equipped?'disabled':''}>${owned?(equipped?'Equipped':'Equip'):'Buy'}</button>
        </div>`;
      items.appendChild(d);
    });
    const unequip = document.createElement('div'); unequip.className='shopItem';
    unequip.innerHTML = `<div class="siName">🚫 No Armor</div>
      <div style="display:flex;gap:6px;">
        <button class="shopBtn" onclick="renderShopPreview({armor:'none'},'No Armor')" style="background:#2a4a5a;">👁 Preview</button>
        <button class="shopBtn" onclick="equipArmor('none')" ${playerArmor==='none'?'disabled':''}>${playerArmor==='none'?'Equipped':'Unequip'}</button>
      </div>`;
    items.appendChild(unequip);
  } else if(type==='paint') {
    BODY_PAINTS.forEach((p,i) => {
      const current = playerColors.skin.toLowerCase() === p.color.toLowerCase();
      const d = document.createElement('div'); d.className='shopItem';
      const safeName = p.name.replace(/'/g, "\\'");
      d.innerHTML=`<div class="siName">${p.name}</div>
        <div class="siSwatch" style="width:28px;height:18px;background:${p.color};border-radius:3px;margin:4px 0;border:1px solid #666;"></div>
        <div class="siCost">${current ? '✅ Current' : (p.cost ? '💰 '+p.cost+' S.I.P.' : 'Free')}</div>
        <div style="display:flex;gap:6px;">
          <button class="shopBtn" onclick="renderShopPreview({skin:'${p.color}'},'${safeName}')" style="background:#2a4a5a;">👁 Preview</button>
          <button class="shopBtn" onclick="buyBodyPaint(${i})" ${current?'disabled':''}>${current?'Applied':'Paint'}</button>
        </div>`;
      items.appendChild(d);
    });
  } else if(type==='robotweapons') {
    WEAPONS.filter(w => w.robotShopOnly).forEach((w) => {
      const realIdx = WEAPONS.indexOf(w);
      const owned = ownedWeapons.includes(w.id);
      const equipped = playerWeapon === w.id;
      const need = weaponRequiredLevel(w.id);
      const locked = need > eliteLevel;
      const d = document.createElement('div'); d.className='shopItem';
      const safeName = w.name.replace(/'/g, "\\'");
      d.innerHTML=`<div class="siName">${w.name}</div>
        <div class="siCost">${owned ? (equipped?'✅ Equipped':'✔ Owned') : '💰 '+w.cost+' S.I.P.'} — ${WEAPON_DAMAGE[w.id]} dmg to people, 🤖 ${ROBOT_BONUS_DAMAGE[w.id]} dmg to robots${need>0?` — 🔒 Lv.${need}`:''}</div>
        <div style="display:flex;gap:6px;">
          <button class="shopBtn" onclick="renderShopPreview({weapon:'${w.id}'},'${safeName}')" style="background:#2a4a5a;">👁 Preview</button>
          <button class="shopBtn" onclick="buyWeapon(${realIdx})" ${(equipped||locked)?'disabled':''}>${locked?`Requires Lv.${need}`:(owned?(equipped?'Equipped':'Equip'):'Buy')}</button>
        </div>`;
      items.appendChild(d);
    });
  } else {
    // Grouped by tier (user's own ask: "make the weapons under the category") — a header row
    // per material tier, derived straight from each weapon's own id prefix (e.g. 'wood_club' ->
    // 'Wood') so a future batch of 50 gets its own header automatically, no list to maintain.
    let lastCategory = null;
    WEAPONS.filter(w => !w.blackMarketOnly && !w.craftOnly && !w.robotShopOnly).forEach((w) => {
      const realIdx = WEAPONS.indexOf(w);
      const category = weaponCategory(w.id);
      if (category !== lastCategory) {
        lastCategory = category;
        const header = document.createElement('div');
        header.style.cssText = 'color:#FFD700;font-size:11px;font-weight:bold;letter-spacing:1px;margin-top:10px;border-top:1px solid #FFD70033;padding-top:6px;';
        header.textContent = category.toUpperCase();
        items.appendChild(header);
      }
      const owned = ownedWeapons.includes(w.id);
      const equipped = playerWeapon === w.id;
      const need = weaponRequiredLevel(w.id);
      const locked = need > eliteLevel;
      const d = document.createElement('div'); d.className='shopItem';
      const safeName = w.name.replace(/'/g, "\\'");
      d.innerHTML=`<div class="siName">${w.name}</div>
        <div class="siCost">${owned ? (equipped?'✅ Equipped':'✔ Owned') : '💰 '+w.cost+' S.I.P.'}${need>0?` — 🔒 Requires Lv.${need}`:''}</div>
        <div style="display:flex;gap:6px;">
          <button class="shopBtn" onclick="renderShopPreview({weapon:'${w.id}'},'${safeName}')" style="background:#2a4a5a;">👁 Preview</button>
          <button class="shopBtn" onclick="buyWeapon(${realIdx})" ${(equipped||locked)?'disabled':''}>${locked?`Requires Lv.${need}`:(owned?(equipped?'Equipped':'Equip'):'Buy')}</button>
        </div>`;
      items.appendChild(d);
    });
  }
}
function closeShop() { document.getElementById('shopOverlay').style.display='none'; stopShopPreviewLoop(); }
function buyArmor(i) {
  const a = ARMOR[i];
  if(ownedArmor.includes(a.id)) { equipArmor(a.id); openShop('armor'); return; }
  if(sipDollars < a.cost) { showNotif(`❌ Need ${a.cost} S.I.P.`); return; }
  spendSip(a.cost); updateSIP();
  ownedArmor.push(a.id);
  equipArmor(a.id);
  showNotif(`✅ Got ${a.name}!`);
  openShop('armor');
}
function equipArmor(id) {
  playerArmor = id;
  updateArmorMesh();
  saveCurrentUser();
}
// Pure mesh builder, extracted from updateArmorMesh() — same reuse-for-preview reason as
// buildWeaponVisual() above.
function buildArmorVisual(armorId) {
  if(!armorId || armorId==='none') return null;
  const def = ARMOR.find(a=>a.id===armorId);
  if(!def) return null;
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.62,0.55,0.42), new THREE.MeshLambertMaterial({color:def.color}));
  chest.position.set(0,1.35,0.03);
  return chest;
}
function updateArmorMesh() {
  if(!playerGroup) return;
  if(player.armorMesh) { playerGroup.remove(player.armorMesh); player.armorMesh=null; }
  const chest = buildArmorVisual(playerArmor);
  if(!chest) return;
  playerGroup.add(chest);
  player.armorMesh = chest;
}

// ── Body Paint — real skin tones/colors, recolors the actual live character mesh ──
const BODY_PAINTS = [
  { name:'Classic Tan',  cost:0,   color:'#f5c89a' },
  { name:'Fair',         cost:0,   color:'#ffe0bd' },
  { name:'Deep Brown',   cost:0,   color:'#8d5524' },
  { name:'Olive',        cost:0,   color:'#c68642' },
  { name:'Ghost White',  cost:50,  color:'#f0f0f5' },
  { name:'Zombie Green', cost:80,  color:'#7cb342' },
  { name:'Vampire Pale', cost:80,  color:'#d9c7c7' },
  { name:'Ocean Blue',   cost:100, color:'#4a90d9' },
  { name:'Alien Purple', cost:100, color:'#9b59b6' },
  { name:'Robot Silver', cost:120, color:'#b0b8c1' },
  { name:'Lava Red',     cost:120, color:'#e63946' },
  { name:'Golden',       cost:200, color:'#FFD700' },
];
function buyBodyPaint(i) {
  const p = BODY_PAINTS[i];
  if(sipDollars < p.cost) { showNotif(`❌ Need ${p.cost} S.I.P.`); return; }
  spendSip(p.cost); updateSIP();
  repaintSkin(p.color);
  sfx.buy();
  showNotif(`🎨 Painted ${p.name}!`);
  openShop('paint');
}
function repaintSkin(hexColor) {
  playerColors.skin = hexColor;
  document.getElementById('skinColor').value = hexColor;
  const c = c3(hexColor);
  if(player.skinMeshes) player.skinMeshes.forEach(m => m.material.color.setHex(c));
  saveCurrentUser();
}

// ─── ADD ONS — a growing collection of fun toggles/buttons + the Buddy companion ──
// Standalone HUD tab (like SAI/Music/Bag), not a shop-overlay tab — always one click away.
function toggleAddOnsPanel() {
  const panel = document.getElementById('addOnsPanel');
  if(panel.style.display === 'none') {
    if(document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    renderAddOnsPanel();
    panel.style.display = 'block';
    document.getElementById('addOnsTab').style.display = 'none';
  } else { closeAddOnsPanel(); }
}
function closeAddOnsPanel() {
  document.getElementById('addOnsPanel').style.display = 'none';
  document.getElementById('addOnsTab').style.display = 'block';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderAddOnsPanel() {
  const items = document.getElementById('addOnsPanelItems');
  items.innerHTML = '';
  document.getElementById('addOnsSubtitle').textContent = `${ADD_ONS.length} OF 100+ FUN ADD-ONS — MORE COMING`;

  // ── Buddy section — the original permanent companion, now add-on #1 ──
  const buddyHeader = document.createElement('div');
  buddyHeader.style.cssText = 'color:#ff9944;font-size:11px;font-weight:bold;letter-spacing:1px;margin-top:4px;';
  buddyHeader.textContent = '🐾 BUDDY';
  items.appendChild(buddyHeader);
  if(!buddyOwned) {
    const intro = document.createElement('div'); intro.className='shopItem';
    intro.innerHTML = `<div class="siName">🐾 Adopt a Buddy</div>
      <div style="color:#aaa;font-size:11px;margin:4px 0;">A companion that follows you everywhere and is yours forever — never sold, lost, or taken away. Design its colors any time after you adopt.</div>`;
    items.appendChild(intro);
    BUDDY_SPECIES.forEach((s,i) => {
      const d = document.createElement('div'); d.className='shopItem';
      d.innerHTML=`<div class="siName">${s.emoji} ${s.name}</div>
        <div style="color:#999;font-size:11px;margin:2px 0 4px;">${s.desc}</div>
        <div class="siCost">💰 ${s.cost} S.I.P.</div>
        <button class="shopBtn" onclick="adoptBuddy(${i})" ${sipDollars<s.cost?'disabled':''}>Adopt</button>`;
      items.appendChild(d);
    });
  } else {
    const spec = BUDDY_SPECIES.find(s=>s.id===buddySpecies);
    const info = document.createElement('div'); info.className='shopItem';
    info.innerHTML = `<div class="siName">${spec?spec.emoji:'🐾'} ${buddyName}</div>
      <div style="color:#aaa;font-size:11px;margin-bottom:8px;">Yours forever — repaint it any time.</div>
      <input id="buddyNameInput" maxlength="16" value="${buddyName}" style="width:100%;padding:6px;border-radius:6px;border:1px solid #555;background:#0a0a1a;color:#fff;font-size:12px;box-sizing:border-box;margin-bottom:8px;">
      <button class="shopBtn" onclick="renameBuddy()" style="width:100%;margin-bottom:10px;">✏️ Rename</button>
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:10px;">
        <label style="text-align:center;font-size:10px;color:#ccc;">Body<br><input id="buddyBodyColor" type="color" value="${buddyColors.body}" style="width:38px;height:30px;border:none;background:none;cursor:pointer;"></label>
        <label style="text-align:center;font-size:10px;color:#ccc;">Accent<br><input id="buddyAccentColor" type="color" value="${buddyColors.accent}" style="width:38px;height:30px;border:none;background:none;cursor:pointer;"></label>
        <label style="text-align:center;font-size:10px;color:#ccc;">Eyes<br><input id="buddyEyeColor" type="color" value="${buddyColors.eye}" style="width:38px;height:30px;border:none;background:none;cursor:pointer;"></label>
      </div>
      <button class="shopBtn" onclick="repaintBuddy()" style="width:100%;">🎨 Repaint Buddy</button>`;
    items.appendChild(info);
  }

  // ── Family section — your real relatives (Mom & Dad, always family, no befriending needed —
  // walk up to them in the city), your own marriage status, and (once married) a child who
  // visibly grows up over real play time instead of staying one fixed size forever. Having a
  // baby used to be a standalone "adopt anytime for S.I.P." button here; now it's gated behind
  // actually getting married first, so a real family is something the player builds in order,
  // not an isolated toggle. ──
  const familyHeader = document.createElement('div');
  familyHeader.style.cssText = 'color:#7fc8ff;font-size:11px;font-weight:bold;letter-spacing:1px;margin-top:10px;';
  familyHeader.textContent = '👨‍👩‍👧 FAMILY';
  items.appendChild(familyHeader);

  const relInfo = document.createElement('div'); relInfo.className='shopItem';
  relInfo.innerHTML = `<div style="color:#aaa;font-size:11px;">❤️ Mom &amp; Dad live right by your house — walk up and press E to say hi, ask for allowance, invite them over, or hire them at your store.</div>`;
  items.appendChild(relInfo);

  const spouseName = getSpouse(playerName);
  const marriageInfo = document.createElement('div'); marriageInfo.className='shopItem';
  marriageInfo.innerHTML = spouseName
    ? `<div class="siName">💍 Married to ${spouseName}</div>`
    : `<div style="color:#aaa;font-size:11px;">💍 Not married yet — befriend a Suburbs neighbor, then propose from their profile.</div>`;
  items.appendChild(marriageInfo);

  if(!familyKidAdopted) {
    const intro = document.createElement('div'); intro.className='shopItem';
    if (!spouseName) {
      intro.innerHTML = `<div class="siName">👶 Have a Baby</div>
        <div style="color:#aaa;font-size:11px;margin:4px 0;">Get married first — once you have a spouse, you can start a family here.</div>`;
      items.appendChild(intro);
    } else {
      intro.innerHTML = `<div class="siName">👶 Have a Baby with ${spouseName}</div>
        <div style="color:#aaa;font-size:11px;margin:4px 0;">A real family member who follows you around and actually grows up the more you play — starts small, gets bigger over time.</div>`;
      items.appendChild(intro);
      ADOPTABLE_KIDS.forEach((k,i) => {
        const d = document.createElement('div'); d.className='shopItem';
        d.innerHTML=`<div class="siName">${k.emoji} ${k.name}</div>
          <div class="siCost">💰 ${k.cost} S.I.P.</div>
          <button class="shopBtn" onclick="adoptChild(${i})" ${sipDollars<k.cost?'disabled':''}>Have Baby</button>`;
        items.appendChild(d);
      });
    }
  } else {
    const stage = growthStageFor(familyKidPlayTime);
    const info = document.createElement('div'); info.className='shopItem';
    info.innerHTML = `<div class="siName">${stage.emoji} ${familyKidName}</div>
      <div style="color:#aaa;font-size:11px;margin-bottom:8px;">Growth stage: ${stage.label} — grows up the more you play together.</div>
      <input id="familyKidNameInput" maxlength="16" value="${familyKidName}" style="width:100%;padding:6px;border-radius:6px;border:1px solid #555;background:#0a0a1a;color:#fff;font-size:12px;box-sizing:border-box;margin-bottom:8px;">
      <button class="shopBtn" onclick="renameChild()" style="width:100%;">✏️ Rename</button>`;
    items.appendChild(info);
  }

  // ── Bills section — real recurring upkeep for what you own, paid as real cash denominations ──
  const billsHeader = document.createElement('div');
  billsHeader.style.cssText = 'color:#ffcc66;font-size:11px;font-weight:bold;letter-spacing:1px;margin-top:10px;';
  billsHeader.textContent = '💵 BILLS';
  items.appendChild(billsHeader);
  if(!unpaidBills.length) {
    const none = document.createElement('div'); none.className='shopItem';
    none.innerHTML = `<div style="color:#888;font-size:11px;text-align:center;">No bills right now — owning land or a car brings real recurring upkeep.</div>`;
    items.appendChild(none);
  } else {
    unpaidBills.forEach(b => {
      const d = document.createElement('div'); d.className='shopItem';
      d.innerHTML = `<div class="siName">${b.label}${b.late ? ' <span style="color:#ff6644;">(LATE)</span>' : ''}</div>
        <div class="siCost">💵 ${b.amount} S.I.P. — ${billsToCash(b.amount)}</div>
        <button class="shopBtn" onclick="payBill('${b.id}')" ${sipDollars<b.amount?'disabled':''}>Pay</button>`;
      items.appendChild(d);
    });
  }

  // ── The rest of the collection, grouped by category ──
  ADD_ON_CATEGORIES.forEach(cat => {
    const inCat = ADD_ONS.filter(a => a.category === cat);
    if(!inCat.length) return;
    const header = document.createElement('div');
    header.style.cssText = 'color:#ff9944;font-size:11px;font-weight:bold;letter-spacing:1px;margin-top:6px;';
    header.textContent = cat.toUpperCase();
    items.appendChild(header);
    inCat.forEach(a => {
      const locked = a.needsBuddy && !buddyOwned;
      const d = document.createElement('div'); d.className='shopItem';
      if(a.type === 'toggle') {
        const on = activeAddOns.includes(a.id);
        const cantAffordToggle = !on && a.eliteCost && eliteCoins < a.eliteCost;
        d.innerHTML = `<div class="siName">${a.emoji} ${a.name}</div>
          <div style="color:#999;font-size:11px;margin:2px 0 4px;">${locked ? 'Adopt a buddy first to use this one!' : a.desc}</div>
          ${a.eliteCost && !on ? `<div class="siCost">💎 ${a.eliteCost}</div>` : ''}
          <button class="shopBtn" onclick="toggleAddOn('${a.id}')" ${locked||cantAffordToggle?'disabled':''} style="width:100%;${on?'background:#2a8f4a;':''}">${locked?'🔒 Locked':(on?'✅ ON':(cantAffordToggle?'❌ Need '+a.eliteCost+' 💎':'Turn On'))}</button>`;
      } else {
        const cantAffordSip = a.cost && sipDollars < a.cost;
        const cantAffordElite = a.eliteCost && eliteCoins < a.eliteCost;
        const cantAfford = cantAffordSip || cantAffordElite;
        d.innerHTML = `<div class="siName">${a.emoji} ${a.name}</div>
          <div style="color:#999;font-size:11px;margin:2px 0 4px;">${a.desc}</div>
          ${a.cost ? `<div class="siCost">💰 ${a.cost} S.I.P.</div>` : ''}
          ${a.eliteCost ? `<div class="siCost">💎 ${a.eliteCost}</div>` : ''}
          <button class="shopBtn" onclick="triggerAddOn('${a.id}')" ${cantAfford?'disabled':''} style="width:100%;">${cantAffordSip?'❌ Need '+a.cost+' S.I.P.':(cantAffordElite?'❌ Need '+a.eliteCost+' 💎':'Do It!')}</button>`;
      }
      items.appendChild(d);
    });
  });
}
function adoptBuddy(i) {
  const s = BUDDY_SPECIES[i];
  if(buddyOwned) { showNotif('❌ You already have a buddy!'); return; }
  if(sipDollars < s.cost) { showNotif(`❌ Need ${s.cost} S.I.P.`); return; }
  spendSip(s.cost); updateSIP();
  buddyOwned = true;
  buddySpecies = s.id;
  buddyName = s.name;
  buddyColors = { body:'#66ddff', accent:'#ffffff', eye:'#111111' };
  buildBuddy();
  sfx.buy();
  showNotif(`🐾 ${s.name} is your buddy — forever!`);
  saveCurrentUser();
  renderAddOnsPanel();
}
function repaintBuddy() {
  if(!buddyOwned) return;
  const body = document.getElementById('buddyBodyColor').value;
  const accent = document.getElementById('buddyAccentColor').value;
  const eye = document.getElementById('buddyEyeColor').value;
  buddyColors = { body, accent, eye };
  if(buddyMeshes) {
    buddyMeshes.body.forEach(m => m.material.color.setHex(c3(body)));
    buddyMeshes.accent.forEach(m => m.material.color.setHex(c3(accent)));
    buddyMeshes.eye.forEach(m => m.material.color.setHex(c3(eye)));
  }
  sfx.buy();
  showNotif(`🎨 ${buddyName} got a new look!`);
  saveCurrentUser();
}
function renameBuddy() {
  const input = document.getElementById('buddyNameInput');
  const val = input.value.trim().slice(0,16);
  if(!val) { input.value = buddyName; return; }
  buddyName = val;
  showNotif(`🐾 Your buddy is now named ${buddyName}!`);
  saveCurrentUser();
}
// Builds (or rebuilds, e.g. after a repaint's species never changes but a fresh login does) the
// real 3D companion mesh — same tagged-mesh-array trick as player.skinMeshes so repaints are live.
// Pure builder, no globals touched — returns {group, meshes} so it works for both the local
// buddy (buildBuddy() below) and any remote player's buddy (see buildOtherPlayerAvatar /
// syncPresence), which needs its own independent mesh since two players can each have one.
function buildBuddyMesh(species, colors) {
  const group = new THREE.Group();
  const meshes = { body:[], accent:[], eye:[] };
  const bodyC = c3(colors.body), accentC = c3(colors.accent), eyeC = c3(colors.eye);
  const mk = (geo, color, x, y, z, tag) => {
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
    m.position.set(x,y,z); m.castShadow = true; group.add(m);
    if(tag) meshes[tag].push(m);
    return m;
  };
  if(species==='blob') {
    mk(new THREE.SphereGeometry(0.45,12,10), bodyC, 0,0.45,0,'body');
    mk(new THREE.SphereGeometry(0.12,8,8), accentC, -0.18,0.55,0.38,'accent');
    mk(new THREE.SphereGeometry(0.12,8,8), accentC,  0.18,0.55,0.38,'accent');
    mk(new THREE.SphereGeometry(0.06,6,6), eyeC, -0.18,0.55,0.46,'eye');
    mk(new THREE.SphereGeometry(0.06,6,6), eyeC,  0.18,0.55,0.46,'eye');
  } else if(species==='cat') {
    mk(new THREE.BoxGeometry(0.5,0.35,0.75), bodyC, 0,0.35,0,'body');
    mk(new THREE.BoxGeometry(0.32,0.3,0.32), bodyC, 0,0.5,0.48,'body');
    mk(new THREE.ConeGeometry(0.1,0.18,4), accentC, -0.1,0.72,0.48,'accent');
    mk(new THREE.ConeGeometry(0.1,0.18,4), accentC,  0.1,0.72,0.48,'accent');
    mk(new THREE.SphereGeometry(0.045,6,6), eyeC, -0.1,0.52,0.62,'eye');
    mk(new THREE.SphereGeometry(0.045,6,6), eyeC,  0.1,0.52,0.62,'eye');
    const tail = mk(new THREE.CylinderGeometry(0.05,0.05,0.55,6), bodyC, 0,0.5,-0.42,'body'); tail.rotation.x = 0.9;
    [[-0.15,-0.28],[0.15,-0.28],[-0.15,0.28],[0.15,0.28]].forEach(([x,z]) => mk(new THREE.BoxGeometry(0.12,0.3,0.12), accentC, x,0.15,z,'accent'));
  } else if(species==='lion') {
    // A CUB, not a grown lion — no mane (real lions don't grow one until they're much older), a
    // head noticeably bigger relative to the body than an adult would have (the classic "baby
    // animal" proportion cue), and a few faint spots, since real lion cubs are actually born with
    // rosette spots that fade away as they grow up — an adult lion never has them.
    mk(new THREE.SphereGeometry(0.32,10,8), bodyC, 0,0.32,-0.05,'body');
    mk(new THREE.SphereGeometry(0.28,10,8), bodyC, 0,0.5,0.32,'body');
    [[-0.16,0.7],[0.16,0.7]].forEach(([x]) => mk(new THREE.SphereGeometry(0.09,8,6), bodyC, x,0.7,0.28,'body'));
    mk(new THREE.SphereGeometry(0.13,8,6), accentC, 0,0.44,0.55,'accent');
    [[-0.1,0.5],[0.1,0.5]].forEach(([x]) => mk(new THREE.SphereGeometry(0.045,6,6), eyeC, x,0.55,0.5,'eye'));
    mk(new THREE.SphereGeometry(0.035,6,6), 0x222222, 0,0.48,0.66,'body');
    [[-0.16,-0.2],[0.16,-0.2],[-0.16,0.18],[0.16,0.18]].forEach(([x,z]) => mk(new THREE.CylinderGeometry(0.07,0.07,0.22,6), bodyC, x,0.11,z,'body'));
    const tail = mk(new THREE.CylinderGeometry(0.04,0.04,0.4,6), bodyC, 0,0.35,-0.4,'body'); tail.rotation.x = 1.0;
    mk(new THREE.SphereGeometry(0.06,6,6), accentC, 0,0.2,-0.55,'accent');
    [[-0.1,0.18,0.35],[0.09,0.2,0.4]].forEach(([x,y,z]) => mk(new THREE.SphereGeometry(0.045,6,6), accentC, x,y,z,'accent'));
  } else if(species==='dragon') {
    mk(new THREE.BoxGeometry(0.55,0.5,0.9), bodyC, 0,0.5,0,'body');
    const snout = mk(new THREE.ConeGeometry(0.25,0.5,6), bodyC, 0,0.55,0.65,'body'); snout.rotation.x = Math.PI/2;
    [[-0.12,0.75],[0.12,0.75]].forEach(([x,z]) => mk(new THREE.ConeGeometry(0.06,0.2,4), accentC, x,0.85,z,'accent'));
    [[-0.1,0.7],[0.1,0.7]].forEach(([x,z]) => mk(new THREE.SphereGeometry(0.05,6,6), eyeC, x,0.6,z,'eye'));
    [[-0.4,0],[0.4,0]].forEach(([x]) => { const wing = mk(new THREE.ConeGeometry(0.35,0.06,3), accentC, x,0.65,-0.1,'accent'); wing.rotation.z = x<0 ? 1.3 : -1.3; });
    const tail = mk(new THREE.CylinderGeometry(0.08,0.02,0.7,6), bodyC, 0,0.4,-0.65,'body'); tail.rotation.x = 1.1;
  } else if(species==='robot') {
    mk(new THREE.BoxGeometry(0.55,0.55,0.5), bodyC, 0,0.55,0,'body');
    mk(new THREE.BoxGeometry(0.4,0.4,0.4), bodyC, 0,1.05,0,'body');
    mk(new THREE.SphereGeometry(0.05,6,6), eyeC, -0.1,1.05,0.21,'eye');
    mk(new THREE.SphereGeometry(0.05,6,6), eyeC,  0.1,1.05,0.21,'eye');
    mk(new THREE.CylinderGeometry(0.03,0.03,0.18,6), accentC, 0,1.34,0,'accent');
    mk(new THREE.SphereGeometry(0.05,6,6), accentC, 0,1.44,0,'accent');
    [[-0.35,0.55],[0.35,0.55]].forEach(([x]) => mk(new THREE.BoxGeometry(0.12,0.3,0.12), accentC, x,0.4,0,'accent'));
    [[-0.18,-0.18],[0.18,-0.18]].forEach(([x,z]) => mk(new THREE.BoxGeometry(0.15,0.15,0.15), accentC, x,0.15,z,'accent'));
  }
  return { group, meshes };
}
function buildBuddy() {
  if(buddyGroup) { scene.remove(buddyGroup); buddyGroup = null; }
  if(!buddyOwned || !buddySpecies) return;
  const built = buildBuddyMesh(buddySpecies, buddyColors);
  buddyGroup = built.group;
  buddyMeshes = built.meshes;
  const startX = playerGroup ? playerGroup.position.x - 1 : -1;
  const startZ = playerGroup ? playerGroup.position.z - 1 : 15;
  buddyGroup.position.set(startX, 0, startZ);
  scene.add(buddyGroup);
}

// ─── GROWTH tick — applies the current real-play-time growth stage to the player (and the
// adopted child, on its own slower clock) every frame; only fires the "you grew!" notif and a
// re-save on an ACTUAL stage change, not every frame. ───────────────────────────────────────
function tickGrowth(dt) {
  playTimeSeconds += dt;
  const stage = growthStageFor(playTimeSeconds);
  if (playerGroup) playerGroup.scale.setScalar(stage.scale);
  if (stage.id !== lastGrowthStageId) {
    lastGrowthStageId = stage.id;
    showNotif(`${stage.emoji} You grew up! You're a ${stage.label} now.`);
    sfx.earn();
    saveCurrentUser();
  }
  const hud = document.getElementById('growthHud');
  if (hud) hud.textContent = `${stage.emoji} ${stage.label} Size`;

  if (familyKidAdopted && familyKidGroup) {
    const schoolAge = ['kid','teen'].includes(growthStageFor(familyKidPlayTime).id);
    const inSchoolNow = familyKidInSchool && schoolAge;
    familyKidPlayTime += dt * (inSchoolNow ? 1.2 : 1); // school = grows up a bit faster
    if (inSchoolNow) familyKidSmarts += dt;
    const cStage = growthStageFor(familyKidPlayTime);
    familyKidGroup.scale.setScalar(cStage.scale * 0.75); // a kid is always a bit smaller than the player at the same stage
    if (cStage.id !== familyKidLastStageId) {
      if (cStage.id === 'adult' && familyKidSmarts > 0) {
        const payout = Math.round(familyKidSmarts * 5);
        queueEarning(payout, 0, `${familyKidName} graduated`);
        showNotif(`🎓 ${familyKidName} graduated and got a great job — they gave you ${payout.toLocaleString()} S.I.P. to say thanks! (pending in Earnings)`);
        sfx.cheer && sfx.cheer();
      } else {
        showNotif(`${cStage.emoji} ${familyKidName} grew into a ${cStage.label}!`);
      }
      familyKidLastStageId = cStage.id;
      saveCurrentUser();
    }
  }
}

function adoptChild(i) {
  const k = ADOPTABLE_KIDS[i];
  if (familyKidAdopted) { showNotif('❌ You already have a child!'); return; }
  if (!getSpouse(playerName)) { showNotif('❌ Get married first!'); return; }
  if (sipDollars < k.cost) { showNotif(`❌ Need ${k.cost} S.I.P.`); return; }
  spendSip(k.cost); updateSIP();
  familyKidAdopted = true;
  familyKidId = k.id;
  familyKidName = k.name;
  familyKidPlayTime = 0; // starts as a real baby, grows up on its own clock
  buildChild();
  sfx.buy();
  showNotif(`👨‍👩‍👧 ${k.name} is part of your family now!`);
  saveCurrentUser();
  if (typeof renderAddOnsPanel === 'function') renderAddOnsPanel();
}
function renameChild() {
  const input = document.getElementById('familyKidNameInput');
  if (!input) return;
  const val = input.value.trim().slice(0, 16);
  if (!val) { input.value = familyKidName; return; }
  familyKidName = val;
  showNotif(`👨‍👩‍👧 Your child is now named ${familyKidName}!`);
  saveCurrentUser();
}

// ─── SCHOOL — enroll your adopted child, grows a little faster + earns a S.I.P. bonus when they graduate ─
function openSchool() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('schoolModal').style.display = 'flex';
  refreshSchoolUI();
}
function closeSchool() {
  document.getElementById('schoolModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function refreshSchoolUI() {
  const box = document.getElementById('schoolBox');
  if(!familyKidAdopted) {
    box.innerHTML = `<div style="color:#aaa;font-size:13px;">You don't have a child yet — adopt one from the Add-Ons tab's FAMILY section first!</div>`;
    return;
  }
  const stage = growthStageFor(familyKidPlayTime);
  if(stage.id === 'baby') {
    box.innerHTML = `<div style="color:#aaa;font-size:13px;">${stage.emoji} ${familyKidName} is still a baby — too young for school. Come back once they've grown into a Kid!</div>`;
    return;
  }
  if(stage.id === 'adult') {
    box.innerHTML = `<div style="color:#aaa;font-size:13px;">🎓 ${familyKidName} already graduated and is all grown up — nothing left to learn here!</div>`;
    return;
  }
  let eventHtml = '';
  if (familyKidInSchool) {
    if (schoolEventActive) {
      const secsLeft = Math.max(0, Math.round(schoolEventActive.endsAt - playTimeSeconds));
      const { def } = schoolEventActive;
      eventHtml = `
        <div style="background:rgba(255,215,0,0.1);border:2px solid #FFD700;border-radius:10px;padding:10px;margin-bottom:12px;">
          <div style="color:#FFD700;font-size:12px;font-weight:bold;margin-bottom:4px;">${def.emoji} ${def.name} — happening now!</div>
          <div style="color:#ccc;font-size:11px;margin-bottom:8px;">${def.desc}</div>
          <div style="color:#888;font-size:10px;margin-bottom:8px;">Ends in ${secsLeft}s</div>
          <button class="shopBtn" onclick="participateInSchoolEvent()" style="width:100%;">🙋 Participate</button>
        </div>`;
    } else if (schoolEventNextAt !== null) {
      const secsUntil = Math.max(0, Math.round(schoolEventNextAt - playTimeSeconds));
      eventHtml = `<div style="color:#666;font-size:10px;margin-bottom:12px;">📅 Next school event in about ${secsUntil}s</div>`;
    }
  }
  box.innerHTML = `
    <div style="color:#fff;font-size:14px;margin-bottom:6px;">${stage.emoji} ${familyKidName} — ${stage.label}</div>
    <div style="color:#7fc8ff;font-size:12px;margin-bottom:12px;">📚 Smarts earned so far: ${Math.floor(familyKidSmarts).toLocaleString()}</div>
    <div style="color:#888;font-size:11px;margin-bottom:12px;">Enrolled = grows up 20% faster and earns Smarts — cash out as a bonus when they become an Adult.</div>
    ${eventHtml}
    <button class="shopBtn" onclick="toggleKidSchool()" style="width:100%;">${familyKidInSchool ? '🚪 Take Out of School' : '🏫 Enroll in School'}</button>`;
}
function toggleKidSchool() {
  familyKidInSchool = !familyKidInSchool;
  showNotif(familyKidInSchool ? `🏫 ${familyKidName} is enrolled in school!` : `${familyKidName} is out of school for now.`);
  saveCurrentUser();
  refreshSchoolUI();
}
function scheduleNextSchoolEvent() {
  schoolEventNextAt = playTimeSeconds + SCHOOL_EVENT_MIN_GAP + Math.random() * (SCHOOL_EVENT_MAX_GAP - SCHOOL_EVENT_MIN_GAP);
}
function tickSchoolEvent() {
  const schoolAge = familyKidAdopted && ['kid','teen'].includes(growthStageFor(familyKidPlayTime).id);
  const eligible = schoolAge && familyKidInSchool;
  if (!eligible) { schoolEventActive = null; schoolEventNextAt = null; return; }
  if (schoolEventNextAt === null) { scheduleNextSchoolEvent(); return; }
  if (schoolEventActive) {
    if (playTimeSeconds >= schoolEventActive.endsAt) {
      showNotif(`${schoolEventActive.def.emoji} The ${schoolEventActive.def.name} ended — you missed it this time.`);
      schoolEventActive = null;
      scheduleNextSchoolEvent();
      if (document.getElementById('schoolModal').style.display !== 'none') refreshSchoolUI();
    }
    return;
  }
  if (playTimeSeconds >= schoolEventNextAt) {
    const def = SCHOOL_EVENTS[Math.floor(Math.random() * SCHOOL_EVENTS.length)];
    schoolEventActive = { def, endsAt: playTimeSeconds + SCHOOL_EVENT_WINDOW_SEC };
    showNotif(`${def.emoji} ${familyKidName}'s school just started a ${def.name} — head to School to join in!`);
    sfx.earn && sfx.earn();
    if (document.getElementById('schoolModal').style.display !== 'none') refreshSchoolUI();
  }
}
function participateInSchoolEvent() {
  if (!schoolEventActive) return;
  const { def } = schoolEventActive;
  const sipReward = 80 + Math.round(Math.random() * 120);
  const smartsBonus = 30 + Math.round(Math.random() * 40);
  familyKidSmarts += smartsBonus;
  queueEarning(sipReward, 0, `${def.name} at ${familyKidName}'s school`);
  showNotif(`${def.emoji} You helped out at the ${def.name}! +${smartsBonus} Smarts, ${sipReward} S.I.P. pending in Earnings.`);
  sfx.cheer ? sfx.cheer() : sfx.buy();
  schoolEventActive = null;
  scheduleNextSchoolEvent();
  saveCurrentUser();
  refreshSchoolUI();
}
// A small boxy person (NOT the pet/blob shapes Buddy uses) so it visibly reads as a family
// member, built at whatever the current growth stage's scale is — buildChild() itself doesn't
// scale (tickGrowth does that live every frame), it just needs SOME starting geometry.
function buildChild() {
  if (familyKidGroup) { scene.remove(familyKidGroup); familyKidGroup = null; }
  if (!familyKidAdopted || !familyKidId) return;
  const k = ADOPTABLE_KIDS.find(x => x.id === familyKidId) || ADOPTABLE_KIDS[0];
  familyKidGroup = new THREE.Group();
  familyKidMeshes = { body: [], accent: [] };
  const skinC = c3(k.skin), shirtC = c3(k.shirt), hairC = c3(k.hair);
  const mk = (geo, color, x, y, z, tag) => {
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
    m.position.set(x, y, z); m.castShadow = true; familyKidGroup.add(m);
    if (tag) familyKidMeshes[tag].push(m);
    return m;
  };
  mk(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinC, 0, 1.15, 0, 'body');   // head
  mk(new THREE.BoxGeometry(0.55, 0.18, 0.55), hairC, 0, 1.45, 0, 'accent'); // hair cap
  mk(new THREE.BoxGeometry(0.55, 0.7, 0.35), shirtC, 0, 0.6, 0, 'body');  // torso
  [[-0.35, 0.55], [0.35, 0.55]].forEach(([x]) => mk(new THREE.BoxGeometry(0.16, 0.6, 0.16), skinC, x, 0.6, 0, 'body')); // arms
  [[-0.15, 0.55], [0.15, 0.55]].forEach(([x]) => mk(new THREE.BoxGeometry(0.18, 0.55, 0.18), c3('#333333'), x, 0.15, 0, 'accent')); // legs
  const startX = playerGroup ? playerGroup.position.x + 1 : 1;
  const startZ = playerGroup ? playerGroup.position.z - 1 : 15;
  familyKidGroup.position.set(startX, 0, startZ);
  scene.add(familyKidGroup);
}

// ─── BILLS — real recurring charges for what you own, cycling every BILL_CHECK_INTERVAL of
// real play. Late bills add a small late fee next cycle instead of repossessing anything —
// this is a kids' economy game, the point is "money has upkeep", not "lose your house". ────────
function billTimerTick(dt) {
  billTimer += dt;
  if (billTimer < BILL_CHECK_INTERVAL) return;
  billTimer = 0;
  generateBills();
}
function generateBills() {
  const items = [];
  // Real bug found live: this never checked whether the last cycle's bill was still sitting
  // unpaid before generating another — every 90-second cycle piled on a fresh duplicate on top,
  // so a long play session (or just not opening Add-Ons for a while) could quietly stack up
  // hundreds of bills for the exact same rent/car payment. Now it only sends a new bill once
  // the previous one of that type has actually been paid off.
  const hasUnpaid = prefix => unpaidBills.some(b => b.id.startsWith(prefix));
  if (ownedLand.length && !hasUnpaid('rent_')) items.push({ id:'rent_' + Date.now(), label:`🏡 Land upkeep (${ownedLand.length} plot${ownedLand.length>1?'s':''})`, amount: 10 * ownedLand.length });
  if (ownedCars.length && !hasUnpaid('car_')) items.push({ id:'car_' + Date.now(), label:`🚗 Car payment (${ownedCars.length} car${ownedCars.length>1?'s':''})`, amount: 15 * ownedCars.length });
  if (!items.length) return; // nothing owned yet, or last cycle's bill(s) are still unpaid
  items.forEach(it => { it.dueAt = playTimeSeconds + 120; unpaidBills.push(it); }); // real 2-minute grace period
  lastBillCheck = playTimeSeconds;
  saveCurrentUser();
  showNotif(`📬 New bill${items.length>1?'s':''} arrived! Check the 🧩 Add-Ons tab.`);
  sfx.notify();
}
function tickBillsOverdue() {
  let lateFeeAdded = false;
  unpaidBills.forEach(b => {
    if (!b.late && playTimeSeconds > b.dueAt) { b.late = true; b.amount += Math.ceil(b.amount * 0.25); lateFeeAdded = true; }
  });
  if (lateFeeAdded) { saveCurrentUser(); showNotif('⚠️ A bill went overdue — a late fee was added!'); }
}
function payBill(id) {
  const b = unpaidBills.find(x => x.id === id);
  if (!b) return;
  if (sipDollars < b.amount) { showNotif(`❌ Need ${b.amount} S.I.P. to pay this bill!`); return; }
  spendSip(b.amount); updateSIP();
  unpaidBills = unpaidBills.filter(x => x.id !== id);
  saveCurrentUser();
  sfx.buy();
  showNotif(`💵 Paid ${b.label} — handed over ${billsToCash(b.amount)}!`);
  if (document.getElementById('addOnsPanel') && document.getElementById('addOnsPanel').style.display !== 'none') renderAddOnsPanel();
}
// Turns an S.I.P. amount into a real stack of bill denominations for the payment notif/UI —
// this is the "actual paper cash" half of the ask, not just a number disappearing.
const CASH_DENOMS = [100, 50, 20, 10, 5, 1];
function billsToCash(amount) {
  let remaining = amount, out = [];
  for (const d of CASH_DENOMS) {
    const count = Math.floor(remaining / d);
    if (count > 0) { out.push(`${count}×$${d}`); remaining -= count * d; }
  }
  return out.join(' + ');
}

// ─── GUIDE — a real "how to play" walkthrough. Auto-opens the FIRST time a genuinely new
// account enters the world (not on every login), and can be reopened anytime from the ❓ HELP
// tab. The point: a brand-new player who doesn't know what any of this does is the exact
// reviewer who leaves a 1-star "confusing, no idea what to do" review — this exists to catch
// them before that happens, not to decorate the loading screen. ─────────────────────────────
const GUIDE_PAGES = [
  { emoji:'👋', title:'Welcome to Explox!', tips:[
    'WASD to move, Shift to run, Space to jump, Mouse to look around.',
    'Press E to interact with people, doors, and shop counters.',
    'Press T anytime to ask SAI, your in-game helper, a real question.',
  ]},
  { emoji:'💰', title:'Money', tips:[
    'S.I.P. is the main currency — earn it from jobs, selling things, or just exploring.',
    '💎 Elite Coins are rarer — only tough robots at the Scrapyard drop them.',
    'Press B for your Bag, or visit the City Bank to save up S.I.P. safely.',
  ]},
  { emoji:'🏠', title:'Your Place', tips:[
    'You start with a free house right in the city.',
    'Buy your own land at Sunset Plains and build a house, fountain, or more on it.',
    'Owning land or a car brings real recurring bills — pay them under the 🧩 Add-Ons tab before they go late.',
  ]},
  { emoji:'🚗', title:'Get Around', tips:[
    'Buy a car at the Car Dealership and drive it around the city.',
    'Ride the S.I.T.S. Transit lines to fast-travel anywhere instantly.',
    'Fly from the Airport to 8 real countries — or even the Space Station!',
  ]},
  { emoji:'🎮', title:'Have Fun', tips:[
    'Press G for Add-Ons — 100+ fun toggles, plus adopting a Buddy or a child.',
    'Check Mini Games for Capture the Throne, Parkour, Geo Dash, and your own store.',
    'Visit the Arcade for real Maze/Snake/Tetris, or the Movie Theater for real movies.',
  ]},
  { emoji:'🌱', title:'One Last Thing', tips:[
    'Your character actually grows up the more you play — Baby, Kid, Teen, then Adult.',
    'Get a job downtown for steady S.I.P., or fight robots for rare 💎 Elite Coins.',
    "Stuck? Press T for SAI, or click ❓ HELP on the left edge to see this guide again.",
  ]},
];
let guidePageIndex = 0;
let hasSeenGuide = false; // persisted
function openGuide() {
  guidePageIndex = 0;
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('guideModal').style.display = 'flex';
  renderGuidePage();
}
function closeGuide() {
  document.getElementById('guideModal').style.display = 'none';
  if(!hasSeenGuide) { hasSeenGuide = true; saveCurrentUser(); }
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function guideNext() {
  if(guidePageIndex >= GUIDE_PAGES.length - 1) { closeGuide(); return; }
  guidePageIndex++;
  renderGuidePage();
}
function guidePrev() {
  if(guidePageIndex <= 0) return;
  guidePageIndex--;
  renderGuidePage();
}
function renderGuidePage() {
  const page = GUIDE_PAGES[guidePageIndex];
  document.getElementById('guideEmoji').textContent = page.emoji;
  document.getElementById('guideTitle').textContent = page.title;
  document.getElementById('guideTips').innerHTML = page.tips.map(t => `<li style="margin-bottom:6px;">${t}</li>`).join('');
  document.getElementById('guideBackBtn').style.visibility = guidePageIndex === 0 ? 'hidden' : 'visible';
  document.getElementById('guideNextBtn').textContent = guidePageIndex === GUIDE_PAGES.length - 1 ? "Let's play!" : 'Next →';
  const dots = document.getElementById('guideStepDots');
  dots.innerHTML = GUIDE_PAGES.map((_, i) => `<div style="width:7px;height:7px;border-radius:50%;background:${i===guidePageIndex ? '#44ccff' : '#334455'};"></div>`).join('');
}

// ─── ADD ONS ENGINE ────────────────────────────────────────────────────────
// One real particle pool shared by every trail/burst add-on (spawnParticle + the update
// loop in animate()) instead of a separate system per effect.
function spawnParticle(pos, color, opts) {
  opts = opts || {};
  const size = opts.size || 0.12;
  const m = new THREE.Mesh(new THREE.SphereGeometry(size,6,6), new THREE.MeshBasicMaterial({ color, transparent:true, opacity:1 }));
  m.position.copy(pos);
  scene.add(m);
  trailParticles.push({
    mesh:m, life: opts.life||0.6, maxLife: opts.life||0.6,
    vx: opts.vx||0, vy: opts.vy!==undefined?opts.vy:0.5, vz: opts.vz||0,
    gravity: !!opts.gravity
  });
}
const CONFETTI_COLORS = [0xff4466,0xffcc00,0x44ddff,0x66ff66,0xff88ff,0xffffff];
function burstConfetti(pos, count) {
  for(let i=0;i<count;i++){
    const ang = Math.random()*Math.PI*2, spd = 1+Math.random()*2.5;
    spawnParticle(pos, CONFETTI_COLORS[i%CONFETTI_COLORS.length], {
      vx:Math.cos(ang)*spd, vz:Math.sin(ang)*spd, vy:3+Math.random()*2.5, gravity:true, life:1.1+Math.random()*0.4, size:0.09
    });
  }
}

function toggleAddOn(id) {
  const def = ADD_ONS.find(a=>a.id===id);
  if(!def || def.type!=='toggle') return;
  if(def.needsBuddy && !buddyOwned) { showNotif('❌ Adopt a buddy first!'); return; }
  const idx = activeAddOns.indexOf(id);
  if(idx===-1) {
    if(def.eliteCost && eliteCoins < def.eliteCost) { showNotif(`❌ Need ${def.eliteCost} 💎`); return; }
    if(def.eliteCost) { eliteCoins -= def.eliteCost; updateElite(); }
    const EXCLUSIVE_PAIRS = [['tinymode','giantmode'],['petxl','petmini'],['snowday','leafstorm']];
    EXCLUSIVE_PAIRS.forEach(([a,b]) => {
      if(id===a) activeAddOns = activeAddOns.filter(x=>x!==b);
      if(id===b) activeAddOns = activeAddOns.filter(x=>x!==a);
    });
    activeAddOns.push(id);
    showNotif(`${def.emoji} ${def.name} ON!`);
  } else {
    activeAddOns.splice(idx,1);
    showNotif(`${def.emoji} ${def.name} off`);
  }
  sfx.click();
  applyCameraFX();
  // Weather add-ons force a real particle type on; turning the last one off (or switching to the
  // other) hands control back to applySeasonEffects(), which recomputes the REAL current season.
  if(id==='snowday' || id==='leafstorm') {
    if(activeAddOns.includes('snowday')) startWeatherParticles('snow');
    else if(activeAddOns.includes('leafstorm')) startWeatherParticles('leaves');
    else applySeasonEffects();
  }
  saveCurrentUser();
  renderAddOnsPanel();
}

function applyCameraFX() {
  if(!renderer || !renderer.domElement) return;
  const canvas = renderer.domElement;
  const filters = [];
  if(activeAddOns.includes('bw')) filters.push('grayscale(1)');
  if(activeAddOns.includes('sepia')) filters.push('sepia(1)');
  if(activeAddOns.includes('blur')) filters.push('blur(2px)');
  if(activeAddOns.includes('nightvision')) filters.push('brightness(1.3) hue-rotate(70deg) saturate(2)');
  if(activeAddOns.includes('trippy')) filters.push(`hue-rotate(${Math.round(_trippyHue)}deg) saturate(1.6)`);
  canvas.style.filter = filters.length ? filters.join(' ') : '';
  const transforms = [];
  if(activeAddOns.includes('mirror')) transforms.push('scaleX(-1)');
  if(activeAddOns.includes('upsidedown')) transforms.push('scaleY(-1)');
  canvas.style.transform = transforms.length ? transforms.join(' ') : '';
}

const EIGHTBALL_ANSWERS = ['Yes, definitely!','Ask again later.','Nope, not gonna happen.','It is certain!','Very doubtful.','Absolutely!','Better not tell you now.','Without a doubt!','My sources say no.','Signs point to yes.'];
const COMPLIMENTS = ['You build amazing stuff! 🌟','Best explorer in Explox! 🗺️','That outfit is fire! 🔥','You make this city better! 🏙️','Certified S.I.P. legend! 💰','Your buddy is lucky to have you! 🐾'];
const FUN_FACTS = ['Octopuses have three hearts! 🐙','A day on Venus is longer than its year! 🪐','Honey never spoils — ever! 🍯','Bananas are berries, but strawberries aren\'t! 🍌','Sharks existed before trees! 🦈','A group of flamingos is called a "flamboyance"! 🦩'];
function triggerAddOn(id) {
  const def = ADD_ONS.find(a=>a.id===id);
  if(!def || def.type!=='action') return;
  if((id==='nitro'||id==='partyhorn') && !inCar) { showNotif('❌ You need to be driving for this one!'); return; }
  if((id==='giftfriends'||id==='friendparty'||id==='shoutout'||id==='surprisevisit') && friends.length===0) { showNotif('❌ Make a friend first!'); return; }
  const cost = def.cost||0;
  const eliteCost = def.eliteCost||0;
  if(cost>0 && sipDollars < cost) { showNotif(`❌ Need ${cost} S.I.P.`); return; }
  if(eliteCost>0 && eliteCoins < eliteCost) { showNotif(`❌ Need ${eliteCost} 💎`); return; }
  if(cost>0) { spendSip(cost); updateSIP(); }
  if(eliteCost>0) { eliteCoins -= eliteCost; updateElite(); }
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  if(id==='diceroll') showNotif(`🎲 You rolled a ${1+Math.floor(Math.random()*6)}!`);
  else if(id==='coinflip') showNotif(`🪙 ${Math.random()<0.5?'Heads!':'Tails!'}`);
  else if(id==='eightball') showNotif(`🎱 ${pick(EIGHTBALL_ANSWERS)}`);
  else if(id==='compliment') showNotif(pick(COMPLIMENTS));
  else if(id==='funfact') showNotif(`🧠 ${pick(FUN_FACTS)}`);
  else if(id==='airhorn') { sfx.honk(); showNotif('📯 HOOOONK!'); }
  else if(id==='applause') { sfx.clap(); showNotif('👏 Nice one!'); }
  else if(id==='fireworks') {
    sfx.boom();
    const above = playerGroup.position.clone(); above.y += 5;
    burstConfetti(above, 24);
    showNotif('🎆 Fireworks!');
  }
  else if(def.category==='Food Bombs') {
    burstConfetti(playerGroup.position.clone().setY(playerGroup.position.y+1), 14);
    sfx.boom();
    eatFood(def.emoji, def.name, def.taste); // real taste-reaction popup, same system the Diner uses
  }
  else if(def.category==='Dress Up Parties') {
    playerColors.shirt = def.shirt; playerColors.pants = def.pants; playerColors.shoes = def.shoes;
    buildPlayer(); // real rebuild — buildPlayer() now removes the old group first (see its own fix note)
    burstConfetti(playerGroup.position.clone().setY(playerGroup.position.y+1.5), 20);
    sfx.cheer();
    showNotif(`${def.emoji} ${def.name} time!`);
  }
  else if(id==='warcry') {
    warCryEndTime = clock.getElapsedTime() + 8;
    sfx.honk();
    burstConfetti(playerGroup.position.clone().setY(playerGroup.position.y+1), 10);
    showNotif('😤 War Cry! Double damage for 8 seconds!');
  }
  else if(id==='fullheal') {
    playerHealth = playerMaxHealth;
    updateHealthBar();
    sfx.earn();
    showNotif('🏥 Fully healed!');
  }
  else if(id==='instantfriend') {
    const candidates = SHOPPER_IDENTITIES.map(p=>p.name).filter(n=>!friends.includes(n));
    if(!candidates.length) { showNotif('❌ You are already friends with everyone!'); }
    else befriendNeighbor(pick(candidates));
  }
  else if(id==='giftfriends') {
    sfx.buy();
    showNotif(`🎁 Gave ${friends.length} friend${friends.length===1?'':'s'} a gift!`);
  }
  else if(id==='friendparty') {
    const friendName = pick(friends);
    burstConfetti(playerGroup.position.clone().setY(playerGroup.position.y+1.5), 20);
    sfx.cheer();
    showNotif(`🎉 You and ${friendName} threw a party!`);
  }
  else if(id==='shoutout') showNotif(`💌 Shoutout to ${pick(friends)} — best friend ever!`);
  else if(id==='surprisevisit') {
    const friendName = pick(friends);
    houseGuest = friendName;
    refreshHouseGuest();
    sfx.buy();
    showNotif(`🏠 ${friendName} is stopping by your house!`);
  }
  else if(id==='nitro') {
    nitroEndTime = clock.getElapsedTime() + 3;
    sfx.launch();
    showNotif('💨 Nitro Boost engaged!');
  }
  else if(id==='partyhorn') { sfx.honk(); showNotif('📯 HOOOONK!'); }
  else if(id==='launchthrone') window.open('AiGame/explox/minigames/throne.html', '_blank');
  else if(id==='launchobby') window.open('AiGame/explox/minigames/obby.html', '_blank');
  else if(id==='launchparkour') window.open('AiGame/explox/minigames/parkour.html', '_blank');
  else if(id==='launchsf') window.open('AiGame/explox/minigames/sf.html', '_blank');
  else if(id==='hirekiller') openHitmanModal();
  else if(id==='relieve') relieveOutdoors();
  if(cost>0 || eliteCost>0) { saveCurrentUser(); renderAddOnsPanel(); }
}

function buyOutfit(i) {
  const o = OUTFITS[i];
  if(sipDollars < o.cost) { showNotif(`❌ Need ${o.cost} S.I.P.`); return; }
  spendSip(o.cost); updateSIP();
  playerColors.shirt = o.shirt; playerColors.pants = o.pants; playerColors.shoes = o.shoes;
  document.getElementById('shirtColor').value = o.shirt;
  document.getElementById('pantsColor').value = o.pants;
  document.getElementById('shoeColor').value  = o.shoes;
  showNotif(`✅ Wearing ${o.name}!`);
  closeShop();
}
function buyWeapon(i) {
  const w = WEAPONS[i];
  const need = weaponRequiredLevel(w.id);
  if (need > eliteLevel) { showNotif(`🔒 ${w.name} requires Robot Level ${need} (you're Lv.${eliteLevel}) — level up in the Quests tab!`); return; }
  if(ownedWeapons.includes(w.id)) { equipWeapon(w.id); closeShop(); return; }
  if(sipDollars < w.cost) { showNotif(`❌ Need ${w.cost} S.I.P.`); return; }
  spendSip(w.cost); updateSIP();
  ownedWeapons.push(w.id);
  equipWeapon(w.id);
  showNotif(`✅ Got ${w.name}!`);
  closeShop();
}

// ─── 40 OUTFIT SHOPS (Fashion Wing) ────────────────────────────────────────────
// 10 real themes, 4 name variations each = 40 shops. Every shop in a theme sells that
// theme's SAME small outfit list (unlike the 300-shop system, a themed clothing line
// doesn't need per-branch item rotation — 4 real branches carrying the same collection
// is how real clothing chains work). Buying still does the real thing OUTFITS always
// did: recolors your actual character (shirt/pants/shoes), not a decorative inventory add.
const OUTFIT_CATEGORIES = [
  { id:'sporty', category:'Sporty', emoji:'🏀',
    nameTemplates:['{word} Sports Wear','The {word} Athletic Shop','{word} Team Gear','{word} Varsity Outfitters'],
    nameWords:['Champion','Blitz','Rally','Victory'], ad:'Gear up and look the part!',
    outfits:[
      {name:'Team Red',   cost:30, shirt:'#c0392b', pants:'#2c3e50', shoes:'#ffffff'},
      {name:'Team Blue',  cost:30, shirt:'#2980b9', pants:'#2c3e50', shoes:'#ffffff'},
      {name:'Track Star', cost:50, shirt:'#e67e22', pants:'#1a1a1a', shoes:'#e67e22'},
      {name:'Varsity',    cost:70, shirt:'#8e44ad', pants:'#f5f5f5', shoes:'#8e44ad'},
      {name:'MVP Gold',   cost:90, shirt:'#FFD700', pants:'#1a1a1a', shoes:'#FFD700'},
    ]},
  { id:'formal', category:'Formal', emoji:'🤵',
    nameTemplates:['{word} Formal Wear','The {word} Suit Shop','{word} Black Tie Boutique','{word} Elegance'],
    nameWords:['Sterling','Windsor','Prestige','Monarch'], ad:'Dress to impress, every time!',
    outfits:[
      {name:'Classic Black Tie', cost:70,  shirt:'#111111', pants:'#111111', shoes:'#000000'},
      {name:'Navy Suit',         cost:80,  shirt:'#1b2a4a', pants:'#12203a', shoes:'#0a0a0a'},
      {name:'White Tux',         cost:120, shirt:'#f5f5f5', pants:'#1a1a1a', shoes:'#111111'},
      {name:'Silver Gala',       cost:140, shirt:'#c0c0c8', pants:'#2a2a2a', shoes:'#1a1a1a'},
      {name:'Midnight Formal',   cost:150, shirt:'#0d0d1a', pants:'#0d0d1a', shoes:'#000000'},
    ]},
  { id:'punk', category:'Punk', emoji:'🎸',
    nameTemplates:['{word} Punk Outfitters','The {word} Rebel Shop','{word} Studs & Spikes','{word} Underground'],
    nameWords:['Riot','Venom','Havoc','Grit'], ad:'Break the rules in style!',
    outfits:[
      {name:'Studded Black', cost:40, shirt:'#1a1a1a', pants:'#0d0d0d', shoes:'#333333'},
      {name:'Ripped Denim',  cost:50, shirt:'#2c3e50', pants:'#34495e', shoes:'#1a1a1a'},
      {name:'Skull Print',   cost:60, shirt:'#222222', pants:'#111111', shoes:'#555555'},
      {name:'Rebel Red',     cost:65, shirt:'#a3131f', pants:'#1a1a1a', shoes:'#1a1a1a'},
      {name:'Neon Mohawk',   cost:100,shirt:'#39ff14', pants:'#1a1a1a', shoes:'#39ff14'},
    ]},
  { id:'pastel', category:'Pastel', emoji:'🌸',
    nameTemplates:['{word} Pastel Corner','The {word} Sweet Shop','{word} Soft Style','{word} Dreamy Threads'],
    nameWords:['Blossom','Cloud','Sugar','Petal'], ad:'Soft colors, sweet style!',
    outfits:[
      {name:'Cotton Candy',   cost:30, shirt:'#ffc9de', pants:'#e6c9ff', shoes:'#ffffff'},
      {name:'Lavender Dream', cost:35, shirt:'#d6c9ff', pants:'#b8a6e0', shoes:'#f5f0ff'},
      {name:'Mint Breeze',    cost:35, shirt:'#c8f0e0', pants:'#a0e0c8', shoes:'#ffffff'},
      {name:'Baby Blue',      cost:40, shirt:'#c9e6ff', pants:'#a6c9e0', shoes:'#ffffff'},
      {name:'Blush Pink',     cost:45, shirt:'#ffd9e0', pants:'#f5b8c0', shoes:'#ffffff'},
    ]},
  { id:'neon', category:'Neon Rave', emoji:'💡',
    nameTemplates:['{word} Neon Outfits','The {word} Glow Shop','{word} Rave Wear','{word} Electric Threads'],
    nameWords:['Volt','Pulse','Flash','Neon'], ad:'Light up the room!',
    outfits:[
      {name:'Electric Green', cost:50, shirt:'#39ff14', pants:'#1a1a1a', shoes:'#39ff14'},
      {name:'Ultraviolet',    cost:60, shirt:'#a020f0', pants:'#1a1a1a', shoes:'#a020f0'},
      {name:'Neon Pink Pulse',cost:70, shirt:'#ff10f0', pants:'#1a1a1a', shoes:'#ff10f0'},
      {name:'Laser Blue',     cost:80, shirt:'#10e0ff', pants:'#1a1a1a', shoes:'#10e0ff'},
      {name:'Glow Stick',     cost:110,shirt:'#ffff33', pants:'#1a1a1a', shoes:'#ffff33'},
    ]},
  { id:'military', category:'Military', emoji:'🎖️',
    nameTemplates:['{word} Tactical Gear','The {word} Camo Shop','{word} Ops Outfitters','{word} Field Wear'],
    nameWords:['Ranger','Recon','Bravo','Falcon'], ad:'Mission-ready style!',
    outfits:[
      {name:'Woodland',       cost:60,  shirt:'#4a5c33', pants:'#3a4a28', shoes:'#2a2a2a'},
      {name:'Desert Tan',     cost:70,  shirt:'#c2a670', pants:'#a68a58', shoes:'#4a3a28'},
      {name:'Urban Grey',     cost:80,  shirt:'#5a5a5a', pants:'#3a3a3a', shoes:'#1a1a1a'},
      {name:'Night Ops',      cost:110, shirt:'#1a1f1a', pants:'#0d100d', shoes:'#000000'},
      {name:'Special Forces', cost:140, shirt:'#3a4a2a', pants:'#1a1a1a', shoes:'#2a2a2a'},
    ]},
  { id:'royal', category:'Royal', emoji:'👑',
    nameTemplates:['{word} Royal Wardrobe','The {word} Crown Shop','{word} Majesty Boutique','{word} Regal Wear'],
    nameWords:['Windsor','Sterling','Regent','Noble'], ad:'Dress like royalty!',
    outfits:[
      {name:'Crimson Crown',   cost:100, shirt:'#8b0000', pants:'#5a0000', shoes:'#FFD700'},
      {name:'Royal Purple',    cost:120, shirt:'#5d1a8b', pants:'#3a0d5a', shoes:'#FFD700'},
      {name:'Golden Majesty',  cost:160, shirt:'#FFD700', pants:'#8b6b00', shoes:'#FFD700'},
      {name:'Emerald Throne',  cost:180, shirt:'#046307', pants:'#023a04', shoes:'#FFD700'},
      {name:'Silver Sovereign',cost:220, shirt:'#c0c0c8', pants:'#8a8a90', shoes:'#FFD700'},
    ]},
  { id:'beach', category:'Beach', emoji:'🏖️',
    nameTemplates:['{word} Beach Wear','The {word} Tropical Shop','{word} Sun & Sand','{word} Island Threads'],
    nameWords:['Wave','Palm','Coral','Breeze'], ad:'Beach vibes all day!',
    outfits:[
      {name:'Sunset Orange', cost:30, shirt:'#ff8c42', pants:'#f5f5f5', shoes:'#ffffff'},
      {name:'Ocean Teal',    cost:35, shirt:'#14b8a6', pants:'#f5f5f5', shoes:'#ffffff'},
      {name:'Tropical Yellow',cost:40,shirt:'#ffd93d', pants:'#f5f5f5', shoes:'#ffffff'},
      {name:'Coral Reef',    cost:45, shirt:'#ff6f61', pants:'#f5f5f5', shoes:'#ffffff'},
      {name:'Palm Green',    cost:50, shirt:'#2d9d5a', pants:'#f5f5f5', shoes:'#ffffff'},
    ]},
  { id:'winter', category:'Winter', emoji:'❄️',
    nameTemplates:['{word} Winter Wear','The {word} Frost Shop','{word} Cozy Outfitters','{word} Snow Threads'],
    nameWords:['Frost','Arctic','Cocoa','Blizzard'], ad:'Stay cozy, stay stylish!',
    outfits:[
      {name:'Frost White',  cost:40, shirt:'#f5f5f5', pants:'#dcdcdc', shoes:'#888888'},
      {name:'Arctic Blue',  cost:50, shirt:'#a8d0e6', pants:'#5a8ab0', shoes:'#2a3a4a'},
      {name:'Cocoa Brown',  cost:55, shirt:'#6b4423', pants:'#4a2f18', shoes:'#2a1a0d'},
      {name:'Holiday Red',  cost:60, shirt:'#b22222', pants:'#1a3a1a', shoes:'#2a2a2a'},
      {name:'Snowy Grey',   cost:65, shirt:'#b0b8c0', pants:'#7a828a', shoes:'#3a3a3a'},
    ]},
  { id:'superhero', category:'Superhero', emoji:'🦸',
    nameTemplates:['{word} Hero Outfitters','The {word} Cape Shop','{word} Super Wear','{word} Powers Boutique'],
    nameWords:['Blaze','Titan','Nova','Guardian'], ad:'Every hero needs a look!',
    outfits:[
      {name:'Hero Red',        cost:60,  shirt:'#d10000', pants:'#0033a0', shoes:'#FFD700'},
      {name:'Shadow Vigilante',cost:80,  shirt:'#1a1a1a', pants:'#1a1a1a', shoes:'#333333'},
      {name:'Cosmic Blue',     cost:100, shirt:'#0033a0', pants:'#001a5a', shoes:'#FFD700'},
      {name:'Toxic Green',     cost:120, shirt:'#39ff14', pants:'#1a1a1a', shoes:'#39ff14'},
      {name:'Golden Guardian', cost:160, shirt:'#FFD700', pants:'#8b6b00', shoes:'#FFD700'},
    ]},
  // 10 more categories (item ~235, user's own follow-up: "50 new clothings" on top of the
  // original 50 above) — same exact shape, 10 fresh non-overlapping themes.
  { id:'gothic', category:'Gothic', emoji:'🦇',
    nameTemplates:['{word} Gothic Attire','The {word} Dark Boutique','{word} Shadow Wardrobe','{word} Vampire Couture'],
    nameWords:['Raven','Crimson','Nocturne','Wraith'], ad:'Embrace the darkness in style!',
    outfits:[
      {name:'Raven Black',      cost:40,  shirt:'#0d0d0d', pants:'#0d0d0d', shoes:'#1a1a1a'},
      {name:'Blood Velvet',     cost:55,  shirt:'#4a0e0e', pants:'#1a0505', shoes:'#2a0a0a'},
      {name:'Purple Reign',     cost:70,  shirt:'#2e0854', pants:'#1a0330', shoes:'#150220'},
      {name:'Lace Widow',       cost:90,  shirt:'#1a1a2e', pants:'#0d0d1a', shoes:'#2a2a3a'},
      {name:'Vampire Royalty',  cost:130, shirt:'#3a0000', pants:'#0d0d0d', shoes:'#6b0000'},
    ]},
  { id:'cottagecore', category:'Cottagecore', emoji:'🌼',
    nameTemplates:['{word} Cottage Closet','The {word} Meadow Shop','{word} Pastoral Wear','{word} Farmhouse Threads'],
    nameWords:['Meadow','Wildflower','Honeysuckle','Buttercup'], ad:'Simple, sweet, and homegrown!',
    outfits:[
      {name:'Sage Meadow',   cost:30, shirt:'#a8c090', pants:'#f0e6d2', shoes:'#d4c4a8'},
      {name:'Wildflower',    cost:35, shirt:'#e8b4c0', pants:'#f5e8d0', shoes:'#ffffff'},
      {name:'Honey Harvest', cost:40, shirt:'#e8b04a', pants:'#d4a86a', shoes:'#8b6b3a'},
      {name:'Cream Linen',   cost:50, shirt:'#f5ecd8', pants:'#e0d4b8', shoes:'#c4a878'},
      {name:'Rose Garden',   cost:60, shirt:'#d88a9a', pants:'#f0e0d0', shoes:'#ffffff'},
    ]},
  { id:'cyberpunk', category:'Cyberpunk', emoji:'🤖',
    nameTemplates:['{word} Cyber Outfitters','The {word} Chrome Shop','{word} Neon Circuit Wear','{word} Digital Threads'],
    nameWords:['Chrome','Circuit','Byte','Glitch'], ad:'Jack in and gear up!',
    outfits:[
      {name:'Chrome Black',   cost:60,  shirt:'#0d0d0d', pants:'#1a1a1a', shoes:'#00ffff'},
      {name:'Neon Trim',      cost:75,  shirt:'#111111', pants:'#0d0d0d', shoes:'#ff00ff'},
      {name:'Circuit Board',  cost:90,  shirt:'#0a1a1a', pants:'#050d0d', shoes:'#00ff88'},
      {name:'Glitch Pink',    cost:105, shirt:'#1a0a1a', pants:'#0d050d', shoes:'#ff0088'},
      {name:'Hacker Elite',   cost:140, shirt:'#050505', pants:'#0a0a0a', shoes:'#00ccff'},
    ]},
  { id:'retro80s', category:'Retro 80s', emoji:'📼',
    nameTemplates:['{word} Retro Wear','The {word} Arcade Closet','{word} Synthwave Shop','{word} Flashback Threads'],
    nameWords:['Neon','Cassette','Turbo','Rewind'], ad:'Totally radical threads!',
    outfits:[
      {name:'Hot Pink',         cost:35, shirt:'#ff2e88', pants:'#1a1a2e', shoes:'#00e5ff'},
      {name:'Cyan Dream',       cost:45, shirt:'#00e5ff', pants:'#1a1a2e', shoes:'#ff2e88'},
      {name:'Purple Rain',      cost:55, shirt:'#a020f0', pants:'#2a0a4a', shoes:'#ffcc00'},
      {name:'Sunset Grid',      cost:65, shirt:'#ff6b35', pants:'#4a0a5a', shoes:'#ffcc00'},
      {name:'Neon Windbreaker', cost:80, shirt:'#39ff14', pants:'#1a1a2e', shoes:'#ff2e88'},
    ]},
  { id:'safari', category:'Safari', emoji:'🦁',
    nameTemplates:['{word} Safari Outfitters','The {word} Expedition Shop','{word} Adventure Wear','{word} Trailblazer Gear'],
    nameWords:['Savanna','Trek','Ranger','Horizon'], ad:'Ready for the next adventure!',
    outfits:[
      {name:'Khaki Explorer',    cost:40, shirt:'#c2a878', pants:'#8a7248', shoes:'#5a4a2a'},
      {name:'Savanna Tan',       cost:50, shirt:'#d4b896', pants:'#a68a5c', shoes:'#4a3a20'},
      {name:'Jungle Green',      cost:60, shirt:'#5a7a3a', pants:'#3a5a28', shoes:'#2a3a1a'},
      {name:'Sunburnt Orange',   cost:70, shirt:'#d4783a', pants:'#8a6040', shoes:'#4a3020'},
      {name:"Explorer's Vest",   cost:85, shirt:'#a8926a', pants:'#6a5838', shoes:'#3a2e1a'},
    ]},
  { id:'nautical', category:'Nautical', emoji:'⚓',
    nameTemplates:['{word} Nautical Wear','The {word} Sailor Shop','{word} Anchor Boutique','{word} Seafarer Threads'],
    nameWords:['Anchor','Harbor','Tide','Compass'], ad:'Set sail in style!',
    outfits:[
      {name:'Navy Stripe',    cost:35, shirt:'#1a3a6a', pants:'#ffffff', shoes:'#1a3a6a'},
      {name:'White Sail',     cost:40, shirt:'#ffffff', pants:'#1a3a6a', shoes:'#ffffff'},
      {name:'Red Buoy',       cost:45, shirt:'#c0392b', pants:'#ffffff', shoes:'#1a3a6a'},
      {name:"Captain's Coat", cost:55, shirt:'#0d2244', pants:'#0d2244', shoes:'#FFD700'},
      {name:'Admiral Gold',   cost:90, shirt:'#0d2244', pants:'#0d2244', shoes:'#FFD700'},
    ]},
  { id:'western', category:'Western', emoji:'🤠',
    nameTemplates:['{word} Western Wear','The {word} Saloon Shop','{word} Frontier Outfitters','{word} Rodeo Threads'],
    nameWords:['Prairie','Outlaw','Canyon','Wrangler'], ad:'Yeehaw, partner!',
    outfits:[
      {name:'Denim Drifter',  cost:35, shirt:'#3a5a7a', pants:'#2a3a5a', shoes:'#5a3a1a'},
      {name:'Desert Duster',  cost:45, shirt:'#c2a670', pants:'#8a6a48', shoes:'#4a3020'},
      {name:'Canyon Sunset',  cost:60, shirt:'#c2703a', pants:'#4a2f18', shoes:'#2a1a0d'},
      {name:'Leather Outlaw', cost:55, shirt:'#6b4423', pants:'#4a2f18', shoes:'#2a1a0d'},
      {name:"Sheriff's Star", cost:70, shirt:'#2a2a2a', pants:'#1a1a1a', shoes:'#5a3a1a'},
    ]},
  { id:'harvest', category:'Harvest', emoji:'🍂',
    nameTemplates:['{word} Harvest Wear','The {word} Autumn Shop','{word} Orchard Outfitters','{word} Pumpkin Patch Threads'],
    nameWords:['Maple','Cider','Amber','Hazel'], ad:'Cozy vibes, falling leaves!',
    outfits:[
      {name:'Pumpkin Spice',  cost:30, shirt:'#d4711a', pants:'#6b3a1a', shoes:'#4a2a10'},
      {name:'Amber Gold',     cost:45, shirt:'#d4a020', pants:'#8a6410', shoes:'#4a3608'},
      {name:'Cinnamon Brown', cost:50, shirt:'#7a4a28', pants:'#4a2e18', shoes:'#2a1a0d'},
      {name:'Maple Red',      cost:40, shirt:'#a8321e', pants:'#4a1810', shoes:'#2a0d08'},
      {name:'Harvest Moon',   cost:65, shirt:'#e08a3a', pants:'#6b4423', shoes:'#3a2410'},
    ]},
  { id:'galaxy', category:'Galaxy', emoji:'🌌',
    nameTemplates:['{word} Galaxy Wear','The {word} Cosmic Shop','{word} Nebula Outfitters','{word} Starlight Threads'],
    nameWords:['Nebula','Orbit','Comet','Stardust'], ad:'Out of this world style!',
    outfits:[
      {name:'Deep Space',     cost:50,  shirt:'#0a0a2a', pants:'#050515', shoes:'#6644aa'},
      {name:'Nebula Purple',  cost:65,  shirt:'#4a1a7a', pants:'#2a0d4a', shoes:'#aa66ff'},
      {name:'Comet Blue',     cost:95,  shirt:'#1a4a8a', pants:'#0d2a4a', shoes:'#66aaff'},
      {name:'Stardust Silver',cost:80,  shirt:'#8a8aaa', pants:'#4a4a6a', shoes:'#ccccee'},
      {name:'Supernova',      cost:130, shirt:'#ffcc44', pants:'#4a1a7a', shoes:'#ff6644'},
    ]},
  { id:'candypop', category:'Candy Pop', emoji:'🍬',
    nameTemplates:['{word} Candy Shop','The {word} Sweet Boutique','{word} Sugar Rush Wear','{word} Lollipop Threads'],
    nameWords:['Sprinkle','Gumdrop','Bubblegum','Lolli'], ad:'Sweet style, sugar rush!',
    outfits:[
      {name:'Bubblegum Pink', cost:25, shirt:'#ff69b4', pants:'#ffffff', shoes:'#ff69b4'},
      {name:'Lemon Drop',     cost:30, shirt:'#fff44f', pants:'#ffffff', shoes:'#fff44f'},
      {name:'Grape Fizz',     cost:35, shirt:'#a64ac9', pants:'#ffffff', shoes:'#a64ac9'},
      {name:'Mint Chip',      cost:40, shirt:'#4ac9a6', pants:'#ffffff', shoes:'#4ac9a6'},
      {name:'Rainbow Swirl',  cost:55, shirt:'#ff69b4', pants:'#4ac9a6', shoes:'#fff44f'},
    ]},
];
// 20 categories x 4 name variations = 80 shops. Every shop in a category shares that
// category's outfit list (see comment above) so `outfits` is just a reference, not a copy.
function generateOutfitShops() {
  const shops = [];
  OUTFIT_CATEGORIES.forEach(cat => {
    cat.nameTemplates.forEach((tpl, k) => {
      shops.push({
        id: 'outfit_' + cat.id + '_' + k,
        name: tpl.replace('{word}', cat.nameWords[k]),
        category: cat.category, emoji: cat.emoji, ad: cat.ad, outfits: cat.outfits,
      });
    });
  });
  return shops;
}
let OUTFIT_SHOPS = []; // filled by buildOutfitShopWing() — 40 shop objects, looked up by id from openOutfitBoutique()
// Builds the "Fashion Wing" through a new doorway in the mall atrium's LEFT wall, extending
// further west (more negative x). Same reasoning as the Shopping Wing (item 109): this pocket
// interior now lives in its own isolated 10,000-unit lane (item 110), so there's nothing out
// there to run into in any direction — verified by construction, not by re-checking neighbors.
// 8 cols x 10 rows = 80 storefronts (widened from 40 for item ~235's 10 new outfit categories),
// axes swapped from buildMallShopWing (this wing runs along X, storefronts face +x back toward
// the doorway) since it extends west instead of south. Depth widened 120->160 so row 9 (the
// farthest row at 10 rows) still sits a real ~23 units clear of the far wall — this whole
// interior lives in its own isolated 10,000-unit lane (see the entrance-doorway comment above),
// so extending it further out has nothing else nearby to run into.
function buildOutfitShopWing() {
  OUTFIT_SHOPS = generateOutfitShops();
  const mx = MALL_SPAWN.x, mz = 0;
  const X0 = mx - 33, FAR = mx - 33 - 160, HALF_D = 60;
  const depth = X0 - FAR, centerX = (X0 + FAR) / 2;

  box(depth, 0.1, HALF_D * 2, 0xf5f5f0, centerX, 0, mz);
  box(depth, 0.4, HALF_D * 2, 0xeeeeee, centerX, 11, mz);
  box(depth, 11, 0.5, 0xe8e8e8, centerX, 5.5, mz - HALF_D);
  box(depth, 11, 0.5, 0xe8e8e8, centerX, 5.5, mz + HALF_D);
  box(0.5, 11, HALF_D * 2, 0xe8e8e8, FAR, 5.5, mz);
  addCol(MALL_COLS, centerX, mz - HALF_D, depth / 2, 1);
  addCol(MALL_COLS, centerX, mz + HALF_D, depth / 2, 1);
  addCol(MALL_COLS, FAR, mz, 1, HALF_D);

  const FCOLS = 8, FCOL_SPACING = 11, FROW_SPACING = 13;
  // Each shop gets a real 2-color theme (pastel body + a deeper accent of the same hue for the
  // roof trim and logo ring), not just one flat color repeated everywhere on the storefront.
  const THEMES = [
    { wall:0xF4C2C2, accent:0xE08A8A }, { wall:0xC2D4F4, accent:0x7A9EDD },
    { wall:0xD8C2F4, accent:0xA47ADD }, { wall:0xC2F4D8, accent:0x6ADD9E },
    { wall:0xF4E2C2, accent:0xDDB56A }, { wall:0xC2F4F0, accent:0x6ADDD5 },
    { wall:0xF4C2E2, accent:0xDD6ABA }, { wall:0xE0E0E0, accent:0xA0A0A0 },
  ];
  OUTFIT_SHOPS.forEach((shop, i) => {
    const col = i % FCOLS, row = Math.floor(i / FCOLS);
    const z = mz + (col - (FCOLS - 1) / 2) * FCOL_SPACING;
    const x = X0 - 20 - row * FROW_SPACING;
    const theme = THEMES[i % THEMES.length];

    box(5, 4.5, 7, theme.wall, x, 2.25, z);              // body
    box(6, 0.4, 8, theme.accent, x, 4.7, z);             // roof cap
    box(0.15, 2.2, 4.5, 0xAEE3FF, x + 2.55, 1.6, z);    // glass front, facing back toward the doorway
    buildLogoSign(shop.name, shop.emoji, '#'+theme.wall.toString(16).padStart(6,'0'), '#'+theme.accent.toString(16).padStart(6,'0'), x + 2.7, 5, z, -Math.PI / 2);

    addCol(MALL_COLS, x, z, 3, 3.8);
    MALL_ZONES.push({ x: x + 3, z, r: 3.2, label: `${shop.emoji} ${shop.name}`, action: () => openOutfitBoutique(shop.id) });
  });

  for (let r = 0; r < 10; r++) {
    const pl = new THREE.PointLight(0xfff5e0, 0.3, 20);
    pl.position.set(X0 - 20 - r * FROW_SPACING, 9.5, mz);
    scene.add(pl);
  }
}
// Opens the SAME shopOverlay/shopItems DOM the original single Outfit Shop already used —
// generalized to show one specific boutique's outfit list instead of the hardcoded global
// OUTFITS array. Buying still does the real thing: recolors your actual character.
function openOutfitBoutique(id) {
  const shop = OUTFIT_SHOPS.find(s => s.id === id);
  if (!shop) return;
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  startShopPreviewLoop();
  document.getElementById('shopOverlay').style.display = 'flex';
  document.getElementById('shopTitle').textContent = `${shop.emoji} ${shop.name}`;
  const items = document.getElementById('shopItems');
  const workingHere = activeJob === `${shop.emoji} ${shop.name}`;
  const shopBusy = !workingHere && (!!activeJob || !!activeBankJob);
  items.innerHTML = `<div style="text-align:center;color:#ffd54a;font-style:italic;font-size:12px;margin-bottom:8px;">"${shop.ad}"</div>
    <button ${shopBusy ? 'disabled' : ''} onclick="${workingHere ? "quitJob('Stopped working.')" : `startShopJob('${shop.id}')`};closeShop()" style="width:100%;padding:8px;margin-bottom:10px;background:${workingHere ? '#7a1a1a' : shopBusy ? '#333' : '#1a5a7a'};border:none;border-radius:8px;color:#fff;font-weight:bold;font-size:12px;cursor:${shopBusy ? 'not-allowed' : 'pointer'};opacity:${shopBusy ? '0.5' : '1'};">${workingHere ? '⏹ Stop Working Here' : `💼 Work Here (+${shopJobPay(shop)} S.I.P./task)`}</button>`;
  shop.outfits.forEach((o, i) => {
    const d = document.createElement('div'); d.className = 'shopItem';
    const safeName = o.name.replace(/'/g, "\\'");
    d.innerHTML = `<div class="siName">${o.name}</div>
      <div class="siCost">💰 ${o.cost} S.I.P.</div>
      <div class="siSwatch" style="display:flex;gap:4px;margin:4px 0">
        <div style="width:18px;height:18px;background:${o.shirt};border-radius:3px"></div>
        <div style="width:18px;height:18px;background:${o.pants};border-radius:3px"></div>
        <div style="width:18px;height:18px;background:${o.shoes};border-radius:3px"></div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="shopBtn" onclick="renderShopPreview({shirt:'${o.shirt}',pants:'${o.pants}',shoes:'${o.shoes}'},'${safeName}')" style="background:#2a4a5a;">👁 Preview</button>
        <button class="shopBtn" onclick="buyBoutiqueOutfit('${shop.id}',${i})">Buy</button>
      </div>`;
    items.appendChild(d);
  });
}
function buyBoutiqueOutfit(shopId, i) {
  const shop = OUTFIT_SHOPS.find(s => s.id === shopId);
  if (!shop) return;
  const o = shop.outfits[i];
  if (sipDollars < o.cost) { showNotif(`❌ Need ${o.cost} S.I.P.`); return; }
  spendSip(o.cost); updateSIP();
  playerColors.shirt = o.shirt; playerColors.pants = o.pants; playerColors.shoes = o.shoes;
  document.getElementById('shirtColor').value = o.shirt;
  document.getElementById('pantsColor').value = o.pants;
  document.getElementById('shoeColor').value  = o.shoes;
  showNotif(`✅ Wearing ${o.name}!`);
  saveCurrentUser();
  closeShop();
}
function equipWeapon(id) {
  const need = weaponRequiredLevel(id);
  if (need > eliteLevel) { showNotif(`🔒 Requires Robot Level ${need} (you're Lv.${eliteLevel}) — level up in the Quests tab!`); return false; }
  playerWeapon = id;
  updateWeaponMesh();
  saveCurrentUser();
  return true;
}
// ─── 50-WEAPON SHOP — item ~235, user: "make a weapon shop withe 50 weapons that look different".
// The original 11 weapons (bat/sword/axe/etc. below) are each a hand-built THREE.Group — real
// shape variety, not palette swaps. Hand-building 47 MORE of those one at a time isn't
// realistic, so this is the same "one real archetype, many material/color variants" scaling
// trick the game already uses elsewhere for large item counts (robot shapes, boss silhouettes):
// 15 genuinely different silhouettes (shortsword/longsword/dagger/axe/doubleaxe/hammer/
// warhammer/mace/spear/trident/scythe/club/staff/claw/cleaver), each 2-4 primitives — same
// complexity level as the hand-built ones below — then WEAPON_VISUALS pairs an archetype with a
// real color+accent(+glow) per weapon. updateWeaponMesh() checks WEAPON_VISUALS FIRST so the
// original 11 ids keep their exact existing hand-built look untouched below.
function buildWeaponArchetype(archetype, c1, c2, glow, scale) {
  const g = new THREE.Group();
  const mkMat = (color) => new THREE.MeshLambertMaterial(glow ? {color, emissive:glow} : {color});
  const add = (geo, color, x,y,z, rz) => { const m = new THREE.Mesh(geo, mkMat(color)); m.position.set(x,y,z); if(rz) m.rotation.z=rz; g.add(m); return m; };
  switch(archetype) {
    case 'shortsword':
      add(new THREE.BoxGeometry(0.06,0.7,0.08), c1, 0,0.15,0);
      add(new THREE.BoxGeometry(0.3,0.05,0.05), c2, 0,-0.22,0);
      break;
    case 'longsword':
      add(new THREE.BoxGeometry(0.07,1.05,0.09), c1, 0,0.25,0);
      add(new THREE.BoxGeometry(0.42,0.06,0.06), c2, 0,-0.3,0);
      add(new THREE.ConeGeometry(0.05,0.15,4), c1, 0,0.8,0);
      break;
    case 'dagger':
      add(new THREE.BoxGeometry(0.045,0.4,0.05), c1, 0,0.08,0);
      add(new THREE.BoxGeometry(0.16,0.05,0.05), c2, 0,-0.16,0);
      break;
    case 'axe':
      add(new THREE.BoxGeometry(0.08,0.75,0.08), c2, 0,0,0);
      add(new THREE.BoxGeometry(0.4,0.3,0.08), c1, 0.17,0.37,0);
      break;
    case 'doubleaxe':
      add(new THREE.BoxGeometry(0.09,0.95,0.09), c2, 0,0,0);
      add(new THREE.BoxGeometry(0.32,0.4,0.07), c1, -0.19,0.4,0);
      add(new THREE.BoxGeometry(0.32,0.4,0.07), c1, 0.19,0.4,0);
      break;
    case 'hammer':
      add(new THREE.BoxGeometry(0.09,0.8,0.09), c2, 0,0,0);
      add(new THREE.BoxGeometry(0.36,0.26,0.26), c1, 0,0.4,0);
      break;
    case 'warhammer':
      add(new THREE.BoxGeometry(0.1,0.95,0.1), c2, 0,0,0);
      add(new THREE.BoxGeometry(0.44,0.32,0.32), c1, 0,0.46,0);
      add(new THREE.ConeGeometry(0.09,0.28,4), c2, 0,0.46,-0.22, Math.PI/2);
      break;
    case 'mace':
      add(new THREE.BoxGeometry(0.08,0.75,0.08), c2, 0,0,0);
      add(new THREE.SphereGeometry(0.2,8,8), c1, 0,0.42,0);
      [0,1,2,3,4].forEach(i=>{ const a=i*Math.PI*2/5; add(new THREE.ConeGeometry(0.04,0.14,4), c2, Math.cos(a)*0.2,0.42,Math.sin(a)*0.2); });
      break;
    case 'spear':
      add(new THREE.BoxGeometry(0.06,1.2,0.06), c2, 0,0,0);
      add(new THREE.ConeGeometry(0.07,0.35,6), c1, 0,0.75,0);
      break;
    case 'trident':
      add(new THREE.BoxGeometry(0.06,1.1,0.06), c2, 0,0,0);
      [-0.12,0,0.12].forEach(dx=>add(new THREE.ConeGeometry(0.04,0.3,4), c1, dx,0.75,0));
      break;
    case 'scythe':
      add(new THREE.BoxGeometry(0.06,1.1,0.06), c2, 0,0,0);
      add(new THREE.BoxGeometry(0.5,0.08,0.05), c1, 0.2,0.55,0, 0.6);
      break;
    case 'club':
      add(new THREE.BoxGeometry(0.1,0.55,0.1), c2, 0,0,0);
      add(new THREE.BoxGeometry(0.24,0.42,0.24), c1, 0,0.42,0);
      break;
    case 'staff':
      add(new THREE.BoxGeometry(0.055,1.15,0.055), c2, 0,0,0);
      add(new THREE.SphereGeometry(0.14,8,8), c1, 0,0.68,0);
      break;
    case 'claw':
      [-0.1,0,0.1].forEach(dx=>add(new THREE.ConeGeometry(0.035,0.5,4), c1, dx,0.2,0));
      add(new THREE.BoxGeometry(0.24,0.15,0.14), c2, 0,-0.15,0);
      break;
    case 'cleaver':
      add(new THREE.BoxGeometry(0.06,0.5,0.05), c2, 0,-0.1,0);
      add(new THREE.BoxGeometry(0.38,0.5,0.06), c1, 0.12,0.28,0);
      break;
  }
  g.scale.setScalar(scale || 1);
  return g;
}
// Pure mesh builder, extracted from updateWeaponMesh() so the shop preview panel can build the
// exact same weapon visual into an isolated group without touching the real player's weaponGroup.
function buildWeaponVisual(weaponId) {
  if(!weaponId || weaponId==='none') return null;
  if (WEAPON_VISUALS[weaponId]) {
    const v = WEAPON_VISUALS[weaponId];
    return buildWeaponArchetype(v.archetype, v.color, v.accent, v.glow, v.scale);
  }
  const g = new THREE.Group();
  if(weaponId==='bat') {
    const m=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.0,0.12),new THREE.MeshLambertMaterial({color:0x8B4513}));
    g.add(m);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.14,6,6),new THREE.MeshLambertMaterial({color:0x8B4513}));
    cap.position.set(0,0.55,0); g.add(cap);
  } else if(weaponId==='sword') {
    const blade=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.9,0.08),new THREE.MeshLambertMaterial({color:0xdddddd}));
    blade.position.set(0,0.15,0); g.add(blade);
    const guard=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.06,0.06),new THREE.MeshLambertMaterial({color:0xaa8800}));
    guard.position.set(0,-0.3,0); g.add(guard);
  } else if(weaponId==='axe') {
    const handle=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.8,0.08),new THREE.MeshLambertMaterial({color:0x5c3a1e}));
    g.add(handle);
    const head=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.32,0.08),new THREE.MeshLambertMaterial({color:0x888888}));
    head.position.set(0.18,0.4,0); g.add(head);
  } else if(weaponId==='metalsword') {
    const blade=new THREE.Mesh(new THREE.BoxGeometry(0.09,1.1,0.1),new THREE.MeshLambertMaterial({color:0xeeeeee}));
    blade.position.set(0,0.2,0); g.add(blade);
    const guard=new THREE.Mesh(new THREE.BoxGeometry(0.46,0.08,0.08),new THREE.MeshLambertMaterial({color:0x667788}));
    guard.position.set(0,-0.35,0); g.add(guard);
  } else if(weaponId==='battleaxe') {
    const handle=new THREE.Mesh(new THREE.BoxGeometry(0.09,1.0,0.09),new THREE.MeshLambertMaterial({color:0x4a3520}));
    g.add(handle);
    const headL=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.42,0.07),new THREE.MeshLambertMaterial({color:0x99aabb}));
    headL.position.set(-0.2,0.42,0); g.add(headL);
    const headR=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.42,0.07),new THREE.MeshLambertMaterial({color:0x99aabb}));
    headR.position.set(0.2,0.42,0); g.add(headR);
  } else if(weaponId==='crystalsword') {
    const blade=new THREE.Mesh(new THREE.BoxGeometry(0.1,1.15,0.1),new THREE.MeshLambertMaterial({color:0x99eeff, emissive:0x2266aa}));
    blade.position.set(0,0.22,0); g.add(blade);
    const tip=new THREE.Mesh(new THREE.ConeGeometry(0.09,0.25,4),new THREE.MeshLambertMaterial({color:0xccf5ff, emissive:0x3388cc}));
    tip.position.set(0,0.92,0); g.add(tip);
    const guard=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.08,0.08),new THREE.MeshLambertMaterial({color:0xffd700}));
    guard.position.set(0,-0.35,0); g.add(guard);
  } else if(weaponId==='emphammer') {
    const handle=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.85,0.09),new THREE.MeshLambertMaterial({color:0x336677}));
    g.add(handle);
    const head=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.28,0.28),new THREE.MeshLambertMaterial({color:0x00ffcc, emissive:0x00aa88}));
    head.position.set(0,0.42,0); g.add(head);
  } else if(weaponId==='plasmacutter') {
    const handle=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.55,0.1),new THREE.MeshLambertMaterial({color:0x333333}));
    g.add(handle);
    const blade=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.7,6),new THREE.MeshLambertMaterial({color:0xff6600, emissive:0xcc3300}));
    blade.position.set(0,0.55,0); g.add(blade);
  } else if(weaponId==='railspike') {
    const handle=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.6,0.1),new THREE.MeshLambertMaterial({color:0x445566}));
    g.add(handle);
    const spike=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.9,4),new THREE.MeshLambertMaterial({color:0x8899ff, emissive:0x3344aa}));
    spike.position.set(0,0.75,0); g.add(spike);
  } else if(weaponId==='club') {
    const handle=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.55,0.1),new THREE.MeshLambertMaterial({color:0x6b4423}));
    g.add(handle);
    const head=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.4,0.22),new THREE.MeshLambertMaterial({color:0x8B5A2B}));
    head.position.set(0,0.45,0); g.add(head);
  } else if(weaponId==='stiletto') {
    const blade=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.65,0.04),new THREE.MeshLambertMaterial({color:0x888899}));
    blade.position.set(0,0.1,0); g.add(blade);
    const tip=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.14,0.04),new THREE.MeshLambertMaterial({color:0xaaaacc}));
    tip.position.set(0,0.44,0); g.add(tip);
    const hilt=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.06,0.06),new THREE.MeshLambertMaterial({color:0x111122}));
    hilt.position.set(0,-0.22,0); g.add(hilt);
  }
  g.position.set(0.7,1.0,0.2); g.rotation.z=-0.2;
  return g;
}
function updateWeaponMesh() {
  if(!playerGroup) return;
  if(player.weaponGroup) { playerGroup.remove(player.weaponGroup); player.weaponGroup=null; }
  const g = buildWeaponVisual(playerWeapon);
  if(!g) return;
  playerGroup.add(g); player.weaponGroup=g;
}

// ─── SHOP SYSTEM ─────────────────────────────────────────────────────────────
const ITEM_INFO = {
  'Coffee Shop':  { emoji:'☕', id:'coffee'    },
  'Toy Store':    { emoji:'🧸', id:'toy'       },
  'Pizza Place':  { emoji:'🍕', id:'pizza'     },
  'Jewelry':      { emoji:'💍', id:'jewelry'   },
  'Phone':        { emoji:'📱', id:'phone'     },
  'Ice Cream':    { emoji:'🍦', id:'ice_cream' },
};
// Real emoji per item name for all ~300 items sold across the 25 SHOP_CATEGORIES
// (CITY_SHOPS + MALL_SHOPS) — previously every one of these fell back to a plain
// 📦 in buyItem(). Keyed by item name (matches SHOP_CATEGORIES[*].items exactly);
// a few item names repeat across categories (e.g. "Glitter Glue"), which just
// means they share one entry here, same emoji either way.
const SHOP_ITEM_EMOJI = {
  'Building Blocks':'🧱', 'Action Figures':'🦸', 'Board Games':'🎲', 'Jigsaw Puzzles':'🧩',
  'Stuffed Animals':'🧸', 'Remote Control Cars':'🚗', 'Dolls':'🪆', 'Art Sets':'🎨',
  'Science Kits':'🔬', 'Yo-Yos':'🪀', 'Kites':'🪁', 'Card Games':'🃏',
  'Puppy Leash':'🐕', 'Cat Scratching Post':'🐈', 'Goldfish Tank':'🐠', 'Hamster Wheel':'🐹',
  'Bird Cage':'🐦', 'Dog Chew Toy':'🦴', 'Catnip Mice':'🐭', 'Rabbit Hutch':'🐰',
  'Pet Food Bowl':'🥣', 'Turtle Terrarium':'🐢', 'Bunny Treats':'🥕', 'Squeaky Bone':'🦴',
  'Comic Books':'📖', 'Picture Books':'📕', 'Adventure Novels':'📗', 'Mystery Stories':'🔍',
  'Fairy Tale Collection':'🧚', 'Coloring Books':'🖍️', 'Joke Books':'😂', 'Encyclopedia Set':'📚',
  'Poetry Books':'✒️', 'Graphic Novels':'📔', 'Bookmarks':'🔖', 'Magic Trick Guide':'🎩',
  'Gummy Bears':'🐻', 'Lollipops':'🍭', 'Chocolate Bars':'🍫', 'Cotton Candy':'🍬',
  'Candy Canes':'🍬', 'Jelly Beans':'🫘', 'Caramel Apples':'🍎', 'Bubble Gum':'🍬',
  'Sour Worms':'🐛', 'Rock Candy':'💎', 'Marshmallow Pops':'🍡', 'Fudge Squares':'🍫',
  'Soccer Ball':'⚽', 'Basketball':'🏀', 'Baseball Glove':'⚾', 'Tennis Racket':'🎾',
  'Skateboard':'🛹', 'Bicycle Helmet':'⛑️', 'Swim Goggles':'🥽', 'Jump Rope':'🪢',
  'Hockey Stick':'🏒', 'Football':'🏈', 'Running Shoes':'👟', 'Water Bottle':'🧴',
  'Colored Pencils':'✏️', 'Watercolor Paint Set':'🎨', 'Sketchbook':'📓', 'Modeling Clay':'🏺',
  'Glitter Glue':'✨', 'Paintbrush Set':'🖌️', 'Crayons':'🖍️', 'Construction Paper':'📄',
  'Safety Scissors':'✂️', 'Stickers':'🏷️', 'Easel':'🖼️', 'Chalk Pastels':'🎨',
  'Ukulele':'🎸', 'Recorder Flute':'🪈', 'Toy Drum Set':'🥁', 'Keyboard Piano':'🎹',
  'Kids Guitar':'🎸', 'Tambourine':'🪘', 'Xylophone':'🎶', 'Maracas':'🪇',
  'Harmonica':'🎵', 'Music Note Stickers':'🎵', 'Songbook':'📔', 'Headphones':'🎧',
  'Light-Up Sneakers':'👟', 'Rain Boots':'🥾', 'Velcro Sneakers':'👟', 'High-Top Basketball Shoes':'👟',
  'Glitter Flip-Flops':'🩴', 'Soccer Cleats':'👟', 'Fuzzy Slippers':'🥿', 'Roller Sneakers':'🛼',
  'Hiking Boots':'🥾', 'Ballet Flats':'🥿', 'Superhero Sneakers':'👟', 'Sparkly Sandals':'👡',
  'Wireless Headphones':'🎧', 'Tablet Case':'📱', 'Handheld Game Console':'🎮', 'Bluetooth Speaker':'🔊',
  'Smartwatch':'⌚', 'Phone Charger':'🔌', 'Remote Control Car':'🚗', 'Digital Camera':'📷',
  'Gaming Mouse':'🖱️', 'LED Desk Lamp':'💡', 'Walkie-Talkies':'📻', 'Karaoke Microphone':'🎤',
  'Superhero Comic Book':'🦸', 'Graphic Novel':'📔', 'Trading Card Pack':'🃏', 'Action Figure':'🦸',
  'Comic Poster':'🖼️', 'Villain Sticker Sheet':'🦹', 'Cape Costume':'🦸', "Collector's Comic Box":'🗃️',
  'Comic Bookmark':'🔖', 'Hero Mask':'🎭', 'Comic Backpack Pin':'📌', 'Mini Comic Figurine':'🧍',
  'Chocolate Chip Cookie':'🍪', 'Rainbow Cupcake':'🧁', 'Birthday Cake Slice':'🍰', 'Cinnamon Roll':'🥐',
  'Blueberry Muffin':'🧁', 'Glazed Donut':'🍩', 'Sugar Cookie':'🍪', 'Fresh Bagel':'🥯',
  'Fruit Tart':'🥧', 'Soft Pretzel':'🥨', 'Gingerbread Cookie':'🍪', 'Strawberry Cake Pop':'🍓',
  'Birthday Card':'💌', 'Gift Wrap Roll':'🎁', 'Stuffed Teddy Bear':'🧸', 'Scented Candle':'🕯️',
  'Photo Frame':'🖼️', 'Balloon Bouquet':'🎈', 'Gift Bag':'🛍️', 'Greeting Card Set':'💌',
  'Mini Trophy':'🏆', 'Keychain Charm':'🔑', 'Party Confetti Poppers':'🎉', 'Thank-You Notecards':'💌',
  'Yarn Skein':'🧶', 'Sticker Sheet Pack':'🏷️', 'Pom-Pom Bag':'🎀', 'Craft Scissors':'✂️',
  'Beading Kit':'📿', 'Origami Paper Pack':'📄', 'Pipe Cleaners Bundle':'🧵', 'Popsicle Sticks Box':'🪵',
  'Skateboard Deck':'🛹', 'Skateboard Wheels':'🛞', 'Skateboard Trucks':'🔩', 'Helmet':'⛑️',
  'Knee Pads':'🛡️', 'Elbow Pads':'🛡️', 'Wrist Guards':'🛡️', 'Grip Tape':'🩹',
  'Longboard':'🛹', 'Scooter':'🛴', 'Skate Shoes':'👟', 'Bearings Set':'⚙️',
  'Balloon Bundle':'🎈', 'Confetti Poppers':'🎉', 'Birthday Banner':'🎊', 'Paper Plates':'🍽️',
  'Party Hats':'🥳', 'Streamers':'🎊', 'Piñata':'🪅', 'Gift Bags':'🛍️',
  'Candles Pack':'🕯️', 'Noisemakers':'📯', 'Table Cloth':'🍽️', 'Party Favors':'🎁',
  'Model Airplane Kit':'✈️', '1000-Piece Puzzle':'🧩', 'Paint Set':'🎨', 'Building Blocks Set':'🧱',
  'Yarn Bundle':'🧶', 'Stamp Collection Kit':'📮', 'Train Set':'🚂', 'Rock Tumbler':'🪨',
  'Bead Kit':'📿', 'Telescope':'🔭',
  'Sundress':'👗', 'Graphic T-Shirt':'👕', 'Denim Jacket':'🧥', 'Sneakers':'👟',
  'Sun Hat':'👒', 'Sparkly Backpack':'🎒', 'Scarf':'🧣', 'Leggings':'👖',
  'Hair Clips':'🎀', 'Sunglasses':'🕶️', 'Friendship Bracelet Kit':'🧵', 'Cozy Hoodie':'🧥',
  'Video Game Console':'🎮', 'Controller':'🎮', 'Game Cartridge':'🕹️', 'Gaming Headset':'🎧',
  'Charging Dock':'🔌', 'Trading Card Game':'🃏', 'Handheld Console':'🎮', 'Game Poster':'🖼️',
  'Joystick':'🕹️', 'Memory Card':'💾', 'Gaming Chair':'🪑', 'Strategy Guide Book':'📘',
  'Sunflower Seeds Pack':'🌻', 'Potted Cactus':'🌵', 'Watering Can':'💦', 'Flower Pot':'🪴',
  'Succulent Trio':'🌱', 'Herb Garden Kit':'🌿', 'Bonsai Tree':'🌳', 'Fertilizer Bag':'🌾',
  'Garden Gloves':'🧤', 'Hanging Fern':'🌿', 'Tulip Bulbs':'🌷', 'Terrarium Kit':'🪴',
  'Friendship Bracelet':'📿', 'Charm Necklace':'📿', 'Star Stud Earrings':'⭐', 'Birthstone Ring':'💍',
  'Heart Locket':'💗', 'Beaded Anklet':'📿', 'Glitter Hair Pin':'✨', 'Rainbow Pendant':'🌈',
  'Pearl Hairband':'🦪', 'Mood Ring':'💍', 'Puzzle Piece Necklace':'🧩', 'Gem Cufflinks':'💎',
  'Bunk Bed':'🛏️', 'Bean Bag Chair':'🛋️', 'Study Desk':'🖥️', 'Bookshelf':'📚',
  'Rocking Chair':'🪑', 'Toy Chest':'🧰', 'Coffee Table':'🛋️', 'Dresser':'🗄️',
  'Nightstand':'🗄️', 'Floor Lamp':'💡', 'Storage Ottoman':'🪑', 'Comfy Sofa':'🛋️',
  'Glitter Phone Case':'📱', 'Pop-Up Grip Stand':'📱', 'Cartoon Charm Strap':'🔗', 'Screen Protector':'📱',
  'Wireless Earbuds':'🎧', 'Selfie Stick':'🤳', 'Phone Ring Holder':'📱', 'Cute Cable Cover':'🔌',
  'Portable Charger':'🔋', 'Sticker Pack':'🏷️', 'Camera Lens Clip':'📷', 'Glow-in-Dark Case':'🌟',
  'Sparkle Notebook':'📓', 'Gel Pen Set':'🖊️', 'Scented Eraser':'🧽', 'Sticker Sheet':'🏷️',
  'Washi Tape Roll':'🎗️', 'Colored Pencil Pack':'✏️', 'Bookmark Set':'🔖', 'Desk Organizer':'🗂️',
  'Stamp Kit':'📮', 'Mini Stapler':'📎', 'Rainbow Highlighters':'🖍️',
  'Goldfish':'🐠', 'Betta Fish':'🐟', 'Glass Fish Tank':'🐠', 'Colorful Gravel':'🪨',
  'Bubble Aerator':'🫧', 'Fish Food Flakes':'🐟', 'Mini Castle Decoration':'🏰', 'Aquarium Plant':'🌿',
  'Snail Buddy':'🐌', 'Net Scooper':'🥅', 'LED Tank Light':'💡', 'Fish Bowl Starter Kit':'🐠',
  'Kids Mountain Bike':'🚲', 'Training Wheels':'🚲', 'Bike Helmet':'⛑️', 'Handlebar Streamers':'🎗️',
  'Bike Bell':'🔔', 'Water Bottle Holder':'🧴', 'Kickstand':'🚲', 'Bike Basket':'🧺',
  'Reflective Stickers':'🏷️', 'Repair Kit':'🧰', 'Knee Pad Set':'🛡️', 'Bike Lock':'🔒',
};

function addToInventory(id, name, emoji) {
  if(playerInventory[id]) {
    playerInventory[id].qty++;
  } else {
    playerInventory[id] = { name, emoji, qty:1 };
  }
}

function buyItem(name, cost) {
  if(sipDollars < cost) { sfx.nope(); showNotif(`❌ Need ${cost} S.I.P. — you have ${sipDollars}`); return; }
  spendSip(cost);
  updateSIP();
  const special = ITEM_INFO[name];
  const emoji = (special && special.emoji) || SHOP_ITEM_EMOJI[name] || '📦';
  const id = (special && special.id) || name.toLowerCase().replace(/\s+/g,'_');
  addToInventory(id, name, emoji);
  saveCurrentUser();
  sfx.buy();
  showNotif(`✅ ${emoji} Bought ${name} for ${cost} S.I.P.!`);
}

