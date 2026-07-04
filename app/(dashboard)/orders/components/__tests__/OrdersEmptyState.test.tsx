import React from 'react'
import { render, screen } from '@/lib/test-utils'
import OrdersEmptyState from '../OrdersEmptyState'

describe('OrdersEmptyState', () => {
  it('renders the No orders yet heading', () => {
    render(<OrdersEmptyState />)
    expect(screen.getByText('No orders yet')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<OrdersEmptyState />)
    expect(screen.getByText(/your kitchen table is waiting/i)).toBeInTheDocument()
  })

  it('renders Browse Restaurants button linking to /stores', () => {
    render(<OrdersEmptyState />)
    const link = screen.getByRole('link', { name: /browse restaurants/i })
    expect(link).toHaveAttribute('href', '/stores')
  })

  it('renders all four category labels', () => {
    render(<OrdersEmptyState />)
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.getByText('Burgers')).toBeInTheDocument()
    expect(screen.getByText('Asian')).toBeInTheDocument()
    expect(screen.getByText('Desserts')).toBeInTheDocument()
  })

  it('renders category subtitles', () => {
    render(<OrdersEmptyState />)
    expect(screen.getByText('24 Local spots')).toBeInTheDocument()
    expect(screen.getByText('18 Near you')).toBeInTheDocument()
  })

  it('renders the Hungry tooltip text', () => {
    render(<OrdersEmptyState />)
    expect(screen.getByText('Hungry?')).toBeInTheDocument()
  })
})
