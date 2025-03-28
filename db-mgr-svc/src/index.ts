import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import songRoutes from './routes/songRoutes';
import playbookRoutes from './routes/playbookRoutes';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/songs', songRoutes);
app.use('/api/playbooks', playbookRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 