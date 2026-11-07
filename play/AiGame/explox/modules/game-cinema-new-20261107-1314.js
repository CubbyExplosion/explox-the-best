// ─── NEW MOVIE (made automatically): The Wizard Who Forgot His Spells — a castle comedy with a forgetful wizard, a brave kid and a sensible king.
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
  title: "The Wizard Who Forgot His Spells", genre: "🧙 Castle Comedy", price: 30, bg: "#2a1a4a", icons: "🧙✨🏰", comedy: true,
  cast: { A: { role: "Wizard Wobble", kind: "wizard", pers: "goof", move: "SPARKLE BLAST KICK", mtype: "kick", fav: "Abracadabra, or was it abracadoodle?", say: "Sorry, I forgot the magic word again." }, B: { role: "Squire Sam", kind: "hero", pers: "hero", move: "BRAVE BOOT", mtype: "kick", fav: "Brave is just scared plus trying.", say: "I know, I should read the spell book. I never do." }, C: { role: "King Cuthbert", kind: "king", pers: "wise", move: "ROYAL SPIN", mtype: "spin", fav: "A calm mind finds a good answer.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "🧙 One forgetful wizard...", dur: 2200 }, { text: "✨ One big royal feast...", dur: 2200 }, { text: "🏰 And no spells at all!", dur: 2400 }, { text: "THE WIZARD WHO FORGOT HIS SPELLS", dur: 3000 }],
  scenes: [
    S("castle", "day", "book", "In the castle, King Cuthbert asks Wizard Wobble to make magic for the royal feast.", [
      L("N", "warm", "walk", "In a tall stone castle on a green hill, the royal kitchen was bustling with cooks and pots."),
      L("C", "happy", "talk", "Wizard Wobble, tonight is the royal feast. I would like some magic, to make the dinner truly special."),
      L("A", "joy", "dance", "Magic? No problem, Your Majesty! I am the greatest wizard in the kingdom! Watch this!"),
      L("N", "curious", "magic", "Wobble waved his wand, took a deep breath, and opened his mouth to say the magic word."),
      L("A", "worried", "talk", "Abracadabra, or was it abracadoodle? Or abraca-noodle? Oh dear."),
      L("N", "surprised", "look", "A small puff of purple smoke came out of the wand, and a single rubber duck landed in the soup."),
      L("C", "surprised", "look", "A rubber duck? In the soup? Wobble, what happened?"),
      L("A", "sad", "talk", "I think I forgot all my spells. Every single one."),
    ]),
    S("castle", "day", "book", "Squire Sam suggests looking in the old spell book.", [
      L("B", "curious", "talk", "Wizard Wobble, do you have a spell book? Maybe the spells are written down."),
      L("A", "worried", "look", "I do, but it is in the high tower, behind a thousand cobwebs. And I lost the key."),
      L("C", "serious", "talk", "A calm mind finds a good answer. Sam, would you go up and help Wobble search?"),
      L("B", "determined", "talk", "Brave is just scared plus trying. I will go. Come on, Wobble, let us climb the tower."),
      L("N", "excited", "climb", "The wizard and the squire climbed the winding stone stairs, one hundred and twelve steps."),
      L("A", "worried", "exercise", "Huff, puff, huff. Why does a tower have to be so tall? Why not a nice flat tower?"),
      L("B", "joy", "talk", "Almost there, Wobble! Think of it as a giant staircase to adventure!"),
      L("N", "curious", "look", "At the very top, there was a round wooden door, covered in glowing, sparkly cobwebs."),
    ]),
    S("castle", "dusk", "lantern", "In the tower, they find the spell book, and a very funny problem.", [
      L("N", "curious", "sneak", "The door creaked open, and inside, the tower room was full of dust and dancing candlelight."),
      L("B", "surprised", "look", "Look at all these books! Which one is your spell book, Wobble?"),
      L("A", "worried", "talk", "I think it is the big purple one, with the sparkly star on the cover."),
      L("N", "surprised", "look", "But when Sam opened the big purple book, all of the pages were blank."),
      L("B", "shocked", "look", "Wobble, there is nothing written here. The pages are completely empty!"),
      L("A", "shocked", "look", "My spells! They have vanished! Who would take a wizard's spells?"),
      L("N", "surprised", "look", "Then, something small and fluffy peeked out from behind the bookshelf, holding a tiny pen."),
      L("B", "curious", "talk", "Wobble, I think we found the thief. It is a very little, very sleepy mouse."),
    ]),
    S("castle", "dusk", "lantern", "The mouse explains: the spells were erased by a sneeze.", [
      L("N", "warm", "talk", "The mouse blinked, and held up the tiny pen, and squeaked in a small, shy voice."),
      L("B", "curious", "talk", "He says his name is Mimi. And she was only trying to clean the dusty pages."),
      L("A", "curious", "talk", "Clean the pages? But the spells were written in sparkly ink!"),
      L("N", "warm", "talk", "Mimi squeaked again, and pointed at a tiny eraser, and then at her own little nose."),
      L("B", "joy", "talk", "She says she sneezed, and the eraser flew everywhere, and rubbed out the spells by accident."),
      L("A", "relieved", "talk", "Oh, it was an accident! Mimi, it is all right. I thought I was a useless old wizard."),
      L("B", "warm", "talk", "Do not worry, Wobble. We can write them again, together. Do you remember any of the spells?"),
      L("A", "determined", "write", "Hmm. I remember a few. Let us start with the easy ones, and see how far we get."),
    ]),
    S("castle", "night", "star", "They rewrite the spells in a funny, creative way.", [
      L("N", "joy", "write", "All night, Wobble, Sam and Mimi wrote down new spells, one page at a time, by candlelight."),
      L("A", "joy", "write", "Spell number one, to make things float. Say, floaty-floaty-fluff!"),
      L("B", "joy", "write", "Spell number two, to make a snack appear. Say, yummy-yummy-pop!"),
      L("N", "joy", "write", "Mimi added tiny, careful drawings of stars, hearts and tiny cheese wedges in the margins."),
      L("A", "surprised", "look", "These are not the same as my old spells. But they are even better! Simpler, and sillier!"),
      L("B", "joy", "dance", "A wizard with brand-new spells! Wobble, you are the most creative wizard in the whole kingdom!"),
      L("A", "relieved", "talk", "Thank you, Sam. Thank you, Mimi. I think I needed a fresh start."),
      L("N", "warm", "photo", "By sunrise, the big purple book was full of new, sparkly spells, shining in the morning light."),
    ]),
    S("castle", "dusk", "trophy", "The royal feast begins, and the new magic is a hit.", [
      L("N", "excited", "party", "That evening, the great hall was full of lords, ladies, jesters and hungry guests."),
      L("C", "happy", "talk", "Welcome, everyone, to the royal feast! Wizard Wobble will start us off with a special spell."),
      L("A", "worried", "talk", "No pressure, no pressure. Deep breath. Just remember what we wrote."),
      L("B", "warm", "talk", "You can do it, Wobble. Say the words, nice and loud."),
      L("A", "determined", "magic", "Yummy-yummy-pop! Floaty-floaty-fluff! Sparkle, sparkle, shine!"),
      L("N", "joy", "magic", "Sparkles filled the air, and dozens of glowing plates floated gently down onto the long tables."),
      L("N", "joy", "party", "On each plate was a delicious dinner, hot, golden and perfectly cooked."),
      L("C", "joy", "talk", "Marvelous! Wobble, that is the best magic I have ever seen!"),
    ]),
    S("castle", "night", "star", "A funny final twist: one spell goes a little too far.", [
      L("N", "joy", "eat", "The guests ate and laughed, and the music played, and everyone was happy."),
      L("A", "joy", "dance", "For my final trick, a floaty dance! Floaty-floaty-fluff, everybody!"),
      L("N", "surprised", "fly", "Suddenly, the whole room began to float up, lords, ladies, plates, and even the royal throne."),
      L("C", "shocked", "fly", "Wobble! We are all floating! Is this part of the show?"),
      L("A", "shocked", "fly", "Oops! I said it too loud! How do I stop it? Is there a down spell?"),
      L("B", "joy", "juggle", "Do not worry, Wobble! This is fun! Look, I am juggling the dinner rolls in the air!"),
      L("N", "joy", "party", "Everyone laughed and spun in the air, until Wobble remembered the spell, drifty-drifty-down."),
      L("N", "relieved", "party", "Gently, all the guests floated back to their chairs, giggling, and gave Wobble a standing ovation."),
    ]),
    S("castle", "night", "heart", "The king thanks everyone, and the friends celebrate.", [
      L("C", "warm", "talk", "Wizard Wobble, you forgot your old spells. But you found something better."),
      L("A", "warm", "talk", "I did, Your Majesty. A squire who believes in me, and a little mouse who helped."),
      L("N", "joy", "photo", "The king gave Mimi a tiny golden crown, and made her the Royal Spell Keeper."),
      L("C", "happy", "talk", "A calm mind finds a good answer, and a kind heart finds even better friends."),
      L("A", "joy", "dance", "Abracadabra, or was it abracadoodle? I do not care! I have the best friends in the world!"),
      L("B", "joy", "highfive", "Brave is just scared plus trying. And we did it, Wobble!"),
      L("N", "joy", "party", "The whole castle sang and danced until the stars came out, and the moon smiled down."),
      L("N", "warm", "talk", "And that is the story of the wizard who forgot his spells, and the friends who helped him remember. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
