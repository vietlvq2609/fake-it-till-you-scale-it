import { describe, it, expect, beforeEach } from 'vitest';
import { MarkdownProblemParser } from '../../../src/infrastructure/persistence/MarkdownProblemParser';
import { Problem } from '../../../src/domain/entities/Problem';
import { Solution } from '../../../src/domain/entities/Solution';
import { Topic } from '../../../src/domain/entities/Topic';
import { Author } from '../../../src/domain/entities/Author';
import { Tradeoff } from '../../../src/domain/value-objects/Tradeoff';

describe('MarkdownProblemParser', () => {
  let parser: MarkdownProblemParser;

  beforeEach(() => {
    parser = new MarkdownProblemParser();
  });

  const sampleMarkdown = `---
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
---

## Prompt

Design a URL shortener...

## Solutions

### Solution 1: Redis Cache

Description here.
`;

  it('should parse a valid problem markdown file', () => {
    const problem = parser.parse(sampleMarkdown, 'content/problems/url-shortener.md');

    expect(problem.id).toBe('prob-1');
    expect(problem.title).toBe('Design a URL Shortener');
    expect(problem.prompt).toBe('Design a system like bit.ly');
    expect(problem.difficulty).toBe('Medium');
    expect(problem.status).toBe('Published');
    expect(problem.solutions).toHaveLength(1);
    expect(problem.topics).toHaveLength(2);
    expect(problem.relatedProblems).toEqual(['prob-2']);
    expect(problem.author.id).toBe('author-1');
    expect(problem.author.name).toBe('John Doe');
    expect(problem.author.bio).toBe('Architect');
  });

  it('should parse solution with tradeoffs and topics', () => {
    const problem = parser.parse(sampleMarkdown, 'content/problems/url-shortener.md');

    const solution = problem.solutions[0];
    expect(solution.id).toBe('sol-1');
    expect(solution.name).toBe('Redis Cache');
    expect(solution.description).toBe('Use Redis for caching');
    expect(solution.diagram).toBe('graph TD; A --> B');
    expect(solution.tradeoffs).toHaveLength(1);
    expect(solution.tradeoffs[0].decision).toBe('Use Redis');
    expect(solution.tradeoffs[0].advantage).toBe('Fast');
    expect(solution.tradeoffs[0].disadvantage).toBe('Complex');
    expect(solution.topics).toHaveLength(1);
    expect(solution.topics[0].name).toBe('caching');
  });

  it('should use file path as id when not provided in frontmatter', () => {
    const markdownWithoutId = sampleMarkdown.replace('id: "prob-1"\n', '');
    const problem = parser.parse(markdownWithoutId, 'content/problems/my-problem.md');

    expect(problem.id).toBe('content/problems/my-problem.md');
  });

  it('should use current date when createdAt/updatedAt not provided', () => {
    const markdownWithoutDates = sampleMarkdown
      .replace('createdAt: "2024-01-15T10:00:00Z"\n', '')
      .replace('updatedAt: "2024-01-15T10:00:00Z"\n', '');

    const before = new Date();
    const problem = parser.parse(markdownWithoutDates, 'content/problems/test.md');
    const after = new Date();

    expect(problem.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(problem.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(problem.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(problem.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should parse multiple solutions', () => {
    const multiSolutionMarkdown = `---
id: "prob-1"
title: "Design a URL Shortener"
prompt: "Design a system like bit.ly"
difficulty: "Medium"
status: "Published"
solutions:
  - id: "sol-1"
    name: "Solution 1"
    description: "First solution"
    diagram: "graph TD; A --> B"
    tradeoffs:
      - decision: "Decision 1"
        advantage: "Advantage 1"
        disadvantage: "Disadvantage 1"
    topics: ["topic1"]
  - id: "sol-2"
    name: "Solution 2"
    description: "Second solution"
    diagram: "graph TD; A --> C"
    tradeoffs:
      - decision: "Decision 2"
        advantage: "Advantage 2"
        disadvantage: "Disadvantage 2"
    topics: ["topic2"]
topics: ["caching", "sharding"]
relatedProblems: ["prob-2"]
author:
  id: "author-1"
  name: "John Doe"
  bio: "Architect"
createdAt: "2024-01-15T10:00:00Z"
updatedAt: "2024-01-15T10:00:00Z"
---`;

    const problem = parser.parse(multiSolutionMarkdown, 'content/problems/test.md');

    expect(problem.solutions).toHaveLength(2);
    expect(problem.solutions[0].id).toBe('sol-1');
    expect(problem.solutions[1].id).toBe('sol-2');
  });

  it('should parse empty relatedProblems array', () => {
    const markdown = sampleMarkdown.replace('relatedProblems: ["prob-2"]', 'relatedProblems: []');
    const problem = parser.parse(markdown, 'content/problems/test.md');

    expect(problem.relatedProblems).toEqual([]);
  });

  it('should parse author without bio', () => {
    const markdown = sampleMarkdown.replace('bio: "Architect"\n', '');
    const problem = parser.parse(markdown, 'content/problems/test.md');

    expect(problem.author.bio).toBeNull();
  });
});