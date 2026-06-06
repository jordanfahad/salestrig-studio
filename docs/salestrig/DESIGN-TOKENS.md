# Salestrig Studio — Design tokens (Phase 3)

Premium, warm, empowering — beautiful and calm, not stereotypically "feminine".
Backgrounds are warm; authority is plum; accents are coral/champagne/lavender;
success is teal. We avoid overwhelming pink.

## Palette

| Role | Token | Hex |
|---|---|---|
| Plum 700 (authority) | plum-deep | `#4A2C5E` |
| Plum 600 (primary button) | plum | `#6E4488` |
| Plum 500 | plum-soft | `#835AA0` |
| Plum (light focus text) | plum-ink-light | `#5E3A87` |
| Lavender 300 (accent/focus) | lavender | `#C9B6E8` / light `#8255A8` |
| Coral 500 (AI / energetic CTA) | coral | `#F2785C` |
| Champagne 400 (gold accent) | champagne | `#DDB271` |
| Teal 500 (success) | teal | `#1FB6A0` |
| Cream 50 (light bg) | cream | `#FBF7F2` |
| Cream 100 (light line) | cream-line | `#EFE7DC` |
| Ink 900 (dark bg) | ink | `#17121E` |
| Ink 800 (dark panel) | ink-panel | `#221A2B` |
| Ink 700 (dark border) | ink-border | `#2E2438` |

Implemented by re-mapping the CSS variables in `apps/frontend/src/app/colors.scss`
(`.dark` / `.light`). Tailwind tokens in `tailwind.config.cjs` reference these vars,
so every component re-themes automatically. Social-platform brand colors
(LinkedIn/Facebook/etc.) are left unchanged.

## Typography
- Body/UI: **Plus Jakarta Sans** (already wired in `(app)/layout.tsx`).
- Display/headings: elegant serif pairing — follow-up (e.g. Fraunces) — TODO.
