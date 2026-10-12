import { z } from 'zod';

export const DifficultySchema = z.enum(['Easy', 'Medium', 'Hard']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const ProblemStatusSchema = z.enum(['Draft', 'Published', 'Archived']);
export type ProblemStatus = z.infer<typeof ProblemStatusSchema>;

export const TradeoffSchema = z.object({
  decision: z.string().min(1),
  advantage: z.string().min(1),
  disadvantage: z.string().min(1),
});
export type Tradeoff = z.infer<typeof TradeoffSchema>;

export const TopicSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});
export type Topic = z.infer<typeof TopicSchema>;

export const AuthorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  bio: z.string().nullable(),
});
export type Author = z.infer<typeof AuthorSchema>;

export const SolutionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  diagram: z.string().min(1),
  tradeoffs: z.array(TradeoffSchema).min(1),
  topics: z.array(TopicSchema),
});
export type Solution = z.infer<typeof SolutionSchema>;

export const ProblemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  difficulty: DifficultySchema,
  status: ProblemStatusSchema,
  solutions: z.array(SolutionSchema),
  topics: z.array(TopicSchema).min(1),
  relatedProblems: z.array(z.string()),
  author: AuthorSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Problem = z.infer<typeof ProblemSchema>;

export const CreateProblemInputSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  difficulty: DifficultySchema,
  topics: z.array(z.string()).min(1),
  author: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    bio: z.string().optional(),
  }),
  solutions: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().min(1),
      diagram: z.string().min(1),
      tradeoffs: z.array(TradeoffSchema).min(1),
      topics: z.array(z.string()),
    })
  ).min(1),
});
export type CreateProblemInput = z.infer<typeof CreateProblemInputSchema>;

export const PublishProblemInputSchema = z.object({
  problemId: z.string().min(1),
});
export type PublishProblemInput = z.infer<typeof PublishProblemInputSchema>;

export const AddSolutionInputSchema = z.object({
  problemId: z.string().min(1),
  solution: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    diagram: z.string().min(1),
    tradeoffs: z.array(TradeoffSchema).min(1),
    topics: z.array(z.string()),
  }),
});
export type AddSolutionInput = z.infer<typeof AddSolutionInputSchema>;

export const AddRelatedProblemInputSchema = z.object({
  problemId: z.string().min(1),
  relatedProblemId: z.string().min(1),
});
export type AddRelatedProblemInput = z.infer<typeof AddRelatedProblemInputSchema>;

export const SearchProblemsInputSchema = z.object({
  query: z.string().optional(),
  difficulty: DifficultySchema.optional(),
  topic: z.string().optional(),
  solutionTopic: z.string().optional(),
  status: ProblemStatusSchema.optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});
export type SearchProblemsInput = z.infer<typeof SearchProblemsInputSchema>;

export const ProblemPublishedEventSchema = z.object({
  type: z.literal('ProblemPublished'),
  payload: z.object({
    problemId: z.string(),
    title: z.string(),
    difficulty: DifficultySchema,
    topics: z.array(z.string()),
    publishedAt: z.string().datetime(),
  }),
});
export type ProblemPublishedEvent = z.infer<typeof ProblemPublishedEventSchema>;