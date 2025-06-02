import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_unga_vunga';

export const generateToken = (userName: string) =>{
    return jwt.sign({userName}, JWT_SECRET, {expiresIn:'2d'});
};
