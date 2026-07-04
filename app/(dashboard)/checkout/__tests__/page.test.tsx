import React from 'react'
import { render, screen } from '@/lib/test-utils'
import CheckoutPage from '../page'

describe('CheckoutPage', () => {
  it('renders the checkout stepper', () => {
    render(<CheckoutPage />)
    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('Payment')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('renders Delivery Address section', () => {
    render(<CheckoutPage />)
    expect(screen.getByText('Delivery Address')).toBeInTheDocument()
  })

  it('renders Your Order summary', () => {
    render(<CheckoutPage />)
    expect(screen.getByText('Your Order')).toBeInTheDocument()
  })
})
