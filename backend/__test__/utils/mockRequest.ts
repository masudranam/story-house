import { Request } from 'express';

export function mockRequest(data?: Partial<Request>): Request {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    ...data,
  } as Request;
}
