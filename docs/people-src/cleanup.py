#!/usr/bin/env python3
# cleanup.py — 去背 PNG 後製：轉正 EXIF、裁到 alpha 邊界、alpha 收縮 1px 去殘邊。
# 用法： python3 cleanup.py <輸入png> <輸出png> [margin_ratio]
# 見 docs/point-cloud-effect.md §7.4。
import sys
from PIL import Image, ImageOps, ImageFilter

def main():
    if len(sys.argv) < 3:
        print("usage: python3 cleanup.py <in.png> <out.png> [margin]", file=sys.stderr)
        sys.exit(2)
    in_path, out_path = sys.argv[1], sys.argv[2]
    margin = float(sys.argv[3]) if len(sys.argv) > 3 else 0.02

    img = Image.open(in_path)
    img = ImageOps.exif_transpose(img)   # 依 EXIF 轉正
    img = img.convert("RGBA")

    r, g, b, a = img.split()
    # alpha 收縮 1px：MinFilter(3) 吃掉半透明外緣，去掉去背殘留的一圈背景色
    a = a.filter(ImageFilter.MinFilter(3))
    img = Image.merge("RGBA", (r, g, b, a))

    # 裁到不透明內容的邊界（+margin）
    bbox = a.getbbox()
    if bbox:
        x0, y0, x1, y1 = bbox
        mx = int((x1 - x0) * margin)
        my = int((y1 - y0) * margin)
        x0 = max(0, x0 - mx); y0 = max(0, y0 - my)
        x1 = min(img.width, x1 + mx); y1 = min(img.height, y1 + my)
        img = img.crop((x0, y0, x1, y1))

    img.save(out_path)
    print(f"wrote {out_path} ({img.width}x{img.height})")

if __name__ == "__main__":
    main()
