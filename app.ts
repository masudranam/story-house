import dotenv from 'dotenv';
import express, { NextFunction } from 'express';
import { sequelize } from './database/database.ts';
import userRoutes from './routes/userRoutes.ts';
import storyRoutes from './routes/storyRoutes.ts';
import authRoutes from './routes/authRoutes.ts';
import { defineUserModel } from './database/models/user.ts';
import { defineAuthModel } from './database/models/auth.ts';
import { errorHandler } from './utils/errorHandler.ts';
import { defineStoryModel } from './database/models/story.ts';
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

defineUserModel(sequelize);
defineAuthModel(sequelize);
defineStoryModel(sequelize);

app.use('/users', userRoutes);
app.use('/stories', storyRoutes);
app.use('/users/', authRoutes);

app.get('/', (req, res, next: NextFunction) => {
  res.json({ message: 'Hello from the backend' });
});

app.use(errorHandler);
app.listen(PORT);

export default app;
