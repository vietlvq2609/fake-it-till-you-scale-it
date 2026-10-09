import { Problem, Difficulty, ProblemStatus } from '../entities/problem';
import { Topic } from '../entities/topic';
import { Solution } from '../entities/solution';
import { ProblemNotFoundError, SolutionNotFoundError, TopicNotFoundError } from '../errors';

/**
 * Repository interface for Problem entities (synchronous version for domain service).
 */
export interface ProblemRepository {
  findById(id: string): Problem | undefined;
  findAll(): Problem[];
  save(problem: Problem): void;
  delete(id: string): void;
}

/**
 * Repository interface for Topic entities (synchronous version for domain service).
 */
export interface TopicRepository {
  findBySlug(slug: string): Topic | undefined;
  findAll(): Topic[];
  save(topic: Topic): void;
  delete(slug: string): void;
}

/**
 * Async versions of repository interfaces for application layer.
 */
export interface AsyncProblemRepository {
  findById(id: string): Promise<Problem | null>;
  findAll(): Promise<Problem[]>;
  save(problem: Problem): Promise<void>;
  update(problem: Problem): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface AsyncTopicRepository {
  findBySlug(slug: string): Promise<Topic | null>;
  findAll(): Promise<Topic[]>;
  save(topic: Topic): Promise<void>;
  delete(slug: string): Promise<void>;
}

/**
 * Domain service for Problem Catalog operations.
 * Contains business logic that doesn't belong to a single entity.
 * Works with synchronous repositories for fast in-memory operations.
 */
export class ProblemCatalogService {
  constructor(
    private readonly problemRepo: ProblemRepository,
    private readonly topicRepo: TopicRepository
  ) {}

  /**
   * Finds problems that have a solution matching the given pattern.
   * Searches in solution name, description, and diagram.
   */
  findProblemsBySolutionPattern(pattern: string): Problem[] {
    const regex = new RegExp(pattern, 'i');
    return this.problemRepo.findAll().filter((problem) =>
      problem.solutions.some(
        (solution) =>
          regex.test(solution.name) ||
          regex.test(solution.description) ||
          regex.test(solution.diagram)
      )
    );
  }

  /**
   * Finds problems that have the given topic (by slug).
   */
  findProblemsByTopic(topicSlug: string): Problem[] {
    const topic = this.topicRepo.findBySlug(topicSlug);
    if (!topic) {
      throw new TopicNotFoundError(topicSlug);
    }

    return this.problemRepo.findAll().filter((problem) =>
      problem.topics.some((t) => t.slug === topicSlug)
    );
  }

  /**
   * Finds problems by difficulty level.
   */
  findProblemsByDifficulty(difficulty: Difficulty): Problem[] {
    return this.problemRepo.findAll().filter((problem) => problem.difficulty === difficulty);
  }

  /**
   * Gets all topics.
   */
  getAllTopics(): Topic[] {
    return this.topicRepo.findAll();
  }

  /**
   * Finds problems related to the given problem.
   */
  findRelatedProblems(problemId: string): Problem[] {
    const problem = this.problemRepo.findById(problemId);
    if (!problem) {
      throw new ProblemNotFoundError(problemId);
    }

    return problem.relatedProblems
      .map((id) => this.problemRepo.findById(id))
      .filter((p): p is Problem => p !== undefined);
  }

  /**
   * Finds a problem by ID.
   */
  findProblemById(id: string): Problem {
    const problem = this.problemRepo.findById(id);
    if (!problem) {
      throw new ProblemNotFoundError(id);
    }
    return problem;
  }

  /**
   * Finds a solution by ID across all problems.
   */
  findSolutionById(solutionId: string): Solution {
    for (const problem of this.problemRepo.findAll()) {
      const solution = problem.solutions.find((s) => s.id === solutionId);
      if (solution) {
        return solution;
      }
    }
    throw new SolutionNotFoundError(solutionId);
  }

  /**
   * Gets all published problems.
   */
  getPublishedProblems(): Problem[] {
    return this.problemRepo.findAll().filter((p) => p.status === 'Published');
  }

  /**
   * Gets all problems by a specific author.
   */
  getProblemsByAuthor(authorId: string): Problem[] {
    return this.problemRepo.findAll().filter((p) => p.author.id === authorId);
  }

  /**
   * Searches problems by title or prompt.
   */
  searchProblems(query: string): Problem[] {
    const regex = new RegExp(query, 'i');
    return this.problemRepo.findAll().filter(
      (problem) => regex.test(problem.title) || regex.test(problem.prompt)
    );
  }
}

/**
 * Async version of the catalog service for use with async repositories.
 */
export class AsyncProblemCatalogService {
  constructor(
    private readonly problemRepo: AsyncProblemRepository,
    private readonly topicRepo: AsyncTopicRepository
  ) {}

  async findProblemsBySolutionPattern(pattern: string): Promise<Problem[]> {
    const regex = new RegExp(pattern, 'i');
    const problems = await this.problemRepo.findAll();
    return problems.filter((problem) =>
      problem.solutions.some(
        (solution) =>
          regex.test(solution.name) ||
          regex.test(solution.description) ||
          regex.test(solution.diagram)
      )
    );
  }

  async findProblemsByTopic(topicSlug: string): Promise<Problem[]> {
    const topic = await this.topicRepo.findBySlug(topicSlug);
    if (!topic) {
      throw new TopicNotFoundError(topicSlug);
    }

    const problems = await this.problemRepo.findAll();
    return problems.filter((problem) => problem.topics.some((t) => t.slug === topicSlug));
  }

  async findProblemsByDifficulty(difficulty: Difficulty): Promise<Problem[]> {
    const problems = await this.problemRepo.findAll();
    return problems.filter((problem) => problem.difficulty === difficulty);
  }

  async getAllTopics(): Promise<Topic[]> {
    return this.topicRepo.findAll();
  }

  async findRelatedProblems(problemId: string): Promise<Problem[]> {
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) {
      throw new ProblemNotFoundError(problemId);
    }

    const related: Problem[] = [];
    for (const id of problem.relatedProblems) {
      const p = await this.problemRepo.findById(id);
      if (p) related.push(p);
    }
    return related;
  }

  async findProblemById(id: string): Promise<Problem> {
    const problem = await this.problemRepo.findById(id);
    if (!problem) {
      throw new ProblemNotFoundError(id);
    }
    return problem;
  }

  async findSolutionById(solutionId: string): Promise<Solution> {
    const problems = await this.problemRepo.findAll();
    for (const problem of problems) {
      const solution = problem.solutions.find((s) => s.id === solutionId);
      if (solution) {
        return solution;
      }
    }
    throw new SolutionNotFoundError(solutionId);
  }

  async getPublishedProblems(): Promise<Problem[]> {
    const problems = await this.problemRepo.findAll();
    return problems.filter((p) => p.status === 'Published');
  }

  async getProblemsByAuthor(authorId: string): Promise<Problem[]> {
    const problems = await this.problemRepo.findAll();
    return problems.filter((p) => p.author.id === authorId);
  }

  async searchProblems(query: string): Promise<Problem[]> {
    const regex = new RegExp(query, 'i');
    const problems = await this.problemRepo.findAll();
    return problems.filter(
      (problem) => regex.test(problem.title) || regex.test(problem.prompt)
    );
  }
}