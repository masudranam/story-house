import {Sequelize }  from 'sequelize';
import { defineAuthModel } from './models/auth';
import { defineUserModel } from './models/user.models.ts';
 
 export const sequelize = new Sequelize('test','postgres','admin',{
    host: 'localhost',
    dialect: 'postgres'
});


export const User = defineUserModel(sequelize);
export const Auth = defineAuthModel(sequelize);

 sequelize.sync();

//Database connection check
try{
     sequelize.authenticate();
    console.log('Yeeeee! connection has been stublished!');
}catch(err){
    console.log('Unable to connect', err);
}
