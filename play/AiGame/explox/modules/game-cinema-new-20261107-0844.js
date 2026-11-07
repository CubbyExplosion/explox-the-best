// ─── NEW MOVIE (made automatically): The Book That Read Itself — a library magic adventure with a young librarian, a goofy robot and a nervous little boy.
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
  title: "The Book That Read Itself", genre: "📚 Library Magic Adventure", price: 30, bg: "#2a1f3a", icons: "📚✨🐉", comedy: true,
  cast: { A: { role: "Librarian Lyra", kind: "wizard", pers: "wise", move: "SPARKLE BLAST KICK", mtype: "kick", fav: "Every story needs an ending.", say: "Sorry. I am talking too much again." }, B: { role: "Page the Robot", kind: "robot", pers: "goof", move: "LASER PUNCH", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I turned the page too fast again." }, C: { role: "Little Leo", kind: "hero", pers: "nervous", move: "PILLOW SMASH", mtype: "punch", fav: "I have a very good bad feeling.", say: "My hands will not stop shaking." } },
  trailer: [{ text: "📚 One very old book...", dur: 2200 }, { text: "✨ One page that glows...", dur: 2200 }, { text: "🐉 And a story that escaped!", dur: 2400 }, { text: "THE BOOK THAT READ ITSELF", dur: 3000 }],
  scenes: [
    S("library", "day", "book", "On a rainy afternoon, three friends find a very old book hidden at the back of the Explox Library.", [
      L("N", "warm", "walk", "It was a rainy afternoon at the Explox Library, and the only sound was the patter of raindrops on the tall windows."),
      L("A", "warm", "write", "Librarian Lyra here. Leo, would you help me sort the old books on the top shelf?"),
      L("C", "worried", "climb", "Okay, Miss Lyra. But the shelf is very high, and my hands are a little bit shaky."),
      L("B", "joy", "work", "Do not worry, Leo! I will hold the ladder. I am a ladder-holding robot. Wobble, wobble."),
      L("N", "curious", "look", "At the very back of the top shelf, behind a dusty pile of atlases, Leo found a thick book with a golden cover."),
      L("C", "surprised", "look", "Miss Lyra, there is a book here with no title. It is glowing a little bit."),
      L("A", "surprised", "look", "A glowing book? Leo, hand it down very carefully. I have never seen this one before."),
      L("B", "curious", "look", "Maybe it is a cookbook! Does it have pictures of pizza?"),
    ]),
    S("library", "day", "book", "The friends open the book, and something very unexpected happens.", [
      L("N", "curious", "sneak", "The three friends gathered around the reading table, and Lyra slowly opened the golden book."),
      L("A", "surprised", "look", "The pages are blank. Every page is empty. How strange."),
      L("N", "surprised", "magic", "Then, one by one, words began to appear on the page, in glowing golden ink: Once upon a time, there was a dragon."),
      L("C", "shocked", "look", "The book is writing by itself! Nobody is holding the pen!"),
      L("B", "shocked", "look", "It is a book that reads itself! Hello, book! Can you also do the dishes?"),
      L("N", "surprised", "look", "The golden letters wiggled, and glowed, and a tiny puff of smoke floated up from the page."),
      L("A", "worried", "talk", "Everyone, step back. I think this is a very, very magical book."),
      L("C", "scared", "panic", "I have a very good bad feeling about this. Is something coming out of the page?"),
    ]),
    S("library", "day", "fire", "A tiny dragon pops out of the book and flies around the library.", [
      L("N", "surprised", "fly", "With a loud pop, a tiny green dragon shot out of the book, and zoomed up to the ceiling."),
      L("C", "shocked", "panic", "A dragon! A real dragon! In the library! Please do not eat me, I am very stringy!"),
      L("B", "joy", "dance", "Hello, little dragon! I am Page the Robot. Do you like pizza? Or books? Or both?"),
      L("N", "joy", "fly", "The tiny dragon giggled, did a loop-the-loop, and landed right on top of Page's head."),
      L("A", "curious", "talk", "Little dragon, where did you come from? Did you come out of the book?"),
      L("N", "curious", "talk", "The dragon nodded, and blew a tiny smoke ring that spelled out: I am the hero of this story. Help me finish it."),
      L("C", "surprised", "look", "The dragon is the hero of the story? But why is the story not finished?"),
      L("A", "serious", "write", "The book must be missing its ending. And the story will not stop until somebody writes one."),
    ]),
    S("library", "dusk", "book", "More characters escape from the book, and the library becomes very busy.", [
      L("N", "surprised", "look", "Pop! Pop! Pop! One after another, more characters leaped out of the golden book."),
      L("N", "joy", "dance", "First came a sleepy knight, then a talking teapot, then a pirate with a very fluffy hat."),
      L("B", "joy", "dance", "A pirate! A teapot! A knight! This is the best day of my robot life!"),
      L("N", "worried", "run", "The pirate waved his sword, the teapot rolled across the floor, and the knight tripped over a pile of books."),
      L("C", "scared", "panic", "Miss Lyra, they are making a mess! Books are flying everywhere!"),
      L("A", "worried", "run", "Everybody stay calm. They are not bad. They are only lost, and a little bit confused."),
      L("N", "worried", "look", "The characters looked around the big, quiet library, and some of them began to look very sad."),
      L("A", "warm", "talk", "I know what we must do. We must write the ending for the story, and bring them all back home."),
    ]),
    S("library", "dusk", "lantern", "Leo has a brave idea about how to write the ending.", [
      L("A", "serious", "talk", "A good ending needs three things: a problem, a friend and a happy surprise."),
      L("B", "curious", "write", "I will write the problem! The problem is, the dragon is lost, and he cannot find his friends."),
      L("A", "warm", "write", "Good, Page. And now the friend. Leo, you have a very kind heart. Would you like to write that part?"),
      L("C", "worried", "talk", "Me? I am not a good writer. My hands always shake when I hold a pen."),
      L("N", "warm", "talk", "The tiny dragon landed on Leo's shoulder, and snuggled against his neck."),
      L("C", "relieved", "talk", "The dragon thinks I can do it. Okay, I will try. Maybe my hands will not shake so much, if I am not alone."),
      L("N", "joy", "write", "Leo picked up the golden pen, and slowly, carefully, he began to write."),
      L("C", "determined", "write", "And the dragon found a friend, a boy who was a little bit scared, but very kind."),
    ]),
    S("library", "night", "book", "The book starts to glow brighter as Leo writes the ending.", [
      L("N", "excited", "magic", "As Leo wrote, the golden words on the page began to glow brighter and brighter."),
      L("C", "determined", "write", "And together, the dragon and the boy flew over the mountains, and found the lost knight, the pirate and the teapot."),
      L("N", "joy", "fly", "The characters in the library gasped, and slowly began to float toward the glowing book."),
      L("B", "joy", "dance", "Look, they are all being pulled back into the story! They are going home!"),
      L("A", "warm", "talk", "Say goodbye, everybody. They are going to a place where they belong."),
      L("N", "warm", "photo", "The pirate waved his fluffy hat, the knight bowed, and the teapot gave a happy little whistle."),
      L("N", "sad", "look", "Only the tiny dragon was left, hovering above Leo's shoulder, looking at the glowing book."),
      L("C", "sad", "talk", "Do you have to go, little dragon? I do not want you to leave."),
    ]),
    S("library", "night", "heart", "The dragon says goodbye in a very touching moment.", [
      L("N", "warm", "talk", "The tiny dragon nuzzled Leo's cheek, and a single, glowing tear sparkled in its big green eye."),
      L("N", "sad", "talk", "Thank you, Leo. You gave me an ending, and a friend. I will never forget you."),
      L("C", "sad", "talk", "I will never forget you either, little dragon. You made me brave."),
      L("A", "warm", "talk", "A good story never really ends, Leo. Every time somebody opens the book, the dragon will be waiting."),
      L("C", "relieved", "talk", "Then I will read it every single day. I promise."),
      L("N", "warm", "magic", "The dragon gave one last happy twirl, and slipped back into the glowing book, which closed with a soft, gentle click."),
      L("B", "joy", "highfive", "Hooray! We did it! And I did not even have to do the dishes."),
      L("A", "joy", "highfive", "Well done, all three of you. You saved the story, and every character in it."),
    ]),
    S("library", "dawn", "sun", "The next morning, the library has a new section, and Leo has a new job.", [
      L("N", "warm", "walk", "The next morning, the rain was gone, and the sun shone through the tall windows of the library."),
      L("A", "happy", "talk", "Leo, I have a surprise for you. From today, you are the official Storyteller of the Explox Library."),
      L("C", "joy", "dance", "The Storyteller? Me? Really? Every Saturday, I will read the dragon story, out loud, to all the children!"),
      L("B", "joy", "eat", "And I will bring the snacks. A library story hour needs snacks. Lots of them."),
      L("N", "joy", "party", "That Saturday, a hundred children sat on the library floor, and Leo opened the golden book."),
      L("C", "joy", "talk", "Once upon a time, there was a dragon, and a boy who was a little bit scared, but very kind."),
      L("A", "warm", "talk", "Every story needs an ending. And every ending needs a friend."),
      L("N", "warm", "talk", "And that is the story of the book that read itself. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
