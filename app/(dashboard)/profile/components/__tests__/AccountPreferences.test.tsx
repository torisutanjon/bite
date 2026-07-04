import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import AccountPreferences from '../AccountPreferences'

describe('AccountPreferences', () => {
  it('renders the Account Preferences heading', () => {
    render(<AccountPreferences />)
    expect(screen.getByText('Account Preferences')).toBeInTheDocument()
  })

  it('renders all preference labels', () => {
    render(<AccountPreferences />)
    expect(screen.getByText('Marketing Emails')).toBeInTheDocument()
    expect(screen.getByText('Order Tracking SMS')).toBeInTheDocument()
    expect(screen.getByText('Dark Mode')).toBeInTheDocument()
  })

  it('renders preference descriptions', () => {
    render(<AccountPreferences />)
    expect(screen.getByText(/personalized offers and promotions/i)).toBeInTheDocument()
    expect(screen.getByText(/real-time updates on your delivery/i)).toBeInTheDocument()
    expect(screen.getByText(/toggle light and dark interface/i)).toBeInTheDocument()
  })

  it('renders three toggle switches', () => {
    render(<AccountPreferences />)
    const switches = screen.getAllByRole('switch')
    expect(switches).toHaveLength(3)
  })

  it('Marketing Emails switch is on by default', () => {
    render(<AccountPreferences />)
    const switches = screen.getAllByRole('switch')
    // marketing is index 0, checked by default
    expect(switches[0]).toHaveAttribute('data-state', 'checked')
  })

  it('Dark Mode switch is off by default', () => {
    render(<AccountPreferences />)
    const switches = screen.getAllByRole('switch')
    // darkMode is index 2, unchecked by default
    expect(switches[2]).toHaveAttribute('data-state', 'unchecked')
  })

  it('toggling a switch changes its state', async () => {
    const user = userEvent.setup()
    render(<AccountPreferences />)
    const switches = screen.getAllByRole('switch')
    await user.click(switches[2]) // Dark Mode: off → on
    expect(switches[2]).toHaveAttribute('data-state', 'checked')
  })
})
