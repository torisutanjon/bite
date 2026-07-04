import React from 'react'
import { render, screen, fireEvent } from '@/lib/test-utils'
import EmailInput from '../EmailInput'

describe('EmailInput', () => {
  it('renders with default placeholder', () => {
    render(<EmailInput value="" onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<EmailInput value="" onChange={jest.fn()} placeholder="your@email.com" />)
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
  })

  it('displays error message when error prop is provided', () => {
    render(<EmailInput value="" onChange={jest.fn()} error="Invalid email" />)
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })

  it('does not display error message when error is empty', () => {
    render(<EmailInput value="" onChange={jest.fn()} />)
    expect(screen.queryByText('Invalid email')).not.toBeInTheDocument()
  })

  it('calls onChange with new value when user types', () => {
    const onChange = jest.fn()
    render(<EmailInput value="" onChange={onChange} />)
    const input = screen.getByPlaceholderText('name@example.com')
    fireEvent.change(input, { target: { value: 'test@test.com' } })
    expect(onChange).toHaveBeenCalledWith('test@test.com')
  })
})
