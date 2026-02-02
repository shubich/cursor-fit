/**
 * Web Worker for countdown timer. Runs in a separate thread so it stays accurate
 * when the tab is in the background or minimized.
 */

export type TimerMessage =
  | { type: 'start'; durationSeconds: number; id: string }
  | { type: 'stop'; id: string }

let intervalId: ReturnType<typeof setInterval> | null = null
let endTime: number = 0
let currentId: string | null = null

function tick() {
  if (currentId == null) return
  const now = Date.now()
  const remaining = Math.max(0, Math.ceil((endTime - now) / 1000))
  self.postMessage({ type: 'tick', remaining, id: currentId })
  if (remaining <= 0) {
    if (intervalId != null) {
      clearInterval(intervalId)
      intervalId = null
    }
    self.postMessage({ type: 'done', id: currentId })
    currentId = null
  }
}

self.onmessage = (e: MessageEvent<TimerMessage>) => {
  const msg = e.data
  if (msg.type === 'stop') {
    if (intervalId != null) {
      clearInterval(intervalId)
      intervalId = null
    }
    currentId = null
    return
  }
  if (msg.type === 'start') {
    if (intervalId != null) clearInterval(intervalId)
    currentId = msg.id
    endTime = Date.now() + msg.durationSeconds * 1000
    tick()
    intervalId = setInterval(tick, 200) // tick every 200ms for smooth display
  }
}
