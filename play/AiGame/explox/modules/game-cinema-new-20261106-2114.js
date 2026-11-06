// ─── NEW MOVIE (made automatically): The Great Treehouse Build-Off — a building contest comedy with a young builder, a clumsy dinosaur and a wise wizard.
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
  title: "The Great Treehouse Build-Off", genre: "🌳 Building Comedy", price: 30, bg: "#1f3a1f", icons: "🌳🔨🏠", comedy: true,
  cast: { A: { role: "Builder Bea", kind: "pioneer", pers: "hero", move: "LASSO SPIN", mtype: "spin", fav: "Measure twice, build once!", say: "I know, I should read the plans. I never do." }, B: { role: "Hammer the Dino", kind: "dino", pers: "goof", move: "TAIL WHIP", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, my tail knocked over the ladder again." }, C: { role: "Professor Pine", kind: "wizard", pers: "wise", move: "SPARKLE BLAST KICK", mtype: "kick", fav: "Think first, hammer later.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "🌳 One very big tree...", dur: 2200 }, { text: "🔨 Two teams, one contest...", dur: 2200 }, { text: "⛈️ And a storm on the way!", dur: 2400 }, { text: "THE GREAT TREEHOUSE BUILD-OFF", dur: 3000 }],
  scenes: [
    S("park", "day", "tree", "At Explox Park, the annual treehouse contest begins, and the biggest oak tree is waiting.", [
      L("N", "excited", "party", "It was a bright Saturday morning at Explox Park, and the whole town gathered around the biggest oak tree."),
      L("C", "joy", "talk", "Welcome, builders! Today, two teams will compete to build the best treehouse in just one day!"),
      L("A", "excited", "look", "Look at that tree, Hammer! It is as tall as a tower, with big, strong branches."),
      L("B", "joy", "eat", "I brought a hundred nails, a hundred planks and two hundred sandwiches. It is a good plan."),
      L("A", "warm", "talk", "Hammer, the sandwiches are for lunch. The planks are for the treehouse."),
      L("N", "serious", "look", "On the other side of the tree, a rival team of three robots was already unrolling blueprints."),
      L("C", "serious", "write", "The robot team has a very detailed plan. But a good builder also needs heart."),
      L("A", "determined", "highfive", "Let us show them what Explox can build. Ready, Hammer? Ready, Professor?"),
    ]),
    S("park", "day", "tree", "The teams start building, and the dinosaur causes a very funny problem.", [
      L("N", "excited", "build", "The whistle blew, and both teams rushed to start building."),
      L("A", "determined", "build", "Hammer, hold this plank. Professor, pass me the nails. I will start with the floor."),
      L("B", "joy", "build", "Holding the plank! Holding it tight! Oh, my tail is swinging."),
      L("N", "shocked", "panic", "Hammer's long tail swung around and knocked over a whole stack of planks, which fell down with a loud clatter."),
      L("B", "worried", "talk", "Oops. Sorry, Bea. My tail has a mind of its own."),
      L("A", "relieved", "talk", "It is all right, Hammer. We can pick them up. Nobody is hurt, and nothing is broken."),
      L("C", "wise", "work", "A good builder keeps calm. And a good dinosaur keeps his tail on the ground."),
      L("B", "joy", "exercise", "I will sit on my tail. Look, it is perfectly still. I am a tail-sitting dinosaur."),
    ]),
    S("park", "day", "tree", "The treehouse starts to take shape, with a few clever ideas.", [
      L("A", "excited", "climb", "I will climb up and fix the floor to the big branch. Hammer, give me the rope."),
      L("B", "happy", "tugwar", "Here is the rope! I will pull it up with my teeth, which are very strong."),
      L("C", "excited", "magic", "And I will use a tiny bit of magic to make the planks light as feathers."),
      L("N", "joy", "magic", "Sparkle, sparkle! The heavy planks floated up into the tree, one by one, and settled into place."),
      L("A", "joy", "build", "A floor, four walls and a roof. We are making great progress, team!"),
      L("B", "joy", "build", "I am building a slide! A big, long slide, shaped like a dinosaur tail."),
      L("C", "curious", "look", "That is a wonderful idea, Hammer. But keep an eye on the sky."),
      L("N", "worried", "look", "Far away, gray clouds were beginning to gather over the hills."),
    ]),
    S("park", "dusk", "bolt", "The storm arrives, and the rival team has a big problem.", [
      L("N", "worried", "look", "By late afternoon, the clouds were dark, and the wind began to blow through the park."),
      L("C", "worried", "look", "A storm is coming, builders. Everybody, check that your treehouse is tied down."),
      L("A", "worried", "work", "Hammer, tighten the ropes! Professor, check the roof! I will bolt the walls."),
      L("N", "shocked", "panic", "Across the tree, the robot team's treehouse began to wobble in the wind."),
      L("N", "scared", "panic", "A strong gust tore the roof right off, and the three robots lost their balance and tumbled down."),
      L("A", "shocked", "look", "The robots! They are stuck on a branch! They are going to fall!"),
      L("B", "shocked", "run", "We must help them! Bea, Professor, come on!"),
      L("C", "determined", "run", "A contest is a contest. But a friend in trouble is more important than any trophy."),
    ]),
    S("park", "dusk", "bolt", "The Explox team rescues the robots, and a surprising friendship begins.", [
      L("A", "determined", "climb", "Hold on, robots! I am coming up the tree with a rope!"),
      L("N", "excited", "tugwar", "Bea tied the rope around the branch, and Hammer pulled with all his might."),
      L("B", "determined", "tugwar", "Heave! Ho! Heave! I am pulling with my whole body, and my tail!"),
      L("N", "relieved", "climb", "One by one, the three robots slid down the rope and landed safely in the dinosaur's big, green arms."),
      L("C", "relieved", "talk", "Everybody is safe. That was a very close call."),
      L("N", "warm", "talk", "The leader of the robots, a tall one with square glasses, bowed his head in thanks."),
      L("N", "warm", "talk", "Thank you. We were only focused on winning. You were focused on friends. That is better."),
      L("A", "warm", "talk", "Let us build together, all six of us. Two teams, one treehouse."),
    ]),
    S("park", "night", "lantern", "Under the stormy sky, the two teams work side by side.", [
      L("N", "determined", "build", "As the rain began to fall, the six builders worked together under the big oak tree."),
      L("A", "determined", "build", "The robots can do the measuring. Hammer, you do the heavy lifting. Professor, the magic."),
      L("N", "excited", "work", "The robots measured every plank perfectly, and the dinosaur carried the heavy beams with ease."),
      L("C", "excited", "magic", "A little waterproof spell on the roof, and not a drop will get inside."),
      L("N", "joy", "build", "Piece by piece, the new, bigger treehouse took shape, with room for all six builders and a slide."),
      L("B", "joy", "dance", "And I will add a slide, with a big dinosaur tail shape. It is the best part."),
      L("N", "relieved", "bubbles", "By midnight, the storm passed, and a little glow of lanterns shone in the dripping leaves."),
      L("A", "joy", "highfive", "We did it, everybody! The best treehouse in Explox, built by six friends."),
    ]),
    S("park", "dawn", "sun", "At sunrise, the judges arrive and make a decision.", [
      L("N", "warm", "walk", "The next morning, the sun came up over the park, and the whole town came to see the treehouse."),
      L("C", "joy", "talk", "Judges, here is the finished treehouse. It was built by two teams, working as one."),
      L("N", "surprised", "look", "The judges looked up at the treehouse, and then at each other, and then at the six happy builders."),
      L("N", "serious", "talk", "This is not what we expected. It was supposed to be a contest, with one winner."),
      L("N", "joy", "party", "But it is the best treehouse we have ever seen, and it was built with the best teamwork. All six of you win!"),
      L("A", "joy", "dance", "We all win! Nobody loses when we build together!"),
      L("B", "joy", "eat", "And now, a sandwich for everybody. I saved two hundred of them."),
      L("N", "warm", "photo", "The six friends posed for a group photo on the slide, with the sun sparkling through the leaves."),
    ]),
    S("park", "day", "sun", "A week later, the treehouse becomes the town's favorite place.", [
      L("N", "joy", "walk", "A week later, the new treehouse was the happiest place in Explox Park."),
      L("N", "joy", "play", "Children climbed the ladder, slid down the dinosaur-tail slide and played hide and seek in the leaves."),
      L("C", "warm", "talk", "Think first, hammer later, and share everything with your friends."),
      L("A", "warm", "talk", "I learned that a treehouse is not only wood and nails. It is everyone who helped build it."),
      L("B", "joy", "dance", "And I learned how to keep my tail still. Mostly. For a few minutes at a time."),
      L("N", "warm", "party", "And that is how two teams built one treehouse, and found friends along the way. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
