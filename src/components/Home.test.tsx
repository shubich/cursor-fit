import { describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '../test/test-utils'
import { Home } from './Home'
import { useStore } from '../store'

beforeEach(() => {
  useStore.setState({ screen: 'home' })
})

describe('Home', () => {
  it('renders description and nav items', () => {
    render(<Home />)
    expect(screen.getByText(/manage exercises/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /exercises/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sessions/i })).toBeInTheDocument()
  })

  it('navigates to exercises when Exercises is clicked', async () => {
    const user = userEvent.setup()
    render(<Home />)
    await user.click(screen.getByRole('button', { name: /exercises/i }))
    expect(useStore.getState().screen).toBe('exercises')
  })

  it('navigates to sessions when Sessions is clicked', async () => {
    const user = userEvent.setup()
    render(<Home />)
    await user.click(screen.getByRole('button', { name: /sessions/i }))
    expect(useStore.getState().screen).toBe('sessions')
  })
})
