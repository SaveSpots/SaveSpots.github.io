/**
 * Generates the printed donation QR codes.
 *
 * The encoded URL is always the tracked one (/qr/<code>), never /donate
 * directly — a printed code cannot be changed once it is on a wall, so the
 * redirect is what keeps the destination and the analytics editable later.
 *
 * Error correction is fixed at H (~30% recoverable). That is what allows the
 * logo to sit in the middle: the modules it covers are treated as damage the
 * scanner reconstructs. Anything lower and a scanner will fail on the logo.
 *
 * Usage: node scripts/generate-qr.mjs [code]
 */

import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const QRCode = require("qrcode");
const sharp = require("sharp");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(root, "qr-codes");
const LOGO = join(root, "apps/web/public/assets/SaveSpotsLogoTransparent.png");

const code = process.argv[2] ?? "donate";
const url = `https://savespots.org/qr/${code}`;

// Brand tokens from BRAND_GUIDE.md. Do not substitute approximations — the
// printed code sits next to printed brand material.
const RED = "#5a2532";
const RED_DARK = "#431b26";
const CREAM = "#FBF6F3";
const WHITE = "#FFFFFF";

/** Logo clear-zone as a fraction of the symbol width. */
const LOGO_RATIO = 0.26;

const logoDataUri = `data:image/png;base64,${readFileSync(LOGO).toString("base64")}`;

function buildMatrix() {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const size = qr.modules.size;
  const data = qr.modules.data;
  return { size, get: (x, y) => data[y * size + x] === 1 };
}

/** The three 7x7 finder patterns, which get drawn as styled eyes instead. */
function isInEye(x, y, size) {
  const inBox = (ox, oy) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  return inBox(0, 0) || inBox(size - 7, 0) || inBox(0, size - 7);
}

function isUnderLogo(x, y, size) {
  const half = (size * LOGO_RATIO) / 2;
  const c = size / 2;
  // +0.5 centres the test on the module rather than its corner.
  return Math.abs(x + 0.5 - c) < half + 0.5 && Math.abs(y + 0.5 - c) < half + 0.5;
}

/** One styled finder pattern: rounded outer ring plus rounded pupil. */
function eye(ox, oy, unit, fg, bg) {
  const x = ox * unit;
  const y = oy * unit;
  const s = 7 * unit;
  return `
    <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${unit * 2}" fill="${fg}"/>
    <rect x="${x + unit}" y="${y + unit}" width="${s - unit * 2}" height="${s - unit * 2}" rx="${unit * 1.3}" fill="${bg}"/>
    <rect x="${x + unit * 2}" y="${y + unit * 2}" width="${s - unit * 4}" height="${s - unit * 4}" rx="${unit * 0.9}" fill="${fg}"/>`;
}

function renderSymbol({ shape, fg, bg, quiet = 4, px = 1200 }) {
  const { size, get } = buildMatrix();
  const total = size + quiet * 2;
  const unit = px / total;

  let modules = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!get(x, y)) continue;
      if (isInEye(x, y, size)) continue;
      if (isUnderLogo(x, y, size)) continue;

      const cx = (x + quiet) * unit;
      const cy = (y + quiet) * unit;

      // Every shape draws a slightly oversized rounded square rather than a
      // true circle. Circles only touch their neighbours at a tangent point,
      // which leaves micro-gaps along the run-lengths a decoder measures —
      // verified: true circles failed to decode at 1400px however large the
      // radius got. The overlap here keeps runs solid at any resolution while
      // the corner radius still reads as soft or sharp.
      // The softer the corner, the more the modules must overlap, or the
      // concave notches between diagonal neighbours break the run-lengths a
      // decoder measures. Swept empirically: rx 0.46 needs >=1.12 overlap to
      // decode at every resolution, rx 0.18 is fine at 1.04.
      const soft = shape === "dot";
      const d = unit * (soft ? 1.14 : 1.04);
      const radius = unit * (soft ? 0.46 : 0.18);
      modules += `<rect x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" width="${d.toFixed(2)}" height="${d.toFixed(2)}" rx="${radius.toFixed(2)}" fill="${fg}"/>`;
    }
  }

  const eyes =
    eye(quiet, quiet, unit, fg, bg) +
    eye(quiet + size - 7, quiet, unit, fg, bg) +
    eye(quiet, quiet + size - 7, unit, fg, bg);

  // Logo plate: an opaque rounded square so the logo never sits on modules,
  // which is what keeps contrast high enough for a scanner.
  const plate = size * LOGO_RATIO + 2;
  const platePx = plate * unit;
  const plateXY = (px - platePx) / 2;
  const logoPx = platePx * 0.8;
  const logoXY = (px - logoPx) / 2;

  const logo = `
    <rect x="${plateXY.toFixed(2)}" y="${plateXY.toFixed(2)}" width="${platePx.toFixed(2)}" height="${platePx.toFixed(2)}" rx="${(platePx * 0.24).toFixed(2)}" fill="${bg}"/>
    <image href="${logoDataUri}" x="${logoXY.toFixed(2)}" y="${logoXY.toFixed(2)}" width="${logoPx.toFixed(2)}" height="${logoPx.toFixed(2)}" preserveAspectRatio="xMidYMid meet"/>`;

  return { inner: modules + eyes + logo, px };
}

const variants = {
  /** Default. Highest contrast, safest scan, works on any background. */
  classic: () => {
    const { inner, px } = renderSymbol({ shape: "square", fg: RED, bg: CREAM });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}">
  <rect width="${px}" height="${px}" rx="${px * 0.06}" fill="${CREAM}"/>${inner}
</svg>`;
  },

  /** Softer, more branded. Slightly less ink, still well inside tolerance. */
  dots: () => {
    const { inner, px } = renderSymbol({ shape: "dot", fg: RED, bg: CREAM });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}">
  <rect width="${px}" height="${px}" rx="${px * 0.06}" fill="${CREAM}"/>${inner}
</svg>`;
  },

  /**
   * For printing on the brand red. Scanners expect a dark symbol on a light
   * field, and most modern ones handle the inversion — but this is the one
   * variant to test on a cheap Android before committing to a print run.
   */
  inverted: () => {
    const { inner, px } = renderSymbol({ shape: "square", fg: CREAM, bg: RED_DARK });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}">
  <rect width="${px}" height="${px}" rx="${px * 0.06}" fill="${RED_DARK}"/>${inner}
</svg>`;
  },

  /** Print-ready card: symbol plus the ask and a human-readable fallback. */
  poster: () => {
    const symbolPx = 1000;
    const { inner } = renderSymbol({ shape: "square", fg: RED, bg: WHITE, px: symbolPx });
    const W = 1200;
    const H = 1640;
    const sx = (W - symbolPx) / 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${RED}"/>
  <text x="${W / 2}" y="170" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="46" font-weight="700" letter-spacing="9" fill="${CREAM}" opacity="0.75">SAVESPOTS</text>
  <text x="${W / 2}" y="300" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="104" font-weight="800" fill="${WHITE}">Scan to donate</text>
  <text x="${W / 2}" y="378" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="44" font-weight="500" fill="${CREAM}" opacity="0.8">$25 puts one SaveKit in a neighbor's hands</text>
  <rect x="${sx - 28}" y="442" width="${symbolPx + 56}" height="${symbolPx + 56}" rx="72" fill="${WHITE}"/>
  <g transform="translate(${sx}, 470)">${inner}</g>
  <text x="${W / 2}" y="1560" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="52" font-weight="700" fill="${WHITE}">savespots.org/donate</text>
</svg>`;
  },
};

mkdirSync(OUT_DIR, { recursive: true });

const results = [];
for (const [name, build] of Object.entries(variants)) {
  const svg = build();
  const svgPath = join(OUT_DIR, `savespots-qr-${name}.svg`);
  const pngPath = join(OUT_DIR, `savespots-qr-${name}.png`);
  writeFileSync(svgPath, svg);
  // density 300 so the raster is usable in print, not just on screen.
  await sharp(Buffer.from(svg), { density: 300 }).png().toFile(pngPath);
  results.push(name);
}

console.log(`encoded URL: ${url}`);
console.log(`variants:    ${results.join(", ")}`);
console.log(`output:      ${OUT_DIR}`);
