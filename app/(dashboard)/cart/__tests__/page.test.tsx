import React from 'react'
import { render, screen } from '@/lib/test-utils'
import CartPage from '../page'

describe('CartPage', () => {
  it('renders the cart heading', () => {
    render(<CartPage />)
    expect(screen.getByText(/your cart/i)).toBeInTheDocument()
  })

  it('renders Order Summary section', () => {
    render(<CartPage />)
    expect(screen.getByText('Order Summary')).toBeInTheDocument()
  })

  it('renders Pairs well with section', () => {
    render(<CartPage />)
    expect(screen.getByText(/pairs well with/i)).toBeInTheDocument()
  })
})
