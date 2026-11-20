// Art and making. Images are optimised copies (scripts/optimise_images.py).
// Titles, years and notes are Bushra's own, from the previous portfolio
// (main branch, src/sections/Art.jsx), shortened. Three pieces had no title
// there and keep a plain descriptive one (docs/CONTENT_VERIFICATION.md item 18).
const files = import.meta.glob("../assets/img/{art,craft,render}-*.webp", { eager: true, import: "default" });
const img = (name) => files[`../assets/img/${name}.webp`];

export { ART_PORTFOLIO } from "./site";

export const ART_CATEGORIES = ["Acrylic", "Watercolour", "Graphite", "Digital", "Models & making", "3D"];

export const artwork = [
  { src: img("art-mosque"), title: "Reflections of Serenity", year: 2020, medium: "Acrylic", w: 900, h: 695, note: "The Blue Mosque at sunset, its minarets mirrored in still water." },
  { src: img("art-ship"), title: "Echoes of Resilience", year: 2019, medium: "Acrylic", w: 900, h: 1153, note: "Time passing, and people holding on through hard times." },
  { src: img("art-forest"), title: "Winter's Veiled Whispers", year: 2023, medium: "Acrylic", w: 900, h: 709, note: "Mist over a silent forest, the trees half there." },
  { src: img("art-peacock"), title: "Iridescent Plume", year: 2020, medium: "Acrylic", w: 781, h: 995, note: "A peacock feather as a quill: drawing and writing catching what we imagine." },
  { src: img("art-blossom"), title: "Sanguine Bloom", year: 2018, medium: "Acrylic", w: 900, h: 1141, note: "A lone crimson flower hovering over still water." },
  { src: img("art-city"), title: "Boston Reverie", year: 2021, medium: "Acrylic", w: 900, h: 720, note: "Old grandeur and new energy in one city." },
  { src: img("art-bouquet"), title: "Floral Genesis", year: 2017, medium: "Acrylic", w: 900, h: 1128, note: "A flower opening, for the potential each of us carries." },
  { src: img("art-sunset"), title: "Eternal Dawn", year: 2024, medium: "Acrylic", w: 900, h: 900, note: "Muted twilight slowly giving way to light." },
  { src: img("art-pagoda"), title: "Celestial Harmony", year: 2024, medium: "Watercolour", w: 900, h: 1270, note: "The curves and details of old Chinese architecture." },
  { src: img("art-lantern"), title: "Illuminated Reverie", year: 2024, medium: "Watercolour", w: 846, h: 1280, note: "A familiar street at night, lit by its lamps." },
  { src: img("art-bottle"), title: "Bottled Celestial Reverie", year: 2020, medium: "Watercolour", w: 900, h: 1244, note: "A night sky and a hot-air balloon, kept inside a glass bottle." },
  { src: img("art-knot"), title: "Ties That Bind", year: 2019, medium: "Graphite", w: 900, h: 898, note: "Intertwined forms, about how people hold each other up." },
  { src: img("art-hands"), title: "Interlocked Heartbeats", year: 2024, medium: "Graphite", w: 900, h: 900, note: "Interlaced fingers as a picture of connection." },
  { src: img("art-chess"), title: "Quiet Stratagem", year: 2020, medium: "Graphite", w: 900, h: 908, note: "The stillness of a chessboard mid-game." },
  { src: img("art-glasses"), title: "Glassware", medium: "Graphite", w: 900, h: 896, note: "A study of glass, light and reflection." },
  { src: img("art-lion"), title: "Roar of the Wild King", year: 2024, medium: "Graphite", w: 900, h: 898, note: "A lion's mane, strand by strand." },
  { src: img("art-tap"), title: "Sparrow's Solace", year: 2024, medium: "Graphite", w: 900, h: 1253, note: "A sparrow on an old tap, watching a single drop." },
  { src: img("art-kadam"), title: "Monsoon Whisper", year: 2022, medium: "Digital", w: 900, h: 900, note: "The kadam flower, which in Bengal means the monsoon has come." },
  { src: img("art-reef"), title: "Abyssal Dominion", year: 2023, medium: "Digital", w: 900, h: 900, note: "A lost kingdom in blue and pink, deep under the sea." },
  { src: img("art-music"), title: "Symphony of Imagination", year: 2021, medium: "Digital", w: 900, h: 900, note: "A logo joining a brushstroke, a camera lens and music." },
  { src: img("craft-relief"), title: "Folded paper relief", medium: "Models & making", w: 900, h: 675, note: "Paper folded into light and shadow." },
  { src: img("craft-folded-plan"), title: "Echoes of Line", year: 2024, medium: "Models & making", w: 900, h: 675, note: "Bamboo sticks set into cork, from organic pattern to structure." },
  { src: img("craft-pin-field"), title: "Void and Form", year: 2024, medium: "Models & making", w: 900, h: 1200, note: "A dialogue in dots, from observation to abstraction." },
  { src: img("craft-folded-form"), title: "Incarnate Anxiety", year: 2024, medium: "Models & making", w: 900, h: 1200, note: "Inner turmoil given a body of fragmented planes." },
  { src: img("craft-strip-model"), title: "Strip model", medium: "Models & making", w: 900, h: 1200, note: "A form built up from thin strips." },
  { src: img("craft-clay"), title: "The Watchful Gaze", year: 2024, medium: "Models & making", w: 900, h: 675, note: "Clay, brain-like forms about social anxiety and being seen." },
  { src: img("craft-chess-set"), title: "Terra's Gambit", year: 2025, medium: "Models & making", w: 900, h: 675, note: "A chess set moulded by hand from raw clay." },
  { src: img("render-cans"), title: "A Digital Rhapsody", year: 2023, medium: "3D", w: 1200, h: 675, note: "Modelled in Blender, labels designed in Illustrator." },
  { src: img("render-spaceship"), title: "Nebular Vessel", year: 2023, medium: "3D", w: 1200, h: 675, note: "A Blender spacecraft with a clear hull and glowing cores." },
];

// A small cross-section for the home page.
export const artHighlights = ["Reflections of Serenity", "Echoes of Resilience", "Ties That Bind", "Celestial Harmony", "Terra's Gambit", "Nebular Vessel"].map((t) =>
  artwork.find((a) => a.title === t),
);
