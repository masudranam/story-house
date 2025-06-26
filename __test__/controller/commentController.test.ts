import { CommentController } from '../../controller/commentController.ts';
import { commentService } from '../../services/commentService.ts';
import { httpStatus } from '../../utils/httpStatus.ts';
import { mockResponse } from '../utils/mockResponse.ts';
import { mockRequest } from '../utils/mockRequest.ts';
import { commentAttributes } from '../../dto/comment/commentAttributes.ts';
import {
  mockCommentInput,
  mockCommentOutput,
} from '../fixtures/commentFixture.ts';

jest.mock('../../services/commentService');

describe('CommentController', () => {
  const controller = new CommentController();

  const res = mockResponse();

  const next = jest.fn();

  afterEach(() => jest.clearAllMocks());

  describe('postComment', () => {
    const req = mockRequest({
      user: { id: 'user', role: 0 },
      body: mockCommentInput,
    });

    it('should post comment successfully', async () => {
      const mockComment = mockCommentInput;
      jest
        .spyOn(commentService, 'postCommentByStoryId')
        .mockResolvedValue(mockComment);

      await controller.postComment(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(mockComment);
    });

    it('should call next on error', async () => {
      const error = new Error();
      jest
        .spyOn(commentService, 'postCommentByStoryId')
        .mockRejectedValue(error);

      await controller.postComment(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('editCommentByCommentId', () => {
    const req = mockRequest({
      user: { id: 'user', role: 0 },
      params: { id: 'comment' },
      body: { content: 'Updated content' },
    });

    it('should update comment', async () => {
      const updated = {
        id: 'asldkfj',
        content: 'Updated content',
      } as unknown as commentAttributes;
      jest
        .spyOn(commentService, 'editCommentByCommentId')
        .mockResolvedValue(updated);

      await controller.editCommentByCommentId(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('should call next on error', async () => {
      const error = new Error();
      jest
        .spyOn(commentService, 'editCommentByCommentId')
        .mockRejectedValue(error);

      await controller.editCommentByCommentId(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteCommentByCommentId', () => {
    const req = mockRequest({
      user: { id: 'asldkfjoerqwe', role: 0 },
      params: { id: 'comment' },
    });

    it('should delete comment', async () => {
      jest
        .spyOn(commentService, 'deleteCommentByCommentId')
        .mockResolvedValue(1);

      await controller.deleteCommentByCommentId(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'comment with id comment has been deleted',
      });
    });

    it('should call next on error', async () => {
      const error = new Error();
      jest
        .spyOn(commentService, 'deleteCommentByCommentId')
        .mockRejectedValue(error);

      await controller.deleteCommentByCommentId(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('searchComment', () => {
    const req = mockRequest({ query: { author: 'masud' } });

    it('should return search result', async () => {
      const mockResult = [mockCommentOutput];
      jest
        .spyOn(commentService, 'searchComments')
        .mockResolvedValue(mockResult);

      await controller.searchComment(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should call next on error', async () => {
      const error = new Error();
      jest.spyOn(commentService, 'searchComments').mockRejectedValue(error);

      await controller.searchComment(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
