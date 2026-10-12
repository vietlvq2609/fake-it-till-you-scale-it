import { IEventBus } from '../../application/ports/IEventBus';
import { ProblemPublished } from '../../domain/events/ProblemPublished';

export class InMemoryEventBus implements IEventBus {
  private handlers: Array<(event: ProblemPublished) => Promise<void>> = [];
  public publishedEvents: ProblemPublished[] = [];

  async publish(event: ProblemPublished): Promise<void> {
    this.publishedEvents.push(event);
    await Promise.all(this.handlers.map(handler => handler(event)));
  }

  subscribe(handler: (event: ProblemPublished) => Promise<void>): void {
    this.handlers.push(handler);
  }

  // Test helper
  clear() {
    this.publishedEvents = [];
  }
}