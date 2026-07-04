import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import SignUpForm from '../SignUpForm'

describe('SignUpForm', () => {
  it('renders all form inputs', () => {
    render(<SignUpForm />)
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('+1 (555) 000-0000')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renders Create Account submit button', () => {
    render(<SignUpForm />)
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('renders terms agreement checkbox', () => {
    render(<SignUpForm />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('renders Terms of Service and Privacy Policy links', () => {
    render(<SignUpForm />)
    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument()
  })

  it('renders Log in link for existing users', () => {
    render(<SignUpForm />)
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/auth/login')
  })

  it('renders Google and Apple SSO buttons', () => {
    render(<SignUpForm />)
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /apple/i })).toBeInTheDocument()
  })

  it('shows agree error on submit when terms not accepted', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)
    await user.type(screen.getByPlaceholderText('name@company.com'), 'valid@test.com')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByText(/must agree to the terms/i)).toBeInTheDocument()
  })

  it('shows email validation error on blur with invalid email', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)
    const emailInput = screen.getByPlaceholderText('name@company.com')
    await user.type(emailInput, 'bad-email')
    await user.tab()
    expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
  })

  it('checks and unchecks terms checkbox', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    expect(checkbox).toHaveAttribute('data-state', 'checked')
    await user.click(checkbox)
    expect(checkbox).toHaveAttribute('data-state', 'unchecked')
  })

  it('shows phone validation error on blur with invalid phone', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)
    const phoneInput = screen.getByPlaceholderText('+1 (555) 000-0000')
    await user.type(phoneInput, 'abc')
    await user.tab()
    expect(screen.getByText(/valid phone number/i)).toBeInTheDocument()
  })

  it('clears phone error when valid phone entered', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)
    const phoneInput = screen.getByPlaceholderText('+1 (555) 000-0000')
    await user.type(phoneInput, 'abc')
    await user.tab()
    await user.clear(phoneInput)
    await user.type(phoneInput, '+1 (555) 123-4567')
    await user.tab()
    expect(screen.queryByText(/valid phone number/i)).not.toBeInTheDocument()
  })

  it('shows email error on submit and no agree error when terms are checked', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)
    // Check the terms — this exercises the else branch of !agreed
    await user.click(screen.getByRole('checkbox'))
    // Submit without email — only email error shows
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByText(/valid email address/i)).toBeInTheDocument()
    expect(screen.queryByText(/must agree to the terms/i)).not.toBeInTheDocument()
  })
})
