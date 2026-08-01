import { createBrowserClient } from '@supabase/ssr'

import { createClient } from '@/lib/supabase/client'

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({ from: jest.fn() })),
}))

const mockedCreateBrowserClient = createBrowserClient as jest.Mock

describe('browser client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('passes the url and publishable key through', () => {
    createClient()

    expect(mockedCreateBrowserClient).toHaveBeenCalledWith(
      'http://127.0.0.1:54321',
      'test-publishable-key'
    )
  })

  it('returns the created client', () => {
    expect(createClient()).toEqual({ from: expect.any(Function) })
  })

  it('throws a named error when the publishable key is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    expect(() => createClient()).toThrow('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  })
})
