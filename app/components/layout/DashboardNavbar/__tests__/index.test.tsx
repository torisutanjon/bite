import React from 'react'
import { render, screen } from '@/lib/test-utils'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/stores'),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}))

import DashboardNavbar from '../index'

describe('DashboardNavbar', () => {
  it('renders the BiteDash logo', () => {
    render(<DashboardNavbar />)
    expect(screen.getByText('BiteDash')).toBeInTheDocument()
  })

  it('renders cart link with aria-label', () => {
    render(<DashboardNavbar />)
    expect(screen.getByRole('link', { name: /cart/i })).toBeInTheDocument()
  })

  it('renders profile link', () => {
    render(<DashboardNavbar />)
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument()
  })

  it('renders location text', () => {
    render(<DashboardNavbar />)
    expect(screen.getByText(/Baker St/i)).toBeInTheDocument()
  })
})
