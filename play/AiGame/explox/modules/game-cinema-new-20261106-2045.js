// ─── NEW MOVIE (made automatically): The Little Robot Who Missed Home — a heartwarming adventure with a lost little robot, a kind cat and a wise inventor grandma.
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
  title: "The Little Robot Who Missed Home", genre: "🤖 Heartwarming Adventure", price: 30, bg: "#1f2d3a", icons: "🤖🏠💛", comedy: false,
  cast: { A: { role: "Tinker the Robot", kind: "robot", pers: "nervous", move: "LASER PUNCH", mtype: "punch", fav: "I have a very good bad feeling.", say: "My heart is made of copper, but it still hurts." }, B: { role: "Mittens the Cat", kind: "cat", pers: "goof", move: "CLAW FLURRY", mtype: "kick", fav: "Is there a snack involved?", say: "Sorry, I got distracted by a butterfly again." }, C: { role: "Grandma Wren", kind: "grandma", pers: "wise", move: "ROLLING PIN SMASH", mtype: "punch", fav: "Love fixes everything.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "🤖 One lost little robot...", dur: 2200 }, { text: "🐱 One very loyal friend...", dur: 2200 }, { text: "🏠 And a home he has never forgotten!", dur: 2400 }, { text: "THE LITTLE ROBOT WHO MISSED HOME", dur: 3000 }],
  scenes: [
    S("scrapyard", "dusk", "lantern", "In a lonely scrapyard, a little robot sits alone and watches the sun go down.", [
      L("N", "sad", "walk", "At the edge of the old scrapyard, a very small robot sat on a rusty barrel, watching the sun set."),
      L("A", "sad", "talk", "I used to live in a little blue house with a bright red door. I remember the smell of cookies."),
      L("N", "sad", "look", "The little robot looked at the first star that appeared in the sky, and his eyes glowed a soft, sad blue."),
      L("A", "sad", "talk", "My name is Tinker. I do not know how I got here. I only know that I miss my home so much."),
      L("N", "warm", "look", "From behind a pile of old tires, a small orange cat crept out and sat down beside the robot."),
      L("B", "warm", "talk", "Hello, rusty friend. You look very sad. Would you like to share my fish crackers?"),
      L("A", "relieved", "talk", "Thank you. That is very kind. Nobody has shared a cracker with me in a very long time."),
      L("B", "warm", "eat", "My name is Mittens. And I think you need a friend more than you need a cracker."),
    ]),
    S("scrapyard", "night", "moon", "Mittens decides to help Tinker find the little blue house.", [
      L("B", "curious", "talk", "Tell me everything about the little blue house, Tinker. Maybe I know where it is."),
      L("A", "warm", "talk", "It had a red door, a garden with sunflowers and a window that glowed yellow at night."),
      L("B", "excited", "jump", "A garden with sunflowers! I know that garden! It is on the other side of Explox, near the park."),
      L("A", "surprised", "look", "Really? You know where it is? Could you take me there?"),
      L("B", "joy", "highfive", "Of course I can! Cats know every street in town. Follow me, Tinker!"),
      L("N", "warm", "walk", "And so, under the quiet moon, a little robot and a little cat set out across the city."),
      L("A", "worried", "talk", "What if she does not remember me, Mittens? What if she does not want me anymore?"),
      L("B", "warm", "talk", "Friends do not forget friends. Not ever. Come on, one step at a time."),
    ]),
    S("city", "night", "lantern", "The city streets are big, and Tinker feels very small.", [
      L("N", "worried", "walk", "The streets of Explox were bright and loud, with cars, buses and thousands of lights."),
      L("A", "scared", "panic", "It is so loud, and so big. I am only a little robot. What if I get lost again?"),
      L("B", "warm", "talk", "I will stay right beside you, Tinker. If you get lost, I will find you. I promise."),
      L("N", "scared", "run", "Just then, a huge truck rumbled past, and its horn made Tinker jump, with all his little gears."),
      L("A", "shocked", "panic", "Oh! My circuits! That was very, very loud!"),
      L("B", "warm", "talk", "It is only a truck, Tinker. It is gone now. Take a deep breath, a slow one."),
      L("A", "relieved", "talk", "One breath in, one breath out. You are right, Mittens. I feel a little better."),
      L("N", "warm", "walk", "Slowly, side by side, the two friends crossed the busy street together."),
    ]),
    S("park", "night", "moon", "In the park, the friends take a rest, and Tinker shares a memory.", [
      L("N", "warm", "walk", "In the quiet park, the two friends sat on a bench under a big old tree, and watched the moon."),
      L("A", "sad", "talk", "I remember a hand, Mittens. A warm, wrinkled hand that polished my head every morning."),
      L("B", "warm", "talk", "That sounds like a very kind hand."),
      L("A", "sad", "talk", "It also hummed a song. A soft little song, like a lullaby. Hmm hmm hmm hmm."),
      L("N", "warm", "sing", "The little robot hummed the tune, and the sound floated softly across the dark park."),
      L("B", "surprised", "look", "That song, Tinker. I have heard it before. It is coming from the end of the street!"),
      L("A", "surprised", "look", "From the end of the street? It cannot be. Mittens, do you hear it too?"),
      L("N", "joy", "walk", "Very faintly, the same lullaby drifted through the night, and the little robot's heart began to race."),
    ]),
    S("suburbs", "night", "house", "At the end of the quiet street, they find a little blue house.", [
      L("N", "excited", "run", "Tinker and Mittens ran down the street, following the soft and gentle song."),
      L("N", "surprised", "look", "And there it was: a little blue house, with a bright red door and a garden of golden sunflowers."),
      L("A", "shocked", "look", "That is it, Mittens. That is my house. I remember the red door. I remember every sunflower."),
      L("B", "joy", "look", "We found it! We really found it! Tinker, go and knock!"),
      L("A", "scared", "panic", "I cannot do it. What if she is not there? What if she does not know who I am?"),
      L("B", "warm", "talk", "Then I will knock with you. We will do it together, paw in claw."),
      L("N", "warm", "sneak", "Slowly, side by side, the two friends walked up the little path to the red door."),
      L("A", "worried", "talk", "One, two, three. Knock, knock, knock."),
    ]),
    S("house", "night", "lantern", "The door opens, and a very emotional moment begins.", [
      L("N", "curious", "look", "The door creaked open slowly, and warm yellow light spilled out into the garden."),
      L("N", "surprised", "look", "In the doorway stood a small, kind grandmother with silver hair and glasses on her nose."),
      L("C", "shocked", "look", "Tinker? Is it really you? My little Tinker?"),
      L("A", "sad", "talk", "Grandma Wren? You are the one who hummed the song. You are the warm hand."),
      L("C", "sad", "talk", "I built you with my own hands, and I looked for you every day since the night you went missing."),
      L("N", "sad", "talk", "A gentle tear rolled down Grandma Wren's cheek, and her voice trembled like a leaf."),
      L("A", "relieved", "talk", "I looked for you, too, Grandma. Every day. I never stopped missing you."),
      L("N", "warm", "highfive", "And without another word, the little robot rushed into her arms, and she hugged him tightly."),
    ]),
    S("house", "night", "lantern", "Inside the little house, Grandma Wren tells the story of the lost night.", [
      L("N", "warm", "walk", "Inside, the little house was warm and cozy, and it smelled just like freshly baked cookies."),
      L("C", "warm", "talk", "That night, there was a big storm, and a gust of wind blew the garden gate open."),
      L("C", "sad", "talk", "You went out to close it, and the wind carried you away, all the way to the scrapyard."),
      L("A", "sad", "talk", "I was so scared, Grandma. And so alone. I thought you had forgotten me."),
      L("C", "warm", "talk", "I could never forget you, Tinker. Not for a single minute. You are my favorite invention."),
      L("A", "relieved", "talk", "And Mittens found me, and became my friend, and showed me the way home."),
      L("C", "warm", "talk", "Then Mittens is a hero. Thank you, Mittens, from the bottom of my heart."),
      L("B", "warm", "eat", "Oh, it was nothing. Well, it was a little bit of something. Is there any chance of a cookie?"),
    ]),
    S("house", "dawn", "sun", "At sunrise, the three friends begin a new, happy chapter together.", [
      L("N", "joy", "walk", "The next morning, the sun rose over the little blue house, and the sunflowers turned to greet it."),
      L("C", "joy", "cook", "Cookies for breakfast, to celebrate! Chocolate chip, Tinker's favorite."),
      L("A", "joy", "eat", "They taste exactly like I remembered. Warm and sweet and full of love."),
      L("B", "joy", "dance", "And a saucer of milk for the bravest cat in Explox!"),
      L("C", "warm", "talk", "Mittens, would you like to stay with us? There is a nice sunny spot by the window, just for you."),
      L("B", "joy", "jump", "A sunny spot? A real home? Yes, yes, yes! I would love to!"),
      L("A", "joy", "highfive", "Now we are a family. Home is not just a house. Home is the people who love you."),
      L("N", "warm", "talk", "And that is how a little robot who missed home found his way back, with a friend by his side. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
