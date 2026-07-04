import React from 'react'
import { render, screen } from '@/lib/test-utils'
import FeaturedRestaurantCard from '../FeaturedRestaurantCard'

const defaultProps = {
  name: 'The Gourmet Kitchen',
  description: 'Fine dining experience delivered to your door',
  rating: 4.8,
  deliveryTime: '20–30 min',
  image: 'https://example.com/restaurant.jpg',
}

describe('FeaturedRestaurantCard', () => {
  it('renders the restaurant name', () => {
    render(<FeaturedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('The Gourmet Kitchen')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<FeaturedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('Fine dining experience delivered to your door')).toBeInTheDocument()
  })

  it('renders the rating', () => {
    render(<FeaturedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('4.8')).toBeInTheDocument()
  })

  it('renders the delivery time', () => {
    render(<FeaturedRestaurantCard {...defaultProps} />)
    expect(screen.getByText('20–30 min')).toBeInTheDocument()
  })

  it('renders the restaurant image with correct alt text', () => {
    render(<FeaturedRestaurantCard {...defaultProps} />)
    expect(screen.getByAltText('The Gourmet Kitchen')).toBeInTheDocument()
  })

  it('renders badge when provided', () => {
    render(<FeaturedRestaurantCard {...defaultProps} badge="Promoted" />)
    expect(screen.getByText('Promoted')).toBeInTheDocument()
  })

  it('does not render badge when omitted', () => {
    render(<FeaturedRestaurantCard {...defaultProps} />)
    expect(screen.queryByText('Promoted')).not.toBeInTheDocument()
  })
})
