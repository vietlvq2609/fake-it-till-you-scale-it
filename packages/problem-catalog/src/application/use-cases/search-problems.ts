import { IProblemCatalogRepository } from '../ports';
import { Problem, Difficulty, ProblemStatus } from '../../domain/entities/problem';
import { AsyncProblemCatalogService } from '../../domain/services/problem-catalog-service';

/**
 * Input for SearchProblemsUseCase.
 */
export interface SearchProblemsInput {
  /** Free-text search query (searches title and prompt) */
  query?: string;
  /** Filter by difficulty */
  difficulty?: Difficulty;
  /** Filter by topic slug */
  topic?: string;
  /** Filter by status (default: Published only) */
  status?: ProblemStatus;
  /** Filter by solution topic */
  solutionTopic?: string;
  /** Page number (1-indexed) */
  page?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Output from SearchProblemsUseCase.
 */
export interface SearchProblemsOutput {
  readonly problems: readonly Problem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

/**
 * Use case for searching problems with various filters and pagination.
 */
export class SearchProblemsUseCase {
  constructor(
    private readonly repository: IProblemCatalogRepository,
    private readonly catalogService: AsyncProblemCatalogService
  ) {}

  /**
   * Executes the search with the given input parameters.
   */
  async execute(input: SearchProblemsInput = {}): Promise<SearchProblemsOutput> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;

    // Start with all problems (or published if no status specified)
    let problems: Problem[] = [];
    const status = input.status ?? 'Published';

    if (status === 'Published') {
      problems = await this.repository.findPublished();
    } else {
      problems = await this.repository.findAll();
      problems = problems.filter((p) => p.status === status);
    }

    // Apply filters using catalog service
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