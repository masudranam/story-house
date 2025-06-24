import { UserController } from '../../controller/userController.ts';
import { userService } from '../../services/userService.ts';
import { httpStatus } from '../../utils/httpStatus.ts';
import { responseFormatter } from '../../utils/responseFormatteUtils.ts';
import { mockResponse } from '../utils/mockResponse.ts';
import { mockRequest } from '../utils/mockRequest.ts';
import { mockUserOutput } from '../fixtures/authFixtures.ts';

jest.mock('../../utils/responseFormatteUtils.ts', () => ({
  responseFormatter: {
    format: jest.fn(),
  },
}));

describe('UserController', () => {
  const controller = new UserController();

  const res = mockResponse();

  const next = jest.fn();

  afterEach(() => jest.clearAllMocks());

  describe('getUserById', () => {
    const req = mockRequest({ params: { id: '123asldk' } });

    it('getUserById return user information when successfully get user by Id', async () => {
      const mockUser = mockUserOutput;
      jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);

      await controller.getUserById(req, res, next);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('getUserById should return 404 if not found', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValue(null);

      await controller.getUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('called next middleware when error occurs', async () => {
      const err = new Error('DB Error');
      jest.spyOn(userService, 'getUserById').mockRejectedValue(err);

      await controller.getUserById(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('getUserByUsername', () => {
    const req = mockRequest({ params: { username: 'masud' } });

    it('get user when getUserByUsername success', async () => {
      const mockUser = mockUserOutput;
      jest.spyOn(userService, 'getUserByUsername').mockResolvedValue(mockUser);

      await controller.getUserByUsername(req, res, next);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('if user not found return error with 404', async () => {
      jest.spyOn(userService, 'getUserByUsername').mockResolvedValue(null);

      await controller.getUserByUsername(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('called next middleware when any error occurs', async () => {
      const err = new Error();
      jest.spyOn(userService, 'getUserByUsername').mockRejectedValue(err);

      await controller.getUserByUsername(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('updateUsernameById', () => {
    const req = mockRequest({
      params: { id: '123' },
      body: { username: 'newUser' },
    });
    const mockUser = mockUserOutput;

    it('update username if user found', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);
      jest.spyOn(userService, 'updateUserName').mockResolvedValue();

      await controller.updateUsernameById(req, res, next);
      expect(res.json).toHaveBeenCalledWith({
        message: `username updated from ${mockUser.username} to ${req.body.username}`,
      });
    });

    it('return status code 404 if user not found', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValue(null);

      await controller.updateUsernameById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('called next middleware for error', async () => {
      const err = new Error();
      jest.spyOn(userService, 'getUserById').mockRejectedValue(err);

      await controller.updateUsernameById(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('deleteUserById', () => {
    const req = mockRequest({ params: { id: '123' } });

    it(' delete user for deleteUserById user if found', async () => {
      const user = mockUserOutput;
      jest.spyOn(userService, 'getUserById').mockResolvedValue(user);
      jest.spyOn(userService, 'deleteUserById').mockResolvedValue();

      await controller.deleteUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: `User with id ${user.id} deleted successfully`,
      });
    });

    it('should return 404 if user not found', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValue(null);

      await controller.deleteUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not exist' });
    });

    it('getUserById called next middleware if error returns', async () => {
      const err = new Error();
      jest.spyOn(userService, 'getUserById').mockRejectedValue(err);

      await controller.deleteUserById(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('searchUsers', () => {
    const req = mockRequest({ query: {} });

    it('should format and return users', async () => {
      const mockUsers = [mockUserOutput];
      jest.spyOn(userService, 'searchUser').mockResolvedValue(mockUsers);

      await controller.searchUsers(req, res, next);
      expect(responseFormatter.format).toHaveBeenCalledWith(
        req,
        res,
        mockUsers,
        httpStatus.OK,
      );
    });
  });
});
