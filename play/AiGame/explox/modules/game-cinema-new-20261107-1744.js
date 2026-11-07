// ─── NEW MOVIE (made automatically): The Surprise Party Mix-Up — a neighborhood comedy with a sweet nana, a goofy robot and a curious girl.
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
  title: "The Surprise Party Mix-Up", genre: "🎉 Neighborhood Comedy", price: 30, bg: "#4a2a4a", icons: "🎉🎂🎈", comedy: true,
  cast: { A: { role: "Nana Pearl", kind: "grandma", pers: "sweet", move: "KNITTING NEEDLE SPIN", mtype: "spin", fav: "A party is only as good as its friends.", say: "I could not say no to a hungry guest. I never can." }, B: { role: "Pop the Robot", kind: "robot", pers: "goof", move: "CONFETTI BLAST", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I popped the balloon again." }, C: { role: "Curious Cora", kind: "hero", pers: "hero", move: "MAGNIFYING FLASH", mtype: "kick", fav: "Every secret has a clue.", say: "I know, I should not peek. I always do." } },
  trailer: [{ text: "🎉 One big secret party...", dur: 2200 }, { text: "🎂 One very mixed-up plan...", dur: 2200 }, { text: "🎈 And a surprise for the wrong person!", dur: 2400 }, { text: "THE SURPRISE PARTY MIX-UP", dur: 3000 }],
  scenes: [
    S("suburbs", "day", "sun", "Nana Pearl and Pop plan a secret party for their neighbor.", [
      L("N", "warm", "walk", "It was a sunny Saturday on Maple Street, and Nana Pearl's kitchen smelled of vanilla and cinnamon."),
      L("A", "happy", "cook", "Pop, today is the surprise party for our neighbor, Mr. Bumble. He has been so kind to everyone."),
      L("B", "joy", "dance", "A secret party! I love secrets! I love parties! I love secret parties! Beep, beep!"),
      L("A", "warm", "talk", "Shh, Pop. It is a secret, so we must be very quiet. Not a word to anybody."),
      L("B", "joy", "talk", "My lips are sealed! Look, I even put tape over my speaker. Mmmf, mmmf, mmmf!"),
      L("A", "joy", "write", "I will bake the cake, and you blow up the balloons. The party starts at four o'clock."),
      L("B", "excited", "work", "Balloons! I will blow up a hundred! Maybe a thousand! Wheee!"),
      L("A", "warm", "talk", "A party is only as good as its friends. Let us make it wonderful."),
    ]),
    S("suburbs", "day", "heart", "Cora overhears, and mixes up the plan.", [
      L("N", "curious", "walk", "Just then, a girl named Cora walked by the kitchen window, and heard Pop humming."),
      L("B", "joy", "dance", "Mmm, hum, hum. Surprise party for Mr. B, hum, hum. Four o'clock, hum."),
      L("C", "surprised", "look", "A surprise party? At four o'clock? For a person with a B? Oh, I know! It must be for Bella, my best friend!"),
      L("C", "excited", "jump", "Bella's birthday is this week! Nana Pearl must be planning it! I will help!"),
      L("C", "excited", "run", "Oh, I must tell all of Bella's friends! They have to come to the secret party!"),
      L("N", "joy", "run", "Cora ran from house to house, whispering the big secret to every child on the street."),
      L("C", "joy", "talk", "Four o'clock at Nana Pearl's house! It is a surprise for Bella! Please bring a gift, and do not tell!"),
      L("N", "worried", "look", "But she had mixed up the names, and Bella had no idea what was happening."),
    ]),
    S("suburbs", "day", "lantern", "Nana Pearl discovers a problem: two parties are about to happen.", [
      L("N", "joy", "work", "At half past three, Nana Pearl's living room was decorated with streamers, balloons and a big sign."),
      L("A", "happy", "talk", "Look at that banner, Pop. Happy Birthday, Mr. Bumble! It looks wonderful."),
      L("B", "joy", "dance", "And the cake is huge, with sprinkles! Sprinkles are my favorite part of any party!"),
      L("N", "surprised", "look", "Suddenly, the doorbell rang, and a group of twelve children rushed in, holding gifts."),
      L("C", "excited", "talk", "Surprise! Where is Bella? Is she hiding? Hello, everyone! Happy birthday, Bella!"),
      L("A", "shocked", "look", "Oh my goodness. Cora, this party is for Mr. Bumble, not for Bella. Whatever gave you that idea?"),
      L("C", "worried", "look", "Mr. Bumble? Not Bella? Oh no. I heard Pop say a B, and I mixed it up!"),
      L("B", "worried", "talk", "Oops. That was my fault. I hummed the secret out loud. Sorry, everybody."),
    ]),
    S("suburbs", "day", "lantern", "The friends make a plan to fix the mix-up.", [
      L("A", "warm", "talk", "Do not worry, Cora. It was a simple mistake. Let us think of a way to fix it."),
      L("C", "determined", "talk", "Every secret has a clue, and every mix-up has a fix. What if we make it a party for both?"),
      L("B", "excited", "jump", "A double party! Two guests of honor! Double the cake, double the balloons, double the fun!"),
      L("A", "joy", "talk", "What a lovely idea. Mr. Bumble and Bella can both be our guests of honor."),
      L("C", "joy", "talk", "But we only have one cake. And Mr. Bumble will arrive any minute."),
      L("B", "determined", "cook", "I have an idea! I will bake a second cake in two minutes, with my turbo oven!"),
      L("A", "worried", "talk", "Pop, I think a cake needs more than two minutes. Maybe we make cupcakes, instead."),
      L("N", "excited", "cook", "The whole group ran to the kitchen, and began to mix, stir and sprinkle, as fast as they could."),
    ]),
    S("suburbs", "dusk", "lantern", "Mr. Bumble arrives, and a funny moment follows.", [
      L("N", "excited", "party", "At four o'clock sharp, Mr. Bumble walked up the path, holding a small bag of cookies."),
      L("N", "joy", "party", "The door swung open, and everyone jumped out and shouted, Surprise!"),
      L("N", "surprised", "look", "Mr. Bumble was so startled that his hat flew off, and landed right on top of the big cake."),
      L("B", "shocked", "panic", "Oh no! The hat is in the frosting! Everybody, do not panic! I will rescue it!"),
      L("N", "joy", "juggle", "Pop reached out, and wobbled, and spun in a circle, and threw the hat in the air, and caught it on his head."),
      L("N", "joy", "party", "The whole room burst out laughing, and Mr. Bumble laughed the loudest of all."),
      L("A", "warm", "talk", "Happy birthday, Mr. Bumble! We hope you like surprises."),
      L("N", "warm", "look", "Mr. Bumble wiped a happy tear from his eye, and smiled a very wide smile."),
    ]),
    S("suburbs", "dusk", "heart", "A twist: Bella walks in, and it is her birthday too.", [
      L("N", "curious", "look", "Just then, a girl with a purple ribbon in her hair peeked in through the door."),
      L("C", "surprised", "look", "Bella! Come in, come in! I thought this was your party, but it was a mix-up!"),
      L("N", "surprised", "talk", "Bella blinked. Wait, how did you know today is my birthday?"),
      L("C", "shocked", "look", "Today is your birthday? For real? I had the wrong day in my head, and I was right on the week!"),
      L("A", "joy", "talk", "Well, how wonderful! A surprise party for Bella, after all, by pure accident."),
      L("B", "joy", "dance", "A double birthday! A double party! A double mix-up that turned into a double surprise!"),
      L("N", "joy", "party", "Twelve children, one robot, one nana and two guests of honor sang happy birthday, twice as loud."),
      L("N", "joy", "photo", "They shared the big cake, and the cupcakes, and the cookies, and took a big group photo."),
    ]),
    S("suburbs", "night", "star", "At the end of the day, everyone says thank you.", [
      L("N", "warm", "walk", "That night, the sun went down, and the stars came out, and the last guests waved goodbye."),
      L("C", "warm", "talk", "Nana Pearl, I am sorry about the mix-up. I should not have run off before I was sure."),
      L("A", "warm", "talk", "Cora, it turned out to be the best party Maple Street ever had. Mistakes can be happy surprises."),
      L("B", "joy", "talk", "And I learned not to hum secrets! Next time, I will just whistle them. Or write them on a napkin!"),
      L("N", "warm", "talk", "Mr. Bumble tapped his hat, and smiled. I have never had such a happy birthday, thank you."),
      L("C", "happy", "highfive", "A party is only as good as its friends. And these are the best friends in the world."),
      L("A", "warm", "talk", "Now, who wants the last cupcake?"),
      L("N", "warm", "talk", "And that is the story of the surprise party mix-up, and the happy accident that brought a whole street together. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
