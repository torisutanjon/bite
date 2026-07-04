import React from 'react'
import { render, screen } from '@/lib/test-utils'
import SettingsPage from '../page'

describe('SettingsPage (Profile)', () => {
  it('renders Profile Settings heading', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Profile Settings')).toBeInTheDocument()
  })

  it('renders the settings sidebar navigation', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Addresses')).toBeInTheDocument()
  })

  it('renders the Danger Zone section', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Deactivate Account')).toBeInTheDocument()
  })
})
