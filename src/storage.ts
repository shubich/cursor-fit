/**
 * localStorage helpers: key structure and serialization for exercises and session history.
 */

import type { Exercise, Session, WorkoutResult } from './types'

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

// --- Exercises ---

export function loadExercises(): Exercise[] {
  return safeParse<Exercise[]>(STORAGE_KEYS.exercises, [])
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
