import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {createFilm} from '../src/film.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
GlobalFonts.registerFromPath('assets/fonts/Anton-Regular.ttf','Anton');
GlobalFonts.registerFromPath('assets/fonts/IBMPlexMono-Medium.ttf','Plex');
const args=process.argv.slice(2),get=(k,d)=>args.includes('--'+k)?args[args.indexOf('--'+k)+1]:d;
const from=+get('from',0),to=+get('to',192),fps=+get('fps',60),width=+get('width',1920),height=+get('height',1080);
const canvas=createCanvas(width,height),film=createFilm(canvas,createCanvas);
fs.mkdirSync('qa',{recursive:true});fs.mkdirSync('out',{recursive:true});
if(args.includes('--stills')){
 const ts=get('stills','10,34.7,38.8,43,124.8,150.5,190').split(',').map(Number);
 for(const t of ts){film.renderAt(t);const p=`qa/frame-${String(t).replace('.','_')}.png`;fs.writeFileSync(p,canvas.toBuffer('image/png'));console.log(p);}
 process.exit();
}
const out=get('out','out/softmax-reward-model-1080p60.mp4');
const ffargs=['-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${width}x${height}`,'-framerate',`${fps}`,'-i','-','-ss',`${from}`,'-i','assets/audio.wav','-map','0:v','-map','1:a','-t',`${to-from}`,'-c:v','libx264','-preset',get('preset','medium'),'-crf',get('crf','16'),'-threads','6','-pix_fmt','yuv420p','-c:a','aac','-b:a','320k','-ar','48000','-movflags','+faststart',out];
const ff=spawn('ffmpeg',ffargs,{stdio:['pipe','inherit','inherit']});
ff.stdin.on('error',e=>{console.error(e);process.exit(1)});
const t0=performance.now(),n=Math.round((to-from)*fps);let drawMs=0,writeMs=0;
for(let i=0;i<n;i++){
 let a=performance.now();film.renderAt(from+i/fps);drawMs+=performance.now()-a;
 a=performance.now();if(!ff.stdin.write(canvas.data()))await new Promise(r=>ff.stdin.once('drain',r));writeMs+=performance.now()-a;
 if(i%600===0)console.log(`frame ${i}/${n}; ${((performance.now()-t0)/1000).toFixed(1)} s`);
}
ff.stdin.end();let code=await new Promise(r=>ff.on('close',r));if(code)throw new Error('ffmpeg '+code);
const receipt={file:out,width,height,fps,from,to,frames:n,draw_ms_per_frame:drawMs/n,pipe_encode_ms_per_frame:writeMs/n,wall_seconds:(performance.now()-t0)/1000,renderer:'CPU Skia Canvas2D, @napi-rs/canvas 0.1.80',native_frames:true,audio:'preserved source, no DSP; AAC 320k delivery encode'};
fs.writeFileSync(out+'.render.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt,null,2));
