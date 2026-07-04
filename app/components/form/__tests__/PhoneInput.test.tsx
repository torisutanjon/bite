import React from 'react'
import { render, screen } from '@/lib/test-utils'
import PhoneInput from '../PhoneInput'

describe('PhoneInput', () => {
  it('renders with default placeholder', () => {
    render(<PhoneInput value="" onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('+1 (555) 000-0000')).toBeInTheDocument()
  })

  it('renders with tel input type', () => {
    render(<PhoneInput value="" onChange={jest.fn()} id="phone" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel')
  })

  it('displays error message when error prop is provided', () => {
    render(<PhoneInput value="" onChange={jest.fn()} error="Invalid phone number" />)
    expect(screen.getByText('Invalid phone number')).toBeInTheDocument()
  })

  it('does not display error when no error prop', () => {
    render(<PhoneInput value="" onChange={jest.fn()} />)
    expect(screen.queryByText('Invalid phone number')).not.toBeInTheDocument()
  })
})
