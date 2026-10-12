import { Problem, Solution, Topic } from '../../domain/entities';
import { Tradeoff } from '../../domain/value-objects/Tradeoff';
import { IProblemRepository } from '../../domain/repositories/IProblemRepository';
import { IEventBus } from '../ports/IEventBus';
import { ProblemNotFoundError } from '../../domain/errors';

export interface AddSolutionInput {
  readonly problemId: string;
  readonly solution: {
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
  };
}

export interface AddSolutionOutput {
  readonly problem: Problem;
  readonly solution: Solution;
}

export class AddSolutionUseCase {
  constructor(
    private readonly repository: IProblemRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(input: AddSolutionInput): Promise<AddSolutionOutput> {
    const problem = await this.repository.findById(input.problemId);

    if (!problem) {
      throw new ProblemNotFoundError(input.problemId);
    }

    // Build solution
    const tradeoffs = input.solution.tradeoffs.map(t =>
      Tradeoff.create(t.decision, t.advantage, t.disadvantage)
    );
    const topics = input.solution.topics.map(name => Topic.create(name));

    const solution = Solution.create({
      id: input.solution.id,
      name: input.solution.name,
      description: input.solution.description,
      diagram: input.solution.diagram,
      tradeoffs,
      topics,
    });

    const updatedProblem = problem.addSolution(solution);
    await this.repository.update(updatedProblem);

    return { problem: updatedProblem, solution };
  }
}