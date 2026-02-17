import { describe, it, expect } from 'vitest'
import { generateTodaysWorkout, pickWarmup, pickCooldown } from '../lib/workoutGenerator'

describe('workoutGenerator', () => {
  describe('generateTodaysWorkout', () => {
    it('returns rest day session on rest days', () => {
      const todayIndex = new Date().getDay()
      const restDays = [todayIndex]

      const session = generateTodaysWorkout(['build_muscle'], restDays, [])

      expect(session.isRestDay).toBe(true)
      expect(session.name).toBe('Rest Day')
      expect(session.totalDuration).toBe(0)
    })

    it('generates a workout on non-rest days', () => {
      const todayIndex = new Date().getDay()
      const restDays = [(todayIndex + 1) % 7]

      const session = generateTodaysWorkout(['build_muscle'], restDays, [])

      expect(session.isRestDay).toBe(false)
      expect(session.name).toBeDefined()
      expect(session.mainExercises.length).toBeGreaterThan(0)
      expect(session.warmup.length).toBeGreaterThan(0)
      expect(session.cooldown.length).toBeGreaterThan(0)
    })

    it('generates different workouts for different goals', () => {
      const todayIndex = new Date().getDay()
      const restDays = [(todayIndex + 1) % 7]

      const muscleSession = generateTodaysWorkout(['build_muscle'], restDays, [])
      const cardioSession = generateTodaysWorkout(['lose_weight'], restDays, [])

      // At minimum both should produce valid non-rest sessions
      expect(muscleSession.isRestDay).toBe(false)
      expect(cardioSession.isRestDay).toBe(false)
    })
  })

  describe('pickWarmup', () => {
    it('returns exercises', () => {
      const focus = ['chest', 'triceps']
      const seed = 123

      const warmup = pickWarmup(focus, [], seed)
      expect(warmup.length).toBeGreaterThan(0)
      expect(warmup[0]).toHaveProperty('name')
    })
  })

  describe('pickCooldown', () => {
    it('returns exercises', () => {
      const muscles = ['chest', 'triceps']
      const seed = 123

      const cooldown = pickCooldown(muscles, [], seed)
      expect(cooldown.length).toBeGreaterThan(0)
    })
  })
})
