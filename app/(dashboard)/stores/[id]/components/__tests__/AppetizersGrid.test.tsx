import React from 'react'
import { render, screen } from '@/lib/test-utils'
import AppetizersGrid from '../AppetizersGrid'

describe('AppetizersGrid', () => {
  it('renders the Appetizers heading', () => {
    render(<AppetizersGrid />)
    expect(screen.getByText('Appetizers')).toBeInTheDocument()
  })

  it('renders both appetizer names', () => {
    render(<AppetizersGrid />)
    expect(screen.getByText('Truffle Arancini')).toBeInTheDocument()
    expect(screen.getByText('Seared Scallops')).toBeInTheDocument()
  })

  it('renders appetizer prices', () => {
    render(<AppetizersGrid />)
    expect(screen.getByText('$14.50')).toBeInTheDocument()
    expect(screen.getByText('$18.00')).toBeInTheDocument()
  })

  it('renders Add to Cart buttons for each item', () => {
    render(<AppetizersGrid />)
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i })
    expect(addButtons).toHaveLength(2)
  })

  it('renders POPULAR badge for Truffle Arancini', () => {
    render(<AppetizersGrid />)
    expect(screen.getByText('POPULAR')).toBeInTheDocument()
  })
})
