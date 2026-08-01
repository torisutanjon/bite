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
