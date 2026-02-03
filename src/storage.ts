/**
 * localStorage helpers: key structure and serialization for exercises and session history.
 */

import type {
  Exercise,
  Session,
  WorkoutResult,
  StrengthLevel,
  CardioLevel,
  StrengthSet,
  CardioSet,
} from './types'
type Weight = number | string

const PREFIX = 'cursor-fit'

export const STORAGE_KEYS = {
  exercises: `${PREFIX}:exercises`,
  sessions: `${PREFIX}:sessions`,
  workoutHistory: `${PREFIX}:workout-history`,
} as const

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage set failed', key, e)
  }
}

/** Migrate old level shape (reps/weight or duration per level) to new (sets array). */
function migrateExercise(ex: unknown): Exercise {
  const raw = ex as Record<string, unknown>
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.levels)) return ex as Exercise
  const levels = raw.levels.map((l: unknown) => {
    const lev = l as Record<string, unknown>
    const levelNum = typeof lev.level === 'number' ? lev.level : 1
    if ('sets' in lev && Array.isArray(lev.sets)) return l as StrengthLevel | CardioLevel
    if ('duration' in lev && typeof lev.duration === 'number') {
      const weight: CardioSet['weight'] = lev.weight !== undefined ? (lev.weight as Weight) : undefined
      return {
        level: levelNum,
        sets: [{ duration: lev.duration as number, weight }],
      } as CardioLevel
    }
    const reps = typeof lev.reps === 'number' ? lev.reps : 8
    const weight: StrengthSet['weight'] = lev.weight !== undefined ? lev.weight as StrengthSet['weight'] : 'bodyweight'
    return {
      level: levelNum,
      sets: [{ reps, weight }],
    } as StrengthLevel
  })
  const { sets: _s, ...rest } = raw
  return { ...rest, levels } as Exercise
}

// --- Exercises ---

export function loadExercises(): Exercise[] {
  const raw = safeParse<unknown[]>(STORAGE_KEYS.exercises, [])
  return raw.map(migrateExercise) as Exercise[]
}

export function saveExercises(exercises: Exercise[]): void {
  safeSet(STORAGE_KEYS.exercises, exercises)
}

// --- Sessions ---

export function loadSessions(): Session[] {
  return safeParse<Session[]>(STORAGE_KEYS.sessions, [])
}

export function saveSessions(sessions: Session[]): void {
  safeSet(STORAGE_KEYS.sessions, sessions)
}

// --- Workout history ---

export function loadWorkoutHistory(): WorkoutResult[] {
  return safeParse<WorkoutResult[]>(STORAGE_KEYS.workoutHistory, [])
}

export function saveWorkoutResult(result: WorkoutResult): void {
  const history = loadWorkoutHistory()
  history.unshift(result)
  // Keep last 100 results
  safeSet(STORAGE_KEYS.workoutHistory, history.slice(0, 100))
}
