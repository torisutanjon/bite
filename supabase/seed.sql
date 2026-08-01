-- Cuisine tags. FilterSidebar offers five choices, but "All Cuisines" is a sentinel
-- rather than a tag — so the four real cuisines behind it are is_filterable and the
-- rest are display-only.
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
