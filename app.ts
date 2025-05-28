import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './database/database.ts';
import userRoutes from './routes/user.ts';
import { defineUserModel } from './database/models/user.ts';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use('/users', userRoutes);

defineUserModel(sequelize);

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend' });
});

app.listen(PORT, ()=>{
  console.log('hello printing');
});

export default app;
