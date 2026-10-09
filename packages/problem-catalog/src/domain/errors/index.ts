export { DomainError } from './DomainError';
export { ValidationError } from './ValidationError';
export { ProblemNotFoundError } from './ProblemNotFoundError';
export { SolutionNotFoundError } from './SolutionNotFoundError';
export { EmptySolutionError } from './EmptySolutionError';
export { EmptyTradeoffError } from './EmptyTradeoffError';
export { TopicNotFoundError } from './TopicNotFoundError';

import { DomainError } from './DomainError';
import { ValidationError } from './ValidationError';

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}