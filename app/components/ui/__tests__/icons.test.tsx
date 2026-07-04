import React from 'react'
import { render, screen } from '@/lib/test-utils'
import { UserIcon } from '../icons'

describe('UserIcon', () => {
  it('renders an svg element', () => {
    const { container } = render(<UserIcon />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('has aria-hidden attribute', () => {
    const { container } = render(<UserIcon />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
