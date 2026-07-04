import React from 'react'
import { render, screen } from '@/lib/test-utils'
import OrderProgressStepper from '../OrderProgressStepper'

describe('OrderProgressStepper', () => {
  it('renders the order tracking ID in the header', () => {
    render(<OrderProgressStepper orderId="ORD-42" />)
    expect(screen.getByText(/order tracking #ORD-42/i)).toBeInTheDocument()
  })

  it('renders Live Tracking label', () => {
    render(<OrderProgressStepper orderId="ORD-42" />)
    expect(screen.getByText('Live Tracking')).toBeInTheDocument()
  })

  it('renders all four step labels', () => {
    render(<OrderProgressStepper orderId="ORD-42" />)
    expect(screen.getByText('Order Received')).toBeInTheDocument()
    expect(screen.getByText('Preparing')).toBeInTheDocument()
    expect(screen.getByText('Out for Delivery')).toBeInTheDocument()
    expect(screen.getByText('Arrived')).toBeInTheDocument()
  })
})
