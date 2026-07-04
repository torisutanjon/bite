import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import PasswordInput from '../PasswordInput'

describe('PasswordInput', () => {
  it('renders a password input by default', () => {
    render(<PasswordInput value="" onChange={jest.fn()} />)
    const input = screen.getByPlaceholderText('••••••••')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('shows password as text when show button is clicked', async () => {
    const user = userEvent.setup()
    render(<PasswordInput value="" onChange={jest.fn()} />)
    const toggleButton = screen.getByRole('button', { name: /show password/i })
    await user.click(toggleButton)
    const input = screen.getByPlaceholderText('••••••••')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('hides password again when show button is clicked twice', async () => {
    const user = userEvent.setup()
    render(<PasswordInput value="" onChange={jest.fn()} />)
    const toggleButton = screen.getByRole('button', { name: /show password/i })
    await user.click(toggleButton)
    await user.click(screen.getByRole('button', { name: /hide password/i }))
    const input = screen.getByPlaceholderText('••••••••')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('displays error message when error prop is provided', () => {
    render(<PasswordInput value="" onChange={jest.fn()} error="Too short" />)
    expect(screen.getByText('Too short')).toBeInTheDocument()
  })
})
