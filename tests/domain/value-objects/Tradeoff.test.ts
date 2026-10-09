import { describe, it, expect } from 'vitest';
import { Tradeoff } from '../../../packages/problem-catalog/src/domain/value-objects/Tradeoff';
import { ValidationError } from '../../../packages/problem-catalog/src/domain/errors';

describe('Tradeoff Value Object', () => {
  describe('create', () => {
    it('should create a valid tradeoff with all fields', () => {
      const tradeoff = Tradeoff.create(
        'Use Redis for caching',
        'Fast read/write operations',
        'Additional infrastructure complexity'
      );

      expect(tradeoff.decision).toBe('Use Redis for caching');
      expect(tradeoff.advantage).toBe('Fast read/write operations');
      expect(tradeoff.disadvantage).toBe('Additional infrastructure complexity');
    });

    it('should trim whitespace from fields', () => {
      const tradeoff = Tradeoff.create(
        '  Use Redis  ',
        '  Fast reads  ',
        '  Complexity  '
      );

      expect(tradeoff.decision).toBe('Use Redis');
      expect(tradeoff.advantage).toBe('Fast reads');
      expect(tradeoff.disadvantage).toBe('Complexity');
    });

    it('should throw ValidationError for empty decision', () => {
      expect(() => Tradeoff.create('', 'advantage', 'disadvantage')).toThrow(ValidationError);
      expect(() => Tradeoff.create('   ', 'advantage', 'disadvantage')).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty advantage', () => {
      expect(() => Tradeoff.create('decision', '', 'disadvantage')).toThrow(ValidationError);
      expect(() => Tradeoff.create('decision', '   ', 'disadvantage')).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty disadvantage', () => {
      expect(() => Tradeoff.create('decision', 'advantage', '')).toThrow(ValidationError);
      expect(() => Tradeoff.create('decision', 'advantage', '   ')).toThrow(ValidationError);
    });

    it('should throw ValidationError with descriptive message', () => {
      expect(() => Tradeoff.create('', 'adv', 'dis')).toThrow('Tradeoff decision cannot be empty');
      expect(() => Tradeoff.create('dec', '', 'dis')).toThrow('Tradeoff advantage cannot be empty');
      expect(() => Tradeoff.create('dec', 'adv', '')).toThrow('Tradeoff disadvantage cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true for identical tradeoffs', () => {
      const t1 = Tradeoff.create('decision', 'advantage', 'disadvantage');
      const t2 = Tradeoff.create('decision', 'advantage', 'disadvantage');
      expect(t1.equals(t2)).toBe(true);
    });

    it('should return false for different decisions', () => {
      const t1 = Tradeoff.create('decision 1', 'advantage', 'disadvantage');
      const t2 = Tradeoff.create('decision 2', 'advantage', 'disadvantage');
      expect(t1.equals(t2)).toBe(false);
    });

    it('should return false for different advantages', () => {
      const t1 = Tradeoff.create('decision', 'advantage 1', 'disadvantage');
      const t2 = Tradeoff.create('decision', 'advantage 2', 'disadvantage');
      expect(t1.equals(t2)).toBe(false);
    });

    it('should return false for different disadvantages', () => {
      const t1 = Tradeoff.create('decision', 'advantage', 'disadvantage 1');
      const t2 = Tradeoff.create('decision', 'advantage', 'disadvantage 2');
      expect(t1.equals(t2)).toBe(false);
    });
  });
});