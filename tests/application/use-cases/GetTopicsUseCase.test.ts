import { describe, it, expect, beforeEach } from 'vitest';
import { GetTopicsUseCase } from '../../../packages/problem-catalog/src/application/use-cases/GetTopicsUseCase';
import { Problem } from '../../../packages/problem-catalog/src/domain/entities/Problem';
import { Solution } from '../../../packages/problem-catalog/src/domain/entities/Solution';
import { Topic } from '../../../packages/problem-catalog/src/domain/entities/Topic';
import { Author } from '../../../packages/problem-catalog/src/domain/entities/Author';
import { Tradeoff } from '../../../packages/problem-catalog/src/domain/value-objects/Tradeoff';
import { IProblemRepository } from '../../../packages/problem-catalog/src/domain/repositories/IProblemRepository';

class InMemoryProblemRepository implements IProblemRepository {
  private problems: Map<string, Problem> = new Map();

  async findAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }

  async findById(id: string): Promise<Problem | null> {
    return this.problems.get(id) ?? null;
  }

  async findPublished(): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter(p => p.status === 'Published');
  }

  async findByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter(p => p.difficulty === difficulty);
  }

  async findByTopic(topicSlug: string): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter(p =>
      p.topics.some(t => t.slug === topicSlug)
    );
  }

  async findBySolutionTopic(topicSlug: string): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter(p =>
      p.solutions.some(s => s.topics.some(t => t.slug === topicSlug))
    );
  }

  async save(problem: Problem): Promise<void> {
    this.problems.set(problem.id, problem);
  }

  async update(problem: Problem): Promise<void> {
    if (!this.problems.has(problem.id)) {
      throw new Error(`Problem ${problem.id} not found`);
    }
    this.problems.set(problem.id, problem);
  }

  async delete(id: string): Promise<void> {
    this.problems.delete(id);
  }

  addProblem(problem: Problem): void {
    this.problems.set(problem.id, problem);
  }

  clear(): void {
    this.problems.clear();
  }
}

describe('GetTopicsUseCase', () => {
  let repository: InMemoryProblemRepository;
  let useCase: GetTopicsUseCase;

  let author: Author;
  let topic1: Topic;
  let topic2: Topic;
  let topic3: Topic;
  let tradeoff: Tradeoff;
  let solution: Solution;

  beforeEach(() => {
    repository = new InMemoryProblemRepository();
    useCase = new GetTopicsUseCase(repository);

    author = Author.create('author-1', 'John Doe', 'Architect');
    topic1 = Topic.create('System Design');
    topic2 = Topic.create('Distributed Systems');
    topic3 = Topic.create('Caching');
    tradeoff = Tradeoff.create('Use Redis', 'Fast', 'Complex');
    solution = Solution.create({
      id: 'sol-1',
      name: 'Redis Cache',
      description: 'Use Redis for caching',
      diagram: 'graph TD; A --> B',
      tradeoffs: [tradeoff],
      topics: [topic1],
    });
  });

  describe('execute', () => {
    it('should return empty array when no problems exist', async () => {
      const result = await useCase.execute();
      expect(result.topics).toHaveLength(0);
    });

    it('should return topics with correct counts', async () => {
      const prob1 = Problem.create({ id: 'prob-1', title: 'Problem 1', prompt: 'Prompt', difficulty: 'Easy', status: 'Published', solutions: [solution], topics: [topic1], relatedProblems: [], author });
      const prob2 = Problem.create({ id: 'prob-2', title: 'Problem 2', prompt: 'Prompt', difficulty: 'Medium', status: 'Published', solutions: [solution], topics: [topic1, topic2], relatedProblems: [], author });
      const prob3 = Problem.create({ id: 'prob-3', title: 'Problem 3', prompt: 'Prompt', difficulty: 'Hard', status: 'Published', solutions: [solution], topics: [topic2, topic3], relatedProblems: [], author });

      repository.addProblem(prob1);
      repository.addProblem(prob2);
      repository.addProblem(prob3);

      const result = await useCase.execute();

      expect(result.topics).toHaveLength(3);

      const systemDesign = result.topics.find(t => t.topic.slug === 'system-design');
      expect(systemDesign).toBeDefined();
      expect(systemDesign!.problemCount).toBe(2);

      const distributedSystems = result.topics.find(t => t.topic.slug === 'distributed-systems');
      expect(distributedSystems).toBeDefined();
      expect(distributedSystems!.problemCount).toBe(2);

      const caching = result.topics.find(t => t.topic.slug === 'caching');
      expect(caching).toBeDefined();
      expect(caching!.problemCount).toBe(1);
    });

    it('should sort by problem count descending', async () => {
      const prob1 = Problem.create({ id: 'prob-1', title: 'P1', prompt: 'P', difficulty: 'Easy', status: 'Published', solutions: [solution], topics: [topic1], relatedProblems: [], author });
      const prob2 = Problem.create({ id: 'prob-2', title: 'P2', prompt: 'P', difficulty: 'Easy', status: 'Published', solutions: [solution], topics: [topic1], relatedProblems: [], author });
      const prob3 = Problem.create({ id: 'prob-3', title: 'P3', prompt: 'P', difficulty: 'Easy', status: 'Published', solutions: [solution], topics: [topic2], relatedProblems: [], author });

      repository.addProblem(prob1);
      repository.addProblem(prob2);
      repository.addProblem(prob3);

      const result = await useCase.execute();

      expect(result.topics[0].topic.slug).toBe('system-design');
      expect(result.topics[0].problemCount).toBe(2);
      expect(result.topics[1].topic.slug).toBe('distributed-systems');
      expect(result.topics[1].problemCount).toBe(1);
    });

    it('should sort alphabetically when counts are equal', async () => {
      const topicA = Topic.create('Alpha Topic');
      const topicB = Topic.create('Beta Topic');

      const prob1 = Problem.create({ id: 'prob-1', title: 'P1', prompt: 'P', difficulty: 'Easy', status: 'Published', solutions: [solution], topics: [topicA], relatedProblems: [], author });
      const prob2 = Problem.create({ id: 'prob-2', title: 'P2', prompt: 'P', difficulty: 'Easy', status: 'Published', solutions: [solution], topics: [topicB], relatedProblems: [], author });

      repository.addProblem(prob1);
      repository.addProblem(prob2);

      const result = await useCase.execute();

      expect(result.topics[0].topic.slug).toBe('alpha-topic');
      expect(result.topics[1].topic.slug).toBe('beta-topic');
    });

    it('should include topics from draft problems', async () => {
      const prob1 = Problem.create({ id: 'prob-1', title: 'P1', prompt: 'P', difficulty: 'Easy', status: 'Published', solutions: [solution], topics: [topic1], relatedProblems: [], author });
      const prob2 = Problem.create({ id: 'prob-2', title: 'P2', prompt: 'P', difficulty: 'Easy', status: 'Draft', solutions: [solution], topics: [topic2], relatedProblems: [], author });

      repository.addProblem(prob1);
      repository.addProblem(prob2);

      const result = await useCase.execute();

      expect(result.topics).toHaveLength(2);
      expect(result.topics.find(t => t.topic.slug === 'system-design')).toBeDefined();
      expect(result.topics.find(t => t.topic.slug === 'distributed-systems')).toBeDefined();
    });

    it('should count topic occurrences across multiple problems', async () => {
      const prob1 = Problem.create({ id: 'prob-1', title: 'P1', prompt: 'P', difficulty: 'Easy', status: 'Published', solutions: [solution], topics: [topic1], relatedProblems: [], author });
      const prob2 = Problem.create({ id: 'prob-2', title: 'P2', prompt: 'P', difficulty: 'Easy', status: 'Published', solutions: [solution], topics: [topic1], relatedProblems: [], author });
      const prob3 = Problem.create({ id: 'prob-3', title: 'P3', prompt: 'P', difficulty: 'Easy', status: 'Published', solutions: [solution], topics: [topic1], relatedProblems: [], author });

      repository.addProblem(prob1);
      repository.addProblem(prob2);
      repository.addProblem(prob3);

      const result = await useCase.execute();

      const systemDesign = result.topics.find(t => t.topic.slug === 'system-design');
      expect(systemDesign).toBeDefined();
      expect(systemDesign!.problemCount).toBe(3);
    });

    it('should return TopicWithCount with correct structure', async () => {
      const prob1 = Problem.create({ id: 'prob-1', title: 'P1', prompt: 'P', difficulty: 'Easy', status: 'Published', solutions: [solution], topics: [topic1], relatedProblems: [], author });
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