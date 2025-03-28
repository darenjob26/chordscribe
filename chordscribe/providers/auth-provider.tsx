"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
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
  const router = useRouter();

  const fetchDbUser = async (firebaseUser: FirebaseUser) => {
    try {
      const userData = await getUserByEmail(firebaseUser.email!);
      if (userData) {
        setDbUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch/register db user:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // await firebaseSignOut(auth);
      setUser(user);
      if (user) {
        await fetchDbUser(user);
      } else {
        setDbUser(null);
      }
      setIsLoading(false);
    });

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
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      setDbUser(null);
      router.replace("/auth/login");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
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
