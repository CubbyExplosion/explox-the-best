// ─── NEW MOVIE (made automatically): The Talent Show Surprise — a stage comedy with a sweet host, a goofy robot and a hopeful young magician.
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
  title: "The Talent Show Surprise", genre: "🎤 Stage Comedy", price: 30, bg: "#3a1a4a", icons: "🎤🎩🌟", comedy: true,
  cast: { A: { role: "Host Hattie", kind: "grandma", pers: "sweet", move: "SPARKLE FAN SPIN", mtype: "spin", fav: "Every star shines in its own way.", say: "I could not say no to a nervous performer. I never can." }, B: { role: "Zap the Robot", kind: "robot", pers: "goof", move: "SPARK SPIN", mtype: "spin", fav: "Is there a snack involved?", say: "Sorry, I short-circuited the microphone." }, C: { role: "Max the Magician", kind: "wizard", pers: "nervous", move: "MAGIC WAND BLAST", mtype: "kick", fav: "I have a very good bad feeling.", say: "My hands will not stop shaking." } },
  trailer: [{ text: "🎤 One big talent show...", dur: 2200 }, { text: "🎩 One shy young magician...", dur: 2200 }, { text: "🌟 And lights that go out!", dur: 2400 }, { text: "THE TALENT SHOW SURPRISE", dur: 3000 }],
  scenes: [
    S("cityhall", "day", "trophy", "Backstage at the Explox talent show, Max feels nervous.", [
      L("N", "excited", "party", "It was Friday night at Explox City Hall, and the big talent show was about to begin."),
      L("A", "happy", "talk", "Welcome, everyone, to the Explox Talent Show! I am Host Hattie, and tonight, every star will shine!"),
      L("N", "worried", "look", "Backstage, a boy in a sparkly purple cape was pacing back and forth, holding a little wand."),
      L("C", "scared", "panic", "I am Max the Magician. This is my first show ever. And my hands will not stop shaking."),
      L("B", "joy", "dance", "Hello, Max! I am Zap the Robot! I am doing a dance, and a song, and a juggling trick, all at once!"),
      L("C", "worried", "talk", "That sounds amazing. I only have one trick. What if I mess it up?"),
      L("A", "warm", "talk", "Every star shines in its own way, Max. Take a deep breath, and just do your best."),
      L("C", "relieved", "talk", "Okay. I will try. I have a very good bad feeling, but I will try anyway."),
    ]),
    S("cityhall", "night", "trophy", "The show begins, with Zap's very silly act.", [
      L("N", "excited", "party", "The curtain rose, and the audience clapped, and the bright stage lights glowed."),
      L("A", "joy", "talk", "Our first act is Zap the Robot, with his dance, his song and his juggling, all at once!"),
      L("B", "joy", "dance", "Thank you, Host Hattie! Ahem. La la la, I am a robot, doo doo doo!"),
      L("N", "joy", "juggle", "Zap began to juggle five shiny balls, while spinning on one wheel, and singing at the same time."),
      L("B", "shocked", "panic", "Whoa! Oops! The balls! The wheel! The song! Everything is a little bit too much!"),
      L("N", "joy", "party", "The balls bounced all over the stage, and one landed on the conductor's hat, and the audience roared with laughter."),
      L("A", "joy", "talk", "A big round of applause for Zap the Robot, the funniest juggler in Explox!"),
      L("B", "joy", "talk", "Thank you, thank you! I meant to do that! Every single bounce was a plan!"),
    ]),
    S("cityhall", "night", "star", "Max's turn comes, but the lights go out.", [
      L("N", "serious", "look", "More acts came and went, singers, dancers and a boy who could whistle like a bird."),
      L("A", "happy", "talk", "And now, a young magician, in his very first show. Please welcome, Max the Magician!"),
      L("C", "scared", "walk", "Here I go. One, two, three. Please, nobody laugh."),
      L("N", "worried", "magic", "Max walked onto the stage, raised his wand, and took a deep breath."),
      L("N", "shocked", "look", "But just as he opened his mouth, pop! All the lights in City Hall went out, and the room fell into darkness."),
      L("C", "scared", "panic", "Oh no! The lights! It is my fault! I broke the stage with my magic!"),
      L("A", "worried", "talk", "Do not worry, everyone. It is only a power cut. Please stay calm and stay in your seats."),
      L("B", "worried", "look", "I think my short circuit might have caused it. Sorry, everybody. Zap strikes again."),
    ]),
    S("cityhall", "night", "lantern", "In the dark, the show turns into something special.", [
      L("N", "serious", "look", "The audience murmured, and some people turned on their phone flashlights, and the room glowed with tiny stars."),
      L("A", "curious", "talk", "Max, I have an idea. A magician needs darkness, to make the magic glow. Can you still do your trick?"),
      L("C", "worried", "talk", "In the dark? My trick needs a spotlight. I do not know if I can."),
      L("B", "joy", "talk", "Max! I will help! I have glowing eyes! Look, I can be your spotlight!"),
      L("N", "joy", "magic", "Zap's round eyes lit up, two warm yellow beams, and he pointed them at the stage."),
      L("C", "surprised", "look", "Zap! That is perfect! Thank you! Stand right there, and shine your eyes on me."),
      L("C", "determined", "talk", "Okay. One trick, in the dark, in a pool of robot light. Here I go."),
      L("N", "excited", "magic", "Max raised his wand, and his hands, for the first time that night, stopped shaking."),
    ]),
    S("cityhall", "night", "star", "Max performs his trick, and a twist makes it even better.", [
      L("C", "determined", "magic", "Ladies and gentlemen, I will make a hundred little stars appear. Abracadabra, shine!"),
      L("N", "surprised", "magic", "Max waved his wand, and from the tip, a swirl of little glowing sparkles floated up into the air."),
      L("N", "joy", "magic", "The sparkles drifted across the dark room, twinkling like real stars, and settled on the ceiling."),
      L("N", "joy", "look", "The whole audience gasped, and then, softly, began to clap."),
      L("C", "shocked", "look", "It worked! The sparkles stayed! The magic is really happening!"),
      L("B", "joy", "dance", "Look at that, everybody! A starry sky inside City Hall! It is the prettiest trick I ever saw!"),
      L("A", "joy", "talk", "Max, that was wonderful! The darkness made your magic glow even brighter!"),
      L("N", "joy", "party", "The crowd stood and cheered, and the little stars glowed gently above their heads."),
    ]),
    S("cityhall", "night", "trophy", "The lights return, and the judges announce the winner.", [
      L("N", "relieved", "look", "A minute later, the lights flickered, hummed, and glowed back on, and the stage was bright again."),
      L("A", "happy", "talk", "Well, what a night! The judges have counted the votes. The winner of the Explox Talent Show is..."),
      L("N", "excited", "drum", "A drum rolled, and everyone held their breath."),
      L("A", "joy", "talk", "Max the Magician, and Zap the Robot, together! The best team act of the night!"),
      L("C", "shocked", "look", "Us? Together? But I did my trick alone, with Zap lighting me."),
      L("A", "warm", "talk", "That is what made it a team. Every star shines in its own way, and sometimes two stars shine brighter."),
      L("B", "joy", "dance", "We won! We won! Zap the Robot, Zap the Winner! Beep, beep, hooray!"),
      L("N", "joy", "party", "They lifted a golden trophy shaped like a star, and the whole hall cheered."),
    ]),
    S("cityhall", "night", "heart", "After the show, the friends have a warm moment.", [
      L("N", "warm", "walk", "After the show, the three friends sat on the steps of City Hall, under the real stars."),
      L("C", "happy", "talk", "Zap, thank you. I was so scared. I thought my magic would fail."),
      L("B", "warm", "talk", "Your magic did not fail, Max. The lights failed. Your magic made the dark sparkle."),
      L("A", "warm", "talk", "Max, I think you have a real gift. Would you like to perform every month, at the Explox Theater?"),
      L("C", "joy", "jump", "Every month? Really? I would love that! Can Zap be my partner?"),
      L("B", "joy", "dance", "Yes, yes, yes! The Magic Max and Zap Show! I will be the spotlight, the juggler and the snack bringer!"),
      L("A", "joy", "highfive", "Then it is settled. A new act, and a new friendship."),
      L("N", "warm", "talk", "And that is the story of the talent show surprise, and the magician who shone in the dark. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
