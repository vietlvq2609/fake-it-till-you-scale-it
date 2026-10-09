import { Problem } from '../../domain/entities/Problem';
import { IProblemRepository } from '../../domain/repositories/IProblemRepository';
import { ProblemNotFoundError } from '../../domain/errors';

export interface GetProblemDetailInput {
  readonly problemId: string;
}

export type GetProblemDetailOutput = Problem;

export class GetProblemDetailUseCase {
  constructor(private readonly repository: IProblemRepository) {}

  async execute(input: GetProblemDetailInput): Promise<GetProblemDetailOutput> {
    const problem = await this.repository.findById(input.problemId);

    if (!problem) {
      throw new ProblemNotFoundError(input.problemId);
    }

    return problem;
  }
}