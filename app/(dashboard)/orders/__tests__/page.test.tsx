import React from 'react'
import { render, screen } from '@/lib/test-utils'
import OrdersPage from '../page'

describe('OrdersPage', () => {
  it('renders the empty state', () => {
    render(<OrdersPage />)
    expect(screen.getByText('No orders yet')).toBeInTheDocument()
  })

  it('renders the account sidebar navigation', () => {
    render(<OrdersPage />)
    expect(screen.getByText('Past Orders')).toBeInTheDocument()
    expect(screen.getByText('Favorites')).toBeInTheDocument()
  })
})
