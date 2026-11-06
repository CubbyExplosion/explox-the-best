// ─── NEW MOVIE (made automatically): The Big Explox Quiz Show — a game-show comedy with a wise professor, a goofy buzzer robot and a nervous cat.
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
  title: "The Big Explox Quiz Show", genre: "🎤 Game Show Comedy", price: 30, bg: "#2a1a4a", icons: "🎤🧠🏆", comedy: true,
  cast: { A: { role: "Professor Pip", kind: "wizard", pers: "wise", move: "SPARKLE BLAST KICK", mtype: "kick", fav: "Think first, buzz later.", say: "Sorry. I am talking too much again." }, B: { role: "Buzzer the Robot", kind: "robot", pers: "goof", move: "LASER PUNCH", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I pressed the buzzer by mistake." }, C: { role: "Cleo the Cat", kind: "cat", pers: "nervous", move: "CLAW FLURRY", mtype: "kick", fav: "I have a very good bad feeling.", say: "My whiskers will not stop shaking." } },
  trailer: [{ text: "🎤 One big quiz show...", dur: 2200 }, { text: "🧠 One very tricky question...", dur: 2200 }, { text: "🔔 And one buzzer that will not stop buzzing!", dur: 2400 }, { text: "THE BIG EXPLOX QUIZ SHOW", dur: 3000 }],
  scenes: [
    S("cityhall", "day", "trophy", "At Explox City Hall, the biggest quiz show of the year is about to begin.", [
      L("N", "excited", "party", "The studio lights flashed, the audience cheered and the golden trophy sparkled on the stage."),
      L("A", "warm", "walk", "Welcome, everybody, to the Big Explox Quiz Show! I am Professor Pip, your host."),
      L("N", "excited", "party", "The crowd roared, and two contestants stepped up to the glowing podiums."),
      L("B", "joy", "dance", "Hello, hello! I am Buzzer the Robot, and I love buzzers. Buzz, buzz, buzz!"),
      L("C", "scared", "panic", "Um, hello. I am Cleo the Cat. I am very nervous. My whiskers are shaking."),
      L("A", "warm", "talk", "Do not worry, Cleo. Just take a deep breath, and think about the questions."),
      L("B", "joy", "eat", "I brought snacks, in case the questions are hard. And in case they are easy."),
      L("A", "excited", "magic", "Contestants, are you ready? The first round begins, now!"),
    ]),
    S("cityhall", "day", "trophy", "Round one is full of funny questions, and some very silly answers.", [
      L("A", "serious", "write", "Question one: what do cows drink? Cleo, you buzzed first."),
      L("C", "worried", "talk", "Um, milk? No, wait. Water! I think the answer is water."),
      L("A", "joy", "talk", "Correct! Cows drink water. Ten points for Cleo!"),
      L("N", "joy", "party", "The audience clapped, and Cleo's tail puffed up with happiness."),
      L("A", "serious", "write", "Question two: how many legs does a spider have? Buzzer?"),
      L("B", "excited", "jump", "Buzz! Buzz! Easy! A spider has, um, seventeen!"),
      L("A", "warm", "talk", "Not quite, Buzzer. The answer is eight. But I like your confidence!"),
      L("B", "joy", "dance", "Eight, seventeen, who is counting? Next question, please!"),
    ]),
    S("cityhall", "day", "bolt", "Trouble strikes: Buzzer's buzzer gets stuck, and the whole studio goes wild.", [
      L("N", "surprised", "look", "Just as the third question was about to begin, something strange happened."),
      L("B", "shocked", "panic", "Oh no. My buzzer is stuck! Buzz, buzz, buzz, buzz, buzz!"),
      L("N", "shocked", "panic", "The buzzer began to ring and ring, so loudly that the studio lights flickered and the confetti popped out."),
      L("C", "scared", "panic", "It is so loud! Make it stop! My ears are going to fall off!"),
      L("A", "worried", "run", "Everybody stay calm! I will find the off switch!"),
      L("B", "worried", "look", "I do not know where the off switch is. Is it on my head, or on my back?"),
      L("N", "worried", "juggle", "Balloons fell from the ceiling, the camera spun around, and the audience covered their ears."),
      L("A", "determined", "talk", "Beep, hold still! The switch is under your left arm!"),
    ]),
    S("cityhall", "day", "bolt", "The professor fixes the buzzer, and the show gets back on track.", [
      L("A", "determined", "work", "Hold still, Buzzer. One little flip of the switch, and the buzzing will stop."),
      L("N", "relieved", "work", "Click. The buzzer went quiet, and the studio was suddenly peaceful."),
      L("B", "relieved", "talk", "Phew. My ears feel much better. Thank you, Professor."),
      L("C", "relieved", "talk", "Is the noise over? Can I take my paws off my ears now?"),
      L("A", "warm", "talk", "The noise is over, Cleo. Let us go on to round two, the picture round."),
      L("N", "excited", "party", "The big screen lit up, and the audience cheered as the first picture appeared."),
      L("A", "curious", "look", "Contestants, what do you see in this picture?"),
      L("B", "curious", "look", "A strange, round, orange thing, with leaves on top."),
    ]),
    S("library", "day", "book", "The next round is held in the library, where the questions become real puzzles.", [
      L("N", "curious", "walk", "For the special round, the contestants moved into the Explox Library, with its tall shelves and quiet corners."),
      L("A", "serious", "write", "Find the three books with the red covers, and read the secret word hidden inside."),
      L("C", "determined", "climb", "I will climb the shelves! Cats are great at climbing. I can reach the top book!"),
      L("B", "excited", "run", "I will scan the whole library with my laser eyes! Beep beep beep!"),
      L("C", "surprised", "look", "I found the first red book! It says: The secret word starts with a P."),
      L("B", "surprised", "look", "I found the second one! It says: The secret word has the letters I and Z."),
      L("N", "curious", "look", "The third red book was at the very top, and it had a tiny note inside."),
      L("A", "joy", "talk", "What does it say, Cleo? Read it out loud!"),
    ]),
    S("library", "day", "book", "The final puzzle has a surprising answer, and the contestants have to work together.", [
      L("C", "curious", "write", "The note says: the answer is what you get when you add P, I and Z, twice."),
      L("B", "curious", "write", "P, I, Z, P, I, Z. That is, um, a very long word. Is it Pizzapizza?"),
      L("A", "curious", "talk", "Interesting guess, Buzzer. What if you add the letters A and Z at the end?"),
      L("C", "joy", "jump", "Pizza! The word is pizza! It is the secret word!"),
      L("B", "joy", "dance", "Pizza! I love that word! And I know the answer is delicious!"),
      L("A", "joy", "highfive", "Correct! You two solved the puzzle together. That is the true spirit of this show."),
      L("N", "joy", "party", "The audience cheered so loudly that a pile of books fell off the shelf, with a gentle bump."),
      L("C", "joy", "talk", "Together, Buzzer! We make a great team!"),
    ]),
    S("cityhall", "dusk", "trophy", "Back in the studio, the final round brings a big surprise.", [
      L("N", "excited", "walk", "The three friends returned to the studio for the big final round, where the golden trophy was waiting."),
      L("A", "serious", "write", "The final question is worth a hundred points. Both of you are tied, so it is a real nail-biter."),
      L("C", "worried", "talk", "A hundred points! My whiskers are shaking again. What if I get it wrong?"),
      L("B", "warm", "talk", "Do not worry, Cleo. It is only a game. I will cheer for you either way."),
      L("A", "serious", "talk", "The question: what is the best thing about friends?"),
      L("C", "surprised", "look", "That is the question? It is not about math, or spiders, or cows?"),
      L("B", "curious", "look", "I think the answer is, um, friends share their snacks."),
      L("C", "warm", "talk", "I think the answer is, friends help each other when things get loud."),
    ]),
    S("cityhall", "dusk", "trophy", "The professor makes a surprising decision, and everyone wins.", [
      L("A", "warm", "talk", "Both answers are correct. Friends share snacks, and friends help each other."),
      L("N", "joy", "party", "The audience jumped to their feet and cheered, and the golden trophy glowed with a warm, happy light."),
      L("A", "joy", "magic", "Therefore, I declare that both contestants are the champions of the Big Explox Quiz Show!"),
      L("B", "shocked", "look", "We both won? Is that allowed? Can a robot and a cat share a trophy?"),
      L("C", "joy", "dance", "We both won! We are champions! My whiskers are not shaking anymore!"),
      L("N", "joy", "photo", "The two friends held the trophy together, while the cameras flashed and the confetti rained down."),
      L("A", "warm", "talk", "Think first, buzz later. And always be kind to your friends."),
      L("N", "warm", "talk", "And that is how a robot and a cat won the big Explox quiz show together. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
