import { describe, it, expect } from 'vitest';
import { ProblemPublished, isProblemPublished, ProblemPublishedPayload } from '../../../src/domain/events/ProblemPublished';

describe('ProblemPublished Domain Event', () => {
  describe('create', () => {
    it('should create a ProblemPublished event with all required fields', () => {
      const event = ProblemPublished.create(
        'prob-1',
        'URL Shortener',
        'Medium',
        ['caching', 'sharding']
      );

      expect(event.type).toBe('ProblemPublished');
      expect(event.payload.problemId).toBe('prob-1');
      expect(event.payload.title).toBe('URL Shortener');
      expect(event.payload.difficulty).toBe('Medium');
      expect(event.payload.topics).toEqual(['caching', 'sharding']);
      expect(event.payload.publishedAt).toBeInstanceOf(Date);
    });

    it('should create event with empty topics array', () => {
      const event = ProblemPublished.create('prob-1', 'Title', 'Easy', []);

      expect(event.payload.topics).toEqual([]);
    });
  });

  describe('isProblemPublished', () => {
    it('should return true for ProblemPublished event', () => {
      const event = ProblemPublished.create('prob-1', 'Title', 'Easy', ['topic']);

      expect(isProblemPublished(event)).toBe(true);
    });

    it('should return false for non-ProblemPublished object', () => {
      expect(isProblemPublished({ type: 'OtherEvent' })).toBe(false);
      expect(isProblemPublished(null)).toBe(false);
      expect(isProblemPublished(undefined)).toBe(false);
      expect(isProblemPublished('string')).toBe(false);
      expect(isProblemPublished(123)).toBe(false);
    });
  });
});