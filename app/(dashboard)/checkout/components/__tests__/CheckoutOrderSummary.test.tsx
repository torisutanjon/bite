import React from 'react'
import { render, screen } from '@/lib/test-utils'
import CheckoutOrderSummary from '../CheckoutOrderSummary'

describe('CheckoutOrderSummary', () => {
  it('renders the Your Order heading', () => {
    render(<CheckoutOrderSummary />)
    expect(screen.getByText('Your Order')).toBeInTheDocument()
  })

  it('renders all order item names', () => {
    render(<CheckoutOrderSummary />)
    expect(screen.getByText('Truffle Umami Burger')).toBeInTheDocument()
    expect(screen.getByText('Superfood Kale Salad')).toBeInTheDocument()
    expect(screen.getByText('House Ginger Ale')).toBeInTheDocument()
  })

  it('renders item modifiers', () => {
    render(<CheckoutOrderSummary />)
    expect(screen.getByText('x1 · Extra Cheese')).toBeInTheDocument()
    expect(screen.getByText('x1 · Balsamic Vinaigrette')).toBeInTheDocument()
    expect(screen.getByText('x2 · With Ice')).toBeInTheDocument()
  })

  it('shows FREE delivery', () => {
    render(<CheckoutOrderSummary />)
    expect(screen.getByText('FREE')).toBeInTheDocument()
  })

  it('shows correct subtotal and total', () => {
    render(<CheckoutOrderSummary />)
    expect(screen.getByText('$41.50')).toBeInTheDocument()
    expect(screen.getByText('$43.99')).toBeInTheDocument()
  })

  it('renders Place Order button', () => {
    render(<CheckoutOrderSummary />)
    expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument()
  })
})
