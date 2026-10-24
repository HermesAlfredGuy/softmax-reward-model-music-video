import fs from 'node:fs';import {createHash} from 'node:crypto';import {createCanvas,GlobalFonts} from '@napi-rs/canvas';import {createFilm} from '../src/film.js';
GlobalFonts.registerFromPath('assets/fonts/Anton-Regular.ttf','Anton');GlobalFonts.registerFromPath('assets/fonts/IBMPlexMono-Medium.ttf','Plex');
const c=createCanvas(1920,1080),f=createFilm(c,createCanvas),out=[];
for(const t of [0,38.9,38.9+1/60,124.9,124.9+1/60,150.7,191.98,38.9,124.9]){f.renderAt(t);out.push({t,hash:createHash('sha256').update(c.data()).digest('hex')});}
const report={samples:out,random_access_determinism:out[1].hash===out[7].hash&&out[3].hash===out[8].hash,adjacent_sixtieths_differ:out[1].hash!==out[2].hash&&out[3].hash!==out[4].hash,cue_count:f.cues.length-1};
fs.writeFileSync('qa/determinism.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
