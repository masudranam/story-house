import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();


const SALT =  10;

 class SecurePassword{
    hashedPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT);
    };
    comparePassword = async (
    password: string,
    hashedPassword: string
    ): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
  };
}

export const securePassword = new SecurePassword();



