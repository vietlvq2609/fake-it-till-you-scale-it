import { IProblemCatalogRepository } from './problem-catalog-repository';
import { Problem } from '../../domain/entities/problem';
import { Topic } from '../../domain/entities/topic';

/**
 * Fake in-memory implementation of IProblemCatalogRepository for testing.
 */
export class FakeProblemCatalogRepository implements IProblemCatalogRepository {
  private problems: Map<string, Problem> = new Map();
  private topics: Map<string, Topic> = new Map();

  constructor(initialProblems: Problem[] = [], initialTopics: Topic[] = []) {
    for (const problem of initialProblems) {
      this.problems.set(problem.id, problem);
    }
    for (const topic of initialTopics) {
      this.topics.set(topic.slug, topic);
    }
  }

  async findAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }

  async findById(id: string): Promise<Problem | null> {
    return this.problems.get(id) ?? null;
  }

  async findPublished(): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter((p) => p.status === 'Published');
  }

  async findByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter((p) => p.difficulty === difficulty);
  }

  async findBySolutionTopic(topicSlug: string): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter((p) =>
      p.solutions.some((s) => s.topics.some((t) => t.slug === topicSlug))
    );
  }

  async findByTopic(topicSlug: string): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter((p) =>
      p.topics.some((t) => t.slug === topicSlug)
    );
  }

  async save(problem: Problem): Promise<void> {
    this.problems.set(problem.id, problem);
    // Also save topics
    for (const topic of problem.topics) {
      this.topics.set(topic.slug, topic);
    }
    for (const solution of problem.solutions) {
      for (const topic of solution.topics) {
        this.topics.set(topic.slug, topic);
      }
    }
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

  // Helper methods for testing
  clear(): void {
    this.problems.clear();
    this.topics.clear();
  }

  getProblems(): Problem[] {
    return Array.from(this.problems.values());
  }

  getTopics(): Topic[] {
    return Array.from(this.topics.values());
  }

  addProblem(problem: Problem): void {
    this.problems.set(problem.id, problem);
    // Also save topics
    for (const topic of problem.topics) {
      this.topics.set(topic.slug, topic);
    }
    for (const solution of problem.solutions) {
      for (const topic of solution.topics) {
        this.topics.set(topic.slug, topic);
      }
    }
  }

  addTopic(topic: Topic): void {
    this.topics.set(topic.slug, topic);
  }
}