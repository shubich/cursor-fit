import { useState } from 'react'
import { useStore } from '../store'
import type { Exercise } from '../types'

export function ExerciseList() {
  const exercises = useStore((s) => s.exercises)
  const setScreen = useStore((s) => s.setScreen)
  const setEditingExerciseId = useStore((s) => s.setEditingExerciseId)
  const deleteExercise = useStore((s) => s.deleteExercise)
  const startSingleExerciseWorkout = useStore((s) => s.startSingleExerciseWorkout)

  const [levelByExerciseId, setLevelByExerciseId] = useState<Record<string, number>>({})

  const handleEdit = (id: string) => {
    setEditingExerciseId(id)
    setScreen('exercise-edit')
  }

  const getSelectedLevel = (ex: Exercise) =>
    levelByExerciseId[ex.id] ?? ex.levels[0]?.level ?? 1

  const handleStartWorkout = (ex: Exercise) => {
    startSingleExerciseWorkout(ex.id, getSelectedLevel(ex))
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exercises</h1>
        <button
          type="button"
          onClick={() => {
            setEditingExerciseId(null)
            setScreen('exercise-create')
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          Add exercise
        </button>
      </div>

      {exercises.length === 0 ? (
        <p className="rounded-xl bg-slate-100 p-6 text-center text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          No exercises yet. Add one to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {exercises.map((ex) => (
            <li
              key={ex.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">{ex.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {ex.isCardio ? 'Cardio' : 'Strength'} · {ex.levels.length} level(s) · rest {ex.restBetweenSets}s
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(ex.id)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteExercise(ex.id)}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 dark:border-red-700 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>Level:</span>
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
                <button
                  type="button"
                  onClick={() => handleStartWorkout(ex)}
                  className="w-full rounded-lg bg-slate-900 py-2 font-medium text-white hover:bg-slate-800 sm:w-auto sm:flex-1 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Start workout
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setScreen('home')}
        className="rounded-lg border border-slate-300 py-2 dark:border-slate-600"
      >
        Back to home
      </button>
    </div>
  )
}
