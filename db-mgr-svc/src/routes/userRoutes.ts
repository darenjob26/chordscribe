import express from 'express';
import {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  getAllUsers
} from '../controllers/userController';

const router = express.Router();

// Create a new user
router.post('/', createUser);

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:userId', getUserById);

// Get user by email
router.get('/email/:email', getUserByEmail);

// Update user
router.put('/:userId', updateUser);

// Delete user
router.delete('/:userId', deleteUser);

export default router; 