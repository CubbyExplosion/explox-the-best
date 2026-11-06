// ─── NEW MOVIE (made automatically): The Concert That Lost Its Power — a music comedy with a singer, a drumming robot and a nervous ghost.
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
  title: "The Concert That Lost Its Power", genre: "🎸 Music Comedy", price: 30, bg: "#2a1030", icons: "🎸🥁🎤", comedy: true,
  cast: { A: { role: "Melody Max", kind: "hero", pers: "hero", move: "GUITAR SMASH", mtype: "punch", fav: "Turn it up, Explox!", say: "I know, I should have checked the plug. I never do." }, B: { role: "Beats the Robot", kind: "robot", pers: "goof", move: "DRUM ROLL SPIN", mtype: "spin", fav: "Boom boom beep!", say: "Sorry, I drummed on the wrong thing again." }, C: { role: "Echo the Ghost", kind: "ghost", pers: "nervous", move: "SPOOKY SPIN", mtype: "spin", fav: "I have a very good bad feeling.", say: "My voice shakes when too many people look at me." } },
  trailer: [{ text: "🎸 One big concert...", dur: 2200 }, { text: "⚡ One giant power cut...", dur: 2200 }, { text: "🥁 And one very noisy plan!", dur: 2400 }, { text: "THE CONCERT THAT LOST ITS POWER", dur: 3000 }],
  scenes: [
    S("arena", "dusk", "trophy", "At the Explox Arena, a huge crowd waits for the biggest concert of the year.", [
      L("N", "excited", "party", "The lights glowed, the crowd cheered, and the Explox Arena was packed from the floor to the roof."),
      L("A", "excited", "look", "Beats, look at all those people! Everyone in Explox came to hear us!"),
      L("B", "joy", "drum", "Boom boom beep! My drum sticks are ready. Ready, ready, ready!"),
      L("C", "scared", "panic", "So many people. I have a very good bad feeling about this."),
      L("A", "warm", "talk", "Echo, you sing like an angel. Everyone will love your voice."),
      L("C", "worried", "talk", "My voice shakes when too many people look at me."),
      L("A", "determined", "highfive", "Then look at me, and sing it to just me. We are a team."),
      L("N", "excited", "party", "The announcer counted down. Three, two, one, and the band walked onto the stage."),
    ]),
    S("arena", "dusk", "bolt", "The first song begins, and the music is wonderful. For about twenty seconds.", [
      L("A", "joy", "sing", "Hello, Explox! Are you ready to rock?"),
      L("N", "joy", "dance", "The crowd roared. The drums thundered, the guitar sang and the lights flashed in every color."),
      L("B", "joy", "drum", "Boom boom beep! Boom boom beep! This is the best day of my robot life!"),
      L("C", "happy", "sing", "La la laaa! Oh, I am actually singing. In front of everyone!"),
      L("N", "surprised", "panic", "Then, with a loud bzzzt, every light and every speaker went completely dark."),
      L("A", "shocked", "panic", "What happened? Why is everything off?"),
      L("B", "scared", "panic", "Beep? Beep? My drum lights are off. And the speakers are silent!"),
      L("C", "scared", "panic", "It is dark! It is very, very dark! Even I do not like it, and I am a ghost!"),
    ]),
    S("arena", "night", "lantern", "The power is gone, and the crowd starts to get restless.", [
      L("N", "worried", "look", "Thousands of people sat in the dark. Somebody coughed. Somebody whispered. Somebody dropped a soda."),
      L("A", "worried", "talk", "Beats, can you fix the power? You are a robot, after all."),
      L("B", "worried", "work", "I can try. Let me check the plug. Beep. Boop. Click."),
      L("B", "surprised", "look", "The plug is fine. The whole city has no power. A big storm knocked it all out."),
      L("C", "sad", "talk", "So the concert is over. Everyone will go home, and it was my first time singing."),
      L("A", "serious", "talk", "Not so fast, Echo. A band is more than lights and speakers."),
      L("A", "determined", "write", "We have our hands, our feet and our voices. We can still make music."),
      L("B", "curious", "look", "Make music with no power? How? With what?"),
    ]),
    S("scrapyard", "night", "lantern", "Max has an idea, and the team rushes to the back of the arena.", [
      L("N", "curious", "run", "Max ran behind the stage, where there was a pile of old buckets, pipes and boxes."),
      L("A", "excited", "build", "Look at this! Buckets, pots and pipes! We can build a whole new band!"),
      L("B", "joy", "build", "An upside-down bucket is a drum. A pot lid is a cymbal. Beep!"),
      L("C", "curious", "build", "And a long pipe with a funnel is a trumpet. I can hum into it."),
      L("N", "joy", "build", "In five minutes, the three friends had built the funniest band in the world."),
      L("B", "joy", "drum", "Boom boom beep! It sounds even cooler than the real drums!"),
      L("A", "worried", "look", "But it is so dark. The crowd cannot see us."),
      L("C", "surprised", "look", "Oh look! Fireflies! A whole cloud of them, outside the window!"),
    ]),
    S("park", "night", "lantern", "Echo asks the fireflies for a little help.", [
      L("N", "warm", "walk", "Echo floated outside, next to the glowing garden."),
      L("C", "nervous", "talk", "Um, hello, little fireflies. Would you like to come to a concert?"),
      L("N", "surprised", "magic", "The fireflies blinked, twinkled and began to dance around Echo's hands."),
      L("C", "surprised", "magic", "They said yes! They will light the whole stage! Thank you, little friends!"),
      L("A", "joy", "highfive", "Echo, you did it, and you talked to a hundred fireflies."),
      L("C", "happy", "talk", "I was brave because they were not looking at me. They were looking at the stars."),
      L("B", "joy", "dance", "Beep! The best stage lights in Explox! Totally free!"),
    ]),
    S("arena", "night", "lantern", "The band returns to the stage, and the crowd is completely surprised.", [
      L("N", "excited", "walk", "The three friends walked back on stage, carrying buckets, pots and a pipe."),
      L("A", "excited", "talk", "Ladies and gentlemen, the power is out, but the music is not!"),
      L("N", "surprised", "magic", "Thousands of fireflies floated into the arena and turned the stage into a sea of twinkling stars."),
      L("B", "excited", "drum", "One, two, three, four! Bucket drums, go!"),
      L("N", "joy", "drum", "Boom, clank, boom, clank! The rhythm bounced around the arena."),
      L("C", "happy", "sing", "La la la, under the stars. The night is bright, wherever you are."),
      L("A", "joy", "dance", "Everybody, clap along! Clap, clap, stomp! Clap, clap, stomp!"),
      L("N", "joy", "party", "And thousands of people clapped and stomped, and the whole arena shook."),
    ]),
    S("arena", "night", "trophy", "Then comes the funniest twist of the whole night.", [
      L("N", "curious", "look", "Just as the song reached the big finish, something rolled down the aisle."),
      L("B", "surprised", "look", "Is that a tiny baby dinosaur? In a hat? Riding a skateboard?"),
      L("N", "surprised", "skate", "The little dinosaur zipped onto the stage and bumped into the pipe trumpet."),
      L("N", "joy", "juggle", "The pipe trumpet went toot, and it sounded just like a goofy elephant."),
      L("A", "joy", "dance", "A guest star! Everyone, give a hand to the toot-toot dinosaur!"),
      L("C", "joy", "sing", "Toot toot, little dino. You are in our band now!"),
      L("B", "joy", "highfive", "Boom boom toot! Our funniest song ever!"),
    ]),
    S("arena", "dawn", "sun", "Early the next morning, the power comes back, and the town cheers one more time.", [
      L("N", "relieved", "walk", "By morning, the storm had passed, and the lights of Explox came flickering back on."),
      L("A", "relieved", "talk", "The power is back. Everyone, you can switch the lights on, but please do not stop clapping!"),
      L("N", "joy", "party", "The crowd laughed and cheered, and the arena lights twinkled like a thousand tiny stars."),
      L("B", "joy", "photo", "Everybody, squeeze in. A group photo with the fireflies and the toot-toot dino!"),
      L("C", "happy", "photo", "I forgot to be scared. I sang to the whole town!"),
      L("A", "warm", "talk", "Echo, you were the star of the night."),
      L("C", "joy", "dance", "No, we were. All three of us, and a hundred fireflies, and one tiny dinosaur."),
    ]),
    S("park", "dawn", "sun", "At sunrise, the band celebrates with breakfast in the park.", [
      L("N", "warm", "eat", "The friends had a picnic breakfast under the morning sun."),
      L("B", "joy", "eat", "Pancakes! Pancakes! I will drum on the pancake stack. Boom, boom, flop."),
      L("A", "joy", "eat", "Beats, please do not drum on the breakfast. Eat it."),
      L("C", "warm", "talk", "Thank you both for helping me be brave. I used to hide behind curtains."),
      L("A", "warm", "talk", "You will never hide again, Echo. You are a real star."),
      L("B", "joy", "party", "And I am a real drummer, with a real bucket drum."),
      L("N", "warm", "talk", "And that is how a band with no power made the loudest, brightest, funniest concert in Explox. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
