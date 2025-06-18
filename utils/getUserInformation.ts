import { Request } from 'express';

export function getUserReqInformation(req: Request) {
  const { userId, role } = {
    userId: req.headers['x-user-id'],
    role: req.headers['x-user-role'],
  };
  return { userId, role };
}
