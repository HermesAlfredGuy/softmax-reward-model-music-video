import json,subprocess,hashlib
from pathlib import Path
import numpy as np
p=Path(__file__).resolve().parents[1]
import sys
v=p/('out/softmax-reward-model-1080p60.mp4' if len(sys.argv)<2 else sys.argv[1])
def cmd(a): return subprocess.run(a,capture_output=True,check=True).stdout
probe=json.loads(cmd(['ffprobe','-v','error','-count_frames','-show_entries','format=duration,size:stream=codec_name,width,height,r_frame_rate,avg_frame_rate,nb_read_frames,duration,start_time','-of','json',str(v)]))
pack=json.loads(cmd(['ffprobe','-v','error','-select_streams','v:0','-show_entries','packet=pts_time,duration_time','-of','json',str(v)]))['packets']
pts=sorted(float(x['pts_time']) for x in pack);d=np.diff(pts)
source=p/'assets/audio.wav'
def pcm(path):return np.frombuffer(cmd(['ffmpeg','-v','error','-i',str(path),'-ac','1','-ar','16000','-f','f32le','-']),dtype=np.float32)
a,b=pcm(source),pcm(v);sync=[]
for t in [8.86,33.96,80.34,105.88,121.59,136.93,159.72,182.34,190]:
 k=int(t*16000);x=a[k:k+8000];y=b[k:k+8000]
 corr=float(np.corrcoef(x,y)[0,1]);best=max(range(-160,161),key=lambda lag:np.dot(x[160:-160],b[k+160+lag:k+len(x)-160+lag]));sync.append({'time_s':t,'correlation':round(corr,6),'best_lag_samples_16k':best})
samples=[('start',1.5),('title',7.5),('verse1',10),('signal',15),('cursor',19),('approval',24),('chorus1',34.8),('climbing',36.8),('goodbot',38.9),('corpus',42.9),('verse2',57),('borrowed',61),('chorus2',81),('instrumental',99),('bridge',109.7),('no',112.5),('yes',122.5),('collapse',123.5),('nothing',124.9),('confess',128),('finalchorus',137.8),('entropy',148.7),('gradient',157.4),('reward',160.9),('outro',172),('lastrefrain',184),('ending',191.8)]
for i,(name,t) in enumerate(samples):
 f=p/f'qa/export-{name}.png';subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(v),'-frames:v','1',str(f)],check=True)
report={'probe':probe,'frame_pacing':{'packets':len(pts),'min_delta_s':float(d.min()),'max_delta_s':float(d.max()),'max_error_from_1_60_s':float(np.max(abs(d-1/60)))},'audio_boundary_checks':sync,'audio_source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'file_sha256':hashlib.sha256(v.read_bytes()).hexdigest(),'coverage':samples}
(p/'qa/video-integrity.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
