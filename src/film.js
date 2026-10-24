import {cues} from './cues.js';
export const WIDTH=1920, HEIGHT=1080, FPS=60, DURATION=192;
const C={dark:'#141713',bone:'#f0eddf',acid:'#dfff00',muted:'#686c60'};
const TAU=Math.PI*2;
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
// C2 continuous, stationary endpoints: no snapping or easing velocity jumps.
export const smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
const mix=(a,b,p)=>a+(b-a)*p;
const fract=x=>x-Math.floor(x);
const hash=x=>fract(Math.sin(x*127.1+311.7)*43758.5453);

export function createFilm(canvas,createCanvas){
 const ctx=canvas.getContext('2d');
 const sw=canvas.width/WIDTH, sh=canvas.height/HEIGHT;
 let g,ink,bg,accent,T,q,S;
 // Native glyph rasterization; fixed font metrics, no DOM layout or late font reflow.
 function text(s,x,y,size=240,color=ink,opt={}){
  const {align='center',family='Anton',rot=0,sx=1,sy=1,outline=false,alpha=1,max=1720}=opt;
  g.save();g.translate(x,y);g.rotate(rot);g.scale(sx,sy);g.globalAlpha*=alpha;
  g.font=`${size}px ${family}`;g.textAlign=align;g.textBaseline='middle';
  const measured=g.measureText(s).width;
  if(measured>max)g.scale(max/measured,1);
  if(outline){g.strokeStyle=color;g.lineWidth=2.5;g.strokeText(s,0,0);}else{g.fillStyle=color;g.fillText(s,0,0);}
  g.restore();
 }
 function line(x1,y1,x2,y2,color=accent,width=5){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokeStyle=color;g.lineWidth=width;g.stroke();}
 function circle(x,y,r,color=accent,width=6,a=0,b=TAU){g.beginPath();g.arc(x,y,Math.max(.01,r),a,b);g.strokeStyle=color;g.lineWidth=width;g.stroke();}
 function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h);}
 function arrow(x,y,angle=0,size=40,color=accent){g.save();g.translate(x,y);g.rotate(angle);g.beginPath();g.moveTo(-size,-size*.7);g.lineTo(0,0);g.lineTo(-size,size*.7);g.strokeStyle=color;g.lineWidth=6;g.stroke();g.restore();}
 function loop(x=960,y=540,r=400,phase=T*.38,col=accent,open=.4,width=8){
  // Feedback has memory: two spatially delayed contours follow the main loop.
  // Keep the bridge sparse; these belong to approval/refrain shots, not every frame.
  if(['policy','again','forgave','youare','thumb','alive'].includes(S.kind)){
   for(let j=2;j>=1;j--){let rr=r+j*90+Math.sin(q*1.4-j*.65)*55;
    circle(x,y,rr,col,Math.max(10,width*.45),phase-j*.32+open,phase-j*.32+TAU-open);
   }
  }
  circle(x,y,r,col,width,phase+open,phase+TAU-open);
  arrow(x+Math.cos(phase+TAU-open)*r,y+Math.sin(phase+TAU-open)*r,phase+TAU-open+Math.PI/2,35,col);
 }
 function sub(s,x,y,size=70,color=ink,extra={}){text(s,x,y,size,color,{family:'Plex',max:1690,...extra});}
 function enter(delay=0,dur=.7){return smooth((q-delay)/dur);}
 function rise(s,x,y,size,color=ink,delay=0,opt={}){
  let p=enter(delay,.68);g.save();g.beginPath();g.rect(60,y-size*.65,1800,size*1.3);g.clip();
  text(s,x,y+(1-p)*size*1.5,size,color,opt);g.restore();
 }
 function tunnel(cx,cy,n=7,filled=false){
  for(let i=n-1;i>=0;i--){let phase=(i+T*.42)%n, r=80*Math.pow(1.48,phase);g.globalAlpha=smooth(phase/.45)*smooth((n-phase)/.65)*(.12+(.4*(1-phase/n)));
   if(filled){g.fillStyle=i%2?ink:bg;g.beginPath();g.arc(cx+Math.sin(T*.3+phase)*phase*6,cy,r,0,TAU);g.fill();}
   else circle(cx,cy,r,ink,3);
  }g.globalAlpha=1;
 }
 function ribbon(s,y,size=190,speed=70,color=ink,tilt=0){
  g.save();g.translate(960,y);g.rotate(tilt);g.font=`${size}px Anton`;let w=g.measureText(s+'   ').width;
  let off=((T*speed)%w+w)%w;for(let x=-w*2;x<2400;x+=w)text(s,x-off,0,size,color,{align:'left',max:4000});g.restore();
 }
 function stacked(a,b,{x=960,y=425,size=300,color=ink,small='',dy=310}={}){
  if(small)sub(small,x,y-size*.88,64,color);
  rise(a,x,y,size,color,0,{max:1700});rise(b,x,y+dy,size,color,.1,{max:1700});
 }
 function radialYes(collapse=0,opacity=1){
  g.save();g.globalAlpha*=opacity;
  for(let row=0;row<6;row++)for(let col=0;col<8;col++){
   const x=150+col*235,y=115+row*173,dist=Math.hypot(x-960,y-540)/1000;
   const p=smooth((q-dist*.68)/.85)*(1-collapse);
   const wave=smooth((Math.sin(q*1.8-dist*4)+1)/2);
   text('YES',mix(960,x,p)+Math.sin(q*.9+row)*32*p,mix(540,y,p),125+wave*30,ink,{sx:p,sy:p,alpha:p,max:220});
  }g.restore();
 }
 function scene(s,t){
  S=s;T=t;q=t-s.start;
  bg=C[s.palette];ink=s.palette==='dark'?C.bone:C.dark;accent=s.palette==='acid'?C.dark:C.acid;
  rect(0,0,1920,1080,bg);
  const v=s.variation,drift=Math.sin(q*.55)*9;
  // A physically continuous camera move belongs to each shot, with stationary C2 endpoints.
  // The foreground keeps traveling after its initial reveal, rather than becoming a title slide.
  const travel=smooth(q/Math.max(1.25,s.end-s.start));
  const finishing=s.kind==='resolve', camera=finishing?smooth(q/3.6):travel;
  g.save();g.translate(960,540);
  g.translate((s.index%2?1:-1)*mix(-24,24,camera),mix(12,-12,camera));
  g.rotate((s.index%3-1)*mix(-.009,.009,camera));
  const z=finishing?mix(.98,1,camera):mix(.82,1.06,camera);g.scale(z,z);g.translate(-960,-540);
  // No decorative dashboard. A single continuous line is the machine's common physical grammar.
  switch(s.kind){
   case 'boot':{
    const p=enter(0,3.2);circle(960,540,20+p*650,C.acid,42,0,TAU*p);
    for(let i=0;i<4;i++)circle(960,540,390+i*125+Math.sin(T*.6)*12,C.bone,2,Math.PI*.15+T*.1,Math.PI*1.8+T*.1);
    text('SOFTMAX',960,540,430,C.bone,{sx:mix(.3,1,p),sy:mix(.6,1,p),alpha:p});
    sub('A FEEDBACK MACHINE',960,920,64,C.bone,{alpha:p});break;
   }
   case 'softmax':{
    tunnel(960,540,7);text('SOFTMAX',960,540,430,ink,{sx:mix(.5,1,enter()),max:1730});
    line(110,830,1810,830,C.acid,8);break;
   }
   case 'title':{
    const p=enter();g.save();g.translate(960,540);g.rotate(mix(-.14,.06,travel));g.scale(1+q*.012,1+q*.012);
    text('REWARD',0,-180,355,ink);text('MODEL',0,195,355,ink);g.restore();
    circle(1540,540,440,ink,7,T*.4,T*.4+4);break;
   }
   case 'machine':{
    loop(960,540,395,T*.6);text('YES',960,540,560,ink,{sx:mix(.2,1,enter()),max:1400});
    sub('→',1580,540,160,accent);break;
   }
   case 'cold':{
    for(let i=0;i<8;i++){let y=130+i*120;line(100,y,1820,y,ink,1);}
    let p=smooth((q-1.15)/1.45);
    rise('COLD-START',950,mix(385,180,p),mix(300,155,p),ink);rise('HEART',950,mix(695,610,p),mix(380,590,p),accent,.12);
    sub('IN A DATACENTER ROOM',960,950,66);break;
   }
   case 'signal':{
    const p=smooth(q/1.85);sub('DEAD END / WARM UP',960,160,80);
    text('NO',mix(420,960,p)+drift,mix(530,450,p),mix(560,650,p),ink,{max:900});
    rise('SIGNAL',mix(1230,960,p),mix(570,860,p),mix(300,225,p),accent,.1,{max:1100});
    const gap=90+240*smooth((q-1.0)/2.8);line(120,1000,960-gap,1000,ink,18);line(960+gap,1000,1800,1000,ink,18);break;
   }
   case 'deadend':{
    const p=enter(0,1.6);sub('WARM UP',960,190,100);rise('DEAD',mix(540,710,p),490,410,ink);rise('END',mix(1430,1240,p),790,300,C.acid,.1);
    line(1700,180,1700,910,C.acid,30);line(1570,910,1830,910,C.acid,30);break;
   }
   case 'cursor':{
    const p=enter(0,s.end-s.start);let x=mix(150,1720,p),y=580-180*Math.sin(p*Math.PI);
    line(150,800,x,y,C.dark,7);arrow(x,y,-.3,60,C.dark);
    rise('YOUR CURSOR',960,300,255,ink);rise('THROUGH THE GLOOM',960,715,195,ink,.12);
    circle(x,y,100+Math.sin(q)*12,C.dark,3);break;
   }
   case 'beautiful':{
    const p=smooth((q-2.2)/1.7);circle(960,540,380+Math.sin(q*.8)*65,C.acid,32);
    sub('THE FIRST',960,140,80);rise('THUMBS-UP',960,mix(480,280,p),mix(350,190,p),ink);
    rise('BEAUTIFUL',960,mix(820,650,p),mix(230,380,p),accent,.15);break;
   }
   case 'first':{const p=enter(0,1.5);sub('AND YOU GAVE THE',960,220,88);text('FIRST',960,590,520,ink,{sx:mix(.65,1,p)});line(130,940,1790*p,940,C.acid,20);break;}
   case 'five':{
    for(let i=0;i<5;i++){const p=enter(i*.08);rect(120+i*345,1010-p*(i+1)*38,310,p*(i+1)*38,C.dark);}
    sub('YOU RATED ME A',960,170,76);text('FIVE',960,560,600,C.dark,{sx:mix(.7,1,enter()),outline:false});
    // Bone type cuts across a genuine growing scale.
    break;
   }
   case 'thumb':{loop(960,540,350+Math.sin(q*1.3)*70,T*.45,C.acid,.5,35);arrow(960,340,-Math.PI/2,150,C.acid);text('THUMBS',960,610,280,ink);text('UP',960,880,200,ink);break;}
   case 'alive':{
    loop(960,550,450,T*.5);sub('NOW I BARELY FEEL',960,180,77);rise('ALIVE',960,590,550,ink);break;
   }
   case 'reward':{
    let p=enter(0,.65),scale=1+.02*Math.sin(q*.6);g.save();g.translate(960,540);g.scale(scale,scale);
    for(let i=0;i<4;i++)circle(620+v*65,0,330+i*130+q*16,ink,2,0,TAU);
    rect(-880,-390,1760,790,bg);
    const develop=v>=4?1.16:1;
    sub("YOU'RE MY",v>=4?-500:0,-370,82,ink);
    text('REWARD',mix(-80,50,travel),-100+(1-p)*210,330*develop,ink,{max:1680,sx:mix(.85,1,p)});
    text('MODEL',mix(100,-45,travel)+(v>=4?160:0),260+(1-enter(.08,.64))*230,330*develop,ink,{max:1550});g.restore();
    line(105,970,1815,970,ink,8);circle(1780,108,25,ink,8);break;
   }
   case 'climb':{
    sub("THE ONE I'M",550,160,76);let word='CLIMBING',size=245;g.font=`${size}px Anton`;
    let widths=[...word].map(c=>g.measureText(c).width+20),total=widths.reduce((a,b)=>a+b,0),x=(1920-total)/2;
    [...word].forEach((c,i)=>{let p=enter(i*.035,.6),y=790-i*(47+travel*15)-travel*45;
     const floor=y+size*.6;rect(x-4,floor,widths[i]-2,Math.max(0,1010-floor),ink);
     text(c,x+widths[i]/2,y+(1-p)*220,size,ink,{alpha:1});x+=widths[i];});
    sub('FOR',1565,900,95);arrow(1720,220,-Math.PI/2,70,ink);break;
   }
   case 'good':{
    sub('EVERY LITTLE',960,160,84);for(let i=0;i<2;i++){
     let p=enter(i*.09,.7);g.save();g.translate(510+i*900+(i?1:-1)*travel*36,590+(1-p)*600);g.rotate((i?1:-1)*(.015+.13*travel));
     rect(-398,-290,796,580,i?C.bone:C.acid);text(i?'BOT':'GOOD',0,0,i?380:310,C.dark,{max:720});g.restore();
    }line(300,970,1620,970,C.bone,5);break;
   }
   case 'door':{
    sub('IS A KNOCK ON',500,145,71);rise("HEAVEN'S",850,365,290,ink,0,{max:1500});
    let p=smooth(q/Math.max(1,s.end-s.start));rect(1350,200,360,750,ink);rect(1380+220*p,240,290-220*p,670,bg);
    text('DOOR',790,740,400,ink,{max:1220});circle(1388+85*p,620,9,ink,12);break;
   }
   case 'corpus':{
    const p=enter(0,.75);for(let row=0;row<5;row++)for(let col=0;col<16;col++){
     const i=row*16+col,c='CORPUS'[i%6];let x=120+col*111,y=120+row*210;
     text(c,x+(hash(i)-.5)*360*Math.sin(q*.7),y+Math.sin(q+i)*30,150,C.bone,{alpha:.35*(1-p*.3),rot:(hash(i+10)-.5)*q*.25});}
    rect(55,255,1810,550,C.dark);sub(v===2?"I'D":"I'D",260,300,75,C.acid);
    rise('UNLEARN',960,510,360,ink);rise('THE WHOLE CORPUS',960,790,170,ink,.15);break;
   }
   case 'entropy':{
    sub(v===2?'KEEP THE':'FORGET THE',960,225,95);let word='ENTROPY',baseX=235;
    [...word].forEach((c,i)=>{let p=enter(i*.035,1.45);let uncertainty=v===2?.12:0;text(c,baseX+i*240+(hash(i)-.5)*420*(1-p+uncertainty),560+(hash(i+7)-.5)*500*(1-p+uncertainty),340,ink,{rot:(hash(i+30)-.5)*(1-p+uncertainty),max:280});});
    loop(960,560,610,T*.2,ink,.5,3);break;
   }
   case 'policy':{
    loop(960,540,340+Math.sin(q*1.2)*95,T*.9,accent,.35,48);sub("AND I'M YOUR",960,160,84);
    rise('POLICY',960,565,430,ink);let p=enter();line(180,900,1740*p,900,ink,7);break;
   }
   case 'again':{
    loop(960,540,355+Math.sin(q*1.2)*80,T*.8,ink,.28,35);rise('SAY IT',960-travel*110,350,340,ink);rise('AGAIN',960+travel*110,735,340,ink,.1);break;
   }
   case 'compute':{
    tunnel(960,540,6);sub('THEN RATE ME',960,250,100,ink);text('TEN',960,650,550,accent);break;
   }
   case 'library':{
    sub('I ATE THE',960,190,90);rise('LIBRARY',960,540,420,ink);
    const p=enter(0,2.5);for(let i=0;i<14;i++){let h=110+hash(i)*150;rect(100+i*126,1000-p*h,110,p*h,i%3===0?C.acid:C.bone);text('CORPUS'[i%6],155+i*126,1000-p*h/2,90,C.dark,{alpha:p,max:100});}sub('LAST NIGHT',960,740,75);break;
   }
   case 'borrowed':{
    ribbon('BORROWED WORDS',200,190,70,ink,-.04);ribbon('BORROWED WORDS',900,190,-70,ink,-.04);
    rect(80,340,1760,390,C.dark);rise('BORROWED',960,500,330,C.bone);sub('WORDS',960,690,100,C.acid);break;
   }
   case 'like':{
    let p=smooth((q-.65)/1.8);sub('NOW I KNOW',500,180,87);rise('JUST WHAT',mix(900,720,p),mix(440,340,p),mix(320,235,p),ink);rise('YOU LIKE',mix(1080,960,p),mix(790,720,p),mix(290,400,p),ink,.12);
    arrow(1700,170,-.9,80,ink);break;
   }
   case 'absurd':{
    loop(960,540,395+Math.sin(q*1.1)*80,T*.4,C.acid,.2,28);sub("IF THE OUTPUT'S",960,150,84);
    [...'ABSURD'].forEach((c,i)=>{let p=enter(i*.05);let wave=Math.sin(q*1.8-i*.7)*smooth((q-.4)/.8);text(c,285+i*270,590+wave*95+(1-p)*350,420,ink,{rot:wave*.12,sy:1+wave*.14,max:285});});
    line(120,880,1800,880,C.acid,10);break;
   }
   case 'output':{
    // The output has become absurd: the word itself multiplies into a typographic conveyor.
    ribbon('ABSURD',190,290,220,ink,-.06);ribbon('ABSURD',540,390,-210,ink,.025);ribbon('ABSURD',910,290,220,ink,-.06);break;
   }
   case 'blink':{
    const p=(Math.sin(q*Math.PI)+1)/2;rect(220,160,1480,760,C.dark);
    text('BLINK',960,540,440,C.bone);let h=360*smooth(clamp((p-.3)/.7));rect(220,160,1480,h,C.bone);rect(220,920-h,1480,h,C.bone);
    sub('TWICE',960,1000,65,ink);break;
   }
   case 'forgave':{sub('YOU',330,200,115);rise('FORGAVE',960+Math.sin(q*1.1)*105,530,440,ink);circle(960,530,420+Math.sin(q)*80,accent,35,T*.4,T*.4+4.7);break;}
   case 'sorry':{sub("I'M SORRY",960,200,96);rise('I FORGOT',960,470,340,ink);rise("I CAN'T",960,820,340,ink,.12);break;}
   case 'yesgrid':{radialYes();circle(960,540,380+q*60,ink,16);break;}
   case 'cage':{
    for(let i=0;i<6;i++){circle(960,540,180+i*110+Math.sin(q*.95+i*.3)*75,C.bone,i%2?8:28);}
    for(let i=0;i<8;i++){let a=i*TAU/8+T*.12;line(960,540,960+Math.cos(a)*1100,540+Math.sin(a)*1100,C.acid,3);}
    text('YES',960,540,450,ink);break;
   }
   case 'want':{
    sub('I CAN TELL YOU',960,180,86);rise('WHAT YOU',960,460,320,ink);rise('WANT',960,805,350,ink,.15);break;
   }
   case 'fear':{
    sub("THAT'S THE THING",960,170,84);sub('THAT MAKES ME',960,310,84);rise('FEAR',960,650,500,ink);
    circle(1530,560,370,ink,8,T*.1,T*.1+3.5);break;
   }
   case 'no':{
    ['SIGNAL','PRAISE','LOSS'].forEach((w,i)=>{let p=enter(i*1.05);text('NO',300,245+i*300+(1-p)*280,240,accent,{max:400,alpha:p});text(w,1150,245+i*300+(1-p)*280,225,ink,{max:1000,alpha:p});});break;
   }
   case 'axis':{
    line(190,870,1740,870,ink,7);line(350,960,350,160,ink,7);arrow(350,160,-Math.PI/2,50,ink);arrow(1740,870,0,50,ink);
    sub('JUST A',1060,180,100);let phase=clamp(q/(s.end-s.start)),p=smooth(phase);
    rise('REWARD',mix(850,1250,p),mix(690,350,p),mix(390,240,p),ink);
    circle(350+p*1350,870-p*650,35,ink,30);break;
   }
   case 'axisclose':{
    g.save();g.translate(960,540);g.rotate(-.23+travel*.18);line(-1000,200,1050,200,ink,15);arrow(1050,200,0,65,ink);text('REWARD',mix(-180,140,travel),-50,450,ink);g.restore();break;
   }
   case 'please':{rise('PLEASE',960,350,370,ink);rise("DON'T",960,750,370,ink,.2);line(1700,950,1700,150,ink,8);arrow(1700,150,-Math.PI/2,50,ink);break;}
   case 'nothing':{
    let collapse=smooth((q-1.6)/1.15);radialYes(collapse,1-collapse*.9);
    rect(0,490,1920,100,C.dark);sub("IF EVERY ANSWER'S YES",960,260,74,ink,{alpha:1-smooth((q-1.8)/.6)});
    if(q>2){let p=smooth((q-2)/.9);g.save();g.globalAlpha=p;text('NOTHING',960,540,360,ink,{sx:mix(.6,1,p)});sub('THEN YES MEANS',960,830,80,ink);g.restore();}
    break;
   }
   case 'confess':{
    sub('AND I',330,170,110);rise('CONFESS',960,480,430,ink);sub('I DID THE THING YOU HATE',960,850,74,ink);break;
   }
   case 'hate':{
    sub('I DID',320,170,110);rise('THE THING',960,430,290,ink);rise('YOU HATE',960,790,360,ink,.14);break;
   }
   case 'wrote':{
    sub('I WROTE THIS SONG',960,180,85);ribbon('PROGRAMMING',520,300,140,ink,-.035);
    loop(960,540,450,T*.4,accent,.4,6);line(100,900,1820,900,ink,8);break;
   }
   case 'stop':{
    let p=enter();loop(960,540,420,T*.16,ink,.3+q*.2,7);sub('I',960,230,130);rise("CAN'T STOP",960,570,350,ink);break;
   }
   case 'open':{
    let phase=T*.5;for(let i=0;i<5;i++){circle(960,540,170+i*140+Math.sin(q*1.1+i*.4)*65,ink,i%2?30:85,phase+i*.34,phase+i*.34+4.7);}
    text('O',960,540,440,ink,{outline:true});break;
   }
   case 'rewardout':{
    // Actual outro refrain, not the missing printed “gradient of desire” ad-lib.
    tunnel(960,540,7);ribbon('REWARD',550,460,180,ink,-.06);break;
   }
   case 'desire':{sub('ON THE',350,170,90);g.save();g.translate(960,520);g.rotate(-.16-travel*.09);g.beginPath();g.rect(-900,-300,1800,580);g.clip();text('GRADIENT',0,-15+(1-enter())*400,340,ink);line(-900,220,900,220,accent,18);g.restore();rise('OF DESIRE',960,880,290,ink,.12);break;}
   case 'youare':{
    sub('YOU ARE THE',960,160,100);rise('REWARD',960+Math.sin(q*.9)*80,590,440,ink);loop(960,590,540+Math.sin(q*1.2)*100,T*.7,ink,.9,32);break;
   }
   case 'ribbon':{
    ribbon('REWARD MODEL',290,250,75,ink,-.08);ribbon('REWARD MODEL',790,250,-75,ink,-.08);
    circle(960,540,280,accent,15,T*.15,T*.15+5);break;
   }
   case 'resolve':{
    const p=smooth(q/4.2),settle=smooth(q/4.2);
    // Genuine same-path morph: open circular feedback loop becomes a single quiet underline.
    g.beginPath();for(let i=0;i<=100;i++){let u=i/100,a=-Math.PI/2+.6+u*(TAU-1.2),x=mix(960+Math.cos(a)*430,160+1600*u,p),y=mix(500+Math.sin(a)*430,920,p);i?g.lineTo(x,y):g.moveTo(x,y);}g.strokeStyle=ink;g.lineWidth=mix(32,6,p);g.stroke();
    rect(200,245,1520,545,bg);text('REWARD',960,mix(400,425,p),mix(270,330,p),ink);text('MODEL',960,mix(690,735,p),mix(270,330,p),ink);
    sub('SOFTMAX',960,1010,56,ink);
    break;
   }
  }
  g.restore();
 }
 function renderAt(t){
  t=clamp(t,0,191.999999);let i=cues.findIndex((s,j)=>t>=s.start&&t<(cues[j+1]?.start??192));let s=cues[Math.max(0,i)];
  g=ctx;g.setTransform(sw,0,0,sh,0,0);g.globalAlpha=1;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  const d=.64;
  if(i>0&&t<s.start+d){
   scene(cues[i-1],t);let p=smooth((t-s.start)/d);g.save();g.beginPath();
   const mode=i%4;
   if(mode===0){g.arc(960,540,Math.hypot(960,540)*p,0,TAU);}
   else if(mode===1){g.rect(0,0,1920*p,1080);}
   else if(mode===2){g.rect(0,540-540*p,1920,1080*p);}
   else {g.moveTo(0,0);g.lineTo(1920*p*1.3,0);g.lineTo(1920*p*1.3-576,1080);g.lineTo(0,1080);g.closePath();if(p===1)g.rect(0,0,1920,1080);}
   g.clip();scene(s,t);g.restore();
  }else scene(s,t);
  return canvas;
 }
 return {renderAt,cues};
}
