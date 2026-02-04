import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from './store'
import { Home } from './components/Home'
import { ExerciseList } from './components/ExerciseList'
import { ExerciseForm } from './components/ExerciseForm'
import { SessionList } from './components/SessionList'
import { SessionCreator } from './components/SessionCreator'
import { ActiveWorkoutScreen } from './components/ActiveWorkoutScreen'
import { ResultsScreen } from './components/ResultsScreen'

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const lng = i18n.language?.startsWith('ru') ? 'ru' : 'en'
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => i18n.changeLanguage('en')}
        className={`rounded-md px-2 py-1 text-sm font-medium transition-colors ${
          lng === 'en'
            ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        En
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage('ru')}
        className={`rounded-md px-2 py-1 text-sm font-medium transition-colors ${
          lng === 'ru'
            ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        Ru
      </button>
    </div>
  )
}

function App() {
  const screen = useStore((s) => s.screen)
  const load = useStore((s) => s.load)

  useEffect(() => {
    load()
  }, [load])

  const content = (() => {
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
  })()

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="flex shrink-0 items-center justify-end gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-700">
        <LanguageSwitcher />
      </header>
      <main className="flex min-h-0 flex-1 flex-col">{content}</main>
    </div>
  )
}

export default App
