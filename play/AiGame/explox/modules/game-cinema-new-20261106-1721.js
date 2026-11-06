// ─── NEW MOVIE (made automatically): The Camping Trip That Went Sideways — a camping comedy with a ranger, a goofy cat and a shy ghost.
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
  title: "The Camping Trip That Went Sideways", genre: "⛺ Camping Comedy", price: 30, bg: "#15301f", icons: "⛺🔥🐉", comedy: true,
  cast: { A: { role: "Camper Cleo", kind: "pioneer", pers: "hero", move: "LASSO SPIN", mtype: "spin", fav: "Fresh air fixes everything!", say: "I know, I should read the tent instructions. I never do." }, B: { role: "Mr. Whiskers", kind: "cat", pers: "goof", move: "CLAW FLURRY", mtype: "kick", fav: "Is there a snack involved?", say: "Sorry, I fell in the lake again." }, C: { role: "Gus the Ghost", kind: "ghost", pers: "nervous", move: "SPOOKY SPIN", mtype: "spin", fav: "I have a very good bad feeling.", say: "I get scared in the dark. Yes, even me." } },
  trailer: [{ text: "⛺ One crooked tent...", dur: 2200 }, { text: "🔥 One very hungry campfire...", dur: 2200 }, { text: "🐉 And one tiny surprise guest!", dur: 2400 }, { text: "THE CAMPING TRIP THAT WENT SIDEWAYS", dur: 3000 }],
  scenes: [
    S("nature", "day", "tree", "On a sunny Saturday, three friends drive to the lake for their very first camping trip.", [
      L("N", "joy", "walk", "The sun was shining, the birds were singing and the lake sparkled like a giant mirror."),
      L("A", "excited", "walk", "We made it, team! Look at that lake, those trees and that fresh air!"),
      L("B", "joy", "jump", "I brought twelve cans of tuna and one tiny pillow. I am ready for anything."),
      L("C", "worried", "look", "I have a very good bad feeling about camping. What if it gets dark?"),
      L("A", "warm", "talk", "It will get dark, Gus. But we have a campfire and flashlights, and we have each other."),
      L("C", "relieved", "talk", "Okay. As long as I can sleep in the middle of the tent."),
      L("B", "happy", "talk", "I will take the left side, next to the snacks. That is only fair."),
      L("A", "determined", "walk", "First job: set up the tent. Everybody grab a pole!"),
    ]),
    S("nature", "day", "tree", "The friends try to build the tent, and it goes very sideways.", [
      L("A", "determined", "build", "Pole one goes here, and pole two goes there. Gus, hold the rope."),
      L("C", "worried", "build", "I am holding the rope. The rope is holding me. We are holding each other."),
      L("B", "curious", "build", "Why does the tent have so many strings? Is it a tent or a harp?"),
      L("A", "serious", "write", "I will read the instructions. Step one: do not panic."),
      L("N", "surprised", "panic", "Then a strong gust of wind blew the tent up into the air like a big, blue balloon."),
      L("B", "shocked", "panic", "The tent is flying! It is gone! My tiny pillow is inside it!"),
      L("C", "shocked", "run", "It is landing on that tree! No, it is landing on the lake!"),
      L("A", "relieved", "talk", "It is floating, team. It is floating like a little boat. Let us grab it!"),
    ]),
    S("beach", "day", "sun", "At the shore, the friends try to rescue the floating tent with some fishing gear.", [
      L("A", "determined", "fish", "Cat, throw me the fishing rod. I will hook the tent and pull it back."),
      L("B", "excited", "fish", "Here you go! It is my lucky rod. It once caught a boot."),
      L("A", "determined", "fish", "Got it! I hooked the tent! Everybody pull!"),
      L("N", "excited", "tugwar", "All three friends pulled and pulled, and the soggy tent slowly came back to the shore."),
      L("C", "joy", "tugwar", "We did it! The tent is back! And look, there is a fish inside it!"),
      L("B", "shocked", "look", "A fish in the tent? That is my dinner! Hello, dinner!"),
      L("A", "warm", "talk", "Put him back in the lake, Whiskers. He did not know the tent was ours."),
      L("B", "sad", "talk", "Okay. Goodbye, fish. You were almost tuna."),
    ]),
    S("nature", "dusk", "tree", "By sunset, the tent is up and the campfire is ready.", [
      L("N", "warm", "build", "With the tent finally standing, the friends gathered wood for the evening campfire."),
      L("A", "happy", "build", "A few sticks, some leaves and a match. Stand back, everyone."),
      L("N", "excited", "camp", "The little campfire crackled, popped and filled the air with a warm, orange glow."),
      L("B", "joy", "camp", "Marshmallows! Gus, hold your stick over the flames, not in them."),
      L("C", "happy", "camp", "My marshmallow is perfectly golden. Wait, now it is black. Wait, now it is gone."),
      L("A", "joy", "eat", "Mine is perfect. Gooey in the middle and crunchy on the outside."),
      L("B", "joy", "eat", "Best dinner ever. Better than tuna. Do not tell the tuna."),
      L("C", "warm", "sing", "Camping is fun, with a friend or two. Under the stars, I love you."),
    ]),
    S("nature", "night", "moon", "As the night gets darker, a funny noise comes from the bushes.", [
      L("N", "curious", "look", "The moon rose, the stars came out, and the forest became very quiet."),
      L("C", "scared", "panic", "Did you hear that? Something went hic. Hic. Hic."),
      L("B", "worried", "sneak", "It is coming from the bush. Maybe it is a hiccuping monster."),
      L("A", "serious", "sneak", "Stay close, team. Let us check it out together."),
      L("N", "surprised", "look", "From behind the bush, a tiny blue glow flickered, and then there was another small hic."),
      L("A", "surprised", "look", "Oh look! It is a baby dragon! He is no bigger than a kitten!"),
      L("B", "shocked", "look", "A baby dragon with the hiccups! Every hic makes a tiny spark!"),
      L("C", "surprised", "look", "A real dragon? He is smaller than me. And I am a ghost!"),
    ]),
    S("nature", "night", "fire", "The tiny dragon turns out to be a funny and slightly clumsy guest.", [
      L("A", "warm", "talk", "Hello, little friend. Are you lost? Where is your family?"),
      L("N", "sad", "talk", "The little dragon shook his head and let out a very sad hic, and a small spark flew out."),
      L("B", "curious", "talk", "Hiccups! He needs a glass of water, and he needs to hold his breath."),
      L("C", "warm", "talk", "Let me try. Hello, little dragon. Take a deep breath, and count to ten."),
      L("N", "relieved", "exercise", "The dragon took a breath, counted to ten and the hiccups finally stopped."),
      L("A", "joy", "highfive", "It worked, Gus! You are a great hiccup doctor!"),
      L("N", "joy", "party", "The little dragon wagged his tail and gave Gus a tiny, friendly puff of warm air."),
      L("C", "joy", "dance", "He likes me! I made a dragon friend!"),
    ]),
    S("nature", "night", "fire", "But the dragon's tiny sparks make the campfire do something unexpected.", [
      L("B", "excited", "camp", "Little dragon, can you help us toast one more marshmallow? Just a tiny puff?"),
      L("N", "surprised", "magic", "The dragon puffed, and the whole campfire glowed bright blue and rose up like a tower."),
      L("A", "shocked", "panic", "Whoa! The fire is blue! And the marshmallows are floating!"),
      L("B", "joy", "juggle", "Floating marshmallows! Catch them, everybody! Catch them with your mouth!"),
      L("C", "joy", "juggle", "I caught one! It is warm and sparkly and a little bit minty!"),
      L("N", "joy", "dance", "Blue sparks danced across the sky and turned into a hundred tiny, glowing stars."),
      L("A", "joy", "dance", "It is the most beautiful campfire in the history of camping!"),
      L("B", "joy", "party", "Best trip ever! A flying tent, a hiccuping dragon and floating marshmallows!"),
    ]),
    S("nature", "dawn", "sun", "At dawn, the dragon's mom arrives to take her baby home.", [
      L("N", "warm", "walk", "As the sun came up, the three friends heard a soft flapping sound above the trees."),
      L("N", "surprised", "fly", "A big green dragon landed gently by the lake with a worried but friendly face."),
      L("C", "scared", "panic", "A big dragon! I think I will hide behind the tent for a minute."),
      L("A", "warm", "talk", "Do not be scared, Gus. She is looking for her baby."),
      L("N", "joy", "play", "The baby dragon ran across the grass and jumped right into his mother's wings."),
      L("B", "warm", "talk", "He had the hiccups, but Gus cured them. Gus is a hero."),
      L("C", "joy", "highfive", "I was brave for a whole minute. A new record!"),
      L("N", "warm", "photo", "The mother dragon gave each friend a warm thank-you puff, and they took a photo together."),
    ]),
    S("nature", "dawn", "sun", "On the way home, the friends pack up and talk about the best camping trip ever.", [
      L("N", "warm", "walk", "The three friends packed the tent, the pillow and the very last marshmallow."),
      L("B", "happy", "eat", "I will never forget this trip. Well, I might forget it if I get hungry."),
      L("C", "warm", "talk", "I thought camping would be scary. But it was warm and fun and full of friends."),
      L("A", "joy", "talk", "Fresh air fixes everything. And a good friend fixes the rest."),
      L("N", "joy", "party", "And that is how a flying tent, a floating marshmallow and a tiny hiccuping dragon made the best camping trip in Explox."),
      L("B", "joy", "dance", "Next time, I am bringing even more tuna."),
      L("A", "joy", "highfive", "Next time, I am reading the instructions. Probably."),
      L("N", "warm", "talk", "And that was the camping trip that went sideways. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
