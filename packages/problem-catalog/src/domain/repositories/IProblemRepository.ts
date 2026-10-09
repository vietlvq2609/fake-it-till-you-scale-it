import { Problem } from '../entities/Problem';
import { Difficulty, ProblemStatus } from '../entities/Problem';

export interface IProblemRepository {
  findAll(): Promise<Problem[]>;
  findById(id: string): Promise<Problem | null>;
  findPublished(): Promise<Problem[]>;
  findByDifficulty(difficulty: Difficulty): Promise<Problem[]>;
  findByTopic(topicSlug: string): Promise<Problem[]>;
  findBySolutionTopic(topicSlug: string): Promise<Problem[]>;
  save(problem: Problem): Promise<void>;
  update(problem: Problem): Promise<void>;
  delete(id: string): Promise<void>;
}