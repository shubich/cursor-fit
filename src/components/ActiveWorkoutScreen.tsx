import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
        <p>{t('workout.noActiveWorkout')}</p>
      </div>
    )
  }

  const current = activeWorkout.exercises[activeWorkout.currentExerciseIndex]
  const { exercise, level, completedSets } = current
  const totalSets = getLevelSetsCount(exercise, level)
  const levelInfo = getCurrentSetInfo(exercise, level, activeWorkout.currentSet)
  const isSession = activeWorkout.exercises.length > 1
  
  // Get all sets for this level
  const levelData = exercise.levels.find((l) => l.level === level)
  const allSets = levelData?.sets ?? []

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
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
          <RestTimer
            restEndsAt={restEndsAt}
            restSeconds={restSeconds}
            isRestBetweenExercises={activeWorkout.isRestBetweenExercises}
            onRestComplete={handleRestComplete}
            nextLabel={t('workout.nextExercise')}
          />
          <div className="flex gap-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={handleRestComplete}>
              {t('workout.skipRest')}
            </Button>
            <Button variant="danger" size="md" onClick={() => setShowQuitConfirm(true)}>
              {t('workout.quitWorkout')}
            </Button>
          </div>
        </div>
        <Modal
          open={showQuitConfirm}
          onClose={closeQuitModal}
          title={t('workout.quitConfirmTitle')}
          titleId="quit-modal-title"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('workout.quitConfirmMessage')}
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" fullWidth onClick={closeQuitModal}>
              {t('common.cancel')}
            </Button>
            <Button variant="dangerFilled" fullWidth onClick={handleQuitConfirm}>
              {t('workout.quitWorkout')}
            </Button>
          </div>
        </Modal>
      </>
    )
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-6 p-4 pb-8">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 text-center">
            {isSession && (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t('workout.exerciseOf', {
                  current: activeWorkout.currentExerciseIndex + 1,
                  total: activeWorkout.exercises.length,
                })}
              </p>
            )}
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{exercise.name}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowQuitConfirm(true)}>
            {t('common.quit')}
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
          {t('workout.setOf', { current: activeWorkout.currentSet, total: totalSets })}
        </p>

        {/* Current set display */}
        <div className="rounded-xl bg-slate-100 p-6 text-center dark:bg-slate-800">
          {exercise.isCardio ? (
            cardioRemaining === null ? (
              <>
                <p className="text-slate-600 dark:text-slate-400">{t('workout.duration')}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {levelInfo.duration != null ? formatSeconds(levelInfo.duration) : '—'}
                </p>
              </>
            ) : (
              <>
                <p className="text-slate-600 dark:text-slate-400">{t('workout.timeRemaining')}</p>
                <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                  {formatSeconds(cardioRemaining)}
                </p>
              </>
            )
          ) : (
            <>
              <p className="text-slate-600 dark:text-slate-400">{t('workout.targetReps')}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {levelInfo.reps ?? '—'}
              </p>
            </>
          )}
          {(levelInfo.weight !== undefined && levelInfo.weight !== 'bodyweight' && levelInfo.weight !== 0) && (
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t('workout.weightLabel', {
                value: typeof levelInfo.weight === 'number'
                  ? t('workout.weightKg', { n: levelInfo.weight })
                  : levelInfo.weight,
              })}
            </p>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {t('workout.restAfterSet')}{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {formatSeconds(exercise.restBetweenSets)}
          </span>
        </p>

        {/* All sets overview */}
        <div className="mt-auto text-sm rounded-xl bg-slate-100 p-4 text-center dark:bg-slate-800">
          <p className="mb-2 font-medium text-slate-500 dark:text-slate-400">
            {t('workout.allSetsTitle')}
          </p>
          <div className="flex items-start justify-center gap-1">
            {allSets.map((set, index) => {
              const setNumber = index + 1
              const isCurrent = setNumber === activeWorkout.currentSet
              const isCompleted = setNumber <= completedSets
              const reps = 'reps' in set ? set.reps : null
              const duration = 'duration' in set ? set.duration : null
              const weight = 'weight' in set ? set.weight : null
              const hasWeight = weight !== null && weight !== undefined && weight !== 'bodyweight' && weight !== 0
              const baseValue = exercise.isCardio
                ? duration != null ? formatSeconds(duration) : '—'
                : reps ?? '—'
              const weightLabel = hasWeight
                ? typeof weight === 'number' ? t('workout.weightKg', { n: weight }) : weight
                : null

              return (
                <div key={index} className="flex items-start">
                  {index > 0 && (
                    <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                  )}
                  <div
                    className={`flex flex-col items-center tabular-nums ${
                      isCurrent
                        ? 'font-bold text-slate-900 dark:text-white'
                        : isCompleted
                          ? 'text-slate-400 line-through dark:text-slate-500'
                          : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span>{baseValue} {t('workout.reps')}</span>
                    {weightLabel && <span>{weightLabel}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {exercise.isCardio ? (
          cardioRemaining === null ? (
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="active:scale-[0.98]"
                onClick={handleCardioStartSet}
              >
                {t('workout.startSet')}
              </Button>
              <Button variant="secondary" size="md" fullWidth onClick={handleCardioCompleteEarly}>
                {t('workout.completeSet')}
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              className="active:scale-[0.98]"
              onClick={handleCardioCompleteEarly}
            >
              {t('workout.completeEarly')}
            </Button>
          )
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="active:scale-[0.98]"
            onClick={completeSet}
          >
            {t('workout.completeSet')}
          </Button>
        )}
      </div>
      <Modal
        open={showQuitConfirm}
        onClose={closeQuitModal}
        title={t('workout.quitConfirmTitle')}
        titleId="quit-modal-title"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('workout.quitConfirmMessage')}
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" fullWidth onClick={closeQuitModal}>
            {t('common.cancel')}
          </Button>
          <Button variant="dangerFilled" fullWidth onClick={handleQuitConfirm}>
            {t('workout.quitWorkout')}
          </Button>
        </div>
      </Modal>
    </>
  )
}
