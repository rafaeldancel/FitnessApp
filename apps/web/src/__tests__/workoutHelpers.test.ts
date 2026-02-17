import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase modules BEFORE importing the module under test
vi.mock('../lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mock-collection-ref'),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-doc-id' })),
  getDocs: vi.fn(() =>
    Promise.resolve({
      docs: [
        {
          id: 'doc-1',
          data: () => ({
            userId: 'user-123',
            name: 'Workout 1',
            type: 'strength',
            duration: 30,
            calories: 200,
            date: { toDate: () => new Date('2024-02-14') },
            createdAt: { toDate: () => new Date() },
          }),
        },
      ],
    })
  ),
  query: vi.fn((...args: unknown[]) => args),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  Timestamp: {
    fromDate: (date: Date) => ({ toDate: () => date }),
    now: () => ({ toDate: () => new Date() }),
  },
}));

import { logWorkout, getWorkouts, estimateCalories } from '../lib/workoutHelpers';
import { collection, addDoc, where, limit } from 'firebase/firestore';
import type { CreateLoggedWorkout } from '../types';

describe('workoutHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(addDoc).mockResolvedValue({ id: 'new-doc-id' } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(collection).mockReturnValue('mock-collection-ref' as any);
  });

  describe('logWorkout', () => {
    it('calls addDoc with correct data and returns result', async () => {
      const mockWorkout: CreateLoggedWorkout = {
        name: 'Test Workout',
        type: 'strength',
        duration: 30,
        calories: 200,
        date: new Date('2024-02-14'),
        notes: 'Good session',
      };

      const result = await logWorkout('user-123', mockWorkout);

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'loggedWorkouts');
      expect(addDoc).toHaveBeenCalled();
      expect(result.id).toBe('new-doc-id');
      expect(result.userId).toBe('user-123');
      expect(result.name).toBe('Test Workout');
      expect(result.type).toBe('strength');
      expect(result.duration).toBe(30);
    });
  });

  describe('getWorkouts', () => {
    it('constructs query with userId', async () => {
      const workouts = await getWorkouts('user-123', { limitCount: 5 });

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'loggedWorkouts');
      expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(limit).toHaveBeenCalledWith(5);
      expect(workouts.length).toBe(1);
      expect(workouts[0].name).toBe('Workout 1');
    });
  });

  describe('estimateCalories', () => {
    it('calculates calories for strength', () => {
      expect(estimateCalories('strength', 30)).toBe(210); // 30 * 7
    });

    it('calculates calories for cardio', () => {
      expect(estimateCalories('cardio', 20)).toBe(200); // 20 * 10
    });

    it('calculates calories for hiit', () => {
      expect(estimateCalories('hiit', 15)).toBe(180); // 15 * 12
    });

    it('defaults to 5 cal/min for unknown types', () => {
      expect(estimateCalories('unknown_type', 10)).toBe(50); // 10 * 5
    });
  });
});
