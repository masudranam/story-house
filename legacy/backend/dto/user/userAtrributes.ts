import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  joinDate: z.coerce.date(),
  role: z.number(),
  passLastModificationTime: z.coerce.date(),
});
export type userAttributes = z.infer<typeof userSchema> | null;
