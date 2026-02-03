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
    await user.selectOptions(
      screen.getByRole('combobox', { name: /add exercise/i }),
      screen.getByRole('option', { name: /push-ups/i })
    )
    await user.click(screen.getByRole('button', { name: /create/i }))
    expect(useStore.getState().sessions).toHaveLength(1)
    expect(useStore.getState().sessions[0].name).toBe('My Session')
    expect(useStore.getState().sessions[0].exercises).toHaveLength(1)
    expect(useStore.getState().screen).toBe('sessions')
  })

  it('persists session exercise order when two exercises selected', async () => {
    useStore.getState().addExercise({
      name: 'Squats',
      restBetweenSets: 60,
      isCardio: false,
      levels: [{ level: 1, sets: [{ reps: 10, weight: 'bodyweight' }] }],
    })
    const exercises = useStore.getState().exercises
    const pushUps = exercises.find((e) => e.name === 'Push-ups')!
    const squats = exercises.find((e) => e.name === 'Squats')!

    useStore.getState().setScreen('session-create')
    const user = userEvent.setup()
    render(<SessionCreator />)
    await user.type(screen.getByLabelText(/session name/i), 'Ordered Session')
    // Add in order: Push-ups first, then Squats
    await user.selectOptions(
      screen.getByRole('combobox', { name: /add exercise/i }),
      screen.getByRole('option', { name: /push-ups/i })
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: /add exercise/i }),
      screen.getByRole('option', { name: /squats/i })
    )
    await user.click(screen.getByRole('button', { name: /create/i }))

    const session = useStore.getState().sessions[0]
    expect(session.exercises).toHaveLength(2)
    expect(session.exercises[0].exerciseId).toBe(pushUps.id)
    expect(session.exercises[1].exerciseId).toBe(squats.id)
  })
})
