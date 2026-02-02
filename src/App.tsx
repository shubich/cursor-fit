import { useEffect } from 'react'
import { useStore } from './store'
import { Home } from './components/Home'
import { ExerciseList } from './components/ExerciseList'
import { ExerciseForm } from './components/ExerciseForm'
import { SessionList } from './components/SessionList'
import { SessionCreator } from './components/SessionCreator'
import { ActiveWorkoutScreen } from './components/ActiveWorkoutScreen'
import { ResultsScreen } from './components/ResultsScreen'

function App() {
  const screen = useStore((s) => s.screen)
  const load = useStore((s) => s.load)

  useEffect(() => {
    load()
  }, [load])

  switch (screen) {
    case 'home':
      return <Home />
    case 'exercises':
      return <ExerciseList />
    case 'exercise-create':
    case 'exercise-edit':
      return <ExerciseForm />
    case 'sessions':
      return <SessionList />
    case 'session-create':
    case 'session-edit':
      return <SessionCreator />
    case 'workout':
      return <ActiveWorkoutScreen />
    case 'results':
      return <ResultsScreen />
    default:
      return <Home />
  }
}

export default App
