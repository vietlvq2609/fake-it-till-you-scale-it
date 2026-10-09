import { DomainError } from './DomainError';

export class TopicNotFoundError extends DomainError {
  readonly topicName: string;

  constructor(topicName: string) {
    super(`Topic not found: ${topicName}`);
    this.topicName = topicName;
  }
}