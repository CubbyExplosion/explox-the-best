// ─── NEW MOVIE (made automatically): The Space Station Sleepover — a space comedy with a brave captain, a goofy alien and a nervous kid.
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
  title: "The Space Station Sleepover", genre: "🚀 Space Comedy", price: 30, bg: "#14183a", icons: "🚀🌙👽", comedy: true,
  cast: { A: { role: "Captain Nova", kind: "astronaut", pers: "hero", move: "STAR SPIN KICK", mtype: "kick", fav: "Ready for liftoff!", say: "I always check the snacks before the engines." }, B: { role: "Blip the Alien", kind: "alien", pers: "goof", move: "WIGGLE BOP", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, my antenna sneezed." }, C: { role: "Little Milo", kind: "hero", pers: "nervous", move: "PILLOW SMASH", mtype: "punch", fav: "I have a very good bad feeling.", say: "I forgot my teddy bear. Again." } },
  trailer: [{ text: "🚀 One space station...", dur: 2200 }, { text: "👽 One very silly alien...", dur: 2200 }, { text: "🌙 And the biggest sleepover ever!", dur: 2400 }, { text: "THE SPACE STATION SLEEPOVER", dur: 3000 }],
  scenes: [
    S("space", "night", "star", "Captain Nova invites a nervous boy to the first sleepover on the space station.", [
      L("N", "warm", "walk", "High above Explox, the Star Station floated among the glittering stars."),
      L("A", "happy", "talk", "Welcome aboard, Milo! Tonight is the very first sleepover in space."),
      L("C", "worried", "look", "Wow, it is so big. And so quiet. And so far from my bed."),
      L("B", "joy", "dance", "Hello, Milo! I am Blip! I come from the planet Gloop. I love sleepovers!"),
      L("C", "surprised", "look", "You are green. And you have three eyes. And one of them is looking at my shoes."),
      L("B", "joy", "talk", "It is a friendly eye. It likes shoes. Wiggle, wiggle."),
      L("A", "warm", "talk", "Do not worry, Milo. We have snacks, games and a big window to watch the stars."),
      L("C", "relieved", "talk", "Okay. Maybe this will be fun. If nothing goes wrong."),
    ]),
    S("space", "night", "star", "The friends play games and eat space snacks.", [
      L("N", "joy", "party", "First, the three friends held a floating snack party in the middle of the room."),
      L("B", "excited", "eat", "Look, I can catch a cookie with my mouth while I spin upside down!"),
      L("C", "joy", "juggle", "I can juggle three space grapes. Look, they never fall in space!"),
      L("A", "joy", "juggle", "Nice one, Milo! Floating juggling is the best kind of juggling."),
      L("N", "joy", "dance", "Then they played music, and floated around the room in a silly zero gravity dance."),
      L("B", "joy", "dance", "My antenna is dancing too! Boing, boing!"),
      L("C", "happy", "dance", "I am not scared at all anymore. This is the best night ever."),
      L("A", "warm", "highfive", "That is the spirit. Now, let us build a blanket fort."),
    ]),
    S("space", "night", "heart", "Milo discovers he forgot his teddy bear and feels sad.", [
      L("N", "warm", "build", "They made a cozy fort out of soft space blankets, with twinkling lights inside."),
      L("C", "sad", "look", "Oh no. I forgot Teddy. I cannot sleep without Teddy."),
      L("A", "warm", "talk", "That is okay, Milo. Lots of astronauts miss something from home."),
      L("B", "worried", "talk", "I miss my pet space slug, Gerald. He is slimy, but he gives great hugs."),
      L("C", "sad", "talk", "I just feel a little bit small, out here in the big dark sky."),
      L("A", "warm", "talk", "Look out the window, Milo. The stars are like little night lights."),
      L("N", "warm", "look", "Milo looked out, and saw millions of tiny glowing lights, shining just for him."),
      L("C", "relieved", "look", "They are pretty. But I still wish I had a teddy bear."),
    ]),
    S("space", "night", "bolt", "Strange bumps in the night make everyone jump.", [
      L("N", "serious", "sneak", "Just as they got sleepy, a loud thump echoed through the station."),
      L("C", "scared", "panic", "What was that? I have a very good bad feeling about this!"),
      L("B", "scared", "panic", "It was not me! Well, maybe a little bit me. I fell off the ceiling."),
      L("N", "curious", "sneak", "Thump, thump, thump. The noise was coming from the storage room."),
      L("A", "serious", "sneak", "Stay behind me, team. I will open the door slowly."),
      L("N", "surprised", "look", "The door slid open, and a small, fluffy, pink blob floated out."),
      L("B", "shocked", "look", "Gerald! My pet space slug! He followed me here!"),
      L("C", "surprised", "look", "That is the thumping? It is just a fluffy pink slug?"),
    ]),
    S("space", "night", "star", "Gerald has a surprise that makes Milo laugh.", [
      L("B", "joy", "dance", "Gerald, you silly slug! You hid in my suitcase, didn't you?"),
      L("N", "joy", "look", "Gerald wiggled, and then he pulled something from behind his back."),
      L("N", "surprised", "look", "It was a small, soft brown teddy bear, with a tiny astronaut helmet."),
      L("C", "shocked", "look", "That is Teddy! He hid in my bag, and Gerald found him!"),
      L("C", "joy", "dance", "Thank you, Gerald! You are the best slug in the whole galaxy!"),
      L("B", "joy", "highfive", "Gerald says you are welcome. He says it with a squish."),
      L("A", "joy", "talk", "A teddy bear and a space slug. This sleepover is getting better and better."),
      L("N", "warm", "photo", "Everyone gathered close for a photo, with Gerald floating on top."),
    ]),
    S("space", "night", "bolt", "Trouble: Gerald nibbles a button, and the station starts to spin.", [
      L("N", "worried", "look", "But Gerald was hungry, and he nibbled a big red button on the control panel."),
      L("A", "shocked", "look", "Oh no, that button controls the station spin! We are going round and round!"),
      L("N", "worried", "panic", "The whole room began to spin, and blankets, cookies and teddy bears flew everywhere."),
      L("B", "joy", "dance", "Wheee! This is the best amusement ride ever! Spin, spin, spin!"),
      L("C", "scared", "panic", "I do not like spinning! I feel like a tumbling sock!"),
      L("A", "determined", "run", "Stay calm, team. I need someone to press the blue button on the control panel."),
      L("C", "determined", "climb", "I will do it, Captain! Teddy gives me courage!"),
      L("N", "excited", "climb", "Milo held Teddy tight, and climbed slowly along the wall, toward the blue button."),
    ]),
    S("space", "night", "bolt", "Milo saves the day with one brave press.", [
      L("A", "determined", "talk", "You can do it, Milo! Just a few more steps!"),
      L("B", "excited", "talk", "Go, Milo, go! Gerald is cheering too! Squish, squish!"),
      L("C", "worried", "climb", "Almost there. My hands are shaky. But I am not giving up."),
      L("N", "excited", "climb", "Milo stretched out his hand, and pressed the big blue button with all his might."),
      L("N", "relieved", "magic", "Whirrr. Slowly, the station stopped spinning, and everything floated softly back into place."),
      L("A", "relieved", "highfive", "Well done, Milo! You are a real space hero!"),
      L("B", "joy", "dance", "Hooray for Milo! And for Gerald, who is a little bit sorry."),
      L("C", "joy", "jump", "I did it! I was scared, but I did it anyway!"),
    ]),
    S("space", "dawn", "sun", "Morning arrives, and everyone gets a special badge.", [
      L("N", "warm", "walk", "When morning came, the sun rose over the blue curve of the planet below."),
      L("A", "warm", "talk", "Milo, for your bravery, I name you Junior Space Hero of the Star Station."),
      L("N", "joy", "photo", "Captain Nova pinned a shiny star badge on his space suit."),
      L("C", "joy", "dance", "A real badge! I will keep it forever, next to Teddy!"),
      L("B", "joy", "eat", "And I have a badge for Gerald too. It says, Best Snack Finder."),
      L("N", "joy", "party", "They had pancakes for breakfast, floating in the air, and laughed until their tummies hurt."),
      L("A", "warm", "talk", "Ready for liftoff, everyone. Time to go home."),
      L("C", "happy", "talk", "Thank you for the best sleepover ever. Can we do it again next week?"),
    ]),
    S("space", "day", "star", "The friends head home with new memories.", [
      L("N", "warm", "fly", "The little rocket carried the friends back toward the glowing blue planet."),
      L("B", "joy", "dance", "Goodbye, Star Station! Goodbye, stars! Goodbye, big dark sky!"),
      L("C", "warm", "talk", "It was not so big and dark after all. It was full of friends."),
      L("A", "warm", "talk", "That is right, Milo. Space is only lonely when you are alone."),
      L("N", "joy", "highfive", "The three friends and one sleepy slug gave each other a big space high five."),
      L("B", "joy", "talk", "I have a very good good feeling about next time!"),
      L("N", "warm", "photo", "And as the rocket landed softly in Explox, the stars winked goodnight."),
      L("N", "warm", "talk", "And that is the story of the space station sleepover. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
