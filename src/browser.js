import {createFilm} from './film.js';
const params=new URLSearchParams(location.search),canvas=document.getElementById('film'),audio=document.getElementById('audio');
if(params.has('render')){document.body.dataset.render='1';canvas.width=innerWidth;canvas.height=innerHeight;}
await Promise.all([document.fonts.load('100px Anton'),document.fonts.load('40px Plex')]);await document.fonts.ready;
const film=createFilm(canvas,(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h}));
window.DEMO={width:1920,height:1080,fps:60,duration:192};window.renderAt=t=>{film.renderAt(t);};window.renderAt(0);window.__ready=true;
document.getElementById('load').remove();
const play=document.getElementById('play'),seek=document.getElementById('seek'),clock=document.getElementById('clock');
if(params.has('video')){
 canvas.style.display='none';const video=document.getElementById('video');video.style.display='block';video.src='media/softmax-reward-model-phone.mp4';
 for(const el of [play,seek,clock])el.style.display='none';
 const back=document.querySelector('a[href="?video=1"]');back.href='./';back.textContent='Live type player';
}
play.onclick=async()=>{if(audio.paused){await audio.play();play.textContent='PAUSE';}else{audio.pause();play.textContent='PLAY FILM ↗';}};
const timeLabel=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')} / 3:12`;
seek.oninput=()=>{audio.currentTime=+seek.value;window.renderAt(+seek.value);clock.textContent=timeLabel(+seek.value);};
audio.onended=()=>{play.textContent='PLAY AGAIN ↗';};
function raf(){if(!audio.paused){const t=audio.currentTime;window.renderAt(t);seek.value=t;clock.textContent=timeLabel(t);}requestAnimationFrame(raf);}if(!params.has('render'))requestAnimationFrame(raf);
