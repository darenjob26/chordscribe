// Import Mongoose types without requiring the module
import type { Mongoose } from 'mongoose';
import 'react-native-get-random-values';
import { Platform } from 'react-native';

// Define a mock Mongoose interface for React Native
interface MockMongoose {
  connection: { readyState: number };
  models: Record<string, any>;
  model: (name: string, schema?: any) => any;
  Schema: (definition?: any, options?: any) => any;
  connect: (uri: string, options?: any) => Promise<any>;
  disconnect: () => Promise<void>;
  set: (key: string, value: any) => any;
}

// Diagnostic logging
const logImportDiagnostic = (message: string) => {
  console.log(`[MongooseConfig] ${message}`);
};

// Try to import the real mongoose module with error handling
let mongoose: Mongoose | MockMongoose;

try {
  logImportDiagnostic(`Starting mongoose import (Platform: ${Platform.OS})`);
  
  // Special handling for web
  if (Platform.OS === 'web') {
    logImportDiagnostic('Running in web environment - this might cause import issues');
    
    try {
      // In web environments, require might not work as expected
      // @ts-ignore - we handle failures appropriately below
      const mongooseModule = require('mongoose');
      
      if (mongooseModule && typeof mongooseModule.connect === 'function') {
        logImportDiagnostic('Successfully imported mongoose in web environment');
        mongoose = mongooseModule;
      } else {
        logImportDiagnostic('Web import returned invalid mongoose module - using mock implementation');
        mongoose = createMockMongoose();
      }
    } catch (webError: any) {
      logImportDiagnostic(`Web import error: ${webError.message || 'Unknown error'}`);
      mongoose = createMockMongoose();
    }
  } else {
    // Normal import for non-web platforms
    try {
      // Dynamically import mongoose to prevent bundling issues
      const mongooseModule = require('mongoose');
      
      // Check if mongoose was properly imported
      if (!mongooseModule || typeof mongooseModule.connect !== 'function') {
        logImportDiagnostic('Mongoose import failed or invalid - using mock implementation');
        mongoose = createMockMongoose();
      } else {
        logImportDiagnostic('Successfully imported mongoose');
        mongoose = mongooseModule;
      }
    } catch (nativeError: any) {
      logImportDiagnostic(`Native import error: ${nativeError.message || 'Unknown error'}`);
      mongoose = createMockMongoose();
    }
  }
} catch (error: any) {
  logImportDiagnostic(`General error importing mongoose: ${error.message || 'Unknown error'}`);
  mongoose = createMockMongoose();
}

// Function to create a mock Mongoose object
function createMockMongoose(): MockMongoose {
  logImportDiagnostic('Creating mock mongoose implementation');
  return {
    connection: { readyState: 0 },
    models: {},
    model: (name: string, schema?: any) => {
      console.warn(`Attempted to create model ${name} but mongoose is not available`);
      return {};
    },
    Schema: function() { return {}; },
    connect: (uri: string) => {
      logImportDiagnostic(`Mock mongoose connect called with URI: ${uri}`);
      return Promise.resolve({ connection: { readyState: 0 } });
    },
    disconnect: () => {
      logImportDiagnostic('Mock mongoose disconnect called');
      return Promise.resolve();
    },
    set: (key: string, value: any) => {}
  };
}

// Configure Mongoose for React Native environment
export function configureMongoDB() {
  try {
    logImportDiagnostic('Configuring MongoDB for React Native environment');
    
    // Set mongoose options
    if (typeof mongoose.set === 'function') {
      // Set mongoose options if real mongoose is available
      logImportDiagnostic('Setting mongoose options');
      mongoose.set('strictQuery', true);
      
      if (__DEV__) {
        mongoose.set('debug', true);
      }
    }

    // Handle Buffer not defined in React Native
    if (typeof global.Buffer === 'undefined') {
      logImportDiagnostic('global.Buffer is undefined, attempting to define it');
      try {
        global.Buffer = require('buffer').Buffer;
        logImportDiagnostic('Successfully defined global.Buffer');
      } catch (bufferError: any) {
        logImportDiagnostic(`Failed to define global.Buffer: ${bufferError.message || 'Unknown error'}`);
      }
    }

    // In React Native, we need to handle the lack of certain Node.js globals
    if (typeof process === 'undefined') {
      logImportDiagnostic('global.process is undefined, defining a basic version');
      // @ts-ignore
      global.process = { browser: true };
    }

    // Check if we have a working mongoose instance
    const isRealMongoose = mongoose && typeof mongoose.connect === 'function';
    logImportDiagnostic(`Using ${isRealMongoose ? 'real' : 'mock'} mongoose implementation`);
    
    return mongoose;
  } catch (error: any) {
    logImportDiagnostic(`Failed to configure MongoDB: ${error.message || 'Unknown error'}`);
    return mongoose; // Return mongoose even if configuration fails
  }
}

// Check if we can actually connect
const mongooseInstance = configureMongoDB();

// Export the configured mongoose instance
export default mongooseInstance; 