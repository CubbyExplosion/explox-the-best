// ─── NEW MOVIE (made automatically): The Snowman Who Wanted the Beach — a winter adventure comedy with a brave kid, a goofy cat and a wise wizard.
(function () {
  if (typeof CINEMA_MOVIES === 'undefined') return;
  const M = [];
  const L = (w, e, a, t) => [w, e, a, t];
  const S = (place, tod, prop, say, lines, extra) => ({
    text: say, dur: 62,
    draw: function (ctx, w, h) { ctx.fillStyle = '#10131f'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#fff'; ctx.font = 'bold ' + Math.round(h * .05) + 'px Arial'; ctx.textAlign = 'center'; ctx.fillText(say, w / 2, h / 2); },
    script: Object.assign({ place: place, tod: tod, prop: prop, lines: lines }, extra || {}),
  });
M.push({
  title: "The Snowman Who Wanted the Beach", genre: "⛄ Winter Adventure", price: 30, bg: "#13304a", icons: "⛄🏖️🧊", comedy: true,
  cast: { A: { role: "Flurry", kind: "hero", pers: "hero", move: "SNOWBALL SMASH", mtype: "punch", fav: "Cold hands, warm heart!", say: "I know, I should ask for help. I just hate asking." }, B: { role: "Mittens", kind: "cat", pers: "goof", move: "CLAW FLURRY", mtype: "kick", fav: "Is there a snack involved?", say: "Sorry, I got distracted by a snowflake again." }, C: { role: "Professor Pip", kind: "wizard", pers: "wise", move: "SPARKLE BLAST KICK", mtype: "kick", fav: "Think first, melt later.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "⛄ One magic snowman...", dur: 2200 }, { text: "🏖️ One very sunny dream...", dur: 2200 }, { text: "😅 And a long way to go before he melts!", dur: 2400 }, { text: "THE SNOWMAN WHO WANTED THE BEACH", dur: 3000 }],
  scenes: [
    S("snow", "day", "tree", "On a snowy morning in Explox, Flurry and Mittens build the biggest snowman of the winter.", [
      L("N", "warm", "snowball", "It had snowed all night, and the whole of Explox was wrapped in white."),
      L("A", "excited", "snowball", "Mittens, roll the middle ball. I will make the head. Ready, set, snow!"),
      L("B", "joy", "build", "I am rolling! I am rolling! Whoa, I am a snowball now!"),
      L("A", "happy", "build", "Ha ha, careful, you are getting bigger than the snowman!"),
      L("B", "curious", "build", "What do we use for a nose? A carrot? A pickle? A tiny rocket?"),
      L("A", "warm", "photo", "A carrot is perfect. And two round pebbles for eyes. Say cheese, Mr. Snowman!"),
      L("B", "joy", "photo", "He is so handsome. Let us call him Mr. Flake!"),
    ]),
    S("snow", "dusk", "lantern", "That night, a little spark of magic floats down from the sky.", [
      L("N", "curious", "magic", "As the moon came up, a tiny star fell onto the snowman's hat."),
      L("N", "surprised", "magic", "Sparkle, sparkle, pop! The snowman blinked, and then he waved."),
      L("A", "shocked", "look", "Mittens, did you see that? The snowman just waved at us!"),
      L("B", "shocked", "panic", "He is alive! He is alive! Please do not eat my snacks!"),
      L("N", "warm", "talk", "Hello, friends. I am Mr. Flake. I have a big wish."),
      L("A", "curious", "talk", "A wish? Tell us. We will do our best to help."),
      L("N", "happy", "talk", "I have seen the beach in a picture book. I want to see the real beach, and the real sea."),
      L("B", "worried", "talk", "Um, Mr. Flake? The beach is very hot, and you are very, very snow."),
    ]),
    S("house", "day", "book", "Flurry and Mittens ask wise Professor Pip how a snowman can visit a hot beach.", [
      L("C", "curious", "write", "A snowman at the beach? Fascinating. Let me check my big book of ideas."),
      L("A", "worried", "talk", "He will melt in the sun, Professor. We need a plan."),
      L("C", "serious", "write", "The sun is the problem. Melting is just snow changing its mind."),
      L("B", "joy", "eat", "Ooh, ice cream also melts. Maybe he is a very big ice cream!"),
      L("C", "warm", "talk", "Mittens, that is not helping. But it gives me an idea."),
      L("C", "excited", "build", "A freezer wagon! We pack him in ice, and pull him along in the cool of the evening."),
      L("A", "determined", "work", "Great idea. Let us build it right now!"),
      L("C", "happy", "magic", "Think first, melt later. And a little frost spell, just in case."),
    ]),
    S("market", "dawn", "pizza", "At the market, the team gathers everything they need for the trip.", [
      L("A", "determined", "shop", "We need ice, blankets, a big fan, and sunglasses for Mr. Flake."),
      L("B", "curious", "shop", "Sunglasses for a snowman? Why? He has pebbles for eyes."),
      L("N", "happy", "talk", "Because it is fashionable, Mittens, and also very sunny where we are going."),
      L("A", "joy", "shop", "These round blue ones are perfect. Look, they match his carrot!"),
      L("B", "excited", "juggle", "I will carry the ice cubes. One, two, three, whoa, they are slippery!"),
      L("A", "worried", "panic", "Mittens, do not drop them! We need every cube!"),
      L("B", "joy", "juggle", "I am a professional ice cube juggler. Tada!"),
    ]),
    S("park", "day", "sun", "Trouble! Halfway across the park, the sun comes out from behind a cloud.", [
      L("N", "serious", "walk", "The little team pulled the freezer wagon along the park path."),
      L("B", "worried", "look", "Flurry, the sun came out. And it is shining on the wagon."),
      L("A", "scared", "panic", "Quick! Cover the snowman! Blankets, everybody, blankets!"),
      L("N", "worried", "panic", "Drip. Drip. Drip. Mr. Flake's carrot was starting to droop."),
      L("B", "scared", "run", "He is melting! He is melting! Somebody get a cloud!"),
      L("C", "serious", "magic", "Stand back. A little chill spell, quickly, before the next drip."),
      L("N", "relieved", "bubbles", "Frosty bubbles floated around the snowman, and the drips slowed down."),
      L("A", "relieved", "talk", "Phew. That was close. Let us hurry before the sun gets back."),
    ]),
    S("city", "dusk", "car", "They reach the busy city, where something sneaky is waiting around the corner.", [
      L("N", "curious", "walk", "As the sun went down, the team rolled through the streets of Explox."),
      L("B", "surprised", "look", "Oh look! A very fast pizza scooter is coming right at us!"),
      L("A", "shocked", "panic", "Everyone, move aside! Hold the wagon steady!"),
      L("N", "surprised", "skate", "The scooter zipped past, and out fell a stack of pizza boxes."),
      L("B", "joy", "eat", "Free pizza! Flurry, free pizza! Is it okay to eat free pizza?"),
      L("A", "warm", "talk", "Ask the delivery girl first, Mittens. She is coming back."),
      L("N", "happy", "highfive", "She laughed, gave them a slice each, and pointed them toward the beach road."),
      L("A", "joy", "party", "What a great day. A snowman, a cat, a wizard and a pizza!"),
    ]),
    S("beach", "night", "moon", "At last, under a bright moon, they arrive at the beach.", [
      L("N", "warm", "walk", "When they reached the beach, the sun was gone and the moon was out."),
      L("A", "joy", "look", "Mr. Flake, we made it. Open your eyes. This is the beach."),
      L("N", "joy", "look", "The snowman looked at the shining sea and the silver sand, and a happy tear froze on his cheek."),
      L("N", "warm", "talk", "It is even more beautiful than the picture book. Thank you, my friends."),
      L("B", "happy", "fish", "Look at the waves! Can I catch a fish? Just one tiny fish?"),
      L("C", "warm", "talk", "The moon makes the sand cool and the air gentle. This is the perfect time, Mr. Flake."),
      L("A", "happy", "camp", "Let us make a little campfire, well, a very small, very safe one, a bit far from Mr. Flake."),
      L("B", "joy", "play", "I will play catch with a seashell. Come on, Mr. Flake, throw it!"),
    ]),
    S("beach", "night", "moon", "Then the twist: the beach is full of surprise guests.", [
      L("N", "curious", "look", "Suddenly, the sand began to wiggle all along the shore."),
      L("B", "scared", "panic", "The sand is moving! Is it a sand monster?"),
      L("N", "surprised", "look", "One by one, tiny crabs wearing little scarves came marching out."),
      L("C", "surprised", "look", "Fascinating. The crabs knitted scarves for the cold, moonlit nights."),
      L("N", "joy", "dance", "The crabs held a winter party on the beach, with music made of shells."),
      L("A", "joy", "dance", "Mr. Flake, they want to dance with you!"),
      L("N", "joy", "drum", "The snowman spun and swayed, and the little crabs cheered."),
      L("B", "joy", "party", "Best beach party ever! And nobody even asked for a ticket!"),
    ]),
    S("snow", "dawn", "sun", "At dawn, the team pulls Mr. Flake back to the snowy hills before the morning sun.", [
      L("N", "warm", "walk", "Before the sun rose, the friends packed up the freezer wagon and hurried back."),
      L("B", "happy", "walk", "Mr. Flake, did you like the beach? Was it everything you wished for?"),
      L("N", "happy", "talk", "It was the best night of my whole life. Thank you, Flurry, Mittens and Professor."),
      L("A", "warm", "talk", "You are our friend, Mr. Flake. We would do it all over again."),
      L("C", "warm", "magic", "And a little more frost magic, so you never melt, as long as it snows."),
      L("N", "joy", "snowball", "Flakes started falling gently, and Mr. Flake held out his twig hand to catch them."),
      L("A", "joy", "snowball", "Snowball fight to celebrate! Mittens, you are on my team!"),
      L("B", "joy", "snowball", "Snowball fight! Mr. Flake is the referee! Cold hands, warm heart!"),
      L("N", "warm", "talk", "And that is how a snowman saw the beach, and how four friends learned that wishes can come true. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
