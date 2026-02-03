import { describe, it, expect, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, resetStore, waitFor, fireEvent } from '../test/test-utils'
import { ActiveWorkoutScreen } from './ActiveWorkoutScreen'
import { useStore } from '../store'

vi.mock('../timer-utils', () => ({
  formatSeconds: (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`,
  startCountdown: vi.fn((duration: number, onTick: (r: number) => void, _onDone: () => void) => {
    onTick(duration)
    return () => {}
  }),
}))
vi.mock('../sound', () => ({ playBeep: vi.fn() }))

beforeEach(() => {
  resetStore()
})

describe('ActiveWorkoutScreen', () => {
  it('shows no active workout when activeWorkout is null', () => {
    render(<ActiveWorkoutScreen />)
    expect(screen.getByText(/no active workout/i)).toBeInTheDocument()
  })

  it('shows exercise name and Complete set during workout', () => {
    useStore.getState().addExercise({
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false,
      levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
    })
    const exId = useStore.getState().exercises[0].id
    useStore.getState().startSingleExerciseWorkout(exId, 1)
    render(<ActiveWorkoutScreen />)
    expect(screen.getByRole('heading', { name: /push-ups/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /complete set/i })).toBeInTheDocument()
  })

  it('Complete set advances to rest then restComplete advances set', async () => {
    useStore.getState().addExercise({
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false,
      levels: [
        { level: 1, sets: [{ reps: 8, weight: 'bodyweight' }, { reps: 8, weight: 'bodyweight' }] },
      ],
    })
    const exId = useStore.getState().exercises[0].id
    useStore.getState().startSingleExerciseWorkout(exId, 1)
    const user = userEvent.setup()
    const { rerender } = render(<ActiveWorkoutScreen />)
    expect(screen.getByText(/set 1 of 2/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /complete set/i }))
    rerender(<ActiveWorkoutScreen />)
    expect(screen.getByRole('button', { name: /skip rest/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /skip rest/i }))
    rerender(<ActiveWorkoutScreen />)
    expect(screen.getByText(/set 2 of 2/i)).toBeInTheDocument()
  })

  it('Quit opens modal and Quit workout clears workout', async () => {
    useStore.getState().addExercise({
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false,
      levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
    })
    const exId = useStore.getState().exercises[0].id
    useStore.getState().startSingleExerciseWorkout(exId, 1)
    const user = userEvent.setup()
    render(<ActiveWorkoutScreen />)
    await user.click(screen.getByRole('button', { name: /quit/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/progress will not be saved/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /quit workout/i }))
    expect(useStore.getState().activeWorkout).toBeNull()
    expect(useStore.getState().screen).toBe('home')
  })

  it('Cancel in quit modal closes modal only', async () => {
    useStore.getState().addExercise({
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false,
      levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
    })
    const exId = useStore.getState().exercises[0].id
    useStore.getState().startSingleExerciseWorkout(exId, 1)
    const user = userEvent.setup()
    render(<ActiveWorkoutScreen />)
    await user.click(screen.getByRole('button', { name: /quit/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useStore.getState().activeWorkout).not.toBeNull()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  describe('cardio', () => {
    it('shows Start set and Complete set for cardio before timer starts', () => {
      useStore.getState().addExercise({
        name: 'Run',
        restBetweenSets: 30,
        isCardio: true,
        levels: [{ level: 1, sets: [{ duration: 60 }] }],
      })
      const exId = useStore.getState().exercises[0].id
      useStore.getState().startSingleExerciseWorkout(exId, 1)
      render(<ActiveWorkoutScreen />)
      expect(screen.getByRole('button', { name: /start set/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /complete set/i })).toBeInTheDocument()
      expect(screen.getByText(/duration/i)).toBeInTheDocument()
      expect(screen.getByText('1:00')).toBeInTheDocument()
    })

    it('clicking Start set shows countdown and Complete early', async () => {
      useStore.getState().addExercise({
        name: 'Run',
        restBetweenSets: 30,
        isCardio: true,
        levels: [{ level: 1, sets: [{ duration: 90 }] }],
      })
      const exId = useStore.getState().exercises[0].id
      useStore.getState().startSingleExerciseWorkout(exId, 1)
      const user = userEvent.setup()
      render(<ActiveWorkoutScreen />)
      await user.click(screen.getByRole('button', { name: /start set/i }))
      expect(screen.getByText(/time remaining/i)).toBeInTheDocument()
      expect(screen.getByText('1:30')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /complete early/i })).toBeInTheDocument()
    })

    it('Complete early advances workout', async () => {
      useStore.getState().addExercise({
        name: 'Run',
        restBetweenSets: 30,
        isCardio: true,
        levels: [{ level: 1, sets: [{ duration: 60 }, { duration: 60 }] }],
      })
      const exId = useStore.getState().exercises[0].id
      useStore.getState().startSingleExerciseWorkout(exId, 1)
      const user = userEvent.setup()
      render(<ActiveWorkoutScreen />)
      await user.click(screen.getByRole('button', { name: /start set/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete early/i })).toBeInTheDocument()
      })
      const completeEarlyBtn = screen.getByRole('button', { name: /complete early/i })
      fireEvent.click(completeEarlyBtn)
      await waitFor(() => {
        expect(useStore.getState().activeWorkout?.isResting).toBe(true)
      })
      expect(useStore.getState().activeWorkout?.exercises[0].completedSets).toBe(1)
    })
  })
})
