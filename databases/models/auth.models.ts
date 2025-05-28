import { Model, DataTypes, Sequelize } from "sequelize";
import bcrypt from 'bcrypt';

export class Auth extends Model {
  declare id: string;
  declare userId: string;
  declare password: string;
}


//auth table
export const defineAuthModel = (sequelize: Sequelize) =>{
    Auth.init({
    id:{type:DataTypes.STRING,primaryKey: true},
    userId:{type: DataTypes.STRING,allowNull: false},
    password:{type: DataTypes.STRING,allowNull: false}
   },
    {
    sequelize,
    modelName: 'Auth',
    tableName: 'auth',
    hooks: {
    beforeCreate: async (user: any) => {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
    });
};
 