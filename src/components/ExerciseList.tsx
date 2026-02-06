import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { Button, Card, Modal } from './ui'
import type { Exercise } from '../types'

export function ExerciseList() {
  const { t } = useTranslation()
  const exercises = useStore((s) => s.exercises)
  const setScreen = useStore((s) => s.setScreen)
  const setEditingExerciseId = useStore((s) => s.setEditingExerciseId)
  const deleteExercise = useStore((s) => s.deleteExercise)
  const startSingleExerciseWorkout = useStore((s) => s.startSingleExerciseWorkout)

  const [levelByExerciseId, setLevelByExerciseId] = useState<Record<string, number>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [exerciseToDeleteId, setExerciseToDeleteId] = useState<string | null>(null)

  const handleEdit = (id: string) => {
    setEditingExerciseId(id)
    setScreen('exercise-edit')
  }

  const getSelectedLevel = (ex: Exercise) =>
    levelByExerciseId[ex.id] ?? ex.levels[0]?.level ?? 1

  const handleStartWorkout = (ex: Exercise) => {
    startSingleExerciseWorkout(ex.id, getSelectedLevel(ex))
  }

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('exercises.title')}</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingExerciseId(null)
            setScreen('exercise-create')
          }}
        >
          {t('exercises.addExercise')}
        </Button>
      </div>

      {exercises.length === 0 ? (
        <p className="rounded-xl bg-slate-100 p-6 text-center text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {t('exercises.noExercises')}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {exercises.map((ex) => {
            const isExpanded = expandedId === ex.id
            return (
              <Card
                as="li"
                key={ex.id}
                className={`flex flex-col gap-2 p-4 ${isExpanded ? 'ring-2 ring-emerald-500 ring-inset dark:ring-emerald-500' : ''}`}
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-2 rounded-lg text-left focus:outline-none"
                  onClick={() => toggleExpanded(ex.id)}
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded
                      ? `${t('common.collapse')} ${ex.name}`
                      : `${t('common.expand')} ${ex.name}`
                  }
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-900 dark:text-white">{ex.name}</h2>
                    {!isExpanded && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {ex.isCardio ? t('exercises.cardio') : t('exercises.strength')} · {ex.levels.length} {t('exercises.levels')}
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
                      {ex.isCardio ? t('exercises.cardio') : t('exercises.strength')} · {ex.levels.length} {t('exercises.levels')} · {t('exercises.rest')} {ex.restBetweenSets}s
                    </p>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(ex.id)}>
                        {t('common.edit')}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setExerciseToDeleteId(ex.id)}>
                        {t('common.delete')}
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span>{t('common.level')}:</span>
                        <select
                          value={getSelectedLevel(ex)}
                          onChange={(e) =>
                            setLevelByExerciseId((prev) => ({
                              ...prev,
                              [ex.id]: Number(e.target.value),
                            }))
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                        >
                          {ex.levels.map((l) => (
                            <option key={l.level} value={l.level}>
                              {l.level}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Button
                        variant="primary"
                        inverted
                        size="md"
                        className="w-full sm:flex-1"
                        onClick={() => handleStartWorkout(ex)}
                      >
                        {t('exercises.startWorkout')}
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            )
          })}
        </ul>
      )}

      <Modal
        open={exerciseToDeleteId != null}
        onClose={() => setExerciseToDeleteId(null)}
        title={t('exercises.deleteConfirmTitle')}
        titleId="delete-exercise-modal-title"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('exercises.deleteConfirmMessage')}
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setExerciseToDeleteId(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="dangerFilled"
            fullWidth
            onClick={() => {
              if (exerciseToDeleteId) {
                deleteExercise(exerciseToDeleteId)
                setExerciseToDeleteId(null)
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
