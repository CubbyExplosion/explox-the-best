// ─── NEW MOVIE (made automatically): The Duckling Bridge Rescue — a rescue comedy with a ranger, a clumsy dinosaur and a wise grandma.
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
  title: "The Duckling Bridge Rescue", genre: "🦆 Rescue Comedy", price: 30, bg: "#17391f", icons: "🦆🌉🛟", comedy: true,
  cast: { A: { role: "Ranger Robin", kind: "pioneer", pers: "hero", move: "LASSO SPIN", mtype: "spin", fav: "Never leave a duckling behind!", say: "I know, I should ask for help. I just hate asking." }, B: { role: "Waddles the Dino", kind: "dino", pers: "goof", move: "TAIL WHIP", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, my tail knocked over the picnic again." }, C: { role: "Granny Gale", kind: "grandma", pers: "wise", move: "ROLLING PIN SMASH", mtype: "punch", fav: "Think first, rescue later.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "🌉 One wobbly bridge...", dur: 2200 }, { text: "🦆 Seven tiny ducklings...", dur: 2200 }, { text: "🦖 And one very clumsy dinosaur!", dur: 2400 }, { text: "THE DUCKLING BRIDGE RESCUE", dur: 3000 }],
  scenes: [
    S("nature", "day", "tree", "On a sunny morning, Ranger Robin patrols the green hills of Explox.", [
      L("N", "warm", "walk", "The sun was warm, the birds were singing, and Ranger Robin was on her morning patrol."),
      L("A", "happy", "walk", "Beautiful day, Waddles. Not a cloud in the sky, and not a single problem."),
      L("B", "joy", "eat", "Perfect picnic weather! I packed twelve sandwiches. Okay, thirteen."),
      L("C", "warm", "talk", "A rescue ranger needs a good breakfast, dear. Eat your toast."),
      L("A", "curious", "look", "Wait. Do you hear that? A tiny quack, quack, quack. And it sounds scared."),
      L("B", "surprised", "look", "Oh look! There are ducklings on the old rope bridge!"),
      L("A", "shocked", "look", "Seven of them! And the bridge is wobbling like jelly!"),
      L("C", "worried", "talk", "That bridge has not been fixed in years. Hurry, hurry!"),
    ]),
    S("nature", "day", "wall", "At the edge of the river, the team looks at the wobbly old bridge.", [
      L("A", "serious", "look", "The bridge is swinging in the wind. One wrong step and the ducklings could fall in the water."),
      L("B", "scared", "panic", "I will save them! I will run across and carry them all in my mouth!"),
      L("C", "serious", "talk", "Waddles, you are a very big dinosaur. The bridge will not hold you."),
      L("B", "worried", "talk", "Then I will walk very, very lightly. On my tippy toes."),
      L("A", "determined", "write", "No, we need a plan. Granny, what do we have in the rescue bag?"),
      L("C", "curious", "work", "A long rope, a net, a rubber boat and a bag of crackers."),
      L("A", "excited", "work", "Crackers! Ducklings love crackers! That gives me an idea."),
      L("B", "joy", "eat", "I love crackers too. Are the crackers part of the plan or part of my lunch?"),
    ]),
    S("nature", "day", "tree", "Robin explains the plan, and Waddles has a very special job.", [
      L("A", "determined", "talk", "First, Granny throws the rope across the river and ties it to the big oak tree."),
      L("C", "determined", "tugwar", "Easy as pie. I have tied a thousand knots. One, two, three, tight!"),
      L("A", "determined", "talk", "Second, I climb along the rope, and I scatter crackers on the bridge for the ducklings."),
      L("B", "curious", "talk", "And what do I do? Please say something fun."),
      L("A", "warm", "talk", "You, Waddles, hold the other end of the rope with your big, strong tail."),
      L("B", "joy", "exercise", "My tail is the strongest tail in Explox! I do tail push-ups every day!"),
      L("C", "warm", "talk", "Just do not wag it. Wagging makes the rope shake."),
      L("B", "worried", "talk", "No wagging. I promise. Wag is a bad word now."),
    ]),
    S("nature", "day", "tree", "The rescue begins, and the very first problem pops up.", [
      L("N", "serious", "climb", "Robin climbed onto the rope and began to move slowly across the river."),
      L("A", "serious", "climb", "Easy does it. One hand, then the other hand. Do not look down."),
      L("C", "worried", "look", "You are doing wonderfully, dear. A little farther. Keep your balance."),
      L("B", "worried", "tugwar", "I am holding the rope, Robin. I am holding it with all my tail!"),
      L("N", "surprised", "look", "But a big, juicy fly buzzed right in front of Waddles' nose."),
      L("B", "shocked", "panic", "A fly! A fly! I love flies! No, wait. I must not wag. I must not wag!"),
      L("A", "scared", "panic", "Waddles, the rope is shaking! Hold still!"),
      L("B", "scared", "panic", "I am holding still! Mostly still! Very, very mostly still!"),
    ]),
    S("nature", "day", "tree", "Granny Gale thinks of a clever fix.", [
      L("C", "determined", "write", "Waddles, close your eyes and think of your favorite thing in the world."),
      L("B", "curious", "talk", "My favorite thing? Pizza! Warm, cheesy pizza with extra pepperoni."),
      L("C", "warm", "talk", "Perfect. Keep thinking about pizza. The fly will disappear."),
      L("N", "relieved", "talk", "Waddles shut his eyes and thought only about pizza, and the rope stopped shaking."),
      L("A", "relieved", "climb", "Great job, Granny. And great job, Waddles. I am almost there."),
      L("B", "joy", "eat", "Mmm, pizza. Mmm, extra cheese. I can almost smell it."),
      L("C", "warm", "talk", "Think first, rescue later. That is the secret."),
    ]),
    S("nature", "day", "wall", "Robin reaches the bridge, and the ducklings turn out to be full of surprises.", [
      L("N", "curious", "climb", "Robin stepped onto the wobbly bridge and scattered crackers across the old boards."),
      L("A", "warm", "talk", "Come here, little ones. Do not be scared. I am a friend."),
      L("N", "surprised", "look", "The seven ducklings quacked, hopped and bumped right into each other."),
      L("A", "surprised", "look", "Wait. They are not scared at all. They are laughing."),
      L("N", "surprised", "dance", "The ducklings started to jump up and down on the bridge, just to make it wobble."),
      L("A", "shocked", "look", "They are making the bridge wobble on purpose! It is their trampoline!"),
      L("B", "shocked", "look", "They are not in danger? They are having a party?"),
      L("C", "surprised", "look", "Well, I never. Seven little troublemakers!"),
    ]),
    S("nature", "dusk", "sun", "Now Robin needs a new plan: how to get everyone safely off the bridge.", [
      L("A", "curious", "talk", "Okay, little ones. The party is fun, but the bridge is old. We need to go home."),
      L("N", "sad", "talk", "The ducklings looked at each other and shook their little heads. They did not want to go."),
      L("A", "warm", "talk", "I understand. You love your trampoline. What if we make you a better one?"),
      L("N", "curious", "look", "The seven ducklings tilted their heads and listened."),
      L("B", "excited", "build", "Oh! Oh! I know! A soft hay mattress on the grass! With a splash pool next to it!"),
      L("C", "happy", "build", "And a little ramp made from planks. I have some wood in my bag."),
      L("A", "joy", "highfive", "A bouncy duckling park! The best trampoline in Explox!"),
      L("N", "joy", "party", "The ducklings quacked with joy and waddled across the rope, one by one, into Robin's arms."),
    ]),
    S("park", "day", "sun", "The friends build the duckling park together.", [
      L("N", "joy", "build", "That afternoon, the whole team worked together under the bright sun."),
      L("B", "joy", "build", "Hammer, hammer, hammer! Look, I made a duck-shaped slide!"),
      L("C", "happy", "build", "I made a tiny diving board. Not too high, dears. Just three inches."),
      L("A", "happy", "build", "And I filled the splash pool with warm water. Perfect for little feet."),
      L("N", "joy", "bubbles", "The ducklings jumped, splashed and blew bubbles in the water."),
      L("B", "joy", "photo", "Everybody say quack! Click! This is the best photo of my life!"),
      L("C", "warm", "photo", "Ranger Robin, you are the most patient ranger in the whole world."),
    ]),
    S("park", "dusk", "sun", "At sunset, the town comes to see the new duckling park.", [
      L("N", "warm", "party", "As the sun went down, the whole town came to see the new duckling park."),
      L("A", "warm", "talk", "Welcome, everyone. This is the Explox Duckling Park. Everyone is welcome, big or small."),
      L("N", "joy", "dance", "The ducklings did a little parade, and the people clapped along."),
      L("B", "joy", "dance", "Quack, quack, boom, boom! I have a drum made of a bucket!"),
      L("C", "warm", "sing", "Quack, quack, little friends. Happy days will never end."),
      L("A", "joy", "highfive", "Good job, everyone. A rescue, a party and a park, all in one day."),
      L("N", "warm", "talk", "And that is how Ranger Robin, a clumsy dinosaur and a wise grandma rescued seven ducklings who did not need rescuing. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
