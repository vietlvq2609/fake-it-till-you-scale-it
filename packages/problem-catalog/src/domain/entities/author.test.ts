import { describe, it, expect } from 'vitest';
import { createAuthor, authorEquals, Author } from '../entities/author';
import { ValidationError } from '../errors';

describe('Author Entity', () => {
  describe('createAuthor', () => {
    it('should create a valid author with id, name, and optional bio', () => {
      const author = createAuthor('author-1', 'John Doe', 'Software architect');

      expect(author.id).toBe('author-1');
      expect(author.name).toBe('John Doe');
      expect(author.bio).toBe('Software architect');
    });

    it('should create author with null bio when not provided', () => {
      const author = createAuthor('author-1', 'John Doe');
      expect(author.bio).toBeNull();
    });

    it('should trim whitespace from name and bio', () => {
      const author = createAuthor('  author-1  ', '  John Doe  ', '  Bio  ');
      expect(author.id).toBe('author-1');
      expect(author.name).toBe('John Doe');
      expect(author.bio).toBe('Bio');
    });

    it('should throw ValidationError for empty name', () => {
      expect(() => createAuthor('id', '')).toThrow(ValidationError);
      expect(() => createAuthor('id', '   ')).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty id', () => {
      expect(() => createAuthor('', 'John Doe')).toThrow(ValidationError);
      expect(() => createAuthor('   ', 'John Doe')).toThrow(ValidationError);
    });

    it('should throw ValidationError with descriptive message', () => {
      expect(() => createAuthor('id', '')).toThrow('Author name cannot be empty');
      expect(() => createAuthor('', 'John Doe')).toThrow('Author id cannot be empty');
    });
  });

  describe('authorEquals', () => {
    it('should return true for authors with same id', () => {
      const a1 = createAuthor('author-1', 'John Doe');
      const a2 = createAuthor('author-1', 'Jane Smith'); // different name, same id
      expect(authorEquals(a1, a2)).toBe(true);
    });

    it('should return false for authors with different ids', () => {
      const a1 = createAuthor('author-1', 'John Doe');
      const a2 = createAuthor('author-2', 'John Doe');
      expect(authorEquals(a1, a2)).toBe(false);
    });
  });
});