import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { Button } from './ui'

const randomQuoteIndex = Math.floor(Math.random() * 30)

export function Home() {
  const { t } = useTranslation()
  const setScreen = useStore((s) => s.setScreen)
  const timerEnabled = useStore((s) => s.timerEnabled)
  const stopwatchEnabled = useStore((s) => s.stopwatchEnabled)

  const quotes = t('home.quotes', { returnObjects: true }) as { text: string; author: string }[]
  const quote = quotes[randomQuoteIndex % quotes.length]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
      <p className="text-slate-600 dark:text-slate-400">{t('home.subtitle')}</p>

      <div className="flex flex-col gap-3">
        <Button variant="nav" onClick={() => setScreen('exercises')}>
          {t('home.exercises')}
        </Button>
        <Button variant="nav" onClick={() => setScreen('sessions')}>
          {t('home.sessions')}
        </Button>
        {stopwatchEnabled && (
          <Button variant="nav" onClick={() => setScreen('stopwatch')}>
            {t('home.stopwatch')}
          </Button>
        )}
        {timerEnabled && (
          <Button variant="nav" onClick={() => setScreen('timer')}>
            {t('home.timer')}
          </Button>
        )}
        <Button variant="nav" onClick={() => setScreen('history')}>
          {t('home.history')}
        </Button>
        <Button variant="nav" onClick={() => setScreen('settings')}>
          {t('home.settings')}
        </Button>
      </div>

      <div className="mt-auto rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
        <p className="text-sm italic text-slate-500 dark:text-slate-400">
          "{quote.text}"
        </p>
        <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
          — {quote.author}
        </p>
      </div>
    </div>
  )
}
