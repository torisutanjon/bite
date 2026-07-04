import React from 'react'
import { render, screen } from '@/lib/test-utils'
import StoresPage from '../page'

describe('StoresPage', () => {
  it('renders without crashing and shows restaurant feed', async () => {
    const element = await StoresPage({ searchParams: Promise.resolve({}) })
    render(element)
    expect(screen.getByText('Recommended for you')).toBeInTheDocument()
  })

  it('renders All Restaurants section', async () => {
    const element = await StoresPage({ searchParams: Promise.resolve({}) })
    render(element)
    expect(screen.getByText('All Restaurants')).toBeInTheDocument()
  })

  it('renders filter tabs', async () => {
    const element = await StoresPage({ searchParams: Promise.resolve({}) })
    render(element)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
  })
})
