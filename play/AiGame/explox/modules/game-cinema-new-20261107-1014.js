// ─── NEW MOVIE (made automatically): The Lighthouse That Lost Its Light — a seaside rescue adventure with a kind keeper, a goofy robot and a nervous young sailor.
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
  title: "The Lighthouse That Lost Its Light", genre: "🌊 Seaside Rescue Adventure", price: 30, bg: "#0f2a4a", icons: "🌊⛵🔦", comedy: true,
  cast: { A: { role: "Keeper Mabel", kind: "grandma", pers: "sweet", move: "LANTERN SWING", mtype: "spin", fav: "A little light goes a long way.", say: "I could not say no to a lost sailor. I never can." }, B: { role: "Gizmo the Robot", kind: "robot", pers: "goof", move: "SPARK SPIN", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, I turned the wrong switch again." }, C: { role: "Sailor Sam", kind: "hero", pers: "nervous", move: "LIFE RING TOSS", mtype: "punch", fav: "I have a very good bad feeling.", say: "My hands will not stop shaking." } },
  trailer: [{ text: "🌊 One stormy night...", dur: 2200 }, { text: "🔦 One lighthouse gone dark...", dur: 2200 }, { text: "⛵ And a little boat that needs help!", dur: 2400 }, { text: "THE LIGHTHOUSE THAT LOST ITS LIGHT", dur: 3000 }],
  scenes: [
    S("beach", "dusk", "sun", "At sunset, Keeper Mabel shows two friends the old lighthouse by the sea.", [
      L("N", "warm", "walk", "At the edge of the Explox coast stood an old white lighthouse, with a big red lamp on top."),
      L("A", "happy", "talk", "Welcome, Sam and Gizmo! I am Keeper Mabel. Every night, my lighthouse guides the boats home."),
      L("C", "worried", "look", "It is very tall. And the waves are very loud. I am not great with big waves."),
      L("B", "joy", "dance", "I love it! It is a giant flashlight in the sky! Can I turn it on? Please?"),
      L("A", "warm", "talk", "Soon, Gizmo. First, a little tea and cookies. Then, we light the lamp together."),
      L("B", "joy", "eat", "Cookies! The best part of any lighthouse. Nom, nom, nom."),
      L("C", "relieved", "talk", "Okay. Tea sounds nice. Maybe the waves will be calm tonight."),
      L("N", "curious", "look", "But far out at sea, dark gray clouds were slowly rolling in."),
    ]),
    S("beach", "night", "lantern", "A storm arrives, and the big lamp suddenly goes dark.", [
      L("N", "serious", "look", "By night, the wind howled, and big waves splashed against the rocks."),
      L("A", "serious", "climb", "Quickly, friends! It is time to light the lamp. Up the stairs we go!"),
      L("N", "excited", "climb", "They climbed the spiral stairs, round and round, up to the top of the lighthouse."),
      L("B", "joy", "work", "I will flip the big switch! Ready? One, two, three... oops."),
      L("N", "shocked", "look", "Pop! The big red lamp flickered, buzzed, and then went completely dark."),
      L("A", "worried", "talk", "Oh dear. The lamp has burned out. And a storm is coming, and the boats cannot see the rocks."),
      L("B", "worried", "panic", "I did not do it! Well, maybe a little bit. I flipped the wrong switch."),
      L("C", "determined", "look", "It is not your fault, Gizmo. We must find a way to make light, fast."),
    ]),
    S("beach", "night", "lantern", "Out at sea, a little boat is lost in the storm.", [
      L("N", "worried", "look", "Just then, Sam spotted a tiny glowing dot, far out on the dark, rolling sea."),
      L("C", "scared", "look", "Look! A little boat! It is going straight toward the rocks!"),
      L("A", "worried", "look", "That is Captain Pebble's fishing boat. He has his three little grandchildren on board."),
      L("B", "scared", "panic", "Oh no, oh no! We need a light! We need a big, bright light, right now!"),
      L("C", "determined", "talk", "I have an idea! We can use the mirrors, the lanterns and every flashlight we have."),
      L("A", "relieved", "talk", "Clever boy! The lighthouse glass can spread even a tiny light very far."),
      L("B", "excited", "run", "I will fetch all the lanterns! Gizmo the Robot, at your service!"),
      L("N", "excited", "run", "The three friends raced around the lighthouse, collecting every lantern they could find."),
    ]),
    S("beach", "night", "lantern", "The friends build a lantern light with mirrors and a bit of silliness.", [
      L("A", "determined", "build", "Place the lanterns in a circle, right in front of the big round glass."),
      L("C", "determined", "work", "I will polish the mirror, so the light bounces out to sea."),
      L("B", "joy", "juggle", "And I will hold the extra lanterns! I am an excellent lantern juggler!"),
      L("N", "worried", "juggle", "Gizmo juggled five lanterns, and wobbled, and spun in a circle, and nearly tripped over his own feet."),
      L("C", "scared", "panic", "Gizmo, careful! Do not drop them! Hold on tight!"),
      L("B", "joy", "dance", "Whoa, whoa, whoa! Look, I am a spinning lighthouse robot!"),
      L("N", "surprised", "look", "And when Gizmo spun, his shiny metal body reflected all the lantern light, in every direction at once."),
      L("A", "surprised", "talk", "Gizmo, stay just like that! You are the best mirror we could ask for!"),
    ]),
    S("beach", "night", "star", "Gizmo becomes the lighthouse, and the boat sees the glow.", [
      L("N", "excited", "magic", "Gizmo spun round and round in front of the lanterns, and a bright, beautiful beam swept across the waves."),
      L("B", "joy", "dance", "I am the brightest robot in the whole world! Whoooo!"),
      L("C", "determined", "look", "Look! The little boat is turning! They see the light!"),
      L("A", "relieved", "talk", "Keep spinning, Gizmo! Just a few more minutes, and they will be safe in the harbor!"),
      L("B", "determined", "work", "I will spin all night if I have to! Dizzy, dizzy, but happy!"),
      L("N", "joy", "look", "The little boat slowly steered away from the rocks, and followed the bright light toward the harbor."),
      L("C", "relieved", "highfive", "It is working! We did it! Gizmo, you are a hero!"),
      L("B", "joy", "highfive", "Hero Gizmo! I like the sound of that! Wheee!"),
    ]),
    S("beach", "night", "heart", "Sam goes to the dock to help the boat arrive safely.", [
      L("N", "worried", "look", "But the waves were big, and the dock was slippery, and the little boat bobbed up and down."),
      L("A", "serious", "talk", "Sam, I need someone to catch the rope at the dock. Can you do it?"),
      L("C", "scared", "look", "Me? The waves are so big. And my hands are shaking."),
      L("A", "warm", "talk", "You do not have to be unafraid, Sam. You just have to be brave anyway."),
      L("C", "determined", "talk", "Okay. I will try. I will hold on tight, and take a very deep breath."),
      L("N", "excited", "run", "Sam ran down the stairs, across the sand, and onto the wet, wobbly dock."),
      L("N", "excited", "tugwar", "Captain Pebble tossed the rope, and Sam caught it, and pulled with all his might."),
      L("C", "joy", "tugwar", "Heave! Heave! I got it! The boat is coming in!"),
    ]),
    S("beach", "night", "star", "The boat arrives, and the rescued family says thank you.", [
      L("N", "relieved", "walk", "With one last big pull, the little fishing boat bumped gently against the dock."),
      L("N", "joy", "party", "Captain Pebble and his three grandchildren jumped out, wet, tired, and very happy."),
      L("N", "warm", "talk", "Thank you, thank you! We saw your light, and it led us home. We were so scared in that storm."),
      L("C", "joy", "highfive", "I caught the rope! I was scared, but I did it!"),
      L("B", "joy", "dance", "And I was the lighthouse! A very dizzy, very shiny lighthouse!"),
      L("A", "warm", "talk", "A little light goes a long way. And so do good friends."),
      L("N", "warm", "photo", "The smallest grandchild hugged Gizmo's metal leg, and gave him a tiny, shiny seashell."),
      L("B", "joy", "talk", "A seashell! A real one! I will keep it forever, right next to my cookies."),
    ]),
    S("beach", "dawn", "sun", "The storm clears, and a brand-new lamp arrives from town.", [
      L("N", "warm", "walk", "By morning, the storm was gone, and the sea was calm and sparkling in the sunrise."),
      L("N", "joy", "look", "A delivery truck rolled up to the lighthouse, carrying a big, shiny, brand-new lamp."),
      L("A", "surprised", "talk", "A new lamp? Who sent this? I did not order a new lamp."),
      L("N", "warm", "talk", "The whole town heard how you saved Captain Pebble's boat, so we all chipped in to buy it."),
      L("A", "joy", "dance", "Oh, my goodness. What a lovely surprise! Thank you, everyone!"),
      L("C", "happy", "build", "Let us put it in together. I will hold the ladder, and Gizmo will tighten the bolts."),
      L("B", "joy", "work", "Tighten, tighten, tighten! Only the right bolts, this time. I promise."),
      L("N", "joy", "party", "Together, they lifted the new lamp into place, and it glowed warm and golden in the morning light."),
    ]),
    S("beach", "dusk", "sun", "That evening, the lighthouse shines brighter than ever.", [
      L("N", "warm", "walk", "That evening, the sun set over the calm sea, and the three friends climbed the stairs one more time."),
      L("A", "warm", "talk", "Sam, would you like to switch on the lamp tonight? You earned it."),
      L("C", "joy", "talk", "Me? Really? I would love to! Here we go, one, two, three!"),
      L("N", "joy", "magic", "Click! The new lamp lit up, and a warm golden beam swept across the water, far and wide."),
      L("B", "joy", "dance", "It is beautiful! The best lighthouse in the world! And I did not even have to spin."),
      L("C", "relieved", "talk", "I used to be afraid of the sea. Now I think it is a little bit wonderful."),
      L("A", "warm", "talk", "A little light goes a long way, my dears. Now, who wants cookies?"),
      L("N", "warm", "talk", "And that is the story of the lighthouse that lost its light, and the three friends who found it again. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
