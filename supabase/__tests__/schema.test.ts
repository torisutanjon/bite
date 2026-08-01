import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const secretKey = process.env.SUPABASE_SECRET_KEY as string

describe('catalogue schema constraints', () => {
  let admin: SupabaseClient

  beforeAll(() => {
    admin = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  })

  it('refuses a menu item whose category belongs to a different store', async () => {
    // A category on the store that owns the seeded menu...
    const { data: category } = await admin
      .from('menu_categories')
      .select('id, store_id')
      .limit(1)
      .maybeSingle()
    expect(category).not.toBeNull()

    // ...paired with any other store.
    const { data: otherStore } = await admin
      .from('stores')
      .select('id')
      .neq('id', category?.store_id)
      .limit(1)
      .maybeSingle()
    expect(otherStore).not.toBeNull()

    const { error } = await admin.from('menu_items').insert({
      store_id: otherStore?.id,
      category_id: category?.id,
      name: 'Mismatched Item',
      price_cents: 1000,
    })

    // The composite FK has no matching (id, store_id) row to point at.
    expect(error).not.toBeNull()
    expect(error?.code).toBe('23503')
  })

  it('accepts a menu item whose category and store agree', async () => {
    const { data: category } = await admin
      .from('menu_categories')
      .select('id, store_id')
      .limit(1)
      .maybeSingle()

    const { data: inserted, error } = await admin
      .from('menu_items')
      .insert({
        store_id: category?.store_id,
        category_id: category?.id,
        name: 'Consistent Probe Item',
        price_cents: 1000,
      })
      .select('id')
      .maybeSingle()

    try {
      expect(error).toBeNull()
      expect(inserted).not.toBeNull()
    } finally {
      if (inserted?.id) {
        await admin.from('menu_items').delete().eq('id', inserted.id)
      }
    }
  })
})
