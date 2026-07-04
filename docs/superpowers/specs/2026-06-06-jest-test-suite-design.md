# Jest Test Suite Design

**Date:** 2026-06-06
**Scope:** Add Jest + React Testing Library to the Bite Next.js 15 project and write tests for all existing components.

---

## 1. Jest Setup

### Packages (devDependencies)

| Package | Purpose |
|---|---|
| `jest` | Test runner |
| `jest-environment-jsdom` | Browser-like DOM for component rendering |
| `@testing-library/react` | Component rendering + querying |
| `@testing-library/jest-dom` | DOM matchers (`toBeInTheDocument`, etc.) |
| `@testing-library/user-event` | Realistic user interaction simulation |
| `@types/jest` | TypeScript types for Jest globals |

`next/jest` (bundled with Next.js) handles SWC-based TypeScript transpilation — no `ts-jest` or Babel config needed.

### Config files

**`jest.config.ts`** (root):
```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 95,
      lines: 90,
    },
  },
}

export default createJestConfig(config)
```

**`jest.setup.ts`** (root):
```ts
import '@testing-library/jest-dom'
```

### package.json scripts

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

---

## 2. Test Utilities

**`test-utils.tsx`** at `lib/test-utils/index.tsx` — wraps RTL's `render` with the Radix `<Theme>` provider so all Radix components work without per-test boilerplate:

```tsx
import { render, type RenderOptions } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'

function Providers({ children }: { children: React.ReactNode }) {
  return <Theme>{children}</Theme>
}

function customRender(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: Providers, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
```

---

## 3. Global Mocks

Defined in `jest.setup.ts` or as `__mocks__` files:

| Mock target | Strategy |
|---|---|
| `next/image` | Replace with plain `<img>` that forwards all props |
| `next/navigation` | Mock `useRouter`, `usePathname`, `useSearchParams` per-test via `jest.mock` |
| `next/link` | Pass-through — works in jsdom |

---

## 4. File Organization

Tests live in `__tests__/` subfolders co-located with their feature directory (Option A).

```
app/(dashboard)/cart/components/__tests__/
  CartItems.test.tsx          ← behavior
  CartOrderSummary.test.tsx   ← behavior
  PairsWellWith.test.tsx      ← behavior

app/(dashboard)/checkout/components/__tests__/
  CheckoutStepper.test.tsx         ← behavior
  DeliveryAddressSection.test.tsx  ← behavior
  PaymentMethodSection.test.tsx    ← behavior
  CheckoutOrderSummary.test.tsx    ← smoke

app/(dashboard)/orders/components/__tests__/
  AccountSidebar.test.tsx    ← behavior (activePage prop)
  OrdersEmptyState.test.tsx  ← smoke

app/(dashboard)/orders/[id]/components/__tests__/
  DeliveryPanel.test.tsx         ← smoke
  OrderProgressStepper.test.tsx  ← smoke
  TrackingMap.test.tsx           ← smoke

app/(dashboard)/profile/components/__tests__/
  ProfilePicture.test.tsx      ← smoke
  PersonalInfo.test.tsx        ← smoke
  AccountPreferences.test.tsx  ← smoke
  DangerZone.test.tsx          ← smoke
  SettingsSidebar.test.tsx     ← behavior (activePage prop)

app/auth/login/components/__tests__/
  LoginForm.test.tsx   ← behavior

app/auth/sign-up/components/__tests__/
  SignUpForm.test.tsx  ← behavior

app/components/ui/__tests__/
  icons.test.tsx             ← smoke
  FoodCard.test.tsx          ← smoke
  RestaurantCard.test.tsx    ← smoke
  FeedRestaurantCard.test.tsx ← smoke

app/components/form/__tests__/
  ButtonWithLoading.test.tsx ← behavior
  EmailInput.test.tsx        ← smoke
  PasswordInput.test.tsx     ← smoke
  PhoneInput.test.tsx        ← smoke

app/components/layout/__tests__/
  Navbar.test.tsx    ← smoke
  Footer.test.tsx    ← smoke

app/components/layout/DashboardNavbar/__tests__/
  index.test.tsx    ← smoke
  NavSearch.test.tsx ← behavior
  NavLinks.test.tsx  ← smoke

app/components/sections/__tests__/
  FeaturesSection.test.tsx       ← smoke
  AppDownloadBanner.test.tsx     ← smoke
  PopularNearbySection.test.tsx  ← smoke
  SignatureBitesSection.test.tsx ← smoke

app/components/sections/HeroSection/__tests__/
  index.test.tsx    ← smoke (mock SearchBar)
  SearchBar.test.tsx ← behavior

app/(dashboard)/stores/components/__tests__/
  FeaturedRestaurantCard.test.tsx ← smoke
  FilterSidebar.test.tsx          ← smoke
  FilterTabs.test.tsx             ← behavior (tab selection)

app/(dashboard)/stores/[id]/components/__tests__/
  AppetizersGrid.test.tsx  ← smoke
  GuestExperiences.test.tsx ← smoke
  MainsList.test.tsx        ← smoke
  MenuTabs.test.tsx         ← behavior (tab selection)
  OrderSidebar.test.tsx     ← smoke

# Page-level smoke tests (mock all children)
app/__tests__/page.test.tsx
app/(dashboard)/cart/__tests__/page.test.tsx
app/(dashboard)/checkout/__tests__/page.test.tsx
app/(dashboard)/orders/__tests__/page.test.tsx
app/(dashboard)/profile/__tests__/page.test.tsx
app/(dashboard)/stores/__tests__/page.test.tsx
app/(dashboard)/stores/[id]/__tests__/page.test.tsx
```

---

## 5. Test Coverage Plan

### Behavior tests — interactions and state

| Component | Scenarios |
|---|---|
| `CartItems` | Increment qty; decrement qty; remove item when qty reaches 0; clear cart button empties list; empty state message shown when no items |
| `CartOrderSummary` | Promo code input updates on type; pricing rows render with correct amounts |
| `PairsWellWith` | "+ Add" button changes to "Added" after click; button becomes disabled after add |
| `CheckoutStepper` | Step matching `currentStep` prop is marked active; other steps are not |
| `PaymentMethodSection` | Selecting a method highlights it |
| `DeliveryAddressSection` | Address fields render |
| `NavSearch` | Input value updates on keystroke |
| `AccountSidebar` | Link matching `activePage` prop has active styling |
| `SettingsSidebar` | Link matching `activePage` prop has active styling |
| `LoginForm` | Shows field errors on invalid submit; calls submit handler on valid input |
| `SignUpForm` | Shows field errors on invalid submit; calls submit handler on valid input |
| `ButtonWithLoading` | Shows loading indicator when `isLoading` is true; disabled during loading |

### Smoke tests — render without crash + key content present

All remaining components: render without throwing, assert at least one key piece of text or landmark is in the document.

### Server component pages — smoke with mocked children

Each `page.tsx` mocks its child components with `jest.mock(...)` and asserts the page renders (does not throw). This validates component assembly without needing a server context.

---

## 6. Coverage Enforcement

Thresholds are enforced from day one in `jest.config.ts`. The suite will fail if coverage drops below:

- Statements: 90%
- Branches: 85%
- Functions: 95%
- Lines: 90%

---

## 7. Constraints

- Use `yarn` exclusively — no `npm install`
- No `any` types in test files
- Radix UI components must always be wrapped with `<Theme>` via the shared `render` helper
- `next/image` must be mocked globally — it does not work in jsdom
- Server components cannot use React hooks, so no `userEvent` interactions on page-level tests
