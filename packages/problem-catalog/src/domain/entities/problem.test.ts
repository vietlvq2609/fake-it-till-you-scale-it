import { describe, it, expect, beforeEach } from 'vitest';
import {
  createProblem,
  problemEquals,
  publishProblem,
  archiveProblem,
  addSolutionToProblem,
  addTopicToProblem,
  addRelatedProblem,
  updateProblemTitle,
  updateProblemPrompt,
  updateProblemDifficulty,
  Problem,
  Difficulty,
  ProblemStatus,
} from '../entities/problem';
import { createSolution } from '../entities/solution';
import { createTopic } from '../entities/topic';
import { createAuthor } from '../entities/author';
import { createTradeoff } from '../value-objects/tradeoff';
import { ValidationError, EmptySolutionError } from '../errors';

describe('Problem Entity', () => {
  let author: ReturnType<typeof createAuthor>;
  let topic: ReturnType<typeof createTopic>;
  let topic2: ReturnType<typeof createTopic>;
  let tradeoff: ReturnType<typeof createTradeoff>;
  let solution: ReturnType<typeof createSolution>;
  let solution2: ReturnType<typeof createSolution>;

  beforeEach(() => {
    author = createAuthor('author-1', 'John Doe', 'Architect');
    topic = createTopic('System Design');
    topic2 = createTopic('Distributed Systems');
    tradeoff = createTradeoff('Use Redis', 'Fast', 'Complex');
    solution = createSolution('sol-1', 'Redis Cache', 'Use Redis', 'graph TD; A --> B', [tradeoff], [topic]);
    solution2 = createSolution('sol-2', 'Memcached', 'Use Memcached', 'graph TD; A --> C', [tradeoff], [topic2]);
  });

  describe('createProblem', () => {
    it('should create a valid draft problem with all required fields', () => {
      const problem = createProblem(
        'prob-1',
        'Design a URL Shortener',
        'Design a system like bit.ly',
        'Medium',
        'Draft',
        [solution],
        [topic],
        [],
        author
      );

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
      const problem = createProblem(
        'prob-1',
        '  Design a URL Shortener  ',
        '  Design a system like bit.ly  ',
        'Medium',
        'Draft',
        [solution],
        [topic],
        [],
        author
      );

      expect(problem.title).toBe('Design a URL Shortener');
      expect(problem.prompt).toBe('Design a system like bit.ly');
    });

    it('should throw ValidationError for empty title', () => {
      expect(() => createProblem('id', '', 'prompt', 'Medium', 'Draft', [solution], [topic], [], author)).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty prompt', () => {
      expect(() => createProblem('id', 'title', '', 'Medium', 'Draft', [solution], [topic], [], author)).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty id', () => {
      expect(() => createProblem('', 'title', 'prompt', 'Medium', 'Draft', [solution], [topic], [], author)).toThrow(ValidationError);
    });

    it('should throw ValidationError when topics array is empty', () => {
      expect(() => createProblem('id', 'title', 'prompt', 'Medium', 'Draft', [solution], [], [], author)).toThrow(ValidationError);
    });

    it('should throw EmptySolutionError when publishing with no solutions', () => {
      expect(() => createProblem('id', 'title', 'prompt', 'Medium', 'Published', [], [topic], [], author)).toThrow(EmptySolutionError);
    });

    it('should allow Draft problem with no solutions', () => {
      const problem = createProblem('id', 'title', 'prompt', 'Medium', 'Draft', [], [topic], [], author);
      expect(problem.status).toBe('Draft');
      expect(problem.solutions).toHaveLength(0);
    });

    it('should throw ValidationError for invalid difficulty', () => {
      expect(() => createProblem('id', 'title', 'prompt', 'Invalid' as Difficulty, 'Draft', [solution], [topic], [], author)).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid status', () => {
      expect(() => createProblem('id', 'title', 'prompt', 'Medium', 'Invalid' as ProblemStatus, [solution], [topic], [], author)).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate solutions', () => {
      expect(() => createProblem('id', 'title', 'prompt', 'Medium', 'Draft', [solution, solution], [topic], [], author)).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate topics', () => {
      expect(() => createProblem('id', 'title', 'prompt', 'Medium', 'Draft', [solution], [topic, topic], [], author)).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate related problems', () => {
      expect(() => createProblem('id', 'title', 'prompt', 'Medium', 'Draft', [solution], [topic], ['prob-2', 'prob-2'], author)).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing author', () => {
      expect(() => createProblem('id', 'title', 'prompt', 'Medium', 'Draft', [solution], [topic], [], null as any)).toThrow(ValidationError);
    });

    it('should accept valid difficulties', () => {
      expect(createProblem('id', 't', 'p', 'Easy', 'Draft', [solution], [topic], [], author).difficulty).toBe('Easy');
      expect(createProblem('id', 't', 'p', 'Medium', 'Draft', [solution], [topic], [], author).difficulty).toBe('Medium');
      expect(createProblem('id', 't', 'p', 'Hard', 'Draft', [solution], [topic], [], author).difficulty).toBe('Hard');
    });

    it('should accept valid statuses', () => {
      expect(createProblem('id', 't', 'p', 'Medium', 'Draft', [solution], [topic], [], author).status).toBe('Draft');
      expect(createProblem('id', 't', 'p', 'Medium', 'Published', [solution], [topic], [], author).status).toBe('Published');
      expect(createProblem('id', 't', 'p', 'Medium', 'Archived', [solution], [topic], [], author).status).toBe('Archived');
    });
  });

  describe('problemEquals', () => {
    it('should return true for problems with same id', () => {
      const p1 = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const p2 = createProblem('prob-1', 'Different', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      expect(problemEquals(p1, p2)).toBe(true);
    });

    it('should return false for problems with different ids', () => {
      const p1 = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const p2 = createProblem('prob-2', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      expect(problemEquals(p1, p2)).toBe(false);
    });
  });

  describe('publishProblem', () => {
    it('should publish a draft problem with solutions', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const published = publishProblem(problem);

      expect(published.status).toBe('Published');
      expect(published.updatedAt).not.toBe(problem.updatedAt);
      // Original unchanged
      expect(problem.status).toBe('Draft');
    });

    it('should return same problem if already published', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Published', [solution], [topic], [], author);
      const published = publishProblem(problem);
      expect(published).toBe(problem);
    });

    it('should throw EmptySolutionError when publishing problem with no solutions', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [], [topic], [], author);
      expect(() => publishProblem(problem)).toThrow(EmptySolutionError);
    });
  });

  describe('archiveProblem', () => {
    it('should archive a published problem', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Published', [solution], [topic], [], author);
      const archived = archiveProblem(problem);

      expect(archived.status).toBe('Archived');
      expect(archived.updatedAt).not.toBe(problem.updatedAt);
    });

    it('should archive a draft problem', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const archived = archiveProblem(problem);
      expect(archived.status).toBe('Archived');
    });

    it('should return same problem if already archived', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Archived', [solution], [topic], [], author);
      const archived = archiveProblem(problem);
      expect(archived).toBe(problem);
    });
  });

  describe('addSolutionToProblem', () => {
    it('should add a solution to problem', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const updated = addSolutionToProblem(problem, solution2);

      expect(updated.solutions).toHaveLength(2);
      expect(updated.updatedAt).not.toBe(problem.updatedAt);
      // Original unchanged
      expect(problem.solutions).toHaveLength(1);
    });

    it('should throw ValidationError for duplicate solution', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      expect(() => addSolutionToProblem(problem, solution)).toThrow(ValidationError);
    });
  });

  describe('addTopicToProblem', () => {
    it('should add a topic to problem', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const updated = addTopicToProblem(problem, topic2);

      expect(updated.topics).toHaveLength(2);
      expect(updated.updatedAt).not.toBe(problem.updatedAt);
    });

    it('should throw ValidationError for duplicate topic', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      expect(() => addTopicToProblem(problem, topic)).toThrow(ValidationError);
    });
  });

  describe('addRelatedProblem', () => {
    it('should add a related problem', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const updated = addRelatedProblem(problem, 'prob-2');

      expect(updated.relatedProblems).toHaveLength(1);
      expect(updated.relatedProblems[0]).toBe('prob-2');
      expect(updated.updatedAt).not.toBe(problem.updatedAt);
    });

    it('should throw ValidationError when relating to self', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      expect(() => addRelatedProblem(problem, 'prob-1')).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate related problem', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], ['prob-2'], author);
      expect(() => addRelatedProblem(problem, 'prob-2')).toThrow(ValidationError);
    });
  });

  describe('updateProblemTitle', () => {
    it('should update problem title', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const updated = updateProblemTitle(problem, 'New Title');

      expect(updated.title).toBe('New Title');
      expect(updated.updatedAt).not.toBe(problem.updatedAt);
    });

    it('should throw ValidationError for empty title', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      expect(() => updateProblemTitle(problem, '')).toThrow(ValidationError);
    });

    it('should return same problem if title unchanged', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const updated = updateProblemTitle(problem, 'Title');
      expect(updated).toBe(problem);
    });
  });

  describe('updateProblemPrompt', () => {
    it('should update problem prompt', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const updated = updateProblemPrompt(problem, 'New Prompt');

      expect(updated.prompt).toBe('New Prompt');
      expect(updated.updatedAt).not.toBe(problem.updatedAt);
    });

    it('should throw ValidationError for empty prompt', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      expect(() => updateProblemPrompt(problem, '')).toThrow(ValidationError);
    });

    it('should return same problem if prompt unchanged', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const updated = updateProblemPrompt(problem, 'Prompt');
      expect(updated).toBe(problem);
    });
  });

  describe('updateProblemDifficulty', () => {
    it('should update problem difficulty', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const updated = updateProblemDifficulty(problem, 'Hard');

      expect(updated.difficulty).toBe('Hard');
      expect(updated.updatedAt).not.toBe(problem.updatedAt);
    });

    it('should throw ValidationError for invalid difficulty', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      expect(() => updateProblemDifficulty(problem, 'Invalid' as Difficulty)).toThrow(ValidationError);
    });

    it('should return same problem if difficulty unchanged', () => {
      const problem = createProblem('prob-1', 'Title', 'Prompt', 'Medium', 'Draft', [solution], [topic], [], author);
      const updated = updateProblemDifficulty(problem, 'Medium');
      expect(updated).toBe(problem);
    });
  });
});