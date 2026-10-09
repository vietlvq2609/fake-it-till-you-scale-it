import { describe, it, expect, beforeEach } from 'vitest';
import { ProblemCatalogService } from '../services/problem-catalog-service';
import { Problem, Difficulty, ProblemStatus } from '../entities/problem';
import { Solution } from '../entities/solution';
import { Topic } from '../entities/topic';
import { Author } from '../entities/author';
import { ProblemNotFoundError, SolutionNotFoundError, TopicNotFoundError } from '../errors';

// In-memory test repository implementations
class InMemoryProblemRepository {
  private problems: Map<string, Problem> = new Map();

  findById(id: string): Problem | undefined {
    return this.problems.get(id);
  }

  findAll(): Problem[] {
    return Array.from(this.problems.values());
  }

  save(problem: Problem): void {
    this.problems.set(problem.id, problem);
  }

  delete(id: string): void {
    this.problems.delete(id);
  }

  clear(): void {
    this.problems.clear();
  }
}

class InMemoryTopicRepository {
  private topics: Map<string, Topic> = new Map();

  findBySlug(slug: string): Topic | undefined {
    return this.topics.get(slug);
  }

  findAll(): Topic[] {
    return Array.from(this.topics.values());
  }

  save(topic: Topic): void {
    this.topics.set(topic.slug, topic);
  }

  delete(slug: string): void {
    this.topics.delete(slug);
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

    // Create test data
    author = { id: 'author-1', name: 'John Doe', bio: 'Architect' } as Author;
    topic1 = { name: 'System Design', slug: 'system-design' } as Topic;
    topic2 = { name: 'Distributed Systems', slug: 'distributed-systems' } as Topic;
    solution1 = {
      id: 'sol-1',
      name: 'Redis Cache',
      description: 'Use Redis for caching',
      diagram: 'graph TD; A --> B',
      tradeoffs: [{ decision: 'Use Redis', advantage: 'Fast', disadvantage: 'Complex' }],
      topics: [topic1],
    } as Solution;
    solution2 = {
      id: 'sol-2',
      name: 'Memcached',
      description: 'Use Memcached for caching',
      diagram: 'graph TD; A --> C',
      tradeoffs: [{ decision: 'Use Memcached', advantage: 'Simple', disadvantage: 'Less features' }],
      topics: [topic1],
    } as Solution;

    problem1 = {
      id: 'prob-1',
      title: 'Design a URL Shortener',
      prompt: 'Design a system like bit.ly',
      difficulty: 'Medium' as Difficulty,
      status: 'Published' as ProblemStatus,
      solutions: [solution1],
      topics: [topic1],
      relatedProblems: ['prob-2'],
      author,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    } as Problem;

    problem2 = {
      id: 'prob-2',
      title: 'Design a Rate Limiter',
      prompt: 'Design a rate limiting system',
      difficulty: 'Hard' as Difficulty,
      status: 'Published' as ProblemStatus,
      solutions: [solution2],
      topics: [topic1, topic2],
      relatedProblems: ['prob-1'],
      author,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    } as Problem;

    problem3 = {
      id: 'prob-3',
      title: 'Design a Cache',
      prompt: 'Design a distributed cache',
      difficulty: 'Easy' as Difficulty,
      status: 'Draft' as ProblemStatus,
      solutions: [],
      topics: [topic2],
      relatedProblems: [],
      author,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    } as Problem;

    // Save to repos
    topicRepo.save(topic1);
    topicRepo.save(topic2);
    problemRepo.save(problem1);
    problemRepo.save(problem2);
    problemRepo.save(problem3);
  });

  describe('findProblemsBySolutionPattern', () => {
    it('should find problems with solution name matching pattern', () => {
      const results = service.findProblemsBySolutionPattern('redis');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-1');
    });

    it('should find problems with solution description matching pattern', () => {
      const results = service.findProblemsBySolutionPattern('memcached');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });

    it('should find problems with solution diagram matching pattern', () => {
      const results = service.findProblemsBySolutionPattern('graph TD');
      expect(results).toHaveLength(2);
    });

    it('should be case insensitive', () => {
      const results = service.findProblemsBySolutionPattern('REDIS');
      expect(results).toHaveLength(1);
    });

    it('should return empty array when no matches', () => {
      const results = service.findProblemsBySolutionPattern('nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('findProblemsByTopic', () => {
    it('should find problems by topic slug', () => {
      const results = service.findProblemsByTopic('system-design');
      expect(results).toHaveLength(2);
      expect(results.map(p => p.id).sort()).toEqual(['prob-1', 'prob-2']);
    });

    it('should find problems by second topic', () => {
      const results = service.findProblemsByTopic('distributed-systems');
      expect(results).toHaveLength(2);
      expect(results.map(p => p.id).sort()).toEqual(['prob-2', 'prob-3']);
    });

    it('should throw TopicNotFoundError for unknown topic', () => {
      expect(() => service.findProblemsByTopic('unknown-topic')).toThrow(TopicNotFoundError);
    });

    it('should return empty array when topic exists but no problems', () => {
      const emptyTopic = { name: 'Empty', slug: 'empty' } as Topic;
      topicRepo.save(emptyTopic);
      const results = service.findProblemsByTopic('empty');
      expect(results).toHaveLength(0);
    });
  });

  describe('findProblemsByDifficulty', () => {
    it('should find problems by Easy difficulty', () => {
      const results = service.findProblemsByDifficulty('Easy');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-3');
    });

    it('should find problems by Medium difficulty', () => {
      const results = service.findProblemsByDifficulty('Medium');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-1');
    });

    it('should find problems by Hard difficulty', () => {
      const results = service.findProblemsByDifficulty('Hard');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });
  });

  describe('getAllTopics', () => {
    it('should return all topics', () => {
      const topics = service.getAllTopics();
      expect(topics).toHaveLength(2);
      expect(topics.map(t => t.slug).sort()).toEqual(['distributed-systems', 'system-design']);
    });
  });

  describe('findRelatedProblems', () => {
    it('should find related problems for prob-1', () => {
      const results = service.findRelatedProblems('prob-1');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });

    it('should find related problems for prob-2', () => {
      const results = service.findRelatedProblems('prob-2');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-1');
    });

    it('should return empty array for problem with no related problems', () => {
      const results = service.findRelatedProblems('prob-3');
      expect(results).toHaveLength(0);
    });

    it('should throw ProblemNotFoundError for unknown problem', () => {
      expect(() => service.findRelatedProblems('unknown')).toThrow(ProblemNotFoundError);
    });

    it('should ignore related problem IDs that do not exist', () => {
      const problemWithBadRef = {
        ...problem1,
        relatedProblems: ['prob-2', 'nonexistent'],
      };
      problemRepo.save(problemWithBadRef);

      const results = service.findRelatedProblems('prob-1');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });
  });

  describe('findProblemById', () => {
    it('should return problem by id', () => {
      const problem = service.findProblemById('prob-1');
      expect(problem.id).toBe('prob-1');
    });

    it('should throw ProblemNotFoundError for unknown id', () => {
      expect(() => service.findProblemById('unknown')).toThrow(ProblemNotFoundError);
    });
  });

  describe('findSolutionById', () => {
    it('should find solution by id across all problems', () => {
      const solution = service.findSolutionById('sol-1');
      expect(solution.id).toBe('sol-1');
      expect(solution.name).toBe('Redis Cache');
    });

    it('should find second solution', () => {
      const solution = service.findSolutionById('sol-2');
      expect(solution.id).toBe('sol-2');
    });

    it('should throw SolutionNotFoundError for unknown solution', () => {
      expect(() => service.findSolutionById('unknown')).toThrow(SolutionNotFoundError);
    });
  });

  describe('getPublishedProblems', () => {
    it('should return only published problems', () => {
      const results = service.getPublishedProblems();
      expect(results).toHaveLength(2);
      expect(results.map(p => p.id).sort()).toEqual(['prob-1', 'prob-2']);
    });
  });

  describe('getProblemsByAuthor', () => {
    it('should return problems by author id', () => {
      const results = service.getProblemsByAuthor('author-1');
      expect(results).toHaveLength(3);
    });

    it('should return empty array for unknown author', () => {
      const results = service.getProblemsByAuthor('unknown');
      expect(results).toHaveLength(0);
    });
  });

  describe('searchProblems', () => {
    it('should search by title', () => {
      const results = service.searchProblems('url shortener');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-1');
    });

    it('should search by prompt', () => {
      const results = service.searchProblems('rate limiting');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('prob-2');
    });

    it('should be case insensitive', () => {
      const results = service.searchProblems('URL SHORTENER');
      expect(results).toHaveLength(1);
    });

    it('should return multiple matches', () => {
      const results = service.searchProblems('design');
      expect(results).toHaveLength(3);
    });

    it('should return empty array for no matches', () => {
      const results = service.searchProblems('nonexistent');
      expect(results).toHaveLength(0);
    });
  });
});