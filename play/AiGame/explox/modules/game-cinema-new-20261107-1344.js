// ─── NEW MOVIE (made automatically): The Great Explox Garage Sale — a neighborhood comedy with a sweet grandpa, a goofy robot and a curious girl.
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
  title: "The Great Explox Garage Sale", genre: "🏷️ Neighborhood Comedy", price: 30, bg: "#3a3a2a", icons: "🏷️📦🧸", comedy: true,
  cast: { A: { role: "Grandpa Gus", kind: "pioneer", pers: "sweet", move: "WALKING STICK SPIN", mtype: "spin", fav: "Old things have new stories.", say: "I could not say no to a happy customer. I never can." }, B: { role: "Rusty the Robot", kind: "robot", pers: "goof", move: "SPARK SPIN", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, I sold the wrong box again." }, C: { role: "Curious Cleo", kind: "hero", pers: "hero", move: "MAGNIFYING FLASH", mtype: "kick", fav: "Every box has a secret.", say: "I know, I should ask first. I never do." } },
  trailer: [{ text: "🏷️ One big garage sale...", dur: 2200 }, { text: "📦 One mystery box...", dur: 2200 }, { text: "🧸 And a secret nobody expected!", dur: 2400 }, { text: "THE GREAT EXPLOX GARAGE SALE", dur: 3000 }],
  scenes: [
    S("suburbs", "dawn", "sun", "On a sunny Saturday, Grandpa Gus and Rusty set up a garage sale.", [
      L("N", "warm", "walk", "It was a bright Saturday morning on Maple Street, and Grandpa Gus's garage door rolled slowly open."),
      L("A", "happy", "work", "Good morning, Rusty! Today is the big garage sale. Let us put out all the old things."),
      L("B", "joy", "work", "Yes, boss! I will carry the boxes! Look, I can carry seven at once! Wobble, wobble."),
      L("A", "worried", "talk", "Careful, Rusty. Not that many. Remember last time, when you dropped the lamps."),
      L("B", "joy", "dance", "Do not worry! I only dropped three lamps. And they were ugly lamps anyway!"),
      L("N", "joy", "build", "They set up a long folding table, and filled it with books, toys, clocks and a very old guitar."),
      L("A", "warm", "write", "I will make the price tags. One S.I.P. for the small things, five S.I.P. for the big things."),
      L("B", "excited", "jump", "I hope we sell everything! I hope a hundred people come!"),
    ]),
    S("suburbs", "day", "heart", "Cleo arrives and finds a mysterious box in the corner.", [
      L("N", "joy", "walk", "Soon, neighbors began to arrive, walking up and down the tables, picking things up and putting them down."),
      L("C", "curious", "walk", "Good morning, Grandpa Gus! I am Cleo, and I love garage sales. Every box has a secret!"),
      L("A", "happy", "talk", "Welcome, Cleo. Everything is for sale, and everything has a story."),
      L("N", "curious", "look", "In the dusty back corner, behind a stack of old chairs, Cleo spotted a small, wooden box with a rusty lock."),
      L("C", "surprised", "look", "Grandpa Gus, what is in this box? It looks very, very old."),
      L("A", "surprised", "look", "Hmm. I do not remember that box at all. I thought I sold everything old years ago."),
      L("B", "curious", "talk", "A mystery box! Maybe it is full of gold! Or cookies! Or gold cookies!"),
      L("C", "excited", "talk", "May I buy it, Grandpa Gus? I would love to find out what is inside."),
    ]),
    S("suburbs", "day", "heart", "Rusty accidentally sells the wrong thing, in a funny way.", [
      L("N", "joy", "shop", "Meanwhile, a tall man in a big hat stopped at the table, and picked up Grandpa's best old clock."),
      L("B", "joy", "shop", "Good morning, sir! That is a very nice clock. It costs one hundred and fifty S.I.P.!"),
      L("A", "shocked", "look", "Rusty! That clock has a price tag of fifteen S.I.P., not one hundred and fifty!"),
      L("B", "worried", "look", "Oops. I read the zero upside down. Sorry, sir, it is fifteen."),
      L("N", "joy", "party", "The man laughed, and paid fifteen S.I.P., and bought three more things from the table."),
      L("B", "joy", "dance", "Ha ha! I am the best salesman in Explox! Even when I make a mistake!"),
      L("A", "warm", "talk", "Good thing the man was so kind. Rusty, let us check each price twice from now on."),
      L("C", "determined", "write", "Grandpa Gus, I have saved up my allowance. I would like to buy the little wooden box, please."),
    ]),
    S("suburbs", "day", "heart", "Cleo opens the box, and a surprise is inside.", [
      L("A", "warm", "talk", "Cleo, since you are so curious, you may have the box for two S.I.P. Let us open it together."),
      L("N", "curious", "look", "The rusty lock would not turn, so Rusty used a tiny screwdriver from his belt."),
      L("B", "determined", "work", "Hold still, lock! Rusty the Robot is on the job! Click, click, click, pop!"),
      L("N", "surprised", "look", "The lid creaked open, and inside, on a soft blue velvet cushion, lay a golden pocket watch."),
      L("C", "shocked", "look", "A pocket watch! It is shining like a little sun!"),
      L("A", "shocked", "look", "My goodness. This was my grandfather's watch. I thought I lost it fifty years ago."),
      L("N", "warm", "look", "Inside the lid was a tiny folded note. Grandpa Gus unfolded it with shaking fingers."),
      L("A", "warm", "talk", "It says, For Gus, so you will always have time for the people you love."),
    ]),
    S("suburbs", "day", "heart", "The twist: the watch has a secret, and Cleo makes a kind choice.", [
      L("C", "surprised", "talk", "Grandpa Gus, it is yours! You must keep it. I cannot take your grandfather's watch."),
      L("A", "warm", "talk", "Cleo, you found it, fair and square. It belongs to the one who looked."),
      L("C", "determined", "talk", "A box has a secret, and the secret was for you. I would rather have a friend than a watch."),
      L("N", "joy", "look", "As Cleo handed back the box, the watch gave a soft click, and a tiny music began to play."),
      L("B", "surprised", "look", "It is a music box! The pocket watch plays a song! A little lullaby!"),
      L("A", "relieved", "talk", "That song. My grandfather used to hum it when I was a little boy. I never forgot it."),
      L("N", "warm", "photo", "For a moment, everybody at the garage sale stopped, and listened to the sweet little tune."),
      L("A", "happy", "talk", "Cleo, you have given me a gift much better than money. Thank you."),
    ]),
    S("suburbs", "day", "heart", "Rusty makes a funny mess, and the whole neighborhood helps.", [
      L("N", "joy", "walk", "As the afternoon went on, the garage sale grew busier, and the tables grew emptier."),
      L("B", "joy", "work", "Look, boss! I sold the last book, the last toy and the last clock! Only the big table is left."),
      L("N", "worried", "look", "But as Rusty backed up to count the money, he bumped into the big table, and everything slid off."),
      L("B", "shocked", "panic", "Oh no, oh no! The table is falling! Everybody, duck!"),
      L("N", "surprised", "look", "A cloud of old buttons, ribbons and toys flew into the air, and rained down on the lawn."),
      L("C", "joy", "juggle", "Do not worry, Rusty! I will catch what I can! Look, I am a button juggler!"),
      L("N", "joy", "party", "Neighbors ran over to help, and soon the whole street was picking up buttons together, laughing."),
      L("A", "warm", "talk", "That is what neighbors do. They help, even when the table falls down."),
    ]),
    S("suburbs", "dusk", "sun", "At sunset, the sale ends, and Grandpa Gus has a surprise.", [
      L("N", "warm", "walk", "At sunset, the garage was nearly empty, and the golden light glowed on Maple Street."),
      L("A", "warm", "talk", "Rusty, Cleo, we sold nearly everything. And we earned three hundred and twenty S.I.P."),
      L("B", "joy", "dance", "Three hundred and twenty! I could buy a thousand cookies! Or a new antenna!"),
      L("A", "warm", "talk", "Actually, I have a better idea. Let us give the money to the Explox Children's Library, for new books."),
      L("C", "joy", "highfive", "Grandpa Gus, that is the best idea ever! Every book has a secret, too!"),
      L("B", "joy", "highfive", "Books! I love books! Especially the ones with pictures of pizza!"),
      L("N", "joy", "party", "The next day, the three friends delivered a big envelope to the library, and the librarian cried happy tears."),
      L("N", "warm", "talk", "And Grandpa Gus kept the golden watch in his pocket, and wound it every evening, and listened to its little song."),
    ]),
    S("suburbs", "night", "star", "That evening, the three friends share dinner on the porch.", [
      L("N", "warm", "walk", "That night, Grandpa Gus, Rusty and Cleo sat on the porch, with a big plate of sandwiches and hot cocoa."),
      L("C", "happy", "eat", "This is the best garage sale I ever went to. And the best sandwich, too."),
      L("B", "joy", "eat", "I will take four, please. Oh, and a pickle. A very big pickle!"),
      L("A", "warm", "talk", "Old things have new stories. And new friends make the best stories of all."),
      L("C", "joy", "talk", "Can we do it again next year, Grandpa Gus? With even more boxes?"),
      L("A", "joy", "talk", "Of course, Cleo. And this time, we will check the price tags twice."),
      L("B", "joy", "dance", "Twice! Three times! A hundred times! I promise! Beep, beep!"),
      L("N", "warm", "talk", "And that is the story of the great Explox garage sale, and the little watch that played a lullaby. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
