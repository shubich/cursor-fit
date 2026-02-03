import { describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, resetStore } from '../test/test-utils'
import { SessionCreator } from './SessionCreator'
import { useStore } from '../store'

beforeEach(() => {
  resetStore()
})

describe('SessionCreator', () => {
  beforeEach(() => {
    useStore.getState().addExercise({
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false,
      levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
    })
  })

  it('renders and Cancel navigates to sessions', async () => {
    useStore.getState().setScreen('session-create')
    const user = userEvent.setup()
    render(<SessionCreator />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useStore.getState().screen).toBe('sessions')
  })

  it('create disabled when no exercises selected', () => {
    useStore.getState().setScreen('session-create')
    render(<SessionCreator />)
    const submit = screen.getByRole('button', { name: /create/i })
    expect(submit).toBeDisabled()
  })

  it('selecting exercise and submitting creates session', async () => {
    useStore.getState().setScreen('session-create')
    const user = userEvent.setup()
    render(<SessionCreator />)
    await user.type(screen.getByLabelText(/session name/i), 'My Session')
    await user.click(screen.getByRole('checkbox', { name: /push-ups/i }))
    await user.click(screen.getByRole('button', { name: /create/i }))
    expect(useStore.getState().sessions).toHaveLength(1)
    expect(useStore.getState().sessions[0].name).toBe('My Session')
    expect(useStore.getState().sessions[0].exercises).toHaveLength(1)
    expect(useStore.getState().screen).toBe('sessions')
  })
})
