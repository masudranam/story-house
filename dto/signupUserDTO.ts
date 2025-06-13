import { z } from 'zod';

export const signUpUserSchema = z.object({
  name: z.string(),
  username: z
    .string()
    .min(1, 'Username must be at least 5 characters')
    .regex(/^[a-z]+$/, 'Username must be lowercase letters only'),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6),
});

export type signUpUserDTO = z.infer<typeof signUpUserSchema>;
