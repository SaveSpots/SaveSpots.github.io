/**
 * SaveSpots design tokens — single source of brand truth.
 *
 * Derived from BRAND_GUIDE.md. Consumed by:
 *   - web:    packages/tokens/tailwind-preset.js (Tailwind theme)
 *   - mobile: imported directly into NativeWind config + RN StyleSheet
 *
 * Rule (from BRAND_GUIDE §2): deliberate TWO-surface brand — red + cream.
 * No dark mode. No gray as a third surface. No purple-shifted reds.
 */

export const colors = {
  // Backbone brand color family — "deep warm brick red, not purple"
  themeRed: {
    DEFAULT: "#5a2532", // hero/section backgrounds, map pins, primary text on cream
    light: "#7a3b4a", // hover states, lighter accents
    dark: "#431b26", // deep backgrounds, headline text on cream, gradient overlays
  },
  // Warm off-white reading surface for dense content sections (NOT a theme flip)
  cream: {
    DEFAULT: "#FBF6F3",
    dark: "#F2E9E3",
  },
  white: "#FFFFFF",
  // Reserved accent gradient (secondary CTAs only)
  buttonOrange: {
    start: "#FF8C00",
    end: "#FFA500",
  },
};

export const fonts = {
  // Display / headings — big, confident, condensed letterspacing
  display: "Bricolage Grotesque",
  // Body / UI
  sans: "Plus Jakarta Sans",
};

export const fontWeights = {
  display: [500, 600, 700, 800],
  sans: [400, 500, 600, 700],
};

// Shape system (LOCKED per BRAND_GUIDE §4 — do not deviate)
export const radius = {
  button: 9999, // full pill
  card: 24, // rounded-3xl
  input: 12, // rounded-xl
};

// Motion (BRAND_GUIDE §6)
export const motion = {
  fadeRise: { fromOpacity: 0, fromY: 40, toOpacity: 1, toY: 0 },
  durationMs: 600,
  buttonHoverScale: 1.05,
  buttonTapScale: 0.95,
  staggerMs: 80,
};
