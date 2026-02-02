/**
 * Core TypeScript interfaces for the fitness app.
 */

/** Strength exercise level: reps + optional weight (0 = bodyweight). */
export interface StrengthLevel {
  level: number
  reps: number
  weight: number
}

/** Cardio exercise level: duration in seconds + optional weight. */
export interface CardioLevel {
  level: number
  duration: number // seconds
  weight?: number
}

export type ExerciseLevel = StrengthLevel | CardioLevel

/** Base exercise fields shared by strength and cardio. */
export interface ExerciseBase {
  id: string
  name: string
  sets: number
  restBetweenSets: number // seconds
  isCardio: boolean
}

/** Strength exercise: has levels with reps and weight. */
export interface StrengthExercise extends ExerciseBase {
  isCardio: false
  levels: StrengthLevel[]
}

/** Cardio exercise: has levels with duration (and optional weight). */
export interface CardioExercise extends ExerciseBase {
  isCardio: true
  levels: CardioLevel[]
}

export type Exercise = StrengthExercise | CardioExercise

/** Session definition: list of exercises with chosen level and rest between exercises. */
export interface SessionExercise {
  exerciseId: string
  level: number
}

export interface Session {
  id: string
  name: string
  exercises: SessionExercise[]
  restBetweenExercises: number // seconds
}

/** One exercise in an active workout (with resolved exercise data). */
export interface ActiveWorkoutExercise {
  exercise: Exercise
  level: number
  completedSets: number
}

/** State of an in-progress workout. */
export interface ActiveWorkout {
  id: string
  startedAt: number // timestamp
  exercises: ActiveWorkoutExercise[]
  currentExerciseIndex: number
  currentSet: number
  isResting: boolean
  restEndsAt: number | null // timestamp when rest ends (for accurate background timer)
  isRestBetweenExercises: boolean
  /** Seconds of rest between exercises (from session); 0 for single-exercise workout. */
  restBetweenExercises: number
}

/** Single completed set log. */
export interface CompletedSet {
  exerciseId: string
  exerciseName: string
  setIndex: number
  level: number
  reps?: number
  duration?: number
  weight: number
}

/** Result of a finished workout. */
export interface WorkoutResult {
  id: string
  completedAt: number
  totalDurationSeconds: number
  completedSets: CompletedSet[]
  exerciseNames: string[]
}

/** App screen / route. */
export type AppScreen =
  | 'home'
  | 'exercises'
  | 'exercise-edit'
  | 'exercise-create'
  | 'sessions'
  | 'session-create'
  | 'session-edit'
  | 'workout'
  | 'results'
