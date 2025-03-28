import mongoose from './mongodb-config';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  initLocalStorageDB, 
  isLocalStorageDBActive, 
  getLocalStorageURI
} from './local-storage-db';

// MongoDB connection URI - use a local MongoDB instance
// Default to localhost but allow override with AsyncStorage
const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/chordscribe';

// Track connection status
let isConnected = false;
let connectionAttemptInProgress = false;

// Function to check if mongoose is properly initialized
const isMongooseValid = (): boolean => {
  if (!mongoose) {
    console.error('Mongoose is undefined');
    return false;
  }
  
  if (typeof mongoose !== 'object') {
    console.error('Mongoose is not an object');
    return false;
  }
  
  if (!mongoose.connect || typeof mongoose.connect !== 'function') {
    console.error('Mongoose.connect is not a function');
    return false;
  }
  
  return true;
};

// Initialize database connection
export const connectToDatabase = async (): Promise<boolean> => {
  try {
    // If already connected or connection attempt in progress, return early
    if (isConnected) {
      console.log('Already connected to MongoDB');
      return true;
    }
    
    if (connectionAttemptInProgress) {
      console.log('Connection attempt already in progress');
      return false;
    }
    
    connectionAttemptInProgress = true;

    // For React Native, always use local storage DB in development
    // and try to use MongoDB in production if available
    const isDev = __DEV__;
    
    // Use local storage DB for React Native development
    if (isDev) {
      try {
        // Initialize local storage DB if not already initialized
        if (!(await isLocalStorageDBActive())) {
          await initLocalStorageDB();
        }
        
        // Mark as connected (local-only mode)
        isConnected = true;
        console.log('Using local storage database for development');
        return true;
      } catch (localDBError) {
        console.warn('Error initializing local storage DB:', localDBError);
      }
    }

    // Try to connect to a real MongoDB server if local DB failed or in production
    let uri;
    try {
      const storedURI = await AsyncStorage.getItem('@mongodb_uri');
      uri = storedURI || DEFAULT_MONGODB_URI;
    } catch (storageError) {
      console.warn('Could not access AsyncStorage, using default URI', storageError);
      uri = DEFAULT_MONGODB_URI;
    }

    // Check if mongoose is properly initialized
    if (!isMongooseValid()) {
      console.error('Mongoose is not properly initialized - using local storage DB instead');
      
      // Initialize local storage DB if not already initialized
      if (!(await isLocalStorageDBActive())) {
        await initLocalStorageDB();
      }
      
      isConnected = true;
      return true;
    }

    // Configure connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
      connectTimeoutMS: 10000, // 10 seconds connection timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    };

    try {
      // Connect to MongoDB with timeout to prevent hanging
      console.log('Attempting to connect to MongoDB at:', uri);
      const connectPromise = mongoose.connect(uri, options as any);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Connection timed out after 15 seconds'));
        }, 15000);
      });
      
      // Race the connection against the timeout
      await Promise.race([connectPromise, timeoutPromise]);
      
      // Check connection state
      const connectionStateValid = 
        mongoose && 
        mongoose.connection && 
        typeof mongoose.connection === 'object' && 
        'readyState' in mongoose.connection;
      
      if (connectionStateValid) {
        isConnected = mongoose.connection.readyState === 1; // 1 = connected
      } else {
        console.error('Mongoose connection state is invalid');
        isConnected = false;
      }
      
      if (isConnected) {
        console.log('Successfully connected to MongoDB');
        
        // Set up connection event handlers
        if (mongoose.connection && 
            typeof mongoose.connection === 'object' && 
            'on' in mongoose.connection && 
            typeof mongoose.connection.on === 'function') {
          // Set up connection event handlers if available
          try {
            mongoose.connection.on('error', (err: Error) => {
              console.error('MongoDB connection error:', err);
              isConnected = false;
            });
            
            mongoose.connection.on('disconnected', () => {
              console.log('MongoDB disconnected');
              isConnected = false;
            });
          } catch (eventError) {
            console.error('Error setting up connection event handlers:', eventError);
          }
        } else {
          console.warn('Mongoose connection event handlers not available');
        }
      } else {
        console.error('Failed to connect to MongoDB');
      }
    } catch (mongoError) {
      console.error('Error connecting to MongoDB:', mongoError);
      
      // Fall back to local storage DB if MongoDB connection fails
      if (!(await isLocalStorageDBActive())) {
        await initLocalStorageDB();
      }
      
      // Mark as connected in local-only mode
      isConnected = true;
      console.log('Falling back to local storage database');
    }
    
    return isConnected;
  } catch (error) {
    console.error('Error connecting to database:', error);
    
    // As a last resort, try to use local storage DB
    try {
      if (!(await isLocalStorageDBActive())) {
        await initLocalStorageDB();
      }
      isConnected = true;
      console.log('Using local storage DB as last resort');
      return true;
    } catch (localDBError) {
      console.error('Failed to use local storage DB as fallback:', localDBError);
      isConnected = false;
      return false;
    }
  } finally {
    connectionAttemptInProgress = false;
  }
};

// Disconnect from database
export const disconnectFromDatabase = async (): Promise<boolean> => {
  if (!isConnected) {
    return true;
  }
  
  try {
    // Only disconnect if we're connected to a real MongoDB
    if (isMongooseValid() && 
        mongoose.connection && 
        mongoose.connection.readyState === 1 && 
        mongoose.disconnect && 
        typeof mongoose.disconnect === 'function') {
      await mongoose.disconnect();
    }
    
    isConnected = false;
    console.log('Disconnected from database');
    return true;
  } catch (error) {
    console.error('Error disconnecting from database:', error);
    return false;
  }
};

// Check connection status
export const isConnectedToDatabase = (): boolean => {
  if (isMongooseValid() && 
      mongoose.connection && 
      mongoose.connection.readyState === 1) {
    isConnected = true;
  }
  
  return isConnected;
};

// Set a custom MongoDB URI
export const setMongoDBURI = async (uri: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem('@mongodb_uri', uri);
    console.log('MongoDB URI updated. Please reconnect to apply changes.');
    return true;
  } catch (error) {
    console.error('Error saving MongoDB URI:', error);
    return false;
  }
}; 