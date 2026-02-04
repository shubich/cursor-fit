import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { createEmptyStrengthLevel, createEmptyCardioLevel } from '../store'
import { Button, Card } from './ui'
import type { StrengthLevel, CardioLevel, StrengthSet, CardioSet, Weight } from '../types'

/** Form set types that allow empty string for numeric fields so inputs can show blank. */
type StrengthSetForm = { reps: number | ''; weight: Weight }
type CardioSetForm = { duration: number | ''; weight?: Weight }
type StrengthLevelForm = { level: number; sets: StrengthSetForm[] }
type CardioLevelForm = { level: number; sets: CardioSetForm[] }

export function ExerciseForm() {
  const { t } = useTranslation()
  const exercises = useStore((s) => s.exercises)
  const editingExerciseId = useStore((s) => s.editingExerciseId)
  const addExercise = useStore((s) => s.addExercise)
  const updateExercise = useStore((s) => s.updateExercise)
  const setScreen = useStore((s) => s.setScreen)

  const isEdit = editingExerciseId != null
  const existing = isEdit ? exercises.find((e) => e.id === editingExerciseId) : null

  const [name, setName] = useState('')
  const [restBetweenSets, setRestBetweenSets] = useState<number | ''>(60)
  const [isCardio, setIsCardio] = useState(false)
  const [levels, setLevels] = useState<(StrengthLevelForm | CardioLevelForm)[]>([])
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setRestBetweenSets(existing.restBetweenSets)
      setIsCardio(existing.isCardio)
      setLevels(
        existing.levels.map((l) => ({ ...l, sets: l.sets.map((s) => ({ ...s })) })) as (
          | StrengthLevel
          | CardioLevel
        )[]
      )
    } else {
      setLevels([
        (isCardio ? createEmptyCardioLevel(1) : createEmptyStrengthLevel(1)) as
          | StrengthLevelForm
          | CardioLevelForm,
      ])
    }
  }, [existing?.id])

  useEffect(() => {
    if (existing) return
    setLevels((prev) =>
      prev.map((_, i) =>
        (isCardio ? createEmptyCardioLevel(i + 1) : createEmptyStrengthLevel(i + 1)) as
          | StrengthLevelForm
          | CardioLevelForm
      )
    )
  }, [isCardio])

  const nameValid = name.trim().length >= 2 && name.trim().length <= 35
  const restValid =
    restBetweenSets !== '' &&
    !Number.isNaN(Number(restBetweenSets)) &&
    Number(restBetweenSets) > 0
  const activeLevels = levels
  const setsValid = activeLevels.every((level) => {
    if ('sets' in level) {
      return level.sets.every((set) => {
        const s = set as StrengthSetForm | CardioSetForm
        if ('reps' in s) return s.reps !== '' && !Number.isNaN(Number(s.reps)) && Number(s.reps) > 0
        if ('duration' in s)
          return s.duration !== '' && !Number.isNaN(Number(s.duration)) && Number(s.duration) > 0
        return true
      })
    }
    return true
  })
  const formValid = nameValid && restValid && setsValid

  const touch = (key: string) => setTouched((t) => ({ ...t, [key]: true }))

  const normalizeWeight = (w: number | string | undefined): number | string =>
    w === '' ? 0 : (w ?? 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formValid) return
    const rest =
      (restBetweenSets as number | '') === '' ? 0 : Number(restBetweenSets as number)
    const rawLev = levels
    const lev = rawLev.map((l) => ({
      ...l,
      sets: l.sets.map((s) => {
        const set = s as StrengthSetForm | CardioSetForm
        if ('reps' in set) {
          return {
            ...set,
            reps: set.reps === '' ? 0 : Number(set.reps),
            weight: normalizeWeight(set.weight),
          } as StrengthSet
        }
        if ('duration' in set) {
          return {
            ...set,
            duration: set.duration === '' ? 0 : Number(set.duration),
            weight: set.weight !== undefined ? normalizeWeight(set.weight) : undefined,
          } as CardioSet
        }
        return s
      }),
    })) as (StrengthLevel | CardioLevel)[]
    if (isEdit && existing) {
      if (existing.isCardio) {
        updateExercise(existing.id, {
          name: name.trim(),
          restBetweenSets: rest,
          levels: lev as CardioLevel[],
        })
      } else {
        updateExercise(existing.id, {
          name: name.trim(),
          restBetweenSets: rest,
          levels: lev as StrengthLevel[],
        })
      }
    } else {
      if (isCardio) {
        addExercise({
          name: name.trim(),
          restBetweenSets: rest,
          isCardio: true,
          levels: lev as CardioLevel[],
        })
      } else {
        addExercise({
          name: name.trim(),
          restBetweenSets: rest,
          isCardio: false,
          levels: lev as StrengthLevel[],
        })
      }
    }
    setScreen('exercises')
  }

  const updateSetInLevel = (
    levelIndex: number,
    setIndex: number,
    data: Partial<StrengthSetForm> | Partial<CardioSetForm>
  ) => {
    setLevels((prev) =>
      prev.map((l, i) => {
        if (i !== levelIndex) return l
        const newSets = [...l.sets]
        newSets[setIndex] = { ...newSets[setIndex], ...data } as typeof l.sets[0]
        return { ...l, sets: newSets } as StrengthLevelForm | CardioLevelForm
      })
    )
  }

  const addSetToLevel = (levelIndex: number) => {
    setLevels((prev) =>
      prev.map((l, i) => {
        if (i !== levelIndex) return l
        if (isCardio) {
          const newSet: CardioSetForm = { duration: 60 }
          return { ...l, sets: [...(l as CardioLevelForm).sets, newSet] } as CardioLevelForm
        }
        const newSet: StrengthSetForm = { reps: 8, weight: 0 }
        return { ...l, sets: [...(l as StrengthLevelForm).sets, newSet] } as StrengthLevelForm
      })
    )
  }

  const removeSetFromLevel = (levelIndex: number, setIndex: number) => {
    setLevels((prev) =>
      prev.map((l, i) => {
        if (i !== levelIndex) return l
        const newSets = l.sets.filter((_, si) => si !== setIndex)
        return { ...l, sets: newSets } as StrengthLevelForm | CardioLevelForm
      })
    )
  }

  const addLevel = () => {
    if (levels.length >= 10) return
    const levelNum = levels.length + 1
    setLevels((prev) => [
      ...prev,
      (isCardio ? createEmptyCardioLevel(levelNum) : createEmptyStrengthLevel(levelNum)) as
        | StrengthLevelForm
        | CardioLevelForm,
    ])
  }

  const removeLevel = (levelIndex: number) => {
    if (levels.length <= 1) return
    setLevels((prev) => {
      const next = prev.filter((_, i) => i !== levelIndex)
      return next.map((l, i) => ({ ...l, level: i + 1 })) as (StrengthLevelForm | CardioLevelForm)[]
    })
  }

  const weightDisplay = (w: number | string) =>
    w === '' ? '' : (w === 'bodyweight' || w === 0 ? '0' : typeof w === 'number' ? String(w) : w)
  const weightParse = (s: string): number | string =>
    s.trim() === '' ? '' : /^\d+(\.\d+)?$/.test(s.trim()) ? Number(s.trim()) : s.trim()

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {isEdit ? t('exerciseForm.editTitle') : t('exerciseForm.newTitle')}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('common.name')}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch('name')}
            className={`mt-1 w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${
              touched.name && !nameValid
                ? 'border-red-500 dark:border-red-400'
                : 'border-slate-300 dark:border-slate-600'
            }`}
            placeholder={t('exerciseForm.namePlaceholder')}
          />
          {touched.name && !nameValid && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {t('exerciseForm.errors.nameLength')}
            </p>
          )}
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isCardio}
            onChange={(e) => setIsCardio(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('exerciseForm.cardio')}</span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('exerciseForm.restBetweenSets')}</span>
          <input
            type="number"
            min={0}
            value={restBetweenSets === '' ? '' : restBetweenSets}
            onChange={(e) =>
              setRestBetweenSets(e.target.value === '' ? '' : Number(e.target.value))
            }
            onBlur={() => touch('restBetweenSets')}
            className={`mt-1 w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${
              touched.restBetweenSets && !restValid
                ? 'border-red-500 dark:border-red-400'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          />
          {touched.restBetweenSets && !restValid && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {t('exerciseForm.errors.restGreaterThanZero')}
            </p>
          )}
        </label>

        <div className="space-y-4">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('exerciseForm.levelsLabel')}</span>
          {levels.map((l, levelIdx) => (
            <Card key={levelIdx} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t('exerciseForm.levelSets', { level: l.level, count: l.sets.length })}
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeLevel(levelIdx)}
                  disabled={levels.length <= 1}
                >
                  {t('common.remove')}
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {l.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className="flex flex-col gap-0.5 rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-end gap-2">
                      {isCardio ? (
                        <>
                          <label className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {t('exerciseForm.durationSec')}
                            </span>
                            <input
                              type="number"
                              min={1}
                              maxLength={4}
                              value={(set as CardioSetForm).duration === '' ? '' : (set as CardioSetForm).duration}
                              onChange={(e) => {
                                const v = e.target.value
                                if (v.length > 4) return
                                updateSetInLevel(levelIdx, setIdx, {
                                  duration: v === '' ? '' : Number(v),
                                })
                              }}
                              onBlur={() => touch(`duration-${levelIdx}-${setIdx}`)}
                              className={`w-20 rounded border px-2 py-1 text-sm dark:bg-slate-800 dark:text-white ${
                                touched[`duration-${levelIdx}-${setIdx}`] &&
                                ((set as CardioSetForm).duration === '' ||
                                  Number.isNaN(Number((set as CardioSetForm).duration)) ||
                                  Number((set as CardioSetForm).duration) <= 0)
                                  ? 'border-red-500 dark:border-red-400'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            />
                          </label>
                          <label className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {t('common.weight')}
                            </span>
                            <input
                              type="text"
                              maxLength={4}
                              value={weightDisplay((set as CardioSetForm).weight ?? 0)}
                              onChange={(e) =>
                                updateSetInLevel(levelIdx, setIdx, {
                                  weight: weightParse(e.target.value),
                                })
                              }
                              className="w-20 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                              placeholder={t('exerciseForm.bodyweightPlaceholder')}
                            />
                          </label>
                        </>
                      ) : (
                        <>
                          <label className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {t('exerciseForm.reps')}
                            </span>
                            <input
                              type="number"
                              min={1}
                              maxLength={4}
                              value={(set as StrengthSetForm).reps === '' ? '' : (set as StrengthSetForm).reps}
                              onChange={(e) => {
                                const v = e.target.value
                                if (v.length > 4) return
                                updateSetInLevel(levelIdx, setIdx, {
                                  reps: v === '' ? '' : Number(v),
                                })
                              }}
                              onBlur={() => touch(`reps-${levelIdx}-${setIdx}`)}
                              className={`w-20 rounded border px-2 py-1 text-sm dark:bg-slate-800 dark:text-white ${
                                touched[`reps-${levelIdx}-${setIdx}`] &&
                                ((set as StrengthSetForm).reps === '' ||
                                  Number.isNaN(Number((set as StrengthSetForm).reps)) ||
                                  Number((set as StrengthSetForm).reps) <= 0)
                                  ? 'border-red-500 dark:border-red-400'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            />
                          </label>
                          <label className="flex flex-col gap-0.5">
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {t('common.weight')}
                            </span>
                            <input
                              type="text"
                              maxLength={4}
                              value={weightDisplay((set as StrengthSetForm).weight)}
                              onChange={(e) =>
                                updateSetInLevel(levelIdx, setIdx, {
                                  weight: weightParse(e.target.value),
                                })
                              }
                              className="w-20 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                              placeholder={t('exerciseForm.weightPlaceholder')}
                            />
                          </label>
                        </>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        className="ml-auto"
                        onClick={() => removeSetFromLevel(levelIdx, setIdx)}
                        disabled={l.sets.length <= 1}
                      >
                        {t('common.remove')}
                      </Button>
                    </div>
                    {(isCardio
                      ? touched[`duration-${levelIdx}-${setIdx}`] &&
                        ((set as CardioSetForm).duration === '' ||
                          Number.isNaN(Number((set as CardioSetForm).duration)) ||
                          Number((set as CardioSetForm).duration) <= 0)
                      : touched[`reps-${levelIdx}-${setIdx}`] &&
                        ((set as StrengthSetForm).reps === '' ||
                          Number.isNaN(Number((set as StrengthSetForm).reps)) ||
                          Number((set as StrengthSetForm).reps) <= 0)) && (
                      <span className="text-xs text-red-600 dark:text-red-400" role="alert">
                        {t('exerciseForm.errors.restGreaterThanZero')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => addSetToLevel(levelIdx)}
              >
                {t('exerciseForm.addSet')}
              </Button>
            </Card>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addLevel}
              disabled={levels.length >= 10}
            >
              {t('exerciseForm.addLevel')}
            </Button>
            {levels.length >= 10 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('exerciseForm.maxLevelsReached')}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={() => setScreen('exercises')}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={!formValid}>
            {isEdit ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </div>
  )
}
