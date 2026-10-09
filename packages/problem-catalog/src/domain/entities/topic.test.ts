import { describe, it, expect } from 'vitest';
import { createTopic, topicEquals, topicMatchesSlug, Topic } from '../entities/topic';
import { ValidationError } from '../errors';

describe('Topic Entity', () => {
  describe('createTopic', () => {
    it('should create a valid topic with name and generated slug', () => {
      const topic = createTopic('System Design');

      expect(topic.name).toBe('System Design');
      expect(topic.slug).toBe('system-design');
    });

    it('should trim whitespace from name', () => {
      const topic = createTopic('  Distributed Systems  ');
      expect(topic.name).toBe('Distributed Systems');
      expect(topic.slug).toBe('distributed-systems');
    });

    it('should generate slug from complex names', () => {
      expect(createTopic('CAP Theorem').slug).toBe('cap-theorem');
      expect(createTopic('Event-Driven Architecture').slug).toBe('event-driven-architecture');
      expect(createTopic('Microservices vs Monolith').slug).toBe('microservices-vs-monolith');
      expect(createTopic('  Leading/Trailing Spaces  ').slug).toBe('leading-trailing-spaces');
      expect(createTopic('Special!!! Characters???').slug).toBe('special-characters');
    });

    it('should throw ValidationError for empty name', () => {
      expect(() => createTopic('')).toThrow(ValidationError);
      expect(() => createTopic('   ')).toThrow(ValidationError);
    });

    it('should throw ValidationError with descriptive message', () => {
      expect(() => createTopic('')).toThrow('Topic name cannot be empty');
    });
  });

  describe('topicEquals', () => {
    it('should return true for topics with same slug', () => {
      const t1 = createTopic('System Design');
      const t2 = createTopic('system design'); // different case, same slug
      expect(topicEquals(t1, t2)).toBe(true);
    });

    it('should return false for topics with different slugs', () => {
      const t1 = createTopic('System Design');
      const t2 = createTopic('Distributed Systems');
      expect(topicEquals(t1, t2)).toBe(false);
    });
  });

  describe('topicMatchesSlug', () => {
    it('should return true when topic slug matches', () => {
      const topic = createTopic('System Design');
      expect(topicMatchesSlug(topic, 'system-design')).toBe(true);
    });

    it('should return false when topic slug does not match', () => {
      const topic = createTopic('System Design');
      expect(topicMatchesSlug(topic, 'distributed-systems')).toBe(false);
    });
  });
});