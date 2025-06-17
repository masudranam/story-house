import dotenv from 'dotenv';
import express, { NextFunction } from 'express';
import userRoutes from './routes/userRoutes.ts';
import storyRoutes from './routes/storyRoutes.ts';
import authRoutes from './routes/authRoutes.ts';
import commentRoutes from './routes/commentRoutes.ts'
import { errorHandler } from './utils/errorHandler.ts';
 
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.use('/users', userRoutes, authRoutes);
app.use('/stories', storyRoutes);
app.use('/comments',commentRoutes);

app.get('/', (req, res, next: NextFunction) => {
  res.json({ message: 'Hello from the backend' });
});

app.use(errorHandler);
app.listen(PORT);

export default app;
