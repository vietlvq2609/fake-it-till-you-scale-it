import { ValidationError } from '../errors';

export interface AuthorProps {
  id: string;
  name: string;
  bio: string | null;
}

export class Author {
  readonly id: string;
  readonly name: string;
  readonly bio: string | null;

  private constructor(props: AuthorProps) {
    this.id = props.id;
    this.name = props.name;
    this.bio = props.bio;
  }

  static create(id: string, name: string, bio: string | null = null): Author {
    const trimmedName = name.trim();
    const trimmedId = id.trim();
    const trimmedBio = bio?.trim();

    if (!trimmedName) {
      throw new ValidationError('Author name cannot be empty');
    }
    if (!trimmedId) {
      throw new ValidationError('Author id cannot be empty');
    }

    return new Author({
      id: trimmedId,
      name: trimmedName,
      bio: trimmedBio && trimmedBio.length > 0 ? trimmedBio : null,
    });
  }

  equals(other: Author): boolean {
    return this.id === other.id;
  }
}