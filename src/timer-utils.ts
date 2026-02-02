/**
 * Timer utilities: Web Worker wrapper and fallback using time-delta correction
 * so timers stay accurate when tab is in background.
 */

export type TimerCallback = (remainingSeconds: number) => void
export type TimerDoneCallback = () => void

let worker: Worker | null = null
let workerReady = false

function getWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null
  if (worker != null) return worker
  try {
    worker = new Worker(new URL('./timer.worker.ts', import.meta.url), { type: 'module' })
    workerReady = true
    return worker
  } catch {
    return null
  }
}

const id = () => Math.random().toString(36).slice(2)

/**
 * Start a countdown that fires on each second and once when done.
 * Uses Web Worker when available; otherwise falls back to setInterval with
 * end-time (time-delta) so it stays correct in background tabs.
 */
export function startCountdown(
  durationSeconds: number,
  onTick: TimerCallback,
  onDone: TimerDoneCallback
): () => void {
  const timerId = id()
  const w = getWorker()

  if (w && workerReady) {
    const handler = (e: MessageEvent<{ type: string; remaining?: number; id?: string }>) => {
      if (e.data.id !== timerId) return
      if (e.data.type === 'tick' && typeof e.data.remaining === 'number') {
        onTick(e.data.remaining)
      }
      if (e.data.type === 'done') {
        w.removeEventListener('message', handler)
        onDone()
      }
    }
    w.addEventListener('message', handler)
    w.postMessage({ type: 'start', durationSeconds, id: timerId })
    return () => {
      w.removeEventListener('message', handler)
      w.postMessage({ type: 'stop', id: timerId })
    }
  }

  // Fallback: setInterval with end timestamp so we recalc remaining each tick
  const endAt = Date.now() + durationSeconds * 1000
  const interval = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
    onTick(remaining)
    if (remaining <= 0) {
      clearInterval(interval)
      onDone()
    }
  }, 200)

  return () => clearInterval(interval)
}

/**
 * Format seconds as MM:SS.
 */
export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
