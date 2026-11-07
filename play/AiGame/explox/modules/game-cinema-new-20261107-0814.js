// ─── NEW MOVIE (made automatically): The Snow Day Rescue Patrol — a winter rescue adventure with a young ranger, a goofy dinosaur and a wise wizard.
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
  title: "The Snow Day Rescue Patrol", genre: "❄️ Winter Rescue", price: 30, bg: "#173050", icons: "❄️🛷🚑", comedy: true,
  cast: { A: { role: "Ranger Remy", kind: "pioneer", pers: "hero", move: "LASSO SPIN", mtype: "spin", fav: "Stay warm, stay brave!", say: "I know, I should check the weather. I never do." }, B: { role: "Snowball the Dino", kind: "dino", pers: "goof", move: "TAIL WHIP", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, I sneezed and made a snowstorm." }, C: { role: "Sister Frost", kind: "wizard", pers: "wise", move: "SPARKLE BLAST KICK", mtype: "kick", fav: "Think first, slide later.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "❄️ One big snow day...", dur: 2200 }, { text: "🛷 One lost sled team...", dur: 2200 }, { text: "🚑 And one brave rescue patrol!", dur: 2400 }, { text: "THE SNOW DAY RESCUE PATROL", dur: 3000 }],
  scenes: [
    S("snow", "dawn", "sun", "On the first snow day of winter, the Rescue Patrol wakes up to a big white world.", [
      L("N", "joy", "walk", "It snowed all night, and Explox woke up to a thick, fluffy white blanket, from the rooftops to the roads."),
      L("A", "excited", "snowball", "Snow day! Snow day! Look at all that snow, team! The whole town is closed!"),
      L("B", "joy", "snowball", "I am going to make the biggest snowball in the world! Look at me roll!"),
      L("C", "warm", "talk", "Be careful, Snowball. Snow is fun, but it can also be tricky, especially on the hills."),
      L("N", "curious", "look", "Just then, the radio on the Rescue Patrol's sled began to crackle."),
      L("N", "worried", "talk", "Attention, Patrol. Seven children on a sled outing are overdue, and the snow is getting thick."),
      L("A", "serious", "talk", "Seven children, lost in the snow? That is a job for the Snow Day Rescue Patrol."),
      L("C", "determined", "highfive", "Pack the blankets, the lanterns and the cocoa. We are going out there, right now."),
    ]),
    S("snow", "day", "tree", "The patrol sets out across the snowy hills, and the weather grows worse.", [
      L("N", "excited", "skate", "The big red rescue sled zipped across the snowy hills, with the three friends holding on tight."),
      L("A", "determined", "skate", "Hold on, team! The last place they were seen was near the Frozen Pond!"),
      L("B", "joy", "skate", "Wheee! This is the fastest sled ride of my life! Look, no hands! Oh, wait, my hands are on the rope."),
      L("N", "worried", "look", "But the snow began to fall harder, in big, swirling flakes, and the world turned white."),
      L("C", "worried", "look", "I can barely see the hills. The wind is picking up. We must stay close together."),
      L("A", "serious", "talk", "Everybody, hold the rope tight. We tie ourselves in a line, so nobody gets lost."),
      L("B", "worried", "talk", "In a line? Like a dinosaur train? Choo choo?"),
      L("A", "warm", "talk", "Yes, Snowball. Like a very careful dinosaur train."),
    ]),
    S("snow", "day", "tree", "At the Frozen Pond, the patrol finds the first clue.", [
      L("N", "curious", "walk", "The three friends walked slowly through the snow, with the rope tied around their waists."),
      L("C", "curious", "look", "Look at the snow, over there. Seven pairs of small footprints, leading toward the old pine trees."),
      L("B", "joy", "look", "Footprints! We are following footprints! I am a super snow detective!"),
      L("A", "determined", "look", "Good eyes, Sister Frost. They are still fresh. The children cannot be far."),
      L("N", "surprised", "look", "At the edge of the pond, a bright red scarf was fluttering in the wind, tied to a branch."),
      L("A", "relieved", "look", "A red scarf! The children left it on purpose, so that somebody could find them."),
      L("C", "warm", "talk", "Clever children. They are staying together, and leaving clues. That is exactly what to do."),
      L("B", "determined", "run", "Follow the scarf! It points toward the big pine trees!"),
    ]),
    S("snow", "day", "tree", "A problem appears: a deep snow drift blocks the path.", [
      L("N", "shocked", "look", "Suddenly, a giant snow drift, as tall as a house, blocked the narrow path through the pine trees."),
      L("A", "worried", "look", "We cannot go around. The trees are too thick. And we cannot go over, it is too tall."),
      L("B", "curious", "talk", "Can we go through it? Like a tunnel? I am great at digging!"),
      L("C", "determined", "talk", "A tunnel is a good idea, Snowball. But a careful one. We must keep the roof strong."),
      L("N", "excited", "dig", "Snowball began to dig with his big, strong claws, and snow flew everywhere like fluffy white confetti."),
      L("B", "joy", "dig", "Dig, dig, dig! I am a snow-digging dinosaur! Look at me go!"),
      L("C", "determined", "magic", "And I will use a little frost magic to freeze the walls, so that the tunnel does not collapse."),
      L("N", "relieved", "magic", "Sparkle, sparkle! The tunnel walls turned to glittering ice, strong as stone."),
    ]),
    S("snow", "dusk", "lantern", "On the other side of the tunnel, the patrol finds the lost children.", [
      L("N", "joy", "walk", "The three friends crawled through the icy tunnel, and came out on the other side."),
      L("N", "joy", "look", "There, under the biggest pine tree, seven little children sat in a circle, wrapped in blankets."),
      L("A", "relieved", "talk", "Hello, everyone! We are the Rescue Patrol. Is everybody all right?"),
      L("N", "warm", "talk", "The smallest child, a girl with a red hat, smiled. We built a snow fort, and we told stories to stay warm."),
      L("B", "joy", "dance", "A snow fort! It is the best fort I have ever seen! Can I live in it?"),
      L("C", "warm", "talk", "You did everything right, children. You stayed together, and you left clues. That is very smart."),
      L("A", "warm", "talk", "Let us give everybody some hot cocoa. And some warm blankets, from the sled."),
      L("N", "joy", "eat", "The children cheered, and they drank warm cocoa, while the lanterns glowed in the falling snow."),
    ]),
    S("snow", "dusk", "bolt", "But the way home has a final problem: the sled is stuck.", [
      L("N", "worried", "look", "As the group got ready to leave, the wind howled, and the rescue sled slid down the hill, and stopped in a deep, soft drift."),
      L("A", "worried", "look", "The sled is stuck! And it is far too heavy to carry all eight of us, and the children."),
      L("B", "worried", "talk", "What do we do now? I cannot carry everybody on my back. Or can I? Maybe I can."),
      L("C", "determined", "talk", "Let us work together. A rope, a pull and a push. Everybody has a job."),
      L("N", "excited", "tugwar", "The seven children grabbed the rope, and Snowball grabbed the front, and Remy and Sister Frost pushed from behind."),
      L("A", "determined", "tugwar", "One, two, three, pull! One, two, three, pull! We can do this, team!"),
      L("B", "determined", "tugwar", "Heave! Ho! I am a pulling dinosaur! I can pull a whole mountain!"),
      L("N", "joy", "party", "With a loud whoosh, the sled popped out of the drift, and everybody tumbled into the snow, laughing."),
    ]),
    S("snow", "night", "moon", "The patrol and the children slide home under the stars.", [
      L("N", "joy", "skate", "The big red sled glided down the hill in the moonlight, with seven happy children and three tired heroes."),
      L("A", "joy", "skate", "Everybody hold on! Next stop, the Explox Town Square!"),
      L("N", "joy", "snowball", "The children threw soft snowballs at each other, and giggled all the way down the slope."),
      L("B", "joy", "snowball", "Snowball fight on a sled! This is the best day of my life!"),
      L("C", "warm", "talk", "Look at the stars, everyone. The storm is gone, and the sky is full of little lights."),
      L("N", "warm", "look", "In the Town Square, hundreds of worried parents were waiting, holding warm lanterns."),
      L("N", "joy", "party", "When the sled arrived, the whole square burst into cheers, and the children ran into their parents' arms."),
      L("A", "relieved", "highfive", "Mission accomplished, Patrol. Every single child is safe and sound."),
    ]),
    S("house", "night", "lantern", "At the Patrol headquarters, the friends celebrate with a cozy party.", [
      L("N", "warm", "walk", "Back at the Patrol headquarters, a warm fire crackled, and a big pot of soup was bubbling on the stove."),
      L("C", "warm", "cook", "I made a big pot of vegetable soup, for everybody. And marshmallows for the cocoa."),
      L("B", "joy", "eat", "Marshmallows! I love the marshmallows! I will take eleven, please."),
      L("A", "warm", "talk", "Thank you both for today. Stay warm, stay brave, and always look after each other."),
      L("N", "joy", "party", "The mayor stopped by, and gave the three heroes a shiny snowflake badge, with their names on it."),
      L("B", "joy", "dance", "A badge! A real badge! I will never take it off, not even in the bath."),
      L("C", "warm", "talk", "Think first, slide later. And always be kind in the snow."),
      L("N", "warm", "talk", "And that is how the Snow Day Rescue Patrol brought seven children safely home. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
