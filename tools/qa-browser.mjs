import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {chromium} from '/opt/data/cache/chrome-installer/node_modules/playwright-core/index.mjs';
const root=path.resolve(fs.existsSync('dist/index.html')?'dist':'.');const mime={'.js':'text/javascript','.html':'text/html','.ttf':'font/ttf','.mp3':'audio/mpeg','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{const rel=new URL(req.url,'http://x').pathname;const f=path.join(root,rel==='/'?'index.html':rel);if(!f.startsWith(root)||!fs.existsSync(f)){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.argv[2]||`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({headless:true,executablePath:'/opt/data/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome',args:['--disable-gpu','--disable-dev-shm-usage','--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const errors=[],failed=[];let report={};
for(const [name,width,height] of [['desktop',1440,1060],['phone',390,844],['render',1920,1080]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
 await page.goto(base+(name==='render'?'?render=1':''));await page.waitForFunction(()=>window.__ready===true);await page.evaluate(()=>window.renderAt(38.9));
 await page.screenshot({path:`qa/browser-${name}.png`,fullPage:true});
 report[name]=await page.evaluate(()=>({fonts:document.fonts.status,canvas:[document.querySelector('canvas').width,document.querySelector('canvas').height],width:innerWidth,scrollWidth:document.documentElement.scrollWidth,ready:window.__ready}));
 if(name==='phone'){
  await page.locator('#play').click();await page.waitForTimeout(700);report.playback=await page.evaluate(()=>({time:document.querySelector('audio').currentTime,paused:document.querySelector('audio').paused}));
  await page.locator('#play').click();await page.locator('#seek').fill('124.9');await page.locator('#seek').dispatchEvent('input');await page.screenshot({path:'qa/browser-phone-bridge.png',fullPage:true});
 }
 await page.close();
}
report.errors=errors;report.failedRequests=failed;fs.writeFileSync('qa/browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();server.close();
