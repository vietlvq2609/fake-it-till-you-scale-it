import { Problem, Difficulty, ProblemStatus } from '../entities/Problem';
import { Topic } from '../entities/Topic';
import { Solution } from '../entities/Solution';
import { IProblemRepository } from '../repositories/IProblemRepository';
import { ITopicRepository } from '../repositories/ITopicRepository';
import { ProblemNotFoundError, SolutionNotFoundError, TopicNotFoundError } from '../errors';

export class ProblemCatalogService {
  constructor(
    private readonly problemRepo: IProblemRepository,
    private readonly topicRepo: ITopicRepository
  ) {}

  async findProblemsBySolutionPattern(pattern: string): Promise<Problem[]> {
    const regex = new RegExp(pattern, 'i');
    const problems = await this.problemRepo.findAll();
    return problems.filter((problem) =>
      problem.solutions.some(
        (solution) =>
          regex.test(solution.name) ||
          regex.test(solution.description) ||
          regex.test(solution.diagram)
      )
    );
  }

  async findProblemsByTopic(topicSlug: string): Promise<Problem[]> {
    const topic = await this.topicRepo.findBySlug(topicSlug);
    if (!topic) {
      throw new TopicNotFoundError(topicSlug);
    }

    const problems = await this.problemRepo.findAll();
    return problems.filter((problem) => problem.topics.some((t) => t.slug === topicSlug));
  }

  async findProblemsByDifficulty(difficulty: Difficulty): Promise<Problem[]> {
    const problems = await this.problemRepo.findAll();
    return problems.filter((problem) => problem.difficulty === difficulty);
  }

  async getAllTopics(): Promise<Topic[]> {
    return this.topicRepo.findAll();
  }

  async findRelatedProblems(problemId: string): Promise<Problem[]> {
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) {
      throw new ProblemNotFoundError(problemId);
    }

    const related: Problem[] = [];
    for (const id of problem.relatedProblems) {
      const p = await this.problemRepo.findById(id);
      if (p) related.push(p);
    }
    return related;
  }

  async findProblemById(id: string): Promise<Problem> {
    const problem = await this.problemRepo.findById(id);
    if (!problem) {
      throw new ProblemNotFoundError(id);
    }
    return problem;
  }

  async findSolutionById(solutionId: string): Promise<Solution> {
    const problems = await this.problemRepo.findAll();
    for (const problem of problems) {
      const solution = problem.solutions.find((s) => s.id === solutionId);
      if (solution) {
        return solution;
      }
    }
    throw new SolutionNotFoundError(solutionId);
  }

  async getPublishedProblems(): Promise<Problem[]> {
    return this.problemRepo.findPublished();
  }

  async getProblemsByAuthor(authorId: string): Promise<Problem[]> {
    const problems = await this.problemRepo.findAll();
    return problems.filter((p) => p.author.id === authorId);
  }

  async searchProblems(query: string): Promise<Problem[]> {
    const regex = new RegExp(query, 'i');
    const problems = await this.problemRepo.findAll();
    return problems.filter(
      (problem) => regex.test(problem.title) || regex.test(problem.prompt)
    );
  }
}