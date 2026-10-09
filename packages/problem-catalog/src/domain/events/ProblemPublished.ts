export interface ProblemPublishedPayload {
  readonly problemId: string;
  readonly title: string;
  readonly difficulty: 'Easy' | 'Medium' | 'Hard';
  readonly topics: readonly string[];
  readonly publishedAt: Date;
}

export class ProblemPublished {
  readonly type = 'ProblemPublished' as const;
  readonly payload: ProblemPublishedPayload;

  constructor(payload: ProblemPublishedPayload) {
    this.payload = payload;
  }

  static create(
    problemId: string,
    title: string,
    difficulty: 'Easy' | 'Medium' | 'Hard',
    topicSlugs: readonly string[]
  ): ProblemPublished {
    return new ProblemPublished({
      problemId,
      title,
      difficulty,
      topics: topicSlugs,
      publishedAt: new Date(),
    });
  }
}

export function isProblemPublished(event: unknown): event is ProblemPublished {
  return (
    typeof event === 'object' &&
    event !== null &&
    'type' in event &&
    (event as Record<string, unknown>).type === 'ProblemPublished'
  );
}