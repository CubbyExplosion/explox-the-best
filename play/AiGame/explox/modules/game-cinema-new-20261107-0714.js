// ─── NEW MOVIE (made automatically): The Night the Moon Lost Its Glow — a space adventure with a brave pilot, a nervous robot and a wise wizard.
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
  title: "The Night the Moon Lost Its Glow", genre: "🌙 Space Adventure", price: 30, bg: "#0b1030", icons: "🌙🚀✨", comedy: true,
  cast: { A: { role: "Captain Nova", kind: "pilot", pers: "hero", move: "ROCKET SPIN", mtype: "spin", fav: "Buckle up, team!", say: "I know, I should check the fuel. I never do." }, B: { role: "Twinkle the Robot", kind: "robot", pers: "nervous", move: "LASER PUNCH", mtype: "punch", fav: "I have a very good bad feeling.", say: "My knees will not stop shaking. They are springs." }, C: { role: "Professor Orbit", kind: "wizard", pers: "wise", move: "SPARKLE BLAST KICK", mtype: "kick", fav: "Think first, launch later.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "🌙 One sleepy moon...", dur: 2200 }, { text: "🚀 One brave little rocket...", dur: 2200 }, { text: "✨ And a night with no light!", dur: 2400 }, { text: "THE NIGHT THE MOON LOST ITS GLOW", dur: 3000 }],
  scenes: [
    S("suburbs", "night", "moon", "One night in Explox, everybody looks up, and the moon is dark.", [
      L("N", "curious", "look", "It was a calm night in Explox, and the whole town looked up at the sky. But something was different."),
      L("B", "shocked", "look", "Captain, look at the moon! It is dark! It has no glow at all!"),
      L("A", "surprised", "look", "That is strange. The moon always shines, even on cloudy nights."),
      L("C", "serious", "write", "Fascinating. The moon is not hidden. It has simply lost its glow."),
      L("B", "scared", "panic", "Without the moon, it is so dark. I have a very good bad feeling about this."),
      L("N", "worried", "look", "All over town, children were asking their parents why the moon was not shining."),
      L("A", "determined", "talk", "Somebody has to find out what is wrong. I say that somebody is us."),
      L("C", "determined", "highfive", "Then we fly to the moon. Think first, launch later. But we must launch quickly!"),
    ]),
    S("airport", "night", "rocket", "At the Space Dock, the team gets ready for a very special flight.", [
      L("N", "excited", "work", "At the Explox Space Dock, the team worked fast to prepare the little silver rocket."),
      L("A", "determined", "work", "Fuel tank full. Wings checked. Seatbelts ready. Everybody on board!"),
      L("B", "worried", "talk", "Captain, I have never been to the moon. What if it is cold? What if there is no air?"),
      L("C", "warm", "talk", "I packed warm blankets and extra space suits. And I brought some glowing star dust, just in case."),
      L("B", "relieved", "talk", "Star dust? That is very smart, Professor. Thank you for thinking of everything."),
      L("A", "excited", "exercise", "Three, two, one, blast off! Next stop, the moon!"),
      L("N", "joy", "fly", "With a mighty roar, the little rocket zoomed into the night sky, leaving a trail of silver sparks."),
      L("B", "shocked", "panic", "We are flying! We are really flying! Please tell my mom I said hi!"),
    ]),
    S("space", "night", "moon", "In space, the rocket meets a funny problem on the way to the moon.", [
      L("N", "curious", "fly", "The rocket flew past a thousand twinkling stars, and a floating, sleepy space snail."),
      L("B", "curious", "look", "Oh look! A space snail! Hello, snail! Are you going to the moon, too?"),
      L("N", "joy", "talk", "The snail waved a slow, sleepy feeler. Everybody is going to the moon tonight, it said."),
      L("A", "surprised", "look", "Everybody? Why is everybody going to the moon?"),
      L("C", "curious", "look", "Look ahead, Captain. A whole line of tiny, glowing rockets, all heading in the same direction."),
      L("N", "surprised", "fly", "Hundreds of little ships from every corner of the galaxy were flying toward the dark moon."),
      L("A", "determined", "fly", "Something very special is going on. Hold on tight, team. Let us see what it is."),
      L("B", "worried", "talk", "I have a very good bad feeling about this. And also a very good good feeling. It is confusing."),
    ]),
    S("space", "night", "moon", "At last, the team lands on the dark moon, and makes a surprising discovery.", [
      L("N", "joy", "fly", "Finally, the little rocket landed softly on the gray, dusty surface of the dark moon."),
      L("A", "curious", "walk", "Everybody, step carefully. The moon is not as bright as it should be."),
      L("B", "scared", "sneak", "It is so quiet. And so dark. Is there anybody here?"),
      L("N", "surprised", "look", "Suddenly, a soft, sleepy yawn echoed across the moon, from somewhere deep underground."),
      L("C", "surprised", "look", "Did you hear that? It sounds like somebody is sleeping, down in that big crater."),
      L("A", "curious", "climb", "Let us look inside the crater, carefully. And quietly."),
      L("N", "surprised", "look", "At the bottom of the crater, a big, round, gray face was snoring, with a tiny nightcap on its head."),
      L("B", "shocked", "look", "It is the Moon! The Moon itself! And it is fast asleep!"),
    ]),
    S("space", "night", "moon", "The sleepy Moon explains why its glow has gone out.", [
      L("A", "warm", "talk", "Excuse me, Mister Moon? Are you awake? Can we talk to you for a moment?"),
      L("N", "sad", "talk", "The big gray face opened one sleepy eye. I am so tired. I have been shining every night for a billion years."),
      L("N", "sad", "talk", "I was very sleepy, so I put on my nightcap and turned off my glow, just for tonight."),
      L("C", "curious", "talk", "But Moon, the whole world is looking up at you. Everybody is wondering why you are dark."),
      L("N", "sad", "talk", "Really? I did not know anybody noticed. I thought nobody cared whether I shone or not."),
      L("B", "warm", "talk", "Everybody cares about you, Moon! Children say good night to you every evening."),
      L("A", "warm", "talk", "That is why all the little ships came here. They want to see you shine again."),
      L("N", "relieved", "look", "The Moon looked out of the crater, and saw the thousands of tiny rockets, hovering in the dark."),
    ]),
    S("space", "night", "moon", "The team has an idea to help the tired Moon feel better.", [
      L("C", "warm", "talk", "Moon, you are tired, and that is perfectly fine. Everybody needs rest, even the moon."),
      L("A", "determined", "talk", "What if we help you? A little rest, a little music, and a little star dust."),
      L("B", "excited", "jump", "I know a lullaby! My mother used to sing it. It goes la la la, sleepy moon, la la la."),
      L("N", "warm", "sing", "Twinkle sang the soft little lullaby, and all the tiny rockets hummed along, one by one."),
      L("C", "warm", "magic", "And now, a sprinkle of star dust, to give you a little energy. One, two, three."),
      L("N", "joy", "magic", "The glowing dust floated down onto the Moon's cheeks, and sparkled like tiny silver snow."),
      L("N", "relieved", "talk", "Ahh. That feels so cozy. A little nap, and then I will be ready to shine."),
      L("A", "warm", "talk", "Take all the time you need, Moon. We will watch over you."),
    ]),
    S("space", "night", "moon", "While the Moon rests, the team keeps guard and the lights twinkle.", [
      L("N", "warm", "camp", "While the Moon took a little nap, the team sat in a circle of tiny, glowing lanterns."),
      L("B", "happy", "eat", "Space crackers! I brought a whole box. Would anybody like one?"),
      L("A", "happy", "eat", "Delicious. And look at the stars. They are even brighter without the moon."),
      L("C", "warm", "talk", "Sometimes, the dark helps us see the little lights that we usually miss."),
      L("N", "warm", "photo", "Hundreds of little ships hovered above, and their windows glowed like fireflies in the night."),
      L("B", "joy", "dance", "It is the most beautiful night I have ever seen. And I am not even scared anymore!"),
      L("A", "joy", "highfive", "Great teamwork, everybody. Hush now, here comes the Moon."),
      L("N", "joy", "look", "Slowly, a warm, silvery glow began to spread across the Moon's gray face."),
    ]),
    S("space", "night", "moon", "The Moon wakes up, and shines brighter than ever before.", [
      L("N", "joy", "magic", "The glow spread from the Moon's cheeks to its nose, and then all across the crater, bright and silver."),
      L("N", "joy", "bubbles", "The Moon yawned and stretched, and a thousand tiny sparkles floated up into space."),
      L("N", "joy", "talk", "Thank you, my friends. I feel brand new. I will shine for you, every single night."),
      L("A", "joy", "party", "Hooray! The moon is shining again! Everybody, cheer!"),
      L("B", "joy", "jump", "Hooray! Wheee! I am so happy, I could dance on the ceiling!"),
      L("C", "joy", "magic", "A little glow for everyone. Think first, launch later, and always be kind."),
      L("N", "joy", "fly", "All the tiny rockets did a happy loop around the Moon, and then flew home."),
      L("A", "warm", "talk", "Time to fly home, team. The whole town is waiting to see the moon."),
    ]),
    S("suburbs", "night", "moon", "Back in Explox, the whole town cheers under a shining moon.", [
      L("N", "warm", "fly", "The little silver rocket glided back to Explox, as the bright, silvery moon lit up the whole sky."),
      L("N", "joy", "party", "In the town below, children waved and cheered, and the whole city lit up with happy lanterns."),
      L("B", "joy", "dance", "Look, everybody is waving at us! We are heroes! I am a hero robot!"),
      L("C", "warm", "talk", "We helped the Moon rest, and the Moon helped us see how many friends we have."),
      L("A", "warm", "talk", "Everybody needs a little rest sometimes, even the brightest light in the sky."),
      L("N", "warm", "photo", "And as they landed, the three friends looked up and waved at the Moon, which winked back."),
      L("A", "joy", "highfive", "Good night, Moon. Sleep tight, and shine bright."),
      L("N", "warm", "talk", "And that is the night the moon lost its glow, and found out how much everybody loved it. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
