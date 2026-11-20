/** @type {import('tailwindcss').Config} */
// Colours resolve to CSS custom properties defined in src/styles/index.css.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        raised: token("raised"),
        ink: token("ink"),
        muted: token("muted"),
        faint: token("faint"),
        rule: token("rule"),
        teal: token("teal"),
        lavender: token("lavender"),
        amber: token("amber"),
        danger: token("danger"),
        mauve: token("mauve"),
        champagne: token("champagne"),
        sky: token("sky"),
        gold: token("gold"),
        rose: token("rose"),
        accent: token("accent"),
        "accent-2": token("accent-2"),
      },
      fontFamily: {
        // Each web font is followed by a metric-matched local fallback (see
        // src/styles/index.css) so the swap does not shift the layout.
        serif: ['"Playfair Display Variable"', '"Playfair Fallback"', "Georgia", "serif"],
        sub: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"IBM Plex Sans"', '"Plex Sans Fallback"', "system-ui", "sans-serif"],
        label: ["Jura", '"Plex Sans Fallback"', "system-ui", "sans-serif"],
        mono: ["Jura", "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "68ch",
        page: "72rem",
      },
      letterSpacing: {
        label: "0.14em",
      },
    },
  },
  plugins: [],
};
