import React from 'react'
import { render, screen } from '@/lib/test-utils'
import DeliveryPanel from '../DeliveryPanel'

describe('DeliveryPanel', () => {
  it('renders the Estimated Delivery label', () => {
    render(<DeliveryPanel />)
    expect(screen.getByText(/estimated delivery/i)).toBeInTheDocument()
  })

  it('renders delivery time estimate', () => {
    render(<DeliveryPanel />)
    expect(screen.getByText(/12.18 mins/i)).toBeInTheDocument()
  })

  it('renders driver name Marco Rossi', () => {
    render(<DeliveryPanel />)
    expect(screen.getByText('Marco Rossi')).toBeInTheDocument()
  })

  it('renders driver rating and delivery count', () => {
    render(<DeliveryPanel />)
    expect(screen.getByText(/4\.9.*1,200/)).toBeInTheDocument()
  })

  it('renders vehicle type', () => {
    render(<DeliveryPanel />)
    expect(screen.getByText('Electric e-Bike')).toBeInTheDocument()
  })

  it('renders Live Chat button', () => {
    render(<DeliveryPanel />)
    expect(screen.getByRole('button', { name: /live chat/i })).toBeInTheDocument()
  })

  it('renders order items', () => {
    render(<DeliveryPanel />)
    expect(screen.getByText('1x Truffle Burger Deluxe')).toBeInTheDocument()
    expect(screen.getByText('1x Parmesan Fries')).toBeInTheDocument()
  })

  it('renders total amount', () => {
    render(<DeliveryPanel />)
    expect(screen.getByText('$25.40')).toBeInTheDocument()
  })
})
