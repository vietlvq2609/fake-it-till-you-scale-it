import { describe, it, expect } from 'vitest';
import { ProblemPublished, isProblemPublished } from '../../../packages/problem-catalog/src/domain/events/ProblemPublished';

describe('ProblemPublished Domain Event', () => {
  describe('create', () => {
    it('should create a valid ProblemPublished event', () => {
      const event = ProblemPublished.create(
        'prob-1',
        'Design a URL Shortener',
        'Medium',
        ['system-design', 'distributed-systems']
      );

      expect(event.type).toBe('ProblemPublished');
      expect(event.payload.problemId).toBe('prob-1');
      expect(event.payload.title).toBe('Design a URL Shortener');
      expect(event.payload.difficulty).toBe('Medium');
      expect(event.payload.topics).toEqual(['system-design', 'distributed-systems']);
      expect(event.payload.publishedAt).toBeInstanceOf(Date);
    });

    it('should set publishedAt to current time', () => {
      const before = new Date();
      const event = ProblemPublished.create('prob-1', 'Title', 'Easy', []);
      const after = new Date();

      expect(event.payload.publishedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.payload.publishedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should handle empty topics array', () => {
      const event = ProblemPublished.create('prob-1', 'Title', 'Hard', []);

      expect(event.payload.topics).toEqual([]);
    });
  });

  describe('isProblemPublished', () => {
    it('should return true for valid ProblemPublished event', () => {
      const event = ProblemPublished.create('prob-1', 'Title', 'Easy', ['topic']);
      expect(isProblemPublished(event)).toBe(true);
    });

    it('should return false for wrong type', () => {
      const event = { type: 'OtherEvent', payload: {} };
      expect(isProblemPublished(event)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isProblemPublished(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isProblemPublished(undefined)).toBe(false);
    });

    it('should return false for plain object without type', () => {
      expect(isProblemPublished({ payload: {} })).toBe(false);
    });

    it('should return false for string', () => {
      expect(isProblemPublished('ProblemPublished')).toBe(false);
    });
  });
});