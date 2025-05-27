import express from 'express';
import dotenv from 'dotenv';
import {Sequelize, DataTypes}  from 'sequelize';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

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






app.get('/',(req, res)=>{
    res.send('Hello');
})

app.listen(PORT,console.log(`app is running on port ${PORT}`));