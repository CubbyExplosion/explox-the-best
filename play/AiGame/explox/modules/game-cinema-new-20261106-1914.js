// ─── NEW MOVIE (made automatically): The Great Pizza Delivery Dash — a city action comedy with a speedy driver, a goofy robot and a wise grandma.
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
  title: "The Great Pizza Delivery Dash", genre: "🍕 Action Comedy", price: 30, bg: "#3a1f10", icons: "🍕🏎️⏱️", comedy: true,
  cast: { A: { role: "Speedy Sal", kind: "racer", pers: "hero", move: "TURBO DRIFT KICK", mtype: "kick", fav: "Wheels up, pizza down!", say: "I know, I should slow down. I just cannot help it." }, B: { role: "Rusty the Robot", kind: "robot", pers: "goof", move: "LASER PUNCH", mtype: "punch", fav: "Is there a snack involved?", say: "Sorry, I leaned on the horn again." }, C: { role: "Mama Mia", kind: "grandma", pers: "wise", move: "ROLLING PIN SMASH", mtype: "punch", fav: "Think first, deliver later.", say: "Sorry. I am talking too much again." } },
  trailer: [{ text: "🍕 One giant pizza...", dur: 2200 }, { text: "⏱️ Thirty minutes to deliver it...", dur: 2200 }, { text: "🏎️ And one wild ride across the city!", dur: 2400 }, { text: "THE GREAT PIZZA DELIVERY DASH", dur: 3000 }],
  scenes: [
    S("market", "day", "pizza", "At Mama Mia's pizza shop, a very big order arrives, and the clock starts ticking.", [
      L("N", "excited", "cook", "It was lunchtime at Mama Mia's Pizza Shop, and the oven was hotter than a summer sidewalk."),
      L("C", "happy", "cook", "One giant pizza with pepperoni, cheese, olives and just a pinch of love. Ready, Sal."),
      L("A", "surprised", "look", "Wow, Mama Mia. That pizza is as big as a car tire. Who ordered it?"),
      L("C", "serious", "write", "Mister Tower at the top of Explox Tower. He wants it in thirty minutes, hot and cheesy."),
      L("B", "worried", "talk", "Thirty minutes? The Tower is on the other side of the city! There is a lot of traffic!"),
      L("A", "determined", "talk", "Do not worry, Rusty. I am the fastest driver in Explox. Hop in, and buckle up."),
      L("C", "warm", "talk", "Think first, deliver later. Take the shortcut by the river, and do not drop the pizza."),
      L("A", "excited", "drive", "Wheels up, pizza down! Here we go!"),
    ]),
    S("city", "day", "car", "The delivery car zooms through the busy streets, but a big traffic jam blocks the way.", [
      L("N", "excited", "drive", "The little delivery car zipped through the streets with a giant pizza box strapped to the roof."),
      L("B", "joy", "drive", "Beep beep! Look at us go! We are passing everybody!"),
      L("A", "serious", "look", "Rusty, check the clock. How many minutes do we have left?"),
      L("B", "worried", "look", "Twenty-four minutes and thirty seconds. And, oh no, look ahead."),
      L("N", "shocked", "panic", "Around the corner, hundreds of cars were stuck in a giant, honking traffic jam."),
      L("A", "worried", "panic", "A traffic jam! We will never get through! Is there another way?"),
      L("B", "excited", "look", "Oh look! There is a skate ramp on the left, and a narrow alley behind it!"),
      L("A", "determined", "jump", "Hold on to the pizza, Rusty! We are going over the ramp!"),
    ]),
    S("city", "day", "car", "The car flies over the traffic jam, and lands in the middle of a funny problem.", [
      L("N", "excited", "jump", "Up the ramp the little car went, high over the honking cars and into the sky."),
      L("B", "shocked", "fly", "We are flying! We are flying! I do not have wings! Is the car supposed to do this?"),
      L("A", "joy", "fly", "Ha ha! Look at the people waving! Hello, Explox!"),
      L("N", "surprised", "drive", "The car landed on the other side with a big bounce, and a puff of smoke from the tires."),
      L("B", "relieved", "talk", "We are okay! And the pizza is okay! It even stayed warm."),
      L("N", "worried", "panic", "But right in front of them, a big herd of ducks was waddling across the street, very slowly."),
      L("A", "worried", "panic", "Ducks! Hundreds of ducks! I cannot drive through them!"),
      L("B", "curious", "look", "They are crossing to the pond. Maybe we can wait. Or maybe they like pizza."),
    ]),
    S("park", "day", "tree", "The friends find a clever way to get past the ducks, and a rival appears.", [
      L("A", "curious", "talk", "Rusty, do you have any crackers in your compartment? Ducks love crackers."),
      L("B", "joy", "eat", "I have a whole box of crackers! Here, little ducks! Follow me, little ducks!"),
      L("N", "joy", "walk", "Rusty scattered crackers on the grass, and the whole line of ducks waddled away from the road."),
      L("A", "relieved", "highfive", "Brilliant, Rusty! You cleared the way. Eighteen minutes left."),
      L("N", "worried", "run", "But just then, a bright red sports car roared up beside them, with a very familiar driver."),
      L("N", "angry", "talk", "Well, well, Speedy Sal. Carrying a pizza? Mister Tower always orders from my shop, Baron Crust Pizza."),
      L("A", "angry", "talk", "Not today, Baron! This delivery is for Mama Mia, and we will get there first!"),
      L("B", "excited", "drive", "Race you to the river! Beep beep!"),
    ]),
    S("beach", "day", "car", "At the river, the bridge is going up, and the team has to think fast.", [
      L("N", "excited", "drive", "The two cars raced side by side along the river, honking and flashing their lights."),
      L("A", "serious", "drive", "Rusty, how far is the bridge?"),
      L("B", "shocked", "look", "It is just ahead! But, oh no, the bridge is going up for a big boat!"),
      L("N", "shocked", "panic", "The two halves of the bridge slowly rose into the sky, and a giant boat began to float underneath."),
      L("A", "worried", "panic", "We cannot stop, or we will lose time! Rusty, is there another way?"),
      L("B", "curious", "look", "Look at the boat! It has a long flat deck, like a runway!"),
      L("A", "determined", "jump", "We can drive over the boat! Hold tight, Rusty!"),
      L("N", "excited", "jump", "The little car jumped onto the boat, raced along the deck and leaped off the other side."),
    ]),
    S("city", "day", "car", "The team reaches the Tower, but there is one last obstacle.", [
      L("N", "excited", "drive", "On the other side of the river, the big Explox Tower came into view, shining in the sun."),
      L("B", "joy", "look", "We are almost there! Only four minutes left!"),
      L("N", "surprised", "look", "But a big security gate blocked the entrance, and a sign said: Deliveries by foot only."),
      L("A", "serious", "talk", "By foot? The pizza is huge. We cannot carry it up thirty floors."),
      L("B", "excited", "skate", "I have an idea! My wheels can roll, and my arms can lift. Let me carry the pizza on my head."),
      L("A", "warm", "talk", "Rusty, are you sure? It is heavy and very, very cheesy."),
      L("B", "determined", "exercise", "Sal, I am a robot. I do exercises every morning. Lift!"),
      L("N", "joy", "juggle", "Rusty lifted the giant pizza over his head, and the two friends hurried toward the elevator."),
    ]),
    S("cityhall", "day", "trophy", "At the top of the tower, the surprise is finally revealed.", [
      L("N", "excited", "run", "The elevator zoomed up, and up, and up, and the doors opened at the top floor with a ding."),
      L("A", "relieved", "look", "Delivery for Mister Tower! One giant, hot pizza! Delivered with ten seconds to spare!"),
      L("N", "surprised", "look", "The door opened, and Mister Tower stood there with a big smile, and a crowd of hungry guests behind him."),
      L("N", "joy", "party", "Welcome! It is my birthday! I ordered this pizza for my party, and you are my guests of honor!"),
      L("B", "shocked", "look", "A birthday party? And we almost missed it? Beep. That would have been a disaster!"),
      L("A", "joy", "dance", "Happy birthday, Mister Tower! And thank you for the very exciting delivery!"),
      L("N", "joy", "party", "The red sports car arrived a minute later, and Baron Crust looked very surprised to find a party."),
      L("N", "warm", "talk", "Come in, Baron! There is plenty of pizza for everybody, even for a rival."),
    ]),
    S("cityhall", "dusk", "trophy", "At sunset, everyone shares the giant pizza, and the old rivals become friends.", [
      L("N", "joy", "eat", "Everybody gathered around the giant pizza, and the whole top floor smelled like warm cheese and tomatoes."),
      L("B", "joy", "eat", "Best pizza I have ever carried. Also the only one I have ever carried."),
      L("A", "warm", "talk", "Baron, I am sorry I shouted at you. You are a great driver."),
      L("N", "warm", "talk", "And you are a great pizza delivery person, Sal. Maybe we can race for fun, next time."),
      L("A", "joy", "highfive", "It is a deal. Loser buys the pizza!"),
      L("N", "joy", "photo", "Mister Tower snapped a group photo of the whole party, with the giant pizza in the middle."),
      L("N", "warm", "talk", "And that was the great pizza delivery dash. The end."),
    ]),
  ],
});

  M.forEach(m => CINEMA_MOVIES.push(m));
})();
