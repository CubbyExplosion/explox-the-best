// ─── NEW MOVIE (made automatically): The Mailbox Mystery — a cozy street mystery with a cheerful postman, a goofy robot and a curious girl.
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
  title: "The Mailbox Mystery", genre: "✉️ Cozy Mystery", price: 30, bg: "#3a2a1a", icons: "✉️📮🔍", comedy: true,
  cast: { A: { role: "Postie Pete", kind: "pioneer", pers: "sweet", move: "MAILBAG SPIN", mtype: "spin", fav: "Every letter is a little hello.", say: "I could not say no to a lonely mailbox. I never can." }, B: { role: "Stamp the Robot", kind: "robot", pers: "goof", move: "STAMP SLAM", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I licked the wrong envelope." }, C: { role: "Little Rosa", kind: "hero", pers: "hero", move: "MAGNIFYING FLASH", mtype: "kick", fav: "Every clue has a friend.", say: "I know, I should ask first. I never do." } },
  trailer: [{ text: "✉️ One strange letter...", dur: 2200 }, { text: "📮 One locked mailbox...", dur: 2200 }, { text: "🔍 And a mystery to solve!", dur: 2400 }, { text: "THE MAILBOX MYSTERY", dur: 3000 }],
  scenes: [
    S("suburbs", "dawn", "sun", "Postie Pete starts his morning route and finds a strange letter.", [
      L("N", "warm", "walk", "It was early morning on Maple Street, and the birds were just waking up."),
      L("A", "happy", "walk", "Good morning, Maple Street! Postie Pete is on his rounds, and Stamp the Robot is right behind me."),
      L("B", "joy", "work", "Beep, beep! I am carrying the mailbag! It is very heavy, but I am very strong!"),
      L("N", "curious", "look", "At the end of the street, there was an old blue mailbox, with a shiny new lock on the little door."),
      L("A", "surprised", "look", "That is odd. I have never seen a lock on this mailbox before. And there is a letter sticking out."),
      L("N", "curious", "look", "The envelope was cream-colored, tied with a green ribbon, and it said, For whoever is curious."),
      L("B", "excited", "jump", "A mystery! A real mystery! I love mysteries! Can we open it? Can we, can we?"),
      L("A", "warm", "talk", "It says, for whoever is curious. I think we may be allowed. Let us read it together."),
    ]),
    S("suburbs", "day", "book", "The letter holds a riddle, and Rosa joins the hunt.", [
      L("N", "curious", "write", "Inside the envelope, there was a small piece of paper, with neat, curly handwriting."),
      L("A", "curious", "write", "It says, Look where the water falls from the sky, but never gets wet. Find me there, and say hello."),
      L("B", "curious", "talk", "Where does water fall, but never get wet? A waterfall! A bathtub! A very patient fish!"),
      L("N", "joy", "run", "Just then, a girl in a yellow raincoat came skipping up the street, carrying a magnifying glass."),
      L("C", "excited", "talk", "Hello! I am Rosa! I saw you reading a letter. Is it a mystery? Every clue has a friend!"),
      L("A", "happy", "talk", "Hello, Rosa. It is a riddle. Can you help us solve it?"),
      L("C", "determined", "look", "Water that falls from the sky, but never gets wet. Hmm. That is rain, of course. And rain falls on, the roof!"),
      L("C", "excited", "jump", "Or, the rain gutter, the umbrella stand! Let us go to the umbrella shop on the corner!"),
    ]),
    S("suburbs", "day", "lantern", "At the umbrella shop, they find a second clue, and a funny mix-up.", [
      L("N", "joy", "walk", "The three friends hurried to the little umbrella shop, where hundreds of umbrellas hung from the ceiling."),
      L("C", "curious", "look", "Look at all of those umbrellas. Water falls on them, but they never get wet inside. This is the place!"),
      L("N", "curious", "look", "On the counter, there was a small green envelope, tied with another green ribbon."),
      L("B", "joy", "work", "I will get it! Stamp the Robot, reaching for the clue, on the count of three! One, two, three!"),
      L("N", "shocked", "panic", "But Stamp pulled the envelope so quickly that an entire rack of umbrellas popped open, one after another, pop, pop, pop."),
      L("B", "shocked", "panic", "Oh no! Umbrellas! Everywhere! I am stuck in a rainbow of umbrellas!"),
      L("C", "joy", "talk", "Ha ha! Stamp, you look like a giant flower! Do not worry, we will get you out."),
      L("A", "joy", "work", "Careful, Rosa. One umbrella at a time. There, nice and gently. Now, let us read the clue."),
    ]),
    S("suburbs", "day", "book", "The second clue leads them across the neighborhood.", [
      L("A", "curious", "write", "The note says, I live where the flowers talk to each other, and the garden gate never squeaks."),
      L("C", "determined", "write", "A garden! With talking flowers! That must be Mrs. Fernsby's garden, on Pine Lane!"),
      L("B", "curious", "talk", "Do flowers really talk? Do they say good morning? Do they gossip about the bees?"),
      L("A", "warm", "talk", "Perhaps they do, Stamp. Let us go and ask."),
      L("N", "joy", "walk", "They walked along Pine Lane, past tall hedges and a house with a bright red door."),
      L("N", "surprised", "look", "At the end of the lane, there was an old garden, full of flowers in every color, with a gate that opened without a sound."),
      L("C", "joy", "look", "Look at those roses and sunflowers. They are nodding, like they know we are coming!"),
      L("N", "curious", "look", "In the middle of the garden, a third green envelope hung from a branch, fluttering softly in the breeze."),
    ]),
    S("suburbs", "dusk", "heart", "The final clue reveals the surprise: a lonely neighbor.", [
      L("A", "curious", "write", "The last letter says, Thank you for coming. I have been shy for such a long time. Please look behind the tall sunflowers."),
      L("N", "curious", "sneak", "The three friends tiptoed past the tall sunflowers, and found a small wooden door in the garden wall."),
      L("N", "surprised", "look", "The door opened slowly, and an old man with a kind face and a straw hat stepped out, holding a watering can."),
      L("N", "warm", "talk", "Hello. I am Mr. Fernsby. I wrote the letters. I hope you are not cross."),
      L("A", "warm", "talk", "Not at all, Mr. Fernsby. We had a wonderful time. But why all the riddles?"),
      L("N", "sad", "talk", "I am new to the street, and I am rather shy. I wanted friends, but I did not know how to ask."),
      L("C", "warm", "talk", "So you hid letters, to see who was curious enough to find you. That is the cleverest way to make friends I ever heard."),
      L("B", "joy", "dance", "A friend-finding mystery! That is the best kind of mystery! Beep, beep, hooray!"),
    ]),
    S("suburbs", "dusk", "lantern", "A funny moment, and the neighbors gather.", [
      L("A", "joy", "talk", "Mr. Fernsby, would you like to come to tea? We have time, and a mailbag full of snacks."),
      L("B", "joy", "eat", "I brought cookies! Eight cookies! Well, seven. I ate one on the way."),
      L("N", "joy", "party", "Soon, the whole street heard the laughter, and neighbors came out of their houses, one by one."),
      L("N", "joy", "talk", "What is all the happy noise? Is it a party? Can we come?"),
      L("C", "joy", "talk", "Everybody, this is Mr. Fernsby, our new neighbor. He has the nicest garden in the whole town!"),
      L("N", "joy", "highfive", "The neighbors shook his hand, and gave him flowers, and bread, and a jar of homemade jam."),
      L("N", "warm", "talk", "Mr. Fernsby smiled so widely that his hat nearly fell off. I have never had so many friends in one afternoon."),
      L("A", "warm", "talk", "Every letter is a little hello, Mr. Fernsby. And you wrote the best ones."),
    ]),
    S("suburbs", "night", "star", "At night, the mailbox gets a new job.", [
      L("N", "warm", "walk", "That evening, the stars came out over Maple Street, and the lanterns glowed along the sidewalk."),
      L("C", "happy", "talk", "Pete, what should we do with the old blue mailbox? The one with the shiny lock?"),
      L("A", "warm", "talk", "I have an idea. Let us take off the lock, and make it a friendship mailbox. Anybody can leave a kind note."),
      L("B", "joy", "work", "I will paint it! Blue, with yellow stars! And a sign that says, Hello Box!"),
      L("N", "joy", "build", "Together, they painted the mailbox, polished it, and put a little notebook and a pencil inside."),
      L("N", "warm", "write", "The first note was from Mr. Fernsby, and it said, Thank you for being curious."),
      L("C", "happy", "talk", "Every clue has a friend. And every friend has a story."),
      L("N", "warm", "talk", "And that is the story of the mailbox mystery, and the shy neighbor who found his friends. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
