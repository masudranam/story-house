import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const SALT = process.env.SALT || 10;

class PasswordHandler {
  hashedPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, Number(SALT));
  };
  comparePassword = async (
    password: string,
    hashedPassword: string,
  ): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
  };
}

export const passwordHandler = new PasswordHandler();
