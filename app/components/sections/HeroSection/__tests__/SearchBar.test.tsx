import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}))

import SearchBar from '../SearchBar'

describe('SearchBar', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders a search input', () => {
    render(<SearchBar />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('updates input as user types', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'pizza')
    expect(input).toHaveValue('pizza')
  })

  it('renders a find food button', () => {
    render(<SearchBar />)
    expect(screen.getByRole('button', { name: /find food/i })).toBeInTheDocument()
  })

  it('navigates to stores on button click with address', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    await user.type(screen.getByRole('textbox'), 'London')
    await user.click(screen.getByRole('button', { name: /find food/i }))
    expect(mockPush).toHaveBeenCalledWith('/stores?address=London')
  })
})
