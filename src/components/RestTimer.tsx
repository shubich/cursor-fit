import { useEffect, useState } from 'react'
import { startCountdown, formatSeconds } from '../timer-utils'
import { playBeep } from '../sound'

interface RestTimerProps {
  /** When rest ends (timestamp). If null, show "Next" button only (no countdown). */
  restEndsAt: number | null
  /** Rest duration in seconds (for starting countdown). */
  restSeconds: number
  isRestBetweenExercises: boolean
  onRestComplete: () => void
  /** Label when between exercises. */
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
      <div className="rounded-xl bg-amber-100 dark:bg-amber-900/30 p-4 text-center">
        <p className="text-lg font-medium text-amber-800 dark:text-amber-200">
          {isRestBetweenExercises ? nextLabel : 'Next set'}
        </p>
        <button
          type="button"
          onClick={onRestComplete}
          className="mt-3 w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white shadow hover:bg-amber-600"
        >
          {isRestBetweenExercises ? nextLabel : 'Start next set'}
        </button>
      </div>
    )
  }

  if (remaining != null && remaining <= 0) {
    return (
      <div className="rounded-xl bg-green-100 dark:bg-green-900/30 p-4 text-center">
        <p className="text-lg font-semibold text-green-800 dark:text-green-200">
          Start next {isRestBetweenExercises ? 'exercise' : 'set'}!
        </p>
        <button
          type="button"
          onClick={onRestComplete}
          className="mt-3 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
        >
          Continue
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-slate-200 dark:bg-slate-700 p-6 text-center">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {isRestBetweenExercises ? 'Rest before next exercise' : 'Rest'}
      </p>
      <p className="mt-2 text-5xl font-bold tabular-nums text-slate-900 dark:text-white">
        {remaining != null ? formatSeconds(remaining) : '--:--'}
      </p>
      <p className="mt-1 text-xs text-slate-500">Stay on this screen or switch tabs — timer stays accurate</p>
    </div>
  )
}
