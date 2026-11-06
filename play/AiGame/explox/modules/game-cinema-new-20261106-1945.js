// ─── NEW MOVIE (made automatically): The Secret of the Singing Shell — a beach adventure with a young sailor, a goofy sea robot and a wise grandma.
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
  title: "The Secret of the Singing Shell", genre: "🐚 Beach Adventure", price: 30, bg: "#0e3a4a", icons: "🐚🌊🎶", comedy: true,
  cast: { A: { role: "Skipper Sam", kind: "hero", pers: "hero", move: "LASSO SPIN", mtype: "spin", fav: "Sail on, friends!", say: "I know, I should check the tide chart. I never do." }, B: { role: "Sandy the Sea-Bot", kind: "robot", pers: "goof", move: "WHISK TORNADO", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, I got seaweed in my circuits again." }, C: { role: "Granny Marina", kind: "grandma", pers: "wise", move: "ROLLING PIN SMASH", mtype: "punch", fav: "Listen first, sail later.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "🐚 One magic shell...", dur: 2200 }, { text: "🎶 One lovely song...", dur: 2200 }, { text: "🐦 And one very sneaky seagull!", dur: 2400 }, { text: "THE SECRET OF THE SINGING SHELL", dur: 3000 }],
  scenes: [
    S("beach", "dawn", "sun", "At sunrise, Granny Marina shows Skipper Sam a very special shell on the beach.", [
      L("N", "warm", "walk", "It was early morning on Explox Beach, and the sea was calm and golden."),
      L("C", "warm", "walk", "Good morning, Sam. Good morning, Sandy. I have something special to show you."),
      L("N", "curious", "look", "From a little wooden box, Granny Marina pulled out a big, pearly pink shell."),
      L("A", "surprised", "look", "Wow, Granny! It is the biggest shell I have ever seen. What does it do?"),
      L("C", "warm", "talk", "Hold it to your ear, Sam, and listen carefully."),
      L("N", "joy", "sing", "From inside the shell came a soft, lovely song, like a whisper from the sea."),
      L("B", "shocked", "look", "It is singing! A shell that sings! My circuits just did a little dance."),
      L("C", "warm", "talk", "It is the Singing Shell. It sings only at dawn, and it keeps the sea calm."),
    ]),
    S("beach", "day", "sun", "Disaster! A sneaky seagull swoops in and grabs the shell.", [
      L("N", "happy", "walk", "The three friends sat on the sand, listening to the song and eating a picnic breakfast."),
      L("B", "joy", "eat", "Sandwiches! Pancakes! Jam! This is the best breakfast ever!"),
      L("N", "worried", "look", "But high above them, a big, gray seagull circled round and round, eyeing the shiny shell."),
      L("A", "curious", "look", "Granny, I think that seagull is watching us. And it looks very hungry."),
      L("N", "shocked", "fly", "In a flash, the seagull dived down, snatched the shell in its beak and flapped away over the waves."),
      L("C", "shocked", "panic", "My shell! The Singing Shell! Without it, the sea will get very wild!"),
      L("B", "shocked", "run", "Stop, seagull! Give it back! That belongs to Granny!"),
      L("A", "determined", "run", "Quick, to the boat! We must follow that seagull!"),
    ]),
    S("beach", "day", "sun", "The friends set sail across the sparkling sea in a small wooden boat.", [
      L("N", "excited", "fish", "The little wooden boat bobbed on the waves, with its white sail puffing in the wind."),
      L("A", "determined", "work", "Sandy, you take the sail, and I will steer. Granny, you watch for the seagull."),
      L("B", "excited", "work", "Aye aye, captain! I am pulling the rope with all my robot arms!"),
      L("C", "curious", "look", "There! I can see him, a gray dot in the sky, heading for Seashell Island."),
      L("N", "worried", "look", "But the waves were getting bigger, and the sky began to turn a stormy gray."),
      L("A", "worried", "look", "Granny, the sea is getting wild. Is it because the shell is gone?"),
      L("C", "serious", "talk", "Yes, Sam. The song kept the sea calm. Without it, the waves will keep growing."),
      L("B", "scared", "panic", "Oh no, oh no! My gears are getting wet! Hold on, everybody!"),
    ]),
    S("beach", "dusk", "bolt", "A big wave nearly flips the boat, and the friends use teamwork.", [
      L("N", "shocked", "panic", "A huge wave rose up in front of the boat, as tall as a house, and rolled right toward them."),
      L("A", "shocked", "panic", "Everybody, lean to the left! Sandy, turn the sail! Granny, hold the rope!"),
      L("B", "determined", "work", "Turning the sail! One, two, three, turn! My arms are spinning like a whisk!"),
      L("C", "determined", "tugwar", "Pulling the rope! I used to be the strongest sailor in the whole bay!"),
      L("N", "relieved", "bubbles", "The little boat tipped, tilted and slid over the top of the wave, spraying bubbles in every direction."),
      L("A", "joy", "highfive", "We did it! Teamwork! Granny, you are an amazing sailor!"),
      L("C", "joy", "talk", "Listen first, sail later. Now, let us find that seagull."),
      L("B", "relieved", "talk", "Beep. My circuits are soggy, but I am fine. And look, an island!"),
    ]),
    S("beach", "dusk", "moon", "On Seashell Island, the friends find the seagull, and a surprising secret.", [
      L("N", "curious", "sneak", "On the shore of Seashell Island, hundreds of shells sparkled in the evening light."),
      L("A", "curious", "sneak", "Quietly, everyone. Let us look for the seagull. And the shell."),
      L("B", "curious", "look", "Oh look! There is the gray seagull! He is sitting on a big rock, next to a nest."),
      L("N", "surprised", "look", "In the nest, three fluffy baby seagulls were crying and shivering in the wind."),
      L("C", "surprised", "look", "Oh my. The seagull did not steal the shell for himself. He took it for his babies."),
      L("N", "sad", "talk", "The big seagull put the shell next to the nest, and the chicks nuzzled it. They were afraid of the storm."),
      L("A", "warm", "talk", "The babies were scared, and the shell makes them feel safe. That is why he took it."),
      L("B", "warm", "talk", "That is not stealing. That is borrowing, with a very big beak."),
    ]),
    S("beach", "night", "moon", "Granny Marina has a wise idea about how to solve the problem.", [
      L("C", "warm", "talk", "Mister Seagull, you could have asked. We would have gladly shared the shell."),
      L("N", "sad", "talk", "The seagull dipped his head. I did not know how to ask. I do not speak human."),
      L("A", "curious", "write", "Granny, the shell sings only at dawn. But the storm is now. How can we calm the sea?"),
      L("C", "determined", "talk", "A song does not have to come from a shell, Sam. Anybody can sing a song."),
      L("B", "excited", "talk", "I know! We will sing the shell's song ourselves! I have a whole choir in my memory!"),
      L("A", "joy", "sing", "Everybody together! La la la, calm the sea. La la la, sleep, baby seagulls."),
      L("N", "joy", "sing", "The three friends and the big seagull sang the lullaby together, softly under the stars."),
      L("N", "relieved", "magic", "Slowly, the waves grew calm, and the clouds drifted away, and the moon came out."),
    ]),
    S("beach", "dawn", "sun", "At sunrise, the Singing Shell sings once more, and the seagull finds a new friend.", [
      L("N", "warm", "walk", "The next morning, as the sun rose over Seashell Island, the shell began to sing again."),
      L("N", "joy", "sing", "Its lovely song floated over the water, and the sea was as smooth as glass."),
      L("C", "warm", "talk", "Mister Seagull, you and your family may borrow the shell any time you need it."),
      L("N", "joy", "dance", "The big seagull flapped his wings with joy, and the three baby seagulls squeaked with happiness."),
      L("B", "joy", "photo", "Everybody say squawk! Click! A picture of the best seagull family in the world!"),
      L("A", "joy", "highfive", "Skipper Sam and crew, mission accomplished. Time to sail home!"),
      L("N", "joy", "party", "On the sail home, the big seagull flew beside the boat, all the way back to Explox Beach."),
    ]),
    S("beach", "dusk", "sun", "Back on Explox Beach, the friends celebrate with a sunset party.", [
      L("N", "joy", "party", "That evening, the friends threw a sunset beach party, with music and a little bonfire."),
      L("B", "joy", "dance", "Beep, boop, beach party! My dance moves are made of waves!"),
      L("C", "warm", "cook", "Granny's famous seashell cookies! Fresh from the oven, with a pinch of sea salt."),
      L("A", "joy", "eat", "Delicious! Granny, you are the best cook and the best sailor in Explox."),
      L("N", "warm", "camp", "They sat around the fire, watching the stars come out, while the shell hummed a quiet tune."),
      L("C", "warm", "talk", "Listen first, sail later. And sometimes, a thief is just a friend who forgot to ask."),
      L("N", "warm", "talk", "And that is the secret of the singing shell. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
