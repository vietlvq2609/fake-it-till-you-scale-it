import { describe, it, expect, beforeEach } from 'vitest';
import { ProblemCatalogService } from '../../../src/domain/services/ProblemCatalogService';
import { Problem } from '../../../src/domain/entities/Problem';
import { Solution } from '../../../src/domain/entities/Solution';
import { Topic } from '../../../src/domain/entities/Topic';
import { Author } from '../../../src/domain/entities/Author';
import { Tradeoff } from '../../../src/domain/value-objects/Tradeoff';
import { IProblemRepository } from '../../../src/domain/repositories/IProblemRepository';
import { ITopicRepository } from '../../../src/domain/repositories/ITopicRepository';
import { TopicNotFoundError, ProblemNotFoundError, SolutionNotFoundError } from '../../../src/domain/errors';

// Fake in-memory repository implementations
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

  // Test helper
  addProblem(problem: Problem) {
    this.problems.set(problem.id, problem);
  }
}

class FakeTopicRepository implements ITopicRepository {
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

  // Test helper
  addTopic(topic: Topic) {
    this.topics.set(topic.slug, topic);
  }
}

describe('ProblemCatalogService', () => {
  let problemRepo: FakeProblemRepository;
  let topicRepo: FakeTopicRepository;
  let service: ProblemCatalogService;

  let author: Author;
  let topic1: Topic;
  let topic2: Topic;
  let tradeoff: Tradeoff;
  let solution1: Solution;
  let solution2: Solution;
  let problem1: Problem;
  let problem2: Problem;

  beforeEach(() => {
    problemRepo = new FakeProblemRepository();
    topicRepo = new FakeTopicRepository();
    service = new ProblemCatalogService(problemRepo, topicRepo);

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
      topics: [topic1],
      relatedProblems: ['prob-2'],
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
      relatedProblems: ['prob-1'],
      author,
    });

    problemRepo.addProblem(problem1);
    problemRepo.addProblem(problem2);
    topicRepo.addTopic(topic1);
    topicRepo.addTopic(topic2);
  });

  describe('findProblemsBySolutionPattern', () => {
    it('should find problems with solution matching pattern in name', async () => {
      const results = await service.findProblemsBySolutionPattern('redis');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-1');
    });

    it('should find problems with solution matching pattern in description', async () => {
      const results = await service.findProblemsBySolutionPattern('memcached');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });

    it('should find problems with solution matching pattern in diagram', async () => {
      const results = await service.findProblemsBySolutionPattern('graph');

      expect(results).toHaveLength(2);
    });

    it('should return empty array when no matches', async () => {
      const results = await service.findProblemsBySolutionPattern('nonexistent');

      expect(results).toHaveLength(0);
    });
  });

  describe('findProblemsByTopic', () => {
    it('should find problems tagged with topic', async () => {
      const results = await service.findProblemsByTopic('caching');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-1');
    });

    it('should throw TopicNotFoundError for unknown topic', async () => {
      await expect(service.findProblemsByTopic('unknown')).rejects.toThrow(TopicNotFoundError);
    });
  });

  describe('findProblemsByDifficulty', () => {
    it('should find problems by difficulty', async () => {
      const results = await service.findProblemsByDifficulty('Medium');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-1');
    });

    it('should return empty array when no problems at difficulty', async () => {
      const results = await service.findProblemsByDifficulty('Easy');

      expect(results).toHaveLength(0);
    });
  });

  describe('getAllTopics', () => {
    it('should return all topics', async () => {
      const results = await service.getAllTopics();

      expect(results).toHaveLength(2);
    });
  });

  describe('findRelatedProblems', () => {
    it('should find related problems', async () => {
      const results = await service.findRelatedProblems('prob-1');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });

    it('should throw ProblemNotFoundError for unknown problem', async () => {
      await expect(service.findRelatedProblems('unknown')).rejects.toThrow(ProblemNotFoundError);
    });

    it('should return empty array when no related problems', async () => {
      const problem3 = Problem.create({
        id: 'prob-3',
        title: 'Isolated',
        prompt: 'No relations',
        difficulty: 'Easy',
        status: 'Published',
        solutions: [solution1],
        topics: [topic1],
        relatedProblems: [],
        author,
      });
      problemRepo.addProblem(problem3);

      const results = await service.findRelatedProblems('prob-3');

      expect(results).toHaveLength(0);
    });
  });

  describe('findProblemById', () => {
    it('should find problem by id', async () => {
      const result = await service.findProblemById('prob-1');

      expect(result.id).toBe('prob-1');
    });

    it('should throw ProblemNotFoundError for unknown problem', async () => {
      await expect(service.findProblemById('unknown')).rejects.toThrow(ProblemNotFoundError);
    });
  });

  describe('findSolutionById', () => {
    it('should find solution by id across all problems', async () => {
      const result = await service.findSolutionById('sol-1');

      expect(result.id).toBe('sol-1');
    });

    it('should throw SolutionNotFoundError for unknown solution', async () => {
      await expect(service.findSolutionById('unknown')).rejects.toThrow(SolutionNotFoundError);
    });
  });

  describe('getPublishedProblems', () => {
    it('should return only published problems', async () => {
      const draftProblem = Problem.create({
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
      problemRepo.addProblem(draftProblem);

      const results = await service.getPublishedProblems();

      expect(results).toHaveLength(2);
      expect(results.every(p => p.status === 'Published')).toBe(true);
    });
  });

  describe('getProblemsByAuthor', () => {
    it('should return problems by author', async () => {
      const author2 = Author.create('author-2', 'Jane Doe');
      const problem3 = Problem.create({
        id: 'prob-3',
        title: 'Another Problem',
        prompt: 'Another',
        difficulty: 'Easy',
        status: 'Published',
        solutions: [solution1],
        topics: [topic1],
        relatedProblems: [],
        author: author2,
      });
      problemRepo.addProblem(problem3);

      const results = await service.getProblemsByAuthor('author-1');

      expect(results).toHaveLength(2);
      expect(results.every(p => p.author.id === 'author-1')).toBe(true);
    });
  });

  describe('searchProblems', () => {
    it('should search problems by title', async () => {
      const results = await service.searchProblems('url');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-1');
    });

    it('should search problems by prompt', async () => {
      const results = await service.searchProblems('rate');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });

    it('should return empty array when no matches', async () => {
      const results = await service.searchProblems('nonexistent');

      expect(results).toHaveLength(0);
    });
  });
});