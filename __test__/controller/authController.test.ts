import { AuthController } from '../../controller/authController.ts';
import { authService } from '../../services/authService.ts';
import { httpStatus } from '../../utils/httpStatus.ts';
import { mockRequest } from '../utils/mockRequest.ts';
import { mockResponse } from '../utils/mockResponse.ts';
import { createLoginInput, createSignupInput, mockLoginInput, mockUserOutput } from '../fixtures/authFixtures.ts';

describe('AuthController.loginUser', () => {
  const controller = new AuthController();

  const req = mockRequest({
    body: createLoginInput(),
  });

  const res = mockResponse();

  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  }); 

  it('loginUser success message for valid user and response with status code 200, check the behaviour of the controller function', async () => {
    const mockResult = { message: 'Login Successfull', token: 'lkasdfj1234' };
    jest.spyOn(authService, 'loginUser').mockResolvedValue(mockResult);

    await controller.loginUser(req, res, next);

    expect(authService.loginUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(mockResult);
    expect(next).not.toHaveBeenCalled();
  });

  it('called next middleware with error when login failed', async () => {
    const error = new Error('Login failed');
    jest.spyOn(authService, 'loginUser').mockRejectedValue(error);

    await controller.loginUser(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('AuthController.signUpUser', () => {
  const controller = new AuthController();

  const req = mockRequest({
    body: createSignupInput(),
  });

  const res = mockResponse();

  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('signUpUser return 201 status code when signup success and accept created user information', async () => {
    const mockUser = mockUserOutput;
    
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

  it('call next when signUpUser throw any error', async () => {
    const error = new Error('Sign up failed');
    jest.spyOn(authService, 'signUpUser').mockRejectedValue(error);

    await controller.signUpUser(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
