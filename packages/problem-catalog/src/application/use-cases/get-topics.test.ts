import { describe, it, expect, beforeEach } from 'vitest';
import { FakeProblemCatalogRepository } from '../ports/fake-problem-catalog-repository';
import { GetTopicsUseCase, TopicWithCount } from './get-topics';
import { createProblem } from '../../domain/entities/problem';
import { createSolution } from '../../domain/entities/solution';
import { createTopic } from '../../domain/entities/topic';
import { createAuthor } from '../../domain/entities/author';
import { createTradeoff } from '../../domain/value-objects/tradeoff';

describe('GetTopicsUseCase', () => {
  let repository: FakeProblemCatalogRepository;
  let useCase: GetTopicsUseCase;

  let author: ReturnType<typeof createAuthor>;
  let topic1: ReturnType<typeof createTopic>;
  let topic2: ReturnType<typeof createTopic>;
  let topic3: ReturnType<typeof createTopic>;
  let tradeoff: ReturnType<typeof createTradeoff>;
  let solution: ReturnType<typeof createSolution>;

  beforeEach(() => {
    repository = new FakeProblemCatalogRepository();
    useCase = new GetTopicsUseCase(repository);

    author = createAuthor('author-1', 'John Doe', 'Architect');
    topic1 = createTopic('System Design');
    topic2 = createTopic('Distributed Systems');
    topic3 = createTopic('Caching');
    tradeoff = createTradeoff('Use Redis', 'Fast', 'Complex');
    solution = createSolution('sol-1', 'Redis Cache', 'Use Redis for caching', 'graph TD; A --> B', [tradeoff], [topic1]);
  });

  describe('execute', () => {
    it('should return empty array when no problems exist', async () => {
      const result = await useCase.execute();

      expect(result.topics).toHaveLength(0);
    });

    it('should return topics with correct counts', async () => {
      // prob-1: system-design
      const prob1 = createProblem('prob-1', 'Problem 1', 'Prompt', 'Easy', 'Published', [solution], [topic1], [], author);
      // prob-2: system-design, distributed-systems
      const prob2 = createProblem('prob-2', 'Problem 2', 'Prompt', 'Medium', 'Published', [solution], [topic1, topic2], [], author);
      // prob-3: distributed-systems, caching
      const prob3 = createProblem('prob-3', 'Problem 3', 'Prompt', 'Hard', 'Published', [solution], [topic2, topic3], [], author);

      repository.addProblem(prob1);
      repository.addProblem(prob2);
      repository.addProblem(prob3);

      const result = await useCase.execute();

      expect(result.topics).toHaveLength(3);

      // system-design: 2 problems
      const systemDesign = result.topics.find((t) => t.topic.slug === 'system-design');
      expect(systemDesign).toBeDefined();
      expect(systemDesign!.problemCount).toBe(2);

      // distributed-systems: 2 problems
      const distributedSystems = result.topics.find((t) => t.topic.slug === 'distributed-systems');
      expect(distributedSystems).toBeDefined();
      expect(distributedSystems!.problemCount).toBe(2);

      // caching: 1 problem
      const caching = result.topics.find((t) => t.topic.slug === 'caching');
      expect(caching).toBeDefined();
      expect(caching!.problemCount).toBe(1);
    });

    it('should sort by problem count descending', async () => {
      const prob1 = createProblem('prob-1', 'P1', 'P', 'Easy', 'Published', [solution], [topic1], [], author);
      const prob2 = createProblem('prob-2', 'P2', 'P', 'Easy', 'Published', [solution], [topic1], [], author);
      const prob3 = createProblem('prob-3', 'P3', 'P', 'Easy', 'Published', [solution], [topic2], [], author);

      repository.addProblem(prob1);
      repository.addProblem(prob2);
      repository.addProblem(prob3);

      const result = await useCase.execute();

      expect(result.topics[0].topic.slug).toBe('system-design'); // count: 2
      expect(result.topics[0].problemCount).toBe(2);
      expect(result.topics[1].topic.slug).toBe('distributed-systems'); // count: 1
      expect(result.topics[1].problemCount).toBe(1);
    });

    it('should sort alphabetically when counts are equal', async () => {
      // Create topics that will have same count
      const topicA = createTopic('Alpha Topic');
      const topicB = createTopic('Beta Topic');

      const prob1 = createProblem('prob-1', 'P1', 'P', 'Easy', 'Published', [solution], [topicA], [], author);
      const prob2 = createProblem('prob-2', 'P2', 'P', 'Easy', 'Published', [solution], [topicB], [], author);

      repository.addProblem(prob1);
      repository.addProblem(prob2);

      const result = await useCase.execute();

      expect(result.topics[0].topic.slug).toBe('alpha-topic');
      expect(result.topics[1].topic.slug).toBe('beta-topic');
    });

    it('should include topics from draft problems', async () => {
      const prob1 = createProblem('prob-1', 'P1', 'P', 'Easy', 'Published', [solution], [topic1], [], author);
      const prob2 = createProblem('prob-2', 'P2', 'P', 'Easy', 'Draft', [solution], [topic2], [], author);

      repository.addProblem(prob1);
      repository.addProblem(prob2);

      const result = await useCase.execute();

      expect(result.topics).toHaveLength(2);
      expect(result.topics.find((t) => t.topic.slug === 'system-design')).toBeDefined();
      expect(result.topics.find((t) => t.topic.slug === 'distributed-systems')).toBeDefined();
    });

    it('should count topic occurrences across multiple problems', async () => {
      const prob1 = createProblem('prob-1', 'P1', 'P', 'Easy', 'Published', [solution], [topic1], [], author);
      const prob2 = createProblem('prob-2', 'P2', 'P', 'Easy', 'Published', [solution], [topic1], [], author);
      const prob3 = createProblem('prob-3', 'P3', 'P', 'Easy', 'Published', [solution], [topic1], [], author);

      repository.addProblem(prob1);
      repository.addProblem(prob2);
      repository.addProblem(prob3);

      const result = await useCase.execute();

      const systemDesign = result.topics.find((t) => t.topic.slug === 'system-design');
      expect(systemDesign).toBeDefined();
      expect(systemDesign!.problemCount).toBe(3);
    });

    it('should return TopicWithCount with correct structure', async () => {
      const prob1 = createProblem('prob-1', 'P1', 'P', 'Easy', 'Published', [solution], [topic1], [], author);
      repository.addProblem(prob1);

      const result = await useCase.execute();

      const topicWithCount = result.topics[0];
      expect(topicWithCount).toHaveProperty('topic');
      expect(topicWithCount).toHaveProperty('problemCount');
      expect(topicWithCount.topic).toHaveProperty('name');
      expect(topicWithCount.topic).toHaveProperty('slug');
      expect(typeof topicWithCount.problemCount).toBe('number');
    });
  });
});