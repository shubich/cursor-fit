import { useEffect, useState } from 'react'
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
import { Button } from './components/ui'

const THEME_STORAGE_KEY = 'cursor-fit:theme'

function ThemeSwitcher() {
  const { t } = useTranslation()
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'))
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const setTheme = (dark: boolean) => {
    const value = dark ? 'dark' : 'light'
    localStorage.setItem(THEME_STORAGE_KEY, value)
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    setIsDark(dark)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => setTheme(false)}
        className={`rounded-md px-2 py-1 text-sm font-medium transition-colors ${
          !isDark
            ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        {t('common.themeLight')}
      </button>
      <button
        type="button"
        onClick={() => setTheme(true)}
        className={`rounded-md px-2 py-1 text-sm font-medium transition-colors ${
          isDark
            ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        {t('common.themeDark')}
      </button>
    </div>
  )
}

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
      default:
        return <Home />
    }
  })()

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-700">
        {screen !== 'home' && (
          <Button variant="ghost" size="sm" onClick={handleHomeClick}>
            ← {t('common.home')}
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">{content}</main>
    </div>
  )
}

export default App
