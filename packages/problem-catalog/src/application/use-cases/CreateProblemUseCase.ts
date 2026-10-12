import { Problem } from '../../domain/entities/Problem';
import { Solution } from '../../domain/entities/Solution';
import { Topic } from '../../domain/entities/Topic';
import { Author } from '../../domain/entities/Author';
import { Tradeoff } from '../../domain/value-objects/Tradeoff';
import { IProblemRepository } from '../../domain/repositories/IProblemRepository';
import { IEventBus } from '../ports/IEventBus';

export interface CreateProblemInput {
  readonly id: string;
  readonly title: string;
  readonly prompt: string;
  readonly difficulty: 'Easy' | 'Medium' | 'Hard';
  readonly solutions: Array<{
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly diagram: string;
    readonly tradeoffs: Array<{
      readonly decision: string;
      readonly advantage: string;
      readonly disadvantage: string;
    }>;
    readonly topics: string[];
  }>;
  readonly topics: string[];
  readonly author: {
    readonly id: string;
    readonly name: string;
    readonly bio?: string;
  };
}

export interface CreateProblemOutput {
  readonly problem: Problem;
}

export class CreateProblemUseCase {
  constructor(
    private readonly repository: IProblemRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(input: CreateProblemInput): Promise<CreateProblemOutput> {
    // Build topics
    const topics = input.topics.map(name => Topic.create(name));

    // Build solutions
    const solutions = input.solutions.map(s => {
      const tradeoffs = s.tradeoffs.map(t =>
        Tradeoff.create(t.decision, t.advantage, t.disadvantage)
      );
      const solutionTopics = s.topics.map(name => Topic.create(name));
      return Solution.create({
        id: s.id,
        name: s.name,
        description: s.description,
        diagram: s.diagram,
        tradeoffs,
        topics: solutionTopics,
      });
    });

    // Build author
    const author = Author.create(input.author.id, input.author.name, input.author.bio ?? null);

    // Create problem
    const problem = Problem.create({
      id: input.id,
      title: input.title,
      prompt: input.prompt,
      difficulty: input.difficulty,
      status: 'Draft',
      solutions,
      topics,
      relatedProblems: [],
      author,
    });

    await this.repository.save(problem);

    return { problem };
  }
}