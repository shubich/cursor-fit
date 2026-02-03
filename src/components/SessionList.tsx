import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { Button, Card } from './ui'

export function SessionList() {
  const { t } = useTranslation()
  const sessions = useStore((s) => s.sessions)
  const exercises = useStore((s) => s.exercises)
  const setScreen = useStore((s) => s.setScreen)
  const setEditingSessionId = useStore((s) => s.setEditingSessionId)
  const deleteSession = useStore((s) => s.deleteSession)
  const startSessionWorkout = useStore((s) => s.startSessionWorkout)

  const handleEdit = (id: string) => {
    setEditingSessionId(id)
    setScreen('session-edit')
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
            return (
              <Card as="li" key={session.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      {session.name}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {session.exercises.length} {t('sessions.exercisesCount')} · {t('sessions.restBetween')} {session.restBetweenExercises}s
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500">
                      {names}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(session.id)}>
                      {t('common.edit')}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteSession(session.id)}>
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
                <Button
                  variant="primary"
                  inverted
                  fullWidth
                  onClick={() => startSessionWorkout(session.id)}
                >
                  {t('sessions.startSession')}
                </Button>
              </Card>
            )
          })}
        </ul>
      )}

      <Button variant="secondary" onClick={() => setScreen('home')}>
        {t('common.back')}
      </Button>
    </div>
  )
}
