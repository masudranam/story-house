import {Sequelize }  from 'sequelize';
import { defineAuthModel } from './models/auth';
import { defineUserModel } from './models/user';
 
export const sequelize = new Sequelize('test','postgres','admin',{
    host: 'localhost',
    dialect: 'postgres'
});


export const User = defineUserModel(sequelize);
export const Auth = defineAuthModel(sequelize);

await sequelize.sync();

//Database connection check
try{
    await db.authenticate();
    console.log('Yeeeee! connection has been stublished!');
}catch(err){
    console.err('Unable to connect', err);
}
