import { useStore } from '../store'
import { formatSeconds } from '../timer-utils'

export function ResultsScreen() {
  const lastResult = useStore((s) => s.lastResult)
  const setScreen = useStore((s) => s.setScreen)
  const clearLastResult = useStore((s) => s.clearLastResult)

  const handleFinish = () => {
    clearLastResult()
    setScreen('home')
  }

  if (!lastResult) {
    return (
      <div className="p-4">
        <p>No results.</p>
        <button
          type="button"
          onClick={() => setScreen('home')}
          className="mt-2 rounded-lg border px-4 py-2"
        >
          Home
        </button>
      </div>
    )
  }

  const byExercise = lastResult.completedSets.reduce(
    (acc, set) => {
      if (!acc[set.exerciseName]) acc[set.exerciseName] = []
      acc[set.exerciseName].push(set)
      return acc
    },
    {} as Record<string, typeof lastResult.completedSets>
  )

  return (
    <div className="flex min-h-[100dvh] flex-col gap-6 p-4 pb-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workout complete</h1>

      <div className="rounded-xl bg-emerald-100 p-4 dark:bg-emerald-900/30">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Total time</p>
        <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
          {formatSeconds(lastResult.totalDurationSeconds)}
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-white">Summary</h2>
        <ul className="flex flex-col gap-3">
          {Object.entries(byExercise).map(([name, sets]) => (
            <li
              key={name}
              className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="font-medium text-slate-900 dark:text-white">{name}</p>
              <ul className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {sets.map((s, i) => (
                  <li key={i}>
                    Set {s.setIndex}:{' '}
                    {s.reps != null ? `${s.reps} reps` : ''}
                    {s.duration != null ? `${formatSeconds(s.duration)}` : ''}
                    {s.weight > 0 ? ` · ${s.weight} kg` : ''}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={handleFinish}
        className="mt-auto w-full rounded-xl bg-slate-900 py-4 text-lg font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        Finish
      </button>
    </div>
  )
}
