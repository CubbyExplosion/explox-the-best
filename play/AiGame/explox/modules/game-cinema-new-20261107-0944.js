// ─── NEW MOVIE (made automatically): The Jungle Band That Lost Its Beat — a music comedy with a dino drummer, a robot guitarist and a shy singer.
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
  title: "The Jungle Band That Lost Its Beat", genre: "🎵 Music Comedy", price: 30, bg: "#1b3a22", icons: "🥁🎸🌴", comedy: true,
  cast: { A: { role: "Drummer Dax", kind: "dino", pers: "goof", move: "DRUM ROLL STOMP", mtype: "kick", fav: "Boom boom, bada boom!", say: "Sorry, my tail hit the cymbal again." }, B: { role: "Riff the Robot", kind: "robot", pers: "wise", move: "SPEAKER BLAST", mtype: "punch", fav: "Every song needs a steady beat.", say: "Sorry. I am talking too much again." }, C: { role: "Little Lulu", kind: "hero", pers: "nervous", move: "HIGH NOTE SPIN", mtype: "spin", fav: "I have a very good bad feeling.", say: "My voice goes wobbly when people look." } },
  trailer: [{ text: "🥁 One loud jungle band...", dur: 2200 }, { text: "🎵 One missing beat...", dur: 2200 }, { text: "🌴 And the biggest show of the year!", dur: 2400 }, { text: "THE JUNGLE BAND THAT LOST ITS BEAT", dur: 3000 }],
  scenes: [
    S("jungle", "day", "drum", "In the Explox jungle, three friends get ready for the big Jungle Music Festival.", [
      L("N", "joy", "walk", "Deep in the green Explox jungle, the birds were singing, and three friends were practicing for the big festival."),
      L("A", "excited", "drum", "Boom boom, bada boom! Dax the Dino is ready to rock the whole jungle!"),
      L("B", "happy", "play", "My guitar strings are tuned, and my speakers are shiny. Riff the Robot is ready."),
      L("C", "worried", "sing", "La la la. Oh dear, my voice is wobbly again. What if I forget the words?"),
      L("B", "warm", "talk", "Do not worry, Lulu. We practiced a hundred times. You will be wonderful."),
      L("A", "joy", "dance", "And if you forget, I will drum so loud nobody will notice! Boom!"),
      L("C", "relieved", "talk", "Thank you, friends. I just want the song to be perfect."),
      L("N", "curious", "look", "The festival was tomorrow, and the jungle was already filling with happy animals."),
    ]),
    S("jungle", "dusk", "drum", "At the last rehearsal, Dax's drum sticks break, and the beat goes wrong.", [
      L("N", "excited", "drum", "At the last rehearsal, the band played their hit song, Banana Boogie, as loud as they could."),
      L("A", "joy", "drum", "Boom, boom, crash! Banana Boogie is the best song in the jungle!"),
      L("N", "surprised", "look", "But then, snap! Both of Dax's drum sticks broke in half, and flew into the trees."),
      L("A", "shocked", "panic", "My sticks! My lucky sticks! Without sticks, I cannot find the beat!"),
      L("B", "worried", "talk", "Try your claws, Dax. Or your tail. Maybe you can still drum."),
      L("N", "worried", "drum", "Dax tried, but it sounded like a pile of pots falling down the stairs. Clang, bonk, thud."),
      L("C", "worried", "look", "That does not sound like Banana Boogie. That sounds like a very sad kitchen."),
      L("A", "sad", "talk", "The beat is gone, and the festival is tomorrow. What are we going to do?"),
    ]),
    S("jungle", "night", "lantern", "The friends decide to search the jungle for new drum sticks.", [
      L("B", "determined", "talk", "A band without a beat is just a noise. We must find new sticks tonight."),
      L("C", "worried", "sneak", "In the dark jungle? With all the rustling leaves? I have a very good bad feeling."),
      L("A", "joy", "walk", "Do not worry, Lulu. I am a dinosaur. Nothing is scarier than me. Rawr!"),
      L("N", "curious", "sneak", "The three friends tiptoed through the jungle, with a little lantern, listening to the night sounds."),
      L("N", "surprised", "look", "Suddenly, they heard a soft tap, tap, tap, high up in a big old tree."),
      L("B", "curious", "look", "Listen. Someone is making a very steady beat. Tap, tap, tap, tap."),
      L("C", "surprised", "climb", "It is coming from up there. Let us climb and see who it is."),
      L("N", "excited", "climb", "Slowly, carefully, the friends climbed the big, mossy branches, toward the mysterious tapping."),
    ]),
    S("jungle", "night", "tree", "At the top of the tree, they meet a friendly woodpecker.", [
      L("N", "surprised", "look", "At the top of the tree sat a tiny woodpecker, tapping on a hollow log with his beak."),
      L("A", "shocked", "look", "A bird with perfect rhythm! Tap, tap, tap, ta-tap! Wow!"),
      L("N", "warm", "talk", "Hello, I am Pip the Woodpecker. I tap every night, because I love making a beat."),
      L("B", "curious", "talk", "Pip, we are a band, and we lost our beat. Would you like to play with us?"),
      L("N", "joy", "dance", "Pip's eyes lit up, and he did a little happy dance on the branch."),
      L("N", "joy", "talk", "A band? Me? I have always dreamed of being in a band! I will tap my best!"),
      L("A", "relieved", "highfive", "A woodpecker drummer! Pip, you just saved the festival!"),
      L("C", "happy", "talk", "And now we are a band of four. Dax, Riff, Lulu and Pip."),
    ]),
    S("jungle", "dawn", "drum", "The next morning, the band practices with their new member.", [
      L("N", "joy", "walk", "The next morning, the sun rose over the jungle, and the festival stage was ready."),
      L("N", "joy", "drum", "Pip tapped on a log, and Dax kept the beat with his big feet, stomp, stomp, stomp."),
      L("B", "joy", "play", "That sounds fantastic! A woodpecker and a dino make a perfect rhythm."),
      L("A", "excited", "dance", "Bada boom! Tap, tap! Stomp, stomp! The beat is back, and it is even better!"),
      L("C", "happy", "sing", "La la la, Banana Boogie! My voice is not wobbly when I sing with my friends!"),
      L("N", "joy", "party", "Animals from all over the jungle gathered to listen, and some began to dance."),
      L("B", "warm", "talk", "We sound great together. Are we ready for the big stage, everyone?"),
      L("C", "worried", "look", "Yes. But the stage is very big, and the crowd is very, very large."),
    ]),
    S("jungle", "day", "drum", "On the big stage, Lulu gets stage fright.", [
      L("N", "excited", "party", "At noon, the festival began, and a thousand jungle animals filled the field in front of the stage."),
      L("A", "excited", "drum", "One, two, three, four! Here we go, Banana Boogie!"),
      L("N", "joy", "drum", "The band began to play, and the crowd clapped along to the happy beat."),
      L("N", "worried", "look", "But when it was time for Lulu to sing, she looked out at the huge crowd, and froze."),
      L("C", "scared", "panic", "I cannot do it. There are too many eyes. My voice has disappeared."),
      L("A", "worried", "talk", "Lulu, do not worry. Just look at us, not at them. We are right here."),
      L("N", "worried", "look", "The music slowed down, and the crowd began to whisper."),
      L("B", "warm", "talk", "Lulu, take a deep breath. Remember, every song needs a steady beat, and every singer needs friends."),
    ]),
    S("jungle", "day", "heart", "The friends help Lulu find her courage, in a funny and touching way.", [
      L("A", "joy", "dance", "I have an idea! Everybody, put on a funny face, and Lulu will not be scared at all!"),
      L("N", "joy", "dance", "Dax crossed his eyes, Riff made his antenna wobble, and Pip puffed up his tiny feathers like a fluffy ball."),
      L("C", "joy", "talk", "Ha ha! You all look so silly! I cannot be scared when you look like that!"),
      L("N", "joy", "sing", "Lulu laughed, took a deep breath, and began to sing, softly, and then louder and louder."),
      L("C", "happy", "sing", "Banana, banana, boogie with me, we are the band of the jungle tree!"),
      L("N", "warm", "party", "The crowd gasped, and then they began to cheer, for Lulu's voice was sweet, clear and strong."),
      L("B", "joy", "play", "That is the best singing I have ever heard! Keep going, Lulu!"),
      L("A", "joy", "drum", "Boom, boom, boom! Sing it, Lulu, sing it!"),
    ]),
    S("jungle", "day", "trophy", "The band wins the festival, and a surprise guest joins them.", [
      L("N", "joy", "party", "The whole jungle danced and sang along, from the tiny ants to the tall giraffes."),
      L("N", "surprised", "look", "Then, with a loud rumble, a huge, gentle elephant stepped up to the stage, holding a giant trumpet."),
      L("N", "joy", "talk", "Hello, band. I am Big Bertha. May I play the trumpet with you?"),
      L("A", "joy", "highfive", "Of course! The more, the merrier!"),
      L("N", "joy", "play", "Bertha raised her trunk, and blew a mighty, happy toot that shook the leaves on the trees."),
      L("B", "joy", "dance", "A trumpet, a guitar, a drum, a woodpecker and a singer! This is the best band in the world!"),
      L("N", "joy", "party", "When the song ended, the crowd roared, and the judges gave the band the golden banana trophy."),
      L("C", "joy", "jump", "We won! We actually won! And I was not scared at all!"),
    ]),
    S("jungle", "dusk", "sun", "At sunset, the friends celebrate together.", [
      L("N", "warm", "walk", "That evening, the sun set over the jungle, painting the sky orange and pink."),
      L("A", "warm", "talk", "I lost my drum sticks, but I found a new friend, and a better beat."),
      L("B", "warm", "talk", "Every song needs a steady beat. And every band needs good friends."),
      L("C", "happy", "talk", "And every singer needs a funny face or two, to make her brave."),
      L("N", "joy", "photo", "The four friends gathered close, and Big Bertha lifted her trunk to take a picture of the happy band."),
      L("A", "joy", "eat", "Now, who wants to share the golden banana? I am very hungry!"),
      L("N", "joy", "party", "They ate banana bread under the stars, and the whole jungle hummed their song."),
      L("N", "warm", "talk", "And that is the story of the jungle band that lost its beat, and found something much better. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
