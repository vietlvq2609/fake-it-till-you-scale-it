import { Problem, Difficulty, ProblemStatus } from '../entities/problem';
import { Topic } from '../entities/topic';
import { Solution } from '../entities/solution';
import { ProblemNotFoundError, SolutionNotFoundError, TopicNotFoundError } from '../errors';

/**
 * Repository interface for Problem entities.
 * Implementations will be provided by the infrastructure layer.
 */
export interface ProblemRepository {
  findById(id: string): Problem | undefined;
  findAll(): Problem[];
  save(problem: Problem): void;
  delete(id: string): void;
}

/**
 * Repository interface for Topic entities.
 */
export interface TopicRepository {
  findBySlug(slug: string): Topic | undefined;
  findAll(): Topic[];
  save(topic: Topic): void;
  delete(slug: string): void;
}

/**
 * Domain service for Problem Catalog operations.
 * Contains business logic that doesn't belong to a single entity.
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