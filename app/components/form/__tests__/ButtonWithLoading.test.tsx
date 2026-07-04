import React from 'react'
import { render, screen } from '@/lib/test-utils'
import ButtonWithLoading from '../ButtonWithLoading'

describe('ButtonWithLoading', () => {
  it('renders children text', () => {
    render(<ButtonWithLoading isLoading={false}>Save</ButtonWithLoading>)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('is not disabled when isLoading is false', () => {
    render(<ButtonWithLoading isLoading={false}>Save</ButtonWithLoading>)
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
  })

  it('is disabled when isLoading is true', () => {
    render(<ButtonWithLoading isLoading={true}>Save</ButtonWithLoading>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows spinner icon when isLoading is true', () => {
    const { container } = render(<ButtonWithLoading isLoading={true}>Save</ButtonWithLoading>)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('hides spinner icon when isLoading is false', () => {
    const { container } = render(<ButtonWithLoading isLoading={false}>Save</ButtonWithLoading>)
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
  })
})
