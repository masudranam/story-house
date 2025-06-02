import jwt from 'jsonwebtoken';

export const generateToken = (username: string) =>{
    return jwt.sign({username}, 'secret', {expiresIn:'2d'});
};
