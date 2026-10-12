import { describe, it, expect, beforeEach } from 'vitest';
import { Solution } from '../../../src/domain/entities/Solution';
import { Topic } from '../../../src/domain/entities/Topic';
import { Tradeoff } from '../../../src/domain/value-objects/Tradeoff';
import { ValidationError, EmptyTradeoffError } from '../../../src/domain/errors';

describe('Solution Entity', () => {
  let tradeoff: Tradeoff;
  let topic: Topic;

  beforeEach(() => {
    tradeoff = Tradeoff.create('Use Redis', 'Fast caching', 'Extra infrastructure');
    topic = Topic.create('Caching');
  });

  describe('create', () => {
    it('should create a valid solution with all required fields', () => {
      const solution = Solution.create({
        id: 'sol-1',
        name: 'Redis Caching',
        description: 'Use Redis for distributed caching',
        diagram: 'graph TD; A[Client] --> B[Redis]',
        tradeoffs: [tradeoff],
        topics: [topic],
      });

      expect(solution.id).toBe('sol-1');
      expect(solution.name).toBe('Redis Caching');
      expect(solution.description).toBe('Use Redis for distributed caching');
      expect(solution.diagram).toBe('graph TD; A[Client] --> B[Redis]');
      expect(solution.tradeoffs).toHaveLength(1);
      expect(solution.topics).toHaveLength(1);
    });

    it('should create solution with empty topics array by default', () => {
      const solution = Solution.create({
        id: 'sol-1',
        name: 'Redis Caching',
        description: 'Use Redis for distributed caching',
        diagram: 'graph TD; A[Client] --> B[Redis]',
        tradeoffs: [tradeoff],
      });

      expect(solution.topics).toHaveLength(0);
    });

    it('should trim whitespace from string fields', () => {
      const solution = Solution.create({
        id: '  sol-1  ',
        name: '  Redis Caching  ',
        description: '  Description  ',
        diagram: '  graph TD; A --> B  ',
        tradeoffs: [tradeoff],
      });

      expect(solution.id).toBe('sol-1');
      expect(solution.name).toBe('Redis Caching');
      expect(solution.description).toBe('Description');
      expect(solution.diagram).toBe('graph TD; A --> B');
    });

    it('should throw ValidationError for empty name', () => {
      expect(() =>
        Solution.create({
          id: 'id',
          name: '',
          description: 'desc',
          diagram: 'diag',
          tradeoffs: [tradeoff],
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty description', () => {
      expect(() =>
        Solution.create({
          id: 'id',
          name: 'name',
          description: '',
          diagram: 'diag',
          tradeoffs: [tradeoff],
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty diagram', () => {
      expect(() =>
        Solution.create({
          id: 'id',
          name: 'name',
          description: 'desc',
          diagram: '',
          tradeoffs: [tradeoff],
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty id', () => {
      expect(() =>
        Solution.create({
          id: '',
          name: 'name',
          description: 'desc',
          diagram: 'diag',
          tradeoffs: [tradeoff],
        })
      ).toThrow(ValidationError);
    });

    it('should throw EmptyTradeoffError when tradeoffs array is empty', () => {
      expect(() =>
        Solution.create({
          id: 'id',
          name: 'name',
          description: 'desc',
          diagram: 'diag',
          tradeoffs: [],
        })
      ).toThrow(EmptyTradeoffError);
    });

    it('should throw ValidationError for duplicate tradeoffs', () => {
      const tradeoff2 = Tradeoff.create('Use Redis', 'Fast caching', 'Extra infrastructure');
      expect(() =>
        Solution.create({
          id: 'id',
          name: 'name',
          description: 'desc',
          diagram: 'diag',
          tradeoffs: [tradeoff, tradeoff2],
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate topics', () => {
      const topic2 = Topic.create('Caching'); // same slug
      expect(() =>
        Solution.create({
          id: 'id',
          name: 'name',
          description: 'desc',
          diagram: 'diag',
          tradeoffs: [tradeoff],
          topics: [topic, topic2],
        })
      ).toThrow(ValidationError);
    });
  });

  describe('equals', () => {
    it('should return true for solutions with same id', () => {
      const s1 = Solution.create({
        id: 'sol-1',
        name: 'Name',
        description: 'Desc',
        diagram: 'Diag',
        tradeoffs: [tradeoff],
      });
      const s2 = Solution.create({
        id: 'sol-1',
        name: 'Different',
        description: 'Desc',
        diagram: 'Diag',
        tradeoffs: [tradeoff],
      });

      expect(s1.equals(s2)).toBe(true);
    });

    it('should return false for solutions with different ids', () => {
      const s1 = Solution.create({
        id: 'sol-1',
        name: 'Name',
        description: 'Desc',
        diagram: 'Diag',
        tradeoffs: [tradeoff],
      });
      const s2 = Solution.create({
        id: 'sol-2',
        name: 'Name',
        description: 'Desc',
        diagram: 'Diag',
        tradeoffs: [tradeoff],
      });

      expect(s1.equals(s2)).toBe(false);
    });
  });

  describe('addTradeoff', () => {
    it('should add a new tradeoff to solution', () => {
      const solution = Solution.create({
        id: 'sol-1',
        name: 'Name',
        description: 'Desc',
        diagram: 'Diag',
        tradeoffs: [tradeoff],
      });

      const newTradeoff = Tradeoff.create('Use Memcached', 'Simple', 'Less features');
      const updated = solution.addTradeoff(newTradeoff);

      expect(updated.tradeoffs).toHaveLength(2);
      expect(updated.tradeoffs[1]).toBe(newTradeoff);
      // Original unchanged
      expect(solution.tradeoffs).toHaveLength(1);
    });

    it('should throw ValidationError for duplicate tradeoff', () => {
      const solution = Solution.create({
        id: 'sol-1',
        name: 'Name',
        description: 'Desc',
        diagram: 'Diag',
        tradeoffs: [tradeoff],
      });

      expect(() => solution.addTradeoff(tradeoff)).toThrow(ValidationError);
    });
  });

  describe('addTopic', () => {
    it('should add a new topic to solution', () => {
      const solution = Solution.create({
        id: 'sol-1',
        name: 'Name',
        description: 'Desc',
        diagram: 'Diag',
        tradeoffs: [tradeoff],
      });

      const newTopic = Topic.create('Performance');
      const updated = solution.addTopic(newTopic);

      expect(updated.topics).toHaveLength(1);
      expect(updated.topics[0]).toBe(newTopic);
      // Original unchanged
      expect(solution.topics).toHaveLength(0);
    });

    it('should throw ValidationError for duplicate topic', () => {
      const solution = Solution.create({
        id: 'sol-1',
        name: 'Name',
        description: 'Desc',
        diagram: 'Diag',
        tradeoffs: [tradeoff],
        topics: [topic],
      });

      expect(() => solution.addTopic(topic)).toThrow(ValidationError);
    });
  });
});