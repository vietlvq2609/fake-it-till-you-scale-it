/**
 * Domain event emitted when a problem is published.
 */
export interface ProblemPublished {
  readonly type: 'ProblemPublished';
  readonly payload: {
    readonly problemId: string;
    readonly title: string;
    readonly difficulty: 'Easy' | 'Medium' | 'Hard';
    readonly topics: readonly string[]; // topic slugs
    readonly publishedAt: Date;
  };
}

/**
 * Creates a ProblemPublished event.
 */
export function createProblemPublishedEvent(
  problemId: string,
  title: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  topicSlugs: readonly string[]
): ProblemPublished {
  return {
    type: 'ProblemPublished',
    payload: {
      problemId,
      title,
      difficulty,
      topics: topicSlugs,
      publishedAt: new Date(),
    },
  };
}

/**
 * Type guard to check if an event is a ProblemPublished event.
 */
export function isProblemPublished(event: unknown): event is ProblemPublished {
  return (
    typeof event === 'object' &&
    event !== null &&
    'type' in event &&
    (event as Record<string, unknown>).type === 'ProblemPublished'
  );
}