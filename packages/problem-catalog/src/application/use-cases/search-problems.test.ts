import { describe, it, expect, beforeEach } from 'vitest';
import { FakeProblemCatalogRepository } from '../ports/fake-problem-catalog-repository';
import { AsyncProblemCatalogService } from '../../domain/services/problem-catalog-service';
import { SearchProblemsUseCase, SearchProblemsInput } from './search-problems';
import { createProblem } from '../../domain/entities/problem';
import { createSolution } from '../../domain/entities/solution';
import { createTopic } from '../../domain/entities/topic';
import { createAuthor } from '../../domain/entities/author';
import { createTradeoff } from '../../domain/value-objects/tradeoff';
import { Topic } from '../../domain/entities/topic';

/**
 * In-memory topic repository for testing (async).
 */
class InMemoryTopicRepository {
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

  clear(): void {
    this.topics.clear();
  }
}

describe('SearchProblemsUseCase', () => {
  let repository: FakeProblemCatalogRepository;
  let topicRepo: InMemoryTopicRepository;
  let catalogService: AsyncProblemCatalogService;
  let useCase: SearchProblemsUseCase;

  let author: ReturnType<typeof createAuthor>;
  let topic1: ReturnType<typeof createTopic>;
  let topic2: ReturnType<typeof createTopic>;
  let tradeoff: ReturnType<typeof createTradeoff>;
  let solution1: ReturnType<typeof createSolution>;
  let solution2: ReturnType<typeof createSolution>;
  let problem1: ReturnType<typeof createProblem>;
  let problem2: ReturnType<typeof createProblem>;
  let problem3: ReturnType<typeof createProblem>;

  beforeEach(() => {
    repository = new FakeProblemCatalogRepository();
    topicRepo = new InMemoryTopicRepository();
    catalogService = new AsyncProblemCatalogService(repository, topicRepo);
    useCase = new SearchProblemsUseCase(repository, catalogService);

    author = createAuthor('author-1', 'John Doe', 'Architect');
    topic1 = createTopic('System Design');
    topic2 = createTopic('Distributed Systems');
    tradeoff = createTradeoff('Use Redis', 'Fast', 'Complex');
    solution1 = createSolution('sol-1', 'Redis Cache', 'Use Redis for caching', 'graph TD; A --> B', [tradeoff], [topic1]);
    solution2 = createSolution('sol-2', 'Memcached', 'Use Memcached for caching', 'graph TD; A --> C', [tradeoff], [topic2]);

    problem1 = createProblem(
      'prob-1',
      'Design a URL Shortener',
      'Design a system like bit.ly',
      'Medium',
      'Published',
      [solution1],
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
      [solution2],
      [topic1, topic2],
      ['prob-1'],
      author
    );

    problem3 = createProblem(
      'prob-3',
      'Design a Cache',
      'Design a distributed cache',
      'Easy',
      'Draft',
      [],
      [topic2],
      [],
      author
    );

    // Add problems to repository
    repository.addProblem(problem1);
    repository.addProblem(problem2);
    repository.addProblem(problem3);
    topicRepo.save(topic1);
    topicRepo.save(topic2);
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
      // Add more problems (8 more = 10 total published)
      for (let i = 4; i <= 11; i++) {
        const p = createProblem(
          `prob-${i}`,
          `Problem ${i}`,
          'Prompt',
          'Easy',
          'Published',
          [solution1],
          [topic1],
          [],
          author
        );
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