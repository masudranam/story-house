import { z } from 'zod';


export const userFiltersSchema = z.object({
  name: z.string().optional(),

  username: z.string().optional(),

  email: z.string().email().optional(),

  role: z
    .enum(['admin', 'user', 'all'])
    .transform((val) => {
      if (val === 'admin') return 1;
      if (val === 'user') return 0;
      return undefined; 
    })
    .optional(),
  search: z.string().optional(),

  sort: z.enum(['asc', 'desc']).optional().default('desc'),

  limit: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Limit must be a positive number',
    })
    .optional()
    .default('10'),

  page: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Page must be a positive number',
    })
    .optional()
    .default('1'),
});
export type userFilters = z.infer<typeof userFiltersSchema>;
