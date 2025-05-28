import { DataTypes, Sequelize } from "sequelize";
//auth table
export const defineAuthModel = (sequelize: Sequelize) =>{
    return sequelize.define('auth',{
    id:{
        type:DataTypes.STRING,
        primaryKey: true
    },
    userId:{
        type: DataTypes.STRING,
        allowNull: false
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    }
   },
    {
        freezeTableName: true,
        tableName: 'auth',
        createdAt: false,
        updatedAt: false
    });
};
 