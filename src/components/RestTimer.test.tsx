import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RestTimer } from './RestTimer'

vi.mock('../sound', () => ({ playBeep: vi.fn() }))
vi.mock('../timer-utils', () => ({
  formatSeconds: (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`,
  startCountdown: vi.fn((_duration: number, onTick: (r: number) => void, onDone: () => void) => {
    onTick(30)
    return () => {}
  }),
}))

describe('RestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows "Next set" / "Start next set" when restEndsAt is null and restSeconds is 0', () => {
    const onRestComplete = vi.fn()
    render(
      <RestTimer
        restEndsAt={null}
        restSeconds={0}
        isRestBetweenExercises={false}
        onRestComplete={onRestComplete}
      />
    )
    expect(screen.getByText('Next set')).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: /start next set/i })
    fireEvent.click(btn)
    expect(onRestComplete).toHaveBeenCalledTimes(1)
  })

  it('shows "Next Exercise" when restBetweenExercises and restSeconds 0', () => {
    render(
      <RestTimer
        restEndsAt={null}
        restSeconds={0}
        isRestBetweenExercises={true}
        onRestComplete={vi.fn()}
        nextLabel="Next Exercise"
      />
    )
    expect(screen.getByRole('button', { name: /next exercise/i })).toBeInTheDocument()
    expect(screen.getAllByText('Next Exercise').length).toBeGreaterThanOrEqual(1)
  })

  it('shows countdown when restEndsAt is set and restSeconds > 0', () => {
    const restEndsAt = Date.now() + 45 * 1000
    render(
      <RestTimer
        restEndsAt={restEndsAt}
        restSeconds={45}
        isRestBetweenExercises={false}
        onRestComplete={vi.fn()}
      />
    )
    expect(screen.getByText(/rest/i)).toBeInTheDocument()
    expect(screen.getByText('0:30')).toBeInTheDocument()
  })

  it('shows "Rest before next exercise" when isRestBetweenExercises', () => {
    const restEndsAt = Date.now() + 60 * 1000
    render(
      <RestTimer
        restEndsAt={restEndsAt}
        restSeconds={60}
        isRestBetweenExercises={true}
        onRestComplete={vi.fn()}
      />
    )
    expect(screen.getByText(/rest before next exercise/i)).toBeInTheDocument()
  })
})
