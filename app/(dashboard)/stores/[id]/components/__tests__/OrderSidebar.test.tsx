import React from 'react'
import { render, screen } from '@/lib/test-utils'
import OrderSidebar from '../OrderSidebar'

describe('OrderSidebar', () => {
  it('renders the Your Order heading', () => {
    render(<OrderSidebar />)
    expect(screen.getByText('Your Order')).toBeInTheDocument()
  })

  it('renders both order items', () => {
    render(<OrderSidebar />)
    expect(screen.getByText(/wagyu burger/i)).toBeInTheDocument()
    expect(screen.getByText(/truffle arancini/i)).toBeInTheDocument()
  })

  it('renders correct item prices', () => {
    render(<OrderSidebar />)
    expect(screen.getByText('$26.00')).toBeInTheDocument()
    expect(screen.getByText('$14.50')).toBeInTheDocument()
  })

  it('renders subtotal and total', () => {
    render(<OrderSidebar />)
    expect(screen.getByText('$40.50')).toBeInTheDocument()
    expect(screen.getByText('$43.49')).toBeInTheDocument()
  })

  it('renders Checkout Now button', () => {
    render(<OrderSidebar />)
    expect(screen.getByRole('button', { name: /checkout now/i })).toBeInTheDocument()
  })

  it('renders the Join Pro banner', () => {
    render(<OrderSidebar />)
    expect(screen.getByText('Join Pro')).toBeInTheDocument()
    expect(screen.getByText(/free delivery/i)).toBeInTheDocument()
  })
})
