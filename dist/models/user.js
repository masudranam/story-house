"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineUserModel = void 0;
const sequelize_1 = require("sequelize");
//user table
const defineUserModel = (sequelize) => {
    return sequelize.define('user', {
        id: {
            type: sequelize_1.DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        userName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        joinDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
        role: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0
        },
        passLastModificationTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        freezeTableName: true,
        tableName: 'user'
    });
};
exports.defineUserModel = defineUserModel;
