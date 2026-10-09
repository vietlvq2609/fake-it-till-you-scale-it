import { describe, it, expect } from 'vitest';
import { createSolution, solutionEquals, addTradeoffToSolution, addTopicToSolution } from '../entities/solution';
import { createTradeoff } from '../value-objects/tradeoff';
import { createTopic } from '../entities/topic';
import { ValidationError, EmptyTradeoffError } from '../errors';

describe('Solution Entity', () => {
  const sampleTradeoff = createTradeoff(
    'Use Redis',
    'Fast caching',
    'Extra infrastructure'
  );
  const sampleTopic = createTopic('Caching');

  describe('createSolution', () => {
    it('should create a valid solution with all required fields', () => {
      const solution = createSolution(
        'sol-1',
        'Redis Caching',
        'Use Redis for distributed caching',
        'graph TD; A[Client] --> B[Redis]',
        [sampleTradeoff],
        [sampleTopic]
      );

      expect(solution.id).toBe('sol-1');
      expect(solution.name).toBe('Redis Caching');
      expect(solution.description).toBe('Use Redis for distributed caching');
      expect(solution.diagram).toBe('graph TD; A[Client] --> B[Redis]');
      expect(solution.tradeoffs).toHaveLength(1);
      expect(solution.topics).toHaveLength(1);
    });

    it('should create solution with empty topics array by default', () => {
      const solution = createSolution(
        'sol-1',
        'Redis Caching',
        'Use Redis for distributed caching',
        'graph TD; A[Client] --> B[Redis]',
        [sampleTradeoff]
      );

      expect(solution.topics).toHaveLength(0);
    });

    it('should trim whitespace from string fields', () => {
      const solution = createSolution(
        '  sol-1  ',
        '  Redis Caching  ',
        '  Description  ',
        '  graph TD; A --> B  ',
        [sampleTradeoff]
      );

      expect(solution.id).toBe('sol-1');
      expect(solution.name).toBe('Redis Caching');
      expect(solution.description).toBe('Description');
      expect(solution.diagram).toBe('graph TD; A --> B');
    });

    it('should throw ValidationError for empty name', () => {
      expect(() => createSolution('id', '', 'desc', 'diag', [sampleTradeoff])).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty description', () => {
      expect(() => createSolution('id', 'name', '', 'diag', [sampleTradeoff])).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty diagram', () => {
      expect(() => createSolution('id', 'name', 'desc', '', [sampleTradeoff])).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty id', () => {
      expect(() => createSolution('', 'name', 'desc', 'diag', [sampleTradeoff])).toThrow(ValidationError);
    });

    it('should throw EmptyTradeoffError when tradeoffs array is empty', () => {
      expect(() => createSolution('id', 'name', 'desc', 'diag', [])).toThrow(EmptyTradeoffError);
    });

    it('should throw ValidationError for duplicate tradeoffs', () => {
      const tradeoff2 = createTradeoff('Use Redis', 'Fast caching', 'Extra infrastructure');
      expect(() => createSolution('id', 'name', 'desc', 'diag', [sampleTradeoff, tradeoff2])).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate topics', () => {
      const topic2 = createTopic('Caching'); // same slug
      expect(() => createSolution('id', 'name', 'desc', 'diag', [sampleTradeoff], [sampleTopic, topic2])).toThrow(ValidationError);
    });
  });

  describe('solutionEquals', () => {
    it('should return true for solutions with same id', () => {
      const s1 = createSolution('sol-1', 'Name', 'Desc', 'Diag', [sampleTradeoff]);
      const s2 = createSolution('sol-1', 'Different', 'Desc', 'Diag', [sampleTradeoff]);
      expect(solutionEquals(s1, s2)).toBe(true);
    });

    it('should return false for solutions with different ids', () => {
      const s1 = createSolution('sol-1', 'Name', 'Desc', 'Diag', [sampleTradeoff]);
      const s2 = createSolution('sol-2', 'Name', 'Desc', 'Diag', [sampleTradeoff]);
      expect(solutionEquals(s1, s2)).toBe(false);
    });
  });

  describe('addTradeoffToSolution', () => {
    it('should add a new tradeoff to solution', () => {
      const solution = createSolution('sol-1', 'Name', 'Desc', 'Diag', [sampleTradeoff]);
      const newTradeoff = createTradeoff('Use Memcached', 'Simple', 'Less features');

      const updated = addTradeoffToSolution(solution, newTradeoff);

      expect(updated.tradeoffs).toHaveLength(2);
      expect(updated.tradeoffs[1]).toBe(newTradeoff);
      // Original unchanged
      expect(solution.tradeoffs).toHaveLength(1);
    });

    it('should throw ValidationError for duplicate tradeoff', () => {
      const solution = createSolution('sol-1', 'Name', 'Desc', 'Diag', [sampleTradeoff]);
      expect(() => addTradeoffToSolution(solution, sampleTradeoff)).toThrow(ValidationError);
    });
  });

  describe('addTopicToSolution', () => {
    it('should add a new topic to solution', () => {
      const solution = createSolution('sol-1', 'Name', 'Desc', 'Diag', [sampleTradeoff]);
      const newTopic = createTopic('Performance');

      const updated = addTopicToSolution(solution, newTopic);

      expect(updated.topics).toHaveLength(1);
      expect(updated.topics[0]).toBe(newTopic);
      // Original unchanged
      expect(solution.topics).toHaveLength(0);
    });

    it('should throw ValidationError for duplicate topic', () => {
      const solution = createSolution('sol-1', 'Name', 'Desc', 'Diag', [sampleTradeoff], [sampleTopic]);
      expect(() => addTopicToSolution(solution, sampleTopic)).toThrow(ValidationError);
    });
  });
});