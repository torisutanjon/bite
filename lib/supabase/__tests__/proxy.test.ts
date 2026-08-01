/**
 * @jest-environment node
 */
import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/proxy'

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
  })),
}))

const mockedCreateServerClient = createServerClient as jest.Mock

describe('updateSession', () => {
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

  it('returns a response and refreshes the user', async () => {
    const request = new NextRequest('http://localhost:3000/stores')

    const response = await updateSession(request)

    expect(response).toBeDefined()
    const client = mockedCreateServerClient.mock.results[0].value
    expect(client.auth.getUser).toHaveBeenCalled()
  })

  it('reads cookies from the request via getAll', async () => {
    const request = new NextRequest('http://localhost:3000/stores')
    request.cookies.set('sb-token', 'abc')

    await updateSession(request)
    const { cookies: handlers } = mockedCreateServerClient.mock.calls[0][2]

    expect(handlers.getAll()).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'sb-token' })])
    )
  })

  it('writes refreshed cookies onto the response via setAll', async () => {
    const request = new NextRequest('http://localhost:3000/stores')

    await updateSession(request)
    const { cookies: handlers } = mockedCreateServerClient.mock.calls[0][2]
    handlers.setAll([{ name: 'sb-token', value: 'refreshed', options: { path: '/' } }], {})

    expect(request.cookies.get('sb-token')?.value).toBe('refreshed')
  })

  it('copies headers supplied by setAll onto the returned response', async () => {
    // Supabase calls setAll from inside getUser(), which is the only path where
    // the reassigned response actually reaches the caller.
    mockedCreateServerClient.mockImplementationOnce((_url, _key, options) => ({
      auth: {
        getUser: jest.fn().mockImplementation(async () => {
          options.cookies.setAll(
            [{ name: 'sb-token', value: 'refreshed', options: { path: '/' } }],
            { 'x-supabase-test': 'applied' }
          )
          return { data: { user: null } }
        }),
      },
    }))

    const response = await updateSession(new NextRequest('http://localhost:3000/stores'))

    expect(response.headers.get('x-supabase-test')).toBe('applied')
    expect(response.cookies.get('sb-token')?.value).toBe('refreshed')
  })

  it('tolerates setAll being called without headers', async () => {
    const request = new NextRequest('http://localhost:3000/stores')

    await updateSession(request)
    const { cookies: handlers } = mockedCreateServerClient.mock.calls[0][2]

    expect(() =>
      handlers.setAll([{ name: 'sb-token', value: 'no-headers', options: {} }])
    ).not.toThrow()
    expect(request.cookies.get('sb-token')?.value).toBe('no-headers')
  })

  it('throws a named error when the url is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const request = new NextRequest('http://localhost:3000/stores')

    await expect(updateSession(request)).rejects.toThrow('NEXT_PUBLIC_SUPABASE_URL')
  })
})
