import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import {
  Dumbbell,
  CalendarDays,
  Timer,
  Clock,
  History,
  Settings,
  ChevronRight,
  Sparkles,
  Activity,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const randomQuoteIndex = Math.floor(Math.random() * 30)

function NavItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <span className="flex-1 font-medium text-slate-900 dark:text-white">{label}</span>
      <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500" />
    </button>
  )
}

export function Home() {
  const { t } = useTranslation()
  const setScreen = useStore((s) => s.setScreen)
  const timerEnabled = useStore((s) => s.timerEnabled)
  const stopwatchEnabled = useStore((s) => s.stopwatchEnabled)

  const quotes = t('home.quotes', { returnObjects: true }) as { text: string; author: string }[]
  const quote = quotes[randomQuoteIndex % quotes.length]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
          <Activity className="h-7 w-7 text-white" />
        </div>
        <p className="text-center text-slate-600 dark:text-slate-400">{t('home.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-3">
        <NavItem icon={Dumbbell} label={t('home.exercises')} onClick={() => setScreen('exercises')} />
        <NavItem icon={CalendarDays} label={t('home.sessions')} onClick={() => setScreen('sessions')} />
        {stopwatchEnabled && (
          <NavItem icon={Clock} label={t('home.stopwatch')} onClick={() => setScreen('stopwatch')} />
        )}
        {timerEnabled && (
          <NavItem icon={Timer} label={t('home.timer')} onClick={() => setScreen('timer')} />
        )}
        <NavItem icon={History} label={t('home.history')} onClick={() => setScreen('history')} />
        <NavItem icon={Settings} label={t('home.settings')} onClick={() => setScreen('settings')} />
      </div>

      <div className="mt-auto rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
        <div className="mb-2 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {t('home.dailyMotivation')}
          </span>
        </div>
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
