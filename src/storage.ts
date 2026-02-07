/**
 * localStorage helpers: key structure and serialization for exercises and session history.
 */

import type {
  Exercise,
  StrengthExercise,
  Session,
  WorkoutResult,
  StrengthLevel,
  CardioLevel,
  StrengthSet,
  CardioSet,
} from './types'
import i18n from './i18n'
type Weight = number | string

const PREFIX = 'cursor-fit'

export const STORAGE_KEYS = {
  exercises: `${PREFIX}:exercises`,
  sessions: `${PREFIX}:sessions`,
  workoutHistory: `${PREFIX}:workout-history`,
  settings: `${PREFIX}:settings`,
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

// --- Default exercises (seeded on first launch) ---

const s = (reps: number) => ({ reps, weight: 0 })

function getDefaultExercises(): Exercise[] {
  const pushUps: StrengthExercise = {
    id: 'default-push-ups',
    name: i18n.t('defaults.pushUps'),
    restBetweenSets: 100,
    isCardio: false,
    levels: [
      { level: 1,  sets: [s(20), s(20), s(15), s(15), s(10)] },
      { level: 2,  sets: [s(25), s(25), s(20), s(15), s(10)] },
      { level: 3,  sets: [s(30), s(30), s(25), s(20), s(15)] },
      { level: 4,  sets: [s(35), s(30), s(25), s(20), s(15)] },
      { level: 5,  sets: [s(40), s(35), s(25), s(25), s(15)] },
      { level: 6,  sets: [s(40), s(40), s(30), s(30), s(20)] },
      { level: 7,  sets: [s(45), s(40), s(35), s(35), s(25)] },
      { level: 8,  sets: [s(45), s(45), s(35), s(35), s(25)] },
      { level: 9,  sets: [s(50), s(45), s(35), s(35), s(30)] },
      { level: 10, sets: [s(50), s(50), s(40), s(40), s(35)] },
    ],
  }
  const squats: StrengthExercise = {
    id: 'default-squats',
    name: i18n.t('defaults.squats'),
    restBetweenSets: 60,
    isCardio: false,
    levels: [
      { level: 1,  sets: [s(8),  s(10), s(8),  s(8),  s(6)]  },
      { level: 2,  sets: [s(10), s(12), s(10), s(10), s(8)]  },
      { level: 3,  sets: [s(10), s(15), s(12), s(12), s(10)] },
      { level: 4,  sets: [s(15), s(15), s(15), s(15), s(12)] },
      { level: 5,  sets: [s(15), s(20), s(18), s(16), s(12)] },
      { level: 6,  sets: [s(15), s(20), s(20), s(20), s(15)] },
      { level: 7,  sets: [s(20), s(25), s(20), s(20), s(20)] },
      { level: 8,  sets: [s(20), s(25), s(25), s(25), s(20)] },
      { level: 9,  sets: [s(25), s(30), s(30), s(25), s(20)] },
      { level: 10, sets: [s(25), s(30), s(30), s(30), s(25)] },
    ],
  }
  const abs: StrengthExercise = {
    id: 'default-abs',
    name: i18n.t('defaults.abs'),
    restBetweenSets: 5,
    isCardio: false,
    levels: [
      { level: 1,  sets: [s(5),  s(10), s(5),  s(5),  s(5)]  },
      { level: 2,  sets: [s(6),  s(11), s(6),  s(6),  s(6)]  },
      { level: 3,  sets: [s(7),  s(12), s(7),  s(7),  s(7)]  },
      { level: 4,  sets: [s(8),  s(13), s(8),  s(8),  s(8)]  },
      { level: 5,  sets: [s(9),  s(14), s(9),  s(9),  s(9)]  },
      { level: 6,  sets: [s(10), s(15), s(10), s(10), s(10)] },
      { level: 7,  sets: [s(11), s(16), s(11), s(11), s(11)] },
      { level: 8,  sets: [s(12), s(17), s(12), s(12), s(12)] },
      { level: 9,  sets: [s(13), s(18), s(13), s(13), s(13)] },
      { level: 10, sets: [s(14), s(19), s(14), s(14), s(14)] },
    ],
  }
  const pullUps: StrengthExercise = {
    id: 'default-pull-ups',
    name: i18n.t('defaults.pullUps'),
    restBetweenSets: 120,
    isCardio: false,
    levels: [
      { level: 1,  sets: [s(6),  s(5), s(5), s(4), s(3)] },
      { level: 2,  sets: [s(7),  s(6), s(5), s(4), s(4)] },
      { level: 3,  sets: [s(8),  s(6), s(5), s(5), s(4)] },
      { level: 4,  sets: [s(8),  s(7), s(5), s(5), s(5)] },
      { level: 5,  sets: [s(9),  s(7), s(6), s(5), s(5)] },
      { level: 6,  sets: [s(10), s(7), s(6), s(6), s(5)] },
      { level: 7,  sets: [s(10), s(8), s(6), s(6), s(6)] },
      { level: 8,  sets: [s(11), s(8), s(7), s(6), s(6)] },
      { level: 9,  sets: [s(12), s(8), s(7), s(7), s(6)] },
      { level: 10, sets: [s(12), s(9), s(7), s(7), s(7)] },
    ],
  }
  return [pushUps, squats, abs, pullUps]
}

// --- Exercises ---

export function loadExercises(): Exercise[] {
  const raw = localStorage.getItem(STORAGE_KEYS.exercises)
  if (raw == null) {
    // First launch — seed defaults
    const defaults = getDefaultExercises()
    safeSet(STORAGE_KEYS.exercises, defaults)
    return defaults
  }
  return safeParse<unknown[]>(STORAGE_KEYS.exercises, []).map(migrateExercise) as Exercise[]
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

export function saveWorkoutHistory(history: WorkoutResult[]): void {
  safeSet(STORAGE_KEYS.workoutHistory, history)
}

// --- Settings ---

export interface AppSettings {
  soundEnabled: boolean
  timerEnabled: boolean
  stopwatchEnabled: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  timerEnabled: true,
  stopwatchEnabled: true,
}

export function loadSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...safeParse<Partial<AppSettings>>(STORAGE_KEYS.settings, {}) }
}

export function saveSettings(settings: AppSettings): void {
  safeSet(STORAGE_KEYS.settings, settings)
}
