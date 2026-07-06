# Homepage Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the BiteDash landing page into a clean, premium-minimal design while fixing presentation-layer debt (native `<div>`s, fixed viewport heights, off-token colors).

**Architecture:** Foundation-first restyle (Approach A). The same five sections keep their structure and content; each is re-skinned to one shared set of premium-minimal rules — a consistent eyebrow+heading pattern, `min-h`/natural-flow spacing instead of fixed viewport heights, restrained tomato accent, and token-only colors. Semantic landmarks (`<header>`/`<main>`/`<footer>`) are retained; only non-semantic `<div>` wrappers become Radix `Box`/`Flex`.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript (strict), `@radix-ui/themes`, `@radix-ui/react-icons`, Tailwind CSS 4, Jest + React Testing Library. Package manager: **yarn**.

## Global Constraints

Copied from the spec — every task implicitly includes these:

- **Radix UI for content** — non-semantic `<div>` → `Box`/`Flex`/`Section`; content uses `Heading`/`Text`/`Button`. **Semantic landmarks (`<header>`, `<main>`, `<footer>`) stay native HTML** (Radix has no landmark equivalent; converting drops `banner`/`main`/`contentinfo` roles).
- **No hardcoded hex** — brand tokens only: `text-brand` / `text-brand-dark`, `text-secondary`, `text-neutral`, `bg-surface-alt`, `bg-secondary`. For subtle borders/dividers use token opacities (`border-neutral/15`, `bg-neutral/20`). Radix `color="tomato"` where a Radix color prop is needed.
- **Fonts:** `font-main` / `font-accent` only (headings already inherit `font-accent` globally).
- **Breakpoints:** existing `xs`→`xl` only.
- **Buttons:** pill shape (`radius="full"`).
- **Server/Client boundary:** all sections stay Server Components; `SearchBar` remains the only `'use client'` island. No new client components.
- **TypeScript:** explicit return type `ReactElement` on every component; no `any`.
- **Coverage gates (hard):** statements 90 / branches 85 / functions 95 / lines 90.
- **Content preserved:** no section added/removed/reordered; existing copy unchanged except (a) new small eyebrow labels and (b) "View all 4" → "View all" (drops the stray count).

### How TDD applies here (read once)

This is a visual restyle. jsdom/RTL **cannot** assert Tailwind classes, layout, or color — so two verification legs are used, both required by the workflow:

1. **RTL (structure/content/behavior):** where a task adds new visible text (an **eyebrow**), write the failing `getByText` assertion **first** (real red→green). Existing content/behavior assertions must stay green through every refactor — they are the regression net.
2. **Render-and-measure (the actual look):** Task 9 drives the real page in a browser via the Playwright **MCP** tools (`mcp__plugin_playwright_playwright__browser_*`) at mobile and desktop widths. This needs no new project dependency and is separate from BITE-004 (adding Playwright as a project test dep).

Writing a fake "style test" that jsdom can't evaluate is test theater — do **not** do it. Style-only tasks rely on the existing green tests plus the Task 9 render pass.

### Shared token mapping (applied wherever these appear in homepage-owned files)

| Off-token (remove) | Token (use) |
| --- | --- |
| `text-gray-900`, `text-gray-700` | `text-secondary` |
| `text-gray-600`, `text-gray-500` | `text-neutral` |
| `text-gray-400` (on dark) | `text-white/70` |
| `bg-gray-950` | `bg-secondary` |
| `bg-orange-100` (icon circle) | `bg-white` + `ring-1 ring-neutral/10` |
| `border-gray-100` | `border-neutral/15` |
| `bg-gray-200` (divider) | `bg-neutral/20` |
| `hover:bg-gray-50` | `hover:bg-surface-alt` |

### Shared eyebrow pattern (inline per section — do not extract)

```tsx
<Text
  as="span"
  size="1"
  weight="medium"
  className="uppercase tracking-[0.2em] text-brand block mb-2"
>
  Nearby
</Text>
```

---

### Task 1: Navbar — token cleanup (keep `<header>`)

**Files:**
- Modify: `app/components/layout/Navbar.tsx`
- Test: `app/components/layout/__tests__/Navbar.test.tsx` (existing — must stay green)

**Interfaces:** No prop/signature changes. Default export `Navbar(): ReactElement`.

Style-only + dead-import cleanup. No new behavior → no new test; existing Navbar tests are the net.

- [ ] **Step 1: Confirm existing tests pass (baseline)**

Run: `yarn test app/components/layout/__tests__/Navbar.test.tsx`
Expected: PASS (5 tests — logo, Stores, Orders, cart, settings).

- [ ] **Step 2: Rewrite the file with tokens; remove unused `GearIcon` import**

`app/components/layout/Navbar.tsx`:

```tsx
import type { ReactElement } from "react";
import Link from "next/link";
import { Box, Container, Flex, Text } from "@radix-ui/themes";
import { UserIcon } from "@/app/components/ui/icons";

function CartIcon(): ReactElement {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export default function Navbar(): ReactElement {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral/15 bg-white/95 backdrop-blur-sm">
      <Container size="4">
        <Flex align="center" justify="between" className="h-16 px-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Text size="5" weight="bold" className="text-brand">
              BiteDash
            </Text>
          </Link>

          {/* Nav Links */}
          <Flex gap="1" align="center">
            <Link
              href="/stores"
              className="px-4 py-2 rounded-lg hover:bg-surface-alt transition-colors"
            >
              <Text size="2" weight="medium" className="text-secondary">
                Stores
              </Text>
            </Link>
            <Box className="h-4 w-px bg-neutral/20" />
            <Link
              href="/orders"
              className="px-4 py-2 rounded-lg hover:bg-surface-alt transition-colors"
            >
              <Text size="2" weight="medium" className="text-secondary">
                Orders
              </Text>
            </Link>
            <Box className="h-4 w-px bg-neutral/20" />
            <Link
              href="/offers"
              className="px-4 py-2 rounded-lg hover:bg-surface-alt transition-colors"
            >
              <Text size="2" weight="medium" className="text-secondary">
                Offers
              </Text>
            </Link>
          </Flex>

          {/* Actions */}
          <Flex gap="3" align="center">
            <Link
              href="/cart"
              className="flex items-center text-neutral hover:text-brand transition-colors"
              aria-label="Cart"
            >
              <CartIcon />
            </Link>
            <Link
              href="/profile"
              className="flex items-center text-neutral hover:text-brand transition-colors"
              aria-label="Settings"
            >
              <UserIcon />
            </Link>
          </Flex>
        </Flex>
      </Container>
    </header>
  );
}
```

- [ ] **Step 3: Confirm tests still pass**

Run: `yarn test app/components/layout/__tests__/Navbar.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 4: Lint the file**

Run: `yarn lint`
Expected: no errors (confirms the removed `GearIcon` import left nothing dangling).

- [ ] **Step 5: Commit**

```bash
git add app/components/layout/Navbar.tsx
git commit -m "BITE-006: navbar token cleanup, drop unused icon import"
```

---

### Task 2: Hero — Radix wrappers, min-h floor, lighter scrim, eyebrow

**Files:**
- Modify: `app/components/sections/HeroSection/index.tsx`
- Modify: `app/components/sections/HeroSection/SearchBar.tsx` (spacing only)
- Test: `app/components/sections/HeroSection/__tests__/index.test.tsx`
- Test: `app/components/sections/HeroSection/__tests__/SearchBar.test.tsx` (existing — stay green)

**Interfaces:** No signature changes. `HeroSection` mocks `./SearchBar` in its test.

- [ ] **Step 1: Write the failing eyebrow test**

Edit `app/components/sections/HeroSection/__tests__/index.test.tsx` — add after the existing test, inside `describe('HeroSection', ...)`:

```tsx
  it('renders the eyebrow label', () => {
    render(<HeroSection />)
    expect(screen.getByText(/order in minutes/i)).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test app/components/sections/HeroSection/__tests__/index.test.tsx`
Expected: FAIL — "Unable to find an element with the text: /order in minutes/i".

- [ ] **Step 3: Implement the Hero restyle**

`app/components/sections/HeroSection/index.tsx`:

```tsx
import type { ReactElement } from "react";
import Image from "next/image";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import SearchBar from "./SearchBar";

export default function HeroSection(): ReactElement {
  return (
    <Box className="relative w-full min-h-[560px] md:min-h-[640px] overflow-hidden">
      {/* Background image */}
      <Image
        src="https://picsum.photos/seed/bitedashhero/1400/600"
        alt="Delicious food spread"
        fill
        className="object-cover"
        priority
      />

      {/* Lighter single-direction scrim */}
      <Box className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

      {/* Content */}
      <Flex align="center" className="absolute inset-0">
        <Box className="max-w-2xl px-8 md:px-16">
          <Text
            as="span"
            size="2"
            weight="medium"
            className="uppercase tracking-[0.25em] text-white/80 block"
          >
            Order in minutes
          </Text>
          <Heading
            size={{ initial: "8", md: "9" }}
            className="text-white leading-[1.05] tracking-tight mt-4"
          >
            Hunger fulfilled
            <br />
            in one dash
          </Heading>
          <Text
            size={{ initial: "3", md: "4" }}
            className="mt-5 text-white/80 block max-w-md leading-relaxed"
          >
            Order from thousands of restaurants, 10 min kitchens, and unique
            local Markets.
          </Text>
          <SearchBar />
        </Box>
      </Flex>
    </Box>
  );
}
```

- [ ] **Step 4: Polish SearchBar spacing (className only)**

In `app/components/sections/HeroSection/SearchBar.tsx`, change the outer `Flex` className from `mt-8 max-w-xl rounded-full bg-white p-1.5 shadow-xl` to:

```tsx
      className="mt-9 max-w-xl rounded-full bg-white p-1.5 shadow-lg"
```

(Only the className changes — routing/state/behavior untouched.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `yarn test app/components/sections/HeroSection`
Expected: PASS — `index.test.tsx` (2 tests incl. eyebrow) and `SearchBar.test.tsx` (unchanged, still green).

- [ ] **Step 6: Commit**

```bash
git add app/components/sections/HeroSection
git commit -m "BITE-006: premium-minimal hero — min-h, lighter scrim, eyebrow"
```

---

### Task 3: Popular Nearby — eyebrow, premium spacing, tokens

**Files:**
- Modify: `app/components/sections/PopularNearbySection.tsx`
- Test: `app/components/sections/__tests__/PopularNearbySection.test.tsx`

**Interfaces:** No signature changes. `RestaurantCard` used exactly as before — **its internals are NOT touched** (shared with `/stores`).

- [ ] **Step 1: Write the failing eyebrow test**

Add inside `describe('PopularNearbySection', ...)`:

```tsx
  it('renders the eyebrow label', () => {
    render(<PopularNearbySection />)
    expect(screen.getByText('Nearby')).toBeInTheDocument()
  })
```

(`getByText('Nearby')` matches only the exact-text eyebrow, not the "Popular Nearby" heading.)

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test app/components/sections/__tests__/PopularNearbySection.test.tsx`
Expected: FAIL — no element with exact text "Nearby".

- [ ] **Step 3: Implement the restyle**

`app/components/sections/PopularNearbySection.tsx` — keep the two data consts (`featuredRestaurant`, `nearbyRestaurants`) exactly as they are; replace only the component body:

```tsx
export default function PopularNearbySection(): ReactElement {
  return (
    <Section size="3">
      <Container size="4">
        <Box className="px-4">
          {/* Header */}
          <Flex justify="between" align="end" mb="7">
            <Box>
              <Text
                as="span"
                size="1"
                weight="medium"
                className="uppercase tracking-[0.2em] text-brand block mb-2"
              >
                Nearby
              </Text>
              <Heading
                size="7"
                weight="medium"
                className="tracking-tight text-secondary"
              >
                Popular Nearby
              </Heading>
              <Text size="2" className="text-neutral mt-2 block">
                The trending flavors in your neighborhood right now.
              </Text>
            </Box>
            <Link href="/stores">
              <Text
                size="2"
                weight="medium"
                className="text-brand hover:text-brand-dark transition-colors"
              >
                View all
              </Text>
            </Link>
          </Flex>

          {/* Grid: large featured card left, 2×2 grid right */}
          <Flex gap="5" className="flex-col sm:flex-row">
            <Box className="sm:w-3/5">
              <RestaurantCard {...featuredRestaurant} featured />
            </Box>
            <Grid columns="2" gap="4" className="sm:w-2/5">
              {nearbyRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} {...restaurant} />
              ))}
            </Grid>
          </Flex>
        </Box>
      </Container>
    </Section>
  );
}
```

The import block stays: `Box, Container, Flex, Grid, Heading, Section, Text` from `@radix-ui/themes`, plus `Link` and `RestaurantCard` — all already imported. `Text` is already in the import.

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test app/components/sections/__tests__/PopularNearbySection.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add app/components/sections/PopularNearbySection.tsx app/components/sections/__tests__/PopularNearbySection.test.tsx
git commit -m "BITE-006: popular-nearby eyebrow + premium spacing/tokens"
```

---

### Task 4: Features — eyebrow, restrained icons, tokens

**Files:**
- Modify: `app/components/sections/FeaturesSection.tsx`
- Test: `app/components/sections/__tests__/FeaturesSection.test.tsx`

**Interfaces:** No signature changes. Keep the `features` data const exactly as-is.

- [ ] **Step 1: Write the failing eyebrow test**

Add inside `describe('FeaturesSection', ...)`:

```tsx
  it('renders the eyebrow label', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('How it works')).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test app/components/sections/__tests__/FeaturesSection.test.tsx`
Expected: FAIL — no element with text "How it works".

- [ ] **Step 3: Implement the restyle**

`app/components/sections/FeaturesSection.tsx` — keep the `features` const; replace the component body:

```tsx
export default function FeaturesSection(): ReactElement {
  return (
    <Section size="4" className="bg-surface-alt">
      <Container size="4">
        <Box className="px-4">
          <Flex direction="column" align="center" className="text-center">
            <Text
              as="span"
              size="1"
              weight="medium"
              className="uppercase tracking-[0.2em] text-brand mb-2"
            >
              How it works
            </Text>
            <Heading
              size="7"
              weight="medium"
              align="center"
              className="tracking-tight text-secondary"
            >
              Simple, Fast, Delicious
            </Heading>
          </Flex>

          <Grid columns={{ initial: "1", sm: "3" }} gap="8" className="mt-14">
            {features.map((feature) => (
              <Flex
                key={feature.id}
                direction="column"
                align="center"
                className="text-center"
              >
                {/* Icon circle — restrained */}
                <Flex
                  align="center"
                  justify="center"
                  className="w-14 h-14 rounded-full bg-white text-brand shadow-sm ring-1 ring-neutral/10"
                >
                  {feature.icon}
                </Flex>

                <Heading size="4" weight="medium" mt="5" className="text-secondary">
                  {feature.title}
                </Heading>
                <Text size="2" className="text-neutral mt-2 leading-relaxed max-w-xs">
                  {feature.description}
                </Text>
              </Flex>
            ))}
          </Grid>
        </Box>
      </Container>
    </Section>
  );
}
```

The import block already includes `Box, Container, Flex, Grid, Heading, Section, Text` — no import change.

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test app/components/sections/__tests__/FeaturesSection.test.tsx`
Expected: PASS (3 tests — heading, three titles, eyebrow).

- [ ] **Step 5: Commit**

```bash
git add app/components/sections/FeaturesSection.tsx app/components/sections/__tests__/FeaturesSection.test.tsx
git commit -m "BITE-006: features eyebrow, restrained icons, tokens"
```

---

### Task 5: FoodCard — premium card restyle (homepage-only)

**Files:**
- Modify: `app/components/ui/FoodCard.tsx`
- Test: `app/components/ui/__tests__/FoodCard.test.tsx` (existing — must stay green)

**Interfaces:** `FoodCardProps` unchanged: `{ name: string; restaurant: string; badge?: string; badgeColor?: "orange"|"green"|"blue"|"amber"|"red"; image: string }`. Style-only; no new test (existing 5 tests are the net).

- [ ] **Step 1: Confirm existing tests pass (baseline)**

Run: `yarn test app/components/ui/__tests__/FoodCard.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 2: Rewrite the file with premium tokens**

`app/components/ui/FoodCard.tsx`:

```tsx
import type { ReactElement } from "react";
import Image from "next/image";
import { Badge, Box, Text } from "@radix-ui/themes";

interface FoodCardProps {
  name: string;
  restaurant: string;
  badge?: string;
  badgeColor?: "orange" | "green" | "blue" | "amber" | "red";
  image: string;
}

export default function FoodCard({
  name,
  restaurant,
  badge,
  badgeColor = "green",
  image,
}: FoodCardProps): ReactElement {
  return (
    <Box className="relative w-48 flex-shrink-0 overflow-hidden rounded-2xl bg-white border border-neutral/15">
      {/* Image */}
      <Box className="relative h-52">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="192px"
        />
        {badge && (
          <Box className="absolute top-2 right-2">
            <Badge color={badgeColor} variant="solid" size="1" radius="full">
              {badge}
            </Badge>
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box className="p-4">
        <Text size="2" weight="medium" className="block text-secondary leading-snug">
          {name}
        </Text>
        <Text size="1" className="text-neutral mt-1 block">
          {restaurant}
        </Text>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 3: Confirm tests still pass**

Run: `yarn test app/components/ui/__tests__/FoodCard.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 4: Commit**

```bash
git add app/components/ui/FoodCard.tsx
git commit -m "BITE-006: premium FoodCard restyle with tokens"
```

---

### Task 6: Signature Bites — Radix, natural height, eyebrow

**Files:**
- Modify: `app/components/sections/SignatureBitesSection.tsx`
- Test: `app/components/sections/__tests__/SignatureBitesSection.test.tsx`

**Interfaces:** No signature changes. Renders the restyled `FoodCard` from Task 5 (same props). Keep the `signatureBites` data const exactly as-is.

- [ ] **Step 1: Write the failing eyebrow test**

Add inside `describe('SignatureBitesSection', ...)`:

```tsx
  it('renders the eyebrow label', () => {
    render(<SignatureBitesSection />)
    expect(screen.getByText("Chef's picks")).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test app/components/sections/__tests__/SignatureBitesSection.test.tsx`
Expected: FAIL — no element with text "Chef's picks".

- [ ] **Step 3: Implement — replace native `<div>`/`40vh` with `Section`, add eyebrow**

`app/components/sections/SignatureBitesSection.tsx` — keep the `signatureBites` const; replace imports + body:

```tsx
import type { ReactElement } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";
import FoodCard from "@/app/components/ui/FoodCard";

// (keep the existing `signatureBites` array unchanged, above this component)

export default function SignatureBitesSection(): ReactElement {
  return (
    <Section size="3">
      <Container size="4">
        <Box className="px-4">
          <Text
            as="span"
            size="1"
            weight="medium"
            className="uppercase tracking-[0.2em] text-brand block mb-2"
          >
            Chef&apos;s picks
          </Text>
          <Heading
            size="7"
            weight="medium"
            mb="6"
            className="tracking-tight text-secondary"
          >
            Signature Bites
          </Heading>

          {/* Horizontal scroll container */}
          <Flex
            gap="4"
            className="overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {signatureBites.map((item) => (
              <FoodCard key={item.id} {...item} />
            ))}
          </Flex>
        </Box>
      </Container>
    </Section>
  );
}
```

Note: the JSX uses `Chef&apos;s picks` (escaped apostrophe) to satisfy `react/no-unescaped-entities`; the rendered DOM text is `Chef's picks`, which the test matches.

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test app/components/sections/__tests__/SignatureBitesSection.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add app/components/sections/SignatureBitesSection.tsx app/components/sections/__tests__/SignatureBitesSection.test.tsx
git commit -m "BITE-006: signature-bites natural height + eyebrow"
```

---

### Task 7: App Download — Radix wrappers, `bg-secondary`, tokens, pill buttons

**Files:**
- Modify: `app/components/sections/AppDownloadBanner.tsx`
- Test: `app/components/sections/__tests__/AppDownloadBanner.test.tsx` (existing — must stay green)

**Interfaces:** No signature changes. Buttons keep their `aria-label`s so the existing role-name tests pass. Style/landmark cleanup only → no new test.

- [ ] **Step 1: Confirm existing tests pass (baseline)**

Run: `yarn test app/components/sections/__tests__/AppDownloadBanner.test.tsx`
Expected: PASS (2 tests — heading, store buttons).

- [ ] **Step 2: Rewrite the file (keep both icon helpers verbatim)**

`app/components/sections/AppDownloadBanner.tsx`:

```tsx
import type { ReactElement } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
} from "@radix-ui/themes";

function AppleIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 814 1000"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 390.7 43.3 190.9 98.1 124.3c38.8-46.5 98.3-75.3 160.7-75.3 54.9 0 100.1 36 133.7 36 31.7 0 81.7-38.5 144.1-38.5 23.3 0 108.2 2.6 168.3 90.7zm-180.3-140.9C580.4 160 578 99 578 97.6c.6-.6 1.2-.6 1.8-.6 28.4 2.6 89.7 37.2 128.5 79.1 33.3 35.9 63.7 94.6 63.7 153.3 0 1.3-.6 2.6-1.2 3.9-3.2.6-6.4 1.3-9.7 1.3-27.2 0-83.4-31-121.8-74.6z" />
    </svg>
  );
}

function PlayStoreIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 512 512"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l2.7 1.5 246.9-246.9v-5.8L47 0zm425.6 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c17.1-9.8 17.1-25.7-.1-35.6l-1.2-.2zm-230.5 135l-65.6 64.5L99.6 512l2.7 1.5c13 7.8 30.7 6.8 44.5-1.2l294-166.2-48-48z" />
    </svg>
  );
}

export default function AppDownloadBanner(): ReactElement {
  return (
    <Box className="px-6 py-10 md:px-10 md:py-16">
      {/* Dark rounded card */}
      <Box className="bg-secondary rounded-3xl overflow-hidden">
        <Container size="4">
          <Grid
            columns={{ initial: "1", md: "2" }}
            gap="9"
            align="center"
            className="px-8 py-12 md:px-12 md:py-16"
          >
            {/* Text content */}
            <Box>
              <Heading
                size={{ initial: "7", md: "8" }}
                className="text-white leading-tight tracking-tight"
              >
                Dash on the go.
              </Heading>
              <Text
                size="3"
                className="mt-4 text-white/70 block leading-relaxed max-w-sm"
              >
                Download the BiteDash app for exclusive offers, real-time
                tracking, and a smoother ordering experience.
              </Text>
              <Flex gap="3" mt="6" wrap="wrap">
                <Button
                  size="3"
                  variant="outline"
                  radius="full"
                  className="!border-white/20 !text-white !bg-white/5 hover:!bg-white/10 gap-2"
                  aria-label="Download on the App Store"
                >
                  <AppleIcon />
                  App Store
                </Button>
                <Button
                  size="3"
                  variant="outline"
                  radius="full"
                  className="!border-white/20 !text-white !bg-white/5 hover:!bg-white/10 gap-2"
                  aria-label="Get it on Google Play"
                >
                  <PlayStoreIcon />
                  Google Play
                </Button>
              </Flex>
            </Box>

            {/* Phone mockup */}
            <Flex align="center" justify="center" className="relative h-64">
              <Box className="relative w-44 h-56">
                <Image
                  src="https://picsum.photos/seed/phonemock/400/600"
                  alt="BiteDash mobile app"
                  fill
                  className="object-cover rounded-3xl shadow-2xl"
                  sizes="176px"
                />
              </Box>
            </Flex>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 3: Confirm tests still pass**

Run: `yarn test app/components/sections/__tests__/AppDownloadBanner.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 4: Commit**

```bash
git add app/components/sections/AppDownloadBanner.tsx
git commit -m "BITE-006: app-download banner Radix + bg-secondary tokens"
```

---

### Task 8: Landing page shell — drop the non-semantic wrapper `<div>`

**Files:**
- Modify: `app/page.tsx`
- Test: `app/__tests__/page.test.tsx` (existing — must stay green)

**Interfaces:** Imports the five section default exports (unchanged) + `Navbar`/`Footer`. Keeps the `<main>` landmark.

- [ ] **Step 1: Confirm existing test passes (baseline)**

Run: `yarn test app/__tests__/page.test.tsx`
Expected: PASS (renders without crashing).

- [ ] **Step 2: Remove the `min-h-screen flex flex-col` wrapper `<div>`**

`app/page.tsx` — replace the `LandingPage` function body (keep the imports and `metadata` unchanged):

```tsx
export default function LandingPage(): ReactElement {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <PopularNearbySection />
        <FeaturesSection />
        <SignatureBitesSection />
        <AppDownloadBanner />
      </main>
      <Footer />
    </>
  );
}
```

(The `<div className="min-h-screen flex flex-col">` around Popular Nearby + Features is deleted — with natural section flow it is no longer needed, and it was the last non-semantic wrapper on the page.)

- [ ] **Step 3: Confirm test still passes**

Run: `yarn test app/__tests__/page.test.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "BITE-006: drop non-semantic landing wrapper div"
```

---

### Task 9: Full verification + render-and-measure (gate — no code)

**Files:** none (verification only).

- [ ] **Step 1: Type-check**

Run: `yarn type-check`
Expected: no TypeScript errors.

- [ ] **Step 2: Lint**

Run: `yarn lint`
Expected: no errors/warnings.

- [ ] **Step 3: Full suite with coverage**

Run: `yarn test:coverage`
Expected: all tests PASS **and** coverage ≥ 90 statements / 85 branches / 95 functions / 90 lines. If any homepage file dropped below gate, add assertions until it passes (do not lower thresholds).

- [ ] **Step 4: Start the dev server**

Run (background): `yarn dev`
Wait until it reports the local URL (e.g. `http://localhost:3000`).

- [ ] **Step 5: Render-and-measure in a real browser (Playwright MCP)**

Using the `mcp__plugin_playwright_playwright__browser_*` tools:
1. `browser_resize` to **390 × 844** (mobile), `browser_navigate` to the dev URL, `browser_take_screenshot`.
2. `browser_resize` to **1440 × 900** (desktop), reload, `browser_take_screenshot`.

Verify against the premium-minimal intent:
- **No content clipping** anywhere (the point of removing the fixed `100vh/40vh/50vh` heights) — hero text + search pill fully visible; Signature Bites row and App Download card not cut off.
- Consistent vertical rhythm between sections; eyebrows present on Hero / Popular Nearby / Features / Signature Bites.
- Tomato used only as accent (CTA, eyebrows, hover); App Download card is `secondary` (#1A1A1A), not pure black-gray.
- Horizontal scroll works on Signature Bites at mobile; no horizontal page overflow at either width.

Record observations (and screenshots) as the verification evidence. Fix any clipping/overflow found, re-run the affected task's tests, and re-measure.

- [ ] **Step 6: Stop the dev server** and confirm the branch is clean (`git status`).

---

## Self-Review

**Spec coverage:** Foundations — spacing rhythm (Tasks 2/6/7/8 remove fixed heights; Sections give rhythm) ✓; typography medium-weight + eyebrows (Tasks 2/3/4/6) ✓; token-only color (all tasks + mapping table) ✓; accent restraint (brand only on eyebrow/CTA/hover) ✓; Radix-only for content, landmarks retained (Tasks 1/8 keep `<header>`/`<main>`, wrappers → Box) ✓. Per-section: Navbar (T1), Hero+SearchBar (T2), Popular Nearby / RestaurantCard untouched (T3), Features (T4), Signature Bites + FoodCard (T5+T6), App Download (T7) ✓. Testing (RTL red-first for eyebrows; existing tests as net) + render-and-measure (T9) ✓. Non-goals honored: no backend, no `RestaurantCard`/`/stores` changes, no new deps, no `globals.css` token changes ✓.

**Placeholder scan:** none — every step has concrete code/commands.

**Type consistency:** `FoodCardProps` identical between Task 5 (definition) and Task 6 (consumer). All components typed `(): ReactElement`. Eyebrow strings match between test and implementation per task ("Order in minutes", "Nearby", "How it works", "Chef's picks").
