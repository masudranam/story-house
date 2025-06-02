import { DataTypes, Sequelize, Model, UUIDV4 } from 'sequelize';

export class User extends Model {
  declare id : string;
  declare name: string;
  declare userName: string;
  declare email: string;
  declare joinDate: Date;
  declare role: number;
  declare passLastModificationTime: Date;
}

export const defineUserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id : { type: DataTypes.UUID, allowNull: false,defaultValue: UUIDV4, primaryKey: true},
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      userName: { type: DataTypes.STRING,unique: true,  allowNull: false },
      joinDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      role: { type: DataTypes.STRING, defaultValue: 'user' },
      passLastModificationTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'user',
      freezeTableName: true,
    },
  );
  return User;
};
