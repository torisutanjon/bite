import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/types/supabase'

import { requireValue } from './env'

/** Supabase client for Client Components. */
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    requireValue('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    requireValue(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )
  )
}
