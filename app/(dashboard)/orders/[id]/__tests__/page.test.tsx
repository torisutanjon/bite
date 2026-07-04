import React from 'react'
import { render, screen } from '@/lib/test-utils'
import OrderTrackingPage from '../page'

describe('OrderTrackingPage', () => {
  it('renders the order progress stepper with orderId', async () => {
    const element = await OrderTrackingPage({ params: Promise.resolve({ id: 'ORD-123' }) })
    render(element)
    expect(screen.getByText(/order tracking #ORD-123/i)).toBeInTheDocument()
  })

  it('renders Live Tracking label', async () => {
    const element = await OrderTrackingPage({ params: Promise.resolve({ id: 'ORD-123' }) })
    render(element)
    expect(screen.getByText('Live Tracking')).toBeInTheDocument()
  })

  it('renders the delivery panel with driver name', async () => {
    const element = await OrderTrackingPage({ params: Promise.resolve({ id: 'ORD-123' }) })
    render(element)
    expect(screen.getByText('Marco Rossi')).toBeInTheDocument()
  })
})
