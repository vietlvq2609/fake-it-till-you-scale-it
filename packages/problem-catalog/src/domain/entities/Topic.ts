import { ValidationError } from '../errors';

export interface TopicProps {
  name: string;
  slug: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class Topic {
  readonly name: string;
  readonly slug: string;

  private constructor(props: TopicProps) {
    this.name = props.name;
    this.slug = props.slug;
  }

  static create(name: string): Topic {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new ValidationError('Topic name cannot be empty');
    }
    return new Topic({ name: trimmed, slug: generateSlug(trimmed) });
  }

  equals(other: Topic): boolean {
    return this.slug === other.slug;
  }

  matchesSlug(slug: string): boolean {
    return this.slug === slug;
  }
}