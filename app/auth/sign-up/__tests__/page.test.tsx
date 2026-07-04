import React from 'react'
import { render, screen } from '@/lib/test-utils'
import SignUpPage from '../page'

describe('SignUpPage', () => {
  it('renders Create your account heading', () => {
    render(<SignUpPage />)
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })

  it('renders BiteDash brand heading', () => {
    render(<SignUpPage />)
    expect(screen.getByText('BiteDash')).toBeInTheDocument()
  })

  it('renders the sign up form', () => {
    render(<SignUpPage />)
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })
})
