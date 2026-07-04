import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import MenuTabs from '../MenuTabs'

describe('MenuTabs', () => {
  it('renders all four menu tabs', () => {
    render(<MenuTabs />)
    expect(screen.getByRole('button', { name: 'Appetizers' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mains' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Drinks' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Desserts' })).toBeInTheDocument()
  })

  it('Appetizers is active by default (solid variant)', () => {
    render(<MenuTabs />)
    expect(screen.getByRole('button', { name: 'Appetizers' })).toHaveClass('rt-variant-solid')
    expect(screen.getByRole('button', { name: 'Mains' })).toHaveClass('rt-variant-soft')
  })

  it('clicking a tab makes it active', async () => {
    const user = userEvent.setup()
    render(<MenuTabs />)
    await user.click(screen.getByRole('button', { name: 'Mains' }))
    expect(screen.getByRole('button', { name: 'Mains' })).toHaveClass('rt-variant-solid')
    expect(screen.getByRole('button', { name: 'Appetizers' })).toHaveClass('rt-variant-soft')
  })
})
