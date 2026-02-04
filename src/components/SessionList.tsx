import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { Button, Card, Modal } from './ui'

export function SessionList() {
  const { t } = useTranslation()
  const sessions = useStore((s) => s.sessions)
  const exercises = useStore((s) => s.exercises)
  const setScreen = useStore((s) => s.setScreen)
  const setEditingSessionId = useStore((s) => s.setEditingSessionId)
  const deleteSession = useStore((s) => s.deleteSession)
  const startSessionWorkout = useStore((s) => s.startSessionWorkout)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sessionToDeleteId, setSessionToDeleteId] = useState<string | null>(null)

  const handleEdit = (id: string) => {
    setEditingSessionId(id)
    setScreen('session-edit')
  }

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('sessions.title')}</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingSessionId(null)
            setScreen('session-create')
          }}
        >
          {t('sessions.newSession')}
        </Button>
      </div>

      {sessions.length === 0 ? (
        <p className="rounded-xl bg-slate-100 p-6 text-center text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {t('sessions.noSessions')}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) => {
            const names = session.exercises
              .map((e) => exercises.find((x) => x.id === e.exerciseId)?.name ?? '?')
              .join(', ')
            const isExpanded = expandedId === session.id
            return (
              <Card
                as="li"
                key={session.id}
                className={`flex flex-col gap-2 p-4 ${isExpanded ? 'ring-2 ring-emerald-500 ring-inset dark:ring-emerald-500' : ''}`}
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-2 rounded-lg text-left focus:outline-none"
                  onClick={() => toggleExpanded(session.id)}
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded
                      ? `${t('common.collapse')} ${session.name}`
                      : `${t('common.expand')} ${session.name}`
                  }
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      {session.name}
                    </h2>
                    {!isExpanded && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {session.exercises.length} {t('sessions.exercisesCount')} · {t('sessions.restBetween')} {session.restBetweenExercises}s
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-block shrink-0 text-slate-500 transition-transform dark:text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>
                {isExpanded && (
                  <>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {session.exercises.length} {t('sessions.exercisesCount')} · {t('sessions.restBetween')} {session.restBetweenExercises}s
                    </p>
                    <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                      {names}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(session.id)}>
                        {t('common.edit')}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setSessionToDeleteId(session.id)}>
                        {t('common.delete')}
                      </Button>
                    </div>
                    <Button
                      variant="primary"
                      inverted
                      fullWidth
                      onClick={() => startSessionWorkout(session.id)}
                    >
                      {t('sessions.startSession')}
                    </Button>
                  </>
                )}
              </Card>
            )
          })}
        </ul>
      )}

      <Button variant="secondary" onClick={() => setScreen('home')}>
        {t('common.back')}
      </Button>

      <Modal
        open={sessionToDeleteId != null}
        onClose={() => setSessionToDeleteId(null)}
        title={t('sessions.deleteConfirmTitle')}
        titleId="delete-session-modal-title"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('sessions.deleteConfirmMessage')}
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setSessionToDeleteId(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="dangerFilled"
            fullWidth
            onClick={() => {
              if (sessionToDeleteId) {
                deleteSession(sessionToDeleteId)
                setSessionToDeleteId(null)
              }
            }}
          >
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
