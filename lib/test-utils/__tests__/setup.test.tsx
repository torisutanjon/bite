import React from 'react'
import { render, screen } from '@/lib/test-utils'

describe('test-utils setup', () => {
  it('renders inside Radix Theme provider without crashing', () => {
    render(<div>hello</div>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
