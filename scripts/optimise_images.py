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
    # More artwork (art & making page)
    ("acrylic/1.jpg", "art-mosque.webp", 900),
    ("acrylic/2.jpg", "art-forest.webp", 900),
    ("acrylic/4.jpg", "art-city.webp", 900),
    ("acrylic/6.jpg", "art-peacock.webp", 900),
    ("acrylic/7.jpg", "art-bouquet.webp", 900),
    ("acrylic/9.jpg", "art-sunset.webp", 900),
    ("illustration/1.jpg", "art-reef.webp", 900),
    ("illustration/3.png", "art-music.webp", 900),
    ("crafts/1.jpg", "craft-relief.webp", 900),
    ("crafts/3.jpg", "craft-folded-plan.webp", 900),
    ("crafts/4.jpg", "craft-pin-field.webp", 900),
    ("crafts/5.jpg", "craft-folded-form.webp", 900),
    ("crafts/6.jpg", "craft-clay.webp", 900),
    ("crafts/7.jpg", "craft-strip-model.webp", 900),
    ("crafts/10.jpg", "craft-chess-set.webp", 900),
    # Moments (process and events)
    ("gallery/2023_physics_olympiad.jpg", "moment-physics-olympiad.webp", 1000),
    ("gallery/science_fair.jpg", "moment-science-fair.webp", 1000),
    ("gallery/2023_cadetship.jpg", "moment-cadetship.webp", 1000),
    # Process images for projects
    ("hexalock/locker-operation.png", "hexalock-locker.webp", 1400),
    ("screens/studybuddy-home.png", "studybuddy-home.webp", 1200),
    # Bushal storefront, cropped to the headline so no unverified metrics are shown
    ("screens/bushal-home.png", "bushal-store.webp", 1400, (0, 80, 700, 580)),
    # Cosmic backdrops: the nebula the bubbles reflect, and the page backdrop
    ("background.jpg", "space-env.webp", 1024),
    ("universe2.jpg", "cosmos.webp", 1920),
    ("universe2.jpg", "cosmos-sm.webp", 900),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for job in JOBS:
        src, name, max_w = job[:3]
        crop = job[3] if len(job) > 3 else None
        path = SRC / src
        if not path.exists():
            print(f"skip (missing): {src}")
            continue
        im = Image.open(path)
        im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
        if crop:
            im = im.crop(crop)
        if im.width > max_w:
            im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
        dest = OUT / name
        quality = 55 if name.startswith(("cosmos", "space-env")) else 80
        im.save(dest, "WEBP", quality=quality, method=6)
        print(f"{name}: {im.width}x{im.height}, {dest.stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
