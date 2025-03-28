import * as Crypto from 'expo-crypto';

const DB_MGR_URL = process.env.EXPO_PUBLIC_DB_MGR_URL || 'http://localhost:3000/api';

export interface RegisterUserInput {
  userId: string;
  email: string;
  name?: string;
}

export interface User {
  userId: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('User with this email already exists');
    }
    if (response.status === 404) {
      throw new Error('Service not found. Please check if the database service is running.');
    }
    if (response.status === 500) {
      throw new Error('Database service error');
    }
    throw new Error('Failed to process request');
  }
  return response.json();
};

export const registerUser = async (input: RegisterUserInput): Promise<User> => {
  try {
    const response = await fetch(`${DB_MGR_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: input.userId,
        email: input.email.toLowerCase().trim(),
        name: input.name
      }),
    });

    return handleResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to register user');
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const response = await fetch(`${DB_MGR_URL}/users/email/${email.toLowerCase().trim()}`);
    
    if (response.status === 404) {
      return null;
    }

    return handleResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch user');
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const response = await fetch(`${DB_MGR_URL}/users/${userId}`);
    
    if (response.status === 404) {
      return null;
    }

    return handleResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch user');
  }
}; 