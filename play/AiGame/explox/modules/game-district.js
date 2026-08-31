// ─── SHOPPING DISTRICT — 100 real named shops, each with 10 items and a billboard ad ──────
// Content (name templates/words, 12 items, 3 ad slogans per category) came from 4 parallel
// agents covering 25 shop categories total — same "hand-authored seed + formula" trick as
// everything else in this file that needs volume (1000 store ingredients, 50 music tracks,
// 40 Suburbs houses): 25 categories x 4 name/item variations each = exactly 100 unique shops.
const SHOP_CATEGORIES = [
  {
    id: 'toy_store', category: 'Toy Store', emoji: '🧸',
    nameTemplates: ["{word}'s Toy Box", "The {word} Toy Shop", "{word} Toy Kingdom", "{word} Play Place", "{word} Fun Factory"],
    nameWords: ['Rainbow','Sparkle','Jolly','Max','Sunny','Giggles','Bounce','Whiz','Pixel','Cosmo','Ziggy','Wonder'],
    items: ['Building Blocks','Action Figures','Board Games','Jigsaw Puzzles','Stuffed Animals','Remote Control Cars','Dolls','Art Sets','Science Kits','Yo-Yos','Kites','Card Games'],
    ads: ['Where playtime never ends!','New toys, new adventures every day!','Fun for every kid, big or small!'],
  },
  {
    id: 'pet_shop', category: 'Pet Shop', emoji: '🐾',
    nameTemplates: ["{word}'s Pet Corner", "The {word} Pet Shop", "{word} Paws & Claws", "{word} Critter Corral", "{word} Pet Palace"],
    nameWords: ['Furry','Whiskers','Buddy','Chirpy','Waggles','Nibbles','Paws','Fluff','Scout','Marbles','Patches','Bubbles'],
    items: ['Puppy Leash','Cat Scratching Post','Goldfish Tank','Hamster Wheel','Bird Cage','Dog Chew Toy','Catnip Mice','Rabbit Hutch','Pet Food Bowl','Turtle Terrarium','Bunny Treats','Squeaky Bone'],
    ads: ['Happy pets, happy homes!','Everything your furry friend needs!','Come meet your new best friend!'],
  },
  {
    id: 'book_store', category: 'Book Store', emoji: '📚',
    nameTemplates: ["{word}'s Book Nook", "The {word} Bookshelf", "{word} Reading Room", "{word} Storybook Shop", "{word} Page Turner"],
    nameWords: ['Chapter','Inkwell','Willow','Sage','Quill','Marlow','Pepper','Story','Hazel','Finch','Bramble','Owl'],
    items: ['Comic Books','Picture Books','Adventure Novels','Mystery Stories','Fairy Tale Collection','Coloring Books','Joke Books','Encyclopedia Set','Poetry Books','Graphic Novels','Bookmarks','Magic Trick Guide'],
    ads: ['A new adventure on every page!','Get lost in a good story!','Reading made fun for everyone!'],
  },
  {
    id: 'candy_shop', category: 'Candy Shop', emoji: '🍬',
    nameTemplates: ["{word}'s Candy Corner", "The {word} Sweet Shop", "{word} Sugar Rush", "{word} Candy Kitchen", "{word} Treat Stop"],
    nameWords: ['Sugarplum','Lolli','Minty','Fizzy','Choco','Gummy','Sprinkle','Caramel','Peppermint','Bubblegum','Taffy','Frosty'],
    items: ['Gummy Bears','Lollipops','Chocolate Bars','Cotton Candy','Candy Canes','Jelly Beans','Caramel Apples','Bubble Gum','Sour Worms','Rock Candy','Marshmallow Pops','Fudge Squares'],
    ads: ['The sweetest shop in town!','A treat for every sweet tooth!','Smiles come in candy flavors!'],
  },
  {
    id: 'sports_store', category: 'Sports Store', emoji: '⚽',
    nameTemplates: ["{word}'s Sports Shop", "The {word} Sports Zone", "{word} Athletic Outfitters", "{word} Game Gear", "{word} Sports Depot"],
    nameWords: ['Champion','Blaze','Turbo','Ace','Rocket','Thunder','Victory','Comet','Storm','Rally','Dash','Slam'],
    items: ['Soccer Ball','Basketball','Baseball Glove','Tennis Racket','Skateboard','Bicycle Helmet','Swim Goggles','Jump Rope','Hockey Stick','Football','Running Shoes','Water Bottle'],
    ads: ['Gear up and get in the game!','Play hard, play smart!','Everything you need to score big!'],
  },
  {
    id: 'art_supplies_store', category: 'Art Supplies Store', emoji: '🎨',
    nameTemplates: ["{word}'s Art Studio", "The {word} Art Shop", "{word} Craft Corner", "{word} Palette Place", "{word} Creative Corner"],
    nameWords: ['Palette','Doodle','Canvas','Crayon','Sketch','Glitter','Prisma','Mosaic','Inkling','Brush','Clover','Violet'],
    items: ['Colored Pencils','Watercolor Paint Set','Sketchbook','Modeling Clay','Glitter Glue','Paintbrush Set','Crayons','Construction Paper','Safety Scissors','Stickers','Easel','Chalk Pastels'],
    ads: ['Bring your imagination to life!','Every masterpiece starts here!','Create something amazing today!'],
  },
  {
    id: 'music_store', category: 'Music Store', emoji: '🎵',
    nameTemplates: ["{word}'s Music Shop", "The {word} Music Room", "{word} Sound Studio", "{word} Melody Store", "{word} Rhythm Shop"],
    nameWords: ['Melody','Harmony','Rhythm','Tempo','Piccolo','Jazzy','Treble','Chord','Echo','Beats','Sonata','Breezy'],
    items: ['Ukulele','Recorder Flute','Toy Drum Set','Keyboard Piano','Kids Guitar','Tambourine','Xylophone','Maracas','Harmonica','Music Note Stickers','Songbook','Headphones'],
    ads: ['Find your sound here!','Music makes everything better!',"Let's make some noise!"],
  },
  {
    id: 'shoe_store', category: 'Shoe Store', emoji: '👟',
    nameTemplates: ["{word}'s Shoe Stop", "The {word} Sole", "{word} Footwear Co.", "{word} Step & Stride", "{word}'s Sneaker Spot"],
    nameWords: ['Rainbow','Sparkle','Jolly','Max','Sunny','Comet','Breeze','Ziggy','Turbo','Pepper','Cloud','Dash'],
    items: ['Light-Up Sneakers','Rain Boots','Velcro Sneakers','High-Top Basketball Shoes','Glitter Flip-Flops','Soccer Cleats','Fuzzy Slippers','Roller Sneakers','Hiking Boots','Ballet Flats','Superhero Sneakers','Sparkly Sandals'],
    ads: ['Step into style!','Happy feet, every day!','New kicks, new tricks!'],
  },
  {
    id: 'electronics_store', category: 'Electronics Store', emoji: '📱',
    nameTemplates: ['{word} Electronics', '{word} Tech Hub', 'The {word} Gadget Shop', '{word} Circuit City', "{word}'s Tech Spot"],
    nameWords: ['Byte','Pixel','Volt','Nova','Turbo','Spark','Circuit','Flash','Quantum','Robo','Wire','Zap'],
    items: ['Wireless Headphones','Tablet Case','Handheld Game Console','Bluetooth Speaker','Smartwatch','Phone Charger','Remote Control Car','Digital Camera','Gaming Mouse','LED Desk Lamp','Walkie-Talkies','Karaoke Microphone'],
    ads: ['Power up your world!','Gadgets that click!','Plug into fun!'],
  },
  {
    id: 'comic_book_shop', category: 'Comic Book Shop', emoji: '💥',
    nameTemplates: ['{word} Comics', 'The {word} Comic Vault', "{word}'s Hero HQ", '{word} Panel Shop', '{word} Comic Corner'],
    nameWords: ['Captain','Zoom','Blaze','Nova','Fable','Mystic','Bolt','Ace','Cosmo','Ripley','Vex','Orbit'],
    items: ['Superhero Comic Book','Graphic Novel','Trading Card Pack','Action Figure','Comic Poster','Villain Sticker Sheet','Cape Costume',"Collector's Comic Box",'Comic Bookmark','Hero Mask','Comic Backpack Pin','Mini Comic Figurine'],
    ads: ['Unleash your inner hero!','Adventure on every page!','Heroes start here!'],
  },
  {
    id: 'bakery', category: 'Bakery', emoji: '🧁',
    nameTemplates: ["{word}'s Bakery", 'The {word} Bake Shop', '{word} Sweet Treats', '{word} Bread & Buns', "{word}'s Sugar Shop"],
    nameWords: ['Sunny','Sprinkle','Honey','Buttercup','Maple','Cinnamon','Rosie','Pippin','Sugar','Clover','Marigold','Butterscotch'],
    items: ['Chocolate Chip Cookie','Rainbow Cupcake','Birthday Cake Slice','Cinnamon Roll','Blueberry Muffin','Glazed Donut','Sugar Cookie','Fresh Bagel','Fruit Tart','Soft Pretzel','Gingerbread Cookie','Strawberry Cake Pop'],
    ads: ['Freshly baked happiness!','Sweet treats, warm smiles!','Rise and shine with us!'],
  },
  {
    id: 'card_gift_shop', category: 'Card & Gift Shop', emoji: '🎁',
    nameTemplates: ["{word}'s Card & Gift", 'The {word} Gift Nook', '{word} Gifts Galore', "{word}'s Wrap & Ribbon", '{word} Greetings Shop'],
    nameWords: ['Bloom','Wishful','Twinkle','Cheer','Ribbon','Petal','Glimmer','Joyful','Willow','Buttons','Confetti','Merry'],
    items: ['Birthday Card','Gift Wrap Roll','Stuffed Teddy Bear','Scented Candle','Photo Frame','Balloon Bouquet','Gift Bag','Greeting Card Set','Mini Trophy','Keychain Charm','Party Confetti Poppers','Thank-You Notecards'],
    ads: ['The perfect gift, every time!','Wrap up something wonderful!','Say it with a gift!'],
  },
  {
    id: 'craft_store', category: 'Craft Store', emoji: '✂️',
    nameTemplates: ["{word}'s Craft Corner", 'The {word} Craft Shop', '{word} Arts & Crafts', "{word}'s Creative Studio", '{word} Craft Supply Co.'],
    nameWords: ['Paisley','Doodle','Glitterbug','Cricket','Marble','Inkwell','Button','Yarnley','Pixel','Scribble','Clay','Fern'],
    items: ['Watercolor Paint Set','Glitter Glue','Yarn Skein','Colored Pencils','Sticker Sheet Pack','Modeling Clay','Pom-Pom Bag','Craft Scissors','Beading Kit','Origami Paper Pack','Pipe Cleaners Bundle','Popsicle Sticks Box'],
    ads: ['Create something amazing!','Craft your imagination!','Where creativity comes alive!'],
  },
  {
    id: 'skate_shop', category: 'Skate Shop', emoji: '🛹',
    nameTemplates: ["{word}'s Skate Spot", 'The {word} Grind', '{word} Wheels', '{word} Skatepark Shop', "{word}'s Board Shack"],
    nameWords: ['Rainbow','Turbo','Blaze','Comet','Rocket','Sunny','Max','Ziggy','Nova','Ollie','Ramp','Grip'],
    items: ['Skateboard Deck','Skateboard Wheels','Skateboard Trucks','Helmet','Knee Pads','Elbow Pads','Wrist Guards','Grip Tape','Longboard','Scooter','Skate Shoes','Bearings Set'],
    ads: ['Ride into fun!','Wheels up, worries down!','Grind, glide, and smile!'],
  },
  {
    id: 'party_supplies_store', category: 'Party Supplies Store', emoji: '🎉',
    nameTemplates: ['{word} Party Palace', 'The {word} Bash Shop', "{word}'s Celebration Station", '{word} Confetti Corner', "{word}'s Party Place"],
    nameWords: ['Sparkle','Confetti','Balloon','Jolly','Giggle','Festive','Zippy','Rainbow','Bash','Cheer','Bloom','Party'],
    items: ['Balloon Bundle','Confetti Poppers','Birthday Banner','Paper Plates','Party Hats','Streamers','Piñata','Gift Bags','Candles Pack','Noisemakers','Table Cloth','Party Favors'],
    ads: ["Every day's a celebration!",'Pop, party, and play!','Make your party pop!'],
  },
  {
    id: 'hobby_shop', category: 'Hobby Shop', emoji: '🧩',
    nameTemplates: ["{word}'s Hobby Hut", 'The {word} Workshop', '{word} Craft Corner', "{word}'s Tinker Shop", '{word} Hobby Nook'],
    nameWords: ['Puzzle','Tinker','Craft','Marvel','Wonder','Gizmo','Nifty','Spark','Model','Whiz','Doodle','Buzzy'],
    items: ['Model Airplane Kit','1000-Piece Puzzle','Paint Set','Remote Control Car','Building Blocks Set','Yarn Bundle','Stamp Collection Kit','Train Set','Origami Paper Pack','Rock Tumbler','Bead Kit','Telescope'],
    ads: ['Find your next fun project!','Craft something amazing today!','Hobbies made happy!'],
  },
  {
    id: 'fashion_boutique', category: 'Fashion Boutique', emoji: '👗',
    nameTemplates: ["{word}'s Boutique", 'The {word} Closet', '{word} Style Studio', "{word}'s Fashion Corner", '{word} Threads'],
    nameWords: ['Glimmer','Velvet','Posh','Trendy','Chic','Blossom','Dazzle','Willow','Rosy','Glam','Star','Mimi'],
    items: ['Sundress','Graphic T-Shirt','Denim Jacket','Sneakers','Sun Hat','Sparkly Backpack','Scarf','Leggings','Hair Clips','Sunglasses','Friendship Bracelet Kit','Cozy Hoodie'],
    ads: ['Wear your style with pride!','Fresh looks, every day!','Dress up, shine bright!'],
  },
  {
    id: 'video_game_store', category: 'Video Game Store', emoji: '🎮',
    nameTemplates: ['{word} Game Zone', 'The {word} Arcade', "{word}'s Game Vault", '{word} Pixel Shop', "{word}'s Quest Corner"],
    nameWords: ['Pixel','Retro','Turbo','Byte','Quest','Arcade','Nova','Comet','Joystick','Level','Zap','Circuit'],
    items: ['Video Game Console','Controller','Game Cartridge','Gaming Headset','Charging Dock','Trading Card Game','Handheld Console','Game Poster','Joystick','Memory Card','Gaming Chair','Strategy Guide Book'],
    ads: ['Level up your fun!','Press start on adventure!','Game on, always!'],
  },
  {
    id: 'plant_shop', category: 'Plant Shop', emoji: '🌱',
    nameTemplates: ["{word}'s Plant Nook", 'The {word} Garden Shop', '{word} Bloom & Grow', "{word}'s Green Corner", '{word} Sprout Studio'],
    nameWords: ['Bloom','Sprout','Leafy','Petal','Fern','Sunny','Moss','Berry','Daisy','Willow','Meadow','Clover'],
    items: ['Sunflower Seeds Pack','Potted Cactus','Watering Can','Flower Pot','Succulent Trio','Herb Garden Kit','Bonsai Tree','Fertilizer Bag','Garden Gloves','Hanging Fern','Tulip Bulbs','Terrarium Kit'],
    ads: ['Grow something wonderful!','Plant a little joy!','Fresh green, fresh fun!'],
  },
  {
    id: 'jewelry_store', category: 'Jewelry Store', emoji: '💍',
    nameTemplates: ["{word}'s Gems", 'The {word} Jewel Box', '{word} Sparkle Shop', '{word} & Co. Jewelers', "{word}'s Treasure Case"],
    nameWords: ['Rainbow','Sparkle','Sunny','Luna','Coral','Jolly','Max','Ruby','Star','Pearl','Glimmer','Nova'],
    items: ['Friendship Bracelet','Charm Necklace','Star Stud Earrings','Birthstone Ring','Heart Locket','Beaded Anklet','Glitter Hair Pin','Rainbow Pendant','Pearl Hairband','Mood Ring','Puzzle Piece Necklace','Gem Cufflinks'],
    ads: ['Shine bright every day!','Sparkle you can wear!','Treasures for every smile!'],
  },
  {
    id: 'furniture_store', category: 'Furniture Store', emoji: '🛋️',
    nameTemplates: ['{word} Home Furnishings', 'The {word} Furniture Barn', "{word}'s Comfy Corner", '{word} & Sons Furniture', '{word} Living Co.'],
    nameWords: ['Cozy','Oakwood','Maple','Comfy','Nestle','Willow','Grand','Homestead','Cedar','Plush','Snug','Timber'],
    items: ['Bunk Bed','Bean Bag Chair','Study Desk','Bookshelf','Rocking Chair','Toy Chest','Coffee Table','Dresser','Nightstand','Floor Lamp','Storage Ottoman','Comfy Sofa'],
    ads: ['Furniture that feels like home!','Cozy up your space today!','Comfort built to last!'],
  },
  {
    id: 'phone_accessories_store', category: 'Phone Accessories Store', emoji: '📲',
    nameTemplates: ['{word} Phone Gear', 'The {word} Case Shop', '{word} Tech Accessories', "{word}'s Gadget Stop", '{word} Mobile Zone'],
    nameWords: ['Pixel','Byte','Circuit','Flash','Zoom','Spark','Volt','Techy','Signal','Glow','Turbo','Pixelbot'],
    items: ['Glitter Phone Case','Pop-Up Grip Stand','Cartoon Charm Strap','Screen Protector','Wireless Earbuds','Selfie Stick','Phone Ring Holder','Cute Cable Cover','Portable Charger','Sticker Pack','Camera Lens Clip','Glow-in-Dark Case'],
    ads: ['Gear up your gadget!','Protect it, style it, love it!','Accessories that pop!'],
  },
  {
    id: 'stationery_shop', category: 'Stationery Shop', emoji: '✏️',
    nameTemplates: ['{word} Paper & Pens', 'The {word} Stationery Nook', "{word}'s Scribble Shop", '{word} Notebook Co.', '{word} Desk Supplies'],
    nameWords: ['Doodle','Inkwell','Scribble','Paperclip','Crayon','Sketch','Quill','Notely','Glitterpen','Squiggle','Papertown','Bright'],
    items: ['Sparkle Notebook','Gel Pen Set','Scented Eraser','Sticker Sheet','Washi Tape Roll','Colored Pencil Pack','Glitter Glue','Bookmark Set','Desk Organizer','Stamp Kit','Mini Stapler','Rainbow Highlighters'],
    ads: ['Write your story in style!','Doodle dreams start here!','Colorful supplies for creative minds!'],
  },
  {
    id: 'aquarium_fish_store', category: 'Aquarium & Fish Store', emoji: '🐠',
    nameTemplates: ["{word}'s Fish Tank", 'The {word} Aquarium', '{word} Reef & Ripple', "{word}'s Bubble Shop", '{word} Underwater World'],
    nameWords: ['Bubbles','Coral','Splash','Finn','Marina','Wavy','Pearl','Ripple','Aqua','Shelly','Tide','Nemo'],
    items: ['Goldfish','Betta Fish','Glass Fish Tank','Colorful Gravel','Bubble Aerator','Fish Food Flakes','Mini Castle Decoration','Aquarium Plant','Snail Buddy','Net Scooper','LED Tank Light','Fish Bowl Starter Kit'],
    ads: ['Dive into fish-keeping fun!','Bring the ocean home!','Happy fish, happy home!'],
  },
  {
    id: 'bike_shop', category: 'Bike Shop', emoji: '🚲',
    nameTemplates: ['{word} Bike Works', 'The {word} Pedal Shop', "{word}'s Cycle Stop", '{word} Wheels Co.', '{word} Bike Garage'],
    nameWords: ['Speedy','Turbo','Wheelie','Rusty','Pedalpower','Blaze','Rocket','Gearhead','Cruiser','Dash','Zippy','Trailblazer'],
    items: ['Kids Mountain Bike','Training Wheels','Bike Helmet','Handlebar Streamers','Bike Bell','Water Bottle Holder','Kickstand','Bike Basket','Reflective Stickers','Repair Kit','Knee Pad Set','Bike Lock'],
    ads: ['Pedal into adventure!','Ride happy, ride safe!','Wheels that make you smile!'],
  },
];
// Real S.I.P. price band per category (low-cost item .. flagship item), picked to feel plausible
// against what's already priced elsewhere in the game (Ice Cream 8, Jewelry 30, Phone 45, cars
// 2000+). Every category's 12 items get a distinct price via priceForItem() below — items earlier
// in cat.items skew toward the low end, later ones toward the high end.
const CATEGORY_PRICE_RANGE = {
  toy_store:[10,40], pet_shop:[8,45], book_store:[5,25], candy_shop:[2,10], sports_store:[12,60],
  art_supplies_store:[5,30], music_store:[10,70], shoe_store:[15,55], electronics_store:[25,90],
  comic_book_shop:[4,30], bakery:[3,12], card_gift_shop:[5,35], craft_store:[4,28], skate_shop:[20,90],
  party_supplies_store:[4,25], hobby_shop:[10,60], fashion_boutique:[10,45], video_game_store:[15,80],
  plant_shop:[5,30], jewelry_store:[15,60], furniture_store:[40,150], phone_accessories_store:[6,35],
  stationery_shop:[3,18], aquarium_fish_store:[8,50], bike_shop:[30,120],
};
function priceForItem(cat, itemName) {
  const idx = cat.items.indexOf(itemName);
  const [lo, hi] = CATEGORY_PRICE_RANGE[cat.id];
  return Math.round(lo + (hi - lo) * idx / (cat.items.length - 1));
}
// 25 categories x 4 variations each = 100 shops. Shop k in a category picks nameTemplates[k],
// nameWords[k] (so all 4 names in a category are distinct), and a ROTATED 10-of-12 window of
// that category's items (items[k..k+9] wrapping) so the 4 shops of one category don't all sell
// an identical list — same rotation trick, different items each time.
function generateCityShops() {
  const shops = [];
  SHOP_CATEGORIES.forEach(cat => {
    for (let k = 0; k < 4; k++) {
      const name = cat.nameTemplates[k % cat.nameTemplates.length].replace('{word}', cat.nameWords[k]);
      const items = [];
      for (let i = 0; i < 10; i++) {
        const itemName = cat.items[(k + i) % cat.items.length];
        items.push({ name: itemName, price: priceForItem(cat, itemName) });
      }
      shops.push({
        id: cat.id + '_' + k,
        name, category: cat.category, emoji: cat.emoji,
        items, ad: cat.ads[k % cat.ads.length],
      });
    }
  });
  return shops;
}
let CITY_SHOPS = []; // filled by buildCityShops() — 100 shop data objects, looked up by id from openCityShopModal()
// Places the 100 generated shops in a 10x10 grid "Shopping District" at (0,500) — well clear of
// downtown (z up to ~110), the Suburbs (x 230-470/z 90-270), the airport, and every country town
// (all at |x| or |z| >= 600). Each shop gets a real little storefront (body/roof/glass/name sign)
// PLUS a genuine roadside billboard (posts + a board with its ad slogan) — not just a name plate.
function buildCityShops() {
  CITY_SHOPS = generateCityShops();
  const CENTER_X = 0, CENTER_Z = 500, COL_SPACING = 35, ROW_SPACING = 35, COLS = 10, ROWS = 10;
  // Each shop gets a real 2-color theme (body + a deeper accent of the same hue for the roof
  // trim and logo ring), not just one flat color repeated everywhere on the storefront.
  const THEMES = [
    { wall:0xE8927C, accent:0xB85A3C }, { wall:0x8CC0DE, accent:0x3D7A9E },
    { wall:0xF2D479, accent:0xC49A2E }, { wall:0x9BCB8C, accent:0x4F8A3D },
    { wall:0xC9A0DC, accent:0x7B4A9E }, { wall:0xF4A6C6, accent:0xC4487A },
    { wall:0x7FB8B0, accent:0x3D7A72 }, { wall:0xE0B888, accent:0xA67C4A },
  ];
  CITY_SHOPS.forEach((shop, i) => {
    const col = i % COLS, row = Math.floor(i / COLS);
    const x = CENTER_X + (col - (COLS - 1) / 2) * COL_SPACING;
    const z = CENTER_Z + (row - (ROWS - 1) / 2) * ROW_SPACING;
    const theme = THEMES[i % THEMES.length];

    box(9, 5, 8, theme.wall, x, 2.5, z);                 // body
    box(10.5, 0.6, 9.5, theme.accent, x, 5.3, z);        // roof cap
    box(6, 3, 0.2, 0xAEE3FF, x, 2, z - 4.05);            // glass front
    buildLogoSign(shop.name, shop.emoji, '#'+theme.wall.toString(16).padStart(6,'0'), '#'+theme.accent.toString(16).padStart(6,'0'), x, 5.9, z - 4.3);

    // Billboard: 2 posts + a board facing the street, showing the ad slogan
    const bbX = x, bbZ = z + 5.5;
    box(0.25, 3.5, 0.25, 0x5a5a5a, bbX - 2, 1.75, bbZ);
    box(0.25, 3.5, 0.25, 0x5a5a5a, bbX + 2, 1.75, bbZ);
    box(4.6, 2.2, 0.15, 0x222222, bbX, 3.6, bbZ);
    const cv = document.createElement('canvas'); cv.width = 300; cv.height = 140;
    const cx = cv.getContext('2d');
    cx.fillStyle = '#fffbe0'; cx.fillRect(4, 4, 292, 132);
    cx.strokeStyle = '#222'; cx.lineWidth = 5; cx.strokeRect(4, 4, 292, 132);
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.font = '40px Arial'; cx.fillText(shop.emoji, 150, 40);
    cx.fillStyle = '#222'; cx.font = 'bold 17px Arial';
    wrapText(cx, shop.ad, 150, 85, 260, 22);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.05), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
    board.position.set(bbX, 3.6, bbZ - 0.08);
    scene.add(board);

    addCol(CITY_COLS, x, z, 4.5, 4);
    CITY_ZONES.push({ x, z: z - 4.5, r: 4, label: `${shop.emoji} ${shop.name}`, action: () => openCityShopModal(shop.id) });
  });
}
// Same 25 categories, the OTHER 8 name variations each (k=4..11 — nameWords/nameTemplates only
// have 12 entries, and k=0..3 were already used by the 100 outdoor CITY_SHOPS), so every id here
// is guaranteed distinct from an outdoor shop. 25 x 8 = 200 more real shops, placed indoors.
function generateMallShops() {
  const shops = [];
  SHOP_CATEGORIES.forEach(cat => {
    for (let k = 4; k < 12; k++) {
      const name = cat.nameTemplates[k % cat.nameTemplates.length].replace('{word}', cat.nameWords[k]);
      const items = [];
      for (let i = 0; i < 10; i++) {
        const itemName = cat.items[(k + i) % cat.items.length];
        items.push({ name: itemName, price: priceForItem(cat, itemName) });
      }
      shops.push({
        id: cat.id + '_' + k,
        name, category: cat.category, emoji: cat.emoji,
        items, ad: cat.ads[k % cat.ads.length],
      });
    }
  });
  return shops;
}
let MALL_SHOPS = []; // filled by buildMallShopWing() — 200 shop data objects, looked up by id from openCityShopModal() same as CITY_SHOPS
// Builds a "Shopping Wing" attached to the mall's back doorway (mz-27), extending further south
// (more negative z) into open space. Every pocket interior now lives in its own 10,000-unit-wide
// lane (House 10000, Mall 20000, Hotel 30000, Store 40000, Friend House 50000, Prison 60000) with
// nothing else nearby at all, so there's no neighbor-clearance math to worry about here anymore —
// unlike the old 600-1200 cluster, extending this wing can't run into anything.
// 20 cols x 10 rows = 200 storefronts, one per MALL_SHOPS entry, laid out the same way buildCityShops
// already proved works — just relocated indoors and without the roadside billboard (redundant once
// there's a real Mall Directory kiosk, and it keeps the texture/mesh count down for 200 of these).
function buildMallShopWing() {
  MALL_SHOPS = generateMallShops();
  const mx = MALL_SPAWN.x, mz = 0;
  const WING_HALF_W = 125, WING_Z0 = mz - 27, WING_FAR = mz - 227;
  const wingDepth = WING_Z0 - WING_FAR, wingCenterZ = (WING_Z0 + WING_FAR) / 2;

  // Floor, ceiling, side walls, far wall — continues the atrium's marble/white look
  box(WING_HALF_W * 2, 0.1, wingDepth, 0xf5f5f0, mx, 0, wingCenterZ);
  box(WING_HALF_W * 2, 0.4, wingDepth, 0xeeeeee, mx, 11, wingCenterZ);
  box(0.5, 11, wingDepth, 0xe8e8e8, mx - WING_HALF_W, 5.5, wingCenterZ);
  box(0.5, 11, wingDepth, 0xe8e8e8, mx + WING_HALF_W, 5.5, wingCenterZ);
  box(WING_HALF_W * 2, 11, 0.5, 0xe8e8e8, mx, 5.5, WING_FAR);
  addCol(MALL_COLS, mx - WING_HALF_W, wingCenterZ, 1, wingDepth / 2);
  addCol(MALL_COLS, mx + WING_HALF_W, wingCenterZ, 1, wingDepth / 2);
  addCol(MALL_COLS, mx, WING_FAR, WING_HALF_W, 1);
  buildSign('🚪 BACK TO ATRIUM', mx, 8, WING_Z0 + 0.4);

  // Mall Directory kiosk, just inside the doorway before the first row of shops
  box(1.6, 2.6, 0.6, 0x333333, mx, 1.3, mz - 33);
  box(1.4, 1.2, 0.1, 0x66ccff, mx, 1.9, mz - 32.65);
  buildSign('🗺️ DIRECTORY', mx, 3.2, mz - 32.5);
  MALL_ZONES.push({ x: mx, z: mz - 33, r: 3, label: '🗺️ Mall Directory', action: () => openMallDirectory()});

  const COL_SPACING = 11, ROW_SPACING = 13, COLS = 20;
  // Each shop gets a real 2-color theme (body + a deeper accent of the same hue for the roof
  // trim and logo ring), not just one flat color repeated everywhere on the storefront.
  const THEMES = [
    { wall:0xE8927C, accent:0xB85A3C }, { wall:0x8CC0DE, accent:0x3D7A9E },
    { wall:0xF2D479, accent:0xC49A2E }, { wall:0x9BCB8C, accent:0x4F8A3D },
    { wall:0xC9A0DC, accent:0x7B4A9E }, { wall:0xF4A6C6, accent:0xC4487A },
    { wall:0x7FB8B0, accent:0x3D7A72 }, { wall:0xE0B888, accent:0xA67C4A },
  ];
  MALL_SHOPS.forEach((shop, i) => {
    const col = i % COLS, row = Math.floor(i / COLS);
    const x = mx + (col - (COLS - 1) / 2) * COL_SPACING;
    const z = mz - 45 - row * ROW_SPACING;
    const theme = THEMES[i % THEMES.length];

    box(7, 4.5, 5, theme.wall, x, 2.25, z);               // body
    box(8, 0.4, 6, theme.accent, x, 4.7, z);              // roof cap
    box(4.5, 2.2, 0.15, 0xAEE3FF, x, 1.6, z - 2.55);     // glass front
    buildLogoSign(shop.name, shop.emoji, '#'+theme.wall.toString(16).padStart(6,'0'), '#'+theme.accent.toString(16).padStart(6,'0'), x, 5, z - 2.7);

    addCol(MALL_COLS, x, z, 3.8, 3);
    MALL_ZONES.push({ x, z: z - 3, r: 3.2, label: `${shop.emoji} ${shop.name}`, action: () => openCityShopModal(shop.id) });
  });

  // Ceiling lights down the wing, one per row
  for (let r = 0; r < 10; r++) {
    const pl = new THREE.PointLight(0xfff5e0, 0.3, 20);
    pl.position.set(mx, 9.5, mz - 45 - r * ROW_SPACING);
    scene.add(pl);
  }
}
// Small canvas word-wrap helper — used by the billboard ad text (and reusable anywhere else
// that needs multi-line canvas text instead of a single fillText call).
function wrapText(cx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '', lines = [];
  words.forEach(w => {
    const test = line ? line + ' ' + w : w;
    if (cx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  });
  lines.push(line);
  const startY = y - (lines.length - 1) * lineHeight / 2;
  lines.forEach((l, i) => cx.fillText(l, x, startY + i * lineHeight));
}
function openCityShopModal(id) {
  const shop = CITY_SHOPS.find(s => s.id === id) || MALL_SHOPS.find(s => s.id === id);
  if (!shop) return;
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('cityShopModalTitle').textContent = `${shop.emoji} ${shop.name}`;
  const workingHere = activeJob === `${shop.emoji} ${shop.name}`;
  const shopBusy = !workingHere && (!!activeJob || !!activeBankJob);
  document.getElementById('cityShopModalBody').innerHTML = `
    <div style="text-align:center;color:#888;font-size:11px;margin-bottom:10px;">${shop.category}</div>
    <div style="text-align:center;color:#ffd54a;font-style:italic;font-size:12px;margin-bottom:12px;">"${shop.ad}"</div>
    <button ${shopBusy ? 'disabled' : ''} onclick="${workingHere ? "quitJob('Stopped working.')" : `startShopJob('${shop.id}')`};closeCityShopModal()" style="width:100%;padding:8px;margin-bottom:12px;background:${workingHere ? '#7a1a1a' : shopBusy ? '#333' : '#1a5a7a'};border:none;border-radius:8px;color:#fff;font-weight:bold;font-size:12px;cursor:${shopBusy ? 'not-allowed' : 'pointer'};opacity:${shopBusy ? '0.5' : '1'};">${workingHere ? '⏹ Stop Working Here' : `💼 Work Here (+${shopJobPay(shop)} S.I.P./task)`}</button>
    <div style="font-size:12px;color:#ccc;margin-bottom:6px;"><b>What they sell:</b></div>
    ${shop.items.map(it => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid #2a3a3a;">
        <span style="color:#ddd;font-size:12px;">${it.name}</span>
        <span style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <span style="color:#ffd54a;font-size:11px;">💰${it.price}</span>
          <button onclick="buyItem('${it.name.replace(/'/g, "\\'")}',${it.price})" style="padding:3px 10px;background:#2a5a4a;border:1px solid #4a8a6a;border-radius:6px;color:#eee;font-size:11px;cursor:pointer;">Buy</button>
        </span>
      </div>`).join('')}`;
  document.getElementById('cityShopModal').style.display = 'flex';
}
function closeCityShopModal() {
  document.getElementById('cityShopModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
// Mall Directory — a real browsable/searchable index of every shop in Explox (all 100 outdoor
// CITY_SHOPS + all 200 indoor MALL_SHOPS, grouped by their 25 shared categories), reachable from
// the kiosk just inside the Shopping Wing. Selecting an entry opens the exact same info modal you'd
// get by walking up to that shop in person — this is a lookup/browse tool, not a duplicate system.
function openMallDirectory() {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('mallDirectorySearch').value = '';
  renderMallDirectory('');
  document.getElementById('mallDirectoryModal').style.display = 'flex';
}
function renderMallDirectory(query) {
  const q = query.trim().toLowerCase();
  const grouped = {};
  [...CITY_SHOPS, ...MALL_SHOPS, ...OUTFIT_SHOPS].forEach(s => {
    if (q && !s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) return;
    (grouped[s.category] = grouped[s.category] || []).push(s);
  });
  const cats = Object.keys(grouped).sort();
  document.getElementById('mallDirectoryList').innerHTML = cats.length ? cats.map(cat => `
    <div style="margin-bottom:10px;">
      <div style="color:#ffd54a;font-size:12px;font-weight:bold;margin-bottom:4px;">${grouped[cat][0].emoji} ${cat} <span style="color:#777;font-weight:normal;">(${grouped[cat].length})</span></div>
      ${grouped[cat].map(s => `<div onclick="selectDirectoryShop('${s.id}')" style="cursor:pointer;padding:4px 8px;color:#ddd;font-size:12px;border-radius:6px;" onmouseover="this.style.background='#2a3a3a'" onmouseout="this.style.background='none'">${s.name}</div>`).join('')}
    </div>`).join('') : `<div style="color:#888;text-align:center;font-size:12px;padding:20px 0;">No shops match "${query}"</div>`;
}
function filterMallDirectory() {
  renderMallDirectory(document.getElementById('mallDirectorySearch').value);
}
function selectDirectoryShop(id) {
  document.getElementById('mallDirectoryModal').style.display = 'none';
  if (OUTFIT_SHOPS.find(s => s.id === id)) openOutfitBoutique(id);
  else openCityShopModal(id);
}
function closeMallDirectory() {
  document.getElementById('mallDirectoryModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ─── SUBURBS NEIGHBORHOOD ──────────────────────────────────────────────────────
// A small residential neighborhood: 40 simple single-story houses laid out in an
// 8-column x 5-row grid, a real street grid (one road per row + 3 cross streets),
// and a paved parking pad per house with a car sitting on it.
//
// Grid math: center x=350,z=180 — 8 columns 28 apart on X (x=252..448),
// 5 rows 32 apart on Z (z=116..244). Each house footprint fits inside a 22x22 plot.
// Each row's street sits at rowZ-13 — far enough past the mailbox/driveway that
// nothing overlaps, and close enough to still read as "this row's street".
//
// Builds the 40-house Suburbs neighborhood. Returns an array of 40 world-coordinate
// objects in grid order (row-major, col 0-7 then row 0-4) so buildShopperPopulation()
// can assign each house to a resident by index. Each entry has:
//   {x,z}                  — front-door walk-to waypoint (unchanged from before)
//   {parkX,parkZ,parkYaw}  — the house's own driveway pad, for parking a resident's car
function buildSuburbs() {
  const doorCoords = [];

  const CENTER_X = 350, CENTER_Z = 180;
  const COL_SPACING = 28, ROW_SPACING = 32;
  const COLS = 8, ROWS = 5;
  const STREET_OFFSET = 13; // how far in front of a row its street sits (rowZ - this)

  const ROOF_COLORS = [0x8b3a3a, 0x6b4a35, 0x707070, 0x475569];
  const DOOR_COLOR = 0x2e2015;
  const WINDOW_COLOR = 0xaee3f5;
  const MAILBOX_POST_COLOR = 0x5a3a20;
  const MAILBOX_BOX_COLOR = 0xd8d8d8;
  const STEP_COLOR = 0x999999;
  const ROAD_COLOR = 0x555555;
  const ROAD_LINE_COLOR = 0xdddd88;
  const DRIVEWAY_COLOR = 0x777777;

  function buildHouse(i, x, z) {
    const bodyW = 8 + (i % 5) * 0.8;        // 8 .. 11.2
    const bodyD = 8 + (i % 3) * 0.7;        // 8 .. 9.4
    const bodyH = 5 + (i % 4) * (1 / 3);    // 5 .. 6

    const hue = ((i * 53) % 360) / 360;
    const sat = 0.28 + (i % 3) * 0.06;
    const light = 0.62 + (i % 4) * 0.04;
    const wallColor = new THREE.Color().setHSL(hue, sat, light).getHex();
    const roofColor = ROOF_COLORS[i % ROOF_COLORS.length];

    const bodyY = bodyH / 2;
    const roofH = 0.8;
    const roofY = bodyH + roofH / 2 - 0.05;

    box(bodyW, bodyH, bodyD, wallColor, x, bodyY, z);
    box(bodyW + 1.6, roofH, bodyD + 1.6, roofColor, x, roofY, z);

    const frontZ = z - bodyD / 2;

    const doorW = 1.2, doorH = 2.4, doorT = 0.12;
    box(doorW, doorH, doorT, DOOR_COLOR, x, doorH / 2, frontZ - 0.08);

    const winW = 1.3, winH = 1.1, winT = 0.1;
    const winY = bodyH * 0.62;
    box(winW, winH, winT, WINDOW_COLOR, x - bodyW * 0.28, winY, frontZ - 0.06);
    box(winW, winH, winT, WINDOW_COLOR, x + bodyW * 0.28, winY, frontZ - 0.06);

    box(2.0, 0.25, 1.4, STEP_COLOR, x, 0.125, frontZ - 1.2);

    // Mailbox on the WEST side of the front yard, clear of the driveway on the east side.
    const mbX = x - bodyW / 2 - 1.5, mbZ = frontZ - 3;
    box(0.12, 1.0, 0.12, MAILBOX_POST_COLOR, mbX, 0.5, mbZ);
    box(0.5, 0.35, 0.3, MAILBOX_BOX_COLOR, mbX, 1.15, mbZ);

    // Driveway/parking pad on the EAST side of the front yard, running from near the
    // house down toward that row's street. A resident's car parks centered on it.
    const padW = 3.4, padDepth = 6.5;
    const padX = x + bodyW / 2 + 2.3;
    const padZ = frontZ - 1 - padDepth / 2;
    box(padW, 0.08, padDepth, DRIVEWAY_COLOR, padX, 0.04, padZ);

    addCol(CITY_COLS, x, z, bodyW / 2, bodyD / 2);

    doorCoords.push({
      x: x, z: frontZ - 4,
      parkX: padX, parkZ: padZ, parkYaw: Math.PI, // yaw PI faces the car toward the street
    });
  }

  for (let row = 0; row < ROWS; row++) {
    const z = CENTER_Z + (row - 2) * ROW_SPACING;
    for (let col = 0; col < COLS; col++) {
      const x = CENTER_X + (col - 3.5) * COL_SPACING;
      const i = row * COLS + col;
      buildHouse(i, x, z);
    }
  }

  // One street per row, running the full width of the neighborhood, positioned at
  // rowZ-STREET_OFFSET — clear of every house's driveway pad (which ends around
  // frontZ-7.5 to frontZ-8.2, well short of the street) and every other row's houses.
  const roadSpanW = (COLS - 1) * COL_SPACING + 40; // full column spread + margin on both ends
  for (let row = 0; row < ROWS; row++) {
    const rowZ = CENTER_Z + (row - 2) * ROW_SPACING;
    const streetZ = rowZ - STREET_OFFSET;
    box(roadSpanW, 0.1, 7, ROAD_COLOR, CENTER_X, 0.05, streetZ);
    box(roadSpanW - 4, 0.02, 0.3, ROAD_LINE_COLOR, CENTER_X, 0.11, streetZ); // dashed-look centerline (single strip, simple)
  }

  // 3 cross streets connecting every row's street into a real grid — positioned at
  // safe midpoints BETWEEN columns (never under a house), each far enough from its
  // neighbors that no two streets/houses overlap.
  const crossStreetXs = [294, 350, 406]; // midpoints between col1/2, col3/4, col5/6
  const crossSpanZ = (ROWS - 1) * ROW_SPACING + 30; // full row spread + margin, covers every row's street
  crossStreetXs.forEach(cx => {
    box(7, 0.1, crossSpanZ, ROAD_COLOR, cx, 0.05, CENTER_Z);
  });

  return doorCoords;
}

// ─── SHOPPER POPULATION ──────────────────────────────────────────────────────
// 40 named residents (looks from SHOPPER_IDENTITIES) get a home (a Suburbs house),
// a parked car (buildCar, reusing the player's own car catalog/models), a job at
// one of the city's real businesses, and a wander route built from SAI_LOCATIONS —
// the same citywide landmark list SAI's map uses — so they genuinely roam the whole
// map instead of pacing a small local loop like the original 24 NPC_DEFS citizens do.
const SHOPPER_IDENTITIES = [
  { name:'Maya',   skin:0xf5d5b5, shirt:0xff4444, pants:0x222222, hair:'long',     hairColor:0x1a1a1a },
  { name:'Ethan',  skin:0xe0b080, shirt:0x3388dd, pants:0x333344, hair:'short',    hairColor:0x2a1505 },
  { name:'Liam',   skin:0xf0c8a0, shirt:0x22aa55, pants:0x1a2a55, hair:'spiky',    hairColor:0x3a2410, hat:'cap' },
  { name:'Ava',    skin:0xf5c89a, shirt:0xcc44aa, pants:0x223355, hair:'ponytail', hairColor:0xaa3311 },
  { name:'Noah',   skin:0xd4956a, shirt:0xffcc00, pants:0x111133, hair:'curly',    hairColor:0x1a1008 },
  { name:'Grace',  skin:0xf8d8b8, shirt:0x88ccaa, pants:0x334455, hair:'afro',     hairColor:0x2a1a10 },
  { name:'Diego',  skin:0xc07840, shirt:0xee6622, pants:0x224422, hair:'none',     hairColor:0x1a1108 },
  { name:'Fatima', skin:0xb87040, shirt:0x9944cc, pants:0x1a1a2a, hair:'long',     hairColor:0x0a0a0a, hat:'beanie' },
  { name:'Ravi',   skin:0xd4a070, shirt:0x2299cc, pants:0x333322, hair:'short',    hairColor:0x0a0a0a },
  { name:'Chloe',  skin:0xffe0bd, shirt:0xff88aa, pants:0x442222, hair:'ponytail', hairColor:0xffcc66 },
  { name:'Hassan', skin:0x8B5E3C, shirt:0x66aa22, pants:0x1a2233, hair:'short',    hairColor:0x1a1108 },
  { name:'Yuki',   skin:0xf5e5d5, shirt:0x44ccee, pants:0x222222, hair:'long',     hairColor:0x1a1a1a },
  { name:'Ben',    skin:0xe8c090, shirt:0xdd5533, pants:0x333344, hair:'spiky',    hairColor:0x442200, hat:'fedora' },
  { name:'Olivia', skin:0xf0d0a8, shirt:0xff6699, pants:0x2a1a33, hair:'curly',    hairColor:0x552211 },
  { name:'Malik',  skin:0x7a4a2a, shirt:0x3355aa, pants:0x111111, hair:'none',     hairColor:0x0a0a0a },
  { name:'Sofia',  skin:0xf4d0b0, shirt:0xcc8844, pants:0x224422, hair:'long',     hairColor:0x2a1505 },
  { name:'Ken',    skin:0xd4956a, shirt:0x77cc33, pants:0x223322, hair:'short',    hairColor:0x1a1108 },
  { name:'Aisha',  skin:0xa8623c, shirt:0xeecc44, pants:0x331a1a, hair:'afro',     hairColor:0x0a0a0a, hat:'cap' },
  { name:'Victor', skin:0xe8c080, shirt:0x4488cc, pants:0x1a2a55, hair:'short',    hairColor:0x3a2010 },
  { name:'Ruby',   skin:0xf5c89a, shirt:0xcc2244, pants:0x222233, hair:'ponytail', hairColor:0x220a05 },
  { name:'Jamal',  skin:0x6b4226, shirt:0x22ccaa, pants:0x1a1a1a, hair:'spiky',    hairColor:0x0a0a0a },
  { name:'Elena',  skin:0xf8d8b8, shirt:0xaa22cc, pants:0x334499, hair:'long',     hairColor:0x4a2a10 },
  { name:'Wei',    skin:0xe0b080, shirt:0x44aa88, pants:0x222222, hair:'short',    hairColor:0x1a1a1a, hat:'cowboy' },
  { name:'Nadia',  skin:0xd49060, shirt:0xee6622, pants:0x223355, hair:'curly',    hairColor:0x2a1a10 },
  { name:'Owen',   skin:0xf0c8a0, shirt:0x556b2f, pants:0x333333, hair:'none',     hairColor:0x654321 },
  { name:'Layla',  skin:0xc97a50, shirt:0xff88aa, pants:0x1a1833, hair:'long',     hairColor:0x1a1008 },
  { name:'Dante',  skin:0xb87040, shirt:0x224488, pants:0x111111, hair:'spiky',    hairColor:0x0a0a0a },
  { name:'Ingrid', skin:0xffe0bd, shirt:0x3388dd, pants:0x334455, hair:'ponytail', hairColor:0xd4a017, hat:'beanie' },
  { name:'Rahul',  skin:0xd4a070, shirt:0xcc44aa, pants:0x222233, hair:'short',    hairColor:0x1a1108 },
  { name:'Bianca', skin:0xf5d5b5, shirt:0x88ccaa, pants:0x442222, hair:'curly',    hairColor:0x3a2410 },
  { name:'Felix',  skin:0xe8c090, shirt:0xffcc00, pants:0x223322, hair:'short',    hairColor:0x2a1505 },
  { name:'Zara',   skin:0x8B5E3C, shirt:0xff4444, pants:0x1a2a2a, hair:'afro',     hairColor:0x0a0a0a },
  { name:'Theo',   skin:0xf0d0a8, shirt:0x2299cc, pants:0x333344, hair:'none',     hairColor:0x4a2a10, hat:'cap' },
  { name:'Isla',   skin:0xf5c89a, shirt:0x9944cc, pants:0x224422, hair:'long',     hairColor:0xaa3311 },
  { name:'Kofi',   skin:0x5c3a21, shirt:0x77cc33, pants:0x1a1a1a, hair:'short',    hairColor:0x0a0a0a },
  { name:'Mila',   skin:0xf4d0b0, shirt:0xee6622, pants:0x334499, hair:'ponytail', hairColor:0x552211 },
  { name:'Anton',  skin:0xe0b080, shirt:0x3355aa, pants:0x222222, hair:'spiky',    hairColor:0x2a1a0a },
  { name:'Nia',    skin:0xa8623c, shirt:0xcc2244, pants:0x1a2233, hair:'curly',    hairColor:0x0a0a0a, hat:'fedora' },
  { name:'Hiro',   skin:0xf5e5d5, shirt:0x44ccee, pants:0x333322, hair:'short',    hairColor:0x1a1a1a },
  { name:'Paloma', skin:0xd4956a, shirt:0xff6699, pants:0x223355, hair:'long',     hairColor:0x2a1505 },
];
const SHOPPER_JOBS = [
  { title:'Diner Cook',      workplace:'The Diner',      x:110, z:-25 },
  { title:'Store Clerk',     workplace:'Your Store',     x:160, z:-25 },
  { title:'Mall Clerk',      workplace:'City Mall',      x:80,  z:-20 },
  { title:'Hotel Concierge', workplace:'City Hotel',     x:-15, z:-5  },
  { title:'Car Salesperson', workplace:'Car Dealership', x:130, z:35  },
  { title:'Tech Support',    workplace:'Computer Shop',  x:100, z:58  },
  { title:'Ticket Seller',   workplace:'Movie Theater',  x:50,  z:-85 },
  { title:'Bus Driver',      workplace:'Transit Hub',    x:0,   z:50  },
  { title:'Bank Teller',     workplace:'City Bank',      x:160, z:210  },
];
function buildShopperPopulation() {
  const homes = buildSuburbs(); // 40 {x,z} door coords, one per shopper by index
  // SAI_LOCATIONS is the same citywide landmark list the SAI map uses — a ready-made
  // pool of real, named places spread across the whole map. "Your House" is the
  // PLAYER's own private home, so it's excluded from the wander pool.
  const wanderPool = SAI_LOCATIONS.filter(l => l.label !== 'Your House');
  SHOPPER_IDENTITIES.forEach((person, i) => {
    const home = homes[i];
    const job = SHOPPER_JOBS[i % SHOPPER_JOBS.length];

    // Parked on their own house's driveway pad (built by buildSuburbs) — varied model/color
    // from the same catalog the player buys from.
    const carDef = CAR_CATALOG[i % CAR_CATALOG.length];
    buildCar(carDef, home.parkX, home.parkZ, home.parkYaw);

    // Route: home -> their job -> 3 more random landmarks picked from across the whole
    // city, so every shopper's loop genuinely spans the map instead of one small cluster.
    const shuffled = [...wanderPool].sort(() => Math.random() - 0.5).slice(0, 3).map(l => [l.x, l.z]);
    const patrol = [[home.x, home.z], [job.x, job.z], ...shuffled];

    const npc = makeNPC({
      name: person.name, role: job.title,
      skin: person.skin, shirt: person.shirt, pants: person.pants,
      pos: [home.x, 0, home.z], patrol,
      hair: person.hair, hairColor: person.hairColor, hat: person.hat,
      emotion: BASE_EMOTIONS[i % BASE_EMOTIONS.length],
    });
    npc.job = job.title; npc.workplace = job.workplace; npc.home = home;
    npcs.push(npc);
  });
}

// ─── FRIENDS — meet a wandering Suburbs neighbor, befriend them, then invite them over,
// visit their place, or hire them at your store. `friends` only stores names — the 40
// shoppers are rebuilt identically every session, so looking one up by name in `npcs` (for
// current position/job) or in SHOPPER_IDENTITIES (for their look) is always reliable. ──────
function findNearestNeighbor(px, pz, maxDist) {
  let closest = null, closestDist = maxDist;
  for (const npc of npcs) {
    if (!npc.job) continue; // only the 40 named Suburbs shoppers count as "neighbors" (not the original 24 NPC_DEFS)
    const d = Math.sqrt((px - npc.group.position.x) ** 2 + (pz - npc.group.position.z) ** 2);
    if (d < closestDist) { closestDist = d; closest = npc; }
  }
  return closest;
}
function openNeighborModal(name) {
  if (RELATIVE_NAMES.includes(name)) { openRelativeModal(name); return; } // your own parents skip the whole befriend flow entirely
  const npc = npcs.find(n => n.name === name);
  if (!npc) return;
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  const isFriend = friends.includes(name);
  document.getElementById('neighborModalTitle').textContent = `👋 ${name}`;
  const spouse = getSpouse(name);
  let html = `<div style="margin-bottom:10px;text-align:center;">
      ${npc.emotion ? `<div style="font-size:24px;">${npc.emotion}</div>` : ''}
      <div style="font-size:13px;color:#fff;">${npc.job} at ${npc.workplace}</div>
      <div style="font-size:11px;color:#888;">🏠 Lives in the Suburbs</div>
      ${spouse ? `<div style="font-size:11px;color:#ff99bb;">💍 Married to ${spouse === playerName ? 'YOU! 🥰' : spouse}</div>` : ''}
    </div>`;
  if (!isFriend) {
    html += `<button onclick="befriendNeighbor('${name}')" style="width:100%;padding:8px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#ff6699;">🤝 Become Friends</button>`;
  } else {
    html += `<div style="text-align:center;color:#7CFC00;font-size:11px;margin-bottom:8px;">💗 You're friends with ${name}!</div>`;
    html += `<button onclick="inviteNeighborOver('${name}')" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#3a6ea5;">🏠 Invite ${name} to Your House</button>`;
    html += `<button onclick="visitNeighborHouse('${name}')" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#4a8a4a;">🚪 Visit ${name}'s House</button>`;
    if (ownedStore) {
      const alreadyStaff = ownedStaff.some(s => s.name === name);
      if (alreadyStaff) {
        html += `<div style="text-align:center;color:#888;font-size:11px;">Already works at your store!</div>`;
      } else if (ownedStaff.length >= MAX_STAFF) {
        html += `<div style="text-align:center;color:#888;font-size:11px;">Your staff is full (${MAX_STAFF}/${MAX_STAFF}).</div>`;
      } else {
        html += `<button onclick="hireFriendAsStaff('${name}')" style="width:100%;padding:8px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#c9974c;">👥 Hire ${name} as Staff — ${staffHireCost()} S.I.P.</button>`;
      }
    }
    if (!spouse && !getSpouse(playerName)) {
      html += `<button onclick="proposeMarriage('${name}')" style="width:100%;padding:8px;margin-top:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#e0669b;">💍 Propose Marriage</button>`;
    }
  }
  document.getElementById('neighborModalBody').innerHTML = html;
  document.getElementById('neighborModal').style.display = 'flex';
}
function closeNeighborModal() {
  document.getElementById('neighborModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function befriendNeighbor(name) {
  if (!friends.includes(name)) {
    friends.push(name);
    saveCurrentUser();
    sfx.cheer();
    showNotif(`💗 You and ${name} are friends now!`);
  }
  openNeighborModal(name); // refresh the modal so the new friend-only options appear
}
function inviteNeighborOver(name) {
  houseGuest = name;
  saveCurrentUser();
  refreshHouseGuest();
  sfx.buy();
  showNotif(`🏠 You invited ${name} over! Head home to hang out.`);
  closeNeighborModal();
}
function sayGoodbyeToGuest() {
  if (!houseGuest) { showNotif('No one is visiting right now.'); return; }
  const name = houseGuest;
  houseGuest = null;
  saveCurrentUser();
  refreshHouseGuest();
  showNotif(`👋 ${name} said goodbye and headed home.`);
}
// A simple standing figure using a neighbor's REAL look (from SHOPPER_IDENTITIES, since
// makeNPC()'s live mesh colors aren't stored anywhere retrievable) plus a floating name tag.
// Adds directly to `scene` at absolute world coords (matching the flat box()-per-call style
// buildHouseInterior/buildFriendHouseInterior already use — no group wrapper). Returns every
// mesh it created so the caller can track and remove them later.
function buildResidentFigure(x, z, npc) {
  const identity = SHOPPER_IDENTITIES.find(s => s.name === npc.name) || { skin: 0xE8B87A, shirt: 0x557799, pants: 0x333333 };
  const made = [];
  made.push(box(0.9, 0.9, 0.9, identity.skin, x, 2.75, z));
  made.push(box(0.8, 1.0, 0.45, identity.shirt, x, 1.75, z));
  made.push(box(0.32, 0.85, 0.32, identity.pants, x - 0.22, 0.55, z));
  made.push(box(0.32, 0.85, 0.32, identity.pants, x + 0.22, 0.55, z));
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 40;
  const cx = cv.getContext('2d');
  cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(0, 0, 128, 40);
  cx.fillStyle = '#fff'; cx.font = 'bold 15px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText(npc.name, 64, 20);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.32), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
  tag.position.set(x, 3.6, z);
  scene.add(tag);
  made.push(tag);
  return made;
}
// Keeps the guest figure inside YOUR house in sync with `houseGuest` — call whenever it
// changes, and once at startup (after shoppers exist) in case a save loaded with a guest set.
function refreshHouseGuest() {
  houseGuestMeshes.forEach(m => scene.remove(m));
  houseGuestMeshes = [];
  if (!houseGuest) return;
  const npc = npcs.find(n => n.name === houseGuest);
  if (!npc) return;
  houseGuestMeshes = buildResidentFigure(HOUSE_SPAWN.x-7, HOUSE_SPAWN.z+6, npc); // left/front of the room, clear of all furniture — matches the fixed guest zone above
}
// ─── VISITING A FRIEND'S HOUSE — one shared pocket-space room, re-themed per visit ──────
function buildFriendHouseInterior(npc) {
  friendHouseMeshes.forEach(m => scene.remove(m));
  friendHouseMeshes = [];
  const fx = FRIEND_HOUSE_SPAWN.x, fz = FRIEND_HOUSE_SPAWN.z;
  const add = (m) => { friendHouseMeshes.push(m); return m; };
  add(box(16, 0.3, 14, 0xc8aa80, fx, 0.15, fz));       // floor
  add(box(16, 0.2, 14, 0xf5f0e8, fx, 5, fz));          // ceiling
  add(box(16, 5, 0.3, 0xf5efe0, fx, 2.5, fz - 7));     // back wall
  add(box(5, 5, 0.3, 0xf5efe0, fx - 5.5, 2.5, fz + 7)); // front wall left
  add(box(5, 5, 0.3, 0xf5efe0, fx + 5.5, 2.5, fz + 7)); // front wall right
  add(box(0.3, 5, 14, 0xf5efe0, fx - 8, 2.5, fz));     // left wall
  add(box(0.3, 5, 14, 0xf5efe0, fx + 8, 2.5, fz));     // right wall
  add(box(2, 3, 0.1, 0x8B5E3C, fx, 1.5, fz + 7.05));   // door
  add(box(3, 1, 1.2, 0x557799, fx - 3, 0.5, fz - 4));  // couch
  add(box(3, 0.08, 2, 0x8B5A2B, fx - 3, 0.34, fz - 2.6)); // rug in front of the couch
  buildResidentFigure(fx + 2, fz - 2, npc).forEach(add);
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#fff'; cx.fillRect(0, 0, 256, 64);
  cx.save(); cx.scale(-1, 1); cx.translate(-256, 0); // matches buildSign()'s mirrored-text convention
  cx.fillStyle = '#111'; cx.font = 'bold 20px Arial'; cx.textAlign = 'center'; cx.fillText(npc.name + "'s House", 128, 40);
  cx.restore();
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), side: THREE.DoubleSide }));
  sign.position.set(fx, 4.2, fz - 6.8);
  scene.add(sign);
  add(sign);
}
const FRIEND_HOUSE_ZONES = [
  { x: FRIEND_HOUSE_SPAWN.x, z: FRIEND_HOUSE_SPAWN.z + 6, r: 3, label: 'Leave', action: () => leaveFriendHouse()},
];
function visitNeighborHouse(name) {
  const npc = npcs.find(n => n.name === name);
  if (!npc) return;
  visitingFriendName = name;
  buildFriendHouseInterior(npc);
  inFriendHouse = true;
  playerGroup.position.set(FRIEND_HOUSE_SPAWN.x, 0, FRIEND_HOUSE_SPAWN.z);
  yaw = Math.PI;
  closeNeighborModal();
  showNotif(`🚪 Welcome to ${name}'s house!`);
}
function leaveFriendHouse() {
  inFriendHouse = false;
  // Drop the player back at their friend's actual front door in the Suburbs, for continuity
  const npc = npcs.find(n => n.name === visitingFriendName);
  if (npc && npc.home) { playerGroup.position.set(npc.home.x, 0, npc.home.z); yaw = 0; }
  visitingFriendName = null;
  showNotif('Leaving...');
}

// ─── FAMILIES & LIFE EVENTS — neighbors can get married (forming real families you can see
// reflected in the neighbor modal), have babies together, and the whole town gathers for
// weddings and birthdays. Those three are player-triggered from the Town Events board (same
// "player as the one who makes it happen" feel as running Your Store) — but death from old age
// is deliberately NOT a button next to party invitations. It's handled separately, ambiently,
// by a small set of elderly townsfolk (not any of your 40 friends) who peacefully pass on their
// own time as you play. See the ELDERS section below. ──────────────────────────────────────
let marriages = []; // persisted — [{a:name, b:name}] couples formed by hosting a wedding OR the player proposing (see proposeMarriage)
function getSpouse(name) {
  const m = marriages.find(x => x.a === name || x.b === name);
  return m ? (m.a === name ? m.b : m.a) : null;
}

// ─── RELATIVES — your own Mom & Dad, real standing NPCs right outside your house. Unlike the
// 40 Suburbs neighbors, they start already family (no befriending needed, see openNeighborModal's
// redirect to openRelativeModal below) and are deliberately kept OUT of SHOPPER_IDENTITIES so
// hostWedding()'s random pool and proposeMarriage() can never pick your own parent. ─────────────
const RELATIVE_NAMES = ['Mom', 'Dad'];
const RELATIVE_DEFS = [
  { name:'Mom', role:'Your Mom', skin:0xE8B87A, shirt:0xE08AB0, pants:0x3A3A5A, hair:'long',  hairColor:0x3A1F0A, pos:[-15,0,-108] },
  { name:'Dad', role:'Your Dad', skin:0xD9A066, shirt:0x4A7FC9, pants:0x2B2B2B, hair:'short', hairColor:0x1A0A00, pos:[-15,0,-98]  },
];
function buildRelatives() {
  RELATIVE_DEFS.forEach(d => {
    const npc = makeNPC({
      name: d.name, role: d.role, skin: d.skin, shirt: d.shirt, pants: d.pants,
      pos: d.pos, patrol: [[d.pos[0], d.pos[2]]], // single-point patrol = they just stand here forever
      hair: d.hair, hairColor: d.hairColor, emotion: '🥰',
    });
    npc.job = d.role; // truthy so findNearestNeighbor's proximity-interact picks them up like any neighbor
    npcs.push(npc);
  });
}

// ─── COUNTRY NEIGHBORHOODS — user's own ask: "make neiberhoods in each countrys". A small
// 3-house neighborhood per country (not the full 40-house Suburbs scale — that's a much bigger
// build than one add-on deserves), with a real named resident per house. Giving each resident a
// `.job` string is ALL findNearestNeighbor()/openNeighborModal() actually check to treat someone
// as a real, chat/befriend-able neighbor — same mechanism the 40 Suburbs shoppers use — so these
// residents plug straight into the existing friend system with zero new interaction code.
const COUNTRY_NEIGHBORHOOD_ROSTER = [
  { country:'France',    people:[{n:'Léa Bonnet',       j:'Florist'},   {n:'Théo Marchand',   j:'Baker'},     {n:'Camille Rousseau', j:'Painter'}] },
  { country:'UK',         people:[{n:'Owen Fairweather', j:'Postman'},   {n:'Freya Whitfield', j:'Librarian'}, {n:'Alfie Norwood',    j:'Plumber'}] },
  { country:'Italy',      people:[{n:'Nico Ferraro',     j:'Chef'},      {n:'Serena Conti',    j:'Tailor'},    {n:'Dante Bellini',    j:'Fisherman'}] },
  { country:'Japan',      people:[{n:'Sora Ito',         j:'Chef'},      {n:'Yuki Watanabe',   j:'Teacher'},   {n:'Ren Kobayashi',    j:'Carpenter'}] },
  { country:'Australia',  people:[{n:'Charlotte Reef',   j:'Lifeguard'}, {n:'Jack Kingston',   j:'Rancher'},   {n:'Ruby Sinclair',    j:'Vet'}] },
  { country:'Egypt',      people:[{n:'Karim Nasser',     j:'Merchant'},  {n:'Nour Adel',       j:'Weaver'},    {n:'Farida Saleh',     j:'Guide'}] },
  { country:'Brazil',     people:[{n:'Isabela Duarte',   j:'Dancer'},    {n:'Mateus Silva',    j:'Fisherman'}, {n:'Valentina Costa',  j:'Musician'}] },
  { country:'Canada',     people:[{n:'Liam Frost',       j:'Ranger'},    {n:'Chloe Bergeron',  j:'Baker'},     {n:'Noah Lachance',    j:'Trapper'}] },
];
function buildMiniHouse(x, z, seed) {
  const wallColor = new THREE.Color().setHSL(((seed*53)%360)/360, 0.3, 0.62).getHex();
  box(7, 4, 7, wallColor, x, 2, z);
  box(8.4, 0.6, 8.4, 0x6b4a35, x, 4.3, z);
  box(1.1, 2.1, 0.12, 0x2e2015, x, 1.05, z-3.55);
  box(1.1, 1.0, 0.1, 0xaee3f5, x-2, 2.3, z-3.5);
  box(1.1, 1.0, 0.1, 0xaee3f5, x+2, 2.3, z-3.5);
}
function buildCountryNeighborhoods() {
  COUNTRY_NEIGHBORHOOD_ROSTER.forEach(group => {
    const c = COUNTRY_CENTERS[group.country];
    buildSign(`🏘️ ${group.country} Neighborhood`, c.x-15, 5, c.z+2);
    group.people.forEach((p, idx) => {
      const hx = c.x - 15, hz = c.z + 12 + idx*10; // a small row of 3 houses, opposite side of the country center from its President
      buildMiniHouse(hx, hz, idx*7 + group.country.length);
      const hue = ((idx*53 + group.country.length*17) % 360) / 360;
      const npc = makeNPC({
        name: p.n, role: p.j,
        skin: new THREE.Color().setHSL(0.08, 0.35, 0.6).getHex(),
        shirt: new THREE.Color().setHSL(hue, 0.55, 0.5).getHex(),
        pants: 0x223344, hair: ['short','long','spiky','curly'][idx%4], hairColor: 0x2a1508,
        pos: [hx, 0, hz+3.5], patrol: [[hx, hz+3.5], [hx+5, hz]],
      });
      npc.job = p.j; npc.home = { x:hx, z:hz+3.5 }; // truthy .job + real .home makes them a full real neighbor (chat/befriend/visit), same as the 40 Suburbs shoppers
      npcs.push(npc);
    });
  });
}
const ALLOWANCE_COOLDOWN = 300; // 5 real minutes between allowance asks — same real-time-cooldown scale as Guard's Call for Backup
function askForAllowance(name) {
  const remain = ALLOWANCE_COOLDOWN - (playTimeSeconds - lastAllowanceAt);
  if (remain > 0) { showNotif(`⏳ ${name} already gave you allowance recently — try again in ${Math.ceil(remain)}s.`); return; }
  lastAllowanceAt = playTimeSeconds;
  const amount = 10 + Math.floor(Math.random() * 16); // 10-25 S.I.P.
  queueEarning(amount, 0, `${name}'s Allowance`);
  sfx.buy();
  showNotif(`💰 ${name} gave you ${amount} S.I.P. allowance! (pending in Earnings)`);
  saveCurrentUser();
  closeNeighborModal();
}
function openRelativeModal(name) {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('neighborModalTitle').textContent = `❤️ ${name}`;
  const remain = ALLOWANCE_COOLDOWN - (playTimeSeconds - lastAllowanceAt);
  let html = `<div style="margin-bottom:10px;text-align:center;">
      <div style="font-size:24px;">🥰</div>
      <div style="font-size:13px;color:#fff;">${name} — always happy to see you</div>
    </div>`;
  html += `<button onclick="askForAllowance('${name}')" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;${remain>0?'background:#555;cursor:default;':'background:#7ac088;'}" ${remain>0?'disabled':''}>💰 Ask for Allowance${remain>0?` (${Math.ceil(remain)}s)`:''}</button>`;
  html += `<button onclick="inviteNeighborOver('${name}')" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#3a6ea5;">🏠 Invite ${name} to Your House</button>`;
  if (ownedStore) {
    const alreadyStaff = ownedStaff.some(s => s.name === name);
    if (alreadyStaff) {
      html += `<div style="text-align:center;color:#888;font-size:11px;">Already works at your store!</div>`;
    } else if (ownedStaff.length >= MAX_STAFF) {
      html += `<div style="text-align:center;color:#888;font-size:11px;">Your staff is full (${MAX_STAFF}/${MAX_STAFF}).</div>`;
    } else {
      html += `<button onclick="hireFriendAsStaff('${name}')" style="width:100%;padding:8px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#c9974c;">👥 Hire ${name} as Staff — ${staffHireCost()} S.I.P.</button>`;
    }
  }
  document.getElementById('neighborModalBody').innerHTML = html;
  document.getElementById('neighborModal').style.display = 'flex';
}
function proposeMarriage(name) {
  if (getSpouse(playerName)) { showNotif("❌ You're already married!"); return; }
  if (getSpouse(name)) { showNotif(`❌ ${name} is already married!`); return; }
  marriages.push({ a: playerName, b: name });
  saveCurrentUser();
  const npc = npcs.find(x => x.name === name);
  if (npc) setNPCEmotion(npc, '🥰');
  buildEventDecor('wedding', TOWN_EVENT_SPOT.x, TOWN_EVENT_SPOT.z);
  sfx.cheer();
  showNotif(`💍 You and ${name} got married! Congratulations!`);
  closeNeighborModal();
  if (typeof renderAddOnsPanel === 'function') renderAddOnsPanel();
}

const BASE_EMOTIONS = ['😊','😌','🙂','🤔','😴']; // everyday ambient moods the 40 shoppers start with
const TOWN_EVENT_SPOT = { x:378, z:155 }; // open ground in the Suburbs, clear of houses/streets
let eventDecorMeshes = [];
function clearEventDecor() { eventDecorMeshes.forEach(m => scene.remove(m)); eventDecorMeshes = []; }
function buildEventDecor(type, x, z) {
  clearEventDecor();
  const add = (m) => { eventDecorMeshes.push(m); return m; };
  if (type === 'wedding') {
    add(box(0.3, 3, 0.3, 0xffffff, x - 2, 1.5, z));
    add(box(0.3, 3, 0.3, 0xffffff, x + 2, 1.5, z));
    add(box(4.3, 0.3, 0.3, 0xffffff, x, 3, z));
    add(box(0.6, 0.6, 0.6, 0xff6699, x, 3.3, z));
  } else if (type === 'birthday') {
    [[-1.5, 0xff4444], [0, 0xffcc00], [1.5, 0x44ccff]].forEach(([dx, color]) => add(box(0.5, 0.7, 0.5, color, x + dx, 2.5, z)));
    add(box(2, 1, 2, 0x8B5A2B, x, 0.5, z));
  } else if (type === 'funeral') {
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dz]) => add(box(0.3, 0.5, 0.3, 0xffffff, x + dx, 0.25, z + dz)));
  } else if (type === 'grandopening') {
    add(box(0.15, 1.2, 0.15, 0xcccccc, x-2, 0.6, z)); add(box(0.15, 1.2, 0.15, 0xcccccc, x+2, 0.6, z));
    add(box(4, 0.15, 0.15, 0xff3333, x, 1.2, z));
    [[-2.5,0xff4444],[-1,0xffcc00],[0.5,0x44ccff],[2,0x44dd88]].forEach(([dx,color]) => add(box(0.5,0.7,0.5,color,x+dx,2.6,z)));
  } else if (type === 'concert') {
    add(box(6, 0.4, 4, 0x333344, x, 0.4, z));
    add(box(0.3, 3, 0.3, 0x222222, x-3, 1.9, z-2)); add(box(1, 1.5, 1, 0x111111, x-3, 2.5, z-2));
    add(box(0.3, 3, 0.3, 0x222222, x+3, 1.9, z-2)); add(box(1, 1.5, 1, 0x111111, x+3, 2.5, z-2));
  }
}
function openTownEvents() {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('townEventsBody').innerHTML = `
    <button onclick="hostWedding()" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#e0669b;">💍 Host a Wedding</button>
    <button onclick="throwBirthdayParty()" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#4a90c9;">🎂 Throw a Birthday Party</button>
    <button onclick="haveBaby()" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#7ac088;">👶 Have a Baby</button>
    <button onclick="hostGrandOpening()" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#e08a3a;">🎗️ Host a Grand Opening</button>
    <button onclick="hostConcert()" style="width:100%;padding:8px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#8a4ae0;">🎤 Throw a Concert</button>
  `;
  document.getElementById('townEventsModal').style.display = 'flex';
}
function hostGrandOpening() {
  const skip = ['Whispering Woods','Sunset Plains','The Scrapyard','The Dump'];
  const spots = LOC_ZONES.filter(z => !skip.includes(z.name));
  const spot = spots[Math.floor(Math.random()*spots.length)];
  buildEventDecor('grandopening', TOWN_EVENT_SPOT.x, TOWN_EVENT_SPOT.z);
  addToInventory('grand_opening_gift', 'Grand Opening Gift Bag', '🎁');
  queueEarning(30, 0, 'Grand Opening');
  sfx.cheer();
  showNotif(`🎗️ Grand Opening for ${spot.name}! Everyone got a free gift bag. (+30 S.I.P. pending +🎁 Gift Bag)`);
  closeTownEvents();
}
function hostConcert() {
  const price = 15;
  if (sipDollars < price) { sfx.nope(); showNotif(`❌ Need ${price} S.I.P. for a concert ticket!`); return; }
  spendSip(price); updateSIP();
  buildEventDecor('concert', TOWN_EVENT_SPOT.x, TOWN_EVENT_SPOT.z);
  const trackIdx = Math.floor(Math.random()*bgMusic.TRACKS.length);
  bgMusic.switchTrack(trackIdx);
  queueEarning(40, 0, 'Concert Merch');
  sfx.cheer();
  showNotif(`🎤 The concert kicked off with "${bgMusic.TRACKS[trackIdx].name}"! You sold merch in the crowd. (-${price} ticket, +40 S.I.P. merch pending)`);
  closeTownEvents();
}
function closeTownEvents() {
  document.getElementById('townEventsModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function hostWedding() {
  const married = new Set(marriages.flatMap(m => [m.a, m.b]));
  let pool = SHOPPER_IDENTITIES.map(s => s.name).filter(n => !married.has(n) && friends.includes(n));
  if (pool.length < 2) pool = SHOPPER_IDENTITIES.map(s => s.name).filter(n => !married.has(n));
  if (pool.length < 2) { showNotif('Everyone in town is already married! 💍'); closeTownEvents(); return; }
  const a = pool[Math.floor(Math.random() * pool.length)];
  let b = a; while (b === a) b = pool[Math.floor(Math.random() * pool.length)];
  marriages.push({ a, b });
  saveCurrentUser();
  [a, b].forEach(n => { const npc = npcs.find(x => x.name === n); if (npc) setNPCEmotion(npc, '🥰'); });
  buildEventDecor('wedding', TOWN_EVENT_SPOT.x, TOWN_EVENT_SPOT.z);
  queueEarning(50, 0, `${a} & ${b}'s Wedding`);
  sfx.cheer();
  showNotif(`💍 ${a} and ${b} got married! The whole town celebrated. (+50 S.I.P. wedding gift pending)`);
  closeTownEvents();
}
function throwBirthdayParty() {
  const friendPool = SHOPPER_IDENTITIES.map(s => s.name).filter(n => friends.includes(n));
  const pool = friendPool.length ? friendPool : SHOPPER_IDENTITIES.map(s => s.name);
  const name = pool[Math.floor(Math.random() * pool.length)];
  const npc = npcs.find(x => x.name === name);
  if (npc) setNPCEmotion(npc, '🎉');
  buildEventDecor('birthday', TOWN_EVENT_SPOT.x, TOWN_EVENT_SPOT.z);
  queueEarning(20, 0, `${name}'s Birthday`);
  sfx.cheer();
  showNotif(`🎂 It's ${name}'s birthday! Everyone sang and had cake. (+20 S.I.P. party favor pending)`);
  closeTownEvents();
}
function buildTownEventsBoard() {
  const { x, z } = TOWN_EVENT_SPOT;
  box(0.15, 2.2, 0.15, 0x5a3a20, x - 1.3, 1.1, z);
  box(0.15, 2.2, 0.15, 0x5a3a20, x + 1.3, 1.1, z);
  box(3, 1.6, 0.15, 0xf5f0e0, x, 2, z);
  buildSign('🎉 Town Events', x, 3, z - 0.2);
  CITY_ZONES.push({ x, z: z + 1.5, r: 3.5, label: '🎉 Town Events Board', action: () => openTownEvents()});
}

