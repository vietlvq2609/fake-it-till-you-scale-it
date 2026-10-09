import { describe, it, expect, beforeEach } from 'vitest';
import { GetProblemDetailUseCase } from '../../../packages/problem-catalog/src/application/use-cases/GetProblemDetailUseCase';
import { Problem } from '../../../packages/problem-catalog/src/domain/entities/Problem';
import { Solution } from '../../../packages/problem-catalog/src/domain/entities/Solution';
import { Topic } from '../../../packages/problem-catalog/src/domain/entities/Topic';
import { Author } from '../../../packages/problem-catalog/src/domain/entities/Author';
import { Tradeoff } from '../../../packages/problem-catalog/src/domain/value-objects/Tradeoff';
import { ProblemNotFoundError } from '../../../packages/problem-catalog/src/domain/errors';
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

describe('GetProblemDetailUseCase', () => {
  let repository: InMemoryProblemRepository;
  let useCase: GetProblemDetailUseCase;

  let author: Author;
  let topic: Topic;
  let tradeoff: Tradeoff;
  let solution: Solution;
  let problem: Problem;

  beforeEach(() => {
    repository = new InMemoryProblemRepository();
    useCase = new GetProblemDetailUseCase(repository);

    author = Author.create('author-1', 'John Doe', 'Architect');
    topic = Topic.create('System Design');
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
      title: 'Design a URL Shortener',
      prompt: 'Design a system like bit.ly',
      difficulty: 'Medium',
      status: 'Published',
      solutions: [solution],
      topics: [topic],
      relatedProblems: ['prob-2'],
      author,
    });

    repository.addProblem(problem);
  });

  describe('execute', () => {
    it('should return the problem when it exists', async () => {
      const result = await useCase.execute({ problemId: 'prob-1' });

      expect(result.id).toBe('prob-1');
      expect(result.title).toBe('Design a URL Shortener');
      expect(result.prompt).toBe('Design a system like bit.ly');
      expect(result.difficulty).toBe('Medium');
      expect(result.status).toBe('Published');
      expect(result.solutions).toHaveLength(1);
      expect(result.topics).toHaveLength(1);
      expect(result.relatedProblems).toEqual(['prob-2']);
      expect(result.author.id).toBe('author-1');
    });

    it('should throw ProblemNotFoundError when problem does not exist', async () => {
      await expect(useCase.execute({ problemId: 'nonexistent' })).rejects.toThrow(ProblemNotFoundError);
    });

    it('should throw ProblemNotFoundError with correct problemId', async () => {
      try {
        await useCase.execute({ problemId: 'missing-id' });
      } catch (error) {
        expect(error).toBeInstanceOf(ProblemNotFoundError);
        expect((error as ProblemNotFoundError).problemId).toBe('missing-id');
      }
    });

    it('should return problem with all nested entities', async () => {
      const result = await useCase.execute({ problemId: 'prob-1' });

      expect(result.solutions[0].id).toBe('sol-1');
      expect(result.solutions[0].name).toBe('Redis Cache');
      expect(result.solutions[0].tradeoffs).toHaveLength(1);
      expect(result.solutions[0].tradeoffs[0].decision).toBe('Use Redis');

      expect(result.topics[0].name).toBe('System Design');
      expect(result.topics[0].slug).toBe('system-design');

      expect(result.author.name).toBe('John Doe');
      expect(result.author.bio).toBe('Architect');
    });
  });
});