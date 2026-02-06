import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { Button } from './ui'

interface Lap {
  number: number
  time: number // total elapsed at this lap
  delta: number // time since previous lap
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((ms % 1000) / 10)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
}

function formatLapTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((ms % 1000) / 10)
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }
  return `${seconds}.${centiseconds.toString().padStart(2, '0')}`
}

export function StopwatchScreen() {
  const { t } = useTranslation()
  const setScreen = useStore((s) => s.setScreen)

  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  
  const startTimeRef = useRef<number | null>(null)
  const accumulatedRef = useRef(0)
  const frameRef = useRef<number | null>(null)

  const tick = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = performance.now()
      setElapsed(accumulatedRef.current + (now - startTimeRef.current))
    }
    frameRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(() => {
    startTimeRef.current = performance.now()
    setIsRunning(true)
    frameRef.current = requestAnimationFrame(tick)
  }, [tick])

  const stop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    if (startTimeRef.current !== null) {
      accumulatedRef.current += performance.now() - startTimeRef.current
      startTimeRef.current = null
    }
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    startTimeRef.current = null
    accumulatedRef.current = 0
    setElapsed(0)
    setIsRunning(false)
    setLaps([])
  }, [])

  const lap = useCallback(() => {
    const currentTime = elapsed
    const lastLapTime = laps.length > 0 ? laps[0].time : 0
    const delta = currentTime - lastLapTime
    
    setLaps((prev) => [
      {
        number: prev.length + 1,
        time: currentTime,
        delta,
      },
      ...prev,
    ])
  }, [elapsed, laps])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  const hasStarted = elapsed > 0 || isRunning

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <Button variant="ghost" size="sm" onClick={() => setScreen('home')}>
          ← {t('common.home')}
        </Button>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('stopwatch.title')}
        </h1>
      </div>

      <div className="flex flex-1 flex-col items-center gap-6 p-6">
        {/* Time display */}
        <div className="flex items-center justify-center py-8">
          <span className="text-5xl font-bold tabular-nums text-slate-900 dark:text-white sm:text-6xl">
            {formatTime(elapsed)}
          </span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          {/* Lap / Reset button (left) */}
          {isRunning ? (
            <button
              onClick={lap}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-md transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {t('stopwatch.lap')}
            </button>
          ) : (
            <button
              onClick={reset}
              disabled={!hasStarted}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-md transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:shadow-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {t('stopwatch.reset')}
            </button>
          )}

          {/* Start / Stop button (right) */}
          {isRunning ? (
            <button
              onClick={stop}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-lg font-bold text-white shadow-lg transition-all hover:bg-red-600 active:scale-95"
            >
              {t('stopwatch.stop')}
            </button>
          ) : (
            <button
              onClick={start}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-95"
            >
              {t('stopwatch.start')}
            </button>
          )}
        </div>

        {/* Lap list */}
        {laps.length > 0 && (
          <div className="mt-4 w-full max-w-sm flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="max-h-64 overflow-y-auto">
              {laps.map((lapItem) => (
                <div
                  key={lapItem.number}
                  className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-slate-700"
                >
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {t('stopwatch.lapNumber', { n: lapItem.number })}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm tabular-nums text-slate-900 dark:text-white">
                      {formatLapTime(lapItem.time)}
                    </span>
                    <span className="font-mono text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                      +{formatLapTime(lapItem.delta)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
