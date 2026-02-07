import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { formatSeconds } from '../timer-utils'
import { Button, Card, Modal } from './ui'
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
  const clearWorkoutHistory = useStore((s) => s.clearWorkoutHistory)
  const deleteWorkoutResult = useStore((s) => s.deleteWorkoutResult)

  const [selected, setSelected] = useState<WorkoutResult | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const locale = i18n.language?.startsWith('ru') ? 'ru-RU' : 'en-US'

  const handleClearConfirm = () => {
    clearWorkoutHistory()
    setShowClearConfirm(false)
  }

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteWorkoutResult(deleteTargetId)
      setDeleteTargetId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('history.title')}</h1>
        {workoutHistory.length > 0 && (
          <Button variant="danger" size="sm" onClick={() => setShowClearConfirm(true)}>
            {t('history.clearHistory')}
          </Button>
        )}
      </div>

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
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {result.sessionName ?? result.exerciseNames.join(', ')}
                </p>
                <button
                  type="button"
                  className="shrink-0 rounded-md px-1.5 py-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTargetId(result.id)
                  }}
                  aria-label={t('common.delete')}
                >
                  ✕
                </button>
              </div>
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

      {/* Detail modal */}
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

      {/* Clear all confirmation */}
      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title={t('history.clearHistoryTitle')}
        titleId="clear-history-modal-title"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('history.clearHistoryMessage')}
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowClearConfirm(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="dangerFilled" fullWidth onClick={handleClearConfirm}>
            {t('history.clearHistory')}
          </Button>
        </div>
      </Modal>

      {/* Delete single confirmation */}
      <Modal
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        title={t('history.deleteTitle')}
        titleId="delete-history-modal-title"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('history.deleteMessage')}
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDeleteTargetId(null)}>
            {t('common.cancel')}
          </Button>
          <Button variant="dangerFilled" fullWidth onClick={handleDeleteConfirm}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
