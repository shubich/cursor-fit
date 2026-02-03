import { describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, resetStore } from '../test/test-utils'
import { ResultsScreen } from './ResultsScreen'
import { useStore } from '../store'

beforeEach(() => {
  resetStore()
})

describe('ResultsScreen', () => {
  it('shows no results and Home when lastResult is null', () => {
    render(<ResultsScreen />)
    expect(screen.getByText(/no results/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument()
  })

  it('shows workout complete and summary when lastResult is set', () => {
    useStore.setState({
      lastResult: {
        id: 'r1',
        completedAt: Date.now(),
        totalDurationSeconds: 125,
        completedSets: [
          {
            exerciseId: 'e1',
            exerciseName: 'Push-ups',
            setIndex: 1,
            level: 1,
            reps: 8,
            weight: 'bodyweight',
          },
        ],
        exerciseNames: ['Push-ups'],
      },
    })
    render(<ResultsScreen />)
    expect(screen.getByRole('heading', { name: /workout complete/i })).toBeInTheDocument()
    expect(screen.getByText(/2:05/)).toBeInTheDocument()
    expect(screen.getByText('Push-ups')).toBeInTheDocument()
    expect(screen.getByText(/8 reps/)).toBeInTheDocument()
  })

  it('Finish clears result and navigates to home', async () => {
    useStore.setState({
      lastResult: {
        id: 'r1',
        completedAt: Date.now(),
        totalDurationSeconds: 0,
        completedSets: [],
        exerciseNames: [],
      },
    })
    const user = userEvent.setup()
    render(<ResultsScreen />)
    await user.click(screen.getByRole('button', { name: /finish/i }))
    expect(useStore.getState().lastResult).toBeNull()
    expect(useStore.getState().screen).toBe('home')
  })
})
