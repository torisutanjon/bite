import React from 'react'
import { render, screen } from '@/lib/test-utils'
import FeaturesSection from '../FeaturesSection'

describe('FeaturesSection', () => {
  it('renders the section heading', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Simple, Fast, Delicious')).toBeInTheDocument()
  })

  it('renders all three feature titles', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Discover Your Craving')).toBeInTheDocument()
    expect(screen.getByText('Seamless Checkout')).toBeInTheDocument()
    expect(screen.getByText('Lightning Delivery')).toBeInTheDocument()
  })

  it('renders the eyebrow label', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('How it works')).toBeInTheDocument()
  })
})
