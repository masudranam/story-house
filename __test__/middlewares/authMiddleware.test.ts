import { IncomingHttpHeaders } from 'http';
import { authMiddleware } from '../../middleware/authMiddleware';
import { mockRequest } from '../utils/mockRequest';
import { mockResponse } from '../utils/mockResponse';
import jwt from 'jsonwebtoken';

describe('authMiddleware', () => {
  let req: any;
  let res:any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      headers: {
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should respond 403 if no Authorization header', async () => {
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should respond 403 if Authorization header does not start with Bearer', async () => {
    req.headers!.authorization = 'Basic token';
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should respond 401 if token expired', async () => {
    const expiredToken = 'expired.token.value';

    // Mock jwt.verify to return expired token payload
    (jest.spyOn(jwt, 'verify') as jest.Mock).mockReturnValue({
      id: '123',
      role: 1,
      exp: Math.floor(Date.now() / 1000) - 100,  
    });

    req.headers.authorization = `Bearer ${expiredToken}`;
    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token expired' });
    expect(next).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });

  it('should call next and set req.user if token is valid', async () => {
    const validToken = 'valid.token.value';

    (jest.spyOn(jwt, 'verify') as jest.Mock).mockReturnValue({
      userId: 'user-123',
      role: 2,
      exp: Math.floor(Date.now() / 1000) + 1000,
    });

    req.headers.authorization = `Bearer ${validToken}`;
    await authMiddleware(req, res, next);

    expect(req.user).toEqual({ id: 'user-123', role: 2 });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });

  it('should call next with error if jwt.verify throws', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    req.headers.authorization = 'Bearer some.token';

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));

    jest.restoreAllMocks();
  });
});
