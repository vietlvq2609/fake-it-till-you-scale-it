import { describe, it, expect, beforeEach } from 'vitest';
import { FakeProblemCatalogRepository } from '../ports/fake-problem-catalog-repository';
import { createProblem } from '../../domain/entities/problem';
import { createSolution } from '../../domain/entities/solution';
import { createTopic } from '../../domain/entities/topic';
import { createAuthor } from '../../domain/entities/author';
import { createTradeoff } from '../../domain/value-objects/tradeoff';

describe('FakeProblemCatalogRepository', () => {
  let repository: FakeProblemCatalogRepository;

  let author: ReturnType<typeof createAuthor>;
  let topic1: ReturnType<typeof createTopic>;
  let topic2: ReturnType<typeof createTopic>;
  let tradeoff: ReturnType<typeof createTradeoff>;
  let solution: ReturnType<typeof createSolution>;
  let problem1: ReturnType<typeof createProblem>;
  let problem2: ReturnType<typeof createProblem>;

  beforeEach(() => {
    repository = new FakeProblemCatalogRepository();

    author = createAuthor('author-1', 'John Doe', 'Architect');
    topic1 = createTopic('System Design');
    topic2 = createTopic('Distributed Systems');
    tradeoff = createTradeoff('Use Redis', 'Fast', 'Complex');
    solution = createSolution('sol-1', 'Redis Cache', 'Use Redis for caching', 'graph TD; A --> B', [tradeoff], [topic1]);

    problem1 = createProblem(
      'prob-1',
      'Design a URL Shortener',
      'Design a system like bit.ly',
      'Medium',
      'Published',
      [solution],
      [topic1],
      ['prob-2'],
      author
    );

    problem2 = createProblem(
      'prob-2',
      'Design a Rate Limiter',
      'Design a rate limiting system',
      'Hard',
      'Published',
      [solution],
      [topic1, topic2],
      ['prob-1'],
      author
    );
  });

  describe('findAll', () => {
    it('should return empty array when no problems', async () => {
      const result = await repository.findAll();
      expect(result).toHaveLength(0);
    });

    it('should return all problems', async () => {
      repository.addProblem(problem1);
      repository.addProblem(problem2);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return null when problem not found', async () => {
      const result = await repository.findById('nonexistent');
      expect(result).toBeNull();
    });

    it('should return problem when found', async () => {
      repository.addProblem(problem1);

      const result = await repository.findById('prob-1');

      expect(result).toBe(problem1);
      expect(result?.id).toBe('prob-1');
    });
  });

  describe('findPublished', () => {
    it('should return only published problems', async () => {
      const draftProblem = createProblem(
        'prob-3',
        'Draft Problem',
        'Prompt',
        'Easy',
        'Draft',
        [solution],
        [topic1],
        [],
        author
      );
      repository.addProblem(problem1);
      repository.addProblem(problem2);
      repository.addProblem(draftProblem);

      const result = await repository.findPublished();

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.status === 'Published')).toBe(true);
    });
  });

  describe('findByDifficulty', () => {
    it('should return problems matching difficulty', async () => {
      repository.addProblem(problem1); // Medium
      repository.addProblem(problem2); // Hard

      const result = await repository.findByDifficulty('Hard');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('prob-2');
    });

    it('should return empty array when no match', async () => {
      repository.addProblem(problem1); // Medium

      const result = await repository.findByDifficulty('Easy');

      expect(result).toHaveLength(0);
    });
  });

  describe('findBySolutionTopic', () => {
    it('should return problems with solution having topic', async () => {
      repository.addProblem(problem1); // solution has system-design topic

      const result = await repository.findBySolutionTopic('system-design');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('prob-1');
    });

    it('should return empty array when no solution has topic', async () => {
      repository.addProblem(problem1);

      const result = await repository.findBySolutionTopic('nonexistent');

      expect(result).toHaveLength(0);
    });
  });

  describe('findByTopic', () => {
    it('should return problems with the topic', async () => {
      repository.addProblem(problem1); // topic: system-design
      repository.addProblem(problem2); // topics: system-design, distributed-systems

      const result = await repository.findByTopic('system-design');

      expect(result).toHaveLength(2);
    });

    it('should return empty array when no problem has topic', async () => {
      repository.addProblem(problem1);

      const result = await repository.findByTopic('nonexistent');

      expect(result).toHaveLength(0);
    });
  });

  describe('save', () => {
    it('should add new problem', async () => {
      await repository.save(problem1);

      const result = await repository.findById('prob-1');
      expect(result).toBe(problem1);
    });

    it('should update existing problem', async () => {
      repository.addProblem(problem1);

      const updatedProblem = createProblem(
        'prob-1',
        'Updated Title',
        'Updated prompt',
        'Medium',
        'Published',
        [solution],
        [topic1],
        [],
        author
      );

      await repository.save(updatedProblem);

      const result = await repository.findById('prob-1');
      expect(result?.title).toBe('Updated Title');
    });
  });

  describe('update', () => {
    it('should update existing problem', async () => {
      repository.addProblem(problem1);

      const updatedProblem = createProblem(
        'prob-1',
        'Updated Title',
        'Updated prompt',
        'Medium',
        'Published',
        [solution],
        [topic1],
        [],
        author
      );

      await repository.update(updatedProblem);

      const result = await repository.findById('prob-1');
      expect(result?.title).toBe('Updated Title');
    });

    it('should throw when updating non-existent problem', async () => {
      await expect(repository.update(problem1)).rejects.toThrow('Problem prob-1 not found');
    });
  });

  describe('delete', () => {
    it('should remove problem', async () => {
      repository.addProblem(problem1);

      await repository.delete('prob-1');

      const result = await repository.findById('prob-1');
      expect(result).toBeNull();
    });

    it('should not throw when deleting non-existent problem', async () => {
      await expect(repository.delete('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('helper methods', () => {
    it('clear should remove all problems and topics', async () => {
      repository.addProblem(problem1);
      repository.addProblem(problem2);

      repository.clear();

      expect(await repository.findAll()).toHaveLength(0);
    });

    it('getProblems should return all problems', async () => {
      repository.addProblem(problem1);
      repository.addProblem(problem2);

      const problems = repository.getProblems();

      expect(problems).toHaveLength(2);
    });

    it('getTopics should return all topics', async () => {
      repository.addProblem(problem1);

      const topics = repository.getTopics();

      expect(topics).toHaveLength(1);
      expect(topics[0].slug).toBe('system-design');
    });

    it('addProblem should add without async', () => {
      repository.addProblem(problem1);

      expect(repository.getProblems()).toHaveLength(1);
    });

    it('addTopic should add topic', () => {
      repository.addTopic(topic2);

      const topics = repository.getTopics();
      expect(topics).toHaveLength(1);
      expect(topics[0].slug).toBe('distributed-systems');
    });
  });
});