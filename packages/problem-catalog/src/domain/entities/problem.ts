import { ValidationError, EmptySolutionError } from '../errors';
import { Solution, solutionEquals } from './solution';
import { Topic, topicEquals } from './topic';
import { Author, authorEquals } from './author';

/**
 * Problem difficulty levels.
 */
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/**
 * Problem status.
 */
export type ProblemStatus = 'Draft' | 'Published' | 'Archived';

/**
 * Problem entity representing a system design problem.
 */
export interface Problem {
  readonly id: string;
  readonly title: string;
  readonly prompt: string;
  readonly difficulty: Difficulty;
  readonly status: ProblemStatus;
  readonly solutions: readonly Solution[];
  readonly topics: readonly Topic[];
  readonly relatedProblems: readonly string[]; // Problem IDs
  readonly author: Author;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Validates difficulty value.
 */
function validateDifficulty(difficulty: string): Difficulty {
  const validDifficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
  if (!validDifficulties.includes(difficulty as Difficulty)) {
    throw new ValidationError(`Invalid difficulty: ${difficulty}. Must be one of: ${validDifficulties.join(', ')}`);
  }
  return difficulty as Difficulty;
}

/**
 * Validates status value.
 */
function validateStatus(status: string): ProblemStatus {
  const validStatuses: ProblemStatus[] = ['Draft', 'Published', 'Archived'];
  if (!validStatuses.includes(status as ProblemStatus)) {
    throw new ValidationError(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }
  return status as ProblemStatus;
}

/**
 * Creates a Problem entity.
 * @throws ValidationError if validation fails
 * @throws EmptySolutionError if trying to publish a problem with no solutions
 */
export function createProblem(
  id: string,
  title: string,
  prompt: string,
  difficulty: Difficulty,
  status: ProblemStatus,
  solutions: readonly Solution[],
  topics: readonly Topic[],
  relatedProblems: readonly string[],
  author: Author,
  createdAt: Date = new Date(),
  updatedAt: Date = new Date()
): Problem {
  const trimmedTitle = title.trim();
  const trimmedPrompt = prompt.trim();

  if (!trimmedTitle) {
    throw new ValidationError('Problem title cannot be empty');
  }
  if (!trimmedPrompt) {
    throw new ValidationError('Problem prompt cannot be empty');
  }
  if (!id || !id.trim()) {
    throw new ValidationError('Problem id cannot be empty');
  }
  if (topics.length === 0) {
    throw new ValidationError('Problem must have at least one topic');
  }
  if (status === 'Published' && solutions.length === 0) {
    throw new EmptySolutionError(id);
  }

  // Validate difficulty and status
  validateDifficulty(difficulty);
  validateStatus(status);

  // Validate solutions are unique (by id)
  for (let i = 0; i < solutions.length; i++) {
    for (let j = i + 1; j < solutions.length; j++) {
      if (solutionEquals(solutions[i], solutions[j])) {
        throw new ValidationError('Duplicate solutions are not allowed');
      }
    }
  }

  // Validate topics are unique (by slug)
  for (let i = 0; i < topics.length; i++) {
    for (let j = i + 1; j < topics.length; j++) {
      if (topicEquals(topics[i], topics[j])) {
        throw new ValidationError('Duplicate topics are not allowed');
      }
    }
  }

  // Validate related problems are unique
  const relatedSet = new Set(relatedProblems);
  if (relatedSet.size !== relatedProblems.length) {
    throw new ValidationError('Duplicate related problems are not allowed');
  }

  // Validate author
  if (!author) {
    throw new ValidationError('Problem must have an author');
  }

  return {
    id: id.trim(),
    title: trimmedTitle,
    prompt: trimmedPrompt,
    difficulty,
    status,
    solutions: [...solutions],
    topics: [...topics],
    relatedProblems: [...relatedProblems],
    author,
    createdAt,
    updatedAt,
  };
}

/**
 * Checks if two Problems are equal (by id).
 */
export function problemEquals(a: Problem, b: Problem): boolean {
  return a.id === b.id;
}

/**
 * Publishes a problem (returns new problem with Published status).
 * @throws EmptySolutionError if problem has no solutions
 */
export function publishProblem(problem: Problem): Problem {
  if (problem.solutions.length === 0) {
    throw new EmptySolutionError(problem.id);
  }
  if (problem.status === 'Published') {
    return problem;
  }

  return {
    ...problem,
    status: 'Published',
    updatedAt: new Date(),
  };
}

/**
 * Archives a problem (returns new problem with Archived status).
 */
export function archiveProblem(problem: Problem): Problem {
  if (problem.status === 'Archived') {
    return problem;
  }

  return {
    ...problem,
    status: 'Archived',
    updatedAt: new Date(),
  };
}

/**
 * Adds a solution to a problem (returns new problem).
 */
export function addSolutionToProblem(problem: Problem, solution: Solution): Problem {
  // Check for duplicate
  for (const existing of problem.solutions) {
    if (solutionEquals(existing, solution)) {
      throw new ValidationError('Solution already exists in problem');
    }
  }

  return {
    ...problem,
    solutions: [...problem.solutions, solution],
    updatedAt: new Date(),
  };
}

/**
 * Adds a topic to a problem (returns new problem).
 */
export function addTopicToProblem(problem: Problem, topic: Topic): Problem {
  // Check for duplicate
  for (const existing of problem.topics) {
    if (topicEquals(existing, topic)) {
      throw new ValidationError('Topic already exists in problem');
    }
  }

  return {
    ...problem,
    topics: [...problem.topics, topic],
    updatedAt: new Date(),
  };
}

/**
 * Adds a related problem (returns new problem).
 */
export function addRelatedProblem(problem: Problem, relatedProblemId: string): Problem {
  if (relatedProblemId === problem.id) {
    throw new ValidationError('Problem cannot be related to itself');
  }

  // Check for duplicate
  if (problem.relatedProblems.includes(relatedProblemId)) {
    throw new ValidationError('Related problem already exists');
  }

  return {
    ...problem,
    relatedProblems: [...problem.relatedProblems, relatedProblemId],
    updatedAt: new Date(),
  };
}

/**
 * Updates problem title (returns new problem).
 */
export function updateProblemTitle(problem: Problem, title: string): Problem {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new ValidationError('Problem title cannot be empty');
  }
  if (trimmedTitle === problem.title) {
    return problem;
  }

  return {
    ...problem,
    title: trimmedTitle,
    updatedAt: new Date(),
  };
}

/**
 * Updates problem prompt (returns new problem).
 */
export function updateProblemPrompt(problem: Problem, prompt: string): Problem {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new ValidationError('Problem prompt cannot be empty');
  }
  if (trimmedPrompt === problem.prompt) {
    return problem;
  }

  return {
    ...problem,
    prompt: trimmedPrompt,
    updatedAt: new Date(),
  };
}

/**
 * Updates problem difficulty (returns new problem).
 */
export function updateProblemDifficulty(problem: Problem, difficulty: Difficulty): Problem {
  validateDifficulty(difficulty);
  if (difficulty === problem.difficulty) {
    return problem;
  }

  return {
    ...problem,
    difficulty,
    updatedAt: new Date(),
  };
}