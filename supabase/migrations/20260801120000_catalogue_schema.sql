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
