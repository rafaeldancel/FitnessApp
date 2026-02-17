import { describe, it, expect } from 'vitest';
import { getLocalDateString, getStartOfWeek, getEndOfWeek } from '../lib/dateUtils';

describe('dateUtils', () => {
  describe('getLocalDateString', () => {
    it('returns a string in YYYY-MM-DD format', () => {
      const result = getLocalDateString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getStartOfWeek', () => {
    it('returns Monday relative to the given date', () => {
      // Wednesday, Feb 14 2024
      const input = new Date('2024-02-14T12:00:00');
      const result = getStartOfWeek(input);
      // Should be Monday, Feb 12
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1); // Feb is 1
      expect(result.getDate()).toBe(12);
      expect(result.getDay()).toBe(1); // Monday
    });

    it('returns previous Monday if given Sunday', () => {
      // Sunday, Feb 18 2024
      const input = new Date('2024-02-18T12:00:00');
      const result = getStartOfWeek(input);
      // Should be Monday, Feb 12
      expect(result.getDate()).toBe(12);
    });
  });

  describe('getEndOfWeek', () => {
    it('returns Sunday 23:59:59 relative to the given date', () => {
      // Wednesday, Feb 14 2024
      const input = new Date('2024-02-14T12:00:00');
      const result = getEndOfWeek(input);
      // Should be Sunday, Feb 18
      expect(result.getDate()).toBe(18);
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });
  });
});
