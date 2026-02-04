import { describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, resetStore } from '../test/test-utils'
import { ExerciseForm } from './ExerciseForm'
import { useStore } from '../store'

beforeEach(() => {
  resetStore()
})

describe('ExerciseForm', () => {
  it('renders create form and creates strength exercise on submit', async () => {
    useStore.getState().setScreen('exercise-create')
    useStore.getState().setEditingExerciseId(null)
    const user = userEvent.setup()
    render(<ExerciseForm />)
    await user.type(screen.getByLabelText(/name/i), 'Push-ups')
    await user.clear(screen.getByLabelText(/rest between sets/i))
    await user.type(screen.getByLabelText(/rest between sets/i), '60')
    await user.click(screen.getByRole('button', { name: /create/i }))
    expect(useStore.getState().exercises).toHaveLength(1)
    expect(useStore.getState().exercises[0].name).toBe('Push-ups')
    expect(useStore.getState().screen).toBe('exercises')
  })

  it('Cancel navigates back to exercises', async () => {
    useStore.getState().setScreen('exercise-create')
    const user = userEvent.setup()
    render(<ExerciseForm />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useStore.getState().screen).toBe('exercises')
  })

  it('edit form loads existing exercise and Save updates', async () => {
    useStore.getState().addExercise({
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false,
      levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
    })
    const id = useStore.getState().exercises[0].id
    useStore.getState().setScreen('exercise-edit')
    useStore.getState().setEditingExerciseId(id)
    const user = userEvent.setup()
    render(<ExerciseForm />)
    expect(screen.getByDisplayValue('Push-ups')).toBeInTheDocument()
    const nameInput = screen.getByLabelText(/name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Pull-ups')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(useStore.getState().exercises[0].name).toBe('Pull-ups')
  })

  it('submit is disabled when form is invalid (e.g. empty name)', () => {
    useStore.getState().setScreen('exercise-create')
    render(<ExerciseForm />)
    const submitBtn = screen.getByRole('button', { name: /create/i })
    expect(submitBtn).toBeDisabled()
  })

  it('shows name error after blur when name is too short', async () => {
    useStore.getState().setScreen('exercise-create')
    const user = userEvent.setup()
    render(<ExerciseForm />)
    const nameInput = screen.getByLabelText(/name/i)
    await user.type(nameInput, 'A')
    await user.tab()
    expect(screen.getByRole('alert')).toHaveTextContent(/2–35 characters/i)
  })

  it('shows rest error after blur when rest is 0', async () => {
    useStore.getState().setScreen('exercise-create')
    const user = userEvent.setup()
    render(<ExerciseForm />)
    const restInput = screen.getByLabelText(/rest between sets/i)
    await user.clear(restInput)
    await user.tab()
    expect(screen.getByRole('alert')).toHaveTextContent(/greater than 0/i)
  })

  it('valid form enables submit and can submit', async () => {
    useStore.getState().setScreen('exercise-create')
    const user = userEvent.setup()
    render(<ExerciseForm />)
    await user.type(screen.getByLabelText(/name/i), 'Push-ups')
    await user.clear(screen.getByLabelText(/rest between sets/i))
    await user.type(screen.getByLabelText(/rest between sets/i), '60')
    const submitBtn = screen.getByRole('button', { name: /create/i })
    expect(submitBtn).toBeEnabled()
    await user.click(submitBtn)
    expect(useStore.getState().exercises).toHaveLength(1)
    expect(useStore.getState().exercises[0].name).toBe('Push-ups')
  })
})
