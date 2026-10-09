import { describe, it, expect, beforeEach } from 'vitest';
import { FakeProblemCatalogRepository } from '../ports/fake-problem-catalog-repository';
import { GetProblemDetailUseCase } from './get-problem-detail';
import { createProblem } from '../../domain/entities/problem';
import { createSolution } from '../../domain/entities/solution';
import { createTopic } from '../../domain/entities/topic';
import { createAuthor } from '../../domain/entities/author';
import { createTradeoff } from '../../domain/value-objects/tradeoff';
import { ProblemNotFoundError } from '../../domain/errors';

describe('GetProblemDetailUseCase', () => {
  let repository: FakeProblemCatalogRepository;
  let useCase: GetProblemDetailUseCase;

  let author: ReturnType<typeof createAuthor>;
  let topic: ReturnType<typeof createTopic>;
  let tradeoff: ReturnType<typeof createTradeoff>;
  let solution: ReturnType<typeof createSolution>;
  let problem: ReturnType<typeof createProblem>;

  beforeEach(() => {
    repository = new FakeProblemCatalogRepository();
    useCase = new GetProblemDetailUseCase(repository);

    author = createAuthor('author-1', 'John Doe', 'Architect');
    topic = createTopic('System Design');
    tradeoff = createTradeoff('Use Redis', 'Fast', 'Complex');
    solution = createSolution('sol-1', 'Redis Cache', 'Use Redis for caching', 'graph TD; A --> B', [tradeoff], [topic]);

    problem = createProblem(
      'prob-1',
      'Design a URL Shortener',
      'Design a system like bit.ly',
      'Medium',
      'Published',
      [solution],
      [topic],
      ['prob-2'],
      author
    );

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

      // Verify solution
      expect(result.solutions[0].id).toBe('sol-1');
      expect(result.solutions[0].name).toBe('Redis Cache');
      expect(result.solutions[0].tradeoffs).toHaveLength(1);
      expect(result.solutions[0].tradeoffs[0].decision).toBe('Use Redis');

      // Verify topic
      expect(result.topics[0].name).toBe('System Design');
      expect(result.topics[0].slug).toBe('system-design');

      // Verify author
      expect(result.author.name).toBe('John Doe');
      expect(result.author.bio).toBe('Architect');
    });
  });
});