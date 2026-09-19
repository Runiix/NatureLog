import type { Config } from "tailwindcss";

/** A theme colour backed by a CSS variable holding bare RGB channels. */
const token = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

const config: Config = {
  // app/ holds only [locale]; the bracket-free glob scans the same files but
  // keeps "[locale]" from being read as a glob character class, which made
  // the dev server miss class names added to existing files.
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  // The theme is chosen by a `dark` class on <html>, set server-side from a
  // cookie, rather than by the OS media query alone — so a user's explicit
  // choice wins and the first paint is already correct.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: {
          DEFAULT: token("surface"),
          raised: token("surface-raised"),
          sunken: token("surface-sunken"),
        },
        border: {
          DEFAULT: token("border"),
          muted: token("border-muted"),
        },
        // `fg` rather than `text` so the utilities read text-fg-muted, not
        // text-text-muted.
        fg: {
          DEFAULT: token("fg"),
          muted: token("fg-muted"),
          subtle: token("fg-subtle"),
        },
        accent: {
          DEFAULT: token("accent"),
          hover: token("accent-hover"),
          solid: token("accent-solid"),
          text: token("accent-text"),
          fg: token("accent-fg"),
        },
        danger: {
          DEFAULT: token("danger"),
          solid: token("danger-solid"),
        },
        overlay: token("overlay"),
      },
      boxShadow: {
        card: "var(--shadow-card)",
        raised: "var(--shadow-raised)",
        overlay: "var(--shadow-overlay)",
      },
      backgroundImage: {
        // Today's card recipe, `bg-gradient-to-br from-… to-70% to-…`, as one
        // themeable utility.
        "surface-gradient":
          "linear-gradient(to bottom right, rgb(var(--color-grad-from)), rgb(var(--color-grad-to)) 70%)",
      },
    },
  },
  plugins: [],
};
export default config;
