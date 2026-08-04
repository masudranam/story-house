import { createStoryDTO } from '../../dto/DTO.ts';
import { storyAttributes } from '../../dto/story/storyAttributes.ts';

export const mockStoryOutput: storyAttributes = {
  id: '789e1234-abcd-56ef-9012-345678901234',
  title: 'Exploring the Alps',
  description: 'A scenic hike through the snow-covered peaks of the Alps.',
  authorId: '123e4567-e89b-12d3-a456-426614174000',
  lastModificationTime: new Date('2025-06-20T10:00:00Z'),
  createdAt: new Date('2025-06-19T08:00:00Z'),
  updatedAt: new Date('2025-06-20T10:00:00Z'),
};

export const mockStoryInput: createStoryDTO = {
  title: 'Wonders of Kyoto',
  description: 'Exploring the temples, gardens, and history of Kyoto, Japan.',
  authorId: '123e4567-e89b-12d3-a456-426614174000',
};
