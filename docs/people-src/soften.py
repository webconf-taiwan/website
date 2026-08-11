#!/usr/bin/env python3
# soften.py — 去背 PNG 的「切邊柔化」。
#
# 為什麼需要：講者照多半是半身像，人的胸口／肩膀本來就被原始照片的邊界切平。
# 直接裁到 alpha bbox 再取樣成點雲，那條平的邊會變成一刀切的硬邊，
# 看起來像被版面裁掉，而不是像標本自然消散。
#
# 做法：偵測主體「碰到畫布哪幾側」，只對那幾側套 alpha 漸層。
# PLImage.prepare 是用 alpha 當輪廓、亮度當密度，所以 alpha 漸弱 = 點雲漸稀 = 自然淡出。
#
# 用法： python3 soften.py <in.png> <out.png> [fade=0.18] [edge=480]
#   fade  漸層佔主體短邊的比例（0.18 = 18%）
#   edge  輸出長邊上限（PLImage 只取樣到 480px，再大是浪費）
import sys
from PIL import Image, ImageChops, ImageDraw

ALPHA_ON = 8        # 視為「有東西」的 alpha 門檻
TOUCH_TOL = 2       # bbox 距畫布邊界幾 px 內算「被切到」


def soften(src, dst, fade=0.18, edge=480):
    im = Image.open(src).convert('RGBA')
    mask = im.getchannel('A').point(lambda v: 255 if v > ALPHA_ON else 0)
    bb = mask.getbbox()
    if not bb:
        raise SystemExit(f'{src}: 整張都是透明的')

    im = im.crop(bb)
    w, h = im.size
    x0, y0, x1, y1 = bb
    W, H = Image.open(src).size

    # 只淡化「原本就被切到」的那幾側；沒被切到的邊是主體真正的輪廓，不能動
    touched = {
        'left': x0 <= TOUCH_TOL,
        'right': x1 >= W - TOUCH_TOL,
        'top': y0 <= TOUCH_TOL,
        'bottom': y1 >= H - TOUCH_TOL,
    }
    span = int(min(w, h) * fade)

    # 疊一張灰階漸層遮罩再乘進 alpha。
    # ⚠️ 不能直接改 getchannel('A') ——那回傳的是複本，改它不會動到原圖。
    if span > 0:
        # ⚠️ 每一側要各自算一張再取最小值，不能畫在同一張上：
        # 兩側都要淡化時（例如左＋下），後畫的那側在 i 大的地方 k≈255，
        # 會把先畫好的另一側又蓋回不透明。取 min = 由「最近的那個切邊」決定淡化程度。
        ramp = Image.new('L', (w, h), 255)
        for side in (k for k, v in touched.items() if v):
            one = Image.new('L', (w, h), 255)
            draw = ImageDraw.Draw(one)
            for i in range(span):
                u = i / span
                k = int(255 * (u * u * (3 - 2 * u)))   # smoothstep，比線性更像自然消散
                if side == 'bottom':
                    draw.line([(0, h - 1 - i), (w - 1, h - 1 - i)], fill=k)
                elif side == 'top':
                    draw.line([(0, i), (w - 1, i)], fill=k)
                elif side == 'right':
                    draw.line([(w - 1 - i, 0), (w - 1 - i, h - 1)], fill=k)
                else:
                    draw.line([(i, 0), (i, h - 1)], fill=k)
            ramp = ImageChops.darker(ramp, one)
        r, g, b, alpha = im.split()
        im = Image.merge('RGBA', (r, g, b, ImageChops.multiply(alpha, ramp)))

    im.thumbnail((edge, edge), Image.LANCZOS)
    im.save(dst, optimize=True)
    sides = ', '.join(k for k, v in touched.items() if v) or '無'
    print(f'{dst}  {im.size[0]}x{im.size[1]}  淡化側邊: {sides}  漸層 {span}px')


if __name__ == '__main__':
    if len(sys.argv) < 3:
        raise SystemExit('用法: python3 soften.py <in.png> <out.png> [fade] [edge]')
    soften(
        sys.argv[1], sys.argv[2],
        float(sys.argv[3]) if len(sys.argv) > 3 else 0.18,
        int(sys.argv[4]) if len(sys.argv) > 4 else 480,
    )
