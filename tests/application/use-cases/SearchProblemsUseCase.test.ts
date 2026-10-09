import { describe, it, expect, beforeEach } from 'vitest';
import { SearchProblemsUseCase } from '../../../packages/problem-catalog/src/application/use-cases/SearchProblemsUseCase';
import { ProblemCatalogService } from '../../../packages/problem-catalog/src/domain/services/ProblemCatalogService';
import { Problem, Difficulty, ProblemStatus } from '../../../packages/problem-catalog/src/domain/entities/Problem';
import { Solution } from '../../../packages/problem-catalog/src/domain/entities/Solution';
import { Topic } from '../../../packages/problem-catalog/src/domain/entities/Topic';
import { Author } from '../../../packages/problem-catalog/src/domain/entities/Author';
import { Tradeoff } from '../../../packages/problem-catalog/src/domain/value-objects/Tradeoff';
import { IProblemRepository } from '../../../packages/problem-catalog/src/domain/repositories/IProblemRepository';
import { ITopicRepository } from '../../../packages/problem-catalog/src/domain/repositories/ITopicRepository';

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

  async findByDifficulty(difficulty: Difficulty): Promise<Problem[]> {
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

class InMemoryTopicRepository implements ITopicRepository {
  private topics: Map<string, Topic> = new Map();

  async findBySlug(slug: string): Promise<Topic | null> {
    return this.topics.get(slug) ?? null;
  }

  async findAll(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }

  async save(topic: Topic): Promise<void> {
    this.topics.set(topic.slug, topic);
  }

  async delete(slug: string): Promise<void> {
    this.topics.delete(slug);
  }

  saveSync(topic: Topic): void {
    this.topics.set(topic.slug, topic);
  }

  clear(): void {
    this.topics.clear();
  }
}

describe('SearchProblemsUseCase', () => {
  let repository: InMemoryProblemRepository;
  let topicRepo: InMemoryTopicRepository;
  let catalogService: ProblemCatalogService;
  let useCase: SearchProblemsUseCase;

  let author: Author;
  let topic1: Topic;
  let topic2: Topic;
  let tradeoff: Tradeoff;
  let solution1: Solution;
  let solution2: Solution;
  let problem1: Problem;
  let problem2: Problem;
  let problem3: Problem;

  beforeEach(() => {
    repository = new InMemoryProblemRepository();
    topicRepo = new InMemoryTopicRepository();
    catalogService = new ProblemCatalogService(repository, topicRepo);
    useCase = new SearchProblemsUseCase(repository, catalogService);

    author = Author.create('author-1', 'John Doe', 'Architect');
    topic1 = Topic.create('System Design');
    topic2 = Topic.create('Distributed Systems');
    tradeoff = Tradeoff.create('Use Redis', 'Fast', 'Complex');
    solution1 = Solution.create({
      id: 'sol-1',
      name: 'Redis Cache',
      description: 'Use Redis for caching',
      diagram: 'graph TD; A --> B',
      tradeoffs: [tradeoff],
      topics: [topic1],
    });
    solution2 = Solution.create({
      id: 'sol-2',
      name: 'Memcached',
      description: 'Use Memcached for caching',
      diagram: 'graph TD; A --> C',
      tradeoffs: [tradeoff],
      topics: [topic2],
    });

    problem1 = Problem.create({
      id: 'prob-1',
      title: 'Design a URL Shortener',
      prompt: 'Design a system like bit.ly',
      difficulty: 'Medium',
      status: 'Published',
      solutions: [solution1],
      topics: [topic1],
      relatedProblems: ['prob-2'],
      author,
    });

    problem2 = Problem.create({
      id: 'prob-2',
      title: 'Design a Rate Limiter',
      prompt: 'Design a rate limiting system',
      difficulty: 'Hard',
      status: 'Published',
      solutions: [solution2],
      topics: [topic1, topic2],
      relatedProblems: ['prob-1'],
      author,
    });

    problem3 = Problem.create({
      id: 'prob-3',
      title: 'Design a Cache',
      prompt: 'Design a distributed cache',
      difficulty: 'Easy',
      status: 'Draft',
      solutions: [],
      topics: [topic2],
      relatedProblems: [],
      author,
    });

    repository.addProblem(problem1);
    repository.addProblem(problem2);
    repository.addProblem(problem3);
    topicRepo.saveSync(topic1);
    topicRepo.saveSync(topic2);
  });

  describe('execute', () => {
    it('should return all published problems by default', async () => {
      const result = await useCase.execute({});

      expect(result.problems).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by query (searches title and prompt)', async () => {
      const result = await useCase.execute({ query: 'url shortener' });

      expect(result.problems).toHaveLength(1);
      expect(result.problems[0].id).toBe('prob-1');
      expect(result.total).toBe(1);
    });

    it('should filter by difficulty', async () => {
      const result = await useCase.execute({ difficulty: 'Hard' });

      expect(result.problems).toHaveLength(1);
      expect(result.problems[0].id).toBe('prob-2');
      expect(result.problems[0].difficulty).toBe('Hard');
    });

    it('should filter by topic', async () => {
      const result = await useCase.execute({ topic: 'system-design' });

      expect(result.problems).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by solution topic', async () => {
      const result = await useCase.execute({ solutionTopic: 'memcached' });

      expect(result.problems).toHaveLength(1);
      expect(result.problems[0].id).toBe('prob-2');
    });

    it('should filter by status', async () => {
      const result = await useCase.execute({ status: 'Draft' });

      expect(result.problems).toHaveLength(1);
      expect(result.problems[0].id).toBe('prob-3');
      expect(result.problems[0].status).toBe('Draft');
    });

    it('should combine multiple filters', async () => {
      const result = await useCase.execute({
        difficulty: 'Medium',
        topic: 'system-design',
      });

      expect(result.problems).toHaveLength(1);
      expect(result.problems[0].id).toBe('prob-1');
    });

    it('should paginate results', async () => {
      const result = await useCase.execute({ page: 1, pageSize: 1 });

      expect(result.problems).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(2);
    });

    it('should return empty results for page beyond total', async () => {
      const result = await useCase.execute({ page: 10, pageSize: 1 });

      expect(result.problems).toHaveLength(0);
      expect(result.page).toBe(10);
      expect(result.totalPages).toBe(2);
    });

    it('should return correct total pages calculation', async () => {
      for (let i = 4; i <= 11; i++) {
        const p = Problem.create({
          id: `prob-${i}`,
          title: `Problem ${i}`,
          prompt: 'Prompt',
          difficulty: 'Easy',
          status: 'Published',
          solutions: [solution1],
          topics: [topic1],
          relatedProblems: [],
          author,
        });
        repository.addProblem(p);
      }

      const result = await useCase.execute({ pageSize: 3 });

      expect(result.total).toBe(10);
      expect(result.totalPages).toBe(4);
    });

    it('should return empty array when no problems match', async () => {
      const result = await useCase.execute({ query: 'nonexistent' });

      expect(result.problems).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });
});