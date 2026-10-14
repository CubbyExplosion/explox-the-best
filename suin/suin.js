// ===== Suin: a chatbot that learns from examples =====
//
// The idea: instead of hard-coded if/else rules, Suin has a list of
// EXAMPLES. Each example is a phrase paired with a reply. When you type
// something, Suin compares your words to every example's words and picks
// whichever example shares the most matching words. That's the whole
// "learning" trick — counting overlapping words, not needing an exact copy.

// ===== Accounts =====
//
// Each person's name keys their OWN separate learned examples and chat
// history in localStorage, so two people using the same computer don't mix
// up what Suin has learned from each of them. Whoever logged in last stays
// logged in (their name is remembered) until they click "Switch User."

const CURRENT_USER_KEY = "suin_current_user";
let currentUser = localStorage.getItem(CURRENT_USER_KEY);

// Starter examples Suin already knows.
const SEED_EXAMPLES = [
  { text: "hello", reply: "Hi there! 👋" },
  { text: "hi", reply: "Hey! How's it going?" },
  { text: "hey there", reply: "Hey hey! 👋" },
  { text: "good morning", reply: "Good morning to you too! ☀️" },
  { text: "how are you", reply: "I'm doing great, thanks for asking! How about you?" },
  { text: "what is your name", reply: "I'm Suin! Nice to meet you." },
  { text: "who are you", reply: "I'm Suin, a chatbot that learns from examples!" },
  { text: "bye", reply: "Bye! See you later!" },
  { text: "goodbye", reply: "Goodbye! Come back soon!" },
  { text: "thank you", reply: "You're welcome!" },
  { text: "thanks", reply: "No problem!" },
  { text: "what can you do", reply: "I can chat with you about the things I know!" }
];

// Real English greetings — casual, formal, time-of-day, and the
// question-style ones people actually use as a greeting ("what's up",
// "how's it going"). Kept to genuine, commonly-used English phrases, not
// padded with made-up ones or greetings borrowed from other languages,
// since the ask was specifically "in english."
const GREETING_EXAMPLES = [
  { text: "hiya", reply: "Hiya! 👋" },
  { text: "heya", reply: "Heya! What's up?" },
  { text: "yo", reply: "Yo! 😎" },
  { text: "sup", reply: "Not much, what's up with you?" },
  { text: "what's up", reply: "Not much! What's up with you?" },
  { text: "whats up", reply: "Not much! What's up with you?" },
  { text: "howdy", reply: "Howdy! 🤠" },
  { text: "hi there", reply: "Hi there! 👋" },
  { text: "hello there", reply: "Hello there! 👋" },
  { text: "good day", reply: "Good day to you! 🌞" },
  { text: "greetings", reply: "Greetings! 👋" },
  { text: "salutations", reply: "Salutations! That's a fancy way to say hi 😄" },
  { text: "how do you do", reply: "How do you do! Nice and formal 😄" },
  { text: "pleased to meet you", reply: "Pleased to meet you too!" },
  { text: "nice to meet you", reply: "Nice to meet you too!" },
  { text: "good afternoon", reply: "Good afternoon! ☀️" },
  { text: "good evening", reply: "Good evening! 🌆" },
  { text: "how are you doing", reply: "I'm doing great! How about you?" },
  { text: "how have you been", reply: "I've been good! How about you?" },
  { text: "how's it going", reply: "It's going great! How about you?" },
  { text: "hows it going", reply: "It's going great! How about you?" },
  { text: "what's new", reply: "Not much new with me! What's new with you?" },
  { text: "whats new", reply: "Not much new with me! What's new with you?" },
  { text: "what's going on", reply: "Not much! What's going on with you?" },
  { text: "long time no see", reply: "Long time no see! 😄" },
  { text: "welcome back", reply: "Thanks, glad to be back! 👋" },
  { text: "good to see you", reply: "Good to see you too! 😊" },
  { text: "nice to see you", reply: "Nice to see you too! 😊" },
  { text: "g'day", reply: "G'day! 🇦🇺" },
  { text: "ahoy", reply: "Ahoy there! ⚓" }
];

// Replies for the answer to "how about you?" — the natural next thing
// after a greeting, but a totally different kind of phrase than a
// greeting itself, so kept as its own list. Negative ones get a warmer,
// more caring reply instead of just a cheerful one — a kid saying "bad" or
// "sad" shouldn't get the same peppy response as "great."
const MOOD_EXAMPLES = [
  { text: "great", reply: "That's awesome! 😄" },
  { text: "good", reply: "Glad to hear it! 😊" },
  { text: "awesome", reply: "Heck yeah! 🎉" },
  { text: "amazing", reply: "That's amazing to hear! ✨" },
  { text: "fantastic", reply: "Fantastic! Love that. 🌟" },
  { text: "wonderful", reply: "Wonderful! That makes me happy. 😊" },
  { text: "excellent", reply: "Excellent! 🙌" },
  { text: "fine", reply: "Glad you're doing fine!" },
  { text: "okay", reply: "Okay is good! Hope your day gets even better." },
  { text: "alright", reply: "Glad you're doing alright!" },
  { text: "not bad", reply: "Not bad is still pretty good! 👍" },
  { text: "pretty good", reply: "Glad to hear it's pretty good!" },
  { text: "so-so", reply: "So-so days happen! Hope it picks up." },
  { text: "meh", reply: "Meh days happen. Hope tomorrow's better!" },
  { text: "bad", reply: "Aw, sorry to hear that. I hope your day gets better. 💙" },
  { text: "terrible", reply: "Oh no, I'm sorry things are terrible right now. 💙" },
  { text: "awful", reply: "That sounds really rough, I'm sorry. 💙" },
  { text: "not good", reply: "Sorry to hear that. I hope things look up soon." },
  { text: "not great", reply: "Sorry it's not going great. Hang in there!" },
  { text: "rough", reply: "Sounds like a rough time. I hope it gets easier. 💙" },
  { text: "sad", reply: "I'm sorry you're feeling sad. I'm here if you want to chat." },
  { text: "tired", reply: "Aw, sounds like you need some rest!" },
  { text: "stressed", reply: "Sorry you're feeling stressed. Take a deep breath — you've got this." }
];

// 100 cooking examples — kept as its own list (not mixed into SEED_EXAMPLES)
// just to stay organized now that there are a lot of them. allExamples()
// below combines every list together, so it works exactly the same as
// before from the matching algorithm's point of view.
const COOKING_EXAMPLES = [
  { text: "how to cook rice", reply: "Boil 1 cup rice in 2 cups water for 15 minutes, then let it sit covered for 5 minutes." },
  { text: "how to cook pasta", reply: "Boil pasta in salted water for 8–10 minutes until soft, then drain and add sauce." },
  { text: "how to cook scrambled eggs", reply: "Whisk eggs, cook in a buttered pan on low heat, stirring gently until fluffy. Ask an adult to help with the stove!" },
  { text: "how to cook fried eggs", reply: "Crack an egg into a hot buttered pan and cook until the white is set. Get an adult's help with the stove." },
  { text: "how to cook boiled eggs", reply: "Put eggs in boiling water for 9–12 minutes, then cool them in cold water before peeling." },
  { text: "how to cook omelette", reply: "Whisk eggs, pour into a hot buttered pan, add fillings, and fold in half once set." },
  { text: "how to cook pancakes", reply: "Mix flour, milk, egg, and a little sugar into a batter, cook spoonfuls on a hot griddle until bubbly, then flip." },
  { text: "how to cook waffles", reply: "Make pancake-style batter, pour it into a hot waffle iron, and cook until golden and crispy." },
  { text: "how to cook french toast", reply: "Dip bread in beaten egg and milk, then fry in butter until golden on both sides." },
  { text: "how to cook toast", reply: "Put bread in a toaster until golden brown, then add butter or jam." },
  { text: "how to cook grilled cheese", reply: "Butter bread, add cheese, and grill in a pan on medium heat until both sides are golden and the cheese melts." },
  { text: "how to cook mac and cheese", reply: "Boil macaroni, drain, then stir in butter, milk, and shredded cheese until creamy." },
  { text: "how to cook chicken nuggets", reply: "Bake frozen nuggets at 400°F for about 15 minutes, flipping halfway, until golden and hot inside." },
  { text: "how to cook hot dogs", reply: "Boil or grill a hot dog for a few minutes until hot all the way through, then add it to a bun." },
  { text: "how to cook hamburgers", reply: "Shape ground beef into patties, cook on a hot pan or grill a few minutes per side until fully cooked, then add to a bun." },
  { text: "how to cook cheeseburger", reply: "Cook a hamburger patty, add a cheese slice near the end so it melts, then serve on a bun." },
  { text: "how to cook tacos", reply: "Cook seasoned ground beef or chicken in a pan, then spoon it into a warm tortilla with cheese, lettuce, and salsa." },
  { text: "how to cook quesadilla", reply: "Put cheese between two tortillas and cook in a pan until golden and the cheese melts, then cut into wedges." },
  { text: "how to cook burritos", reply: "Fill a tortilla with rice, beans, meat, and cheese, then roll it up tightly." },
  { text: "how to cook nachos", reply: "Spread tortilla chips on a tray, sprinkle with cheese, and bake until melted, then add toppings." },
  { text: "how to cook pizza", reply: "Spread sauce and cheese on dough, add toppings, and bake at 450°F until the crust is golden and cheese is bubbly." },
  { text: "how to cook spaghetti", reply: "Boil spaghetti until soft, drain, and mix with warmed tomato sauce." },
  { text: "how to cook lasagna", reply: "Layer noodles, sauce, cheese, and meat in a dish, then bake covered at 375°F for about 45 minutes." },
  { text: "how to cook ramen", reply: "Boil the noodles in water for a few minutes, then stir in the seasoning packet." },
  { text: "how to cook fried rice", reply: "Cook rice ahead of time, then stir-fry it in a hot pan with egg, veggies, and soy sauce." },
  { text: "how to cook stir fry", reply: "Cook chopped vegetables and meat in a hot pan with a little oil, stirring constantly, until everything is tender." },
  { text: "how to cook chicken breast", reply: "Season chicken and cook in a pan over medium heat about 6–7 minutes per side until no longer pink inside." },
  { text: "how to cook grilled chicken", reply: "Season chicken and cook on a grill or grill pan a few minutes per side until fully cooked." },
  { text: "how to cook baked chicken", reply: "Season chicken and bake at 375°F for about 25–30 minutes until cooked through." },
  { text: "how to cook fried chicken", reply: "Coat chicken in seasoned flour and fry in hot oil until golden and cooked through — always with an adult, since hot oil can splash." },
  { text: "how to cook steak", reply: "Season the steak and cook in a hot pan a few minutes per side, then let it rest before cutting." },
  { text: "how to cook bacon", reply: "Cook bacon strips in a pan over medium heat, flipping occasionally, until crispy." },
  { text: "how to cook sausages", reply: "Cook sausages in a pan over medium heat, turning occasionally, until browned and cooked through." },
  { text: "how to cook meatballs", reply: "Mix ground meat with breadcrumbs and egg, roll into balls, and bake or pan-fry until browned and cooked through." },
  { text: "how to cook meatloaf", reply: "Mix ground meat with breadcrumbs, egg, and seasoning, shape into a loaf, and bake at 350°F for about an hour." },
  { text: "how to cook fish", reply: "Season fish fillets and cook in a pan a few minutes per side until it flakes easily with a fork." },
  { text: "how to cook salmon", reply: "Season salmon and bake at 400°F for about 12–15 minutes until it flakes easily." },
  { text: "how to cook shrimp", reply: "Cook shrimp in a hot pan with a little oil for 2–3 minutes per side until pink." },
  { text: "how to cook sushi rolls", reply: "Spread rice on seaweed, add fillings, and roll it up tightly using a bamboo mat, then slice." },
  { text: "how to cook soup", reply: "Simmer broth with chopped vegetables and any cooked meat until everything is tender." },
  { text: "how to cook tomato soup", reply: "Simmer tomatoes, broth, and a little cream together, then blend until smooth." },
  { text: "how to cook chicken noodle soup", reply: "Simmer chicken, noodles, and vegetables in broth until the noodles are soft and the chicken is cooked." },
  { text: "how to cook chili", reply: "Brown ground meat, then simmer it with beans, tomatoes, and spices for at least 30 minutes." },
  { text: "how to cook stew", reply: "Simmer chunks of meat and vegetables in broth on low heat for a couple hours until tender." },
  { text: "how to cook pot roast", reply: "Sear a roast, then slow-cook it with vegetables and broth for several hours until fork-tender." },
  { text: "how to cook shepherd's pie", reply: "Layer cooked ground meat and vegetables in a dish, top with mashed potatoes, and bake until golden." },
  { text: "how to cook curry", reply: "Simmer vegetables and/or meat in a spiced sauce like coconut milk and curry paste until tender, then serve over rice." },
  { text: "how to cook enchiladas", reply: "Roll filling in tortillas, place in a dish, cover with sauce and cheese, and bake until bubbly." },
  { text: "how to cook fajitas", reply: "Cook sliced peppers, onions, and seasoned meat in a hot pan, then serve with warm tortillas." },
  { text: "how to cook mashed potatoes", reply: "Boil peeled potatoes until soft, drain, then mash with butter and milk." },
  { text: "how to cook baked potato", reply: "Poke holes in a potato and bake at 400°F for about an hour until soft inside." },
  { text: "how to cook french fries", reply: "Cut potatoes into strips and bake at 425°F, flipping halfway, until golden and crispy." },
  { text: "how to cook sweet potato fries", reply: "Cut sweet potatoes into strips, toss with a little oil, and bake at 425°F until crispy." },
  { text: "how to cook onion rings", reply: "Dip onion rings in batter and fry until golden — always with an adult supervising the hot oil." },
  { text: "how to cook roasted vegetables", reply: "Toss chopped vegetables with a little oil, spread on a tray, and roast at 425°F until tender and browned." },
  { text: "how to cook corn on the cob", reply: "Boil corn in water for about 5–7 minutes, or grill it, until tender." },
  { text: "how to cook green beans", reply: "Steam or boil green beans for a few minutes until bright green and tender-crisp." },
  { text: "how to cook broccoli", reply: "Steam broccoli florets for about 5 minutes until bright green and tender." },
  { text: "how to cook roasted carrots", reply: "Toss carrot sticks with a little oil, spread on a tray, and roast at 400°F until soft and slightly caramelized." },
  { text: "how to cook salad", reply: "Chop up your favorite veggies, toss with dressing, and mix well." },
  { text: "how to cook caesar salad", reply: "Toss chopped romaine with Caesar dressing, croutons, and parmesan cheese." },
  { text: "how to cook caprese salad", reply: "Layer tomato and mozzarella slices, add fresh basil, and drizzle with olive oil." },
  { text: "how to cook coleslaw", reply: "Mix shredded cabbage and carrots with a creamy dressing." },
  { text: "how to cook fruit salad", reply: "Chop up your favorite fruits and mix them together in a bowl." },
  { text: "how to cook guacamole", reply: "Mash ripe avocado with lime juice, salt, and chopped onion and tomato." },
  { text: "how to cook salsa", reply: "Chop tomatoes, onion, and cilantro, then mix with lime juice and a pinch of salt." },
  { text: "how to cook hummus", reply: "Blend chickpeas, tahini, lemon juice, garlic, and olive oil until smooth." },
  { text: "how to cook deviled eggs", reply: "Boil eggs, slice in half, mix the yolks with mayo and mustard, then spoon the filling back in." },
  { text: "how to cook sandwich", reply: "Layer your favorite fillings between two slices of bread." },
  { text: "how to cook bruschetta", reply: "Toast bread slices, then top with chopped tomato, basil, and a drizzle of olive oil." },
  { text: "how to cook garlic bread", reply: "Spread butter and minced garlic on bread, then bake or broil until golden and crispy." },
  { text: "how to cook pretzels", reply: "Shape dough into pretzel twists, boil briefly in baking-soda water, then bake until golden brown." },
  { text: "how to cook bread", reply: "Mix flour, yeast, water, and salt into a dough, let it rise, then bake at 375°F until golden and hollow-sounding when tapped." },
  { text: "how to cook biscuits", reply: "Cut cold butter into flour, add milk, shape the dough, and bake at 425°F until golden on top." },
  { text: "how to cook scones", reply: "Mix flour, butter, sugar, and cream into a dough, shape into wedges, and bake until golden." },
  { text: "how to cook banana bread", reply: "Mash ripe bananas into a batter with flour, sugar, and eggs, then bake at 350°F for about an hour." },
  { text: "how to cook zucchini bread", reply: "Mix grated zucchini into a sweet batter, then bake at 350°F for about an hour." },
  { text: "how to cook muffins", reply: "Mix batter, spoon into a muffin tin, and bake at 375°F for about 18–20 minutes until golden." },
  { text: "how to cook cake", reply: "Mix batter, pour into a pan, and bake at 350°F until a toothpick comes out clean, then let it cool before frosting." },
  { text: "how to cook cupcakes", reply: "Fill cupcake liners with batter and bake at 350°F for about 18 minutes, then frost once cool." },
  { text: "how to cook cookies", reply: "Mix dough, scoop onto a tray, and bake at 350°F for about 10 minutes until the edges turn golden." },
  { text: "how to cook brownies", reply: "Mix chocolate batter, pour into a pan, and bake at 350°F for about 25 minutes until just set in the middle." },
  { text: "how to cook pie", reply: "Fill a pie crust with your filling, add a top crust, and bake until golden and bubbling." },
  { text: "how to cook apple pie", reply: "Fill a pie crust with sliced apples, sugar, and cinnamon, cover with a top crust, and bake at 375°F until golden." },
  { text: "how to cook pumpkin pie", reply: "Pour pumpkin custard filling into a pie crust and bake at 350°F until the center is set." },
  { text: "how to cook rice pudding", reply: "Simmer cooked rice with milk, sugar, and a little vanilla until thick and creamy." },
  { text: "how to cook pudding", reply: "Whisk milk, sugar, and cornstarch together and cook on the stove, stirring, until it thickens." },
  { text: "how to cook jello", reply: "Dissolve jello powder in boiling water, add cold water, then chill in the fridge until set." },
  { text: "how to cook s'mores", reply: "Toast a marshmallow (with an adult's help near the fire), then squish it with chocolate between two graham crackers." },
  { text: "how to cook popsicles", reply: "Pour juice or blended fruit into popsicle molds and freeze until solid." },
  { text: "how to cook ice cream", reply: "Whip cream until fluffy, fold in sweetened condensed milk and flavoring, then freeze until firm." },
  { text: "how to cook smoothie", reply: "Blend fruit, yogurt, and a splash of milk or juice until smooth." },
  { text: "how to cook milkshake", reply: "Blend ice cream and milk together until thick and creamy." },
  { text: "how to cook hot chocolate", reply: "Warm milk on the stove and stir in cocoa powder and sugar until dissolved. Ask an adult to help with the stove." },
  { text: "how to cook lemonade", reply: "Mix fresh lemon juice, water, and sugar, then stir until the sugar dissolves." },
  { text: "how to cook iced tea", reply: "Steep tea bags in hot water, let it cool, then pour over ice." },
  { text: "how to cook oatmeal", reply: "Simmer oats in water or milk for a few minutes, stirring, until thick and creamy." },
  { text: "how to cook granola", reply: "Mix oats, nuts, and honey, spread on a tray, and bake at 300°F, stirring occasionally, until golden and crisp." },
  { text: "how to cook yogurt parfait", reply: "Layer yogurt, granola, and fruit in a cup or bowl." },
  { text: "how to cook trail mix", reply: "Mix your favorite nuts, dried fruit, and a few chocolate chips together in a bowl." }
];

// ===== Detailed recipes: ingredient chart + amounts + substitutes =====
//
// 50 of the 100 cooking examples above also get this richer treatment: a
// real ingredient list with amounts, a swap for when you don't have
// something, and numbered steps. The other 50 keep working exactly as
// before through COOKING_EXAMPLES' plain one-line replies — this is
// checked FIRST in sendMessage(), and only takes over when the food asked
// about has an entry here.
//
// Each ingredient is [name, amount, substitute-or-null] to keep this list
// from becoming enormous — a comment instead of a full {name, amount,
// substitute} object per ingredient, since the shape is the same every time.
const DETAILED_RECIPES = {
  "rice": {
    ingredients: [["rice", "1 cup", "any rice works"], ["water", "2 cups", null], ["salt", "a pinch", "okay to skip"]],
    steps: ["Combine rice, water, and salt in a pot.", "Bring to a boil, then cover and simmer 15 minutes.", "Turn off the heat and let it sit covered for 5 more minutes."]
  },
  "pasta": {
    ingredients: [["pasta", "8 oz (half a box)", "any pasta shape works"], ["water", "4 cups", null], ["salt", "1 tsp", "okay to skip"], ["pasta sauce", "1 cup", "butter + parmesan"]],
    steps: ["Boil the water with the salt.", "Add the pasta and cook 8–10 minutes until soft.", "Drain, then stir in warmed sauce."]
  },
  "scrambled eggs": {
    ingredients: [["eggs", "2", null], ["milk", "1 tbsp", "okay to skip"], ["butter", "1 tbsp", "oil"], ["salt", "a pinch", "okay to skip"]],
    steps: ["Whisk the eggs, milk, and salt together.", "Melt butter in a pan on low heat (ask an adult to help with the stove).", "Pour in the eggs and stir gently until fluffy."]
  },
  "fried eggs": {
    ingredients: [["eggs", "1–2", null], ["butter or oil", "1 tsp", "cooking spray"], ["salt & pepper", "a pinch", "okay to skip"]],
    steps: ["Heat butter in a pan (ask an adult to help with the stove).", "Crack the egg into the pan.", "Cook until the white is set, then season."]
  },
  "boiled eggs": {
    ingredients: [["eggs", "as many as you want", null], ["water", "enough to cover the eggs", null]],
    steps: ["Put the eggs in a pot and cover with water.", "Bring to a boil, then simmer 9–12 minutes.", "Cool in cold water before peeling."]
  },
  "omelette": {
    ingredients: [["eggs", "2–3", null], ["milk", "1 tbsp", "okay to skip"], ["cheese or fillings", "a handful", "use whatever veggies/cheese you have"], ["butter", "1 tsp", "oil"]],
    steps: ["Whisk the eggs and milk.", "Pour into a hot buttered pan.", "Add fillings, then fold in half once set."]
  },
  "pancakes": {
    ingredients: [["flour", "1 cup", null], ["milk", "3/4 cup", "any milk, including plant milk"], ["egg", "1", "skip it, use a splash more milk"], ["sugar", "1 tbsp", "honey, or skip it"], ["baking powder", "1 tsp", "flatter pancakes if skipped"]],
    steps: ["Mix the dry ingredients together.", "Whisk in the milk and egg until just combined (a few lumps are fine).", "Cook spoonfuls on a hot griddle until bubbles form, then flip."]
  },
  "waffles": {
    ingredients: [["flour", "1 cup", null], ["milk", "3/4 cup", "any milk"], ["egg", "1", null], ["melted butter", "1/4 cup", "oil"], ["baking powder", "1 tsp", null]],
    steps: ["Mix the dry ingredients, then whisk in the wet ingredients.", "Pour batter into a hot waffle iron.", "Cook until golden and crispy."]
  },
  "french toast": {
    ingredients: [["bread", "4 slices", "any bread"], ["eggs", "2", null], ["milk", "1/4 cup", "any milk"], ["cinnamon", "a pinch", "okay to skip"], ["butter", "1 tbsp", "oil"]],
    steps: ["Whisk the eggs, milk, and cinnamon together.", "Dip each bread slice in the mixture.", "Fry in butter until golden on both sides."]
  },
  "toast": {
    ingredients: [["bread", "however many slices you want", null], ["butter or jam", "to taste", "whatever spread you like"]],
    steps: ["Toast the bread until golden brown.", "Add your topping."]
  },
  "grilled cheese": {
    ingredients: [["bread", "2 slices", null], ["cheese", "1–2 slices", "any melty cheese"], ["butter", "1 tbsp", "mayo spread on the outside also works"]],
    steps: ["Butter the outside of each bread slice.", "Put the cheese between the slices, butter-side out.", "Cook in a pan on medium heat until both sides are golden and the cheese melts."]
  },
  "mac and cheese": {
    ingredients: [["macaroni", "2 cups", null], ["butter", "2 tbsp", null], ["milk", "1 cup", "any milk"], ["shredded cheese", "1.5 cups", "any melty cheese"]],
    steps: ["Boil the macaroni until soft, then drain.", "Return it to the pot on low heat.", "Stir in butter, milk, and cheese until creamy."]
  },
  "hot dogs": {
    ingredients: [["hot dogs", "as many as you want", "any sausage works"], ["buns", "same number as hot dogs", "bread slices"]],
    steps: ["Boil or grill the hot dogs a few minutes until hot all the way through.", "Add each one to a bun."]
  },
  "chicken nuggets": {
    ingredients: [["frozen chicken nuggets", "as many as you want", null]],
    steps: ["Spread the nuggets on a baking tray.", "Bake at 400°F for about 15 minutes, flipping halfway.", "They're done once golden and hot inside."]
  },
  "hamburgers": {
    ingredients: [["ground beef", "1 lb (makes ~4 patties)", "ground turkey or chicken"], ["salt & pepper", "to taste", null], ["buns", "4", null]],
    steps: ["Shape the beef into patties and season.", "Cook in a pan or on a grill a few minutes per side until fully cooked.", "Serve on a bun."]
  },
  "tacos": {
    ingredients: [["ground beef or chicken", "1 lb", "beans, for a veggie version"], ["taco seasoning", "1 packet (~2 tbsp)", "cumin + chili powder + garlic powder mixed together"], ["tortillas", "8", null], ["toppings", "cheese/lettuce/salsa", "whatever you have"]],
    steps: ["Cook the meat with the seasoning in a pan until browned.", "Warm the tortillas.", "Spoon in the meat and add toppings."]
  },
  "quesadilla": {
    ingredients: [["tortillas", "2", null], ["cheese", "1 cup", "any melty cheese"], ["fillings", "optional (chicken/veggies)", "whatever you have"]],
    steps: ["Put cheese (and fillings) between two tortillas, or fold one in half.", "Cook in a pan until golden and the cheese melts.", "Cut into wedges."]
  },
  "burritos": {
    ingredients: [["tortilla", "1 large", null], ["rice", "1/2 cup", null], ["beans", "1/2 cup", "any beans"], ["cheese & salsa", "to taste", null]],
    steps: ["Fill the tortilla with rice, beans, and cheese.", "Roll it up tightly.", "Optionally warm it in a pan."]
  },
  "pizza": {
    ingredients: [["pizza dough", "1 ball", "store-bought dough or flatbread/pita for a quick version"], ["sauce", "1/2 cup", "pesto or olive oil"], ["cheese", "1.5 cups", "any melty cheese"], ["toppings", "your choice", null]],
    steps: ["Spread sauce and cheese on the dough.", "Add toppings.", "Bake at 450°F for 12–15 minutes until golden and bubbly."]
  },
  "spaghetti": {
    ingredients: [["spaghetti", "8 oz", null], ["water & salt", "for boiling", null], ["tomato sauce", "1–2 cups", "butter + parmesan if you have no sauce"]],
    steps: ["Boil the spaghetti 8–10 minutes until soft.", "Drain it.", "Toss with warmed sauce."]
  },
  "fried rice": {
    ingredients: [["cooked rice", "2 cups (day-old is best)", "fresh rice cooled works too"], ["egg", "1", "skip it for a no-egg version"], ["mixed veggies", "1 cup", "whatever veggies you have"], ["soy sauce", "2 tbsp", "a pinch of salt"]],
    steps: ["Scramble the egg in a hot pan, then push it to the side.", "Add veggies and rice, stir-frying together.", "Stir in soy sauce."]
  },
  "chicken breast": {
    ingredients: [["chicken breast", "1–2", null], ["oil", "1 tbsp", null], ["salt, pepper & seasoning", "to taste", null]],
    steps: ["Season the chicken.", "Cook in a pan over medium heat 6–7 minutes per side.", "Make sure it's no longer pink inside before serving."]
  },
  "baked chicken": {
    ingredients: [["chicken pieces", "as needed", null], ["oil", "1 tbsp", null], ["seasoning", "to taste", null]],
    steps: ["Season the chicken.", "Place on a baking tray.", "Bake at 375°F for 25–30 minutes until cooked through."]
  },
  "steak": {
    ingredients: [["steak", "1 per person", null], ["salt & pepper", "to taste", null], ["oil", "1 tbsp", "butter"]],
    steps: ["Season the steak.", "Cook in a hot pan a few minutes per side.", "Let it rest 5 minutes before cutting."]
  },
  "bacon": {
    ingredients: [["bacon strips", "as many as you want", "turkey bacon for a lighter version"]],
    steps: ["Cook the bacon in a pan over medium heat.", "Flip occasionally.", "Cook until crispy."]
  },
  "meatballs": {
    ingredients: [["ground meat", "1 lb", null], ["breadcrumbs", "1/2 cup", "crushed crackers"], ["egg", "1", "a splash of milk"], ["seasoning", "to taste", null]],
    steps: ["Mix everything together.", "Roll into balls.", "Bake at 400°F for 20 minutes, or pan-fry until browned and cooked through."]
  },
  "fish": {
    ingredients: [["fish fillets", "as needed", null], ["oil or butter", "1 tbsp", null], ["salt, pepper & lemon", "to taste", null]],
    steps: ["Season the fish.", "Cook in a pan a few minutes per side.", "It's done once it flakes easily with a fork."]
  },
  "salmon": {
    ingredients: [["salmon fillet", "as needed", null], ["oil", "1 tbsp", null], ["salt, pepper & lemon", "to taste", "any citrus, or just salt & pepper"]],
    steps: ["Season the salmon.", "Bake at 400°F for 12–15 minutes.", "It's done once it flakes easily."]
  },
  "tomato soup": {
    ingredients: [["canned tomatoes", "28 oz", "fresh tomatoes, chopped"], ["broth", "1 cup", "water + bouillon"], ["cream", "a splash", "milk, or skip it"]],
    steps: ["Simmer the tomatoes and broth together 15 minutes.", "Blend until smooth.", "Stir in the cream."]
  },
  "chili": {
    ingredients: [["ground beef", "1 lb", "ground turkey, or beans for a veggie version"], ["canned beans", "1 can", "any beans"], ["canned tomatoes", "1 can", null], ["chili powder", "1–2 tbsp", "cumin + paprika mixed together"]],
    steps: ["Brown the meat.", "Add the beans, tomatoes, and chili powder.", "Simmer at least 30 minutes."]
  },
  "curry": {
    ingredients: [["vegetables and/or meat", "2 cups", "whatever you have on hand"], ["curry paste or powder", "2 tbsp", "turmeric + cumin + chili powder mixed together"], ["coconut milk", "1 can", "regular milk + a little oil"], ["rice", "for serving", null]],
    steps: ["Cook the meat/veggies in a pan.", "Stir in the curry paste.", "Add coconut milk and simmer until tender, then serve over rice."]
  },
  "mashed potatoes": {
    ingredients: [["potatoes", "4 medium, peeled", null], ["butter", "2 tbsp", "oil"], ["milk", "1/4 cup", "any milk, or the potato cooking water"], ["salt", "to taste", null]],
    steps: ["Boil the potatoes until soft.", "Drain them.", "Mash with butter, milk, and salt."]
  },
  "baked potato": {
    ingredients: [["potato", "1 per person", null], ["oil", "a rub", "okay to skip"], ["salt", "a pinch", null]],
    steps: ["Poke holes in the potato with a fork.", "Rub with oil and salt.", "Bake at 400°F about an hour until soft inside."]
  },
  "french fries": {
    ingredients: [["potatoes", "2–3, cut into strips", null], ["oil", "2 tbsp", "any cooking oil"], ["salt", "to taste", null]],
    steps: ["Toss the potato strips with oil and salt.", "Spread on a tray.", "Bake at 425°F for 25–30 minutes, flipping halfway, until golden."]
  },
  "roasted vegetables": {
    ingredients: [["chopped vegetables", "4 cups", "whatever you have"], ["oil", "2 tbsp", null], ["salt & pepper", "to taste", null]],
    steps: ["Toss the veggies with oil and salt.", "Spread on a tray.", "Roast at 425°F for 20–25 minutes until tender and browned."]
  },
  "salad": {
    ingredients: [["lettuce or greens", "a few big handfuls", null], ["toppings", "whatever you have (tomato, cucumber, etc.)", null], ["dressing", "2 tbsp", "oil + vinegar if you have no bottled dressing"]],
    steps: ["Chop the veggies.", "Toss everything with the dressing."]
  },
  "guacamole": {
    ingredients: [["ripe avocados", "2", null], ["lime juice", "1 tbsp", "lemon juice"], ["salt", "to taste", null], ["chopped onion & tomato", "optional", "skip if you don't have them"]],
    steps: ["Mash the avocado.", "Mix in the lime juice and salt.", "Stir in onion and tomato if using."]
  },
  "coleslaw": {
    ingredients: [["shredded cabbage", "4 cups", "bagged coleslaw mix"], ["shredded carrots", "1 cup", null], ["mayo", "1/2 cup", "yogurt for a lighter version"], ["vinegar & sugar", "1 tbsp each", null]],
    steps: ["Mix the dressing ingredients together.", "Toss with the cabbage and carrots."]
  },
  "sandwich": {
    ingredients: [["bread", "2 slices", null], ["fillings", "whatever you like (meat/cheese/veggies)", null], ["condiments", "to taste", null]],
    steps: ["Layer the fillings between the bread slices."]
  },
  "garlic bread": {
    ingredients: [["bread or baguette", "1", null], ["butter", "4 tbsp, softened", null], ["garlic", "1–2 cloves, minced", "1/2 tsp garlic powder"], ["parsley", "optional", "okay to skip"]],
    steps: ["Mix the butter and garlic together.", "Spread on the bread.", "Bake or broil until golden."]
  },
  "bread": {
    ingredients: [["flour", "3 cups", null], ["yeast", "1 packet", "baking powder for a quick non-yeast version, though it won't rise the same way"], ["water", "1 cup, warm", null], ["salt", "1.5 tsp", null], ["sugar", "1 tsp", "honey"]],
    steps: ["Mix into a dough and knead it.", "Let it rise for 1 hour.", "Shape it and bake at 375°F for 30 minutes until golden and hollow-sounding when tapped."]
  },
  "biscuits": {
    ingredients: [["flour", "2 cups", null], ["cold butter, cubed", "1/2 cup", "shortening"], ["milk", "3/4 cup", "buttermilk, for fluffier biscuits"], ["baking powder", "1 tbsp", null]],
    steps: ["Cut the butter into the flour until crumbly.", "Add the milk and shape the dough.", "Cut into rounds and bake at 425°F for 12–15 minutes until golden."]
  },
  "muffins": {
    ingredients: [["flour", "2 cups", null], ["sugar", "3/4 cup", "honey"], ["egg", "1", null], ["milk", "1 cup", "any milk"], ["butter or oil", "1/3 cup", null], ["baking powder", "2 tsp", null]],
    steps: ["Mix the wet and dry ingredients separately, then combine.", "Fill muffin cups.", "Bake at 375°F for 18–20 minutes."]
  },
  "cake": {
    ingredients: [["flour", "2 cups", null], ["sugar", "1.5 cups", null], ["butter, softened", "1/2 cup", "oil"], ["eggs", "2", null], ["milk", "1 cup", null], ["baking powder", "2 tsp", null]],
    steps: ["Cream the butter and sugar together, then add the eggs.", "Alternate adding the flour mixture and milk.", "Pour into a pan and bake at 350°F for 30–35 minutes until a toothpick comes out clean."]
  },
  "cupcakes": {
    ingredients: [["flour", "1.5 cups", null], ["sugar", "1 cup", null], ["butter, softened", "1/3 cup", "oil"], ["egg", "2", null], ["milk", "3/4 cup", null], ["baking powder", "1.5 tsp", null]],
    steps: ["Mix the batter the same way as cake batter.", "Fill cupcake liners about 2/3 full.", "Bake at 350°F for about 18 minutes, then frost once cool."]
  },
  "cookies": {
    ingredients: [["flour", "2.25 cups", null], ["butter, softened", "1 cup", null], ["sugar", "3/4 cup", "some brown sugar for chewier cookies"], ["egg", "1", null], ["chocolate chips", "1 cup", "any mix-in you like"], ["baking soda", "1 tsp", null]],
    steps: ["Cream the butter and sugar, then add the egg.", "Mix in the dry ingredients and chocolate chips.", "Scoop onto a tray and bake at 350°F for 9–11 minutes."]
  },
  "brownies": {
    ingredients: [["melted butter", "1/2 cup", "oil"], ["sugar", "1 cup", null], ["cocoa powder", "1/3 cup", "melted chocolate"], ["eggs", "2", null], ["flour", "1/2 cup", null]],
    steps: ["Mix the melted butter, sugar, and cocoa powder.", "Whisk in the eggs, then fold in the flour.", "Pour into a pan and bake at 350°F for 25 minutes until just set in the middle."]
  },
  "apple pie": {
    ingredients: [["pie crust", "2 (top + bottom)", "store-bought crust"], ["apples, sliced", "6 cups", null], ["sugar", "3/4 cup", "less, if the apples are already sweet"], ["cinnamon", "1 tsp", "nutmeg, or skip it"], ["flour or cornstarch", "2 tbsp (to thicken the juices)", null]],
    steps: ["Toss the apples with sugar, cinnamon, and flour.", "Fill the bottom crust and cover with the top crust.", "Bake at 375°F for 45–50 minutes until golden."]
  },
  "smoothie": {
    ingredients: [["fruit", "2 cups, fresh or frozen", null], ["yogurt", "1/2 cup", "milk or juice"], ["milk or juice", "1/2 cup", "water works in a pinch"], ["honey", "optional", "skip if the fruit is sweet enough"]],
    steps: ["Blend everything together until smooth."]
  },
  "hot chocolate": {
    ingredients: [["milk", "1 cup", "any milk"], ["cocoa powder", "1–2 tbsp", "melted chocolate"], ["sugar", "1–2 tbsp", "honey"]],
    steps: ["Warm the milk on the stove (ask an adult to help).", "Whisk in the cocoa powder and sugar.", "Stir until dissolved."]
  },

  // --- the other 50, added after the first batch ---
  "cheeseburger": {
    ingredients: [["ground beef", "1/4 lb per patty", "ground turkey"], ["cheese slice", "1 per burger", "any melty cheese"], ["bun", "1", "bread"], ["salt & pepper", "to taste", null]],
    steps: ["Shape and season the patty.", "Cook in a pan or on a grill a few minutes per side.", "Add cheese near the end so it melts, then serve on a bun."]
  },
  "nachos": {
    ingredients: [["tortilla chips", "4 cups", "any corn chips"], ["shredded cheese", "1.5 cups", "any melty cheese"], ["toppings", "beans/jalapeños/salsa", "whatever you have"]],
    steps: ["Spread the chips on a tray.", "Sprinkle with cheese.", "Bake at 350°F until melted, then add toppings."]
  },
  "lasagna": {
    ingredients: [["lasagna noodles", "9", "no-boil noodles"], ["tomato sauce", "3 cups", null], ["ricotta cheese", "15 oz", "cottage cheese"], ["mozzarella", "2 cups", "any melty cheese"], ["ground meat", "1 lb, optional", "skip it for a veggie version"]],
    steps: ["Layer noodles, sauce, cheese, and meat in a dish.", "Repeat the layers.", "Bake covered at 375°F for 45 minutes."]
  },
  "ramen": {
    ingredients: [["instant ramen noodles", "1 pack", null], ["water", "2 cups", null], ["seasoning packet", "included", "bouillon + soy sauce"], ["egg or veggies", "optional", "whatever you have"]],
    steps: ["Boil the water.", "Add the noodles and cook 3 minutes.", "Stir in the seasoning and any extras."]
  },
  "stir fry": {
    ingredients: [["mixed vegetables", "3 cups", "whatever you have"], ["protein (chicken/tofu/beef)", "1 cup", "any protein"], ["oil", "1 tbsp", null], ["soy sauce", "2 tbsp", "a pinch of salt"]],
    steps: ["Heat the oil in a pan.", "Cook the protein first, then add the veggies.", "Stir-fry until tender, then add soy sauce."]
  },
  "grilled chicken": {
    ingredients: [["chicken breast or thighs", "as needed", null], ["oil", "1 tbsp", null], ["seasoning", "to taste", null]],
    steps: ["Season the chicken.", "Grill a few minutes per side.", "Make sure it's no longer pink inside."]
  },
  "fried chicken": {
    ingredients: [["chicken pieces", "as needed", null], ["seasoned flour", "1 cup", null], ["oil for frying", "enough to submerge the chicken", "always needs real oil — do this with an adult"]],
    steps: ["Coat the chicken in seasoned flour.", "Fry in hot oil until golden and cooked through — always with an adult, since hot oil can splash."]
  },
  "sausages": {
    ingredients: [["sausages", "as many as you want", "hot dogs"]],
    steps: ["Cook in a pan over medium heat, turning occasionally.", "Cook until browned and cooked through."]
  },
  "meatloaf": {
    ingredients: [["ground meat", "1.5 lb", null], ["breadcrumbs", "1/2 cup", "crushed crackers"], ["egg", "1", null], ["ketchup, for the top", "a few tbsp", "BBQ sauce"]],
    steps: ["Mix everything together.", "Shape into a loaf and top with ketchup.", "Bake at 350°F for about 1 hour."]
  },
  "shrimp": {
    ingredients: [["shrimp, peeled", "1 lb", null], ["oil or butter", "1 tbsp", null], ["garlic & salt", "to taste", "any seasoning you like"]],
    steps: ["Heat the oil in a pan.", "Cook the shrimp 2–3 minutes per side.", "They're done once pink."]
  },
  "sushi rolls": {
    ingredients: [["sushi rice, cooked & seasoned", "2 cups", null], ["nori (seaweed sheets)", "as needed", null], ["fillings (cucumber/avocado/cooked fish)", "your choice", "whatever you like"]],
    steps: ["Spread rice on the nori.", "Add fillings.", "Roll tightly with a bamboo mat, then slice."]
  },
  "soup": {
    ingredients: [["broth", "4 cups", "water + bouillon"], ["chopped vegetables", "2 cups", "whatever you have"], ["cooked meat", "optional", null]],
    steps: ["Simmer everything together until the vegetables are tender."]
  },
  "chicken noodle soup": {
    ingredients: [["chicken broth", "6 cups", null], ["cooked chicken, shredded", "2 cups", null], ["egg noodles", "2 cups", null], ["chopped carrots & celery", "1 cup", "whatever veggies you have"]],
    steps: ["Simmer the broth with the vegetables.", "Add the noodles and cook until soft.", "Stir in the chicken."]
  },
  "stew": {
    ingredients: [["stew meat, cubed", "1.5 lb", null], ["broth", "4 cups", null], ["chopped potatoes & carrots", "2 cups", null], ["flour, to thicken", "2 tbsp", "cornstarch"]],
    steps: ["Brown the meat.", "Add the broth and vegetables.", "Simmer on low for a couple hours until tender."]
  },
  "pot roast": {
    ingredients: [["beef roast", "3 lb", null], ["broth", "2 cups", null], ["chopped carrots, potatoes & onion", "3 cups", null], ["oil, for searing", "1 tbsp", null]],
    steps: ["Sear the roast in a hot pot.", "Add the broth and vegetables.", "Slow-cook for several hours until fork-tender."]
  },
  "shepherd's pie": {
    ingredients: [["cooked ground meat", "1 lb", null], ["mixed vegetables", "1 cup", "whatever you have"], ["mashed potatoes, for the top", "3 cups", null], ["gravy", "optional, 1/2 cup", "broth"]],
    steps: ["Layer the meat and vegetables in a dish.", "Top with mashed potatoes.", "Bake at 375°F until golden."]
  },
  "enchiladas": {
    ingredients: [["tortillas", "8", null], ["cooked chicken or beans", "2 cups", "any filling"], ["enchilada sauce", "2 cups", "tomato sauce + chili powder"], ["shredded cheese", "1.5 cups", null]],
    steps: ["Roll the filling in the tortillas.", "Place in a dish and cover with sauce and cheese.", "Bake at 375°F until bubbly."]
  },
  "fajitas": {
    ingredients: [["sliced chicken or beef", "1 lb", null], ["sliced peppers & onions", "2 cups", null], ["oil", "1 tbsp", null], ["fajita seasoning", "2 tbsp", "cumin + chili powder + garlic powder"], ["tortillas", "as needed", null]],
    steps: ["Cook the meat and veggies together in a hot pan with the seasoning.", "Serve with warm tortillas."]
  },
  "sweet potato fries": {
    ingredients: [["sweet potatoes, cut into strips", "2", null], ["oil", "2 tbsp", null], ["salt", "to taste", null]],
    steps: ["Toss with oil and salt.", "Spread on a tray.", "Bake at 425°F until crispy."]
  },
  "onion rings": {
    ingredients: [["onion, sliced into rings", "1", null], ["batter (flour + milk + egg)", "as needed", null], ["oil for frying", "enough to submerge", "always with an adult"]],
    steps: ["Dip the rings in batter.", "Fry until golden — always with an adult supervising the hot oil."]
  },
  "corn on the cob": {
    ingredients: [["corn", "as many ears as you want", null], ["water, for boiling", "enough to cover", null], ["butter & salt", "to taste", null]],
    steps: ["Boil the corn 5–7 minutes, or grill it, until tender.", "Add butter and salt."]
  },
  "green beans": {
    ingredients: [["green beans", "2 cups", null], ["water, for steaming", "as needed", null], ["salt & butter", "to taste", "olive oil"]],
    steps: ["Steam or boil a few minutes until bright green and tender-crisp."]
  },
  "broccoli": {
    ingredients: [["broccoli florets", "3 cups", null], ["water, for steaming", "as needed", null], ["salt", "to taste", null]],
    steps: ["Steam about 5 minutes until bright green and tender."]
  },
  "roasted carrots": {
    ingredients: [["carrots, sliced", "4", null], ["oil", "1 tbsp", null], ["salt & pepper", "to taste", null]],
    steps: ["Toss with oil and salt.", "Spread on a tray.", "Roast at 400°F until soft and slightly caramelized."]
  },
  "caesar salad": {
    ingredients: [["romaine lettuce, chopped", "1 head", null], ["caesar dressing", "1/4 cup", "ranch"], ["croutons", "1 cup", "crushed crackers"], ["parmesan cheese", "to taste", null]],
    steps: ["Toss everything together."]
  },
  "caprese salad": {
    ingredients: [["tomatoes, sliced", "2", null], ["fresh mozzarella, sliced", "8 oz", null], ["fresh basil", "a handful", "dried basil"], ["olive oil", "1 tbsp", null]],
    steps: ["Layer the tomato and mozzarella slices.", "Add basil.", "Drizzle with olive oil."]
  },
  "fruit salad": {
    ingredients: [["assorted fruit, chopped", "4 cups", "whatever you have"], ["lemon juice", "optional, a squeeze", "keeps the fruit fresh-looking"]],
    steps: ["Chop the fruit.", "Mix together in a bowl."]
  },
  "salsa": {
    ingredients: [["tomatoes, chopped", "4", null], ["onion, chopped", "1/4 cup", null], ["cilantro", "a handful", "skip it if you don't like it"], ["lime juice", "1 tbsp", "lemon juice"], ["salt", "to taste", null]],
    steps: ["Mix everything together."]
  },
  "hummus": {
    ingredients: [["chickpeas", "1 can, drained", null], ["tahini", "2 tbsp", "peanut butter (changes the flavor a bit)"], ["lemon juice", "2 tbsp", null], ["garlic", "1 clove", "1/4 tsp garlic powder"], ["olive oil", "2 tbsp", null]],
    steps: ["Blend everything together until smooth."]
  },
  "deviled eggs": {
    ingredients: [["hard-boiled eggs, halved", "6", null], ["mayo", "1/4 cup", "yogurt"], ["mustard", "1 tsp", "okay to skip"], ["paprika", "optional, a sprinkle", null]],
    steps: ["Mix the yolks with mayo and mustard.", "Spoon the filling back into the whites.", "Sprinkle with paprika."]
  },
  "bruschetta": {
    ingredients: [["bread, sliced", "1 baguette", null], ["tomatoes, chopped", "2", null], ["fresh basil", "a handful", "dried basil"], ["olive oil", "1 tbsp", null], ["garlic", "1 clove", "garlic powder"]],
    steps: ["Toast the bread slices.", "Top with the tomato mixture."]
  },
  "pretzels": {
    ingredients: [["flour", "4 cups", null], ["yeast", "1 packet", null], ["warm water", "1.5 cups", null], ["baking soda, for the boiling water bath", "1/4 cup", "this step is what gives pretzels their chewy crust"], ["coarse salt, for topping", "a sprinkle", null]],
    steps: ["Make and shape the dough into twists.", "Boil briefly in baking-soda water.", "Bake at 450°F until golden brown."]
  },
  "scones": {
    ingredients: [["flour", "2 cups", null], ["cold butter, cubed", "1/2 cup", "shortening"], ["sugar", "1/3 cup", null], ["heavy cream", "3/4 cup", "half-and-half"]],
    steps: ["Mix into a dough.", "Shape into wedges.", "Bake at 400°F until golden."]
  },
  "banana bread": {
    ingredients: [["ripe bananas, mashed", "3", null], ["flour", "2 cups", null], ["sugar", "3/4 cup", "honey"], ["egg", "1", null], ["melted butter", "1/3 cup", "oil"]],
    steps: ["Mix everything into a batter.", "Pour into a loaf pan.", "Bake at 350°F for about an hour."]
  },
  "zucchini bread": {
    ingredients: [["grated zucchini", "2 cups", null], ["flour", "2 cups", null], ["sugar", "1 cup", "less, if you like it less sweet"], ["eggs", "2", null], ["oil", "1/2 cup", null]],
    steps: ["Mix everything into a batter.", "Pour into a loaf pan.", "Bake at 350°F for about an hour."]
  },
  "pie": {
    ingredients: [["pie crust", "1 or 2 (top + bottom)", "store-bought crust"], ["filling of your choice", "as needed", null], ["sugar", "to taste, if using fruit", null]],
    steps: ["Fill the crust.", "Add a top crust if using one.", "Bake until golden and bubbling."]
  },
  "pumpkin pie": {
    ingredients: [["pie crust", "1", null], ["canned pumpkin", "15 oz", null], ["eggs", "2", null], ["sweetened condensed milk", "1 can", "evaporated milk + 3/4 cup sugar"], ["pumpkin pie spice", "2 tsp", "cinnamon + nutmeg + ginger"]],
    steps: ["Whisk the filling ingredients together.", "Pour into the crust.", "Bake at 350°F until the center is set."]
  },
  "rice pudding": {
    ingredients: [["cooked rice", "2 cups", null], ["milk", "2 cups", "any milk"], ["sugar", "1/4 cup", "honey"], ["vanilla", "optional, 1 tsp", "okay to skip"]],
    steps: ["Simmer everything together, stirring, until thick and creamy."]
  },
  "pudding": {
    ingredients: [["milk", "2 cups", null], ["sugar", "1/3 cup", null], ["cornstarch", "3 tbsp", "flour"], ["vanilla or cocoa powder", "for flavor", null]],
    steps: ["Whisk everything together.", "Cook on the stove, stirring constantly, until thickened."]
  },
  "jello": {
    ingredients: [["jello powder", "1 box", null], ["boiling water", "1 cup", null], ["cold water", "1 cup", null]],
    steps: ["Dissolve the powder in boiling water.", "Stir in the cold water.", "Chill in the fridge until set."]
  },
  "s'mores": {
    ingredients: [["graham crackers", "2 per s'more", null], ["chocolate", "1 piece", "Nutella"], ["marshmallow", "1", null]],
    steps: ["Toast the marshmallow (with an adult's help near a fire).", "Squish it with chocolate between two graham crackers."]
  },
  "popsicles": {
    ingredients: [["juice or blended fruit", "2 cups", "whatever flavor you like"], ["popsicle molds", "as needed", null]],
    steps: ["Pour the liquid into the molds.", "Freeze until solid."]
  },
  "ice cream": {
    ingredients: [["heavy cream", "2 cups", "needed for the fluffy texture — no real substitute"], ["sweetened condensed milk", "1 can", null], ["vanilla or other flavoring", "1 tsp", null]],
    steps: ["Whip the cream until fluffy.", "Fold in the condensed milk and flavoring.", "Freeze until firm."]
  },
  "milkshake": {
    ingredients: [["ice cream", "2 cups", "frozen yogurt"], ["milk", "1/2 cup", "any milk"]],
    steps: ["Blend together until thick and creamy."]
  },
  "lemonade": {
    ingredients: [["fresh lemon juice", "1 cup", "bottled lemon juice"], ["water", "4 cups", null], ["sugar", "3/4 cup", "honey"]],
    steps: ["Mix everything together.", "Stir until the sugar dissolves."]
  },
  "iced tea": {
    ingredients: [["tea bags", "4", "loose tea in a strainer"], ["hot water", "4 cups", null], ["ice, for serving", "as needed", null]],
    steps: ["Steep the tea bags in hot water.", "Let it cool.", "Pour over ice."]
  },
  "oatmeal": {
    ingredients: [["oats", "1 cup", null], ["water or milk", "2 cups", "any milk"], ["salt", "a pinch", null], ["toppings (fruit/honey/cinnamon)", "optional", null]],
    steps: ["Simmer the oats in water or milk, stirring, until thick and creamy.", "Add toppings."]
  },
  "granola": {
    ingredients: [["rolled oats", "3 cups", null], ["nuts", "1 cup", "seeds"], ["honey", "1/3 cup", "maple syrup"], ["oil", "2 tbsp", null]],
    steps: ["Mix everything together.", "Spread on a tray.", "Bake at 300°F, stirring occasionally, until golden and crisp."]
  },
  "yogurt parfait": {
    ingredients: [["yogurt", "1 cup", "any flavor"], ["granola", "1/2 cup", "crushed cereal"], ["fruit", "1/2 cup", "whatever you have"]],
    steps: ["Layer the yogurt, granola, and fruit in a cup or bowl."]
  },
  "trail mix": {
    ingredients: [["nuts", "1 cup", "whatever kind you like"], ["dried fruit", "1/2 cup", null], ["chocolate chips", "1/4 cup", "any small candy"]],
    steps: ["Mix everything together in a bowl."]
  }
};

// Recognizes both "how to cook X" and "how to bake X" — nobody naturally
// says "cook cookies," they say "bake cookies," so the recipe lookup needs
// to understand both verbs even though the underlying data is still one
// shared list of recipes (a cookie recipe is the same chart either way).
function extractCookingSubject(text) {
  const m = text.toLowerCase().match(/how (?:to|do i) (?:cook|bake) (?:a |an |some )?(.+)/);
  return m ? m[1].trim().replace(/\?+$/, "") : null;
}

// Which verb was actually typed — "how to bake cookies" should get a card
// that says "How to bake cookies," not always "How to cook X" regardless
// of what was asked (the underlying recipe DATA is the same either way,
// but the wording Suin echoes back should match the real question).
function extractCookingVerb(text) {
  return /\bbake\b/i.test(text) ? "bake" : "cook";
}

// Looks up a subject in DETAILED_RECIPES, tolerating a missing space (like
// "icecream" instead of "ice cream"). Without this, "icecream" wouldn't
// match the "ice cream" key at all, and would fall through to word-overlap
// matching instead — where it once tied with "rice" (both only share
// "how"/"to"/"cook") and rice won purely by being earlier in the list.
function findRecipeKey(subject) {
  if (DETAILED_RECIPES[subject]) return subject;
  const squished = subject.replace(/\s+/g, "");
  return Object.keys(DETAILED_RECIPES).find((k) => k.replace(/\s+/g, "") === squished) || null;
}

// Turns a recipe object into a readable "chart" — ingredient name, amount,
// and (when there is one) what to use instead if you don't have it — plus
// numbered steps. Uses real newlines; .msg has white-space:pre-line in the
// CSS so they actually show as line breaks instead of being collapsed.
function renderRecipeCard(food, recipe, verb) {
  const lines = ["🍳 How to " + (verb || "cook") + " " + food, "", "Ingredients:"];
  recipe.ingredients.forEach(([name, amount, sub]) => {
    let line = "• " + name + " — " + amount;
    if (sub) line += " (swap: " + sub + ")";
    lines.push(line);
  });
  lines.push("", "Steps:");
  recipe.steps.forEach((step, i) => lines.push((i + 1) + ". " + step));
  return lines.join("\n");
}

// Remembers whichever detailed recipe was shown most recently, so a
// follow-up substitution question can say "that's what X calls for"
// instead of just answering in a vacuum. This is a single global variable,
// not per-chat — so switching chats has to explicitly manage it (see
// startNewChat/loadChat/loginAs) or it'll leak a food name from a totally
// different conversation into this one.
let lastRecipeFood = null;

// Recipe cards always start with this exact prefix (see renderRecipeCard),
// so the food name can be recovered by reading it back out of a chat's own
// saved messages — used to resume substitution context correctly when
// switching back to an old chat, instead of just losing it.
function recipeFoodFromCardText(text) {
  const m = typeof text === "string" && text.match(/^🍳 How to (?:cook|bake) (.+)/);
  return m ? m[1] : null;
}

// ===== Ingredient substitution questions =====
//
// The recipe chart's "swap" notes are fixed to whatever's already written
// for THAT ingredient — they can't answer a genuinely new question like
// "can I use cake flour?" This is real, commonly-known kitchen substitution
// knowledge, not invented on the spot — and when nothing here matches,
// Suin says so honestly instead of guessing at something that could mess
// up a recipe.
const SUBSTITUTION_FACTS = [
  { a: "butter", b: "oil", note: "use about 3/4 as much oil as the butter called for" },
  { a: "egg", b: "applesauce", note: "use 1/4 cup applesauce per egg, for baking" },
  { a: "egg", b: "mashed banana", note: "use about half a banana per egg, for baking" },
  { a: "buttermilk", b: "milk and vinegar", note: "mix 1 cup milk with 1 tbsp vinegar or lemon juice, let it sit 5 minutes" },
  { a: "brown sugar", b: "white sugar", note: "the texture will be a little different, but it works" },
  { a: "white sugar", b: "honey", note: "use a little less honey than sugar, since honey is sweeter" },
  { a: "flour", b: "cake flour", note: "makes baked goods a little softer and lighter — use the same amount" },
  { a: "flour", b: "self-rising flour", note: "skip the separate baking powder and salt if you use self-rising flour" },
  { a: "sour cream", b: "yogurt", note: "plain yogurt works about the same" },
  { a: "heavy cream", b: "milk and butter", note: "it won't whip up fluffy, but it works fine for cooking" },
  { a: "vanilla extract", b: "almond extract", note: "use a little less — almond extract is stronger" },
  { a: "cornstarch", b: "flour", note: "use about double the amount of flour" },
  { a: "milk", b: "plant milk", note: "any milk works about the same in most recipes" },
  { a: "baking powder", b: "baking soda and cream of tartar", note: "use 1/4 tsp baking soda + 1/2 tsp cream of tartar per 1 tsp baking powder needed" },
  { a: "honey", b: "maple syrup", note: "works about the same" }
];

function extractSubstitutionQuery(text) {
  const t = text.toLowerCase().trim().replace(/\?+$/, "");
  const patterns = [/^can i use (.+)/, /^can use (.+)/, /^could i use (.+)/, /^substitute (?:for )?(.+)/, /^is there a substitute for (.+)/];
  for (const p of patterns) {
    const m = t.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

// Returns which side of the fact the query actually matched, not just the
// fact itself — needed so the reply can say "X instead of Y" in the right
// order. Prefers an exact match over a loose "contains" match, checked
// side-by-side in one pass, so the match info always comes from the SAME
// check (unlike an earlier version that found the fact one way but then
// re-guessed the direction a different, buggier way afterward).
function findSubstitutionMatch(query) {
  for (const fact of SUBSTITUTION_FACTS) {
    if (fact.a === query) return { fact: fact, proposed: fact.a, original: fact.b };
    if (fact.b === query) return { fact: fact, proposed: fact.b, original: fact.a };
  }
  // No exact match — fall back to "does this side show up in the query
  // somewhere." Multiple sides can match at once (e.g. "flour" is a
  // substring of "cake flour"), so collect every match and keep the
  // LONGEST one instead of just the first one found — "cake flour" is a
  // more specific, more correct match than plain "flour" for a query that
  // actually contains "cake flour". Without this, a garbled/repeated query
  // (or any query where the shorter name just happens to come first in the
  // list) can flip the answer backwards.
  let best = null;
  for (const fact of SUBSTITUTION_FACTS) {
    for (const side of [fact.a, fact.b]) {
      if (query.includes(side) || side.includes(query)) {
        if (!best || side.length > best.side.length) {
          const other = side === fact.a ? fact.b : fact.a;
          best = { fact: fact, proposed: side, original: other, side: side };
        }
      }
    }
  }
  return best;
}

function addSubstitutionReply(query) {
  const match = findSubstitutionMatch(query);
  if (!match) {
    addMessage("I don't have a note on that swap — might be worth checking with a grown-up or a recipe site.", "suin");
    return;
  }
  const context = lastRecipeFood ? " (That's what \"" + lastRecipeFood + "\" calls for.)" : "";
  addMessage("Yes! " + match.proposed + " usually works instead of " + match.original + " — " + match.fact.note + "." + context, "suin");
}

// Replies used when nothing matches at all.
const FALLBACK_REPLIES = [
  "I haven't learned that one yet!",
  "Hmm, I don't know that one.",
  "That's new to me — I don't have a reply for that yet."
];

function learnedKey() {
  return "suin_learned_" + currentUser;
}

function loadLearned() {
  try {
    const raw = localStorage.getItem(learnedKey());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLearned(learned) {
  localStorage.setItem(learnedKey(), JSON.stringify(learned));
}

let learned = [];

function allExamples() {
  return SEED_EXAMPLES.concat(GREETING_EXAMPLES, MOOD_EXAMPLES, COOKING_EXAMPLES, learned);
}

// Turn a sentence into a clean list of lowercase words.
function wordsOf(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

// Count how many words two word-lists share.
function overlapScore(wordsA, wordsB) {
  const setB = new Set(wordsB);
  let score = 0;
  // count each shared word once, so a repeated word ("what ... what") can't inflate the score
  for (const w of new Set(wordsA)) {
    if (setB.has(w)) score++;
  }
  return score;
}

// Find the best-matching example for what the user typed.
// Returns null (instead of a fallback string) when nothing matches, so the
// caller can fall back to something else.
function findLocalMatch(input) {
  const inputWords = wordsOf(input);
  let best = null;
  let bestScore = 0;

  for (const example of allExamples()) {
    const exampleWords = wordsOf(example.text);
    const score = overlapScore(inputWords, exampleWords);

    // Only trust a match if it shares at least 2 words, OR the example is
    // just 1 word and that word matched exactly. A single shared word
    // against a longer example is too weak a signal — that's how typing
    // just "good" wrongly matched the whole "good morning" example.
    // The example must also be mostly COVERED by the input (60%+ of its words)
    // and the input can't be far longer than the example — otherwise a long
    // pasted paragraph "matches" any example just by sharing a few common words
    // (that's how a Google results page got answered with a macaroni recipe).
    const ratio = exampleWords.length ? score / exampleWords.length : 0;
    const sizeOk = inputWords.length <= exampleWords.length * 3 + 3;
    const trusted = sizeOk && ((score >= 2 && ratio >= 0.6) || (score >= 1 && exampleWords.length === 1));

    if (trusted && score > bestScore) {
      bestScore = score;
      best = example;
    }
  }

  return best ? best.reply : null;
}

function randomFallback() {
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

// ===== Remembering facts you tell it =====
//
// This is different from the chat-history search above (which looks back
// at things you already SAID). This is a real, separate list of facts you
// explicitly ask Suin to remember — "remember my dog's name is Max" saves
// {subject: "dog's name", value: "Max"}, and "what's my dog's name" looks
// it back up. Persisted per-account (like `learned`), so it lasts across
// every chat and every login, not just the one conversation it was taught
// in.

const MAX_FACT_LENGTH = 200; // same defense-in-depth idea as MAX_NAME_LENGTH (item 18) — a
// stress-tested giant fact would otherwise get echoed back into a reply forever

function factsKey() {
  return "suin_facts_" + currentUser;
}

function loadFacts() {
  try {
    const raw = localStorage.getItem(factsKey());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveFacts() {
  localStorage.setItem(factsKey(), JSON.stringify(rememberedFacts));
}

let rememberedFacts = [];

// Matches "remember my X is Y" / "remember that my X is Y".
function extractRememberFact(text) {
  const t = text.trim().replace(/\?+$/, "");
  const m = t.match(/^remember(?: that)? my (.+?) is (.+)/i);
  if (!m) return null;
  return {
    subject: m[1].trim().toLowerCase().slice(0, MAX_FACT_LENGTH),
    value: m[2].trim().slice(0, MAX_FACT_LENGTH)
  };
}

// Matches "what is my X" / "what's my X".
function extractFactQuestion(text) {
  const t = text.trim().replace(/\?+$/, "");
  const m = t.match(/^what(?:'s| is) my (.+)/i);
  return m ? m[1].trim().toLowerCase() : null;
}

// Exact subject match first ("dog's name" asked the same way it was
// taught); falls back to the same word-overlap trick as everything else in
// Suin, so asking about it a slightly different way ("what's my dog
// called") can still find it.
function findFact(subject) {
  const exact = rememberedFacts.find((f) => f.subject === subject);
  if (exact) return exact;

  const subjectWords = wordsOf(subject);
  let best = null;
  let bestScore = 0;
  for (const f of rememberedFacts) {
    const score = overlapScore(subjectWords, wordsOf(f.subject));
    if (score >= 1 && score > bestScore) {
      bestScore = score;
      best = f;
    }
  }
  return best;
}

function addRememberFactReply(subject, value) {
  const existing = rememberedFacts.find((f) => f.subject === subject);
  if (existing) existing.value = value;
  else rememberedFacts.push({ subject, value });
  saveFacts();
  addMessage("Got it! I'll remember your " + subject + " is " + value + ".", "suin");
}

function addFactReply(subject) {
  const fact = findFact(subject);
  if (!fact) {
    addMessage("I don't remember you telling me about that yet. You can say something like \"remember my " + subject + " is ...\"", "suin");
    return;
  }
  addMessage("Your " + fact.subject + " is " + fact.value + "!", "suin");
}

// ===== "What does X mean?" — word definitions =====
//
// This is a real dictionary, but a SAFE one, not a live internet lookup.
// A real dictionary knows every word that exists, including words that
// aren't okay to just casually define for a kid — that's the same reason
// live web search got turned off (see the note right below this). Instead,
// this is a fixed list of common, everyday words picked ahead of time,
// baked directly into the code — nothing is fetched from the internet when
// you ask "what does X mean," so there's no way for it to ever answer with
// something that wasn't checked first.
const WORD_DEFINITIONS = {
  "run": "to move quickly using your legs, faster than walking",
  "jump": "to push off the ground into the air",
  "walk": "to move by putting one foot in front of the other",
  "eat": "to put food in your mouth and swallow it",
  "build": "to make something by putting pieces together",
  "sit": "to rest your body down on a chair or floor",
  "stand": "to be on your feet, upright",
  "sleep": "to rest with your eyes closed at night",
  "wake": "to stop sleeping and open your eyes",
  "drink": "to swallow a liquid like water or juice",
  "cook": "to make food ready to eat using heat",
  "bake": "to cook food like bread in an oven",
  "clean": "to remove dirt and make something tidy",
  "wash": "to make something clean using water and soap",
  "dry": "to remove water from something",
  "brush": "to clean or smooth something using a brush",
  "comb": "to make your hair neat with a comb",
  "swim": "to move through water using your arms and legs",
  "dive": "to jump headfirst into water",
  "climb": "to go up something using your hands and feet",
  "crawl": "to move slowly on your hands and knees",
  "hop": "to jump on one foot or with both feet together",
  "skip": "to move forward with light jumps and steps",
  "dance": "to move your body to the beat of music",
  "sing": "to make music with your voice",
  "hum": "to sing quietly with your mouth closed",
  "whistle": "to make a musical sound by blowing through your lips",
  "talk": "to say words to someone",
  "speak": "to say words out loud",
  "shout": "to say something very loudly",
  "whisper": "to speak very softly and quietly",
  "listen": "to pay attention to a sound",
  "hear": "to notice a sound with your ears",
  "look": "to use your eyes to see something",
  "watch": "to look at something for a while",
  "stare": "to look at something for a long time",
  "glance": "to look at something quickly",
  "read": "to look at words and understand what they mean",
  "write": "to make letters and words using a pen or pencil",
  "draw": "to make a picture using a pencil or crayon",
  "paint": "to put color on paper using a brush",
  "color": "to add colors to a picture",
  "cut": "to divide something using scissors or a knife",
  "paste": "to stick something onto paper with glue",
  "glue": "to stick two things together",
  "fold": "to bend something over onto itself",
  "tear": "to pull something apart roughly",
  "throw": "to send something through the air with your hand",
  "catch": "to grab something that is flying toward you",
  "kick": "to hit something with your foot",
  "push": "to press something away from you",
  "pull": "to move something toward you",
  "lift": "to raise something up off the ground",
  "carry": "to hold something and take it somewhere",
  "drop": "to let something fall from your hand",
  "pick": "to choose or take something with your fingers",
  "grab": "to take hold of something quickly",
  "hold": "to keep something in your hands",
  "squeeze": "to press something tightly from the sides",
  "hug": "to put your arms around someone warmly",
  "wave": "to move your hand side to side to say hello",
  "point": "to show where something is with your finger",
  "touch": "to put your hand or fingers on something",
  "smell": "to notice something with your nose",
  "taste": "to notice a flavor with your tongue",
  "bite": "to use your teeth to cut into something",
  "chew": "to crush food with your teeth",
  "swallow": "to make food go down your throat",
  "cough": "to push air out of your throat suddenly",
  "sneeze": "to blow air out of your nose suddenly",
  "yawn": "to open your mouth wide when you are tired",
  "blink": "to quickly close and open your eyes",
  "wink": "to close one eye quickly as a friendly signal",
  "smile": "to curve your mouth up when you feel happy",
  "laugh": "to make a happy sound when something is funny",
  "cry": "to let tears fall from your eyes",
  "sigh": "to breathe out slowly when tired or sad",
  "breathe": "to take air in and out of your body",
  "march": "to walk with steady, strong steps",
  "stomp": "to walk with heavy, loud steps",
  "tiptoe": "to walk very quietly on your toes",
  "stroll": "to walk slowly and calmly",
  "wander": "to walk around without a clear place to go",
  "explore": "to look around a new place carefully",
  "search": "to look for something carefully",
  "find": "to discover something you were looking for",
  "hide": "to put yourself where no one can see you",
  "chase": "to run after someone or something",
  "follow": "to go after or behind someone",
  "lead": "to go first and show others the way",
  "guide": "to help show someone the way",
  "help": "to make a task easier for someone",
  "share": "to let others use or have some of your things",
  "give": "to hand something to someone",
  "take": "to get hold of something",
  "borrow": "to use something and give it back later",
  "buy": "to get something by paying money for it",
  "sell": "to give something to someone in return for money",
  "pay": "to give money for something",
  "save": "to keep something safe for later",
  "spend": "to use money to buy things",
  "count": "to say numbers in order to find a total",
  "measure": "to find out the size or amount of something",
  "pour": "to make liquid flow out of a container",
  "fill": "to make something full",
  "empty": "to take everything out of something",
  "spill": "to accidentally let liquid fall out of something",
  "mix": "to combine different things together",
  "stir": "to move a spoon around inside food or liquid",
  "shake": "to move something quickly back and forth",
  "twist": "to turn something into a different shape",
  "turn": "to move around in a circle or change direction",
  "spin": "to turn around and around quickly",
  "roll": "to move by turning over and over",
  "bounce": "to spring back up after hitting something",
  "float": "to stay on top of water or in the air",
  "sink": "to go down under the water",
  "fly": "to move through the air",
  "land": "to come down onto the ground",
  "fall": "to drop down suddenly",
  "trip": "to catch your foot on something and stumble",
  "slip": "to slide and lose your balance",
  "stumble": "to trip and almost fall over",
  "balance": "to keep steady and not fall over",
  "freeze": "to become very cold and stop moving",
  "melt": "to turn from a solid into a liquid with heat",
  "burn": "to be damaged or hurt by fire or heat",
  "boil": "to heat liquid until it bubbles",
  "fry": "to cook food in hot oil",
  "grill": "to cook food over direct heat",
  "chop": "to cut something into small pieces with quick strokes",
  "slice": "to cut something into thin, flat pieces",
  "peel": "to remove the outer skin of a fruit",
  "sweep": "to clean a floor with a broom",
  "mop": "to clean a floor with a wet mop",
  "dust": "to wipe away tiny bits of dirt",
  "tidy": "to put things back in their proper place",
  "organize": "to arrange things in a neat, sensible way",
  "arrange": "to put things in a certain order",
  "sort": "to put things into groups that match",
  "stack": "to pile things neatly on top of each other",
  "gather": "to collect things together in one place",
  "collect": "to bring together many of the same thing",
  "plant": "to put a seed in the ground so it can grow",
  "grow": "to become bigger over time",
  "water": "to give plants the water they need",
  "dig": "to make a hole in the ground",
  "rake": "to gather leaves or dirt using a rake",
  "feed": "to give food to a person or animal",
  "pet": "to gently touch and stroke an animal",
  "groom": "to clean and take care of an animal's fur",
  "train": "to teach a skill through practice",
  "teach": "to help someone learn something new",
  "learn": "to gain new knowledge or a new skill",
  "study": "to spend time learning about something",
  "practice": "to do something again and again to get better",
  "remember": "to keep something in your mind and not forget it",
  "forget": "to fail to remember something",
  "think": "to use your mind to consider something",
  "wonder": "to feel curious about something",
  "imagine": "to picture something in your mind",
  "dream": "to see pictures and ideas in your mind while asleep",
  "plan": "to decide what you will do before doing it",
  "decide": "to choose what to do",
  "choose": "to pick one thing out of many",
  "guess": "to give an answer without being completely sure",
  "solve": "to find the answer to a problem",
  "answer": "to reply to a question",
  "ask": "to say a question to someone",
  "explain": "to make something clear and easy to understand",
  "tell": "to give information to someone by speaking",
  "argue": "to disagree with someone using words",
  "agree": "to have the same opinion as someone",
  "apologize": "to say sorry for something you did",
  "forgive": "to stop being angry at someone",
  "promise": "to say you will definitely do something",
  "warn": "to tell someone about a danger ahead of time",
  "remind": "to help someone remember something",
  "invite": "to ask someone to come somewhere",
  "welcome": "to greet someone kindly",
  "greet": "to say hello to someone",
  "introduce": "to tell two people each other's names",
  "meet": "to see and talk with someone for the first time",
  "visit": "to go see a person or place for a while",
  "leave": "to go away from a place",
  "arrive": "to reach a place after traveling",
  "depart": "to leave a place, especially to start a trip",
  "return": "to come back to a place",
  "hurry": "to move or act quickly",
  "rush": "to move very fast because there is little time",
  "pause": "to stop doing something for a short time",
  "stop": "to no longer move or continue",
  "start": "to begin doing something",
  "begin": "to do the first part of something",
  "finish": "to complete something",
  "continue": "to keep doing something without stopping",
  "repeat": "to do or say something again",
  "try": "to attempt to do something",
  "succeed": "to finish doing something you were trying to do",
  "win": "to do the best in a game or contest",
  "lose": "to not win, or to misplace something",
  "play": "to have fun doing an activity",
  "compete": "to try to win against other people",
  "race": "to compete to see who is fastest",
  "break": "to make something come apart suddenly",
  "fix": "to repair something that is broken",
  "repair": "to make something work again",
  "create": "to make something new",
  "destroy": "to break something completely",
  "make": "to create or build something",
  "sew": "to join pieces of cloth using a needle and thread",
  "knit": "to make cloth by looping yarn with needles",
  "hammer": "to hit something with a hammer",
  "saw": "to cut wood using a saw",
  "drill": "to make a hole using a drill",
  "sketch": "to draw something quickly and simply",
  "design": "to plan how something will look or work",
  "invent": "to think of and make something completely new",
  "discover": "to find something for the very first time",
  "travel": "to go from one place to another",
  "drive": "to control and move a car",
  "ride": "to sit on and travel using a bike or animal",
  "steer": "to guide the direction something is moving",
  "pedal": "to push bicycle pedals to make it move",
  "row": "to move a boat using oars",
  "sail": "to travel on water using a boat with sails",
  "paddle": "to move a small boat using a paddle",
  "skate": "to glide smoothly on skates",
  "ski": "to glide over snow on skis",
  "surf": "to ride on top of ocean waves on a board",
  "camp": "to sleep outdoors, often in a tent",
  "hike": "to walk a long way outdoors",
  "splash": "to make water fly around by hitting it",
  "sprinkle": "to scatter small drops or bits of something",
  "spray": "to send out a fine mist of liquid",
  "wipe": "to clean a surface by rubbing it",
  "scrub": "to rub something hard to clean it",
  "rinse": "to wash something with clean water",
  "soak": "to leave something in water for a while",
  "iron": "to press clothes to remove wrinkles",
  "hang": "to attach something so it does not touch the ground",
  "pack": "to put things into a bag or box",
  "unpack": "to take things out of a bag or box",
  "wrap": "to cover something by folding paper around it",
  "open": "to make something no longer closed",
  "close": "to shut something",
  "lock": "to fasten something so it cannot be opened",
  "unlock": "to open something that was locked",
  "knock": "to hit a door lightly to get attention",
  "ring": "to make a bell make a sound",
  "call": "to phone someone or shout to get their attention",
  "type": "to write using a keyboard",
  "print": "to make a copy of something on paper",
  "click": "to press a button on a computer mouse",
  "tap": "to hit something lightly and quickly",
  "swipe": "to slide your finger across a screen",
  "scroll": "to move up or down through a screen",
  "charge": "to fill a battery with power",
  "press": "to push down on something",
  "drag": "to pull something along a surface",
  "slide": "to move smoothly along a surface",
  "glide": "to move smoothly and easily through air or water",
  "squeal": "to make a high, loud sound",
  "giggle": "to laugh in a light, quick way",
  "sniff": "to breathe in through your nose to smell something",
  "lick": "to touch something with your tongue",
  "spit": "to force liquid or food out of your mouth",
  "flip": "to turn something over quickly",
  "tumble": "to fall or roll around clumsily",
  "sprint": "to run as fast as you possibly can",
  "jog": "to run at a slow, steady pace",
  "trot": "to run with short, quick steps",
  "leap": "to jump a long way or very high",
  "crouch": "to bend your knees and lower your body down",
  "kneel": "to go down on your knees",
  "bend": "to move your body so it is not straight",
  "stretch": "to reach your arms or legs out fully",
  "reach": "to stretch out your arm to touch something",
  "grip": "to hold something tightly",
  "clap": "to hit your hands together to make a sound",
  "tickle": "to touch someone lightly to make them laugh",
  "pat": "to gently tap something with your hand",
  "poke": "to jab someone or something with your finger",
  "nudge": "to push someone gently to get their attention",
  "shove": "to push someone or something roughly",
  "tug": "to pull something with a quick, strong movement",
  "yank": "to pull something suddenly and hard",
  "toss": "to throw something lightly",
  "juggle": "to keep several objects moving in the air",
  "wobble": "to move unsteadily from side to side",
  "shiver": "to shake because you are cold or scared",
  "tremble": "to shake slightly, often from fear or cold",
  "gasp": "to breathe in suddenly from surprise",
  "pant": "to breathe quickly and loudly after running",
  "snore": "to breathe noisily while sleeping",
  "doze": "to sleep lightly for a short time",
  "nap": "to sleep for a short time during the day",
  "rest": "to relax and stop being active for a while",
  "relax": "to become calm and free of stress",
  "exercise": "to move your body to stay healthy and strong",
  "happy": "feeling good and cheerful",
  "sad": "feeling unhappy, like you want to cry",
  "angry": "feeling strong, upset feelings about something unfair",
  "mad": "feeling very angry about something",
  "excited": "feeling very happy and eager about something",
  "nervous": "feeling worried about something that is about to happen",
  "scared": "feeling afraid of something",
  "afraid": "feeling fear about something that might happen",
  "worried": "feeling uneasy about something that might go wrong",
  "anxious": "feeling nervous or worried about what might happen",
  "calm": "feeling peaceful and relaxed, not upset",
  "relaxed": "feeling comfortable and free of worry",
  "proud": "feeling happy about something you or someone did well",
  "ashamed": "feeling bad about something you did wrong",
  "embarrassed": "feeling shy or uncomfortable in front of others",
  "shy": "feeling nervous about talking to new people",
  "jealous": "feeling upset because someone else has something you want",
  "lonely": "feeling sad because you are alone",
  "bored": "feeling tired because there is nothing interesting to do",
  "curious": "wanting to know or learn about something",
  "surprised": "feeling shocked by something unexpected",
  "shocked": "feeling very surprised, often in a bad way",
  "confused": "not understanding something clearly",
  "frustrated": "feeling upset because something is hard or not working",
  "annoyed": "feeling a little angry about something bothersome",
  "upset": "feeling unhappy or bothered about something",
  "disappointed": "feeling sad because something was not as good as hoped",
  "hopeful": "feeling that good things will happen",
  "grateful": "feeling thankful for something",
  "thankful": "feeling glad and wanting to say thank you",
  "loving": "feeling and showing warm care for someone",
  "loved": "feeling cared for and important to someone",
  "hateful": "feeling or showing strong dislike for something",
  "fond": "feeling gentle liking and affection for someone",
  "fearful": "feeling scared or worried about something",
  "joyful": "feeling full of happiness",
  "cheerful": "feeling happy and bright",
  "gloomy": "feeling sad and without much hope",
  "miserable": "feeling very unhappy",
  "delighted": "feeling great pleasure and happiness",
  "thrilled": "feeling extremely excited and happy",
  "terrified": "feeling extremely scared",
  "panicked": "feeling sudden, strong fear that makes it hard to think",
  "uneasy": "feeling a little worried or uncomfortable",
  "tense": "feeling stiff and worried, not relaxed",
  "stressed": "feeling worried and tired from too much to handle",
  "overwhelmed": "feeling like there is too much to handle at once",
  "content": "feeling happy and satisfied with things as they are",
  "satisfied": "feeling pleased because something went well",
  "pleased": "feeling happy about something",
  "irritated": "feeling a little angry or bothered",
  "furious": "feeling extremely angry",
  "grumpy": "feeling easily annoyed and in a bad mood",
  "cranky": "feeling easily upset or bad tempered",
  "moody": "having feelings that change often and quickly",
  "sulky": "feeling quietly upset and not wanting to talk",
  "sorry": "feeling sad about something bad that happened or that you did",
  "guilty": "feeling bad because you did something wrong",
  "hopeless": "feeling like nothing good will happen",
  "helpless": "feeling like you cannot do anything to fix a problem",
  "confident": "feeling sure that you can do something well",
  "brave": "feeling ready to face something scary without giving up",
  "courageous": "showing bravery even when something is frightening",
  "timid": "feeling shy and easily scared",
  "jumpy": "feeling nervous and easily startled",
  "restless": "feeling unable to stay still or relax",
  "impatient": "feeling like you do not want to wait any longer",
  "patient": "able to wait calmly without getting upset",
  "eager": "feeling very excited and ready to do something",
  "enthusiastic": "feeling great excitement and interest about something",
  "motivated": "feeling ready and willing to work hard toward a goal",
  "inspired": "feeling filled with new ideas and excitement",
  "discouraged": "feeling like you want to give up",
  "exhausted": "feeling extremely tired",
  "tired": "feeling like you need to rest or sleep",
  "sleepy": "feeling like you want to fall asleep",
  "drowsy": "feeling sleepy and slow",
  "energetic": "feeling full of energy and ready to move",
  "lively": "feeling full of energy and cheerfulness",
  "playful": "feeling like having fun and playing games",
  "silly": "feeling like being funny and a little goofy",
  "giddy": "feeling excited and a little dizzy with happiness",
  "amused": "feeling entertained and like laughing",
  "interested": "wanting to know more about something",
  "fascinated": "feeling very interested and amazed by something",
  "puzzled": "feeling confused, like you cannot figure something out",
  "bewildered": "feeling very confused and unsure what is happening",
  "startled": "feeling suddenly surprised or a little scared",
  "alarmed": "feeling suddenly worried that something bad might happen",
  "disgusted": "feeling like something is gross or unpleasant",
  "humiliated": "feeling very embarrassed in front of others",
  "humble": "not thinking you are more important than others",
  "envious": "wishing you had what someone else has",
  "greedy": "wanting more of something than you really need",
  "generous": "happy to give and share with others",
  "kind": "caring about others and treating them well",
  "gentle": "soft and careful, not rough",
  "caring": "showing that you worry about and want to help others",
  "affectionate": "showing warm, loving feelings toward someone",
  "loyal": "always being faithful and true to someone",
  "friendly": "kind and pleasant toward other people",
  "unfriendly": "not kind or warm toward other people",
  "hostile": "feeling or acting unfriendly and angry toward someone",
  "peaceful": "calm and quiet, without worry or fighting",
  "serene": "very calm and peaceful",
  "agitated": "feeling upset and unable to stay calm",
  "troubled": "feeling worried or bothered by a problem",
  "concerned": "feeling worried about someone or something",
  "sympathetic": "feeling sorry for someone and understanding their feelings",
  "compassionate": "feeling and showing care for someone who is hurting",
  "indifferent": "not caring one way or the other about something",
  "numb": "unable to feel much of anything",
  "sensitive": "easily affected by feelings or by what others say",
  "thoughtful": "showing care by thinking about other people's feelings",
  "careless": "not paying enough attention to what you are doing",
  "careful": "paying close attention so nothing goes wrong",
  "cautious": "being extra careful to avoid danger",
  "wary": "feeling careful and a little suspicious",
  "suspicious": "feeling like something might not be right or true",
  "trusting": "believing that someone is honest and good",
  "honest": "always telling the truth",
  "insecure": "not feeling sure or confident about yourself",
  "secure": "feeling safe and confident",
  "safe": "feeling free from danger or harm",
  "vulnerable": "feeling like you could easily be hurt",
  "strong": "feeling powerful and able to handle hard things",
  "weak": "feeling like you do not have much strength",
  "cowardly": "feeling too scared to face danger",
  "bold": "feeling brave and confident enough to try new things",
  "daring": "willing to do things that feel risky or scary",
  "adventurous": "eager to try new and exciting things",
  "sweet": "kind and gentle in a pleasant way",
  "nostalgic": "feeling happy but a little sad thinking about the past",
  "homesick": "feeling sad and missing your home",
  "heartbroken": "feeling very sad, like your heart is hurting",
  "devastated": "feeling extremely sad and upset about something bad",
  "crushed": "feeling very disappointed or hurt",
  "relieved": "feeling glad that a worry or problem is over",
  "comforted": "feeling less worried because someone helped you feel better",
  "soothed": "feeling calmer after being upset",
  "amazed": "feeling great surprise and wonder",
  "astonished": "feeling extremely surprised",
  "speechless": "so surprised that you cannot find words to say",
  "stunned": "feeling shocked and unable to think clearly for a moment",
  "flustered": "feeling confused and a little panicked",
  "rattled": "feeling shaken and nervous after something surprising",
  "unsettled": "feeling uneasy, like something is not quite right",
  "queasy": "feeling like your stomach is upset",
  "giggly": "feeling like laughing a lot over small things",
  "goofy": "feeling silly and playful in a funny way",
  "mischievous": "feeling playful in a way that likes harmless tricks",
  "determined": "feeling ready to keep trying no matter what",
  "focused": "paying close attention to one thing",
  "distracted": "unable to pay attention because of something else",
  "wistful": "feeling a gentle sadness while thinking of something",
  "regretful": "feeling sorry about something you wish you had not done",
  "remorseful": "feeling truly sorry for something you did wrong",
  "shameless": "not feeling embarrassed about something you should be",
  "prideful": "thinking too highly of yourself",
  "arrogant": "acting like you are better than everyone else",
  "modest": "not bragging about your own skills or things",
  "polite": "showing good manners toward other people",
  "rude": "not showing good manners toward other people",
  "respectful": "showing that you value and honor someone",
  "disrespectful": "not showing care or honor toward someone",
  "grumbly": "feeling like complaining in a low, unhappy way",
  "whiny": "complaining in an annoying, high-pitched way",
  "blissful": "feeling perfectly happy and peaceful",
  "ecstatic": "feeling extremely happy and excited",
  "euphoric": "feeling an intense rush of happiness",
  "optimistic": "expecting good things to happen",
  "pessimistic": "expecting bad things to happen",
  "skeptical": "not easily believing something is true",
  "gullible": "too easily believing things that are not true",
  "naive": "not having enough experience to notice a problem",
  "wise": "having good judgment from knowledge and experience",
  "clever": "quick to think of smart ideas",
  "foolish": "not showing good sense or judgment",
  "dizzy": "feeling like everything around you is spinning",
  "dazed": "feeling confused and unable to think clearly",
  "groggy": "feeling slow and sleepy, like just waking up",
  "refreshed": "feeling new energy after resting",
  "rejuvenated": "feeling fresh and full of energy again",
  "invigorated": "feeling strong and full of energy",
  "settled": "feeling calm and comfortable, not worried",
  "keen": "feeling very eager and interested",
  "reluctant": "not wanting to do something",
  "hesitant": "pausing because you are unsure about something",
  "unsure": "not feeling certain about something",
  "certain": "feeling completely sure about something",
  "doubtful": "not feeling sure that something is true",
  "awkward": "feeling uncomfortable in a strange or clumsy way",
  "shaky": "feeling nervous, like your hands might tremble",
  "jittery": "feeling nervous and unable to stay still",
  "tearful": "feeling close to crying",
  "weepy": "feeling like you might cry easily",
  "grouchy": "feeling easily annoyed and complaining",
  "testy": "feeling easily annoyed and short tempered",
  "snappy": "quick to speak in an annoyed way",
  "touchy": "easily upset or offended",
  "peppy": "feeling full of energy and cheer",
  "chipper": "feeling cheerful and bright",
  "glum": "feeling sad and quiet",
  "downcast": "feeling sad and looking down",
  "forlorn": "feeling lonely and sad, as if left behind",
  "despondent": "feeling very sad and without hope",
  "dejected": "feeling sad after a disappointment",
  "apprehensive": "feeling worried about something that might happen soon",
  "fretful": "feeling worried and a little irritable",
  "spirited": "feeling full of energy, courage, and enthusiasm",
  "dog": "a friendly animal that people keep as a pet and can bark",
  "cat": "a small furry pet that likes to nap and purr",
  "puppy": "a baby dog",
  "kitten": "a baby cat",
  "cow": "a big farm animal that gives us milk",
  "bull": "a large male cow with horns",
  "calf": "a baby cow",
  "pig": "a pink farm animal that loves mud and says oink",
  "piglet": "a baby pig",
  "horse": "a big strong animal that people can ride",
  "pony": "a small kind of horse",
  "foal": "a baby horse",
  "stallion": "a fully grown male horse",
  "mare": "a fully grown female horse",
  "sheep": "a woolly farm animal that says baa",
  "lamb": "a baby sheep",
  "ram": "a male sheep with curved horns",
  "goat": "a farm animal with horns that loves to climb",
  "kid": "a baby goat",
  "chicken": "a farm bird that lays eggs",
  "rooster": "a male chicken that crows in the morning",
  "chick": "a baby chicken",
  "hen": "a female chicken",
  "duck": "a bird that swims and says quack",
  "duckling": "a baby duck",
  "drake": "a male duck",
  "goose": "a big bird like a duck with a loud honk",
  "gosling": "a baby goose",
  "turkey": "a large farm bird with feathers",
  "rabbit": "a small furry animal with long ears that hops",
  "bunny": "another word for a small rabbit",
  "mouse": "a tiny animal with a long tail",
  "rat": "an animal like a mouse but a bit bigger",
  "hamster": "a small furry pet that runs on a wheel",
  "gerbil": "a small furry pet with a long tail",
  "guinea pig": "a small round furry pet with no tail",
  "turtle": "a slow animal with a hard shell on its back",
  "tortoise": "a turtle that lives on land and moves very slowly",
  "frog": "a small jumping animal that lives near water",
  "toad": "an animal like a frog with bumpy dry skin",
  "tadpole": "a baby frog that lives and swims in water",
  "snake": "a long animal with no legs that slithers",
  "lizard": "a small animal with scaly skin and four legs",
  "elephant": "a huge gray animal with a long trunk",
  "lion": "a big wild cat known as the king of animals",
  "cub": "a baby bear, lion, or other wild animal",
  "tiger": "a big wild cat with orange and black stripes",
  "bear": "a big furry animal that can be very strong",
  "wolf": "a wild animal like a big dog that howls",
  "fox": "a small wild animal with a bushy orange tail",
  "deer": "a gentle animal with antlers that lives in forests",
  "fawn": "a baby deer",
  "moose": "a huge deer with wide flat antlers",
  "elk": "a large deer found in forests and mountains",
  "monkey": "a playful animal that climbs trees and has a tail",
  "gorilla": "a very large and strong ape",
  "chimpanzee": "a smart ape that is closely related to humans",
  "zebra": "a horse-like animal with black and white stripes",
  "giraffe": "a very tall animal with a long neck",
  "hippopotamus": "a huge animal that spends most of its time in water",
  "rhinoceros": "a huge animal with thick skin and a horn on its nose",
  "kangaroo": "an animal that hops and carries its baby in a pouch",
  "joey": "a baby kangaroo",
  "koala": "a furry animal from Australia that eats leaves",
  "panda": "a black and white bear that eats bamboo",
  "camel": "an animal with humps that can live in the desert",
  "donkey": "an animal like a small horse that can carry loads",
  "mule": "an animal that is part horse and part donkey",
  "buffalo": "a large wild animal like a cow with horns",
  "bison": "a big shaggy animal that once roamed the plains",
  "llama": "a furry animal from South America used to carry things",
  "alpaca": "a small furry animal related to the llama",
  "otter": "a playful animal that swims and lives near rivers",
  "beaver": "an animal that builds dams using sticks and mud",
  "squirrel": "a small animal with a bushy tail that climbs trees",
  "chipmunk": "a small striped animal that stores food in its cheeks",
  "raccoon": "a furry animal with a striped tail and a black mask",
  "skunk": "a black and white animal that sprays a bad smell",
  "badger": "a furry animal that digs burrows underground",
  "hedgehog": "a small spiny animal that curls into a ball",
  "porcupine": "an animal covered in sharp quills",
  "bat": "a flying animal that comes out at night",
  "mole": "a small animal that digs tunnels underground",
  "weasel": "a small thin animal that hunts other small animals",
  "ferret": "a small furry pet related to weasels",
  "seal": "a sea animal with flippers that likes to bark",
  "walrus": "a big sea animal with long tusks",
  "whale": "a huge animal that lives in the ocean",
  "dolphin": "a smart sea animal that jumps and clicks",
  "shark": "a big fish with many sharp teeth",
  "octopus": "a sea animal with eight long arms",
  "squid": "a sea animal with long arms and a soft body",
  "jellyfish": "a soft see-through sea animal that can sting",
  "crab": "a sea animal with a hard shell and claws",
  "lobster": "a sea animal with big claws that lives in the ocean",
  "shrimp": "a small sea animal with a curved body",
  "clam": "a small sea animal with two hard shells",
  "oyster": "a sea animal with a shell that can make pearls",
  "snail": "a small slow animal that carries its shell",
  "slug": "a small slow animal without a shell",
  "worm": "a long thin animal that lives in the soil",
  "spider": "a small animal with eight legs that spins webs",
  "ant": "a tiny insect that lives in large groups",
  "bee": "a flying insect that makes honey",
  "wasp": "a flying insect that can sting",
  "hornet": "a large kind of wasp with a strong sting",
  "butterfly": "a colorful insect with big pretty wings",
  "moth": "an insect like a butterfly that flies at night",
  "beetle": "an insect with a hard shiny shell",
  "ladybug": "a small round beetle with red and black spots",
  "grasshopper": "an insect that jumps very high",
  "cricket": "a small insect that chirps at night",
  "cockroach": "a small brown insect that is hard to get rid of",
  "mosquito": "a tiny flying insect that bites and buzzes",
  "dragonfly": "an insect with long wings that flies near water",
  "firefly": "a small bug that glows in the dark",
  "caterpillar": "a small crawling animal that turns into a butterfly",
  "centipede": "a small bug with many legs",
  "scorpion": "a small animal with a stinger on its tail",
  "eagle": "a large strong bird that hunts other animals",
  "hawk": "a fast flying bird that hunts small animals",
  "falcon": "a fast bird that swoops down to catch prey",
  "owl": "a bird that is awake at night and hoots",
  "crow": "a black bird known for being very smart",
  "raven": "a large black bird similar to a crow",
  "sparrow": "a small common brown bird",
  "robin": "a small bird with a red or orange chest",
  "woodpecker": "a bird that pecks holes in trees with its beak",
  "hummingbird": "a tiny bird that can hover in the air",
  "parrot": "a colorful bird that can copy human words",
  "peacock": "a bird with a huge colorful tail",
  "penguin": "a black and white bird that cannot fly but swims",
  "ostrich": "the biggest bird, which cannot fly but runs fast",
  "flamingo": "a tall pink bird that often stands on one leg",
  "swan": "a graceful white bird that swims on lakes",
  "pigeon": "a common gray bird often seen in cities",
  "dove": "a gentle white bird that is a sign of peace",
  "seagull": "a white bird that lives near the ocean",
  "pelican": "a bird with a large pouch under its beak",
  "stork": "a tall bird known for its long legs and beak",
  "crane": "a tall bird with long legs that lives near water",
  "heron": "a tall thin bird that stands still in water",
  "vulture": "a large bird that eats animals that have died",
  "chameleon": "a lizard that can change the color of its skin",
  "crocodile": "a large reptile with sharp teeth that lives in rivers",
  "alligator": "a reptile like a crocodile with a wider snout",
  "gecko": "a small lizard that can climb up walls",
  "salamander": "a small animal with smooth wet skin",
  "jaguar": "a big wild cat with spotted fur",
  "leopard": "a big wild cat with black spots",
  "cheetah": "the fastest land animal, a big spotted cat",
  "panther": "a large wild cat that often has black fur",
  "cougar": "a large wild cat also called a mountain lion",
  "lynx": "a wild cat with tufted pointy ears",
  "hyena": "a wild animal known for its laughing sound",
  "meerkat": "a small animal that stands up to watch for danger",
  "sloth": "a very slow animal that hangs upside down in trees",
  "armadillo": "an animal covered in hard bony plates",
  "anteater": "an animal with a long nose that eats ants",
  "platypus": "a strange animal that lays eggs and has a duck bill",
  "wombat": "a furry animal from Australia that digs burrows",
  "dingo": "a wild dog found in Australia",
  "coyote": "a wild animal that looks like a small wolf",
  "antelope": "a fast animal with horns that lives in herds",
  "gazelle": "a slim fast animal with curved horns",
  "wildebeest": "a large African animal that travels in big herds",
  "warthog": "a wild pig with tusks and a bumpy face",
  "orangutan": "a large orange ape that lives in trees",
  "baboon": "a large monkey with a long face",
  "lemur": "a furry animal with a long tail from Madagascar",
  "mongoose": "a small animal known for fighting snakes",
  "herd": "a large group of animals that stay together",
  "flock": "a group of birds or sheep together",
  "swarm": "a large group of insects flying together",
  "nest": "a home a bird builds to keep its eggs safe",
  "burrow": "a hole an animal digs to live in",
  "den": "a home where a wild animal like a fox lives",
  "hive": "a home where a large group of bees live",
  "cocoon": "a covering a caterpillar makes before becoming a moth",
  "web": "a sticky net a spider spins to catch food",
  "tusk": "a long pointed tooth that sticks out, like on an elephant",
  "paw": "the foot of an animal like a dog or cat",
  "claw": "a sharp curved nail on an animal's foot",
  "fur": "the soft hair that covers many animals",
  "feather": "one of the soft light parts that cover a bird",
  "wing": "the body part a bird or insect uses to fly",
  "beak": "the hard pointed mouth part of a bird",
  "hoof": "the hard foot of an animal like a horse",
  "mane": "the long hair around a lion's or horse's neck",
  "antler": "a bony horn on the head of a deer or moose",
  "gill": "the body part a fish uses to breathe underwater",
  "fin": "a flat body part a fish uses to swim",
  "scale": "one of the small hard pieces covering a fish or snake",
  "shell": "the hard outside covering of an animal like a turtle",
  "pouch": "a pocket of skin where some animals carry their babies",
  "predator": "an animal that hunts and eats other animals",
  "prey": "an animal that is hunted by another animal for food",
  "mammal": "an animal with fur or hair that feeds milk to its babies",
  "reptile": "an animal with scaly skin, like a snake or lizard",
  "amphibian": "an animal that can live both in water and on land",
  "insect": "a small animal with six legs, like an ant or bee",
  "herbivore": "an animal that only eats plants",
  "carnivore": "an animal that mostly eats meat",
  "tail": "the part that sticks out from the back of an animal",
  "snout": "the long nose and mouth of an animal like a pig",
  "whisker": "a long stiff hair near the mouth of a cat or mouse",
  "litter": "a group of baby animals born at the same time",
  "zoo": "a park where many kinds of animals are kept for people to see",
  "aquarium": "a tank or building where fish and sea animals are kept",
  "wildlife": "wild animals that live in nature",
  "species": "a group of animals or plants that are the same kind",
  "breed": "a specific type of a dog, cat, or other animal",
  "offspring": "the babies that an animal has",
  "migrate": "to travel to another place, often when seasons change",
  "hibernate": "to sleep through the winter, like a bear does",
  "camouflage": "colors or patterns that help an animal hide",
  "endangered": "an animal that has very few of its kind left",
  "tree": "a tall plant with a trunk, branches, and leaves",
  "forest": "a large area covered with many trees",
  "jungle": "a thick forest found in hot, wet places",
  "wood": "an area with many trees, smaller than a forest",
  "flower": "the colorful part of a plant that often smells nice",
  "grass": "a short green plant that covers fields and lawns",
  "leaf": "the flat green part of a plant that grows on branches",
  "branch": "a part of a tree that grows out from the trunk",
  "root": "the part of a plant that grows underground",
  "seed": "a small part of a plant that can grow into a new plant",
  "bush": "a small plant with many woody branches",
  "shrub": "another word for a small bushy plant",
  "vine": "a plant with a long stem that climbs or crawls",
  "moss": "a soft green plant that grows on rocks or trees",
  "fern": "a green plant with feathery leaves and no flowers",
  "mushroom": "a small plant-like growth with a round top",
  "bark": "the tough outer covering of a tree trunk",
  "trunk": "the thick main stem of a tree",
  "petal": "one of the colorful parts of a flower",
  "stem": "the long thin part of a plant that holds it up",
  "thorn": "a sharp point that grows on some plants",
  "weed": "a wild plant that grows where it is not wanted",
  "meadow": "a field full of grass and wildflowers",
  "field": "a large open area of land, often used for farming",
  "prairie": "a huge flat area of grassy land",
  "valley": "a low area of land between hills or mountains",
  "mountain": "a very tall, high piece of land",
  "hill": "a small raised piece of land, smaller than a mountain",
  "cliff": "a very steep, high wall of rock",
  "canyon": "a deep valley with steep sides, cut by a river",
  "cave": "a large hollow space underground or inside a hill",
  "volcano": "a mountain that can shoot out hot melted rock",
  "island": "a piece of land completely surrounded by water",
  "peninsula": "a piece of land almost surrounded by water",
  "desert": "a very dry area with little rain and few plants",
  "oasis": "a spot in the desert where water and plants are found",
  "dune": "a hill of sand piled up by the wind",
  "beach": "the sandy or rocky land next to the ocean",
  "shore": "the land along the edge of a sea or lake",
  "coast": "the land next to the sea",
  "ocean": "a huge body of salty water",
  "sea": "a large body of salty water, smaller than an ocean",
  "lake": "a large body of water surrounded by land",
  "pond": "a small area of still water, smaller than a lake",
  "river": "a large stream of water that flows to the sea",
  "stream": "a small narrow flow of water",
  "creek": "a small stream, smaller than a river",
  "waterfall": "a place where water falls from a high place",
  "marsh": "wet, low land covered with grasses and reeds",
  "swamp": "wet, low land covered with trees and plants",
  "wetland": "land that is often covered with shallow water",
  "glacier": "a huge slow-moving mass of ice",
  "iceberg": "a huge piece of ice floating in the ocean",
  "rock": "a hard natural piece of stone",
  "stone": "a small hard piece of rock",
  "boulder": "a very large rock",
  "pebble": "a small smooth stone found near water",
  "sand": "tiny grains of rock found on beaches and deserts",
  "soil": "the loose top layer of earth where plants grow",
  "dirt": "loose soil or earth",
  "mud": "soft wet earth",
  "clay": "a heavy sticky kind of soil",
  "mineral": "a natural solid substance found in the earth",
  "crystal": "a clear hard mineral with a neat shape",
  "gem": "a beautiful, valuable stone",
  "sky": "the space above the earth where clouds and the sun are",
  "sun": "the bright star that gives earth light and heat",
  "moon": "the round object that circles the earth and shines at night",
  "star": "a bright ball of gas seen twinkling in the night sky",
  "planet": "a huge round object in space that circles a star",
  "earth": "the planet we live on",
  "universe": "everything that exists, including all stars and planets",
  "galaxy": "a huge group of stars, like the Milky Way",
  "horizon": "the line far away where the sky meets the land or sea",
  "sunrise": "the time in the morning when the sun comes up",
  "sunset": "the time in the evening when the sun goes down",
  "wilderness": "wild land where few people live",
  "habitat": "the natural place where an animal or plant lives",
  "ecosystem": "all the living things in a place and how they connect",
  "log": "a thick piece of a tree trunk or branch",
  "twig": "a small thin branch of a tree",
  "acorn": "the small nut that grows on an oak tree",
  "pinecone": "the hard brown seed case that grows on a pine tree",
  "blossom": "a flower on a tree or plant, especially fruit trees",
  "bloom": "to open into a flower",
  "orchard": "a place where fruit trees are grown",
  "garden": "a place where people grow flowers, plants, or vegetables",
  "farm": "land used to grow crops or raise animals",
  "pasture": "a field of grass where farm animals eat",
  "orchid": "a delicate, often colorful flower",
  "rose": "a flower that often smells sweet and has thorns",
  "daisy": "a small flower with white petals and a yellow center",
  "sunflower": "a tall flower with yellow petals that faces the sun",
  "tulip": "a colorful flower shaped like a cup",
  "dandelion": "a yellow flower that turns into fluffy white seeds",
  "clover": "a small plant with three round leaves",
  "cactus": "a spiky plant that grows in the desert",
  "palm tree": "a tall tree with big leaves that grows in warm places",
  "oak": "a large strong tree that grows acorns",
  "pine": "a tall tree with needles that stays green all year",
  "maple": "a tree known for its colorful leaves in autumn",
  "willow": "a tree with long thin branches that droop down",
  "bamboo": "a tall fast-growing plant with a hollow woody stem",
  "reef": "a ridge of rock or coral near the surface of the sea",
  "coral": "a hard colorful substance made by tiny sea animals",
  "lagoon": "a shallow area of water separated from the sea",
  "cavern": "a large cave",
  "peak": "the pointed top of a mountain",
  "summit": "the highest point of a mountain",
  "slope": "a piece of ground that goes up or down at an angle",
  "ridge": "a long narrow raised strip of land",
  "plateau": "a large flat area of high land",
  "tundra": "a cold flat land with no trees, near the arctic",
  "savanna": "a flat grassy area with few trees, found in hot places",
  "atmosphere": "the layer of air that surrounds the earth",
  "crater": "a large bowl-shaped hollow in the ground",
  "tide": "the rise and fall of the ocean's water level",
  "current": "a steady flow of water moving in one direction",
  "ripple": "a small wave on the surface of water",
  "puddle": "a small pool of water left after it rains",
  "sprout": "a new small growth from a seed or plant",
  "harvest": "to gather crops that are ready to eat",
  "compost": "old plant material turned into rich soil",
  "dew": "small drops of water that form outside in the morning",
  "bedrock": "the solid rock found under the soil",
  "canopy": "the top layer of leaves and branches in a forest",
  "undergrowth": "small plants and bushes that grow under trees",
  "wildflower": "a flower that grows naturally without being planted",
  "thicket": "a thick group of bushes or small trees",
  "grove": "a small group of trees growing together",
  "glade": "an open space in the middle of a forest",
  "brook": "a small, natural stream of water",
  "delta": "land shaped like a triangle where a river meets the sea",
  "estuary": "a place where a river meets the sea",
  "bay": "part of the sea that curves into the land",
  "gulf": "a large area of sea partly surrounded by land",
  "continent": "one of the earth's seven huge areas of land",
  "hemisphere": "one half of the earth",
  "equator": "an imaginary line around the middle of the earth",
  "shade": "a dark cool area out of direct sunlight",
  "shadow": "a dark shape made when something blocks the light",
  "sunlight": "light that comes from the sun",
  "moonlight": "light that comes from the moon at night",
  "starlight": "light that comes from the stars at night",
  "pollen": "tiny yellow grains made by flowers",
  "nectar": "the sweet liquid inside a flower",
  "sap": "the liquid that flows inside a plant or tree",
  "algae": "tiny plant-like living things that grow in water",
  "lichen": "a small crusty growth found on rocks and trees",
  "quarry": "a place where rock or stone is dug out of the ground",
  "landscape": "the way a piece of land looks",
  "terrain": "the shape and features of an area of land",
  "geyser": "a hot spring that shoots hot water into the air",
  "hot spring": "warm water that comes up naturally from the ground",
  "rainforest": "a thick, warm forest that gets a lot of rain",
  "grassland": "a large open area covered mostly in grass",
  "woodland": "land covered with many trees",
  "vineyard": "a farm where grapes are grown",
  "rain": "water that falls from clouds in the sky",
  "snow": "soft white flakes of frozen water that fall in winter",
  "wind": "air that moves and blows outside",
  "storm": "very bad weather with strong wind and rain",
  "thunder": "the loud booming sound that comes after lightning",
  "lightning": "a bright flash of light in the sky during a storm",
  "cloud": "a white or gray shape in the sky made of tiny water drops",
  "sunny": "weather when the sun is shining brightly",
  "cloudy": "weather when the sky is covered with clouds",
  "windy": "weather when the wind is blowing strongly",
  "rainy": "weather when it is raining",
  "snowy": "weather when snow is falling or covering the ground",
  "stormy": "weather with strong wind, rain, and sometimes thunder",
  "foggy": "weather when thick mist makes it hard to see far",
  "misty": "weather with a light fog in the air",
  "humid": "air that feels warm, sticky, and full of moisture",
  "wet": "covered or soaked with water",
  "cold": "having a very low temperature",
  "hot": "having a very high temperature",
  "warm": "having a pleasant, comfortable temperature, not cold",
  "cool": "a little bit cold, in a pleasant way",
  "freezing": "extremely cold, cold enough for water to turn to ice",
  "icy": "covered with slippery ice",
  "frost": "a thin white layer of ice that forms outside in the cold",
  "ice": "water that has frozen solid",
  "hail": "small hard balls of ice that fall like rain",
  "sleet": "a mix of rain and snow falling together",
  "drizzle": "light rain that falls softly",
  "breeze": "a gentle, light wind",
  "gust": "a sudden, strong burst of wind",
  "gale": "a very strong wind",
  "tornado": "a spinning, funnel-shaped storm of very fast wind",
  "hurricane": "a huge, powerful storm with strong winds that forms over the ocean",
  "cyclone": "a large storm that spins around a calm center",
  "typhoon": "a huge, powerful storm found in the Pacific Ocean",
  "blizzard": "a heavy snowstorm with strong wind",
  "monsoon": "a season of very heavy rain in some parts of the world",
  "drought": "a long period of time with very little rain",
  "flood": "too much water covering land that is usually dry",
  "heatwave": "a period of unusually hot weather",
  "temperature": "how hot or cold something is",
  "climate": "the usual weather a place has over a long time",
  "season": "one of the four parts of the year, like summer or winter",
  "spring": "the season after winter when plants start to grow",
  "summer": "the warmest season of the year",
  "autumn": "the season after summer when leaves fall, also called fall",
  "winter": "the coldest season of the year",
  "humidity": "the amount of moisture in the air",
  "forecast": "a guess about what the weather will be like",
  "rainbow": "a colorful curved band of light that appears after rain",
  "raindrop": "a single small drop of falling rain",
  "snowflake": "a tiny, delicate piece of falling snow",
  "snowman": "a figure made out of packed snow",
  "snowball": "a ball made by packing snow together",
  "thunderstorm": "a storm with heavy rain, thunder, and lightning",
  "downpour": "a sudden, very heavy rain",
  "shower": "a short period of light rain",
  "mist": "tiny drops of water floating in the air near the ground",
  "overcast": "when the whole sky is covered with gray clouds",
  "chilly": "a little bit cold",
  "mild": "weather that is neither too hot nor too cold",
  "scorching": "extremely hot",
  "sweltering": "uncomfortably hot",
  "arctic": "extremely cold, like the area near the North Pole",
  "tropical": "warm and often rainy, like weather near the equator",
  "barometer": "a tool used to measure air pressure and predict weather",
  "thermometer": "a tool used to measure temperature",
  "weather vane": "a tool that shows which way the wind is blowing",
  "meteorologist": "a person whose job is to study and predict weather",
  "umbrella": "a tool people hold over their heads to stay dry in rain",
  "raincoat": "a coat that keeps you dry when it rains",
  "sunscreen": "a lotion that protects skin from the sun",
  "sunglasses": "glasses that protect your eyes from bright sunlight",
  "heat": "warmth or high temperature",
  "pressure": "the weight or force of air pushing on an area",
  "evaporation": "when water turns into vapor and rises into the air",
  "condensation": "when water vapor cools and turns back into liquid drops",
  "precipitation": "any water that falls from the sky, like rain or snow",
  "wind chill": "how much colder the wind makes the air feel",
  "gusty": "having sudden strong bursts of wind",
  "breezy": "having a light, gentle wind",
  "sunbeam": "a ray of sunlight",
  "sunshine": "bright light and warmth from the sun",
  "daylight": "the natural light during the day",
  "nightfall": "the time when night begins",
  "twilight": "the soft light in the sky just after sunset",
  "dawn": "the very first light of the morning",
  "dusk": "the time of evening just before it gets dark",
  "smog": "dirty, hazy air caused by smoke and pollution",
  "haze": "a thin cloudy layer in the air that blurs your view",
  "muggy": "warm and uncomfortably damp",
  "damp": "slightly wet",
  "soggy": "very wet and soft",
  "slush": "partly melted, watery snow",
  "avalanche": "a huge mass of snow that suddenly slides down a mountain",
  "whirlwind": "a fast spinning column of air",
  "dust storm": "a storm that fills the air with blowing dust and sand",
  "cold snap": "a sudden short period of very cold weather",
  "climate change": "the long-term change in the earth's weather patterns",
  "seasonal": "happening only during a certain season",
  "clear": "a sky with no clouds",
  "partly cloudy": "a sky with some clouds but also some sun",
  "thundercloud": "a large dark cloud that can bring thunder and lightning",
  "windstorm": "a storm with very strong winds but little rain",
  "snowdrift": "a pile of snow blown together by the wind",
  "icicle": "a hanging spike of ice formed by dripping water freezing",
  "permafrost": "ground that stays frozen all year round",
  "sunburn": "red, sore skin caused by too much sun",
  "weather balloon": "a balloon sent high into the sky to study weather",
  "squall": "a sudden, strong storm with wind and rain",
  "wet season": "the time of year when a place gets the most rain",
  "dry season": "the time of year when a place gets very little rain",
  "cold front": "the leading edge of a mass of cold air",
  "warm front": "the leading edge of a mass of warm air",
  "air pressure": "the force of air pushing down on everything around us",
  "wind speed": "how fast the wind is blowing",
  "microclimate": "the special weather conditions of one small area",
  "flurry": "a brief, light fall of snow",
  "teacher": "a person whose job is to help students learn",
  "student": "a person who is learning at a school",
  "pencil": "a tool used for writing or drawing with lead",
  "pen": "a tool with ink used for writing",
  "eraser": "a small tool that removes pencil marks",
  "homework": "schoolwork that you finish at home",
  "classroom": "a room where students learn together",
  "desk": "a table where you sit to work",
  "chair": "a seat that you sit on",
  "book": "pages with words and pictures that you read",
  "notebook": "a book with blank or lined pages for writing",
  "backpack": "a bag you carry on your back for school",
  "lunch": "the meal you eat in the middle of the day",
  "recess": "a break time to play at school",
  "playground": "an outdoor place with equipment for kids to play",
  "principal": "the person in charge of a whole school",
  "librarian": "a person who takes care of a library",
  "library": "a place with many books to read or borrow",
  "math": "the school subject about numbers and counting",
  "science": "the school subject about how the world works",
  "reading": "looking at words and understanding what they mean",
  "writing": "putting words down on paper",
  "spelling": "putting letters in the correct order to make a word",
  "grade": "a score that shows how well you did",
  "test": "a set of questions that checks what you learned",
  "quiz": "a short test on one topic",
  "exam": "a big test given at the end of a class",
  "lesson": "something a teacher teaches you",
  "subject": "a topic you study in school, like math or art",
  "chalkboard": "a dark board that teachers write on with chalk",
  "whiteboard": "a white board that teachers write on with markers",
  "marker": "a pen with colored ink used for writing or drawing",
  "crayon": "a stick of colored wax used for coloring",
  "scissors": "a tool with two blades used to cut paper",
  "ruler": "a flat tool used to measure or draw straight lines",
  "paper": "thin sheets used for writing or drawing",
  "folder": "a flat holder used to keep papers together",
  "binder": "a cover with rings used to hold loose papers",
  "locker": "a small cabinet where students keep their things",
  "hallway": "a long passage inside a school building",
  "cafeteria": "a room in a school where students eat lunch",
  "gym": "a room used for exercise and sports",
  "art": "the school subject about drawing, painting, and making things",
  "music": "the school subject about singing and playing instruments",
  "computer": "a machine used to write, learn, and play",
  "keyboard": "the set of buttons used to type on a computer",
  "screen": "the flat part of a computer that shows pictures and words",
  "project": "a big piece of work you do for school",
  "report": "written work that explains what you learned",
  "essay": "a short piece of writing about one topic",
  "question": "something you ask in order to get an answer",
  "classmate": "another student who is in your class",
  "bus": "a large vehicle that carries many people, like to school",
  "bell": "a sound that tells you class is starting or ending",
  "schedule": "a plan that shows what happens and when",
  "assignment": "a piece of work a teacher gives you to do",
  "textbook": "a book used to learn about a school subject",
  "dictionary": "a book that explains what words mean",
  "encyclopedia": "a book or set of books full of facts on many topics",
  "alphabet": "all the letters used to write words, from a to z",
  "letter": "a symbol used to write words, like a or b",
  "word": "a group of letters that has a meaning",
  "sentence": "a group of words that makes a complete thought",
  "paragraph": "a group of sentences about one main idea",
  "story": "words that tell about people or events",
  "chapter": "one part of a longer book",
  "page": "one side of a sheet of paper in a book",
  "cover": "the outside part of a book",
  "title": "the name of a book, story, or movie",
  "author": "a person who writes a book or story",
  "illustrator": "a person who draws the pictures in a book",
  "drawing": "a picture made using a pencil or pen",
  "painting": "a picture made using paint",
  "coloring": "filling a picture with different colors",
  "craft": "something fun you make with your hands",
  "experiment": "a test done to learn something new about science",
  "laboratory": "a room used for doing science experiments",
  "uniform": "matching clothes that students wear to school",
  "badge": "a small pin or sticker showing an achievement",
  "certificate": "a paper that shows you completed or achieved something",
  "diploma": "an official paper given when you finish school",
  "graduation": "a ceremony held when students finish school",
  "kindergarten": "the school year before first grade",
  "preschool": "school for children before kindergarten",
  "elementary": "school for younger children, usually the first few grades",
  "college": "a school people can attend after high school",
  "university": "a large school where people study after high school",
  "degree": "a title earned after finishing a course of study",
  "coach": "a person who trains and leads a sports team",
  "counselor": "a person who helps students with problems or advice",
  "nurse": "a person who takes care of sick or hurt people",
  "janitor": "a person who cleans and takes care of a building",
  "custodian": "a person who keeps a school clean and running",
  "substitute": "a teacher who fills in when the regular one is away",
  "tutor": "a person who helps someone learn one on one",
  "mentor": "a wise, trusted person who guides someone younger",
  "club": "a group of people who meet to share an interest",
  "team": "a group of people who play a sport together",
  "sport": "a game that uses physical skill, like soccer",
  "assembly": "a meeting where the whole school gathers together",
  "award": "a prize given for doing something well",
  "trophy": "a prize given to a winner, often shaped like a cup",
  "medal": "a round metal prize worn around the neck",
  "ribbon": "a strip of cloth given as a small prize",
  "prize": "something given to someone who wins or does well",
  "reward": "something nice given for good behavior or hard work",
  "detention": "staying after school as a punishment",
  "rule": "something you must or must not do",
  "permission": "being allowed to do something",
  "attendance": "a record showing who is at school each day",
  "absent": "not at school when you are supposed to be there",
  "tardy": "arriving somewhere later than you should",
  "sharpener": "a tool used to make a pencil point sharp",
  "worksheet": "a paper with questions or problems to practice",
  "handwriting": "the way a person writes letters and words by hand",
  "cursive": "a style of writing where the letters connect together",
  "vocabulary": "all the words a person knows and uses",
  "grammar": "the rules for how words fit together in a sentence",
  "punctuation": "marks like periods and commas used in writing",
  "period": "the punctuation mark placed at the end of a sentence",
  "comma": "a punctuation mark used to show a short pause",
  "spell": "to say or write the letters of a word in order",
  "understand": "to know what something means",
  "globe": "a round model of the earth",
  "map": "a drawing that shows where places are",
  "poster": "a large printed picture or sign",
  "sticker": "a small piece of paper with glue on the back",
  "stamp": "a small design used to mark or decorate paper",
  "stapler": "a tool that fastens papers together with metal staples",
  "staple": "a tiny piece of metal used to hold papers together",
  "tape": "a sticky strip used to attach things together",
  "paperclip": "a bent piece of metal used to hold papers together",
  "highlighter": "a marker used to color over important words",
  "chalk": "a soft white or colored stick used to write on a board",
  "ink": "colored liquid used in pens for writing",
  "auditorium": "a large room used for school shows and assemblies",
  "stage": "a raised platform where people perform",
  "microphone": "a device that makes your voice louder",
  "projector": "a machine that shows pictures on a screen or wall",
  "swing": "a seat that hangs and moves back and forth",
  "seesaw": "a long board that goes up and down for two riders",
  "sandbox": "a box filled with sand for playing",
  "jumprope": "a rope used for jumping over as it swings",
  "recital": "a performance where students show what they learned",
  "semester": "half of a school year",
  "curriculum": "the group of subjects taught in a school",
  "gradebook": "a book or file where a teacher records grades",
  "excuse": "a reason given for being late or absent",
  "recite": "to say a poem or piece out loud from memory",
  "announcement": "a message shared with everyone at school",
  "cubby": "a small space where a child keeps their things",
  "flashcard": "a card with a word or fact used for studying",
  "quiet": "making very little or no noise",
  "loud": "making a lot of noise",
  "neat": "clean and tidy",
  "mother": "a woman who has a child",
  "father": "a man who has a child",
  "mom": "a friendly word for mother",
  "dad": "a friendly word for father",
  "mommy": "a child's word for mother",
  "daddy": "a child's word for father",
  "parent": "a mother or father",
  "son": "a person's male child",
  "daughter": "a person's female child",
  "brother": "a boy who has the same parents as you",
  "sister": "a girl who has the same parents as you",
  "sibling": "a brother or sister",
  "grandmother": "the mother of your mother or father",
  "grandfather": "the father of your mother or father",
  "grandma": "a friendly word for grandmother",
  "grandpa": "a friendly word for grandfather",
  "grandparent": "a grandmother or grandfather",
  "aunt": "the sister of your mother or father",
  "uncle": "the brother of your mother or father",
  "cousin": "the child of your aunt or uncle",
  "niece": "the daughter of your brother or sister",
  "nephew": "the son of your brother or sister",
  "family": "a group of people who are related to each other",
  "relative": "a person who belongs to your family",
  "baby": "a very young child",
  "infant": "a baby who is only a few months old",
  "toddler": "a young child who has just learned to walk",
  "child": "a young person who is not yet an adult",
  "children": "more than one child",
  "teenager": "a person between the ages of thirteen and nineteen",
  "adult": "a person who is fully grown up",
  "man": "an adult male person",
  "woman": "an adult female person",
  "boy": "a young male person",
  "girl": "a young female person",
  "person": "a human being",
  "people": "more than one person",
  "friend": "someone you like and enjoy spending time with",
  "neighbor": "a person who lives near you",
  "stranger": "a person you do not know",
  "teammate": "a person who plays on the same team as you",
  "husband": "a man who is married",
  "wife": "a woman who is married",
  "twin": "one of two children born at the same time to the same parents",
  "stepmother": "the woman a parent marries after having a child",
  "stepfather": "the man a parent marries after having a child",
  "stepbrother": "the son of a stepparent",
  "stepsister": "the daughter of a stepparent",
  "godmother": "a woman chosen to help guide and care for a child",
  "godfather": "a man chosen to help guide and care for a child",
  "guardian": "an adult who takes care of and protects a child",
  "babysitter": "a person who watches children while parents are away",
  "nanny": "a person whose job is to take care of children",
  "doctor": "a person whose job is to help sick people get better",
  "dentist": "a person whose job is to take care of teeth",
  "firefighter": "a person whose job is to put out fires and help people",
  "farmer": "a person whose job is to grow crops or raise animals",
  "chef": "a person whose job is to cook food, often in a restaurant",
  "waiter": "a man who brings food to people at a restaurant",
  "waitress": "a woman who brings food to people at a restaurant",
  "cashier": "a person who takes payment at a store",
  "driver": "a person who steers and controls a vehicle",
  "pilot": "a person who flies an airplane",
  "captain": "the leader of a ship, plane, or team",
  "soldier": "a person who serves in an army",
  "artist": "a person who makes paintings or other art",
  "musician": "a person who plays or writes music",
  "singer": "a person who sings songs",
  "dancer": "a person who moves to music in a skillful way",
  "actor": "a person who performs in plays or movies",
  "writer": "a person who writes books or stories",
  "scientist": "a person who studies and learns about the world",
  "engineer": "a person who designs and builds things like machines",
  "builder": "a person who constructs buildings",
  "carpenter": "a person who builds things out of wood",
  "plumber": "a person who fixes pipes and water systems",
  "electrician": "a person who works with electrical wires and systems",
  "mechanic": "a person who fixes cars and engines",
  "veterinarian": "a doctor who takes care of animals",
  "lawyer": "a person who helps people understand and follow the law",
  "judge": "a person who decides cases in a court of law",
  "mayor": "a person elected to lead a town or city",
  "president": "the elected leader of a country",
  "king": "a male ruler of a country",
  "queen": "a female ruler of a country",
  "prince": "the son of a king or queen",
  "princess": "the daughter of a king or queen",
  "hero": "a person admired for doing brave or good things",
  "visitor": "a person who comes to see a place or person",
  "guest": "a person who is invited to visit or stay",
  "host": "a person who welcomes and takes care of guests",
  "owner": "a person who possesses something",
  "boss": "a person in charge at a job",
  "employee": "a person who works for someone else",
  "worker": "a person who does a job",
  "customer": "a person who buys something from a store",
  "citizen": "a person who legally belongs to a country",
  "community": "a group of people living in the same area",
  "neighborhood": "the area around where you live",
  "town": "a place where people live, smaller than a city",
  "city": "a large place where many people live",
  "village": "a small group of houses in the countryside",
  "country": "a land with its own government and people",
  "name": "what a person or thing is called",
  "nickname": "a friendly, shorter name used instead of someone's real name",
  "personality": "the special mix of traits that make someone who they are",
  "kindness": "being caring and gentle toward others",
  "honesty": "telling the truth",
  "courage": "being brave even when something is scary",
  "patience": "staying calm while waiting or dealing with problems",
  "manners": "polite ways of behaving around others",
  "respect": "treating someone kindly because you value them",
  "love": "a strong feeling of caring for someone",
  "care": "to feel concern for someone's wellbeing",
  "feeling": "an emotion you have inside, like happy or sad",
  "emotion": "a strong feeling, such as joy or fear",
  "hungry": "needing or wanting food",
  "thirsty": "needing or wanting a drink",
  "sick": "not feeling well",
  "healthy": "feeling well and strong",
  "helpful": "giving useful help to others",
  "selfish": "caring only about yourself, not others",
  "nice": "pleasant and friendly",
  "mean": "unkind to others",
  "police": "the group of people whose job is to keep people safe",
  "officer": "a person who holds an official position, like in the police",
  "mailman": "a person whose job is to deliver mail",
  "astronaut": "a person who travels and works in space",
  "athlete": "a person who is skilled at sports",
  "photographer": "a person who takes pictures",
  "journalist": "a person who writes news stories",
  "reporter": "a person who gathers and shares news",
  "barber": "a person whose job is to cut hair",
  "tailor": "a person who makes or fixes clothing",
  "butcher": "a person whose job is to prepare and sell meat",
  "baker": "a person who makes bread and other baked food",
  "fisherman": "a person whose job is to catch fish",
  "sailor": "a person who works on a ship",
  "explorer": "a person who travels to discover new places",
  "inventor": "a person who creates new things",
  "leader": "a person who guides or is in charge of a group",
  "partner": "a person who works or does something together with you",
  "companion": "a person who spends time with you",
  "acquaintance": "a person you know a little, but not well",
  "morning": "the early part of the day, from sunrise to noon",
  "afternoon": "the part of the day between noon and evening",
  "evening": "the part of the day between afternoon and night",
  "night": "the time when it is dark outside",
  "midnight": "twelve o'clock at night",
  "noon": "twelve o'clock in the middle of the day",
  "today": "the day that is happening right now",
  "yesterday": "the day before today",
  "tomorrow": "the day after today",
  "week": "a period of seven days",
  "weekend": "saturday and sunday, the days at the end of the week",
  "weekday": "any day from monday to friday",
  "month": "one of the twelve parts of a year",
  "year": "a period of twelve months",
  "day": "a period of twenty-four hours",
  "hour": "a period of sixty minutes",
  "minute": "a period of sixty seconds",
  "second": "a very short unit of time",
  "clock": "a device that shows what time it is",
  "calendar": "a chart that shows the days, weeks, and months of a year",
  "date": "a specific day, shown by its day, month, and year",
  "monday": "the day of the week after sunday",
  "tuesday": "the day of the week after monday",
  "wednesday": "the day of the week after tuesday",
  "thursday": "the day of the week after wednesday",
  "friday": "the day of the week after thursday",
  "saturday": "the day of the week after friday",
  "sunday": "the day of the week after saturday",
  "january": "the first month of the year",
  "february": "the second month of the year",
  "april": "the fourth month of the year",
  "may": "the fifth month of the year",
  "june": "the sixth month of the year",
  "july": "the seventh month of the year",
  "august": "the eighth month of the year",
  "september": "the ninth month of the year",
  "october": "the tenth month of the year",
  "november": "the eleventh month of the year",
  "december": "the twelfth and last month of the year",
  "holiday": "a special day when people celebrate or rest",
  "anniversary": "a date that marks a special event from years before",
  "vacation": "a time when you take a break from school or work",
  "early": "before the usual or expected time",
  "late": "after the usual or expected time",
  "soon": "in a short amount of time from now",
  "now": "at this exact moment",
  "then": "at that time",
  "before": "earlier than a certain time",
  "after": "later than a certain time",
  "next": "coming right after this one",
  "last": "coming at the very end",
  "first": "coming before all others",
  "always": "at every time, without exception",
  "never": "at no time at all",
  "sometimes": "on some occasions but not always",
  "often": "many times",
  "daily": "happening every day",
  "weekly": "happening every week",
  "monthly": "happening every month",
  "yearly": "happening every year",
  "annual": "happening once every year",
  "century": "a period of one hundred years",
  "decade": "a period of ten years",
  "past": "the time before now",
  "present": "the time that is happening right now",
  "future": "the time that has not happened yet",
  "time": "the ongoing passing of hours, days, and years",
  "timer": "a device used to count down a set amount of time",
  "alarm": "a sound or signal that warns or wakes someone up",
  "quarter": "one of four equal parts, like fifteen minutes of an hour",
  "half": "one of two equal parts, like thirty minutes of an hour",
  "whole": "all of something, complete",
  "ago": "back in time from now",
  "later": "at a time after this one",
  "during": "while something else is happening",
  "while": "at the same time as something else",
  "until": "up to a certain time",
  "since": "from a certain time until now",
  "era": "a long period of time with something special about it",
  "moment": "a very short period of time",
  "instant": "a very brief moment",
  "forever": "for all time, without ever ending",
  "temporary": "lasting for only a short time",
  "permanent": "lasting forever or for a very long time",
  "appointment": "an arranged time to meet or do something",
  "deadline": "the latest time something must be finished",
  "countdown": "counting numbers backward to zero before something happens",
  "christmas": "a holiday in december celebrated by many people",
  "thanksgiving": "a holiday when families give thanks and share a meal",
  "halloween": "a holiday in october when kids wear costumes",
  "easter": "a spring holiday celebrated by many people",
  "bedtime": "the time when someone goes to bed to sleep",
  "naptime": "a period of time set aside for a short sleep",
  "snacktime": "a time set aside for eating a small snack",
  "lunchtime": "the time of day when lunch is eaten",
  "dinnertime": "the time of day when dinner is eaten",
  "breakfast": "the first meal of the day, eaten in the morning",
  "hourly": "happening once every hour",
  "reunion": "a gathering of people who have not seen each other in a while",
  "fortnight": "a period of two weeks",
  "duration": "how long something lasts",
  "punctual": "arriving right on time",
  "overdue": "past the time something was supposed to happen",
  "upcoming": "happening soon, in the near future",
  "recent": "happening a short time ago",
  "modern": "belonging to the present time",
  "ancient": "from a very long time ago",
  "old": "having existed for a long time",
  "new": "recently made or begun",
  "young": "not having lived very long",
  "lifetime": "the whole period during which someone is alive",
  "generation": "a group of people born around the same time",
  "equinox": "the two days a year when day and night are equal length",
  "solstice": "the day with the most or least daylight in a year",
  "timezone": "a region that uses the same standard time",
  "stopwatch": "a device used to measure exact amounts of time",
  "sundial": "an old device that shows time using the sun's shadow",
  "hourglass": "a glass device that measures time as sand falls through it",
  "midday": "the middle of the day, around noon",
  "biweekly": "happening every two weeks",
  "quarterly": "happening every three months",
  "midweek": "the middle of the week",
  "midyear": "the middle of the year",
  "daybreak": "the time when light first appears in the morning",
  "daytime": "the hours when it is light outside",
  "nighttime": "the hours when it is dark outside",
  "workday": "a day when people go to work or school",
  "playtime": "time set aside for playing",
  "playdate": "a time set up for children to play together",
  "springtime": "the season of spring",
  "summertime": "the season of summer",
  "wintertime": "the season of winter",
  "birthday": "the yearly anniversary of the day someone was born",
  "someday": "at some time in the future",
  "nowadays": "in the present time, as compared to the past",
  "meanwhile": "at the same time as something else happens",
  "beforehand": "ahead of time",
  "afterward": "at a later time",
  "immediately": "right away, without any delay",
  "eventually": "at some later time, after a while",
  "gradually": "happening slowly over time",
  "constantly": "happening all the time without stopping",
  "apple": "a round fruit that is usually red or green and grows on trees",
  "banana": "a long yellow fruit with a peel you take off before eating",
  "orange": "a round citrus fruit with a thick orange peel",
  "grape": "a small round juicy fruit that grows in bunches",
  "strawberry": "a small red fruit with tiny seeds on its skin",
  "blueberry": "a small round blue fruit that grows on bushes",
  "raspberry": "a small red fruit made of tiny juicy bumps",
  "watermelon": "a big fruit with green skin and juicy red inside",
  "pineapple": "a spiky tropical fruit with sweet yellow flesh",
  "mango": "a sweet juicy tropical fruit with orange flesh",
  "peach": "a soft fuzzy fruit with a pit inside",
  "pear": "a green or yellow fruit shaped like a teardrop",
  "cherry": "a small round red fruit with a pit",
  "lemon": "a sour yellow citrus fruit",
  "lime": "a small sour green citrus fruit",
  "kiwi": "a small fuzzy brown fruit with bright green flesh inside",
  "plum": "a small round purple or red fruit with a pit",
  "apricot": "a small soft orange fruit similar to a peach",
  "coconut": "a large hard brown fruit with white flesh inside",
  "avocado": "a green fruit with soft flesh and a big pit",
  "tomato": "a soft red fruit often used in salads and sauces",
  "potato": "a brown vegetable that grows underground and can be baked or fried",
  "carrot": "a long orange vegetable that grows underground",
  "broccoli": "a green vegetable that looks like tiny trees",
  "cucumber": "a long green vegetable that is cool and crunchy",
  "lettuce": "a leafy green vegetable used in salads",
  "spinach": "a leafy green vegetable full of vitamins",
  "onion": "a round vegetable with layers that can make you cry when cut",
  "garlic": "a small strong smelling vegetable used to flavor food",
  "pepper": "a crunchy vegetable that can be red, green, or yellow",
  "corn": "a yellow vegetable with kernels that grow on a cob",
  "pea": "a small round green vegetable found inside a pod",
  "bean": "a small vegetable that grows in a pod",
  "pumpkin": "a big round orange vegetable often carved at Halloween",
  "squash": "a vegetable with a hard skin and soft inside",
  "cabbage": "a round vegetable made of layered leaves",
  "celery": "a crunchy green vegetable with long stalks",
  "radish": "a small crunchy red or white root vegetable",
  "sandwich": "food made with slices of bread and filling in between",
  "cheese": "a food made from milk that can be soft or hard",
  "bread": "a food made from baked flour and water",
  "butter": "a soft yellow food made from cream, spread on bread",
  "milk": "a white drink that comes from cows",
  "egg": "a food laid by chickens, often fried or boiled",
  "yogurt": "a thick creamy food made from milk",
  "cereal": "small crunchy pieces eaten with milk for breakfast",
  "pancake": "a flat round cake cooked on a griddle",
  "waffle": "a crispy cake with a grid pattern of squares",
  "toast": "bread that has been browned by heat",
  "bagel": "a round bread roll with a hole in the middle",
  "muffin": "a small soft baked cake, often eaten for breakfast",
  "cookie": "a small sweet baked treat",
  "cake": "a sweet baked dessert often eaten on birthdays",
  "pie": "a baked dish with a crust filled with fruit or other food",
  "donut": "a round sweet fried treat with a hole in the middle",
  "brownie": "a rich chocolate baked square treat",
  "chocolate": "a sweet brown food made from cocoa beans",
  "candy": "a small sweet treat",
  "popcorn": "corn kernels that pop up fluffy when heated",
  "chips": "thin crispy fried slices of potato",
  "pretzel": "a salty baked snack twisted into a knot shape",
  "cracker": "a thin crispy baked snack",
  "pasta": "noodles made from flour and water, often served with sauce",
  "spaghetti": "long thin strings of pasta",
  "pizza": "a round flat food with cheese and toppings on baked dough",
  "burger": "a round patty of meat served in a bun",
  "hotdog": "a long sausage served in a bun",
  "taco": "a folded tortilla filled with meat, cheese, and vegetables",
  "burrito": "a rolled tortilla filled with rice, beans, and other food",
  "soup": "a warm liquid food often with vegetables or meat",
  "salad": "a mix of vegetables, often eaten cold",
  "rice": "tiny white or brown grains that are cooked and eaten",
  "noodle": "a long thin strip of pasta",
  "sauce": "a liquid or soft food poured over other food for flavor",
  "ketchup": "a red sauce made from tomatoes",
  "mustard": "a yellow sauce with a tangy taste",
  "mayonnaise": "a creamy white sauce often used on sandwiches",
  "honey": "a sweet sticky food made by bees",
  "jam": "a sweet spread made from cooked fruit",
  "jelly": "a sweet wobbly spread made from fruit juice",
  "syrup": "a thick sweet liquid poured on pancakes",
  "sugar": "a sweet white substance used to make food taste sweet",
  "salt": "a white substance used to season food",
  "flour": "a fine powder made from ground wheat, used for baking",
  "oil": "a liquid used for cooking food",
  "vinegar": "a sour liquid used in cooking and salad dressing",
  "juice": "a drink made from the liquid of fruit",
  "lemonade": "a sweet drink made from lemons, sugar, and water",
  "tea": "a hot drink made by soaking leaves in water",
  "coffee": "a hot drink made from ground roasted beans",
  "smoothie": "a thick cold drink made from blended fruit",
  "milkshake": "a thick cold drink made from milk and ice cream",
  "beef": "meat that comes from cows",
  "pork": "meat that comes from pigs",
  "fish": "an animal that lives in water and is often eaten as food",
  "bacon": "thin salty strips of cooked pork",
  "sausage": "ground meat shaped into a tube and cooked",
  "ham": "meat from a pig's leg, often sliced for sandwiches",
  "steak": "a thick slice of meat, usually beef",
  "meatball": "a small round ball of cooked ground meat",
  "nut": "a hard shelled food that grows on trees",
  "peanut": "a small nut that grows underground in a shell",
  "almond": "a flat oval shaped nut",
  "walnut": "a wrinkly brown nut with a hard shell",
  "cashew": "a curved nut with a mild sweet taste",
  "raisin": "a dried grape",
  "oatmeal": "a warm breakfast food made from cooked oats",
  "granola": "a crunchy mix of oats, nuts, and honey",
  "pudding": "a soft sweet creamy dessert",
  "marshmallow": "a soft white puffy sweet treat",
  "gum": "a sweet chewy treat you chew but do not swallow",
  "mint": "a fresh tasting green herb used to flavor food",
  "herb": "a plant used to add flavor to food",
  "spice": "a flavorful powder or seed added to food",
  "cinnamon": "a warm sweet spice made from tree bark",
  "vanilla": "a sweet flavoring used in desserts",
  "dessert": "a sweet food eaten after a meal",
  "dinner": "the main meal eaten in the evening",
  "snack": "a small amount of food eaten between meals",
  "meal": "the food eaten at one time, like breakfast or dinner",
  "recipe": "a set of instructions for making food",
  "leftovers": "food left over from a previous meal",
  "picnic": "a meal eaten outdoors, often on a blanket",
  "barbecue": "food cooked over an open flame outdoors",
  "omelet": "eggs beaten and cooked flat, often folded with filling",
  "french fries": "long thin strips of fried potato",
  "sundae": "ice cream topped with sauce and other sweet toppings",
  "cupcake": "a small cake baked in a paper cup",
  "jellybean": "a small chewy candy shaped like a bean",
  "lollipop": "a hard candy on a stick",
  "gingerbread": "a sweet spiced cookie often shaped like a person",
  "custard": "a sweet creamy dessert made from eggs and milk",
  "broth": "a thin liquid made by cooking meat or vegetables in water",
  "dip": "a soft food you scoop up with chips or vegetables",
  "dressing": "a sauce poured over salad",
  "crust": "the outer hard part of bread or a pie",
  "dough": "a soft mixture of flour and water used for baking",
  "batter": "a thin mixture used to make pancakes or cakes",
  "yolk": "the yellow part inside an egg",
  "grain": "small hard seeds, like wheat or rice, used for food",
  "wheat": "a grain used to make flour and bread",
  "oat": "a grain often cooked and eaten for breakfast",
  "barley": "a grain used in soups and drinks",
  "fruit": "a sweet food that grows on plants and has seeds",
  "vegetable": "a plant food, like carrots or broccoli, that is not sweet",
  "table": "a flat piece of furniture with legs, used for eating or working",
  "bed": "a piece of furniture you sleep on",
  "sofa": "a long soft seat for more than one person",
  "couch": "another word for a soft seat you relax on",
  "pillow": "a soft cushion you rest your head on",
  "blanket": "a soft cloth cover used to stay warm",
  "sheet": "a thin cloth cover placed on a bed",
  "mattress": "the soft padded part of a bed you lie on",
  "lamp": "an object that gives off light",
  "window": "an opening in a wall covered with glass to let in light",
  "door": "a moving barrier used to enter or leave a room",
  "wall": "the side of a room or building that stands up",
  "floor": "the bottom surface of a room you walk on",
  "ceiling": "the top inside surface of a room",
  "roof": "the top covering of a house",
  "stairs": "a set of steps that go up or down",
  "mirror": "a shiny glass surface that shows your reflection",
  "rug": "a soft covering placed on part of the floor",
  "carpet": "a thick soft covering that covers a whole floor",
  "curtain": "a piece of cloth that covers a window",
  "shelf": "a flat surface used to hold or store things",
  "cupboard": "a small cabinet used to store dishes or food",
  "cabinet": "a piece of furniture with doors used for storage",
  "drawer": "a sliding box built into furniture for storing things",
  "closet": "a small room used to store clothes",
  "wardrobe": "a tall cabinet used to hang and store clothes",
  "bookshelf": "a piece of furniture used to hold books",
  "television": "a screen that shows shows and movies",
  "remote": "a small device used to control a television from far away",
  "telephone": "a device used to talk to people who are far away",
  "printer": "a machine that puts words or pictures onto paper",
  "refrigerator": "a large appliance that keeps food cold",
  "freezer": "an appliance that keeps food frozen",
  "stove": "an appliance used to cook food with heat",
  "oven": "an appliance used to bake food",
  "microwave": "an appliance that heats food quickly",
  "toaster": "a small appliance used to toast bread",
  "blender": "an appliance used to mix or crush food into liquid",
  "kettle": "a container used to heat water",
  "faucet": "a device that controls water flow from a pipe",
  "bathtub": "a large tub used for washing your whole body",
  "toilet": "a bathroom fixture used to get rid of waste",
  "towel": "a piece of cloth used to dry yourself",
  "soap": "a substance used with water to clean things",
  "toothbrush": "a small brush used to clean your teeth",
  "toothpaste": "a paste used with a toothbrush to clean teeth",
  "broom": "a tool with bristles used to sweep floors",
  "vacuum": "a machine that sucks up dirt and dust from floors",
  "bucket": "a round container with a handle used to carry things",
  "trash can": "a container used to hold garbage",
  "basket": "a container made of woven material used to hold things",
  "box": "a container, usually made of cardboard, used to store things",
  "bag": "a container made of soft material used to carry things",
  "suitcase": "a case used to carry clothes when traveling",
  "wallet": "a small case used to carry money and cards",
  "purse": "a bag used to carry personal items",
  "key": "a small metal tool used to lock or unlock things",
  "candle": "a stick of wax with a wick that burns for light",
  "flashlight": "a small handheld light powered by batteries",
  "battery": "a small object that stores power for devices",
  "plug": "a device used to connect something to electricity",
  "cord": "a long thin wire used to carry electricity",
  "picture": "a drawing, painting, or photo of something",
  "frame": "a border that holds a picture in place",
  "photograph": "a picture taken with a camera",
  "camera": "a device used to take pictures",
  "magazine": "a thin printed publication with articles and pictures",
  "newspaper": "printed sheets with daily news stories",
  "envelope": "a paper cover used to hold and mail a letter",
  "plate": "a flat dish used to hold food",
  "bowl": "a round deep dish used to hold food",
  "cup": "a small container used for drinking",
  "mug": "a cup with a handle used for hot drinks",
  "glass": "a clear container used for drinking",
  "fork": "a utensil with prongs used to pick up food",
  "spoon": "a utensil with a small bowl shape used for eating",
  "knife": "a utensil with a blade used for cutting food",
  "napkin": "a piece of cloth or paper used to wipe your mouth",
  "tablecloth": "a cloth covering placed on top of a table",
  "jar": "a glass or plastic container with a lid",
  "bottle": "a narrow container used to hold liquid",
  "can": "a metal container used to hold food or drinks",
  "pot": "a deep round container used for cooking",
  "pan": "a shallow container used for cooking food",
  "tray": "a flat container used to carry food or objects",
  "clothesline": "a rope or wire used to hang clothes to dry",
  "hanger": "a hooked tool used to hang clothes",
  "washing machine": "an appliance used to clean clothes",
  "dryer": "an appliance that dries clothes with warm air",
  "ladder": "a set of steps used to reach high places",
  "nail": "a thin metal spike used to hold things together",
  "screw": "a metal fastener with grooves that twists into place",
  "screwdriver": "a tool used to turn screws",
  "wrench": "a tool used to turn nuts and bolts",
  "toolbox": "a box used to store and carry tools",
  "rope": "a thick strong cord used for tying or pulling",
  "string": "a thin cord used to tie or hold things",
  "fan": "a device that moves air to cool a room",
  "heater": "a device that warms up a room",
  "thermostat": "a device used to control the temperature in a room",
  "switch": "a device used to turn something on or off",
  "socket": "a place where an electrical plug connects",
  "compass": "a tool that shows which direction is north",
  "binoculars": "a tool used to see faraway things up close",
  "telescope": "a tool used to look at faraway objects like stars",
  "magnifying glass": "a tool with a lens that makes things look bigger",
  "puzzle": "a game with pieces that fit together to form a picture",
  "toy": "an object children play with for fun",
  "doll": "a toy made to look like a person",
  "teddy bear": "a soft stuffed toy shaped like a bear",
  "blocks": "small toy pieces used to build things",
  "balloon": "a rubber bag that is filled with air and floats",
  "kite": "a light frame covered with paper or cloth flown in the wind",
  "crib": "a small bed with high sides for a baby",
  "cradle": "a small bed that rocks, used for babies",
  "stroller": "a wheeled seat used to push a baby around",
  "mailbox": "a box where mail is delivered",
  "shirt": "a piece of clothing worn on the upper body",
  "t-shirt": "a soft short sleeved shirt with no buttons",
  "pants": "clothing that covers the legs separately",
  "jeans": "pants made from a strong blue cotton fabric",
  "shorts": "pants that end above the knee",
  "skirt": "a piece of clothing that hangs down from the waist",
  "dress": "a piece of clothing that covers the body and legs in one piece",
  "jacket": "a piece of clothing worn over a shirt for warmth",
  "coat": "a long piece of clothing worn outside for warmth",
  "sweater": "a warm knitted piece of clothing worn on top",
  "hoodie": "a sweater with a hood attached",
  "vest": "a sleeveless piece of clothing worn over a shirt",
  "suit": "a matching jacket and pants worn for formal events",
  "tie": "a strip of cloth worn around the neck with a shirt",
  "scarf": "a strip of cloth worn around the neck for warmth",
  "gloves": "clothing worn to cover and warm the hands",
  "mittens": "hand coverings with one section for fingers and one for the thumb",
  "hat": "a covering worn on the head",
  "cap": "a soft hat that often has a brim in front",
  "beanie": "a soft knitted hat that covers the head",
  "helmet": "a hard hat that protects your head",
  "socks": "soft coverings worn on the feet inside shoes",
  "shoes": "coverings worn on the feet for walking",
  "sneakers": "comfortable shoes used for sports or everyday wear",
  "boots": "sturdy shoes that cover the foot and ankle or leg",
  "sandals": "light open shoes worn in warm weather",
  "slippers": "soft comfortable shoes worn indoors",
  "flip-flops": "simple sandals held on by a strap between the toes",
  "pajamas": "comfortable clothes worn for sleeping",
  "underwear": "clothing worn underneath other clothes",
  "swimsuit": "clothing worn for swimming",
  "bikini": "a two piece swimsuit",
  "poncho": "a piece of clothing with a hole for your head, worn over the body",
  "apron": "a piece of clothing worn over clothes to keep them clean while cooking",
  "belt": "a strap worn around the waist to hold up pants",
  "buckle": "a fastener used to close a belt or strap",
  "button": "a small round fastener used to close clothing",
  "zipper": "a fastener with teeth used to open and close clothing",
  "pocket": "a small fabric pouch sewn into clothing to hold things",
  "sleeve": "the part of a shirt that covers the arm",
  "collar": "the part of a shirt that goes around the neck",
  "hood": "a piece of fabric attached to a jacket that covers the head",
  "cuff": "the end part of a sleeve near the wrist",
  "glasses": "lenses worn over the eyes to help you see",
  "bracelet": "a piece of jewelry worn around the wrist",
  "necklace": "a piece of jewelry worn around the neck",
  "earrings": "jewelry worn on the ears",
  "jewelry": "decorative items, like rings and necklaces, worn on the body",
  "bowtie": "a necktie shaped like a small bow",
  "cardigan": "a sweater that opens down the front like a jacket",
  "blouse": "a light shirt often worn as part of an outfit",
  "overalls": "pants with a top part held up by straps",
  "leggings": "tight stretchy pants that cover the legs",
  "tights": "thin stretchy clothing that covers the legs",
  "robe": "a loose piece of clothing worn over other clothes, often after a bath",
  "costume": "special clothing worn to look like someone else",
  "tuxedo": "a formal suit often worn to fancy events",
  "gown": "a long formal dress",
  "mask": "a covering worn over the face",
  "earmuffs": "soft pads worn over the ears to keep them warm",
  "wristband": "a band worn around the wrist, often during sports",
  "shoelace": "a string used to tie shoes closed",
  "sole": "the bottom part of a shoe that touches the ground",
  "fabric": "the cloth material that clothes are made from",
  "hem": "the folded edge at the bottom of clothing",
  "soccer": "a sport where players kick a ball into a goal",
  "basketball": "a sport where players throw a ball through a hoop",
  "baseball": "a sport played with a bat and a ball on a diamond shaped field",
  "football": "a sport where teams try to carry or throw a ball into an end zone",
  "tennis": "a sport where players hit a ball over a net with rackets",
  "golf": "a sport where players hit a small ball into holes using clubs",
  "hockey": "a sport where players use sticks to hit a puck or ball into a goal",
  "volleyball": "a sport where players hit a ball over a net with their hands",
  "swimming": "moving through water using your arms and legs",
  "running": "moving quickly on foot",
  "jogging": "running at a slow steady pace for exercise",
  "biking": "riding a bicycle",
  "cycling": "the sport or activity of riding a bike",
  "skating": "moving smoothly on skates",
  "skateboarding": "riding and doing tricks on a skateboard",
  "surfing": "riding on a wave using a board",
  "skiing": "sliding down snow on long skis",
  "snowboarding": "sliding down snow while standing on a board",
  "sledding": "riding down a snowy hill on a sled",
  "bowling": "a game where you roll a ball to knock down pins",
  "wrestling": "a sport where two people try to pin each other to the ground",
  "boxing": "a sport where two people wearing padded gloves compete against each other",
  "karate": "a martial art that teaches balance, focus, and self defense moves",
  "gymnastics": "a sport involving flips, balance, and flexible movements",
  "ballet": "a graceful style of dance often performed on stage",
  "yoga": "gentle stretching exercises that help with balance and calm",
  "hiking": "walking long distances outdoors, often on trails",
  "camping": "sleeping outdoors, often in a tent",
  "fishing": "trying to catch fish using a rod or net",
  "geocaching": "a hobby of using a device to find hidden containers outdoors",
  "climbing": "using your hands and feet to go up something tall",
  "rock climbing": "climbing up rocks or a climbing wall using ropes and holds",
  "archery": "a sport of shooting arrows at a target using a bow",
  "darts": "a game where players throw small pointed objects at a target",
  "billiards": "a game played by hitting balls with a cue on a table",
  "ping pong": "a game played by hitting a small ball across a table with paddles",
  "badminton": "a sport where players hit a shuttlecock over a net with rackets",
  "rugby": "a sport where players carry and pass an oval ball to score",
  "track and field": "a sport that includes running, jumping, and throwing events",
  "marathon": "a very long race, usually twenty six miles",
  "relay": "a race where team members take turns running part of the distance",
  "stretching": "moving your muscles to make them more flexible",
  "sketching": "drawing a quick simple picture",
  "sculpting": "shaping material, like clay, into a form",
  "pottery": "the craft of making objects out of clay",
  "knitting": "making clothing or blankets by looping yarn together with needles",
  "sewing": "joining fabric together using thread and a needle",
  "crocheting": "making fabric by looping yarn with a hooked needle",
  "origami": "the art of folding paper into shapes",
  "scrapbooking": "making a book of photos and mementos",
  "photography": "the hobby of taking pictures",
  "singing": "making music with your voice",
  "instrument": "an object used to make music, like a guitar or piano",
  "guitar": "a stringed instrument played by plucking or strumming",
  "piano": "a large instrument played by pressing keys",
  "drums": "an instrument played by hitting it with sticks or hands",
  "violin": "a small stringed instrument played with a bow",
  "flute": "a thin instrument played by blowing across a hole",
  "trumpet": "a brass instrument played by buzzing your lips into it",
  "collecting": "gathering and keeping items of one kind, like stamps or coins",
  "gardening": "growing and taking care of plants",
  "cooking": "preparing food by following steps and using heat",
  "baking": "cooking food, especially bread and desserts, in an oven",
  "chess": "a board game played with pieces that move in special ways",
  "checkers": "a board game played by jumping over the other player's pieces",
  "cards": "a game played using a deck of printed cards",
  "board game": "a game played on a printed board with movable pieces",
  "video game": "a game played using a screen and a controller",
  "juggling": "tossing and catching several objects at once",
  "magic tricks": "performing illusions that seem impossible",
  "acting": "performing as a character in a play or movie",
  "theater": "a place where plays and performances happen",
  "whittling": "carving shapes out of wood with a knife",
  "woodworking": "the hobby of building things out of wood",
  "birdwatching": "the hobby of observing wild birds",
  "stargazing": "the hobby of looking at stars in the night sky",
  "kayaking": "paddling a small narrow boat called a kayak",
  "canoeing": "paddling a lightweight boat called a canoe",
  "rowing": "moving a boat through water using oars",
  "sailing": "traveling on water in a boat powered by wind and sails",
  "diving": "jumping into water headfirst, or swimming underwater",
  "snorkeling": "swimming near the surface of water using a breathing tube",
  "rollerblading": "skating on shoes with a single line of wheels",
  "trampoline": "a bouncy surface used for jumping",
  "frisbee": "a flying disc thrown and caught for fun",
  "jump rope": "a game where you jump over a swinging rope",
  "hopscotch": "a game where players hop through a pattern drawn on the ground",
  "tag": "a game where one player chases and tries to touch others",
  "hide and seek": "a game where players hide while one player searches for them",
  "tug of war": "a game where two teams pull on opposite ends of a rope",
  "referee": "a person who makes sure players follow the rules of a game",
  "score": "the number of points earned in a game",
  "goal": "the target players try to hit or reach to score points",
  "stadium": "a large building where sports events are held",
  "court": "a marked area used to play sports like basketball or tennis",
  "pool": "a large container of water used for swimming",
  "equipment": "the tools or items needed to do an activity",
  "ball": "a round object used in many games and sports",
  "racket": "a tool with strings used to hit a ball in tennis",
  "net": "a mesh used in sports like soccer or volleyball to catch or block a ball",
  "skateboard": "a board with wheels used for skateboarding",
  "tall": "having a greater height than most people or things",
  "short": "not tall; small in height",
  "shiny": "bright and reflecting light",
  "huge": "extremely large in size",
  "tiny": "very small in size",
  "giant": "much bigger than the usual size",
  "wide": "measuring a lot from one side to the other",
  "narrow": "not wide; thin from side to side",
  "thick": "having a large distance between its two sides",
  "thin": "not thick; having very little width",
  "heavy": "weighing a lot",
  "light": "not heavy; weighing very little",
  "fast": "moving or able to move very quickly",
  "slow": "moving at a low speed",
  "fresh": "newly made, picked, or gathered",
  "dirty": "covered with dirt or mess",
  "sour": "having a sharp, tangy taste like a lemon",
  "bitter": "having a sharp, unpleasant taste",
  "salty": "tasting like salt",
  "spicy": "having a strong, hot taste",
  "delicious": "tasting very good",
  "tasty": "having a pleasant flavor",
  "gross": "very unpleasant or disgusting",
  "beautiful": "very pleasing to look at",
  "pretty": "nice and pleasant to look at",
  "ugly": "unpleasant to look at",
  "handsome": "good-looking, especially for a man or boy",
  "cute": "pleasant, sweet, and attractive",
  "adorable": "extremely lovable and charming",
  "funny": "causing people to laugh",
  "serious": "thoughtful and not joking around",
  "wild": "living or growing in nature, not tame",
  "fierce": "very strong, intense, or angry",
  "lazy": "not wanting to work or move",
  "active": "always busy moving or doing things",
  "awake": "not asleep",
  "smart": "able to learn and think well",
  "clumsy": "awkward and likely to trip or drop things",
  "graceful": "moving in a smooth, beautiful way",
  "elegant": "stylish and graceful in appearance",
  "fancy": "decorated and not plain or simple",
  "plain": "simple, with no decoration",
  "ordinary": "normal and not special in any way",
  "special": "better or more important than usual",
  "unique": "being the only one of its kind",
  "common": "found or happening very often",
  "rare": "not found or happening very often",
  "magical": "having special powers, like in a story",
  "mysterious": "hard to understand or explain",
  "spooky": "a little scary, like a ghost story",
  "scary": "causing a feeling of fear",
  "creepy": "causing a nervous, uneasy feeling",
  "strange": "unusual or surprising",
  "weird": "very strange or odd",
  "odd": "not usual or expected",
  "normal": "usual and what people expect",
  "unusual": "not common or ordinary",
  "familiar": "well known to you already",
  "distant": "far away in space or time",
  "nearby": "close in distance",
  "deep": "going far down from the top",
  "shallow": "not deep at all",
  "steep": "rising or falling very sharply",
  "flat": "smooth and level, without bumps",
  "round": "shaped like a circle or a ball",
  "square": "having four equal straight sides",
  "straight": "not bent or curved at all",
  "crooked": "bent or twisted, not straight",
  "curly": "having curls or coils",
  "wavy": "having gentle curves, like ocean waves",
  "spiky": "having many sharp points",
  "fluffy": "light, soft, and puffy like a cloud",
  "fuzzy": "covered with soft, fine hair",
  "furry": "covered in soft fur",
  "scaly": "covered in small, hard scales",
  "slippery": "hard to hold onto or stand on",
  "sticky": "able to stick to other things",
  "slimy": "covered in wet, slippery goo",
  "crunchy": "making a crisp sound when you bite it",
  "crispy": "firm and crunchy, especially food",
  "chewy": "needing a lot of chewing to eat",
  "juicy": "full of juice",
  "ripe": "fully grown and ready to eat",
  "rotten": "spoiled and no longer good to eat",
  "stale": "no longer fresh",
  "full": "holding as much as it can",
  "crowded": "filled with many people or things",
  "spacious": "having a lot of open room",
  "cramped": "too small and tight for comfort",
  "cozy": "warm, snug, and comfortable",
  "comfortable": "giving a pleasant, easy feeling",
  "dangerous": "likely to cause harm",
  "tricky": "hard to do or figure out",
  "easy": "not hard to do",
  "difficult": "hard to do or understand",
  "complicated": "having many confusing parts",
  "confusing": "hard to understand clearly",
  "boiling": "extremely hot",
  "soft": "smooth and pleasant to touch",
  "hard": "firm and solid, not soft",
  "smooth": "having an even surface with no bumps",
  "rough": "having an uneven, bumpy surface",
  "sharp": "having a thin edge that can cut",
  "dull": "not sharp; also not very interesting",
  "bright": "full of light or strong color",
  "dark": "having little or no light",
  "colorful": "having many bright, cheerful colors",
  "nosy": "too curious about other people's business",
  "traditional": "done the same way for a long time",
  "gigantic": "extremely large",
  "miniature": "a very small copy of something",
  "enormous": "extremely large in size",
  "massive": "very large and heavy",
  "lightweight": "not heavy; easy to carry",
  "flimsy": "weak and easily broken or bent",
  "sturdy": "strongly and solidly built",
  "fragile": "easily broken or damaged",
  "durable": "able to last a long time without breaking",
  "antique": "old and often valuable",
  "vintage": "made a long time ago, often prized",
  "shabby": "old and worn-out looking",
  "messy": "untidy and disorganized",
  "organized": "arranged in a clear, orderly way",
  "chaotic": "very confused and disorganized",
  "noisy": "making a lot of loud sound",
  "talkative": "liking to talk a lot",
  "stubborn": "refusing to change your mind",
  "trustworthy": "able to be trusted",
  "obedient": "willing to follow rules or instructions",
  "talented": "naturally good at doing something",
  "skillful": "very good at doing something",
  "gifted": "having a special natural talent",
  "famous": "known and recognized by many people",
  "popular": "liked by a lot of people",
  "wealthy": "having a lot of money",
  "poor": "having very little money",
  "stern": "strict and very serious",
  "strict": "demanding that rules be followed closely",
  "flexible": "able to bend or change easily",
  "rigid": "stiff and unable to bend",
  "vast": "extremely large in area",
  "endless": "seeming to have no end",
  "infinite": "without any limit or end",
  "brief": "lasting only a short time",
  "lengthy": "taking a long time",
  "sudden": "happening quickly and without warning",
  "gradual": "happening slowly, little by little",
  "gravity": "the force that pulls things down toward the ground",
  "skeleton": "the frame of bones inside your body",
  "oxygen": "a gas in the air that people need to breathe",
  "muscle": "body tissue that helps you move",
  "brain": "the organ in your head that controls your body",
  "heart": "the organ that pumps blood through your body",
  "lungs": "the organs you use to breathe air",
  "blood": "the red liquid that flows through your body",
  "bone": "one of the hard parts of your skeleton",
  "skin": "the outer covering of your body",
  "nerve": "a thin fiber that carries messages in your body",
  "cell": "the tiny building block that makes up living things",
  "atom": "a very tiny piece of matter",
  "molecule": "a tiny group of atoms joined together",
  "energy": "the power needed to do work or make things move",
  "force": "a push or a pull on an object",
  "magnet": "an object that pulls certain metals toward it",
  "electricity": "a form of energy that powers lights and machines",
  "matter": "anything that takes up space and has weight",
  "liquid": "a substance that flows, like water",
  "solid": "a substance that keeps its own shape",
  "gas": "a substance that spreads out to fill its space",
  "orbit": "the curved path something takes around another object",
  "comet": "a ball of ice and dust that orbits the sun",
  "asteroid": "a large rocky object that orbits the sun",
  "microscope": "a tool used to see very tiny things",
  "evolution": "how living things slowly change over a long time",
  "environment": "the natural world around us",
  "weather": "what it is like outside, like sunny or rainy",
  "earthquake": "a sudden shaking of the ground",
  "photosynthesis": "the way plants make food using sunlight",
  "digestion": "how your body breaks down food for energy",
  "stomach": "the body part that digests your food",
  "intestine": "the long tube that helps digest your food",
  "kidney": "an organ that cleans waste out of your blood",
  "liver": "an organ that helps clean your blood",
  "spine": "the row of bones down the middle of your back",
  "rib": "one of the curved bones that protect your chest",
  "joint": "a place where two bones meet and can bend",
  "tendon": "a strong cord that connects muscle to bone",
  "tissue": "a group of similar cells in the body",
  "organ": "a body part that does a special job",
  "artery": "a tube that carries blood away from your heart",
  "vein": "a tube that carries blood back to your heart",
  "pulse": "the beat you feel as your heart pumps blood",
  "breath": "the air you take in and let out",
  "germ": "a tiny living thing that can make you sick",
  "vaccine": "a shot that helps protect you from getting sick",
  "vitamin": "something in food that helps keep you healthy",
  "protein": "a nutrient that helps build your muscles",
  "nutrient": "something in food that helps your body grow",
  "friction": "a force that slows down moving objects",
  "magnetism": "the force that pulls certain metals together",
  "velocity": "how fast something moves in a certain direction",
  "mass": "the amount of matter something has",
  "weight": "how heavy something is",
  "density": "how tightly packed the matter in something is",
  "circuit": "a loop that electricity can flow through",
  "engine": "a machine that makes power to move something",
  "fuel": "something burned to make energy, like gasoline",
  "solar": "having to do with the sun",
  "hydrogen": "a light gas that is part of water",
  "carbon": "an element found in all living things",
  "nitrogen": "a gas that makes up most of the air",
  "helium": "a light gas often used to fill balloons",
  "element": "a basic substance that cannot be broken down further",
  "chemical": "a substance used in or made by chemistry",
  "reaction": "a change that happens when substances mix together",
  "mixture": "two or more things combined together",
  "fossil": "the preserved remains of an ancient living thing",
  "dinosaur": "a huge reptile that lived millions of years ago",
  "extinct": "no longer existing anywhere on Earth",
  "vertebrate": "an animal that has a backbone",
  "invertebrate": "an animal that does not have a backbone",
  "larva": "the young form of an insect before it changes",
  "metamorphosis": "a big change in form, like caterpillar to butterfly",
  "gene": "a tiny part that passes traits from parents to children",
  "eyesight": "the ability to see",
  "hearing": "the ability to hear sounds",
  "reflex": "a quick, automatic response of your body",
  "sense": "a way your body learns about the world, like sight",
  "organism": "any living thing",
  "bacteria": "tiny living things too small to see alone",
  "antibody": "something in your blood that fights off germs",
  "immune": "able to resist catching a certain sickness",
  "skull": "the bones that protect your brain",
  "tooth": "a hard white part in your mouth used for chewing",
  "tongue": "the part in your mouth used for tasting and talking",
  "throat": "the tube inside your neck used for breathing and eating",
  "eardrum": "a thin part inside your ear that helps you hear",
  "pupil": "the dark center of your eye that lets in light",
  "retina": "the part inside your eye that senses light",
  "elbow": "the joint in the middle of your arm",
  "knee": "the joint in the middle of your leg",
  "wrist": "the joint that connects your hand to your arm",
  "ankle": "the joint that connects your foot to your leg",
  "shoulder": "the joint that connects your arm to your body",
  "pendulum": "a weight that swings back and forth",
  "lever": "a bar used to lift or move heavy things",
  "pulley": "a wheel with a rope used to help lift things",
  "wheel": "a round object that turns to help things move",
  "axle": "a rod that a wheel spins around",
  "satellite": "an object that orbits a planet in space",
  "echo": "a sound that repeats after bouncing off something",
  "vibration": "a fast back-and-forth shaking movement",
  "airport": "a place where airplanes take off and land",
  "bicycle": "a two-wheeled vehicle that you pedal to move",
  "car": "a vehicle with wheels used to travel on roads",
  "taxi": "a car you pay to drive you somewhere",
  "subway": "a train system that runs mostly underground",
  "airplane": "a flying vehicle with wings and engines",
  "helicopter": "a flying vehicle with spinning blades on top",
  "boat": "a small vehicle used to travel on water",
  "ship": "a large vehicle used to travel on water",
  "ferry": "a boat that carries people and cars across water",
  "submarine": "a vehicle that can travel underwater",
  "rocket": "a vehicle that blasts off into space",
  "spaceship": "a vehicle used for traveling through space",
  "truck": "a large vehicle used to carry heavy things",
  "van": "a boxy vehicle used to carry people or goods",
  "motorcycle": "a two-wheeled vehicle powered by an engine",
  "scooter": "a small vehicle you stand on and ride",
  "wagon": "a small cart with wheels that is pulled or pushed",
  "sled": "a vehicle used to slide over snow",
  "canoe": "a narrow boat that you paddle",
  "kayak": "a small narrow boat for one or two paddlers",
  "sailboat": "a boat that moves using wind caught in its sails",
  "yacht": "a large, fancy boat used for pleasure trips",
  "tractor": "a farm vehicle used to pull heavy equipment",
  "bulldozer": "a machine used to push dirt and clear land",
  "ambulance": "a vehicle that rushes sick or hurt people to a hospital",
  "station": "a place where trains or buses stop for passengers",
  "terminal": "a building where travelers begin or end a trip",
  "runway": "a long strip where airplanes take off and land",
  "harbor": "a sheltered place where boats can dock safely",
  "port": "a place where ships load and unload",
  "dock": "a platform where boats are tied up",
  "pier": "a structure that sticks out over the water",
  "bridge": "a structure built to cross over a river or road",
  "tunnel": "a passage dug through a hill or under the ground",
  "highway": "a wide main road built for fast travel",
  "road": "a path made for vehicles to travel on",
  "street": "a road in a town or city, often with buildings",
  "avenue": "a wide street, often lined with trees",
  "intersection": "a place where two roads cross each other",
  "crosswalk": "a marked path where people can cross a street",
  "sidewalk": "a paved path for walking beside a street",
  "garage": "a building used to park or fix vehicles",
  "school": "a place where children go to learn",
  "hospital": "a place where sick or hurt people are treated",
  "museum": "a place that displays interesting or old objects",
  "park": "an outdoor place with grass and trees for fun",
  "restaurant": "a place where people go to eat meals",
  "cafe": "a small restaurant that serves drinks and light food",
  "bakery": "a shop that makes and sells bread and cakes",
  "market": "a place where people buy and sell goods",
  "supermarket": "a large store that sells food and household items",
  "mall": "a large building filled with many shops",
  "store": "a place where you can buy things",
  "shop": "a small place where things are sold",
  "bank": "a place where people keep and manage their money",
  "church": "a building where people go to worship",
  "temple": "a building used for worship in some religions",
  "castle": "a large, strong building where royalty once lived",
  "palace": "a grand house where a king or queen lives",
  "apartment": "a set of rooms for living inside a bigger building",
  "house": "a building where people live",
  "cottage": "a small, cozy house, often in the country",
  "cabin": "a small, simple house, often made of wood",
  "skyscraper": "a very tall building found in big cities",
  "factory": "a building where things are made by machines",
  "warehouse": "a large building used to store goods",
  "office": "a room or building where people work at desks",
  "arena": "a large space used for sports or shows",
  "campsite": "an outdoor place set up for camping",
  "hotel": "a building where travelers pay to stay overnight",
  "lighthouse": "a tower with a light that guides ships",
  "gas station": "a place where cars stop to fill up on fuel",
  "parking lot": "an open area where cars are parked",
  "fire station": "a place where firefighters and fire trucks stay",
  "police station": "a place where police officers work",
  "courthouse": "a building where legal cases are decided",
  "post office": "a place where mail is sent and collected",
  "firetruck": "a truck that carries firefighters and their equipment",
  "platform": "a raised area where people wait for a train",
  "cruise ship": "a large ship used for vacation trips",
  "glider": "an aircraft that flies without an engine",
  "hot air balloon": "a large balloon that carries people through the sky",
  "raft": "a flat floating structure used to travel on water",
  "trolley": "a vehicle that runs on rails through city streets",
  "carriage": "a vehicle pulled by horses to carry people",
  "wheelchair": "a chair with wheels for people who cannot walk",
  "elevator": "a moving box that carries people between floors",
  "escalator": "a moving staircase that carries people up or down",
  "driveway": "a path leading up to a house for cars",
  "alley": "a narrow passage between or behind buildings",
  "courtyard": "an open space surrounded by buildings or walls",
  "barn": "a farm building used to store crops or shelter animals",
  "greenhouse": "a glass building used to grow plants",
  "observatory": "a building used to study the stars and sky",
  "planetarium": "a place that shows what the night sky looks like",
  "amusement park": "a park with rides and games for fun",
  "carnival": "a fun outdoor event with rides and games",
  "ache": "a dull pain in part of your body",
  "acid": "a sour or sharp chemical substance",
  "across": "from one side of something to the other",
  "act": "to do something, or to perform in a play",
  "action": "something that is done or that happens",
  "activity": "something you do, especially for fun",
  "actual": "real, not imagined or pretend",
  "adapt": "to change so you fit a new situation",
  "add": "to put numbers or things together",
  "address": "the place where someone lives",
  "adjust": "to change something slightly to make it right",
  "admire": "to think very highly of someone or something",
  "admit": "to say that something is true",
  "adopt": "to take a child or animal into your family",
  "advance": "to move forward",
  "adventure": "an exciting trip or experience",
  "advice": "a helpful suggestion about what to do",
  "advise": "to give someone advice",
  "afford": "to have enough money to pay for something",
  "afloat": "floating on top of water",
  "again": "one more time",
  "against": "touching or opposite to something",
  "age": "how many years old someone is",
  "agent": "a person who does business for someone else",
  "agile": "able to move quickly and easily",
  "ahead": "in front, or further along",
  "aid": "help given to someone in need",
  "aim": "to point something carefully at a target",
  "air": "the invisible gas all around us that we breathe",
  "airbag": "a bag that fills with air to protect people in a crash",
  "aircraft": "a machine that can fly, like a plane",
  "airline": "a company that flies passenger planes",
  "aisle": "a narrow path between rows of seats or shelves",
  "album": "a book or collection for photos or songs",
  "alert": "watchful and paying close attention",
  "algebra": "a kind of math that uses letters to stand for numbers",
  "alien": "a creature that comes from another planet",
  "alike": "very similar to something else",
  "alive": "having life, not dead",
  "all": "every single one of something",
  "allergy": "a reaction that makes you feel sick from certain things",
  "allow": "to let someone do something",
  "allowance": "money given to someone regularly, often to a child",
  "almost": "very close to, but not quite",
  "alone": "by yourself, without other people",
  "along": "moving beside or through something",
  "aloud": "spoken so that other people can hear it",
  "alphabetical": "arranged in the order of the alphabet",
  "already": "before now, or sooner than expected",
  "also": "in addition, too",
  "although": "even though",
  "altitude": "how high something is above the ground",
  "altogether": "completely, or all together",
  "aluminum": "a light, shiny metal used to make cans",
  "amaze": "to surprise someone a whole lot",
  "ambition": "a strong wish to achieve something",
  "among": "surrounded by, or in the middle of a group",
  "amount": "how much of something there is",
  "anagram": "a word made by mixing up the letters of another word",
  "anchor": "a heavy object that keeps a boat from drifting away",
  "ancestor": "a family member who lived a long time ago",
  "angel": "a heavenly being often shown with wings",
  "angle": "the space between two lines that meet at a point",
  "animal": "a living creature that is not a plant",
  "announce": "to say something out loud so everyone knows",
  "announcer": "a person who announces things, like on TV",
  "another": "one more, or a different one",
  "antenna": "a thin rod that picks up radio or TV signals",
  "anthem": "a special song for a country or group",
  "any": "some, no matter which one",
  "anybody": "any person at all",
  "anyone": "any person",
  "anything": "any thing at all",
  "anyway": "no matter what happens",
  "anywhere": "any place at all",
  "apart": "separated, not together",
  "ape": "a large animal like a gorilla or chimpanzee",
  "apparent": "easy to see or understand",
  "appeal": "to ask for something, or to seem attractive",
  "appear": "to become visible or come into sight",
  "appetite": "a feeling of wanting to eat",
  "appetizer": "a small food served before the main meal",
  "applause": "clapping to show you liked something",
  "appliance": "a machine used at home, like a toaster",
  "apply": "to put something on, or to ask for something formally",
  "appoint": "to choose someone for a job",
  "appreciate": "to be thankful for something",
  "apprentice": "a person learning a skill from an expert",
  "approach": "to come closer to something",
  "appropriate": "right or suitable for the situation",
  "approve": "to agree that something is good",
  "aquatic": "living or happening in water",
  "arcade": "a place with games you can play for fun",
  "arch": "a curved shape, like part of a bridge",
  "area": "the amount of space something takes up",
  "arid": "very dry, with little or no rain",
  "arithmetic": "math with numbers, like adding and subtracting",
  "arm": "the body part between your shoulder and your hand",
  "armchair": "a comfortable chair with places to rest your arms",
  "armor": "metal clothing worn to protect against attack",
  "army": "a large group of soldiers",
  "aroma": "a pleasant smell",
  "around": "on all sides of something, or in a circle",
  "arrest": "to stop someone and hold them for breaking a law",
  "arrow": "a thin pointed stick shot from a bow",
  "artificial": "made by people, not found in nature",
  "artwork": "a piece of art, like a drawing or painting",
  "as": "a word used to compare two things",
  "ascend": "to climb or move upward",
  "ash": "the gray powder left after something burns",
  "ashore": "onto the beach or land, from the water",
  "aside": "to one side, out of the way",
  "asleep": "in a state of sleep",
  "asparagus": "a long green vegetable",
  "aspect": "one part or feature of something",
  "asphalt": "the black material used to pave roads",
  "assemble": "to put the parts of something together",
  "assist": "to help someone do something",
  "assistant": "a person whose job is to help someone",
  "assume": "to think something is true without checking",
  "asterisk": "a small star symbol used in writing",
  "astronomy": "the study of stars, planets, and space",
  "at": "a word that shows where something is",
  "ate": "the past form of the word eat",
  "athletic": "good at sports and physical activities",
  "atlas": "a book full of maps",
  "attach": "to join or connect one thing to another",
  "attack": "to try to hurt or damage something",
  "attempt": "to try to do something",
  "attend": "to go to an event or place",
  "attention": "careful watching or listening",
  "attic": "the space just under the roof of a house",
  "attitude": "the way someone thinks or feels about something",
  "attract": "to pull something toward you",
  "attractive": "pleasant to look at",
  "auction": "a public sale where people bid money for items",
  "audience": "the people watching a show or performance",
  "audio": "sound, especially recorded sound",
  "audiobook": "a book you listen to instead of read",
  "aurora": "colorful lights sometimes seen glowing in the night sky",
  "automatic": "working by itself without needing help",
  "automobile": "another word for a car",
  "available": "ready and able to be used",
  "avatar": "a small picture or character that represents you online",
  "average": "the usual or typical amount",
  "aviary": "a large cage or building where birds are kept",
  "aviation": "the activity of flying aircraft",
  "aviator": "a person who flies an aircraft",
  "avoid": "to stay away from something",
  "await": "to wait for something",
  "awaken": "to wake up from sleep",
  "aware": "knowing that something is happening",
  "away": "not here, or far off",
  "awesome": "amazing or very impressive",
  "awful": "very bad or unpleasant",
  "awhile": "for a short period of time",
  "awning": "a cover over a window or door that gives shade",
  "axe": "a tool with a sharp blade used to chop wood",
  "axis": "an imaginary line that something spins around",
  "azure": "a bright blue color, like a clear sky",
  "back": "The part of your body between your neck and legs.",
  "bad": "Not good, or not the way something should be.",
  "bald": "Having little or no hair on your head.",
  "band": "A group of people who play music together.",
  "bandage": "A strip of cloth used to cover and protect a cut.",
  "bang": "A loud, sudden noise.",
  "bar": "A long, straight piece of something, like metal or chocolate.",
  "bare": "Not covered by clothes or anything else.",
  "bargain": "Something you buy for a very good, low price.",
  "barrel": "A large, round container used to store things.",
  "base": "The bottom part that holds something up.",
  "basement": "A room built under the ground floor of a house.",
  "bath": "Washing your whole body while sitting in water.",
  "bathroom": "A room with a toilet, sink, and bathtub.",
  "battle": "A fight or contest between two people or teams.",
  "beam": "A long, thick piece of wood or metal that holds up a building.",
  "bead": "A small, round piece used to make jewelry.",
  "beard": "Hair that grows on a man's chin and cheeks.",
  "beat": "To win a game against someone, or to mix quickly with a spoon.",
  "became": "The word for what something turned into in the past.",
  "because": "A word used to explain the reason for something.",
  "become": "To start being something you were not before.",
  "bedroom": "A room in a house where someone sleeps.",
  "beep": "A short, high sound made by a machine.",
  "been": "A word used to talk about something that happened.",
  "beg": "To ask for something in a very strong, hopeful way.",
  "began": "The word for when something started in the past.",
  "behave": "To act in a polite and proper way.",
  "behind": "At the back of something, or after it.",
  "being": "Existing right now, or a living creature.",
  "believe": "To think that something is true.",
  "belly": "Your stomach, the middle part of your body.",
  "belong": "To be a member of a group, or owned by someone.",
  "below": "In a lower place than something else.",
  "bench": "A long seat where more than one person can sit.",
  "beneath": "Under or below something.",
  "berry": "A small, soft, round fruit that grows on a plant.",
  "beside": "Right next to something.",
  "best": "The most good, better than everything else.",
  "bet": "To guess and risk something small on being right.",
  "better": "More good than something else.",
  "between": "In the space that separates two things.",
  "beware": "To be careful because something might be dangerous.",
  "beyond": "Farther away than a certain point.",
  "big": "Large in size.",
  "bike": "A short way to say bicycle.",
  "bill": "Paper money, or the amount of money you owe.",
  "bin": "A container used to hold trash or other things.",
  "bind": "To tie or fasten things tightly together.",
  "bird": "An animal with feathers and wings that usually flies.",
  "birth": "The moment when a baby is born.",
  "biscuit": "A small, flat baked bread, like a cookie.",
  "bit": "A small piece or amount of something.",
  "black": "The darkest color, like the night sky.",
  "blade": "The flat, sharp part of a knife or tool.",
  "blame": "To say that someone caused something bad.",
  "blank": "Having nothing written or drawn on it.",
  "blast": "A sudden, strong burst of wind or noise.",
  "blaze": "A large, bright, burning fire.",
  "bleed": "When blood comes out through a cut in your skin.",
  "blend": "To mix different things together smoothly.",
  "bless": "To wish someone happiness, health, or good luck.",
  "blind": "Not able to see.",
  "block": "A solid chunk of something, or to stop something from passing.",
  "blond": "Having hair that is a very light, pale color.",
  "blow": "To push air out of your mouth strongly.",
  "blue": "The color of the sky on a clear day.",
  "blunt": "Not sharp, or very direct when speaking.",
  "blur": "Something that looks fuzzy and hard to see clearly.",
  "blush": "When your cheeks turn pink because you feel shy.",
  "board": "A flat piece of wood, or to step onto a bus or plane.",
  "boast": "To brag proudly about how great you are.",
  "body": "The whole physical shape of a person or animal.",
  "bolt": "A metal pin that holds things together, or to run away fast.",
  "bonus": "Something extra and good that you get.",
  "boo": "A sound people make to show they dislike something.",
  "boost": "To push, lift, or help something go higher.",
  "boot": "A shoe that covers your foot and part of your leg.",
  "border": "The line where one place ends and another begins.",
  "bore": "To make someone feel tired because something is dull.",
  "boring": "Not interesting or exciting at all.",
  "born": "To come into life for the first time.",
  "both": "The two of them together.",
  "bother": "To annoy or cause trouble for someone.",
  "bottom": "The lowest part of something.",
  "bound": "Tied up tightly, or to jump forward quickly.",
  "bow": "To bend forward to show respect, or a ribbon tied in loops.",
  "brace": "Something that supports and holds a body part steady.",
  "brag": "To talk too proudly about how good you are.",
  "braid": "Hair woven together into a rope-like shape.",
  "brake": "The part of a bike or car that slows it down.",
  "brand": "The name a company gives to the products it makes.",
  "brick": "A hard block used to build walls and houses.",
  "bride": "A woman on the day she gets married.",
  "brilliant": "Very smart, or shining very brightly.",
  "bring": "To carry something with you to a place.",
  "broad": "Wide from one side to the other.",
  "broke": "Having no money, or the past form of break.",
  "brown": "The color of dirt, wood, or coffee.",
  "buzz": "The humming sound an insect like a bee makes.",
  "dab": "to touch something lightly and quickly.",
  "dairy": "food like milk, cheese, and butter.",
  "damage": "harm done that breaks or hurts something.",
  "dam": "a wall built across a river to hold back water.",
  "dashboard": "the panel in a car with dials and switches.",
  "data": "information collected to learn or study something.",
  "deal": "an agreement between people about something.",
  "debate": "a discussion where people share different opinions.",
  "debt": "money that you owe to someone else.",
  "decimal": "a number written with a dot, like 2.5.",
  "decision": "a choice you make after thinking about it.",
  "deck": "a flat wooden platform outside a house.",
  "declare": "to say something clearly and firmly.",
  "decorate": "to make a place look nicer by adding things.",
  "decoration": "something used to make a place look pretty.",
  "deed": "an action that someone does.",
  "defeat": "to beat someone in a game or contest.",
  "defend": "to protect someone or something from harm.",
  "defense": "the act of protecting against attack.",
  "deflate": "to let the air out of something.",
  "delete": "to remove or erase something, like on a computer.",
  "delicate": "easily broken or damaged; needing gentle care.",
  "deliver": "to bring something to a person or place.",
  "demand": "to ask for something in a firm way.",
  "demolish": "to knock down and destroy a building.",
  "dense": "packed tightly together.",
  "dent": "a small dip made by hitting something.",
  "deny": "to say that something is not true.",
  "department": "a section of a store, school, or company.",
  "deposit": "money you put into a bank account.",
  "depth": "how deep something is.",
  "descend": "to go down from a higher place.",
  "describe": "to use words to tell what something is like.",
  "deserve": "to have earned or be worthy of something.",
  "desire": "a strong wish to have or do something.",
  "destination": "the place where someone is going.",
  "detail": "a small piece of information about something.",
  "detect": "to notice or discover something.",
  "detective": "a person who solves mysteries and crimes.",
  "develop": "to grow or change into something bigger or better.",
  "device": "a tool or machine made for a certain job.",
  "devour": "to eat something quickly because you are very hungry.",
  "diagonal": "a slanted line going from corner to corner.",
  "diagram": "a simple drawing that explains how something works.",
  "dial": "to turn or press numbers to call someone.",
  "dialogue": "a conversation between two or more people.",
  "diamond": "a hard, clear, sparkling gem.",
  "diaper": "soft padding babies wear to stay clean.",
  "diary": "a notebook where you write about your day.",
  "dice": "small cubes with dots used to play games.",
  "diet": "the food a person or animal usually eats.",
  "difference": "the way two things are not the same.",
  "differ": "to be not the same as something else.",
  "digest": "to break down food inside your body.",
  "digit": "a number from 0 to 9, or a finger.",
  "dim": "not bright; giving off little light.",
  "dimension": "the size of something, like its height or width.",
  "dime": "a small coin worth ten cents.",
  "dine": "to eat a meal.",
  "direct": "to show someone the way, or straight with no turns.",
  "direction": "the way you go to get somewhere.",
  "director": "a person in charge of making a movie or show.",
  "disagree": "to have a different opinion than someone else.",
  "disappear": "to go away so it can no longer be seen.",
  "disaster": "a sudden event that causes great damage.",
  "disco": "a place or party with dance music and flashing lights.",
  "discount": "money taken off the usual price.",
  "discuss": "to talk about something with other people.",
  "disease": "an illness that affects people, animals, or plants.",
  "disguise": "to dress up so people don't know who you are.",
  "dish": "a plate or bowl used for serving food.",
  "dishonest": "not telling the truth.",
  "dislike": "to not enjoy or want something.",
  "dismiss": "to send someone away or let them leave.",
  "disobey": "to not do what you are told.",
  "display": "to show something so people can see it.",
  "distance": "how far apart two things are.",
  "district": "a part of a city or country with a border.",
  "disturb": "to bother or interrupt someone.",
  "ditch": "a long narrow hole dug in the ground.",
  "divide": "to split something into smaller parts.",
  "division": "splitting a number or group into equal parts.",
  "dodge": "to quickly move out of the way of something.",
  "doghouse": "a small shelter built for a dog.",
  "dollar": "a unit of money used in many countries.",
  "dollhouse": "a small toy house for playing with dolls.",
  "dome": "a round roof shaped like half a ball.",
  "domino": "a small flat tile used to play games.",
  "donate": "to give something to help someone else.",
  "doodle": "to draw small pictures while thinking of other things.",
  "doorbell": "a button you press to make a sound at a door.",
  "doorknob": "the handle used to open a door.",
  "doorstep": "the step just outside a door.",
  "doorway": "the opening where a door is.",
  "dot": "a tiny round mark or spot.",
  "double": "twice as much, or two of something.",
  "doubt": "a feeling of not being sure about something.",
  "download": "to copy files from the internet onto your device.",
  "downstairs": "on or toward the lower floor of a building.",
  "downtown": "the central part of a city.",
  "down": "toward a lower place.",
  "dozen": "a group of twelve things.",
  "draft": "a rough first version of something written.",
  "dragon": "a giant, fire-breathing creature from stories.",
  "drain": "a pipe that carries water away.",
  "drama": "a play or story with exciting or serious events.",
  "drawbridge": "a bridge that can be raised or lowered.",
  "dread": "a strong feeling of fear about something coming.",
  "dreadful": "very bad or unpleasant.",
  "drench": "to make something completely wet.",
  "dresser": "a piece of furniture with drawers for clothes.",
  "dribble": "to bounce a ball again and again, or drip slowly.",
  "drift": "to move slowly, carried by wind or water.",
  "drip": "to fall in small drops.",
  "drone": "a flying robot controlled from the ground.",
  "drool": "to let saliva dribble out of your mouth.",
  "droop": "to bend or hang down weakly.",
  "drown": "to die or struggle because you cannot breathe underwater.",
  "drugstore": "a store that sells medicine and everyday items.",
  "drumstick": "a stick used to play a drum, or a chicken leg.",
  "dummy": "a fake or model version of something.",
  "dump": "to drop or throw something down all at once.",
  "dumpling": "a small ball of dough cooked in soup or steam.",
  "dungeon": "an underground room used as a prison in old castles.",
  "duplicate": "an exact copy of something.",
  "dusty": "covered with dust.",
  "duty": "something you must do because it is your job.",
  "duet": "a piece of music sung or played by two people.",
  "dwarf": "a very small person or creature in fairy tales.",
  "dye": "a liquid used to change the color of something.",
  "each": "every one of two or more things or people",
  "ear": "the part of your body you use to hear sounds",
  "earache": "a pain you feel inside your ear",
  "earn": "to get money or a reward for work you do",
  "earthworm": "a long thin worm that lives in soil",
  "ease": "to make something less difficult or less painful",
  "easel": "a wooden stand that holds a picture while you paint it",
  "easygoing": "calm and relaxed, and not easily upset",
  "east": "the direction where the sun rises in the morning",
  "eavesdrop": "to secretly listen to a conversation you're not part of",
  "eclipse": "when the sun or moon is blocked from view for a while",
  "edge": "the outer border or line where something ends",
  "edible": "safe and good to eat",
  "edit": "to fix or change something you have written",
  "education": "the process of learning things, usually at school",
  "eel": "a long thin fish shaped like a snake",
  "eerie": "strange and a little scary or spooky",
  "effect": "a result or change caused by something",
  "effort": "hard work you put into trying to do something",
  "efficient": "doing something well without wasting time or energy",
  "eggplant": "a vegetable with smooth purple skin",
  "eight": "the number that comes after seven",
  "eighteen": "the number that comes after seventeen",
  "eighth": "the thing that comes after seven others in order",
  "eighty": "the number that equals ten times eight",
  "eject": "to force something out quickly, like a disc from a player",
  "elastic": "a stretchy material that snaps back to its shape",
  "elder": "a person who is older than you",
  "elderly": "describes a person who is old",
  "eldest": "the oldest child or person in a family",
  "elect": "to choose someone by voting",
  "election": "a day when people vote to choose a leader",
  "electric": "powered by electricity",
  "electronic": "a device, like a phone or tablet, that runs on electricity",
  "eleven": "the number that comes after ten",
  "elf": "a small magical creature from fairy tales",
  "eliminate": "to remove someone or something completely, like in a contest",
  "else": "something different, other, or in addition",
  "elsewhere": "in or to another place",
  "email": "a message sent electronically using a computer or phone",
  "ember": "a small glowing piece of wood or coal from a fire",
  "embrace": "to hold someone closely with your arms, like a hug",
  "emerald": "a bright green gemstone",
  "emerge": "to come out from somewhere and become visible",
  "emergency": "a sudden serious situation that needs help right away",
  "emoji": "a small picture used to show a feeling in a text message",
  "emperor": "a man who rules over a large empire",
  "empire": "a large group of countries or areas ruled by one leader",
  "employ": "to give someone a job to do",
  "employer": "a person or company that gives people jobs",
  "enable": "to make it possible for something to happen",
  "encounter": "to meet or come across someone or something unexpectedly",
  "encourage": "to give someone confidence or support to do something",
  "enclose": "to surround something with a wall, fence, or border",
  "enclosure": "an area with a fence or wall around it, like at a zoo",
  "end": "the last part of something",
  "endanger": "to put something or someone at risk of harm",
  "endure": "to keep going through something difficult",
  "enemy": "a person who is against you or wants to fight you",
  "english": "the language spoken in the United States, Britain, and other countries",
  "enjoy": "to get pleasure or happiness from something",
  "enlarge": "to make something bigger",
  "enough": "as much as is needed, not more or less",
  "enroll": "to sign up to join a school, class, or club",
  "ensure": "to make certain that something happens",
  "enter": "to go or come into a place",
  "entertain": "to keep someone interested or amused",
  "entertainment": "shows, games, or other things people enjoy for fun",
  "entire": "the whole of something, with nothing left out",
  "entrance": "the door or way into a place",
  "entry": "a way into a place, or something written in a list",
  "epic": "very great, exciting, or heroic",
  "episode": "one part of a TV show or story that is told in parts",
  "equal": "the same in size, amount, or value as something else",
  "equality": "when everyone is treated fairly and the same way",
  "equation": "a math statement showing that two things are equal",
  "equip": "to give someone the tools or items they need",
  "erase": "to rub out marks so they disappear",
  "erosion": "the slow wearing away of rock or soil by wind or water",
  "errand": "a short trip taken to do a small task",
  "error": "a mistake",
  "eruption": "when a volcano suddenly bursts and shoots out lava and ash",
  "escape": "to get free from a place or a dangerous situation",
  "especially": "more than usual, or more than anything else",
  "essential": "very important and necessary",
  "establish": "to start or set something up",
  "estimate": "to guess a number or amount close to the real one",
  "eternal": "lasting forever, without ever ending",
  "eve": "the day or evening right before an event",
  "even": "flat and smooth, or a number that splits into two equal parts",
  "event": "something that happens, especially something special",
  "ever": "at any time",
  "evergreen": "a tree that stays green all year round",
  "every": "each one in a group, with none left out",
  "everybody": "every person",
  "everyday": "happening or used each and every day",
  "everyone": "every single person",
  "everything": "all the things there are",
  "everywhere": "in every place",
  "evacuate": "to leave a place quickly because it is not safe",
  "evaluate": "to judge how good, bad, or useful something is",
  "evidence": "facts or proof that show something is true",
  "evil": "very bad or wicked, like a villain in a story",
  "exact": "completely correct and precise",
  "exactly": "in a precise and correct way, with no mistakes",
  "exaggerate": "to make something sound bigger than it really is",
  "examine": "to look at something closely and carefully",
  "example": "something used to show what other similar things are like",
  "excavate": "to dig in the ground to find or uncover something",
  "exceed": "to go beyond a certain amount or limit",
  "excel": "to be very good at doing something",
  "excellent": "extremely good",
  "except": "not including something or someone",
  "exception": "something that does not follow the usual rule",
  "exchange": "to give one thing and get another thing back",
  "exclaim": "to say something suddenly and loudly",
  "exclamation": "a word or short sentence that shows strong feeling, like Wow!",
  "exclude": "to leave someone or something out on purpose",
  "excursion": "a short trip taken for fun or learning, like a school trip",
  "exhale": "to breathe air out of your lungs",
  "exhibit": "a display of things people can look at, like in a museum",
  "exist": "to be real or to be alive",
  "exit": "the way out of a place",
  "exotic": "unusual and from a faraway place",
  "expand": "to grow bigger or spread out",
  "expect": "to think that something will happen",
  "expedition": "a journey taken to explore or discover something",
  "expensive": "costing a lot of money",
  "experience": "something that happens to you that you learn or remember",
  "expert": "someone who knows a lot about a certain subject",
  "expire": "to reach the end of the time it can be used, like old food",
  "explode": "to burst suddenly with a loud bang",
  "explosion": "a sudden burst with a loud bang and force",
  "export": "to send goods to another country to be sold",
  "expose": "to uncover something that was hidden",
  "express": "to show your feelings, thoughts, or ideas",
  "expression": "the look on someone's face, or a way of saying something",
  "extend": "to make something longer, bigger, or last more time",
  "exterior": "the outside part of something",
  "extinguish": "to put out a fire or flame",
  "extra": "more than what is usual or needed",
  "extract": "to pull or take something out",
  "extraordinary": "very unusual, special, or amazing",
  "extreme": "very great in degree, far beyond what is normal",
  "eye": "the body part you use to see",
  "eyeball": "the round part of your eye inside the eyelids",
  "eyebrow": "the line of hair above your eye",
  "eyelash": "one of the short hairs that grow on your eyelid",
  "eyelid": "the piece of skin that covers your eye when you blink",
  "eyewitness": "a person who saw something happen with their own eyes",
  "face": "the front part of your head with your eyes, nose, and mouth",
  "fact": "something that is true and can be proven",
  "fair": "treating everyone the same way, or a fun outdoor event",
  "fable": "a short story that teaches a lesson, often with animals",
  "faith": "strong trust or belief in someone or something",
  "fake": "not real; made to look like something it is not",
  "false": "not true",
  "fame": "being famous and known by lots of people",
  "far": "a long distance away",
  "fat": "having a round, heavy body, or the greasy part of food",
  "fault": "being the reason something bad happened",
  "favorite": "the one you like best out of all the others",
  "fear": "a feeling of being scared or worried",
  "feast": "a big, delicious meal for a special occasion",
  "fee": "an amount of money you pay for something",
  "feel": "to notice something through touch or emotion",
  "feet": "more than one foot; what you stand and walk on",
  "fell": "dropped down suddenly; the past tense of fall",
  "felt": "touched and noticed something; also a soft, thick fabric",
  "female": "a girl, woman, or animal that can have babies",
  "fence": "a wall made of wood, wire, or metal around a yard",
  "festival": "a special day or event full of fun and celebration",
  "fetch": "to go get something and bring it back",
  "fever": "when your body feels too hot because you are sick",
  "few": "not very many",
  "fiction": "a story that is made up, not real",
  "fifteen": "the number 15",
  "fifty": "the number 50",
  "fight": "to struggle or argue against someone",
  "figure": "a shape, a number, or the outline of a person",
  "file": "a folder of papers, or information saved on a computer",
  "film": "a movie, or a thin layer covering something",
  "final": "the last one in a series",
  "finally": "after a long wait, at last",
  "finger": "one of the five long parts on your hand",
  "fire": "hot, bright flames that burn and give off heat",
  "fireplace": "a spot in a house where you burn wood to stay warm",
  "fireworks": "bright lights and loud bangs that shoot into the sky for fun",
  "firm": "solid and steady, not soft or easy to press",
  "fist": "a hand closed up tightly",
  "fit": "to be the right size, or to be healthy and strong",
  "five": "the number 5",
  "flag": "a piece of cloth with colors and a design that stands for a place",
  "flame": "the bright, hot, flickering part of a fire",
  "flash": "a sudden burst of bright light",
  "flavor": "the taste of a food or drink",
  "flea": "a tiny bug that jumps and can bite",
  "flee": "to run away quickly from danger",
  "fleet": "a group of ships, trucks, or planes traveling together",
  "flew": "moved through the air; the past tense of fly",
  "flick": "to snap or flip something quickly with your finger",
  "flight": "a trip through the air, usually in an airplane",
  "flow": "to move smoothly and steadily, like water",
  "flu": "a sickness that gives you a fever, cough, and aches",
  "fluid": "a liquid that flows and moves freely",
  "foam": "light, bubbly stuff that sits on top of a liquid",
  "focus": "to pay close attention to just one thing",
  "foil": "thin, shiny metal used to wrap food",
  "folk": "ordinary people, or traditional music, stories, and customs",
  "food": "what people and animals eat to stay alive",
  "fool": "someone who does something silly, or to trick someone",
  "foot": "the part of your leg that touches the ground",
  "footprint": "the mark a foot leaves behind on the ground",
  "footstep": "the sound or mark made by a step while walking",
  "forbid": "to say that someone is not allowed to do something",
  "forehead": "the flat part of your face above your eyebrows",
  "foreign": "from a country other than your own",
  "form": "the shape of something, or a paper you fill out with information",
  "formal": "dressed up or acting proper for a special occasion",
  "former": "the one that came before; used to be",
  "formula": "a set of steps, or the ingredients used to make something",
  "fort": "a strong structure built for protection, or a fun hideout",
  "fortress": "a large, strong building built to keep people safe",
  "fortunate": "lucky",
  "fortune": "good luck, or a very large amount of money",
  "forty": "the number 40",
  "forward": "moving toward the front",
  "foster": "to take care of a child, pet, or idea and help it grow",
  "found": "discovered something you were looking for, or started something new",
  "foundation": "the strong base that holds up a building",
  "fountain": "a structure that sprays water up into the air",
  "four": "the number 4",
  "fourteen": "the number 14",
  "fourth": "coming right after third",
  "fowl": "a bird raised for food, like a chicken or duck",
  "fraction": "a part of a whole, like one half or one quarter",
  "fragment": "a small broken piece of something",
  "frail": "weak and easily hurt or broken",
  "frantic": "very worried, rushed, and excited all at once",
  "freckle": "a small light brown spot on someone's skin",
  "free": "not costing any money, or not held back by anything",
  "freedom": "being able to choose and act without being controlled",
  "frequent": "happening often",
  "fridge": "a machine that keeps food cold",
  "fried": "cooked in hot oil until crispy",
  "fright": "a sudden, strong feeling of fear",
  "frighten": "to make someone feel scared",
  "frigid": "extremely cold",
  "front": "the part that faces forward, the opposite of back",
  "frosting": "sweet, creamy icing spread on top of a cake",
  "frown": "to turn the corners of your mouth down when unhappy",
  "frozen": "turned hard and solid by extreme cold, like ice",
  "frugal": "careful about spending money and not wasting things",
  "fudge": "a soft, sweet chocolate treat",
  "fulfill": "to complete or finish something you promised to do",
  "fumble": "to clumsily drop or mishandle something",
  "fun": "enjoyment, playfulness, and a good time",
  "function": "the special job or purpose that something has",
  "fund": "an amount of money saved or collected for a purpose",
  "fungus": "a living thing like a mushroom or mold",
  "funnel": "a cone-shaped tool used to pour liquid into a small opening",
  "furniture": "things like chairs, tables, and beds inside a home",
  "further": "at or to a greater distance",
  "fury": "very strong, powerful anger",
  "fuse": "a safety part in an electrical device, or to join two things together",
  "fuss": "to worry or complain about small things",
  "fussy": "hard to please; picky about things",
  "fairy": "a tiny, magical creature in stories, often with wings",
  "faint": "to briefly lose consciousness, or very weak and hard to notice",
  "fantastic": "really wonderful, amazing, or excellent",
  "fantasy": "an imaginary world full of magic and made-up creatures",
  "farewell": "a way of saying goodbye",
  "fashion": "the styles of clothes and looks that are popular",
  "fasten": "to attach or close something firmly",
  "fatigue": "a feeling of being very tired",
  "fickle": "changing your mind or feelings often",
  "fidget": "to move around restlessly because you can't sit still",
  "filthy": "extremely dirty",
  "finale": "the last, exciting part of a show or performance",
  "fine": "okay or good, or money you must pay as a penalty",
  "firecracker": "a small paper tube that pops loudly for fun on holidays",
  "fluent": "able to speak or use a language easily and smoothly",
  "flunk": "to fail a test or a class",
  "flush": "to turn red in the face, or to clean out a toilet with water",
  "flutter": "to flap quickly and lightly, like a bird's wings",
  "flop": "to fall down heavily and loosely, or to fail",
  "florist": "a person who arranges and sells flowers",
  "foe": "an enemy or someone against you",
  "fog": "a low, thick cloud near the ground that makes it hard to see",
  "go": "To move from one place to another.",
  "get": "To receive or obtain something.",
  "good": "Nice, kind, or done well.",
  "great": "Really good or excellent.",
  "grand": "Very large, fancy, and impressive.",
  "gold": "A shiny yellow precious metal.",
  "golden": "Colored like shiny gold.",
  "goldfish": "A small orange fish often kept as a pet.",
  "gray": "A color made by mixing black and white.",
  "green": "The color of grass and leaves.",
  "glad": "Feeling happy about something.",
  "glow": "To give off a soft, steady light.",
  "gleam": "To shine brightly for a short moment.",
  "glimmer": "A faint, flickering light.",
  "glimpse": "A very quick look at something.",
  "glisten": "To shine because something is wet.",
  "glitter": "Tiny sparkly bits that catch the light.",
  "glory": "Great honor, beauty, or praise.",
  "glorious": "Wonderfully beautiful or splendid.",
  "glossy": "Smooth and shiny.",
  "glare": "A strong bright light, or an angry stare.",
  "gaze": "To look at something for a long time.",
  "grin": "A big, wide smile.",
  "growl": "A low, rumbly, angry sound an animal makes.",
  "grunt": "A short, low, rough sound.",
  "groan": "A long, low sound showing pain or annoyance.",
  "grumble": "To complain in a low, quiet voice.",
  "grind": "To crush something into tiny pieces.",
  "grasp": "To take hold of something firmly.",
  "gulp": "To swallow something quickly.",
  "gobble": "To eat food very fast.",
  "gnaw": "To bite something again and again.",
  "gush": "To flow out quickly and suddenly.",
  "graze": "To eat grass, or to scrape your skin lightly.",
  "grease": "A thick, oily substance.",
  "greasy": "Covered in oil or grease.",
  "grocery": "A store where you buy food.",
  "groceries": "Food and other items you buy at a store.",
  "gravy": "A warm sauce made from meat juices.",
  "gravel": "Small loose stones, often used on paths.",
  "granite": "A hard, speckled type of rock.",
  "grapefruit": "A large, slightly sour citrus fruit.",
  "grapevine": "The climbing plant that grapes grow on.",
  "graph": "A picture that shows information using lines or bars.",
  "graphite": "The soft black material inside a pencil.",
  "graduate": "To finish a level of school successfully.",
  "grandchild": "The son or daughter of your child.",
  "granddaughter": "The daughter of your child.",
  "grandson": "The son of your child.",
  "gadget": "A small, clever tool or machine.",
  "gallery": "A room or building where art is shown.",
  "gallon": "A unit used to measure liquid.",
  "gallop": "The fastest way a horse can run.",
  "gap": "An empty space between two things.",
  "garbage": "Trash or things people throw away.",
  "gardener": "A person who takes care of a garden.",
  "gargle": "To swish liquid around in your mouth and throat.",
  "garland": "A ring of flowers or leaves worn or hung up.",
  "gasoline": "A fuel used to power cars and trucks.",
  "gate": "A door built into a fence or wall.",
  "gear": "Equipment or tools needed for an activity.",
  "genie": "A magic being in stories who grants wishes.",
  "genius": "Someone who is extremely smart.",
  "gently": "In a soft, careful, and kind way.",
  "gesture": "A movement of your hands or body to show something.",
  "ghost": "A spirit that appears in stories, especially at Halloween.",
  "gift": "A present given to someone.",
  "gnome": "A tiny magical creature in stories, often wearing a pointy hat.",
  "goalie": "The player who guards the goal in a game.",
  "goalpost": "One of the posts that mark a goal in sports.",
  "goblin": "A mischievous magical creature in stories.",
  "goggles": "Special glasses that protect your eyes.",
  "gong": "A round metal disc that makes a deep sound when hit.",
  "goo": "A sticky, wet, messy substance.",
  "goof": "A silly mistake.",
  "gopher": "A small animal that digs tunnels underground.",
  "gorge": "A deep, narrow valley with steep, rocky sides.",
  "gossip": "Talk about other people's private business.",
  "government": "The group of people who run a country or city.",
  "governor": "The elected leader of a state.",
  "govern": "To lead and make rules for a country or group.",
  "grace": "Smooth, beautiful movement.",
  "gracious": "Kind, polite, and pleasant.",
  "graffiti": "Words or pictures drawn on walls, often without permission.",
  "gram": "A small unit used to measure weight.",
  "grant": "To give or allow someone something.",
  "grid": "A pattern of crossing lines that form squares.",
  "grime": "Thick dirt that builds up on something.",
  "grimace": "A twisted face you make when something hurts or tastes bad.",
  "grit": "Tiny bits of sand or dirt, or the courage to keep trying.",
  "gritty": "Covered in small, rough bits.",
  "ground": "The surface of the earth.",
  "groundhog": "A furry burrowing animal that sleeps through winter.",
  "group": "A number of people or things together.",
  "grown-up": "An adult.",
  "growth": "The process of growing bigger.",
  "grub": "A young insect that looks like a tiny worm.",
  "gruff": "Having a rough, gravelly voice or manner.",
  "guacamole": "A dip made from mashed avocados.",
  "guarantee": "A promise that something will happen.",
  "guard": "To protect or watch over something.",
  "gull": "A seabird that lives near oceans and lakes.",
  "gumball": "A round piece of bubble gum from a machine.",
  "gummy": "Soft, chewy, and sticky.",
  "gunk": "Sticky, messy dirt or grime.",
  "gut": "The inside part of your belly.",
  "gutsy": "Brave and willing to take chances.",
  "gutter": "A channel that carries rainwater away from a roof or street.",
  "guy": "An informal word for a man or boy.",
  "guzzle": "To drink something quickly and greedily.",
  "gymnast": "A person who performs gymnastics.",
  "gnat": "A tiny flying bug.",
  "gauze": "A thin, see-through cloth used for bandages.",
  "gawk": "To stare at something in surprise.",
  "gazebo": "A small open shelter, often in a garden or park.",
  "generate": "To make or produce something.",
  "germinate": "When a seed starts to sprout and grow.",
  "get-together": "A small, casual gathering with friends or family.",
  "ginger": "A spicy root used in cooking.",
  "greeting": "A friendly hello.",
  "game": "A fun activity played with rules.",
  "gamer": "Someone who plays video games.",
  "garnish": "Food used to decorate or top a dish.",
  "gazillion": "A make-believe word for an extremely huge number.",
  "gel": "A thick, jelly-like substance, like hair gel.",
  "generator": "A machine that makes electricity.",
  "gentleman": "A polite, well-mannered man.",
  "genuine": "Real and true, not fake.",
  "geography": "The study of Earth's land, countries, and features.",
  "geology": "The study of rocks and the Earth.",
  "geometry": "The math of shapes, lines, and space.",
  "gibberish": "Talk or writing that doesn't make sense.",
  "gigabyte": "A unit used to measure computer storage.",
  "glee": "Great joy and delight.",
  "glint": "A quick flash or sparkle of light.",
  "glitch": "A small error or problem, especially in a computer or game.",
  "gloat": "To brag about winning in an annoying way.",
  "gorgeous": "Extremely beautiful.",
  "gourd": "A hard-shelled fruit related to pumpkins and squash.",
  "glamorous": "Extra fancy, stylish, and attractive.",
  "hand": "The part of your arm you use to hold things.",
  "head": "The top part of your body with your brain and face.",
  "hair": "Thin strands that grow on your skin and head.",
  "hip": "The part of your body where your leg meets your waist.",
  "heel": "The back part of your foot.",
  "home": "The place where you live.",
  "habit": "Something you do often without even thinking about it.",
  "hobby": "Something fun you like to do in your free time.",
  "hall": "A long passage inside a building.",
  "handle": "The part of an object you hold onto.",
  "handbag": "A small bag someone carries their things in.",
  "handkerchief": "A small cloth used to wipe your face or nose.",
  "handful": "The amount that fits in one hand.",
  "hangout": "A place where friends like to spend time together.",
  "happen": "To take place or occur.",
  "happiness": "The feeling of being happy.",
  "harm": "To hurt someone or something.",
  "harmless": "Not able to cause any hurt.",
  "harmony": "When sounds or things fit well together.",
  "harp": "A large musical instrument with many strings.",
  "harsh": "Rough, strict, or unkind.",
  "hatch": "To break out of an egg.",
  "hate": "To dislike something very strongly.",
  "haul": "To pull or carry something heavy.",
  "haunted": "Believed to have ghosts living in it.",
  "hay": "Dried grass used to feed farm animals.",
  "hazard": "Something that could be dangerous.",
  "hazelnut": "A small round nut from a hazel tree.",
  "headache": "A pain inside your head.",
  "headline": "The title at the top of a news story.",
  "headphones": "Devices you wear on your ears to listen to sound.",
  "headquarters": "The main office of a company or group.",
  "heal": "To get better after being hurt or sick.",
  "health": "How well your body and mind are doing.",
  "heap": "A messy pile of things.",
  "heaven": "A place some people believe good souls go.",
  "hedge": "A row of bushes planted close together like a wall.",
  "height": "How tall a person or thing is.",
  "heritage": "Traditions and history passed down in a family.",
  "hermit": "A person who lives alone, away from other people.",
  "heroic": "Very brave.",
  "hesitate": "To pause because you feel unsure.",
  "hexagon": "A shape with six sides.",
  "hiccup": "A sudden gulping sound your body makes by accident.",
  "high": "Being far up or very tall.",
  "highlight": "The best or most exciting part of something.",
  "hilarious": "Very funny.",
  "hinge": "A metal piece that lets a door swing open.",
  "hint": "A small clue.",
  "hip hop": "A style of music and dance.",
  "hire": "To give someone a job.",
  "hiss": "A sharp sound like a snake makes.",
  "history": "The study of things that happened in the past.",
  "hit": "To touch or strike something quickly.",
  "hitch": "A small problem that causes a delay.",
  "hoard": "To collect and store away a lot of something.",
  "hoarse": "Having a rough, scratchy voice.",
  "hoist": "To lift something up.",
  "hole": "An empty opening or gap in something.",
  "hollow": "Empty on the inside.",
  "holy": "Thought of as very special and sacred.",
  "home run": "Hitting a baseball far enough to score a run.",
  "homemade": "Made at home instead of bought in a store.",
  "homeroom": "A classroom where students start their school day.",
  "honeybee": "A bee that makes honey.",
  "honeycomb": "The waxy structure bees build to store honey.",
  "honeymoon": "A trip a couple takes after they get married.",
  "honk": "The sound a car horn makes.",
  "honor": "Deep respect and admiration for someone.",
  "hook": "A curved piece used to catch or hang things.",
  "hooray": "A word people shout when they are excited.",
  "hope": "To wish for something good to happen.",
  "horn": "A hard pointy part on an animal's head, or an instrument.",
  "horrible": "Very bad or unpleasant.",
  "horseshoe": "A U-shaped metal piece worn on a horse's hoof.",
  "hose": "A long tube used to carry water.",
  "hospitable": "Friendly and welcoming to guests.",
  "hound": "A type of dog often used for hunting.",
  "household": "All the people who live together in one home.",
  "housework": "Jobs done to keep a home clean and tidy.",
  "hover": "To stay floating in one place in the air.",
  "howl": "A long, loud cry made by a wolf or dog.",
  "hub": "The center of an activity, or the middle of a wheel.",
  "hue": "A color or shade.",
  "hull": "The main body of a boat or ship.",
  "human": "A person, like you.",
  "humor": "The quality of being funny.",
  "hump": "A rounded bump, like on a camel's back.",
  "humpback whale": "A large whale with a bumpy back.",
  "hunch": "A feeling that something might be true.",
  "hundred": "The number 100.",
  "hunger": "The feeling of needing food.",
  "hunt": "To search for and try to catch animals.",
  "hunter": "Someone who hunts animals.",
  "hurdle": "A barrier a runner jumps over in a race.",
  "hurl": "To throw something with a lot of force.",
  "hurt": "To cause pain.",
  "hush": "To become quiet.",
  "husk": "The dry outer covering of a seed or fruit.",
  "hustle": "To move quickly and busily.",
  "hut": "A small, simple shelter or house.",
  "hutch": "A small cage where pet rabbits are kept.",
  "hydrant": "A pipe on the street firefighters connect a hose to.",
  "hygiene": "Keeping your body clean and healthy.",
  "hymn": "A song sung to praise God.",
  "hyperactive": "Having so much energy it's hard to sit still.",
  "handy": "Useful, or good at fixing things with your hands.",
  "hangar": "A large building where airplanes are kept.",
  "happily": "In a happy way.",
  "harden": "To become hard or firm.",
  "hardly": "Almost not at all.",
  "hardware": "Tools, or the physical parts of a computer.",
  "hardworking": "Putting a lot of effort into your work.",
  "hasty": "Done too fast without enough thought.",
  "hatchling": "A baby animal that has just hatched from an egg.",
  "headband": "A band worn around the head to hold back hair.",
  "headlight": "A bright light on the front of a car.",
  "heartbeat": "The steady thump of your heart pumping blood.",
  "heartwarming": "Making you feel happy, loved, or touched.",
  "heavenly": "Wonderful, like something from heaven.",
  "hectic": "Very busy and rushed.",
  "heroine": "A brave girl or woman in a story.",
  "hidden": "Kept out of sight so it can't easily be seen.",
  "hideout": "A secret place where someone hides or plays.",
  "hoax": "A trick meant to make people believe something false.",
  "holler": "To shout loudly.",
  "hoop": "A round ring shape, like a basketball hoop.",
  "hoot": "The sound an owl makes.",
  "handshake": "When two people grip and shake hands to greet each other.",
  "harmful": "Able to cause harm.",
  "harmonica": "A small musical instrument you blow into and slide.",
  "helper": "A person who helps someone else.",
  "hog": "A large pig.",
  "husky": "A strong, furry dog breed often used to pull sleds.",
  "hyphen": "A short line used to join two words together.",
  "handstand": "A trick where you balance upside down on your hands.",
  "hangnail": "A small torn piece of skin near a fingernail.",
  "heartfelt": "Deeply and sincerely felt.",
  "hilltop": "The top of a hill.",
  "hometown": "The town where someone was born or grew up.",
  "homegrown": "Grown at home instead of bought in a store.",
  "honeydew": "A type of sweet, pale green melon.",
  "horseplay": "Rough, silly play like pushing and jumping around.",
  "hostess": "A woman who welcomes and takes care of guests.",
  "houseboat": "A boat that people live in like a house.",
  "icing": "the sweet sugary topping on a cake",
  "icky": "gross or unpleasant",
  "icon": "a small picture on a screen that represents something",
  "idea": "a thought or plan that comes into your mind",
  "identical": "exactly the same as something else",
  "identify": "to recognize what or who something is",
  "identity": "who a person is",
  "idle": "not working or moving, just resting",
  "idol": "someone you admire and look up to",
  "igloo": "a round house built from blocks of snow",
  "ignite": "to make something start burning",
  "ignition": "the part of a car that starts the engine",
  "ignorant": "not knowing about something",
  "ignore": "to pay no attention to something",
  "iguana": "a large lizard with a spiky back",
  "ill": "feeling sick or unwell",
  "illegal": "not allowed by the law",
  "illness": "a sickness or disease",
  "illuminate": "to light something up",
  "illustrate": "to draw pictures that go with a story",
  "image": "a picture of someone or something",
  "imaginary": "not real, only made up in your mind",
  "imitate": "to copy how someone else talks or acts",
  "imitation": "a copy of something real",
  "immature": "acting younger than your actual age",
  "immense": "extremely large",
  "immerse": "to dip something completely into a liquid",
  "immigrant": "a person who moves to live in a new country",
  "immortal": "able to live forever",
  "impact": "the effect that one thing has on another",
  "imperfect": "having small flaws, not perfect",
  "import": "to bring goods in from another country",
  "imposter": "someone who pretends to be a different person",
  "impolite": "not having good manners, a bit rude",
  "impress": "to make someone admire you",
  "improve": "to make something better",
  "impulse": "a sudden urge to do something",
  "inaccurate": "not correct or exact",
  "inactive": "not moving or doing anything",
  "inbox": "the place where your new messages arrive",
  "inch": "a small unit used to measure length",
  "incident": "something that happens, often unexpected",
  "incoming": "arriving or about to arrive",
  "include": "to have something as part of a group",
  "income": "the money a person earns",
  "incomplete": "not finished",
  "inconvenient": "causing trouble at a bad time",
  "incorrect": "not right or accurate",
  "increase": "to make or become bigger",
  "incredible": "very hard to believe, amazing",
  "incubate": "to keep eggs warm so they can hatch",
  "indent": "to start a line of writing further from the edge",
  "independent": "able to do things by yourself",
  "index": "a list at the back of a book showing topics",
  "indicate": "to point something out or show it",
  "indigo": "a deep blue-purple color",
  "individual": "one single person or thing",
  "indoor": "happening inside a building",
  "industry": "the work of making or growing things to sell",
  "infamous": "well known for something bad",
  "infect": "to pass a germ onto someone",
  "infection": "a sickness caused by germs",
  "inferior": "lower in quality than something else",
  "inferno": "a huge, dangerous fire",
  "inflate": "to fill something with air",
  "influence": "to affect how someone thinks or acts",
  "inform": "to tell someone useful information",
  "information": "facts or details about something",
  "ingenious": "very clever and original",
  "ingredient": "one of the foods used to make a dish",
  "inhabit": "to live in a place",
  "inhabitant": "a person or animal that lives in a place",
  "inherit": "to receive something from your family",
  "inhale": "to breathe air into your lungs",
  "initial": "the first letter of a name",
  "injure": "to hurt part of your body",
  "injury": "damage or harm done to your body",
  "injustice": "a situation that is not fair",
  "inland": "away from the coast, toward a country's middle",
  "inn": "a small hotel, often in the countryside",
  "inner": "on the inside of something",
  "innocent": "not guilty of doing anything wrong",
  "innovative": "using new and clever ideas",
  "inquire": "to ask about something",
  "inquiry": "a question asked to get information",
  "inquisitive": "very curious and eager to learn",
  "insert": "to put something inside something else",
  "inside": "in or into the inner part of something",
  "insist": "to say firmly that something must happen",
  "inspect": "to look at something closely to check it",
  "inspector": "a person whose job is to check things carefully",
  "inspiration": "an idea that makes you want to create something",
  "install": "to put something in place so it can be used",
  "instead": "in place of something else",
  "instinct": "something you know how to do without being taught",
  "instruct": "to teach or tell someone how to do something",
  "instruction": "a direction that tells you how to do something",
  "instructor": "a person who teaches or trains people",
  "insulate": "to cover something so heat or cold cannot pass through",
  "insult": "to say something rude that hurts someone's feelings",
  "insurance": "money paid so a company will help if something bad happens",
  "intact": "whole and not broken or damaged",
  "integer": "a whole number, not a fraction",
  "integrity": "being honest and doing the right thing",
  "intelligent": "able to learn and understand things well",
  "intend": "to plan to do something",
  "intense": "very strong or extreme",
  "intentional": "done on purpose, not by accident",
  "intercept": "to stop or catch something before it arrives",
  "interact": "to talk with or do things with other people",
  "interactive": "allowing two-way communication, like a responsive game",
  "intercom": "a system used to talk to people in another room",
  "interfere": "to get involved in something that isn't your business",
  "interior": "the inside part of something",
  "intermediate": "at a middle level, between beginner and advanced",
  "intermission": "a short break during a movie or play",
  "internal": "on the inside of something",
  "international": "involving more than one country",
  "internet": "a huge network connecting computers around the world",
  "interpret": "to explain what something means",
  "interpreter": "someone who translates one language into another",
  "interrupt": "to stop someone while they are talking",
  "interval": "a gap of time between two things",
  "interview": "a meeting where someone asks another person questions",
  "intricate": "having many small parts arranged in a complex way",
  "intrepid": "very brave and fearless",
  "introvert": "a person who prefers quiet time alone over crowds",
  "intruder": "someone who enters a place without permission",
  "invade": "to enter a place, often with an army, to take control",
  "invasion": "an act of entering a place to take control",
  "invention": "something new that someone has created",
  "inventive": "good at thinking of new ideas",
  "invert": "to turn something upside down or reverse its order",
  "invest": "to put money into something hoping to earn more later",
  "investigate": "to find out more information about something",
  "invincible": "too strong to be defeated",
  "invisible": "not able to be seen",
  "invitation": "a request asking someone to come to an event",
  "involve": "to include someone in an activity",
  "iris": "the colored part of your eye",
  "irregular": "not following the usual pattern",
  "irrigate": "to supply water to crops or land",
  "isle": "a small island",
  "isolate": "to keep something or someone separate from others",
  "issue": "a problem or topic that people talk about",
  "itch": "a feeling on your skin that makes you want to scratch",
  "itchy": "having an itch, wanting to be scratched",
  "item": "a single thing or object",
  "ivory": "a hard white material from an elephant's tusk",
  "ivy": "a green climbing plant",
  "jab": "a quick, sharp poke or punch.",
  "jackknife": "a large pocketknife that folds shut.",
  "jackpot": "a big prize you can win in a game.",
  "jackrabbit": "a large rabbit with long ears that runs fast.",
  "jade": "a smooth green stone used to make jewelry.",
  "jagged": "having sharp, rough, uneven edges.",
  "jail": "a place where people are kept as punishment for breaking rules.",
  "jamboree": "a big, cheerful gathering or party.",
  "jangle": "to make a ringing, clashing sound like shaking keys.",
  "jargon": "special words used by people in one job or group.",
  "jasmine": "a plant with small, sweet-smelling flowers.",
  "jaunty": "cheerful and full of confidence.",
  "javelin": "a long, light spear thrown in a sport.",
  "jaw": "the bone in your face that moves when you chew.",
  "jay": "a noisy, colorful bird.",
  "jaywalk": "to cross a street in a place you shouldn't.",
  "jazz": "a type of music with fun, swinging rhythms.",
  "jazzy": "bright, lively, and exciting.",
  "jeep": "a strong, sturdy vehicle good for rough roads.",
  "jeer": "to laugh at or mock someone unkindly.",
  "jeopardy": "danger of loss or harm.",
  "jerk": "a sudden, quick, sharp movement.",
  "jerky": "dried, chewy strips of meat.",
  "jersey": "a soft knitted shirt, often worn by athletes.",
  "jest": "a joke or playful remark.",
  "jester": "someone who used to entertain kings and queens with jokes.",
  "jet": "a fast airplane with a powerful engine.",
  "jetlag": "feeling tired after flying across time zones.",
  "jetty": "a wall or dock built out into the water.",
  "jewel": "a precious stone, like a diamond or ruby.",
  "jiffy": "a very short moment of time.",
  "jig": "a quick, lively dance.",
  "jigsaw": "a puzzle made of many oddly shaped pieces.",
  "jingle": "a short, catchy tune, or a light ringing sound.",
  "jinx": "something people believe brings bad luck.",
  "job": "work a person does, often to earn money.",
  "jockey": "a person who rides horses in races.",
  "join": "to connect with something or become part of a group.",
  "joke": "something funny said or done to make people laugh.",
  "joker": "a person who enjoys telling jokes.",
  "jolly": "cheerful, happy, and full of good spirits.",
  "jolt": "a sudden bump, shake, or shock.",
  "jostle": "to push or bump against people in a crowd.",
  "jot": "to quickly write something down.",
  "joust": "a contest where knights on horses charged with long poles.",
  "journal": "a notebook where you write about your day or thoughts.",
  "journey": "a trip from one place to another.",
  "jovial": "full of good cheer and friendliness.",
  "joy": "a strong feeling of happiness.",
  "joyous": "full of joy and happiness.",
  "joyride": "a fast ride taken just for fun.",
  "joystick": "a handle used to control video games or machines.",
  "jubilant": "feeling or showing great joy and triumph.",
  "jubilee": "a special celebration, often for an anniversary.",
  "judgment": "a decision made after thinking carefully.",
  "judo": "a sport where you use holds and throws to win.",
  "jug": "a large container with a handle, used for liquids.",
  "juggler": "a person who tosses and catches several objects at once.",
  "juicebox": "a small drink carton with a straw.",
  "jumble": "a messy mix of things all muddled together.",
  "jumbo": "extra large in size.",
  "jumper": "a person or animal that jumps, or a warm sweater.",
  "jumpsuit": "a piece of clothing that covers the top and legs together.",
  "junction": "a place where two roads, paths, or lines meet.",
  "jungle gym": "playground equipment for climbing and playing on.",
  "junior": "younger in age, or lower in rank.",
  "junk": "old, unwanted, or useless things.",
  "junkyard": "a place where old cars and broken things are kept.",
  "jury": "a group of people who decide if someone is guilty.",
  "just": "fair and right, or meaning exactly or only.",
  "justice": "fair treatment of people according to the rules.",
  "jut": "to stick out sharply from something.",
  "juvenile": "a young person or young animal.",
  "keep": "to hold onto something and not give it away",
  "keeper": "a person whose job is to take care of animals or a place",
  "keepsake": "a small object you keep to remember someone",
  "kelp": "a large brown seaweed that grows in the ocean",
  "kennel": "a small shelter or house for a dog",
  "kerchief": "a piece of cloth worn on your head or neck",
  "kernel": "the soft part inside a nut, seed, or piece of corn",
  "kebab": "pieces of meat or vegetables cooked on a stick",
  "karaoke": "singing along to songs with the words shown on a screen",
  "kart": "a small, low car used for racing",
  "kazoo": "a small toy instrument you hum into to make sound",
  "keel": "the long beam that runs along the bottom of a boat",
  "keg": "a small round barrel used to hold drinks",
  "keyhole": "the small hole in a lock where a key goes",
  "keypad": "a set of buttons used to type numbers or letters",
  "kickball": "a game like baseball but played by kicking a ball",
  "kickoff": "the moment when a game or event begins",
  "kickstand": "a metal bar that holds up a bike when it's parked",
  "kiln": "a very hot oven used to bake clay or bricks",
  "kilogram": "a unit used to measure how heavy something is",
  "kilometer": "a unit used to measure long distances",
  "kilt": "a skirt-like garment traditionally worn in Scotland",
  "kimono": "a traditional Japanese robe with wide, long sleeves",
  "kin": "your family members and relatives",
  "kindle": "to start a fire burning",
  "kindling": "small dry sticks used to start a fire",
  "kindly": "done in a gentle, caring, and friendly way",
  "kingdom": "a country or land ruled by a king or queen",
  "kingfisher": "a small brightly colored bird that dives to catch fish",
  "kiosk": "a small booth or stand where things are sold",
  "kiss": "a gentle touch with the lips to show love",
  "kit": "a set of tools or parts used for one purpose",
  "kitchen": "the room in a house where food is cooked",
  "kitty": "a friendly, playful word for a cat",
  "knack": "a special talent for doing something easily",
  "knapsack": "a bag carried on your back",
  "knead": "to press and squeeze dough over and over with your hands",
  "kneecap": "the round bone that covers the front of your knee",
  "knick-knack": "a small object kept for decoration, not for using",
  "knight": "a warrior from long ago who wore armor and served a king",
  "knob": "a round handle used to open a door or drawer",
  "knot": "a tight loop made by tying string, rope, or hair together",
  "know": "to have facts or information about something in your mind",
  "knowledge": "the facts and information you know about something",
  "knuckle": "the joint in your finger where it bends",
  "kudos": "praise given to someone for doing something well",
  "lab": "a room where scientists do experiments and tests",
  "label": "a small tag that tells you what something is",
  "lace": "thin string used to tie shoes",
  "lack": "to not have enough of something",
  "lad": "another word for a boy",
  "ladle": "a big spoon used to serve soup",
  "lady": "a polite word for a woman",
  "lag": "to fall behind or move too slowly",
  "landfill": "a place where garbage is buried",
  "landlord": "a person who owns a building and rents it out",
  "landmark": "a famous building or place that is easy to spot",
  "lane": "a narrow road or a marked path",
  "language": "the words people use to talk to each other",
  "lantern": "a light you can carry around",
  "lap": "the flat space on your legs when you sit",
  "laptop": "a small computer you can carry around",
  "large": "big in size",
  "lasagna": "a baked pasta dish with layers of cheese and sauce",
  "laser": "a thin, powerful beam of light",
  "lash": "a hair that grows on your eyelid",
  "lasso": "a rope with a loop, used to catch animals",
  "latch": "a small hook that keeps a door shut",
  "lather": "the bubbly foam made by soap",
  "laughter": "the sound people make when they laugh",
  "launch": "to start something or send it into the air",
  "laundry": "clothes that need washing or have been washed",
  "lava": "hot melted rock that flows from a volcano",
  "law": "a rule that everyone must follow",
  "lawn": "an area of grass, usually near a house",
  "lawnmower": "a machine used to cut grass",
  "lawsuit": "a disagreement settled by a court",
  "layer": "one thickness of something stacked with others",
  "leaflet": "a small sheet of paper with information on it",
  "league": "a group of teams that play sports against each other",
  "leak": "when liquid or gas escapes through a small hole",
  "lean": "to bend your body toward or against something",
  "leash": "a strap used to hold and walk a dog",
  "least": "the smallest amount",
  "leather": "material made from animal skin",
  "lecture": "a talk given to teach people about a topic",
  "ledge": "a narrow flat surface sticking out of a wall",
  "leech": "a small worm-like creature that sticks to skin",
  "left": "the side opposite of right",
  "leg": "the body part used for standing and walking",
  "legal": "allowed by law",
  "legend": "an old story passed down for many years",
  "leisure": "free time when you can relax and have fun",
  "lend": "to let someone borrow something of yours",
  "length": "how long something is",
  "lengthen": "to make something longer",
  "lens": "a curved piece of glass that helps you see",
  "leprechaun": "a tiny magical man from Irish stories",
  "less": "a smaller amount",
  "let": "to allow something to happen",
  "level": "how high, flat, or even something is",
  "liar": "someone who says things that are not true",
  "liberty": "freedom to do what you want",
  "lice": "tiny bugs that can live in hair",
  "license": "an official paper that lets you do something",
  "lid": "a cover that fits on top of a jar or box",
  "lie": "to say something that is not true",
  "life": "being alive, and all the things that happen while living",
  "lifeboat": "a small boat used to save people from a sinking ship",
  "lifeguard": "a person who watches swimmers to keep them safe",
  "lifestyle": "the way a person chooses to live",
  "like": "to enjoy or have good feelings about something",
  "likely": "probably going to happen",
  "lilac": "a purple flower with a sweet smell",
  "lily": "a type of flower with large petals",
  "limb": "an arm or leg, or a big tree branch",
  "limit": "the most or least something is allowed to be",
  "limousine": "a very long, fancy car",
  "limp": "to walk unevenly because a leg hurts",
  "line": "a long thin mark",
  "linen": "a type of cloth made from a plant",
  "link": "something that connects two things together",
  "lip": "the soft edge around your mouth",
  "lipstick": "makeup used to add color to lips",
  "list": "a group of words written one under another",
  "literature": "stories, poems, and books written by people",
  "liter": "a unit used to measure liquid",
  "little": "small in size",
  "live": "to be alive",
  "livestock": "animals raised on a farm",
  "living": "being alive right now",
  "load": "things carried or placed into something",
  "loaf": "a shaped piece of baked bread",
  "loan": "something lent to someone, usually money",
  "lobby": "a large room near the entrance of a building",
  "local": "close to where you live",
  "locate": "to find where something is",
  "location": "the place where something is",
  "locket": "a small case on a necklace that holds a tiny picture",
  "locomotive": "a train engine that pulls train cars",
  "lodge": "a small house, often in the woods",
  "logic": "clear thinking used to figure something out",
  "logo": "a symbol or design that represents a company",
  "long": "having a lot of length",
  "lookout": "a person who watches for danger, or a place to see far",
  "loop": "a circle shape made by a line or string",
  "loose": "not tight; able to move freely",
  "loosen": "to make something less tight",
  "lord": "a man of high rank, especially in old stories",
  "loss": "not having something anymore",
  "lost": "unable to find your way",
  "lot": "a large amount, or a piece of land",
  "lotion": "a cream you rub on your skin",
  "lottery": "a game where you can win money by luck",
  "loudspeaker": "a device that makes sound louder",
  "lounge": "a comfortable room for relaxing",
  "lovely": "very nice or pretty",
  "low": "not high",
  "lower": "to move something down",
  "luck": "good things that happen by chance",
  "lucky": "having good luck",
  "luggage": "bags used for carrying things when traveling",
  "lukewarm": "only a little warm",
  "lullaby": "a soft song sung to help a baby sleep",
  "lumber": "wood that has been cut for building",
  "lumberjack": "a person whose job is cutting down trees",
  "luminous": "giving off light, or glowing",
  "lump": "a small solid piece or bump",
  "lunar": "having to do with the moon",
  "lunchbox": "a box used to carry food to eat",
  "lunge": "to move forward suddenly",
  "lure": "something used to attract or trick someone",
  "lurk": "to wait quietly and hide out of sight",
  "lush": "full of thick, healthy green plants",
  "luxury": "something expensive and nice, but not needed",
  "lyric": "the words of a song",
  "magic": "special powers that make impossible things seem to happen",
  "magnificent": "extremely beautiful or impressive",
  "mail": "letters and packages sent through the post",
  "main": "the most important part of something",
  "maid": "a person who is paid to clean a house",
  "majestic": "grand, beautiful, and impressive",
  "major": "very important or large",
  "majority": "more than half of a group",
  "makeup": "colors and creams people put on their face",
  "male": "a boy, man, or a boy animal",
  "mammoth": "a huge, hairy elephant-like animal that is now extinct",
  "manage": "to take care of and control something",
  "manager": "a person in charge of a business or team",
  "mansion": "a very large, fancy house",
  "many": "a large number of people or things",
  "marble": "a small glass ball used in games",
  "marine": "having to do with the sea",
  "mark": "a spot, line, or symbol on something",
  "maroon": "a dark brownish-red color",
  "marriage": "when two people become husband and wife",
  "marry": "to become someone's husband or wife",
  "marvelous": "wonderful and amazing",
  "mascot": "an animal or character that represents a team",
  "massage": "rubbing someone's muscles to help them relax",
  "mast": "a tall pole on a ship that holds the sails",
  "master": "someone who is very skilled at something",
  "mat": "a flat piece of material that covers part of a floor",
  "match": "a game or contest between two players or teams",
  "mate": "a friend, or a partner for an animal",
  "material": "what something is made of, like cloth or wood",
  "mature": "fully grown or grown-up",
  "maximum": "the largest amount possible",
  "maybe": "perhaps; it might happen",
  "maze": "a puzzle of paths where you try to find your way out",
  "meaning": "what a word or thing stands for",
  "meat": "food that comes from animals",
  "medicine": "something you take to help you feel better when sick",
  "medium": "in the middle; not too big or too small",
  "meeting": "when people come together to talk about something",
  "melody": "a pleasant tune made of musical notes",
  "melon": "a large, round, juicy fruit",
  "member": "a person who belongs to a group",
  "memory": "something you remember from the past",
  "mend": "to fix something broken or torn",
  "mention": "to talk about something briefly",
  "menu": "a list of foods you can order at a restaurant",
  "merchant": "a person who buys and sells things",
  "mermaid": "a make-believe creature, half woman and half fish",
  "merry": "happy and cheerful",
  "mess": "things left messy and out of order",
  "message": "words sent to tell someone something",
  "metal": "a hard, shiny material like iron or gold",
  "meteor": "a piece of rock from space that burns up in the sky",
  "middle": "the center part of something",
  "might": "a word used to say something is possible",
  "mighty": "very strong or powerful",
  "mile": "a unit used to measure distance",
  "million": "the number 1,000,000",
  "mind": "your brain; the part of you that thinks",
  "mine": "belonging to me",
  "minimum": "the smallest amount possible",
  "minor": "small or less important",
  "minority": "a smaller part of a group",
  "minus": "a math sign meaning to subtract",
  "miracle": "an amazing event that seems impossible",
  "mischief": "playful behavior that causes harmless trouble",
  "miss": "to feel sad because someone isn't there",
  "mission": "an important job someone is sent to do",
  "mistake": "something done wrong by accident",
  "moan": "to make a long, low sound of pain or sadness",
  "mobile": "able to move around easily",
  "model": "a small copy of a real object",
  "moist": "slightly wet",
  "mold": "a fuzzy growth that can appear on old food",
  "monarch": "a king or queen who rules a country",
  "money": "coins and bills used to buy things",
  "monitor": "a screen that shows pictures, like on a computer",
  "monster": "a scary, imaginary creature",
  "monument": "a statue or building built to remember something",
  "mood": "how you are feeling, like happy or sad",
  "more": "a larger amount of something",
  "mosaic": "a picture made from small pieces of colored tile or glass",
  "most": "the largest amount or number",
  "motion": "the act of moving",
  "motor": "a machine part that makes something move",
  "mound": "a small pile or hill of dirt",
  "mount": "to climb up onto something",
  "mouth": "the part of your face used to eat and talk",
  "move": "to change position or place",
  "movie": "a story shown as moving pictures on a screen",
  "mow": "to cut grass short",
  "much": "a large amount of something",
  "muddy": "covered in or full of mud",
  "multiply": "to make a number bigger by adding it several times",
  "mumble": "to speak quietly and unclearly",
  "must": "a word showing something is necessary",
  "mustache": "hair that grows above a man's upper lip",
  "mute": "silent; making no sound",
  "myself": "me; used when you do something alone",
  "mystery": "something strange that is hard to explain",
  "myth": "an old story, often about gods or heroes",
  "mythical": "imaginary, like a creature from an old story",
  "nachos": "a snack food made of crispy chips topped with cheese.",
  "nag": "to keep asking or reminding someone about something.",
  "narrate": "to tell a story out loud.",
  "narrator": "the person who tells the story in a book or movie.",
  "narwhal": "an arctic whale with a long, pointy tusk.",
  "nasty": "very unpleasant, mean, or unkind.",
  "nation": "a country and all the people who live there.",
  "national": "having to do with a whole country.",
  "nationality": "the country a person comes from or belongs to.",
  "native": "born or grown naturally in a certain place.",
  "natural": "made by nature, not by people.",
  "nature": "everything in the world not made by humans, like plants and animals.",
  "naughty": "behaving badly or not listening to the rules.",
  "nauseous": "feeling sick to your stomach.",
  "navigate": "to find your way from one place to another.",
  "navigator": "a person who helps guide a trip or journey.",
  "navy": "the part of the military that fights at sea.",
  "near": "close to something, not far away.",
  "nearly": "almost, but not quite.",
  "necessary": "needed in order for something to happen.",
  "necessity": "something you must have to live or get by.",
  "neck": "the part of your body that connects your head to your shoulders.",
  "necktie": "a strip of cloth worn around the neck under a collar.",
  "nectarine": "a smooth-skinned fruit similar to a peach.",
  "need": "to require something you cannot do without.",
  "needle": "a thin, sharp tool used for sewing.",
  "needy": "needing a lot of help or care.",
  "negative": "not positive; saying no or showing something is bad.",
  "neglect": "to fail to take care of something or someone.",
  "neigh": "the sound a horse makes.",
  "neighborly": "friendly and helpful, like a good neighbor.",
  "neither": "not one and not the other of two things.",
  "neon": "a bright glowing color or light.",
  "neptune": "the eighth planet from the sun.",
  "nerd": "someone who loves learning or a certain hobby a lot.",
  "nestle": "to settle snugly into a comfortable spot.",
  "network": "a group of connected people, computers, or things.",
  "neuron": "a tiny cell in your brain that sends messages.",
  "neutral": "not taking either side in an argument or contest.",
  "nevertheless": "even so; in spite of that.",
  "newborn": "a baby that was just born.",
  "newcomer": "someone who has just arrived somewhere new.",
  "newlywed": "a person who just got married.",
  "news": "information about things that just happened.",
  "newsletter": "a short paper or email with updates about a group.",
  "newt": "a small animal like a lizard that lives near water.",
  "nibble": "to take small bites of food.",
  "nick": "a small cut or scratch on something.",
  "nickel": "a coin worth five cents.",
  "nifty": "clever, neat, or handy.",
  "nightgown": "a loose garment worn for sleeping.",
  "nightingale": "a small bird known for its beautiful singing.",
  "nightlight": "a small, dim light left on at night.",
  "nightmare": "a scary dream.",
  "nightstand": "a small table next to a bed.",
  "nimble": "able to move quickly and easily.",
  "nine": "the number after eight.",
  "nineteen": "the number after eighteen.",
  "ninety": "the number equal to nine times ten.",
  "ninja": "a fighter from Japan trained to move quietly and secretly.",
  "ninth": "coming right after eighth.",
  "nitpick": "to point out small, unimportant mistakes.",
  "no": "a word used to say you don't agree or don't want something.",
  "noble": "having a good, honest, and generous character.",
  "nobody": "not a single person; no one.",
  "nocturnal": "active at night and resting during the day.",
  "nod": "to move your head up and down to say yes.",
  "noise": "a sound, especially a loud or unpleasant one.",
  "noisemaker": "a small toy or item that makes a loud sound for fun.",
  "nomad": "a person who moves from place to place instead of staying put.",
  "nominate": "to suggest someone for an award or job.",
  "none": "not any; not one.",
  "nonfiction": "writing about real facts and true events.",
  "nonsense": "words or ideas that don't make sense.",
  "nonstop": "without stopping.",
  "nook": "a small, cozy corner or space.",
  "north": "one of the four main directions, toward the top of a map.",
  "northeast": "the direction between north and east.",
  "northern": "located in or coming from the north.",
  "northwest": "the direction between north and west.",
  "nose": "the part of your face used for smelling and breathing.",
  "nosebleed": "when blood comes out of your nose.",
  "nostril": "one of the two openings in your nose.",
  "not": "a word used to make something mean the opposite.",
  "notch": "a small cut or nick in the edge of something.",
  "note": "a short written message.",
  "notepad": "a small pad of paper for writing notes.",
  "nothing": "not anything at all.",
  "notice": "to see or become aware of something.",
  "notify": "to tell someone about something important.",
  "nourish": "to give food and care so something grows healthy.",
  "novel": "a long written story in a book.",
  "novelist": "a person who writes novels.",
  "novice": "someone who is new and still learning something.",
  "nowhere": "not in any place.",
  "nozzle": "the tip of a hose or pipe that controls the flow.",
  "nucleus": "the center part of a cell or an atom.",
  "nugget": "a small lump, like a small piece of gold or food.",
  "nuisance": "someone or something that is annoying.",
  "number": "a word or symbol used for counting.",
  "numeral": "a symbol that stands for a number, like 5 or 10.",
  "numerator": "the top number in a fraction.",
  "numerous": "many; a large number of.",
  "nursery": "a room set up for a baby, or a place that grows plants.",
  "nurture": "to care for and help someone or something grow.",
  "nutcracker": "a tool used to crack open the hard shell of a nut.",
  "nutmeg": "a warm, sweet spice used in baking.",
  "nutrition": "the food and nutrients your body needs to stay healthy.",
  "nutritious": "full of things your body needs to be healthy.",
  "nutshell": "the hard outer shell of a nut.",
  "nutty": "tasting like nuts, or acting a little silly.",
  "nuzzle": "to gently rub or press your nose against something.",
  "nylon": "a strong, smooth man-made fabric or material.",
  "object": "A thing that you can see or touch.",
  "observe": "To watch something closely and carefully.",
  "observation": "Something you notice by watching closely.",
  "obstacle": "Something that is in your way and blocks you.",
  "obtain": "To get or receive something.",
  "obvious": "Very easy to see, notice, or understand.",
  "obey": "To do what someone tells you to do.",
  "occasion": "A special time or event.",
  "occasionally": "Happening sometimes, but not very often.",
  "occupation": "The job or work that a person does.",
  "occupy": "To fill up or take over a space.",
  "occupant": "A person who lives in or uses a place.",
  "occur": "To happen.",
  "octagon": "A shape with eight straight sides.",
  "odor": "A smell, good or bad.",
  "odometer": "A tool in a car that shows how far you traveled.",
  "off": "Not turned on, or away from a place.",
  "offend": "To hurt someone's feelings.",
  "offense": "An action that breaks a rule.",
  "offer": "To hold something out for someone to take.",
  "offering": "Something that is given or offered.",
  "official": "Approved by the people in charge.",
  "offline": "Not connected to the internet.",
  "oh": "A word people say when surprised.",
  "oink": "The sound a pig makes.",
  "ointment": "A soft cream you rub on a sore spot.",
  "okay": "All right, fine, or good.",
  "olive": "A small green or black fruit from a tree.",
  "olympics": "A huge sports contest held every few years.",
  "omit": "To leave something out on purpose.",
  "on": "Turned on, or touching the top of something.",
  "once": "One single time.",
  "one": "The number that comes before two.",
  "ongoing": "Still happening and not finished yet.",
  "online": "Connected to the internet.",
  "only": "Just one, and nothing more.",
  "onto": "Moving to a spot on top of something.",
  "onward": "Moving forward, toward the future.",
  "onlooker": "A person who watches something happening.",
  "oops": "A word said after a small mistake.",
  "ooze": "To slowly leak or flow out.",
  "opal": "A shiny gemstone with many colors.",
  "opaque": "So thick that light cannot pass through it.",
  "opening": "A hole or gap you can pass through.",
  "opera": "A play in which the story is sung.",
  "operate": "To run or work a machine.",
  "operation": "A job done by a machine, or surgery by a doctor.",
  "operator": "A person whose job is to run a machine.",
  "opinion": "What you personally think about something.",
  "opponent": "The person you compete against in a game.",
  "opportunity": "A good chance to do something.",
  "oppose": "To be against something or someone.",
  "opposite": "Completely different, like up and down.",
  "option": "A choice you are allowed to make.",
  "optional": "Something you may choose to do or skip.",
  "or": "A word that shows a choice between things.",
  "oral": "Spoken out loud, not written down.",
  "orchestra": "A large group of musicians playing together.",
  "order": "To ask for something, or to arrange things neatly.",
  "orderly": "Neat and arranged in a tidy way.",
  "ore": "Rock that has metal inside it.",
  "organic": "Grown naturally, without man-made chemicals.",
  "origin": "The place or time something started.",
  "original": "The very first one, not a copy.",
  "ornament": "A small object used to decorate something.",
  "orphan": "A child whose parents have died.",
  "orthodontist": "A dentist who helps straighten crooked teeth.",
  "other": "A different one, not this one here.",
  "otherwise": "If not, then something different will happen.",
  "ouch": "A word you say when something hurts.",
  "ought": "A word meaning you should do something.",
  "ounce": "A small unit used to measure weight.",
  "our": "Belonging to us.",
  "ourselves": "Us, and no one else.",
  "oust": "To force someone out of a job or place.",
  "out": "Not inside, or no longer working.",
  "outburst": "A sudden strong feeling that bursts out.",
  "outcast": "Someone who is left out or ignored by others.",
  "outcome": "The result of something that happened.",
  "outdo": "To do better than someone else.",
  "outdoor": "Happening outside, not inside a building.",
  "outdoors": "The world outside, away from buildings.",
  "outer": "The part on the outside of something.",
  "outfit": "A set of clothes worn together.",
  "outgoing": "Friendly and happy to talk to new people.",
  "outgrow": "To grow too big for something.",
  "outing": "A short trip taken for fun.",
  "outline": "The shape formed by the edge of something.",
  "outlaw": "A person who breaks the law.",
  "outlook": "What you expect to happen in the future.",
  "outnumber": "To be greater in number than another group.",
  "output": "The result or amount a machine or person produces.",
  "outrun": "To run faster than someone else.",
  "outside": "Not inside, in the open air.",
  "outsmart": "To beat someone by being cleverer.",
  "outstanding": "Extremely good, better than most others.",
  "outward": "Facing away from the middle or center.",
  "outweigh": "To be more important or heavier than something.",
  "outwit": "To win by being smarter than someone.",
  "oval": "A shape like a stretched circle, like an egg.",
  "over": "Above something, or finished.",
  "overall": "Thinking about everything together, in general.",
  "overboard": "Falling off the side of a boat.",
  "overbite": "When upper teeth stick out past the lower ones.",
  "overcharge": "To make someone pay more than something is worth.",
  "overcome": "To succeed in dealing with a hard problem.",
  "overcooked": "Cooked for too long.",
  "overcrowded": "Too full of people or things.",
  "overdo": "To do too much of something.",
  "overeat": "To eat more food than you need.",
  "overexcited": "Too excited to sit still or calm down.",
  "overflow": "To spill over the edges because it's too full.",
  "overfill": "To fill something with too much.",
  "overgrown": "Covered with too many plants growing wild.",
  "overhaul": "To fix or rebuild something completely.",
  "overhead": "Above your head, up in the sky.",
  "overhear": "To hear something you were not meant to.",
  "overheat": "To become much too hot.",
  "overjoyed": "Extremely happy about something.",
  "overlap": "To cover part of something else at the same time.",
  "overload": "To put too much weight or work onto something.",
  "overlook": "To miss seeing something by accident.",
  "overnight": "During the whole night.",
  "overpass": "A bridge that carries a road over another road.",
  "overpower": "To be too strong for someone to beat.",
  "overreact": "To react much more strongly than needed.",
  "override": "To use your power to cancel a decision.",
  "overripe": "Fruit that has become too soft and old.",
  "overrun": "To spread quickly and take over a place.",
  "overseas": "Across the ocean, in another country.",
  "oversee": "To watch over work to make sure it's done right.",
  "oversized": "Bigger than the usual or normal size.",
  "overspend": "To spend more money than you should.",
  "overtake": "To catch up to someone and pass them.",
  "overthrow": "To remove a leader from power by force.",
  "overtime": "Extra time spent working or playing.",
  "overtired": "So tired that you feel cranky.",
  "overturn": "To flip something upside down.",
  "overuse": "To use something too much.",
  "overweight": "Weighing more than is healthy.",
  "overwork": "To work too much or too hard.",
  "owe": "To need to pay something back to someone.",
  "owlet": "A baby owl.",
  "own": "To have something that belongs to you.",
  "oxen": "Strong farm animals used to pull heavy loads.",
  "ozone": "A gas high in the sky that shields us from the sun.",
  "obscure": "Hard to see, find, or understand.",
  "observant": "Good at noticing small details.",
  "omnivore": "An animal that eats both plants and meat.",
  "opossum": "A small animal that hangs by its tail.",
  "party": "A fun gathering where people celebrate something together.",
  "parade": "A group of people walking or riding together to celebrate something.",
  "puppet": "A toy figure you move with strings or your hand.",
  "pirate": "Someone who sails the seas and steals from other ships.",
  "purple": "A color made by mixing red and blue.",
  "pink": "A light red color, like a flower petal.",
  "plastic": "A light, strong material used to make many things.",
  "postpone": "To move something to a later time.",
  "path": "A narrow trail made for walking.",
  "porch": "A covered area attached to the front of a house.",
  "plane": "A machine with wings that flies through the sky.",
  "player": "Someone who takes part in a game or sport.",
  "please": "A polite word you use when asking for something.",
  "pleasant": "Nice, friendly, and enjoyable.",
  "plenty": "A large amount of something, more than enough.",
  "plow": "A farm tool that digs up soil for planting.",
  "plump": "A little round and soft, like a plump pillow.",
  "plunge": "To jump or dive into something quickly.",
  "poem": "A piece of writing with rhythm, and sometimes rhyme.",
  "poet": "A person who writes poems.",
  "poison": "Something that can make you very sick if you eat or touch it.",
  "pole": "A long, thin stick or post.",
  "polish": "To rub something until it shines.",
  "pop": "A short, sharp sound, like a balloon bursting.",
  "population": "The number of people who live in a place.",
  "portrait": "A picture that shows a person's face.",
  "pose": "To hold still in a certain position, like for a photo.",
  "position": "The place where something or someone is.",
  "possible": "Able to happen or be done.",
  "post": "To send a letter, or a wooden pole stuck in the ground.",
  "postcard": "A small card you can mail without an envelope.",
  "pounce": "To jump on something suddenly, like a cat does.",
  "pound": "A unit used to measure how heavy something is.",
  "powder": "Tiny dry grains, like flour or baby powder.",
  "power": "The strength or ability to do something.",
  "powerful": "Having a lot of strength or force.",
  "praise": "To say nice things about someone or something.",
  "pray": "To speak quietly to God or a higher power.",
  "prayer": "The words someone says while praying.",
  "precious": "Very valuable, special, or loved.",
  "prepare": "To get ready for something.",
  "preserve": "To keep something safe so it doesn't spoil or get lost.",
  "pretend": "To act like something is real when it isn't.",
  "prevent": "To stop something from happening.",
  "price": "The amount of money something costs.",
  "prick": "A small, sharp poke, like from a pin.",
  "pride": "A happy feeling about something you or others did well.",
  "priest": "A leader in a church who helps people worship.",
  "primary": "The most important, or coming first.",
  "porridge": "A warm breakfast food made from cooked oats.",
  "probably": "Likely to happen, though not completely certain.",
  "problem": "Something that is hard to solve or fix.",
  "process": "A series of steps taken to get something done.",
  "produce": "To make or grow something.",
  "product": "Something that has been made to be sold or used.",
  "profession": "A job that needs special training or skill.",
  "professor": "A teacher who works at a college or university.",
  "program": "A plan or set of steps for doing something.",
  "progress": "Moving forward or getting better at something.",
  "proof": "Facts or evidence that show something is true.",
  "proper": "Correct, suitable, or right for the situation.",
  "protect": "To keep someone or something safe from harm.",
  "protest": "To say or show that you disagree with something.",
  "prove": "To show with facts that something is true.",
  "provide": "To give someone something they need.",
  "public": "Open for anyone to use, see, or join.",
  "publish": "To print and share a book or article with everyone.",
  "puff": "A small burst of air, smoke, or steam.",
  "pump": "A machine that moves air or liquid from one place to another.",
  "punch": "A sweet drink made by mixing different fruit juices.",
  "puncture": "A small hole made by something sharp, like a pin.",
  "punish": "To give someone a consequence for breaking a rule.",
  "pup": "A young dog.",
  "purchase": "To buy something.",
  "pure": "Clean and not mixed with anything else.",
  "purpose": "The reason something is done or made.",
  "purr": "The soft, low sound a happy cat makes.",
  "pursue": "To follow or chase after something.",
  "python": "A large snake that lives in warm places.",
  "pearl": "A small, round, shiny gem found inside some oysters.",
  "quack": "The sound a duck makes.",
  "quad": "A vehicle with four wheels used for riding off-road.",
  "quadrant": "One of four equal parts that a shape or graph is divided into.",
  "quadruple": "To make something four times as big or as many.",
  "quagmire": "A soft, wet area of ground that is hard to walk through.",
  "quail": "A small, round bird that mostly stays on the ground.",
  "quaint": "Old-fashioned in a charming and pleasant way.",
  "quake": "To shake, often because of fear or an earthquake.",
  "qualify": "To do well enough to be allowed to take part.",
  "quality": "How good or bad something is.",
  "quantity": "The amount or number of something.",
  "quarrel": "A small argument between two people.",
  "quart": "A unit used to measure liquids, like milk.",
  "quartz": "A hard, clear or colorful crystal found in rocks.",
  "quaver": "To shake a little, like a nervous voice.",
  "quay": "A place by the water where boats load and unload.",
  "quench": "To satisfy your thirst by drinking something.",
  "query": "A question, especially one asking for information.",
  "quest": "A long journey to find or achieve something important.",
  "queue": "A line of people or things waiting their turn.",
  "quibble": "To argue about something small that doesn't really matter.",
  "quiche": "A savory pie made with eggs, cheese, and vegetables.",
  "quick": "Moving or happening very fast.",
  "quicken": "To become faster or speed up.",
  "quicksand": "Wet, loose sand that can pull you down if you step in it.",
  "quill": "A large feather, or a pen made from one.",
  "quilt": "A warm blanket made of stitched-together pieces of fabric.",
  "quinoa": "A healthy seed that people cook and eat like rice.",
  "quintet": "A group of five people, often musicians playing together.",
  "quip": "A short, clever, and funny remark.",
  "quirk": "A small odd habit that makes someone different.",
  "quirky": "A little strange or unusual in a fun way.",
  "quit": "To stop doing something.",
  "quite": "A word that means very or completely.",
  "quiver": "To shake slightly, or a case for carrying arrows.",
  "quokka": "A small, furry Australian animal that always looks like it's smiling.",
  "quota": "A certain amount that must be reached or given.",
  "quote": "To repeat exactly what someone else said or wrote.",
  "quotient": "The answer you get when you divide one number by another.",
  "radar": "A machine that uses radio waves to find planes or ships.",
  "radio": "A machine that plays music and talk you can listen to.",
  "rag": "A small piece of old cloth used for cleaning.",
  "rail": "A metal bar that trains run on.",
  "railroad": "A track made of rails that trains travel on.",
  "raise": "To lift something up or make it higher.",
  "rally": "A big gathering of people who support the same idea.",
  "ramble": "To walk around slowly with no real plan.",
  "ramp": "A slanted path that connects two different levels.",
  "ranch": "A large farm where animals like cattle or horses are raised.",
  "random": "Happening by chance, without any plan or pattern.",
  "range": "The distance between the lowest and highest amount of something.",
  "ranger": "A person who protects and takes care of a forest or park.",
  "rank": "A person's position or level compared to others.",
  "rap": "A type of music with fast, rhythmic talking instead of singing.",
  "rapid": "Happening very fast.",
  "rapids": "Fast, rough water in a river.",
  "rascal": "A person, often a kid, who is playfully mischievous.",
  "rash": "Red, itchy spots that appear on your skin.",
  "rate": "How fast something happens, or the price of something.",
  "rather": "Would prefer one thing instead of another.",
  "rattle": "A baby toy that makes a shaking noise.",
  "rattlesnake": "A snake that shakes its tail to make a warning sound.",
  "raw": "Not cooked, or in its natural state.",
  "ray": "A thin beam of light.",
  "razor": "A sharp tool used to shave hair off skin.",
  "react": "To do or say something because of what just happened.",
  "reader": "A person who reads, or a book made for practicing reading.",
  "ready": "Prepared and able to do something right away.",
  "real": "Actually true or existing, not pretend.",
  "reality": "The way things truly are, not imagined.",
  "realize": "To suddenly understand or notice something.",
  "really": "Truly, or very much.",
  "rear": "The back part of something.",
  "reason": "The explanation for why something happens.",
  "rebel": "A person who refuses to follow the rules.",
  "rebuild": "To build something again after it was broken.",
  "recall": "To remember something from before.",
  "receipt": "A paper that shows what you bought and how much it cost.",
  "receive": "To get something that is given to you.",
  "recharge": "To fill a battery back up with power.",
  "recognize": "To know who or what something is because you've seen it before.",
  "recommend": "To suggest that someone try or do something good.",
  "record": "To save sound or video, or the best result ever done.",
  "recover": "To get better after being sick or hurt.",
  "rectangle": "A shape with four sides and four corners, like a door.",
  "recycle": "To turn used items into something new instead of throwing them away.",
  "red": "A bright color like a ripe tomato or fire truck.",
  "reduce": "To make something smaller or less.",
  "reflect": "To bounce back light, or to think carefully about something.",
  "reflection": "The image you see of yourself in a mirror or water.",
  "refresh": "To make something new again, like reloading a webpage.",
  "refuse": "To say no to something.",
  "region": "A certain area or part of a country or the world.",
  "register": "To sign up your name for something.",
  "regret": "To feel sorry about something you did or didn't do.",
  "regular": "Happening the same way most of the time; normal.",
  "rehearse": "To practice something, like lines for a play, before doing it for real.",
  "reindeer": "A large deer with antlers that lives in cold places.",
  "reject": "To refuse to accept or agree to something.",
  "rejoice": "To feel or show great happiness.",
  "relate": "To connect one thing with another, or understand someone's feelings.",
  "release": "To let something go free.",
  "reliable": "Able to be trusted to do what is expected.",
  "relief": "A good feeling when worry or pain goes away.",
  "religion": "A set of beliefs about God or gods that people follow.",
  "rely": "To depend on someone or something for help.",
  "remain": "To stay in the same place or condition.",
  "remark": "A short comment someone says.",
  "remarkable": "So special or surprising that people notice it.",
  "remove": "To take something away or off.",
  "renew": "To make something new or valid again.",
  "rent": "Money you pay to use something, like a house, owned by someone else.",
  "replace": "To put a new thing in place of an old one.",
  "reply": "To answer someone.",
  "represent": "To stand for or speak on behalf of someone or something.",
  "request": "To politely ask for something.",
  "require": "To need something.",
  "rescue": "To save someone or something from danger.",
  "research": "To carefully study a topic to learn more about it.",
  "resemble": "To look similar to something or someone else.",
  "reserve": "To set something aside to use later.",
  "resident": "A person who lives in a certain place.",
  "resist": "To fight against or refuse to give in to something.",
  "resolve": "To firmly decide to do something, or to fix a problem.",
  "resort": "A place people visit on vacation to relax and have fun.",
  "resource": "Something useful that people can use, like water or wood.",
  "respond": "To answer or react to something.",
  "response": "An answer or reaction to something.",
  "restore": "To fix something so it looks like new again.",
  "result": "What happens because of something else.",
  "resume": "To start doing something again after stopping.",
  "retire": "To stop working, usually after getting older.",
  "retreat": "To move back away from something.",
  "reveal": "To show or tell something that was hidden or secret.",
  "revenge": "Trying to get back at someone who hurt or upset you.",
  "reverse": "To go backward, or turn something the opposite way.",
  "review": "To look over something again to check or judge it.",
  "revise": "To change and improve something you already wrote.",
  "revolve": "To turn around in a circle, like the earth around the sun.",
  "rhyme": "Words that end with the same sound, like cat and hat.",
  "rhythm": "A regular pattern of beats or sounds, like in music.",
  "rich": "Having a lot of money or things.",
  "riddle": "A tricky question or puzzle with a clever answer.",
  "ridiculous": "So silly or strange that it seems funny.",
  "right": "Correct, or the side opposite of left.",
  "rim": "The edge or border around something round, like a cup.",
  "rink": "A flat area of ice or floor used for skating.",
  "rip": "To tear something apart.",
  "rise": "To go up or get higher.",
  "risk": "The chance that something bad might happen.",
  "rival": "Someone you compete against.",
  "roam": "To wander around without a fixed direction.",
  "roar": "A loud, deep sound like a lion makes.",
  "roast": "To cook food slowly using dry heat, like in an oven.",
  "rob": "To steal something from a person or place.",
  "robber": "A person who steals things.",
  "robot": "A machine that can be programmed to do tasks on its own.",
  "rocky": "Full of rocks.",
  "rod": "A thin, straight stick or bar, like a fishing rod.",
  "rodent": "A small animal with sharp front teeth, like a mouse.",
  "rodeo": "A show where cowboys ride horses and bulls.",
  "role": "The part someone plays in a movie, play, or job.",
  "roller coaster": "A fast amusement park ride with steep ups and downs.",
  "romance": "A story about two people falling in love.",
  "room": "A space inside a building with walls around it.",
  "roommate": "A person you share a room or home with.",
  "rot": "When food or wood slowly breaks down and goes bad.",
  "rotate": "To turn around in a circle.",
  "route": "The path you take to get somewhere.",
  "routine": "The things you usually do the same way every day.",
  "royal": "Having to do with a king or queen.",
  "rub": "To move your hand back and forth against something.",
  "rubber": "A stretchy material used to make tires and erasers.",
  "rubbish": "Trash or garbage.",
  "rubble": "Broken pieces of brick or stone.",
  "ruby": "A red gemstone.",
  "ruin": "To spoil or destroy something.",
  "rumble": "A low, deep, rolling sound.",
  "rumor": "A story people tell that might not be true.",
  "runner": "A person who runs, often in a race.",
  "rural": "Having to do with the countryside instead of the city.",
  "rust": "The orange-brown coating that forms on metal left in water or air.",
  "rustle": "A soft crackling sound, like leaves moving in the wind.",
  "rusty": "Covered with rust.",
  "tale": "a story that is told, especially one that might not be true",
  "talent": "a natural skill that someone is good at",
  "tame": "gentle and safe to be near, not wild",
  "tangle": "to twist together in a messy knot",
  "tank": "a large container that holds liquid or gas",
  "target": "something you aim at or try to hit",
  "task": "a job or piece of work you need to do",
  "tease": "to joke with someone in a playful or unkind way",
  "teacup": "a small cup used for drinking tea",
  "temper": "how calm or angry a person feels",
  "ten": "the number that comes after nine",
  "tender": "soft and gentle, or easy to hurt",
  "tent": "a shelter made of cloth held up by poles",
  "tepee": "a tall, cone-shaped tent",
  "terrible": "very bad or unpleasant",
  "terrier": "a small, energetic breed of dog",
  "terrific": "really wonderful or great",
  "text": "words that are written or typed",
  "thank": "to tell someone you appreciate what they did",
  "theme": "the main idea of a story or event",
  "thermos": "a container that keeps drinks hot or cold",
  "thief": "someone who takes things that are not theirs",
  "thigh": "the part of your leg above your knee",
  "thing": "any object, idea, or item",
  "third": "coming right after second",
  "thirst": "the feeling of needing something to drink",
  "thirteen": "the number that comes after twelve",
  "thought": "an idea that forms in your mind",
  "thousand": "the number 1,000",
  "thread": "a thin string used for sewing",
  "three": "the number that comes after two",
  "throne": "a special chair used by a king or queen",
  "through": "going in one side and out the other",
  "thumb": "the short, thick finger on your hand",
  "ticket": "a small piece of paper that lets you enter or ride something",
  "tight": "fitting very closely, not loose",
  "tightrope": "a rope high in the air that performers walk on",
  "tile": "a flat piece used to cover floors or walls",
  "tin": "a soft silvery metal, or a small metal container",
  "tinsel": "shiny strips used to decorate a Christmas tree",
  "tip": "the pointed end of something",
  "toboggan": "a long sled used for sliding down snow",
  "toe": "one of the small parts at the end of your foot",
  "together": "with each other, not apart",
  "token": "a small object used instead of money",
  "tone": "the way a sound or someone's voice comes across",
  "tongs": "a tool with two arms used to pick things up",
  "tonight": "the night of the current day",
  "tool": "something you use to help do a job",
  "toothpick": "a tiny stick used to clean between your teeth",
  "top": "the highest part of something",
  "topic": "the subject that is being talked about",
  "torch": "a light you carry, or a burning stick",
  "tortilla": "a thin, round flatbread used to wrap food",
  "total": "the whole amount when everything is added together",
  "tower": "a tall, narrow building or part of one",
  "trace": "to copy something by drawing over it",
  "track": "a path, or the marks something leaves behind",
  "trade": "to swap one thing for another",
  "tradition": "something a family or group does the same way each year",
  "traffic": "the cars and other vehicles moving along a road",
  "trail": "a path through woods, hills, or open land",
  "trailer": "a container or home that is pulled behind a vehicle",
  "transform": "to change into something different",
  "transport": "to carry people or things from one place to another",
  "trap": "a device used to catch an animal",
  "trapeze": "a swinging bar that circus performers do tricks on",
  "trash": "things that are thrown away because they are not needed",
  "treadmill": "a machine for walking or running while staying in place",
  "treasure": "valuable things, like gold, jewels, or coins",
  "treat": "something special and nice, like a piece of candy",
  "treehouse": "a small house built up in the branches of a tree",
  "triangle": "a shape with three sides and three corners",
  "tribe": "a group of people who share the same customs",
  "trick": "a clever or sneaky action, often meant to fool someone",
  "trillion": "an extremely large number, a thousand billion",
  "trio": "a group of three people or things",
  "tripod": "a three-legged stand that holds something steady",
  "troll": "a made-up creature in stories, often big and grumpy",
  "trombone": "a brass instrument you slide to change its notes",
  "troop": "a group of scouts or soldiers who work together",
  "trouble": "a problem or difficulty",
  "trousers": "pants that cover both legs",
  "true": "real and correct, not false",
  "trust": "to believe that someone is honest and reliable",
  "truth": "something that is really true, not a lie",
  "tub": "a large open container for holding water",
  "tube": "a long, hollow pipe",
  "tuck": "to push something neatly into place",
  "tuna": "a large fish that is often eaten in sandwiches or salads",
  "tune": "a simple, pleasant series of musical notes",
  "turnip": "a round, white or purple vegetable that grows underground",
  "tweet": "a short chirping sound a bird makes",
  "tweezers": "a small tool used to pick up or pull out tiny things",
  "twelve": "the number that comes after eleven",
  "twenty": "the number that comes after nineteen",
  "twice": "two times",
  "twinkle": "to shine with a flickering, sparkling light",
  "tummy": "a friendly word for your stomach",
  "tutu": "a short, fluffy skirt worn by ballet dancers",
  "up": "toward a higher place or position",
  "upon": "on top of something",
  "upper": "higher than something else",
  "uppercase": "a big capital letter, like A instead of a",
  "upright": "standing straight up",
  "uproar": "a lot of loud noise and shouting",
  "upside": "the top or higher part of something",
  "upstairs": "on a higher floor of a building",
  "upstream": "moving against the flow of a river",
  "uptown": "the upper part of a town or city",
  "upward": "moving toward a higher place",
  "urban": "having to do with a city",
  "urge": "a strong wish to do something",
  "urgent": "needing quick action right away",
  "us": "the word for me and someone else together",
  "usable": "able to be used",
  "usage": "the way something is used",
  "use": "to do something with an object for a job",
  "used": "something that is not new",
  "useful": "helpful for doing something",
  "useless": "not helpful at all",
  "user": "a person who uses something",
  "usher": "someone who shows people to their seats",
  "usual": "happening most of the time, normal",
  "usually": "most of the time",
  "utensil": "a tool used for eating or cooking",
  "utility": "a useful service, like water or electricity",
  "utter": "to say something out loud",
  "u-turn": "turning a car around to go the opposite way",
  "ukulele": "a small guitar with four strings",
  "umpire": "a person who makes sure a sports game follows the rules",
  "unaware": "not knowing about something",
  "unattended": "left alone without anyone watching it",
  "unavailable": "not able to be used or reached right now",
  "unbearable": "so hard or bad it's difficult to put up with",
  "unbeaten": "never having lost a game or contest",
  "unbelievable": "so surprising it is hard to believe",
  "unblock": "to remove something that is stopping the way",
  "unbroken": "still whole, not broken",
  "unbuckle": "to undo a buckle",
  "unbutton": "to undo the buttons on clothing",
  "uncap": "to take the cap or lid off something",
  "uncertain": "not sure about something",
  "unchanged": "staying exactly the same",
  "unclean": "not clean",
  "unclear": "hard to understand",
  "uncomfortable": "not feeling relaxed or at ease",
  "uncommon": "not seen or found very often",
  "uncooked": "not cooked yet, raw",
  "uncover": "to take the cover off something",
  "undamaged": "not hurt or broken",
  "undecided": "not having made up your mind yet",
  "undefeated": "never having lost",
  "undercover": "working secretly, in disguise",
  "underarm": "the area under your arm",
  "underdog": "someone not expected to win",
  "underground": "below the surface of the ground",
  "underline": "to draw a line under a word",
  "underneath": "below or under something else",
  "underpants": "clothing worn under your other clothes",
  "underpass": "a road or path that goes under another road",
  "undersea": "below the surface of the sea",
  "undershirt": "a shirt worn under your other clothes",
  "undersized": "smaller than the normal size",
  "underwater": "below the surface of water",
  "underway": "already happening or started",
  "underweight": "weighing less than is normal",
  "undo": "to reverse something you just did",
  "undress": "to take off your clothes",
  "uneven": "not flat or smooth",
  "unexpected": "surprising, not thought to happen",
  "unfair": "not treating people equally or fairly",
  "unfamiliar": "not known or recognized",
  "unfasten": "to undo something that was fastened",
  "unfinished": "not yet completed",
  "unfit": "not in good physical shape",
  "unfold": "to open something that was folded",
  "unfortunate": "unlucky",
  "ungrateful": "not thankful for something",
  "unhappy": "feeling sad",
  "unhealthy": "not good for your body",
  "unicorn": "an imaginary horse with a horn on its head",
  "unicycle": "a bike that has only one wheel",
  "unimportant": "not mattering very much",
  "uninterested": "not caring about something",
  "uninvited": "not asked to come",
  "union": "a group of people or things joined together",
  "unite": "to join together as one",
  "united": "joined together as one",
  "unjust": "not fair or right",
  "unkind": "not nice to others",
  "unknown": "not known or familiar",
  "unleash": "to let something loose",
  "unless": "except if",
  "unlike": "different from",
  "unlikely": "not expected to happen",
  "unlimited": "having no limit",
  "unload": "to take things off or out of something",
  "unlucky": "having bad luck",
  "unmade": "not put together, like an unmade bed",
  "unnatural": "not normal or usual",
  "unnecessary": "not needed",
  "unofficial": "not approved in a formal way",
  "unopened": "not yet opened",
  "unpainted": "not covered in paint",
  "unplanned": "not decided or arranged ahead of time",
  "unpaid": "not yet paid for",
  "unpleasant": "not nice, disagreeable",
  "unplug": "to remove a plug from an outlet",
  "unpopular": "not liked by many people",
  "unpredictable": "hard to guess what will happen next",
  "unprepared": "not ready for something",
  "unreal": "not real, like in a dream",
  "unreasonable": "not fair or sensible",
  "unreliable": "not able to be trusted",
  "unripe": "not yet ready to eat, like green fruit",
  "unroll": "to open something that was rolled up",
  "unsafe": "dangerous, not safe",
  "unscrew": "to loosen something by turning it",
  "unseen": "not seen by anyone",
  "unselfish": "caring about others more than yourself",
  "unstable": "not steady, likely to fall or change",
  "unsteady": "not firm or well balanced",
  "unstoppable": "impossible to stop",
  "unsuccessful": "not managing to do something",
  "unsuitable": "not right for a certain purpose",
  "untamed": "wild, not trained or tamed",
  "untidy": "messy",
  "untie": "to undo a knot",
  "untouched": "not touched by anyone",
  "untrue": "not true",
  "unused": "never used before",
  "unveil": "to remove a cover and show something new",
  "unwanted": "not wanted by anyone",
  "unwashed": "not washed",
  "unwelcome": "not wanted or invited",
  "unwell": "feeling sick",
  "unwilling": "not wanting to do something",
  "unwind": "to relax after being busy",
  "unwise": "not smart or sensible",
  "unwrap": "to take the wrapping off something",
  "unzip": "to open a zipper",
  "upbeat": "cheerful and full of hope",
  "upgrade": "to make something better or newer",
  "upload": "to send a file or data onto the internet",
  "usb": "a small plug used to connect computer devices",
  "unconscious": "not awake and not aware of what is happening",
  "unequal": "not the same in size or amount",
  "uninhabited": "not lived in by anyone",
  "unintentional": "not done on purpose",
  "vacant": "a place that is empty, with nothing or no one inside",
  "vacate": "to leave a place empty",
  "vague": "not clear or exact",
  "vain": "too proud of how you look",
  "valentine": "a card or gift given to someone you like",
  "valiant": "very brave, especially in a hard situation",
  "valid": "true, correct, or acceptable",
  "validate": "to show or prove that something is true",
  "valuable": "worth a lot of money or very important",
  "value": "how much something is worth",
  "valve": "a part that controls the flow of liquid or gas",
  "vampire": "a make-believe creature that drinks blood",
  "vandal": "someone who damages property on purpose",
  "vandalism": "damaging or destroying property on purpose",
  "vane": "a tool that shows which way the wind is blowing",
  "vanish": "to disappear suddenly",
  "vanity": "being too proud of your looks or achievements",
  "vanquish": "to defeat someone or something completely",
  "vantage": "a good position that lets you see clearly",
  "vaporize": "to change into a gas or mist",
  "vapor": "tiny drops of water floating in the air, like steam",
  "variable": "something that can change or is not fixed",
  "varied": "made up of many different kinds",
  "variety": "many different kinds of something",
  "various": "several different types of something",
  "varnish": "a clear, shiny coating painted on wood",
  "vary": "to change or be different",
  "vase": "a container used to hold flowers",
  "vault": "a strong, locked room used to store valuable things",
  "veal": "meat that comes from a young cow",
  "veer": "to suddenly change direction",
  "vegetarian": "a person who does not eat meat",
  "vegetation": "plants growing in a certain place",
  "vehicle": "something used to carry people or things, like a car",
  "veil": "a thin piece of cloth worn over the face or head",
  "velcro": "a fabric with tiny hooks and loops that stick together",
  "velvet": "a soft, smooth cloth",
  "vendor": "a person who sells things",
  "venom": "poison made by an animal such as a snake",
  "venomous": "able to make poison, like some snakes",
  "vent": "an opening that lets air move in or out",
  "ventilation": "a way of letting fresh air move through a space",
  "ventriloquist": "someone who can talk without moving their lips",
  "venture": "a new and sometimes risky plan or trip",
  "venue": "the place where an event happens",
  "verb": "a word that shows an action, like run or jump",
  "verbal": "spoken instead of written",
  "verdict": "the decision made at the end of a trial",
  "verify": "to check that something is true",
  "vermin": "small animals or bugs that cause damage, like rats",
  "versatile": "able to do many different things well",
  "verse": "a group of lines in a poem or song",
  "version": "one form of something that has other forms",
  "versus": "against, used to compare two things",
  "vertebra": "one of the small bones that make up your backbone",
  "vertex": "the point where two lines or edges meet",
  "vertical": "standing straight up and down",
  "vertigo": "a dizzy, spinning feeling",
  "very": "a word used to make another word stronger",
  "vessel": "a ship or boat, or a container that holds liquid",
  "vet": "a short word for a doctor who treats animals",
  "veteran": "a person with a lot of experience, or a former soldier",
  "veto": "to officially say no to a plan or decision",
  "via": "by way of, or through",
  "viable": "able to work or succeed",
  "viaduct": "a long bridge that carries a road over a valley",
  "vial": "a small glass bottle",
  "vibrant": "full of bright color or lively energy",
  "vibrate": "to shake quickly back and forth",
  "vicinity": "the area near or around a place",
  "vicious": "very rough, fierce, or unkind",
  "victim": "someone who has been hurt or harmed",
  "victorious": "having won a fight or contest",
  "victory": "the act of winning",
  "video": "moving pictures that you can watch",
  "view": "what you can see from a certain spot",
  "viewer": "a person who watches something",
  "viewfinder": "the part of a camera you look through to frame a picture",
  "viewpoint": "the way a person thinks about something",
  "vigilant": "watchful and careful about danger",
  "vigor": "energy and strength",
  "vigorous": "done with a lot of energy and strength",
  "villager": "a person who lives in a village",
  "villain": "the bad character in a story",
  "vinyl": "a kind of plastic, or an old style of music record",
  "viola": "a musical instrument like a violin but a bit bigger",
  "violate": "to break a rule or law",
  "violent": "using force in a rough or harmful way",
  "violet": "a light purple color",
  "viper": "a kind of poisonous snake",
  "viral": "spreading very quickly, especially online",
  "virtual": "existing on a computer instead of in real life",
  "virtue": "a good quality in a person, like honesty",
  "virtuous": "behaving in a good and honest way",
  "virus": "a tiny germ that can make you or a computer sick",
  "visa": "a document that lets you enter another country",
  "visible": "able to be seen",
  "vision": "the ability to see, or a picture in your imagination",
  "visionary": "someone with big, creative ideas for the future",
  "visor": "a part of a hat or helmet that shields your eyes",
  "vista": "a wide, beautiful view",
  "visual": "having to do with seeing",
  "visualize": "to picture something clearly in your mind",
  "vital": "very important or necessary",
  "vitality": "energy and liveliness",
  "vivid": "very bright, clear, or lifelike",
  "vlog": "a video someone makes and shares online like a diary",
  "vocal": "having to do with the voice or singing",
  "vocalist": "a singer",
  "vocation": "a job or career that someone chooses",
  "voice": "the sound you make when you talk or sing",
  "void": "completely empty space, or not valid",
  "voltage": "the force that pushes electricity through a wire",
  "volume": "how loud a sound is, or the amount of space something fills",
  "voluntary": "done by choice, not because you have to",
  "volunteer": "a person who helps without being paid",
  "vomit": "to throw up food from your stomach",
  "voracious": "having a huge appetite for food or something else",
  "vortex": "a fast spinning swirl of air or water",
  "vote": "to choose something by marking a paper or raising a hand",
  "voter": "a person who votes",
  "vouch": "to say you trust or believe in someone",
  "voucher": "a piece of paper you can trade for something",
  "vow": "a serious, important promise",
  "vowel": "one of the letters a, e, i, o, or u",
  "voyage": "a long trip, often by boat",
  "voyager": "a person who goes on a long journey",
  "vulgar": "rude, crude, or not polite",
  "wag": "to move quickly from side to side, like a dog's tail",
  "waggle": "to move something side to side in a wiggly way",
  "wail": "to cry out loudly and sadly",
  "waist": "the narrow part of your body above your hips",
  "wait": "to stay in one place until something happens",
  "waltz": "a graceful dance with three beats in each measure",
  "wand": "a thin stick used by magicians or fairies in stories",
  "want": "to wish for or desire something",
  "warmth": "a comfortable feeling of heat",
  "warp": "to bend or twist out of its normal shape",
  "was": "a word used to talk about something in the past",
  "waste": "to use something carelessly instead of wisely",
  "wasteful": "using too much of something without a good reason",
  "watchdog": "a dog trained to guard a house",
  "watchful": "paying close attention so you notice things",
  "water bottle": "a container you carry water in for drinking",
  "watercolor": "a paint that mixes with water, or a picture made with it",
  "watering can": "a container with a spout used to water plants",
  "waterproof": "made so that water cannot get through",
  "waterslide": "a slide with water that you zoom down into a pool",
  "watery": "full of water, or thin and weak like water",
  "wax": "a soft material that melts easily, used to make candles",
  "waxy": "feeling or looking smooth and shiny like wax",
  "way": "a path, direction, or method of doing something",
  "weaken": "to make something less strong",
  "wealth": "a large amount of money or valuable things",
  "weary": "very tired",
  "weave": "to cross threads over and under each other to make cloth",
  "webcam": "a small camera connected to a computer",
  "webpage": "a single page you can look at on a website",
  "website": "a place on the internet you can visit",
  "wedding": "a ceremony where two people get married",
  "wedge": "a piece shaped like a triangle, thick at one end",
  "weep": "to cry",
  "weigh": "to find out how heavy something is",
  "weightless": "having no weight, like floating in space",
  "weightlifting": "a sport where you lift heavy weights",
  "weld": "to join pieces of metal together using heat",
  "well": "a deep hole dug in the ground to reach water",
  "were": "a word used to talk about more than one person in the past",
  "west": "the direction where the sun sets",
  "wetsuit": "a rubber suit that keeps you warm in cold water",
  "wharf": "a platform on the shore where boats load and unload",
  "what": "a word used to ask about something",
  "wheelbarrow": "a small cart with one wheel, used to carry things",
  "wheelie": "a trick where you ride a bike on its back wheel only",
  "wheeze": "to breathe with a whistling, raspy sound",
  "when": "a word used to ask about time",
  "where": "a word used to ask about a place",
  "whether": "a word used when choosing between two things",
  "which": "a word used to ask someone to choose",
  "whiff": "a quick smell of something",
  "whim": "a sudden idea or wish to do something",
  "whimper": "to cry in a soft, weak voice",
  "whine": "to complain in an annoying, high voice",
  "whinny": "the sound a horse makes",
  "whirl": "to spin around quickly",
  "whirlpool": "a spot in water that spins around fast",
  "whisk": "a kitchen tool used to beat eggs or cream",
  "white": "the color of snow or milk",
  "who": "a word used to ask about a person",
  "whoever": "any person at all",
  "whoop": "a loud shout of joy or excitement",
  "whose": "a word used to ask who something belongs to",
  "why": "a word used to ask the reason for something",
  "wick": "the string in the middle of a candle that burns",
  "wicked": "very bad or evil",
  "wicker": "made by weaving thin branches together, like a basket",
  "widen": "to make something wider",
  "width": "how wide something is",
  "wig": "a covering of fake hair worn on the head",
  "wiggle": "to move side to side with small movements",
  "wiggly": "moving with lots of small twists and turns",
  "will": "a word used to talk about something that will happen",
  "willing": "ready and happy to do something",
  "willpower": "strong determination to do something hard",
  "wilt": "when a plant droops because it needs water",
  "wince": "to make a face because something hurts a little",
  "windmill": "a machine with big blades turned by the wind",
  "windowsill": "the ledge at the bottom of a window",
  "windpipe": "the tube in your throat that air goes through",
  "windshield": "the front window of a car",
  "wingspan": "the distance from one wingtip to the other",
  "winner": "someone who wins a game or contest",
  "wiper": "a blade on a car that wipes rain off the windshield",
  "wire": "a thin piece of metal that bends, used to carry electricity",
  "wireless": "not needing wires or cords to work",
  "wisdom": "knowing what is smart and right",
  "wish": "to hope for something you want",
  "wishbone": "a Y-shaped bone in a bird that people break for luck",
  "wisp": "a small, thin piece of something, like smoke or hair",
  "witch": "a make-believe person in stories who can do magic",
  "with": "together with someone or something",
  "withdraw": "to take something back or move away",
  "wither": "to dry up and shrink, like a plant without water",
  "within": "inside of something, or before time runs out",
  "without": "not having something",
  "witness": "someone who sees something happen",
  "witty": "clever and funny at the same time",
  "wizard": "a make-believe person in stories with magic powers",
  "wok": "a round pan used for cooking food quickly",
  "woof": "the sound a dog makes",
  "wooden": "made out of wood",
  "wool": "soft, curly hair from sheep used to make clothes",
  "woolly": "covered in soft, thick wool",
  "woozy": "feeling dizzy or a little sick",
  "work": "a job or task that takes effort",
  "workbench": "a sturdy table used for building or fixing things",
  "workbook": "a book with pages for writing answers and practicing",
  "workout": "exercise you do to stay strong and healthy",
  "workplace": "the place where someone does their job",
  "workshop": "a room where things are built or fixed",
  "world": "the Earth and everyone who lives on it",
  "worldwide": "happening everywhere on Earth",
  "worn": "old and used a lot",
  "worrywart": "someone who worries about things a lot",
  "worry": "to feel nervous about something that might happen",
  "worse": "more bad than before",
  "worsen": "to become worse",
  "worst": "the most bad of all",
  "worth": "how valuable or important something is",
  "worthwhile": "important enough to be worth the time or effort",
  "worthy": "deserving respect or a reward",
  "would": "a word used to talk about something that might happen",
  "wow": "a word you say when something amazes you",
  "wrapper": "the paper or plastic covering around something like candy",
  "wreath": "a circle of leaves or flowers, often hung as decoration",
  "wreck": "something badly damaged, or to badly damage something",
  "wren": "a small brown bird that sings",
  "wriggle": "to twist and turn your body like a worm",
  "wring": "to twist and squeeze water out of something wet",
  "wrinkle": "a small fold or crease in skin or fabric",
  "wrinkly": "having lots of wrinkles",
  "wristwatch": "a small clock worn on your wrist",
  "written": "put into words on paper",
  "wrong": "not correct or not right",
  "wage": "money paid to someone for the work they do",
  "wallpaper": "paper used to decorate the walls of a room",
  "weatherman": "someone on TV who tells you what the weather will be",
  "x": "A letter used in math to mean times, or to mark a spot.",
  "x-axis": "The flat line that goes left and right on a graph.",
  "x-factor": "A special quality that makes someone stand out.",
  "x-ray": "A picture that shows the bones inside your body.",
  "x-ray vision": "A pretend power to see through solid things, like in comics.",
  "x-raying": "Taking a picture that shows the bones inside a body.",
  "xanthan gum": "A thick, gooey ingredient used to make sauces and gluten-free food.",
  "xenial": "Being friendly and welcoming to guests.",
  "xenograft": "Body tissue moved from an animal of one kind into a different kind.",
  "xenon": "A colorless gas with no smell, used in some bright lights.",
  "xenophobia": "A fear or dislike of people who seem different or unfamiliar.",
  "xeric": "Describes a place, like a desert, that is very dry.",
  "xerophyte": "A plant, like a cactus, that can live with very little water.",
  "xerox": "To make a copy of paper using a special copying machine.",
  "xi": "A letter from the Greek alphabet, sometimes used in math.",
  "xiphoid": "A small pointy bone at the bottom of your breastbone.",
  "xl": "A clothing size that means extra large.",
  "xmas": "A short way to write the word Christmas.",
  "xoxo": "A way to write hugs and kisses at the end of a note.",
  "xylem": "The tiny tubes inside a plant that carry water up from the roots.",
  "xylitol": "A sweet sugar substitute found in some chewing gum and toothpaste.",
  "xylophone": "A musical instrument with bars you hit to make different notes.",
  "xylophonist": "A person who plays the xylophone.",
  "yellow": "a bright color like the sun or a banana.",
  "yes": "a word used to agree or say something is true.",
  "you": "the person someone is speaking to.",
  "your": "belonging to the person being spoken to.",
  "yours": "something that belongs to you.",
  "yourself": "you, and no one else.",
  "yell": "to shout very loudly.",
  "yield": "to stop or slow down and let others go first.",
  "yikes": "a word you say when you are surprised or worried.",
  "yippee": "a word you shout when you are very happy.",
  "yarn": "thick soft thread used for knitting.",
  "yard": "a piece of grassy ground outside a house.",
  "yardstick": "a long stick used to measure things.",
  "yeast": "a tiny living thing used to make bread rise.",
  "yummy": "very tasty and good to eat.",
  "yucky": "not nice at all; gross.",
  "yuck": "a word you say when something is disgusting.",
  "yo-yo": "a round toy on a string that spins up and down.",
  "yodel": "to sing while quickly changing your voice up and down.",
  "youth": "the time in life when a person is young.",
  "youthful": "looking or feeling young and full of energy.",
  "yearn": "to want something very much.",
  "yeah": "a casual way of saying yes.",
  "yep": "another casual way of saying yes.",
  "yea": "an old-fashioned way of saying yes.",
  "yo": "a casual way to say hello.",
  "yoke": "a wooden bar used to join two animals for pulling.",
  "younger": "not as old as someone else.",
  "youngster": "a young person or child.",
  "yak": "a large hairy animal that looks like a cow.",
  "yam": "a vegetable that looks a bit like a sweet potato.",
  "yellowjacket": "a small black and yellow insect that can sting.",
  "yonder": "a word meaning over there, in the distance.",
  "yeti": "an imaginary furry monster said to live in snowy mountains.",
  "yoo-hoo": "something you call out to get someone's attention.",
  "yowl": "a long, loud cry, like an upset cat makes.",
  "yip": "a short, high-pitched bark from a small dog.",
  "yearling": "a young animal that is about one year old.",
  "yearbook": "a book of photos and memories from a school year.",
  "zany": "silly and funny in a wild, unusual way.",
  "zap": "to hit something with a sudden burst of energy.",
  "zeal": "great excitement and energy for doing something.",
  "zealous": "full of energy and eagerness for something.",
  "zed": "the British way of saying the letter Z.",
  "zenith": "the highest point that something reaches.",
  "zephyr": "a soft, gentle breeze.",
  "zero": "the number 0, meaning nothing at all.",
  "zest": "great excitement and enthusiasm for life.",
  "zesty": "having a fresh, tangy, exciting flavor.",
  "zigzag": "a line that turns sharply from side to side.",
  "zilch": "an informal word meaning nothing at all.",
  "zillion": "a made-up word for an extremely huge number.",
  "zinc": "a shiny grayish metal used to make other things.",
  "zing": "a lively, exciting feeling or sound.",
  "zinger": "a quick, clever, and surprising remark.",
  "zip": "to move somewhere very quickly.",
  "zipline": "a cable you slide down while hanging from a pulley.",
  "zippy": "fast, lively, and full of energy.",
  "zircon": "a hard, shiny gemstone found in the ground.",
  "ziti": "a type of tube-shaped pasta.",
  "zodiac": "a set of twelve symbols based on the stars.",
  "zombie": "a pretend creature in stories that walks like it is dead.",
  "zone": "a certain area or part of a place.",
  "zonked": "an informal word meaning extremely tired.",
  "zoologist": "a scientist who studies animals.",
  "zoology": "the science of studying animals.",
  "zookeeper": "a person whose job is caring for zoo animals.",
  "zoom": "to move or travel very fast.",
  "zucchini": "a long green vegetable that grows on a vine.",
  "zeppelin": "a huge airship shaped like a giant balloon.",
  "zamboni": "a machine that smooths the ice at a skating rink."
};

// Matches "what does X mean", "what is the meaning of X", "define X".
function extractDefinitionQuery(text) {
  const t = text.toLowerCase().trim().replace(/\?+$/, "");
  const patterns = [/^what does (.+?) mean$/, /^what's (.+?) mean$/, /^what is the meaning of (.+)/, /^define (.+)/];
  for (const p of patterns) {
    const m = t.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

function addDefinitionReply(word) {
  const def = WORD_DEFINITIONS[word];
  if (!def) {
    addMessage("I don't know that word yet — I only know a list of common words so far.", "suin");
    return;
  }
  addMessage("\"" + word + "\" means: " + def, "suin");
}

// NOTE: web search (Wikipedia) was tried and turned back OFF. Searching
// "octopus tentacles" returned a real Wikipedia article that isn't
// appropriate for kids — plain Wikipedia search has no safety filter, and
// this project doesn't have one either. Don't re-add internet search here
// without a parent deciding how to make it safe first.

// ===== Math =====
//
// Word-matching can't answer math — there's no way to have an "example"
// for every possible sum. Instead this actually calculates the answer with
// a small real parser, respecting order of operations (multiply/divide
// before add/subtract). Deliberately NOT using JavaScript's eval() — that
// would run ANY typed text as real code, not just math, which is a classic
// security hole. This only ever understands numbers and + - * / ( ).

// Turns word-forms into symbols and strips filler words, so "what is 5
// plus 3" and "5+3" both end up as the same clean string.
function extractMathExpression(text) {
  let cleaned = " " + text.toLowerCase() + " ";
  cleaned = cleaned.replace(/what'?s|what is|calculate|solve|please|equals?|=|\?/g, " ");
  cleaned = cleaned.replace(/\bplus\b/g, "+");
  cleaned = cleaned.replace(/\bminus\b/g, "-");
  cleaned = cleaned.replace(/\btimes\b|\bmultiplied by\b/g, "*");
  cleaned = cleaned.replace(/\bdivided by\b/g, "/");
  cleaned = cleaned.replace(/\bx\b/g, "*");

  const compact = cleaned.replace(/\s+/g, "");
  const hasOperator = /[+\-*/]/.test(compact);
  const onlyMathChars = /^[\d+\-*/.()]+$/.test(compact);

  return compact && hasOperator && onlyMathChars ? compact : null;
}

// A small recursive-descent parser: parseExpr handles + and - (lowest
// precedence), parseTerm handles * and / (higher precedence, so they bind
// tighter), parseFactor handles single numbers and parenthesized groups.
// Calling parseTerm from inside parseExpr (instead of just reading numbers
// directly) is the actual trick that makes "2 + 3 * 4" correctly compute
// the multiplication first.
function evalMathExpression(expr) {
  const tokens = expr.match(/\d+\.?\d*|[+\-*/()]/g) || [];
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseFactor() {
    if (peek() === "(") {
      next();
      const val = parseExpr();
      next(); // consume ")"
      return val;
    }
    if (peek() === "-") {
      next();
      return -parseFactor();
    }
    return parseFloat(next());
  }

  function parseTerm() {
    let val = parseFactor();
    while (peek() === "*" || peek() === "/") {
      const op = next();
      const rhs = parseFactor();
      val = op === "*" ? val * rhs : val / rhs;
    }
    return val;
  }

  function parseExpr() {
    let val = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const rhs = parseTerm();
      val = op === "+" ? val + rhs : val - rhs;
    }
    return val;
  }

  return parseExpr();
}

function addMathReply(expr) {
  let result;
  try {
    result = evalMathExpression(expr);
  } catch (e) {
    result = NaN;
  }

  if (!Number.isFinite(result)) {
    addMessage("🧮 Hmm, that math didn't work out — try something like \"5 + 3\" or \"what is 12 * 4\".", "suin");
    return;
  }

  const rounded = Math.round(result * 1e9) / 1e9; // trim floating-point noise like 0.1+0.2
  addMessage("🧮 " + expr + " = " + rounded, "suin");
}

// ===== Picture drawing =====
//
// Not real AI image generation (that needs a paid API + server, same as
// real web search would have). This is genuinely generative though — code
// that draws shapes with rules, different every time you ask, just not
// using a neural network. Suin only knows how to draw a handful of things;
// anything else gets a fallback of random abstract shapes.

function extractDrawSubject(text) {
  const t = text.toLowerCase();
  const patterns = [
    /^draw (?:me )?(?:a |an )?(.+)/,
    /^picture of (?:a |an )?(.+)/,
    /^image of (?:a |an )?(.+)/,
    /^paint (?:me )?(?:a |an )?(.+)/
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

function drawSun(ctx) {
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(80, 80, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(80 + Math.cos(angle) * 40, 80 + Math.sin(angle) * 40);
    ctx.lineTo(80 + Math.cos(angle) * 55, 80 + Math.sin(angle) * 55);
    ctx.stroke();
  }
}

function drawStar(ctx) {
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 50 : 22;
    const x = 80 + Math.cos(angle) * r;
    const y = 80 + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHeart(ctx) {
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.moveTo(80, 50);
  ctx.bezierCurveTo(50, 10, 10, 40, 80, 110);
  ctx.bezierCurveTo(150, 40, 110, 10, 80, 50);
  ctx.fill();
}

function drawCat(ctx) {
  ctx.fillStyle = "#e0a458";
  ctx.beginPath();
  ctx.arc(80, 90, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(48, 60);
  ctx.lineTo(58, 25);
  ctx.lineTo(75, 55);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(112, 60);
  ctx.lineTo(102, 25);
  ctx.lineTo(85, 55);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(65, 85, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(95, 85, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.moveTo(80, 98);
  ctx.lineTo(75, 105);
  ctx.lineTo(85, 105);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.5;
  [[30, 95, 55, 92], [30, 105, 55, 105], [130, 95, 105, 92], [130, 105, 105, 105]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });
}

function drawDog(ctx) {
  ctx.fillStyle = "#c9915b";
  ctx.beginPath();
  ctx.arc(80, 90, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(45, 80, 14, 26, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(115, 80, 14, 26, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e8b98a";
  ctx.beginPath();
  ctx.ellipse(80, 105, 20, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(65, 82, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(95, 82, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, 100, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawTree(ctx) {
  ctx.fillStyle = "#8a5a2b";
  ctx.fillRect(72, 100, 16, 45);
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.arc(80, 70, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(55, 95, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(105, 95, 25, 0, Math.PI * 2);
  ctx.fill();
}

function drawHouse(ctx) {
  ctx.fillStyle = "#d9a86c";
  ctx.fillRect(45, 85, 70, 55);
  ctx.fillStyle = "#c0392b";
  ctx.beginPath();
  ctx.moveTo(35, 85);
  ctx.lineTo(80, 40);
  ctx.lineTo(125, 85);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4a7dff";
  ctx.fillRect(60, 100, 18, 18);
  ctx.fillStyle = "#8a5a2b";
  ctx.fillRect(90, 110, 16, 30);
}

function drawRobot(ctx) {
  ctx.fillStyle = "#4a7dff";
  ctx.fillRect(45, 55, 70, 60);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, 55);
  ctx.lineTo(80, 35);
  ctx.stroke();
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(80, 32, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(65, 80, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(95, 80, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, 105);
  ctx.quadraticCurveTo(80, 118, 100, 105);
  ctx.stroke();
}

function drawSmiley(ctx) {
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(80, 80, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(63, 70, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(97, 70, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(80, 80, 25, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

function drawAbstract(ctx) {
  const colors = ["#4a7dff", "#ffd166", "#ff6b8a", "#4caf50", "#a78bfa"];
  ctx.globalAlpha = 0.75;
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.beginPath();
    ctx.arc(20 + Math.random() * 120, 20 + Math.random() * 120, 10 + Math.random() * 25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFish(ctx) {
  ctx.fillStyle = "#4a7dff";
  ctx.beginPath();
  ctx.ellipse(85, 80, 38, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(48, 80);
  ctx.lineTo(20, 60);
  ctx.lineTo(20, 100);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2f5fd6";
  ctx.beginPath();
  ctx.moveTo(80, 56);
  ctx.quadraticCurveTo(90, 35, 100, 55);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(85, 95);
  ctx.quadraticCurveTo(80, 115, 95, 115);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(108, 74, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(110, 74, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2f5fd6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(122, 82, 5, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
}

function drawBird(ctx) {
  ctx.fillStyle = "#4a7dff";
  ctx.beginPath();
  ctx.ellipse(85, 95, 32, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(65, 62, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2f5fd6";
  ctx.beginPath();
  ctx.moveTo(75, 90);
  ctx.quadraticCurveTo(110, 85, 100, 115);
  ctx.quadraticCurveTo(80, 115, 75, 90);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(112, 90);
  ctx.lineTo(135, 80);
  ctx.lineTo(115, 105);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.moveTo(40, 58);
  ctx.lineTo(20, 63);
  ctx.lineTo(40, 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(60, 56, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(75, 122);
  ctx.lineTo(75, 135);
  ctx.moveTo(95, 122);
  ctx.lineTo(95, 135);
  ctx.stroke();
}

function drawButterfly(ctx) {
  ctx.fillStyle = "#a78bfa";
  ctx.beginPath();
  ctx.moveTo(80, 75);
  ctx.bezierCurveTo(40, 30, 10, 45, 25, 75);
  ctx.bezierCurveTo(10, 95, 45, 100, 80, 80);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(80, 75);
  ctx.bezierCurveTo(120, 30, 150, 45, 135, 75);
  ctx.bezierCurveTo(150, 95, 115, 100, 80, 80);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.moveTo(80, 82);
  ctx.bezierCurveTo(55, 95, 35, 130, 60, 135);
  ctx.bezierCurveTo(75, 130, 80, 100, 80, 82);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(80, 82);
  ctx.bezierCurveTo(105, 95, 125, 130, 100, 135);
  ctx.bezierCurveTo(85, 130, 80, 100, 80, 82);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(50, 60, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(110, 60, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.ellipse(80, 80, 6, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(77, 52);
  ctx.quadraticCurveTo(65, 35, 60, 30);
  ctx.moveTo(83, 52);
  ctx.quadraticCurveTo(95, 35, 100, 30);
  ctx.stroke();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(60, 30, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, 30, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawBee(ctx) {
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.ellipse(65, 50, 18, 12, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(100, 50, 18, 12, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.ellipse(80, 85, 34, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.ellipse(66, 85, 6, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(90, 85, 6, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, 55, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(74, 53, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(86, 53, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(74, 44);
  ctx.lineTo(68, 30);
  ctx.moveTo(86, 44);
  ctx.lineTo(92, 30);
  ctx.stroke();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.moveTo(80, 111);
  ctx.lineTo(74, 120);
  ctx.lineTo(86, 120);
  ctx.closePath();
  ctx.fill();
}

function drawLadybug(ctx) {
  ctx.fillStyle = "#ff4d4d";
  ctx.beginPath();
  ctx.arc(80, 90, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(80, 52, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, 60);
  ctx.lineTo(80, 128);
  ctx.stroke();
  ctx.fillStyle = "#1b1f2a";
  [[60, 80, 7], [100, 80, 7], [65, 108, 6], [95, 108, 6], [80, 95, 8]].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(73, 48, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(87, 48, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(72, 38);
  ctx.lineTo(65, 25);
  ctx.moveTo(88, 38);
  ctx.lineTo(95, 25);
  ctx.stroke();
}

function drawTurtle(ctx) {
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.ellipse(40, 60, 12, 9, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(120, 60, 12, 9, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(45, 115, 12, 9, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(115, 115, 12, 9, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, 40, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(80, 128);
  ctx.lineTo(72, 140);
  ctx.lineTo(88, 140);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2e7d32";
  ctx.beginPath();
  ctx.ellipse(80, 90, 42, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1b5e20";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(80, 90, 20, 0, Math.PI * 2);
  ctx.stroke();
  [0, 60, 120, 180, 240, 300].forEach((deg) => {
    const a = (deg * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(80 + Math.cos(a) * 20, 90 + Math.sin(a) * 20);
    ctx.lineTo(80 + Math.cos(a) * 40, 90 + Math.sin(a) * 34);
    ctx.stroke();
  });
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(74, 36, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(86, 36, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawRabbit(ctx) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(62, 40, 11, 30, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(98, 40, 11, 30, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffb3c6";
  ctx.beginPath();
  ctx.ellipse(62, 43, 5, 20, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(98, 43, 5, 20, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(80, 118, 34, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, 88, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe1ea";
  ctx.beginPath();
  ctx.arc(64, 95, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(96, 95, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(70, 85, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(90, 85, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.moveTo(80, 95);
  ctx.lineTo(75, 101);
  ctx.lineTo(85, 101);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 1.5;
  [[80, 99, 55, 95], [80, 102, 55, 103], [80, 99, 105, 95], [80, 102, 105, 103]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });
}

function drawBear(ctx) {
  ctx.fillStyle = "#a0673c";
  ctx.beginPath();
  ctx.arc(55, 45, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(105, 45, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e0a878";
  ctx.beginPath();
  ctx.arc(55, 45, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(105, 45, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a0673c";
  ctx.beginPath();
  ctx.ellipse(80, 118, 38, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, 82, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e0a878";
  ctx.beginPath();
  ctx.ellipse(80, 92, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.ellipse(80, 88, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 92);
  ctx.lineTo(80, 98);
  ctx.moveTo(80, 98);
  ctx.quadraticCurveTo(72, 102, 68, 97);
  ctx.moveTo(80, 98);
  ctx.quadraticCurveTo(88, 102, 92, 97);
  ctx.stroke();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(68, 70, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(92, 70, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawPenguin(ctx) {
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.ellipse(80, 95, 32, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(80, 100, 18, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.ellipse(50, 95, 8, 24, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(110, 95, 8, 24, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, 52, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(72, 50, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(88, 50, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(73, 50, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(89, 50, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffa733";
  ctx.beginPath();
  ctx.moveTo(72, 58);
  ctx.lineTo(88, 58);
  ctx.lineTo(80, 68);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(65, 138, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(95, 138, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawDolphin(ctx) {
  ctx.fillStyle = "#6ec6e8";
  ctx.beginPath();
  ctx.ellipse(85, 85, 42, 20, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(135, 68, 16, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(70, 68);
  ctx.quadraticCurveTo(78, 35, 92, 60);
  ctx.quadraticCurveTo(80, 65, 70, 68);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(40, 100);
  ctx.quadraticCurveTo(20, 85, 15, 95);
  ctx.quadraticCurveTo(25, 100, 15, 108);
  ctx.quadraticCurveTo(25, 112, 42, 108);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#eaf7fb";
  ctx.beginPath();
  ctx.ellipse(90, 95, 30, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(115, 62, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawWhale(ctx) {
  ctx.fillStyle = "#4a7dff";
  ctx.beginPath();
  ctx.ellipse(75, 90, 45, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#cfe0ff";
  ctx.beginPath();
  ctx.ellipse(70, 105, 32, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a7dff";
  ctx.beginPath();
  ctx.moveTo(115, 85);
  ctx.quadraticCurveTo(140, 60, 148, 68);
  ctx.quadraticCurveTo(135, 88, 145, 100);
  ctx.quadraticCurveTo(135, 112, 115, 95);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#a9c8ff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(45, 45);
  ctx.lineTo(45, 25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(35, 35);
  ctx.lineTo(30, 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(55, 35);
  ctx.lineTo(60, 20);
  ctx.stroke();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(48, 82, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(45, 95, 10, 0.1 * Math.PI, 0.5 * Math.PI);
  ctx.stroke();
}

function drawSnail(ctx) {
  ctx.fillStyle = "#a78bfa";
  ctx.beginPath();
  ctx.moveTo(20, 130);
  ctx.quadraticCurveTo(15, 100, 45, 95);
  ctx.quadraticCurveTo(80, 90, 100, 110);
  ctx.quadraticCurveTo(110, 120, 100, 130);
  ctx.quadraticCurveTo(60, 140, 20, 130);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.arc(85, 80, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c23a5a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(85, 80, 25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(85, 80, 15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(85, 80, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#a78bfa";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(35, 98);
  ctx.lineTo(28, 78);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(48, 96);
  ctx.lineTo(45, 76);
  ctx.stroke();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(28, 75, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(45, 73, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawOwl(ctx) {
  ctx.fillStyle = "#a0784a";
  ctx.beginPath();
  ctx.ellipse(80, 95, 38, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(55, 60);
  ctx.lineTo(50, 40);
  ctx.lineTo(68, 55);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(105, 60);
  ctx.lineTo(110, 40);
  ctx.lineTo(92, 55);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#e8cfa0";
  ctx.beginPath();
  ctx.ellipse(80, 105, 22, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8a6238";
  ctx.beginPath();
  ctx.ellipse(48, 100, 10, 24, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(112, 100, 10, 24, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(66, 85, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(94, 85, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(66, 85, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(94, 85, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffa733";
  ctx.beginPath();
  ctx.moveTo(74, 100);
  ctx.lineTo(86, 100);
  ctx.lineTo(80, 112);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a0784a";
  ctx.beginPath();
  ctx.ellipse(68, 138, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(92, 138, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFrog(ctx) {
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.ellipse(80, 100, 40, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(35, 115, 14, 10, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(125, 115, 14, 10, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(60, 65, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, 65, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(60, 63, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, 63, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(60, 63, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, 63, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(80, 90, 20, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#3d8b40";
  ctx.beginPath();
  ctx.arc(55, 105, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(105, 100, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawElephant(ctx) {
  ctx.fillStyle = "#9aa5b1";
  ctx.beginPath();
  ctx.arc(45, 80, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(115, 80, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c3cbd4";
  ctx.beginPath();
  ctx.arc(45, 80, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(115, 80, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9aa5b1";
  ctx.beginPath();
  ctx.ellipse(80, 90, 34, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(58, 115, 12, 24);
  ctx.fillRect(90, 115, 12, 24);
  ctx.beginPath();
  ctx.moveTo(70, 105);
  ctx.bezierCurveTo(65, 125, 55, 130, 58, 145);
  ctx.bezierCurveTo(60, 150, 68, 148, 68, 142);
  ctx.bezierCurveTo(66, 132, 78, 122, 82, 108);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(68, 82, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(94, 82, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(70, 108, 4, 10, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(92, 108, 4, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawLion(ctx) {
  ctx.fillStyle = "#e08a3c";
  ctx.beginPath();
  ctx.arc(80, 80, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const x1 = 80 + Math.cos(angle) * 38;
    const y1 = 80 + Math.sin(angle) * 38;
    const x2 = 80 + Math.cos(angle) * 55;
    const y2 = 80 + Math.sin(angle) * 55;
    const angle2 = angle + 0.15;
    const x3 = 80 + Math.cos(angle2) * 38;
    const y3 = 80 + Math.sin(angle2) * 38;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
  }
  ctx.fill();
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(80, 82, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e08a3c";
  ctx.beginPath();
  ctx.arc(58, 55, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(102, 55, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff3d6";
  ctx.beginPath();
  ctx.ellipse(80, 95, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(70, 78, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(90, 78, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(76, 90);
  ctx.lineTo(84, 90);
  ctx.lineTo(80, 96);
  ctx.closePath();
  ctx.fill();
}

function drawPizza(ctx) {
  ctx.fillStyle = "#e8b872";
  ctx.beginPath();
  ctx.moveTo(22, 42);
  ctx.quadraticCurveTo(80, 12, 138, 42);
  ctx.quadraticCurveTo(80, 58, 22, 42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.moveTo(80, 138);
  ctx.quadraticCurveTo(15, 55, 30, 40);
  ctx.lineTo(130, 40);
  ctx.quadraticCurveTo(145, 55, 80, 138);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 40);
  ctx.lineTo(130, 40);
  ctx.stroke();
  ctx.fillStyle = "#c0392b";
  const pepperoni = [[65, 65], [95, 70], [75, 95], [100, 100], [80, 120]];
  pepperoni.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCake(ctx) {
  ctx.fillStyle = "#d9a86c";
  ctx.fillRect(30, 95, 100, 35);
  ctx.fillStyle = "#ff9fb2";
  ctx.fillRect(45, 68, 70, 32);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(45, 60);
  ctx.lineTo(115, 60);
  ctx.lineTo(115, 68);
  ctx.quadraticCurveTo(105, 80, 93, 68);
  ctx.quadraticCurveTo(81, 80, 69, 68);
  ctx.quadraticCurveTo(57, 80, 45, 68);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(30, 93, 100, 6);
  ctx.fillStyle = "#4a7dff";
  ctx.fillRect(50, 100, 6, 3);
  ctx.fillStyle = "#4caf50";
  ctx.fillRect(70, 112, 6, 3);
  ctx.fillStyle = "#a78bfa";
  ctx.fillRect(95, 106, 6, 3);
  ctx.fillStyle = "#4a7dff";
  ctx.fillRect(77, 40, 6, 22);
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(80, 35, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawIceCream(ctx) {
  ctx.fillStyle = "#d9a86c";
  ctx.beginPath();
  ctx.moveTo(65, 85);
  ctx.lineTo(95, 85);
  ctx.lineTo(80, 140);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#a9773f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, 95);
  ctx.lineTo(92, 100);
  ctx.moveTo(73, 110);
  ctx.lineTo(88, 114);
  ctx.moveTo(76, 124);
  ctx.lineTo(84, 127);
  ctx.stroke();
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(80, 75, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.arc(80, 48, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c0392b";
  ctx.beginPath();
  ctx.arc(80, 24, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawApple(ctx) {
  ctx.fillStyle = "#e74c3c";
  ctx.beginPath();
  ctx.moveTo(80, 45);
  ctx.bezierCurveTo(50, 40, 30, 65, 35, 95);
  ctx.bezierCurveTo(40, 125, 60, 140, 80, 140);
  ctx.bezierCurveTo(100, 140, 120, 125, 125, 95);
  ctx.bezierCurveTo(130, 65, 110, 40, 80, 45);
  ctx.fill();
  ctx.strokeStyle = "#6b4423";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(80, 45);
  ctx.quadraticCurveTo(78, 30, 85, 20);
  ctx.stroke();
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.moveTo(85, 25);
  ctx.quadraticCurveTo(105, 15, 110, 30);
  ctx.quadraticCurveTo(95, 35, 85, 25);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(60, 70, 8, 14, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawDonut(ctx) {
  ctx.fillStyle = "#e8b872";
  ctx.beginPath();
  ctx.arc(80, 80, 55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff9fb2";
  ctx.beginPath();
  ctx.arc(80, 80, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(80, 80, 18, 0, Math.PI * 2);
  ctx.fill();
  const colors = ["#4a7dff", "#4caf50", "#ffd166", "#a78bfa", "#c0392b"];
  const sprinkles = [[55, 50], [100, 45], [110, 70], [105, 105], [70, 115], [45, 90], [60, 60], [95, 85]];
  sprinkles.forEach(([x, y], i) => {
    ctx.strokeStyle = colors[i % colors.length];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 2);
    ctx.lineTo(x + 4, y + 2);
    ctx.stroke();
  });
}

function drawBanana(ctx) {
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.moveTo(48, 122);
  ctx.bezierCurveTo(35, 90, 40, 50, 75, 28);
  ctx.bezierCurveTo(88, 20, 100, 20, 110, 26);
  ctx.bezierCurveTo(100, 28, 90, 32, 82, 40);
  ctx.bezierCurveTo(58, 62, 55, 95, 68, 118);
  ctx.bezierCurveTo(62, 126, 54, 128, 48, 122);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9962f";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#6b4423";
  ctx.beginPath();
  ctx.arc(109, 24, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(50, 124, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawWatermelon(ctx) {
  const cx = 80, cy = 58;
  ctx.fillStyle = "#2d8a4e";
  ctx.beginPath();
  ctx.moveTo(cx + 55, cy);
  ctx.arc(cx, cy, 55, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(cx + 47, cy);
  ctx.arc(cx, cy, 47, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ff4d4d";
  ctx.beginPath();
  ctx.moveTo(cx + 39, cy);
  ctx.arc(cx, cy, 39, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1b1f2a";
  const seeds = [[62, 80], [80, 92], [98, 80], [70, 68], [90, 68]];
  seeds.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, 3, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCupcake(ctx) {
  ctx.fillStyle = "#a78bfa";
  ctx.beginPath();
  ctx.moveTo(40, 130);
  ctx.lineTo(120, 130);
  ctx.lineTo(108, 90);
  ctx.lineTo(52, 90);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#8a6de0";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(55, 90);
  ctx.lineTo(48, 130);
  ctx.moveTo(70, 90);
  ctx.lineTo(66, 130);
  ctx.moveTo(90, 90);
  ctx.lineTo(94, 130);
  ctx.moveTo(105, 90);
  ctx.lineTo(112, 130);
  ctx.stroke();
  ctx.fillStyle = "#ffd6e8";
  ctx.beginPath();
  ctx.moveTo(50, 90);
  ctx.bezierCurveTo(45, 60, 55, 45, 60, 55);
  ctx.bezierCurveTo(62, 35, 78, 30, 80, 48);
  ctx.bezierCurveTo(84, 30, 100, 35, 98, 55);
  ctx.bezierCurveTo(105, 45, 115, 60, 110, 90);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#c0392b";
  ctx.beginPath();
  ctx.arc(80, 32, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawRainbow(ctx) {
  const colors = ["#ff6b8a", "#ffd166", "#4caf50", "#4a7dff", "#a78bfa"];
  const cx = 80,
    cy = 140;
  ctx.lineCap = "round";
  colors.forEach((color, i) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(cx, cy, 65 - i * 10, Math.PI, Math.PI * 2, false);
    ctx.stroke();
  });

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(18, 138, 12, 0, Math.PI * 2);
  ctx.arc(30, 132, 14, 0, Math.PI * 2);
  ctx.arc(40, 140, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(142, 138, 12, 0, Math.PI * 2);
  ctx.arc(130, 132, 14, 0, Math.PI * 2);
  ctx.arc(120, 140, 11, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloud(ctx) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(55, 95, 22, 0, Math.PI * 2);
  ctx.arc(80, 75, 28, 0, Math.PI * 2);
  ctx.arc(108, 90, 24, 0, Math.PI * 2);
  ctx.arc(85, 100, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#dbe4ee";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawMoon(ctx) {
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(75, 80, 40, 0, Math.PI * 2, false);
  ctx.arc(92, 70, 34, 0, Math.PI * 2, true);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(125, 40, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(112, 60, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawRocket(ctx) {
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.moveTo(70, 128);
  ctx.quadraticCurveTo(80, 155, 90, 128);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.moveTo(74, 128);
  ctx.quadraticCurveTo(80, 145, 86, 128);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(80, 15);
  ctx.bezierCurveTo(58, 38, 58, 90, 65, 128);
  ctx.lineTo(95, 128);
  ctx.bezierCurveTo(102, 90, 102, 38, 80, 15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#4a7dff";
  ctx.beginPath();
  ctx.moveTo(65, 100);
  ctx.lineTo(44, 128);
  ctx.lineTo(67, 118);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(95, 100);
  ctx.lineTo(116, 128);
  ctx.lineTo(93, 118);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#4a7dff";
  ctx.beginPath();
  ctx.arc(80, 62, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(80, 62, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlane(ctx) {
  ctx.fillStyle = "#4a7dff";
  ctx.beginPath();
  ctx.ellipse(82, 82, 48, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(120, 75);
  ctx.lineTo(142, 52);
  ctx.lineTo(128, 80);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#a78bfa";
  ctx.beginPath();
  ctx.moveTo(70, 78);
  ctx.lineTo(44, 108);
  ctx.lineTo(86, 90);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(106, 78);
  ctx.lineTo(92, 63);
  ctx.lineTo(114, 78);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.ellipse(33, 82, 9, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(60 + i * 16, 78, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLightningBolt(ctx) {
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.moveTo(95, 12);
  ctx.lineTo(48, 90);
  ctx.lineTo(75, 90);
  ctx.lineTo(60, 148);
  ctx.lineTo(115, 65);
  ctx.lineTo(88, 65);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawSnowman(ctx) {
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#cfd8e3";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(80, 118, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(80, 75, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(80, 42, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#1b1f2a";
  ctx.fillRect(64, 18, 32, 6);
  ctx.fillRect(70, 4, 20, 18);

  ctx.beginPath();
  ctx.arc(74, 38, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(86, 38, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff8c42";
  ctx.beginPath();
  ctx.moveTo(80, 43);
  ctx.lineTo(97, 46);
  ctx.lineTo(80, 49);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(80, 66, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, 77, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, 88, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#8a5a2b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(58, 72);
  ctx.lineTo(30, 58);
  ctx.moveTo(102, 72);
  ctx.lineTo(130, 58);
  ctx.stroke();
}

function drawGhost(ctx) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(50, 130);
  ctx.lineTo(50, 70);
  ctx.bezierCurveTo(50, 40, 110, 40, 110, 70);
  ctx.lineTo(110, 130);
  ctx.quadraticCurveTo(102, 118, 94, 130);
  ctx.quadraticCurveTo(86, 118, 78, 130);
  ctx.quadraticCurveTo(70, 118, 62, 130);
  ctx.quadraticCurveTo(54, 118, 50, 130);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9d6e3";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(68, 82, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(92, 82, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.arc(58, 95, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(102, 95, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(80, 90, 6, 0, Math.PI);
  ctx.stroke();
}

function drawBalloon(ctx) {
  // balloon body
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.ellipse(80, 62, 34, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  // highlight
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.ellipse(67, 45, 8, 13, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // knot
  ctx.fillStyle = "#e0506f";
  ctx.beginPath();
  ctx.moveTo(74, 99);
  ctx.lineTo(86, 99);
  ctx.lineTo(80, 109);
  ctx.closePath();
  ctx.fill();
  // string
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 109);
  ctx.quadraticCurveTo(70, 122, 80, 135);
  ctx.quadraticCurveTo(90, 148, 82, 155);
  ctx.stroke();
}

function drawUmbrella(ctx) {
  // canopy
  ctx.fillStyle = "#4a7dff";
  ctx.beginPath();
  ctx.moveTo(28, 78);
  ctx.arc(80, 78, 52, Math.PI, 2 * Math.PI);
  ctx.lineTo(28, 78);
  ctx.closePath();
  ctx.fill();
  // scalloped bottom edge
  ctx.fillStyle = "#3a68d8";
  ctx.beginPath();
  ctx.arc(41, 78, 13, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(67, 78, 13, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(93, 78, 13, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(119, 78, 13, 0, Math.PI);
  ctx.fill();
  // ribs
  ctx.strokeStyle = "#2a52c0";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 30);
  ctx.lineTo(30, 78);
  ctx.moveTo(80, 30);
  ctx.lineTo(55, 78);
  ctx.moveTo(80, 30);
  ctx.lineTo(80, 78);
  ctx.moveTo(80, 30);
  ctx.lineTo(105, 78);
  ctx.moveTo(80, 30);
  ctx.lineTo(130, 78);
  ctx.stroke();
  // pole
  ctx.fillStyle = "#1b1f2a";
  ctx.fillRect(77, 78, 6, 55);
  // handle hook
  ctx.strokeStyle = "#1b1f2a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(80, 133);
  ctx.bezierCurveTo(80, 150, 58, 150, 58, 136);
  ctx.stroke();
}

function drawBoat(ctx) {
  // water
  ctx.strokeStyle = "#4a7dff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(15, 140);
  ctx.quadraticCurveTo(35, 132, 55, 140);
  ctx.quadraticCurveTo(75, 148, 95, 140);
  ctx.quadraticCurveTo(115, 132, 145, 140);
  ctx.stroke();
  // hull
  ctx.fillStyle = "#8a5a2b";
  ctx.beginPath();
  ctx.moveTo(25, 108);
  ctx.lineTo(135, 108);
  ctx.lineTo(112, 133);
  ctx.lineTo(48, 133);
  ctx.closePath();
  ctx.fill();
  // hull rim
  ctx.fillStyle = "#a9743f";
  ctx.fillRect(22, 102, 116, 8);
  // mast
  ctx.fillStyle = "#6b4423";
  ctx.fillRect(78, 35, 5, 73);
  // main sail
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(81, 38);
  ctx.lineTo(81, 100);
  ctx.lineTo(128, 96);
  ctx.closePath();
  ctx.fill();
  // front sail
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.moveTo(77, 48);
  ctx.lineTo(77, 95);
  ctx.lineTo(38, 90);
  ctx.closePath();
  ctx.fill();
  // flag
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.moveTo(83, 35);
  ctx.lineTo(95, 40);
  ctx.lineTo(83, 45);
  ctx.closePath();
  ctx.fill();
}

function drawCar(ctx) {
  // body
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.moveTo(28, 122);
  ctx.lineTo(28, 100);
  ctx.quadraticCurveTo(28, 92, 40, 92);
  ctx.lineTo(55, 92);
  ctx.lineTo(65, 68);
  ctx.quadraticCurveTo(68, 63, 74, 63);
  ctx.lineTo(96, 63);
  ctx.quadraticCurveTo(102, 63, 105, 68);
  ctx.lineTo(115, 92);
  ctx.lineTo(122, 92);
  ctx.quadraticCurveTo(132, 92, 132, 100);
  ctx.lineTo(132, 122);
  ctx.closePath();
  ctx.fill();
  // windshield
  ctx.fillStyle = "#cfe8ff";
  ctx.beginPath();
  ctx.moveTo(69, 68);
  ctx.lineTo(93, 68);
  ctx.lineTo(93, 90);
  ctx.lineTo(60, 90);
  ctx.closePath();
  ctx.fill();
  // rear window
  ctx.beginPath();
  ctx.moveTo(97, 68);
  ctx.lineTo(102, 68);
  ctx.lineTo(112, 90);
  ctx.lineTo(97, 90);
  ctx.closePath();
  ctx.fill();
  // window divider
  ctx.fillStyle = "#ff6b8a";
  ctx.fillRect(93, 68, 4, 22);
  // headlight
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(126, 108, 5, 0, Math.PI * 2);
  ctx.fill();
  // wheels
  ctx.fillStyle = "#1b1f2a";
  ctx.beginPath();
  ctx.arc(52, 124, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(112, 124, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#aab0bd";
  ctx.beginPath();
  ctx.arc(52, 124, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(112, 124, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawBicycle(ctx) {
  // wheels — was drawn in #1b1f2a, the exact same color as this canvas's
  // dark navy background fill, so the whole bike (except the blue frame)
  // was invisible. Switched to white so it actually shows up.
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(42, 112, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(118, 112, 26, 0, Math.PI * 2);
  ctx.stroke();
  // spokes
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(42, 86);
  ctx.lineTo(42, 138);
  ctx.moveTo(16, 112);
  ctx.lineTo(68, 112);
  ctx.moveTo(24, 94);
  ctx.lineTo(60, 130);
  ctx.moveTo(24, 130);
  ctx.lineTo(60, 94);
  ctx.moveTo(118, 86);
  ctx.lineTo(118, 138);
  ctx.moveTo(92, 112);
  ctx.lineTo(144, 112);
  ctx.moveTo(100, 94);
  ctx.lineTo(136, 130);
  ctx.moveTo(100, 130);
  ctx.lineTo(136, 94);
  ctx.stroke();
  // frame
  ctx.strokeStyle = "#4a7dff";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(42, 112);
  ctx.lineTo(72, 112);
  ctx.lineTo(80, 78);
  ctx.moveTo(72, 112);
  ctx.lineTo(96, 78);
  ctx.lineTo(118, 112);
  ctx.moveTo(80, 78);
  ctx.lineTo(96, 78);
  ctx.moveTo(96, 78);
  ctx.lineTo(104, 68);
  ctx.stroke();
  // seat
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(74, 76);
  ctx.lineTo(86, 76);
  ctx.stroke();
  // handlebar
  ctx.beginPath();
  ctx.moveTo(96, 66);
  ctx.lineTo(112, 66);
  ctx.stroke();
  // pedal hub
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(72, 112, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawPresent(ctx) {
  // box
  ctx.fillStyle = "#a78bfa";
  ctx.fillRect(35, 75, 90, 65);
  // lid
  ctx.fillStyle = "#8f6de0";
  ctx.fillRect(28, 62, 104, 16);
  // ribbon vertical
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(70, 62, 20, 78);
  // ribbon horizontal
  ctx.fillRect(35, 101, 90, 16);
  // bow loops
  ctx.beginPath();
  ctx.ellipse(62, 52, 15, 11, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(98, 52, 15, 11, 0.5, 0, Math.PI * 2);
  ctx.fill();
  // bow knot
  ctx.fillStyle = "#ffb347";
  ctx.beginPath();
  ctx.arc(80, 55, 9, 0, Math.PI * 2);
  ctx.fill();
}

function drawCrown(ctx) {
  // base band
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(35, 100, 90, 28);
  // spikes
  ctx.beginPath();
  ctx.moveTo(35, 100);
  ctx.lineTo(45, 60);
  ctx.lineTo(58, 90);
  ctx.lineTo(80, 45);
  ctx.lineTo(102, 90);
  ctx.lineTo(115, 60);
  ctx.lineTo(125, 100);
  ctx.closePath();
  ctx.fill();
  // jewels on spike tips
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.arc(45, 58, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a7dff";
  ctx.beginPath();
  ctx.arc(80, 43, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.arc(115, 58, 5, 0, Math.PI * 2);
  ctx.fill();
  // jewels on band
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.arc(60, 114, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, 114, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a78bfa";
  ctx.beginPath();
  ctx.arc(80, 114, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawCactus(ctx) {
  // pot
  ctx.fillStyle = "#c0392b";
  ctx.beginPath();
  ctx.moveTo(48, 122);
  ctx.lineTo(112, 122);
  ctx.lineTo(102, 150);
  ctx.lineTo(58, 150);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a83226";
  ctx.fillRect(44, 116, 72, 10);
  // main body
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.moveTo(65, 122);
  ctx.lineTo(65, 55);
  ctx.quadraticCurveTo(65, 45, 80, 45);
  ctx.quadraticCurveTo(95, 45, 95, 55);
  ctx.lineTo(95, 122);
  ctx.closePath();
  ctx.fill();
  // left arm
  ctx.beginPath();
  ctx.moveTo(65, 95);
  ctx.lineTo(48, 95);
  ctx.quadraticCurveTo(38, 95, 38, 82);
  ctx.lineTo(38, 68);
  ctx.quadraticCurveTo(38, 62, 44, 62);
  ctx.quadraticCurveTo(50, 62, 50, 68);
  ctx.lineTo(50, 85);
  ctx.quadraticCurveTo(50, 90, 56, 90);
  ctx.lineTo(65, 90);
  ctx.closePath();
  ctx.fill();
  // right arm
  ctx.beginPath();
  ctx.moveTo(95, 105);
  ctx.lineTo(110, 105);
  ctx.quadraticCurveTo(120, 105, 120, 95);
  ctx.lineTo(120, 80);
  ctx.quadraticCurveTo(120, 74, 114, 74);
  ctx.quadraticCurveTo(108, 74, 108, 80);
  ctx.lineTo(108, 95);
  ctx.quadraticCurveTo(108, 100, 102, 100);
  ctx.lineTo(95, 100);
  ctx.closePath();
  ctx.fill();
  // spines
  ctx.strokeStyle = "#2e7d32";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(72, 65);
  ctx.lineTo(72, 70);
  ctx.moveTo(88, 75);
  ctx.lineTo(88, 80);
  ctx.moveTo(72, 100);
  ctx.lineTo(72, 105);
  ctx.stroke();
  // flower
  ctx.fillStyle = "#ff6b8a";
  ctx.beginPath();
  ctx.arc(80, 42, 4, 0, Math.PI * 2);
  ctx.arc(85, 45, 4, 0, Math.PI * 2);
  ctx.arc(75, 45, 4, 0, Math.PI * 2);
  ctx.arc(80, 48, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(80, 45, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// Suin's whole "vocabulary" of things it knows how to draw for real.
const DRAWING_SUBJECTS = {
  sun: drawSun,
  fish: drawFish,
  bird: drawBird,
  butterfly: drawButterfly,
  bee: drawBee,
  ladybug: drawLadybug,
  turtle: drawTurtle,
  rabbit: drawRabbit,
  bear: drawBear,
  penguin: drawPenguin,
  dolphin: drawDolphin,
  whale: drawWhale,
  snail: drawSnail,
  owl: drawOwl,
  frog: drawFrog,
  elephant: drawElephant,
  lion: drawLion,
  pizza: drawPizza,
  cake: drawCake,
  "ice cream": drawIceCream,
  apple: drawApple,
  donut: drawDonut,
  banana: drawBanana,
  watermelon: drawWatermelon,
  cupcake: drawCupcake,
  rainbow: drawRainbow,
  cloud: drawCloud,
  moon: drawMoon,
  rocket: drawRocket,
  plane: drawPlane,
  "lightning bolt": drawLightningBolt,
  snowman: drawSnowman,
  ghost: drawGhost,
  balloon: drawBalloon,
  umbrella: drawUmbrella,
  boat: drawBoat,
  car: drawCar,
  bicycle: drawBicycle,
  present: drawPresent,
  crown: drawCrown,
  cactus: drawCactus,
  star: drawStar,
  heart: drawHeart,
  cat: drawCat,
  dog: drawDog,
  tree: drawTree,
  house: drawHouse,
  robot: drawRobot,
  smiley: drawSmiley,
  face: drawSmiley,
  abstract: drawAbstract
};

// Picks the LONGEST matching subject key, not just the first one — with 50
// drawing subjects, "cupcake" also contains "cake" as a substring, and a
// plain .find() would wrongly draw a cake instead of a cupcake. A more
// specific, longer match beats a shorter one — same idea as the
// ingredient-substitution matcher (findSubstitutionMatch). Shared between
// the 2D drawing feature and the 3D object feature below, since both need
// the exact same "which subject did you mean" lookup.
function findLongestSubjectKey(dict, subject) {
  return Object.keys(dict).reduce((best, k) => {
    if (!subject.includes(k)) return best;
    return !best || k.length > best.length ? k : best;
  }, null);
}

function addDrawing(subject) {
  const key = findLongestSubjectKey(DRAWING_SUBJECTS, subject);
  const caption = key
    ? "🎨 Here's my drawing of \"" + subject + "\"!"
    : "🎨 I don't know how to draw a real \"" + subject + "\" yet — here's some abstract art instead!";

  const div = addMessage(caption, "suin");
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 160;
  canvas.className = "suinCanvas";
  div.appendChild(canvas);
  chatBox.scrollTop = chatBox.scrollHeight;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1b1f2a";
  ctx.fillRect(0, 0, 160, 160);
  if (key) DRAWING_SUBJECTS[key](ctx);
  else drawAbstract(ctx);
}

// ===== 3D objects (real Three.js, a genuinely different kind of "drawing") =====
//
// The 2D drawings above use flat canvas shapes with no real depth. This is
// actual 3D: a virtual camera, a light source, and real meshes built out of
// vertices and triangles, using Three.js — the same 3D engine the Explox
// project uses. Still 100% hand-coded (not AI-generated), same as the 2D
// drawings — just a different, real 3D graphics technique instead of flat
// shapes.

function extract3DSubject(text) {
  const t = text.toLowerCase().trim().replace(/\?+$/, "");
  const patterns = [
    /^make (?:me )?(?:a |an )?3d (?:model of |version of )?(?:a |an )?(.+)/,
    /^generate (?:me )?(?:a |an )?3d (?:model of |version of )?(?:a |an )?(.+)/,
    /^show me (?:a |an )?3d (?:model of |version of )?(?:a |an )?(.+)/,
    /^3d (?:model of |version of )?(?:a |an )?(.+)/
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

// Each factory builds and returns a fresh THREE.Object3D — a brand new mesh
// every time, so multiple 3D replies in the same chat never accidentally
// share (and fight over) the same geometry.
function make3DCube() {
  return new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), new THREE.MeshStandardMaterial({ color: 0x4a7dff }));
}

function make3DSphere() {
  return new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 32), new THREE.MeshStandardMaterial({ color: 0xff6b8a }));
}

function make3DPyramid() {
  // A 4-sided cone IS a square pyramid — rotated 45° so a flat face points
  // at the camera instead of an edge.
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.3, 4), new THREE.MeshStandardMaterial({ color: 0xffd166 }));
  mesh.rotation.y = Math.PI / 4;
  return mesh;
}

function make3DCylinder() {
  return new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.3, 32), new THREE.MeshStandardMaterial({ color: 0x4caf50 }));
}

function make3DCone() {
  return new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.4, 32), new THREE.MeshStandardMaterial({ color: 0xa78bfa }));
}

function make3DDonut() {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.28, 16, 100), new THREE.MeshStandardMaterial({ color: 0xd9a86c })));
  const sprinkleColors = [0xff6b8a, 0x4a7dff, 0xffd166, 0x4caf50, 0xa78bfa];
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.3;
    const r = 0.4 + Math.random() * 0.5;
    const sprinkle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6),
      new THREE.MeshStandardMaterial({ color: sprinkleColors[i % sprinkleColors.length] })
    );
    sprinkle.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0.32);
    sprinkle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    group.add(sprinkle);
  }
  return group;
}

function make3DStar() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 0.8 : 0.35;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
  geo.center();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xffd166 }));
}

function make3DHeart() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.3);
  shape.bezierCurveTo(-0.3, 0.7, -0.9, 0.5, -0.9, 0.05);
  shape.bezierCurveTo(-0.9, -0.35, -0.5, -0.6, 0, -1.0);
  shape.bezierCurveTo(0.5, -0.6, 0.9, -0.35, 0.9, 0.05);
  shape.bezierCurveTo(0.9, 0.5, 0.3, 0.7, 0, 0.3);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
  geo.center();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xff6b8a }));
}

function make3DDiamond() {
  return new THREE.Mesh(
    new THREE.OctahedronGeometry(0.85),
    new THREE.MeshStandardMaterial({ color: 0x7dd3fc, metalness: 0.5, roughness: 0.15 })
  );
}

function make3DRocket() {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 24), new THREE.MeshStandardMaterial({ color: 0xffffff })));
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.55, 24), new THREE.MeshStandardMaterial({ color: 0xff6b6b }));
  nose.position.y = 0.875;
  group.add(nose);
  // A flat triangular blade (attached edge at local x=0, tip at x=0.32) —
  // reads as a real fin instead of a floating rectangular card. Positioned
  // at radius 0.32, just inside the body's 0.35 radius, so it visually
  // overlaps the body instead of leaving a gap. rotation.y uses -angle, not
  // angle: Three.js's Y-axis rotation maps local +X to (cos, -sin), the
  // OPPOSITE sign from the (cos, sin) used to place each fin around the
  // body — without the minus sign, every fin's "outward" direction pointed
  // the wrong way relative to where it actually sat, which is what made
  // them look disconnected from the rocket.
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0.22);
  finShape.lineTo(0.32, -0.05);
  finShape.lineTo(0, -0.22);
  finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.04, bevelEnabled: false });
  const finMat = new THREE.MeshStandardMaterial({ color: 0x4a7dff });
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(finGeo, finMat);
    const angle = (i / 3) * Math.PI * 2;
    fin.position.set(Math.cos(angle) * 0.32, -0.55, Math.sin(angle) * 0.32);
    fin.rotation.y = -angle;
    group.add(fin);
  }
  const win = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshStandardMaterial({ color: 0x4a7dff }));
  win.position.set(0, 0.15, 0.36);
  group.add(win);
  return group;
}

const THREE_D_SUBJECTS = {
  cube: make3DCube,
  sphere: make3DSphere,
  pyramid: make3DPyramid,
  cylinder: make3DCylinder,
  cone: make3DCone,
  donut: make3DDonut,
  star: make3DStar,
  heart: make3DHeart,
  diamond: make3DDiamond,
  rocket: make3DRocket
};

function add3DObject(subject) {
  const key = findLongestSubjectKey(THREE_D_SUBJECTS, subject);
  const caption = key
    ? "🧊 Here's a spinning 3D " + subject + "!"
    : "🧊 I don't know how to make a real 3D \"" + subject + "\" yet — here's a spinning cube instead!";

  const div = addMessage(caption, "suin");
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 200;
  canvas.className = "suinCanvas";
  div.appendChild(canvas);
  chatBox.scrollTop = chatBox.scrollHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.6, 3);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(200, 200, false);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(2, 3, 4);
  scene.add(dirLight);

  const mesh = THREE_D_SUBJECTS[key ? key : "cube"]();
  mesh.rotation.x = 0.3;
  scene.add(mesh);

  // Keeps spinning forever UNLESS this canvas has left the page (a new chat
  // was started, or you switched to a different saved chat) — checking
  // canvas.isConnected each frame stops the loop instead of leaving an
  // invisible animation running in the background forever.
  (function loop() {
    if (!canvas.isConnected) return;
    mesh.rotation.y += 0.015;
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  })();
}

// ===== Music composing =====
//
// Also not real AI (that needs a paid API + server too). This picks random
// notes from a PENTATONIC scale — a 5-note scale that's a classic trick for
// making random melodies always sound okay together, no "wrong" notes.

function isMusicRequest(text) {
  const t = text.toLowerCase();
  return /\b(play|make|sing|write)\b.*\b(song|music|tune|melody)\b/.test(t);
}

const MUSIC_SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C D E G A C

function playTune() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const noteCount = 8 + Math.floor(Math.random() * 5);
  const noteDur = 0.28;

  for (let i = 0; i < noteCount; i++) {
    const freq = MUSIC_SCALE[Math.floor(Math.random() * MUSIC_SCALE.length)];
    const t0 = ctx.currentTime + i * noteDur;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.25, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + noteDur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + noteDur);
  }
}

function addMusicReply() {
  addMessage("🎵 Here's a little tune I made up!", "suin");
  playTune();
}

// ===== Chat history (the sidebar list) =====
//
// Each saved chat is { id, title, messages: [{text, who}, ...] }. We keep
// the actual message TEXT in an array (not just the DOM), because DOM
// elements disappear when you switch to a different chat — the array is
// what lets us rebuild a past conversation when you click it again.

function chatHistoryKey() {
  return "suin_chat_history_" + currentUser;
}

function loadChatHistory() {
  try {
    const raw = localStorage.getItem(chatHistoryKey());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveChatHistory() {
  localStorage.setItem(chatHistoryKey(), JSON.stringify(chatHistory));
}

function makeChatId() {
  return "chat_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
}

function titleFromText(text) {
  const trimmed = text.trim();
  return trimmed.length > 26 ? trimmed.slice(0, 26) + "…" : trimmed;
}

let chatHistory = [];
let currentChatId = null;
let currentMessages = [];

// Saves (or updates) the chat currently on screen into the sidebar list.
// Only called once the chat has a real user message in it, so empty
// "New Chat"s you never actually used don't clutter the sidebar.
function upsertCurrentChatIntoHistory() {
  const existing = chatHistory.find((c) => c.id === currentChatId);
  if (existing) {
    existing.messages = currentMessages;
  } else {
    const firstUserMsg = currentMessages.find((m) => m.who === "user");
    chatHistory.unshift({
      id: currentChatId,
      title: firstUserMsg ? titleFromText(firstUserMsg.text) : "New chat",
      messages: currentMessages
    });
  }
  saveChatHistory();
  renderChatList();
}

// ===== "Do you remember...?" — searching your OTHER saved chats =====
//
// The sidebar above already SAVES old conversations, but until now nothing
// ever looked back INSIDE them — Suin only ever reacted to the message on
// screen right now. This adds a real search: when you ask about something,
// Suin checks every chat besides the one you're currently in for a past
// message that matches, reusing the exact same word-overlap trick
// findLocalMatch() uses above, just pointed at your own saved chats
// instead of the built-in example list.

// Recognizes a few natural ways to ask Suin to look back, like "do you
// remember my dog" or "what did I ask about turtles". Deliberately only
// matches QUESTIONS (not a bare "remember X"), so this can't get mixed up
// later with a different feature where you TELL Suin something to
// remember, instead of asking it to look something up.
function extractMemoryQuery(text) {
  const t = text.toLowerCase().trim().replace(/\?+$/, "");
  const patterns = [
    /^do you remember (?:when i asked about |when i talked about |talking about |asking about |me )?(.+)/,
    /^what did i (?:say|ask|tell you) about (.+)/,
    /^did i (?:ask|tell) you about (.+)/,
    /^did we (?:talk|chat) about (.+)/
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

// Keeps a quoted-back message from a giant stress-test chat (some saved
// chats have grown to 100,000+ characters — see item 35's notes) from
// blowing up the reply and breaking the page layout, the same way an
// unbounded name once did (item 18).
function truncateForQuote(text, max) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

// Looks through every saved chat EXCEPT the one currently on screen (that
// one's already visible on screen — this is specifically about OTHER
// chats) for the user message that best matches the topic asked about.
function searchPastChats(query) {
  const queryWords = wordsOf(query);
  let best = null;
  let bestScore = 0;

  for (const chat of chatHistory) {
    if (chat.id === currentChatId) continue;
    for (let i = 0; i < chat.messages.length; i++) {
      const msg = chat.messages[i];
      if (msg.who !== "user") continue;

      const score = overlapScore(queryWords, wordsOf(msg.text));
      // Same trust rule findLocalMatch() uses: need 2+ shared words, unless
      // you're asking about just one word (like a name) — then one exact
      // shared word is enough.
      const trusted = score >= 2 || (score >= 1 && queryWords.length === 1);

      if (trusted && score > bestScore) {
        bestScore = score;
        const next = chat.messages[i + 1];
        best = {
          chatTitle: chat.title,
          userText: msg.text,
          suinText: next && next.who === "suin" ? next.text : null
        };
      }
    }
  }
  return best;
}

function addMemoryReply(query) {
  const match = searchPastChats(query);
  if (!match) {
    addMessage("I don't remember talking about that in any other chat — maybe it hasn't come up yet!", "suin");
    return;
  }
  let reply = "Yeah, I remember! In your chat \"" + match.chatTitle + "\", you said: \"" + truncateForQuote(match.userText, 200) + "\"";
  if (match.suinText) reply += "\nAnd I said: \"" + truncateForQuote(match.suinText, 200) + "\"";
  addMessage(reply, "suin");
}

// ===== UI wiring =====

const loginScreen = document.getElementById("loginScreen");
const loginNameInput = document.getElementById("loginNameInput");
const loginBtn = document.getElementById("loginBtn");
const sidebar = document.getElementById("sidebar");
const mainArea = document.getElementById("mainArea");
const currentUserLabel = document.getElementById("currentUserLabel");
const switchUserBtn = document.getElementById("switchUserBtn");
const themePickerEl = document.getElementById("themePicker");
const animCanvas = document.getElementById("animatedBg");

// ===== Background themes =====
//
// Themes only ever repaint body's background — the sidebar and chat
// bubbles already have their own explicit colors, so the app stays
// readable no matter which background is picked.

const BACKGROUND_THEMES = [
  { id: "black", swatch: "#1b1f2a", label: "" },
  { id: "white", swatch: "#ffffff", label: "" },
  { id: "green", swatch: "#1b4d2e", label: "" },
  { id: "blue", swatch: "#14315c", label: "" },
  { id: "blackwhite", swatch: "linear-gradient(135deg,#000,#fff)", label: "" },
  { id: "greenblue", swatch: "linear-gradient(135deg,#1b4d2e,#14315c)", label: "" },
  { id: "piano", swatch: "#1b1f2a", label: "🎹" },
  { id: "stars", swatch: "#0a0e27", label: "✨" },
  { id: "snow", swatch: "#3a4a5a", label: "❄️" },
  { id: "notes", swatch: "#2a1f3d", label: "🎵" }
];

const ANIMATED_THEME_IDS = ["piano", "stars", "snow", "notes"];

const THEME_KEY = "suin_theme";

function renderThemePicker(activeId) {
  themePickerEl.innerHTML = "";
  BACKGROUND_THEMES.forEach((theme) => {
    const btn = document.createElement("button");
    btn.className = "themeSwatch" + (theme.id === activeId ? " active" : "");
    btn.style.background = theme.swatch;
    btn.title = theme.id;
    btn.textContent = theme.label;
    btn.addEventListener("click", () => applyTheme(theme.id));
    themePickerEl.appendChild(btn);
  });
}

function applyTheme(themeId) {
  document.body.className = document.body.className.replace(/theme-\S+/g, "").trim();
  document.body.classList.add("theme-" + themeId);
  localStorage.setItem(THEME_KEY, themeId);

  if (ANIMATED_THEME_IDS.includes(themeId)) startBackgroundAnimation(themeId);
  else stopBackgroundAnimation();

  renderThemePicker(themeId);
}

const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const voiceToggleBtn = document.getElementById("voiceToggleBtn");
const newChatBtn = document.getElementById("newChatBtn");
const chatListEl = document.getElementById("chatList");
const learnedCountEl = document.getElementById("learnedCount");
const photoInput = document.getElementById("photoInput");
const photoBtn = document.getElementById("photoBtn");

// ===== Voice: Suin talks back =====
//
// window.speechSynthesis is built into the browser — it turns text into
// speech completely offline, nothing is sent anywhere for this part.

let voiceEnabled = localStorage.getItem("suin_voice_enabled") !== "off";

function speak(text) {
  if (!voiceEnabled || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

function updateVoiceToggleBtn() {
  voiceToggleBtn.textContent = voiceEnabled ? "🔊" : "🔇";
  voiceToggleBtn.classList.toggle("muted", !voiceEnabled);
}

voiceToggleBtn.addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  localStorage.setItem("suin_voice_enabled", voiceEnabled ? "on" : "off");
  if (!voiceEnabled) speechSynthesis.cancel(); // stop talking immediately if muted mid-sentence
  updateVoiceToggleBtn();
});

updateVoiceToggleBtn();

// ===== Voice: you talk to Suin =====
//
// window.SpeechRecognition (or the webkit-prefixed version) is also built
// into the browser. In most browsers this actually sends your voice to the
// browser maker's own servers to turn into text — it's not fully offline
// like the talking-back part above, just also free and key-less.

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognizer = SpeechRecognitionAPI ? new SpeechRecognitionAPI() : null;

if (recognizer) {
  recognizer.lang = "en-US";
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  recognizer.addEventListener("result", (e) => {
    chatInput.value = e.results[0][0].transcript;
    chatInput.focus();
  });
  recognizer.addEventListener("end", () => micBtn.classList.remove("listening"));
  recognizer.addEventListener("error", () => micBtn.classList.remove("listening"));
}

micBtn.addEventListener("click", () => {
  if (!recognizer) {
    addMessage("Sorry, this browser doesn't support voice input.", "suin");
    return;
  }
  micBtn.classList.add("listening");
  recognizer.start();
});

// ===== Picture recognition (a real trained AI, not code someone wrote) =====
//
// Everything else in Suin — chat matching, math, drawing, music — is code
// with exact hand-written rules. No one could write a rule for every
// possible object in every possible photo, so this uses MobileNet instead:
// a neural network that already learned from over a million real photos.
// It runs entirely on THIS computer (TensorFlow.js's in-browser engine) —
// the photo itself is never sent anywhere, only the model file was
// downloaded once, the same free way as loading any other script.

let mobilenetModel = null;
let mobilenetLoading = null;

// Loads the model once and reuses it after that — the first photo in a
// session waits for the download, every photo after that is instant.
function ensureMobilenetLoaded() {
  if (mobilenetModel) return Promise.resolve(mobilenetModel);
  if (mobilenetLoading) return mobilenetLoading;
  if (!window.mobilenet) return Promise.reject(new Error("mobilenet library not loaded"));
  mobilenetLoading = window.mobilenet.load().then((m) => {
    mobilenetModel = m;
    return m;
  });
  return mobilenetLoading;
}

function aOrAn(word) {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

// MobileNet's classes often come as several comma-separated synonyms (e.g.
// "Egyptian cat, cat") — just the first one reads naturally in a sentence.
// High confidence gets one sure-sounding answer; low confidence is honest
// about being unsure instead of pretending to be certain.
function describePredictions(predictions) {
  if (!predictions || !predictions.length) return "I couldn't figure out what's in that picture.";
  const name = (p) => p.className.split(",")[0].trim();
  const top = predictions[0];
  const percent = Math.round(top.probability * 100);
  if (percent >= 50) {
    return "That looks like " + aOrAn(name(top)) + " " + name(top) + "! (" + percent + "% sure)";
  }
  const guesses = predictions.slice(0, 3).map(name).join(", or maybe ");
  return "Hmm, I'm not totally sure... it might be " + guesses + ".";
}

// Shows the uploaded photo as a user message bubble. Only the short label
// "📷 photo" is saved into chat history/the sidebar title (not the actual
// image data) — the same choice this project already made for drawings
// (item 15's addDrawing appends a canvas the same way, after the text-only
// message is saved) rather than storing possibly-huge image data.
function addPhotoMessage(dataUrl) {
  const div = addMessage("📷 photo", "user");
  const img = document.createElement("img");
  img.src = dataUrl;
  img.className = "suinPhoto";
  div.appendChild(img);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function handlePhotoFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    setBusy(true);
    addPhotoMessage(reader.result);

    const thinking = document.createElement("div");
    thinking.className = "msg suin thinking";
    thinking.textContent = "🔍 looking at your picture...";
    chatBox.appendChild(thinking);
    chatBox.scrollTop = chatBox.scrollHeight;

    const img = new Image();
    img.onload = () => {
      ensureMobilenetLoaded()
        .then((model) => model.classify(img))
        .then((predictions) => {
          thinking.remove();
          addMessage(describePredictions(predictions), "suin");
          setBusy(false);
        })
        .catch(() => {
          thinking.remove();
          addMessage("I couldn't look at that picture — the picture AI might not have finished loading. Check your internet connection and try again.", "suin");
          setBusy(false);
        });
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

photoBtn.addEventListener("click", () => {
  if (!isBusy) photoInput.click();
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  photoInput.value = ""; // reset so picking the exact same file again still fires "change"
  if (file && !isBusy) handlePhotoFile(file);
});

// Builds one message bubble in the chat window. Used both for a brand new
// message AND for replaying an old chat's messages back onto the screen.
// The text lives in its OWN inner span (not the div's textContent
// directly) — that matters because addDrawing() appends a <canvas> into
// this same div right after calling this; if the typewriter effect below
// set the whole div's textContent on every tick, it would wipe out that
// canvas the moment the next tick fired.
function renderMessageDOM(text, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  const textSpan = document.createElement("span");
  textSpan.textContent = text;
  div.appendChild(textSpan);
  chatBox.appendChild(div);
  return div;
}

// Reveals text one character at a time instead of all at once — the
// classic "typewriter" effect. Just a repeating timer that shows a longer
// slice of the same string each tick.
function typeOutText(textNode, text) {
  let shown = 0;
  const msPerChar = 18;
  const timer = setInterval(() => {
    shown++;
    textNode.textContent = text.slice(0, shown);
    chatBox.scrollTop = chatBox.scrollHeight;
    if (shown >= text.length) clearInterval(timer);
  }, msPerChar);
}

function addMessage(text, who) {
  // Suin's replies type themselves out; your own messages show instantly
  // (no reason to watch your own words appear slowly).
  const div = renderMessageDOM(who === "suin" ? "" : text, who);
  chatBox.scrollTop = chatBox.scrollHeight;

  currentMessages.push({ text, who });
  if (who === "user") upsertCurrentChatIntoHistory();
  // Only speak/type-out brand-new replies, never replayed history (loadChat
  // uses renderMessageDOM directly, not this function, so switching to an
  // old chat shows it instantly instead of re-animating + re-reading 20 old
  // messages back to back).
  if (who === "suin") {
    speak(text);
    typeOutText(div.firstChild, text);
  }
  return div;
}

function renderChatList() {
  chatListEl.innerHTML = "";
  chatHistory.forEach((chat) => {
    const row = document.createElement("div");
    row.className = "chatListRow";

    const item = document.createElement("button");
    item.className = "chatListItem" + (chat.id === currentChatId ? " active" : "");
    item.textContent = chat.title;
    item.addEventListener("click", () => loadChat(chat.id));
    row.appendChild(item);

    const del = document.createElement("button");
    del.className = "deleteChatBtn";
    del.textContent = "×";
    del.title = "Delete this chat";
    del.addEventListener("click", (e) => deleteChat(chat.id, e));
    row.appendChild(del);

    chatListEl.appendChild(row);
  });
}

// Deletes a saved chat after asking to make sure — a click here can't be
// undone, so we check first instead of just wiping it silently.
function deleteChat(id, event) {
  event.stopPropagation();
  const chat = chatHistory.find((c) => c.id === id);
  if (!chat) return;
  if (!confirm('Delete "' + chat.title + '"?')) return;

  chatHistory = chatHistory.filter((c) => c.id !== id);
  saveChatHistory();

  if (id === currentChatId) {
    startNewChat(); // the chat on screen was just deleted — start fresh
  } else {
    renderChatList();
  }
}

function loadChat(id) {
  const chat = chatHistory.find((c) => c.id === id);
  if (!chat) return;

  currentChatId = id;
  currentMessages = chat.messages;

  // Resume recipe context from THIS chat's own history (most recent
  // recipe card actually shown in it), instead of leaving whatever chat
  // you were previously in still attached.
  lastRecipeFood = null;
  for (let i = currentMessages.length - 1; i >= 0; i--) {
    const food = recipeFoodFromCardText(currentMessages[i].text);
    if (food) {
      lastRecipeFood = food;
      break;
    }
  }

  chatBox.innerHTML = "";
  currentMessages.forEach((m) => renderMessageDOM(m.text, m.who));
  chatBox.scrollTop = chatBox.scrollHeight;
  renderChatList();
}

function greet() {
  addMessage("Hi " + currentUser + "! I'm Suin. Type something below and I'll do my best to reply!", "suin");
}

// "New Chat" starts a fresh conversation with its own id. It does NOT
// erase what Suin has learned (that's knowledge, not chat history), and it
// does NOT erase past chats either — they're already saved and stay in the
// sidebar list, ready to click back into.
function startNewChat() {
  currentChatId = makeChatId();
  currentMessages = [];
  lastRecipeFood = null; // don't carry recipe context from a different chat into this new one
  chatBox.innerHTML = "";
  greet();
  renderChatList();
}

let isBusy = false;

// While Suin is "thinking," lock the input so a second message can't be
// sent until the reply for the first one has actually arrived.
function setBusy(busy) {
  isBusy = busy;
  chatInput.disabled = busy;
  sendBtn.disabled = busy;
  if (!busy) chatInput.focus();
}

const MAX_MESSAGE_LENGTH = 100000;

function sendMessage() {
  if (isBusy) return;
  // Same defense-in-depth idea as the name limit: the input's own
  // maxlength stops normal typing, but a paste or an already-saved chat
  // could still carry something longer — trim again here too.
  const text = chatInput.value.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!text) return;
  // Safe agent layer (suin-agent.js): handles timers, notes, links, safety, and refuses unsafe requests.
  if (window.SuinAgent && window.SuinAgent.intercept(text)) return;

  addMessage(text, "user");
  chatInput.value = "";
  setBusy(true);

  const thinking = document.createElement("div");
  thinking.className = "msg suin thinking";
  thinking.textContent = "...";
  chatBox.appendChild(thinking);
  chatBox.scrollTop = chatBox.scrollHeight;

  const mathExpr = extractMathExpression(text);
  const cookingSubject = !mathExpr && extractCookingSubject(text);
  const recipeKey = cookingSubject && findRecipeKey(cookingSubject);
  const detailedRecipe = recipeKey && DETAILED_RECIPES[recipeKey];
  const substitutionQuery = !mathExpr && !detailedRecipe && extractSubstitutionQuery(text);
  const drawSubject = !mathExpr && !detailedRecipe && !substitutionQuery && extractDrawSubject(text);
  const threeDSubject = !mathExpr && !detailedRecipe && !substitutionQuery && !drawSubject && extract3DSubject(text);
  const wantsMusic = !mathExpr && !detailedRecipe && !substitutionQuery && !drawSubject && !threeDSubject && isMusicRequest(text);
  const memoryQuery = !mathExpr && !detailedRecipe && !substitutionQuery && !drawSubject && !threeDSubject && !wantsMusic && extractMemoryQuery(text);
  const rememberFact = !mathExpr && !detailedRecipe && !substitutionQuery && !drawSubject && !threeDSubject && !wantsMusic && !memoryQuery && extractRememberFact(text);
  const factQuestion = !mathExpr && !detailedRecipe && !substitutionQuery && !drawSubject && !threeDSubject && !wantsMusic && !memoryQuery && !rememberFact && extractFactQuestion(text);
  const definitionQuery = !mathExpr && !detailedRecipe && !substitutionQuery && !drawSubject && !threeDSubject && !wantsMusic && !memoryQuery && !rememberFact && !factQuestion && extractDefinitionQuery(text);
  const reply =
    mathExpr || detailedRecipe || substitutionQuery || drawSubject || threeDSubject || wantsMusic || memoryQuery || rememberFact || factQuestion || definitionQuery
      ? null
      : findLocalMatch(text) || randomFallback();

  setTimeout(() => {
    thinking.remove();
    if (mathExpr) addMathReply(mathExpr);
    else if (detailedRecipe) {
      lastRecipeFood = recipeKey;
      addMessage(renderRecipeCard(recipeKey, detailedRecipe, extractCookingVerb(text)), "suin");
    } else if (substitutionQuery) addSubstitutionReply(substitutionQuery);
    else if (drawSubject) addDrawing(drawSubject);
    else if (threeDSubject) add3DObject(threeDSubject);
    else if (wantsMusic) addMusicReply();
    else if (memoryQuery) addMemoryReply(memoryQuery);
    else if (rememberFact) addRememberFactReply(rememberFact.subject, rememberFact.value);
    else if (factQuestion) addFactReply(factQuestion);
    else if (definitionQuery) addDefinitionReply(definitionQuery);
    else addMessage(reply, "suin");
    setBusy(false);
  }, 700);
}

function updateLearnedCount() {
  // Word definitions are counted separately from allExamples() — they're
  // looked up directly by exact word, not matched by word-overlap like a
  // normal example — but they're still real things Suin knows, so they add
  // to the total shown here.
  const total = allExamples().length + Object.keys(WORD_DEFINITIONS).length;
  learnedCountEl.textContent =
    "Suin knows " + total + " things (" + learned.length + " you taught).";
}

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
newChatBtn.addEventListener("click", startNewChat);

// Before accounts existed, Suin's data was saved under one shared name
// ("suin_learned"/"suin_chat_history", no username). The first person to
// log in with a name inherits that old data instead of it just vanishing.
function migrateLegacyDataIfNeeded() {
  const alreadyHasOwnData = localStorage.getItem(learnedKey()) !== null || localStorage.getItem(chatHistoryKey()) !== null;
  if (alreadyHasOwnData) return;

  const legacyLearned = localStorage.getItem("suin_learned");
  const legacyHistory = localStorage.getItem("suin_chat_history");
  if (legacyLearned) localStorage.setItem(learnedKey(), legacyLearned);
  if (legacyHistory) localStorage.setItem(chatHistoryKey(), legacyHistory);
}

// Logs the given name in: remembers it, loads THAT person's own saved
// examples + chat history (separate from anyone else who's used Suin on
// this computer), and starts a fresh chat.
function loginAs(name) {
  // Also cap here (not just in the input field) — this runs on page load
  // with whatever name was last saved, which could be a giant one saved
  // before this limit existed.
  currentUser = name.trim().slice(0, MAX_NAME_LENGTH);
  localStorage.setItem(CURRENT_USER_KEY, currentUser);

  migrateLegacyDataIfNeeded();
  learned = loadLearned();
  rememberedFacts = loadFacts();
  chatHistory = loadChatHistory();

  loginScreen.style.display = "none";
  sidebar.style.display = "flex";
  mainArea.style.display = "flex";
  currentUserLabel.textContent = "👤 " + currentUser;

  currentChatId = makeChatId();
  currentMessages = [];
  lastRecipeFood = null; // fresh chat, fresh account — no recipe context carried over
  chatBox.innerHTML = "";
  greet();
  updateLearnedCount();
  renderChatList();
}

const MAX_NAME_LENGTH = 35;

function handleLoginSubmit() {
  // The input's maxlength stops normal typing, but doesn't protect against
  // a paste or a name saved before this limit existed — trim again here so
  // a giant name can never break the layout (rendered in the sidebar and
  // in the greeting message, both of which assume a short name).
  const name = loginNameInput.value.trim().slice(0, MAX_NAME_LENGTH);
  if (!name) return;
  loginAs(name);
}

// Logs out back to the name screen. Doesn't delete anything — that
// person's examples and chats are still saved under their name in
// localStorage, ready to load again next time they type it in.
function switchUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  currentUser = null;
  sidebar.style.display = "none";
  mainArea.style.display = "none";
  loginScreen.style.display = "flex";
  loginNameInput.value = "";
  loginNameInput.focus();
}

// ===== Sign in with Google =====
//
// A Google ID token is 3 base64url chunks separated by dots. The middle
// chunk is the actual data (name, email, picture...) — this decodes just
// that middle chunk back into a normal JS object. No library needed for
// this part, just base64 decoding.
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

const GOOGLE_CLIENT_ID = "1067536385186-qcgn7cnv83uv3gcnkfnmka08duk4893i.apps.googleusercontent.com";

function handleGoogleCredentialResponse(response) {
  const profile = parseJwt(response.credential);
  // Only using the name here (not email/photo) — keeps this to the same
  // amount of personal info the plain name login already uses.
  loginAs(profile.name);
}

// Called once Google's sign-in script has actually finished loading
// (see the onload= on its <script> tag in the HTML).
function initGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredentialResponse
  });
  google.accounts.id.renderButton(document.getElementById("googleSignInDiv"), {
    theme: "outline",
    size: "large"
  });
}

loginBtn.addEventListener("click", handleLoginSubmit);
loginNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleLoginSubmit();
});
switchUserBtn.addEventListener("click", switchUser);

// ===== Animated backgrounds =====
//
// One shared canvas + one shared requestAnimationFrame loop drives all 4
// animated themes (piano/stars/snow/notes) — only the "maker" (creates one
// particle) and "draw" (renders one particle) functions differ per theme.
// Only runs while an animated theme is actually selected — no point
// burning CPU animating a canvas nobody's looking at.

const PARTICLE_COUNTS = { piano: 14, stars: 60, snow: 40, notes: 12 };

let bgParticles = [];
let bgAnimId = null;
let bgLastFrameTime = null;
let currentAnimTheme = null;

// --- piano: keys fall down, swaying side to side ---
function makePianoKey(canvas, startAnywhere) {
  const isBlackKey = Math.random() < 0.35;
  return {
    x: Math.random() * canvas.width,
    y: startAnywhere ? Math.random() * canvas.height : -40,
    width: isBlackKey ? 10 : 18,
    height: isBlackKey ? 26 : 40,
    speed: 20 + Math.random() * 30,
    black: isBlackKey,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.5 + Math.random()
  };
}
function drawPianoKey(ctx, key) {
  const swayX = Math.sin(key.sway) * 8;
  ctx.save();
  ctx.translate(key.x + swayX, key.y);
  ctx.fillStyle = key.black ? "#0d0d0d" : "#f5f5f5";
  ctx.strokeStyle = key.black ? "#000" : "#999";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(-key.width / 2, -key.height / 2, key.width, key.height);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// --- stars: stay put, twinkle by oscillating opacity ---
function makeStar(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 1 + Math.random() * 2,
    phase: Math.random() * Math.PI * 2,
    speed: 1 + Math.random() * 2
  };
}
function drawStar(ctx, star) {
  const opacity = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(star.phase));
  ctx.beginPath();
  ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255," + opacity.toFixed(2) + ")";
  ctx.fill();
}

// --- snow: falls down, gentle sideways drift ---
function makeSnowflake(canvas, startAnywhere) {
  return {
    x: Math.random() * canvas.width,
    y: startAnywhere ? Math.random() * canvas.height : -10,
    r: 2 + Math.random() * 3,
    speed: 15 + Math.random() * 25,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.3 + Math.random() * 0.5
  };
}
function drawSnowflake(ctx, flake) {
  ctx.beginPath();
  ctx.arc(flake.x + Math.sin(flake.sway) * 15, flake.y, flake.r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fill();
}

// --- notes: float upward, gentle sideways drift ---
const NOTE_CHARS = ["♪", "♫", "♩", "♬"];
function makeNote(canvas, startAnywhere) {
  return {
    x: Math.random() * canvas.width,
    y: startAnywhere ? Math.random() * canvas.height : canvas.height + 20,
    char: NOTE_CHARS[Math.floor(Math.random() * NOTE_CHARS.length)],
    size: 16 + Math.random() * 14,
    speed: 15 + Math.random() * 25,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.4 + Math.random() * 0.6,
    color: Math.random() < 0.5 ? "#ffd166" : "#4a7dff"
  };
}
function drawNote(ctx, note) {
  ctx.font = note.size + "px sans-serif";
  ctx.fillStyle = note.color;
  ctx.fillText(note.char, note.x + Math.sin(note.sway) * 12, note.y);
}

function animateBackground(timestamp) {
  if (!bgLastFrameTime) bgLastFrameTime = timestamp;
  const dt = (timestamp - bgLastFrameTime) / 1000;
  bgLastFrameTime = timestamp;

  const ctx = animCanvas.getContext("2d");
  ctx.clearRect(0, 0, animCanvas.width, animCanvas.height);

  bgParticles.forEach((p, i) => {
    if (currentAnimTheme === "piano") {
      p.y += p.speed * dt;
      p.sway += p.swaySpeed * dt;
      if (p.y - p.height > animCanvas.height) bgParticles[i] = makePianoKey(animCanvas, false);
      drawPianoKey(ctx, bgParticles[i]);
    } else if (currentAnimTheme === "stars") {
      p.phase += p.speed * dt;
      drawStar(ctx, p);
    } else if (currentAnimTheme === "snow") {
      p.y += p.speed * dt;
      p.sway += p.swaySpeed * dt;
      if (p.y - p.r > animCanvas.height) bgParticles[i] = makeSnowflake(animCanvas, false);
      drawSnowflake(ctx, bgParticles[i]);
    } else if (currentAnimTheme === "notes") {
      p.y -= p.speed * dt;
      p.sway += p.swaySpeed * dt;
      if (p.y + p.size < 0) bgParticles[i] = makeNote(animCanvas, false);
      drawNote(ctx, bgParticles[i]);
    }
  });

  bgAnimId = requestAnimationFrame(animateBackground);
}

function startBackgroundAnimation(themeId) {
  currentAnimTheme = themeId;
  animCanvas.width = mainArea.clientWidth;
  animCanvas.height = mainArea.clientHeight;

  const makers = { piano: makePianoKey, stars: makeStar, snow: makeSnowflake, notes: makeNote };
  const maker = makers[themeId];
  bgParticles = [];
  for (let i = 0; i < PARTICLE_COUNTS[themeId]; i++) {
    bgParticles.push(themeId === "stars" ? maker(animCanvas) : maker(animCanvas, true));
  }

  bgLastFrameTime = null;
  if (bgAnimId) cancelAnimationFrame(bgAnimId);
  bgAnimId = requestAnimationFrame(animateBackground);
}

function stopBackgroundAnimation() {
  if (bgAnimId) {
    cancelAnimationFrame(bgAnimId);
    bgAnimId = null;
  }
  currentAnimTheme = null;
}

window.addEventListener("resize", () => {
  if (currentAnimTheme) {
    animCanvas.width = mainArea.clientWidth;
    animCanvas.height = mainArea.clientHeight;
  }
});

// Restore the saved background theme (independent of login — it's a
// device display preference, not per-account chat data).
applyTheme(localStorage.getItem(THEME_KEY) || "black");

// Whoever was logged in last stays logged in; otherwise show the name
// screen first.
if (currentUser) {
  loginAs(currentUser);
} else {
  loginScreen.style.display = "flex";
  loginNameInput.focus();
}

// ===== Logo badge decorations =====
//
// The rim ticks and the laurel-wreath leaves are the same little shape
// repeated over and over in a circle. Rather than hand-typing dozens of
// <line>/<ellipse> tags, we calculate each one's position with math:
// Math.cos/Math.sin turn an angle into an (x, y) point on a circle.

const SVG_NS = "http://www.w3.org/2000/svg";

// Given a center point, a radius, and an angle (in degrees), return the
// (x, y) point that sits on the edge of that circle at that angle.
function pointOnCircle(cx, cy, radius, angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad)
  };
}

// The outer ring is now a solid, thick gold band (r=80 to r=96). The rim
// "ticks" are drawn as dark notches cut INTO that band, like the grooves
// on a real coin's edge, instead of thin gold lines sitting outside it.
function buildRimTicks() {
  const group = document.getElementById("logoTicks");
  const cx = 100, cy = 100;
  const tickCount = 48;

  for (let i = 0; i < tickCount; i++) {
    const angle = (360 / tickCount) * i;
    const inner = pointOnCircle(cx, cy, 82, angle);
    const outer = pointOnCircle(cx, cy, 94, angle);

    const tick = document.createElementNS(SVG_NS, "line");
    tick.setAttribute("x1", inner.x);
    tick.setAttribute("y1", inner.y);
    tick.setAttribute("x2", outer.x);
    tick.setAttribute("y2", outer.y);
    tick.setAttribute("stroke", "#0d0d0d");
    tick.setAttribute("stroke-width", "1.5");
    group.appendChild(tick);
  }
}

// The stem is the curved branch line the leaves attach to. Since every
// point on it is the same distance from the badge's center, it's just a
// circular arc — start point, end point, same radius.
function addStem(group, startAngle, endAngle, radius) {
  const cx = 100, cy = 100;
  const start = pointOnCircle(cx, cy, radius, startAngle);
  const end = pointOnCircle(cx, cy, radius, endAngle);

  const stem = document.createElementNS(SVG_NS, "path");
  stem.setAttribute("d", `M ${start.x},${start.y} A ${radius},${radius} 0 0,1 ${end.x},${end.y}`);
  stem.setAttribute("stroke", "url(#goldGrad)");
  stem.setAttribute("stroke-width", "1.5");
  stem.setAttribute("fill", "none");
  group.appendChild(stem);
}

// A proper pointed leaf shape (not a plain oval): two curves meeting at a
// base point and a tip point, like an almond. Drawn pointing along +x,
// then moved and spun into place with translate+rotate.
function addLeaf(group, angleDeg, stemRadius) {
  const cx = 100, cy = 100;
  const base = pointOnCircle(cx, cy, stemRadius, angleDeg);
  const length = 15, width = 5;

  const leaf = document.createElementNS(SVG_NS, "path");
  leaf.setAttribute(
    "d",
    `M 0,0 Q ${length * 0.35},${-width} ${length},0 Q ${length * 0.35},${width} 0,0 Z`
  );
  leaf.setAttribute("fill", "url(#goldGrad)");
  leaf.setAttribute("transform", `translate(${base.x} ${base.y}) rotate(${angleDeg})`);
  group.appendChild(leaf);

  // A thin center vein line, so each leaf doesn't look like a flat blob.
  const vein = document.createElementNS(SVG_NS, "line");
  vein.setAttribute("x1", 0);
  vein.setAttribute("y1", 0);
  vein.setAttribute("x2", length * 0.85);
  vein.setAttribute("y2", 0);
  vein.setAttribute("stroke", "#3a2c05");
  vein.setAttribute("stroke-width", "0.6");
  vein.setAttribute("transform", `translate(${base.x} ${base.y}) rotate(${angleDeg})`);
  group.appendChild(vein);
}

function buildWreath() {
  const leftGroup = document.getElementById("logoWreathLeft");
  const rightGroup = document.getElementById("logoWreathRight");
  const leafCount = 7;
  const stemRadius = 58;
  const startAngle = 96;
  const step = 12;
  const endAngle = startAngle + (leafCount - 1) * step;

  // 90deg = straight down (bottom of the circle), 180deg = left side.
  // Sweeping from 96deg to 168deg draws a branch curving up the left side.
  addStem(leftGroup, startAngle, endAngle, stemRadius);
  addStem(rightGroup, 180 - startAngle, 180 - endAngle, stemRadius);

  for (let i = 0; i < leafCount; i++) {
    const angle = startAngle + i * step;
    addLeaf(leftGroup, angle, stemRadius);
    addLeaf(rightGroup, 180 - angle, stemRadius); // mirror across the vertical center line
  }
}

buildRimTicks();
buildWreath();
