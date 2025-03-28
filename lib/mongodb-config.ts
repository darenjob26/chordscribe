// Ensure we import mongoose correctly and handle potential import issues
import { Mongoose } from 'mongoose';

// Define a mock Mongoose interface
interface MockMongoose {
  connection: { readyState: number };
  models: Record<string, any>;
  model: (name: string, schema?: any) => any;
  Schema: (definition?: any, options?: any) => any;
  connect: (uri: string, options?: any) => Promise<any>;
  disconnect: () => Promise<void>;
  set: (key: string, value: any) => any;
}

// Create a variable to hold the mongoose instance
let mongoose: Mongoose | MockMongoose;

try {
  // Try to import mongoose
  mongoose = require('mongoose');
  
  // Verify the import worked
  if (!mongoose || typeof mongoose !== 'object' || !mongoose.set) {
    console.error('Mongoose import failed - using mock implementation');
    mongoose = {
      connection: { readyState: 0 },
      models: {},
      model: (name: string, schema?: any) => {
        console.warn(`Attempted to create model ${name} but mongoose is not available`);
        return {};
      },
      Schema: function() { return {}; },
      connect: () => Promise.resolve(),
      disconnect: () => Promise.resolve(),
      set: () => {}
    };
  }
} catch (importError) {
  console.error('Error importing mongoose:', importError);
  // Create a mock mongoose object
  mongoose = {
    connection: { readyState: 0 },
    models: {},
    model: (name: string, schema?: any) => {
      console.warn(`Attempted to create model ${name} but mongoose is not available`);
      return {};
    },
    Schema: function() { return {}; },
    connect: () => Promise.resolve(),
    disconnect: () => Promise.resolve(),
    set: () => {}
  };
}

// Import other required dependencies
import 'react-native-get-random-values';

// Configure Mongoose for React Native environment
export function configureMongoDB(): Mongoose | MockMongoose {
  try {
    // Safely set mongoose configuration options
    try {
      // Prevent Mongoose from using Node.js specific features
      mongoose.set('strictQuery', true);
      
      // Add debug logging for connection issues
      mongoose.set('debug', __DEV__ ? console.debug.bind(console) : false);
    } catch (configError) {
      console.warn('Error setting mongoose configuration:', configError);
    }
    
    // Handle Buffer not defined in React Native
    if (typeof global.Buffer === 'undefined') {
      try {
        global.Buffer = require('buffer').Buffer;
      } catch (bufferError) {
        console.warn('Error setting up Buffer polyfill:', bufferError);
      }
    }
    
    // In React Native, we need to handle the lack of certain Node.js globals
    if (typeof process === 'undefined') {
      try {
        // @ts-ignore
        global.process = { browser: true };
      } catch (processError) {
        console.warn('Error setting up process polyfill:', processError);
      }
    }
    
    console.log('MongoDB configured for React Native environment');
    
    return mongoose;
  } catch (error) {
    console.error('Error configuring MongoDB:', error);
    
    // Return a mock mongoose object to prevent crashes
    return {
      connection: { readyState: 0 },
      models: {},
      model: (name: string, schema?: any) => {
        console.warn(`Attempted to create model ${name} but mongoose configuration failed`);
        return {};
      },
      Schema: function() { return {}; },
      connect: () => Promise.resolve(),
      disconnect: () => Promise.resolve(),
      set: () => {}
    };
  }
}

// Export a singleton instance of the configured mongoose
const configuredMongoose = configureMongoDB();
export default configuredMongoose; 