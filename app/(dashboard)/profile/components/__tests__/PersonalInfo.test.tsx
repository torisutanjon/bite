import React from 'react'
import { render, screen, fireEvent } from '@/lib/test-utils'
import PersonalInfo from '../PersonalInfo'

describe('PersonalInfo', () => {
  it('renders all field labels', () => {
    render(<PersonalInfo />)
    expect(screen.getByText('FULL NAME')).toBeInTheDocument()
    expect(screen.getByText('EMAIL ADDRESS')).toBeInTheDocument()
    expect(screen.getByText('PHONE NUMBER')).toBeInTheDocument()
    expect(screen.getByText('LANGUAGE & REGION')).toBeInTheDocument()
  })

  it('renders initial field values', () => {
    render(<PersonalInfo />)
    expect(screen.getByText('Alex Chen')).toBeInTheDocument()
    expect(screen.getByText('alex.chen@design.com')).toBeInTheDocument()
    expect(screen.getByText('+1 (555) 000-1234')).toBeInTheDocument()
    expect(screen.getByText('English (US)')).toBeInTheDocument()
  })

  it('clicking edit icon shows an input for that field', () => {
    render(<PersonalInfo />)
    // Find the Full Name field's edit area by locating the field value text
    const nameText = screen.getByText('Alex Chen')
    // Click the parent container (box with onClick) — fire click on the box next to the text
    fireEvent.click(nameText.closest('div')!.querySelector('[class*="cursor-pointer"]')!)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
