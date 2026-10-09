import { DomainError } from './DomainError';

export class EmptyTradeoffError extends DomainError {
  readonly solutionId: string;

  constructor(solutionId: string) {
    super(`Solution ${solutionId} must have at least one tradeoff`);
    this.solutionId = solutionId;
  }
}