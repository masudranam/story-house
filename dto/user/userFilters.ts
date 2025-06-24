import { z } from 'zod';

export const userFiltersSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  username: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Limit must be a positive number',
    })
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Page must be a positive number',
    })
    .optional(),
});

export type userFilters = z.infer<typeof userFiltersSchema>;
