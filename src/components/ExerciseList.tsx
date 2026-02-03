import { useState } from 'react'
import { useStore } from '../store'
import { Button, Card } from './ui'
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
        <Button
          variant="primary"
          onClick={() => {
            setEditingExerciseId(null)
            setScreen('exercise-create')
          }}
        >
          Add exercise
        </Button>
      </div>

      {exercises.length === 0 ? (
        <p className="rounded-xl bg-slate-100 p-6 text-center text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          No exercises yet. Add one to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {exercises.map((ex) => (
            <Card as="li" key={ex.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">{ex.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {ex.isCardio ? 'Cardio' : 'Strength'} · {ex.levels.length} level(s) · rest {ex.restBetweenSets}s
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(ex.id)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => deleteExercise(ex.id)}>
                    Delete
                  </Button>
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
                <Button
                  variant="primary"
                  inverted
                  size="md"
                  className="w-full sm:flex-1"
                  onClick={() => handleStartWorkout(ex)}
                >
                  Start workout
                </Button>
              </div>
            </Card>
          ))}
        </ul>
      )}

      <Button variant="secondary" onClick={() => setScreen('home')}>
        Back to home
      </Button>
    </div>
  )
}
