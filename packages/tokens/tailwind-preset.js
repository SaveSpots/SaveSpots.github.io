/**
 * Shared Tailwind preset built from the brand tokens.
 * Both apps/web and apps/mobile extend this so the brand palette is defined once.
 * App-specific tailwind.config.ts files add their own `content` globs + plugins.
 */
import { colors } from "./index.js";

/** @type {Partial<import('tailwindcss').Config>} */
const preset = {
  theme: {
    extend: {
      colors: {
        "theme-red": {
          DEFAULT: colors.themeRed.DEFAULT,
          light: colors.themeRed.light,
          dark: colors.themeRed.dark,
        },
        "button-orange": {
          start: colors.buttonOrange.start,
          end: colors.buttonOrange.end,
        },
        cream: {
          DEFAULT: colors.cream.DEFAULT,
          dark: colors.cream.dark,
        },
      },
    },
  },
};

export default preset;
