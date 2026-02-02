import { useStore } from '../store'

export function SessionList() {
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sessions</h1>
        <button
          type="button"
          onClick={() => {
            setEditingSessionId(null)
            setScreen('session-create')
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          New session
        </button>
      </div>

      {sessions.length === 0 ? (
        <p className="rounded-xl bg-slate-100 p-6 text-center text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          No sessions yet. Create one to run multi-exercise workouts.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) => {
            const names = session.exercises
              .map((e) => exercises.find((x) => x.id === e.exerciseId)?.name ?? '?')
              .join(', ')
            return (
              <li
                key={session.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      {session.name}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {session.exercises.length} exercises · rest {session.restBetweenExercises}s
                    </p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 truncate">
                      {names}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(session.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSession(session.id)}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 dark:border-red-700 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startSessionWorkout(session.id)}
                  className="w-full rounded-lg bg-slate-900 py-2 font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Start session
                </button>
              </li>
            )
          })}
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
