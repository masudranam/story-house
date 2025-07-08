import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const SECRET = process.env.JWT_SECRET || 'secret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '60';

export const generateToken = (userId: string,  userRole: number) => {
  return jwt.sign({ userId,   userRole }, SECRET, {
    expiresIn: EXPIRES as jwt.SignOptions['expiresIn'],
  });
};
