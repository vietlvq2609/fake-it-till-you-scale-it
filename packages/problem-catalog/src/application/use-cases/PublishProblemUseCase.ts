import { Problem } from '../../domain/entities/Problem';
import { IProblemRepository } from '../../domain/repositories/IProblemRepository';
import { IEventBus } from '../ports/IEventBus';
import { ProblemPublished } from '../../domain/events/ProblemPublished';
import { ProblemNotFoundError, EmptySolutionError } from '../../domain/errors';

export interface PublishProblemInput {
  readonly problemId: string;
}

export interface PublishProblemOutput {
  readonly problem: Problem;
}

export class PublishProblemUseCase {
  constructor(
    private readonly repository: IProblemRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(input: PublishProblemInput): Promise<PublishProblemOutput> {
    const problem = await this.repository.findById(input.problemId);

    if (!problem) {
      throw new ProblemNotFoundError(input.problemId);
    }

    if (problem.status === 'Published') {
      return { problem };
    }

    if (problem.solutions.length === 0) {
      throw new EmptySolutionError(input.problemId);
    }

    const publishedProblem = problem.publish();
    await this.repository.update(publishedProblem);

    // Publish domain event
    const event = ProblemPublished.create(
      publishedProblem.id,
      publishedProblem.title,
      publishedProblem.difficulty,
      publishedProblem.topics.map(t => t.slug)
    );
    await this.eventBus.publish(event);

    return { problem: publishedProblem };
  }
}