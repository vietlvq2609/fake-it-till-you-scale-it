import { describe, it, expect } from 'vitest';
import { Tradeoff } from '../../../src/domain/value-objects/Tradeoff';
import { ValidationError } from '../../../src/domain/errors';

describe('Tradeoff Value Object', () => {
  describe('create', () => {
    it('should create a tradeoff with decision, advantage, and disadvantage', () => {
      const tradeoff = Tradeoff.create(
        'Use Redis for caching',
        'Fast read/write performance',
        'Additional infrastructure complexity'
      );

      expect(tradeoff.decision).toBe('Use Redis for caching');
      expect(tradeoff.advantage).toBe('Fast read/write performance');
      expect(tradeoff.disadvantage).toBe('Additional infrastructure complexity');
    });

    it('should trim whitespace from all fields', () => {
      const tradeoff = Tradeoff.create(
        '  Use Redis  ',
        '  Fast  ',
        '  Complex  '
      );

      expect(tradeoff.decision).toBe('Use Redis');
      expect(tradeoff.advantage).toBe('Fast');
      expect(tradeoff.disadvantage).toBe('Complex');
    });

    it('should throw ValidationError for empty decision', () => {
      expect(() =>
        Tradeoff.create('', 'advantage', 'disadvantage')
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty advantage', () => {
      expect(() =>
        Tradeoff.create('decision', '', 'disadvantage')
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty disadvantage', () => {
      expect(() =>
        Tradeoff.create('decision', 'advantage', '')
      ).toThrow(ValidationError);
    });
  });

  describe('equals', () => {
    it('should return true for tradeoffs with same decision, advantage, and disadvantage', () => {
      const t1 = Tradeoff.create('Use Redis', 'Fast', 'Complex');
      const t2 = Tradeoff.create('Use Redis', 'Fast', 'Complex');

      expect(t1.equals(t2)).toBe(true);
    });

    it('should return false for tradeoffs with different decision', () => {
      const t1 = Tradeoff.create('Use Redis', 'Fast', 'Complex');
      const t2 = Tradeoff.create('Use Memcached', 'Fast', 'Complex');

      expect(t1.equals(t2)).toBe(false);
    });

    it('should return false for tradeoffs with different advantage', () => {
      const t1 = Tradeoff.create('Use Redis', 'Fast', 'Complex');
      const t2 = Tradeoff.create('Use Redis', 'Simple', 'Complex');

      expect(t1.equals(t2)).toBe(false);
    });

    it('should return false for tradeoffs with different disadvantage', () => {
      const t1 = Tradeoff.create('Use Redis', 'Fast', 'Complex');
      const t2 = Tradeoff.create('Use Redis', 'Fast', 'Expensive');

      expect(t1.equals(t2)).toBe(false);
    });
  });
});