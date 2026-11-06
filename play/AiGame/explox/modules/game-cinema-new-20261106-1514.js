// ─── NEW MOVIE (made automatically): The Mystery of the Missing Magic Hat — a school mystery with a detective, a friendly ghost and a goofy dragon.
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
  title: "The Mystery of the Missing Magic Hat", genre: "🎩 School Mystery", price: 30, bg: "#2a1a4a", icons: "🎩🔍👻", comedy: true,
  cast: { A: { role: "Detective Dotty", kind: "detective", pers: "hero", move: "MAGNIFYING FLASH", mtype: "kick", fav: "Every clue has a friend!", say: "I know, I should sleep more. The cases never stop." }, B: { role: "Boo-Boo the Ghost", kind: "ghost", pers: "nervous", move: "SPOOKY SPIN", mtype: "spin", fav: "I have a very good bad feeling.", say: "My knees will not stop shaking. Wait, I do not have knees." }, C: { role: "Smokey the Dragon", kind: "dragon", pers: "goof", move: "FIRE-BREATH PUNCH", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I got hungry again. Are there cookies?" } },
  trailer: [{ text: "🎩 One magic hat...", dur: 2200 }, { text: "🔍 One tricky mystery...", dur: 2200 }, { text: "👻 And one very sleepy ghost!", dur: 2400 }, { text: "THE MYSTERY OF THE MISSING MAGIC HAT", dur: 3000 }],
  scenes: [
    S("school", "day", "trophy", "On the morning of the school talent show, the magic hat disappears from the stage.", [
      L("N", "serious", "walk", "It was the day of the big talent show at Explox School. Everything was ready, except for one thing."),
      L("A", "surprised", "look", "Principal, you say the magic hat is gone? The hat that makes the rabbit trick work?"),
      L("C", "shocked", "panic", "Gone? Poof? Like magic? That is not funny. Well, a little funny."),
      L("B", "scared", "panic", "Maybe a ghost took it. Oh wait, I am a ghost. It was not me, I promise!"),
      L("A", "determined", "write", "Nobody panic. Detective Dotty is on the case. I will write down every clue."),
      L("C", "curious", "talk", "Can I help? I am very good at sniffing. And at eating. Mostly eating."),
      L("A", "warm", "talk", "Yes, Smokey. And you too, Boo-Boo. A team of three is better than one."),
      L("B", "worried", "talk", "I have a very good bad feeling about this."),
    ]),
    S("school", "day", "book", "In the empty classroom, Dotty looks for the first clue.", [
      L("A", "curious", "look", "Look at this. A trail of tiny sparkles on the floor, leading to the door."),
      L("C", "curious", "look", "Sparkles! Ooh, are they sprinkles? Can I taste one?"),
      L("A", "serious", "talk", "Smokey, do not eat the clues. Please."),
      L("B", "surprised", "look", "Oh look! A tiny footprint! It looks very small and very, um, fluffy."),
      L("A", "excited", "write", "Fluffy footprints and sparkles. We are getting somewhere."),
      L("C", "joy", "sneak", "My nose says cookies. Cookies, cookies, cookies, this way!"),
      L("A", "determined", "walk", "Follow Smokey's nose, team. It leads to the cafeteria."),
    ]),
    S("house", "day", "pizza", "In the school kitchen, the team finds a very sticky second clue.", [
      L("N", "curious", "cook", "The cafeteria smelled like warm cookies and hot soup."),
      L("C", "joy", "eat", "Cookies! A whole tray! Oh, this is the best mystery ever!"),
      L("A", "surprised", "look", "Smokey, wait. Look at the tray. There is a note under it."),
      L("A", "curious", "write", "It says, the hat is hiding where the quiet people read."),
      L("B", "curious", "talk", "Where the quiet people read? That sounds like a riddle."),
      L("C", "curious", "talk", "A restaurant? A cinema? A bathtub?"),
      L("A", "excited", "talk", "The library! It has to be the library!"),
      L("B", "scared", "panic", "The library at night? With all those shadows and creaky floors?"),
    ]),
    S("library", "dusk", "book", "In the dim library, the friends hear a strange noise behind the shelves.", [
      L("N", "serious", "sneak", "The library was quiet, and the sun was going down."),
      L("B", "scared", "sneak", "Did you hear that? It sounded like a snore. A very big snore."),
      L("C", "worried", "sneak", "Maybe it is a monster. A monster who loves cookies."),
      L("A", "determined", "sneak", "Stay close, team. We will check behind the big bookshelf."),
      L("N", "surprised", "look", "Zzz. Zzz. Zzzzz. The snore got louder and louder."),
      L("A", "surprised", "look", "Look, a pile of soft books, and something white is sleeping on top."),
      L("B", "shocked", "look", "It is a ghost. Another ghost! And, oh no, it is wearing the magic hat!"),
      L("C", "surprised", "look", "A ghost wearing a hat, sleeping in the library. This is the weirdest day ever."),
    ]),
    S("library", "dusk", "lantern", "The sleeping ghost turns out to be a surprising culprit.", [
      L("A", "curious", "talk", "Excuse me, sleepy ghost? Can you wake up, please?"),
      L("N", "surprised", "magic", "The ghost yawned, stretched and floated up with a big, sleepy smile."),
      L("B", "surprised", "look", "Cousin Wisp? Is that you? What are you doing in the school library?"),
      L("B", "surprised", "talk", "She is my cousin. She walks in her sleep. She must have taken the hat as a pillow."),
      L("A", "relieved", "talk", "So nobody stole it. The hat was just a nap pillow."),
      L("C", "joy", "talk", "A sleepwalking ghost! That is the funniest mystery I ever solved!"),
      L("B", "worried", "talk", "I am so sorry, Dotty. She does not mean any harm. She just loves naps."),
      L("A", "warm", "talk", "No harm done. But the show starts in five minutes. We need to hurry!"),
    ]),
    S("school", "dusk", "trophy", "Back at school, there are only minutes left before the show begins.", [
      L("A", "excited", "run", "Run, team! Back to the stage! We have five minutes left!"),
      L("C", "excited", "jump", "I will carry the hat! Hold on, everybody, hold on to your hats!"),
      L("B", "scared", "fly", "I will float ahead and tell the principal. Here I go, whoosh!"),
      L("N", "surprised", "run", "But as Smokey ran, his big tail knocked over a tower of paint buckets."),
      L("C", "shocked", "panic", "Oops! Paint everywhere! Blue, red, yellow, and a little bit of green!"),
      L("A", "worried", "panic", "The hat is covered in paint! It looks like a rainbow!"),
      L("B", "surprised", "look", "Wait. Look at the hat. The rainbow paint makes it sparkle."),
      L("A", "curious", "look", "Maybe the show can use a rainbow hat. A rainbow rabbit trick!"),
    ]),
    S("cityhall", "night", "trophy", "On stage, the magic show begins with a very colorful twist.", [
      L("N", "excited", "party", "The lights went down, the drums began, and the whole school cheered."),
      L("A", "excited", "magic", "Ladies and gentlemen, the magnificent, marvelous, rainbow magic hat!"),
      L("N", "surprised", "magic", "Sparkle, sparkle, pop! Out of the hat jumped a bright, fluffy rabbit."),
      L("C", "joy", "juggle", "And now, I will juggle the carrots! One, two, three, whoa, four!"),
      L("B", "joy", "dance", "I will do the ghost dance! Whoooo, whooo, whoooo!"),
      L("N", "joy", "drum", "The audience clapped and stomped. They had never seen a show like this."),
      L("A", "joy", "highfive", "We did it, team! The show is saved!"),
    ]),
    S("cityhall", "night", "trophy", "The principal gives the team a special thank you.", [
      L("N", "warm", "talk", "When the show was over, the principal stood up on stage with a big, golden badge."),
      L("A", "surprised", "talk", "For me? But we only found a sleepy ghost and a pile of paint."),
      L("B", "happy", "talk", "You also found my cousin a nap time. She is so happy."),
      L("C", "joy", "eat", "And I found a whole tray of cookies. Best day ever."),
      L("A", "joy", "photo", "Everybody, gather round. Group photo with the rainbow hat!"),
      L("B", "joy", "photo", "Say boo! No, say cheese! Wait, say both!"),
      L("A", "warm", "talk", "Every clue has a friend. And every friend makes the mystery better."),
    ]),
    S("park", "night", "moon", "Late that night, the friends say good night under the moon.", [
      L("N", "warm", "walk", "The moon came out, and the three friends walked home through Explox Park."),
      L("C", "happy", "eat", "Do you think there is one more cookie in my pocket? Oh yes, there is."),
      L("B", "happy", "talk", "Thank you both for helping my cousin. You are the best friends a ghost could have."),
      L("A", "warm", "talk", "You are the best friends a detective could have. Good night, team."),
      L("N", "warm", "magic", "And as they said good night, a little sparkle floated up to the moon, and it looked a lot like a rabbit."),
      L("N", "warm", "talk", "And that is how Detective Dotty, Boo-Boo and Smokey solved the mystery of the missing magic hat. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
