import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { useStore } from '../store'

/** Reset store to initial state before each test that uses this. */
export function resetStore() {
  useStore.setState({
    screen: 'home',
    exercises: [],
    sessions: [],
    workoutHistory: [],
    activeWorkout: null,
    lastResult: null,
    editingExerciseId: null,
    editingSessionId: null,
  })
}

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: AllTheProviders,
    ...options,
  })
}

export * from '@testing-library/react'
export { customRender as render }
