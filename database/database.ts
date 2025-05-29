import { Sequelize } from 'sequelize';
import { defineAuthModel } from './models/auth';
import { defineUserModel } from './models/user';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT as any,
  },
);

export const User = defineUserModel(sequelize);
export const Auth = defineAuthModel(sequelize);

sequelize.sync();

//Database connection check
try {
  sequelize.authenticate();
  console.log('Yeeeee! connection has been stublished!');
} catch (err) {
  console.log('Unable to connect', err);
}
