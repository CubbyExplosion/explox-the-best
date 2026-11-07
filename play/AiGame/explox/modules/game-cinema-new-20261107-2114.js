// ─── NEW MOVIE (made automatically): The Day the Town Lost Its Colors — a town-saving art adventure with a kind painter, a goofy robot and a worried mayor.
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
  title: "The Day the Town Lost Its Colors", genre: "🎨 Art Adventure", price: 30, bg: "#2a2a4a", icons: "🎨🌈🖌️", comedy: true,
  cast: { A: { role: "Pia the Painter", kind: "hero", pers: "sweet", move: "RAINBOW BRUSH SPIN", mtype: "spin", fav: "Every color is a little gift.", say: "I could not say no to a gray wall. I never can." }, B: { role: "Splat the Robot", kind: "robot", pers: "goof", move: "PAINT SPRAY BLAST", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I sprayed the wrong color again." }, C: { role: "Mayor Mumble", kind: "king", pers: "nervous", move: "ROYAL SPIN", mtype: "spin", fav: "I have a very good bad feeling.", say: "My hands will not stop shaking." } },
  trailer: [{ text: "🎨 One colorful town...", dur: 2200 }, { text: "🌫️ One very gray morning...", dur: 2200 }, { text: "🌈 And a painter who brings it all back!", dur: 2400 }, { text: "THE DAY THE TOWN LOST ITS COLORS", dur: 3000 }],
  scenes: [
    S("city", "dawn", "sun", "One morning, the whole town wakes up to find every color gone.", [
      L("N", "warm", "walk", "Explox was the most colorful town in the world, with red roofs, blue doors and yellow flower boxes."),
      L("N", "surprised", "look", "But one morning, when the sun came up, everything was gray. The roofs, the doors, even the flowers."),
      L("C", "scared", "panic", "Oh no, oh no! Everybody, look! The colors are gone! Where are the colors?"),
      L("N", "worried", "look", "People stepped out of their houses, rubbing their eyes, and stared at the gray town."),
      L("B", "shocked", "look", "Whoa. Even my paint cans are gray! My red is gray, and my blue is gray. Is this a robot joke?"),
      L("A", "worried", "talk", "This is not a joke, Splat. Something has taken the colors. We have to find out what."),
      L("C", "worried", "talk", "Pia, you are the town painter. Please help us. I have a very good bad feeling about this."),
      L("A", "determined", "talk", "Every color is a little gift. And somebody borrowed them. Let us find out who."),
    ]),
    S("city", "day", "book", "The friends search for clues, and the town looks sadder and grayer.", [
      L("N", "serious", "walk", "Pia, Splat and the mayor walked through the gray streets, looking for any sign of color."),
      L("A", "curious", "look", "Look at this wall. The paint is still there, but it looks pale, like it is asleep."),
      L("B", "curious", "talk", "Maybe the colors are tired. Maybe they went on vacation. Maybe they went to get snacks."),
      L("C", "worried", "talk", "Colors do not take vacations, Splat. And they do not get snacks."),
      L("N", "curious", "look", "On the ground, a tiny trail of sparkly dust led away from the market, toward the old hill outside town."),
      L("A", "excited", "look", "Rainbow dust! Colors leave sparkles when they fly. Follow the trail, everybody!"),
      L("B", "joy", "run", "A trail of sparkles! I love sparkles! Even gray sparkles are the best sparkles!"),
      L("N", "excited", "run", "The three friends hurried up the hill, following the shimmering dust."),
    ]),
    S("nature", "day", "tree", "At the top of the hill, they discover where the colors went.", [
      L("N", "curious", "climb", "At the top of the hill stood a big, round cave, with a faint rainbow glow coming from inside."),
      L("C", "scared", "sneak", "I do not like caves. They are dark, and echoey, and they smell like old socks."),
      L("A", "warm", "talk", "Do not worry, Mayor. I will go first. Hold my hand, and we will go slowly."),
      L("N", "surprised", "look", "Inside the cave, a giant, fluffy, sleepy cloud was curled up, snoring, and every color in town was floating inside it."),
      L("B", "shocked", "look", "A color cloud! The colors are all inside the cloud! Red, blue, yellow, green, all swirling around!"),
      L("A", "surprised", "look", "It must have swallowed them by accident, while it was dreaming. Poor little cloud."),
      L("N", "curious", "look", "The cloud snored, zzz, and a little puff of purple floated out of its mouth, and drifted away."),
      L("C", "curious", "talk", "It is not a thief. It is just very, very sleepy. What do we do now?"),
    ]),
    S("nature", "day", "tree", "The friends try to wake the cloud gently, with some silly attempts.", [
      L("A", "warm", "talk", "We must wake it up gently, so it lets the colors go. Splat, any ideas?"),
      L("B", "joy", "drum", "I will play the drums! Boom, boom, bada boom! That will wake anybody up!"),
      L("N", "joy", "drum", "Splat beat on his tummy like a drum, and the cave rang with a thunderous BOOM."),
      L("N", "surprised", "look", "The cloud only wiggled, and mumbled, and rolled over, and went back to snoring."),
      L("C", "worried", "talk", "Let me try. Good morning, Mister Cloud! It is time to wake up! Please?"),
      L("N", "joy", "look", "The cloud smacked its lips, and a tiny puff of orange floated out, and drifted away."),
      L("A", "curious", "talk", "Hmm. It does not wake up for loud noises. Maybe it needs something gentle, like a lullaby."),
      L("B", "curious", "talk", "A lullaby? To wake someone up? That seems backwards, Pia."),
    ]),
    S("nature", "dusk", "star", "A funny and gentle idea saves the day.", [
      L("A", "determined", "talk", "A sleepy cloud wakes up when it feels a warm breeze. Let us give it a cozy, sunny breeze."),
      L("B", "joy", "work", "A breeze! I can do that! My arms are fans! Whirr, whirr, whirr!"),
      L("C", "determined", "work", "And I will open the cave, so the sunshine can come in. Pull, pull, pull!"),
      L("N", "joy", "build", "Mayor Mumble pushed a big rock aside, and golden sunlight poured into the cave, warm as a hug."),
      L("N", "joy", "magic", "Splat whirred his arms, and sent a soft, gentle wind swirling around the sleepy cloud."),
      L("N", "surprised", "look", "The cloud stretched, yawned a giant yawn, and slowly opened two big, sleepy eyes."),
      L("A", "warm", "talk", "Good morning, little cloud. We are so glad to meet you. You have borrowed all our colors."),
      L("N", "worried", "look", "The cloud looked around, and saw the colors inside it, and its eyes grew wide with embarrassment."),
    ]),
    S("nature", "dusk", "star", "The cloud is sorry, and the colors fly home in a beautiful way.", [
      L("N", "sad", "talk", "The cloud's big eyes filled with soft rain. I am so sorry. I was dreaming of rainbows, and I swallowed them all."),
      L("A", "warm", "talk", "It is all right, little cloud. Everyone makes mistakes. Would you let the colors go home now?"),
      L("N", "relieved", "magic", "The cloud took a deep breath, and puffed out, and a dazzling rainbow swirled out of its mouth."),
      L("N", "joy", "fly", "Red, orange, yellow, green, blue and purple streamed down the hill, toward the gray town."),
      L("B", "joy", "dance", "Look at them go! The colors are flying home! It is like the biggest paint party ever!"),
      L("C", "joy", "jump", "They are going to the houses! The roofs, the doors, the flowers! Hooray!"),
      L("N", "joy", "party", "One by one, the roofs turned red, the doors turned blue and the flower boxes burst into yellow."),
      L("A", "joy", "highfive", "Look at that! The whole town is glowing with color again!"),
    ]),
    S("city", "day", "sun", "Back in town, the people celebrate, and the cloud gets a special job.", [
      L("N", "joy", "walk", "The people of Explox cheered, and hugged, and danced in the colorful streets."),
      L("C", "relieved", "talk", "I was so worried. But thanks to you, Pia, and Splat, and a very sleepy cloud, the colors are back."),
      L("N", "warm", "look", "The little cloud floated over the town, shy, but smiling, and a gentle drizzle of rain sparkled in the sun."),
      L("A", "warm", "talk", "Mayor, I have an idea. What if the cloud became the town's official Rainbow Maker?"),
      L("C", "joy", "talk", "A Rainbow Maker? What a lovely idea! Every day after a little rain, a rainbow over Explox!"),
      L("B", "joy", "dance", "I will paint a sign! Rainbow Maker Cloud, Employee of the Month! With a gold star!"),
      L("N", "joy", "photo", "The cloud blushed a soft pink, and everybody took a photo with it."),
      L("A", "warm", "talk", "Every color is a little gift. And so is every friend."),
    ]),
    S("city", "dusk", "star", "At sunset, the town paints a big mural together.", [
      L("N", "warm", "walk", "That evening, as the sun set, the whole town gathered in the square, with paint, brushes and buckets."),
      L("A", "happy", "write", "Let us paint a big mural, so we never forget this day. Everybody can add a bit of color."),
      L("N", "joy", "build", "Children painted flowers, grown-ups painted houses and the cloud puffed little rain drops to make the colors shine."),
      L("B", "joy", "work", "And I will paint the sky! Splat the Robot, with the biggest brush in the world! Swish, swish!"),
      L("N", "joy", "bubbles", "A drip of blue paint fell on the mayor's nose, and everybody laughed and laughed."),
      L("C", "joy", "talk", "Oh dear. Now I have a blue nose! But I do not mind at all. It is a very happy nose."),
      L("N", "warm", "photo", "By night, the wall glowed with a huge, shimmering mural of a smiling cloud and a rainbow over the town."),
      L("N", "warm", "talk", "And that is the story of the day the town lost its colors, and the friends who brought them home. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
