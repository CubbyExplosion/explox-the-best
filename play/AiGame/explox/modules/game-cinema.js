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

