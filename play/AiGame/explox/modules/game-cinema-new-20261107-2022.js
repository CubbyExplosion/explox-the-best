// ─── NEW MOVIE (made automatically): The Picnic That Floated Away — a park comedy with a sweet granny, a hungry dino and a clever kid.
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
  title: "The Picnic That Floated Away", genre: "🧺 Park Comedy", price: 30, bg: "#2a4a2a", icons: "🧺🎈☀️", comedy: true,
  cast: { A: { role: "Granny Basket", kind: "grandma", pers: "sweet", move: "PICNIC BLANKET SPIN", mtype: "spin", fav: "Good food tastes better shared.", say: "I could not say no to a hungry guest. I never can." }, B: { role: "Munch the Dino", kind: "dino", pers: "goof", move: "TAIL WHIP", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, I ate the sandwich again." }, C: { role: "Kit the Kid", kind: "hero", pers: "hero", move: "BALLOON BOOT", mtype: "kick", fav: "Every problem has a clever fix.", say: "I know, I should look up before I run. I never do." } },
  trailer: [{ text: "🧺 One perfect picnic...", dur: 2200 }, { text: "🎈 One bunch of balloons...", dur: 2200 }, { text: "☀️ And a lunch in the sky!", dur: 2400 }, { text: "THE PICNIC THAT FLOATED AWAY", dur: 3000 }],
  scenes: [
    S("park", "day", "sun", "On a sunny Sunday, three friends set up a big picnic in the park.", [
      L("N", "warm", "walk", "It was a bright, breezy Sunday in Explox Park, and the grass was green and soft."),
      L("A", "happy", "camp", "Here is a perfect spot, under the big oak tree. Let us spread out the blanket."),
      L("B", "joy", "dance", "A picnic! My favorite meal of the day! Is there a snack involved? Please say yes!"),
      L("A", "warm", "talk", "There are a dozen snacks, Munch. Sandwiches, strawberries, lemonade and a big chocolate cake."),
      L("C", "excited", "build", "And I brought the balloons, to tie to the basket so everybody can find us. Red, blue and yellow!"),
      L("N", "joy", "work", "They laid out the checkered blanket, set out the plates and tied a big bunch of colorful balloons to the picnic basket."),
      L("A", "warm", "talk", "Good food tastes better shared. Now, let us wait for a few more friends to join us."),
      L("B", "worried", "look", "Wait. Can we just have a little tiny bite first? My tummy is making dinosaur noises."),
    ]),
    S("park", "day", "sun", "A big gust of wind lifts the picnic basket into the air.", [
      L("A", "serious", "talk", "Munch, we must wait. A little patience makes the cake taste sweeter."),
      L("B", "sad", "talk", "Okay. Patience. But my tummy is not very patient."),
      L("N", "curious", "look", "Just then, a strong, warm breeze blew across the park, and the balloons tugged at their strings."),
      L("C", "surprised", "look", "Whoa! The balloons are pulling the basket! It is lifting off the ground!"),
      L("N", "shocked", "fly", "Whoosh! The whole picnic basket, with all the food, floated up into the air, balloons first."),
      L("A", "shocked", "panic", "Oh my goodness! Our picnic is flying away! The sandwiches! The cake!"),
      L("B", "shocked", "run", "Come back, lunch! I did not even get one bite! Wait for me!"),
      L("C", "determined", "run", "Quick, everyone, let us chase it! Every problem has a clever fix!"),
    ]),
    S("park", "day", "tree", "The chase is on, and it gets very silly.", [
      L("N", "excited", "run", "The three friends raced across the park, after the basket bobbing in the sky."),
      L("B", "excited", "jump", "I will catch it! I can jump very high! Jumping dinosaurs are the best!"),
      L("N", "joy", "jump", "Munch leaped into the air, and stretched out his arms, but landed in the duck pond, splash!"),
      L("B", "shocked", "panic", "Quack! I mean, oops! The ducks are not happy! Sorry, ducks!"),
      L("N", "joy", "bubbles", "A family of ducklings paddled around him, quacking, and one little duckling hopped on his head."),
      L("C", "joy", "talk", "Munch, you have a duckling hat! Stay there, I will keep chasing!"),
      L("A", "warm", "talk", "I will walk to the bench, and keep my eyes on the basket. You two run ahead."),
      L("N", "worried", "look", "The basket drifted higher, over the playground, over the fountain, and toward the tall clock tower."),
    ]),
    S("park", "day", "tree", "Kit has a clever idea, and the friends team up.", [
      L("C", "determined", "look", "The basket is heading to the clock tower. If it hits the roof, the balloons will pop, and the cake will fall."),
      L("A", "worried", "talk", "Oh, my cake! My poor, lovely cake! I baked it from my own grandma's recipe."),
      L("C", "determined", "talk", "I have a plan. We need a very long thing to hook the basket. Like a kite string, or a fishing pole."),
      L("B", "curious", "look", "I have a fishing pole! It is in the pond! I mean, I think I just stepped on it!"),
      L("N", "joy", "fish", "Munch reached into the pond, and pulled out an old, long, wobbly fishing pole, with a green sock hanging from the hook."),
      L("C", "joy", "highfive", "Perfect! Munch, you are a hero! Give it to me, and I will try to hook the basket."),
      L("N", "excited", "climb", "Kit climbed up a tall slide, held the pole up high, and swung it toward the basket's handle."),
      L("C", "determined", "fish", "Steady, steady. A little to the left. A little higher. And, got it!"),
    ]),
    S("park", "dusk", "star", "The twist: the basket is saved, but there is a surprise inside.", [
      L("N", "relieved", "tugwar", "The hook caught the basket's handle, and all three friends held the line, and pulled it gently down to the grass."),
      L("A", "relieved", "talk", "Oh, thank goodness. It landed safely. Not a single sandwich is squashed."),
      L("B", "joy", "dance", "We saved the picnic! I am the best fishing dinosaur in the whole world!"),
      L("N", "surprised", "look", "But as they opened the basket, a tiny, fuzzy, gray face peeked out from under the napkins."),
      L("C", "surprised", "look", "It is a little kitten! She must have crawled in to nap, and floated up with the picnic!"),
      L("N", "warm", "look", "The kitten blinked, and gave a tiny yawn, and mewed, and rubbed her face against Kit's hand."),
      L("A", "warm", "talk", "Oh, you little darling. You went on an adventure, and did not even know it."),
      L("B", "joy", "talk", "A sky kitten! She is the first cat to fly with balloons! She is a hero!"),
    ]),
    S("park", "dusk", "star", "The friends return the kitten, and everyone shares the picnic.", [
      L("N", "warm", "walk", "A little girl came running across the park, calling, Biscuit! Biscuit! Where are you?"),
      L("N", "joy", "talk", "She spotted the kitten in Kit's arms, and gasped, and her face lit up with joy."),
      L("N", "joy", "talk", "Biscuit! You are safe! I looked everywhere! Thank you, thank you, thank you!"),
      L("C", "joy", "highfive", "She is all yours. And she had a very exciting day."),
      L("A", "warm", "talk", "Would you like to join our picnic, dear? We have plenty of food, and a very big cake."),
      L("N", "joy", "party", "The little girl, the kitten and the three friends sat down on the blanket, and shared the sandwiches and strawberries."),
      L("B", "joy", "eat", "At last! Food! I will have three sandwiches, a whole bowl of strawberries and cake, please!"),
      L("A", "warm", "talk", "Good food tastes better shared. And so do good adventures."),
    ]),
    S("park", "night", "moon", "Under the stars, the friends say a happy goodnight.", [
      L("N", "warm", "walk", "As the sun set, the park glowed gold, and then pink, and then soft blue."),
      L("C", "happy", "talk", "That was the strangest picnic I ever had. A floating lunch, a duckling hat and a flying kitten."),
      L("B", "joy", "talk", "And I only fell in the pond once! That is a new record!"),
      L("A", "warm", "talk", "Every problem has a clever fix, Kit. And you found it, with a little help from your friends."),
      L("N", "joy", "photo", "The little girl took a photo of the group, with the kitten on top, and the empty basket in front."),
      L("C", "joy", "highfive", "Next Sunday, same place, same time? But this time, we tie the balloons to a tree."),
      L("A", "joy", "party", "That sounds wonderful. I will bring two cakes."),
      L("N", "warm", "talk", "And that is the story of the picnic that floated away, and the friends who brought it back. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
