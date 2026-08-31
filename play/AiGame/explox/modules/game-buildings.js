// ─── CITY ────────────────────────────────────────────────────────────────────
function buildCity() {
  // Ground — widened from 5000x5000 to comfortably exceed WORLD_BOUND (±11000) for the 20x-bigger
  // War Territory countries (item ~234) — otherwise a player standing in a new country would see
  // straight through the world past the old ground edge.
  const g=new THREE.Mesh(new THREE.PlaneGeometry(24000,24000),mat(0x5a9e3c));
  g.rotation.x=-Math.PI/2; g.receiveShadow=true; scene.add(g); groundMesh = g;

  // Roads
  // Real bug fix: both road strips used to be one unbroken 300-unit box each, running straight
  // through several existing buildings (confirmed via a live bounding-box check against their own
  // real collision footprints: Police Station, City Hall, Restaurant Row, Transit Hub, City Mall's
  // side wings, City Hotel). Segmented into pieces that stop short of each one instead of moving 6
  // different long-established buildings — each has its own hardcoded walls/signs/doors/NPC
  // workplace/SAI+LOC_ZONES entries, and safely relocating all of that without misaligning
  // something was a much bigger, riskier job than routing the road around them. City Hotel sits
  // close enough to the real downtown crossroads that a couple of units of overlap remain on both
  // roads rather than cutting into the actual intersection.
  function roadSegments(axis, ranges) {
    let cursor = -150;
    ranges.concat([[150,150]]).forEach(([exStart,exEnd]) => {
      if (exStart > cursor) {
        const len = exStart-cursor, mid = (cursor+exStart)/2;
        if (axis==='x') box(len,0.05,16, 0x555566, mid,0.01,0);
        else box(16,0.05,len, 0x555566, 0,0.01,mid);
      }
      cursor = Math.max(cursor, exEnd);
    });
  }
  roadSegments('x', [[-87,-53],[-26,-8],[28,40],[51,109]]);
  roadSegments('z', [[-50,-20],[-12,-8],[38,62],[67,93]]);
  for(let i=-7;i<=7;i++) { box(8,0.06,0.3, 0xFFDD00, i*20,0.02,0); box(0.3,0.06,8, 0xFFDD00, 0,0.02,i*20); }
  box(300,0.1,3, 0x999988, 0,0.05,9.5); box(300,0.1,3, 0x999988, 0,0.05,-9.5);
  box(3,0.1,300, 0x999988, 9.5,0.05,0); box(3,0.1,300, 0x999988,-9.5,0.05,0);

  // MALL — renovated exterior: two-tone podium/curtain-wall facade, a glass atrium tower rising
  // above the roofline, corner accent pylons, a bigger marquee entrance, and a west-side parking
  // plaza with decorative cars. Collision footprint (left/right wall, door gap at x=73-87, back
  // wall) is UNCHANGED from before — every addition here is purely visual, matching item 109's
  // interior expansion which also never touched this door trigger.
  box(50,14,35, 0xd9c9a8, 80,7,-20);      // stone podium (ground + 2nd floor)
  box(50,8,35,  0x9fc9e0, 80,18,-20);     // glass curtain wall (upper floor)
  box(50,1,35,  0x445566, 80,22.5,-20);   // dark roof cap
  // Glass atrium tower over the entrance — tall enough to see from across downtown
  box(15,9,15, 0xbfe6ff, 80,27.5,-10);
  box(15,0.4,15, 0x445566, 80,32.2,-10);
  box(1.6,3,1.6, 0xFFD700, 80,33.7,-10);  // gold spire cap
  // Corner accent pylons
  [[59,-5],[101,-5],[59,-35],[101,-35]].forEach(([px,pz])=>{
    box(2,7,2, 0x445566, px,26.5,pz); box(2.4,0.3,2.4, 0xFFD700, px,30.2,pz);
  });
  // Grand entrance — 2-story glass curtain + projecting marquee canopy + bigger signage
  box(20,19,4, 0x88bbdd, 80,9.5,-2.5);
  box(26,1.2,9, 0x445566, 80,19.5,-4);
  buildSign('🏬 CITY MALL',80,21.3,-1.6);
  buildSign('🛍️ 300+ SHOPS INSIDE!',80,19.9,-1.4);
  for(let r=0;r<3;r++) for(let c=0;c<5;c++) { box(4,4,0.2, 0x88ccff, 58+c*8,6+r*6,-2.3); box(4,4,0.2, 0x88ccff, 58+c*8,6+r*6,-37.7); }
  box(2,20,2, 0xddd0bb, 56,10,-3); box(2,20,2, 0xddd0bb, 104,10,-3);
  // Mall collision: left wall + right wall, gap at x=73–87 for the door
  addCol(CITY_COLS, 63.5,-20, 9.5,18.5); // left section
  addCol(CITY_COLS, 96.5,-20, 9.5,18.5); // right section
  addCol(CITY_COLS, 80,-37.5, 26,1);     // back wall

  // Mall parking plaza — open ground west of the building (clear of City Hall at x -16..16,
  // the Gas Station at x 49-71/z -59..-41, and the mall's own west wall at x=55)
  box(34,0.08,26, 0x3a3a3a, 35,0.04,-15);
  for(let i=0;i<5;i++) { box(3.5,0.06,0.3, 0xffffff, 21+i*5.6,0.08,-4); box(3.5,0.06,0.3, 0xffffff, 21+i*5.6,0.08,-26); }
  const lotColors=[0xdd3333,0x3366cc,0xeecc33,0x33aa55,0x888888];
  for(let i=0;i<5;i++){
    buildParkedDecorCar(23+i*5.6, -8,  lotColors[i%lotColors.length], 0);
    buildParkedDecorCar(23+i*5.6, -22, lotColors[(i+2)%lotColors.length], Math.PI);
  }
  [[20,-15],[50,-15]].forEach(([lx,lz])=>{
    box(0.25,6,0.25, 0x444444, lx,3,lz);
    const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.35,8,8), new THREE.MeshBasicMaterial({color:0xfff3cc}));
    bulb.position.set(lx,6,lz); scene.add(bulb);
    const pl=new THREE.PointLight(0xfff3cc,0.7,20); pl.position.set(lx,5.8,lz); scene.add(pl);
  });
  buildSign('🅿️ MALL PARKING', 35,7,-15);

  // ARCADE — Pixel Palace: two real playable original games inside, not just a decoration
  box(28,14,26, 0x2a1a4a,40,7,110); box(28,1,26, 0x1a0f33,40,14.5,110);
  box(28,2,0.3, 0xff2e9c,40,10,97);
  box(8,10,4, 0x120a24,40,5,98.5);
  buildLogoSign('PIXEL PALACE ARCADE','🕹️',0x8a2be2,0x00e5ff,40,17,95.5);
  for(let i=0;i<3;i++){
    box(3,3,0.2, 0x00e5ff,29+i*7.5,10,96.9);
    box(3,3,0.2, 0xff2e9c,29+i*7.5,10,123.1);
  }
  box(0.3,16,0.3, 0x555,26.5,8,95.5); box(0.3,16,0.3, 0x555,53.5,8,95.5);
  addCol(CITY_COLS,40,110, 14,13);

  // POLICE STATION
  box(28,16,22, 0x7a8fa0,-70,8,10); box(28,1,22, 0x5a6f80,-70,16.5,10);
  box(8,14,4, 0x5577aa,-70,7,21.5); box(30,3,24, 0x6a8090,-70,1.5,10);
  buildSign('🚔 POLICE',-70,18,21);
  for(let i=0;i<3;i++){box(4,5,0.2, 0xaaccdd,-80+i*6,10,22);box(4,5,0.2, 0xaaccdd,-80+i*6,10,-1.4);}
  box(0.3,18,0.3, 0x888,-58,9,21); box(5,0.2,0.1, 0x3355aa,-55.5,17.5,21);
  box(6,2,3, 0x3355aa,-80,1,16); box(6,1,3, 0x1a2a55,-80,2.5,16);
  addCol(CITY_COLS,-70,10, 15,12);

  // RESTAURANT
  box(26,12,20, 0xd4724a,20,6,80); box(26,1,20, 0xb85a35,20,12.5,80);
  box(8,10,0.3, 0x88ccff,20,5,90); buildSign('🍕 PIZZA PLACE',20,14,90);
  for(let i=-1;i<=1;i++){box(3,0.1,3, 0xcc3333,20+i*8,0.5,94);box(0.2,3,0.2, 0x888,20+i*8,0.5,94);box(2,0.5,2, 0xeeddcc,20+i*8,0.5,96);}
  addCol(CITY_COLS,20,80, 14,11);
  // Stove / service counter
  box(4,1.2,1.5, 0x444455, 20,0.6,92);
  box(3.4,0.1,1.1, 0x888899, 20,1.25,92);
  const flame=new THREE.Mesh(new THREE.SphereGeometry(0.3,8,8),new THREE.MeshBasicMaterial({color:0xff5500}));
  flame.position.set(20,1.55,92); scene.add(flame);
  buildSign('👨‍🍳 STOVE', 20,2.6,91.5);
  // Fridge (ingredient station) — left of stove
  box(2.4,2.8,1.4, 0x336699, 12,1.4,92);
  box(2.2,0.05,1.0, 0x4488bb, 12,2.83,92);
  box(0.05,2.4,1.0, 0x55aadd, 13.1,1.4,92);
  buildSign('🧊 FRIDGE', 12,3.6,91.3);
  // Prep counter — right of stove
  box(3,1.1,1.5, 0x776644, 28,0.55,92);
  box(2.8,0.08,1.2, 0xbbaa99, 28,1.14,92);
  box(0.3,0.3,0.3, 0xff6633, 28,1.35,92); // chopped veggie
  buildSign('🔪 PREP', 28,2.4,91.3);
  // Customer placeholders at tables
  [[12,96],[20,96],[28,96]].forEach(([cx,cz])=>{
    box(0.7,1.2,0.7, 0xf5c89a, cx,1.6,cz-1);
    box(0.9,0.1,0.7, 0x996633, cx,0.8,cz-1.2);
  });
  // Order bubbles above each customer table
  [12,20,28].forEach((tx,i)=>{
    orderBubbles[i] = makeOrderBubble(tableOrders[i], tx, 3.4, 96);
  });

  // SHOPS
  const shopC=[0xe8d5b0,0xd0e8c0,0xe0c8e0,0xc8d8e8,0xf0d8c0];
  const shopN=['Toy Store','Bakery','Clothes','Tech Shop','Pet Store'];
  for(let i=0;i<5;i++){
    const sx=42+i*14;
    box(12,10,12, shopC[i],sx,5,48); box(12,0.5,12, 0xaaaaaa,sx,10.3,48);
    box(4,8,0.3, 0x88ccff,sx,4,54.2); box(3,3,0.2, 0xaaddff,sx-3,7,54.2); box(3,3,0.2, 0xaaddff,sx+3,7,54.2);
    buildSign(shopN[i],sx,11.5,54); box(14,0.4,3, shopC[i],sx,9.8,55.5);
    addCol(CITY_COLS,sx,48, 7,7);
  }

  // PARK
  box(54,0.2,54, 0x4a9e2a,-10,0.1,-60); box(14,0.15,10, 0x1177cc,-10,0.12,-58);
  [[-22,-72],[0,-72],[8,-50],[-28,-50],[-18,-60],[6,-65],[-5,-45],[-30,-70]].forEach(([tx,tz])=>{
    box(1.2,8,1.2, 0x5c3a1e,tx,4,tz); treeMeshes.push(box(7,7,7, 0x2d7a2d,tx,11,tz));
  });
  box(5,0.4,1, 0xaa7755,-18,0.7,-68); box(5,1.5,0.3, 0xaa7755,-18,1,-68.6);
  box(5,0.4,1, 0xaa7755,4,0.7,-52);   box(5,1.5,0.3, 0xaa7755,4,1,-52.6);
  box(6,0.5,6, 0x88aacc,-4,0.3,-60); box(0.5,3,0.5, 0xaaa,-4,1.5,-60); box(2,0.3,2, 0x88aacc,-4,3.2,-60);

  // SPORTS PARK ENTRANCE — real gate just south of the park proper, teleports into its own
  // pocket space (same trick as House/Prison/Arcade) since the park itself has no free room left.
  box(0.5,4,0.5, 0x555555,-16,2,-95); box(0.5,4,0.5, 0x555555,-4,2,-95);
  box(12,0.6,0.5, 0xdd6622,-10,4.2,-95);
  buildSign('🏟️ SPORTS PARK',-10,5.3,-95);

  // CITY HALL
  box(30,22,24, 0xe8dcc8,0,11,-35); box(30,1,24, 0xd4c8b0,0,22.5,-35);
  box(6,10,6, 0xd4c8b0,0,16,-24); box(5,5,5, 0xc0b49a,0,23,-24);
  buildSign('🏛 CITY HALL',0,24,-23);
  for(let i=-2;i<=2;i++) box(1.5,18,1.5, 0xf5efe0,i*5,9,-23);
  for(let s=0;s<3;s++) box(34-s*2,0.5,2, 0xddd0bb,0,0.5+s*0.5,-22.5+s);
  addCol(CITY_COLS,0,-35, 16,13);

  // APARTMENTS
  [[-40,-40],[-60,-40],[-40,-60],[-60,-60]].forEach(([ax,az])=>{
    box(18,28,18, 0xc8b8a0,ax,14,az);
    for(let fy=0;fy<4;fy++) for(let fx=0;fx<2;fx++) box(3,3,0.2, 0xaaddff,ax-3+fx*7,5+fy*7,az+9.1);
    for(let fy=1;fy<4;fy++) box(6,0.3,2, 0xaaa,ax-3,3+fy*7,az+10);
    buildSign('Apt',ax,29,az+9);
    addCol(CITY_COLS,ax,az, 10,10);
  });

  // GAS STATION
  box(20,8,16, 0xeeeedd,60,4,-50); box(26,0.3,20, 0xcccccc,60,8,-50);
  box(0.3,8,0.3, 0x888,52,4,-44); box(0.3,8,0.3, 0x888,68,4,-44);
  box(2,4,1, 0xdd3333,56,2,-46); box(2,4,1, 0xdd3333,64,2,-46);
  buildSign('⛽ GAS STATION',60,9,-42);
  addCol(CITY_COLS,60,-50, 11,9);

  // HOSPITAL — had real exterior geometry and a real collision box for a long time, but nothing
  // behind it: no door gap (the old single addCol sealed the whole footprint), no interior, no
  // actual doctor. Real door gap added below (matches the entrance canopy already sitting at
  // z=72.2) so it's finally walkable in — see enterHospital()/HOSPITAL_ZONES further down.
  box(32,20,24, 0xeeeeff,-40,10,60); box(32,1,24, 0xccccdd,-40,20.5,60);
  box(10,16,4, 0x88aaff,-40,8,72.2); buildSign('🏥 HOSPITAL',-40,22,72);
  box(6,1.5,0.3, 0xdd0000,-40,14,72.3); box(1.5,6,0.3, 0xdd0000,-40,14,72.3);
  box(7,3,3, 0xffffff,-55,1.5,68); box(7,1.5,3, 0xddddff,-55,3.75,68);
  addCol(CITY_COLS, -40, 47.3, 17, 0.4);   // back wall (north)
  addCol(CITY_COLS, -57.3, 60, 0.4, 13);   // west wall
  addCol(CITY_COLS, -22.7, 60, 0.4, 13);   // east wall
  addCol(CITY_COLS, -50, 72.7, 7, 0.4);    // front wall, left of the door gap
  addCol(CITY_COLS, -30, 72.7, 7, 0.4);    // front wall, right of the door gap

  // SCHOOL
  box(36,14,22, 0xf5d080,70,7,60); box(36,1,22, 0xe8c050,70,14.5,60);
  box(10,12,4, 0x88aadd,70,6,71.2); buildSign('🏫 SCHOOL',70,16,71);
  box(16,0.2,10, 0xaa7744,82,0.1,66);
  box(0.3,4,0.3, 0x666,80,2,62); box(0.3,4,0.3, 0x666,84,2,62); box(5,0.3,0.3, 0x666,82,4,62);
  box(0.3,10,0.3, 0x666,58,5,50); box(4,0.2,0.1, 0x4488dd,60,9.5,50);
  addCol(CITY_COLS,70,60, 19,12);

  // STREET LIGHTS
  [[12,12],[12,-12],[-12,12],[-12,-12],[30,12],[30,-12],[-30,12],[-30,-12],[50,12],[50,-12],[-50,12],[-50,-12]].forEach(([lx,lz])=>{
    box(0.3,7,0.3, 0x444,lx,3.5,lz); box(2,0.3,0.3, 0x444,lx+0.8,7,lz);
    const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,8),new THREE.MeshBasicMaterial({color:0xffffcc}));
    bulb.position.set(lx+1.6,6.8,lz); scene.add(bulb);
    const pl=new THREE.PointLight(0xffffcc,0.5,18); pl.position.set(lx+1.6,6.5,lz); scene.add(pl);
  });

  // ROAD-SIDE TREES
  for(let i=-5;i<=5;i++){if(!i)continue;
    box(0.8,5,0.8, 0x5c3a1e,13,2.5,i*22); treeMeshes.push(box(4,4,4, 0x2d7a2d,13,7,i*22));
    box(0.8,5,0.8, 0x5c3a1e,-13,2.5,i*22); treeMeshes.push(box(4,4,4, 0x2d7a2d,-13,7,i*22));
  }

  // CRIMINAL ALLEY — a shady spot between buildings at x=34, z=3
  box(5,6,5, 0x1a1a22, 34,3,4);
  box(1.5,6,3, 0x111118, 37.5,3,5);
  box(0.2,6,6, 0x0d0d14, 31.4,3,4);
  box(5,0.15,5, 0x222233, 34,6.1,4);
  const dealerLight = new THREE.PointLight(0x330066, 1.2, 10);
  dealerLight.position.set(34,4,4); scene.add(dealerLight);
  buildSign('🕴️ ?', 34,7.2,6.6);
  // Dealer NPC figure (static)
  box(0.6,1.1,0.4, 0x1a1a1a, 34,1.6,5);
  box(0.55,0.55,0.4, 0x222211, 34,2.55,5);
  addCol(CITY_COLS, 34,4, 3.5,3.5);

  // CITY BANK — user's own ask: "move the bank to a more open area" (the old spot at x:-30,z:30
  // had its Guard/Printer job zones actually overlapping the Hospital's real collision box next
  // door — a genuine physical conflict, not just visually tight). Relocated to a real 120x160
  // clear block northeast of downtown (x:100-220, z:130-290 — between Uptown Plaza and the
  // Suburbs, north of the School/Arcade block, south of the Shopping District), translated by a
  // flat +190x/+180z from every original coordinate so the whole complex (building, entrance,
  // BANK_ATTACK_POS, all 6 job zones below) moved together as one unit.
  box(24,18,18, 0xf0ece0, 160,9,210);                 // marble main building
  box(24,1.2,18, 0xFFD700, 160,18.6,210);             // gold roof band
  box(10,14,2, 0xc8e0ff, 160,7,219.1);                // glass front
  for(let i=-2;i<=2;i++) box(1.4,16,1.4, 0xf8f4ec, i*5+160,8,218.5); // marble columns
  for(let s=0;s<3;s++) box(28-s*2,0.5,2, 0xe0d8cc, 160,0.5+s*0.5,220.5+s); // front steps
  box(3,9,1.4, 0x886600, 160,4.5,219.2);              // gold door frame
  box(2.4,7,0.2, 0xaaddff, 160,4.5,219.3);            // door glass
  buildSign('🏦 CITY BANK', 160,21,219);
  const bankLight = new THREE.PointLight(0xffeeaa, 1.0, 24);
  bankLight.position.set(160,8,218); scene.add(bankLight);
  addCol(CITY_COLS, 160,210, 13,10);
  // Bank Wall — Guard-duty vantage point (see climbBankWall/shootFromWall). A real staircase
  // hugging the building's east side, climbing from BANK_WALL_STAIR_BASE up to a crenellated
  // parapet along the front roof edge, right above BANK_ATTACK_POS below.
  for(let i=0;i<10;i++){ const t=i/9; box(1.6,0.35,2, 0xcfc6b0, 180-t*8, 0.3+t*18.3, 210); } // staircase, ground to roof
  box(10,1.4,0.4, 0xe8dcc0, 160,19.3,216.5);          // front parapet — the wall itself
  for(let i=-2;i<=2;i++) box(1,0.6,0.4, 0xe8dcc0, 160+i*2,20.3,216.5); // crenellations

  // MOVIE THEATER — x=50, z=-85
  box(28,14,20, 0x8B1A1A, 50,7,-85);           // main building (dark red)
  box(29,1,21,  0x5a0d0d, 50,14.5,-85);         // flat roof
  box(34,3,8,   0xffcc00, 50,12,-71);           // yellow marquee awning
  box(1.5,12,1.5, 0xddccaa, 36,6,-68);          // left pillar
  box(1.5,12,1.5, 0xddccaa, 64,6,-68);          // right pillar
  box(10,9,0.3, 0xaaddff, 50,4.5,-75);          // glass front doors
  box(12,0.5,0.3, 0x886600, 50,9,-75);          // door top frame
  box(20,0.4,2, 0xcc9944, 50,0.2,-72);          // step 1
  box(16,0.4,2, 0xcc9944, 50,0.4,-70);          // step 2
  box(12,0.4,2, 0xcc9944, 50,0.6,-68);          // step 3
  box(3,3,2, 0xddbb88, 60,1.5,-70);             // ticket booth
  box(3,0.3,2, 0x886600, 60,3.15,-70);          // ticket booth roof
  box(2,0.8,0.2, 0xaaddff, 60,2.1,-69.1);       // ticket window
  buildSign('🎬 MOVIE THEATER', 50,15.5,-75);
  buildSign('🍿 NOW SHOWING', 50,12.8,-67.5);
  buildSign('🎟️ TICKETS', 60,3.9,-69);
  const cinLight = new THREE.PointLight(0xff2244, 1.2, 30);
  cinLight.position.set(50,10,-74); scene.add(cinLight);
  addCol(CITY_COLS, 50,-85, 15,11);

  // S.I.T.S. TRANSIT HUB — x=0, z=50 (south side, visible from spawn)
  box(36,10,18, 0x1a2a3a, 0,5,50);             // main station building
  box(42,1.2,24, 0xffcc00, 0,10.8,50);         // wide yellow roof
  box(38,0.4,20, 0x1a1a1a, 0,11.4,50);         // roof cap
  box(12,8,0.3, 0x88ccff, 0,4.5,59.2);         // glass front wall
  box(4,0.4,0.4, 0xffcc00, -6,9,59.2);         // left sign bar
  box(4,0.4,0.4, 0xffcc00,  6,9,59.2);         // right sign bar
  box(2,7,2, 0x223344, -16,3.5,50);            // left pillar
  box(2,7,2, 0x223344,  16,3.5,50);            // right pillar
  box(36,0.4,18, 0x334455, 0,0.2,50);          // platform floor
  box(8,4,10, 0x0f1e2e, -22,2,50);             // bay left
  box(8,4,10, 0x0f1e2e,  22,2,50);             // bay right
  box(8,0.3,10, 0xffcc00, -22,4.2,50);         // bay roof left
  box(8,0.3,10, 0xffcc00,  22,4.2,50);         // bay roof right
  box(6,3,9, 0xff6600, -22,1.7,50);            // orange bus left
  box(1.5,1.5,9, 0x88ccff, -18.5,2.8,50);     // bus windows left
  box(6,3,9, 0x2255cc, 22,1.7,50);             // blue bus right
  box(1.5,1.5,9, 0x88ccff, 25.5,2.8,50);      // bus windows right
  [0xff4444, 0x4488ff, 0x44cc44, 0xffcc00, 0xcc44ff].forEach((col,i) => {
    box(0.3,4,0.3, col, -8+i*4, 2, 58.5);
  });
  buildSign('🚇 S.I.T.S.', 0, 12, 59);
  buildSign('TRANSIT HUB', 0, 10.2, 59.2);
  const sitsLight1 = new THREE.PointLight(0xffcc00, 1.2, 30);
  sitsLight1.position.set(0, 10, 58); scene.add(sitsLight1);
  const sitsLight2 = new THREE.PointLight(0x4488ff, 0.6, 20);
  sitsLight2.position.set(0, 4, 50); scene.add(sitsLight2);
  addCol(CITY_COLS, 0, 50, 20, 10);

  // CITY HOTEL — x=-15, z=-5 (visible from spawn, west of center)
  box(18,36,12, 0xEDE0C4, -15,18,-5);              // main tower (cream/beige)
  box(20,4,14,  0xD4C090, -15,2,-5);               // wider lobby base
  box(16,3.5,0.3, 0x88ccff, -15,2,2);             // glass lobby front
  box(16,0.4,0.3, 0xD4A010, -15,4,2);             // gold trim above glass
  // Windows (5 floors × 5 across)
  for(let fy=1;fy<=5;fy++) for(let fx=-2;fx<=2;fx++){
    box(2.4,2.4,0.15, 0x88ccff, -15+fx*3, 4+fy*6, -5+6);  // south windows
    box(2.4,2.4,0.15, 0x88ccff, -15+fx*3, 4+fy*6, -5-6);  // north windows
  }
  for(let fy=1;fy<=5;fy++) for(let fz=-1;fz<=1;fz++){
    box(0.15,2.4,2.4, 0x88ccff, -15+9, 4+fy*6, -5+fz*3);  // east windows
    box(0.15,2.4,2.4, 0x88ccff, -15-9, 4+fy*6, -5+fz*3);  // west windows
  }
  // Entrance details
  box(1,2,1, 0x3a6b3a, -19,1,2.5);  box(1,2,1, 0x3a6b3a, -11,1,2.5); // entrance plants
  box(1.5,0.2,1.5, 0x666, -19,2,2.5); box(1.5,0.2,1.5, 0x666, -11,2,2.5); // pots
  box(3,0.3,2, 0xddcc88, -15,0.3,4.5); // welcome mat
  buildSign('🏨 CITY HOTEL', -15,38,-5);
  buildSign('★★★ CHECK IN ★★★', -15,3.9,2.2);
  const hotelLight1 = new THREE.PointLight(0xffd700, 1.0, 25);
  hotelLight1.position.set(-15,5,3); scene.add(hotelLight1);
  const hotelLight2 = new THREE.PointLight(0xffeebb, 0.6, 40);
  hotelLight2.position.set(-15,20,-5); scene.add(hotelLight2);
  addCol(CITY_COLS, -15,-5, 10,7);

  // BLACK MARKET WAREHOUSE — hidden at x=-80, z=-78
  box(20,10,14, 0x1a1208, -80,5,-78);
  box(20,0.4,14, 0x2a1f0a, -80,10.3,-78);
  box(5,7,0.2, 0x0d0d0d, -80,3.5,-71.1);
  box(6,0.4,14, 0x11100a, -74,10.3,-78);
  for(let i=0;i<3;i++) box(0.2,4,0.2, 0x333, -76+i*3,8,-71.2);
  const bmLight1 = new THREE.PointLight(0x440000, 1.5, 20);
  bmLight1.position.set(-80,4,-72); scene.add(bmLight1);
  const bmLight2 = new THREE.PointLight(0x220011, 0.8, 18);
  bmLight2.position.set(-80,4,-84); scene.add(bmLight2);
  buildSign('⬛ ???', -80,11.5,-71);
  addCol(CITY_COLS, -80,-78, 11,8);

  // ─── COMPUTER SHOP ──────────────────────────────────────────────────────────
  box(18,10,16, 0x223355, 100,5,48);               // main building
  box(19,0.4,17, 0x112244, 100,10.2,48);           // roof
  box(18,8,0.2,  0x88aadd, 100,4,56.1);            // glass front
  box(0.3,10,16, 0x223355, 91.1,5,48);             // left wall
  box(0.3,10,16, 0x223355, 108.9,5,48);            // right wall
  box(20,0.2,0.2, 0x4466aa, 100,10,48);            // front ledge
  // Display screens inside (glowing boxes)
  box(2,1.5,0.1, 0x1133cc, 95,4,56);
  box(2,1.5,0.1, 0x1133cc, 100,4,56);
  box(2,1.5,0.1, 0x1133cc, 105,4,56);
  const compLight = new THREE.PointLight(0x4488ff,1.5,30);
  compLight.position.set(100,6,55); scene.add(compLight);
  buildSign('💻 Computer Shop', 100,11,56.2);
  addCol(CITY_COLS, 100,48, 10,9);

  // ─── CAR SHOP ───────────────────────────────────────────────────────────────
  box(30,12,22, 0xddeeff, 130,6,20);            // showroom body
  box(31,0.5,23, 0xaabbdd, 130,12.3,20);        // roof
  box(30,10,0.3, 0xbbddff, 130,5,31.2);         // glass front wall
  box(30,10,0.3, 0xddeeff, 130,5,8.8);          // back wall
  box(0.3,10,22, 0xddeeff, 115,5,20);           // left wall
  box(0.3,10,22, 0xddeeff, 145,5,20);           // right wall
  box(34,0.4,0.4, 0xffffff, 130,12.6,20);       // roof edge trim
  // Parking lot
  box(36,0.1,18, 0x555566, 130,0.06,44);        // parking lot ground
  for(let i=0;i<5;i++) box(0.2,0.1,18, 0xffffff, 117+i*7,0.07,44); // parking lane lines
  // Entrance pillars
  box(1,12,1, 0xffffff, 123,6,31.2);
  box(1,12,1, 0xffffff, 137,6,31.2);
  // Sign
  buildSign('🚗 CAR SHOP', 130,13.5,31.3);
  // Showroom light
  const carLight = new THREE.PointLight(0xffffff, 1.2, 40);
  carLight.position.set(130,10,20); scene.add(carLight);
  addCol(CITY_COLS, 130,20, 16,12);

  // ─── THE DINER — x=110, z=-25 ────────────────────────────────────────────────
  box(20,10,16, 0xB8452F, 110,5,-25);            // main building (warm brick red)
  box(21,0.5,17, 0x7a2e1f, 110,10.3,-25);        // roof
  box(18,8,0.3, 0xffddaa, 110,4,-17.1);          // warm glass front
  box(0.3,10,16, 0xB8452F, 100.1,5,-25);         // left wall
  box(0.3,10,16, 0xB8452F, 119.9,5,-25);         // right wall
  box(20,2,3, 0xE8A33D, 110,9,-16);              // awning over the entrance
  // Outdoor tables with umbrellas
  [104,116].forEach(tx=>{
    box(1.2,0.7,1.2, 0x8B5A2B, tx,0.35,-13);
    box(0.15,1.6,0.15, 0x333333, tx,1.1,-13);
    const um=new THREE.Mesh(new THREE.ConeGeometry(1.3,0.8,8), new THREE.MeshLambertMaterial({color:0xcc3333}));
    um.position.set(tx,2.1,-13); scene.add(um);
  });
  // Indoor dining tables + chairs (visible through the glass front) — Tony/Rosa/Kai sit at the back chair of each
  [104,110,116].forEach(tx=>{
    box(1.1,0.7,1.1, 0x8B5A2B, tx,0.35,-27);        // table
    buildChair(tx,-24,Math.PI);                      // customer-side chair, faces the table
    buildChair(tx,-30,0);                            // waiter-side chair, faces the table
  });
  const dinerLight = new THREE.PointLight(0xffaa55, 1.3, 30);
  dinerLight.position.set(110,7,-17); scene.add(dinerLight);
  buildSign('🍽️ THE DINER', 110,11.5,-16.9);
  addCol(CITY_COLS, 110,-25, 10,8);

  // ─── ROAD: Downtown to Shopping District (extends the main N-S road north) ──
  // The N-S road only ran to z=150 before; the Shopping District's 100 shops at (0,500)
  // had no paved road leading to them at all, just open grass the whole way.
  box(16,0.05,370, 0x555566, 0,0.01,335);
  for(let i=0;i<12;i++) box(0.3,0.06,8, 0xFFDD00, 0,0.02,160+i*30);

  // ─── ROAD: Downtown to the Suburbs (L-shaped, connects into its own street grid) ──
  box(350,0.05,12, 0x555566, 175,0.01,100);
  box(12,0.05,20, 0x555566, 350,0.01,95);
  for(let i=0;i<9;i++) box(0.3,0.06,8, 0xFFDD00, 15+i*38,0.02,100);
  buildSign('🏘️ THE SUBURBS', 300,2.5,106);
  box(0.3,5,0.3, 0x888888, 300,2.5,103);

  // ─── ROADSIDE BILLBOARDS — real promotional content for real in-game destinations ──
  buildRoadBillboard(9, 165, 0,        '🍽️', 'NEW RESTAURANTS THIS WAY!');
  buildRoadBillboard(9, 250, 0,        '🏬', '300+ SHOPS AT THE MALL!');
  buildRoadBillboard(-9, 340, Math.PI, '👗', 'NEW! 40-SHOP FASHION WING');
  buildRoadBillboard(9, 460, 0,        '🛍️', 'SHOPPING DISTRICT AHEAD');
  buildRoadBillboard(175, 108, -Math.PI/2, '🏘️', 'WELCOME TO THE SUBURBS');
  buildRoadBillboard(-9, 105, Math.PI, '🎬', 'CATCH A MOVIE DOWNTOWN');

  // ─── 5 MORE RESTAURANTS — real sit-down spots along the new Shopping District road ──
  RESTAURANT_LOCATIONS.forEach(r => {
    const frontX = r.x + (r.x < 0 ? 8 : -8);
    const triggerX = r.x + (r.x < 0 ? 11 : -11);
    box(16,9,14, r.wall, r.x,4.5,r.z);
    box(17,0.5,15, r.accent, r.x,9.3,r.z);
    box(0.3,6,6, r.glass, frontX, 4, r.z);
    buildLogoSign(r.name, r.emoji, '#'+r.wall.toString(16).padStart(6,'0'), '#'+r.accent.toString(16).padStart(6,'0'), frontX + (r.x<0?0.4:-0.4), 10, r.z, r.x<0?Math.PI/2:-Math.PI/2);
    addCol(CITY_COLS, r.x, r.z, 8, 7);
    CITY_ZONES.push({ x: triggerX, z: r.z, r: 4, label: `${r.emoji} ${r.name}`, action: () => openThemedRestaurant(r.id) });
  });

  // ─── 3 BUFFETS — user's own ask, real pay-once-eat-unlimited spots past the Shopping District's
  // 100-shop grid (which spans z:342.5-657.5 — placing these any closer would sit inside it).
  // Road extended to reach them since nothing paved led out this far before.
  box(16,0.05,320, 0x555566, 0,0.01,660);
  for(let i=0;i<11;i++) box(0.3,0.06,8, 0xFFDD00, 0,0.02,500+i*30);
  buildRoadBillboard(9, 620, 0, '🍽️', 'ALL-YOU-CAN-EAT BUFFETS AHEAD!');
  BUFFET_LOCATIONS.forEach(b => {
    const frontX = b.x + (b.x < 0 ? 8 : -8);
    const triggerX = b.x + (b.x < 0 ? 11 : -11);
    box(16,9,14, b.wall, b.x,4.5,b.z);
    box(17,0.5,15, b.accent, b.x,9.3,b.z);
    box(0.3,6,6, b.glass, frontX, 4, b.z);
    buildLogoSign(b.name, b.emoji, '#'+b.wall.toString(16).padStart(6,'0'), '#'+b.accent.toString(16).padStart(6,'0'), frontX + (b.x<0?0.4:-0.4), 10, b.z, b.x<0?Math.PI/2:-Math.PI/2);
    addCol(CITY_COLS, b.x, b.z, 8, 7);
    CITY_ZONES.push({ x: triggerX, z: b.z, r: 4, label: `${b.emoji} ${b.name}`, action: () => openBuffet(b.id) });
  });

  // ─── AIRPORT ROAD (from main road west then south to airport) ───────────
  box(110,0.05,12, 0x555566, -155,0.01,0);      // west road extension
  box(12,0.05,200, 0x555566, -200,0.01,-100);   // south road to airport
  box(0.3,0.06,12, 0xFFDD00, -145,0.02,0);      // junction dash
  for(let i=0;i<5;i++) box(0.3,0.06,8, 0xFFDD00,-200,0.02,-15-i*30); // south road dashes
  // Airport road signs
  buildSign('✈️ AIRPORT', -170,2.5,2);
  box(0.3,5,0.3, 0x888888, -170,2.5,0); // sign pole

  // ─── CITY AIRPORT — x=-200, z=-200 ──────────────────────────────────────
  // Terminal building
  box(50,10,22, 0xF0F2F8, -200,5,-200);            // main terminal body
  box(52,0.5,24, 0xCCCCDD, -200,10.3,-200);        // roof
  box(50,8,0.3, 0x88AACC, -200,4,-188.9);          // glass front wall
  box(50,0.3,0.3, 0x6699BB, -200,8.2,-188.85);     // glass top trim
  box(0.3,10,22, 0xDDDDE8, -225.1,5,-200);         // left wall
  box(0.3,10,22, 0xDDDDE8, -174.9,5,-200);         // right wall
  box(50,10,0.3, 0xE8E8F0, -200,5,-211.1);         // back wall
  // Entrance doors (center)
  box(8,6,0.3, 0x99BBDD, -200,3,-188.84);          // center door glass
  box(0.3,8,0.3, 0x778899, -196.1,4,-188.84);      // left door frame
  box(0.3,8,0.3, 0x778899, -203.9,4,-188.84);      // right door frame
  // Control tower (left rear)
  box(6,40,6, 0xE0E8F0, -220,20,-208);             // tower shaft
  box(10,6,10, 0x88CCFF, -220,43,-208);            // tower glass cab
  box(12,0.5,12, 0xAACCEE, -220,46.3,-208);        // cab roof
  box(0.4,6,0.4, 0xCCCCDD, -220,49.5,-208);        // antenna base
  box(0.15,8,0.15, 0xFF4444, -220,56,-208);        // antenna (red tip)
  // Runway (behind terminal)
  box(300,0.1,30, 0x555566, -200,0.06,-242);       // asphalt
  box(300,0.11,1.2, 0xFFFFFF, -200,0.07,-242);     // center line
  for(let ri=0;ri<7;ri++) box(20,0.12,0.6, 0xFFFFFF, -200,0.07,-228+ri*(-5)); // threshold marks
  // Apron (tarmac between terminal and runway)
  box(100,0.05,20, 0x444455, -200,0.04,-217);      // apron ground
  // Baggage carts
  box(3,0.8,1.5, 0xFFAA00, -205,0.6,-214);
  box(3,0.8,1.5, 0xFFAA00, -200,0.6,-214);
  box(3,0.8,1.5, 0xFFAA00, -195,0.6,-214);
  // Plane 1 (parked left on runway)
  box(24,2.5,4.5, 0xEEF4FF, -218,2,-242);          // fuselage
  box(2,0.4,32, 0xDDEAFF, -218,2,-242);            // wings
  box(0.5,6,3.5, 0xEEF4FF, -206,5,-242);           // vertical tail
  box(0.5,0.4,13, 0xDDEAFF, -206,3.5,-242);        // horizontal stabilizer
  box(3,1.8,2.5, 0x889999, -215,0.9,-250);         // engine left
  box(3,1.8,2.5, 0x889999, -215,0.9,-234);         // engine right
  box(1.2,0.5,3.8, 0x4466aa, -222,3.2,-242);       // cockpit window
  // Plane 2 (parked right on runway)
  box(24,2.5,4.5, 0xEEF4FF, -182,2,-242);          // fuselage
  box(2,0.4,32, 0xDDEAFF, -182,2,-242);            // wings
  box(0.5,6,3.5, 0xEEF4FF, -170,5,-242);           // vertical tail
  box(0.5,0.4,13, 0xDDEAFF, -170,3.5,-242);        // horizontal stabilizer
  box(3,1.8,2.5, 0x889999, -179,0.9,-250);         // engine left
  box(3,1.8,2.5, 0x889999, -179,0.9,-234);         // engine right
  box(1.2,0.5,3.8, 0x4466aa, -186,3.2,-242);       // cockpit window
  // Signs and lights
  buildSign('✈️ CITY AIRPORT', -200,11.8,-188.5);
  buildSign('DEPARTURES →', -189,5,-188.3);
  buildSign('← ARRIVALS', -211,5,-188.3);
  const airLight1 = new THREE.PointLight(0xaaccff, 1.0, 35);
  airLight1.position.set(-200,8,-188); scene.add(airLight1);
  const airLight2 = new THREE.PointLight(0xffffff, 0.5, 28);
  airLight2.position.set(-200,8,-206); scene.add(airLight2);
  const airTowerLight = new THREE.PointLight(0x88ccff, 0.8, 20);
  airTowerLight.position.set(-220,44,-208); scene.add(airTowerLight);
  // Runway edge lights (orange glow)
  [-228,-234,-240,-246,-252].forEach(rz => {
    const rl1=new THREE.PointLight(0xff6600,0.25,7); rl1.position.set(-212,0.5,rz); scene.add(rl1);
    const rl2=new THREE.PointLight(0xff6600,0.25,7); rl2.position.set(-188,0.5,rz); scene.add(rl2);
  });
  addCol(CITY_COLS, -200,-200, 26,12);
  addCol(CITY_COLS, -220,-208, 4,4);
}

// ─── PLAYER HOUSE (exterior in city) ─────────────────────────────────────────
function buildPlayerHouse() {
  const hx=-30, hz=-110;

  // Main walls
  box(16,8,12, 0xf5e8d0, hx,4,hz);
  // Roof
  box(17.5,0.5,13.5, 0xbb3311, hx,8.3,hz);
  // Roof ridge
  box(18,1.2,1, 0xaa2200, hx,8.8,hz);
  // Door
  box(2,3.4,0.2, 0x7a4010, hx,1.7,hz+6.1);
  box(0.15,3.6,0.2, 0x5a3008, hx-1,1.8,hz+6.1); box(0.15,3.6,0.2, 0x5a3008, hx+1,1.8,hz+6.1);
  box(2.3,0.2,0.2, 0x5a3008, hx,3.5,hz+6.1);
  // Doorknob
  const knob=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,8),mat(0xdaa520));
  knob.position.set(hx+0.7,1.7,hz+6.22); scene.add(knob);
  // Windows
  box(2.8,2,0.2, 0x88ccff, hx-4,4.5,hz+6.1); box(2.8,2,0.2, 0x88ccff, hx+4,4.5,hz+6.1);
  box(2.8,2,0.2, 0x88ccff, hx-4,4.5,hz-6.1); box(2.8,2,0.2, 0x88ccff, hx+4,4.5,hz-6.1);
  // Window cross frames
  box(2.8,0.1,0.2, 0x888, hx-4,4.5,hz+6.1); box(0.1,2,0.2, 0x888, hx-4,4.5,hz+6.1);
  box(2.8,0.1,0.2, 0x888, hx+4,4.5,hz+6.1); box(0.1,2,0.2, 0x888, hx+4,4.5,hz+6.1);
  // Porch
  box(8,0.2,4, 0xd4c4a0, hx,0.1,hz+8);
  box(0.2,3.5,0.2, 0xd4c4a0, hx-3.5,1.75,hz+9.8); box(0.2,3.5,0.2, 0xd4c4a0, hx+3.5,1.75,hz+9.8);
  box(8.5,0.2,0.2, 0xd4c4a0, hx,3.6,hz+9.8);
  // Chimney
  box(1.2,5,1.2, 0x886644, hx+5,9,hz-2);
  // Mailbox
  box(0.5,0.5,0.8, 0x3366aa, hx-7,1.2,hz+9);
  box(0.15,1,0.15, 0x555, hx-7,0.5,hz+9);
  // Yard
  box(22,0.15,22, 0x5aaa3c, hx,0.08,hz+1);
  // White picket fence
  for(let i=-5;i<=5;i++){
    box(0.2,1.4,0.2, 0xeeeeee, hx+i*2,0.7,hz+11);
    if(Math.abs(i)<5) box(2,0.15,0.2, 0xeeeeee, hx+i*2+1,1.2,hz+11);
  }
  for(let j=0;j<6;j++){
    box(0.2,1.4,0.2, 0xeeeeee, hx-10,0.7,hz+11-j*2);
    box(0.2,1.4,0.2, 0xeeeeee, hx+10,0.7,hz+11-j*2);
  }
  // Nameplate — no rot needed now that buildSign() reads correctly from both directions
  // (item 115's two-panel fix); the old per-call rot=Math.PI workaround was removed since
  // it's redundant with that fix (and was actively conflicting with it).
  buildSign('🏠 ' + playerName + "'s House", hx,9.2,hz+6.5);
  // Flowers by porch
  [[-2,1],[0,1],[2,1],[-3,0],[3,0]].forEach(([fx,fz])=>{
    box(0.4,0.6,0.4, 0x33aa22, hx+fx,0.4,hz+10+fz);
    box(0.5,0.4,0.5, [0xff66aa,0xffdd00,0xff4444,0xaa66ff,0xff8800][Math.abs(fx+fz)%5], hx+fx,0.9,hz+10+fz);
  });
  // Collision for house body
  addCol(CITY_COLS, hx,hz, 9,7);
}

// ─── BANK INTERIOR ────────────────────────────────────────────────────────────
// User's own ask: Printer/Counter jobs require actually walking inside, not just standing near an
// outdoor zone — a real walk-in employee area, same "own 10,000-unit pocket lane" pattern as every
// other interior (see BANK_INTERIOR/BANK_INTERIOR_EXIT/enterBankInterior/exitBankInterior above,
// BANK_INTERIOR_ZONES for the two work stations + exit). Built once at world-load like the House
// interior (not conditionally, unlike the player's own ownable Store) since it's always the same
// room for everyone.
function buildBankInterior() {
  const ix = BANK_INTERIOR.x, iz = BANK_INTERIOR.z;
  box(18,0.3,16, 0xc8aa80, ix,0.15,iz);            // floor
  box(18,0.2,16, 0xf0ece0, ix,5,iz);               // ceiling
  box(18,5,0.3, 0xf0ece0, ix,2.5,iz-8);            // back wall
  box(7,5,0.3,  0xf0ece0, ix-6.5,2.5,iz+8);        // front wall left (door gap between)
  box(7,5,0.3,  0xf0ece0, ix+6.5,2.5,iz+8);        // front wall right
  box(6,1.6,0.3, 0xf0ece0, ix,4.5,iz+8);           // above door
  box(0.3,5,16, 0xf0ece0, ix-9,2.5,iz);            // left wall
  box(0.3,5,16, 0xf0ece0, ix+9,2.5,iz);            // right wall
  box(2,3,0.1, 0x886600, ix,1.5,iz+8.1);           // door opening visual (gold, matching the real Bank's outdoor door frame)

  // Money Printer station (west side) — a real printing-press prop
  box(2.4,1,1.4, 0x8B5A2B, ix-5,0.5,iz-3);         // desk
  box(1,1,0.8, 0x445566, ix-5,1.1,iz-3);           // press body
  box(0.9,0.1,0.7, 0xeeeecc, ix-5,1.55,iz-3);      // paper tray
  const printerLight = new THREE.PointLight(0xffee88, 0.6, 6); printerLight.position.set(ix-5,2,iz-3); scene.add(printerLight);

  // Money Counter station (east side) — a real counting table with stacked bills
  box(2.4,1,1.4, 0x8B5A2B, ix+5,0.5,iz-3);         // table
  [0,1,2,3].forEach(i => box(0.5,0.15+i*0.08,0.3, 0x3a8a3a, ix+4.5+i*0.35, 1.05+i*0.04, iz-3.3));

  buildSign('🏦 BANK EMPLOYEES ONLY', ix,4.6,iz-7.9);
  addCol(BANK_INTERIOR_COLS, ix-5,iz-3, 1.3,0.9);  // printer desk
  addCol(BANK_INTERIOR_COLS, ix+5,iz-3, 1.3,0.9);  // counter table
}

// ─── HOUSE INTERIOR ───────────────────────────────────────────────────────────
function buildHouseInterior() {
  const ix=HOUSE_SPAWN.x, iz=0;

  // Floor & ceiling
  box(20,0.3,16, 0xc8aa80, ix,0.15,iz);
  box(20,0.2,16, 0xf5f0e8, ix,5,iz);

  // Walls
  box(20,5,0.3, 0xf5efe0, ix,2.5,iz-8);              // back wall
  box(7,5,0.3,  0xf5efe0, ix-6.5,2.5,iz+8);          // front wall left
  box(7,5,0.3,  0xf5efe0, ix+6.5,2.5,iz+8);          // front wall right
  box(6,1.6,0.3, 0xf5efe0, ix,4.5,iz+8);             // above door
  box(0.3,5,16, 0xf5efe0, ix-10,2.5,iz);             // left wall
  box(0.3,5,16, 0xf5efe0, ix+10,2.5,iz);             // right wall

  // Door opening visual
  box(2,3,0.1, 0x8B5E3C, ix,1.5,iz+8.1);

  // Baseboard trim
  box(20,0.2,0.1, 0xddccbb, ix,0.4,iz-7.9);
  box(0.1,0.2,16, 0xddccbb, ix-9.9,0.4,iz);
  box(0.1,0.2,16, 0xddccbb, ix+9.9,0.4,iz);

  // ── BEDROOM (right side) ────────────────────────────────────────────────────
  // Bed frame
  box(4,0.3,5.5, 0x7a5c3a, ix+5.5,0.4,iz-4);
  // Mattress
  box(3.8,0.35,5, 0xf0f0f0, ix+5.5,0.68,iz-4);
  // Blanket
  box(3.8,0.2,3.5, 0x4488cc, ix+5.5,0.9,iz-5);
  // Pillows
  box(1.4,0.2,0.9, 0xfff8f0, ix+4.5,0.95,iz-6.2);
  box(1.4,0.2,0.9, 0xfff8f0, ix+6.5,0.95,iz-6.2);
  // Headboard
  box(4,1.2,0.2, 0x7a5c3a, ix+5.5,1.1,iz-6.6);
  // Bedside table
  box(1.2,0.8,1.2, 0x8B6340, ix+8.8,0.6,iz-6);
  const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.35,8,8),new THREE.MeshBasicMaterial({color:0xffffdd}));
  lamp.position.set(ix+8.8,1.35,iz-6); scene.add(lamp);
  const lp=new THREE.PointLight(0xffeeaa,0.9,10); lp.position.set(ix+8.8,1.5,iz-6); scene.add(lp);
  addCol(HOUSE_COLS, ix+5.5,iz-5, 2,2.5);    // bed (tightened — was blocking center at z≈0)

  // ── SOFA + TV (left side) ────────────────────────────────────────────────────
  // Sofa
  box(5.5,0.6,1.8, 0x994444, ix-4,0.55,iz+3);
  box(5.5,0.9,0.4, 0x994444, ix-4,1.1,iz+3.9);
  box(0.5,0.9,1.8, 0x882222, ix-6.5,0.9,iz+3);
  box(0.5,0.9,1.8, 0x882222, ix-1.5,0.9,iz+3);
  // Cushions
  box(2,0.2,1.4, 0xcc6666, ix-5.5,1.0,iz+2.8);
  box(2,0.2,1.4, 0xcc6666, ix-2.5,1.0,iz+2.8);
  addCol(HOUSE_COLS, ix-4,iz+3, 2.8,1.0);    // sofa (tightened)
  // Coffee table
  box(2.5,0.1,1.2, 0x8B6340, ix-4,1.1,iz+1.2);
  box(0.1,1,0.1, 0x7a5030, ix-5,0.5,iz+0.7); box(0.1,1,0.1, 0x7a5030, ix-3,0.5,iz+0.7);
  box(0.1,1,0.1, 0x7a5030, ix-5,0.5,iz+1.7); box(0.1,1,0.1, 0x7a5030, ix-3,0.5,iz+1.7);
  // TV on right wall
  box(4,2.5,0.2, 0x111111, ix+9.5,2.2,iz+2);
  box(3.6,2.1,0.05, 0x1a3a5a, ix+9.5,2.2,iz+1.92);
  box(1.5,0.1,0.6, 0x333, ix+9.5,1.05,iz+2); box(0.1,1,0.1, 0x333, ix+9.5,0.5,iz+2);
  // Remote on table
  box(0.3,0.08,0.7, 0x222, ix-4.5,1.18,iz+1.2);

  // ── KITCHEN (back left) ──────────────────────────────────────────────────────
  // Counter
  box(5,1.1,1.4, 0xe0d8c8, ix-6,0.75,iz-6.3);
  box(5.1,0.1,1.5, 0xf8f8f8, ix-6,1.35,iz-6.3);
  // Stove & sink
  box(1.4,1.12,1.4, 0xaaaaaa, ix-8,0.75,iz-6.3);
  box(1.2,1.12,1.4, 0xcccccc, ix-4,0.75,iz-6.3);
  box(0.8,0.5,0.8, 0x88aacc, ix-4,1.4,iz-6.3);
  // Fridge
  box(1.4,3,1.2, 0xdddddd, ix-2.5,1.5,iz-6.8);
  box(1.38,0.05,1.18, 0xbbbbbb, ix-2.5,1.5,iz-6.8);
  box(0.1,0.3,0.1, 0xaaa, ix-2.9,2,iz-6.2);
  // Upper cabinets
  box(5,1,0.7, 0xe0d8c8, ix-6,3.5,iz-7.3);
  // Overhead light
  box(3,0.15,1, 0xffffee, ix-6,4.7,iz-6);
  const kl=new THREE.PointLight(0xffffff,0.7,8); kl.position.set(ix-6,4.5,iz-6); scene.add(kl);

  // ── TOILET (back wall, between kitchen and bedroom) ──────────────────────────
  box(0.55,0.35,0.6, 0xffffff, ix+2.5,0.35,iz-6.8);   // bowl
  box(0.6,0.55,0.18, 0xffffff, ix+2.5,0.85,iz-7.05);  // tank
  box(0.62,0.06,0.18, 0xeeeeee, ix+2.5,1.14,iz-7.05); // tank lid
  addCol(HOUSE_COLS, ix+2.5,iz-6.8, 0.5,0.5);

  // ── DINING TABLE (center) ────────────────────────────────────────────────────
  box(3.5,0.1,2.5, 0x8B5E3C, ix,1.1,iz+5);
  [[-1.5,5],[ 1.5,5],[-1.5,6.2],[ 1.5,6.2]].forEach(([lx2,lz2])=>{
    box(0.12,1,0.12, 0x7a5030, ix+lx2,0.5,iz+lz2);
  });
  // Chairs
  [[-2.5,5],[2.5,5],[-2.5,6],[2.5,6]].forEach(([cx2,cz2],i)=>{
    box(1,0.1,1, 0xaa8855, ix+cx2,0.8,iz+cz2);
    box(1,0.8,0.1, 0xaa8855, ix+cx2,1.2,iz+cz2+(cz2>5.5?0.5:-0.5));
  });
  // Table decoration
  box(0.4,0.6,0.4, 0x228822, ix,1.2,iz+5);
  box(0.6,0.3,0.6, 0x44bb44, ix,1.65,iz+5);
  addCol(HOUSE_COLS, ix,iz+5, 1.8,1.3);      // dining table (tightened)

  // ── BOOKSHELF (left wall) ────────────────────────────────────────────────────
  box(2,3.5,0.8, 0x8B5E3C, ix-9.5,1.75,iz-2);
  for(let shelf=0;shelf<3;shelf++){
    box(2,0.08,0.7, 0x7a5030, ix-9.5,0.6+shelf*1.1,iz-2);
    [0x3355aa,0xaa3333,0x448844,0xaaaa33,0x663399].forEach((bc,bi)=>{
      box(0.22,0.7,0.65, bc, ix-9.3+bi*0.38,1.0+shelf*1.1,iz-2);
    });
  }

  // ── DECORATIONS ──────────────────────────────────────────────────────────────
  // Plant
  box(0.6,0.7,0.6, 0x8B5E3C, ix+9,0.55,iz-7);
  box(0.9,0.9,0.9, 0x33aa44, ix+9,1.3,iz-7);
  // Art on back wall
  box(3,2,0.1, 0xffffff, ix-3,3.5,iz-7.9);
  box(2.6,1.6,0.05, 0x4488cc, ix-3,3.5,iz-7.88);
  box(3,2,0.1, 0xffffff, ix+3,3.5,iz-7.9);
  box(2.6,1.6,0.05, 0xdd6622, ix+3,3.5,iz-7.88);
  // Welcome mat
  box(2.5,0.06,1.2, 0x885544, ix,0.22,iz+7.3);
  // Windows
  box(2.8,2,0.15, 0x88ccff, ix-5,3,iz-7.9);
  box(2.8,2,0.15, 0x88ccff, ix+5,3,iz-7.9);
  box(0.1,2,0.15, 0x888, ix-5,3,iz-7.9); box(2.8,0.1,0.15, 0x888, ix-5,3,iz-7.9);
  box(0.1,2,0.15, 0x888, ix+5,3,iz-7.9); box(2.8,0.1,0.15, 0x888, ix+5,3,iz-7.9);

  buildSign('🏠 My House', ix,5.5,iz-7.8);

  // ── COMPUTER DESK (right wall, near bedroom) ─────────────────────────────────
  box(2.5,0.1,1.5, 0x5a4030, ix+8,1.05,iz+0.5);    // desk surface
  box(0.1,1,0.1, 0x3a2a1a, ix+7,0.5,iz-0.2);        // leg FL
  box(0.1,1,0.1, 0x3a2a1a, ix+9,0.5,iz-0.2);        // leg FR
  box(0.1,1,0.1, 0x3a2a1a, ix+7,0.5,iz+1.2);        // leg BL
  box(0.1,1,0.1, 0x3a2a1a, ix+9,0.5,iz+1.2);        // leg BR
  box(2,1.5,0.1, 0x111111, ix+8,1.9,iz-0.1);        // monitor frame
  box(1.75,1.25,0.05, 0x2244aa, ix+8,1.9,iz-0.05);  // screen (blue glow)
  box(0.3,0.5,0.3, 0x222222, ix+8,1.1,iz-0.1);      // monitor stand
  box(1.4,0.07,0.5, 0x222222, ix+8,1.14,iz+0.6);    // keyboard
  box(0.3,0.07,0.4, 0x333333, ix+9.1,1.14,iz+0.4);  // mouse
  box(0.7,0.5,0.4, 0x111111, ix+6.8,1.3,iz-0.1);    // speakers L
  box(0.7,0.5,0.4, 0x111111, ix+9.2,1.3,iz-0.1);    // speakers R
  const screenGlow=new THREE.PointLight(0x4488ff,0.4,6);
  screenGlow.position.set(ix+8,2,iz+0.3); scene.add(screenGlow);
  addCol(HOUSE_COLS, ix+8.5,iz,1.0,0.8);     // computer desk (tightened)

  // Interior wall colliders
  addCol(HOUSE_COLS, ix,iz-8, 11,0.5);         // back wall
  addCol(HOUSE_COLS, ix-6.5,iz+8, 3.5,0.5);   // front left
  addCol(HOUSE_COLS, ix+6.5,iz+8, 3.5,0.5);   // front right
  addCol(HOUSE_COLS, ix-10,iz, 0.5,9);         // left wall
  addCol(HOUSE_COLS, ix+10,iz, 0.5,9);         // right wall
  // Furniture colliders
  addCol(HOUSE_COLS, ix-4,iz-6.5, 3,0.8);      // kitchen counter
  addCol(HOUSE_COLS, ix-9.5,iz-2, 1.2,2);     // bookshelf
}

// ─── HOTEL INTERIOR ───────────────────────────────────────────────────────────
function buildHotelInterior() {
  buildHotelRoom(HOTEL_SPAWN.x,    'budget');
  buildHotelRoom(HOTEL_SPAWN.x+30, 'standard');
  buildHotelRoom(HOTEL_SPAWN.x+60, 'luxury');
}
function buildHotelRoom(ix, type) {
  const iz = 0;
  const wallCol   = type==='luxury' ? 0xE8DCC8 : type==='standard' ? 0xD8E0E8 : 0xD2B48C;
  const carpetCol = type==='luxury' ? 0x3D1054 : type==='standard' ? 0x1A3A6C : 0x8B1A5C;
  const ceilCol   = type==='luxury' ? 0xFFF8F0 : 0xF5F0E8;

  // Floor, ceiling, walls (same shape, different colors)
  box(14,0.2,10, wallCol,  ix,0.1,iz);
  box(14,0.2,10, ceilCol,  ix,4,iz);
  box(14,4,0.3,  wallCol,  ix,2,iz-5);
  box(14,4,0.3,  wallCol,  ix,2,iz+5);
  box(0.3,4,10,  wallCol,  ix-7,2,iz);
  box(0.3,4,10,  wallCol,  ix+7,2,iz);
  // Door gap in front wall
  box(5.5,4,0.3, wallCol,  ix-4.5,2,iz+5);
  box(5.5,4,0.3, wallCol,  ix+4.5,2,iz+5);
  box(3,0.6,0.3, wallCol,  ix,3.7,iz+5);
  box(2.8,3,0.1, 0x7B5A3C, ix,1.5,iz+5.1);
  // Carpet
  box(12,0.05,8, carpetCol, ix,0.22,iz);

  if(type === 'budget') {
    // Single bed — basic
    box(3.5,0.3,2.2,  0x5C3A1E, ix+4,0.4,iz-3);
    box(3.3,0.4,2.0,  0xFFFAF0, ix+4,0.7,iz-3);
    box(3.1,0.5,0.55, 0xFFFFFF, ix+4,0.95,iz-3.9);
    box(3.1,0.15,1.3, 0xAA3333, ix+4,0.65,iz-2.4);
    // Small TV on dresser
    box(2.5,0.8,1,    0x5C3A1E, ix-4,0.4,iz-4.5);  // dresser
    box(3,1.8,0.15,   0x111111, ix-4,2,iz-4.85);
    box(2.7,1.5,0.08, 0x0d1b4a, ix-4,2,iz-4.78);
    // Nightstand + lamp
    box(1,0.7,1,      0x6B4423, ix+5.5,0.35,iz-4);
    box(0.25,0.8,0.25,0xFFFDD0, ix+5.5,1.1,iz-4);
    box(0.5,0.08,0.5, 0xffd700, ix+5.5,1.5,iz-4);
    // Simple chair
    box(1,0.5,1,   0x4a4a4a, ix-5,0.25,iz+2.5);
    box(1,1.2,0.1, 0x4a4a4a, ix-5,0.85,iz+3);
    buildSign('🛏️ BUDGET ROOM', ix,3.8,iz+5.2);

  } else if(type === 'standard') {
    // Bigger king bed, blue bedding
    box(4.5,0.35,2.8, 0x4A2800,  ix+3.5,0.4,iz-3);
    box(4.3,0.45,2.6, 0xFFFAF0,  ix+3.5,0.75,iz-3);
    box(2,0.6,0.6,    0xFFFFFF,  ix+2.5,1.05,iz-4.2); // left pillow
    box(2,0.6,0.6,    0xFFFFFF,  ix+4.5,1.05,iz-4.2); // right pillow
    box(4.1,0.18,1.8, 0x1E40AF,  ix+3.5,0.7,iz-2.2);  // blue blanket
    // Bigger TV
    box(4.2,2.5,0.15, 0x111111,  ix-4,2.3,iz-4.85);
    box(3.9,2.2,0.08, 0x0d1b4a,  ix-4,2.3,iz-4.78);
    box(3.9,0.15,0.2, 0x333333,  ix-4,1.1,iz-4.8);
    // Desk + office chair
    box(2.5,0.7,1.2, 0x8B6328,  ix-5,0.35,iz+1);
    box(1.2,0.5,1.2, 0x222222,  ix-5.2,0.25,iz+2.5);
    box(1.2,1.4,0.15,0x222222,  ix-5.2,0.95,iz+3.1);
    // Floor lamp
    box(0.15,1.8,0.15, 0xC0C0C0, ix-4.5,0.9,iz+3);
    box(0.6,0.3,0.6,   0xFFFDD0, ix-4.5,1.9,iz+3);
    // Nightstand both sides
    box(1,0.7,1, 0x6B4423, ix+5.5,0.35,iz-4);
    box(1,0.7,1, 0x6B4423, ix+1.5,0.35,iz-4);
    buildSign('✨ STANDARD ROOM', ix,3.8,iz+5.2);

  } else { // luxury
    // Gold trim on walls
    box(14,0.08,0.1, 0xFFD700, ix,3.0,iz-4.9);
    box(14,0.08,0.1, 0xFFD700, ix,3.0,iz+4.9);
    box(0.1,0.08,10, 0xFFD700, ix-6.9,3.0,iz);
    box(0.1,0.08,10, 0xFFD700, ix+6.9,3.0,iz);
    // Grand king bed with gold frame
    box(5,0.4,3.2,   0xAA8800, ix+3,0.4,iz-2.8);
    box(4.8,0.5,3.0, 0xFFFAF0, ix+3,0.8,iz-2.8);
    box(2.2,0.7,0.65,0xFFFAF0, ix+2,1.15,iz-4.2);
    box(2.2,0.7,0.65,0xFFFAF0, ix+4,1.15,iz-4.2);
    box(4.6,0.2,2.0, 0x8B0045, ix+3,0.72,iz-1.9); // red velvet blanket
    // Large 4K TV
    box(5.5,3.2,0.15, 0x111111, ix-3.5,2.5,iz-4.85);
    box(5.2,2.9,0.08, 0x001133, ix-3.5,2.5,iz-4.78);
    // Hot tub
    box(3.5,0.9,2.8, 0x3a7a9a, ix-4.5,0.45,iz+2);
    box(3.1,0.6,2.4, 0x55aadd, ix-4.5,0.6,iz+2);
    const htl=new THREE.PointLight(0x0099ff,0.5,5); htl.position.set(ix-4.5,1,iz+2); scene.add(htl);
    // Gold chandelier
    box(3,0.15,3, 0xFFD700, ix,3.82,iz-1);
    box(0.12,1.5,0.12, 0xFFD700, ix,3.1,iz-1);
    const chl=new THREE.PointLight(0xFFE080,1.0,14); chl.position.set(ix,3.5,iz-1); scene.add(chl);
    // Mini bar
    box(1.8,1.5,1.2, 0x2a1a0a, ix+6.5,0.75,iz+3);
    box(1.6,0.08,1.0, 0x888888, ix+6.5,1.55,iz+3);
    buildSign('👑 LUXURY SUITE', ix,3.8,iz+5.2);
  }

  // Collision (same shape for all rooms)
  addCol(HOTEL_COLS, ix,    iz-5,  7,   0.4);
  addCol(HOTEL_COLS, ix-7,  iz,    0.4, 5  );
  addCol(HOTEL_COLS, ix+7,  iz,    0.4, 5  );
  addCol(HOTEL_COLS, ix-4.5,iz+5,  2.8, 0.4);
  addCol(HOTEL_COLS, ix+4.5,iz+5,  2.8, 0.4);
}

// ─── MALL INTERIOR ───────────────────────────────────────────────────────────
function buildMallInterior() {
  const mx=MALL_SPAWN.x, mz=0;

  // Floor — white marble tiles
  box(66,0.1,54, 0xf5f5f0, mx,0,mz);
  for(let i=-4;i<=4;i++) for(let j=-3;j<=3;j++) {
    if((i+j)%2===0) box(6.4,0.06,6.4, 0xe8e8e0, mx+i*7,0.09,mz+j*7);
  }

  // Ceiling + skylights
  box(66,0.4,54, 0xeeeeee, mx,11,mz);
  for(let i=-2;i<=2;i++) box(7,0.12,44, 0xbbddff, mx+i*12,11.1,mz);

  // Walls
  box(0.5,11,21, 0xe8e8e8, mx-33,5.5,mz-16.5); // left, front segment (door gap z -6..6)
  box(0.5,11,21, 0xe8e8e8, mx-33,5.5,mz+16.5); // left, back segment
  box(0.4,7,0.5, 0xcccccc, mx-33,3.5,mz-6); box(0.4,7,0.5, 0xcccccc, mx-33,3.5,mz+6);
  box(0.4,0.4,12, 0xcccccc, mx-33,7.2,mz);
  buildSign('👗 FASHION WING', mx-33.6,7.7,mz, -Math.PI/2);
  box(0.5,11,54, 0xe8e8e8, mx+33,5.5,mz);   // right
  box(28,11,0.5, 0xe8e8e8, mx-19,5.5,mz-27); // back-left
  box(28,11,0.5, 0xe8e8e8, mx+19,5.5,mz-27); // back-right
  box(28,11,0.5, 0xe8e8e8, mx-19,5.5,mz+27); // front-left
  box(28,11,0.5, 0xe8e8e8, mx+19,5.5,mz+27); // front-right
  // Door frame
  box(0.4,6,0.5, 0xcccccc, mx-5,3,mz+27); box(0.4,6,0.5, 0xcccccc, mx+5,3,mz+27);
  box(10,0.4,0.5, 0xcccccc, mx,6.2,mz+27);
  box(4.6,5.8,0.1, 0x88ccff, mx-2.5,3,mz+27);
  box(4.6,5.8,0.1, 0x88ccff, mx+2.5,3,mz+27);
  // Back doorway frame — leads to the Shopping Wing
  box(0.4,7,0.5, 0xcccccc, mx-5,3.5,mz-27); box(0.4,7,0.5, 0xcccccc, mx+5,3.5,mz-27);
  box(10,0.4,0.5, 0xcccccc, mx,7.2,mz-27);
  buildSign('🗺️ SHOPPING WING →', mx,7.7,mz-27.6, Math.PI);

  // Columns
  [[mx-26,mz+20],[mx+26,mz+20],[mx-26,mz-20],[mx+26,mz-20]].forEach(([cx,cz])=>{
    box(1.2,10,1.2, 0xe0e0e0, cx,5,cz); box(2,0.4,2, 0xdddddd, cx,10.3,cz);
  });

  // Fountain (center)
  box(9,0.35,9, 0x88bbcc, mx,0.2,mz-4);
  box(6,0.2,6, 0xaaddee, mx,0.5,mz-4);
  box(0.5,2.5,0.5, 0xcccccc, mx,1.5,mz-4);
  box(1.6,0.3,1.6, 0xbbddee, mx,2.7,mz-4);
  const wl=new THREE.PointLight(0x00aaff,0.5,12); wl.position.set(mx,1,mz-4); scene.add(wl);

  // Real ceiling lights — a proper indoor space needs its own light, not just whatever's left of
  // the outdoor sun/ambient light once updateDayNight() dims them at night. Without these, the
  // ENTIRE mall went dark every real in-game night, same as standing outside after sunset, which
  // makes no sense for an indoor building with a roof. Fixed intensity, no day/night modulation.
  [[-24,20],[0,20],[24,20],[-24,-20],[0,-20],[24,-20]].forEach(([lx2,lz2]) => {
    const cl = new THREE.PointLight(0xfff4dd, 0.9, 26);
    cl.position.set(mx+lx2, 9.5, mz+lz2);
    scene.add(cl);
  });

  // Benches
  [[mx,mz+14],[mx,mz-14],[mx-10,mz+2],[mx+10,mz+2]].forEach(([bx,bz])=>{
    box(5,0.3,1.2, 0x8B6914,bx,0.55,bz);
    box(0.3,0.7,1.2, 0x8B6914,bx-2,0.35,bz);
    box(0.3,0.7,1.2, 0x8B6914,bx+2,0.35,bz);
  });

  // Plants
  [[mx-20,mz+20],[mx+20,mz+20],[mx-20,mz-21],[mx+20,mz-21]].forEach(([px2,pz])=>{
    box(0.8,1.2,0.8, 0x5c3a1e,px2,0.8,pz); box(1.8,1.8,1.8, 0x33aa44,px2,2.2,pz);
  });

  // ── LEFT SHOPS ──────────────────────────────────────────────────────────────
  const lx=mx-28;
  // Outfit Shop
  box(8,6,0.4, 0xff77aa, lx+4,3,mz-17);
  box(7,1,2.5, 0xdd5599, lx+3,0.6,mz-15.8);
  buildSign('👗 OUTFIT SHOP', lx+4,6.5,mz-16.5);
  box(0.15,2.5,0.15, 0x888,lx+1,1.5,mz-17); box(2,0.08,0.1, 0x888,lx+2,2.8,mz-17);
  box(0.5,1.2,0.3, 0xff4488,lx+1.8,2.1,mz-17);
  addCol(MALL_COLS,lx+3,mz-15.5, 2.5,1.5);

  // Jewelry
  box(8,6,0.4, 0xffdd44, lx+4,3,mz-4);
  box(7,1,2.5, 0xddaa00, lx+3,0.6,mz-2.8);
  buildSign('💍 JEWELRY', lx+4,6.5,mz-3.5);
  box(3,1.4,2, 0x99eeff, lx+2.5,0.95,mz-2.8);
  box(0.35,0.12,0.35, 0xFFD700,lx+2.3,1,mz-2.5);
  addCol(MALL_COLS,lx+3,mz-2.5, 2.5,1.5);

  // Arcade
  box(8,6,0.4, 0x8844ff, lx+4,3,mz+10);
  buildSign('🎮 ARCADE', lx+4,6.5,mz+10.5);
  [[0,0],[2.5,0],[5,0]].forEach(([dx])=>{
    box(1,3,1.4, 0x222266,lx+1+dx,1.5,mz+9);
    box(0.85,1.6,0.1, 0x4455aa,lx+1+dx,2.2,mz+9.75);
    box(0.5,0.5,0.06, 0x88aaff,lx+1+dx,3.1,mz+9.75);
  });
  addCol(MALL_COLS,lx+3.5,mz+9, 3.5,0.8);

  // ── RIGHT SHOPS ─────────────────────────────────────────────────────────────
  const rx=mx+28;
  // Weapon Shop
  box(8,6,0.4, 0x223366, rx-4,3,mz-17);
  box(7,1,2.5, 0x1a2a55, rx-3,0.6,mz-15.8);
  buildSign('⚔️ WEAPON SHOP', rx-4,6.5,mz-16.5);
  box(0.08,1.4,0.06, 0xcccccc,rx-2,1.8,mz-15.8); // sword on wall
  box(0.08,1.0,0.06, 0x8B4513,rx-3,1.6,mz-15.8); // bat
  addCol(MALL_COLS,rx-3,mz-15.5, 2.5,1.5);

  // Electronics
  box(8,6,0.4, 0x003366, rx-4,3,mz-4);
  box(7,1,2.5, 0x002244, rx-3,0.6,mz-2.8);
  buildSign('📱 ELECTRONICS', rx-4,6.5,mz-3.5);
  box(0.65,1.1,0.06, 0x222222,rx-2.5,1.3,mz-3); box(0.5,0.06,0.4, 0x333,rx-2.5,0.8,mz-2.8);
  box(0.65,1.0,0.06, 0x111111,rx-4,1.3,mz-3);
  addCol(MALL_COLS,rx-3,mz-2.5, 2.5,1.5);

  // Ice Cream
  box(8,6,0.4, 0xffaa44, rx-4,3,mz+10);
  box(7,1,2.5, 0xff8822, rx-3,0.6,mz+9);
  buildSign('🍦 ICE CREAM', rx-4,6.5,mz+10.5);
  box(0.45,1.8,0.45, 0xffffff,rx-2.5,1.2,mz+9);
  box(0.6,0.25,0.6, 0xffcccc,rx-2.5,2.2,mz+9);
  addCol(MALL_COLS,rx-3,mz+9, 2.5,0.8);

  // Ceiling lights
  for(let i=-2;i<=2;i++) for(let j=-2;j<=2;j++){
    const pl=new THREE.PointLight(0xfff5e0,0.25,18);
    pl.position.set(mx+i*12,9.5,mz+j*12); scene.add(pl);
  }

  // Exit sign
  buildSign('🚪 EXIT', mx,8,mz+26.5);

  // Colliders
  addCol(MALL_COLS,mx-33,mz-16.5,1,10.5);  // left wall, front segment
  addCol(MALL_COLS,mx-33,mz+16.5,1,10.5);  // left wall, back segment
  addCol(MALL_COLS,mx+33,mz,  1,28);   // right wall
  addCol(MALL_COLS,mx-19,mz-27,14,1);  // back-left wall
  addCol(MALL_COLS,mx+19,mz-27,14,1);  // back-right wall
  addCol(MALL_COLS,mx-19,mz+27,14,1);  // front-left wall
  addCol(MALL_COLS,mx+19,mz+27,14,1);  // front-right wall
  addCol(MALL_COLS,mx,mz-4,   5,5);    // fountain
}

// ─── ARCADE INTERIOR — Pixel Palace: 8 real game cabinets + 10 claw machines ──
// Small helper that builds one stand-up cabinet: a dark body, a colored "screen"
// panel facing into the room, and a logo sign naming which game it is.
function buildCabinet(x, z, rot, color, emoji, name) {
  const g = new THREE.Group();
  g.position.set(x, 0, z); g.rotation.y = rot;
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.6, 1), mat(0x18142a));
  body.position.set(0, 1.3, 0); g.add(body);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.08), mat(color));
  screen.position.set(0, 1.75, 0.52); g.add(screen);
  scene.add(g);
  buildLogoSign(name, emoji, '#'+color.toString(16).padStart(6,'0'), '#ffffff', x, 3.1, z + Math.sin(rot)*0.6, rot);
}
// Small helper for one claw machine: a glass-look box body, a colored roof cap
// (the machine's "theme" color), and a logo sign with the machine's name.
function buildClawMachine(x, z, rot, color, name) {
  const g = new THREE.Group();
  g.position.set(x, 0, z); g.rotation.y = rot;
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 1.6), new THREE.MeshLambertMaterial({color:0xbfe8ff, transparent:true, opacity:0.35}));
  body.position.set(0, 1.1, 0); g.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 1.8), mat(color));
  roof.position.set(0, 2.35, 0); g.add(roof);
  scene.add(g);
  buildLogoSign(name, '🧸', '#'+color.toString(16).padStart(6,'0'), '#ffffff', x, 3.1, z + Math.sin(rot)*0.6, rot);
}
function buildArcadeInterior() {
  const ax = ARCADE_SPAWN.x, az = 0;

  // Floor, ceiling, walls — 40 wide (x) x 32 deep (z)
  box(40,0.2,32, 0x140f28, ax,0.1,az);
  box(40,0.2,32, 0x0a0818, ax,4.6,az);
  box(40,4.6,0.3, 0x241a44, ax,2.3,az-16);      // back wall
  box(0.3,4.6,32, 0x241a44, ax-20,2.3,az);      // west wall
  box(0.3,4.6,32, 0x241a44, ax+20,2.3,az);      // east wall
  // Front wall with a door gap centered on ax (gap width 6)
  box(17,4.6,0.3, 0x241a44, ax-11.5,2.3,az+16);
  box(17,4.6,0.3, 0x241a44, ax+11.5,2.3,az+16);
  buildLogoSign('PIXEL PALACE', '🕹️', '#ff2e9c', '#00e5ff', ax, 4.3, az-15.8);

  // Ceiling neon strips for atmosphere
  for(let i=-1;i<=1;i++) {
    const pl = new THREE.PointLight(i===0?0x00e5ff:0xff2e9c, 0.6, 22);
    pl.position.set(ax+i*12, 4, az); scene.add(pl);
  }

  // 8 game cabinets along the back wall, evenly spaced
  const CABINETS = [
    { color:0x00e5ff, emoji:'🐹', name:'WHACK-A-MOLE', open:openWhack },
    { color:0xff2e9c, emoji:'👻', name:'MAZE CHASE',    open:openMaze },
    { color:0x8a2be2, emoji:'🧠', name:'MEMORY MATCH',  open:openMemory },
    { color:0x4dff88, emoji:'🎵', name:'SIMON SAYS',    open:openSimon },
    { color:0x4dff88, emoji:'🐍', name:'SNAKE',         open:openSnake },
    { color:0xffa64d, emoji:'🧱', name:'BRICK BREAKER', open:openBreakout },
    { color:0xffe14d, emoji:'⚡', name:'QUICK DRAW',    open:openReaction },
    { color:0xc04dff, emoji:'🧩', name:'TETRIS',        open:openTetris },
  ];
  const cabXs = [-14,-10,-6,-2,2,6,10,14];
  CABINETS.forEach((c,i) => {
    const x = ax + cabXs[i], z = az - 15.3;
    buildCabinet(x, z, 0, c.color, c.emoji, c.name); // rot=0: screen faces +Z, toward the player approaching from the door
    addCol(ARCADE_COLS, x, z, 0.9, 0.6);
    ARCADE_ZONES.push({ x, z: z+1.8, r:1.8, label:`[E] ${c.emoji} ${c.name}`, action: c.open });
  });

  // 10 claw machines, 5 along each side wall — kept south of the cabinet row (z >= -6)
  // so their proximity zones can never reach into the cabinet zones near the back corners.
  const clawZs = [-6,-2,2,6,10];
  for(let i=0;i<5;i++) {
    const wx = ax - 19.1, z = az + clawZs[i], id = i;
    buildClawMachine(wx, z, Math.PI/2, CLAW_MACHINES[id].color, CLAW_MACHINES[id].name);
    addCol(ARCADE_COLS, wx, z, 0.6, 0.9);
    ARCADE_ZONES.push({ x: wx+2.3, z, r:1.8, label:`[E] 🧸 ${CLAW_MACHINES[id].name}`, action: () => openClaw(id) });
  }
  for(let i=0;i<5;i++) {
    const wx = ax + 19.1, z = az + clawZs[i], id = i+5;
    buildClawMachine(wx, z, -Math.PI/2, CLAW_MACHINES[id].color, CLAW_MACHINES[id].name);
    addCol(ARCADE_COLS, wx, z, 0.6, 0.9);
    ARCADE_ZONES.push({ x: wx-2.3, z, r:1.8, label:`[E] 🧸 ${CLAW_MACHINES[id].name}`, action: () => openClaw(id) });
  }

  // Collision — outer walls (door gap between ax-3 and ax+3 on the front wall)
  addCol(ARCADE_COLS, ax,     az-16, 20,  0.4);
  addCol(ARCADE_COLS, ax-20,  az,    0.4, 16 );
  addCol(ARCADE_COLS, ax+20,  az,    0.4, 16 );
  addCol(ARCADE_COLS, ax-11.5,az+16, 8.5, 0.4);
  addCol(ARCADE_COLS, ax+11.5,az+16, 8.5, 0.4);
}

