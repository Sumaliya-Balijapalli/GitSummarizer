import { z } from 'zod';

export const repositoryUrlSchema = z.object({
  repositoryUrl: z.string().url().max(2048)
}).strict();

export const generatedSummarySchema = z.object({
  overview: z.string().min(1),
  features: z.array(z.string()),
  technologies: z.array(z.string()),
  prerequisites: z.array(z.string()),
  installation: z.array(z.string()),
  usage: z.array(z.string()),
  limitations: z.array(z.string()),
  commit_digest: z.array(z.object({
    message: z.string(),
    explanation: z.string()
  }).strict())
}).strict();