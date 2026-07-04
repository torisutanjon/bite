import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import PairsWellWith from '../PairsWellWith'

describe('PairsWellWith', () => {
  it('renders the section heading', () => {
    render(<PairsWellWith />)
    expect(screen.getByText(/pairs well with/i)).toBeInTheDocument()
  })

  it('renders all four recommendation names', () => {
    render(<PairsWellWith />)
    expect(screen.getByText('Cold Brew Coffee')).toBeInTheDocument()
    expect(screen.getByText('Glazed Delight')).toBeInTheDocument()
    expect(screen.getByText('Sweet Potato Fries')).toBeInTheDocument()
    expect(screen.getByText('Fresh Orange Juice')).toBeInTheDocument()
  })

  it('renders prices for recommendations', () => {
    render(<PairsWellWith />)
    expect(screen.getByText('$4.50')).toBeInTheDocument()
    expect(screen.getByText('$3.00')).toBeInTheDocument()
    expect(screen.getByText('$6.50')).toBeInTheDocument()
    expect(screen.getByText('$4.00')).toBeInTheDocument()
  })

  it('shows + Add button for all items initially', () => {
    render(<PairsWellWith />)
    const addButtons = screen.getAllByRole('button', { name: /\+ add/i })
    expect(addButtons).toHaveLength(4)
  })

  it('changes button to Added and disables it after click', async () => {
    const user = userEvent.setup()
    render(<PairsWellWith />)
    const addButtons = screen.getAllByRole('button', { name: /\+ add/i })
    await user.click(addButtons[0])
    const addedButton = screen.getByRole('button', { name: /^added$/i })
    expect(addedButton).toBeDisabled()
  })

  it('only marks the clicked item as added', async () => {
    const user = userEvent.setup()
    render(<PairsWellWith />)
    const addButtons = screen.getAllByRole('button', { name: /\+ add/i })
    await user.click(addButtons[0])
    expect(screen.getAllByRole('button', { name: /\+ add/i })).toHaveLength(3)
  })
})
