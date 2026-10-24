import fs from 'node:fs';
fs.mkdirSync('dist',{recursive:true});
for(const f of ['index.html','CREDITS.md','DESIGN.md'])fs.copyFileSync(f,'dist/'+f);
fs.mkdirSync('dist/src',{recursive:true});for(const f of ['film.js','cues.js','browser.js'])fs.copyFileSync('src/'+f,'dist/src/'+f);
fs.mkdirSync('dist/assets',{recursive:true});fs.cpSync('assets/fonts','dist/assets/fonts',{recursive:true});fs.copyFileSync('assets/audio.mp3','dist/assets/audio.mp3');
fs.mkdirSync('dist/media',{recursive:true});
for(const [source,target] of [
 ['softmax-reward-model-final-phone.mp4','softmax-reward-model-phone.mp4'],
 ['softmax-reward-model-final-1080p60.mp4','softmax-reward-model-1080p60.mp4']
]){
 const file='out/'+source;
 if(!fs.existsSync(file))throw new Error('Final export missing: '+source);
 if(fs.statSync(file).size>=98e6)throw new Error('Final export exceeds Pages file budget: '+source);
 fs.copyFileSync(file,'dist/media/'+target);
}
if(fs.existsSync('qa/poster.jpg'))fs.copyFileSync('qa/poster.jpg','dist/poster.jpg');
console.log('built static player + real MP4s');
