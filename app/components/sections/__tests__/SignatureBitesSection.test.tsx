import React from 'react'
import { render, screen } from '@/lib/test-utils'
import SignatureBitesSection from '../SignatureBitesSection'

describe('SignatureBitesSection', () => {
  it('renders the section heading', () => {
    render(<SignatureBitesSection />)
    expect(screen.getByText('Signature Bites')).toBeInTheDocument()
  })

  it('renders the eyebrow label', () => {
    render(<SignatureBitesSection />)
    expect(screen.getByText("Chef's picks")).toBeInTheDocument()
  })
})
