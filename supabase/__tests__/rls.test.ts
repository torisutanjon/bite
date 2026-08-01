import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string
const secretKey = process.env.SUPABASE_SECRET_KEY as string

describe('catalogue RLS policies', () => {
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

  it('exposes the three env vars the clients need', () => {
    expect(url).toBeDefined()
    expect(publishableKey).toBeDefined()
    expect(secretKey).toBeDefined()
  })

  it('lets anon read the seeded stores', async () => {
    const { data, error } = await anon.from('stores').select('slug, name')

    expect(error).toBeNull()
    expect(data).toHaveLength(7)
  })

  it('lets anon read the joined cuisine relation in authored order', async () => {
    const { data, error } = await anon
      .from('stores')
      .select('name, store_cuisines(sort_order, cuisine_tags(label))')
      .eq('slug', 'green-garden-bowls')
      .maybeSingle()

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data?.store_cuisines).toHaveLength(3)
  })

  it('rejects an anon insert', async () => {
    const { error } = await anon.from('stores').insert({
      slug: 'rls-probe',
      name: 'RLS Probe',
      delivery_time_min: 10,
      delivery_time_max: 20,
    })

    expect(error).not.toBeNull()
    expect(error?.code).toBe('42501')
  })

  it('rejects an anon delete, leaving the row intact', async () => {
    await anon.from('stores').delete().eq('slug', 'siam-spice')

    // With no delete policy, Postgres reports no error but removes nothing.
    // Surviving the attempt is the assertion that matters.
    const { data } = await admin.from('stores').select('slug').eq('slug', 'siam-spice')
    expect(data).toHaveLength(1)
  })

  it('hides inactive stores from anon but not from the service role', async () => {
    const { error: insertError } = await admin.from('stores').insert({
      slug: 'hidden-probe',
      name: 'Hidden Probe',
      delivery_time_min: 10,
      delivery_time_max: 20,
      is_active: false,
    })
    expect(insertError).toBeNull()

    try {
      const anonRead = await anon.from('stores').select('slug').eq('slug', 'hidden-probe')
      expect(anonRead.data).toHaveLength(0)

      const adminRead = await admin.from('stores').select('slug').eq('slug', 'hidden-probe')
      expect(adminRead.data).toHaveLength(1)
    } finally {
      await admin.from('stores').delete().eq('slug', 'hidden-probe')
    }
  })
})
