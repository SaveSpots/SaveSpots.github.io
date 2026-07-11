/** @type {import('tailwindcss').Config} */
const brandPreset = require("@savespots/tokens/tailwind-preset").default;

module.exports = {
  // Same brand palette (theme-red / cream / button-orange) as the website,
  // pulled from @savespots/tokens — one source of truth across web + mobile.
  presets: [require("nativewind/preset"), brandPreset],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
