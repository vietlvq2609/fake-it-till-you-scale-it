import { describe, it, expect } from 'vitest';
import { Topic } from '../../../src/domain/entities/Topic';
import { ValidationError } from '../../../src/domain/errors';

describe('Topic Entity', () => {
  describe('create', () => {
    it('should create a topic with name and auto-generated slug', () => {
      const topic = Topic.create('System Design');

      expect(topic.name).toBe('System Design');
      expect(topic.slug).toBe('system-design');
    });

    it('should trim whitespace from name', () => {
      const topic = Topic.create('  System Design  ');

      expect(topic.name).toBe('System Design');
      expect(topic.slug).toBe('system-design');
    });

    it('should generate slug from name with special characters', () => {
      const topic = Topic.create('Event Sourcing & CQRS');

      expect(topic.name).toBe('Event Sourcing & CQRS');
      expect(topic.slug).toBe('event-sourcing-cqrs');
    });

    it('should generate slug from name with numbers', () => {
      const topic = Topic.create('Caching Layer v2');

      expect(topic.name).toBe('Caching Layer v2');
      expect(topic.slug).toBe('caching-layer-v2');
    });

    it('should throw ValidationError for empty name', () => {
      expect(() => Topic.create('')).toThrow(ValidationError);
      expect(() => Topic.create('   ')).toThrow(ValidationError);
    });
  });

  describe('equals', () => {
    it('should return true for topics with same slug', () => {
      const t1 = Topic.create('System Design');
      const t2 = Topic.create('system design'); // different case, same slug

      expect(t1.equals(t2)).toBe(true);
    });

    it('should return false for topics with different slugs', () => {
      const t1 = Topic.create('System Design');
      const t2 = Topic.create('Distributed Systems');

      expect(t1.equals(t2)).toBe(false);
    });
  });

  describe('matchesSlug', () => {
    it('should return true for matching slug', () => {
      const topic = Topic.create('System Design');

      expect(topic.matchesSlug('system-design')).toBe(true);
    });

    it('should return false for non-matching slug', () => {
      const topic = Topic.create('System Design');

      expect(topic.matchesSlug('distributed-systems')).toBe(false);
    });
  });
});