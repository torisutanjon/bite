import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import PaymentMethodSection from '../PaymentMethodSection'

describe('PaymentMethodSection', () => {
  it('renders the Payment Method heading', () => {
    render(<PaymentMethodSection />)
    expect(screen.getByText('Payment Method')).toBeInTheDocument()
  })

  it('renders all three payment options', () => {
    render(<PaymentMethodSection />)
    expect(screen.getByText('Credit Card')).toBeInTheDocument()
    expect(screen.getByText('Apple Pay')).toBeInTheDocument()
    expect(screen.getByText('PayPal')).toBeInTheDocument()
  })

  it('shows masked credit card number for the credit card option', () => {
    render(<PaymentMethodSection />)
    expect(screen.getByText(/•••• •••• •••• 4242/)).toBeInTheDocument()
  })

  it('clicking a method does not crash', async () => {
    const user = userEvent.setup()
    render(<PaymentMethodSection />)
    await user.click(screen.getByText('Apple Pay'))
    await user.click(screen.getByText('PayPal'))
    expect(screen.getByText('Payment Method')).toBeInTheDocument()
  })
})
