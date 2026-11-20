/** @type {import('tailwindcss').Config} */
// Colours resolve to CSS custom properties defined in src/styles/tokens.css,
// so light and dark themes share one set of utility classes.
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
      },
      fontFamily: {
        // Each web font is followed by a metric-matched local fallback (see
        // src/styles/index.css) so the swap does not shift the layout.
        serif: ['"Newsreader Variable"', '"Newsreader Fallback"', "Georgia", "serif"],
        sans: ['"IBM Plex Sans"', '"Plex Sans Fallback"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', '"Plex Mono Fallback"', "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "68ch",
        page: "72rem",
      },
      letterSpacing: {
        label: "0.08em",
      },
    },
  },
  plugins: [],
};
