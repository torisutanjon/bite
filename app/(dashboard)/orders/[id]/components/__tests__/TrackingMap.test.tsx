import React from 'react'
import { render, screen } from '@/lib/test-utils'
import TrackingMap from '../TrackingMap'

describe('TrackingMap', () => {
  it('renders map image with correct alt text', () => {
    render(<TrackingMap />)
    expect(screen.getByAltText('Live delivery map')).toBeInTheDocument()
  })

  it('renders the rider bubble with name', () => {
    render(<TrackingMap />)
    expect(screen.getByText('Marco')).toBeInTheDocument()
  })

  it('renders the ETA text in rider bubble', () => {
    render(<TrackingMap />)
    expect(screen.getByText('is 6 min away')).toBeInTheDocument()
  })

  it('renders zoom controls', () => {
    render(<TrackingMap />)
    expect(screen.getByText('+')).toBeInTheDocument()
    expect(screen.getByText('−')).toBeInTheDocument()
  })
})
