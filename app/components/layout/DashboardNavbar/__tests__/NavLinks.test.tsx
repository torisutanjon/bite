import React from 'react'
import { render, screen } from '@/lib/test-utils'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

import { usePathname } from 'next/navigation'
import NavLinks from '../NavLinks'

describe('NavLinks', () => {
  it('renders all three nav links', () => {
    jest.mocked(usePathname).mockReturnValue('/')
    render(<NavLinks />)
    expect(screen.getByRole('link', { name: /browse/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /offers/i })).toBeInTheDocument()
  })

  it('applies active styling to the matching link', () => {
    jest.mocked(usePathname).mockReturnValue('/stores/123')
    render(<NavLinks />)
    const browseLink = screen.getByRole('link', { name: /browse/i })
    expect(browseLink).toHaveClass('border-brand')
  })

  it('does not apply active styling to non-matching links', () => {
    jest.mocked(usePathname).mockReturnValue('/stores')
    render(<NavLinks />)
    const ordersLink = screen.getByRole('link', { name: /orders/i })
    expect(ordersLink).toHaveClass('border-transparent')
  })
})
