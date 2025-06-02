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
        unique: true
      }, 
      password:{
        type: DataTypes.STRING,
        allowNull: false
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
