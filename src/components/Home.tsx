import { useStore } from '../store'
import { Button } from './ui'

export function Home() {
  const setScreen = useStore((s) => s.setScreen)

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cursor Fit</h1>
      <p className="text-slate-600 dark:text-slate-400">
        Manage exercises, create sessions, and run workouts. All data is stored on this device.
      </p>

      <div className="flex flex-col gap-3">
        <Button variant="nav" onClick={() => setScreen('exercises')}>
          Exercises
        </Button>
        <Button variant="nav" onClick={() => setScreen('sessions')}>
          Sessions
        </Button>
      </div>
    </div>
  )
}
