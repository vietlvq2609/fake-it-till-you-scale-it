import { describe, it, expect, beforeEach } from 'vitest';
import { CreateProblemUseCase } from '../../../src/application/use-cases/CreateProblemUseCase';
import { PublishProblemUseCase } from '../../../src/application/use-cases/PublishProblemUseCase';
import { AddSolutionUseCase } from '../../../src/application/use-cases/AddSolutionUseCase';
import { AddRelatedProblemUseCase } from '../../../src/application/use-cases/AddRelatedProblemUseCase';
import { Problem } from '../../../src/domain/entities/Problem';
import { Solution } from '../../../src/domain/entities/Solution';
import { Topic } from '../../../src/domain/entities/Topic';
import { Author } from '../../../src/domain/entities/Author';
import { Tradeoff } from '../../../src/domain/value-objects/Tradeoff';
import { IProblemRepository } from '../../../src/domain/repositories/IProblemRepository';
import { IEventBus } from '../../../src/application/ports/IEventBus';
import { ProblemNotFoundError, EmptySolutionError, ValidationError } from '../../../src/domain/errors';
import { ProblemPublished } from '../../../src/domain/events/ProblemPublished';

// Fake in-memory repository
class FakeProblemRepository implements IProblemRepository {
  private problems: Map<string, Problem> = new Map();

  async findAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }

  async findById(id: string): Promise<Problem | null> {
    return this.problems.get(id) ?? null;
  }

  async findPublished(): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter(p => p.status === 'Published');
  }

  async findByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter(p => p.difficulty === difficulty);
  }

  async findByTopic(topicSlug: string): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter(p =>
      p.topics.some(t => t.slug === topicSlug)
    );
  }

  async findBySolutionTopic(topicSlug: string): Promise<Problem[]> {
    return Array.from(this.problems.values()).filter(p =>
      p.solutions.some(s => s.topics.some(t => t.slug === topicSlug))
    );
  }

  async save(problem: Problem): Promise<void> {
    this.problems.set(problem.id, problem);
  }

  async update(problem: Problem): Promise<void> {
    this.problems.set(problem.id, problem);
  }

  async delete(id: string): Promise<void> {
    this.problems.delete(id);
  }

  addProblem(problem: Problem) {
    this.problems.set(problem.id, problem);
  }
}

// Fake in-memory event bus
class FakeEventBus implements IEventBus {
  public publishedEvents: ProblemPublished[] = [];

  async publish(event: ProblemPublished): Promise<void> {
    this.publishedEvents.push(event);
  }

  subscribe(handler: (event: ProblemPublished) => Promise<void>): void {
    // Not needed for tests
  }

  clear() {
    this.publishedEvents = [];
  }
}

describe('CreateProblemUseCase', () => {
  let repository: FakeProblemRepository;
  let eventBus: FakeEventBus;
  let useCase: CreateProblemUseCase;

  beforeEach(() => {
    repository = new FakeProblemRepository();
    eventBus = new FakeEventBus();
    useCase = new CreateProblemUseCase(repository, eventBus);
  });

  it('should create a new problem with solutions and topics', async () => {
    const result = await useCase.execute({
      id: 'prob-1',
      title: 'URL Shortener',
      prompt: 'Design a URL shortener like bit.ly',
      difficulty: 'Medium',
      topics: ['caching', 'sharding'],
      author: { id: 'author-1', name: 'John Doe' },
      solutions: [
        {
          id: 'sol-1',
          name: 'Redis Cache',
          description: 'Use Redis for caching',
          diagram: 'graph TD; A --> B',
          tradeoffs: [
            { decision: 'Use Redis', advantage: 'Fast', disadvantage: 'Complex' },
          ],
          topics: ['caching'],
        },
      ],
    });

    expect(result.problem.id).toBe('prob-1');
    expect(result.problem.title).toBe('URL Shortener');
    expect(result.problem.status).toBe('Draft');
    expect(result.problem.solutions).toHaveLength(1);
    expect(result.problem.topics).toHaveLength(2);
    expect(result.problem.author.name).toBe('John Doe');
  });

  it('should save problem to repository', async () => {
    await useCase.execute({
      id: 'prob-1',
      title: 'URL Shortener',
      prompt: 'Design a URL shortener',
      difficulty: 'Medium',
      topics: ['caching'],
      author: { id: 'author-1', name: 'John Doe' },
      solutions: [
        {
          id: 'sol-1',
          name: 'Redis Cache',
          description: 'Use Redis',
          diagram: 'graph TD; A --> B',
          tradeoffs: [{ decision: 'Use Redis', advantage: 'Fast', disadvantage: 'Complex' }],
          topics: ['caching'],
        },
      ],
    });

    const saved = await repository.findById('prob-1');
    expect(saved).not.toBeNull();
    expect(saved!.title).toBe('URL Shortener');
  });

  it('should create problem with multiple solutions', async () => {
    const result = await useCase.execute({
      id: 'prob-1',
      title: 'URL Shortener',
      prompt: 'Design a URL shortener',
      difficulty: 'Medium',
      topics: ['caching', 'sharding'],
      author: { id: 'author-1', name: 'John Doe' },
      solutions: [
        {
          id: 'sol-1',
          name: 'Redis Cache',
          description: 'Use Redis',
          diagram: 'graph TD; A --> B',
          tradeoffs: [{ decision: 'Use Redis', advantage: 'Fast', disadvantage: 'Complex' }],
          topics: ['caching'],
        },
        {
          id: 'sol-2',
          name: 'Memcached',
          description: 'Use Memcached',
          diagram: 'graph TD; A --> C',
          tradeoffs: [{ decision: 'Use Memcached', advantage: 'Simple', disadvantage: 'Less features' }],
          topics: ['caching'],
        },
      ],
    });

    expect(result.problem.solutions).toHaveLength(2);
  });
});

describe('PublishProblemUseCase', () => {
  let repository: FakeProblemRepository;
  let eventBus: FakeEventBus;
  let useCase: PublishProblemUseCase;

  let author: Author;
  let topic: Topic;
  let tradeoff: Tradeoff;
  let solution: Solution;
  let draftProblem: Problem;

  beforeEach(() => {
    repository = new FakeProblemRepository();
    eventBus = new FakeEventBus();
    useCase = new PublishProblemUseCase(repository, eventBus);

    author = Author.create('author-1', 'John Doe');
    topic = Topic.create('Caching');
    tradeoff = Tradeoff.create('Use Redis', 'Fast', 'Complex');
    solution = Solution.create({
      id: 'sol-1',
      name: 'Redis Cache',
      description: 'Use Redis',
      diagram: 'graph TD; A --> B',
      tradeoffs: [tradeoff],
      topics: [topic],
    });

    draftProblem = Problem.create({
      id: 'prob-1',
      title: 'URL Shortener',
      prompt: 'Design bit.ly',
      difficulty: 'Medium',
      status: 'Draft',
      solutions: [solution],
      topics: [topic],
      relatedProblems: [],
      author,
    });

    repository.addProblem(draftProblem);
  });

  it('should publish a draft problem', async () => {
    const result = await useCase.execute({ problemId: 'prob-1' });

    expect(result.problem.status).toBe('Published');
    expect(result.problem.id).toBe('prob-1');
  });

  it('should update problem in repository', async () => {
    await useCase.execute({ problemId: 'prob-1' });

    const updated = await repository.findById('prob-1');
    expect(updated!.status).toBe('Published');
  });

  it('should publish ProblemPublished event', async () => {
    await useCase.execute({ problemId: 'prob-1' });

    expect(eventBus.publishedEvents).toHaveLength(1);
    expect(eventBus.publishedEvents[0].type).toBe('ProblemPublished');
    expect(eventBus.publishedEvents[0].payload.problemId).toBe('prob-1');
    expect(eventBus.publishedEvents[0].payload.title).toBe('URL Shortener');
    expect(eventBus.publishedEvents[0].payload.difficulty).toBe('Medium');
    expect(eventBus.publishedEvents[0].payload.topics).toEqual(['caching']);
  });

  it('should return same problem if already published', async () => {
    const publishedProblem = draftProblem.publish();
    repository.addProblem(publishedProblem);

    const result = await useCase.execute({ problemId: 'prob-1' });

    expect(result.problem).toBe(publishedProblem);
    expect(eventBus.publishedEvents).toHaveLength(0); // No event fired
  });

  it('should throw ProblemNotFoundError for unknown problem', async () => {
    await expect(useCase.execute({ problemId: 'unknown' })).rejects.toThrow(ProblemNotFoundError);
  });

  it('should throw EmptySolutionError for problem with no solutions', async () => {
    const emptyProblem = Problem.create({
      id: 'prob-2',
      title: 'Empty Problem',
      prompt: 'No solutions',
      difficulty: 'Easy',
      status: 'Draft',
      solutions: [],
      topics: [topic],
      relatedProblems: [],
      author,
    });
    repository.addProblem(emptyProblem);

    await expect(useCase.execute({ problemId: 'prob-2' })).rejects.toThrow(EmptySolutionError);
  });
});

describe('AddSolutionUseCase', () => {
  let repository: FakeProblemRepository;
  let eventBus: FakeEventBus;
  let useCase: AddSolutionUseCase;

  let author: Author;
  let topic: Topic;
  let tradeoff: Tradeoff;
  let solution: Solution;
  let problem: Problem;

  beforeEach(() => {
    repository = new FakeProblemRepository();
    eventBus = new FakeEventBus();
    useCase = new AddSolutionUseCase(repository, eventBus);

    author = Author.create('author-1', 'John Doe');
    topic = Topic.create('Caching');
    tradeoff = Tradeoff.create('Use Redis', 'Fast', 'Complex');
    solution = Solution.create({
      id: 'sol-1',
      name: 'Redis Cache',
      description: 'Use Redis',
      diagram: 'graph TD; A --> B',
      tradeoffs: [tradeoff],
      topics: [topic],
    });

    problem = Problem.create({
      id: 'prob-1',
      title: 'URL Shortener',
      prompt: 'Design bit.ly',
      difficulty: 'Medium',
      status: 'Draft',
      solutions: [solution],
      topics: [topic],
      relatedProblems: [],
      author,
    });

    repository.addProblem(problem);
  });

  it('should add a solution to a problem', async () => {
    const result = await useCase.execute({
      problemId: 'prob-1',
      solution: {
        id: 'sol-2',
        name: 'Memcached',
        description: 'Use Memcached',
        diagram: 'graph TD; A --> C',
        tradeoffs: [{ decision: 'Use Memcached', advantage: 'Simple', disadvantage: 'Less features' }],
        topics: ['caching'],
      },
    });

    expect(result.problem.solutions).toHaveLength(2);
    expect(result.solution.id).toBe('sol-2');
    expect(result.solution.name).toBe('Memcached');
  });

  it('should update problem in repository', async () => {
    await useCase.execute({
      problemId: 'prob-1',
      solution: {
        id: 'sol-2',
        name: 'Memcached',
        description: 'Use Memcached',
        diagram: 'graph TD; A --> C',
        tradeoffs: [{ decision: 'Use Memcached', advantage: 'Simple', disadvantage: 'Less features' }],
        topics: ['caching'],
      },
    });

    const updated = await repository.findById('prob-1');
    expect(updated!.solutions).toHaveLength(2);
  });

  it('should throw ProblemNotFoundError for unknown problem', async () => {
    await expect(
      useCase.execute({
        problemId: 'unknown',
        solution: {
          id: 'sol-2',
          name: 'Memcached',
          description: 'Use Memcached',
          diagram: 'graph TD; A --> C',
          tradeoffs: [{ decision: 'Use Memcached', advantage: 'Simple', disadvantage: 'Less features' }],
          topics: ['caching'],
        },
      })
    ).rejects.toThrow(ProblemNotFoundError);
  });
});

describe('AddRelatedProblemUseCase', () => {
  let repository: FakeProblemRepository;
  let eventBus: FakeEventBus;
  let useCase: AddRelatedProblemUseCase;

  let author: Author;
  let topic: Topic;
  let tradeoff: Tradeoff;
  let solution: Solution;
  let problem1: Problem;
  let problem2: Problem;

  beforeEach(() => {
    repository = new FakeProblemRepository();
    eventBus = new FakeEventBus();
    useCase = new AddRelatedProblemUseCase(repository, eventBus);

    author = Author.create('author-1', 'John Doe');
    topic = Topic.create('Caching');
    tradeoff = Tradeoff.create('Use Redis', 'Fast', 'Complex');
    solution = Solution.create({
      id: 'sol-1',
      name: 'Redis Cache',
      description: 'Use Redis',
      diagram: 'graph TD; A --> B',
      tradeoffs: [tradeoff],
      topics: [topic],
    });

    problem1 = Problem.create({
      id: 'prob-1',
      title: 'URL Shortener',
      prompt: 'Design bit.ly',
      difficulty: 'Medium',
      status: 'Published',
      solutions: [solution],
      topics: [topic],
      relatedProblems: [],
      author,
    });

    problem2 = Problem.create({
      id: 'prob-2',
      title: 'Rate Limiter',
      prompt: 'Design rate limiter',
      difficulty: 'Hard',
      status: 'Published',
      solutions: [solution],
      topics: [topic],
      relatedProblems: [],
      author,
    });

    repository.addProblem(problem1);
    repository.addProblem(problem2);
  });

  it('should add a related problem', async () => {
    const result = await useCase.execute({
      problemId: 'prob-1',
      relatedProblemId: 'prob-2',
    });

    expect(result.problem.relatedProblems).toHaveLength(1);
    expect(result.problem.relatedProblems[0]).toBe('prob-2');
  });

  it('should update problem in repository', async () => {
    await useCase.execute({
      problemId: 'prob-1',
      relatedProblemId: 'prob-2',
    });

    const updated = await repository.findById('prob-1');
    expect(updated!.relatedProblems).toHaveLength(1);
    expect(updated!.relatedProblems[0]).toBe('prob-2');
  });

  it('should throw ProblemNotFoundError for unknown problem', async () => {
    await expect(
      useCase.execute({ problemId: 'unknown', relatedProblemId: 'prob-2' })
    ).rejects.toThrow(ProblemNotFoundError);
  });

  it('should throw ProblemNotFoundError for unknown related problem', async () => {
    await expect(
      useCase.execute({ problemId: 'prob-1', relatedProblemId: 'unknown' })
    ).rejects.toThrow(ProblemNotFoundError);
  });

  it('should throw ValidationError when relating to self', async () => {
    await expect(
      useCase.execute({ problemId: 'prob-1', relatedProblemId: 'prob-1' })
    ).rejects.toThrow(ValidationError);
  });
});