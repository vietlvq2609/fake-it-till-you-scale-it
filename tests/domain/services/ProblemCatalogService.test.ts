import { describe, it, expect, beforeEach } from 'vitest';
import { ProblemCatalogService } from '../../../packages/problem-catalog/src/domain/services/ProblemCatalogService';
import { Problem, Difficulty, ProblemStatus } from '../../../packages/problem-catalog/src/domain/entities/Problem';
import { Solution } from '../../../packages/problem-catalog/src/domain/entities/Solution';
import { Topic } from '../../../packages/problem-catalog/src/domain/entities/Topic';
import { Author } from '../../../packages/problem-catalog/src/domain/entities/Author';
import { ProblemNotFoundError, SolutionNotFoundError, TopicNotFoundError } from '../../../packages/problem-catalog/src/domain/errors';
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

describe('ProblemCatalogService', () => {
  let problemRepo: InMemoryProblemRepository;
  let topicRepo: InMemoryTopicRepository;
  let service: ProblemCatalogService;

  let author: Author;
  let topic1: Topic;
  let topic2: Topic;
  let solution1: Solution;
  let solution2: Solution;
  let problem1: Problem;
  let problem2: Problem;
  let problem3: Problem;

  beforeEach(() => {
    problemRepo = new InMemoryProblemRepository();
    topicRepo = new InMemoryTopicRepository();
    service = new ProblemCatalogService(problemRepo, topicRepo);

    author = Author.create('author-1', 'John Doe', 'Architect');
    topic1 = Topic.create('System Design');
    topic2 = Topic.create('Distributed Systems');
    solution1 = Solution.create({
      id: 'sol-1',
      name: 'Redis Cache',
      description: 'Use Redis for caching',
      diagram: 'graph TD; A --> B',
      tradeoffs: [{ decision: 'Use Redis', advantage: 'Fast', disadvantage: 'Complex' }],
      topics: [topic1],
    });
    solution2 = Solution.create({
      id: 'sol-2',
      name: 'Memcached',
      description: 'Use Memcached for caching',
      diagram: 'graph TD; A --> C',
      tradeoffs: [{ decision: 'Use Memcached', advantage: 'Simple', disadvantage: 'Less features' }],
      topics: [topic1],
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

    problemRepo.addProblem(problem1);
    problemRepo.addProblem(problem2);
    problemRepo.addProblem(problem3);
    topicRepo.saveSync(topic1);
    topicRepo.saveSync(topic2);
  });

  describe('findProblemsBySolutionPattern', () => {
    it('should find problems with solution name matching pattern', async () => {
      const results = await service.findProblemsBySolutionPattern('redis');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-1');
    });

    it('should find problems with solution description matching pattern', async () => {
      const results = await service.findProblemsBySolutionPattern('memcached');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });

    it('should find problems with solution diagram matching pattern', async () => {
      const results = await service.findProblemsBySolutionPattern('graph TD');
      expect(results).toHaveLength(2);
    });

    it('should be case insensitive', async () => {
      const results = await service.findProblemsBySolutionPattern('REDIS');
      expect(results).toHaveLength(1);
    });

    it('should return empty array when no matches', async () => {
      const results = await service.findProblemsBySolutionPattern('nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('findProblemsByTopic', () => {
    it('should find problems by topic slug', async () => {
      const results = await service.findProblemsByTopic('system-design');
      expect(results).toHaveLength(2);
      expect(results.map(p => p.id).sort()).toEqual(['prob-1', 'prob-2']);
    });

    it('should find problems by second topic', async () => {
      const results = await service.findProblemsByTopic('distributed-systems');
      expect(results).toHaveLength(2);
      expect(results.map(p => p.id).sort()).toEqual(['prob-2', 'prob-3']);
    });

    it('should throw TopicNotFoundError for unknown topic', async () => {
      await expect(service.findProblemsByTopic('unknown-topic')).rejects.toThrow(TopicNotFoundError);
    });

    it('should return empty array when topic exists but no problems', async () => {
      const emptyTopic = Topic.create('Empty');
      topicRepo.saveSync(emptyTopic);
      const results = await service.findProblemsByTopic('empty');
      expect(results).toHaveLength(0);
    });
  });

  describe('findProblemsByDifficulty', () => {
    it('should find problems by Easy difficulty', async () => {
      const results = await service.findProblemsByDifficulty('Easy');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-3');
    });

    it('should find problems by Medium difficulty', async () => {
      const results = await service.findProblemsByDifficulty('Medium');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-1');
    });

    it('should find problems by Hard difficulty', async () => {
      const results = await service.findProblemsByDifficulty('Hard');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });
  });

  describe('getAllTopics', () => {
    it('should return all topics', async () => {
      const topics = await service.getAllTopics();
      expect(topics).toHaveLength(2);
      expect(topics.map(t => t.slug).sort()).toEqual(['distributed-systems', 'system-design']);
    });
  });

  describe('findRelatedProblems', () => {
    it('should find related problems for prob-1', async () => {
      const results = await service.findRelatedProblems('prob-1');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });

    it('should find related problems for prob-2', async () => {
      const results = await service.findRelatedProblems('prob-2');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-1');
    });

    it('should return empty array for problem with no related problems', async () => {
      const results = await service.findRelatedProblems('prob-3');
      expect(results).toHaveLength(0);
    });

    it('should throw ProblemNotFoundError for unknown problem', async () => {
      await expect(service.findRelatedProblems('unknown')).rejects.toThrow(ProblemNotFoundError);
    });

    it('should ignore related problem IDs that do not exist', async () => {
      const problemWithBadRef = Problem.create({
        ...problem1,
        relatedProblems: ['prob-2', 'nonexistent'],
      });
      problemRepo.addProblem(problemWithBadRef);

      const results = await service.findRelatedProblems('prob-1');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });
  });

  describe('findProblemById', () => {
    it('should return problem by id', async () => {
      const problem = await service.findProblemById('prob-1');
      expect(problem.id).toBe('prob-1');
    });

    it('should throw ProblemNotFoundError for unknown id', async () => {
      await expect(service.findProblemById('unknown')).rejects.toThrow(ProblemNotFoundError);
    });
  });

  describe('findSolutionById', () => {
    it('should find solution by id across all problems', async () => {
      const solution = await service.findSolutionById('sol-1');
      expect(solution.id).toBe('sol-1');
      expect(solution.name).toBe('Redis Cache');
    });

    it('should find second solution', async () => {
      const solution = await service.findSolutionById('sol-2');
      expect(solution.id).toBe('sol-2');
    });

    it('should throw SolutionNotFoundError for unknown solution', async () => {
      await expect(service.findSolutionById('unknown')).rejects.toThrow(SolutionNotFoundError);
    });
  });

  describe('getPublishedProblems', () => {
    it('should return only published problems', async () => {
      const results = await service.getPublishedProblems();
      expect(results).toHaveLength(2);
      expect(results.map(p => p.id).sort()).toEqual(['prob-1', 'prob-2']);
    });
  });

  describe('getProblemsByAuthor', () => {
    it('should return problems by author id', async () => {
      const results = await service.getProblemsByAuthor('author-1');
      expect(results).toHaveLength(3);
    });

    it('should return empty array for unknown author', async () => {
      const results = await service.getProblemsByAuthor('unknown');
      expect(results).toHaveLength(0);
    });
  });

  describe('searchProblems', () => {
    it('should search by title', async () => {
      const results = await service.searchProblems('url shortener');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-1');
    });

    it('should search by prompt', async () => {
      const results = await service.searchProblems('rate limiting');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });

    it('should be case insensitive', async () => {
      const results = await service.searchProblems('URL SHORTENER');
      expect(results).toHaveLength(1);
    });

    it('should return multiple matches', async () => {
      const results = await service.searchProblems('design');
      expect(results).toHaveLength(3);
    });

    it('should return empty array for no matches', async () => {
      const results = await service.searchProblems('nonexistent');
      expect(results).toHaveLength(0);
    });
  });
});