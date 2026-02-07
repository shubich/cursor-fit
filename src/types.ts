/**
 * Core TypeScript interfaces for the fitness app.
 */

/** Weight: number (kg/lbs) or string descriptor (e.g. "bodyweight", "BW+5kg"). */
export type Weight = number | string

/** One set in a strength level: reps + weight per set. */
export interface StrengthSet {
  reps: number
  weight: Weight
}

/** One set in a cardio level: duration (seconds) + optional weight. */
export interface CardioSet {
  duration: number
  weight?: Weight
}

/** Strength exercise level: array of sets, each with its own reps and weight. */
export interface StrengthLevel {
  level: number
  sets: StrengthSet[]
}

/** Cardio exercise level: array of sets, each with duration and optional weight. */
export interface CardioLevel {
  level: number
  sets: CardioSet[]
}

export type ExerciseLevel = StrengthLevel | CardioLevel

/** Base exercise fields shared by strength and cardio. */
export interface ExerciseBase {
  id: string
  name: string
  restBetweenSets: number // seconds
  isCardio: boolean
}

/** Strength exercise: has levels, each with its own array of sets. */
export interface StrengthExercise extends ExerciseBase {
  isCardio: false
  levels: StrengthLevel[]
}

/** Cardio exercise: has levels, each with its own array of sets. */
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
  restEndsAt: number | null
  isRestBetweenExercises: boolean
  restBetweenExercises: number
  sessionName?: string
}

/** Single completed set log. */
export interface CompletedSet {
  exerciseId: string
  exerciseName: string
  setIndex: number
  level: number
  reps?: number
  duration?: number
  weight: Weight
}

/** Result of a finished workout. */
export interface WorkoutResult {
  id: string
  completedAt: number
  totalDurationSeconds: number
  completedSets: CompletedSet[]
  exerciseNames: string[]
  sessionName?: string
}

/** App screen / route. */
export type AppScreen =
  | 'home'
  | 'timer'
  | 'stopwatch'
  | 'exercises'
  | 'exercise-edit'
  | 'exercise-create'
  | 'sessions'
  | 'session-create'
  | 'session-edit'
  | 'workout'
  | 'results'
  | 'history'
  | 'settings'
