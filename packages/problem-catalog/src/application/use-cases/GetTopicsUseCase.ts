import { Problem } from '../../domain/entities/Problem';
import { Topic } from '../../domain/entities/Topic';
import { IProblemRepository } from '../../domain/repositories/IProblemRepository';

export interface TopicWithCount {
  readonly topic: Topic;
  readonly problemCount: number;
}

export interface GetTopicsOutput {
  readonly topics: readonly TopicWithCount[];
}

export class GetTopicsUseCase {
  constructor(private readonly repository: IProblemRepository) {}

  async execute(): Promise<GetTopicsOutput> {
    const problems = await this.repository.findAll();

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