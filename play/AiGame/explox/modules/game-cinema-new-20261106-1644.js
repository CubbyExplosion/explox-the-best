// ─── NEW MOVIE (made automatically): The Great Field Trip Mix-Up — a school adventure comedy with a teacher, a new alien student and a goofy robot.
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
  title: "The Great Field Trip Mix-Up", genre: "🚌 School Adventure", price: 30, bg: "#1a2f4a", icons: "🚌🚀🎒", comedy: true,
  cast: { A: { role: "Teacher Tara", kind: "hero", pers: "wise", move: "CLIPBOARD SMASH", mtype: "punch", fav: "Line up, everybody!", say: "I know, I should have read the map. I never do." }, B: { role: "Pip the Alien", kind: "alien", pers: "nervous", move: "UFO FLYING KICK", mtype: "jumpkick", fav: "I have a very good bad feeling.", say: "My knees will not stop shaking. They are made of jelly." }, C: { role: "Rocky the Robot", kind: "robot", pers: "goof", move: "LASER PUNCH", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I pressed the wrong button again." } },
  trailer: [{ text: "🚌 One yellow school bus...", dur: 2200 }, { text: "🗺️ One upside-down map...", dur: 2200 }, { text: "🚀 And one huge surprise!", dur: 2400 }, { text: "THE GREAT FIELD TRIP MIX-UP", dur: 3000 }],
  scenes: [
    S("school", "dawn", "sun", "At Explox School, the class is excited about today's big field trip to the museum.", [
      L("N", "excited", "party", "It was field trip day at Explox School, and the whole class was buzzing with excitement."),
      L("A", "excited", "write", "Good morning, class! Today we visit the Explox Museum. Please check your backpacks."),
      L("C", "joy", "eat", "I packed twelve sandwiches and a very big juice box. Is that enough?"),
      L("B", "worried", "talk", "I am the new student. I have never been on a school bus. Is it safe?"),
      L("A", "warm", "talk", "Perfectly safe, Pip. The bus driver is very careful, and so am I."),
      L("B", "scared", "panic", "What if I get lost? I have a very good bad feeling about this."),
      L("C", "warm", "highfive", "Do not worry, Pip. You can sit next to me. I have snacks."),
      L("A", "determined", "walk", "All right, line up, everybody! The bus is waiting outside."),
    ]),
    S("city", "day", "car", "The bus rolls through Explox, and the teacher checks the map.", [
      L("N", "happy", "walk", "The yellow bus rolled down the busy streets of Explox, past shops, parks and a very large pizza."),
      L("C", "joy", "play", "Look at that pizza! It is the size of a house! Can we stop?"),
      L("A", "warm", "talk", "Not today, Rocky. The museum is next. Pip, can you read the map for me?"),
      L("B", "curious", "write", "Of course. The museum is at the top of the page. And we are at the bottom."),
      L("B", "surprised", "look", "Oh. The map is upside down. So the museum is at the bottom."),
      L("A", "shocked", "look", "Upside down? Driver, please turn the bus around!"),
      L("C", "surprised", "look", "Oh look! We just drove past the museum. It was right there, on the left."),
      L("N", "worried", "run", "But the driver had already taken the highway, and the bus was going faster and faster."),
    ]),
    S("airport", "day", "rocket", "The bus takes a wrong turn and drives straight into a very surprising place.", [
      L("N", "surprised", "run", "The bus drove past a big sign. It said, Explox Space Dock, Welcome, Visitors."),
      L("A", "shocked", "panic", "The Space Dock? This is not the museum! Driver, stop the bus!"),
      L("N", "worried", "panic", "But the bus rolled right through the gate, and the guard thought they were an official tour."),
      L("C", "joy", "look", "Wow! Rockets! A real rocket! Pip, look at the huge rocket!"),
      L("B", "shocked", "look", "That looks just like my family's rocket at home. My mom drives one just like it."),
      L("A", "curious", "look", "Pip, you are from space? I thought you were just from the next town."),
      L("B", "worried", "talk", "I did not tell anybody. I was a little nervous about being different."),
      L("A", "warm", "talk", "Pip, being different is wonderful. Space is the best place for a field trip."),
    ]),
    S("airport", "day", "rocket", "The launch crew mistakes the class for honored guests.", [
      L("N", "excited", "walk", "A woman in a shiny orange suit ran toward the bus with a big smile."),
      L("N", "excited", "talk", "Welcome, VIP students! You are just in time for today's special launch of the first schoolbus rocket!"),
      L("A", "shocked", "talk", "Schoolbus rocket? But we only wanted to see some old bones at the museum."),
      L("C", "joy", "jump", "A rocket launch! Teacher, can we please stay? Please, please, please?"),
      L("B", "scared", "panic", "A launch? Today? In a bus? I do not think I am ready."),
      L("A", "serious", "talk", "Pip, we can say no. Nobody will make you do anything."),
      L("B", "determined", "talk", "No, I want to see it. I have never watched a launch from the ground."),
      L("A", "warm", "highfive", "Then we stay. Everybody keep your seatbelts on, and your hands inside."),
    ]),
    S("airport", "day", "rocket", "The class gets a tour of the Space Dock, with a few funny moments.", [
      L("N", "joy", "walk", "The launch crew showed the class the control room, the engines, and the very big red button."),
      L("C", "excited", "look", "Teacher, look at that big red button! May I press it? Just once?"),
      L("A", "worried", "talk", "No, Rocky. That button is for the countdown."),
      L("C", "surprised", "panic", "Oops. I leaned on it a tiny bit. The red button is going beep beep beep."),
      L("N", "shocked", "panic", "A loud voice shouted from the speakers: Ten, nine, eight, seven..."),
      L("A", "shocked", "panic", "Rocky! You started the countdown! Stop it!"),
      L("B", "shocked", "run", "How do we stop it? My mom would know. Where is the stop button?"),
      L("C", "worried", "look", "I think the stop button is, um, the other red button. Or maybe the blue one."),
    ]),
    S("airport", "day", "rocket", "Pip steps up, and the team works together to stop the countdown.", [
      L("N", "worried", "run", "Six, five, four, three... the countdown kept going, and the rocket began to shake."),
      L("B", "determined", "run", "I know this rocket. My mom taught me. The stop button is under the green lever."),
      L("A", "relieved", "talk", "Pip, you know the controls? You are our hero!"),
      L("B", "determined", "work", "Green lever, up. Blue switch, down. Now press the little yellow button."),
      L("N", "relieved", "work", "Two, one... the countdown stopped, and the engines went silent with a soft whirr."),
      L("C", "relieved", "talk", "Whew. That was a close one. I am sorry, everybody. I pressed the wrong button again."),
      L("A", "warm", "talk", "It was an accident, Rocky. And you learned that we need to ask before we press."),
      L("B", "joy", "highfive", "And I learned that I am a good astronaut after all!"),
    ]),
    S("space", "night", "moon", "The grateful crew gives the class a special reward: a short ride in a training rocket.", [
      L("N", "joy", "party", "The launch crew was so thankful that they invited the class for a special short flight."),
      L("A", "surprised", "talk", "A real trip to space? In a training rocket? For schoolchildren?"),
      L("N", "excited", "fly", "The little rocket rose slowly above the clouds, and the whole class pressed their noses to the windows."),
      L("C", "joy", "fly", "Teacher, I can see my house from here! And the pizza! It looks like a button!"),
      L("B", "joy", "fly", "Look at all the stars. They look like my mom's lanterns at home."),
      L("A", "warm", "photo", "Everybody, smile! This is the best class photo in the history of Explox School."),
      L("B", "happy", "photo", "Say cheese! No, say stars! No, say both!"),
    ]),
    S("space", "night", "moon", "In space, the class learns about the moon, the stars and a new friend.", [
      L("A", "curious", "write", "Class, please write down what you see. A moon, a hundred stars and a rocket."),
      L("C", "joy", "write", "I wrote: space is big, space is dark, and space has no snacks."),
      L("B", "warm", "talk", "That is not true, Rocky. I packed some space crackers. They are in my backpack."),
      L("C", "joy", "eat", "Space crackers! I take it back. Space is the best place ever."),
      L("A", "warm", "talk", "Pip, would you like to tell the class about your home planet?"),
      L("B", "worried", "talk", "Um, sure. My planet has purple grass, two moons and a lot of very friendly dinosaurs."),
      L("C", "surprised", "look", "Dinosaurs? Purple grass? Pip, that is the coolest thing I have ever heard!"),
      L("B", "joy", "dance", "They really are friendly. I will show you my pictures after we land."),
    ]),
    S("airport", "dusk", "sun", "At sunset, the rocket lands, and the class heads back to the bus.", [
      L("N", "warm", "walk", "The rocket landed softly at the Space Dock, just as the sun was setting."),
      L("A", "warm", "talk", "Thank you all for being so brave today. This was an unforgettable field trip."),
      L("C", "joy", "highfive", "Best day of my robot life! Better than the museum, and better than pizza."),
      L("B", "joy", "party", "I was not scared at all. Well, only a little bit, at the very start."),
      L("N", "warm", "shop", "The launch crew handed every student a shiny little space rock as a souvenir."),
      L("A", "relieved", "walk", "Now, back on the bus, everybody. And this time, I will hold the map the right way."),
      L("C", "joy", "dance", "Teacher, can we visit the real museum tomorrow? With the old bones?"),
      L("A", "joy", "party", "Of course, Rocky. A trip to space and a trip to the museum, all in one week!"),
    ]),
    S("school", "dusk", "sun", "Back at school, the class tells everyone about their amazing day.", [
      L("N", "warm", "walk", "The next morning, the class stood in front of the whole school and told the story."),
      L("A", "warm", "talk", "And that is how a school bus, an upside-down map and a very brave new student took us all to space."),
      L("N", "joy", "party", "The whole school clapped and cheered, and the principal gave Pip a shiny star-shaped badge."),
      L("B", "joy", "photo", "Thank you, everybody. I was nervous on my first day, but now I feel at home."),
      L("C", "joy", "dance", "And I will always check the buttons before I press them. Almost always."),
      L("A", "warm", "highfive", "Every day with you is an adventure, class. Let us do it again, with a better map."),
      L("N", "warm", "talk", "And that is how a field trip mix-up turned into the best day in the history of Explox School. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
