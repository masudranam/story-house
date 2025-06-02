import { User } from '../database/models/user.ts';
import { Auth } from '../database/models/auth.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { securePassword } from '../utils/hashedPassword.ts';
import {generateToken} from '../utils/jwtHandler.ts'
 

class AuthController{
  async signUpUser(req : any, res: any){
  try {
    const { name, email, userName, password } = req.body;
    const existingUser = await User.findOne({ where: { userName } });

    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({ message: 'User already exists' });
    }

    const hashed = await securePassword.hashedPassword(password);
    const user = await User.create({name, email, userName });
    const data = { userName, password: hashed};
    await Auth.create(data);

    res
      .status(httpStatus.CREATED)
      .json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error(error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Something went wrong' });
  }
};


async loginUser(req: any, res: any){
  const { userName, password } = req.body;

  const auth = await Auth.findOne({where : {userName}});
  if (!auth) return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Invalid credentials' });

  const isMatched = await securePassword.comparePassword(password, auth.password);
  console.log(isMatched);
  if (!isMatched) return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Invalid credentials' });

  const user = await User.findOne({ where: { userName } });
  const token = generateToken(user!.userName);

  return res.status(httpStatus.OK).json({token});
};
 
  async getAllAuth(req: any, res: any){
    try{
      const auth =  await Auth.findAll();
      return res.send(auth);
    }catch(err){
      return res.json({error:"There is no user exist!"});
    }
  }
}

export const authController = new AuthController();