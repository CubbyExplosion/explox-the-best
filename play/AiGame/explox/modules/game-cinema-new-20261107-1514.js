// ─── NEW MOVIE (made automatically): The Little Train That Lost Its Whistle — a countryside adventure with a kind conductor, a goofy dino and a curious girl.
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
  title: "The Little Train That Lost Its Whistle", genre: "🚂 Countryside Adventure", price: 30, bg: "#2a4a2a", icons: "🚂🔔🌄", comedy: true,
  cast: { A: { role: "Conductor Clem", kind: "pioneer", pers: "sweet", move: "TICKET TWIRL", mtype: "spin", fav: "All aboard for a good day!", say: "I could not say no to a lost passenger. I never can." }, B: { role: "Toot the Dino", kind: "dino", pers: "goof", move: "TAIL WHIP", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, I sneezed on the engine." }, C: { role: "Nina", kind: "hero", pers: "hero", move: "WHISTLE KICK", mtype: "kick", fav: "Every problem has a way through.", say: "I know, I should ask for help sooner. I never do." } },
  trailer: [{ text: "🚂 One little train...", dur: 2200 }, { text: "🔔 One lost whistle...", dur: 2200 }, { text: "🌄 And a long way home!", dur: 2400 }, { text: "THE LITTLE TRAIN THAT LOST ITS WHISTLE", dur: 3000 }],
  scenes: [
    S("nature", "dawn", "sun", "At sunrise, the little train sets off with its passengers.", [
      L("N", "warm", "walk", "In the green hills of Explox, a little blue train puffed out of a tiny station, chug, chug, chug."),
      L("A", "happy", "talk", "All aboard for a good day! I am Conductor Clem, and this is our little train, Bluebell."),
      L("B", "joy", "dance", "Hello, hello! I am Toot the Dino! I love trains! They go choo-choo, and I go choo-choo too!"),
      L("C", "excited", "jump", "I am Nina! I have never ridden a train before! Can I see the engine, please?"),
      L("A", "warm", "talk", "Of course. Bluebell has a very special whistle. It goes toot-toot, and every child in the valley knows it."),
      L("N", "joy", "play", "Conductor Clem pulled a little rope, and the whistle sang a bright, happy toot-toot across the hills."),
      L("B", "joy", "dance", "I love that sound! Can I do it? Please, please, please?"),
      L("A", "warm", "talk", "In a little while, Toot. First, let us enjoy the view."),
    ]),
    S("nature", "day", "tree", "Toot gets too excited, and the whistle goes missing.", [
      L("N", "joy", "walk", "The little train rolled past green fields, flowers and fluffy sheep, and a babbling blue stream."),
      L("B", "excited", "jump", "Conductor Clem, may I please do the whistle now? I will be very gentle!"),
      L("A", "warm", "talk", "Well, all right. But only one little pull, Toot."),
      L("N", "worried", "play", "Toot grabbed the whistle rope, and pulled with all his dinosaur strength. Snap!"),
      L("N", "shocked", "look", "The whole whistle popped off the top of the train, flew in a big arc over the trees, and vanished."),
      L("B", "shocked", "panic", "Oh no, oh no, oh no! I broke it! I broke the whistle! I am a terrible dinosaur!"),
      L("A", "warm", "talk", "Toot, it was an accident. Do not cry. We will find it."),
      L("C", "determined", "talk", "Every problem has a way through. Let us look for it together, Toot."),
    ]),
    S("nature", "day", "tree", "The train stops, and a search begins.", [
      L("N", "serious", "walk", "Conductor Clem stopped the train next to a big green meadow, with a little brook running through it."),
      L("A", "serious", "look", "The whistle flew over that hill, I think. Let us walk and look. Nina, Toot, stay close."),
      L("C", "curious", "look", "I see something shiny on the ground. Is it a clue?"),
      L("N", "curious", "look", "It was only a shiny, round pebble, glittering in the sun."),
      L("B", "sad", "talk", "That is not a whistle. That is a stone. My mistake has made the whole train sad."),
      L("C", "warm", "talk", "Nobody is sad, Toot. We are only on a little adventure. Keep looking."),
      L("N", "curious", "walk", "They crossed the brook, climbed the hill, and searched through the tall, swishing grass."),
      L("B", "curious", "look", "Wait. I hear something. A tiny little toot, toot, from over there!"),
    ]),
    S("nature", "day", "tree", "They find the whistle, and a surprising friend.", [
      L("N", "surprised", "look", "Behind a big gray rock, a small, round hedgehog sat in the grass, holding the shiny brass whistle."),
      L("C", "surprised", "talk", "Hello, little hedgehog. Is that our train whistle?"),
      L("N", "warm", "talk", "The hedgehog squeaked, and gave a soft toot on the whistle, and rolled into a happy little ball."),
      L("A", "warm", "talk", "I think he found it, and he is playing with it. He has never heard such a nice sound."),
      L("B", "joy", "talk", "Hello, hedgehog! I am sorry I frightened you. Do you like the whistle?"),
      L("N", "joy", "look", "The hedgehog nodded, and gave a bigger toot, and his round little eyes shone with delight."),
      L("C", "warm", "talk", "Maybe we can ask him nicely. The train needs its whistle to tell people we are coming."),
      L("A", "warm", "talk", "Let us trade. A shiny new bell, for the whistle? Would that be fair, little friend?"),
    ]),
    S("nature", "dusk", "lantern", "The hedgehog says yes, but the train has a new problem.", [
      L("N", "joy", "talk", "The hedgehog gave a happy squeak, and handed over the whistle, and took the little brass bell in return."),
      L("B", "joy", "dance", "Thank you, hedgehog! You are a very kind friend! I will never break a whistle again!"),
      L("A", "relieved", "talk", "Now, back to the train. We must carry on, and get all the passengers home before dark."),
      L("N", "worried", "look", "But when they reached the track, the sun was low, and a gray fog began to roll over the hills."),
      L("C", "worried", "look", "The fog is getting thick. I can barely see the train."),
      L("A", "worried", "talk", "In thick fog, a train must whistle, so everyone knows it is coming. But we have not fixed the whistle yet."),
      L("B", "determined", "work", "I can fix it! I will tie it with this ribbon, and a bit of string. Look, it is as good as new!"),
      L("N", "excited", "work", "Toot tied the whistle onto the train with a pretty red ribbon, tight and strong."),
    ]),
    S("nature", "night", "lantern", "In the fog, the whistle guides the train home.", [
      L("N", "serious", "drive", "The little train chugged slowly through the fog, its lamp glowing like a tiny yellow star."),
      L("A", "serious", "talk", "Toot, would you do the honors? Pull the rope, gently, and let the whistle sing."),
      L("B", "determined", "talk", "Yes, Conductor. One gentle pull. I promise, one gentle pull."),
      L("N", "joy", "play", "Toot-toot! The whistle rang clear through the fog, bright and happy, and echoed across the hills."),
      L("N", "joy", "look", "And from far away, someone answered. Toot-toot! It was the station whistle, calling the little train home."),
      L("C", "relieved", "talk", "They hear us! We just follow the sound, and we will find the station!"),
      L("B", "joy", "dance", "Toot, toot! We are the little train that could, and the little dinosaur who helped!"),
      L("A", "warm", "talk", "Well done, Toot. A whistle is no good unless somebody knows how to use it gently."),
    ]),
    S("nature", "night", "star", "The little train arrives at the station, and everyone cheers.", [
      L("N", "excited", "party", "At last, the glowing lights of the tiny station appeared through the fog, and a crowd stood waiting."),
      L("N", "joy", "party", "Moms, dads, grandparents and children waved lanterns, and cheered as the little train rolled in."),
      L("A", "joy", "talk", "Welcome home, everyone! Thank you for waiting! We had a little adventure on the way."),
      L("C", "joy", "highfive", "We lost the whistle, and found a hedgehog, and fixed it with a ribbon!"),
      L("B", "joy", "dance", "And I pulled the rope very, very gently, and it sang the prettiest song!"),
      L("N", "warm", "photo", "The mayor of the village gave Toot a little golden badge, shaped like a whistle."),
      L("B", "joy", "talk", "A badge! For me! I will never take it off, not even when I sleep!"),
      L("A", "warm", "talk", "All aboard for a good day, and a good night, and a good friend."),
    ]),
    S("nature", "night", "moon", "At bedtime, the friends say a happy goodnight.", [
      L("N", "warm", "walk", "That night, the moon came out, and the fog melted away, and the little blue train rested in its shed."),
      L("C", "happy", "talk", "Conductor Clem, may I ride the train again tomorrow? It was the best day ever."),
      L("A", "warm", "talk", "Of course, Nina. Every morning, if you like. Bluebell loves company."),
      L("B", "joy", "talk", "And I will bring the hedgehog a present! A little whistle of his own!"),
      L("N", "joy", "photo", "Next to the track, a tiny brass bell tinkled, ting-a-ling, in the soft night breeze."),
      L("C", "warm", "talk", "Goodnight, Bluebell. Goodnight, Toot. Goodnight, hedgehog. See you in the morning."),
      L("A", "warm", "talk", "Every problem has a way through, when friends walk together."),
      L("N", "warm", "talk", "And that is the story of the little train that lost its whistle, and the friends who found it again. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
