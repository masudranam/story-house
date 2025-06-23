import { DataTypes, Sequelize, Model, UUIDV4 } from 'sequelize';

export class User extends Model {
  declare id: string;
  declare name: string;
  declare username: string;
  declare email: string;
  declare joinDate: Date;
  declare role: number;
  declare passLastModificationTime: Date;
}

export const defineUserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      username: { type: DataTypes.STRING, unique: true, allowNull: false },
      joinDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      role: { type: DataTypes.INTEGER, defaultValue: 0 },
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
      timestamps: true,
      freezeTableName: true,
    },
  );
  return User;
};
