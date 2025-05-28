import express from 'express';
import dotenv from 'dotenv';
import {sequelize} from './databases/database.ts';
import userRoutes from './routes/user.route.ts';
import { defineUserModel } from './databases/models/user.models.ts';
 
dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use('/users',userRoutes);

defineUserModel(sequelize);

app.get('/',(req, res)=>{
    res.json({message: 'hello'});
})

app.listen(PORT);
 
export default app;