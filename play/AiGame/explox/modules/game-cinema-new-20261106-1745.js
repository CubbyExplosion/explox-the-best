// ─── NEW MOVIE (made automatically): The Case of the Giant Sandwich — a police-station comedy mystery with a detective, a goofy robot officer and a wise cat chief.
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
  title: "The Case of the Giant Sandwich", genre: "🔍 Comedy Mystery", price: 30, bg: "#1b2540", icons: "🥪🔍🐱", comedy: true,
  cast: { A: { role: "Detective Dash", kind: "detective", pers: "hero", move: "MAGNIFYING FLASH", mtype: "kick", fav: "Every crumb is a clue!", say: "I know, I should sleep more. The cases never stop." }, B: { role: "Officer Beep", kind: "robot", pers: "goof", move: "LASER PUNCH", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I pressed the siren again." }, C: { role: "Chief Fluff", kind: "cat", pers: "wise", move: "CLAW FLURRY", mtype: "kick", fav: "Think first, chase later.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "🥪 One giant sandwich...", dur: 2200 }, { text: "🔍 One missing lunch...", dur: 2200 }, { text: "🐜 And a very tiny thief!", dur: 2400 }, { text: "THE CASE OF THE GIANT SANDWICH", dur: 3000 }],
  scenes: [
    S("police", "day", "book", "At the Explox Police Station, Chief Fluff discovers that her giant lunch sandwich has disappeared.", [
      L("N", "serious", "walk", "It was a sunny Monday morning at the Explox Police Station, and everything was calm."),
      L("C", "shocked", "panic", "My sandwich! My giant sandwich! It was right here on my desk, and now it is gone!"),
      L("B", "surprised", "look", "Chief, are you sure? It was as big as a pillow. Where would it go?"),
      L("C", "angry", "talk", "Beep, I made it myself. Turkey, cheese, tomatoes and three kinds of pickles."),
      L("A", "serious", "write", "Detective Dash is on the case. Nobody touch anything, and nobody eat anything."),
      L("B", "worried", "talk", "Too late. I already ate my crackers. Does that count as touching anything?"),
      L("A", "warm", "talk", "Crackers are fine, Beep. Let us look for clues."),
      L("C", "determined", "talk", "Find my sandwich, Dash. The whole station is counting on you."),
    ]),
    S("police", "day", "book", "Dash checks the desk for clues and finds something strange.", [
      L("A", "curious", "look", "Look at this. A tiny trail of crumbs, leading to the window."),
      L("B", "curious", "look", "Crumbs! Can I taste one? For science?"),
      L("A", "serious", "talk", "Beep, do not eat the evidence."),
      L("A", "curious", "write", "These crumbs are very small. Whoever took the sandwich was very tiny."),
      L("B", "surprised", "look", "Oh look! A little footprint! It has six tiny legs!"),
      L("A", "excited", "write", "Six legs, tiny crumbs and a very big sandwich. This is getting interesting."),
      L("C", "curious", "talk", "A sneaky six-legged thief? Follow the crumbs, Detective."),
      L("B", "excited", "run", "I will get my siren! Wee-oo, wee-oo, wee-oo!"),
    ]),
    S("city", "day", "car", "The team follows the crumbs through the busy city streets.", [
      L("N", "curious", "sneak", "The little trail of crumbs wound around lampposts, past a bakery and across a busy street."),
      L("A", "determined", "sneak", "Stay quiet, team. The thief could be anywhere."),
      L("B", "worried", "sneak", "I am sneaking as quietly as I can. Beep. Beep. Sorry, that was my belly."),
      L("C", "serious", "look", "Look at those cars. The trail goes right under that bus."),
      L("A", "shocked", "panic", "Quick, before the bus starts! Everyone, jump over the puddle!"),
      L("B", "joy", "jump", "Boing! I am a jumping robot! Look at me go!"),
      L("N", "surprised", "run", "They hopped over the puddle, dodged a bike and landed in front of the market."),
      L("A", "relieved", "talk", "The trail continues into the market. Let us go in."),
    ]),
    S("market", "day", "pizza", "At the market, the friends find a clue and a very silly suspect.", [
      L("N", "joy", "shop", "The market was full of fruit stalls, bread baskets and cheerful shoppers."),
      L("A", "curious", "talk", "Excuse me, did you see a tiny thief carrying a giant sandwich?"),
      L("N", "curious", "talk", "The fruit seller scratched his head. I saw a pigeon with a pickle, and a boy with a balloon."),
      L("B", "excited", "look", "A pigeon with a pickle! That is a suspicious snack!"),
      L("C", "serious", "write", "A pickle is a clue. The sandwich had three kinds of pickles."),
      L("A", "determined", "look", "Where did the pigeon go? Which way did it fly?"),
      L("N", "curious", "fly", "The seller pointed to the old oak tree in the park, where the pigeon was just landing."),
      L("B", "joy", "run", "To the park! Wee-oo, wee-oo, wee-oo!"),
    ]),
    S("park", "day", "tree", "In the park, they question the pigeon, who has a surprising alibi.", [
      L("A", "serious", "talk", "Mister Pigeon, we are looking for a missing sandwich. Do you know anything?"),
      L("N", "surprised", "talk", "The pigeon cooed, shook his head and dropped the pickle on Beep's foot."),
      L("B", "surprised", "look", "A pickle! He gave me a pickle! That means he is innocent."),
      L("C", "curious", "talk", "Or it means he is a very generous thief. Pigeon, where were you at noon?"),
      L("N", "curious", "talk", "The pigeon pointed with his wing to the lake, where a tiny parade was passing by."),
      L("A", "shocked", "look", "A parade? A tiny parade? Look at that, team!"),
      L("B", "shocked", "look", "A hundred ants, carrying a giant sandwich on their backs!"),
      L("C", "surprised", "look", "The thief was not one tiny creature. It was a whole ant parade!"),
    ]),
    S("park", "day", "sun", "The ant parade turns out to have a very good reason.", [
      L("A", "warm", "talk", "Excuse me, little ants. You are carrying the Chief's sandwich."),
      L("N", "warm", "talk", "The biggest ant stepped forward and bowed. We are sorry, but today is our Queen's birthday."),
      L("B", "surprised", "look", "A birthday? And you needed the sandwich for the cake?"),
      L("N", "joy", "dance", "The ants nodded and danced a tiny, happy dance, with the sandwich on their backs."),
      L("C", "warm", "talk", "A birthday party for a queen. That is a good reason. But you could have asked."),
      L("N", "sad", "talk", "We tried, but your window was too high, and your voices are too big, said the ants."),
      L("A", "warm", "talk", "Next time, knock on the door, and we will help you."),
      L("C", "relieved", "talk", "And I will make a second, smaller sandwich for the party."),
    ]),
    S("park", "dusk", "sun", "The police team joins the ant queen's birthday party.", [
      L("N", "joy", "party", "The party was held under a big mushroom, with tiny flags and tiny balloons."),
      L("B", "joy", "drum", "I brought my drum! Boom boom, beep beep, happy birthday to the queen!"),
      L("N", "joy", "dance", "A hundred ants cheered, and the queen waved from her tiny golden throne."),
      L("C", "happy", "cook", "I made a mini-sandwich for each of you, with a pickle on top."),
      L("A", "joy", "photo", "Everybody say cheese! Or crumbs! Or both!"),
      L("B", "joy", "eat", "Best birthday party I have ever been to. And I do not even like birthdays."),
      L("C", "warm", "talk", "Think first, chase later. That is how we solved the case without a single siren."),
    ]),
    S("police", "dusk", "trophy", "Back at the station, the team celebrates the solved case.", [
      L("N", "warm", "walk", "That evening, the three friends walked back to the Explox Police Station."),
      L("A", "warm", "write", "I will write the report: sandwich was not stolen, it was borrowed for a royal birthday."),
      L("B", "joy", "write", "And I will add: no robots, cats or detectives were harmed in this case."),
      L("C", "warm", "talk", "Thank you both. I do not even miss my sandwich anymore."),
      L("N", "joy", "party", "The mayor stopped by with a special medal for the team, a golden badge in the shape of a pickle."),
      L("A", "joy", "highfive", "Another case solved. Every crumb really is a clue."),
      L("N", "warm", "talk", "And that is the case of the giant sandwich. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
