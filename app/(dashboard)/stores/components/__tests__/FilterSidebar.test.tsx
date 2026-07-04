import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import FilterSidebar from '../FilterSidebar'

describe('FilterSidebar', () => {
  it('renders all five category labels', () => {
    render(<FilterSidebar />)
    expect(screen.getByText('All Cuisines')).toBeInTheDocument()
    expect(screen.getByText('Burgers')).toBeInTheDocument()
    expect(screen.getByText('Sushi')).toBeInTheDocument()
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.getByText('Desserts')).toBeInTheDocument()
  })

  it('renders three price range buttons', () => {
    render(<FilterSidebar />)
    expect(screen.getByRole('button', { name: '$' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$$' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$$$' })).toBeInTheDocument()
  })

  it('renders rating checkboxes', () => {
    render(<FilterSidebar />)
    expect(screen.getByText(/4\.5\+ Very Good/)).toBeInTheDocument()
    expect(screen.getByText(/4\.0\+ Good/)).toBeInTheDocument()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2)
  })

  it('renders delivery time section', () => {
    render(<FilterSidebar />)
    expect(screen.getByText('Delivery Time')).toBeInTheDocument()
    expect(screen.getByText(/45 min/)).toBeInTheDocument()
  })

  it('clicking a category selects it', async () => {
    const user = userEvent.setup()
    render(<FilterSidebar />)
    await user.click(screen.getByText('Burgers'))
    // Burgers row should now have the active bg-brand class
    const burgersRow = screen.getByText('Burgers').closest('.cursor-pointer')
    expect(burgersRow).toHaveClass('bg-brand')
  })

  it('clicking a price range button selects it', async () => {
    const user = userEvent.setup()
    render(<FilterSidebar />)
    await user.click(screen.getByRole('button', { name: '$' }))
    expect(screen.getByRole('button', { name: '$' })).toHaveClass('rt-variant-solid')
  })
})
