import { DomainError } from './DomainError';

export class ProblemNotFoundError extends DomainError {
  readonly problemId: string;

  constructor(problemId: string) {
    super(`Problem not found: ${problemId}`);
    this.problemId = problemId;
  }
}