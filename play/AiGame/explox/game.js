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
    html+=`<div onclick="selectMusicTrack(${i})" style="padding:8px 10px;border-radius:8px;margin-bottom:5px;cursor:pointer;background:${a?'rgba(180,0,220,0.25)':'rgba(255,255,255,0.03)'};border:1px solid ${a?'#cc44ff':'#333'};display:flex;justify-content:space-between;align-items:center;user-select:none;">
      <div style="color:${a?'#ee88ff':'#bbb'};font-size:11px;font-weight:bold;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a?'▶ ':''}${t.name}</div>
      <div style="color:#888;font-size:10px;white-space:nowrap;margin-left:6px;">${meta}</div>
    </div>`;
  });
  el.innerHTML=html;
}

// ─── MULTI-ACCOUNT SYSTEM ────────────────────────────────────────────────────
let currentUser = null;

function getUserData(name) { return JSON.parse(localStorage.getItem('explox_user_' + name) || '{}'); }

function saveCurrentUser() {
  if(!currentUser) return;
  const data = {
    bankBalance: bankBalance,
    inventory:   playerInventory,
    safeBalance:   safeBalance,
    safeCombo:     safeCombo,
    safeInventory: safeInventory,
    hat:playerHat, hair:playerHair, shirt:playerShirt, pants:playerPants, shoes:playerShoes,
    skin:playerColors.skin, shirtColor:playerColors.shirt,
    pantsColor:playerColors.pants, shoesColor:playerColors.shoes,
    hairColor:playerColors.hair, name:playerName, sip:sipDollars, wood:woodCount, scrap:scrapMetal, ownedLand:ownedLand, plotBuildings:plotBuildings,
    landInvites:landInvites, landColor:landColor, landForSale:landForSale, pendingNotices:pendingNotices,
    tubeLikes:tubeLikes, tubeViews:tubeViews, myUploads:myUploads, mySubscribers:mySubscribers, carLocation:carLocation, installedApps:installedApps,
    weapon:playerWeapon, ownedWeapons:ownedWeapons, ownedItems:ownedItems, ownedSkins:ownedSkins,
    armor:playerArmor, ownedArmor:ownedArmor,
    alignment:alignment, wanted:wantedLevel,
    birthday: playerBirthday, ownedCars: ownedCars, ownedComputers: ownedComputers,
    ownedStore: ownedStore, ownedFurniture: ownedFurniture,
    storeStock: storeStock, storePrices: storePrices,
    storeSalesCount: storeSalesCount, storeStockOrder: storeStockOrder,
    storeAdLevel: storeAdLevel, ownedStaff: ownedStaff,
    friends: friends, houseGuest: houseGuest,
    marriages: marriages, children: children,
    elderLifespans: elderLifespans, elderPassed: elderPassed,
    lastBirthdayGiftDate: lastBirthdayGiftDate,
    deadNPCs: deadNPCs
  };
  localStorage.setItem('explox_user_' + currentUser, JSON.stringify(data));
  localStorage.setItem('explox_current_user', currentUser);
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

function loadLoginScreen() {
  const users = getUsers();
  const list  = document.getElementById('accountList');
  if(users.length === 0) {
    list.innerHTML = '<div id="noAccounts">No accounts yet — create one below!</div>';
  } else {
    list.innerHTML = users.map(name => {
      const d   = getUserData(name);
      const sip = d.sip !== undefined ? d.sip.toLocaleString() : '0';
      return `<div class="accountCard" onclick="loginAs('${name}')">
        <div class="acInfo">
          <div class="acName">${name}</div>
          <div class="acSip">💰 ${sip} S.I.P.</div>
        </div>
        <button class="acDel" onclick="event.stopPropagation();deleteAccount('${name}')">✕</button>
      </div>`;
    }).join('');
  }
  document.getElementById('newAccName').value = '';
  document.getElementById('newAccPw').value   = '';
}

function createAccount() {
  try {
    const name = document.getElementById('newAccName').value.trim();
    const pw   = document.getElementById('newAccPw').value;
    if(!name) { showBigMsg('⚠️ Enter a name first!'); return; }
    if(!pw)   { showBigMsg('⚠️ Enter a password too!'); return; }
    const users = getUsers();
    if(users.includes(name)) { showBigMsg('⚠️ That name is taken!'); return; }
    users.push(name);
    saveUsers(users);
    setPw(name, hashPassword(pw));
    doLogin(name);
  } catch(e) {
    showBigMsg('❌ Error: ' + e.message);
    console.error('createAccount crash:', e);
  }
}

function deleteAccount(name) {
  if(!confirm('Delete account "' + name + '"? This cannot be undone.')) return;
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
function submitPassword() {
  const entered = document.getElementById('pwModalInput').value;
  if(!entered) {
    document.getElementById('pwModalError').textContent = '❌ Enter your password!';
    return;
  }
  const stored = getPw(_pendingLogin);
  let match = false;
  if(!stored) {
    setPw(_pendingLogin, hashPassword(entered));
    match = true;
  } else {
    match = hashPassword(entered) === stored;
    if(!match && entered === stored) { match = true; setPw(_pendingLogin, hashPassword(entered)); }
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

function doLogin(name) {
  currentUser = name;
  const d = getUserData(name);
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
  myUploads = Array.isArray(d.myUploads) ? d.myUploads : [];
  mySubscribers = d.mySubscribers !== undefined ? d.mySubscribers : 0;
  carLocation = d.carLocation || 'Downtown Explox';
  installedApps = Array.isArray(d.installedApps) ? d.installedApps : [];
  bankBalance     = d.bankBalance !== undefined ? d.bankBalance : 10000000000000;
  playerInventory = d.inventory   || {};
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

// ─── BANK ────────────────────────────────────────────────────────────────────
const BANK_PASSCODE = 'cubbyexplotionisthebest';

function openBankPasscode() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('bankPcInput').value = '';
  document.getElementById('bankPcError').textContent = '';
  document.getElementById('bankPasscodeModal').style.display = 'flex';
  setTimeout(() => document.getElementById('bankPcInput').focus(), 50);
}
function submitBankPasscode() {
  const entered = document.getElementById('bankPcInput').value;
  if(entered === BANK_PASSCODE) {
    document.getElementById('bankPasscodeModal').style.display = 'none';
    openBank();
  } else {
    document.getElementById('bankPcError').textContent = 'Wrong passcode! Access denied.';
    document.getElementById('bankPcInput').value = '';
    document.getElementById('bankPcInput').focus();
  }
}
function cancelBankPasscode() {
  document.getElementById('bankPasscodeModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ─── SAFE ────────────────────────────────────────────────────────────────────
function openSafeModal() {
  const modal = document.getElementById('safeModal');
  modal.style.display = 'flex';
  document.getElementById('safeSetView').style.display   = safeCombo ? 'none'  : 'block';
  document.getElementById('safeEnterView').style.display = safeCombo ? 'block' : 'none';
  document.getElementById('safeOpenView').style.display  = 'none';
  if(!safeCombo) {
    document.getElementById('safeNewCombo').value     = '';
    document.getElementById('safeConfirmCombo').value = '';
    document.getElementById('safeSetErr').textContent  = '';
    setTimeout(() => document.getElementById('safeNewCombo').focus(), 50);
  } else {
    document.getElementById('safeComboInput').value    = '';
    document.getElementById('safeEnterErr').textContent = '';
    setTimeout(() => document.getElementById('safeComboInput').focus(), 50);
  }
}

function setSafeCombo() {
  const c1  = document.getElementById('safeNewCombo').value;
  const c2  = document.getElementById('safeConfirmCombo').value;
  const err = document.getElementById('safeSetErr');
  if(!c1)      { err.textContent = 'Enter a combo!';          return; }
  if(c1 !== c2){ err.textContent = "Combos don't match!";    return; }
  safeCombo = c1;
  saveCurrentUser();
  document.getElementById('safeSetView').style.display = 'none';
  showSafeOpen();
}

function submitSafeCombo() {
  const entered = document.getElementById('safeComboInput').value;
  if(entered === safeCombo) {
    document.getElementById('safeEnterView').style.display = 'none';
    showSafeOpen();
  } else {
    document.getElementById('safeEnterErr').textContent = 'Wrong combo! Try again.';
    document.getElementById('safeComboInput').value = '';
    document.getElementById('safeComboInput').focus();
  }
}

const MINI_GAME_WEAPONS = [
  { id:'mg_laser_sword',    name:'Laser Sword',    emoji:'⚡' },
  { id:'mg_plasma_blaster', name:'Plasma Blaster', emoji:'🔴' },
  { id:'mg_scatter_blast',  name:'Scatter Blast',  emoji:'💥' },
  { id:'mg_ghost_blade',    name:'Ghost Blade',    emoji:'👻' },
  { id:'mg_flame_sword',    name:'Flame Sword',    emoji:'🔥' },
  { id:'mg_cryo_cannon',    name:'Cryo Cannon',    emoji:'❄️' },
  { id:'mg_seeker_missile', name:'Seeker Missile', emoji:'🚀' },
  { id:'mg_void_arrow',     name:'Void Arrow',     emoji:'🌑' },
  { id:'mg_thunder_staff',  name:'Thunder Staff',  emoji:'🌩️' },
  { id:'mg_titan_fist',     name:'Titan Fist',     emoji:'👊' },
];

function initSafeInventory() {
  safeInventory = {};
  Object.entries(ITEM_INFO).forEach(([name, info]) => {
    safeInventory[info.id] = { name, emoji: info.emoji, qty: 1 };
  });
  MINI_GAME_WEAPONS.forEach(w => {
    safeInventory[w.id] = { name: w.name, emoji: w.emoji, qty: 1 };
  });
}

function refreshSafeItems() {
  const el = document.getElementById('safeItemsList');
  if(!el) return;
  const keys = Object.keys(safeInventory || {});
  if(keys.length === 0) {
    el.innerHTML = '<div style="color:#555;font-size:11px;text-align:center;padding:8px 0;">Safe items empty</div>';
    return;
  }
  el.innerHTML = '<div style="color:#886600;font-size:10px;letter-spacing:1px;margin-bottom:6px;">ITEMS IN SAFE</div>' +
    keys.map(id => {
      const it = safeInventory[id];
      return `<div style="display:flex;align-items:center;gap:8px;background:rgba(255,215,0,0.06);border:1px solid #443300;border-radius:6px;padding:6px 10px;margin-bottom:5px;">
        <span style="font-size:18px;">${it.emoji}</span>
        <span style="flex:1;color:#fff;font-size:12px;">${it.name}</span>
        <button onclick="takeFromSafe('${id}')" style="padding:3px 10px;background:#1a3a1a;border:1px solid #44aa44;border-radius:5px;color:#44ff88;font-size:11px;cursor:pointer;font-weight:bold;">Take</button>
      </div>`;
    }).join('');
}

function takeFromSafe(id) {
  if(!safeInventory || !safeInventory[id]) return;
  const it = safeInventory[id];
  addToInventory(id, it.name, it.emoji);
  delete safeInventory[id];
  saveCurrentUser();
  refreshSafeItems();
  const msg = document.getElementById('safeMsg');
  msg.style.color = '#44ff88';
  msg.textContent = '✅ Took ' + it.emoji + ' ' + it.name + ' into your bag!';
}

function showSafeOpen() {
  if(!safeInventory) initSafeInventory();
  document.getElementById('safeWalletDisplay').textContent = sipDollars.toLocaleString() + ' S.I.P.';
  document.getElementById('safeBalDisplay').textContent    = safeBalance.toLocaleString() + ' S.I.P.';
  document.getElementById('safeAmtInput').value = '';
  document.getElementById('safeMsg').textContent = '';
  document.getElementById('safeOpenView').style.display = 'block';
  refreshSafeItems();
}

function closeSafe() {
  document.getElementById('safeModal').style.display = 'none';
}

function safeDeposit() {
  const amt = parseInt(document.getElementById('safeAmtInput').value);
  const msg = document.getElementById('safeMsg');
  if(!amt || amt <= 0)  { msg.style.color='#ff8888'; msg.textContent='Enter a valid amount!';    return; }
  if(amt > sipDollars)  { msg.style.color='#ff8888'; msg.textContent="You don't have that much!"; return; }
  sipDollars  -= amt;
  safeBalance += amt;
  document.getElementById('sipAmount').textContent         = sipDollars;
  document.getElementById('safeWalletDisplay').textContent = sipDollars.toLocaleString()  + ' S.I.P.';
  document.getElementById('safeBalDisplay').textContent    = safeBalance.toLocaleString() + ' S.I.P.';
  msg.style.color = '#44ff88';
  msg.textContent = '✅ Locked in ' + amt.toLocaleString() + ' S.I.P.!';
  saveCurrentUser();
}

function safeWithdraw() {
  const amt = parseInt(document.getElementById('safeAmtInput').value);
  const msg = document.getElementById('safeMsg');
  if(!amt || amt <= 0)  { msg.style.color='#ff8888'; msg.textContent='Enter a valid amount!';    return; }
  if(amt > safeBalance) { msg.style.color='#ff8888'; msg.textContent='Not enough in the safe!'; return; }
  safeBalance -= amt;
  sipDollars  += amt;
  document.getElementById('sipAmount').textContent         = sipDollars;
  document.getElementById('safeWalletDisplay').textContent = sipDollars.toLocaleString()  + ' S.I.P.';
  document.getElementById('safeBalDisplay').textContent    = safeBalance.toLocaleString() + ' S.I.P.';
  msg.style.color = '#FFD700';
  msg.textContent = '✅ Took out ' + amt.toLocaleString() + ' S.I.P.!';
  saveCurrentUser();
}
function openBank() {
  document.getElementById('bankWalletDisplay').textContent = sipDollars.toLocaleString() + ' S.I.P.';
  document.getElementById('bankBalDisplay').textContent = bankBalance.toLocaleString() + ' S.I.P.';
  document.getElementById('bankAmtInput').value = '';
  document.getElementById('bankMsg').textContent = '';
  document.getElementById('bankOverlay').style.display = 'flex';
}
function closeBank() {
  document.getElementById('bankOverlay').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// Bank interval started in startGame() so it doesn't fire during login/customization
function bankDeposit() {
  const amt = parseInt(document.getElementById('bankAmtInput').value);
  const msg = document.getElementById('bankMsg');
  if(!amt || amt <= 0) { msg.style.color='#ff8888'; msg.textContent='Enter a valid amount!'; return; }
  if(amt > sipDollars) { sfx.nope(); msg.style.color='#ff8888'; msg.textContent="You don't have that much!"; return; }
  sipDollars -= amt;
  bankBalance += amt;
  document.getElementById('sipAmount').textContent = sipDollars;
  document.getElementById('bankWalletDisplay').textContent = sipDollars.toLocaleString() + ' S.I.P.';
  document.getElementById('bankBalDisplay').textContent = bankBalance.toLocaleString() + ' S.I.P.';
  sfx.bank();
  msg.style.color = '#44ff88';
  msg.textContent = '✅ Deposited ' + amt.toLocaleString() + ' S.I.P.!';
  saveCurrentUser();
}
function bankWithdraw() {
  const amt = parseInt(document.getElementById('bankAmtInput').value);
  const msg = document.getElementById('bankMsg');
  if(!amt || amt <= 0) { msg.style.color='#ff8888'; msg.textContent='Enter a valid amount!'; return; }
  if(amt > bankBalance) { sfx.nope(); msg.style.color='#ff8888'; msg.textContent='Not enough in your bank!'; return; }
  bankBalance -= amt;
  sipDollars += amt;
  document.getElementById('sipAmount').textContent = sipDollars;
  document.getElementById('bankWalletDisplay').textContent = sipDollars.toLocaleString() + ' S.I.P.';
  document.getElementById('bankBalDisplay').textContent = bankBalance.toLocaleString() + ' S.I.P.';
  sfx.coin();
  msg.style.color = '#FFD700';
  msg.textContent = '✅ Withdrew ' + amt.toLocaleString() + ' S.I.P.!';
  saveCurrentUser();
}

function backToLogin() {
  if(shopSalesTimer){ clearInterval(shopSalesTimer); shopSalesTimer=null; } // don't let a staffed shop's timer outlive the logged-in account
  shopOpen = false;
  saveCurrentUser();
  currentUser = null;
  document.getElementById('customScreen').style.display = 'none';
  document.getElementById('loginScreen').style.display  = 'flex';
  loadLoginScreen();
}

// ─── PLAYER SETTINGS ─────────────────────────────────────────────────────────
let playerName  = 'Player';
let playerColors = { skin:'#f5c89a', shirt:'#2196F3', pants:'#333333', shoes:'#4e3b2a', hair:'#3a1f0a' };
let playerHat   = 'none';
let playerHair  = 'none';
let playerShirt = 'plain';
let playerPants = 'long';
let playerShoes   = 'sneakers';
let playerWeapon  = 'none';
let ownedWeapons  = [];
let playerSwingStart = -999; // 't' (clock.getElapsedTime()) when the last swing began, read every frame in animate()
const SWING_DURATION = 0.25;
function triggerSwing() { if(clock) playerSwingStart = clock.getElapsedTime(); }
let playerArmor   = 'none';
let ownedArmor    = [];
let ownedItems    = [];   // customization items bought in the shop
let ownedSkins    = [];   // pre-made skins bought
let sipDollars      = 0;
let woodCount       = 0;
let scrapMetal      = 0;
let playerHealth    = 100;
const playerMaxHealth = 100;
let bankBalance     = 0;
let ownedComputers = [];   // array of owned computer ids e.g. ['sic','sdic']
let ownedCars   = [];
let carLocation = 'Downtown Explox'; // where your FIRST-owned car currently sits — 'Downtown Explox' or a country name
let parkedCars  = [];      // [{def, group, carYaw}]
let activeCar   = null;
let inCar       = false;
let playerSeated = false; // toggled by sitting on a bench (your own or, if invited, someone else's) — freezes movement
let carYaw      = 0;
let playerInventory = {}; // { itemId: {name, emoji, qty} }
let safeBalance     = 0;
let safeCombo       = null;
let safeInventory   = null; // null = not yet initialised (will be filled on first open)
let playerBirthday  = '';      // stored as 'MM-DD'
let lastBirthdayGiftDate = ''; // persisted 'YYYY-MM-DD' — so the birthday gift/party only fires once per real day, even across reloads
let treeMeshes      = [];      // tree canopy mesh refs for seasonal color
let groundMesh      = null;    // ground mesh ref for seasonal color
let weatherParticles = [];     // snow / leaf particle meshes

// Items that cost S.I.P. — free items are not listed here
const ITEM_PRICES = {
  hat_cap:20,    hat_beanie:20,  hat_cowboy:40,  hat_fedora:40,
  hat_helmet:60, hat_tophat:60,  hat_pirate:80,  hat_wizard:80,
  hat_crown:100, hat_santa:100,
  hair_long:15,  hair_curly:15,  hair_ponytail:25, hair_spiky:25, hair_afro:50,
  shirt_hoodie:20, shirt_striped:20, shirt_tanktop:20, shirt_jersey:40, shirt_suit:60,
  pants_shorts:15, pants_cargo:25, pants_ripped:25,
  shoe_sandals:10, shoe_hightop:20, shoe_boots:30,
};

// ─── PRE-MADE SKINS ──────────────────────────────────────────────────────────
const SKINS = [
  // BOY SKINS
  { id:'skin_city_boy',     name:'City Boy',     icon:'🏙️', gender:'boy',  price:500,
    colors:{skin:'#f5c89a',shirt:'#1565C0',pants:'#1a237e',shoes:'#eeeeee',hair:'#1a0a00'},
    hat:'none',  hair:'short',   shirt:'hoodie',  pants:'long',   shoes:'sneakers' },
  { id:'skin_baller',       name:'Baller',       icon:'🏀', gender:'boy',  price:800,
    colors:{skin:'#c97a50',shirt:'#c62828',pants:'#111111',shoes:'#b71c1c',hair:'#1a0a00'},
    hat:'none',  hair:'afro',    shirt:'jersey',  pants:'shorts', shoes:'hightop' },
  { id:'skin_suit_up',      name:'Suit Up',      icon:'🤵', gender:'boy',  price:1500,
    colors:{skin:'#f5c89a',shirt:'#424242',pants:'#212121',shoes:'#111111',hair:'#1a0a00'},
    hat:'none',  hair:'short',   shirt:'suit',    pants:'long',   shoes:'boots' },
  { id:'skin_pirate_king',  name:'Pirate King',  icon:'🏴‍☠️', gender:'boy',  price:2000,
    colors:{skin:'#d4956a',shirt:'#8B4513',pants:'#333333',shoes:'#5d4037',hair:'#4e2600'},
    hat:'pirate',hair:'long',    shirt:'striped', pants:'ripped', shoes:'boots' },
  { id:'skin_dark_wizard',  name:'Dark Wizard',  icon:'🧙', gender:'boy',  price:3000,
    colors:{skin:'#e8c080',shirt:'#4a148c',pants:'#1a0033',shoes:'#212121',hair:'#6a1b9a'},
    hat:'wizard',hair:'spiky',   shirt:'hoodie',  pants:'cargo',  shoes:'boots' },
  // GIRL SKINS
  { id:'skin_cherry_pop',   name:'Cherry Pop',   icon:'🌸', gender:'girl', price:500,
    colors:{skin:'#f5c89a',shirt:'#f06292',pants:'#fce4ec',shoes:'#ffe0b2',hair:'#e91e63'},
    hat:'none',  hair:'ponytail',shirt:'plain',   pants:'shorts', shoes:'sandals' },
  { id:'skin_street_fire',  name:'Street Fire',  icon:'🔥', gender:'girl', price:800,
    colors:{skin:'#c97a50',shirt:'#e53935',pants:'#424242',shoes:'#111111',hair:'#e53935'},
    hat:'none',  hair:'spiky',   shirt:'tanktop', pants:'ripped', shoes:'hightop' },
  { id:'skin_pop_star',     name:'Pop Star',     icon:'⭐', gender:'girl', price:1500,
    colors:{skin:'#f5c89a',shirt:'#FDD835',pants:'#212121',shoes:'#FDD835',hair:'#FDD835'},
    hat:'crown', hair:'curly',   shirt:'jersey',  pants:'shorts', shoes:'hightop' },
  { id:'skin_ocean_queen',  name:'Ocean Queen',  icon:'🌊', gender:'girl', price:2000,
    colors:{skin:'#d4956a',shirt:'#00838f',pants:'#006064',shoes:'#80deea',hair:'#00bcd4'},
    hat:'none',  hair:'long',    shirt:'hoodie',  pants:'cargo',  shoes:'sandals' },
  { id:'skin_snow_princess',name:'Snow Princess',icon:'❄️', gender:'girl', price:3000,
    colors:{skin:'#f5c89a',shirt:'#e3f2fd',pants:'#f0f4ff',shoes:'#e3f2fd',hair:'#b3e5fc'},
    hat:'beanie',hair:'ponytail',shirt:'hoodie',  pants:'long',   shoes:'sneakers' },
];

function applySkin(idx) {
  const s = SKINS[idx];
  if(!s) return;
  const owned = ownedSkins.includes(s.id);
  if(!owned) {
    if(sipDollars < s.price) { showCustomMsg(`❌ Need ${s.price} S.I.P. to unlock!`); return; }
    sipDollars -= s.price;
    ownedSkins.push(s.id);
    // auto-unlock individual items that come with this skin
    ['hat_'+s.hat,'hair_'+s.hair,'shirt_'+s.shirt,'pants_'+s.pants,'shoe_'+s.shoes].forEach(key => {
      if(ITEM_PRICES[key] && !ownedItems.includes(key)) ownedItems.push(key);
    });
    document.getElementById('customSip').textContent = sipDollars;
    showCustomMsg(`✅ ${s.name} unlocked!`, '#00e676');
    renderSkinsSection();
    refreshItemLocks();
  }
  // apply all properties
  playerColors = { ...s.colors };
  playerHat = s.hat; playerHair = s.hair;
  playerShirt = s.shirt; playerPants = s.pants; playerShoes = s.shoes;
  document.getElementById('skinColor').value  = s.colors.skin;
  document.getElementById('shirtColor').value = s.colors.shirt;
  document.getElementById('pantsColor').value = s.colors.pants;
  document.getElementById('shoeColor').value  = s.colors.shoes;
  document.getElementById('hairColor').value  = s.colors.hair;
  setBtn('hatBtns', s.hat); setBtn('hairBtns', s.hair);
  setBtn('shirtBtns', s.shirt); setBtn('pantsBtns', s.pants); setBtn('shoeBtns', s.shoes);
  refreshPreviews();
  saveCurrentUser();
  if(owned) showCustomMsg(`✅ ${s.name} applied!`, '#00e676');
}

function renderSkinsSection() {
  const el = document.getElementById('skinsSection');
  if(!el) return;
  el.innerHTML = '';
  ['boy','girl'].forEach(gender => {
    const label = document.createElement('div');
    label.style.cssText = 'color:#aaa;font-size:10px;letter-spacing:2px;font-weight:bold;margin:8px 0 4px;';
    label.textContent = gender === 'boy' ? '👦 BOY SKINS' : '👧 GIRL SKINS';
    el.appendChild(label);
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;';
    SKINS.forEach((s, i) => {
      if(s.gender !== gender) return;
      const owned = ownedSkins.includes(s.id);
      const card = document.createElement('div');
      card.style.cssText = `background:#12122a;border:2px solid ${owned?'#00e676':'#333'};border-radius:8px;padding:7px 6px;cursor:pointer;transition:border-color 0.2s;`;
      card.onmouseenter = () => { if(!owned) card.style.borderColor='#e94560'; };
      card.onmouseleave = () => { card.style.borderColor = owned?'#00e676':'#333'; };
      // color swatches
      const swatches = document.createElement('div');
      swatches.style.cssText = 'display:flex;gap:2px;margin-bottom:4px;';
      ['skin','hair','shirt','pants','shoes'].forEach(k => {
        const dot = document.createElement('div');
        dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${s.colors[k]};border:1px solid #555;`;
        swatches.appendChild(dot);
      });
      card.appendChild(swatches);
      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:11px;font-weight:bold;color:#fff;';
      nameEl.textContent = s.icon + ' ' + s.name;
      card.appendChild(nameEl);
      const btn = document.createElement('button');
      btn.style.cssText = `margin-top:5px;width:100%;padding:4px 0;border:none;border-radius:5px;font-size:10px;font-weight:bold;cursor:pointer;background:${owned?'#1b5e20':'#e94560'};color:#fff;`;
      btn.textContent = owned ? '▶ Apply' : s.price + ' 💰 Buy';
      btn.onclick = () => applySkin(i);
      card.appendChild(btn);
      grid.appendChild(card);
    });
    el.appendChild(grid);
  });
}

// ─── CUSTOM SHOP MESSAGE ─────────────────────────────────────────────────────
function showCustomMsg(txt, col='#ff4444') {
  const el = document.getElementById('customMsg');
  if(!el) return;
  el.style.color = col; el.textContent = txt;
  setTimeout(() => el.textContent = '', 2200);
}

// ─── ITEM LOCK BADGES ────────────────────────────────────────────────────────
function refreshItemLocks() {
  const groups = ['hatBtns','hairBtns','shirtBtns','pantsBtns','shoeBtns'];
  groups.forEach(gid => {
    const category = gid.replace('Btns','');
    document.getElementById(gid).querySelectorAll('.optBtn').forEach(btn => {
      const key = category + '_' + btn.dataset.val;
      const price = ITEM_PRICES[key];
      // Remove old badge
      const old = btn.querySelector('.priceTag, .ownedTag');
      if(old) old.remove();
      if(price) {
        const owned = ownedItems.includes(key);
        btn.classList.toggle('locked', !owned);
        const badge = document.createElement('span');
        badge.className = owned ? 'ownedTag' : 'priceTag';
        badge.textContent = owned ? '✓ owned' : price + ' 💰';
        btn.appendChild(badge);
      } else {
        btn.classList.remove('locked');
      }
    });
  });
}

// ─── BUTTON GROUPS ───────────────────────────────────────────────────────────
function setupBtnGroup(id, setter) {
  document.getElementById(id).querySelectorAll('.optBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = id.replace('Btns','');
      const key = category + '_' + btn.dataset.val;
      const price = ITEM_PRICES[key];

      // If item costs money and isn't owned yet
      if(price && !ownedItems.includes(key)) {
        if(sipDollars < price) {
          showCustomMsg(`❌ Need ${price} S.I.P. to unlock!`);
          return;
        }
        sipDollars -= price;
        ownedItems.push(key);
        saveCurrentUser();
        document.getElementById('customSip').textContent = sipDollars;
        showCustomMsg(`✅ Unlocked! -${price} S.I.P.`, '#44ff88');
        refreshItemLocks();
      }

      document.getElementById(id).querySelectorAll('.optBtn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      setter(btn.dataset.val);
      refreshPreviews();
    });
  });
}
setupBtnGroup('hatBtns',   v => playerHat   = v);
setupBtnGroup('hairBtns',  v => playerHair  = v);
setupBtnGroup('shirtBtns', v => playerShirt = v);
setupBtnGroup('pantsBtns', v => playerPants = v);
setupBtnGroup('shoeBtns',  v => playerShoes = v);
['skinColor','shirtColor','pantsColor','shoeColor','hairColor'].forEach(id =>
  document.getElementById(id).addEventListener('input', refreshPreviews)
);
document.getElementById('nameInput').addEventListener('input', refreshPreviews);

// ─── 2D PREVIEW ──────────────────────────────────────────────────────────────
function hexVal(id) { return document.getElementById(id).value; }
function rgb(h) { return `rgb(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)})`; }

function drawPreview() {
  const previewCanvas = document.getElementById('previewCanvas');
  if(!previewCanvas) return;
  const px = previewCanvas.getContext('2d');
  if(!px) return;
  px.clearRect(0,0,140,210);
  // gradient background - lighter at top so character stands out
  const bg = px.createLinearGradient(0,0,0,210);
  bg.addColorStop(0,'#1a1a4e'); bg.addColorStop(1,'#0d0d28');
  px.fillStyle=bg; px.fillRect(0,0,140,210);
  // floor line
  px.fillStyle='#2a2a5a'; px.fillRect(0,175,140,35);
  const skin=rgb(hexVal('skinColor')), shirt=rgb(hexVal('shirtColor'));
  const pants=rgb(hexVal('pantsColor')), shoes=rgb(hexVal('shoeColor')), hair=rgb(hexVal('hairColor'));
  const cx=70;

  px.fillStyle='rgba(0,0,0,0.18)'; px.beginPath(); px.ellipse(cx,200,20,5,0,0,Math.PI*2); px.fill();

  // Long/curly hair behind head
  px.fillStyle=hair;
  if(playerHair==='long')    { px.fillRect(cx-25,38,9,55); px.fillRect(cx+16,38,9,55); px.fillRect(cx-25,38,50,10); }
  if(playerHair==='ponytail'){ px.fillRect(cx-25,38,50,10); px.fillRect(cx+18,42,7,38); }
  if(playerHair==='afro')    { px.beginPath(); px.ellipse(cx,44,28,28,0,0,Math.PI*2); px.fill(); }
  if(playerHair==='curly')   { for(let i=0;i<6;i++){px.beginPath();px.arc(cx-20+i*9,38+Math.sin(i)*4,7,0,Math.PI*2);px.fill();} px.fillRect(cx-25,44,50,6); }

  // Shoes
  px.fillStyle=shoes;
  if(playerShoes==='boots')   { px.fillRect(cx-18,160,15,28); px.fillRect(cx+3,160,15,28); }
  else if(playerShoes==='sandals') { px.fillRect(cx-17,178,14,8); px.fillRect(cx+3,178,14,8); }
  else if(playerShoes==='hightop') { px.fillRect(cx-18,168,15,20); px.fillRect(cx+3,168,15,20); }
  else { px.fillRect(cx-18,178,15,10); px.fillRect(cx+3,178,15,10); }
  px.strokeStyle='rgba(255,255,255,0.18)'; px.lineWidth=1;
  px.strokeRect(cx-18,178,15,10); px.strokeRect(cx+3,178,15,10);

  // Pants
  px.fillStyle=pants;
  if(playerPants==='shorts')  { px.fillRect(cx-16,130,14,22); px.fillRect(cx+2,130,14,22); px.fillStyle=skin; px.fillRect(cx-15,152,13,24); px.fillRect(cx+2,152,13,24); px.fillStyle=pants; }
  else { px.fillRect(cx-16,130,14,46); px.fillRect(cx+2,130,14,46); }
  if(playerPants==='ripped')  { px.fillStyle='rgba(0,0,0,0.25)'; px.fillRect(cx-14,148,10,4); px.fillRect(cx+4,155,10,4); }
  if(playerPants==='cargo')   { px.fillStyle='rgba(0,0,0,0.2)'; px.fillRect(cx-15,148,12,10); px.fillRect(cx+3,148,12,10); }

  // Shirt
  px.fillStyle=shirt;
  if(playerShirt==='tanktop') {
    px.fillRect(cx-16,84,32,48); px.fillStyle=skin; px.fillRect(cx-10,82,20,8); px.fillRect(cx-20,84,6,20); px.fillRect(cx+14,84,6,20);
  } else if(playerShirt==='hoodie') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,40); px.fillRect(cx+18,84,10,40);
    px.strokeStyle='rgba(0,0,0,0.3)'; px.lineWidth=2; px.beginPath(); px.moveTo(cx-6,84); px.lineTo(cx-4,100); px.stroke(); px.beginPath(); px.moveTo(cx+6,84); px.lineTo(cx+4,100); px.stroke();
  } else if(playerShirt==='suit') {
    px.fillStyle='#222'; px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillStyle=shirt; px.beginPath(); px.moveTo(cx-10,82); px.lineTo(cx,95); px.lineTo(cx-10,105); px.closePath(); px.fill();
    px.beginPath(); px.moveTo(cx+10,82); px.lineTo(cx,95); px.lineTo(cx+10,105); px.closePath(); px.fill();
    px.fillStyle='#cc2222'; px.fillRect(cx-3,84,6,28);
  } else if(playerShirt==='striped') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillStyle='rgba(255,255,255,0.28)'; for(let i=0;i<5;i++) px.fillRect(cx-22,84+i*10,44,5);
  } else if(playerShirt==='jersey') {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
    px.fillStyle='rgba(255,255,255,0.8)'; px.font='bold 18px Arial'; px.textAlign='center'; px.fillText('10',cx,112);
  } else {
    px.fillRect(cx-22,82,44,50); px.fillRect(cx-28,84,10,44); px.fillRect(cx+18,84,10,44);
  }

  // Neck + head
  px.fillStyle=skin; px.fillRect(cx-7,72,14,14); px.fillRect(cx-20,36,40,38);
  px.strokeStyle='rgba(255,255,255,0.15)'; px.lineWidth=1; px.strokeRect(cx-20,36,40,38);
  px.fillStyle='#222'; px.fillRect(cx-12,47,8,8); px.fillRect(cx+4,47,8,8);
  px.fillStyle='#fff'; px.fillRect(cx-10,49,3,3); px.fillRect(cx+6,49,3,3);
  px.strokeStyle='#333'; px.lineWidth=2; px.beginPath(); px.arc(cx,61,7,0.2,Math.PI-0.2); px.stroke();

  // Hair on top
  px.fillStyle=hair;
  if(playerHair==='short')    { px.fillRect(cx-22,32,44,12); px.fillRect(cx-24,36,8,12); px.fillRect(cx+16,36,8,12); }
  if(playerHair==='spiky')    { px.fillRect(cx-20,30,40,10); [-14,-7,0,7,14].forEach(sx=>{px.beginPath();px.moveTo(cx+sx-5,30);px.lineTo(cx+sx,10);px.lineTo(cx+sx+5,30);px.closePath();px.fill();}); }
  if(playerHair==='ponytail') { px.fillRect(cx-22,30,44,12); }

  // Hat
  if(playerHat==='cap')    { px.fillStyle='#dd3333'; px.fillRect(cx-24,32,48,8); px.fillRect(cx-16,14,32,20); px.fillRect(cx+10,34,16,5); }
  else if(playerHat==='cowboy') { px.fillStyle='#8B4513'; px.fillRect(cx-30,32,60,6); px.fillRect(cx-14,10,28,24); }
  else if(playerHat==='crown')  { px.fillStyle='#FFD700'; px.fillRect(cx-20,32,40,6); [[-16,8],[-8,0],[0,6],[8,0],[16,8]].forEach(([x2,y])=>px.fillRect(cx+x2-4,32-20+y,8,22-y)); px.fillStyle='#e94560'; px.fillRect(cx-4,14,8,8); px.fillRect(cx-14,20,6,6); px.fillRect(cx+8,20,6,6); }
  else if(playerHat==='helmet') { px.fillStyle='#555'; px.fillRect(cx-24,18,48,22); px.fillRect(cx-22,14,44,8); px.fillStyle='rgba(100,200,255,0.45)'; px.fillRect(cx-18,20,36,16); }
  else if(playerHat==='tophat') { px.fillStyle='#111'; px.fillRect(cx-26,34,52,6); px.fillRect(cx-16,4,32,32); }
  else if(playerHat==='beanie') { px.fillStyle=rgb(hexVal('shirtColor')); px.fillRect(cx-22,14,44,28); px.fillStyle='#fff'; px.beginPath(); px.arc(cx,14,8,0,Math.PI*2); px.fill(); }
  else if(playerHat==='fedora') { px.fillStyle='#7a5c3a'; px.fillRect(cx-28,34,56,5); px.fillRect(cx-16,12,32,24); px.fillStyle='#333'; px.fillRect(cx-16,30,32,5); }
  else if(playerHat==='wizard') { px.fillStyle='#4444aa'; px.beginPath(); px.moveTo(cx,0); px.lineTo(cx-20,36); px.lineTo(cx+20,36); px.closePath(); px.fill(); px.fillRect(cx-28,34,56,6); }
  else if(playerHat==='pirate') { px.fillStyle='#111'; px.fillRect(cx-28,32,56,6); px.fillRect(cx-18,10,36,24); px.fillStyle='#fff'; px.beginPath(); px.arc(cx,24,9,0,Math.PI*2); px.fill(); px.fillStyle='#111'; px.fillRect(cx-6,26,5,6); px.fillRect(cx+1,26,5,6); px.fillRect(cx-8,20,5,5); px.fillRect(cx+3,20,5,5); }
  else if(playerHat==='santa')  { px.fillStyle='#dd2222'; px.fillRect(cx-22,32,44,6); px.beginPath(); px.moveTo(cx-18,32); px.lineTo(cx+8,4); px.lineTo(cx+20,32); px.closePath(); px.fill(); px.fillStyle='#fff'; px.fillRect(cx-24,30,48,8); px.beginPath(); px.arc(cx+10,6,6,0,Math.PI*2); px.fill(); }

  // Nametag
  const name = document.getElementById('nameInput').value || 'Player';
  px.fillStyle='rgba(0,0,0,0.6)'; px.fillRect(cx-30,2,60,16);
  px.fillStyle='#fff'; px.font='bold 11px Arial'; px.textAlign='center';
  px.fillText(name.slice(0,10), cx, 14);
}

function refreshPreviews() {
  try { drawPreview(); } catch(e) { console.warn('drawPreview error:', e); }
  const av = document.getElementById('avatarPreview');
  if(av) { try { drawAvatarCard(av); } catch(e) { console.warn('drawAvatarCard error:', e); } }
}
try { refreshPreviews(); } catch(e) { console.warn('refreshPreviews startup error:', e); }
window.addEventListener('load', () => {
  refreshPreviews();
  loadLoginScreen();
  const createBtn = document.getElementById('createAccBtn');
  if(createBtn) createBtn.addEventListener('click', createAccount);
  const pwInput = document.getElementById('newAccPw');
  if(pwInput) pwInput.addEventListener('keydown', e => { if(e.key === 'Enter') createAccount(); });
  const nameInput2 = document.getElementById('newAccName');
  if(nameInput2) nameInput2.addEventListener('keydown', e => { if(e.key === 'Enter') document.getElementById('newAccPw').focus(); });
});

// ─── PLAY BUTTON ─────────────────────────────────────────────────────────────
document.getElementById('playBtn').addEventListener('click', () => {
  playerName  = document.getElementById('nameInput').value.trim() || 'Player';
  playerColors = { skin:hexVal('skinColor'), shirt:hexVal('shirtColor'), pants:hexVal('pantsColor'), shoes:hexVal('shoeColor'), hair:hexVal('hairColor') };
  const mm = document.getElementById('bdMonth')?.value;
  const dd = document.getElementById('bdDay')?.value;
  if(mm && dd) playerBirthday = mm + '-' + dd;
  saveCurrentUser();
  localStorage.setItem('explox_hat',       playerHat);
  localStorage.setItem('explox_hair',      playerHair);
  localStorage.setItem('explox_skin',      playerColors.skin);
  localStorage.setItem('explox_shirt',     playerColors.shirt);
  localStorage.setItem('explox_pants',     playerColors.pants);
  localStorage.setItem('explox_shoes',     playerColors.shoes);
  localStorage.setItem('explox_hairColor', playerColors.hair);
  localStorage.setItem('explox_name',      playerName);
  document.getElementById('customScreen').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  document.getElementById('sipAmount').textContent = sipDollars;
  startGame();
});

// ─── 3D GAME ─────────────────────────────────────────────────────────────────
let scene, camera, renderer, player, playerGroup;
let moveState = { w:false, a:false, s:false, d:false, run:false };
let jumpVel = 0, onGround = true;
let playerBag = []; // food items waiting to be eaten with C
let yaw = 0, pitch = 0.3;
let isPointerLocked = false;
let npcs = [], clock;
let inHouse = false;
let inMall  = false;
let inHotel = false;
let inStore = false;
let inArcade = false;
const ARCADE_COLS  = [];
const ARCADE_SPAWN = { x:70000, z:0 }; // own 10,000-unit lane, after Store(40000)/FriendHouse(50000)/Prison(60000)
const ARCADE_EXIT  = { x:40, z:90 };
let currentHotelRoom = null;
const HOTEL_COLS  = [];
const HOTEL_SPAWN = { x:30000, z:0 };
// Real bug fix: these x/z used to be each country's LANDMARK center (COUNTRY_THEMES' cx/cz) — a
// real solid collider (see buildCountryZones()'s addCol() at that exact point) — so landing after
// a flight put the player dead-center inside a wall, every country, every time. First attempt at a
// fix reused the airport's own "leave without boarding" door spot (apZ-8) — but that turned out to
// be a near-miss too, just 0.5 units clear of the neighboring filler skyline tower's own collider
// before the player's own collision radius eats that margin back up (verified live: isBlocked()
// returned true there). The actual fix, verified live for real against every country's real built
// colliders via isBlocked(): land 10 units past the airport, on its open (non-shop) side —
// x:apX=cx-30, z:apZ+10=cz+65 — genuinely open ground clear of the airport, its neighboring filler
// tower, and everything else buildTownExtras() builds.
const AIRPORT_FLIGHTS = [
  { name:'Japan',     emoji:'🌸', desc:'Neon lights, cherry blossoms & ramen',     price:80,  x:570,  z:-535 },
  { name:'France',    emoji:'🗼', desc:'Eiffel Tower, baguettes & haute couture',  price:90,  x:-630, z:-535 },
  { name:'Brazil',    emoji:'🌴', desc:'Carnival, rainforest & golden beaches',    price:75,  x:570,  z:765  },
  { name:'Egypt',     emoji:'🏛️', desc:'Pyramids, pharaohs & golden sands',       price:100, x:870,  z:365  },
  { name:'UK',        emoji:'🎡', desc:'Big Ben, red buses & afternoon tea',       price:85,  x:-730, z:-635 },
  { name:'Australia', emoji:'🦘', desc:'Outback, opera house & surf beaches',     price:95,  x:770,  z:-135 },
  { name:'Canada',    emoji:'🍁', desc:'Maple forests, mounties & hockey',        price:70,  x:-630, z:465  },
  { name:'Italy',     emoji:'🍕', desc:'Colosseum, pasta & Venice gondolas',      price:88,  x:-30,  z:-835 },
];
const HOTEL_CITY_POS = { x:-15, z:-5 };
const MALL_COLS  = [];
const MALL_DOOR  = { x:80,  z:-4 };
const MALL_SPAWN = { x:20000, z:18 };
const MALL_EXIT  = { x:20000, z:22 };

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
let notifTimer;
function showNotif(msg) {
  const el = document.getElementById('notification');
  el.textContent = msg; el.style.opacity = '1';
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => el.style.opacity = '0', 2400);
}
function updateSIP() { document.getElementById('sipAmount').textContent = sipDollars; saveCurrentUser(); }
function updateWood() {
  document.getElementById('woodAmount').textContent = woodCount;
  const cw = document.getElementById('craftWood'); if(cw) cw.textContent = woodCount;
  saveCurrentUser();
}
function updateScrapMetal() {
  document.getElementById('scrapAmount').textContent = scrapMetal;
  const cs = document.getElementById('craftScrap'); if(cs) cs.textContent = scrapMetal;
  saveCurrentUser();
}

// ─── ICE CREAM (edible: eating animation + 60% chance of brain freeze) ─────────
let _iceCreamBusy = false;
function eatIceCream(){
  if(_iceCreamBusy || _eatBusy) return;
  _iceCreamBusy = true;
  const cv = document.createElement('canvas');
  cv.width = 200; cv.height = 300;
  cv.style.cssText = 'position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:9998;pointer-events:none;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5));';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  const dur = 1500, start = performance.now();
  function frame(now){
    const p = Math.min(1,(now-start)/dur);
    ctx.clearRect(0,0,cv.width,cv.height);
    _drawIceCream(ctx,cv.width,cv.height,p,now);
    if(p<1) requestAnimationFrame(frame);
    else { cv.remove(); _finishIceCream(); }
  }
  requestAnimationFrame(frame);
}
function _drawIceCream(ctx,W,H,eaten,now){
  const cx=W/2, bob=Math.sin(now*0.012)*4;
  const coneTopY=H*0.52+bob, coneBotY=H*0.96+bob, coneHW=W*0.17;
  // waffle cone
  ctx.fillStyle='#e0b25a';
  ctx.beginPath();ctx.moveTo(cx-coneHW,coneTopY);ctx.lineTo(cx+coneHW,coneTopY);ctx.lineTo(cx,coneBotY);ctx.closePath();ctx.fill();
  ctx.save();ctx.beginPath();ctx.moveTo(cx-coneHW,coneTopY);ctx.lineTo(cx+coneHW,coneTopY);ctx.lineTo(cx,coneBotY);ctx.closePath();ctx.clip();
  ctx.strokeStyle='rgba(150,100,35,0.6)';ctx.lineWidth=2;
  for(let i=-6;i<=6;i++){ctx.beginPath();ctx.moveTo(cx-coneHW+i*16,coneTopY);ctx.lineTo(cx-coneHW+i*16+70,coneBotY);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+coneHW-i*16,coneTopY);ctx.lineTo(cx+coneHW-i*16-70,coneBotY);ctx.stroke();}
  ctx.restore();
  // scoops (eaten from the top down)
  const flavors=['#fff0a6','#9fe6d2','#ff9ec7'];
  const r=W*0.16, amountEaten=3*eaten;
  for(let s=0;s<3;s++){
    const order=2-s, eatenHere=Math.min(1,Math.max(0,amountEaten-order)), filled=1-eatenHere;
    if(filled<=0.03) continue;
    const scoopY=coneTopY - r*0.45 - s*r*0.85 + bob*0.5, rr=r*filled;
    ctx.fillStyle=flavors[s];ctx.beginPath();ctx.arc(cx,scoopY,rr,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.45)';ctx.beginPath();ctx.arc(cx-rr*0.32,scoopY-rr*0.32,rr*0.26,0,Math.PI*2);ctx.fill();
  }
  // cherry on top, before the first bite
  if(eaten<0.05){ const topY=coneTopY-r*0.45-2*r*0.85+bob*0.5; ctx.fillStyle='#e23b3b';ctx.beginPath();ctx.arc(cx,topY-r*0.95,r*0.18,0,Math.PI*2);ctx.fill(); }
}
function _finishIceCream(){
  // 60% of the time, eating it gives you brain freeze
  if(Math.random() < 0.6) _brainFreeze();
  else { _iceCreamBusy=false; tasteReaction('sweet','Ice Cream'); }
}
function _brainFreeze(){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9999;pointer-events:none;background:radial-gradient(circle at 50% 45%, rgba(180,230,255,0) 25%, rgba(120,195,255,0.55) 100%);transition:opacity .4s;';
  let flakes=''; for(let i=0;i<7;i++){ flakes+='<div style="position:absolute;font-size:'+(22+i*4)+'px;left:'+((i*17+5)%90)+'%;top:'+((i*23+8)%80)+'%;opacity:.85;">❄️</div>'; }
  ov.innerHTML=flakes+'<div style="position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);color:#0a3a66;font:bold 38px Arial;text-shadow:0 0 12px #fff,0 0 4px #fff;white-space:nowrap;">🥶 BRAIN FREEZE!</div>';
  document.body.appendChild(ov);
  showNotif('🥶 BRAIN FREEZE! Eat slower next time!');
  const dur=2200, start=performance.now();
  function f(now){ const p=(now-start)/dur, dx=Math.sin(now*0.045)*8*(1-p); ov.style.transform='translateX('+dx+'px)'; if(p<1) requestAnimationFrame(f); else { ov.style.opacity='0'; setTimeout(()=>ov.remove(),420); _iceCreamBusy=false; } }
  requestAnimationFrame(f);
}

// ─── EDIBLE FOOD (any food can be eaten; taste decides the reaction) ───────────
// C key eats the first item in playerBag (buy food first to fill it)
function addToBag(food){
  playerBag.push(food);
  updateBagHud();
  showNotif(food.emoji+' '+food.name+' added to bag! (C to eat)');
}
function eatFromBag(){
  if(_eatBusy||_iceCreamBusy) return;
  if(playerBag.length===0){ showNotif('🎒 Bag is empty — buy food first!'); return; }
  const food=playerBag.shift();
  updateBagHud();
  eatFood(food.emoji,food.name,food.taste);
}
function updateBagHud(){
  const el=document.getElementById('bagItems');
  if(!el) return;
  el.textContent=playerBag.length===0?'empty':playerBag.map(f=>f.emoji).join(' ');
}
// sweet & savory = GOOD, sour = OK, spicy = OK, bitter = BAD
const TASTE_REACTION = {
  sweet:  {face:'😋', word:'Sweet — yum!',    rating:'GOOD', col:'255,150,210'},
  savory: {face:'😋', word:'Savory — tasty!', rating:'GOOD', col:'255,200,90'},
  sour:   {face:'😝', word:'Sour — ok!',      rating:'OK',   col:'205,230,90'},
  spicy:  {face:'😤', word:'Spicy — whoa!',   rating:'OK',   col:'255,100,30'},
  bitter: {face:'🤢', word:'Bitter — yuck!',  rating:'BAD',  col:'120,200,60'},
};
let _eatBusy = false;
function eatFood(emoji,name,taste){
  if(_eatBusy || _iceCreamBusy) return;
  _eatBusy = true;
  const cv=document.createElement('canvas'); cv.width=240; cv.height=240;
  cv.style.cssText='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:9998;pointer-events:none;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5));';
  document.body.appendChild(cv);
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
  const dur=1200, start=performance.now();
  function frame(now){
    const p=Math.min(1,(now-start)/dur), remaining=1-p, within=(p*3)%1, squash=1+Math.sin(within*Math.PI)*0.14;
    ctx.clearRect(0,0,W,H);
    const base=H*0.55*(0.45+0.55*remaining);
    ctx.save();ctx.translate(W/2,H*0.55);ctx.scale(squash,2-squash);
    ctx.globalAlpha=Math.max(0,Math.min(1,remaining*1.3));
    ctx.font=base+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(emoji,0,0);ctx.restore();
    for(let i=0;i<6;i++){ const a=now*0.01+i, cr=p*W*0.42; ctx.fillStyle='rgba(210,170,90,'+remaining+')'; ctx.beginPath(); ctx.arc(W/2+Math.cos(a)*cr,H*0.55+Math.sin(a)*cr,3,0,Math.PI*2); ctx.fill(); }
    if(p<1) requestAnimationFrame(frame);
    else { cv.remove(); _eatBusy=false; tasteReaction(taste,name); }
  }
  requestAnimationFrame(frame);
}
function tasteReaction(taste,name){
  const R=TASTE_REACTION[taste]||TASTE_REACTION.savory;
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9999;pointer-events:none;background:radial-gradient(circle at 50% 42%, rgba('+R.col+',0) 30%, rgba('+R.col+',0.42) 100%);transition:opacity .4s;';
  ov.innerHTML='<div style="position:absolute;top:38%;left:50%;transform:translate(-50%,-50%);text-align:center;white-space:nowrap;"><div style="font-size:72px;">'+R.face+'</div><div style="color:#fff;font:bold 30px Arial;text-shadow:0 0 8px #000;margin-top:4px;">'+R.word+'</div><div style="color:#fff;font:bold 15px Arial;opacity:.85;text-shadow:0 0 6px #000;margin-top:2px;">'+R.rating+'</div></div>';
  document.body.appendChild(ov);
  showNotif(R.face+' '+name+': '+R.word);
  const bad=(R.rating==='BAD'), dur=1600, start=performance.now();
  function f(now){ const p=(now-start)/dur, dx=bad?Math.sin(now*0.05)*7*(1-p):0; ov.style.transform='translateX('+dx+'px)'; if(p<1) requestAnimationFrame(f); else { ov.style.opacity='0'; setTimeout(()=>ov.remove(),420); } }
  requestAnimationFrame(f);
}

// ─── HOME ACTIVITIES — real functions any house interior's furniture zones call into
// (the player's own House AND every player-built land house share these, not separate copies) ──
function sleepAtHome() {
  playerHealth = playerMaxHealth;
  updateHealthBar();
  const msgs = [
    '😴 You slept for 8 hours. Feel completely rested!',
    '💤 Dreamed about S.I.P. coins falling from the sky!',
    '🌙 Best sleep ever. The pillow was ultra fluffy!',
    '😪 You woke up feeling like a million S.I.P.!',
  ];
  showNotif(msgs[Math.floor(Date.now()/1000) % msgs.length]);
  sfx.earn();
}
function sitOnSofa() {
  playerSeated = true;
  showNotif('🛋️ You sit down. Press E to get up.');
}
const HOME_MEALS = [
  { emoji:'🍳', name:'Scrambled Eggs', taste:'savory' },
  { emoji:'🥪', name:'Sandwich',       taste:'savory' },
  { emoji:'🍝', name:'Spaghetti',      taste:'savory' },
  { emoji:'🥞', name:'Pancakes',       taste:'sweet'  },
  { emoji:'🍲', name:'Soup',           taste:'savory' },
];
function cookMeal() {
  const meal = HOME_MEALS[Math.floor(Math.random()*HOME_MEALS.length)];
  eatFood(meal.emoji, meal.name, meal.taste); // real eat animation + taste reaction, same system the Diner uses
}
const BOOK_FACTS = [
  '📚 Did you know? Octopuses have three hearts!',
  '📚 Fun fact: Honey never spoils — 3,000-year-old honey found in Egypt was still edible!',
  '📚 Did you know? A day on Venus is longer than a year on Venus!',
  "📚 Fun fact: Bananas are berries, but strawberries aren't!",
  '📚 Did you know? Sharks existed before trees!',
  '📚 Fun fact: The Eiffel Tower can grow over 6 inches taller in summer heat!',
  '📚 Did you know? Sound travels about 4x faster in water than in air!',
  '📚 Fun fact: A group of flamingos is called a "flamboyance"!',
  '📚 Did you know? Octopuses have blue blood!',
  '📚 Fun fact: A single cloud can weigh over a million pounds!',
];
let _lastBookIdx = -1;
function readBook() {
  let i = Math.floor(Math.random()*BOOK_FACTS.length);
  if (i === _lastBookIdx) i = (i+1) % BOOK_FACTS.length;
  _lastBookIdx = i;
  showNotif(BOOK_FACTS[i]);
  sfx.click();
}

// ─── COLLISION SYSTEM ─────────────────────────────────────────────────────────
const CITY_COLS = [];       // city building colliders
const HOUSE_COLS = [];      // house interior colliders

function addCol(arr, cx, cz, hw, hd) { const c = { cx, cz, hw, hd }; arr.push(c); return c; }

function isBlocked(nx, nz, rOverride) {
  const r = rOverride !== undefined ? rOverride : 0.65; // real optional radius — cars (item 159 fix) pass a bigger one
  const cols = inPrison ? [] : inFriendHouse ? [] : inLandHouse ? LAND_HOUSE_COLS : inCountryHotel ? COUNTRY_HOTEL_COLS : inAirportLounge ? AIRPORT_LOUNGE_COLS : inArcade ? ARCADE_COLS : inHotel ? HOTEL_COLS : inHouse ? HOUSE_COLS : inMall ? MALL_COLS : inStore ? STORE_COLS : CITY_COLS;
  for(const c of cols) {
    if(nx+r > c.cx-c.hw && nx-r < c.cx+c.hw &&
       nz+r > c.cz-c.hd && nz-r < c.cz+c.hd) return true;
  }
  return false;
}

// ─── JOB SYSTEM ──────────────────────────────────────────────────────────────
// Shopkeeper/Officer used to just pay out on a blind timer regardless of what the player
// was doing — you could walk away and still get paid. Now they work like the existing
// Cook & Serve job already does: you have to actually be there and respond to real tasks.
let activeJob = null, activeJobPay = 0, activeJobTaskText = '';
let jobTaskActive = false, jobTaskTimer = 0, jobNextTaskIn = 0;
const JOB_TASK_WINDOW = 4; // seconds you have to press E once a task appears

// ─── COOK & SERVE SYSTEM ─────────────────────────────────────────────────────
// cookState steps: idle → has_ingredients → preparing → prepared → cooking → ready → (serve) → idle
let cookState = 'idle';
let cookSubPresses = 0;
const PREP_PRESSES = 3;
const COOK_PRESSES = 3;
const DISH_NAMES = ['🍕 Pizza', '🍔 Burger', '🍜 Ramen', '🥗 Salad', '🍝 Pasta'];
let tableOrders = ['🍕 Pizza', '🍔 Burger', '🍜 Ramen'];
let orderBubbles = [];

// ─── ALIGNMENT & BAD GUY ─────────────────────────────────────────────────────
let alignment   = 'good'; // 'good' | 'bad'
let wantedLevel = 0;      // 0-3 stars; officers chase at 1+
const robbedCooldowns = {}; // shopName → seconds remaining

const BLACK_MARKET_ITEMS = [
  { name:'🗡️ Stiletto Knife', cost:35,  weaponId:'stiletto' },
  { name:'🥷 Shadow Hoodie',   cost:50,  shirtId:'shadow' },
];

function toggleJob(type, pay, taskText) {
  if(activeJob === type) {
    if(jobTaskActive) { completeJobTask(); return; } // E during an active task completes it, doesn't quit
    quitJob('Stopped working.');
  } else {
    activeJob = type; activeJobPay = pay; activeJobTaskText = taskText;
    jobTaskActive = false;
    jobNextTaskIn = 2 + Math.random()*3; // first task arrives soon after clocking in
    showNotif(`Started working as ${type}! Stay nearby — you'll need to help out when asked.`);
  }
}
function quitJob(msg) {
  activeJob = null; activeJobPay = 0; activeJobTaskText = '';
  jobTaskActive = false; jobTaskTimer = 0; jobNextTaskIn = 0;
  document.getElementById('jobHud').textContent = '💼 No Job';
  document.getElementById('jobHud').style.color = '#fff';
  showNotif(msg);
}
function completeJobTask() {
  if(!jobTaskActive) return;
  jobTaskActive = false;
  jobNextTaskIn = 3 + Math.random()*4;
  sipDollars += activeJobPay;
  updateSIP();
  sfx.earn();
  showNotif(`✅ Nice work! +${activeJobPay} S.I.P.`);
}

function tickJob(dt) {
  if(!activeJob) return;
  // You have to actually stay on the job — wandering off auto-fires you, no more free pay for leaving.
  const zone = CITY_ZONES.find(z => z.jobType === activeJob);
  if(zone) {
    const d = Math.hypot(playerGroup.position.x - zone.x, playerGroup.position.z - zone.z);
    if(d > zone.r) { quitJob(`You wandered off the job — ${activeJob} position given up!`); return; }
  }
  if(jobTaskActive) {
    jobTaskTimer -= dt;
    document.getElementById('jobHud').textContent = `💼 ${activeJobTaskText} [E] (${Math.max(0,jobTaskTimer).toFixed(1)}s)`;
    document.getElementById('jobHud').style.color = '#ff6644';
    if(jobTaskTimer <= 0) {
      jobTaskActive = false;
      jobNextTaskIn = 3 + Math.random()*4;
      showNotif('❌ Missed it — no pay that round.');
    }
    return;
  }
  jobNextTaskIn -= dt;
  document.getElementById('jobHud').textContent = `💼 ${activeJob} — on duty...`;
  document.getElementById('jobHud').style.color = '#FFD700';
  if(jobNextTaskIn <= 0) {
    jobTaskActive = true;
    jobTaskTimer = JOB_TASK_WINDOW;
    sfx.notify();
  }
}

function getIngredients() {
  if(cookState !== 'idle') { showNotif('Finish your current cooking first!'); return; }
  cookState = 'has_ingredients';
  cookSubPresses = 0;
  document.getElementById('jobHud').textContent = '🧺 Got ingredients!';
  document.getElementById('jobHud').style.color = '#88ff88';
  showNotif('🧺 Ingredients grabbed! Go to the Prep Counter →');
}

function prepareFood() {
  if(cookState === 'idle') { showNotif('Get ingredients from the fridge first!'); return; }
  if(cookState === 'prepared' || cookState === 'cooking' || cookState === 'ready') {
    showNotif('Already prepped! Head to the stove.'); return;
  }
  if(cookState === 'has_ingredients') { cookState = 'preparing'; cookSubPresses = 0; }
  cookSubPresses++;
  if(cookSubPresses >= PREP_PRESSES) {
    cookState = 'prepared';
    document.getElementById('jobHud').textContent = '✅ Prepped! Go cook!';
    document.getElementById('jobHud').style.color = '#FFD700';
    showNotif('✅ Food prepped! Head to the stove now.');
  } else {
    document.getElementById('jobHud').textContent = `🔪 Chopping ${cookSubPresses}/${PREP_PRESSES}`;
    showNotif(`🔪 Chop chop! (${cookSubPresses}/${PREP_PRESSES})`);
  }
}

function startCooking() {
  if(cookState === 'idle' || cookState === 'has_ingredients' || cookState === 'preparing') {
    showNotif('Prepare the food at the Prep Counter first!'); return;
  }
  if(cookState === 'ready') { showNotif('🍕 Food is ready! Deliver it to a customer.'); return; }
  if(cookState === 'prepared') { cookState = 'cooking'; cookSubPresses = 0; }
  cookSubPresses++;
  if(cookSubPresses >= COOK_PRESSES) {
    cookState = 'ready';
    document.getElementById('jobHud').textContent = '🍕 Food ready! Deliver it!';
    document.getElementById('jobHud').style.color = '#ff6600';
    showNotif('🍕 Food is cooked! Walk to a customer who ordered.');
  } else {
    document.getElementById('jobHud').textContent = `🔥 Cooking ${cookSubPresses}/${COOK_PRESSES}`;
    document.getElementById('jobHud').style.color = '#FFD700';
    showNotif(`🔥 Cooking... (${cookSubPresses}/${COOK_PRESSES})`);
  }
}

function serveAtTable(idx) {
  if(cookState !== 'ready') { showNotif('❌ Cook food first! (Fridge → Prep → Stove)'); return; }
  cookState = 'idle';
  cookSubPresses = 0;
  const dish = tableOrders[idx];
  sipDollars += 20;
  updateSIP();
  showNotif(`✅ ${dish} delivered! +20 S.I.P.`);
  document.getElementById('jobHud').textContent = '💼 No Job';
  document.getElementById('jobHud').style.color = '#fff';
  tableOrders[idx] = '✅ Thank you!';
  updateOrderBubble(idx, '✅ Thank you!');
  setTimeout(() => {
    tableOrders[idx] = DISH_NAMES[Math.floor(Math.random() * DISH_NAMES.length)];
    updateOrderBubble(idx, tableOrders[idx]);
  }, 8000);
}

function makeOrderBubble(text, x, y, z) {
  const cv = document.createElement('canvas'); cv.width = 220; cv.height = 64;
  const c = cv.getContext('2d');
  c.fillStyle = 'rgba(255,255,220,0.92)'; c.beginPath(); c.roundRect(4,4,212,56,10); c.fill();
  c.fillStyle = '#111'; c.font = 'bold 22px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(text, 110, 32);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 0.85),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, side: THREE.DoubleSide })
  );
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}

function updateOrderBubble(idx, text) {
  const mesh = orderBubbles[idx];
  if(!mesh) return;
  const cv = document.createElement('canvas'); cv.width = 220; cv.height = 64;
  const c = cv.getContext('2d');
  c.fillStyle = text.startsWith('✅') ? 'rgba(180,255,180,0.92)' : 'rgba(255,255,220,0.92)';
  c.beginPath(); c.roundRect(4,4,212,56,10); c.fill();
  c.fillStyle = '#111'; c.font = 'bold 22px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(text, 110, 32);
  mesh.material.map = new THREE.CanvasTexture(cv);
  mesh.material.needsUpdate = true;
}

function updateWantedHud() {
  const el = document.getElementById('wantedHud');
  if(wantedLevel <= 0) { el.style.display='none'; return; }
  el.style.display = 'block';
  el.textContent = '⭐'.repeat(wantedLevel) + ' WANTED';
}

function increaseWanted(n) {
  wantedLevel = Math.min(3, wantedLevel + n);
  updateWantedHud();
  showNotif(`🚔 Wanted level: ${'⭐'.repeat(wantedLevel)}`);
}

// ─── PRISON — getting arrested used to just teleport you to (-70,10), which is literally the
// CENTER of the police station's own solid exterior box — i.e. inside a plain gray building
// shell with nothing in it. Now arrest() sends you to a real furnished cell (same teleported
// pocket-space trick as House/Store/Hotel/Friend's House) and you actually serve real time.
const PRISON_SPAWN = { x:60000, z:0 };
const PRISON_ZONES = []; // nothing to interact with — you serve your time and get released automatically
let inPrison = false, prisonTimeLeft = 0;
function buildPrisonInterior() {
  const ix = PRISON_SPAWN.x, iz = PRISON_SPAWN.z;
  box(8, 0.3, 8, 0x888888, ix, 0.15, iz);        // stone floor
  box(8, 0.2, 8, 0x666666, ix, 5, iz);           // ceiling
  box(8, 5, 0.3, 0x777777, ix, 2.5, iz - 4);     // back wall
  box(0.3, 5, 8, 0x777777, ix - 4, 2.5, iz);     // left wall
  box(0.3, 5, 8, 0x777777, ix + 4, 2.5, iz);     // right wall
  for(let i = -3; i <= 3; i++) box(0.12, 5, 0.12, 0x2a2a2a, ix + i*0.9, 2.5, iz + 4); // jail bars instead of a 4th solid wall
  box(8, 0.3, 0.3, 0x2a2a2a, ix, 4.9, iz + 4);   // top bar rail
  box(2.5, 0.4, 1.2, 0x5a4a3a, ix - 2, 0.5, iz - 2.5); // cot frame
  box(2.3, 0.3, 1.0, 0xccccdd, ix - 2, 0.72, iz - 2.5); // cot mattress
  box(1.2, 1, 0.2, 0x334455, ix, 3, iz - 3.9);   // small barred window
  buildSign('🔒 CELL', ix, 5.3, iz + 4.2);
}
function arrest() {
  // Sentence length is based on how wanted you were BEFORE it resets — worse crimes, more time served.
  const sentence = 20 + wantedLevel * 15;
  const fine = Math.min(sipDollars, 40 * wantedLevel);
  sipDollars -= fine;
  wantedLevel = 0;
  updateSIP();
  updateWantedHud();
  inPrison = true;
  prisonTimeLeft = sentence;
  playerGroup.position.set(PRISON_SPAWN.x, 0, PRISON_SPAWN.z);
  yaw = Math.PI;
  showNotif(`🚔 ARRESTED! Lost ${fine} S.I.P. — locked up for ${sentence}s.`);
}
function tickPrison(dt) {
  if(!inPrison) return;
  prisonTimeLeft -= dt;
  const hud = document.getElementById('jobHud');
  hud.textContent = `🔒 Serving time: ${Math.ceil(Math.max(0, prisonTimeLeft))}s`;
  hud.style.color = '#ff6644';
  if(prisonTimeLeft <= 0) {
    inPrison = false;
    playerGroup.position.set(-70, 0, 26); // just outside the station
    yaw = Math.PI;
    showNotif('🔓 Released! Stay out of trouble...');
    hud.textContent = '💼 No Job';
    hud.style.color = '#fff';
  }
}

function robShop(shopName, gain) {
  if(robbedCooldowns[shopName] > 0) {
    showNotif(`🚫 ${shopName} already robbed! Wait ${Math.ceil(robbedCooldowns[shopName])}s`); return;
  }
  sipDollars += gain;
  updateSIP();
  robbedCooldowns[shopName] = 60;
  increaseWanted(1);
  showNotif(`🔫 Robbed ${shopName}! +${gain} S.I.P.`);
}

// ─── CINEMA SYSTEM ────────────────────────────────────────────────────────────
// ── cartoon drawing helpers ──
function _cBg(ctx,w,h,c1,c2){const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
function _cStars(ctx,w,h,t,n=60){for(let i=0;i<n;i++){const sx=(i*137.5%1)*w,sy=(i*89.3%1)*h*.75,a=.4+.6*Math.sin(t*1.8+i*2.3);ctx.fillStyle=`rgba(255,255,200,${a})`;ctx.beginPath();ctx.arc(sx,sy,.7+i%2,0,Math.PI*2);ctx.fill();}}
function _cRain(ctx,w,h,t,n=80){ctx.strokeStyle='rgba(140,170,255,0.4)';ctx.lineWidth=1;for(let i=0;i<n;i++){const rx=(i*73.1+t*190)%w,ry=(i*47.3+t*420)%h;ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx+4,ry+15);ctx.stroke();}}
function _cConfetti(ctx,w,h,t,n=55){const C=['#e94560','#ffcc00','#00e676','#00bcd4','#9c27b0','#ff9800'];for(let i=0;i<n;i++){const cx=(i*97.3%1)*w,cy=((i*47.3%1+t*.3)%1)*h,a=t*2+i,sz=5+i%8;ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.fillStyle=C[i%C.length];ctx.fillRect(-sz/2,-sz/4,sz,sz/2);ctx.restore();}}
function _cMoney(ctx,w,h,t,n=28){for(let i=0;i<n;i++){const mx=(i*113.7%1)*w,my=((i*67.1%1+t*.25)%1)*h,sz=h*.023,a=.5+.5*Math.sin(t+i);ctx.save();ctx.translate(mx,my);ctx.rotate(t*.5+i);ctx.fillStyle=`rgba(255,215,0,${a})`;ctx.beginPath();ctx.arc(0,0,sz,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8a6800';ctx.font=`bold ${sz*.9}px Arial`;ctx.textAlign='center';ctx.fillText('$',0,sz*.35);ctx.restore();}}
function _cCity(ctx,w,h,dark=true){const gc=dark?'#0a0a1a':'#c8d8f0';ctx.fillStyle=gc;ctx.fillRect(0,h*.6,w,h*.4);const B=[{x:.04,w:.08,h:.42,c:dark?'#0c1929':'#304060'},{x:.13,w:.1,h:.58,c:dark?'#091420':'#203050'},{x:.24,w:.07,h:.46,c:dark?'#0c1929':'#304060'},{x:.32,w:.12,h:.66,c:dark?'#091420':'#203050'},{x:.45,w:.08,h:.44,c:dark?'#0c1929':'#304060'},{x:.54,w:.1,h:.6,c:dark?'#091420':'#203050'},{x:.65,w:.07,h:.36,c:dark?'#0c1929':'#304060'},{x:.73,w:.09,h:.52,c:dark?'#091420':'#203050'},{x:.83,w:.08,h:.42,c:dark?'#0c1929':'#304060'},{x:.92,w:.07,h:.56,c:dark?'#091420':'#203050'}];B.forEach(b=>{ctx.fillStyle=b.c;ctx.fillRect(b.x*w,h*(.6-b.h),b.w*w,b.h*h);const rw=Math.floor(b.w*14),rh=Math.floor(b.h*9);for(let r=0;r<rh;r++)for(let c=0;c<rw;c++){const on=(r*7+c*3)%5!==0;if(on){ctx.fillStyle=dark?((r+c)%3===0?'rgba(255,220,100,.85)':'rgba(80,130,255,.5)'):'rgba(100,150,255,.4)';ctx.fillRect(b.x*w+c*(b.w*w/rw)+2,h*(.6-b.h)+r*(b.h*h/rh)+3,b.w*w/rw-2,b.h*h/rh-3);}}});}
function _cSun(ctx,x,y,r,t){for(let i=0;i<12;i++){const a=i/12*Math.PI*2+t*.25,r1=r*1.3,r2=r*1.7+Math.sin(t*2+i)*r*.1;ctx.strokeStyle='rgba(255,220,50,.5)';ctx.lineWidth=r*.07;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1);ctx.lineTo(x+Math.cos(a)*r2,y+Math.sin(a)*r2);ctx.stroke();}const sg=ctx.createRadialGradient(x,y,0,x,y,r);sg.addColorStop(0,'#ffffaa');sg.addColorStop(1,'#ffaa00');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function _cBird(ctx,x,y,sz,t){const w=Math.sin(t*6)*sz*.4;ctx.strokeStyle='#333';ctx.lineWidth=sz*.14;ctx.beginPath();ctx.moveTo(x-sz,y);ctx.quadraticCurveTo(x-sz*.5,y-w,x,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x+sz,y);ctx.quadraticCurveTo(x+sz*.5,y-w,x,y);ctx.stroke();}
function _cPlanet(ctx,x,y,r,c1,c2,t){const g=ctx.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);g.addColorStop(0,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();ctx.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<4;i++){const a=t*.08+i*1.4,bx=x+Math.cos(a)*r*.4,by=y+Math.sin(a)*r*.3;ctx.beginPath();ctx.ellipse(bx,by,r*.26,r*.16,a,0,Math.PI*2);ctx.fill();}ctx.restore();ctx.fillStyle='rgba(255,255,255,.1)';ctx.beginPath();ctx.ellipse(x-r*.28,y-r*.28,r*.34,r*.22,-.5,0,Math.PI*2);ctx.fill();}
function _cExplo(ctx,x,y,r,p){for(let i=0;i<3;i++){const er=r*p*(1+i*.4),a=(1-p)/(i+1);ctx.strokeStyle=`rgba(255,${200-i*60|0},0,${a})`;ctx.lineWidth=r*.07*(1-p*.5);ctx.beginPath();ctx.arc(x,y,er,0,Math.PI*2);ctx.stroke();}for(let i=0;i<14;i++){const a=i/14*Math.PI*2,sr=r*p*1.4,sx=x+Math.cos(a)*sr,sy=y+Math.sin(a)*sr;ctx.fillStyle=`rgba(255,150,0,${1-p})`;ctx.beginPath();ctx.arc(sx,sy,r*.05*(1-p),0,Math.PI*2);ctx.fill();}if(p<.5){const cg=ctx.createRadialGradient(x,y,0,x,y,r*.4*(1-p*2));cg.addColorStop(0,'rgba(255,255,255,.9)');cg.addColorStop(.5,'rgba(255,220,0,.7)');cg.addColorStop(1,'rgba(255,100,0,0)');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(x,y,r*.4*(1-p*2),0,Math.PI*2);ctx.fill();}}
function _cLines(ctx,x,y,r,n=12,col='rgba(255,255,255,.12)'){ctx.strokeStyle=col;ctx.lineWidth=2;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.4,y+Math.sin(a)*r*.4);ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.stroke();}}
// ── cartoon characters ──
function _cRobot(ctx,x,y,sz,t,walk=false){const b=walk?Math.sin(t*6)*sz*.03:0,la=walk?Math.sin(t*6)*.35:0;ctx.fillStyle='#7a8fa0';ctx.save();ctx.translate(x-sz*.12,y+sz*.22+b);ctx.rotate(la);ctx.beginPath();ctx.roundRect(-sz*.1,0,sz*.2,sz*.36,sz*.05);ctx.fill();ctx.restore();ctx.save();ctx.translate(x+sz*.12,y+sz*.22+b);ctx.rotate(-la);ctx.beginPath();ctx.roundRect(-sz*.1,0,sz*.2,sz*.36,sz*.05);ctx.fill();ctx.restore();ctx.fillStyle='#556070';[[-sz*.14,sz*.56],[sz*.14,sz*.56]].forEach(([fx,fy])=>{ctx.beginPath();ctx.roundRect(x+fx-sz*.09,y+fy+b,sz*.19,sz*.07,sz*.03);ctx.fill();});ctx.fillStyle='#aabbcc';ctx.beginPath();ctx.roundRect(x-sz*.28,y-sz*.22+b,sz*.56,sz*.46,sz*.07);ctx.fill();ctx.strokeStyle='#8899aa';ctx.lineWidth=sz*.02;ctx.beginPath();ctx.moveTo(x-sz*.28,y+b);ctx.lineTo(x+sz*.28,y+b);ctx.stroke();const glow=.4+.6*Math.sin(t*2.5);ctx.fillStyle=`rgba(0,200,255,${glow})`;ctx.beginPath();ctx.arc(x,y+b,sz*.08,0,Math.PI*2);ctx.fill();const aa=walk?Math.sin(t*6+Math.PI)*.3:0;ctx.fillStyle='#8899aa';ctx.save();ctx.translate(x-sz*.28,y-sz*.12+b);ctx.rotate(-aa);ctx.beginPath();ctx.roundRect(-sz*.08,-sz*.06,sz*.16,sz*.32,sz*.05);ctx.fill();ctx.restore();ctx.save();ctx.translate(x+sz*.28,y-sz*.12+b);ctx.rotate(aa);ctx.beginPath();ctx.roundRect(-sz*.08,-sz*.06,sz*.16,sz*.32,sz*.05);ctx.fill();ctx.restore();ctx.fillStyle='#8899bb';ctx.beginPath();ctx.roundRect(x-sz*.22,y-sz*.7+b,sz*.44,sz*.5,sz*.09);ctx.fill();ctx.fillStyle=`rgb(0,${180+75*Math.sin(t*3)|0},255)`;ctx.fillRect(x-sz*.18,y-sz*.55+b,sz*.14,sz*.1);ctx.fillRect(x+sz*.04,y-sz*.55+b,sz*.14,sz*.1);ctx.fillStyle='#445566';ctx.fillRect(x-sz*.14,y-sz*.38+b,sz*.28,sz*.06);ctx.strokeStyle='#aabbcc';ctx.lineWidth=sz*.03;ctx.beginPath();ctx.moveTo(x,y-sz*.7+b);ctx.lineTo(x,y-sz*.95+b);ctx.stroke();ctx.fillStyle=Math.sin(t*4)>.3?'#ff4040':'#880000';ctx.beginPath();ctx.arc(x,y-sz*.97+b,sz*.055,0,Math.PI*2);ctx.fill();}
function _cDino(ctx,x,y,sz,t,roar=false){const b=Math.sin(t*2)*sz*.02,jaw=roar?Math.abs(Math.sin(t*8))*sz*.12:sz*.01;ctx.fillStyle='#388e3c';ctx.beginPath();ctx.moveTo(x+sz*.35,y+b);ctx.quadraticCurveTo(x+sz*.8,y+sz*.05+b,x+sz*.7,y+sz*.42+b);ctx.lineTo(x+sz*.52,y+sz*.38+b);ctx.closePath();ctx.fill();ctx.fillStyle='#4caf50';ctx.beginPath();ctx.ellipse(x,y+b,sz*.42,sz*.3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a5d6a7';ctx.beginPath();ctx.ellipse(x,y+sz*.08+b,sz*.24,sz*.18,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2e7d32';for(let i=0;i<5;i++){const sx=x-sz*.1+i*sz*.14,sy=y-sz*.26+b;ctx.beginPath();ctx.moveTo(sx-sz*.05,sy+sz*.05);ctx.lineTo(sx,sy-sz*.18);ctx.lineTo(sx+sz*.05,sy+sz*.05);ctx.closePath();ctx.fill();}ctx.fillStyle='#388e3c';ctx.beginPath();ctx.roundRect(x-sz*.22,y+sz*.24+b,sz*.15,sz*.3,sz*.04);ctx.fill();ctx.beginPath();ctx.roundRect(x+sz*.07,y+sz*.24+b,sz*.15,sz*.3,sz*.04);ctx.fill();ctx.fillStyle='#4caf50';ctx.beginPath();ctx.ellipse(x-sz*.34,y-sz*.05+b,sz*.08,sz*.05,.4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(x-sz*.18,y-sz*.18+b);ctx.lineTo(x-sz*.42,y-sz*.52+b);ctx.lineTo(x-sz*.18,y-sz*.52+b);ctx.lineTo(x-sz*.04,y-sz*.16+b);ctx.closePath();ctx.fill();ctx.beginPath();ctx.ellipse(x-sz*.52,y-sz*.5+b-jaw,sz*.18,sz*.1,.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2e7d32';ctx.beginPath();ctx.ellipse(x-sz*.52,y-sz*.44+b+jaw*.5,sz*.16,sz*.08,-.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-sz*.5+i*sz*.06,y-sz*.48+b-jaw);ctx.lineTo(x-sz*.47+i*sz*.06,y-sz*.42+b);ctx.lineTo(x-sz*.44+i*sz*.06,y-sz*.48+b-jaw);ctx.closePath();ctx.fill();}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-sz*.32,y-sz*.5+b,sz*.1,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(x-sz*.32,y-sz*.49+b,sz*.065,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-sz*.29,y-sz*.52+b,sz*.022,0,Math.PI*2);ctx.fill();}
function _cRocket(ctx,x,y,sz,t){const fl=.7+.3*Math.sin(t*15);const fg=ctx.createRadialGradient(x,y+sz*.6,sz*.01,x,y+sz*.55,sz*.32*fl);fg.addColorStop(0,'#fff');fg.addColorStop(.3,'#ffcc00');fg.addColorStop(1,'rgba(255,50,0,0)');ctx.fillStyle=fg;ctx.beginPath();ctx.ellipse(x,y+sz*.58+sz*.08*fl,sz*.14,sz*.28*fl,0,0,Math.PI*2);ctx.fill();const bg=ctx.createLinearGradient(x-sz*.16,0,x+sz*.16,0);bg.addColorStop(0,'#c0c8d8');bg.addColorStop(.5,'#e8eef8');bg.addColorStop(1,'#c0c8d8');ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(x-sz*.15,y-sz*.42,sz*.3,sz*.72,sz*.06);ctx.fill();ctx.fillStyle='#e94560';ctx.beginPath();ctx.moveTo(x,y-sz*.68);ctx.lineTo(x-sz*.15,y-sz*.42);ctx.lineTo(x+sz*.15,y-sz*.42);ctx.closePath();ctx.fill();ctx.fillStyle='#c0392b';ctx.beginPath();ctx.moveTo(x-sz*.15,y+sz*.22);ctx.lineTo(x-sz*.32,y+sz*.55);ctx.lineTo(x-sz*.15,y+sz*.3);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(x+sz*.15,y+sz*.22);ctx.lineTo(x+sz*.32,y+sz*.55);ctx.lineTo(x+sz*.15,y+sz*.3);ctx.closePath();ctx.fill();ctx.fillStyle='#88ccff';ctx.beginPath();ctx.arc(x,y-sz*.1,sz*.1,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5588aa';ctx.lineWidth=sz*.03;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(x-sz*.03,y-sz*.13,sz*.05,0,Math.PI*2);ctx.fill();}
function _cGrandma(ctx,x,y,sz,t,kick=false){const b=Math.sin(t*3)*sz*.01;ctx.fillStyle='#7b1fa2';ctx.beginPath();ctx.moveTo(x-sz*.18,y-sz*.04+b);ctx.lineTo(x+sz*.18,y-sz*.04+b);ctx.lineTo(x+sz*.3,y+sz*.56+b);ctx.lineTo(x-sz*.3,y+sz*.56+b);ctx.closePath();ctx.fill();if(kick){const ka=-.8+Math.sin(t*10)*.25;ctx.fillStyle='#c97a50';ctx.save();ctx.translate(x+sz*.05,y+sz*.35+b);ctx.rotate(ka);ctx.beginPath();ctx.roundRect(-sz*.07,0,sz*.14,sz*.32,sz*.04);ctx.fill();ctx.fillStyle='#333';ctx.beginPath();ctx.ellipse(0,sz*.34,sz*.1,sz*.055,0,0,Math.PI*2);ctx.fill();ctx.restore();}else{ctx.fillStyle='#c97a50';ctx.beginPath();ctx.roundRect(x-sz*.16,y+sz*.4+b,sz*.13,sz*.28,sz*.04);ctx.fill();ctx.beginPath();ctx.roundRect(x+sz*.03,y+sz*.4+b,sz*.13,sz*.28,sz*.04);ctx.fill();}const aa=kick?Math.sin(t*10)*.4:Math.sin(t*2)*.08;ctx.fillStyle='#7b1fa2';ctx.save();ctx.translate(x-sz*.18,y-sz*.1+b);ctx.rotate(.3+aa);ctx.beginPath();ctx.roundRect(-sz*.05,0,sz*.12,sz*.28,sz*.04);ctx.fill();ctx.restore();ctx.save();ctx.translate(x+sz*.18,y-sz*.1+b);ctx.rotate(-.3-aa);ctx.beginPath();ctx.roundRect(-sz*.05,0,sz*.12,sz*.28,sz*.04);ctx.fill();if(kick){ctx.fillStyle='#d4a56a';ctx.beginPath();ctx.roundRect(sz*.12,sz*.04,sz*.04,sz*.22,sz*.02);ctx.fill();ctx.fillStyle='#c8965a';ctx.beginPath();ctx.ellipse(sz*.14,sz*.04,sz*.08,sz*.04,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(sz*.14,sz*.26,sz*.08,sz*.04,0,0,Math.PI*2);ctx.fill();}ctx.restore();ctx.fillStyle='#c97a50';ctx.beginPath();ctx.ellipse(x,y-sz*.14+b,sz*.16,sz*.14,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f5c89a';ctx.beginPath();ctx.arc(x,y-sz*.38+b,sz*.22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#bdbdbd';ctx.beginPath();ctx.arc(x,y-sz*.58+b,sz*.16,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+sz*.1,y-sz*.63+b,sz*.1,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#555';ctx.lineWidth=sz*.025;ctx.beginPath();ctx.arc(x-sz*.09,y-sz*.38+b,sz*.075,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(x+sz*.09,y-sz*.38+b,sz*.075,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x-sz*.015,y-sz*.38+b);ctx.lineTo(x+sz*.015,y-sz*.38+b);ctx.stroke();ctx.fillStyle='rgba(100,200,255,.15)';ctx.beginPath();ctx.arc(x-sz*.09,y-sz*.38+b,sz*.075,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+sz*.09,y-sz*.38+b,sz*.075,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#c06040';ctx.lineWidth=sz*.025;ctx.beginPath();ctx.arc(x,y-sz*.31+b,sz*.08,.2,Math.PI-.2);ctx.stroke();}
function _cNinja(ctx,x,y,sz,t,fly=false){const b=fly?Math.sin(t*8)*sz*.05:0;ctx.fillStyle='#111';if(fly){ctx.save();ctx.translate(x-sz*.1,y+sz*.2+b);ctx.rotate(-.4);ctx.beginPath();ctx.roundRect(-sz*.07,0,sz*.14,sz*.3,sz*.04);ctx.fill();ctx.restore();ctx.save();ctx.translate(x+sz*.1,y+sz*.2+b);ctx.rotate(.4);ctx.beginPath();ctx.roundRect(-sz*.07,0,sz*.14,sz*.3,sz*.04);ctx.fill();ctx.restore();}else{ctx.beginPath();ctx.roundRect(x-sz*.17,y+sz*.22+b,sz*.14,sz*.3,sz*.04);ctx.fill();ctx.beginPath();ctx.roundRect(x+sz*.03,y+sz*.22+b,sz*.14,sz*.3,sz*.04);ctx.fill();}ctx.beginPath();ctx.ellipse(x,y+b,sz*.2,sz*.26,0,0,Math.PI*2);ctx.fill();const aa=fly?-.8:Math.sin(t*5)*.2;ctx.save();ctx.translate(x-sz*.2,y-sz*.1+b);ctx.rotate(.3+aa);ctx.beginPath();ctx.roundRect(-sz*.06,0,sz*.12,sz*.28,sz*.04);ctx.fill();ctx.restore();ctx.save();ctx.translate(x+sz*.2,y-sz*.1+b);ctx.rotate(-.3-aa);ctx.beginPath();ctx.roundRect(-sz*.06,0,sz*.12,sz*.28,sz*.04);ctx.fill();ctx.restore();ctx.beginPath();ctx.arc(x,y-sz*.35+b,sz*.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff4444';ctx.beginPath();ctx.arc(x-sz*.08,y-sz*.36+b,sz*.045,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+sz*.08,y-sz*.36+b,sz*.045,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(x-sz*.08,y-sz*.36+b,sz*.025,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+sz*.08,y-sz*.36+b,sz*.025,0,Math.PI*2);ctx.fill();}
function _cCat(ctx,x,y,sz,t,fly=false){const b=fly?Math.sin(t*4)*sz*.06:Math.sin(t*2)*sz*.01,cw=Math.sin(t*3)*sz*.04;ctx.fillStyle='#e94560';ctx.beginPath();ctx.moveTo(x,y-sz*.05+b);ctx.quadraticCurveTo(x+sz*.45,y+sz*.05+b+cw,x+sz*.32,y+sz*.5+b+cw);ctx.lineTo(x+sz*.05,y+sz*.22+b);ctx.closePath();ctx.fill();ctx.fillStyle='#ff8c42';ctx.beginPath();ctx.ellipse(x,y+b,sz*.18,sz*.24,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(180,60,0,.4)';ctx.lineWidth=sz*.04;for(let i=-1;i<=1;i+=2){ctx.beginPath();ctx.moveTo(x+i*sz*.06,y-sz*.15+b);ctx.lineTo(x+i*sz*.09,y+sz*.1+b);ctx.stroke();}ctx.strokeStyle='#ff8c42';ctx.lineWidth=sz*.09;ctx.beginPath();ctx.moveTo(x+sz*.17,y+sz*.08+b);ctx.quadraticCurveTo(x+sz*.42,y+sz*.38+b,x+sz*.28,y+sz*.54+b);ctx.stroke();ctx.fillStyle='#ff8c42';ctx.beginPath();ctx.arc(x,y-sz*.28+b,sz*.22,0,Math.PI*2);ctx.fill();[[-.18,-.4,-.28,-.56,-.08,-.42],[.18,-.4,.28,-.56,.08,-.42]].forEach(([bx,by,tx,ty,i1x,i1y])=>{ctx.fillStyle='#ff8c42';ctx.beginPath();ctx.moveTo(x+bx*sz,y+by*sz+b);ctx.lineTo(x+tx*sz,y+ty*sz+b);ctx.lineTo(x+i1x*sz,y+i1y*sz+b);ctx.closePath();ctx.fill();ctx.fillStyle='#ffccaa';ctx.beginPath();ctx.moveTo(x+bx*sz*.9,y+(by*sz)*.92+b*.08);ctx.lineTo(x+tx*sz*.82,y+(ty*sz)*.84+b*.16);ctx.lineTo(x+i1x*sz*.9,y+(i1y*sz)*.92+b*.08);ctx.closePath();ctx.fill();});ctx.fillStyle='#90ee90';ctx.beginPath();ctx.arc(x-sz*.09,y-sz*.3+b,sz*.075,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+sz*.09,y-sz*.3+b,sz*.075,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(x-sz*.09,y-sz*.3+b,sz*.04,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+sz*.09,y-sz*.3+b,sz*.04,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(x-sz*.07,y-sz*.33+b,sz*.016,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff6699';ctx.beginPath();ctx.arc(x,y-sz*.22+b,sz*.032,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=sz*.013;ctx.beginPath();ctx.moveTo(x-sz*.01,y-sz*.22+b);ctx.lineTo(x+sz*.22,y-sz*.21+b);ctx.stroke();ctx.beginPath();ctx.moveTo(x+sz*.01,y-sz*.22+b);ctx.lineTo(x-sz*.22,y-sz*.21+b);ctx.stroke();if(fly){const la=.4+.6*Math.sin(t*14);ctx.strokeStyle=`rgba(255,255,50,${la})`;ctx.lineWidth=sz*.06;ctx.beginPath();ctx.moveTo(x-sz*.14,y+b);ctx.lineTo(x-sz*.36,y+sz*.22+b);ctx.lineTo(x-sz*.2,y+sz*.22+b);ctx.lineTo(x-sz*.42,y+sz*.47+b);ctx.stroke();}}
function _cPizza(ctx,x,y,sz,t,evil=false){const b=Math.sin(t*2)*sz*.025;ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(x,y+sz*.58+b,sz*.52,sz*.1,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c8a04a';ctx.beginPath();ctx.arc(x,y+b,sz*.52,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e53935';ctx.beginPath();ctx.arc(x,y+b,sz*.42,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fdd835';ctx.beginPath();ctx.arc(x,y+b,sz*.34,0,Math.PI*2);ctx.fill();[[-.15,-.12],[.14,-.18],[.02,.14],[-.2,.1],[.18,.06],[0,-.02]].forEach(([tx,ty])=>{ctx.fillStyle='#c62828';ctx.beginPath();ctx.arc(x+tx*sz*2,y+ty*sz*2+b,sz*.065,0,Math.PI*2);ctx.fill();});if(evil){ctx.strokeStyle='#111';ctx.lineWidth=sz*.065;ctx.beginPath();ctx.moveTo(x-sz*.24,y-sz*.16+b);ctx.lineTo(x-sz*.06,y-sz*.07+b);ctx.stroke();ctx.beginPath();ctx.moveTo(x+sz*.24,y-sz*.16+b);ctx.lineTo(x+sz*.06,y-sz*.07+b);ctx.stroke();const ep=.5+.5*Math.sin(t*5);ctx.fillStyle=`rgba(255,${50+50*ep|0},0,${ep})`;ctx.beginPath();ctx.arc(x-sz*.15,y-sz*.02+b,sz*.09,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+sz*.15,y-sz*.02+b,sz*.09,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#111';ctx.lineWidth=sz*.045;ctx.beginPath();ctx.arc(x,y+sz*.18+b,sz*.22,.15,Math.PI-.15);ctx.stroke();}else{ctx.strokeStyle='#333';ctx.lineWidth=sz*.03;ctx.beginPath();ctx.arc(x-sz*.12,y-sz*.04+b,sz*.08,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(x+sz*.12,y-sz*.04+b,sz*.08,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(x,y+sz*.12+b,sz*.16,.1,Math.PI-.1);ctx.stroke();}}
function _cDetective(ctx,x,y,sz,t){const b=Math.sin(t*1.5)*sz*.01;ctx.fillStyle='#795548';ctx.beginPath();ctx.moveTo(x-sz*.22,y-sz*.04+b);ctx.lineTo(x+sz*.22,y-sz*.04+b);ctx.lineTo(x+sz*.3,y+sz*.56+b);ctx.lineTo(x-sz*.3,y+sz*.56+b);ctx.closePath();ctx.fill();ctx.fillStyle='#6d4c41';ctx.beginPath();ctx.moveTo(x-sz*.1,y-sz*.04+b);ctx.lineTo(x,y+sz*.18+b);ctx.lineTo(x-sz*.22,y+sz*.3+b);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(x+sz*.1,y-sz*.04+b);ctx.lineTo(x,y+sz*.18+b);ctx.lineTo(x+sz*.22,y+sz*.3+b);ctx.closePath();ctx.fill();ctx.fillStyle='#4e342e';ctx.fillRect(x-sz*.24,y+sz*.16+b,sz*.48,sz*.07);ctx.fillStyle='#795548';ctx.save();ctx.translate(x-sz*.22,y-sz*.04+b);ctx.rotate(.2);ctx.beginPath();ctx.roundRect(-sz*.07,0,sz*.14,sz*.32,sz*.04);ctx.fill();ctx.restore();const gt=.5+Math.sin(t*2)*.12;ctx.save();ctx.translate(x+sz*.22,y-sz*.04+b);ctx.rotate(-gt);ctx.beginPath();ctx.roundRect(-sz*.07,0,sz*.14,sz*.32,sz*.04);ctx.fill();ctx.strokeStyle='#aaa';ctx.lineWidth=sz*.055;ctx.beginPath();ctx.arc(0,sz*.4,sz*.15,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(150,210,255,.2)';ctx.beginPath();ctx.arc(0,sz*.4,sz*.15,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#888';ctx.lineWidth=sz*.04;ctx.beginPath();ctx.moveTo(sz*.11,sz*.51);ctx.lineTo(sz*.2,sz*.62);ctx.stroke();ctx.restore();ctx.fillStyle='#795548';ctx.beginPath();ctx.roundRect(x-sz*.17,y+sz*.4+b,sz*.14,sz*.3,sz*.04);ctx.fill();ctx.beginPath();ctx.roundRect(x+sz*.03,y+sz*.4+b,sz*.14,sz*.3,sz*.04);ctx.fill();ctx.fillStyle='#f5c89a';ctx.beginPath();ctx.arc(x,y-sz*.26+b,sz*.21,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4e342e';ctx.beginPath();ctx.roundRect(x-sz*.24,y-sz*.44+b,sz*.48,sz*.2,sz*.04);ctx.fill();ctx.fillRect(x-sz*.3,y-sz*.27+b,sz*.6,sz*.055);ctx.fillStyle='#333';ctx.beginPath();ctx.arc(x-sz*.09,y-sz*.28+b,sz*.043,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+sz*.09,y-sz*.28+b,sz*.043,0,Math.PI*2);ctx.fill();ctx.fillStyle='#5d4037';ctx.beginPath();ctx.ellipse(x-sz*.08,y-sz*.19+b,sz*.07,sz*.03,-.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+sz*.08,y-sz*.19+b,sz*.07,sz*.03,.2,0,Math.PI*2);ctx.fill();}
function _cAlien(ctx,x,y,sz,t,angry=false){ctx.fillStyle='#33cc33';ctx.beginPath();ctx.ellipse(x,y+sz*.15,sz*.12,sz*.22,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#44dd44';ctx.beginPath();ctx.ellipse(x,y-sz*.18,sz*.26,sz*.3,0,0,Math.PI*2);ctx.fill();[-1,1].forEach(s=>{ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x+s*sz*.1,y-sz*.2,sz*.08,sz*.12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=angry?'#ff0000':'#4400ff';ctx.beginPath();ctx.arc(x+s*sz*.1,y-sz*.2,sz*.035,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.arc(x+s*sz*.1-sz*.02,y-sz*.24,sz*.018,0,Math.PI*2);ctx.fill();});const aw=Math.sin(t*2.5)*sz*.04;ctx.strokeStyle='#44dd44';ctx.lineWidth=sz*.035;ctx.beginPath();ctx.moveTo(x-sz*.1,y-sz*.44);ctx.lineTo(x-sz*.18+aw,y-sz*.6);ctx.stroke();ctx.beginPath();ctx.moveTo(x+sz*.1,y-sz*.44);ctx.lineTo(x+sz*.18+aw,y-sz*.6);ctx.stroke();ctx.fillStyle='#88ff88';ctx.beginPath();ctx.arc(x-sz*.18+aw,y-sz*.63,sz*.045,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+sz*.18+aw,y-sz*.63,sz*.045,0,Math.PI*2);ctx.fill();const ab=Math.sin(t*1.5)*sz*.04;ctx.strokeStyle='#33cc33';ctx.lineWidth=sz*.06;ctx.beginPath();ctx.moveTo(x-sz*.11,y+sz*.05);ctx.lineTo(x-sz*.28,y+sz*.14+ab);ctx.stroke();ctx.beginPath();ctx.moveTo(x+sz*.11,y+sz*.05);ctx.lineTo(x+sz*.28,y+sz*.14-ab);ctx.stroke();ctx.beginPath();ctx.moveTo(x-sz*.06,y+sz*.35);ctx.lineTo(x-sz*.1,y+sz*.52);ctx.stroke();ctx.beginPath();ctx.moveTo(x+sz*.06,y+sz*.35);ctx.lineTo(x+sz*.1,y+sz*.52);ctx.stroke();}
function _cDragon(ctx,x,y,sz,t,breathe=false){ctx.strokeStyle='#cc2200';ctx.lineWidth=sz*.09;ctx.beginPath();ctx.moveTo(x+sz*.18,y+sz*.08);ctx.quadraticCurveTo(x+sz*.48,y+sz*.32,x+sz*.52+Math.sin(t*2)*sz*.1,y+sz*.52);ctx.stroke();ctx.fillStyle='#dd2200';ctx.beginPath();ctx.ellipse(x,y,sz*.26,sz*.18,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffaa44';ctx.beginPath();ctx.ellipse(x,y+sz*.04,sz*.16,sz*.1,0,0,Math.PI*2);ctx.fill();const wf=Math.sin(t*3)*sz*.07;ctx.fillStyle='rgba(180,20,0,.75)';ctx.beginPath();ctx.moveTo(x-sz*.08,y-sz*.08);ctx.lineTo(x-sz*.42,y-sz*.38-wf);ctx.lineTo(x-sz*.18,y-sz*.1);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(x+sz*.08,y-sz*.08);ctx.lineTo(x+sz*.42,y-sz*.38-wf);ctx.lineTo(x+sz*.18,y-sz*.1);ctx.closePath();ctx.fill();ctx.fillStyle='#dd2200';ctx.beginPath();ctx.moveTo(x-sz*.08,y-sz*.14);ctx.lineTo(x-sz*.2,y-sz*.42);ctx.lineTo(x-sz*.06,y-sz*.4);ctx.closePath();ctx.fill();ctx.beginPath();ctx.ellipse(x-sz*.22,y-sz*.5,sz*.18,sz*.12,-.35,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffee00';ctx.beginPath();ctx.arc(x-sz*.3,y-sz*.52,sz*.04,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(x-sz*.3,y-sz*.52,sz*.02,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff5500';for(let i=0;i<4;i++){const sx=x-sz*.14+i*sz*.1;ctx.beginPath();ctx.moveTo(sx,y-sz*.17);ctx.lineTo(sx+sz*.04,y-sz*.05);ctx.lineTo(sx-sz*.04,y-sz*.05);ctx.closePath();ctx.fill();}if(breathe){const fa=.5+.5*Math.abs(Math.sin(t*6));ctx.fillStyle=`rgba(255,160,0,${fa})`;ctx.beginPath();ctx.moveTo(x-sz*.38,y-sz*.5);ctx.lineTo(x-sz*.38-sz*.35,y-sz*.48+sz*.03);ctx.lineTo(x-sz*.38-sz*.18,y-sz*.54);ctx.closePath();ctx.fill();ctx.fillStyle=`rgba(255,50,0,${fa*.7})`;ctx.beginPath();ctx.moveTo(x-sz*.38,y-sz*.5);ctx.lineTo(x-sz*.38-sz*.22,y-sz*.49);ctx.lineTo(x-sz*.38-sz*.1,y-sz*.52);ctx.closePath();ctx.fill();}}
function _cCar(ctx,x,y,sz,t,col='#ff2200'){const b=Math.sin(t*4)*sz*.007;ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(x,y+sz*.24,sz*.38,sz*.055,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x-sz*.4,y-sz*.1+b,sz*.8,sz*.2,sz*.05);ctx.fill();ctx.beginPath();ctx.roundRect(x-sz*.18,y-sz*.28+b,sz*.36,sz*.2,sz*.06);ctx.fill();ctx.fillStyle='rgba(120,210,255,.7)';ctx.beginPath();ctx.roundRect(x-sz*.14,y-sz*.26+b,sz*.28,sz*.16,sz*.04);ctx.fill();[x-sz*.26,x+sz*.26].forEach(wx=>{ctx.fillStyle='#111';ctx.beginPath();ctx.arc(wx,y+sz*.13+b,sz*.12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#555';ctx.beginPath();ctx.arc(wx,y+sz*.13+b,sz*.065,0,Math.PI*2);ctx.fill();});ctx.fillStyle='rgba(255,255,255,.45)';ctx.fillRect(x-sz*.36,y-sz*.03+b,sz*.72,sz*.036);const ef=.4+.6*Math.abs(Math.sin(t*9));ctx.fillStyle=`rgba(255,140,0,${ef})`;ctx.beginPath();ctx.moveTo(x-sz*.4,y+sz*.02+b);ctx.lineTo(x-sz*.52-ef*sz*.08,y);ctx.lineTo(x-sz*.4,y-sz*.05+b);ctx.closePath();ctx.fill();}

// ── sounds per scene: [{t:seconds, fn:'sfxMethodName'}, ...] ──
const CINEMA_SOUNDS = [
  // Movie 0: Robot Dinosaurs From Space 3
  [
    [{t:0,fn:'mystery'},{t:2.5,fn:'laser'}],
    [{t:0,fn:'robo'},{t:1.5,fn:'robo'},{t:3.2,fn:'robo'}],
    [{t:0,fn:'robo'},{t:2,fn:'laser'}],
    [{t:0,fn:'launch'},{t:2.2,fn:'launch'}],
    [{t:0,fn:'mystery'},{t:2.5,fn:'laser'}],
    [{t:0,fn:'boom'},{t:1.5,fn:'hit'},{t:3,fn:'hit'}],
    [{t:0,fn:'robo'},{t:2.2,fn:'tense'}],
    [{t:0,fn:'mystery'},{t:2.5,fn:'dino'}],
    [{t:0,fn:'dino'},{t:2.5,fn:'dino'}],
    [{t:0,fn:'launch'},{t:2,fn:'hit'}],
    [{t:0,fn:'robo'},{t:1,fn:'dino'},{t:3,fn:'hit'}],
    [{t:0,fn:'boom'},{t:1.5,fn:'dino'},{t:3.2,fn:'boom'}],
    [{t:0,fn:'boom'},{t:2,fn:'boom'}],
    [{t:0,fn:'robo'},{t:1,fn:'dino'},{t:2.5,fn:'boom'}],
    [{t:0,fn:'cheer'},{t:2.5,fn:'cheer'}],
  ],
  // Movie 1: Ninja Grandma Returns
  [
    [{t:0,fn:'mystery'},{t:2.5,fn:'notify'}],
    [{t:0,fn:'notify'}],
    [{t:1,fn:'notify'},{t:3,fn:'notify'}],
    [{t:0,fn:'whoosh'},{t:2,fn:'swipe'}],
    [{t:0,fn:'tense'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'boom'},{t:1.8,fn:'alarm'}],
    [{t:0,fn:'hit'},{t:1.5,fn:'swipe'},{t:3,fn:'hit'}],
    [{t:0,fn:'notify'},{t:2,fn:'whoosh'}],
    [{t:0,fn:'whoosh'},{t:2.5,fn:'tense'}],
    [{t:0,fn:'hit'},{t:1.5,fn:'swipe'},{t:3,fn:'hit'}],
    [{t:0,fn:'swipe'},{t:1.5,fn:'hit'},{t:3.2,fn:'swipe'}],
    [{t:0,fn:'tense'},{t:2.2,fn:'mystery'}],
    [{t:0,fn:'whoosh'},{t:1.5,fn:'hit'},{t:3,fn:'boom'}],
    [{t:0,fn:'boom'},{t:2,fn:'cheer'}],
    [{t:0,fn:'notify'},{t:2,fn:'cheer'}],
  ],
  // Movie 2: Super Cat vs Evil Pizza
  [
    [{t:0,fn:'mystery'},{t:2.5,fn:'tense'}],
    [{t:0,fn:'tense'},{t:3,fn:'mystery'}],
    [{t:0,fn:'tense'},{t:2.2,fn:'mystery'}],
    [{t:0,fn:'boom'},{t:2,fn:'alarm'}],
    [{t:0,fn:'alarm'},{t:2.2,fn:'boom'}],
    [{t:0,fn:'laser'},{t:2.2,fn:'reveal'}],
    [{t:0,fn:'mystery'},{t:2.5,fn:'power'}],
    [{t:0,fn:'power'},{t:2.5,fn:'reveal'}],
    [{t:0,fn:'launch'},{t:2,fn:'whoosh'}],
    [{t:0,fn:'whoosh'},{t:1.5,fn:'whoosh'},{t:3.2,fn:'whoosh'}],
    [{t:0,fn:'boom'},{t:1.5,fn:'hit'},{t:3.2,fn:'boom'}],
    [{t:0,fn:'tense'},{t:2.2,fn:'dino'}],
    [{t:0,fn:'hit'},{t:2.5,fn:'power'}],
    [{t:0,fn:'power'},{t:1.5,fn:'laser'},{t:3,fn:'boom'}],
    [{t:0,fn:'boom'},{t:1.5,fn:'cheer'},{t:3.2,fn:'cheer'}],
  ],
  // Movie 3: Mystery of the Missing S.I.P.
  [
    [{t:0,fn:'thunder'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'tense'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'alarm'},{t:2,fn:'boom'}],
    [{t:0,fn:'reveal'},{t:2.5,fn:'notify'}],
    [{t:0,fn:'phone'},{t:2.2,fn:'mystery'}],
    [{t:0,fn:'mystery'},{t:2.5,fn:'tense'}],
    [{t:0,fn:'tense'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'mystery'},{t:2.5,fn:'reveal'}],
    [{t:0,fn:'tense'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'tense'},{t:2.2,fn:'mystery'}],
    [{t:0,fn:'tense'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'reveal'},{t:1.5,fn:'cheer'}],
    [{t:0,fn:'alarm'},{t:2.5,fn:'tense'}],
    [{t:0,fn:'tense'},{t:2.5,fn:'hit'}],
    [{t:0,fn:'cheer'},{t:1.5,fn:'coin'},{t:3.2,fn:'cheer'}],
  ],
  // Movie 4: Attack of the Giant Dino-Bot
  [
    [{t:0,fn:'mystery'}],[{t:0,fn:'dino'},{t:2,fn:'robo'}],[{t:0,fn:'dino'},{t:2.5,fn:'alarm'}],
    [{t:0,fn:'boom'},{t:2.5,fn:'alarm'}],[{t:0,fn:'alarm'},{t:2.5,fn:'robo'}],[{t:0,fn:'power'},{t:2.5,fn:'robo'}],
    [{t:0,fn:'dino'},{t:1.5,fn:'laser'},{t:3,fn:'robo'}],[{t:0,fn:'dino'},{t:2,fn:'whoosh'}],
    [{t:0,fn:'robo'},{t:2.5,fn:'whoosh'}],[{t:0,fn:'robo'},{t:2.5,fn:'reveal'}],
    [{t:0,fn:'alarm'},{t:2,fn:'laser'}],[{t:0,fn:'boom'},{t:1.5,fn:'boom'},{t:3,fn:'boom'}],
    [{t:0,fn:'notify'},{t:2.5,fn:'earn'}],[{t:0,fn:'cheer'},{t:2,fn:'cheer'}],
    [{t:0,fn:'cheer'},{t:1.5,fn:'coin'},{t:3,fn:'cheer'}],
  ],
  // Movie 5: Grandma In Space
  [
    [{t:0,fn:'notify'}],[{t:0,fn:'mystery'},{t:2.5,fn:'whoosh'}],[{t:0,fn:'mystery'}],
    [{t:0,fn:'launch'},{t:2,fn:'whoosh'}],[{t:0,fn:'mystery'},{t:2.5,fn:'notify'}],
    [{t:0,fn:'reveal'},{t:2.5,fn:'mystery'}],[{t:0,fn:'notify'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'earn'},{t:2.5,fn:'notify'}],[{t:0,fn:'cheer'},{t:2.5,fn:'earn'}],
    [{t:0,fn:'launch'},{t:2,fn:'robo'}],[{t:0,fn:'cheer'},{t:2.5,fn:'coin'}],
    [{t:0,fn:'reveal'},{t:2.5,fn:'notify'}],[{t:0,fn:'whoosh'},{t:2.5,fn:'launch'}],
    [{t:0,fn:'notify'},{t:2.5,fn:'earn'}],[{t:0,fn:'cheer'},{t:1.5,fn:'coin'},{t:3,fn:'cheer'}],
  ],
  // Movie 6: Ghost Detective
  [
    [{t:0,fn:'mystery'},{t:2.5,fn:'tense'}],[{t:0,fn:'mystery'},{t:2.5,fn:'reveal'}],
    [{t:0,fn:'alarm'},{t:2.5,fn:'tense'}],[{t:0,fn:'mystery'},{t:2.5,fn:'whoosh'}],
    [{t:0,fn:'tense'},{t:2.5,fn:'mystery'}],[{t:0,fn:'tense'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'reveal'},{t:2.5,fn:'tense'}],[{t:0,fn:'whoosh'},{t:2,fn:'tense'}],
    [{t:0,fn:'tense'},{t:2.5,fn:'reveal'}],[{t:0,fn:'cheer'},{t:2.5,fn:'coin'}],
    [{t:0,fn:'notify'},{t:2.5,fn:'cheer'}],[{t:0,fn:'mystery'},{t:2.5,fn:'tense'}],
    [{t:0,fn:'mystery'},{t:2.5,fn:'tense'}],[{t:0,fn:'mystery'},{t:2.5,fn:'tense'}],
    [{t:0,fn:'cheer'},{t:1.5,fn:'coin'},{t:3,fn:'cheer'}],
  ],
  // Movie 7: Intergalactic Grand Prix
  [
    [{t:0,fn:'cheer'},{t:2.5,fn:'earn'}],[{t:0,fn:'robo'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'earn'},{t:2,fn:'launch'}],[{t:0,fn:'whoosh'},{t:2,fn:'launch'}],
    [{t:0,fn:'launch'},{t:2,fn:'power'}],[{t:0,fn:'earn'},{t:2,fn:'cheer'}],
    [{t:0,fn:'boom'},{t:2,fn:'alarm'}],[{t:0,fn:'alarm'},{t:2,fn:'whoosh'}],
    [{t:0,fn:'launch'},{t:2.5,fn:'power'}],[{t:0,fn:'whoosh'},{t:2,fn:'launch'}],
    [{t:0,fn:'cheer'},{t:2.5,fn:'earn'}],[{t:0,fn:'cheer'},{t:1.5,fn:'cheer'}],
    [{t:0,fn:'cheer'},{t:1.5,fn:'coin'},{t:3,fn:'cheer'}],[{t:0,fn:'nope'},{t:2,fn:'alarm'}],
    [{t:0,fn:'cheer'},{t:1.5,fn:'coin'},{t:3,fn:'cheer'}],
  ],
  // Movie 8: Ninja Academy
  [
    [{t:0,fn:'mystery'},{t:2.5,fn:'whoosh'}],[{t:0,fn:'notify'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'tense'},{t:2.5,fn:'mystery'}],[{t:0,fn:'whoosh'},{t:2,fn:'hit'}],
    [{t:0,fn:'hit'},{t:2,fn:'nope'}],[{t:0,fn:'earn'},{t:2.5,fn:'hit'}],
    [{t:0,fn:'power'},{t:2,fn:'earn'}],[{t:0,fn:'tense'},{t:2,fn:'robo'}],
    [{t:0,fn:'laser'},{t:2,fn:'whoosh'}],[{t:0,fn:'hit'},{t:2,fn:'boom'}],
    [{t:0,fn:'cheer'},{t:1.5,fn:'earn'}],[{t:0,fn:'alarm'},{t:2,fn:'tense'}],
    [{t:0,fn:'hit'},{t:2,fn:'boom'},{t:3.5,fn:'cheer'}],[{t:0,fn:'cheer'},{t:2,fn:'earn'}],
    [{t:0,fn:'cheer'},{t:1.5,fn:'coin'},{t:3,fn:'cheer'}],
  ],
  // Movie 9: Aliens Ate My Pizza
  [
    [{t:0,fn:'earn'},{t:2.5,fn:'notify'}],[{t:0,fn:'alarm'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'mystery'},{t:2.5,fn:'robo'}],[{t:0,fn:'alarm'},{t:2,fn:'whoosh'}],
    [{t:0,fn:'robo'},{t:2,fn:'cheer'}],[{t:0,fn:'alarm'},{t:2,fn:'alarm'}],
    [{t:0,fn:'boom'},{t:2,fn:'whoosh'}],[{t:0,fn:'boom'},{t:2,fn:'cheer'}],
    [{t:0,fn:'cheer'},{t:2,fn:'robo'}],[{t:0,fn:'notify'},{t:2.5,fn:'earn'}],
    [{t:0,fn:'earn'},{t:2.5,fn:'cheer'}],[{t:0,fn:'cheer'},{t:2,fn:'earn'}],
    [{t:0,fn:'coin'},{t:2,fn:'cheer'}],[{t:0,fn:'cheer'},{t:2,fn:'earn'}],
    [{t:0,fn:'cheer'},{t:1.5,fn:'coin'},{t:3,fn:'cheer'}],
  ],
  // Movie 10: The Dragon and the Robot
  [
    [{t:0,fn:'robo'},{t:2.5,fn:'mystery'}],[{t:0,fn:'dino'},{t:2,fn:'mystery'}],
    [{t:0,fn:'tense'},{t:2.5,fn:'mystery'}],[{t:0,fn:'dino'},{t:2,fn:'boom'},{t:3.5,fn:'robo'}],
    [{t:0,fn:'tense'},{t:2.5,fn:'mystery'}],[{t:0,fn:'mystery'},{t:2.5,fn:'notify'}],
    [{t:0,fn:'alarm'},{t:2.5,fn:'tense'}],[{t:0,fn:'notify'},{t:2.5,fn:'earn'}],
    [{t:0,fn:'dino'},{t:1.5,fn:'robo'},{t:3,fn:'boom'}],[{t:0,fn:'boom'},{t:2,fn:'cheer'}],
    [{t:0,fn:'cheer'},{t:2,fn:'earn'}],[{t:0,fn:'robo'},{t:2.5,fn:'dino'}],
    [{t:0,fn:'cheer'},{t:2,fn:'earn'}],[{t:0,fn:'cheer'},{t:2,fn:'cheer'}],
    [{t:0,fn:'cheer'},{t:1.5,fn:'coin'},{t:3,fn:'cheer'}],
  ],
  // Movie 11: Super Cat 2: Pizza's Revenge
  [
    [{t:0,fn:'notify'},{t:2.5,fn:'earn'}],[{t:0,fn:'tense'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'alarm'},{t:2.5,fn:'boom'}],[{t:0,fn:'alarm'},{t:2,fn:'earn'}],
    [{t:0,fn:'power'},{t:2.5,fn:'earn'}],[{t:0,fn:'alarm'},{t:2,fn:'tense'}],
    [{t:0,fn:'hit'},{t:2,fn:'boom'}],[{t:0,fn:'whoosh'},{t:2,fn:'hit'}],
    [{t:0,fn:'hit'},{t:2,fn:'cheer'}],[{t:0,fn:'whoosh'},{t:2,fn:'launch'}],
    [{t:0,fn:'power'},{t:2,fn:'launch'}],[{t:0,fn:'boom'},{t:1.5,fn:'boom'},{t:3,fn:'cheer'}],
    [{t:0,fn:'cheer'},{t:2,fn:'earn'}],[{t:0,fn:'cheer'},{t:2,fn:'cheer'}],
    [{t:0,fn:'cheer'},{t:1.5,fn:'coin'},{t:3,fn:'cheer'}],
  ],
  // Movie 12: The Explox Games
  [
    [{t:0,fn:'cheer'},{t:2,fn:'earn'}],[{t:0,fn:'notify'},{t:2,fn:'cheer'}],
    [{t:0,fn:'earn'},{t:2,fn:'cheer'}],[{t:0,fn:'earn'},{t:2,fn:'cheer'}],
    [{t:0,fn:'hit'},{t:2,fn:'boom'}],[{t:0,fn:'robo'},{t:2,fn:'earn'}],
    [{t:0,fn:'cheer'},{t:2,fn:'earn'}],[{t:0,fn:'launch'},{t:2,fn:'whoosh'}],
    [{t:0,fn:'dino'},{t:2,fn:'tense'}],[{t:0,fn:'hit'},{t:2,fn:'cheer'}],
    [{t:0,fn:'cheer'},{t:2,fn:'coin'}],[{t:0,fn:'cheer'},{t:1.5,fn:'coin'}],
    [{t:0,fn:'cheer'},{t:2,fn:'earn'}],[{t:0,fn:'cheer'},{t:2,fn:'earn'}],
    [{t:0,fn:'cheer'},{t:1.5,fn:'coin'},{t:3,fn:'cheer'}],
  ],
  // Movie 13: Time Travel Trouble
  [
    [{t:0,fn:'mystery'},{t:2.5,fn:'robo'}],[{t:0,fn:'alarm'},{t:2,fn:'power'}],
    [{t:0,fn:'dino'},{t:2,fn:'alarm'}],[{t:0,fn:'whoosh'},{t:2,fn:'launch'}],
    [{t:0,fn:'mystery'},{t:2.5,fn:'notify'}],[{t:0,fn:'mystery'},{t:2,fn:'whoosh'}],
    [{t:0,fn:'whoosh'},{t:2,fn:'hit'}],[{t:0,fn:'robo'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'launch'},{t:2,fn:'robo'}],[{t:0,fn:'robo'},{t:2.5,fn:'mystery'}],
    [{t:0,fn:'mystery'},{t:2.5,fn:'notify'}],[{t:0,fn:'alarm'},{t:2,fn:'tense'}],
    [{t:0,fn:'reveal'},{t:2.5,fn:'earn'}],[{t:0,fn:'whoosh'},{t:1.5,fn:'launch'},{t:3,fn:'cheer'}],
    [{t:0,fn:'cheer'},{t:1.5,fn:'coin'},{t:3,fn:'cheer'}],
  ],
];

// ── movie data with animated draw functions ──
const CINEMA_MOVIES = [
  { title:'Robot Dinosaurs From Space 3', genre:'🚀 Sci-Fi Action', price:30, bg:'#0a0a2e', icons:'🤖🦕🚀',
    trailer:[
      {text:'🌌 A long time ago in a galaxy far away...',       dur:2500},
      {text:'🤖 The robot army has returned...',               dur:2000},
      {text:'🦕 But DINOSAURS rule this galaxy now!',          dur:2000},
      {text:'💥 ROBOT DINOSAURS FROM SPACE 3 💥',             dur:3000},
    ],
    scenes:[
      { dur:5, text:'In a galaxy far, far away...', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#000033');_cStars(ctx,w,h,t,100);
        _cPlanet(ctx,w*.8,h*.3,h*.12,'#cc4400','#660000',t);
        _cPlanet(ctx,w*.18,h*.25,h*.07,'#224488','#001144',t+1);
        _cPlanet(ctx,w*.55,h*.65,h*.05,'#888800','#444400',t+2);
        const fa=.6+.4*Math.sin(t*.8);ctx.globalAlpha=fa;ctx.fillStyle='rgba(255,255,200,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('In a galaxy far, far away...',w*.5,h*.15);ctx.globalAlpha=1;
      }},
      { dur:5, text:'The Robot Army awakens!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');_cStars(ctx,w,h,t,50);
        for(let i=0;i<Math.min(5,1+Math.floor(t*.8));i++)_cRobot(ctx,w*(.08+i*.2),h*.54,h*.2,t+i*.5,true);
        const la=.5+.5*Math.abs(Math.sin(t*3));ctx.fillStyle=`rgba(0,200,255,${la*.8})`;ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('THE ROBOT ARMY AWAKENS!',w*.5,h*.22);
      }},
      { dur:5, text:'Captain Robo-Rex gets the mission!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#030318','#080830');_cStars(ctx,w,h,t,40);
        _cRobot(ctx,w*.28,h*.52,h*.28,t,false);
        const hg=ctx.createRadialGradient(w*.65,h*.42,0,w*.65,h*.42,h*.18);hg.addColorStop(0,'rgba(0,255,200,.3)');hg.addColorStop(1,'rgba(0,200,255,0)');ctx.fillStyle=hg;ctx.beginPath();ctx.arc(w*.65,h*.42,h*.18,0,Math.PI*2);ctx.fill();
        _cPlanet(ctx,w*.65,h*.42,h*.09,'#3d8b3d','#1a4d1a',t);
        ctx.strokeStyle='rgba(0,200,255,.5)';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(w*.37,h*.45);ctx.lineTo(w*.56,h*.42);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='rgba(0,200,255,.8)';ctx.font=`${h*.03}px Arial`;ctx.textAlign='center';ctx.fillText('TARGET: DINO PLANET',w*.65,h*.62);
      }},
      { dur:5, text:'The fleet launches! Engines at full power!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#000022');_cStars(ctx,w,h,t,80);
        for(let i=0;i<4;i++){const ry=h*(.22+i*.17)-t*h*.04;if(ry>-h*.3)_cRocket(ctx,w*(.22+i*.2),ry,h*.16,t+i*.3);}
        const la=.5+.5*Math.abs(Math.sin(t*8));ctx.fillStyle=`rgba(255,150,0,${la*.7})`;ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('ENGINES: MAXIMUM!',w*.5,h*.88);
      }},
      { dur:5, text:'Cruising through deep space...', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#000033');_cStars(ctx,w,h,t,90);
        _cPlanet(ctx,w*(1.1-t*.05),h*.28,h*.07,'#553311','#331100',t);
        const rx=w*(.1+Math.min(.55,t*.1)),ry=h*.42+Math.sin(t*.7)*h*.04;
        _cRocket(ctx,rx,ry,h*.2,t);
        for(let i=0;i<3;i++){const bx=w*(.08+i*.32+t*.025),by=h*(.3+i*.06);if(bx<w*.9)_cBird(ctx,bx,by,h*.012,t+i);}
      }},
      { dur:5, text:'THE ASTEROID FIELD! Evasive maneuvers!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000022','#050515');_cStars(ctx,w,h,t,60);
        for(let i=0;i<12;i++){const ax=((i*137.5+t*80)%w),ay=h*(.05+i*.07);ctx.fillStyle='#888';ctx.save();ctx.translate(ax,ay);ctx.rotate(t*.3+i);ctx.beginPath();ctx.ellipse(0,0,h*.016+i%4*h*.007,h*.01,i*.5,0,Math.PI*2);ctx.fill();ctx.restore();}
        const rx=w*.4+Math.sin(t*3)*w*.08,ry=h*.48+Math.cos(t*2.5)*h*.1;
        _cRocket(ctx,rx,ry,h*.16,t);
        ctx.fillStyle='rgba(255,100,0,.7)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('EVASIVE MANEUVERS!',w*.5,h*.88);
      }},
      { dur:5, text:'Something big on the scanner...', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001100','#000022');_cStars(ctx,w,h,t,55);
        const rx=w*.15,ry=h*.55;_cRocket(ctx,rx,ry,h*.14,t);
        const ping=((t*(.5+t*.08))%2);
        if(ping<1){ctx.strokeStyle=`rgba(0,255,100,${1-ping})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(rx,ry,ping*w*.25,0,Math.PI*2);ctx.stroke();}
        const dotR=h*(.01+Math.min(.06,t*.013));ctx.fillStyle='#3d8b3d';ctx.beginPath();ctx.arc(w*.7,h*.4,dotR,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(0,255,100,.8)';ctx.font=`${h*.035}px Arial`;ctx.textAlign='center';ctx.fillText('UNKNOWN OBJECT DETECTED',w*.5,h*.22);
        const qa=.5+.5*Math.sin(t*3);ctx.fillStyle=`rgba(255,220,0,${qa})`;ctx.fillText('⚠️  MASSIVE SIZE  ⚠️',w*.5,h*.28);
      }},
      { dur:5, text:'THE DINOSAUR PLANET appears!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000022','#001100');_cStars(ctx,w,h,t,50);
        const pr=h*(.06+Math.min(.38,t*.074));
        _cPlanet(ctx,w*.58,h*.42,pr,'#3d8b3d','#1a4d1a',t);
        const rx=w*.12,ry=h*.58+Math.sin(t)*h*.03;_cRocket(ctx,rx,ry,h*.12,t);
        if(t>2){const fa=Math.min(1,(t-2));ctx.globalAlpha=fa;ctx.font=`${h*.06}px Arial`;ctx.textAlign='center';ctx.fillText('😱',rx,ry-h*.12);ctx.globalAlpha=1;}
      }},
      { dur:5, text:'Dinosaurs spotted! They look ANGRY.', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001800','#000c00');_cStars(ctx,w,h,t,30);
        ctx.fillStyle='#1a4d1a';ctx.fillRect(0,h*.65,w,h*.35);
        ctx.fillStyle='#3d8b3d';ctx.beginPath();ctx.ellipse(w*.5,h*.65,w*.55,h*.12,0,0,Math.PI*2);ctx.fill();
        [{x:.2},{x:.45},{x:.7},{x:.88}].slice(0,Math.min(4,1+Math.floor(t*.7))).forEach((d,i)=>_cDino(ctx,w*d.x,h*.58,h*.2,t+i*.7,true));
        const ra=.5+.5*Math.abs(Math.sin(t*4));ctx.fillStyle=`rgba(255,50,50,${ra})`;ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('HOSTILES CONFIRMED — PREPARE!',w*.5,h*.18);
      }},
      { dur:5, text:'The robots attempt to land...', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001800','#001100');
        ctx.fillStyle='#1a4d1a';ctx.fillRect(0,h*.72,w,h*.28);ctx.fillStyle='#2d6b2d';ctx.beginPath();ctx.ellipse(w*.5,h*.72,w*.6,h*.1,0,0,Math.PI*2);ctx.fill();
        const ry=h*(-0.1+Math.min(.62,t*.16));_cRocket(ctx,w*.5,ry,h*.2,t);
        if(t>3){for(let i=0;i<5;i++){const dc=(t-3)/2,dx=w*(.38+i*.06),dy=h*.7;ctx.fillStyle=`rgba(180,160,100,${dc*.3})`;ctx.beginPath();ctx.arc(dx,dy,h*.04*dc,0,Math.PI*2);ctx.fill();}}
      }},
      { dur:5, text:'FIRST CONTACT! The dinos attack!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001500','#000800');ctx.fillStyle='#1a4d1a';ctx.fillRect(0,h*.7,w,h*.3);
        _cRobot(ctx,w*.28,h*.52,h*.24,t,false);_cDino(ctx,w*.72,h*.5,h*.26,t,true);
        const la=.4+.6*Math.abs(Math.sin(t*9));
        ctx.strokeStyle=`rgba(255,200,0,${la})`;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*.37,h*.52);ctx.lineTo(w*.5,h*.46+Math.sin(t*11)*h*.05);ctx.lineTo(w*.62,h*.52);ctx.stroke();
        ctx.fillStyle=`rgba(255,100,0,${la*.8})`;ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('INCOMING!',w*.5,h*.3);
      }},
      { dur:5, text:'BATTLE rages across the whole planet!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#040a04','#000500');ctx.fillStyle='#1a4d1a';ctx.fillRect(0,h*.72,w,h*.28);
        _cRobot(ctx,w*.12,h*.55,h*.18,t,true);_cDino(ctx,w*.28,h*.52,h*.2,t+.3,true);
        _cRobot(ctx,w*.55,h*.54,h*.17,t+.8,true);_cDino(ctx,w*.72,h*.52,h*.2,t+1.1,true);
        for(let i=0;i<3;i++){const ep=((t+i*1.7)%1.7)/1.7;_cExplo(ctx,w*(.3+i*.25),h*(.35+i*.08),h*.09,ep);}
        const ia=.4+.6*Math.abs(Math.sin(t*6));ctx.fillStyle=`rgba(255,80,0,${ia})`;ctx.font=`bold ${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('PLANET-WIDE BATTLE!',w*.5,h*.18);
      }},
      { dur:5, text:'The Robot Base is HIT! Explosion!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050005','#100010');_cStars(ctx,w,h,t,40);
        _cExplo(ctx,w*.5,h*.42,h*.42,Math.min(.99,t*.22));
        if(t<2){ctx.fillStyle='rgba(255,80,0,.4)';ctx.fillRect(0,0,w,h);}
        if(t>2){const la=.5+.5*Math.abs(Math.sin(t*5));ctx.fillStyle=`rgba(255,50,50,${la})`;ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('ROBOT BASE: DESTROYED',w*.5,h*.22);}
        for(let i=0;i<8;i++){const dx=w*.5+Math.cos(i/8*Math.PI*2)*t*h*.12,dy=h*.42+Math.sin(i/8*Math.PI*2)*t*h*.08;ctx.fillStyle='#556070';ctx.fillRect(dx,dy,h*.015,h*.01);}
      }},
      { dur:5, text:'Captain Robo-Rex vs Dino King: FINAL SHOWDOWN!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000022','#100022');_cStars(ctx,w,h,t,60);
        _cLines(ctx,w*.5,h*.45,h*.42,18,'rgba(255,255,255,.07)');
        _cRobot(ctx,w*.22,h*.5,h*.28,t,false);_cDino(ctx,w*.78,h*.48,h*.3,t,true);
        const la=.3+.7*Math.abs(Math.sin(t*9));
        ctx.strokeStyle=`rgba(0,200,255,${la})`;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(w*.32,h*.5);ctx.lineTo(w*.5,h*.38+Math.sin(t*12)*h*.07);ctx.lineTo(w*.68,h*.5);ctx.stroke();
        ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle=`rgba(255,220,0,${la*.8})`;ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('FINAL SHOWDOWN!',w*.5,h*.2);
      }},
      { dur:5, text:'GALAXY SAVED! Peace between robots and dinos!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#110022');_cStars(ctx,w,h,t,85);
        if(t<2.5){_cExplo(ctx,w*.5,h*.4,h*.35,t/2.5);}
        if(t>1.5){const fa=Math.min(1,(t-1.5)*.7);ctx.globalAlpha=fa;_cRobot(ctx,w*.3,h*.52,h*.22,t);_cDino(ctx,w*.7,h*.5,h*.24,t);ctx.globalAlpha=1;}
        if(t>3){ctx.font=`${h*.1}px Arial`;ctx.textAlign='center';ctx.fillText('🏆',w*.5,h*.36);}
        if(t>2){_cConfetti(ctx,w,h,t-2,Math.min(55,(t-2)*8)|0);}
        if(t>3.5){const fa=Math.min(1,(t-3.5)*.8);ctx.fillStyle=`rgba(200,180,255,${fa})`;ctx.font=`bold ${h*.045}px Arial`;ctx.textAlign='center';ctx.fillText('GALAXY SAVED! ...Until Part 4',w*.5,h*.18);}
      }},
    ]
  },
  { title:'Ninja Grandma Returns', genre:'👵 Comedy Action', price:20, bg:'#1a0a00', icons:'👵🥷🍵',
    trailer:[
      {text:"👵 She's 80 years old...",            dur:2000},
      {text:'🥷 She knows 47 martial arts...',     dur:2000},
      {text:'🍵 And she always has tea at 3pm.',   dur:2000},
      {text:'⚡ NINJA GRANDMA RETURNS ⚡',        dur:3000},
    ],
    scenes:[
      { dur:5, text:'A peaceful village at sunrise...', draw(ctx,w,h,t){
        const r1=Math.min(255,60+t*30)|0,g1=Math.min(180,40+t*22)|0;
        _cBg(ctx,w,h,`rgb(${r1},${g1},100)`,'#87ceeb');
        ctx.fillStyle='#5a9e3c';ctx.fillRect(0,h*.68,w,h*.32);ctx.beginPath();ctx.ellipse(w*.25,h*.72,w*.3,h*.18,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(w*.75,h*.7,w*.28,h*.16,0,0,Math.PI*2);ctx.fill();
        _cSun(ctx,w*.5,h*(.85-t*.12),h*Math.min(.07,.015+t*.012),t);
        for(let i=0;i<4;i++)_cBird(ctx,w*(.05+i*.22)+t*w*.02,h*(.15+i*.03),h*.015,t+i*.4);
        ctx.fillStyle='#d4a56a';ctx.fillRect(w*.72,h*.44,w*.2,h*.26);ctx.fillStyle='#c0392b';ctx.beginPath();ctx.moveTo(w*.7,h*.44);ctx.lineTo(w*.82,h*.3);ctx.lineTo(w*.94,h*.44);ctx.closePath();ctx.fill();
      }},
      { dur:5, text:"Grandma tends her flower garden...", draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#c8e8ff');ctx.fillStyle='#4a8e2c';ctx.fillRect(0,h*.68,w,h*.32);
        _cSun(ctx,w*.85,h*.15,h*.065,t);
        for(let i=0;i<3;i++)_cBird(ctx,w*(.12+i*.18)+Math.sin(t+i)*w*.03,h*(.12+i*.03),h*.014,t+i*.5);
        ['🌸','🌺','🌼','🌷','🌸'].forEach((f,i)=>{ctx.font=`${h*.045}px Arial`;ctx.textAlign='center';ctx.fillText(f,w*(.15+i*.17),h*.73+Math.sin(t*.8+i)*.003*h);});
        _cGrandma(ctx,w*.5,h*.62,h*.22,t,false);
        ctx.font=`${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('🌱',w*.6,h*.7);
      }},
      { dur:5, text:"Perfect tea time — 3pm exactly.", draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#f5ead0','#e8d8b0');
        ctx.fillStyle='#c8a870';ctx.fillRect(0,0,w,h*.6);ctx.fillStyle='#8a6240';ctx.fillRect(0,h*.6,w,h*.4);
        ctx.fillStyle='#6b4226';ctx.fillRect(w*.3,h*.52,w*.4,h*.07);ctx.fillRect(w*.33,h*.59,w*.06,h*.22);ctx.fillRect(w*.61,h*.59,w*.06,h*.22);
        ctx.font=`${h*.1}px Arial`;ctx.textAlign='center';ctx.fillText('🫖',w*.5,h*.52);ctx.font=`${h*.065}px Arial`;ctx.fillText('☕',w*.38,h*.54);ctx.fillText('☕',w*.62,h*.54);
        for(let i=0;i<3;i++){const sa=.4+.4*Math.sin(t*2+i);ctx.strokeStyle=`rgba(200,200,200,${sa})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.5+i*w*.02-w*.02,h*.4);ctx.quadraticCurveTo(w*.5+i*w*.03-w*.015,h*.3,w*.5+i*w*.015-w*.015,h*.28);ctx.stroke();}
        _cGrandma(ctx,w*.28,h*.55,h*.22,t,false);
        ctx.fillStyle='#4a2e0a';ctx.font=`${h*.04}px Arial`;ctx.fillText('3:00 PM — Perfect.',w*.5,h*.22);
      }},
      { dur:5, text:"FLASHBACK: Young Grandma's ninja training!", draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a0a00','#0d0500');ctx.fillStyle='rgba(100,60,0,.3)';ctx.fillRect(0,0,w,h);
        ctx.fillStyle='#5c3d1e';ctx.fillRect(0,h*.65,w,h*.35);for(let i=0;i<6;i++){ctx.fillStyle='#4a2e10';ctx.fillRect(i*w/6,h*.65,1,h*.35);}
        _cGrandma(ctx,w*.4+Math.sin(t*4)*h*.02,h*.54,h*.26,t,true);
        for(let i=0;i<2;i++){ctx.fillStyle='#8B4513';ctx.beginPath();ctx.arc(w*(.65+i*.15),h*.45,h*.065,0,Math.PI*2);ctx.fill();ctx.fillRect(w*(.647+i*.15),h*.45,h*.006,h*.2);}
        ctx.fillStyle='rgba(255,220,100,.85)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('FLASHBACK — 60 YEARS AGO',w*.5,h*.15);
        ctx.fillStyle='rgba(255,200,80,.7)';ctx.font=`${h*.03}px Arial`;ctx.fillText('Training: Day 1 of 21,900',w*.5,h*.21);
      }},
      { dur:5, text:'DUSK FALLS... and shadows move.', draw(ctx,w,h,t){
        const dark=Math.min(1,t*.22);
        _cBg(ctx,w,h,`rgb(${200-180*dark|0},${120-100*dark|0},${60-50*dark|0})`,`rgb(${80-70*dark|0},${40-30*dark|0},${10*dark|0})`);
        ctx.fillStyle='#3a6e1a';ctx.fillRect(0,h*.68,w,h*.32);ctx.beginPath();ctx.ellipse(w*.25,h*.72,w*.28,h*.15,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=`rgb(${20+40*dark|0},${30+20*dark|0},${20*dark|0})`;ctx.fillRect(w*.65,h*.42,w*.15,h*.28);ctx.fillRect(w*.82,h*.48,w*.12,h*.22);
        const ns=Math.min(1,t*.3);for(let i=0;i<3;i++){ctx.fillStyle=`rgba(0,0,0,${ns})`;ctx.beginPath();ctx.arc(w*(-.05+i*.55),h*.75,h*.06,0,Math.PI*2);ctx.fill();}
        if(t>2){const la=.4+.4*Math.sin(t*3);ctx.fillStyle=`rgba(255,50,50,${la})`;ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('DANGER APPROACHES...',w*.5,h*.22);}
      }},
      { dur:5, text:'Ninjas breach the village gate!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0500','#050200');ctx.fillStyle='#3a1e08';ctx.fillRect(0,h*.7,w,h*.3);
        ctx.fillStyle='#4a2e10';ctx.fillRect(w*.42,h*.35,w*.16,h*.38);ctx.fillRect(w*.36,h*.32,w*.28,h*.06);
        ctx.fillStyle='#c8a060';ctx.beginPath();ctx.arc(w*.5,h*.38,h*.04,0,Math.PI*2);ctx.fill();
        for(let i=0;i<Math.min(4,Math.floor(t*.9));i++){const nx=w*(.55+i*.1+t*.05),ny=h*.55;_cNinja(ctx,nx,ny,h*.2,t+i*.4,true);}
        const la=.5+.5*Math.abs(Math.sin(t*5));ctx.fillStyle=`rgba(255,0,0,${la})`;ctx.font=`bold ${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('THE GATE IS BREACHED!',w*.5,h*.2);
      }},
      { dur:5, text:'The tea shop: UNDER ATTACK!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#080300','#050100');
        ctx.fillStyle='#c8a060';ctx.fillRect(w*.25,h*.2,w*.5,h*.55);ctx.fillStyle='#8B6330';ctx.fillRect(w*.25,h*.2,w*.5,h*.07);
        ctx.fillStyle='#d4a870';ctx.fillRect(w*.38,h*.48,w*.24,h*.27);ctx.fillStyle='#c8d8f0';ctx.fillRect(w*.3,h*.32,w*.14,h*.14);ctx.fillRect(w*.56,h*.32,w*.14,h*.14);
        ctx.fillStyle='#8B2800';ctx.fillRect(w*.32,h*.18,w*.36,h*.06);ctx.fillStyle='white';ctx.font=`${h*.03}px Arial`;ctx.textAlign='center';ctx.fillText('🍵 TEA SHOP',w*.5,h*.22);
        _cNinja(ctx,w*.2,h*.5,h*.2,t,false);
        const ia=.5+.5*Math.abs(Math.sin(t*7));_cLines(ctx,w*.35,h*.4,h*.14,10,`rgba(255,100,0,${ia})`);
        ctx.fillStyle=`rgba(255,50,0,${ia*.9})`;ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('SMASH!',w*.35,h*.35);
      }},
      { dur:5, text:'Grandma sets down her tea...', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#f5ead0','#e8d8b0');ctx.fillStyle='#c8a870';ctx.fillRect(0,0,w,h*.6);ctx.fillStyle='#8a6240';ctx.fillRect(0,h*.6,w,h*.4);
        ctx.fillStyle='#6b4226';ctx.fillRect(w*.3,h*.52,w*.4,h*.07);ctx.fillRect(w*.33,h*.59,w*.06,h*.22);ctx.fillRect(w*.61,h*.59,w*.06,h*.22);
        ctx.font=`${h*.1}px Arial`;ctx.textAlign='center';ctx.fillText('🫖',w*.5,h*.52);
        _cGrandma(ctx,w*.3,h*.5,h*.24,t*.1,false);
        ctx.font=`${h*.065}px Arial`;ctx.fillText('☕',w*.42,h*(.52-Math.max(0,(t-1)*.02)));
        if(t>2.5){ctx.fillStyle='rgba(0,0,0,.8)';ctx.font=`${h*.08}px Arial`;ctx.fillText('...',w*.5,h*.35);}
        if(t>3.5){const fa=Math.min(1,(t-3.5)*1.5);ctx.fillStyle=`rgba(255,100,0,${fa})`;ctx.font=`bold ${h*.04}px Arial`;ctx.fillText('Someone is hurting my village.',w*.5,h*.25);}
      }},
      { dur:5, text:'GRANDMA ENTERS THE ARENA!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0500','#050200');ctx.fillStyle='#3a1e08';ctx.fillRect(0,h*.7,w,h*.3);
        const sg=ctx.createRadialGradient(w*.5,0,0,w*.5,0,h*.8);sg.addColorStop(0,'rgba(255,220,150,.3)');sg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
        const gx=w*(-.02+Math.min(.45,t*.1));_cGrandma(ctx,gx,h*.55,h*.28,t,false);
        for(let i=0;i<3;i++){const nx=w*(.6+i*.12+Math.min(0.15,t*.04)),ny=h*.55;_cNinja(ctx,nx,ny,h*.18,t+i*.3,false);}
        const la=.5+.5*Math.abs(Math.sin(t*4));ctx.fillStyle=`rgba(255,220,0,${la})`;ctx.font=`bold ${h*.065}px Arial`;ctx.textAlign='center';
        if(t>1)ctx.fillText("IT'S GRANDMA!",w*.5,h*.22);
        if(t>2.5){ctx.fillStyle=`rgba(255,100,0,${la})`;ctx.font=`${h*.06}px Arial`;ctx.fillText('😰',w*.65,h*.41);}
      }},
      { dur:5, text:'ROUND 1 — Five ninjas! No problem.', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0d0700','#080300');_cLines(ctx,w*.4,h*.46,h*.4,18,'rgba(255,180,0,.08)');
        _cGrandma(ctx,w*.28,h*.52,h*.26,t,true);
        for(let i=0;i<5;i++){if(t>i*.7){const nx=w*(.55+i*.09+Math.sin(t*3+i)*.03),ny=h*.5+i*.01*h;_cNinja(ctx,nx,ny,h*.17,t+i*.5,i%2===0);}}
        const hits=['POW!','WHAP!','BONK!','ZAP!','OOF!'];const hi=Math.floor(t*.9)%hits.length;const ia=.5+.5*Math.abs(Math.sin(t*6));
        ctx.fillStyle=`rgba(255,200,0,${ia*.9})`;ctx.font=`bold ${h*.06}px Arial`;ctx.textAlign='center';ctx.fillText(hits[hi],w*.48,h*.32);
      }},
      { dur:5, text:'ROUND 2 — TEN MORE ninjas!! Still fine.', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0d0700','#080300');_cGrandma(ctx,w*.5,h*.5,h*.26,t,true);
        for(let i=0;i<5;i++)_cNinja(ctx,w*(.08+i*.16),h*.52+Math.sin(t+i)*h*.02,h*.15,t+i,i%2===0);
        for(let i=0;i<5;i++)_cNinja(ctx,w*(.68+i*.07),h*.52+Math.sin(t+i+5)*h*.02,h*.15,t+i+.5,i%2!==0);
        _cLines(ctx,w*.5,h*.5,h*.28,10,`rgba(255,180,0,.${Math.abs(Math.sin(t*7))>.5?'6':'2'})`);
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('ALL TEN at once!',w*.5,h*.24);
      }},
      { dur:5, text:'THE BOSS NINJA arrives — Kage-San!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000000','#050005');
        const ba=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,h*.5);ba.addColorStop(0,'rgba(100,0,150,.25)');ba.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=ba;ctx.fillRect(0,0,w,h);
        _cNinja(ctx,w*.65,h*.48,h*(.18+Math.min(.18,t*.04)),t,t<1);
        _cGrandma(ctx,w*.3,h*.52,h*.24,t,false);
        for(let i=0;i<4;i++)_cNinja(ctx,w*(.68+i*.07),h*.72,h*.1,t,false);
        const la=.5+.5*Math.abs(Math.sin(t*3));ctx.fillStyle=`rgba(150,0,200,${la})`;ctx.font=`bold ${h*.05}px Arial`;ctx.textAlign='center';
        if(t>1)ctx.fillText('KAGE-SAN: THE SHADOW MASTER',w*.5,h*.18);
      }},
      { dur:5, text:'THE LEGENDARY ROLLING PIN TECHNIQUE!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a0a00','#0d0500');_cLines(ctx,w*.45,h*.48,h*.42,20,'rgba(255,200,0,.14)');
        _cGrandma(ctx,w*.35,h*.52,h*.28,t,true);
        const bossX=w*(.75-Math.max(0,(t-2)*.06));_cNinja(ctx,bossX,h*.5,h*.22,t,false);
        if(t>2){const ia=Math.abs(Math.sin(t*8));_cLines(ctx,w*.62,h*.46,h*.2,14,`rgba(255,220,50,${ia})`);ctx.fillStyle=`rgba(255,220,50,${ia*.9})`;ctx.font=`bold ${h*.065}px Arial`;ctx.textAlign='center';ctx.fillText('ROLLING PIN: CRITICAL HIT!',w*.5,h*.25);}
        else{ctx.fillStyle='rgba(255,200,80,.8)';ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('LEGENDARY TECHNIQUE: UNLOCKED!',w*.5,h*.25);}
      }},
      { dur:5, text:'Boss defeated! Even Kage-San bows.', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#030100','#000000');
        if(t<2){_cExplo(ctx,w*.65,h*.46,h*.28,t/2);}
        if(t>1.5){const fa=Math.min(1,(t-1.5));ctx.globalAlpha=fa;_cGrandma(ctx,w*.4,h*.56,h*.26,t,false);_cNinja(ctx,w*.72,h*.6,h*.18,t,false);ctx.globalAlpha=1;}
        if(t>2){const la=.5+.5*Math.abs(Math.sin(t*3));ctx.fillStyle=`rgba(255,220,0,${la})`;ctx.font=`bold ${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('KAGE-SAN BOWS IN DEFEAT.',w*.5,h*.28);}
        if(t>3.5){_cConfetti(ctx,w,h,t-3.5,Math.min(40,(t-3.5)*10)|0);}
      }},
      { dur:5, text:'Tea for everyone. Even the ninjas. THE END.', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#ffe0b2');ctx.fillStyle='#5a9e3c';ctx.fillRect(0,h*.68,w,h*.32);
        _cSun(ctx,w*.88,h*.14,h*.065,t);_cGrandma(ctx,w*.42,h*.58,h*.24,t,false);
        for(let i=0;i<4;i++){if(t>i*.6){const nx=w*(.6+i*.09),ny=h*.63;_cNinja(ctx,nx,ny,h*.15,t+i*.3,false);ctx.font=`${h*.045}px Arial`;ctx.textAlign='center';ctx.fillText('🍵',nx,ny-h*.06);}}
        ctx.font=`${h*.07}px Arial`;ctx.textAlign='center';ctx.fillText('🏆',w*.22,h*.5);_cConfetti(ctx,w,h,t,40);
        if(t>3){const fa=Math.min(1,(t-3)*.6);ctx.fillStyle=`rgba(255,255,255,${fa*.9})`;ctx.font=`bold ${h*.07}px Arial`;ctx.fillText('THE END',w*.5,h*.28);}
      }},
    ]
  },
  { title:'Super Cat vs Evil Pizza', genre:'🐱 Family Adventure', price:25, bg:'#001133', icons:'🐱🍕⚡',
    trailer:[
      {text:'🍕 The pizza has gone... EVIL.',       dur:2000},
      {text:'🐱 Only ONE hero can stop it...',      dur:2000},
      {text:'⚡ SUPER CAT to the rescue!',          dur:2000},
      {text:'🎬 SUPER CAT VS EVIL PIZZA',           dur:3000},
    ],
    scenes:[
      { dur:5, text:'Explox City. 2am. Night patrol.', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000033','#0a0a2e');_cStars(ctx,w,h,t,70);
        ctx.fillStyle='#e8f0ff';ctx.beginPath();ctx.arc(w*.8,h*.12,h*.055,0,Math.PI*2);ctx.fill();
        _cCity(ctx,w,h,true);
        const roof=h*(.6-.66)+5;_cCat(ctx,w*.35+Math.sin(t*.6)*w*.12,roof,h*.14,t,false);
        ctx.fillStyle='rgba(0,200,255,.7)';ctx.font=`${h*.032}px Arial`;ctx.textAlign='center';ctx.fillText('2:00 AM — ALL QUIET',w*.5,h*.88);
      }},
      { dur:5, text:'All quiet... too quiet.', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000022','#000033');_cStars(ctx,w,h,t,80);
        ctx.fillStyle='#e8f0ff';ctx.beginPath();ctx.arc(w*.75,h*.1,h*.05,0,Math.PI*2);ctx.fill();
        _cCity(ctx,w,h,true);const roof=h*(.6-.6)+5;
        _cCat(ctx,w*.5,roof,h*.14,t,false);
        if(t>2){ctx.font=`${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('🔍',w*.56,roof-h*.08);}
        const og=Math.max(0,Math.sin(t*.8)*.25);ctx.fillStyle=`rgba(200,0,0,${og})`;ctx.fillRect(0,h*.68,w,h*.04);
      }},
      { dur:5, text:"Deep below: Evil Pizza's secret lair!", draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a0000','#0d0000');
        ctx.fillStyle='#2a0808';ctx.fillRect(0,h*.15,w,h*.72);for(let i=0;i<6;i++){ctx.fillStyle='#1a0404';ctx.beginPath();ctx.arc(w*(i/6+.08),h*.15,h*.1,0,Math.PI*2);ctx.fill();}
        _cPizza(ctx,w*.5,h*.44,h*.24,t,true);
        ctx.fillStyle='#330000';ctx.fillRect(w*.7,h*.2,w*.22,h*.32);ctx.strokeStyle='red';ctx.lineWidth=2;ctx.beginPath();ctx.arc(w*.81,h*.36,h*.07,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='rgba(255,50,0,.8)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText("EVIL PIZZA'S LAIR",w*.5,h*.2);
        ctx.font=`${h*.03}px Arial`;ctx.fillText('PLAN: TAKE OVER EXPLOX CITY',w*.5,h*.26);
      }},
      { dur:5, text:'PIZZA BREAKS FREE from the oven!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#220000','#440000');
        ctx.fillStyle='#555';ctx.fillRect(w*.3,h*.25,w*.4,h*.5);ctx.fillStyle='rgba(255,100,0,.4)';ctx.fillRect(w*.34,h*.3,w*.32,h*.38);
        const pb=Math.min(1,t*.25),psize=h*(.08+pb*.2),py=h*(.55-pb*.25);
        _cPizza(ctx,w*.5,py,psize,t,true);
        if(t>1){const dv=(t-1)*h*.06;ctx.fillStyle='#444';ctx.save();ctx.translate(w*.34-dv,h*.3+dv);ctx.rotate((t-1)*.4);ctx.fillRect(0,0,w*.32,h*.38);ctx.restore();}
        const la=.5+.5*Math.abs(Math.sin(t*6));ctx.fillStyle=`rgba(255,50,0,${la})`;ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('IT ESCAPES!',w*.5,h*.18);
      }},
      { dur:5, text:'Citizens FLEE in panic!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#220000','#110000');_cCity(ctx,w,h,true);
        _cPizza(ctx,w*.55,h*.32,h*.28,t,true);
        ['🏃','🏃','🙀','😱','🏃','🙀'].forEach((r,i)=>{const rx=((w*(i*.18+.05)+t*w*.12*(i%2===0?1:-1))%w+w)%w;ctx.font=`${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText(r,rx,h*.72+Math.sin(t*4+i)*h*.015);});
        const la=.5+.5*Math.abs(Math.sin(t*5));ctx.fillStyle=`rgba(255,100,0,${la*.9})`;ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('CITIZENS: RUN!!',w*.5,h*.22);
      }},
      { dur:5, text:'The SUPER SIGNAL lights up the sky!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000022','#000044');_cStars(ctx,w,h,t,50);_cCity(ctx,w,h,true);
        const sa=.5+.5*Math.abs(Math.sin(t*2));
        const sg=ctx.createRadialGradient(w*.5,h*.75,0,w*.5,0,h*.8);sg.addColorStop(0,`rgba(255,150,0,${sa*.8})`);sg.addColorStop(.4,`rgba(255,100,0,${sa*.4})`);sg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
        ctx.fillStyle=`rgba(255,200,0,${sa})`;ctx.font=`${h*.16}px Arial`;ctx.textAlign='center';ctx.fillText('🐱',w*.5,h*.38);
        ctx.fillStyle=`rgba(255,255,200,${sa*.7})`;ctx.font=`bold ${h*.04}px Arial`;ctx.fillText('SUPER CAT NEEDED!',w*.5,h*.82);
      }},
      { dur:5, text:'Super Cat sees the call!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000033','#0a0a2e');_cStars(ctx,w,h,t,60);_cCity(ctx,w,h,true);
        const roof=h*(.6-.66)+5;_cCat(ctx,w*.4,roof,h*.15,t,false);
        const sa=.4+.4*Math.sin(t*2);ctx.fillStyle=`rgba(255,150,0,${sa*.3})`;ctx.fillRect(0,0,w,h);
        if(t>1.5){ctx.font=`${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('😤',w*.46,roof-h*.1);}
        if(t>3){const fa=Math.min(1,(t-3)*.8);ctx.fillStyle=`rgba(255,200,0,${fa*.9})`;ctx.font=`bold ${h*.04}px Arial`;ctx.fillText('Time to suit up!',w*.5,h*.78);}
      }},
      { dur:5, text:'Super Cat SUITS UP! Cape on. Claws charged.', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001133','#000044');_cStars(ctx,w,h,t,35);
        const pg=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,h*.4);pg.addColorStop(0,`rgba(255,220,50,${.2+.2*Math.sin(t*4)})`);pg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=pg;ctx.fillRect(0,0,w,h);
        _cCat(ctx,w*.5,h*.48,h*.28,t,false);
        for(let i=0;i<3;i++){const er=(t*.4+i/3)%1;ctx.strokeStyle=`rgba(255,200,0,${(1-er)*.6})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(w*.5,h*.48,er*h*.35,0,Math.PI*2);ctx.stroke();}
        ['🎽 CAPE: ON','⚡ CLAWS: CHARGED','🚀 SPEED: MAX'].forEach((item,i)=>{if(t>i*1.4){const fa=Math.min(1,(t-i*1.4)*.8);ctx.fillStyle=`rgba(0,255,150,${fa})`;ctx.font=`bold ${h*.035}px Arial`;ctx.textAlign='center';ctx.fillText(item,w*.5,h*.72+i*h*.07);}});
      }},
      { dur:5, text:'Cat LAUNCHES into the night sky!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000022','#000044');_cStars(ctx,w,h,t,65);_cCity(ctx,w,h,true);
        const cy=h*(1.0-Math.min(.85,t*.18));_cCat(ctx,w*.5,cy,h*.2,t,true);
        ctx.strokeStyle='rgba(255,200,50,.6)';ctx.lineWidth=2;
        for(let i=0;i<12;i++){const a=i/12*Math.PI*2,len=h*.07+i%3*h*.04;ctx.beginPath();ctx.moveTo(w*.5+Math.cos(a)*h*.12,cy+Math.sin(a)*h*.12);ctx.lineTo(w*.5+Math.cos(a)*(h*.12+len),cy+Math.sin(a)*(h*.12+len));ctx.stroke();}
        const la=.5+.5*Math.abs(Math.sin(t*5));ctx.fillStyle=`rgba(255,220,50,${la*.9})`;ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('LIFTOFF!',w*.5,h*.88);
      }},
      { dur:5, text:'Flying at MAXIMUM SPEED across the city!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000033','#001144');_cStars(ctx,w,h,t,50);_cCity(ctx,w,h,true);
        const pass=Math.floor(t/1.8),frac=(t%1.8)/1.8;
        const cx=pass%2===0?w*(-.1+frac*1.2):w*(1.1-frac*1.2);
        _cCat(ctx,cx,h*.3,h*.2,t,true);
        const trail=5;for(let i=1;i<trail;i++){ctx.globalAlpha=.06*(trail-i);_cCat(ctx,cx-(pass%2===0?1:-1)*i*h*.04,h*.3,h*.2,t,true);}ctx.globalAlpha=1;
        const la=.5+.5*Math.abs(Math.sin(t*6));ctx.fillStyle=`rgba(255,200,50,${la*.8})`;ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('⚡ MACH 3! ⚡',w*.5,h*.78);
      }},
      { dur:5, text:'FIRST CLASH! The whole city shakes!', draw(ctx,w,h,t){
        const shake=Math.sin(t*18)*h*.004;_cBg(ctx,w,h,'#220011','#110000');_cCity(ctx,w,h,true);
        _cCat(ctx,w*.28+shake,h*.45,h*.22,t,true);_cPizza(ctx,w*.72+shake,h*.44,h*.26,t,true);
        const ia=.5+.5*Math.abs(Math.sin(t*9));
        _cLines(ctx,w*.5,h*.44,h*.26,14,`rgba(255,220,0,${ia})`);_cExplo(ctx,w*.5,h*.44,h*.2,((t*.4)%1));
        ctx.fillStyle=`rgba(255,255,150,${ia*.6})`;ctx.fillRect(0,0,w,h);
        ctx.fillStyle=`rgba(255,50,0,${ia*.9})`;ctx.font=`bold ${h*.065}px Arial`;ctx.textAlign='center';ctx.fillText('KA-BOOM!',w*.5,h*.22);
      }},
      { dur:5, text:'Pizza grows to GIANT SIZE!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#330000','#550000');_cCity(ctx,w,h,true);
        _cPizza(ctx,w*.55,h*.3+h*(.15+Math.min(.42,t*.09))*.2,h*(.15+Math.min(.42,t*.09)),t,true);
        const cd=Math.min(.3,t*.06);_cCat(ctx,w*(-.05+cd*3),h*.6+Math.sin(t*3)*h*.03,h*.15,t,false);
        const la=.5+.5*Math.abs(Math.sin(t*4));ctx.fillStyle=`rgba(255,50,0,${la*.9})`;ctx.font=`bold ${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('PIZZA GROWS GIANT!',w*.5,h*.18);
      }},
      { dur:5, text:'Cat takes a hit... but gets back up.', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001133','#000044');_cStars(ctx,w,h,t,40);
        const rise=Math.min(1,Math.max(0,(t-1.5)*.6));const cy=h*(.72-rise*.22);
        _cCat(ctx,w*.4,cy,h*.2,t,false);
        if(t<2){for(let i=0;i<5;i++){const a=i/5*Math.PI*2+t*2;ctx.font=`${h*.035}px Arial`;ctx.textAlign='center';ctx.fillText('⭐',w*.4+Math.cos(a)*h*.1,cy-h*.06+Math.sin(a)*h*.04);}}
        if(t>2){const pg=Math.min(1,(t-2)*.5);const g=ctx.createRadialGradient(w*.4,cy,0,w*.4,cy,h*.2);g.addColorStop(0,`rgba(255,200,50,${pg*.5})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
        ctx.fillStyle='rgba(255,200,50,.85)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';
        if(t<2)ctx.fillText('That... really hurt.',w*.5,h*.25);
        else if(t>2.5)ctx.fillText('But Super Cat NEVER gives up!',w*.5,h*.25);
      }},
      { dur:5, text:'THE LIGHTNING CLAW ULTIMATE ATTACK!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#001144');_cStars(ctx,w,h,t,40);_cLines(ctx,w*.65,h*.44,h*.44,22,'rgba(255,200,0,.12)');
        const cx=w*(.02+Math.min(.4,t*.1));_cCat(ctx,cx,h*.44+Math.sin(t*5)*h*.03,h*.24,t,true);
        _cPizza(ctx,w*.72,h*.44,h*.26,t,true);
        const la=.5+.5*Math.abs(Math.sin(t*10));
        ctx.strokeStyle=`rgba(255,230,50,${la})`;ctx.lineWidth=6;
        ctx.beginPath();ctx.moveTo(cx+h*.08,h*.44);ctx.lineTo(w*.5,h*.36+Math.sin(t*14)*h*.06);ctx.lineTo(w*.65,h*.44);ctx.stroke();
        ctx.fillStyle=`rgba(255,255,200,${la*.7})`;ctx.fillRect(0,0,w,h);
        ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`bold ${h*.06}px Arial`;ctx.textAlign='center';ctx.fillText('⚡ LIGHTNING CLAW ULTIMATE! ⚡',w*.5,h*.22);
      }},
      { dur:5, text:'PIZZA DEFEATED! Free pizza slices for all!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#c8e8ff');ctx.fillStyle='#5a9e3c';ctx.fillRect(0,h*.7,w,h*.3);
        _cSun(ctx,w*.88,h*.14,h*.065,t);_cCity(ctx,w,h,false);
        const cxv=t<3?w*(.05+t*.16):w*.42;_cCat(ctx,cxv,h*.58,h*.22,t,t<3);
        if(t>1){const ty=Math.max(h*.44,h*.1+(t-1)*h*.07);ctx.font=`${h*.09}px Arial`;ctx.textAlign='center';ctx.fillText('🏆',w*.42,ty);}
        ['🍕','🍕','🍕','🍕','🍕'].forEach((e,i)=>{if(t>i*.7){ctx.font=`${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText(e,w*(.12+i*.19),h*.68+Math.sin(t+i)*h*.02);}});
        _cConfetti(ctx,w,h,t,Math.min(60,t*12)|0);
        if(t>3.5){const fa=Math.min(1,(t-3.5)*.7);ctx.fillStyle=`rgba(255,255,255,${fa*.9})`;ctx.font=`bold ${h*.07}px Arial`;ctx.textAlign='center';ctx.fillText('THE END',w*.5,h*.27);}
      }},
    ]
  },
  { title:'The Mystery of the Missing S.I.P.', genre:'🔍 Mystery', price:35, bg:'#0d0d0d', icons:'🔍💰🕵️',
    trailer:[
      {text:'💰 One BILLION S.I.P. has vanished...',               dur:2000},
      {text:"🕵️ The city's greatest detective is on the case...",  dur:2500},
      {text:'🔍 WHO TOOK THE S.I.P.?',                            dur:2500},
      {text:'THE MYSTERY OF THE MISSING S.I.P.',                  dur:3000},
    ],
    scenes:[
      { dur:5, text:'A dark and stormy night in Explox City...', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a1a');_cRain(ctx,w,h,t,100);_cCity(ctx,w,h,true);
        ctx.fillStyle='rgba(60,80,140,.2)';ctx.fillRect(0,h*.72,w,h*.1);
        if(Math.sin(t*7)>.8){ctx.fillStyle='rgba(200,220,255,.4)';ctx.fillRect(0,0,w,h);}
        ctx.fillStyle='rgba(180,200,255,.6)';ctx.font=`${h*.03}px Arial`;ctx.textAlign='center';ctx.fillText('EXPLOX CITY — TUESDAY NIGHT',w*.5,h*.15);
      }},
      { dur:5, text:'The Explox City Bank — closed for the night.', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a1a');_cRain(ctx,w,h,t,60);
        ctx.fillStyle='#2a2a3a';ctx.fillRect(w*.2,h*.28,w*.6,h*.5);
        ctx.fillStyle='#1a1a28';for(let i=0;i<4;i++){ctx.fillRect(w*.24+i*w*.13,h*.28,w*.035,h*.5);}
        ctx.fillStyle='#555';ctx.fillRect(w*.38,h*.55,w*.24,h*.23);
        ctx.fillStyle='#c8a060';ctx.beginPath();ctx.moveTo(w*.18,h*.28);ctx.lineTo(w*.5,h*.12);ctx.lineTo(w*.82,h*.28);ctx.closePath();ctx.fill();
        ctx.fillStyle='#e8c880';ctx.font=`${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('💰 EXPLOX CITY BANK 💰',w*.5,h*.22);
        ctx.fillStyle='rgba(50,50,255,.5)';ctx.font=`${h*.028}px Arial`;ctx.fillText('CLOSED — SECURED VAULT INSIDE',w*.5,h*.84);
      }},
      { dur:5, text:'ALARM! The vault is EMPTY!', draw(ctx,w,h,t){
        const fl=Math.abs(Math.sin(t*5));_cBg(ctx,w,h,`rgb(${fl*60|0},0,0)`,'#000000');
        ctx.fillStyle='#444';ctx.fillRect(w*.3,h*.22,w*.4,h*.55);ctx.fillStyle='#555';ctx.save();ctx.translate(w*.3,h*.22);ctx.rotate(-.5);ctx.fillRect(0,0,w*.04,h*.55);ctx.restore();
        ctx.fillStyle='#1a1a1a';ctx.fillRect(w*.32,h*.26,w*.36,h*.5);
        ctx.font=`${h*.12}px Arial`;ctx.textAlign='center';ctx.fillText('😱',w*.5,h*.18);
        ctx.fillStyle='rgba(0,200,0,.3)';ctx.font=`${h*.03}px Arial`;ctx.fillText('[ VAULT EMPTY ]',w*.5,h*.52);
        ctx.fillStyle=`rgba(255,50,50,${fl*.9})`;ctx.font=`bold ${h*.055}px Arial`;ctx.fillText('🚨 ONE BILLION S.I.P. GONE! 🚨',w*.5,h*.84);
      }},
      { dur:5, text:'BREAKING NEWS: One billion S.I.P. stolen!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0810','#050410');
        ctx.fillStyle='#fffff0';ctx.fillRect(w*.1,h*.08,w*.8,h*.82);
        ctx.fillStyle='#111';ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('THE EXPLOX GAZETTE',w*.5,h*.18);
        ctx.fillStyle='#888';ctx.fillRect(w*.12,h*.2,w*.76,h*.005);
        ctx.fillStyle='#cc0000';ctx.font=`bold ${h*.065}px Arial`;ctx.fillText('1 BILLION S.I.P.',w*.5,h*.34);ctx.fillText('STOLEN!!',w*.5,h*.42);
        ctx.fillStyle='#222';ctx.font=`${h*.028}px Arial`;ctx.fillText('"We are devastated" — Bank Manager',w*.5,h*.56);
        const la=.5+.5*Math.abs(Math.sin(t*3));ctx.fillStyle=`rgba(200,0,0,${la})`;ctx.font=`bold ${h*.04}px Arial`;ctx.fillText('⚡ EXTRA! EXTRA! ⚡',w*.5,h*.84);
      }},
      { dur:5, text:'Detective Max gets the call...', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0800','#050400');
        ctx.fillStyle='#1a1510';ctx.fillRect(0,0,w,h*.6);ctx.fillStyle='#0f0c08';ctx.fillRect(0,h*.6,w,h*.4);
        ctx.fillStyle='#5c3c1a';ctx.fillRect(w*.2,h*.55,w*.6,h*.08);ctx.fillRect(w*.23,h*.63,w*.07,h*.2);ctx.fillRect(w*.7,h*.63,w*.07,h*.2);
        const rs=Math.sin(t*12)*.005*w;ctx.font=`${h*.07}px Arial`;ctx.textAlign='center';ctx.fillText('📞',w*.5+rs,h*.53);
        _cDetective(ctx,w*.32,h*.5,h*.24,t);
        if(t>2)ctx.fillText('📞',w*.38,h*.38);
        if(t>3){ctx.fillStyle='rgba(255,200,100,.8)';ctx.font=`${h*.03}px Arial`;ctx.fillText('"A billion S.I.P.? I\'ll be right there."',w*.5,h*.28);}
      }},
      { dur:5, text:'Arriving at the crime scene in the rain...', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a1a');_cRain(ctx,w,h,t,85);_cCity(ctx,w,h,true);
        ctx.fillStyle='rgba(60,80,140,.18)';ctx.fillRect(0,h*.72,w,h*.1);
        ctx.strokeStyle='rgba(255,220,0,.8)';ctx.lineWidth=3;ctx.setLineDash([12,8]);ctx.beginPath();ctx.moveTo(w*.1,h*.74);ctx.lineTo(w*.9,h*.74);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle='rgba(255,220,0,.8)';ctx.font=`${h*.025}px Arial`;ctx.textAlign='center';ctx.fillText('CRIME SCENE — DO NOT CROSS',w*.5,h*.72);
        const dx=w*(.05+Math.min(.42,t*.09));_cDetective(ctx,dx,h*.57,h*.22,t);
        ctx.font=`${h*.07}px Arial`;ctx.textAlign='center';ctx.fillText('☂️',dx,h*.43);
      }},
      { dur:5, text:'Examining the vault — no fingerprints!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#08080a');
        ctx.fillStyle='#1a1a2a';ctx.fillRect(0,0,w,h*.55);ctx.fillStyle='#0f0f18';ctx.fillRect(0,h*.55,w,h*.45);
        ctx.fillStyle='#333';ctx.fillRect(w*.15,h*.15,w*.08,h*.45);for(let i=0;i<5;i++){ctx.fillStyle='#555';ctx.beginPath();ctx.arc(w*.19,h*.25+i*h*.06,h*.018,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle='#111';ctx.fillRect(w*.25,h*.15,w*.65,h*.45);
        const spg=ctx.createRadialGradient(w*.5,h*.05,0,w*.5,h*.05,h*.6);spg.addColorStop(0,'rgba(255,240,180,.22)');spg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=spg;ctx.fillRect(0,0,w,h);
        _cDetective(ctx,w*.45,h*.5,h*.26,t);
        if(t>2){const la=.5+.5*Math.sin(t*3);ctx.fillStyle=`rgba(255,200,0,${la})`;ctx.font=`${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('🔍',w*.52,h*.58);}
        if(t>3){ctx.fillStyle='rgba(255,150,150,.8)';ctx.font=`${h*.03}px Arial`;ctx.textAlign='center';ctx.fillText('NO fingerprints. Very strange...',w*.5,h*.86);}
      }},
      { dur:5, text:'FIRST CLUE FOUND: a half-eaten pizza!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#08080a');ctx.fillStyle='#1a1510';ctx.fillRect(0,0,w,h*.6);ctx.fillStyle='#0f0c08';ctx.fillRect(0,h*.6,w,h*.4);
        for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#1a1006':'#140c04';ctx.fillRect(i*w/8,h*.6,w/8,h*.4);}
        _cDetective(ctx,w*.38,h*.52,h*.24,t);
        if(t>1){ctx.font=`${h*.08}px Arial`;ctx.textAlign='center';ctx.fillText('🍕',w*.6,h*.7);}
        if(t>2){const cg=ctx.createRadialGradient(w*.6,h*.72,0,w*.6,h*.72,h*.12);cg.addColorStop(0,'rgba(255,150,0,.4)');cg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=cg;ctx.fillRect(0,0,w,h);}
        if(t>2.5){const la=.5+.5*Math.abs(Math.sin(t*4));ctx.fillStyle=`rgba(255,200,50,${la*.9})`;ctx.font=`bold ${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('AHA! A CLUE!',w*.5,h*.3);}
        for(let i=0;i<3;i++){const qa=.5+.5*Math.sin(t*2+i);ctx.fillStyle=`rgba(255,200,0,${qa*.5})`;ctx.font=`${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('?',w*(.3+i*.2),h*.25+Math.sin(t*2+i)*h*.03);}
      }},
      { dur:5, text:'Following the cheese trail...', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a1a');_cRain(ctx,w,h,t,50);_cCity(ctx,w,h,true);
        ctx.fillStyle='rgba(60,80,140,.15)';ctx.fillRect(0,h*.72,w,h*.1);
        const nDots=Math.min(10,Math.floor(t*2));
        for(let i=0;i<nDots;i++){const dx=w*(.08+i*.09),dy=h*.78+Math.sin(i)*h*.02;ctx.fillStyle='rgba(255,200,50,.7)';ctx.beginPath();ctx.arc(dx,dy,h*.012,0,Math.PI*2);ctx.fill();}
        const detX=w*(-.02+Math.min(.5,t*.1));_cDetective(ctx,detX,h*.57,h*.2,t);
        ctx.font=`${h*.07}px Arial`;ctx.textAlign='center';ctx.fillText('☂️',detX,h*.44);
        if(t>1){ctx.fillStyle='rgba(255,200,50,.7)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('🧀 CHEESE TRAIL',w*.5,h*.88);}
      }},
      { dur:5, text:'A suspicious shadowy figure in the alley!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#020204','#050508');_cRain(ctx,w,h,t,40);
        ctx.fillStyle='#1a1a22';ctx.fillRect(0,0,w*.3,h);ctx.fillRect(w*.7,0,w*.3,h);ctx.fillStyle='#111';ctx.fillRect(w*.3,0,w*.4,h);
        ctx.fillStyle='#444';ctx.fillRect(w*.32,h*.62,w*.08,h*.2);ctx.fillRect(w*.6,h*.62,w*.08,h*.2);
        const sv=.1+.05*Math.sin(t*2);ctx.fillStyle=`rgba(255,0,0,${sv})`;ctx.beginPath();ctx.arc(w*.5,h*.44,h*.14,0,Math.PI*2);ctx.fill();
        const ea=.5+.5*Math.abs(Math.sin(t*4));ctx.fillStyle=`rgba(255,0,0,${ea})`;
        ctx.beginPath();ctx.arc(w*.44,h*.4,h*.025,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(w*.56,h*.4,h*.025,0,Math.PI*2);ctx.fill();
        _cDetective(ctx,w*.08,h*.58,h*.18,t);
        if(t>1.5){const la=.5+.5*Math.abs(Math.sin(t*5));ctx.fillStyle=`rgba(255,200,50,${la*.8})`;ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('THERE! IN THE ALLEY!',w*.5,h*.22);}
      }},
      { dur:5, text:'THE INTERROGATION ROOM.', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#080600','#050400');
        ctx.fillStyle='#1a1510';ctx.fillRect(0,0,w,h*.6);ctx.fillStyle='#111';ctx.fillRect(0,h*.6,w,h*.4);
        ctx.fillStyle='#333';ctx.fillRect(w*.25,h*.55,w*.5,h*.06);ctx.fillRect(w*.27,h*.61,w*.05,h*.2);ctx.fillRect(w*.68,h*.61,w*.05,h*.2);
        const lg=ctx.createRadialGradient(w*.5,0,0,w*.5,0,h*.7);lg.addColorStop(0,'rgba(255,220,150,.35)');lg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=lg;ctx.fillRect(0,0,w,h);
        _cPizza(ctx,w*.68,h*.5,h*.15,t,true);_cDetective(ctx,w*.3,h*.5,h*.22,t);
        if(t>1){const qa=.4+.4*Math.sin(t*1.5);ctx.fillStyle=`rgba(255,50,50,${qa})`;ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('"WHERE were you Tuesday night?"',w*.5,h*.3);}
        if(t>3){ctx.fillStyle='rgba(255,180,0,.7)';ctx.font=`${h*.035}px Arial`;ctx.textAlign='center';ctx.fillText('Pizza: "...I want my lawyer."',w*.5,h*.22);}
      }},
      { dur:5, text:'CONNECTING THE DOTS — EUREKA!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0800','#050400');ctx.fillStyle='#1a1510';ctx.fillRect(0,0,w,h*.6);ctx.fillStyle='#111';ctx.fillRect(0,h*.6,w,h*.4);
        for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#1a1006':'#140c04';ctx.fillRect(i*w/8,h*.6,w/8,h*.4);}
        _cDetective(ctx,w*.32,h*.52,h*.22,t);
        ctx.fillStyle='#2a2018';ctx.fillRect(w*.5,h*.15,w*.42,h*.5);
        ['🍕','🧀','💰','🔍'].forEach((c,i)=>{if(t>i*.8){ctx.font=`${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText(c,w*(.58+i%2*.18),h*(.28+Math.floor(i/2)*.2));}});
        if(t>3){ctx.strokeStyle='rgba(255,50,50,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*.58,h*.28);ctx.lineTo(w*.76,h*.28);ctx.moveTo(w*.58,h*.48);ctx.lineTo(w*.76,h*.48);ctx.moveTo(w*.58,h*.28);ctx.lineTo(w*.58,h*.48);ctx.stroke();}
        if(t>4){const la=.5+.5*Math.abs(Math.sin(t*4));ctx.fillStyle=`rgba(255,200,50,${la})`;ctx.font=`bold ${h*.06}px Arial`;ctx.textAlign='center';ctx.fillText('EUREKA!!',w*.28,h*.28);}
      }},
      { dur:5, text:'The Pizza Hideout: SURROUNDED!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#020206','#040408');_cRain(ctx,w,h,t,45);
        ctx.fillStyle='#1a1a22';ctx.fillRect(w*.2,h*.2,w*.6,h*.55);for(let i=0;i<4;i++){ctx.fillStyle='#111';ctx.fillRect(w*.28+i*w*.1,h*.32,w*.07,h*.12);}
        ctx.fillStyle='#0f0f18';ctx.fillRect(w*.42,h*.52,w*.16,h*.24);
        const pl=Math.sin(t*8);ctx.fillStyle=`rgba(0,50,255,${Math.max(0,pl)*.6})`;ctx.fillRect(0,0,w*.5,h*.2);ctx.fillStyle=`rgba(255,50,0,${Math.max(0,-pl)*.6})`;ctx.fillRect(w*.5,0,w*.5,h*.2);
        _cDetective(ctx,w*.12,h*.6,h*.18,t);
        ctx.font=`${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('🚔',w*.25,h*.7);ctx.fillText('🚔',w*.75,h*.7);
        if(t>2){const la=.5+.5*Math.abs(Math.sin(t*3));ctx.fillStyle=`rgba(255,220,0,${la})`;ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('PIZZA HIDEOUT SURROUNDED!',w*.5,h*.13);}
      }},
      { dur:5, text:'SHOWDOWN: Detective vs Evil Pizza!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0000','#180000');
        const sg=ctx.createRadialGradient(w*.5,h*.1,0,w*.5,h*.1,h*.7);sg.addColorStop(0,'rgba(255,200,150,.2)');sg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);
        _cDetective(ctx,w*.25,h*.52,h*.26,t);_cPizza(ctx,w*.72,h*.46,h*.28,t,true);
        ctx.font=`${h*.065}px Arial`;ctx.textAlign='center';ctx.fillText('💰',w*.5,h*.62);
        const la=.3+.7*Math.abs(Math.sin(t*6));
        ctx.strokeStyle=`rgba(255,220,50,${la})`;ctx.lineWidth=3;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(w*.36,h*.52);ctx.lineTo(w*.57,h*.52);ctx.stroke();ctx.setLineDash([]);
        if(t>2){ctx.fillStyle=`rgba(255,50,50,${la*.9})`;ctx.font=`bold ${h*.048}px Arial`;ctx.textAlign='center';ctx.fillText('"Give back the S.I.P.!"',w*.5,h*.24);}
        if(t>3.5){const la2=.5+.5*Math.abs(Math.sin(t*4));ctx.fillStyle=`rgba(255,100,0,${la2})`;ctx.fillText('"Never!!" — Evil Pizza',w*.5,h*.3);}
      }},
      { dur:5, text:'CASE CLOSED! All S.I.P. returned! Justice wins!', draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001100','#003300');_cCity(ctx,w,h,false);
        _cDetective(ctx,w*.42,h*.54,h*.26,t);
        if(t>1){ctx.font=`${h*.09}px Arial`;ctx.textAlign='center';ctx.fillText('🏆',w*.42,h*.38);}
        _cMoney(ctx,w,h,t,40);_cConfetti(ctx,w,h,t,Math.min(60,t*12)|0);
        ctx.fillStyle='rgba(255,220,50,.9)';ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('CASE CLOSED!',w*.5,h*.22);
        if(t>2){ctx.fillStyle='#333';for(let i=0;i<4;i++)ctx.fillRect(w*(.72+i*.05),h*.4,h*.015,h*.28);_cPizza(ctx,w*.78,h*.48,h*.12,t,false);}
        if(t>4){const fa=Math.min(1,(t-4));ctx.fillStyle=`rgba(255,255,255,${fa*.9})`;ctx.font=`bold ${h*.07}px Arial`;ctx.textAlign='center';ctx.fillText('THE END',w*.5,h*.28);}
      }},
    ]
  },
  { title:'Attack of the Giant Dino-Bot', genre:'🦕 Mecha Action', price:30, bg:'#0a1a0a', icons:'🦕🤖💥',
    trailer:[
      {text:'🌿 The jungle shook with every step...',dur:2000},
      {text:'🤖 A robot... the size of a mountain!',dur:2000},
      {text:'🦕 But it had DINO DNA inside!',dur:2000},
      {text:'💥 ATTACK OF THE GIANT DINO-BOT! 💥',dur:3000},
    ],
    scenes:[
      {dur:5,text:'Deep in the jungle, something stirs...',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a2a0a','#1a4a1a');
        for(let i=0;i<8;i++){const tx=w*(.06+i*.13),th=h*(.28+i%3*.14);ctx.fillStyle='#1a5a1a';ctx.fillRect(tx-h*.024,h*.55,h*.048,th);ctx.fillStyle='#2a8a2a';ctx.beginPath();ctx.arc(tx,h*.55-th*.5,h*.08,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle='#3a2a1a';ctx.fillRect(0,h*.88,w,h*.12);
        const shake=Math.sin(t*8)*Math.min(t*.3,1)*3;ctx.save();ctx.translate(0,shake);ctx.restore();
        const fa=Math.min(1,t*.5);ctx.fillStyle=`rgba(200,255,150,${fa*.8})`;ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('Deep in the jungle...',w*.5,h*.12);
        if(t>2){ctx.fillStyle=`rgba(255,80,0,${Math.min(1,(t-2)*.6)})`;ctx.font=`${h*.032}px Arial`;ctx.fillText('THOOM... THOOM... THOOM...',w*.5,h*.22);}
      }},
      {dur:5,text:'The Dino-Bot rises from the jungle!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a2a0a','#000a00');
        const rise=Math.max(0,1-t*.35);ctx.save();ctx.translate(0,h*rise);
        _cDino(ctx,w*.5,h*.55,h*.5,t,true);
        const glow=.5+.5*Math.sin(t*4);ctx.fillStyle=`rgba(0,200,255,${glow})`;
        ctx.beginPath();ctx.arc(w*.38,h*.3,h*.035,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(w*.55,h*.3,h*.035,0,Math.PI*2);ctx.fill();
        ctx.restore();
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.048}px Arial`;ctx.textAlign='center';ctx.fillText('DINO-BOT AWAKENS!',w*.5,h*.1);
      }},
      {dur:5,text:'It heads for the city!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a1a0a','#0a0a00');_cCity(ctx,w,h,true);
        const dx=w*(.78-t*.1);_cDino(ctx,dx,h*.62,h*.3,t,false);
        const glow=.5+.5*Math.sin(t*4);ctx.fillStyle=`rgba(0,200,255,${glow})`;
        ctx.beginPath();ctx.arc(dx-h*.09,h*.4,h*.022,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(dx+h*.06,h*.4,h*.022,0,Math.PI*2);ctx.fill();
        if(t>2){_cExplo(ctx,w*.15,h*.5,h*.12,Math.min(1,(t-2)*.5));}
        ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('CITY IN DANGER!',w*.5,h*.88);
      }},
      {dur:5,text:'People run! Buildings shake!',draw(ctx,w,h,t){
        const shake=Math.sin(t*12)*Math.min(t*.2,1)*h*.008;
        ctx.save();ctx.translate(shake,0);_cBg(ctx,w,h,'#1a0a00','#0a0500');_cCity(ctx,w,h,true);ctx.restore();
        for(let i=0;i<5;i++){const px=((w*(.8-i*.18))-t*80+w)%w,py=h*.84;
          ctx.fillStyle='#ffcc88';ctx.beginPath();ctx.arc(px,py-h*.06,h*.024,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#4488ff';ctx.fillRect(px-h*.014,py-h*.036,h*.028,h*.058);}
        if(t>1){_cExplo(ctx,w*.82,h*.42,h*.16,Math.min(1,(t-1)*.4));}
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('EVERYONE RUN!!!',w*.5,h*.1);
      }},
      {dur:5,text:'A brave little robot hears the alarm!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');_cRobot(ctx,w*.5,h*.52,h*.28,t,false);
        const al=Math.abs(Math.sin(t*8));ctx.fillStyle=`rgba(255,0,0,${al*.25})`;ctx.fillRect(0,0,w,h);
        ctx.fillStyle='rgba(255,80,80,.9)';ctx.font=`bold ${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('🚨 ALARM! 🚨',w*.5,h*.16);
        if(t>2){ctx.fillStyle='rgba(255,255,255,.8)';ctx.font=`${h*.032}px Arial`;ctx.fillText('"I must stop that Dino-Bot!"',w*.5,h*.86);}
      }},
      {dur:5,text:'Robot-Hero powers up for battle!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050515','#0a0a30');_cRobot(ctx,w*.5,h*.52,h*.3,t,false);
        const charge=Math.min(1,t*.22);
        const cg=ctx.createRadialGradient(w*.5,h*.52,0,w*.5,h*.52,h*.4*charge);
        cg.addColorStop(0,'rgba(0,200,255,.4)');cg.addColorStop(1,'rgba(0,200,255,0)');
        ctx.fillStyle=cg;ctx.beginPath();ctx.arc(w*.5,h*.52,h*.4*charge,0,Math.PI*2);ctx.fill();
        _cLines(ctx,w*.5,h*.52,h*.32*charge,16,'rgba(0,200,255,.6)');
        ctx.fillStyle='rgba(0,200,255,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('POWER: ' + (charge*100|0) + '%',w*.5,h*.18);
      }},
      {dur:5,text:'The battle begins downtown!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0500','#1a0a00');_cCity(ctx,w,h,true);
        _cDino(ctx,w*.72,h*.55,h*.32,t,false);_cRobot(ctx,w*.22,h*.6,h*.2,t,true);
        const glow=.5+.5*Math.sin(t*4);ctx.fillStyle=`rgba(0,200,255,${glow})`;
        ctx.beginPath();ctx.arc(w*.6,h*.37,h*.018,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(w*.74,h*.37,h*.018,0,Math.PI*2);ctx.fill();
        if(t>1.5){const la=.7+.3*Math.sin(t*15);ctx.strokeStyle=`rgba(0,255,200,${la})`;ctx.lineWidth=h*.012;ctx.beginPath();ctx.moveTo(w*.28,h*.58);ctx.lineTo(w*.62,h*.48);ctx.stroke();}
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('ROBOT-HERO vs DINO-BOT!',w*.5,h*.1);
      }},
      {dur:5,text:'Dino-Bot fires metal spikes!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0500','#050000');_cDino(ctx,w*.7,h*.52,h*.36,t,true);
        for(let i=0;i<Math.min(5,t*1.5|0);i++){
          const sx=w*(.6-t*.14-i*.09),sy=h*(.45+i*.055);
          ctx.fillStyle='#aabbcc';ctx.save();ctx.translate(sx,sy);ctx.rotate(-0.5);
          ctx.beginPath();ctx.moveTo(0,-h*.024);ctx.lineTo(h*.012,h*.024);ctx.lineTo(-h*.012,h*.024);ctx.closePath();ctx.fill();ctx.restore();}
        _cRobot(ctx,w*.2,h*.6,h*.2,t,false);
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('WATCH OUT!',w*.5,h*.88);
      }},
      {dur:5,text:'Robot-Hero climbs up the Dino-Bot!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');_cDino(ctx,w*.55,h*.55,h*.42,t,false);
        const glow=.5+.5*Math.sin(t*4);ctx.fillStyle=`rgba(0,200,255,${glow})`;
        ctx.beginPath();ctx.arc(w*.42,h*.33,h*.018,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(w*.58,h*.33,h*.018,0,Math.PI*2);ctx.fill();
        const cy=h*(.8-t*.12);_cRobot(ctx,w*.5,cy,h*.12,t,true);
        ctx.fillStyle='rgba(255,255,100,.9)';ctx.font=`bold ${h*.036}px Arial`;ctx.textAlign='center';ctx.fillText('"I\'m climbing up!"',w*.5,h*.1);
      }},
      {dur:5,text:'Robot-Hero finds the control panel!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000a1a','#001a2a');
        ctx.fillStyle='#223344';ctx.fillRect(w*.25,h*.25,w*.5,h*.5);
        ctx.strokeStyle='#00ccff';ctx.lineWidth=3;ctx.strokeRect(w*.25,h*.25,w*.5,h*.5);
        for(let i=0;i<9;i++){const bx=w*(.32+i%3*.12),by=h*(.35+Math.floor(i/3)*.12);
          ctx.fillStyle=i===4?'#ff4400':'#0088ff';ctx.beginPath();ctx.arc(bx,by,h*.03,0,Math.PI*2);ctx.fill();}
        _cRobot(ctx,w*.5,h*.64,h*.12,t,false);
        const glow=.5+.5*Math.sin(t*6);ctx.fillStyle=`rgba(0,200,255,${glow*.8})`;
        ctx.font=`bold ${h*.034}px Arial`;ctx.textAlign='center';ctx.fillText('"This will shut it down!"',w*.5,h*.9);
      }},
      {dur:5,text:'The Dino-Bot short-circuits!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0a00','#1a1a00');_cDino(ctx,w*.5,h*.55,h*.4,t,false);
        for(let i=0;i<Math.min(20,t*5|0);i++){
          const sx=w*.5+(Math.sin(i*137)*.5)*h*.5,sy=h*.4+(Math.cos(i*89)*.5)*h*.4;
          const sa=.5+.5*Math.sin(t*8+i);ctx.fillStyle=`rgba(0,200,255,${sa})`;ctx.beginPath();ctx.arc(sx,sy,h*.008,0,Math.PI*2);ctx.fill();}
        const glow=.5+.5*Math.sin(t*4);ctx.fillStyle=`rgba(0,200,255,${glow})`;
        ctx.beginPath();ctx.arc(w*.38,h*.32,h*.018,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(w*.55,h*.32,h*.018,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('SYSTEM FAILURE!',w*.5,h*.1);
      }},
      {dur:5,text:'BOOM! The final explosion!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a0a00','#0a0000');_cCity(ctx,w,h,true);
        const ep=Math.min(1,t*.35);_cExplo(ctx,w*.5,h*.45,h*.35,ep);
        if(t>2){_cExplo(ctx,w*.3,h*.55,h*.2,Math.min(1,(t-2)*.5));}
        if(t>3){_cExplo(ctx,w*.7,h*.4,h*.22,Math.min(1,(t-3)*.6));}
        const la=.5+.5*Math.abs(Math.sin(t*10));ctx.fillStyle=`rgba(255,150,0,${la})`;ctx.font=`bold ${h*.065}px Arial`;ctx.textAlign='center';ctx.fillText('💥 BOOM! 💥',w*.5,h*.88);
      }},
      {dur:5,text:'Peace returns! The city is safe!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#c8e8c0');_cCity(ctx,w,h,false);
        _cSun(ctx,w*.85,h*.14,h*.07,t);_cRobot(ctx,w*.5,h*.58,h*.2,t,false);
        _cBird(ctx,w*.6,h*.3,h*.04,t);_cBird(ctx,w*.75,h*.25,h*.034,t+1);
        ctx.fillStyle='rgba(0,100,0,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('"The city is safe!"',w*.5,h*.18);
      }},
      {dur:5,text:'The city cheers for their tiny hero!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#ffe0b2');_cCity(ctx,w,h,false);
        _cRobot(ctx,w*.5,h*.52,h*.25,t,false);_cConfetti(ctx,w,h,t,50);_cSun(ctx,w*.85,h*.14,h*.065,t);
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.048}px Arial`;ctx.textAlign='center';ctx.fillText('HERO!!! 🎉',w*.5,h*.22);
      }},
      {dur:5,text:'The Dino-Bot became a theme park. THE END.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#ffe0b2');_cDino(ctx,w*.5,h*.58,h*.34,t,false);
        for(let i=0;i<6;i++){const fx=w*(.1+i*.15);ctx.fillStyle=i%2===0?'#ff4444':'#4444ff';ctx.fillRect(fx,h*.72,h*.012,h*.2);}
        _cConfetti(ctx,w,h,t,40);
        const fa=Math.min(1,(t-1)*.5);if(t>1){ctx.fillStyle=`rgba(255,255,255,${fa*.9})`;ctx.font=`bold ${h*.06}px Arial`;ctx.textAlign='center';ctx.fillText('THE END',w*.5,h*.22);}
        ctx.fillStyle='rgba(255,200,0,.7)';ctx.font=`${h*.028}px Arial`;ctx.fillText('(Now a theme park!)',w*.5,h*.3);
      }},
    ]
  },
  { title:'Grandma In Space', genre:'👵 Comedy Adventure', price:25, bg:'#001133', icons:'👵🚀🌟',
    trailer:[
      {text:'🌻 Grandma just wanted to water her flowers...',dur:2500},
      {text:'🚀 But a rocket had other plans!',dur:2000},
      {text:'🌟 Now she\'s the most dangerous explorer in the galaxy.',dur:2500},
      {text:'👵🚀 GRANDMA IN SPACE! 👵🚀',dur:3000},
    ],
    scenes:[
      {dur:5,text:'Grandma tends her garden on a peaceful morning.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#c8e8c0');_cSun(ctx,w*.85,h*.14,h*.07,t);
        ctx.fillStyle='#5a9e3c';ctx.fillRect(0,h*.72,w,h*.28);
        for(let i=0;i<7;i++){const fx=w*(.1+i*.13),fc=['#ff6699','#ffcc00','#ff4444','#cc44ff'][i%4];ctx.fillStyle=fc;ctx.beginPath();ctx.arc(fx,h*.68,h*.024,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2a8a2a';ctx.fillRect(fx-h*.005,h*.68,h*.01,h*.075);}
        _cGrandma(ctx,w*.5,h*.56,h*.22,t,false);_cBird(ctx,w*.3,h*.22,h*.038,t);_cBird(ctx,w*.68,h*.18,h*.033,t+1);
        ctx.fillStyle='rgba(80,60,20,.8)';ctx.font=`${h*.03}px Arial`;ctx.textAlign='center';ctx.fillText('"What a lovely morning!"',w*.5,h*.9);
      }},
      {dur:5,text:'A strange rocket lands in the garden!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#c8e8c0');_cSun(ctx,w*.85,h*.14,h*.07,t);
        ctx.fillStyle='#5a9e3c';ctx.fillRect(0,h*.72,w,h*.28);
        const rly=h*(.8-Math.min(t*.15,0.45));_cRocket(ctx,w*.5,rly,h*.32,t);
        _cGrandma(ctx,w*.2,h*.56,h*.22,t,false);
        if(t>2){ctx.fillStyle='rgba(80,60,20,.9)';ctx.font=`${h*.03}px Arial`;ctx.textAlign='center';ctx.fillText('"My begonias!!!"',w*.5,h*.88);}
      }},
      {dur:5,text:'Grandma investigates the rocket!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#c8e8c0');ctx.fillStyle='#5a9e3c';ctx.fillRect(0,h*.72,w,h*.28);
        _cRocket(ctx,w*.55,h*.42,h*.32,t);_cGrandma(ctx,w*.28,h*.56,h*.22,t,false);
        if(t>1.5){ctx.fillStyle='#88ccff';ctx.beginPath();ctx.roundRect(w*.49,h*.46,w*.1,h*.14,h*.02);ctx.fill();}
        ctx.fillStyle='rgba(80,60,20,.9)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('"Ooh, is that a new kitchen gadget?"',w*.5,h*.9);
      }},
      {dur:5,text:'She climbs inside — WHOOSH! It launches!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#001133');
        const ry=h*(.5-t*.18);_cRocket(ctx,w*.5,ry,h*.28,t);
        _cStars(ctx,w,h,t,Math.min(80,t*20|0));
        if(t>1.5){const la=.5+.5*Math.abs(Math.sin(t*8));ctx.fillStyle=`rgba(255,150,0,${la*.7})`;ctx.font=`bold ${h*.052}px Arial`;ctx.textAlign='center';ctx.fillText('WHOOOOSH!!!',w*.5,h*.88);}
      }},
      {dur:5,text:'Grandma floats in zero gravity!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#000033');_cStars(ctx,w,h,t,100);
        _cPlanet(ctx,w*.8,h*.25,h*.1,'#3355aa','#112266',t);
        const gy=h*.45+Math.sin(t*1.2)*h*.1;_cGrandma(ctx,w*.5,gy,h*.22,t,false);
        ['☕','🍰','🌸'].forEach((e,i)=>{const ey=h*(.3+i*.12)+Math.sin(t*1.5+i)*h*.05;ctx.font=`${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText(e,w*(.22+i*.28),ey);});
        ctx.fillStyle='rgba(255,255,200,.8)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('"This is just like swimming!"',w*.5,h*.88);
      }},
      {dur:5,text:'She spots a strange alien planet!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000022','#000044');_cStars(ctx,w,h,t,80);
        _cPlanet(ctx,w*.62,h*.44,h*.24,'#44aa44','#226622',t);_cRocket(ctx,w*.25,h*.45,h*.18,t);
        ctx.fillStyle='rgba(100,255,100,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('STRANGE PLANET AHEAD!',w*.5,h*.12);
        if(t>2){const fa=Math.min(1,(t-2)*.5);ctx.fillStyle=`rgba(255,255,200,${fa*.8})`;ctx.font=`${h*.028}px Arial`;ctx.fillText('"It looks like my garden!"',w*.5,h*.88);}
      }},
      {dur:5,text:'Grandma lands and meets the aliens!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001100','#002200');ctx.fillStyle='#1a4a1a';ctx.fillRect(0,h*.72,w,h*.28);
        _cGrandma(ctx,w*.3,h*.56,h*.22,t,false);
        for(let i=0;i<Math.min(3,t*.8|0);i++){_cAlien(ctx,w*(.52+i*.16),h*.56,h*.18,t+i,false);}
        ctx.fillStyle='rgba(100,255,100,.9)';ctx.font=`${h*.032}px Arial`;ctx.textAlign='center';ctx.fillText('"Oh! New neighbors!"',w*.5,h*.88);
      }},
      {dur:5,text:'She teaches the aliens to bake cookies!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001100','#002200');ctx.fillStyle='#1a4a1a';ctx.fillRect(0,h*.72,w,h*.28);
        _cGrandma(ctx,w*.32,h*.56,h*.22,t,false);_cAlien(ctx,w*.6,h*.56,h*.18,t,false);_cAlien(ctx,w*.76,h*.58,h*.15,t+1,false);
        for(let i=0;i<5;i++){ctx.font=`${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('🍪',w*(.14+i*.18),h*(.38+Math.sin(t+i)*.02));}
        ctx.fillStyle='rgba(200,255,200,.9)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('"First you mix the flour..."',w*.5,h*.9);
      }},
      {dur:5,text:'The aliens LOVE the cookies!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001100','#002200');ctx.fillStyle='#1a4a1a';ctx.fillRect(0,h*.72,w,h*.28);
        for(let i=0;i<4;i++){_cAlien(ctx,w*(.14+i*.24),h*.54,h*.2,t+i,false);}
        _cConfetti(ctx,w,h,t,40);
        ctx.fillStyle='rgba(100,255,100,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('COOKIES = BEST INVENTION!',w*.5,h*.16);
      }},
      {dur:5,text:'A space race! Aliens challenge Grandma!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#000033');_cStars(ctx,w,h,t,60);
        _cRocket(ctx,w*.3,h*.45,h*.2,t);
        ctx.fillStyle='#44dd44';ctx.beginPath();ctx.ellipse(w*.68,h*.42,h*.11,h*.055,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#88ff88';ctx.beginPath();ctx.ellipse(w*.68,h*.38,h*.055,h*.038,0,0,Math.PI*2);ctx.fill();
        const la=.5+.5*Math.abs(Math.sin(t*8));ctx.fillStyle=`rgba(255,150,0,${la*.7})`;ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('SPACE RACE! GO!',w*.5,h*.88);
      }},
      {dur:5,text:'Grandma wins using her knitting GPS!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#000033');_cStars(ctx,w,h,t,80);
        _cRocket(ctx,w*(.2+t*.1),h*.42,h*.2,t);
        ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(w*.85,h*.2,h*.01,h*.7);
        for(let i=0;i<8;i++)for(let j=0;j<2;j++){ctx.fillStyle=(i+j)%2===0?'#000':'#fff';ctx.fillRect(w*.85+j*h*.01,h*(.2+i*.058),h*.01,h*.058);}
        if(t>3){_cConfetti(ctx,w,h,t,50);ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('GRANDMA WINS!!! 🏆',w*.5,h*.16);}
      }},
      {dur:5,text:'The alien king awards Grandma the Star Medal!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001100','#002200');ctx.fillStyle='#1a4a1a';ctx.fillRect(0,h*.72,w,h*.28);
        _cAlien(ctx,w*.28,h*.52,h*.28,t,false);_cGrandma(ctx,w*.64,h*.56,h*.22,t,false);
        ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(w*.64,h*.38,h*.04,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.036}px Arial`;ctx.textAlign='center';ctx.fillText('★ STAR MEDAL AWARDED ★',w*.5,h*.16);
      }},
      {dur:5,text:'Time to go home! The aliens wave goodbye!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#000033');_cStars(ctx,w,h,t,80);
        _cPlanet(ctx,w*.76,h*.3,h*.1,'#44aa44','#226622',t);
        const ry=h*(.6-t*.14);_cRocket(ctx,w*.3,ry,h*.2,t);
        ctx.font=`${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('👋',w*.76,h*.42);
        ctx.fillStyle='rgba(200,255,200,.8)';ctx.font=`${h*.028}px Arial`;ctx.fillText('"Visit again soon!"',w*.5,h*.88);
      }},
      {dur:5,text:'Grandma lands right in time for tea!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#c8e8c0');_cSun(ctx,w*.85,h*.14,h*.07,t);
        ctx.fillStyle='#5a9e3c';ctx.fillRect(0,h*.72,w,h*.28);
        _cRocket(ctx,w*.55,h*.44,h*.28,t);_cGrandma(ctx,w*.28,h*.56,h*.22,t,false);
        ctx.font=`${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('☕',w*.42,h*.62);
        ctx.fillStyle='rgba(80,60,20,.9)';ctx.font=`${h*.028}px Arial`;ctx.fillText('"Right on time for tea!"',w*.5,h*.88);
      }},
      {dur:5,text:'Best adventure EVER. Cookies: now galaxy-famous. THE END.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#000033');_cStars(ctx,w,h,t,100);
        _cGrandma(ctx,w*.5,h*.5,h*.28,t,false);_cConfetti(ctx,w,h,t,50);
        for(let i=0;i<4;i++){_cPlanet(ctx,w*(.1+i*.26),h*(.18+i%2*.1),h*.04,'#44aa44','#226622',t+i);}
        const fa=Math.min(1,(t-1)*.5);if(t>1){ctx.fillStyle=`rgba(255,255,255,${fa*.9})`;ctx.font=`bold ${h*.062}px Arial`;ctx.textAlign='center';ctx.fillText('THE END',w*.5,h*.24);}
      }},
    ]
  },
  { title:'Ghost Detective', genre:'👻 Mystery Thriller', price:20, bg:'#0a0a14', icons:'👻🔦🔍',
    trailer:[
      {text:'🌙 The city sleeps... but mysteries never do.',dur:2500},
      {text:'👻 One detective sees what others can\'t.',dur:2000},
      {text:'🔍 Every shadow holds a secret.',dur:2000},
      {text:'👻🔦 GHOST DETECTIVE! 🔦👻',dur:3000},
    ],
    scenes:[
      {dur:5,text:'Midnight. The haunted city never sleeps.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#020208','#050510');_cCity(ctx,w,h,true);_cStars(ctx,w,h,t,60);
        ctx.fillStyle='#fffde7';ctx.beginPath();ctx.arc(w*.18,h*.16,h*.07,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,200,.07)';ctx.beginPath();ctx.arc(w*.18,h*.16,h*.16,0,Math.PI*2);ctx.fill();
        const la=.3+.3*Math.sin(t*1.5);ctx.fillStyle=`rgba(200,200,255,${la})`;ctx.font=`${h*.03}px Arial`;ctx.textAlign='center';ctx.fillText('Something watches from the dark...',w*.5,h*.88);
      }},
      {dur:5,text:'Meet Ghost Detective — he solved his own mystery!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');_cDetective(ctx,w*.5,h*.48,h*.28,t);
        const glow=.2+.14*Math.sin(t*2);ctx.fillStyle=`rgba(200,220,255,${glow})`;ctx.beginPath();ctx.arc(w*.5,h*.5,h*.25,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(200,220,255,.85)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('GHOST DETECTIVE',w*.5,h*.18);
        if(t>2){ctx.fillStyle='rgba(180,200,255,.7)';ctx.font=`${h*.027}px Arial`;ctx.fillText('"I solve crimes from the other side."',w*.5,h*.88);}
      }},
      {dur:5,text:'A jewel has vanished from the museum!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#060610','#0c0c20');_cCity(ctx,w,h,true);
        ctx.fillStyle='#1a1a2e';ctx.fillRect(w*.3,h*.44,w*.4,h*.4);ctx.strokeStyle='#4455aa';ctx.lineWidth=2;ctx.strokeRect(w*.3,h*.44,w*.4,h*.4);
        for(let i=0;i<5;i++){ctx.strokeStyle='#4455aa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*(.35+i*.08),h*.44);ctx.lineTo(w*(.35+i*.08),h*.84);ctx.stroke();}
        ctx.fillStyle='rgba(100,100,200,.2)';ctx.beginPath();ctx.arc(w*.5,h*.6,h*.048,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#aabbff';ctx.lineWidth=2;ctx.stroke();
        const la=.5+.5*Math.sin(t*4);ctx.fillStyle=`rgba(255,50,50,${la})`;ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('🚨 JEWEL STOLEN! 🚨',w*.5,h*.18);
      }},
      {dur:5,text:'Ghost Detective floats through the walls!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        ctx.fillStyle='#1a1a2e';ctx.fillRect(w*.44,0,w*.12,h);ctx.strokeStyle='#2a2a4e';ctx.lineWidth=3;ctx.strokeRect(w*.44,0,w*.12,h);
        const glow=.3+.2*Math.sin(t*3);ctx.fillStyle=`rgba(200,220,255,${glow})`;ctx.beginPath();ctx.arc(w*.5,h*.5,h*.22,0,Math.PI*2);ctx.fill();
        ctx.save();ctx.globalAlpha=0.55;_cDetective(ctx,w*.5,h*.48,h*.24,t);ctx.restore();
        ctx.fillStyle='rgba(200,220,255,.8)';ctx.font=`${h*.03}px Arial`;ctx.textAlign='center';ctx.fillText('"Walls? What walls?"',w*.5,h*.88);
      }},
      {dur:5,text:'Searching for clues in the dark!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#030308','#060610');
        const fa=.6+.3*Math.sin(t*2);
        const beam=ctx.createRadialGradient(w*.3,h*.55,0,w*.3,h*.55,h*.45);
        beam.addColorStop(0,`rgba(255,255,200,${fa*.35})`);beam.addColorStop(1,'rgba(255,255,200,0)');
        ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(w*.3,h*.55);ctx.arc(w*.3,h*.55,h*.45,-Math.PI*.25,Math.PI*.25);ctx.closePath();ctx.fill();
        _cDetective(ctx,w*.28,h*.5,h*.24,t);
        if(t>2){ctx.fillStyle='rgba(100,150,255,.75)';ctx.font=`${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('👣',w*.65,h*.6);ctx.fillText('👣',w*.76,h*.5);}
        ctx.fillStyle='rgba(200,220,255,.8)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('"A ghost left these footprints!"',w*.5,h*.88);
      }},
      {dur:5,text:'The clues lead to the haunted mansion!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#030308','#060610');_cStars(ctx,w,h,t,40);
        ctx.fillStyle='#0a0a18';ctx.fillRect(w*.25,h*.28,w*.5,h*.55);
        ctx.fillStyle='#0c0c20';ctx.beginPath();ctx.moveTo(w*.25,h*.28);ctx.lineTo(w*.5,h*.1);ctx.lineTo(w*.75,h*.28);ctx.closePath();ctx.fill();
        const la=.3+.28*Math.sin(t*2);
        [[.35,.4],[.6,.4],[.45,.58]].forEach(([wx,wy])=>{ctx.fillStyle=`rgba(255,200,0,${la})`;ctx.beginPath();ctx.arc(w*wx,h*wy,h*.028,0,Math.PI*2);ctx.fill();});
        _cDetective(ctx,w*.18,h*.6,h*.2,t);
        const glow=.25+.14*Math.sin(t*3);ctx.fillStyle=`rgba(200,220,255,${glow})`;ctx.beginPath();ctx.arc(w*.18,h*.62,h*.18,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(200,150,255,.9)';ctx.font=`bold ${h*.034}px Arial`;ctx.textAlign='center';ctx.fillText('"The mansion! Of course!"',w*.5,h*.88);
      }},
      {dur:5,text:'Inside — a ghost thief counts stolen jewels!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        const gx=w*.58,gy=h*.44+Math.sin(t*2)*h*.018;
        ctx.fillStyle='rgba(220,220,255,.82)';ctx.beginPath();ctx.arc(gx,gy,h*.1,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.moveTo(gx-h*.1,gy);ctx.lineTo(gx-h*.1,gy+h*.15);ctx.quadraticCurveTo(gx-h*.07,gy+h*.18,gx-h*.04,gy+h*.12);ctx.quadraticCurveTo(gx+h*.01,gy+h*.18,gx+h*.04,gy+h*.12);ctx.quadraticCurveTo(gx+h*.07,gy+h*.18,gx+h*.1,gy+h*.12);ctx.lineTo(gx+h*.1,gy);ctx.fill();
        ctx.fillStyle='#333';ctx.beginPath();ctx.arc(gx-h*.038,gy,h*.024,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(gx+h*.038,gy,h*.024,0,Math.PI*2);ctx.fill();
        ['💎','💎','💎'].forEach((e,i)=>{ctx.font=`${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText(e,w*(.36+i*.1),h*.64);});
        _cDetective(ctx,w*.22,h*.5,h*.2,t);
        const glow=.28+.16*Math.sin(t*3);ctx.fillStyle=`rgba(200,220,255,${glow})`;ctx.beginPath();ctx.arc(w*.22,h*.52,h*.18,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,100,100,.9)';ctx.font=`bold ${h*.034}px Arial`;ctx.textAlign='center';ctx.fillText('"FREEZE! Ghost Police!"',w*.5,h*.88);
      }},
      {dur:5,text:'The thief runs through the ceiling!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');_cCity(ctx,w,h,true);
        const gy=h*(.52-t*.12);
        ctx.fillStyle='rgba(220,220,255,.78)';ctx.beginPath();ctx.arc(w*.58,gy,h*.09,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.moveTo(w*.49,gy);ctx.lineTo(w*.49,gy+h*.14);ctx.lineTo(w*.67,gy+h*.14);ctx.lineTo(w*.67,gy);ctx.fill();
        _cDetective(ctx,w*.4,h*.55,h*.2,t);
        const glow=.28+.16*Math.sin(t*3);ctx.fillStyle=`rgba(200,220,255,${glow})`;ctx.beginPath();ctx.arc(w*.4,h*.57,h*.18,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`bold ${h*.034}px Arial`;ctx.textAlign='center';ctx.fillText('"Can\'t escape a ghost detective!"',w*.5,h*.88);
      }},
      {dur:5,text:'Detective phases through the roof — thief cornered!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#030308','#060610');_cStars(ctx,w,h,t,50);
        ctx.fillStyle='#1a1a2e';ctx.fillRect(0,h*.72,w,h*.28);
        const gx=w*.76,gy=h*.6;
        ctx.fillStyle='rgba(220,220,255,.78)';ctx.beginPath();ctx.arc(gx,gy,h*.09,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,100,100,.9)';ctx.font=`bold ${h*.045}px Arial`;ctx.textAlign='center';ctx.fillText('😱',gx,gy+h*.02);
        _cDetective(ctx,w*.34,h*.6,h*.22,t);
        const glow=.28+.16*Math.sin(t*3);ctx.fillStyle=`rgba(200,220,255,${glow})`;ctx.beginPath();ctx.arc(w*.34,h*.62,h*.2,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,200,.9)';ctx.font=`${h*.03}px Arial`;ctx.textAlign='center';ctx.fillText('"Nowhere left to run!"',w*.5,h*.88);
      }},
      {dur:5,text:'Jewels returned! Ghost thief goes to ghost jail!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        ctx.fillStyle='rgba(150,150,200,.45)';for(let i=0;i<6;i++)ctx.fillRect(w*(.55+i*.05),h*.3,h*.01,h*.4);
        const gx=w*.68,gy=h*.44+Math.sin(t*1.5)*h*.018;
        ctx.fillStyle='rgba(180,180,220,.68)';ctx.beginPath();ctx.arc(gx,gy,h*.08,0,Math.PI*2);ctx.fill();
        ['💎','💎','💎'].forEach((e,i)=>{ctx.font=`${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText(e,w*(.2+i*.1),h*.5);});
        _cDetective(ctx,w*.25,h*.5,h*.22,t);
        const glow=.28+.15*Math.sin(t*3);ctx.fillStyle=`rgba(200,220,255,${glow})`;ctx.beginPath();ctx.arc(w*.25,h*.52,h*.2,0,Math.PI*2);ctx.fill();
        _cConfetti(ctx,w,h,t,30);ctx.fillStyle='rgba(200,220,255,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('CASE SOLVED!',w*.5,h*.18);
      }},
      {dur:5,text:'The city cheers in the moonlight!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');_cCity(ctx,w,h,true);
        ctx.fillStyle='#fffde7';ctx.beginPath();ctx.arc(w*.18,h*.16,h*.07,0,Math.PI*2);ctx.fill();
        _cDetective(ctx,w*.5,h*.5,h*.25,t);
        const glow=.22+.14*Math.sin(t*2);ctx.fillStyle=`rgba(200,220,255,${glow})`;ctx.beginPath();ctx.arc(w*.5,h*.52,h*.23,0,Math.PI*2);ctx.fill();
        _cConfetti(ctx,w,h,t,45);
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('HERO OF THE NIGHT! 🌙',w*.5,h*.18);
      }},
      {dur:5,text:'Another mystery solved. Another night begins.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#020208','#050510');_cCity(ctx,w,h,true);_cStars(ctx,w,h,t,80);
        ctx.fillStyle='#fffde7';ctx.beginPath();ctx.arc(w*.18,h*.16,h*.07,0,Math.PI*2);ctx.fill();
        _cDetective(ctx,w*.5,h*.55,h*.2,t);
        const glow=.18+.1*Math.sin(t*2);ctx.fillStyle=`rgba(200,220,255,${glow})`;ctx.beginPath();ctx.arc(w*.5,h*.57,h*.18,0,Math.PI*2);ctx.fill();
        const fa=Math.min(1,t*.4);ctx.fillStyle=`rgba(200,200,255,${fa*.7})`;ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('"The night is long. Cases await."',w*.5,h*.88);
      }},
      {dur:5,text:'And somewhere... another mystery stirs.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#020208','#050510');_cCity(ctx,w,h,true);_cStars(ctx,w,h,t,60);
        for(let i=0;i<5;i++){const qx=w*(.1+i*.2),qy=h*(.28+Math.sin(t+i)*h*.001);
          const qa=.4+.4*Math.sin(t*2+i);ctx.fillStyle=`rgba(200,200,255,${qa})`;ctx.font=`bold ${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('?',qx,qy);}
        ctx.fillStyle='rgba(150,150,255,.7)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('Ghost Detective will return...',w*.5,h*.88);
      }},
      {dur:5,text:'Ghost Detective will return. THE END.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#020208','#050510');_cStars(ctx,w,h,t,100);_cCity(ctx,w,h,true);
        ctx.fillStyle='#fffde7';ctx.beginPath();ctx.arc(w*.18,h*.16,h*.07,0,Math.PI*2);ctx.fill();
        _cDetective(ctx,w*.5,h*.52,h*.22,t);
        const glow=.22+.14*Math.sin(t*2);ctx.fillStyle=`rgba(200,220,255,${glow})`;ctx.beginPath();ctx.arc(w*.5,h*.54,h*.2,0,Math.PI*2);ctx.fill();
        _cConfetti(ctx,w,h,t,30);
        const fa=Math.min(1,(t-1)*.5);if(t>1){ctx.fillStyle=`rgba(255,255,255,${fa*.9})`;ctx.font=`bold ${h*.065}px Arial`;ctx.textAlign='center';ctx.fillText('THE END',w*.5,h*.28);}
      }},
    ]
  },
  { title:'Intergalactic Grand Prix', genre:'🏎️ Space Racing', price:20, bg:'#110011', icons:'🏎️🚀🏁',
    trailer:[
      {text:'🚀 The fastest drivers in the galaxy...',dur:2000},
      {text:'🏎️ Racing through asteroid fields!',dur:2000},
      {text:'🏁 One winner. Infinite glory.',dur:2000},
      {text:'🏎️🚀 INTERGALACTIC GRAND PRIX! 🚀🏁',dur:3000},
    ],
    scenes:[
      {dur:5,text:'Race day! Drivers from across the galaxy arrive!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#110011');_cStars(ctx,w,h,t,80);
        for(let i=0;i<4;i++){const cx=w*(.12+i*.25),cy=h*.65;
          _cCar(ctx,cx,cy,h*.18,t+i*1.2,['#ff2200','#00aaff','#22cc22','#ffcc00'][i]);}
        _cLines(ctx,w*.5,h*.3,h*.22,16,'rgba(255,200,0,.25)');
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.046}px Arial`;ctx.textAlign='center';ctx.fillText('RACE DAY!!! 🏁',w*.5,h*.18);
      }},
      {dur:5,text:'Alien racers show off their ships!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#110011');_cStars(ctx,w,h,t,60);
        _cAlien(ctx,w*.2,h*.55,h*.22,t,false);_cAlien(ctx,w*.5,h*.55,h*.22,t+1,false);_cAlien(ctx,w*.8,h*.55,h*.22,t+2,false);
        // alien ships above each
        [w*.2,w*.5,w*.8].forEach((ax,i)=>{ctx.fillStyle='#44dd44';ctx.beginPath();ctx.ellipse(ax,h*.32,h*.1,h*.05,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#88ff88';ctx.beginPath();ctx.ellipse(ax,h*.28,h*.05,h*.035,0,0,Math.PI*2);ctx.fill();});
        ctx.fillStyle='rgba(100,255,100,.9)';ctx.font=`bold ${h*.036}px Arial`;ctx.textAlign='center';ctx.fillText('"We will WIN this race!"',w*.5,h*.88);
      }},
      {dur:5,text:'LIGHTS! CAMERA! ACTION! The race begins!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#110011');_cStars(ctx,w,h,t,80);
        // starting lights
        for(let i=0;i<5;i++){const on=t>.5+i*.3;ctx.fillStyle=on?'#ff2200':'#330000';ctx.beginPath();ctx.arc(w*(.3+i*.1),h*.25,h*.035,0,Math.PI*2);ctx.fill();}
        _cCar(ctx,w*.15,h*.65,h*.2,t,'#ff2200');_cCar(ctx,w*.5,h*.68,h*.2,t+1,'#00aaff');
        if(t>2.5){const la=.7+.3*Math.abs(Math.sin(t*12));ctx.fillStyle=`rgba(255,255,0,${la})`;ctx.font=`bold ${h*.06}px Arial`;ctx.textAlign='center';ctx.fillText('GO GO GO!!!',w*.5,h*.88);}
      }},
      {dur:5,text:'Zooming through the asteroid field!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#050510');_cStars(ctx,w,h,t,60);
        // asteroids flying past
        for(let i=0;i<8;i++){const ax=(w*(.9+i*.15)-t*220+w*2)%(w*1.2)-w*.1;const ay=h*(.2+i*.08);
          ctx.fillStyle='#8a7a6a';ctx.beginPath();ctx.arc(ax,ay,h*.022+i%3*.01,0,Math.PI*2);ctx.fill();}
        _cCar(ctx,w*.3,h*.62,h*.22,t,'#ff2200');
        const la=.5+.5*Math.abs(Math.sin(t*8));ctx.fillStyle=`rgba(255,150,0,${la*.7})`;ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('DODGE THE ASTEROIDS!',w*.5,h*.88);
      }},
      {dur:5,text:'Power-up zone! Speed boost!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#001122');_cStars(ctx,w,h,t,60);
        // power-up rings
        for(let i=0;i<4;i++){const rx=(w*(.8-i*.2)-t*180+w*1.2)%(w*1.2)-w*.1;
          const rg=.4+.4*Math.sin(t*4+i);ctx.strokeStyle=`rgba(255,200,0,${rg})`;ctx.lineWidth=h*.018;ctx.beginPath();ctx.arc(rx,h*.5,h*.1,0,Math.PI*2);ctx.stroke();}
        _cCar(ctx,w*.3,h*.62,h*.22,t,'#ff2200');
        // speed lines
        for(let i=0;i<8;i++){ctx.strokeStyle=`rgba(255,200,0,${.2+i*.04})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(w*.52,h*(.3+i*.06));ctx.lineTo(w*.8,h*(.3+i*.06));ctx.stroke();}
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.046}px Arial`;ctx.textAlign='center';ctx.fillText('⚡ SPEED BOOST! ⚡',w*.5,h*.18);
      }},
      {dur:5,text:'CRASH! The villain cheats!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0500','#050000');_cStars(ctx,w,h,t,40);
        _cCar(ctx,w*.25,h*.6,h*.2,t,'#ff2200');
        // villain car ramming
        _cCar(ctx,w*.55,h*.6,h*.2,t,'#660033');
        if(t>1){_cExplo(ctx,w*.38,h*.6,h*.12,Math.min(1,(t-1)*.5));}
        const la=.5+.5*Math.abs(Math.sin(t*6));ctx.fillStyle=`rgba(255,50,50,${la})`;ctx.font=`bold ${h*.046}px Arial`;ctx.textAlign='center';ctx.fillText('THAT\'S CHEATING!!! 😤',w*.5,h*.18);
      }},
      {dur:5,text:'Back on track! Making a comeback!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#110011');_cStars(ctx,w,h,t,70);
        _cCar(ctx,w*(.1+t*.08),h*.62,h*.22,t,'#ff2200');
        _cCar(ctx,w*.8,h*.62,h*.2,t+1,'#660033');
        // speed trail
        ctx.strokeStyle='rgba(255,100,0,.4)';ctx.lineWidth=h*.014;ctx.beginPath();ctx.moveTo(0,h*.7);ctx.lineTo(w*(.1+t*.08-.05),h*.7);ctx.stroke();
        ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('COMEBACK MODE! 🔥',w*.5,h*.18);
      }},
      {dur:5,text:'Alien ship tries to block the track!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#110011');_cStars(ctx,w,h,t,60);
        // alien ship hovering
        const hov=Math.sin(t*2)*h*.02;
        ctx.fillStyle='#44dd44';ctx.beginPath();ctx.ellipse(w*.6,h*.44+hov,h*.14,h*.068,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#88ff88';ctx.beginPath();ctx.ellipse(w*.6,h*.4+hov,h*.065,h*.045,0,0,Math.PI*2);ctx.fill();
        _cCar(ctx,w*.25,h*.65,h*.22,t,'#ff2200');
        // beam down
        const bl=.3+.3*Math.sin(t*5);ctx.fillStyle=`rgba(100,255,100,${bl})`;ctx.fillRect(w*.55,h*.52,h*.1,h*.18);
        ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('DODGE THE BEAM!',w*.5,h*.88);
      }},
      {dur:5,text:'Final lap! Neck and neck!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#110011');_cStars(ctx,w,h,t,80);
        _cCar(ctx,w*.38,h*.62,h*.22,t,'#ff2200');_cCar(ctx,w*.55,h*.62,h*.2,t+1,'#660033');
        // finish line approaching
        const fl=w*.9;ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(fl,h*.4,h*.01,h*.5);
        for(let i=0;i<8;i++)for(let j=0;j<2;j++){ctx.fillStyle=(i+j)%2===0?'#000':'#fff';ctx.fillRect(fl+j*h*.01,h*(.4+i*.058),h*.01,h*.058);}
        const la=.5+.5*Math.abs(Math.sin(t*8));ctx.fillStyle=`rgba(255,255,0,${la})`;ctx.font=`bold ${h*.048}px Arial`;ctx.textAlign='center';ctx.fillText('FINAL LAP!!!',w*.5,h*.18);
      }},
      {dur:5,text:'Racing through a tunnel inside a planet!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#220022','#110011');
        // tunnel walls
        for(let i=0;i<20;i++){const tz=t*8+i*.5,tw=h*.04+Math.sin(tz)*.01,ty=h*(.35+i*.016);
          ctx.fillStyle=`rgba(100,50,150,${.2+.1*(i%3)})`;ctx.fillRect(0,ty,w*.1,tw);ctx.fillRect(w*.9,ty,w*.1,tw);}
        _cCar(ctx,w*.5,h*.62,h*.22,t,'#ff2200');
        // tunnel glow
        const tg=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,h*.4);tg.addColorStop(0,'rgba(150,50,200,.1)');tg.addColorStop(1,'rgba(150,50,200,0)');ctx.fillStyle=tg;ctx.fillRect(0,0,w,h);
        ctx.fillStyle='rgba(200,150,255,.9)';ctx.font=`bold ${h*.036}px Arial`;ctx.textAlign='center';ctx.fillText('THROUGH THE PLANET!',w*.5,h*.18);
      }},
      {dur:5,text:'Photo finish! The crowd goes wild!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#110011');_cStars(ctx,w,h,t,60);
        // both cars crossing line simultaneously
        _cCar(ctx,w*.45,h*.62,h*.22,t,'#ff2200');_cCar(ctx,w*.56,h*.62,h*.2,t+1,'#660033');
        const fl=w*.5;ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(fl,h*.35,h*.01,h*.55);
        _cConfetti(ctx,w,h,t,50);
        const la=.5+.5*Math.abs(Math.sin(t*6));ctx.fillStyle=`rgba(255,255,0,${la})`;ctx.font=`bold ${h*.052}px Arial`;ctx.textAlign='center';ctx.fillText('PHOTO FINISH!!!',w*.5,h*.18);
      }},
      {dur:5,text:'Winner: the Red Rocket Racer! #1!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#110011','#000011');_cStars(ctx,w,h,t,80);
        _cCar(ctx,w*.5,h*.62,h*.28,t,'#ff2200');_cConfetti(ctx,w,h,t,60);
        // podium
        ctx.fillStyle='#ffcc00';ctx.fillRect(w*.4,h*.74,w*.2,h*.08);
        ctx.fillStyle='#ffcc00';ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('🏆 WINNER!!! 🏆',w*.5,h*.22);
        _cLines(ctx,w*.5,h*.6,h*.3,20,'rgba(255,200,0,.3)');
      }},
      {dur:5,text:'The villain gets a ticket for cheating.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        _cCar(ctx,w*.6,h*.62,h*.2,t,'#660033');
        // space police car (blue)
        _cCar(ctx,w*.3,h*.62,h*.2,t+1,'#0055ff');
        const bl=Math.abs(Math.sin(t*6));ctx.fillStyle=`rgba(0,100,255,${bl})`;ctx.beginPath();ctx.arc(w*.35,h*.48,h*.035,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.9)';ctx.font=`${h*.03}px Arial`;ctx.textAlign='center';ctx.fillText('"You\'re getting a SPACE TICKET!"',w*.5,h*.88);
      }},
      {dur:5,text:'Galaxy celebrates the greatest race ever!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#110011');_cStars(ctx,w,h,t,100);
        _cCar(ctx,w*.5,h*.6,h*.25,t,'#ff2200');_cConfetti(ctx,w,h,t,60);
        for(let i=0;i<4;i++){_cPlanet(ctx,w*(.12+i*.26),h*(.2+i%2*.12),h*.04,['#cc4400','#3355aa','#3d8b3d','#888800'][i],['#660000','#112266','#1a4d1a','#444400'][i],t+i);}
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('GREATEST RACE IN HISTORY!',w*.5,h*.18);
      }},
      {dur:5,text:'THE END. (Villain\'s ticket: 5,000 space dollars.)',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#110011');_cStars(ctx,w,h,t,100);
        _cCar(ctx,w*.5,h*.58,h*.28,t,'#ff2200');_cConfetti(ctx,w,h,t,50);
        const fa=Math.min(1,(t-1)*.5);if(t>1){ctx.fillStyle=`rgba(255,255,255,${fa*.9})`;ctx.font=`bold ${h*.065}px Arial`;ctx.textAlign='center';ctx.fillText('THE END',w*.5,h*.28);}
        ctx.fillStyle='rgba(255,200,0,.7)';ctx.font=`${h*.026}px Arial`;ctx.fillText('(Villain\'s fine: 5,000 space dollars!)',w*.5,h*.36);
      }},
    ]
  },
  { title:'Ninja Academy', genre:'🥷 Action Comedy', price:25, bg:'#110a00', icons:'🥷📚⚡',
    trailer:[
      {text:'📚 A tiny student. A legendary school.',dur:2000},
      {text:'🥷 The ninjas were the best in the world.',dur:2000},
      {text:'⚡ One kid would change EVERYTHING.',dur:2000},
      {text:'🥷📚 NINJA ACADEMY! 📚🥷',dur:3000},
    ],
    scenes:[
      {dur:5,text:'The secret Ninja Academy on a misty mountain!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a1a22','#1a3a44');
        // mountain
        ctx.fillStyle='#2a4a5a';ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(w*.5,h*.18);ctx.lineTo(w,h);ctx.closePath();ctx.fill();
        // mist
        for(let i=0;i<5;i++){const mx=w*(i*.2)+Math.sin(t+i)*w*.05;const ma=.15+.08*Math.sin(t*.5+i);ctx.fillStyle=`rgba(200,220,240,${ma})`;ctx.beginPath();ctx.ellipse(mx,h*(.5+i*.06),h*.18,h*.05,0,0,Math.PI*2);ctx.fill();}
        // pagoda
        ctx.fillStyle='#3a2a1a';ctx.fillRect(w*.44,h*.32,w*.12,h*.2);
        ctx.fillStyle='#8b0000';ctx.beginPath();ctx.moveTo(w*.38,h*.32);ctx.lineTo(w*.5,h*.2);ctx.lineTo(w*.62,h*.32);ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(255,220,150,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('NINJA ACADEMY',w*.5,h*.12);
      }},
      {dur:5,text:'Our hero arrives — tiny but determined!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a1a22','#1a3a44');
        ctx.fillStyle='#2a4a5a';ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(w*.5,h*.2);ctx.lineTo(w,h);ctx.closePath();ctx.fill();
        _cNinja(ctx,w*.5,h*.58,h*.22,t,false);
        // big gates
        ctx.fillStyle='#8b0000';ctx.fillRect(w*.3,h*.42,h*.025,h*.3);ctx.fillRect(w*.68,h*.42,h*.025,h*.3);
        ctx.fillStyle='rgba(255,220,150,.9)';ctx.font=`${h*.03}px Arial`;ctx.textAlign='center';ctx.fillText('"I will become the greatest ninja!"',w*.5,h*.88);
      }},
      {dur:5,text:'Meet Master Ninja — ancient and undefeated!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0a18','#14142a');
        _cNinja(ctx,w*.5,h*.5,h*.32,t,false);
        _cLines(ctx,w*.5,h*.5,h*.28,12,'rgba(255,100,100,.2)');
        ctx.fillStyle='rgba(255,80,80,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('MASTER NINJA',w*.5,h*.18);
        if(t>2){ctx.fillStyle='rgba(255,200,150,.8)';ctx.font=`${h*.028}px Arial`;ctx.fillText('"You are too small. Too weak. Too clumsy."',w*.5,h*.88);}
      }},
      {dur:5,text:'Training begins! Running up walls!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a1a22','#1a3a44');
        // wall
        ctx.fillStyle='#3a2a1a';ctx.fillRect(w*.55,0,w*.08,h);
        // ninja running up wall
        const wy=h*(.8-Math.min(t*.18,0.75));_cNinja(ctx,w*.56,wy,h*.2,t,true);
        // master watching
        _cNinja(ctx,w*.22,h*.62,h*.24,t,false);
        ctx.fillStyle='rgba(255,200,150,.8)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('"Faster! Walls don\'t care if you\'re tired!"',w*.5,h*.88);
      }},
      {dur:5,text:'Fail! Falls off the wall — BONK!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a1a22','#1a3a44');
        ctx.fillStyle='#3a2a1a';ctx.fillRect(w*.55,0,w*.08,h);
        // ninja fallen
        ctx.save();ctx.translate(w*.55,h*.72);ctx.rotate(Math.PI*.5+Math.sin(t*.5)*.05);_cNinja(ctx,0,0,h*.2,t,false);ctx.restore();
        if(t>1){ctx.font=`${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('⭐',w*.7,h*.68);}
        ctx.fillStyle='rgba(255,200,150,.8)';ctx.font=`bold ${h*.032}px Arial`;ctx.textAlign='center';ctx.fillText('BONK! 😵',w*.5,h*.18);
        if(t>2){ctx.fillStyle='rgba(255,200,150,.8)';ctx.font=`${h*.026}px Arial`;ctx.fillText('"...Get up. Try again."',w*.5,h*.88);}
      }},
      {dur:5,text:'Trying again! And again! And again!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a1a22','#1a3a44');
        for(let i=0;i<Math.min(3,t*.7|0);i++){_cNinja(ctx,w*(.35+i*.15),h*(.62-i*.06),h*.18,t+i,i===2);}
        ctx.fillStyle='rgba(255,150,0,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('NEVER GIVE UP!',w*.5,h*.18);
        ctx.fillStyle='rgba(255,200,150,.7)';ctx.font=`${h*.026}px Arial`;ctx.textAlign='center';ctx.fillText('"Try number " + Math.floor(t*8+1)...',w*.5,h*.88);
      }},
      {dur:5,text:'Learning the Thunder Kick!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');_cStars(ctx,w,h,t,30);
        _cNinja(ctx,w*.5,h*.56,h*.28,t,true);
        // lightning around ninja
        const la=.4+.4*Math.abs(Math.sin(t*8));ctx.strokeStyle=`rgba(255,255,0,${la})`;ctx.lineWidth=h*.018;
        ctx.beginPath();ctx.moveTo(w*.38,h*.44);ctx.lineTo(w*.45,h*.52);ctx.lineTo(w*.42,h*.6);ctx.stroke();
        ctx.beginPath();ctx.moveTo(w*.62,h*.44);ctx.lineTo(w*.55,h*.52);ctx.lineTo(w*.58,h*.6);ctx.stroke();
        ctx.fillStyle='rgba(255,255,0,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('⚡ THUNDER KICK! ⚡',w*.5,h*.18);
      }},
      {dur:5,text:'Final test: battle the robot dummy!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0a18','#14142a');
        _cRobot(ctx,w*.66,h*.54,h*.26,t,false);_cNinja(ctx,w*.3,h*.56,h*.24,t,true);
        if(t>2){const la=.5+.5*Math.abs(Math.sin(t*8));ctx.strokeStyle=`rgba(255,255,0,${la})`;ctx.lineWidth=h*.014;ctx.beginPath();ctx.moveTo(w*.44,h*.5);ctx.lineTo(w*.58,h*.5);ctx.stroke();}
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('FINAL TEST!',w*.5,h*.18);
      }},
      {dur:5,text:'The robot fires back — dodge everything!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0a18','#14142a');
        _cRobot(ctx,w*.66,h*.54,h*.26,t,true);_cNinja(ctx,w*.3,h*.56,h*.24,t,true);
        // lasers
        for(let i=0;i<Math.min(3,t|0);i++){const ry=h*(.4+i*.08),la=.5+.5*Math.abs(Math.sin(t*8+i));
          ctx.strokeStyle=`rgba(0,200,255,${la})`;ctx.lineWidth=h*.01;ctx.beginPath();ctx.moveTo(w*.58,ry);ctx.lineTo(w*.44,ry+h*.04);ctx.stroke();}
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('DODGE! DODGE! DODGE!',w*.5,h*.88);
      }},
      {dur:5,text:'Thunder Kick hits the robot — K.O.!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0a18','#14142a');
        _cNinja(ctx,w*.35,h*.56,h*.24,t,true);
        const ep=Math.min(1,t*.4);_cExplo(ctx,w*.66,h*.52,h*.22,ep);
        _cRobot(ctx,w*.68,h*.62,h*.22,t,false);
        const la=.5+.5*Math.abs(Math.sin(t*8));ctx.fillStyle=`rgba(255,255,0,${la})`;ctx.font=`bold ${h*.055}px Arial`;ctx.textAlign='center';ctx.fillText('⚡ K.O.! ⚡',w*.5,h*.18);
      }},
      {dur:5,text:'Graduation day! Master is proud!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a1a22','#1a3a44');
        _cNinja(ctx,w*.35,h*.56,h*.28,t,false);_cNinja(ctx,w*.62,h*.58,h*.22,t+1,false);
        _cConfetti(ctx,w,h,t,45);
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('GRADUATION DAY! 🎓',w*.5,h*.18);
        if(t>2){ctx.fillStyle='rgba(255,200,150,.8)';ctx.font=`${h*.028}px Arial`;ctx.fillText('"...Not bad. Not bad at all."',w*.5,h*.88);}
      }},
      {dur:5,text:'A ninja thief attacks the village!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');_cCity(ctx,w,h,true);
        // evil ninja (red eyes)
        _cNinja(ctx,w*.72,h*.56,h*.26,t,true);
        const la=.5+.5*Math.sin(t*5);ctx.fillStyle=`rgba(255,0,0,${la})`;
        ctx.beginPath();ctx.arc(w*.66,h*.45,h*.02,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(w*.72,h*.45,h*.02,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,50,50,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('VILLAGE UNDER ATTACK!',w*.5,h*.18);
      }},
      {dur:5,text:'Our hero defends the village! Epic battle!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');_cCity(ctx,w,h,true);
        _cNinja(ctx,w*.3,h*.56,h*.26,t,true);_cNinja(ctx,w*.7,h*.56,h*.24,t+1.5,true);
        if(t>1.5){_cExplo(ctx,w*.5,h*.55,h*.14,Math.min(1,(t-1.5)*.5));}
        const la=.5+.5*Math.abs(Math.sin(t*8));ctx.strokeStyle=`rgba(255,255,0,${la})`;ctx.lineWidth=h*.018;
        ctx.beginPath();ctx.moveTo(w*.42,h*.5);ctx.lineTo(w*.58,h*.5);ctx.stroke();
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('FINAL BATTLE!',w*.5,h*.18);
      }},
      {dur:5,text:'Victory! The village is protected!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#c8e8c0');_cSun(ctx,w*.85,h*.14,h*.065,t);
        ctx.fillStyle='#5a9e3c';ctx.fillRect(0,h*.72,w,h*.28);
        _cNinja(ctx,w*.5,h*.56,h*.28,t,false);_cConfetti(ctx,w,h,t,55);
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('NINJA HERO!!! 🥷⚡',w*.5,h*.18);
      }},
      {dur:5,text:'Ninja Academy: now accepting new students. THE END.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a1a22','#1a3a44');
        ctx.fillStyle='#2a4a5a';ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(w*.5,h*.18);ctx.lineTo(w,h);ctx.closePath();ctx.fill();
        _cNinja(ctx,w*.5,h*.56,h*.26,t,false);_cConfetti(ctx,w,h,t,40);
        const fa=Math.min(1,(t-1)*.5);if(t>1){ctx.fillStyle=`rgba(255,255,255,${fa*.9})`;ctx.font=`bold ${h*.065}px Arial`;ctx.textAlign='center';ctx.fillText('THE END',w*.5,h*.28);}
      }},
    ]
  },
  { title:'Aliens Ate My Pizza', genre:'👽 Sci-Fi Comedy', price:25, bg:'#001a00', icons:'👽🍕😱',
    trailer:[
      {text:'🍕 The world\'s greatest pizza was ready...',dur:2000},
      {text:'👽 Then the aliens showed up.',dur:2000},
      {text:'😱 All 200 pizzas. Gone. In 8 seconds.',dur:2500},
      {text:'👽🍕 ALIENS ATE MY PIZZA! 🍕👽',dur:3000},
    ],
    scenes:[
      {dur:5,text:'Luigi\'s Pizza — the world\'s most famous pizza shop!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#ff8a65','#ffcc80');_cSun(ctx,w*.85,h*.14,h*.07,t);
        ctx.fillStyle='#c62828';ctx.fillRect(w*.2,h*.32,w*.6,h*.5);ctx.fillStyle='#ffcc02';ctx.fillRect(w*.2,h*.32,w*.6,h*.1);
        ctx.fillStyle='#8b0000';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('LUIGI\'S PIZZA 🍕',w*.5,h*.38);
        // pizzas in window
        [w*.3,w*.45,w*.6].forEach(px=>{_cPizza(ctx,px,h*.58,h*.12,t,false);});
        _cBird(ctx,w*.3,h*.2,h*.038,t);
        ctx.fillStyle='rgba(80,40,10,.9)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('"Best pizza in the UNIVERSE!"',w*.5,h*.9);
      }},
      {dur:5,text:'A huge UFO appears over the city!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#ffcc80','#ff8a65');_cCity(ctx,w,h,false);
        // UFO descending
        const uy=h*(.12+Math.min(t*.06,0.2));
        ctx.fillStyle='#66aa66';ctx.beginPath();ctx.ellipse(w*.5,uy,h*.22,h*.08,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#88cc88';ctx.beginPath();ctx.ellipse(w*.5,uy-h*.05,h*.1,h*.07,0,0,Math.PI*2);ctx.fill();
        const bl=.3+.3*Math.sin(t*4);ctx.fillStyle=`rgba(100,255,100,${bl})`;ctx.beginPath();ctx.ellipse(w*.5,uy+h*.08,h*.25,h*.04,0,0,Math.PI*2);ctx.fill();
        const la=.5+.5*Math.abs(Math.sin(t*4));ctx.fillStyle=`rgba(255,50,50,${la})`;ctx.font=`bold ${h*.045}px Arial`;ctx.textAlign='center';ctx.fillText('👽 UFO DETECTED! 👽',w*.5,h*.56);
      }},
      {dur:5,text:'The aliens smell the pizza from space!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#001100');_cStars(ctx,w,h,t,80);
        // UFO in space sniffing
        ctx.fillStyle='#66aa66';ctx.beginPath();ctx.ellipse(w*.5,h*.3,h*.18,h*.065,0,0,Math.PI*2);ctx.fill();
        _cAlien(ctx,w*.5,h*.22,h*.16,t,false);
        // smell lines going to pizza
        for(let i=0;i<4;i++){const sa=.3+.2*Math.sin(t*2+i);ctx.strokeStyle=`rgba(255,200,100,${sa})`;ctx.lineWidth=h*.008;ctx.beginPath();ctx.moveTo(w*.5,h*.35);ctx.quadraticCurveTo(w*(.4+i*.05),h*.5,w*(.1+i*.2),h*.88);ctx.stroke();}
        _cPlanet(ctx,w*.8,h*.72,h*.08,'#7a5c44','#4a3c2a',t);
        ctx.fillStyle='rgba(100,255,100,.9)';ctx.font=`bold ${h*.036}px Arial`;ctx.textAlign='center';ctx.fillText('"PIZZA SCENT DETECTED!"',w*.5,h*.88);
      }},
      {dur:5,text:'They beam down right into the pizza shop!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#ff8a65','#ffcc80');
        ctx.fillStyle='#c62828';ctx.fillRect(w*.2,h*.4,w*.6,h*.45);
        // beam
        const bl=.3+.25*Math.sin(t*5);ctx.fillStyle=`rgba(100,255,100,${bl})`;ctx.beginPath();ctx.moveTo(w*.4,0);ctx.lineTo(w*.32,h*.4);ctx.lineTo(w*.68,h*.4);ctx.lineTo(w*.6,0);ctx.closePath();ctx.fill();
        for(let i=0;i<Math.min(3,t*.9|0);i++){_cAlien(ctx,w*(.35+i*.15),h*.55,h*.18,t+i,false);}
        ctx.fillStyle='rgba(255,50,50,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('THEY\'RE INSIDE!!!',w*.5,h*.18);
      }},
      {dur:5,text:'The aliens eat ALL the pizzas in 8 seconds!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#ff8a65','#ffcc80');
        ctx.fillStyle='#c62828';ctx.fillRect(w*.2,h*.4,w*.6,h*.45);
        _cAlien(ctx,w*.35,h*.58,h*.2,t,false);_cAlien(ctx,w*.55,h*.55,h*.22,t+1,false);_cAlien(ctx,w*.72,h*.58,h*.18,t+2,false);
        const eaten=Math.min(200,t*25|0);
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText(`Pizzas eaten: ${eaten}/200`,w*.5,h*.22);
        if(t>3){_cConfetti(ctx,w,h,t,30);}
        ctx.fillStyle='rgba(255,255,255,.8)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('"DELICIOUS. MORE. MORE!"',w*.5,h*.9);
      }},
      {dur:5,text:'PIZZA EMERGENCY! Chef Luigi calls for help!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#ffcc80','#ff8a65');
        // chef luigi (simple)
        ctx.fillStyle='#f5c89a';ctx.beginPath();ctx.arc(w*.5,h*.42,h*.1,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(w*.5,h*.3,h*.08,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#333';ctx.fillRect(w*.44,h*.52,w*.12,h*.2);
        const al=Math.abs(Math.sin(t*6));ctx.fillStyle=`rgba(255,0,0,${al})`;ctx.font=`bold ${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('🚨 PIZZA EMERGENCY! 🚨',w*.5,h*.16);
        if(t>2){ctx.fillStyle='rgba(200,50,0,.9)';ctx.font=`${h*.028}px Arial`;ctx.fillText('"Someone! Anyone! SAVE THE PIZZA!"',w*.5,h*.86);}
      }},
      {dur:5,text:'Pizza Chef picks up a giant pizza cannon!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#ffcc80','#ff8a65');
        // canon (long cylinder)
        ctx.fillStyle='#8b0000';ctx.save();ctx.translate(w*.5,h*.55);ctx.rotate(-.25);
        ctx.fillRect(-h*.04,-h*.04,h*.4,h*.08);ctx.restore();
        // chef holding it
        ctx.fillStyle='#f5c89a';ctx.beginPath();ctx.arc(w*.35,h*.44,h*.09,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(w*.35,h*.33,h*.072,0,Math.PI*2);ctx.fill();
        _cPizza(ctx,w*.8,h*.5,h*.1,t,false);
        ctx.fillStyle='rgba(200,50,0,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('THE PIZZA CANNON!!! 🍕💥',w*.5,h*.18);
      }},
      {dur:5,text:'BOOM! Pizza flying everywhere!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#ffcc80','#ff8a65');
        for(let i=0;i<Math.min(6,t*1.5|0);i++){
          const px=w*(.1+i*.15)+Math.sin(i*2.3)*w*.05;
          const py=h*(.2+((t*0.2+i*.12)%0.7));
          _cPizza(ctx,px,py,h*.1,t+i,false);}
        _cAlien(ctx,w*.6,h*.55,h*.2,t,false);
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.045}px Arial`;ctx.textAlign='center';ctx.fillText('PIZZA BARRAGE!!!',w*.5,h*.18);
      }},
      {dur:5,text:'The aliens... catch the pizzas and eat them!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001a00','#002200');ctx.fillStyle='#1a4a1a';ctx.fillRect(0,h*.72,w,h*.28);
        _cAlien(ctx,w*.25,h*.55,h*.22,t,false);_cAlien(ctx,w*.5,h*.52,h*.24,t+1,false);_cAlien(ctx,w*.75,h*.55,h*.2,t+2,false);
        for(let i=0;i<3;i++){_cPizza(ctx,w*(.25+i*.25),h*.38,h*.1,t+i,false);}
        ctx.fillStyle='rgba(100,255,100,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('"THANK YOU FOR THE AMMO!!!"',w*.5,h*.18);
      }},
      {dur:5,text:'Peace treaty: aliens promise to MAKE pizza!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#ff8a65','#ffcc80');
        // treaty paper
        ctx.fillStyle='#fffff0';ctx.fillRect(w*.3,h*.3,w*.4,h*.45);ctx.strokeStyle='#8b0000';ctx.lineWidth=2;ctx.strokeRect(w*.3,h*.3,w*.4,h*.45);
        ctx.fillStyle='#333';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('PIZZA TREATY 🍕',w*.5,h*.38);
        ctx.fillText('Aliens: supply cheese',w*.5,h*.48);ctx.fillText('Luigi: share the recipe',w*.5,h*.56);
        _cAlien(ctx,w*.22,h*.6,h*.2,t,false);
        ctx.fillStyle='rgba(100,255,100,.9)';ctx.font=`bold ${h*.034}px Arial`;ctx.textAlign='center';ctx.fillText('PEACE TREATY SIGNED!',w*.5,h*.18);
      }},
      {dur:5,text:'Aliens deliver space cheese from across the galaxy!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#001100');_cStars(ctx,w,h,t,80);
        _cRocket(ctx,w*.5,h*.4,h*.22,t);
        // cheese emojis
        ['🧀','🧀','🧀'].forEach((e,i)=>{ctx.font=`${h*.045}px Arial`;ctx.textAlign='center';ctx.fillText(e,w*(.25+i*.25),h*.72);});
        ctx.fillStyle='rgba(255,220,100,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('SPACE CHEESE DELIVERY!',w*.5,h*.18);
      }},
      {dur:5,text:'World\'s first intergalactic pizza is BORN!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#ff8a65','#ffcc80');
        _cPizza(ctx,w*.5,h*.5,h*.28,t,false);_cConfetti(ctx,w,h,t,50);_cLines(ctx,w*.5,h*.5,h*.3,16,'rgba(255,100,0,.3)');
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('INTERGALACTIC PIZZA! 🌌🍕',w*.5,h*.16);
      }},
      {dur:5,text:'Luigi\'s Pizza becomes famous galaxy-wide!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#001100');_cStars(ctx,w,h,t,100);
        _cPizza(ctx,w*.5,h*.5,h*.22,t,false);
        for(let i=0;i<4;i++){_cAlien(ctx,w*(.1+i*.27),h*.65,h*.16,t+i,false);}
        _cConfetti(ctx,w,h,t,50);
        ctx.fillStyle='rgba(255,220,100,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('"Best restaurant in the universe!"',w*.5,h*.18);
      }},
      {dur:5,text:'And that\'s why pizza is magic. THE END.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#ff8a65','#ffcc80');_cSun(ctx,w*.85,h*.14,h*.065,t);
        _cPizza(ctx,w*.5,h*.52,h*.28,t,false);_cConfetti(ctx,w,h,t,50);
        const fa=Math.min(1,(t-1)*.5);if(t>1){ctx.fillStyle=`rgba(200,50,0,${fa*.9})`;ctx.font=`bold ${h*.065}px Arial`;ctx.textAlign='center';ctx.fillText('THE END',w*.5,h*.28);}
        ctx.fillStyle='rgba(200,50,0,.7)';ctx.font=`${h*.026}px Arial`;ctx.fillText('(Eat your pizza. Every. Last. Slice.)',w*.5,h*.36);
      }},
    ]
  },
  { title:'The Dragon and the Robot', genre:'🐉 Epic Friendship', price:30, bg:'#1a0a00', icons:'🐉🤖🔥',
    trailer:[
      {text:'🔥 The dragon burned everything it touched.',dur:2000},
      {text:'🤖 The robot destroyed everything it saw.',dur:2000},
      {text:'💥 What happens when enemies must team up?',dur:2500},
      {text:'🐉🤖 THE DRAGON AND THE ROBOT! 🤖🐉',dur:3000},
    ],
    scenes:[
      {dur:5,text:'The robot city: cold, metal, perfect.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0a14','#14142a');_cCity(ctx,w,h,true);
        _cRobot(ctx,w*.5,h*.58,h*.26,t,false);
        ctx.fillStyle='rgba(0,200,255,.8)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('THE ROBOT CITY',w*.5,h*.16);
        const fa=Math.min(1,t*.4);ctx.fillStyle=`rgba(100,200,255,${fa*.6})`;ctx.font=`${h*.026}px Arial`;ctx.fillText('"Order. Logic. No fire allowed."',w*.5,h*.88);
      }},
      {dur:5,text:'The dragon\'s mountain: hot, wild, free.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a0500','#2a0a00');
        // volcano mountain
        ctx.fillStyle='#6a2800';ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(w*.5,h*.14);ctx.lineTo(w,h);ctx.closePath();ctx.fill();
        const flame=.5+.5*Math.abs(Math.sin(t*5));ctx.fillStyle=`rgba(255,100,0,${flame})`;ctx.beginPath();ctx.arc(w*.5,h*.12,h*.06*flame,0,Math.PI*2);ctx.fill();
        _cDragon(ctx,w*.5,h*.52,h*.3,t,true);
        ctx.fillStyle='rgba(255,100,0,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('THE DRAGON\'S MOUNTAIN',w*.5,h*.82);
      }},
      {dur:5,text:'Robot patrols the border. Dragon watches.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0505','#100a00');
        // split screen divider
        ctx.fillStyle='rgba(200,100,0,.3)';ctx.fillRect(w*.5-2,0,4,h);
        _cRobot(ctx,w*.25,h*.56,h*.24,t,false);_cDragon(ctx,w*.72,h*.52,h*.28,t,false);
        ctx.fillStyle='rgba(0,200,255,.7)';ctx.font=`${h*.026}px Arial`;ctx.textAlign='center';ctx.fillText('"Stay on YOUR side."',w*.22,h*.88);
        ctx.fillStyle='rgba(255,100,0,.7)';ctx.font=`${h*.026}px Arial`;ctx.fillText('"Oh yeah? Make me."',w*.72,h*.88);
      }},
      {dur:5,text:'They fight — sparks and fire everywhere!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a0500','#0a0a00');
        _cDragon(ctx,w*.62,h*.5,h*.3,t,true);_cRobot(ctx,w*.3,h*.58,h*.24,t,true);
        const ep=Math.min(1,t*.35);_cExplo(ctx,w*.48,h*.52,h*.2,ep);
        const la=.5+.5*Math.abs(Math.sin(t*8));
        ctx.strokeStyle=`rgba(255,200,0,${la})`;ctx.lineWidth=h*.018;ctx.beginPath();ctx.moveTo(w*.4,h*.5);ctx.lineTo(w*.54,h*.5);ctx.stroke();
        ctx.fillStyle='rgba(255,100,0,.9)';ctx.font=`bold ${h*.045}px Arial`;ctx.textAlign='center';ctx.fillText('💥 BATTLE! 💥',w*.5,h*.18);
      }},
      {dur:5,text:'Robot malfunctions and falls! Dragon could finish it...',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0a14','#14142a');
        // robot fallen
        ctx.save();ctx.translate(w*.35,h*.68);ctx.rotate(Math.PI*.5);_cRobot(ctx,0,0,h*.22,t,false);ctx.restore();
        _cDragon(ctx,w*.65,h*.5,h*.28,t,false);
        const glow=.3+.2*Math.sin(t*3);ctx.fillStyle=`rgba(255,100,0,${glow})`;ctx.beginPath();ctx.arc(w*.65,h*.5,h*.24,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`bold ${h*.036}px Arial`;ctx.textAlign='center';ctx.fillText('"I could end this now..."',w*.5,h*.18);
      }},
      {dur:5,text:'Dragon... helps the robot up! Why?',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0505','#100a00');
        _cRobot(ctx,w*.4,h*.56,h*.24,t,false);_cDragon(ctx,w*.62,h*.52,h*.28,t,false);
        // connection glow
        const glr=.2+.15*Math.sin(t*2);ctx.fillStyle=`rgba(255,150,0,${glr})`;ctx.beginPath();ctx.arc(w*.5,h*.54,h*.14,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('"...because that\'s what the REAL code says."',w*.5,h*.88);
      }},
      {dur:5,text:'A GIANT monster threatens both their homes!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a0500','#0a0000');_cCity(ctx,w,h,true);
        // giant monster (big purple blob with eyes)
        ctx.fillStyle='#440044';ctx.beginPath();ctx.arc(w*.6,h*.45,h*.22,0,Math.PI*2);ctx.fill();
        const la=.5+.5*Math.sin(t*4);ctx.fillStyle=`rgba(200,0,200,${la})`;
        ctx.beginPath();ctx.arc(w*.54,h*.4,h*.04,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(w*.66,h*.4,h*.04,0,Math.PI*2);ctx.fill();
        _cRobot(ctx,w*.18,h*.6,h*.2,t,false);_cDragon(ctx,w*.35,h*.56,h*.24,t,false);
        ctx.fillStyle='rgba(255,0,200,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('GIANT MONSTER ATTACK!',w*.5,h*.88);
      }},
      {dur:5,text:'Dragon + Robot team up! Plan of action!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0505','#100a00');
        _cDragon(ctx,w*.35,h*.54,h*.26,t,false);_cRobot(ctx,w*.62,h*.56,h*.24,t,false);
        // connection beam between them
        const la=.4+.3*Math.sin(t*4);ctx.strokeStyle=`rgba(255,150,50,${la})`;ctx.lineWidth=h*.014;ctx.beginPath();ctx.moveTo(w*.46,h*.52);ctx.lineTo(w*.55,h*.52);ctx.stroke();
        ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('ALLIANCE FORMED! 🔥🤖',w*.5,h*.18);
        if(t>2){ctx.fillStyle='rgba(255,200,0,.7)';ctx.font=`${h*.026}px Arial`;ctx.fillText('"Dragon breathes fire. Robot aims. We win."',w*.5,h*.88);}
      }},
      {dur:5,text:'Dragon fires — robot aims — DIRECT HIT!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a0500','#0a0000');
        _cDragon(ctx,w*.25,h*.56,h*.26,t,true);_cRobot(ctx,w*.46,h*.58,h*.22,t,false);
        // fire beam aimed at monster
        if(t>1){const la=.6+.3*Math.abs(Math.sin(t*8));ctx.fillStyle=`rgba(255,120,0,${la})`;ctx.beginPath();ctx.moveTo(w*.3,h*.48);ctx.lineTo(w*.72,h*.46);ctx.lineTo(w*.3,h*.44);ctx.closePath();ctx.fill();}
        const ep=Math.min(1,Math.max(0,(t-2)*.5));if(t>2){_cExplo(ctx,w*.75,h*.45,h*.2,ep);}
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.048}px Arial`;ctx.textAlign='center';ctx.fillText('🎯 DIRECT HIT! 🎯',w*.5,h*.88);
      }},
      {dur:5,text:'Monster defeated! City saved!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#ffe0b2');_cCity(ctx,w,h,false);_cSun(ctx,w*.85,h*.14,h*.065,t);
        _cDragon(ctx,w*.35,h*.54,h*.26,t,false);_cRobot(ctx,w*.62,h*.56,h*.24,t,false);
        _cConfetti(ctx,w,h,t,50);
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('CITY SAVED!!! 🎉',w*.5,h*.18);
      }},
      {dur:5,text:'Dragon moves to the city. Robot visits the mountain.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0505','#100a00');
        // half city half mountain
        _cCity(ctx,w,h,false);
        ctx.fillStyle='#6a2800';ctx.beginPath();ctx.moveTo(w*.6,h*.7);ctx.lineTo(w*.8,h*.3);ctx.lineTo(w,h*.7);ctx.closePath();ctx.fill();
        _cRobot(ctx,w*.22,h*.58,h*.2,t,false);_cDragon(ctx,w*.62,h*.54,h*.24,t,false);
        ctx.fillStyle='rgba(255,200,100,.9)';ctx.font=`bold ${h*.036}px Arial`;ctx.textAlign='center';ctx.fillText('BEST NEIGHBORS EVER!',w*.5,h*.18);
      }},
      {dur:5,text:'Dragon teaches robot to feel. Robot teaches dragon to count.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        _cDragon(ctx,w*.3,h*.54,h*.26,t,false);_cRobot(ctx,w*.65,h*.56,h*.24,t,false);
        // numbers and flames floating
        ['1','2','🔥','3','4','🔥'].forEach((e,i)=>{const ey=h*(.38+Math.sin(t+i)*h*.001);ctx.fillStyle=i%2===0?'rgba(0,200,255,.8)':'rgba(255,100,0,.8)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText(e,w*(.14+i*.15),ey);});
        ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('"Fire + math = friendship!"',w*.5,h*.88);
      }},
      {dur:5,text:'The whole city celebrates their friendship!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#ffe0b2');_cCity(ctx,w,h,false);_cSun(ctx,w*.85,h*.14,h*.065,t);
        _cDragon(ctx,w*.35,h*.54,h*.26,t,false);_cRobot(ctx,w*.62,h*.56,h*.24,t,false);
        _cConfetti(ctx,w,h,t,60);
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.044}px Arial`;ctx.textAlign='center';ctx.fillText('BEST FRIENDS!!! 🐉🤖🔥',w*.5,h*.18);
      }},
      {dur:5,text:'Enemies can become best friends. THE END.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0505','#100a00');_cStars(ctx,w,h,t,80);
        _cDragon(ctx,w*.35,h*.52,h*.28,t,false);_cRobot(ctx,w*.62,h*.54,h*.26,t,false);
        _cConfetti(ctx,w,h,t,50);
        const fa=Math.min(1,(t-1)*.5);if(t>1){ctx.fillStyle=`rgba(255,255,255,${fa*.9})`;ctx.font=`bold ${h*.065}px Arial`;ctx.textAlign='center';ctx.fillText('THE END',w*.5,h*.28);}
      }},
    ]
  },
  { title:'Super Cat 2: Pizza\'s Revenge', genre:'🐱 Action Sequel', price:35, bg:'#001111', icons:'🐱⚡🍕',
    trailer:[
      {text:'😌 The city was peaceful...',dur:2000},
      {text:'🍕 Evil Pizza was BACK. From SPACE.',dur:2000},
      {text:'⚡ Only one hero can stop the cheesy menace.',dur:2500},
      {text:'🐱⚡ SUPER CAT 2: PIZZA\'S REVENGE! ⚡🐱',dur:3000},
    ],
    scenes:[
      {dur:5,text:'A year of peace. The city is happy.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#c8e8c0');_cCity(ctx,w,h,false);_cSun(ctx,w*.85,h*.14,h*.065,t);
        _cCat(ctx,w*.5,h*.56,h*.26,t,false);_cBird(ctx,w*.3,h*.22,h*.038,t);_cConfetti(ctx,w,h,t,20);
        ctx.fillStyle='rgba(0,100,0,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('ONE YEAR OF PEACE 🌸',w*.5,h*.18);
      }},
      {dur:5,text:'Warning: mysterious cheese signal from space!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#001100');_cStars(ctx,w,h,t,80);
        const la=.5+.5*Math.abs(Math.sin(t*4));ctx.fillStyle=`rgba(255,50,50,${la})`;ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('🚨 CHEESE SIGNAL DETECTED! 🚨',w*.5,h*.18);
        // signal waves
        for(let i=1;i<=4;i++){const wa=.3-.06*i;ctx.strokeStyle=`rgba(255,200,0,${wa+.1*Math.sin(t*3+i)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(w*.5,h*.5,h*(.04+i*.07),0,Math.PI*2);ctx.stroke();}
        _cPlanet(ctx,w*.5,h*.5,h*.04,'#cc8800','#aa6600',t);
      }},
      {dur:5,text:'Evil Pizza returns — now GIANT, from space!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#001100');_cStars(ctx,w,h,t,60);
        const ps=h*(.12+Math.min(t*.06,0.2));_cPizza(ctx,w*.5,h*.42,ps,t,true);
        const la=.5+.5*Math.abs(Math.sin(t*5));ctx.fillStyle=`rgba(255,0,0,${la})`;ctx.font=`bold ${h*.045}px Arial`;ctx.textAlign='center';ctx.fillText('EVIL PIZZA RETURNS! 🍕👿',w*.5,h*.82);
      }},
      {dur:5,text:'Super Cat gets the call!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');_cCat(ctx,w*.5,h*.54,h*.28,t,false);
        const al=Math.abs(Math.sin(t*6));ctx.fillStyle=`rgba(255,0,0,${al*.3})`;ctx.fillRect(0,0,w,h);
        ctx.fillStyle='rgba(255,50,50,.9)';ctx.font=`bold ${h*.05}px Arial`;ctx.textAlign='center';ctx.fillText('🚨 CAT SIGNAL! 🚨',w*.5,h*.16);
        if(t>2){ctx.fillStyle='rgba(255,255,255,.8)';ctx.font=`${h*.03}px Arial`;ctx.fillText('"Not pizza again... Let\'s go."',w*.5,h*.86);}
      }},
      {dur:5,text:'Training montage! Super Cat gets stronger!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        _cCat(ctx,w*.5,h*.54,h*.28,t,true);
        _cLines(ctx,w*.5,h*.54,h*.3*Math.min(1,t*.3),16,'rgba(255,255,0,.4)');
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('⚡ TRAINING MONTAGE! ⚡',w*.5,h*.18);
        const power=Math.min(100,t*22|0);ctx.fillStyle='rgba(255,220,0,.8)';ctx.font=`${h*.028}px Arial`;ctx.fillText('POWER: ' + power + '%',w*.5,h*.88);
      }},
      {dur:5,text:'Evil Pizza summons a PIZZA ARMY!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a0000','#0a0000');
        for(let i=0;i<Math.min(6,t*1.5|0);i++){_cPizza(ctx,w*(.1+i*.16),h*(.5+i%2*.12),h*.12,t+i,true);}
        const la=.5+.5*Math.abs(Math.sin(t*4));ctx.fillStyle=`rgba(255,50,0,${la})`;ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('PIZZA ARMY RISES! 🍕🍕🍕',w*.5,h*.18);
      }},
      {dur:5,text:'Super Cat fights the pizza slices!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0500','#050000');
        _cCat(ctx,w*.3,h*.56,h*.26,t,true);
        for(let i=0;i<3;i++){_cPizza(ctx,w*(.55+i*.15),h*(.5+i*.08),h*.1,t+i,true);}
        if(t>1.5){const la=.6+.3*Math.abs(Math.sin(t*10));ctx.strokeStyle=`rgba(255,255,50,${la})`;ctx.lineWidth=h*.018;ctx.beginPath();ctx.moveTo(w*.44,h*.52);ctx.lineTo(w*.58,h*.5);ctx.stroke();}
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('LIGHTNING PAWS ACTIVATED!',w*.5,h*.88);
      }},
      {dur:5,text:'Dodging giant cheese blasts!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a0a00','#0a0500');
        _cPizza(ctx,w*.68,h*.5,h*.2,t,true);_cCat(ctx,w*.28+Math.sin(t*4)*h*.03,h*.52+Math.cos(t*3)*h*.03,h*.24,t,true);
        // cheese blobs flying
        for(let i=0;i<Math.min(4,t|0);i++){const bx=(w*.58-t*70+i*90)%(w*.8)+w*.1,by=h*(.4+i*.05);
          ctx.fillStyle='rgba(255,230,50,.8)';ctx.beginPath();ctx.arc(bx,by,h*.028,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle='rgba(255,150,0,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('DODGE THE CHEESE!!!',w*.5,h*.18);
      }},
      {dur:5,text:'Super Cat uses toppings as weapons!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0500','#050000');_cCat(ctx,w*.3,h*.56,h*.26,t,true);
        ['🌶️','🧅','🍄','🫑'].forEach((e,i)=>{const ex=w*(.5+t*.12+i*.12),ey=h*(.38+i*.08);ctx.font=`${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText(e,ex,ey);});
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('SPICY TOPPING ATTACK!!! 🌶️',w*.5,h*.18);
      }},
      {dur:5,text:'Evil Pizza retreats to the sky!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#001100');_cStars(ctx,w,h,t,80);_cCity(ctx,w,h,true);
        const py=h*(.5-t*.12);_cPizza(ctx,w*.6,py,h*.2,t,true);
        _cCat(ctx,w*.3,h*.6,h*.24,t,true);
        ctx.fillStyle='rgba(255,100,0,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('"You can\'t reach me up here!"',w*.6,h*.88);
      }},
      {dur:5,text:'Super Cat flies using MAXIMUM LIGHTNING!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#001100');_cStars(ctx,w,h,t,80);
        const cy=h*(.65-t*.11);_cCat(ctx,w*.35,cy,h*.26,t,true);
        // massive lightning
        const la=.6+.4*Math.abs(Math.sin(t*8));ctx.strokeStyle=`rgba(255,255,0,${la})`;ctx.lineWidth=h*.025;
        ctx.beginPath();ctx.moveTo(w*.35,cy+h*.1);ctx.lineTo(w*.3,cy+h*.22);ctx.lineTo(w*.42,cy+h*.22);ctx.lineTo(w*.35,cy+h*.36);ctx.stroke();
        ctx.fillStyle='rgba(255,255,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('⚡ MAXIMUM POWER! ⚡',w*.5,h*.88);
      }},
      {dur:5,text:'FINAL STRIKE! Lightning vs Evil Pizza!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#001100');_cStars(ctx,w,h,t,50);
        _cCat(ctx,w*.3,h*.5,h*.26,t,true);_cPizza(ctx,w*.7,h*.5,h*.2,t,true);
        const la=.6+.4*Math.abs(Math.sin(t*10));ctx.strokeStyle=`rgba(255,255,0,${la})`;ctx.lineWidth=h*.025;
        ctx.beginPath();ctx.moveTo(w*.44,h*.5);ctx.lineTo(w*.58,h*.5);ctx.stroke();
        const ep=Math.min(1,(t-2)*.5);if(t>2){_cExplo(ctx,w*.64,h*.5,h*.22,ep);}
        ctx.fillStyle='rgba(255,255,0,.9)';ctx.font=`bold ${h*.048}px Arial`;ctx.textAlign='center';ctx.fillText('⚡ FINAL STRIKE! ⚡',w*.5,h*.18);
      }},
      {dur:5,text:'Evil Pizza is DEFEATED! For real this time!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#c8e8c0');_cCity(ctx,w,h,false);_cSun(ctx,w*.85,h*.14,h*.065,t);
        _cCat(ctx,w*.5,h*.54,h*.28,t,false);_cConfetti(ctx,w,h,t,60);
        ctx.fillStyle='rgba(255,80,0,.9)';ctx.font=`bold ${h*.044}px Arial`;ctx.textAlign='center';ctx.fillText('EVIL PIZZA DEFEATED!!! 🏆',w*.5,h*.18);
        if(t>2){ctx.fillStyle='rgba(0,100,0,.8)';ctx.font=`${h*.026}px Arial`;ctx.fillText('"(This time DEFINITELY for real.)"',w*.5,h*.88);}
      }},
      {dur:5,text:'City parade for Super Cat! Best day ever. THE END.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#ffe0b2');_cCity(ctx,w,h,false);_cSun(ctx,w*.85,h*.14,h*.065,t);
        _cCat(ctx,w*.5,h*.52,h*.3,t,false);_cConfetti(ctx,w,h,t,65);
        const fa=Math.min(1,(t-1)*.5);if(t>1){ctx.fillStyle=`rgba(255,80,0,${fa*.9})`;ctx.font=`bold ${h*.065}px Arial`;ctx.textAlign='center';ctx.fillText('THE END',w*.5,h*.28);}
      }},
    ]
  },
  { title:'The Explox Games', genre:'🏆 Sports Epic', price:20, bg:'#1a1a00', icons:'🏆🎮💥',
    trailer:[
      {text:'🎮 The greatest tournament in the city...',dur:2000},
      {text:'🏆 Every character competes for glory!',dur:2000},
      {text:'💥 Only ONE champion will stand!',dur:2000},
      {text:'🏆🎮 THE EXPLOX GAMES! 🎮🏆',dur:3000},
    ],
    scenes:[
      {dur:5,text:'Welcome to the EXPLOX GAMES! The whole city watches!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a1a00','#2a2a00');_cCity(ctx,w,h,false);_cSun(ctx,w*.85,h*.14,h*.065,t);
        _cConfetti(ctx,w,h,t,50);_cLines(ctx,w*.5,h*.3,h*.35,20,'rgba(255,200,0,.3)');
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.048}px Arial`;ctx.textAlign='center';ctx.fillText('🏆 THE EXPLOX GAMES! 🏆',w*.5,h*.22);
      }},
      {dur:5,text:'Meet the competitors! All 6 heroes!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        const show=Math.min(6,t*1.5|0);
        if(show>0)_cRobot(ctx,w*.1,h*.58,h*.16,t,false);
        if(show>1)_cDino(ctx,w*.24,h*.6,h*.16,t,false);
        if(show>2)_cCat(ctx,w*.38,h*.58,h*.16,t,false);
        if(show>3)_cGrandma(ctx,w*.52,h*.58,h*.16,t,false);
        if(show>4)_cNinja(ctx,w*.66,h*.58,h*.16,t,false);
        if(show>5)_cAlien(ctx,w*.8,h*.58,h*.16,t,false);
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('THE COMPETITORS!',w*.5,h*.18);
      }},
      {dur:5,text:'Event 1: The Sprint! Everyone runs!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#c8e8c0');ctx.fillStyle='#5a9e3c';ctx.fillRect(0,h*.72,w,h*.28);
        // track lanes
        for(let i=0;i<4;i++){ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,h*(.72+i*.07));ctx.lineTo(w,h*(.72+i*.07));ctx.stroke();}
        const spd=t*.09;_cRobot(ctx,w*(spd+.05),h*.65,h*.14,t,true);_cCat(ctx,w*(spd+.09),h*.72,h*.13,t,true);_cNinja(ctx,w*(spd+.07),h*.78,h*.13,t,true);
        // finish line
        ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(w*.88,h*.6,h*.01,h*.4);
        ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('EVENT 1: THE SPRINT!',w*.5,h*.18);
      }},
      {dur:5,text:'Event 2: The Big Jump!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#87ceeb','#ffe0b2');_cSun(ctx,w*.85,h*.14,h*.065,t);ctx.fillStyle='#5a9e3c';ctx.fillRect(0,h*.75,w,h*.25);
        // jumping arc
        const jt=(t%2)/2,jy=h*(.75-Math.sin(jt*Math.PI)*h*.004);
        _cGrandma(ctx,w*(.15+t*.1),jy,h*.18,t,false);
        ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('EVENT 2: THE BIG JUMP!',w*.5,h*.18);
        if(t>3){ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`bold ${h*.032}px Arial`;ctx.fillText('GRANDMA IS WINNING?!',w*.5,h*.88);}
      }},
      {dur:5,text:'Event 3: Battle Brawl! Anything goes!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0a14','#14142a');
        _cRobot(ctx,w*.28,h*.56,h*.22,t,true);_cDino(ctx,w*.68,h*.56,h*.22,t,true);
        const ep=Math.min(1,t*.35);_cExplo(ctx,w*.5,h*.54,h*.14,ep);
        const la=.5+.5*Math.abs(Math.sin(t*8));ctx.fillStyle=`rgba(255,220,0,${la})`;ctx.font=`bold ${h*.044}px Arial`;ctx.textAlign='center';ctx.fillText('💥 BATTLE BRAWL! 💥',w*.5,h*.18);
      }},
      {dur:5,text:'Event 4: The Brain Puzzle!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        // big puzzle grid
        for(let i=0;i<4;i++)for(let j=0;j<4;j++){const solved=(i*4+j)<Math.min(16,t*3.5|0);ctx.fillStyle=solved?'#22aa22':'#1a1a2e';ctx.fillRect(w*(.2+j*.15),h*(.28+i*.12),w*.14,h*.1);ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.strokeRect(w*(.2+j*.15),h*(.28+i*.12),w*.14,h*.1);}
        _cAlien(ctx,w*.5,h*.68,h*.18,t,false);
        ctx.fillStyle='rgba(100,255,100,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('EVENT 4: BRAIN PUZZLE!',w*.5,h*.18);
      }},
      {dur:5,text:'SHOCK! Grandma is leading the scoreboard!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');_cGrandma(ctx,w*.5,h*.52,h*.28,t,false);_cConfetti(ctx,w,h,t,40);
        // scoreboard
        ctx.fillStyle='#1a1a2e';ctx.fillRect(w*.05,h*.15,w*.9,h*.3);
        [['Grandma 👵','72'],['Cat 🐱','68'],['Ninja 🥷','65'],['Robot 🤖','62']].forEach(([n,s],i)=>{
          ctx.fillStyle=i===0?'#ffcc00':'#aabbcc';ctx.font=`bold ${h*.032}px Arial`;ctx.textAlign='left';ctx.fillText(n,w*.1,h*(.25+i*.07));ctx.textAlign='right';ctx.fillText(s,w*.9,h*(.25+i*.07));});
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('GRANDMA LEADS!!! 😱',w*.5,h*.56);
      }},
      {dur:5,text:'Event 5: Rocket Race through the city!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#001133');_cStars(ctx,w,h,t,60);_cCity(ctx,w,h,true);
        const rx=w*(.08+t*.1);_cRocket(ctx,rx,h*.42,h*.18,t);_cRocket(ctx,rx-w*.12,h*.52,h*.16,t+1);_cRocket(ctx,rx-w*.22,h*.62,h*.14,t+2);
        ctx.fillStyle='rgba(255,150,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('EVENT 5: ROCKET RACE!',w*.5,h*.18);
      }},
      {dur:5,text:'FINAL EVENT: Dragon Taming!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a0500','#2a0a00');_cDragon(ctx,w*.6,h*.5,h*.34,t,true);
        const show=Math.min(4,t|0);
        [[.15,.6],[.3,.64],[.18,.58],[.25,.62]].slice(0,show).forEach(([cx,cy])=>{ctx.font=`${h*.032}px Arial`;ctx.textAlign='center';ctx.fillText('😨',w*cx,h*cy);});
        ctx.fillStyle='rgba(255,100,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('FINAL EVENT: DRAGON TAMING!',w*.5,h*.18);
      }},
      {dur:5,text:'The Ninja tames the dragon with CALM!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a0500','#2a0a00');_cDragon(ctx,w*.62,h*.5,h*.32,t,false);
        _cNinja(ctx,w*.32,h*.56,h*.24,t,false);
        // calm glow
        const cg=ctx.createRadialGradient(w*.32,h*.58,0,w*.32,h*.58,h*.28);cg.addColorStop(0,'rgba(100,200,255,.2)');cg.addColorStop(1,'rgba(100,200,255,0)');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(w*.32,h*.58,h*.28,0,Math.PI*2);ctx.fill();
        if(t>2){ctx.fillStyle='rgba(255,200,0,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('"Inner peace. And snacks."',w*.5,h*.88);}
      }},
      {dur:5,text:'PHOTO FINISH! Ninja wins by 0.001 seconds!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a0a14','#14142a');_cNinja(ctx,w*.5,h*.54,h*.28,t,false);
        _cConfetti(ctx,w,h,t,60);_cLines(ctx,w*.5,h*.54,h*.34,20,'rgba(255,200,0,.4)');
        const la=.5+.5*Math.abs(Math.sin(t*6));ctx.fillStyle=`rgba(255,255,0,${la})`;ctx.font=`bold ${h*.052}px Arial`;ctx.textAlign='center';ctx.fillText('🥷 CHAMPION! 🥷',w*.5,h*.18);
        if(t>2){ctx.fillStyle='rgba(255,200,0,.8)';ctx.font=`${h*.024}px Arial`;ctx.fillText('(Grandma came second. She\'s fine with it.)',w*.5,h*.88);}
      }},
      {dur:5,text:'Medal ceremony! All heroes on the podium!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        // podium
        [h*.16,h*.2,h*.24].forEach((ph,i)=>{ctx.fillStyle=['#ffd700','#c0c0c0','#cd7f32'][i];ctx.fillRect(w*(.28+i*.17),h*.72-ph,w*.16,ph);ctx.fillStyle='#fff';ctx.font=`bold ${h*.032}px Arial`;ctx.textAlign='center';ctx.fillText(['1st','2nd','3rd'][i],w*(.36+i*.17),h*.74);});
        _cNinja(ctx,w*.36,h*.62,h*.16,t,false);_cGrandma(ctx,w*.53,h*.64,h*.15,t,false);_cCat(ctx,w*.7,h*.66,h*.14,t,false);
        _cConfetti(ctx,w,h,t,55);
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('🏆 MEDAL CEREMONY! 🏆',w*.5,h*.18);
      }},
      {dur:5,text:'Fireworks light up the city!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#001133');_cCity(ctx,w,h,true);_cStars(ctx,w,h,t,40);
        // fireworks
        const fw=[[w*.2,h*.3],[w*.5,h*.2],[w*.8,h*.28],[w*.35,h*.35],[w*.65,h*.22]];
        fw.forEach(([fx,fy],i)=>{const fp=((t*1.5+i*.6)%2.5)/2.5;if(fp<0.5){_cLines(ctx,fx,fy,h*(.08+fp*.25),20,`rgba(255,${100+i*30|0},0,${1-fp*2})`);}});
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('🎆 FIREWORKS!!! 🎆',w*.5,h*.88);
      }},
      {dur:5,text:'Every hero is a champion today.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        _cRobot(ctx,w*.1,h*.58,h*.15,t,false);_cDino(ctx,w*.24,h*.6,h*.15,t,false);_cCat(ctx,w*.38,h*.58,h*.15,t,false);_cGrandma(ctx,w*.52,h*.58,h*.15,t,false);_cNinja(ctx,w*.66,h*.58,h*.15,t,false);_cAlien(ctx,w*.8,h*.58,h*.15,t,false);
        _cConfetti(ctx,w,h,t,60);
        ctx.fillStyle='rgba(255,220,0,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('EVERY HERO WINS TODAY! 🏅',w*.5,h*.18);
      }},
      {dur:5,text:'See you at the next Explox Games. THE END.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a1a00','#2a2a00');_cCity(ctx,w,h,false);_cSun(ctx,w*.85,h*.14,h*.065,t);
        _cConfetti(ctx,w,h,t,50);_cLines(ctx,w*.5,h*.4,h*.3,16,'rgba(255,200,0,.3)');
        const fa=Math.min(1,(t-1)*.5);if(t>1){ctx.fillStyle=`rgba(255,255,255,${fa*.9})`;ctx.font=`bold ${h*.065}px Arial`;ctx.textAlign='center';ctx.fillText('THE END',w*.5,h*.28);}
      }},
    ]
  },
  { title:'Time Travel Trouble', genre:'⏰ Sci-Fi Adventure', price:40, bg:'#0a001a', icons:'⏰🚀🔮',
    trailer:[
      {text:'⏰ One scientist. One broken time machine.',dur:2500},
      {text:'🦕 DINOSAURS. ⚓ PIRATES. 🥷 NINJAS.',dur:2000},
      {text:'🚀 And one very confused Grandma.',dur:2500},
      {text:'⏰🚀 TIME TRAVEL TROUBLE! 🚀⏰',dur:3000},
    ],
    scenes:[
      {dur:5,text:'Professor Zip\'s lab: home of the time machine!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        // lab equipment
        ctx.fillStyle='#223344';for(let i=0;i<5;i++)ctx.fillRect(w*(.08+i*.18),h*.48,w*.14,h*.4);
        ctx.fillStyle='#334455';ctx.fillRect(w*.3,h*.3,w*.4,h*.35);ctx.strokeStyle='#00ccff';ctx.lineWidth=2;ctx.strokeRect(w*.3,h*.3,w*.4,h*.35);
        // time machine glow
        const gl=.3+.2*Math.sin(t*3);ctx.fillStyle=`rgba(150,0,255,${gl})`;ctx.beginPath();ctx.arc(w*.5,h*.47,h*.1,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(200,150,255,.9)';ctx.font=`bold ${h*.038}px Arial`;ctx.textAlign='center';ctx.fillText('PROFESSOR ZIP\'S LAB',w*.5,h*.18);
      }},
      {dur:5,text:'Time machine sparks — something is wrong!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        ctx.fillStyle='#334455';ctx.fillRect(w*.3,h*.3,w*.4,h*.35);
        // sparks
        for(let i=0;i<Math.min(15,t*5|0);i++){const sx=w*.5+(Math.sin(i*137)*.5)*h*.28,sy=h*.47+(Math.cos(i*89)*.5)*h*.2;
          const sa=.6+.4*Math.sin(t*8+i);ctx.fillStyle=`rgba(150,50,255,${sa})`;ctx.beginPath();ctx.arc(sx,sy,h*.007,0,Math.PI*2);ctx.fill();}
        const la=.5+.5*Math.abs(Math.sin(t*6));ctx.fillStyle=`rgba(255,50,255,${la})`;ctx.font=`bold ${h*.046}px Arial`;ctx.textAlign='center';ctx.fillText('⚡ MALFUNCTION! ⚡',w*.5,h*.18);
      }},
      {dur:5,text:'WHOOPS! Dinosaur era!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a4a1a','#0a2a0a');
        for(let i=0;i<6;i++){const tx=w*(.06+i*.16),th=h*(.3+i%3*.14);ctx.fillStyle='#1a5a1a';ctx.fillRect(tx-h*.024,h*.55,h*.048,th);ctx.fillStyle='#2a8a2a';ctx.beginPath();ctx.arc(tx,h*.55-th*.5,h*.1,0,Math.PI*2);ctx.fill();}
        _cDino(ctx,w*.7,h*.55,h*.3,t,true);
        // scientist running
        ctx.fillStyle='#f5c89a';ctx.beginPath();ctx.arc(w*.22,h*.56,h*.05,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4488ff';ctx.fillRect(w*.18,h*.6,h*.09,h*.18);
        ctx.fillStyle='rgba(100,200,100,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('DINOSAUR ERA! RUN!!!',w*.5,h*.18);
      }},
      {dur:5,text:'Mash the buttons! Next stop: pirate era!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000033','#001155');_cStars(ctx,w,h,t,40);
        // portal swirl
        const pg=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,h*.3);pg.addColorStop(0,'rgba(150,0,255,.6)');pg.addColorStop(.5,'rgba(100,0,200,.3)');pg.addColorStop(1,'rgba(50,0,100,0)');
        ctx.fillStyle=pg;ctx.beginPath();ctx.arc(w*.5,h*.5,h*.3,0,Math.PI*2);ctx.fill();
        for(let i=0;i<12;i++){const pa=i/12*Math.PI*2+t*3,pr=h*(.05+.2*((t*.3)%1));ctx.fillStyle=`rgba(200,100,255,${.4+.4*Math.sin(t*4+i)})`;ctx.beginPath();ctx.arc(w*.5+Math.cos(pa)*pr,h*.5+Math.sin(pa)*pr,h*.012,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle='rgba(255,255,255,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('PORTAL ACTIVATED!',w*.5,h*.88);
      }},
      {dur:5,text:'Pirate ship! Arrr, there be time travelers!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001133','#003366');
        // ocean waves
        for(let i=0;i<8;i++){ctx.fillStyle=`rgba(0,80,180,${.4+.2*(i%2)})`;const wx=w*(i*.14)+Math.sin(t+i)*h*.02;ctx.beginPath();ctx.ellipse(wx,h*.78+i*2,h*.1,h*.04,0,0,Math.PI*2);ctx.fill();}
        // ship hull
        ctx.fillStyle='#8b5a2b';ctx.beginPath();ctx.moveTo(w*.18,h*.65);ctx.lineTo(w*.82,h*.65);ctx.lineTo(w*.75,h*.8);ctx.lineTo(w*.25,h*.8);ctx.closePath();ctx.fill();
        ctx.fillStyle='#8b5a2b';ctx.fillRect(w*.48,h*.3,h*.018,h*.36);
        ctx.fillStyle='#cc1111';ctx.beginPath();ctx.moveTo(w*.5,h*.3);ctx.lineTo(w*.5+h*.18,h*.48);ctx.lineTo(w*.5,h*.48);ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(255,200,100,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('PIRATE ERA! ⚓',w*.5,h*.18);
      }},
      {dur:5,text:'Pirates want to keep the time machine!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001133','#003366');
        ctx.fillStyle='#8b5a2b';ctx.fillRect(w*.2,h*.5,w*.6,h*.35);
        // pirates (simple)
        for(let i=0;i<3;i++){ctx.fillStyle='#ff9966';ctx.beginPath();ctx.arc(w*(.28+i*.22),h*.54,h*.04,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(w*(.28+i*.22),h*.5,h*.05,Math.PI,Math.PI*2);ctx.fill();}
        ctx.fillStyle='rgba(255,200,100,.9)';ctx.font=`bold ${h*.036}px Arial`;ctx.textAlign='center';ctx.fillText('"That glowy box is OURS now! Arrr!"',w*.5,h*.18);
      }},
      {dur:5,text:'Button mash! Now in the NINJA ERA!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a1a22','#1a3a44');
        ctx.fillStyle='#2a4a5a';ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(w*.5,h*.18);ctx.lineTo(w,h);ctx.closePath();ctx.fill();
        for(let i=0;i<Math.min(5,t*1.2|0);i++){_cNinja(ctx,w*(.1+i*.2),h*.58,h*.18,t+i,false);}
        const la=.5+.5*Math.abs(Math.sin(t*6));ctx.fillStyle=`rgba(255,80,0,${la})`;ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('NINJA ERA!!! 🥷',w*.5,h*.18);
      }},
      {dur:5,text:'Ninjas want to learn about the future!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#0a1a22','#1a3a44');
        ctx.fillStyle='#2a4a5a';ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(w*.5,h*.2);ctx.lineTo(w,h);ctx.closePath();ctx.fill();
        _cNinja(ctx,w*.35,h*.56,h*.24,t,false);_cNinja(ctx,w*.6,h*.56,h*.22,t+1,false);
        // question marks
        ['?','?','?'].forEach((q,i)=>{ctx.fillStyle='rgba(255,200,0,.8)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText(q,w*(.3+i*.2),h*.3);});
        ctx.fillStyle='rgba(255,200,150,.8)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('"Does the future have sushi?"',w*.5,h*.88);
      }},
      {dur:5,text:'Into the future city!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001133','#002266');_cCity(ctx,w,h,true);_cStars(ctx,w,h,t,80);
        _cRobot(ctx,w*.5,h*.56,h*.26,t,false);
        // flying cars
        for(let i=0;i<3;i++){const cx=(w*(.8-i*.3)-t*80+w*1.4)%(w*1.4)-w*.2;_cCar(ctx,cx,h*(.22+i*.1),h*.12,t+i,['#00aaff','#ff2200','#22cc22'][i]);}
        ctx.fillStyle='rgba(0,200,255,.9)';ctx.font=`bold ${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('THE FUTURE!',w*.5,h*.18);
      }},
      {dur:5,text:'Future robots recognize the time machine!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#001133','#002266');
        for(let i=0;i<3;i++){_cRobot(ctx,w*(.25+i*.25),h*.56,h*.22,t+i,false);}
        const gl=.3+.2*Math.sin(t*3);
        for(let i=0;i<3;i++){ctx.fillStyle=`rgba(0,200,255,${gl})`;ctx.beginPath();ctx.arc(w*(.25+i*.25),h*.3,h*.06,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle='rgba(0,200,255,.9)';ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';ctx.fillText('"ERROR: TIME PARADOX DETECTED."',w*.5,h*.88);
      }},
      {dur:5,text:'Oops — ended up with ancient grandmas!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#a67c52','#8b6540');
        ctx.fillStyle='#6b4c2a';ctx.fillRect(0,h*.72,w,h*.28);
        _cGrandma(ctx,w*.3,h*.56,h*.24,t,false);_cGrandma(ctx,w*.55,h*.56,h*.22,t+1,false);
        ctx.font=`${h*.04}px Arial`;ctx.textAlign='center';ctx.fillText('🏺',w*.72,h*.6);ctx.fillText('🏺',w*.14,h*.58);
        ctx.fillStyle='rgba(200,150,80,.9)';ctx.font=`bold ${h*.036}px Arial`;ctx.textAlign='center';ctx.fillText('ANCIENT GRANDMA ERA! 👵',w*.5,h*.18);
        if(t>2){ctx.fillStyle='rgba(150,100,60,.8)';ctx.font=`${h*.026}px Arial`;ctx.fillText('"Dear, would you like some ancient cookies?"',w*.5,h*.88);}
      }},
      {dur:5,text:'Total chaos through time!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#0a0011');_cStars(ctx,w,h,t,60);
        // time streams
        const cols=['#ff2200','#00aaff','#22cc22','#ffcc00','#cc00cc'];
        for(let i=0;i<5;i++){const sa=.3+.2*Math.sin(t*3+i);ctx.strokeStyle=`rgba(${['255,50,0','0,150,255','50,200,50','255,200,0','200,0,200'][i]},${sa})`;ctx.lineWidth=h*.012;ctx.beginPath();ctx.moveTo(0,h*(i*.18+.12));for(let j=0;j<20;j++){ctx.lineTo(w*(j/19),h*(i*.18+.12+Math.sin(t*3+j*.5+i)*h*.0005));}ctx.stroke();}
        ctx.fillStyle='rgba(255,200,255,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('TIME CHAOS!!! 😵‍💫',w*.5,h*.88);
      }},
      {dur:5,text:'Found the repair manual! (In the dinosaur era.)',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#1a4a1a','#0a2a0a');
        // book
        ctx.fillStyle='#8b0000';ctx.fillRect(w*.3,h*.3,w*.4,h*.45);ctx.fillStyle='#aa0000';ctx.fillRect(w*.32,h*.32,w*.15,h*.41);
        ctx.fillStyle='#fffff0';ctx.font=`bold ${h*.022}px Arial`;ctx.textAlign='center';ctx.fillText('TIME MACHINE',w*.5,h*.45);ctx.fillText('REPAIR MANUAL',w*.5,h*.52);ctx.fillText('(Vol. 3)',w*.5,h*.59);
        _cDino(ctx,w*.78,h*.56,h*.24,t,false);
        ctx.fillStyle='rgba(100,200,100,.9)';ctx.font=`bold ${h*.036}px Arial`;ctx.textAlign='center';ctx.fillText('MANUAL FOUND! 📖',w*.5,h*.18);
        if(t>2){ctx.fillStyle='rgba(80,160,80,.8)';ctx.font=`${h*.026}px Arial`;ctx.fillText('(The dino was sitting on it.)',w*.5,h*.88);}
      }},
      {dur:5,text:'Fixed! Back to the present! Never again!',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#000011','#0a001a');_cStars(ctx,w,h,t,80);
        // portal
        const pg=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,h*(.15+t*.04));pg.addColorStop(0,'rgba(255,255,255,.8)');pg.addColorStop(.3,'rgba(150,0,255,.5)');pg.addColorStop(1,'rgba(50,0,100,0)');
        ctx.fillStyle=pg;ctx.beginPath();ctx.arc(w*.5,h*.5,h*(.15+t*.04),0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(200,150,255,.9)';ctx.font=`bold ${h*.042}px Arial`;ctx.textAlign='center';ctx.fillText('GOING HOME!',w*.5,h*.18);
        if(t>2){ctx.fillStyle='rgba(255,255,255,.8)';ctx.font=`${h*.026}px Arial`;ctx.fillText('"Never. EVER. Again."',w*.5,h*.88);}
      }},
      {dur:5,text:'Safe at home! The time machine is now a cupboard. THE END.',draw(ctx,w,h,t){
        _cBg(ctx,w,h,'#050510','#0a0a20');
        // lab again, but time machine is a cupboard
        ctx.fillStyle='#334455';ctx.fillRect(w*.3,h*.3,w*.4,h*.45);ctx.strokeStyle='#8b5a2b';ctx.lineWidth=3;ctx.strokeRect(w*.3,h*.3,w*.4,h*.45);
        // cups and dishes on shelves
        for(let i=0;i<3;i++){ctx.fillStyle='rgba(255,255,255,.3)';ctx.fillRect(w*.32,h*(.38+i*.12),w*.36,h*.012);}
        ctx.font=`${h*.028}px Arial`;ctx.textAlign='center';['☕','🍰','🏺'].forEach((e,i)=>ctx.fillText(e,w*(.4+i*.12),h*(.44+0)));
        _cConfetti(ctx,w,h,t,40);
        const fa=Math.min(1,(t-1)*.5);if(t>1){ctx.fillStyle=`rgba(255,255,255,${fa*.9})`;ctx.font=`bold ${h*.065}px Arial`;ctx.textAlign='center';ctx.fillText('THE END',w*.5,h*.28);}
        ctx.fillStyle='rgba(200,150,255,.7)';ctx.font=`${h*.022}px Arial`;ctx.fillText('(Great cupboard, though.)',w*.5,h*.36);
      }},
    ]
  },
];

// ─── EXPAND EACH MOVIE FROM 15 → 60 SCENES ───────────────────────────────────
// Extra story texts for scenes 16-60 of each movie (45 per movie)
const _MXTRA=[
  // 0: Robot Dinosaurs From Space 3
  ['The robots regroup after the first attack...','Captain Robo-Rex scans the horizon.','A warning signal from the mothership!',
   'Dino warriors prepare their defenses.','The robot fleet enters warp drive.','Deep in space, a secret weapon awaits.',
   'Robo-Rex discovers an ancient dinosaur temple.','The temple glows with strange energy!','WARNING: SYSTEM OVERLOAD!',
   'Dino King sends his best warriors.','The robots deploy their stealth drones.','A meteor shower hits the battlefield!',
   'Robo-Rex takes cover behind a crater.','The dinos call for backup!','Robot reinforcements arrive from Sector 7.',
   'ENERGY SHIELDS at 40% and dropping!','Both sides catch their breath...','Robo-Rex makes a bold plan.',
   'The ancient temple begins to open!','A mysterious signal from inside...','Dino King enters the temple alone.',
   'Robo-Rex follows silently.','Inside: a power crystal the size of a ship!','Both leaders reach for the crystal...',
   'A massive EARTHQUAKE shakes the planet!','The temple is collapsing!','Robo-Rex saves Dino King from a falling rock!',
   'Dino King is surprised... a robot with a heart?','They escape together!','Outside, the battle still rages.',
   'Robo-Rex holds up the crystal — it radiates peace.','The armies stop fighting.','Stunned silence on both sides.',
   'Dino King speaks: "Enough!"','Robo-Rex: "We fight the same enemy — loneliness."','Both armies look at each other.',
   'A single robot offers a dino its hand.','The dino takes it.','Slowly, enemies become allies.',
   'The crystal turns GOLD — peace achieved!','Together they rebuild the planet.','A new space city rises!',
   'Half robot, half dino — one civilization.','The galaxy watches in awe.','Credits roll under the stars...'],
  // 1: Ninja Grandma Returns
  ['Grandma waters her prize-winning roses.','The mailman delivers a mysterious letter.','The letter: "Your village needs you AGAIN."',
   'Grandma sighs, puts down her teacup.','She opens her secret ninja closet.','The ninja gear still fits perfectly.',
   'Village Elder: "The Shadow Clan has returned!"','Grandma: "Not on my watch."','She begins her warm-up stretches.',
   'Training montage: punching bags, cartwheels, backflips!','Grandma can still do a perfect split!','She sharpens her rolling pin.',
   'The Shadow Clan scouts the village at night.','Three ninjas sneak through the market.','Grandma spots them from her window.',
   'She leaps from the second floor — gracefully!','Shadow Ninja #1 never saw it coming.','Shadow Ninja #2 runs away screaming.',
   'Shadow Ninja #3 tries to negotiate.','Grandma offers him cookies. He accepts.','Village safe — for now.',
   'The Shadow Clan boss is watching from the hills.','He sends ten more ninjas.','Grandma just finished her tea.',
   '"Perfect timing." She sets down her cup.','The ninjas surround the market square.','Grandma cartwheels into the center!',
   'A rolling pin flies through the air!','Two ninjas down!','She uses her knitting needles as weapons!',
   'The market erupts in chaos!','Grandma is EVERYWHERE at once.','The boss ninja is speechless.',
   'She lands in front of him. Eye to eye.','He pulls out his greatest weapon.','A second rolling pin?!',
   'Her old sensei\'s! He was her student!','She trained him 40 years ago.','He bows deeply. "I remember now."',
   '"Then remember THIS!" — she sweeps his legs!','He laughs as he falls. "Still the best."','Peace... for real this time.',
   'The village throws a party. Grandma dances.','Best. Tuesday. Ever.','She\'s already back in bed by 9pm.'],
  // 2: Super Cat vs Evil Pizza
  ['A peaceful day in Tabby City...','Suddenly: CHEESE ALERT!','The Pizza Signal lights up the sky!',
   'Super Cat leaps from the rooftop.','Meow means BUSINESS.','Evil Pizza has taken the cheese district hostage!',
   'First obstacle: the Pepperoni Guards.','Super Cat uses her Laser Paw!','Pepperonis scatter everywhere.',
   'Citizens cheer: "Super Cat! Super Cat!"','Evil Pizza watches from his volcano lair.','He activates the Sauce Cannon.',
   'A wall of tomato sauce blocks the path!','Super Cat surfs it on a pizza box!','Citizens throw tuna as encouragement.',
   'The Cheese Mines are almost empty!','Evil Pizza is draining them for his army.','Super Cat reaches the mine entrance.',
   'Inside: an army of evil calzones!','Super Cat uses Clone Whiskers power!','Suddenly there are EIGHT Super Cats!',
   'The calzone army is overwhelmed!','Evil Pizza is furious!','He grows to giant size!',
   'Giant Evil Pizza vs Super Cat — round one!','His pepperoni fists swing wide!','Super Cat dodges every slice.',
   'She finds his weakness: the anchovies!','Evil Pizza HATES anchovies.','She calls in the anchovy airdrop.',
   'Anchovy rain falls from the sky!','Evil Pizza melts in disgust!','He shrinks back to normal size.',
   'Cornered and defeated, Evil Pizza weeps.','Super Cat shows mercy. "Use your powers for good."','He agrees. Reluctantly.',
   '"The best pizza," says Super Cat.','Evil Pizza opens a pizza shop.','The city is saved AND has great pizza.',
   'Super Cat gives five stars. ⭐⭐⭐⭐⭐','Purring loudly. Another case closed.','The Pizza Signal turns into a PIZZA MENU.',
   'Meow.','Meanwhile, the calzones got jobs at the bakery.'],
  // 3: The Mystery of the Missing S.I.P.
  ['Detective Fox arrives at the bank at dawn.','The vault is open. The S.I.P. is gone.','Not a single trace.',
   'Detective Fox adjusts their magnifying glass.','Clue 1: a single gold coin by the door.','Clue 2: muddy footprints — size 14.',
   'Clue 3: the smell of fresh baguettes.','Detective Fox narrows their eyes.','Three suspects: the Baker, the Banker, the Baron.',
   'The Baker denies everything — nervously.','The Banker seems too calm.','The Baron has mud on his boots.',
   'Detective Fox tails the Baron all day.','He visits the bakery. Suspicious!','He buys twelve croissants. Also suspicious.',
   'Night falls on the city. A new clue!','A trail of golden crumbs leads to the docks.','Detective Fox follows silently.',
   'At the docks: a boat loaded with crates!','The crates are labeled "FLOUR." Very suspicious.','One crate rattles.',
   'Inside: the missing S.I.P. coins!','But who put them there?','The Baker arrives — caught red-handed!',
   '"Wait," says Detective Fox. "This is too easy."','The Baker looks scared. Not guilty-scared.','Scared-scared.',
   '"Someone framed you."','Detective Fox replays every clue.','The gold coin — it was TOO obvious.',
   'Back to the Banker. She knows something.','She left for the airport this morning.','Detective Fox runs!',
   'The Banker is at the gate — with a golden suitcase!','Detective Fox leaps! Suitcase caught!','Inside: every last S.I.P. coin.',
   '"HOW did you know?" asks the Banker.','"Your baguette receipt. Yesterday\'s date."','The bank was closed. Inside access.',
   'The Banker is arrested. S.I.P. returned.','The Baker gets a reward — and an apology.',
   'Detective Fox orders a croissant.','Justice served. With butter.'],
  // 4: Attack of the Giant Dino-Bot
  ['Year 2157. Robots rule the earth.','But something stirs deep underground.','The DINO-BOT is awakening.',
   'Scientists detect massive energy readings.','General Steel scrambles all forces.','The ground SPLITS OPEN.',
   'A 100-meter robot dinosaur rises!','It roars — the sound shatters windows.','Cities evacuate immediately.',
   'Fighter jets approach. No effect.','Missiles bounce off its armor plating.','Dino-Bot swipes them away like flies.',
   'Dr. Maya has a plan.','She studied Dino-Bot for years.','Its core is a HEART — not a weapon.',
   'The Dino-Bot is LOST. Not angry. Lost.','It came up looking for the surface.','It has never seen the sky before.',
   'Dr. Maya broadcasts a signal.','Old dino calls, slowed way down.','Dino-Bot pauses. Tilts its head.',
   'It follows the sound to the coast.','It sees the ocean for the first time.','It sits down. Completely amazed.',
   'The army stands down.','Dino-Bot is just... watching the waves.','Dr. Maya approaches alone.',
   'She plays the signal from her tablet.','Dino-Bot lowers its enormous head gently.','It understands.',
   'Together they find a remote island.','Dino-Bot will live there in peace.','The island is renamed Dino-Bot Island.',
   'Tourists come from all over the world.','Dino-Bot loves the attention.','It learned to do a thumbs up.',
   'Dr. Maya visits every single week.','They watch the sunrise together.','The biggest friendship ever formed.',
   'Earth is safe. Dino-Bot is happy.','Sometimes it still roars. Just for fun.','The waves never complain.'],
  // 5: Grandma In Space
  ['NASA needs the best.','They got the second best.','Then the third best quit.',
   'So they called Grandma.','She was in the middle of baking.','She finished the pie first. Then accepted.',
   'Launch day. The rocket shakes violently.','Grandma knits calmly in her seat.','Houston: "Are you okay up there?"',
   'Grandma: "Could you turn down that rattling?"','Houston: "That\'s the engine."','Grandma: "I\'ll have a word with it later."',
   'Zero gravity! Things float everywhere.','Including Grandma\'s knitting.','She knits FASTER. Race against physics.',
   'First mission: fix the space telescope.','Grandma spacewalks without hesitation.','She brings her tool belt and a thermos.',
   'The bolt is stuck. Been stuck 10 years.','Grandma uses her secret grip technique.','The bolt turns. Astronomers cheer worldwide.',
   'But now she\'s drifted from the ship.','Slowly floating away into space.','She is not worried.',
   'She uses her scarf as a tether.','Hand over hand, she pulls herself back.','Houston: "That was... impressive."',
   'Day 3: alien signal detected!','It\'s a recipe. For some kind of soup.','Grandma recognizes it. It\'s borsch.',
   'She sends back her own recipe.','The aliens respond with enthusiasm!','First contact via soup exchange.',
   'An alien ship approaches slowly.','It\'s shaped like a giant pot.','Grandma waves from the window.',
   'They trade recipes for three hours.','Grandma: "I\'ll bring the rye bread next time."',
   'She returns home a hero.','And a little hungry.','Best mission NASA ever had.','She\'s already signed up for the next one.'],
  // 6: Ghost Detective
  ['The city of New Gloom.','It rains here every day.','Nobody minds. They like it.',
   'Detective Spectre can see ghosts.','They come to him for help.','He solves cases no living detective can.',
   'New case: a ghost won\'t leave a house.','The family is scared.','But the ghost seems more scared than they are.',
   'Detective Spectre visits after dark.','The ghost flickers nervously.','It tries to look scary. It fails.',
   '"Who are you?" asks Spectre.','The ghost pulls out a notepad.','It was a detective too. In 1932.',
   'Unsolved case from 90 years ago.','The ghost can\'t rest until it\'s solved.','Spectre agrees to help.',
   'Together they revisit old crime scenes.','The ghost remembers every detail.','Its notes appear as ghostly light.',
   'Clue 1: the stolen painting was a fake.','Clue 2: the real one was hidden in the wall.','Clue 3: the thief was the art TEACHER.',
   'The teacher\'s family still lives in town.','They find the real painting in storage.','Still hidden. Exactly as described.',
   'The painting goes to the museum.','The case is officially CLOSED.','90 years late.',
   'The ghost glows warm gold.','It smiles — really smiles.','"Thank you, Detective."',
   'It begins to fade.','Gets lighter and lighter.','Almost gone.',
   '"Same time next year?" asks Spectre.','The ghost laughs. Warmly.','And disappears into the light.',
   'Spectre looks at the empty room.','Opens his next case file.','It\'s going to be a long night.'],
  // 7: Intergalactic Grand Prix
  ['The most dangerous race in the universe.','1,000 ships. One winner.','Zero rules.',
   'Pilot Zoom-9 surveys the starting grid.','Competitors from 47 planets.','Some don\'t even have eyes. Just sensors.',
   'The starting signal fires!','Engines ROAR across the cosmos.','Zoom-9 slips into third place.',
   'First hazard: the Asteroid Slalom.','Ships dodge boulders at light speed.','10 ships eliminated immediately.',
   'Zoom-9 uses the asteroid shadows as cover.','Jumps to first place!','The crowd goes wild across 47 planets.',
   'Second hazard: the Black Hole Curve.','You have to get close. Very close.','Too close and you\'re gone forever.',
   'Zoom-9 cuts the corner perfectly.','Uses the gravity slingshot!','Breaks the sector record!',
   'Third hazard: the Nebula Fog.','Zero visibility. Pure instinct.','Ships crash into each other everywhere.',
   'Zoom-9 navigates by sound alone.','The hum of their own engine.','Exits the fog in first place.',
   'Final stretch: the Comet Highway.','Ride the comets or fight them.','Zoom-9 rides.',
   'The finish line is in sight!','Second place is right behind!','Neck and neck!',
   'Zoom-9 activates the emergency boost.','The ship shudders.','One last push—',
   'FIRST PLACE! By half a wing!','47 planets erupt in celebration!','Zoom-9 does victory rolls.',
   'The trophy is a miniature galaxy in a jar.','It spins slowly.','Worth every asteroid.',
   'Zoom-9 accepts with a humble bow.','And immediately registers for next year.'],
  // 8: Ninja Academy
  ['The legendary Ninja Academy.','Hidden in a mountain.','Very hard to find. On purpose.',
   'New student: Pip, age 12.','Pip trips over a pebble on day one.','The other ninjas laugh. Quietly.',
   'Master Kage assigns training.','Week 1: balance on one foot.','Pip falls. 47 times. Gets up 48.',
   'Week 2: throw a star at a target.','Pip misses the target. Hits a bird.','The bird brings it back. Helpful.',
   'Week 3: disappear into shadows.','Pip disappears... into a closet.','For four whole hours.',
   'Master Kage watches patiently.','He sees something the others don\'t.','Pip never gives up.',
   'The annual test approaches.','All students must pass three trials.','Pip is the only one who looks excited.',
   'Trial 1: silent sprint across the rooftops.','Pip is the loudest. Also the fastest.','A paradox. Master Kage nods slowly.',
   'Trial 2: solve a riddle in the dark.','Pip solves it in 30 seconds.','"I\'m bad at seeing, so I think more."',
   'Trial 3: defeat your opponent.','Pip\'s opponent is huge. Way bigger.','Pip doesn\'t fight. Just... moves.',
   'Every attack misses.','The big ninja tires out.','Pip taps them on the shoulder from behind.',
   '"That\'s not how it\'s supposed to work," says the big ninja.','Master Kage steps forward.','He bows deeply to Pip.',
   '"The best ninjas find another way."','Pip beams.','Graduation day. Academy\'s new top student.',
   'Pip still trips over pebbles.','But now does a backflip to recover.',
   'Master Kage smiles. For the first time. Ever.','The pebble is now an academy trophy.'],
  // 9: Aliens Ate My Pizza
  ['Jake ordered extra cheese. Extra toppings.','It arrived at his door. Perfect.','He opened the box.',
   'It was empty.','He looked up. A small spaceship was hovering.','Crumbs floating out of its hatch.',
   '"HEY!" shouted Jake.','A tiny alien poked its head out.','It had three eyes. All of them guilty.',
   'The alien beeped apologetically.','Jake: "You ate my pizza!"','The alien nodded. All three eyes downcast.',
   'Jake: "...Was it good?"','The alien absolutely lit up!','It started dancing.',
   'Jake couldn\'t stay mad.','The alien showed him its home planet.','Via a tiny hologram from its ship.',
   'A planet with NO pizza.','No cheese. No sauce. No dough.','Jake felt very sorry for them.',
   'He invited the alien in.','They made a pizza together.','The alien was a NATURAL at spreading sauce.',
   'Best pizza Jake ever tasted.','The alien called its friends.','47 spaceships landed in Jake\'s backyard.',
   'Jake: "Oh no."','Also Jake: "I need more dough."','The aliens brought their own ingredients.',
   'Intergalactic ingredients Jake had never seen.','Purple cheese that tasted like starlight.','Sauce that bubbled gently and glowed.',
   'The biggest pizza party in earth history.','The whole neighborhood joined in.','Nobody cared about the spaceships anymore.',
   'The aliens left with 12 new recipes.','Jake left with galactic ingredients.','And an alien email address. Sort of.',
   'The next week his pizza was extra special.','He\'s still not sure why.','He gave it five stars. 🍕⭐'],
  // 10: The Dragon and the Robot
  ['A dragon. A robot. Neither expected to meet.','The robot was surveying the mountain.','The dragon was napping. Badly interrupted.',
   'The dragon roared. The robot beeped.','The dragon breathed fire.','The robot was fireproof. Unfortunate for the dragon.',
   'They stared at each other for a long moment.','Robot: "I mean no harm."','Dragon: "That\'s what they all say."',
   'Robot: "Who\'s \'they\'?"','Dragon: "...Knights. Mostly."','Robot: "I\'m not a knight."',
   'This was true. Robot had no armor.','Just sensors and wires.','Dragon conceded the point.',
   'Robot was measuring the mountain.','For a new road.','Dragon did not like roads.',
   '"Roads bring tourists," said the dragon.','Robot calculated. "Roads bring pizza delivery."','Dragon paused. "...Tell me more."',
   'They talked for three hours.','Dragon learned about computers.','Robot learned about fire-breathing.',
   'They agreed: road goes AROUND the mountain.','Dragon gets a pizza delivery route.','Robot marks it on the map officially.',
   'First delivery: pepperoni extra hot.','The delivery drone caught fire slightly.','Dragon considered this adequate service.',
   'They built the road in a week.','Dragon helped clear the boulders.','Robot carried the heavy equipment.',
   'The road opened with great celebration.','Dragon did a flyover. Decoratively.','Tourists came from everywhere.',
   'Dragon signed up for the delivery app.','Robot gave five stars for the fire show.',
   'Most unusual business partnership ever.','The mountain was never lonely again.'],
  // 11: Super Cat 2: Pizza\'s Revenge
  ['It has been six months since the last battle.','Evil Pizza kept his promise... mostly.','His pizza shop was a huge hit.',
   'But something was wrong with Batch 99.','The pizzas started... talking.','And they were ANGRY.',
   'Batch 99 Leader had a plan.','Revenge on Super Cat.','And also the anchovy delivery guy.',
   'The talking pizzas organized overnight.','They took over the cheese district AGAIN.','Déjà vu.',
   'Super Cat was eating tuna when the alert came.','She sighed. Put down the fork.','Duty calls.',
   'The streets were full of talking pizza.','They were surprisingly well-organized.','Tiny little pizza armies with tiny signs.',
   'Super Cat tried the Laser Paw.','The pizza absorbed the energy.','And got STRONGER.',
   'Super Cat tried Clone Whiskers.','Fifteen Super Cats vs talking pizza.','The pizza cloned itself too.',
   'Stalemate.','Super Cat needed a completely new plan.','She called Evil Pizza.',
   '"Your batch is revolting!"','Evil Pizza: "They were always a bit undercooked."','Evil Pizza: "I\'ll handle it."',
   'Evil Pizza walked into the middle of the pizza army.','The talking pizzas went completely quiet.','He was their creator.',
   '"Listen to me," he said softly.','They listened.','He apologized for making them without asking.',
   'He offered them real lives. Jobs. Respect.','Batch 99 Leader considered carefully.','They accepted.',
   'The talking pizzas became city helpers.','Batch 99 Leader runs the cheese district now.',
   'Super Cat reopened the tuna. Evil Pizza joined her.','Weird friends. The very best kind.'],
  // 12: The Explox Games
  ['The Explox Games. Held every four years.','The most intense competition in the city.','You need brains AND guts.',
   'This year: 16 contestants. One winner.','The trophy: one million S.I.P.','Contestants train for months.',
   'Event 1: The SIP Sprint.','Collect as many S.I.P. coins as possible.','In under 60 seconds. In the dark.',
   'Our hero — Dash — memorized the map.','Every coin location. Every shortcut.','First place. 312 coins.',
   'Event 2: The NPC Gauntlet.','Navigate through 50 busy citizens.','Without bumping into anyone.',
   'Dash uses perfect footwork.','Slides between every gap.','Not a single bump. Crowd goes wild.',
   'Event 3: The Mini Game Marathon.','All five mini games back to back.','No breaks. No mistakes.',
   'GeoDash: perfect run. 200 SIP earned.','Throne: captured in record time.','Parkour: made it look easy.',
   'SF: wave 5 completed without dying.','Obby: final jump landed perfectly.','Crowd on their feet.',
   'Semi-finals: The SAI Challenge.','Answer 10 questions correctly.','Dash gets 9 out of 10.',
   'Second place gets all 10.','Heading into the final: TIE.','Everything on the final event.',
   'The Final: Build Your Own S.I.P. Empire.','24 hours. Most S.I.P. earned wins.','Dash works through the night.',
   'Bank. Job. Shop. Repeat. No sleep.','At hour 23: only 500 S.I.P. ahead.',
   '"I can win clean," says Dash.','They keep working honestly.',
   'Final bell rings. Dash wins by 1,200 S.I.P.','Honest play beats shortcuts. Every time.'],
  // 13: Time Travel Trouble
  ['Professor Tick built a time machine.','It worked perfectly. Once.','Then it went a little... sideways.',
   'He arrived in ancient Egypt.','Not where he was aiming.','He was aiming for last Tuesday.',
   'The Egyptians thought he was a god.','Because of his glowing wristwatch.','He decided not to correct them.',
   'He helped design a pyramid. Slightly.','Added a secret room. Bad idea.','It became the famous mystery room.',
   'He tried to leave. The machine needed parts.','Parts that wouldn\'t be invented for 2,000 years.','He improvised.',
   'Used copper wire and a cat.','The cat helped more than expected.','He arrived in medieval England.',
   'Slightly better. Wrong century still.','A knight challenged him to a joust.','He had never jousted.',
   'He did something smarter.','He invented the handshake.','Peace achieved.',
   'He arrived in 1920s Paris.','Getting closer!','He met three famous artists.',
   'He accidentally inspired a painting style.','Sorry about that.','Worth it for the croissants.',
   'Finally: 2024! Almost home!','One year off. Very close.','He decided one year was acceptable.',
   'He returned the machine to the lab.','Filed a 200-page incident report.','Mostly about the cat.',
   'The university: "You\'re three years late!"','Professor Tick: "Time is relative."','They couldn\'t argue with that.',
   'He kept the watch. The cat kept the copper wire.','The timeline is... probably fine.',
   'Probably.','He started writing his memoir. Working title: "Oops."'],
];

// Jake — a regular kid (pizza customer). Same (ctx,x,y,sz,t) contract as the other characters.
function _cJake(ctx,x,y,sz,t){
  const bob=Math.sin(t*1.5)*sz*.02, sw=Math.sin(t*2.2)*sz*.05;
  // legs (jeans)
  ctx.fillStyle='#2a4a8a';
  ctx.beginPath();ctx.roundRect(x-sz*.16,y+sz*.34+bob,sz*.13,sz*.3,sz*.04);ctx.fill();
  ctx.beginPath();ctx.roundRect(x+sz*.03,y+sz*.34+bob,sz*.13,sz*.3,sz*.04);ctx.fill();
  // shoes
  ctx.fillStyle='#e23b3b';
  ctx.beginPath();ctx.roundRect(x-sz*.19,y+sz*.6+bob,sz*.18,sz*.09,sz*.03);ctx.fill();
  ctx.beginPath();ctx.roundRect(x+sz*.01,y+sz*.6+bob,sz*.18,sz*.09,sz*.03);ctx.fill();
  // t-shirt
  ctx.fillStyle='#33bb77';
  ctx.beginPath();ctx.roundRect(x-sz*.2,y-sz*.04+bob,sz*.4,sz*.42,sz*.06);ctx.fill();
  // arms (swing slightly)
  ctx.fillStyle='#33bb77';
  ctx.save();ctx.translate(x-sz*.2,y+bob);ctx.rotate(sw*.12);ctx.beginPath();ctx.roundRect(-sz*.08,0,sz*.1,sz*.34,sz*.04);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(x+sz*.2,y+bob);ctx.rotate(-sw*.12);ctx.beginPath();ctx.roundRect(-sz*.02,0,sz*.1,sz*.34,sz*.04);ctx.fill();ctx.restore();
  // hands
  ctx.fillStyle='#f5c89a';
  ctx.beginPath();ctx.arc(x-sz*.23,y+sz*.33+bob,sz*.05,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x+sz*.23,y+sz*.33+bob,sz*.05,0,Math.PI*2);ctx.fill();
  // head: hair behind, face in front-lower (gives a hair cap)
  ctx.fillStyle='#4a2f1a';ctx.beginPath();ctx.arc(x,y-sz*.3+bob,sz*.215,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f5c89a';ctx.beginPath();ctx.arc(x,y-sz*.24+bob,sz*.2,0,Math.PI*2);ctx.fill();
  // eyes
  ctx.fillStyle='#222';
  ctx.beginPath();ctx.arc(x-sz*.07,y-sz*.25+bob,sz*.03,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(x+sz*.07,y-sz*.25+bob,sz*.03,0,Math.PI*2);ctx.fill();
  // smile
  ctx.strokeStyle='#9a4a4a';ctx.lineWidth=sz*.025;ctx.beginPath();ctx.arc(x,y-sz*.19+bob,sz*.07,.15*Math.PI,.85*Math.PI);ctx.stroke();
}

// Per-movie visual profiles: [bg1, bg2, accentHex, charFnA, charFnB, biome]
const _MVIS=[
  ['#06061e','#10103a','#ff7733',_cRobot,_cDino,'space'],
  ['#241408','#5a3416','#ffbb44',_cGrandma,_cNinja,'nature'],
  ['#06182a','#0a3050','#ff9933',_cCat,_cPizza,'city'],
  ['#0c0c1e','#1a1a3a','#ffdd55',_cDetective,_cRobot,'city'],
  ['#0a0a18','#16163a','#33ff99',_cDino,_cRobot,'city'],
  ['#04042a','#0a1a55','#cc99ff',_cGrandma,_cRocket,'space'],
  ['#080814','#10162e','#33ccff',_cDetective,_cGrandma,'city'],
  ['#06061e','#1a0a44','#ff9933',_cRocket,_cAlien,'space'],
  ['#0a1c10','#16401f','#bbff44',_cNinja,_cDetective,'nature'],
  ['#0a1428','#102044','#ff66cc',_cJake,_cAlien,'city'],
  ['#241008','#48200c','#ff8833',_cDragon,_cRobot,'nature'],
  ['#1a0a24','#34104a','#ff66ff',_cCat,_cPizza,'city'],
  ['#0a1c14','#10402a','#ffdd44',_cRobot,_cDetective,'city'],
  ['#0c0c12','#222018','#33ffee',_cRocket,_cDino,'space'],
];

// Keywords that mean a scene is about character B (the 2nd character) — then B is the focus
const _MCHARS=[
  ['dino','dinosaur','t-rex','reptile','dino king'],            // 0 fB=dino
  ['shadow','clan','the ninjas','boss ninja','sensei'],         // 1 fB=shadow ninja
  ['evil pizza','calzone','pepperoni guard','giant pizza','the pizza'], // 2 fB=evil pizza
  ['robot','android'],                                          // 3 fB=robot
  ['robot','dino-bot','the bot','machine'],                     // 4 fB=robot
  ['rocket','spaceship','the ship','alien'],                    // 5 fB=rocket
  ['the ghost','spectre'],                                      // 6 fB=grandma(ghost) — rarely
  ['alien','rival','competitor','zoom'],                        // 7 fB=alien
  ['master kage','the master','opponent'],                      // 8 fB=detective — rarely
  ['alien','beeped','hologram','three eyes','poked','nodded','its head','its home','its friends','aliens'], // 9 fA=Jake(person) fB=alien (ship/hatch scenes stay on Jake looking up)
  ['robot','the bot','machine'],                                // 10 fB=robot
  ['evil pizza','calzone','batch 99','the pizza'],              // 11 fB=evil pizza
  ['rival','dash','opponent'],                                  // 12 fB=detective — rarely
  ['dino','dinosaur','knight','egyptian'],                      // 13 fB=dino — rarely
];

// ── cinematic backdrop helpers ──
function _mxDark(hex,f){hex=hex.replace('#','');const r=parseInt(hex.substr(0,2),16),g=parseInt(hex.substr(2,2),16),b=parseInt(hex.substr(4,2),16);return 'rgb('+Math.min(255,r*f|0)+','+Math.min(255,g*f|0)+','+Math.min(255,b*f|0)+')';}
function _mxSkyline(ctx,w,h,gy,t,seed){seed=seed||0;const n=10,bw=w/n;for(let i=0;i<n;i++){const bx=i*bw,bh=h*(0.16+((i*37+seed*53)%11)/11*0.32);ctx.fillStyle='#070a18';ctx.fillRect(bx+1,gy-bh,bw-2,bh);const rows=Math.max(2,(bh/15)|0);for(let r=0;r<rows;r++)for(let c=0;c<3;c++){if((r*3+c+i*2+seed)%3!==0){const fl=0.3+0.4*Math.abs(Math.sin(t*1.5+i*3+r));ctx.fillStyle='rgba(255,210,110,'+fl+')';ctx.fillRect(bx+5+c*(bw/3.3),gy-bh+5+r*15,5,8);}}}}
function _mxHills(ctx,w,h,gy,seed){seed=seed||0;[{o:h*0.20,c:'#13321e'},{o:h*0.12,c:'#0b2113'}].forEach((L,li)=>{ctx.fillStyle=L.c;ctx.beginPath();ctx.moveTo(0,gy);for(let x=0;x<=w;x+=w/5){const oo=L.o*(0.65+0.55*Math.abs(Math.sin(seed*1.7+li+x*0.013)));ctx.quadraticCurveTo(x+w/10,gy-oo,x+w/5,gy);}ctx.lineTo(w,gy);ctx.closePath();ctx.fill();});}
function _mxGround(ctx,w,h,gy,acc){ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(0,gy,w,h-gy);ctx.strokeStyle=acc+'2a';ctx.lineWidth=1;for(let i=-6;i<=6;i++){ctx.beginPath();ctx.moveTo(w*0.5,gy);ctx.lineTo(w*0.5+i*w*0.18,h);ctx.stroke();}}
function _mxVignette(ctx,w,h){const g=ctx.createRadialGradient(w*.5,h*.45,h*.34,w*.5,h*.5,h*.82);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.48)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
function _mxStand(ctx,fn,x,gy,sz,t,arg,flip,lift){lift=lift||0;ctx.save();ctx.fillStyle='rgba(0,0,0,'+(lift>0?0.2:0.42)+')';ctx.beginPath();ctx.ellipse(x,gy,sz*0.52*(lift>0?0.8:1),sz*0.12,0,0,Math.PI*2);ctx.fill();ctx.restore();const yy=gy-lift-sz*0.6;if(flip){ctx.save();ctx.translate(x,0);ctx.scale(-1,1);fn(ctx,0,yy,sz,t,arg);ctx.restore();}else fn(ctx,x,yy,sz,t,arg);}
function _mxNebula(ctx,w,h,acc){[[0.28,0.26,0.34,'26'],[0.72,0.3,0.28,'1c']].forEach(p=>{const cx=w*p[0],cy=h*p[1],r=h*p[2],g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,acc+p[3]);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);});}
function _mxHaze(ctx,w,h,gy,acc){const g=ctx.createLinearGradient(0,gy-h*0.22,0,gy);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,acc+'33');ctx.fillStyle=g;ctx.fillRect(0,gy-h*0.22,w,h*0.22);}
function _mxClouds(ctx,w,h,t,col){for(let i=0;i<3;i++){const cy=h*(0.12+i*0.07),cx=((t*0.02+i*0.37)%1.3-0.15)*w;ctx.fillStyle=col;ctx.globalAlpha=0.55;ctx.beginPath();ctx.ellipse(cx,cy,w*0.14,h*0.03,0,0,Math.PI*2);ctx.ellipse(cx+w*0.08,cy+h*0.012,w*0.1,h*0.025,0,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
function _mxForeground(ctx,w,h,gy,biome,acc,t){
  if(biome==='nature'){
    ctx.fillStyle='#06170c';ctx.beginPath();ctx.ellipse(w*0.05,gy+h*0.16,h*0.17,h*0.12,0,0,Math.PI*2);ctx.ellipse(w*0.97,gy+h*0.18,h*0.19,h*0.14,0,0,Math.PI*2);ctx.fill();
    for(let i=0;i<11;i++){const fx=(i*0.0909+0.04)*w,sw=Math.sin(t*2+i)*3;ctx.strokeStyle='#0c2a14';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(fx,gy+h*0.05);ctx.quadraticCurveTo(fx+sw,gy-h*0.01,fx+sw*2,gy-h*0.06);ctx.stroke();if(i%3===1){ctx.fillStyle=acc;ctx.beginPath();ctx.arc(fx+sw*2,gy-h*0.06,h*0.012,0,Math.PI*2);ctx.fill();}}
  } else if(biome==='city'){
    [w*0.1,w*0.9].forEach(lx=>{ctx.strokeStyle='#0a0e1a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(lx,gy+h*0.08);ctx.lineTo(lx,gy-h*0.24);ctx.lineTo(lx+(lx<w*0.5?h*0.05:-h*0.05),gy-h*0.24);ctx.stroke();const g=ctx.createRadialGradient(lx,gy-h*0.23,0,lx,gy-h*0.23,h*0.1);g.addColorStop(0,'rgba(255,220,140,0.85)');g.addColorStop(1,'rgba(255,220,140,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(lx,gy-h*0.23,h*0.1,0,Math.PI*2);ctx.fill();});
  } else {
    for(let i=0;i<6;i++){const ax=(i*0.19+0.05)*w,ay=gy+h*0.04+(i%2)*h*0.05,ar=h*(0.018+(i%3)*0.012);ctx.fillStyle='#15151e';ctx.beginPath();ctx.arc(ax,ay,ar,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.06)';ctx.beginPath();ctx.arc(ax-ar*0.3,ay-ar*0.3,ar*0.4,0,Math.PI*2);ctx.fill();}
  }
}
function _mxBackdrop(ctx,w,h,t,bg1,bg2,acc,biome,gy,ei){
  ei=ei||0;
  const fr=m=>{const v=ei*0.61803+m;return v-Math.floor(v);};
  _cBg(ctx,w,h,bg1,bg2);
  if(biome==='space'){
    _mxNebula(ctx,w,h,acc);_cStars(ctx,w,h,t,90);
    _cPlanet(ctx,w*(0.64+fr(0.2)*0.28),h*(0.15+fr(1.1)*0.14),h*(0.07+fr(2.3)*0.06),acc,bg1,t);
    _cPlanet(ctx,w*(0.08+fr(3.1)*0.22),h*(0.13+fr(0.7)*0.13),h*(0.04+fr(1.7)*0.03),_mxDark(acc,0.6),bg2,t+2);
  }
  else if(biome==='city'){_cStars(ctx,w,h,t,26);_mxClouds(ctx,w,h,t,_mxDark(acc,0.4));_mxSkyline(ctx,w,h,gy,t,ei);}
  else{
    _cStars(ctx,w,h,t,34);
    const mx=w*(0.68+fr(0.9)*0.2),my=h*(0.15+fr(2.0)*0.1);
    const mg=ctx.createRadialGradient(mx,my,0,mx,my,h*0.13);mg.addColorStop(0,'rgba(255,250,220,0.95)');mg.addColorStop(1,'rgba(255,250,220,0)');ctx.fillStyle=mg;ctx.beginPath();ctx.arc(mx,my,h*0.065,0,Math.PI*2);ctx.fill();
    _mxClouds(ctx,w,h,t,'rgba(70,60,80,0.5)');_mxHills(ctx,w,h,gy,ei);
  }
  _mxHaze(ctx,w,h,gy,acc);
  _mxGround(ctx,w,h,gy,acc);
}

// Pick a story object to draw, based on nouns in the caption (or null)
function _mxPropKind(s){
  s=(' '+(s||'')+' ').toLowerCase();
  const h=arr=>arr.some(k=>s.indexOf(k)!==-1);
  if(h(['crumb']))return 'crumbs';
  if(h(['spaceship','space ship',' ufo','flying saucer','the ship','saucer',' hatch','hovering']))return 'ship';
  if(h(['pizza box','the box','opened the box','was empty','empty box']))return 'box';
  if(h(['trophy','first place','medal','win the','award','five stars','championship']))return 'trophy';
  if(h(['crown','throne',' king',' queen','royal']))return 'crown';
  if(h(['crystal',' gem','jewel','diamond']))return 'crystal';
  if(h([' pie','bakes','baking','cookie']))return 'pie';
  if(h([' tea ','teacup','teapot',' tea.',' tea,']))return 'tea';
  if(h(['pizza','pepperoni','anchov','calzone']))return 'pizza';
  if(h(['rose','flower','garden','petal','bloom']))return 'flower';
  if(h(['letter','mailman','envelope','postcard']))return 'letter';
  if(h([' book','memoir','recipe','report','notepad',' file',' map ','scroll','blueprint']))return 'book';
  if(h(['clock','time machine','time travel','wristwatch','century','hourglass',"o'clock"]))return 'clock';
  if(h([' sword','blade','shuriken','rolling pin','knitting','weapon','katana']))return 'sword';
  if(h([' music','song',' sing','dance','dancing','party']))return 'music';
  if(h(['friendship','best friend','allies','mercy','kindness',' peace ','peace.','peace!',' heart','love']))return 'heart';
  if(h(['coin',' gold ','treasure','jackpot',' money','s.i.p','reward','million']))return 'coins';
  return null;
}

// Detect an ACTION verb in the caption → draw the event happening (or null)
function _mxActionKind(s){
  s=(' '+(s||'')+' ').toLowerCase();
  const h=a=>a.some(k=>s.indexOf(k)!==-1);
  if(h(['laser','beam',' ray ','zap','blaster','death ray','heat ray']))return 'laser';
  if(h([' rain','airdrop','pours','downpour','snow','from the sky','falls from','melts','melt','drip']))return 'fall';
  if(h(['giant','grows','enormous','massive',' huge','gigantic','colossal','grew']))return 'grow';
  if(h(['flies','soars','hover','floating','lift off','takes off','blast off','launches','leaps','jumps','pounce','dives']))return 'fly';
  return null;
}

// Draw an action effect overlay (laser beam / falling rain) across the scene
function _mxActionFx(ctx,w,h,gy,acc,kind,t){
  if(kind==='laser'){
    const by=gy-h*0.18;
    ctx.save();ctx.globalAlpha=0.4+0.4*Math.abs(Math.sin(t*8));
    ctx.strokeStyle=acc;ctx.lineWidth=h*0.02;ctx.beginPath();ctx.moveTo(w*0.34,by);ctx.lineTo(w*0.72,by-h*0.04);ctx.stroke();
    ctx.strokeStyle='#fff';ctx.lineWidth=h*0.007;ctx.beginPath();ctx.moveTo(w*0.34,by);ctx.lineTo(w*0.72,by-h*0.04);ctx.stroke();
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2;ctx.fillStyle=acc;ctx.beginPath();ctx.arc(w*0.72+Math.cos(a)*h*0.05,by-h*0.04+Math.sin(a)*h*0.05,h*0.01,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  } else if(kind==='fall'){
    ctx.save();ctx.strokeStyle='rgba(180,210,255,0.6)';ctx.fillStyle='rgba(200,225,255,0.7)';ctx.lineWidth=2;
    for(let i=0;i<40;i++){const fx=(i*73.1%1)*w,fy=((i*39.7%1+t*0.9)%1)*gy;ctx.beginPath();ctx.ellipse(fx,fy,2,5,0,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
}

// Draw a small glowing story object at (x,y)
function _mxProp(ctx,x,y,sz,kind,t,acc){
  ctx.save();
  const gg=ctx.createRadialGradient(x,y,0,x,y,sz*1.5);gg.addColorStop(0,'rgba(255,255,210,0.28)');gg.addColorStop(1,'rgba(255,255,210,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(x,y,sz*1.5,0,Math.PI*2);ctx.fill();
  const bob=Math.sin(t*2)*sz*0.06;y+=bob;
  switch(kind){
    case 'flower':
      for(var i=-1;i<=1;i++){var fx=x+i*sz*0.55;ctx.strokeStyle='#2e7d32';ctx.lineWidth=sz*0.09;ctx.beginPath();ctx.moveTo(fx,y+sz*0.75);ctx.lineTo(fx,y-sz*0.1);ctx.stroke();ctx.fillStyle=i===0?'#ff5577':(i<0?'#ffcc33':'#cc66ff');for(var p=0;p<5;p++){var a=p/5*Math.PI*2;ctx.beginPath();ctx.arc(fx+Math.cos(a)*sz*0.24,y-sz*0.1+Math.sin(a)*sz*0.24,sz*0.15,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#ffee66';ctx.beginPath();ctx.arc(fx,y-sz*0.1,sz*0.13,0,Math.PI*2);ctx.fill();}
      break;
    case 'tea':
      ctx.fillStyle='#f5f5f5';ctx.beginPath();ctx.moveTo(x-sz*0.45,y-sz*0.15);ctx.lineTo(x+sz*0.45,y-sz*0.15);ctx.lineTo(x+sz*0.33,y+sz*0.4);ctx.lineTo(x-sz*0.33,y+sz*0.4);ctx.closePath();ctx.fill();ctx.strokeStyle='#f5f5f5';ctx.lineWidth=sz*0.09;ctx.beginPath();ctx.arc(x+sz*0.5,y+sz*0.08,sz*0.2,-1.2,1.2);ctx.stroke();ctx.fillStyle='#7a3b10';ctx.beginPath();ctx.ellipse(x,y-sz*0.15,sz*0.43,sz*0.08,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,'+(0.4+0.3*Math.sin(t*3))+')';ctx.lineWidth=sz*0.06;for(var s=-1;s<=1;s++){ctx.beginPath();ctx.moveTo(x+s*sz*0.2,y-sz*0.25);ctx.quadraticCurveTo(x+s*sz*0.2+Math.sin(t*3+s)*sz*0.12,y-sz*0.55,x+s*sz*0.2,y-sz*0.85);ctx.stroke();}
      break;
    case 'pie':
      ctx.fillStyle='#d9a441';ctx.beginPath();ctx.ellipse(x,y+sz*0.22,sz*0.72,sz*0.3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0c060';ctx.beginPath();ctx.ellipse(x,y+sz*0.05,sz*0.72,sz*0.36,0,Math.PI,0);ctx.fill();ctx.strokeStyle='#b07820';ctx.lineWidth=sz*0.07;for(var i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(x+i*sz*0.24,y+sz*0.05);ctx.lineTo(x+i*sz*0.17,y-sz*0.3);ctx.stroke();}ctx.strokeStyle='rgba(255,255,255,'+(0.3+0.3*Math.sin(t*3))+')';ctx.lineWidth=sz*0.05;for(var s=-1;s<=1;s++){ctx.beginPath();ctx.moveTo(x+s*sz*0.32,y-sz*0.28);ctx.quadraticCurveTo(x+s*sz*0.32+Math.sin(t*3+s)*sz*0.12,y-sz*0.52,x+s*sz*0.32,y-sz*0.8);ctx.stroke();}
      break;
    case 'pizza':
      ctx.fillStyle='#c8a04a';ctx.beginPath();ctx.moveTo(x,y-sz*0.6);ctx.lineTo(x-sz*0.55,y+sz*0.5);ctx.lineTo(x+sz*0.55,y+sz*0.5);ctx.closePath();ctx.fill();ctx.fillStyle='#fdd835';ctx.beginPath();ctx.moveTo(x,y-sz*0.45);ctx.lineTo(x-sz*0.42,y+sz*0.4);ctx.lineTo(x+sz*0.42,y+sz*0.4);ctx.closePath();ctx.fill();ctx.fillStyle='#c62828';[[0,-0.1],[-0.18,0.2],[0.18,0.2],[0,0.32]].forEach(function(p){ctx.beginPath();ctx.arc(x+p[0]*sz,y+p[1]*sz,sz*0.1,0,Math.PI*2);ctx.fill();});
      break;
    case 'letter':
      ctx.fillStyle='#fff';ctx.fillRect(x-sz*0.55,y-sz*0.38,sz*1.1,sz*0.76);ctx.strokeStyle='#bbb';ctx.lineWidth=sz*0.04;ctx.strokeRect(x-sz*0.55,y-sz*0.38,sz*1.1,sz*0.76);ctx.beginPath();ctx.moveTo(x-sz*0.55,y-sz*0.38);ctx.lineTo(x,y+sz*0.05);ctx.lineTo(x+sz*0.55,y-sz*0.38);ctx.stroke();ctx.fillStyle='#e94560';ctx.beginPath();ctx.arc(x,y+sz*0.05,sz*0.1,0,Math.PI*2);ctx.fill();
      break;
    case 'trophy':
      ctx.fillStyle=acc;ctx.beginPath();ctx.moveTo(x-sz*0.4,y-sz*0.4);ctx.lineTo(x+sz*0.4,y-sz*0.4);ctx.lineTo(x+sz*0.28,y+sz*0.1);ctx.lineTo(x-sz*0.28,y+sz*0.1);ctx.closePath();ctx.fill();ctx.strokeStyle=acc;ctx.lineWidth=sz*0.08;ctx.beginPath();ctx.arc(x-sz*0.4,y-sz*0.25,sz*0.18,0.5,2.0);ctx.stroke();ctx.beginPath();ctx.arc(x+sz*0.4,y-sz*0.25,sz*0.18,-1.1,0.6,true);ctx.stroke();ctx.fillStyle=acc;ctx.fillRect(x-sz*0.08,y+sz*0.1,sz*0.16,sz*0.25);ctx.fillRect(x-sz*0.28,y+sz*0.35,sz*0.56,sz*0.12);ctx.fillStyle='#fff';ctx.globalAlpha=0.5+0.5*Math.sin(t*4);ctx.font='bold '+sz*0.5+'px Arial';ctx.textAlign='center';ctx.fillText('★',x,y-sz*0.05);ctx.globalAlpha=1;
      break;
    case 'crystal':
      var cg=ctx.createLinearGradient(x,y-sz*0.6,x,y+sz*0.6);cg.addColorStop(0,'#bbf0ff');cg.addColorStop(1,acc);ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(x,y-sz*0.6);ctx.lineTo(x+sz*0.4,y-sz*0.1);ctx.lineTo(x+sz*0.25,y+sz*0.55);ctx.lineTo(x-sz*0.25,y+sz*0.55);ctx.lineTo(x-sz*0.4,y-sz*0.1);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.7)';ctx.lineWidth=sz*0.04;ctx.beginPath();ctx.moveTo(x,y-sz*0.6);ctx.lineTo(x,y+sz*0.55);ctx.moveTo(x-sz*0.4,y-sz*0.1);ctx.lineTo(x+sz*0.4,y-sz*0.1);ctx.stroke();
      break;
    case 'coins':
      for(var i=0;i<3;i++){var cy=y+sz*0.3-i*sz*0.28;ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.ellipse(x,cy,sz*0.5,sz*0.2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e0a800';ctx.beginPath();ctx.ellipse(x,cy-sz*0.05,sz*0.5,sz*0.2,0,Math.PI,0);ctx.fill();ctx.fillStyle='#8a6800';ctx.font='bold '+sz*0.28+'px Arial';ctx.textAlign='center';ctx.fillText('$',x,cy+sz*0.06);}
      break;
    case 'crown':
      ctx.fillStyle=acc;ctx.beginPath();ctx.moveTo(x-sz*0.55,y+sz*0.35);ctx.lineTo(x-sz*0.55,y-sz*0.1);ctx.lineTo(x-sz*0.28,y+sz*0.15);ctx.lineTo(x,y-sz*0.4);ctx.lineTo(x+sz*0.28,y+sz*0.15);ctx.lineTo(x+sz*0.55,y-sz*0.1);ctx.lineTo(x+sz*0.55,y+sz*0.35);ctx.closePath();ctx.fill();['#ff5577','#55ccff','#88ff88'].forEach(function(c,i){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x-sz*0.3+i*sz*0.3,y+sz*0.12,sz*0.09,0,Math.PI*2);ctx.fill();});
      break;
    case 'book':
      ctx.fillStyle='#f5ead0';ctx.beginPath();ctx.moveTo(x,y-sz*0.35);ctx.quadraticCurveTo(x-sz*0.55,y-sz*0.45,x-sz*0.6,y-sz*0.25);ctx.lineTo(x-sz*0.6,y+sz*0.35);ctx.quadraticCurveTo(x-sz*0.55,y+sz*0.2,x,y+sz*0.3);ctx.quadraticCurveTo(x+sz*0.55,y+sz*0.2,x+sz*0.6,y+sz*0.35);ctx.lineTo(x+sz*0.6,y-sz*0.25);ctx.quadraticCurveTo(x+sz*0.55,y-sz*0.45,x,y-sz*0.35);ctx.fill();ctx.strokeStyle='#caa86a';ctx.lineWidth=sz*0.04;ctx.beginPath();ctx.moveTo(x,y-sz*0.35);ctx.lineTo(x,y+sz*0.3);ctx.stroke();
      break;
    case 'clock':
      ctx.fillStyle='#f5f5f5';ctx.beginPath();ctx.arc(x,y,sz*0.55,0,Math.PI*2);ctx.fill();ctx.strokeStyle=acc;ctx.lineWidth=sz*0.08;ctx.stroke();ctx.strokeStyle='#222';ctx.lineWidth=sz*0.06;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(t-Math.PI/2)*sz*0.35,y+Math.sin(t-Math.PI/2)*sz*0.35);ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(t*0.4-Math.PI/2)*sz*0.22,y+Math.sin(t*0.4-Math.PI/2)*sz*0.22);ctx.stroke();ctx.fillStyle='#222';ctx.beginPath();ctx.arc(x,y,sz*0.06,0,Math.PI*2);ctx.fill();
      break;
    case 'sword':
      ctx.fillStyle='#dfe6ee';ctx.beginPath();ctx.moveTo(x,y-sz*0.6);ctx.lineTo(x+sz*0.1,y+sz*0.2);ctx.lineTo(x-sz*0.1,y+sz*0.2);ctx.closePath();ctx.fill();ctx.fillStyle='#8a6d3b';ctx.fillRect(x-sz*0.28,y+sz*0.2,sz*0.56,sz*0.1);ctx.fillRect(x-sz*0.07,y+sz*0.3,sz*0.14,sz*0.3);ctx.fillStyle='#5a4422';ctx.beginPath();ctx.arc(x,y+sz*0.6,sz*0.1,0,Math.PI*2);ctx.fill();
      break;
    case 'music':
      ctx.fillStyle=acc;for(var i=0;i<3;i++){var nx=x-sz*0.3+i*sz*0.35,ny=y+Math.sin(t*3+i)*sz*0.15;ctx.beginPath();ctx.ellipse(nx,ny+sz*0.3,sz*0.16,sz*0.12,-0.3,0,Math.PI*2);ctx.fill();ctx.fillRect(nx+sz*0.12,ny-sz*0.35,sz*0.05,sz*0.65);}ctx.fillRect(x-sz*0.18,y-sz*0.4,sz*0.65,sz*0.06);
      break;
    case 'heart':
      var hs=1+0.08*Math.sin(t*4);ctx.fillStyle='#ff4d6d';ctx.beginPath();ctx.moveTo(x,y+sz*0.5*hs);ctx.bezierCurveTo(x-sz*0.7*hs,y-sz*0.1*hs,x-sz*0.3*hs,y-sz*0.6*hs,x,y-sz*0.2*hs);ctx.bezierCurveTo(x+sz*0.3*hs,y-sz*0.6*hs,x+sz*0.7*hs,y-sz*0.1*hs,x,y+sz*0.5*hs);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.5)';ctx.beginPath();ctx.arc(x-sz*0.18,y-sz*0.18,sz*0.1,0,Math.PI*2);ctx.fill();
      break;
    case 'ship': // hovering UFO with a tractor beam
      var hov=Math.sin(t*1.5)*sz*0.08; y+=hov;
      ctx.fillStyle=acc+'22';ctx.beginPath();ctx.moveTo(x-sz*0.22,y+sz*0.18);ctx.lineTo(x+sz*0.22,y+sz*0.18);ctx.lineTo(x+sz*0.62,y+sz*1.15);ctx.lineTo(x-sz*0.62,y+sz*1.15);ctx.closePath();ctx.fill();
      ctx.fillStyle='#bfe6ff';ctx.beginPath();ctx.ellipse(x,y-sz*0.08,sz*0.32,sz*0.3,0,Math.PI,0);ctx.fill();
      ctx.fillStyle='#9aa7b8';ctx.beginPath();ctx.ellipse(x,y+sz*0.12,sz*0.78,sz*0.24,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#6b7787';ctx.beginPath();ctx.ellipse(x,y+sz*0.18,sz*0.78,sz*0.16,0,0,Math.PI);ctx.fill();
      for(var i=-2;i<=2;i++){ctx.fillStyle=(Math.floor(t*4+i)%2?acc:'#fff');ctx.beginPath();ctx.arc(x+i*sz*0.3,y+sz*0.16,sz*0.06,0,Math.PI*2);ctx.fill();}
      break;
    case 'crumbs': // a little saucer with crumbs floating out of its hatch
      ctx.fillStyle='#9aa7b8';ctx.beginPath();ctx.ellipse(x,y-sz*0.5,sz*0.52,sz*0.16,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#3a3f49';ctx.beginPath();ctx.ellipse(x,y-sz*0.44,sz*0.2,sz*0.07,0,0,Math.PI*2);ctx.fill();
      for(var i=0;i<8;i++){var ca=t*1.4+i*0.8,ccx=x+Math.sin(ca)*sz*0.42,ccy=y-sz*0.3+((i*0.13+t*0.3)%1)*sz*0.95;ctx.fillStyle=i%2?'#e0b566':'#c9a45f';ctx.save();ctx.translate(ccx,ccy);ctx.rotate(ca);ctx.fillRect(-sz*0.05,-sz*0.05,sz*0.1,sz*0.1);ctx.restore();}
      break;
    case 'box': // an open, empty pizza box
      ctx.save();ctx.translate(x-sz*0.45,y-sz*0.05);ctx.rotate(-0.45);ctx.fillStyle='#caa86a';ctx.fillRect(0,-sz*0.72,sz*0.95,sz*0.72);ctx.fillStyle='#b8945a';ctx.fillRect(sz*0.06,-sz*0.66,sz*0.83,sz*0.6);ctx.restore();
      ctx.fillStyle='#d9b877';ctx.beginPath();ctx.moveTo(x-sz*0.62,y+sz*0.08);ctx.lineTo(x+sz*0.62,y+sz*0.08);ctx.lineTo(x+sz*0.5,y+sz*0.46);ctx.lineTo(x-sz*0.5,y+sz*0.46);ctx.closePath();ctx.fill();
      ctx.fillStyle='#a87f44';ctx.beginPath();ctx.moveTo(x-sz*0.5,y+sz*0.11);ctx.lineTo(x+sz*0.5,y+sz*0.11);ctx.lineTo(x+sz*0.41,y+sz*0.41);ctx.lineTo(x-sz*0.41,y+sz*0.41);ctx.closePath();ctx.fill();
      break;
  }
  ctx.restore();
}

// Returns a draw(ctx,w,h,t) styled like a cinematic still that fits the caption mood
function _mxDraw(tIdx,bg1,bg2,acc,fA,fB,biome,prop,focusB,ei,act){
  ei=ei||0;
  function draw(ctx,w,h,t){
    const gy=h*0.73, s1=h*0.33, s2=h*0.28;
    const pri=focusB?fB:fA;
    // per-scene deterministic variation so consecutive scenes don't look identical
    const fr=m=>{const v=ei*0.61803+m;return v-Math.floor(v);};
    const vx=(fr(0.5)-0.5)*0.26*w;
    let vz=0.82+fr(1.3)*0.42; if(ei%5===0) vz*=1.35;
    const flip=fr(3.3)>0.5;
    // action affects the focal character: grow = bigger, fly = lifted off the ground
    let lift=0; if(act==='grow') vz*=1.55; if(act==='fly') lift=h*0.15;
    switch(tIdx%9){
      case 0: // Two characters — meeting / dialogue
        _mxBackdrop(ctx,w,h,t,bg1,bg2,acc,biome,gy,ei);
        _mxStand(ctx,fA,w*0.3,gy,s2,t);_mxStand(ctx,fB,w*0.7,gy,s2,t+1);
        for(let i=0;i<3;i++){ctx.fillStyle=acc;ctx.globalAlpha=Math.max(0,Math.sin(t*3-i*0.6))*0.7;ctx.beginPath();ctx.arc(w*0.5+(i-1)*h*0.04,h*0.34,h*0.012,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
        break;
      case 1: // Wide establishing landscape (rule of thirds — subject on the right)
        _mxBackdrop(ctx,w,h,t,bg1,bg2,acc,biome,gy,ei);
        if(biome!=='space'){_cBird(ctx,w*0.28,h*0.18,h*0.03,t);_cBird(ctx,w*0.4,h*0.14,h*0.025,t+1);}
        _mxStand(ctx,pri,w*0.62+vx,gy,s1*vz,t*0.5,false,flip,lift);
        break;
      case 2: // Explosion / disaster
        _mxBackdrop(ctx,w,h,t,_mxDark(bg1,0.7),'#1a0805',acc,biome,gy,ei);
        _mxStand(ctx,fA,w*0.2,gy,s2,t);_mxStand(ctx,fB,w*0.8,gy,s2,t+0.5);
        _cExplo(ctx,w*0.5,h*0.42,h*0.34,(t*0.45)%1);
        ctx.fillStyle='rgba(255,180,60,'+Math.max(0,0.4-((t*0.45)%1)*0.4)+')';ctx.fillRect(0,0,w,h);
        break;
      case 3: // Dramatic spotlight — single character
        ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
        const rg=ctx.createRadialGradient(w*0.5,h*0.18,0,w*0.5,h*0.5,h*0.7);
        rg.addColorStop(0,acc+'44');rg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,w,h);
        ctx.fillStyle=acc+'22';ctx.beginPath();ctx.moveTo(w*0.5,0);ctx.lineTo(w*0.3,gy);ctx.lineTo(w*0.7,gy);ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,gy,w,h-gy);
        _mxStand(ctx,pri,w*0.5+vx*0.4,gy,s1*1.05*vz,t,false,flip,lift);
        break;
      case 4: // Chase / running
        _mxBackdrop(ctx,w,h,t,bg1,bg2,acc,biome,gy,ei);
        ctx.strokeStyle=acc+'55';ctx.lineWidth=3;for(let i=0;i<7;i++){const ly=h*0.3+i*h*0.05,lx=(w-((t*0.6+i*0.13)%1)*w*1.3);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+w*0.14,ly);ctx.stroke();}
        _mxStand(ctx,fB,w*0.32+Math.sin(t*8)*h*0.01,gy,s2,t+0.3,true);_mxStand(ctx,fA,w*0.6+Math.sin(t*8)*h*0.01,gy,s2,t,true);
        break;
      case 5: // Calm / reflective
        _mxBackdrop(ctx,w,h,t,bg1,bg2,acc,biome,gy,ei);
        for(let i=0;i<14;i++){const px=(i*97.3%1)*w,py=((i*53.7%1+t*0.12)%1)*gy,a=0.3+0.4*Math.sin(t+i);ctx.fillStyle='rgba(255,200,150,'+a+')';ctx.save();ctx.translate(px,py);ctx.rotate(t+i);ctx.beginPath();ctx.ellipse(0,0,h*0.012,h*0.006,0,0,Math.PI*2);ctx.fill();ctx.restore();}
        _mxStand(ctx,pri,w*0.42+vx,gy,s1*vz,t*0.3,false,flip,lift);
        break;
      case 6: // Battle — two characters clashing
        _mxBackdrop(ctx,w,h,t,_mxDark(bg1,0.8),'#160406',acc,biome,gy,ei);
        _mxStand(ctx,fA,w*0.3,gy,s2,t);_mxStand(ctx,fB,w*0.7,gy,s2,t);
        _cLines(ctx,w*0.5,h*0.45,h*0.2,12,acc+'55');
        for(let i=0;i<12;i++){const a=i/12*Math.PI*2+t*2,r=h*0.06+Math.abs(Math.sin(t*4+i))*h*0.1;ctx.fillStyle=acc;ctx.globalAlpha=0.5+0.4*Math.sin(t*5+i);ctx.beginPath();ctx.arc(w*0.5+Math.cos(a)*r,h*0.45+Math.sin(a)*r,2+i%3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
        ctx.fillStyle='rgba(255,255,255,'+(0.3+0.3*Math.abs(Math.sin(t*4)))+')';ctx.beginPath();ctx.arc(w*0.5,h*0.45,h*0.04,0,Math.PI*2);ctx.fill();
        break;
      case 7: // Discovery glow — character finds something
        _mxBackdrop(ctx,w,h,t,bg1,bg2,acc,biome,gy,ei);
        const oy=h*0.3+Math.sin(t*1.5)*h*0.02;
        const gl=ctx.createRadialGradient(w*0.5,oy,0,w*0.5,oy,h*0.28);gl.addColorStop(0,acc);gl.addColorStop(0.4,acc+'88');gl.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(w*0.5,oy,h*0.28,0,Math.PI*2);ctx.fill();
        _cLines(ctx,w*0.5,oy,h*0.3,10,acc+'66');
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(w*0.5,oy,h*0.05*(0.8+0.2*Math.sin(t*4)),0,Math.PI*2);ctx.fill();
        _mxStand(ctx,pri,w*0.5+vx*0.5,gy,s1*vz,t,false,flip,lift);
        break;
      case 8: // Victory celebration
        _mxBackdrop(ctx,w,h,t,bg1,bg2,acc,biome,gy,ei);
        for(let f=0;f<3;f++){const fx=w*(0.25+f*0.25),fy=h*(0.22+(f%2)*0.1),p=((t*0.5+f*0.33)%1);_cExplo(ctx,fx,fy,h*0.18,p);}
        _cConfetti(ctx,w,h,t,50);
        _mxStand(ctx,fA,w*0.36,gy,s2,t);_mxStand(ctx,fB,w*0.64,gy,s2,t+0.5);
        break;
    }
    if((tIdx%9)!==3) _mxForeground(ctx,w,h,gy,biome,acc,t);
    if(act==='laser'||act==='fall') _mxActionFx(ctx,w,h,gy,acc,act,t);
    if(prop==='ship'||prop==='crumbs'){
      // sky objects — drawn up high, not beside the character
      _mxProp(ctx, w*0.66, h*0.3, h*0.17, prop, t, acc);
    } else if(prop && (tIdx%9)!==7){
      const sc=tIdx%9;
      const AX=[0.3,0.62,0.22,0.5,0.6,0.42,0.32,0.5,0.38][sc];
      const side=AX<0.5?1:-1;
      const shift=(sc===1||sc===5)?vx:(sc===3?vx*0.4:0);
      _mxProp(ctx, AX*w+side*s2*0.95+shift, gy-s2*0.55, h*0.12, prop, t, acc);
    }
    _mxVignette(ctx,w,h);
  }
  return draw;
}

// Pick the visual template that best matches the words of a caption.
// Templates: 0 two-chars · 1 landscape · 2 explosion · 3 spotlight ·
//            4 chase · 5 calm · 6 battle · 7 discovery · 8 celebration
function _mxMood(s,ei){
  s=(' '+(s||'')+' ').toLowerCase();
  const has=arr=>arr.some(k=>s.indexOf(k)!==-1);
  // climax / happy ending → confetti
  if(has(['victor','triumph',' won ',' win ','wins','saved','save the','hero','cheer','party','trophy','celebrat','peace achieved','first place','champion',' best ','reward','graduat','five stars','happy','peace.','peace!']))return 8;
  // big disaster → explosion
  if(has(['explos','blast','missile','cannon','crash','destroy','meteor','earthquake','collaps','erupt','bomb','shatter','split open','overload','hit!']))return 2;
  // combat → sparks
  if(has(['attack','battle','fight','fought',' war ','warrior','weapon','army','roar','strike','swing','punch','kick',' sweep','laser','clash','defeat','showdown','duel','revenge',' vs ']))return 6;
  // motion → chase
  if(has([' run','chase','race','racing','sprint','escape','flee','leap','dash','jump','drift','surf','follow','tail','speed','flying',' fly','soar','warp','launch']))return 4;
  // finding something → discovery glow
  if(has(['discover','found','find','reveal','secret','mystery','appears','glow','crystal','signal','clue','sees','saw','notice','spot','detect','temple','treasure','scan',' map','figure','approach']))return 7;
  // dialogue (a quote or colon) — beats the calm check below
  const quote=s.indexOf('"')!==-1||s.indexOf(':')!==-1;
  const two=has(['together','both ','meet','versus','eye to eye','partnership','friend','allies','team','each other','enemies','they ','them ']);
  if(quote)return two?0:3;
  // quiet beats → calm
  if(has(['calm','peace','quiet','rest','tea','sunset','sunrise','sleep',' nap','smile','gentle','watch','sigh','slowly','softly','alone','reflect','waves','garden','water','bake','dream','relax','silence','rose','flower']))return 5;
  if(two)return 0;
  // neutral narration → single-character establishing / calm shots (no nonsense pairings)
  return (ei%2===0)?1:5;
}

// Expand every movie from 15 → 60 scenes
CINEMA_MOVIES.forEach(function(mv,mi){
  const vis=_MVIS[mi]||_MVIS[0];
  const bg1=vis[0],bg2=vis[1],acc=vis[2],fA=vis[3],fB=vis[4],biome=vis[5];
  const texts=_MXTRA[mi]||[];
  for(let si=mv.scenes.length;si<60;si++){
    const ei=si-15;
    const text=texts[ei]||'The story continues...';
    const tIdx=_mxMood(text,ei);
    let prop=_mxPropKind(text);
    // a scene is "about" character B if its caption names B → show B as the focus
    const bWords=_MCHARS[mi]||[];
    const lc=(' '+text.toLowerCase()+' ');
    const focusB=bWords.some(k=>lc.indexOf(k)!==-1);
    // don't draw a prop that just duplicates a character already in this movie
    if(prop==='pizza' && (fA===_cPizza||fB===_cPizza)) prop=null;
    const act=_mxActionKind(text);
    mv.scenes.push({dur:5,text,draw:_mxDraw(tIdx,bg1,bg2,acc,fA,fB,biome,prop,focusB,ei,act)});
  }
});

const CINEMA_SNACKS = [
  {id:'popcorn', name:'Popcorn',   emoji:'🍿',price:10, taste:'savory'},
  {id:'drink',   name:'Soda',      emoji:'🥤',price:8,  taste:'sweet'},
  {id:'candy',   name:'Candy',     emoji:'🍬',price:5,  taste:'sweet'},
  {id:'hotdog',  name:'Hot Dog',   emoji:'🌭',price:12, taste:'savory'},
  {id:'choc',    name:'Chocolate', emoji:'🍫',price:9,  taste:'sweet'},
  {id:'pretzel', name:'Pretzel',   emoji:'🥨',price:8,  taste:'savory'},
  {id:'lemon',   name:'Lemonade',  emoji:'🍋',price:6,  taste:'sour'},
  {id:'coffee',  name:'Coffee',    emoji:'☕',price:7,  taste:'bitter'},
  {id:'nachos',  name:'Nachos',   emoji:'🧀',price:11, taste:'spicy'},
];

// ─── HOTEL SYSTEM ─────────────────────────────────────────────────────────────
function openHotel() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('hotelSip').textContent = sipDollars.toLocaleString();
  document.getElementById('hotelModal').style.display = 'flex';
}
function closeHotel() {
  document.getElementById('hotelModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ─── AIRPORT ────────────────────────────────────────────────────────────────
// `flights` defaults to the Downtown airport's own destination list — passing a different real
// array (see openCountryAirport below) lets ANY airport, anywhere, sell real tickets through the
// exact same modal/booking/flight-animation code, with zero duplication.
let ACTIVE_FLIGHTS = AIRPORT_FLIGHTS;
const CAR_BRING_FEE = 50; // flat extra fee to bring your (first-owned) car along on any flight
function openAirport(flights) {
  ACTIVE_FLIGHTS = flights || AIRPORT_FLIGHTS;
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('airportSip').textContent = sipDollars.toLocaleString();
  const bringRow = document.getElementById('airportBringCarRow');
  bringRow.style.display = ownedCars.length ? 'block' : 'none';
  document.getElementById('airportBringCarFee').textContent = CAR_BRING_FEE;
  document.getElementById('airportBringCar').checked = false;
  const mealSelect = document.getElementById('airportMealSelect');
  mealSelect.innerHTML = FLIGHT_MEALS.map(m => `<option value="${m.id}">${m.emoji} ${m.name}</option>`).join('');
  mealSelect.value = 'chicken'; // default to an actual meal, not "no meal" — matches "you have to preorder" intent
  const list = document.getElementById('airportFlightList');
  list.innerHTML = '';
  ACTIVE_FLIGHTS.forEach((f, i) => {
    const canAfford = sipDollars >= f.price;
    const card = document.createElement('div');
    card.onclick = () => buyFlight(i);
    card.style.cssText = `background:#050e1a;border:2px solid ${canAfford?'#2255aa55':'#1a1a1a'};border-radius:10px;padding:12px 14px;cursor:${canAfford?'pointer':'not-allowed'};display:flex;align-items:center;gap:12px;opacity:${canAfford?1:0.5};transition:border-color 0.2s;`;
    if(canAfford){ card.onmouseover=()=>card.style.borderColor='#4488cc'; card.onmouseout=()=>card.style.borderColor='#2255aa55'; }
    card.innerHTML = `<span style="font-size:26px">${f.emoji}</span><div style="flex:1"><div style="color:#ddeeff;font-weight:bold;font-size:13px">${f.name}</div><div style="color:#334466;font-size:10px;margin-top:2px">${f.desc}</div></div><div style="color:#88ccff;font-weight:bold;font-size:15px;white-space:nowrap">${f.price} S.I.P.</div>`;
    list.appendChild(card);
  });
  document.getElementById('airportModal').style.display = 'flex';
}
function closeAirport() {
  document.getElementById('airportModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function buyFlight(idx) {
  const flight = ACTIVE_FLIGHTS[idx];
  const bringCar = ownedCars.length>0 && document.getElementById('airportBringCar').checked;
  const mealId = document.getElementById('airportMealSelect').value;
  const meal = FLIGHT_MEALS.find(m => m.id === mealId) || FLIGHT_MEALS[0];
  const total = flight.price + (bringCar ? CAR_BRING_FEE : 0);
  if(sipDollars < total) { showNotif(`❌ Need ${total} S.I.P. for this flight${bringCar?' (with your car)':''}!`); sfx.nope&&sfx.nope(); return; }
  sipDollars -= total; saveCurrentUser(); updateSIP();
  document.getElementById('airportModal').style.display = 'none';
  sfx.earn&&sfx.earn();
  startFlightAnim(flight, bringCar, meal);
}
// Every country now has its own real airport (item 154) — connects to the other 7 countries at a
// real discounted connector fare, plus a real flight straight back to Downtown, all through the
// exact same openAirport()/buyFlight()/startFlightAnim() the City Airport already uses.
function openCountryAirport(originName) {
  const flights = AIRPORT_FLIGHTS
    .filter(f => f.name !== originName)
    .map(f => ({ ...f, price: Math.max(20, Math.round(f.price*0.6)) }));
  // Real Downtown Airport door spot (matches enterAirportLounge('Downtown Explox', -200, -160, true)
  // below) — was off by 5 units before; harmless by luck (still outside the airport's own collider)
  // but now landing-by-plane and walking-out-the-door agree on the exact same real spot.
  flights.push({ name:'Downtown Explox', emoji:'🏠', desc:'Back to the city', price:30, x:-200, z:-160 });
  openAirport(flights);
}
// Real "normal airplane stuff" during the flight — a preordered meal (picked at booking, not
// during the flight — matches how real airlines work) and a seatback entertainment screen, not
// just a passive progress bar. Single shared state since only one flight can be active at a time
// (same pattern as _eatBusy/_iceCreamBusy above).
const FLIGHT_MEALS = [
  { id:'none',    emoji:'🚫', name:'No meal, thanks',  taste:null     },
  { id:'chicken', emoji:'🍗', name:'Chicken & Rice',   taste:'savory' },
  { id:'pasta',   emoji:'🍝', name:'Pasta Primavera',  taste:'savory' },
  { id:'veggie',  emoji:'🌯', name:'Veggie Wrap',      taste:'savory' },
  { id:'fish',    emoji:'🐟', name:'Fish & Rice',      taste:'savory' },
  { id:'kids',    emoji:'🧃', name:'Kids Snack Box',   taste:'sweet'  },
];
let flightShowingScreen = false, flightSceneKey = null, flightMeal = FLIGHT_MEALS[0], flightMealAvailable = false, flightMealServed = false, flightLandingWarned = false;
function serveFlightMeal() {
  if (!flightMealAvailable || flightMealServed || flightMeal.id === 'none') return;
  flightMealServed = true;
  eatFood(flightMeal.emoji, flightMeal.name, flightMeal.taste); // real eat animation + taste reaction, same system the Diner/Lounge use
  const btn = document.getElementById('flightSnackBtn');
  if (btn) { btn.textContent = `✅ Enjoyed your ${flightMeal.name}!`; btn.disabled = true; btn.style.cursor = 'default'; btn.style.color = '#66aa77'; btn.style.borderColor = '#335533'; }
}
function toggleFlightScreen() {
  flightShowingScreen = !flightShowingScreen;
  const btn = document.getElementById('flightScreenBtn');
  if (btn) btn.textContent = flightShowingScreen ? '🪟 Window View' : '📺 Watch Show';
}
function startFlightAnim(dest, bringCar, meal) {
  const overlay = document.getElementById('flightOverlay');
  overlay.style.display = 'block';
  document.getElementById('flightDestName').textContent = `${dest.emoji} ${dest.name}`;
  document.getElementById('flightDestDesc').textContent = dest.desc;

  // Reset the real in-flight service state for this flight
  flightShowingScreen = false; flightMealAvailable = false; flightMealServed = false; flightLandingWarned = false;
  flightMeal = meal || FLIGHT_MEALS[0];
  const sceneKeys = Object.keys(SCENE_LIBRARY);
  flightSceneKey = sceneKeys[Math.floor(Math.random()*sceneKeys.length)]; // reuses the SAME cartoon scenes Cinema/ExploxTube already draw — no new art system
  const screenBtn = document.getElementById('flightScreenBtn');
  if (screenBtn) screenBtn.textContent = '📺 Watch Show';
  const snackBtn = document.getElementById('flightSnackBtn');
  if (snackBtn) {
    snackBtn.disabled = true; snackBtn.style.cursor = 'not-allowed'; snackBtn.style.color = '#556677'; snackBtn.style.borderColor = '#334455';
    snackBtn.textContent = flightMeal.id === 'none' ? "🚫 You didn't preorder a meal" : `🍽️ ${flightMeal.name} is coming...`;
  }
  showNotif('🔔 Seatbelt sign is on — buckle up for takeoff!');

  const canvas = document.getElementById('flightWindowCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 700;
  canvas.height = canvas.offsetHeight || 280;

  // Deterministic clouds — no Math.random() so no flicker
  const clouds = Array.from({length:22}, (_,i) => {
    const s = i * 137.508;
    return { x: i*190+(s*0.4321%1)*100, y: 15+(s*0.3333%1)*90, r: 28+(s*0.2222%1)*45 };
  });
  const TOTAL_W = 22 * 190;
  const DURATION = 12000; // was 4500 — too short to notice you were even flying, let alone use the meal/screen
  const t0 = performance.now();
  let animId = null;

  function draw() {
    const W = canvas.width, H = canvas.height;
    const elapsed = performance.now() - t0;
    const prog = Math.min(elapsed / DURATION, 1);

    if (flightShowingScreen) {
      // In-flight entertainment — the real same SCENE_LIBRARY draw functions Cinema/ExploxTube use
      SCENE_LIBRARY[flightSceneKey](ctx, W, H, elapsed/1000);
    } else {
      const camX = prog * TOTAL_W * 0.55;

      // Sky gradient
      const skyG = ctx.createLinearGradient(0,0,0,H);
      skyG.addColorStop(0, `hsl(${210+prog*20},70%,${55-prog*15}%)`);
      skyG.addColorStop(0.7, `hsl(${200+prog*30},60%,${45-prog*15}%)`);
      skyG.addColorStop(1, `hsl(${190+prog*40},50%,${35-prog*10}%)`);
      ctx.fillStyle = skyG; ctx.fillRect(0,0,W,H);

      // Tiny ground strip far below
      ctx.fillStyle = '#1a3a0a'; ctx.fillRect(0, H*0.85, W, H*0.15);
      ctx.fillStyle = '#0d1f05'; ctx.fillRect(0, H*0.88, W, H*0.04);

      // Scrolling clouds
      clouds.forEach(c => {
        const cx = ((c.x - camX) % TOTAL_W + TOTAL_W) % TOTAL_W;
        if(cx > W + c.r*2) return;
        ctx.fillStyle = `rgba(255,255,255,${0.72+prog*0.1})`;
        ctx.beginPath();
        ctx.arc(cx,           c.y,          c.r*0.75, 0, Math.PI*2);
        ctx.arc(cx+c.r*0.55,  c.y-c.r*0.25, c.r*0.55, 0, Math.PI*2);
        ctx.arc(cx-c.r*0.45,  c.y+c.r*0.1,  c.r*0.45, 0, Math.PI*2);
        ctx.fill();
      });

      // Wing visible through window
      ctx.fillStyle = '#b8ccdd';
      ctx.beginPath();
      ctx.moveTo(W*0.22, H*0.83); ctx.lineTo(W*0.78, H*0.79);
      ctx.lineTo(W*0.82, H); ctx.lineTo(W*0.18, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7a8fa0';
      ctx.fillRect(W*0.54, H*0.81, W*0.13, H*0.04);
      ctx.fillRect(W*0.56, H*0.79, W*0.09, H*0.025);
    }

    // Flight progress bar
    document.getElementById('flightProgressBar').style.width = (prog*100)+'%';

    // Meal cart reaches you partway through the flight — real one-time state flip, not cosmetic
    if (!flightMealAvailable && prog >= 0.3) {
      flightMealAvailable = true;
      const btn = document.getElementById('flightSnackBtn');
      if (btn && flightMeal.id !== 'none') { btn.disabled = false; btn.textContent = `🍽️ Enjoy your ${flightMeal.name}`; btn.style.cursor = 'pointer'; btn.style.color = '#88ccff'; btn.style.borderColor = '#2a4a7a'; }
    }
    // Seatbelt sign back on for landing — a real flavor moment tied to actual flight progress
    if (!flightLandingWarned && prog >= 0.85) {
      flightLandingWarned = true;
      showNotif('🔔 Prepare for landing — seatbelt sign is back on!');
    }

    if(prog < 1) {
      animId = requestAnimationFrame(draw);
    } else {
      setTimeout(() => {
        overlay.style.display = 'none';
        playerGroup.position.set(dest.x, 0, dest.z);
        yaw = Math.PI;
        // Snap camera instantly — skip lerp by setting position directly
        const snapX = dest.x - Math.sin(yaw) * 9;
        const snapZ = dest.z - Math.cos(yaw) * 9;
        camera.position.set(snapX, 4, snapZ);
        if (bringCar) {
          carLocation = dest.name;
          saveCurrentUser();
          spawnOwnedCars();
          showNotif(`✈️ Welcome to ${dest.name}! Your car came with you — look for it parked nearby!`);
        } else {
          showNotif(`✈️ Welcome to ${dest.name}! Enjoy your visit!`);
        }
        if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
      }, 400);
    }
  }

  animId = requestAnimationFrame(draw);
  setTimeout(() => { if(overlay.style.display!=='none'){ cancelAnimationFrame(animId); overlay.style.display='none'; } }, DURATION + 4500); // real safety net, kept comfortably past DURATION so it never fires during a normal flight
}
function bookRoom(type) {
  const prices = { budget:40, standard:80, luxury:200 };
  const price = prices[type];
  if(sipDollars < price) { showNotif(`❌ Need ${price} S.I.P. to book this room!`); return; }
  sipDollars -= price; saveCurrentUser(); updateSIP();
  document.getElementById('hotelModal').style.display = 'none';
  inHotel = true;
  currentHotelRoom = type;
  const roomX = type==='luxury' ? HOTEL_SPAWN.x+60 : type==='standard' ? HOTEL_SPAWN.x+30 : HOTEL_SPAWN.x;
  playerGroup.position.set(roomX, 0, 0);
  yaw = Math.PI;
  camera.position.set(roomX, 4, 9); // snap camera — no lerp glide
  const label = type==='luxury'?'👑 Luxury Suite':type==='standard'?'✨ Standard Room':'🛏️ Budget Room';
  showNotif(`🏨 Welcome! Enjoy your ${label}!`);
  sfx.earn();
}
function checkoutHotel() {
  inHotel = false; currentHotelRoom = null;
  const cx = HOTEL_CITY_POS.x, cz = HOTEL_CITY_POS.z + 12;
  playerGroup.position.set(cx, 0, cz);
  yaw = Math.PI;
  camera.position.set(cx, 4, cz - 9); // snap camera outside hotel
  showNotif('🏨 Thanks for staying at City Hotel! Come back soon!');
}
function sleepInHotel() {
  const msgs = [
    '😴 You slept for 8 hours. Feel completely rested!',
    '💤 Dreamed about SIP coins falling from the sky!',
    '🌙 Best sleep ever. The pillow was ultra fluffy!',
    '😪 You woke up feeling like a million SIP!',
  ];
  showNotif(msgs[Math.floor(Date.now()/1000) % msgs.length]);
  sfx.earn();
}
function watchHotelTV() {
  const channels = [
    '📺 Explox City News: "SIP Market hits all-time high!"',
    '📺 Cooking Show: Chef makes a 5-star meal from city ingredients.',
    '📺 Car Races: Speed Racer wins the championship!',
    '📺 Weather Channel: Sunny skies over Explox City all week.',
    '📺 Documentary: The History of S.I.P. Currency.',
  ];
  showNotif(channels[Math.floor(Date.now()/1000) % channels.length]);
}

// ─── S.I.T.S. — SUPER IMPORTANT TRANSIT SYSTEM ────────────────────────────────
const SITS_ROUTES = [
  { id:'red',    name:'Red Line',    emoji:'🔴', tagline:'Uptown Express',    fare:2,
    stops:[
      { name:'City Bank',        x:-30, z:30,   emoji:'🏦' },
      { name:'Your House',       x:-30, z:-107, emoji:'🏠' },
      { name:'Shady Dealer',     x:34,  z:3,    emoji:'🕴️' },
    ]},
  { id:'blue',   name:'Blue Line',   emoji:'🔵', tagline:'Downtown Metro',    fare:3,
    stops:[
      { name:'Shopping Street',  x:60,  z:50,   emoji:'🛍️' },
      { name:'Pizza Restaurant', x:20,  z:80,   emoji:'🍕' },
      { name:'City Mall',        x:80,  z:-20,  emoji:'🏬' },
    ]},
  { id:'green',  name:'Green Line',  emoji:'🟢', tagline:'Eastside Route',    fare:2,
    stops:[
      { name:'Police Station',   x:-70, z:10,   emoji:'🚔' },
      { name:'Transit Hub',      x:0,   z:50,   emoji:'🚇' },
      { name:'City Bank',        x:-30, z:30,   emoji:'🏦' },
    ]},
  { id:'yellow', name:'Yellow Line', emoji:'🟡', tagline:'Westside Loop',     fare:4,
    stops:[
      { name:'Black Market',     x:-80, z:-71,  emoji:'⚫' },
      { name:'Police Station',   x:-70, z:10,   emoji:'🚔' },
      { name:'City Mall',        x:80,  z:-20,  emoji:'🏬' },
    ]},
  { id:'purple', name:'Purple Line', emoji:'🟣', tagline:'Cinema Express',    fare:3,
    stops:[
      { name:'Movie Theater',    x:50,  z:-85,  emoji:'🎬' },
      { name:'Shopping Street',  x:60,  z:50,   emoji:'🛍️' },
      { name:'Your House',       x:-30, z:-107, emoji:'🏠' },
    ]},
];

function openSITS() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('sitsSip').textContent = sipDollars.toLocaleString();
  const modal = document.getElementById('sitsModal');
  modal.style.display = 'block';
  _drawSITSMap();
  _buildSITSRoutes();
}

function closeSITS() {
  document.getElementById('sitsModal').style.display = 'none';
  document.getElementById('gameCanvas').requestPointerLock();
}

function buySITSTicket(routeId, stop) {
  const route = SITS_ROUTES.find(r => r.id === routeId);
  if(!route) return;
  if(sipDollars < route.fare) { showNotif(`❌ Need ${route.fare} S.I.P. for a ticket!`); return; }
  sipDollars -= route.fare;
  bankBalance += route.fare;
  saveCurrentUser();
  updateSIP();
  closeSITS();
  startBusRide(route, stop);
}

function startBusRide(route, destStop) {
  const LINE_COLORS = {red:'#ff4444',blue:'#4488ff',green:'#44cc44',yellow:'#ffcc00',purple:'#cc44ff'};
  const col = LINE_COLORS[route.id] || '#ffcc00';

  const overlay = document.getElementById('busRideOverlay');
  overlay.style.display = 'block';
  document.getElementById('busRouteBadge').innerHTML = `🚌 ${route.name.toUpperCase()} <span style="color:${col}">●</span>`;

  // Only visit stops up to and including the destination
  const destIdx = route.stops.findIndex(s => s.name === destStop.name);
  const stopsToVisit = route.stops.slice(0, destIdx + 1);

  // Build stops bar
  const stopsBar = document.getElementById('busStopsBar');
  stopsBar.innerHTML = '';
  stopsToVisit.forEach((s, i) => {
    if(i > 0) {
      const ln = document.createElement('div');
      ln.style.cssText = `flex:1;height:3px;background:${col}33;margin:0 4px;border-radius:2px;`;
      ln.id = `busLine_${i}`;
      stopsBar.appendChild(ln);
    }
    const dot = document.createElement('div');
    dot.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;min-width:54px;';
    dot.innerHTML = `<div id="busDot_${i}" style="width:14px;height:14px;border-radius:50%;background:#222;border:2px solid #333;transition:all 0.4s;"></div><div id="busLabel_${i}" style="color:#444;font-size:9px;text-align:center;max-width:54px;line-height:1.2;">${s.emoji}<br>${s.name}</div>`;
    stopsBar.appendChild(dot);
  });

  // Set up canvas
  const canvas = document.getElementById('busWindowCanvas');
  const ctx = canvas.getContext('2d');
  const setSize = () => { canvas.width = canvas.offsetWidth || 700; canvas.height = canvas.offsetHeight || 280; };
  setSize();

  // Pre-generate buildings (no Math.random in draw loop = no flicker)
  const BLD_COUNT = 60, BLD_GAP = 160;
  const buildings = Array.from({length: BLD_COUNT}, (_, i) => {
    const s = i * 137.508;
    const w = 40 + (s * 0.6180339 % 1) * 80;
    const h = 50 + (s * 0.3819660 % 1) * 140;
    const hue = 200 + (s * 0.1231 % 1) * 50;
    const wins = [];
    for(let wy = 10; wy < h - 20; wy += 18)
      for(let wx = 8; wx < w - 10; wx += 14)
        if((i * 17 + Math.floor(wy) * 7 + Math.floor(wx) * 3) % 10 > 3)
          wins.push([wx, wy]);
    return { x: i * BLD_GAP + (s * 0.5312 % 1) * 80, w, h, hue, wins };
  });
  const TOTAL_W = BLD_COUNT * BLD_GAP;

  let camX = 0, animId = null;

  function draw() {
    const W = canvas.width, H = canvas.height;
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
    sky.addColorStop(0, '#04030f'); sky.addColorStop(1, '#0c0820');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // Ground
    ctx.fillStyle = '#080808'; ctx.fillRect(0, H * 0.62, W, H);
    ctx.fillStyle = '#161616'; ctx.fillRect(0, H * 0.64, W, 2);
    // Road dashes
    ctx.fillStyle = '#1e1e1e';
    for(let i = 0; i < 14; i++) {
      const rx = ((i * 160 - camX * 0.15) % (W + 200) + W + 200) % (W + 200) - 100;
      ctx.fillRect(rx, H * 0.8, 70, 3);
    }
    // Buildings
    buildings.forEach(b => {
      const bx = ((b.x - camX % TOTAL_W) % TOTAL_W + TOTAL_W) % TOTAL_W;
      if(bx < W + b.w) {
        const by = H * 0.62 - b.h;
        ctx.fillStyle = `hsl(${b.hue},18%,9%)`; ctx.fillRect(bx, by, b.w, b.h);
        ctx.fillStyle = 'rgba(255,200,80,0.22)';
        b.wins.forEach(([wx, wy]) => ctx.fillRect(bx + wx, by + wy, 8, 10));
      }
    });
    // Vignette
    const vig = ctx.createRadialGradient(W/2, H/2, H * 0.15, W/2, H/2, H * 0.75);
    vig.addColorStop(0, 'transparent'); vig.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  function loop() { camX = (camX + 14) % TOTAL_W; draw(); animId = requestAnimationFrame(loop); }
  animId = requestAnimationFrame(loop);

  // Announce stops one by one
  function showStop(i) {
    const stop = stopsToVisit[i];
    const isLast = i === stopsToVisit.length - 1;
    document.getElementById('busNextStop').textContent = isLast ? '🛑 NOW ARRIVING' : '⏩ NEXT STOP';
    document.getElementById('busStopName').textContent = `${stop.emoji} ${stop.name}`;
    // Light up dot + line
    const dot = document.getElementById(`busDot_${i}`);
    if(dot) { dot.style.background = col; dot.style.borderColor = col; dot.style.boxShadow = `0 0 8px ${col}`; }
    const lbl = document.getElementById(`busLabel_${i}`);
    if(lbl) lbl.style.color = '#fff';
    if(i > 0) { const ln = document.getElementById(`busLine_${i}`); if(ln) ln.style.background = col; }

    setTimeout(() => {
      if(isLast) {
        cancelAnimationFrame(animId);
        overlay.style.display = 'none';
        playerGroup.position.set(stop.x, 0, stop.z);
        yaw = 0;
        showNotif(`🚌 Arrived at ${stop.emoji} ${stop.name}!`);
        sfx.earn();
      } else {
        showStop(i + 1);
      }
    }, isLast ? 2200 : 1800);
  }

  setTimeout(() => showStop(0), 400);
}

function _buildSITSRoutes() {
  const LINE_COLORS = {red:'#ff4444',blue:'#4488ff',green:'#44cc44',yellow:'#ffcc00',purple:'#cc44ff'};
  const container = document.getElementById('sitsRoutes');
  container.innerHTML = '';
  SITS_ROUTES.forEach(route => {
    const col = LINE_COLORS[route.id];
    const card = document.createElement('div');
    card.style.cssText = `background:#111820;border:2px solid ${col}44;border-radius:14px;margin-bottom:14px;overflow:hidden;`;
    // Route header
    const hdr = document.createElement('div');
    hdr.style.cssText = `background:${col}22;padding:12px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid ${col}33;`;
    hdr.innerHTML = `<span style="font-size:22px;">${route.emoji}</span><div><div style="color:${col};font-weight:bold;font-size:14px;">${route.name} — ${route.tagline}</div><div style="color:#888;font-size:11px;">🎟️ ${route.fare} S.I.P. per ride</div></div>`;
    card.appendChild(hdr);
    // Stops
    const stopRow = document.createElement('div');
    stopRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px;';
    route.stops.forEach(stop => {
      const btn = document.createElement('button');
      btn.style.cssText = `background:#0d1420;border:2px solid ${col}55;color:#ddd;border-radius:10px;padding:8px 14px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:6px;transition:background 0.2s;`;
      btn.innerHTML = `<span style="font-size:18px;">${stop.emoji}</span><span>${stop.name}</span><span style="color:${col};font-weight:bold;margin-left:4px;">🎟️ ${route.fare}</span>`;
      btn.onmouseenter = () => btn.style.background = `${col}22`;
      btn.onmouseleave = () => btn.style.background = '#0d1420';
      btn.onclick = () => buySITSTicket(route.id, stop);
      stopRow.appendChild(btn);
    });
    card.appendChild(stopRow);
    container.appendChild(card);
  });
}

function _drawSITSMap() {
  const canvas = document.getElementById('sitsMap');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);
  // Dark map background
  ctx.fillStyle = '#0d1420'; ctx.fillRect(0,0,W,H);
  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
  for(let i=0;i<W;i+=40){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke();}
  for(let i=0;i<H;i+=40){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(W,i);ctx.stroke();}
  // World → canvas mapping (world range ~-100 to 100 → canvas)
  const mx = x => (x + 100) / 200 * W;
  const mz = z => (z + 120) / 240 * H;
  const LINE_COLORS = {red:'#ff4444',blue:'#4488ff',green:'#44cc44',yellow:'#ffcc00',purple:'#cc44ff'};
  // Draw route lines
  SITS_ROUTES.forEach(route => {
    const col = LINE_COLORS[route.id];
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([8,4]); ctx.globalAlpha = 0.7;
    ctx.beginPath();
    route.stops.forEach((s,i) => { if(i===0) ctx.moveTo(mx(s.x),mz(s.z)); else ctx.lineTo(mx(s.x),mz(s.z)); });
    ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    // Stop dots
    route.stops.forEach(s => {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(mx(s.x),mz(s.z),5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(mx(s.x),mz(s.z),2,0,Math.PI*2); ctx.fill();
    });
  });
  // YOU ARE HERE dot
  const px = mx(playerGroup ? playerGroup.position.x : 0);
  const pz = mz(playerGroup ? playerGroup.position.z : -40);
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px,pz,7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(px,pz,4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
  ctx.fillText('YOU', px, pz-11);
  // Legend label
  ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'left';
  ctx.fillText('S.I.T.S. NETWORK MAP', 8, 16);
}

let cinemaState = {movie:null,snacks:[],phase:null,sceneIndex:0,sceneTimer:null,animFrame:null,trailerIndex:0,sceneStart:0};

function openCinema() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  sfx.cinema();
  cinemaState = {movie:null,snacks:[],phase:'lobby',sceneIndex:0,sceneTimer:null,animFrame:null,trailerIndex:0,sceneStart:0};
  document.getElementById('cinemaModal').style.display = 'flex';
  document.getElementById('cinemaLobby').style.display = 'block';
  document.getElementById('cinemaSnacks').style.display = 'none';
  document.getElementById('cinemaScreen').style.display = 'none';
  document.getElementById('cinemaSipLobby').textContent = sipDollars;
  buildMovieGrid();
}

function buildMovieGrid() {
  const grid = document.getElementById('movieGrid');
  grid.innerHTML = '';
  CINEMA_MOVIES.forEach((m,i) => {
    const card = document.createElement('div');
    card.style.cssText = `background:${m.bg};border:2px solid #333;border-radius:12px;padding:16px 12px;cursor:pointer;text-align:center;transition:border-color 0.2s;`;
    card.onmouseenter = () => card.style.borderColor='#ffcc00';
    card.onmouseleave = () => card.style.borderColor='#333';
    card.innerHTML = `<div style="font-size:32px;margin-bottom:6px;">${m.icons}</div>
      <div style="color:#fff;font-weight:bold;font-size:12px;margin-bottom:3px;">${m.title}</div>
      <div style="color:#aaa;font-size:10px;margin-bottom:8px;">${m.genre}</div>
      <div style="background:#e94560;color:#fff;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:bold;">🎟️ ${m.price} S.I.P.</div>`;
    card.onclick = () => selectCinemaMovie(i);
    grid.appendChild(card);
  });
}

function selectCinemaMovie(idx) {
  const m = CINEMA_MOVIES[idx];
  if(sipDollars < m.price) { showNotif(`❌ Need ${m.price} S.I.P. for a ticket!`); return; }
  sipDollars -= m.price; bankBalance += m.price; saveCurrentUser(); updateSIP();
  cinemaState.movie = m;
  cinemaState.movieIdx = idx;
  document.getElementById('cinemaLobby').style.display = 'none';
  document.getElementById('cinemaSnacks').style.display = 'block';
  document.getElementById('cinemaSnackSip').textContent = sipDollars;
  buildSnackBar();
}

function buildSnackBar() {
  const grid = document.getElementById('snackGrid');
  grid.innerHTML = '';
  CINEMA_SNACKS.forEach(s => {
    const card = document.createElement('div');
    card.style.cssText = 'background:#1a1a2e;border:2px solid #333;border-radius:10px;padding:12px;text-align:center;cursor:pointer;transition:border-color 0.2s;';
    card.onmouseenter = () => card.style.borderColor='#ffcc00';
    card.onmouseleave = () => card.style.borderColor='#333';
    card.innerHTML = `<div style="font-size:26px;">${s.emoji}</div><div style="color:#fff;font-size:12px;font-weight:bold;margin:4px 0;">${s.name}</div><div style="color:#ffcc00;font-size:11px;">${s.price} 💰</div>`;
    card.onclick = () => buyCinemaSnack(s);
    grid.appendChild(card);
  });
  updateSnackCart();
}

function buyCinemaSnack(s) {
  if(sipDollars < s.price) { showNotif(`❌ Need ${s.price} S.I.P.!`); return; }
  sipDollars -= s.price; bankBalance += s.price; saveCurrentUser(); updateSIP();
  cinemaState.snacks.push(s);
  document.getElementById('cinemaSnackSip').textContent = sipDollars;
  updateSnackCart();
  addToBag(s);
}

// ─── THE DINER — sit-down restaurant, buy a real meal & eat it ──────────────
const RESTAURANT_MENU = [
  { id:'burger',     name:'Burger',      emoji:'🍔', price:15, taste:'savory' },
  { id:'pizza_slice',name:'Pizza Slice', emoji:'🍕', price:12, taste:'savory' },
  { id:'pasta',      name:'Pasta',       emoji:'🍝', price:14, taste:'savory' },
  { id:'sushi',      name:'Sushi',       emoji:'🍣', price:18, taste:'savory' },
  { id:'taco',       name:'Taco',        emoji:'🌮', price:10, taste:'spicy'  },
  { id:'salad',      name:'Salad',       emoji:'🥗', price:8,  taste:'savory' },
  { id:'soup',       name:'Soup',        emoji:'🍲', price:9,  taste:'savory' },
  { id:'lemon_tart', name:'Lemon Tart',  emoji:'🍋', price:7,  taste:'sour'   },
  { id:'cake',       name:'Cake',        emoji:'🍰', price:11, taste:'sweet'  },
  { id:'coffee',     name:'Coffee',      emoji:'☕', price:5,  taste:'bitter' },
];
function openRestaurant() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('restaurantModal').style.display = 'flex';
  refreshRestaurantUI();
}
function closeRestaurant() {
  document.getElementById('restaurantModal').style.display = 'none';
}
function refreshRestaurantUI() {
  const list = document.getElementById('restaurantList');
  list.innerHTML = '';
  RESTAURANT_MENU.forEach((def, i) => {
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name}</div>
      <div class="siCost">💰 ${def.price} S.I.P.</div>
      <button class="shopBtn" onclick="buyRestaurantFood(${i})">Order</button>`;
    list.appendChild(d);
  });
}
function buyRestaurantFood(idx) {
  const def = RESTAURANT_MENU[idx];
  if(sipDollars < def.price) { sfx.nope(); showNotif(`❌ Need ${def.price} S.I.P.!`); return; }
  sipDollars -= def.price; bankBalance += def.price; saveCurrentUser(); updateSIP();
  sfx.buy();
  addToBag(def);
}

// ─── 5 MORE RESTAURANTS — real sit-down spots, same order→bag→C-to-eat pipeline as The Diner ──
// Reuses the EXACT same restaurantModal/addToBag/eatFromBag/tasteReaction chain The Diner already
// proved (item 92) — just generalized to a per-restaurant menu instead of one hardcoded global one,
// same pattern used for the 40 outfit boutiques sharing one shopOverlay.
const RESTAURANT_LOCATIONS = [
  { id:'sushi_bar', name:'Sushi Bar', emoji:'🍣', x:-20, z:200, wall:0x2a3a4a, accent:0xE8A94A, glass:0x9fd8e8,
    menu:[
      { id:'nigiri',      name:'Nigiri Set',    emoji:'🍣', price:20, taste:'savory' },
      { id:'sushi_roll',  name:'Sushi Roll',    emoji:'🍱', price:16, taste:'savory' },
      { id:'miso_soup',   name:'Miso Soup',     emoji:'🍲', price:6,  taste:'savory' },
      { id:'edamame',     name:'Edamame',       emoji:'🫛', price:5,  taste:'savory' },
      { id:'wasabi_kick', name:'Extra Wasabi',  emoji:'🌶️', price:2,  taste:'spicy'  },
      { id:'mochi',       name:'Mochi',         emoji:'🍡', price:7,  taste:'sweet'  },
    ]},
  { id:'taco_cantina', name:'Taco Cantina', emoji:'🌮', x:20, z:260, wall:0xdd8833, accent:0x8B3A1A, glass:0xffeecc,
    menu:[
      { id:'street_taco', name:'Street Taco',   emoji:'🌮', price:9,  taste:'spicy'  },
      { id:'burrito',      name:'Burrito',      emoji:'🌯', price:14, taste:'savory' },
      { id:'nachos',       name:'Nachos',       emoji:'🧀', price:11, taste:'savory' },
      { id:'quesadilla',   name:'Quesadilla',   emoji:'🫓', price:12, taste:'savory' },
      { id:'salsa_hot',    name:'Hot Salsa',    emoji:'🔥', price:3,  taste:'spicy'  },
      { id:'churro',       name:'Churro',       emoji:'🥖', price:6,  taste:'sweet'  },
    ]},
  { id:'noodle_house', name:'Noodle House', emoji:'🍜', x:-20, z:320, wall:0xaa3333, accent:0xFFD34D, glass:0xffd8c0,
    menu:[
      { id:'ramen',        name:'Ramen',         emoji:'🍜', price:15, taste:'savory' },
      { id:'pad_thai',     name:'Pad Thai',      emoji:'🍝', price:14, taste:'savory' },
      { id:'dumplings',    name:'Dumplings',     emoji:'🥟', price:10, taste:'savory' },
      { id:'spring_roll',  name:'Spring Roll',   emoji:'🥢', price:7,  taste:'savory' },
      { id:'chili_oil',    name:'Chili Oil Kick',emoji:'🌶️', price:2,  taste:'spicy'  },
      { id:'bubble_tea',   name:'Bubble Tea',    emoji:'🧋', price:8,  taste:'sweet'  },
    ]},
  { id:'french_bistro', name:'French Bistro', emoji:'🥐', x:20, z:380, wall:0xe8dcc0, accent:0x2C4A6E, glass:0xcfe0ff,
    menu:[
      { id:'croissant',    name:'Croissant',     emoji:'🥐', price:6,  taste:'savory' },
      { id:'quiche',       name:'Quiche',        emoji:'🥧', price:13, taste:'savory' },
      { id:'onion_soup',   name:'Onion Soup',    emoji:'🍲', price:11, taste:'savory' },
      { id:'baguette',     name:'Baguette',      emoji:'🥖', price:5,  taste:'savory' },
      { id:'creme_brulee', name:'Crème Brûlée',  emoji:'🍮', price:12, taste:'sweet'  },
      { id:'espresso',     name:'Espresso',      emoji:'☕', price:5,  taste:'bitter' },
    ]},
  { id:'burger_shack', name:'Burger Shack', emoji:'🍔', x:-20, z:440, wall:0x883322, accent:0xF2C230, glass:0xffe8a0,
    menu:[
      { id:'classic_burger', name:'Classic Burger', emoji:'🍔', price:14, taste:'savory' },
      { id:'cheese_fries',   name:'Cheese Fries',   emoji:'🍟', price:9,  taste:'savory' },
      { id:'onion_rings',    name:'Onion Rings',    emoji:'🧅', price:8,  taste:'savory' },
      { id:'hot_dog',        name:'Hot Dog',        emoji:'🌭', price:10, taste:'savory' },
      { id:'milkshake',      name:'Milkshake',      emoji:'🥤', price:7,  taste:'sweet'  },
      { id:'pickle_spear',   name:'Pickle Spear',   emoji:'🥒', price:3,  taste:'sour'   },
    ]},
];
function openThemedRestaurant(id) {
  const r = RESTAURANT_LOCATIONS.find(r => r.id === id);
  if (!r) return;
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('restaurantModalTitle').textContent = `${r.emoji} ${r.name}`;
  document.getElementById('restaurantModal').style.display = 'flex';
  const list = document.getElementById('restaurantList');
  list.innerHTML = '';
  r.menu.forEach((def, i) => {
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name}</div>
      <div class="siCost">💰 ${def.price} S.I.P.</div>
      <button class="shopBtn" onclick="buyThemedFood('${r.id}',${i})">Order</button>`;
    list.appendChild(d);
  });
}
function buyThemedFood(restaurantId, idx) {
  const r = RESTAURANT_LOCATIONS.find(r => r.id === restaurantId);
  if (!r) return;
  const def = r.menu[idx];
  if (sipDollars < def.price) { sfx.nope(); showNotif(`❌ Need ${def.price} S.I.P.!`); return; }
  sipDollars -= def.price; bankBalance += def.price; saveCurrentUser(); updateSIP();
  sfx.buy();
  addToBag(def);
}

function updateSnackCart() {
  const el = document.getElementById('snackCart');
  if(!el) return;
  el.textContent = cinemaState.snacks.length === 0
    ? 'No snacks yet — click to grab something!'
    : 'Your bag: ' + cinemaState.snacks.map(s=>s.emoji).join(' ');
}

function startTrailer() {
  cinemaState.phase = 'trailer'; cinemaState.trailerIndex = 0;
  document.getElementById('cinemaSnacks').style.display = 'none';
  document.getElementById('cinemaScreen').style.display = 'block';
  document.getElementById('cinemaSkip').style.display = 'block';
  document.getElementById('cinemaClose').style.display = 'none';
  const cv = document.getElementById('cinemaCanvas');
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  playTrailerSlide();
}

function playTrailerSlide() {
  if(cinemaState.phase !== 'trailer') return;
  const slides = cinemaState.movie.trailer;
  if(cinemaState.trailerIndex >= slides.length) { startCinemaMovie(); return; }
  const slide = slides[cinemaState.trailerIndex];
  drawTrailerSlide(slide.text);
  cinemaState.sceneTimer = setTimeout(() => { cinemaState.trailerIndex++; playTrailerSlide(); }, slide.dur);
}

function drawTrailerSlide(text) {
  const cv = document.getElementById('cinemaCanvas');
  const ctx = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  ctx.fillStyle = '#000'; ctx.fillRect(0,0,w,h);
  // Stars
  for(let i=0;i<80;i++){
    ctx.fillStyle=`rgba(255,255,255,${0.2+Math.random()*0.6})`;
    ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h,0.5+Math.random()*1.5,0,Math.PI*2); ctx.fill();
  }
  // Border frame
  ctx.strokeStyle='#ffcc00'; ctx.lineWidth=4;
  ctx.strokeRect(30,30,w-60,h-60);
  // Studio
  ctx.fillStyle='rgba(255,204,0,0.7)'; ctx.font=`bold ${Math.max(12,w/60)}px Arial`; ctx.textAlign='center';
  ctx.fillText('EXPLOX CINEMAS PRESENTS', w/2, h/2-55);
  // Main text
  ctx.fillStyle='#fff'; ctx.font=`bold ${Math.max(18,w/35)}px Arial`;
  ctx.strokeStyle='rgba(0,0,0,0.8)'; ctx.lineWidth=4;
  ctx.strokeText(text, w/2, h/2); ctx.fillText(text, w/2, h/2);
}

function startCinemaMovie() {
  cinemaState.phase = 'movie'; cinemaState.sceneIndex = 0; cinemaState.sceneStart = performance.now();
  cinemaState.playedSounds = new Set();
  cinemaState.narratedScene = -1;
  animateCinemaScene();
}

function animateCinemaScene() {
  if(cinemaState.phase !== 'movie') return;
  const scenes = cinemaState.movie.scenes;
  if(cinemaState.sceneIndex >= scenes.length) { showCinemaCredits(); return; }
  const scene = scenes[cinemaState.sceneIndex];
  const cv = document.getElementById('cinemaCanvas');
  const ctx = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const t = (performance.now() - cinemaState.sceneStart) / 1000;

  scene.draw(ctx, w, h, t);

  // Scene sound effects — trigger each sound once at its timestamp
  if(!cinemaState.playedSounds) cinemaState.playedSounds = new Set();
  const snds = (CINEMA_SOUNDS[cinemaState.movieIdx] || [])[cinemaState.sceneIndex] || [];
  snds.forEach((s, i) => {
    const key = cinemaState.sceneIndex + '_' + i;
    if(t >= s.t && !cinemaState.playedSounds.has(key)) {
      cinemaState.playedSounds.add(key);
      if(sfx[s.fn]) sfx[s.fn]();
    }
  });

  // Narrator — speak scene text once, 0.4s after scene starts so sounds play first
  if(cinemaState.narratedScene !== cinemaState.sceneIndex && t > 0.4) {
    cinemaState.narratedScene = cinemaState.sceneIndex;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(scene.text);
    const voices = [{rate:0.82,pitch:0.65},{rate:0.88,pitch:1.1},{rate:1.05,pitch:1.25},{rate:0.76,pitch:0.88},{rate:0.9,pitch:0.7},{rate:0.95,pitch:1.3},{rate:0.78,pitch:0.6},{rate:1.1,pitch:0.85},{rate:0.92,pitch:1.0},{rate:1.0,pitch:1.2},{rate:0.85,pitch:0.72},{rate:1.08,pitch:1.28},{rate:1.0,pitch:0.95},{rate:0.8,pitch:0.8}];
    const v = voices[cinemaState.movieIdx] || {rate:0.88,pitch:1};
    utt.rate = v.rate; utt.pitch = v.pitch; utt.volume = 0.85;
    window.speechSynthesis.speak(utt);
  }

  // Cinematic black bars
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,w,h*0.07); ctx.fillRect(0,h*0.93,w,h*0.07);

  // Scene number dots
  ctx.fillStyle='rgba(255,255,255,0.2)';
  scenes.forEach((_,i)=>{
    ctx.beginPath();
    ctx.arc(w/2 + (i-(scenes.length-1)/2)*18, h*0.91, cinemaState.sceneIndex===i?5:3, 0,Math.PI*2);
    ctx.fillStyle = cinemaState.sceneIndex===i ? '#ffcc00':'rgba(255,255,255,0.4)';
    ctx.fill();
  });

  // Narration text (fade in)
  const alpha = Math.min(1, t*1.5);
  ctx.fillStyle=`rgba(255,255,255,${alpha})`; ctx.textAlign='center';
  ctx.font=`bold ${Math.max(15,w/45)}px Arial`;
  ctx.strokeStyle=`rgba(0,0,0,${alpha*0.9})`; ctx.lineWidth=3;
  ctx.strokeText(scene.text, w/2, h*0.86); ctx.fillText(scene.text, w/2, h*0.86);

  if(t >= scene.dur) {
    sfx.scene();
    cinemaState.sceneIndex++;
    cinemaState.sceneStart = performance.now();
    cinemaState.playedSounds = new Set();
  }
  cinemaState.animFrame = requestAnimationFrame(animateCinemaScene);
}

function showCinemaCredits() {
  cinemaState.phase = 'credits';
  sfx.credits();
  window.speechSynthesis.cancel();
  setTimeout(() => {
    const utt = new SpeechSynthesisUtterance('The End.');
    utt.rate = 0.7; utt.pitch = 0.8; utt.volume = 0.9;
    window.speechSynthesis.speak(utt);
  }, 800);
  if(cinemaState.animFrame) cancelAnimationFrame(cinemaState.animFrame);
  const cv = document.getElementById('cinemaCanvas');
  const ctx = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#fff'; ctx.textAlign='center';
  ctx.font=`bold ${Math.max(28,w/22)}px Arial`;
  ctx.fillText('✦  THE END  ✦', w/2, h/2 - 36);
  ctx.fillStyle='#ffcc00'; ctx.font=`${Math.max(13,w/50)}px Arial`;
  const snackLine = cinemaState.snacks.length>0
    ? 'You enjoyed: '+cinemaState.snacks.map(s=>s.emoji).join(' ')
    : 'Hope you enjoyed the show!';
  ctx.fillText(snackLine, w/2, h/2 + 10);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font=`${Math.max(10,w/75)}px Arial`;
  ctx.fillText('AN EXPLOX CINEMAS PRODUCTION  •  '+cinemaState.movie.title.toUpperCase(), w/2, h/2+48);
  document.getElementById('cinemaSkip').style.display='none';
  document.getElementById('cinemaClose').style.display='block';
}

function skipCinemaPhase() {
  if(cinemaState.sceneTimer) clearTimeout(cinemaState.sceneTimer);
  if(cinemaState.animFrame) cancelAnimationFrame(cinemaState.animFrame);
  if(cinemaState.phase==='trailer') { startCinemaMovie(); }
  else if(cinemaState.phase==='movie') {
    cinemaState.sceneIndex++;
    if(cinemaState.sceneIndex >= cinemaState.movie.scenes.length) showCinemaCredits();
    else { cinemaState.sceneStart=performance.now(); cinemaState.animFrame=requestAnimationFrame(animateCinemaScene); }
  }
}

function closeCinema() {
  if(cinemaState.sceneTimer) clearTimeout(cinemaState.sceneTimer);
  if(cinemaState.animFrame) cancelAnimationFrame(cinemaState.animFrame);
  window.speechSynthesis.cancel();
  cinemaState = {movie:null,snacks:[],phase:null,sceneIndex:0,sceneTimer:null,animFrame:null,trailerIndex:0,sceneStart:0};
  document.getElementById('cinemaModal').style.display='none';
}

function shopOrRob(name, cost, robGain) {
  if(alignment === 'bad') robShop(name, robGain);
  else buyItem(name, cost);
}

// Deaths are PERMANENT only for the original 24 background NPC_DEFS. The 40 Suburbs friends
// (npc.job is only ever set on them) are exempt on purpose — same principle as the elders in
// item 106: anyone the player invests in (befriended, married off, hired, invited home) should
// never be able to just disappear. Background citizens don't carry that relationship weight, so
// they're where the actual "you can kill someone" consequence lives.
let deadNPCs = {}; // persisted — {name: {x,z}} death location, so buildNPCs() can leave a grave instead of respawning them
let graveMeshes = {}; // NOT persisted — {name:[meshes]}, rebuilt from deadNPCs every session
function buildGrave(name, x, z) {
  if(graveMeshes[name]) graveMeshes[name].forEach(m => scene.remove(m));
  const made = [];
  made.push(box(0.6, 0.9, 0.15, 0x999999, x, 0.45, z));
  const cv = document.createElement('canvas'); cv.width=160; cv.height=60;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#eee'; cx.fillRect(0,0,160,60);
  cx.fillStyle = '#333'; cx.font = 'bold 13px Arial'; cx.textAlign='center'; cx.textBaseline='middle';
  cx.fillText(name, 80, 22);
  cx.font = '11px Arial'; cx.fillText('Rest in peace 🕊️', 80, 42);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.42), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
  plaque.position.set(x, 0.85, z + 0.09);
  scene.add(plaque);
  made.push(plaque);
  graveMeshes[name] = made;
}
// ─── COMBAT — real player health + hit-for-hit fighting, not an instant kill ──
const WEAPON_DAMAGE = { none:5, bat:15, sword:25, axe:35, stiletto:20, club:12, metalsword:40, battleaxe:45, crystalsword:55,
  emphammer:18, plasmacutter:22, railspike:28 };
function getWeaponDamage() { return WEAPON_DAMAGE[playerWeapon] !== undefined ? WEAPON_DAMAGE[playerWeapon] : WEAPON_DAMAGE.none; }
// Robo Arsenal weapons hit ROBOTS far harder than their WEAPON_DAMAGE entry above (which is what
// they do to people) — real specialization, not a strictly-better weapon. Every other weapon deals
// its normal damage to robots too, unchanged.
const ROBOT_BONUS_DAMAGE = { emphammer:54, plasmacutter:77, railspike:112 };
function getRobotDamage() { return ROBOT_BONUS_DAMAGE[playerWeapon] !== undefined ? ROBOT_BONUS_DAMAGE[playerWeapon] : getWeaponDamage(); }
function updateHealthBar() {
  const pct = Math.max(0, Math.min(100, (playerHealth/playerMaxHealth)*100));
  document.getElementById('healthBarFill').style.width = pct+'%';
  document.getElementById('healthText').textContent = `${Math.round(playerHealth)}/${playerMaxHealth} HP`;
}
function damagePlayer(amount, sourceLabel) {
  if(playerHealth <= 0) return;
  const armorDef = ARMOR.find(a => a.id === playerArmor);
  const finalAmount = armorDef ? Math.round(amount * (1 - armorDef.reduction)) : amount;
  playerHealth = Math.max(0, playerHealth - finalAmount);
  updateHealthBar();
  const flash = document.getElementById('hitFlash');
  flash.style.opacity = '1';
  setTimeout(() => { flash.style.opacity = '0'; }, 140);
  const blockedNote = armorDef ? ` (${armorDef.name} blocked ${amount-finalAmount})` : '';
  showNotif(`💥 -${finalAmount} HP${sourceLabel ? ' from '+sourceLabel : ''}!${blockedNote}`);
  sfx.hit();
  if(playerHealth <= 0) knockoutPlayer();
}
function knockoutPlayer() {
  showNotif('😵 Knocked out! Waking up at home...');
  playerGroup.position.set(HOUSE_DOOR.x, 0, HOUSE_DOOR.z + 3);
  yaw = 0;
  playerHealth = playerMaxHealth;
  updateHealthBar();
}
// Slow passive regen while below max — same tick* pattern as tickJob/tickCook/tickWanted.
function tickHealth(dt) {
  if(playerHealth > 0 && playerHealth < playerMaxHealth) {
    playerHealth = Math.min(playerMaxHealth, playerHealth + dt*1.5);
    updateHealthBar();
  }
}
function attackNPC(npc) {
  if(npc.isDown) { showNotif(`${npc.name} is already down!`); return; }
  const isCop = npc.role === 'Officer';
  if(npc.combatHp === undefined) npc.combatHp = npc.job ? 30 : (isCop ? 60 : 40);

  const dmg = getWeaponDamage();
  npc.combatHp -= dmg;
  triggerSwing();
  sfx.hit();

  if(npc.combatHp > 0) {
    // NPC fights back — real risk for the player, not a free hit each time.
    const backDmg = Math.round((isCop ? 8 : 5) + Math.random()*(isCop?10:6));
    showNotif(`⚔️ Hit ${npc.name} for ${dmg}! (${Math.max(0,npc.combatHp)} HP left)`);
    damagePlayer(backDmg, npc.name);
    return;
  }
  defeatNPC(npc);
}
// Extracted so a car ram (item 160) can trigger the EXACT same real consequences as melee combat
// — grave, wanted level, S.I.P. — instead of a separate, inconsistent death path.
function defeatNPC(npc) {
  const isCop = npc.role === 'Officer';
  if(npc.job) {
    // One of the 40 Suburbs friends — always just a temporary knockdown, never permanent.
    npc.isDown = true;
    npc.group.rotation.z = Math.PI / 2;
    npc.group.position.y = -0.5;
    sipDollars += 10;
    updateSIP();
    increaseWanted(1);
    showNotif(`💥 Defeated ${npc.name}! +10 S.I.P.`);
    setTimeout(() => {
      npc.isDown = false;
      npc.group.rotation.z = 0;
      npc.group.position.y = 0;
      npc.combatHp = undefined; // fresh fight next time
    }, 12000);
    return;
  }
  // A background citizen/officer — this one is real and permanent.
  const pay = isCop ? 4 : 10;
  const x = npc.group.position.x, z = npc.group.position.z;
  scene.remove(npc.group);
  const i = npcs.indexOf(npc); if(i > -1) npcs.splice(i, 1);
  deadNPCs[npc.name] = { x, z };
  saveCurrentUser();
  buildGrave(npc.name, x, z);
  sipDollars += pay;
  updateSIP();
  showNotif(`💥 ...🪦 Nobody's noticed yet.`);
  // Nobody finds out right away — the wanted level (and the officers reacting to it) only
  // kicks in after a real delay, instead of instantly like the old knockdown-only version did.
  const delaySec = 15 + Math.random() * 20;
  setTimeout(() => {
    increaseWanted(isCop ? 2 : 1);
    showNotif(`🚨 Someone found out what happened to ${npc.name}. Police are on alert!`);
  }, delaySec * 1000);
}

function tickWanted(dt) {
  // Cool down shop robbery timers
  for(const shop in robbedCooldowns) {
    if(robbedCooldowns[shop] > 0) robbedCooldowns[shop] -= dt;
  }
  if(!wantedLevel || inMall || inHouse) return;
  // Officers chase the player
  for(const npc of npcs) {
    if(npc.role !== 'Officer' || npc.isDown) continue;
    const dx = playerGroup.position.x - npc.group.position.x;
    const dz = playerGroup.position.z - npc.group.position.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    if(dist < 2.5) { arrest(); return; }
    const chaseSpeed = 0.05 + wantedLevel * 0.02;
    npc.group.position.x += (dx/dist) * chaseSpeed;
    npc.group.position.z += (dz/dist) * chaseSpeed;
    npc.group.rotation.y = Math.atan2(dx, dz);
  }
}

function toggleAlignment() {
  if(alignment === 'good') {
    alignment = 'bad';
    document.getElementById('alignmentHud').style.display = 'block';
    showNotif('😈 You joined the underground. The Black Market is now open.');
  } else {
    alignment = 'good';
    document.getElementById('alignmentHud').style.display = 'none';
    showNotif('😇 You went straight. Stay clean.');
  }
  saveCurrentUser();
}

function openBlackMarket() {
  if(alignment !== 'bad') { showNotif('🚫 You don\'t belong here. Only bad guys allowed.'); return; }
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('shopOverlay').style.display = 'flex';
  document.getElementById('shopTitle').textContent = '🕴️ Black Market';
  const items = document.getElementById('shopItems');
  items.innerHTML = '';
  BLACK_MARKET_ITEMS.forEach((item, i) => {
    const already = item.weaponId && ownedWeapons.includes(item.weaponId);
    const d = document.createElement('div'); d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${item.name}</div><div class="siCost">💰 ${item.cost} S.I.P.</div>
      <button class="shopBtn" ${already?'disabled':''} onclick="buyBlackMarketItem(${i})">${already?'Owned':'Buy'}</button>`;
    items.appendChild(d);
  });
}

function buyBlackMarketItem(idx) {
  const item = BLACK_MARKET_ITEMS[idx];
  if(sipDollars < item.cost) { showNotif('❌ Not enough S.I.P.!'); return; }
  sipDollars -= item.cost;
  if(item.sipReward) { sipDollars += item.sipReward; showNotif(`💰 Laundered! +${item.sipReward} S.I.P.`); }
  if(item.weaponId) {
    if(!ownedWeapons.includes(item.weaponId)) ownedWeapons.push(item.weaponId);
    playerWeapon = item.weaponId;
    updateWeaponMesh();
    showNotif(`🗡️ Got the ${item.name}!`);
  }
  if(item.shirtId) { playerShirt = item.shirtId; buildPlayer(); showNotif(`🥷 New look equipped!`); }
  updateSIP();
  openBlackMarket();
}

function tickCook(dt) {
  const hud = document.getElementById('jobHud');
  if(cookState === 'has_ingredients') { hud.textContent = '🧺 Have ingredients — go prep!'; hud.style.color = '#88ff88'; }
  else if(cookState === 'prepared')   { hud.textContent = '✅ Prepped — go cook!'; hud.style.color = '#FFD700'; }
  else if(cookState === 'ready')      { hud.textContent = '🍕 Deliver to a customer!'; hud.style.color = '#ff6600'; }
}

// ─── OUTFIT & WEAPON SHOPS ───────────────────────────────────────────────────
const OUTFITS = [
  { name:'Street Red',  cost:40,  shirt:'#e74c3c', pants:'#2c3e50', shoes:'#444444' },
  { name:'All Black',   cost:60,  shirt:'#111111', pants:'#111111', shoes:'#222222' },
  { name:'Ninja',       cost:80,  shirt:'#1a1a1a', pants:'#1a1a1a', shoes:'#111111' },
  { name:'Ocean Blue',  cost:70,  shirt:'#0088cc', pants:'#005599', shoes:'#003366' },
  { name:'Space Suit',  cost:120, shirt:'#aaccdd', pants:'#6688aa', shoes:'#445566' },
  { name:'Golden Star', cost:200, shirt:'#FFD700', pants:'#DAA520', shoes:'#b8860b' },
];
const WEAPONS = [
  { id:'bat',      name:'⚾ Baseball Bat', cost:50,  color:0x8B4513 },
  { id:'sword',    name:'⚔️ Sword',        cost:100, color:0xcccccc },
  { id:'axe',      name:'🪓 Axe',          cost:180, color:0x888888 },
  { id:'stiletto', name:'🗡️ Stiletto',     cost:0,   color:0x444444, blackMarketOnly:true },
  { id:'club',     name:'🏏 Wooden Club',  cost:0,   color:0x8B5A2B, craftOnly:true },
  { id:'metalsword', name:'🗡️ Metal Sword', cost:0, color:0xdddddd, craftOnly:true },
  { id:'battleaxe',  name:'🪓 Battle Axe',   cost:0, color:0x99aabb, craftOnly:true },
  { id:'crystalsword', name:'💎 Crystal Sword', cost:0, color:0x99eeff, craftOnly:true },
  // Robo Arsenal (The Scrapyard) — specialized anti-robot gear: weak against people, devastating
  // against ROBOT_TYPES/rogue robots (see ROBOT_BONUS_DAMAGE) so buying one is a real trade-off,
  // not a strictly-better weapon.
  { id:'emphammer',    name:'⚡ EMP Hammer',   cost:250, color:0x00ffcc, robotShopOnly:true },
  { id:'plasmacutter', name:'🔥 Plasma Cutter',cost:500, color:0xff6600, robotShopOnly:true },
  { id:'railspike',    name:'🔩 Rail Spike',   cost:900, color:0x8899ff, robotShopOnly:true },
];
// Real damage reduction, not a cosmetic — applied for real in damagePlayer().
const ARMOR = [
  { id:'leather', name:'🥋 Leather Armor', cost:80,  reduction:0.15, color:0x8B5A2B },
  { id:'iron',    name:'🛡️ Iron Armor',    cost:250, reduction:0.30, color:0x999999 },
  { id:'gold',    name:'👑 Golden Armor',  cost:600, reduction:0.45, color:0xFFD700 },
  { id:'scrap',   name:'🔩 Scrap Armor',   cost:0,   reduction:0.35, color:0x667788, craftOnly:true },
  { id:'titanium',name:'🦾 Titanium Armor',cost:0,   reduction:0.50, color:0xcfd8e0, craftOnly:true },
];

function openShop(type) {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('shopOverlay').style.display = 'flex';
  document.getElementById('shopTitle').textContent = type==='outfits' ? '👗 Outfit Shop' : type==='armor' ? '🛡️ Armor Shop' : type==='paint' ? '🎨 Body Paint' : type==='robotweapons' ? '🤖 Robo Arsenal' : '⚔️ Weapon Shop';
  const items = document.getElementById('shopItems');
  items.innerHTML = '';
  if(type==='outfits') {
    OUTFITS.forEach((o,i) => {
      const d = document.createElement('div'); d.className='shopItem';
      d.innerHTML=`<div class="siName">${o.name}</div>
        <div class="siCost">💰 ${o.cost} S.I.P.</div>
        <div class="siSwatch" style="display:flex;gap:4px;margin:4px 0">
          <div style="width:18px;height:18px;background:${o.shirt};border-radius:3px"></div>
          <div style="width:18px;height:18px;background:${o.pants};border-radius:3px"></div>
          <div style="width:18px;height:18px;background:${o.shoes};border-radius:3px"></div>
        </div>
        <button class="shopBtn" onclick="buyOutfit(${i})">Buy</button>`;
      items.appendChild(d);
    });
  } else if(type==='armor') {
    ARMOR.filter(a => !a.craftOnly).forEach((a) => {
      const realIdx = ARMOR.indexOf(a);
      const owned = ownedArmor.includes(a.id);
      const equipped = playerArmor === a.id;
      const d = document.createElement('div'); d.className='shopItem';
      d.innerHTML=`<div class="siName">${a.name}</div>
        <div class="siCost">${owned ? (equipped?'✅ Equipped':'✔ Owned') : '💰 '+a.cost+' S.I.P.'} — blocks ${Math.round(a.reduction*100)}% damage</div>
        <button class="shopBtn" onclick="buyArmor(${realIdx})" ${equipped?'disabled':''}>${owned?(equipped?'Equipped':'Equip'):'Buy'}</button>`;
      items.appendChild(d);
    });
    const unequip = document.createElement('div'); unequip.className='shopItem';
    unequip.innerHTML = `<div class="siName">🚫 No Armor</div><button class="shopBtn" onclick="equipArmor('none')" ${playerArmor==='none'?'disabled':''}>${playerArmor==='none'?'Equipped':'Unequip'}</button>`;
    items.appendChild(unequip);
  } else if(type==='paint') {
    BODY_PAINTS.forEach((p,i) => {
      const current = playerColors.skin.toLowerCase() === p.color.toLowerCase();
      const d = document.createElement('div'); d.className='shopItem';
      d.innerHTML=`<div class="siName">${p.name}</div>
        <div class="siSwatch" style="width:28px;height:18px;background:${p.color};border-radius:3px;margin:4px 0;border:1px solid #666;"></div>
        <div class="siCost">${current ? '✅ Current' : (p.cost ? '💰 '+p.cost+' S.I.P.' : 'Free')}</div>
        <button class="shopBtn" onclick="buyBodyPaint(${i})" ${current?'disabled':''}>${current?'Applied':'Paint'}</button>`;
      items.appendChild(d);
    });
  } else if(type==='robotweapons') {
    WEAPONS.filter(w => w.robotShopOnly).forEach((w) => {
      const realIdx = WEAPONS.indexOf(w);
      const owned = ownedWeapons.includes(w.id);
      const equipped = playerWeapon === w.id;
      const d = document.createElement('div'); d.className='shopItem';
      d.innerHTML=`<div class="siName">${w.name}</div>
        <div class="siCost">${owned ? (equipped?'✅ Equipped':'✔ Owned') : '💰 '+w.cost+' S.I.P.'} — ${WEAPON_DAMAGE[w.id]} dmg to people, 🤖 ${ROBOT_BONUS_DAMAGE[w.id]} dmg to robots</div>
        <button class="shopBtn" onclick="buyWeapon(${realIdx})" ${equipped?'disabled':''}>${owned?(equipped?'Equipped':'Equip'):'Buy'}</button>`;
      items.appendChild(d);
    });
  } else {
    WEAPONS.filter(w => !w.blackMarketOnly && !w.craftOnly && !w.robotShopOnly).forEach((w,i) => {
      const realIdx = WEAPONS.indexOf(w);
      const owned = ownedWeapons.includes(w.id);
      const equipped = playerWeapon === w.id;
      const d = document.createElement('div'); d.className='shopItem';
      d.innerHTML=`<div class="siName">${w.name}</div>
        <div class="siCost">${owned ? (equipped?'✅ Equipped':'✔ Owned') : '💰 '+w.cost+' S.I.P.'}</div>
        <button class="shopBtn" onclick="buyWeapon(${realIdx})" ${equipped?'disabled':''}>${owned?(equipped?'Equipped':'Equip'):'Buy'}</button>`;
      items.appendChild(d);
    });
  }
}
function closeShop() { document.getElementById('shopOverlay').style.display='none'; }
function buyArmor(i) {
  const a = ARMOR[i];
  if(ownedArmor.includes(a.id)) { equipArmor(a.id); openShop('armor'); return; }
  if(sipDollars < a.cost) { showNotif(`❌ Need ${a.cost} S.I.P.`); return; }
  sipDollars -= a.cost; updateSIP();
  ownedArmor.push(a.id);
  equipArmor(a.id);
  showNotif(`✅ Got ${a.name}!`);
  openShop('armor');
}
function equipArmor(id) {
  playerArmor = id;
  updateArmorMesh();
  saveCurrentUser();
}
function updateArmorMesh() {
  if(!playerGroup) return;
  if(player.armorMesh) { playerGroup.remove(player.armorMesh); player.armorMesh=null; }
  if(playerArmor==='none') return;
  const def = ARMOR.find(a=>a.id===playerArmor);
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.62,0.55,0.42), new THREE.MeshLambertMaterial({color:def.color}));
  chest.position.set(0,1.35,0.03);
  playerGroup.add(chest);
  player.armorMesh = chest;
}

// ── Body Paint — real skin tones/colors, recolors the actual live character mesh ──
const BODY_PAINTS = [
  { name:'Classic Tan',  cost:0,   color:'#f5c89a' },
  { name:'Fair',         cost:0,   color:'#ffe0bd' },
  { name:'Deep Brown',   cost:0,   color:'#8d5524' },
  { name:'Olive',        cost:0,   color:'#c68642' },
  { name:'Ghost White',  cost:50,  color:'#f0f0f5' },
  { name:'Zombie Green', cost:80,  color:'#7cb342' },
  { name:'Vampire Pale', cost:80,  color:'#d9c7c7' },
  { name:'Ocean Blue',   cost:100, color:'#4a90d9' },
  { name:'Alien Purple', cost:100, color:'#9b59b6' },
  { name:'Robot Silver', cost:120, color:'#b0b8c1' },
  { name:'Lava Red',     cost:120, color:'#e63946' },
  { name:'Golden',       cost:200, color:'#FFD700' },
];
function buyBodyPaint(i) {
  const p = BODY_PAINTS[i];
  if(sipDollars < p.cost) { showNotif(`❌ Need ${p.cost} S.I.P.`); return; }
  sipDollars -= p.cost; updateSIP();
  repaintSkin(p.color);
  sfx.buy();
  showNotif(`🎨 Painted ${p.name}!`);
  openShop('paint');
}
function repaintSkin(hexColor) {
  playerColors.skin = hexColor;
  document.getElementById('skinColor').value = hexColor;
  const c = c3(hexColor);
  if(player.skinMeshes) player.skinMeshes.forEach(m => m.material.color.setHex(c));
  saveCurrentUser();
}

function buyOutfit(i) {
  const o = OUTFITS[i];
  if(sipDollars < o.cost) { showNotif(`❌ Need ${o.cost} S.I.P.`); return; }
  sipDollars -= o.cost; updateSIP();
  playerColors.shirt = o.shirt; playerColors.pants = o.pants; playerColors.shoes = o.shoes;
  document.getElementById('shirtColor').value = o.shirt;
  document.getElementById('pantsColor').value = o.pants;
  document.getElementById('shoeColor').value  = o.shoes;
  showNotif(`✅ Wearing ${o.name}!`);
  closeShop();
}
function buyWeapon(i) {
  const w = WEAPONS[i];
  if(ownedWeapons.includes(w.id)) { equipWeapon(w.id); closeShop(); return; }
  if(sipDollars < w.cost) { showNotif(`❌ Need ${w.cost} S.I.P.`); return; }
  sipDollars -= w.cost; updateSIP();
  ownedWeapons.push(w.id);
  equipWeapon(w.id);
  showNotif(`✅ Got ${w.name}!`);
  closeShop();
}

// ─── 40 OUTFIT SHOPS (Fashion Wing) ────────────────────────────────────────────
// 10 real themes, 4 name variations each = 40 shops. Every shop in a theme sells that
// theme's SAME small outfit list (unlike the 300-shop system, a themed clothing line
// doesn't need per-branch item rotation — 4 real branches carrying the same collection
// is how real clothing chains work). Buying still does the real thing OUTFITS always
// did: recolors your actual character (shirt/pants/shoes), not a decorative inventory add.
const OUTFIT_CATEGORIES = [
  { id:'sporty', category:'Sporty', emoji:'🏀',
    nameTemplates:['{word} Sports Wear','The {word} Athletic Shop','{word} Team Gear','{word} Varsity Outfitters'],
    nameWords:['Champion','Blitz','Rally','Victory'], ad:'Gear up and look the part!',
    outfits:[
      {name:'Team Red',   cost:30, shirt:'#c0392b', pants:'#2c3e50', shoes:'#ffffff'},
      {name:'Team Blue',  cost:30, shirt:'#2980b9', pants:'#2c3e50', shoes:'#ffffff'},
      {name:'Track Star', cost:50, shirt:'#e67e22', pants:'#1a1a1a', shoes:'#e67e22'},
      {name:'Varsity',    cost:70, shirt:'#8e44ad', pants:'#f5f5f5', shoes:'#8e44ad'},
      {name:'MVP Gold',   cost:90, shirt:'#FFD700', pants:'#1a1a1a', shoes:'#FFD700'},
    ]},
  { id:'formal', category:'Formal', emoji:'🤵',
    nameTemplates:['{word} Formal Wear','The {word} Suit Shop','{word} Black Tie Boutique','{word} Elegance'],
    nameWords:['Sterling','Windsor','Prestige','Monarch'], ad:'Dress to impress, every time!',
    outfits:[
      {name:'Classic Black Tie', cost:70,  shirt:'#111111', pants:'#111111', shoes:'#000000'},
      {name:'Navy Suit',         cost:80,  shirt:'#1b2a4a', pants:'#12203a', shoes:'#0a0a0a'},
      {name:'White Tux',         cost:120, shirt:'#f5f5f5', pants:'#1a1a1a', shoes:'#111111'},
      {name:'Silver Gala',       cost:140, shirt:'#c0c0c8', pants:'#2a2a2a', shoes:'#1a1a1a'},
      {name:'Midnight Formal',   cost:150, shirt:'#0d0d1a', pants:'#0d0d1a', shoes:'#000000'},
    ]},
  { id:'punk', category:'Punk', emoji:'🎸',
    nameTemplates:['{word} Punk Outfitters','The {word} Rebel Shop','{word} Studs & Spikes','{word} Underground'],
    nameWords:['Riot','Venom','Havoc','Grit'], ad:'Break the rules in style!',
    outfits:[
      {name:'Studded Black', cost:40, shirt:'#1a1a1a', pants:'#0d0d0d', shoes:'#333333'},
      {name:'Ripped Denim',  cost:50, shirt:'#2c3e50', pants:'#34495e', shoes:'#1a1a1a'},
      {name:'Skull Print',   cost:60, shirt:'#222222', pants:'#111111', shoes:'#555555'},
      {name:'Rebel Red',     cost:65, shirt:'#a3131f', pants:'#1a1a1a', shoes:'#1a1a1a'},
      {name:'Neon Mohawk',   cost:100,shirt:'#39ff14', pants:'#1a1a1a', shoes:'#39ff14'},
    ]},
  { id:'pastel', category:'Pastel', emoji:'🌸',
    nameTemplates:['{word} Pastel Corner','The {word} Sweet Shop','{word} Soft Style','{word} Dreamy Threads'],
    nameWords:['Blossom','Cloud','Sugar','Petal'], ad:'Soft colors, sweet style!',
    outfits:[
      {name:'Cotton Candy',   cost:30, shirt:'#ffc9de', pants:'#e6c9ff', shoes:'#ffffff'},
      {name:'Lavender Dream', cost:35, shirt:'#d6c9ff', pants:'#b8a6e0', shoes:'#f5f0ff'},
      {name:'Mint Breeze',    cost:35, shirt:'#c8f0e0', pants:'#a0e0c8', shoes:'#ffffff'},
      {name:'Baby Blue',      cost:40, shirt:'#c9e6ff', pants:'#a6c9e0', shoes:'#ffffff'},
      {name:'Blush Pink',     cost:45, shirt:'#ffd9e0', pants:'#f5b8c0', shoes:'#ffffff'},
    ]},
  { id:'neon', category:'Neon Rave', emoji:'💡',
    nameTemplates:['{word} Neon Outfits','The {word} Glow Shop','{word} Rave Wear','{word} Electric Threads'],
    nameWords:['Volt','Pulse','Flash','Neon'], ad:'Light up the room!',
    outfits:[
      {name:'Electric Green', cost:50, shirt:'#39ff14', pants:'#1a1a1a', shoes:'#39ff14'},
      {name:'Ultraviolet',    cost:60, shirt:'#a020f0', pants:'#1a1a1a', shoes:'#a020f0'},
      {name:'Neon Pink Pulse',cost:70, shirt:'#ff10f0', pants:'#1a1a1a', shoes:'#ff10f0'},
      {name:'Laser Blue',     cost:80, shirt:'#10e0ff', pants:'#1a1a1a', shoes:'#10e0ff'},
      {name:'Glow Stick',     cost:110,shirt:'#ffff33', pants:'#1a1a1a', shoes:'#ffff33'},
    ]},
  { id:'military', category:'Military', emoji:'🎖️',
    nameTemplates:['{word} Tactical Gear','The {word} Camo Shop','{word} Ops Outfitters','{word} Field Wear'],
    nameWords:['Ranger','Recon','Bravo','Falcon'], ad:'Mission-ready style!',
    outfits:[
      {name:'Woodland',       cost:60,  shirt:'#4a5c33', pants:'#3a4a28', shoes:'#2a2a2a'},
      {name:'Desert Tan',     cost:70,  shirt:'#c2a670', pants:'#a68a58', shoes:'#4a3a28'},
      {name:'Urban Grey',     cost:80,  shirt:'#5a5a5a', pants:'#3a3a3a', shoes:'#1a1a1a'},
      {name:'Night Ops',      cost:110, shirt:'#1a1f1a', pants:'#0d100d', shoes:'#000000'},
      {name:'Special Forces', cost:140, shirt:'#3a4a2a', pants:'#1a1a1a', shoes:'#2a2a2a'},
    ]},
  { id:'royal', category:'Royal', emoji:'👑',
    nameTemplates:['{word} Royal Wardrobe','The {word} Crown Shop','{word} Majesty Boutique','{word} Regal Wear'],
    nameWords:['Windsor','Sterling','Regent','Noble'], ad:'Dress like royalty!',
    outfits:[
      {name:'Crimson Crown',   cost:100, shirt:'#8b0000', pants:'#5a0000', shoes:'#FFD700'},
      {name:'Royal Purple',    cost:120, shirt:'#5d1a8b', pants:'#3a0d5a', shoes:'#FFD700'},
      {name:'Golden Majesty',  cost:160, shirt:'#FFD700', pants:'#8b6b00', shoes:'#FFD700'},
      {name:'Emerald Throne',  cost:180, shirt:'#046307', pants:'#023a04', shoes:'#FFD700'},
      {name:'Silver Sovereign',cost:220, shirt:'#c0c0c8', pants:'#8a8a90', shoes:'#FFD700'},
    ]},
  { id:'beach', category:'Beach', emoji:'🏖️',
    nameTemplates:['{word} Beach Wear','The {word} Tropical Shop','{word} Sun & Sand','{word} Island Threads'],
    nameWords:['Wave','Palm','Coral','Breeze'], ad:'Beach vibes all day!',
    outfits:[
      {name:'Sunset Orange', cost:30, shirt:'#ff8c42', pants:'#f5f5f5', shoes:'#ffffff'},
      {name:'Ocean Teal',    cost:35, shirt:'#14b8a6', pants:'#f5f5f5', shoes:'#ffffff'},
      {name:'Tropical Yellow',cost:40,shirt:'#ffd93d', pants:'#f5f5f5', shoes:'#ffffff'},
      {name:'Coral Reef',    cost:45, shirt:'#ff6f61', pants:'#f5f5f5', shoes:'#ffffff'},
      {name:'Palm Green',    cost:50, shirt:'#2d9d5a', pants:'#f5f5f5', shoes:'#ffffff'},
    ]},
  { id:'winter', category:'Winter', emoji:'❄️',
    nameTemplates:['{word} Winter Wear','The {word} Frost Shop','{word} Cozy Outfitters','{word} Snow Threads'],
    nameWords:['Frost','Arctic','Cocoa','Blizzard'], ad:'Stay cozy, stay stylish!',
    outfits:[
      {name:'Frost White',  cost:40, shirt:'#f5f5f5', pants:'#dcdcdc', shoes:'#888888'},
      {name:'Arctic Blue',  cost:50, shirt:'#a8d0e6', pants:'#5a8ab0', shoes:'#2a3a4a'},
      {name:'Cocoa Brown',  cost:55, shirt:'#6b4423', pants:'#4a2f18', shoes:'#2a1a0d'},
      {name:'Holiday Red',  cost:60, shirt:'#b22222', pants:'#1a3a1a', shoes:'#2a2a2a'},
      {name:'Snowy Grey',   cost:65, shirt:'#b0b8c0', pants:'#7a828a', shoes:'#3a3a3a'},
    ]},
  { id:'superhero', category:'Superhero', emoji:'🦸',
    nameTemplates:['{word} Hero Outfitters','The {word} Cape Shop','{word} Super Wear','{word} Powers Boutique'],
    nameWords:['Blaze','Titan','Nova','Guardian'], ad:'Every hero needs a look!',
    outfits:[
      {name:'Hero Red',        cost:60,  shirt:'#d10000', pants:'#0033a0', shoes:'#FFD700'},
      {name:'Shadow Vigilante',cost:80,  shirt:'#1a1a1a', pants:'#1a1a1a', shoes:'#333333'},
      {name:'Cosmic Blue',     cost:100, shirt:'#0033a0', pants:'#001a5a', shoes:'#FFD700'},
      {name:'Toxic Green',     cost:120, shirt:'#39ff14', pants:'#1a1a1a', shoes:'#39ff14'},
      {name:'Golden Guardian', cost:160, shirt:'#FFD700', pants:'#8b6b00', shoes:'#FFD700'},
    ]},
];
// 10 categories x 4 name variations = 40 shops. Every shop in a category shares that
// category's outfit list (see comment above) so `outfits` is just a reference, not a copy.
function generateOutfitShops() {
  const shops = [];
  OUTFIT_CATEGORIES.forEach(cat => {
    cat.nameTemplates.forEach((tpl, k) => {
      shops.push({
        id: 'outfit_' + cat.id + '_' + k,
        name: tpl.replace('{word}', cat.nameWords[k]),
        category: cat.category, emoji: cat.emoji, ad: cat.ad, outfits: cat.outfits,
      });
    });
  });
  return shops;
}
let OUTFIT_SHOPS = []; // filled by buildOutfitShopWing() — 40 shop objects, looked up by id from openOutfitBoutique()
// Builds the "Fashion Wing" through a new doorway in the mall atrium's LEFT wall, extending
// further west (more negative x). Same reasoning as the Shopping Wing (item 109): this pocket
// interior now lives in its own isolated 10,000-unit lane (item 110), so there's nothing out
// there to run into in any direction — verified by construction, not by re-checking neighbors.
// 8 cols x 5 rows = 40 storefronts, axes swapped from buildMallShopWing (this wing runs along X,
// storefronts face +x back toward the doorway) since it extends west instead of south.
function buildOutfitShopWing() {
  OUTFIT_SHOPS = generateOutfitShops();
  const mx = MALL_SPAWN.x, mz = 0;
  const X0 = mx - 33, FAR = mx - 33 - 120, HALF_D = 60;
  const depth = X0 - FAR, centerX = (X0 + FAR) / 2;

  box(depth, 0.1, HALF_D * 2, 0xf5f5f0, centerX, 0, mz);
  box(depth, 0.4, HALF_D * 2, 0xeeeeee, centerX, 11, mz);
  box(depth, 11, 0.5, 0xe8e8e8, centerX, 5.5, mz - HALF_D);
  box(depth, 11, 0.5, 0xe8e8e8, centerX, 5.5, mz + HALF_D);
  box(0.5, 11, HALF_D * 2, 0xe8e8e8, FAR, 5.5, mz);
  addCol(MALL_COLS, centerX, mz - HALF_D, depth / 2, 1);
  addCol(MALL_COLS, centerX, mz + HALF_D, depth / 2, 1);
  addCol(MALL_COLS, FAR, mz, 1, HALF_D);

  const FCOLS = 8, FCOL_SPACING = 11, FROW_SPACING = 13;
  // Each shop gets a real 2-color theme (pastel body + a deeper accent of the same hue for the
  // roof trim and logo ring), not just one flat color repeated everywhere on the storefront.
  const THEMES = [
    { wall:0xF4C2C2, accent:0xE08A8A }, { wall:0xC2D4F4, accent:0x7A9EDD },
    { wall:0xD8C2F4, accent:0xA47ADD }, { wall:0xC2F4D8, accent:0x6ADD9E },
    { wall:0xF4E2C2, accent:0xDDB56A }, { wall:0xC2F4F0, accent:0x6ADDD5 },
    { wall:0xF4C2E2, accent:0xDD6ABA }, { wall:0xE0E0E0, accent:0xA0A0A0 },
  ];
  OUTFIT_SHOPS.forEach((shop, i) => {
    const col = i % FCOLS, row = Math.floor(i / FCOLS);
    const z = mz + (col - (FCOLS - 1) / 2) * FCOL_SPACING;
    const x = X0 - 20 - row * FROW_SPACING;
    const theme = THEMES[i % THEMES.length];

    box(5, 4.5, 7, theme.wall, x, 2.25, z);              // body
    box(6, 0.4, 8, theme.accent, x, 4.7, z);             // roof cap
    box(0.15, 2.2, 4.5, 0xAEE3FF, x + 2.55, 1.6, z);    // glass front, facing back toward the doorway
    buildLogoSign(shop.name, shop.emoji, '#'+theme.wall.toString(16).padStart(6,'0'), '#'+theme.accent.toString(16).padStart(6,'0'), x + 2.7, 5, z, -Math.PI / 2);

    addCol(MALL_COLS, x, z, 3, 3.8);
    MALL_ZONES.push({ x: x + 3, z, r: 3.2, label: `${shop.emoji} ${shop.name}`, action: () => openOutfitBoutique(shop.id) });
  });

  for (let r = 0; r < 5; r++) {
    const pl = new THREE.PointLight(0xfff5e0, 0.3, 20);
    pl.position.set(X0 - 20 - r * FROW_SPACING, 9.5, mz);
    scene.add(pl);
  }
}
// Opens the SAME shopOverlay/shopItems DOM the original single Outfit Shop already used —
// generalized to show one specific boutique's outfit list instead of the hardcoded global
// OUTFITS array. Buying still does the real thing: recolors your actual character.
function openOutfitBoutique(id) {
  const shop = OUTFIT_SHOPS.find(s => s.id === id);
  if (!shop) return;
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('shopOverlay').style.display = 'flex';
  document.getElementById('shopTitle').textContent = `${shop.emoji} ${shop.name}`;
  const items = document.getElementById('shopItems');
  items.innerHTML = `<div style="text-align:center;color:#ffd54a;font-style:italic;font-size:12px;margin-bottom:8px;">"${shop.ad}"</div>`;
  shop.outfits.forEach((o, i) => {
    const d = document.createElement('div'); d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${o.name}</div>
      <div class="siCost">💰 ${o.cost} S.I.P.</div>
      <div class="siSwatch" style="display:flex;gap:4px;margin:4px 0">
        <div style="width:18px;height:18px;background:${o.shirt};border-radius:3px"></div>
        <div style="width:18px;height:18px;background:${o.pants};border-radius:3px"></div>
        <div style="width:18px;height:18px;background:${o.shoes};border-radius:3px"></div>
      </div>
      <button class="shopBtn" onclick="buyBoutiqueOutfit('${shop.id}',${i})">Buy</button>`;
    items.appendChild(d);
  });
}
function buyBoutiqueOutfit(shopId, i) {
  const shop = OUTFIT_SHOPS.find(s => s.id === shopId);
  if (!shop) return;
  const o = shop.outfits[i];
  if (sipDollars < o.cost) { showNotif(`❌ Need ${o.cost} S.I.P.`); return; }
  sipDollars -= o.cost; updateSIP();
  playerColors.shirt = o.shirt; playerColors.pants = o.pants; playerColors.shoes = o.shoes;
  document.getElementById('shirtColor').value = o.shirt;
  document.getElementById('pantsColor').value = o.pants;
  document.getElementById('shoeColor').value  = o.shoes;
  showNotif(`✅ Wearing ${o.name}!`);
  saveCurrentUser();
  closeShop();
}
function equipWeapon(id) {
  playerWeapon = id;
  updateWeaponMesh();
  saveCurrentUser();
}
function updateWeaponMesh() {
  if(!playerGroup) return;
  if(player.weaponGroup) { playerGroup.remove(player.weaponGroup); player.weaponGroup=null; }
  if(playerWeapon==='none') return;
  const g = new THREE.Group();
  if(playerWeapon==='bat') {
    const m=new THREE.Mesh(new THREE.BoxGeometry(0.12,1.0,0.12),new THREE.MeshLambertMaterial({color:0x8B4513}));
    g.add(m);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(0.14,6,6),new THREE.MeshLambertMaterial({color:0x8B4513}));
    cap.position.set(0,0.55,0); g.add(cap);
  } else if(playerWeapon==='sword') {
    const blade=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.9,0.08),new THREE.MeshLambertMaterial({color:0xdddddd}));
    blade.position.set(0,0.15,0); g.add(blade);
    const guard=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.06,0.06),new THREE.MeshLambertMaterial({color:0xaa8800}));
    guard.position.set(0,-0.3,0); g.add(guard);
  } else if(playerWeapon==='axe') {
    const handle=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.8,0.08),new THREE.MeshLambertMaterial({color:0x5c3a1e}));
    g.add(handle);
    const head=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.32,0.08),new THREE.MeshLambertMaterial({color:0x888888}));
    head.position.set(0.18,0.4,0); g.add(head);
  } else if(playerWeapon==='metalsword') {
    const blade=new THREE.Mesh(new THREE.BoxGeometry(0.09,1.1,0.1),new THREE.MeshLambertMaterial({color:0xeeeeee}));
    blade.position.set(0,0.2,0); g.add(blade);
    const guard=new THREE.Mesh(new THREE.BoxGeometry(0.46,0.08,0.08),new THREE.MeshLambertMaterial({color:0x667788}));
    guard.position.set(0,-0.35,0); g.add(guard);
  } else if(playerWeapon==='battleaxe') {
    const handle=new THREE.Mesh(new THREE.BoxGeometry(0.09,1.0,0.09),new THREE.MeshLambertMaterial({color:0x4a3520}));
    g.add(handle);
    const headL=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.42,0.07),new THREE.MeshLambertMaterial({color:0x99aabb}));
    headL.position.set(-0.2,0.42,0); g.add(headL);
    const headR=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.42,0.07),new THREE.MeshLambertMaterial({color:0x99aabb}));
    headR.position.set(0.2,0.42,0); g.add(headR);
  } else if(playerWeapon==='crystalsword') {
    const blade=new THREE.Mesh(new THREE.BoxGeometry(0.1,1.15,0.1),new THREE.MeshLambertMaterial({color:0x99eeff, emissive:0x2266aa}));
    blade.position.set(0,0.22,0); g.add(blade);
    const tip=new THREE.Mesh(new THREE.ConeGeometry(0.09,0.25,4),new THREE.MeshLambertMaterial({color:0xccf5ff, emissive:0x3388cc}));
    tip.position.set(0,0.92,0); g.add(tip);
    const guard=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.08,0.08),new THREE.MeshLambertMaterial({color:0xffd700}));
    guard.position.set(0,-0.35,0); g.add(guard);
  } else if(playerWeapon==='emphammer') {
    const handle=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.85,0.09),new THREE.MeshLambertMaterial({color:0x336677}));
    g.add(handle);
    const head=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.28,0.28),new THREE.MeshLambertMaterial({color:0x00ffcc, emissive:0x00aa88}));
    head.position.set(0,0.42,0); g.add(head);
  } else if(playerWeapon==='plasmacutter') {
    const handle=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.55,0.1),new THREE.MeshLambertMaterial({color:0x333333}));
    g.add(handle);
    const blade=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.7,6),new THREE.MeshLambertMaterial({color:0xff6600, emissive:0xcc3300}));
    blade.position.set(0,0.55,0); g.add(blade);
  } else if(playerWeapon==='railspike') {
    const handle=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.6,0.1),new THREE.MeshLambertMaterial({color:0x445566}));
    g.add(handle);
    const spike=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.9,4),new THREE.MeshLambertMaterial({color:0x8899ff, emissive:0x3344aa}));
    spike.position.set(0,0.75,0); g.add(spike);
  } else if(playerWeapon==='club') {
    const handle=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.55,0.1),new THREE.MeshLambertMaterial({color:0x6b4423}));
    g.add(handle);
    const head=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.4,0.22),new THREE.MeshLambertMaterial({color:0x8B5A2B}));
    head.position.set(0,0.45,0); g.add(head);
  } else if(playerWeapon==='stiletto') {
    const blade=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.65,0.04),new THREE.MeshLambertMaterial({color:0x888899}));
    blade.position.set(0,0.1,0); g.add(blade);
    const tip=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.14,0.04),new THREE.MeshLambertMaterial({color:0xaaaacc}));
    tip.position.set(0,0.44,0); g.add(tip);
    const hilt=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.06,0.06),new THREE.MeshLambertMaterial({color:0x111122}));
    hilt.position.set(0,-0.22,0); g.add(hilt);
  }
  g.position.set(0.7,1.0,0.2); g.rotation.z=-0.2;
  playerGroup.add(g); player.weaponGroup=g;
}

// ─── SHOP SYSTEM ─────────────────────────────────────────────────────────────
const ITEM_INFO = {
  'Coffee Shop':  { emoji:'☕', id:'coffee'    },
  'Toy Store':    { emoji:'🧸', id:'toy'       },
  'Pizza Place':  { emoji:'🍕', id:'pizza'     },
  'Jewelry':      { emoji:'💍', id:'jewelry'   },
  'Phone':        { emoji:'📱', id:'phone'     },
  'Ice Cream':    { emoji:'🍦', id:'ice_cream' },
};

function addToInventory(id, name, emoji) {
  if(playerInventory[id]) {
    playerInventory[id].qty++;
  } else {
    playerInventory[id] = { name, emoji, qty:1 };
  }
}

function buyItem(name, cost) {
  if(sipDollars < cost) { sfx.nope(); showNotif(`❌ Need ${cost} S.I.P. — you have ${sipDollars}`); return; }
  sipDollars -= cost;
  updateSIP();
  const info = ITEM_INFO[name] || { emoji:'📦', id: name.toLowerCase().replace(/\s+/g,'_') };
  addToInventory(info.id, name, info.emoji);
  saveCurrentUser();
  sfx.buy();
  showNotif(`✅ ${info.emoji} Bought ${name} for ${cost} S.I.P.!`);
}

// ─── CAR SYSTEM ──────────────────────────────────────────────────────────────
const CAR_CATALOG = [
  { id:'city_cruiser', name:'City Cruiser',  emoji:'🚗', color:0xdd3333, price:2000,  speed:22 },
  { id:'gold_cab',     name:'Gold Cab',      emoji:'🚕', color:0xFFD700, price:3500,  speed:24 },
  { id:'off_roader',   name:'Off-Roader',    emoji:'🚙', color:0x336633, price:5000,  speed:26 },
  { id:'speed_racer',  name:'Speed Racer',   emoji:'🏎', color:0x2244ff, price:8000,  speed:38 },
  { id:'diamond_limo', name:'Diamond Limo',  emoji:'💎', color:0x44ddff, price:20000, speed:30 },
];

function buildCar(def, x, z, yawAngle) {
  const g = new THREE.Group();
  function b(w,h,d,color,px,py,pz) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color));
    m.position.set(px,py,pz); m.castShadow=true; g.add(m);
  }
  b(4.2,1.3,8.5, def.color,     0,  0.65, 0);    // body
  b(3.2,1.4,4.5, def.color,     0,  2.05,-0.5);  // cabin
  b(3.1,1.2,0.2, 0x88ccff,      0,  1.75, 1.8);  // windshield
  b(3.1,1.1,0.2, 0x88ccff,      0,  1.75,-2.8);  // rear window
  b(4.4,0.4,0.5, 0x888888,      0,  0.2,  4.5);  // front bumper
  b(4.4,0.4,0.5, 0x888888,      0,  0.2, -4.5);  // rear bumper
  [[-2.2,0.45,2.8],[2.2,0.45,2.8],[-2.2,0.45,-2.8],[2.2,0.45,-2.8]].forEach(([wx,wy,wz])=>b(0.9,0.9,0.9,0x111111,wx,wy,wz));
  b(0.9,0.45,0.15, 0xffffcc, -1.5,0.9, 4.35);   // headlight L
  b(0.9,0.45,0.15, 0xffffcc,  1.5,0.9, 4.35);   // headlight R
  b(0.9,0.45,0.15, 0xff2222, -1.5,0.9,-4.35);   // taillight L
  b(0.9,0.45,0.15, 0xff2222,  1.5,0.9,-4.35);   // taillight R
  g.position.set(x,0,z);
  g.rotation.y = yawAngle||0;
  scene.add(g);
  return g;
}

// ─── CAR RAM — driving into an NPC/robot/tree destroys it for real (item 160), reusing the exact
// same reward/consequence systems as fighting them on foot, plus a real 3D debris burst. ─────────
let carImpactDebris = []; // NOT persisted — {mesh,vx,vy,vz,life}
function spawnCarImpactBurst(x, z, colors) {
  for (let i=0; i<9; i++) {
    const sz = 0.18+Math.random()*0.28;
    const frag = new THREE.Mesh(new THREE.BoxGeometry(sz,sz,sz), new THREE.MeshBasicMaterial({ color: colors[i%colors.length] }));
    frag.position.set(x, 1+Math.random()*0.8, z);
    scene.add(frag);
    const ang = Math.random()*Math.PI*2, spd = 4+Math.random()*5;
    carImpactDebris.push({ mesh:frag, vx:Math.cos(ang)*spd, vy:6+Math.random()*5, vz:Math.sin(ang)*spd, life:1.1 });
  }
  sfx.boom();
}
function tickCarImpactDebris(dt) {
  if (!carImpactDebris.length) return;
  carImpactDebris.forEach(d => {
    d.life -= dt;
    d.vy -= 18*dt; // real gravity
    d.mesh.position.x += d.vx*dt;
    d.mesh.position.y = Math.max(0.05, d.mesh.position.y + d.vy*dt);
    d.mesh.position.z += d.vz*dt;
    d.mesh.rotation.x += dt*9; d.mesh.rotation.y += dt*7;
  });
  const dead = carImpactDebris.filter(d => d.life<=0);
  if (dead.length) { dead.forEach(d => scene.remove(d.mesh)); carImpactDebris = carImpactDebris.filter(d => d.life>0); }
}
function ramNPC(npc) {
  if (npc.isDown) return;
  spawnCarImpactBurst(npc.group.position.x, npc.group.position.z, [0xdddddd,0xffffff,0xbbbbbb]); // a cartoon "poof", not gore
  showNotif(`🚗💥 Ran over ${npc.name}!`);
  defeatNPC(npc);
}
function ramRobot(robot) {
  if (!robot.alive) return;
  spawnCarImpactBurst(robot.x, robot.z, [0x888899,0xffcc00,0x445566]);
  showNotif(`🚗💥 Smashed a ${robot.type.name}!`);
  defeatRobot(robot);
}
function ramRogueRobot(robot) {
  if (!robot.alive) return;
  spawnCarImpactBurst(robot.x, robot.z, [0x888899,0xffcc00,0x445566]);
  showNotif(`🚗💥 Smashed the rogue ${robot.type.name}!`);
  defeatRogueRobot(robot);
}
function ramTree(tree) {
  if (tree.fallen) return;
  spawnCarImpactBurst(tree.x, tree.z, [0x5c3a1e,0x2d7a2d,0x7a5c3a]);
  showNotif('🚗💥 Smashed through a tree!');
  // Real bug caught in verification: fellTree() itself grants no wood — chopTree() adds its own
  // +2 felling bonus BEFORE calling it, on top of the final hit's +1. Matching that exact +3 total
  // here too (was accidentally only +1 on the first pass, contradicting fellTree()'s own "+3" notif).
  woodCount += 3; updateWood();
  fellTree(tree);
}
// Buildings stay standing (they're permanent city architecture, not a real destroyable target like
// NPCs/robots/trees above) — ramming one instead charges a real repair fee. A real cooldown (not a
// per-frame charge) so sitting the car against a wall doesn't drain the wallet every single frame.
const BUILDING_CRASH_FEE = 30;
let lastCarCrashAt = 0;
function crashIntoBuilding(x, z) {
  const now = performance.now();
  if (now - lastCarCrashAt < 1500) return;
  lastCarCrashAt = now;
  const fee = Math.min(sipDollars, BUILDING_CRASH_FEE);
  sipDollars -= fee; updateSIP(); saveCurrentUser();
  spawnCarImpactBurst(x, z, [0xff8800,0x888888,0xffcc00]); // sparks, not the "destroyed" debris palette
  sfx.hit();
  showNotif(`🚗💢 Crashed into a building! -${fee} S.I.P. for damages.`);
}
// Checked every frame while actually driving at a real meaningful speed (a car idling next to
// someone shouldn't "ram" them) — removing the hit target's own collider (robots/trees) BEFORE
// the movement/isBlocked() check runs later this same frame lets the car smash straight through
// instead of still bouncing off a now-invisible wall where the target used to stand.
const RAM_RADIUS = 3.4; // still used for NPCs/rogue robots — real targets with NO CITY_COLS collider, so there's no block-check to race against.
function boxHit(px, pz, r, cx, cz, hw, hd) {
  return px+r > cx-hw && px-r < cx+hw && pz+r > cz-hd && pz-r < cz+hd;
}
// Real bug fix: driving into a tree (or ambient robot) sometimes showed "Crashed into a building!"
// instead of felling/destroying it. The old version checked a plain CIRCLE of radius RAM_RADIUS
// around the car's CURRENT (pre-move) position, while isBlocked() checks a RECTANGLE — the car's
// own radius inflated around the target's real collider half-width/half-depth (0.5 for trees, 0.6
// for robots, see their addCol() calls) — at the car's NEXT (post-move) position. A rectangle's
// CORNERS reach farther than a circle of the same nominal radius, so approaching a tree/robot
// diagonally could trip isBlocked() before the circular ram check ever caught up, and the generic
// building-crash path fired instead. Fixed by checking ram against the EXACT SAME (nx,nz) position
// and CAR_R radius isBlocked() is about to use, with the SAME rectangle geometry — ram and block
// can no longer disagree on what counts as "close enough," and ram (checked first) always wins.
function tickCarRam(nx, nz, r) {
  for (const npc of npcs) {
    if (npc.isDown) continue;
    if (Math.hypot(nx-npc.group.position.x, nz-npc.group.position.z) < RAM_RADIUS) { ramNPC(npc); return true; }
  }
  for (const rb of robots) {
    if (!rb.alive) continue;
    if (boxHit(nx, nz, r, rb.x, rb.z, 0.6, 0.6)) { ramRobot(rb); return true; }
  }
  for (const rb of rogueRobots) {
    if (!rb.alive) continue;
    if (Math.hypot(nx-rb.x, nz-rb.z) < RAM_RADIUS) { ramRogueRobot(rb); return true; }
  }
  for (const tree of WOOD_TREES) {
    if (tree.fallen) continue;
    if (boxHit(nx, nz, r, tree.x, tree.z, 0.5, 0.5)) { ramTree(tree); return true; }
  }
  return false;
}

const CAR_PARKING_SPOTS = [
  {x:117,z:44},{x:124,z:44},{x:131,z:44},{x:138,z:44},{x:145,z:44}
];

// Real per-country parking spot for a car that flew along with you (item 156) — open ground near
// that country's airport, clear of every building item 154 added there.
function carLocationSpot(name) {
  if (name === 'Downtown Explox' || !name) return null; // downtown uses CAR_PARKING_SPOTS below, unchanged
  if (name === 'Home') return { x: -45, z: -107 }; // real open ground just outside your House's fenced yard (fence spans x:[-40,-20])
  const theme = COUNTRY_THEMES.find(t => t.name === name);
  return theme ? { x: theme.cx-30, z: theme.cz+90 } : null;
}
function parkCarAtHome() {
  if (!ownedCars.length) { showNotif("❌ You don't own a car yet! Buy one at the Car Dealership."); return; }
  if (carLocation === 'Home') { showNotif('🅿️ Your car is already parked here!'); return; }
  carLocation = 'Home';
  saveCurrentUser();
  spawnOwnedCars();
  sfx.buy();
  showNotif('🅿️ Your car is now parked at home!');
}
function spawnOwnedCars() {
  parkedCars.forEach(pc => scene.remove(pc.group));
  parkedCars = [];
  ownedCars.forEach((carId, i) => {
    const def = CAR_CATALOG.find(c => c.id === carId);
    if(!def) return;
    // Only your FIRST-owned car can travel — every other car always stays at the Downtown lot
    if (i === 0 && carLocation !== 'Downtown Explox') {
      const spot = carLocationSpot(carLocation);
      if (spot) { parkedCars.push({def, group: buildCar(def, spot.x, spot.z, 0), carYaw:0}); return; }
    }
    const spot = CAR_PARKING_SPOTS[i % CAR_PARKING_SPOTS.length];
    const group = buildCar(def, spot.x, spot.z, 0);
    parkedCars.push({def, group, carYaw:0});
  });
}

function openCarShop() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  const modal = document.getElementById('carShopModal');
  modal.style.display = 'flex';
  refreshCarShopUI();
}
function closeCarShop() {
  document.getElementById('carShopModal').style.display = 'none';
}
function refreshCarShopUI() {
  const list = document.getElementById('carShopList');
  list.innerHTML = '';
  CAR_CATALOG.forEach((def, i) => {
    const owned = ownedCars.includes(def.id);
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name}</div>
      <div class="siCost">💰 ${def.price.toLocaleString()} S.I.P. &nbsp;|&nbsp; 🏎 Speed: ${def.speed}</div>
      <button class="shopBtn" ${owned?'disabled':''} onclick="buyCarItem(${i})">${owned?'✅ Owned':'Buy'}</button>`;
    list.appendChild(d);
  });
}
function buyCarItem(idx) {
  const def = CAR_CATALOG[idx];
  if(ownedCars.includes(def.id)) { showNotif('You already own this car!'); return; }
  const cost = def.price;
  if(sipDollars < cost) { sfx.nope(); showNotif(`❌ Need ${cost} S.I.P.!`); return; }
  sipDollars -= cost;
  updateSIP();
  ownedCars.push(def.id);
  saveCurrentUser();
  spawnOwnedCars();
  sfx.buy();
  showNotif(`${def.emoji} ${def.name} purchased! Find it parked at the Car Shop!`);
  refreshCarShopUI();
}
function enterCar(pc) {
  activeCar = pc;
  inCar = true;
  carYaw = pc.carYaw || 0;
  playerGroup.visible = false;
  showNotif(`🚗 Driving ${pc.def.name}! WASD to drive · A/D to turn · E to exit`);
}
function exitCar() {
  if(!inCar||!activeCar) return;
  playerGroup.position.x = activeCar.group.position.x + Math.cos(carYaw)*5;
  playerGroup.position.z = activeCar.group.position.z - Math.sin(carYaw)*5;
  activeCar.carYaw = carYaw;
  activeCar = null;
  inCar = false;
  playerGroup.visible = true;
  showNotif('Stepped out of car.');
}

// ─── STORE OWNERSHIP — buy a real store that appears in the world ───────────
// Only one store can be owned at a time; buying a new one replaces the old one.
const STORE_CATALOG = [
  { id:'kiosk',    name:'Corner Kiosk',     price:100,   size:'small',  floors:1, furnished:false },
  { id:'minimart', name:'Mini Mart',        price:500,   size:'small',  floors:1, furnished:true  },
  { id:'mainst',   name:'Main Street Shop', price:1000,  size:'medium', floors:1, furnished:false },
  { id:'boutique', name:'Boutique Store',   price:2000,  size:'medium', floors:1, furnished:true  },
  { id:'grocery',  name:'Grocery Store',    price:3000,  size:'medium', floors:1, furnished:true  },
  { id:'plaza',    name:'Plaza Storefront', price:4000,  size:'large',  floors:1, furnished:false },
  { id:'outlet',   name:'Outlet Center',    price:5000,  size:'large',  floors:2, furnished:false },
  { id:'depart',   name:'Department Store', price:6000,  size:'large',  floors:2, furnished:true  },
  { id:'complex',  name:'Shopping Complex', price:10000, size:'xlarge', floors:2, furnished:true  },
  { id:'tower',    name:'Commerce Tower',   price:15000, size:'xlarge', floors:2, furnished:true  },
];
// Footprint per size — floors * fh gives total building height (2-story = taller, same footprint)
const STORE_SIZES = {
  small:  { w:10, d:8,  fh:6   },
  medium: { w:14, d:10, fh:6.5 },
  large:  { w:18, d:12, fh:7   },
  xlarge: { w:22, d:14, fh:7.5 },
};
const STORE_PLOT = { x:160, z:-25 }; // open ground east of The Diner
let ownedStore = null;       // {id, customName} or null — persisted per account
let storeGroup = null;       // current 3D building THREE.Group, so it can be torn down on upgrade
let storeCustomerNPCs = [];  // customer NPCs tied to the current store, torn down together with it

// ─── STORE INTERIOR — walk in/out, buy ingredients (eat) and furniture (decorate) ──
// 40 real base foods × 25 "styles" (Plain, Organic, Deluxe, ...) = exactly 1000 distinct items,
// generated by formula instead of hand-typed one at a time — same trick as the 50 music tracks
// (a hand-made seed set + a formula for volume). Style changes the name and the price multiplier.
const BASE_INGREDIENTS = [
  {id:'tomato',emoji:'🍅',name:'Tomato',price:3,taste:'savory'}, {id:'carrot',emoji:'🥕',name:'Carrot',price:2,taste:'savory'},
  {id:'cheese',emoji:'🧀',name:'Cheese',price:5,taste:'savory'}, {id:'bread',emoji:'🍞',name:'Bread',price:4,taste:'savory'},
  {id:'milk',emoji:'🥛',name:'Milk',price:3,taste:'sweet'},      {id:'eggs',emoji:'🥚',name:'Eggs',price:4,taste:'savory'},
  {id:'chicken',emoji:'🍗',name:'Chicken',price:8,taste:'savory'},{id:'apple',emoji:'🍎',name:'Apple',price:2,taste:'sweet'},
  {id:'onion',emoji:'🧅',name:'Onion',price:2,taste:'spicy'},    {id:'banana',emoji:'🍌',name:'Banana',price:2,taste:'sweet'},
  {id:'grapes',emoji:'🍇',name:'Grapes',price:4,taste:'sweet'},  {id:'fish',emoji:'🐟',name:'Fish',price:9,taste:'savory'},
  {id:'rice',emoji:'🍚',name:'Rice',price:3,taste:'savory'},     {id:'butter',emoji:'🧈',name:'Butter',price:4,taste:'savory'},
  {id:'potato',emoji:'🥔',name:'Potato',price:2,taste:'savory'}, {id:'corn',emoji:'🌽',name:'Corn',price:3,taste:'sweet'},
  {id:'broccoli',emoji:'🥦',name:'Broccoli',price:3,taste:'savory'},{id:'strawberry',emoji:'🍓',name:'Strawberry',price:4,taste:'sweet'},
  {id:'orange',emoji:'🍊',name:'Orange',price:3,taste:'sweet'},  {id:'watermelon',emoji:'🍉',name:'Watermelon',price:5,taste:'sweet'},
  {id:'pepper',emoji:'🌶️',name:'Pepper',price:2,taste:'spicy'}, {id:'mushroom',emoji:'🍄',name:'Mushroom',price:3,taste:'savory'},
  {id:'garlic',emoji:'🧄',name:'Garlic',price:2,taste:'spicy'},  {id:'lemon',emoji:'🍋',name:'Lemon',price:2,taste:'sour'},
  {id:'avocado',emoji:'🥑',name:'Avocado',price:5,taste:'savory'},{id:'bacon',emoji:'🥓',name:'Bacon',price:7,taste:'savory'},
  {id:'shrimp',emoji:'🦐',name:'Shrimp',price:9,taste:'savory'}, {id:'honey',emoji:'🍯',name:'Honey',price:6,taste:'sweet'},
  {id:'yogurt',emoji:'🥣',name:'Yogurt',price:4,taste:'sweet'},  {id:'pasta',emoji:'🍝',name:'Pasta',price:4,taste:'savory'},
  {id:'cereal',emoji:'🌾',name:'Cereal',price:5,taste:'sweet'},  {id:'cookie',emoji:'🍪',name:'Cookie',price:3,taste:'sweet'},
  {id:'chocolate',emoji:'🍫',name:'Chocolate',price:4,taste:'sweet'},{id:'pretzel',emoji:'🥨',name:'Pretzel',price:3,taste:'savory'},
  {id:'peanuts',emoji:'🥜',name:'Peanuts',price:3,taste:'savory'},{id:'icecream',emoji:'🍦',name:'Ice Cream',price:5,taste:'sweet'},
  {id:'soda',emoji:'🥤',name:'Soda',price:2,taste:'sweet'},      {id:'coffee',emoji:'☕',name:'Coffee',price:4,taste:'bitter'},
  {id:'tea',emoji:'🍵',name:'Tea',price:3,taste:'bitter'},       {id:'chips',emoji:'🍟',name:'Chips',price:3,taste:'savory'},
];
const INGREDIENT_STYLES = [
  {id:'plain',label:'',mult:1.0}, {id:'fresh',label:'Fresh',mult:1.1}, {id:'organic',label:'Organic',mult:1.4},
  {id:'premium',label:'Premium',mult:1.6}, {id:'value',label:'Value Pack',mult:0.6}, {id:'frozen',label:'Frozen',mult:0.8},
  {id:'canned',label:'Canned',mult:0.7}, {id:'imported',label:'Imported',mult:1.8}, {id:'local',label:'Local',mult:1.2},
  {id:'deluxe',label:'Deluxe',mult:2.0}, {id:'family',label:'Family Size',mult:1.3}, {id:'mini',label:'Mini',mult:0.5},
  {id:'jumbo',label:'Jumbo',mult:1.7}, {id:'gourmet',label:'Gourmet',mult:2.2}, {id:'budget',label:'Budget',mult:0.4},
  {id:'farm',label:'Farm Fresh',mult:1.15}, {id:'wild',label:'Wild-Caught',mult:1.5}, {id:'artisan',label:'Artisan',mult:1.9},
  {id:'classic',label:'Classic',mult:1.05}, {id:'xl',label:'Extra Large',mult:1.4}, {id:'diet',label:'Diet',mult:0.9},
  {id:'smoked',label:'Smoked',mult:1.3}, {id:'pickled',label:'Pickled',mult:1.1}, {id:'dried',label:'Dried',mult:0.75},
  {id:'limited',label:'Limited Edition',mult:2.5},
];
const STORE_INGREDIENTS = [];
INGREDIENT_STYLES.forEach(style => {
  BASE_INGREDIENTS.forEach(base => {
    STORE_INGREDIENTS.push({
      id: base.id + '_' + style.id,
      baseId: base.id,
      name: style.label ? `${style.label} ${base.name}` : base.name,
      emoji: base.emoji,
      price: Math.max(1, Math.round(base.price * style.mult)),
      taste: base.taste,
    });
  });
});
// = 25 styles × 40 bases = 1000. Unlocked in this same order (all 40 Plain ones first, then
// all 40 Fresh ones, etc.) so leveling up broadens variety before it adds fancy price tiers.

// ─── STORE LEVEL — goes up from sales made, unlocks more of the 1000 ingredient types ──
let storeSalesCount = 0; // persisted per account
function storeLevel(){ return Math.min(400, Math.floor(storeSalesCount/5) + 1); }
function unlockedIngredientCount(){
  const lvl = storeLevel();
  return Math.min(STORE_INGREDIENTS.length, 10 + Math.round((lvl-1) * (STORE_INGREDIENTS.length-10) / 399));
}
function salesUntilNextLevel(){
  if(storeLevel() >= 400) return 0;
  return (storeLevel()*5) - storeSalesCount;
}
// Fixed slot per furniture piece (local room coords) so pieces never overlap
const FURNITURE_CATALOG = [
  { id:'shelf',    name:'Shelf Unit',    emoji:'🗄️', price:50, slot:{x:-4,z:-4} },
  { id:'rack',     name:'Display Rack',  emoji:'👕', price:60, slot:{x:4, z:-4} },
  { id:'rug',      name:'Cozy Rug',      emoji:'🟫', price:30, slot:{x:0, z:1}  },
  { id:'plant',    name:'Potted Plant',  emoji:'🪴', price:25, slot:{x:-4,z:2}  },
  { id:'lamp',     name:'Floor Lamp',    emoji:'💡', price:35, slot:{x:4, z:2}  },
  { id:'painting', name:'Wall Painting', emoji:'🖼️', price:40, slot:{x:-3,z:-5.8} },
  { id:'couch',    name:'Waiting Couch', emoji:'🛋️', price:70, slot:{x:3, z:3}  },
];
const STORE_COLS = [];        // interior colliders — empty, matching House/Mall/Hotel (walls are visual only)
const STORE_INTERIOR = { x:40000, z:0 };
const STORE_EXIT      = { x:40000, z:7 };
let ownedFurniture = [];      // furniture ids owned, persisted per account, carries across store upgrades
let storeStock = {};          // per-ingredient counts on the shelf, e.g. {tomato:3} — persisted per account
let storePrices = {};         // your sell price per ingredient id, e.g. {chicken_plain:20, icecream_plain:30} — persisted per account
let shopOpen = false;         // NOT persisted — a shop always starts closed, you have to be there running it
let shopSalesTimer = null;
let storeAdLevel = 0;         // persisted per account — each level makes customers show up more often, and costs more
const MAX_STAFF = 2;          // one stands behind each of the 2 counters
let ownedStaff = [];          // persisted per account — [{name}]; hired staff keep the shop selling while you're away
const STAFF_NAMES = ['Alex','Jordan','Sam','Riley'];
let friends = [];        // persisted per account — names of Suburbs neighbors you've befriended
let houseGuest = null;   // persisted per account — name of the friend currently hanging out at your house, or null
let inFriendHouse = false;    // NOT persisted, matches inHouse/inStore/etc. — true while visiting a friend's house
let visitingFriendName = null; // which friend's house is currently built, while inFriendHouse
let houseGuestMeshes = [];    // meshes for the guest figure inside YOUR house, tracked so refreshHouseGuest() can clean them up
let friendHouseMeshes = [];   // meshes for the shared "visiting a friend" room, rebuilt fresh per visit
const FRIEND_HOUSE_SPAWN = { x:50000, z:0 }; // its own 10,000-unit lane, same spacing scheme as every other pocket interior

// ─── RESTOCKING — buy it, a box is delivered, carry it to its shelf, press E to shelve+label it ──
// Each ingredient gets a fixed shelf spot (two rows near the back wall), so stock is now
// tracked per ingredient (storeStock is an object keyed by id) instead of one shared number.
// Shelves are built dynamically, one per ingredient TYPE you've actually stocked (there are
// 1000 possible types now, not just 10, so a fixed slot per catalog entry no longer works).
// storeStockOrder remembers the order they were first shelved, so positions stay stable —
// capped at 4 rows (20 shelves) so the room doesn't grow into the back wall forever.
let storeStockOrder = []; // persisted per account
const SHELF_ROW_CAP = 4;
const BOX_QTY = 5; // every restock box holds this many units — priced as unit price × BOX_QTY
function getShelfSlots(){
  return storeStockOrder.slice(0, 5*SHELF_ROW_CAP).map((id,i) => ({
    id, x: [-4,-2,0,2,4][i%5], row: Math.floor(i/5),
  }));
}
function shelfLocalPos(slot, roomD){ return { x: slot.x, z: -roomD/2 + 0.7 + slot.row*1.4 }; }
function currentRoomDepth(){
  const def = STORE_CATALOG.find(s => s.id === ownedStore.id);
  return STORE_SIZES[def.size].d + 6;
}
let storeBoxes = [];      // boxes delivered and sitting on the floor, waiting to be carried: {ingredientId, group, x, z}
let carriedBox = null;    // {ingredientId} while you're holding one, else null — not persisted, you have to finish the job
let carriedBoxMesh = null;

function spawnStoreBox(ingredientId){
  const ing = STORE_INGREDIENTS.find(i => i.id === ingredientId);
  const dropX = STORE_INTERIOR.x - 3 + (Math.random()-0.5)*1.4;
  const dropZ = STORE_INTERIOR.z - 2 + (Math.random()-0.5)*1.4; // delivered near the ingredients counter
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.8,0.8,0.8), new THREE.MeshLambertMaterial({color:0xC08040})));
  const cv=document.createElement('canvas'); cv.width=64; cv.height=64;
  const cx=cv.getContext('2d'); cx.font='34px Arial'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText(ing.emoji,32,26);
  cx.fillStyle='#fff'; cx.font='bold 15px Arial'; cx.fillText('×'+BOX_QTY,32,50);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.7), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv), transparent:true}));
  label.position.y=0.41; label.rotation.x=-Math.PI/2; g.add(label);
  g.position.set(dropX, 0.4, dropZ);
  scene.add(g);
  storeBoxes.push({ingredientId, group:g, x:dropX, z:dropZ});
}
function tryPickUpBox(){
  const px=playerGroup.position.x, pz=playerGroup.position.z;
  const idx = storeBoxes.findIndex(b => Math.hypot(px-b.x, pz-b.z) < 2);
  if(idx===-1) return false;
  const box = storeBoxes[idx];
  scene.remove(box.group);
  storeBoxes.splice(idx,1);
  carriedBox = { ingredientId: box.ingredientId };
  const ing = STORE_INGREDIENTS.find(i => i.id === box.ingredientId);
  showNotif(`📦 Picked up ${ing.emoji} ${ing.name} — find its shelf and press E!`);
  if(carriedBoxMesh) playerGroup.remove(carriedBoxMesh);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.6), new THREE.MeshLambertMaterial({color:0xC08040})));
  g.position.set(0, 2.4, 0.6);
  playerGroup.add(g);
  carriedBoxMesh = g;
  return true;
}
function tryPlaceBox(){
  if(!ownedStore) return false;
  const roomD = currentRoomDepth();
  const px=playerGroup.position.x, pz=playerGroup.position.z;
  const carriedIsNew = !storeStockOrder.includes(carriedBox.ingredientId);
  const slots = getShelfSlots();
  // A brand-new ingredient (never shelved before) can go on any EMPTY slot within the grid —
  // that spot becomes its permanent shelf. An ingredient that already has a shelf must go
  // on that SAME shelf (the "wrong shelf" rejection), even if other empty ones are closer.
  const targetSlots = carriedIsNew
    ? Array.from({length: 5*SHELF_ROW_CAP}, (_,i) => ({ x:[-4,-2,0,2,4][i%5], row:Math.floor(i/5) })).filter((s,i) => i >= slots.length)
    : slots.filter(s => s.id === carriedBox.ingredientId);
  for(const slot of targetSlots){
    const lp = shelfLocalPos(slot, roomD);
    const wx = STORE_INTERIOR.x + lp.x, wz = STORE_INTERIOR.z + lp.z;
    if(Math.hypot(px-wx, pz-wz) < 1.8){
      const ing = STORE_INGREDIENTS.find(i => i.id === carriedBox.ingredientId);
      if(carriedIsNew) storeStockOrder.push(carriedBox.ingredientId); // only claim a new shelf slot once, ever
      storeStock[carriedBox.ingredientId] = (storeStock[carriedBox.ingredientId]||0) + BOX_QTY;
      saveCurrentUser();
      if(carriedBoxMesh){ playerGroup.remove(carriedBoxMesh); carriedBoxMesh=null; }
      showNotif(carriedIsNew
        ? `🏷️ New shelf labeled: ${ing.emoji} ${ing.name} (+${BOX_QTY} — ${storeStock[ing.id]} in stock)`
        : `📦 Restocked: ${ing.emoji} ${ing.name} (+${BOX_QTY} — ${storeStock[ing.id]} in stock)`);
      sfx.buy();
      carriedBox = null;
      buildStoreInterior();
      refreshStoreManagerUI();
      return true;
    }
  }
  // Carrying a restock for an ingredient that already has a shelf — check if we're standing
  // at the WRONG existing shelf, so we can explain why nothing happened
  if(!carriedIsNew){
    for(const slot of slots){
      if(slot.id === carriedBox.ingredientId) continue;
      const lp = shelfLocalPos(slot, roomD);
      const wx = STORE_INTERIOR.x + lp.x, wz = STORE_INTERIOR.z + lp.z;
      if(Math.hypot(px-wx, pz-wz) < 1.8){
        const wrongIng = STORE_INGREDIENTS.find(i => i.id === slot.id);
        showNotif(`❌ That's the ${wrongIng.name} shelf — wrong one! Keep looking.`);
        return true;
      }
    }
  } else if(slots.length){
    for(const slot of slots){
      const lp = shelfLocalPos(slot, roomD);
      const wx = STORE_INTERIOR.x + lp.x, wz = STORE_INTERIOR.z + lp.z;
      if(Math.hypot(px-wx, pz-wz) < 1.8){
        showNotif(`❌ That shelf's already taken — find an empty spot.`);
        return true;
      }
    }
  }
  return false;
}
let storeInteriorGroup = null;

function interactWithStorePlot(){ ownedStore ? enterStore() : openStoreManager(); }
function enterStore(){
  if(!ownedStore){ showNotif("🏪 You don't own a store yet!"); return; }
  inStore = true;
  playerGroup.position.set(STORE_INTERIOR.x, 0, STORE_INTERIOR.z);
  yaw = Math.PI;
  showNotif(`🏪 Welcome to ${ownedStore.customName}!`);
}
function exitStore(){
  if(shopOpen && ownedStaff.length === 0){ // no staff to cover it — leaving automatically closes up shop
    shopOpen = false;
    clearInterval(shopSalesTimer);
    shopSalesTimer = null;
  }
  if(carriedBox){ // can't carry a box out into the city — drop it, it'll be waiting inside
    if(carriedBoxMesh){ playerGroup.remove(carriedBoxMesh); carriedBoxMesh=null; }
    spawnStoreBox(carriedBox.ingredientId);
    carriedBox = null;
  }
  inStore = false;
  playerGroup.position.set(STORE_PLOT.x, 0, STORE_PLOT.z + 15);
  yaw = 0;
  showNotif(shopOpen ? "Leaving your store — your staff has it covered!" : 'Leaving your store...');
}
const STORE_ZONES = [
  { x:STORE_EXIT.x,   z:STORE_EXIT.z,   r:3,   label:'Exit Store',          action: exitStore },
  { x:STORE_INTERIOR.x-3, z:STORE_INTERIOR.z-4, r:2.5, label:'🛒 Buy Ingredients', action: openIngredientsCounter },
  { x:STORE_INTERIOR.x+3, z:STORE_INTERIOR.z-4, r:2.5, label:'🪑 Buy Furniture',   action: openFurnitureCounter },
  { x:STORE_INTERIOR.x,   z:STORE_INTERIOR.z+2, r:2.5, label:'🏪 Manage Store',    action: openStoreManager },
];

function openIngredientsCounter() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('ingredientsCounterModal').style.display = 'flex';
  refreshIngredientsCounterUI();
}
function closeIngredientsCounter() { document.getElementById('ingredientsCounterModal').style.display = 'none'; }
function refreshIngredientsCounterUI() {
  const list = document.getElementById('ingredientsCounterList');
  list.innerHTML = '';
  const unlocked = unlockedIngredientCount();
  const header = document.createElement('div');
  header.style.cssText = 'color:#e0a860;font-size:11px;text-align:center;margin-bottom:8px;';
  header.textContent = `🏪 Level ${storeLevel()} — ${unlocked}/${STORE_INGREDIENTS.length} item types unlocked`;
  list.appendChild(header);
  STORE_INGREDIENTS.slice(0, unlocked).forEach((def, i) => {
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name} <span style="opacity:0.7;font-size:10px;">(box of ${BOX_QTY})</span></div>
      <div class="siCost">💰 ${def.price * BOX_QTY} S.I.P.</div>
      <button class="shopBtn" onclick="buyIngredient(${i})">Buy</button>`;
    list.appendChild(d);
  });
}
function buyIngredient(idx) {
  const def = STORE_INGREDIENTS[idx];
  const boxPrice = def.price * BOX_QTY;
  if(sipDollars < boxPrice) { sfx.nope(); showNotif(`❌ Need ${boxPrice} S.I.P.!`); return; }
  if(carriedBox) { showNotif('📦 Your hands are full — shelve that box first!'); return; }
  sipDollars -= boxPrice;
  updateSIP();
  sfx.buy();
  closeIngredientsCounter();
  spawnStoreBox(def.id);
  showNotif(`📦 A box of ${BOX_QTY}× ${def.emoji} ${def.name} arrived! Carry it (E) to the ${def.name} shelf and press E again.`);
}

// ─── RUNNING THE SHOP — open it, price your stock, and customers buy while you're there ──
function toggleShopOpen(){
  if(!ownedStore){ showNotif("You don't own a store yet!"); return; }
  shopOpen = !shopOpen;
  if(shopOpen){
    showNotif('🔓 Shop is open for business!');
    shopSalesTimer = setInterval(() => { trySellToCustomer(); tryStaffRestock(); }, 4000);
  } else {
    showNotif('🔒 Shop closed.');
    clearInterval(shopSalesTimer);
    shopSalesTimer = null;
  }
  updateStoreSign();
  refreshStoreManagerUI();
}
// Each ingredient's own sell price. Not set yet = falls back to the old "3x fair value" heuristic,
// so a freshly-stocked item has a sensible starting price instead of 0 until you touch its slider.
function getItemPrice(id){
  if(storePrices[id] !== undefined) return storePrices[id];
  const ing = STORE_INGREDIENTS.find(i => i.id === id);
  return ing ? Math.round(ing.price * 3) : 10;
}
function setItemPrice(id, val){
  storePrices[id] = Math.max(1, Math.min(1000, parseInt(val) || 1));
  saveCurrentUser();
}
// The more you've already advertised, the more the NEXT level costs.
function adCost(level){ return 50 + level*50; }
function advertiseStore(){
  if(!ownedStore) return;
  const cost = adCost(storeAdLevel);
  if(sipDollars < cost){ sfx.nope(); showNotif(`❌ Need ${cost} S.I.P. to advertise!`); return; }
  sipDollars -= cost;
  storeAdLevel += 1;
  updateSIP();
  saveCurrentUser();
  sfx.buy();
  showNotif(`📢 Advertised! Ad Level ${storeAdLevel} — customers will visit more often.`);
  refreshStoreManagerUI();
}
function staffHireCost(){ return 100 + ownedStaff.length*150; }
// specificName: hire a particular Suburbs friend (from the neighbor modal) instead of a
// random generic name — same hire, same cost, same job. Omit it for the Store Manager's
// plain "Hire Staff" button, which keeps picking from STAFF_NAMES like before.
function hireStaff(specificName){
  if(!ownedStore) return;
  if(ownedStaff.length >= MAX_STAFF){ showNotif('You already have a full staff!'); return; }
  if(specificName && ownedStaff.some(s => s.name === specificName)){ showNotif(`${specificName} already works here!`); return; }
  const cost = staffHireCost();
  if(sipDollars < cost){ sfx.nope(); showNotif(`❌ Need ${cost} S.I.P. to hire staff!`); return; }
  sipDollars -= cost;
  const name = specificName || STAFF_NAMES[ownedStaff.length % STAFF_NAMES.length];
  ownedStaff.push({name});
  updateSIP();
  saveCurrentUser();
  sfx.buy();
  showNotif(`👥 Hired ${name}! They'll run the register AND carry restock boxes to shelves — even while you're out in the city.`);
  refreshStoreManagerUI();
  buildStoreInterior();
}
function hireFriendAsStaff(name){
  hireStaff(name);
  closeNeighborModal();
}
// Staff carry delivered boxes (storeBoxes, waiting on the floor) to their shelf themselves —
// same shelving rules tryPlaceBox() uses (new ingredient claims the next empty slot, capped at
// 5*SHELF_ROW_CAP shelves). Runs alongside trySellToCustomer() on the same 4s shop tick; each
// staff member clears up to one box per tick, so more staff restock faster.
function tryStaffRestock(){
  if(!ownedStore || ownedStaff.length === 0 || storeBoxes.length === 0) return;
  const maxSlots = 5 * SHELF_ROW_CAP;
  let handled = 0;
  for(let i = 0; i < storeBoxes.length && handled < ownedStaff.length; ){
    const b = storeBoxes[i];
    const isNew = !storeStockOrder.includes(b.ingredientId);
    if(isNew && storeStockOrder.length >= maxSlots){ i++; continue; } // shelves full — leave it for later
    scene.remove(b.group);
    storeBoxes.splice(i, 1);
    if(isNew) storeStockOrder.push(b.ingredientId);
    storeStock[b.ingredientId] = (storeStock[b.ingredientId] || 0) + BOX_QTY;
    const ing = STORE_INGREDIENTS.find(x => x.id === b.ingredientId);
    showNotif(`👥 Staff shelved ${BOX_QTY}× ${ing.emoji} ${ing.name} (${storeStock[b.ingredientId]} in stock)`);
    handled++;
  }
  if(handled > 0){
    saveCurrentUser();
    if(inStore) buildStoreInterior();
    refreshStoreManagerUI();
  }
}
function trySellToCustomer(){
  if(!shopOpen) return;
  if(!inStore && ownedStaff.length === 0) return; // nobody's there to run the register while you're away
  const stockedIds = Object.keys(storeStock).filter(id => storeStock[id] > 0);
  if(stockedIds.length === 0) return;
  // Advertising controls how often a customer shows up at all, each check (every 4s)
  const adChance = Math.min(0.9, 0.3 + storeAdLevel*0.08);
  if(Math.random() > adChance) return; // no customer walked in this time
  const soldId = stockedIds[Math.floor(Math.random()*stockedIds.length)];
  const ing = STORE_INGREDIENTS.find(i => i.id === soldId);
  const price = getItemPrice(soldId);
  const fairValue = ing.price * 3; // this ITEM's own fair value, not a store-wide average
  const staffBonus = Math.min(0.25, ownedStaff.length * 0.05); // helpful staff nudge up the sale
  // Priced at fair value or under = customers almost always buy; every 50 S.I.P. over fair shaves off buy-chance
  const buyChance = Math.max(0.05, Math.min(0.95, 1 - (price-fairValue)/50 + staffBonus));
  if(Math.random() < buyChance){
    storeStock[soldId] -= 1;
    sipDollars += price;
    updateSIP();
    const levelBefore = storeLevel();
    storeSalesCount += 1;
    saveCurrentUser();
    sfx.notify();
    showNotif(`💰 A customer bought ${ing.emoji} ${ing.name} for ${price} S.I.P.!`);
    if(storeLevel() > levelBefore){
      sfx.cheer();
      showNotif(`⭐ Store leveled up to Level ${storeLevel()}! More ingredient types unlocked.`);
    }
    refreshStoreManagerUI();
    // Only bother rebuilding the room's meshes / spawning a visible customer if you're actually there to see it
    if(inStore){ buildStoreInterior(); spawnShopperCustomer(); }
  }
}
// A customer NPC that walks in from the door, up to the register, then runs out happy —
// spawned once per successful sale. Reuses the normal patrol system: it's just a 2-point
// patrol (register, then door) with the loop below despawning it once it gets back outside.
function spawnShopperCustomer(){
  const doorPt = [STORE_INTERIOR.x, STORE_INTERIOR.z + 5];
  const registerPt = [STORE_INTERIOR.x, STORE_INTERIOR.z - 3];
  const skins = [0xf5c89a,0xd4956a,0xe8c080,0xc07840,0x8B5E3C];
  const shirts = [0xff6644,0x44aaff,0xffcc44,0x66cc88,0xcc66ff];
  const hairs = ['short','long','spiky','curly','ponytail'];
  const cdef = {
    name:'Shopper', role:'Customer',
    skin: skins[Math.floor(Math.random()*skins.length)],
    shirt: shirts[Math.floor(Math.random()*shirts.length)],
    pants: 0x333333,
    pos:[doorPt[0], 0, doorPt[1]],
    patrol:[registerPt, doorPt],
    hair: hairs[Math.floor(Math.random()*hairs.length)], hairColor:0x2a1505,
  };
  const npc = makeNPC(cdef);
  npc.isShopper = true;
  npcs.push(npc);
}
function giveShopperTip(){
  if(Math.random() < 0.3){
    const tip = 1 + Math.floor(Math.random()*100); // 1-100 S.I.P.
    sipDollars += tip;
    updateSIP();
    sfx.cheer();
    showNotif(`🎉 A happy customer left you a ${tip} S.I.P. tip!`);
  }
}
// Builds/updates the OPEN or CLOSED sign on the front of the building
let storeSignMesh = null;
function updateStoreSign(){
  if(!storeGroup || !ownedStore) return;
  if(storeSignMesh){ scene.remove(storeSignMesh); storeSignMesh=null; }
  const def = STORE_CATALOG.find(s => s.id === ownedStore.id);
  const sz = STORE_SIZES[def.size];
  const {x,z} = STORE_PLOT;
  const cv = document.createElement('canvas'); cv.width=200; cv.height=80;
  const c = cv.getContext('2d');
  c.fillStyle = shopOpen ? '#2ecc40' : '#ff4136';
  c.fillRect(0,0,200,80);
  c.fillStyle='#fff'; c.font='bold 32px Arial'; c.textAlign='center'; c.textBaseline='middle';
  c.save(); c.scale(-1,1); c.translate(-200,0); // matches buildSign()'s mirrored-text convention
  c.fillText(shopOpen ? 'OPEN' : 'CLOSED', 100, 42);
  c.restore();
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3,1.2), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv), side:THREE.DoubleSide}));
  mesh.position.set(x, 2.2, z + sz.d/2 + 0.25);
  scene.add(mesh);
  storeSignMesh = mesh;
}

function openFurnitureCounter() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('furnitureCounterModal').style.display = 'flex';
  refreshFurnitureCounterUI();
}
function closeFurnitureCounter() { document.getElementById('furnitureCounterModal').style.display = 'none'; }
function refreshFurnitureCounterUI() {
  const list = document.getElementById('furnitureCounterList');
  list.innerHTML = '';
  FURNITURE_CATALOG.forEach((def, i) => {
    const owned = ownedFurniture.includes(def.id);
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name}</div>
      <div class="siCost">💰 ${def.price} S.I.P.</div>
      <button class="shopBtn" ${owned?'disabled':''} onclick="buyFurniture(${i})">${owned?'✅ Placed':'Buy'}</button>`;
    list.appendChild(d);
  });
}
function buyFurniture(idx) {
  const def = FURNITURE_CATALOG[idx];
  if(ownedFurniture.includes(def.id)) { showNotif('You already have this!'); return; }
  if(sipDollars < def.price) { sfx.nope(); showNotif(`❌ Need ${def.price} S.I.P.!`); return; }
  sipDollars -= def.price;
  updateSIP();
  ownedFurniture.push(def.id);
  saveCurrentUser();
  sfx.buy();
  showNotif(`${def.emoji} ${def.name} placed in your store!`);
  buildStoreInterior();
  refreshFurnitureCounterUI();
}

function openStoreManager() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('storeManagerModal').style.display = 'flex';
  refreshStoreManagerUI();
}
function closeStoreManager() {
  document.getElementById('storeManagerModal').style.display = 'none';
}
function refreshStoreManagerUI() {
  const owned = document.getElementById('storeOwnedBox');
  if(ownedStore) {
    const def = STORE_CATALOG.find(s => s.id === ownedStore.id);
    owned.innerHTML = `
      <div style="margin-bottom:8px;">You own: <b>${ownedStore.customName || def.name}</b> (${def.name})</div>
      <div style="margin-bottom:8px;">⭐ Level <b>${storeLevel()}</b> (${storeSalesCount} sales made) — 🔓 ${unlockedIngredientCount()}/${STORE_INGREDIENTS.length} item types unlocked
        ${storeLevel()<400 ? `<span style="color:#888;font-size:10px;"> (${salesUntilNextLevel()} sales to next level)</span>` : `<span style="color:#FFD700;font-size:10px;"> (MAX LEVEL!)</span>`}</div>
      <div style="margin-bottom:8px;">📦 Stock: <b>${Object.values(storeStock).reduce((a,b)=>a+b,0)}</b> items —
        <a href="javascript:void(0)" onclick="closeStoreManager();openIngredientsCounter();" style="color:#e0a860;">buy more</a></div>
      <div style="margin-bottom:8px;text-align:left;">
        <div style="margin-bottom:4px;">💲 <b>Set your own price per item</b> <span style="color:#888;font-size:10px;">(too high = fewer sales)</span></div>
        ${storeStockOrder.length === 0 ? `<div style="color:#888;font-size:11px;">Stock a shelf first to set its price.</div>` :
          storeStockOrder.map(id => {
            const ing = STORE_INGREDIENTS.find(i => i.id === id);
            if(!ing) return '';
            return `<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:3px;font-size:11px;">
              <span>${ing.emoji} ${ing.name}</span>
              <input type="number" min="1" max="1000" value="${getItemPrice(id)}" style="width:56px;"
                onchange="setItemPrice('${id}', this.value)">
            </div>`;
          }).join('')}
      </div>
      <div style="margin-bottom:8px;padding-top:6px;border-top:1px solid #444;text-align:left;">
        📢 <b>Advertising:</b> Level ${storeAdLevel} <span style="color:#888;font-size:10px;">(more customers visit)</span>
        <button onclick="advertiseStore()" style="width:100%;padding:6px;margin-top:4px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#3a6ea5;">
          📢 Advertise (+1 level) — ${adCost(storeAdLevel)} S.I.P.
        </button>
      </div>
      <div style="margin-bottom:8px;padding-top:6px;border-top:1px solid #444;text-align:left;">
        👥 <b>Staff:</b> ${ownedStaff.length}/${MAX_STAFF} hired ${ownedStaff.length>0 ? `<span style="color:#7CFC00;font-size:10px;">(sells AND restocks shelves — even while you're away!)</span>` : ''}
        ${ownedStaff.length ? `<div style="color:#ccc;font-size:11px;">${ownedStaff.map(s=>'👤 '+s.name).join(', ')}</div>` : ''}
        ${ownedStaff.length < MAX_STAFF
          ? `<button onclick="hireStaff()" style="width:100%;padding:6px;margin-top:4px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#4a8a4a;">👥 Hire Staff — ${staffHireCost()} S.I.P.</button>`
          : `<div style="color:#888;font-size:10px;">Max staff hired!</div>`}
      </div>
      <button onclick="toggleShopOpen()" style="width:100%;padding:8px;margin-bottom:4px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:${shopOpen?'#4CAF50':'#e94560'};">
        ${shopOpen ? '🔓 Shop is OPEN — click to close' : '🔒 Shop is closed — click to open'}
      </button>
      <div style="color:#888;font-size:10px;text-align:center;">${ownedStaff.length>0 ? "Your staff keeps the shop open even if you leave." : "You have to stay in the store while it's open — leaving closes it, unless you hire staff."}</div>
    `;
  } else {
    owned.innerHTML = `You don't own a store yet — the plot east of The Diner is empty.`;
  }
  const list = document.getElementById('storeCatalogList');
  list.innerHTML = '';
  STORE_CATALOG.forEach((def, i) => {
    const isCurrent = ownedStore && ownedStore.id === def.id;
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.name} ${def.furnished ? '🛋️ furnished' : ''} ${def.floors===2 ? '🏢 2-story' : ''}</div>
      <div class="siCost">💰 ${def.price.toLocaleString()} S.I.P.</div>
      <button class="shopBtn" ${isCurrent?'disabled':''} onclick="buyStore(${i})">${isCurrent ? '✅ Owned' : (ownedStore ? 'Upgrade/Switch' : 'Buy')}</button>`;
    list.appendChild(d);
  });
}
function buyStore(idx) {
  const def = STORE_CATALOG[idx];
  if(ownedStore && ownedStore.id === def.id) { showNotif('You already own this store!'); return; }
  if(sipDollars < def.price) { sfx.nope(); showNotif(`❌ Need ${def.price.toLocaleString()} S.I.P.!`); return; }
  // Resolve the name BEFORE spending any S.I.P. — some browsers/embeds (e.g. a sandboxed
  // itch.io iframe) don't support prompt() at all and throw instead of returning null, so
  // this must not be able to fail AFTER the player has already been charged.
  let customName = def.name;
  try { customName = prompt('Name your store:', def.name) || def.name; } catch(e) { /* prompt unsupported here — just use the default name */ }
  sipDollars -= def.price;
  updateSIP();
  ownedStore = { id: def.id, customName };
  saveCurrentUser();
  sfx.buy();
  showNotif(`🏪 ${customName} is open for business! Head east of The Diner to see it.`);
  buildOwnedStore();
  refreshStoreManagerUI();
}

// ─── COMPUTER SHOP & SIB BROWSER ─────────────────────────────────────────────
const COMPUTER_CATALOG = [
  { id:'sic',  name:'S.I.C.',  full:'Super Important Computer',       emoji:'💻', price:3000,  tier:1 },
  { id:'sicp', name:'S.I.C.+', full:'Super Important Computer Plus',  emoji:'🖥️', price:7000,  tier:2 },
  { id:'sdic', name:'S.D.I.C.',full:'Super Duper Important Computer', emoji:'🖧',  price:15000, tier:3 },
];
const SIB_SHOP_ITEMS = [
  { id:'gaming_chair',  name:'Gaming Chair',    emoji:'🪑', cost:150,  tier:1 },
  { id:'headphones',    name:'Pro Headphones',  emoji:'🎧', cost:80,   tier:1 },
  { id:'toy_drone',     name:'Toy Drone',       emoji:'🚁', cost:200,  tier:1 },
  { id:'taco_delivery', name:'Taco Delivery',   emoji:'🌮', cost:15,   tier:1 },
  { id:'racing_seat',   name:'Racing Seat',     emoji:'🏎', cost:300,  tier:2 },
  { id:'extra_monitor', name:'Extra Monitor',   emoji:'🖥️', cost:500,  tier:2 },
  { id:'mystery_box',   name:'Mystery Box',     emoji:'📦', cost:50,   tier:2 },
  { id:'hover_board',   name:'Hover Board',     emoji:'🛹', cost:1000, tier:3 },
  { id:'robot_pet',     name:'Robot Pet',       emoji:'🤖', cost:2000, tier:3 },
  { id:'vip_balloon',   name:'VIP Balloon',     emoji:'🎈', cost:25,   tier:3 },
];

function openComputerShop() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('computerShopModal').style.display = 'flex';
  refreshComputerShopUI();
}
function closeComputerShop() {
  document.getElementById('computerShopModal').style.display = 'none';
}
function refreshComputerShopUI() {
  const list = document.getElementById('computerShopList');
  list.innerHTML = '';
  COMPUTER_CATALOG.forEach((def, i) => {
    const owned = ownedComputers.includes(def.id);
    const cost  = def.price;
    const d = document.createElement('div');
    d.className = 'shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name} <span style="color:#888;font-size:10px;">${def.full}</span></div>
      <div class="siCost">💰 ${cost.toLocaleString()} S.I.P.</div>
      <button class="shopBtn" ${owned?'disabled':''} onclick="buyComputer(${i})">${owned?'✅ Owned':'Buy'}</button>`;
    list.appendChild(d);
  });
}
function buyComputer(idx) {
  const def = COMPUTER_CATALOG[idx];
  if(ownedComputers.includes(def.id)) { showNotif('You already own this computer!'); return; }
  const cost = def.price;
  if(sipDollars < cost) { sfx.nope(); showNotif(`❌ Need ${cost} S.I.P.!`); return; }
  sipDollars -= cost;
  updateSIP();
  ownedComputers.push(def.id);
  saveCurrentUser();
  sfx.buy();
  showNotif(`${def.emoji} ${def.name} delivered to your house! Use it from the computer desk.`);
  refreshComputerShopUI();
}

// ─── EXPLOXTUBE — a real video feed inside SIB, reusing the SAME cartoon-character canvas
// helpers the Cinema (items 40/42) already draws with, not a separate art system ────────────
const TUBE_VIDEOS = [
  { id:'v1',  title:'Robot Dance Party',        channel:'TechTube',       emoji:'🤖', color:'#1a1a2e', views:128000, dur:14,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#1a1a2e','#0a0a15'); _cLines(ctx,w/2,h*0.55,h*0.35,16,'rgba(0,200,255,.18)'); _cRobot(ctx,w/2,h*0.62,h*0.55,t,true); } },
  { id:'v2',  title:'T-Rex ROARS Compilation',  channel:'DinoDaily',      emoji:'🦖', color:'#1b3a1b', views:342000, dur:12,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2d5a2d','#0f2a0f'); _cDino(ctx,w/2,h*0.6,h*0.6,t,true); } },
  { id:'v3',  title:'Rocket Launch LIVE',       channel:'SpaceExplorers', emoji:'🚀', color:'#0a0a20', views:891000, dur:16,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#0a0a25','#000010'); _cStars(ctx,w,h,t); _cPlanet(ctx,w*0.8,h*0.25,h*0.14,'#cc8844','#663311',t); _cRocket(ctx,w/2,h*0.6,h*0.6,t); } },
  { id:'v4',  title:'Ninja Training Vlog',      channel:'ShadowAcademy',  emoji:'🥷', color:'#221833', views:76000, dur:13,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2a1f3a','#0f0a18'); _cNinja(ctx,w/2,h*0.6,h*0.55,t,true); } },
  { id:'v5',  title:'Cats Being Cats',          channel:'PetCorner',      emoji:'🐱', color:'#3a2a1a', views:2100000, dur:11,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#5a4a30','#2a1f15'); _cCat(ctx,w/2,h*0.6,h*0.6,t); } },
  { id:'v6',  title:'Evil Pizza Prank?!',       channel:'FoodFails',      emoji:'🍕', color:'#4a2010', views:210000, dur:12,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#6a3018','#2a1005'); _cPizza(ctx,w/2,h*0.55,h*0.6,t,true); } },
  { id:'v7',  title:'Detective Mystery Shorts', channel:'MysteryMinute',  emoji:'🕵️', color:'#20242a', views:54000, dur:15,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2a2e36','#0a0c10'); _cDetective(ctx,w/2,h*0.6,h*0.55,t); } },
  { id:'v8',  title:'Alien First Contact',      channel:'UFOWatch',       emoji:'👽', color:'#0a1a0a', views:667000, dur:14,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#0a1a10','#000800'); _cStars(ctx,w,h,t); _cAlien(ctx,w/2,h*0.6,h*0.55,t,true); } },
  { id:'v9',  title:'Dragon Breathing Fire',    channel:'FantasyClips',   emoji:'🐉', color:'#3a1005', views:445000, dur:13,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#3a1508','#150500'); _cDragon(ctx,w/2,h*0.55,h*0.6,t,true); } },
  { id:'v10', title:'City Nightlife Timelapse', channel:'UrbanViews',     emoji:'🌃', color:'#0a0a1a', views:98000, dur:18,
    draw:(ctx,w,h,t)=>{ _cCity(ctx,w,h,true); _cBird(ctx,w*0.2,h*0.15,h*0.03,t); _cBird(ctx,w*0.3,h*0.22,h*0.025,t+0.5); } },
  { id:'v11', title:'Rainy Day Study Beats',    channel:'ChillHub',       emoji:'☔', color:'#2a3038', views:389000, dur:20,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#3a4048','#181c20'); _cRain(ctx,w,h,t); } },
  { id:'v12', title:'S.I.P. Money Rain!',       channel:'SIPMaster',      emoji:'💰', color:'#3a2f0a', views:1500000, dur:12,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#4a3a10','#1a1503'); _cMoney(ctx,w,h,t); } },
  { id:'v13', title:"Grandma's Kung Fu Secrets", channel:'ElderPower',    emoji:'👵', color:'#2a1a3a', views:230000, dur:13,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#3a1f4a','#150a20'); _cGrandma(ctx,w/2,h*0.6,h*0.55,t,true); } },
  { id:'v14', title:'Beach Day Sunburn Fail',   channel:'TravelWithMe',   emoji:'🏖️', color:'#2a5a7a', views:410000, dur:14,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#4a8aca','#dfefff'); _cSun(ctx,w*0.75,h*0.22,h*0.13,t); _cBird(ctx,w*0.3,h*0.15,h*0.025,t); _cBird(ctx,w*0.45,h*0.2,h*0.02,t+0.4); } },
  { id:'v15', title:'Explosion Fails Compilation', channel:'FoodFails',   emoji:'💥', color:'#3a1508', views:670000, dur:12,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2a1005','#0a0300'); _cExplo(ctx,w/2,h*0.5,h*0.4,(t%2)/2); } },
  { id:'v16', title:'Ultimate Party Confetti Cannon', channel:'CelebrationCentral', emoji:'🎉', color:'#3a1a3a', views:158000, dur:11,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#3a1a4a','#150818'); _cConfetti(ctx,w,h,t); } },
  { id:'v17', title:'Robot vs Dino Showdown',   channel:'ScrapyardFan',   emoji:'⚔️', color:'#1a2a1a', views:940000, dur:16,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#1a3a1a','#081508'); _cRobot(ctx,w*0.32,h*0.62,h*0.42,t,true); _cDino(ctx,w*0.7,h*0.6,h*0.5,t,true); } },
  { id:'v18', title:'Dragon vs Ninja Duel',     channel:'FantasyClips',   emoji:'🐲', color:'#2a1005', views:512000, dur:15,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#3a1508','#150500'); _cDragon(ctx,w*0.68,h*0.5,h*0.5,t,true); _cNinja(ctx,w*0.3,h*0.65,h*0.4,t,true); } },
  { id:'v19', title:'Alien Abducts a Pizza?!',  channel:'UFOWatch',       emoji:'🛸', color:'#0a1a0a', views:388000, dur:13,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#0a1a10','#000800'); _cStars(ctx,w,h,t); _cAlien(ctx,w*0.35,h*0.5,h*0.4,t,true); _cPizza(ctx,w*0.65,h*0.65,h*0.35,t); } },
  { id:'v20', title:'Space Planet Tour',        channel:'SpaceExplorers', emoji:'🪐', color:'#0a0a20', views:275000, dur:17,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#0a0a25','#000010'); _cStars(ctx,w,h,t); _cPlanet(ctx,w*0.28,h*0.35,h*0.11,'#cc8844','#663311',t); _cPlanet(ctx,w*0.68,h*0.6,h*0.16,'#4488cc','#113355',t+1); } },
];
// Cubby Explosion 6001 — a real named channel (the actual publisher name Explox itself ships
// under, see item 49/[[feedback_explox_hosting]]) with its own real videos, leading the feed.
const CUBBY_VIDEOS = [
  { id:'cubby1', title:'Building EXPLOX Live!', channel:'Cubby Explosion 6001', emoji:'🛠️', color:'#2a1a3a', views:512000, dur:14,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2a1a4a','#0f0818'); _cLines(ctx,w/2,h*0.55,h*0.4,10,'rgba(255,200,0,.15)'); _cRobot(ctx,w/2,h*0.6,h*0.5,t,true); } },
  { id:'cubby2', title:'New Update Trailer!',   channel:'Cubby Explosion 6001', emoji:'🎬', color:'#1a2a3a', views:820000, dur:12,
    draw:(ctx,w,h,t)=>{ _cCity(ctx,w,h,true); _cExplo(ctx,w*0.5,h*0.4,h*0.3,(t%3)/3); } },
  { id:'cubby3', title:'Behind the Scenes',     channel:'Cubby Explosion 6001', emoji:'🎥', color:'#3a2a1a', views:310000, dur:13,
    draw:(ctx,w,h,t)=>{ _cBg(ctx,w,h,'#4a3a20','#1a1206'); _cDetective(ctx,w/2,h*0.6,h*0.55,t); } },
];
TUBE_VIDEOS.unshift(...CUBBY_VIDEOS);

// Reusable scene generators keyed by string — the static TUBE_VIDEOS/CUBBY_VIDEOS above use inline
// draw() closures (fine, they're never persisted), but an UPLOADED or ambient-posted video has to
// survive a save/reload, and a function can't be JSON-serialized — so those pick one of these keys
// instead, resolved back to a real draw() at render/play time via SCENE_LIBRARY[scene].
const SCENE_META = {
  robot:  { emoji:'🤖', color:'#1a1a2e' }, dino:  { emoji:'🦖', color:'#1b3a1b' },
  space:  { emoji:'🚀', color:'#0a0a20' }, ninja: { emoji:'🥷', color:'#221833' },
  cat:    { emoji:'🐱', color:'#3a2a1a' }, city:  { emoji:'🌃', color:'#0a0a1a' },
  money:  { emoji:'💰', color:'#3a2f0a' }, party: { emoji:'🎉', color:'#2a1a3a' },
};
const SCENE_LIBRARY = {
  robot: (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#1a1a2e','#0a0a15'); _cRobot(ctx,w/2,h*0.62,h*0.55,t,true); },
  dino:  (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2d5a2d','#0f2a0f'); _cDino(ctx,w/2,h*0.6,h*0.6,t,true); },
  space: (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#0a0a25','#000010'); _cStars(ctx,w,h,t); _cRocket(ctx,w/2,h*0.6,h*0.6,t); },
  ninja: (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#2a1f3a','#0f0a18'); _cNinja(ctx,w/2,h*0.6,h*0.55,t,true); },
  cat:   (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#5a4a30','#2a1f15'); _cCat(ctx,w/2,h*0.6,h*0.6,t); },
  city:  (ctx,w,h,t)=>{ _cCity(ctx,w,h,true); _cBird(ctx,w*0.2,h*0.15,h*0.03,t); },
  money: (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#4a3a10','#1a1503'); _cMoney(ctx,w,h,t); },
  party: (ctx,w,h,t)=>{ _cBg(ctx,w,h,'#3a1a3a','#150818'); _cConfetti(ctx,w,h,t); },
};
function videoDraw(v) { return v.draw || SCENE_LIBRARY[v.scene] || SCENE_LIBRARY.robot; }

// ── The shared "world" feed — other channels' videos, visible to every account on this device,
// same shared-registry idea as item 149's land ownership. Posts real new videos over real played
// time (see tickTubeWorld below); genuinely NOT tied to your OS clock/calendar dates (a literal
// wall-clock "monthly" cadence would mean nothing ever posts during a normal play session) — an
// honest in-fiction "day counter" advances instead, and every video's age is shown relative to it.
const CHANNEL_POOL = ['PixelPals','DailyDrift','SIPSquad','TownTalk','NightOwlGaming','QuickClips4U','TheRealScoop','CraftCornerTV'];
const TOPIC_POOL = [
  { title:'You Won\'t Believe This Robot Fight',  scene:'robot' }, { title:'Dino Encounter Gone Wrong',      scene:'dino'  },
  { title:'Mission to the Stars',                 scene:'space' }, { title:'Ninja Skills Challenge',         scene:'ninja' },
  { title:'My Cat Did WHAT?!',                    scene:'cat'   }, { title:'City Lights at Midnight',        scene:'city'  },
  { title:'How I Made My First 1000 S.I.P.',      scene:'money' }, { title:'Surprise Party Vlog',            scene:'party' },
];
function getTubeWorld() {
  try { const d = JSON.parse(localStorage.getItem('explox_tube_world')); return Array.isArray(d) ? d : []; }
  catch(e) { return []; }
}
function saveTubeWorld(list) { localStorage.setItem('explox_tube_world', JSON.stringify(list)); }
function getTubeWorldClock() {
  try { const d = JSON.parse(localStorage.getItem('explox_tube_world_clock')); return (d && typeof d.day==='number') ? d : {day:0}; }
  catch(e) { return {day:0}; }
}
function saveTubeWorldClock(c) { localStorage.setItem('explox_tube_world_clock', JSON.stringify(c)); }
let tubeWorldTimer = 0;
function tickTubeWorld(dt) {
  tubeWorldTimer += dt;
  if (tubeWorldTimer < 90) return; // check roughly every 90s of real active play
  tubeWorldTimer = 0;
  const clock = getTubeWorldClock();
  clock.day += 1 + Math.floor(Math.random()*30); // "day to day, sometimes month to month"
  if (Math.random() < 0.6) {
    const channel = CHANNEL_POOL[Math.floor(Math.random()*CHANNEL_POOL.length)];
    const topic = TOPIC_POOL[Math.floor(Math.random()*TOPIC_POOL.length)];
    const world = getTubeWorld();
    world.push({ id:'w'+Date.now()+'_'+Math.floor(Math.random()*99999), title:topic.title, channel, scene:topic.scene,
      dur:12, views:Math.floor(Math.random()*8000), likes:0, comments:[], postedDay:clock.day });
    saveTubeWorld(world);
    showNotif(`📺 ${channel} just posted "${topic.title}"!`);
  }
  saveTubeWorldClock(clock);
}
function tubeAgoLabel(postedDay) {
  if (postedDay === undefined) return '';
  const d = getTubeWorldClock().day - postedDay;
  if (d <= 0) return 'today';
  if (d < 30) return d===1 ? '1 day ago' : `${d} days ago`;
  const m = Math.round(d/30);
  return m===1 ? '1 month ago' : `${m} months ago`;
}

// ── Your own channel — real uploads that persist forever, real subscribers/likes/views/comments
// that keep growing the more time you spend playing (see tickTubeGrowth below). ─────────────────
let myUploads = [];      // persisted — [{id,title,channel,scene,dur,views,likes,comments:[{author,text}]}]
let mySubscribers = 0;   // persisted
const TUBE_COMMENT_TEMPLATES = ['This is amazing! 🔥','First!','LOL 😂','Can you make a part 2?','My favorite channel!','Wait this is actually good','👏👏👏','Underrated!','This made my day 😊','No cap this is fire'];
let tubeGrowthTimer = 0;
function tickTubeGrowth(dt) {
  tubeGrowthTimer += dt;
  if (tubeGrowthTimer < 45) return; // real growth roughly every 45s of active play
  tubeGrowthTimer = 0;
  if (!myUploads.length) return;
  let grew = false;
  myUploads.forEach(v => {
    if (Math.random() < 0.7) { v.views += 5+Math.floor(Math.random()*50); grew = true; }
    if (Math.random() < 0.3) { v.likes += 1+Math.floor(Math.random()*5); grew = true; }
    if (Math.random() < 0.25) {
      v.comments.push({ author: CHANNEL_POOL[Math.floor(Math.random()*CHANNEL_POOL.length)], text: TUBE_COMMENT_TEMPLATES[Math.floor(Math.random()*TUBE_COMMENT_TEMPLATES.length)] });
      grew = true;
    }
  });
  if (grew) { mySubscribers = Math.min(999999, mySubscribers + Math.floor(Math.random()*3)); saveCurrentUser(); }
}
function uploadTubeVideo(title, sceneKey) {
  title = (title||'').trim();
  if (!title) { showNotif('❌ Enter a title first!'); return; }
  if (!SCENE_LIBRARY[sceneKey]) return;
  myUploads.push({ id:'u'+Date.now(), title:title.slice(0,60), channel:playerName||'You', scene:sceneKey, dur:12, views:0, likes:0, comments:[] });
  saveCurrentUser();
  sfx.buy();
  showNotif(`⬆️ "${title}" uploaded to your channel! It'll be there forever.`);
  sibNavigate('tube');
}

let tubeLikes = {};  // { videoId: true }  — persisted
let tubeViews = {};  // { videoId: extraViewCount } — persisted, real count on top of the video's base views
let tubePlaying = null; // current video id, or null
let _tubeAnimId = null;
function fmtViews(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1).replace('.0','')+'M';
  if (n >= 1000) return (n/1000).toFixed(1).replace('.0','')+'K';
  return String(n);
}
// Every video the feed can show — the static base list + the shared ambient world feed + your own
// permanent uploads — each tagged with `_src` so the UI can label "Your Channel" distinctly.
function allTubeVideos() {
  return [
    ...TUBE_VIDEOS.map(v => ({...v, _src:'base'})),
    ...getTubeWorld().map(v => ({...v, _src:'world'})),
    ...myUploads.map(v => ({...v, _src:'mine'})),
  ];
}
function findTubeVideo(id) { return allTubeVideos().find(v => v.id === id); }
function renderTubeFeed() {
  const vids = allTubeVideos();
  return `<div style="background:#181818;padding:16px;min-height:360px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <div style="font-size:18px;font-weight:bold;color:#ff3333;">📺 ExploxTube</div>
      <button onclick="sibNavigate('tubeupload')" style="background:#ff3333;border:none;border-radius:16px;color:#fff;padding:6px 12px;font-size:11px;cursor:pointer;font-weight:bold;">⬆️ Upload</button>
    </div>
    <div style="color:#888;font-size:11px;margin-bottom:12px;">🔔 ${mySubscribers.toLocaleString()} subscribers on your channel (${playerName||'You'})</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      ${vids.map(v => {
        const views = (v.views||0) + (v._src==='base' ? (tubeViews[v.id]||0) : 0);
        const mine = v._src==='mine';
        const color = v.color || SCENE_META[v.scene]?.color || '#222';
        const emoji = v.emoji || SCENE_META[v.scene]?.emoji || '🎬';
        return `<div onclick="openTubePlayer('${v.id}')" style="background:#222;border-radius:8px;overflow:hidden;cursor:pointer;${mine?'border:1px solid #ff3333;':''}">
          <div style="background:${color};height:70px;display:flex;align-items:center;justify-content:center;font-size:32px;position:relative;">
            ${emoji}
            <span style="position:absolute;bottom:3px;right:5px;background:rgba(0,0,0,0.75);color:#fff;font-size:9px;padding:1px 4px;border-radius:3px;">${Math.floor((v.dur||12)/60)}:${String((v.dur||12)%60).padStart(2,'0')}</span>
            ${mine?'<span style="position:absolute;top:3px;left:5px;background:#ff3333;color:#fff;font-size:8px;padding:1px 4px;border-radius:3px;">YOUR CHANNEL</span>':''}
          </div>
          <div style="padding:7px 8px;">
            <div style="color:#fff;font-size:11px;font-weight:bold;line-height:1.3;">${v.title}</div>
            <div style="color:#aaa;font-size:10px;margin-top:2px;">${v.channel} · ${fmtViews(views)} views${v._src==='world'?' · '+tubeAgoLabel(v.postedDay):''}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}
function renderTubeUpload() {
  return `<div style="background:#181818;padding:20px;min-height:360px;">
    <div style="font-size:16px;font-weight:bold;color:#ff3333;margin-bottom:14px;">⬆️ Upload a Video</div>
    <input id="tubeUploadTitle" placeholder="Video title..." maxlength="60" style="width:100%;padding:8px;border-radius:6px;border:1px solid #444;background:#222;color:#fff;box-sizing:border-box;margin-bottom:12px;">
    <div style="color:#aaa;font-size:11px;margin-bottom:6px;">Pick a style:</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
      ${Object.entries(SCENE_META).map(([key,m]) => `<div onclick="uploadTubeVideo(document.getElementById('tubeUploadTitle').value,'${key}')" style="background:${m.color};border-radius:8px;padding:14px 4px;text-align:center;cursor:pointer;font-size:22px;">${m.emoji}</div>`).join('')}
    </div>
    <button onclick="sibNavigate('tube')" style="margin-top:14px;width:100%;padding:8px;background:none;border:1px solid #555;border-radius:6px;color:#aaa;cursor:pointer;">← Back</button>
  </div>`;
}

// ─── THE APP STORE — 400 real, distinct, non-repeating app names (item 157) — reachable once you
// own a real Phone or Tablet (item 155's Airport Lounge electronics). Same honest-count precedent
// as [[project_suin_chatbot]]'s "918 words not 1000" and item 127's "275 facts not 1000": generated
// combinatorially like item 59's 49 auto-generated music tracks, verified for a real exact count of
// 400 with zero duplicate names inside any one category, not hand-padded filler. ─────────────────
const APP_CATEGORIES = [
  { name:'Games',              emoji:'🎮', count:60, adj:['Super','Mega','Epic','Pixel','Turbo','Retro','Galaxy','Shadow'], noun:['Quest','Dash','Blast','Legends','Arena','Kingdom','Heroes','Clash'] },
  { name:'Social',             emoji:'💬', count:40, adj:['Chat','Connect','Circle','Buzz','Vibe','Squad','Link','Pulse'], noun:['Talk','Feed','Space','Wave','Zone','Hub','Stream','Loop'] },
  { name:'Productivity',       emoji:'📋', count:35, adj:['Quick','Smart','Focus','Task','Pro','Swift','Clear','Prime'], noun:['Notes','Planner','Board','Flow','List','Tracker','Suite','Desk'] },
  { name:'Music & Audio',      emoji:'🎵', count:35, adj:['Beat','Sonic','Rhythm','Sound','Wave','Loud','Chill','Bass'], noun:['Player','Mix','Studio','Radio','Tunes','Vibes','Track','Amp'] },
  { name:'Photo & Video',      emoji:'📷', count:35, adj:['Snap','Flash','Frame','Lens','Pixel','Bright','Clip','Vivid'], noun:['Cam','Edit','Studio','Gallery','Reel','Shot','Filter','Vision'] },
  { name:'Finance',            emoji:'💳', count:30, adj:['Smart','Coin','Wealth','Budget','Secure','Prime','Vault','Swift'], noun:['Wallet','Bank','Pay','Ledger','Fund','Save','Cash','Track'] },
  { name:'Food & Drink',       emoji:'🍔', count:30, adj:['Tasty','Fresh','Quick','Yum','Home','Local','Daily','Sweet'], noun:['Bites','Recipes','Eats','Kitchen','Menu','Table','Chef','Dish'] },
  { name:'Fitness & Health',   emoji:'💪', count:30, adj:['Fit','Active','Peak','Vital','Strong','Zen','Move','Pulse'], noun:['Track','Coach','Gym','Steps','Health','Flow','Burn','Balance'] },
  { name:'Education',          emoji:'📚', count:30, adj:['Learn','Bright','Smart','Study','Quick','Wise','Prime','Clever'], noun:['School','Class','Academy','Tutor','Lesson','Mind','Books','Skills'] },
  { name:'Shopping',           emoji:'🛍️', count:25, adj:['Quick','Smart','Deal','Prime','Fresh','Easy','Local','Bright'], noun:['Shop','Cart','Market','Store','Deals','Finds','Mall','Basket'] },
  { name:'News & Weather',     emoji:'📰', count:25, adj:['Daily','Live','Local','Quick','Global','Bright','Clear','Instant'], noun:['News','Weather','Times','Report','Watch','Update','Scoop','Forecast'] },
  { name:'Utilities & Tools',  emoji:'🛠️', count:25, adj:['Quick','Smart','Handy','Pro','Easy','Clean','Simple','Swift'], noun:['Tools','Fix','Scan','Convert','Backup','Manager','Boost','Guard'] },
];
function genAppNames(adj, noun, count) {
  const names = []; let ai=0, ni=0;
  while (names.length < count) {
    names.push(adj[ai]+' '+noun[ni]);
    ni++;
    if (ni >= noun.length) { ni = 0; ai = (ai+1) % adj.length; }
  }
  return names;
}
const ALL_APPS = APP_CATEGORIES.flatMap(cat => genAppNames(cat.adj, cat.noun, cat.count).map(name => ({ name, category:cat.name, emoji:cat.emoji })));
let installedApps = []; // persisted — names of apps you've "downloaded"
let appStoreCategory = 'Games';
function ownsAMobileDevice() { return !!(playerInventory['lounge_phone'] || playerInventory['lounge_tablet']); }
function installApp(name) {
  if (!installedApps.includes(name)) { installedApps.push(name); saveCurrentUser(); sfx.buy(); showNotif(`${name} installed!`); }
  else { installedApps = installedApps.filter(n => n!==name); saveCurrentUser(); showNotif(`${name} uninstalled.`); }
  sibNavigate('appstore');
}
function renderAppStore() {
  if (!ownsAMobileDevice()) {
    return `<div style="background:#181818;padding:30px;min-height:360px;text-align:center;">
      <div style="font-size:40px;">📵</div>
      <div style="color:#fff;font-size:14px;margin-top:10px;">You need a real Phone or Tablet to use the App Store.</div>
      <div style="color:#888;font-size:11px;margin-top:6px;">Buy one at any Airport Lounge's Electronics kiosk!</div>
    </div>`;
  }
  const cat = APP_CATEGORIES.find(c => c.name === appStoreCategory) || APP_CATEGORIES[0];
  const apps = ALL_APPS.filter(a => a.category === cat.name);
  return `<div style="background:#181818;padding:14px;min-height:360px;">
    <div style="font-size:16px;font-weight:bold;color:#00cc88;margin-bottom:4px;">📱 App Store</div>
    <div style="color:#888;font-size:10px;margin-bottom:10px;">${ALL_APPS.length} real apps · ${installedApps.length} installed</div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;">
      ${APP_CATEGORIES.map(c => `<button onclick="appStoreCategory='${c.name}';sibNavigate('appstore')" style="background:${c.name===cat.name?'#00cc88':'#333'};border:none;border-radius:12px;color:#fff;padding:4px 9px;font-size:10px;cursor:pointer;">${c.emoji} ${c.name}</button>`).join('')}
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;max-height:280px;overflow-y:auto;">
      ${apps.map(a => {
        const has = installedApps.includes(a.name);
        return `<div style="background:#222;border-radius:8px;padding:8px 10px;display:flex;align-items:center;gap:10px;">
          <span style="font-size:20px;">${a.emoji}</span>
          <span style="flex:1;color:#fff;font-size:12px;">${a.name}</span>
          <button onclick="installApp('${a.name.replace(/'/g,"\\'")}')" style="background:${has?'#333':'#00cc88'};border:none;border-radius:12px;color:#fff;padding:4px 10px;font-size:10px;cursor:pointer;">${has?'✓ Installed':'Get'}</button>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function openTubePlayer(id) {
  const v = findTubeVideo(id);
  if (!v) return;
  tubePlaying = id;
  document.getElementById('tubePlayerOverlay').style.display = 'flex';
  document.getElementById('tubeTitle').textContent = v.title;
  document.getElementById('tubeChannel').textContent = v.channel;
  updateTubeLikeUI();
  const commentList = document.getElementById('tubeComments');
  const comments = v.comments || [];
  commentList.innerHTML = comments.length
    ? comments.map(c => `<div style="padding:4px 0;border-bottom:1px solid #222;"><b style="color:#ff3333;">${c.author}</b> <span style="color:#ccc;">${c.text}</span></div>`).join('')
    : '<div style="color:#666;">No comments yet.</div>';
  const canvas = document.getElementById('tubeCanvas');
  canvas.width = canvas.offsetWidth || 480;
  canvas.height = canvas.offsetHeight || 270;
  const ctx = canvas.getContext('2d');
  const draw = videoDraw(v);
  const dur = v.dur || 12;
  const start = performance.now();
  let counted = false;
  function frame() {
    if (tubePlaying !== id) return;
    const t = (performance.now()-start)/1000;
    draw(ctx, canvas.width, canvas.height, t % dur);
    document.getElementById('tubeProgressBar').style.width = ((t % dur)/dur*100)+'%';
    const liveV = findTubeVideo(id) || v;
    const views = (liveV.views||0) + (v._src==='base' ? (tubeViews[id]||0) : 0);
    document.getElementById('tubeViews').textContent = fmtViews(views) + ' views';
    if (!counted && t > 1.5) {
      counted = true;
      if (v._src === 'base') { tubeViews[id] = (tubeViews[id]||0)+1; saveCurrentUser(); }
      else if (v._src === 'mine') { const mv = myUploads.find(x=>x.id===id); if(mv){ mv.views=(mv.views||0)+1; saveCurrentUser(); } }
      else if (v._src === 'world') { const world = getTubeWorld(); const wv = world.find(x=>x.id===id); if(wv){ wv.views=(wv.views||0)+1; saveTubeWorld(world); } }
    }
    _tubeAnimId = requestAnimationFrame(frame);
  }
  frame();
}
function closeTubePlayer() {
  tubePlaying = null;
  if (_tubeAnimId) cancelAnimationFrame(_tubeAnimId);
  document.getElementById('tubePlayerOverlay').style.display = 'none';
}
function toggleTubeLike() {
  if (!tubePlaying) return;
  tubeLikes[tubePlaying] = !tubeLikes[tubePlaying];
  saveCurrentUser();
  updateTubeLikeUI();
  sfx.click();
}
function updateTubeLikeUI() {
  const btn = document.getElementById('tubeLikeBtn');
  const liked = !!tubeLikes[tubePlaying];
  btn.textContent = liked ? '❤️ Liked' : '🤍 Like';
  btn.style.background = liked ? '#ff3333' : '#333';
}

let sibPage = 'home';
function openSIB() {
  if(ownedComputers.length === 0) { showNotif('💻 You need a computer! Buy one at the Computer Shop.'); return; }
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('sibModal').style.display = 'flex';
  sibNavigate('home');
}
function closeSIB() {
  document.getElementById('sibModal').style.display = 'none';
}
function sibNavigate(page) {
  sibPage = page;
  const urlBar = document.getElementById('sibUrl');
  if(urlBar) urlBar.value = 'sib://' + page;
  renderSibPage();
}
function sibGo() {
  const val = (document.getElementById('sibUrl').value||'').replace('sib://','').trim();
  sibNavigate(val || 'home');
}
function renderSibPage() {
  const area = document.getElementById('sibContent');
  if(!area) return;
  if(sibPage === 'home') {
    area.innerHTML = `
      <div style="background:#f5f5f5;padding:20px;min-height:360px;">
        <div style="text-align:center;padding:24px 0 16px;">
          <div style="font-size:36px;">🌐</div>
          <div style="font-size:22px;font-weight:bold;color:#00aacc;">SIB</div>
          <div style="color:#888;font-size:12px;">Super Important Browser</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:380px;margin:0 auto;">
          <div onclick="sibNavigate('shop')" style="background:#fff;border-radius:10px;padding:16px;text-align:center;cursor:pointer;border:1px solid #ddd;">
            <div style="font-size:24px;">🛒</div><div style="font-weight:bold;color:#333;font-size:13px;">SIB Shop</div><div style="color:#888;font-size:10px;">Buy stuff online!</div>
          </div>
          <div onclick="sibNavigate('news')" style="background:#fff;border-radius:10px;padding:16px;text-align:center;cursor:pointer;border:1px solid #ddd;">
            <div style="font-size:24px;">📰</div><div style="font-weight:bold;color:#333;font-size:13px;">SIB News</div><div style="color:#888;font-size:10px;">What's happening?</div>
          </div>
          <div onclick="sibNavigate('mail')" style="background:#fff;border-radius:10px;padding:16px;text-align:center;cursor:pointer;border:1px solid #ddd;">
            <div style="font-size:24px;">📧</div><div style="font-weight:bold;color:#333;font-size:13px;">SIB Mail</div><div style="color:#888;font-size:10px;">Your inbox</div>
          </div>
          <div onclick="sibNavigate('games')" style="background:#fff;border-radius:10px;padding:16px;text-align:center;cursor:pointer;border:1px solid #ddd;">
            <div style="font-size:24px;">🎮</div><div style="font-weight:bold;color:#333;font-size:13px;">SIB Games</div><div style="color:#888;font-size:10px;">Play online!</div>
          </div>
          <div onclick="sibNavigate('tube')" style="background:#fff;border-radius:10px;padding:16px;text-align:center;cursor:pointer;border:1px solid #ddd;">
            <div style="font-size:24px;">📺</div><div style="font-weight:bold;color:#333;font-size:13px;">ExploxTube</div><div style="color:#888;font-size:10px;">Watch videos!</div>
          </div>
          <div onclick="sibNavigate('appstore')" style="background:#fff;border-radius:10px;padding:16px;text-align:center;cursor:pointer;border:1px solid #ddd;">
            <div style="font-size:24px;">📱</div><div style="font-weight:bold;color:#333;font-size:13px;">App Store</div><div style="color:#888;font-size:10px;">400 real apps!</div>
          </div>
        </div>
      </div>`;
  } else if(sibPage === 'shop') {
    const maxTier = ownedComputers.length ? Math.max(...ownedComputers.map(id => { const c = COMPUTER_CATALOG.find(c=>c.id===id); return c ? c.tier : 0; })) : 0;
    const items = SIB_SHOP_ITEMS.filter(it => it.tier <= maxTier);
    let html = `<div style="background:#f5f5f5;padding:20px;min-height:360px;">
      <div style="font-size:18px;font-weight:bold;color:#00aacc;margin-bottom:4px;">🛒 SIB Shop</div>
      <div style="color:#888;font-size:11px;margin-bottom:14px;">Items delivered to your inventory instantly!</div>
      <div style="display:flex;flex-direction:column;gap:8px;">`;
    items.forEach((it,i) => {
      const realIdx = SIB_SHOP_ITEMS.indexOf(it);
      html += `<div style="background:#fff;border-radius:8px;padding:10px;display:flex;justify-content:space-between;align-items:center;border:1px solid #eee;">
        <div><span style="font-size:18px;">${it.emoji}</span> <b style="font-size:12px;">${it.name}</b></div>
        <button onclick="buySibItem(${realIdx})" style="padding:5px 12px;background:#00aacc;border:none;border-radius:6px;color:#fff;font-size:11px;cursor:pointer;">💰 ${it.cost}</button>
      </div>`;
    });
    if(items.length === 0) html += `<div style="color:#aaa;text-align:center;padding:20px;">Upgrade your computer to unlock more items!</div>`;
    html += `</div></div>`;
    area.innerHTML = html;
  } else if(sibPage === 'news') {
    area.innerHTML = `<div style="background:#f5f5f5;padding:20px;min-height:360px;">
      <div style="font-size:18px;font-weight:bold;color:#cc4422;margin-bottom:14px;">📰 SIB News — Explox City Daily</div>
      ${[
        ['🚗','Local Speedster Drives Diamond Limo Through Parking Lot — Citizens Amazed'],
        ['🏦','Bank Reports Record Interest Payments — "Everyone Is Getting Rich," Says Mayor'],
        ['🎬','Robot Dinosaurs From Space 4 In Production — Biggest Movie Ever?'],
        ['🍕','Chef Wins City Cooking Award For 100th Delivered Meal In A Row'],
        ['💻','New Computer Shop Opens On Tech Street — Sells Out Of S.D.I.C. On Day One'],
        ['👮','Police Baffled After Entire Criminal Alley Painted Pink Overnight'],
        ['🚇','S.I.T.S. Transit Announces New Diamond Line — Goes Everywhere At Once'],
      ].map(([e,t])=>`<div style="background:#fff;border-radius:8px;padding:10px;margin-bottom:8px;border-left:3px solid #cc4422;font-size:12px;color:#333;"><span style="font-size:16px;">${e}</span> ${t}</div>`).join('')}
    </div>`;
  } else if(sibPage === 'mail') {
    area.innerHTML = `<div style="background:#f5f5f5;padding:20px;min-height:360px;">
      <div style="font-size:18px;font-weight:bold;color:#4488cc;margin-bottom:14px;">📧 SIB Mail</div>
      ${[
        ['SIB Team','Welcome to SIB!','Thanks for using the Super Important Browser. Happy browsing!','2 min ago'],
        ['City Bank','Your Interest Is Ready','Your bank earned interest! Log in to collect it.','1 hr ago'],
        ['S.I.T.S.','New Routes Available','Three new bus routes are now running. Ride for free this weekend!','3 hrs ago'],
        ['Car Dealership','Speed Racer On Sale!','The Speed Racer is 20% off this week only. Hurry!','1 day ago'],
      ].map(([f,s,b,t])=>`<div style="background:#fff;border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid #eee;">
        <div style="display:flex;justify-content:space-between;"><b style="font-size:12px;color:#333;">${s}</b><span style="font-size:10px;color:#aaa;">${t}</span></div>
        <div style="font-size:11px;color:#666;">From: ${f} — ${b}</div>
      </div>`).join('')}
    </div>`;
  } else if(sibPage === 'games') {
    area.innerHTML = `<div style="background:#f5f5f5;padding:20px;min-height:360px;">
      <div style="font-size:18px;font-weight:bold;color:#8844cc;margin-bottom:14px;">🎮 SIB Games</div>
      <div style="color:#888;font-size:11px;margin-bottom:14px;">Exit SIB and use the MINI GAMES button on the right to play!</div>
      ${[['🏰','Capture the Throne','Strategy PvP battle'],['🏃','Obby Challenge','Obstacle course run'],['🏙️','Rooftop Parkour','Rooftop jumping']]
        .map(([e,n,d])=>`<div style="background:#fff;border-radius:8px;padding:12px;margin-bottom:8px;display:flex;gap:12px;align-items:center;border:1px solid #eee;"><span style="font-size:24px;">${e}</span><div><b style="font-size:13px;">${n}</b><br><span style="font-size:11px;color:#888;">${d}</span></div></div>`).join('')}
    </div>`;
  } else if(sibPage === 'tube') {
    area.innerHTML = renderTubeFeed();
  } else if(sibPage === 'tubeupload') {
    area.innerHTML = renderTubeUpload();
  } else if(sibPage === 'appstore') {
    area.innerHTML = renderAppStore();
  } else {
    area.innerHTML = `<div style="background:#f5f5f5;padding:40px;text-align:center;min-height:360px;"><div style="font-size:48px;">🔍</div><div style="color:#888;margin-top:10px;">Page not found: sib://${sibPage}</div></div>`;
  }
}
function buySibItem(idx) {
  const it = SIB_SHOP_ITEMS[idx];
  if(!it) return;
  const cost = it.cost;
  if(sipDollars < cost) { sfx.nope(); showNotif(`❌ Need ${cost} S.I.P.!`); return; }
  sipDollars -= cost;
  updateSIP();
  const info = { emoji: it.emoji, id: it.id };
  addToInventory(it.id, it.name, it.emoji);
  saveCurrentUser();
  sfx.buy();
  showNotif(`${it.emoji} ${it.name} delivered to your inventory!`);
}

// ─── INVENTORY ───────────────────────────────────────────────────────────────
function toggleInventory() {
  const panel = document.getElementById('inventoryPanel');
  if(panel.style.display === 'none') {
    if(document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    refreshInventory();
    panel.style.display = 'block';
    document.getElementById('inventoryTab').style.display = 'none';
  } else {
    closeInventory();
  }
}
function closeInventory() {
  document.getElementById('inventoryPanel').style.display = 'none';
  document.getElementById('inventoryTab').style.display = 'block';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function refreshInventory() {
  const list  = document.getElementById('inventoryList');
  const empty = document.getElementById('inventoryEmpty');
  const keys  = Object.keys(playerInventory);
  if(keys.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = keys.map(id => {
    const it = playerInventory[id];
    return `<div style="background:rgba(255,255,255,0.06);border:1px solid #444;border-radius:8px;padding:10px;display:flex;align-items:center;gap:10px;">
      <span style="font-size:22px;">${it.emoji}</span>
      <div style="flex:1;">
        <div style="color:#fff;font-size:13px;font-weight:bold;">${it.name}</div>
        <div style="color:#aaa;font-size:11px;">x${it.qty}</div>
      </div>
    </div>`;
  }).join('');
}

// ─── HOUSE SYSTEM ────────────────────────────────────────────────────────────
const HOUSE_DOOR  = { x:-30, z:-103 }; // exterior door
const HOUSE_SPAWN = { x:10000, z:0 };    // inside spawn — center of room, clear of all furniture
const HOUSE_EXIT  = { x:10000, z:7 };    // exit zone inside

function enterHouse() {
  inHouse = true;
  playerGroup.position.set(HOUSE_SPAWN.x, 0, HOUSE_SPAWN.z);
  yaw = Math.PI;
  showNotif('🏠 Welcome home!');
}
function exitHouse() {
  inHouse = false;
  playerGroup.position.set(HOUSE_DOOR.x, 0, HOUSE_DOOR.z + 3);
  yaw = 0;
  showNotif('Leaving home...');
}
let mallReturn = { x:MALL_DOOR.x, z:MALL_DOOR.z+4 }; // which real door to return to on exit — item 156 added more malls sharing this one interior
function enterMall(returnX, returnZ) {
  inMall = true;
  mallReturn = { x: returnX!==undefined ? returnX : MALL_DOOR.x, z: returnZ!==undefined ? returnZ : MALL_DOOR.z+4 };
  playerGroup.position.set(MALL_SPAWN.x, 0, MALL_SPAWN.z);
  yaw = Math.PI;
  showNotif('🏬 Welcome to City Mall!');
}
function exitMall() {
  inMall = false;
  playerGroup.position.set(mallReturn.x, 0, mallReturn.z);
  yaw = 0;
  showNotif('Leaving mall...');
}
// 2 more real mall entrances (item 156) — deliberately share the SAME big City Mall interior
// (200+ shops, the Directory kiosk, everything) rather than building 2 more full malls from
// scratch; same honest "one shared interior, several real doors" pattern as the Land House/Country
// Hotel/Airport Lounge above. exitMall() remembers exactly which door you came in through.
const EXTRA_MALLS = [
  { name:'Westside Galleria', x:-250, z:-50, color:0x8855cc },
  { name:'Uptown Plaza',      x:250,  z:150, color:0xcc7733 },
];
function buildExtraMalls() {
  EXTRA_MALLS.forEach(m => {
    box(30,12,20, m.color, m.x, 6, m.z);
    box(32,0.6,22, 0xffffff, m.x, 12.3, m.z);
    box(6,5,0.3, 0x88ccff, m.x, 2.5, m.z+10.1);
    buildLogoSign(m.name, '🏬', '#'+m.color.toString(16).padStart(6,'0'), '#ffffff', m.x, 13.5, m.z-11);
    addCol(CITY_COLS, m.x, m.z, 16, 11);
    CITY_ZONES.push({ x:m.x, z:m.z+11, r:5, label:`🏬 ${m.name}`, action: () => enterMall(m.x, m.z+11) });
  });
}
function enterArcade() {
  inArcade = true;
  playerGroup.position.set(ARCADE_SPAWN.x, 0, ARCADE_SPAWN.z);
  yaw = Math.PI;
  showNotif('🕹️ Welcome to Pixel Palace Arcade!');
}
function leaveArcade() {
  inArcade = false;
  ARCADE_STOPPERS();
  document.getElementById('arcadeModal').style.display = 'none';
  playerGroup.position.set(ARCADE_EXIT.x, 0, ARCADE_EXIT.z);
  yaw = 0;
  showNotif('Leaving the arcade...');
}

// ─── ARCADE — PIXEL PALACE (8 real playable games, all cost real S.I.P. to play) ──
let arcadeState = {
  whackScore:0, whackTimer:null, whackEndTime:0, whackSpawnTimer:null, whackActiveHole:-1,
  mazeGrid:null, mazePlayer:{x:1,y:1}, mazeGhost:{x:9,y:7}, mazePellets:0, mazeGhostTimer:null, mazeOver:false,
  memCards:[], memFlipped:[], memMoves:0, memMatches:0, memLock:false,
  simSequence:[], simPlayerIdx:0, simRound:0, simLocked:true,
  snakeBody:[], snakeDir:{x:1,y:0}, snakeNextDir:{x:1,y:0}, snakeFood:{x:0,y:0}, snakeTimer:null, snakeOver:false, snakeScore:0,
  brkBall:{x:0,y:0,vx:0,vy:0}, brkPaddleX:0, brkBricks:[], brkKeys:{left:false,right:false}, brkAnimId:null, brkOver:false, brkBroken:0,
  rxnState:'idle', rxnStart:0, rxnTimer:null, simSequenceTimer:null,
  tetGrid:null, tetPiece:null, tetTimer:null, tetOver:false, tetLines:0
};
const ARCADE_SCREENS = ['whackScreen','mazeScreen','memoryScreen','simonScreen','snakeScreen','breakoutScreen','reactionScreen','tetrisScreen','clawScreen'];
const ARCADE_FEES = { whack:10, maze:15, memory:15, simon:10, snake:10, breakout:15, reaction:5, tetris:15, claw:8 };
const ARCADE_STOPPERS = () => { stopWhack(); stopMaze(); stopMemory(); stopSimon(); stopSnake(); stopBreakout(); stopReaction(); stopTetris(); stopClaw(); };

// Charges the entry fee for a game before it starts. Returns false (and shows a real
// "not enough S.I.P." message instead of starting) if the player can't afford it.
function arcadeCharge(fee, resultElId) {
  if (sipDollars < fee) {
    const el = document.getElementById(resultElId);
    if (el) el.textContent = `You need ${fee} S.I.P. to play this — you only have ${sipDollars}.`;
    return false;
  }
  sipDollars -= fee; updateSIP();
  return true;
}

// Walking up to a specific cabinet/claw machine and pressing E opens that game directly —
// arcadeGoTo() is the single chokepoint every open*() function routes through, so it's the
// one place that needs to show the modal and release pointer lock (mouse clicks on cards/
// buttons don't work while the pointer is locked for 3D camera look).
function arcadeGoTo(screenId) {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('arcadeModal').style.display = 'flex';
  ARCADE_SCREENS.forEach(id=>{
    document.getElementById(id).style.display = id===screenId ? 'block' : 'none';
  });
}
function closeArcade() {
  ARCADE_STOPPERS();
  document.getElementById('arcadeModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ── Whack-a-Mole ──
function buildWhackGrid() {
  const grid = document.getElementById('whackGrid');
  if(grid.children.length) return; // build once
  for(let i=0;i<9;i++){
    const hole = document.createElement('div');
    hole.style.cssText = 'background:#1a1a2e;border-radius:50%;border:3px solid #333;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;width:90px;height:90px;';
    hole.onclick = () => hitMole(i);
    const mole = document.createElement('div');
    mole.id = 'mole'+i;
    mole.textContent = '🐹';
    mole.style.cssText = 'font-size:40px;transform:translateY(60px);transition:transform 0.12s;';
    hole.appendChild(mole);
    grid.appendChild(hole);
  }
}
function openWhack() {
  buildWhackGrid();
  arcadeGoTo('whackScreen');
  startWhack();
}
function startWhack() {
  if (!arcadeCharge(ARCADE_FEES.whack, 'whackResult')) return;
  stopWhack();
  arcadeState.whackScore = 0;
  arcadeState.whackActiveHole = -1;
  document.getElementById('whackScore').textContent = '0';
  document.getElementById('whackResult').textContent = '';
  document.getElementById('whackTimeLeft').textContent = '30';
  for(let i=0;i<9;i++){ const m=document.getElementById('mole'+i); if(m) m.style.transform='translateY(60px)'; }
  arcadeState.whackEndTime = Date.now() + 30000;
  spawnMoleLoop();
  arcadeState.whackTimer = setInterval(()=>{
    const left = Math.max(0, Math.ceil((arcadeState.whackEndTime - Date.now())/1000));
    document.getElementById('whackTimeLeft').textContent = left;
    if(left<=0) endWhack();
  }, 250);
}
function spawnMoleLoop() {
  if(Date.now() >= arcadeState.whackEndTime) return;
  if(arcadeState.whackActiveHole >= 0){ const prev=document.getElementById('mole'+arcadeState.whackActiveHole); if(prev) prev.style.transform='translateY(60px)'; }
  const hole = Math.floor(Math.random()*9);
  arcadeState.whackActiveHole = hole;
  const m = document.getElementById('mole'+hole);
  if(m) m.style.transform = 'translateY(0)';
  arcadeState.whackSpawnTimer = setTimeout(spawnMoleLoop, 550 + Math.random()*450);
}
function hitMole(i) {
  if(i !== arcadeState.whackActiveHole) return;
  const m = document.getElementById('mole'+i);
  if(m) m.style.transform = 'translateY(60px)';
  arcadeState.whackActiveHole = -1;
  arcadeState.whackScore++;
  document.getElementById('whackScore').textContent = arcadeState.whackScore;
  sfx.cheer();
}
function endWhack() {
  clearInterval(arcadeState.whackTimer);
  clearTimeout(arcadeState.whackSpawnTimer);
  for(let i=0;i<9;i++){ const m=document.getElementById('mole'+i); if(m) m.style.transform='translateY(60px)'; }
  const reward = arcadeState.whackScore * 3;
  sipDollars += reward; updateSIP();
  document.getElementById('whackResult').textContent = `Time's up! You whacked ${arcadeState.whackScore} moles — +${reward} S.I.P.!`;
  showNotif(`🐹 Whack-a-Mole: ${arcadeState.whackScore} hits (+${reward} S.I.P.)`);
}
function stopWhack() {
  clearInterval(arcadeState.whackTimer);
  clearTimeout(arcadeState.whackSpawnTimer);
}

// ── Maze Chase (Pac-Man style) ──
const MAZE_ROWS = [
  "###########",
  "#.........#",
  "#.#.###.#.#",
  "#.#.....#.#",
  "#.#.###.#.#",
  "#.........#",
  "#.###.###.#",
  "#.........#",
  "###########"
];
const MAZE_CELL = 38;
function openMaze() {
  arcadeGoTo('mazeScreen');
  startMaze();
}
function startMaze() {
  if (!arcadeCharge(ARCADE_FEES.maze, 'mazeResult')) return;
  stopMaze();
  arcadeState.mazeGrid = MAZE_ROWS.map(r=>r.split(''));
  arcadeState.mazePlayer = {x:1,y:1};
  arcadeState.mazeGhost = {x:9,y:7};
  arcadeState.mazeOver = false;
  arcadeState.mazePellets = 0;
  for(const row of arcadeState.mazeGrid) for(const c of row) if(c==='.') arcadeState.mazePellets++;
  document.getElementById('mazeResult').textContent = '';
  const cv = document.getElementById('mazeCanvas');
  cv.width = MAZE_ROWS[0].length * MAZE_CELL;
  cv.height = MAZE_ROWS.length * MAZE_CELL;
  document.addEventListener('keydown', mazeKeydown);
  arcadeState.mazeGhostTimer = setInterval(moveGhost, 450);
  drawMaze();
}
function mazeKeydown(e) {
  if(arcadeState.mazeOver) return;
  let dx=0, dy=0;
  if(e.code==='ArrowUp'||e.code==='KeyW') dy=-1;
  else if(e.code==='ArrowDown'||e.code==='KeyS') dy=1;
  else if(e.code==='ArrowLeft'||e.code==='KeyA') dx=-1;
  else if(e.code==='ArrowRight'||e.code==='KeyD') dx=1;
  else return;
  e.preventDefault();
  const p = arcadeState.mazePlayer;
  const nx = p.x+dx, ny = p.y+dy;
  if(arcadeState.mazeGrid[ny] && arcadeState.mazeGrid[ny][nx] !== '#') {
    p.x = nx; p.y = ny;
    if(arcadeState.mazeGrid[ny][nx] === '.') {
      arcadeState.mazeGrid[ny][nx] = ' ';
      arcadeState.mazePellets--;
    }
  }
  checkMazeCollision();
  if(!arcadeState.mazeOver && arcadeState.mazePellets<=0) { mazeWin(); return; }
  drawMaze();
}
function moveGhost() {
  if(arcadeState.mazeOver) return;
  const g = arcadeState.mazeGhost, p = arcadeState.mazePlayer;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let best=null, bestDist=Infinity;
  dirs.forEach(([dx,dy])=>{
    const nx=g.x+dx, ny=g.y+dy;
    if(arcadeState.mazeGrid[ny] && arcadeState.mazeGrid[ny][nx] !== '#') {
      const dist = Math.abs(nx-p.x)+Math.abs(ny-p.y);
      if(dist < bestDist) { bestDist = dist; best = {x:nx,y:ny}; }
    }
  });
  if(best) { g.x = best.x; g.y = best.y; }
  checkMazeCollision();
  drawMaze();
}
function checkMazeCollision() {
  if(!arcadeState.mazeOver && arcadeState.mazePlayer.x === arcadeState.mazeGhost.x && arcadeState.mazePlayer.y === arcadeState.mazeGhost.y) {
    mazeLose();
  }
}
function drawMaze() {
  const cv = document.getElementById('mazeCanvas');
  const ctx = cv.getContext('2d');
  const s = MAZE_CELL, grid = arcadeState.mazeGrid;
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,cv.width,cv.height);
  for(let y=0;y<grid.length;y++) for(let x=0;x<grid[y].length;x++) {
    const c = grid[y][x];
    if(c==='#') { ctx.fillStyle='#2a2a6a'; ctx.fillRect(x*s,y*s,s,s); }
    else if(c==='.') { ctx.fillStyle='#ffd54a'; ctx.beginPath(); ctx.arc(x*s+s/2,y*s+s/2,3,0,Math.PI*2); ctx.fill(); }
  }
  ctx.fillStyle='#ffe600'; ctx.beginPath(); ctx.arc(arcadeState.mazePlayer.x*s+s/2, arcadeState.mazePlayer.y*s+s/2, s*0.38, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#ff4d6d'; ctx.beginPath(); ctx.arc(arcadeState.mazeGhost.x*s+s/2, arcadeState.mazeGhost.y*s+s/2, s*0.38, 0, Math.PI*2); ctx.fill();
  const lbl = document.getElementById('mazePelletsLeft'); if(lbl) lbl.textContent = arcadeState.mazePellets;
}
function mazeWin() {
  arcadeState.mazeOver = true;
  clearInterval(arcadeState.mazeGhostTimer);
  document.removeEventListener('keydown', mazeKeydown);
  drawMaze();
  const reward = 40;
  sipDollars += reward; updateSIP();
  document.getElementById('mazeResult').textContent = `You cleared the maze! +${reward} S.I.P.`;
  showNotif(`👻 Maze Chase cleared! (+${reward} S.I.P.)`);
}
function mazeLose() {
  arcadeState.mazeOver = true;
  clearInterval(arcadeState.mazeGhostTimer);
  document.removeEventListener('keydown', mazeKeydown);
  document.getElementById('mazeResult').textContent = 'The ghost got you! Try again?';
}
function stopMaze() {
  clearInterval(arcadeState.mazeGhostTimer);
  document.removeEventListener('keydown', mazeKeydown);
}

// ── Memory Match ──
const MEMORY_EMOJIS = ['🍕','🎮','🚀','🎸','🐱','⚽','🎨','🌟'];
function buildMemoryGrid() {
  const grid = document.getElementById('memoryGrid');
  if(grid.dataset.built) return;
  grid.dataset.built = '1';
  for(let i=0;i<16;i++){
    const card = document.createElement('div');
    card.style.cssText = 'width:70px;height:70px;background:#2a1a4a;border:2px solid #444;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer;user-select:none;';
    card.textContent = '❓';
    card.onclick = () => flipMemoryCard(i);
    grid.appendChild(card);
  }
}
function openMemory() {
  arcadeGoTo('memoryScreen');
  buildMemoryGrid();
  startMemory();
}
function startMemory() {
  if (!arcadeCharge(ARCADE_FEES.memory, 'memResult')) return;
  stopMemory();
  const pairs = MEMORY_EMOJIS.concat(MEMORY_EMOJIS);
  for(let i=pairs.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pairs[i],pairs[j]]=[pairs[j],pairs[i]]; }
  arcadeState.memCards = pairs.map(e=>({emoji:e, matched:false}));
  arcadeState.memFlipped = [];
  arcadeState.memMoves = 0;
  arcadeState.memMatches = 0;
  arcadeState.memLock = false;
  document.getElementById('memMoves').textContent = '0';
  document.getElementById('memResult').textContent = '';
  document.querySelectorAll('#memoryGrid > div').forEach(c=>{ c.textContent='❓'; c.style.background='#2a1a4a'; });
}
function flipMemoryCard(i) {
  if(arcadeState.memLock) return;
  const card = arcadeState.memCards[i];
  if(!card || card.matched) return;
  if(arcadeState.memFlipped.includes(i)) return;
  const cells = document.querySelectorAll('#memoryGrid > div');
  cells[i].textContent = card.emoji;
  cells[i].style.background = '#3a2a6a';
  arcadeState.memFlipped.push(i);
  if(arcadeState.memFlipped.length === 2) {
    arcadeState.memMoves++;
    document.getElementById('memMoves').textContent = arcadeState.memMoves;
    const [a,b] = arcadeState.memFlipped;
    if(arcadeState.memCards[a].emoji === arcadeState.memCards[b].emoji) {
      arcadeState.memCards[a].matched = true;
      arcadeState.memCards[b].matched = true;
      cells[a].style.background = '#1a5a3a';
      cells[b].style.background = '#1a5a3a';
      arcadeState.memFlipped = [];
      arcadeState.memMatches++;
      if(arcadeState.memMatches === 8) memoryWin();
    } else {
      arcadeState.memLock = true;
      setTimeout(()=>{
        cells[a].textContent = '❓'; cells[a].style.background = '#2a1a4a';
        cells[b].textContent = '❓'; cells[b].style.background = '#2a1a4a';
        arcadeState.memFlipped = [];
        arcadeState.memLock = false;
      }, 700);
    }
  }
}
function memoryWin() {
  const reward = Math.max(80 - arcadeState.memMoves*3, 20);
  sipDollars += reward; updateSIP();
  document.getElementById('memResult').textContent = `Solved in ${arcadeState.memMoves} moves! +${reward} S.I.P.`;
  showNotif(`🧠 Memory Match cleared in ${arcadeState.memMoves} moves (+${reward} S.I.P.)`);
}
function stopMemory() { arcadeState.memLock = true; }

// ── Simon Says ──
const SIMON_COLORS = ['#ff4d6d','#4dd2ff','#4dff88','#ffe14d'];
function openSimon() { arcadeGoTo('simonScreen'); startSimon(); }
function startSimon() {
  if (!arcadeCharge(ARCADE_FEES.simon, 'simResult')) return;
  stopSimon();
  arcadeState.simSequence = [];
  arcadeState.simPlayerIdx = 0;
  arcadeState.simRound = 0;
  arcadeState.simLocked = true;
  document.getElementById('simRound').textContent = '0';
  document.getElementById('simResult').textContent = '';
  simonNextRound();
}
function simonNextRound() {
  arcadeState.simSequence.push(Math.floor(Math.random()*4));
  arcadeState.simRound++;
  document.getElementById('simRound').textContent = arcadeState.simRound;
  simonPlaySequence();
}
function simonPlaySequence() {
  arcadeState.simLocked = true;
  arcadeState.simPlayerIdx = 0;
  const seq = arcadeState.simSequence;
  let i = 0;
  function step() {
    if(i > 0) simonFlash(seq[i-1], false);
    if(i >= seq.length) { arcadeState.simLocked = false; return; }
    simonFlash(seq[i], true);
    i++;
    arcadeState.simSequenceTimer = setTimeout(step, 550);
  }
  arcadeState.simSequenceTimer = setTimeout(step, 400);
}
function simonFlash(idx, on) {
  const btn = document.querySelectorAll('#simonPad > div')[idx];
  if(!btn) return;
  btn.style.opacity = on ? '1' : '0.55';
  btn.style.boxShadow = on ? '0 0 20px 6px ' + SIMON_COLORS[idx] : 'none';
}
function simonClick(idx) {
  if(arcadeState.simLocked) return;
  simonFlash(idx, true);
  setTimeout(()=>simonFlash(idx, false), 200);
  if(idx === arcadeState.simSequence[arcadeState.simPlayerIdx]) {
    arcadeState.simPlayerIdx++;
    if(arcadeState.simPlayerIdx === arcadeState.simSequence.length) {
      arcadeState.simLocked = true;
      arcadeState.simSequenceTimer = setTimeout(simonNextRound, 700);
    }
  } else {
    simonOver();
  }
}
function simonOver() {
  arcadeState.simLocked = true;
  const reward = (arcadeState.simRound-1) * 5;
  if(reward > 0) { sipDollars += reward; updateSIP(); }
  document.getElementById('simResult').textContent = `Game over at round ${arcadeState.simRound}! +${reward} S.I.P.`;
  showNotif(`🎵 Simon Says: reached round ${arcadeState.simRound} (+${reward} S.I.P.)`);
}
function stopSimon() {
  clearTimeout(arcadeState.simSequenceTimer);
  arcadeState.simLocked = true;
}

// ── Snake ──
const SNAKE_COLS = 15, SNAKE_ROWS = 15, SNAKE_CELL = 24;
function openSnake() { arcadeGoTo('snakeScreen'); startSnake(); }
function startSnake() {
  if (!arcadeCharge(ARCADE_FEES.snake, 'snakeResult')) return;
  stopSnake();
  arcadeState.snakeBody = [{x:7,y:7},{x:6,y:7},{x:5,y:7}];
  arcadeState.snakeDir = {x:1,y:0};
  arcadeState.snakeNextDir = {x:1,y:0};
  arcadeState.snakeOver = false;
  arcadeState.snakeScore = 0;
  document.getElementById('snakeScore').textContent = '0';
  document.getElementById('snakeResult').textContent = '';
  const cv = document.getElementById('snakeCanvas');
  cv.width = SNAKE_COLS*SNAKE_CELL; cv.height = SNAKE_ROWS*SNAKE_CELL;
  snakePlaceFood();
  document.addEventListener('keydown', snakeKeydown);
  arcadeState.snakeTimer = setInterval(snakeTick, 160);
  drawSnake();
}
function snakePlaceFood() {
  let fx, fy, onSnake;
  do {
    fx = Math.floor(Math.random()*SNAKE_COLS);
    fy = Math.floor(Math.random()*SNAKE_ROWS);
    onSnake = arcadeState.snakeBody.some(s=>s.x===fx&&s.y===fy);
  } while(onSnake);
  arcadeState.snakeFood = {x:fx,y:fy};
}
function snakeKeydown(e) {
  const d = arcadeState.snakeDir;
  if((e.code==='ArrowUp'||e.code==='KeyW') && d.y===0) arcadeState.snakeNextDir = {x:0,y:-1};
  else if((e.code==='ArrowDown'||e.code==='KeyS') && d.y===0) arcadeState.snakeNextDir = {x:0,y:1};
  else if((e.code==='ArrowLeft'||e.code==='KeyA') && d.x===0) arcadeState.snakeNextDir = {x:-1,y:0};
  else if((e.code==='ArrowRight'||e.code==='KeyD') && d.x===0) arcadeState.snakeNextDir = {x:1,y:0};
  else return;
  e.preventDefault();
}
function snakeTick() {
  if(arcadeState.snakeOver) return;
  arcadeState.snakeDir = arcadeState.snakeNextDir;
  const body = arcadeState.snakeBody;
  const head = {x: body[0].x + arcadeState.snakeDir.x, y: body[0].y + arcadeState.snakeDir.y};
  if(head.x<0||head.x>=SNAKE_COLS||head.y<0||head.y>=SNAKE_ROWS || body.some(s=>s.x===head.x&&s.y===head.y)) {
    snakeGameOver(); return;
  }
  body.unshift(head);
  if(head.x===arcadeState.snakeFood.x && head.y===arcadeState.snakeFood.y) {
    arcadeState.snakeScore++;
    document.getElementById('snakeScore').textContent = arcadeState.snakeScore;
    snakePlaceFood();
  } else {
    body.pop();
  }
  drawSnake();
}
function drawSnake() {
  const cv = document.getElementById('snakeCanvas');
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,cv.width,cv.height);
  const s = SNAKE_CELL;
  ctx.fillStyle = '#ff4d6d';
  ctx.fillRect(arcadeState.snakeFood.x*s+3, arcadeState.snakeFood.y*s+3, s-6, s-6);
  arcadeState.snakeBody.forEach((seg,i)=>{
    ctx.fillStyle = i===0 ? '#4dff88' : '#2fae66';
    ctx.fillRect(seg.x*s+1, seg.y*s+1, s-2, s-2);
  });
}
function snakeGameOver() {
  arcadeState.snakeOver = true;
  clearInterval(arcadeState.snakeTimer);
  document.removeEventListener('keydown', snakeKeydown);
  const reward = arcadeState.snakeScore * 4;
  sipDollars += reward; updateSIP();
  document.getElementById('snakeResult').textContent = `Game over! Ate ${arcadeState.snakeScore} — +${reward} S.I.P.`;
  showNotif(`🐍 Snake: ${arcadeState.snakeScore} eaten (+${reward} S.I.P.)`);
}
function stopSnake() {
  clearInterval(arcadeState.snakeTimer);
  document.removeEventListener('keydown', snakeKeydown);
}

// ── Brick Breaker ──
function openBreakout() { arcadeGoTo('breakoutScreen'); startBreakout(); }
function startBreakout() {
  if (!arcadeCharge(ARCADE_FEES.breakout, 'breakoutResult')) return;
  stopBreakout();
  const cv = document.getElementById('breakoutCanvas');
  cv.width = 400; cv.height = 300;
  arcadeState.brkPaddleX = 165;
  arcadeState.brkBall = {x:200, y:250, vx:2.6, vy:-3.2};
  arcadeState.brkBricks = [];
  const cols=6, rows=4, bw=60, bh=16, gap=4, offX=8, offY=24;
  const colors = ['#ff4d6d','#ffa64d','#ffe14d','#4dff88'];
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
    arcadeState.brkBricks.push({x:offX+c*(bw+gap), y:offY+r*(bh+gap), w:bw, h:bh, alive:true, color:colors[r%colors.length]});
  }
  arcadeState.brkOver = false;
  arcadeState.brkBroken = 0;
  arcadeState.brkKeys = {left:false, right:false};
  document.getElementById('breakoutResult').textContent = '';
  document.getElementById('breakoutBroken').textContent = '0';
  document.addEventListener('keydown', breakoutKeydown);
  document.addEventListener('keyup', breakoutKeyup);
  breakoutLoop();
}
function breakoutKeydown(e) {
  if(e.code==='ArrowLeft'||e.code==='KeyA') arcadeState.brkKeys.left = true;
  else if(e.code==='ArrowRight'||e.code==='KeyD') arcadeState.brkKeys.right = true;
  else return;
  e.preventDefault();
}
function breakoutKeyup(e) {
  if(e.code==='ArrowLeft'||e.code==='KeyA') arcadeState.brkKeys.left = false;
  else if(e.code==='ArrowRight'||e.code==='KeyD') arcadeState.brkKeys.right = false;
}
function breakoutLoop() {
  if(arcadeState.brkOver) return;
  const cv = document.getElementById('breakoutCanvas');
  if(arcadeState.brkKeys.left) arcadeState.brkPaddleX = Math.max(0, arcadeState.brkPaddleX - 5);
  if(arcadeState.brkKeys.right) arcadeState.brkPaddleX = Math.min(cv.width-70, arcadeState.brkPaddleX + 5);
  const b = arcadeState.brkBall;
  b.x += b.vx; b.y += b.vy;
  if(b.x < 6 || b.x > cv.width-6) b.vx *= -1;
  if(b.y < 6) b.vy *= -1;
  if(b.y > 274 && b.y < 284 && b.x > arcadeState.brkPaddleX && b.x < arcadeState.brkPaddleX+70 && b.vy > 0) {
    const hitPos = (b.x - (arcadeState.brkPaddleX+35)) / 35;
    b.vx = hitPos * 4;
    b.vy = -Math.abs(b.vy);
  }
  for(const brick of arcadeState.brkBricks) {
    if(!brick.alive) continue;
    if(b.x > brick.x && b.x < brick.x+brick.w && b.y > brick.y && b.y < brick.y+brick.h) {
      brick.alive = false;
      b.vy *= -1;
      arcadeState.brkBroken++;
      document.getElementById('breakoutBroken').textContent = arcadeState.brkBroken;
      break;
    }
  }
  if(b.y > cv.height) { breakoutLose(); return; }
  if(arcadeState.brkBricks.every(br=>!br.alive)) { breakoutWin(); return; }
  drawBreakout();
  arcadeState.brkAnimId = requestAnimationFrame(breakoutLoop);
}
function drawBreakout() {
  const cv = document.getElementById('breakoutCanvas');
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,cv.width,cv.height);
  arcadeState.brkBricks.forEach(br=>{ if(br.alive){ ctx.fillStyle=br.color; ctx.fillRect(br.x,br.y,br.w,br.h); } });
  ctx.fillStyle = '#00e5ff'; ctx.fillRect(arcadeState.brkPaddleX, 278, 70, 8);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(arcadeState.brkBall.x, arcadeState.brkBall.y, 6, 0, Math.PI*2); ctx.fill();
}
function breakoutWin() {
  arcadeState.brkOver = true;
  stopBreakout();
  const reward = 100;
  sipDollars += reward; updateSIP();
  document.getElementById('breakoutResult').textContent = `All bricks cleared! +${reward} S.I.P.`;
  showNotif(`🧱 Brick Breaker cleared! (+${reward} S.I.P.)`);
}
function breakoutLose() {
  arcadeState.brkOver = true;
  stopBreakout();
  const reward = arcadeState.brkBroken * 3;
  sipDollars += reward; updateSIP();
  document.getElementById('breakoutResult').textContent = `Ball dropped! Broke ${arcadeState.brkBroken} bricks — +${reward} S.I.P.`;
  showNotif(`🧱 Brick Breaker: ${arcadeState.brkBroken} broken (+${reward} S.I.P.)`);
}
function stopBreakout() {
  cancelAnimationFrame(arcadeState.brkAnimId);
  document.removeEventListener('keydown', breakoutKeydown);
  document.removeEventListener('keyup', breakoutKeyup);
}

// ── Quick Draw (Reaction Test) ──
function openReaction() { arcadeGoTo('reactionScreen'); startReaction(); }
function startReaction() {
  if (!arcadeCharge(ARCADE_FEES.reaction, 'reactionResult')) return;
  stopReaction();
  arcadeState.rxnState = 'waiting';
  const box = document.getElementById('reactionBox');
  box.style.background = '#552222';
  box.textContent = 'Wait for green...';
  document.getElementById('reactionResult').textContent = '';
  const delay = 1200 + Math.random()*2500;
  arcadeState.rxnTimer = setTimeout(()=>{
    arcadeState.rxnState = 'ready';
    arcadeState.rxnStart = performance.now();
    box.style.background = '#1a7a3a';
    box.textContent = 'CLICK NOW!';
  }, delay);
}
function reactionClick() {
  const box = document.getElementById('reactionBox');
  if(arcadeState.rxnState === 'waiting') {
    clearTimeout(arcadeState.rxnTimer);
    arcadeState.rxnState = 'idle';
    box.style.background = '#552222';
    box.textContent = 'Too soon! Tap to retry';
    document.getElementById('reactionResult').textContent = 'You clicked before it turned green — no reward this round.';
    return;
  }
  if(arcadeState.rxnState === 'ready') {
    const ms = Math.round(performance.now() - arcadeState.rxnStart);
    arcadeState.rxnState = 'idle';
    let reward;
    if(ms < 250) reward = 40; else if(ms < 400) reward = 25; else if(ms < 600) reward = 15; else reward = 8;
    sipDollars += reward; updateSIP();
    box.style.background = '#552222';
    box.textContent = 'Tap to try again';
    document.getElementById('reactionResult').textContent = `${ms}ms reaction time! +${reward} S.I.P.`;
    showNotif(`⚡ Quick Draw: ${ms}ms (+${reward} S.I.P.)`);
    return;
  }
  startReaction();
}
function stopReaction() {
  clearTimeout(arcadeState.rxnTimer);
  arcadeState.rxnState = 'idle';
}

// ── Tetris ──
const TETRIS_COLS = 10, TETRIS_ROWS = 20, TETRIS_CELL = 18;
const TETROMINOES = {
  I: [[[0,1],[1,1],[2,1],[3,1]], [[2,0],[2,1],[2,2],[2,3]], [[0,2],[1,2],[2,2],[3,2]], [[1,0],[1,1],[1,2],[1,3]]],
  O: [[[1,0],[2,0],[1,1],[2,1]], [[1,0],[2,0],[1,1],[2,1]], [[1,0],[2,0],[1,1],[2,1]], [[1,0],[2,0],[1,1],[2,1]]],
  T: [[[1,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[2,1],[1,2]], [[0,1],[1,1],[2,1],[1,2]], [[1,0],[0,1],[1,1],[1,2]]],
  S: [[[1,0],[2,0],[0,1],[1,1]], [[1,0],[1,1],[2,1],[2,2]], [[1,1],[2,1],[0,2],[1,2]], [[0,0],[0,1],[1,1],[1,2]]],
  Z: [[[0,0],[1,0],[1,1],[2,1]], [[2,0],[1,1],[2,1],[1,2]], [[0,1],[1,1],[1,2],[2,2]], [[1,0],[0,1],[1,1],[0,2]]],
  J: [[[0,0],[0,1],[1,1],[2,1]], [[1,0],[2,0],[1,1],[1,2]], [[0,1],[1,1],[2,1],[2,2]], [[1,0],[1,1],[0,2],[1,2]]],
  L: [[[2,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,2]], [[0,1],[1,1],[2,1],[0,2]], [[0,0],[1,0],[1,1],[1,2]]]
};
const TETRO_COLORS = { I:'#4dd2ff', O:'#ffe14d', T:'#c04dff', S:'#4dff88', Z:'#ff4d6d', J:'#4d6dff', L:'#ffa64d' };

function openTetris() { arcadeGoTo('tetrisScreen'); startTetris(); }
function startTetris() {
  if (!arcadeCharge(ARCADE_FEES.tetris, 'tetrisResult')) return;
  stopTetris();
  arcadeState.tetGrid = Array.from({length:TETRIS_ROWS}, ()=>Array(TETRIS_COLS).fill(null));
  arcadeState.tetOver = false;
  arcadeState.tetLines = 0;
  document.getElementById('tetrisLines').textContent = '0';
  document.getElementById('tetrisResult').textContent = '';
  const cv = document.getElementById('tetrisCanvas');
  cv.width = TETRIS_COLS*TETRIS_CELL; cv.height = TETRIS_ROWS*TETRIS_CELL;
  tetSpawnPiece();
  document.addEventListener('keydown', tetKeydown);
  arcadeState.tetTimer = setInterval(tetDrop, 500);
  drawTetris();
}
function tetCells(piece) {
  return TETROMINOES[piece.type][piece.rot].map(([dx,dy])=>({x:piece.x+dx, y:piece.y+dy}));
}
function tetCollides(piece) {
  return tetCells(piece).some(c => c.x<0 || c.x>=TETRIS_COLS || c.y>=TETRIS_ROWS || (c.y>=0 && arcadeState.tetGrid[c.y][c.x]));
}
function tetSpawnPiece() {
  const types = Object.keys(TETROMINOES);
  const type = types[Math.floor(Math.random()*types.length)];
  arcadeState.tetPiece = { type, rot:0, x:3, y:0 };
  if (tetCollides(arcadeState.tetPiece)) tetGameOver();
}
function tetKeydown(e) {
  if(arcadeState.tetOver) return;
  const p = arcadeState.tetPiece;
  if(e.code==='ArrowLeft') { const np={type:p.type,rot:p.rot,x:p.x-1,y:p.y}; if(!tetCollides(np)) arcadeState.tetPiece=np; }
  else if(e.code==='ArrowRight') { const np={type:p.type,rot:p.rot,x:p.x+1,y:p.y}; if(!tetCollides(np)) arcadeState.tetPiece=np; }
  else if(e.code==='ArrowDown') { tetDrop(); return; }
  else if(e.code==='ArrowUp'||e.code==='KeyX') { const np={type:p.type,rot:(p.rot+1)%4,x:p.x,y:p.y}; if(!tetCollides(np)) arcadeState.tetPiece=np; }
  else return;
  e.preventDefault();
  drawTetris();
}
function tetDrop() {
  if(arcadeState.tetOver) return;
  const p = arcadeState.tetPiece;
  const np = {type:p.type, rot:p.rot, x:p.x, y:p.y+1};
  if(!tetCollides(np)) {
    arcadeState.tetPiece = np;
  } else {
    tetLockPiece();
    tetClearLines();
    tetSpawnPiece();
  }
  drawTetris();
}
function tetLockPiece() {
  const color = TETRO_COLORS[arcadeState.tetPiece.type];
  tetCells(arcadeState.tetPiece).forEach(c => { if(c.y>=0) arcadeState.tetGrid[c.y][c.x] = color; });
}
function tetClearLines() {
  let cleared = 0;
  for(let y=TETRIS_ROWS-1; y>=0; y--) {
    if(arcadeState.tetGrid[y].every(cell=>cell)) {
      arcadeState.tetGrid.splice(y,1);
      arcadeState.tetGrid.unshift(Array(TETRIS_COLS).fill(null));
      cleared++;
      y++;
    }
  }
  if(cleared > 0) {
    arcadeState.tetLines += cleared;
    document.getElementById('tetrisLines').textContent = arcadeState.tetLines;
  }
}
function drawTetris() {
  const cv = document.getElementById('tetrisCanvas');
  const ctx = cv.getContext('2d');
  const s = TETRIS_CELL;
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,cv.width,cv.height);
  for(let y=0;y<TETRIS_ROWS;y++) for(let x=0;x<TETRIS_COLS;x++) {
    if(arcadeState.tetGrid[y][x]) { ctx.fillStyle=arcadeState.tetGrid[y][x]; ctx.fillRect(x*s+1,y*s+1,s-2,s-2); }
  }
  if(arcadeState.tetPiece) {
    ctx.fillStyle = TETRO_COLORS[arcadeState.tetPiece.type];
    tetCells(arcadeState.tetPiece).forEach(c=>{ if(c.y>=0) ctx.fillRect(c.x*s+1,c.y*s+1,s-2,s-2); });
  }
}
function tetGameOver() {
  arcadeState.tetOver = true;
  clearInterval(arcadeState.tetTimer);
  document.removeEventListener('keydown', tetKeydown);
  const reward = arcadeState.tetLines * 15;
  sipDollars += reward; updateSIP();
  document.getElementById('tetrisResult').textContent = `Game over! Cleared ${arcadeState.tetLines} lines — +${reward} S.I.P.`;
  showNotif(`🧩 Tetris: ${arcadeState.tetLines} lines (+${reward} S.I.P.)`);
}
function stopTetris() {
  clearInterval(arcadeState.tetTimer);
  document.removeEventListener('keydown', tetKeydown);
}

// ── Claw Machines — 10 real machines, each with its own 5-prize pool. Unlike the other 8
// games (pay once per round), a claw machine charges per DROP, same as a real one — you can
// keep dropping as long as you can afford it and prizes remain. Rarer/pricier prizes are
// genuinely harder to grab (lower success chance), not just cosmetic flavor text.
const CLAW_MACHINES = [
  { name:'Plushie Palace',  color:0xff69b4, prizes:[{emoji:'🐸',name:'Frog Plush',value:25},{emoji:'🧸',name:'Teddy Bear',value:30},{emoji:'🐰',name:'Bunny Plush',value:35},{emoji:'🐼',name:'Panda Plush',value:40},{emoji:'🦄',name:'Unicorn Plush',value:55}] },
  { name:'Dino Dig',        color:0x4caf50, prizes:[{emoji:'🌋',name:'Volcano Rock Toy',value:25},{emoji:'🥚',name:'Dino Egg',value:20},{emoji:'🦴',name:'Fossil Bone',value:30},{emoji:'🦕',name:'Brontosaurus Toy',value:35},{emoji:'🦖',name:'T-Rex Toy',value:45}] },
  { name:'Space Cadets',    color:0x3f51b5, prizes:[{emoji:'🌟',name:'Star Charm',value:20},{emoji:'🧑‍🚀',name:'Astronaut Figure',value:40},{emoji:'👽',name:'Alien Figure',value:35},{emoji:'🚀',name:'Rocket Toy',value:40},{emoji:'🛸',name:'UFO Toy',value:50}] },
  { name:'Ocean Critters',  color:0x00bcd4, prizes:[{emoji:'🦀',name:'Crab Toy',value:20},{emoji:'🐢',name:'Turtle Toy',value:30},{emoji:'🐬',name:'Dolphin Plush',value:35},{emoji:'🐙',name:'Octopus Plush',value:35},{emoji:'🐳',name:'Whale Plush',value:45}] },
  { name:'Robo Workshop',   color:0x9e9e9e, prizes:[{emoji:'⚙️',name:'Gear Charm',value:15},{emoji:'🔋',name:'Battery Bot',value:25},{emoji:'🛠️',name:'Tool Set Toy',value:30},{emoji:'📡',name:'Satellite Toy',value:35},{emoji:'🤖',name:'Robot Toy',value:45}] },
  { name:'Candy Corner',    color:0xff4081, prizes:[{emoji:'🍭',name:'Lollipop Plush',value:15},{emoji:'🍬',name:'Candy Charm',value:15},{emoji:'🍫',name:'Chocolate Bar Charm',value:20},{emoji:'🧁',name:'Cupcake Toy',value:25},{emoji:'🍩',name:'Donut Pillow',value:30}] },
  { name:"Dragon's Hoard",  color:0xd32f2f, prizes:[{emoji:'🗡️',name:'Toy Sword',value:35},{emoji:'👑',name:'Tiny Crown',value:45},{emoji:'🐉',name:'Dragon Figure',value:50},{emoji:'🔥',name:'Fire Gem',value:55},{emoji:'💎',name:'Gem Charm',value:60}] },
  { name:'Barnyard Buddies',color:0xffb300, prizes:[{emoji:'🐔',name:'Chicken Toy',value:20},{emoji:'🐷',name:'Pig Plush',value:25},{emoji:'🐮',name:'Cow Plush',value:30},{emoji:'🐑',name:'Sheep Plush',value:30},{emoji:'🐴',name:'Horse Plush',value:35}] },
  { name:'Hero HQ',         color:0x1976d2, prizes:[{emoji:'⚡',name:'Bolt Charm',value:20},{emoji:'🎭',name:'Mask Charm',value:25},{emoji:'💥',name:'Power Fist',value:30},{emoji:'🛡️',name:'Shield Toy',value:35},{emoji:'🦸',name:'Hero Figure',value:45}] },
  { name:'Gem Vault',       color:0x8e24aa, prizes:[{emoji:'🪙',name:'Gold Coin Toy',value:25},{emoji:'💠',name:'Crystal Charm',value:40},{emoji:'💍',name:'Ring Charm',value:35},{emoji:'🔮',name:'Crystal Ball',value:55},{emoji:'💎',name:'Diamond Charm',value:65}] },
];
const CLAW_SLOTS = 5; // one prize per slot, claw moves in slot increments
let clawState = { machineId:0, clawX:2, prizes:[], dropping:false, won:[] };
function openClaw(id) {
  arcadeGoTo('clawScreen');
  const m = CLAW_MACHINES[id];
  clawState.machineId = id;
  clawState.clawX = Math.floor(CLAW_SLOTS/2);
  clawState.prizes = m.prizes.map(p=>({...p}));
  clawState.dropping = false;
  clawState.won = [];
  document.getElementById('clawTitle').textContent = `🧸 ${m.name}`;
  document.getElementById('clawResult').textContent = '';
  const cv = document.getElementById('clawCanvas');
  cv.width = 340; cv.height = 260;
  document.addEventListener('keydown', clawKeydown);
  drawClaw();
}
function clawKeydown(e) {
  if(clawState.dropping) return;
  if(e.code==='ArrowLeft')  { clawState.clawX = Math.max(0, clawState.clawX-1); drawClaw(); }
  else if(e.code==='ArrowRight') { clawState.clawX = Math.min(CLAW_SLOTS-1, clawState.clawX+1); drawClaw(); }
  else if(e.code==='ArrowDown'||e.code==='Space') { e.preventDefault(); clawDrop(); }
}
function clawDrop() {
  if(clawState.dropping) return;
  if(clawState.prizes.every(p=>!p)) return; // machine already empty
  const target = clawState.prizes[clawState.clawX];
  const resultEl = document.getElementById('clawResult');
  if(!target) { resultEl.textContent = 'Empty slot — move to a prize first!'; return; }
  if (!arcadeCharge(ARCADE_FEES.claw, 'clawResult')) return;
  clawState.dropping = true;
  resultEl.textContent = '🦾 Dropping...';
  let step = 0;
  const anim = setInterval(() => {
    step++;
    drawClaw(step*0.18);
    if(step >= 5) {
      clearInterval(anim);
      // Rarer/pricier prizes are genuinely harder to win — real risk/reward, not decoration.
      const chance = Math.max(0.2, Math.min(0.75, 0.9 - target.value*0.01));
      const success = Math.random() < chance;
      if(success) {
        clawState.prizes[clawState.clawX] = null;
        clawState.won.push(target);
        sipDollars += target.value; updateSIP();
        resultEl.textContent = `You grabbed the ${target.emoji} ${target.name}! +${target.value} S.I.P.`;
        showNotif(`🧸 Claw win: ${target.emoji} ${target.name} (+${target.value} S.I.P.)`);
      } else {
        resultEl.textContent = `So close! The ${target.emoji} ${target.name} slipped away.`;
      }
      clawState.dropping = false;
      drawClaw();
      if(clawState.prizes.every(p=>!p)) {
        const total = clawState.won.reduce((s,p)=>s+p.value,0);
        resultEl.textContent = `Machine empty! You won ${clawState.won.length} prizes worth ${total} S.I.P. total.`;
      }
    }
  }, 90);
}
function drawClaw(dropProgress) {
  const cv = document.getElementById('clawCanvas');
  const ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,w,h);
  const slotW = w/CLAW_SLOTS;
  // prizes on the floor
  clawState.prizes.forEach((p,i)=>{
    if(!p) return;
    ctx.font = '32px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(p.emoji, slotW*i+slotW/2, h-40);
    ctx.fillStyle='#9ab'; ctx.font='10px Arial';
    ctx.fillText(p.name, slotW*i+slotW/2, h-16);
  });
  // claw
  const clawCX = slotW*clawState.clawX + slotW/2;
  const clawY = 20 + (dropProgress ? Math.min(dropProgress,1)*(h-90) : 0);
  ctx.strokeStyle = '#ccc'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(clawCX, 0); ctx.lineTo(clawCX, clawY); ctx.stroke();
  ctx.font = '26px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('🦾', clawCX, clawY);
}
function stopClaw() {
  document.removeEventListener('keydown', clawKeydown);
  clawState.dropping = false;
}

// ─── WHISPERING WOODS — real choppable trees + a crafting table ──────────────
const WOODS_CENTER = { x:200, z:-320 };
const CRAFT_TABLE = { x:WOODS_CENTER.x, z:WOODS_CENTER.z+14 };
let WOOD_TREES = [];
function chopTree(tree) {
  if (tree.fallen) {
    const secsLeft = Math.max(0, Math.ceil((tree.respawnAt - Date.now())/1000));
    showNotif(`🌳 This tree is down — regrowing in ${secsLeft}s`);
    return;
  }
  tree.hp--;
  triggerSwing();
  sfx.chop();
  woodCount += 1;
  if (tree.hp <= 0) {
    woodCount += 2; // felling bonus on top of this hit's +1 — matches fellTree()'s own +3 total
    fellTree(tree);
  } else {
    updateWood();
    showNotif(`🪓 Chop! +1 🪵 Wood (${tree.hp} hit${tree.hp===1?'':'s'} left)`);
  }
}
// Extracted so a car ram (item 160) can instantly fell a tree in one hit (a real car obviously
// doesn't need 3 chops) while still granting the SAME real +3 wood total and respawn timer as
// normally chopping one down — no economy exploit from ramming instead of chopping.
function fellTree(tree) {
  tree.fallen = true;
  tree.canopy.visible = false;
  tree.trunk.scale.y = 0.15;
  tree.trunk.position.y = tree.baseY * 0.15;
  sfx.earn();
  updateWood();
  showNotif('🌳 Tree down! +3 🪵 Wood total');
  const respawnMs = 45000;
  tree.respawnAt = Date.now() + respawnMs;
  setTimeout(() => {
    tree.fallen = false; tree.hp = tree.maxHp;
    tree.canopy.visible = true;
    tree.trunk.scale.y = 1;
    tree.trunk.position.y = tree.baseY;
    showNotif('🌱 A tree grew back in Whispering Woods!');
  }, respawnMs);
}
// Real 11x11 jittered grid (not hand-listed) so it scales cleanly to a real forest —
// spacing (10) keeps worst-case neighbor distance well above 2x the chop-zone radius (2.5),
// and cells too close to the Crafting Table or Training Dummy's own fixed relative positions
// are dropped before the first 100 survivors are kept, so neither zone can ever overlap a tree's.
function generateWoodsOffsets(count) {
  const SPACING = 10, COLS = 11, ROWS = 11, HALF = (COLS-1)/2;
  const craftRel = { x:0, z:14 }, dummyRel = { x:25, z:0 };
  const candidates = [];
  for (let row=0; row<ROWS; row++) {
    for (let col=0; col<COLS; col++) {
      const dx = (col-HALF)*SPACING + (Math.random()-0.5)*3;
      const dz = (row-HALF)*SPACING + (Math.random()-0.5)*3;
      if (Math.hypot(dx-craftRel.x, dz-craftRel.z) < 8) continue;
      if (Math.hypot(dx-dummyRel.x, dz-dummyRel.z) < 8) continue;
      candidates.push([dx,dz]);
    }
  }
  return candidates.slice(0, count);
}
function buildWoodsArea() {
  buildLogoSign('WHISPERING WOODS', '🌲', '#2d7a2d', '#8B5A2B', WOODS_CENTER.x, 7, WOODS_CENTER.z-12);
  const offsets = generateWoodsOffsets(100);
  offsets.forEach(([dx,dz]) => {
    const x = WOODS_CENTER.x+dx, z = WOODS_CENTER.z+dz, baseY = 2.5;
    const trunk = box(0.7,5,0.7, 0x5c3a1e, x, baseY, z);
    const canopy = box(4,4,4, 0x2d7a2d, x, 6.5, z);
    treeMeshes.push(canopy); // rides along with the existing seasonal-color system too
    addCol(CITY_COLS, x, z, 0.5, 0.5);
    const tree = { x, z, baseY, hp:3, maxHp:3, fallen:false, respawnAt:0, trunk, canopy };
    WOOD_TREES.push(tree);
    CITY_ZONES.push({ x, z, r:2.5, label:'🌳 Chop Tree for Wood', action: () => chopTree(tree) });
  });

  // Crafting Table, a short walk south of the grove
  box(2.4,0.9,1.4, 0x6b4423, CRAFT_TABLE.x, 0.45, CRAFT_TABLE.z);
  box(2.6,0.15,1.6, 0x5c3a1e, CRAFT_TABLE.x, 0.95, CRAFT_TABLE.z);
  buildLogoSign('CRAFTING TABLE', '🔨', '#8B5A2B', '#ffd54a', CRAFT_TABLE.x, 2.4, CRAFT_TABLE.z-1.4);
  addCol(CITY_COLS, CRAFT_TABLE.x, CRAFT_TABLE.z, 1.3, 0.8);
  CITY_ZONES.push({ x:CRAFT_TABLE.x, z:CRAFT_TABLE.z+2.5, r:2.5, label:'🔨 Open Crafting Table', action: openCrafting });

  // Practice Dummy, well clear of the trees/table so its zone can't overlap theirs
  DUMMY.x = WOODS_CENTER.x + 25; DUMMY.z = WOODS_CENTER.z;
  const dg = new THREE.Group(); dg.position.set(DUMMY.x, 0, DUMMY.z); scene.add(dg);
  const dpost = new THREE.Mesh(new THREE.BoxGeometry(0.3,3,0.3), mat(0x5c3a1e)); dpost.position.set(0,1.5,0); dg.add(dpost);
  const dbody = new THREE.Mesh(new THREE.BoxGeometry(0.8,1.6,0.5), mat(0xc9a06a)); dbody.position.set(0,2.6,0); dg.add(dbody);
  DUMMY.mesh = dg;
  buildLogoSign('TRAINING DUMMY', '🥊', '#c9a06a', '#ff4444', DUMMY.x, 4.2, DUMMY.z-1.4);
  addCol(CITY_COLS, DUMMY.x, DUMMY.z, 0.6, 0.6);
  CITY_ZONES.push({ x:DUMMY.x, z:DUMMY.z+2.5, r:2.5, label:'🥊 Punch Training Dummy', action: hitDummy });
}

// ── Crafting — wood/scrap/S.I.P./material recipes; weapon/armor recipes plug into the real WEAPONS/ARMOR system ──
// `mats` = {material_id: qty} consumed from playerInventory (the 100 Dump-extracted materials)
const CRAFT_RECIPES = [
  { id:'club',       name:'Wooden Club',        emoji:'🏏', wood:5,  type:'weapon' },
  { id:'chair',      name:'Wooden Chair',       emoji:'🪑', wood:4,  type:'item' },
  { id:'frame',      name:'Wood Picture Frame', emoji:'🖼️', wood:3,  type:'item' },
  { id:'campfire',   name:'Campfire Kit',       emoji:'🔥', wood:6,  type:'item' },
  { id:'metalsword', name:'Metal Sword',        emoji:'🗡️', scrap:10, sip:100, type:'weapon' },
  { id:'scrap',      name:'Scrap Armor',        emoji:'🔩', scrap:15, type:'armor' },
  { id:'statue',     name:'Scrap Statue',       emoji:'🤖', scrap:8,  type:'item' },
  { id:'battleaxe',  name:'Battle Axe',         emoji:'🪓', wood:4, mats:{steel_plate:4, splintered_wood:2}, type:'weapon' },
  { id:'crystalsword',name:'Crystal Sword',     emoji:'💎', mats:{crystal_fragment:3, titanium_shard:2, gold_nugget:1}, type:'weapon' },
  { id:'titanium',   name:'Titanium Armor',     emoji:'🦾', mats:{titanium_shard:5, steel_plate:3, nylon_cord:2}, type:'armor' },
  { id:'lantern',    name:'Junk Lantern',       emoji:'🏮', mats:{glass_shard:2, led_light:1, copper_wire:2}, type:'item' },
  { id:'toolbox',    name:'Restored Toolbox',   emoji:'🧰', mats:{rusty_bolt:3, cracked_handle:1, steel_plate:1}, type:'item' },
];
function craftCostText(r) {
  const parts = [];
  if(r.wood)  parts.push(`🪵 ${r.wood} Wood`);
  if(r.scrap) parts.push(`🔩 ${r.scrap} Scrap`);
  if(r.sip)   parts.push(`💰 ${r.sip} S.I.P.`);
  if(r.mats) Object.entries(r.mats).forEach(([id,qty]) => {
    const m = MATERIALS.find(x=>x.id===id);
    parts.push(`${m.emoji} ${qty} ${m.name}`);
  });
  return parts.join(' + ');
}
function hasMats(mats) {
  if(!mats) return true;
  return Object.entries(mats).every(([id,qty]) => playerInventory[id] && playerInventory[id].qty >= qty);
}
function spendMats(mats) {
  if(!mats) return;
  Object.entries(mats).forEach(([id,qty]) => {
    playerInventory[id].qty -= qty;
    if(playerInventory[id].qty <= 0) delete playerInventory[id];
  });
}
function canAffordRecipe(r) {
  return woodCount >= (r.wood||0) && scrapMetal >= (r.scrap||0) && sipDollars >= (r.sip||0) && hasMats(r.mats);
}
function openCrafting() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('craftOverlay').style.display = 'flex';
  renderCraftItems();
}
function closeCrafting() {
  document.getElementById('craftOverlay').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderCraftItems() {
  document.getElementById('craftWood').textContent = woodCount;
  const cs = document.getElementById('craftScrap'); if(cs) cs.textContent = scrapMetal;
  const list = document.getElementById('craftItems');
  list.innerHTML = '';
  CRAFT_RECIPES.forEach((r,i) => {
    const owned = (r.type==='weapon' && ownedWeapons.includes(r.id)) || (r.type==='armor' && ownedArmor.includes(r.id));
    const d = document.createElement('div'); d.className='shopItem';
    d.innerHTML = `<div class="siName">${r.emoji} ${r.name}</div>
      <div class="siCost">${craftCostText(r)}</div>
      <button class="shopBtn" onclick="craftItem(${i})" ${(!owned && !canAffordRecipe(r))?'disabled':''}>${owned?'Equip':'Craft'}</button>`;
    list.appendChild(d);
  });
}
function craftItem(i) {
  const r = CRAFT_RECIPES[i];
  if(r.type==='weapon' && ownedWeapons.includes(r.id)) { equipWeapon(r.id); showNotif(`✅ Equipped ${r.emoji} ${r.name}!`); renderCraftItems(); return; }
  if(r.type==='armor' && ownedArmor.includes(r.id)) { equipArmor(r.id); showNotif(`✅ Equipped ${r.emoji} ${r.name}!`); renderCraftItems(); return; }
  if(!canAffordRecipe(r)) { showNotif(`❌ Need ${craftCostText(r)}`); return; }
  if(r.wood)  { woodCount -= r.wood; updateWood(); }
  if(r.scrap) { scrapMetal -= r.scrap; updateScrapMetal(); }
  if(r.sip)   { sipDollars -= r.sip; updateSIP(); }
  spendMats(r.mats);
  if(r.type==='weapon') {
    ownedWeapons.push(r.id);
    equipWeapon(r.id);
  } else if(r.type==='armor') {
    ownedArmor.push(r.id);
    equipArmor(r.id);
  } else {
    addToInventory(r.id, r.name, r.emoji);
    saveCurrentUser();
  }
  sfx.buy();
  showNotif(`🔨 Crafted ${r.emoji} ${r.name}!`);
  renderCraftItems();
}

// ── Training Dummy — safe target to feel out weapon damage, zero risk to the player ──
let DUMMY = { x:0, z:0, hp:100, maxHp:100, defeated:false, mesh:null };
function hitDummy() {
  if(DUMMY.defeated) { showNotif('🪵 The dummy is down — repairing itself...'); return; }
  const dmg = getWeaponDamage();
  DUMMY.hp -= dmg;
  triggerSwing();
  sfx.hit();
  if(DUMMY.hp <= 0) {
    DUMMY.defeated = true;
    DUMMY.mesh.rotation.z = Math.PI/2.2;
    DUMMY.mesh.position.y = -0.8;
    showNotif(`🥊 Dummy defeated! Final hit for ${dmg}`);
    setTimeout(() => {
      DUMMY.hp = DUMMY.maxHp;
      DUMMY.defeated = false;
      DUMMY.mesh.rotation.z = 0;
      DUMMY.mesh.position.y = 0;
      showNotif('🪵 Training dummy repaired and ready!');
    }, 8000);
  } else {
    showNotif(`🥊 Hit dummy for ${dmg}! (${DUMMY.hp} HP left)`);
  }
}

// ─── SUNSET PLAINS — real buyable land plots + building on them ──────────────
// Land ownership lives in a SHARED registry (explox_land_owners in localStorage), separate from any
// one account's own save — plots are physical spots in the shared city, so whichever local account
// claims one should show as owned no matter which account is logged in when someone else walks by.
// plotBuildings/landInvites/landColor/landForSale still live on the OWNER's own account blob (same
// shape as before) — a visitor just reads/patches the owner's blob directly via getUserData()/
// patchUserData() rather than through their own currentUser save.
const LAND_CENTER = { x:-400, z:150 };
// `footprint` is the REAL fence width/depth in units (a 100x100 plot has footprint:100, half:50) —
// deliberately decoupled from `slotGrid` (the NxN build-slot grid), since a 100-unit mansion lot
// doesn't need 700+ buildable slots, just more real open yard space around a reasonable build grid.
const LAND_PLOTS = [
  { id:'lot1',  name:'Lot 1 (Small)',    price:500,   footprint:20,  slotGrid:2 },
  { id:'lot2',  name:'Lot 2 (Small)',    price:800,   footprint:20,  slotGrid:2 },
  { id:'lot3',  name:'Lot 3 (Medium)',   price:1200,  footprint:35,  slotGrid:3 },
  { id:'lot4',  name:'Lot 4 (Medium)',   price:1800,  footprint:35,  slotGrid:3 },
  { id:'lot5',  name:'Lot 5 (Medium)',   price:2500,  footprint:35,  slotGrid:3 },
  { id:'lot6',  name:'Lot 6 (Large)',    price:3500,  footprint:50,  slotGrid:4 },
  { id:'lot7',  name:'Lot 7 (Large)',    price:5000,  footprint:50,  slotGrid:4 },
  { id:'lot8',  name:'Lot 8 (Estate)',   price:7000,  footprint:70,  slotGrid:5 },
  { id:'lot9',  name:'Lot 9 (Ranch)',    price:12000, footprint:85,  slotGrid:6 },
  { id:'lot10', name:'Lot 10 (Mega — 100x100)', price:20000, footprint:100, slotGrid:7 },
];
function buildSlotsFor(n) {
  const spacing = 3.5, half = (n-1)/2, slots = [];
  for (let r=0; r<n; r++) for (let c=0; c<n; c++) slots.push([(c-half)*spacing, (r-half)*spacing]);
  return slots;
}
LAND_PLOTS.forEach(p => p.slots = buildSlotsFor(p.slotGrid));
function plotHalf(plot) { return plot.footprint/2; } // real fence half-extent — 20→10 ... 100→50
let ownedLand   = []; // array of LAND_PLOTS ids this account has personally bought at some point, persisted
let landInvites = {}; // { lotId: { guestAccountName: {sit,smash,paint,buy} } }, persisted
let landColor   = {}; // { lotId: hexNumber } — owner's chosen paint, persisted
let landForSale = {}; // { lotId: askingPriceOrUndefined } — persisted
let pendingNotices = []; // [{type,from,message}, ...] — real "while you were away" reports (invited/attacked), persisted, drained on next login
let LAND_PLOT_MESHES = []; // per-plot mesh refs, so buying/painting can tear down & rebuild just that plot
// 5 columns x 2 rows, spaced 130 apart both ways — comfortably clears even two adjacent 100-wide
// (half 50) plots regardless of which size lands in which slot, verified live via the same
// bounding-box check used for items 153/154.
function landPlotPos(idx) {
  const col = idx % 5, row = idx < 5 ? 0 : 1;
  return { cx: LAND_CENTER.x + (col-2)*130, cz: LAND_CENTER.z + (row===0?-65:65) };
}
function getLandOwners() {
  try { const d = JSON.parse(localStorage.getItem('explox_land_owners')); return (d && typeof d==='object') ? d : {}; }
  catch(e) { return {}; }
}
function setLandOwner(lotId, name) {
  const m = getLandOwners();
  if (name) m[lotId] = name; else delete m[lotId];
  localStorage.setItem('explox_land_owners', JSON.stringify(m));
}
function patchUserData(name, patchFn) {
  const data = getUserData(name);
  patchFn(data);
  localStorage.setItem('explox_user_' + name, JSON.stringify(data));
}
// Lazily claims this account's own already-owned plots (from the OLD per-account-only ownedLand
// array, item 137/138) into the new shared registry the first time this account logs in post-update.
function migrateLandOwnership() {
  const owners = getLandOwners();
  let changed = false;
  ownedLand.forEach(lotId => { if (!owners[lotId]) { owners[lotId] = currentUser; changed = true; } });
  if (changed) localStorage.setItem('explox_land_owners', JSON.stringify(owners));
}
function buildLandPlot(idx) {
  const plot = LAND_PLOTS[idx];
  const { cx, cz } = landPlotPos(idx);
  if(LAND_PLOT_MESHES[idx]) LAND_PLOT_MESHES[idx].forEach(m => scene.remove(m));
  const half = plotHalf(plot);
  const ownerName = getLandOwners()[plot.id] || null;
  const isMine = ownerName === currentUser;
  let fenceColor = 0x8a7050, emoji = '🏷️', label = `${plot.name} — ${plot.price.toLocaleString()} S.I.P.`;
  if (ownerName) {
    emoji = '🏡';
    const ownerData = isMine ? null : getUserData(ownerName);
    const customColor = isMine ? landColor[plot.id] : (ownerData.landColor && ownerData.landColor[plot.id]);
    fenceColor = (customColor !== undefined && customColor !== null) ? customColor : 0x3a9d3a;
    if (isMine) { label = `${plot.name} — Yours!`; }
    else {
      const forSale = ownerData.landForSale && ownerData.landForSale[plot.id];
      label = `${plot.name} — ${ownerName}'s Land${forSale ? ` (For Sale: ${forSale.toLocaleString()} S.I.P.)` : ''}`;
    }
  }
  const made = [];
  [[-half,-half],[half,-half],[half,half],[-half,half]].forEach(([dx,dz]) => made.push(box(0.3,1.2,0.3, fenceColor, cx+dx, 0.6, cz+dz)));
  made.push(box(half*2,0.15,0.15, fenceColor, cx, 0.9, cz-half));
  made.push(box(half*2,0.15,0.15, fenceColor, cx, 0.9, cz+half));
  made.push(box(0.15,0.15,half*2, fenceColor, cx-half, 0.9, cz));
  made.push(box(0.15,0.15,half*2, fenceColor, cx+half, 0.9, cz));
  made.push(buildLogoSign(label, emoji, ownerName?'#3a9d3a':'#8a7050', '#ffffff', cx, 2.4, cz+half+0.6));
  LAND_PLOT_MESHES[idx] = made;
  renderExistingBuildings(idx); // idempotent — restores anything already built here (world load or after a rebuild)
}
function buildSunsetPlains() {
  migrateLandOwnership();
  buildLogoSign('SUNSET PLAINS — LAND FOR SALE', '🗺️', '#8a7050', '#3a9d3a', LAND_CENTER.x, 5, LAND_CENTER.z-20);
  LAND_PLOTS.forEach((plot, idx) => {
    buildLandPlot(idx);
    const { cx, cz } = landPlotPos(idx);
    const half = plotHalf(plot);
    CITY_ZONES.push({ x:cx, z:cz, r:half*0.75, label:'🏗️ This Land Plot', action: () => enterLandPlot(idx) });
  });
}
function enterLandPlot(idx) {
  const plot = LAND_PLOTS[idx];
  const ownerName = getLandOwners()[plot.id] || null;
  if (!ownerName) { buyLand(idx); return; }
  const isMine = ownerName === currentUser;
  const ownerData = isMine ? null : getUserData(ownerName);
  const placed = isMine ? (plotBuildings[plot.id]||[]) : ((ownerData.plotBuildings && ownerData.plotBuildings[plot.id]) || []);
  const perm = isMine ? null : ((ownerData.landInvites && ownerData.landInvites[plot.id] && ownerData.landInvites[plot.id][currentUser]) || null);
  // Standing right at an actual placed house takes priority over the plot-wide build/visit menu —
  // same "walk up to the real structure" pattern as everything else. Owner always welcome in;
  // a guest needs SOME invite (any permission at all is enough to be let inside, not gated per-perm).
  const nearHouse = findNearestPlacedHouse(idx, placed);
  if (nearHouse && (isMine || perm)) { enterLandHouse(idx); return; }
  if (isMine) { openBuildMenu(idx); return; }
  openVisitLand(idx, ownerName);
}
function findNearestPlacedHouse(idx, placed) {
  const plot = LAND_PLOTS[idx];
  const { cx, cz } = landPlotPos(idx);
  const px = playerGroup.position.x, pz = playerGroup.position.z;
  const HOUSE_IDS = ['house','brickhouse','house2','house3','house4','mansion'];
  for (const entry of placed) {
    if (!HOUSE_IDS.includes(entry.id)) continue;
    const [ox,oz] = plot.slots[entry.slot];
    if (Math.hypot(px-(cx+ox), pz-(cz+oz)) < 2.6) return entry;
  }
  return null;
}

// ─── A REAL WALK-IN INTERIOR for any 'house'/'brickhouse' built on a land plot — one shared
// pocket-space room (same "shared template" idea as the Hotel's 3 room types), reuses the exact
// same sleepAtHome/sitOnSofa/cookMeal/readBook functions the player's own House uses. ───────────
const LAND_HOUSE_SPAWN = { x:80000, z:0 };
const LAND_HOUSE_EXIT  = { x:80000, z:6 };
const LAND_HOUSE_COLS = [];
let inLandHouse = false;
let landHouseReturnIdx = null;
function buildLandHouseInterior() {
  const ix = LAND_HOUSE_SPAWN.x, iz = 0;
  box(14,0.3,10, 0xc8aa80, ix,0.15,iz);        // floor
  box(14,0.2,10, 0xf5f0e8, ix,4.5,iz);         // ceiling
  box(14,4.5,0.3, 0xf5efe0, ix,2.25,iz-5);     // back wall
  box(5,4.5,0.3,  0xf5efe0, ix-4.5,2.25,iz+5); // front wall left
  box(5,4.5,0.3,  0xf5efe0, ix+4.5,2.25,iz+5); // front wall right
  box(0.3,4.5,10, 0xf5efe0, ix-7,2.25,iz);     // left wall
  box(0.3,4.5,10, 0xf5efe0, ix+7,2.25,iz);     // right wall
  box(2,3,0.1, 0x8B5E3C, ix,1.5,iz+5.1);       // door
  buildSign('🏠 Land House', ix,5,iz-4.9);

  // Bed
  box(3,0.3,4, 0x7a5c3a, ix+4,0.4,iz-2.5);
  box(2.8,0.35,3.6, 0xf0f0f0, ix+4,0.68,iz-2.5);
  box(2.8,0.2,2.5, 0x4488cc, ix+4,0.9,iz-3.2);
  box(3,1,0.2, 0x7a5c3a, ix+4,1.0,iz-4.4);
  addCol(LAND_HOUSE_COLS, ix+4,iz-2.5, 1.6,2.2);

  // Sofa
  box(4,0.6,1.6, 0x994444, ix-3,0.55,iz+2);
  box(4,0.9,0.4, 0x994444, ix-3,1.1,iz+2.8);
  addCol(LAND_HOUSE_COLS, ix-3,iz+2, 2.1,0.9);

  // Kitchenette
  box(3.5,1.1,1.2, 0xe0d8c8, ix-4.5,0.75,iz-3.8);
  box(1,1.12,1.2,  0xaaaaaa, ix-5.6,0.75,iz-3.8);
  box(1.2,2.4,1,   0xdddddd, ix-2.8,1.2,iz-3.8);
  addCol(LAND_HOUSE_COLS, ix-4.2,iz-3.8, 2.2,0.8);

  // Bookshelf
  box(1.6,3,0.7, 0x8B5E3C, ix+5.8,1.5,iz-1);
  for (let s=0; s<3; s++) box(1.6,0.08,0.6, 0x7a5030, ix+5.8,0.5+s*0.9,iz-1);
  addCol(LAND_HOUSE_COLS, ix+5.8,iz-1, 0.9,0.5);

  // Windows
  box(2,1.5,0.15, 0x88ccff, ix-3,2.7,iz-4.9);
  box(2,1.5,0.15, 0x88ccff, ix+2,2.7,iz-4.9);

  addCol(LAND_HOUSE_COLS, ix,iz-5, 7,0.5);
  addCol(LAND_HOUSE_COLS, ix-4.5,iz+5, 2.5,0.5);
  addCol(LAND_HOUSE_COLS, ix+4.5,iz+5, 2.5,0.5);
  addCol(LAND_HOUSE_COLS, ix-7,iz, 0.5,5);
  addCol(LAND_HOUSE_COLS, ix+7,iz, 0.5,5);
}
const LAND_HOUSE_ZONES = [
  { x:LAND_HOUSE_EXIT.x,      z:LAND_HOUSE_EXIT.z, r:3,   label:'Exit House',     action: exitLandHouse },
  { x:LAND_HOUSE_SPAWN.x+4,   z:-2.5, r:2.2, label:'🛏️ Sleep',        action: sleepAtHome },
  { x:LAND_HOUSE_SPAWN.x-3,   z:2,    r:2.2, label:'🛋️ Sit on Sofa',  action: sitOnSofa },
  { x:LAND_HOUSE_SPAWN.x-4.5, z:-3.8, r:2.2, label:'🍳 Cook a Meal',  action: cookMeal },
  { x:LAND_HOUSE_SPAWN.x+5.8, z:-1,   r:2,   label:'📚 Read a Book',  action: readBook },
];
function enterLandHouse(idx) {
  landHouseReturnIdx = idx;
  inLandHouse = true;
  playerGroup.position.set(LAND_HOUSE_SPAWN.x, 0, LAND_HOUSE_SPAWN.z);
  yaw = Math.PI;
  showNotif('🚪 Welcome home!');
}
function exitLandHouse() {
  inLandHouse = false;
  const idx = landHouseReturnIdx;
  landHouseReturnIdx = null;
  if (idx !== null) {
    const { cx, cz } = landPlotPos(idx);
    playerGroup.position.set(cx, 0, cz+3);
    yaw = 0;
  }
  showNotif('🚪 Leaving...');
}

// ─── A REAL SHARED HOTEL ROOM for every country's own hotel (item 154) — same "one shared pocket
// interior, remember which door to return to" pattern as the Land House above, and reuses the
// EXACT same sleepInHotel()/watchHotelTV() the Downtown Hotel already calls. ──────────────────
const COUNTRY_HOTEL_SPAWN = { x:100000, z:0 };
const COUNTRY_HOTEL_EXIT  = { x:100000, z:5 };
const COUNTRY_HOTEL_COLS = [];
let inCountryHotel = false;
let countryHotelReturn = null; // {x,z} — the exact door spot to teleport back to on checkout
function buildCountryHotelInterior() {
  const ix = COUNTRY_HOTEL_SPAWN.x, iz = 0;
  box(12,0.2,9, 0xD2B48C, ix,0.1,iz);           // floor
  box(12,0.2,9, 0xF5F0E8, ix,4,iz);             // ceiling
  box(12,4,0.3, 0xD8E0E8, ix,2,iz-4.5);         // back wall
  box(5.5,4,0.3, 0xD8E0E8, ix-3.5,2,iz+4.5);    // front wall left
  box(5.5,4,0.3, 0xD8E0E8, ix+3.5,2,iz+4.5);    // front wall right
  box(0.3,4,9, 0xD8E0E8, ix-6,2,iz);            // left wall
  box(0.3,4,9, 0xD8E0E8, ix+6,2,iz);            // right wall
  box(2.8,3,0.1, 0x7B5A3C, ix,1.5,iz+4.6);      // door
  box(10,0.05,7, 0x1A3A6C, ix,0.22,iz);         // carpet
  buildSign('🏨 Hotel Room', ix,4.5,iz-4.4);

  // Bed
  box(4,0.5,3, 0xffffff, ix-3,0.6,iz-1.5);
  box(4,0.2,1, 0xcc3333, ix-3,0.95,iz-2.6);
  addCol(COUNTRY_HOTEL_COLS, ix-3,iz-1.5, 2.2,1.7);

  // TV + dresser
  box(2,1.2,0.15, 0x111111, ix+4,2,iz-3.9);
  box(1.7,1,0.05, 0x1a3a5a, ix+4,2,iz-3.85);
  box(3,1,1, 0x5a4030, ix+4,0.5,iz+2);
  addCol(COUNTRY_HOTEL_COLS, ix+4,iz+2, 1.6,0.6);

  addCol(COUNTRY_HOTEL_COLS, ix,iz-4.5, 6,0.5);
  addCol(COUNTRY_HOTEL_COLS, ix-3.5,iz+4.5, 2.75,0.5);
  addCol(COUNTRY_HOTEL_COLS, ix+3.5,iz+4.5, 2.75,0.5);
  addCol(COUNTRY_HOTEL_COLS, ix-6,iz, 0.5,4.5);
  addCol(COUNTRY_HOTEL_COLS, ix+6,iz, 0.5,4.5);
}
const COUNTRY_HOTEL_ZONES = [
  { x:COUNTRY_HOTEL_EXIT.x,   z:COUNTRY_HOTEL_EXIT.z, r:3,   label:'🚪 Check Out', action: checkoutCountryHotel },
  { x:COUNTRY_HOTEL_SPAWN.x-3, z:-1.5, r:2.2, label:'🛏️ Sleep in Bed', action: sleepInHotel },
  { x:COUNTRY_HOTEL_SPAWN.x+4, z:-3,   r:2,   label:'📺 Watch TV',     action: watchHotelTV },
];
function checkinCountryHotel(originName, doorX, doorZ) {
  const price = 50;
  if (sipDollars < price) { sfx.nope(); showNotif(`❌ Need ${price} S.I.P. for a room at the ${originName} Hotel!`); return; }
  sipDollars -= price; updateSIP(); saveCurrentUser();
  countryHotelReturn = { x:doorX, z:doorZ };
  inCountryHotel = true;
  playerGroup.position.set(COUNTRY_HOTEL_SPAWN.x, 0, COUNTRY_HOTEL_SPAWN.z);
  yaw = Math.PI;
  showNotif(`🏨 Welcome to the ${originName} Hotel! Enjoy your stay.`);
  sfx.earn();
}
function checkoutCountryHotel() {
  inCountryHotel = false;
  if (countryHotelReturn) { playerGroup.position.set(countryHotelReturn.x, 0, countryHotelReturn.z); yaw = 0; }
  countryHotelReturn = null;
  showNotif('🚪 Checking out...');
}

// ─── AIRPORT LOUNGE — a real walk-in interior every one of the 9 airports (Downtown + the 8
// countries, item 154) shares, same "one pocket room, remember the door" pattern as the Land House
// and Country Hotel above. You no longer just buy a ticket and blink to the destination — you walk
// in, eat a real local dish, buy a real souvenir, watch TV, buy real electronics, THEN board. ────
const AIRPORT_LOUNGE_SPAWN = { x:120000, z:0 };
const AIRPORT_LOUNGE_EXIT  = { x:120000, z:8 };
const AIRPORT_LOUNGE_COLS = [];
let inAirportLounge = false;
let airportLoungeOrigin = null; // {name, doorX, doorZ, isDowntown}
const LOCAL_DISHES = {
  'Downtown Explox': { emoji:'🍔', name:'Explox City Burger',   taste:'savory' },
  Japan:     { emoji:'🍣', name:'Sushi Platter',          taste:'savory' },
  France:    { emoji:'🥐', name:'Croissant & Escargot',   taste:'savory' },
  Brazil:    { emoji:'🍖', name:'Churrasco Skewers',      taste:'savory' },
  Egypt:     { emoji:'🧆', name:'Falafel Wrap',           taste:'savory' },
  UK:        { emoji:'🐟', name:'Fish & Chips',           taste:'savory' },
  Australia: { emoji:'🥧', name:'Meat Pie',               taste:'savory' },
  Canada:    { emoji:'🥞', name:'Poutine',                taste:'savory' },
  Italy:     { emoji:'🍝', name:'Spaghetti Carbonara',    taste:'savory' },
};
const SOUVENIRS = {
  'Downtown Explox': { emoji:'🏙️', name:'Explox City Snowglobe', cost:20 },
  Japan:     { emoji:'🎎', name:'Kimono Doll',        cost:25 },
  France:    { emoji:'🗼', name:'Mini Eiffel Tower',  cost:25 },
  Brazil:    { emoji:'🥥', name:'Carnival Mask',      cost:22 },
  Egypt:     { emoji:'🐫', name:'Camel Figurine',     cost:24 },
  UK:        { emoji:'☂️', name:'London Umbrella',    cost:20 },
  Australia: { emoji:'🐨', name:'Koala Plush',        cost:23 },
  Canada:    { emoji:'🍁', name:'Maple Leaf Pin',     cost:18 },
  Italy:     { emoji:'🎭', name:'Venetian Mask',      cost:26 },
};
const LOUNGE_ELECTRONICS = [
  { id:'lounge_phone',  emoji:'📱', name:'Travel Phone',  cost:60  },
  { id:'lounge_tablet', emoji:'📲', name:'Travel Tablet', cost:110 },
];
function buildAirportLoungeInterior() {
  const ix = AIRPORT_LOUNGE_SPAWN.x, iz = 0;
  box(20,0.3,16, 0xd8d0c0, ix,0.15,iz);          // floor
  box(20,0.2,16, 0xf0f4f8, ix,5,iz);             // ceiling
  box(20,5,0.3, 0xb8c4d0, ix,2.5,iz-8);          // back wall
  box(7,5,0.3,  0xb8c4d0, ix-6.5,2.5,iz+8);      // front wall left
  box(7,5,0.3,  0xb8c4d0, ix+6.5,2.5,iz+8);      // front wall right
  box(0.3,5,16, 0xb8c4d0, ix-10,2.5,iz);         // left wall
  box(0.3,5,16, 0xb8c4d0, ix+10,2.5,iz);         // right wall
  box(2,3,0.1, 0x7B5A3C, ix,1.5,iz+8.1);         // exit door
  buildSign('✈️ Airport Lounge', ix,5.5,iz-7.8);

  // Restaurant counter
  box(5,1.1,1.4, 0xe0d8c8, ix-5,0.75,iz-3);
  box(5.1,0.1,1.5, 0xf8f8f8, ix-5,1.35,iz-3);
  buildSign('🍽️ Local Eats', ix-5,2.4,iz-3.8);
  addCol(AIRPORT_LOUNGE_COLS, ix-5,iz-3, 2.6,0.8);

  // Souvenir shop
  box(5,1.6,1.4, 0x8B5A2B, ix+5,0.9,iz-3);
  box(5.1,0.1,1.5, 0xffd54a, ix+5,1.7,iz-3);
  buildSign('🎁 Souvenirs', ix+5,2.6,iz-3.8);
  addCol(AIRPORT_LOUNGE_COLS, ix+5,iz-3, 2.6,0.8);

  // TV lounge area
  box(4,0.6,1.8, 0x994444, ix-5,0.55,iz+2);
  box(3,2,0.15, 0x111111, ix-5,2.4,iz+3.9);
  addCol(AIRPORT_LOUNGE_COLS, ix-5,iz+2, 2.2,1.0);

  // Electronics kiosk
  box(3,1.5,1, 0x445566, ix+5,0.75,iz+2);
  buildSign('📱 Electronics', ix+5,2,iz+1.4);
  addCol(AIRPORT_LOUNGE_COLS, ix+5,iz+2, 1.6,0.6);

  // Boarding gate
  box(3,3.5,0.2, 0x2255aa, ix,1.75,iz-7.8);
  buildSign('🛫 Boarding Gate', ix,4,iz-7.6);

  addCol(AIRPORT_LOUNGE_COLS, ix,iz-8, 11,0.5);
  addCol(AIRPORT_LOUNGE_COLS, ix-6.5,iz+8, 3.5,0.5);
  addCol(AIRPORT_LOUNGE_COLS, ix+6.5,iz+8, 3.5,0.5);
  addCol(AIRPORT_LOUNGE_COLS, ix-10,iz, 0.5,9);
  addCol(AIRPORT_LOUNGE_COLS, ix+10,iz, 0.5,9);
}
const AIRPORT_LOUNGE_ZONES = [
  { x:AIRPORT_LOUNGE_EXIT.x,   z:AIRPORT_LOUNGE_EXIT.z, r:3,   label:'🚪 Leave Lounge',       action: exitAirportLounge },
  { x:AIRPORT_LOUNGE_SPAWN.x-5, z:-3, r:2.3, label:'🍽️ Eat a Local Dish',   action: eatLoungeDish },
  { x:AIRPORT_LOUNGE_SPAWN.x+5, z:-3, r:2.3, label:'🎁 Buy a Souvenir',     action: buyLoungeSouvenir },
  { x:AIRPORT_LOUNGE_SPAWN.x-5, z:2,  r:2.3, label:'📺 Watch TV',          action: watchHotelTV },
  { x:AIRPORT_LOUNGE_SPAWN.x+5, z:2,  r:1.8, label:'📱 Buy a Phone',       action: () => buyLoungeElectronic('lounge_phone') },
  { x:AIRPORT_LOUNGE_SPAWN.x+5, z:0.5,r:1.8, label:'📲 Buy a Tablet',      action: () => buyLoungeElectronic('lounge_tablet') },
  { x:AIRPORT_LOUNGE_SPAWN.x,   z:-7.6, r:2.5, label:'🛫 Board the Plane', action: boardPlane },
];
function enterAirportLounge(name, doorX, doorZ, isDowntown) {
  airportLoungeOrigin = { name, doorX, doorZ, isDowntown };
  inAirportLounge = true;
  playerGroup.position.set(AIRPORT_LOUNGE_SPAWN.x, 0, AIRPORT_LOUNGE_SPAWN.z);
  yaw = Math.PI;
  showNotif(`🛫 Welcome to the ${name} Airport Lounge!`);
}
function exitAirportLounge() {
  inAirportLounge = false;
  if (airportLoungeOrigin) { playerGroup.position.set(airportLoungeOrigin.doorX, 0, airportLoungeOrigin.doorZ); yaw = 0; }
  airportLoungeOrigin = null;
  showNotif('🚪 Leaving the lounge...');
}
function eatLoungeDish() {
  const origin = airportLoungeOrigin ? airportLoungeOrigin.name : 'Downtown Explox';
  const dish = LOCAL_DISHES[origin] || LOCAL_DISHES['Downtown Explox'];
  eatFood(dish.emoji, dish.name, dish.taste);
}
function buyLoungeSouvenir() {
  const origin = airportLoungeOrigin ? airportLoungeOrigin.name : 'Downtown Explox';
  const sv = SOUVENIRS[origin] || SOUVENIRS['Downtown Explox'];
  if (sipDollars < sv.cost) { sfx.nope(); showNotif(`❌ Need ${sv.cost} S.I.P. for a ${sv.name}!`); return; }
  sipDollars -= sv.cost; updateSIP();
  addToInventory('souvenir_'+slug(sv.name), sv.name, sv.emoji);
  saveCurrentUser();
  sfx.buy();
  showNotif(`${sv.emoji} Bought a real ${sv.name}!`);
}
function buyLoungeElectronic(itemId) {
  const item = LOUNGE_ELECTRONICS.find(x => x.id === itemId);
  if (!item) return;
  if (sipDollars < item.cost) { sfx.nope(); showNotif(`❌ Need ${item.cost} S.I.P. for a ${item.name}!`); return; }
  sipDollars -= item.cost; updateSIP();
  addToInventory(item.id, item.name, item.emoji);
  saveCurrentUser();
  sfx.buy();
  showNotif(`${item.emoji} Bought a real ${item.name}!`);
}
function boardPlane() {
  if (!airportLoungeOrigin) return;
  const origin = airportLoungeOrigin;
  inAirportLounge = false; // no longer in the lounge — the flight animation places you at the real destination
  if (origin.isDowntown) openAirport(); else openCountryAirport(origin.name);
}
function buyLand(idx) {
  const plot = LAND_PLOTS[idx];
  const ownerName = getLandOwners()[plot.id] || null;
  if (ownerName) { showNotif(`🏡 ${plot.name} is already owned by ${ownerName===currentUser?'you':ownerName}!`); return; }
  if(sipDollars < plot.price) { sfx.nope(); showNotif(`❌ Need ${plot.price.toLocaleString()} S.I.P. for ${plot.name}!`); return; }
  sipDollars -= plot.price; updateSIP();
  if(!ownedLand.includes(plot.id)) ownedLand.push(plot.id);
  setLandOwner(plot.id, currentUser);
  saveCurrentUser();
  sfx.buy();
  showNotif(`🏡 You bought ${plot.name}! It's yours now. Press E again to build on it.`);
  buildLandPlot(idx);
}
// Move your land to any open (unclaimed) plot — "anywhere possible" within the real slot-based
// ownership system this game actually has, not literally anywhere in the 3D world (which a
// per-plot registry can't represent). Buildings are re-indexed into the new lot's own slot grid
// since the old slot numbers are meaningless in a differently-shaped grid.
function relocateLand(fromIdx, toIdx) {
  const fromPlot = LAND_PLOTS[fromIdx], toPlot = LAND_PLOTS[toIdx];
  if (getLandOwners()[toPlot.id]) { showNotif('❌ That plot is already taken!'); return; }
  const oldBuildings = plotBuildings[fromPlot.id] || [];
  if (oldBuildings.length > toPlot.slots.length) { showNotif(`❌ ${toPlot.name} only has ${toPlot.slots.length} slots — you have ${oldBuildings.length} things built. Demolish some first or pick a bigger lot.`); return; }
  plotBuildings[toPlot.id] = oldBuildings.map((b,i) => ({ ...b, slot:i }));
  delete plotBuildings[fromPlot.id];
  if (landInvites[fromPlot.id]) { landInvites[toPlot.id] = landInvites[fromPlot.id]; delete landInvites[fromPlot.id]; }
  if (landColor[fromPlot.id] !== undefined) { landColor[toPlot.id] = landColor[fromPlot.id]; delete landColor[fromPlot.id]; }
  if (landForSale[fromPlot.id] !== undefined) { landForSale[toPlot.id] = landForSale[fromPlot.id]; delete landForSale[fromPlot.id]; }
  if (!ownedLand.includes(toPlot.id)) ownedLand.push(toPlot.id);
  ownedLand = ownedLand.filter(id => id !== fromPlot.id);
  setLandOwner(fromPlot.id, null);
  setLandOwner(toPlot.id, currentUser);
  saveCurrentUser();
  Object.keys(PLOT_BUILDING_MESHES).forEach(key => { if (key.startsWith(fromPlot.id+'_')) { scene.remove(PLOT_BUILDING_MESHES[key]); delete PLOT_BUILDING_MESHES[key]; } });
  buildLandPlot(fromIdx);
  buildLandPlot(toIdx);
  renderExistingBuildings(toIdx);
  sfx.buy();
  showNotif(`🚚 Moved your land from ${fromPlot.name} to ${toPlot.name}!`);
  closeBuildMenu();
}
// A permitted guest buying an OWNED, for-sale plot right out from under its current owner — the
// seller genuinely gets paid, keeps nothing else of the plot, and it transfers as-is — buildings AND paint.
function buyLandFromOwner(idx, ownerName) {
  const plot = LAND_PLOTS[idx];
  const ownerData = getUserData(ownerName);
  const price = ownerData.landForSale && ownerData.landForSale[plot.id];
  if (!price) { showNotif('❌ This land is not for sale.'); return; }
  if (sipDollars < price) { sfx.nope(); showNotif(`❌ Need ${price.toLocaleString()} S.I.P. to buy ${plot.name}!`); return; }
  sipDollars -= price; updateSIP();
  const transferred = (ownerData.plotBuildings && ownerData.plotBuildings[plot.id]) || [];
  const transferredColor = ownerData.landColor && ownerData.landColor[plot.id];
  patchUserData(ownerName, d => {
    d.ownedLand = (d.ownedLand||[]).filter(id => id!==plot.id);
    if (d.plotBuildings) delete d.plotBuildings[plot.id];
    if (d.landInvites)   delete d.landInvites[plot.id];
    if (d.landColor)     delete d.landColor[plot.id];
    if (d.landForSale)   delete d.landForSale[plot.id];
    d.sip = (d.sip||0) + price;
  });
  if(!ownedLand.includes(plot.id)) ownedLand.push(plot.id);
  plotBuildings[plot.id] = transferred;
  if (transferredColor !== undefined && transferredColor !== null) landColor[plot.id] = transferredColor;
  setLandOwner(plot.id, currentUser);
  saveCurrentUser();
  sfx.buy();
  Object.keys(PLOT_BUILDING_MESHES).forEach(key => { if(key.startsWith(plot.id+'_')) { scene.remove(PLOT_BUILDING_MESHES[key]); delete PLOT_BUILDING_MESHES[key]; } });
  buildLandPlot(idx);
  renderExistingBuildings(idx);
  showNotif(`🏡 You bought ${plot.name} from ${ownerName} for ${price.toLocaleString()} S.I.P.!`);
  closeVisitLand();
}
const PAINT_SWATCHES = [
  { name:'Forest Green',  color:0x3a9d3a }, { name:'Ocean Blue',   color:0x2a6d9d },
  { name:'Sunset Orange', color:0xd9762a }, { name:'Royal Purple', color:0x6a3a9d },
  { name:'Charcoal',      color:0x333333 }, { name:'Rose Pink',    color:0xd94a8a },
];
function paintMyLand(idx, color) {
  const plot = LAND_PLOTS[idx];
  landColor[plot.id] = color;
  saveCurrentUser();
  buildLandPlot(idx);
  showNotif('🎨 Land painted!');
  renderBuildMenu(idx);
}
function setLandForSale(idx, price) {
  const plot = LAND_PLOTS[idx];
  if (price > 0) landForSale[plot.id] = price; else delete landForSale[plot.id];
  saveCurrentUser();
  buildLandPlot(idx);
  showNotif(price > 0 ? `🏷️ Listed for ${price.toLocaleString()} S.I.P.!` : '🏷️ Delisted.');
  renderBuildMenu(idx);
}
function setLandInvite(idx, guestName, perm) {
  const plot = LAND_PLOTS[idx];
  if (!guestName || guestName===currentUser || !getUsers().includes(guestName)) { showNotif('❌ Enter another real account name on this device.'); return; }
  landInvites[plot.id] = landInvites[plot.id] || {};
  landInvites[plot.id][guestName] = perm;
  saveCurrentUser();
  const permList = ['sit','smash','paint','buy','kill'].filter(k=>perm[k]).map(k=>k==='kill'?'Attack':k[0].toUpperCase()+k.slice(1)).join(', ') || 'visit only';
  pushNotice(guestName, `✉️ ${currentUser} invited you to ${plot.name}! You're allowed to: ${permList}.`);
  showNotif(`✉️ Invited ${guestName} to ${plot.name}!`);
  renderBuildMenu(idx);
}
function revokeLandInvite(idx, guestName) {
  const plot = LAND_PLOTS[idx];
  if (landInvites[plot.id]) delete landInvites[plot.id][guestName];
  saveCurrentUser();
  showNotif(`✉️ Revoked ${guestName}'s invite.`);
  renderBuildMenu(idx);
}
function ownerSit() {
  playerSeated = true;
  closeBuildMenu();
  showNotif('🪑 You sit down. Press E to get up.');
}
// Writes a real "while you were away" report onto ANOTHER account's own save — same
// cross-account patchUserData pattern as smashBuilding/visitPaint, read back on their next login.
function pushNotice(accountName, message) {
  patchUserData(accountName, d => {
    d.pendingNotices = Array.isArray(d.pendingNotices) ? d.pendingNotices : [];
    d.pendingNotices.push({ message });
  });
}
// A permitted guest attacking the OWNER's character itself, not just their buildings — real stakes:
// the owner's WALLET (sipDollars, not their banked money) is genuinely at risk, same as being
// mugged. Uses the same real weapon-damage system as NPC/robot combat so a better weapon matters.
function attackOwner(idx, ownerName) {
  const plot = LAND_PLOTS[idx];
  const roll = 1 + Math.floor(Math.random()*50); // flat 1-50 S.I.P. drop, regardless of weapon
  let lost = 0;
  patchUserData(ownerName, d => {
    const wallet = d.sip || 0;
    lost = Math.min(roll, wallet); // can't drop more than they're actually carrying
    d.sip = wallet - lost;
    d.pendingNotices = Array.isArray(d.pendingNotices) ? d.pendingNotices : [];
    d.pendingNotices.push({ message: `💀 ${currentUser} attacked you at ${plot.name} and you dropped ${lost.toLocaleString()} S.I.P.! (Money in the bank is always safe.)` });
  });
  sipDollars += lost; updateSIP();
  sfx.boom();
  showNotif(lost>0 ? `⚔️ You defeated ${ownerName} and looted ${lost.toLocaleString()} S.I.P.!` : `⚔️ You defeated ${ownerName}, but their wallet was empty!`);
  closeVisitLand();
}
// Shown right when a fresh world finishes loading — real "while you were away" reports
// (someone invited you, someone attacked you) that piled up on THIS account since its last login.
function checkPendingNotices() {
  if (!pendingNotices.length) return;
  const list = document.getElementById('noticesList');
  list.innerHTML = pendingNotices.map(n => `<div class="shopItem"><div class="siName" style="font-weight:normal;">${n.message}</div></div>`).join('');
  document.getElementById('noticesOverlay').style.display = 'flex';
}
function closeNotices() {
  document.getElementById('noticesOverlay').style.display = 'none';
  pendingNotices = [];
  saveCurrentUser();
}

// ── Visiting someone ELSE's owned land — real permission-gated actions, not just a viewer ──
function openVisitLand(idx, ownerName) {
  const plot = LAND_PLOTS[idx];
  const ownerData = getUserData(ownerName);
  const perm = (ownerData.landInvites && ownerData.landInvites[plot.id] && ownerData.landInvites[plot.id][currentUser]) || null;
  if (!perm) { showNotif(`🔒 ${plot.name} is private. Ask ${ownerName} to invite you!`); return; }
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('visitLandOverlay').style.display = 'flex';
  renderVisitLand(idx, ownerName);
}
function closeVisitLand() {
  document.getElementById('visitLandOverlay').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderVisitLand(idx, ownerName) {
  const plot = LAND_PLOTS[idx];
  const ownerData = getUserData(ownerName);
  const perm = (ownerData.landInvites && ownerData.landInvites[plot.id] && ownerData.landInvites[plot.id][currentUser]) || {};
  document.getElementById('visitPlotName').textContent = `${plot.name} — ${ownerName}'s Land`;
  const placed = (ownerData.plotBuildings && ownerData.plotBuildings[plot.id]) || [];
  const list = document.getElementById('visitBuildingList');
  list.innerHTML = placed.length ? '' : '<div style="color:#789;font-size:12px;">Nothing built here yet.</div>';
  placed.forEach(entry => {
    const def = BUILD_CATALOG.find(b=>b.id===entry.id);
    const d = document.createElement('div'); d.className='shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name}</div>
      ${perm.smash ? `<button class="shopBtn" style="background:#a33;" onclick="smashBuilding(${idx},'${ownerName}',${entry.slot})">🔨 Smash</button>` : ''}`;
    list.appendChild(d);
  });
  const hasBench = placed.some(p=>p.id==='bench');
  document.getElementById('visitSitBtn').style.display = (perm.sit && hasBench) ? 'block' : 'none';
  document.getElementById('visitAttackBtn').style.display = perm.kill ? 'block' : 'none';
  const paintPanel = document.getElementById('visitPaintPanel');
  if (perm.paint) {
    paintPanel.style.display = 'block';
    document.getElementById('visitPaintSwatches').innerHTML = PAINT_SWATCHES.map(s =>
      `<button onclick="visitPaint(${idx},'${ownerName}',${s.color})" title="${s.name}" style="width:26px;height:26px;border-radius:6px;border:2px solid #fff;background:#${s.color.toString(16).padStart(6,'0')};cursor:pointer;margin:3px;"></button>`
    ).join('');
  } else paintPanel.style.display = 'none';
  document.getElementById('visitAttackBtn').onclick = () => attackOwner(idx, ownerName);
  const forSale = ownerData.landForSale && ownerData.landForSale[plot.id];
  const buyBtn = document.getElementById('visitBuyBtn');
  if (perm.buy && forSale) {
    buyBtn.style.display = 'block';
    buyBtn.textContent = `💰 Buy for ${forSale.toLocaleString()} S.I.P.`;
    buyBtn.onclick = () => buyLandFromOwner(idx, ownerName);
  } else buyBtn.style.display = 'none';
}
function smashBuilding(idx, ownerName, slot) {
  const plot = LAND_PLOTS[idx];
  patchUserData(ownerName, d => {
    if (d.plotBuildings && d.plotBuildings[plot.id]) d.plotBuildings[plot.id] = d.plotBuildings[plot.id].filter(p=>p.slot!==slot);
  });
  const key = plot.id+'_'+slot;
  if (PLOT_BUILDING_MESHES[key]) { scene.remove(PLOT_BUILDING_MESHES[key]); delete PLOT_BUILDING_MESHES[key]; }
  sfx.boom();
  showNotif(`🔨 Smashed ${ownerName}'s building!`);
  renderVisitLand(idx, ownerName);
}
function visitSit() {
  playerSeated = true;
  closeVisitLand();
  showNotif('🪑 You sit down. Press E to get up.');
}
function visitPaint(idx, ownerName, color) {
  const plot = LAND_PLOTS[idx];
  patchUserData(ownerName, d => { d.landColor = d.landColor||{}; d.landColor[plot.id] = color; });
  buildLandPlot(idx);
  showNotif('🎨 Painted!');
}

// ── Building — real structures placed into a size-dependent slot grid on an OWNED plot ──
const BUILD_CATALOG = [
  { id:'tree',     name:'Garden Tree',  emoji:'🌳', wood:2,  sip:0   },
  { id:'flag',     name:'Flagpole',     emoji:'🚩', wood:4,  sip:20  },
  { id:'wall',     name:'Stone Wall',   emoji:'🧱', wood:0,  sip:50  },
  { id:'shed',     name:'Wooden Shed',  emoji:'🛖', wood:10, sip:0   },
  { id:'fountain', name:'Fountain',     emoji:'⛲', wood:0,  sip:150 },
  { id:'house',    name:'Small House (1-Story)',  emoji:'🏠', wood:20, sip:200 },
  { id:'brickhouse', name:'Brick House', emoji:'🧱', wood:10, mats:{ceramic_tile:4, clay_lump:6} },
  { id:'house2', name:'2-Story House', emoji:'🏘️', wood:35, sip:450 },
  { id:'house3', name:'3-Story House', emoji:'🏢', wood:45, sip:800,  mats:{steel_plate:5} },
  { id:'house4', name:'4-Story House', emoji:'🏙️', wood:55, sip:1300, mats:{steel_plate:10, steel_cable:5} },
  { id:'mansion', name:'Mansion',      emoji:'🏰', wood:70, sip:3500, mats:{granite_piece:15, steel_cable:10, gold_nugget:3} },
  { id:'greenhouse', name:'Greenhouse',  emoji:'🪴', mats:{glass_shard:8, steel_plate:2} },
  { id:'watchtower', name:'Watchtower',  emoji:'🗼', wood:8, mats:{granite_piece:5, steel_cable:3} },
  { id:'bench',      name:'Garden Bench', emoji:'🪑', wood:3, sip:0 },
  { id:'woodmill',    name:'Wood Mill',        emoji:'🏭', sip:100, produces:{type:'wood',  amount:1, everySec:15} },
  { id:'fabricator',  name:'Scrap Fabricator', emoji:'⚙️', sip:150, scrap:5, produces:{type:'scrap', amount:1, everySec:15} },
  { id:'printer',     name:'S.I.P. Printer',   emoji:'💰', sip:300, produces:{type:'sip',   amount:5, everySec:20} },
];
let plotBuildings = {};       // { lotId: [{slot, id, _t}, ...] } — persisted; _t is a machine's own production timer
let PLOT_BUILDING_MESHES = {}; // NOT persisted — 'lotId_slot' -> THREE.Group, rebuilt every session
function buildStructureMesh(id, x, z) {
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  if(id==='tree') {
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.4,1.6,0.4), mat(0x5c3a1e)); trunk.position.y=0.8; g.add(trunk);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,1.8), mat(0x2d7a2d)); canopy.position.y=2.2; g.add(canopy);
    treeMeshes.push(canopy); // rides along with the existing seasonal-color system
  } else if(id==='flag') {
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.12,2.4,0.12), mat(0xcccccc)); pole.position.y=1.2; g.add(pole);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.4,0.05), mat(0xe94560)); flag.position.set(0.32,2.0,0); g.add(flag);
  } else if(id==='wall') {
    const w = new THREE.Mesh(new THREE.BoxGeometry(2.4,1.2,0.3), mat(0x999999)); w.position.y=0.6; g.add(w);
  } else if(id==='shed') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2,1.6,2), mat(0x8B5A2B)); body.position.y=0.8; g.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.3,0.3,2.3), mat(0x5c3a1e)); roof.position.y=1.75; g.add(roof);
  } else if(id==='fountain') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,0.35,16), mat(0x88bbcc)); base.position.y=0.18; g.add(base);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,0.15,16), mat(0xaaddee)); water.position.y=0.4; g.add(water);
    const spout = new THREE.Mesh(new THREE.BoxGeometry(0.2,1,0.2), mat(0xcccccc)); spout.position.y=0.9; g.add(spout);
  } else if(id==='house') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(3,2.2,3), mat(0xE8DCC8)); body.position.y=1.1; g.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4,1.4,4), mat(0xaa3333)); roof.position.y=2.9; roof.rotation.y=Math.PI/4; g.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.6,1.2,0.1), mat(0x5c3a1e)); door.position.set(0,0.6,1.55); g.add(door);
  } else if(id==='brickhouse') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(3,2.4,3), mat(0xb85c3c)); body.position.y=1.2; g.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4,0.3,3.4), mat(0x6b3520)); roof.position.y=2.55; g.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.6,1.2,0.1), mat(0x3a2410)); door.position.set(0,0.6,1.55); g.add(door);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.6,0.08), mat(0xbfe8ff)); win.position.set(0.9,1.5,1.52); g.add(win);
  } else if(id==='greenhouse') {
    const glassMat = new THREE.MeshLambertMaterial({color:0xbfe8ff, transparent:true, opacity:0.45});
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.8,1.8,2.8), glassMat); body.position.y=0.9; g.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2,1.1,4), glassMat); roof.position.y=2.35; roof.rotation.y=Math.PI/4; g.add(roof);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.9,0.12,2.9), mat(0x99aabb)); frame.position.y=1.85; g.add(frame);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([px,pz])=>{ const plant = new THREE.Mesh(new THREE.BoxGeometry(0.4,0.6,0.4), mat(0x33aa44)); plant.position.set(px,0.3,pz); g.add(plant); });
  } else if(id==='house2' || id==='house3' || id==='house4') {
    const stories = { house2:2, house3:3, house4:4 }[id];
    for (let s=0; s<stories; s++) {
      const fy = 1.1 + s*2.1;
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.8,1.9,2.8), mat(s%2===0?0xE8DCC8:0xD8C8A8)); body.position.y=fy; g.add(body);
      const winMat = new THREE.MeshBasicMaterial({color:0xbfe8ff});
      [[-0.85,1.42],[0.85,1.42]].forEach(([wx,wz]) => { const win=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.05), winMat); win.position.set(wx,fy,wz); g.add(win); });
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2,1.2,4), mat(0xaa3333)); roof.position.y=1.1+stories*2.1+0.4; roof.rotation.y=Math.PI/4; g.add(roof);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.6,1.2,0.1), mat(0x5c3a1e)); door.position.set(0,0.6,1.42); g.add(door);
  } else if(id==='mansion') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(6,3,5), mat(0xF0E8D8)); body.position.y=1.5; g.add(body);
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(2,2.4,4), mat(0xE8DCC8)); wingL.position.set(-4,1.2,0); g.add(wingL);
    const wingR = new THREE.Mesh(new THREE.BoxGeometry(2,2.4,4), mat(0xE8DCC8)); wingR.position.set(4,1.2,0); g.add(wingR);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(6.4,0.4,5.4), mat(0x883333)); roof.position.y=3.2; g.add(roof);
    [[-2.2,2.4],[2.2,2.4]].forEach(([px,pz]) => { const p=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,3,8), mat(0xffffff)); p.position.set(px,1.5,pz); g.add(p); });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2,2,0.15), mat(0x5c3a1e)); door.position.set(0,1,2.55); g.add(door);
    const fountain = new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,0.3,12), mat(0x88bbcc)); fountain.position.set(0,0.15,4.5); g.add(fountain);
  } else if(id==='watchtower') {
    const legs = new THREE.Mesh(new THREE.BoxGeometry(1.4,3,1.4), mat(0x7a7a7a)); legs.position.y=1.5; g.add(legs);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.2,0.25,2.2), mat(0x5a5a5a)); deck.position.y=3.1; g.add(deck);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6,1.2,1.6), mat(0x8a8a8a)); cabin.position.y=3.85; g.add(cabin);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.4,0.8,4), mat(0x445566)); roof.position.y=4.85; roof.rotation.y=Math.PI/4; g.add(roof);
  } else if(id==='bench') {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4,0.15,0.5), mat(0x8B5A2B)); seat.position.y=0.5; g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.4,0.5,0.12), mat(0x6b4423)); back.position.set(0,0.8,-0.2); g.add(back);
    [[-0.6,0.25],[0.6,0.25]].forEach(([lx,ly])=>{ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.5,0.4), mat(0x4a2e15)); leg.position.set(lx,ly,0); g.add(leg); });
  } else if(id==='woodmill') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1,1.1,1.4,10), mat(0x5c3a1e)); base.position.y=0.7; g.add(base);
    const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,0.15,10), mat(0xccaa66)); blade.position.set(0,1.5,0); blade.rotation.x=Math.PI/2; g.add(blade);
  } else if(id==='fabricator') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4,1.6,1.2), mat(0x556677)); body.position.y=0.8; g.add(body);
    const light = new THREE.PointLight(0xff8800, 0.7, 6); light.position.y=1.6; g.add(light);
  } else if(id==='printer') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2,1.8,1), mat(0x2a4a3a)); body.position.y=0.9; g.add(body);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(1,0.15,0.9), mat(0xffd54a)); slot.position.y=1.75; g.add(slot);
  }
  return g;
}
function renderExistingBuildings(idx) {
  const plot = LAND_PLOTS[idx];
  const placed = plotBuildings[plot.id] || [];
  const { cx, cz } = landPlotPos(idx);
  placed.forEach(entry => {
    const key = plot.id+'_'+entry.slot;
    if(PLOT_BUILDING_MESHES[key]) return; // already rendered
    const [ox,oz] = plot.slots[entry.slot];
    PLOT_BUILDING_MESHES[key] = buildStructureMesh(entry.id, cx+ox, cz+oz);
  });
}
function openBuildMenu(idx) {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('buildOverlay').style.display = 'flex';
  renderBuildMenu(idx);
}
function closeBuildMenu() {
  document.getElementById('buildOverlay').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderBuildMenu(idx) {
  const plot = LAND_PLOTS[idx];
  const placed = plotBuildings[plot.id] || [];
  document.getElementById('buildPlotName').textContent = plot.name;
  document.getElementById('buildWood').textContent = woodCount;
  document.getElementById('buildSip').textContent = sipDollars;
  document.getElementById('buildSlotsUsed').textContent = placed.length;
  document.getElementById('buildSlotsTotal').textContent = plot.slots.length;
  const full = placed.length >= plot.slots.length;
  const cat = document.getElementById('buildCatalog');
  cat.innerHTML = '';
  BUILD_CATALOG.forEach((b) => {
    const canAfford = canAffordRecipe(b); // shared with crafting — handles wood/scrap/sip/mats uniformly
    const d = document.createElement('div'); d.className='shopItem';
    d.innerHTML = `<div class="siName">${b.emoji} ${b.name}</div>
      <div class="siCost">${craftCostText(b) || 'Free'}${b.produces?` — makes ${b.produces.amount} ${b.produces.type==='sip'?'S.I.P.':b.produces.type==='wood'?'Wood':'Scrap'} every ${b.produces.everySec}s`:''}</div>
      <button class="shopBtn" onclick="placeBuilding(${idx},'${b.id}')" ${(!canAfford||full)?'disabled':''}>${full?'Plot Full':'Build'}</button>`;
    cat.appendChild(d);
  });
  const placedList = document.getElementById('buildPlaced');
  placedList.innerHTML = '';
  if(placed.length===0) { placedList.innerHTML = '<div style="color:#789;font-size:12px;">Nothing built yet.</div>'; }
  placed.forEach((entry) => {
    const def = BUILD_CATALOG.find(b=>b.id===entry.id);
    const d = document.createElement('div'); d.className='shopItem';
    d.innerHTML = `<div class="siName">${def.emoji} ${def.name}</div>
      <button class="shopBtn" style="background:#a33;" onclick="demolishBuilding(${idx},${entry.slot})">Demolish</button>`;
    placedList.appendChild(d);
  });

  document.getElementById('buildSitBtn').style.display = placed.some(p=>p.id==='bench') ? 'block' : 'none';

  document.getElementById('buildPaintSwatches').innerHTML = PAINT_SWATCHES.map(s =>
    `<button onclick="paintMyLand(${idx},${s.color})" title="${s.name}" style="width:26px;height:26px;border-radius:6px;border:2px solid #fff;background:#${s.color.toString(16).padStart(6,'0')};cursor:pointer;margin:3px;"></button>`
  ).join('');

  const forSale = landForSale[plot.id];
  document.getElementById('buildSaleStatus').textContent = forSale ? `Listed for ${forSale.toLocaleString()} S.I.P.` : 'Not for sale.';
  document.getElementById('buildSalePriceInput').value = forSale || '';

  const invites = landInvites[plot.id] || {};
  const names = Object.keys(invites);
  const inviteList = document.getElementById('buildInviteList');
  inviteList.innerHTML = names.length ? names.map(n => {
    const p = invites[n];
    const tags = ['sit','smash','paint','buy','kill'].filter(k=>p[k]).map(k=>k==='kill'?'Attack':k[0].toUpperCase()+k.slice(1)).join(', ') || 'view only';
    return `<div class="shopItem"><div class="siName">${n}</div><div class="siCost">${tags}</div><button class="shopBtn" style="background:#a33;" onclick="revokeLandInvite(${idx},'${n}')">Revoke</button></div>`;
  }).join('') : '<div style="color:#789;font-size:12px;">No one invited yet.</div>';

  const owners = getLandOwners();
  const openPlots = LAND_PLOTS.filter((p,i) => i!==idx && !owners[p.id]);
  const moveList = document.getElementById('buildMoveList');
  moveList.innerHTML = openPlots.length ? openPlots.map(p => {
    const i = LAND_PLOTS.indexOf(p);
    return `<div class="shopItem"><div class="siName">${p.name}</div><div class="siCost">${p.footprint}x${p.footprint} — ${p.slots.length} slots</div><button class="shopBtn" onclick="relocateLand(${idx},${i})">Move Here</button></div>`;
  }).join('') : '<div style="color:#789;font-size:12px;">No open plots to move to right now.</div>';

  window._buildCtxIdx = idx;
}
function placeBuilding(idx, buildingId) {
  const plot = LAND_PLOTS[idx];
  const def = BUILD_CATALOG.find(b=>b.id===buildingId);
  const placed = plotBuildings[plot.id] || (plotBuildings[plot.id] = []);
  if(placed.length >= plot.slots.length) { showNotif('🏗️ This plot is full!'); return; }
  if(!canAffordRecipe(def)) { showNotif(`❌ Need ${craftCostText(def)}`); return; }
  const usedSlots = placed.map(p=>p.slot);
  let slot = -1;
  for(let i=0;i<plot.slots.length;i++){ if(!usedSlots.includes(i)) { slot=i; break; } }
  if(def.wood) { woodCount -= def.wood; updateWood(); }
  if(def.sip)  { sipDollars -= def.sip; updateSIP(); }
  if(def.scrap) { scrapMetal -= def.scrap; updateScrapMetal(); }
  spendMats(def.mats);
  placed.push({ slot, id: buildingId, _t:0 });
  saveCurrentUser();
  const { cx, cz } = landPlotPos(idx);
  const [ox,oz] = plot.slots[slot];
  PLOT_BUILDING_MESHES[plot.id+'_'+slot] = buildStructureMesh(buildingId, cx+ox, cz+oz);
  sfx.buy();
  showNotif(`🏗️ Built ${def.emoji} ${def.name}!`);
  renderBuildMenu(idx);
}
function demolishBuilding(idx, slot) {
  const plot = LAND_PLOTS[idx];
  const placed = plotBuildings[plot.id] || [];
  const i = placed.findIndex(p=>p.slot===slot);
  if(i<0) return;
  placed.splice(i,1);
  saveCurrentUser();
  const key = plot.id+'_'+slot;
  if(PLOT_BUILDING_MESHES[key]) { scene.remove(PLOT_BUILDING_MESHES[key]); delete PLOT_BUILDING_MESHES[key]; }
  showNotif('🏗️ Demolished.');
  renderBuildMenu(idx);
}
// Passive machine production — only ever ticks the CURRENT account's OWN placed buildings (an
// account's plotBuildings only ever holds lots it currently owns, since buyLandFromOwner moves
// entries between accounts on transfer) — real production while playing, not true offline/idle.
let machineTimer = 0;
function tickMachines(dt) {
  machineTimer += dt;
  if (machineTimer < 15) return;
  machineTimer = 0;
  let any = false;
  Object.values(plotBuildings).forEach(placed => {
    placed.forEach(entry => {
      const def = BUILD_CATALOG.find(b=>b.id===entry.id);
      if (!def || !def.produces) return;
      entry._t = (entry._t||0) + 15;
      if (entry._t >= def.produces.everySec) {
        entry._t = 0;
        const p = def.produces;
        if (p.type==='sip') { sipDollars += p.amount; updateSIP(); }
        else if (p.type==='wood') { woodCount += p.amount; updateWood(); }
        else if (p.type==='scrap') { scrapMetal += p.amount; updateScrapMetal(); }
        showNotif(`${def.emoji} ${def.name} produced ${p.amount} ${p.type==='sip'?'S.I.P.':p.type==='wood'?'Wood':'Scrap'}!`);
        any = true;
      }
    });
  });
  if (any) saveCurrentUser();
}

// ─── THE SCRAPYARD — robot spawners + real fightable robots ──────────────────
const SCRAPYARD_CENTER = { x:300, z:250 };
const ROBOT_SPAWNERS = [
  { x:SCRAPYARD_CENTER.x-15, z:SCRAPYARD_CENTER.z,    maxRobots:2 },
  { x:SCRAPYARD_CENTER.x,    z:SCRAPYARD_CENTER.z-15, maxRobots:2 },
  { x:SCRAPYARD_CENTER.x+15, z:SCRAPYARD_CENTER.z,    maxRobots:2 },
];
const ROBOT_TYPES = [
  { id:'scout', name:'Scout Bot', hp:35, color:0x557799, reward:[15,30], yields:['Wire Bundle','Sensor Chip'], weight:4 },
  { id:'guard', name:'Guard Bot', hp:65, color:0x775555, reward:[35,55], yields:['Servo Motor','Power Core','Steel Plate'], weight:3 },
  { id:'drone', name:'Drone Bot', hp:20, color:0x33aadd, reward:[10,20], yields:['Antenna Piece','Fiber Optic Cable'], shape:'drone', speedMult:1.6, weight:4 },
  { id:'tank',  name:'Tank Bot',  hp:120,color:0x557755, reward:[60,90], yields:['Titanium Shard','Hydraulic Piston','Chrome Trim'], shape:'tank', speedMult:0.6, weight:2 },
  { id:'spider',name:'Spider Bot',hp:45, color:0x664477, reward:[20,35], yields:['Rusty Chain','Bent Spring','Zip Tie Bundle'], shape:'spider', speedMult:1.3, weight:3 },
  { id:'elite', name:'Elite Bot', hp:150,color:0x6a4a99, reward:[80,120],yields:['Gold Nugget','Microchip','Crystal Fragment'], shape:'elite', speedMult:1.0, weight:1 },
];
function pickRobotType() {
  const total = ROBOT_TYPES.reduce((s,t) => s+(t.weight||1), 0);
  let roll = Math.random()*total;
  for (const t of ROBOT_TYPES) { roll -= (t.weight||1); if (roll <= 0) return t; }
  return ROBOT_TYPES[ROBOT_TYPES.length-1];
}
let robots = []; // active robot instances — NOT persisted, ambient enemies that just respawn over time
let ROBOT_ID_SEQ = 0;
function buildRobotMesh(x, z, color, shape) {
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  const eyeMat = new THREE.MeshBasicMaterial({color:0xff3333});
  if (shape === 'drone') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55,10,8), mat(color)); body.position.y=1.6; g.add(body);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75,0.07,6,16), mat(0x223344)); ring.position.y=1.6; ring.rotation.x=Math.PI/2; g.add(ring);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.05), eyeMat); eyeL.position.set(-0.18,1.6,0.5); g.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.05), eyeMat); eyeR.position.set(0.18,1.6,0.5); g.add(eyeR);
    const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.05,0.5,0.05), mat(0x888888)); antenna.position.y=2.2; g.add(antenna);
    return g;
  }
  if (shape === 'tank') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6,1.3,1.2), mat(color)); body.position.y=1.0; g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.5,0.7), mat(0x223344)); head.position.y=1.85; g.add(head);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.05), eyeMat); eyeL.position.set(-0.2,1.85,0.38); g.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.05), eyeMat); eyeR.position.set(0.2,1.85,0.38); g.add(eyeR);
    [[-0.9,0.4],[0.9,0.4]].forEach(([tx,ty]) => { const tread=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,1.5,8), mat(0x1a1a1a)); tread.rotation.z=Math.PI/2; tread.position.set(tx,ty,0); g.add(tread); });
    return g;
  }
  if (shape === 'spider') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55,8,6), mat(color)); body.position.y=0.9; g.add(body);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.09,0.09,0.05), eyeMat); eyeL.position.set(-0.15,0.95,0.45); g.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.09,0.09,0.05), eyeMat); eyeR.position.set(0.15,0.95,0.45); g.add(eyeR);
    for (let i=0; i<6; i++) {
      const ang = (i/6)*Math.PI*2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.9,4), mat(0x333333));
      leg.position.set(Math.cos(ang)*0.55, 0.55, Math.sin(ang)*0.55);
      leg.rotation.z = Math.cos(ang)*0.9; leg.rotation.x = Math.sin(ang)*0.9;
      g.add(leg);
    }
    return g;
  }
  if (shape === 'elite') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1,1.6,0.9), mat(color)); body.position.y=1.1; g.add(body);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.15,0.15,0.95), mat(0xffd54a)); trim.position.y=1.85; g.add(trim);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.65,0.55,0.65), mat(0x223344)); head.position.y=2.2; g.add(head);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.11,0.11,0.05), eyeMat); eyeL.position.set(-0.16,2.2,0.36); g.add(eyeL);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.11,0.11,0.05), eyeMat); eyeR.position.set(0.16,2.2,0.36); g.add(eyeR);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), new THREE.MeshBasicMaterial({color:0xffd54a})); core.position.set(0,1.1,0.46); g.add(core);
    const pl = new THREE.PointLight(0xffd54a, 0.8, 6); pl.position.set(0,1.1,0.5); g.add(pl);
    [[-0.7,1.0],[0.7,1.0]].forEach(([ax,ay]) => { const arm=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.75,0.22), mat(0x445566)); arm.position.set(ax,ay,0); g.add(arm); });
    return g;
  }
  // default (scout/guard) — original humanoid body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1,1.4,0.8), mat(color)); body.position.y=1.0; g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.5,0.6), mat(0x223344)); head.position.y=1.95; g.add(head);
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.05), eyeMat); eyeL.position.set(-0.15,1.95,0.33); g.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.05), eyeMat); eyeR.position.set(0.15,1.95,0.33); g.add(eyeR);
  const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.05,0.4,0.05), mat(0x888888)); antenna.position.y=2.4; g.add(antenna);
  [[-0.65,0.9],[0.65,0.9]].forEach(([ax,ay]) => { const arm=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.7,0.2), mat(0x445566)); arm.position.set(ax,ay,0); g.add(arm); });
  return g;
}
function buildSpawnerMesh(x, z) {
  // Every part uses MeshBasicMaterial (renders full-bright regardless of scene lighting) after the
  // old MeshLambertMaterial base (near-black 0x2a2a3a, needs direct light to show at all) turned out
  // to be the real cause of "invisible" spawners — it wasn't missing, just too dark/small to see.
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.6,0.6,8), new THREE.MeshBasicMaterial({color:0xff8800})); base.position.y=0.3; g.add(base);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.2,0.15,6,8), new THREE.MeshBasicMaterial({color:0x333344})); rim.position.y=0.62; rim.rotation.x=Math.PI/2; g.add(rim);
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.3), new THREE.MeshBasicMaterial({color:0x00ffcc, transparent:true, opacity:0.85})); core.position.y=2.2; g.add(core);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,6,6), new THREE.MeshBasicMaterial({color:0x00ffcc, transparent:true, opacity:0.5})); beam.position.y=5.2; g.add(beam);
  const pl = new THREE.PointLight(0x00ffcc, 2, 25); pl.position.y=2.2; g.add(pl);
  return g;
}
function trySpawnRobot(spawnerIdx) {
  const sp = ROBOT_SPAWNERS[spawnerIdx];
  const aliveCount = robots.filter(r => r.spawnerIdx===spawnerIdx && r.alive).length;
  if (aliveCount >= sp.maxRobots) return;
  const type = pickRobotType();
  const angle = Math.random()*Math.PI*2, dist = 3+Math.random()*2;
  const x = sp.x + Math.cos(angle)*dist, z = sp.z + Math.sin(angle)*dist;
  const mesh = buildRobotMesh(x, z, type.color, type.shape);
  const col = addCol(CITY_COLS, x, z, 0.6, 0.6); // real reference kept so defeat can actually remove it (was a known stale-collider quirk, item 146)
  const robot = { id:ROBOT_ID_SEQ++, x, z, hp:type.hp, maxHp:type.hp, type, mesh, spawnerIdx, alive:true, zone:null, col,
    homeX:sp.x, homeZ:sp.z, wanderX:x, wanderZ:z, speed:(2+Math.random()*1.3)*(type.speedMult||1) };
  const zone = { x, z, r:2.8, label:`🤖 Fight ${type.name}`, action: () => fightRobot(robot) };
  robot.zone = zone;
  CITY_ZONES.push(zone);
  robots.push(robot);
}
function fightRobot(robot) {
  if(!robot.alive) { showNotif('That robot is already scrap.'); return; }
  const dmg = getRobotDamage();
  robot.hp -= dmg;
  triggerSwing();
  sfx.clang();

  if(robot.hp > 0) {
    const backDmg = Math.round(6 + Math.random()*8);
    showNotif(`🤖 Hit ${robot.type.name} for ${dmg}! (${robot.hp} HP left)`);
    damagePlayer(backDmg, robot.type.name);
    return;
  }
  defeatRobot(robot);
}
// Extracted so a car ram (item 160) triggers the exact same real reward/wreckage/respawn as melee.
function defeatRobot(robot) {
  robot.alive = false;
  scene.remove(robot.mesh);
  const zi = CITY_ZONES.indexOf(robot.zone); if(zi>-1) CITY_ZONES.splice(zi,1);
  // Real fix to a known pre-existing quirk (item 146): the collider was never removed on defeat,
  // leaving an invisible stale wall where the robot used to stand. Now genuinely removed too.
  if (robot.col) { const ci = CITY_COLS.indexOf(robot.col); if (ci>-1) CITY_COLS.splice(ci,1); }
  const [lo,hi] = robot.type.reward;
  const reward = lo + Math.floor(Math.random()*(hi-lo+1));
  sipDollars += reward; updateSIP();
  sfx.boom();
  showNotif(`🤖💥 ${robot.type.name} destroyed! +${reward} S.I.P.`);
  buildWreckage(robot.x, robot.z, robot.type); // leaves real scrap behind — take it to the Grinder for materials
  // The spawner sends out a replacement after a real cooldown, same idea as item 135's tree respawn.
  setTimeout(() => trySpawnRobot(robot.spawnerIdx), 7000);
}

// ── ROGUE ROBOTS (item 156) — genuinely different from the ambient Scrapyard/global-spawner
// robots above: these aren't tied to a spawner, they roam far into the city, actively chase the
// player once one appears, and attack for real without you pressing E first — "for no reason". ──
let rogueRobots = []; // NOT persisted — {id,type,mesh,x,z,hp,maxHp,alive,speed,attackTimer}
let rogueTimer = 0;
// Real bug fix: this used to spawn the robot 40-80 units from the PLAYER directly — it just
// popped into existence nearby with no real origin, which read as "teleporting in." Now it spawns
// at whichever of the real ROBOT_SPAWNERS (item 148's 100 scattered spawners) is actually closest
// to the player and has to genuinely walk the real distance from there to reach you.
function spawnRogueRobot() {
  if (!ROBOT_SPAWNERS.length) return;
  let closest = ROBOT_SPAWNERS[0], closestDist = Infinity;
  ROBOT_SPAWNERS.forEach(sp => {
    const d = Math.hypot(playerGroup.position.x-sp.x, playerGroup.position.z-sp.z);
    if (d < closestDist) { closestDist = d; closest = sp; }
  });
  const type = pickRobotType();
  const mesh = buildRobotMesh(closest.x, closest.z, type.color, type.shape);
  rogueRobots.push({ id:'rogue'+ROBOT_ID_SEQ++, x:closest.x, z:closest.z, hp:type.hp, maxHp:type.hp, type, mesh, alive:true, speed:2.5+Math.random()*1.5, attackTimer:0 });
  showNotif(`⚠️ A ${type.name} broke off from a nearby spawner and is coming for you!`);
}
function tickRogueRobots(dt) {
  rogueTimer += dt;
  const outdoors = !inHouse && !inMall && !inHotel && !inStore && !inFriendHouse && !inLandHouse && !inCountryHotel && !inAirportLounge && !inPrison && !inArcade && !inCar;
  if (rogueTimer >= 20) {
    rogueTimer = 0;
    if (outdoors && rogueRobots.filter(r=>r.alive).length < 5) spawnRogueRobot();
  }
  if (!outdoors) return;
  rogueRobots.forEach(r => {
    if (!r.alive) return;
    const dx = playerGroup.position.x-r.x, dz = playerGroup.position.z-r.z;
    const dist = Math.hypot(dx,dz);
    if (dist < 2.5) {
      r.attackTimer += dt;
      if (r.attackTimer > 1.5) { r.attackTimer = 0; damagePlayer(6+Math.floor(Math.random()*8), r.type.name+' (Rogue)'); }
    } else {
      // Always closes the real distance now — spawning at the nearest real spawner (above) means
      // it's never absurdly far away, so the old 250-unit chase cap was just cutting the "walks to
      // you, not teleports" mechanic short; removed so it genuinely always makes its way to you.
      r.x += dx/dist*r.speed*dt;
      r.z += dz/dist*r.speed*dt;
      r.mesh.position.set(r.x, 0, r.z);
      r.mesh.rotation.y = Math.atan2(dx, dz);
    }
  });
}
function fightRogueRobot(robot) {
  if (!robot.alive) return;
  const dmg = getRobotDamage();
  robot.hp -= dmg;
  triggerSwing();
  sfx.clang();
  if (robot.hp > 0) {
    showNotif(`⚔️ Hit the rogue ${robot.type.name} for ${dmg}! (${robot.hp} HP left)`);
    return;
  }
  defeatRogueRobot(robot);
}
// Extracted so a car ram (item 160) triggers the same real reward as melee.
function defeatRogueRobot(robot) {
  robot.alive = false;
  scene.remove(robot.mesh);
  const [lo,hi] = robot.type.reward;
  const reward = lo + Math.floor(Math.random()*(hi-lo+1));
  sipDollars += reward; updateSIP();
  sfx.boom();
  showNotif(`💥 Defeated the rogue ${robot.type.name}! +${reward} S.I.P.`);
}

// ── The Grinder — turns real robot wreckage into Scrap Metal + the robot's real materials ──
const GRINDER_POS = { x:SCRAPYARD_CENTER.x, z:SCRAPYARD_CENTER.z+18 };
let wreckagePiles = []; // {x,z,mesh,type} — NOT persisted, same category as the ambient robots themselves
function buildWreckage(x, z, robotType) {
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  [[-0.3,0.15,-0.2],[0.25,0.1,0.15],[0,0.25,0]].forEach(([dx,dy,dz]) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.4,0.3,0.4), mat(0x556677));
    s.position.set(dx,dy,dz); s.rotation.set(Math.random(),Math.random(),Math.random());
    g.add(s);
  });
  wreckagePiles.push({ x, z, mesh:g, type:robotType });
}
function buildGrinderMesh() {
  const g = new THREE.Group(); g.position.set(GRINDER_POS.x,0,GRINDER_POS.z); scene.add(g);
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,1.6,10), mat(0x445566)); drum.position.y=1.0; drum.rotation.z=Math.PI/2*0.15; g.add(drum);
  const hopper = new THREE.Mesh(new THREE.ConeGeometry(0.9,0.9,4), mat(0x334455)); hopper.position.set(0,2.1,0); hopper.rotation.y=Math.PI/4; g.add(hopper);
  const pl = new THREE.PointLight(0xff8800, 0.6, 8); pl.position.y=1.5; g.add(pl);
}
function buildScrapyard() {
  buildLogoSign('THE SCRAPYARD', '🤖', '#556677', '#00ffcc', SCRAPYARD_CENTER.x, 5, SCRAPYARD_CENTER.z-20);
  ROBOT_SPAWNERS.forEach((sp, i) => {
    buildSpawnerMesh(sp.x, sp.z);
    for (let n=0; n<sp.maxRobots; n++) trySpawnRobot(i);
  });
  buildGrinderMesh();
  buildLogoSign('THE GRINDER', '⚙️', '#445566', '#ff8800', GRINDER_POS.x, 3.2, GRINDER_POS.z-1.5);
  CITY_ZONES.push({ x:GRINDER_POS.x, z:GRINDER_POS.z+2.5, r:2.5, label:'⚙️ Use the Grinder', action: useGrinder });

  // Sell Kiosk — a small booth next to the Grinder, buys materials for real S.I.P.
  const kx = GRINDER_POS.x+6, kz = GRINDER_POS.z;
  box(2,2.2,1.6, 0x2a4a3a, kx, 1.1, kz);
  box(2.4,0.3,2, 0x1a3a2a, kx, 2.35, kz);
  box(1.6,0.7,0.3, 0x3a5a4a, kx, 0.9, kz+0.9);
  buildLogoSign('SELL KIOSK', '💰', '#2a4a3a', '#ffd54a', kx, 3.2, kz-1.2);
  addCol(CITY_COLS, kx, kz, 1.1, 0.9);
  CITY_ZONES.push({ x:kx, z:kz+2.3, r:2.3, label:'💰 Sell Materials', action: openSellKiosk });

  // Robo Arsenal — a real specialized weapon shop right at the Scrapyard, selling WEAPONS'
  // robotShopOnly gear (EMP Hammer/Plasma Cutter/Rail Spike) that hits robots far harder than
  // the general Weapon Shop's bat/sword/axe, at the cost of being weaker against people.
  const rax = SCRAPYARD_CENTER.x-18, raz = GRINDER_POS.z;
  box(3,2.6,2, 0x223344, rax, 1.3, raz);
  box(3.4,0.3,2.4, 0x1a2733, rax, 2.65, raz);
  box(1.6,0.7,0.3, 0x2a3a4a, rax, 0.9, raz+0.9);
  box(0.08,1.0,0.06, 0x00ffcc, rax-0.5, 1.6, raz-1.05); // EMP hammer on wall
  box(0.08,0.9,0.06, 0xff6600, rax+0.5, 1.5, raz-1.05); // plasma cutter on wall
  buildLogoSign('ROBO ARSENAL', '🤖', '#223344', '#00ffcc', rax, 3.4, raz-1.3);
  addCol(CITY_COLS, rax, raz, 1.6, 1.1);
  CITY_ZONES.push({ x:rax, z:raz+2.5, r:2.3, label:'🤖 Robo Arsenal Shop', action: ()=>openShop('robotweapons'), isShop:true });
}

// ── 100 spawners scattered across the whole city (The Scrapyard's own 3 above + 97 more here) ──
// Jittered grid over the full player boundary (±1850, safely inside the ±1950 walk limit), with any
// candidate too close to a real named location (LOC_ZONES, defined further down — buildGlobalSpawners
// only ever RUNS at world-build time, well after the whole file, including LOC_ZONES, has evaluated)
// thrown out — same jittered-grid-plus-exclusion shape as item 145's generateWoodsOffsets.
function generateSpawnerSpots(count) {
  const bound = 1850, step = 320, buffer = 45;
  const exclusions = LOC_ZONES.concat([{ x:0, z:15, r:35 }]); // also keep clear of the player's own spawn point
  const spots = [];
  for (let gx=-bound; gx<=bound && spots.length<count; gx+=step) {
    for (let gz=-bound; gz<=bound && spots.length<count; gz+=step) {
      const x = gx + (Math.random()-0.5)*step*0.6;
      const z = gz + (Math.random()-0.5)*step*0.6;
      const blocked = exclusions.some(loc => Math.hypot(x-loc.x, z-loc.z) < loc.r+buffer);
      if (!blocked) spots.push({ x, z });
    }
  }
  return spots;
}
function buildGlobalSpawners() {
  const need = 100 - ROBOT_SPAWNERS.length; // The Scrapyard's 3 already count toward the 100
  generateSpawnerSpots(need).forEach(({x,z}) => {
    ROBOT_SPAWNERS.push({ x, z, maxRobots:1 }); // 1 per outpost (vs. Scrapyard's 2) — 100 spawners is already a lot of ambient robots
    const idx = ROBOT_SPAWNERS.length-1;
    buildSpawnerMesh(x, z);
    trySpawnRobot(idx);
  });
}
// ── Real materials (100 distinct, hand-authored, no filler) + The Dump — junk you
// pick up and bring to the Grinder to extract specific real materials from ──────
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'_'); }
const MATERIAL_DEFS = [
  // Metals & Alloys (20)
  ['Iron Scrap','🔩'],['Copper Wire','🔌'],['Aluminum Sheet','🥫'],['Steel Plate','🛡️'],['Tin Can','🥫'],
  ['Bronze Fragment','🟤'],['Silver Chip','⚪'],['Gold Nugget','🟡'],['Titanium Shard','⬜'],['Brass Fitting','🔶'],
  ['Lead Pipe','🪠'],['Zinc Coating','⚙️'],['Nickel Alloy','🔘'],['Chrome Trim','✨'],['Rusty Bolt','🔩'],
  ['Rusty Nail','📌'],['Metal Coil','➰'],['Metal Mesh','🕸️'],['Iron Filings','✨'],['Steel Cable','🔗'],
  // Electronics (18)
  ['Circuit Board','🖥️'],['Copper Coil','🌀'],['Battery Cell','🔋'],['LED Light','💡'],['Wire Bundle','🔌'],
  ['Microchip','💾'],['Capacitor','🔵'],['Resistor','🟠'],['Transistor','⚫'],['Fiber Optic Cable','🌈'],
  ['Speaker Magnet','🧲'],['Motor Part','⚙️'],['Sensor Chip','📡'],['Antenna Piece','📶'],['Solar Cell','☀️'],
  ['Power Core','🔆'],['Servo Motor','🦾'],['Hydraulic Piston','🛠️'],
  // Plastics & Rubber (12)
  ['Plastic Chunk','🧊'],['Rubber Strip','➖'],['Vinyl Sheet','📀'],['Foam Padding','🧽'],['Nylon Cord','🧶'],
  ['PVC Pipe','🚰'],['Bottle Cap','🧴'],['Bubble Wrap','🫧'],['Plastic Gear','⚙️'],['Rubber Tire Chunk','🛞'],
  ['Plastic Casing','📦'],['Silicone Seal','⭕'],
  // Glass & Ceramic (8)
  ['Glass Shard','🔺'],['Broken Mirror','🪞'],['Ceramic Tile','🧱'],['Porcelain Piece','🏺'],['Crystal Fragment','💎'],
  ['Frosted Glass','🧊'],['Stained Glass Piece','🌈'],['Glass Bottle','🍾'],
  // Fabric & Textile (8)
  ['Cloth Scrap','🧵'],['Leather Strip','🟫'],['Denim Patch','👖'],['Wool Fiber','🐑'],['Canvas Sheet','🎨'],
  ['Cotton Batting','☁️'],['Felt Pad','🟪'],['Burlap Sack','🛍️'],
  // Wood Products (7)
  ['Plywood Scrap','🪵'],['Splintered Wood','🪚'],['Wood Veneer','🌳'],['Sawdust Bag','💨'],['Wood Chips','🟤'],
  ['Cork Piece','🍾'],['Bamboo Strip','🎋'],
  // Stone & Mineral (10)
  ['Gravel','🪨'],['Sand Bag','🏖️'],['Clay Lump','🟠'],['Coal Chunk','⚫'],['Gemstone Fragment','💎'],
  ['Quartz Crystal','🔮'],['Marble Chip','⬜'],['Granite Piece','🗿'],['Limestone Chunk','⬛'],['Obsidian Shard','🖤'],
  // Paper & Cardboard (5)
  ['Cardboard Bundle','📦'],['Newspaper Stack','📰'],['Paper Pulp','📄'],['Magazine Stack','📖'],['Cardboard Tube','🎯'],
  // Misc Junk (12)
  ['Old Tire Rubber','🛞'],['Broken Toy Parts','🧸'],['Duct Tape Roll','🩹'],['Rope Coil','🪢'],['Bent Spring','🌀'],
  ['Rusty Chain','⛓️'],['Broken Gear','⚙️'],['Zip Tie Bundle','🔗'],['Old Sponge','🧽'],['Worn Bristle Brush','🖌️'],
  ['Cracked Handle','🔧'],['Bent Wire Hanger','👔'],
];
const MATERIALS = MATERIAL_DEFS.map(([name,emoji]) => ({ id:slug(name), name, emoji }));
function findMaterial(name) { return MATERIALS.find(m => m.name === name); }

// Real per-material sell prices: a base price band per category (by index range in
// MATERIAL_DEFS) + hand-picked premiums for genuinely valuable materials.
const MATERIAL_PRICE_BANDS = [ // [startIdx, endIdx, basePrice]
  [0,19,6],   // Metals & Alloys
  [20,37,8],  // Electronics
  [38,49,3],  // Plastics & Rubber
  [50,57,4],  // Glass & Ceramic
  [58,65,3],  // Fabric & Textile
  [66,72,3],  // Wood Products
  [73,82,5],  // Stone & Mineral
  [83,87,2],  // Paper & Cardboard
  [88,99,3],  // Misc Junk
];
const MATERIAL_PRICE_OVERRIDES = {
  gold_nugget:40, silver_chip:25, titanium_shard:30, chrome_trim:12,
  microchip:20, power_core:25, solar_cell:18, fiber_optic_cable:14, servo_motor:16,
  crystal_fragment:30, stained_glass_piece:10,
  gemstone_fragment:35, quartz_crystal:20, obsidian_shard:18, marble_chip:10,
  leather_strip:8,
};
function materialPrice(id) {
  if(MATERIAL_PRICE_OVERRIDES[id] !== undefined) return MATERIAL_PRICE_OVERRIDES[id];
  const idx = MATERIALS.findIndex(m => m.id === id);
  const band = MATERIAL_PRICE_BANDS.find(([s,e]) => idx >= s && idx <= e);
  return band ? band[2] : 3;
}

// ── Sell Kiosk — direct "hand over materials, get S.I.P." (no store ownership needed) ──
function openSellKiosk() {
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('sellKioskModal').style.display = 'flex';
  renderSellKiosk();
}
function closeSellKiosk() {
  document.getElementById('sellKioskModal').style.display = 'none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function renderSellKiosk() {
  const list = document.getElementById('sellKioskList');
  const held = MATERIALS.filter(m => playerInventory[m.id] && playerInventory[m.id].qty > 0);
  document.getElementById('sellKioskSip').textContent = sipDollars;
  if(held.length === 0) {
    list.innerHTML = '<div style="color:#789;font-size:12px;">No materials to sell — grind junk from The Dump first!</div>';
    return;
  }
  list.innerHTML = '';
  held.forEach(m => {
    const qty = playerInventory[m.id].qty, price = materialPrice(m.id);
    const d = document.createElement('div'); d.className='shopItem';
    d.innerHTML = `<div class="siName">${m.emoji} ${m.name} <span style="color:#9ab;font-weight:normal;">x${qty}</span></div>
      <div class="siCost">💰 ${price} S.I.P. each</div>
      <button class="shopBtn" onclick="sellMaterial('${m.id}',1)">Sell 1</button>
      <button class="shopBtn" style="margin-left:6px;background:#3a9d3a;" onclick="sellMaterial('${m.id}',${qty})">Sell All (+${price*qty})</button>`;
    list.appendChild(d);
  });
}
function sellMaterial(id, qty) {
  const held = playerInventory[id];
  if(!held || held.qty < qty) { showNotif('❌ Not enough of that material!'); return; }
  const price = materialPrice(id);
  const total = price * qty;
  held.qty -= qty;
  if(held.qty <= 0) delete playerInventory[id];
  sipDollars += total; updateSIP();
  sfx.coin();
  const m = MATERIALS.find(x=>x.id===id);
  showNotif(`💰 Sold ${qty}x ${m.emoji} ${m.name} for ${total} S.I.P.!`);
  saveCurrentUser();
  renderSellKiosk();
  refreshInventory();
}

const DUMP_CENTER = { x:-300, z:-300 };
const DUMP_ITEM_DEFS = [
  ['Old TV','📺',['Circuit Board','Glass Shard','Copper Wire']],
  ['Broken Toaster','🍞',['Nickel Alloy','Plastic Chunk','Metal Coil']],
  ['Busted Radio','📻',['Circuit Board','Speaker Magnet','Plastic Casing']],
  ['Old Tire','🛞',['Rubber Tire Chunk','Steel Cable']],
  ['Broken Chair','🪑',['Splintered Wood','Foam Padding','Bent Spring']],
  ['Rusty Bike Frame','🚲',['Steel Plate','Rusty Bolt','Rubber Strip']],
  ['Dead Car Battery','🔋',['Battery Cell','Lead Pipe','Zinc Coating']],
  ['Cracked Mirror','🪞',['Broken Mirror','Wood Veneer']],
  ['Old Washing Machine','🧺',['Steel Plate','Motor Part','Silicone Seal']],
  ['Broken Computer','💻',['Circuit Board','Microchip','Aluminum Sheet']],
  ['Torn Couch','🛋️',['Foam Padding','Cloth Scrap','Wood Chips']],
  ['Old Mattress','🛏️',['Metal Coil','Cotton Batting','Cloth Scrap']],
  ['Broken Umbrella','☂️',['Steel Cable','Nylon Cord','Plastic Gear']],
  ['Shattered Window','🪟',['Glass Shard','Wood Veneer','Aluminum Sheet']],
  ['Old Newspaper Bundle','📰',['Newspaper Stack','Paper Pulp','Cardboard Bundle']],
  ['Broken Skateboard','🛹',['Plywood Scrap','Rubber Tire Chunk','Steel Cable']],
  ['Rusty Toolbox','🧰',['Rusty Nail','Bent Wire Hanger','Steel Plate']],
  ['Cracked Flowerpot','🪴',['Clay Lump','Ceramic Tile','Sand Bag']],
];
const DUMP_ITEMS = DUMP_ITEM_DEFS.map(([name,emoji,yieldNames]) => ({
  id:'junk_'+slug(name), name, emoji,
  yields: yieldNames.map(n => findMaterial(n).id),
}));
let JUNK_PILES = []; // {x,z,mesh,item,zone} — NOT persisted, same ambient category as wreckage/robots
function buildJunkPileMesh(x, z) {
  const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  [[-0.3,0.2,-0.15],[0.2,0.15,0.2],[0,0.3,0],[0.25,0.1,-0.2]].forEach(([dx,dy,dz]) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.4,0.5), mat(0x6b6b5a));
    s.position.set(dx,dy,dz); s.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    g.add(s);
  });
  return g;
}
function spawnJunkPile(x, z) {
  const item = DUMP_ITEMS[Math.floor(Math.random()*DUMP_ITEMS.length)];
  const mesh = buildJunkPileMesh(x, z);
  const pile = { x, z, mesh, item, zone:null };
  addCol(CITY_COLS, x, z, 0.6, 0.6);
  const zone = { x, z, r:2.5, label:`🗑️ Pick Up ${item.emoji} ${item.name}`, action: () => pickUpJunk(pile) };
  pile.zone = zone;
  CITY_ZONES.push(zone);
  JUNK_PILES.push(pile);
}
function pickUpJunk(pile) {
  if(!pile.mesh) return; // already collected, waiting to respawn
  addToInventory(pile.item.id, pile.item.name, pile.item.emoji);
  saveCurrentUser();
  scene.remove(pile.mesh); pile.mesh = null;
  const zi = CITY_ZONES.indexOf(pile.zone); if(zi>-1) CITY_ZONES.splice(zi,1);
  pile.zone = null;
  showNotif(`🗑️ Picked up ${pile.item.emoji} ${pile.item.name}! Bring it to the Grinder.`);
  sfx.click();
  setTimeout(() => {
    const idx = JUNK_PILES.indexOf(pile); if(idx>-1) JUNK_PILES.splice(idx,1);
    spawnJunkPile(pile.x, pile.z); // real respawn at the same spot, a fresh random item
  }, 30000);
}
function buildDump() {
  buildLogoSign('THE DUMP', '🗑️', '#6b6b5a', '#ffaa00', DUMP_CENTER.x, 5, DUMP_CENTER.z-16);
  const offsets = [[-10,-8],[-4,-11],[3,-9],[9,-6],[-8,2],[-2,5],[4,3],[10,6],[-6,9],[2,10]];
  offsets.forEach(([dx,dz]) => spawnJunkPile(DUMP_CENTER.x+dx, DUMP_CENTER.z+dz));
}
function useGrinder() {
  const messages = [];
  if(wreckagePiles.length > 0) {
    const count = wreckagePiles.length;
    wreckagePiles.forEach(w => {
      scene.remove(w.mesh);
      scrapMetal += 3;
      (w.type && w.type.yields || []).forEach(name => {
        const m = findMaterial(name);
        if(m) addToInventory(m.id, m.name, m.emoji);
      });
    });
    wreckagePiles = [];
    updateScrapMetal();
    messages.push(`${count} wreckage pile${count===1?'':'s'} → +${count*3} 🔩 Scrap Metal + real robot materials`);
  }
  let junkGroundCount = 0;
  DUMP_ITEMS.forEach(item => {
    const held = playerInventory[item.id];
    if(held && held.qty > 0) {
      for(let n=0; n<held.qty; n++) {
        item.yields.forEach(matId => {
          const m = MATERIALS.find(x => x.id === matId);
          addToInventory(m.id, m.name, m.emoji);
        });
      }
      junkGroundCount += held.qty;
      delete playerInventory[item.id];
    }
  });
  if(junkGroundCount > 0) messages.push(`${junkGroundCount} junk item${junkGroundCount===1?'':'s'} → real materials extracted`);

  if(messages.length === 0) { showNotif('⚙️ Nothing to grind — bring wreckage or pick up junk from The Dump!'); return; }
  sfx.power();
  showNotif(`⚙️ ${messages.join(' | ')}`);
  saveCurrentUser();
  refreshInventory();
}

// ─── INTERACTION ZONES ───────────────────────────────────────────────────────
const CITY_ZONES = [
  { x:HOUSE_DOOR.x, z:HOUSE_DOOR.z, r:5,  label:'Enter Your House',            action: enterHouse },
  { x:-45, z:-107, r:3.5, label:'🅿️ Park Car Here', action: parkCarAtHome },
  { x:65,  z:48,  r:16, label:'Work as Shopkeeper (+5 S.I.P./task)',           action: ()=>toggleJob('Shopkeeper',5,'📦 A customer needs help!'), isJobZone:true, jobType:'Shopkeeper' },
  { x:12,  z:92,  r:3,  label:'🧊 Get Ingredients from Fridge',                action: getIngredients,    isFridge:true },
  { x:28,  z:92,  r:3,  label:'🔪 Prep Counter — chop & prepare',              action: prepareFood,       isPrep:true },
  { x:20,  z:92,  r:4,  label:'🔥 Cook at Stove',                              action: startCooking,      isStove:true },
  { x:12,  z:96,  r:4,  label:'🍽️ Deliver to customer (+20 S.I.P.)',           action: ()=>serveAtTable(0), isServe:true },
  { x:20,  z:96,  r:4,  label:'🍽️ Deliver to customer (+20 S.I.P.)',           action: ()=>serveAtTable(1), isServe:true },
  { x:28,  z:96,  r:4,  label:'🍽️ Deliver to customer (+20 S.I.P.)',           action: ()=>serveAtTable(2), isServe:true },
  { x:-68, z:10,  r:14, label:'Work as Officer (+10 S.I.P./task)',             action: ()=>toggleJob('Officer',10,'🚨 Trouble downtown — respond!'), isJobZone:true, jobType:'Officer' },
  { x:58,  z:54,  r:8,  label:'☕ Coffee Shop',  action: ()=>shopOrRob('Coffee Shop', 8,35),  isShop:true },
  { x:44,  z:54,  r:8,  label:'🧸 Toy Store',    action: ()=>shopOrRob('Toy Store',  15,50),  isShop:true },
  { x:70,  z:54,  r:8,  label:'👗 Outfit Shop',  action: ()=>{ alignment==='bad'?robShop('Outfit Shop',65):openShop('outfits'); }, isShop:true },
  { x:84,  z:54,  r:8,  label:'⚔️ Weapon Shop',  action: ()=>{ alignment==='bad'?robShop('Weapon Shop',80):openShop('weapons'); }, isShop:true },
  { x:20,  z:88,  r:8,  label:'🍕 Pizza Place',  action: ()=>shopOrRob('Pizza Place', 10,30), isShop:true },
  { x:34,  z:3,   r:5,  label:'🕴️ Talk to Shady Dealer',                       action: toggleAlignment,   isDealerZone:true },
  { x:-80, z:-71, r:5,  label:'⬛ ???',                                         action: openBlackMarket,   isBlackMarket:true },
  { x:-30, z:38,  r:7,  label:'🏦 Enter City Bank',                             action: openBankPasscode },
  { x:50,  z:-72, r:8,  label:'🎬 Movie Theater – Pick a Movie!', action: openCinema },
  { x:0,   z:50,  r:13, label:'🚇 S.I.T.S. Transit Hub – Ride anywhere!', action: openSITS },
  { x:-15, z:4,   r:8,  label:'🏨 City Hotel – Check In!',               action: openHotel },
  { x:130, z:35,  r:10, label:'🚗 Car Dealership – Buy a car!', action: openCarShop },
  { x:100, z:58,  r:9,  label:'💻 Computer Shop – Buy a computer!', action: openComputerShop },
  { x:-200,z:-182,r:18, label:'✈️ City Airport – Enter the Lounge!', action: () => enterAirportLounge('Downtown Explox', -200, -160, true) },
  { x:110, z:-13, r:8,  label:'🍽️ The Diner – Order a real meal!',  action: openRestaurant },
  { x:160, z:-13, r:8,  label:'🏪 Your Store',    action: interactWithStorePlot },
  { x:40,  z:93,  r:9,  label:'🕹️ Enter Pixel Palace Arcade', action: enterArcade },
];
const HOUSE_ZONES = [
  { x:HOUSE_EXIT.x, z:HOUSE_EXIT.z, r:3, label:'Exit House', action: exitHouse },
  // The Computer and Guest-spot zones used to sit at pre-migration coordinates (x:358/346) — real
  // dead zones ever since the house interior moved out to the HOUSE_SPAWN.x=10000 pocket lane, over
  // 9,600 units away. Fixed to the room's real coordinates, matching where the desk/figure actually are.
  { x:HOUSE_SPAWN.x+8, z:0.5, r:2.2, label:'💻 Use Computer', action: openSIB, isComputer:true },
  { x:HOUSE_SPAWN.x-7, z:HOUSE_SPAWN.z+6, r:2.5, label:'', action: sayGoodbyeToGuest, isGuestSpot:true },
  { x:HOUSE_SPAWN.x+5.5, z:-5,   r:2.5, label:'🛏️ Sleep',        action: sleepAtHome },
  { x:HOUSE_SPAWN.x-4,   z:3,    r:2.2, label:'🛋️ Sit on Sofa',  action: sitOnSofa },
  { x:HOUSE_SPAWN.x+9.5, z:2,    r:1.8, label:'📺 Watch TV',     action: watchHotelTV },
  { x:HOUSE_SPAWN.x-6,   z:-6.3, r:2.5, label:'🍳 Cook a Meal',  action: cookMeal },
  { x:HOUSE_SPAWN.x-9.5, z:-2,   r:2,   label:'📚 Read a Book',  action: readBook },
];
const HOTEL_ZONES = [
  // Budget room (x=HOTEL_SPAWN.x+0)
  { x:HOTEL_SPAWN.x,   z:6,  r:3, label:'🚪 Check Out of Hotel', action: checkoutHotel },
  { x:HOTEL_SPAWN.x+4, z:-3, r:3, label:'🛏️ Sleep in Bed',       action: sleepInHotel  },
  { x:HOTEL_SPAWN.x-4, z:0,  r:3, label:'📺 Watch TV',            action: watchHotelTV  },
  // Standard room (x=HOTEL_SPAWN.x+30)
  { x:HOTEL_SPAWN.x+30, z:6,  r:3, label:'🚪 Check Out of Hotel', action: checkoutHotel },
  { x:HOTEL_SPAWN.x+34, z:-3, r:3, label:'🛏️ Sleep in Bed',       action: sleepInHotel  },
  { x:HOTEL_SPAWN.x+26, z:0,  r:3, label:'📺 Watch TV',            action: watchHotelTV  },
  // Luxury suite (x=HOTEL_SPAWN.x+60)
  { x:HOTEL_SPAWN.x+60, z:6,  r:3, label:'🚪 Check Out of Hotel', action: checkoutHotel },
  { x:HOTEL_SPAWN.x+64, z:-3, r:3, label:'🛏️ Sleep in Bed',       action: sleepInHotel  },
  { x:HOTEL_SPAWN.x+56, z:0,  r:3, label:'📺 Watch TV',            action: watchHotelTV  },
];
const MALL_ZONES = [
  { x:MALL_EXIT.x, z:MALL_EXIT.z, r:5,  label:'Exit Mall',           action: exitMall },
  { x:MALL_SPAWN.x-27, z:-16,      r:7,  label:'👗 Outfit Shop',       action: ()=>openShop('outfits') },
  { x:MALL_SPAWN.x+27, z:-16,      r:7,  label:'⚔️ Weapon Shop',       action: ()=>openShop('weapons') },
  { x:MALL_SPAWN.x-27, z:-3,       r:7,  label:'💍 Buy Jewelry (30)',   action: ()=>buyItem('Jewelry',30) },
  { x:MALL_SPAWN.x+27, z:-3,       r:7,  label:'📱 Buy Phone (45)',     action: ()=>buyItem('Phone',45) },
  { x:MALL_SPAWN.x+27, z:10,       r:7,  label:'🍦 Buy Ice Cream (8)', action: ()=>buyItem('Ice Cream',8) },
];
// Filled by buildArcadeInterior() — one proximity zone per cabinet/claw machine, so walking
// up to a specific machine and pressing E plays it directly (no flat card-grid lobby anymore).
const ARCADE_ZONES = [];

function handleInteract() {
  const px2 = playerGroup.position.x, pz = playerGroup.position.z;
  // Stand up if seated — takes priority over everything else, same as exiting a car
  if(playerSeated) { playerSeated = false; showNotif('🪑 You stand up.'); return; }
  // Exit car
  if(inCar) { exitCar(); return; }
  // Enter nearby parked car
  for(const pc of parkedCars) {
    const dx=px2-pc.group.position.x, dz=pz-pc.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { enterCar(pc); return; }
  }
  // Store restocking: pick up a delivered box, or place a carried one on its matching shelf
  if(inStore) {
    if(carriedBox) { if(tryPlaceBox()) return; }
    else { if(tryPickUpBox()) return; }
  }
  // Bad guy with weapon: NPC attack takes priority over zone actions
  if(alignment === 'bad' && playerWeapon !== 'none' && !inHouse && !inMall && !inArcade) {
    let closest = null, closestDist = 3.5;
    for(const npc of npcs) {
      const d = Math.sqrt((px2-npc.group.position.x)**2+(pz-npc.group.position.z)**2);
      if(d < closestDist) { closestDist = d; closest = npc; }
    }
    if(closest) { attackNPC(closest); return; }
  }
  // Rogue robots (item 156) roam freely into the city and can be fought back any time, same
  // priority tier as attacking an NPC — they aren't tied to a fixed CITY_ZONES position since they move.
  if (!inHouse && !inMall && !inArcade && !inStore) {
    let closestRogue = null, closestRogueDist = 3;
    for (const r of rogueRobots) {
      if (!r.alive) continue;
      const d = Math.sqrt((px2-r.x)**2+(pz-r.z)**2);
      if (d < closestRogueDist) { closestRogueDist = d; closestRogue = r; }
    }
    if (closestRogue) { fightRogueRobot(closestRogue); return; }
  }
  const zones = inPrison ? PRISON_ZONES : inFriendHouse ? FRIEND_HOUSE_ZONES : inLandHouse ? LAND_HOUSE_ZONES : inCountryHotel ? COUNTRY_HOTEL_ZONES : inAirportLounge ? AIRPORT_LOUNGE_ZONES : inArcade ? ARCADE_ZONES : inHotel ? HOTEL_ZONES : inHouse ? HOUSE_ZONES : inMall ? MALL_ZONES : inStore ? STORE_ZONES : CITY_ZONES;
  for(const z of zones) {
    if(Math.sqrt((px2-z.x)**2+(pz-z.z)**2) < z.r) { z.action(); return; }
  }
  if(!inHouse && !inHotel && !inMall && !inStore && !inFriendHouse && !inLandHouse && !inCountryHotel && !inAirportLounge && !inCar && !inArcade) {
    const neighbor = findNearestNeighbor(px2, pz, 3);
    if(neighbor) { openNeighborModal(neighbor.name); return; }
  }
  showNotif('Nothing nearby to interact with.');
}

function updatePrompt() {
  const px2 = playerGroup.position.x, pz = playerGroup.position.z;
  const el = document.getElementById('ePrompt');
  if(inCar) { el.textContent='[E] Exit Car'; el.style.display='block'; return; }
  for(const pc of parkedCars) {
    const dx=px2-pc.group.position.x, dz=pz-pc.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<7) { el.textContent=`[E] ${pc.def.emoji} Get in ${pc.def.name}`; el.style.display='block'; return; }
  }
  const zones = inPrison ? PRISON_ZONES : inFriendHouse ? FRIEND_HOUSE_ZONES : inLandHouse ? LAND_HOUSE_ZONES : inCountryHotel ? COUNTRY_HOTEL_ZONES : inAirportLounge ? AIRPORT_LOUNGE_ZONES : inArcade ? ARCADE_ZONES : inHotel ? HOTEL_ZONES : inHouse ? HOUSE_ZONES : inMall ? MALL_ZONES : inStore ? STORE_ZONES : CITY_ZONES;
  for(const z of zones) {
    if(Math.sqrt((px2-z.x)**2+(pz-z.z)**2) < z.r) {
      if(z.isComputer) {
        el.textContent = ownedComputers.length>0 ? '[E] 💻 Open SIB Browser' : '[E] 💻 No computer (buy one at the Computer Shop)';
        el.style.display='block'; return;
      }
      if(z.isJobZone) {
        if(activeJob === z.jobType) {
          el.textContent = jobTaskActive ? `[E] ${activeJobTaskText}` : `[E] Stop working as ${z.jobType}`;
        } else {
          el.textContent = `[E]  ${z.label}`;
        }
        el.style.display='block'; return;
      }
      if(z.isGuestSpot) {
        if(!houseGuest) { el.style.display='none'; return; }
        el.textContent = `[E] 👋 Say bye to ${houseGuest}`; el.style.display='block'; return;
      }
      if(z.isFridge) {
        if(cookState !== 'idle') { el.textContent = '🧺 Already have ingredients!'; el.style.display='block'; return; }
        el.textContent = '[E] 🧊 Get Ingredients'; el.style.display='block'; return;
      }
      if(z.isPrep) {
        if(cookState === 'idle')          { el.textContent = 'Get ingredients first!'; el.style.display='block'; return; }
        if(cookState === 'has_ingredients') { el.textContent = '[E] 🔪 Start Chopping!'; el.style.display='block'; return; }
        if(cookState === 'preparing')     { el.textContent = `[E] 🔪 Chop! (${cookSubPresses}/${PREP_PRESSES})`; el.style.display='block'; return; }
        el.textContent = 'Already prepped — go to the stove!'; el.style.display='block'; return;
      }
      if(z.isStove) {
        if(cookState === 'idle' || cookState === 'has_ingredients' || cookState === 'preparing') {
          el.textContent = 'Prep food first! (Fridge → Prep Counter)'; el.style.display='block'; return;
        }
        if(cookState === 'prepared')  { el.textContent = '[E] 🔥 Cook it!'; el.style.display='block'; return; }
        if(cookState === 'cooking')   { el.textContent = `[E] 🔥 Cooking... (${cookSubPresses}/${COOK_PRESSES})`; el.style.display='block'; return; }
        if(cookState === 'ready')     { el.textContent = '🍕 Food ready! Deliver to a customer!'; el.style.display='block'; return; }
      }
      if(z.isServe) {
        if(cookState !== 'ready') { el.style.display='none'; return; }
        const idx = [12,20,28].indexOf(z.x);
        const order = idx >= 0 ? tableOrders[idx] : 'order';
        el.textContent = `[E] 🍽️ Deliver ${order}`; el.style.display='block'; return;
      }
      if(z.isDealerZone) {
        el.textContent = alignment === 'bad' ? '[E] 😇 Go Straight' : '[E] 😈 Join the Underground';
        el.style.display='block'; return;
      }
      if(z.isBlackMarket) {
        el.textContent = alignment === 'bad' ? '[E] 🕴️ Enter Black Market' : '[E] ⬛ ??? (Bad guys only)';
        el.style.display='block'; return;
      }
      if(z.isShop && alignment === 'bad') {
        const cd = robbedCooldowns[z.label.replace(/[^a-zA-Z ]/g,'').trim()];
        el.textContent = (cd > 0) ? `⏳ ${z.label} on cooldown (${Math.ceil(cd)}s)` : `[E] 🔫 Rob ${z.label}`;
        el.style.display='block'; return;
      }
      el.textContent = `[E]  ${z.label}`; el.style.display='block'; return;
    }
  }
  // NPC attack prompt — checked after zones so zones still take priority
  if(alignment === 'bad' && playerWeapon !== 'none' && !inHouse && !inMall && !inArcade) {
    for(const npc of npcs) {
      const d = Math.sqrt((px2-npc.group.position.x)**2+(pz-npc.group.position.z)**2);
      if(d < 3.5) { el.textContent=`[E] 💥 Attack ${npc.name}`; el.style.display='block'; return; }
    }
  }
  // Talk to a nearby neighbor — lowest priority, only out in the open city
  if(!inHouse && !inHotel && !inMall && !inStore && !inFriendHouse && !inLandHouse && !inCountryHotel && !inAirportLounge && !inCar && !inArcade) {
    const neighbor = findNearestNeighbor(px2, pz, 3);
    if(neighbor) { el.textContent = `[E] 👋 Talk to ${neighbor.name}`; el.style.display='block'; return; }
  }
  el.style.display = 'none';
}

// ─── LOCATION ZONES ──────────────────────────────────────────────────────────
const LOC_ZONES = [
  {name:'City Mall',       x:80,  z:-20, r:35},
  {name:'Westside Galleria', x:-250, z:-50, r:30},
  {name:'Uptown Plaza',      x:250,  z:150, r:30},
  {name:'Police Station',  x:-70, z:10,  r:26},
  {name:'Restaurant Row',  x:20,  z:80,  r:30},
  {name:'The Park',        x:-10, z:-60, r:28},
  {name:'Shopping Street', x:60,  z:50,  r:26},
  {name:'Your House',      x:-30, z:-110,r:20},
  {name:'Whispering Woods',x:WOODS_CENTER.x, z:WOODS_CENTER.z, r:30},
  {name:'Sunset Plains',   x:LAND_CENTER.x,  z:LAND_CENTER.z,  r:380},
  {name:'The Scrapyard',   x:SCRAPYARD_CENTER.x, z:SCRAPYARD_CENTER.z, r:30},
  {name:'The Dump',        x:DUMP_CENTER.x, z:DUMP_CENTER.z, r:25},
  {name:'City Hall',       x:0,   z:-35, r:22},
  {name:'Hospital',        x:-40, z:60,  r:22},
  {name:'School',          x:70,  z:60,  r:22},
  {name:'Apartments',      x:-50, z:-50, r:28},
  {name:'City Bank',       x:-30, z:30,  r:18},
  {name:'Movie Theater',   x:50,  z:-85, r:22},
  {name:'Transit Hub',     x:0,   z:50,  r:22},
  {name:'City Hotel',      x:-15, z:-5,  r:18},
  {name:'Car Dealership',  x:130, z:28,  r:30},
  {name:'Computer Shop',   x:100, z:50,  r:22},
  {name:'City Airport',    x:-200,z:-200,r:40},
  {name:'The Diner',       x:110, z:-25, r:18},
  {name:'Your Store',      x:160, z:-25, r:18},
  {name:'Japan',           x:600,  z:-600, r:85},
  {name:'France',          x:-600, z:-600, r:85},
  {name:'Brazil',          x:600,  z:700,  r:85},
  {name:'Egypt',           x:900,  z:300,  r:85},
  {name:'UK',              x:-700, z:-700, r:85},
  {name:'Australia',       x:800,  z:-200, r:85},
  {name:'Canada',          x:-600, z:400,  r:85},
  {name:'Italy',           x:0,    z:-900, r:85},
];

// ─── START GAME ──────────────────────────────────────────────────────────────
function _showErr(msg) {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#c00;color:#fff;padding:20px;font-size:14px;z-index:99999;text-align:center;border-radius:10px;max-width:85%;word-break:break-all;line-height:1.5;';
  d.textContent = '❌ ' + msg;
  document.body.appendChild(d);
}
function startGame() {
  try { _startGameInner(); } catch(e) { _showErr('startGame crashed: ' + e.message); }
}
function _startGameInner() {
  // Start bank timer now (not at page load) so it never fires during login
  setInterval(() => {
    if(!currentUser) return;
    bankBalance += 10000;
    saveCurrentUser();
    const overlay = document.getElementById('bankOverlay');
    if(overlay && overlay.style.display !== 'none') {
      document.getElementById('bankBalDisplay').textContent = bankBalance.toLocaleString() + ' S.I.P.';
    }
    sfx.notify();
    showNotif('🏦 Bank earned +10,000 S.I.P.!');
  }, 60000);


  // Check WebGL is available
  const _tc = document.createElement('canvas');
  const _gl = _tc.getContext('webgl') || _tc.getContext('experimental-webgl');
  if (!_gl) {
    const err = document.createElement('div');
    err.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#111;color:#f55;font-size:22px;display:flex;align-items:center;justify-content:center;text-align:center;padding:30px;z-index:9999;';
    err.innerHTML = '⚠️ WebGL not available.<br>Try opening in Chrome or Firefox.';
    document.body.appendChild(err);
    return;
  }

  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0x87CEEB, 200, 1200);
  camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 3000);
  renderer = new THREE.WebGLRenderer({ antialias:false });
  renderer.shadowMap.enabled = false;
  document.body.appendChild(renderer.domElement);
  const rd = renderer.domElement;
  rd.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;';
  function _resizeRenderer() {
    const w = window.innerWidth  || document.documentElement.clientWidth  || 840;
    const h = window.innerHeight || document.documentElement.clientHeight || 360;
    // The 3rd arg (false) asks Three.js to update only the internal drawing
    // resolution, not the canvas's CSS width/height — but setPixelRatio below
    // can still reset the style back to fixed pixel values internally, so the
    // style is force-reasserted afterward as a guaranteed final step. Without
    // this, a resize that fires with a too-small reading (e.g. during an
    // itch.io mobile embed still settling) visually pins the canvas to that
    // small size until another resize happens to read bigger.
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rd.style.width = '100%';
    rd.style.height = '100%';
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  _resizeRenderer();
  window.addEventListener('resize', _resizeRenderer);
  window.addEventListener('orientationchange', () => setTimeout(_resizeRenderer, 300));
  setTimeout(_resizeRenderer, 500);
  setTimeout(_resizeRenderer, 1500);
  // The fixed-delay calls above are a guess at when an itch.io mobile embed
  // settles into its final iframe size — if it takes longer than that, the
  // renderer keeps drawing at the wrong resolution while the canvas's CSS box
  // is already the right size, which stretches the image (looks "squished").
  // ResizeObserver reacts to the ACTUAL size change whenever it happens instead
  // of guessing a delay, so it catches slow-to-settle embeds the timers miss.
  if(window.ResizeObserver) {
    new ResizeObserver(_resizeRenderer).observe(document.body);
  }

  const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
  sun.position.set(60,100,40);
  scene.add(sun, new THREE.AmbientLight(0x9ab8d8, 0.7));

  function _dbg(label, fn) {
    try { fn(); }
    catch(e) {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);background:red;color:#fff;padding:8px 16px;border-radius:8px;z-index:9999;font-size:13px;pointer-events:none;';
      d.textContent = '❌ Crash in ' + label + ': ' + e.message;
      document.body.appendChild(d);
      console.error(label, e);
    }
  }
  _dbg('buildCity', buildCity);
  _dbg('buildPlayerHouse', buildPlayerHouse);
  _dbg('buildHouseInterior', buildHouseInterior);
  _dbg('buildHotelInterior', buildHotelInterior);
  _dbg('buildMallInterior', buildMallInterior);
  _dbg('buildArcadeInterior', buildArcadeInterior);
  _dbg('buildWoodsArea', buildWoodsArea);
  _dbg('buildSunsetPlains', buildSunsetPlains);
  _dbg('buildExtraMalls', buildExtraMalls);
  _dbg('buildLandHouseInterior', buildLandHouseInterior);
  _dbg('buildCountryHotelInterior', buildCountryHotelInterior);
  _dbg('buildAirportLoungeInterior', buildAirportLoungeInterior);
  _dbg('buildScrapyard', buildScrapyard);
  _dbg('buildGlobalSpawners', buildGlobalSpawners);
  _dbg('buildDump', buildDump);
  _dbg('buildMallShopWing', buildMallShopWing);
  _dbg('buildOutfitShopWing', buildOutfitShopWing);
  _dbg('buildCountryZones', buildCountryZones);
  _dbg('spawnOwnedCars', spawnOwnedCars);
  _dbg('buildPlayer', buildPlayer);
  _dbg('buildNPCs', buildNPCs);
  _dbg('buildShopperPopulation', buildShopperPopulation);
  _dbg('refreshHouseGuest', refreshHouseGuest); // must run AFTER shoppers exist, in case a save loaded with a guest already set
  _dbg('buildCityShops', buildCityShops);
  _dbg('buildTownEventsBoard', buildTownEventsBoard);
  _dbg('buildElders', buildElders);
  _dbg('buildChildren', buildChildren); // must run AFTER shoppers exist — looks up parent NPCs by name for home position
  _dbg('buildPrisonInterior', buildPrisonInterior);
  _dbg('buildOwnedStore', buildOwnedStore);
  _dbg('applySeasonEffects', applySeasonEffects);
  _dbg('checkPendingNotices', checkPendingNotices);
  setupControls();
  // Snap camera to spawn position so first frame isn't black
  camera.position.set(
    playerGroup.position.x - Math.sin(yaw) * 9,
    playerGroup.position.y + 4 + pitch * 4,
    playerGroup.position.z - Math.cos(yaw) * 9
  );
  camera.lookAt(playerGroup.position.x, playerGroup.position.y + 2.2, playerGroup.position.z);
  animate();
  bgMusic.start();
  setTimeout(() => { if(_frames < 1) _showErr('animate() never ran — THREE may not have loaded. Check that three.min.js is in the ZIP.'); }, 3000);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function mat(color) { return new THREE.MeshLambertMaterial({color}); }
function box(w,h,d, color, x,y,z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color));
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true;
  scene.add(m); return m;
}
// Shared two-panel builder used by both buildSign() and buildLogoSign(). A single mirrored
// texture on one DoubleSide plane can only ever be correct from ONE approach direction — the
// opposite direction always shows it backwards (this is what happened to the house nameplate,
// and evidently other signs too). The real fix: two COPLANAR meshes, same geometry, same
// transform, NOT rotated relative to each other — one THREE.FrontSide with a normal texture,
// one THREE.BackSide with a mirrored texture. FrontSide/BackSide change which face renders,
// NOT the coordinate mapping (rotating the mesh instead was tried first and was wrong — it
// flips the local-U-to-world-X mapping too, cancelling the mirror back out). Same mental model
// as text printed on glass: correct from either side of the pane.
function buildSignPanels(cvWidth, cvHeight, drawFn, x, y, z, rot, planeWidth, planeHeight) {
  function makeCanvas(mirror) {
    const cv = document.createElement('canvas'); cv.width = cvWidth; cv.height = cvHeight;
    const c = cv.getContext('2d');
    c.save();
    if (mirror) { c.scale(-1,1); c.translate(-cvWidth,0); }
    drawFn(c);
    c.restore();
    return cv;
  }
  const geo = new THREE.PlaneGeometry(planeWidth, planeHeight);
  const front = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(makeCanvas(false)), side: THREE.FrontSide }));
  const back  = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(makeCanvas(true)),  side: THREE.BackSide }));
  const g = new THREE.Group();
  g.add(front); g.add(back);
  g.position.set(x,y,z); g.rotation.y = rot; scene.add(g);
  return g;
}
function buildSign(text, x, y, z, rot=0) {
  // Long text (e.g. a 50-character player name in "X's House") used to just run off the old
  // fixed 256px canvas and get clipped — shrinking the font wasn't enough on its own (a real
  // 50-char name still didn't fit even at the smallest readable size). Instead, WIDEN the
  // canvas/plane to fit the text at a fixed readable font — short text (every other sign in
  // the game) measures under the 256px floor, so its canvas/plane size never changes at all.
  const fontSize = 22;
  const mCv = document.createElement('canvas'); const mC = mCv.getContext('2d');
  mC.font = `bold ${fontSize}px Arial`;
  const cvWidth = Math.max(256, Math.ceil(mC.measureText(text).width) + 32);
  const planeWidth = 6 * (cvWidth / 256);
  return buildSignPanels(cvWidth, 64, (c) => {
    c.fillStyle='#fff'; c.fillRect(0,0,cvWidth,64);
    c.fillStyle='#111'; c.font=`bold ${fontSize}px Arial`; c.textAlign='center'; c.fillText(text,cvWidth/2,42);
  }, x, y, z, rot, planeWidth, 1.5);
}
// A real branded storefront sign: a colored circular logo badge (the shop's emoji) + its name
// as a wordmark beside it, instead of just plain emoji+text jammed together — matches how an
// actual storefront sign looks. `color`/`accentColor` are CSS color strings — a real 2-color
// theme (badge fill + ring, matching the storefront's own body + roof-trim colors) instead of
// a single flat color with a generic white ring.
function buildLogoSign(name, emoji, color, accentColor, x, y, z, rot=0) {
  const fontSize = 18;
  const mCv = document.createElement('canvas'); const mC = mCv.getContext('2d');
  mC.font = `bold ${fontSize}px Arial`;
  const cvWidth = Math.max(220, Math.ceil(mC.measureText(name).width) + 92);
  const cvHeight = 76;
  const planeWidth = 6.5 * (cvWidth / 220);
  return buildSignPanels(cvWidth, cvHeight, (c) => {
    c.fillStyle='#fff'; c.fillRect(0,0,cvWidth,cvHeight);
    c.strokeStyle=accentColor; c.lineWidth=3; c.strokeRect(1.5,1.5,cvWidth-3,cvHeight-3);
    const badgeX=40, badgeY=cvHeight/2, badgeR=28;
    c.beginPath(); c.arc(badgeX,badgeY,badgeR,0,Math.PI*2); c.fillStyle=color; c.fill();
    c.lineWidth=4; c.strokeStyle=accentColor; c.stroke();
    c.font='32px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(emoji,badgeX,badgeY+2);
    c.fillStyle='#111'; c.font=`bold ${fontSize}px Arial`; c.textAlign='left'; c.fillText(name,badgeX+badgeR+14,badgeY);
    c.fillStyle=accentColor; c.fillRect(badgeX+badgeR+14, badgeY+fontSize/2+4, mC.measureText(name).width, 3);
  }, x, y, z, rot, planeWidth, 1.9);
}
function buildChair(x, z, yaw=0) {
  const g=new THREE.Group();
  const wood=mat(0x5a3a1a), legWood=mat(0x3a2410);
  const seat=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.08,0.5), wood); seat.position.set(0,0.45,0); g.add(seat);
  const back=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.08), wood); back.position.set(0,0.75,-0.21); g.add(back);
  [[-0.2,-0.2],[0.2,-0.2],[-0.2,0.2],[0.2,0.2]].forEach(([lx,lz])=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.45,0.06), legWood); leg.position.set(lx,0.22,lz); g.add(leg);
  });
  g.children.forEach(c=>{c.castShadow=true;c.receiveShadow=true;});
  g.position.set(x,0,z); g.rotation.y=yaw; scene.add(g);
  return g;
}
// Simple static decoration car — NOT drivable/ownable (that's the real CAR_CATALOG/buildCar
// system), just background scenery for parking lots. No collider, matching how trees/benches/
// other pure set-dressing in the city doesn't block walking either.
function buildParkedDecorCar(x, z, color, yawAngle) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.2,1.1,2), mat(color)); body.position.set(0,0.75,0); g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2,0.9,1.8), mat(color)); cabin.position.set(-0.3,1.55,0); g.add(cabin);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.9,0.55,1.6), mat(0x223344)); glass.position.set(-0.3,1.6,0); g.add(glass);
  [[-1.5,-0.9],[-1.5,0.9],[1.4,-0.9],[1.4,0.9]].forEach(([wx,wz])=>{
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.3,12), mat(0x222222));
    wheel.rotation.z = Math.PI/2; wheel.position.set(wx,0.4,wz); g.add(wheel);
  });
  g.children.forEach(c=>{c.castShadow=true;c.receiveShadow=true;});
  g.position.set(x,0,z); g.rotation.y = yawAngle; scene.add(g);
}
// Reusable roadside billboard — posts + backing + a canvas ad panel, same visual recipe
// buildCityShops() already proved for the 100 outdoor shops (item 104), just generalized
// to take custom text/rotation instead of being inlined once per shop. DoubleSide + a Group
// (rotates as one unit) so it can be placed facing either direction along a road.
function buildRoadBillboard(x, z, rotY, emoji, text) {
  const g = new THREE.Group();
  const postL = new THREE.Mesh(new THREE.BoxGeometry(0.25,3.5,0.25), mat(0x5a5a5a)); postL.position.set(-2,1.75,0); g.add(postL);
  const postR = new THREE.Mesh(new THREE.BoxGeometry(0.25,3.5,0.25), mat(0x5a5a5a)); postR.position.set(2,1.75,0); g.add(postR);
  const backing = new THREE.Mesh(new THREE.BoxGeometry(4.6,2.2,0.15), mat(0x222222)); backing.position.set(0,3.6,0); g.add(backing);
  const cv = document.createElement('canvas'); cv.width=300; cv.height=140;
  const cx = cv.getContext('2d');
  cx.fillStyle='#fffbe0'; cx.fillRect(4,4,292,132);
  cx.strokeStyle='#222'; cx.lineWidth=5; cx.strokeRect(4,4,292,132);
  cx.textAlign='center'; cx.textBaseline='middle';
  cx.font='40px Arial'; cx.fillText(emoji,150,40);
  cx.fillStyle='#222'; cx.font='bold 17px Arial';
  wrapText(cx, text, 150, 85, 260, 22);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(4.4,2.05), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv), transparent:true, side:THREE.DoubleSide}));
  board.position.set(0,3.6,-0.08);
  g.add(board);
  g.children.forEach(c=>{c.castShadow=true;c.receiveShadow=true;});
  g.position.set(x,0,z); g.rotation.y = rotY; scene.add(g);
}

// ─── SEASONS & CALENDAR ──────────────────────────────────────────────────────
const HOLIDAYS = {
  '01-01': {name:"New Year's Day",  emoji:'🎊'},
  '02-14': {name:"Valentine's Day", emoji:'❤️'},
  '03-17': {name:"St. Patrick's",   emoji:'🍀'},
  '04-01': {name:"April Fools",     emoji:'🃏'},
  '07-04': {name:"4th of July",     emoji:'🎆'},
  '10-31': {name:"Halloween",       emoji:'🎃'},
  '12-24': {name:"Christmas Eve",   emoji:'🌙'},
  '12-25': {name:"Christmas",       emoji:'🎄'},
  '12-31': {name:"New Year's Eve",  emoji:'🥂'},
};
const SEASONS = {
  winter: {sky:0xc8d8e8, fog:0xc8d8e8, ground:0xddeeff, tree:0x99aabb, particle:'snow',  emoji:'❄️', name:'Winter'},
  spring: {sky:0x87CEEB, fog:0x87CEEB, ground:0x5ab44c, tree:0x44cc44, particle:null,     emoji:'🌸', name:'Spring'},
  summer: {sky:0x5bbce0, fog:0x5bbce0, ground:0x3a8a2a, tree:0x228822, particle:null,     emoji:'☀️', name:'Summer'},
  fall:   {sky:0xc8a070, fog:0xd4a870, ground:0x8a5828, tree:0xcc6622, particle:'leaves', emoji:'🍂', name:'Fall'},
};

function getSeasonInfo() {
  const now  = new Date();
  const m    = now.getMonth() + 1;
  const d    = now.getDate();
  const mmdd = String(m).padStart(2,'0') + '-' + String(d).padStart(2,'0');
  const sk   = (m===12||m<=2)?'winter':m<=5?'spring':m<=8?'summer':'fall';
  const season = SEASONS[sk];
  let holiday  = HOLIDAYS[mmdd] || null;
  if(!holiday && playerBirthday && playerBirthday === mmdd)
    holiday = {name:'Happy Birthday ' + (playerName||'Player') + '!', emoji:'🎂'};
  let skySky = season.sky, fogFog = season.fog;
  if(m===10 && d===31){ skySky=0x1a0a2e; fogFog=0x220a1a; }
  return {season, sk, holiday, skySky, fogFog, mmdd};
}

function applySeasonEffects() {
  if(!scene) return;
  const {season, holiday, skySky, fogFog, mmdd} = getSeasonInfo();
  scene.background.set(skySky);
  scene.fog.color.set(fogFog);
  if(groundMesh) groundMesh.material.color.set(season.ground);
  treeMeshes.forEach(m => m.material.color.set(season.tree));
  if(season.particle) startWeatherParticles(season.particle);
  updateSeasonHud();
  if(holiday) setTimeout(() => showNotif(holiday.emoji + ' ' + holiday.name + ' 🎉'), 1500);
  // On the player's ACTUAL birthday, throw the same kind of real party the neighbors get —
  // decor + a gift — instead of just a toast. Gated to once per real day (lastBirthdayGiftDate)
  // so reloading the page on your birthday doesn't hand out free money over and over.
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + mmdd;
  if(playerBirthday && playerBirthday === mmdd && lastBirthdayGiftDate !== todayStr) {
    lastBirthdayGiftDate = todayStr;
    saveCurrentUser();
    setTimeout(() => {
      buildEventDecor('birthday', TOWN_EVENT_SPOT.x, TOWN_EVENT_SPOT.z);
      sipDollars += 30; updateSIP();
      sfx.cheer();
      showNotif(`🎂 Happy Birthday, ${playerName || 'Player'}! The neighbors chipped in a gift. (+30 S.I.P.)`);
    }, 2000);
  }
}

function updateSeasonHud() {
  const el = document.getElementById('seasonHud');
  if(!el) return;
  const {season, holiday} = getSeasonInfo();
  el.textContent = season.emoji + ' ' + season.name + (holiday ? '  |  ' + holiday.emoji + ' ' + holiday.name : '');
}

function startWeatherParticles(type) {
  weatherParticles.forEach(p => scene.remove(p));
  weatherParticles = [];
  const count = type==='snow' ? 280 : 180;
  const leafColors = [0xcc6622,0xdd8833,0xaa4411,0xffaa00,0xdd5500];
  for(let i=0; i<count; i++) {
    const mesh = new THREE.Mesh(
      type==='snow'
        ? new THREE.SphereGeometry(0.12,4,4)
        : new THREE.BoxGeometry(0.35,0.02,0.35),
      new THREE.MeshBasicMaterial({color: type==='snow' ? 0xffffff : leafColors[Math.floor(Math.random()*leafColors.length)]})
    );
    mesh.position.set((Math.random()-0.5)*200, Math.random()*40, (Math.random()-0.5)*200);
    mesh._speed  = 0.5 + Math.random()*(type==='snow'?1.5:0.9);
    mesh._driftX = (Math.random()-0.5)*0.4;
    mesh._driftZ = (Math.random()-0.5)*0.2;
    mesh._spin   = type==='leaves' ? (Math.random()-0.5)*0.07 : 0;
    scene.add(mesh);
    weatherParticles.push(mesh);
  }
}

function openCalendar() {
  const info = getSeasonInfo();
  const now  = new Date();
  const year = now.getFullYear(), month = now.getMonth(), today = now.getDate();
  const MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const firstDay = new Date(year,month,1).getDay();
  const dim = new Date(year,month+1,0).getDate();
  let grid = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:10px;">';
  DN.forEach(n => { grid += `<div style="color:#666;font-size:9px;text-align:center;padding:2px;">${n}</div>`; });
  for(let i=0;i<firstDay;i++) grid += '<div></div>';
  for(let d=1;d<=dim;d++) {
    const mmdd = String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const hol  = HOLIDAYS[mmdd];
    const isBd = playerBirthday === mmdd;
    const isTd = d===today;
    let bg='rgba(255,255,255,0.04)', col='#888', extra='';
    if(hol)  { bg='rgba(255,200,0,0.18)'; col='#FFD700'; extra=`<div style="font-size:9px;">${hol.emoji}</div>`; }
    if(isBd) { bg='rgba(255,80,200,0.22)'; col='#ff88ff'; extra=`<div style="font-size:9px;">🎂</div>`; }
    if(isTd) { bg='#e94560'; col='#fff'; }
    grid += `<div style="background:${bg};color:${col};border-radius:4px;padding:3px 1px;text-align:center;font-size:11px;font-weight:${isTd?'bold':'normal'};">${d}${extra}</div>`;
  }
  grid += '</div>';
  let upcoming = '';
  for(let d=today;d<=dim;d++){
    const mmdd=String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const h=HOLIDAYS[mmdd];
    if(h)   upcoming += `<div style="color:#FFD700;font-size:11px;margin-bottom:3px;">${h.emoji} <b>${h.name}</b> — ${MN[month]} ${d}</div>`;
    if(playerBirthday===mmdd) upcoming += `<div style="color:#ff88ff;font-size:11px;margin-bottom:3px;">🎂 <b>Birthday!</b> — ${MN[month]} ${d}</div>`;
  }
  document.getElementById('calendarContent').innerHTML = `
    <div style="text-align:center;color:#e94560;font-size:14px;font-weight:bold;letter-spacing:2px;margin-bottom:6px;">${MN[month].toUpperCase()} ${year}</div>
    <div style="text-align:center;font-size:18px;margin-bottom:10px;">${info.season.emoji} ${info.season.name}</div>
    ${grid}
    ${upcoming?`<div style="border-top:1px solid #333;padding-top:8px;margin-top:2px;">${upcoming}</div>`:''}
  `;
  if(document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('calendarOverlay').style.display='flex';
}
function closeCalendar() {
  document.getElementById('calendarOverlay').style.display='none';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ─── CITY ────────────────────────────────────────────────────────────────────
function buildCity() {
  // Ground
  const g=new THREE.Mesh(new THREE.PlaneGeometry(5000,5000),mat(0x5a9e3c));
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

  // HOSPITAL
  box(32,20,24, 0xeeeeff,-40,10,60); box(32,1,24, 0xccccdd,-40,20.5,60);
  box(10,16,4, 0x88aaff,-40,8,72.2); buildSign('🏥 HOSPITAL',-40,22,72);
  box(6,1.5,0.3, 0xdd0000,-40,14,72.3); box(1.5,6,0.3, 0xdd0000,-40,14,72.3);
  box(7,3,3, 0xffffff,-55,1.5,68); box(7,1.5,3, 0xddddff,-55,3.75,68);
  addCol(CITY_COLS,-40,60, 17,13);

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

  // CITY BANK — marble building at x=-30, z=30
  box(24,18,18, 0xf0ece0, -30,9,30);                 // marble main building
  box(24,1.2,18, 0xFFD700, -30,18.6,30);             // gold roof band
  box(10,14,2, 0xc8e0ff, -30,7,39.1);                // glass front
  for(let i=-2;i<=2;i++) box(1.4,16,1.4, 0xf8f4ec, i*5-30,8,38.5); // marble columns
  for(let s=0;s<3;s++) box(28-s*2,0.5,2, 0xe0d8cc, -30,0.5+s*0.5,40.5+s); // front steps
  box(3,9,1.4, 0x886600, -30,4.5,39.2);              // gold door frame
  box(2.4,7,0.2, 0xaaddff, -30,4.5,39.3);            // door glass
  buildSign('🏦 CITY BANK', -30,21,39);
  const bankLight = new THREE.PointLight(0xffeeaa, 1.0, 24);
  bankLight.position.set(-30,8,38); scene.add(bankLight);
  addCol(CITY_COLS, -30,30, 13,10);

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

// ─── AVATAR CARD (draws badge onto any 96×128 canvas) ────────────────────────
function drawAvatarCard(cv) {
  const c=cv.getContext('2d');
  const cx=48;
  const skin=rgb(playerColors.skin), shirtC=rgb(playerColors.shirt), hairC=rgb(playerColors.hair);

  // Background card
  c.fillStyle='rgba(0,0,0,0.75)'; c.fillRect(0,0,96,128);
  c.strokeStyle='#e94560'; c.lineWidth=2; c.strokeRect(1,1,94,126);

  // Shirt & arms
  c.fillStyle=playerShirt==='suit'?'#222':shirtC;
  c.fillRect(cx-20,80,40,36); c.fillRect(cx-28,82,10,24); c.fillRect(cx+18,82,10,24);
  if(playerShirt==='striped'){c.fillStyle='rgba(255,255,255,0.25)';for(let i=0;i<3;i++)c.fillRect(cx-20,82+i*9,40,5);}
  if(playerShirt==='suit'){c.fillStyle=shirtC;c.beginPath();c.moveTo(cx-8,80);c.lineTo(cx,90);c.lineTo(cx-8,102);c.closePath();c.fill();c.beginPath();c.moveTo(cx+8,80);c.lineTo(cx,90);c.lineTo(cx+8,102);c.closePath();c.fill();c.fillStyle='#cc2222';c.fillRect(cx-2,82,4,20);}

  // Neck
  c.fillStyle=skin; c.fillRect(cx-5,68,10,14);

  // Long/afro/curly hair BEHIND head
  c.fillStyle=hairC;
  if(playerHair==='long'){c.fillRect(cx-22,34,8,46);c.fillRect(cx+14,34,8,46);}
  if(playerHair==='afro'){c.beginPath();c.ellipse(cx,40,24,24,0,0,Math.PI*2);c.fill();}
  if(playerHair==='curly'){for(let i=0;i<4;i++){c.beginPath();c.arc(cx-14+i*10,36,7,0,Math.PI*2);c.fill();}c.fillRect(cx-22,38,44,8);}
  if(playerHair==='ponytail'){c.fillRect(cx+16,38,7,36);}

  // Head
  c.fillStyle=skin; c.fillRect(cx-18,32,36,36);

  // Eyes
  c.fillStyle='#222'; c.fillRect(cx-10,42,7,7); c.fillRect(cx+3,42,7,7);
  c.fillStyle='#fff'; c.fillRect(cx-8,44,2,2); c.fillRect(cx+5,44,2,2);
  c.strokeStyle='#333'; c.lineWidth=1.5; c.beginPath(); c.arc(cx,54,5,0.2,Math.PI-0.2); c.stroke();

  // Hair on top
  c.fillStyle=hairC;
  if(playerHair==='short'){c.fillRect(cx-20,28,40,10);c.fillRect(cx-22,32,7,10);c.fillRect(cx+15,32,7,10);}
  if(playerHair==='spiky'){c.fillRect(cx-18,28,36,8);[-12,-6,0,6,12].forEach(sx=>{c.beginPath();c.moveTo(cx+sx-4,28);c.lineTo(cx+sx,13);c.lineTo(cx+sx+4,28);c.closePath();c.fill();});}
  if(playerHair==='ponytail'){c.fillRect(cx-20,28,40,10);}
  if(playerHair==='long'||playerHair==='curly'){c.fillRect(cx-20,28,40,10);}

  // Hat
  if(playerHat==='cap'){c.fillStyle='#dd3333';c.fillRect(cx-22,30,44,7);c.fillRect(cx-14,13,28,19);c.fillRect(cx+8,31,14,4);}
  else if(playerHat==='cowboy'){c.fillStyle='#8B4513';c.fillRect(cx-28,30,56,5);c.fillRect(cx-12,10,24,22);}
  else if(playerHat==='crown'){c.fillStyle='#FFD700';c.fillRect(cx-18,30,36,5);[[-14,6],[-7,0],[0,5],[7,0],[14,6]].forEach(([x2,y])=>c.fillRect(cx+x2-3,30-16+y,7,18-y));c.fillStyle='#e94560';c.fillRect(cx-3,14,6,6);}
  else if(playerHat==='helmet'){c.fillStyle='#555';c.fillRect(cx-22,15,44,20);c.fillRect(cx-20,11,40,8);c.fillStyle='rgba(100,200,255,0.4)';c.fillRect(cx-16,17,32,15);}
  else if(playerHat==='tophat'){c.fillStyle='#111';c.fillRect(cx-22,29,44,5);c.fillRect(cx-14,4,28,27);}
  else if(playerHat==='beanie'){c.fillStyle=shirtC;c.fillRect(cx-20,12,40,24);c.fillStyle='#fff';c.beginPath();c.arc(cx,12,7,0,Math.PI*2);c.fill();}
  else if(playerHat==='fedora'){c.fillStyle='#7a5c3a';c.fillRect(cx-26,29,52,5);c.fillRect(cx-14,9,28,22);c.fillStyle='#333';c.fillRect(cx-14,27,28,4);}
  else if(playerHat==='wizard'){c.fillStyle='#4444aa';c.beginPath();c.moveTo(cx,0);c.lineTo(cx-18,31);c.lineTo(cx+18,31);c.closePath();c.fill();c.fillRect(cx-26,29,52,6);}
  else if(playerHat==='pirate'){c.fillStyle='#111';c.fillRect(cx-24,29,48,6);c.fillRect(cx-16,8,32,23);c.fillStyle='#fff';c.beginPath();c.arc(cx,22,8,0,Math.PI*2);c.fill();c.fillStyle='#111';c.fillRect(cx-5,24,4,5);c.fillRect(cx+1,24,4,5);}
  else if(playerHat==='santa'){c.fillStyle='#dd2222';c.fillRect(cx-20,29,40,5);c.beginPath();c.moveTo(cx-16,29);c.lineTo(cx+7,3);c.lineTo(cx+18,29);c.closePath();c.fill();c.fillStyle='#fff';c.fillRect(cx-22,27,44,7);c.beginPath();c.arc(cx+9,4,5,0,Math.PI*2);c.fill();}

  // Name + gold bar at bottom
  c.fillStyle='rgba(233,69,96,0.8)'; c.fillRect(0,108,96,20);
  c.fillStyle='#fff'; c.font='bold 9px Arial'; c.textAlign='center';
  c.fillText(playerName.slice(0,12), cx, 122);
}

function makeAvatarCanvas() {
  const cv=document.createElement('canvas'); cv.width=96; cv.height=128;
  drawAvatarCard(cv); return cv;
}

// ─── PLAYER CHARACTER ─────────────────────────────────────────────────────────
function c3(h) { return parseInt(h.replace('#',''),16); }

function buildPlayer() {
  playerGroup = new THREE.Group();
  player = {};
  const skin=c3(playerColors.skin), shirt=c3(playerColors.shirt);
  const pants=c3(playerColors.pants), shoes=c3(playerColors.shoes), hairC=c3(playerColors.hair);

  const skinMeshes = [];
  const mk=(w,h,d,color,x,y,z)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
    m.position.set(x,y,z); m.castShadow=true; playerGroup.add(m);
    if(color===skin) skinMeshes.push(m); // tags every skin-colored part real-time body paint can recolor live
    return m;
  };

  // Head & eyes
  mk(1,1,1, skin, 0,2.8,0);
  const em=new THREE.MeshBasicMaterial({color:0x111111});
  [-0.22,0.22].forEach(ex=>{const e=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.14,0.05),em);e.position.set(ex,2.85,0.51);playerGroup.add(e);});

  // Hair
  if(playerHair==='short')    { mk(1.08,0.3,0.95,hairC,0,3.35,0); mk(0.25,0.5,0.9,hairC,-0.6,3.1,0); mk(0.25,0.5,0.9,hairC,0.6,3.1,0); }
  else if(playerHair==='long'){ mk(1.08,0.3,0.95,hairC,0,3.35,0); mk(0.28,1.4,0.9,hairC,-0.6,2.4,0); mk(0.28,1.4,0.9,hairC,0.6,2.4,0); mk(0.9,1.4,0.28,hairC,0,2.4,-0.5); }
  else if(playerHair==='spiky'){ mk(1.1,0.2,1.0,hairC,0,3.35,0); [-0.35,-0.17,0,0.17,0.35].forEach((sx,i)=>mk(0.18,0.5+i%2*0.2,0.18,hairC,sx,3.7+i%2*0.1,0)); }
  else if(playerHair==='afro') { mk(1.5,1.4,1.4,hairC,0,3.1,0); }
  else if(playerHair==='ponytail'){ mk(1.08,0.3,0.95,hairC,0,3.35,0); mk(0.25,0.5,0.9,hairC,-0.6,3.1,0); mk(0.28,1.8,0.28,hairC,0,2.2,-0.5); }
  else if(playerHair==='curly'){ [-0.3,0,0.3].forEach(cx2=>mk(0.5,0.55,0.5,hairC,cx2,3.4,0)); mk(0.28,1.2,0.28,hairC,-0.6,2.7,0); mk(0.28,1.2,0.28,hairC,0.6,2.7,0); }

  // Hat
  if(playerHat==='cap')     { mk(1.2,0.15,1.2,0xee4444,0,3.35,0); mk(0.9,0.5,0.8,0xee4444,0,3.63,-0.05); mk(0.5,0.12,0.4,0xee4444,0,3.28,0.7); }
  else if(playerHat==='cowboy'){ mk(1.7,0.12,1.7,0x8B4513,0,3.32,0); mk(0.9,0.7,0.9,0x8B4513,0,3.72,0); }
  else if(playerHat==='crown'){ mk(1.1,0.28,1.1,0xFFD700,0,3.35,0); [-0.35,0,0.35].forEach((cx2,i)=>mk(0.22,0.4+i%2*0.15,0.22,0xFFD700,cx2,3.7,0)); }
  else if(playerHat==='helmet'){ mk(1.15,0.85,1.15,0x555555,0,3.48,0); mk(0.7,0.3,0.15,0x88ccff,0,3.22,0.56); }
  else if(playerHat==='tophat'){ mk(1.35,0.1,1.35,0x111111,0,3.32,0); mk(0.9,0.9,0.9,0x111111,0,3.8,0); mk(0.92,0.08,0.92,0x333333,0,3.38,0); }
  else if(playerHat==='beanie'){ mk(1.05,0.7,1.05,shirt,0,3.5,0); mk(0.35,0.35,0.35,0xffffff,0,3.92,0); }
  else if(playerHat==='fedora'){ mk(1.5,0.1,1.5,0x7a5c3a,0,3.32,0); mk(0.9,0.65,0.9,0x7a5c3a,0,3.65,0); mk(0.91,0.08,0.91,0x333333,0,3.37,0); }
  else if(playerHat==='wizard'){ const w=new THREE.Mesh(new THREE.ConeGeometry(0.6,1.8,8),new THREE.MeshLambertMaterial({color:0x4444aa}));w.position.set(0,3.9,0);playerGroup.add(w); mk(1.3,0.12,1.3,0x4444aa,0,3.32,0); }
  else if(playerHat==='pirate'){ mk(1.4,0.1,1.4,0x111111,0,3.32,0); mk(0.9,0.6,0.5,0x111111,0,3.66,0); mk(0.3,0.3,0.15,0xffffff,0,3.7,0.3); }
  else if(playerHat==='santa') { mk(1.1,0.2,1.1,0xffffff,0,3.32,0); const cn=new THREE.Mesh(new THREE.ConeGeometry(0.5,1.0,8),new THREE.MeshLambertMaterial({color:0xdd2222}));cn.position.set(0.1,3.88,0);playerGroup.add(cn); mk(0.25,0.25,0.25,0xffffff,0.45,4.32,0); }

  // Body & arms
  const bCol = playerShirt==='suit' ? 0x222222 : shirt;
  const aCol = playerShirt==='tanktop' ? skin : bCol;
  mk(0.9,1.1,0.5, bCol, 0,1.75,0);
  player.lArm = mk(0.35,0.9,0.35, aCol,-0.65,1.75,0);
  player.rArm = mk(0.35,0.9,0.35, aCol, 0.65,1.75,0);
  mk(0.37,0.28,0.37, skin,-0.65,1.22,0); mk(0.37,0.28,0.37, skin,0.65,1.22,0);

  // Legs
  const legH = playerPants==='shorts' ? 0.5 : 0.9;
  const legY = playerPants==='shorts' ? 0.9 : 0.75;
  player.lLeg = mk(0.38,legH,0.38, pants,-0.22,legY,0);
  player.rLeg = mk(0.38,legH,0.38, pants, 0.22,legY,0);
  if(playerPants==='shorts'){mk(0.38,0.45,0.38,skin,-0.22,0.32,0);mk(0.38,0.45,0.38,skin,0.22,0.32,0);}
  if(playerPants==='cargo'){mk(0.15,0.25,0.4,0x333333,-0.38,0.9,0.1);mk(0.15,0.25,0.4,0x333333,0.38,0.9,0.1);}

  // Shoes
  const shoeC=c3(playerColors.shoes);
  const shH=playerShoes==='boots'?0.45:0.22, shY=playerShoes==='boots'?0.18:0.1;
  mk(0.42,shH,playerShoes==='sandals'?0.6:0.52, shoeC,-0.22,shY,0.05);
  mk(0.42,shH,playerShoes==='sandals'?0.6:0.52, shoeC, 0.22,shY,0.05);
  if(playerShoes==='hightop'){mk(0.43,0.3,0.53,shoeC,-0.22,0.32,0.04);mk(0.43,0.3,0.53,shoeC,0.22,0.32,0.04);}

  player.skinMeshes = skinMeshes;

  // Weapon
  player.weaponGroup = null;
  updateWeaponMesh();

  // Armor
  player.armorMesh = null;
  updateArmorMesh();

  // Avatar picture nametag
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(makeAvatarCanvas()),transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  tag.position.y=4.8; playerGroup.add(tag); player.nametag=tag;

  playerGroup.position.set(0,0,15);
  scene.add(playerGroup);
}

// ─── NPCS ────────────────────────────────────────────────────────────────────
const NPC_DEFS=[
  {name:'Sam',  role:'Shopkeeper',skin:0xf5c89a,shirt:0x2255aa,pants:0x333344,pos:[44,0,52],patrol:[[44,52],[52,52],[52,44],[44,44]],hair:'short',hairColor:0x2a1505},
  {name:'Mia',  role:'Shopkeeper',skin:0xd4956a,shirt:0x1166bb,pants:0x222233,pos:[58,0,52],patrol:[[58,52],[66,52],[66,44],[58,44]],hair:'long',hairColor:0x1a1a1a},
  {name:'Leo',  role:'Shopkeeper',skin:0xe8c080,shirt:0x0044cc,pants:0x111122,pos:[72,0,52],patrol:[[72,52],[80,52],[80,44],[72,44]],hair:'spiky',hairColor:0x3a2410},
  {name:'Tony', role:'Waiter',    skin:0xf5c89a,shirt:0xeeeeee,pants:0x111111,pos:[104,0,-30],hair:'short',hairColor:0x0a0a0a,seated:true},
  {name:'Rosa', role:'Waiter',    skin:0xc97a50,shirt:0xffffff,pants:0x111111,pos:[110,0,-30],hair:'ponytail',hairColor:0x4a2a10,seated:true},
  {name:'Kai',  role:'Waiter',    skin:0xd4a070,shirt:0xdddddd,pants:0x222222,pos:[116,0,-30],hair:'curly',hairColor:0x1a1008,seated:true},
  {name:'Cruz', role:'Officer',   skin:0xf0c8a0,shirt:0x223366,pants:0x1a2a55,pos:[-66,0,14],patrol:[[-66,14],[-58,14],[-58,6],[-66,6]],hat:'police'},
  {name:'Park', role:'Officer',   skin:0xd4956a,shirt:0x1a2a55,pants:0x111833,pos:[-74,0,8], patrol:[[-74,8],[-66,8],[-66,0],[-74,0]],hat:'police'},
  {name:'Blake',role:'Officer',   skin:0xe8c080,shirt:0x223366,pants:0x1a2a55,pos:[-62,0,18],patrol:[[-62,18],[-54,18],[-54,10],[-62,10]],hat:'police'},
  // City citizens
  {name:'Lily',  role:'Citizen', skin:0xf5d5b5,shirt:0xff88aa,pants:0x334499,pos:[5,0,25],    patrol:[[5,25],[15,25],[15,15],[5,15]],hair:'long',hairColor:0xffcc66},
  {name:'Marco', role:'Citizen', skin:0xd4956a,shirt:0x22aa55,pants:0x222222,pos:[25,0,8],    patrol:[[25,8],[35,8],[35,18],[25,18]],hair:'short',hairColor:0x0a0a0a},
  {name:'Zoe',   role:'Jogger',  skin:0xf5c89a,shirt:0xff4444,pants:0x111133,pos:[-10,0,20],  patrol:[[-10,20],[-20,20],[-20,35],[-10,35]],hair:'ponytail',hairColor:0xaa3311},
  {name:'Amir',  role:'Citizen', skin:0x8B5E3C,shirt:0x4488cc,pants:0x223355,pos:[0,0,-20],   patrol:[[0,-20],[12,-20],[12,-30],[0,-30]],hair:'curly',hairColor:0x1a1008,hat:'cap'},
  {name:'Emma',  role:'Citizen', skin:0xf8d8b8,shirt:0xddaa22,pants:0x446622,pos:[-20,0,30],  patrol:[[-20,30],[-30,30],[-30,20],[-20,20]],hair:'afro',hairColor:0x2a1a10},
  {name:'Josh',  role:'Citizen', skin:0xe0b080,shirt:0x224488,pants:0x333333,pos:[40,0,15],   patrol:[[40,15],[50,15],[50,5],[40,5]],hair:'short',hairColor:0x3a2410,hat:'beanie'},
  {name:'Nina',  role:'Tourist', skin:0xf5e5d5,shirt:0xee6622,pants:0x224477,pos:[-5,0,-10],  patrol:[[-5,-10],[5,-10],[5,-20],[-5,-20]],hair:'long',hairColor:0x552211,hat:'fedora'},
  {name:'Omar',  role:'Citizen', skin:0x7a4a2a,shirt:0x334422,pants:0x221100,pos:[15,0,-5],   patrol:[[15,-5],[25,-5],[25,5],[15,5]],hair:'spiky',hairColor:0x1a1108},
  {name:'Priya', role:'Citizen', skin:0xb87040,shirt:0xcc44aa,pants:0x1a1a2a,pos:[-30,0,10],  patrol:[[-30,10],[-40,10],[-40,20],[-30,20]],hair:'long',hairColor:0x0a0a0a},
  {name:'Tyler', role:'Jogger',  skin:0xf0c8a0,shirt:0x44ccee,pants:0x334455,pos:[30,0,-20],  patrol:[[30,-20],[20,-20],[20,-30],[30,-30]],hair:'short',hairColor:0x2a1a0a},
  {name:'Jade',  role:'Citizen', skin:0xd49060,shirt:0x88ccaa,pants:0x333322,pos:[-20,0,-5],  patrol:[[-20,-5],[-30,-5],[-30,5],[-20,5]],hair:'curly',hairColor:0x3a2010},
  {name:'Carlos',role:'Vendor',  skin:0xc07840,shirt:0xffcc00,pants:0x222222,pos:[10,0,40],   patrol:[[10,40],[20,40],[20,45],[10,45]],hair:'short',hairColor:0x1a1108,hat:'cap'},
  {name:'Mei',   role:'Citizen', skin:0xf0d0a8,shirt:0xff5588,pants:0x3366aa,pos:[-15,0,20],  patrol:[[-15,20],[-25,20],[-25,30],[-15,30]],hair:'long',hairColor:0x0a0a0a},
  {name:'Alex',  role:'Tourist', skin:0xe8c090,shirt:0x3388dd,pants:0x445544,pos:[5,0,-30],   patrol:[[5,-30],[15,-30],[15,-40],[5,-40]],hair:'spiky',hairColor:0x442200,hat:'cowboy'},
  {name:'Sasha', role:'Citizen', skin:0xf4d0b0,shirt:0xcc8844,pants:0x224422,pos:[-40,0,25],  patrol:[[-40,25],[-50,25],[-50,35],[-40,35]],hair:'ponytail',hairColor:0x220a05},
];
function makeNPC(def){
  const g=new THREE.Group();
  const mk=(w,h,d,color,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;};
  // hdy shifts every head/hair/hat/tag position down for seated NPCs (their head sits lower — see legs below)
  const hdy = def.seated ? -0.6 : 0;
  mk(0.9,0.9,0.9,def.skin,0,2.75+hdy,0); mk(0.8,1.0,0.45,def.shirt,0,1.75+hdy,0);
  mk(0.32,0.85,0.32,def.shirt,-0.6,1.75+hdy,0); mk(0.32,0.85,0.32,def.shirt,0.6,1.75+hdy,0);
  if(def.seated){
    // Seated pose: legs rotate to point forward (bent at the hip) at chair-seat height instead of hanging straight down
    const lLeg=mk(0.35,0.85,0.35,def.pants,-0.22,0.55,0.35); lLeg.rotation.x=-Math.PI/2;
    const rLeg=mk(0.35,0.85,0.35,def.pants, 0.22,0.55,0.35); rLeg.rotation.x=-Math.PI/2;
    mk(0.38,0.22,0.46,0x333333,-0.22,0.55,0.75); mk(0.38,0.22,0.46,0x333333,0.22,0.55,0.75);
  }else{
    mk(0.35,0.85,0.35,def.pants,-0.22,0.75,0); mk(0.35,0.85,0.35,def.pants,0.22,0.75,0);
    mk(0.38,0.22,0.46,0x333333,-0.22,0.15,0.05); mk(0.38,0.22,0.46,0x333333,0.22,0.15,0.05);
  }
  // Hair — the exact same box shapes buildPlayer() uses for the player, so NPCs match the player's art style
  const hc=def.hairColor;
  if(def.hair==='short')    { mk(1.08,0.3,0.95,hc,0,3.35+hdy,0); mk(0.25,0.5,0.9,hc,-0.6,3.1+hdy,0); mk(0.25,0.5,0.9,hc,0.6,3.1+hdy,0); }
  else if(def.hair==='long'){ mk(1.08,0.3,0.95,hc,0,3.35+hdy,0); mk(0.28,1.4,0.9,hc,-0.6,2.4+hdy,0); mk(0.28,1.4,0.9,hc,0.6,2.4+hdy,0); mk(0.9,1.4,0.28,hc,0,2.4+hdy,-0.5); }
  else if(def.hair==='spiky'){ mk(1.1,0.2,1.0,hc,0,3.35+hdy,0); [-0.35,-0.17,0,0.17,0.35].forEach((sx,i)=>mk(0.18,0.5+i%2*0.2,0.18,hc,sx,3.7+i%2*0.1+hdy,0)); }
  else if(def.hair==='afro') { mk(1.5,1.4,1.4,hc,0,3.1+hdy,0); }
  else if(def.hair==='ponytail'){ mk(1.08,0.3,0.95,hc,0,3.35+hdy,0); mk(0.25,0.5,0.9,hc,-0.6,3.1+hdy,0); mk(0.28,1.8,0.28,hc,0,2.2+hdy,-0.5); }
  else if(def.hair==='curly'){ [-0.3,0,0.3].forEach(cx2=>mk(0.5,0.55,0.5,hc,cx2,3.4+hdy,0)); mk(0.28,1.2,0.28,hc,-0.6,2.7+hdy,0); mk(0.28,1.2,0.28,hc,0.6,2.7+hdy,0); }
  // Hat — same shapes as the player's hat catalog
  if(def.hat==='police'){mk(1.0,0.15,1.0,0x1a2a55,0,3.25+hdy,0);mk(0.85,0.3,0.85,0x223366,0,3.45+hdy,0);mk(0.3,0.06,0.3,0xFFD700,0,3.32+hdy,0.42);}
  else if(def.hat==='cap')     { mk(1.2,0.15,1.2,0xee4444,0,3.35+hdy,0); mk(0.9,0.5,0.8,0xee4444,0,3.63+hdy,-0.05); mk(0.5,0.12,0.4,0xee4444,0,3.28+hdy,0.7); }
  else if(def.hat==='cowboy'){ mk(1.7,0.12,1.7,0x8B4513,0,3.32+hdy,0); mk(0.9,0.7,0.9,0x8B4513,0,3.72+hdy,0); }
  else if(def.hat==='crown'){ mk(1.1,0.28,1.1,0xFFD700,0,3.35+hdy,0); [-0.35,0,0.35].forEach((cx2,i)=>mk(0.22,0.4+i%2*0.15,0.22,0xFFD700,cx2,3.7+hdy,0)); }
  else if(def.hat==='helmet'){ mk(1.15,0.85,1.15,0x555555,0,3.48+hdy,0); mk(0.7,0.3,0.15,0x88ccff,0,3.22+hdy,0.56); }
  else if(def.hat==='tophat'){ mk(1.35,0.1,1.35,0x111111,0,3.32+hdy,0); mk(0.9,0.9,0.9,0x111111,0,3.8+hdy,0); mk(0.92,0.08,0.92,0x333333,0,3.38+hdy,0); }
  else if(def.hat==='beanie'){ mk(1.05,0.7,1.05,def.shirt,0,3.5+hdy,0); mk(0.35,0.35,0.35,0xffffff,0,3.92+hdy,0); }
  else if(def.hat==='fedora'){ mk(1.5,0.1,1.5,0x7a5c3a,0,3.32+hdy,0); mk(0.9,0.65,0.9,0x7a5c3a,0,3.65+hdy,0); mk(0.91,0.08,0.91,0x333333,0,3.37+hdy,0); }
  else if(def.hat==='wizard'){ const w=new THREE.Mesh(new THREE.ConeGeometry(0.6,1.8,8),new THREE.MeshLambertMaterial({color:0x4444aa}));w.position.set(0,3.9+hdy,0);g.add(w); mk(1.3,0.12,1.3,0x4444aa,0,3.32+hdy,0); }
  else if(def.hat==='pirate'){ mk(1.4,0.1,1.4,0x111111,0,3.32+hdy,0); mk(0.9,0.6,0.5,0x111111,0,3.66+hdy,0); mk(0.3,0.3,0.15,0xffffff,0,3.7+hdy,0.3); }
  else if(def.hat==='santa') { mk(1.1,0.2,1.1,0xffffff,0,3.32+hdy,0); const cn=new THREE.Mesh(new THREE.ConeGeometry(0.5,1.0,8),new THREE.MeshLambertMaterial({color:0xdd2222}));cn.position.set(0.1,3.88+hdy,0);g.add(cn); mk(0.25,0.25,0.25,0xffffff,0.45,4.32+hdy,0); }
  const tc2=document.createElement('canvas'); tc2.width=256; tc2.height=56;
  const c2=tc2.getContext('2d');
  c2.fillStyle='rgba(0,0,0,0.7)'; c2.fillRect(0,0,256,56);
  c2.fillStyle='#fff'; c2.font='bold 17px Arial'; c2.textAlign='center'; c2.fillText(def.name,128,24);
  c2.fillStyle='#ffdd55'; c2.font='12px Arial'; c2.fillText(def.role,128,44);
  if(def.emotion){ c2.font='22px Arial'; c2.textAlign='left'; c2.fillText(def.emotion,4,30); }
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(2.8,0.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(tc2),transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  tag.position.y=3.8+hdy; g.add(tag);
  g.position.set(def.pos[0],def.pos[1],def.pos[2]); scene.add(g);
  return {group:g,tag,patrol:def.patrol,patrolIdx:0,speed:1.8+Math.random()*0.8,waitTime:0,name:def.name,role:def.role,isDown:false,seated:def.seated||false,emotion:def.emotion||null};
}
// Changes an NPC's emotion badge at runtime (the tag texture is baked once at creation, so
// this rebuilds it — same drawing logic as makeNPC's tag, just callable after the fact).
function setNPCEmotion(npc, emoji) {
  npc.emotion = emoji;
  const cv = document.createElement('canvas'); cv.width=256; cv.height=56;
  const cx = cv.getContext('2d');
  cx.fillStyle='rgba(0,0,0,0.7)'; cx.fillRect(0,0,256,56);
  cx.fillStyle='#fff'; cx.font='bold 17px Arial'; cx.textAlign='center'; cx.fillText(npc.name,128,24);
  cx.fillStyle='#ffdd55'; cx.font='12px Arial'; cx.fillText(npc.role,128,44);
  if(emoji){ cx.font='22px Arial'; cx.textAlign='left'; cx.fillText(emoji,4,30); }
  if(npc.tag.material.map) npc.tag.material.map.dispose();
  npc.tag.material.map = new THREE.CanvasTexture(cv);
  npc.tag.material.needsUpdate = true;
}
function buildNPCs(){
  NPC_DEFS.forEach(d => {
    if(deadNPCs[d.name]) { buildGrave(d.name, deadNPCs[d.name].x, deadNPCs[d.name].z); return; } // permanently gone — leave their grave instead of respawning them
    npcs.push(makeNPC(d));
  });
}

// ─── SHOPPING DISTRICT — 100 real named shops, each with 10 items and a billboard ad ──────
// Content (name templates/words, 12 items, 3 ad slogans per category) came from 4 parallel
// agents covering 25 shop categories total — same "hand-authored seed + formula" trick as
// everything else in this file that needs volume (1000 store ingredients, 50 music tracks,
// 40 Suburbs houses): 25 categories x 4 name/item variations each = exactly 100 unique shops.
const SHOP_CATEGORIES = [
  {
    id: 'toy_store', category: 'Toy Store', emoji: '🧸',
    nameTemplates: ["{word}'s Toy Box", "The {word} Toy Shop", "{word} Toy Kingdom", "{word} Play Place", "{word} Fun Factory"],
    nameWords: ['Rainbow','Sparkle','Jolly','Max','Sunny','Giggles','Bounce','Whiz','Pixel','Cosmo','Ziggy','Wonder'],
    items: ['Building Blocks','Action Figures','Board Games','Jigsaw Puzzles','Stuffed Animals','Remote Control Cars','Dolls','Art Sets','Science Kits','Yo-Yos','Kites','Card Games'],
    ads: ['Where playtime never ends!','New toys, new adventures every day!','Fun for every kid, big or small!'],
  },
  {
    id: 'pet_shop', category: 'Pet Shop', emoji: '🐾',
    nameTemplates: ["{word}'s Pet Corner", "The {word} Pet Shop", "{word} Paws & Claws", "{word} Critter Corral", "{word} Pet Palace"],
    nameWords: ['Furry','Whiskers','Buddy','Chirpy','Waggles','Nibbles','Paws','Fluff','Scout','Marbles','Patches','Bubbles'],
    items: ['Puppy Leash','Cat Scratching Post','Goldfish Tank','Hamster Wheel','Bird Cage','Dog Chew Toy','Catnip Mice','Rabbit Hutch','Pet Food Bowl','Turtle Terrarium','Bunny Treats','Squeaky Bone'],
    ads: ['Happy pets, happy homes!','Everything your furry friend needs!','Come meet your new best friend!'],
  },
  {
    id: 'book_store', category: 'Book Store', emoji: '📚',
    nameTemplates: ["{word}'s Book Nook", "The {word} Bookshelf", "{word} Reading Room", "{word} Storybook Shop", "{word} Page Turner"],
    nameWords: ['Chapter','Inkwell','Willow','Sage','Quill','Marlow','Pepper','Story','Hazel','Finch','Bramble','Owl'],
    items: ['Comic Books','Picture Books','Adventure Novels','Mystery Stories','Fairy Tale Collection','Coloring Books','Joke Books','Encyclopedia Set','Poetry Books','Graphic Novels','Bookmarks','Magic Trick Guide'],
    ads: ['A new adventure on every page!','Get lost in a good story!','Reading made fun for everyone!'],
  },
  {
    id: 'candy_shop', category: 'Candy Shop', emoji: '🍬',
    nameTemplates: ["{word}'s Candy Corner", "The {word} Sweet Shop", "{word} Sugar Rush", "{word} Candy Kitchen", "{word} Treat Stop"],
    nameWords: ['Sugarplum','Lolli','Minty','Fizzy','Choco','Gummy','Sprinkle','Caramel','Peppermint','Bubblegum','Taffy','Frosty'],
    items: ['Gummy Bears','Lollipops','Chocolate Bars','Cotton Candy','Candy Canes','Jelly Beans','Caramel Apples','Bubble Gum','Sour Worms','Rock Candy','Marshmallow Pops','Fudge Squares'],
    ads: ['The sweetest shop in town!','A treat for every sweet tooth!','Smiles come in candy flavors!'],
  },
  {
    id: 'sports_store', category: 'Sports Store', emoji: '⚽',
    nameTemplates: ["{word}'s Sports Shop", "The {word} Sports Zone", "{word} Athletic Outfitters", "{word} Game Gear", "{word} Sports Depot"],
    nameWords: ['Champion','Blaze','Turbo','Ace','Rocket','Thunder','Victory','Comet','Storm','Rally','Dash','Slam'],
    items: ['Soccer Ball','Basketball','Baseball Glove','Tennis Racket','Skateboard','Bicycle Helmet','Swim Goggles','Jump Rope','Hockey Stick','Football','Running Shoes','Water Bottle'],
    ads: ['Gear up and get in the game!','Play hard, play smart!','Everything you need to score big!'],
  },
  {
    id: 'art_supplies_store', category: 'Art Supplies Store', emoji: '🎨',
    nameTemplates: ["{word}'s Art Studio", "The {word} Art Shop", "{word} Craft Corner", "{word} Palette Place", "{word} Creative Corner"],
    nameWords: ['Palette','Doodle','Canvas','Crayon','Sketch','Glitter','Prisma','Mosaic','Inkling','Brush','Clover','Violet'],
    items: ['Colored Pencils','Watercolor Paint Set','Sketchbook','Modeling Clay','Glitter Glue','Paintbrush Set','Crayons','Construction Paper','Safety Scissors','Stickers','Easel','Chalk Pastels'],
    ads: ['Bring your imagination to life!','Every masterpiece starts here!','Create something amazing today!'],
  },
  {
    id: 'music_store', category: 'Music Store', emoji: '🎵',
    nameTemplates: ["{word}'s Music Shop", "The {word} Music Room", "{word} Sound Studio", "{word} Melody Store", "{word} Rhythm Shop"],
    nameWords: ['Melody','Harmony','Rhythm','Tempo','Piccolo','Jazzy','Treble','Chord','Echo','Beats','Sonata','Breezy'],
    items: ['Ukulele','Recorder Flute','Toy Drum Set','Keyboard Piano','Kids Guitar','Tambourine','Xylophone','Maracas','Harmonica','Music Note Stickers','Songbook','Headphones'],
    ads: ['Find your sound here!','Music makes everything better!',"Let's make some noise!"],
  },
  {
    id: 'shoe_store', category: 'Shoe Store', emoji: '👟',
    nameTemplates: ["{word}'s Shoe Stop", "The {word} Sole", "{word} Footwear Co.", "{word} Step & Stride", "{word}'s Sneaker Spot"],
    nameWords: ['Rainbow','Sparkle','Jolly','Max','Sunny','Comet','Breeze','Ziggy','Turbo','Pepper','Cloud','Dash'],
    items: ['Light-Up Sneakers','Rain Boots','Velcro Sneakers','High-Top Basketball Shoes','Glitter Flip-Flops','Soccer Cleats','Fuzzy Slippers','Roller Sneakers','Hiking Boots','Ballet Flats','Superhero Sneakers','Sparkly Sandals'],
    ads: ['Step into style!','Happy feet, every day!','New kicks, new tricks!'],
  },
  {
    id: 'electronics_store', category: 'Electronics Store', emoji: '📱',
    nameTemplates: ['{word} Electronics', '{word} Tech Hub', 'The {word} Gadget Shop', '{word} Circuit City', "{word}'s Tech Spot"],
    nameWords: ['Byte','Pixel','Volt','Nova','Turbo','Spark','Circuit','Flash','Quantum','Robo','Wire','Zap'],
    items: ['Wireless Headphones','Tablet Case','Handheld Game Console','Bluetooth Speaker','Smartwatch','Phone Charger','Remote Control Car','Digital Camera','Gaming Mouse','LED Desk Lamp','Walkie-Talkies','Karaoke Microphone'],
    ads: ['Power up your world!','Gadgets that click!','Plug into fun!'],
  },
  {
    id: 'comic_book_shop', category: 'Comic Book Shop', emoji: '💥',
    nameTemplates: ['{word} Comics', 'The {word} Comic Vault', "{word}'s Hero HQ", '{word} Panel Shop', '{word} Comic Corner'],
    nameWords: ['Captain','Zoom','Blaze','Nova','Fable','Mystic','Bolt','Ace','Cosmo','Ripley','Vex','Orbit'],
    items: ['Superhero Comic Book','Graphic Novel','Trading Card Pack','Action Figure','Comic Poster','Villain Sticker Sheet','Cape Costume',"Collector's Comic Box",'Comic Bookmark','Hero Mask','Comic Backpack Pin','Mini Comic Figurine'],
    ads: ['Unleash your inner hero!','Adventure on every page!','Heroes start here!'],
  },
  {
    id: 'bakery', category: 'Bakery', emoji: '🧁',
    nameTemplates: ["{word}'s Bakery", 'The {word} Bake Shop', '{word} Sweet Treats', '{word} Bread & Buns', "{word}'s Sugar Shop"],
    nameWords: ['Sunny','Sprinkle','Honey','Buttercup','Maple','Cinnamon','Rosie','Pippin','Sugar','Clover','Marigold','Butterscotch'],
    items: ['Chocolate Chip Cookie','Rainbow Cupcake','Birthday Cake Slice','Cinnamon Roll','Blueberry Muffin','Glazed Donut','Sugar Cookie','Fresh Bagel','Fruit Tart','Soft Pretzel','Gingerbread Cookie','Strawberry Cake Pop'],
    ads: ['Freshly baked happiness!','Sweet treats, warm smiles!','Rise and shine with us!'],
  },
  {
    id: 'card_gift_shop', category: 'Card & Gift Shop', emoji: '🎁',
    nameTemplates: ["{word}'s Card & Gift", 'The {word} Gift Nook', '{word} Gifts Galore', "{word}'s Wrap & Ribbon", '{word} Greetings Shop'],
    nameWords: ['Bloom','Wishful','Twinkle','Cheer','Ribbon','Petal','Glimmer','Joyful','Willow','Buttons','Confetti','Merry'],
    items: ['Birthday Card','Gift Wrap Roll','Stuffed Teddy Bear','Scented Candle','Photo Frame','Balloon Bouquet','Gift Bag','Greeting Card Set','Mini Trophy','Keychain Charm','Party Confetti Poppers','Thank-You Notecards'],
    ads: ['The perfect gift, every time!','Wrap up something wonderful!','Say it with a gift!'],
  },
  {
    id: 'craft_store', category: 'Craft Store', emoji: '✂️',
    nameTemplates: ["{word}'s Craft Corner", 'The {word} Craft Shop', '{word} Arts & Crafts', "{word}'s Creative Studio", '{word} Craft Supply Co.'],
    nameWords: ['Paisley','Doodle','Glitterbug','Cricket','Marble','Inkwell','Button','Yarnley','Pixel','Scribble','Clay','Fern'],
    items: ['Watercolor Paint Set','Glitter Glue','Yarn Skein','Colored Pencils','Sticker Sheet Pack','Modeling Clay','Pom-Pom Bag','Craft Scissors','Beading Kit','Origami Paper Pack','Pipe Cleaners Bundle','Popsicle Sticks Box'],
    ads: ['Create something amazing!','Craft your imagination!','Where creativity comes alive!'],
  },
  {
    id: 'skate_shop', category: 'Skate Shop', emoji: '🛹',
    nameTemplates: ["{word}'s Skate Spot", 'The {word} Grind', '{word} Wheels', '{word} Skatepark Shop', "{word}'s Board Shack"],
    nameWords: ['Rainbow','Turbo','Blaze','Comet','Rocket','Sunny','Max','Ziggy','Nova','Ollie','Ramp','Grip'],
    items: ['Skateboard Deck','Skateboard Wheels','Skateboard Trucks','Helmet','Knee Pads','Elbow Pads','Wrist Guards','Grip Tape','Longboard','Scooter','Skate Shoes','Bearings Set'],
    ads: ['Ride into fun!','Wheels up, worries down!','Grind, glide, and smile!'],
  },
  {
    id: 'party_supplies_store', category: 'Party Supplies Store', emoji: '🎉',
    nameTemplates: ['{word} Party Palace', 'The {word} Bash Shop', "{word}'s Celebration Station", '{word} Confetti Corner', "{word}'s Party Place"],
    nameWords: ['Sparkle','Confetti','Balloon','Jolly','Giggle','Festive','Zippy','Rainbow','Bash','Cheer','Bloom','Party'],
    items: ['Balloon Bundle','Confetti Poppers','Birthday Banner','Paper Plates','Party Hats','Streamers','Piñata','Gift Bags','Candles Pack','Noisemakers','Table Cloth','Party Favors'],
    ads: ["Every day's a celebration!",'Pop, party, and play!','Make your party pop!'],
  },
  {
    id: 'hobby_shop', category: 'Hobby Shop', emoji: '🧩',
    nameTemplates: ["{word}'s Hobby Hut", 'The {word} Workshop', '{word} Craft Corner', "{word}'s Tinker Shop", '{word} Hobby Nook'],
    nameWords: ['Puzzle','Tinker','Craft','Marvel','Wonder','Gizmo','Nifty','Spark','Model','Whiz','Doodle','Buzzy'],
    items: ['Model Airplane Kit','1000-Piece Puzzle','Paint Set','Remote Control Car','Building Blocks Set','Yarn Bundle','Stamp Collection Kit','Train Set','Origami Paper Pack','Rock Tumbler','Bead Kit','Telescope'],
    ads: ['Find your next fun project!','Craft something amazing today!','Hobbies made happy!'],
  },
  {
    id: 'fashion_boutique', category: 'Fashion Boutique', emoji: '👗',
    nameTemplates: ["{word}'s Boutique", 'The {word} Closet', '{word} Style Studio', "{word}'s Fashion Corner", '{word} Threads'],
    nameWords: ['Glimmer','Velvet','Posh','Trendy','Chic','Blossom','Dazzle','Willow','Rosy','Glam','Star','Mimi'],
    items: ['Sundress','Graphic T-Shirt','Denim Jacket','Sneakers','Sun Hat','Sparkly Backpack','Scarf','Leggings','Hair Clips','Sunglasses','Friendship Bracelet Kit','Cozy Hoodie'],
    ads: ['Wear your style with pride!','Fresh looks, every day!','Dress up, shine bright!'],
  },
  {
    id: 'video_game_store', category: 'Video Game Store', emoji: '🎮',
    nameTemplates: ['{word} Game Zone', 'The {word} Arcade', "{word}'s Game Vault", '{word} Pixel Shop', "{word}'s Quest Corner"],
    nameWords: ['Pixel','Retro','Turbo','Byte','Quest','Arcade','Nova','Comet','Joystick','Level','Zap','Circuit'],
    items: ['Video Game Console','Controller','Game Cartridge','Gaming Headset','Charging Dock','Trading Card Game','Handheld Console','Game Poster','Joystick','Memory Card','Gaming Chair','Strategy Guide Book'],
    ads: ['Level up your fun!','Press start on adventure!','Game on, always!'],
  },
  {
    id: 'plant_shop', category: 'Plant Shop', emoji: '🌱',
    nameTemplates: ["{word}'s Plant Nook", 'The {word} Garden Shop', '{word} Bloom & Grow', "{word}'s Green Corner", '{word} Sprout Studio'],
    nameWords: ['Bloom','Sprout','Leafy','Petal','Fern','Sunny','Moss','Berry','Daisy','Willow','Meadow','Clover'],
    items: ['Sunflower Seeds Pack','Potted Cactus','Watering Can','Flower Pot','Succulent Trio','Herb Garden Kit','Bonsai Tree','Fertilizer Bag','Garden Gloves','Hanging Fern','Tulip Bulbs','Terrarium Kit'],
    ads: ['Grow something wonderful!','Plant a little joy!','Fresh green, fresh fun!'],
  },
  {
    id: 'jewelry_store', category: 'Jewelry Store', emoji: '💍',
    nameTemplates: ["{word}'s Gems", 'The {word} Jewel Box', '{word} Sparkle Shop', '{word} & Co. Jewelers', "{word}'s Treasure Case"],
    nameWords: ['Rainbow','Sparkle','Sunny','Luna','Coral','Jolly','Max','Ruby','Star','Pearl','Glimmer','Nova'],
    items: ['Friendship Bracelet','Charm Necklace','Star Stud Earrings','Birthstone Ring','Heart Locket','Beaded Anklet','Glitter Hair Pin','Rainbow Pendant','Pearl Hairband','Mood Ring','Puzzle Piece Necklace','Gem Cufflinks'],
    ads: ['Shine bright every day!','Sparkle you can wear!','Treasures for every smile!'],
  },
  {
    id: 'furniture_store', category: 'Furniture Store', emoji: '🛋️',
    nameTemplates: ['{word} Home Furnishings', 'The {word} Furniture Barn', "{word}'s Comfy Corner", '{word} & Sons Furniture', '{word} Living Co.'],
    nameWords: ['Cozy','Oakwood','Maple','Comfy','Nestle','Willow','Grand','Homestead','Cedar','Plush','Snug','Timber'],
    items: ['Bunk Bed','Bean Bag Chair','Study Desk','Bookshelf','Rocking Chair','Toy Chest','Coffee Table','Dresser','Nightstand','Floor Lamp','Storage Ottoman','Comfy Sofa'],
    ads: ['Furniture that feels like home!','Cozy up your space today!','Comfort built to last!'],
  },
  {
    id: 'phone_accessories_store', category: 'Phone Accessories Store', emoji: '📲',
    nameTemplates: ['{word} Phone Gear', 'The {word} Case Shop', '{word} Tech Accessories', "{word}'s Gadget Stop", '{word} Mobile Zone'],
    nameWords: ['Pixel','Byte','Circuit','Flash','Zoom','Spark','Volt','Techy','Signal','Glow','Turbo','Pixelbot'],
    items: ['Glitter Phone Case','Pop-Up Grip Stand','Cartoon Charm Strap','Screen Protector','Wireless Earbuds','Selfie Stick','Phone Ring Holder','Cute Cable Cover','Portable Charger','Sticker Pack','Camera Lens Clip','Glow-in-Dark Case'],
    ads: ['Gear up your gadget!','Protect it, style it, love it!','Accessories that pop!'],
  },
  {
    id: 'stationery_shop', category: 'Stationery Shop', emoji: '✏️',
    nameTemplates: ['{word} Paper & Pens', 'The {word} Stationery Nook', "{word}'s Scribble Shop", '{word} Notebook Co.', '{word} Desk Supplies'],
    nameWords: ['Doodle','Inkwell','Scribble','Paperclip','Crayon','Sketch','Quill','Notely','Glitterpen','Squiggle','Papertown','Bright'],
    items: ['Sparkle Notebook','Gel Pen Set','Scented Eraser','Sticker Sheet','Washi Tape Roll','Colored Pencil Pack','Glitter Glue','Bookmark Set','Desk Organizer','Stamp Kit','Mini Stapler','Rainbow Highlighters'],
    ads: ['Write your story in style!','Doodle dreams start here!','Colorful supplies for creative minds!'],
  },
  {
    id: 'aquarium_fish_store', category: 'Aquarium & Fish Store', emoji: '🐠',
    nameTemplates: ["{word}'s Fish Tank", 'The {word} Aquarium', '{word} Reef & Ripple', "{word}'s Bubble Shop", '{word} Underwater World'],
    nameWords: ['Bubbles','Coral','Splash','Finn','Marina','Wavy','Pearl','Ripple','Aqua','Shelly','Tide','Nemo'],
    items: ['Goldfish','Betta Fish','Glass Fish Tank','Colorful Gravel','Bubble Aerator','Fish Food Flakes','Mini Castle Decoration','Aquarium Plant','Snail Buddy','Net Scooper','LED Tank Light','Fish Bowl Starter Kit'],
    ads: ['Dive into fish-keeping fun!','Bring the ocean home!','Happy fish, happy home!'],
  },
  {
    id: 'bike_shop', category: 'Bike Shop', emoji: '🚲',
    nameTemplates: ['{word} Bike Works', 'The {word} Pedal Shop', "{word}'s Cycle Stop", '{word} Wheels Co.', '{word} Bike Garage'],
    nameWords: ['Speedy','Turbo','Wheelie','Rusty','Pedalpower','Blaze','Rocket','Gearhead','Cruiser','Dash','Zippy','Trailblazer'],
    items: ['Kids Mountain Bike','Training Wheels','Bike Helmet','Handlebar Streamers','Bike Bell','Water Bottle Holder','Kickstand','Bike Basket','Reflective Stickers','Repair Kit','Knee Pad Set','Bike Lock'],
    ads: ['Pedal into adventure!','Ride happy, ride safe!','Wheels that make you smile!'],
  },
];
// Real S.I.P. price band per category (low-cost item .. flagship item), picked to feel plausible
// against what's already priced elsewhere in the game (Ice Cream 8, Jewelry 30, Phone 45, cars
// 2000+). Every category's 12 items get a distinct price via priceForItem() below — items earlier
// in cat.items skew toward the low end, later ones toward the high end.
const CATEGORY_PRICE_RANGE = {
  toy_store:[10,40], pet_shop:[8,45], book_store:[5,25], candy_shop:[2,10], sports_store:[12,60],
  art_supplies_store:[5,30], music_store:[10,70], shoe_store:[15,55], electronics_store:[25,90],
  comic_book_shop:[4,30], bakery:[3,12], card_gift_shop:[5,35], craft_store:[4,28], skate_shop:[20,90],
  party_supplies_store:[4,25], hobby_shop:[10,60], fashion_boutique:[10,45], video_game_store:[15,80],
  plant_shop:[5,30], jewelry_store:[15,60], furniture_store:[40,150], phone_accessories_store:[6,35],
  stationery_shop:[3,18], aquarium_fish_store:[8,50], bike_shop:[30,120],
};
function priceForItem(cat, itemName) {
  const idx = cat.items.indexOf(itemName);
  const [lo, hi] = CATEGORY_PRICE_RANGE[cat.id];
  return Math.round(lo + (hi - lo) * idx / (cat.items.length - 1));
}
// 25 categories x 4 variations each = 100 shops. Shop k in a category picks nameTemplates[k],
// nameWords[k] (so all 4 names in a category are distinct), and a ROTATED 10-of-12 window of
// that category's items (items[k..k+9] wrapping) so the 4 shops of one category don't all sell
// an identical list — same rotation trick, different items each time.
function generateCityShops() {
  const shops = [];
  SHOP_CATEGORIES.forEach(cat => {
    for (let k = 0; k < 4; k++) {
      const name = cat.nameTemplates[k % cat.nameTemplates.length].replace('{word}', cat.nameWords[k]);
      const items = [];
      for (let i = 0; i < 10; i++) {
        const itemName = cat.items[(k + i) % cat.items.length];
        items.push({ name: itemName, price: priceForItem(cat, itemName) });
      }
      shops.push({
        id: cat.id + '_' + k,
        name, category: cat.category, emoji: cat.emoji,
        items, ad: cat.ads[k % cat.ads.length],
      });
    }
  });
  return shops;
}
let CITY_SHOPS = []; // filled by buildCityShops() — 100 shop data objects, looked up by id from openCityShopModal()
// Places the 100 generated shops in a 10x10 grid "Shopping District" at (0,500) — well clear of
// downtown (z up to ~110), the Suburbs (x 230-470/z 90-270), the airport, and every country town
// (all at |x| or |z| >= 600). Each shop gets a real little storefront (body/roof/glass/name sign)
// PLUS a genuine roadside billboard (posts + a board with its ad slogan) — not just a name plate.
function buildCityShops() {
  CITY_SHOPS = generateCityShops();
  const CENTER_X = 0, CENTER_Z = 500, COL_SPACING = 35, ROW_SPACING = 35, COLS = 10, ROWS = 10;
  // Each shop gets a real 2-color theme (body + a deeper accent of the same hue for the roof
  // trim and logo ring), not just one flat color repeated everywhere on the storefront.
  const THEMES = [
    { wall:0xE8927C, accent:0xB85A3C }, { wall:0x8CC0DE, accent:0x3D7A9E },
    { wall:0xF2D479, accent:0xC49A2E }, { wall:0x9BCB8C, accent:0x4F8A3D },
    { wall:0xC9A0DC, accent:0x7B4A9E }, { wall:0xF4A6C6, accent:0xC4487A },
    { wall:0x7FB8B0, accent:0x3D7A72 }, { wall:0xE0B888, accent:0xA67C4A },
  ];
  CITY_SHOPS.forEach((shop, i) => {
    const col = i % COLS, row = Math.floor(i / COLS);
    const x = CENTER_X + (col - (COLS - 1) / 2) * COL_SPACING;
    const z = CENTER_Z + (row - (ROWS - 1) / 2) * ROW_SPACING;
    const theme = THEMES[i % THEMES.length];

    box(9, 5, 8, theme.wall, x, 2.5, z);                 // body
    box(10.5, 0.6, 9.5, theme.accent, x, 5.3, z);        // roof cap
    box(6, 3, 0.2, 0xAEE3FF, x, 2, z - 4.05);            // glass front
    buildLogoSign(shop.name, shop.emoji, '#'+theme.wall.toString(16).padStart(6,'0'), '#'+theme.accent.toString(16).padStart(6,'0'), x, 5.9, z - 4.3);

    // Billboard: 2 posts + a board facing the street, showing the ad slogan
    const bbX = x, bbZ = z + 5.5;
    box(0.25, 3.5, 0.25, 0x5a5a5a, bbX - 2, 1.75, bbZ);
    box(0.25, 3.5, 0.25, 0x5a5a5a, bbX + 2, 1.75, bbZ);
    box(4.6, 2.2, 0.15, 0x222222, bbX, 3.6, bbZ);
    const cv = document.createElement('canvas'); cv.width = 300; cv.height = 140;
    const cx = cv.getContext('2d');
    cx.fillStyle = '#fffbe0'; cx.fillRect(4, 4, 292, 132);
    cx.strokeStyle = '#222'; cx.lineWidth = 5; cx.strokeRect(4, 4, 292, 132);
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.font = '40px Arial'; cx.fillText(shop.emoji, 150, 40);
    cx.fillStyle = '#222'; cx.font = 'bold 17px Arial';
    wrapText(cx, shop.ad, 150, 85, 260, 22);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.05), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
    board.position.set(bbX, 3.6, bbZ - 0.08);
    scene.add(board);

    addCol(CITY_COLS, x, z, 4.5, 4);
    CITY_ZONES.push({ x, z: z - 4.5, r: 4, label: `${shop.emoji} ${shop.name}`, action: () => openCityShopModal(shop.id) });
  });
}
// Same 25 categories, the OTHER 8 name variations each (k=4..11 — nameWords/nameTemplates only
// have 12 entries, and k=0..3 were already used by the 100 outdoor CITY_SHOPS), so every id here
// is guaranteed distinct from an outdoor shop. 25 x 8 = 200 more real shops, placed indoors.
function generateMallShops() {
  const shops = [];
  SHOP_CATEGORIES.forEach(cat => {
    for (let k = 4; k < 12; k++) {
      const name = cat.nameTemplates[k % cat.nameTemplates.length].replace('{word}', cat.nameWords[k]);
      const items = [];
      for (let i = 0; i < 10; i++) {
        const itemName = cat.items[(k + i) % cat.items.length];
        items.push({ name: itemName, price: priceForItem(cat, itemName) });
      }
      shops.push({
        id: cat.id + '_' + k,
        name, category: cat.category, emoji: cat.emoji,
        items, ad: cat.ads[k % cat.ads.length],
      });
    }
  });
  return shops;
}
let MALL_SHOPS = []; // filled by buildMallShopWing() — 200 shop data objects, looked up by id from openCityShopModal() same as CITY_SHOPS
// Builds a "Shopping Wing" attached to the mall's back doorway (mz-27), extending further south
// (more negative z) into open space. Every pocket interior now lives in its own 10,000-unit-wide
// lane (House 10000, Mall 20000, Hotel 30000, Store 40000, Friend House 50000, Prison 60000) with
// nothing else nearby at all, so there's no neighbor-clearance math to worry about here anymore —
// unlike the old 600-1200 cluster, extending this wing can't run into anything.
// 20 cols x 10 rows = 200 storefronts, one per MALL_SHOPS entry, laid out the same way buildCityShops
// already proved works — just relocated indoors and without the roadside billboard (redundant once
// there's a real Mall Directory kiosk, and it keeps the texture/mesh count down for 200 of these).
function buildMallShopWing() {
  MALL_SHOPS = generateMallShops();
  const mx = MALL_SPAWN.x, mz = 0;
  const WING_HALF_W = 125, WING_Z0 = mz - 27, WING_FAR = mz - 227;
  const wingDepth = WING_Z0 - WING_FAR, wingCenterZ = (WING_Z0 + WING_FAR) / 2;

  // Floor, ceiling, side walls, far wall — continues the atrium's marble/white look
  box(WING_HALF_W * 2, 0.1, wingDepth, 0xf5f5f0, mx, 0, wingCenterZ);
  box(WING_HALF_W * 2, 0.4, wingDepth, 0xeeeeee, mx, 11, wingCenterZ);
  box(0.5, 11, wingDepth, 0xe8e8e8, mx - WING_HALF_W, 5.5, wingCenterZ);
  box(0.5, 11, wingDepth, 0xe8e8e8, mx + WING_HALF_W, 5.5, wingCenterZ);
  box(WING_HALF_W * 2, 11, 0.5, 0xe8e8e8, mx, 5.5, WING_FAR);
  addCol(MALL_COLS, mx - WING_HALF_W, wingCenterZ, 1, wingDepth / 2);
  addCol(MALL_COLS, mx + WING_HALF_W, wingCenterZ, 1, wingDepth / 2);
  addCol(MALL_COLS, mx, WING_FAR, WING_HALF_W, 1);
  buildSign('🚪 BACK TO ATRIUM', mx, 8, WING_Z0 + 0.4);

  // Mall Directory kiosk, just inside the doorway before the first row of shops
  box(1.6, 2.6, 0.6, 0x333333, mx, 1.3, mz - 33);
  box(1.4, 1.2, 0.1, 0x66ccff, mx, 1.9, mz - 32.65);
  buildSign('🗺️ DIRECTORY', mx, 3.2, mz - 32.5);
  MALL_ZONES.push({ x: mx, z: mz - 33, r: 3, label: '🗺️ Mall Directory', action: openMallDirectory });

  const COL_SPACING = 11, ROW_SPACING = 13, COLS = 20;
  // Each shop gets a real 2-color theme (body + a deeper accent of the same hue for the roof
  // trim and logo ring), not just one flat color repeated everywhere on the storefront.
  const THEMES = [
    { wall:0xE8927C, accent:0xB85A3C }, { wall:0x8CC0DE, accent:0x3D7A9E },
    { wall:0xF2D479, accent:0xC49A2E }, { wall:0x9BCB8C, accent:0x4F8A3D },
    { wall:0xC9A0DC, accent:0x7B4A9E }, { wall:0xF4A6C6, accent:0xC4487A },
    { wall:0x7FB8B0, accent:0x3D7A72 }, { wall:0xE0B888, accent:0xA67C4A },
  ];
  MALL_SHOPS.forEach((shop, i) => {
    const col = i % COLS, row = Math.floor(i / COLS);
    const x = mx + (col - (COLS - 1) / 2) * COL_SPACING;
    const z = mz - 45 - row * ROW_SPACING;
    const theme = THEMES[i % THEMES.length];

    box(7, 4.5, 5, theme.wall, x, 2.25, z);               // body
    box(8, 0.4, 6, theme.accent, x, 4.7, z);              // roof cap
    box(4.5, 2.2, 0.15, 0xAEE3FF, x, 1.6, z - 2.55);     // glass front
    buildLogoSign(shop.name, shop.emoji, '#'+theme.wall.toString(16).padStart(6,'0'), '#'+theme.accent.toString(16).padStart(6,'0'), x, 5, z - 2.7);

    addCol(MALL_COLS, x, z, 3.8, 3);
    MALL_ZONES.push({ x, z: z - 3, r: 3.2, label: `${shop.emoji} ${shop.name}`, action: () => openCityShopModal(shop.id) });
  });

  // Ceiling lights down the wing, one per row
  for (let r = 0; r < 10; r++) {
    const pl = new THREE.PointLight(0xfff5e0, 0.3, 20);
    pl.position.set(mx, 9.5, mz - 45 - r * ROW_SPACING);
    scene.add(pl);
  }
}
// Small canvas word-wrap helper — used by the billboard ad text (and reusable anywhere else
// that needs multi-line canvas text instead of a single fillText call).
function wrapText(cx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '', lines = [];
  words.forEach(w => {
    const test = line ? line + ' ' + w : w;
    if (cx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  });
  lines.push(line);
  const startY = y - (lines.length - 1) * lineHeight / 2;
  lines.forEach((l, i) => cx.fillText(l, x, startY + i * lineHeight));
}
function openCityShopModal(id) {
  const shop = CITY_SHOPS.find(s => s.id === id) || MALL_SHOPS.find(s => s.id === id);
  if (!shop) return;
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('cityShopModalTitle').textContent = `${shop.emoji} ${shop.name}`;
  document.getElementById('cityShopModalBody').innerHTML = `
    <div style="text-align:center;color:#888;font-size:11px;margin-bottom:10px;">${shop.category}</div>
    <div style="text-align:center;color:#ffd54a;font-style:italic;font-size:12px;margin-bottom:12px;">"${shop.ad}"</div>
    <div style="font-size:12px;color:#ccc;margin-bottom:6px;"><b>What they sell:</b></div>
    ${shop.items.map(it => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid #2a3a3a;">
        <span style="color:#ddd;font-size:12px;">${it.name}</span>
        <span style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <span style="color:#ffd54a;font-size:11px;">💰${it.price}</span>
          <button onclick="buyItem('${it.name.replace(/'/g, "\\'")}',${it.price})" style="padding:3px 10px;background:#2a5a4a;border:1px solid #4a8a6a;border-radius:6px;color:#eee;font-size:11px;cursor:pointer;">Buy</button>
        </span>
      </div>`).join('')}`;
  document.getElementById('cityShopModal').style.display = 'flex';
}
function closeCityShopModal() {
  document.getElementById('cityShopModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
// Mall Directory — a real browsable/searchable index of every shop in Explox (all 100 outdoor
// CITY_SHOPS + all 200 indoor MALL_SHOPS, grouped by their 25 shared categories), reachable from
// the kiosk just inside the Shopping Wing. Selecting an entry opens the exact same info modal you'd
// get by walking up to that shop in person — this is a lookup/browse tool, not a duplicate system.
function openMallDirectory() {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('mallDirectorySearch').value = '';
  renderMallDirectory('');
  document.getElementById('mallDirectoryModal').style.display = 'flex';
}
function renderMallDirectory(query) {
  const q = query.trim().toLowerCase();
  const grouped = {};
  [...CITY_SHOPS, ...MALL_SHOPS, ...OUTFIT_SHOPS].forEach(s => {
    if (q && !s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) return;
    (grouped[s.category] = grouped[s.category] || []).push(s);
  });
  const cats = Object.keys(grouped).sort();
  document.getElementById('mallDirectoryList').innerHTML = cats.length ? cats.map(cat => `
    <div style="margin-bottom:10px;">
      <div style="color:#ffd54a;font-size:12px;font-weight:bold;margin-bottom:4px;">${grouped[cat][0].emoji} ${cat} <span style="color:#777;font-weight:normal;">(${grouped[cat].length})</span></div>
      ${grouped[cat].map(s => `<div onclick="selectDirectoryShop('${s.id}')" style="cursor:pointer;padding:4px 8px;color:#ddd;font-size:12px;border-radius:6px;" onmouseover="this.style.background='#2a3a3a'" onmouseout="this.style.background='none'">${s.name}</div>`).join('')}
    </div>`).join('') : `<div style="color:#888;text-align:center;font-size:12px;padding:20px 0;">No shops match "${query}"</div>`;
}
function filterMallDirectory() {
  renderMallDirectory(document.getElementById('mallDirectorySearch').value);
}
function selectDirectoryShop(id) {
  document.getElementById('mallDirectoryModal').style.display = 'none';
  if (OUTFIT_SHOPS.find(s => s.id === id)) openOutfitBoutique(id);
  else openCityShopModal(id);
}
function closeMallDirectory() {
  document.getElementById('mallDirectoryModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

// ─── SUBURBS NEIGHBORHOOD ──────────────────────────────────────────────────────
// A small residential neighborhood: 40 simple single-story houses laid out in an
// 8-column x 5-row grid, a real street grid (one road per row + 3 cross streets),
// and a paved parking pad per house with a car sitting on it.
//
// Grid math: center x=350,z=180 — 8 columns 28 apart on X (x=252..448),
// 5 rows 32 apart on Z (z=116..244). Each house footprint fits inside a 22x22 plot.
// Each row's street sits at rowZ-13 — far enough past the mailbox/driveway that
// nothing overlaps, and close enough to still read as "this row's street".
//
// Builds the 40-house Suburbs neighborhood. Returns an array of 40 world-coordinate
// objects in grid order (row-major, col 0-7 then row 0-4) so buildShopperPopulation()
// can assign each house to a resident by index. Each entry has:
//   {x,z}                  — front-door walk-to waypoint (unchanged from before)
//   {parkX,parkZ,parkYaw}  — the house's own driveway pad, for parking a resident's car
function buildSuburbs() {
  const doorCoords = [];

  const CENTER_X = 350, CENTER_Z = 180;
  const COL_SPACING = 28, ROW_SPACING = 32;
  const COLS = 8, ROWS = 5;
  const STREET_OFFSET = 13; // how far in front of a row its street sits (rowZ - this)

  const ROOF_COLORS = [0x8b3a3a, 0x6b4a35, 0x707070, 0x475569];
  const DOOR_COLOR = 0x2e2015;
  const WINDOW_COLOR = 0xaee3f5;
  const MAILBOX_POST_COLOR = 0x5a3a20;
  const MAILBOX_BOX_COLOR = 0xd8d8d8;
  const STEP_COLOR = 0x999999;
  const ROAD_COLOR = 0x555555;
  const ROAD_LINE_COLOR = 0xdddd88;
  const DRIVEWAY_COLOR = 0x777777;

  function buildHouse(i, x, z) {
    const bodyW = 8 + (i % 5) * 0.8;        // 8 .. 11.2
    const bodyD = 8 + (i % 3) * 0.7;        // 8 .. 9.4
    const bodyH = 5 + (i % 4) * (1 / 3);    // 5 .. 6

    const hue = ((i * 53) % 360) / 360;
    const sat = 0.28 + (i % 3) * 0.06;
    const light = 0.62 + (i % 4) * 0.04;
    const wallColor = new THREE.Color().setHSL(hue, sat, light).getHex();
    const roofColor = ROOF_COLORS[i % ROOF_COLORS.length];

    const bodyY = bodyH / 2;
    const roofH = 0.8;
    const roofY = bodyH + roofH / 2 - 0.05;

    box(bodyW, bodyH, bodyD, wallColor, x, bodyY, z);
    box(bodyW + 1.6, roofH, bodyD + 1.6, roofColor, x, roofY, z);

    const frontZ = z - bodyD / 2;

    const doorW = 1.2, doorH = 2.4, doorT = 0.12;
    box(doorW, doorH, doorT, DOOR_COLOR, x, doorH / 2, frontZ - 0.08);

    const winW = 1.3, winH = 1.1, winT = 0.1;
    const winY = bodyH * 0.62;
    box(winW, winH, winT, WINDOW_COLOR, x - bodyW * 0.28, winY, frontZ - 0.06);
    box(winW, winH, winT, WINDOW_COLOR, x + bodyW * 0.28, winY, frontZ - 0.06);

    box(2.0, 0.25, 1.4, STEP_COLOR, x, 0.125, frontZ - 1.2);

    // Mailbox on the WEST side of the front yard, clear of the driveway on the east side.
    const mbX = x - bodyW / 2 - 1.5, mbZ = frontZ - 3;
    box(0.12, 1.0, 0.12, MAILBOX_POST_COLOR, mbX, 0.5, mbZ);
    box(0.5, 0.35, 0.3, MAILBOX_BOX_COLOR, mbX, 1.15, mbZ);

    // Driveway/parking pad on the EAST side of the front yard, running from near the
    // house down toward that row's street. A resident's car parks centered on it.
    const padW = 3.4, padDepth = 6.5;
    const padX = x + bodyW / 2 + 2.3;
    const padZ = frontZ - 1 - padDepth / 2;
    box(padW, 0.08, padDepth, DRIVEWAY_COLOR, padX, 0.04, padZ);

    addCol(CITY_COLS, x, z, bodyW / 2, bodyD / 2);

    doorCoords.push({
      x: x, z: frontZ - 4,
      parkX: padX, parkZ: padZ, parkYaw: Math.PI, // yaw PI faces the car toward the street
    });
  }

  for (let row = 0; row < ROWS; row++) {
    const z = CENTER_Z + (row - 2) * ROW_SPACING;
    for (let col = 0; col < COLS; col++) {
      const x = CENTER_X + (col - 3.5) * COL_SPACING;
      const i = row * COLS + col;
      buildHouse(i, x, z);
    }
  }

  // One street per row, running the full width of the neighborhood, positioned at
  // rowZ-STREET_OFFSET — clear of every house's driveway pad (which ends around
  // frontZ-7.5 to frontZ-8.2, well short of the street) and every other row's houses.
  const roadSpanW = (COLS - 1) * COL_SPACING + 40; // full column spread + margin on both ends
  for (let row = 0; row < ROWS; row++) {
    const rowZ = CENTER_Z + (row - 2) * ROW_SPACING;
    const streetZ = rowZ - STREET_OFFSET;
    box(roadSpanW, 0.1, 7, ROAD_COLOR, CENTER_X, 0.05, streetZ);
    box(roadSpanW - 4, 0.02, 0.3, ROAD_LINE_COLOR, CENTER_X, 0.11, streetZ); // dashed-look centerline (single strip, simple)
  }

  // 3 cross streets connecting every row's street into a real grid — positioned at
  // safe midpoints BETWEEN columns (never under a house), each far enough from its
  // neighbors that no two streets/houses overlap.
  const crossStreetXs = [294, 350, 406]; // midpoints between col1/2, col3/4, col5/6
  const crossSpanZ = (ROWS - 1) * ROW_SPACING + 30; // full row spread + margin, covers every row's street
  crossStreetXs.forEach(cx => {
    box(7, 0.1, crossSpanZ, ROAD_COLOR, cx, 0.05, CENTER_Z);
  });

  return doorCoords;
}

// ─── SHOPPER POPULATION ──────────────────────────────────────────────────────
// 40 named residents (looks from SHOPPER_IDENTITIES) get a home (a Suburbs house),
// a parked car (buildCar, reusing the player's own car catalog/models), a job at
// one of the city's real businesses, and a wander route built from SAI_LOCATIONS —
// the same citywide landmark list SAI's map uses — so they genuinely roam the whole
// map instead of pacing a small local loop like the original 24 NPC_DEFS citizens do.
const SHOPPER_IDENTITIES = [
  { name:'Maya',   skin:0xf5d5b5, shirt:0xff4444, pants:0x222222, hair:'long',     hairColor:0x1a1a1a },
  { name:'Ethan',  skin:0xe0b080, shirt:0x3388dd, pants:0x333344, hair:'short',    hairColor:0x2a1505 },
  { name:'Liam',   skin:0xf0c8a0, shirt:0x22aa55, pants:0x1a2a55, hair:'spiky',    hairColor:0x3a2410, hat:'cap' },
  { name:'Ava',    skin:0xf5c89a, shirt:0xcc44aa, pants:0x223355, hair:'ponytail', hairColor:0xaa3311 },
  { name:'Noah',   skin:0xd4956a, shirt:0xffcc00, pants:0x111133, hair:'curly',    hairColor:0x1a1008 },
  { name:'Grace',  skin:0xf8d8b8, shirt:0x88ccaa, pants:0x334455, hair:'afro',     hairColor:0x2a1a10 },
  { name:'Diego',  skin:0xc07840, shirt:0xee6622, pants:0x224422, hair:'none',     hairColor:0x1a1108 },
  { name:'Fatima', skin:0xb87040, shirt:0x9944cc, pants:0x1a1a2a, hair:'long',     hairColor:0x0a0a0a, hat:'beanie' },
  { name:'Ravi',   skin:0xd4a070, shirt:0x2299cc, pants:0x333322, hair:'short',    hairColor:0x0a0a0a },
  { name:'Chloe',  skin:0xffe0bd, shirt:0xff88aa, pants:0x442222, hair:'ponytail', hairColor:0xffcc66 },
  { name:'Hassan', skin:0x8B5E3C, shirt:0x66aa22, pants:0x1a2233, hair:'short',    hairColor:0x1a1108 },
  { name:'Yuki',   skin:0xf5e5d5, shirt:0x44ccee, pants:0x222222, hair:'long',     hairColor:0x1a1a1a },
  { name:'Ben',    skin:0xe8c090, shirt:0xdd5533, pants:0x333344, hair:'spiky',    hairColor:0x442200, hat:'fedora' },
  { name:'Olivia', skin:0xf0d0a8, shirt:0xff6699, pants:0x2a1a33, hair:'curly',    hairColor:0x552211 },
  { name:'Malik',  skin:0x7a4a2a, shirt:0x3355aa, pants:0x111111, hair:'none',     hairColor:0x0a0a0a },
  { name:'Sofia',  skin:0xf4d0b0, shirt:0xcc8844, pants:0x224422, hair:'long',     hairColor:0x2a1505 },
  { name:'Ken',    skin:0xd4956a, shirt:0x77cc33, pants:0x223322, hair:'short',    hairColor:0x1a1108 },
  { name:'Aisha',  skin:0xa8623c, shirt:0xeecc44, pants:0x331a1a, hair:'afro',     hairColor:0x0a0a0a, hat:'cap' },
  { name:'Victor', skin:0xe8c080, shirt:0x4488cc, pants:0x1a2a55, hair:'short',    hairColor:0x3a2010 },
  { name:'Ruby',   skin:0xf5c89a, shirt:0xcc2244, pants:0x222233, hair:'ponytail', hairColor:0x220a05 },
  { name:'Jamal',  skin:0x6b4226, shirt:0x22ccaa, pants:0x1a1a1a, hair:'spiky',    hairColor:0x0a0a0a },
  { name:'Elena',  skin:0xf8d8b8, shirt:0xaa22cc, pants:0x334499, hair:'long',     hairColor:0x4a2a10 },
  { name:'Wei',    skin:0xe0b080, shirt:0x44aa88, pants:0x222222, hair:'short',    hairColor:0x1a1a1a, hat:'cowboy' },
  { name:'Nadia',  skin:0xd49060, shirt:0xee6622, pants:0x223355, hair:'curly',    hairColor:0x2a1a10 },
  { name:'Owen',   skin:0xf0c8a0, shirt:0x556b2f, pants:0x333333, hair:'none',     hairColor:0x654321 },
  { name:'Layla',  skin:0xc97a50, shirt:0xff88aa, pants:0x1a1833, hair:'long',     hairColor:0x1a1008 },
  { name:'Dante',  skin:0xb87040, shirt:0x224488, pants:0x111111, hair:'spiky',    hairColor:0x0a0a0a },
  { name:'Ingrid', skin:0xffe0bd, shirt:0x3388dd, pants:0x334455, hair:'ponytail', hairColor:0xd4a017, hat:'beanie' },
  { name:'Rahul',  skin:0xd4a070, shirt:0xcc44aa, pants:0x222233, hair:'short',    hairColor:0x1a1108 },
  { name:'Bianca', skin:0xf5d5b5, shirt:0x88ccaa, pants:0x442222, hair:'curly',    hairColor:0x3a2410 },
  { name:'Felix',  skin:0xe8c090, shirt:0xffcc00, pants:0x223322, hair:'short',    hairColor:0x2a1505 },
  { name:'Zara',   skin:0x8B5E3C, shirt:0xff4444, pants:0x1a2a2a, hair:'afro',     hairColor:0x0a0a0a },
  { name:'Theo',   skin:0xf0d0a8, shirt:0x2299cc, pants:0x333344, hair:'none',     hairColor:0x4a2a10, hat:'cap' },
  { name:'Isla',   skin:0xf5c89a, shirt:0x9944cc, pants:0x224422, hair:'long',     hairColor:0xaa3311 },
  { name:'Kofi',   skin:0x5c3a21, shirt:0x77cc33, pants:0x1a1a1a, hair:'short',    hairColor:0x0a0a0a },
  { name:'Mila',   skin:0xf4d0b0, shirt:0xee6622, pants:0x334499, hair:'ponytail', hairColor:0x552211 },
  { name:'Anton',  skin:0xe0b080, shirt:0x3355aa, pants:0x222222, hair:'spiky',    hairColor:0x2a1a0a },
  { name:'Nia',    skin:0xa8623c, shirt:0xcc2244, pants:0x1a2233, hair:'curly',    hairColor:0x0a0a0a, hat:'fedora' },
  { name:'Hiro',   skin:0xf5e5d5, shirt:0x44ccee, pants:0x333322, hair:'short',    hairColor:0x1a1a1a },
  { name:'Paloma', skin:0xd4956a, shirt:0xff6699, pants:0x223355, hair:'long',     hairColor:0x2a1505 },
];
const SHOPPER_JOBS = [
  { title:'Diner Cook',      workplace:'The Diner',      x:110, z:-25 },
  { title:'Store Clerk',     workplace:'Your Store',     x:160, z:-25 },
  { title:'Mall Clerk',      workplace:'City Mall',      x:80,  z:-20 },
  { title:'Hotel Concierge', workplace:'City Hotel',     x:-15, z:-5  },
  { title:'Car Salesperson', workplace:'Car Dealership', x:130, z:35  },
  { title:'Tech Support',    workplace:'Computer Shop',  x:100, z:58  },
  { title:'Ticket Seller',   workplace:'Movie Theater',  x:50,  z:-85 },
  { title:'Bus Driver',      workplace:'Transit Hub',    x:0,   z:50  },
  { title:'Bank Teller',     workplace:'City Bank',      x:-30, z:30  },
];
function buildShopperPopulation() {
  const homes = buildSuburbs(); // 40 {x,z} door coords, one per shopper by index
  // SAI_LOCATIONS is the same citywide landmark list the SAI map uses — a ready-made
  // pool of real, named places spread across the whole map. "Your House" is the
  // PLAYER's own private home, so it's excluded from the wander pool.
  const wanderPool = SAI_LOCATIONS.filter(l => l.label !== 'Your House');
  SHOPPER_IDENTITIES.forEach((person, i) => {
    const home = homes[i];
    const job = SHOPPER_JOBS[i % SHOPPER_JOBS.length];

    // Parked on their own house's driveway pad (built by buildSuburbs) — varied model/color
    // from the same catalog the player buys from.
    const carDef = CAR_CATALOG[i % CAR_CATALOG.length];
    buildCar(carDef, home.parkX, home.parkZ, home.parkYaw);

    // Route: home -> their job -> 3 more random landmarks picked from across the whole
    // city, so every shopper's loop genuinely spans the map instead of one small cluster.
    const shuffled = [...wanderPool].sort(() => Math.random() - 0.5).slice(0, 3).map(l => [l.x, l.z]);
    const patrol = [[home.x, home.z], [job.x, job.z], ...shuffled];

    const npc = makeNPC({
      name: person.name, role: job.title,
      skin: person.skin, shirt: person.shirt, pants: person.pants,
      pos: [home.x, 0, home.z], patrol,
      hair: person.hair, hairColor: person.hairColor, hat: person.hat,
      emotion: BASE_EMOTIONS[i % BASE_EMOTIONS.length],
    });
    npc.job = job.title; npc.workplace = job.workplace; npc.home = home;
    npcs.push(npc);
  });
}

// ─── FRIENDS — meet a wandering Suburbs neighbor, befriend them, then invite them over,
// visit their place, or hire them at your store. `friends` only stores names — the 40
// shoppers are rebuilt identically every session, so looking one up by name in `npcs` (for
// current position/job) or in SHOPPER_IDENTITIES (for their look) is always reliable. ──────
function findNearestNeighbor(px, pz, maxDist) {
  let closest = null, closestDist = maxDist;
  for (const npc of npcs) {
    if (!npc.job) continue; // only the 40 named Suburbs shoppers count as "neighbors" (not the original 24 NPC_DEFS)
    const d = Math.sqrt((px - npc.group.position.x) ** 2 + (pz - npc.group.position.z) ** 2);
    if (d < closestDist) { closestDist = d; closest = npc; }
  }
  return closest;
}
function openNeighborModal(name) {
  const npc = npcs.find(n => n.name === name);
  if (!npc) return;
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  const isFriend = friends.includes(name);
  document.getElementById('neighborModalTitle').textContent = `👋 ${name}`;
  const spouse = getSpouse(name);
  let html = `<div style="margin-bottom:10px;text-align:center;">
      ${npc.emotion ? `<div style="font-size:24px;">${npc.emotion}</div>` : ''}
      <div style="font-size:13px;color:#fff;">${npc.job} at ${npc.workplace}</div>
      <div style="font-size:11px;color:#888;">🏠 Lives in the Suburbs</div>
      ${spouse ? `<div style="font-size:11px;color:#ff99bb;">💍 Married to ${spouse}</div>` : ''}
    </div>`;
  if (!isFriend) {
    html += `<button onclick="befriendNeighbor('${name}')" style="width:100%;padding:8px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#ff6699;">🤝 Become Friends</button>`;
  } else {
    html += `<div style="text-align:center;color:#7CFC00;font-size:11px;margin-bottom:8px;">💗 You're friends with ${name}!</div>`;
    html += `<button onclick="inviteNeighborOver('${name}')" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#3a6ea5;">🏠 Invite ${name} to Your House</button>`;
    html += `<button onclick="visitNeighborHouse('${name}')" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#4a8a4a;">🚪 Visit ${name}'s House</button>`;
    if (ownedStore) {
      const alreadyStaff = ownedStaff.some(s => s.name === name);
      if (alreadyStaff) {
        html += `<div style="text-align:center;color:#888;font-size:11px;">Already works at your store!</div>`;
      } else if (ownedStaff.length >= MAX_STAFF) {
        html += `<div style="text-align:center;color:#888;font-size:11px;">Your staff is full (${MAX_STAFF}/${MAX_STAFF}).</div>`;
      } else {
        html += `<button onclick="hireFriendAsStaff('${name}')" style="width:100%;padding:8px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#c9974c;">👥 Hire ${name} as Staff — ${staffHireCost()} S.I.P.</button>`;
      }
    }
  }
  document.getElementById('neighborModalBody').innerHTML = html;
  document.getElementById('neighborModal').style.display = 'flex';
}
function closeNeighborModal() {
  document.getElementById('neighborModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function befriendNeighbor(name) {
  if (!friends.includes(name)) {
    friends.push(name);
    saveCurrentUser();
    sfx.cheer();
    showNotif(`💗 You and ${name} are friends now!`);
  }
  openNeighborModal(name); // refresh the modal so the new friend-only options appear
}
function inviteNeighborOver(name) {
  houseGuest = name;
  saveCurrentUser();
  refreshHouseGuest();
  sfx.buy();
  showNotif(`🏠 You invited ${name} over! Head home to hang out.`);
  closeNeighborModal();
}
function sayGoodbyeToGuest() {
  if (!houseGuest) { showNotif('No one is visiting right now.'); return; }
  const name = houseGuest;
  houseGuest = null;
  saveCurrentUser();
  refreshHouseGuest();
  showNotif(`👋 ${name} said goodbye and headed home.`);
}
// A simple standing figure using a neighbor's REAL look (from SHOPPER_IDENTITIES, since
// makeNPC()'s live mesh colors aren't stored anywhere retrievable) plus a floating name tag.
// Adds directly to `scene` at absolute world coords (matching the flat box()-per-call style
// buildHouseInterior/buildFriendHouseInterior already use — no group wrapper). Returns every
// mesh it created so the caller can track and remove them later.
function buildResidentFigure(x, z, npc) {
  const identity = SHOPPER_IDENTITIES.find(s => s.name === npc.name) || { skin: 0xE8B87A, shirt: 0x557799, pants: 0x333333 };
  const made = [];
  made.push(box(0.9, 0.9, 0.9, identity.skin, x, 2.75, z));
  made.push(box(0.8, 1.0, 0.45, identity.shirt, x, 1.75, z));
  made.push(box(0.32, 0.85, 0.32, identity.pants, x - 0.22, 0.55, z));
  made.push(box(0.32, 0.85, 0.32, identity.pants, x + 0.22, 0.55, z));
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 40;
  const cx = cv.getContext('2d');
  cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(0, 0, 128, 40);
  cx.fillStyle = '#fff'; cx.font = 'bold 15px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText(npc.name, 64, 20);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.32), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
  tag.position.set(x, 3.6, z);
  scene.add(tag);
  made.push(tag);
  return made;
}
// Keeps the guest figure inside YOUR house in sync with `houseGuest` — call whenever it
// changes, and once at startup (after shoppers exist) in case a save loaded with a guest set.
function refreshHouseGuest() {
  houseGuestMeshes.forEach(m => scene.remove(m));
  houseGuestMeshes = [];
  if (!houseGuest) return;
  const npc = npcs.find(n => n.name === houseGuest);
  if (!npc) return;
  houseGuestMeshes = buildResidentFigure(HOUSE_SPAWN.x-7, HOUSE_SPAWN.z+6, npc); // left/front of the room, clear of all furniture — matches the fixed guest zone above
}
// ─── VISITING A FRIEND'S HOUSE — one shared pocket-space room, re-themed per visit ──────
function buildFriendHouseInterior(npc) {
  friendHouseMeshes.forEach(m => scene.remove(m));
  friendHouseMeshes = [];
  const fx = FRIEND_HOUSE_SPAWN.x, fz = FRIEND_HOUSE_SPAWN.z;
  const add = (m) => { friendHouseMeshes.push(m); return m; };
  add(box(16, 0.3, 14, 0xc8aa80, fx, 0.15, fz));       // floor
  add(box(16, 0.2, 14, 0xf5f0e8, fx, 5, fz));          // ceiling
  add(box(16, 5, 0.3, 0xf5efe0, fx, 2.5, fz - 7));     // back wall
  add(box(5, 5, 0.3, 0xf5efe0, fx - 5.5, 2.5, fz + 7)); // front wall left
  add(box(5, 5, 0.3, 0xf5efe0, fx + 5.5, 2.5, fz + 7)); // front wall right
  add(box(0.3, 5, 14, 0xf5efe0, fx - 8, 2.5, fz));     // left wall
  add(box(0.3, 5, 14, 0xf5efe0, fx + 8, 2.5, fz));     // right wall
  add(box(2, 3, 0.1, 0x8B5E3C, fx, 1.5, fz + 7.05));   // door
  add(box(3, 1, 1.2, 0x557799, fx - 3, 0.5, fz - 4));  // couch
  add(box(3, 0.08, 2, 0x8B5A2B, fx - 3, 0.34, fz - 2.6)); // rug in front of the couch
  buildResidentFigure(fx + 2, fz - 2, npc).forEach(add);
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#fff'; cx.fillRect(0, 0, 256, 64);
  cx.save(); cx.scale(-1, 1); cx.translate(-256, 0); // matches buildSign()'s mirrored-text convention
  cx.fillStyle = '#111'; cx.font = 'bold 20px Arial'; cx.textAlign = 'center'; cx.fillText(npc.name + "'s House", 128, 40);
  cx.restore();
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), side: THREE.DoubleSide }));
  sign.position.set(fx, 4.2, fz - 6.8);
  scene.add(sign);
  add(sign);
}
const FRIEND_HOUSE_ZONES = [
  { x: FRIEND_HOUSE_SPAWN.x, z: FRIEND_HOUSE_SPAWN.z + 6, r: 3, label: 'Leave', action: leaveFriendHouse },
];
function visitNeighborHouse(name) {
  const npc = npcs.find(n => n.name === name);
  if (!npc) return;
  visitingFriendName = name;
  buildFriendHouseInterior(npc);
  inFriendHouse = true;
  playerGroup.position.set(FRIEND_HOUSE_SPAWN.x, 0, FRIEND_HOUSE_SPAWN.z);
  yaw = Math.PI;
  closeNeighborModal();
  showNotif(`🚪 Welcome to ${name}'s house!`);
}
function leaveFriendHouse() {
  inFriendHouse = false;
  // Drop the player back at their friend's actual front door in the Suburbs, for continuity
  const npc = npcs.find(n => n.name === visitingFriendName);
  if (npc && npc.home) { playerGroup.position.set(npc.home.x, 0, npc.home.z); yaw = 0; }
  visitingFriendName = null;
  showNotif('Leaving...');
}

// ─── FAMILIES & LIFE EVENTS — neighbors can get married (forming real families you can see
// reflected in the neighbor modal), have babies together, and the whole town gathers for
// weddings and birthdays. Those three are player-triggered from the Town Events board (same
// "player as the one who makes it happen" feel as running Your Store) — but death from old age
// is deliberately NOT a button next to party invitations. It's handled separately, ambiently,
// by a small set of elderly townsfolk (not any of your 40 friends) who peacefully pass on their
// own time as you play. See the ELDERS section below. ──────────────────────────────────────
let marriages = []; // persisted — [{a:name, b:name}] couples formed by hosting a wedding
function getSpouse(name) {
  const m = marriages.find(x => x.a === name || x.b === name);
  return m ? (m.a === name ? m.b : m.a) : null;
}
const BASE_EMOTIONS = ['😊','😌','🙂','🤔','😴']; // everyday ambient moods the 40 shoppers start with
const TOWN_EVENT_SPOT = { x:378, z:155 }; // open ground in the Suburbs, clear of houses/streets
let eventDecorMeshes = [];
function clearEventDecor() { eventDecorMeshes.forEach(m => scene.remove(m)); eventDecorMeshes = []; }
function buildEventDecor(type, x, z) {
  clearEventDecor();
  const add = (m) => { eventDecorMeshes.push(m); return m; };
  if (type === 'wedding') {
    add(box(0.3, 3, 0.3, 0xffffff, x - 2, 1.5, z));
    add(box(0.3, 3, 0.3, 0xffffff, x + 2, 1.5, z));
    add(box(4.3, 0.3, 0.3, 0xffffff, x, 3, z));
    add(box(0.6, 0.6, 0.6, 0xff6699, x, 3.3, z));
  } else if (type === 'birthday') {
    [[-1.5, 0xff4444], [0, 0xffcc00], [1.5, 0x44ccff]].forEach(([dx, color]) => add(box(0.5, 0.7, 0.5, color, x + dx, 2.5, z)));
    add(box(2, 1, 2, 0x8B5A2B, x, 0.5, z));
  } else if (type === 'funeral') {
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dz]) => add(box(0.3, 0.5, 0.3, 0xffffff, x + dx, 0.25, z + dz)));
  } else if (type === 'grandopening') {
    add(box(0.15, 1.2, 0.15, 0xcccccc, x-2, 0.6, z)); add(box(0.15, 1.2, 0.15, 0xcccccc, x+2, 0.6, z));
    add(box(4, 0.15, 0.15, 0xff3333, x, 1.2, z));
    [[-2.5,0xff4444],[-1,0xffcc00],[0.5,0x44ccff],[2,0x44dd88]].forEach(([dx,color]) => add(box(0.5,0.7,0.5,color,x+dx,2.6,z)));
  } else if (type === 'concert') {
    add(box(6, 0.4, 4, 0x333344, x, 0.4, z));
    add(box(0.3, 3, 0.3, 0x222222, x-3, 1.9, z-2)); add(box(1, 1.5, 1, 0x111111, x-3, 2.5, z-2));
    add(box(0.3, 3, 0.3, 0x222222, x+3, 1.9, z-2)); add(box(1, 1.5, 1, 0x111111, x+3, 2.5, z-2));
  }
}
function openTownEvents() {
  if (document.pointerLockElement) document.exitPointerLock();
  isPointerLocked = false;
  document.getElementById('townEventsBody').innerHTML = `
    <button onclick="hostWedding()" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#e0669b;">💍 Host a Wedding</button>
    <button onclick="throwBirthdayParty()" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#4a90c9;">🎂 Throw a Birthday Party</button>
    <button onclick="haveBaby()" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#7ac088;">👶 Have a Baby</button>
    <button onclick="hostGrandOpening()" style="width:100%;padding:8px;margin-bottom:6px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#e08a3a;">🎗️ Host a Grand Opening</button>
    <button onclick="hostConcert()" style="width:100%;padding:8px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;color:#fff;background:#8a4ae0;">🎤 Throw a Concert</button>
  `;
  document.getElementById('townEventsModal').style.display = 'flex';
}
function hostGrandOpening() {
  const skip = ['Whispering Woods','Sunset Plains','The Scrapyard','The Dump'];
  const spots = LOC_ZONES.filter(z => !skip.includes(z.name));
  const spot = spots[Math.floor(Math.random()*spots.length)];
  buildEventDecor('grandopening', TOWN_EVENT_SPOT.x, TOWN_EVENT_SPOT.z);
  addToInventory('grand_opening_gift', 'Grand Opening Gift Bag', '🎁');
  sipDollars += 30; updateSIP(); saveCurrentUser();
  sfx.cheer();
  showNotif(`🎗️ Grand Opening for ${spot.name}! Everyone got a free gift bag. (+30 S.I.P. +🎁 Gift Bag)`);
  closeTownEvents();
}
function hostConcert() {
  const price = 15;
  if (sipDollars < price) { sfx.nope(); showNotif(`❌ Need ${price} S.I.P. for a concert ticket!`); return; }
  sipDollars -= price; updateSIP();
  buildEventDecor('concert', TOWN_EVENT_SPOT.x, TOWN_EVENT_SPOT.z);
  const trackIdx = Math.floor(Math.random()*bgMusic.TRACKS.length);
  bgMusic.switchTrack(trackIdx);
  sipDollars += 40; updateSIP(); saveCurrentUser();
  sfx.cheer();
  showNotif(`🎤 The concert kicked off with "${bgMusic.TRACKS[trackIdx].name}"! You sold merch in the crowd. (-${price} ticket, +40 S.I.P. merch)`);
  closeTownEvents();
}
function closeTownEvents() {
  document.getElementById('townEventsModal').style.display = 'none';
  if (renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}
function hostWedding() {
  const married = new Set(marriages.flatMap(m => [m.a, m.b]));
  let pool = SHOPPER_IDENTITIES.map(s => s.name).filter(n => !married.has(n) && friends.includes(n));
  if (pool.length < 2) pool = SHOPPER_IDENTITIES.map(s => s.name).filter(n => !married.has(n));
  if (pool.length < 2) { showNotif('Everyone in town is already married! 💍'); closeTownEvents(); return; }
  const a = pool[Math.floor(Math.random() * pool.length)];
  let b = a; while (b === a) b = pool[Math.floor(Math.random() * pool.length)];
  marriages.push({ a, b });
  saveCurrentUser();
  [a, b].forEach(n => { const npc = npcs.find(x => x.name === n); if (npc) setNPCEmotion(npc, '🥰'); });
  buildEventDecor('wedding', TOWN_EVENT_SPOT.x, TOWN_EVENT_SPOT.z);
  sipDollars += 50; updateSIP();
  sfx.cheer();
  showNotif(`💍 ${a} and ${b} got married! The whole town celebrated. (+50 S.I.P. wedding gift)`);
  closeTownEvents();
}
function throwBirthdayParty() {
  const friendPool = SHOPPER_IDENTITIES.map(s => s.name).filter(n => friends.includes(n));
  const pool = friendPool.length ? friendPool : SHOPPER_IDENTITIES.map(s => s.name);
  const name = pool[Math.floor(Math.random() * pool.length)];
  const npc = npcs.find(x => x.name === name);
  if (npc) setNPCEmotion(npc, '🎉');
  buildEventDecor('birthday', TOWN_EVENT_SPOT.x, TOWN_EVENT_SPOT.z);
  sipDollars += 20; updateSIP();
  sfx.cheer();
  showNotif(`🎂 It's ${name}'s birthday! Everyone sang and had cake. (+20 S.I.P. party favor)`);
  closeTownEvents();
}
function buildTownEventsBoard() {
  const { x, z } = TOWN_EVENT_SPOT;
  box(0.15, 2.2, 0.15, 0x5a3a20, x - 1.3, 1.1, z);
  box(0.15, 2.2, 0.15, 0x5a3a20, x + 1.3, 1.1, z);
  box(3, 1.6, 0.15, 0xf5f0e0, x, 2, z);
  buildSign('🎉 Town Events', x, 3, z - 0.2);
  CITY_ZONES.push({ x, z: z + 1.5, r: 3.5, label: '🎉 Town Events Board', action: openTownEvents });
}

// ─── BABIES — married couples (at least one of whom is your friend) can welcome a baby.
// Kept deliberately simple: a baby is a real, permanent, visible addition to the family (a
// crib + nameplate by one parent's house, tracked forever in `children`) rather than a full
// wandering NPC — that would mean inventing a whole child-appearance system and a "growing up"
// simulation, well beyond what a crib and a name need to feel real. ──────────────────────────
const BABY_NAMES = ['Wren','Sage','Fig','Rowan','Pip','Lark','Bo','Nova','Juniper','Milo','Coco','Otto','Ivy','Remy','Bree','Kit','Poppy','Sunny','Arlo','Dot'];
let children = []; // persisted — [{name, parentA, parentB}]
let childMeshes = [];
function buildChildren() {
  childMeshes.forEach(m => scene.remove(m));
  childMeshes = [];
  children.forEach(kid => {
    const parentNpc = npcs.find(n => n.name === kid.parentA) || npcs.find(n => n.name === kid.parentB);
    if (!parentNpc || !parentNpc.home) return;
    const { x, z } = parentNpc.home;
    const cx0 = x - 3, cz0 = z + 1; // a couple units off the house, clear of the driveway/mailbox
    const add = (m) => { childMeshes.push(m); return m; };
    add(box(1.2, 0.5, 0.7, 0xf5efe0, cx0, 0.25, cz0));   // crib base
    add(box(1.2, 0.5, 0.08, 0xf5efe0, cx0, 0.5, cz0 - 0.35)); // crib end panel
    add(box(0.35, 0.2, 0.2, 0xffe0c0, cx0, 0.55, cz0));  // swaddled baby peeking out
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 36;
    const cvx = cv.getContext('2d');
    cvx.fillStyle = 'rgba(0,0,0,0.65)'; cvx.fillRect(0, 0, 128, 36);
    cvx.fillStyle = '#fff'; cvx.font = 'bold 14px Arial'; cvx.textAlign = 'center'; cvx.textBaseline = 'middle';
    cvx.fillText('👶 ' + kid.name, 64, 18);
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.26), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
    tag.position.set(cx0, 1.0, cz0);
    scene.add(tag);
    add(tag);
  });
}
function haveBaby() {
  if (marriages.length === 0) { showNotif('No married couples yet — host a wedding first! 💍'); closeTownEvents(); return; }
  const friendCouples = marriages.filter(m => friends.includes(m.a) || friends.includes(m.b));
  const pool = friendCouples.length ? friendCouples : marriages;
  const couple = pool[Math.floor(Math.random() * pool.length)];
  const usedNames = new Set(children.map(k => k.name));
  const namePool = BABY_NAMES.filter(n => !usedNames.has(n));
  const name = (namePool.length ? namePool : BABY_NAMES)[Math.floor(Math.random() * (namePool.length ? namePool.length : BABY_NAMES.length))];
  children.push({ name, parentA: couple.a, parentB: couple.b });
  saveCurrentUser();
  buildChildren();
  [couple.a, couple.b].forEach(n => { const npc = npcs.find(x => x.name === n); if (npc) setNPCEmotion(npc, '🥰'); });
  sipDollars += 15; updateSIP();
  sfx.cheer();
  showNotif(`👶 ${couple.a} and ${couple.b} welcomed a baby named ${name}! (+15 S.I.P. baby gift)`);
  closeTownEvents();
}

// ─── ELDERS — a small set of elderly townsfolk (deliberately NOT any of your 40 friends) who
// sit near the Town Events board and, after a while of real play, peacefully pass from old age.
// Kept separate from your friends on purpose: your friends are always safe to invest in — invite
// them over, marry them off, hire them — without the risk of losing someone you built a
// relationship with. The elders are the ones whose story is "a long, happy life nearing its end"
// from the moment you meet them, so their eventual passing is bittersweet, not a shock. ────────
const ELDER_IDENTITIES = [
  { id:'rose',   name:'Grandma Rose',   skin:0xf0d0b0, shirt:0x8899bb, pants:0x556677, hairColor:0xe8e8e8 },
  { id:'walter', name:'Grandpa Walter', skin:0xe0b088, shirt:0x77997a, pants:0x445544, hairColor:0xf0f0f0 },
  { id:'mabel',  name:'Grandma Mabel',  skin:0xc9986a, shirt:0xcc8899, pants:0x554455, hairColor:0xdcdcdc },
  { id:'gus',    name:'Grandpa Gus',    skin:0xf5d5b5, shirt:0xaa8855, pants:0x443322, hairColor:0xe0e0e0 },
  { id:'edith',  name:'Grandma Edith',  skin:0xd4a070, shirt:0x88aacc, pants:0x334455, hairColor:0xf5f5f5 },
  { id:'sal',    name:'Grandpa Sal',    skin:0xb87850, shirt:0x998866, pants:0x332211, hairColor:0xd8d8d8 },
];
const ELDER_SPOT = { x:378, z:145 }; // just south of the Town Events board, clear of it
let elderLifespans = {}; // persisted — {elderId: secondsOfPlaytimeRemaining}, seeded lazily on first tick
let elderPassed = {};    // persisted — {elderId: true} once they've gone; permanent
let elderMeshes = {};    // NOT persisted — {elderId: [meshes]} for the living figure or memorial marker
function buildElderFigure(elder, x, z) {
  const made = [];
  made.push(box(0.85, 0.85, 0.85, elder.skin, x, 2.6, z));      // head (sits a little lower — elders stand a bit stooped)
  made.push(box(0.75, 0.9, 0.42, elder.shirt, x, 1.65, z));     // body
  made.push(box(1.0, 0.25, 0.9, elder.hairColor, x, 3.05, z));  // white/gray hair
  made.push(box(0.3, 0.8, 0.3, elder.pants, x - 0.2, 0.7, z));
  made.push(box(0.3, 0.8, 0.3, elder.pants, x + 0.2, 0.7, z));
  made.push(box(0.06, 1.1, 0.06, 0x6b4a2a, x + 0.55, 0.55, z)); // cane
  const cv = document.createElement('canvas'); cv.width = 160; cv.height = 40;
  const cx = cv.getContext('2d');
  cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(0, 0, 160, 40);
  cx.fillStyle = '#fff'; cx.font = 'bold 14px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText(elder.name, 80, 20);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.32), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
  tag.position.set(x, 3.6, z);
  scene.add(tag);
  made.push(tag);
  return made;
}
function buildMemorialMarker(elder, x, z) {
  const made = [];
  made.push(box(0.6, 0.9, 0.15, 0xaaaaaa, x, 0.45, z));
  const cv = document.createElement('canvas'); cv.width = 160; cv.height = 60;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#eee'; cx.fillRect(0, 0, 160, 60);
  cx.fillStyle = '#333'; cx.font = 'bold 13px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText(elder.name, 80, 22);
  cx.font = '11px Arial'; cx.fillText('Fondly remembered 💐', 80, 42);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.42), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
  plaque.position.set(x, 0.85, z + 0.09);
  scene.add(plaque);
  made.push(plaque);
  return made;
}
function buildElders() {
  ELDER_IDENTITIES.forEach((elder, i) => {
    const x = ELDER_SPOT.x + (i - 2.5) * 1.8, z = ELDER_SPOT.z;
    if (elderMeshes[elder.id]) { elderMeshes[elder.id].forEach(m => scene.remove(m)); }
    elderMeshes[elder.id] = elderPassed[elder.id] ? buildMemorialMarker(elder, x, z) : buildElderFigure(elder, x, z);
  });
}
function elderPasses(elder) {
  elderPassed[elder.id] = true;
  saveCurrentUser();
  elderMeshes[elder.id].forEach(m => scene.remove(m));
  const i = ELDER_IDENTITIES.indexOf(elder);
  const x = ELDER_SPOT.x + (i - 2.5) * 1.8, z = ELDER_SPOT.z;
  elderMeshes[elder.id] = buildMemorialMarker(elder, x, z);
  buildEventDecor('funeral', x, z + 1.5);
  sfx.notify();
  showNotif(`🕊️ ${elder.name} passed peacefully, surrounded by a long, happy life in this town. Everyone left a flower. 💐`);
}
function tickElders(dt) {
  ELDER_IDENTITIES.forEach(elder => {
    if (elderPassed[elder.id]) return;
    if (elderLifespans[elder.id] === undefined) elderLifespans[elder.id] = 480 + Math.random() * 720; // 8-20 min of real play
    elderLifespans[elder.id] -= dt;
    if (elderLifespans[elder.id] <= 0) elderPasses(elder);
  });
}

// ─── PRODUCT SHAPES — one real-looking little shape per BASE ingredient (40 entries, matching
// BASE_INGREDIENTS 1-for-1). All 25 styles of a base ("Organic Tomato", "Frozen Tomato", ...)
// share the same shape — only the price/name changes with style, so 40 entries is all we need,
// same "hand-made seed table" trick used elsewhere in this file (STORE_INGREDIENTS, TRACKS...).
const PRODUCT_SHAPES = {
  tomato:{shape:'sphere', color:0xE84C3D, stem:0x2ECC71},
  carrot:{shape:'cone', color:0xE8871E, stem:0x2ECC71},
  cheese:{shape:'wedge', color:0xF5D76E},
  bread:{shape:'box', color:0xC9974C, dims:[1.3,0.8,0.9], label:true},
  milk:{shape:'carton', color:0xFFFFFF, accent:0x3B7DD8},
  eggs:{shape:'carton', color:0xE8D9B5, accent:0xE8D9B5, eggTop:true},
  chicken:{shape:'sphere', color:0xE8B87A, squash:0.6},
  apple:{shape:'sphere', color:0xD2373B, stem:0x6B4423},
  onion:{shape:'sphere', color:0xE8D9C0, stem:0x8BC34A},
  banana:{shape:'curved', color:0xF3D250},
  grapes:{shape:'cluster', color:0x8E44AD},
  fish:{shape:'sphere', color:0x7FA8C9, squash:0.55},
  rice:{shape:'box', color:0xF7F3E8, dims:[1,1.2,0.7], bagTop:true, label:true},
  butter:{shape:'box', color:0xF5DEB0, dims:[1.2,0.5,0.7]},
  potato:{shape:'sphere', color:0xC8A165},
  corn:{shape:'cylinder', color:0xF6D743, accent:0x6FA84A},
  broccoli:{shape:'sphere', color:0x3D8B3D, stem:0x6FA84A, stemPos:'bottom'},
  strawberry:{shape:'cone', color:0xE0324F, stem:0x2ECC71},
  orange:{shape:'sphere', color:0xF0932B},
  watermelon:{shape:'sphere', color:0x2ECC71},
  pepper:{shape:'sphere', color:0xE74C3C, stem:0x2ECC71},
  mushroom:{shape:'mushroom', color:0xC9B79C},
  garlic:{shape:'sphere', color:0xF5F0E0},
  lemon:{shape:'sphere', color:0xF6E625},
  avocado:{shape:'sphere', color:0x5B7F3A},
  bacon:{shape:'box', color:0xD26B6B, dims:[1.4,0.25,0.7]},
  shrimp:{shape:'curved', color:0xF0A0A0},
  honey:{shape:'cylinder', color:0xE8A93B, lid:0xC9974C},
  yogurt:{shape:'cylinder', color:0xFFFFFF, lid:0xE84C8A},
  pasta:{shape:'box', color:0xF3D89A, dims:[0.9,1.3,0.6], label:true},
  cereal:{shape:'box', color:0xE8A93B, dims:[1.1,1.5,0.6], label:true},
  cookie:{shape:'cylinder', color:0xC9974C, flat:true},
  chocolate:{shape:'box', color:0x5C3A21, dims:[1.3,0.35,0.8]},
  pretzel:{shape:'ring', color:0xA9713D},
  peanuts:{shape:'box', color:0xC9974C, dims:[1,1.2,0.6], bagTop:true, label:true},
  icecream:{shape:'cone-scoop', color:0xE8C39E, accent:0xF5E1C8},
  soda:{shape:'cylinder', color:0xD23C3C, label:true},
  coffee:{shape:'cylinder', color:0x4A2E1E, label:true},
  tea:{shape:'box', color:0x3D8B5C, dims:[0.9,1.1,0.6], label:true},
  chips:{shape:'box', color:0xE8A93B, dims:[1,1.3,0.6], bagTop:true, label:true},
};
// A small emoji-on-a-card label stuck to the front face of a boxed/bagged/canned product,
// so packaged goods read as "a box OF something" instead of an anonymous colored block.
function addProductLabel(g, x, y, z, baseId, size) {
  const base = BASE_INGREDIENTS.find(b => b.id === baseId);
  const cv = document.createElement('canvas'); cv.width = 48; cv.height = 48;
  const cx = cv.getContext('2d');
  cx.fillStyle = 'rgba(255,255,255,0.92)'; cx.fillRect(3, 3, 42, 42);
  cx.font = '26px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText(base ? base.emoji : '❓', 24, 25);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
  plane.position.set(x, y, z);
  g.add(plane);
}
// Builds one real-shaped product item sitting on a shelf. g/x/z are the same LOCAL group/coords
// every other piece in this room uses; shelfTopY is the shelf surface the item's base sits on.
// size is the item's rough scale (~0.16-0.22, the old "cube size"); jitterSeed lightens/darkens
// the color a little per-item so a full shelf of the same product doesn't look perfectly cloned.
function addProductItem(g, x, shelfTopY, z, baseId, size, jitterSeed) {
  const spec = PRODUCT_SHAPES[baseId] || { shape: 'box', color: 0x9a9a9a };
  let color = spec.color;
  if (jitterSeed !== undefined) {
    const hsl = {};
    new THREE.Color(color).getHSL(hsl);
    const j = ((jitterSeed % 10) - 5) * 0.02;
    color = new THREE.Color().setHSL(hsl.h, hsl.s, Math.min(0.85, Math.max(0.15, hsl.l + j))).getHex();
  }
  const s = size;
  const mkP = (geo, col, dx, dy, dz) => {
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: col }));
    m.position.set(x + dx, shelfTopY + dy, z + dz);
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
    return m;
  };
  switch (spec.shape) {
    case 'sphere': {
      const r = s, squash = spec.squash || 1;
      let baseY = r * squash;
      if (spec.stem && spec.stemPos === 'bottom') {
        const stemH = r * 0.7;
        mkP(new THREE.CylinderGeometry(r * 0.22, r * 0.22, stemH, 6), spec.stem, 0, stemH / 2, 0);
        baseY = stemH + r * squash * 0.8;
      }
      const sph = mkP(new THREE.SphereGeometry(r, 7, 6), color, 0, baseY, 0);
      sph.scale.y = squash;
      if (spec.stem && spec.stemPos !== 'bottom') {
        mkP(new THREE.ConeGeometry(r * 0.22, r * 0.4, 5), spec.stem, 0, baseY + r * squash - r * 0.15, 0);
      }
      break;
    }
    case 'cone': { // point-down cone (carrot, strawberry) — apex touches the shelf, wide end on top
      const rTop = s * 0.55, h = s * 1.6;
      const cone = mkP(new THREE.ConeGeometry(rTop, h, 6), color, 0, h / 2, 0);
      cone.rotation.x = Math.PI;
      if (spec.stem) mkP(new THREE.ConeGeometry(rTop * 0.35, rTop * 0.6, 5), spec.stem, 0, h - rTop * 0.1, 0);
      break;
    }
    case 'cone-scoop': { // ice cream — same point-down cone, plus a scoop sphere on top
      const rTop = s * 0.5, h = s * 1.5;
      const cone = mkP(new THREE.ConeGeometry(rTop, h, 7), color, 0, h / 2, 0);
      cone.rotation.x = Math.PI;
      mkP(new THREE.SphereGeometry(rTop * 1.05, 8, 6), spec.accent || color, 0, h + rTop * 0.7, 0);
      break;
    }
    case 'cylinder': {
      const r = s * 0.55, h = spec.flat ? s * 0.5 : s * 1.7;
      mkP(new THREE.CylinderGeometry(r, r, h, 8), color, 0, h / 2, 0);
      if (spec.accent) mkP(new THREE.CylinderGeometry(r * 1.02, r * 1.02, h * 0.18, 8), spec.accent, 0, h * 0.12, 0);
      if (spec.lid) mkP(new THREE.CylinderGeometry(r * 0.9, r * 0.9, h * 0.12, 8), spec.lid, 0, h + h * 0.06, 0);
      if (spec.label) addProductLabel(g, x, shelfTopY + h * 0.55, z + r + 0.005, baseId, r * 1.5);
      break;
    }
    case 'wedge': { // triangular-prism cheese wedge — a 3-sided cylinder is a wedge block
      const r = s * 0.75, len = s * 1.3;
      const w = mkP(new THREE.CylinderGeometry(r, r, len, 3), color, 0, r * 0.85, 0);
      w.rotation.z = Math.PI / 2;
      w.rotation.y = Math.PI / 6;
      break;
    }
    case 'carton': { // milk/eggs — a box with a small cap/spout block; eggs peek out white domes
      const w = s * 1.1, h = s * 1.6, d = s * 1.0;
      mkP(new THREE.BoxGeometry(w, h, d), color, 0, h / 2, 0);
      mkP(new THREE.BoxGeometry(w * 0.5, h * 0.18, d * 0.5), spec.accent || color, 0, h + h * 0.09, 0);
      if (spec.eggTop) [-w * 0.2, w * 0.2].forEach(ox => mkP(new THREE.SphereGeometry(s * 0.22, 6, 5), 0xffffff, ox, h + s * 0.16, 0));
      break;
    }
    case 'curved': { // banana/shrimp — a tilted tapered cylinder
      const r = s * 0.35, h = s * 1.6;
      const m = mkP(new THREE.CylinderGeometry(r * 0.6, r, h, 6), color, 0, h / 2, 0);
      m.rotation.z = 0.35;
      break;
    }
    case 'cluster': { // grapes — a little pyramid of small spheres
      const r = s * 0.35;
      [[0, 0, 0], [r * 1.3, 0, r * 0.4], [-r * 1.3, 0, r * 0.4], [r * 0.7, -r * 1.1, -r * 0.3], [-r * 0.7, -r * 1.1, -r * 0.3], [0, -r * 1.9, 0.1]]
        .forEach(([ox, oy, oz]) => mkP(new THREE.SphereGeometry(r, 6, 5), color, ox, r * 1.9 + oy, oz));
      break;
    }
    case 'mushroom': {
      const stemH = s * 0.9, stemR = s * 0.22;
      mkP(new THREE.CylinderGeometry(stemR, stemR, stemH, 6), 0xF0EAD6, 0, stemH / 2, 0);
      mkP(new THREE.SphereGeometry(s * 0.55, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), color, 0, stemH, 0);
      break;
    }
    case 'ring': { // pretzel
      const ring = mkP(new THREE.TorusGeometry(s * 0.5, s * 0.17, 6, 10), color, 0, s * 0.55, 0);
      ring.rotation.x = Math.PI / 2;
      break;
    }
    case 'box': default: {
      const dims = spec.dims || [1, 1, 1];
      const w = s * 1.3 * dims[0], h = s * 1.3 * dims[1], d = s * 1.2 * dims[2];
      mkP(new THREE.BoxGeometry(w, h, d), color, 0, h / 2, 0);
      if (spec.bagTop) {
        const top = mkP(new THREE.BoxGeometry(w * 0.75, h * 0.22, d * 0.7), color, 0, h + h * 0.09, 0);
        top.rotation.z = 0.25;
      }
      if (spec.label) addProductLabel(g, x, shelfTopY + h * 0.5, z + d / 2 + 0.005, baseId, Math.min(w, h) * 0.85);
      break;
    }
  }
}

// A simple standing staff figure behind a counter — g/mk match everything else in this room
// (mk(w,h,d,color,dx,dy,dz) adds a LOCAL-space box to g); name shows on a small floating tag.
function addStaffFigure(g, mk, x, z, name) {
  const skin = 0xE8B87A, shirt = 0x557799, apron = 0xf5f0e0;
  mk(0.5, 0.9, 0.3, shirt, x, 0.75, z);          // body
  mk(0.42, 0.55, 0.06, apron, x, 0.55, z + 0.16); // apron
  mk(0.4, 0.4, 0.4, skin, x, 1.35, z);            // head
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 40;
  const cx = cv.getContext('2d');
  cx.fillStyle = 'rgba(0,0,0,0.7)'; cx.fillRect(0, 0, 128, 40);
  cx.fillStyle = '#fff'; cx.font = 'bold 16px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText('👤 ' + name, 64, 20);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.32), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
  tag.position.set(x, 1.75, z);
  g.add(tag);
}

// ─── STORE 3D MODELS — shelf unit, exterior facade dressing, interior layout dressing ──
// g: THREE.Group to add meshes to (already positioned in the room, so use LOCAL coords)
// x, z: local floor position for this shelf unit (baseline y=0)
// ing: {id, name, emoji, price, taste} — the ingredient stocked here
// count: current stock number (0 = empty)
function buildShelfUnit(g, x, z, ing, count) {
  ing = ing || { id: 'unknown', name: 'Unknown Item', emoji: '❓', price: 0, taste: '' };
  count = count || 0;

  // small deterministic string hash so colors/jitter are stable per-ingredient (not random each rebuild)
  const hashStr = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  };

  const addBox = (w, h, d, color, dx, dy, dz) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
    mesh.position.set(dx, dy, dz);
    mesh.castShadow = true; mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  };

  // ─── frame: base plinth, 2 side posts, 2 shelf boards, top cap ───
  const UNIT_W = 1.6, UNIT_D = 0.5, POST_H = 1.5;
  const LOWER_Y = 0.55, UPPER_Y = 1.15;
  const postColor = 0x6b4423, boardColor = 0x8B5A2B, plinthColor = 0x5c3a1e;

  addBox(UNIT_W, 0.06, UNIT_D + 0.05, plinthColor, x, 0.03, z);              // base plinth (foot, grounds the unit)
  addBox(0.08, POST_H, 0.08, postColor, x - 0.72, POST_H / 2, z);            // left side post
  addBox(0.08, POST_H, 0.08, postColor, x + 0.72, POST_H / 2, z);            // right side post
  addBox(1.5, 0.05, UNIT_D, boardColor, x, LOWER_Y, z);                      // lower shelf board
  addBox(1.5, 0.05, UNIT_D, boardColor, x, UPPER_Y, z);                      // upper shelf board
  addBox(UNIT_W, 0.05, UNIT_D + 0.05, boardColor, x, POST_H - 0.025, z);     // top cap board

  // ─── real product shapes on the upper shelf, one row, count-driven so stock is visible at a glance ───
  // Up to 6 items shown; more than that (count>6) is still visible on the price tag as a number.
  const n = Math.min(count, 6);
  if (n > 0) {
    const shelfTopY = UPPER_Y + 0.025;
    const spanW = 1.2;
    const step = n > 1 ? spanW / (n - 1) : 0;
    for (let i = 0; i < n; i++) {
      const px = n > 1 ? -spanW / 2 + i * step : 0;
      const pz = z + (i % 2 === 0 ? -0.04 : 0.04); // slight front/back stagger so the row isn't robotic
      const size = 0.16 + (hashStr(ing.id + '_s' + i) % 5) * 0.015; // 0.16 - 0.22
      addProductItem(g, x + px, shelfTopY, pz, ing.baseId, size, hashStr(ing.id + '_l' + i));
    }
  }
  // count === 0 -> no products added, shelf stays visibly bare.

  // ─── tilted price-tag placard, standing at the front edge of the lower shelf ───
  const cv = document.createElement('canvas'); cv.width = 200; cv.height = 140;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#fffbe8'; cx.fillRect(0, 0, 200, 140);
  cx.strokeStyle = '#333'; cx.lineWidth = 4; cx.strokeRect(2, 2, 196, 136);
  cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.font = '46px Arial';
  cx.fillText(ing.emoji, 100, 40);
  cx.fillStyle = '#222'; cx.font = 'bold 16px Arial';
  const displayName = ing.name.length > 16 ? ing.name.slice(0, 15) + '…' : ing.name;
  cx.fillText(displayName, 100, 80);
  cx.fillStyle = '#0a7a2f'; cx.font = 'bold 20px Arial';
  cx.fillText('$' + ing.price, 100, 105);
  cx.fillStyle = count > 0 ? '#0a7a2f' : '#b02020';
  cx.font = 'bold 14px Arial';
  cx.fillText(count > 0 ? (count + ' in stock') : 'EMPTY', 100, 126);

  const tex = new THREE.CanvasTexture(cv);
  const placard = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.35),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  placard.position.set(x, LOWER_Y + 0.025 + 0.175, z + UNIT_D / 2 + 0.03);
  placard.rotation.x = -0.3; // leans back slightly like a real shelf-edge price tag stand
  g.add(placard);
}

// g: THREE.Group the main store building is already added to (LOCAL coords, since g gets positioned once at the end)
// mkBox(w,h,d,color,dx,dy,dz): helper defined by the caller — builds a BoxGeometry mesh, adds it to g
// def: the store tier definition {id, name, price, size, floors, furnished}
// sz: {w, d, fh} for this tier's footprint; totalH: total building height (fh * floors)
function buildStoreFacade(g, mkBox, def, sz, totalH) {
  const isKiosk = def.size === 'small' && !def.furnished; // bare-bones smallest tier — trim back the decor
  const scale = sz.w / 14;                 // 1.0 at the "medium" footprint; shrinks on kiosk, grows on large/xlarge
  const frontZ = sz.d/2 + 0.16;            // matches the existing glass-front pane's z offset

  // Striped awning/canopy over the entrance — teal/cream is an original combo (deliberately
  // not Shopee orange or any single real chain's palette).
  const awningY = sz.fh * 0.62;
  const awningDepth = isKiosk ? 1.1 : 1.6;
  const slatW = Math.max(0.8, (sz.w - 2) / 8);
  const slatCount = Math.max(2, Math.round((sz.w - 2) / slatW));
  for (let i = 0; i < slatCount; i++) {
    const sx = -sz.w/2 + 1 + slatW/2 + i*slatW;
    const stripeColor = (i % 2 === 0) ? 0x1FA6A0 : 0xFFF6E5; // teal / cream stripes
    const slat = mkBox(slatW - 0.05, 0.18, awningDepth, stripeColor, sx, awningY, frontZ + awningDepth/2 - 0.05);
    slat.rotation.x = -0.12;
  }
  mkBox(sz.w - 1.8, 0.12, 0.12, 0x14403E, 0, awningY - 0.5, frontZ + awningDepth - 0.1); // fascia trim

  // Planter boxes flanking the entrance
  if (!isKiosk) {
    const planterOffset = Math.min(sz.w/2 - 0.8, 3.2 + (sz.w - 14) * 0.15);
    [-1, 1].forEach(side => {
      const px = side * planterOffset;
      mkBox(1.1*scale + 0.5, 0.7, 1.1*scale + 0.5, 0x8B5A3C, px, 0.35, frontZ + 0.6);
      mkBox(0.9*scale + 0.3, 0.6, 0.9*scale + 0.3, 0x2E7D46, px, 0.95, frontZ + 0.6);
    });
  } else {
    mkBox(0.8, 0.55, 0.8, 0x8B5A3C, sz.w/2 - 1, 0.28, frontZ + 0.5);
    mkBox(0.6, 0.5, 0.6, 0x2E7D46, sz.w/2 - 1, 0.78, frontZ + 0.5);
  }

  // Entrance step / floor mat
  const matW = Math.min(sz.w - 2, 4 + (sz.w - 10) * 0.3);
  mkBox(matW, 0.08, 1.4, 0x5B3A29, 0, 0.04, frontZ + 0.9);

  // Small illuminated secondary sign board — distinct from the big floating name sign
  const boardW = isKiosk ? 0.9 : 1.3;
  const boardH = isKiosk ? 0.6 : 0.9;
  const boardX = sz.w/2 - boardW/2 - 0.3;
  const boardY = Math.min(totalH - 0.6, 2.1);
  mkBox(boardW, boardH, 0.08, 0x0E2E4D, boardX, boardY, frontZ + 0.06);
  mkBox(boardW - 0.14, boardH - 0.14, 0.1, 0xFFE28A, boardX, boardY, frontZ + 0.1);

  // Shopping-cart corral — only once the store is big enough to plausibly stock carts
  if (sz.w >= 14) {
    const corralX = -Math.min(sz.w/2 - 1.4, 5);
    const corralZ = frontZ + 2.4;
    const barColor = 0xBFC4C8;
    [-0.9, 0.9].forEach(dz => mkBox(0.06, 0.9, 0.06, barColor, corralX - 0.9, 0.45, corralZ + dz));
    [-0.9, 0.9].forEach(dz => mkBox(0.06, 0.9, 0.06, barColor, corralX + 0.9, 0.45, corralZ + dz));
    mkBox(1.9, 0.06, 0.06, barColor, corralX, 0.85, corralZ - 0.9);
    mkBox(1.9, 0.06, 0.06, barColor, corralX, 0.85, corralZ + 0.9);
    mkBox(1.9, 0.06, 0.06, barColor, corralX, 0.15, corralZ - 0.9);
    mkBox(1.9, 0.06, 0.06, barColor, corralX, 0.15, corralZ + 0.9);
  }
}

// g: THREE.Group the room is already built inside (LOCAL coords); mk = local box helper
// roomW, roomD: this store's current interior room width/depth
function buildStoreLayoutExtras(g, mk, roomW, roomD) {
  function makeCanvasTexture(w, h, draw) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d');
    draw(cx, w, h);
    return new THREE.CanvasTexture(cv);
  }

  // ── checkerboard floor tile overlay, laid just above the existing plain floor box ──
  const tileTex = makeCanvasTexture(64, 64, (cx) => {
    cx.fillStyle = '#d9d2c0'; cx.fillRect(0, 0, 64, 64);
    cx.fillStyle = '#b9ab8c';
    cx.fillRect(0, 0, 32, 32);
    cx.fillRect(32, 32, 32, 32);
  });
  tileTex.wrapS = THREE.RepeatWrapping;
  tileTex.wrapT = THREE.RepeatWrapping;
  tileTex.repeat.set(Math.max(2, Math.round(roomW / 1.5)), Math.max(2, Math.round(roomD / 1.5)));
  const floorTiles = new THREE.Mesh(
    new THREE.PlaneGeometry(roomW, roomD),
    new THREE.MeshLambertMaterial({ map: tileTex })
  );
  floorTiles.rotation.x = -Math.PI / 2;
  floorTiles.position.set(0, 0.305, 0);
  floorTiles.receiveShadow = true;
  g.add(floorTiles);

  // Welcome mat decal near the door — only drawn once its near edge can't possibly reach the manager trigger circle
  const matZ = roomD / 2 - 1.7;
  if ((matZ - 0.7) - 2 > 2.5) {
    const matTex = makeCanvasTexture(128, 64, (cx, w, h) => {
      cx.fillStyle = '#7a3b2e'; cx.fillRect(0, 0, w, h);
      cx.fillStyle = '#c98a5b'; cx.fillRect(6, 6, w - 12, h - 12);
      cx.fillStyle = '#3a2018'; cx.font = 'bold 16px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText('WELCOME', w / 2, h / 2);
    });
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.4), new THREE.MeshBasicMaterial({ map: matTex }));
    mat.rotation.x = -Math.PI / 2;
    mat.position.set(0, 0.31, matZ);
    g.add(mat);
  }

  // ── checkout-style counter dressing — stays within the existing counter footprint ──
  function dressCounter(cx, cz, baseColor) {
    mk(2.0, 0.3, 0.5, baseColor, cx, 1.15, cz - 0.25);          // raised back ledge
    mk(0.55, 0.35, 0.4, 0x333333, cx + 0.45, 1.48, cz - 0.35);  // register/till body
    const screen = mk(0.32, 0.22, 0.05, 0x224466, cx + 0.45, 1.68, cz - 0.55);
    screen.rotation.x = -0.3;
    mk(2.1, 1.3, 0.12, 0xe8e2d5, cx, 0.65, cz + 0.56);          // front kick-panel
    mk(2.1, 0.15, 0.14, baseColor, cx, 1.05, cz + 0.57);        // accent stripe
    const signTex = makeCanvasTexture(160, 64, (sc) => {
      sc.fillStyle = 'rgba(20,20,20,0.85)'; sc.fillRect(0, 0, 160, 64);
      sc.fillStyle = '#ffd54a'; sc.font = 'bold 22px Arial'; sc.textAlign = 'center'; sc.textBaseline = 'middle';
      sc.fillText('CHECKOUT', 80, 32);
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.6), new THREE.MeshBasicMaterial({ map: signTex, transparent: true }));
    sign.position.set(cx, 2.3, cz - 0.2);
    g.add(sign);
  }
  dressCounter(-3, -4, 0x8B5A2B); // ingredients counter
  dressCounter(3, -4, 0x557799);  // furniture counter

  // ── hanging ceiling light fixtures, scaled to stay inside the walls at every store tier ──
  const lightSpots = [
    { x: -roomW * 0.22, z: -roomD * 0.25 },
    { x: roomW * 0.22, z: -roomD * 0.25 },
    { x: -roomW * 0.22, z: roomD * 0.20 },
    { x: roomW * 0.22, z: roomD * 0.20 },
  ];
  lightSpots.forEach(({ x, z }) => {
    mk(0.06, 0.25, 0.06, 0x555555, x, 4.93, z);
    mk(0.8, 0.15, 0.8, 0x333333, x, 4.80, z);
    mk(0.55, 0.06, 0.55, 0xfff8dc, x, 4.71, z);
  });

  // ── basket/cart stack near the entrance, tucked clear of the door gap and all trigger circles ──
  const bx = roomW / 2 - 0.9;
  const bz = roomD / 2 - 1.3;
  const cartGeo = new THREE.BoxGeometry(0.7, 0.5, 0.5);
  const cartWire = new THREE.LineSegments(
    new THREE.EdgesGeometry(cartGeo),
    new THREE.LineBasicMaterial({ color: 0x88aa88 })
  );
  cartWire.position.set(bx, 0.35, bz - 0.4);
  g.add(cartWire);
  mk(0.5, 0.2, 0.4, 0x3fae5c, bx, 0.15, bz + 0.4);
  mk(0.42, 0.18, 0.34, 0xd23f3f, bx, 0.33, bz + 0.4);
  mk(0.36, 0.16, 0.3, 0x3f7fd2, bx, 0.5, bz + 0.4);

  // ── "WELCOME" sign over the doorway ──
  const openTex = makeCanvasTexture(256, 96, (cx) => {
    cx.fillStyle = '#1c1c1c'; cx.fillRect(0, 0, 256, 96);
    cx.strokeStyle = '#ffffff'; cx.lineWidth = 4; cx.strokeRect(6, 6, 244, 84);
    cx.fillStyle = '#3fe25a'; cx.font = 'bold 36px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('WELCOME', 128, 50);
  });
  const openSign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.85), new THREE.MeshBasicMaterial({ map: openTex, transparent: true }));
  openSign.position.set(0, 4.3, roomD / 2 - 0.18);
  g.add(openSign);
}

// Builds (or rebuilds) the player's owned store at STORE_PLOT. Safe to call with no store
// owned — it just clears whatever was there before and leaves the plot empty.
function buildOwnedStore(){
  if(storeGroup){ scene.remove(storeGroup); storeGroup=null; }
  if(storeSignMesh){ scene.remove(storeSignMesh); storeSignMesh=null; }
  storeCustomerNPCs.forEach(npc => {
    scene.remove(npc.group);
    const i = npcs.indexOf(npc); if(i>-1) npcs.splice(i,1);
  });
  storeCustomerNPCs = [];
  if(window._storeColIdx != null){ CITY_COLS.splice(window._storeColIdx,1); window._storeColIdx=null; }

  if(!ownedStore) return;
  const def = STORE_CATALOG.find(s => s.id === ownedStore.id);
  const sz = STORE_SIZES[def.size];
  const {x,z} = STORE_PLOT;
  const totalH = sz.fh * def.floors;

  const g = new THREE.Group();
  const mkBox=(w,h,d,color,dx,dy,dz)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color}));
    m.position.set(dx,dy,dz); m.castShadow=true; m.receiveShadow=true; g.add(m); return m;
  };
  const wallColor = def.furnished ? 0xD8A657 : 0xB0B0B0;
  mkBox(sz.w, totalH, sz.d, wallColor, 0, totalH/2, 0);              // main body
  mkBox(sz.w+1, 0.5, sz.d+1, 0x333333, 0, totalH+0.25, 0);            // roof
  mkBox(sz.w-2, totalH-1, 0.3, 0xAEE3FF, 0, totalH/2, sz.d/2+0.16);   // glass front
  if(def.floors===2) mkBox(sz.w+0.4, 0.3, sz.d+0.4, 0x333333, 0, sz.fh, 0); // floor divider band
  if(def.furnished)  mkBox(sz.w-4, 1.2, 1, 0x8B5A2B, 0, 1.2, sz.d/2-1.5);   // shelf visible through the glass
  buildStoreFacade(g, mkBox, def, sz, totalH);
  g.position.set(x,0,z);
  scene.add(g);
  storeGroup = g;
  buildSign('🏪 ' + (ownedStore.customName || def.name), x, totalH+1.4, z+sz.d/2+0.2);

  window._storeColIdx = CITY_COLS.length;
  addCol(CITY_COLS, x, z, sz.w/2, sz.d/2);

  // Customer NPCs patrol between the sidewalk and the door, giving the "people shopping" look
  const doorZ = z + sz.d/2 + 3;
  [-4, 4].forEach((ox,i) => {
    const cdef = {
      name:'Shopper'+(i+1), role:'Customer', skin: i===0?0xe0b080:0xc07840, shirt:0x557799, pants:0x333333,
      pos:[x+ox, 0, doorZ+6],
      patrol:[[x+ox, doorZ+6],[x, doorZ],[x+ox, doorZ+6],[x-ox, doorZ+6]],
      hair: i===0 ? 'short' : 'long', hairColor:0x2a1505,
    };
    const npc = makeNPC(cdef);
    npcs.push(npc);
    storeCustomerNPCs.push(npc);
  });

  buildStoreInterior();
  updateStoreSign();
}

// Rebuilds the walk-in interior at STORE_INTERIOR. Room size follows the current store's
// tier; furniture pieces are placed at their fixed slot so they never overlap.
function buildStoreInterior(){
  if(storeInteriorGroup){ scene.remove(storeInteriorGroup); storeInteriorGroup=null; }
  if(!ownedStore) return;
  const def = STORE_CATALOG.find(s => s.id === ownedStore.id);
  const sz = STORE_SIZES[def.size];
  const roomW = sz.w, roomD = currentRoomDepth(); // a bit deeper than the exterior footprint for walking room + shelves

  const g = new THREE.Group();
  const mk=(w,h,d,color,dx,dy,dz)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color}));
    m.position.set(dx,dy,dz); m.castShadow=true; m.receiveShadow=true; g.add(m); return m;
  };
  mk(roomW, 0.3, roomD, 0xc8aa80, 0, 0.15, 0);          // floor
  mk(roomW, 0.2, roomD, 0xf5f0e8, 0, 5, 0);             // ceiling
  mk(roomW, 5, 0.3, 0xf5efe0, 0, 2.5, -roomD/2);        // back wall
  mk(7, 5, 0.3, 0xf5efe0, -roomW/2+3.5, 2.5, roomD/2);  // front wall left (door gap between)
  mk(7, 5, 0.3, 0xf5efe0,  roomW/2-3.5, 2.5, roomD/2);  // front wall right
  mk(0.3, 5, roomD, 0xf5efe0, -roomW/2, 2.5, 0);        // left wall
  mk(0.3, 5, roomD, 0xf5efe0,  roomW/2, 2.5, 0);        // right wall

  // Windows — can't literally see the outside city (this room is its own teleported space,
  // same trick your House/Hotel use), so these are a painted sky/street scene instead
  const winTex = buildWindowSceneTexture();
  [-roomD/4, roomD/4].forEach(wz => {
    [-roomW/2+0.2, roomW/2-0.2].forEach(wx => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.8), new THREE.MeshBasicMaterial({map:winTex}));
      win.position.set(wx, 2.8, wz);
      win.rotation.y = wx<0 ? Math.PI/2 : -Math.PI/2;
      g.add(win);
    });
  });

  // Counter blocks — visual markers matching STORE_ZONES' fixed trigger positions
  mk(2, 1, 1, 0x8B5A2B, -3, 0.5, -4);  // ingredients counter
  mk(2, 1, 1, 0x557799,  3, 0.5, -4);  // furniture counter

  // Ingredient shelves — one labeled shelf per type, showing what's stocked there and how many
  getShelfSlots().forEach(slot => {
    const lp = shelfLocalPos(slot, roomD);
    const ing = STORE_INGREDIENTS.find(i => i.id === slot.id);
    const count = storeStock[slot.id] || 0;
    buildShelfUnit(g, lp.x, lp.z, ing, count);
  });

  // Owned furniture — one fixed slot per piece, so pieces never overlap regardless of order bought
  ownedFurniture.forEach(fid => {
    const f = FURNITURE_CATALOG.find(x => x.id === fid);
    if(!f) return;
    mk(1.2, 1, 1, 0xAA8855, f.slot.x, 0.6, f.slot.z);
  });

  buildStoreLayoutExtras(g, mk, roomW, roomD);

  // Hired staff stand behind the two counters — a visible reason the shop can run without you
  const staffSpots = [{x:-3, z:-4.35}, {x:3, z:-4.35}];
  ownedStaff.forEach((staff, i) => {
    if(staffSpots[i]) addStaffFigure(g, mk, staffSpots[i].x, staffSpots[i].z, staff.name);
  });

  g.position.set(STORE_INTERIOR.x, 0, STORE_INTERIOR.z);
  scene.add(g);
  storeInteriorGroup = g;
}
// A simple painted "looking outside" scene reused for every window pane
let _windowSceneTexture = null;
function buildWindowSceneTexture(){
  if(_windowSceneTexture) return _windowSceneTexture;
  const cv = document.createElement('canvas'); cv.width=256; cv.height=180;
  const c = cv.getContext('2d');
  const sky = c.createLinearGradient(0,0,0,180);
  sky.addColorStop(0,'#87CEEB'); sky.addColorStop(1,'#c8e8f5');
  c.fillStyle=sky; c.fillRect(0,0,256,180);
  c.fillStyle='#5a9e3c'; c.fillRect(0,140,256,40); // ground strip
  c.fillStyle='#ffffff';
  [[30,40,18],[70,55,14],[190,35,20],[220,50,12]].forEach(([x,y,r])=>{ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); });
  c.fillStyle='#ffdd55'; c.beginPath(); c.arc(220,30,16,0,Math.PI*2); c.fill(); // sun
  _windowSceneTexture = new THREE.CanvasTexture(cv);
  return _windowSceneTexture;
}

// ─── COUNTRY ZONES ────────────────────────────────────────────────────────────
// ─── COUNTRY TOWN THEMES ──────────────────────────────────────────────────────
// Instead of writing shop/park/lamp code 8 separate times (once per country),
// we write it ONCE in buildTownExtras() and feed it a different "theme" object
// for each country. Same function, different data in = different town out.
const COUNTRY_THEMES = [
  { name:'Japan',     cx:600,  cz:-600, wall:0xf5e6d3, roof:0xcc3333, glass:0xffc9dd, tree:0xffaabb, lamp:0xff88aa, shops:['🍣 Sushi Bar','🍜 Ramen Shop','🎎 Kimono Store','🍙 Onigiri Stand','🎏 Origami Studio','🥋 Dojo'] },
  { name:'France',    cx:-600, cz:-600, wall:0xf0e8d8, roof:0x8899bb, glass:0xcfe6ff, tree:0x5c8a4a, lamp:0xffd700, shops:['🥐 Bakery','☕ Café','🎨 Art Shop','🧀 Cheese Shop','🍷 Wine Cellar','👗 Fashion Boutique'] },
  { name:'Brazil',    cx:600,  cz:700,  wall:0xffdd88, roof:0x00aa44, glass:0x9fe8ff, tree:0x22aa33, lamp:0xff8800, shops:['⚽ Soccer Shop','🥥 Juice Bar','🎉 Carnival Store','🎶 Samba Studio','🏖️ Beach Shop','🦜 Rainforest Tours'] },
  { name:'Egypt',     cx:900,  cz:300,  wall:0xe8cf9a, roof:0xcc9944, glass:0xffe9b8, tree:0xb8934a, lamp:0xffdd88, shops:['🏺 Pottery Shop','🐫 Camel Rides','💎 Gem Market','🌶️ Spice Market','📜 Papyrus Shop','⛵ Nile Cruise Booth'] },
  { name:'UK',        cx:-700, cz:-700, wall:0x9aabcc, roof:0x667799, glass:0xcfe0ff, tree:0x4a7a4a, lamp:0xaabbcc, shops:['🫖 Tea House','📚 Book Shop','☂️ Umbrella Store','🎻 Music Hall','🍺 Pub','🎩 Hat Shop'] },
  { name:'Australia', cx:800,  cz:-200, wall:0xf5f5f5, roof:0xffcc00, glass:0xbfe8ff, tree:0x2d7a2d, lamp:0xffbb44, shops:['🏄 Surf Shop','🍬 Candy Shack','🐨 Wildlife Store','🦘 Outback Tours','🥧 Meat Pie Shop','🏊 Dive Shop'] },
  { name:'Canada',    cx:-600, cz:400,  wall:0xffffff, roof:0xcc2222, glass:0xcfe6ff, tree:0x1a7a1a, lamp:0xff4444, shops:['🏒 Hockey Shop','🥞 Pancake House','🧣 Winter Gear','🍁 Maple Syrup Shop','🎣 Fishing Store','🛶 Canoe Rentals'] },
  { name:'Italy',     cx:0,    cz:-900, wall:0xddb870, roof:0xcc9944, glass:0xffe0b0, tree:0x2d7a2d, lamp:0xffcc88, shops:['🍝 Pasta House','🍦 Gelato Shop','🎭 Mask Shop','🍷 Vineyard Shop','🏛️ Museum Gift Shop','🚤 Gondola Rides'] },
];

// A real city now, not a one-block "little town": a plaza, TWO rows of named shops (6 total, up
// from 3), a filler skyline of varied-height apartment/office towers flanking both sides, a bigger
// park, and a longer lit street — every country got the same real upgrade, not a cosmetic tweak
// to just one. Deliberately kept the filler towers UNNAMED/non-interactive (real named shops still
// come from COUNTRY_THEMES.shops) so the "6 real shops per country" count stays honest, not padded.
function buildTownExtras(t){
  const {cx,cz,wall,roof,glass,tree,lamp,shops}=t;
  // Stone plaza pad behind the landmark — widened/lengthened for the bigger city behind it.
  // NOTE: France and UK's landmarks sit only 141 units apart (the closest of any two countries) —
  // every distance below was sized and then verified (live bounding-box check) to keep that closest
  // pair clear, which automatically keeps every other, much-further-apart pair clear too.
  box(64,0.08,52, 0x999988, cx,0.04,cz+38);

  // Two rows of 3 named shops each (6 real distinct shops per country)
  shops.forEach((name,i)=>{
    const row = i < 3 ? 0 : 1;
    const col = i % 3;
    const sx = cx-16+col*16, sz = cz+34+row*14;
    box(11,8,11, wall, sx,4,sz);          // shop body
    box(11,0.5,11, roof, sx,8.3,sz);      // roof cap
    box(4,6,0.3, glass, sx,3,sz-5.6);     // glass front
    buildSign(name, sx,9,sz-6);
    addCol(CITY_COLS, sx,sz, 5.5,5.5);
  });

  // Filler skyline — varied-height towers flanking both sides of the shop blocks, real windows.
  // The LAST slot on each side (i%4===3) is skipped here and built as a real Airport/Hotel below
  // instead — same verified-safe footprint a filler tower would have used, so swapping in a real
  // named building there adds zero new overlap risk with the neighboring country's city.
  const winMat = new THREE.MeshBasicMaterial({color:0xffee99});
  [-30,-30,-30,-30, 30,30,30,30].forEach((dx,i)=>{
    if (i%4 === 3) return;
    const dz = cz + 16 + (i%4)*13;
    const h = 12 + ((i*37) % 22); // deterministic pseudo-variety, no Math.random() needed for a stable skyline
    box(9,h,9, wall, cx+dx,h/2,dz);
    box(9.4,0.4,9.4, roof, cx+dx,h+0.2,dz);
    for(let wRow=0; wRow*3+2<h; wRow+=3){
      const win = new THREE.Mesh(new THREE.BoxGeometry(7.2,1.2,0.1), winMat);
      win.position.set(cx+dx, wRow+2, dz-4.55);
      scene.add(win);
    }
    addCol(CITY_COLS, cx+dx,dz, 4.5,4.5);
  });

  // A real Airport + a real Hotel per country (item 154) — reusing the (-30/+30, dz+55) slot
  // the filler loop above deliberately skipped.
  const apX = cx-30, apZ = cz+16+3*13, htX = cx+30, htZ = apZ;
  box(9,3,9, 0xcccccc, apX,1.5,apZ);
  box(1.6,6,1.6, 0x888888, apX,6,apZ);
  { const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,8), new THREE.MeshBasicMaterial({color:0xff3333})); bulb.position.set(apX,9.2,apZ); scene.add(bulb);
    const pl=new THREE.PointLight(0xff3333,0.8,14); pl.position.set(apX,9.2,apZ); scene.add(pl); }
  buildSign(`✈️ ${t.name} Airport`, apX,5,apZ-5.2);
  addCol(CITY_COLS, apX,apZ, 4.5,4.5);
  CITY_ZONES.push({ x:apX, z:apZ-4.6, r:3.2, label:`✈️ ${t.name} Airport`, action: () => enterAirportLounge(t.name, apX, apZ-8, false) });

  box(9,10,9, 0xddccbb, htX,5,htZ);
  box(9.4,0.4,9.4, 0x8a6a4a, htX,10.2,htZ);
  buildSign(`🏨 ${t.name} Hotel`, htX,11,htZ-5.2);
  addCol(CITY_COLS, htX,htZ, 4.5,4.5);
  CITY_ZONES.push({ x:htX, z:htZ-4.6, r:3.2, label:`🏨 ${t.name} Hotel`, action: () => checkinCountryHotel(t.name, htX, htZ-7) });

  // A real park strip down the middle, wider than before
  [[cx-26,cz+14],[cx+26,cz+14],[cx-26,cz+58],[cx+26,cz+58],[cx-26,cz+36],[cx+26,cz+36]].forEach(([tx,tz])=>{
    box(0.6,3.5,0.6, 0x5c3a1e, tx,1.75,tz);
    treeMeshes.push(box(3.4,3.4,3.4, tree, tx,5,tz));
  });

  // Street lamps lining the whole longer plaza, not just flanking the front
  [cz+16, cz+30, cz+44, cz+58].forEach(lz=>{
    [[cx-23,lz],[cx+23,lz]].forEach(([lx])=>{
      box(0.25,6,0.25, 0x444444, lx,3,lz);
      const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.35,8,8), new THREE.MeshBasicMaterial({color:lamp}));
      bulb.position.set(lx,6,lz); scene.add(bulb);
      const pl=new THREE.PointLight(lamp,0.6,16); pl.position.set(lx,5.8,lz); scene.add(pl);
    });
  });
}

function buildCountryZones(){
  // JAPAN — x=600, z=-600
  const jx=600,jz=-600;
  box(20,15,16, 0xf5e6d3, jx,7.5,jz);
  box(24,1.2,20, 0xcc3333, jx,15.8,jz);
  box(22,0.5,18, 0xaa2222, jx,17,jz);
  box(1.5,12,1.5, 0xcc2200, jx-8,6,jz+12); box(1.5,12,1.5, 0xcc2200, jx+8,6,jz+12);
  box(18,1.8,2, 0xcc2200, jx,13,jz+12); box(18,1,1.5, 0xcc2200, jx,11,jz+12);
  [-12,-6,0,6,12].forEach(i=>{ box(0.5,5,0.5,0x4a2800,jx+i,2.5,jz+18); box(5,4,5,0xffaabb,jx+i,6,jz+18); });
  buildSign('🌸 JAPAN',jx,18,jz+10);
  { const pl=new THREE.PointLight(0xff88aa,1.2,50); pl.position.set(jx,8,jz); scene.add(pl); }
  addCol(CITY_COLS,jx,jz,12,10);

  // FRANCE — x=-600, z=-600
  const fx=-600,fz=-600;
  box(16,12,14, 0xf0e8d8, fx,6,fz);
  box(18,0.6,16, 0xddccaa, fx,12.4,fz);
  // Mini Eiffel Tower
  box(14,1.5,14, 0x666677, fx+22,0.75,fz);
  box(9,2,9,    0x666677, fx+22,2.5, fz);
  box(5,2,5,    0x777788, fx+22,4.5, fz);
  box(2,20,2,   0x888899, fx+22,7,   fz);
  box(0.4,8,0.4, 0x999900, fx+22,28, fz);
  { const pl=new THREE.PointLight(0xffd700,1.2,60); pl.position.set(fx+22,18,fz); scene.add(pl); }
  buildSign('🗼 FRANCE',fx,14,fz+8);
  addCol(CITY_COLS,fx,fz,10,9);

  // BRAZIL — x=600, z=700
  const brx=600,brz=700;
  box(22,14,16, 0xffaa00, brx,7,brz);
  box(24,0.6,18, 0x00aa44, brx,14.4,brz);
  box(10,10,10, 0xff4422, brx+18,5,brz);
  box(10,12,10, 0x00aadd, brx-18,6,brz);
  [-12,-6,0,6,12].forEach(i=>{ box(0.5,8,0.5,0x4a2800,brx+i,4,brz+14); box(7,3,7,0x22aa33,brx+i,9,brz+14); });
  buildSign('🌴 BRAZIL',brx,17,brz+10);
  { const pl=new THREE.PointLight(0xff8800,1.5,50); pl.position.set(brx,10,brz); scene.add(pl); }
  addCol(CITY_COLS,brx,brz,13,10);

  // EGYPT — x=900, z=300
  const ex=900,ez=300;
  for(let i=0;i<9;i++){ const s=18-i*1.9; box(s,2,s,0xddb860,ex,i*2+1,ez); }
  box(14,5,7,  0xcc9944, ex+28,2.5,ez);
  box(4,6,4,   0xddb860, ex+35,5.5,ez);
  box(2,3,8,   0xcc9944, ex+25,1,ez);
  buildSign('🏛️ EGYPT',ex,20,ez+10);
  { const pl=new THREE.PointLight(0xffdd88,2.0,70); pl.position.set(ex,12,ez); scene.add(pl); }
  addCol(CITY_COLS,ex,ez,10,10);

  // UK — x=-700, z=-700
  const ux=-700,uz=-700;
  box(20,14,16, 0x8899bb, ux,7,uz);
  box(22,0.5,18, 0x667799, ux,14.4,uz);
  box(2.2,5.5,2.2, 0xdd2222, ux+12,2.8,uz+10);
  box(2.4,0.5,2.4,  0xcc1111, ux+12,5.7,uz+10);
  box(9,45,9,   0x998877, ux-20,22.5,uz);
  box(11,4,11,  0x887766, ux-20,46,uz);
  box(0.6,12,0.6, 0x555544, ux-20,52,uz);
  buildSign('🎡 UK',ux,16,uz+10);
  { const pl=new THREE.PointLight(0xaabbcc,1.2,50); pl.position.set(ux,10,uz); scene.add(pl); }
  addCol(CITY_COLS,ux,uz,12,10);

  // AUSTRALIA — x=800, z=-200
  const ax=800,az=-200;
  box(28,6,18, 0xf0f0f0, ax,3,az);
  box(14,16,10, 0xf5f5f5, ax-6,11,az);
  box(12,12,8,  0xeeeeee, ax+7,9,az);
  box(8,8,6,    0xffffff, ax,6.5,az+10);
  box(0.2,5,3, 0xffcc00, ax+18,2.5,az+8);
  buildSign('🦘 AUSTRALIA',ax,20,az+10);
  { const pl=new THREE.PointLight(0xffbb44,1.5,50); pl.position.set(ax,10,az); scene.add(pl); }
  addCol(CITY_COLS,ax,az,15,11);

  // CANADA — x=-600, z=400
  const cx2=-600,cz2=400;
  box(22,14,16, 0xcc2222, cx2,7,cz2);
  box(24,0.5,18, 0xffffff, cx2,14.4,cz2);
  box(14,10,14, 0xdd3333, cx2+22,5,cz2);
  [-12,-6,0,6,12].forEach(i=>{
    box(0.4,6,0.4,0x2a1400,cx2+i,3,cz2+14);
    box(5,3,5,0x1a5e1a,cx2+i,6.5,cz2+14);
    box(4,2,4,0x1a7a1a,cx2+i,8.5,cz2+14);
    box(2,2,2,0x22aa22,cx2+i,10.5,cz2+14);
  });
  buildSign('🍁 CANADA',cx2,17,cz2+10);
  { const pl=new THREE.PointLight(0xff4444,1.2,50); pl.position.set(cx2,10,cz2); scene.add(pl); }
  addCol(CITY_COLS,cx2,cz2,13,10);

  // ITALY — x=0, z=-900
  const ix=0,iz=-900;
  for(let a=0;a<8;a++){
    const ang=a*Math.PI/4, rx=Math.cos(ang)*20, rz=Math.sin(ang)*20;
    box(5,20,5, 0xddb870, ix+rx,10,iz+rz);
    box(6,2,6,  0xcc9944, ix+rx,21,iz+rz);
  }
  box(0.6,18,42, 0xccaa66, ix,9,iz-20);
  box(0.6,18,42, 0xccaa66, ix,9,iz+20);
  buildSign('🍕 ITALY',ix,24,iz+22);
  { const pl=new THREE.PointLight(0xffcc88,1.8,70); pl.position.set(ix,12,iz); scene.add(pl); }
  addCol(CITY_COLS,ix,iz,22,22);

  // Give every country its own little town (shops + park + lamps)
  COUNTRY_THEMES.forEach(buildTownExtras);
}

// ─── CONTROLS ────────────────────────────────────────────────────────────────
function tryCityJump(){
  if(onGround && !inCar){ jumpVel=13; onGround=false; }
}

function setupControls(){
  setupMobileControls();
  document.addEventListener('keydown',e=>{
    if(e.code==='KeyW') moveState.w=true;
    if(e.code==='KeyS') moveState.s=true;
    if(e.code==='KeyA') moveState.a=true;
    if(e.code==='KeyD') moveState.d=true;
    if(e.code==='KeyE') handleInteract();
    if(e.code==='KeyI'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))) eatIceCream(); }
    if(e.code==='KeyC'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))) eatFromBag(); }
    // Keyboard shortcuts for the side tabs — these work even while the mouse
    // is locked for looking around, since keyboard input isn't affected by
    // Pointer Lock the way mouse clicks are. No need to press Escape first.
    if(e.code==='KeyB'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))) toggleInventory(); }
    if(e.code==='KeyT'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))) toggleSAI(); }
    if(e.code==='KeyM'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))){ const p=document.getElementById('musicPanel'); if(p.style.display==='block') closeMusicPanel(); else openMusicPanel(); } }
    // Shift = run faster; Space = jump (ignore Space while typing in a text field)
    if(e.code==='ShiftLeft'||e.code==='ShiftRight') moveState.run=true;
    if(e.code==='Space'){ const ae=document.activeElement; if(!(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'))){ e.preventDefault(); tryCityJump(); } }
  });
  document.addEventListener('keyup',e=>{
    if(e.code==='KeyW') moveState.w=false;
    if(e.code==='KeyS') moveState.s=false;
    if(e.code==='KeyA') moveState.a=false;
    if(e.code==='KeyD') moveState.d=false;
    if(e.code==='ShiftLeft'||e.code==='ShiftRight') moveState.run=false;
  });
  renderer.domElement.addEventListener('click',()=>renderer.domElement.requestPointerLock());
  document.addEventListener('pointerlockchange',()=>{ isPointerLocked=document.pointerLockElement===renderer.domElement; });
  document.addEventListener('mousemove',e=>{
    if(!isPointerLocked) return;
    yaw-=e.movementX*0.002; pitch-=e.movementY*0.002;
    pitch=Math.max(-0.5,Math.min(1.0,pitch));
  });
  // Resize is already handled by _resizeRenderer() (registered in _startGameInner,
  // includes the ResizeObserver + style-preserving fix) — a second handler used
  // to live here calling the plain renderer.setSize(w,h) with no style guard,
  // which fired on every resize AFTER _resizeRenderer and silently undid it.
}

// ─── MOBILE TOUCH CONTROLS ────────────────────────────────────────────────────
// Two independent touches are tracked by their own identifier: one drags the
// on-screen joystick (movement), the other drags anywhere else on the canvas
// to look around (replaces mouse-look, works with no Pointer Lock needed).
let joyTouchId = null, joyCenterX = 0, joyCenterY = 0;
let lookTouchId = null, lookLastX = 0, lookLastY = 0;

function setupMobileControls(){
  const joyBase     = document.getElementById('joyBase');
  const joyStick    = document.getElementById('joyStick');
  const jumpBtn     = document.getElementById('mobileJumpBtn');
  const interactBtn = document.getElementById('mobileInteractBtn');
  const runBtn      = document.getElementById('mobileRunBtn');
  if(!joyBase) return; // mobile controls markup not present

  function updateJoyStick(cx, cy){
    const r = 45; // max stick travel in px
    const dx = cx - joyCenterX, dy = cy - joyCenterY;
    const dist = Math.min(Math.sqrt(dx*dx + dy*dy), r);
    const angle = Math.atan2(dy, dx);
    const sx = Math.cos(angle) * dist, sy = Math.sin(angle) * dist;
    joyStick.style.transform = `translate(${sx}px, ${sy}px)`;
    const nx = sx / r, ny = sy / r;
    const threshold = 0.3;
    moveState.w = ny < -threshold;
    moveState.s = ny >  threshold;
    moveState.a = nx < -threshold;
    moveState.d = nx >  threshold;
  }
  function resetJoyStick(){
    moveState.w = moveState.a = moveState.s = moveState.d = false;
    joyStick.style.transform = 'translate(0px,0px)';
  }

  joyBase.addEventListener('touchstart', e=>{
    e.preventDefault();
    const t = e.changedTouches[0];
    joyTouchId = t.identifier;
    const r = joyBase.getBoundingClientRect();
    joyCenterX = r.left + r.width/2;
    joyCenterY = r.top + r.height/2;
    updateJoyStick(t.clientX, t.clientY);
  }, {passive:false});

  document.addEventListener('touchmove', e=>{
    for(const t of e.changedTouches){
      if(t.identifier === joyTouchId) updateJoyStick(t.clientX, t.clientY);
      if(t.identifier === lookTouchId){
        const dx = t.clientX - lookLastX, dy = t.clientY - lookLastY;
        yaw -= dx*0.004; pitch -= dy*0.004;
        pitch = Math.max(-0.5, Math.min(1.0, pitch));
        lookLastX = t.clientX; lookLastY = t.clientY;
      }
    }
  }, {passive:true});

  document.addEventListener('touchend', e=>{
    for(const t of e.changedTouches){
      if(t.identifier === joyTouchId){ joyTouchId = null; resetJoyStick(); }
      if(t.identifier === lookTouchId){ lookTouchId = null; }
    }
  });

  // Any touch that lands on the canvas itself (not the joystick or a button,
  // since those are separate elements the touch would never reach here) becomes
  // the look-around touch, if one isn't already active.
  renderer.domElement.addEventListener('touchstart', e=>{
    for(const t of e.changedTouches){
      if(t.identifier === joyTouchId) continue;
      if(lookTouchId === null){
        lookTouchId = t.identifier;
        lookLastX = t.clientX; lookLastY = t.clientY;
      }
    }
  }, {passive:true});

  jumpBtn.addEventListener('touchstart', e=>{ e.preventDefault(); tryCityJump(); });
  interactBtn.addEventListener('touchstart', e=>{ e.preventDefault(); handleInteract(); });
  runBtn.addEventListener('touchstart', e=>{ e.preventDefault(); moveState.run=true; runBtn.classList.add('active'); });
  runBtn.addEventListener('touchend',   e=>{ e.preventDefault(); moveState.run=false; runBtn.classList.remove('active'); });
}

// ─── GAME LOOP ────────────────────────────────────────────────────────────────
const SPEED=8;
let _frames = 0;
function animate(){
  requestAnimationFrame(animate);
  _frames++;
  const _fc = document.getElementById('_dbgFrames');
  if(_fc) _fc.textContent = 'Frames: ' + _frames + ' | canvas: ' + (renderer&&renderer.domElement ? renderer.domElement.width+'x'+renderer.domElement.height : 'none');
  const dt=clock.getDelta(), t=clock.getElapsedTime();

  // Movement with collision
  let moving=false;
  if(!inCar && !playerSeated){
    const dir=new THREE.Vector3();
    const fwd=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
    const right=new THREE.Vector3(-Math.cos(yaw),0,Math.sin(yaw));
    if(moveState.w) dir.add(fwd);
    if(moveState.s) dir.sub(fwd);
    if(moveState.d) dir.add(right);
    if(moveState.a) dir.sub(right);
    moving=dir.length()>0;
    if(moving){
      dir.normalize();
      const step=SPEED*(moveState.run?1.85:1)*dt;
      const nx=playerGroup.position.x+dir.x*step;
      const nz=playerGroup.position.z+dir.z*step;
      if(!isBlocked(nx, playerGroup.position.z)) playerGroup.position.x=nx;
      if(!isBlocked(playerGroup.position.x, nz)) playerGroup.position.z=nz;
      // Every pocket interior (House/Mall/Hotel/Store/FriendHouse/Prison) now lives 10,000+ units
      // out from downtown, so none of them can be subject to the outdoor city's boundary — before
      // this only excluded inHouse/inMall, which silently worked only because Hotel/Store/FriendHouse/
      // Prison used to sit at 750-1200, still inside the old +-1950 clamp by coincidence.
      if(!inHouse && !inMall && !inHotel && !inStore && !inFriendHouse && !inLandHouse && !inCountryHotel && !inAirportLounge && !inPrison && !inArcade){
        playerGroup.position.x=Math.max(-1950,Math.min(1950,playerGroup.position.x));
        playerGroup.position.z=Math.max(-1950,Math.min(1950,playerGroup.position.z));
        const _px=playerGroup.position.x, _pz=playerGroup.position.z;
        // Real bug fix: this used to trigger on ANY _pz below -2.5 with no lower bound — meaning
        // walking the direct route to Whispering Woods (crosses x:73-87 around z=-107 to -131,
        // FAR south of the actual mall doors at z≈-2.5 to -4) got sucked into the mall every time.
        // Bounded to the real doorway/entrance-canopy depth so only actually walking up to the
        // mall's own front door triggers it.
        if(_px>73 && _px<87 && _pz<-2.5 && _pz>-7) enterMall();
      }
      playerGroup.rotation.y=yaw;
    }
  }
  // Jump / gravity (vertical motion, works even while standing still)
  if(!inCar && !playerSeated && (!onGround || jumpVel!==0)){
    jumpVel -= 34*dt;
    playerGroup.position.y += jumpVel*dt;
    if(playerGroup.position.y<=0){ playerGroup.position.y=0; jumpVel=0; onGround=true; }
  }
  if(inCar&&activeCar){
    const CAR_TURN=2.2;
    if(moveState.d) carYaw+=CAR_TURN*dt;
    if(moveState.a) carYaw-=CAR_TURN*dt;
    if(moveState.w||moveState.s){
      const spd=activeCar.def.speed*(moveState.s?-0.55:1);
      const nx=activeCar.group.position.x+Math.sin(carYaw)*spd*dt;
      const nz=activeCar.group.position.z+Math.cos(carYaw)*spd*dt;
      // Real bug fix: car movement never called isBlocked() at all — driving straight through
      // every building/wall in the game. Uses a real bigger radius matching the car's own body
      // (buildCar() is 4.2 wide x 8.5 long), split into separate x/z checks like on-foot movement
      // already does, so the car can still slide along a wall instead of just freezing dead on contact.
      const CAR_R = 2.3;
      // Ram check runs on the SAME candidate position/radius isBlocked() is about to use, and
      // BEFORE it, so a just-destroyed target's collider is already gone by the time isBlocked()
      // runs this same frame — the car smashes straight through instead of bouncing off a
      // now-invisible wall where the target used to stand.
      tickCarRam(nx, nz, CAR_R);
      const blockedX = isBlocked(nx, activeCar.group.position.z, CAR_R);
      const blockedZ = isBlocked(activeCar.group.position.x, nz, CAR_R);
      if(!blockedX) activeCar.group.position.x=Math.max(-1950,Math.min(1950,nx));
      if(!blockedZ) activeCar.group.position.z=Math.max(-1950,Math.min(1950,nz));
      // Buildings aren't destroyable like item 160's NPCs/robots/trees (they're permanent city
      // architecture) — ramming one instead charges a real repair fee, same spirit, different cost.
      if(blockedX || blockedZ) crashIntoBuilding(activeCar.group.position.x, activeCar.group.position.z);
    }
    activeCar.group.rotation.y=carYaw;
    activeCar.carYaw=carYaw;
    playerGroup.position.x=activeCar.group.position.x;
    playerGroup.position.z=activeCar.group.position.z;
  }

  // Walk animation
  if(!inCar){
    const swing=moving?Math.sin(t*8)*0.4:0;
    if(player.lArm) player.lArm.rotation.x= swing;
    if(player.rArm) player.rArm.rotation.x=-swing;
    if(player.lLeg) player.lLeg.rotation.x=-swing;
    if(player.rLeg) player.rLeg.rotation.x= swing;
  }
  // Weapon swing — a real arc driven by elapsed time, same t-based approach as the walk cycle above,
  // not a fire-and-forget setTimeout chain that could drift out of sync with the render loop.
  if(player.weaponGroup) {
    const swingElapsed = t - playerSwingStart;
    if(swingElapsed >= 0 && swingElapsed < SWING_DURATION) {
      const p = swingElapsed / SWING_DURATION;
      const arc = Math.sin(p*Math.PI); // 0 -> 1 -> 0, smooth in and out
      player.weaponGroup.rotation.z = -0.2 - arc*1.7;
      player.weaponGroup.rotation.x = arc*0.7;
    } else {
      player.weaponGroup.rotation.z = -0.2;
      player.weaponGroup.rotation.x = 0;
    }
  }
  if(player.nametag) player.nametag.lookAt(camera.position);

  // Camera
  if(inCar&&activeCar){
    const camX=activeCar.group.position.x-Math.sin(carYaw)*18;
    const camY=activeCar.group.position.y+9;
    const camZ=activeCar.group.position.z-Math.cos(carYaw)*18;
    camera.position.lerp(new THREE.Vector3(camX,camY,camZ),0.08);
    camera.lookAt(activeCar.group.position.x,2,activeCar.group.position.z);
  } else {
    const interior = inHotel || inHouse || inMall || inStore || inArcade || inFriendHouse || inLandHouse || inCountryHotel || inAirportLounge;
    const camDist = interior ? 4 : 9;
    const camHeight = interior ? 2.5 : 4;
    const camX=playerGroup.position.x-Math.sin(yaw)*camDist;
    const camY=playerGroup.position.y+camHeight+pitch*(interior?2:4);
    const camZ=playerGroup.position.z-Math.cos(yaw)*camDist;
    camera.position.lerp(new THREE.Vector3(camX,camY,camZ),0.12);
    camera.lookAt(playerGroup.position.x,playerGroup.position.y+2.2,playerGroup.position.z);
  }
  // Auto-exit interiors if player walks through door gap
  if(inHotel && playerGroup.position.z > 5.5)  checkoutHotel();
  if(inHouse && playerGroup.position.z > 8.5)  exitHouse();
  if(inMall  && playerGroup.position.z > 25)   exitMall();
  if(inStore && playerGroup.position.z > 8.5)  exitStore();
  if(inFriendHouse && playerGroup.position.z > FRIEND_HOUSE_SPAWN.z + 7.5) leaveFriendHouse();
  if(inLandHouse && playerGroup.position.z > LAND_HOUSE_SPAWN.z + 5.5) exitLandHouse();
  if(inCountryHotel && playerGroup.position.z > COUNTRY_HOTEL_SPAWN.z + 4.5) checkoutCountryHotel();
  if(inAirportLounge && playerGroup.position.z > AIRPORT_LOUNGE_SPAWN.z + 7.5) exitAirportLounge();
  if(inArcade && playerGroup.position.z > 16.5) leaveArcade();

  // NPC movement
  const shoppersToRemove = [];
  npcs.forEach((npc,ni)=>{
    if(npc.seated){ if(npc.tag) npc.tag.lookAt(camera.position); return; } // seated NPCs stay put in their chair
    if(npc.waitTime>0){npc.waitTime-=dt;return;}
    const tgt=npc.patrol[npc.patrolIdx];
    const dx=tgt[0]-npc.group.position.x, dz=tgt[1]-npc.group.position.z;
    const dist=Math.sqrt(dx*dx+dz*dz);
    if(dist<0.5){
      // A shopper reaching the door on its SECOND leg (patrolIdx already 1) means it's leaving — despawn it
      if(npc.isShopper && npc.patrolIdx===1){ shoppersToRemove.push(npc); return; }
      npc.patrolIdx=(npc.patrolIdx+1)%npc.patrol.length;
      npc.waitTime=0.8+Math.random()*1.2;
      if(npc.isShopper && npc.patrolIdx===1) npc.speed *= 2.5; // done at the register — runs out with joy
    }
    else{
      npc.group.position.x+=dx/dist*npc.speed*dt;
      npc.group.position.z+=dz/dist*npc.speed*dt;
      npc.group.rotation.y=Math.atan2(dx,dz);
      const sw=Math.sin(t*6+ni)*0.35;
      npc.group.children.forEach((c,ci)=>{if(ci===4)c.rotation.x=-sw;if(ci===5)c.rotation.x=sw;if(ci===2)c.rotation.x=sw;if(ci===3)c.rotation.x=-sw;});
    }
    if(npc.tag) npc.tag.lookAt(camera.position);
  });
  shoppersToRemove.forEach(npc=>{
    scene.remove(npc.group);
    const i = npcs.indexOf(npc); if(i>-1) npcs.splice(i,1);
    giveShopperTip();
  });

  // Robots wander near their spawner — real movement (not chase AI), fighting is still a walk-up-and-press-E deal
  robots.forEach(r => {
    if(!r.alive) return;
    const wdx = r.wanderX-r.x, wdz = r.wanderZ-r.z;
    const wdist = Math.sqrt(wdx*wdx+wdz*wdz);
    if(wdist < 0.4) {
      const ang = Math.random()*Math.PI*2, rad = 3+Math.random()*4;
      r.wanderX = r.homeX + Math.cos(ang)*rad;
      r.wanderZ = r.homeZ + Math.sin(ang)*rad;
    } else {
      r.x += wdx/wdist*r.speed*dt;
      r.z += wdz/wdist*r.speed*dt;
      r.mesh.position.set(r.x, 0, r.z);
      r.mesh.rotation.y = Math.atan2(wdx, wdz);
      r.zone.x = r.x; r.zone.z = r.z;
    }
  });

  // Systems
  tickJob(dt);
  tickCook(dt);
  tickWanted(dt);
  tickElders(dt);
  tickMachines(dt);
  tickTubeWorld(dt);
  tickTubeGrowth(dt);
  tickRogueRobots(dt);
  tickCarImpactDebris(dt);
  tickPrison(dt);
  tickHealth(dt);
  updatePrompt();

  // Location label
  if(inHotel) {
    const roomLabel = currentHotelRoom==='luxury'?'👑 Luxury Suite':currentHotelRoom==='standard'?'✨ Standard Room':'🛏️ Budget Room';
    document.getElementById('location').textContent=`🏨 Hotel – ${roomLabel}`;
  } else if(inHouse) {
    document.getElementById('location').textContent='🏠 Inside Your House';
  } else if(inMall) {
    document.getElementById('location').textContent='🏬 City Mall';
  } else if(inArcade) {
    document.getElementById('location').textContent='🕹️ Pixel Palace Arcade';
  } else {
    const px2=playerGroup.position.x, pz=playerGroup.position.z;
    let loc='Explox City';
    for(const z of LOC_ZONES){if(Math.sqrt((px2-z.x)**2+(pz-z.z)**2)<z.r){loc=z.name;break;}}
    document.getElementById('location').textContent='📍 '+loc;
  }

  weatherParticles.forEach(p => {
    p.position.y -= p._speed * dt;
    p.position.x += p._driftX;
    p.position.z += p._driftZ;
    if(p._spin) p.rotation.z += p._spin;
    if(p.position.y < -1) {
      p.position.y = 35 + Math.random() * 20;
      p.position.x = playerGroup.position.x + (Math.random()-0.5)*180;
      p.position.z = playerGroup.position.z + (Math.random()-0.5)*180;
    }
  });
  updateNavLine();
  renderer.render(scene,camera);
}

// ─── SAI — SUPER ARTIFICIAL INTELLIGENCE ─────────────────────────────────────
let saiCurrentTab = 'chat';
let saiTipIndex   = 0;
let navTarget     = null;
let navLineMesh   = null;
let navBeaconMesh = null;

const SAI_TIPS = [
  { icon:'💰', text:'Work as a Shopkeeper near Shopping Street or as an Officer at the Police Station to earn S.I.P. fast!' },
  { icon:'🏦', text:'Deposit your S.I.P. in the City Bank. It earns +10,000 S.I.P. interest every 60 seconds!' },
  { icon:'🔐', text:'Set a safe combo in the bank to unlock the vault — it starts loaded with items and secret weapons!' },
  { icon:'🏬', text:'The City Mall has exclusive items like Jewelry, Phones and Ice Cream not found on the street.' },
  { icon:'🎒', text:'Open your BAG tab on the right to see all the items you have collected around the city.' },
  { icon:'😈', text:'Talk to the Shady Dealer to join the underground — but watch your Wanted level rise!' },
  { icon:'🎮', text:'Play Mini Games to earn extra S.I.P. and unlock weapons that appear in your bank safe!' },
  { icon:'📅', text:'Click the season badge in the top-right to open the calendar and see holidays and your birthday.' },
  { icon:'🗺️', text:'Use the SAI Map tab to find any location and draw a path line on the ground to follow!' },
  { icon:'⌨️', text:'Fast tab shortcuts: press B for Bag, T for SAI, or M for Music — no mouse needed, even while looking around!' },
];

const SAI_LOCATIONS = [
  { label:'City Bank',       x:-30,  z:30,   color:'#FFD700', emoji:'🏦' },
  { label:'Your House',      x:-30,  z:-110, color:'#44ff88', emoji:'🏠' },
  { label:'Shopping Street', x:60,   z:50,   color:'#00ccff', emoji:'🛍️' },
  { label:'City Mall',       x:80,   z:-20,  color:'#cc44ff', emoji:'🏬' },
  { label:'Police Station',  x:-70,  z:10,   color:'#4488ff', emoji:'🚔' },
  { label:'Restaurant',      x:20,   z:80,   color:'#ff8844', emoji:'🍕' },
  { label:'Black Market',    x:-80,  z:-71,  color:'#ff4444', emoji:'⚫' },
  { label:'Shady Dealer',    x:34,   z:3,    color:'#aa44ff', emoji:'🕴️' },
  { label:'Movie Theater',   x:50,   z:-85,  color:'#ff2244', emoji:'🎬' },
  { label:'Transit Hub',     x:0,    z:50,   color:'#ffcc00', emoji:'🚇' },
  { label:'City Hotel',      x:-15,  z:-5,   color:'#ffd700', emoji:'🏨' },
  { label:'Car Dealership',  x:130,  z:35,   color:'#ff8844', emoji:'🚗' },
  { label:'Computer Shop',   x:100,  z:58,   color:'#4488ff', emoji:'💻' },
  { label:'City Airport',    x:-200, z:-200, color:'#88ccff', emoji:'✈️' },
  { label:'The Diner',       x:110,  z:-25,  color:'#ffaa55', emoji:'🍽️' },
  { label:'Your Store',      x:160,  z:-25,  color:'#D8A657', emoji:'🏪' },
  { label:'Robo Arsenal',    x:282,  z:268,  color:'#00ffcc', emoji:'🤖' },
];

function toggleSAI() {
  const panel = document.getElementById('saiPanel');
  if(panel.style.display === 'none') {
    if(document.pointerLockElement) document.exitPointerLock();
    isPointerLocked = false;
    panel.style.display = 'block';
    document.getElementById('saiTab').style.display = 'none';
    saiSwitchTab('chat');
  } else { closeSAI(); }
}
function closeSAI() {
  document.getElementById('saiPanel').style.display = 'none';
  document.getElementById('saiTab').style.display = 'block';
  if(renderer && renderer.domElement) renderer.domElement.requestPointerLock();
}

function saiSwitchTab(tab) {
  saiCurrentTab = tab;
  ['chat','map','tips'].forEach(t => {
    const btn  = document.getElementById('saiTab' + t[0].toUpperCase() + t.slice(1));
    const view = document.getElementById('sai' + t[0].toUpperCase() + t.slice(1) + 'View');
    const active = t === tab;
    btn.style.background   = active ? '#00ff8833' : 'none';
    btn.style.borderColor  = active ? '#00ff88'   : '#444';
    btn.style.color        = active ? '#00ff88'   : '#888';
    view.style.display     = active ? 'block'     : 'none';
  });
  if(tab === 'map')  drawSAIMap();
  if(tab === 'tips') showSaiTip();
}

const SAI_KB = [
  { keys:['bank','vault'],           reply:'🏦 The City Bank is northwest of center (x=-30, z=30). A passcode is required. Your bank earns +10,000 S.I.P. interest every 60 seconds!' },
  { keys:['house','home'],           reply:'🏠 Your house is south of the city at x=-30, z=-110. Head south down the road past the park.' },
  { keys:['shop','store','buy'],     reply:'🛍️ Shopping Street is east of center (x=60, z=50). Coffee Shop, Toy Store, Outfit Shop and Weapon Shop are all there!' },
  { keys:['mall','directory'],       reply:'🏬 The City Mall is far east at x=80, z=-20. Past the fountain is a Shopping Wing with 200 more real shops, plus a 🗺️ Mall Directory kiosk to search all 300 shops in the game!' },
  { keys:['job','work','earn'],      reply:'💼 Work as a Shopkeeper (Shopping Street, +5 S.I.P./round) or Officer (Police Station, +10 S.I.P./round). Press E near the zone to start!' },
  { keys:['police','cop','officer'], reply:'🚔 The Police Station is west at x=-70, z=10. Work there as an Officer for 10 S.I.P. per round!' },
  { keys:['restaurant','food','pizza','cook'], reply:'🍕 Restaurant Row is north at x=20, z=80. Grab ingredients, cook at the stove, deliver meals for +20 S.I.P. each!' },
  { keys:['diner','eat','hungry','meal','taste'], reply:'🍽️ The Diner is south-east at x=110, z=-25 — a sit-down restaurant with a real menu (burgers, pizza, sushi, tacos, dessert, and more)! Order a dish, then press C to eat it and see your taste reaction.' },
  { keys:['store','own store','business','property','buy a store'], reply:"🏪 Your Store is east of The Diner at x=160, z=-25! Buy one of 10 store tiers (100 to 15,000 S.I.P.) — bigger ones are 2-story and come furnished. Walk in, stock up on ingredients, set your price, then open the shop — you have to stay while it's open for customers to buy. Decorate the room with furniture too! Only one store at a time — buying a new one replaces the old one." },
  { keys:['black market','underground','dealer'], reply:'🕴️ Talk to the Shady Dealer (x=34, z=3) to go bad. The Black Market is southwest at x=-80, z=-71. Your Wanted level will rise!' },
  { keys:['weapon','sword','bat','axe'], reply:'⚔️ Buy weapons at the Weapon Shop (Shopping Street) or in the Mall. Open the bank safe too — it holds secret mini-game weapons!' },
  { keys:['robot weapon','robo arsenal','fight robot','emp hammer','plasma cutter','rail spike'], reply:'🤖 The Robo Arsenal shop is at The Scrapyard (x=282, z=268). It sells the EMP Hammer, Plasma Cutter and Rail Spike — weak against people, but they hit robots way harder than a regular sword!' },
  { keys:['safe','combo'],           reply:'🔐 Enter the bank and click "Open Safe". First time: create a combo. The safe holds secret items and mini-game weapons!' },
  { keys:['map','where'],            reply:'🗺️ Switch to the Map tab! Click any location dot to draw a navigation line on the ground to follow.' },
  { keys:['mini game','minigame','throne','obby','parkour'], reply:'🎮 Click MINI GAMES on the right to play Capture the Throne, Obby, or Rooftop Parkour!' },
  { keys:['season','winter','summer','holiday','calendar'],  reply:'📅 Click the season badge (top-right) to open the calendar. Holidays and your birthday are marked!' },
  { keys:['bag','inventory','item'], reply:'🎒 Click the BAG tab on the right to see all your items. Buy things from shops and they show up here!' },
  { keys:['money','sip','cash'],     reply:'💰 Earn S.I.P. by working jobs, cooking meals, or playing mini games. Bank it for interest!' },
  { keys:['car','drive','vehicle','dealership'], reply:'🚗 The Car Dealership is east of Shopping Street at x=130, z=35. Buy cars with S.I.P. and drive them around the city! Press E near your parked car to get in, E again to exit.' },
  { keys:['computer','sib','browser','internet','online'], reply:'💻 The Computer Shop is at x=100, z=58 — sells S.I.C., S.I.C.+, and S.D.I.C. computers. Buy one, then use it at the desk in your house to open SIB — the Super Important Browser! Shop online, read news, and more.' },
  { keys:['hello','hi','hey','sup'], reply:'🤖 Hello! I am SAI. Ask me about locations, jobs, the bank, transit, cars, weapons, shops, mini games, or anything in Explox!' },
  { keys:['tip','advice','help'],    reply:'💡 Switch to the Tips tab for 10 game tips that will help you level up fast!' },
  { keys:['sits','transit','bus','train','subway','metro','ride','travel','transport'], reply:'🚇 S.I.T.S. (Super Important Transit System) is at the city center (x=0, z=-40)! Walk in and pick a route. 5 lines: 🔴 Red (2 SIP), 🔵 Blue (3 SIP), 🟢 Green (2 SIP), 🟡 Yellow (4 SIP), 🟣 Purple (3 SIP). Click any stop to teleport there instantly! Fares go to your bank.' },
  { keys:['cinema','movie','film','theater','watch'], reply:'🎬 The Movie Theater is south-east at x=50, z=-85. Walk in to pick from 14 movies — buy a ticket, grab snacks, and watch! Ticket prices: 20–40 SIP depending on the film.' },
  { keys:['fast travel','teleport','warp','shortcut'], reply:'🚇 Use S.I.T.S. at the Transit Hub (center of city, x=0, z=-40) to fast-travel anywhere! Pick a line, click your stop, and you\'re there in seconds.' },
  { keys:['airport','fly','flight','plane','airline','ticket'], reply:'✈️ The City Airport is southwest at x=-200, z=-200. Walk up and press E to enter! Buy a ticket (45–80 SIP) and fly to 5 destinations: Palm Beach 🌴, Mountain View 🏔️, Harbor Bay 🌊, Sky Tower District 🏙️, or Desert Sands 🏜️. Enjoy the window view!' },
];

function saiAsk() {
  const input = document.getElementById('saiInput');
  const q = input.value.trim(); if(!q) return;
  input.value = '';
  saiAddMsg('You: ' + q, 'user');
  const lq = q.toLowerCase();
  let reply = '🤔 I\'m not sure about that. Try asking about: locations, jobs, bank, safe, weapons, shops, mini games, or the map!';
  for(const entry of SAI_KB) {
    if(entry.keys.some(k => lq.includes(k))) { reply = entry.reply; break; }
  }
  setTimeout(() => saiAddMsg('🤖 ' + reply, 'sai'), 400);
}

function saiAddMsg(text, who) {
  const box = document.getElementById('saiMessages');
  const div = document.createElement('div');
  div.style.cssText = who === 'user'
    ? 'background:rgba(255,255,255,0.07);border-radius:6px;padding:6px 8px;font-size:11px;color:#ccc;text-align:right;'
    : 'background:rgba(0,255,136,0.1);border-radius:6px;padding:6px 8px;font-size:11px;color:#00ff88;';
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function drawSAIMap() {
  const cv = document.getElementById('saiMapCanvas'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, SC = 0.7; // must match saiMapClick()'s SC, or clicks miss the drawn markers
  const ox = W/2, oy = H/2;
  const mx = wx => ox + wx * SC;
  const mz = wz => oy - wz * SC;

  ctx.fillStyle = '#050f08'; ctx.fillRect(0,0,W,H);

  // Grid
  ctx.strokeStyle = '#0a2010'; ctx.lineWidth = 1;
  for(let i=-5;i<=5;i++){
    ctx.beginPath(); ctx.moveTo(mx(i*50),0); ctx.lineTo(mx(i*50),H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,mz(i*50)); ctx.lineTo(W,mz(i*50)); ctx.stroke();
  }

  // Roads
  ctx.strokeStyle = '#1c3a1c'; ctx.lineWidth = 5;
  [ [[-150,0],[150,0]], [[0,-130],[0,100]], [[-150,50],[150,50]], [[-30,100],[-30,-130]] ]
  .forEach(([a,b]) => {
    ctx.beginPath(); ctx.moveTo(mx(a[0]),mz(a[1])); ctx.lineTo(mx(b[0]),mz(b[1])); ctx.stroke();
  });

  // Location dots
  SAI_LOCATIONS.forEach(loc => {
    const lx = mx(loc.x), ly = mz(loc.z);
    const g = ctx.createRadialGradient(lx,ly,0,lx,ly,12);
    g.addColorStop(0, loc.color+'99'); g.addColorStop(1,'transparent');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx,ly,12,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = loc.color; ctx.beginPath(); ctx.arc(lx,ly,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center';
    ctx.fillText(loc.emoji+' '+loc.label, lx, ly-11);
  });

  // Nav line + target
  if(navTarget && playerGroup) {
    const px = playerGroup.position.x, pz = playerGroup.position.z;
    ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 2; ctx.setLineDash([5,3]);
    ctx.beginPath(); ctx.moveTo(mx(px),mz(pz)); ctx.lineTo(mx(navTarget.x),mz(navTarget.z)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(mx(navTarget.x),mz(navTarget.z),6,0,Math.PI*2); ctx.fill();
  }

  // Player dot
  if(playerGroup) {
    const px = mx(playerGroup.position.x), pz = mz(playerGroup.position.z);
    const pg = ctx.createRadialGradient(px,pz,0,px,pz,10);
    pg.addColorStop(0,'#ffffff'); pg.addColorStop(1,'transparent');
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px,pz,10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00aaff'; ctx.beginPath(); ctx.arc(px,pz,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 7px Arial'; ctx.textAlign = 'center';
    ctx.fillText('YOU', px, pz-12);
  }
}

function saiMapClick(event) {
  const cv = document.getElementById('saiMapCanvas');
  const rect = cv.getBoundingClientRect();
  const cx = event.clientX - rect.left, cy = event.clientY - rect.top;
  const SC = 0.7, ox = cv.width/2, oy = cv.height/2; // must match drawSAIMap()'s SC, or clicks miss the drawn markers
  // Find nearest named location within 28px
  let hit = null, best = 28;
  SAI_LOCATIONS.forEach(loc => {
    const lx = ox + loc.x*SC, ly = oy - loc.z*SC;
    const d = Math.sqrt((cx-lx)**2+(cy-ly)**2);
    if(d < best) { hit = loc; best = d; }
  });
  if(hit) saiNavigateTo(hit.x, hit.z, hit.label);
  else saiNavigateTo((cx-ox)/SC, (oy-cy)/SC, 'Custom Point');
  drawSAIMap();
}

function saiNavigateTo(wx, wz, label) {
  navTarget = { x:wx, z:wz, label };
  const el = document.getElementById('saiNavLabel');
  if(el) el.textContent = '🧭 Navigating to: ' + label;
  showNotif('🤖 SAI: Follow the blue beacon to ' + label + '!');
}

function updateNavLine() {
  if(navLineMesh)   { scene.remove(navLineMesh);   navLineMesh   = null; }
  if(navBeaconMesh) { scene.remove(navBeaconMesh); navBeaconMesh = null; }
  const navHud = document.getElementById('navHud');
  if(!navTarget || !playerGroup) { if(navHud) navHud.style.display='none'; return; }

  const px = playerGroup.position.x, pz = playerGroup.position.z;
  const dx = navTarget.x - px, dz = navTarget.z - pz;
  const dist = Math.sqrt(dx*dx + dz*dz);

  if(dist < 4) {
    navTarget = null;
    if(navHud) navHud.style.display = 'none';
    const el = document.getElementById('saiNavLabel'); if(el) el.textContent = '✅ Arrived!';
    showNotif('🤖 SAI: You have arrived!');
    return;
  }

  // Tall glowing beacon pillar — visible over all buildings
  if(!navBeaconMesh) {
    navBeaconMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 80, 8),
      new THREE.MeshBasicMaterial({ color:0x00ffff, transparent:true, opacity:0.5 })
    );
    navBeaconMesh.position.set(navTarget.x, 40, navTarget.z);
    scene.add(navBeaconMesh);
  }

  // HUD compass arrow — rotates to point toward destination relative to camera facing
  if(navHud) {
    navHud.style.display = 'block';
    const worldAngle = Math.atan2(dx, dz);
    const relAngle = worldAngle - yaw;
    const deg = relAngle * (180 / Math.PI);
    document.getElementById('navArrow').style.transform = `rotate(${deg}deg)`;
    document.getElementById('navHudLabel').textContent = '🧭 ' + navTarget.label;
    document.getElementById('navHudDist').textContent = Math.round(dist) + 'm away';
  }
}

function showSaiTip() {
  const tip = SAI_TIPS[saiTipIndex];
  document.getElementById('saiTipIcon').textContent = tip.icon;
  document.getElementById('saiTipText').textContent = tip.text;
  document.getElementById('saiTipCounter').textContent = (saiTipIndex+1) + ' / ' + SAI_TIPS.length;
}
function saiNextTip(dir) {
  saiTipIndex = (saiTipIndex + dir + SAI_TIPS.length) % SAI_TIPS.length;
  showSaiTip();
}

// Wire up login buttons immediately when script loads
(function() {
  var b = document.getElementById('createAccBtn');
  if(b) b.onclick = createAccount;
  var pi = document.getElementById('newAccPw');
  if(pi) pi.onkeydown = function(e){ if(e.key==='Enter') createAccount(); };
})();
