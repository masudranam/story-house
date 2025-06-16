import { DataTypes, Sequelize, Model } from 'sequelize';

//Auth table
export class Auth extends Model {
  declare userId: string;
  declare password: string;
}

export const defineAuthModel = (sequelize: Sequelize) => {
  Auth.init(
    {
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'user',
          key: 'id',
        },
        onDelete: 'CASCADE',
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
      timestamps: true,
    },
  );
  return Auth;
};
