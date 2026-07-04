import React from 'react'
import { render, screen } from '@/lib/test-utils'
import LoginPage from '../page'

describe('LoginPage', () => {
  it('renders the Welcome back heading', () => {
    render(<LoginPage />)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('renders the BiteDash brand heading', () => {
    render(<LoginPage />)
    expect(screen.getByText('BiteDash')).toBeInTheDocument()
  })

  it('renders the login form', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})
