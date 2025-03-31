import { Request, Response } from 'express';
import User, { IUser } from '../models/User';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ userId }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this userId or email already exists' 
      });
    }

    const user = new User({
      userId,
      email
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      message: 'Error fetching user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      message: 'Error fetching user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Remove userId from updates if present
    delete updates.userId;

    const user = await User.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      message: 'Error updating user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findOneAndDelete({ userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}; 