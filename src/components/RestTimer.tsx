import { useEffect, useState } from 'react'
import { startCountdown, formatSeconds } from '../timer-utils'
import { playBeep } from '../sound'
import { Button } from './ui'

interface RestTimerProps {
  restEndsAt: number | null
  restSeconds: number
  isRestBetweenExercises: boolean
  onRestComplete: () => void
  nextLabel?: string
}

export function RestTimer({
  restEndsAt,
  restSeconds,
  isRestBetweenExercises,
  onRestComplete,
  nextLabel = 'Next Exercise',
}: RestTimerProps) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (restEndsAt == null) {
      setRemaining(restSeconds === 0 ? 0 : null)
      return
    }
    if (restSeconds <= 0) {
      setRemaining(0)
      return
    }
    const remainingMs = restEndsAt - Date.now()
    const initialRemaining = Math.max(0, Math.ceil(remainingMs / 1000))
    setRemaining(initialRemaining)
    if (initialRemaining <= 0) {
      playBeep()
      onRestComplete()
      return
    }
    const stop = startCountdown(
      initialRemaining,
      (r) => setRemaining(r),
      () => {
        playBeep()
        onRestComplete()
      }
    )
    return stop
  }, [restEndsAt, restSeconds])

  if (restEndsAt == null && restSeconds === 0) {
    return (
      <div className="rounded-xl bg-amber-100 p-4 text-center dark:bg-amber-900/30">
        <p className="text-lg font-medium text-amber-800 dark:text-amber-200">
          {isRestBetweenExercises ? nextLabel : 'Next set'}
        </p>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-3 !bg-amber-500 !hover:bg-amber-600"
          onClick={onRestComplete}
        >
          {isRestBetweenExercises ? nextLabel : 'Start next set'}
        </Button>
      </div>
    )
  }

  if (remaining != null && remaining <= 0) {
    return (
      <div className="rounded-xl bg-green-100 p-4 text-center dark:bg-green-900/30">
        <p className="text-lg font-semibold text-green-800 dark:text-green-200">
          Start next {isRestBetweenExercises ? 'exercise' : 'set'}!
        </p>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-3 !bg-green-600 !hover:bg-green-700"
          onClick={onRestComplete}
        >
          Continue
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-slate-200 p-6 text-center dark:bg-slate-700">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {isRestBetweenExercises ? 'Rest before next exercise' : 'Rest'}
      </p>
      <p className="mt-2 text-5xl font-bold tabular-nums text-slate-900 dark:text-white">
        {remaining != null ? formatSeconds(remaining) : '--:--'}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Stay on this screen or switch tabs — timer stays accurate
      </p>
    </div>
  )
}
