import { describe, it, expect } from 'vitest';
import {
  DomainError,
  ValidationError,
  ProblemNotFoundError,
  SolutionNotFoundError,
  EmptySolutionError,
  EmptyTradeoffError,
  TopicNotFoundError,
  isDomainError,
  isValidationError,
} from '../../../packages/problem-catalog/src/domain/errors';

describe('Domain Errors', () => {
  describe('DomainError', () => {
    it('should be an instance of Error', () => {
      const error = new DomainError('test message');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('test message');
      expect(error.name).toBe('DomainError');
    });
  });

  describe('ValidationError', () => {
    it('should be an instance of DomainError', () => {
      const error = new ValidationError('validation failed');
      expect(error).toBeInstanceOf(DomainError);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('ProblemNotFoundError', () => {
    it('should store problemId and have descriptive message', () => {
      const error = new ProblemNotFoundError('prob-123');
      expect(error.problemId).toBe('prob-123');
      expect(error.message).toBe('Problem not found: prob-123');
      expect(error.name).toBe('ProblemNotFoundError');
    });
  });

  describe('SolutionNotFoundError', () => {
    it('should store solutionId and have descriptive message', () => {
      const error = new SolutionNotFoundError('sol-456');
      expect(error.solutionId).toBe('sol-456');
      expect(error.message).toBe('Solution not found: sol-456');
      expect(error.name).toBe('SolutionNotFoundError');
    });
  });

  describe('EmptySolutionError', () => {
    it('should store problemId and have descriptive message', () => {
      const error = new EmptySolutionError('prob-123');
      expect(error.problemId).toBe('prob-123');
      expect(error.message).toBe('Cannot publish problem prob-123: must have at least one solution');
      expect(error.name).toBe('EmptySolutionError');
    });
  });

  describe('EmptyTradeoffError', () => {
    it('should store solutionId and have descriptive message', () => {
      const error = new EmptyTradeoffError('sol-456');
      expect(error.solutionId).toBe('sol-456');
      expect(error.message).toBe('Solution sol-456 must have at least one tradeoff');
      expect(error.name).toBe('EmptyTradeoffError');
    });
  });

  describe('TopicNotFoundError', () => {
    it('should store topicName and have descriptive message', () => {
      const error = new TopicNotFoundError('system-design');
      expect(error.topicName).toBe('system-design');
      expect(error.message).toBe('Topic not found: system-design');
      expect(error.name).toBe('TopicNotFoundError');
    });
  });

  describe('isDomainError', () => {
    it('should return true for DomainError instances', () => {
      expect(isDomainError(new DomainError('test'))).toBe(true);
      expect(isDomainError(new ValidationError('test'))).toBe(true);
      expect(isDomainError(new ProblemNotFoundError('id'))).toBe(true);
    });

    it('should return false for non-DomainError', () => {
      expect(isDomainError(new Error('test'))).toBe(false);
      expect(isDomainError('string')).toBe(false);
      expect(isDomainError(null)).toBe(false);
      expect(isDomainError(undefined)).toBe(false);
      expect(isDomainError({})).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('should return true for ValidationError instances', () => {
      expect(isValidationError(new ValidationError('test'))).toBe(true);
    });

    it('should return false for other DomainErrors', () => {
      expect(isValidationError(new ProblemNotFoundError('id'))).toBe(false);
      expect(isValidationError(new DomainError('test'))).toBe(false);
    });

    it('should return false for non-DomainError', () => {
      expect(isValidationError(new Error('test'))).toBe(false);
      expect(isValidationError('string')).toBe(false);
    });
  });
});