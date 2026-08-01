import { requireValue } from '@/lib/supabase/env'

describe('requireValue', () => {
  it('returns the value when present', () => {
    expect(requireValue('SOME_VAR', 'a-value')).toBe('a-value')
  })

  it('throws naming the variable when undefined', () => {
    expect(() => requireValue('MISSING_VAR', undefined)).toThrow('MISSING_VAR')
  })

  it('throws when the value is blank', () => {
    expect(() => requireValue('BLANK_VAR', '   ')).toThrow('BLANK_VAR')
  })

  it('points the reader at .env.example', () => {
    expect(() => requireValue('MISSING_VAR', undefined)).toThrow(/\.env\.example/)
  })
})
