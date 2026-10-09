import { Topic } from '../entities/Topic';

export interface ITopicRepository {
  findBySlug(slug: string): Promise<Topic | null>;
  findAll(): Promise<Topic[]>;
  save(topic: Topic): Promise<void>;
  delete(slug: string): Promise<void>;
}