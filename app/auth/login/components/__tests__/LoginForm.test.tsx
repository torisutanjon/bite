import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import LoginForm from '../LoginForm'

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    render(<LoginForm />)
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renders Sign In submit button', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders Forgot Password link', () => {
    render(<LoginForm />)
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
  })

  it('renders Google and Apple SSO buttons', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /apple/i })).toBeInTheDocument()
  })

  it('renders Sign up link for new users', () => {
    render(<LoginForm />)
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/auth/sign-up')
  })

  it('shows email validation error on blur with invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText('name@example.com')
    await user.type(emailInput, 'not-an-email')
    await user.tab()
    expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
  })

  it('clears email error when valid email is provided', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText('name@example.com')
    await user.type(emailInput, 'not-an-email')
    await user.tab()
    await user.clear(emailInput)
    await user.type(emailInput, 'valid@example.com')
    await user.tab()
    expect(screen.queryByText(/valid email address/i)).not.toBeInTheDocument()
  })

  it('shows email error on submit with invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText('name@example.com')
    await user.type(emailInput, 'bad-email')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
  })
})
