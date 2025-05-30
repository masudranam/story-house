import { User } from '../database/models/user.ts';
import { Auth } from '../database/models/auth.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { securePassword } from '../utils/hashedPassword.ts';
 

class AuthController{
  async signUpUser(req : any, res: any){
  try {
    const { id, name, email, userName, password } = req.body;
    const existingUser = await User.findOne({ where: { userName } });

    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({ message: 'User already exists' });
    }

    const hashed = await securePassword.hashedPassword(password);
    const user = await User.create({id, name, email, userName });
    const data = { userName, hashed};
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

  const auth = await Auth.findByPk(userName);
  if (!auth) return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Invalid credentials' });

  const isMatched = await securePassword.comparePassword(password, auth.password);
  if (isMatched) return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Invalid credentials' });

  const user = await User.findOne({ where: { userName } });
  res.json({ message: 'Login successful', user });
};

async getAllAuth(){

}
}

export const authController = new AuthController();