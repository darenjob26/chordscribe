/**
 * MongoDB Connection Fix Script for ChordScribe
 * 
 * This script attempts to fix common MongoDB connection issues.
 * Run with: node fix-mongodb-connection.js
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { execSync } = require('child_process');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// File paths
const databasePath = path.join(__dirname, '..', 'lib', 'database.ts');
const setupNodePath = path.join(__dirname, 'setup-mongodb-node.js');

// Default connection URI
const DEFAULT_URI = 'mongodb://localhost:27017';

// Test connection to MongoDB
async function testConnection(uri) {
  console.log(`Testing connection to: ${uri}`);
  let client;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connecting...');
    await client.connect();
    
    // Check server info
    const serverInfo = await client.db('admin').command({ serverStatus: 1 });
    console.log(`✅ Successfully connected to MongoDB`);
    console.log(`Server version: ${serverInfo.version}`);
    console.log(`Uptime: ${serverInfo.uptime} seconds`);
    
    // List databases
    const dbs = await client.db().admin().listDatabases();
    console.log('\nAvailable Databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (${(db.sizeOnDisk / (1024 * 1024)).toFixed(2)} MB)`);
    });
    
    // Check for chordscribe database
    const hasChordscribe = dbs.databases.some(db => db.name === 'chordscribe');
    if (hasChordscribe) {
      console.log('\n✅ The "chordscribe" database exists');
      
      // List collections in chordscribe
      const collections = await client.db('chordscribe').listCollections().toArray();
      console.log('Collections in chordscribe:');
      collections.forEach(coll => {
        console.log(`- ${coll.name}`);
      });
    } else {
      console.log('\n❌ The "chordscribe" database does not exist');
    }
    
    return { connected: true, hasChordscribe };
  } catch (error) {
    console.error(`❌ Failed to connect to MongoDB: ${error.message}`);
    return { connected: false, error: error.message };
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Update database.ts file with new URI
function updateDatabaseFile(newUri) {
  const dbFilePath = path.join(__dirname, '..', 'lib', 'database.ts');
  
  if (!fs.existsSync(dbFilePath)) {
    console.log('❌ database.ts file not found');
    return false;
  }
  
  try {
    let content = fs.readFileSync(dbFilePath, 'utf8');
    
    // Replace the MongoDB URI value
    content = content.replace(
      /const DEFAULT_MONGODB_URI = ['"`](.*)['"`];/,
      `const DEFAULT_MONGODB_URI = '${newUri}';`
    );
    
    fs.writeFileSync(dbFilePath, content);
    console.log('✅ Updated connection URI in database.ts');
    return true;
  } catch (error) {
    console.error(`❌ Error updating database.ts: ${error.message}`);
    return false;
  }
}

// Update setup-mongodb-node.js file with new URI
function updateSetupFile(newUri) {
  const setupFilePath = path.join(__dirname, 'setup-mongodb-node.js');
  
  if (!fs.existsSync(setupFilePath)) {
    console.log('❌ setup-mongodb-node.js file not found');
    return false;
  }
  
  try {
    let content = fs.readFileSync(setupFilePath, 'utf8');
    
    // Replace the MongoDB URI value
    content = content.replace(
      /const uri = ['"`](.*)['"`];/,
      `const uri = '${newUri}';`
    );
    
    fs.writeFileSync(setupFilePath, content);
    console.log('✅ Updated connection URI in setup-mongodb-node.js');
    return true;
  } catch (error) {
    console.error(`❌ Error updating setup-mongodb-node.js: ${error.message}`);
    return false;
  }
}

// Start MongoDB service
function startMongoDB() {
  console.log('Attempting to start MongoDB...');
  
  const platform = process.platform;
  let startCommand;
  
  try {
    if (platform === 'darwin') {
      // macOS
      startCommand = 'brew services start mongodb-community';
      execSync(startCommand, { stdio: 'inherit' });
    } else if (platform === 'linux') {
      // Linux
      startCommand = 'sudo systemctl start mongod';
      execSync(startCommand, { stdio: 'inherit' });
    } else if (platform === 'win32') {
      // Windows
      startCommand = 'net start MongoDB';
      execSync(startCommand, { stdio: 'inherit' });
    } else {
      console.log(`❌ Unsupported platform: ${platform}`);
      return false;
    }
    
    console.log('✅ MongoDB service started');
    
    // Wait a bit for MongoDB to fully start
    console.log('Waiting for MongoDB to start...');
    execSync('sleep 3');
    
    // Test connection after starting
    return testConnection(DEFAULT_URI);
  } catch (error) {
    console.error(`❌ Failed to start MongoDB: ${error.message}`);
    return { connected: false, error: error.message };
  }
}

// Check if MongoDB is installed
function checkMongoDBInstalled() {
  console.log('Checking if MongoDB is installed...');
  
  try {
    // Try multiple ways to detect MongoDB
    let isInstalled = false;
    
    // Method 1: Check for mongod process
    try {
      const psOutput = execSync('ps aux | grep mongod | grep -v grep', { encoding: 'utf8' });
      if (psOutput && psOutput.length > 0) {
        console.log('✅ MongoDB is running as a process');
        return true;
      }
    } catch (err) {
      // Process not found, continue checking
    }
    
    // Method 2: Check port 27017
    try {
      const netstatOutput = execSync('netstat -an | grep 27017 | grep LISTEN', { encoding: 'utf8' });
      if (netstatOutput && netstatOutput.length > 0) {
        console.log('✅ MongoDB is listening on port 27017');
        return true;
      }
    } catch (err) {
      // Port not found, continue checking
    }
    
    // Method 3: Check MongoDB version
    try {
      execSync('mongod --version', { stdio: 'ignore' });
      console.log('✅ MongoDB is installed (mongod command exists)');
      return true;
    } catch (err) {
      // Command not found, continue checking
    }
    
    console.log('❌ MongoDB is not installed. Please install MongoDB first.');
    console.log('Installation instructions:');
    console.log('- macOS: brew install mongodb-community');
    console.log('- Linux: sudo apt-get install -y mongodb');
    console.log('- Windows: Visit https://www.mongodb.com/try/download/community');
    
    return false;
  } catch (error) {
    console.error(`Error checking MongoDB installation: ${error.message}`);
    return false;
  }
}

function checkWebBrowserEnvironment() {
  console.log('\n=== Web Browser Environment Check ===');
  console.log('Checking if you are running in a web browser environment...');
  
  // Check if this is running in a web environment or Node.js
  const isWebEnvironment = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  
  if (isWebEnvironment) {
    console.log('⚠️ You appear to be running in a web browser environment');
    console.log('\nWeb Browser Connection Limitations:');
    console.log('1. Web browsers cannot directly connect to MongoDB due to security restrictions');
    console.log('2. CORS (Cross-Origin Resource Sharing) policies will block direct MongoDB connections');
    console.log('3. Web browsers do not support the TCP socket connections that MongoDB requires');
    
    console.log('\nRecommended Solutions:');
    console.log('1. Create a backend API server to communicate with MongoDB');
    console.log('2. Use MongoDB Atlas with appropriate configuration for web access');
    console.log('3. For testing, run your app in Node.js environment instead of a web browser');
    
    console.log('\nFor your Expo application:');
    console.log('- Use "npx expo start" instead of "npx expo start --web" for MongoDB testing');
    console.log('- Or create a simple Express API to handle MongoDB operations on behalf of your web app');
    
    return true;
  } else {
    console.log('✅ You are running in a Node.js environment, direct MongoDB connections are possible');
    return false;
  }
}

// Main function to fix MongoDB connection
async function fixMongoDBConnection() {
  console.log('\n=== MongoDB Connection Fix ===\n');
  
  // Check if running in a web browser environment
  const isWebBrowser = checkWebBrowserEnvironment();
  if (isWebBrowser) {
    console.log('\n❌ Cannot fix MongoDB connection in a web browser environment');
    console.log('Please run this script in a Node.js environment');
    
    if (typeof process !== 'undefined' && typeof process.exit === 'function') {
      process.exit(1);
    }
    return;
  }
  
  // Check if MongoDB is installed
  const isInstalled = checkMongoDBInstalled();
  if (!isInstalled) {
    process.exit(1);
  }
  
  // Test default connection
  console.log('\nTesting default MongoDB connection...');
  const { connected, hasChordscribe, error } = await testConnection(DEFAULT_URI);
  
  if (!connected) {
    console.log('\nConnection failed, attempting to fix...');
    
    // Try to start MongoDB if not connected
    console.log('\nAttempting to start MongoDB service...');
    const startResult = await startMongoDB();
    
    if (!startResult.connected) {
      // If still not connected, ask for custom URI
      return new Promise((resolve) => {
        rl.question('\nPlease enter a custom MongoDB URI, or press Enter to use a different fix: ', async (customUri) => {
          if (customUri && customUri.trim()) {
            const customResult = await testConnection(customUri);
            if (customResult.connected) {
              // Update config files with new URI
              updateDatabaseFile(customUri);
              updateSetupFile(customUri);
              console.log('\n✅ Connection fixed with custom URI');
            } else {
              console.log('\n❌ Could not connect with the provided URI');
            }
          } else {
            console.log('\nSkipping custom URI configuration');
          }
          
          resolve();
          rl.close();
        });
      });
    }
  }
  
  // If connected but no chordscribe database, ask to run setup
  if (connected && !hasChordscribe) {
    return new Promise((resolve) => {
      rl.question('\nThe "chordscribe" database does not exist. Would you like to run the setup script? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          console.log('\nRunning MongoDB setup script...');
          try {
            execSync('node scripts/setup-mongodb-node.js', { stdio: 'inherit' });
            console.log('\n✅ Setup completed successfully');
          } catch (error) {
            console.error(`\n❌ Error running setup script: ${error.message}`);
          }
        }
        
        resolve();
        rl.close();
      });
    });
  }
  
  console.log('\n✅ MongoDB connection is working correctly');
  rl.close();
}

// Run the fix function
fixMongoDBConnection().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 