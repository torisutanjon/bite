# Jest Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Jest + React Testing Library and write a complete test suite covering all existing components with behavior tests for stateful components and smoke tests for presentational ones.

**Architecture:** Tests live in `__tests__/` subfolders co-located per feature directory. A shared `lib/test-utils/index.tsx` wraps RTL's `render` with the Radix `<Theme>` provider. `next/image` is mocked globally via `moduleNameMapper`. Coverage thresholds (90/85/95/90) are enforced from day one.

**Tech Stack:** Jest 29, jest-environment-jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, next/jest (SWC transformer bundled with Next.js), Radix UI Theme provider

---

## Task 1: Install packages and configure Jest

**Files:**
- Modify: `package.json`
- Create: `jest.config.ts`
- Create: `jest.setup.ts`

- [ ] **Step 1: Install dev dependencies**

```bash
yarn add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
```

Expected: packages added to `devDependencies`, no errors.

- [ ] **Step 2: Add test scripts to `package.json`**

In `package.json`, add inside `"scripts"`:
```json
"type-check": "tsc --noEmit",
"lint": "eslint",
"prettier:fix": "prettier --write .",
"format:check": "prettier --check .",
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

- [ ] **Step 3: Create `jest.config.ts` at the project root**

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
  moduleNameMapper: {
    '^next/image$': '<rootDir>/__mocks__/next/image.tsx',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 4: Create `jest.setup.ts` at the project root**

```ts
import '@testing-library/jest-dom'

// scrollIntoView is not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = jest.fn()
```

- [ ] **Step 5: Commit**

```bash
git add jest.config.ts jest.setup.ts package.json
git commit -m "chore: install and configure jest with next/jest and RTL"
```

---

## Task 2: Create test utilities and global mocks

**Files:**
- Create: `lib/test-utils/index.tsx`
- Create: `__mocks__/next/image.tsx`

- [ ] **Step 1: Create `__mocks__/next/image.tsx`**

```tsx
import React from 'react'

interface MockImageProps {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  className?: string
  style?: React.CSSProperties
  [key: string]: unknown
}

export default function MockImage({ src, alt, fill: _fill, priority: _priority, sizes: _sizes, ...props }: MockImageProps): React.ReactElement {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...props} />
}
```

- [ ] **Step 2: Create `lib/test-utils/index.tsx`**

```tsx
import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'

function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  return <Theme accentColor="tomato">{children}</Theme>
}

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Providers, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
```

- [ ] **Step 3: Write a trivial test to verify the setup works**

Create `lib/test-utils/__tests__/setup.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'

describe('test-utils setup', () => {
  it('renders inside Radix Theme provider without crashing', () => {
    render(<div>hello</div>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run test to verify it passes**

```bash
yarn test lib/test-utils/__tests__/setup.test.tsx
```

Expected: PASS — 1 test passes, no errors about missing providers.

- [ ] **Step 5: Commit**

```bash
git add __mocks__/next/image.tsx lib/test-utils/
git commit -m "chore: add test utilities with Radix Theme provider and next/image mock"
```

---

## Task 3: UI primitive component tests

**Files:**
- Create: `app/components/ui/__tests__/icons.test.tsx`
- Create: `app/components/ui/__tests__/FoodCard.test.tsx`
- Create: `app/components/ui/__tests__/RestaurantCard.test.tsx`
- Create: `app/components/ui/__tests__/FeedRestaurantCard.test.tsx`

- [ ] **Step 1: Write tests for `icons.tsx`**

Create `app/components/ui/__tests__/icons.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import { UserIcon } from '../icons'

describe('UserIcon', () => {
  it('renders an svg element', () => {
    const { container } = render(<UserIcon />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('has aria-hidden attribute', () => {
    const { container } = render(<UserIcon />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
```

- [ ] **Step 2: Write tests for `FoodCard.tsx`**

Create `app/components/ui/__tests__/FoodCard.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import FoodCard from '../FoodCard'

const defaultProps = {
  name: 'Truffle Burger',
  restaurant: 'The Grill House',
  image: 'https://example.com/burger.jpg',
}

describe('FoodCard', () => {
  it('renders the food name', () => {
    render(<FoodCard {...defaultProps} />)
    expect(screen.getByText('Truffle Burger')).toBeInTheDocument()
  })

  it('renders the restaurant name', () => {
    render(<FoodCard {...defaultProps} />)
    expect(screen.getByText('The Grill House')).toBeInTheDocument()
  })

  it('renders image with correct alt text', () => {
    render(<FoodCard {...defaultProps} />)
    expect(screen.getByRole('img', { name: 'Truffle Burger' })).toBeInTheDocument()
  })

  it('renders badge when provided', () => {
    render(<FoodCard {...defaultProps} badge="NEW" />)
    expect(screen.getByText('NEW')).toBeInTheDocument()
  })

  it('does not render badge when not provided', () => {
    render(<FoodCard {...defaultProps} />)
    expect(screen.queryByText('NEW')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Write tests for `RestaurantCard.tsx`**

Create `app/components/ui/__tests__/RestaurantCard.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import RestaurantCard from '../RestaurantCard'

const defaultProps = {
  name: 'Sakura Japanese',
  cuisine: 'Japanese',
  rating: 4.8,
  deliveryTime: '25–35 min',
  image: 'https://example.com/sakura.jpg',
}

describe('RestaurantCard', () => {
  it('renders the restaurant name', () => {
    render(<RestaurantCard {...defaultProps} />)
    expect(screen.getByText('Sakura Japanese')).toBeInTheDocument()
  })

  it('renders cuisine type', () => {
    render(<RestaurantCard {...defaultProps} />)
    expect(screen.getByText('Japanese')).toBeInTheDocument()
  })

  it('renders the rating', () => {
    render(<RestaurantCard {...defaultProps} />)
    expect(screen.getByText('4.8')).toBeInTheDocument()
  })

  it('renders delivery time', () => {
    render(<RestaurantCard {...defaultProps} />)
    expect(screen.getByText('25–35 min')).toBeInTheDocument()
  })

  it('renders badge when provided', () => {
    render(<RestaurantCard {...defaultProps} badge="PROMOTED" />)
    expect(screen.getByText('PROMOTED')).toBeInTheDocument()
  })

  it('renders image with correct alt text', () => {
    render(<RestaurantCard {...defaultProps} />)
    expect(screen.getByRole('img', { name: 'Sakura Japanese' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Write tests for `FeedRestaurantCard.tsx`**

Create `app/components/ui/__tests__/FeedRestaurantCard.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import FeedRestaurantCard from '../FeedRestaurantCard'

const defaultProps = {
  name: 'Burger Palace',
  cuisine: 'American',
  rating: 4.5,
  deliveryTime: '20–30 min',
  priceLevel: 2,
  image: 'https://example.com/burger-palace.jpg',
}

describe('FeedRestaurantCard', () => {
  it('renders the restaurant name', () => {
    render(<FeedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('Burger Palace')).toBeInTheDocument()
  })

  it('renders cuisine', () => {
    render(<FeedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('American')).toBeInTheDocument()
  })

  it('renders rating', () => {
    render(<FeedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('renders delivery time', () => {
    render(<FeedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('20–30 min')).toBeInTheDocument()
  })

  it('renders save button with accessible label', () => {
    render(<FeedRestaurantCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: /save Burger Palace/i })).toBeInTheDocument()
  })

  it('renders add to cart button', () => {
    render(<FeedRestaurantCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: /add Burger Palace to cart/i })).toBeInTheDocument()
  })

  it('renders badge when provided', () => {
    render(<FeedRestaurantCard {...defaultProps} badge="POPULAR" />)
    expect(screen.getByText('POPULAR')).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run tests**

```bash
yarn test app/components/ui/__tests__/
```

Expected: PASS — all 18 tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/components/ui/__tests__/
git commit -m "test: add smoke tests for ui primitive components"
```

---

## Task 4: Form component tests

**Files:**
- Create: `app/components/form/__tests__/ButtonWithLoading.test.tsx`
- Create: `app/components/form/__tests__/EmailInput.test.tsx`
- Create: `app/components/form/__tests__/PasswordInput.test.tsx`
- Create: `app/components/form/__tests__/PhoneInput.test.tsx`

- [ ] **Step 1: Write tests for `ButtonWithLoading.tsx`**

Create `app/components/form/__tests__/ButtonWithLoading.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import ButtonWithLoading from '../ButtonWithLoading'

describe('ButtonWithLoading', () => {
  it('renders children text', () => {
    render(<ButtonWithLoading isLoading={false}>Save</ButtonWithLoading>)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('is not disabled when isLoading is false', () => {
    render(<ButtonWithLoading isLoading={false}>Save</ButtonWithLoading>)
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
  })

  it('is disabled when isLoading is true', () => {
    render(<ButtonWithLoading isLoading={true}>Save</ButtonWithLoading>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows spinner icon when isLoading is true', () => {
    const { container } = render(<ButtonWithLoading isLoading={true}>Save</ButtonWithLoading>)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('hides spinner icon when isLoading is false', () => {
    const { container } = render(<ButtonWithLoading isLoading={false}>Save</ButtonWithLoading>)
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Write tests for `EmailInput.tsx`**

Create `app/components/form/__tests__/EmailInput.test.tsx`:
```tsx
import React from 'react'
import { render, screen, fireEvent } from '@/lib/test-utils'
import EmailInput from '../EmailInput'

describe('EmailInput', () => {
  it('renders with default placeholder', () => {
    render(<EmailInput value="" onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<EmailInput value="" onChange={jest.fn()} placeholder="your@email.com" />)
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
  })

  it('displays error message when error prop is provided', () => {
    render(<EmailInput value="" onChange={jest.fn()} error="Invalid email" />)
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })

  it('does not display error message when error is empty', () => {
    render(<EmailInput value="" onChange={jest.fn()} />)
    expect(screen.queryByText('Invalid email')).not.toBeInTheDocument()
  })

  it('calls onChange with new value when user types', () => {
    const onChange = jest.fn()
    render(<EmailInput value="" onChange={onChange} />)
    const input = screen.getByPlaceholderText('name@example.com')
    fireEvent.change(input, { target: { value: 'test@test.com' } })
    expect(onChange).toHaveBeenCalledWith('test@test.com')
  })
})
```

- [ ] **Step 3: Write tests for `PasswordInput.tsx`**

Create `app/components/form/__tests__/PasswordInput.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import PasswordInput from '../PasswordInput'

describe('PasswordInput', () => {
  it('renders a password input by default', () => {
    render(<PasswordInput value="" onChange={jest.fn()} />)
    const input = screen.getByPlaceholderText('••••••••')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('shows password as text when show button is clicked', async () => {
    const user = userEvent.setup()
    render(<PasswordInput value="" onChange={jest.fn()} />)
    const toggleButton = screen.getByRole('button', { name: /show password/i })
    await user.click(toggleButton)
    const input = screen.getByPlaceholderText('••••••••')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('hides password again when show button is clicked twice', async () => {
    const user = userEvent.setup()
    render(<PasswordInput value="" onChange={jest.fn()} />)
    const toggleButton = screen.getByRole('button', { name: /show password/i })
    await user.click(toggleButton)
    await user.click(screen.getByRole('button', { name: /hide password/i }))
    const input = screen.getByPlaceholderText('••••••••')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('displays error message when error prop is provided', () => {
    render(<PasswordInput value="" onChange={jest.fn()} error="Too short" />)
    expect(screen.getByText('Too short')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Write tests for `PhoneInput.tsx`**

Create `app/components/form/__tests__/PhoneInput.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import PhoneInput from '../PhoneInput'

describe('PhoneInput', () => {
  it('renders with default placeholder', () => {
    render(<PhoneInput value="" onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('+1 (555) 000-0000')).toBeInTheDocument()
  })

  it('renders with tel input type', () => {
    render(<PhoneInput value="" onChange={jest.fn()} id="phone" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel')
  })

  it('displays error message when error prop is provided', () => {
    render(<PhoneInput value="" onChange={jest.fn()} error="Invalid phone number" />)
    expect(screen.getByText('Invalid phone number')).toBeInTheDocument()
  })

  it('does not display error when no error prop', () => {
    render(<PhoneInput value="" onChange={jest.fn()} />)
    expect(screen.queryByText('Invalid phone number')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run tests**

```bash
yarn test app/components/form/__tests__/
```

Expected: PASS — all 19 tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/components/form/__tests__/
git commit -m "test: add form component tests with behavior coverage for ButtonWithLoading and PasswordInput"
```

---

## Task 5: Layout component tests

**Files:**
- Create: `app/components/layout/__tests__/Navbar.test.tsx`
- Create: `app/components/layout/__tests__/Footer.test.tsx`
- Create: `app/components/layout/DashboardNavbar/__tests__/index.test.tsx`
- Create: `app/components/layout/DashboardNavbar/__tests__/NavSearch.test.tsx`
- Create: `app/components/layout/DashboardNavbar/__tests__/NavLinks.test.tsx`

- [ ] **Step 1: Write tests for `Navbar.tsx`**

Create `app/components/layout/__tests__/Navbar.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import Navbar from '../Navbar'

describe('Navbar', () => {
  it('renders the BiteDash logo', () => {
    render(<Navbar />)
    expect(screen.getByText('BiteDash')).toBeInTheDocument()
  })

  it('renders Stores nav link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /stores/i })).toBeInTheDocument()
  })

  it('renders Orders nav link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument()
  })

  it('renders cart link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /cart/i })).toBeInTheDocument()
  })

  it('renders profile link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Write tests for `Footer.tsx`**

Create `app/components/layout/__tests__/Footer.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders the BiteDash brand name', () => {
    render(<Footer />)
    expect(screen.getAllByText('BiteDash').length).toBeGreaterThanOrEqual(1)
  })

  it('renders company links', () => {
    render(<Footer />)
    expect(screen.getByText('Become a Rider')).toBeInTheDocument()
    expect(screen.getByText('Add your Restaurant')).toBeInTheDocument()
    expect(screen.getByText('About Us')).toBeInTheDocument()
  })

  it('renders support links', () => {
    render(<Footer />)
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Help Center')).toBeInTheDocument()
  })

  it('renders social links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument()
  })

  it('renders copyright text', () => {
    render(<Footer />)
    expect(screen.getByText(/BiteDash Inc\. All rights reserved/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Write tests for `DashboardNavbar/index.tsx`**

Create `app/components/layout/DashboardNavbar/__tests__/index.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/stores'),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}))

import DashboardNavbar from '../index'

describe('DashboardNavbar', () => {
  it('renders the BiteDash logo', () => {
    render(<DashboardNavbar />)
    expect(screen.getByText('BiteDash')).toBeInTheDocument()
  })

  it('renders cart link with aria-label', () => {
    render(<DashboardNavbar />)
    expect(screen.getByRole('link', { name: /cart/i })).toBeInTheDocument()
  })

  it('renders profile link', () => {
    render(<DashboardNavbar />)
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument()
  })

  it('renders location text', () => {
    render(<DashboardNavbar />)
    expect(screen.getByText(/Baker St/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Write tests for `NavSearch.tsx`**

Create `app/components/layout/DashboardNavbar/__tests__/NavSearch.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}))

import NavSearch from '../NavSearch'

describe('NavSearch', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders search input', () => {
    render(<NavSearch />)
    expect(screen.getByRole('textbox', { name: /search restaurants/i })).toBeInTheDocument()
  })

  it('updates input value as user types', async () => {
    const user = userEvent.setup()
    render(<NavSearch />)
    const input = screen.getByRole('textbox', { name: /search restaurants/i })
    await user.type(input, 'sushi')
    expect(input).toHaveValue('sushi')
  })

  it('navigates to stores search on Enter key', async () => {
    const user = userEvent.setup()
    render(<NavSearch />)
    const input = screen.getByRole('textbox', { name: /search restaurants/i })
    await user.type(input, 'sushi')
    await user.keyboard('{Enter}')
    expect(mockPush).toHaveBeenCalledWith('/stores?q=sushi')
  })

  it('does not navigate on Enter when input is empty', async () => {
    const user = userEvent.setup()
    render(<NavSearch />)
    const input = screen.getByRole('textbox', { name: /search restaurants/i })
    await user.click(input)
    await user.keyboard('{Enter}')
    expect(mockPush).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 5: Write tests for `NavLinks.tsx`**

Create `app/components/layout/DashboardNavbar/__tests__/NavLinks.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'

const mockUsePathname = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
}))

import NavLinks from '../NavLinks'

describe('NavLinks', () => {
  it('renders all three nav links', () => {
    mockUsePathname.mockReturnValue('/')
    render(<NavLinks />)
    expect(screen.getByRole('link', { name: /browse/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /offers/i })).toBeInTheDocument()
  })

  it('applies active styling to the matching link', () => {
    mockUsePathname.mockReturnValue('/stores/123')
    render(<NavLinks />)
    const browseLink = screen.getByRole('link', { name: /browse/i })
    expect(browseLink).toHaveClass('border-brand')
  })

  it('does not apply active styling to non-matching links', () => {
    mockUsePathname.mockReturnValue('/stores')
    render(<NavLinks />)
    const ordersLink = screen.getByRole('link', { name: /orders/i })
    expect(ordersLink).toHaveClass('border-transparent')
  })
})
```

- [ ] **Step 6: Run tests**

```bash
yarn test app/components/layout/
```

Expected: PASS — all 22 tests pass.

- [ ] **Step 7: Commit**

```bash
git add app/components/layout/__tests__/ app/components/layout/DashboardNavbar/__tests__/
git commit -m "test: add layout component tests including NavSearch and NavLinks behavior"
```

---

## Task 6: Section component tests

**Files:**
- Create: `app/components/sections/__tests__/FeaturesSection.test.tsx`
- Create: `app/components/sections/__tests__/AppDownloadBanner.test.tsx`
- Create: `app/components/sections/__tests__/PopularNearbySection.test.tsx`
- Create: `app/components/sections/__tests__/SignatureBitesSection.test.tsx`
- Create: `app/components/sections/HeroSection/__tests__/index.test.tsx`
- Create: `app/components/sections/HeroSection/__tests__/SearchBar.test.tsx`

- [ ] **Step 1: Write tests for `FeaturesSection.tsx`**

Create `app/components/sections/__tests__/FeaturesSection.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import FeaturesSection from '../FeaturesSection'

describe('FeaturesSection', () => {
  it('renders the section heading', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Simple, Fast, Delicious')).toBeInTheDocument()
  })

  it('renders all three feature titles', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Discover Your Craving')).toBeInTheDocument()
    expect(screen.getByText('Seamless Checkout')).toBeInTheDocument()
    expect(screen.getByText('Lightning Delivery')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Write smoke tests for the remaining section components**

Create `app/components/sections/__tests__/AppDownloadBanner.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import AppDownloadBanner from '../AppDownloadBanner'

describe('AppDownloadBanner', () => {
  it('renders without crashing', () => {
    const { container } = render(<AppDownloadBanner />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
```

Create `app/components/sections/__tests__/PopularNearbySection.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import PopularNearbySection from '../PopularNearbySection'

describe('PopularNearbySection', () => {
  it('renders without crashing', () => {
    const { container } = render(<PopularNearbySection />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
```

Create `app/components/sections/__tests__/SignatureBitesSection.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import SignatureBitesSection from '../SignatureBitesSection'

describe('SignatureBitesSection', () => {
  it('renders without crashing', () => {
    const { container } = render(<SignatureBitesSection />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Write tests for `HeroSection/index.tsx` (mocking SearchBar)**

Create `app/components/sections/HeroSection/__tests__/index.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'

jest.mock('../SearchBar', () => ({
  default: () => <div data-testid="search-bar" />,
}))

import HeroSection from '../index'

describe('HeroSection', () => {
  it('renders without crashing', () => {
    render(<HeroSection />)
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Write tests for `HeroSection/SearchBar.tsx`**

Create `app/components/sections/HeroSection/__tests__/SearchBar.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}))

import SearchBar from '../SearchBar'

describe('SearchBar', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders a search input', () => {
    render(<SearchBar />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('updates input as user types', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'pizza')
    expect(input).toHaveValue('pizza')
  })

  it('renders a search button', () => {
    render(<SearchBar />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run tests**

```bash
yarn test app/components/sections/
```

Expected: PASS — all tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/components/sections/
git commit -m "test: add section component smoke tests and HeroSection SearchBar behavior tests"
```

---

## Task 7: Cart component tests

**Files:**
- Create: `app/(dashboard)/cart/components/__tests__/CartItems.test.tsx`
- Create: `app/(dashboard)/cart/components/__tests__/CartOrderSummary.test.tsx`
- Create: `app/(dashboard)/cart/components/__tests__/PairsWellWith.test.tsx`

- [ ] **Step 1: Write tests for `CartItems.tsx`**

Create `app/(dashboard)/cart/components/__tests__/CartItems.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import CartItems from '../CartItems'

describe('CartItems', () => {
  it('renders initial cart items', () => {
    render(<CartItems />)
    expect(screen.getByText('Truffle Umami Burger')).toBeInTheDocument()
    expect(screen.getByText('Zesty Quinoa Power Bowl')).toBeInTheDocument()
  })

  it('renders total item count in header', () => {
    render(<CartItems />)
    // Initial: burger qty=1, quinoa qty=2 → total 3
    expect(screen.getByText(/3 Items/)).toBeInTheDocument()
  })

  it('increments quantity and updates total count', async () => {
    const user = userEvent.setup()
    render(<CartItems />)
    const increaseButtons = screen.getAllByRole('button', { name: /increase quantity/i })
    await user.click(increaseButtons[0])
    expect(screen.getByText(/4 Items/)).toBeInTheDocument()
  })

  it('decrements quantity and updates total count', async () => {
    const user = userEvent.setup()
    render(<CartItems />)
    // Second item (quinoa) has qty=2, so decrease button is enabled
    const decreaseButtons = screen.getAllByRole('button', { name: /decrease quantity/i })
    await user.click(decreaseButtons[1])
    expect(screen.getByText(/2 Items/)).toBeInTheDocument()
  })

  it('disables decrease button when item qty is 1', () => {
    render(<CartItems />)
    // First item (burger) has qty=1
    const decreaseButtons = screen.getAllByRole('button', { name: /decrease quantity/i })
    expect(decreaseButtons[0]).toBeDisabled()
  })

  it('shows empty state after clicking Clear Cart', async () => {
    const user = userEvent.setup()
    render(<CartItems />)
    const clearButton = screen.getByRole('button', { name: /clear cart/i })
    await user.click(clearButton)
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  it('renders item total price correctly', () => {
    render(<CartItems />)
    // Quinoa bowl: $14.20 × 2 = $28.40
    expect(screen.getByText('$28.40')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Write tests for `CartOrderSummary.tsx`**

Create `app/(dashboard)/cart/components/__tests__/CartOrderSummary.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import CartOrderSummary from '../CartOrderSummary'

describe('CartOrderSummary', () => {
  it('renders order summary heading', () => {
    render(<CartOrderSummary />)
    expect(screen.getByText('Order Summary')).toBeInTheDocument()
  })

  it('renders subtotal', () => {
    render(<CartOrderSummary />)
    expect(screen.getByText('$46.90')).toBeInTheDocument()
  })

  it('renders delivery fee', () => {
    render(<CartOrderSummary />)
    expect(screen.getByText('$2.99')).toBeInTheDocument()
  })

  it('renders total amount', () => {
    render(<CartOrderSummary />)
    // 46.90 + 2.99 + 4.25 = 54.14
    expect(screen.getByText('$54.14')).toBeInTheDocument()
  })

  it('renders promo code input', () => {
    render(<CartOrderSummary />)
    expect(screen.getByPlaceholderText('Promo code')).toBeInTheDocument()
  })

  it('updates promo code input as user types', async () => {
    const user = userEvent.setup()
    render(<CartOrderSummary />)
    const input = screen.getByPlaceholderText('Promo code')
    await user.type(input, 'SAVE10')
    expect(input).toHaveValue('SAVE10')
  })

  it('renders Proceed to Checkout link', () => {
    render(<CartOrderSummary />)
    expect(screen.getByRole('link', { name: /proceed to checkout/i })).toBeInTheDocument()
  })

  it('renders Priority Delivery banner', () => {
    render(<CartOrderSummary />)
    expect(screen.getByText('Priority Delivery')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Write tests for `PairsWellWith.tsx`**

Create `app/(dashboard)/cart/components/__tests__/PairsWellWith.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import PairsWellWith from '../PairsWellWith'

describe('PairsWellWith', () => {
  it('renders the section heading', () => {
    render(<PairsWellWith />)
    expect(screen.getByText('Pairs well with...')).toBeInTheDocument()
  })

  it('renders all recommendation items', () => {
    render(<PairsWellWith />)
    expect(screen.getByText('Cold Brew Coffee')).toBeInTheDocument()
    expect(screen.getByText('Glazed Delight')).toBeInTheDocument()
    expect(screen.getByText('Sweet Potato Fries')).toBeInTheDocument()
    expect(screen.getByText('Fresh Orange Juice')).toBeInTheDocument()
  })

  it('renders + Add buttons initially', () => {
    render(<PairsWellWith />)
    const addButtons = screen.getAllByRole('button', { name: /\+ add/i })
    expect(addButtons).toHaveLength(4)
  })

  it('changes button to Added after clicking', async () => {
    const user = userEvent.setup()
    render(<PairsWellWith />)
    const addButtons = screen.getAllByRole('button', { name: /\+ add/i })
    await user.click(addButtons[0])
    expect(screen.getByRole('button', { name: /^added$/i })).toBeInTheDocument()
  })

  it('disables the button after adding', async () => {
    const user = userEvent.setup()
    render(<PairsWellWith />)
    const addButtons = screen.getAllByRole('button', { name: /\+ add/i })
    await user.click(addButtons[0])
    const addedButton = screen.getByRole('button', { name: /^added$/i })
    expect(addedButton).toBeDisabled()
  })

  it('only changes the clicked item button state', async () => {
    const user = userEvent.setup()
    render(<PairsWellWith />)
    const addButtons = screen.getAllByRole('button', { name: /\+ add/i })
    await user.click(addButtons[0])
    // Remaining 3 buttons should still say + Add
    expect(screen.getAllByRole('button', { name: /\+ add/i })).toHaveLength(3)
  })
})
```

- [ ] **Step 4: Run tests**

```bash
yarn test "app/\(dashboard\)/cart/"
```

Expected: PASS — all 21 tests pass.

- [ ] **Step 5: Commit**

```bash
git add "app/(dashboard)/cart/components/__tests__/"
git commit -m "test: add cart component behavior tests for CartItems, CartOrderSummary, and PairsWellWith"
```

---

## Task 8: Checkout component tests

**Files:**
- Create: `app/(dashboard)/checkout/components/__tests__/CheckoutStepper.test.tsx`
- Create: `app/(dashboard)/checkout/components/__tests__/PaymentMethodSection.test.tsx`
- Create: `app/(dashboard)/checkout/components/__tests__/DeliveryAddressSection.test.tsx`
- Create: `app/(dashboard)/checkout/components/__tests__/CheckoutOrderSummary.test.tsx`

- [ ] **Step 1: Write tests for `CheckoutStepper.tsx`**

Create `app/(dashboard)/checkout/components/__tests__/CheckoutStepper.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import CheckoutStepper from '../CheckoutStepper'

describe('CheckoutStepper', () => {
  it('renders all three step labels', () => {
    render(<CheckoutStepper currentStep={1} />)
    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('Payment')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('renders all three step numbers', () => {
    render(<CheckoutStepper currentStep={1} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('applies active color to step 1 when currentStep is 1', () => {
    render(<CheckoutStepper currentStep={1} />)
    const addressLabel = screen.getByText('Address')
    expect(addressLabel).toHaveClass('text-brand')
  })

  it('does not apply active color to step 2 when currentStep is 1', () => {
    render(<CheckoutStepper currentStep={1} />)
    const paymentLabel = screen.getByText('Payment')
    expect(paymentLabel).toHaveClass('text-neutral')
  })

  it('applies active color to steps 1 and 2 when currentStep is 2', () => {
    render(<CheckoutStepper currentStep={2} />)
    expect(screen.getByText('Address')).toHaveClass('text-brand')
    expect(screen.getByText('Payment')).toHaveClass('text-brand')
  })

  it('applies active color to all steps when currentStep is 3', () => {
    render(<CheckoutStepper currentStep={3} />)
    expect(screen.getByText('Address')).toHaveClass('text-brand')
    expect(screen.getByText('Payment')).toHaveClass('text-brand')
    expect(screen.getByText('Review')).toHaveClass('text-brand')
  })
})
```

- [ ] **Step 2: Write tests for `PaymentMethodSection.tsx`**

Create `app/(dashboard)/checkout/components/__tests__/PaymentMethodSection.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import PaymentMethodSection from '../PaymentMethodSection'

describe('PaymentMethodSection', () => {
  it('renders the section heading', () => {
    render(<PaymentMethodSection />)
    expect(screen.getByText('Payment Method')).toBeInTheDocument()
  })

  it('renders all payment methods', () => {
    render(<PaymentMethodSection />)
    expect(screen.getByText('Credit Card')).toBeInTheDocument()
    expect(screen.getByText('Apple Pay')).toBeInTheDocument()
    expect(screen.getByText('PayPal')).toBeInTheDocument()
  })

  it('selects Credit Card by default', () => {
    render(<PaymentMethodSection />)
    const creditCardOption = screen.getByText('Credit Card').closest('[class*="border"]')
    expect(creditCardOption).toHaveClass('border-brand')
  })

  it('changes selection when Apple Pay is clicked', async () => {
    const user = userEvent.setup()
    render(<PaymentMethodSection />)
    const applePayRow = screen.getByText('Apple Pay').closest('[class*="cursor-pointer"]')!
    await user.click(applePayRow)
    expect(applePayRow).toHaveClass('border-brand')
  })

  it('deselects previous method when new one is selected', async () => {
    const user = userEvent.setup()
    render(<PaymentMethodSection />)
    const paypalRow = screen.getByText('PayPal').closest('[class*="cursor-pointer"]')!
    await user.click(paypalRow)
    const creditCardRow = screen.getByText('Credit Card').closest('[class*="cursor-pointer"]')!
    expect(creditCardRow).not.toHaveClass('border-brand')
  })
})
```

- [ ] **Step 3: Write tests for `DeliveryAddressSection.tsx`**

Create `app/(dashboard)/checkout/components/__tests__/DeliveryAddressSection.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import DeliveryAddressSection from '../DeliveryAddressSection'

describe('DeliveryAddressSection', () => {
  it('renders the section heading', () => {
    render(<DeliveryAddressSection />)
    expect(screen.getByText('Delivery Address')).toBeInTheDocument()
  })

  it('renders Home and Office address options', () => {
    render(<DeliveryAddressSection />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Office')).toBeInTheDocument()
  })

  it('selects Home address by default', () => {
    render(<DeliveryAddressSection />)
    const homeRow = screen.getByText('Home').closest('[class*="cursor-pointer"]')!
    expect(homeRow).toHaveClass('border-brand')
  })

  it('switches to Office when clicked', async () => {
    const user = userEvent.setup()
    render(<DeliveryAddressSection />)
    const officeRow = screen.getByText('Office').closest('[class*="cursor-pointer"]')!
    await user.click(officeRow)
    expect(officeRow).toHaveClass('border-brand')
  })
})
```

- [ ] **Step 4: Write tests for `CheckoutOrderSummary.tsx`**

Create `app/(dashboard)/checkout/components/__tests__/CheckoutOrderSummary.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import CheckoutOrderSummary from '../CheckoutOrderSummary'

describe('CheckoutOrderSummary', () => {
  it('renders Your Order heading', () => {
    render(<CheckoutOrderSummary />)
    expect(screen.getByText('Your Order')).toBeInTheDocument()
  })

  it('renders order item names', () => {
    render(<CheckoutOrderSummary />)
    expect(screen.getByText('Truffle Umami Burger')).toBeInTheDocument()
    expect(screen.getByText('Superfood Kale Salad')).toBeInTheDocument()
  })

  it('renders the total amount', () => {
    render(<CheckoutOrderSummary />)
    // 41.50 + 2.49 = 43.99
    expect(screen.getByText('$43.99')).toBeInTheDocument()
  })

  it('renders the Place Order button', () => {
    render(<CheckoutOrderSummary />)
    expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument()
  })

  it('renders FREE for delivery fee', () => {
    render(<CheckoutOrderSummary />)
    expect(screen.getByText('FREE')).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run tests**

```bash
yarn test "app/\(dashboard\)/checkout/"
```

Expected: PASS — all 22 tests pass.

- [ ] **Step 6: Commit**

```bash
git add "app/(dashboard)/checkout/components/__tests__/"
git commit -m "test: add checkout component tests with behavior coverage for stepper, payment, and address"
```

---

## Task 9: Orders component tests

**Files:**
- Create: `app/(dashboard)/orders/components/__tests__/AccountSidebar.test.tsx`
- Create: `app/(dashboard)/orders/components/__tests__/OrdersEmptyState.test.tsx`
- Create: `app/(dashboard)/orders/[id]/components/__tests__/OrderProgressStepper.test.tsx`
- Create: `app/(dashboard)/orders/[id]/components/__tests__/DeliveryPanel.test.tsx`
- Create: `app/(dashboard)/orders/[id]/components/__tests__/TrackingMap.test.tsx`

- [ ] **Step 1: Write tests for `AccountSidebar.tsx`**

Create `app/(dashboard)/orders/components/__tests__/AccountSidebar.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import AccountSidebar, { type NavPage } from '../AccountSidebar'

describe('AccountSidebar', () => {
  it('renders all navigation items', () => {
    render(<AccountSidebar activePage="home" />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Past Orders')).toBeInTheDocument()
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Wallet')).toBeInTheDocument()
    expect(screen.getByText('Support')).toBeInTheDocument()
  })

  it('applies active styling to the matching nav item', () => {
    render(<AccountSidebar activePage="orders" />)
    const ordersItem = screen.getByText('Past Orders').closest('[class*="cursor-pointer"]')!
    expect(ordersItem).toHaveClass('bg-brand')
  })

  it('does not apply active styling to non-matching items', () => {
    render(<AccountSidebar activePage="orders" />)
    const homeItem = screen.getByText('Home').closest('[class*="cursor-pointer"]')!
    expect(homeItem).not.toHaveClass('bg-brand')
  })

  it('renders Order Now button', () => {
    render(<AccountSidebar activePage="home" />)
    expect(screen.getByRole('link', { name: /order now/i })).toBeInTheDocument()
  })

  const pages: NavPage[] = ['home', 'orders', 'favorites', 'wallet', 'support']
  pages.forEach((page) => {
    it(`highlights the correct item for activePage="${page}"`, () => {
      render(<AccountSidebar activePage={page} />)
      const labels: Record<NavPage, string> = {
        home: 'Home',
        orders: 'Past Orders',
        favorites: 'Favorites',
        wallet: 'Wallet',
        support: 'Support',
      }
      const activeItem = screen.getByText(labels[page]).closest('[class*="cursor-pointer"]')!
      expect(activeItem).toHaveClass('bg-brand')
    })
  })
})
```

- [ ] **Step 2: Write tests for `OrdersEmptyState.tsx`**

Create `app/(dashboard)/orders/components/__tests__/OrdersEmptyState.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import OrdersEmptyState from '../OrdersEmptyState'

describe('OrdersEmptyState', () => {
  it('renders the heading', () => {
    render(<OrdersEmptyState />)
    expect(screen.getByText('No orders yet')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<OrdersEmptyState />)
    expect(screen.getByText(/Your kitchen table is waiting/i)).toBeInTheDocument()
  })

  it('renders Browse Restaurants link', () => {
    render(<OrdersEmptyState />)
    expect(screen.getByRole('link', { name: /browse restaurants/i })).toBeInTheDocument()
  })

  it('renders category chips', () => {
    render(<OrdersEmptyState />)
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.getByText('Burgers')).toBeInTheDocument()
    expect(screen.getByText('Desserts')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Write tests for `OrderProgressStepper.tsx`**

Create `app/(dashboard)/orders/[id]/components/__tests__/OrderProgressStepper.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import OrderProgressStepper from '../OrderProgressStepper'

describe('OrderProgressStepper', () => {
  it('renders the order ID in the heading', () => {
    render(<OrderProgressStepper orderId="ORD-12345" />)
    expect(screen.getByText(/ORD-12345/)).toBeInTheDocument()
  })

  it('renders all step labels', () => {
    render(<OrderProgressStepper orderId="ORD-001" />)
    expect(screen.getByText('Order Received')).toBeInTheDocument()
    expect(screen.getByText('Preparing')).toBeInTheDocument()
    expect(screen.getByText('Out for Delivery')).toBeInTheDocument()
    expect(screen.getByText('Arrived')).toBeInTheDocument()
  })

  it('renders Live Tracking label', () => {
    render(<OrderProgressStepper orderId="ORD-001" />)
    expect(screen.getByText('Live Tracking')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Write tests for `DeliveryPanel.tsx`**

Create `app/(dashboard)/orders/[id]/components/__tests__/DeliveryPanel.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import DeliveryPanel from '../DeliveryPanel'

describe('DeliveryPanel', () => {
  it('renders estimated delivery time', () => {
    render(<DeliveryPanel />)
    expect(screen.getByText('12–18 mins')).toBeInTheDocument()
  })

  it('renders rider name', () => {
    render(<DeliveryPanel />)
    expect(screen.getByText('Marco Rossi')).toBeInTheDocument()
  })

  it('renders Live Chat button', () => {
    render(<DeliveryPanel />)
    expect(screen.getByRole('button', { name: /live chat/i })).toBeInTheDocument()
  })

  it('renders order items', () => {
    render(<DeliveryPanel />)
    expect(screen.getByText('1x Truffle Burger Deluxe')).toBeInTheDocument()
    expect(screen.getByText('1x Parmesan Fries')).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Write tests for `TrackingMap.tsx`**

Create `app/(dashboard)/orders/[id]/components/__tests__/TrackingMap.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import TrackingMap from '../TrackingMap'

describe('TrackingMap', () => {
  it('renders the map image', () => {
    render(<TrackingMap />)
    expect(screen.getByRole('img', { name: /live delivery map/i })).toBeInTheDocument()
  })

  it('renders the rider info bubble', () => {
    render(<TrackingMap />)
    expect(screen.getByText('Marco')).toBeInTheDocument()
    expect(screen.getByText(/6 min away/i)).toBeInTheDocument()
  })

  it('renders zoom controls', () => {
    render(<TrackingMap />)
    expect(screen.getByText('+')).toBeInTheDocument()
    expect(screen.getByText('−')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run tests**

```bash
yarn test "app/\(dashboard\)/orders/"
```

Expected: PASS — all 19 tests pass.

- [ ] **Step 7: Commit**

```bash
git add "app/(dashboard)/orders/"
git commit -m "test: add orders component tests with AccountSidebar behavior and order tracking smoke tests"
```

---

## Task 10: Profile component tests

**Files:**
- Create: `app/(dashboard)/profile/components/__tests__/SettingsSidebar.test.tsx`
- Create: `app/(dashboard)/profile/components/__tests__/PersonalInfo.test.tsx`
- Create: `app/(dashboard)/profile/components/__tests__/AccountPreferences.test.tsx`
- Create: `app/(dashboard)/profile/components/__tests__/ProfilePicture.test.tsx`
- Create: `app/(dashboard)/profile/components/__tests__/DangerZone.test.tsx`

- [ ] **Step 1: Write tests for `SettingsSidebar.tsx`**

Create `app/(dashboard)/profile/components/__tests__/SettingsSidebar.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import SettingsSidebar, { type SettingsPage } from '../SettingsSidebar'

describe('SettingsSidebar', () => {
  it('renders all navigation items', () => {
    render(<SettingsSidebar activePage="profile" />)
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Addresses')).toBeInTheDocument()
    expect(screen.getByText('Payments')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('applies active styling to the matching page', () => {
    render(<SettingsSidebar activePage="profile" />)
    const profileItem = screen.getByText('Profile').closest('[class*="cursor-pointer"]')!
    expect(profileItem).toHaveClass('bg-brand')
  })

  it('does not apply active styling to non-matching items', () => {
    render(<SettingsSidebar activePage="profile" />)
    const securityItem = screen.getByText('Security').closest('[class*="cursor-pointer"]')!
    expect(securityItem).not.toHaveClass('bg-brand')
  })

  const pages: SettingsPage[] = ['profile', 'security', 'addresses', 'payments', 'notifications']
  pages.forEach((page) => {
    it(`highlights the correct item for activePage="${page}"`, () => {
      render(<SettingsSidebar activePage={page} />)
      const labels: Record<SettingsPage, string> = {
        profile: 'Profile',
        security: 'Security',
        addresses: 'Addresses',
        payments: 'Payments',
        notifications: 'Notifications',
      }
      const activeItem = screen.getByText(labels[page]).closest('[class*="cursor-pointer"]')!
      expect(activeItem).toHaveClass('bg-brand')
    })
  })
})
```

- [ ] **Step 2: Write tests for `PersonalInfo.tsx`**

Create `app/(dashboard)/profile/components/__tests__/PersonalInfo.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import PersonalInfo from '../PersonalInfo'

describe('PersonalInfo', () => {
  it('renders user name', () => {
    render(<PersonalInfo />)
    expect(screen.getByText('Alex Chen')).toBeInTheDocument()
  })

  it('renders user email', () => {
    render(<PersonalInfo />)
    expect(screen.getByText('alex.chen@design.com')).toBeInTheDocument()
  })

  it('renders user phone', () => {
    render(<PersonalInfo />)
    expect(screen.getByText('+1 (555) 000-1234')).toBeInTheDocument()
  })

  it('shows input when edit icon for name is clicked', async () => {
    const user = userEvent.setup()
    render(<PersonalInfo />)
    // Find the edit icon next to "Alex Chen" and click its container
    const alexChenText = screen.getByText('Alex Chen')
    const editContainer = alexChenText.parentElement!.querySelector('[class*="cursor-pointer"]') as HTMLElement
    await user.click(editContainer)
    expect(screen.getByDisplayValue('Alex Chen')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Write tests for `AccountPreferences.tsx`**

Create `app/(dashboard)/profile/components/__tests__/AccountPreferences.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import AccountPreferences from '../AccountPreferences'

describe('AccountPreferences', () => {
  it('renders the section heading', () => {
    render(<AccountPreferences />)
    expect(screen.getByText('Account Preferences')).toBeInTheDocument()
  })

  it('renders all preference labels', () => {
    render(<AccountPreferences />)
    expect(screen.getByText('Marketing Emails')).toBeInTheDocument()
    expect(screen.getByText('Order Tracking SMS')).toBeInTheDocument()
    expect(screen.getByText('Dark Mode')).toBeInTheDocument()
  })

  it('renders Marketing Emails toggled on by default', () => {
    render(<AccountPreferences />)
    // The switch for Marketing Emails is checked (defaultValue: true)
    const switches = screen.getAllByRole('switch')
    expect(switches[0]).toBeChecked()
  })

  it('renders Dark Mode toggled off by default', () => {
    render(<AccountPreferences />)
    const switches = screen.getAllByRole('switch')
    expect(switches[2]).not.toBeChecked()
  })
})
```

- [ ] **Step 4: Write tests for `ProfilePicture.tsx`**

Create `app/(dashboard)/profile/components/__tests__/ProfilePicture.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import ProfilePicture from '../ProfilePicture'

describe('ProfilePicture', () => {
  it('renders Profile Picture label', () => {
    render(<ProfilePicture />)
    expect(screen.getByText('Profile Picture')).toBeInTheDocument()
  })

  it('renders Upload New Photo button', () => {
    render(<ProfilePicture />)
    expect(screen.getByRole('button', { name: /upload new photo/i })).toBeInTheDocument()
  })

  it('renders Remove text', () => {
    render(<ProfilePicture />)
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })

  it('renders avatar image', () => {
    render(<ProfilePicture />)
    expect(screen.getByRole('img', { name: /alex chen/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Write tests for `DangerZone.tsx`**

Create `app/(dashboard)/profile/components/__tests__/DangerZone.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import DangerZone from '../DangerZone'

describe('DangerZone', () => {
  it('renders Deactivate Account heading', () => {
    render(<DangerZone />)
    expect(screen.getByText('Deactivate Account')).toBeInTheDocument()
  })

  it('renders warning description', () => {
    render(<DangerZone />)
    expect(screen.getByText(/once you delete your account/i)).toBeInTheDocument()
  })

  it('renders Delete Account button', () => {
    render(<DangerZone />)
    expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run tests**

```bash
yarn test "app/\(dashboard\)/profile/"
```

Expected: PASS — all 21 tests pass.

- [ ] **Step 7: Commit**

```bash
git add "app/(dashboard)/profile/"
git commit -m "test: add profile component tests with SettingsSidebar and PersonalInfo behavior coverage"
```

---

## Task 11: Auth form tests

**Files:**
- Create: `app/auth/login/components/__tests__/LoginForm.test.tsx`
- Create: `app/auth/sign-up/components/__tests__/SignUpForm.test.tsx`

- [ ] **Step 1: Write tests for `LoginForm.tsx`**

Create `app/auth/login/components/__tests__/LoginForm.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import LoginForm from '../LoginForm'

describe('LoginForm', () => {
  it('renders the Sign In button', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renders Forgot Password link', () => {
    render(<LoginForm />)
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
  })

  it('renders sign up link', () => {
    render(<LoginForm />)
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })

  it('shows email validation error when invalid email is submitted', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText('name@example.com')
    await user.type(emailInput, 'notanemail')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
  })

  it('shows email error on blur when email is invalid', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText('name@example.com')
    await user.type(emailInput, 'bad-email')
    await user.tab()
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
  })

  it('clears email error when valid email is entered', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText('name@example.com')
    await user.type(emailInput, 'bad-email')
    await user.tab()
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    await user.clear(emailInput)
    await user.type(emailInput, 'good@email.com')
    await user.tab()
    expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument()
  })

  it('renders Google and Apple sign-in buttons', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /apple/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Write tests for `SignUpForm.tsx`**

Create `app/auth/sign-up/components/__tests__/SignUpForm.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import SignUpForm from '../SignUpForm'

describe('SignUpForm', () => {
  it('renders the Create Account button', () => {
    render(<SignUpForm />)
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    render(<SignUpForm />)
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('+1 (555) 000-0000')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('shows email validation error on invalid email submit', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)
    const emailInput = screen.getByPlaceholderText('name@company.com')
    await user.type(emailInput, 'notanemail')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
  })

  it('shows terms agreement error when not checked on submit', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)
    const emailInput = screen.getByPlaceholderText('name@company.com')
    await user.type(emailInput, 'valid@email.com')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByText(/you must agree to the terms of service/i)).toBeInTheDocument()
  })

  it('clears terms error when checkbox is checked', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)
    await user.click(screen.getByRole('button', { name: /create account/i }))
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    expect(screen.queryByText(/you must agree to the terms of service/i)).not.toBeInTheDocument()
  })

  it('renders log in link', () => {
    render(<SignUpForm />)
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
  })

  it('shows phone error on invalid phone number', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)
    const phoneInput = screen.getByPlaceholderText('+1 (555) 000-0000')
    await user.type(phoneInput, '123')
    await user.tab()
    expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tests**

```bash
yarn test app/auth/
```

Expected: PASS — all 15 tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/auth/
git commit -m "test: add auth form behavior tests for LoginForm and SignUpForm validation"
```

---

## Task 12: Stores component tests

**Files:**
- Create: `app/(dashboard)/stores/components/__tests__/FilterTabs.test.tsx`
- Create: `app/(dashboard)/stores/components/__tests__/FilterSidebar.test.tsx`
- Create: `app/(dashboard)/stores/components/__tests__/FeaturedRestaurantCard.test.tsx`
- Create: `app/(dashboard)/stores/[id]/components/__tests__/MenuTabs.test.tsx`
- Create: `app/(dashboard)/stores/[id]/components/__tests__/OrderSidebar.test.tsx`
- Create: `app/(dashboard)/stores/[id]/components/__tests__/AppetizersGrid.test.tsx`
- Create: `app/(dashboard)/stores/[id]/components/__tests__/MainsList.test.tsx`
- Create: `app/(dashboard)/stores/[id]/components/__tests__/GuestExperiences.test.tsx`

- [ ] **Step 1: Write tests for `FilterTabs.tsx`**

Create `app/(dashboard)/stores/components/__tests__/FilterTabs.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import FilterTabs from '../FilterTabs'

describe('FilterTabs', () => {
  it('renders all filter tabs', () => {
    render(<FilterTabs />)
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fast delivery/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /top rated/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /under \$10/i })).toBeInTheDocument()
  })

  it('renders All as the default active tab (solid variant)', () => {
    render(<FilterTabs />)
    const allButton = screen.getByRole('button', { name: /^all$/i })
    // Solid variant adds data-variant attribute in Radix
    expect(allButton).toBeInTheDocument()
  })

  it('sets clicked tab as active (solid variant) and deactivates the previous', async () => {
    const user = userEvent.setup()
    render(<FilterTabs />)
    const allButton = screen.getByRole('button', { name: /^all$/i })
    const fastDelivery = screen.getByRole('button', { name: /fast delivery/i })
    await user.click(fastDelivery)
    // Radix Button exposes variant via data-variant attribute
    expect(fastDelivery).toHaveAttribute('data-variant', 'solid')
    expect(allButton).toHaveAttribute('data-variant', 'outline')
  })
})
```

- [ ] **Step 2: Write tests for `FilterSidebar.tsx`**

Create `app/(dashboard)/stores/components/__tests__/FilterSidebar.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import FilterSidebar from '../FilterSidebar'

describe('FilterSidebar', () => {
  it('renders category section heading', () => {
    render(<FilterSidebar />)
    expect(screen.getByText('Categories')).toBeInTheDocument()
  })

  it('renders all cuisine categories', () => {
    render(<FilterSidebar />)
    expect(screen.getByText('All Cuisines')).toBeInTheDocument()
    expect(screen.getByText('Burgers')).toBeInTheDocument()
    expect(screen.getByText('Sushi')).toBeInTheDocument()
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.getByText('Desserts')).toBeInTheDocument()
  })

  it('renders price range options', () => {
    render(<FilterSidebar />)
    expect(screen.getByText('Price Range')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^\$$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^\$\$$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^\$\$\$$/i })).toBeInTheDocument()
  })

  it('renders rating filters', () => {
    render(<FilterSidebar />)
    expect(screen.getByText(/4.5\+ Very Good/i)).toBeInTheDocument()
    expect(screen.getByText(/4.0\+ Good/i)).toBeInTheDocument()
  })

  it('changes active category when Burgers is clicked', async () => {
    const user = userEvent.setup()
    render(<FilterSidebar />)
    const burgers = screen.getByText('Burgers').closest('[class*="cursor-pointer"]')!
    await user.click(burgers)
    expect(burgers).toHaveClass('bg-brand')
  })
})
```

- [ ] **Step 3: Write tests for `FeaturedRestaurantCard.tsx`**

Create `app/(dashboard)/stores/components/__tests__/FeaturedRestaurantCard.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import FeaturedRestaurantCard from '../FeaturedRestaurantCard'

const defaultProps = {
  name: 'The Grill Room',
  description: 'Premium steaks and fine wines.',
  rating: 4.9,
  deliveryTime: '30–40 min',
  image: 'https://example.com/grill.jpg',
}

describe('FeaturedRestaurantCard', () => {
  it('renders restaurant name', () => {
    render(<FeaturedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('The Grill Room')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<FeaturedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('Premium steaks and fine wines.')).toBeInTheDocument()
  })

  it('renders rating', () => {
    render(<FeaturedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('4.9')).toBeInTheDocument()
  })

  it('renders delivery time', () => {
    render(<FeaturedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('30–40 min')).toBeInTheDocument()
  })

  it('renders badge when provided', () => {
    render(<FeaturedRestaurantCard {...defaultProps} badge="FEATURED" />)
    expect(screen.getByText('FEATURED')).toBeInTheDocument()
  })

  it('does not render badge when not provided', () => {
    render(<FeaturedRestaurantCard {...defaultProps} />)
    expect(screen.queryByText('FEATURED')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Write tests for `MenuTabs.tsx`**

Create `app/(dashboard)/stores/[id]/components/__tests__/MenuTabs.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import MenuTabs from '../MenuTabs'

describe('MenuTabs', () => {
  it('renders all menu tab labels', () => {
    render(<MenuTabs />)
    expect(screen.getByRole('button', { name: /appetizers/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mains/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /drinks/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /desserts/i })).toBeInTheDocument()
  })

  it('clicking a tab does not throw', async () => {
    const user = userEvent.setup()
    render(<MenuTabs />)
    const mainsTab = screen.getByRole('button', { name: /mains/i })
    await user.click(mainsTab)
    expect(mainsTab).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Write smoke tests for remaining stores components**

Create `app/(dashboard)/stores/[id]/components/__tests__/OrderSidebar.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import OrderSidebar from '../OrderSidebar'

describe('OrderSidebar', () => {
  it('renders Your Order heading', () => {
    render(<OrderSidebar />)
    expect(screen.getByText('Your Order')).toBeInTheDocument()
  })

  it('renders order items', () => {
    render(<OrderSidebar />)
    expect(screen.getByText('1x Wagyu Burger')).toBeInTheDocument()
    expect(screen.getByText('1x Truffle Arancini')).toBeInTheDocument()
  })

  it('renders Checkout Now button', () => {
    render(<OrderSidebar />)
    expect(screen.getByRole('button', { name: /checkout now/i })).toBeInTheDocument()
  })
})
```

Create `app/(dashboard)/stores/[id]/components/__tests__/AppetizersGrid.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import AppetizersGrid from '../AppetizersGrid'

describe('AppetizersGrid', () => {
  it('renders Appetizers heading', () => {
    render(<AppetizersGrid />)
    expect(screen.getByText('Appetizers')).toBeInTheDocument()
  })

  it('renders appetizer items', () => {
    render(<AppetizersGrid />)
    expect(screen.getByText('Truffle Arancini')).toBeInTheDocument()
    expect(screen.getByText('Seared Scallops')).toBeInTheDocument()
  })

  it('renders Add to Cart buttons', () => {
    render(<AppetizersGrid />)
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i })
    expect(addButtons.length).toBeGreaterThan(0)
  })
})
```

Create `app/(dashboard)/stores/[id]/components/__tests__/MainsList.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import MainsList from '../MainsList'

describe('MainsList', () => {
  it('renders Mains heading', () => {
    render(<MainsList />)
    expect(screen.getByText('Mains')).toBeInTheDocument()
  })

  it('renders main dish items', () => {
    render(<MainsList />)
    expect(screen.getByText('Signature Wagyu Burger')).toBeInTheDocument()
    expect(screen.getByText('Miso Glazed Salmon')).toBeInTheDocument()
  })
})
```

Create `app/(dashboard)/stores/[id]/components/__tests__/GuestExperiences.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'
import GuestExperiences from '../GuestExperiences'

describe('GuestExperiences', () => {
  it('renders Guest Experiences heading', () => {
    render(<GuestExperiences />)
    expect(screen.getByText('Guest Experiences')).toBeInTheDocument()
  })

  it('renders reviewer names', () => {
    render(<GuestExperiences />)
    expect(screen.getByText('Sarah J.')).toBeInTheDocument()
    expect(screen.getByText('Michael Chen')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run tests**

```bash
yarn test "app/\(dashboard\)/stores/"
```

Expected: PASS — all 27 tests pass.

- [ ] **Step 7: Commit**

```bash
git add "app/(dashboard)/stores/"
git commit -m "test: add stores component tests with FilterTabs, FilterSidebar, and MenuTabs behavior coverage"
```

---

## Task 13: Page-level smoke tests

**Files:**
- Create: `app/__tests__/page.test.tsx`
- Create: `app/(dashboard)/cart/__tests__/page.test.tsx`
- Create: `app/(dashboard)/checkout/__tests__/page.test.tsx`
- Create: `app/(dashboard)/orders/__tests__/page.test.tsx`
- Create: `app/(dashboard)/profile/__tests__/page.test.tsx`
- Create: `app/(dashboard)/stores/__tests__/page.test.tsx`

- [ ] **Step 1: Write smoke test for root landing page**

Create `app/__tests__/page.test.tsx`:
```tsx
import React from 'react'
import { render } from '@/lib/test-utils'

jest.mock('../components/layout/Navbar', () => ({ default: () => <div data-testid="navbar" /> }))
jest.mock('../components/sections/HeroSection', () => ({ default: () => <div data-testid="hero" /> }))
jest.mock('../components/sections/FeaturesSection', () => ({ default: () => <div data-testid="features" /> }))
jest.mock('../components/sections/PopularNearbySection', () => ({ default: () => <div data-testid="popular" /> }))
jest.mock('../components/sections/SignatureBitesSection', () => ({ default: () => <div data-testid="signature" /> }))
jest.mock('../components/sections/AppDownloadBanner', () => ({ default: () => <div data-testid="banner" /> }))
jest.mock('../components/layout/Footer', () => ({ default: () => <div data-testid="footer" /> }))

import Home from '../page'
import { screen } from '@testing-library/react'

describe('Landing Page', () => {
  it('renders without crashing', () => {
    render(<Home />)
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Write smoke test for Cart page**

Create `app/(dashboard)/cart/__tests__/page.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'

jest.mock('../components/CartItems', () => ({ default: () => <div data-testid="cart-items" /> }))
jest.mock('../components/PairsWellWith', () => ({ default: () => <div data-testid="pairs-well-with" /> }))
jest.mock('../components/CartOrderSummary', () => ({ default: () => <div data-testid="cart-order-summary" /> }))
jest.mock('@/app/components/layout/Footer', () => ({ default: () => <div data-testid="footer" /> }))

import CartPage from '../page'

describe('CartPage', () => {
  it('renders all child sections', () => {
    render(<CartPage />)
    expect(screen.getByTestId('cart-items')).toBeInTheDocument()
    expect(screen.getByTestId('pairs-well-with')).toBeInTheDocument()
    expect(screen.getByTestId('cart-order-summary')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Write smoke test for Checkout page**

Create `app/(dashboard)/checkout/__tests__/page.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'

jest.mock('../components/CheckoutStepper', () => ({ default: () => <div data-testid="stepper" /> }))
jest.mock('../components/DeliveryAddressSection', () => ({ default: () => <div data-testid="delivery-address" /> }))
jest.mock('../components/PaymentMethodSection', () => ({ default: () => <div data-testid="payment-method" /> }))
jest.mock('../components/CheckoutOrderSummary', () => ({ default: () => <div data-testid="order-summary" /> }))
jest.mock('@/app/components/layout/Footer', () => ({ default: () => <div data-testid="footer" /> }))

import CheckoutPage from '../page'

describe('CheckoutPage', () => {
  it('renders all checkout sections', () => {
    render(<CheckoutPage />)
    expect(screen.getByTestId('stepper')).toBeInTheDocument()
    expect(screen.getByTestId('delivery-address')).toBeInTheDocument()
    expect(screen.getByTestId('payment-method')).toBeInTheDocument()
    expect(screen.getByTestId('order-summary')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Write smoke test for Orders page**

Create `app/(dashboard)/orders/__tests__/page.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'

jest.mock('../components/AccountSidebar', () => ({ default: () => <div data-testid="account-sidebar" /> }))
jest.mock('../components/OrdersEmptyState', () => ({ default: () => <div data-testid="empty-state" /> }))
jest.mock('@/app/components/layout/Footer', () => ({ default: () => <div data-testid="footer" /> }))

import OrdersPage from '../page'

describe('OrdersPage', () => {
  it('renders sidebar and empty state', () => {
    render(<OrdersPage />)
    expect(screen.getByTestId('account-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Write smoke test for Profile page**

Create `app/(dashboard)/profile/__tests__/page.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'

jest.mock('../components/SettingsSidebar', () => ({ default: () => <div data-testid="settings-sidebar" /> }))
jest.mock('../components/ProfilePicture', () => ({ default: () => <div data-testid="profile-picture" /> }))
jest.mock('../components/PersonalInfo', () => ({ default: () => <div data-testid="personal-info" /> }))
jest.mock('../components/AccountPreferences', () => ({ default: () => <div data-testid="account-preferences" /> }))
jest.mock('../components/DangerZone', () => ({ default: () => <div data-testid="danger-zone" /> }))
jest.mock('@/app/components/layout/Footer', () => ({ default: () => <div data-testid="footer" /> }))

import SettingsPage from '../page'

describe('SettingsPage', () => {
  it('renders Profile Settings heading', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Profile Settings')).toBeInTheDocument()
  })

  it('renders all page sections', () => {
    render(<SettingsPage />)
    expect(screen.getByTestId('settings-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('profile-picture')).toBeInTheDocument()
    expect(screen.getByTestId('personal-info')).toBeInTheDocument()
    expect(screen.getByTestId('account-preferences')).toBeInTheDocument()
    expect(screen.getByTestId('danger-zone')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Write smoke test for Stores page**

Create `app/(dashboard)/stores/__tests__/page.test.tsx`:
```tsx
import React from 'react'
import { render, screen } from '@/lib/test-utils'

jest.mock('../components/FilterSidebar', () => ({ default: () => <div data-testid="filter-sidebar" /> }))
jest.mock('../components/FilterTabs', () => ({ default: () => <div data-testid="filter-tabs" /> }))
jest.mock('../components/FeaturedRestaurantCard', () => ({ default: () => <div data-testid="featured-card" /> }))
jest.mock('@/app/components/layout/Footer', () => ({ default: () => <div data-testid="footer" /> }))

import StoresPage from '../page'

describe('StoresPage', () => {
  it('renders without crashing', () => {
    render(<StoresPage />)
    expect(screen.getByTestId('filter-sidebar')).toBeInTheDocument()
  })
})
```

- [ ] **Step 7: Run all page tests**

```bash
yarn test "app/__tests__" "app/\(dashboard\)/cart/__tests__/page" "app/\(dashboard\)/checkout/__tests__/page" "app/\(dashboard\)/orders/__tests__/page" "app/\(dashboard\)/profile/__tests__/page" "app/\(dashboard\)/stores/__tests__/page"
```

Expected: PASS — all 9 tests pass.

- [ ] **Step 8: Run the full test suite**

```bash
yarn test
```

Expected: All tests pass. Coverage report is generated.

- [ ] **Step 9: Commit**

```bash
git add "app/__tests__/" "app/(dashboard)/cart/__tests__/page.test.tsx" "app/(dashboard)/checkout/__tests__/page.test.tsx" "app/(dashboard)/orders/__tests__/page.test.tsx" "app/(dashboard)/profile/__tests__/page.test.tsx" "app/(dashboard)/stores/__tests__/page.test.tsx"
git commit -m "test: add page-level smoke tests for all dashboard and landing pages"
```
