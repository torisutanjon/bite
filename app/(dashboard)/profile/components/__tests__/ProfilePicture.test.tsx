import React from 'react'
import { render, screen } from '@/lib/test-utils'
import ProfilePicture from '../ProfilePicture'

describe('ProfilePicture', () => {
  it('renders the profile picture heading', () => {
    render(<ProfilePicture />)
    expect(screen.getByText('Profile Picture')).toBeInTheDocument()
  })

  it('renders the avatar image for Alex Chen', () => {
    render(<ProfilePicture />)
    expect(screen.getByAltText('Alex Chen')).toBeInTheDocument()
  })

  it('renders file type guidance text', () => {
    render(<ProfilePicture />)
    expect(screen.getByText(/jpg, gif or png/i)).toBeInTheDocument()
  })

  it('renders Upload New Photo button', () => {
    render(<ProfilePicture />)
    expect(screen.getByRole('button', { name: /upload new photo/i })).toBeInTheDocument()
  })

  it('renders Remove option', () => {
    render(<ProfilePicture />)
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })
})
