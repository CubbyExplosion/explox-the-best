// ─── NEW MOVIE (made automatically): The Great Explox Spelling Bee — a school comedy with a shy speller, a silly robot and a wise teacher.
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
  title: "The Great Explox Spelling Bee", genre: "🐝 School Comedy", price: 30, bg: "#2a3a5a", icons: "🐝📚🏆", comedy: true,
  cast: { A: { role: "Teacher Tilda", kind: "wizard", pers: "wise", move: "CHALK BLAST", mtype: "kick", fav: "Every word is a tiny adventure.", say: "Sorry. I am talking too much again." }, B: { role: "Bolt the Robot", kind: "robot", pers: "goof", move: "SPELL CHECK SPIN", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, my voice box hiccuped." }, C: { role: "Little Mina", kind: "hero", pers: "nervous", move: "PENCIL POKE", mtype: "punch", fav: "I have a very good bad feeling.", say: "My tummy is doing flips." } },
  trailer: [{ text: "🐝 One big spelling bee...", dur: 2200 }, { text: "📚 One very long word...", dur: 2200 }, { text: "🏆 And one very nervous speller!", dur: 2400 }, { text: "THE GREAT EXPLOX SPELLING BEE", dur: 3000 }],
  scenes: [
    S("school", "day", "book", "In class, Teacher Tilda announces the big spelling bee.", [
      L("N", "warm", "walk", "It was a bright Monday morning at the Explox school, and the classroom smelled like fresh pencils."),
      L("A", "happy", "write", "Good morning, class! On Friday, we will have the Great Explox Spelling Bee!"),
      L("B", "joy", "dance", "A bee! I love bees! Buzz, buzz! Can I wear the bee costume? Please?"),
      L("A", "warm", "talk", "It is a spelling bee, Bolt. A contest to spell hard words. No costumes needed."),
      L("C", "worried", "look", "A contest? In front of everyone? On a big stage? Oh dear."),
      L("A", "warm", "talk", "Mina, you are the best reader in the class. I think you should try."),
      L("C", "scared", "talk", "I have a very good bad feeling about this. What if I forget a letter?"),
      L("A", "warm", "talk", "Every word is a tiny adventure. We will practice together, all week."),
    ]),
    S("school", "day", "book", "Mina and Bolt practice, and Bolt makes it very silly.", [
      L("N", "joy", "walk", "After school, Mina and Bolt sat in the library with a big stack of word cards."),
      L("C", "determined", "write", "Okay. First word, please, Bolt. I will try my best."),
      L("B", "joy", "talk", "The word is... banana! B, A, N, A, N, A! Easy! I am a spelling champion!"),
      L("C", "surprised", "talk", "That is the right answer, Bolt. But you are supposed to give me the words, not spell them."),
      L("B", "joy", "dance", "Oops. Sorry. Okay, Mina, spell elephant. Wait, I know! E, L, E, F, A, N, T!"),
      L("C", "joy", "talk", "Ha ha! Bolt, you spelled it wrong. It has a P-H in the middle."),
      L("B", "surprised", "look", "A P-H? Why would a word have a P-H? That is the silliest thing I ever heard."),
      L("C", "happy", "talk", "You are very funny, Bolt. I feel a little less nervous with you here."),
    ]),
    S("school", "day", "trophy", "On Friday, the stage is set, and Mina's tummy does flips.", [
      L("N", "excited", "party", "On Friday, the school hall was full of balloons, a big banner and rows of chairs."),
      L("N", "excited", "look", "Twelve spellers stood in a line on the stage, and the whole school sat watching."),
      L("C", "scared", "panic", "Look at all those people! There must be a hundred! My knees are like jelly."),
      L("B", "joy", "talk", "Do not worry, Mina! Just pretend everybody is wearing silly hats!"),
      L("A", "warm", "talk", "Take a deep breath, Mina. One word at a time. You know more than you think."),
      L("N", "serious", "talk", "The judge, a tall owl in glasses, tapped the microphone. Welcome to the Great Explox Spelling Bee!"),
      L("C", "worried", "look", "Here we go. Please, please, let me remember the letters."),
      L("N", "excited", "write", "One by one, the spellers stepped up to the microphone, and the first round began."),
    ]),
    S("school", "day", "trophy", "The early rounds go well, but a tricky word is coming.", [
      L("N", "joy", "write", "Mina's first word was garden. G, A, R, D, E, N. Garden!"),
      L("N", "joy", "party", "The judge nodded, and the crowd gave a happy clap, clap, clap."),
      L("C", "relieved", "talk", "I did it! I spelled a word on a big stage! My tummy is a little bit calmer."),
      L("N", "serious", "write", "Her second word was rainbow, and her third was butterfly, and she spelled them perfectly."),
      L("N", "excited", "look", "One by one, the other spellers made mistakes, and sat down, until only three were left."),
      L("N", "serious", "look", "Mina, a boy named Rex and a girl named Poppy. Only one could win."),
      L("B", "excited", "jump", "Go, Mina, go! You are the best speller in the whole school! I am cheering with all my gears!"),
      L("A", "warm", "talk", "Stay calm, Mina. You are doing wonderfully."),
    ]),
    S("school", "day", "trophy", "The final round: a very long and very tricky word.", [
      L("N", "serious", "talk", "The judge looked at his card, and cleared his throat. The final word is, extraordinary."),
      L("C", "shocked", "look", "Extraordinary? That has so many letters. Where do I even start?"),
      L("N", "worried", "look", "Rex spelled it first, and got it wrong. Poppy tried next, and also got it wrong."),
      L("N", "serious", "talk", "That leaves Mina. If she spells it right, she is the champion."),
      L("C", "scared", "panic", "Oh no, oh no. My mind is empty. All the letters are floating away like bubbles."),
      L("B", "worried", "talk", "Mina, remember what we practiced! Break it into little pieces, like a pizza!"),
      L("C", "curious", "talk", "A pizza. Pieces. Extra... ordinary! Extra, and ordinary! That is it!"),
      L("C", "determined", "write", "E, X, T, R, A. O, R, D, I, N, A, R, Y. Extraordinary!"),
    ]),
    S("school", "day", "trophy", "A funny twist: the trophy has a surprise inside.", [
      L("N", "excited", "party", "The whole hall exploded in cheers! Mina had won the Great Explox Spelling Bee!"),
      L("A", "joy", "highfive", "Mina! That was extraordinary indeed! I am so proud of you!"),
      L("B", "joy", "dance", "Mina the Champion! Wheee! I am so happy that my gears are squeaking!"),
      L("N", "joy", "photo", "The owl judge handed Mina a big golden trophy shaped like a bee."),
      L("N", "surprised", "look", "But when Mina lifted it, the little golden bee began to buzz, and a tiny door opened on its back."),
      L("C", "surprised", "look", "There is something inside! It is a tiny rolled-up note."),
      L("N", "curious", "write", "Mina unrolled the note. It said, The best spellers are the ones who keep trying."),
      L("C", "joy", "talk", "That is exactly what I did. I kept trying, even when I was scared."),
    ]),
    S("school", "day", "heart", "Bolt discovers a surprise of his own.", [
      L("B", "joy", "dance", "I have a surprise too! I made a banner! Congratulations, Mina! Hooray!"),
      L("N", "surprised", "look", "Bolt unrolled a long paper banner, and everyone read it out loud."),
      L("N", "joy", "write", "It said, Congratulashuns Mina! You are the best spelar in Explox!"),
      L("A", "joy", "talk", "Oh, Bolt. That has four spelling mistakes. But it is the sweetest banner I have ever seen."),
      L("C", "joy", "talk", "Ha ha! I love it, Bolt. I would not change a single letter."),
      L("B", "joy", "talk", "Really? You do not want me to fix it? Okay! I will keep it forever, mistakes and all."),
      L("N", "warm", "highfive", "The whole class gathered around, laughing, and gave Bolt a big group high five."),
      L("A", "warm", "talk", "Every word is a tiny adventure, and so is every friend."),
    ]),
    S("school", "dusk", "sun", "After the contest, the friends celebrate with a class party.", [
      L("N", "warm", "walk", "That afternoon, the sun came through the tall classroom windows, painting everything gold."),
      L("N", "joy", "party", "The class had a party with cookies, lemonade and a very big alphabet cake."),
      L("B", "joy", "eat", "An alphabet cake! I will eat A, B, C and D first. And then the rest of the letters."),
      L("C", "happy", "talk", "Teacher Tilda, thank you for helping me. I was so scared, and now I feel brave."),
      L("A", "warm", "talk", "You were always brave, Mina. You just needed a little practice, and a good friend."),
      L("N", "joy", "dance", "The whole class danced in a circle, and Mina held up her golden bee trophy."),
      L("B", "joy", "photo", "Everybody, smile! Say, spelling bee! S, P, E, L, L, I, N, G!"),
      L("N", "warm", "talk", "And that is the story of the Great Explox Spelling Bee, and the nervous speller who won. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
