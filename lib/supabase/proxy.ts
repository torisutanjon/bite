import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { requireValue } from './env'

/**
 * Refreshes the Supabase session and returns a response carrying the
 * refreshed cookies.
 *
 * Not wired in this item: BITE-9 owns the root proxy.ts that calls this.
 * Next renamed the middleware file convention to proxy in v16.0.0.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const url = requireValue('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
  const publishableKey = requireValue(
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })

        Object.entries(headers ?? {}).forEach(([key, value]) => {
          response.headers.set(key, value)
        })
      },
    },
  })

  // Do not insert code between createServerClient and getUser(): it is what
  // performs the refresh, and reordering causes random logouts.
  await supabase.auth.getUser()

  return response
}
