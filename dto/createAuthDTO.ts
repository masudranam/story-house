import { z } from 'zod';

export const createAuthSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 chars'),
});

export type createAuthDTO = z.infer<typeof createAuthSchema>;
