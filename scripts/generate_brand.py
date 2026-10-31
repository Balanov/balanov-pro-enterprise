from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / 'build'
FONT = ImageFont.truetype(str(BUILD / 'segoeuib.ttf'), 236)
FONT_SMALL = ImageFont.truetype(str(BUILD / 'segoeuib.ttf'), 34)
FONT_SIDEBAR = ImageFont.truetype(str(BUILD / 'segoeuib.ttf'), 19)
FONT_TEXT = ImageFont.truetype(str(BUILD / 'segoeuib.ttf'), 12)
NAVY = '#142B45'
BLUE = '#82AAFC'
MUTED = '#65788B'


def mark(size=512):
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    pad = round(size * 0.055)
    draw.rounded_rectangle((pad, pad, size - pad, size - pad), radius=round(size * 0.22), fill=NAVY)
    font = ImageFont.truetype(str(BUILD / 'segoeuib.ttf'), round(size * 0.49))
    draw.text((size * 0.47, size * 0.44), 'B', font=font, fill='white', anchor='mm')
    radius = round(size * 0.025)
    cx, cy = size * 0.69, size * 0.68
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=BLUE)
    return image


icon = mark()
icon.save(BUILD / 'icon.png')
for name in ['icon.ico', 'installerIcon.ico', 'uninstallerIcon.ico', 'installerHeaderIcon.ico']:
    icon.save(BUILD / name, sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])

sidebar = Image.new('RGB', (164, 314), '#F4F6F8')
draw = ImageDraw.Draw(sidebar)
sidebar.paste(icon.resize((54, 54), Image.Resampling.LANCZOS), (20, 24), icon.resize((54, 54), Image.Resampling.LANCZOS))
draw.text((20, 94), 'Balanov.PRO', font=FONT_SIDEBAR, fill=NAVY)
draw.text((20, 122), 'ENTERPRISE', font=FONT_TEXT, fill=MUTED)
draw.line((20, 155, 143, 155), fill='#D8E0E8', width=1)
draw.multiline_text((20, 177), 'Проверяемые\nрешения для\nB2B и B2G', font=FONT_TEXT, fill=MUTED, spacing=8)
draw.text((20, 282), 'Локальный ИИ', font=FONT_TEXT, fill='#4E7967')
sidebar.save(BUILD / 'installerSidebar.bmp')

header = Image.new('RGB', (150, 57), 'white')
draw = ImageDraw.Draw(header)
header.paste(icon.resize((38, 38), Image.Resampling.LANCZOS), (101, 8), icon.resize((38, 38), Image.Resampling.LANCZOS))
draw.text((12, 18), 'Enterprise', font=FONT_TEXT, fill=NAVY)
header.save(BUILD / 'installerHeader.bmp')
(BUILD / 'segoeuib.ttf').unlink()
print('Balanov.PRO Enterprise brand assets generated')
