import { describe, it, expect } from 'vitest';
import { exerciseLibrary } from '../lib/exerciseLibrary';

describe('exerciseLibrary', () => {
  it('has exercises for all categories', () => {
    const categories = Object.keys(exerciseLibrary);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories).toContain('build_muscle');
    expect(categories).toContain('lose_weight');
  });

  it('all exercises have required fields', () => {
    Object.values(exerciseLibrary)
      .flat()
      .forEach((exercise) => {
        expect(exercise).toHaveProperty('id');
        expect(exercise).toHaveProperty('name');
        expect(exercise).toHaveProperty('durationMinutes');
        expect(exercise.durationMinutes).toBeGreaterThan(0);
        expect(exercise).toHaveProperty('caloriesPerMinute');
        expect(exercise.caloriesPerMinute).toBeGreaterThan(0);
        expect(exercise).toHaveProperty('muscleGroups');
        expect(Array.isArray(exercise.muscleGroups)).toBe(true);
      });
  });

  it('no duplicate IDs across the entire library', () => {
    const allIds = Object.values(exerciseLibrary)
      .flat()
      .map((e) => e.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('all exercises use valid muscle groups', () => {
    Object.values(exerciseLibrary)
      .flat()
      .forEach((exercise) => {
        exercise.muscleGroups.forEach((muscle) => {
          // This is a loose check, just ensuring strings are non-empty
          expect(muscle.length).toBeGreaterThan(0);
        });
      });
  });
});
