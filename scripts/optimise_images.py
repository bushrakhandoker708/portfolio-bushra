"""Create the optimised WebP images used by the site.

Sources live in ./legacy-assets (git-ignored originals). Output goes to
src/assets/img. Run with:  python scripts/optimise_images.py
Requires Pillow.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "legacy-assets"
OUT = ROOT / "src" / "assets" / "img"

# (source path, output name, max width)
JOBS = [
    ("Bushra1.png", "portrait.webp", 560),
    # HEXALOCK screenshots copied from github.com/bushrakhandoker708/HEXALOCK
    ("hexalock/hexalock-dashboard.png", "hexalock-dashboard.webp", 1600),
    ("hexalock/storage-stateflow.png", "hexalock-storage-stateflow.webp", 1600),
    ("hexalock/retrieval-stateflow.png", "hexalock-retrieval-stateflow.webp", 1600),
    ("hexalock/barcode-generation.png", "hexalock-barcode.webp", 1600),
    # Live-site captures (scripts/capture_screens.mjs)
    ("screens/relevia-home.png", "relevia-app.webp", 1600),
    # Creative archive selection
    ("PencilSketch/2.jpg", "art-knot.webp", 900),
    ("PencilSketch/4.jpg", "art-chess.webp", 900),
    ("PencilSketch/5.jpg", "art-lion.webp", 900),
    ("PencilSketch/6.jpg", "art-hands.webp", 900),
    ("PencilSketch/7.jpg", "art-glasses.webp", 900),
    ("PencilSketch/15.jpg", "art-tap.webp", 900),
    ("WaterColor/1.jpg", "art-pagoda.webp", 900),
    ("WaterColor/4.jpg", "art-lantern.webp", 900),
    ("WaterColor/9.jpg", "art-bottle.webp", 900),
    ("acrylic/5.jpg", "art-ship.webp", 900),
    ("acrylic/3.jpg", "art-blossom.webp", 900),
    ("illustration/kodom.jpg", "art-kadam.webp", 900),
    ("modeling/can.png", "render-cans.webp", 1200),
    ("modeling/space_ship.png", "render-spaceship.webp", 1200),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for src, name, max_w in JOBS:
        path = SRC / src
        if not path.exists():
            print(f"skip (missing): {src}")
            continue
        im = Image.open(path)
        im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
        if im.width > max_w:
            im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
        dest = OUT / name
        im.save(dest, "WEBP", quality=80, method=6)
        print(f"{name}: {im.width}x{im.height}, {dest.stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
