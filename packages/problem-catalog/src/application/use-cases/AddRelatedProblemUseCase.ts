import { Problem } from '../../domain/entities/Problem';
import { IProblemRepository } from '../../domain/repositories/IProblemRepository';
import { IEventBus } from '../ports/IEventBus';
import { ProblemNotFoundError, ValidationError } from '../../domain/errors';

export interface AddRelatedProblemInput {
  readonly problemId: string;
  readonly relatedProblemId: string;
}

export interface AddRelatedProblemOutput {
  readonly problem: Problem;
}

export class AddRelatedProblemUseCase {
  constructor(
    private readonly repository: IProblemRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(input: AddRelatedProblemInput): Promise<AddRelatedProblemOutput> {
    const problem = await this.repository.findById(input.problemId);

    if (!problem) {
      throw new ProblemNotFoundError(input.problemId);
    }

    if (input.relatedProblemId === input.problemId) {
      throw new ValidationError('Problem cannot be related to itself');
    }

    const relatedProblem = await this.repository.findById(input.relatedProblemId);
    if (!relatedProblem) {
      throw new ProblemNotFoundError(input.relatedProblemId);
    }

    const updatedProblem = problem.addRelatedProblem(input.relatedProblemId);
    await this.repository.update(updatedProblem);

    return { problem: updatedProblem };
  }
}