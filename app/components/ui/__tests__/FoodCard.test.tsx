import React from 'react'
import { render, screen } from '@/lib/test-utils'
import FoodCard from '../FoodCard'

const defaultProps = {
  name: 'Truffle Burger',
  restaurant: 'The Grill House',
  image: 'https://example.com/burger.jpg',
}

describe('FoodCard', () => {
  it('renders the food name', () => {
    render(<FoodCard {...defaultProps} />)
    expect(screen.getByText('Truffle Burger')).toBeInTheDocument()
  })

  it('renders the restaurant name', () => {
    render(<FoodCard {...defaultProps} />)
    expect(screen.getByText('The Grill House')).toBeInTheDocument()
  })

  it('renders image with correct alt text', () => {
    render(<FoodCard {...defaultProps} />)
    expect(screen.getByRole('img', { name: 'Truffle Burger' })).toBeInTheDocument()
  })

  it('renders badge when provided', () => {
    render(<FoodCard {...defaultProps} badge="NEW" />)
    expect(screen.getByText('NEW')).toBeInTheDocument()
  })

  it('does not render badge when not provided', () => {
    render(<FoodCard {...defaultProps} />)
    expect(screen.queryByText('NEW')).not.toBeInTheDocument()
  })
})
