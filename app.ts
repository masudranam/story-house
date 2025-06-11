import dotenv from 'dotenv';
import express from 'express';
import { sequelize } from './database/database.ts';
import userRoutes from './routes/userRoutes.ts';
import { defineUserModel } from './database/models/user.ts';
import { defineAuthModel } from './database/models/auth.ts';
import { errorHandler } from './utils/errorHandler.ts';
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

defineUserModel(sequelize);
defineAuthModel(sequelize);

app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend' });
});

app.use(errorHandler);
app.listen(PORT);

export default app;
