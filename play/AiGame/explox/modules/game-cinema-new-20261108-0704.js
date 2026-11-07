// ─── NEW MOVIE (made automatically): The Honey Mystery of Pinecone Hill — a forest mystery with a brave ranger, a hungry dino and a wise beekeeper.
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
  title: "The Honey Mystery of Pinecone Hill", genre: "🍯 Forest Mystery", price: 30, bg: "#3a3a1a", icons: "🍯🐝🌲", comedy: true,
  cast: { A: { role: "Ranger Robin", kind: "hero", pers: "hero", move: "TRAIL BLAZER KICK", mtype: "kick", fav: "Follow the clues, not the crowd!", say: "I know, I should pack more snacks. I never do." }, B: { role: "Honeycomb the Dino", kind: "dino", pers: "goof", move: "TAIL WHIP", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, my tummy rumbled and scared the birds." }, C: { role: "Granny Bumble", kind: "wizard", pers: "wise", move: "BEE SWARM SPIN", mtype: "spin", fav: "Patience makes the sweetest honey.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "🍯 One missing honey jar...", dur: 2200 }, { text: "🐝 One buzzing mystery...", dur: 2200 }, { text: "🌲 And a trail through the forest!", dur: 2400 }, { text: "THE HONEY MYSTERY OF PINECONE HILL", dur: 3000 }],
  scenes: [
    S("nature", "dawn", "sun", "At sunrise, Granny Bumble discovers her honey is missing.", [
      L("N", "warm", "walk", "On top of Pinecone Hill, the morning sun shone on rows of little wooden beehives."),
      L("C", "happy", "work", "Good morning, my busy bees! Time to collect the golden honey for the Pinecone Hill Fair."),
      L("N", "surprised", "look", "But when Granny Bumble opened the big storage shed, every single honey jar was gone."),
      L("C", "shocked", "panic", "Oh my goodness! The honey! All sixty jars! Who could have taken them?"),
      L("N", "worried", "look", "A trail of sticky, golden drops led out of the shed, and into the trees."),
      L("C", "worried", "talk", "Ranger Robin! Honeycomb! Please come quickly! My honey has vanished!"),
      L("N", "excited", "run", "Ranger Robin and Honeycomb the Dino came running up the hill, as fast as they could."),
      L("A", "determined", "talk", "Do not worry, Granny. Follow the clues, not the crowd. We will find your honey."),
    ]),
    S("nature", "day", "tree", "The detectives follow the sticky trail, with a funny problem.", [
      L("A", "curious", "look", "Look at this. A sticky drop on a leaf. And another one, over there, on a rock."),
      L("B", "joy", "eat", "Mmm, honey! I will taste a drop, for science. Yum, it is delicious! Is there a snack involved?"),
      L("A", "serious", "talk", "Honeycomb, please do not eat the evidence. We need it to follow the trail."),
      L("B", "sad", "talk", "Sorry, Robin. I just got very hungry from all the walking. And the smell is wonderful."),
      L("C", "warm", "talk", "Honeycomb, here is a little bread, and a cup of tea. Now you can keep your tummy quiet."),
      L("B", "joy", "eat", "Thank you, Granny! Munch, munch, munch! Now I can sniff the trail with no distractions."),
      L("N", "curious", "sneak", "The three friends crept deeper into the forest, following the glittering golden drops."),
      L("A", "curious", "look", "The trail goes toward the old hollow log. Quietly, everyone. Let us see who is there."),
    ]),
    S("nature", "day", "tree", "At the hollow log, they find a very surprising clue.", [
      L("N", "serious", "sneak", "Behind the hollow log, a small clearing was full of tiny paw prints, and a big pile of leaves."),
      L("A", "curious", "look", "These paw prints are small, and round. They do not belong to any robber I have ever met."),
      L("B", "curious", "look", "And they smell like honey, and also like berries. Maybe it is a berry-honey monster!"),
      L("C", "serious", "talk", "Calm down, Honeycomb. Let us look carefully, and not jump to conclusions."),
      L("N", "surprised", "look", "From inside the pile of leaves, there came a soft, rumbling sound, snore, snore, snore."),
      L("A", "surprised", "sneak", "Someone is sleeping under there. Everybody, stay very still. I will lift the leaves."),
      L("N", "surprised", "look", "Robin gently lifted the leaves, and underneath lay a round, fluffy little bear cub, fast asleep, hugging a jar of honey."),
      L("N", "joy", "look", "All around the cub, there were dozens of empty honey jars, licked clean."),
    ]),
    S("nature", "day", "heart", "The twist: the thief is a hungry little bear cub.", [
      L("B", "shocked", "talk", "A bear cub! The honey thief is a baby bear! And he ate all sixty jars!"),
      L("C", "warm", "talk", "Oh, the sweet little thing. He must have been so hungry. And so full, now, poor dear."),
      L("N", "joy", "look", "The cub woke up, yawned, and blinked his big brown eyes, with sticky honey all over his cheeks."),
      L("N", "sad", "talk", "I am sorry. I am Bruno. I lost my mama, and I was so hungry. I smelled the honey, and I could not stop."),
      L("A", "warm", "talk", "Oh, Bruno. You are a long way from home. Where did you last see your mama?"),
      L("N", "sad", "talk", "She went to find berries, near the river, and a big fog came, and I got lost."),
      L("C", "warm", "talk", "Do not worry, little one. We will help you find her. But first, a very good wash."),
      L("B", "joy", "dance", "A baby bear friend! I have always wanted one! Can I hold his paw? Please, please?"),
    ]),
    S("nature", "dusk", "lantern", "The friends help Bruno find his mother, with a funny moment.", [
      L("A", "determined", "talk", "Let us go to the river, and call for her. Mama bears can hear their cubs from far away."),
      L("N", "joy", "walk", "The four friends set off, with Bruno walking proudly in the middle, sticky paws and all."),
      L("B", "joy", "sing", "Mama bear, mama bear, where are you? Bruno wants his mommy, and so do I, too!"),
      L("A", "joy", "talk", "Honeycomb, you do not have a mommy bear. But it was a sweet song."),
      L("N", "surprised", "look", "At the river, a huge, gentle mother bear stood on the bank, looking all around, with worried eyes."),
      L("N", "joy", "look", "When she saw Bruno, she let out a great, happy roar, and ran to him, and wrapped him in a big hug."),
      L("N", "sad", "talk", "Bruno! My little Bruno! I looked everywhere! I thought I had lost you in the fog!"),
      L("N", "joy", "talk", "Mama! I am sorry I got lost! These nice friends helped me! And they gave me honey!"),
    ]),
    S("nature", "night", "star", "At night, the bears make amends, and the fair is saved.", [
      L("N", "warm", "walk", "That evening, the forest glowed with fireflies, and the stars came out over Pinecone Hill."),
      L("C", "warm", "talk", "Bruno, it was not nice to take all the honey. But I understand you were hungry and lost."),
      L("N", "sad", "talk", "I am very sorry, Granny Bumble. I will help you collect honey, to make up for it. And I will never take it without asking."),
      L("N", "warm", "talk", "And I will bring you a basket of fresh berries every week, to thank you for looking after my cub."),
      L("C", "joy", "talk", "That is a deal! Patience makes the sweetest honey, and kindness makes the sweetest friends."),
      L("A", "joy", "highfive", "And the fair is saved! Granny, you can make fresh honey, and Bruno can help gather it."),
      L("B", "joy", "dance", "A honey fair with a real bear! The Pinecone Hill Fair is going to be the best one ever!"),
      L("N", "warm", "talk", "And that is the story of the honey mystery of Pinecone Hill, and the little bear who found his way home. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
