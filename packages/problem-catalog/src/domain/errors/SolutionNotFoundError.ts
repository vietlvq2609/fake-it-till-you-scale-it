import { DomainError } from './DomainError';

export class SolutionNotFoundError extends DomainError {
  readonly solutionId: string;

  constructor(solutionId: string) {
    super(`Solution not found: ${solutionId}`);
    this.solutionId = solutionId;
  }
}