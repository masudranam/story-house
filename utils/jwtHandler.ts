import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const generateToken = (username: string) =>{
    return jwt.sign({username}, JWT_SECRET, {expiresIn:'2d'});
};
