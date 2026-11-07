// ─── NEW MOVIE (made automatically): The Great Explox Kite Festival — a windy park adventure with a sweet kite-maker, a goofy ghost and a determined boy.
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
  title: "The Great Explox Kite Festival", genre: "🪁 Park Adventure", price: 30, bg: "#1e4a6a", icons: "🪁🌬️🏆", comedy: true,
  cast: { A: { role: "Granny Kitty", kind: "grandma", pers: "sweet", move: "YARN YO-YO", mtype: "spin", fav: "A kite needs a little patience.", say: "I could not say no to a hungry customer. I never can." }, B: { role: "Boo the Ghost", kind: "ghost", pers: "goof", move: "SPOOKY SPIN", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, I floated through the wall again." }, C: { role: "Kai the Kid", kind: "hero", pers: "hero", move: "WIND DASH KICK", mtype: "kick", fav: "Never give up, just keep flying!", say: "I know, I should read the instructions. I never do." } },
  trailer: [{ text: "🪁 One big festival...", dur: 2200 }, { text: "🌬️ One missing wind...", dur: 2200 }, { text: "🏆 And one kite that must fly!", dur: 2400 }, { text: "THE GREAT EXPLOX KITE FESTIVAL", dur: 3000 }],
  scenes: [
    S("park", "day", "sun", "Kai and Granny Kitty build a special kite for the big festival.", [
      L("N", "warm", "walk", "It was a sunny spring morning in Explox Park, and the grass was full of colorful tents."),
      L("C", "excited", "build", "Granny Kitty, the Great Explox Kite Festival is tomorrow! Can we build a kite together?"),
      L("A", "warm", "talk", "Of course, dear Kai. A kite needs paper, sticks, string and a little patience."),
      L("N", "joy", "build", "They cut a big diamond of rainbow paper, and tied two thin sticks in a cross."),
      L("C", "joy", "write", "I will paint a big yellow sun on the front, so it shines in the sky."),
      L("A", "happy", "work", "And I will make a long tail from colorful ribbons, so it dances in the breeze."),
      L("N", "joy", "photo", "By evening, the rainbow kite was ready, with a smiling sun and a tail ten ribbons long."),
      L("C", "determined", "jump", "It is perfect! Tomorrow, it will fly higher than any kite in Explox!"),
    ]),
    S("park", "day", "tree", "On festival day, the sky is full of kites, but something is wrong.", [
      L("N", "excited", "party", "The next day, hundreds of people gathered in the park, holding kites of every shape and color."),
      L("N", "joy", "fly", "There were dragon kites, fish kites, butterfly kites and even a kite shaped like a giant pizza."),
      L("C", "excited", "run", "Come on, Granny! Let us launch our rainbow kite right now!"),
      L("N", "worried", "look", "Kai ran across the field with the kite held high, but the kite just flopped to the ground."),
      L("C", "worried", "look", "That is strange. It will not lift. There is no wind at all today."),
      L("A", "worried", "talk", "Oh dear. Not a single leaf is moving. A kite cannot fly without wind."),
      L("N", "worried", "look", "All across the park, kites drooped, and children frowned, and the festival grew very quiet."),
      L("C", "sad", "talk", "Everyone worked so hard. We cannot let the festival end like this."),
    ]),
    S("park", "day", "tree", "A ghost named Boo appears and offers to help in a silly way.", [
      L("N", "curious", "look", "Suddenly, a cool breeze swirled around Kai's feet, and a small, friendly ghost floated out from behind a tree."),
      L("B", "joy", "talk", "Hello! I am Boo the Ghost! I heard somebody needs wind! I am an expert at blowing!"),
      L("C", "surprised", "look", "A ghost? In the park? During the day? Nice to meet you, Boo."),
      L("B", "joy", "dance", "I float around all day, whooo, whooo! My whooo makes a very good wind!"),
      L("A", "curious", "talk", "Young ghost, would you be so kind as to blow on our kite?"),
      L("B", "excited", "talk", "Sure! Stand back, everyone! Here comes the biggest whoooosh of my ghostly life!"),
      L("N", "excited", "magic", "Boo took a great big breath, puffed out his cheeks, and blew with all his might."),
      L("B", "shocked", "panic", "Whooo... whooo... oh no, my nose is tickling... achoooo!"),
    ]),
    S("park", "day", "tree", "Boo's sneeze creates a funny, wild wind.", [
      L("N", "shocked", "look", "Boo's sneeze was so big that a giant gust of wind whooshed across the entire park."),
      L("N", "joy", "fly", "Hats flew off, balloons zoomed up, and a picnic blanket sailed away like a magic carpet."),
      L("C", "joy", "jump", "Whoa! That is a lot of wind! Quick, launch the kite!"),
      L("N", "excited", "run", "Kai raced across the field, the rainbow kite caught the wind, and up, up, up it went."),
      L("A", "joy", "dance", "It is flying! Look at it go! Our rainbow kite is dancing in the sky!"),
      L("B", "joy", "dance", "I did it! I made a ghost wind! Nobody has ever been so proud of a sneeze!"),
      L("N", "joy", "party", "All around the park, other kites began to rise, and the sky filled with color."),
      L("C", "joy", "highfive", "Thanks, Boo! You are the best wind in the whole world!"),
    ]),
    S("park", "day", "sun", "Trouble: the wind gets too strong, and the kite string snaps.", [
      L("N", "worried", "look", "But the wind kept getting stronger, and stronger, and the kites began to tug hard on their strings."),
      L("C", "worried", "tugwar", "Whoa! The kite is pulling too hard! I cannot hold on much longer!"),
      L("A", "worried", "talk", "Boo, I think that is enough wind now, dear!"),
      L("B", "scared", "panic", "I cannot stop! The sneeze is still going! Whoooo, whoooo, whoooo!"),
      L("N", "shocked", "look", "Then, snap! Kai's kite string broke, and the rainbow kite sailed up into the sky, farther and farther away."),
      L("C", "sad", "look", "No! Our rainbow kite! It is flying away over the trees!"),
      L("A", "worried", "talk", "Oh, my dear Kai. All that hard work. Let us see where it lands."),
      L("B", "sad", "talk", "I am so sorry, Kai. My sneeze was too big. I will help you get it back, I promise."),
    ]),
    S("nature", "day", "tree", "Kai and Boo go on a quick chase to find the kite.", [
      L("N", "determined", "run", "Kai and Boo raced after the kite, across the meadow and toward the tall pine trees."),
      L("C", "determined", "run", "Keep your eyes on it, Boo! Never give up, just keep flying!"),
      L("B", "joy", "fly", "I can fly too! Whee! I will go up high and see where it lands!"),
      L("N", "excited", "fly", "Boo zoomed up above the trees, and looked all around."),
      L("B", "excited", "talk", "I see it! It is stuck on a branch of the biggest tree in the forest! Follow me!"),
      L("N", "curious", "climb", "Kai climbed the big old tree, branch after branch, until he reached the rainbow kite."),
      L("C", "relieved", "talk", "Got it! It is a little bit scratched, but it is still in one piece!"),
      L("B", "joy", "dance", "Hooray! The kite is saved! And I only made two small mistakes today!"),
    ]),
    S("park", "dusk", "trophy", "Back at the festival, a surprise prize is waiting.", [
      L("N", "warm", "walk", "By evening, Kai and Boo returned to the park, with the rainbow kite tied to a new piece of string."),
      L("A", "relieved", "talk", "You found it! Oh, my dears, I was so worried."),
      L("N", "excited", "talk", "Just then, the festival judge announced the winners over the loudspeaker."),
      L("N", "joy", "talk", "The prize for the most beautiful kite goes to the rainbow kite, with the smiling yellow sun!"),
      L("C", "shocked", "look", "Us? We won? Even with a scratch?"),
      L("A", "joy", "dance", "Of course, dear! Every kite that flies has a story. And yours has the best one."),
      L("B", "joy", "party", "And the prize for the funniest wind goes to a very surprised ghost! That is me!"),
      L("N", "joy", "party", "The whole crowd cheered, and gave Boo a big, round, shiny medal."),
    ]),
    S("park", "night", "moon", "At night, the friends fly one last kite together under the stars.", [
      L("N", "warm", "walk", "After the festival, the park was quiet, and the stars came out one by one."),
      L("C", "happy", "talk", "One last flight, Granny Kitty? Under the stars?"),
      L("A", "warm", "talk", "A kite needs a little patience, and a lot of friends. Let us do it."),
      L("N", "joy", "fly", "Boo blew a gentle, soft breeze this time, and the rainbow kite rose slowly into the night sky."),
      L("B", "joy", "talk", "Look at that! A kite among the stars! It is the prettiest thing I have ever seen."),
      L("C", "relieved", "photo", "Everybody, smile! A photo of the best kite team in Explox!"),
      L("A", "warm", "talk", "Never give up, dear Kai. Just keep flying."),
      L("N", "warm", "talk", "And that is the story of the great Explox kite festival, and the ghost who sneezed up a wind. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
