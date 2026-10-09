import { describe, it, expect } from 'vitest';
import { Topic } from '../../../packages/problem-catalog/src/domain/entities/Topic';
import { ValidationError } from '../../../packages/problem-catalog/src/domain/errors';

describe('Topic Entity', () => {
  describe('create', () => {
    it('should create a valid topic with name and generated slug', () => {
      const topic = Topic.create('System Design');

      expect(topic.name).toBe('System Design');
      expect(topic.slug).toBe('system-design');
    });

    it('should trim whitespace from name', () => {
      const topic = Topic.create('  Distributed Systems  ');
      expect(topic.name).toBe('Distributed Systems');
      expect(topic.slug).toBe('distributed-systems');
    });

    it('should generate slug from complex names', () => {
      expect(Topic.create('CAP Theorem').slug).toBe('cap-theorem');
      expect(Topic.create('Event-Driven Architecture').slug).toBe('event-driven-architecture');
      expect(Topic.create('Microservices vs Monolith').slug).toBe('microservices-vs-monolith');
      expect(Topic.create('  Leading/Trailing Spaces  ').slug).toBe('leading-trailing-spaces');
      expect(Topic.create('Special!!! Characters???').slug).toBe('special-characters');
    });

    it('should throw ValidationError for empty name', () => {
      expect(() => Topic.create('')).toThrow(ValidationError);
      expect(() => Topic.create('   ')).toThrow(ValidationError);
    });

    it('should throw ValidationError with descriptive message', () => {
      expect(() => Topic.create('')).toThrow('Topic name cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true for topics with same slug', () => {
      const t1 = Topic.create('System Design');
      const t2 = Topic.create('system design');
      expect(t1.equals(t2)).toBe(true);
    });

    it('should return false for topics with different slugs', () => {
      const t1 = Topic.create('System Design');
      const t2 = Topic.create('Distributed Systems');
      expect(t1.equals(t2)).toBe(false);
    });
  });

  describe('matchesSlug', () => {
    it('should return true when topic slug matches', () => {
      const topic = Topic.create('System Design');
      expect(topic.matchesSlug('system-design')).toBe(true);
    });

    it('should return false when topic slug does not match', () => {
      const topic = Topic.create('System Design');
      expect(topic.matchesSlug('distributed-systems')).toBe(false);
    });
  });
});