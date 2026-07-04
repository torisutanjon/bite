import React from 'react'
import { render, screen } from '@/lib/test-utils'
import GuestExperiences from '../GuestExperiences'

describe('GuestExperiences', () => {
  it('renders the Guest Experiences heading', () => {
    render(<GuestExperiences />)
    expect(screen.getByText('Guest Experiences')).toBeInTheDocument()
  })

  it('renders reviewer names', () => {
    render(<GuestExperiences />)
    expect(screen.getByText('Sarah J.')).toBeInTheDocument()
    expect(screen.getByText('Michael Chen')).toBeInTheDocument()
  })

  it('renders reviewer avatar images', () => {
    render(<GuestExperiences />)
    expect(screen.getByAltText('Sarah J.')).toBeInTheDocument()
    expect(screen.getByAltText('Michael Chen')).toBeInTheDocument()
  })

  it('renders review content excerpts', () => {
    render(<GuestExperiences />)
    expect(screen.getByText(/wagyu burger was absolutely divine/i)).toBeInTheDocument()
    expect(screen.getByText(/excellent scallops/i)).toBeInTheDocument()
  })
})
