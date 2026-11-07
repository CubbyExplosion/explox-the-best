// ─── NEW MOVIE (made automatically): The Rainbow Bike Race — a sports comedy with a determined girl, a goofy robot and a proud rival.
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
  title: "The Rainbow Bike Race", genre: "🚲 Sports Comedy", price: 30, bg: "#1e3a5a", icons: "🚲🌈🏁", comedy: true,
  cast: { A: { role: "Bella Spoke", kind: "hero", pers: "hero", move: "PEDAL POWER KICK", mtype: "kick", fav: "Pedal, smile, repeat!", say: "I know, I should check my tires. I never do." }, B: { role: "Cog the Robot", kind: "robot", pers: "goof", move: "GEAR SPIN", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, my wheels squeaked." }, C: { role: "Rocco Rush", kind: "hero", pers: "rival", move: "TURBO BOOT", mtype: "kick", fav: "I always come in first.", say: "I know, I should be nicer. I never am." } },
  trailer: [{ text: "🚲 One big race...", dur: 2200 }, { text: "🌈 One rainbow finish line...", dur: 2200 }, { text: "🏁 And a rival who never loses!", dur: 2400 }, { text: "THE RAINBOW BIKE RACE", dur: 3000 }],
  scenes: [
    S("track", "day", "trophy", "On race morning, Bella and Cog line up for the Rainbow Bike Race.", [
      L("N", "excited", "party", "It was a sunny Saturday at the Explox Race Track, and the stands were full of cheering families."),
      L("A", "excited", "jump", "Cog, today is the Rainbow Bike Race! Ten laps, and a golden trophy for the winner!"),
      L("B", "joy", "dance", "Beep, beep! I polished my wheels! I polished the bike! I polished the polish!"),
      L("N", "serious", "look", "At the starting line, a tall boy with a shiny red helmet and a silver bike stared at them."),
      L("C", "serious", "talk", "Hello, Bella. I am Rocco Rush. I have won the Rainbow Bike Race four years in a row."),
      L("A", "determined", "talk", "Good luck, Rocco. May the best rider win, and may everyone have fun."),
      L("C", "angry", "talk", "Fun? I do not do fun. I do winning. Your robot friend looks like a rolling toaster."),
      L("B", "sad", "talk", "I am not a toaster. I am Cog. But I will do my best. Squeak, squeak."),
    ]),
    S("track", "day", "trophy", "The race begins, with a funny start.", [
      L("N", "excited", "party", "A big green flag waved, and a whistle blew, and the Rainbow Bike Race began."),
      L("A", "excited", "skate", "Pedal, smile, repeat! Here we go, Cog! Stay close behind me!"),
      L("N", "joy", "skate", "Bella and Rocco shot forward, side by side, their wheels whirring on the smooth, bright track."),
      L("B", "joy", "skate", "Wheee! I am the fastest robot on two wheels! Look at me go! Squeak, squeak, zoom!"),
      L("N", "surprised", "look", "But Cog's wheels squeaked so loudly that a flock of pigeons took off in a big, flapping cloud."),
      L("B", "shocked", "panic", "Oops! Sorry, birds! Do not worry, I will not hurt you! Just very squeaky!"),
      L("N", "joy", "party", "The crowd laughed, and the pigeons circled around, and landed on the finish line to watch."),
      L("A", "joy", "talk", "Cog, you made the pigeons our cheering squad! Keep going!"),
    ]),
    S("track", "day", "trophy", "Rocco plays unfairly, and Bella has to make a choice.", [
      L("N", "serious", "skate", "On the fourth lap, Rocco was in the lead, and Bella and Cog were close behind."),
      L("C", "angry", "talk", "Out of my way, slowpokes! The trophy is mine, as always!"),
      L("N", "shocked", "look", "Rocco swerved sideways, and bumped Bella's bike, and she wobbled and nearly fell."),
      L("A", "worried", "panic", "Whoa! Hey, Rocco! That was not fair! You nearly knocked me down!"),
      L("C", "angry", "talk", "It is a race, not a tea party. Keep up, or get out of the way."),
      L("B", "angry", "talk", "That is very rude! Rocco, you should say sorry, and you should say it right now!"),
      L("A", "serious", "talk", "Cog, let him go. We will race fair and square. We do not need to be mean to win."),
      L("B", "determined", "talk", "You are right, Bella. Let us show him how a real team rides."),
    ]),
    S("track", "day", "trophy", "Bella and Cog find a clever team trick.", [
      L("N", "serious", "skate", "On the sixth lap, Bella and Cog rode side by side, thinking hard."),
      L("A", "curious", "talk", "Cog, Rocco is faster on the straight parts. But your wheels are better on the curves."),
      L("B", "curious", "talk", "That is true! My gears grip the track, and his skinny tires slip on the corners!"),
      L("A", "excited", "talk", "So, we speed up on every curve, and stay close on every straight, and wait for our chance!"),
      L("B", "joy", "skate", "Curve speed, curve speed! I love a good plan! Beep, beep!"),
      L("N", "excited", "skate", "On each curve, Bella and Cog leaned low, and zoomed past, closing the gap, little by little."),
      L("C", "worried", "look", "What? They are catching up? How? I am the fastest rider on the whole track!"),
      L("N", "excited", "party", "The crowd began to cheer louder and louder for the underdogs in the rainbow helmets."),
    ]),
    S("track", "day", "trophy", "On the last lap, trouble strikes: Rocco's chain breaks.", [
      L("N", "excited", "skate", "On the tenth and final lap, Rocco was still in front, but only by a tiny bit."),
      L("N", "shocked", "look", "Then, crack! Rocco's bike chain snapped, and his pedals spun uselessly, and his bike slowed to a stop."),
      L("C", "shocked", "panic", "No! No, no, no! My chain! Not now, not on the last lap!"),
      L("N", "curious", "look", "Bella rolled up beside him, and slowed down, and looked at the broken chain."),
      L("A", "curious", "talk", "Rocco, are you all right? Can I help?"),
      L("C", "sad", "talk", "Why would you help me? I bumped you, and I called your friend a toaster."),
      L("A", "warm", "talk", "Because that is what riders do. We race hard, but we do not leave anybody behind."),
      L("B", "warm", "talk", "I have a tool kit in my belly! I can fix a chain in one minute! Hold still!"),
    ]),
    S("track", "day", "trophy", "Cog fixes the chain, and Rocco learns a lesson.", [
      L("N", "joy", "work", "Cog opened a little hatch on his tummy, and pulled out a tiny wrench, and a screwdriver, and a squirt of oil."),
      L("B", "determined", "work", "Click, twist, squirt, tighten! There you go, Rocco! As good as new!"),
      L("C", "surprised", "look", "You fixed it. After everything I said and did to you. Why?"),
      L("A", "warm", "talk", "Pedal, smile, repeat. A race is better when everybody can ride."),
      L("C", "sad", "talk", "I am sorry, Bella. I am sorry, Cog. I thought winning was the only thing that mattered."),
      L("B", "joy", "dance", "Apology accepted! And I love being called a toaster, actually. Toast is delicious!"),
      L("C", "joy", "talk", "Ha ha! You are a funny robot, Cog. Thank you, both of you. Let us finish this race together."),
      L("N", "joy", "party", "The crowd cheered, as the three riders took off again, side by side, down the final stretch."),
    ]),
    S("track", "dusk", "trophy", "The three cross the finish line together, and a surprise awaits.", [
      L("N", "excited", "skate", "The three bikes sped toward the glowing rainbow finish line, with the whole stadium shouting."),
      L("A", "joy", "skate", "Ready? One, two, three, together!"),
      L("N", "joy", "party", "They crossed the line at exactly the same moment, and a huge shower of rainbow confetti burst into the sky."),
      L("N", "surprised", "talk", "The judge looked at the camera, and scratched his head. It is a three-way tie! This has never happened before!"),
      L("N", "joy", "talk", "So there will be three golden trophies, for the three best riders in Explox!"),
      L("C", "joy", "jump", "A trophy! A real one! And I did not even have to push anybody for it!"),
      L("B", "joy", "dance", "Three trophies! One for each of us! And one for the pigeons, as the cheering squad!"),
      L("N", "warm", "talk", "And that is the story of the Rainbow Bike Race, and the rival who became a friend. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
