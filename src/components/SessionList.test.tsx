import { describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, within, resetStore } from '../test/test-utils'
import { SessionList } from './SessionList'
import { useStore } from '../store'

beforeEach(() => {
  resetStore()
})

describe('SessionList', () => {
  it('shows empty state when no sessions', () => {
    render(<SessionList />)
    expect(screen.getByText(/no sessions yet/i)).toBeInTheDocument()
  })

  it('New session navigates to session-create', async () => {
    const user = userEvent.setup()
    render(<SessionList />)
    await user.click(screen.getByRole('button', { name: /new session/i }))
    expect(useStore.getState().screen).toBe('session-create')
  })

  it('lists sessions and Start session starts workout', async () => {
    useStore.getState().addExercise({
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false,
      levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
    })
    const exId = useStore.getState().exercises[0].id
    useStore.getState().addSession({
      name: 'Full body',
      exercises: [{ exerciseId: exId, level: 1 }],
      restBetweenExercises: 90,
    })
    const user = userEvent.setup()
    render(<SessionList />)
    expect(screen.getByText('Full body')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /expand full body/i }))
    await user.click(screen.getByRole('button', { name: /start session/i }))
    expect(useStore.getState().screen).toBe('workout')
    expect(useStore.getState().activeWorkout?.exercises).toHaveLength(1)
  })

  it('Edit navigates to session-edit', async () => {
    useStore.getState().addSession({
      name: 'S1',
      exercises: [],
      restBetweenExercises: 60,
    })
    const id = useStore.getState().sessions[0].id
    const user = userEvent.setup()
    render(<SessionList />)
    await user.click(screen.getByRole('button', { name: /expand s1/i }))
    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(useStore.getState().screen).toBe('session-edit')
    expect(useStore.getState().editingSessionId).toBe(id)
  })

  it('Delete removes session', async () => {
    useStore.getState().addSession({
      name: 'S1',
      exercises: [],
      restBetweenExercises: 60,
    })
    const user = userEvent.setup()
    render(<SessionList />)
    await user.click(screen.getByRole('button', { name: /expand s1/i }))
    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /delete/i }))
    expect(useStore.getState().sessions).toHaveLength(0)
  })
})
