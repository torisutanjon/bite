# BITE-8 — Supabase foundation (design)

- **Jira:** BITE-8 · **Vault id:** BITE-003 · **Type:** feat · **Goal:** G1 (make it real)
- **Date:** 2026-07-26
- **Branch:** `BITE-8/supabase-foundation`
- **Task note:** `BiteVault/Tasks/BITE-003.md`

## Purpose

Stand up the Supabase data layer end to end — packages, local stack, schema, RLS, indexes,
seed, generated types, and the four mandated clients — and stop before any page is
rewritten. Done means a scratch query against `stores` returns the restaurants the UI is
currently faking.

This is the first item to move G1, which has zero completions.

**Nothing in `app/` changes.** No page imports a Supabase client in this item.

## Context discovered during analysis

`develop` had no Supabase surface at all: no `supabase/` directory, no `lib/supabase/`, no
database types. `lib/` contained only `test-utils/`.

Two facts turned up that the task note did not anticipate:

1. **The placeholder data is internally inconsistent.** The feed lists six stores; the
   detail page is hardcoded to a seventh, "The Urban Bistro & Grill", which appears nowhere
   in the feed and ignores its `id` route param. All menu data belongs to that seventh
   store. "Seed verbatim" therefore under-specifies what to do.
2. **`.gitignore:34` is `.env*`**, which also ignores `.env.example` — the file the
   acceptance criteria require to be committed.

Environment state at design time: local stack already up (12 running `supabase_*_bite`
containers; `imgproxy` and `pooler` stopped, neither needed here), REST answering on
`127.0.0.1:54321`, `supabase init` run, `config.toml`
written by CLI **2.109.1**. The global `supabase` binary is **2.78.1** and cannot parse
that config — it rejects `experimental.pgdelta` and `config.config.local_smtp`.

## Decisions

| # | Question | Decision |
|---|---|---|
| D1 | Feed stores and the detail store are disjoint sets | Seed **7 stores, 1 full menu** — all six feed stores plus Urban Bistro; only Urban Bistro gets menu categories and items. Truest to "verbatim"; leaves the coherence gap visible for BITE-11/BITE-17 to resolve deliberately. |
| D2 | Cuisine modelling (the call the task note flagged) | **Tag relation, order-preserving.** `cuisine_tags` + `store_cuisines` with a `position` column so the card's joined string rebuilds in authored order. FilterSidebar's five get `is_filterable` + emoji. |
| D3 | Env var naming | **New format** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`. Legacy `anon`/`service_role` JWT keys are on Supabase's deprecation path. **Supersedes the task note AC wording**, which still says `SUPABASE_SERVICE_ROLE_KEY`. |
| D4 | RLS tests vs coverage gates | **Separate Jest projects, run in parallel.** Unit tests own the coverage gates and need no Docker; RLS integration specs are their own project. |

## Test topology

One `jest.config.ts` declaring two projects. Jest's multi-project runner parallelizes them
across the existing worker pool — no added tooling.

| Script | Runs | Docker |
|---|---|---|
| `yarn test` | `--selectProjects unit` (jsdom) | no |
| `yarn test:db` | `--selectProjects db` (node) | yes |
| `yarn test:all` | both projects, in parallel | yes |
| `yarn test:coverage` | `--selectProjects unit --coverage` | no |

Coverage thresholds bind to the `unit` project only. In a multi-project run thresholds
apply to the merged total, so admitting live-DB specs would make the 95% functions gate
depend on whether Docker is up. `lib/types/supabase.ts` and the db specs are excluded from
`collectCoverageFrom`.

## Schema

Three migrations in `supabase/migrations/`, split by concern for reviewability. They always
apply together; `supabase db reset` verifies them from scratch.

1. `<ts>_catalogue_schema.sql` — tables
2. `<ts>_catalogue_indexes.sql` — indexes
3. `<ts>_catalogue_rls.sql` — enable RLS + policies

**Money is integer cents everywhere.** The placeholders are JS floats (`14.5`, `26.0`); they
must not reach the schema as floats.

### Tables

- **`stores`** — `id` uuid pk, `slug` text unique, `name`, `description`,
  `hero_image_url`, `card_image_url`, `rating` numeric(2,1), `review_count` int,
  `delivery_time_min` / `delivery_time_max` int, `price_level` smallint 1–3,
  `min_order_cents` int, `delivery_fee_cents` int, `is_promoted`, `is_featured`,
  `is_active` bool, `created_at` / `updated_at` timestamptz.
- **`cuisine_tags`** — `id`, `slug`, `label`, `emoji`, `is_filterable`, `position`.
  `is_filterable` marks the five FilterSidebar shows; the rest are display-only.
- **`store_cuisines`** — `store_id`, `cuisine_id`, `position`; PK `(store_id, cuisine_id)`.
  `position` is what lets `"Salads · Bowls · Healthy"` rebuild in authored order.
- **`menu_categories`** — `id`, `store_id` fk, `slug`, `name`, `position`;
  unique `(store_id, slug)`.
- **`menu_items`** — `id`, `store_id` fk, `category_id` fk, `name`, `description`,
  `price_cents`, `image_url`, `badge`, `badge_color`, `is_available`, `position`.

`badge` / `badge_color` are presentation strings stored as text. Accepted for now, and
noted as presentation leaking into data — revisit if a promotions domain appears.

### Indexes

Every column a filter touches, per the repo query-optimization rules:

- `stores(rating)` — the ≥4.0 / ≥4.5 checkboxes
- `stores(price_level)` — `$` / `$$` / `$$$`
- `stores(delivery_time_max)` — the delivery-time slider
- `stores(slug)` unique — detail lookup
- trigram index on `stores(name)` — the `?q=` search param
- `store_cuisines(cuisine_id, store_id)` — cuisine filter
- `menu_items(store_id, category_id, position)` — menu render order

### RLS

Required on all five tables before this item closes.

- **Public read** — anon `SELECT` on all five, gated on `is_active` where the column exists.
  The catalogue is public; browsing must not require a session.
- **No public write** — no anon/authenticated `INSERT`/`UPDATE`/`DELETE`. Mutations go
  through the service-role client only.
- Any policy referencing `auth.uid()` wraps it as `(select auth.uid())`.

## Seed

`supabase/seed.sql` — 7 stores; 4 menu categories and 4 menu items (2 appetizers, 2 mains)
on Urban Bistro only. Drinks and desserts are seeded as **empty categories**: the UI has
tabs for them but no content. Picsum image URLs are kept verbatim, so no asset work.

### Assumptions — values the placeholder data does not supply

| Field | Known | Assumed |
|---|---|---|
| `price_level` | 3 feed stores (2, 3, 2) | others → `2` (FilterSidebar's default `$$`) |
| `review_count` | Urban Bistro → `2500` ("2.5k+") | others → `0` |
| `min_order_cents` | Urban Bistro → `1500` | others → `0` |
| `delivery_fee_cents` | "Free Delivery" badge → `0` | all → `0` |
| `hero_image_url` | Urban Bistro only | others → reuse card image |
| `slug` | — | derived from name (`green-garden-bowls`) |

`delivery_time` strings map to the int pair: `"20-30 min"` → `20`/`30`; a single `"20 min"`
→ `20`/`20`.

**Downstream consequence:** feed links today point at `/stores/1`, `/stores/r2`.
Name-derived slugs mean **BITE-11 changes those hrefs**. Accepted deliberately over seeding
`slug` as `"1"`/`"r2"`, which nothing renders today.

## Clients — `lib/supabase/`

- **`env.ts`** — one `requireEnv()` helper that throws a named, actionable error, consumed
  by all four factories. Gives the missing-env branch a single tested surface instead of
  four copies.
- **`server.ts`** — `createServerClient` + `next/headers` cookies; async factory.
- **`client.ts`** — `createBrowserClient`.
- **`service.ts`** — secret key; guarded so importing it from browser code throws. The only
  application file permitted to reference `SUPABASE_SECRET_KEY` — test code may read it
  directly to drive the live database.
- **`middleware.ts`** — `updateSession` helper, **created but not wired**.

**Deliberate boundary:** no root `middleware.ts`. Session refresh is auth behaviour and
belongs to BITE-9.

`@supabase/auth-helpers-nextjs` is forbidden. `@supabase/supabase-js` is already installed;
`@supabase/ssr` still needs adding.

Per `AGENTS.md` this is Next 16 — read the cookie contract in `node_modules/next/dist/docs/`
rather than writing `@supabase/ssr` cookie handling from memory.

## Env & tooling

- `.gitignore` gains `!.env.example`
- `.env.example` — the three names, no values
- `.env.local` — **appended, never rewritten**; it already holds the Jira credentials
- `supabase` CLI pinned to devDependencies at **2.109.1** so `yarn supabase` is
  deterministic and matches the config that created the running stack
- `lib/types/supabase.ts` generated via `supabase gen types typescript --local`, committed

## TDD order

1. **Red:** `lib/supabase/__tests__/` with `@supabase/ssr` mocked — each factory returns a
   client, reads the right vars, and throws clearly when env is missing.
2. Implement the clients.
3. Migrations + seed; verify with `supabase db reset`.
4. RLS specs in the `db` project — anon `SELECT` succeeds on active rows, anon `INSERT` is
   rejected, secret key can write.
5. Generate types; confirm gates hold.

No browser verification: this item renders nothing. Playwright evidence starts at BITE-10.

## Acceptance criteria

- [ ] `@supabase/ssr` + `@supabase/supabase-js` installed via yarn
- [ ] `supabase init` committed; the stack comes up locally
- [ ] Migrations create all five tables; schema changes only via migration files
- [ ] RLS enabled on every table with public-read / no-public-write policies
- [ ] Indexes above created in a migration
- [ ] Seed reproduces placeholder content, with the assumptions above documented
- [ ] All four clients exist and type-check
- [ ] `lib/types/supabase.ts` generated and committed
- [ ] `.env.example` committed; `.env.local` gitignored and never committed
- [ ] `SUPABASE_SECRET_KEY` referenced only in `lib/supabase/service.ts` (application code;
      tests may read it to drive the live database)
- [ ] A throwaway query against `stores` returns the seeded rows — pasted into the session note
- [ ] Nothing in `app/` changes
- [ ] Failing test first; gates hold (90 stmts / 85 branch / 95 funcs / 90 lines)

## Out of scope

- Rewriting `/stores` → BITE-10 · rewriting `/stores/[id]` → BITE-11
- Auth, sessions, root `middleware.ts` → BITE-9
- TanStack Query hooks → BITE-12
- Reviews — `GuestExperiences.tsx` stays hardcoded; `stores.rating` / `review_count` are
  stored values. File a separate item if reviews should become real.
- Orders, cart, checkout, profile data — separate domains, separate items
