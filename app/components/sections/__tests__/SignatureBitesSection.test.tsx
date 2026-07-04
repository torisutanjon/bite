import React from 'react'
import { render, screen } from '@/lib/test-utils'
import SignatureBitesSection from '../SignatureBitesSection'

describe('SignatureBitesSection', () => {
  it('renders the section heading', () => {
    render(<SignatureBitesSection />)
    expect(screen.getByText('Signature Bites')).toBeInTheDocument()
  })
})
