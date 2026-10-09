import { describe, it, expect } from 'vitest';
import { createTradeoff, tradeoffEquals, Tradeoff } from './tradeoff';
import { ValidationError } from '../errors';

describe('Tradeoff Value Object', () => {
  describe('createTradeoff', () => {
    it('should create a valid tradeoff with all fields', () => {
      const tradeoff = createTradeoff(
        'Use Redis for caching',
        'Fast read/write operations',
        'Additional infrastructure complexity'
      );

      expect(tradeoff.decision).toBe('Use Redis for caching');
      expect(tradeoff.advantage).toBe('Fast read/write operations');
      expect(tradeoff.disadvantage).toBe('Additional infrastructure complexity');
    });

    it('should trim whitespace from fields', () => {
      const tradeoff = createTradeoff(
        '  Use Redis  ',
        '  Fast reads  ',
        '  Complexity  '
      );

      expect(tradeoff.decision).toBe('Use Redis');
      expect(tradeoff.advantage).toBe('Fast reads');
      expect(tradeoff.disadvantage).toBe('Complexity');
    });

    it('should throw ValidationError for empty decision', () => {
      expect(() => createTradeoff('', 'advantage', 'disadvantage')).toThrow(ValidationError);
      expect(() => createTradeoff('   ', 'advantage', 'disadvantage')).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty advantage', () => {
      expect(() => createTradeoff('decision', '', 'disadvantage')).toThrow(ValidationError);
      expect(() => createTradeoff('decision', '   ', 'disadvantage')).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty disadvantage', () => {
      expect(() => createTradeoff('decision', 'advantage', '')).toThrow(ValidationError);
      expect(() => createTradeoff('decision', 'advantage', '   ')).toThrow(ValidationError);
    });

    it('should throw ValidationError with descriptive message', () => {
      expect(() => createTradeoff('', 'adv', 'dis')).toThrow('Tradeoff decision cannot be empty');
      expect(() => createTradeoff('dec', '', 'dis')).toThrow('Tradeoff advantage cannot be empty');
      expect(() => createTradeoff('dec', 'adv', '')).toThrow('Tradeoff disadvantage cannot be empty');
    });
  });

  describe('tradeoffEquals', () => {
    it('should return true for identical tradeoffs', () => {
      const t1 = createTradeoff('decision', 'advantage', 'disadvantage');
      const t2 = createTradeoff('decision', 'advantage', 'disadvantage');
      expect(tradeoffEquals(t1, t2)).toBe(true);
    });

    it('should return false for different decisions', () => {
      const t1 = createTradeoff('decision 1', 'advantage', 'disadvantage');
      const t2 = createTradeoff('decision 2', 'advantage', 'disadvantage');
      expect(tradeoffEquals(t1, t2)).toBe(false);
    });

    it('should return false for different advantages', () => {
      const t1 = createTradeoff('decision', 'advantage 1', 'disadvantage');
      const t2 = createTradeoff('decision', 'advantage 2', 'disadvantage');
      expect(tradeoffEquals(t1, t2)).toBe(false);
    });

    it('should return false for different disadvantages', () => {
      const t1 = createTradeoff('decision', 'advantage', 'disadvantage 1');
      const t2 = createTradeoff('decision', 'advantage', 'disadvantage 2');
      expect(tradeoffEquals(t1, t2)).toBe(false);
    });
  });
});