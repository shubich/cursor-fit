import { describe, it, expect, beforeEach } from 'vitest'
import {
  STORAGE_KEYS,
  loadExercises,
  saveExercises,
  loadSessions,
  saveSessions,
  loadWorkoutHistory,
  saveWorkoutResult,
} from './storage'
import type { Exercise, Session, WorkoutResult } from './types'

beforeEach(() => {
  localStorage.clear()
})

describe('storage', () => {
  describe('exercises', () => {
    it('loadExercises returns empty array when nothing stored', () => {
      expect(loadExercises()).toEqual([])
    })

    it('saveExercises and loadExercises round-trip', () => {
      const exercises: Exercise[] = [
        {
          id: 'e1',
          name: 'Push-ups',
          restBetweenSets: 60,
          isCardio: false,
          levels: [{ level: 1, sets: [{ reps: 8, weight: 'bodyweight' }] }],
        },
      ]
      saveExercises(exercises)
      expect(loadExercises()).toEqual(exercises)
    })

    it('migrates old level shape (reps/weight) to sets array', () => {
      localStorage.setItem(
        STORAGE_KEYS.exercises,
        JSON.stringify([
          {
            id: 'e1',
            name: 'Push-ups',
            sets: 3,
            restBetweenSets: 60,
            isCardio: false,
            levels: [{ level: 1, reps: 10, weight: 0 }],
          },
        ])
      )
      const loaded = loadExercises()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].levels[0]).toEqual({
        level: 1,
        sets: [{ reps: 10, weight: 0 }],
      })
    })

    it('loadExercises returns empty array when stored value is invalid JSON', () => {
      localStorage.setItem(STORAGE_KEYS.exercises, 'not valid json')
      expect(loadExercises()).toEqual([])
    })

    it('migrates old cardio level (duration) to sets array', () => {
      localStorage.setItem(
        STORAGE_KEYS.exercises,
        JSON.stringify([
          {
            id: 'e2',
            name: 'Run',
            sets: 2,
            restBetweenSets: 30,
            isCardio: true,
            levels: [{ level: 1, duration: 120 }],
          },
        ])
      )
      const loaded = loadExercises()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].levels[0]).toEqual({
        level: 1,
        sets: [{ duration: 120 }],
      })
    })
  })

  describe('sessions', () => {
    it('loadSessions returns empty array when nothing stored', () => {
      expect(loadSessions()).toEqual([])
    })

    it('saveSessions and loadSessions round-trip', () => {
      const sessions: Session[] = [
        {
          id: 's1',
          name: 'Full body',
          exercises: [{ exerciseId: 'e1', level: 1 }],
          restBetweenExercises: 90,
        },
      ]
      saveSessions(sessions)
      expect(loadSessions()).toEqual(sessions)
    })
  })

  describe('workout history', () => {
    it('loadWorkoutHistory returns empty array when nothing stored', () => {
      expect(loadWorkoutHistory()).toEqual([])
    })

    it('saveWorkoutResult prepends and loadWorkoutHistory returns in order', () => {
      const result1: WorkoutResult = {
        id: 'r1',
        completedAt: 1000,
        totalDurationSeconds: 300,
        completedSets: [],
        exerciseNames: ['Push-ups'],
      }
      const result2: WorkoutResult = {
        id: 'r2',
        completedAt: 2000,
        totalDurationSeconds: 600,
        completedSets: [],
        exerciseNames: ['Run'],
      }
      saveWorkoutResult(result1)
      saveWorkoutResult(result2)
      const history = loadWorkoutHistory()
      expect(history).toHaveLength(2)
      expect(history[0].id).toBe('r2')
      expect(history[1].id).toBe('r1')
    })

    it('saveWorkoutResult keeps only last 100 results', () => {
      for (let i = 0; i < 105; i++) {
        saveWorkoutResult({
          id: `r${i}`,
          completedAt: i,
          totalDurationSeconds: 60,
          completedSets: [],
          exerciseNames: ['Ex'],
        })
      }
      const history = loadWorkoutHistory()
      expect(history).toHaveLength(100)
      expect(history[0].id).toBe('r104')
      expect(history[99].id).toBe('r5')
    })
  })
})
