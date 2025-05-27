"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineAuthModel = void 0;
const sequelize_1 = require("sequelize");
//auth table
const defineAuthModel = (sequelize) => {
    return sequelize.define('auth', {
        id: {
            type: sequelize_1.DataTypes.STRING,
            primaryKey: true
        },
        userId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        }
    }, {
        freezeTableName: true,
        tableName: 'auth',
        createdAt: false,
        updatedAt: false
    });
};
exports.defineAuthModel = defineAuthModel;
