import { describe, it, expect } from 'vitest'
import { CALORIE_RATES, DAYS_OF_WEEK, FITNESS_GOAL_LABELS } from '../lib/constants'

describe('constants', () => {
  describe('CALORIE_RATES', () => {
    it('contains expected categories', () => {
      expect(CALORIE_RATES).toHaveProperty('strength')
      expect(CALORIE_RATES).toHaveProperty('cardio')
      expect(CALORIE_RATES).toHaveProperty('hiit')
      expect(CALORIE_RATES).toHaveProperty('flexibility')
      expect(CALORIE_RATES).toHaveProperty('warmup')
      expect(CALORIE_RATES).toHaveProperty('cooldown')
    })

    it('has reasonable values', () => {
      expect(CALORIE_RATES.hiit).toBeGreaterThan(CALORIE_RATES.flexibility)
    })
  })

  describe('DAYS_OF_WEEK', () => {
    it('has 7 days', () => {
      expect(DAYS_OF_WEEK).toHaveLength(7)
    })

    it('starts with Monday', () => {
      expect(DAYS_OF_WEEK[0]).toBe('Monday')
    })
  })

  describe('FITNESS_GOAL_LABELS', () => {
    it('has labels for all 5 goals', () => {
      const keys = Object.keys(FITNESS_GOAL_LABELS)
      expect(keys).toHaveLength(5)
      expect(keys).toContain('build_muscle')
      expect(keys).toContain('lose_weight')
    })
  })
})
