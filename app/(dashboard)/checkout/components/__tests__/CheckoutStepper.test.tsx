import React from 'react'
import { render, screen } from '@/lib/test-utils'
import CheckoutStepper from '../CheckoutStepper'

describe('CheckoutStepper', () => {
  it('renders all three step labels', () => {
    render(<CheckoutStepper />)
    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('Payment')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('renders step numbers 1, 2, 3', () => {
    render(<CheckoutStepper />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('defaults to currentStep 2, marking steps 1 and 2 active', () => {
    render(<CheckoutStepper />)
    const stepOneLabel = screen.getByText('Address')
    const stepThreeLabel = screen.getByText('Review')
    expect(stepOneLabel).toHaveClass('text-brand')
    expect(stepThreeLabel).not.toHaveClass('text-brand')
  })

  it('marks all steps active when currentStep is 3', () => {
    render(<CheckoutStepper currentStep={3} />)
    const reviewLabel = screen.getByText('Review')
    expect(reviewLabel).toHaveClass('text-brand')
  })

  it('marks only step 1 active when currentStep is 1', () => {
    render(<CheckoutStepper currentStep={1} />)
    const paymentLabel = screen.getByText('Payment')
    expect(paymentLabel).not.toHaveClass('text-brand')
  })
})
