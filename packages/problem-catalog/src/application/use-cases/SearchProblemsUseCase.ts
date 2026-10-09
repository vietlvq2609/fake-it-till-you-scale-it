import { Problem } from '../../domain/entities/Problem';
import { IProblemRepository } from '../../domain/repositories/IProblemRepository';
import { ProblemCatalogService } from '../../domain/services/ProblemCatalogService';
import { Difficulty, ProblemStatus } from '../../domain/entities/Problem';

export interface SearchProblemsInput {
  query?: string;
  difficulty?: Difficulty;
  topic?: string;
  solutionTopic?: string;
  status?: ProblemStatus;
  page?: number;
  pageSize?: number;
}

export interface SearchProblemsOutput {
  readonly problems: readonly Problem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export class SearchProblemsUseCase {
  constructor(
    private readonly repository: IProblemRepository,
    private readonly catalogService: ProblemCatalogService
  ) {}

  async execute(input: SearchProblemsInput = {}): Promise<SearchProblemsOutput> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;

    let problems: Problem[] = [];
    const status = input.status ?? 'Published';

    if (status === 'Published') {
      problems = await this.repository.findPublished();
    } else {
      problems = await this.repository.findAll();
      problems = problems.filter((p) => p.status === status);
    }

    if (input.query) {
      const queryProblems = await this.catalogService.searchProblems(input.query);
      problems = problems.filter((p) => queryProblems.includes(p));
    }

    if (input.difficulty) {
      problems = problems.filter((p) => p.difficulty === input.difficulty);
    }

    if (input.topic) {
      const topicProblems = await this.catalogService.findProblemsByTopic(input.topic);
      problems = problems.filter((p) => topicProblems.includes(p));
    }

    if (input.solutionTopic) {
      const solutionTopicProblems = await this.catalogService.findProblemsBySolutionPattern(input.solutionTopic);
      problems = problems.filter((p) => solutionTopicProblems.includes(p));
    }

    const total = problems.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedProblems = problems.slice(start, end);

    return {
      problems: paginatedProblems,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}