import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from './store'
import { Home } from './components/Home'
import { TimerScreen } from './components/TimerScreen'
import { StopwatchScreen } from './components/StopwatchScreen'
import { ExerciseList } from './components/ExerciseList'
import { ExerciseForm } from './components/ExerciseForm'
import { SessionList } from './components/SessionList'
import { SessionCreator } from './components/SessionCreator'
import { ActiveWorkoutScreen } from './components/ActiveWorkoutScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { HistoryScreen } from './components/HistoryScreen'
import { SettingsScreen } from './components/SettingsScreen'
import { Button } from './components/ui'
import { ChevronLeft } from 'lucide-react'

function App() {
  const { t } = useTranslation()
  const screen = useStore((s) => s.screen)
  const setScreen = useStore((s) => s.setScreen)
  const setShowQuitConfirm = useStore((s) => s.setShowQuitConfirm)
  const load = useStore((s) => s.load)

  useEffect(() => {
    load()
  }, [load])

  const handleHomeClick = () => {
    if (screen === 'workout') {
      setShowQuitConfirm(true)
    } else {
      setScreen('home')
    }
  }

  const content = (() => {
    switch (screen) {
      case 'home':
        return <Home />
      case 'timer':
        return <TimerScreen />
      case 'stopwatch':
        return <StopwatchScreen />
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
      case 'history':
        return <HistoryScreen />
      case 'settings':
        return <SettingsScreen />
      default:
        return <Home />
    }
  })()

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="flex shrink-0 items-center border-b border-slate-200 px-4 py-2 dark:border-slate-700">
        <div className="w-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHomeClick}
            className={screen === 'home' ? 'invisible' : ''}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <h1 className="flex-1 text-center text-lg font-semibold text-slate-900 dark:text-white">
          {t('home.title')}
        </h1>
        <div className="w-16" />
      </header>
      <main className="flex min-h-0 flex-1 flex-col">{content}</main>
    </div>
  )
}

export default App
