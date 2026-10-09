import { describe, it, expect, beforeEach } from 'vitest';
import { Problem } from '../../../packages/problem-catalog/src/domain/entities/Problem';
import { Solution } from '../../../packages/problem-catalog/src/domain/entities/Solution';
import { Topic } from '../../../packages/problem-catalog/src/domain/entities/Topic';
import { Author } from '../../../packages/problem-catalog/src/domain/entities/Author';
import { Tradeoff } from '../../../packages/problem-catalog/src/domain/value-objects/Tradeoff';
import { ValidationError } from '../../../packages/problem-catalog/src/domain/errors/ValidationError';

describe('Problem Entity', () => {
  let author: Author;
  let topic: Topic;
  let topic2: Topic;
  let tradeoff: Tradeoff;
  let solution: Solution;
  let solution2: Solution;

  beforeEach(() => {
    author = Author.create('author-1', 'John Doe', 'Architect');
    topic = Topic.create('System Design');
    topic2 = Topic.create('Distributed Systems');
    tradeoff = Tradeoff.create('Use Redis', 'Fast', 'Complex');
    solution = Solution.create({
      id: 'sol-1',
      name: 'Redis Cache',
      description: 'Use Redis for caching',
      diagram: 'graph TD; A --> B',
      tradeoffs: [tradeoff],
      topics: [topic],
    });
    solution2 = Solution.create({
      id: 'sol-2',
      name: 'Memcached',
      description: 'Use Memcached for caching',
      diagram: 'graph TD; A --> C',
      tradeoffs: [tradeoff],
      topics: [topic2],
    });
  });

  describe('create', () => {
    it('should create a valid draft problem', () => {
      const problem = Problem.create({
        id: 'prob-1',
        title: 'Design a URL Shortener',
        prompt: 'Design a system like bit.ly',
        difficulty: 'Medium',
        status: 'Draft',
        solutions: [solution],
        topics: [topic],
        relatedProblems: [],
        author,
      });

      expect(problem.id).toBe('prob-1');
      expect(problem.title).toBe('Design a URL Shortener');
      expect(problem.prompt).toBe('Design a system like bit.ly');
      expect(problem.difficulty).toBe('Medium');
      expect(problem.status).toBe('Draft');
      expect(problem.solutions).toHaveLength(1);
      expect(problem.topics).toHaveLength(1);
      expect(problem.relatedProblems).toHaveLength(0);
      expect(problem.author).toBe(author);
      expect(problem.createdAt).toBeInstanceOf(Date);
      expect(problem.updatedAt).toBeInstanceOf(Date);
    });

    it('should trim whitespace from title and prompt', () => {
      const problem = Problem.create({
        id: 'prob-1',
        title: '  Design a URL Shortener  ',
        prompt: '  Design a system like bit.ly  ',
        difficulty: 'Medium',
        status: 'Draft',
        solutions: [solution],
        topics: [topic],
        relatedProblems: [],
        author,
      });

      expect(problem.title).toBe('Design a URL Shortener');
      expect(problem.prompt).toBe('Design a system like bit.ly');
    });

    it('should throw ValidationError for empty title', () => {
      expect(() => Problem.create({
        id: 'id', title: '', prompt: 'prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author
      })).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty prompt', () => {
      expect(() => Problem.create({
        id: 'id', title: 'title', prompt: '', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author
      })).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty id', () => {
      expect(() => Problem.create({
        id: '', title: 'title', prompt: 'prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author
      })).toThrow(ValidationError);
    });

    it('should throw ValidationError when topics array is empty', () => {
      expect(() => Problem.create({
        id: 'id', title: 'title', prompt: 'prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [], relatedProblems: [], author
      })).toThrow(ValidationError);
    });

    it('should throw ValidationError when publishing with no solutions', () => {
      expect(() => Problem.create({
        id: 'id', title: 'title', prompt: 'prompt', difficulty: 'Medium', status: 'Published', solutions: [], topics: [topic], relatedProblems: [], author
      })).toThrow(ValidationError);
    });

    it('should allow Draft problem with no solutions', () => {
      const problem = Problem.create({
        id: 'id', title: 'title', prompt: 'prompt', difficulty: 'Medium', status: 'Draft', solutions: [], topics: [topic], relatedProblems: [], author
      });
      expect(problem.status).toBe('Draft');
      expect(problem.solutions).toHaveLength(0);
    });

    it('should throw ValidationError for invalid difficulty', () => {
      expect(() => Problem.create({
        id: 'id', title: 'title', prompt: 'prompt', difficulty: 'Invalid' as any, status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author
      })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid status', () => {
      expect(() => Problem.create({
        id: 'id', title: 'title', prompt: 'prompt', difficulty: 'Medium', status: 'Invalid' as any, solutions: [solution], topics: [topic], relatedProblems: [], author
      })).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate solutions', () => {
      expect(() => Problem.create({
        id: 'id', title: 'title', prompt: 'prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution, solution], topics: [topic], relatedProblems: [], author
      })).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate topics', () => {
      expect(() => Problem.create({
        id: 'id', title: 'title', prompt: 'prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic, topic], relatedProblems: [], author
      })).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate related problems', () => {
      expect(() => Problem.create({
        id: 'id', title: 'title', prompt: 'prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: ['prob-2', 'prob-2'], author
      })).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing author', () => {
      expect(() => Problem.create({
        id: 'id', title: 'title', prompt: 'prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author: undefined as any
      })).toThrow(ValidationError);
    });

    it('should accept valid difficulties', () => {
      expect(Problem.create({ id: 'id', title: 't', prompt: 'p', difficulty: 'Easy', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author }).difficulty).toBe('Easy');
      expect(Problem.create({ id: 'id', title: 't', prompt: 'p', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author }).difficulty).toBe('Medium');
      expect(Problem.create({ id: 'id', title: 't', prompt: 'p', difficulty: 'Hard', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author }).difficulty).toBe('Hard');
    });

    it('should accept valid statuses', () => {
      expect(Problem.create({ id: 'id', title: 't', prompt: 'p', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author }).status).toBe('Draft');
      expect(Problem.create({ id: 'id', title: 't', prompt: 'p', difficulty: 'Medium', status: 'Published', solutions: [solution], topics: [topic], relatedProblems: [], author }).status).toBe('Published');
      expect(Problem.create({ id: 'id', title: 't', prompt: 'p', difficulty: 'Medium', status: 'Archived', solutions: [solution], topics: [topic], relatedProblems: [], author }).status).toBe('Archived');
    });
  });

  describe('equals', () => {
    it('should return true for problems with same id', () => {
      const p1 = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const p2 = Problem.create({ id: 'prob-1', title: 'Different', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      expect(p1.equals(p2)).toBe(true);
    });

    it('should return false for problems with different ids', () => {
      const p1 = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const p2 = Problem.create({ id: 'prob-2', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      expect(p1.equals(p2)).toBe(false);
    });
  });

  describe('publish', () => {
    it('should publish a draft problem with solutions', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const published = problem.publish();

      expect(published.status).toBe('Published');
      expect(published.updatedAt).not.toBe(problem.updatedAt);
      expect(problem.status).toBe('Draft');
    });

    it('should return same problem if already published', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Published', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const published = problem.publish();
      expect(published).toBe(problem);
    });

    it('should throw ValidationError when publishing problem with no solutions', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [], topics: [topic], relatedProblems: [], author });
      expect(() => problem.publish()).toThrow(ValidationError);
    });
  });

  describe('archive', () => {
    it('should archive a published problem', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Published', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const archived = problem.archive();

      expect(archived.status).toBe('Archived');
      expect(archived.updatedAt).not.toBe(problem.updatedAt);
    });

    it('should archive a draft problem', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const archived = problem.archive();
      expect(archived.status).toBe('Archived');
    });

    it('should return same problem if already archived', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Archived', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const archived = problem.archive();
      expect(archived).toBe(problem);
    });
  });

  describe('addSolution', () => {
    it('should add a solution to problem', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const updated = problem.addSolution(solution2);

      expect(updated.solutions).toHaveLength(2);
      expect(updated.updatedAt).not.toBe(problem.updatedAt);
      expect(problem.solutions).toHaveLength(1);
    });

    it('should throw ValidationError for duplicate solution', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      expect(() => problem.addSolution(solution)).toThrow(ValidationError);
    });
  });

  describe('addTopic', () => {
    it('should add a topic to problem', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const updated = problem.addTopic(topic2);

      expect(updated.topics).toHaveLength(2);
      expect(updated.updatedAt).not.toBe(problem.updatedAt);
    });

    it('should throw ValidationError for duplicate topic', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      expect(() => problem.addTopic(topic)).toThrow(ValidationError);
    });
  });

  describe('addRelatedProblem', () => {
    it('should add a related problem', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const updated = problem.addRelatedProblem('prob-2');

      expect(updated.relatedProblems).toHaveLength(1);
      expect(updated.relatedProblems[0]).toBe('prob-2');
      expect(updated.updatedAt).not.toBe(problem.updatedAt);
    });

    it('should throw ValidationError when relating to self', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      expect(() => problem.addRelatedProblem('prob-1')).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate related problem', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: ['prob-2'], author });
      expect(() => problem.addRelatedProblem('prob-2')).toThrow(ValidationError);
    });
  });

  describe('updateTitle', () => {
    it('should update problem title', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const updated = problem.updateTitle('New Title');

      expect(updated.title).toBe('New Title');
      expect(updated.updatedAt).not.toBe(problem.updatedAt);
    });

    it('should throw ValidationError for empty title', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      expect(() => problem.updateTitle('')).toThrow(ValidationError);
    });

    it('should return same problem if title unchanged', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const updated = problem.updateTitle('Title');
      expect(updated).toBe(problem);
    });
  });

  describe('updatePrompt', () => {
    it('should update problem prompt', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const updated = problem.updatePrompt('New Prompt');

      expect(updated.prompt).toBe('New Prompt');
      expect(updated.updatedAt).not.toBe(problem.updatedAt);
    });

    it('should throw ValidationError for empty prompt', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      expect(() => problem.updatePrompt('')).toThrow(ValidationError);
    });

    it('should return same problem if prompt unchanged', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const updated = problem.updatePrompt('Prompt');
      expect(updated).toBe(problem);
    });
  });

  describe('updateDifficulty', () => {
    it('should update problem difficulty', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const updated = problem.updateDifficulty('Hard');

      expect(updated.difficulty).toBe('Hard');
      expect(updated.updatedAt).not.toBe(problem.updatedAt);
    });

    it('should throw ValidationError for invalid difficulty', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      expect(() => problem.updateDifficulty('Invalid' as any)).toThrow(ValidationError);
    });

    it('should return same problem if difficulty unchanged', () => {
      const problem = Problem.create({ id: 'prob-1', title: 'Title', prompt: 'Prompt', difficulty: 'Medium', status: 'Draft', solutions: [solution], topics: [topic], relatedProblems: [], author });
      const updated = problem.updateDifficulty('Medium');
      expect(updated).toBe(problem);
    });
  });
});