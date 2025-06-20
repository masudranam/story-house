import { commentService } from '../../services/commentService.ts';
import { commentRepository } from '../../repository/commentRepository.ts';
import { commentAttributes } from '../../dto/comment/commentAttributes.ts';
import { searchCommentParams } from '../../dto/comment/searchCommentParams.ts';

jest.mock('../../repository/commentRepository.ts');

describe('CommentService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('postCommentByStoryId', () => {
    it('should post a comment', async () => {
      const input: commentAttributes = {
        id: '1',
        userId: 'u1',
        storyId: 's1',
        content: 'Nice trip!',
      };
      (commentRepository.postCommentByStoryId as jest.Mock).mockResolvedValue(
        input,
      );

      const result = await commentService.postCommentByStoryId(input);
      expect(result).toEqual(input);
      expect(commentRepository.postCommentByStoryId).toHaveBeenCalledWith(
        input,
      );
    });
  });

  describe('findCommentById', () => {
    it('should return a comment by id', async () => {
      const comment = { id: 'c1', content: 'Hi' };
      (commentRepository.findCommentById as jest.Mock).mockResolvedValue(
        comment,
      );

      const result = await commentService.findCommentById('c1');
      expect(result).toEqual(comment);
    });
  });

  describe('editCommentByCommentId', () => {
    it('should edit a comment if exists', async () => {
      (commentRepository.findCommentById as jest.Mock).mockResolvedValue({
        id: '1',
      });
      (commentRepository.editCommentByCommentId as jest.Mock).mockResolvedValue(
        {
          id: '1',
          content: 'Edited content',
        },
      );

      const result = await commentService.editCommentByCommentId(
        '1',
        'Edited content',
        'u1',
      );
      expect(result).toEqual({ id: '1', content: 'Edited content' });
    });

    it('should throw if comment not found', async () => {
      (commentRepository.findCommentById as jest.Mock).mockResolvedValue(null);
      await expect(
        commentService.editCommentByCommentId('1', 'X', 'u1'),
      ).rejects.toThrow('Not authorized or not found');
    });
  });

  describe('deleteCommentByCommentId', () => {
    it('should delete comment if found', async () => {
      (commentRepository.findCommentById as jest.Mock).mockResolvedValue({
        id: '1',
      });
      (
        commentRepository.deleteCommentByCommentId as jest.Mock
      ).mockResolvedValue(1);

      const result = await commentService.deleteCommentByCommentId('1', 'u1');
      expect(result).toBe(1);
    });

    it('should throw if comment not found', async () => {
      (commentRepository.findCommentById as jest.Mock).mockResolvedValue(null);
      await expect(
        commentService.deleteCommentByCommentId('1', 'u1'),
      ).rejects.toThrow('comment not found');
    });
  });

  describe('searchComments', () => {
    it('should return paginated comments', async () => {
      const params: searchCommentParams = { page: 2, limit: 5 };
      const mockRows = [{ id: '1', content: 'Hi' }];
      const mockCount = 8;

      (commentRepository.searchComments as jest.Mock).mockResolvedValue({
        rows: mockRows,
        count: mockCount,
      });

      const result = await commentService.searchComments(params);
      expect(result).toEqual({
        data: mockRows,
        total: mockCount,
        page: 2,
        limit: 5,
        number_of_page: Math.ceil(mockCount / 5),
      });
    });
  });
});
