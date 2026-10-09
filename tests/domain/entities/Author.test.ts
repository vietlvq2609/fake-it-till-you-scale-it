import { describe, it, expect } from 'vitest';
import { Author } from '../../../packages/problem-catalog/src/domain/entities/Author';
import { ValidationError } from '../../../packages/problem-catalog/src/domain/errors';

describe('Author Entity', () => {
  describe('create', () => {
    it('should create a valid author with id, name, and optional bio', () => {
      const author = Author.create('author-1', 'John Doe', 'Software architect');

      expect(author.id).toBe('author-1');
      expect(author.name).toBe('John Doe');
      expect(author.bio).toBe('Software architect');
    });

    it('should create author with null bio when not provided', () => {
      const author = Author.create('author-1', 'John Doe');
      expect(author.bio).toBeNull();
    });

    it('should trim whitespace from name and bio', () => {
      const author = Author.create('  author-1  ', '  John Doe  ', '  Bio  ');
      expect(author.id).toBe('author-1');
      expect(author.name).toBe('John Doe');
      expect(author.bio).toBe('Bio');
    });

    it('should throw ValidationError for empty name', () => {
      expect(() => Author.create('id', '')).toThrow(ValidationError);
      expect(() => Author.create('id', '   ')).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty id', () => {
      expect(() => Author.create('', 'John Doe')).toThrow(ValidationError);
      expect(() => Author.create('   ', 'John Doe')).toThrow(ValidationError);
    });

    it('should throw ValidationError with descriptive message', () => {
      expect(() => Author.create('id', '')).toThrow('Author name cannot be empty');
      expect(() => Author.create('', 'John Doe')).toThrow('Author id cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true for authors with same id', () => {
      const a1 = Author.create('author-1', 'John Doe');
      const a2 = Author.create('author-1', 'Jane Smith');
      expect(a1.equals(a2)).toBe(true);
    });

    it('should return false for authors with different ids', () => {
      const a1 = Author.create('author-1', 'John Doe');
      const a2 = Author.create('author-2', 'John Doe');
      expect(a1.equals(a2)).toBe(false);
    });
  });
});