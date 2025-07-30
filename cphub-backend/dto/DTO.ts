import { z } from 'zod';

export const checkUUID = z.object({
  id: z.string().uuid({ message: 'Invalid ID format (UUID expected)' }),
});

export interface createStoryDTO {
  title: string;
  description: string;
  authorId?: string;
}
