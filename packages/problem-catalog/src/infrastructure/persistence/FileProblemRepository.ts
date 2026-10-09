import { IFileStorage } from '../../application/ports/IFileStorage';
import { IProblemRepository } from '../../domain/repositories/IProblemRepository';
import { Problem, Difficulty, ProblemStatus } from '../../domain/entities/Problem';
import { Solution, Topic } from '../../domain/entities';
import { MarkdownProblemParser } from './MarkdownProblemParser';

export class FileProblemRepository implements IProblemRepository {
  private problems: Map<string, Problem> = new Map();
  private initialized = false;

  constructor(
    private readonly fileStorage: IFileStorage,
    private readonly parser: MarkdownProblemParser,
    private readonly problemsDir: string = 'content/problems'
  ) {}

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    const files = await this.fileStorage.readDirectory(this.problemsDir);
    const markdownFiles = files.filter(f => f.endsWith('.md'));

    for (const file of markdownFiles) {
      const filePath = `${this.problemsDir}/${file}`;
      const content = await this.fileStorage.readFile(filePath);
      const problem = this.parser.parse(content, filePath);
      this.problems.set(problem.id, problem);
    }

    this.initialized = true;
  }

  async findAll(): Promise<Problem[]> {
    await this.ensureInitialized();
    return Array.from(this.problems.values());
  }

  async findById(id: string): Promise<Problem | null> {
    await this.ensureInitialized();
    return this.problems.get(id) ?? null;
  }

  async findPublished(): Promise<Problem[]> {
    await this.ensureInitialized();
    return Array.from(this.problems.values()).filter(p => p.status === 'Published');
  }

  async findByDifficulty(difficulty: Difficulty): Promise<Problem[]> {
    await this.ensureInitialized();
    return Array.from(this.problems.values()).filter(p => p.difficulty === difficulty);
  }

  async findByTopic(topicSlug: string): Promise<Problem[]> {
    await this.ensureInitialized();
    return Array.from(this.problems.values()).filter(p =>
      p.topics.some((t: Topic) => t.slug === topicSlug)
    );
  }

  async findBySolutionTopic(topicSlug: string): Promise<Problem[]> {
    await this.ensureInitialized();
    return Array.from(this.problems.values()).filter(p =>
      p.solutions.some((s: Solution) => s.topics.some((t: Topic) => t.slug === topicSlug))
    );
  }

  async save(problem: Problem): Promise<void> {
    await this.ensureInitialized();
    this.problems.set(problem.id, problem);
    await this.persistProblem(problem);
  }

  async update(problem: Problem): Promise<void> {
    await this.ensureInitialized();
    if (!this.problems.has(problem.id)) {
      throw new Error(`Problem ${problem.id} not found`);
    }
    this.problems.set(problem.id, problem);
    await this.persistProblem(problem);
  }

  async delete(id: string): Promise<void> {
    await this.ensureInitialized();
    this.problems.delete(id);
    const filePath = `${this.problemsDir}/${id}.md`;
    if (await this.fileStorage.fileExists(filePath)) {
      // Note: IFileStorage doesn't have delete, so we'd need to add it
      // For now, we just remove from memory
    }
  }

  private async persistProblem(problem: Problem): Promise<void> {
    const filePath = `${this.problemsDir}/${problem.id}.md`;
    const content = this.serializeProblem(problem);
    await this.fileStorage.writeFile(filePath, content);
  }

  private serializeProblem(problem: Problem): string {
    const lines: string[] = [
      '---',
      `id: "${problem.id}"`,
      `title: "${problem.title}"`,
      `prompt: "${problem.prompt.replace(/"/g, '\\"')}"`,
      `difficulty: ${problem.difficulty}`,
      `status: ${problem.status}`,
      'solutions:',
    ];

    for (const solution of problem.solutions) {
      lines.push('  - id: ' + solution.id);
      lines.push('    name: "' + solution.name + '"');
      lines.push('    description: "' + solution.description.replace(/"/g, '\\"') + '"');
      lines.push('    diagram: "' + solution.diagram.replace(/"/g, '\\"') + '"');
      lines.push('    tradeoffs:');
      for (const tradeoff of solution.tradeoffs) {
        lines.push('      - decision: "' + tradeoff.decision.replace(/"/g, '\\"') + '"');
        lines.push('        advantage: "' + tradeoff.advantage.replace(/"/g, '\\"') + '"');
        lines.push('        disadvantage: "' + tradeoff.disadvantage.replace(/"/g, '\\"') + '"');
      }
      lines.push('    topics: [' + solution.topics.map((t: Topic) => '"' + t.name + '"').join(', ') + ']');
    }

    lines.push('topics: [' + problem.topics.map((t: Topic) => '"' + t.name + '"').join(', ') + ']');
    lines.push('relatedProblems: [' + problem.relatedProblems.map((id: string) => '"' + id + '"').join(', ') + ']');
    lines.push('author:');
    lines.push('  id: "' + problem.author.id + '"');
    lines.push('  name: "' + problem.author.name + '"');
    if (problem.author.bio) {
      lines.push('  bio: "' + problem.author.bio.replace(/"/g, '\\"') + '"');
    }
    lines.push('createdAt: "' + problem.createdAt.toISOString() + '"');
    lines.push('updatedAt: "' + problem.updatedAt.toISOString() + '"');
    lines.push('---');
    lines.push('');

    return lines.join('\n');
  }
}