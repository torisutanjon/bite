import React from 'react'
import { render, screen } from '@/lib/test-utils'
import MainsList from '../MainsList'

describe('MainsList', () => {
  it('renders the Mains heading', () => {
    render(<MainsList />)
    expect(screen.getByText('Mains')).toBeInTheDocument()
  })

  it('renders both main course names', () => {
    render(<MainsList />)
    expect(screen.getByText('Signature Wagyu Burger')).toBeInTheDocument()
    expect(screen.getByText('Miso Glazed Salmon')).toBeInTheDocument()
  })

  it('renders main course prices', () => {
    render(<MainsList />)
    expect(screen.getByText('$26.00')).toBeInTheDocument()
    expect(screen.getByText('$32.00')).toBeInTheDocument()
  })

  it('renders add to cart icon buttons', () => {
    render(<MainsList />)
    const addButtons = screen.getAllByRole('button', { name: /add.*to cart/i })
    expect(addButtons).toHaveLength(2)
  })

  it('renders item badges', () => {
    render(<MainsList />)
    expect(screen.getByText('Recommended')).toBeInTheDocument()
    expect(screen.getByText('Healthy Choice')).toBeInTheDocument()
  })
})
