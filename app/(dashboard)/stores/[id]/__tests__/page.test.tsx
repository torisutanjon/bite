import React from 'react'
import { render, screen } from '@/lib/test-utils'
import RestaurantDetailPage from '../page'

describe('RestaurantDetailPage', () => {
  it('renders the restaurant name', async () => {
    const element = await RestaurantDetailPage({ params: Promise.resolve({ id: 'test-restaurant' }) })
    render(element)
    expect(screen.getByText('The Urban Bistro & Grill')).toBeInTheDocument()
  })

  it('renders the menu tabs', async () => {
    const element = await RestaurantDetailPage({ params: Promise.resolve({ id: 'test-restaurant' }) })
    render(element)
    expect(screen.getByRole('button', { name: 'Appetizers' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mains' })).toBeInTheDocument()
  })

  it('renders the order sidebar', async () => {
    const element = await RestaurantDetailPage({ params: Promise.resolve({ id: 'test-restaurant' }) })
    render(element)
    expect(screen.getByText('Your Order')).toBeInTheDocument()
  })
})
