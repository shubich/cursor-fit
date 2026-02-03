import { useStore, getLevelSetsCount } from '../store'
import { formatSeconds } from '../timer-utils'
import { RestTimer } from './RestTimer'
import type { Exercise } from '../types'

/** Get the current set's target (reps or duration) and weight from the level's sets array. */
function getCurrentSetInfo(exercise: Exercise, level: number, setIndex: number) {
  const l = exercise.levels.find((x) => x.level === level)
  if (!l) return { reps: null, duration: null, weight: 'bodyweight' as const }
  const setSpec = l.sets[setIndex - 1]
  if (!setSpec) return { reps: null, duration: null, weight: 'bodyweight' as const }
  if (exercise.isCardio && 'duration' in setSpec) {
    return {
      reps: null,
      duration: setSpec.duration,
      weight: setSpec.weight ?? 'bodyweight',
    }
  }
  if ('reps' in setSpec) {
    return { reps: setSpec.reps, duration: null, weight: setSpec.weight }
  }
  return { reps: null, duration: null, weight: 'bodyweight' as const }
}

export function ActiveWorkoutScreen() {
  const activeWorkout = useStore((s) => s.activeWorkout)
  const completeSet = useStore((s) => s.completeSet)
  const restComplete = useStore((s) => s.restComplete)

  if (!activeWorkout) {
    return (
      <div className="p-4">
        <p>No active workout.</p>
      </div>
    )
  }

  const current = activeWorkout.exercises[activeWorkout.currentExerciseIndex]
  const { exercise, level, completedSets } = current
  const totalSets = getLevelSetsCount(exercise, level)
  const levelInfo = getCurrentSetInfo(exercise, level, activeWorkout.currentSet)
  const isSession = activeWorkout.exercises.length > 1

  const handleRestComplete = () => restComplete()

  if (activeWorkout.isResting) {
    const restEndsAt = activeWorkout.restEndsAt
    const restSeconds =
      activeWorkout.isRestBetweenExercises
        ? activeWorkout.restBetweenExercises
        : exercise.restBetweenSets

    return (
      <div className="flex min-h-[100dvh] flex-col gap-4 p-4">
        <RestTimer
          restEndsAt={restEndsAt}
          restSeconds={restSeconds}
          isRestBetweenExercises={activeWorkout.isRestBetweenExercises}
          onRestComplete={handleRestComplete}
          nextLabel="Next Exercise"
        />
        <button
          type="button"
          onClick={handleRestComplete}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
        >
          Skip rest
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col gap-6 p-4 pb-8">
      {/* Header */}
      <div className="text-center">
        {isSession && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Exercise {activeWorkout.currentExerciseIndex + 1} of {activeWorkout.exercises.length}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{exercise.name}</h1>
      </div>

      {/* Sets progress */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalSets }, (_, i) => (
          <div
            key={i}
            className={`h-3 w-10 rounded-full ${
              i + 1 === activeWorkout.currentSet
                ? 'bg-emerald-500'
                : i < completedSets
                  ? 'bg-slate-400 dark:bg-slate-500'
                  : 'bg-slate-200 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
      <p className="text-center text-lg font-medium text-slate-700 dark:text-slate-300">
        Set {activeWorkout.currentSet} of {totalSets}
      </p>

      {/* Target */}
      <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-6 text-center">
        {exercise.isCardio ? (
          <>
            <p className="text-slate-600 dark:text-slate-400">Duration</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {levelInfo.duration != null ? formatSeconds(levelInfo.duration) : '—'}
            </p>
          </>
        ) : (
          <>
            <p className="text-slate-600 dark:text-slate-400">Target reps</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {levelInfo.reps ?? '—'}
            </p>
          </>
        )}
        {(levelInfo.weight !== undefined && levelInfo.weight !== 'bodyweight') && (
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Weight: {typeof levelInfo.weight === 'number' ? `${levelInfo.weight} kg` : levelInfo.weight}
          </p>
        )}
      </div>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Rest after this set: {formatSeconds(exercise.restBetweenSets)}
      </p>

      {/* Complete set */}
      <button
        type="button"
        onClick={completeSet}
        className="mt-auto w-full rounded-xl bg-emerald-600 py-4 text-lg font-semibold text-white shadow-lg hover:bg-emerald-700 active:scale-[0.98]"
      >
        Complete set
      </button>
    </div>
  )
}
