#!/usr/bin/env python3
# bake.py — 去背 PNG → 粒子點雲 JSON（PLImage.prepare 的 Python 移植）。
# 產出的 v:1 資料格式與瀏覽器 PLImage.prepare(url).data 完全相容，
# 正式站用 PLImage.prepareFromData(json) 載入。
# 用法： python3 bake.py <in.png> <out.json> <name> [count=32000]
# 見 docs/point-cloud-effect.md §7.4。
import sys, json, base64, bisect
from array import array
from PIL import Image

SAMPLE_EDGE = 480
COLORS = 7
LUMA_BIAS = 0.6
SEED = 1926

def mulberry32(seed):
    seed &= 0xFFFFFFFF
    def rnd():
        nonlocal seed
        seed = (seed + 0x6D2B79F5) & 0xFFFFFFFF
        t = seed
        t = (t ^ (t >> 15)) * (1 | seed) & 0xFFFFFFFF
        t = (t + ((t ^ (t >> 7)) * (61 | t) & 0xFFFFFFFF)) & 0xFFFFFFFF ^ t
        t &= 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296
    return rnd

def quantize(colors, k, n, rnd):
    cent = [0.0] * (k * 3)
    for c in range(k):
        i = int(rnd() * n)
        cent[c*3], cent[c*3+1], cent[c*3+2] = colors[i*3], colors[i*3+1], colors[i*3+2]
    assign = [0] * n
    for _ in range(10):
        for i in range(n):
            r, g, b = colors[i*3], colors[i*3+1], colors[i*3+2]
            bd, bc = float('inf'), 0
            for c in range(k):
                dr = r - cent[c*3]; dg = g - cent[c*3+1]; db = b - cent[c*3+2]
                d = dr*dr + dg*dg + db*db
                if d < bd: bd, bc = d, c
            assign[i] = bc
        s = [0.0] * (k * 4)
        for i in range(n):
            c = assign[i]
            s[c*4] += colors[i*3]; s[c*4+1] += colors[i*3+1]
            s[c*4+2] += colors[i*3+2]; s[c*4+3] += 1
        for c in range(k):
            cnt = s[c*4+3]
            if cnt > 0:
                cent[c*3] = s[c*4]/cnt; cent[c*3+1] = s[c*4+1]/cnt; cent[c*3+2] = s[c*4+2]/cnt
            else:
                i = int(rnd() * n)
                cent[c*3], cent[c*3+1], cent[c*3+2] = colors[i*3], colors[i*3+1], colors[i*3+2]
    return cent, assign

def hexc(v):
    return format(max(0, min(255, round(v))), '02x')

def b64_u16(f32):  # Float32 0..1 → Uint16 LE → base64
    u = array('H', (min(65535, max(0, round(min(1.0, max(0.0, v)) * 65535))) for v in f32))
    if sys.byteorder != 'little':
        u.byteswap()
    return base64.b64encode(u.tobytes()).decode('ascii')

def b64_u8(u8):
    return base64.b64encode(bytes(u8)).decode('ascii')

def main():
    in_path, out_path, name = sys.argv[1], sys.argv[2], sys.argv[3]
    count = int(sys.argv[4]) if len(sys.argv) > 4 else 32000

    img = Image.open(in_path).convert('RGBA')
    W0, H0 = img.size
    scale = min(1.0, SAMPLE_EDGE / max(W0, H0))
    w = max(1, round(W0 * scale)); h = max(1, round(H0 * scale))
    if (w, h) != (W0, H0):
        img = img.resize((w, h), Image.LANCZOS)
    px_data = img.load()

    # 加權（alpha 為輪廓、亮度為密度）
    weights = [0.0] * (w * h)
    for y in range(h):
        for x in range(w):
            r, g, b, a8 = px_data[x, y]
            a = a8 / 255
            if a < 0.5: continue
            luma = (0.2126*r + 0.7152*g + 0.0722*b) / 255
            weights[y*w + x] = a * ((1 - LUMA_BIAS) + LUMA_BIAS * (luma ** 0.85))
    cum = [0.0] * (w * h)
    acc = 0.0
    for p in range(w * h):
        acc += weights[p]; cum[p] = acc
    if acc <= 0:
        raise SystemExit('image has no opaque pixels')

    rnd = mulberry32(SEED)
    px = [0.0]*count; py = [0.0]*count; colorArr = [0.0]*(count*3)
    for i in range(count):
        target = rnd() * acc
        lo = bisect.bisect_left(cum, target)
        if lo >= w*h: lo = w*h - 1
        x = lo % w; y = lo // w
        px[i] = (x + rnd()) / w
        py[i] = (y + rnd()) / h
        r, g, b, _ = px_data[x, y]
        colorArr[i*3], colorArr[i*3+1], colorArr[i*3+2] = r, g, b

    cent, assign = quantize(colorArr, COLORS, count, rnd)
    order = sorted(range(COLORS), key=lambda c: -(0.2126*cent[c*3] + 0.7152*cent[c*3+1] + 0.0722*cent[c*3+2]))
    rank = [0]*COLORS
    for i, c in enumerate(order): rank[c] = i
    palette = ['#' + hexc(cent[c*3]) + hexc(cent[c*3+1]) + hexc(cent[c*3+2]) for c in order]
    types = [rank[assign[i]] for i in range(count)]

    data = {
        'v': 1, 'name': name, 'count': count, 'aspect': w / h,
        'palette': palette,
        'x': b64_u16(px), 'y': b64_u16(py), 't': b64_u8(types),
    }
    with open(out_path, 'w') as f:
        json.dump(data, f, separators=(',', ':'))
    print(f'wrote {out_path}  count={count} aspect={w/h:.4f} palette={palette}')

if __name__ == '__main__':
    main()
