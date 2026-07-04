import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}))

import NavSearch from '../NavSearch'

describe('NavSearch', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders search input', () => {
    render(<NavSearch />)
    expect(screen.getByRole('textbox', { name: /search restaurants/i })).toBeInTheDocument()
  })

  it('updates input value as user types', async () => {
    const user = userEvent.setup()
    render(<NavSearch />)
    const input = screen.getByRole('textbox', { name: /search restaurants/i })
    await user.type(input, 'sushi')
    expect(input).toHaveValue('sushi')
  })

  it('navigates to stores search on Enter key', async () => {
    const user = userEvent.setup()
    render(<NavSearch />)
    const input = screen.getByRole('textbox', { name: /search restaurants/i })
    await user.type(input, 'sushi')
    await user.keyboard('{Enter}')
    expect(mockPush).toHaveBeenCalledWith('/stores?q=sushi')
  })

  it('does not navigate on Enter when input is empty', async () => {
    const user = userEvent.setup()
    render(<NavSearch />)
    const input = screen.getByRole('textbox', { name: /search restaurants/i })
    await user.click(input)
    await user.keyboard('{Enter}')
    expect(mockPush).not.toHaveBeenCalled()
  })
})
