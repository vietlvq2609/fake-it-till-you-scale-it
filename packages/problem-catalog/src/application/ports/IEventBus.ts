import { ProblemPublished } from '../../domain/events/ProblemPublished';

export interface IEventBus {
  publish(event: ProblemPublished): Promise<void>;
  subscribe(handler: (event: ProblemPublished) => Promise<void>): void;
}