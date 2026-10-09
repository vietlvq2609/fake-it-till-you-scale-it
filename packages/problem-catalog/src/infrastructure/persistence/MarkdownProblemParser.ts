import { Problem, Difficulty, ProblemStatus } from '../../domain/entities/Problem';
import { Solution } from '../../domain/entities/Solution';
import { Topic } from '../../domain/entities/Topic';
import { Author } from '../../domain/entities/Author';
import { Tradeoff } from '../../domain/value-objects/Tradeoff';

export interface ParsedProblem {
  id: string;
  title: string;
  prompt: string;
  difficulty: Difficulty;
  status: ProblemStatus;
  solutions: ParsedSolution[];
  topics: string[];
  relatedProblems: string[];
  author: { id: string; name: string; bio?: string };
  createdAt: string;
  updatedAt: string;
}

export interface ParsedSolution {
  id: string;
  name: string;
  description: string;
  diagram: string;
  tradeoffs: ParsedTradeoff[];
  topics: string[];
}

export interface ParsedTradeoff {
  decision: string;
  advantage: string;
  disadvantage: string;
}

function parseFrontmatter(content: string): { data: Record<string, unknown>; body: string } {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return { data: {}, body: content };
  }

  const yaml = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length).trim();

  // Simple YAML parser for our use case
  const data: Record<string, unknown> = {};
  const lines = yaml.split('\n');
  let currentKey: string | null = null;
  let currentArray: string[] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('- ')) {
      if (currentKey && currentArray !== null) {
        currentArray.push(trimmed.slice(2).trim());
      }
    } else if (trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();
      currentKey = key.trim();

      if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array
        const arr = value.slice(1, -1).split(',').map(v => v.trim());
        data[currentKey] = arr;
      } else if (value === '') {
        // Array starts
        currentArray = [];
        data[currentKey] = currentArray;
      } else {
        // Simple value
        currentArray = null;
        data[currentKey] = value.replace(/^["']|["']$/g, '');
      }
    }
  }

  return { data, body };
}

export class MarkdownProblemParser {
  parse(content: string, filePath: string): Problem {
    const { data } = parseFrontmatter(content);

    const id = (data.id as string) ?? filePath;
    const title = data.title as string;
    const prompt = data.prompt as string;
    const difficulty = data.difficulty as Difficulty;
    const status = data.status as ProblemStatus;

    const solutions = (data.solutions as ParsedSolution[])?.map(s => this.parseSolution(s)) ?? [];
    const topicNames = (data.topics as string[]) ?? [];
    const topics = topicNames.map(name => Topic.create(name));
    const relatedProblems = (data.relatedProblems as string[]) ?? [];

    const authorData = data.author as { id: string; name: string; bio?: string };
    const author = Author.create(authorData.id, authorData.name, authorData.bio ?? null);

    const createdAt = data.createdAt ? new Date(data.createdAt as string) : new Date();
    const updatedAt = data.updatedAt ? new Date(data.updatedAt as string) : new Date();

    return Problem.create({
      id,
      title,
      prompt,
      difficulty,
      status,
      solutions,
      topics,
      relatedProblems,
      author,
      createdAt,
      updatedAt,
    });
  }

  private parseSolution(s: ParsedSolution): Solution {
    const tradeoffs = s.tradeoffs.map(t =>
      Tradeoff.create(t.decision, t.advantage, t.disadvantage)
    );
    const topics = (s.topics ?? []).map(name => Topic.create(name));

    return Solution.create({
      id: s.id,
      name: s.name,
      description: s.description,
      diagram: s.diagram,
      tradeoffs,
      topics,
    });
  }
}