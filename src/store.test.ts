import { describe, it, expect, beforeEach } from 'vitest'
import { useStore, getLevelSetsCount, createEmptyStrengthLevel, createEmptyCardioLevel } from './store'

function resetStore() {
  useStore.setState({
    screen: 'home',
    exercises: [],
    sessions: [],
    workoutHistory: [],
    activeWorkout: null,
    lastResult: null,
    editingExerciseId: null,
    editingSessionId: null,
  })
}

beforeEach(() => {
  resetStore()
})

describe('getLevelSetsCount', () => {
  it('returns 0 when level not found', () => {
    const exercise = {
      id: 'e1',
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false as const,
      levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
    }
    expect(getLevelSetsCount(exercise, 2)).toBe(0)
  })

  it('returns level sets length', () => {
    const exercise = {
      id: 'e1',
      name: 'Push-ups',
      restBetweenSets: 60,
      isCardio: false as const,
      levels: [
        { level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] },
        { level: 2, sets: [{ reps: 10, weight: '5kg' }, { reps: 8, weight: '5kg' }] },
      ],
    }
    expect(getLevelSetsCount(exercise, 1)).toBe(1)
    expect(getLevelSetsCount(exercise, 2)).toBe(2)
  })
})

describe('createEmptyStrengthLevel / createEmptyCardioLevel', () => {
  it('createEmptyStrengthLevel returns level with 3 sets', () => {
    const level = createEmptyStrengthLevel(1)
    expect(level.level).toBe(1)
    expect(level.sets).toHaveLength(3)
    expect(level.sets[0]).toEqual({ reps: 8, weight: 0 })
  })

  it('createEmptyCardioLevel returns level with 3 sets', () => {
    const level = createEmptyCardioLevel(1)
    expect(level.level).toBe(1)
    expect(level.sets).toHaveLength(3)
    expect(level.sets[0]).toEqual({ duration: 60 })
  })
})

describe('store', () => {
  describe('screen', () => {
    it('setScreen updates screen', () => {
      useStore.getState().setScreen('exercises')
      expect(useStore.getState().screen).toBe('exercises')
    })
  })

  describe('exercises', () => {
    it('addExercise adds strength exercise with id', () => {
      useStore.getState().addExercise({
        name: 'Push-ups',
        restBetweenSets: 60,
        isCardio: false,
        levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
      })
      const exercises = useStore.getState().exercises
      expect(exercises).toHaveLength(1)
      expect(exercises[0].name).toBe('Push-ups')
      expect(exercises[0].id).toBeDefined()
      expect(exercises[0].isCardio).toBe(false)
    })

    it('addExercise adds cardio exercise', () => {
      useStore.getState().addExercise({
        name: 'Run',
        restBetweenSets: 30,
        isCardio: true,
        levels: [{ level: 1, sets: [{ duration: 60 }] }],
      })
      const exercises = useStore.getState().exercises
      expect(exercises).toHaveLength(1)
      expect(exercises[0].isCardio).toBe(true)
    })

    it('updateExercise updates by id', () => {
      useStore.getState().addExercise({
        name: 'Push-ups',
        restBetweenSets: 60,
        isCardio: false,
        levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
      })
      const id = useStore.getState().exercises[0].id
      useStore.getState().updateExercise(id, { name: 'Pull-ups' })
      expect(useStore.getState().exercises[0].name).toBe('Pull-ups')
    })

    it('deleteExercise removes and clears sessions referencing it', () => {
      useStore.getState().addExercise({
        name: 'Push-ups',
        restBetweenSets: 60,
        isCardio: false,
        levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
      })
      const id = useStore.getState().exercises[0].id
      useStore.getState().addSession({
        name: 'S1',
        exercises: [{ exerciseId: id, level: 1 }],
        restBetweenExercises: 60,
      })
      useStore.getState().deleteExercise(id)
      expect(useStore.getState().exercises).toHaveLength(0)
      expect(useStore.getState().sessions).toHaveLength(0)
    })
  })

  describe('sessions', () => {
    it('addSession adds with id', () => {
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
      const sessions = useStore.getState().sessions
      expect(sessions).toHaveLength(1)
      expect(sessions[0].name).toBe('Full body')
      expect(sessions[0].id).toBeDefined()
    })

    it('updateSession updates by id', () => {
      useStore.getState().addSession({
        name: 'S1',
        exercises: [],
        restBetweenExercises: 60,
      })
      const id = useStore.getState().sessions[0].id
      useStore.getState().updateSession(id, { name: 'S2' })
      expect(useStore.getState().sessions[0].name).toBe('S2')
    })

    it('deleteSession removes session', () => {
      useStore.getState().addSession({
        name: 'S1',
        exercises: [],
        restBetweenExercises: 60,
      })
      const id = useStore.getState().sessions[0].id
      useStore.getState().deleteSession(id)
      expect(useStore.getState().sessions).toHaveLength(0)
    })
  })

  describe('workout', () => {
    it('startSingleExerciseWorkout sets activeWorkout and screen', () => {
      useStore.getState().addExercise({
        name: 'Push-ups',
        restBetweenSets: 60,
        isCardio: false,
        levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
      })
      const exId = useStore.getState().exercises[0].id
      useStore.getState().startSingleExerciseWorkout(exId, 1)
      const w = useStore.getState().activeWorkout
      expect(w).not.toBeNull()
      expect(w!.exercises).toHaveLength(1)
      expect(w!.exercises[0].exercise.name).toBe('Push-ups')
      expect(w!.restBetweenExercises).toBe(0)
      expect(useStore.getState().screen).toBe('workout')
    })

    it('startSingleExerciseWorkout does nothing if exercise not found', () => {
      useStore.getState().startSingleExerciseWorkout('nonexistent', 1)
      expect(useStore.getState().activeWorkout).toBeNull()
    })

    it('startSessionWorkout does nothing when session has no exercises', () => {
      useStore.getState().addSession({
        name: 'Empty',
        exercises: [],
        restBetweenExercises: 60,
      })
      const sessionId = useStore.getState().sessions[0].id
      useStore.getState().startSessionWorkout(sessionId)
      expect(useStore.getState().activeWorkout).toBeNull()
    })

    it('startSessionWorkout does nothing when session not found', () => {
      useStore.getState().startSessionWorkout('nonexistent-session')
      expect(useStore.getState().activeWorkout).toBeNull()
    })

    it('startSessionWorkout sets activeWorkout with session exercises', () => {
      useStore.getState().addExercise({
        name: 'Push-ups',
        restBetweenSets: 60,
        isCardio: false,
        levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
      })
      useStore.getState().addExercise({
        name: 'Run',
        restBetweenSets: 30,
        isCardio: true,
        levels: [{ level: 1, sets: [{ duration: 60 }] }],
      })
      const exIds = useStore.getState().exercises.map((e) => e.id)
      useStore.getState().addSession({
        name: 'Session',
        exercises: [
          { exerciseId: exIds[0], level: 1 },
          { exerciseId: exIds[1], level: 1 },
        ],
        restBetweenExercises: 90,
      })
      const sessionId = useStore.getState().sessions[0].id
      useStore.getState().startSessionWorkout(sessionId)
      const w = useStore.getState().activeWorkout
      expect(w).not.toBeNull()
      expect(w!.exercises).toHaveLength(2)
      expect(w!.restBetweenExercises).toBe(90)
    })

    it('completeSet on last set of last exercise calls finishWorkout', () => {
      useStore.getState().addExercise({
        name: 'Push-ups',
        restBetweenSets: 60,
        isCardio: false,
        levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
      })
      const exId = useStore.getState().exercises[0].id
      useStore.getState().startSingleExerciseWorkout(exId, 1)
      useStore.getState().completeSet()
      expect(useStore.getState().activeWorkout).toBeNull()
      expect(useStore.getState().lastResult).not.toBeNull()
      expect(useStore.getState().screen).toBe('results')
      expect(useStore.getState().lastResult!.completedSets).toHaveLength(1)
      expect(useStore.getState().lastResult!.completedSets[0]).toMatchObject({
        exerciseName: 'Push-ups',
        setIndex: 1,
        level: 1,
        reps: 8,
        weight: 'bodyweight',
      })
    })

    it('finishWorkout builds cardio completedSets with duration', () => {
      useStore.getState().addExercise({
        name: 'Run',
        restBetweenSets: 30,
        isCardio: true,
        levels: [{ level: 1, sets: [{ duration: 90 }] }],
      })
      const exId = useStore.getState().exercises[0].id
      useStore.getState().startSingleExerciseWorkout(exId, 1)
      useStore.getState().completeSet()
      const result = useStore.getState().lastResult!
      expect(result.completedSets).toHaveLength(1)
      expect(result.completedSets[0]).toMatchObject({
        exerciseName: 'Run',
        setIndex: 1,
        level: 1,
        duration: 90,
      })
    })

    it('completeSet on non-last set enters rest', () => {
      useStore.getState().addExercise({
        name: 'Push-ups',
        restBetweenSets: 60,
        isCardio: false,
        levels: [
          {
            level: 1,
            sets: [
              { reps: 8, weight: 'bodyweight' },
              { reps: 8, weight: 'bodyweight' },
            ],
          },
        ],
      })
      const exId = useStore.getState().exercises[0].id
      useStore.getState().startSingleExerciseWorkout(exId, 1)
      useStore.getState().completeSet()
      const w = useStore.getState().activeWorkout
      expect(w).not.toBeNull()
      expect(w!.isResting).toBe(true)
      expect(w!.isRestBetweenExercises).toBe(false)
    })

    it('setRestEndsAt updates restEndsAt on active workout', () => {
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
      useStore.getState().completeSet()
      const endAt = Date.now() + 30000
      useStore.getState().setRestEndsAt(endAt)
      expect(useStore.getState().activeWorkout!.restEndsAt).toBe(endAt)
    })

    it('setRestEndsAt does nothing when no active workout', () => {
      useStore.getState().setRestEndsAt(Date.now() + 60)
      expect(useStore.getState().activeWorkout).toBeNull()
    })

    it('setResting with resting=false and not restBetweenExercises advances currentSet', () => {
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
      useStore.getState().completeSet()
      expect(useStore.getState().activeWorkout!.currentSet).toBe(1)
      useStore.getState().setResting(false, null, false)
      expect(useStore.getState().activeWorkout!.currentSet).toBe(2)
      expect(useStore.getState().activeWorkout!.isResting).toBe(false)
    })

    it('setResting with resting=true updates isResting and restEndsAt', () => {
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
      useStore.getState().completeSet()
      const endAt = Date.now() + 45
      useStore.getState().setResting(true, endAt, false)
      expect(useStore.getState().activeWorkout!.isResting).toBe(true)
      expect(useStore.getState().activeWorkout!.restEndsAt).toBe(endAt)
    })

    it('restComplete after set rest advances currentSet', () => {
      useStore.getState().addExercise({
        name: 'Push-ups',
        restBetweenSets: 60,
        isCardio: false,
        levels: [
          {
            level: 1,
            sets: [
              { reps: 8, weight: 'bodyweight' },
              { reps: 8, weight: 'bodyweight' },
            ],
          },
        ],
      })
      const exId = useStore.getState().exercises[0].id
      useStore.getState().startSingleExerciseWorkout(exId, 1)
      useStore.getState().completeSet()
      expect(useStore.getState().activeWorkout!.currentSet).toBe(1)
      useStore.getState().restComplete()
      expect(useStore.getState().activeWorkout!.currentSet).toBe(2)
    })

    it('advanceToNextExercise moves to next exercise', () => {
      useStore.getState().addExercise({
        name: 'A',
        restBetweenSets: 60,
        isCardio: false,
        levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
      })
      useStore.getState().addExercise({
        name: 'B',
        restBetweenSets: 60,
        isCardio: false,
        levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
      })
      const exIds = useStore.getState().exercises.map((e) => e.id)
      useStore.getState().addSession({
        name: 'S',
        exercises: [
          { exerciseId: exIds[0], level: 1 },
          { exerciseId: exIds[1], level: 1 },
        ],
        restBetweenExercises: 0,
      })
      useStore.getState().startSessionWorkout(useStore.getState().sessions[0].id)
      useStore.getState().completeSet()
      expect(useStore.getState().activeWorkout!.isRestBetweenExercises).toBe(true)
      useStore.getState().restComplete()
      expect(useStore.getState().activeWorkout!.currentExerciseIndex).toBe(1)
      expect(useStore.getState().activeWorkout!.exercises[1].exercise.name).toBe('B')
    })

    it('quitWorkout clears activeWorkout and sets screen to home', () => {
      useStore.getState().addExercise({
        name: 'Push-ups',
        restBetweenSets: 60,
        isCardio: false,
        levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
      })
      const exId = useStore.getState().exercises[0].id
      useStore.getState().startSingleExerciseWorkout(exId, 1)
      useStore.getState().quitWorkout()
      expect(useStore.getState().activeWorkout).toBeNull()
      expect(useStore.getState().screen).toBe('home')
    })

    it('clearLastResult clears lastResult', () => {
      useStore.setState({ lastResult: { id: 'r1', completedAt: 0, totalDurationSeconds: 0, completedSets: [], exerciseNames: [] } })
      useStore.getState().clearLastResult()
      expect(useStore.getState().lastResult).toBeNull()
    })
  })

  describe('load', () => {
    it('load populates from localStorage', () => {
      const exercises = [
        {
          id: 'e1',
          name: 'Push-ups',
          restBetweenSets: 60,
          isCardio: false as const,
          levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
        },
      ]
      const sessions = [
        { id: 's1', name: 'S1', exercises: [], restBetweenExercises: 60 },
      ]
      localStorage.setItem('cursor-fit:exercises', JSON.stringify(exercises))
      localStorage.setItem('cursor-fit:sessions', JSON.stringify(sessions))
      useStore.getState().load()
      expect(useStore.getState().exercises).toHaveLength(1)
      expect(useStore.getState().exercises[0].name).toBe('Push-ups')
      expect(useStore.getState().sessions).toHaveLength(1)
    })
  })
})
