import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '30s';

export const generateToken = (userId: string, role: number) => {
  return jwt.sign({ userId, role }, SECRET, {
    expiresIn: EXPIRES as jwt.SignOptions['expiresIn'],
  });
};
