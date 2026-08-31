// ─── EXPLOX ───────────────────────────────────────────────────────────────────

// ─── SFX ─────────────────────────────────────────────────────────────────────
const sfx = (() => {
  let ctx = null;
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }
  function tone(freq, type, vol, dur, delay=0, freqEnd=null) {
    try {
      const c = ac();
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = type;
      o.frequency.setValueAtTime(freq, c.currentTime + delay);
      if(freqEnd) o.frequency.linearRampToValueAtTime(freqEnd, c.currentTime + delay + dur);
      g.gain.setValueAtTime(vol, c.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
      o.start(c.currentTime + delay);
      o.stop(c.currentTime + delay + dur + 0.01);
    } catch(e) {}
  }
  return {
    coin()    { tone(440,'sine',.15,.08); tone(660,'sine',.12,.1,.06); tone(880,'sine',.1,.12,.12); },
    buy()     { tone(523,'sine',.18,.1); tone(784,'sine',.15,.12,.08); tone(1047,'sine',.12,.2,.18); },
    nope()    { tone(300,'square',.12,.08); tone(200,'square',.1,.12,.07); },
    click()   { tone(900,'sine',.06,.04); },
    notify()  { tone(880,'sine',.1,.1); tone(1108,'sine',.08,.12,.1); },
    earn()    { tone(523,'sine',.12,.07); tone(659,'sine',.1,.07,.06); tone(784,'sine',.1,.12,.12); },
    bank()    { tone(90,'sine',.2,.15); tone(440,'sine',.1,.07,.18); tone(660,'sine',.08,.09,.25); },
    cinema()  { [523,659,784,1047].forEach((f,i)=>tone(f,'sine',.14-.02*i,.22+i*.05,i*.13)); },
    scene()   { tone(440,'sine',.07,.06); tone(330,'sine',.05,.08,.05); },
    credits() { [523,659,784,659,784,1047].forEach((f,i)=>tone(f,'sine',.1,.14,i*.11)); },
    alarm()   { for(let i=0;i<3;i++){tone(880,'square',.1,.08,i*.18);tone(660,'square',.08,.08,i*.18+.09);} },
    robo()    { tone(800,'square',.1,.05); tone(600,'square',.08,.04,.07); tone(1000,'square',.07,.06,.13); },
    dino()    { tone(80,'sawtooth',.22,.3,0,260); tone(130,'sawtooth',.16,.22,.12,70); tone(220,'sawtooth',.1,.18,.28); },
    launch()  { tone(100,'sawtooth',.18,.45,0,900); tone(200,'sawtooth',.12,.35,.08,450); },
    whoosh()  { tone(700,'sine',.1,.2,0,120); tone(350,'sine',.07,.16,.05,80); },
    hit()     { tone(160,'square',.2,.07); tone(80,'sine',.18,.12,.04); },
    boom()    { tone(55,'sawtooth',.28,.3); tone(100,'sawtooth',.2,.24,.06); tone(80,'square',.15,.2,.12); },
    laser()   { tone(2000,'sine',.12,.16,0,280); tone(1400,'sine',.08,.12,.06,180); },
    mystery() { tone(220,'sine',.08,.55); tone(277,'sine',.06,.55,.02); tone(185,'sine',.05,.5,.04); },
    cheer()   { [523,659,784,880,1047,1318].forEach((f,i)=>tone(f,'sine',.13-.01*i,.18,i*.09)); },
    thunder() { tone(45,'sawtooth',.28,.4,0,90); tone(70,'sawtooth',.2,.3,.1,50); tone(35,'sine',.15,.28,.22); },
    power()   { tone(200,'square',.1,.45,0,1300); tone(320,'square',.08,.35,.08,900); },
    reveal()  { [440,554,659,880].forEach((f,i)=>tone(f,'sine',.13,.15,i*.08)); },
    phone()   { for(let i=0;i<2;i++){tone(480,'sine',.1,.4,i*.85);tone(620,'sine',.08,.4,i*.85);} },
    tense()   { tone(185,'sine',.07,.65); tone(233,'sine',.05,.65,.04); tone(146,'sine',.06,.6,.08); },
    swipe()   { tone(700,'sine',.12,.07,0,220); tone(320,'sine',.08,.06,.07,120); },
    chop()    { tone(180,'square',.18,.08); tone(90,'sine',.15,.12,.05); tone(60,'sine',.1,.1,.1); },
    clang()   { tone(1200,'square',.12,.06); tone(800,'square',.1,.08,.04); tone(400,'sine',.08,.15,.08); },
    honk()    { tone(180,'sawtooth',.22,.5,0,140); tone(140,'sawtooth',.18,.45,.08,110); },
    clap()    { for(let i=0;i<6;i++) tone(250+Math.random()*300,'square',.09,.05,i*0.08); },
  };
})();

// ─── BACKGROUND MUSIC ────────────────────────────────────────────────────────
const bgMusic = (() => {
  let ac=null, mg=null, tmr=null, step=0, phraseIdx=0, _muted=false, _currentTrack=0;
  let curStep=250; // ms per 8th note — now changes per track since each has its own BPM
  let realAudio=null; // <audio> element reused for real (recorded) song tracks

  // Note frequencies (C major scale across 3 octaves)
  const C2=65.41,D2=73.42,E2=82.41,F2=87.31,G2=98.00,A2=110.00;
  const G3=196.00,A3=220.00;
  const C4=261.63,D4=293.66,E4=329.63,F4=349.23,G4=392.00,A4=440.00,B4=493.88;
  const C5=523.25,D5=587.33,E5=659.25;
  const r=0; // rest

  // 12 unique phrases — each is 16 steps (4 seconds at 120 BPM)
  // mel=melody  bas=bass  kik=kick  hat=hi-hat  snr=snare
  const P=[
    // 0: Intro — light and simple
    {mel:[E4,r,G4,A4,G4,r,E4,D4,E4,E4,D4,r,C4,D4,E4,r],
     bas:[C2,r,r,r,G2,r,r,r,F2,r,r,r,G2,r,r,r],
     kik:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
     hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
     snr:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    // 1: Main groove — full beat
    {mel:[G4,r,A4,G4,E4,G4,A4,r,G4,r,F4,E4,D4,r,E4,G4],
     bas:[C2,r,r,G2,C2,r,r,r,F2,r,r,r,G2,r,G2,r],
     kik:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
     hat:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
     snr:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    // 2: High bridge — melody up an octave
    {mel:[C5,r,B4,A4,G4,A4,B4,r,C5,r,A4,G4,E4,G4,A4,r],
     bas:[C2,r,r,r,A2,r,r,r,F2,r,r,r,G2,r,r,r],
     kik:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0],
     hat:[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
     snr:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0]},
    // 3: Calm — sparse, resting feel
    {mel:[E4,r,r,D4,C4,r,r,E4,D4,r,r,C4,G3,r,r,A3],
     bas:[C2,r,r,r,r,r,r,r,F2,r,r,r,r,r,r,r],
     kik:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
     hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
     snr:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    // 4: Energetic — fast busy melody
    {mel:[E4,G4,A4,G4,E4,D4,E4,G4,A4,G4,E4,D4,C4,E4,G4,A4],
     bas:[C2,r,r,r,G2,r,r,r,A2,r,r,r,F2,r,G2,r],
     kik:[1,0,0,1,0,0,1,0,1,0,0,0,1,0,0,0],
     hat:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
     snr:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0]},
    // 5: Bass walk — moving bass line
    {mel:[G4,r,r,E4,D4,r,E4,r,G4,A4,G4,r,E4,r,D4,r],
     bas:[C2,D2,E2,F2,G2,A2,G2,F2,E2,F2,G2,A2,F2,G2,A2,G2],
     kik:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
     hat:[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
     snr:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    // 6: Call-response — high notes answer low notes
    {mel:[E5,r,D5,r,C5,r,B4,r,E4,G4,A4,G4,E4,D4,C4,r],
     bas:[C2,r,r,r,G2,r,r,r,F2,r,r,r,C2,r,r,r],
     kik:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0],
     hat:[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
     snr:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    // 7: Build-up — running up the scale with full drums
    {mel:[C4,E4,G4,C5,B4,G4,E4,C4,D4,F4,A4,D5,C5,A4,F4,D4],
     bas:[C2,r,G2,r,G2,r,r,r,D2,r,A2,r,F2,r,G2,r],
     kik:[1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0],
     hat:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
     snr:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,1,1]},
    // 8: Syncopated — beats land off the main pulse
    {mel:[r,E4,r,G4,A4,r,G4,r,r,E4,D4,r,C4,r,D4,E4],
     bas:[r,C2,r,r,G2,r,r,G2,r,F2,r,r,r,F2,G2,r],
     kik:[0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,1],
     hat:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
     snr:[0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0]},
    // 9: Mid section — different key feel (Am)
    {mel:[A4,r,G4,E4,C4,E4,G4,A4,G4,r,E4,D4,C4,D4,E4,r],
     bas:[A2,r,r,r,F2,r,r,r,C2,r,r,r,G2,r,r,r],
     kik:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
     hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
     snr:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    // 10: Outro feel — winding down
    {mel:[G4,E4,D4,C4,r,r,E4,r,G4,E4,D4,C4,r,D4,E4,G4],
     bas:[G2,r,r,C2,r,r,r,r,G2,r,r,C2,r,r,r,r],
     kik:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
     hat:[0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
     snr:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    // 11: Playful — ascending/descending scale run
    {mel:[E4,F4,G4,A4,G4,F4,E4,r,D4,E4,F4,G4,A4,G4,F4,E4],
     bas:[C2,r,r,F2,G2,r,r,r,D2,r,r,A2,G2,r,r,r],
     kik:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
     hat:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
     snr:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
  ];

  // 10-minute arrangement: 150 phrases × 4 seconds = 600 seconds
  // Groups form sections: intro → verse → chorus → bridge → chorus → mid → verse → bridge → chorus → outro
  const CITY_SONG=[
    0,3,0,3,0,0,3,0,                              // intro ~32s
    0,1,0,1,1,0,1,0,0,1,1,0,1,1,0,1,             // verse 1 ~64s
    4,7,4,7,4,11,7,4,                             // chorus 1 ~32s
    1,5,1,5,5,1,5,1,1,5,5,1,5,1,5,5,             // verse 2 bass walk ~64s
    3,6,3,6,6,3,6,3,                             // bridge 1 ~32s
    4,7,11,4,7,4,11,7,4,11,7,4,7,11,4,7,         // chorus 2 ~64s
    9,2,9,2,2,9,9,2,9,2,6,9,2,9,2,6,             // mid section ~64s
    8,1,8,1,1,8,1,8,8,1,8,1,8,8,1,8,             // verse 3 syncopated ~64s
    6,3,6,3,3,6,6,3,                             // bridge 2 ~32s
    7,4,11,7,4,11,7,4,7,11,4,7,4,11,7,4,         // chorus 3 peak ~64s
    5,10,5,10,10,5,10,5,5,10,5,10,10,5,10,5,     // outro verse ~64s
    3,0,3,0,0,3                                  // ending ~24s
  ];

  // Generate a song array of n phrases from a numeric seed
  function makeSong(n,seed){
    let s=seed|0;
    function rng(m){s=(s*1664525+1013904223)|0;return((s>>>16)&0x7fff)%m;}
    const SEC=[[0,3],[1,5],[4,7,11],[9,2,6],[8,1],[3,6],[7,4,11],[5,10],[3,0]];
    const LEN=[4,8,12,16,8,4,16,8,4];
    const song=[];let si=0;
    while(song.length<n){
      const pool=SEC[si%SEC.length];
      const len=Math.min(LEN[si%LEN.length]+rng(4),n-song.length);
      for(let i=0;i<len;i++)song.push(pool[rng(pool.length)]);
      si++;
    }
    return song;
  }

  // 50 tracks: [name, minutes] — each phrase = 4 s, so minutes*15 phrases total
  // Third number in each entry is BPM (beats per minute) — how fast that track's beat is.
  // Higher BPM = faster/more energetic (Speed Run 156), lower BPM = slower/calmer (Quiet Evening 66).
  const TRACK_DEFS=[
    ['City Vibes',10,100],['Night Drive',15,92],['Rush Hour',20,138],['Rainy Day',10,76],
    ['Morning Jog',12,128],['Action Zone',25,150],['Chill Lounge',30,70],['Rooftop Beats',15,112],
    ['Mission Zone',20,140],['Golden Hour',35,88],['Street Life',10,104],['Midnight City',40,78],
    ['Neon Lights',25,132],['Park Walk',12,96],['Skate Park',15,144],['Downtown Groove',20,110],
    ['Late Night',30,74],['Sunrise Ride',10,118],['Arcade Jam',15,148],['Penthouse View',35,84],
    ['Market Day',20,116],['Speed Run',10,156],['Hip Hop City',25,92],['Jazz Cafe',30,90],
    ['Lunch Break',12,100],['Office Hours',15,98],['River Walk',20,86],['Club Night',40,128],
    ['Quiet Evening',10,66],['Galaxy Drive',35,80],['Funk Town',20,112],['Study Hall',15,82],
    ['Neon District',25,134],['Tower Block',30,118],['Beach Cruise',10,100],['Sport Mode',15,152],
    ['Crystal City',40,78],['Bus Stop',12,94],['Night Watch',20,84],['Metro Groove',25,108],
    ['Rain and Jazz',30,88],['Solar Blast',10,150],['Times Square',35,126],['Robot Dance',15,140],
    ['Corner Store',20,98],['Sunset Chill',40,76],['Alley Cats',10,106],['Storm Chaser',25,146],
    ['Cyber City',30,130],['Champion Run',40,144],
  ];

  // step = ms per 8th note for THIS track's own tempo (120 BPM = 250ms, like every track used to be).
  // Phrase count is scaled by bpm too (min*bpm/8), so a faster track doesn't finish early —
  // it fits more (shorter) phrases into the same number of minutes.
  const TRACKS=TRACK_DEFS.map(([name,min,bpm],i)=>({
    name, minutes:min, bpm,
    step: Math.round(60000/bpm/2),
    song: i===0 ? CITY_SONG : makeSong(Math.round(min*bpm/8), i*9999+12345)
  }));

  // Real recorded songs (actual mp3 files, not code-made beeps) — appended after the 50 synth tracks.
  // Path is relative to EXPLOX.html (the page that loads game.js), not to this file.
  const REAL_TRACKS=[
    {name:'🎉 Explox Theme Song', file:'AiGame/explox/music/explox_theme.mp3'},
    {name:'Rise and Shine', file:'AiGame/explox/music/rise_and_shine.mp3'},
    {name:'Up and Away', file:'AiGame/explox/music/up_and_away.mp3'},
    {name:'Shine Like the Morning Sun', file:'AiGame/explox/music/shine_like_the_morning_sun.mp3'},
    {name:'What a Beautiful Day', file:'AiGame/explox/music/what_a_beautiful_day.mp3'},
    {name:'Good World', file:'AiGame/explox/music/good_world.mp3'},
    {name:'Rise Up Today', file:'AiGame/explox/music/rise_up_today.mp3'},
  ];
  REAL_TRACKS.forEach(t=>TRACKS.push({name:t.name, real:true, file:t.file}));

  // 50 instrument presets — mt/bt=osc type, mv/bv=volume, md/bd=dur multiplier
  // kf/kv/kd=kick freq/vol/dur  hf/hc/hv=hihat freq/cutoff/vol  sf/sv=snare freq/vol
  const INSTRUMENTS=[
    {mt:'triangle',mv:0.18,md:1.0, bt:'sine',    bv:0.18,bd:1.6, kf:90, kv:0.35,kd:0.22, hf:4000,hc:3000,hv:0.05, sf:200,sv:0.14}, // 0 City Vibes
    {mt:'sine',    mv:0.14,md:1.3, bt:'sawtooth',bv:0.24,bd:2.2, kf:65, kv:0.42,kd:0.30, hf:3000,hc:2200,hv:0.04, sf:140,sv:0.11}, // 1 Night Drive
    {mt:'square',  mv:0.09,md:0.8, bt:'sawtooth',bv:0.20,bd:1.3, kf:100,kv:0.48,kd:0.18, hf:6000,hc:4500,hv:0.07, sf:270,sv:0.19}, // 2 Rush Hour
    {mt:'triangle',mv:0.12,md:1.4, bt:'sine',    bv:0.14,bd:2.0, kf:75, kv:0.28,kd:0.28, hf:3500,hc:2500,hv:0.03, sf:160,sv:0.10}, // 3 Rainy Day
    {mt:'triangle',mv:0.20,md:0.9, bt:'triangle',bv:0.16,bd:1.5, kf:95, kv:0.32,kd:0.20, hf:4500,hc:3500,hv:0.05, sf:210,sv:0.13}, // 4 Morning Jog
    {mt:'square',  mv:0.11,md:0.7, bt:'sawtooth',bv:0.26,bd:1.2, kf:110,kv:0.50,kd:0.15, hf:7000,hc:5500,hv:0.08, sf:300,sv:0.22}, // 5 Action Zone
    {mt:'sine',    mv:0.16,md:1.5, bt:'sine',    bv:0.16,bd:2.5, kf:70, kv:0.28,kd:0.32, hf:2800,hc:2000,hv:0.03, sf:130,sv:0.10}, // 6 Chill Lounge
    {mt:'sawtooth',mv:0.10,md:0.9, bt:'sine',    bv:0.20,bd:1.8, kf:85, kv:0.38,kd:0.22, hf:5000,hc:3800,hv:0.06, sf:220,sv:0.16}, // 7 Rooftop Beats
    {mt:'square',  mv:0.10,md:0.8, bt:'sawtooth',bv:0.22,bd:1.4, kf:105,kv:0.46,kd:0.17, hf:6500,hc:5000,hv:0.07, sf:280,sv:0.20}, // 8 Mission Zone
    {mt:'triangle',mv:0.22,md:1.2, bt:'triangle',bv:0.18,bd:1.8, kf:80, kv:0.30,kd:0.25, hf:4200,hc:3200,hv:0.04, sf:190,sv:0.13}, // 9 Golden Hour
    {mt:'sawtooth',mv:0.12,md:0.9, bt:'sawtooth',bv:0.22,bd:1.6, kf:92, kv:0.40,kd:0.20, hf:5500,hc:4000,hv:0.06, sf:240,sv:0.17}, // 10 Street Life
    {mt:'sine',    mv:0.13,md:1.4, bt:'sine',    bv:0.20,bd:2.4, kf:60, kv:0.35,kd:0.32, hf:2500,hc:1800,hv:0.03, sf:120,sv:0.09}, // 11 Midnight City
    {mt:'square',  mv:0.10,md:0.8, bt:'sawtooth',bv:0.24,bd:1.4, kf:98, kv:0.44,kd:0.18, hf:7500,hc:6000,hv:0.07, sf:260,sv:0.18}, // 12 Neon Lights
    {mt:'triangle',mv:0.16,md:1.3, bt:'sine',    bv:0.14,bd:2.0, kf:78, kv:0.28,kd:0.26, hf:3800,hc:2800,hv:0.04, sf:175,sv:0.11}, // 13 Park Walk
    {mt:'sawtooth',mv:0.13,md:0.8, bt:'sawtooth',bv:0.25,bd:1.3, kf:102,kv:0.46,kd:0.17, hf:6000,hc:4800,hv:0.08, sf:290,sv:0.21}, // 14 Skate Park
    {mt:'triangle',mv:0.17,md:1.0, bt:'sawtooth',bv:0.21,bd:1.7, kf:88, kv:0.38,kd:0.22, hf:4800,hc:3600,hv:0.06, sf:230,sv:0.16}, // 15 Downtown Groove
    {mt:'sine',    mv:0.12,md:1.6, bt:'sine',    bv:0.15,bd:2.6, kf:65, kv:0.26,kd:0.34, hf:2600,hc:1900,hv:0.03, sf:125,sv:0.09}, // 16 Late Night
    {mt:'triangle',mv:0.21,md:1.1, bt:'triangle',bv:0.17,bd:1.7, kf:87, kv:0.31,kd:0.23, hf:4400,hc:3400,hv:0.05, sf:205,sv:0.13}, // 17 Sunrise Ride
    {mt:'square',  mv:0.13,md:0.7, bt:'square',  bv:0.18,bd:1.2, kf:120,kv:0.45,kd:0.14, hf:8000,hc:6500,hv:0.08, sf:320,sv:0.20}, // 18 Arcade Jam
    {mt:'sine',    mv:0.18,md:1.4, bt:'triangle',bv:0.16,bd:2.2, kf:72, kv:0.30,kd:0.30, hf:3200,hc:2400,hv:0.04, sf:155,sv:0.11}, // 19 Penthouse View
    {mt:'triangle',mv:0.19,md:1.0, bt:'sine',    bv:0.19,bd:1.6, kf:91, kv:0.35,kd:0.21, hf:4100,hc:3100,hv:0.05, sf:198,sv:0.14}, // 20 Market Day
    {mt:'square',  mv:0.11,md:0.6, bt:'sawtooth',bv:0.26,bd:1.1, kf:115,kv:0.50,kd:0.14, hf:7200,hc:5800,hv:0.09, sf:310,sv:0.22}, // 21 Speed Run
    {mt:'triangle',mv:0.14,md:1.1, bt:'sine',    bv:0.28,bd:2.0, kf:75, kv:0.48,kd:0.28, hf:3600,hc:2600,hv:0.05, sf:180,sv:0.12}, // 22 Hip Hop City
    {mt:'sine',    mv:0.17,md:1.3, bt:'triangle',bv:0.16,bd:1.9, kf:76, kv:0.30,kd:0.25, hf:3400,hc:2600,hv:0.04, sf:170,sv:0.12}, // 23 Jazz Cafe
    {mt:'triangle',mv:0.16,md:1.0, bt:'sine',    bv:0.17,bd:1.6, kf:89, kv:0.34,kd:0.22, hf:4300,hc:3300,hv:0.05, sf:210,sv:0.14}, // 24 Lunch Break
    {mt:'sine',    mv:0.14,md:1.3, bt:'sine',    bv:0.15,bd:2.0, kf:74, kv:0.29,kd:0.27, hf:3100,hc:2300,hv:0.04, sf:150,sv:0.11}, // 25 Office Hours
    {mt:'sine',    mv:0.15,md:1.4, bt:'sine',    bv:0.16,bd:2.2, kf:72, kv:0.28,kd:0.29, hf:3000,hc:2200,hv:0.03, sf:145,sv:0.10}, // 26 River Walk
    {mt:'square',  mv:0.10,md:0.7, bt:'sawtooth',bv:0.30,bd:1.3, kf:108,kv:0.52,kd:0.16, hf:7800,hc:6200,hv:0.08, sf:295,sv:0.22}, // 27 Club Night
    {mt:'sine',    mv:0.11,md:1.7, bt:'sine',    bv:0.13,bd:2.8, kf:68, kv:0.24,kd:0.35, hf:2400,hc:1700,hv:0.02, sf:118,sv:0.08}, // 28 Quiet Evening
    {mt:'sine',    mv:0.16,md:1.5, bt:'sine',    bv:0.18,bd:2.4, kf:66, kv:0.32,kd:0.32, hf:2700,hc:2000,hv:0.03, sf:128,sv:0.10}, // 29 Galaxy Drive
    {mt:'sawtooth',mv:0.14,md:0.9, bt:'sawtooth',bv:0.24,bd:1.6, kf:94, kv:0.42,kd:0.21, hf:5200,hc:4000,hv:0.07, sf:245,sv:0.17}, // 30 Funk Town
    {mt:'sine',    mv:0.13,md:1.4, bt:'sine',    bv:0.14,bd:2.1, kf:73, kv:0.27,kd:0.28, hf:3000,hc:2200,hv:0.03, sf:148,sv:0.10}, // 31 Study Hall
    {mt:'square',  mv:0.10,md:0.8, bt:'sawtooth',bv:0.23,bd:1.4, kf:100,kv:0.46,kd:0.18, hf:7000,hc:5500,hv:0.07, sf:270,sv:0.19}, // 32 Neon District
    {mt:'sawtooth',mv:0.12,md:0.9, bt:'sawtooth',bv:0.24,bd:1.5, kf:97, kv:0.44,kd:0.20, hf:5800,hc:4400,hv:0.06, sf:255,sv:0.18}, // 33 Tower Block
    {mt:'triangle',mv:0.20,md:1.2, bt:'sine',    bv:0.15,bd:1.9, kf:82, kv:0.30,kd:0.24, hf:4100,hc:3100,hv:0.04, sf:192,sv:0.12}, // 34 Beach Cruise
    {mt:'square',  mv:0.11,md:0.7, bt:'sawtooth',bv:0.25,bd:1.2, kf:112,kv:0.50,kd:0.15, hf:7000,hc:5600,hv:0.08, sf:305,sv:0.22}, // 35 Sport Mode
    {mt:'sine',    mv:0.19,md:1.3, bt:'triangle',bv:0.15,bd:2.0, kf:71, kv:0.29,kd:0.28, hf:3300,hc:2500,hv:0.04, sf:158,sv:0.11}, // 36 Crystal City
    {mt:'triangle',mv:0.15,md:1.1, bt:'sine',    bv:0.16,bd:1.7, kf:86, kv:0.33,kd:0.23, hf:4000,hc:3000,hv:0.05, sf:202,sv:0.13}, // 37 Bus Stop
    {mt:'sine',    mv:0.13,md:1.5, bt:'sine',    bv:0.19,bd:2.3, kf:67, kv:0.34,kd:0.31, hf:2600,hc:1900,hv:0.03, sf:132,sv:0.10}, // 38 Night Watch
    {mt:'sawtooth',mv:0.13,md:0.9, bt:'sawtooth',bv:0.22,bd:1.6, kf:93, kv:0.40,kd:0.21, hf:5400,hc:4100,hv:0.06, sf:238,sv:0.17}, // 39 Metro Groove
    {mt:'sine',    mv:0.15,md:1.4, bt:'triangle',bv:0.16,bd:2.0, kf:74, kv:0.29,kd:0.28, hf:3100,hc:2300,hv:0.04, sf:163,sv:0.11}, // 40 Rain and Jazz
    {mt:'square',  mv:0.12,md:0.7, bt:'sawtooth',bv:0.27,bd:1.2, kf:113,kv:0.52,kd:0.15, hf:7500,hc:6000,hv:0.09, sf:315,sv:0.23}, // 41 Solar Blast
    {mt:'sawtooth',mv:0.13,md:0.8, bt:'sawtooth',bv:0.25,bd:1.5, kf:99, kv:0.45,kd:0.19, hf:6200,hc:4800,hv:0.07, sf:262,sv:0.19}, // 42 Times Square
    {mt:'square',  mv:0.12,md:0.7, bt:'square',  bv:0.20,bd:1.3, kf:118,kv:0.48,kd:0.14, hf:8000,hc:7000,hv:0.08, sf:330,sv:0.21}, // 43 Robot Dance
    {mt:'triangle',mv:0.17,md:1.1, bt:'sine',    bv:0.17,bd:1.7, kf:88, kv:0.33,kd:0.22, hf:4000,hc:3000,hv:0.05, sf:205,sv:0.13}, // 44 Corner Store
    {mt:'sine',    mv:0.17,md:1.5, bt:'triangle',bv:0.16,bd:2.3, kf:71, kv:0.28,kd:0.31, hf:3100,hc:2300,hv:0.04, sf:152,sv:0.11}, // 45 Sunset Chill
    {mt:'sawtooth',mv:0.14,md:0.8, bt:'sawtooth',bv:0.24,bd:1.5, kf:96, kv:0.42,kd:0.20, hf:5700,hc:4300,hv:0.07, sf:252,sv:0.18}, // 46 Alley Cats
    {mt:'square',  mv:0.12,md:0.7, bt:'sawtooth',bv:0.28,bd:1.2, kf:114,kv:0.52,kd:0.15, hf:7800,hc:6300,hv:0.09, sf:320,sv:0.23}, // 47 Storm Chaser
    {mt:'square',  mv:0.11,md:0.7, bt:'square',  bv:0.22,bd:1.3, kf:116,kv:0.48,kd:0.14, hf:8000,hc:7200,hv:0.08, sf:340,sv:0.21}, // 48 Cyber City
    {mt:'sawtooth',mv:0.15,md:0.8, bt:'sawtooth',bv:0.28,bd:1.5, kf:106,kv:0.50,kd:0.18, hf:6800,hc:5400,hv:0.08, sf:285,sv:0.21}, // 49 Champion Run
  ];

  let curSong=TRACKS[0].song, curInst=INSTRUMENTS[0];

  function note(freq,type,vol,dur){
    if(!freq||_muted) return;
    try{
      const o=ac.createOscillator(),g=ac.createGain();
      o.type=type; o.frequency.value=freq;
      o.connect(g); g.connect(mg);
      g.gain.setValueAtTime(vol,ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+dur*0.8);
      o.start(ac.currentTime); o.stop(ac.currentTime+dur);
    }catch(e){}
  }
  function drum(){
    if(_muted) return;
    try{
      const {kf,kv,kd}=curInst;
      const o=ac.createOscillator(),g=ac.createGain();
      o.type='sine';
      o.frequency.setValueAtTime(kf,ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(0.001,ac.currentTime+kd);
      o.connect(g); g.connect(mg);
      g.gain.setValueAtTime(kv,ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+kd);
      o.start(ac.currentTime); o.stop(ac.currentTime+kd+0.03);
    }catch(e){}
  }
  function hihat(){
    if(_muted) return;
    try{
      const {hf,hc,hv}=curInst;
      const o=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain();
      o.type='square'; o.frequency.value=hf;
      f.type='highpass'; f.frequency.value=hc;
      o.connect(f); f.connect(g); g.connect(mg);
      g.gain.setValueAtTime(hv,ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.03);
      o.start(ac.currentTime); o.stop(ac.currentTime+0.04);
    }catch(e){}
  }
  function snare(){
    if(_muted) return;
    try{
      const {sf,sv}=curInst;
      const o=ac.createOscillator(),g=ac.createGain();
      o.type='triangle'; o.frequency.value=sf;
      o.connect(g); g.connect(mg);
      g.gain.setValueAtTime(sv,ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.1);
      o.start(ac.currentTime); o.stop(ac.currentTime+0.12);
    }catch(e){}
  }
  function tick(){
    const ph=P[curSong[phraseIdx]];
    const dur=curStep/1000;
    note(ph.mel[step],curInst.mt,curInst.mv,dur*curInst.md);
    note(ph.bas[step],curInst.bt,curInst.bv,dur*curInst.bd);
    if(ph.kik[step]) drum();
    if(ph.hat[step]) hihat();
    if(ph.snr[step]) snare();
    step++;
    if(step>=16){ step=0; phraseIdx=(phraseIdx+1)%curSong.length; }
  }
  return {
    start(){
      if(ac) return;
      try{
        ac=new(window.AudioContext||window.webkitAudioContext)();
        const cmp=ac.createDynamicsCompressor();
        mg=ac.createGain(); mg.gain.value=0.35;
        mg.connect(cmp); cmp.connect(ac.destination);
        if(ac.state==='suspended') ac.resume();
        curStep=TRACKS[_currentTrack].step;
        tick();
        tmr=setInterval(tick,curStep);
      }catch(e){}
    },
    toggleMute(){
      _muted=!_muted;
      if(mg) mg.gain.value=_muted?0:0.35;
      if(realAudio) realAudio.muted=_muted;
      return _muted;
    },
    isMuted(){ return _muted; },
    switchTrack(idx){
      if(idx<0||idx>=TRACKS.length) return;
      _currentTrack=idx;
      const t=TRACKS[idx];
      if(t.real){
        // A real song plays through an <audio> element, not the beep engine — stop the beeps first.
        if(tmr){ clearInterval(tmr); tmr=null; }
        if(!realAudio){ realAudio=new Audio(); realAudio.loop=true; }
        if(!realAudio.src.endsWith(t.file)) realAudio.src=t.file;
        realAudio.muted=_muted;
        realAudio.currentTime=0;
        realAudio.play().catch(()=>{});
      }else{
        if(realAudio) realAudio.pause();
        curSong=t.song;
        curInst=INSTRUMENTS[idx];
        curStep=t.step;
        step=0; phraseIdx=0;
        if(ac){ if(tmr) clearInterval(tmr); tmr=setInterval(tick,curStep); } // tempo/track changed — timer must restart at the new speed
      }
    },
    get currentTrack(){ return _currentTrack; },
    get realTime(){ return realAudio ? realAudio.currentTime : 0; }, // for the karaoke display below — how far into the real <audio> we are right now
    get isPlayingReal(){ return !!(realAudio && !realAudio.paused); },
    TRACKS
  };
})();

function toggleBgMusic(){
  const muted=bgMusic.toggleMute();
  const btn=document.getElementById('musicBtn');
  if(btn) btn.textContent=muted?'🔇':'🎵';
}

function openMusicPanel(){
  if(typeof closeSAI==='function') closeSAI();
  const p=document.getElementById('musicPanel');
  if(p) p.style.display='block';
  renderMusicList();
  if(document.pointerLockElement) document.exitPointerLock();
}
function closeMusicPanel(){
  const p=document.getElementById('musicPanel');
  if(p) p.style.display='none';
}
function selectMusicTrack(idx){
  bgMusic.switchTrack(idx);
  renderMusicList();
  // show track name as notification
  const t=bgMusic.TRACKS[idx];
  if(t&&typeof showNotif==='function'){
    const meta = t.real ? '🎤 real song' : '('+t.minutes+' min)';
    showNotif('🎵 Now playing: '+t.name+' '+meta);
  }
}
function renderMusicList(){
  const el=document.getElementById('musicList');
  if(!el) return;
  const ct=bgMusic.currentTrack;
  let html='';
  let shownRealHeader=false; // flips true right before the first t.real===true track, so the header only prints once
  bgMusic.TRACKS.forEach((t,i)=>{
    if(i===0){
      html+=`<div style="color:#888;font-size:10px;font-weight:bold;letter-spacing:2px;margin-bottom:6px;">🎹 SYNTH TRACKS</div>`;
    }
    if(t.real && !shownRealHeader){
      shownRealHeader=true;
      html+=`<div style="color:#ff88cc;font-size:10px;font-weight:bold;letter-spacing:2px;margin:12px 0 6px;padding-top:10px;border-top:1px solid #333;">🎤 REAL SONGS</div>`;
    }
    const a=i===ct;
    const meta = t.real ? '🎤 Real Song' : `${t.minutes}m · ${t.bpm} BPM`;
    const songId = karaokeSongIdForTrack(t);
    const hasLyrics = !!songId;
    const hasTiming = hasLyrics && KARAOKE_SONGS[songId].timing && KARAOKE_SONGS[songId].timing.length;
    const syncBtn = hasLyrics ? `<button onclick="event.stopPropagation();openKaraokeSync(${i})" title="${hasTiming?'Re-sync karaoke timing':'Set up karaoke timing'}" style="background:none;border:1px solid ${hasTiming?'#66ff99':'#ff88cc'};color:${hasTiming?'#66ff99':'#ff88cc'};border-radius:5px;font-size:9px;padding:2px 5px;cursor:pointer;margin-left:6px;white-space:nowrap;">🎤${hasTiming?' ✓':''}</button>` : '';
    html+=`<div onclick="selectMusicTrack(${i})" style="padding:8px 10px;border-radius:8px;margin-bottom:5px;cursor:pointer;background:${a?'rgba(180,0,220,0.25)':'rgba(255,255,255,0.03)'};border:1px solid ${a?'#cc44ff':'#333'};display:flex;justify-content:space-between;align-items:center;user-select:none;">
      <div style="color:${a?'#ee88ff':'#bbb'};font-size:11px;font-weight:bold;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a?'▶ ':''}${t.name}</div>
      <div style="color:#888;font-size:10px;white-space:nowrap;margin-left:6px;display:flex;align-items:center;">${meta}${syncBtn}</div>
    </div>`;
  });
  el.innerHTML=html;
}

// ─── KARAOKE — user's own ask: "make karaoke for each real song so i can post", for the user's
// own original REAL_TRACKS songs (real recorded mp3s, not the 50 synth background tracks) — the
// user wrote and provided the actual lyrics for each one. Keyed by the song's own filename (no
// extension), so it lines up with REAL_TRACKS' existing `file` field with no extra id to keep in
// sync. `timing` (seconds per line, same length as `lines`) starts empty — a real recording has
// no natural "line breaks" to detect automatically, so it's captured for real by a human actually
// listening and tapping along (see the sync tool below), not guessed/evenly-spaced.
const KARAOKE_SONGS = {
  explox_theme: {
    lines: [
      {text:'Verse 1', section:true},
      {text:"Wake up in a city that's all mine,"},
      {text:"Wide open streets, every storefront shine,"},
      {text:"Punch the clock, I'm working for my dream,"},
      {text:"Save it up, buy a house, build my team."},
      {text:"No download, no waiting in line,"},
      {text:"Just click play and you're living your life,"},
      {text:"Three hundred shops and the whole world's mine —"},
      {text:"Welcome to Explox, come inside."},
      {text:'Chorus', section:true},
      {text:"Ex-plox, Ex-plox, a whole life, a whole town,"},
      {text:"Get up, get out, never let me down,"},
      {text:"Ex-plox, Ex-plox, come explore with me,"},
      {text:"Live your best life — wild and free!"},
      {text:'Verse 2', section:true},
      {text:"Forty new friends, and I know 'em all by name,"},
      {text:"Throw a wedding, watch a family change,"},
      {text:"Pack a bag, catch a flight tonight,"},
      {text:"Eight whole countries, and the sky's alight."},
      {text:"Five mini-games when I need a break,"},
      {text:"Build my crew, hold the throne, don't shake,"},
      {text:"Every choice I make, it's really me —"},
      {text:"This is my Explox story."},
      {text:'Chorus', section:true},
      {text:"Ex-plox, Ex-plox, a whole life, a whole town,"},
      {text:"Get up, get out, never let me down,"},
      {text:"Ex-plox, Ex-plox, come explore with me,"},
      {text:"Live your best life — wild and free!"},
      {text:'Bridge', section:true},
      {text:"And the city keeps on turning,"},
      {text:"Even when I'm not around,"},
      {text:"Elders age and pass on gently,"},
      {text:"But my friends — they stick around."},
      {text:"One life, one town, one story growing —"},
      {text:"Built one feature at a time."},
      {text:'Final Chorus', section:true},
      {text:"Ex-plox, Ex-plox, a whole life, a whole town,"},
      {text:"Get up, get out, never let me down,"},
      {text:"Ex-plox, Ex-plox, this whole world is free —"},
      {text:"Come and live it — with me!"},
      {text:'Outro', section:true},
      {text:"Ex... plox."},
    ],
    timing: null,
  },
  rise_and_shine: {
    lines: [
      {text:"Wake up to the morning light,"},
      {text:"Every dream is shining bright."},
      {text:"Take a step, don't be afraid,"},
      {text:"Today's the day that memories are made."},
      {text:"Hands up high, let's feel alive,"},
      {text:"Together we can learn to thrive."},
      {text:"Every heartbeat, every smile,"},
      {text:"Makes this journey all worthwhile."},
      {text:"Sing it loud, let the rhythm play,"},
      {text:"We're dancing through a brand-new day."},
      {text:"Nothing's gonna slow us down,"},
      {text:"We'll wear our dreams like a golden crown."},
      {text:"Oh, we're flying, reaching for the sky,"},
      {text:"With hope inside we'll always try."},
      {text:"Every moment, every chance,"},
      {text:"Is another reason just to dance."},
      {text:"When the clouds begin to fade,"},
      {text:"We'll find the sunshine we've all made."},
      {text:"Step by step, we'll carry on,"},
      {text:"Knowing every night brings dawn."},
      {text:"So clap your hands and sing along,"},
      {text:"Together we are brave and strong."},
      {text:"Every voice can light the way,"},
      {text:"Turning ordinary into extraordinary."},
      {text:"We'll laugh, we'll grow, we'll never stop,"},
      {text:"We'll climb until we reach the top."},
      {text:"The future's calling, clear and true,"},
      {text:"With endless possibilities for me and you."},
      {text:"So let the music fill the air,"},
      {text:"Spread kindness everywhere."},
      {text:"This is our time, our story, our song,"},
      {text:"And together we'll keep moving on!"},
    ],
    timing: [4.7,9.4,14.1,18.8,23.5,27.1,30.9,33.74,36.58,41.28,44.8,47.76,52.8,56.4,60,62.42,80,90.36,94.66,97.32,101.74,106.44,108.16,112.14,116.6,120.36,123.56,127.52,132.04,135.92,138.78,142.26],
  },
  rise_up_today: {
    lines: [
      {text:"The morning sun is shining bright,"},
      {text:"A brand-new chance, a brand-new light."},
      {text:"Every dream is calling out,"},
      {text:"There's no room for fear or doubt."},
      {text:"Step by step, we'll find our way,"},
      {text:"Growing stronger every day."},
      {text:"With every smile and every cheer,"},
      {text:"The future's getting closer here."},
      {text:'Pre-Chorus', section:true},
      {text:"Lift your head, the sky is wide,"},
      {text:"Hope is always by your side."},
      {text:"Take a breath and start to sing,"},
      {text:"Feel the joy that life can bring."},
      {text:'Chorus', section:true},
      {text:"Rise up today, we're on our way,"},
      {text:"Nothing's gonna stop us now."},
      {text:"Sing out loud, stand so proud,"},
      {text:"We'll discover every \"how.\""},
      {text:"Hearts together, hand in hand,"},
      {text:"Brighter than the morning sun."},
      {text:"Every moment, every dream,"},
      {text:"Our adventure has begun!"},
      {text:'Verse 2', section:true},
      {text:"Every mountain starts with one"},
      {text:"Little step toward the sun."},
      {text:"Every river finds the sea,"},
      {text:"Just like you and just like me."},
      {text:"When the road begins to bend,"},
      {text:"Courage is your faithful friend."},
      {text:"Keep believing deep inside,"},
      {text:"Let your hopeful spirit guide."},
      {text:'Bridge', section:true},
      {text:"Whoa-oh-oh, we're reaching higher,"},
      {text:"Lighting every heart with fire."},
      {text:"Whoa-oh-oh, the world can see,"},
      {text:"Together we are wild and free."},
      {text:"Laugh a little, dance around,"},
      {text:"Feel the rhythm, hear the sound."},
      {text:"Every heartbeat, every rhyme,"},
      {text:"This is our amazing time!"},
      {text:'Final Chorus', section:true},
      {text:"Rise up today, we're on our way,"},
      {text:"Nothing's gonna stop us now."},
      {text:"Dream so big, take that leap,"},
      {text:"We'll always find a way somehow."},
      {text:"Through the sunshine, through the rain,"},
      {text:"We'll keep moving, strong and true."},
      {text:"Every sunrise brings a chance"},
      {text:"To build a world that's bright and new."},
      {text:"Shine with kindness, lead with love,"},
      {text:"Share your light with everyone."},
      {text:"Every voice can make a change,"},
      {text:"Every race can still be won."},
      {text:"Raise your hands up to the sky,"},
      {text:"Let your happy spirit fly."},
      {text:"Keep on singing, keep on dreaming,"},
      {text:"Never let your hope run dry."},
      {text:"Side by side we'll always stand,"},
      {text:"Making memories as we go."},
      {text:"Every ending brings beginning,"},
      {text:"Watch tomorrow start to glow."},
      {text:"Rise together, sing forever,"},
      {text:"Let your hearts beat like a drum."},
      {text:"This is where our story starts,"},
      {text:"And the very best will come."},
      {text:"So let's celebrate this journey,"},
      {text:"Every step beneath the sun."},
      {text:"With our dreams and endless laughter,"},
      {text:"The brightest days have just begun!"},
    ],
    timing: null,
  },
  what_a_beautiful_day: {
    lines: [
      {text:"The sun is rising in the sky,"},
      {text:"Painting colors way up high."},
      {text:"Birds are singing, soft and free,"},
      {text:"What a perfect day to be."},
      {text:"Every smile can light the way,"},
      {text:"Every moment starts today."},
      {text:"Open up your heart and see,"},
      {text:"Life's a beautiful melody."},
      {text:'Pre-Chorus', section:true},
      {text:"Leave your worries far behind,"},
      {text:"Hope is waiting there to find."},
      {text:"Take a breath and celebrate,"},
      {text:"Today is simply great."},
      {text:'Chorus', section:true},
      {text:"What a beautiful day,"},
      {text:"Let's laugh and sing away."},
      {text:"Every heartbeat, every smile,"},
      {text:"Makes the journey all worthwhile."},
      {text:"Lift your hands up to the sky,"},
      {text:"Watch your dreams begin to fly."},
      {text:"Every step along the way,"},
      {text:"It's an amazing, amazing day!"},
      {text:'Verse 2', section:true},
      {text:"Friends and family by your side,"},
      {text:"Sharing joy with hearts open wide."},
      {text:"Every little thing can shine,"},
      {text:"Every moment feels just right."},
      {text:"Through the sunshine, through the breeze,"},
      {text:"Happiness comes naturally."},
      {text:"Take the time to slow and see"},
      {text:"All the beauty around me."},
      {text:'Bridge', section:true},
      {text:"Whoa-oh-oh, let your spirit soar,"},
      {text:"Every day can offer more."},
      {text:"Whoa-oh-oh, let's celebrate,"},
      {text:"Love and kindness make us great."},
      {text:"Dance together, sing out loud,"},
      {text:"Stand with joy among the crowd."},
      {text:"Every dream can find its way,"},
      {text:"On this wonderful day."},
      {text:'Final Chorus', section:true},
      {text:"What a beautiful day,"},
      {text:"Let's fill the world with joy today."},
      {text:"Share a laugh and lend a hand,"},
      {text:"Together we can always stand."},
      {text:"Keep on smiling, keep on dreaming,"},
      {text:"Like the stars that softly gleam."},
      {text:"Every sunrise brings a chance"},
      {text:"To sing, to love, to laugh, to dance."},
      {text:"May our hearts be full of cheer,"},
      {text:"Bringing hope to everyone near."},
      {text:"Hold on to the moments bright,"},
      {text:"Fill the world with love and light."},
      {text:"Every morning, every season,"},
      {text:"Gives us all another reason"},
      {text:"To be thankful, strong, and free—"},
      {text:"What a beautiful day to be!"},
    ],
    timing: [0,3.8,6.4,8.76,11.68,14.38,17.08,19.72,23,23,25.59,28.18,30.11,33.96,33.96,37.62,40.35,43.08,45.76,48.44,51.3,53.56,68.08,68.08,71.02,73.96,76.32,78.98,81.9,84.44,87.28,90.7,90.7,93.36,95.26,98.62,101.1,103.98,106.84,109.32,113.78,113.78,116.19,118.61,121.02,123.98,126.58,129.3,131.56,137.26,140.36,142.92,145.48,148.26,150.86,153,158.28],
  },
  shine_like_the_morning_sun: {
    lines: [
      {text:"Sunrise paints the sky with gold,"},
      {text:"A brand-new story to unfold."},
      {text:"Every heartbeat finds its way,"},
      {text:"Brighter than the light of day."},
      {text:"Take a chance, believe it's true,"},
      {text:"There's a world waiting for you."},
      {text:'Pre-Chorus', section:true},
      {text:"Step by step, we'll find our place,"},
      {text:"Running with amazing grace."},
      {text:"Side by side, we'll never fall,"},
      {text:"Together we can have it all."},
      {text:'Chorus', section:true},
      {text:"Hey, let's shine like the morning sun,"},
      {text:"Every dream has just begun."},
      {text:"Lift your voice and sing out loud,"},
      {text:"Standing strong, we're feeling proud."},
      {text:"Through the highs and through the lows,"},
      {text:"Every day our courage grows."},
      {text:"Hands up high, we're reaching far,"},
      {text:"Together we'll become a star."},
      {text:'Verse 2', section:true},
      {text:"Every smile can light the night,"},
      {text:"Turning darkness into light."},
      {text:"Hope is dancing in the air,"},
      {text:"Magic's waiting everywhere."},
      {text:"Keep believing, don't let go,"},
      {text:"Watch your confidence now grow."},
      {text:'Bridge', section:true},
      {text:"When the road is hard to climb,"},
      {text:"We'll keep moving one more time."},
      {text:"Every challenge makes us strong,"},
      {text:"Giving us a brand-new song."},
      {text:'Final Chorus', section:true},
      {text:"Hey, let's shine like the morning sun,"},
      {text:"Celebrate what we've become."},
      {text:"Every moment, every dream,"},
      {text:"Brighter than we've ever seen."},
      {text:"Sing together, hearts as one,"},
      {text:"Our adventure's just begun."},
      {text:"With the future shining bright,"},
      {text:"We'll keep dancing through the light."},
    ],
    timing: null,
  },
  up_and_away: {
    lines: [
      {text:"Got the windows down,"},
      {text:"Driving through the town,"},
      {text:"Feet up on the dash,"},
      {text:"Making quite a splash."},
      {text:"Everyone I see,"},
      {text:"Smiling back at me,"},
      {text:"Everything is right,"},
      {text:"Looking super bright."},
      {text:'Chorus', section:true},
      {text:"Up and away,"},
      {text:"Living for today."},
      {text:"Up and away,"},
      {text:"It's a holiday."},
      {text:"Up and away,"},
      {text:"Nothing in my way."},
      {text:"Up and away,"},
      {text:"Going to stay."},
      {text:'Verse 2', section:true},
      {text:"Found a lucky dime,"},
      {text:"Having such a time,"},
      {text:"Walking on the air,"},
      {text:"Wind is in my hair."},
      {text:"Pick up all the pace,"},
      {text:"Grin across my face,"},
      {text:"Never gonna stop,"},
      {text:"Right here at the top."},
      {text:'Chorus', section:true},
      {text:"Up and away,"},
      {text:"Living for today."},
      {text:"Up and away,"},
      {text:"It's a holiday."},
      {text:"Up and away,"},
      {text:"Nothing in my way."},
      {text:"Up and away,"},
      {text:"Going to stay."},
      {text:'Final Chorus', section:true},
      {text:"Up and away,"},
      {text:"Living for today."},
      {text:"Up and away,"},
      {text:"It's a holiday."},
      {text:"Up and away,"},
      {text:"Nothing in my way."},
      {text:"Up and away,"},
      {text:"Going to stay."},
    ],
    timing: null,
  },
  good_world: {
    lines: [
      {text:"Morning on my skin,"},
      {text:"Soft as bread and rain,"},
      {text:"Bare feet on the steps,"},
      {text:"Everything feels plain."},
      {text:"I see your smile at the door,"},
      {text:"And it opens up my chest."},
      {text:"Even the broken little things,"},
      {text:"Seem to know they're blessed."},
      {text:'Pre-Chorus', section:true},
      {text:"And I breathe in deep,"},
      {text:"Like I found my place."},
      {text:"Small good moments,"},
      {text:"In a crowded space."},
      {text:'Chorus', section:true},
      {text:"What a good world,"},
      {text:"What a good day,"},
      {text:"(What a good world)"},
      {text:"I can feel it stay."},
      {text:"What a good world,"},
      {text:"Right under my hands,"},
      {text:"(What a good world)"},
      {text:"I'm learning to stand."},
      {text:'Verse 2', section:true},
      {text:"Fruit in a blue bowl,"},
      {text:"Wind in the trees,"},
      {text:"A yellow bus hums by,"},
      {text:"Carrying the streets."},
      {text:"Kids on the corner laugh,"},
      {text:"Dogs in the yard."},
      {text:"It all comes back to me,"},
      {text:"Life can be kind, hard."},
      {text:'Pre-Chorus', section:true},
      {text:"And I breathe in deep,"},
      {text:"Like I found my place."},
      {text:"Small good moments,"},
      {text:"In a crowded space."},
      {text:'Chorus', section:true},
      {text:"What a good world,"},
      {text:"What a good day,"},
      {text:"(What a good world)"},
      {text:"I can feel it stay."},
      {text:"What a good world,"},
      {text:"Right under my hands,"},
      {text:"(What a good world)"},
      {text:"I'm learning to stand."},
      {text:'Bridge', section:true},
      {text:"Even when the rain comes,"},
      {text:"Even when I bend,"},
      {text:"There's a soft and steady light,"},
      {text:"Waiting round the bend."},
      {text:'Final Chorus', section:true},
      {text:"What a good world,"},
      {text:"What a good day,"},
      {text:"(What a good world)"},
      {text:"I can feel it stay."},
      {text:"What a good world,"},
      {text:"Right under my hands,"},
      {text:"(What a good world)"},
      {text:"I'm learning to stand."},
    ],
    timing: null,
  },
};
// Pulls any previously-saved timing out of localStorage on first load — so a sync session
// someone did earlier this same browser session (or a prior one) isn't lost on reload.
Object.keys(KARAOKE_SONGS).forEach(id => {
  try {
    const saved = JSON.parse(localStorage.getItem('explox_karaoke_timing_'+id));
    if (Array.isArray(saved)) KARAOKE_SONGS[id].timing = saved;
  } catch(e) {}
});
function karaokeSongIdForTrack(t) {
  if (!t || !t.real) return null;
  const base = t.file.split('/').pop().replace('.mp3','');
  return KARAOKE_SONGS[base] ? base : null;
}

// ─── KARAOKE SYNC TOOL — real timing has to come from a real person actually listening and
// tapping along; nothing about a recorded vocal performance can be auto-detected from silence
// gaps reliably enough to trust for this. Tap (or Space) marks "this line starts now" using the
// audio's own real currentTime, then moves to the next line — same idea as a stopwatch lap timer.
let karaokeSyncAudio = null, karaokeSyncTimer = null;
let karaokeSyncTrackIdx = null, karaokeSyncLineIdx = 0, karaokeSyncCapturedTimes = [];
function openKaraokeSync(trackIdx) {
  const t = bgMusic.TRACKS[trackIdx];
  const songId = karaokeSongIdForTrack(t);
  if (!songId) { showNotif('❌ No lyrics typed in for this song yet.'); return; }
  karaokeSyncTrackIdx = trackIdx;
  karaokeSyncLineIdx = 0;
  karaokeSyncCapturedTimes = [];
  const exportWrap = document.getElementById('karaokeSyncExportWrap');
  if (exportWrap) exportWrap.style.display = 'none';
  const autoStatusEl = document.getElementById('karaokeAutoSyncStatus');
  if (autoStatusEl) autoStatusEl.textContent = '';
  const autoBtn = document.getElementById('karaokeAutoSyncBtn');
  if (autoBtn) autoBtn.disabled = false;
  if (!karaokeSyncAudio) karaokeSyncAudio = new Audio();
  karaokeSyncAudio.pause();
  karaokeSyncAudio.src = t.file;
  karaokeSyncAudio.currentTime = 0;
  karaokeSyncAudio.loop = false;
  document.getElementById('karaokeSyncModal').style.display = 'flex';
  if (karaokeSyncTimer) clearInterval(karaokeSyncTimer);
  karaokeSyncTimer = setInterval(() => {
    const el = document.getElementById('karaokeSyncTime');
    if (el && karaokeSyncAudio) el.textContent = karaokeSyncAudio.currentTime.toFixed(2) + 's';
  }, 100);
  renderKaraokeSync();
}
function closeKaraokeSync() {
  if (karaokeSyncAudio) karaokeSyncAudio.pause();
  if (karaokeSyncTimer) { clearInterval(karaokeSyncTimer); karaokeSyncTimer = null; }
  document.getElementById('karaokeSyncModal').style.display = 'none';
  // The Karaoke tab's own list sits open behind this modal the whole time and was never told to
  // re-check whether a song just got its timing saved — real bug, caught live: saving worked
  // fine, but "Sing Along" stayed grayed out until the whole tab was closed and reopened.
  renderKaraokePanel();
}
function karaokeSyncPlayPause() {
  if (!karaokeSyncAudio) return;
  if (karaokeSyncAudio.paused) karaokeSyncAudio.play().catch(()=>{});
  else karaokeSyncAudio.pause();
  renderKaraokeSync();
}
// User's own real bug report: "it needs to follow the song speed, not you" — nothing stopped a
// mark from being captured while the song was PAUSED (always currentTime, whatever it was frozen
// at) or two marks landing within the same fraction of a second of each other (an accidental
// double-tap) — either way the saved timing would reflect however fast/inconsistent the TAPPING
// was, not the real song. Both are now hard-blocked here instead of silently saving bad data.
const KARAOKE_MIN_LINE_GAP_SEC = 0.3;
function karaokeSyncMarkLine() {
  const song = KARAOKE_SONGS[karaokeSongIdForTrack(bgMusic.TRACKS[karaokeSyncTrackIdx])];
  if (karaokeSyncLineIdx >= song.lines.length) return;
  if (karaokeSyncAudio.paused) { showNotif('▶️ Press Play first — timing only counts while the song is actually playing!'); return; }
  const now = karaokeSyncAudio.currentTime;
  const lastTime = karaokeSyncLineIdx > 0 ? karaokeSyncCapturedTimes[karaokeSyncLineIdx-1] : -Infinity;
  if (now - lastTime < KARAOKE_MIN_LINE_GAP_SEC) { showNotif(`⏱️ Too fast — wait for the real line before marking the next one.`); return; }
  karaokeSyncCapturedTimes[karaokeSyncLineIdx] = Math.round(now * 100) / 100;
  karaokeSyncLineIdx++;
  renderKaraokeSync();
}
function karaokeSyncUndoLine() {
  if (karaokeSyncLineIdx <= 0) return;
  karaokeSyncLineIdx--;
  karaokeSyncCapturedTimes.splice(karaokeSyncLineIdx, 1);
  renderKaraokeSync();
}
// Real, repeated friction found across several users' redo attempts: fixing "everything after
// line N" (e.g. after an Auto-Sync draft goes bad partway through) meant clicking Undo dozens of
// times, THEN re-listening to the whole song from 0:00 again just to get back to the right spot
// before tapping could resume — tedious enough that people gave up and re-ran Auto-Sync instead
// (which can't help, since it's the same AI looking at the same song and gets the same result).
// One cut does the trim instantly, and seeks the real audio right back to that spot.
function karaokeSyncCutToLine() {
  const input = document.getElementById('karaokeSyncCutInput');
  const n = input ? parseInt(input.value, 10) : NaN;
  if (!Number.isFinite(n) || n < 0 || n > karaokeSyncCapturedTimes.length) {
    showNotif('❌ Enter a number between 0 and ' + karaokeSyncCapturedTimes.length + '.');
    return;
  }
  karaokeSyncCapturedTimes = karaokeSyncCapturedTimes.slice(0, n);
  karaokeSyncLineIdx = n;
  if (karaokeSyncAudio) karaokeSyncAudio.currentTime = n > 0 ? Math.max(0, karaokeSyncCapturedTimes[n - 1] - 1.5) : 0;
  renderKaraokeSync();
}
function karaokeSyncSave() {
  const songId = karaokeSongIdForTrack(bgMusic.TRACKS[karaokeSyncTrackIdx]);
  KARAOKE_SONGS[songId].timing = karaokeSyncCapturedTimes.slice();
  localStorage.setItem('explox_karaoke_timing_'+songId, JSON.stringify(karaokeSyncCapturedTimes));
  showNotif('💾 Karaoke timing saved for ' + bgMusic.TRACKS[karaokeSyncTrackIdx].name + '!');
  // Saved timing only lives in THIS browser's localStorage — it won't reach anyone else's device
  // on its own. Exporting it as copyable text lets the one person who did the real tapping (an
  // actual listen-and-tap can't be done by anyone/anything else) hand it off once, so it can be
  // baked into KARAOKE_SONGS as the shipped default — after that, nobody else ever has to sync it.
  const exportBox = document.getElementById('karaokeSyncExportBox');
  const exportWrap = document.getElementById('karaokeSyncExportWrap');
  if (exportBox && exportWrap) {
    exportBox.value = songId + ': ' + JSON.stringify(karaokeSyncCapturedTimes);
    exportWrap.style.display = 'block';
  }
  renderKaraokeSync();
}
function renderKaraokeSync() {
  const t = bgMusic.TRACKS[karaokeSyncTrackIdx];
  const song = KARAOKE_SONGS[karaokeSongIdForTrack(t)];
  document.getElementById('karaokeSyncTitle').textContent = '🎤 Sync: ' + t.name;
  document.getElementById('karaokeSyncPlayBtn').textContent = (karaokeSyncAudio && !karaokeSyncAudio.paused) ? '⏸ Pause' : '▶ Play';
  const upcoming = song.lines.slice(karaokeSyncLineIdx, karaokeSyncLineIdx+3).map((l,i) =>
    `<div style="font-size:${i===0?'18px':'13px'};color:${i===0?'#ffdd44':'#888'};margin-bottom:4px;">${l.section?'— '+l.text+' —':l.text}</div>`
  ).join('');
  document.getElementById('karaokeSyncUpcoming').innerHTML = upcoming || '<div style="color:#6f6;">✅ All lines marked!</div>';
  document.getElementById('karaokeSyncProgress').textContent = `${karaokeSyncLineIdx} / ${song.lines.length} lines marked`;
  document.getElementById('karaokeSyncSaveBtn').style.display = karaokeSyncLineIdx >= song.lines.length ? 'block' : 'none';
  document.getElementById('karaokeSyncMarkBtn').style.display = karaokeSyncLineIdx < song.lines.length ? 'block' : 'none';
  if (karaokeSyncLineIdx < song.lines.length) {
    const exportWrap = document.getElementById('karaokeSyncExportWrap');
    if (exportWrap) exportWrap.style.display = 'none';
  }
}

// ─── KARAOKE AUTO-SYNC (AI-assisted, Beta) — user asked "can an AI do this" after learning the
// tap tool takes a real listen from a real person every time. A real free option exists: a real
// speech-recognition AI (Whisper tiny, via transformers.js) that runs fully in the browser, no
// account/API key/server needed. Runs in a Web Worker (karaoke-worker.js) so the heavy AI work
// never blocks the game's own render loop — confirmed via direct testing that running it on the
// main thread instead froze the whole tab for 90+ seconds on one song.
// Never trusts what the AI THINKS the words are (it audibly mishears the made-up word "Explox"
// as "Xbox" — a real, expected mishearing, not a bug) — only uses WHEN it heard each word, then
// lines those timestamps up against the song's own already-known-correct lyrics.
let karaokeAutoSyncWorker = null;
let karaokeAutoSyncReqId = 0;

function karaokeNormalizeWord(w) {
  return (w || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Sounds Whisper commonly hallucinates during instrumental/unclear audio instead of real words.
// Never dropped blindly, though — a song is free to actually use one of these as a real lyric
// (e.g. an "Oh, we're flying" ad-lib), so karaokeAlignWordsToLines only drops one when the song's
// OWN real lyrics never use it, checked fresh per song rather than off one fixed word list alone.
const KARAOKE_FILLER_SOUNDS = new Set(['uh','um','umm','erm','ah','ahh','oh','hm','hmm','mm','mmm','huh']);

function karaokeAlignWordsToLines(chunks, lines) {
  const lineWords = lines.map(l => l.section ? [] : l.text.split(/\s+/).map(karaokeNormalizeWord).filter(Boolean));
  const realWords = new Set(lineWords.flat());
  // Real, measured AI quirk: on instrumental/ad-lib stretches it can get "stuck" and repeat the
  // same filler word (like "uh" or "oh") hundreds of times in a row instead of real lyrics — one
  // test song hit 27 straight seconds of repeated "uh". Dropping known filler sounds the song
  // itself never actually uses, then collapsing any remaining immediate repeats down to one,
  // keeps that noise from burying the real words or eating up the search window below. Chunks can
  // also come back slightly out of time order around those glitches, so they're sorted first.
  let srcWords = [];
  for (const c of chunks) {
    const w = karaokeNormalizeWord(c.text);
    const start = Array.isArray(c.timestamp) ? c.timestamp[0] : null;
    if (w && start != null && !(KARAOKE_FILLER_SOUNDS.has(w) && !realWords.has(w))) srcWords.push({ word: w, start });
  }
  srcWords.sort((a, b) => a.start - b.start);
  srcWords = srcWords.filter((w, i) => i === 0 || w.word !== srcWords[i - 1].word);
  const timing = new Array(lines.length).fill(null);
  let srcPos = 0, lastTime = -1;
  const WINDOW = 180;
  for (let li = 0; li < lines.length; li++) {
    const words = lineWords[li];
    if (!words.length) continue; // section header — filled in below from the next real line
    // Comparing several words (not just the first 1-2) and only requiring most of them to match
    // is what makes this survive individual mishearings — one wrong word out of 6 doesn't sink
    // the whole line, but the surrounding correct ones still pin down the right spot.
    const need = Math.min(6, words.length);
    const threshold = Math.max(2, Math.ceil(need * 0.6));
    let bestIdx = -1, bestScore = 0;
    const limit = Math.min(srcWords.length - 1, srcPos + WINDOW);
    for (let i = srcPos; i <= limit; i++) {
      if (srcWords[i].start <= lastTime) continue; // never match a spot earlier than the last accepted line
      let score = 0;
      for (let j = 0; j < need && i + j < srcWords.length; j++) if (srcWords[i + j].word === words[j]) score++;
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }
    if (bestIdx >= 0 && bestScore >= threshold) {
      timing[li] = srcWords[bestIdx].start;
      srcPos = bestIdx + 1;
      lastTime = timing[li];
    }
  }
  // Lines the AI couldn't confidently match (garbled audio, or it just misheard too much) get an
  // interpolated guess between the nearest confident neighbors, instead of being left blank.
  let i = 0;
  while (i < timing.length) {
    if (timing[i] != null) { i++; continue; }
    let j = i;
    while (j < timing.length && timing[j] == null) j++;
    const startTime = i === 0 ? 0 : timing[i - 1];
    const endTime = j < timing.length ? timing[j] : startTime + (j - i + 1) * 3;
    const span = j - i + 1;
    for (let k = i; k < j; k++) timing[k] = startTime + (endTime - startTime) * ((k - i + 1) / span);
    i = j;
  }
  for (let li = 0; li < lines.length; li++) {
    if (lines[li].section) timing[li] = li + 1 < lines.length ? timing[li + 1] : (timing[li - 1] || 0);
  }
  return timing.map(t => Math.round((t || 0) * 100) / 100);
}

// AudioContext only exists on the main thread, not inside a Worker — decoding has to happen
// here, then the raw sound (resampled to the 16kHz mono the AI model expects) gets handed off.
async function karaokeDecodeAudioTo16k(url) {
  const resp = await fetch(url);
  const arrayBuffer = await resp.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  const targetRate = 16000;
  const offlineCtx = new OfflineAudioContext(1, Math.ceil(decoded.duration * targetRate), targetRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start(0);
  const rendered = await offlineCtx.startRendering();
  ctx.close();
  return rendered.getChannelData(0);
}

async function karaokeAutoSyncStart() {
  if (karaokeSyncTrackIdx == null) return;
  const t = bgMusic.TRACKS[karaokeSyncTrackIdx];
  const songId = karaokeSongIdForTrack(t);
  if (!songId) return;
  const song = KARAOKE_SONGS[songId];
  const statusEl = document.getElementById('karaokeAutoSyncStatus');
  const btn = document.getElementById('karaokeAutoSyncBtn');
  if (btn) btn.disabled = true;
  if (karaokeSyncAudio) karaokeSyncAudio.pause();
  if (statusEl) statusEl.textContent = '🤖 Reading the audio file...';
  if (!karaokeAutoSyncWorker) karaokeAutoSyncWorker = new Worker('AiGame/explox/karaoke-worker.js', { type: 'module' });
  const reqId = ++karaokeAutoSyncReqId;
  const startedTrackIdx = karaokeSyncTrackIdx;
  let audioData;
  try {
    audioData = await karaokeDecodeAudioTo16k(t.file);
  } catch (err) {
    if (statusEl) statusEl.textContent = '❌ Could not read the audio file: ' + err.message;
    if (btn) btn.disabled = false;
    return;
  }
  if (karaokeSyncTrackIdx !== startedTrackIdx) return; // user switched songs while decoding
  const onMsg = (e) => {
    const d = e.data;
    if (d.requestId !== reqId) return;
    if (d.type === 'progress') {
      if (statusEl && d.progress && d.progress.status === 'progress') {
        statusEl.textContent = `🤖 Downloading the AI model... ${Math.round(d.progress.progress || 0)}% (only happens once)`;
      }
    } else if (d.type === 'done') {
      karaokeAutoSyncWorker.removeEventListener('message', onMsg);
      if (karaokeSyncTrackIdx !== startedTrackIdx) return; // user moved to a different song's sync while this was running
      karaokeSyncCapturedTimes = karaokeAlignWordsToLines(d.chunks, song.lines);
      karaokeSyncLineIdx = song.lines.length;
      if (statusEl) statusEl.textContent = '✅ AI guess is ready below — press ▶ Play and check it before saving! It can be a little off, especially near the start.';
      if (btn) btn.disabled = false;
      renderKaraokeSync();
    } else if (d.type === 'error') {
      karaokeAutoSyncWorker.removeEventListener('message', onMsg);
      if (statusEl) statusEl.textContent = '❌ Auto-sync failed: ' + d.message;
      if (btn) btn.disabled = false;
    }
  };
  karaokeAutoSyncWorker.addEventListener('message', onMsg);
  if (statusEl) statusEl.textContent = '🤖 Listening to the whole song... this can take a minute or two.';
  karaokeAutoSyncWorker.postMessage({ audioData, requestId: reqId }, [audioData.buffer]);
}

// ─── KARAOKE PLAYBACK — the actual sing-along display, live during normal music playback (not
// just inside the sync tool). Finds the current line by comparing bgMusic.realTime against the
// synced timing array — the same "last timestamp <= now" search a real video player uses to pick
// subtitles. Ticked from animate() alongside everything else.
let karaokeDisplayOn = true;
function toggleKaraokeDisplay() { karaokeDisplayOn = !karaokeDisplayOn; tickKaraokeDisplay(); }
function tickKaraokeDisplay() {
  const hud = document.getElementById('karaokeHud');
  if (!hud) return;
  const t = bgMusic.TRACKS[bgMusic.currentTrack];
  const songId = karaokeSongIdForTrack(t);
  const song = songId && KARAOKE_SONGS[songId];
  if (!karaokeDisplayOn || !song || !song.timing || !song.timing.length || !bgMusic.isPlayingReal) {
    hud.style.display = 'none';
    return;
  }
  const now = bgMusic.realTime;
  let idx = -1;
  for (let i=0; i<song.timing.length; i++) { if (song.timing[i] <= now) idx = i; else break; }
  if (idx < 0) { hud.style.display = 'none'; return; }
  const line = song.lines[idx];
  const nextLine = song.lines[idx+1];
  hud.style.display = 'block';
  document.getElementById('karaokeCurrentLine').textContent = line.section ? '♪ ' + line.text + ' ♪' : line.text;
  document.getElementById('karaokeNextLine').textContent = nextLine ? (nextLine.section ? '' : nextLine.text) : '';
}
// ─── KARAOKE TAB — user's own ask: "make it easier to find/start" than a small 🎤 icon buried in
// the general Music list. A real dedicated tab/panel, same pattern as the Music tab, listing only
// the songs that actually have lyrics loaded, with one-click Sing Along (starts the song AND
// makes sure the live lyrics HUD is on) separate from the sync tool (for fixing/redoing timing).
function openKaraokePanel() {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('karaokePanel').style.display = 'block';
  renderKaraokePanel();
}
function closeKaraokePanel() {
  document.getElementById('karaokePanel').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function karaokeSingAlong(trackIdx) {
  karaokeDisplayOn = true;
  selectMusicTrack(trackIdx);
  closeKaraokePanel();
}
function renderKaraokePanel() {
  const list = document.getElementById('karaokeList');
  if (!list) return;
  const songTracks = bgMusic.TRACKS.map((t,i)=>({t,i})).filter(({t}) => karaokeSongIdForTrack(t));
  if (!songTracks.length) { list.innerHTML = '<div style="color:#789;font-size:12px;">No songs have lyrics loaded yet.</div>'; return; }
  list.innerHTML = songTracks.map(({t,i}) => {
    const songId = karaokeSongIdForTrack(t);
    const hasTiming = KARAOKE_SONGS[songId].timing && KARAOKE_SONGS[songId].timing.length;
    const isCurrent = i === bgMusic.currentTrack && bgMusic.isPlayingReal;
    return `<div class="shopItem">
      <div class="siName">${isCurrent?'▶ ':''}${t.name}</div>
      <div class="siCost">${hasTiming ? '✅ Ready to sing along' : '⏱️ Needs timing set up first'}</div>
      <div style="display:flex;gap:6px;">
        <button class="shopBtn" style="flex:1;${hasTiming?'':'opacity:0.5;'}" ${hasTiming?'':'disabled'} onclick="karaokeSingAlong(${i})">🎤 Sing Along</button>
        <button class="shopBtn" style="flex:1;background:#5a2a5a;" onclick="openKaraokeSync(${i})">⏱ ${hasTiming?'Re-sync':'Set Up Timing'}</button>
      </div>
    </div>`;
  }).join('');
}

// ─── MULTI-ACCOUNT SYSTEM ────────────────────────────────────────────────────
let currentUser = null;

function getUserData(name) { return JSON.parse(localStorage.getItem('explox_user_' + name) || '{}'); }

function saveCurrentUser() {
  if(!currentUser) return;
  const data = {
    bankBalance: bankBalance,
    bankEliteBalance: bankEliteBalance,
    inventory:   playerInventory,
    safeBalance:   safeBalance,
    safeCombo:     safeCombo,
    safeInventory: safeInventory,
    hat:playerHat, hair:playerHair, shirt:playerShirt, pants:playerPants, shoes:playerShoes,
    profilePic: playerProfilePic, shirtPaint: playerShirtPaint,
    skin:playerColors.skin, shirtColor:playerColors.shirt,
    pantsColor:playerColors.pants, shoesColor:playerColors.shoes,
    hairColor:playerColors.hair, name:playerName, sip:sipDollars, wood:woodCount, scrap:scrapMetal, ownedLand:ownedLand, plotBuildings:plotBuildings,
    landInvites:landInvites, landColor:landColor, landForSale:landForSale, pendingNotices:pendingNotices,
    tubeLikes:tubeLikes, tubeViews:tubeViews, tubeBaseComments:tubeBaseComments, myUploads:myUploads, mySubscribers:mySubscribers, carLocation:carLocation, installedApps:installedApps,
    weapon:playerWeapon, ownedWeapons:ownedWeapons, ownedItems:ownedItems, ownedSkins:ownedSkins,
    armor:playerArmor, ownedArmor:ownedArmor,
    alignment:alignment, wanted:wantedLevel,
    birthday: playerBirthday, ownedCars: ownedCars, ownedComputers: ownedComputers,
    ownedStore: ownedStore, ownedFurniture: ownedFurniture, ownedHouseFurniture: ownedHouseFurniture,
    storeStock: storeStock, storePrices: storePrices,
    storeSalesCount: storeSalesCount, storeStockOrder: storeStockOrder,
    storeAdLevel: storeAdLevel, ownedStaff: ownedStaff,
    friends: friends, houseGuest: houseGuest,
    marriages: marriages, children: children,
    elderLifespans: elderLifespans, elderPassed: elderPassed,
    lastBirthdayGiftDate: lastBirthdayGiftDate,
    deadNPCs: deadNPCs,
    buddyOwned: buddyOwned, buddySpecies: buddySpecies, buddyName: buddyName, buddyColors: buddyColors,
    activeAddOns: activeAddOns,
    playTimeSeconds: playTimeSeconds, lastGrowthStageId: lastGrowthStageId, eliteCoins: eliteCoins,
    familyKidAdopted: familyKidAdopted, familyKidId: familyKidId, familyKidName: familyKidName, familyKidPlayTime: familyKidPlayTime,
    familyKidInSchool: familyKidInSchool, familyKidSmarts: familyKidSmarts, familyKidLastStageId: familyKidLastStageId,
    lastAllowanceAt: lastAllowanceAt,
    unpaidBills: unpaidBills, lastBillCheck: lastBillCheck, hasSeenGuide: hasSeenGuide,
    myStocks: myStocks, ffaKills: ffaKills,
    eliteLevel: eliteLevel, activeQuests: activeQuests,
    lifetimeRobotKills: lifetimeRobotKills, lifetimeRogueKills: lifetimeRogueKills, lifetimeWarHits: lifetimeWarHits,
    killerDefeats: killerDefeats, pendingEarnings: pendingEarnings,
    peakSip: peakSip, peakElite: peakElite, totalQuestsCompleted: totalQuestsCompleted, totalBossesDefeated: totalBossesDefeated
  };
  localStorage.setItem('explox_user_' + currentUser, JSON.stringify(data));
  localStorage.setItem('explox_current_user', currentUser);
  if(serverMode === 'online') {
    // Fire-and-forget: never let a slow/dead server hold up gameplay, which
    // autosaves via this function constantly. localStorage above is always
    // the safety net.
    fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/user/' + encodeURIComponent(currentUser), {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data)
    }, 4000).catch(()=>{});
  }
}

function setBtn(groupId, val) {
  document.getElementById(groupId).querySelectorAll('.optBtn').forEach(b => {
    b.classList.toggle('selected', b.dataset.val === val);
  });
}

function getUsers() {
  return JSON.parse(localStorage.getItem('explox_users') || '[]');
}
function saveUsers(arr) {
  localStorage.setItem('explox_users', JSON.stringify(arr));
}
function getPw(name)     { return localStorage.getItem('explox_pw_' + name) || ''; }
function setPw(name, pw) { localStorage.setItem('explox_pw_' + name, pw); }

function hashPassword(pw) {
  let h = 5381;
  for(let i = 0; i < pw.length; i++) h = (Math.imul(h, 33) ^ pw.charCodeAt(i)) >>> 0;
  return 'h_' + h.toString(16).padStart(8,'0') + '_' + pw.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
}

// ─── ONLINE SERVER MODE ──────────────────────────────────────────────────────
// "Online" points at a temporary server the player can run on their own PC (see
// explox/server/). Free tunnel services hand out a NEW random address every
// time the server starts (that's what "temporary" means), so we can't hardcode
// one — instead a link like ?server=https://xxxx.example.com auto-fills it (the
// host shares that link), and it's remembered from then on until it's changed.
// When there's no server, or it's off, we fall back to the always-available
// Offline mode, which is exactly the local-only behavior this file always had.
const EXPLOX_DEFAULT_SERVER_URL = 'https://explox-server.onrender.com';
let serverMode = localStorage.getItem('explox_mode') || 'offline';
let EXPLOX_ONLINE_URL = localStorage.getItem('explox_server_url') || EXPLOX_DEFAULT_SERVER_URL;
if (EXPLOX_ONLINE_URL.includes('trycloudflare.com')) {
  // Old family-PC tunnel address, now retired — fall back to the permanent server.
  EXPLOX_ONLINE_URL = EXPLOX_DEFAULT_SERVER_URL;
  localStorage.setItem('explox_server_url', EXPLOX_ONLINE_URL);
}
(function seedServerUrlFromLink() {
  const fromLink = new URLSearchParams(location.search).get('server');
  if (fromLink) {
    EXPLOX_ONLINE_URL = fromLink.trim().replace(/\/+$/, '');
    localStorage.setItem('explox_server_url', EXPLOX_ONLINE_URL);
  }
})();

async function fetchWithTimeout(url, opts, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs || 4000);
  try {
    return await fetch(url, Object.assign({}, opts, { signal: ctrl.signal }));
  } finally {
    clearTimeout(t);
  }
}

function showServerMsg(text) {
  const el = document.getElementById('serverStatusMsg');
  if(el) el.textContent = text || '';
}

function updateServerModeButtons() {
  const onBtn  = document.getElementById('onlineModeBtn');
  const offBtn = document.getElementById('offlineModeBtn');
  const urlBox = document.getElementById('serverUrlInput');
  if(onBtn)  onBtn.classList.toggle('modeActive', serverMode === 'online');
  if(offBtn) offBtn.classList.toggle('modeActive', serverMode === 'offline');
  if(urlBox) {
    // Always hidden now — there's a real default server (EXPLOX_DEFAULT_SERVER_URL), so
    // players never need to see or paste an address. Value stays synced for setServerMode()'s
    // read of it, and a ?server= link (or the empty-value fallback below) can still override it.
    urlBox.style.display = 'none';
    if(document.activeElement !== urlBox) urlBox.value = EXPLOX_ONLINE_URL;
  }
}

async function setServerMode(mode) {
  if(mode === 'online') {
    const urlBox = document.getElementById('serverUrlInput');
    const typed  = urlBox ? urlBox.value.trim().replace(/\/+$/, '') : '';
    if(!typed) {
      urlBox.style.display = 'block'; // reveal the address box (serverMode hasn't flipped to 'online' yet, so updateServerModeButtons() alone wouldn't show it)
      showServerMsg('👉 Paste the server address a friend shared with you, then click ONLINE again.');
      return;
    }
    EXPLOX_ONLINE_URL = typed;
    localStorage.setItem('explox_server_url', EXPLOX_ONLINE_URL);
    showServerMsg('🔄 Checking server...');
    let up = false;
    try { up = (await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/health', {}, 4000)).ok; } catch(e) {}
    if(!up) {
      showServerMsg('😴 Sorry, the server is currently off. Please come again later or play Offline!');
      return;
    }
  }
  serverMode = mode;
  localStorage.setItem('explox_mode', mode);
  showServerMsg('');
  updateServerModeButtons();
  loadLoginScreen();
}

async function loadLoginScreen() {
  updateServerModeButtons();
  const list = document.getElementById('accountList');
  document.getElementById('newAccName').value = '';
  document.getElementById('newAccPw').value   = '';

  let names, sipFor, picFor;
  if(serverMode === 'online') {
    list.innerHTML = '<div id="noAccounts">Loading accounts...</div>';
    let serverUsers = null;
    try {
      const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/users', {}, 4000);
      if(r.ok) serverUsers = await r.json();
    } catch(e) {}
    if(!serverUsers) {
      showServerMsg('😴 Sorry, the server is currently off. Please come again later or play Offline!');
      list.innerHTML = '<div id="noAccounts">Server unavailable — try Offline.</div>';
      return;
    }
    names  = serverUsers.map(u => u.name);
    sipFor = name => { const u = serverUsers.find(x => x.name === name); return u ? u.sip : 0; };
    // The online account list only gets {name, sip} from the server (see /api/users) — showing a
    // real picture there would mean sending every account's full picture down on every page load,
    // so this stays offline-only for now, where the picture's already sitting in localStorage for free.
    picFor = () => null;
  } else {
    names  = getUsers();
    sipFor = name => { const d = getUserData(name); return d.sip !== undefined ? d.sip : 0; };
    picFor = name => { const d = getUserData(name); return d.profilePic || null; };
  }

  if(names.length === 0) {
    list.innerHTML = '<div id="noAccounts">No accounts yet — create one below!</div>';
  } else {
    list.innerHTML = names.map(name => {
      const sip = sipFor(name).toLocaleString();
      const pic = picFor(name);
      const thumb = pic
        ? `<img src="${pic}" style="width:32px;height:32px;border-radius:6px;image-rendering:pixelated;flex-shrink:0;">`
        : '';
      return `<div class="accountCard" onclick="loginAs('${name}')">
        ${thumb}
        <div class="acInfo">
          <div class="acName">${name}</div>
          <div class="acSip">💰 ${sip} S.I.P.</div>
        </div>
        <button class="acDel" onclick="event.stopPropagation();deleteAccount('${name}')">✕</button>
      </div>`;
    }).join('');
  }
}

async function createAccount() {
  try {
    const name = document.getElementById('newAccName').value.trim();
    const pw   = document.getElementById('newAccPw').value;
    if(!name) { showBigMsg('⚠️ Enter a name first!'); return; }
    if(!pw)   { showBigMsg('⚠️ Enter a password too!'); return; }
    const pwHash = hashPassword(pw);

    if(serverMode === 'online') {
      let res;
      try {
        const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/signup', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ name, pw: pwHash })
        }, 4000);
        res = r.ok ? await r.json() : { ok:false, error: r.status === 409 ? 'taken' : 'error' };
      } catch(e) { res = null; }
      if(!res) { showServerMsg('😴 Sorry, the server is currently off. Please come again later or play Offline!'); return; }
      if(!res.ok) { showBigMsg(res.error === 'taken' ? '⚠️ That name is taken!' : '❌ Server error, try again.'); return; }
      setPw(name, pwHash); // local cache so the same device can still log in if Offline later
      await doLogin(name);
      return;
    }

    const users = getUsers();
    if(users.includes(name)) { showBigMsg('⚠️ That name is taken!'); return; }
    users.push(name);
    saveUsers(users);
    setPw(name, pwHash);
    doLogin(name);
  } catch(e) {
    showBigMsg('❌ Error: ' + e.message);
    console.error('createAccount crash:', e);
  }
}

function deleteAccount(name) {
  if(!confirm('Delete account "' + name + '"? This cannot be undone.')) return;
  if(serverMode === 'online') {
    fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/user/' + encodeURIComponent(name), { method:'DELETE' }, 4000)
      .catch(()=>{})
      .finally(() => loadLoginScreen());
    return;
  }
  const users = getUsers().filter(u => u !== name);
  saveUsers(users);
  localStorage.removeItem('explox_user_' + name);
  localStorage.removeItem('explox_pw_' + name);
  loadLoginScreen();
}

let _pendingLogin = null;
function loginAs(name) {
  _pendingLogin = name;
  document.getElementById('pwModalName').textContent  = name;
  document.getElementById('pwModalInput').value       = '';
  document.getElementById('pwModalError').textContent = '';
  document.getElementById('pwModal').style.display    = 'flex';
  setTimeout(() => document.getElementById('pwModalInput').focus(), 50);
}
async function submitPassword() {
  const entered = document.getElementById('pwModalInput').value;
  if(!entered) {
    document.getElementById('pwModalError').textContent = '❌ Enter your password!';
    return;
  }
  const enteredHash = hashPassword(entered);

  if(serverMode === 'online') {
    let res;
    try {
      const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/login', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name: _pendingLogin, pw: enteredHash })
      }, 4000);
      res = r.ok ? await r.json() : { ok:false };
    } catch(e) { res = null; }
    if(!res) {
      document.getElementById('pwModal').style.display = 'none';
      showServerMsg('😴 Sorry, the server is currently off. Please come again later or play Offline!');
      return;
    }
    if(res.ok) {
      setPw(_pendingLogin, enteredHash);
      document.getElementById('pwModal').style.display = 'none';
      await doLogin(_pendingLogin);
    } else {
      document.getElementById('pwModalError').textContent = '❌ Wrong password — try again!';
      document.getElementById('pwModalInput').value = '';
      document.getElementById('pwModalInput').focus();
    }
    return;
  }

  const stored = getPw(_pendingLogin);
  let match = false;
  if(!stored) {
    setPw(_pendingLogin, enteredHash);
    match = true;
  } else {
    match = enteredHash === stored;
    if(!match && entered === stored) { match = true; setPw(_pendingLogin, enteredHash); }
  }
  if(match) {
    document.getElementById('pwModal').style.display = 'none';
    doLogin(_pendingLogin);
  } else {
    document.getElementById('pwModalError').textContent = '❌ Wrong password — try again!';
    document.getElementById('pwModalInput').value = '';
    document.getElementById('pwModalInput').focus();
  }
}
function cancelPassword() {
  document.getElementById('pwModal').style.display = 'none';
  _pendingLogin = null;
}

async function doLogin(name) {
  if(serverMode === 'online') {
    // Pull the server's copy into localStorage first, so the rest of this
    // function (and every other place in the game that reads getUserData)
    // works completely unchanged, whether we're online or offline.
    try {
      const r = await fetchWithTimeout(EXPLOX_ONLINE_URL + '/api/user/' + encodeURIComponent(name), {}, 4000);
      if(r.ok) localStorage.setItem('explox_user_' + name, JSON.stringify(await r.json()));
    } catch(e) { /* no save on the server yet, or it dropped mid-fetch — fall back to local copy */ }
  }
  currentUser = name;
  const d = getUserData(name);
  // A genuinely brand-new account (never saved before) starts growth at 0 (Baby) — that's the
  // whole point of the feature. An EXISTING account just updated to a version with growth added
  // has no playTimeSeconds field either, but already has other real fields (sip, wood, ...) —
  // defaulting THAT case to 1800 (Adult) avoids visually shrinking an established character.
  const isBrandNewAccount = Object.keys(d).length === 0;
  playTimeSeconds = d.playTimeSeconds !== undefined ? d.playTimeSeconds : (isBrandNewAccount ? 0 : 1800);
  lastGrowthStageId = d.lastGrowthStageId || growthStageFor(playTimeSeconds).id;
  eliteCoins = d.eliteCoins !== undefined ? d.eliteCoins : 0;
  playerHat   = d.hat   || 'none';    playerHair  = d.hair  || 'none';
  playerShirt = d.shirt || 'plain';   playerPants = d.pants || 'long';
  playerShoes = d.shoes || 'sneakers';
  playerColors = {
    skin:  d.skin       || '#f5c89a',
    shirt: d.shirtColor || '#2196F3',
    pants: d.pantsColor || '#333333',
    shoes: d.shoesColor || '#4e3b2a',
    hair:  d.hairColor  || '#3a1f0a'
  };
  playerName    = d.name         || name;
  playerProfilePic = d.profilePic || null;
  playerShirtPaint = d.shirtPaint || null;
  sipDollars    = d.sip !== undefined ? d.sip : 0;
  woodCount     = d.wood !== undefined ? d.wood : 0;
  scrapMetal    = d.scrap !== undefined ? d.scrap : 0;
  ownedLand     = Array.isArray(d.ownedLand) ? d.ownedLand : [];
  plotBuildings = d.plotBuildings && typeof d.plotBuildings === 'object' ? d.plotBuildings : {};
  landInvites   = d.landInvites  && typeof d.landInvites  === 'object' ? d.landInvites  : {};
  landColor     = d.landColor    && typeof d.landColor    === 'object' ? d.landColor    : {};
  landForSale   = d.landForSale  && typeof d.landForSale  === 'object' ? d.landForSale  : {};
  pendingNotices = Array.isArray(d.pendingNotices) ? d.pendingNotices : [];
  tubeLikes = d.tubeLikes && typeof d.tubeLikes === 'object' ? d.tubeLikes : {};
  tubeViews = d.tubeViews && typeof d.tubeViews === 'object' ? d.tubeViews : {};
  tubeBaseComments = d.tubeBaseComments && typeof d.tubeBaseComments === 'object' ? d.tubeBaseComments : {};
  myUploads = Array.isArray(d.myUploads) ? d.myUploads : [];
  mySubscribers = d.mySubscribers !== undefined ? d.mySubscribers : 0;
  carLocation = d.carLocation || 'Downtown Explox';
  installedApps = Array.isArray(d.installedApps) ? d.installedApps : [];
  bankBalance     = d.bankBalance !== undefined ? d.bankBalance : 0;
  bankEliteBalance = d.bankEliteBalance !== undefined ? d.bankEliteBalance : BANK_VAULT_ELITE_SEED;
  playerInventory = d.inventory && typeof d.inventory === 'object' ? d.inventory : {};
  for (const invId of Object.keys(playerInventory)) {
    const it = playerInventory[invId];
    if (!it || typeof it !== 'object' || typeof it.name !== 'string' || typeof it.emoji !== 'string' || typeof it.qty !== 'number') {
      delete playerInventory[invId];
    }
  }
  playerBirthday = d.birthday || '';
  setBirthdayDropdowns(playerBirthday);
  safeBalance     = d.safeBalance    || 0;
  safeCombo       = d.safeCombo      || null;
  safeInventory   = d.safeInventory  || null;
  playerWeapon  = d.weapon       || 'none';
  ownedWeapons  = d.ownedWeapons || [];
  playerArmor   = d.armor        || 'none';
  ownedArmor    = d.ownedArmor   || [];
  ownedItems    = d.ownedItems   || [];
  ownedSkins    = d.ownedSkins   || [];
  alignment     = d.alignment    || 'good';
  wantedLevel   = d.wanted      || 0;
  ownedCars     = d.ownedCars     || [];
  ownedComputers = d.ownedComputers || [];
  ownedStore    = d.ownedStore    || null;
  ownedFurniture = d.ownedFurniture || [];
  ownedHouseFurniture = d.ownedHouseFurniture || [];
  storeStock = d.storeStock && typeof d.storeStock === 'object' ? d.storeStock : {};
  storePrices = d.storePrices && typeof d.storePrices === 'object' ? d.storePrices : {};
  storeSalesCount = d.storeSalesCount !== undefined ? d.storeSalesCount : 0;
  storeStockOrder = Array.isArray(d.storeStockOrder) ? d.storeStockOrder : [];
  storeAdLevel = d.storeAdLevel !== undefined ? d.storeAdLevel : 0;
  ownedStaff = Array.isArray(d.ownedStaff) ? d.ownedStaff : [];
  friends = Array.isArray(d.friends) ? d.friends : [];
  houseGuest = d.houseGuest || null;
  marriages = Array.isArray(d.marriages) ? d.marriages : [];
  children = Array.isArray(d.children) ? d.children : [];
  elderLifespans = d.elderLifespans && typeof d.elderLifespans === 'object' ? d.elderLifespans : {};
  elderPassed = d.elderPassed && typeof d.elderPassed === 'object' ? d.elderPassed : {};
  lastBirthdayGiftDate = d.lastBirthdayGiftDate || '';
  deadNPCs = d.deadNPCs && typeof d.deadNPCs === 'object' ? d.deadNPCs : {};
  buddyOwned   = !!d.buddyOwned;
  buddySpecies = d.buddySpecies || null;
  buddyName    = d.buddyName || 'Buddy';
  buddyColors  = d.buddyColors && typeof d.buddyColors === 'object' ? d.buddyColors : { body:'#66ddff', accent:'#ffffff', eye:'#111111' };
  activeAddOns = Array.isArray(d.activeAddOns) ? d.activeAddOns : [];
  familyKidAdopted = !!d.familyKidAdopted;
  familyKidId   = d.familyKidId || null;
  familyKidName    = d.familyKidName || 'Kiddo';
  familyKidPlayTime = d.familyKidPlayTime !== undefined ? d.familyKidPlayTime : 0;
  familyKidInSchool = !!d.familyKidInSchool;
  familyKidSmarts   = d.familyKidSmarts !== undefined ? d.familyKidSmarts : 0;
  familyKidLastStageId = d.familyKidLastStageId || growthStageFor(familyKidPlayTime).id;
  lastAllowanceAt = d.lastAllowanceAt !== undefined ? d.lastAllowanceAt : -999;
  unpaidBills   = Array.isArray(d.unpaidBills) ? d.unpaidBills : [];
  lastBillCheck = d.lastBillCheck !== undefined ? d.lastBillCheck : playTimeSeconds;
  // Same brand-new-vs-existing-account distinction as playTimeSeconds above: a genuinely new
  // account has never seen the guide (show it); an existing account predating this feature
  // shouldn't suddenly get nagged with it on their next login.
  hasSeenGuide = d.hasSeenGuide !== undefined ? !!d.hasSeenGuide : !isBrandNewAccount;
  myStocks = d.myStocks && typeof d.myStocks === 'object' ? d.myStocks : {};
  ffaKills = d.ffaKills !== undefined ? d.ffaKills : 0;
  eliteLevel = d.eliteLevel !== undefined ? d.eliteLevel : 0;
  // Recomputed here (not left at the module-load default of 100) so a login always starts fresh
  // at the CORRECT full health for this account's real Robot Level, not last account's or nobody's.
  playerMaxHealth = computePlayerMaxHealth();
  playerHealth = playerMaxHealth;
  hunger = 100; _starveDamageAt = 0; // same "always start this session full" treatment as health above
  sick = false; sickUntil = 0; _sickCheckAt = 0; _sickDamageAt = 0;
  updateSickHud();
  bladder = 100; embarrassedUntil = 0;
  updateBladderHud();
  tiredness = 100; exhaustedSince = 0;
  updateTirednessHud();
  activeQuests = Array.isArray(d.activeQuests) ? d.activeQuests : [];
  lifetimeRobotKills = d.lifetimeRobotKills !== undefined ? d.lifetimeRobotKills : 0;
  lifetimeRogueKills = d.lifetimeRogueKills !== undefined ? d.lifetimeRogueKills : 0;
  lifetimeWarHits    = d.lifetimeWarHits !== undefined ? d.lifetimeWarHits : 0;
  killerDefeats      = d.killerDefeats !== undefined ? d.killerDefeats : 0;
  // max()'d against the account's real current balance so an account that already had money
  // before this feature existed shows a correct record immediately, not a jarring 0.
  peakSip  = Math.max(d.peakSip !== undefined ? d.peakSip : 0, sipDollars);
  peakElite = Math.max(d.peakElite !== undefined ? d.peakElite : 0, eliteCoins);
  totalQuestsCompleted = d.totalQuestsCompleted !== undefined ? d.totalQuestsCompleted : 0;
  totalBossesDefeated  = d.totalBossesDefeated !== undefined ? d.totalBossesDefeated : 0;
  pendingEarnings    = Array.isArray(d.pendingEarnings) ? d.pendingEarnings : [];
  _earningsOverdueNotified = new Set(); // fresh per login — a still-overdue earning just nags again once, not a bug
  updateEarningsBadge();
  ensureQuests();
  shopOpen = false; // never resume a shop as open across a reload — you have to reopen it yourself
  document.getElementById('skinColor').value  = playerColors.skin;
  document.getElementById('shirtColor').value = playerColors.shirt;
  document.getElementById('pantsColor').value = playerColors.pants;
  document.getElementById('shoeColor').value  = playerColors.shoes;
  document.getElementById('hairColor').value  = playerColors.hair;
  document.getElementById('nameInput').value  = playerName;
  setBtn('hatBtns',   playerHat);
  setBtn('hairBtns',  playerHair);
  setBtn('shirtBtns', playerShirt);
  setBtn('pantsBtns', playerPants);
  setBtn('shoeBtns',  playerShoes);
  localStorage.setItem('explox_current_user', currentUser);
  document.getElementById('loginScreen').style.display  = 'none';
  document.getElementById('customScreen').style.display = 'flex';
  document.getElementById('customSip').textContent = sipDollars;
  refreshItemLocks();
  renderSkinsSection();
  if(document.getElementById('alignmentHud')) {
    document.getElementById('alignmentHud').style.display = alignment==='bad' ? 'block' : 'none';
  }
  if(document.getElementById('wantedHud')) updateWantedHud();
  refreshPreviews();
  setTimeout(refreshPreviews, 50);
}

function fillBdDays(month, selectedDay) {
  const sel = document.getElementById('bdDay');
  if(!sel) return;
  const days = [31,28,31,30,31,30,31,31,30,31,30,31];
  const count = month ? days[parseInt(month)-1] : 31;
  sel.innerHTML = '<option value="">Day</option>';
  for(let d=1; d<=count; d++) {
    const val = String(d).padStart(2,'0');
    sel.innerHTML += `<option value="${val}"${val===selectedDay?' selected':''}>${d}</option>`;
  }
}
function setBirthdayDropdowns(mmdd) {
  if(!mmdd) return;
  const [mm, dd] = mmdd.split('-');
  const mSel = document.getElementById('bdMonth');
  if(mSel) mSel.value = mm;
  fillBdDays(mm, dd);
}

function showMsg(txt) {
  const m = document.getElementById('loginMsg');
  m.textContent = txt;
  m.style.fontSize = '15px';
  m.style.fontWeight = 'bold';
  m.style.color = '#ff4444';
  setTimeout(() => m.textContent = '', 3000);
}

function showBigMsg(txt) {
  let box = document.getElementById('bigMsgBox');
  if(!box) {
    box = document.createElement('div');
    box.id = 'bigMsgBox';
    box.style.cssText = 'position:fixed;top:30px;left:50%;transform:translateX(-50%);background:#c0392b;color:#fff;font-size:18px;font-weight:bold;padding:16px 32px;border-radius:12px;z-index:9999;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
    document.body.appendChild(box);
  }
  box.textContent = txt;
  box.style.display = 'block';
  clearTimeout(box._t);
  box._t = setTimeout(() => box.style.display = 'none', 3000);
}

