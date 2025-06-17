import { Request } from 'express';

export interface authenticatedRequest extends Request {
  user: {
    id: string;
    role: number;
  };
}
