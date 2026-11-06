// ─── NEW MOVIE (made automatically): The Lost Star Puppy — a space rescue comedy with a pilot, a shy alien and a wise old robot.
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
  title: "The Lost Star Puppy", genre: "🚀 Space Rescue", price: 30, bg: "#0b1030", icons: "🚀🐶⭐", comedy: true,
  cast: { A: { role: "Captain Zip", kind: "pilot", pers: "hero", move: "ROCKET SPIN", mtype: "spin", fav: "Buckle up, team!", say: "I know, I should ask for help. I just hate asking." }, B: { role: "Blip", kind: "alien", pers: "nervous", move: "UFO FLYING KICK", mtype: "jumpkick", fav: "I have a very good bad feeling.", say: "My knees will not stop shaking. They are made of jelly." }, C: { role: "Old Rusty", kind: "robot", pers: "wise", move: "BOLT PUNCH", mtype: "punch", fav: "Patience fixes more than wrenches.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "🚀 One tiny rocket...", dur: 2200 }, { text: "🐶 One lost puppy made of stars...", dur: 2200 }, { text: "👽 And one very nervous alien!", dur: 2400 }, { text: "THE LOST STAR PUPPY", dur: 3000 }],
  scenes: [
    S("airport", "dawn", "rocket", "At the Explox Space Dock, a little girl waves a sign: please help, my star puppy ran away into space.", [
      L("N", "warm", "walk", "Early one morning, a small crowd gathered at the Space Dock around a crying little girl."),
      L("A", "curious", "look", "Little one, what is wrong? Why the sad face?"),
      L("N", "sad", "talk", "My puppy, Twinkle, is made of tiny stars. He floated up into the sky last night."),
      L("A", "determined", "talk", "Do not worry. Captain Zip never leaves a friend behind. We will find him."),
      L("B", "scared", "panic", "Captain, wait. Going into space is scary. There could be, um, space monsters."),
      L("C", "warm", "talk", "Blip, the only monsters up there are the ones we make up ourselves."),
      L("A", "excited", "highfive", "Come on, team. Rocket check, then lift off. Buckle up, team!"),
      L("B", "worried", "talk", "I have a very good bad feeling about this."),
    ]),
    S("airport", "day", "rocket", "The little rocket rumbles on the launch pad and everybody counts down.", [
      L("A", "excited", "exercise", "Stretch first, everyone. Space needs flexible knees."),
      L("B", "worried", "jump", "One, two, hop. I am so nervous that I cannot stop bouncing."),
      L("C", "serious", "work", "Fuel full. Wheels tight. Snacks packed. The rocket is ready."),
      L("A", "joy", "party", "Five, four, three, two, one. Blast off!"),
      L("N", "surprised", "fly", "The rocket flew up through the clouds, faster than a sneeze, higher than a kite."),
      L("B", "shocked", "panic", "We are flying! We are really flying! Please tell my mom I said hi!"),
      L("C", "happy", "talk", "She can hear you, Blip. She is standing right there waving."),
    ]),
    S("space", "night", "moon", "Out in space, the stars twinkle like a million tiny lanterns.", [
      L("A", "curious", "look", "Look at that, team. A glowing trail of stardust. Is that Twinkle's path?"),
      L("C", "curious", "look", "It could be. Stardust follows a puppy like crumbs follow a cookie."),
      L("B", "curious", "look", "Oh look! Over there! A moon!"),
      L("A", "happy", "fly", "Follow the trail. We are getting close."),
      L("N", "serious", "fly", "The rocket whooshed past a floating rock and a very surprised space snail."),
      L("B", "surprised", "talk", "Did that snail wave at us? I think it waved at us."),
      L("A", "joy", "talk", "Everyone is friendly in space, Blip. Wave back."),
      L("B", "happy", "fly", "Hello, snail! You are very slow and very pretty!"),
    ]),
    S("space", "night", "bolt", "Suddenly, the rocket shakes and the lights go dark. Trouble in the stars.", [
      L("N", "worried", "panic", "Without a warning, the rocket gave a big cough, and all the lights went out."),
      L("B", "scared", "panic", "Captain! The engine stopped! We are floating! We are doomed!"),
      L("A", "serious", "work", "Stay calm. Old Rusty, what happened?"),
      L("C", "worried", "work", "A little space pebble got stuck in the engine. I need someone to climb out and pull it."),
      L("B", "scared", "panic", "Climb out? Outside? In space? I am not a climbing alien."),
      L("A", "warm", "talk", "Blip, you are the only one small enough to reach it."),
      L("B", "worried", "talk", "Fine. But I am bringing my lucky sock."),
      L("C", "warm", "climb", "Take the rope, Blip. I will hold the other end. You are safe with us."),
    ]),
    S("space", "night", "lantern", "Blip floats out and pulls a stuck pebble from the engine.", [
      L("N", "serious", "climb", "Slowly, shaking like a jelly, Blip crawled along the outside of the rocket."),
      L("B", "scared", "climb", "Do not look down. Do not look down. There is no down. Oh no."),
      L("C", "warm", "talk", "You are doing wonderfully, Blip. A little farther to the left."),
      L("B", "determined", "climb", "I see it! It is stuck right in the engine. One, two, three, pull!"),
      L("N", "joy", "party", "The pebble popped out with a big pop, and the engine purred like a happy kitten."),
      L("A", "joy", "highfive", "Blip, you did it! You saved the whole mission!"),
      L("B", "surprised", "dance", "I did? I did! I am a brave alien! Look at me, I am a hero!"),
    ]),
    S("space", "night", "heart", "Following the glowing trail, they finally find something shining in the dark.", [
      L("N", "curious", "fly", "The trail of stardust led them to a quiet little asteroid."),
      L("A", "curious", "look", "Do you see that? Something is moving behind that rock."),
      L("B", "scared", "sneak", "Maybe it is a space monster. Maybe it has teeth. Maybe it has many teeth."),
      L("C", "curious", "sneak", "Let us look slowly and kindly, Blip. Whoever it is, they sound sad."),
      L("N", "surprised", "look", "From behind the rock, a tiny glowing puppy poked out his nose."),
      L("A", "joy", "look", "Twinkle! We found you! Come here, boy!"),
      L("B", "surprised", "play", "He is made of stars! Look, his tail wags like a comet!"),
      L("C", "relieved", "talk", "He is so shy. He is hiding because he is scared of the big dark."),
    ]),
    S("space", "night", "heart", "But Twinkle does not want to come home, and the heroes learn why.", [
      L("A", "worried", "talk", "Come on, Twinkle. The little girl misses you very much."),
      L("N", "sad", "talk", "The little puppy shook his head and backed away. He was afraid to go back."),
      L("C", "warm", "talk", "I understand. He floated away by accident, and now he thinks he is in trouble."),
      L("B", "warm", "talk", "I was scared too, Twinkle. Everyone is scared sometimes. Even a captain."),
      L("A", "serious", "talk", "It is true. I was scared to ask for help. But my friends helped me anyway."),
      L("N", "warm", "play", "Twinkle's tail began to wag, one tiny star at a time."),
      L("B", "joy", "play", "Look! He wants to play catch! Throw him a space ball, Captain!"),
      L("A", "joy", "play", "Go get it, boy! Fetch, Twinkle, fetch!"),
    ]),
    S("space", "night", "moon", "On the way home, one last surprise: the map was upside down the whole time.", [
      L("N", "curious", "fly", "With Twinkle safe and giggling, the little rocket turned toward home."),
      L("A", "curious", "look", "Rusty, why does the map say Explox is above us?"),
      L("C", "surprised", "look", "Oh dear. The map has been upside down since we left."),
      L("B", "surprised", "talk", "So all this time, we flew the long way around the whole sky?"),
      L("C", "worried", "talk", "Sorry. I am talking too much again, and reading too little."),
      L("A", "joy", "party", "Ha ha! The scenic route! We found a snail, a moon, a puppy and a pebble!"),
      L("B", "joy", "dance", "It was the best upside-down trip ever!"),
    ]),
    S("airport", "dusk", "rocket", "The rocket lands at the Space Dock, and the little girl is waiting.", [
      L("N", "warm", "walk", "The rocket landed gently as the sun set over the Space Dock."),
      L("A", "happy", "talk", "Little one, we brought someone home."),
      L("N", "joy", "play", "Twinkle jumped out of the rocket, and the little girl hugged him tight."),
      L("B", "joy", "photo", "Everyone say cheese! Click! That is the happiest photo in space."),
      L("C", "warm", "talk", "Patience fixes more than wrenches, little one. And so does a lost friend coming home."),
      L("A", "joy", "highfive", "Great work, team. Missions like this one are why I fly."),
      L("B", "happy", "party", "And I did not even run away. Okay, a little. But then I came back."),
    ]),
    S("park", "dusk", "sun", "In the park that evening, everybody celebrates with a star-shaped picnic.", [
      L("N", "warm", "party", "That evening, the whole town came to the park to say thank you."),
      L("B", "joy", "eat", "Star cookies! Star sandwiches! Even the star juice tastes like a star!"),
      L("C", "happy", "eat", "I will have a small one. Rust and crumbs do not mix."),
      L("A", "warm", "sing", "Everyone, sing along. Twinkle, twinkle, little friend, how we wonder where you wend."),
      L("B", "joy", "dance", "Look at me, I am dancing like a space snail!"),
      L("N", "warm", "party", "Twinkle jumped into the sky and left a glowing tail that spelled thank you."),
      L("A", "joy", "party", "Hooray for friends who help each other!"),
      L("N", "warm", "talk", "And that is how a captain, an alien and a robot saved a little star puppy. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
