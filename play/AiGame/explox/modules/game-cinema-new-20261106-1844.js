// ─── NEW MOVIE (made automatically): The Little Dragon Who Was Afraid to Fly — a fantasy adventure with a baby dragon, a wise wizard and a goofy knight.
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
  title: "The Little Dragon Who Was Afraid to Fly", genre: "🐉 Fantasy Adventure", price: 30, bg: "#2a1a3a", icons: "🐉🏰✨", comedy: true,
  cast: { A: { role: "Ember the Dragon", kind: "dragon", pers: "nervous", move: "FIRE-BREATH PUNCH", mtype: "punch", fav: "I have a very good bad feeling.", say: "My wings will not stop shaking. They are made of jelly." }, B: { role: "Wizard Wilbur", kind: "wizard", pers: "wise", move: "SPARKLE BLAST KICK", mtype: "kick", fav: "Think first, flap later.", say: "Sorry. I am talking too much again." }, C: { role: "Knight Nora", kind: "hero", pers: "goof", move: "SHIELD BASH", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I fell off my horse again." } },
  trailer: [{ text: "🐉 One small dragon...", dur: 2200 }, { text: "🏰 One very tall castle...", dur: 2200 }, { text: "😰 And one giant fear of flying!", dur: 2400 }, { text: "THE LITTLE DRAGON WHO WAS AFRAID TO FLY", dur: 3000 }],
  scenes: [
    S("castle", "dawn", "sun", "At Explox Castle, the dragons are learning to fly, but little Ember is hiding behind a pillar.", [
      L("N", "warm", "walk", "It was a bright, sunny morning at Explox Castle, and all the young dragons were learning to fly."),
      L("N", "joy", "fly", "One by one, they flapped their wings and soared across the sky like tiny, colorful kites."),
      L("C", "joy", "look", "Look at them go! Whee! Look, even the littlest one in the green scales is doing loops!"),
      L("B", "curious", "look", "Interesting. But where is Ember? She was supposed to take off first."),
      L("N", "worried", "sneak", "Behind a big stone pillar, a small purple dragon was hiding with her wings folded tightly."),
      L("A", "scared", "panic", "I am not coming out. The sky is too big, and the ground is too far away."),
      L("B", "warm", "talk", "Ember, flying is simply flapping and believing. Would you like to try with a little help?"),
      L("A", "worried", "talk", "I have a very good bad feeling about it. My wings are made of jelly."),
    ]),
    S("castle", "day", "wall", "Ember explains her fear, and Nora has a funny idea.", [
      L("C", "warm", "talk", "Ember, why are you scared? You are a dragon! You are meant to fly!"),
      L("A", "sad", "talk", "Once, I tried to fly from the top of the wall, and I fell right into the pond."),
      L("C", "surprised", "look", "Into the pond? Ha ha! Sorry. That is not funny. Okay, it is a little funny."),
      L("A", "sad", "talk", "It was cold, and a frog sat on my head. Now I am scared of heights."),
      L("B", "warm", "talk", "Everybody has a first time. The trick is to start small, and to practice."),
      L("C", "excited", "jump", "I know! We can start on the ground. First, flap. Then hop. Then fly!"),
      L("A", "curious", "talk", "Flap, then hop, then fly? That sounds easier than I thought."),
      L("B", "determined", "write", "Excellent plan, Nora. Let us make a practice course in the meadow."),
    ]),
    S("nature", "day", "tree", "In the meadow, the friends build a practice course for Ember.", [
      L("N", "joy", "build", "In the green meadow, the three friends built a little practice course with hay bales and ribbons."),
      L("C", "joy", "build", "A hay bale here, a ribbon there, and a tiny ramp over this puddle."),
      L("B", "serious", "work", "Lesson one is the flap. Ember, flap your wings at the same time. One, two, flap."),
      L("A", "worried", "exercise", "One, two, flap. Ooh, my wings are wobbling. Is that normal?"),
      L("B", "warm", "talk", "Perfectly normal. Now, a little hop. Just one foot off the ground."),
      L("A", "surprised", "jump", "I hopped! I am off the ground! I am a hopping dragon!"),
      L("C", "joy", "highfive", "Great job, Ember! You are a natural. Give me a high five. Or a high claw!"),
      L("N", "joy", "party", "Ember giggled and hopped over a tiny hay bale, then another one, and a bigger one."),
    ]),
    S("nature", "day", "tree", "Ember gets braver, and the practice gets a little higher.", [
      L("B", "determined", "write", "Lesson two. Climb to the second hay bale, and glide down to the meadow."),
      L("A", "worried", "climb", "Okay. Up I go. One claw, two claws, three claws. I am quite high now."),
      L("A", "scared", "panic", "Oh no, I looked down. It is very far down. I cannot do it."),
      L("C", "warm", "talk", "Do not look down, Ember. Look at me. I am standing right here to catch you."),
      L("A", "determined", "talk", "You will catch me? Even if I land on you?"),
      L("C", "joy", "talk", "Especially if you land on me. I am wearing my best soft armor today."),
      L("A", "determined", "fly", "Okay. One, two, three. Flap! I am gliding! I am really gliding!"),
      L("N", "joy", "play", "Ember sailed slowly through the air, and landed with a soft bump in Nora's arms."),
    ]),
    S("nature", "dusk", "bolt", "But a storm rolls in and brings a very big problem.", [
      L("N", "worried", "look", "As the afternoon turned to evening, dark gray clouds began to roll over the hills."),
      L("B", "worried", "look", "Look at those clouds. A big storm is coming, and a young dragon should not fly in it."),
      L("N", "worried", "panic", "The wind began to howl, and thunder rolled across the meadow like a giant drum."),
      L("C", "scared", "panic", "Quick, everyone! We must get back to the castle before the rain starts!"),
      L("A", "scared", "run", "My wings! The wind is pulling me up! Help, I am floating away!"),
      L("N", "shocked", "fly", "A big gust of wind lifted Ember off the ground, and she tumbled up and over the hay bales."),
      L("C", "shocked", "run", "Ember! Hold on! I am coming!"),
      L("B", "determined", "magic", "I will cast a protection spell. Hold on, everyone, and do not let go of the ropes!"),
    ]),
    S("nature", "dusk", "bolt", "Ember has to make a big decision in the middle of the storm.", [
      L("N", "worried", "fly", "High above the meadow, Ember was caught in the wind, and she could see the whole kingdom below."),
      L("A", "scared", "panic", "I am so high! I am so scared! I do not know how to land!"),
      L("C", "determined", "run", "Ember, flap your wings! Flap and believe, just like Wilbur said!"),
      L("A", "worried", "talk", "I cannot do it! My wings are made of jelly!"),
      L("B", "warm", "talk", "Ember, your wings are made of scales and muscles, and they are strong. Trust them."),
      L("A", "determined", "fly", "Okay. Flap, flap, flap. I am steering! I am flying!"),
      L("N", "joy", "fly", "With a mighty flap, Ember turned against the wind and glided in a big, brave circle."),
      L("A", "joy", "fly", "I am doing it! I am really flying!"),
    ]),
    S("castle", "night", "moon", "Ember lands safely, and the storm passes.", [
      L("N", "relieved", "fly", "Slowly and carefully, Ember glided down to the castle courtyard, right into Nora's soft arms."),
      L("C", "joy", "highfive", "You did it, Ember! You flew in a storm! That is the bravest thing ever!"),
      L("B", "warm", "talk", "I am so proud of you. You were afraid, but you did it anyway."),
      L("A", "relieved", "talk", "I was scared the whole time, but I did not stop. Is that being brave?"),
      L("B", "wise", "talk", "That is exactly what being brave means. Courage is doing it while scared."),
      L("N", "relieved", "talk", "The thunder rolled away, the clouds drifted off, and the stars came out one by one."),
      L("C", "joy", "eat", "Flying makes me hungry. Who wants a snack? I have cookies in my armor."),
      L("A", "joy", "party", "Cookies! The best dessert for a brave dragon!"),
    ]),
    S("castle", "dawn", "sun", "The next morning, the whole kingdom celebrates Ember's first real flight.", [
      L("N", "joy", "party", "The next morning, the whole kingdom gathered in the castle square for the Dragon Flying Festival."),
      L("A", "excited", "fly", "Everybody, watch this! One, two, three, flap! I am flying over the castle!"),
      L("N", "joy", "fly", "Ember soared over the towers and flags, and did a perfect loop in front of the crowd."),
      L("C", "joy", "dance", "Go, Ember, go! Look at her flying! My friend the dragon!"),
      L("B", "joy", "photo", "Everybody say flap! Click! The first photo of a dragon who was afraid to fly."),
      L("A", "joy", "highfive", "Thank you both for believing in me. I could never have done it without you."),
      L("N", "warm", "talk", "And that is how a little dragon learned to fly, one flap and one friend at a time. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
