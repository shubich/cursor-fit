import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatSeconds, startCountdown } from './timer-utils'

describe('formatSeconds', () => {
  it('formats zero as 0:00', () => {
    expect(formatSeconds(0)).toBe('0:00')
  })

  it('formats seconds only', () => {
    expect(formatSeconds(45)).toBe('0:45')
  })

  it('formats minutes and seconds', () => {
    expect(formatSeconds(90)).toBe('1:30')
    expect(formatSeconds(125)).toBe('2:05')
  })

  it('pads seconds with zero', () => {
    expect(formatSeconds(61)).toBe('1:01')
  })
})

describe('startCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls onTick with remaining seconds and onDone when countdown finishes (fallback path)', () => {
    const onTick = vi.fn()
    const onDone = vi.fn()
    const stop = startCountdown(3, onTick, onDone)

    // setInterval(200): first tick after 200ms, remaining = ceil((3000-200)/1000) = 3
    vi.advanceTimersByTime(200)
    expect(onTick).toHaveBeenCalledWith(3)
    vi.advanceTimersByTime(1000)
    expect(onTick).toHaveBeenCalledWith(2)
    vi.advanceTimersByTime(1000)
    expect(onTick).toHaveBeenCalledWith(1)
    vi.advanceTimersByTime(1000)
    expect(onTick).toHaveBeenLastCalledWith(0)
    expect(onDone).toHaveBeenCalledTimes(1)

    stop()
  })

  it('cleanup stops the interval', () => {
    const onTick = vi.fn()
    const onDone = vi.fn()
    const stop = startCountdown(10, onTick, onDone)
    vi.advanceTimersByTime(500)
    const countBefore = onTick.mock.calls.length
    stop()
    vi.advanceTimersByTime(2000)
    expect(onTick.mock.calls.length).toBe(countBefore)
    expect(onDone).not.toHaveBeenCalled()
  })
})
