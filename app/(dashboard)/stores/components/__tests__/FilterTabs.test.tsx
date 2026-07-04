import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import FilterTabs from '../FilterTabs'

describe('FilterTabs', () => {
  it('renders all four tab buttons', () => {
    render(<FilterTabs />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fast Delivery' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Top Rated' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Under $10' })).toBeInTheDocument()
  })

  it('All is active by default (solid variant)', () => {
    render(<FilterTabs />)
    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('rt-variant-solid')
    expect(screen.getByRole('button', { name: 'Fast Delivery' })).toHaveClass('rt-variant-outline')
  })

  it('clicking a tab makes it active', async () => {
    const user = userEvent.setup()
    render(<FilterTabs />)
    await user.click(screen.getByRole('button', { name: 'Top Rated' }))
    expect(screen.getByRole('button', { name: 'Top Rated' })).toHaveClass('rt-variant-solid')
    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('rt-variant-outline')
  })
})
