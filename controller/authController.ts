import { User } from '../database/models/user.ts';
import { Auth } from '../database/models/auth.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { securePassword } from '../utils/hashedPassword.ts';
import { generateToken } from '../utils/jwtHandler.ts';
import { NextFunction } from 'express';

class AuthController {
  async signUpUser(req: any, res: any, next: NextFunction) {
    try {
      const { name, email, username, password } = req.body;
      const existingUser = await User.findOne({ where: { username } });

      if (existingUser) {
        return res
          .status(httpStatus.CONFLICT)
          .json({ message: 'User already exists' });
      }

      const hashed = await securePassword.hashedPassword(password);
      const user = await User.create({ name, email, username });
      const data = { username, password: hashed };
      await Auth.create(data);

      res
        .status(httpStatus.CREATED)
        .json({ message: 'User registered successfully', user });
    } catch (err) {
     
      console.error(err);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Something went wrong' });
    }
  }

  async loginUser(req: any, res: any) {
    const { username, password } = req.body;

    const auth = await Auth.findOne({ where: { username } });
    if (!auth)
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: 'Invalid credentials' });

    const isMatched = await securePassword.comparePassword(
      password,
      auth.password,
    );
    console.log(isMatched);
    if (!isMatched)
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: 'Invalid credentials' });

    const user = await User.findOne({ where: { username } });
    const token = generateToken(user!.username);

    return res
      .status(httpStatus.OK)
      .json({ message: 'Login seccessful', token: `Bearer ${token}` });
  }

  async getAllAuth(req: any, res: any) {
    try {
      const auth = await Auth.findAll();
      return res.send(auth);
    } catch (err) {
      return res.json({ error: 'There is no user exist!' });
    }
  }
}

export const authController = new AuthController();
