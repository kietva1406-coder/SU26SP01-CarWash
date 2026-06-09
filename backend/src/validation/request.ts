import { z } from 'zod';

export const createRequestSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

export const updateRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  notes: z.string().optional(),
});

export const approveRequestSchema = z.object({
  notes: z.string().optional(),
});

export const rejectRequestSchema = z.object({
  notes: z.string().min(1, 'Rejection notes are required'),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type ApproveRequestInput = z.infer<typeof approveRequestSchema>;
export type RejectRequestInput = z.infer<typeof rejectRequestSchema>;
