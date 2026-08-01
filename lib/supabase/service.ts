import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/types/supabase'

import { requireValue } from './env'

/**
 * Admin client using the service role. Bypasses RLS.
 *
 * The only application file permitted to reference SUPABASE_SECRET_KEY. Never
 * import this into a Client Component or anything reachable from the browser
 * bundle.
 */
export function createClient(): SupabaseClient<Database> {
  if (typeof window !== 'undefined') {
    throw new Error(
      'lib/supabase/service.ts is server-only: it holds SUPABASE_SECRET_KEY ' +
        'and must never be imported into client code.'
    )
  }

  return createSupabaseClient<Database>(
    requireValue('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    requireValue('SUPABASE_SECRET_KEY', process.env.SUPABASE_SECRET_KEY),
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
