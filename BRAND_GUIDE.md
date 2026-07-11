# SaveSpots Brand & UI Guide

Derived from the live site (`app/globals.css`, `tailwind.config.ts`, `components/`). This is the source of truth for visual identity — reference it before introducing new colors, fonts, or component patterns.

---

## 1. Brand Essence

**SaveSpots** is a Chicago-based nonprofit placing naloxone (Narcan) and fentanyl test strips in everyday community locations to prevent overdose deaths.

- **Tone**: urgent but composed. Direct, factual, human — not clinical, not alarmist.
- **Voice**: short declarative sentences. Verbs over adjectives. "Put help where people already are." / "Reversing Overdose — One SaveBox at a Time."
- **Positioning**: data-driven, community-centered harm reduction — a system, not a slogan.

---

## 2. Color System

### Primary palette

| Token | Value | Usage |
|---|---|---|
| `theme-red` (Primary Red) | `#5a2532` | Backbone brand color — hero/section backgrounds, map pins, primary text on cream |
| `theme-red-light` | `#7a3b4a` | Hover states, lighter accents |
| `theme-red-dark` | `#431b26` | Deep backgrounds, headline text on cream, gradient overlays |
| `cream` | `#FBF6F3` | Warm off-white reading surface for dense/content-heavy sections |
| `cream-dark` | `#F2E9E3` | Cream section secondary surface |
| White | `#FFFFFF` | Primary button fill, text on red backgrounds |

### Accent

| Token | Value | Usage |
|---|---|---|
| `button-orange` gradient | `#FF8C00` → `#FFA500` | Reserved accent gradient (secondary CTAs) |

**Rule**: This is a deliberate two-surface brand, not a light/dark theme flip. Sections alternate between **brand red** (hero, mission, emotional/impact moments) and **cream** (dense content: team, gallery, data). Do not introduce gray neutrals as a third surface — use cream.

There is **no dark mode**. `darkMode` was explicitly removed from Tailwind config — do not reintroduce `.dark` variants for this brand.

### Color don'ts
- Don't drift red toward purple — brand red is explicitly "deep warm brick red, not purple."
- Don't use pure black (`#000`) for text on cream; use `theme-red-dark/70` for body copy, `theme-red-dark` for headlines.

---

## 3. Typography

| Role | Font | Source | Weights |
|---|---|---|---|
| Display / Headings | **Bricolage Grotesque** | Google Fonts, `--font-display` | 500, 600, 700, 800 |
| Body / UI | **Plus Jakarta Sans** | Google Fonts, `--font-sans` | 400, 500, 600, 700 |

- Headlines use `font-display font-extrabold tracking-tight` — big, confident, condensed letterspacing.
- Hero H1 scales `text-3xl` (mobile) → `text-8xl` (desktop).
- Section H2 pattern: `text-4xl md:text-6xl font-extrabold tracking-tight`.
- Eyebrow/label pattern: `text-xs font-semibold uppercase tracking-[0.2em]` in a pill badge.
- Body copy: `text-lg`–`text-2xl`, `font-medium`, generous `leading-relaxed`, often `text-balance`.

---

## 4. Shape System (locked)

Explicitly declared in `globals.css`: **"Shape system (locked)"**

| Element | Shape |
|---|---|
| Buttons | Full pill (`rounded-full`) |
| Cards | `rounded-3xl` |
| Inputs | `rounded-xl` |

Do not deviate — this is called out as a locked decision in the codebase.

---

## 5. Components

### Buttons (`ConsistentButton`)
Three variants, all pill-shaped, all with `hover:scale-105` micro-interaction (Framer Motion spring):

- **primary**: white fill, `theme-red` text → hover: `theme-red-light` fill, white text
- **secondary**: transparent, white border/text → hover: `theme-red` fill
- **cta**: larger (`px-8 py-4`, `text-lg md:text-xl`), white fill, `theme-red` text, `shadow-lg shadow-white/50` — used for the highest-priority action per section (e.g., "See Our Impact")

### Cards
`rounded-3xl`, white or cream fill, soft shadow tinted with brand red (`shadow-theme-red-dark/10`), subtle ring (`ring-1 ring-theme-red-dark/5`), `hover:-translate-y-1` lift.

### Map pins
Brand-red dot (`#5a2532`) with white ring and animated ping pulse — signature "SaveBox location" marker.

### Backgrounds
- `InfiniteGrid`: animated subtle grid pattern (white lines at 5–7% opacity) with radial mask fade, layered at two speeds/sizes for depth. Used behind hero and mission sections on red backgrounds only.
- Gradient overlays fade `theme-red-dark/60 → transparent` at section tops for depth separation.

---

## 6. Motion

Framer Motion throughout, consistent pattern:
- Fade + rise on scroll: `initial: opacity 0, y: 40` → `whileInView: opacity 1, y: 0`, `viewport: once, amount 0.2–0.4`
- Staggered delays for sequential elements (`delay: i * 0.08`)
- Duration ~0.5–1s, `ease: easeOut`
- Buttons: scale 1.05 on hover, 0.95 on tap

---

## 7. Layout Rhythm

- Section vertical padding: `py-28 md:py-36` (generous breathing room)
- Content max-width: `max-w-4xl` (copy-heavy), `max-w-5xl`/`max-w-6xl` (grids/cards)
- Alternating rhythm: **red section → cream section → red section...** creates visual pacing between emotional/brand moments and informational density.

---

## 8. Imagery & Logo

- Primary logo: `public/assets/SaveSpotsLogo.png` (+ transparent variant)
- Partner logos live in `public/assets/logos/`
- Team/gallery photography sits on cream surfaces, rounded-3xl frames

---

## 9. What NOT to do

- No dark mode / `.dark` class usage
- No sharp corners on buttons, cards, or inputs — shape system is locked
- No neutral gray as a third surface color — only red and cream
- No purple-shifted reds
- No alarmist or clinical copy tone — stay direct, human, data-grounded
