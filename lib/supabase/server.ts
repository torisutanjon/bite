import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

import type { Database } from '@/lib/types/supabase'

import { requireValue } from './env'

/** Supabase client for Server Components and Route Handlers. */
export async function createClient(): Promise<SupabaseClient<Database>> {
  const url = requireValue('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
  const publishableKey = requireValue(
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )

  const cookieStore = await cookies()

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Session refresh happens in proxy.ts instead.
        }
      },
    },
  })
}
