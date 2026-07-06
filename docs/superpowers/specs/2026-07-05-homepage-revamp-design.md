# BITE-006 — Homepage revamp (premium-minimal restyle)

**Date:** 2026-07-05
**Item:** BITE-006 · type: feat · branch: `BITE-006/homepage-revamp`
**Status:** design approved — pending written-spec review

## Goal

Revamp the BiteDash landing page (`app/page.tsx` and its section components) into a
**clean, premium-minimal** design, and fold in the accumulated presentation-layer debt
(native HTML, fixed viewport heights, off-token colors) as part of the same pass.
Presentation only — no backend wiring; the page stays on its current static/placeholder
data.

## Decisions (locked with user)

1. **Scope:** full revamp — visual redesign **and** debt cleanup in one pass.
2. **Aesthetic:** clean & premium minimal, within the existing brand system (tomato
   `#FF4F18`, Be Vietnam Pro headings / Hanken Grotesk body, pill buttons).
3. **Sections:** restyle the **same five** sections — Hero, Popular Nearby, Features,
   Signature Bites, App Download — same order, same content. No add/remove/reorder.
4. **Approach A (foundation-first):** define the premium-minimal system once, apply it
   across every section; fix debt as the mechanism of the restyle.
5. **Hero:** cleaner single-direction overlay (not a split-screen).
6. **`RestaurantCard`:** left untouched — it is shared with the `/stores` dashboard page
   and `FeaturedRestaurantCard`; restyling it would ripple beyond the homepage. Popular
   Nearby is polished at the **section level only**.
7. **`FoodCard`:** restyled — used only by the homepage (Signature Bites), so safe.

## Constraints

- **Radix UI only for content** — non-semantic `<div>` wrappers → `Box`/`Flex`/`Section`;
  content elements use `Heading`/`Text`/`Button`. **Semantic landmarks (`<header>`,
  `<main>`, `<footer>`) stay native HTML** — Radix has no landmark equivalent, the
  codebase already keeps them (Navbar/Footer), and converting them to `Box` would drop
  the `banner`/`main`/`contentinfo` roles (a11y regression).
- **No hardcoded hex** — brand tokens via Tailwind (`text-brand`, `text-secondary`,
  `text-neutral`, `bg-surface-alt`) and Radix `color="tomato"`.
- **Fonts:** `font-main` / `font-accent` only.
- **Breakpoints:** existing `xs`→`xl` only; no new ones.
- **TDD:** failing/updated RTL test first for every changed component.
- **Coverage gates (hard):** statements 90 / branches 85 / functions 95 / lines 90.
- **Server/Client boundary:** sections stay Server Components; only `SearchBar` (existing
  `'use client'`) remains a client island. No new client components unless a new
  interaction requires one.

## Design foundations (defined once, applied to every section)

### Spacing rhythm — replaces fixed viewport heights
- Remove `h-[calc(100vh-4rem)]` (Hero), `h-[40vh]` (Signature Bites), `h-[50vh]`
  (App Download). These force fixed heights and can clip content.
- Sections flow by content on a consistent vertical padding scale (Radix `Section` +
  a shared `py` rhythm). Backgrounds alternate white / `surface-alt` for cadence.
- The Hero keeps visual presence via a **`min-h` floor** (e.g. `min-h-[560px]
  md:min-h-[640px]`), never a fixed `h` — so content can never clip.

### Typography
- Dial back blanket bold. Section headers → `weight="medium"` + `tracking-tight`.
  Heavy weight reserved for the Hero line only.
- Consistent section-header pattern: small uppercase **eyebrow** + heading + one-line
  subtext. Eyebrow uses the accent restrained (tomato or neutral).

### Color — tokens only
- `text-gray-500` → `text-neutral`.
- App Download `bg-gray-950` → `bg-secondary` (#1A1A1A); its `text-gray-400` → a token
  (e.g. `text-white/70`).
- Feature icon circles: `bg-orange-100 text-brand` → restrained neutral circle with a
  brand-colored icon (no large orange fill).
- Card/border grays reviewed against tokens where they appear in homepage-owned code.

### Accent restraint
- Tomato only on: the primary CTA, hover/active states, and **one** small accent per
  section (eyebrow / underline / badge). No large color fills.

## Per-section specification

### Navbar (`app/components/layout/Navbar.tsx`)
- Keep the `<header>` landmark; inner content already uses Radix
  (`Container`/`Flex`/`Box`/`Text`).
- Move off-token grays (`text-gray-700`, `border-gray-100`, `hover:bg-gray-50`,
  `bg-white/95`) to tokens (`text-secondary`/`text-neutral`, token border/surface).
  Structure and links unchanged.

### Hero (`HeroSection/index.tsx`, `SearchBar.tsx`)
- Replace the wrapping native `<div>`s with `Box`/`Flex`.
- `min-h` floor instead of fixed viewport height.
- Lighter single-direction scrim (replace `from-black/75 via-black/50 to-black/10`
  with a gentler gradient that keeps text legible with more whitespace).
- Eyebrow + refined heading + subtext; existing search pill kept, spacing polished.
- `SearchBar` stays a client component; behavior unchanged (only styling/spacing).

### Popular Nearby (`PopularNearbySection.tsx`)
- Section-level restyle: eyebrow header, premium spacing, refined "View all" link.
- Same 3/5 featured + 2×2 grid layout. **`RestaurantCard` internals unchanged.**

### Features (`FeaturesSection.tsx`)
- Restrained icon circles, medium-weight heading, tighter 3-column rhythm on
  `surface-alt`. Content unchanged.

### Signature Bites (`SignatureBitesSection.tsx`, `ui/FoodCard.tsx`)
- Remove native `<div>` and `40vh` height → natural flow.
- Restyle `FoodCard` (homepage-only) with premium card treatment (consistent radius,
  soft/subtle elevation, refined meta type, token colors, restrained badge).
- Cleaner horizontal scroll row.

### App Download (`AppDownloadBanner.tsx`)
- Native `<div>` wrappers → `Box`. `bg-gray-950` → `bg-secondary`; token text colors.
- Same 2-column layout, store buttons, phone mockup; refined type and spacing.

## Files affected

| File | Change |
| --- | --- |
| `app/page.tsx` | native `<div>` → Radix; spacing wrapper cleanup |
| `app/components/layout/Navbar.tsx` | keep `<header>` landmark; off-token grays → tokens |
| `app/components/sections/HeroSection/index.tsx` | Radix wrappers, `min-h`, lighter scrim, eyebrow |
| `app/components/sections/HeroSection/SearchBar.tsx` | spacing/style polish only |
| `app/components/sections/PopularNearbySection.tsx` | section-level restyle, eyebrow |
| `app/components/sections/FeaturesSection.tsx` | restrained icons, type/rhythm |
| `app/components/sections/SignatureBitesSection.tsx` | Radix, natural height |
| `app/components/ui/FoodCard.tsx` | premium card restyle |
| `app/components/sections/AppDownloadBanner.tsx` | Radix, `bg-secondary`, tokens |
| corresponding `__tests__/*.test.tsx` | updated first (TDD) |

## Testing strategy (TDD)

- Each changed component has an existing RTL test asserting headings/content/structure.
- Workflow per component: update the test to the new markup/expectations → run → watch it
  fail → implement → pass.
- Add assertions for new elements (eyebrows) and preserved behavior (SearchBar routing).
- Keep coverage at/above 90/85/95/90 across the changed files.

## Verification

- `yarn type-check` → `yarn lint` → `yarn test:coverage` (fast-fail order).
- Render-and-measure: `yarn dev`, inspect Hero and each section at a mobile width and a
  desktop width; confirm no content clipping (the whole point of removing fixed heights)
  and that the premium-minimal spacing reads correctly. Report observations.
- Playwright e2e render-and-measure: `yarn test:e2e` drives the real page at mobile (390×844)
  and desktop (1440×900), asserting no horizontal overflow and capturing screenshots.

> **Scope note (added during execution):** the Playwright harness was pulled forward from
> BITE-004 and installed on this branch so the render-and-measure gate is automated rather
> than manual — this overrides the two "no Playwright" lines below. The e2e pass also caught a
> 390px overflow in the (originally token-only) navbar, so a responsive mobile navbar
> (`MobileNav.tsx`, a `'use client'` island) was added — a deliberate deviation from the
> "no new client components" boundary, approved by the user.

## Non-goals / out of scope

- No backend, data fetching, Supabase, or TanStack Query (BITE-002/003/005).
- No changes to `RestaurantCard`, `FeedRestaurantCard`, `/stores`, or any dashboard page.
- No new sections, no reordering, no content rewrites.
- ~~No new dependencies; no Playwright setup (BITE-004).~~ — superseded: `@playwright/test`
  added (see scope note above); no other new dependencies.
- No changes to the global design tokens in `globals.css` (consume them, don't redefine).
