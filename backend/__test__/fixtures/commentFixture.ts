import { commentAttributes } from '../../dto/comment/commentAttributes.ts';
import { searchCommentParams } from '../../dto/comment/searchCommentParams.ts';

export const mockCommentOutput: commentAttributes = {
  content: 'This story is amazing! I felt like I was there.',
  storyId: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
  userId: 'd4c3b2a1-8765-0ba9-fedc-ba0987654321',
  commentId: 'd4c3f34s-34wl2l3ls-3ldli4423-elk',
};

export const mockCommentInput = {
  commentId: 'c0a80123-7f1d-4f4c-b9a7-1e2f7d0a1234',
  content: 'Loved your story! Looking forward to the next one.',
  userId: 'd4c3b2a1-8765-0ba9-fedc-ba0987654321',
};

export const mockSearchCommentParams: searchCommentParams = {
  content: 'beautiful',
  author: 'masud',
  storyId: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
  page: 1,
  limit: 10,
};
