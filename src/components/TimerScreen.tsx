import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { startCountdown, formatSeconds } from '../timer-utils'
import { playBeep } from '../sound'

type TimerState = 'idle' | 'running' | 'paused' | 'done'

const PRESETS = [
  { label: '1', seconds: 60 },
  { label: '2', seconds: 120 },
  { label: '3', seconds: 180 },
  { label: '5', seconds: 300 },
  { label: '10', seconds: 600 },
  { label: '15', seconds: 900 },
  { label: '20', seconds: 1200 },
  { label: '25', seconds: 1500 },
  { label: '30', seconds: 1800 },
]

export function TimerScreen() {
  const { t } = useTranslation()

  const [duration, setDuration] = useState(300) // 5 minutes default
  const [remaining, setRemaining] = useState(300)
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const stopRef = useRef<(() => void) | null>(null)
  const pausedAtRef = useRef<number | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopRef.current) stopRef.current()
    }
  }, [])

  const startTimer = useCallback(() => {
    const secondsToRun = timerState === 'paused' && pausedAtRef.current !== null
      ? pausedAtRef.current
      : duration

    setRemaining(secondsToRun)
    setTimerState('running')
    pausedAtRef.current = null

    stopRef.current = startCountdown(
      secondsToRun,
      (r) => setRemaining(r),
      () => {
        setTimerState('done')
        playBeep()
        stopRef.current = null
      }
    )
  }, [duration, timerState])

  const pauseTimer = useCallback(() => {
    if (stopRef.current) {
      stopRef.current()
      stopRef.current = null
    }
    pausedAtRef.current = remaining
    setTimerState('paused')
  }, [remaining])

  const resetTimer = useCallback(() => {
    if (stopRef.current) {
      stopRef.current()
      stopRef.current = null
    }
    pausedAtRef.current = null
    setRemaining(duration)
    setTimerState('idle')
  }, [duration])

  const selectPreset = (seconds: number) => {
    if (timerState === 'running') return
    setDuration(seconds)
    setRemaining(seconds)
    pausedAtRef.current = null
    setTimerState('idle')
  }

  // Progress calculation (0 to 1)
  const progress = timerState === 'idle' ? 0 : 1 - remaining / duration

  // SVG circle calculations
  const size = 220
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-4">
        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">{t('timer.title')}</h1>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
        {/* Preset buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.seconds}
              onClick={() => selectPreset(preset.seconds)}
              disabled={timerState === 'running'}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                duration === preset.seconds && timerState !== 'done'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              } disabled:opacity-50`}
            >
              {preset.label} {t('timer.min')}
            </button>
          ))}
        </div>

        {/* Timer display with progress ring */}
        <div className="relative flex items-center justify-center">
          <svg
            width={size}
            height={size}
            className="rotate-[-90deg]"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-200 dark:text-slate-700"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-200 ${
                timerState === 'done'
                  ? 'text-emerald-500'
                  : 'text-emerald-600'
              }`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {timerState === 'done' ? (
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {t('timer.done')}
              </span>
            ) : (
              <span className="text-5xl font-bold tabular-nums text-slate-900 dark:text-white">
                {formatSeconds(remaining)}
              </span>
            )}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-4">
          {/* Reset button */}
          <button
            onClick={resetTimer}
            disabled={timerState === 'idle'}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-md transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:shadow-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {t('timer.reset')}
          </button>

          {/* Start/Pause button */}
          {timerState === 'running' ? (
            <button
              onClick={pauseTimer}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 text-lg font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-95"
            >
              {t('timer.pause')}
            </button>
          ) : (
            <button
              onClick={startTimer}
              disabled={timerState === 'done'}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-40 disabled:shadow-none"
            >
              {t('timer.start')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
