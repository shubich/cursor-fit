import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { createEmptyStrengthLevel, createEmptyCardioLevel } from '../store'
import type { StrengthLevel, CardioLevel } from '../types'

export function ExerciseForm() {
  const exercises = useStore((s) => s.exercises)
  const editingExerciseId = useStore((s) => s.editingExerciseId)
  const addExercise = useStore((s) => s.addExercise)
  const updateExercise = useStore((s) => s.updateExercise)
  const setScreen = useStore((s) => s.setScreen)

  const isEdit = editingExerciseId != null
  const existing = isEdit ? exercises.find((e) => e.id === editingExerciseId) : null

  const [name, setName] = useState('')
  const [sets, setSets] = useState(3)
  const [restBetweenSets, setRestBetweenSets] = useState(60)
  const [isCardio, setIsCardio] = useState(false)
  const [levelCount, setLevelCount] = useState(3)
  const [levels, setLevels] = useState<(StrengthLevel | CardioLevel)[]>([])

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setSets(existing.sets)
      setRestBetweenSets(existing.restBetweenSets)
      setIsCardio(existing.isCardio)
      setLevelCount(existing.levels.length)
      setLevels(existing.levels.map((l) => ({ ...l })))
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
    if (existing) return
    setLevels(
      Array.from({ length: levelCount }, (_, i) =>
        isCardio ? createEmptyCardioLevel(i + 1) : createEmptyStrengthLevel(i + 1)
      )
    )
  }, [isCardio, levelCount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const lev = levels.slice(0, levelCount)
    if (isEdit && existing) {
      if (existing.isCardio) {
        updateExercise(existing.id, {
          name: name.trim(),
          sets,
          restBetweenSets,
          levels: lev as CardioLevel[],
        })
      } else {
        updateExercise(existing.id, {
          name: name.trim(),
          sets,
          restBetweenSets,
          levels: lev as StrengthLevel[],
        })
      }
    } else {
      if (isCardio) {
        addExercise({
          name: name.trim(),
          sets,
          restBetweenSets,
          isCardio: true,
          levels: lev as CardioLevel[],
        })
      } else {
        addExercise({
          name: name.trim(),
          sets,
          restBetweenSets,
          isCardio: false,
          levels: lev as StrengthLevel[],
        })
      }
    }
    setScreen('exercises')
  }

  const updateLevel = (index: number, data: Partial<StrengthLevel & CardioLevel>) => {
    setLevels((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...data } : l))
    )
  }

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

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sets</span>
            <input
              type="number"
              min={1}
              max={20}
              value={sets}
              onChange={(e) => setSets(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rest (s)</span>
            <input
              type="number"
              min={0}
              value={restBetweenSets}
              onChange={(e) => setRestBetweenSets(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </label>
        </div>

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

        <div className="space-y-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Levels</span>
          {levels.slice(0, levelCount).map((l, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                Level {l.level}
              </p>
              {isCardio ? (
                <div className="grid grid-cols-2 gap-2">
                  <label>
                    <span className="text-xs text-slate-500">Duration (s)</span>
                    <input
                      type="number"
                      min={1}
                      value={(l as CardioLevel).duration}
                      onChange={(e) =>
                        updateLevel(i, { duration: Number(e.target.value) })
                      }
                      className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>
                  <label>
                    <span className="text-xs text-slate-500">Weight (kg)</span>
                    <input
                      type="number"
                      min={0}
                      value={(l as CardioLevel).weight ?? 0}
                      onChange={(e) =>
                        updateLevel(i, { weight: Number(e.target.value) })
                      }
                      className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <label>
                    <span className="text-xs text-slate-500">Reps</span>
                    <input
                      type="number"
                      min={1}
                      value={(l as StrengthLevel).reps}
                      onChange={(e) =>
                        updateLevel(i, { reps: Number(e.target.value) })
                      }
                      className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>
                  <label>
                    <span className="text-xs text-slate-500">Weight (kg, 0=bodyweight)</span>
                    <input
                      type="number"
                      min={0}
                      value={(l as StrengthLevel).weight}
                      onChange={(e) =>
                        updateLevel(i, { weight: Number(e.target.value) })
                      }
                      className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>
                </div>
              )}
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
