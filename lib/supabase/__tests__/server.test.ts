import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { createClient } from '@/lib/supabase/server'

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({ from: jest.fn() })),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

const mockedCreateServerClient = createServerClient as jest.Mock
const mockedCookies = cookies as jest.Mock

describe('server client', () => {
  const originalEnv = process.env
  let cookieStore: { getAll: jest.Mock; set: jest.Mock }

  beforeEach(() => {
    jest.clearAllMocks()
    cookieStore = {
      getAll: jest.fn(() => [{ name: 'sb-token', value: 'abc' }]),
      set: jest.fn(),
    }
    mockedCookies.mockResolvedValue(cookieStore)
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('awaits cookies() and passes url and publishable key', async () => {
    await createClient()

    expect(mockedCreateServerClient).toHaveBeenCalledWith(
      'http://127.0.0.1:54321',
      'test-publishable-key',
      expect.objectContaining({ cookies: expect.any(Object) })
    )
  })

  it('reads cookies through getAll', async () => {
    await createClient()
    const { cookies: handlers } = mockedCreateServerClient.mock.calls[0][2]

    expect(handlers.getAll()).toEqual([{ name: 'sb-token', value: 'abc' }])
  })

  it('writes each cookie through setAll', async () => {
    await createClient()
    const { cookies: handlers } = mockedCreateServerClient.mock.calls[0][2]

    handlers.setAll([{ name: 'sb-token', value: 'xyz', options: { path: '/' } }])

    expect(cookieStore.set).toHaveBeenCalledWith('sb-token', 'xyz', { path: '/' })
  })

  it('swallows the setAll throw from a Server Component', async () => {
    cookieStore.set.mockImplementation(() => {
      throw new Error('Cookies can only be modified in a Server Action')
    })
    await createClient()
    const { cookies: handlers } = mockedCreateServerClient.mock.calls[0][2]

    expect(() => handlers.setAll([{ name: 'a', value: 'b', options: {} }])).not.toThrow()
  })

  it('throws a named error when the url is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL

    await expect(createClient()).rejects.toThrow('NEXT_PUBLIC_SUPABASE_URL')
  })
})
