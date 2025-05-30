import { DataTypes, Sequelize, Model } from 'sequelize';

//Auth table
export class Auth extends Model {
  declare userName: string;
  declare password: string;
}


export const defineAuthModel = (sequelize: Sequelize) => {
  Auth.init(
    { 
      userName: {
        type: DataTypes.STRING,
        primaryKey: true,
      }, 
      password:{
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      freezeTableName: true,
      modelName: 'Auth',
      tableName: 'auth',
    },
  );
  return Auth;
};
