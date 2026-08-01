-- Table-level privileges. RLS policies decide which ROWS a role may see, but
-- Postgres checks the table privilege first: without a GRANT it rejects with
-- 42501 "permission denied for table" before any policy is ever evaluated.
--
-- These tables do not inherit usable defaults. This project's `pg_default_acl`
-- grants new public relations only Dxtm (truncate/references/trigger/maintain)
-- to anon, authenticated and service_role — no select/insert/update/delete —
-- so every privilege the app relies on is granted explicitly here.

-- Public read. Deliberately SELECT only: withholding the write privileges is
-- the second half of "no public write", alongside the absent write policies.
grant select on public.stores to anon, authenticated;
grant select on public.cuisine_tags to anon, authenticated;
grant select on public.store_cuisines to anon, authenticated;
grant select on public.menu_categories to anon, authenticated;
grant select on public.menu_items to anon, authenticated;

-- The service role bypasses RLS, but bypassing policies is not the same as
-- holding table privileges — it still needs these to mutate the catalogue.
grant select, insert, update, delete on public.stores to service_role;
grant select, insert, update, delete on public.cuisine_tags to service_role;
grant select, insert, update, delete on public.store_cuisines to service_role;
grant select, insert, update, delete on public.menu_categories to service_role;
grant select, insert, update, delete on public.menu_items to service_role;
