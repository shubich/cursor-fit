import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { createEmptyStrengthLevel, createEmptyCardioLevel } from '../store'
import type { StrengthLevel, CardioLevel, StrengthSet, CardioSet } from '../types'

export function ExerciseForm() {
  const exercises = useStore((s) => s.exercises)
  const editingExerciseId = useStore((s) => s.editingExerciseId)
  const addExercise = useStore((s) => s.addExercise)
  const updateExercise = useStore((s) => s.updateExercise)
  const setScreen = useStore((s) => s.setScreen)

  const isEdit = editingExerciseId != null
  const existing = isEdit ? exercises.find((e) => e.id === editingExerciseId) : null

  const [name, setName] = useState('')
  const [restBetweenSets, setRestBetweenSets] = useState(60)
  const [isCardio, setIsCardio] = useState(false)
  const [levelCount, setLevelCount] = useState(3)
  const [levels, setLevels] = useState<(StrengthLevel | CardioLevel)[]>([])

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setRestBetweenSets(existing.restBetweenSets)
      setIsCardio(existing.isCardio)
      setLevelCount(existing.levels.length)
      setLevels(
        existing.levels.map((l) => ({ ...l, sets: l.sets.map((s) => ({ ...s })) })) as (
          | StrengthLevel
          | CardioLevel
        )[]
      )
    } else {
      setLevelCount(3)
      setLevels(
        Array.from({ length: 3 }, (_, i) =>
          isCardio ? createEmptyCardioLevel(i + 1) : createEmptyStrengthLevel(i + 1)
        )
      )
    }
  }, [existing?.id])

  useEffect(() => {
    if (existing) {
      setLevels((prev) => {
        if (levelCount > prev.length) {
          const next = [...prev]
          while (next.length < levelCount) {
            const levelNum = next.length + 1
            next.push(
              isCardio ? createEmptyCardioLevel(levelNum) : createEmptyStrengthLevel(levelNum)
            )
          }
          return next
        }
        if (levelCount < prev.length) return prev.slice(0, levelCount)
        return prev
      })
    } else {
      setLevels(
        Array.from({ length: levelCount }, (_, i) =>
          isCardio ? createEmptyCardioLevel(i + 1) : createEmptyStrengthLevel(i + 1)
        )
      )
    }
  }, [isCardio, levelCount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const lev = levels.slice(0, levelCount)
    if (isEdit && existing) {
      if (existing.isCardio) {
        updateExercise(existing.id, {
          name: name.trim(),
          restBetweenSets,
          levels: lev as CardioLevel[],
        })
      } else {
        updateExercise(existing.id, {
          name: name.trim(),
          restBetweenSets,
          levels: lev as StrengthLevel[],
        })
      }
    } else {
      if (isCardio) {
        addExercise({
          name: name.trim(),
          restBetweenSets,
          isCardio: true,
          levels: lev as CardioLevel[],
        })
      } else {
        addExercise({
          name: name.trim(),
          restBetweenSets,
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
    data: Partial<StrengthSet> | Partial<CardioSet>
  ) => {
    setLevels((prev) =>
      prev.map((l, i) => {
        if (i !== levelIndex) return l
        const newSets = [...l.sets]
        newSets[setIndex] = { ...newSets[setIndex], ...data } as typeof l.sets[0]
        return { ...l, sets: newSets } as StrengthLevel | CardioLevel
      })
    )
  }

  const addSetToLevel = (levelIndex: number) => {
    setLevels((prev) =>
      prev.map((l, i) => {
        if (i !== levelIndex) return l
        if (isCardio) {
          const newSet: CardioSet = { duration: 60 }
          return { ...l, sets: [...(l as CardioLevel).sets, newSet] } as CardioLevel
        }
        const newSet: StrengthSet = { reps: 8, weight: 'bodyweight' }
        return { ...l, sets: [...(l as StrengthLevel).sets, newSet] } as StrengthLevel
      })
    )
  }

  const removeSetFromLevel = (levelIndex: number, setIndex: number) => {
    setLevels((prev) =>
      prev.map((l, i) => {
        if (i !== levelIndex) return l
        const newSets = l.sets.filter((_, si) => si !== setIndex)
        return { ...l, sets: newSets } as StrengthLevel | CardioLevel
      })
    )
  }

  const weightDisplay = (w: number | string) =>
    typeof w === 'number' ? String(w) : w
  const weightParse = (s: string): number | string =>
    s.trim() === '' ? 'bodyweight' : /^\d+(\.\d+)?$/.test(s.trim()) ? Number(s.trim()) : s.trim()

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {isEdit ? 'Edit exercise' : 'New exercise'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholder="e.g. Push-ups"
            required
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isCardio}
            onChange={(e) => setIsCardio(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cardio</span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rest between sets (s)</span>
          <input
            type="number"
            min={0}
            value={restBetweenSets}
            onChange={(e) => setRestBetweenSets(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Number of levels (1–10)
          </span>
          <input
            type="number"
            min={1}
            max={10}
            value={levelCount}
            onChange={(e) => setLevelCount(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </label>

        <div className="space-y-4">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Levels (each level has its own sets)</span>
          {levels.slice(0, levelCount).map((l, levelIdx) => (
            <div
              key={levelIdx}
              className="rounded-lg border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                Level {l.level} — {l.sets.length} set(s)
              </p>
              <div className="flex flex-col gap-2">
                {l.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-900"
                  >
                    {isCardio ? (
                      <>
                        <label className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">Duration (s)</span>
                          <input
                            type="number"
                            min={1}
                            value={(set as CardioSet).duration}
                            onChange={(e) =>
                              updateSetInLevel(levelIdx, setIdx, {
                                duration: Number(e.target.value),
                              })
                            }
                            className="w-16 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                          />
                        </label>
                        <label className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">Weight</span>
                          <input
                            type="text"
                            value={weightDisplay((set as CardioSet).weight ?? 'bodyweight')}
                            onChange={(e) =>
                              updateSetInLevel(levelIdx, setIdx, {
                                weight: weightParse(e.target.value),
                              })
                            }
                            className="w-24 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            placeholder="bodyweight"
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">Reps</span>
                          <input
                            type="number"
                            min={1}
                            value={(set as StrengthSet).reps}
                            onChange={(e) =>
                              updateSetInLevel(levelIdx, setIdx, {
                                reps: Number(e.target.value),
                              })
                            }
                            className="w-16 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                          />
                        </label>
                        <label className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">Weight</span>
                          <input
                            type="text"
                            value={weightDisplay((set as StrengthSet).weight)}
                            onChange={(e) =>
                              updateSetInLevel(levelIdx, setIdx, {
                                weight: weightParse(e.target.value),
                              })
                            }
                            className="w-28 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            placeholder="bodyweight or 5kg"
                          />
                        </label>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSetFromLevel(levelIdx, setIdx)}
                      disabled={l.sets.length <= 1}
                      className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 disabled:opacity-40 dark:border-red-700 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addSetToLevel(levelIdx)}
                className="mt-2 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600"
              >
                + Add set
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setScreen('exercises')}
            className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
          >
            {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
