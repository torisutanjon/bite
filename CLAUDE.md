@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

`yarn` is our package manager. DO NOT USE ANY OTHER PACKAGE MANAGERS. Use the following commands for development, quality checks, and testing:

```bash
# Development
yarn dev                # Start dev server with Turbopack
yarn build              # Production build (use NODE_ENV=production)
yarn start              # Start production server

# Quality Checks
yarn type-check         # TypeScript type checking
yarn lint               # ESLint with Prettier
yarn prettier:fix       # Auto-fix formatting
yarn format:check       # Check formatting only

# Testing (TDD workflow required)
yarn test               # Run all tests
yarn test:watch         # Watch mode for development
yarn test:coverage      # Generate coverage report
```

## Architecture Overview

### Next.js 15 App Router

- **App directory only** - no pages/ directory
- **Server Components by default** - only use 'use client' when necessary (state, events, browser APIs, or dependencies requiring it)
- **No /api routes** - use Supabase client directly (exceptions: EHR integration, payments, webhooks, email/SMS)
- **Server Actions** - located in `/app/actions/` for server-side operations

### Supabase Integration

**Four distinct clients** (use correct one for context):

```tsx
// 1. Server Components & Route Handlers
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// 2. Client Components
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// 3. Proxy (session refresh) — Next 16 renamed the middleware convention to proxy
import { updateSession } from "@/lib/supabase/proxy";

// 4. Admin operations (service role)
import { createClient } from "@/lib/supabase/service";
const supabase = createClient();
```

**Critical:**

- **NEVER** use `@supabase/auth-helpers-nextjs` (forbidden)
- All database types in `lib/types/supabase.ts`
- RLS policies must be implemented for all tables

### Data Fetching Patterns

```tsx
// Server Components: Direct queries
async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("table").select();
  return <Component data={data} />;
}

// Client Components: React Query hooks
("use client");
import { useFetchCategories } from "@/lib/hooks/queries";
function Component() {
  const { data } = useFetchCategories();
  return <div>{data}</div>;
}
```

### Component Standards (Radix UI)

**Always use Radix UI components** (never native HTML):

```tsx
import { Box, Heading, Text, Button, TextField } from '@radix-ui/themes'

// ✅ Correct
<Box>
  <Heading>Title</Heading>
  <Text>Description</Text>
  <TextField.Root placeholder="Input" />
  <Button>Submit</Button>
</Box>

// ❌ Wrong - never use native HTML elements
<div>
  <h1>Title</h1>
  <p>Description</p>
  <input placeholder="Input" />
  <button>Submit</button>
</div>
```

**Component rules:**

- `<Box>` instead of `<div>`
- `<Heading>` instead of `<h1>`-`<h6>`
- `<Text>` instead of `<p>`
- `<Button>` instead of `<button>`
- `TextField.Root` for all text inputs
- `Dialog` from `@radix-ui/themes`
- Minimize use of `<Card>` (prefer `<Box>`)

### State Management

- **React Context** - global state (auth, cart, filters, dialogs)
- **TanStack Query** - server state and data fetching
- **Provider tree** - composed with `buildProviderTree()` helper in `/lib/utils/provider.ts`

### Required Tech Stack

**Approved packages only:**

- Next.js 15
- TypeScript (strict mode, no `any` types)
- Tailwind CSS
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- Radix UI (`@radix-ui/themes`, `@radix-ui/react-icons`)
- `react-dropzone` (file uploads)
- `@dnd-kit/core` (drag-and-drop reordering)
- `@react-pdf/renderer` (PDF generation)
- `react-hook-form` (forms)
- `react-quill-new` (rich text)
- `resend`, `twilio` (email/SMS)

**Package manager:** yarn only (never npm)

## Test-Driven Development

**TDD is mandatory for every task, no exceptions.** Before writing any implementation code, you MUST write tests first.

**Strict workflow — never deviate:**

1. Write tests FIRST
2. Make them fail
3. Implement feature
4. Iterate until passing

**Coverage thresholds:**

- Statements: 90%
- Branches: 85%
- Functions: 95%
- Lines: 90%

**Test structure:**

- Follow arrange-act-assert pattern
- Test edge cases (empty states, errors, loading)
- Use React Testing Library
- Tests in `__tests__/` folders or co-located

## File Conventions

- **Naming:** lowercase-with-hyphens for files/folders
- **Path alias:** `@/*` maps to project root
- **Barrel exports:** use `index.ts` for component exports
- **Client components:** extract to separate files when using 'use client'

## TypeScript Standards

- Strict mode enabled
- No `any` types (must be documented if absolutely necessary)
- Explicit return types required for all functions
- Null checks handled properly
- Database types synchronized with Supabase schema

## Build Requirements

- Use `NODE_ENV=production yarn build` for production builds
- No TypeScript errors allowed
- No linting errors allowed
- All tests must pass

## Supabase Query Optimization

See `docs/ai/supabase-query-optimization.md` for detailed guide.

- **Select specific columns** — never use `.select('*')`
- **Use joins** — `!inner` for required relations, avoid N+1 queries
- **Pagination** — `.range()` with `{ count: 'exact' }`, structured response with `{ success, data, pagination }`
- **Use `.maybeSingle()`** when row might not exist (`.single()` throws on zero rows)
- **Use `.rpc()`** for complex queries involving stored procedures
- **Index filter columns** — columns in `.eq()`, `.ilike()`, `.overlaps()` need database indexes
- **RLS performance** — wrap `auth.uid()` in `(select auth.uid())` to prevent per-row evaluation

```tsx
// ✅ Correct
const { data } = await supabase
  .from("products")
  .select("id, name, price, product_variants!inner(id, name)")
  .eq("status", "active")
  .range(0, 19);

// ❌ Wrong
const { data } = await supabase.from("products").select("*");
```

## React Hooks

See `docs/ai/react-hooks-conventions.md` for detailed guide.

- **Complete dependency arrays** — include all values used inside hooks
- **`useCallback`** — only when passing functions as props to memoized children
- **`useMemo`** — only for expensive computations (O(n) operations on large lists)
- **Custom hooks** — `lib/hooks/` for domain, `lib/hooks/utils/` for utilities, `lib/query/hooks/` for TanStack Query
- **No conditional hooks** — always call at the top level of the component
- **No data fetching in `useEffect`** — use TanStack Query hooks instead

## Design System

### Color Palette

| Token | CSS Variable | Tailwind Class | Hex | Usage |
|-------|-------------|----------------|-----|-------|
| Primary | `--brand` | `text-brand` / `bg-brand` | `#FF4F18` | CTAs, active states, highlights |
| Secondary | `--secondary` | `text-secondary` / `bg-secondary` | `#1A1A1A` | Headings, inverted UI |
| Tertiary / Surface | `--surface-alt` | `bg-surface-alt` | `#F9F9F9` | Section backgrounds |
| Neutral | `--neutral` | `text-neutral` | `#6B7280` | Muted text, borders |

**Never hardcode hex values.** Always use the CSS variable aliases via Tailwind utilities.

The Radix `<Theme>` uses `accentColor="tomato"` (closest Radix palette to `#FF4F18`). Use `color="tomato"` on Radix components (Button, Badge, etc.) when the brand primary color is needed.

### Typography

| Role | Font | Variable | Usage |
|------|------|----------|-------|
| Headline | Be Vietnam Pro | `font-accent` | Section headings, display text |
| Body | Hanken Grotesk | `font-main` | Paragraphs, labels, UI text |

`font-main` (Hanken Grotesk) is applied globally on `body`. Apply `font-accent` (Be Vietnam Pro) to prominent headings. Heading HTML elements (`h1`–`h6`) automatically inherit `font-accent` via the global CSS rule.

### Buttons

All buttons use **pill / rounded-full** shape per design system:

```tsx
// Primary CTA
<Button color="tomato" className="rounded-full">Find Food</Button>

// Outlined
<Button variant="outline" className="rounded-full">Learn More</Button>

// Inverted (dark background)
<Button variant="solid" className="rounded-full !bg-secondary !text-white">Sign In</Button>
```

### Search Input

Search inputs use a **pill-shaped white container** wrapping a borderless `TextField.Root` + a `rounded-full` Button:

```tsx
<Flex align="center" className="rounded-full bg-white p-1.5 shadow-xl gap-1">
  <TextField.Root variant="soft" className="flex-1 !bg-transparent !shadow-none !ring-0 !border-0" />
  <Button color="tomato" className="rounded-full px-6">Search</Button>
</Flex>
```

---

## Styling & Theming

See `docs/ai/styling-and-theming.md` for detailed guide.

- **CSS variables for theme colors** — defined in `globals.css`, never hardcode hex values
- **Radix UI theme tokens first** — use component props for color/size/variant
- **Tailwind utilities second** — for layout, spacing, custom styling
- **Fonts** — `font-main` and `font-accent` only, never import fonts directly
- **Breakpoints** — use existing `xs` (360px) through `xl` (1880px), don't add new ones
- **No CSS modules, no inline styles** — Tailwind + CSS variables only

## Rollbar Logging

See `docs/ai/rollbar-logging.md` for detailed guide.

- **Server-side** — `import { serverInstance } from '@/lib/rollbar'`
- **Client-side** — `import { clientConfig } from '@/lib/rollbar'` for Rollbar provider
- **NEVER log PHI** — no patient names, DOBs, health conditions, EHR response bodies
- **Severity levels** — `critical` (app crash), `error` (operation failed), `warning` (degraded), `info` (notable events)
- **Always include context** — store ID, action name, non-PHI identifiers
- **React error boundaries** — use for client-side crash reporting with Rollbar

## Webhook & Event Logging

See `docs/ai/webhook-event-logging.md` for detailed guide.

- **Webhook routes in `/app/api/`** — approved exception to the no-API-routes rule
- **Use `ServerWebhookProcessor` pattern** — class-based routing in `lib/webhook/webhook-processor.ts`
- **Always log via `logWebhookEvent()`** — both success and failure states
- **Fire-and-forget** — logging failures must never affect webhook response
- **Required fields** — `storeId`, `source`, `eventType`, `status`, `summary`, `requestPayload`
- **New integrations** — add processor in `lib/webhook/processes/`, route through `ServerWebhookProcessor`

## Server Actions

See `docs/ai/server-actions.md` for detailed guide.

- **Location** — all actions in `/app/actions/`, one file per domain, `'use server'` at file top
- **Return structured responses** — `{ success: boolean, data?: T, error?: string }`
- **Revalidate after mutations** — call `revalidatePath()` or `revalidateTag()`
- **Error handling** — try/catch, log to Rollbar, return sanitized error message
- **Auth check** — verify authentication at the start of every action

## TanStack Query

See `docs/ai/tanstack-query.md` for detailed guide. Also see `lib/query/README.md`.

- **Hook location** — `lib/query/hooks/`, named `useFetch<Entity>` and `useUpdate<Entity>`
- **Query keys** — arrays with entity name and dependencies: `['products', { categoryId, status }]`
- **Invalidate after mutations** — `queryClient.invalidateQueries({ queryKey: ['entity'] })`
- **Use `enabled`** — for queries that depend on other data: `enabled: !!storeId`
- **No direct `fetch()` in client components** — always use TanStack Query

## Error Handling

See `docs/ai/error-handling.md` for detailed guide.

- **Server Components** — let errors bubble to `error.tsx` boundaries
- **Client Components** — use TanStack Query `error`/`isError` states
- **Server Actions** — try/catch → Rollbar → `{ success: false, error: 'message' }`
- **API routes** — try/catch → Rollbar → HTTP status code
- **Never swallow errors** — always log to Rollbar or surface to user
- **Sanitize user-facing errors** — no stack traces, no internal details, no DB column names

## Common Pitfalls to Avoid

❌ Using pages/ directory → use app/ directory
❌ Creating /api routes → use Supabase client directly
❌ Using `@supabase/auth-helpers-nextjs` → use `@/lib/supabase` clients
❌ Using native HTML elements → use Radix UI components
❌ Writing code before tests → TDD required
❌ Using npm → use yarn
❌ Using `any` type → define proper types
❌ Skipping RLS policies → security requirement
❌ Using `.select('*')` → specify columns explicitly
❌ Using `.single()` for optional rows → use `.maybeSingle()`
❌ Data fetching in `useEffect` → use TanStack Query
❌ Hardcoded hex colors → use CSS variables via Tailwind
❌ Logging PHI to Rollbar → use error codes and non-PHI context
❌ Empty catch blocks → log to Rollbar, return error response
❌ Direct `fetch()` in client components → use TanStack Query hooks

---

## Folder Structure

Follows Next.js 15 App Router conventions. Server Components are the default — only add `'use client'` when the component needs state, effects, browser APIs, event handlers that update UI, or TanStack Query hooks. Extract the smallest possible island as Client Component; keep the outer shell as Server Component.

```
app/
  (marketing)/                    ← Route group: public/landing pages (no auth required)
    page.tsx                      ← Landing page (Server Component)
    layout.tsx                    ← Marketing layout
  (dashboard)/                    ← Route group: authenticated user pages
    layout.tsx                    ← Auth-protected layout (includes Navbar)
    stores/
      page.tsx                    ← Restaurant listing (Server Component)
      [id]/
        page.tsx                  ← Restaurant detail (Server Component)
    orders/
      page.tsx                    ← Order history (Server Component)
      [id]/
        page.tsx                  ← Order detail with realtime ('use client')
    offers/
      page.tsx                    ← Offers listing (Server Component)
  auth/                           ← Auth routes (no Navbar, own layout)
    login/
    sign-up/
  actions/                        ← Server Actions — one file per domain, 'use server' at top
    ordering.ts
    restaurant.ts
    payment.ts
  components/
    layout/                       ← Structural layout components
      Navbar.tsx                  ← Server Component (static structure)
      NavbarActions.tsx           ← 'use client' (cart count, mobile menu toggle)
      Footer.tsx                  ← Server Component
    sections/                     ← Full-page section components (one per landing/marketing section)
      HeroSection/
        index.tsx                 ← Server Component wrapper
        SearchBar.tsx             ← 'use client' (controlled input + router.push)
      PopularNearbySection.tsx    ← Server Component
      FeaturesSection.tsx         ← Server Component
      SignatureBitesSection.tsx   ← Server Component
      AppDownloadBanner.tsx       ← Server Component
    ui/                           ← Reusable presentational primitives
      RestaurantCard.tsx          ← Server Component
      FoodCard.tsx                ← Server Component
      StarRating.tsx              ← Server Component
    Form/                         ← Form input components (existing)

lib/
  domains/                        ← DDD bounded contexts (pure business logic, zero framework deps)
    restaurant/
      types.ts
      repository.ts               ← Interface definition (IRestaurantRepository)
      service.ts
    ordering/
      types.ts
      repository.ts
      service.ts
      saga.ts                     ← Choreography saga handlers
    delivery/
    payment/
    user/
    notification/
  infrastructure/                 ← Concrete implementations (Supabase, Kafka)
    supabase/
      repositories/               ← Implements domain repository interfaces
    kafka/
      producer.ts
      consumers/
        ordering/
        delivery/
        payment/
  query/                          ← TanStack Query hooks
    hooks/                        ← useFetch<Entity>, useUpdate<Entity>
      use-fetch-restaurants.ts
      use-fetch-orders.ts
    README.md
  hooks/                          ← Domain-specific custom React hooks
    utils/                        ← Utility hooks
  types/
    supabase.ts                   ← Generated DB types (sync with schema)
    events.ts                     ← Kafka DomainEvent<T> envelope types
  supabase/
    client.ts                     ← Client Component Supabase client
    server.ts                     ← Server Component Supabase client
    service.ts                    ← Admin (service role) client
    proxy.ts                      ← Session refresh helper (Next 16 renamed middleware → proxy)
  utils/
    provider.ts                   ← buildProviderTree() helper
    circuit-breaker.ts
  rollbar/
    index.ts
  agents/                         ← Future agentic pipeline
    fraud-detection/
    route-optimization/
    demand-forecast/
    menu-recommendation/

public/
  images/
    hero-bg.jpg
    restaurants/
    food/
    app-mockup.png

supabase/
  migrations/                     ← All schema changes go here, never Studio in production
```

### Server vs Client Component Decision Rules

Ask these questions in order — stop at first "yes":

| Question                                                       | Answer →            |
| -------------------------------------------------------------- | ------------------- |
| Does it use `useState` / `useReducer`?                         | `'use client'`      |
| Does it use `useEffect` / `useLayoutEffect`?                   | `'use client'`      |
| Does it read `window`, `document`, `localStorage`?             | `'use client'`      |
| Does it attach event listeners that mutate state?              | `'use client'`      |
| Does it use a TanStack Query hook (`useFetch*`, `useUpdate*`)? | `'use client'`      |
| Does it use React Context that wraps client state?             | `'use client'`      |
| None of the above                                              | Server Component ✅ |

**Extract minimally** — if only a button in a large card needs `onClick` state, extract just that button into a `*Actions.tsx` client file. Keep the card as Server Component.

---

## Food Delivery Domain Architecture

This is a food delivery platform (similar to FoodPanda/GrabFood). The following principles and patterns are chosen to match the domain complexity and infrastructure stack (Next.js 15, self-hosted Supabase, Kafka, Kubernetes, future agentic pipeline).

---

### Core Coding Principles

#### 1. Domain-Driven Design (DDD)

Organize all code around the food delivery domain, not around technical concerns. Each **bounded context** owns its types, business rules, and data access.

**Bounded Contexts:**

| Context        | Responsibility                                   |
| -------------- | ------------------------------------------------ |
| `restaurant`   | Menus, categories, availability, operating hours |
| `ordering`     | Cart, order lifecycle, order history             |
| `delivery`     | Driver assignment, tracking, routing             |
| `payment`      | Payment processing, refunds, wallet              |
| `user`         | Customer profiles, saved addresses, preferences  |
| `notification` | SMS/email/push dispatch                          |

**Target folder structure:**

```
lib/
  domains/
    restaurant/   (types.ts, repository.ts, service.ts)
    ordering/     (types.ts, repository.ts, service.ts, saga.ts)
    delivery/
    payment/
    user/
    notification/
  infrastructure/
    supabase/
      repositories/   (concrete Supabase implementations)
    kafka/
      producer.ts
      consumers/
        ordering/
        delivery/
        payment/
  agents/             (future agentic pipeline)
```

#### 2. SOLID Principles

- **S** — Each module/class has one reason to change (`OrderService` only manages order logic, not payment or delivery)
- **O** — Extend delivery fee strategies or payment providers via new classes, never by modifying existing ones
- **L** — All concrete repositories and payment/notification providers must be substitutable for their interfaces
- **I** — Interfaces segregated by use case (`IOrderReader` vs `IOrderWriter`, `IPaymentProcessor` vs `IRefundProcessor`)
- **D** — Domain and application layers depend on abstractions (repository interfaces), never on Supabase or Kafka directly

#### 3. Clean Architecture

Three strict layers — inner layers must never import from outer layers:

```
Domain layer       (lib/domains/)         — pure business logic, zero framework deps
Application layer  (app/actions/, lib/query/) — use cases, orchestration, Server Actions
Infrastructure     (lib/infrastructure/)   — Supabase adapters, Kafka producers/consumers
Presentation       (app/)                  — Next.js pages, components, Server Components
```

---

### Design Patterns

#### Repository Pattern (Data Access Abstraction)

Every domain defines an interface. Infrastructure implements it via Supabase. This lets tests mock the DB and lets you swap storage without touching business logic.

```typescript
// lib/domains/ordering/repository.ts
interface IOrderRepository {
  findById(id: string): Promise<Order | null>
  findByCustomer(customerId: string, pagination: Pagination): Promise<PaginatedResult<Order>>
  save(order: Order): Promise<Order>
}

// lib/infrastructure/supabase/repositories/order-repository.ts
class SupabaseOrderRepository implements IOrderRepository { ... }
```

#### Event-Driven Architecture + CQRS (via Kafka)

**Commands** mutate state and emit Kafka domain events. **Queries** read from Supabase read-optimized views via TanStack Query. Never mix them.

**Kafka topic naming convention** (`<domain>.<event>` in past tense):

```
orders.placed          orders.confirmed       orders.cancelled
orders.ready-for-pickup orders.delivered
delivery.driver-assigned delivery.picked-up   delivery.completed
restaurant.opened      restaurant.closed      menu.updated
payment.initiated      payment.succeeded      payment.failed
notification.sms-sent  notification.email-sent
```

**Standard event envelope — all Kafka messages MUST follow this shape:**

```typescript
// lib/types/events.ts
interface DomainEvent<T> {
  id: string; // UUID — used for idempotency deduplication
  traceId: string; // correlation ID across all services
  type: string; // e.g. 'orders.placed'
  version: number; // schema version for backward compatibility
  timestamp: string; // ISO 8601
  payload: T;
}
```

**Kafka utilities:**

- Producer: `lib/infrastructure/kafka/producer.ts`
- Consumers: `lib/infrastructure/kafka/consumers/<domain>/` — all consumers **must be idempotent** (deduplicate by `event.id`)
- Dead Letter Queue (DLQ): failed events go to `<topic>.dlq` — **never silently drop messages**

#### Saga Pattern (Distributed Order Workflow)

The order placement flow spans Restaurant → Payment → Delivery. Use **Choreography Saga** via Kafka events — no central orchestrator. Each service reacts to events and emits compensating events on failure.

**Happy path:**

```
orders.placed
  → Restaurant service:  orders.confirmed
  → Payment service:     payment.succeeded
  → Delivery service:    delivery.driver-assigned
  → orders.ready-for-pickup → orders.delivered
```

**Compensation (rollback on failure):**

```
payment.failed → orders.cancelled → inventory.restored
driver-assignment.failed → delivery.retry-or-cancel
```

Saga handlers live in `lib/domains/ordering/saga.ts`.

#### Strategy Pattern (Swappable Algorithms & Providers)

Use for anything that varies by config or business rule:

- Delivery fee calculation (distance-based, flat-rate, surge pricing)
- Payment providers (Stripe, GCash, COD, wallet)
- Notification channels (SMS via Twilio, email via Resend, push)

```typescript
interface IDeliveryFeeStrategy {
  calculate(params: DeliveryFeeParams): number
}
class DistanceBasedFeeStrategy implements IDeliveryFeeStrategy { ... }
class SurgePricingFeeStrategy implements IDeliveryFeeStrategy { ... }
```

#### Circuit Breaker (K8s Resilience)

Wrap all calls to external services (payment gateways, SMS, push notifications) with a circuit breaker. Prevents cascade failures when a downstream service is degraded.

```typescript
// lib/utils/circuit-breaker.ts — wrap unreliable external calls
```

In Kubernetes: configure liveness/readiness probes on all pods. Payment and notification services must not crash the ordering pod.

#### Observer Pattern (Real-time Updates)

Use **Supabase Realtime** subscriptions client-side for live order status (customers tracking orders, restaurant dashboards). Pair with Kafka events server-side — Kafka consumers update the DB, Supabase Realtime pushes the change to the browser.

Enable Realtime **selectively** — only on tables that need it: `orders`, `order_status_history`, `driver_location`.

---

### Infrastructure Guidelines

#### Kubernetes

- Each bounded context is designed to split into an independent K8s Deployment in future microservices migration
- Use `ConfigMap` for non-secret environment-specific config (Kafka brokers, Supabase URL)
- Use `Secret` for credentials (Supabase service key, Kafka SASL credentials)
- Health check route at `/api/health` (approved `/api` exception) for liveness/readiness probes
- Apply Horizontal Pod Autoscaler (HPA) on order-processing consumers during peak hours
- Kafka consumers run as separate K8s `Deployment` from the Next.js app

#### Self-Hosted Supabase

- Connection pooling via PgBouncer (included in self-hosted setup) — configure `SUPABASE_DB_URL` with pooler port
- `SUPABASE_SERVICE_ROLE_KEY` only used in `lib/supabase/service.ts` — never exposed to client
- All schema changes via migrations in `supabase/migrations/` — **never modify schema via Supabase Studio directly in production**
- Enable Supabase Realtime selectively per table (see Observer Pattern above)
- RLS policies required on all tables — wrap `auth.uid()` in `(select auth.uid())` for performance

---

### Future: Agentic Pipeline

Design agent-ready infrastructure from the start so agents slot in without refactoring.

#### Agent Design Principles

- **Single-responsibility agents** — one concern per agent (`OrderRoutingAgent`, `FraudDetectionAgent`, `DemandForecastAgent`, `MenuRecommendationAgent`)
- **Event-triggered** — agents are Kafka consumers that may also produce new events; they plug into the existing event bus with no app changes
- **Stateless** — all agent state persisted in Supabase (K8s pods are ephemeral); no in-memory state between invocations
- **Human-in-the-loop checkpoints** — for high-impact decisions (fraud holds, large refunds, driver blacklisting), agents emit a `review.required` event and pause — a human or approval workflow resolves it before the agent continues
- **Observability first** — every agent action logged with `traceId` for full audit trail

#### Agent Integration via Kafka (future topics)

```
orders.placed          → FraudDetectionAgent    → fraud.flagged / fraud.cleared
delivery.driver-assigned → RouteOptimizationAgent → delivery.route-updated
orders.delivered       → DemandForecastAgent    → demand.prediction-updated
menu.updated           → MenuRecommendationAgent → recommendation.updated
```

#### Agent folder structure (future)

```
lib/
  agents/
    fraud-detection/
    route-optimization/
    demand-forecast/
    menu-recommendation/
```

Each agent folder: `agent.ts` (core logic), `types.ts` (input/output event types), `__tests__/`.

---

### Architecture Decision Summary

| Decision             | Choice                           | Reason                                                                                                      |
| -------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Domain organization  | DDD Bounded Contexts             | Food delivery has rich, complex domain with clear subdomain boundaries                                      |
| Data access          | Repository Pattern               | Decouples business logic from Supabase; enables mocking in tests                                            |
| Order workflow       | Saga (Choreography)              | Distributed transaction across Restaurant/Payment/Delivery without a central coordinator                    |
| Async communication  | Event-Driven + CQRS via Kafka    | Orders, delivery, and notifications are naturally async; CQRS allows independent scaling of reads vs writes |
| Provider variability | Strategy Pattern                 | Multiple payment methods, fee models, and notification channels need to be swappable without code changes   |
| Resilience           | Circuit Breaker                  | K8s pod crashes must not cascade; external service failures must be contained                               |
| Real-time UX         | Observer via Supabase Realtime   | Low-latency order tracking without polling                                                                  |
| Future AI            | Event-triggered stateless agents | Agents plug into Kafka with no architecture change; K8s-friendly ephemeral design                           |
