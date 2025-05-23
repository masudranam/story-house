import express from 'express';
import {Sequelize, DataTypes}  from 'sequelize';

const app = express();
const PORT = 3000;

const db = new Sequelize('test','postgres','admin',{
    host: 'localhost',
    dialect: 'postgres'
});

//Database connection check
try{
    await db.authenticate();
    console.log('Yeeeee! connection has been stublished!');
}catch(err){
    console.err('Unable to connect', err);
}

const Auth = db.define('auth',{
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
    }
);

const User = db.define('user',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull:false
    },
    userName:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull:false
    },
    joinDate:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    role:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    passLastModificationTime:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
},{
    freezeTableName: true,
    tableName: 'user'
})

await Auth.sync({force: true});
await User.sync({force: true});

app.get('/',(req, res)=>{
    res.send('Hello');
})

app.listen(PORT,console.log(`app is running on port ${PORT}`));