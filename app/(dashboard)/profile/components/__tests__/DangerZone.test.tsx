import React from 'react'
import { render, screen } from '@/lib/test-utils'
import DangerZone from '../DangerZone'

describe('DangerZone', () => {
  it('renders Deactivate Account heading', () => {
    render(<DangerZone />)
    expect(screen.getByText('Deactivate Account')).toBeInTheDocument()
  })

  it('renders the warning description', () => {
    render(<DangerZone />)
    expect(screen.getByText(/once you delete your account/i)).toBeInTheDocument()
  })

  it('renders Delete Account button', () => {
    render(<DangerZone />)
    expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument()
  })
})
