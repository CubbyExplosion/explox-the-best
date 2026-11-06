// ─── NEW MOVIE (made automatically): The Great Skate Showdown — a sports comedy with a speedy racer, a shy robot and a proud champion.
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
  title: "The Great Skate Showdown", genre: "🛹 Sports Comedy", price: 30, bg: "#16324a", icons: "🛹🏆🤖", comedy: true,
  cast: { A: { role: "Zippy Zed", kind: "racer", pers: "hero", move: "TURBO DRIFT KICK", mtype: "kick", fav: "Wheels up, everybody!", say: "I know, I should slow down. I just cannot help it." }, B: { role: "Bolt the Robot", kind: "robot", pers: "nervous", move: "LASER PUNCH", mtype: "punch", fav: "I have a very bad good feeling.", say: "My knees will not stop shaking. They are springs." }, C: { role: "Champion Chuck", kind: "athlete", pers: "rival", move: "SLAM DUNK PUNCH", mtype: "jumpkick", fav: "I won nine times. Nine!", say: "Fine, I get nervous before every show. Even a champion does." } },
  trailer: [{ text: "🛹 One new skate park...", dur: 2200 }, { text: "🏆 One shiny trophy...", dur: 2200 }, { text: "🤖 And one robot with wobbly knees!", dur: 2400 }, { text: "THE GREAT SKATE SHOWDOWN", dur: 3000 }],
  scenes: [
    S("park", "day", "trophy", "At Explox Park, the new skate park opens, and a big poster announces the Great Skate Showdown.", [
      L("N", "excited", "party", "Balloons, music and a brand-new skate park. The whole town came to see it open."),
      L("A", "excited", "look", "Bolt, look at that poster! A skate contest, and the winner gets the gold trophy!"),
      L("B", "worried", "look", "Zippy, I only just learned to skate last week. I fell down fourteen times."),
      L("A", "warm", "talk", "Fourteen times is great practice, Bolt. Come on, let us enter together!"),
      L("B", "scared", "panic", "In front of the whole town? My knees will not stop shaking. They are springs!"),
      L("C", "serious", "talk", "Ha! Champion Chuck has won this contest nine times. Nine!"),
      L("A", "determined", "talk", "Then the tenth win will be a tough one, Chuck. May the best skater win."),
      L("C", "angry", "talk", "Do not worry, little robot. Stay home and save your bolts."),
    ]),
    S("park", "day", "tree", "Zippy decides to train Bolt, and the first lesson is a funny one.", [
      L("A", "happy", "exercise", "Lesson one: warm up. Stretch your arms, stretch your legs, and wiggle your knees."),
      L("B", "worried", "exercise", "My knees are already wiggling. Does that count?"),
      L("A", "joy", "skate", "Lesson two: stand on the board, bend a little, and push. Watch me!"),
      L("B", "surprised", "skate", "Whoa, you glide like a swan. A very fast swan."),
      L("B", "scared", "skate", "My turn. Oh no, oh no, I am rolling backward! Zippy, help!"),
      L("A", "worried", "run", "Hold on, Bolt! I am coming! Put your arms out like wings!"),
      L("B", "shocked", "fly", "Wheee! I am flying! No, wait, I am falling! Ouch."),
      L("A", "joy", "highfive", "That was your first real trick, Bolt. A very big bounce!"),
    ]),
    S("city", "day", "car", "In the busy city, the friends practice on the street ramps, and trouble rolls in.", [
      L("N", "curious", "skate", "All week, Zippy and Bolt practiced on every ramp in Explox."),
      L("B", "happy", "jump", "Look, Zippy! I can jump the little curb. One, two, boing!"),
      L("A", "excited", "jump", "Great jump! Now try the big one, the stairs by the library."),
      L("B", "scared", "panic", "Stairs? Real stairs? With steps? Many, many steps?"),
      L("A", "warm", "talk", "Only five steps, Bolt. And I will be right behind you."),
      L("N", "serious", "sneak", "Behind a fence, Champion Chuck watched them and frowned."),
      L("C", "angry", "sneak", "A robot who wants to win my trophy? I will fix that. A little oil on the ramp should do it."),
      L("N", "worried", "sneak", "And with a sneaky smile, the champion spread slippery oil all over the practice ramp."),
    ]),
    S("city", "dusk", "lantern", "The next day, the oily ramp causes a huge, silly slip.", [
      L("A", "curious", "look", "Bolt, the ramp looks shiny. Is it wet?"),
      L("B", "worried", "skate", "I do not know. I will test it. Rolling, rolling, oh no, slipping, slipping!"),
      L("N", "shocked", "panic", "Bolt shot down the ramp like a rocket and landed in a big pile of balloons."),
      L("B", "shocked", "panic", "Zippy! I have a balloon on my head! And a balloon on my foot!"),
      L("A", "worried", "run", "Are you hurt? Say something, Bolt!"),
      L("B", "surprised", "look", "I am fine. But this ramp is slippery with oil. Someone put oil on it."),
      L("A", "serious", "look", "Oil? That is not an accident. Somebody wants us to fall."),
      L("B", "curious", "look", "Look at those footprints. Big, fancy shoes. Shiny ones."),
    ]),
    S("arena", "day", "trophy", "On the day of the contest, the arena is full of cheering fans.", [
      L("N", "excited", "party", "The big day arrived. The arena was packed, the drums were rolling and the crowd was loud."),
      L("A", "excited", "drum", "Listen to the band, Bolt! It makes my wheels spin!"),
      L("B", "scared", "panic", "There are so many people. I think I will faint. Robots can faint, right?"),
      L("A", "warm", "talk", "Take a deep breath, Bolt. You are ready. You jumped five steps. Remember?"),
      L("C", "serious", "photo", "Photographers, over here! Take a picture of the future winner! Of me!"),
      L("A", "determined", "talk", "Chuck, we found the oil on the ramp. We know about the shiny shoes."),
      L("C", "shocked", "panic", "What? Oil? Shoes? I do not know what you are talking about."),
      L("N", "curious", "look", "But everybody saw it. Chuck's shiny shoes had a little oil on the toe."),
    ]),
    S("arena", "day", "trophy", "Before the contest starts, Chuck finally tells the truth.", [
      L("C", "sad", "talk", "Fine. It was me. I put the oil on the ramp."),
      L("A", "surprised", "talk", "Why, Chuck? You are the champion. You win everything."),
      L("C", "sad", "talk", "I get nervous before every show, Zippy. Even a champion does. And now there was a new robot who might win."),
      L("B", "warm", "talk", "I get nervous too, Chuck. My knees are springs. They bounce all the time."),
      L("C", "surprised", "talk", "You do? Everyone thinks I am not scared of anything."),
      L("A", "warm", "highfive", "Everybody gets scared sometimes. That is why friends are so good."),
      L("C", "sad", "talk", "I am sorry I made you slip, Bolt. I will clean the ramp myself."),
      L("B", "joy", "talk", "Thank you, Chuck. And I will help you with your nervous knees."),
    ]),
    S("arena", "day", "trophy", "The three of them skate together, and the audience goes wild.", [
      L("N", "excited", "skate", "The music started, and the three skaters rolled into the arena."),
      L("A", "joy", "skate", "Wheels up, everybody! Follow my lead!"),
      L("B", "excited", "jump", "One, two, boing! I jumped the five steps! Look, everybody, look!"),
      L("C", "joy", "jump", "Watch this! A flip, a twist and a double spin!"),
      L("N", "surprised", "skate", "Chuck spun in the air three times, and then he landed on one wheel."),
      L("A", "shocked", "skate", "Wow, Chuck! That was your best trick ever!"),
      L("B", "joy", "dance", "Everybody is clapping! They love us!"),
      L("C", "happy", "party", "Skating with friends is better than winning alone. Who knew?"),
    ]),
    S("arena", "dusk", "trophy", "The judges make a surprising choice.", [
      L("N", "serious", "talk", "The drum rolled, and the judges stood up with the shiny gold trophy."),
      L("N", "curious", "talk", "They looked at the three friends. They looked at the trophy. They smiled."),
      L("A", "worried", "talk", "Whoever wins, I am proud of us. We did our best."),
      L("N", "joy", "party", "The winners of the Great Skate Showdown are, all three skaters, together!"),
      L("B", "shocked", "panic", "Together? All three? Is that allowed? Robots can share trophies?"),
      L("C", "joy", "highfive", "I won nine times alone. But this one is the best. Because we won together."),
      L("A", "joy", "party", "Group photo, everybody! Hold the trophy high!"),
    ]),
    S("park", "dusk", "sun", "At sunset, the park fills up with a happy party.", [
      L("N", "warm", "party", "That evening, the whole town gathered in the park for a skate party."),
      L("B", "happy", "photo", "Say cheese, everyone. And say wheels, too!"),
      L("C", "happy", "eat", "Pizza for the champions! I will have the biggest slice. Well, the second biggest."),
      L("A", "joy", "skate", "Chuck, race you to the fountain! Wheels up!"),
      L("C", "joy", "skate", "You are on, Zippy! Bolt, you can be the judge!"),
      L("B", "joy", "dance", "I will be the judge and the cheerleader. My knees are dancing!"),
      L("N", "warm", "talk", "And that is how a racer, a robot and a champion learned that the best trophy is a good friend. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
