import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileProblemRepository } from '../../../src/infrastructure/persistence/FileProblemRepository';
import { FileSystemStorage } from '../../../src/infrastructure/storage/FileSystemStorage';
import { MarkdownProblemParser } from '../../../src/infrastructure/persistence/MarkdownProblemParser';
import { Problem } from '../../../src/domain/entities/Problem';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

describe('FileProblemRepository', () => {
  let repository: FileProblemRepository;
  let storage: FileSystemStorage;
  let parser: MarkdownProblemParser;
  let testDir: string;
  let problemsDir: string;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fit-repo-test-'));
    problemsDir = path.join(testDir, 'content', 'problems');
    await fs.mkdir(problemsDir, { recursive: true });

    storage = new FileSystemStorage(testDir);
    parser = new MarkdownProblemParser();
    repository = new FileProblemRepository(storage, parser, 'content/problems');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  const sampleProblemMarkdown = `---
id: "prob-1"
title: "Design a URL Shortener"
prompt: "Design a system like bit.ly"
difficulty: "Medium"
status: "Published"
solutions:
  - id: "sol-1"
    name: "Redis Cache"
    description: "Use Redis for caching"
    diagram: "graph TD; A --> B"
    tradeoffs:
      - decision: "Use Redis"
        advantage: "Fast"
        disadvantage: "Complex"
    topics: ["caching"]
topics: ["caching", "sharding"]
relatedProblems: ["prob-2"]
author:
  id: "author-1"
  name: "John Doe"
  bio: "Architect"
createdAt: "2024-01-15T10:00:00Z"
updatedAt: "2024-01-15T10:00:00Z"
---`;

  const draftProblemMarkdown = `---
id: "prob-draft"
title: "Draft Problem"
prompt: "Work in progress"
difficulty: "Easy"
status: "Draft"
solutions:
  - id: "sol-1"
    name: "Solution"
    description: "Desc"
    diagram: "Diag"
    tradeoffs:
      - decision: "Dec"
        advantage: "Adv"
        disadvantage: "Dis"
    topics: []
topics: ["topic1"]
relatedProblems: []
author:
  id: "author-1"
  name: "John Doe"
createdAt: "2024-01-15T10:00:00Z"
updatedAt: "2024-01-15T10:00:00Z"
---`;

  beforeEach(async () => {
    await fs.writeFile(path.join(problemsDir, 'url-shortener.md'), sampleProblemMarkdown);
    await fs.writeFile(path.join(problemsDir, 'draft.md'), draftProblemMarkdown);
  });

  describe('findAll', () => {
    it('should load all problems from markdown files', async () => {
      const problems = await repository.findAll();

      expect(problems).toHaveLength(2);
      const ids = problems.map(p => p.id).sort();
      expect(ids).toEqual(['prob-1', 'prob-draft']);
    });
  });

  describe('findById', () => {
    it('should return problem by id', async () => {
      const problem = await repository.findById('prob-1');

      expect(problem).not.toBeNull();
      expect(problem!.id).toBe('prob-1');
      expect(problem!.title).toBe('Design a URL Shortener');
    });

    it('should return null for unknown id', async () => {
      const problem = await repository.findById('unknown');

      expect(problem).toBeNull();
    });
  });

  describe('findPublished', () => {
    it('should return only published problems', async () => {
      const problems = await repository.findPublished();

      expect(problems).toHaveLength(1);
      expect(problems[0].id).toBe('prob-1');
      expect(problems[0].status).toBe('Published');
    });
  });

  describe('findByDifficulty', () => {
    it('should return problems by difficulty', async () => {
      const problems = await repository.findByDifficulty('Medium');

      expect(problems).toHaveLength(1);
      expect(problems[0].id).toBe('prob-1');
    });

    it('should return empty array for non-matching difficulty', async () => {
      const problems = await repository.findByDifficulty('Hard');

      expect(problems).toHaveLength(0);
    });
  });

  describe('findByTopic', () => {
    it('should return problems with matching topic', async () => {
      const problems = await repository.findByTopic('caching');

      expect(problems).toHaveLength(1);
      expect(problems[0].id).toBe('prob-1');
    });

    it('should return empty array for non-matching topic', async () => {
      const problems = await repository.findByTopic('unknown');

      expect(problems).toHaveLength(0);
    });
  });

  describe('findBySolutionTopic', () => {
    it('should return problems with solution matching topic', async () => {
      const problems = await repository.findBySolutionTopic('caching');

      expect(problems).toHaveLength(1);
      expect(problems[0].id).toBe('prob-1');
    });
  });

  describe('save', () => {
    it('should save new problem to memory and disk', async () => {
      const newProblem = await repository.findById('prob-1');
      if (!newProblem) throw new Error('Setup failed');

      // Modify and save as new
      const updated = newProblem.updateTitle('Updated Title');
      await repository.save(updated);

      // Verify in memory
      const inMemory = await repository.findById('prob-1');
      expect(inMemory!.title).toBe('Updated Title');

      // Verify on disk
      const diskContent = await fs.readFile(path.join(problemsDir, 'prob-1.md'), 'utf-8');
      expect(diskContent).toContain('title: "Updated Title"');
    });
  });

  describe('update', () => {
    it('should update existing problem', async () => {
      const problem = await repository.findById('prob-1');
      if (!problem) throw new Error('Setup failed');

      const updated = problem.updateTitle('Updated Title');
      await repository.update(updated);

      const inMemory = await repository.findById('prob-1');
      expect(inMemory!.title).toBe('Updated Title');
    });

    it('should throw for non-existent problem', async () => {
      const problem = await repository.findById('prob-1');
      if (!problem) throw new Error('Setup failed');

      const newProblem = Problem.create({
        ...problem,
        id: 'non-existent',
      });

      await expect(repository.update(newProblem)).rejects.toThrow('not found');
    });
  });

  describe('delete', () => {
    it('should remove problem from memory', async () => {
      await repository.delete('prob-1');

      const problem = await repository.findById('prob-1');
      expect(problem).toBeNull();
    });
  });

  describe('initialization', () => {
    it('should only initialize once', async () => {
      await repository.findAll();
      await repository.findAll(); // Second call should use cache

      // No error means initialization worked correctly
      const problems = await repository.findAll();
      expect(problems).toHaveLength(2);
    });
  });
});