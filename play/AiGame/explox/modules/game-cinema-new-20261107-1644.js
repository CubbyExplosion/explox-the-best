// ─── NEW MOVIE (made automatically): The Hidden Oasis — a desert adventure with a wise guide, a goofy dino and a nervous little explorer.
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
  title: "The Hidden Oasis", genre: "🏜️ Desert Adventure", price: 30, bg: "#5a3a1a", icons: "🏜️🌴💧", comedy: true,
  cast: { A: { role: "Guide Nadia", kind: "pioneer", pers: "wise", move: "SAND SWEEP", mtype: "spin", fav: "A map is only a friend; look with your heart.", say: "Sorry. I am talking too much again." }, B: { role: "Dune the Dino", kind: "dino", pers: "goof", move: "TAIL WHIP", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, I sneezed up a sandstorm." }, C: { role: "Little Zee", kind: "hero", pers: "nervous", move: "COMPASS SPIN", mtype: "kick", fav: "I have a very good bad feeling.", say: "My hands will not stop shaking." } },
  trailer: [{ text: "🏜️ One huge desert...", dur: 2200 }, { text: "💧 One almost empty water bottle...", dur: 2200 }, { text: "🌴 And a secret oasis to find!", dur: 2400 }, { text: "THE HIDDEN OASIS", dur: 3000 }],
  scenes: [
    S("desert", "dawn", "sun", "At dawn, three explorers begin a long walk across the desert.", [
      L("N", "warm", "walk", "At sunrise, the golden sand of the Explox desert stretched out in every direction, smooth and wavy."),
      L("A", "happy", "talk", "Good morning, explorers! I am Guide Nadia. Today, we search for the Hidden Oasis."),
      L("C", "worried", "look", "A hidden oasis? In all this sand? It looks so big, and so empty."),
      L("B", "joy", "dance", "Oasis, oasis! I love oases! Palm trees, cool water and snacks! Is there a snack involved?"),
      L("A", "warm", "talk", "Probably dates and coconuts, Dune. But first, we must find it. Everyone, check your water bottles."),
      L("C", "worried", "talk", "I only have a little bit left. I have a very good bad feeling about this."),
      L("A", "warm", "talk", "A map is only a friend. We look with our eyes, and our hearts. Let us go, slowly and carefully."),
      L("N", "joy", "walk", "The three friends set off, their footprints trailing across the rippling sand."),
    ]),
    S("desert", "day", "sun", "The sun gets hot, and Dune makes a funny mess.", [
      L("N", "serious", "walk", "By noon, the sun was high and hot, and the sand shimmered like a golden river."),
      L("C", "worried", "walk", "It is so hot. My throat is dry. How much farther is it, Nadia?"),
      L("A", "serious", "talk", "Not far. But we must rest in the shade of that big rock, and drink a little water."),
      L("B", "joy", "dance", "A rock! A big shady rock! I will dance in the shade! La la la!"),
      L("N", "surprised", "look", "Dune danced so hard that he kicked up a big cloud of sand, which swirled around everybody."),
      L("C", "shocked", "panic", "Achoo! Dune! Sand in my nose! Sand in my ears! Sand in my hat!"),
      L("B", "worried", "talk", "Oops. Sorry, Zee. I only wanted to dance. I will dance in smaller circles."),
      L("A", "warm", "talk", "It is all right. A little sand never hurt anyone. Let us share some water, and rest a bit."),
    ]),
    S("desert", "day", "bolt", "A sandstorm blows in, and the friends are lost.", [
      L("N", "worried", "look", "As they got ready to leave, a strange yellow cloud rose on the horizon, and a strong wind began to blow."),
      L("A", "serious", "talk", "Sandstorm! Everyone, cover your faces, and hold hands! Do not let go!"),
      L("N", "worried", "tugwar", "The three friends linked arms, and huddled low as the wind howled, and the sand whooshed all around."),
      L("B", "scared", "panic", "Whoa! I cannot see anything! Is that you, Nadia? Or is it a sand monster?"),
      L("C", "scared", "panic", "Hold on, everybody! I have your hand! I will not let go!"),
      L("N", "worried", "look", "For ten long minutes, the wind roared, and the sand swirled, and the sun vanished behind a golden cloud."),
      L("N", "relieved", "look", "Then, slowly, the wind calmed, and the sand settled, and the blue sky came back."),
      L("A", "worried", "look", "Everyone all right? Good. But the storm has changed the dunes. I do not recognize this place."),
    ]),
    S("desert", "dusk", "sun", "They are lost, and Zee finds a hidden clue.", [
      L("C", "scared", "talk", "We are lost! The dunes all look the same! And my water is almost gone!"),
      L("A", "warm", "talk", "Calm, Zee. Lost is only a place we have not named yet. Let us look around, slowly."),
      L("B", "sad", "talk", "I am hungry, and thirsty, and sandy. And I miss my snacks."),
      L("C", "curious", "look", "Wait. What is that, on the sand? It is a small, shiny, green leaf."),
      L("A", "surprised", "look", "A green leaf, in the middle of the desert? Where did it come from?"),
      L("C", "determined", "look", "It must have blown here on the wind. Which way was the wind blowing, Nadia?"),
      L("A", "excited", "talk", "From the west, over those dunes. Zee, you have found the first clue! Plants only grow near water!"),
      L("B", "joy", "jump", "The oasis! It is that way! Follow the leaf! Hooray for Zee!"),
    ]),
    S("desert", "dusk", "star", "The friends follow the clue, and the twist reveals itself.", [
      L("N", "excited", "walk", "The three friends climbed the tall, golden dunes, one step at a time, as the sun began to set."),
      L("C", "worried", "climb", "I am so tired. My legs are like jelly. But I will not give up."),
      L("A", "warm", "talk", "That is the spirit, Zee. Nobody finds an oasis by sitting down. One step at a time."),
      L("N", "joy", "climb", "At the very top of the tallest dune, they stopped, and gasped, and stared."),
      L("N", "surprised", "look", "Below them, in a little valley, a circle of tall green palm trees glittered around a pool of sparkling blue water."),
      L("B", "shocked", "look", "The Hidden Oasis! It is real! It is the most beautiful place in the whole world!"),
      L("C", "joy", "jump", "We found it! I led us there! With one little leaf!"),
      L("A", "joy", "highfive", "Well done, Zee. You looked with your heart, and it led us right to the water."),
    ]),
    S("desert", "night", "lantern", "At the oasis, they drink, eat and meet a surprise guest.", [
      L("N", "joy", "run", "The three friends slid down the dune, and ran to the cool, clear water."),
      L("B", "joy", "eat", "Water! Glorious water! And dates! And coconuts! Dune is the happiest dinosaur on the planet!"),
      L("C", "relieved", "bubbles", "Splash, splash! This is the best drink of water I have ever had in my whole life!"),
      L("A", "warm", "camp", "Let us make a camp here for the night. We can rest, and travel home in the morning."),
      L("N", "curious", "look", "As the stars came out, a small shape stepped out from behind the palm trees, a little brown fennec fox with huge ears."),
      L("N", "warm", "talk", "The fox sniffed the air, and gave a small, polite squeak, and pushed a coconut toward Zee."),
      L("C", "joy", "talk", "She gave us a coconut! She is the guardian of the oasis! Thank you, little fox!"),
      L("A", "warm", "talk", "A kind welcome, from a kind friend. A good oasis always has a good keeper."),
    ]),
    S("desert", "night", "star", "Under the stars, the friends share a quiet, funny moment.", [
      L("N", "warm", "camp", "That night, the three friends sat around a little fire, under a sky full of a million bright stars."),
      L("B", "joy", "eat", "These dates are the best snack ever! I will take eleven more, please."),
      L("C", "happy", "talk", "I was so scared today. But I did it anyway, and I found the oasis."),
      L("A", "warm", "talk", "Being brave does not mean not being scared, Zee. It means doing it anyway."),
      L("B", "joy", "dance", "And dancing while you do it! Look, I am the oasis dancing dinosaur!"),
      L("N", "joy", "dance", "Dune twirled in the firelight, and splashed into the pool, and sent a big fountain of water into the air."),
      L("C", "joy", "talk", "Ha ha! Dune, you are like a happy waterfall! Do it again!"),
      L("N", "joy", "photo", "The fox watched from a rock, and gave a tiny, delighted yip, and the stars twinkled brighter."),
    ]),
    S("desert", "dawn", "sun", "At sunrise, the friends head home with a promise.", [
      L("N", "warm", "walk", "In the morning, the sun rose over the palm trees, painting the sand gold and pink."),
      L("A", "warm", "talk", "It is time to head home, explorers. But we will tell everyone about the oasis, and keep it safe."),
      L("C", "warm", "talk", "I will draw a new map, and mark the leaf, and the dunes, and the big palm trees."),
      L("B", "joy", "talk", "And I will leave a little present for the fox. A jar of dates, and a thank-you note."),
      L("N", "joy", "write", "Zee wrote a small note in the sand, with a stick. Thank you, oasis. We will come back."),
      L("A", "warm", "talk", "A map is only a friend. A true friend is the one who walks beside you."),
      L("N", "joy", "walk", "The three friends set off across the golden dunes, with fresh water, full tummies and happy hearts."),
      L("N", "warm", "talk", "And that is the story of the hidden oasis, and the little explorer who found it. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
