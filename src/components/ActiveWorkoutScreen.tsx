import { useState, useRef, useEffect } from 'react'
import { useStore, getLevelSetsCount } from '../store'
import { formatSeconds, startCountdown } from '../timer-utils'
import { playBeep } from '../sound'
import { RestTimer } from './RestTimer'
import { Button, Modal } from './ui'
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
  const quitWorkout = useStore((s) => s.quitWorkout)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [cardioRemaining, setCardioRemaining] = useState<number | null>(null)
  const cardioCountdownCleanup = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!activeWorkout) return
    cardioCountdownCleanup.current?.()
    cardioCountdownCleanup.current = null
    const id = requestAnimationFrame(() => setCardioRemaining(null))
    return () => cancelAnimationFrame(id)
    // Only reset when current set or exercise changes, not on every store update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkout?.currentExerciseIndex, activeWorkout?.currentSet])

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
  const closeQuitModal = () => setShowQuitConfirm(false)
  const handleQuitConfirm = () => {
    setShowQuitConfirm(false)
    quitWorkout()
  }

  const handleCardioStartSet = () => {
    const duration = levelInfo.duration ?? 0
    setCardioRemaining(duration)
    cardioCountdownCleanup.current = startCountdown(
      duration,
      setCardioRemaining,
      () => {
        playBeep()
        cardioCountdownCleanup.current = null
        completeSet()
      }
    )
  }

  const handleCardioCompleteEarly = () => {
    cardioCountdownCleanup.current?.()
    cardioCountdownCleanup.current = null
    setCardioRemaining(null)
    completeSet()
  }

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
            <Button variant="secondary" size="md" className="flex-1" onClick={handleRestComplete}>
              Skip rest
            </Button>
            <Button variant="danger" size="md" onClick={() => setShowQuitConfirm(true)}>
              Quit workout
            </Button>
          </div>
        </div>
        <Modal
          open={showQuitConfirm}
          onClose={closeQuitModal}
          title="Quit workout?"
          titleId="quit-modal-title"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Progress will not be saved. Are you sure?
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" fullWidth onClick={closeQuitModal}>
              Cancel
            </Button>
            <Button variant="dangerFilled" fullWidth onClick={handleQuitConfirm}>
              Quit workout
            </Button>
          </div>
        </Modal>
      </>
    )
  }

  return (
    <>
      <div className="flex min-h-[100dvh] flex-col gap-6 p-4 pb-8">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 text-center">
            {isSession && (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Exercise {activeWorkout.currentExerciseIndex + 1} of {activeWorkout.exercises.length}
              </p>
            )}
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{exercise.name}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowQuitConfirm(true)}>
            Quit
          </Button>
        </div>

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

        <div className="rounded-xl bg-slate-100 p-6 text-center dark:bg-slate-800">
          {exercise.isCardio ? (
            cardioRemaining === null ? (
              <>
                <p className="text-slate-600 dark:text-slate-400">Duration</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {levelInfo.duration != null ? formatSeconds(levelInfo.duration) : '—'}
                </p>
              </>
            ) : (
              <>
                <p className="text-slate-600 dark:text-slate-400">Time remaining</p>
                <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                  {formatSeconds(cardioRemaining)}
                </p>
              </>
            )
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

        {exercise.isCardio ? (
          cardioRemaining === null ? (
            <div className="mt-auto flex flex-col gap-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="active:scale-[0.98]"
                onClick={handleCardioStartSet}
              >
                Start set
              </Button>
              <Button variant="secondary" size="md" fullWidth onClick={handleCardioCompleteEarly}>
                Complete set
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              className="mt-auto active:scale-[0.98]"
              onClick={handleCardioCompleteEarly}
            >
              Complete early
            </Button>
          )
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mt-auto active:scale-[0.98]"
            onClick={completeSet}
          >
            Complete set
          </Button>
        )}
      </div>
      <Modal
        open={showQuitConfirm}
        onClose={closeQuitModal}
        title="Quit workout?"
        titleId="quit-modal-title"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Progress will not be saved. Are you sure?
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" fullWidth onClick={closeQuitModal}>
            Cancel
          </Button>
          <Button variant="dangerFilled" fullWidth onClick={handleQuitConfirm}>
            Quit workout
          </Button>
        </div>
      </Modal>
    </>
  )
}
