import os
import sys
import io
import urllib.request
from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
os.makedirs(OUT, exist_ok=True)

IMAGES = {
    "hero-train": "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80&auto=format&fit=crop",
    "passenger-train": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80&auto=format&fit=crop",
    "railway-track": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80&auto=format&fit=crop",
    "metro-train": "https://images.unsplash.com/photo-1441716844725-09cedc13a4e7?w=1200&q=80&auto=format&fit=crop",
    "train-interior": "https://images.unsplash.com/photo-1519558260268-cde7e03a0152?w=1200&q=80&auto=format&fit=crop",
    "train-window": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200&q=80&auto=format&fit=crop",
    "engine-front": "https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=1200&q=80&auto=format&fit=crop",
    "station-clock": "https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=1200&q=80&auto=format&fit=crop",
    "passengers-platform": "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=1200&q=80&auto=format&fit=crop",
    "freight-train": "https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=1200&q=80&auto=format&fit=crop",
    "train-ticket": "https://images.unsplash.com/photo-1454923634634-bd1614719a7b?w=1200&q=80&auto=format&fit=crop",
    "sleeper-coach": "https://images.unsplash.com/photo-1535535112387-56ffe8db21ff?w=1200&q=80&auto=format&fit=crop",
    "railway-signal": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&q=80&auto=format&fit=crop",
    "train-station": "https://images.unsplash.com/photo-1483181957632-8bda974cbc91?w=1200&q=80&auto=format&fit=crop",
    "mountain-train": "https://images.unsplash.com/photo-1465343161283-c1959138ddaa?w=1200&q=80&auto=format&fit=crop",
    "night-train": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80&auto=format&fit=crop",
    "catering": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop",
    "map-route": "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&q=80&auto=format&fit=crop",
}

MAX_BYTES = 98 * 1024
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def download(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def compress_to_webp(img, target=MAX_BYTES):
    img = img.convert("RGB")
    for max_w in (1400, 1100, 900, 700, 520):
        if img.size[0] > max_w:
            w, h = img.size
            img = img.resize((max_w, int(h * max_w / w)), Image.LANCZOS)
        for q in (82, 74, 66, 58, 50, 42, 34, 26, 20):
            buf = io.BytesIO()
            img.save(buf, "WEBP", quality=q, method=6)
            data = buf.getvalue()
            if len(data) <= target:
                return data
    return buf.getvalue()


def process(name, url):
    out_path = os.path.join(OUT, name + ".webp")
    try:
        data = download(url)
        img = Image.open(io.BytesIO(data))
        img = img.convert("RGB")
        webp = compress_to_webp(img)
        with open(out_path, "wb") as f:
            f.write(webp)
        size_kb = len(webp) / 1024
        status = "OK" if len(webp) <= MAX_BYTES else "TOO BIG"
        print(f"{status:8s} {name:22s} {img.size[0]}x{img.size[1]} -> {size_kb:.1f}KB")
        return len(webp) <= MAX_BYTES
    except Exception as e:
        print(f"FAIL     {name:22s} {e}")
        return False


failures = []
for name, url in IMAGES.items():
    if not process(name, url):
        failures.append(name)

print()
print(f"Total: {len(IMAGES)}  Failures: {len(failures)} -> {failures}")
