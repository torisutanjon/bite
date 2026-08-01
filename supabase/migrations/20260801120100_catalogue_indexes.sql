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
