import { z } from 'zod';

export const signUpUserSchema = z.object({
  name: z.string().min(1),
  username: z
    .string()
    .min(1, 'Username must be at least 1 characters')
    .regex(/^[a-z 0-9]+$/, 'Username must be lowercase letters only'),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6),
});

export type signUpUser = z.infer<typeof signUpUserSchema>;
