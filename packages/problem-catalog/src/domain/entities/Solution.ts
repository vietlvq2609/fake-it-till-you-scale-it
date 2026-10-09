import { ValidationError, EmptyTradeoffError } from '../errors';
import { Tradeoff } from '../value-objects/Tradeoff';
import { Topic } from './Topic';

export interface SolutionProps {
  id: string;
  name: string;
  description: string;
  diagram: string;
  tradeoffs: Tradeoff[];
  topics?: Topic[];
}

export class Solution {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly diagram: string;
  readonly tradeoffs: Tradeoff[];
  readonly topics: Topic[];

  private constructor(props: SolutionProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.diagram = props.diagram;
    this.tradeoffs = [...props.tradeoffs];
    this.topics = [...(props.topics ?? [])];
  }

  static create(props: SolutionProps): Solution {
    const trimmedName = props.name.trim();
    const trimmedDescription = props.description.trim();
    const trimmedDiagram = props.diagram.trim();

    if (!trimmedName) {
      throw new ValidationError('Solution name cannot be empty');
    }
    if (!trimmedDescription) {
      throw new ValidationError('Solution description cannot be empty');
    }
    if (!trimmedDiagram) {
      throw new ValidationError('Solution diagram cannot be empty');
    }
    if (!props.id || !props.id.trim()) {
      throw new ValidationError('Solution id cannot be empty');
    }
    if (props.tradeoffs.length === 0) {
      throw new EmptyTradeoffError(props.id);
    }

    // Check duplicate tradeoffs
    for (let i = 0; i < props.tradeoffs.length; i++) {
      for (let j = i + 1; j < props.tradeoffs.length; j++) {
        if (props.tradeoffs[i].equals(props.tradeoffs[j])) {
          throw new ValidationError('Duplicate tradeoffs are not allowed');
        }
      }
    }

    // Check duplicate topics
    const topics = props.topics ?? [];
    const topicSlugs = new Set(topics.map(t => t.slug));
    if (topicSlugs.size !== topics.length) {
      throw new ValidationError('Duplicate topics are not allowed');
    }

    return new Solution({
      ...props,
      id: props.id.trim(),
      name: trimmedName,
      description: trimmedDescription,
      diagram: trimmedDiagram,
      topics,
    });
  }

  equals(other: Solution): boolean {
    return this.id === other.id;
  }

  addTradeoff(tradeoff: Tradeoff): Solution {
    if (this.tradeoffs.some(t => t.equals(tradeoff))) {
      throw new ValidationError('Tradeoff already exists in solution');
    }
    return new Solution({
      ...this,
      tradeoffs: [...this.tradeoffs, tradeoff],
    });
  }

  addTopic(topic: Topic): Solution {
    if (this.topics.some(t => t.slug === topic.slug)) {
      throw new ValidationError('Topic already exists in solution');
    }
    return new Solution({
      ...this,
      topics: [...this.topics, topic],
    });
  }
}