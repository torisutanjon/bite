import React from 'react'
import { render, screen } from '@/lib/test-utils'
import AccountSidebar from '../AccountSidebar'

describe('AccountSidebar', () => {
  it('renders all navigation labels', () => {
    render(<AccountSidebar activePage="orders" />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Past Orders')).toBeInTheDocument()
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Wallet')).toBeInTheDocument()
    expect(screen.getByText('Support')).toBeInTheDocument()
  })

  it('renders the user greeting', () => {
    render(<AccountSidebar activePage="home" />)
    expect(screen.getByText('Welcome Back,')).toBeInTheDocument()
    expect(screen.getByText('Ready to eat?')).toBeInTheDocument()
  })

  it('renders Order Now button linking to /stores', () => {
    render(<AccountSidebar activePage="orders" />)
    const link = screen.getByRole('link', { name: /order now/i })
    expect(link).toHaveAttribute('href', '/stores')
  })

  it('applies active styling to the active page item', () => {
    render(<AccountSidebar activePage="orders" />)
    const ordersText = screen.getByText('Past Orders')
    expect(ordersText).toHaveClass('rt-r-weight-bold')
  })

  it('renders navigation links with correct hrefs', () => {
    render(<AccountSidebar activePage="home" />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/orders')
    expect(hrefs).toContain('/favorites')
    expect(hrefs).toContain('/wallet')
    expect(hrefs).toContain('/support')
  })
})
