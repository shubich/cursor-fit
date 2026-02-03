/**
 * Zustand store: exercises, sessions, active workout, screen, and results.
 */

import { create } from 'zustand'
import type {
  Exercise,
  Session,
  ActiveWorkout,
  ActiveWorkoutExercise,
  WorkoutResult,
  CompletedSet,
  AppScreen,
} from './types'
import {
  loadExercises,
  saveExercises,
  loadSessions,
  saveSessions,
  loadWorkoutHistory,
  saveWorkoutResult,
} from './storage'
import type { StrengthExercise, CardioExercise, StrengthLevel, CardioLevel } from './types'

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 12)

/** Number of sets for this exercise at the given level (from level's sets array). */
export function getLevelSetsCount(exercise: Exercise, level: number): number {
  const l = exercise.levels.find((x) => x.level === level)
  return l ? l.sets.length : 0
}

/** Cast to Exercise[] for addExercise (spread widens isCardio to boolean). */
function asExerciseList(arr: unknown): Exercise[] {
  return arr as Exercise[]
}

// --- State shape ---

interface AppState {
  screen: AppScreen
  exercises: Exercise[]
  sessions: Session[]
  workoutHistory: WorkoutResult[]
  activeWorkout: ActiveWorkout | null
  lastResult: WorkoutResult | null
  editingExerciseId: string | null
  editingSessionId: string | null
}

interface AppActions {
  setScreen: (screen: AppScreen) => void
  load: () => void

  // Exercises
  addExercise: (exercise: Omit<StrengthExercise, 'id'> | Omit<CardioExercise, 'id'>) => void
  updateExercise: (id: string, data: Partial<Exercise>) => void
  deleteExercise: (id: string) => void
  setEditingExerciseId: (id: string | null) => void

  // Sessions
  addSession: (session: Omit<Session, 'id'>) => void
  updateSession: (id: string, data: Partial<Session>) => void
  deleteSession: (id: string) => void
  setEditingSessionId: (id: string | null) => void

  // Workout
  startSingleExerciseWorkout: (exerciseId: string, level: number) => void
  startSessionWorkout: (sessionId: string) => void
  completeSet: () => void
  setRestEndsAt: (restEndsAt: number | null) => void
  setResting: (resting: boolean, restEndsAt: number | null, isRestBetweenExercises: boolean) => void
  advanceToNextExercise: () => void
  restComplete: () => void
  finishWorkout: () => void
  clearLastResult: () => void
}

export type Store = AppState & AppActions

function buildActiveWorkoutExercises(
  exercises: Exercise[],
  entries: { exerciseId: string; level: number }[]
): ActiveWorkoutExercise[] {
  return entries.map(({ exerciseId, level }) => {
    const exercise = exercises.find((e) => e.id === exerciseId)
    if (!exercise) throw new Error(`Exercise ${exerciseId} not found`)
    return { exercise, level, completedSets: 0 }
  })
}

export const useStore = create<Store>((set, get) => ({
  screen: 'home',
  exercises: [],
  sessions: [],
  workoutHistory: [],
  activeWorkout: null,
  lastResult: null,
  editingExerciseId: null,
  editingSessionId: null,

  setScreen: (screen) => set({ screen }),

  load: () => {
    set({
      exercises: loadExercises(),
      sessions: loadSessions(),
      workoutHistory: loadWorkoutHistory(),
    })
  },

  addExercise: (data) => {
    const prev = get().exercises
    const newEx: Exercise =
      data.isCardio
        ? ({ ...data, id: uid() } as CardioExercise)
        : ({ ...data, id: uid() } as StrengthExercise)
    const next = asExerciseList([...prev, newEx])
    set({ exercises: next })
    saveExercises(next)
  },

  updateExercise: (id, data) => {
    const next = get().exercises.map((e) => (e.id === id ? { ...e, ...data } : e)) as Exercise[]
    set({ exercises: next })
    saveExercises(next)
  },

  deleteExercise: (id) => {
    const next = get().exercises.filter((e) => e.id !== id)
    set({ exercises: next, editingExerciseId: null })
    saveExercises(next)
    const sessions = get().sessions.filter(
      (s) => !s.exercises.some((e) => e.exerciseId === id)
    )
    set({ sessions })
    saveSessions(sessions)
  },

  setEditingExerciseId: (id) => set({ editingExerciseId: id }),

  addSession: (data) => {
    const session = { ...data, id: uid() } as Session
    const next = [...get().sessions, session]
    set({ sessions: next })
    saveSessions(next)
  },

  updateSession: (id, data) => {
    const next = get().sessions.map((s) => (s.id === id ? { ...s, ...data } : s))
    set({ sessions: next })
    saveSessions(next)
  },

  deleteSession: (id) => {
    const next = get().sessions.filter((s) => s.id !== id)
    set({ sessions: next, editingSessionId: null })
    saveSessions(next)
  },

  setEditingSessionId: (id) => set({ editingSessionId: id }),

  startSingleExerciseWorkout: (exerciseId, level) => {
    const exercises = get().exercises
    const exercise = exercises.find((e) => e.id === exerciseId)
    if (!exercise) return
    const active: ActiveWorkout = {
      id: uid(),
      startedAt: Date.now(),
      exercises: [{ exercise, level, completedSets: 0 }],
      currentExerciseIndex: 0,
      currentSet: 1,
      isResting: false,
      restEndsAt: null,
      isRestBetweenExercises: false,
      restBetweenExercises: 0,
    }
    set({ activeWorkout: active, screen: 'workout' })
  },

  startSessionWorkout: (sessionId) => {
    const { exercises, sessions } = get()
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return
    const activeExercises = buildActiveWorkoutExercises(exercises, session.exercises)
    if (activeExercises.length === 0) return
    const active: ActiveWorkout = {
      id: uid(),
      startedAt: Date.now(),
      exercises: activeExercises,
      currentExerciseIndex: 0,
      currentSet: 1,
      isResting: false,
      restEndsAt: null,
      isRestBetweenExercises: false,
      restBetweenExercises: session.restBetweenExercises,
    }
    set({ activeWorkout: active, screen: 'workout' })
  },

  completeSet: () => {
    const w = get().activeWorkout
    if (!w) return
    const idx = w.currentExerciseIndex
    const ex = w.exercises[idx]
    const updated = [...w.exercises]
    updated[idx] = { ...ex, completedSets: ex.completedSets + 1 }
    const totalSets = getLevelSetsCount(ex.exercise, ex.level)
    const isLastSet = ex.completedSets + 1 >= totalSets
    const isLastExercise = w.currentExerciseIndex === w.exercises.length - 1

    if (isLastSet && isLastExercise) {
      get().finishWorkout()
      return
    }
    if (isLastSet) {
      const restSeconds = w.restBetweenExercises
      set({
        activeWorkout: {
          ...w,
          exercises: updated,
          isResting: true,
          isRestBetweenExercises: true,
          restEndsAt: restSeconds > 0 ? Date.now() + restSeconds * 1000 : null,
        },
      })
      return
    }
    set({
      activeWorkout: {
        ...w,
        exercises: updated,
        isResting: true,
        restEndsAt:
          Date.now() + ex.exercise.restBetweenSets * 1000,
        isRestBetweenExercises: false,
      },
    })
  },

  setRestEndsAt: (restEndsAt) => {
    const w = get().activeWorkout
    if (w) set({ activeWorkout: { ...w, restEndsAt } })
  },

  setResting: (resting, restEndsAt, isRestBetweenExercises) => {
    const w = get().activeWorkout
    if (!w) return
    if (!resting && !isRestBetweenExercises) {
      set({
        activeWorkout: {
          ...w,
          isResting: false,
          restEndsAt: null,
          isRestBetweenExercises: false,
          currentSet: w.currentSet + 1,
        },
      })
    } else {
      set({
        activeWorkout: { ...w, isResting: resting, restEndsAt, isRestBetweenExercises },
      })
    }
  },

  advanceToNextExercise: () => {
    const w = get().activeWorkout
    if (!w) return
    const nextIndex = w.currentExerciseIndex + 1
    if (nextIndex >= w.exercises.length) {
      get().finishWorkout()
      return
    }
    set({
      activeWorkout: {
        ...w,
        currentExerciseIndex: nextIndex,
        currentSet: 1,
        isResting: false,
        restEndsAt: null,
        isRestBetweenExercises: false,
      },
    })
  },
  /** Call when rest period ends (same exercise = next set). */
  restComplete: () => {
    const w = get().activeWorkout
    if (!w) return
    if (w.isRestBetweenExercises) {
      get().advanceToNextExercise()
    } else {
      get().setResting(false, null, false)
    }
  },

  finishWorkout: () => {
    const w = get().activeWorkout
    if (!w) return
    const completedSets: CompletedSet[] = []
    for (const { exercise, level, completedSets: count } of w.exercises) {
      const levelData = exercise.levels.find((l) => l.level === level)
      if (!levelData) continue
      const sets = levelData.sets
      for (let i = 0; i < count && i < sets.length; i++) {
        const setSpec = sets[i]
        if (exercise.isCardio && 'duration' in setSpec) {
          completedSets.push({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            setIndex: i + 1,
            level,
            duration: setSpec.duration,
            weight: setSpec.weight ?? 'bodyweight',
          })
        } else if ('reps' in setSpec) {
          completedSets.push({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            setIndex: i + 1,
            level,
            reps: setSpec.reps,
            weight: setSpec.weight,
          })
        }
      }
    }
    const result: WorkoutResult = {
      id: uid(),
      completedAt: Date.now(),
      totalDurationSeconds: Math.round((Date.now() - w.startedAt) / 1000),
      completedSets,
      exerciseNames: [...new Set(w.exercises.map((e) => e.exercise.name))],
    }
    saveWorkoutResult(result)
    set({
      activeWorkout: null,
      lastResult: result,
      screen: 'results',
    })
  },

  clearLastResult: () => set({ lastResult: null }),
}))

// Helpers for forms (create default level with 3 sets)
const DEFAULT_SETS_COUNT = 3

export function createEmptyStrengthLevel(level: number): StrengthLevel {
  return {
    level,
    sets: Array.from({ length: DEFAULT_SETS_COUNT }, () => ({
      reps: 8,
      weight: 'bodyweight' as const,
    })),
  }
}

export function createEmptyCardioLevel(level: number): CardioLevel {
  return {
    level,
    sets: Array.from({ length: DEFAULT_SETS_COUNT }, () => ({
      duration: 60,
    })),
  }
}
