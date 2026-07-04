import React from 'react'
import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import DeliveryAddressSection from '../DeliveryAddressSection'

describe('DeliveryAddressSection', () => {
  it('renders the Delivery Address heading', () => {
    render(<DeliveryAddressSection />)
    expect(screen.getByText('Delivery Address')).toBeInTheDocument()
  })

  it('renders both address type labels', () => {
    render(<DeliveryAddressSection />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Office')).toBeInTheDocument()
  })

  it('renders address line details', () => {
    render(<DeliveryAddressSection />)
    expect(screen.getByText('123 Culinary Way, Apartment 4B')).toBeInTheDocument()
    expect(screen.getByText('456 Tech Plaza, Suite 1200')).toBeInTheDocument()
  })

  it('renders a Change button', () => {
    render(<DeliveryAddressSection />)
    expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument()
  })

  it('clicking the Office address does not crash', async () => {
    const user = userEvent.setup()
    render(<DeliveryAddressSection />)
    await user.click(screen.getByText('Office'))
    expect(screen.getByText('Delivery Address')).toBeInTheDocument()
  })
})
