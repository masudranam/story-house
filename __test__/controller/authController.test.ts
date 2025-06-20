import { AuthController } from '../../controller/authController.ts';
import { authService } from '../../services/authService.ts';
import { httpStatus } from '../../utils/httpStatus.ts';
import { User } from '../../database/models/user.ts';
import { mockRequest } from '../utils/mockRequest.ts';
import { mockResponse } from '../utils/mockResponse.ts';

describe('AuthController.loginUser', () => {
  const controller = new AuthController();

  const req = mockRequest({
    body: { username: 'masud', password: 'pass123' },
  });

  const res = mockResponse();

  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with 200 and result on success', async () => {
    const mockResult = { message: 'Login Successfull', token: 'ssdd123' };
    jest.spyOn(authService, 'loginUser').mockResolvedValue(mockResult);

    await controller.loginUser(req, res, next);

    expect(authService.loginUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(mockResult);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error on failure', async () => {
    const error = new Error('Login failed');
    jest.spyOn(authService, 'loginUser').mockRejectedValue(error);

    await controller.loginUser(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('AuthController.signUpUser', () => {
  const controller = new AuthController();

  const req = mockRequest({
    body: {
      username: 'masud',
      password: 'pass123',
      email: 'masud@example.com',
    },
  });

  const res = mockResponse();

  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with 201 and the user data on success', async () => {
    const mockUser = {
      password: 'password',
      name: 'masud',
      username: 'masud',
      email: 'masud@example.com',
    } as unknown as User;
    jest.spyOn(authService, 'signUpUser').mockResolvedValue(mockUser);

    await controller.signUpUser(req, res, next);

    expect(authService.signUpUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User registered successfully',
      user: mockUser,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error when service throws', async () => {
    const error = new Error('Sign up failed');
    jest.spyOn(authService, 'signUpUser').mockRejectedValue(error);

    await controller.signUpUser(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
