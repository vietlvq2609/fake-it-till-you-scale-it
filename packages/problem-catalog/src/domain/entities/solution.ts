import { ValidationError, EmptyTradeoffError } from '../errors';
import { Tradeoff, createTradeoff, tradeoffEquals } from '../value-objects/tradeoff';
import { Topic, topicEquals } from './topic';

/**
 * Solution entity representing a solution to a problem.
 * Contains a name, description, Mermaid diagram, tradeoffs, and topics.
 */
export interface Solution {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly diagram: string;
  readonly tradeoffs: readonly Tradeoff[];
  readonly topics: readonly Topic[];
}

/**
 * Creates a Solution entity.
 * @throws ValidationError if name, description, or diagram is empty
 * @throws EmptyTradeoffError if tradeoffs array is empty
 */
export function createSolution(
  id: string,
  name: string,
  description: string,
  diagram: string,
  tradeoffs: readonly Tradeoff[],
  topics: readonly Topic[] = []
): Solution {
  const trimmedName = name.trim();
  const trimmedDescription = description.trim();
  const trimmedDiagram = diagram.trim();

  if (!trimmedName) {
    throw new ValidationError('Solution name cannot be empty');
  }
  if (!trimmedDescription) {
    throw new ValidationError('Solution description cannot be empty');
  }
  if (!trimmedDiagram) {
    throw new ValidationError('Solution diagram cannot be empty');
  }
  if (!id || !id.trim()) {
    throw new ValidationError('Solution id cannot be empty');
  }
  if (tradeoffs.length === 0) {
    throw new EmptyTradeoffError(id);
  }

  // Validate tradeoffs are unique (by value equality)
  for (let i = 0; i < tradeoffs.length; i++) {
    for (let j = i + 1; j < tradeoffs.length; j++) {
      if (tradeoffEquals(tradeoffs[i], tradeoffs[j])) {
        throw new ValidationError('Duplicate tradeoffs are not allowed');
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

  return {
    id: id.trim(),
    name: trimmedName,
    description: trimmedDescription,
    diagram: trimmedDiagram,
    tradeoffs: [...tradeoffs],
    topics: [...topics],
  };
}

/**
 * Checks if two Solutions are equal (by id).
 */
export function solutionEquals(a: Solution, b: Solution): boolean {
  return a.id === b.id;
}

/**
 * Creates a tradeoff and adds it to a solution (returns new solution).
 */
export function addTradeoffToSolution(solution: Solution, tradeoff: Tradeoff): Solution {
  // Check for duplicate
  for (const existing of solution.tradeoffs) {
    if (tradeoffEquals(existing, tradeoff)) {
      throw new ValidationError('Tradeoff already exists in solution');
    }
  }

  return {
    ...solution,
    tradeoffs: [...solution.tradeoffs, tradeoff],
  };
}

/**
 * Adds a topic to a solution (returns new solution).
 */
export function addTopicToSolution(solution: Solution, topic: Topic): Solution {
  // Check for duplicate
  for (const existing of solution.topics) {
    if (topicEquals(existing, topic)) {
      throw new ValidationError('Topic already exists in solution');
    }
  }

  return {
    ...solution,
    topics: [...solution.topics, topic],
  };
}