import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { formatSeconds } from '../timer-utils'
import { Card, Modal } from './ui'
import { ResultDetails } from './ResultsScreen'
import type { WorkoutResult } from '../types'

function formatDate(timestamp: number, locale: string): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function HistoryScreen() {
  const { t, i18n } = useTranslation()
  const workoutHistory = useStore((s) => s.workoutHistory)
  const [selected, setSelected] = useState<WorkoutResult | null>(null)

  const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US'

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('history.title')}</h1>

      {workoutHistory.length === 0 ? (
        <p className="rounded-xl bg-slate-100 p-6 text-center text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {t('history.noHistory')}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {workoutHistory.map((result) => (
            <Card
              as="li"
              key={result.id}
              className="cursor-pointer p-4 transition-colors hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-700 dark:active:bg-slate-600"
              onClick={() => setSelected(result)}
            >
              <p className="font-semibold text-slate-900 dark:text-white">
                {result.sessionName ?? result.exerciseNames.join(', ')}
              </p>
              <div className="mt-1 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span>{formatDate(result.completedAt, locale)}</span>
                <span>·</span>
                <span>{formatSeconds(result.totalDurationSeconds)}</span>
                <span>·</span>
                <span>{result.completedSets.length} sets</span>
              </div>
            </Card>
          ))}
        </ul>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.sessionName ?? selected?.exerciseNames.join(', ') ?? ''}
        titleId="history-detail-modal-title"
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <ResultDetails result={selected} />
          </div>
        )}
      </Modal>
    </div>
  )
}
