import { z } from 'zod';

export const signUpUserSchema = z.object({
  name: z.string(),
  username: z.string().min(1),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6),
});

export type signUpUserDTO = z.infer<typeof signUpUserSchema>;
