import React from 'react'
import { render, screen } from '@/lib/test-utils'
import MobileNav from '../MobileNav'

describe('MobileNav', () => {
  it('renders the menu trigger button', () => {
    render(<MobileNav />)
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
  })

  it('keeps the menu closed by default (links not yet in the DOM)', () => {
    render(<MobileNav />)
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
  })
})
