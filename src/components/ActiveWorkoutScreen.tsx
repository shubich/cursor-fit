import { useState } from 'react'
import { useStore, getLevelSetsCount } from '../store'
import { formatSeconds } from '../timer-utils'
import { RestTimer } from './RestTimer'
import type { Exercise } from '../types'

function QuitConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quit-modal-title"
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <h2 id="quit-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
          Quit workout?
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Progress will not be saved. Are you sure?
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-300 py-2.5 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 py-2.5 font-medium text-white hover:bg-red-700"
          >
            Quit workout
          </button>
        </div>
      </div>
    </div>
  )
}

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
  const quitWorkout = useStore((s) => s.quitWorkout)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)

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
      <>
        <div className="flex min-h-[100dvh] flex-col gap-4 p-4">
          <RestTimer
            restEndsAt={restEndsAt}
            restSeconds={restSeconds}
            isRestBetweenExercises={activeWorkout.isRestBetweenExercises}
            onRestComplete={handleRestComplete}
            nextLabel="Next Exercise"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRestComplete}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            >
              Skip rest
            </button>
            <button
              type="button"
              onClick={() => setShowQuitConfirm(true)}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 dark:border-red-700 dark:text-red-400"
            >
              Quit workout
            </button>
          </div>
        </div>
        {showQuitConfirm && (
          <QuitConfirmModal
            onConfirm={() => {
              setShowQuitConfirm(false)
              quitWorkout()
            }}
            onCancel={() => setShowQuitConfirm(false)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="flex min-h-[100dvh] flex-col gap-6 p-4 pb-8">
        {/* Header with quit */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 text-center">
            {isSession && (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Exercise {activeWorkout.currentExerciseIndex + 1} of {activeWorkout.exercises.length}
              </p>
            )}
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{exercise.name}</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowQuitConfirm(true)}
            className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            Quit
          </button>
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
      {showQuitConfirm && (
        <QuitConfirmModal
          onConfirm={() => {
            setShowQuitConfirm(false)
            quitWorkout()
          }}
          onCancel={() => setShowQuitConfirm(false)}
        />
      )}
    </>
  )
}
