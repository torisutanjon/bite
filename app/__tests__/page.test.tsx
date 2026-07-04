import React from 'react'
import { render, screen } from '@/lib/test-utils'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  usePathname: jest.fn(() => '/'),
}))

import LandingPage from '../page'

describe('LandingPage', () => {
  it('renders without crashing', () => {
    render(<LandingPage />)
    // Hero heading from HeroSection
    expect(screen.getByText(/hunger fulfilled/i)).toBeInTheDocument()
  })
})
