import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Button } from './ui'
import type { SessionExercise } from '../types'
import type { Exercise } from '../types'

export function SessionCreator() {
  const exercises = useStore((s) => s.exercises)
  const sessions = useStore((s) => s.sessions)
  const editingSessionId = useStore((s) => s.editingSessionId)
  const addSession = useStore((s) => s.addSession)
  const updateSession = useStore((s) => s.updateSession)
  const setScreen = useStore((s) => s.setScreen)

  const isEdit = editingSessionId != null
  const existing = isEdit ? sessions.find((s) => s.id === editingSessionId) : null

  const [name, setName] = useState('')
  const [restBetweenExercises, setRestBetweenExercises] = useState(60)
  const [selected, setSelected] = useState<SessionExercise[]>([])

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setRestBetweenExercises(existing.restBetweenExercises)
      setSelected(existing.exercises)
    } else {
      setName('')
      setRestBetweenExercises(60)
      setSelected([])
    }
  }, [existing?.id])

  const toggleExercise = (ex: Exercise) => {
    const level = ex.levels[0]?.level ?? 1
    setSelected((prev) => {
      const idx = prev.findIndex((e) => e.exerciseId === ex.id)
      if (idx >= 0) return prev.filter((e) => e.exerciseId !== ex.id)
      return [...prev, { exerciseId: ex.id, level }]
    })
  }

  const setLevel = (exerciseId: string, level: number) => {
    setSelected((prev) =>
      prev.map((e) => (e.exerciseId === exerciseId ? { ...e, level } : e))
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || selected.length === 0) return
    if (isEdit && existing) {
      updateSession(existing.id, {
        name: name.trim(),
        restBetweenExercises,
        exercises: selected,
      })
    } else {
      addSession({
        name: name.trim(),
        restBetweenExercises,
        exercises: selected,
      })
    }
    setScreen('sessions')
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {isEdit ? 'Edit session' : 'New session'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Session name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholder="e.g. Full body"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Rest between exercises (seconds)
          </span>
          <input
            type="number"
            min={0}
            value={restBetweenExercises}
            onChange={(e) => setRestBetweenExercises(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Select exercises and set level for each
          </span>
          <ul className="mt-2 flex flex-col gap-2">
            {exercises.map((ex) => {
              const entry = selected.find((e) => e.exerciseId === ex.id)
              const isSelected = !!entry
              return (
                <li
                  key={ex.id}
                  className={`rounded-lg border p-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20'
                      : 'border-slate-200 dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleExercise(ex)}
                      className="rounded"
                    />
                    <span className="font-medium text-slate-900 dark:text-white">{ex.name}</span>
                  </label>
                  {isSelected && (
                    <label className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-500">Level:</span>
                      <select
                        value={entry.level}
                        onChange={(e) => setLevel(ex.id, Number(e.target.value))}
                        className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      >
                        {ex.levels.map((l) => (
                          <option key={l.level} value={l.level}>
                            {l.level}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={() => setScreen('sessions')}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={selected.length === 0}
          >
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  )
}
