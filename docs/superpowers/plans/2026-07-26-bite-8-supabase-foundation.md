# BITE-8 Supabase Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Supabase data layer — local stack, schema, RLS, indexes, seed, generated types, and four typed clients — without changing a single file in `app/`.

**Architecture:** Schema-first. Migrations and seed land before any TypeScript client, so `lib/types/supabase.ts` is generated once and every client is typed from birth (no retro-typing pass). Each client is a thin factory over a shared `requireValue()` env validator, giving the missing-env branch one tested surface instead of four copies. Jest gains a second project so live-database specs run in parallel with unit specs but never gate coverage.

**Tech Stack:** Next.js 16.2.6, React 19.2.4, TypeScript strict, `@supabase/supabase-js` 2.110.8 (installed), `@supabase/ssr` (to install), Supabase CLI 2.109.1, Jest 30 + `next/jest`, Postgres 17 via Docker.

**Spec:** `docs/superpowers/specs/2026-07-26-bite-8-supabase-foundation-design.md`

## Global Constraints

- **yarn only.** Never npm. `yarn add`, `yarn add -D`.
- **Nothing in `app/` changes.** No page imports a Supabase client in this item. If a task seems to require touching `app/`, stop and escalate.
- **Radix UI only** for any UI — not applicable here; this item renders nothing.
- **TypeScript strict, no `any`.** Explicit return types on every function.
- **No hardcoded hex colors.** Not applicable here.
- **TDD:** red test before implementation, every task. Never write implementation first.
- **Coverage gates are hard:** statements 90 / branches 85 / functions 95 / lines 90. Currently at 99.66 / 98.32 / 97.87 / 99.66 across 258 tests / 58 suites — do not regress.
- **Env var names, exactly:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
- **`SUPABASE_SECRET_KEY` appears in exactly one source file:** `lib/supabase/service.ts`.
- **`.env.local` is appended to, never rewritten.** It already holds `JIRA_SITE`, `JIRA_EMAIL`, `JIRA_TOKEN`, `JIRA_CLOUD_ID`, `JIRA_PROJECT_KEY`. Destroying those breaks `scripts/jira.sh`.
- **Never commit `.env.local`.** Never paste key values into committed files, commit messages, or the plan.
- **`@supabase/auth-helpers-nextjs` is forbidden.** Use `@supabase/ssr`.
- **Next 16 renamed `middleware` → `proxy`** (deprecated in v16.0.0). The session-refresh helper is `lib/supabase/proxy.ts`. Never create a root `middleware.ts` or `proxy.ts` in this item — BITE-9 owns those.
- **Commit prefix:** `BITE-8: <description>`. No AI attribution in commits or PR body.
- **Branch:** `BITE-8/supabase-foundation` (already created off `develop`).

## Deviations from the spec (decided while planning, with reasons)

Three refinements. Each is a correction, not a scope change.

1. **`position` → `sort_order`** on `store_cuisines`, `menu_categories`, `menu_items`. `position` is a SQL keyword in Postgres (non-reserved, but cannot be a function or type name and reads ambiguously in expressions). `sort_order` needs no quoting.
2. **`coveragePathIgnorePatterns`, not `collectCoverageFrom`.** The existing `jest.config.ts` sets no `collectCoverageFrom`, so coverage is measured only over files actually imported by tests — which is why the repo sits at 99.66%. Adding a broad `collectCoverageFrom` would pull in every untested file in `app/` and collapse the gates instantly. Excluding generated types via `coveragePathIgnorePatterns` achieves the spec's intent without that blast radius.
3. **`requireValue(name, value)` takes the value as an argument** rather than reading `process.env[name]` dynamically. Next inlines `NEXT_PUBLIC_*` vars at build time only when referenced statically; a dynamic `process.env[name]` lookup is **not** substituted in the browser bundle and would be `undefined` at runtime in `client.ts`. Every call site therefore reads `process.env.NEXT_PUBLIC_…` literally and passes the result in.

## Known gap, deliberately left open

The detail page renders a `"Gourmet Selection"` badge on Urban Bistro. The `stores` table has no badge column, so that string is **not represented** in the schema. The feed's `"Free Delivery"` badge is fine — it is derived from `delivery_fee_cents = 0`. BITE-11 decides whether to add a column or drop the badge. Do not add a column here.

## File Structure

**Create:**

| File | Responsibility |
|---|---|
| `supabase/migrations/<ts>_catalogue_schema.sql` | Five tables, constraints, `pg_trgm` extension |
| `supabase/migrations/<ts>_catalogue_indexes.sql` | Filter/lookup indexes |
| `supabase/migrations/<ts>_catalogue_rls.sql` | Enable RLS + public-read policies |
| `supabase/seed.sql` | 7 stores, 14 cuisine tags, 4 categories, 4 menu items |
| `supabase/__tests__/rls.test.ts` | Live-DB policy specs (`db` project) |
| `lib/supabase/env.ts` | `requireValue()` — the single env-validation surface |
| `lib/supabase/client.ts` | Browser client factory |
| `lib/supabase/server.ts` | Server Component client factory (async) |
| `lib/supabase/service.ts` | Service-role client, server-only guarded |
| `lib/supabase/proxy.ts` | `updateSession()` helper — created, not wired |
| `lib/supabase/__tests__/*.test.ts` | Unit specs for the five modules above |
| `lib/types/supabase.ts` | Generated DB types (committed, coverage-excluded) |
| `.env.example` | The three names, no values |

**Modify:**

| File | Change |
|---|---|
| `jest.config.ts` | Two projects (`unit`, `db`); root-level coverage config |
| `package.json` | `test`, `test:db`, `test:all`, `test:coverage` scripts; deps |
| `.gitignore:34` | Add `!.env.example` negation |
| `.env.local` | **Append** three Supabase vars |
| `CLAUDE.md` | One-line amendment: `middleware.ts` → `proxy.ts` for the fourth client |

---

### Task 1: Two Jest projects, running in parallel

**Files:**
- Modify: `jest.config.ts` (whole file)
- Modify: `package.json:26-31` (scripts block)

**Interfaces:**
- Consumes: nothing.
- Produces: a `db` Jest project matching `<rootDir>/supabase/__tests__/**/*.test.ts` in the `node` environment; a `unit` project owning everything else. Scripts `yarn test`, `yarn test:db`, `yarn test:all`, `yarn test:coverage`.

`next/jest` returns an **async factory**, not a config object, so projects must each be built by awaiting `createJestConfig(...)()` and composed under a top-level async default export. Coverage options are global-only in Jest — they must live at the root, never inside a project, or Jest warns and ignores them.

- [ ] **Step 1: Write the failing test**

Create `supabase/__tests__/rls.test.ts` as a reachability guard. This is the `db` project's first spec and makes the project non-empty; the real policy assertions arrive in Task 9.

```typescript
const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

describe("local Supabase stack", () => {
  it("exposes the three env vars the clients need", () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBeDefined()
    expect(process.env.SUPABASE_SECRET_KEY).toBeDefined()
  })

  it("answers on the REST endpoint", async () => {
    const response = await fetch(`${API_URL}/rest/v1/`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string },
    })
    expect(response.status).toBe(200)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `yarn test:db`
Expected: FAIL — `error Command "test:db" not found.` The script does not exist yet.

- [ ] **Step 3: Rewrite `jest.config.ts` with two projects**

Write the file exactly as follows. Note `setupFilesAfterEnv` (not `setupFilesAfterEach`) and that coverage keys sit at the root, never inside a project.

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

// Unit specs: jsdom, React Testing Library, everything outside /tests and /supabase.
const unitConfig: Config = {
  displayName: 'unit',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Playwright specs live in /tests; live-DB specs live in /supabase.
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/',
    '<rootDir>/supabase/',
  ],
  moduleNameMapper: {
    '^next/image$': '<rootDir>/__mocks__/next/image.tsx',
  },
}

// Live-database specs: node environment, no jsdom setup, no RTL.
const dbConfig: Config = {
  displayName: 'db',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/supabase/__tests__/**/*.test.ts'],
}

const config = async (): Promise<Config> => ({
  // Coverage is global-only in Jest; it must not live inside a project.
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/lib/types/supabase.ts',
    '<rootDir>/supabase/',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 95,
      lines: 90,
    },
  },
  projects: [await createJestConfig(unitConfig)(), await createJestConfig(dbConfig)()],
})

export default config
```

- [ ] **Step 4: Update the scripts in `package.json`**

```json
    "test": "jest --selectProjects unit",
    "test:watch": "jest --selectProjects unit --watch",
    "test:coverage": "jest --selectProjects unit --coverage",
    "test:db": "jest --selectProjects db",
    "test:all": "jest",
    "test:e2e": "playwright test"
```

- [ ] **Step 5: Verify the db project passes and the unit suite is untouched**

Run: `yarn test:db`
Expected: PASS, 2 tests, `db` displayName shown. (`next/jest` loads `.env.local` via `@next/env`, which is why the env vars resolve — Task 2 puts them there. If this fails on undefined env vars, run Task 2 first, then return.)

Run: `yarn test`
Expected: PASS, 258 tests / 58 suites, `unit` displayName shown.

Run: `yarn test:all`
Expected: both projects run; Jest schedules them across the same worker pool.

- [ ] **Step 6: Commit**

```bash
git add jest.config.ts package.json supabase/__tests__/rls.test.ts
git commit -m "BITE-8: split jest into parallel unit and db projects"
```

---

### Task 2: Env plumbing and pinned CLI

**Files:**
- Create: `.env.example`
- Modify: `.gitignore:33-34`
- Modify: `.env.local` (append only)
- Modify: `package.json` (devDependencies)

**Interfaces:**
- Consumes: nothing.
- Produces: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` readable from `.env.local`; `yarn supabase` resolving to CLI 2.109.1.

- [ ] **Step 1: Prove `.env.example` is currently unstageable**

Run: `printf 'probe\n' > .env.example && git check-ignore -v .env.example`
Expected: `.gitignore:34:.env*	.env.example` — confirms the file the acceptance criteria require committed is ignored.

- [ ] **Step 2: Add the negation**

In `.gitignore`, replace line 34:

```
# env files (can opt-in for committing if needed)
.env*
!.env.example
```

- [ ] **Step 3: Verify the negation works**

Run: `git check-ignore -v .env.example; echo "exit=$?"`
Expected: no output, `exit=1` — no longer ignored.

Run: `git check-ignore -v .env.local`
Expected: `.gitignore:34:.env*	.env.local` — still ignored. **This must hold.**

- [ ] **Step 4: Write `.env.example` (names only, no values)**

```bash
# Supabase — local stack. Populate from: yarn supabase status -o env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

- [ ] **Step 5: Append the real values to `.env.local`**

**Append. Do not rewrite** — the Jira credentials live in this file.

```bash
# Confirm what is already there before touching it.
grep -c '^JIRA_' .env.local   # expect 5

# Append names + values pulled from the running stack.
{
  echo ""
  echo "# Supabase (local stack)"
  echo "NEXT_PUBLIC_SUPABASE_URL=$(yarn --silent supabase status -o env | sed -n 's/^API_URL="\(.*\)"$/\1/p')"
  echo "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$(yarn --silent supabase status -o env | sed -n 's/^PUBLISHABLE_KEY="\(.*\)"$/\1/p')"
  echo "SUPABASE_SECRET_KEY=$(yarn --silent supabase status -o env | sed -n 's/^SECRET_KEY="\(.*\)"$/\1/p')"
} >> .env.local

# Verify: 5 Jira vars still present, 3 Supabase vars added, no empty values.
grep -c '^JIRA_' .env.local          # expect 5
grep -c '^NEXT_PUBLIC_SUPABASE\|^SUPABASE_SECRET' .env.local   # expect 3
grep -E '^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|SUPABASE_SECRET_KEY)=$' .env.local   # expect no output
```

Step 5 depends on the pinned CLI from Step 6 — if `yarn supabase` is not yet available, do Step 6 first.

- [ ] **Step 6: Pin the Supabase CLI**

The global binary is 2.78.1 and **cannot parse this repo's `config.toml`** (it rejects `experimental.pgdelta` and `config.config.local_smtp`, both written by 2.109.1). Pinning makes `yarn supabase` deterministic.

```bash
yarn add -D supabase@2.109.1
yarn supabase --version   # expect 2.109.1
```

- [ ] **Step 7: Confirm nothing secret is staged**

```bash
git add .gitignore .env.example package.json yarn.lock
git status --short           # .env.local must NOT appear
git diff --cached | grep -c 'sb_secret\|sb_publishable'   # expect 0
```

- [ ] **Step 8: Commit**

```bash
git commit -m "BITE-8: add env template, unignore .env.example, pin supabase CLI"
```

---

### Task 3: Catalogue schema migration

**Files:**
- Create: `supabase/migrations/<timestamp>_catalogue_schema.sql`
- Add: `supabase/` (from `supabase init`) — `config.toml` and `.gitignore` are currently untracked

**Interfaces:**
- Consumes: nothing.
- Produces: tables `public.stores`, `public.cuisine_tags`, `public.store_cuisines`, `public.menu_categories`, `public.menu_items`. Column names are relied on by every later task — in particular `sort_order` (not `position`), and all money columns named `*_cents` typed `integer`.

- [ ] **Step 1: Create the migration file**

Run: `yarn supabase migration new catalogue_schema`
Expected: prints the created path, e.g. `supabase/migrations/20260726120000_catalogue_schema.sql`.

- [ ] **Step 2: Write the schema**

```sql
-- Trigram index support for the ?q= store-name search.
create extension if not exists pg_trgm;

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  hero_image_url text,
  card_image_url text,
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0 check (review_count >= 0),
  delivery_time_min integer not null check (delivery_time_min > 0),
  delivery_time_max integer not null check (delivery_time_max >= delivery_time_min),
  price_level smallint not null default 2 check (price_level between 1 and 3),
  min_order_cents integer not null default 0 check (min_order_cents >= 0),
  delivery_fee_cents integer not null default 0 check (delivery_fee_cents >= 0),
  is_promoted boolean not null default false,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.stores.min_order_cents is 'Integer cents. Never store money as float.';

create table public.cuisine_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  emoji text,
  is_filterable boolean not null default false,
  sort_order integer not null default 0
);

comment on column public.cuisine_tags.is_filterable is 'True for the tags FilterSidebar offers as filters; others are display-only.';

create table public.store_cuisines (
  store_id uuid not null references public.stores (id) on delete cascade,
  cuisine_id uuid not null references public.cuisine_tags (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (store_id, cuisine_id)
);

comment on column public.store_cuisines.sort_order is 'Authored display order, so "Salads · Bowls · Healthy" rebuilds correctly.';

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order integer not null default 0,
  unique (store_id, slug)
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  category_id uuid not null references public.menu_categories (id) on delete cascade,
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  image_url text,
  badge text,
  badge_color text,
  is_available boolean not null default true,
  sort_order integer not null default 0
);

comment on column public.menu_items.badge is 'Presentation string ("POPULAR"). Presentation leaking into data; revisit if a promotions domain appears.';
```

- [ ] **Step 3: Apply from scratch and verify**

Run: `yarn supabase db reset`
Expected: migrations apply with no error; ends with the stack healthy.

Run:
```bash
yarn supabase db reset >/dev/null 2>&1 && \
docker exec supabase_db_bite psql -U postgres -d postgres -c "\dt public.*"
```
Expected: exactly five tables listed — `cuisine_tags`, `menu_categories`, `menu_items`, `store_cuisines`, `stores`.

- [ ] **Step 4: Commit**

```bash
git add supabase/config.toml supabase/.gitignore supabase/migrations/
git commit -m "BITE-8: add catalogue schema migration"
```

---

### Task 4: Indexes migration

**Files:**
- Create: `supabase/migrations/<timestamp>_catalogue_indexes.sql`

**Interfaces:**
- Consumes: all five tables from Task 3.
- Produces: indexes only. No later task depends on their names.

- [ ] **Step 1: Create the file**

Run: `yarn supabase migration new catalogue_indexes`

- [ ] **Step 2: Write the indexes**

One per filter the UI actually offers. `stores(slug)` already has a unique index from its constraint — do not duplicate it.

```sql
-- Rating checkboxes (>= 4.0 / >= 4.5).
create index stores_rating_idx on public.stores (rating desc);

-- Price-level filter ($ / $$ / $$$).
create index stores_price_level_idx on public.stores (price_level);

-- Delivery-time slider.
create index stores_delivery_time_max_idx on public.stores (delivery_time_max);

-- ?q= store-name search, via trigram.
create index stores_name_trgm_idx on public.stores using gin (name gin_trgm_ops);

-- Cuisine filter: cuisine first, so lookups by tag are covered.
create index store_cuisines_cuisine_store_idx on public.store_cuisines (cuisine_id, store_id);

-- Menu render order.
create index menu_items_store_category_order_idx
  on public.menu_items (store_id, category_id, sort_order);
```

- [ ] **Step 3: Apply and verify all six exist**

```bash
yarn supabase db reset >/dev/null 2>&1 && \
docker exec supabase_db_bite psql -U postgres -d postgres -t -c \
  "select indexname from pg_indexes where schemaname='public' order by indexname;"
```
Expected: includes all six index names above plus the primary-key and unique-constraint indexes.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "BITE-8: add catalogue filter indexes"
```

---

### Task 5: RLS migration

**Files:**
- Create: `supabase/migrations/<timestamp>_catalogue_rls.sql`

**Interfaces:**
- Consumes: all five tables from Task 3.
- Produces: RLS enabled on all five tables; `select` policies for `anon` and `authenticated`; **no** write policies. Task 9 asserts this behaviour.

The catalogue is public — browsing must not require a session. Writes are service-role only, and the service role bypasses RLS, so the correct implementation is simply to define no write policy at all.

- [ ] **Step 1: Create the file**

Run: `yarn supabase migration new catalogue_rls`

- [ ] **Step 2: Write the policies**

```sql
alter table public.stores enable row level security;
alter table public.cuisine_tags enable row level security;
alter table public.store_cuisines enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;

-- Public read, gated on is_active where the column exists.
create policy "Public read active stores" on public.stores
  for select to anon, authenticated
  using (is_active);

create policy "Public read cuisine tags" on public.cuisine_tags
  for select to anon, authenticated
  using (true);

create policy "Public read cuisines of active stores" on public.store_cuisines
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_cuisines.store_id and s.is_active
    )
  );

create policy "Public read categories of active stores" on public.menu_categories
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = menu_categories.store_id and s.is_active
    )
  );

create policy "Public read available items of active stores" on public.menu_items
  for select to anon, authenticated
  using (
    is_available
    and exists (
      select 1 from public.stores s
      where s.id = menu_items.store_id and s.is_active
    )
  );

-- No insert/update/delete policies: anon and authenticated cannot write.
-- Mutations go through lib/supabase/service.ts, whose service role bypasses RLS.
```

No policy here references `auth.uid()`. If a future policy does, it must be wrapped as `(select auth.uid())` to avoid per-row re-evaluation.

- [ ] **Step 3: Verify RLS is on and no write policies exist**

```bash
yarn supabase db reset >/dev/null 2>&1
docker exec supabase_db_bite psql -U postgres -d postgres -t -c \
  "select relname, relrowsecurity from pg_class
   where relnamespace='public'::regnamespace and relkind='r' order by relname;"
```
Expected: all five rows show `t`.

```bash
docker exec supabase_db_bite psql -U postgres -d postgres -t -c \
  "select count(*) from pg_policies where schemaname='public' and cmd <> 'SELECT';"
```
Expected: `0`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "BITE-8: enable RLS with public-read catalogue policies"
```

---

### Task 6: Seed

**Files:**
- Create: `supabase/seed.sql`

**Interfaces:**
- Consumes: all five tables.
- Produces: 7 store rows keyed by the slugs below — `the-artisan-hearth`, `mizu-sushi-bar`, `stackd-burgers`, `green-garden-bowls`, `bella-italia-pizza`, `siam-spice`, `the-urban-bistro-and-grill`. Task 9 counts these.

Every value below is lifted from the current placeholder consts. Sources: `app/(dashboard)/stores/page.tsx:16-79`, `app/(dashboard)/stores/[id]/page.tsx:63-128`, `AppetizersGrid.tsx:6-25`, `MainsList.tsx:6-28`, `MenuTabs.tsx:7-12`, `FilterSidebar.tsx:15-21`.

Assumed values (the UI does not supply them): `price_level` defaults to 2 where unstated; `review_count`, `min_order_cents` default 0 except Urban Bistro; `delivery_fee_cents` is 0 everywhere; `hero_image_url` reuses the card image except Urban Bistro. Cuisine assignments for `the-artisan-hearth` and `the-urban-bistro-and-grill` are inferred from their descriptions — neither has a cuisine string in the UI. `sushi` on Mizu and `burgers` on Stack'd are added so those filterable tags match at least one store. `desserts` is filterable but matches nothing, exactly as today (the filter is non-functional UI).

- [ ] **Step 1: Write the seed**

```sql
-- Cuisine tags. The five FilterSidebar offers are is_filterable; the rest are display-only.
insert into public.cuisine_tags (slug, label, emoji, is_filterable, sort_order) values
  ('burgers',   'Burgers',   '🍔', true,  1),
  ('sushi',     'Sushi',     '🍣', true,  2),
  ('pizza',     'Pizza',     '🍕', true,  3),
  ('desserts',  'Desserts',  '🍰', true,  4),
  ('salads',    'Salads',    null, false, 10),
  ('bowls',     'Bowls',     null, false, 11),
  ('healthy',   'Healthy',   null, false, 12),
  ('italian',   'Italian',   null, false, 13),
  ('artisanal', 'Artisanal', null, false, 14),
  ('thai',      'Thai',      null, false, 15),
  ('asian',     'Asian',     null, false, 16),
  ('spicy',     'Spicy',     null, false, 17),
  ('japanese',  'Japanese',  null, false, 18),
  ('american',  'American',  null, false, 19);

-- Stores. Money is integer cents; delivery windows are int pairs.
insert into public.stores (
  slug, name, description, hero_image_url, card_image_url,
  rating, review_count, delivery_time_min, delivery_time_max,
  price_level, min_order_cents, delivery_fee_cents,
  is_promoted, is_featured
) values
  (
    'the-artisan-hearth', 'The Artisan Hearth',
    'Experience artisanal stone-baked pizza and handmade pastas with farm-to-table ingredients',
    'https://picsum.photos/seed/artisanhearth/800/600',
    'https://picsum.photos/seed/artisanhearth/800/600',
    4.9, 0, 25, 35, 2, 0, 0, true, true
  ),
  (
    'mizu-sushi-bar', 'Mizu Sushi Bar', null,
    'https://picsum.photos/seed/mizusushihrec/400/300',
    'https://picsum.photos/seed/mizusushihrec/400/300',
    4.7, 0, 20, 20, 2, 0, 0, false, false
  ),
  (
    'stackd-burgers', 'Stack''d Burgers', null,
    'https://picsum.photos/seed/stackdburgrec/400/300',
    'https://picsum.photos/seed/stackdburgrec/400/300',
    4.5, 0, 15, 15, 2, 0, 0, false, false
  ),
  (
    'green-garden-bowls', 'Green Garden Bowls', null,
    'https://picsum.photos/seed/greengardenfeed/400/300',
    'https://picsum.photos/seed/greengardenfeed/400/300',
    4.2, 0, 20, 30, 2, 0, 0, false, false
  ),
  (
    'bella-italia-pizza', 'Bella Italia Pizza', null,
    'https://picsum.photos/seed/bellaitalfeed/400/300',
    'https://picsum.photos/seed/bellaitalfeed/400/300',
    4.9, 0, 30, 40, 3, 0, 0, false, false
  ),
  (
    'siam-spice', 'Siam Spice', null,
    'https://picsum.photos/seed/siamspicefeed/400/300',
    'https://picsum.photos/seed/siamspicefeed/400/300',
    4.4, 0, 15, 30, 2, 0, 0, false, false
  ),
  (
    'the-urban-bistro-and-grill', 'The Urban Bistro & Grill',
    'Artisanal fusion cuisine crafted with locally sourced organic ingredients and a modern culinary twist.',
    'https://picsum.photos/seed/urbanbistrohero/1400/500',
    'https://picsum.photos/seed/urbanbistrohero/1400/500',
    4.8, 2500, 25, 35, 2, 1500, 0, false, false
  );

-- Store → cuisine, order-preserving so the card string rebuilds as authored.
insert into public.store_cuisines (store_id, cuisine_id, sort_order)
select s.id, c.id, v.sort_order
from (values
  ('green-garden-bowls',        'salads',    1),
  ('green-garden-bowls',        'bowls',     2),
  ('green-garden-bowls',        'healthy',   3),
  ('bella-italia-pizza',        'italian',   1),
  ('bella-italia-pizza',        'pizza',     2),
  ('bella-italia-pizza',        'artisanal', 3),
  ('siam-spice',                'thai',      1),
  ('siam-spice',                'asian',     2),
  ('siam-spice',                'spicy',     3),
  ('mizu-sushi-bar',            'japanese',  1),
  ('mizu-sushi-bar',            'sushi',     2),
  ('stackd-burgers',            'american',  1),
  ('stackd-burgers',            'burgers',   2),
  ('the-artisan-hearth',        'pizza',     1),
  ('the-artisan-hearth',        'italian',   2),
  ('the-urban-bistro-and-grill','artisanal', 1)
) as v (store_slug, cuisine_slug, sort_order)
join public.stores s on s.slug = v.store_slug
join public.cuisine_tags c on c.slug = v.cuisine_slug;

-- Menu categories: the four MenuTabs entries, on Urban Bistro only.
insert into public.menu_categories (store_id, slug, name, sort_order)
select s.id, v.slug, v.name, v.sort_order
from (values
  ('appetizers', 'Appetizers', 1),
  ('mains',      'Mains',      2),
  ('drinks',     'Drinks',     3),
  ('desserts',   'Desserts',   4)
) as v (slug, name, sort_order)
cross join public.stores s
where s.slug = 'the-urban-bistro-and-grill';

-- Menu items. Drinks and desserts stay empty: the UI has tabs but no content.
insert into public.menu_items (
  store_id, category_id, name, description,
  price_cents, image_url, badge, badge_color, sort_order
)
select s.id, mc.id, v.name, v.description,
       v.price_cents, v.image_url, v.badge, v.badge_color, v.sort_order
from (values
  (
    'appetizers', 'Truffle Arancini',
    'Wild mushroom risotto balls with black truffle oil and roasted garlic aioli dip.',
    1450, 'https://picsum.photos/seed/trufflearan/400/300', 'POPULAR', null, 1
  ),
  (
    'appetizers', 'Seared Scallops',
    'Hand dived scallops, cauliflower purée, crispy pancetta, and citrus glaze.',
    1800, 'https://picsum.photos/seed/searedscall/400/300', null, null, 2
  ),
  (
    'mains', 'Signature Wagyu Burger',
    'M5+ Wagyu beef, truffle brie, onion jam, and hand-cut triple cooked chips.',
    2600, 'https://picsum.photos/seed/wagyuburg/300/300', 'Recommended', 'orange', 1
  ),
  (
    'mains', 'Miso Glazed Salmon',
    'Atlantic salmon, ginger miso glaze, sesame asparagus, and jasmine rice.',
    3200, 'https://picsum.photos/seed/misosal/300/300', 'Healthy Choice', 'green', 2
  )
) as v (category_slug, name, description, price_cents, image_url, badge, badge_color, sort_order)
join public.stores s on s.slug = 'the-urban-bistro-and-grill'
join public.menu_categories mc on mc.store_id = s.id and mc.slug = v.category_slug;
```

- [ ] **Step 2: Apply and verify row counts**

```bash
yarn supabase db reset >/dev/null 2>&1
docker exec supabase_db_bite psql -U postgres -d postgres -c \
  "select
     (select count(*) from public.stores)          as stores,
     (select count(*) from public.cuisine_tags)    as tags,
     (select count(*) from public.store_cuisines)  as store_tags,
     (select count(*) from public.menu_categories) as categories,
     (select count(*) from public.menu_items)      as items;"
```
Expected: `stores=7, tags=14, store_tags=16, categories=4, items=4`.

- [ ] **Step 3: Capture the acceptance-criteria evidence query**

This output goes verbatim into the session note — the AC requires it.

```bash
docker exec supabase_db_bite psql -U postgres -d postgres -c \
  "select s.name, s.rating,
          s.delivery_time_min || '-' || s.delivery_time_max || ' min' as delivery,
          string_agg(c.label, ' · ' order by sc.sort_order) as cuisine
   from public.stores s
   left join public.store_cuisines sc on sc.store_id = s.id
   left join public.cuisine_tags c on c.id = sc.cuisine_id
   group by s.id, s.name, s.rating, s.delivery_time_min, s.delivery_time_max
   order by s.name;"
```
Expected: Green Garden Bowls shows `Salads · Bowls · Healthy` — the joined string rebuilt from the relation, matching the UI exactly.

- [ ] **Step 4: Commit**

```bash
git add supabase/seed.sql
git commit -m "BITE-8: seed catalogue from current placeholder data"
```

---

### Task 7: Generated database types

**Files:**
- Create: `lib/types/supabase.ts`

**Interfaces:**
- Consumes: the applied schema.
- Produces: `export type Database` — imported by `server.ts`, `client.ts`, and `service.ts` in Tasks 8–10 as `import type { Database } from "@/lib/types/supabase"`.

- [ ] **Step 1: Generate**

```bash
yarn supabase gen types typescript --local > lib/types/supabase.ts
```

- [ ] **Step 2: Verify it type-checks and contains the five tables**

Run: `yarn type-check`
Expected: clean.

Run: `grep -c 'stores:\|cuisine_tags:\|store_cuisines:\|menu_categories:\|menu_items:' lib/types/supabase.ts`
Expected: at least 5.

- [ ] **Step 3: Confirm it is coverage-excluded**

Already handled by `coveragePathIgnorePatterns` in Task 1. Verify the file is generated, type-only, and imported by no test.

- [ ] **Step 4: Commit**

```bash
git add lib/types/supabase.ts
git commit -m "BITE-8: generate database types from local schema"
```

---

### Task 8: Env validator and browser client

**Files:**
- Create: `lib/supabase/env.ts`
- Create: `lib/supabase/client.ts`
- Test: `lib/supabase/__tests__/env.test.ts`
- Test: `lib/supabase/__tests__/client.test.ts`

**Interfaces:**
- Consumes: `Database` from Task 7.
- Produces:
  - `requireValue(name: string, value: string | undefined): string` — throws `Error` when value is `undefined` or blank; returns it otherwise.
  - `createClient(): SupabaseClient<Database>` from `client.ts` (browser).

`requireValue` takes the value as a parameter rather than reading `process.env[name]` itself. Next only inlines `NEXT_PUBLIC_*` into the browser bundle when referenced **statically**; a dynamic `process.env[name]` would be `undefined` in the browser.

- [ ] **Step 1: Install `@supabase/ssr`**

```bash
yarn add @supabase/ssr
```

- [ ] **Step 2: Write the failing tests**

`lib/supabase/__tests__/env.test.ts`:

```typescript
import { requireValue } from "@/lib/supabase/env"

describe("requireValue", () => {
  it("returns the value when present", () => {
    expect(requireValue("SOME_VAR", "a-value")).toBe("a-value")
  })

  it("throws naming the variable when undefined", () => {
    expect(() => requireValue("MISSING_VAR", undefined)).toThrow("MISSING_VAR")
  })

  it("throws when the value is blank", () => {
    expect(() => requireValue("BLANK_VAR", "   ")).toThrow("BLANK_VAR")
  })

  it("points the reader at .env.example", () => {
    expect(() => requireValue("MISSING_VAR", undefined)).toThrow(/\.env\.example/)
  })
})
```

`lib/supabase/__tests__/client.test.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr"
import { createClient } from "@/lib/supabase/client"

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(() => ({ from: jest.fn() })),
}))

const mockedCreateBrowserClient = createBrowserClient as jest.Mock

describe("browser client", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("passes the url and publishable key through", () => {
    createClient()

    expect(mockedCreateBrowserClient).toHaveBeenCalledWith(
      "http://127.0.0.1:54321",
      "test-publishable-key"
    )
  })

  it("returns the created client", () => {
    expect(createClient()).toEqual({ from: expect.any(Function) })
  })

  it("throws a named error when the publishable key is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    expect(() => createClient()).toThrow("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  })
})
```

- [ ] **Step 3: Run to verify they fail**

Run: `yarn test lib/supabase`
Expected: FAIL — `Cannot find module '@/lib/supabase/env'`.

- [ ] **Step 4: Implement `lib/supabase/env.ts`**

```typescript
/**
 * Validates a single environment value.
 *
 * Takes the value as an argument rather than reading process.env[name]:
 * Next only inlines NEXT_PUBLIC_* vars into the browser bundle when they are
 * referenced statically, so a dynamic lookup would be undefined client-side.
 */
export function requireValue(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === "") {
    throw new Error(
      `Missing Supabase environment variable: ${name}. ` +
        `Copy .env.example to .env.local and fill it in — ` +
        `run \`yarn supabase status -o env\` for local values.`
    )
  }

  return value
}
```

- [ ] **Step 5: Implement `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/supabase"
import { requireValue } from "./env"

/** Supabase client for Client Components. */
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    requireValue("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    requireValue(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )
  )
}
```

- [ ] **Step 6: Run to verify they pass**

Run: `yarn test lib/supabase`
Expected: PASS, 7 tests.

- [ ] **Step 7: Commit**

```bash
git add lib/supabase/env.ts lib/supabase/client.ts lib/supabase/__tests__/ package.json yarn.lock
git commit -m "BITE-8: add env validator and browser Supabase client"
```

---

### Task 9: Server and service clients

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/service.ts`
- Test: `lib/supabase/__tests__/server.test.ts`
- Test: `lib/supabase/__tests__/service.test.ts`

**Interfaces:**
- Consumes: `requireValue` (Task 8), `Database` (Task 7).
- Produces:
  - `createClient(): Promise<SupabaseClient<Database>>` from `server.ts` — **async**, because `cookies()` is async in Next 16.
  - `createClient(): SupabaseClient<Database>` from `service.ts` — throws if imported in a browser context.

The cookie contract is `getAll` / `setAll`, confirmed against `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md` and current Supabase docs. The deprecated `get`/`set`/`remove` shape must not be used.

- [ ] **Step 1: Write the failing tests**

`lib/supabase/__tests__/server.test.ts`:

```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({ from: jest.fn() })),
}))

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}))

const mockedCreateServerClient = createServerClient as jest.Mock
const mockedCookies = cookies as jest.Mock

describe("server client", () => {
  const originalEnv = process.env
  let cookieStore: { getAll: jest.Mock; set: jest.Mock }

  beforeEach(() => {
    jest.clearAllMocks()
    cookieStore = {
      getAll: jest.fn(() => [{ name: "sb-token", value: "abc" }]),
      set: jest.fn(),
    }
    mockedCookies.mockResolvedValue(cookieStore)
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("awaits cookies() and passes url and publishable key", async () => {
    await createClient()

    expect(mockedCreateServerClient).toHaveBeenCalledWith(
      "http://127.0.0.1:54321",
      "test-publishable-key",
      expect.objectContaining({ cookies: expect.any(Object) })
    )
  })

  it("reads cookies through getAll", async () => {
    await createClient()
    const { cookies: handlers } = mockedCreateServerClient.mock.calls[0][2]

    expect(handlers.getAll()).toEqual([{ name: "sb-token", value: "abc" }])
  })

  it("writes each cookie through setAll", async () => {
    await createClient()
    const { cookies: handlers } = mockedCreateServerClient.mock.calls[0][2]

    handlers.setAll([{ name: "sb-token", value: "xyz", options: { path: "/" } }])

    expect(cookieStore.set).toHaveBeenCalledWith("sb-token", "xyz", { path: "/" })
  })

  it("swallows the setAll throw from a Server Component", async () => {
    cookieStore.set.mockImplementation(() => {
      throw new Error("Cookies can only be modified in a Server Action")
    })
    await createClient()
    const { cookies: handlers } = mockedCreateServerClient.mock.calls[0][2]

    expect(() => handlers.setAll([{ name: "a", value: "b", options: {} }])).not.toThrow()
  })

  it("throws a named error when the url is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL

    await expect(createClient()).rejects.toThrow("NEXT_PUBLIC_SUPABASE_URL")
  })
})
```

`lib/supabase/__tests__/service.test.ts`:

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/service"

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: jest.fn() })),
}))

const mockedCreateSupabaseClient = createSupabaseClient as jest.Mock

describe("service client", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_SECRET_KEY: "test-secret-key",
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("passes the url and secret key with sessions disabled", () => {
    createClient()

    expect(mockedCreateSupabaseClient).toHaveBeenCalledWith(
      "http://127.0.0.1:54321",
      "test-secret-key",
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
  })

  it("throws a named error when the secret key is missing", () => {
    delete process.env.SUPABASE_SECRET_KEY

    expect(() => createClient()).toThrow("SUPABASE_SECRET_KEY")
  })

  it("refuses to run in a browser context", () => {
    const globalWithWindow = globalThis as { window?: unknown }
    globalWithWindow.window = {}

    try {
      expect(() => createClient()).toThrow("server-only")
    } finally {
      delete globalWithWindow.window
    }
  })
})
```

The browser-guard test needs a `node` environment while the rest of the file is fine in jsdom. Because the `unit` project runs jsdom (where `window` always exists), add this docblock at the very top of `service.test.ts` so Jest runs that file in node:

```typescript
/**
 * @jest-environment node
 */
```

- [ ] **Step 2: Run to verify they fail**

Run: `yarn test lib/supabase`
Expected: FAIL — `Cannot find module '@/lib/supabase/server'`.

- [ ] **Step 3: Implement `lib/supabase/server.ts`**

```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/supabase"
import { requireValue } from "./env"

/** Supabase client for Server Components and Route Handlers. */
export async function createClient(): Promise<SupabaseClient<Database>> {
  const url = requireValue(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )
  const publishableKey = requireValue(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )

  const cookieStore = await cookies()

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Session refresh happens in proxy.ts instead.
        }
      },
    },
  })
}
```

- [ ] **Step 4: Implement `lib/supabase/service.ts`**

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/supabase"
import { requireValue } from "./env"

/**
 * Admin client using the service role. Bypasses RLS.
 *
 * The only file permitted to reference SUPABASE_SECRET_KEY. Never import this
 * into a Client Component or anything reachable from the browser bundle.
 */
export function createClient(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error(
      "lib/supabase/service.ts is server-only: it holds SUPABASE_SECRET_KEY " +
        "and must never be imported into client code."
    )
  }

  return createSupabaseClient<Database>(
    requireValue("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    requireValue("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY),
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
```

- [ ] **Step 5: Run to verify they pass**

Run: `yarn test lib/supabase`
Expected: PASS, 15 tests.

- [ ] **Step 6: Verify the secret key appears in exactly one source file**

```bash
grep -rl 'SUPABASE_SECRET_KEY' lib app --include='*.ts' --include='*.tsx' | grep -v __tests__
```
Expected: exactly `lib/supabase/service.ts`.

- [ ] **Step 7: Commit**

```bash
git add lib/supabase/server.ts lib/supabase/service.ts lib/supabase/__tests__/
git commit -m "BITE-8: add server and service-role Supabase clients"
```

---

### Task 10: Session-refresh proxy helper

**Files:**
- Create: `lib/supabase/proxy.ts`
- Test: `lib/supabase/__tests__/proxy.test.ts`
- Modify: `CLAUDE.md` (the four-client list)

**Interfaces:**
- Consumes: `requireValue` (Task 8).
- Produces: `updateSession(request: NextRequest): Promise<NextResponse>` — refreshes the session and returns the response carrying refreshed cookies. **No redirect logic**; that is BITE-9's.

Next deprecated the `middleware` file convention and renamed it to `proxy` in v16.0.0 (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md:770`). This helper is named to match. **Do not create a root `proxy.ts`** — BITE-9 owns wiring.

- [ ] **Step 1: Write the failing test**

```typescript
/**
 * @jest-environment node
 */
import { createServerClient } from "@supabase/ssr"
import { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
  })),
}))

const mockedCreateServerClient = createServerClient as jest.Mock

describe("updateSession", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("returns a response and refreshes the user", async () => {
    const request = new NextRequest("http://localhost:3000/stores")

    const response = await updateSession(request)

    expect(response).toBeDefined()
    const client = mockedCreateServerClient.mock.results[0].value
    expect(client.auth.getUser).toHaveBeenCalled()
  })

  it("reads cookies from the request via getAll", async () => {
    const request = new NextRequest("http://localhost:3000/stores")
    request.cookies.set("sb-token", "abc")

    await updateSession(request)
    const { cookies: handlers } = mockedCreateServerClient.mock.calls[0][2]

    expect(handlers.getAll()).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "sb-token" })])
    )
  })

  it("writes refreshed cookies onto the response via setAll", async () => {
    const request = new NextRequest("http://localhost:3000/stores")

    await updateSession(request)
    const { cookies: handlers } = mockedCreateServerClient.mock.calls[0][2]
    handlers.setAll([{ name: "sb-token", value: "refreshed", options: { path: "/" } }], {})

    expect(request.cookies.get("sb-token")?.value).toBe("refreshed")
  })

  it("throws a named error when the url is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const request = new NextRequest("http://localhost:3000/stores")

    await expect(updateSession(request)).rejects.toThrow("NEXT_PUBLIC_SUPABASE_URL")
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `yarn test lib/supabase/__tests__/proxy.test.ts`
Expected: FAIL — `Cannot find module '@/lib/supabase/proxy'`.

- [ ] **Step 3: Implement `lib/supabase/proxy.ts`**

```typescript
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { requireValue } from "./env"

/**
 * Refreshes the Supabase session and returns a response carrying the
 * refreshed cookies.
 *
 * Not wired in this item: BITE-9 owns the root proxy.ts that calls this.
 * Next renamed the middleware file convention to proxy in v16.0.0.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const url = requireValue(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )
  const publishableKey = requireValue(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })

        Object.entries(headers ?? {}).forEach(([key, value]) => {
          response.headers.set(key, value)
        })
      },
    },
  })

  // Do not insert code between createServerClient and getUser(): it is what
  // performs the refresh, and reordering causes random logouts.
  await supabase.auth.getUser()

  return response
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `yarn test lib/supabase`
Expected: PASS, 19 tests.

- [ ] **Step 5: Amend `CLAUDE.md`**

In the "Four distinct clients" block, change the third comment and import:

```tsx
// 3. Proxy (session refresh) — Next 16 renamed the middleware convention to proxy
import { updateSession } from "@/lib/supabase/proxy";
```

Also update the folder-structure listing further down: `middleware.ts ← Session refresh proxy helper` becomes `proxy.ts ← Session refresh helper (Next 16 renamed middleware → proxy)`.

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/proxy.ts lib/supabase/__tests__/proxy.test.ts CLAUDE.md
git commit -m "BITE-8: add session-refresh proxy helper, align CLAUDE.md with Next 16"
```

---

### Task 11: RLS policy specs against the live stack

**Files:**
- Modify: `supabase/__tests__/rls.test.ts` (replace the Task 1 reachability guard's file, keeping both env checks)

**Interfaces:**
- Consumes: the seeded database, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
- Produces: nothing consumed downstream.

These specs use `@supabase/supabase-js` directly rather than the `lib/supabase` factories: those factories are Next-coupled (`next/headers`), and the point here is to exercise Postgres policies, not the wrappers.

- [ ] **Step 1: Write the failing specs**

Replace the file contents with:

```typescript
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string
const secretKey = process.env.SUPABASE_SECRET_KEY as string

describe("catalogue RLS policies", () => {
  let anon: SupabaseClient
  let admin: SupabaseClient

  beforeAll(() => {
    anon = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    admin = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  })

  it("exposes the three env vars the clients need", () => {
    expect(url).toBeDefined()
    expect(publishableKey).toBeDefined()
    expect(secretKey).toBeDefined()
  })

  it("lets anon read the seeded stores", async () => {
    const { data, error } = await anon.from("stores").select("slug, name")

    expect(error).toBeNull()
    expect(data).toHaveLength(7)
  })

  it("lets anon read the joined cuisine relation in authored order", async () => {
    const { data, error } = await anon
      .from("stores")
      .select("name, store_cuisines(sort_order, cuisine_tags(label))")
      .eq("slug", "green-garden-bowls")
      .maybeSingle()

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data?.store_cuisines).toHaveLength(3)
  })

  it("rejects an anon insert", async () => {
    const { error } = await anon.from("stores").insert({
      slug: "rls-probe",
      name: "RLS Probe",
      delivery_time_min: 10,
      delivery_time_max: 20,
    })

    expect(error).not.toBeNull()
    expect(error?.code).toBe("42501")
  })

  it("rejects an anon delete", async () => {
    const { error, count } = await anon
      .from("stores")
      .delete({ count: "exact" })
      .eq("slug", "siam-spice")

    expect(error === null ? count : 0).toBe(0)
  })

  it("hides inactive stores from anon but not from the service role", async () => {
    const { error: insertError } = await admin.from("stores").insert({
      slug: "hidden-probe",
      name: "Hidden Probe",
      delivery_time_min: 10,
      delivery_time_max: 20,
      is_active: false,
    })
    expect(insertError).toBeNull()

    try {
      const anonRead = await anon.from("stores").select("slug").eq("slug", "hidden-probe")
      expect(anonRead.data).toHaveLength(0)

      const adminRead = await admin.from("stores").select("slug").eq("slug", "hidden-probe")
      expect(adminRead.data).toHaveLength(1)
    } finally {
      await admin.from("stores").delete().eq("slug", "hidden-probe")
    }
  })
})
```

- [ ] **Step 2: Run to verify the new assertions fail before a reset**

Run: `yarn supabase db reset >/dev/null 2>&1 && yarn test:db`
Expected: PASS. If the store count assertion fails with 0, the seed did not apply — re-run Task 6 Step 2.

To see the specs genuinely fail red, temporarily comment out the `create policy "Public read active stores"` line, `yarn supabase db reset`, and confirm the anon read returns 0 rows. Restore it afterwards.

- [ ] **Step 3: Commit**

```bash
git add supabase/__tests__/rls.test.ts
git commit -m "BITE-8: add RLS policy specs for the catalogue"
```

---

### Task 12: Full verification and PR

**Files:** none created.

- [ ] **Step 1: Confirm `app/` is untouched**

```bash
git diff --stat develop...HEAD -- app/
```
Expected: **empty output.** If anything appears, the item's central constraint is violated — stop and escalate.

- [ ] **Step 2: Fast-fail verification, in order**

```bash
yarn type-check
```
Expected: clean, no errors.

```bash
yarn lint
```
Expected: 0 errors. Warnings inside `coverage/lcov-report/` are pre-existing and acceptable.

```bash
yarn test:coverage
```
Expected: exit 0. Statements ≥ 90, branches ≥ 85, functions ≥ 95, lines ≥ 90. Baseline to beat: 99.66 / 98.32 / 97.87 / 99.66 over 258 tests. New total ≈ 277 tests.

```bash
yarn test:db
```
Expected: PASS, 6 specs.

```bash
yarn supabase db reset && yarn test:db
```
Expected: migrations apply from scratch, seed loads, specs pass — proving the migrations are reproducible rather than only true of the current database.

- [ ] **Step 3: Confirm no secret leaked into the diff**

```bash
git diff develop...HEAD | grep -c 'sb_secret\|sb_publishable\|JIRA_TOKEN'
```
Expected: `0`.

```bash
git diff --stat develop...HEAD -- .env.local
```
Expected: empty — the file is gitignored and must never appear.

- [ ] **Step 4: Transition Jira to QA Review**

```bash
./scripts/jira.sh transition BITE-8 "QA Review"
```
A transition failure is a warning, not a blocker — report it and continue.

- [ ] **Step 5: Push and open the PR**

**Ask before pushing.** Pushing requires per-time approval.

```bash
git push -u origin BITE-8/supabase-foundation
gh pr create --base develop --title "BITE-8: Supabase foundation" --body "..."
```

PR body covers: the four settled decisions, the three planning deviations, the seed assumptions table, the `middleware`→`proxy` rename, and the `Gourmet Selection` gap. No AI attribution.

```bash
./scripts/jira.sh transition BITE-8 "Code Review"
```

- [ ] **Step 6: Close the loop in the vault**

Per `MYWORKFLOW.md` step 10:
- `./scripts/jira.sh transition BITE-8 "Done"`
- Regenerate `Backlog.md` via `scripts/jira-mirror-backlog.sh`
- Update `Progress.md`: Supabase installed and wired, `lib/supabase/` exists, the "no data layer" known gap is closed, `app/` still placeholder-driven
- Write `Fixes/BITE-8.md`: root cause n/a (feature), what shipped, verification output, plus a one-line **Goal impact** — `G1: the catalogue now lives in Postgres with RLS; the app can read real stores.` **This is G1's first completion.**
- Update the `Goals.md` Rollup: add `BITE-8 Supabase foundation ✓` under G1, replacing `(none yet)`
- Write `Decisions/` records for the cuisine tag relation, the publishable/secret key naming, and the `middleware`→`proxy` rename
- Append the evidence query output from Task 6 Step 3 to the session note

---

## Self-Review

**Spec coverage.** Every spec section maps to a task: test topology → Task 1; env/tooling → Task 2; three migrations → Tasks 3–5; seed and assumptions → Task 6; generated types → Task 7; four clients → Tasks 8–10; RLS tests → Task 11; acceptance criteria and evidence → Task 12. The `.gitignore` negation, the CLI pin, and the "nothing in `app/`" constraint each have an explicit verification step.

**Placeholder scan.** No TBD/TODO. Every code step carries real code; every verification step carries a command and an expected result. One intentional exception: the PR body in Task 12 Step 5 is described rather than written, because it must reflect what actually happened during execution.

**Type consistency.** `requireValue(name, value)` has one signature, used identically in `client.ts`, `server.ts`, `service.ts`, and `proxy.ts`. `createClient` is the factory name in all three client modules (matching `CLAUDE.md`'s documented imports); `proxy.ts` exports `updateSession`. `sort_order` is used consistently — never `position` — across the schema, seed, and specs. `Database` is generated in Task 7 before any client imports it.

**One correction made during review:** Task 1's config listing initially showed placeholder keys followed by a correction — a trap for anyone reading that task in isolation. It now contains a single, correct `jest.config.ts` using `setupFilesAfterEnv`.
