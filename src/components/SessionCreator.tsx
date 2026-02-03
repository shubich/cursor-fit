import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../store'
import { Button } from './ui'
import type { SessionExercise } from '../types'
import type { Exercise } from '../types'

interface SortableSessionItemProps {
  entry: SessionExercise
  exercise: Exercise
  onSetLevel: (exerciseId: string, level: number) => void
  onRemove: (exercise: Exercise) => void
}

function SortableSessionItem({
  entry,
  exercise,
  onSetLevel,
  onRemove,
}: SortableSessionItemProps) {
  const { t } = useTranslation()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.exerciseId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border p-3 ${
        isDragging
          ? 'border-slate-400 bg-slate-100 opacity-90 dark:border-slate-500 dark:bg-slate-700'
          : 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20'
      }`}
    >
      <button
        type="button"
        className="touch-none cursor-grab rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 active:cursor-grabbing dark:hover:bg-slate-600 dark:hover:text-slate-300"
        aria-label={t('sessionCreator.dragToReorder')}
        {...attributes}
        {...listeners}
      >
        <span className="inline-block text-lg" aria-hidden>
          ≡
        </span>
      </button>
      <span className="min-w-0 flex-1 font-medium text-slate-900 dark:text-white">
        {exercise.name}
      </span>
      <label className="flex shrink-0 items-center gap-2">
        <span className="text-xs text-slate-500">{t('common.level')}:</span>
        <select
          value={entry.level}
          onChange={(e) => onSetLevel(exercise.id, Number(e.target.value))}
          className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          {exercise.levels.map((l) => (
            <option key={l.level} value={l.level}>
              {l.level}
            </option>
          ))}
        </select>
      </label>
      <Button
        variant="secondary"
        type="button"
        onClick={() => onRemove(exercise)}
        className="shrink-0"
      >
        {t('common.remove')}
      </Button>
    </li>
  )
}

export function SessionCreator() {
  const { t } = useTranslation()
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

  const activeSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over == null || active.id === over.id) return
    setSelected((prev) => {
      const oldIndex = prev.findIndex((e) => e.exerciseId === active.id)
      const newIndex = prev.findIndex((e) => e.exerciseId === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
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
        {isEdit ? t('sessionCreator.editTitle') : t('sessionCreator.newTitle')}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('sessionCreator.sessionName')}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholder={t('sessionCreator.sessionNamePlaceholder')}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('sessionCreator.restBetweenExercises')}
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
            {t('sessionCreator.sessionOrder')}
          </span>
          <p className="mt-0.5 text-xs text-slate-500">
            {t('sessionCreator.dragToReorder')}
          </p>
          {selected.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t('sessionCreator.noExercisesYet')}
            </p>
          ) : (
            <DndContext
              sensors={activeSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selected.map((e) => e.exerciseId)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="mt-2 flex flex-col gap-2">
                  {selected.map((entry) => {
                    const exercise = exercises.find((e) => e.id === entry.exerciseId)
                    if (!exercise) return null
                    return (
                      <SortableSessionItem
                        key={entry.exerciseId}
                        entry={entry}
                        exercise={exercise}
                        onSetLevel={setLevel}
                        onRemove={toggleExercise}
                      />
                    )
                  })}
                </ul>
              </SortableContext>
            </DndContext>
          )}
          <label className="mt-3 block">
            <span className="sr-only">{t('sessionCreator.addExercise')}</span>
            <select
              value=""
              onChange={(e) => {
                const id = e.target.value
                if (!id) return
                const ex = exercises.find((x) => x.id === id)
                if (ex) toggleExercise(ex)
                e.target.value = ''
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              aria-label={t('sessionCreator.addExercise')}
            >
              <option value="">{t('sessionCreator.addExercise')}…</option>
              {exercises
                .filter((ex) => !selected.some((e) => e.exerciseId === ex.id))
                .map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={() => setScreen('sessions')}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={selected.length === 0}
          >
            {isEdit ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </div>
  )
}
