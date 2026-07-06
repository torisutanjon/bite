import React from 'react'
import { render, screen } from '@/lib/test-utils'
import Navbar from '../Navbar'

describe('Navbar', () => {
  it('renders the BiteDash logo', () => {
    render(<Navbar />)
    expect(screen.getByText('BiteDash')).toBeInTheDocument()
  })

  it('renders Stores nav link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /stores/i })).toBeInTheDocument()
  })

  it('renders Orders nav link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument()
  })

  it('renders cart link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /cart/i })).toBeInTheDocument()
  })

  it('renders profile link', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('renders the mobile menu button', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
  })
})
