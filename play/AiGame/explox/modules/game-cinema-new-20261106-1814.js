// ─── NEW MOVIE (made automatically): The Day the Hospital Got the Giggles — a hospital comedy with a kind doctor, a robot nurse and a goofy patient.
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
  title: "The Day the Hospital Got the Giggles", genre: "🏥 Hospital Comedy", price: 30, bg: "#16384a", icons: "🏥😂🤖", comedy: true,
  cast: { A: { role: "Doctor Daisy", kind: "doctor", pers: "sweet", move: "BANDAGE SPIN", mtype: "spin", fav: "Laughter is the best medicine!", say: "I could not say no to one more patient. I never can." }, B: { role: "Nurse Beep", kind: "robot", pers: "wise", move: "LASER PUNCH", mtype: "punch", fav: "Think first, treat later.", say: "Sorry. I am talking too much again." }, C: { role: "Patient Pete", kind: "hero", pers: "goof", move: "PILLOW SMASH", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I rolled my wheelchair into the fish tank." } },
  trailer: [{ text: "🏥 One calm hospital...", dur: 2200 }, { text: "😂 One giant giggle...", dur: 2200 }, { text: "🪶 And one very tickly feather!", dur: 2400 }, { text: "THE DAY THE HOSPITAL GOT THE GIGGLES", dur: 3000 }],
  scenes: [
    S("hospital", "day", "heart", "On a calm Monday morning, Explox Hospital is quiet and clean, and Doctor Daisy starts her rounds.", [
      L("N", "warm", "walk", "It was a calm Monday morning at Explox Hospital, and the halls smelled like soap and fresh flowers."),
      L("A", "happy", "walk", "Good morning, Nurse Beep. Is everybody comfortable? Do the patients have their breakfast?"),
      L("B", "serious", "write", "Affirmative, Doctor. Room one has toast, room two has soup and room three has pudding."),
      L("C", "joy", "eat", "Room four, which is mine, has pudding, toast, soup and a second pudding."),
      L("A", "warm", "talk", "Pete, you only came in for a sore toe. Do you really need two puddings?"),
      L("C", "joy", "talk", "The toe is sore, Doctor, but my tummy is also a little bit sad."),
      L("B", "wise", "talk", "Logic: a sad tummy cannot be fixed with pudding. But a pudding can make it feel better."),
      L("A", "happy", "highfive", "Fair enough, Beep. Let us make the rounds and see who else needs us."),
    ]),
    S("hospital", "day", "heart", "Suddenly, a strange sound comes from the waiting room: a tiny giggle.", [
      L("N", "curious", "look", "Just then, a tiny sound drifted down the hall. Hee hee. Hee hee hee."),
      L("A", "curious", "look", "Did you hear that? It sounds like somebody is laughing in the waiting room."),
      L("B", "curious", "look", "Detecting giggles at forty decibels. Now fifty. Now sixty. It is getting louder."),
      L("C", "surprised", "look", "Oh look! The whole waiting room is laughing, and nobody even told a joke!"),
      L("N", "surprised", "dance", "In the waiting room, sixteen patients were laughing so hard that they were rolling on their chairs."),
      L("A", "surprised", "talk", "Oh my. This is not a normal cough, and it is not a normal cold. It is the giggles!"),
      L("B", "worried", "talk", "Hee hee. Oh no, I am giggling too. Hee hee. My circuits are tickled."),
      L("C", "joy", "dance", "Ha ha ha! Doctor, I cannot stop! Ha ha ha! My toe stopped hurting!"),
    ]),
    S("hospital", "day", "book", "Doctor Daisy and Nurse Beep try to find the cause, while giggling the whole time.", [
      L("A", "determined", "write", "Hee hee. Beep, we must find the cause. Hee hee. Write down everything."),
      L("B", "determined", "write", "Hee hee. Recording. Symptom one: giggling. Symptom two: more giggling."),
      L("A", "curious", "look", "Where did it start? Which room had the first giggle?"),
      L("C", "curious", "look", "Ha ha. I think it started in the supply closet. I heard a feather going whoosh."),
      L("B", "curious", "look", "A feather? Ha ha. That is a very strange clue."),
      L("A", "excited", "run", "Quick, to the supply closet! Hee hee. Follow me!"),
      L("N", "excited", "run", "Down the hall they ran, giggling and wobbling and bumping into laundry carts."),
      L("C", "joy", "jump", "Ha ha! Wheee! Hospital hallway race!"),
    ]),
    S("hospital", "day", "lantern", "In the supply closet, the friends find something very surprising.", [
      L("N", "curious", "sneak", "The supply closet door was open just a crack, and a funny whoosh-whoosh sound was coming from inside."),
      L("A", "curious", "sneak", "Hee hee. Quietly now. Do not scare whatever is in there."),
      L("N", "surprised", "look", "In the middle of the room, a big, fluffy feather was floating in the air, all by itself."),
      L("B", "shocked", "look", "A floating feather! Ha ha! It is flying around the room and tickling everything!"),
      L("C", "shocked", "look", "It is tickling the shelves! And the bandages! And the stethoscopes!"),
      L("A", "curious", "talk", "Where is it coming from? Feathers do not float by themselves."),
      L("N", "surprised", "look", "Behind a shelf of towels, a tiny, round parrot was fluttering its wings and giggling."),
      L("B", "surprised", "look", "A parrot! It is a tiny parrot with the giggles. Ha ha. He is the one making the feather float!"),
    ]),
    S("hospital", "day", "heart", "The little parrot explains why it is giggling.", [
      L("A", "warm", "talk", "Hello, little parrot. What is your name? Why are you hiding in the closet?"),
      L("N", "sad", "talk", "The little parrot hopped onto Doctor Daisy's finger. My name is Pip, and I flew in through an open window."),
      L("N", "worried", "talk", "I was cold and a little lost, and I hid here. I started to giggle, because I was nervous."),
      L("B", "curious", "talk", "So your giggle is a nervous giggle. And it spread to the whole hospital?"),
      L("C", "surprised", "talk", "That is why we all have the giggles. Giggles are catching!"),
      L("A", "warm", "talk", "Do not worry, Pip. You are safe here, and we will help you feel better."),
      L("N", "happy", "bubbles", "The little parrot sighed, fluffed his feathers and blew a tiny bubble of happiness."),
      L("B", "wise", "talk", "Think first, treat later. The cure is to make Pip feel calm."),
    ]),
    S("hospital", "day", "heart", "The team makes a calm, cozy corner for Pip to help him relax.", [
      L("N", "warm", "build", "The three friends worked together to build a soft, warm nest from towels and pillows."),
      L("A", "warm", "build", "A little blanket here, a soft pillow there. Perfect for a tiny parrot."),
      L("B", "wise", "work", "I will adjust the temperature of the room to exactly twenty-three degrees."),
      L("C", "happy", "eat", "And I will give him a piece of my second pudding. It is not for me anymore."),
      L("N", "warm", "sing", "Doctor Daisy sang a soft little song, and the parrot closed his eyes and began to yawn."),
      L("A", "warm", "sing", "Rest now, little Pip, rest now, little friend. The night is long, and the day will end."),
      L("N", "relieved", "talk", "The giggling slowly faded from the hospital, one room at a time, until it was quiet."),
      L("C", "relieved", "talk", "Whew. My cheeks hurt from laughing. And my toe feels great, by the way."),
    ]),
    S("hospital", "dusk", "trophy", "That evening, the hospital throws a small party for the patients and for Pip.", [
      L("N", "joy", "party", "That evening, the hospital threw a little party in the waiting room, with balloons and snacks."),
      L("A", "joy", "dance", "Everybody is healthy and happy, and we have a brand new friend!"),
      L("B", "joy", "photo", "Everybody smile! Click! This photo will go on the hospital wall."),
      L("C", "joy", "eat", "Pudding for everybody! Pudding for the doctors, and pudding for the nurses!"),
      L("N", "joy", "party", "Pip hopped from shoulder to shoulder and gave everyone a tiny, happy chirp."),
      L("A", "warm", "talk", "Pip, would you like to be our new hospital mascot? Your job is to cheer people up."),
      L("N", "joy", "dance", "The little parrot chirped yes, and flew a happy circle around the room."),
      L("B", "wise", "talk", "Laughter is the best medicine, but a good friend is even better."),
    ]),
    S("park", "dawn", "sun", "The next morning, Pete goes home, and the hospital team waves goodbye.", [
      L("N", "warm", "walk", "The next morning, Pete packed his bag and walked out of the hospital with a big smile."),
      L("C", "joy", "talk", "Thank you, Doctor Daisy. Thank you, Nurse Beep. And thank you, Pip."),
      L("A", "warm", "talk", "Take care of that toe, Pete. And come back whenever you need a good laugh."),
      L("B", "wise", "talk", "Statistically, you will be back next week for more pudding."),
      L("C", "joy", "highfive", "Probably! Bye, everybody!"),
      L("N", "warm", "party", "And Pip the parrot still lives at the hospital, where his happy giggle makes everybody feel a little bit better."),
      L("N", "warm", "talk", "And that is how a tiny parrot gave a whole hospital the giggles. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
