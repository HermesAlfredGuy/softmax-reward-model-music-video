import json, subprocess, numpy as np
from faster_whisper import WhisperModel
from pathlib import Path
p=Path('/opt/data/projects/softmax-reward-model-music-video')
pcm=subprocess.run(['ffmpeg','-v','error','-i',str(p/'assets/audio.wav'),'-f','s16le','-ac','1','-ar','16000','-'],capture_output=True,check=True).stdout
wav=np.frombuffer(pcm,np.int16).astype(np.float32)/32768
m=WhisperModel('small.en',device='cpu',compute_type='int8',cpu_threads=6)
segs,_=m.transcribe(wav,language='en',vad_filter=False,beam_size=5,word_timestamps=True)
out=[]
for s in segs:
    print(round(s.start,2),round(s.end,2),s.text,flush=True)
    for w in s.words or []:
        out.append({'w':w.word.strip(),'s':round(w.start,3),'e':round(w.end,3)})
(p/'qa/words.json').write_text(json.dumps(out,indent=2))
