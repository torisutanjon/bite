import React from 'react'
import { render, screen } from '@/lib/test-utils'

jest.mock('../SearchBar', () => ({
  __esModule: true,
  default: function MockSearchBar() { return null },
}))

import HeroSection from '../index'

describe('HeroSection', () => {
  it('renders the hero heading', () => {
    render(<HeroSection />)
    expect(screen.getByText(/hunger fulfilled/i)).toBeInTheDocument()
  })

  it('renders the eyebrow label', () => {
    render(<HeroSection />)
    expect(screen.getByText(/order in minutes/i)).toBeInTheDocument()
  })
})
