import { z } from 'zod';

export const ProblemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  status: z.enum(['open', 'in-progress', 'blocked', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  assigneeId: z.string().uuid().nullable(),
});

export type Problem = z.infer<typeof ProblemSchema>;

export const ProblemCreateSchema = ProblemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProblemCreate = z.infer<typeof ProblemCreateSchema>;

export const ProblemUpdateSchema = ProblemSchema.partial().omit({
  id: true,
  createdAt: true,
});

export type ProblemUpdate = z.infer<typeof ProblemUpdateSchema>;