import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import CartItems from '../CartItems'

describe('CartItems', () => {
  it('renders the cart heading', () => {
    render(<CartItems />)
    expect(screen.getByText('(3 Items)')).toBeInTheDocument()
  })

  it('renders all initial cart item names', () => {
    render(<CartItems />)
    expect(screen.getByText('Truffle Umami Burger')).toBeInTheDocument()
    expect(screen.getByText('Zesty Quinoa Power Bowl')).toBeInTheDocument()
  })

  it('renders item modifiers', () => {
    render(<CartItems />)
    expect(screen.getByText('Extra Swiss Cheese, No Pickles')).toBeInTheDocument()
    expect(screen.getByText('Tahini Dressing')).toBeInTheDocument()
  })

  it('disables decrease button when quantity is 1', () => {
    render(<CartItems />)
    const decreaseButtons = screen.getAllByRole('button', { name: /decrease quantity/i })
    expect(decreaseButtons[0]).toBeDisabled()
    expect(decreaseButtons[1]).not.toBeDisabled()
  })

  it('increases quantity when + button is clicked', async () => {
    const user = userEvent.setup()
    render(<CartItems />)
    const increaseButtons = screen.getAllByRole('button', { name: /increase quantity/i })
    await user.click(increaseButtons[0])
    expect(screen.getByText('(4 Items)')).toBeInTheDocument()
  })

  it('decreases quantity of a multi-qty item', async () => {
    const user = userEvent.setup()
    render(<CartItems />)
    const decreaseButtons = screen.getAllByRole('button', { name: /decrease quantity/i })
    await user.click(decreaseButtons[1])
    expect(screen.getByText('(2 Items)')).toBeInTheDocument()
  })

  it('clears all items when Clear Cart is clicked', async () => {
    const user = userEvent.setup()
    render(<CartItems />)
    await user.click(screen.getByRole('button', { name: /clear cart/i }))
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
    expect(screen.getByText('(0 Items)')).toBeInTheDocument()
  })
})
