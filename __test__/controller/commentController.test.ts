import { CommentController } from '../../controller/commentController.ts';
import { commentService } from '../../services/commentService.ts';
import { httpStatus } from '../../utils/httpStatus.ts';
import { Comment } from '../../database/database.ts';

jest.mock('../../services/commentService');

describe('CommentController', () => {
  const controller = new CommentController();

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;

  const next = jest.fn();

  afterEach(() => jest.clearAllMocks());

  describe('postComment', () => {
    const req = {
      user: { id: 'user-1' },
      body: { storyId: 'story-1', content: 'Nice story!' },
    } as any;

    it('should post comment successfully', async () => {
      const mockComment = { id: 1, content: 'Nice story!' } as any;
      jest.spyOn(commentService, 'postCommentByStoryId').mockResolvedValue(mockComment);

      await controller.postComment(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(mockComment);
    });

    it('should call next on error', async () => {
      const error = new Error();
      jest.spyOn(commentService, 'postCommentByStoryId').mockRejectedValue(error);

      await controller.postComment(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('editCommentByCommentId', () => {
    const req = {
      user: { id: 'user-1' },
      params: { id: 'comment-1' },
      body: { content: 'Updated content' },
    } as any;

    it('should update comment', async () => {
      const updated = { id: 'comment-1', content: 'Updated content' } as any;
      jest.spyOn(commentService, 'editCommentByCommentId').mockResolvedValue(updated);

      await controller.editCommentByCommentId(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('should call next on error', async () => {
      const error = new Error();
      jest.spyOn(commentService, 'editCommentByCommentId').mockRejectedValue(error);

      await controller.editCommentByCommentId(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteCommentByCommentId', () => {
    const req = {
      user: { id: 'user-1' },
      params: { id: 'comment-1' },
    } as any;

    it('should delete comment', async () => {
      jest.spyOn(commentService, 'deleteCommentByCommentId').mockResolvedValue(1);

      await controller.deleteCommentByCommentId(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.json).toHaveBeenCalledWith({
        message: 'comment with id comment-1 has been deleted',
      });
    });

    it('should call next on error', async () => {
      const error = new Error();
      jest.spyOn(commentService, 'deleteCommentByCommentId').mockRejectedValue(error);

      await controller.deleteCommentByCommentId(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('searchComment', () => {
    const req = { query: { author: 'masud' } } as any;

    it('should return search result', async () => {
      const mockResult = [{ id: 1, content: 'Hello' }] as any;
      jest.spyOn(commentService, 'searchComments').mockResolvedValue(mockResult);

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

  describe('deleteComments', () => {
    const req = {} as any;

    it('should delete all comments', async () => {
      jest.spyOn(Comment, 'destroy').mockResolvedValue(10);

      await controller.deleteComments(req, res);
      expect(res.json).toHaveBeenCalledWith(10);
    });
  });
});
