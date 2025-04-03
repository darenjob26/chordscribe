import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import playbookRoutes from './routes/playbookRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/playbooks', playbookRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 