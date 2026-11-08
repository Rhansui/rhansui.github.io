# -*- coding: utf-8 -*-
"""
Resimlerin beyaz arka planini silip seffaf PNG yapar.
- sketch_*  : murekkep cizimi -> koyuluk = gorunurluk (parsomene tam oturur)
- digerleri : kenarlardan baslayan beyazi "sel doldurma" ile siler (parlak pirinc ici korunur)
Cikti: assets/cut/<ad>.png
Kullanim: python tools/arka_plan_sil.py
"""
import os
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GIRIS = os.path.join(KOK, "assets")
CIKIS = os.path.join(GIRIS, "cut")
ATLA = {"bg_parchment_table", "conveyor_segment"}  # bunlar oldugu gibi kalir (bant ayrica islenir)


def bul(ad):
    for uz in (".png", ".jpg", ".jpeg", ".webp"):
        p = os.path.join(GIRIS, ad + uz)
        if os.path.exists(p):
            return p
    return None


def kirp(img):
    a = np.array(img)[:, :, 3]
    ys, xs = np.where(a > 10)
    if len(xs) == 0:
        return img
    pad = 6
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, img.width)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, img.height)
    return img.crop((x0, y0, x1, y1))


def murekkep(path):
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im).astype(np.float32)
    lum = arr.mean(axis=2)
    alpha = np.clip((235 - lum) * 1.6, 0, 255)
    # Sepya murekkep rengi
    ink = np.zeros_like(arr)
    ink[:, :, 0], ink[:, :, 1], ink[:, :, 2] = 70, 42, 20
    k = (lum / 255.0)[..., None] * 0.5
    rgb = ink * (1 - k) + arr * k
    out = np.dstack([rgb, alpha]).astype(np.uint8)
    return kirp(Image.fromarray(out, "RGBA"))


def sel_doldur(path, tol=28):
    im = Image.open(path).convert("RGB")
    if max(im.size) > 1024:
        im.thumbnail((1024, 1024), Image.LANCZOS)
    arr = np.asarray(im).astype(np.int16)
    h, w, _ = arr.shape
    # Kose renklerinden arka plan rengi
    kose = np.array([arr[0, 0], arr[0, -1], arr[-1, 0], arr[-1, -1]]).mean(axis=0)
    fark = np.abs(arr - kose).max(axis=2)
    aday = fark < tol
    mask = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if aday[y, x] and not mask[y, x]:
                mask[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if aday[y, x] and not mask[y, x]:
                mask[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and aday[ny, nx] and not mask[ny, nx]:
                mask[ny, nx] = True; q.append((ny, nx))
    # Kenara değmeyen iç boşluklardaki (çark aralığı, üçgen içi) saf beyazı da sil
    mn, mx = arr.min(axis=2), arr.max(axis=2)
    ic_beyaz = (mn > 228) & ((mx - mn) < 14)
    mask = mask | ic_beyaz
    alpha = Image.fromarray(np.where(mask, 0, 255).astype(np.uint8))
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    return kirp(out)


def main():
    os.makedirs(CIKIS, exist_ok=True)
    for f in sorted(os.listdir(GIRIS)):
        ad, uz = os.path.splitext(f)
        if uz.lower() not in (".png", ".jpg", ".jpeg", ".webp") or ad in ATLA:
            continue
        p = os.path.join(GIRIS, f)
        img = murekkep(p) if ad.startswith("sketch_") else sel_doldur(p)
        img.save(os.path.join(CIKIS, ad + ".png"))
        print("OK", ad, img.size)
    b = bul("conveyor_segment")
    if b:
        img = sel_doldur(b)
        img.save(os.path.join(CIKIS, "conveyor_segment.png"))
        print("OK conveyor_segment", img.size)


if __name__ == "__main__":
    main()
