import { UserController } from '../../controller/userController.ts';
import { userService } from '../../services/userService.ts';
import { httpStatus } from '../../utils/httpStatus.ts';
import { responseFormatter } from '../../utils/responseFormatteUtils.ts';
import { User } from '../../database/database.ts';
import { Auth } from '../../database/database.ts';
import { userRequest } from '../../dto/user/userRequest.ts';
import { Request } from 'express';
import { mockResponse } from '../utils/mockResponse.ts';
import { mockRequest } from '../utils/mockRequest.ts';
import { userAttributes } from '../../dto/user/userAtrributes.ts';

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
    const req = mockRequest({ params: { id: '123' } });

    it('should return user if found', async () => {
      const mockUser: userAttributes = { id: '123', name: 'Masud' };
      jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);

      await controller.getUserById(req, res, next);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if not found', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValue(null);

      await controller.getUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should call next on error', async () => {
      const err = new Error('DB Error');
      jest.spyOn(userService, 'getUserById').mockRejectedValue(err);

      await controller.getUserById(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('getUserByUsername', () => {
    const req = mockRequest({ params: { username: 'masud' } });

    it('should return user if found', async () => {
      const mockUser: userAttributes = { username: 'masud' };
      jest.spyOn(userService, 'getUserByUsername').mockResolvedValue(mockUser);

      await controller.getUserByUsername(req, res, next);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if not found', async () => {
      jest.spyOn(userService, 'getUserByUsername').mockResolvedValue(null);

      await controller.getUserByUsername(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should call next on error', async () => {
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

    it('should update username if user found', async () => {
      jest
        .spyOn(userService, 'getUserById')
        .mockResolvedValue({ username: 'oldUser' });
      jest.spyOn(userService, 'updateUserName').mockResolvedValue();

      await controller.updateUsernameById(req, res, next);
      expect(res.json).toHaveBeenCalledWith({
        message: 'username updated from oldUser to newUser',
      });
    });

    it('should return 404 if user not found', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValue(null);

      await controller.updateUsernameById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should call next on error', async () => {
      const err = new Error();
      jest.spyOn(userService, 'getUserById').mockRejectedValue(err);

      await controller.updateUsernameById(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('deleteUserById', () => {
    const req = mockRequest({ params: { id: '123' } });

    it('should delete user if found', async () => {
      const user: userAttributes = { id: '123' };
      jest.spyOn(userService, 'getUserById').mockResolvedValue(user);
      jest.spyOn(userService, 'deleteUserById').mockResolvedValue();

      await controller.deleteUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User with id 123 deleted successfully',
      });
    });

    it('should return 404 if user not found', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValue(null);

      await controller.deleteUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not exist' });
    });

    it('should call next on error', async () => {
      const err = new Error();
      jest.spyOn(userService, 'getUserById').mockRejectedValue(err);

      await controller.deleteUserById(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('getAllUsers', () => {
    const req = mockRequest({ query: {} });

    it('should format and return users', async () => {
      const mockUsers: userAttributes[] = [{ id: '1' }, { id: '2' }];
      jest.spyOn(userService, 'getAllUser').mockResolvedValue(mockUsers);

      await controller.getAllUsers(req, res, next);
      expect(responseFormatter.format).toHaveBeenCalledWith(
        req,
        res,
        mockUsers,
      );
    });
  });
});
