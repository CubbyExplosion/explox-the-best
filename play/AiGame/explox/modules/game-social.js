// ─── THE DINER — sit-down restaurant, buy a real meal & eat it ──────────────
const RESTAURANT_MENU = [
  { id:'burger',     name:'Burger',      emoji:'🍔', price:15, taste:'savory' },
  { id:'pizza_slice',name:'Pizza Slice', emoji:'🍕', price:12, taste:'savory' },
  { id:'pasta',      name:'Pasta',       emoji:'🍝', price:14, taste:'savory' },
  { id:'sushi',      name:'Sushi',       emoji:'🍣', price:18, taste:'savory' },
  { id:'taco',       name:'Taco',        emoji:'🌮', price:10, taste:'spicy'  },
  { id:'salad',      name:'Salad',       emoji:'🥗', price:8,  taste:'savory' },
  { id:'soup',       name:'Soup',        emoji:'🍲', price:9,  taste:'savory' },
  { id:'lemon_tart', name:'Lemon Tart',  emoji:'🍋', price:7,  taste:'sour'   },
  { id:'cake',       name:'Cake',        emoji:'🍰', price:11, taste:'sweet'  },
  { id:'coffee',     name:'Coffee',      emoji:'☕', price:5,  taste:'bitter' },
];
function openRestaurant() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('restaurantModal').style.display = 'flex';
  refreshRestaurantUI();
}
function closeRestaurant() {
  document.getElementById('restaurantModal').style.display = 'none';
  buffetActiveId = null; buffetPaid = false; // leaving a buffet ends that visit — re-entering means paying again, same as a real buffet
}
function refreshRestaurantUI() {
  const list = document.getElementById('restaurantList');
  list.innerHTML = '';
  RESTAURANT_MENU.forEach((def, i) => {
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name}</div>
      <div class="siCost">💰 ${def.price} S.I.P.</div>
      <button class="shopBtn" onclick="buyRestaurantFood(${i})">Order</button>`;
    list.appendChild(d);
  });
}
function buyRestaurantFood(idx) {
  const def = RESTAURANT_MENU[idx];
  if(sipDollars < def.price) { sfx.nope(); showNotif(`❌ Need ${def.price} S.I.P.!`); return; }
  spendSip(def.price); saveCurrentUser(); updateSIP();
  sfx.buy();
  addToBag(def);
}

// ─── 5 MORE RESTAURANTS — real sit-down spots, same order→bag→C-to-eat pipeline as The Diner ──
// Reuses the EXACT same restaurantModal/addToBag/eatFromBag/tasteReaction chain The Diner already
// proved (item 92) — just generalized to a per-restaurant menu instead of one hardcoded global one,
// same pattern used for the 40 outfit boutiques sharing one shopOverlay.
const RESTAURANT_LOCATIONS = [
  { id:'sushi_bar', name:'Sushi Bar', emoji:'🍣', x:-20, z:200, wall:0x2a3a4a, accent:0xE8A94A, glass:0x9fd8e8,
    menu:[
      { id:'nigiri',      name:'Nigiri Set',    emoji:'🍣', price:20, taste:'savory' },
      { id:'sushi_roll',  name:'Sushi Roll',    emoji:'🍱', price:16, taste:'savory' },
      { id:'miso_soup',   name:'Miso Soup',     emoji:'🍲', price:6,  taste:'savory' },
      { id:'edamame',     name:'Edamame',       emoji:'🫛', price:5,  taste:'savory' },
      { id:'wasabi_kick', name:'Extra Wasabi',  emoji:'🌶️', price:2,  taste:'spicy'  },
      { id:'mochi',       name:'Mochi',         emoji:'🍡', price:7,  taste:'sweet'  },
    ]},
  { id:'taco_cantina', name:'Taco Cantina', emoji:'🌮', x:20, z:260, wall:0xdd8833, accent:0x8B3A1A, glass:0xffeecc,
    menu:[
      { id:'street_taco', name:'Street Taco',   emoji:'🌮', price:9,  taste:'spicy'  },
      { id:'burrito',      name:'Burrito',      emoji:'🌯', price:14, taste:'savory' },
      { id:'nachos',       name:'Nachos',       emoji:'🧀', price:11, taste:'savory' },
      { id:'quesadilla',   name:'Quesadilla',   emoji:'🫓', price:12, taste:'savory' },
      { id:'salsa_hot',    name:'Hot Salsa',    emoji:'🔥', price:3,  taste:'spicy'  },
      { id:'churro',       name:'Churro',       emoji:'🥖', price:6,  taste:'sweet'  },
    ]},
  { id:'noodle_house', name:'Noodle House', emoji:'🍜', x:-20, z:320, wall:0xaa3333, accent:0xFFD34D, glass:0xffd8c0,
    menu:[
      { id:'ramen',        name:'Ramen',         emoji:'🍜', price:15, taste:'savory' },
      { id:'pad_thai',     name:'Pad Thai',      emoji:'🍝', price:14, taste:'savory' },
      { id:'dumplings',    name:'Dumplings',     emoji:'🥟', price:10, taste:'savory' },
      { id:'spring_roll',  name:'Spring Roll',   emoji:'🥢', price:7,  taste:'savory' },
      { id:'chili_oil',    name:'Chili Oil Kick',emoji:'🌶️', price:2,  taste:'spicy'  },
      { id:'bubble_tea',   name:'Bubble Tea',    emoji:'🧋', price:8,  taste:'sweet'  },
    ]},
  { id:'french_bistro', name:'French Bistro', emoji:'🥐', x:20, z:380, wall:0xe8dcc0, accent:0x2C4A6E, glass:0xcfe0ff,
    menu:[
      { id:'croissant',    name:'Croissant',     emoji:'🥐', price:6,  taste:'savory' },
      { id:'quiche',       name:'Quiche',        emoji:'🥧', price:13, taste:'savory' },
      { id:'onion_soup',   name:'Onion Soup',    emoji:'🍲', price:11, taste:'savory' },
      { id:'baguette',     name:'Baguette',      emoji:'🥖', price:5,  taste:'savory' },
      { id:'creme_brulee', name:'Crème Brûlée',  emoji:'🍮', price:12, taste:'sweet'  },
      { id:'espresso',     name:'Espresso',      emoji:'☕', price:5,  taste:'bitter' },
    ]},
  { id:'burger_shack', name:'Burger Shack', emoji:'🍔', x:-20, z:440, wall:0x883322, accent:0xF2C230, glass:0xffe8a0,
    menu:[
      { id:'classic_burger', name:'Classic Burger', emoji:'🍔', price:14, taste:'savory' },
      { id:'cheese_fries',   name:'Cheese Fries',   emoji:'🍟', price:9,  taste:'savory' },
      { id:'onion_rings',    name:'Onion Rings',    emoji:'🧅', price:8,  taste:'savory' },
      { id:'hot_dog',        name:'Hot Dog',        emoji:'🌭', price:10, taste:'savory' },
      { id:'milkshake',      name:'Milkshake',      emoji:'🥤', price:7,  taste:'sweet'  },
      { id:'pickle_spear',   name:'Pickle Spear',   emoji:'🥒', price:3,  taste:'sour'   },
    ]},
];
function openThemedRestaurant(id) {
  const r = RESTAURANT_LOCATIONS.find(r => r.id === id);
  if (!r) return;
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('restaurantModalTitle').textContent = `${r.emoji} ${r.name}`;
  document.getElementById('restaurantModal').style.display = 'flex';
  const list = document.getElementById('restaurantList');
  list.innerHTML = '';
  r.menu.forEach((def, i) => {
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name}</div>
      <div class="siCost">💰 ${def.price} S.I.P.</div>
      <button class="shopBtn" onclick="buyThemedFood('${r.id}',${i})">Order</button>`;
    list.appendChild(d);
  });
}
function buyThemedFood(restaurantId, idx) {
  const r = RESTAURANT_LOCATIONS.find(r => r.id === restaurantId);
  if (!r) return;
  const def = r.menu[idx];
  if (sipDollars < def.price) { sfx.nope(); showNotif(`❌ Need ${def.price} S.I.P.!`); return; }
  spendSip(def.price); saveCurrentUser(); updateSIP();
  sfx.buy();
  addToBag(def);
}

// ─── BUFFETS — user's own ask: "pay once, eat unlimited but it only allows 100 per serving and
// there is different ones like lunch breakfast and hot pot". Real, distinct mechanic from the
// themed restaurants above (which charge per item into your bag): pay one entry fee, then every
// dish is a free, unlimited, instant sit-and-eat — no bag, no per-item cost — for as long as
// you're inside. Each serving is a guaranteed full refill (restoreHunger's own 100 cap), not the
// smaller 35 a normal snack gives, so "100 per serving" is real, not just a flavor number.
let buffetActiveId = null, buffetPaid = false;
// user: "there is 100 foods to choose from and it is more expensive" — each group below shares
// one taste (matching TASTE_REACTION's own categories), tagged in bulk rather than per-dish;
// groups are sized so each buffet totals exactly 100 real, distinct items (verified live, not
// just hand-counted — see item 288).
function buffetGroup(names, emoji, taste) { return names.map(name => ({ name, emoji, taste })); }
const BREAKFAST_BUFFET_MENU = [
  ...buffetGroup(['Scrambled Eggs','Fried Eggs','Omelette','Egg Whites'], '🍳', 'savory'),
  ...buffetGroup(['Bacon','Turkey Bacon','Canadian Bacon'], '🥓', 'savory'),
  ...buffetGroup(['Sausage Links','Sausage Patties','Chicken Sausage','Turkey Sausage','Veggie Sausage','Chorizo'], '🌭', 'savory'),
  ...buffetGroup(['Ham','Corned Beef','Pork Belly'], '🍖', 'savory'),
  ...buffetGroup(['Corned Beef Hash','Breakfast Skillet'], '🥘', 'savory'),
  ...buffetGroup(['Hash Browns','Home Fries','Tater Tots','Breakfast Potatoes','Loaded Hash Browns'], '🥔', 'savory'),
  ...buffetGroup(['Biscuits','Sausage Rolls'], '🥖', 'savory'),
  ...buffetGroup(['Sausage Gravy'], '🥣', 'savory'),
  ...buffetGroup(['Grits'], '🥣', 'savory'),
  ...buffetGroup(['Breakfast Burrito','Breakfast Enchiladas'], '🌯', 'savory'),
  ...buffetGroup(['Huevos Rancheros','Chilaquiles','Migas'], '🌮', 'spicy'),
  ...buffetGroup(['Shakshuka','Frittata'], '🍳', 'savory'),
  ...buffetGroup(['Breakfast Quiche','Spinach Quiche'], '🥧', 'savory'),
  ...buffetGroup(['Breakfast Casserole'], '🍲', 'savory'),
  ...buffetGroup(['Breakfast Sandwich','Egg and Cheese Sandwich'], '🥪', 'savory'),
  ...buffetGroup(['Breakfast Pizza'], '🍕', 'savory'),
  ...buffetGroup(['Bagel with Lox','Cream Cheese Bagel'], '🥯', 'savory'),
  ...buffetGroup(['Smoked Salmon'], '🐟', 'savory'),
  ...buffetGroup(['Avocado Toast'], '🥑', 'savory'),
  ...buffetGroup(['Breakfast Tacos'], '🌮', 'spicy'),
  ...buffetGroup(['Steamed Buns','Dim Sum','Breakfast Empanada'], '🥟', 'savory'),
  ...buffetGroup(['Rice Porridge'], '🍚', 'savory'),
  ...buffetGroup(['English Breakfast Beans','Refried Beans'], '🫘', 'savory'),
  ...buffetGroup(['Black Pudding'], '🍽️', 'savory'),
  ...buffetGroup(['Kolaches'], '🥐', 'savory'),
  ...buffetGroup(['Breakfast Burger'], '🍔', 'savory'),
  ...buffetGroup(['Breakfast Naan','Breakfast Flatbread'], '🫓', 'savory'),
  ...buffetGroup(['Sausage Biscuit'], '🥖', 'savory'),
  ...buffetGroup(['Ham and Cheese Croissant'], '🥐', 'savory'),
  ...buffetGroup(['Bacon Wrapped Dates'], '🥓', 'savory'),
  ...buffetGroup(['Country Fried Steak'], '🥩', 'savory'),
  ...buffetGroup(['Breakfast Ramen'], '🍜', 'savory'),
  ...buffetGroup(['Pancakes','Buttermilk Pancakes','Blueberry Pancakes','Chocolate Chip Pancakes'], '🥞', 'sweet'),
  ...buffetGroup(['Waffles','Belgian Waffles','Waffle Sticks','Belgian Chocolate Waffle'], '🧇', 'sweet'),
  ...buffetGroup(['French Toast','Brioche French Toast','Cinnamon French Toast','Cinnamon Toast'], '🍞', 'sweet'),
  ...buffetGroup(['Crepes','Nutella Crepes'], '🥞', 'sweet'),
  ...buffetGroup(['Cinnamon Rolls'], '🍥', 'sweet'),
  ...buffetGroup(['Donuts','Glazed Donuts'], '🍩', 'sweet'),
  ...buffetGroup(['Muffins','Blueberry Muffins','Bran Muffins'], '🧁', 'sweet'),
  ...buffetGroup(['Danish Pastry','Croissants','Chocolate Croissants','Scones'], '🥐', 'sweet'),
  ...buffetGroup(['Pop Tarts'], '🧇', 'sweet'),
  ...buffetGroup(['Granola'], '🥣', 'sweet'),
  ...buffetGroup(['Yogurt Parfait'], '🍨', 'sweet'),
  ...buffetGroup(['Fruit Salad'], '🍓', 'sweet'),
  ...buffetGroup(['Acai Bowl'], '🍇', 'sweet'),
  ...buffetGroup(['Chia Pudding'], '🍮', 'sweet'),
  ...buffetGroup(['Orange Juice','Apple Juice'], '🧃', 'sour'),
  ...buffetGroup(['Milk','Chocolate Milk'], '🥛', 'sweet'),
  ...buffetGroup(['Coffee'], '☕', 'bitter'),
  ...buffetGroup(['Tea'], '🍵', 'bitter'),
  ...buffetGroup(['Hot Chocolate'], '☕', 'sweet'),
  ...buffetGroup(['Smoothie'], '🥤', 'sweet'),
  ...buffetGroup(['Fresh Fruit Platter'], '🍉', 'sweet'),
  ...buffetGroup(['Banana'], '🍌', 'sweet'),
];
const LUNCH_BUFFET_MENU = [
  ...buffetGroup(['Fried Rice','Chicken Fried Rice','Shrimp Fried Rice'], '🍚', 'savory'),
  ...buffetGroup(['Lo Mein','Chow Mein'], '🍜', 'savory'),
  ...buffetGroup(['Pad Thai'], '🍝', 'savory'),
  ...buffetGroup(['Grilled Chicken','Fried Chicken','BBQ Chicken','Chicken Tenders'], '🍗', 'savory'),
  ...buffetGroup(['Orange Chicken'], '🍊', 'sweet'),
  ...buffetGroup(["General Tso's Chicken"], '🍗', 'spicy'),
  ...buffetGroup(['Kung Pao Chicken','Buffalo Wings'], '🌶️', 'spicy'),
  ...buffetGroup(['Sweet and Sour Pork'], '🍖', 'sweet'),
  ...buffetGroup(['Beef and Broccoli'], '🥦', 'savory'),
  ...buffetGroup(['Mongolian Beef','Teriyaki Beef'], '🥩', 'savory'),
  ...buffetGroup(['Grilled Salmon'], '🐟', 'savory'),
  ...buffetGroup(['Fish and Chips','Fried Fish'], '🐟', 'savory'),
  ...buffetGroup(['Shrimp Scampi','Popcorn Shrimp'], '🍤', 'savory'),
  ...buffetGroup(['Spring Rolls','Egg Rolls'], '🥢', 'savory'),
  ...buffetGroup(['Dumplings','Potstickers','Wontons','Samosa'], '🥟', 'savory'),
  ...buffetGroup(['Meatballs','Spaghetti','Lasagna'], '🍝', 'savory'),
  ...buffetGroup(['Mac and Cheese','Grilled Cheese'], '🧀', 'savory'),
  ...buffetGroup(['Pizza'], '🍕', 'savory'),
  ...buffetGroup(['Calzone'], '🥟', 'savory'),
  ...buffetGroup(['Burrito'], '🌯', 'savory'),
  ...buffetGroup(['Taco','Fajitas'], '🌮', 'spicy'),
  ...buffetGroup(['Quesadilla'], '🫓', 'savory'),
  ...buffetGroup(['Nachos'], '🧀', 'spicy'),
  ...buffetGroup(['Enchiladas'], '🌯', 'spicy'),
  ...buffetGroup(['Club Sandwich','BLT','Turkey Sandwich','Ham Sandwich','Chicken Sandwich'], '🥪', 'savory'),
  ...buffetGroup(['Meatball Sub','Philly Cheesesteak','Reuben Sandwich'], '🥪', 'savory'),
  ...buffetGroup(['Burger','Cheeseburger'], '🍔', 'savory'),
  ...buffetGroup(['Hot Dog','Bratwurst','Corn Dog'], '🌭', 'savory'),
  ...buffetGroup(['Chicken Wings'], '🍗', 'savory'),
  ...buffetGroup(['Ribs','Pulled Pork','Brisket'], '🍖', 'savory'),
  ...buffetGroup(['Falafel','Hummus'], '🧆', 'savory'),
  ...buffetGroup(['Gyro','Shawarma','Kebab'], '🥙', 'savory'),
  ...buffetGroup(['Curry','Butter Chicken'], '🍛', 'spicy'),
  ...buffetGroup(['Biryani'], '🍛', 'spicy'),
  ...buffetGroup(['Garden Salad','Caesar Salad','Coleslaw'], '🥗', 'savory'),
  ...buffetGroup(['Mashed Potatoes'], '🥔', 'savory'),
  ...buffetGroup(['French Fries'], '🍟', 'savory'),
  ...buffetGroup(['Onion Rings'], '🧅', 'savory'),
  ...buffetGroup(['Corn on the Cob'], '🌽', 'sweet'),
  ...buffetGroup(['Steamed Vegetables','Green Beans'], '🥦', 'savory'),
  ...buffetGroup(['Rice Pilaf'], '🍚', 'savory'),
  ...buffetGroup(['Baked Beans'], '🫘', 'savory'),
  ...buffetGroup(['Cornbread','Garlic Bread'], '🍞', 'savory'),
  ...buffetGroup(['Soup of the Day','Miso Soup'], '🍲', 'savory'),
  ...buffetGroup(['Soft Serve Ice Cream','Fried Ice Cream'], '🍦', 'sweet'),
  ...buffetGroup(['Chocolate Cake','Cheesecake','Tiramisu'], '🍰', 'sweet'),
  ...buffetGroup(['Apple Pie','Baklava'], '🥧', 'sweet'),
  ...buffetGroup(['Brownies','Cookies'], '🍪', 'sweet'),
  ...buffetGroup(['Pudding','Jello'], '🍮', 'sweet'),
  ...buffetGroup(['Fruit Cup'], '🍓', 'sweet'),
  ...buffetGroup(['Fortune Cookie'], '🥠', 'sweet'),
  ...buffetGroup(['Churro'], '🥖', 'sweet'),
  ...buffetGroup(['Bubble Tea'], '🧋', 'sweet'),
  ...buffetGroup(['Iced Tea'], '🧊', 'bitter'),
  ...buffetGroup(['Lemonade'], '🍋', 'sour'),
  ...buffetGroup(['Soda'], '🥤', 'sweet'),
  ...buffetGroup(['Horchata'], '🥛', 'sweet'),
  ...buffetGroup(['Fruit Punch'], '🍹', 'sweet'),
];
const HOT_POT_BUFFET_MENU = [
  ...buffetGroup(['Thinly Sliced Beef','Wagyu Beef'], '🥩', 'savory'),
  ...buffetGroup(['Lamb Slices'], '🍖', 'savory'),
  ...buffetGroup(['Pork Belly','Pork Loin'], '🥓', 'savory'),
  ...buffetGroup(['Chicken Slices','Chicken Meatball'], '🍗', 'savory'),
  ...buffetGroup(['Shrimp','Shrimp Paste'], '🍤', 'savory'),
  ...buffetGroup(['Squid'], '🦑', 'savory'),
  ...buffetGroup(['Fish Slices','Fish Balls','Fish Tofu'], '🐟', 'savory'),
  ...buffetGroup(['Beef Balls','Enoki Beef Roll'], '🥩', 'savory'),
  ...buffetGroup(['Pork Balls','Meatballs'], '🍖', 'savory'),
  ...buffetGroup(['Crab Sticks','Crab Legs'], '🦀', 'savory'),
  ...buffetGroup(['Scallops','Oysters','Clams','Mussels'], '🦪', 'savory'),
  ...buffetGroup(['Tofu','Silken Tofu','Fried Tofu','Tofu Skin','Cheese Tofu'], '🧊', 'savory'),
  ...buffetGroup(['Duck Blood','Beef Tripe','Pork Intestine'], '🍽️', 'savory'),
  ...buffetGroup(['Quail Eggs','Century Egg'], '🥚', 'savory'),
  ...buffetGroup(['Spam','Luncheon Meat'], '🥫', 'savory'),
  ...buffetGroup(['Sausage'], '🌭', 'savory'),
  ...buffetGroup(['Napa Cabbage','Bok Choy','Spinach','Lettuce','Watercress'], '🥬', 'savory'),
  ...buffetGroup(['Enoki Mushrooms','Shiitake Mushrooms','Oyster Mushrooms','Wood Ear Mushrooms'], '🍄', 'savory'),
  ...buffetGroup(['Corn'], '🌽', 'sweet'),
  ...buffetGroup(['Potato Slices'], '🥔', 'savory'),
  ...buffetGroup(['Sweet Potato','Taro'], '🍠', 'sweet'),
  ...buffetGroup(['Lotus Root'], '🪷', 'savory'),
  ...buffetGroup(['Winter Melon','Pumpkin'], '🍈', 'savory'),
  ...buffetGroup(['Daikon Radish','Carrot'], '🥕', 'savory'),
  ...buffetGroup(['Tomato'], '🍅', 'sour'),
  ...buffetGroup(['Cucumber','Zucchini'], '🥒', 'savory'),
  ...buffetGroup(['Bean Sprouts'], '🌱', 'savory'),
  ...buffetGroup(['Bamboo Shoots'], '🎍', 'savory'),
  ...buffetGroup(['Broccoli','Cauliflower'], '🥦', 'savory'),
  ...buffetGroup(['Wolfberry Leaves','Chrysanthemum Greens','Cilantro Sauce'], '🌿', 'savory'),
  ...buffetGroup(['Seaweed','Kelp'], '🌊', 'savory'),
  ...buffetGroup(['Bell Peppers'], '🫑', 'savory'),
  ...buffetGroup(['Udon Noodles','Instant Noodles'], '🍜', 'savory'),
  ...buffetGroup(['Glass Noodles','Rice Noodles','Hand-Pulled Noodles','Vermicelli','Sweet Potato Noodles'], '🍜', 'savory'),
  ...buffetGroup(['Mochi','Rice Cakes'], '🍡', 'sweet'),
  ...buffetGroup(['Dumplings','Wontons','Potstickers'], '🥟', 'savory'),
  ...buffetGroup(['Spring Roll'], '🥢', 'savory'),
  ...buffetGroup(['Fried Dough Sticks','Steamed Buns'], '🥖', 'savory'),
  ...buffetGroup(['Spicy Sichuan Broth','Chili Oil','Hot Sauce'], '🌶️', 'spicy'),
  ...buffetGroup(['Mushroom Broth','Herbal Broth'], '🍄', 'savory'),
  ...buffetGroup(['Tomato Broth'], '🍅', 'sour'),
  ...buffetGroup(['Sesame Sauce','Peanut Sauce'], '🥜', 'savory'),
  ...buffetGroup(['Soy Sauce','Garlic Sauce'], '🍶', 'savory'),
  ...buffetGroup(['Vinegar'], '🍶', 'sour'),
  ...buffetGroup(['Scallion Oil'], '🧅', 'savory'),
  ...buffetGroup(['Sacha Sauce','Sha Cha Sauce'], '🍶', 'savory'),
  ...buffetGroup(['Mango Pudding'], '🍮', 'sweet'),
  ...buffetGroup(['Red Bean Soup'], '🍥', 'sweet'),
  ...buffetGroup(['Iced Plum Juice'], '🥤', 'sour'),
  ...buffetGroup(['Coconut Milk'], '🥥', 'sweet'),
  ...buffetGroup(['Green Tea'], '🍵', 'bitter'),
];
const BUFFET_LOCATIONS = [
  // .slice(0,100) is the real guarantee here, not the hand-counted lists above — verified live
  // that the raw lists actually landed at 101/102/101 before this, so trusting a manual count
  // alone would have shipped the wrong total.
  { id:'breakfast_buffet', name:'Breakfast Buffet', emoji:'🥞', x:-20, z:680, wall:0xffe0a0, accent:0xE8944A, glass:0xfff3d0, price:60, menu:BREAKFAST_BUFFET_MENU.slice(0,100) },
  { id:'lunch_buffet', name:'Lunch Buffet', emoji:'🍱', x:20, z:740, wall:0x6a8a5a, accent:0xE0C24A, glass:0xd8f0c8, price:90, menu:LUNCH_BUFFET_MENU.slice(0,100) },
  { id:'hot_pot_buffet', name:'Hot Pot Buffet', emoji:'🍲', x:-20, z:800, wall:0xaa2222, accent:0xFFD34D, glass:0xffc0b0, price:120, menu:HOT_POT_BUFFET_MENU.slice(0,100) },
];
function openBuffet(id) {
  const b = BUFFET_LOCATIONS.find(b => b.id === id);
  if (!b) return;
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  buffetActiveId = id;
  buffetPaid = false;
  document.getElementById('restaurantModalTitle').textContent = `${b.emoji} ${b.name}`;
  document.getElementById('restaurantModal').style.display = 'flex';
  renderBuffet();
}
function payForBuffet() {
  const b = BUFFET_LOCATIONS.find(b => b.id === buffetActiveId);
  if (!b) return;
  if (sipDollars < b.price) { sfx.nope(); showNotif(`❌ Need ${b.price} S.I.P. to eat here!`); return; }
  spendSip(b.price); saveCurrentUser(); updateSIP();
  sfx.buy();
  buffetPaid = true;
  showNotif(`🍽️ Paid ${b.price} S.I.P. — eat as much as you want!`);
  renderBuffet();
}
function renderBuffet() {
  const b = BUFFET_LOCATIONS.find(b => b.id === buffetActiveId);
  if (!b) return;
  const list = document.getElementById('restaurantList');
  if (!buffetPaid) {
    list.innerHTML = `<div class="shopItem">
      <div class="siName">${b.emoji} All-You-Can-Eat</div>
      <div class="siCost">💰 ${b.price} S.I.P. to sit down, then eat unlimited!</div>
      <button class="shopBtn" onclick="payForBuffet()">Pay &amp; Sit Down</button>
    </div>`;
    return;
  }
  list.innerHTML = b.menu.map((item, i) => `<div class="shopItem">
      <div class="siName">${item.emoji} ${item.name}</div>
      <div class="siCost">✅ Unlimited — dig in!</div>
      <button class="shopBtn" onclick="eatBuffetItem(${i})">🍽️ Eat</button>
    </div>`).join('');
}
function eatBuffetItem(idx) {
  const b = BUFFET_LOCATIONS.find(b => b.id === buffetActiveId);
  if (!b || !buffetPaid) return;
  const item = b.menu[idx];
  if (!item) return;
  eatFood(item.emoji, item.name, item.taste, 100);
}

function updateSnackCart() {
  const el = document.getElementById('snackCart');
  if(!el) return;
  el.textContent = cinemaState.snacks.length === 0
    ? 'No snacks yet — click to grab something!'
    : 'Your bag: ' + cinemaState.snacks.map(s=>s.emoji).join(' ');
}

function startTrailer() {
  cinemaState.phase = 'trailer'; cinemaState.trailerIndex = 0;
  document.getElementById('cinemaSnacks').style.display = 'none';
  document.getElementById('cinemaScreen').style.display = 'block';
  document.getElementById('cinemaSkip').style.display = 'block';
  document.getElementById('cinemaClose').style.display = 'none';
  const cv = document.getElementById('cinemaCanvas');
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  playTrailerSlide();
}

function playTrailerSlide() {
  if(cinemaState.phase !== 'trailer') return;
  const slides = cinemaState.movie.trailer;
  if(cinemaState.trailerIndex >= slides.length) { startCinemaMovie(); return; }
  const slide = slides[cinemaState.trailerIndex];
  drawTrailerSlide(slide.text);
  cinemaState.sceneTimer = setTimeout(() => { cinemaState.trailerIndex++; playTrailerSlide(); }, slide.dur);
}

function drawTrailerSlide(text) {
  const cv = document.getElementById('cinemaCanvas');
  const ctx = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  ctx.fillStyle = '#000'; ctx.fillRect(0,0,w,h);
  // Stars
  for(let i=0;i<80;i++){
    ctx.fillStyle=`rgba(255,255,255,${0.2+Math.random()*0.6})`;
    ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h,0.5+Math.random()*1.5,0,Math.PI*2); ctx.fill();
  }
  // Border frame
  ctx.strokeStyle='#ffcc00'; ctx.lineWidth=4;
  ctx.strokeRect(30,30,w-60,h-60);
  // Studio
  ctx.fillStyle='rgba(255,204,0,0.7)'; ctx.font=`bold ${Math.max(12,w/60)}px Arial`; ctx.textAlign='center';
  ctx.fillText('EXPLOX CINEMAS PRESENTS', w/2, h/2-55);
  // Main text
  ctx.fillStyle='#fff'; ctx.font=`bold ${Math.max(18,w/35)}px Arial`;
  ctx.strokeStyle='rgba(0,0,0,0.8)'; ctx.lineWidth=4;
  ctx.strokeText(text, w/2, h/2); ctx.fillText(text, w/2, h/2);
}

function startCinemaMovie() {
  cinemaState.phase = 'movie'; cinemaState.sceneIndex = 0; cinemaState.sceneStart = performance.now();
  cinemaState.playedSounds = new Set();
  cinemaState.narratedScene = -1;
  animateCinemaScene();
}

function animateCinemaScene() {
  if(cinemaState.phase !== 'movie') return;
  const scenes = cinemaState.movie.scenes;
  if(cinemaState.sceneIndex >= scenes.length) { showCinemaCredits(); return; }
  const scene = scenes[cinemaState.sceneIndex];
  const cv = document.getElementById('cinemaCanvas');
  const ctx = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const t = (performance.now() - cinemaState.sceneStart) / 1000;

  scene.draw(ctx, w, h, t);

  // Scene sound effects — trigger each sound once at its timestamp
  if(!cinemaState.playedSounds) cinemaState.playedSounds = new Set();
  const snds = (CINEMA_SOUNDS[cinemaState.movieIdx] || [])[cinemaState.sceneIndex] || [];
  snds.forEach((s, i) => {
    const key = cinemaState.sceneIndex + '_' + i;
    if(t >= s.t && !cinemaState.playedSounds.has(key)) {
      cinemaState.playedSounds.add(key);
      if(sfx[s.fn]) sfx[s.fn]();
    }
  });

  // Narrator — speak scene text once, 0.4s after scene starts so sounds play first
  if(cinemaState.narratedScene !== cinemaState.sceneIndex && t > 0.4) {
    cinemaState.narratedScene = cinemaState.sceneIndex;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(scene.text);
    const voices = [{rate:0.82,pitch:0.65},{rate:0.88,pitch:1.1},{rate:1.05,pitch:1.25},{rate:0.76,pitch:0.88},{rate:0.9,pitch:0.7},{rate:0.95,pitch:1.3},{rate:0.78,pitch:0.6},{rate:1.1,pitch:0.85},{rate:0.92,pitch:1.0},{rate:1.0,pitch:1.2},{rate:0.85,pitch:0.72},{rate:1.08,pitch:1.28},{rate:1.0,pitch:0.95},{rate:0.8,pitch:0.8}];
    const v = voices[cinemaState.movieIdx] || {rate:0.88,pitch:1};
    utt.rate = v.rate; utt.pitch = v.pitch; utt.volume = 0.85;
    window.speechSynthesis.speak(utt);
  }

  // Cinematic black bars
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,w,h*0.07); ctx.fillRect(0,h*0.93,w,h*0.07);

  // Scene number dots
  ctx.fillStyle='rgba(255,255,255,0.2)';
  scenes.forEach((_,i)=>{
    ctx.beginPath();
    ctx.arc(w/2 + (i-(scenes.length-1)/2)*18, h*0.91, cinemaState.sceneIndex===i?5:3, 0,Math.PI*2);
    ctx.fillStyle = cinemaState.sceneIndex===i ? '#ffcc00':'rgba(255,255,255,0.4)';
    ctx.fill();
  });

  // Narration text (fade in)
  const alpha = Math.min(1, t*1.5);
  ctx.fillStyle=`rgba(255,255,255,${alpha})`; ctx.textAlign='center';
  ctx.font=`bold ${Math.max(15,w/45)}px Arial`;
  ctx.strokeStyle=`rgba(0,0,0,${alpha*0.9})`; ctx.lineWidth=3;
  ctx.strokeText(scene.text, w/2, h*0.86); ctx.fillText(scene.text, w/2, h*0.86);

  if(t >= scene.dur) {
    sfx.scene();
    cinemaState.sceneIndex++;
    cinemaState.sceneStart = performance.now();
    cinemaState.playedSounds = new Set();
  }
  cinemaState.animFrame = requestAnimationFrame(animateCinemaScene);
}

function showCinemaCredits() {
  cinemaState.phase = 'credits';
  sfx.credits();
  window.speechSynthesis.cancel();
  setTimeout(() => {
    const utt = new SpeechSynthesisUtterance('The End.');
    utt.rate = 0.7; utt.pitch = 0.8; utt.volume = 0.9;
    window.speechSynthesis.speak(utt);
  }, 800);
  if(cinemaState.animFrame) cancelAnimationFrame(cinemaState.animFrame);
  const cv = document.getElementById('cinemaCanvas');
  const ctx = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#fff'; ctx.textAlign='center';
  ctx.font=`bold ${Math.max(28,w/22)}px Arial`;
  ctx.fillText('✦  THE END  ✦', w/2, h/2 - 36);
  ctx.fillStyle='#ffcc00'; ctx.font=`${Math.max(13,w/50)}px Arial`;
  const snackLine = cinemaState.snacks.length>0
    ? 'You enjoyed: '+cinemaState.snacks.map(s=>s.emoji).join(' ')
    : 'Hope you enjoyed the show!';
  ctx.fillText(snackLine, w/2, h/2 + 10);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font=`${Math.max(10,w/75)}px Arial`;
  ctx.fillText('AN EXPLOX CINEMAS PRODUCTION  •  '+cinemaState.movie.title.toUpperCase(), w/2, h/2+48);
  document.getElementById('cinemaSkip').style.display='none';
  document.getElementById('cinemaClose').style.display='block';
}

function skipCinemaPhase() {
  if(cinemaState.sceneTimer) clearTimeout(cinemaState.sceneTimer);
  if(cinemaState.animFrame) cancelAnimationFrame(cinemaState.animFrame);
  if(cinemaState.phase==='trailer') { startCinemaMovie(); }
  else if(cinemaState.phase==='movie') {
    cinemaState.sceneIndex++;
    if(cinemaState.sceneIndex >= cinemaState.movie.scenes.length) showCinemaCredits();
    else { cinemaState.sceneStart=performance.now(); cinemaState.animFrame=requestAnimationFrame(animateCinemaScene); }
  }
}

function closeCinema() {
  if(cinemaState.sceneTimer) clearTimeout(cinemaState.sceneTimer);
  if(cinemaState.animFrame) cancelAnimationFrame(cinemaState.animFrame);
  window.speechSynthesis.cancel();
  cinemaState = {movie:null,snacks:[],phase:null,sceneIndex:0,sceneTimer:null,animFrame:null,trailerIndex:0,sceneStart:0};
  document.getElementById('cinemaModal').style.display='none';
}

function shopOrRob(name, cost, robGain) {
  if(alignment === 'bad') robShop(name, robGain);
  else buyItem(name, cost);
}

// Deaths are PERMANENT only for the original 24 background NPC_DEFS. The 40 Suburbs friends
// (npc.job is only ever set on them) are exempt on purpose — same principle as the elders in
// item 106: anyone the player invests in (befriended, married off, hired, invited home) should
// never be able to just disappear. Background citizens don't carry that relationship weight, so
// they're where the actual "you can kill someone" consequence lives.
let deadNPCs = {}; // persisted — {name: {x,z}} death location, so buildNPCs() can leave a grave instead of respawning them
let graveMeshes = {}; // NOT persisted — {name:[meshes]}, rebuilt from deadNPCs every session
function buildGrave(name, x, z) {
  if(graveMeshes[name]) graveMeshes[name].forEach(m => scene.remove(m));
  const made = [];
  made.push(box(0.6, 0.9, 0.15, 0x999999, x, 0.45, z));
  const cv = document.createElement('canvas'); cv.width=160; cv.height=60;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#eee'; cx.fillRect(0,0,160,60);
  cx.fillStyle = '#333'; cx.font = 'bold 13px Arial'; cx.textAlign='center'; cx.textBaseline='middle';
  cx.fillText(name, 80, 22);
  cx.font = '11px Arial'; cx.fillText('Rest in peace 🕊️', 80, 42);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.42), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
  plaque.position.set(x, 0.85, z + 0.09);
  scene.add(plaque);
  made.push(plaque);
  graveMeshes[name] = made;
}
// ─── COMBAT — real player health + hit-for-hit fighting, not an instant kill ──
const WEAPON_DAMAGE = { none:5, bat:15, sword:25, axe:35, stiletto:20, club:12, metalsword:40, battleaxe:45, crystalsword:55,
  emphammer:18, plasmacutter:22, railspike:28,
  // 47 new Weapon Shop items (item ~235, "50 weapons that look different") — a real 16-material
  // tier ladder (Wood through Cosmic) so the shop is a coherent progression to shop up through,
  // not 47 flat reskins. See WEAPON_VISUALS below for how each one actually looks different.
  wood_club:10, wood_staff:12, wood_spear:14,
  stone_club:22, stone_hammer:25, stone_mace:28,
  bronze_sword:32, bronze_axe:35, bronze_dagger:38,
  iron_sword:42, iron_doubleaxe:46, iron_warhammer:50,
  steel_sword:52, steel_cleaver:56, steel_spear:60,
  silver_sword:62, silver_trident:66, silver_dagger:70,
  titanium_axe:72, titanium_warhammer:77, titanium_mace:82,
  obsidian_dagger:85, obsidian_scythe:90, obsidian_claw:95,
  frost_sword:98, frost_staff:103, frost_spear:108,
  ember_axe:112, ember_cleaver:118, ember_doubleaxe:124,
  venom_dagger:128, venom_claw:134, venom_scythe:140,
  shadow_scythe:145, shadow_dagger:151, shadow_staff:158,
  holy_sword:165, holy_spear:172, holy_trident:180,
  storm_warhammer:188, storm_mace:196, storm_trident:205,
  void_scythe:215, void_claw:223, void_dagger:232,
  cosmic_sword:245, cosmic_staff:255,
  // Batch 2 of the 5,000-weapon goal (user's own ask: "we make 50 at a time") — 16 more tiers
  // (Meteor through Omega) plus a 2-item Genesis cap, continuing the exact same ladder past
  // Cosmic instead of starting a separate system. Real long-term content: at this batch's top
  // end, Robot Level requirements (see weaponRequiredLevel() below) reach into the hundreds,
  // which only makes sense because eliteLevel itself was already deliberately left uncapped.
  meteor_hammer:270, meteor_axe:282, meteor_spear:294,
  solar_blade:310, solar_mace:325, solar_trident:340,
  nebula_dagger:360, nebula_scythe:380, nebula_claw:400,
  quantum_staff:425, quantum_cleaver:450, quantum_doubleaxe:475,
  prism_warhammer:505, prism_longsword:535, prism_club:565,
  diamond_shortsword:600, diamond_axe:635, diamond_dagger:670,
  mythic_hammer:710, mythic_mace:750, mythic_spear:790,
  dragon_trident:835, dragon_scythe:880, dragon_claw:925,
  phoenix_staff:975, phoenix_cleaver:1025, phoenix_doubleaxe:1075,
  abyssal_warhammer:1130, abyssal_longsword:1190, abyssal_club:1250,
  arcane_shortsword:1315, arcane_axe:1385, arcane_dagger:1455,
  runic_hammer:1530, runic_mace:1610, runic_spear:1690,
  ancient_trident:1775, ancient_scythe:1865, ancient_claw:1955,
  divine_staff:2050, divine_cleaver:2150, divine_doubleaxe:2250,
  eternal_warhammer:2360, eternal_longsword:2475, eternal_club:2595,
  omega_shortsword:2720, omega_axe:2855, omega_dagger:2995,
  genesis_blade:3150, genesis_orb:3300 };
function baseWeaponDamage() { return WEAPON_DAMAGE[playerWeapon] !== undefined ? WEAPON_DAMAGE[playerWeapon] : WEAPON_DAMAGE.none; }
// User's own ask: "you need a level you require to use the weapon" — derived straight from the
// weapon's own damage instead of a second hand-typed number per item, so it applies automatically
// to every weapon (old and new batches alike) and can never drift out of sync with its damage.
// User's own catch: dividing damage by 15 let several weapons land on the exact same level (every
// weapon within one 15-damage band, common early on where tiers only step up by ~10-50 damage).
// Ranking every weapon by its own damage instead gives each one a genuinely unique level — #0
// (lowest damage) is level 0, each next-strongest weapon one level higher — so no two weapons
// share a level UNTIL the cap. User's own follow-up: cap the max at level 590, not 657 (one per
// weapon forever) — past rank 590 the "extra" weapons (the strongest handful) all sit together at
// the same top level 590 instead of pushing the max even higher.
// Computed lazily, once — WEAPON_DAMAGE is fully populated (every generateWeaponBatch() call
// already ran) by the time any player action can actually trigger this.
// User's own final rebalance, replacing both the 590-level rank cap above AND the escalating-
// into-the-quadrillions damage curve every batch generator built up: "10 weapons share each
// level, damage = level×10" — one simple, sane rule instead of huge unreadable numbers. Relative
// power order from every batch is PRESERVED (weapon #1847 by old damage is still stronger than
// #40), just re-expressed on a scale a kid can actually read. Runs once, lazily, the first time
// anything asks for a weapon's level — by then every generateWeaponBatch()/generateAutoWeaponBatch()
// call has already populated WEAPON_DAMAGE, so the sort below sees the real final picture. Also
// re-derives each shop item's S.I.P. cost from its NEW damage (same ratio the generators already
// used), so price and power stay in sync instead of a level-1 weapon still costing quadrillions.
const WEAPONS_PER_LEVEL = 10;
const DAMAGE_PER_LEVEL = 10;
let _weaponLevels = null;
function buildWeaponLevels() {
  if (_weaponLevels) return;
  _weaponLevels = {};
  const sorted = Object.keys(WEAPON_DAMAGE).filter(k => k !== 'none').sort((a,b) => WEAPON_DAMAGE[a] - WEAPON_DAMAGE[b]);
  sorted.forEach((id,i) => {
    const level = Math.floor(i / WEAPONS_PER_LEVEL) + 1;
    _weaponLevels[id] = level;
    WEAPON_DAMAGE[id] = level * DAMAGE_PER_LEVEL;
  });
  WEAPONS.forEach(w => {
    if (_weaponLevels[w.id] === undefined) return; // robotShopOnly/craftOnly/blackMarketOnly items (emphammer, stiletto, etc.) keep their own hand-set cost
    w.cost = Math.max(5, Math.round(WEAPON_DAMAGE[w.id] * 17 / 5) * 5);
  });
}
function weaponRequiredLevel(id) {
  buildWeaponLevels();
  return _weaponLevels[id] || 1;
}
// Same derive-don't-duplicate approach as weaponRequiredLevel() above — the tier is already
// encoded in every batch weapon's own id ('wood_club' -> 'Wood'), so grouping the shop by
// category never needs a second hand-typed list that could drift out of sync with WEAPONS.
function weaponCategory(id) {
  if (!id.includes('_')) return 'Classic';
  const tier = id.split('_')[0];
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
// Real Fights add-ons all funnel through here — the one place every outgoing-damage call
// (getWeaponDamage AND getRobotDamage) already passes through, so Berserker/War Cry/Lucky Crits
// apply everywhere real damage is dealt, not just to one target type.
function applyDamageBuffs(base) {
  let dmg = base;
  dmg *= playerLevelDamageMult();
  if(activeAddOns.includes('berserker')) dmg *= 1.5;
  if(warCryEndTime) { if(clock.getElapsedTime() < warCryEndTime) dmg *= 2; else warCryEndTime = 0; }
  if(gymBuffEndTime) { if(clock.getElapsedTime() < gymBuffEndTime) dmg *= 1.15; else gymBuffEndTime = 0; }
  if(activeAddOns.includes('luckycrits') && Math.random() < 0.2) dmg *= 2;
  dmg *= punchChargeMult;
  return Math.round(dmg);
}
function getWeaponDamage() { return applyDamageBuffs(baseWeaponDamage()); }
// Robo Arsenal weapons hit ROBOTS far harder than their WEAPON_DAMAGE entry above (which is what
// they do to people) — real specialization, not a strictly-better weapon. Every other weapon deals
// its normal damage to robots too, unchanged.
const ROBOT_BONUS_DAMAGE = { emphammer:54, plasmacutter:77, railspike:112 };
function getRobotDamage() { return applyDamageBuffs(ROBOT_BONUS_DAMAGE[playerWeapon] !== undefined ? ROBOT_BONUS_DAMAGE[playerWeapon] : baseWeaponDamage()); }
function updateHealthBar() {
  const pct = Math.max(0, Math.min(100, (playerHealth/playerMaxHealth)*100));
  document.getElementById('healthBarFill').style.width = pct+'%';
  document.getElementById('healthText').textContent = `${Math.round(playerHealth)}/${playerMaxHealth} HP`;
}
function restoreHunger(amount) {
  const wasStarving = hunger <= 0;
  hunger = Math.min(100, hunger + amount);
  if (wasStarving && hunger > 0) showNotif('🍽️ Not starving anymore — phew!');
  updateHungerHud();
}
function updateHungerHud() {
  const hud = document.getElementById('hungerHud');
  if (!hud) return;
  const pct = Math.round(hunger);
  const color = hunger <= 0 ? '#ff3333' : (hunger < 25 ? '#ff8844' : (hunger < 60 ? '#ffdd44' : '#88ff88'));
  hud.style.color = color;
  hud.textContent = `🍔 Hunger: ${pct}%${hunger <= 0 ? ' — STARVING!' : ''}`;
}
function tickHunger(dt) {
  if (hunger > 0) {
    hunger = Math.max(0, hunger - HUNGER_DECAY_PER_SEC * dt);
    if (hunger <= 0) {
      showNotif("😫 You're starving! Find food or you'll start losing health.");
      _starveDamageAt = playTimeSeconds + STARVE_DAMAGE_INTERVAL_SEC;
    }
    updateHungerHud();
    return;
  }
  // Already starving — chip away at real HP on a cooldown, not every frame, using the same
  // damagePlayer() every other damage source uses so armor/knockout/hit-flash all still apply.
  if (playTimeSeconds >= _starveDamageAt) {
    _starveDamageAt = playTimeSeconds + STARVE_DAMAGE_INTERVAL_SEC;
    damagePlayer(STARVE_DAMAGE_AMOUNT, 'starving');
  }
}
function updateSickHud() {
  const hud = document.getElementById('sickHud');
  if (hud) hud.style.display = sick ? 'block' : 'none';
}
function updateBladderHud() {
  const hud = document.getElementById('bladderHud');
  if (!hud) return;
  const pct = Math.round(bladder);
  hud.style.color = bladder <= 0 ? '#ff3333' : (bladder < 25 ? '#ff8844' : (bladder < 60 ? '#ffdd44' : '#66ccff'));
  hud.textContent = `🚽 Bladder: ${pct}%`;
}
function haveAccident() {
  bladder = 100; // relieved — nothing left to hold, that's what just happened
  embarrassedUntil = playTimeSeconds + ACCIDENT_SLOW_DURATION_SEC;
  showNotif("💦 You couldn't hold it — accident! Pretty embarrassing, slower for a bit.");
  sfx.nope();
  updateBladderHud();
}
function tickBladder(dt) {
  if (bladder > 0) {
    bladder = Math.max(0, bladder - BLADDER_DECAY_PER_SEC * dt);
    if (bladder <= 0) haveAccident();
    updateBladderHud();
  }
}
function updateTirednessHud() {
  const hud = document.getElementById('tirednessHud');
  if (!hud) return;
  const pct = Math.round(tiredness);
  hud.style.color = tiredness <= 0 ? '#ff3333' : (tiredness < 25 ? '#ff8844' : (tiredness < 60 ? '#ffdd44' : '#bb99ff'));
  hud.textContent = `😴 Tiredness: ${pct}%${tiredness <= 0 ? ' — EXHAUSTED!' : ''}`;
}
function tickTiredness(dt) {
  if (tiredness > 0) {
    tiredness = Math.max(0, tiredness - TIREDNESS_DECAY_PER_SEC * dt);
    if (tiredness <= 0) {
      showNotif("😴 You're exhausted! Find a bed soon or you'll pass out.");
      exhaustedSince = playTimeSeconds;
    }
    updateTirednessHud();
    return;
  }
  // Already exhausted — ignore it long enough and you collapse on your own, same "a real forced
  // consequence, not an eternal debuff" shape as haveAccident() above.
  if (playTimeSeconds - exhaustedSince >= COLLAPSE_AFTER_SEC) {
    collapseFromExhaustion();
  }
}
function collapseFromExhaustion() {
  tiredness = 40; // wake up partly rested, not full — a real cost for ignoring it, not devastating
  exhaustedSince = 0;
  showNotif('😪 You collapsed from exhaustion and passed out for a while! Only partly rested when you woke up — find a real bed next time.');
  sfx.nope();
  updateTirednessHud();
}
// Shared by sleepAtHome()/sleepInHotel() — any real sleep, good night or bad, fixes tiredness.
function restoreTiredness() {
  tiredness = 100;
  exhaustedSince = 0;
  updateTirednessHud();
}
function useToilet() {
  bladder = 100;
  showNotif('🚽 Ahh, much better!');
  sfx.click();
  updateBladderHud();
}
// ─── DUCK BEHIND A BUSH — user's own ask, right after Toilet: a faster no-walk-home option that
// trades the toilet's guaranteed-safe relief for a real risk — Add Ons -> Crime -> 🌳. Same
// embarrassment slowdown as a real accident, PLUS a real wanted-level bump (ties into the actual
// Officer/arrest system) when caught, not just a funny message. Follow-up ask: "make it actually
// show" — a real temporary bush + the actual soft-serve pile or puddle (picked at random, same
// "leak or soft serve" the user asked for) + stink lines, spawned right where it happens, not
// just a stat change and a notif.
const RELIEVE_CAUGHT_CHANCE = 0.35;
const RELIEVE_MARK_LIFETIME_MS = 25000;
function spawnRelieveMark(isPoop) {
  if (!playerGroup || !scene) return;
  const mx = playerGroup.position.x - Math.sin(yaw) * 1.4;
  const mz = playerGroup.position.z - Math.cos(yaw) * 1.4;
  const meshes = [];
  // the bush itself — two overlapping green clumps, low-poly like every other city prop
  meshes.push(box(0.9,0.9,0.9, 0x2e7d32, mx-0.6,0.45,mz-0.3));
  meshes.push(box(0.7,0.7,0.7, 0x388e3c, mx-0.3,0.55,mz+0.3));
  if (isPoop) {
    // soft-serve swirl — 3 tapering stacked segments
    meshes.push(box(0.5,0.18,0.5,  0x5a3a1a, mx,0.09,mz));
    meshes.push(box(0.36,0.16,0.36,0x6a4422, mx,0.24,mz));
    meshes.push(box(0.22,0.16,0.22,0x7a4e2a, mx,0.38,mz));
  } else {
    meshes.push(box(0.75,0.03,0.6, 0xddcc55, mx,0.02,mz)); // puddle
  }
  // stink lines rising off it
  for (let i = 0; i < 3; i++) {
    meshes.push(box(0.06,0.28,0.06, 0x77dd77, mx+(i-1)*0.22, 0.55+i*0.04, mz));
  }
  setTimeout(() => meshes.forEach(m => scene.remove(m)), RELIEVE_MARK_LIFETIME_MS);
}
function relieveOutdoors() {
  bladder = 100;
  updateBladderHud();
  spawnRelieveMark(Math.random() < 0.5);
  if (Math.random() < RELIEVE_CAUGHT_CHANCE) {
    increaseWanted(1);
    embarrassedUntil = playTimeSeconds + ACCIDENT_SLOW_DURATION_SEC;
    showNotif('😳 Someone saw you ducking behind a bush! Real embarrassing — wanted level up.');
    sfx.nope();
  } else {
    showNotif('🌳 Ducked behind a bush real quick — nobody saw. Phew!');
    sfx.click();
  }
}
function catchSickness() {
  sick = true;
  sickUntil = playTimeSeconds + SICK_DURATION_MIN + Math.random() * (SICK_DURATION_MAX - SICK_DURATION_MIN);
  _sickDamageAt = playTimeSeconds + SICK_DAMAGE_INTERVAL_SEC;
  _sickVomitCheckAt = playTimeSeconds + SICK_VOMIT_CHECK_INTERVAL_SEC;
  showNotif(hunger <= 0
    ? '🤒 All that starving caught up with you — you got sick!'
    : '🤒 You caught a cold — feeling sick and slow.');
  sfx.nope();
  updateSickHud();
}
function tickSickness() {
  if (sick) {
    if (playTimeSeconds >= sickUntil) {
      sick = false;
      showNotif('🤒➡️😊 You feel better — the sickness passed on its own!');
      updateSickHud();
      return;
    }
    if (playTimeSeconds >= _sickDamageAt) {
      _sickDamageAt = playTimeSeconds + SICK_DAMAGE_INTERVAL_SEC;
      damagePlayer(SICK_DAMAGE_AMOUNT, 'sickness');
    }
    if (playTimeSeconds >= _sickVomitCheckAt) {
      _sickVomitCheckAt = playTimeSeconds + SICK_VOMIT_CHECK_INTERVAL_SEC;
      if (Math.random() < SICK_VOMIT_CHANCE) vomit('being sick');
    }
    return;
  }
  if (playTimeSeconds >= _sickCheckAt) {
    _sickCheckAt = playTimeSeconds + SICK_CHECK_INTERVAL_SEC;
    const chance = hunger <= 0 ? SICK_CHANCE_STARVING : SICK_CHANCE_NORMAL;
    if (Math.random() < chance) catchSickness();
  }
}
// Real bug report: "people keep attacking me even when im in tabs" — every modal/overlay/panel
// in the game (Shop, Karaoke, Buffet, Bank, etc.) follows the same id-naming convention, so this
// checks the real rendered DOM state instead of needing a hand-maintained list of every menu —
// missing one from a manual list would silently let that one menu stay unsafe.
function isPlayerInMenu() {
  // getClientRects() (not getComputedStyle) on purpose — some of these panels are only hidden via
  // a PARENT container's display:none rather than their own, which getComputedStyle can't see but
  // real rendered layout always reflects correctly, confirmed live: the naive computedStyle check
  // falsely flagged several never-opened panels as "open" from the very first login screen.
  return Array.from(document.querySelectorAll('[id$="Modal"],[id$="Overlay"],[id$="Panel"]')).some(el => el.getClientRects().length > 0);
}
function damagePlayer(amount, sourceLabel) {
  if(playerHealth <= 0) return;
  if(isPlayerInMenu()) return; // can't see or react to a fight while a menu covers the screen — no hit should land
  const armorDef = ARMOR.find(a => a.id === playerArmor);
  let finalAmount = armorDef ? Math.round(amount * (1 - armorDef.reduction)) : amount;
  if(activeAddOns.includes('ironskin')) finalAmount = Math.round(finalAmount * 0.7);
  playerHealth = Math.max(0, playerHealth - finalAmount);
  updateHealthBar();
  const flash = document.getElementById('hitFlash');
  flash.style.opacity = '1';
  setTimeout(() => { flash.style.opacity = '0'; }, 140);
  const blockedNote = armorDef ? ` (${armorDef.name} blocked ${amount-finalAmount})` : '';
  showNotif(`💥 -${finalAmount} HP${sourceLabel ? ' from '+sourceLabel : ''}!${blockedNote}`);
  sfx.hit();
  if(playerHealth <= 0) knockoutPlayer();
}
function knockoutPlayer() {
  if(lastHitmanAttacker) {
    // A real hired-killer death, not a duel/arena loss — the hirer only finds out once we
    // confirm it ourselves, since they have no way to know our HP directly (see
    // tickHitmanVsPlayer/hitman_hit above). Sends you home, same as a normal knockout.
    const hirer = lastHitmanAttacker;
    lastHitmanAttacker = null;
    sendMail(hirer, 'hitman_kill_confirmed', { targetName: currentUser });
    showNotif(`💀 A killer hired by ${hirer} got you! Waking up at home...`);
    playerGroup.position.set(HOUSE_DOOR.x, 0, HOUSE_DOOR.z + 3);
    yaw = 0;
    playerHealth = playerMaxHealth;
    updateHealthBar();
    return;
  }
  if(dueling) {
    const opponent = dueling;
    dueling = null;
    sendMail(opponent, 'duel_end', { result: 'you_won' });
    showNotif(`😵 You lost the duel to ${opponent}!`);
    playerHealth = playerMaxHealth;
    updateHealthBar();
    return; // a friendly duel loss doesn't send you home
  }
  if(inArena) {
    ffaAlive = false;
    ffaRespawnAt = clock.getElapsedTime() + FFA_RESPAWN_SECONDS;
    const attacker = lastFfaAttacker;
    lastFfaAttacker = null;
    if(attacker) sendMail(attacker, 'ffa_kill');
    showNotif(`💀 Knocked out${attacker ? ' by '+attacker : ''}! Respawning in ${FFA_RESPAWN_SECONDS}s...`);
    playerHealth = playerMaxHealth;
    updateHealthBar();
    return; // arena knockouts don't send you home either — you just sit out the cooldown
  }
  if(currentWarZone) {
    // User's follow-up correction: not a plain countdown — "when you die you have to choose
    // where to respawn." warAlive stays false (can't fight, can't be hit) until a choice is
    // actually made in warDeathModal; picking "Right Here" keeps the original no-travel-penalty
    // territory grind possible, the other two are a real trip in exchange for safety.
    warAlive = false;
    const lostSip = Math.round(sipDollars * WAR_DEATH_SIP_LOSS_PCT);
    sipDollars = Math.max(0, sipDollars - lostSip);
    updateSIP();
    playerHealth = playerMaxHealth;
    updateHealthBar();
    showWarDeathModal(currentWarZone, lostSip);
    return;
  }
  if(activeJob || activeBankJob) {
    // User's own ask: "if you die you respawn where you were if you are working" — ties directly
    // into the Guard-duty killer swarm above (item 215/217 follow-up): losing your spot to a
    // teleport-home would undo the whole point of standing your ground against them. Same "just a
    // breather in place" pattern as the War Zone/Arena cases above, just for any active job.
    showNotif('💀 Knocked out on the job! Shake it off and get back to it.');
    playerHealth = playerMaxHealth;
    updateHealthBar();
    return;
  }
  showNotif('😵 Knocked out! Waking up at home...');
  playerGroup.position.set(HOUSE_DOOR.x, 0, HOUSE_DOOR.z + 3);
  yaw = 0;
  playerHealth = playerMaxHealth;
  updateHealthBar();
  resetAllBossAggro(); // the "die" end condition for a boss chase — it doesn't just resume hunting you the instant you wake up across the map
  if (inMovieFight) cleanupMovieFight(); // same "no orphaned interior state after a teleport-home" concern — the room/boss don't stay half-active behind you
  // Real bug found live while testing the Robot Arena's new active-attacking robots: the Arena
  // never had knockout handling at all, so dying there used to leave inArenaBattle/arenaRunning
  // stuck TRUE while the player got teleported home — walking around downtown while every
  // COLS/ZONES lookup silently kept resolving to the Robot Arena's own walls/zones instead of the
  // city's. Barely reachable before (robots only ever hit back as a counter to your own swing);
  // now that they attack on their own, getting surrounded and knocked out is a real, easy way to
  // die in there, so this can no longer stay a dormant edge case.
  if (inArenaBattle) { clearArenaRobots(); inArenaBattle = false; arenaConfiguring = false; arenaRunning = false; closeArenaConfig(); document.getElementById('arenaHud').style.display = 'none'; }
}

// ─── FIGHT ARENA — a dedicated place to duel; the duel mechanic itself works
// anywhere in the city (see tryDuelInteract() below), this is just a real, visible
// landmark built for it so friends have a place to actually meet up and fight ────
const ARENA_CENTER = { x:250, z:-200 };
function buildFightArena() {
  const { x:cx, z:cz } = ARENA_CENTER;
  const r = 49; // 100x100m: floor is r*2+2 = 100 on a side
  box(r*2+2, 0.3, r*2+2, 0x4a3a2a, cx, 0.1, cz); // sand floor
  const posts = 48; // scaled up from the original 16 (at r=16) to keep roughly the same spacing around the much bigger ring
  for (let i = 0; i < posts; i++) {
    const a = (i / posts) * Math.PI * 2;
    box(0.5, 1.6, 0.5, 0x8a5a3a, cx + Math.cos(a)*r, 0.8, cz + Math.sin(a)*r);
  }
  buildLogoSign('FIGHT ARENA', '⚔️', '#5a1a1a', '#ffcc44', cx, 6, cz - r - 1);
  addCol(CITY_COLS, cx, cz - r - 1.5, 4, 0.6); // sign base, so it isn't walk-through
}

// ─── PVP DUELS ────────────────────────────────────────────────────────────────
// Reuses the exact same damagePlayer()/getWeaponDamage()/HP system that already
// exists for robots/NPCs — a duel just redirects hits at a real other player
// instead, relayed through the mailbox since the two clients aren't connected
// directly to each other.
let dueling = null;            // opponent name, while a duel is actively happening
let duelChallengeFrom = null;  // someone challenged ME, awaiting my accept/decline
let duelChallengeSentTo = null; // I challenged them, awaiting their response
let _lastMailboxSync = -999;
const MAILBOX_SYNC_INTERVAL = 1.5;

// ─── ARENA FREE-FOR-ALL ────────────────────────────────────────────────────
// No challenge/accept — anyone physically standing in the Fight Arena can hit
// anyone else standing in it, relayed through the same generic mailbox as
// duels (ffa_hit/ffa_kill instead of duel_hit/duel_end). A live leaderboard
// (most lifetime kills) is synced through the same generic /api/minigame
// endpoint geodash/throne already use for their own live features — no new
// server routes needed for any of this.
let inArena = false;
let ffaAlive = true;          // false while sitting out a knockout cooldown
let ffaRespawnAt = 0;         // clock.getElapsedTime() value when I can fight again
let ffaKills = 0;             // lifetime, persisted with the rest of the save
let lastFfaAttacker = null;   // set right before damagePlayer() from an ffa_hit, read once by knockoutPlayer()
let lastHitmanAttacker = null; // set right before damagePlayer() from a hitman_hit, read once by knockoutPlayer()
let ffaLeaderboard = [];      // [{name, kills}], synced while inArena
let _lastFfaSync = -999;
const FFA_SYNC_INTERVAL = 2;
const FFA_RESPAWN_SECONDS = 8;
const ARENA_RADIUS = 49; // matches buildFightArena()'s sand floor (100x100m)

function sendMail(to, type, data) {
  if(serverMode !== 'online') return;
  fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/mailbox', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ to, from: currentUser, type, data: data || {} })
  }, 4000).catch(()=>{});
}

async function syncMailbox() {
  if(!currentUser || serverMode !== 'online') return;
  try {
    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/mailbox?for=' + encodeURIComponent(currentUser), {}, 4000);
    if(!r.ok) return;
    const msgs = await r.json();
    msgs.forEach(handleMailboxMessage);
  } catch(e) { /* next sync will catch up */ }
}

function handleMailboxMessage(msg) {
  if(msg.type === 'duel_challenge') {
    duelChallengeFrom = msg.from;
    updateDuelChallengeBanner();
  } else if(msg.type === 'duel_accept') {
    if(duelChallengeSentTo === msg.from) {
      dueling = msg.from;
      duelChallengeSentTo = null;
      showNotif(`⚔️ ${msg.from} accepted! Press E near them to fight!`);
    }
  } else if(msg.type === 'duel_decline') {
    if(duelChallengeSentTo === msg.from) {
      duelChallengeSentTo = null;
      showNotif(`${msg.from} declined the duel.`);
    }
  } else if(msg.type === 'duel_hit') {
    if(dueling === msg.from) damagePlayer(msg.data.damage, msg.from + ' (duel)');
  } else if(msg.type === 'duel_end') {
    if(dueling === msg.from) {
      dueling = null;
      if(msg.data && msg.data.result === 'you_won') {
        queueEarning(50, 0, `Duel win vs ${msg.from}`);
        showNotif(`🏆 You won the duel against ${msg.from}! +50 S.I.P. pending in Earnings`);
      } else {
        showNotif(`Duel with ${msg.from} ended.`);
      }
    }
  } else if(msg.type === 'ffa_hit') {
    if(inArena && ffaAlive) { lastFfaAttacker = msg.from; damagePlayer(msg.data.damage, msg.from + ' (arena)'); }
  } else if(msg.type === 'sip_gift') {
    queueEarning(msg.data.amount, 0, `Gift from ${msg.from}`);
    showNotif(`💸 ${msg.from} gave you ${msg.data.amount} S.I.P.! Thanks!`);
  } else if(msg.type === 'ffa_kill') {
    ffaKills++;
    queueEarning(20, 0, 'Arena FFA Kill');
    showNotif(`💀 Knocked out ${msg.from}! +20 S.I.P. pending (${ffaKills} arena kills)`);
  } else if(msg.type === 'hitman_hit') {
    lastHitmanAttacker = msg.from;
    damagePlayer(msg.data.damage, `${msg.from}'s hired killer`);
  } else if(msg.type === 'hitman_kill_confirmed') {
    const k = killers.find(kk => kk.alive && kk.hitTargetIsPlayer && kk.hitTargetName === msg.data.targetName);
    if (k) { k.alive = false; if (k.mesh) scene.remove(k.mesh); }
    completeHiredHitOnPlayer(msg.data.targetName);
  }
}

function updateDuelChallengeBanner() {
  const el = document.getElementById('duelChallengeBanner');
  if(!el) return;
  if(duelChallengeFrom) {
    document.getElementById('duelChallengeText').textContent = `⚔️ ${duelChallengeFrom} wants to duel!`;
    el.style.display = 'flex';
  } else {
    el.style.display = 'none';
  }
}
function acceptDuelChallenge() {
  if(!duelChallengeFrom) return;
  dueling = duelChallengeFrom;
  sendMail(duelChallengeFrom, 'duel_accept');
  showNotif(`⚔️ Duel with ${duelChallengeFrom} begins! Press E near them to fight!`);
  duelChallengeFrom = null;
  updateDuelChallengeBanner();
}
function declineDuelChallenge() {
  if(!duelChallengeFrom) return;
  sendMail(duelChallengeFrom, 'duel_decline');
  duelChallengeFrom = null;
  updateDuelChallengeBanner();
}

function nearestRemotePlayer(maxDist) {
  let closest = null, closestDist = maxDist;
  Object.keys(remotePlayers).forEach(name => {
    const rp = remotePlayers[name];
    const d = Math.hypot(playerGroup.position.x - rp.mesh.position.x, playerGroup.position.z - rp.mesh.position.z);
    if(d < closestDist) { closestDist = d; closest = name; }
  });
  return closest;
}
// Give S.I.P. to whoever's nearest — bound to the Y key, relayed through the
// same generic mailbox everything else player-to-player already uses.
function tryGiveSip() {
  if(serverMode !== 'online') { showNotif('💸 Giving S.I.P. needs ONLINE mode!'); return; }
  const target = nearestRemotePlayer(10);
  if(!target) { showNotif('💸 Get closer to someone to give them S.I.P.!'); return; }
  const raw = prompt(`Give how much S.I.P. to ${target}?`, '100');
  const amt = Math.floor(Number(raw));
  if(!raw || !Number.isFinite(amt) || amt <= 0) return;
  if(sipDollars < amt) { showNotif(`❌ You only have ${sipDollars} S.I.P.!`); return; }
  spendSip(amt); updateSIP(); saveCurrentUser();
  sendMail(target, 'sip_gift', { amount: amt });
  showNotif(`💸 Sent ${amt} S.I.P. to ${target}!`);
}
// Called from handleInteract() (E key) - returns true if it handled the press,
// so the normal contextual-E logic (cars, NPCs, zones...) knows to stop there.
function tryDuelInteract() {
  if(dueling) {
    const rp = remotePlayers[dueling];
    // Real bug found live: an active-but-stale duel (opponent wandered off, or the
    // duel just never formally ended) used to swallow EVERY E-press anywhere in the
    // game with "get closer to X" - including robot fights, zones, everything -
    // since returning true here always blocked handleInteract()'s normal fallthrough.
    // Now it only claims the interaction when the opponent is genuinely close enough
    // that this really IS what you meant to do; otherwise it steps aside so whatever
    // you're actually standing near (a robot, a zone) still works normally.
    if(!rp) return false;
    const d = Math.hypot(playerGroup.position.x - rp.mesh.position.x, playerGroup.position.z - rp.mesh.position.z);
    if(d > 25) return false; // opponent is far off - don't block unrelated interactions
    if(d > 8) { showNotif(`Get closer to ${dueling} to swing!`); return true; } // real players found this too tight at 6 - loosened, and now says why instead of silently doing nothing
    const dmg = getWeaponDamage();
    triggerSwing();
    sfx.hit();
    sendMail(dueling, 'duel_hit', { damage: dmg });
    startKnockback(playerGroup.position.x, playerGroup.position.z, rp.mesh.position.x, rp.mesh.position.z,
      (x, z) => { rp.mesh.position.x = x; rp.mesh.position.z = z; });
    showNotif(`⚔️ Hit ${dueling} for ${dmg}!`);
    return true;
  }
  // Real bug found live, co-op testing at a War territory: a friend just being within 35
  // units outdoors made EVERY E-press here turn into "walk closer to challenge them" —
  // even while standing right on top of a war-garrison NPC's own fight zone, so combat
  // was completely unreachable the whole time a friend was nearby. Same "step aside for
  // whatever you're actually standing near" philosophy as the d>25 case above, just
  // extended to this not-yet-dueling case too, which never had it.
  if(!duelChallengeSentTo) {
    const zones = inMovieFight ? MOVIE_FIGHT_ZONES : inArenaBattle ? ROBOT_ARENA_ZONES : inPrison ? PRISON_ZONES : inFriendHouse ? FRIEND_HOUSE_ZONES : inLandHouse ? LAND_HOUSE_ZONES : inCountryHotel ? COUNTRY_HOTEL_ZONES : inAirportLounge ? AIRPORT_LOUNGE_ZONES : inArcade ? ARCADE_ZONES : inHotel ? HOTEL_ZONES : inHouse ? HOUSE_ZONES : inMall ? MALL_ZONES : inStore ? STORE_ZONES : inBankInterior ? BANK_INTERIOR_ZONES : inSportsPark ? SPORTS_ZONES : inHospital ? HOSPITAL_ZONES : inSea ? SEA_ZONES : CITY_ZONES;
    const px3 = playerGroup.position.x, pz3 = playerGroup.position.z;
    const nearZone = zones.some(z => Math.hypot(px3 - z.x, pz3 - z.z) < z.r)
      || rogueRobots.some(r => r.alive && Math.hypot(px3 - r.x, pz3 - r.z) < 3)
      || (alignment === 'bad' && playerWeapon !== 'none' && npcs.some(n => Math.hypot(px3 - n.group.position.x, pz3 - n.group.position.z) < 3.5));
    if(!nearZone) {
      const nearby = nearestRemotePlayer(12);
      if(nearby) {
        duelChallengeSentTo = nearby;
        sendMail(nearby, 'duel_challenge');
        showNotif(`⚔️ Challenge sent to ${nearby}...`);
        return true;
      }
      const far = nearestRemotePlayer(35);
      if(far) { showNotif(`🚶 Walk closer to ${far} to challenge them to a duel!`); return true; }
    }
  }
  return false;
}
// Called from handleInteract() instead of tryDuelInteract() while inArena — no
// challenge/accept, just swing at whoever's in range and also currently in the arena.
function tryFfaInteract() {
  if(!ffaAlive) {
    showNotif(`⏳ Respawning in ${Math.max(0, Math.ceil(ffaRespawnAt - clock.getElapsedTime()))}s...`);
    return true;
  }
  let target = null, targetDist = 8, targetRp = null;
  Object.keys(remotePlayers).forEach(name => {
    const rp = remotePlayers[name];
    const dToArena = Math.hypot(rp.mesh.position.x - ARENA_CENTER.x, rp.mesh.position.z - ARENA_CENTER.z);
    if(dToArena > ARENA_RADIUS) return; // not actually in the arena right now
    const d = Math.hypot(playerGroup.position.x - rp.mesh.position.x, playerGroup.position.z - rp.mesh.position.z);
    if(d < targetDist) { targetDist = d; target = name; targetRp = rp; }
  });
  // Real bug found live: this used to unconditionally return true here, so standing in the
  // arena while a World Event (e.g. Pirate Raiders) happened to have a fightable NPC in real
  // range made every single E-press silently eat itself on this "no one in range" message —
  // the actual "[E] Fight Pirate Raiders" prompt showing on screen was a total lie, since this
  // branch always won before handleInteract() ever reached the zones loop that prompt reads
  // from. Same "step aside for something real that's actually nearby" fix as the duel/FFA
  // priority note right above this function's caller — only claim the E-press when there's
  // truly no PvP target, letting the caller fall through to check everything else first.
  if(!target) { return false; }
  const dmg = getWeaponDamage();
  triggerSwing();
  sfx.hit();
  sendMail(target, 'ffa_hit', { damage: dmg });
  startKnockback(playerGroup.position.x, playerGroup.position.z, targetRp.mesh.position.x, targetRp.mesh.position.z,
    (x, z) => { targetRp.mesh.position.x = x; targetRp.mesh.position.z = z; });
  showNotif(`⚔️ Hit ${target} for ${dmg}!`);
  return true;
}
function updateFfaLeaderboardUI() {
  const el = document.getElementById('ffaLeaderboard');
  if(!el) return;
  if(!inArena) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  const rows = ffaLeaderboard.length
    ? ffaLeaderboard.map(e => `<div style="display:flex;justify-content:space-between;gap:14px;${e.name===currentUser?'color:#ffcc44;font-weight:bold;':''}"><span>${e.name}</span><span>${e.kills}</span></div>`).join('')
    : '<div style="opacity:.6">No fighters yet — be the first!</div>';
  document.getElementById('ffaLeaderboardRows').innerHTML = rows;
}
async function syncFfaLeaderboard() {
  if(serverMode !== 'online' || !currentUser) return;
  fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/minigame', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ name: currentUser, game:'ffa', data:{ kills: ffaKills } })
  }, 4000).catch(()=>{});
  try {
    const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/minigame?game=ffa', {}, 4000);
    if(r.ok) {
      const list = await r.json();
      ffaLeaderboard = list.map(e => ({ name: e.name, kills: (e.data && e.data.kills) || 0 }))
        .sort((a,b) => b.kills - a.kills).slice(0, 8);
      updateFfaLeaderboardUI();
    }
  } catch(e) { /* next sync will catch up */ }
}
// Slow passive regen while below max — same tick* pattern as tickJob/tickCook/tickWanted.
function tickHealth(dt) {
  if(playerHealth > 0 && playerHealth < playerMaxHealth) {
    const regenMult = activeAddOns.includes('fastheal') ? 3 : 1;
    playerHealth = Math.min(playerMaxHealth, playerHealth + dt*1.5*regenMult);
    updateHealthBar();
  }
}
// Finds a President's own Bodyguards (matched by the "X's Bodyguard A/B" naming convention set
// in generatePresidentNPCs) who are alive and actually close enough to react.
function presidentBodyguardsNear(president, radius) {
  return npcs.filter(n => n.role === 'Bodyguard' && !n.isDown && n.name.startsWith(president.name + "'s Bodyguard")
    && Math.hypot(n.group.position.x-president.group.position.x, n.group.position.z-president.group.position.z) < radius);
}
function attackNPC(npc) {
  if(npc.isDown) { showNotif(`${npc.name} is already down!`); return; }
  const isCop = npc.role === 'Officer';
  const isPresident = npc.role === 'President';
  // A President is a real fight, not a pushover — this is the whole reason "try" and "actually
  // kill" are different outcomes: Bodyguards below add even more real risk on top of this.
  if(npc.combatHp === undefined) npc.combatHp = isPresident ? 80 : npc.job ? 30 : (isCop ? 60 : 40);

  const dmg = getWeaponDamage();
  npc.combatHp -= dmg;
  triggerSwing();
  startKnockback(playerGroup.position.x, playerGroup.position.z, npc.group.position.x, npc.group.position.z,
    (x, z) => { npc.group.position.x = x; npc.group.position.z = z; });
  sfx.hit();

  if(npc.combatHp > 0) {
    // NPC fights back — real risk for the player, not a free hit each time.
    const backDmg = Math.round((isCop ? 8 : 5) + Math.random()*(isCop?10:6));
    showNotif(`⚔️ Hit ${npc.name} for ${dmg}! (${Math.max(0,npc.combatHp)} HP left)`);
    damagePlayer(backDmg, npc.name);
    if (isPresident) {
      const guards = presidentBodyguardsNear(npc, 15);
      if (guards.length) {
        guards.forEach(g => damagePlayer(6 + Math.floor(Math.random()*8), g.name));
        showNotif(`🛡️ ${guards.map(g=>g.name.replace(npc.name+"'s ",'')).join(' and ')} jump in to defend ${npc.name}!`);
      }
    }
    return;
  }
  defeatNPC(npc);
}
// Extracted so a car ram (item 160) can trigger the EXACT same real consequences as melee combat
// — grave, wanted level, S.I.P. — instead of a separate, inconsistent death path.
function defeatNPC(npc) {
  const isCop = npc.role === 'Officer';
  const isPresident = npc.role === 'President';
  if(isPresident) {
    // Assassinating a head of state is instantly national news — no 15-30s "nobody's noticed
    // yet" grace period like a regular citizen gets, and a much bigger bounty to match the risk
    // of actually pulling it off against real Bodyguards.
    const pay = 1500 + Math.floor(Math.random()*1500);
    const x = npc.group.position.x, z = npc.group.position.z;
    scene.remove(npc.group);
    const i = npcs.indexOf(npc); if(i > -1) npcs.splice(i, 1);
    deadNPCs[npc.name] = { x, z };
    saveCurrentUser();
    buildGrave(npc.name, x, z);
    queueEarning(pay, 5, `Assassinated ${npc.name}`);
    showNotif(`👑💀 You have assassinated ${npc.name}! The whole country is in shock.`);
    increaseWanted(3);
    return;
  }
  if(npc.job) {
    // One of the 40 Suburbs friends — always just a temporary knockdown, never permanent.
    npc.isDown = true;
    npc.group.rotation.z = Math.PI / 2;
    npc.group.position.y = -0.5;
    queueEarning(10, 0, `Defeated ${npc.name}`);
    increaseWanted(1);
    showNotif(`💥 Defeated ${npc.name}! +10 S.I.P. pending in Earnings`);
    setTimeout(() => {
      npc.isDown = false;
      npc.group.rotation.z = 0;
      npc.group.position.y = 0;
      npc.combatHp = undefined; // fresh fight next time
    }, 12000);
    return;
  }
  // A background citizen/officer — this one is real and permanent.
  const pay = isCop ? 4 : 10;
  const x = npc.group.position.x, z = npc.group.position.z;
  scene.remove(npc.group);
  const i = npcs.indexOf(npc); if(i > -1) npcs.splice(i, 1);
  deadNPCs[npc.name] = { x, z };
  saveCurrentUser();
  buildGrave(npc.name, x, z);
  queueEarning(pay, 0, `Defeated ${npc.name}`);
  showNotif(`💥 ...🪦 Nobody's noticed yet.`);
  // Nobody finds out right away — the wanted level (and the officers reacting to it) only
  // kicks in after a real delay, instead of instantly like the old knockdown-only version did.
  const delaySec = 15 + Math.random() * 20;
  setTimeout(() => {
    increaseWanted(isCop ? 2 : 1);
    showNotif(`🚨 Someone found out what happened to ${npc.name}. Police are on alert!`);
  }, delaySec * 1000);
}

// ─── HIRED KILLER — user's own ask: "you can hire killers to kill people by name and you get
// their money". Reuses the exact same `killers` array/mesh every ambient Killer already uses
// (see spawnKiller/tickAmbientKillerCombat above), just with a 3rd combat mode alongside
// ambient-vs-player and guard-shift-vs-bank: k.hitTargetName makes it hunt one specific NPC
// instead. Deliberately excludes Officers (attacking a cop already has its own real consequence
// path via wantedLevel/arrest — a hit shouldn't bypass that) and Mom/Dad (family isn't a
// legitimate hit target even in an otherwise-cartoonish crime sandbox).
const HIRE_KILLER_FEE = 150;
const HIT_EXCLUDED_ROLES = ['Officer', 'Your Mom', 'Your Dad'];
// A target's payout is deterministic from their own name (same trick STV's stvHash/
// stvFormatCount uses for fake subscriber counts) — the SAME name always pays the SAME amount,
// rather than a fresh random roll that would make "who's worth hitting" meaningless to learn.
function npcWealth(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return 300 + (h % 2200); // 300-2500 S.I.P.
}
function findHitTarget(name) {
  const query = name.trim().toLowerCase();
  if (!query) return null;
  if (currentUser && query === currentUser.toLowerCase()) return null; // can't hire a killer on yourself
  // A real online player takes priority over an NPC of the same name (extremely unlikely
  // collision, but a real person should win) — this is the actual point of this feature, not
  // just a fallback. Only possible in online mode, since remotePlayers is empty otherwise.
  if (serverMode === 'online') {
    const realName = Object.keys(remotePlayers).find(n => n.toLowerCase() === query);
    if (realName) return { name: realName, isRealPlayer: true };
  }
  return npcs.find(n => n.name.toLowerCase() === query && !HIT_EXCLUDED_ROLES.includes(n.role) && !n.isDown) || null;
}
function openHitmanModal() {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('hitmanNameInput').value = '';
  document.getElementById('hitmanPreview').textContent = '';
  document.getElementById('hitmanModal').style.display = 'flex';
}
function closeHitmanModal() {
  document.getElementById('hitmanModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function updateHitmanPreview() {
  const name = document.getElementById('hitmanNameInput').value;
  const target = findHitTarget(name);
  const el = document.getElementById('hitmanPreview');
  if (!name.trim()) { el.textContent = ''; return; }
  if (!target) { el.textContent = '❓ No one by that name is out and about right now.'; el.style.color = '#888'; return; }
  const alreadyTargeted = killers.some(k => k.alive && k.hitTargetName === target.name);
  if (alreadyTargeted) { el.textContent = `⏳ Already have a killer after ${target.name}.`; el.style.color = '#ffaa44'; return; }
  el.textContent = target.isRealPlayer
    ? `🎯 ${target.name} — a REAL PLAYER! Estimated payout: ${npcWealth(target.name)} S.I.P.`
    : `🎯 ${target.name} — estimated payout: ${npcWealth(target.name)} S.I.P.`;
  el.style.color = '#88ff88';
}
function confirmHireKiller() {
  const name = document.getElementById('hitmanNameInput').value;
  const target = findHitTarget(name);
  if (!target) { showNotif('❓ Nobody by that name to hire against.'); return; }
  if (killers.some(k => k.alive && k.hitTargetName === target.name)) { showNotif(`⏳ Already have a killer after ${target.name}.`); return; }
  if (sipDollars < HIRE_KILLER_FEE) { showNotif(`❌ Need ${HIRE_KILLER_FEE} S.I.P. to hire a killer.`); return; }
  spendSip(HIRE_KILLER_FEE); updateSIP();
  spawnHitman(target);
  showNotif(`🗡️ A killer is on ${target.name}'s trail...`);
  closeHitmanModal();
}
// User's own ask: "make it so you can kill any thing robots to robbers [in killer tab]" — a
// named-person hit (spawnHitman above) doesn't fit robots/robbers since neither has a unique
// name to type in, so this is a real second hire mode: your killer hunts down the NEAREST alive
// one of that TYPE instead of one specific named target, re-picking its nearest target every
// tick (so it keeps fighting even after its first target dies or a new one spawns), and reuses
// the exact same defeatRogueRobot()/defeatRobber() reward path a player's own fists would.
const HITMAN_TYPE_ATTACK_RANGE = 3, HITMAN_TYPE_ATTACK_INTERVAL = 1.2, HITMAN_TYPE_GIVEUP_SEC = 90;
function hireKillerAgainstType(type) {
  const label = type === 'robot' ? 'robots' : 'robbers';
  if (killers.some(k => k.alive && k.hitTargetType === type)) { showNotif(`⏳ Already have a killer hunting ${label}.`); return; }
  if (sipDollars < HIRE_KILLER_FEE) { showNotif(`❌ Need ${HIRE_KILLER_FEE} S.I.P. to hire a killer.`); return; }
  spendSip(HIRE_KILLER_FEE); updateSIP();
  const ang = Math.random()*Math.PI*2, dist = 15+Math.random()*10;
  const x = playerGroup.position.x + Math.cos(ang)*dist, z = playerGroup.position.z + Math.sin(ang)*dist;
  const mesh = buildKillerMesh(x, z);
  mesh.visible = true;
  killers.push({ id:'killer'+ROBOT_ID_SEQ++, x, z, hp:KILLER_HP, maxHp:KILLER_HP, mesh, alive:true, speed:4+Math.random()*1.5, hitTargetType: type, attackTimer:0, huntElapsed:0, revealed:true });
  showNotif(`🗡️ A killer is heading out to hunt down ${label} for you...`);
  closeHitmanModal();
}
function tickHitmanVsType(k, dt) {
  const pool = k.hitTargetType === 'robot' ? rogueRobots.filter(r => r.alive) : killers.filter(x => x.alive && x.robber);
  let nearest = null, nearestDist = Infinity;
  for (const e of pool) { const d = Math.hypot(e.x-k.x, e.z-k.z); if (d < nearestDist) { nearestDist = d; nearest = e; } }
  if (!nearest) {
    k.huntElapsed += dt;
    if (k.huntElapsed > HITMAN_TYPE_GIVEUP_SEC) {
      k.alive = false; if (k.mesh) scene.remove(k.mesh);
      showNotif(`🕵️ Your hired killer couldn't find any ${k.hitTargetType === 'robot' ? 'robots' : 'robbers'} and gave up.`);
    }
    return;
  }
  k.huntElapsed = 0;
  const dx = nearest.x-k.x, dz = nearest.z-k.z, dist = Math.hypot(dx, dz);
  if (dist < HITMAN_TYPE_ATTACK_RANGE) {
    k.attackTimer += dt;
    if (k.attackTimer > HITMAN_TYPE_ATTACK_INTERVAL) {
      k.attackTimer = 0;
      nearest.hp -= 8 + Math.floor(Math.random()*10);
      if (nearest.hp <= 0) { if (k.hitTargetType === 'robot') defeatRogueRobot(nearest); else defeatRobber(nearest); }
    }
  } else {
    k.x += dx/dist*k.speed*dt; k.z += dz/dist*k.speed*dt;
    k.mesh.position.set(k.x, 0, k.z);
    k.mesh.rotation.y = Math.atan2(dx, dz);
  }
}
function spawnHitman(target) {
  const isRealPlayer = !!target.isRealPlayer;
  const targetPos = isRealPlayer ? remotePlayers[target.name].mesh.position : target.group.position;
  const ang = Math.random()*Math.PI*2, dist = 40+Math.random()*20;
  const x = targetPos.x + Math.cos(ang)*dist, z = targetPos.z + Math.sin(ang)*dist;
  const mesh = buildKillerMesh(x, z);
  mesh.visible = true; // a hired hit isn't a jump-scare ambush — you can see them coming for the target
  killers.push({ id:'killer'+ROBOT_ID_SEQ++, x, z, hp:KILLER_HP, maxHp:KILLER_HP, mesh, alive:true, speed:4+Math.random()*1.5, hitTargetName: target.name, hitTargetIsPlayer: isRealPlayer, attackTimer:0, huntElapsed:0, revealed:true });
}
function tickHitmanCombat(k, dt) {
  if (k.hitTargetIsPlayer) { tickHitmanVsPlayer(k, dt); return; }
  const target = npcs.find(n => n.name === k.hitTargetName);
  if (!target) { k.alive = false; if (k.mesh) scene.remove(k.mesh); return; } // target already gone some other way — the hitman just leaves
  const dx = target.group.position.x-k.x, dz = target.group.position.z-k.z;
  const dist = Math.hypot(dx, dz);
  if (dist < KILLER_ATTACK_RANGE) {
    k.alive = false; if (k.mesh) scene.remove(k.mesh);
    completeHiredHit(target);
  } else {
    k.x += dx/dist*k.speed*dt; k.z += dz/dist*k.speed*dt;
    k.mesh.position.set(k.x, 0, k.z);
    k.mesh.rotation.y = Math.atan2(dx, dz);
  }
}
// A real player's HP/death only exists on THEIR OWN client, not ours — this killer can only chase
// their last-synced presence position (see remotePlayers/syncPresence) and land real hits through
// the same mailbox pipeline duel_hit already uses; it can never unilaterally declare them dead the
// way completeHiredHit() does for a local NPC. See handleMailboxMessage's 'hitman_kill_confirmed'
// for how the payout actually lands, once the target's own client confirms the kill.
const HITMAN_PLAYER_ATTACK_RANGE = 4;      // a bit more generous than melee — synced position can be up to ~1s stale
const HITMAN_PLAYER_ATTACK_INTERVAL = 3.5; // slower cadence than a co-located ambient killer — this is a real person, not a helpless NPC
const HITMAN_HUNT_TIMEOUT_SEC = 240;       // give up after ~4 real minutes rather than hunt forever if they can't be pinned down
function tickHitmanVsPlayer(k, dt) {
  const rp = remotePlayers[k.hitTargetName];
  if (!rp) {
    k.alive = false; if (k.mesh) scene.remove(k.mesh);
    showNotif(`🕵️ Your hired killer lost ${k.hitTargetName}'s trail — they went offline.`);
    return;
  }
  k.huntElapsed += dt;
  if (k.huntElapsed > HITMAN_HUNT_TIMEOUT_SEC) {
    k.alive = false; if (k.mesh) scene.remove(k.mesh);
    showNotif(`🕵️ Your hired killer gave up hunting ${k.hitTargetName} — too hard to pin down.`);
    return;
  }
  const dx = rp.mesh.position.x-k.x, dz = rp.mesh.position.z-k.z;
  const dist = Math.hypot(dx, dz);
  if (dist < HITMAN_PLAYER_ATTACK_RANGE) {
    k.attackTimer += dt;
    if (k.attackTimer > HITMAN_PLAYER_ATTACK_INTERVAL) {
      k.attackTimer = 0;
      const dmg = 8 + Math.floor(Math.random()*8); // same range an ambient Killer deals to the local player
      sendMail(k.hitTargetName, 'hitman_hit', { damage: dmg, from: playerName });
    }
  } else {
    k.x += dx/dist*k.speed*dt; k.z += dz/dist*k.speed*dt;
    k.mesh.position.set(k.x, 0, k.z);
    k.mesh.rotation.y = Math.atan2(dx, dz);
  }
}
// Fires on the HIRER's client once the target's own client confirms the kill (see knockoutPlayer's
// hitman branch) — mirrors completeHiredHit()'s payout/wanted-level shape exactly, just without a
// local NPC object or a real grave, since the target only ever existed on our screen as a killer
// mesh chasing a synced position.
function completeHiredHitOnPlayer(targetName) {
  const wealth = npcWealth(targetName);
  queueEarning(wealth, 0, `Hit on ${targetName}`);
  showNotif(`🗡️ Your hired killer got ${targetName}! ${wealth} S.I.P. pending in Earnings.`);
  const delaySec = 20 + Math.random()*25;
  setTimeout(() => {
    increaseWanted(1);
    showNotif(`🚨 The hit on ${targetName} got traced back to you. Police are on alert!`);
  }, delaySec*1000);
}
// User's own follow-up: "they could kill them in really unexpected ways 90% of the time" — a
// pool of cartoon-slapstick methods (Looney Tunes-style anvils/pianos, not anything graphic),
// each a template with {name} filled in, picked 90% of the time; the other 10% stays the plain
// original line so "unexpected" still occasionally means "no punchline, just handled."
const HIT_METHODS = [
  '{name} was flattened by a piano that fell from a passing crane.',
  '{name} slipped on a banana peel directly into an open manhole.',
  '{name} was launched into orbit by a novelty catapult.',
  '{name} got carried off by a suspiciously well-organized flock of pigeons.',
  '{name} was struck by lightning during a completely clear sky.',
  '{name} vanished after tripping over a rogue banana cart.',
  '{name} got swarmed and carried away by angry bees.',
  '{name} was run over by their own runaway ice cream truck.',
  '{name} fell into a vending machine and was never seen again.',
  '{name} was abducted by a suspiciously well-timed UFO.',
  '{name} slipped on a "wet floor" sign that definitely wasn\'t wet.',
  '{name} was squashed flat by a giant anvil, Looney Tunes style.',
  '{name} got sucked into an industrial-strength vacuum cleaner.',
  '{name} was launched off a seesaw by an elephant sitting on the other end.',
  '{name} tripped over their own shoelaces into a bottomless pit.',
  '{name} was flattened by a safe falling from a 10th-story window.',
  '{name} got tangled in a kite string and carried off by the wind.',
  '{name} was mistaken for a pizza and dragged off by a giant seagull.',
];
function hitFlavorText(name) {
  if (HIT_METHODS.length && Math.random() < 0.9) {
    return HIT_METHODS[Math.floor(Math.random()*HIT_METHODS.length)].replace('{name}', name);
  }
  return `The hit on ${name} is done.`;
}
function completeHiredHit(target) {
  const wealth = npcWealth(target.name);
  const x = target.group.position.x, z = target.group.position.z;
  scene.remove(target.group);
  const i = npcs.indexOf(target); if (i > -1) npcs.splice(i, 1);
  deadNPCs[target.name] = { x, z };
  saveCurrentUser();
  buildGrave(target.name, x, z);
  queueEarning(wealth, 0, `Hit on ${target.name}`);
  showNotif(`🗡️ ${hitFlavorText(target.name)} ${wealth} S.I.P. pending in Earnings.`);
  const delaySec = 20 + Math.random()*25;
  setTimeout(() => {
    increaseWanted(1);
    showNotif(`🚨 The hit on ${target.name} got traced back to you. Police are on alert!`);
  }, delaySec*1000);
}

function tickWanted(dt) {
  // Cool down shop robbery timers
  for(const shop in robbedCooldowns) {
    if(robbedCooldowns[shop] > 0) robbedCooldowns[shop] -= dt;
  }
  if(!wantedLevel || inMall || inHouse) return;
  // Officers chase the player
  for(const npc of npcs) {
    if(npc.role !== 'Officer' || npc.isDown) continue;
    const dx = playerGroup.position.x - npc.group.position.x;
    const dz = playerGroup.position.z - npc.group.position.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    if(dist < 2.5) { arrest(); return; }
    const chaseSpeed = 0.05 + wantedLevel * 0.02;
    npc.group.position.x += (dx/dist) * chaseSpeed;
    npc.group.position.z += (dz/dist) * chaseSpeed;
    npc.group.rotation.y = Math.atan2(dx, dz);
  }
}

// ─── CELEBRITIES — user's own ask: "make celebertys and npces will follow them and he does stuff
// like mr beast". Deliberately 3 ORIGINAL characters (Chaz Diamond/Vex Nova/Bree Millions, see
// their entries in NPC_DEFS) — never a real person's name or likeness, same reasoning already
// applied to STV's channels (Explox is sold for real money; using a real, still-active public
// figure's identity in it is a real legal risk, not just a style choice). Each one roams a big
// patrol loop (the same shared patrol tick every NPC already uses) and periodically runs a real
// timed event — a Giveaway (a real S.I.P./Elite reward if you're near them when it fires) or a
// Challenge (stay within range of them for a real countdown to win a bigger prize, reset if you
// wander off) — while ordinary Citizen/Jogger/Tourist/Vendor NPCs physically flock toward
// whichever celebrity is nearest, for the crowd-of-fans look.
const CELEBRITY_CROWD_ROLES = ['Citizen','Jogger','Tourist','Vendor'];
const CELEBRITY_FOLLOW_RADIUS = 25, CELEBRITY_FOLLOW_SPEED = 2.2;
const CELEBRITY_GIVEAWAY_RADIUS = 12, CELEBRITY_CHALLENGE_RADIUS = 8;
const CELEBRITY_EVENT_MIN_GAP = 40, CELEBRITY_EVENT_MAX_GAP = 90; // real seconds (playTimeSeconds) between events, per celebrity
const CELEBRITY_CHALLENGE_DURATION = 12; // real seconds standing near them to win
let celebrityState = {}; // { name: {nextEventAt, activeEvent:null|{type,playerTime,lastPingAt}} } — ambient world state, not persisted, same as rogue robot/killer spawns
function celebNextEventAt() { return playTimeSeconds + CELEBRITY_EVENT_MIN_GAP + Math.random()*(CELEBRITY_EVENT_MAX_GAP-CELEBRITY_EVENT_MIN_GAP); }
function celebGet(name) {
  if(!celebrityState[name]) celebrityState[name] = { nextEventAt: celebNextEventAt(), activeEvent: null };
  return celebrityState[name];
}
function tickCelebrities(dt) {
  for(const npc of npcs) {
    if(npc.role !== 'Celebrity') continue;
    const st = celebGet(npc.name);
    const dist = Math.hypot(playerGroup.position.x - npc.group.position.x, playerGroup.position.z - npc.group.position.z);
    if(!st.activeEvent && playTimeSeconds >= st.nextEventAt) {
      st.activeEvent = { type: Math.random() < 0.5 ? 'giveaway' : 'challenge', playerTime: 0, lastPingAt: 0 };
      showNotif(`🎉 ${npc.name} is doing a ${st.activeEvent.type === 'giveaway' ? 'GIVEAWAY' : 'CHALLENGE'}! Get close!`);
    }
    if(!st.activeEvent) continue;
    if(st.activeEvent.type === 'giveaway') {
      if(dist < CELEBRITY_GIVEAWAY_RADIUS) {
        const sip = 200 + Math.floor(Math.random()*300), elite = 1 + Math.floor(Math.random()*3);
        queueEarning(sip, elite, `${npc.name}'s Giveaway`);
        showNotif(`💰 You caught ${npc.name}'s giveaway! Check Earnings.`);
        st.activeEvent = null; st.nextEventAt = celebNextEventAt();
      }
    } else { // challenge
      if(dist < CELEBRITY_CHALLENGE_RADIUS) {
        st.activeEvent.playerTime += dt;
        if(playTimeSeconds - st.activeEvent.lastPingAt > 2) {
          st.activeEvent.lastPingAt = playTimeSeconds;
          showNotif(`⚡ Staying with ${npc.name}... ${Math.ceil(CELEBRITY_CHALLENGE_DURATION - st.activeEvent.playerTime)}s to go!`);
        }
        if(st.activeEvent.playerTime >= CELEBRITY_CHALLENGE_DURATION) {
          const sip = 500 + Math.floor(Math.random()*500), elite = 3 + Math.floor(Math.random()*3);
          queueEarning(sip, elite, `${npc.name}'s Challenge`);
          showNotif(`🏆 You won ${npc.name}'s challenge! Check Earnings.`);
          st.activeEvent = null; st.nextEventAt = celebNextEventAt();
        }
      } else if(st.activeEvent.playerTime > 0) {
        showNotif(`❌ You left ${npc.name}'s challenge — progress reset!`);
        st.activeEvent.playerTime = 0;
      }
    }
  }
}
// Regular citizens physically flock toward whichever celebrity is nearest, within range — runs
// AFTER the shared patrol tick already moved every NPC this frame, same override trick
// tickWanted() (right above) uses for Officers chasing the player.
function tickCelebrityCrowds(dt) {
  const celebs = npcs.filter(n => n.role === 'Celebrity');
  if(!celebs.length) return;
  for(const npc of npcs) {
    if(!CELEBRITY_CROWD_ROLES.includes(npc.role) || npc.isDown) continue;
    let nearest = null, nearestDist = Infinity;
    for(const c of celebs) {
      const d = Math.hypot(c.group.position.x - npc.group.position.x, c.group.position.z - npc.group.position.z);
      if(d < nearestDist) { nearestDist = d; nearest = c; }
    }
    if(!nearest || nearestDist > CELEBRITY_FOLLOW_RADIUS) continue;
    // A fixed personal spot in the crowd (angle+distance), rolled once per NPC so they don't all
    // pile onto the exact same point, and reused every frame so the crowd holds its shape.
    if(npc._crowdAngle === undefined) { npc._crowdAngle = Math.random()*Math.PI*2; npc._crowdDist = 2 + Math.random()*4; }
    const tx = nearest.group.position.x + Math.cos(npc._crowdAngle)*npc._crowdDist;
    const tz = nearest.group.position.z + Math.sin(npc._crowdAngle)*npc._crowdDist;
    const dx = tx - npc.group.position.x, dz = tz - npc.group.position.z;
    const d = Math.hypot(dx, dz);
    if(d > 0.3) {
      npc.group.position.x += (dx/d) * CELEBRITY_FOLLOW_SPEED * dt;
      npc.group.position.z += (dz/d) * CELEBRITY_FOLLOW_SPEED * dt;
      npc.group.rotation.y = Math.atan2(dx, dz);
    }
  }
}

// Walking up to a President (see PRESIDENT_ROSTER/generatePresidentNPCs above) triggers a real
// State Visit reward on a per-president cooldown — simple proximity, same pattern as the
// Celebrity Giveaway, deliberately not gated behind an E-press since a Bodyguard-flanked head of
// state greeting you the moment you approach reads better than a menu prompt.
const PRESIDENT_VISIT_RADIUS = 6, PRESIDENT_VISIT_COOLDOWN = 300; // 5 real minutes between visits, per president
let presidentVisitState = {}; // { name: lastVisitAt (playTimeSeconds) } — ambient world state, not persisted, same as celebrityState
function tickPresidents(dt) {
  for(const npc of npcs) {
    if(npc.role !== 'President') continue;
    const dist = Math.hypot(playerGroup.position.x - npc.group.position.x, playerGroup.position.z - npc.group.position.z);
    if(dist > PRESIDENT_VISIT_RADIUS) continue;
    const last = presidentVisitState[npc.name] !== undefined ? presidentVisitState[npc.name] : -Infinity;
    if(playTimeSeconds - last < PRESIDENT_VISIT_COOLDOWN) continue;
    presidentVisitState[npc.name] = playTimeSeconds;
    const sip = 300 + Math.floor(Math.random()*400), elite = 2 + Math.floor(Math.random()*3);
    queueEarning(sip, elite, `State visit with ${npc.name}`);
    showNotif(`🤝 ${npc.name} welcomes you! A diplomatic gift has been added to Earnings.`);
  }
}

function toggleAlignment() {
  if(alignment === 'good') {
    alignment = 'bad';
    document.getElementById('alignmentHud').style.display = 'block';
    showNotif('😈 You joined the underground. The Black Market is now open.');
  } else {
    alignment = 'good';
    document.getElementById('alignmentHud').style.display = 'none';
    showNotif('😇 You went straight. Stay clean.');
  }
  saveCurrentUser();
}

function openBlackMarket() {
  if(alignment !== 'bad') { showNotif('🚫 You don\'t belong here. Only bad guys allowed.'); return; }
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('shopOverlay').style.display = 'flex';
  document.getElementById('shopTitle').textContent = '🕴️ Black Market';
  const items = document.getElementById('shopItems');
  items.innerHTML = '';
  BLACK_MARKET_ITEMS.forEach((item, i) => {
    const already = item.weaponId && ownedWeapons.includes(item.weaponId);
    const d = document.createElement('div'); d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${item.name}</div><div class="siCost">💰 ${item.cost} S.I.P.</div>
      <button class="shopBtn" ${already?'disabled':''} onclick="buyBlackMarketItem(${i})">${already?'Owned':'Buy'}</button>`;
    items.appendChild(d);
  });
}

function buyBlackMarketItem(idx) {
  const item = BLACK_MARKET_ITEMS[idx];
  if(sipDollars < item.cost) { showNotif('❌ Not enough S.I.P.!'); return; }
  spendSip(item.cost);
  if(item.sipReward) { queueEarning(item.sipReward, 0, 'Black Market'); showNotif(`💰 Laundered! +${item.sipReward} S.I.P. pending in Earnings`); }
  if(item.weaponId) {
    if(!ownedWeapons.includes(item.weaponId)) ownedWeapons.push(item.weaponId);
    playerWeapon = item.weaponId;
    updateWeaponMesh();
    showNotif(`🗡️ Got the ${item.name}!`);
  }
  if(item.shirtId) { playerShirt = item.shirtId; buildPlayer(); showNotif(`🥷 New look equipped!`); }
  updateSIP();
  openBlackMarket();
}

function tickCook(dt) {
  const hud = document.getElementById('jobHud');
  if(cookState === 'has_ingredients') { hud.textContent = '🧺 Have ingredients — go prep!'; hud.style.color = '#88ff88'; }
  else if(cookState === 'prepared')   { hud.textContent = '✅ Prepped — go cook!'; hud.style.color = '#FFD700'; }
  else if(cookState === 'ready')      { hud.textContent = '🍕 Deliver to a customer!'; hud.style.color = '#ff6600'; }
}

