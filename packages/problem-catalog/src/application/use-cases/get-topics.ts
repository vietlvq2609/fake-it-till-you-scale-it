import { IProblemCatalogRepository } from '../ports';
import { Problem } from '../../domain/entities/problem';
import { Topic } from '../../domain/entities/topic';

/**
 * Topic with problem count.
 */
export interface TopicWithCount {
  readonly topic: Topic;
  readonly problemCount: number;
}

/**
 * Output from GetTopicsUseCase.
 */
export interface GetTopicsOutput {
  readonly topics: readonly TopicWithCount[];
}

/**
 * Use case for retrieving all topics with their problem counts.
 */
export class GetTopicsUseCase {
  constructor(private readonly repository: IProblemCatalogRepository) {}

  /**
   * Executes the use case to get all topics with problem counts.
   */
  async execute(): Promise<GetTopicsOutput> {
    const problems = await this.repository.findAll();

    // Aggregate topics with counts
    const topicMap = new Map<string, { topic: Topic; count: number }>();

    for (const problem of problems) {
      for (const topic of problem.topics) {
        const existing = topicMap.get(topic.slug);
        if (existing) {
          existing.count++;
        } else {
          topicMap.set(topic.slug, { topic, count: 1 });
        }
      }
    }

    // Convert to sorted array (by count descending, then name)
    const topics = Array.from(topicMap.values())
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.topic.name.localeCompare(b.topic.name);
      })
      .map(({ topic, count }) => ({ topic, problemCount: count }));

    return { topics };
  }
}