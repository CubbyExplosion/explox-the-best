// ─── NEW MOVIE (made automatically): The Little Fire Truck That Could — a city rescue story with a brave chief, a goofy robot and a nervous little helper.
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
  title: "The Little Fire Truck That Could", genre: "🚒 City Rescue", price: 30, bg: "#4a1a1a", icons: "🚒🔥💧", comedy: true,
  cast: { A: { role: "Chief Daisy", kind: "hero", pers: "hero", move: "HOSE SPIN", mtype: "spin", fav: "Brave hearts, steady hands!", say: "I know, I should rest more. The city never sleeps." }, B: { role: "Pump the Robot", kind: "robot", pers: "goof", move: "SPLASH BLAST", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I turned on the water too early." }, C: { role: "Tiny Ted", kind: "hero", pers: "nervous", move: "LADDER LEAP", mtype: "kick", fav: "I have a very good bad feeling.", say: "My hands will not stop shaking." } },
  trailer: [{ text: "🚒 One very small fire truck...", dur: 2200 }, { text: "🔥 One big job...", dur: 2200 }, { text: "💧 And a team that never gives up!", dur: 2400 }, { text: "THE LITTLE FIRE TRUCK THAT COULD", dur: 3000 }],
  scenes: [
    S("city", "dawn", "sun", "At the little Explox fire station, a new morning begins.", [
      L("N", "warm", "walk", "At the edge of downtown Explox stood a little red fire station, with a very small fire truck inside."),
      L("A", "happy", "work", "Good morning, team! Time to polish our truck, and check every hose."),
      L("B", "joy", "work", "Yes, Chief! I polished the truck eleven times already! It is so shiny, I can see my own face!"),
      L("C", "worried", "look", "The truck is so small. The big city trucks are three times bigger. Can we really help with a real fire?"),
      L("A", "warm", "talk", "Ted, size does not matter. Brave hearts, steady hands, and a little truck that never quits."),
      L("B", "joy", "dance", "Yeah! Our truck is little, but it has a big, loud siren! Woo woo woo!"),
      L("C", "relieved", "talk", "Okay, Chief. I will try my best. I just hope nothing goes wrong today."),
      L("N", "serious", "look", "Just then, the big red alarm on the wall began to ring, ding-ding-ding."),
    ]),
    S("city", "day", "bolt", "An alarm rings, and the little truck races across the city.", [
      L("A", "serious", "talk", "Alarm! A bakery on Rainbow Street has a smoky oven! Let us go, team!"),
      L("N", "excited", "run", "The three friends jumped into the little fire truck, and zoomed out of the station, siren blaring."),
      L("B", "excited", "drive", "Weee-ooo, weee-ooo! Make way for the little truck! Coming through!"),
      L("C", "scared", "panic", "Pump, slow down! You are driving too fast! We are going to hit the lamppost!"),
      L("B", "joy", "drive", "Do not worry, Ted! I am an excellent driver! I only hit three lampposts last month!"),
      L("A", "worried", "talk", "Pump, eyes on the road, please. Safety first, speed second."),
      L("N", "excited", "drive", "The little truck swerved around a corner, past the park, and down the busy city street."),
      L("A", "determined", "look", "There! The bakery! I can see gray smoke coming out of the chimney!"),
    ]),
    S("city", "day", "fire", "At the bakery, the team finds a small, smoky problem.", [
      L("N", "worried", "look", "Outside the bakery, a crowd of neighbors stood, coughing, as gray smoke puffed out of the doors."),
      L("A", "serious", "talk", "Everyone, please step back. The Explox Fire Team is here. We will take care of it."),
      L("C", "worried", "talk", "Chief, I am scared. The bakery is full of smoke. What if somebody is inside?"),
      L("A", "warm", "talk", "Good thinking, Ted. Let us check. Pump, stay with the truck, and get the hose ready."),
      L("N", "serious", "sneak", "Chief Daisy and Ted put on their helmets, and slowly walked into the smoky bakery."),
      L("N", "curious", "look", "Inside, the oven was puffing, and a tray of burnt cookies sat on the counter."),
      L("C", "surprised", "look", "Chief! It is only burnt cookies! There is no real fire here!"),
      L("A", "relieved", "talk", "Phew! Good work, Ted. A very smoky cookie, but no flames."),
    ]),
    S("city", "day", "fire", "Then a real problem appears: a second alarm, on the other side of town.", [
      L("N", "serious", "look", "Just as the team finished airing out the bakery, the radio on Chief Daisy's belt crackled."),
      L("N", "worried", "talk", "Attention, Fire Team! There is a real fire at the old furniture warehouse, and the big trucks are stuck in a traffic jam."),
      L("A", "serious", "talk", "The big trucks are stuck? Then it is up to us, the little truck."),
      L("C", "scared", "panic", "A real fire? Chief, I do not think I can. My knees are shaking like jelly."),
      L("A", "warm", "talk", "Ted, you do not have to be unafraid. You just have to be brave anyway."),
      L("C", "determined", "talk", "Okay. Brave anyway. I will try. Let us go, Chief."),
      L("B", "excited", "drive", "All aboard the little truck! Next stop, a big, scary fire! Hold on tight!"),
      L("N", "excited", "drive", "The little truck raced down the street, weaving through traffic, its siren going woo-woo-woo."),
    ]),
    S("city", "dusk", "fire", "At the warehouse, the team goes to work.", [
      L("N", "serious", "look", "At the old warehouse, orange flames licked the windows, and thick smoke rose into the sky."),
      L("A", "serious", "talk", "Pump, run the hose to the main door. Ted, you hold the ladder. I will check for anyone inside."),
      L("B", "determined", "work", "Hose is ready, Chief! Water pressure, set to splash!"),
      L("N", "excited", "work", "A powerful stream of water shot from the hose, soaking the flames, hiss, sizzle, whoosh."),
      L("C", "determined", "climb", "I am holding the ladder, Chief! Steady, steady, nice and steady!"),
      L("N", "serious", "sneak", "Chief Daisy climbed up the ladder, and looked through a high window into the warehouse."),
      L("A", "worried", "look", "Wait. I hear a tiny meow. There is a kitten stuck in a box on the second floor!"),
      L("C", "shocked", "look", "A kitten? Oh no, we must rescue it, quickly!"),
    ]),
    S("city", "dusk", "fire", "Ted becomes the hero in a brave moment.", [
      L("A", "worried", "talk", "The window is too small for me to climb through. But Ted, you are small enough to fit!"),
      L("C", "scared", "talk", "Me? Inside the warehouse? Alone? I do not know if I can."),
      L("A", "warm", "talk", "I believe in you, Ted. I will hold the ladder, and Pump will keep the water flowing."),
      L("B", "warm", "talk", "You can do it, Tiny Ted! You are the bravest little firefighter in Explox!"),
      L("C", "determined", "talk", "Okay. Brave anyway. Here I go. One, two, three."),
      L("N", "excited", "climb", "Ted took a deep breath, climbed through the small window, and crept into the smoky warehouse."),
      L("N", "serious", "sneak", "He found the little cardboard box, and inside, a tiny, trembling kitten with big green eyes."),
      L("C", "warm", "talk", "Do not worry, little kitty. I have got you. Let us go home."),
    ]),
    S("city", "dusk", "fire", "Ted carries the kitten out, and a funny moment follows.", [
      L("N", "excited", "climb", "Ted held the kitten tightly against his jacket, and climbed back out through the window, and down the ladder."),
      L("A", "joy", "highfive", "Ted! You did it! You saved the kitten!"),
      L("B", "joy", "dance", "Hooray! The little firefighter did it! Tiny Ted, Mighty Ted!"),
      L("N", "joy", "party", "The crowd of neighbors cheered, and clapped, and waved their hats."),
      L("N", "surprised", "look", "But then, Pump got so excited that he accidentally pointed the hose the wrong way."),
      L("B", "shocked", "panic", "Oops! Wrong direction! Wait, no, do not duck, it is just water!"),
      L("N", "joy", "bubbles", "A big spray of water soaked everyone, and made a beautiful rainbow in the evening light."),
      L("A", "joy", "talk", "Pump! That was a surprise shower! But it did put out the very last flame."),
    ]),
    S("city", "night", "star", "The big trucks finally arrive, and the little truck gets a thank you.", [
      L("N", "warm", "walk", "A few minutes later, the big city fire trucks finally arrived, with their sirens and bright lights."),
      L("N", "surprised", "talk", "The Big Chief climbed out of the first truck, and looked at the wet, steaming, safe warehouse."),
      L("N", "surprised", "talk", "Who put out this fire? I thought it would take all of us hours."),
      L("A", "happy", "talk", "The little truck, Sir. Our team did it, with a big heart, a splashy hose and a very brave helper."),
      L("N", "joy", "photo", "The Big Chief shook hands with Ted, Pump and Daisy, and pinned a golden badge on each of them."),
      L("C", "joy", "dance", "A real badge! I am a real firefighter! And I was scared, but I did it anyway!"),
      L("B", "joy", "dance", "A badge for me, too! I will wear it on my head! Look, it is a crown!"),
      L("N", "warm", "talk", "And the little kitten, safe and warm, snuggled in Ted's arms, and purred a happy, tiny purr."),
    ]),
    S("city", "night", "heart", "Back at the station, the team celebrates with a new family member.", [
      L("N", "warm", "walk", "Back at the little fire station, a warm light glowed in the windows."),
      L("A", "warm", "talk", "Ted, I think the kitten needs a name. And a home. And maybe a very small fire helmet."),
      L("C", "joy", "talk", "Can we keep her, Chief? I will take care of her, I promise."),
      L("A", "joy", "talk", "Of course! Welcome to the team, Sparky the Station Cat!"),
      L("B", "joy", "cook", "And I will make a celebration dinner! Pancakes! Lots and lots of pancakes!"),
      L("N", "joy", "eat", "The three friends sat around the table, eating pancakes, while Sparky curled up on a cushion, purring."),
      L("A", "warm", "talk", "Brave hearts, steady hands, and a little truck that never quits. That is who we are."),
      L("N", "warm", "talk", "And that is the story of the little fire truck that could, and the tiny helper who was brave anyway. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
