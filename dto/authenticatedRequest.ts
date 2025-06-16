import { Request } from 'express';
export interface authenticatedRequest<T = any> extends Request {
  user: {
    id: string;
    role: number;
  };
  body: T;
}
