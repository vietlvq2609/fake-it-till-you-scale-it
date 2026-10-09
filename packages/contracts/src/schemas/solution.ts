import { z } from 'zod';

export const SolutionSchema = z.object({
  id: z.string().uuid(),
  problemId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  status: z.enum(['proposed', 'approved', 'implemented', 'rejected']),
  approach: z.string().min(1),
  tradeoffs: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  authorId: z.string().uuid(),
});

export type Solution = z.infer<typeof SolutionSchema>;

export const SolutionCreateSchema = SolutionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SolutionCreate = z.infer<typeof SolutionCreateSchema>;

export const SolutionUpdateSchema = SolutionSchema.partial().omit({
  id: true,
  problemId: true,
  createdAt: true,
});

export type SolutionUpdate = z.infer<typeof SolutionUpdateSchema>;