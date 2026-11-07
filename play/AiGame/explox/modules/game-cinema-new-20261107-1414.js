// ─── NEW MOVIE (made automatically): The Great Sandcastle Contest — a beach comedy with a determined girl, a goofy crab-loving dino and a wise lifeguard.
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
  title: "The Great Sandcastle Contest", genre: "🏖️ Beach Comedy", price: 30, bg: "#5a4a2a", icons: "🏖️🏰🦀", comedy: true,
  cast: { A: { role: "Marina", kind: "hero", pers: "hero", move: "WAVE KICK", mtype: "kick", fav: "Build big, dream bigger!", say: "I know, I should check the tide. I never do." }, B: { role: "Pudge the Dino", kind: "dino", pers: "goof", move: "TAIL WHIP", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, I sat on the castle again." }, C: { role: "Lifeguard Lou", kind: "pioneer", pers: "wise", move: "WHISTLE SPIN", mtype: "spin", fav: "The sea always teaches patience.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "🏖️ One sunny beach...", dur: 2200 }, { text: "🏰 One huge sand castle...", dur: 2200 }, { text: "🌊 And one sneaky wave!", dur: 2400 }, { text: "THE GREAT SANDCASTLE CONTEST", dur: 3000 }],
  scenes: [
    S("beach", "day", "sun", "On a warm summer day, Marina and Pudge arrive at the beach contest.", [
      L("N", "joy", "walk", "It was a hot, sunny day at Explox Beach, and the waves sparkled like blue glitter."),
      L("A", "excited", "jump", "Pudge, look at all the people! It is the Great Sandcastle Contest!"),
      L("B", "joy", "dance", "Sandcastles! I love sand! And castles! And especially snacks near the sand!"),
      L("C", "happy", "talk", "Welcome, builders! I am Lifeguard Lou. The rule is simple: build the best castle in two hours."),
      L("A", "determined", "talk", "Build big, dream bigger! Pudge, we are going to build the biggest castle on the beach."),
      L("B", "excited", "talk", "With towers! And a moat! And a secret tunnel! And a snack room!"),
      L("C", "warm", "talk", "Remember, the sea always teaches patience. Build slowly, and keep the castle away from the waves."),
      L("A", "joy", "highfive", "Got it, Lou! Ready, Pudge? Let us dig!"),
    ]),
    S("beach", "day", "sun", "They build the castle, but Pudge makes it funny.", [
      L("N", "joy", "dig", "Marina and Pudge dug a big circle in the sand, and piled up wet sand in the middle."),
      L("A", "determined", "build", "I will make the main tower, tall and round. You make the walls, Pudge."),
      L("B", "joy", "build", "Yes, boss! I will make the wall as wide as a whale! Pat, pat, pat!"),
      L("N", "surprised", "look", "But Pudge patted the wall so hard that his big tail swished, and knocked down half of the tower."),
      L("A", "worried", "look", "Pudge! Your tail! You knocked over the tower!"),
      L("B", "sad", "talk", "Oops. Sorry, Marina. My tail has a mind of its own."),
      L("A", "warm", "talk", "It is okay. Let us rebuild. And this time, wrap your tail with a towel."),
      L("N", "joy", "build", "Pudge wrapped his tail in a bright striped towel, and they began again."),
    ]),
    S("beach", "day", "sun", "They add details, and a little crab makes a funny appearance.", [
      L("N", "joy", "build", "The castle grew taller and taller, with towers, a bridge, a gate and a long, winding moat."),
      L("A", "joy", "work", "I will carve little windows with a shell. And a flag made of seaweed on top."),
      L("B", "joy", "write", "And I will draw a staircase with my finger! One step, two steps, three steps, four!"),
      L("N", "curious", "look", "Then, something small and red crept out of the moat, and tapped on the tower."),
      L("B", "surprised", "look", "Marina! A crab! A very small, very red crab! Hello, little guy!"),
      L("N", "joy", "look", "The crab waved its tiny claws, and walked right into the castle gate, as if it lived there."),
      L("A", "joy", "talk", "It looks like we have our first royal guest. Welcome, King Crab!"),
      L("B", "joy", "dance", "King Crab! He needs a throne! I will build him a tiny crab throne!"),
    ]),
    S("beach", "day", "sun", "Lou warns them about the tide, but they are too busy.", [
      L("C", "serious", "walk", "Marina, Pudge, great job so far. But look at the water. The tide is coming in."),
      L("A", "worried", "look", "The tide? Oh dear. The waves are a little closer than before."),
      L("B", "worried", "look", "Closer? Maybe they just want to see our castle. They are curious waves."),
      L("C", "warm", "talk", "The sea is friendly, but it does not know our castle is delicate. Build a barrier of wet sand."),
      L("A", "determined", "build", "Good idea, Lou! Pudge, let us build a big wall in front of the castle!"),
      L("N", "excited", "build", "They piled up a thick wall of wet sand, with a little moat in front to catch the water."),
      L("B", "determined", "dig", "Dig, dig, dig! Pudge the Wall Builder to the rescue!"),
      L("A", "relieved", "talk", "That looks strong. I think the wall will hold. Let us finish the last tower."),
    ]),
    S("beach", "day", "sun", "A big wave comes, and everything seems lost.", [
      L("N", "worried", "look", "Just as they were finishing the tower, a big wave rolled up the sand, higher than any wave before."),
      L("A", "shocked", "look", "Watch out! A huge wave is coming! Everybody, protect the castle!"),
      L("B", "scared", "panic", "Oh no, oh no! The water! The sand! My castle! My snack room!"),
      L("N", "worried", "look", "The wave splashed against the wall, and washed over the moat, and swirled around the towers."),
      L("N", "sad", "look", "When the water slid back, half the castle had melted into a soft, wet pile of sand."),
      L("A", "sad", "look", "Our castle. It is almost all gone. All that work."),
      L("B", "sad", "talk", "I am sorry, Marina. Maybe sandcastles are not made to last forever."),
      L("C", "warm", "talk", "Do not give up yet, you two. The contest is not over. The sea took something, but it also gave something."),
    ]),
    S("beach", "day", "sun", "The twist: the wave left a surprise that makes the castle better.", [
      L("N", "curious", "look", "Lou pointed to the spot where the wave had washed away the sand."),
      L("N", "surprised", "look", "In the middle of the wet ground, shells of every color, smooth pebbles and a big shiny starfish had washed up."),
      L("A", "surprised", "look", "Wow! Look at all those shells! They are beautiful! And the starfish is so bright!"),
      L("B", "joy", "dance", "Treasure! The sea gave us decorations! We can make the castle sparkle!"),
      L("A", "excited", "build", "Pudge, let us rebuild, smaller, but with shells all over the walls!"),
      L("N", "joy", "build", "They rebuilt the castle, and pressed the shells into the sand in beautiful patterns, spirals and stars."),
      L("B", "joy", "work", "And the big starfish goes right on top, as a golden crown!"),
      L("C", "joy", "photo", "That is the most beautiful sandcastle I have seen on this beach in thirty years!"),
    ]),
    S("beach", "dusk", "trophy", "The judges announce the winners, with a funny final surprise.", [
      L("N", "excited", "party", "At the end of the contest, all the sandcastles stood in a long row, shining in the afternoon light."),
      L("C", "happy", "talk", "The judges have decided! The prize for the most beautiful castle goes to Marina and Pudge!"),
      L("A", "joy", "jump", "We won! Pudge, we won! Our little shell castle won!"),
      L("B", "joy", "dance", "Yay! I am the happiest dinosaur on the beach! Hooray!"),
      L("N", "joy", "party", "The judges handed them a golden bucket, and a gift basket full of snacks."),
      L("B", "joy", "eat", "Snacks! A whole basket of snacks! This is the best day of my life!"),
      L("N", "surprised", "look", "Just then, the little red crab crawled up onto the golden bucket, and waved a tiny claw."),
      L("A", "joy", "talk", "King Crab! He came to celebrate, too! Everybody, three cheers for King Crab!"),
    ]),
    S("beach", "dusk", "sun", "At sunset, the friends say goodbye to the beach.", [
      L("N", "warm", "walk", "As the sun sank low, the sky turned orange and pink, and the waves rolled gently up the shore."),
      L("A", "warm", "talk", "Lou, thank you for the warning about the tide. We would never have built the wall without you."),
      L("C", "warm", "talk", "The sea always teaches patience, Marina. And you learned something even better today."),
      L("A", "happy", "talk", "That a wave can take a castle, but friends can always build a new one."),
      L("B", "joy", "photo", "Everybody, smile! A photo of the best sandcastle team in Explox!"),
      L("N", "warm", "walk", "The tide slowly came in, and the little castle melted back into the sea, one wave at a time."),
      L("B", "warm", "talk", "Goodbye, castle. Goodbye, King Crab. We will build you again tomorrow."),
      L("N", "warm", "talk", "And that is the story of the great sandcastle contest, and the wave that made it better. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
