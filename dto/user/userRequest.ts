import { Request } from 'express';

export interface userRequest extends Request {
  user?: {
    id: string;
    role: number;
    username?: string;
  };
}
