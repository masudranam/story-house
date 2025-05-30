import { DataTypes, Sequelize, Model } from 'sequelize';

//Auth table
export class Auth extends Model {
  declare id: string;
  declare userId: string;
  declare password: string;
}

export const defineAuthModel = (sequelize: Sequelize) => {
  Auth.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
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
