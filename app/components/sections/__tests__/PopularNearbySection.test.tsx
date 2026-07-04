import React from 'react'
import { render, screen } from '@/lib/test-utils'
import PopularNearbySection from '../PopularNearbySection'

describe('PopularNearbySection', () => {
  it('renders the section heading', () => {
    render(<PopularNearbySection />)
    expect(screen.getByText('Popular Nearby')).toBeInTheDocument()
  })
})
