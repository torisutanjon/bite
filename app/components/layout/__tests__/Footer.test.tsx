import React from 'react'
import { render, screen } from '@/lib/test-utils'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders the BiteDash brand name', () => {
    render(<Footer />)
    expect(screen.getAllByText('BiteDash').length).toBeGreaterThanOrEqual(1)
  })

  it('renders company links', () => {
    render(<Footer />)
    expect(screen.getByText('Become a Rider')).toBeInTheDocument()
    expect(screen.getByText('Add your Restaurant')).toBeInTheDocument()
    expect(screen.getByText('About Us')).toBeInTheDocument()
  })

  it('renders support links', () => {
    render(<Footer />)
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Help Center')).toBeInTheDocument()
  })

  it('renders social links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument()
  })

  it('renders copyright text', () => {
    render(<Footer />)
    expect(screen.getByText(/BiteDash Inc\. All rights reserved/i)).toBeInTheDocument()
  })
})
