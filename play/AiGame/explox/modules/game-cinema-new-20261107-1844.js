// ─── NEW MOVIE (made automatically): The Lemonade Stand That Saved the Day — a market comedy with a hopeful girl, a goofy robot and a grumpy rival.
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
  title: "The Lemonade Stand That Saved the Day", genre: "🍋 Market Comedy", price: 30, bg: "#4a4a1a", icons: "🍋🥤☀️", comedy: true,
  cast: { A: { role: "Lemon Lila", kind: "hero", pers: "sweet", move: "CITRUS SPIN", mtype: "spin", fav: "A smile is the best ingredient.", say: "I could not say no to a thirsty customer. I never can." }, B: { role: "Squirt the Robot", kind: "robot", pers: "goof", move: "SPLASH BLAST", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I squeezed too hard again." }, C: { role: "Sour Sid", kind: "hero", pers: "rival", move: "GRUMP STOMP", mtype: "kick", fav: "I always sell the most.", say: "I know, I should be nicer. I never am." } },
  trailer: [{ text: "🍋 One hot summer day...", dur: 2200 }, { text: "🥤 One tiny lemonade stand...", dur: 2200 }, { text: "☀️ And a whole town to save!", dur: 2400 }, { text: "THE LEMONADE STAND THAT SAVED THE DAY", dur: 3000 }],
  scenes: [
    S("market", "day", "sun", "On the hottest day of summer, Lila and Squirt open a lemonade stand.", [
      L("N", "warm", "walk", "It was the hottest day of the year in Explox, and the whole market square shimmered in the heat."),
      L("A", "happy", "build", "Squirt, today we open our lemonade stand! A smile is the best ingredient."),
      L("B", "joy", "work", "I squeezed forty lemons this morning! My arms are so sticky, they stick to each other!"),
      L("N", "joy", "build", "They set up a little wooden table, a pitcher, a stack of paper cups and a hand-painted sign."),
      L("A", "happy", "write", "The sign says, Lila and Squirt's Lemonade, one S.I.P. per cup, with a smile on top."),
      L("B", "joy", "dance", "A smile on top! I will smile so hard that my antenna wiggles! Boing, boing!"),
      L("N", "curious", "look", "Across the square, a boy in a green cap was glaring at their stand, and setting up a bigger table of his own."),
      L("A", "curious", "look", "Oh, hello! Is that a lemonade stand, too? It looks very fancy."),
    ]),
    S("market", "day", "sun", "Sour Sid shows up as a grumpy rival, and the stands compete.", [
      L("C", "serious", "talk", "I am Sid. Sour Sid. I have the best lemonade in the whole market. And the biggest table."),
      L("A", "warm", "talk", "Nice to meet you, Sid. There is plenty of sunshine to go around. We can both sell."),
      L("C", "angry", "talk", "No way. I always sell the most. Your little stand is going to go bust by lunch."),
      L("B", "angry", "talk", "Hey! That is not very nice! Our lemonade is made with love, and forty squeezed lemons!"),
      L("A", "serious", "talk", "Squirt, it is okay. Let us just do our best. We do not need to be mean to sell lemonade."),
      L("N", "worried", "look", "Sid put up a loud, shiny sign that said, BEST LEMONADE, HALF PRICE! and a crowd quickly gathered at his stand."),
      L("B", "sad", "look", "Oh no. Everyone is going to Sid's stand. Nobody is looking at ours."),
      L("A", "determined", "talk", "That is all right. We will wait, and smile, and be kind. The right customers will come."),
    ]),
    S("market", "day", "sun", "A problem: Sid's customers get sick of too much sourness.", [
      L("N", "curious", "look", "At Sid's stand, the line stretched halfway across the square, and the cups flew out fast."),
      L("N", "surprised", "look", "But then, one by one, the customers began to scrunch up their faces, and make sour, squinty expressions."),
      L("N", "shocked", "talk", "Yuck! This is so sour! My whole mouth is puckering! Did he forget the sugar?"),
      L("C", "shocked", "look", "What? No, it is perfect! It is the best lemonade in Explox! Taste it again!"),
      L("N", "worried", "look", "But the customers put their cups down, and walked away, holding their cheeks."),
      L("B", "curious", "talk", "Lila, I think Sid made it too sour. He used lots of lemons, but forgot the honey."),
      L("A", "worried", "talk", "Oh dear. Poor Sid. He worked so hard, and nobody likes his lemonade."),
      L("C", "sad", "look", "Why is nobody buying it? I put six whole lemons in every cup. That is more than anybody else!"),
    ]),
    S("market", "day", "sun", "Lila makes a kind choice, and Squirt makes a funny mess.", [
      L("A", "warm", "talk", "Sid, I have an idea. Would you like to try our recipe? It has honey, a splash of sugar and a mint leaf."),
      L("C", "angry", "talk", "Why would you help me? I was mean to you, and I said you would go bust."),
      L("A", "warm", "talk", "Because a smile is the best ingredient. And because a thirsty town needs good lemonade, no matter who makes it."),
      L("C", "surprised", "look", "That is the nicest thing anyone has ever said to me. Okay. I will try."),
      L("B", "joy", "work", "I will get the honey! Hold on, Sid, I am bringing the biggest honey jar in the whole market!"),
      L("N", "shocked", "juggle", "Squirt raced across the square, juggling the honey jar, a bag of sugar and three lemons, and slipped on a puddle."),
      L("N", "joy", "bubbles", "The honey jar flew into the air, the sugar went poof, and everything landed in the big lemonade pitcher, splash!"),
      L("B", "shocked", "panic", "Oops! I mixed everything in at once! Sorry, sorry, sorry!"),
    ]),
    S("market", "day", "sun", "The accidental mix turns out to be a hit.", [
      L("N", "curious", "look", "Lila, Sid and Squirt peeked into the big pitcher. The lemonade was golden, sparkling, and smelled like summer."),
      L("A", "curious", "talk", "Let us taste it. One, two, three, sip!"),
      L("N", "surprised", "look", "Their eyes opened wide, and big smiles spread across their faces."),
      L("C", "shocked", "talk", "That is the best lemonade I have ever tasted in my whole life! It is sweet, and sour, and minty!"),
      L("B", "joy", "dance", "I did it! A happy accident! I am the greatest lemonade mixer in Explox!"),
      L("A", "joy", "highfive", "Squirt, you are a genius. Let us give it a name. How about Sunshine Fizz?"),
      L("C", "joy", "talk", "Sunshine Fizz. I love it. Can we make it together, at one big stand?"),
      L("N", "joy", "party", "They poured the sparkling lemonade into dozens of cups, and put out a brand new sign: SUNSHINE FIZZ, EVERYONE WELCOME."),
    ]),
    S("market", "dusk", "trophy", "The big rush: the whole town needs lemonade, and the team saves the day.", [
      L("N", "excited", "party", "Word spread quickly, and soon hundreds of people lined up at the Sunshine Fizz stand."),
      L("N", "worried", "look", "But at that very moment, the town's big water pump broke down, and the whole market ran out of cold drinks."),
      L("N", "worried", "talk", "The children and the grandparents were hot, thirsty and cranky, and the heat was only getting worse."),
      L("A", "determined", "talk", "Team, this is our moment! We have the lemons, and the honey, and the ice! We can help everybody!"),
      L("C", "determined", "work", "I will slice the lemons, as fast as I can! Slice, slice, slice!"),
      L("B", "excited", "work", "And I will squeeze! Squeeze, squeeze, squeeze! My arms are a blur!"),
      L("A", "joy", "work", "And I will pour, and smile at every single person in line!"),
      L("N", "joy", "party", "For three hours, the three friends worked together, and gave a cold, sweet lemonade to every thirsty person in Explox."),
    ]),
    S("market", "night", "star", "At night, the town says thank you, with a surprise.", [
      L("N", "warm", "walk", "At sunset, the heat faded, the stars came out, and the market was calm and quiet again."),
      L("N", "joy", "talk", "The mayor stepped up onto a box, and tapped a glass for attention."),
      L("N", "joy", "talk", "Today, three friends saved our whole town from the heat. Please give a big cheer for Lila, Squirt and Sid!"),
      L("N", "joy", "party", "The crowd cheered so loudly that the lanterns shook, and the mayor handed them a golden lemon trophy."),
      L("C", "happy", "talk", "I was wrong about so many things today. You are the kindest people I have ever met."),
      L("A", "warm", "talk", "A smile is the best ingredient, Sid. And so is a friend who is willing to try something new."),
      L("B", "joy", "dance", "A golden lemon! I will put it on my head, and wear it like a crown!"),
      L("N", "warm", "talk", "And that is the story of the lemonade stand that saved the day, and the rival who became a friend. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
