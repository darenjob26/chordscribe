import mongoose from './mongodb-config';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// MongoDB connection URI - use a local MongoDB instance by default
// but allow override with AsyncStorage
const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/chordscribe';
const MONGODB_URI_STORAGE_KEY = '@mongodb_uri';

// Track connection status
let isConnected = false;
let connectionAttemptInProgress = false;
let connectionErrorMessage = '';
let debugLog: string[] = [];

// Helper to add debug entry
const addDebugEntry = (message: string) => {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}`;
  console.log(`MongoDB Debug: ${entry}`);
  debugLog.push(entry);
  if (debugLog.length > 100) {
    debugLog.shift(); // Keep only the last 100 entries
  }
};

// Get debug log
export const getDebugLog = (): string[] => {
  return [...debugLog];
};

// Clear debug log
export const clearDebugLog = (): void => {
  debugLog = [];
};

// Initialize database connection
export const connectToDatabase = async (): Promise<boolean> => {
  try {
    addDebugEntry(`Connection attempt started. Platform: ${Platform.OS}`);
    
    // If already connected or connection attempt in progress, return early
    if (isConnected) {
      addDebugEntry('Already connected to MongoDB');
      return true;
    }
    
    if (connectionAttemptInProgress) {
      addDebugEntry('Connection attempt already in progress');
      return false;
    }
    
    connectionAttemptInProgress = true;
    connectionErrorMessage = '';
    addDebugEntry('Starting new connection attempt');

    // Check if we're running in a web browser
    if (Platform.OS === 'web') {
      // Web browsers can't directly connect to MongoDB due to CORS and security restrictions
      addDebugEntry('Running in web browser environment - direct MongoDB connections may be restricted');
    }

    // Get the MongoDB URI (from storage or default)
    let uri;
    try {
      addDebugEntry('Retrieving MongoDB URI from AsyncStorage');
      const storedURI = await AsyncStorage.getItem(MONGODB_URI_STORAGE_KEY);
      uri = storedURI || DEFAULT_MONGODB_URI;
      addDebugEntry(`Using MongoDB URI: ${uri}`);
    } catch (storageError) {
      addDebugEntry(`Could not access AsyncStorage: ${storageError}. Using default URI: ${DEFAULT_MONGODB_URI}`);
      uri = DEFAULT_MONGODB_URI;
    }

    // Configure connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
      connectTimeoutMS: 10000, // 10 seconds connection timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    };
    addDebugEntry(`Connection options: ${JSON.stringify(options)}`);

    try {
      // Connect to MongoDB with timeout to prevent hanging
      addDebugEntry(`Connecting to MongoDB at: ${uri}`);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Connection timed out after 15 seconds'));
        }, 15000);
      });

      // For web, handle special cases with different hosts
      if (Platform.OS === 'web') {
        addDebugEntry('Adapting URI for web environment');
        // Try to normalize the URI for web environment
        // In web, 'localhost' might need to be the same host as the web app
        const currentHost = window.location.hostname;
        addDebugEntry(`Current web host: ${currentHost}`);
        if (uri.includes('localhost') && currentHost !== 'localhost') {
          const modifiedUri = uri.replace('localhost', currentHost);
          addDebugEntry(`Modified URI for web environment: ${modifiedUri}`);
          uri = modifiedUri;
        }
      }
      
      // Race the connection against the timeout
      addDebugEntry('Initiating mongoose.connect with timeout race');
      await Promise.race([mongoose.connect(uri, options as any), timeoutPromise]);
      addDebugEntry('Promise.race completed');
      
      // Check connection state
      const readyState = mongoose.connection.readyState;
      addDebugEntry(`Mongoose connection readyState: ${readyState}`);
      isConnected = readyState === 1; // 1 = connected
      
      if (isConnected) {
        addDebugEntry('Successfully connected to MongoDB');
        
        // Set up connection event handlers if the method exists
        if (mongoose.connection && 'on' in mongoose.connection) {
          addDebugEntry('Setting up connection event handlers');
          // Set up error handler
          mongoose.connection.on('error', (err: Error) => {
            addDebugEntry(`MongoDB connection error: ${err.message}`);
            isConnected = false;
            connectionErrorMessage = err.message;
          });
          
          // Set up disconnection handler
          mongoose.connection.on('disconnected', () => {
            addDebugEntry('MongoDB disconnected');
            isConnected = false;
          });
        } else {
          addDebugEntry('Connection event handlers not available on this mongoose instance');
        }
      } else {
        addDebugEntry(`Failed to connect to MongoDB - connection state: ${readyState}`);
        connectionErrorMessage = `Connection state: ${readyState}`;
      }
    } catch (mongoError: any) {
      addDebugEntry(`Error connecting to MongoDB: ${mongoError.message || 'Unknown error'}`);
      if (mongoError.stack) {
        addDebugEntry(`Error stack: ${mongoError.stack.split('\n')[0]}`);
      }
      
      // Add special error handling for common web browser issues
      if (Platform.OS === 'web') {
        if (mongoError.message && (
          mongoError.message.includes('CORS') || 
          mongoError.message.includes('cross-origin') ||
          mongoError.message.includes('access-control-allow-origin')
        )) {
          connectionErrorMessage = 
            'Cross-Origin Request Blocked: MongoDB connections from web browsers are restricted due to security policies. ' +
            'Consider using a backend API server or MongoDB Atlas with proper CORS configuration.';
          addDebugEntry(connectionErrorMessage);
        } else if (mongoError.message && mongoError.message.includes('NetworkError')) {
          connectionErrorMessage = 
            'Network Error: Unable to connect to MongoDB from the web browser. ' +
            'Web browsers cannot make direct TCP connections to MongoDB. ' +
            'Consider using a MongoDB Atlas connection string with proper security settings.';
          addDebugEntry(connectionErrorMessage);
        } else {
          connectionErrorMessage = mongoError.message || 'Unknown MongoDB error';
          addDebugEntry(`Generic connection error: ${connectionErrorMessage}`);
        }
      } else {
        connectionErrorMessage = mongoError.message || 'Unknown MongoDB error';
        addDebugEntry(`Platform-specific connection error: ${connectionErrorMessage}`);
      }
      
      isConnected = false;
    }
    
    addDebugEntry(`Connection attempt completed. Connected: ${isConnected}`);
    return isConnected;
  } catch (error: any) {
    addDebugEntry(`Unhandled error in connectToDatabase: ${error.message || 'Unknown error'}`);
    if (error.stack) {
      addDebugEntry(`Unhandled error stack: ${error.stack.split('\n')[0]}`);
    }
    connectionErrorMessage = error.message || 'Unknown error';
    isConnected = false;
    return false;
  } finally {
    connectionAttemptInProgress = false;
  }
};

// Disconnect from database
export const disconnectFromDatabase = async (): Promise<boolean> => {
  if (!isConnected) {
    addDebugEntry('Not connected, skipping disconnect');
    return true;
  }
  
  try {
    addDebugEntry('Disconnecting from MongoDB');
    await mongoose.disconnect();
    isConnected = false;
    addDebugEntry('Successfully disconnected from MongoDB');
    return true;
  } catch (error: any) {
    addDebugEntry(`Error disconnecting from MongoDB: ${error.message || 'Unknown error'}`);
    return false;
  }
};

// Check connection status
export const isConnectedToDatabase = (): boolean => {
  // Update the connection state based on mongoose connection
  if (mongoose.connection) {
    const readyState = mongoose.connection.readyState;
    const previousState = isConnected;
    isConnected = readyState === 1;
    
    if (previousState !== isConnected) {
      addDebugEntry(`Connection state changed to: ${isConnected ? 'connected' : 'disconnected'} (readyState: ${readyState})`);
    }
  }
  
  return isConnected;
};

// Get connection error message
export const getConnectionErrorMessage = (): string => {
  return connectionErrorMessage;
};

// Set a custom MongoDB URI
export const setMongoDBURI = async (uri: string): Promise<boolean> => {
  try {
    addDebugEntry(`Setting MongoDB URI to: ${uri}`);
    await AsyncStorage.setItem(MONGODB_URI_STORAGE_KEY, uri);
    
    // If already connected, disconnect first
    if (isConnected) {
      addDebugEntry('Already connected, disconnecting before reconnecting with new URI');
      await disconnectFromDatabase();
    }
    
    // Reconnect with the new URI
    addDebugEntry('Reconnecting with new URI');
    return await connectToDatabase();
  } catch (error: any) {
    addDebugEntry(`Error saving MongoDB URI: ${error.message || 'Unknown error'}`);
    return false;
  }
}; 