import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { formatSeconds } from '../timer-utils'
import { Button, Card } from './ui'

export function ResultsScreen() {
  const { t } = useTranslation()
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
        <p>{t('results.noResults')}</p>
        <Button variant="secondary" className="mt-2" onClick={() => setScreen('home')}>
          {t('common.home')}
        </Button>
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
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('results.title')}</h1>

      <div className="rounded-xl bg-emerald-100 p-4 dark:bg-emerald-900/30">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t('results.totalTime')}</p>
        <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
          {formatSeconds(lastResult.totalDurationSeconds)}
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-white">{t('results.summary')}</h2>
        <ul className="flex flex-col gap-3">
          {Object.entries(byExercise).map(([name, sets]) => (
            <Card as="li" key={name} className="p-3">
              <p className="font-medium text-slate-900 dark:text-white">{name}</p>
              <ul className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {sets.map((s, i) => (
                  <li key={i}>
                    {t('results.setIndex', { index: s.setIndex })}:{' '}
                    {s.reps != null ? t('results.repsCount', { count: s.reps }) : ''}
                    {s.duration != null ? formatSeconds(s.duration) : ''}
                    {s.weight !== undefined && s.weight !== 'bodyweight'
                      ? ` · ${typeof s.weight === 'number' ? t('workout.weightKg', { n: s.weight }) : s.weight}`
                      : ''}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </ul>
      </div>

      <Button
        variant="primary"
        inverted
        size="lg"
        fullWidth
        className="mt-auto"
        onClick={handleFinish}
      >
        {t('results.finish')}
      </Button>
    </div>
  )
}
