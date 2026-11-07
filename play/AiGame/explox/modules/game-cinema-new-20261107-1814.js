// ─── NEW MOVIE (made automatically): The Great Toy Box Escape — a cozy house adventure with a brave teddy, a goofy windup robot and a shy toy dinosaur.
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
  title: "The Great Toy Box Escape", genre: "🧸 Cozy Adventure", price: 30, bg: "#3a2a4a", icons: "🧸🤖🦖", comedy: true,
  cast: { A: { role: "Captain Cuddles", kind: "hero", pers: "hero", move: "TEDDY HUG SPIN", mtype: "spin", fav: "A brave heart is a soft heart.", say: "I know, I should look before I leap. I never do." }, B: { role: "Windup Wally", kind: "robot", pers: "goof", move: "SPRING SPIN", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, my key got stuck again." }, C: { role: "Tiny Terry", kind: "dino", pers: "nervous", move: "TAIL WHIP", mtype: "spin", fav: "I have a very good bad feeling.", say: "My little legs will not stop shaking." } },
  trailer: [{ text: "🧸 One sleepy house...", dur: 2200 }, { text: "🤖 One locked toy box...", dur: 2200 }, { text: "🦖 And a very small, very brave escape!", dur: 2400 }, { text: "THE GREAT TOY BOX ESCAPE", dur: 3000 }],
  scenes: [
    S("house", "dusk", "lantern", "At bedtime, the toys in a little girl's room get ready for their night adventure.", [
      L("N", "warm", "walk", "It was bedtime in a cozy yellow house, and the last light of the day shone through the bedroom window."),
      L("N", "warm", "look", "The little girl, Daisy, yawned, hugged her pillow, and fell fast asleep."),
      L("A", "happy", "talk", "She is asleep, everyone! The night shift begins! Time for the toys to wake up!"),
      L("B", "joy", "dance", "Hooray! My key is wound, my gears are oiled, and I am ready to party! Squeak, squeak!"),
      L("C", "worried", "look", "I am a little nervous. The room is so big and dark at night. And the floor is so far away."),
      L("A", "warm", "talk", "Do not worry, Terry. A brave heart is a soft heart. I will be right beside you."),
      L("B", "joy", "talk", "And I will carry the snacks! Is there a snack involved? There had better be a snack involved!"),
      L("N", "curious", "look", "But just then, the toys noticed that the lid of the big toy box was closed, and locked, with a tiny golden latch."),
    ]),
    S("house", "night", "lantern", "The toys discover that the toy box is locked, with their friends inside.", [
      L("A", "serious", "look", "That is strange. The toy box is never locked at night. Somebody must have latched it by accident."),
      L("N", "worried", "look", "From inside the box, there came a tiny, muffled voice. Help! We are stuck in here!"),
      L("C", "shocked", "look", "That is Penny the Penguin! And Rolo the Ball! And all the little blocks! They are trapped!"),
      L("B", "worried", "panic", "Oh no, oh no! It is dark in there! And the blocks hate the dark!"),
      L("A", "determined", "talk", "We must open the latch. It is way up on the top of the box, though. How will we reach it?"),
      L("C", "worried", "look", "It is so high. I do not think I can climb it. I have such tiny legs."),
      L("B", "curious", "talk", "I have an idea! We make a tower! A pyramid! A toy ladder! Every toy helps!"),
      L("A", "excited", "talk", "That is it, Wally! A team tower! Everybody, line up. We climb together!"),
    ]),
    S("house", "night", "lantern", "The toys build a tower, and it wobbles in a funny way.", [
      L("N", "excited", "build", "The toys quickly gathered, and stacked themselves up, one on top of another, like a wobbly toy ladder."),
      L("A", "determined", "climb", "I will go first, because I am the biggest. Everyone, hold on tight!"),
      L("B", "joy", "climb", "Wheee! I am the second floor! My spring is going boing, boing, boing!"),
      L("N", "worried", "look", "But Wally's spring sprang so hard that the whole tower began to sway, left, right, left, right."),
      L("C", "scared", "panic", "It is wobbling! It is wobbling! I do not want to be on the top! I do not like heights!"),
      L("A", "serious", "talk", "Terry, you have to be on top. You are the lightest, and the only one who can reach the latch."),
      L("C", "worried", "talk", "Me? The smallest one? What if I fall? What if I mess it up?"),
      L("A", "warm", "talk", "You will not fall, Terry. We have you. You do not have to be unafraid. You just have to be brave anyway."),
    ]),
    S("house", "night", "lantern", "Terry climbs up, and the plan nearly goes wrong.", [
      L("N", "worried", "climb", "Terry took a deep breath, and slowly climbed up Wally's gears, and past Cuddles' furry shoulders."),
      L("C", "determined", "climb", "Okay. One step. Two steps. Three. I can do this. I can do this."),
      L("N", "excited", "climb", "At the very top, Terry stretched out his tiny arm, and reached for the golden latch."),
      L("C", "determined", "talk", "Almost there. Just a little bit more. And, I got it!"),
      L("N", "surprised", "look", "But the latch was stiff, and Terry pulled and pulled, and then, pop, the whole latch sprang open."),
      L("N", "shocked", "look", "The lid flew up, and Terry went flying, and the tower toppled over, and every toy tumbled onto the soft rug."),
      L("B", "joy", "dance", "Whoa! That was the best ride ever! Can we do that again? Please, please, please?"),
      L("A", "relieved", "talk", "Everyone all right? Count off, one by one. No harm done, and the box is open!"),
    ]),
    S("house", "night", "star", "The trapped toys are freed, and a funny twist appears.", [
      L("N", "joy", "party", "Out of the toy box tumbled Penny the Penguin, Rolo the Ball, a handful of blocks and a very sleepy rubber duck."),
      L("N", "joy", "talk", "Thank you, thank you, thank you! We thought we were stuck there forever!"),
      L("C", "joy", "jump", "I did it! I opened the latch! Me, the smallest toy, did it!"),
      L("A", "joy", "highfive", "You were the bravest of all, Terry! Never forget that."),
      L("N", "curious", "look", "Then, from behind the toy box, a soft green glow appeared, and a tiny voice said, Hello?"),
      L("B", "surprised", "look", "A glowing thing! A ghost! No, wait, it is only a night-light that has been unplugged!"),
      L("N", "joy", "look", "The little night-light had rolled behind the box, and nobody had noticed it was missing, and it had been lonely."),
      L("A", "warm", "talk", "Little night-light, you are not alone anymore. Come and join the party!"),
    ]),
    S("house", "night", "star", "The toys throw a midnight party and put everything back in its place.", [
      L("N", "joy", "party", "The whole room lit up with joy, as the toys held a tiny, quiet midnight party on the rug."),
      L("B", "joy", "dance", "Dance, everyone! Boing, boing, boing! The Windup Wally Dance Party is on!"),
      L("N", "joy", "dance", "Penny slid on her belly, Rolo bounced from toy to toy, and the blocks stacked up into a tiny stage."),
      L("C", "joy", "dance", "I am dancing! I am dancing in front of everybody, and I am not even scared!"),
      L("A", "joy", "party", "That is the best night shift we have ever had. A brave heart is a soft heart!"),
      L("N", "warm", "look", "As the first light of morning crept through the window, the toys yawned, and began to tidy up."),
      L("B", "worried", "talk", "Quick, quick, everyone back to your places before Daisy wakes up!"),
      L("N", "joy", "work", "In a flash, every toy hopped back to its spot, and the night-light was plugged in again."),
    ]),
    S("house", "dawn", "sun", "In the morning, Daisy discovers a happy surprise.", [
      L("N", "warm", "walk", "When the sun rose, Daisy sat up in bed, rubbed her eyes, and looked around her room."),
      L("N", "surprised", "look", "She noticed something strange. The toy box was open, and the toys were in a perfect little circle, as if they had been at a party."),
      L("N", "joy", "talk", "Daisy giggled. I wonder who tidied up my toys so nicely, and left them all smiling?"),
      L("N", "warm", "look", "She picked up Tiny Terry, the smallest dinosaur, and noticed a tiny bit of sparkle on his tail."),
      L("N", "joy", "talk", "You look so proud this morning, little Terry. Did you do something brave last night?"),
      L("C", "joy", "talk", "I did, Daisy! I just cannot tell you, because I am a toy. But I did it!"),
      L("N", "joy", "photo", "Daisy hugged Terry tightly, and gave him a special place on her pillow, right next to Captain Cuddles."),
      L("N", "warm", "talk", "And that is the story of the great toy box escape, and the smallest toy who was brave anyway. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
