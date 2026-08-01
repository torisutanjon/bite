/**
 * @jest-environment node
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/service'

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: jest.fn() })),
}))

const mockedCreateSupabaseClient = createSupabaseClient as jest.Mock

describe('service client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      SUPABASE_SECRET_KEY: 'test-secret-key',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('passes the url and secret key with sessions disabled', () => {
    createClient()

    expect(mockedCreateSupabaseClient).toHaveBeenCalledWith(
      'http://127.0.0.1:54321',
      'test-secret-key',
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
  })

  it('throws a named error when the secret key is missing', () => {
    delete process.env.SUPABASE_SECRET_KEY

    expect(() => createClient()).toThrow('SUPABASE_SECRET_KEY')
  })

  it('refuses to run in a browser context', () => {
    const globalWithWindow = globalThis as { window?: unknown }
    globalWithWindow.window = {}

    try {
      expect(() => createClient()).toThrow('server-only')
    } finally {
      delete globalWithWindow.window
    }
  })
})
