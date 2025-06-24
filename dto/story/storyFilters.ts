import { z } from 'zod';

export const storyFiltersSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  authorId: z.string().uuid().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Limit must be a positive number' })
    .optional(),
  offset: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val >= 0, { message: 'Offset must be zero or a positive number' })
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Page must be a positive number' })
    .optional(),
});

export type storyFilters = z.infer<typeof storyFiltersSchema>;

