import React from 'react'
import { render, screen } from '@/lib/test-utils'
import RestaurantCard from '../RestaurantCard'

const defaultProps = {
  name: 'Sakura Japanese',
  cuisine: 'Japanese',
  rating: 4.8,
  deliveryTime: '25–35 min',
  image: 'https://example.com/sakura.jpg',
}

describe('RestaurantCard', () => {
  it('renders the restaurant name', () => {
    render(<RestaurantCard {...defaultProps} />)
    expect(screen.getByText('Sakura Japanese')).toBeInTheDocument()
  })

  it('renders cuisine type', () => {
    render(<RestaurantCard {...defaultProps} />)
    expect(screen.getByText('Japanese')).toBeInTheDocument()
  })

  it('renders the rating', () => {
    render(<RestaurantCard {...defaultProps} />)
    expect(screen.getByText('4.8')).toBeInTheDocument()
  })

  it('renders delivery time', () => {
    render(<RestaurantCard {...defaultProps} />)
    expect(screen.getByText('25–35 min')).toBeInTheDocument()
  })

  it('renders badge when provided', () => {
    render(<RestaurantCard {...defaultProps} badge="PROMOTED" />)
    expect(screen.getByText('PROMOTED')).toBeInTheDocument()
  })

  it('renders image with correct alt text', () => {
    render(<RestaurantCard {...defaultProps} />)
    expect(screen.getByRole('img', { name: 'Sakura Japanese' })).toBeInTheDocument()
  })
})
