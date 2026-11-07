// ─── NEW MOVIE (made automatically): The Moon Cup Match — a sports comedy in space with a brave astronaut, a proud alien and a sweet robot.
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
  title: "The Moon Cup Match", genre: "⚽ Space Sports Comedy", price: 30, bg: "#101a3a", icons: "⚽🌙🚀", comedy: true,
  cast: { A: { role: "Captain Nova", kind: "astronaut", pers: "hero", move: "STAR SPIN KICK", mtype: "kick", fav: "Ready for kickoff!", say: "I always check the ball before the boots." }, B: { role: "Zog the Alien", kind: "alien", pers: "rival", move: "WIGGLE BOP", mtype: "punch", fav: "I always come in first.", say: "I know, I should be nicer. I never am." }, C: { role: "Beep the Robot", kind: "robot", pers: "sweet", move: "SPARK SPIN", mtype: "spin", fav: "Kindness is my best power.", say: "Sorry, my wheels squeaked." } },
  trailer: [{ text: "⚽ One big match...", dur: 2200 }, { text: "🌙 On the moon...", dur: 2200 }, { text: "🚀 Where a kick goes very, very far!", dur: 2400 }, { text: "THE MOON CUP MATCH", dur: 3000 }],
  scenes: [
    S("space", "night", "star", "Captain Nova's team arrives on the moon for the first Moon Cup soccer match.", [
      L("N", "excited", "fly", "High above Explox, a little rocket landed softly on the gray, dusty moon."),
      L("A", "excited", "jump", "We made it, team! The first Moon Cup soccer match in history!"),
      L("C", "joy", "dance", "Beep, beep! I polished the ball, and I polished my wheels. I am ready to play!"),
      L("N", "curious", "look", "On the other side of the moon field, a green alien team was warming up, in shiny silver shorts."),
      L("B", "serious", "talk", "So, you are the Earth team. I am Zog, captain of the Mars Meteors. We always win."),
      L("A", "determined", "talk", "Nice to meet you, Zog. May the best team win, and may everyone have fun."),
      L("B", "angry", "talk", "Fun? We play to win! Your robot looks like a toaster on wheels."),
      L("C", "sad", "talk", "I am not a toaster. I am Beep. But I will try my very best."),
    ]),
    S("space", "night", "star", "The match begins, and the low gravity makes everything silly.", [
      L("N", "excited", "party", "The match began, with a thousand cheering moon-bunnies in the stands."),
      L("A", "excited", "soccer", "Kickoff! I will take the ball down the field, and give it a super kick!"),
      L("N", "surprised", "fly", "But when Nova kicked the ball, it zoomed up so high, it floated away into the black sky."),
      L("A", "shocked", "look", "Whoa! The moon gravity is very light! The ball is almost in orbit!"),
      L("N", "joy", "fly", "Everyone laughed as the players bounced around, floating a little with every step."),
      L("B", "joy", "soccer", "I will catch it! Zog is the best jumper on Mars! Boing, boing, boing!"),
      L("N", "surprised", "jump", "Zog jumped so high, he flew over the goal, and landed on the roof of the scoreboard."),
      L("C", "joy", "talk", "Ha ha! Zog, you look like a green kangaroo! Are you all right up there?"),
    ]),
    S("space", "night", "star", "Zog plays rough, and Beep gets bumped.", [
      L("N", "serious", "soccer", "The Mars Meteors played hard, and the score was one to nothing for the aliens."),
      L("B", "angry", "soccer", "Out of my way, toaster! The goal is mine, mine, mine!"),
      L("N", "shocked", "look", "Zog bumped into Beep, and Beep tumbled over, rolling across the dusty field like a ball."),
      L("C", "sad", "talk", "Ouch. My wheel is bent. I think I need a little help."),
      L("A", "angry", "talk", "Zog, that was not fair. We play kindly, even when we want to win."),
      L("B", "angry", "talk", "It is only a game. Do not be such a softie, Earth captain."),
      L("N", "serious", "look", "The referee, a tall space owl, blew his whistle, and gave Zog a yellow card."),
      L("A", "determined", "talk", "Beep, can you stand? Take a break. Let me fix your wheel."),
    ]),
    S("space", "night", "star", "Halftime: Nova and Beep make a plan, with a funny idea.", [
      L("N", "serious", "walk", "At halftime, the Earth team gathered in a circle, behind the goal."),
      L("A", "determined", "talk", "We are losing one to nothing. We need a clever plan, and a little bit of silliness."),
      L("C", "curious", "talk", "Captain, the moon gravity makes the ball very light. What if we pass it up in the air, not on the ground?"),
      L("A", "excited", "talk", "Beep, that is brilliant! Sky passes! We will play the game in three dimensions!"),
      L("N", "joy", "juggle", "The team practiced right away, juggling the ball in the air, and bouncing it from head to head."),
      L("A", "joy", "jump", "Higher! Higher! This is the best soccer practice ever!"),
      L("C", "joy", "dance", "Beep, beep! I am a flying soccer robot! My bent wheel is as good as new!"),
      L("N", "excited", "party", "When the whistle blew, the Earth team ran back onto the field, full of energy."),
    ]),
    S("space", "night", "star", "The second half: sky passes, and a twist from Zog.", [
      L("N", "excited", "soccer", "In the second half, Nova kicked the ball high into the air, and Beep caught it with a bounce."),
      L("C", "excited", "soccer", "Pass! Up, up, and away! Captain, catch!"),
      L("A", "excited", "soccer", "Got it! And a big kick, right toward the goal! Fly, ball, fly!"),
      L("N", "surprised", "look", "But Zog leaped up, higher than anyone, and blocked the ball with his stomach."),
      L("B", "joy", "jump", "Not today, Earth! The Mars Meteors are unstoppable!"),
      L("N", "worried", "look", "Then, with a loud pop, the ball bounced off Zog, flew backward, and floated far, far away from the field."),
      L("B", "worried", "look", "Oh no. The ball is floating away to space! And it is our only ball!"),
      L("A", "worried", "talk", "Without the ball, there is no game. What do we do?"),
    ]),
    S("space", "night", "star", "Zog and Beep team up to rescue the ball.", [
      L("C", "determined", "talk", "I can roll after it! My wheels are fast, and my arms can stretch. But I need a boost."),
      L("B", "surprised", "look", "A boost? From me? After I bumped you?"),
      L("C", "warm", "talk", "Yes, Zog. Everyone deserves a second chance. Would you help me?"),
      L("B", "sad", "talk", "I am sorry I called you a toaster, Beep. You are the kindest player on the field."),
      L("B", "determined", "jump", "Jump on my shoulders! I will leap as high as I can, and you will catch the ball!"),
      L("N", "excited", "jump", "Zog crouched, and sprang up with all his might, carrying Beep high above the moon dust."),
      L("C", "excited", "fly", "I see the ball! Stretch, stretch, stretch! Got it!"),
      L("N", "joy", "party", "Beep caught the ball in both hands, and Zog caught Beep, and both landed in a big, soft, dusty heap."),
    ]),
    S("space", "night", "trophy", "The match ends in a friendly draw, with a surprise ending.", [
      L("N", "excited", "soccer", "The two captains played the last minutes together, passing the ball in the air, high above the field."),
      L("A", "joy", "soccer", "Zog, pass it to me! Now to Beep! Now back to Zog!"),
      L("B", "joy", "soccer", "Take the shot, Beep! You have the best aim on the moon!"),
      L("C", "joy", "soccer", "One, two, three, kick! Beep, beep, goal!"),
      L("N", "joy", "party", "The ball floated slowly into the net, and the final whistle blew. One goal each, it was a draw."),
      L("A", "joy", "highfive", "A draw! A perfect, friendly draw! Good game, Zog!"),
      L("B", "joy", "highfive", "Good game, Captain. And good game, Beep. I learned a big lesson today."),
      L("N", "joy", "party", "The moon-bunnies in the stands cheered, and the owl referee gave both teams a big, shiny, silver cup."),
    ]),
    S("space", "night", "star", "After the match, everyone shares a moonlit celebration.", [
      L("N", "warm", "walk", "After the match, the two teams sat together on the moon, looking back at the beautiful blue Earth."),
      L("A", "warm", "talk", "Look at our planet, up there. It looks so small and so beautiful."),
      L("B", "warm", "talk", "And my planet, Mars, is the little red dot over there. We are all neighbors, really."),
      L("C", "happy", "talk", "Kindness is my best power. And it works even on the moon."),
      L("N", "joy", "party", "They shared space snacks, floating cookies, and a big bowl of moon-cheese dip."),
      L("B", "joy", "eat", "These cookies are delicious. Can the Earth team come to Mars next year for the rematch?"),
      L("A", "joy", "highfive", "Absolutely! The Mars Cup is on! But this time, we all play on the same team."),
      L("N", "warm", "talk", "And that is the story of the Moon Cup match, and the rival who became a friend. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
