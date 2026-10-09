import { DomainError } from './DomainError';

export class EmptySolutionError extends DomainError {
  readonly problemId: string;

  constructor(problemId: string) {
    super(`Cannot publish problem ${problemId}: must have at least one solution`);
    this.problemId = problemId;
  }
}