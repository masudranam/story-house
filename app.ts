import dotenv from 'dotenv';
import express, { NextFunction } from 'express';
import cors from 'cors';

import userRoutes from './routes/userRoutes.ts';
import storyRoutes from './routes/storyRoutes.ts';
import authRoutes from './routes/authRoutes.ts';
import commentRoutes from './routes/commentRoutes.ts';
import { errorHandler } from './utils/errorHandler.ts';
import likeRoutes from './routes/likeRoutes.ts';
import { initDatabase } from './database/database.ts';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors({
  origin:'http://localhost:3001',
  credentials: true,
}))

await initDatabase();

app.use('/users', authRoutes);
app.use('/users', userRoutes);
app.use('/stories', storyRoutes);
app.use('/comments', commentRoutes);
app.use('/likes', likeRoutes);

app.get('/', (req, res, next: NextFunction) => {
  res.json({ message: 'Hello from the backend' });
});

app.use(errorHandler);
app.listen(PORT);

