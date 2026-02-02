import { useStore } from '../store'

export function Home() {
  const setScreen = useStore((s) => s.setScreen)

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cursor Fit</h1>
      <p className="text-slate-600 dark:text-slate-400">
        Manage exercises, create sessions, and run workouts. All data is stored on this device.
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setScreen('exercises')}
          className="w-full rounded-xl border-2 border-slate-200 bg-white py-4 text-left pl-4 font-medium text-slate-900 shadow-sm hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20"
        >
          Exercises
        </button>
        <button
          type="button"
          onClick={() => setScreen('sessions')}
          className="w-full rounded-xl border-2 border-slate-200 bg-white py-4 text-left pl-4 font-medium text-slate-900 shadow-sm hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20"
        >
          Sessions
        </button>
      </div>
    </div>
  )
}
