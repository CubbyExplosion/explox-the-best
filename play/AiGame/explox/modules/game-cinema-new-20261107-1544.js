// ─── NEW MOVIE (made automatically): The Night at the Explox Museum — a magical museum comedy with a brave night guard, a goofy dino and a shy ghost.
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
  title: "The Night at the Explox Museum", genre: "🏛️ Museum Magic Comedy", price: 30, bg: "#2a2a3a", icons: "🏛️🦖🖼️", comedy: true,
  cast: { A: { role: "Night Guard Nora", kind: "hero", pers: "hero", move: "FLASHLIGHT FLASH", mtype: "kick", fav: "Stay calm and look closer.", say: "I know, I should sleep during the day. I never do." }, B: { role: "Rex the Dino Skeleton", kind: "dino", pers: "goof", move: "BONE ROLL", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, my ribs rattled again." }, C: { role: "Penny the Painting Ghost", kind: "ghost", pers: "nervous", move: "SPOOKY SPIN", mtype: "spin", fav: "I have a very good bad feeling.", say: "I get shy when too many people look at me." } },
  trailer: [{ text: "🏛️ One quiet museum...", dur: 2200 }, { text: "🦖 One dinosaur that wakes up...", dur: 2200 }, { text: "🖼️ And a very shy painting!", dur: 2400 }, { text: "THE NIGHT AT THE EXPLOX MUSEUM", dur: 3000 }],
  scenes: [
    S("library", "dusk", "book", "Nora starts her first night shift at the Explox Museum.", [
      L("N", "warm", "walk", "As the sun set, the big stone Explox Museum grew quiet, and the last visitors went home."),
      L("A", "happy", "walk", "Hello, museum! I am Nora, the new night guard. Tonight is my very first night shift!"),
      L("A", "curious", "look", "Let me check my list. Lock the doors, turn on the night lights, and walk around the halls."),
      L("N", "warm", "walk", "Nora walked past the old paintings, the shiny armor and the giant dinosaur skeleton in the main hall."),
      L("A", "warm", "talk", "Goodnight, Rex the Dinosaur. Goodnight, paintings. See you in the morning."),
      L("N", "curious", "look", "She sat at the front desk, with a cup of hot cocoa and a flashlight, and opened a book."),
      L("A", "relieved", "eat", "A quiet night in a quiet museum. This is going to be easy."),
      L("N", "surprised", "look", "But just then, from the main hall, there came a loud and rattling clack, clack, clack."),
    ]),
    S("library", "night", "lantern", "The dinosaur skeleton wakes up, in a very funny way.", [
      L("A", "worried", "sneak", "What was that? Hello? Is somebody there?"),
      L("N", "surprised", "sneak", "Nora tiptoed into the main hall, her flashlight beam sweeping across the dark floor."),
      L("N", "shocked", "look", "And there, in the middle of the hall, the giant dinosaur skeleton was stretching, clack, clack, clack."),
      L("B", "joy", "dance", "Oh, hello! Good evening! I am Rex! I always wake up at night to stretch my bones!"),
      L("A", "shocked", "panic", "A talking dinosaur skeleton! This is impossible! I must be dreaming!"),
      L("B", "joy", "talk", "You are not dreaming! Every night, the museum wakes up, and the exhibits come alive!"),
      L("A", "curious", "talk", "The exhibits come alive? But why did nobody tell me?"),
      L("B", "joy", "dance", "It is a secret! But you look nice, so I will let you in. Welcome to the night shift, Nora!"),
    ]),
    S("library", "night", "lantern", "Rex gives Nora a tour, with a very funny problem.", [
      L("N", "joy", "walk", "Rex led Nora through the halls, rattling happily, showing her all the wonders of the night museum."),
      L("B", "joy", "talk", "This is the armor of Sir Clank, who loves to tell jokes. And this is the Egyptian cat statue, who loves to nap."),
      L("N", "joy", "look", "The suit of armor waved, and the stone cat yawned, and a stuffed owl hooted a friendly hello."),
      L("A", "joy", "talk", "This is the most amazing museum in the whole world! I never want to go home!"),
      L("B", "worried", "look", "But there is one problem. Somebody is missing from the picture gallery, and she is a little shy."),
      L("A", "curious", "talk", "Missing? Who is missing? And how can a picture go missing?"),
      L("B", "worried", "talk", "It is Penny, the lady from the big flower painting. She did not come out tonight, and I am worried."),
      L("A", "determined", "talk", "Let us go and find her. Stay calm and look closer. Come on, Rex!"),
    ]),
    S("library", "night", "star", "At the picture gallery, they find an empty frame, and a clue.", [
      L("N", "curious", "sneak", "In the quiet picture gallery, the big flower painting hung on the wall, with nobody inside."),
      L("A", "curious", "look", "The frame is empty. Only the flowers and the garden are left. Where could Penny be?"),
      L("B", "worried", "look", "She is very shy. Maybe she is hiding because of a new visitor. That is you, Nora."),
      L("A", "surprised", "look", "Me? But I would never frighten anyone!"),
      L("N", "curious", "look", "Then, from behind a tall velvet curtain, there came a tiny, trembling, sniffly sound."),
      L("C", "scared", "talk", "Please do not look at me. I get very shy when too many people look at me."),
      L("A", "warm", "talk", "Hello, Penny. I am Nora. I will not look. I will just sit and talk, if you like."),
      L("B", "warm", "talk", "She is a very nice ghost. She only wants a friend, and a little courage."),
    ]),
    S("library", "night", "heart", "Nora and Penny talk, and a gentle idea appears.", [
      L("N", "warm", "walk", "Nora sat down on the floor, a little distance from the curtain, and put her flashlight away."),
      L("A", "warm", "talk", "I am new here, Penny. And I was a little scared, too, when I started tonight."),
      L("C", "worried", "talk", "You were? But you are the night guard. You are so brave."),
      L("A", "warm", "talk", "I was scared of the dark, and the big halls, and the strange noises. But then I met Rex."),
      L("B", "joy", "dance", "And now we are friends! Because I rattle, and she guards, and together we make a team!"),
      L("C", "relieved", "talk", "I always stay in my frame, because I am afraid of what people will say about me."),
      L("A", "warm", "talk", "Penny, you are a lovely painting, and a lovely ghost. Nobody here is going to say anything unkind."),
      L("N", "warm", "look", "Slowly, the velvet curtain moved, and a small, glowing, shy ghost floated out, wearing a flowery hat."),
    ]),
    S("library", "night", "star", "Penny joins the night party, and the whole museum celebrates.", [
      L("C", "happy", "talk", "Thank you, Nora. I feel braver already. May I come to the main hall with you?"),
      L("A", "joy", "highfive", "Of course! The night party is just about to start!"),
      L("N", "excited", "party", "In the main hall, the exhibits were gathering, and the lights twinkled, and a tiny band began to play."),
      L("N", "joy", "dance", "The suit of armor played the drums, the stuffed owl played the flute, and the stone cat purred the bass."),
      L("B", "joy", "dance", "Dance, everyone! Rattle, rattle, rattle! I am the best bone dancer in the world!"),
      L("C", "joy", "dance", "Whee! I am floating, and dancing, and nobody is laughing at me. They are all clapping!"),
      L("A", "joy", "party", "This is the best night shift I could ever imagine!"),
      L("N", "joy", "party", "They danced and laughed, until the sky outside the tall windows began to glow with the first light of morning."),
    ]),
    S("library", "dawn", "sun", "At sunrise, the exhibits go back to their places, with a funny twist.", [
      L("N", "warm", "walk", "As dawn came, the exhibits began to yawn, and shuffle back to their places."),
      L("B", "sad", "talk", "Oh no. Sunrise already? I do not want the night to end."),
      L("A", "warm", "talk", "Do not worry, Rex. Tomorrow night, I will be back. And the night after that, and every night."),
      L("C", "happy", "talk", "I will come out of my frame every night, too. I will not hide ever again."),
      L("N", "joy", "look", "Penny floated back into her painting, but this time, she was smiling a big, happy smile."),
      L("B", "joy", "dance", "Goodnight, everybody! Back to my pose, as a very still, very quiet dinosaur skeleton!"),
      L("N", "surprised", "look", "But when Rex struck his pose, he stood with one leg in the air, and a party hat on his head."),
      L("A", "joy", "talk", "Rex, you forgot to take off your party hat! The morning visitors will be so confused."),
    ]),
    S("library", "day", "sun", "In the morning, visitors notice a happy change in the museum.", [
      L("N", "warm", "walk", "When the museum opened, hundreds of visitors poured through the great stone doors."),
      L("N", "curious", "look", "They walked into the picture gallery, and stopped in front of the big flower painting."),
      L("N", "surprised", "talk", "Look! The lady in the painting is smiling! She has never smiled before!"),
      L("N", "joy", "look", "And in the main hall, the dinosaur skeleton wore a bright red party hat, and everybody laughed."),
      L("A", "joy", "talk", "A little mystery to make the visitors smile. Well done, everybody."),
      L("N", "joy", "photo", "Parents took photos, and children pointed, and the whole museum felt warmer and happier than ever."),
      L("A", "warm", "talk", "Stay calm and look closer. Sometimes the best friends are hiding in plain sight."),
      L("N", "warm", "talk", "And that is the story of the night at the Explox Museum, and the night guard who found a whole new family. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
