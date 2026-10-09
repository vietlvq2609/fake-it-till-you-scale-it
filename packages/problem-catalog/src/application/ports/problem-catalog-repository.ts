import { Problem } from '../../domain/entities/problem';
import { Topic } from '../../domain/entities/topic';

/**
 * Port interface for the Problem Catalog repository.
 * Implementations will be provided by the infrastructure layer.
 */
export interface IProblemCatalogRepository {
  /**
   * Returns all problems.
   */
  findAll(): Promise<Problem[]>;

  /**
   * Finds a problem by ID.
   */
  findById(id: string): Promise<Problem | null>;

  /**
   * Returns only published problems.
   */
  findPublished(): Promise<Problem[]>;

  /**
   * Finds problems by difficulty level.
   */
  findByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<Problem[]>;

  /**
   * Finds problems that have a solution matching the given topic.
   */
  findBySolutionTopic(topicSlug: string): Promise<Problem[]>;

  /**
   * Finds problems that have the given topic.
   */
  findByTopic(topicSlug: string): Promise<Problem[]>;

  /**
   * Saves a problem (create or update).
   */
  save(problem: Problem): Promise<void>;

  /**
   * Updates an existing problem.
   */
  update(problem: Problem): Promise<void>;

  /**
   * Deletes a problem by ID.
   */
  delete(id: string): Promise<void>;
}