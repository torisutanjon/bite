import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import CartOrderSummary from '../CartOrderSummary'

describe('CartOrderSummary', () => {
  it('renders the Order Summary heading', () => {
    render(<CartOrderSummary />)
    expect(screen.getByText('Order Summary')).toBeInTheDocument()
  })

  it('renders line items with correct amounts', () => {
    render(<CartOrderSummary />)
    expect(screen.getByText('$46.90')).toBeInTheDocument()
    expect(screen.getByText('$2.99')).toBeInTheDocument()
    expect(screen.getByText('$4.25')).toBeInTheDocument()
  })

  it('renders total amount', () => {
    render(<CartOrderSummary />)
    expect(screen.getByText('$54.14')).toBeInTheDocument()
  })

  it('renders promo code input', () => {
    render(<CartOrderSummary />)
    expect(screen.getByPlaceholderText(/promo code/i)).toBeInTheDocument()
  })

  it('updates promo code input value on type', async () => {
    const user = userEvent.setup()
    render(<CartOrderSummary />)
    const input = screen.getByPlaceholderText(/promo code/i)
    await user.type(input, 'SAVE10')
    expect(input).toHaveValue('SAVE10')
  })

  it('renders Proceed to Checkout button linking to /checkout', () => {
    render(<CartOrderSummary />)
    const link = screen.getByRole('link', { name: /proceed to checkout/i })
    expect(link).toHaveAttribute('href', '/checkout')
  })

  it('renders Priority Delivery info', () => {
    render(<CartOrderSummary />)
    expect(screen.getByText('Priority Delivery')).toBeInTheDocument()
    expect(screen.getByText(/arriving in/i)).toBeInTheDocument()
  })
})
