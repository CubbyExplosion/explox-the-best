// ─── NEW MOVIE (made automatically): The Case of the Missing Bone — a cozy mystery with a clever inspector, a goofy dino and a sweet little girl.
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
  title: "The Case of the Missing Bone", genre: "🔍 Cozy Mystery", price: 30, bg: "#2a2f3a", icons: "🦴🔍🐕", comedy: true,
  cast: { A: { role: "Inspector Biscuit", kind: "detective", pers: "wise", move: "MAGNIFYING FLASH", mtype: "kick", fav: "Every clue has a friend.", say: "I know, I should sleep more. The cases never stop." }, B: { role: "Spike the Dino", kind: "dino", pers: "goof", move: "TAIL WHIP", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, my tail knocked over the lamp." }, C: { role: "Little Lola", kind: "hero", pers: "sweet", move: "HUG SPIN", mtype: "spin", fav: "Kindness solves everything.", say: "I could not say no to a lost puppy. I never can." } },
  trailer: [{ text: "🦴 One very big bone...", dur: 2200 }, { text: "🔍 One missing in the night...", dur: 2200 }, { text: "🐕 And one surprising thief!", dur: 2400 }, { text: "THE CASE OF THE MISSING BONE", dur: 3000 }],
  scenes: [
    S("suburbs", "day", "heart", "Little Lola has a big problem: her dog's favorite bone is gone.", [
      L("N", "warm", "walk", "It was a quiet morning on Maple Street, and the birds were singing in the garden."),
      L("C", "sad", "talk", "Inspector Biscuit, please help! Buttons the dog has lost his favorite bone!"),
      L("A", "serious", "look", "A missing bone? Tell me everything, Lola. Start from the very beginning."),
      L("C", "worried", "talk", "Buttons buried it under the big oak tree last night. This morning, the hole was empty."),
      L("B", "shocked", "look", "A bone burglar! In our neighborhood! This is the biggest crime since the missing cookie jar!"),
      L("A", "curious", "talk", "Spike, there was no cookie jar crime. You ate them all, remember?"),
      L("B", "joy", "eat", "Oh, right. They were delicious. Sorry. Let us find that bone!"),
      L("A", "determined", "write", "The case is on. Every clue has a friend. Let us go and look at the hole."),
    ]),
    S("suburbs", "day", "tree", "At the oak tree, the detectives search for clues.", [
      L("N", "curious", "walk", "Under the old oak tree, there was a round, empty hole in the soft brown earth."),
      L("A", "curious", "look", "Interesting. The hole is very neat. Whoever took the bone did not dig in a hurry."),
      L("B", "joy", "dig", "I will dig around too! Dig, dig, dig! Look, I found a worm! Hello, worm!"),
      L("A", "serious", "talk", "Spike, please do not destroy the evidence. We need to examine the ground carefully."),
      L("C", "curious", "look", "Inspector, look! There are tiny footprints next to the hole. They are very small, with little toes."),
      L("A", "surprised", "look", "Small paw prints, leading toward the old garden shed. Good eyes, Lola."),
      L("B", "worried", "talk", "Paw prints? A tiny paw? Maybe it is a tiny dinosaur! A mini me!"),
      L("A", "warm", "talk", "Let us follow the prints. I have a feeling this case has a soft and surprising end."),
    ]),
    S("suburbs", "day", "lantern", "The prints lead to a dusty garden shed, with a funny noise inside.", [
      L("N", "serious", "sneak", "The three friends tiptoed across the garden, following the little paw prints."),
      L("N", "curious", "look", "The prints stopped at an old wooden shed, with a crooked door."),
      L("C", "worried", "talk", "I can hear something inside. It sounds like a tiny snore."),
      L("B", "scared", "panic", "A snoring shed monster! Hide behind me! Wait, no, you hide, and I will hide behind you!"),
      L("A", "serious", "sneak", "Quiet, everyone. I will open the door slowly, and we will see who is inside."),
      L("N", "surprised", "look", "The door creaked open, and in the dusty corner, there was a soft old blanket, and the big bone."),
      L("N", "surprised", "look", "And curled up around the bone, fast asleep, were three tiny puppies."),
      L("C", "joy", "talk", "Puppies! Inspector, look! There are three sleepy little puppies!"),
    ]),
    S("suburbs", "day", "heart", "The mystery's twist: the puppies' mother needed a snack.", [
      L("N", "curious", "look", "Just then, a gentle, tired mother dog walked in through the back gap of the shed."),
      L("N", "worried", "talk", "She looked at the friends, and whined softly, and then at her three hungry puppies."),
      L("A", "curious", "talk", "I see. Little Lola, I think we have solved the case. This family had no food, and the bone was the only thing she could find."),
      L("C", "sad", "talk", "Oh no. They were hungry. That is why she took Buttons' bone, from under the oak tree."),
      L("B", "sad", "talk", "That is the saddest bone case I have ever worked on. Sniff, sniff."),
      L("A", "warm", "talk", "She was not a thief, she was a mother. She just did not know how to ask."),
      L("N", "warm", "look", "The mother dog gently licked her puppies, and looked up with big, grateful, shy eyes."),
      L("C", "determined", "talk", "We must help them. Inspector, may we take care of them?"),
    ]),
    S("suburbs", "day", "heart", "The friends make a plan to help, with a funny moment.", [
      L("A", "warm", "talk", "Of course, Lola. Kindness solves everything. Spike, can you fetch some dog food from the kitchen?"),
      L("B", "joy", "run", "Yes, boss! I will be back in one second! Zoom, zoom, zoom!"),
      L("N", "joy", "run", "Spike raced across the garden, crashed through the back door, and came back carrying a huge bag of food."),
      L("N", "surprised", "look", "But the bag was not dog food. It was a bag of flour, and when Spike tripped, it burst open, poof."),
      L("B", "surprised", "look", "Achoo! Oops. I am a white dinosaur now. Just a snowy dinosaur!"),
      L("C", "joy", "talk", "Ha ha! Spike, you look like a ghost dino! Let us try again, with the right bag."),
      L("A", "joy", "talk", "A good detective should always check the label. Even a powdery one."),
      L("B", "joy", "dance", "Third time lucky! I will find the real food, I promise!"),
    ]),
    S("suburbs", "dusk", "heart", "The dog family eats, and everyone becomes friends.", [
      L("N", "warm", "walk", "Soon, the mother dog and her three puppies were munching happily on a big bowl of dog food."),
      L("C", "joy", "talk", "Look at them eat! They were so hungry. I am so glad we found them."),
      L("N", "warm", "walk", "Buttons, the dog who lost the bone, trotted over, sniffed the puppies, and wagged his tail."),
      L("C", "surprised", "look", "Buttons is giving them his bone! He wants the puppies to have it!"),
      L("A", "warm", "talk", "Dogs know kindness better than anyone. Buttons did not lose a bone. He found a family."),
      L("B", "joy", "photo", "Everybody, smile! The happiest dog family in Explox!"),
      L("C", "happy", "talk", "Can we keep them in the garden, Inspector? We can build them a nice little house."),
      L("A", "warm", "talk", "I think that is a wonderful idea. Every clue has a friend, and every friend deserves a home."),
    ]),
    S("suburbs", "night", "star", "At night, the neighborhood gathers to build the dog house.", [
      L("N", "warm", "walk", "That evening, all the neighbors came out with wood, paint and hammers."),
      L("N", "joy", "build", "They built a cozy red dog house, with a soft blue blanket and a tiny round door."),
      L("B", "joy", "build", "I will hammer the roof! Bang, bang, bang! Oops, I hammered my own tail. Ouch."),
      L("C", "joy", "write", "I will paint the name over the door. The Biscuit Family Home."),
      L("A", "surprised", "talk", "The Biscuit Family? After me? Oh, Lola, I am so touched."),
      L("N", "joy", "party", "The mother dog and her three puppies cuddled up in their new house, warm and safe."),
      L("C", "warm", "talk", "Goodnight, little puppies. Sweet dreams. You are not alone anymore."),
      L("N", "warm", "talk", "And that is the story of the case of the missing bone, and the family that found a home. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
