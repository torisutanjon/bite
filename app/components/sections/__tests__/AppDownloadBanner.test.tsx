import React from 'react'
import { render, screen } from '@/lib/test-utils'
import AppDownloadBanner from '../AppDownloadBanner'

describe('AppDownloadBanner', () => {
  it('renders the heading', () => {
    render(<AppDownloadBanner />)
    expect(screen.getByText('Dash on the go.')).toBeInTheDocument()
  })

  it('renders app store download buttons', () => {
    render(<AppDownloadBanner />)
    expect(screen.getByRole('button', { name: /app store/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /google play/i })).toBeInTheDocument()
  })
})
