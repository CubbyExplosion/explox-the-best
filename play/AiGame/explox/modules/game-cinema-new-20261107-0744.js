// ─── NEW MOVIE (made automatically): The Bakery That Was Not Haunted — a cozy mystery comedy with a kind baker, a shy ghost and a clever detective.
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
  title: "The Bakery That Was Not Haunted", genre: "🧁 Cozy Mystery Comedy", price: 30, bg: "#3a2a1a", icons: "🧁👻🔍", comedy: true,
  cast: { A: { role: "Baker Barb", kind: "grandma", pers: "sweet", move: "ROLLING PIN SMASH", mtype: "punch", fav: "Warm bread fixes everything!", say: "I could not say no to a hungry customer. I never can." }, B: { role: "Spooky the Ghost", kind: "ghost", pers: "nervous", move: "SPOOKY SPIN", mtype: "spin", fav: "I have a very good bad feeling.", say: "I get shy when too many people look at me." }, C: { role: "Detective Dot", kind: "detective", pers: "hero", move: "MAGNIFYING FLASH", mtype: "kick", fav: "Every crumb is a clue!", say: "I know, I should sleep more. The cases never stop." } },
  trailer: [{ text: "🧁 One cozy bakery...", dur: 2200 }, { text: "👻 One spooky noise at night...", dur: 2200 }, { text: "🔍 And one very surprising baker!", dur: 2400 }, { text: "THE BAKERY THAT WAS NOT HAUNTED", dur: 3000 }],
  scenes: [
    S("market", "dawn", "pizza", "At sunrise, Baker Barb opens her little bakery, but something strange has happened overnight.", [
      L("N", "warm", "walk", "It was early morning at Barb's Bakery, and the street smelled of warm bread and cinnamon."),
      L("A", "happy", "cook", "Good morning, little bakery. Time to bake the first batch of cinnamon rolls for the whole town."),
      L("N", "surprised", "look", "But when she opened the big oven, the rolls were already baked, golden and perfect, and still warm."),
      L("A", "shocked", "look", "Goodness gracious! I did not bake these. Who baked my cinnamon rolls?"),
      L("N", "curious", "look", "On the counter, the flour jar was open, and a tiny trail of white footprints led toward the pantry."),
      L("A", "worried", "talk", "Footprints? They look very small, and very floaty. My bakery must be haunted!"),
      L("N", "worried", "panic", "Barb grabbed her rolling pin, and quickly called the best detective in Explox."),
      L("A", "determined", "talk", "Detective Dot, please come quickly. Something spooky is baking in my bakery!"),
    ]),
    S("market", "day", "book", "Detective Dot arrives and starts to investigate the strange clues.", [
      L("C", "determined", "walk", "Do not worry, Barb. Detective Dot is on the case. Every crumb is a clue."),
      L("C", "curious", "write", "Let me see. Warm rolls, open flour jar and tiny footprints. Very interesting."),
      L("A", "worried", "talk", "Do you think it is a ghost? A ghost who wants cinnamon rolls?"),
      L("C", "curious", "look", "I think it is somebody who loves baking. A ghost does not usually bake this neatly."),
      L("C", "surprised", "look", "Look at this. The edges of the rolls are perfectly even, and the icing is swirled just right."),
      L("A", "surprised", "look", "That is even better than my own icing! Who could do that?"),
      L("C", "determined", "write", "We will stay tonight, and watch the bakery. I will sit behind the flour sacks."),
      L("A", "warm", "talk", "And I will sit by the window with a big blanket. And some tea, and a snack."),
    ]),
    S("market", "night", "lantern", "That night, the two friends wait quietly in the dark bakery.", [
      L("N", "serious", "sneak", "At midnight, the bakery was dark and quiet, except for the soft ticking of the old clock."),
      L("C", "serious", "sneak", "Shh. Stay very still. Whoever it is, they will come soon."),
      L("A", "worried", "sneak", "I am holding my rolling pin. I am not scared. Well, a tiny bit."),
      L("N", "curious", "look", "Suddenly, a soft whoosh floated through the wall, and the flour jar slowly lifted itself into the air."),
      L("A", "shocked", "look", "The flour is flying! By itself! Detective Dot, did you see that?"),
      L("C", "shocked", "look", "I see it. And look, there is a soft white glow behind the jar."),
      L("N", "surprised", "look", "From behind the glowing flour jar, a small, round, shy ghost peeked out, with a tiny chef's hat on his head."),
      L("B", "scared", "panic", "Oh no. They saw me! I am so sorry! Please do not be scared!"),
    ]),
    S("market", "night", "lantern", "The ghost introduces himself, and explains why he bakes at night.", [
      L("A", "surprised", "talk", "A ghost with a chef's hat? What is your name, dear? And why are you baking in my kitchen?"),
      L("B", "worried", "talk", "My name is Spooky. I used to be a baker, a very long time ago, when this bakery was brand new."),
      L("B", "sad", "talk", "I miss baking so much. Ghosts cannot bake in the daytime, because people get scared."),
      L("C", "curious", "talk", "So you came at night, when nobody was looking, and baked the rolls as a gift?"),
      L("B", "sad", "talk", "I wanted to help. I thought if the rolls were baked, you would have a nice, easy morning."),
      L("A", "warm", "talk", "Oh, you sweet thing. You have been helping me, and I was afraid of you!"),
      L("B", "worried", "talk", "I am a very shy ghost. I get nervous when too many people look at me."),
      L("C", "warm", "talk", "Nobody is scared of you, Spooky. We think you are wonderful."),
    ]),
    S("market", "dawn", "sun", "Barb has a lovely idea about how to make Spooky feel at home.", [
      L("A", "excited", "talk", "I have an idea! Spooky, would you like to be my official night baker?"),
      L("B", "shocked", "look", "Your night baker? Me? A ghost? Really?"),
      L("A", "joy", "cook", "Of course! You bake so beautifully. And at night, nobody will be afraid, and we can bake together."),
      L("B", "joy", "dance", "I would love that! I have so many old recipes. Pumpkin bread, cloud cake and moonlight cookies."),
      L("C", "joy", "eat", "Moonlight cookies? That sounds like the best clue I have ever eaten."),
      L("A", "warm", "talk", "Then it is settled. We will open the bakery at midnight, for one special night, just for the ghosts."),
      L("B", "relieved", "talk", "A bakery party for ghosts? I never thought anyone would do that for me."),
      L("A", "joy", "highfive", "Think of it as a thank-you for the lovely cinnamon rolls."),
    ]),
    S("market", "night", "lantern", "The bakery holds a midnight party, with a surprising number of guests.", [
      L("N", "joy", "party", "That night, the bakery was decorated with lanterns, ribbons and little paper moons."),
      L("N", "surprised", "look", "At midnight, the walls began to glow, and a hundred friendly ghosts floated into the bakery."),
      L("B", "joy", "dance", "My old friends! Everybody, welcome! Come in, come in, and try my cloud cake!"),
      L("N", "joy", "cook", "Spooky and Barb baked together, side by side, and the bakery filled with the smell of warm sugar."),
      L("C", "joy", "eat", "This moonlight cookie is the most delicious clue of my whole career."),
      L("N", "joy", "dance", "The ghosts floated and danced around the bakery, and the lanterns twinkled like stars."),
      L("A", "joy", "sing", "Warm bread, soft moon, ghosts and friends, a happy night that never ends!"),
      L("B", "joy", "party", "I have never been this happy. Thank you, Barb. Thank you, Dot. Thank you, everyone!"),
    ]),
    S("market", "dawn", "sun", "The next morning, the town discovers the best bakery in Explox.", [
      L("N", "warm", "walk", "The next morning, the whole town lined up outside Barb's Bakery, because the smell was heavenly."),
      L("N", "joy", "eat", "Every roll, every loaf and every cookie was fresh, golden and perfectly baked."),
      L("C", "happy", "write", "Case closed. The mystery of the haunted bakery is solved. It was not haunted. It was loved."),
      L("A", "warm", "talk", "And the best baker in Explox is not me. It is a shy little ghost with a chef's hat."),
      L("B", "joy", "photo", "Everybody, smile! A photo of the happiest bakery team in town!"),
      L("A", "joy", "highfive", "Warm bread fixes everything. And so does a good friend."),
      L("N", "warm", "talk", "And that is how a bakery that everyone thought was haunted became the happiest place in Explox. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
