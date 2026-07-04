import React from 'react'
import { render, screen } from '@/lib/test-utils'
import FeedRestaurantCard from '../FeedRestaurantCard'

const defaultProps = {
  name: 'Burger Palace',
  cuisine: 'American',
  rating: 4.5,
  deliveryTime: '20–30 min',
  priceLevel: 2,
  image: 'https://example.com/burger-palace.jpg',
}

describe('FeedRestaurantCard', () => {
  it('renders the restaurant name', () => {
    render(<FeedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('Burger Palace')).toBeInTheDocument()
  })

  it('renders cuisine', () => {
    render(<FeedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('American')).toBeInTheDocument()
  })

  it('renders rating', () => {
    render(<FeedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('renders delivery time', () => {
    render(<FeedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('20–30 min')).toBeInTheDocument()
  })

  it('renders save button with accessible label', () => {
    render(<FeedRestaurantCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: /save Burger Palace/i })).toBeInTheDocument()
  })

  it('renders add to cart button', () => {
    render(<FeedRestaurantCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: /add Burger Palace to cart/i })).toBeInTheDocument()
  })

  it('renders badge when provided', () => {
    render(<FeedRestaurantCard {...defaultProps} badge="POPULAR" />)
    expect(screen.getByText('POPULAR')).toBeInTheDocument()
  })
})
