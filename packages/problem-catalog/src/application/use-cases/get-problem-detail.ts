import { IProblemCatalogRepository } from '../ports';
import { Problem } from '../../domain/entities/problem';
import { ProblemNotFoundError } from '../../domain/errors';

/**
 * Input for GetProblemDetailUseCase.
 */
export interface GetProblemDetailInput {
  readonly problemId: string;
}

/**
 * Output from GetProblemDetailUseCase.
 */
export type GetProblemDetailOutput = Problem;

/**
 * Use case for retrieving a single problem by ID.
 */
export class GetProblemDetailUseCase {
  constructor(private readonly repository: IProblemCatalogRepository) {}

  /**
   * Executes the use case to get a problem by ID.
   * @throws ProblemNotFoundError if problem doesn't exist
   */
  async execute(input: GetProblemDetailInput): Promise<GetProblemDetailOutput> {
    const problem = await this.repository.findById(input.problemId);

    if (!problem) {
      throw new ProblemNotFoundError(input.problemId);
    }

    return problem;
  }
}