import json
from PIL import Image,ImageDraw
from pathlib import Path
p=Path(__file__).resolve().parents[1]
samples=json.loads((p/'qa/video-integrity.json').read_text())['coverage']
cols=4;w=480;h=270;im=Image.new('RGB',(cols*w,((len(samples)+cols-1)//cols)*(h+30)),(20,23,19));draw=ImageDraw.Draw(im)
for i,(name,t) in enumerate(samples):
 f=p/f'qa/export-{name}.png';x=i%cols*w;y=i//cols*(h+30);im.paste(Image.open(f).resize((w,h),Image.Resampling.LANCZOS),(x,y));draw.text((x+10,y+h+8),f'{t:06.2f}s / {name}',fill='#f0eddf')
im.save(p/'qa/export-coverage.png')
