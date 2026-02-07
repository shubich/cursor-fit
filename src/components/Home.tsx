import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { Button } from './ui'

export function Home() {
  const { t } = useTranslation()
  const setScreen = useStore((s) => s.setScreen)

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('home.title')}</h1>
      <p className="text-slate-600 dark:text-slate-400">{t('home.subtitle')}</p>

      <div className="flex flex-col gap-3">
        <Button variant="nav" onClick={() => setScreen('exercises')}>
          {t('home.exercises')}
        </Button>
        <Button variant="nav" onClick={() => setScreen('sessions')}>
          {t('home.sessions')}
        </Button>
        <Button variant="nav" onClick={() => setScreen('stopwatch')}>
          {t('home.stopwatch')}
        </Button>
        <Button variant="nav" onClick={() => setScreen('timer')}>
          {t('home.timer')}
        </Button>
        <Button variant="nav" onClick={() => setScreen('history')}>
          {t('home.history')}
        </Button>
      </div>
    </div>
  )
}
