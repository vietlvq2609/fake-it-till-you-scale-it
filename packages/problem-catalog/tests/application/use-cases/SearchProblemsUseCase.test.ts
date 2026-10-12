import { describe, it, expect, beforeEach } from 'vitest';
import { SearchProblemsUseCase } from '../../../src/application/use-cases/SearchProblemsUseCase';
import { GetProblemDetailUseCase } from '../../../src/application/use-cases/GetProblemDetailUseCase';
import { GetTopicsUseCase } from '../../../src/application/use-cases/GetTopicsUseCase';
import { Problem } from '../../../src/domain/entities/Problem';
import { Solution } from '../../../src/domain/entities/Solution';
import { Topic } from '../../../src/domain/entities/Topic';
import { Author } from '../../../src/domain/entities/Author';
import { Tradeoff } from '../../../src/domain/value-objects/Tradeoff';
import { IProblemRepository } from '../../../src/domain/repositories/IProblemRepository';
import { ProblemCatalogService } from '../../../src/domain/services/ProblemCatalogService';
import { ProblemNotFoundError } from '../../../src/domain/errors';

// Fake in-memory repository
class FakeProblemRepository implements IProblemRepository {
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
    this.problems.set(problem.id, problem);
  }

  async delete(id: string): Promise<void> {
    this.problems.delete(id);
  }

  addProblem(problem: Problem) {
    this.problems.set(problem.id, problem);
  }
}

describe('SearchProblemsUseCase', () => {
  let repository: FakeProblemRepository;
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
  let draftProblem: Problem;

  beforeEach(() => {
    repository = new FakeProblemRepository();
    catalogService = new ProblemCatalogService(repository, {
      async findBySlug(slug: string) {
        const topics = [topic1, topic2];
        return topics.find(t => t.slug === slug) ?? null;
      },
      async findAll() { return [topic1, topic2]; },
      async save() {},
      async delete() {},
    });
    useCase = new SearchProblemsUseCase(repository, catalogService);

    author = Author.create('author-1', 'John Doe');
    topic1 = Topic.create('Caching');
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
      description: 'Use Memcached',
      diagram: 'graph TD; A --> C',
      tradeoffs: [tradeoff],
      topics: [topic2],
    });

    problem1 = Problem.create({
      id: 'prob-1',
      title: 'URL Shortener',
      prompt: 'Design bit.ly',
      difficulty: 'Medium',
      status: 'Published',
      solutions: [solution1],
      topics: [topic1],
      relatedProblems: [],
      author,
    });

    problem2 = Problem.create({
      id: 'prob-2',
      title: 'Rate Limiter',
      prompt: 'Design rate limiter',
      difficulty: 'Hard',
      status: 'Published',
      solutions: [solution2],
      topics: [topic2],
      relatedProblems: [],
      author,
    });

    draftProblem = Problem.create({
      id: 'prob-3',
      title: 'Draft Problem',
      prompt: 'Draft',
      difficulty: 'Easy',
      status: 'Draft',
      solutions: [solution1],
      topics: [topic1],
      relatedProblems: [],
      author,
    });

    repository.addProblem(problem1);
    repository.addProblem(problem2);
    repository.addProblem(draftProblem);
  });

  it('should return only published problems by default', async () => {
    const result = await useCase.execute({});

    expect(result.problems).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should filter by status', async () => {
    const result = await useCase.execute({ status: 'Draft' });

    expect(result.problems).toHaveLength(1);
    expect(result.problems[0].id).toBe('prob-3');
  });

  it('should filter by query in title', async () => {
    const result = await useCase.execute({ query: 'url' });

    expect(result.problems).toHaveLength(1);
    expect(result.problems[0].id).toBe('prob-1');
  });

  it('should filter by query in prompt', async () => {
    const result = await useCase.execute({ query: 'rate' });

    expect(result.problems).toHaveLength(1);
    expect(result.problems[0].id).toBe('prob-2');
  });

  it('should filter by difficulty', async () => {
    const result = await useCase.execute({ difficulty: 'Medium' });

    expect(result.problems).toHaveLength(1);
    expect(result.problems[0].id).toBe('prob-1');
  });

  it('should filter by topic', async () => {
    const result = await useCase.execute({ topic: 'caching' });

    expect(result.problems).toHaveLength(1);
    expect(result.problems[0].id).toBe('prob-1');
  });

  it('should filter by solution topic', async () => {
    const result = await useCase.execute({ solutionTopic: 'caching' });

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

  it('should combine filters', async () => {
    const result = await useCase.execute({
      query: 'design',
      difficulty: 'Medium',
      topic: 'caching',
    });

    expect(result.problems).toHaveLength(1);
    expect(result.problems[0].id).toBe('prob-1');
  });

  it('should return empty result when no matches', async () => {
    const result = await useCase.execute({ query: 'nonexistent' });

    expect(result.problems).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe('GetProblemDetailUseCase', () => {
  let repository: FakeProblemRepository;
  let useCase: GetProblemDetailUseCase;

  let author: Author;
  let topic: Topic;
  let tradeoff: Tradeoff;
  let solution: Solution;
  let problem: Problem;

  beforeEach(() => {
    repository = new FakeProblemRepository();
    useCase = new GetProblemDetailUseCase(repository);

    author = Author.create('author-1', 'John Doe');
    topic = Topic.create('Caching');
    tradeoff = Tradeoff.create('Use Redis', 'Fast', 'Complex');
    solution = Solution.create({
      id: 'sol-1',
      name: 'Redis Cache',
      description: 'Use Redis for caching',
      diagram: 'graph TD; A --> B',
      tradeoffs: [tradeoff],
      topics: [topic],
    });

    problem = Problem.create({
      id: 'prob-1',
      title: 'URL Shortener',
      prompt: 'Design bit.ly',
      difficulty: 'Medium',
      status: 'Published',
      solutions: [solution],
      topics: [topic],
      relatedProblems: [],
      author,
    });

    repository.addProblem(problem);
  });

  it('should return problem detail', async () => {
    const result = await useCase.execute({ problemId: 'prob-1' });

    expect(result.id).toBe('prob-1');
    expect(result.title).toBe('URL Shortener');
    expect(result.solutions).toHaveLength(1);
  });

  it('should throw ProblemNotFoundError for unknown problem', async () => {
    await expect(useCase.execute({ problemId: 'unknown' })).rejects.toThrow(ProblemNotFoundError);
  });
});

describe('GetTopicsUseCase', () => {
  let repository: FakeProblemRepository;
  let useCase: GetTopicsUseCase;

  let author: Author;
  let topic1: Topic;
  let topic2: Topic;
  let tradeoff: Tradeoff;
  let solution1: Solution;
  let solution2: Solution;
  let problem1: Problem;
  let problem2: Problem;

  beforeEach(() => {
    repository = new FakeProblemRepository();
    useCase = new GetTopicsUseCase(repository);

    author = Author.create('author-1', 'John Doe');
    topic1 = Topic.create('Caching');
    topic2 = Topic.create('Distributed Systems');
    tradeoff = Tradeoff.create('Use Redis', 'Fast', 'Complex');
    solution1 = Solution.create({
      id: 'sol-1',
      name: 'Redis Cache',
      description: 'Use Redis',
      diagram: 'graph TD; A --> B',
      tradeoffs: [tradeoff],
      topics: [topic1],
    });
    solution2 = Solution.create({
      id: 'sol-2',
      name: 'Memcached',
      description: 'Use Memcached',
      diagram: 'graph TD; A --> C',
      tradeoffs: [tradeoff],
      topics: [topic2],
    });

    problem1 = Problem.create({
      id: 'prob-1',
      title: 'URL Shortener',
      prompt: 'Design bit.ly',
      difficulty: 'Medium',
      status: 'Published',
      solutions: [solution1],
      topics: [topic1, topic2],
      relatedProblems: [],
      author,
    });

    problem2 = Problem.create({
      id: 'prob-2',
      title: 'Rate Limiter',
      prompt: 'Design rate limiter',
      difficulty: 'Hard',
      status: 'Published',
      solutions: [solution2],
      topics: [topic1],
      relatedProblems: [],
      author,
    });

    repository.addProblem(problem1);
    repository.addProblem(problem2);
  });

  it('should return topics with problem counts', async () => {
    const result = await useCase.execute();

    expect(result.topics).toHaveLength(2);
    // Caching appears in 2 problems, Distributed Systems in 1
    expect(result.topics[0].topic.name).toBe('Caching');
    expect(result.topics[0].problemCount).toBe(2);
    expect(result.topics[1].topic.name).toBe('Distributed Systems');
    expect(result.topics[1].problemCount).toBe(1);
  });

  it('should sort by count descending then name ascending', async () => {
    const topic3 = Topic.create('Analytics');
    const solution3 = Solution.create({
      id: 'sol-3',
      name: 'Solution 3',
      description: 'Desc',
      diagram: 'Diag',
      tradeoffs: [tradeoff],
      topics: [topic3],
    });
    const problem3 = Problem.create({
      id: 'prob-3',
      title: 'Analytics',
      prompt: 'Analytics',
      difficulty: 'Easy',
      status: 'Published',
      solutions: [solution3],
      topics: [topic3],
      relatedProblems: [],
      author,
    });
    repository.addProblem(problem3);

    const result = await useCase.execute();

    // Caching: 2, Analytics: 1, Distributed Systems: 1
    // Sorted by count desc, then name asc
    expect(result.topics.map(t => t.topic.name)).toEqual(['Caching', 'Analytics', 'Distributed Systems']);
  });

  it('should return empty array when no problems', async () => {
    const emptyRepo = new FakeProblemRepository();
    const emptyUseCase = new GetTopicsUseCase(emptyRepo);

    const result = await emptyUseCase.execute();

    expect(result.topics).toHaveLength(0);
  });
});