import { ValidationError } from '../errors';

/**
 * Author entity representing a problem/solution author.
 */
export interface Author {
  readonly id: string;
  readonly name: string;
  readonly bio: string | null;
}

/**
 * Creates an Author entity.
 * @throws ValidationError if name is empty or whitespace-only
 */
export function createAuthor(id: string, name: string, bio: string | null = null): Author {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new ValidationError('Author name cannot be empty');
  }

  if (!id || !id.trim()) {
    throw new ValidationError('Author id cannot be empty');
  }

  return {
    id: id.trim(),
    name: trimmedName,
    bio: bio?.trim() || null,
  };
}

/**
 * Checks if two Authors are equal (by id).
 */
export function authorEquals(a: Author, b: Author): boolean {
  return a.id === b.id;
}