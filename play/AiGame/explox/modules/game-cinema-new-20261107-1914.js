// ─── NEW MOVIE (made automatically): The Little Submarine and the Lost Whale Song — an ocean rescue with a brave captain, a goofy octopus and a sweet mermaid.
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
  title: "The Little Submarine and the Lost Whale Song", genre: "🌊 Ocean Rescue", price: 30, bg: "#0a2a4a", icons: "🌊🐋🚢", comedy: true,
  cast: { A: { role: "Captain Coral", kind: "hero", pers: "hero", move: "BUBBLE KICK", mtype: "kick", fav: "Dive deep, stay kind!", say: "I know, I should check the map. I never do." }, B: { role: "Inky the Octopus", kind: "alien", pers: "goof", move: "EIGHT-ARM SPIN", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, my arms got tangled again." }, C: { role: "Pearl the Mermaid", kind: "wizard", pers: "sweet", move: "WAVE SWIRL", mtype: "spin", fav: "A kind song can reach anywhere.", say: "I could not say no to a lost little one. I never can." } },
  trailer: [{ text: "🌊 One little submarine...", dur: 2200 }, { text: "🐋 One lost baby whale...", dur: 2200 }, { text: "🚢 And a song that must be found!", dur: 2400 }, { text: "THE LITTLE SUBMARINE AND THE LOST WHALE SONG", dur: 3000 }],
  scenes: [
    S("beach", "dawn", "sun", "At sunrise, Captain Coral gets her little submarine ready for a dive.", [
      L("N", "warm", "walk", "At the edge of the Explox coast, the morning sun sparkled on a calm, blue sea."),
      L("A", "happy", "work", "Good morning, Bubbles the Submarine! Today, we explore the deep blue ocean."),
      L("N", "joy", "build", "Captain Coral checked every dial, tightened every bolt and polished the round yellow windows."),
      L("A", "excited", "jump", "Dive deep, stay kind! That is the motto of every Explox explorer."),
      L("N", "curious", "look", "Just then, a small, wet, wiggly shape climbed up the ladder and waved at her."),
      L("B", "joy", "dance", "Hello, hello! I am Inky the Octopus! I heard somebody is going on a dive! Can I come?"),
      L("A", "warm", "talk", "Of course, Inky! The more, the merrier. Just keep your arms inside the submarine."),
      L("B", "joy", "eat", "Eight arms, eight snacks! I brought lunch for everybody! Seaweed sandwiches!"),
    ]),
    S("beach", "day", "sun", "The submarine dives down into the beautiful, colorful reef.", [
      L("N", "excited", "fly", "The little yellow submarine sank slowly under the waves, bubbles trailing behind it, blub, blub, blub."),
      L("A", "joy", "look", "Look at that coral reef! It is every color of the rainbow!"),
      L("B", "joy", "look", "Fish! Hundreds of fish! Orange ones, striped ones, and a polka-dot one that is waving at me!"),
      L("N", "joy", "dance", "A school of tiny silver fish swirled around the windows, like a living, sparkling curtain."),
      L("A", "warm", "talk", "The ocean is full of friendly surprises. And it is our job to keep it safe."),
      L("B", "curious", "look", "Captain, what is that sound? It is like a faint, sad humming coming from far away."),
      L("A", "curious", "talk", "A hum? Let me turn off the engine, and listen carefully."),
      L("N", "serious", "look", "In the quiet, the three of them heard it, a low, long, mournful song, drifting through the water."),
    ]),
    S("beach", "day", "bolt", "They discover a lost baby whale, crying out.", [
      L("A", "worried", "look", "That is a whale song! But it sounds so sad. Someone is calling for help."),
      L("N", "worried", "fly", "The submarine glided toward the sound, past a forest of swaying seaweed and a sunken old ship."),
      L("N", "surprised", "look", "In a sandy clearing, a baby whale floated all alone, with big, shiny, tearful eyes."),
      L("B", "sad", "talk", "Oh, the poor little thing. He looks so lost. Where are his mommy and daddy?"),
      L("A", "warm", "talk", "Hello, little whale. I am Captain Coral. Are you all right? Are you lost?"),
      L("N", "sad", "talk", "The baby whale sniffled, and tried to answer, but only a tiny, squeaky note came out."),
      L("B", "worried", "talk", "He cannot sing his family's song! He lost it somehow. That is why they cannot find him!"),
      L("A", "determined", "talk", "Then we must help him find his song, and his family. Let us start right now."),
    ]),
    S("beach", "day", "star", "They meet Pearl the Mermaid, who knows a bit about whale songs.", [
      L("N", "excited", "fly", "The submarine swam toward a glittering pearl-white cave, where someone kind was waiting."),
      L("N", "joy", "look", "Out swam Pearl the Mermaid, with long, shimmering hair and a seashell harp on her back."),
      L("C", "warm", "talk", "Hello, explorers! I heard a little whale crying. May I help?"),
      L("A", "happy", "talk", "Pearl! The baby has lost his family song. Do you know how to find it?"),
      L("C", "curious", "talk", "A whale song is not lost, it only hides in the heart. We need to help him remember it."),
      L("B", "curious", "talk", "How do we do that? Do we ask the fish? Do we dig in the sand? Do we ask a crab?"),
      L("C", "warm", "talk", "We sing, Inky. A kind song can reach anywhere. If we sing the first notes, he will remember the rest."),
      L("N", "joy", "play", "Pearl lifted her seashell harp, and played a soft, warm, rolling melody."),
    ]),
    S("beach", "day", "star", "A funny moment, as Inky tries to help with the singing.", [
      L("C", "warm", "sing", "La, la, laaa. Dum, dum, dooo. Sing along, little one."),
      L("N", "joy", "sing", "The baby whale tried to hum along, but only a tiny squeak came out."),
      L("B", "joy", "drum", "I will help! I will play the drums! I have eight arms, I can do eight drums at once!"),
      L("N", "joy", "drum", "Inky slapped his arms on the submarine's metal wall, bonk, bonk, boing, boing, bonk, in a wild, wobbly rhythm."),
      L("A", "joy", "dance", "That is a funny beat, Inky! It sounds like a very happy washing machine!"),
      L("N", "surprised", "look", "But the baby whale giggled at the silly beat, and let out a loud, happy, bubbling laugh."),
      L("C", "surprised", "talk", "That is the first step! A laugh is a part of every song. Keep going, Inky!"),
      L("B", "joy", "dance", "Me? A music genius? I always knew it! Bonk, bonk, bonk!"),
    ]),
    S("beach", "dusk", "lantern", "The baby whale remembers his song, but a storm approaches.", [
      L("N", "joy", "sing", "Little by little, the baby whale hummed along with Pearl's harp, and his squeak grew into a clear, sweet note."),
      L("N", "joy", "sing", "Then another note, and another, until a beautiful, gentle whale song filled the whole sea."),
      L("A", "joy", "highfive", "He remembered! Look at him sing! It is the most beautiful sound in the ocean!"),
      L("N", "worried", "look", "But far above, dark clouds gathered, and the waves began to roll, rumble and crash."),
      L("A", "worried", "talk", "A storm is coming. We must get the baby to his family, and quickly."),
      L("C", "determined", "talk", "The whales are far to the north. We follow the song. It will lead us there."),
      L("B", "determined", "work", "Everybody in! I will turn the steering wheel! Eight arms, eight steering wheels!"),
      L("N", "excited", "fly", "The little submarine zoomed north, with the baby whale swimming close alongside, singing his song."),
    ]),
    S("beach", "night", "star", "The reunion: the whale family answers the song.", [
      L("N", "serious", "fly", "The waves grew bigger, and the submarine rocked, up and down, but the baby whale kept singing."),
      L("N", "surprised", "look", "Then, from the deep, dark water, came a low, deep, answering song, and a pair of huge, gentle shapes glided out."),
      L("N", "joy", "look", "It was the baby's mother and father, two giant blue whales, with kind, glowing eyes."),
      L("N", "joy", "party", "They circled around the little whale, and nuzzled him, and sang a loud, joyful song of reunion."),
      L("A", "joy", "highfive", "We did it! We found his family! Everyone cheer!"),
      L("C", "joy", "dance", "A song is never really lost, as long as somebody sings it back."),
      L("B", "joy", "dance", "Hooray! Hooray! I am so happy, my arms are all doing a different dance!"),
      L("N", "warm", "photo", "The whale family bowed their great heads, in thanks, and the baby gave the submarine a soft, wet kiss on the window."),
    ]),
    S("beach", "dawn", "sun", "At sunrise, the friends return home, with a promise.", [
      L("N", "warm", "walk", "By morning, the storm had passed, and the sea was calm and bright again."),
      L("A", "warm", "talk", "Pearl, thank you. Without your harp, we never would have found the song."),
      L("C", "happy", "talk", "And without your drums, Inky, he never would have laughed. Every friend has a gift."),
      L("B", "joy", "dance", "My drums saved the day! I am officially the ocean's best drummer! Boing!"),
      L("N", "joy", "photo", "From far away, the whale family sent a gentle farewell song, which echoed across the whole ocean."),
      L("A", "warm", "talk", "Dive deep, stay kind. And a kind song can reach anywhere."),
      L("C", "warm", "talk", "I will visit you every month, Captain. And we will sing for the whales."),
      L("N", "warm", "talk", "And that is the story of the little submarine and the lost whale song, and the friends who found it. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
