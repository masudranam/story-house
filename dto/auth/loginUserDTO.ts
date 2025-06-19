import { z } from 'zod';

const usernameRegex = /^[a-zA-Z0-9_]{1,}$/;

export const loginUserSchema = z.object({
  identifier: z
    .string()
    .min(1)
    .refine(
      (val) => {
        const isEmail = z.string().email().safeParse(val).success;
        const isUsername = usernameRegex.test(val);
        return isEmail || isUsername;
      },
      {
        message:
          'Identifier must be a valid email or username (alphanumeric, min 1 chars)',
      },
    ),
  password: z.string().min(6),
});

export type loginUser = z.infer<typeof loginUserSchema>;
