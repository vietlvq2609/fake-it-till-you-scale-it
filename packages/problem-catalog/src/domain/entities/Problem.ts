import { ValidationError } from '../errors';
import { Solution } from './Solution';
import { Topic } from './Topic';
import { Author } from './Author';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatus = 'Draft' | 'Published' | 'Archived';

export interface ProblemProps {
  id: string;
  title: string;
  prompt: string;
  difficulty: Difficulty;
  status: ProblemStatus;
  solutions: Solution[];
  topics: Topic[];
  relatedProblems: string[];
  author: Author;
  createdAt: Date;
  updatedAt: Date;
}

function validateDifficulty(difficulty: string): Difficulty {
  const valid: Difficulty[] = ['Easy', 'Medium', 'Hard'];
  if (!valid.includes(difficulty as Difficulty)) {
    throw new ValidationError(`Invalid difficulty: ${difficulty}. Must be one of: ${valid.join(', ')}`);
  }
  return difficulty as Difficulty;
}

function validateStatus(status: string): ProblemStatus {
  const valid: ProblemStatus[] = ['Draft', 'Published', 'Archived'];
  if (!valid.includes(status as ProblemStatus)) {
    throw new ValidationError(`Invalid status: ${status}. Must be one of: ${valid.join(', ')}`);
  }
  return status as ProblemStatus;
}

export class Problem {
  readonly id: string;
  readonly title: string;
  readonly prompt: string;
  readonly difficulty: Difficulty;
  readonly status: ProblemStatus;
  readonly solutions: Solution[];
  readonly topics: Topic[];
  readonly relatedProblems: string[];
  readonly author: Author;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: ProblemProps) {
    this.id = props.id;
    this.title = props.title;
    this.prompt = props.prompt;
    this.difficulty = props.difficulty;
    this.status = props.status;
    this.solutions = [...props.solutions];
    this.topics = [...props.topics];
    this.relatedProblems = [...props.relatedProblems];
    this.author = props.author;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<ProblemProps, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }): Problem {
    const trimmedTitle = props.title.trim();
    const trimmedPrompt = props.prompt.trim();

    if (!trimmedTitle) {
      throw new ValidationError('Problem title cannot be empty');
    }
    if (!trimmedPrompt) {
      throw new ValidationError('Problem prompt cannot be empty');
    }
    if (!props.id || !props.id.trim()) {
      throw new ValidationError('Problem id cannot be empty');
    }
    if (props.topics.length === 0) {
      throw new ValidationError('Problem must have at least one topic');
    }
    if (props.status === 'Published' && props.solutions.length === 0) {
      throw new ValidationError(`Cannot publish problem ${props.id}: must have at least one solution`);
    }

    validateDifficulty(props.difficulty);
    validateStatus(props.status);

    // Check duplicate solutions
    const solutionIds = new Set(props.solutions.map(s => s.id));
    if (solutionIds.size !== props.solutions.length) {
      throw new ValidationError('Duplicate solutions are not allowed');
    }

    // Check duplicate topics
    const topicSlugs = new Set(props.topics.map(t => t.slug));
    if (topicSlugs.size !== props.topics.length) {
      throw new ValidationError('Duplicate topics are not allowed');
    }

    // Check duplicate related problems
    const relatedSet = new Set(props.relatedProblems);
    if (relatedSet.size !== props.relatedProblems.length) {
      throw new ValidationError('Duplicate related problems are not allowed');
    }

    if (!props.author) {
      throw new ValidationError('Problem must have an author');
    }

    return new Problem({
      ...props,
      id: props.id.trim(),
      title: trimmedTitle,
      prompt: trimmedPrompt,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  equals(other: Problem): boolean {
    return this.id === other.id;
  }

  publish(): Problem {
    if (this.solutions.length === 0) {
      throw new ValidationError(`Cannot publish problem ${this.id}: must have at least one solution`);
    }
    if (this.status === 'Published') {
      return this;
    }
    return new Problem({ ...this, status: 'Published', updatedAt: new Date() });
  }

  archive(): Problem {
    if (this.status === 'Archived') {
      return this;
    }
    return new Problem({ ...this, status: 'Archived', updatedAt: new Date() });
  }

  addSolution(solution: Solution): Problem {
    if (this.solutions.some(s => s.id === solution.id)) {
      throw new ValidationError('Solution already exists in problem');
    }
    return new Problem({
      ...this,
      solutions: [...this.solutions, solution],
      updatedAt: new Date(),
    });
  }

  addTopic(topic: Topic): Problem {
    if (this.topics.some(t => t.slug === topic.slug)) {
      throw new ValidationError('Topic already exists in problem');
    }
    return new Problem({
      ...this,
      topics: [...this.topics, topic],
      updatedAt: new Date(),
    });
  }

  addRelatedProblem(relatedProblemId: string): Problem {
    if (relatedProblemId === this.id) {
      throw new ValidationError('Problem cannot be related to itself');
    }
    if (this.relatedProblems.includes(relatedProblemId)) {
      throw new ValidationError('Related problem already exists');
    }
    return new Problem({
      ...this,
      relatedProblems: [...this.relatedProblems, relatedProblemId],
      updatedAt: new Date(),
    });
  }

  updateTitle(title: string): Problem {
    const trimmed = title.trim();
    if (!trimmed) {
      throw new ValidationError('Problem title cannot be empty');
    }
    if (trimmed === this.title) {
      return this;
    }
    return new Problem({ ...this, title: trimmed, updatedAt: new Date() });
  }

  updatePrompt(prompt: string): Problem {
    const trimmed = prompt.trim();
    if (!trimmed) {
      throw new ValidationError('Problem prompt cannot be empty');
    }
    if (trimmed === this.prompt) {
      return this;
    }
    return new Problem({ ...this, prompt: trimmed, updatedAt: new Date() });
  }

  updateDifficulty(difficulty: Difficulty): Problem {
    validateDifficulty(difficulty);
    if (difficulty === this.difficulty) {
      return this;
    }
    return new Problem({ ...this, difficulty, updatedAt: new Date() });
  }
}