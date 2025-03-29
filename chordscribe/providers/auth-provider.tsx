"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { registerUser, getUserByEmail, User as DbUser } from '@/services/authService';

const STORAGE_KEY = 'user_data';

interface AuthContextType {
  user: FirebaseUser | null;
  dbUser: DbUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDbUser = async (firebaseUser: FirebaseUser) => {
    try {
      const userData = await getUserByEmail(firebaseUser.email!);
      if (userData) {
        setDbUser(userData);
        // Store user data in local storage
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            firebaseUser: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            },
            dbUser: userData
          })
        );
      }
    } catch (error) {
      console.error('Failed to fetch/register db user:', error);
    }
  };

  const loadStoredUser = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const { firebaseUser, dbUser: storedDbUser } = JSON.parse(storedData);
        setDbUser(storedDbUser);
        // Note: We can't fully reconstruct FirebaseUser object, but we can use the stored data
        // to maintain offline access to the app
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        } as FirebaseUser);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // signOut()
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchDbUser(firebaseUser);
      } else {
        setUser(null);
        setDbUser(null);
        // Clear stored user data on sign out
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
      setIsLoading(false);
    });

    // Load stored user data on app start
    loadStoredUser();

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchDbUser(userCredential.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await register(userCredential.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (firebaseUser: FirebaseUser) => {
    try {
      const newUser = await registerUser({
        userId: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || undefined
      });
      setDbUser(newUser);
    } catch (error) {
      console.error('Failed to fetch/register db user:', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Clear stored user data
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (!user) throw new Error("No user logged in");

    setIsLoading(true);
    try {
      await firebaseUpdateProfile(user, updates);
      if (updates.displayName && dbUser) {
        setDbUser({ ...dbUser, name: updates.displayName });
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
