import { ValidationError } from '../errors';

/**
 * Topic entity representing a category/tag for problems and solutions.
 * Has a name and a URL-friendly slug.
 */
export interface Topic {
  readonly name: string;
  readonly slug: string;
}

/**
 * Creates a slug from a name (lowercase, hyphens instead of spaces, alphanumeric only).
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Creates a Topic entity.
 * @throws ValidationError if name is empty or whitespace-only
 */
export function createTopic(name: string): Topic {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new ValidationError('Topic name cannot be empty');
  }

  return {
    name: trimmedName,
    slug: generateSlug(trimmedName),
  };
}

/**
 * Checks if two Topics are equal (by slug).
 */
export function topicEquals(a: Topic, b: Topic): boolean {
  return a.slug === b.slug;
}

/**
 * Checks if a topic matches a slug.
 */
export function topicMatchesSlug(topic: Topic, slug: string): boolean {
  return topic.slug === slug;
}