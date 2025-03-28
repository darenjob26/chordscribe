import { initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCp6zsHW01pI_U_80NID-WRzptT0_KdVtA",
  authDomain: "chordscribe.firebaseapp.com",
  projectId: "chordscribe",
  storageBucket: "chordscribe.firebasestorage.app",
  messagingSenderId: "1057480559718",
  appId: "1:1057480559718:web:974a103dc94ba50f7771a7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = firebaseAuth.initializeAuth(app, {
  persistence: reactNativePersistence(AsyncStorage)
}); 