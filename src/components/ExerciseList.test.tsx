import { describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, within, resetStore } from '../test/test-utils'
import { ExerciseList } from './ExerciseList'
import { useStore } from '../store'

beforeEach(() => {
  resetStore()
})

describe('ExerciseList', () => {
  it('shows empty state when no exercises', () => {
    render(<ExerciseList />)
    expect(screen.getByText(/no exercises yet/i)).toBeInTheDocument()
  })

  it('shows Add exercise button and navigates to create on click', async () => {
    const user = userEvent.setup()
    render(<ExerciseList />)
    await user.click(screen.getByRole('button', { name: /add exercise/i }))
    expect(useStore.getState().screen).toBe('exercise-create')
    expect(useStore.getState().editingExerciseId).toBeNull()
  })

  it('lists exercises', () => {
    useStore.getState().addExercise({
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false,
      levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
    })
    render(<ExerciseList />)
    expect(screen.getByText('Push-ups')).toBeInTheDocument()
  })

  it('Edit navigates to exercise-edit with id', async () => {
    useStore.getState().addExercise({
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false,
      levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
    })
    const id = useStore.getState().exercises[0].id
    const user = userEvent.setup()
    render(<ExerciseList />)
    await user.click(screen.getByRole('button', { name: /expand push-ups/i }))
    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(useStore.getState().screen).toBe('exercise-edit')
    expect(useStore.getState().editingExerciseId).toBe(id)
  })

  it('Delete removes exercise', async () => {
    useStore.getState().addExercise({
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false,
      levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
    })
    const user = userEvent.setup()
    render(<ExerciseList />)
    await user.click(screen.getByRole('button', { name: /expand push-ups/i }))
    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /delete/i }))
    expect(useStore.getState().exercises).toHaveLength(0)
  })

  it('Start workout starts single exercise workout with selected level', async () => {
    useStore.getState().addExercise({
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false,
      levels: [
        { level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] },
        { level: 2, sets: [{ reps: 10, weight: 'bodyweight' }] },
      ],
    })
    const user = userEvent.setup()
    render(<ExerciseList />)
    await user.click(screen.getByRole('button', { name: /expand push-ups/i }))
    const levelSelect = screen.getByRole('combobox', { name: /level/i })
    await user.selectOptions(levelSelect, '2')
    await user.click(screen.getByRole('button', { name: /start workout/i }))
    expect(useStore.getState().screen).toBe('workout')
    expect(useStore.getState().activeWorkout?.exercises[0].level).toBe(2)
  })
})
