from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import sys
p=Path(__file__).resolve().parents[1]
files=sorted((p/'qa').glob('frame-*.png'),key=lambda x:float(x.stem[6:].replace('_','.')))
w=480;h=270;cols=4
im=Image.new('RGB',(cols*w,((len(files)+cols-1)//cols)*(h+35)),(20,23,19));d=ImageDraw.Draw(im)
for i,f in enumerate(files):
 x=i%cols*w;y=i//cols*(h+35);im.paste(Image.open(f).convert('RGB').resize((w,h),Image.Resampling.LANCZOS),(x,y));d.text((x+12,y+h+8),f.stem,fill='#f0eddf')
im.save(p/'qa'/('contact-sheet.png' if len(sys.argv)<2 else sys.argv[1]))
