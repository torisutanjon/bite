import React from 'react'
import { render, screen } from '@/lib/test-utils'
import SettingsSidebar from '../SettingsSidebar'

describe('SettingsSidebar', () => {
  it('renders user name and greeting', () => {
    render(<SettingsSidebar activePage="profile" />)
    expect(screen.getByText('Alex Chen')).toBeInTheDocument()
    expect(screen.getByText('Welcome Back,')).toBeInTheDocument()
  })

  it('renders all navigation labels', () => {
    render(<SettingsSidebar activePage="profile" />)
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Addresses')).toBeInTheDocument()
    expect(screen.getByText('Payments')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('renders nav links with correct hrefs', () => {
    render(<SettingsSidebar activePage="profile" />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/profile')
    expect(hrefs).toContain('/profile/security')
    expect(hrefs).toContain('/profile/addresses')
    expect(hrefs).toContain('/profile/payments')
    expect(hrefs).toContain('/profile/notifications')
  })

  it('applies bold weight to active page label', () => {
    render(<SettingsSidebar activePage="security" />)
    const securityText = screen.getByText('Security')
    expect(securityText).toHaveClass('rt-r-weight-bold')
  })
})
