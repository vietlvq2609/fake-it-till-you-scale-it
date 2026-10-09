/**
 * Base class for all domain errors in the Problem Catalog.
 */
export class DomainError extends Error {
  readonly name: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when domain validation fails (invalid input, business rule violation).
 */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when a Problem entity is not found.
 */
export class ProblemNotFoundError extends DomainError {
  readonly problemId: string;

  constructor(problemId: string) {
    super(`Problem not found: ${problemId}`);
    this.problemId = problemId;
  }
}

/**
 * Thrown when a Solution entity is not found.
 */
export class SolutionNotFoundError extends DomainError {
  readonly solutionId: string;

  constructor(solutionId: string) {
    super(`Solution not found: ${solutionId}`);
    this.solutionId = solutionId;
  }
}

/**
 * Thrown when attempting to publish a problem with no solutions.
 */
export class EmptySolutionError extends DomainError {
  readonly problemId: string;

  constructor(problemId: string) {
    super(`Cannot publish problem ${problemId}: must have at least one solution`);
    this.problemId = problemId;
  }
}

/**
 * Thrown when attempting to create a solution with no tradeoffs.
 */
export class EmptyTradeoffError extends DomainError {
  readonly solutionId: string;

  constructor(solutionId: string) {
    super(`Solution ${solutionId} must have at least one tradeoff`);
    this.solutionId = solutionId;
  }
}

/**
 * Thrown when a Topic is not found.
 */
export class TopicNotFoundError extends DomainError {
  readonly topicName: string;

  constructor(topicName: string) {
    super(`Topic not found: ${topicName}`);
    this.topicName = topicName;
  }
}

/**
 * Type guard to check if an error is a DomainError.
 */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

/**
 * Type guard for ValidationError.
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}