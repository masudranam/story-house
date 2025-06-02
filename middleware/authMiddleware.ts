import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction} from 'express';
import { httpStatus } from '../utils/httpStatus.ts';
import dotenv from 'dotenv';
dotenv.config();

export const authMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader){
    res.status(httpStatus.FORBIDDEN).json({message: "No token have sent"});
    return;
    }
    const token = authHeader.split(' ')[1];
    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        (req as any).user = decode;
        next();
    }catch {
        res.status(httpStatus.FORBIDDEN).json({message: 'Invalid token'});
    }
}