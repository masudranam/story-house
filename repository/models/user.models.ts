import { DataTypes, Sequelize, Model } from 'sequelize';

export class User extends Model {
  declare id: string;
  declare userName: string;
  declare name: string;
  declare email: string;
  declare joinDate: Date;
  declare role: number;
  declare passLastModificationTime: Date;
}

export const defineUserModel = (sequelize: Sequelize) => {
  User.init({
    id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    userName: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    joinDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
    role: { type: DataTypes.INTEGER, defaultValue: 0 },
    passLastModificationTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    freezeTableName: true,
  });
  return User;
};
