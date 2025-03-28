/**
 * MongoDB Connection Diagnostic Script for ChordScribe
 * 
 * This script tests the MongoDB connection and provides detailed error information.
 * Run with: node mongodb-diagnostic.js
 */

const { MongoClient } = require('mongodb');
const os = require('os');
const { execSync } = require('child_process');

// Default connection URI
const DEFAULT_URI = 'mongodb://localhost:27017';

// Try different possible connection strings
const connectionURIs = [
  DEFAULT_URI,
  'mongodb://127.0.0.1:27017',
  // Add more connection URIs if needed
];

// Get MongoDB process info
function getMongoProcessInfo() {
  try {
    console.log('\n=== MongoDB Process Information ===');
    
    if (process.platform === 'win32') {
      const tasklistOutput = execSync('tasklist | findstr mongo').toString();
      console.log('MongoDB processes (Windows):');
      console.log(tasklistOutput);
    } else {
      const psOutput = execSync('ps aux | grep mongo[d]').toString();
      console.log('MongoDB processes (Unix):');
      console.log(psOutput);
      
      try {
        const netstatOutput = execSync('netstat -tuln | grep 27017').toString();
        console.log('\nPort 27017 status:');
        console.log(netstatOutput || 'No process listening on port 27017');
      } catch (e) {
        console.log('\nCould not check port status: netstat command failed');
      }
    }
  } catch (e) {
    console.log(`Could not get MongoDB process information: ${e.message}`);
  }
}

// Check MongoDB connection
async function checkMongoDBConnection(uri) {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    connectTimeoutMS: 10000,        // 10 seconds timeout
  });
  
  console.log(`\nTesting connection to: ${uri}`);
  
  try {
    // Attempt to connect
    console.log('Connecting...');
    await client.connect();
    
    // Get server info
    const adminDb = client.db('admin');
    const serverInfo = await adminDb.command({ serverStatus: 1 });
    
    console.log('✅ Successfully connected to MongoDB');
    console.log(`Server version: ${serverInfo.version}`);
    console.log(`Uptime: ${serverInfo.uptime} seconds`);
    
    // List databases
    const dbs = await client.db().admin().listDatabases();
    console.log('\nAvailable Databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (${Math.round(db.sizeOnDisk / 1024 / 1024 * 100) / 100} MB)`);
    });
    
    // Check for chordscribe database
    const hasChordscribe = dbs.databases.some(db => db.name === 'chordscribe');
    if (hasChordscribe) {
      console.log('\n✅ The "chordscribe" database exists');
      
      // Check collections in chordscribe
      const chordscribeDb = client.db('chordscribe');
      const collections = await chordscribeDb.listCollections().toArray();
      
      console.log('Collections in chordscribe:');
      if (collections.length === 0) {
        console.log('No collections found. You may need to run the setup script.');
      } else {
        collections.forEach(coll => {
          console.log(`- ${coll.name}`);
        });
      }
    } else {
      console.log('\n❌ The "chordscribe" database does not exist. You need to run the setup script.');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    
    // Provide more detailed error diagnostics
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\nDiagnosis: MongoDB is not running or not accepting connections on the specified host and port.');
      console.log('Solutions:');
      console.log('1. Make sure MongoDB is installed and running');
      console.log('2. Check if MongoDB is running on a different port');
      console.log('3. Check if there are firewall rules blocking the connection');
    } else if (error.message.includes('authentication failed')) {
      console.log('\nDiagnosis: Authentication is required but credentials are incorrect or missing.');
      console.log('Solutions:');
      console.log('1. Update connection string to include username and password');
      console.log('2. Create a user with appropriate permissions');
    } else if (error.message.includes('Server selection timeout')) {
      console.log('\nDiagnosis: MongoDB server is unreachable within the timeout period.');
      console.log('Solutions:');
      console.log('1. Check if MongoDB is running under heavy load');
      console.log('2. Increase the serverSelectionTimeoutMS in the connection options');
      console.log('3. Check network connectivity between your app and MongoDB');
    }
    
    return false;
  } finally {
    await client.close();
  }
}

// Get system information
function getSystemInfo() {
  console.log('\n=== System Information ===');
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Node.js version: ${process.version}`);
  console.log(`Hostname: ${os.hostname()}`);
  console.log(`Network interfaces:`);
  
  const networkInterfaces = os.networkInterfaces();
  for (const [name, interfaces] of Object.entries(networkInterfaces)) {
    for (const interface of interfaces) {
      if (interface.family === 'IPv4' || interface.family === 4) {
        console.log(`  ${name}: ${interface.address}`);
      }
    }
  }
}

// Check MongoDB configuration
async function checkPackageConfiguration() {
  const fs = require('fs');
  const path = require('path');
  
  console.log('\n=== Package Configuration ===');
  
  // Check package.json
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    console.log('MongoDB dependency version:', packageJson.dependencies.mongodb || 'Not found');
    
    // Check for mongodb-related scripts
    console.log('\nMongoDB scripts in package.json:');
    for (const [key, value] of Object.entries(packageJson.scripts || {})) {
      if (key.includes('mongo') || value.includes('mongo')) {
        console.log(`- ${key}: ${value}`);
      }
    }
  } catch (e) {
    console.log(`Could not read package.json: ${e.message}`);
  }
  
  // Check lib/database.ts
  try {
    const databasePath = path.join(__dirname, '..', 'lib', 'database.ts');
    if (fs.existsSync(databasePath)) {
      const content = fs.readFileSync(databasePath, 'utf8');
      
      // Extract MongoDB URI
      const uriMatch = content.match(/const\s+DEFAULT_MONGODB_URI\s*=\s*['"](.*)['"]/);
      if (uriMatch) {
        console.log('\nDefault MongoDB URI in database.ts:', uriMatch[1]);
      }
      
      // Check connection options
      console.log('\nConnection options in database.ts:');
      if (content.includes('useNewUrlParser')) console.log('- useNewUrlParser is set');
      if (content.includes('useUnifiedTopology')) console.log('- useUnifiedTopology is set');
      
      // Check timeout settings
      const timeoutMatches = content.match(/(\w+TimeoutMS)\s*:\s*(\d+)/g);
      if (timeoutMatches) {
        timeoutMatches.forEach(match => {
          console.log(`- ${match.trim()}`);
        });
      }
    } else {
      console.log('database.ts file not found');
    }
  } catch (e) {
    console.log(`Could not read database.ts: ${e.message}`);
  }
}

// Check web browser specific issues
function checkWebBrowserIssues() {
  console.log('\n=== Web Browser Connection Issues ===');
  console.log('MongoDB connections from web browsers are restricted due to security policies.');
  console.log('Common issues and solutions:');
  
  console.log('\n1. CORS (Cross-Origin Resource Sharing) Issues:');
  console.log('   - Web browsers cannot connect directly to MongoDB due to same-origin policy');
  console.log('   - Solution: Use a backend API service that connects to MongoDB on behalf of the web app');
  
  console.log('\n2. MongoDB Atlas:');
  console.log('   - If you need direct connection from a web app, MongoDB Atlas with proper security settings is required');
  console.log('   - Configure MongoDB Atlas with:');
  console.log('     * IP Whitelist to restrict access');
  console.log('     * Strong authentication');
  console.log('     * Use connection string with +srv format: mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>');
  
  console.log('\n3. Development Testing:');
  console.log('   - For development/testing, you can:');
  console.log('     * Create a simple Node.js API service to proxy requests to MongoDB');
  console.log('     * Use MongoDB Atlas with temporary IP whitelist entries');
  console.log('     * Use MongoDB Realm/App Services for web access to MongoDB');
  
  console.log('\nRecommended Architecture for Web Applications:');
  console.log('Web App (React/Expo) -> API Server (Node.js) -> MongoDB');
}

// Run all checks
async function runDiagnostics() {
  console.log('=== MongoDB Connection Diagnostics ===');
  
  getSystemInfo();
  getMongoProcessInfo();
  await checkPackageConfiguration();
  
  console.log('\n=== Connection Tests ===');
  
  let connectionSuccess = false;
  
  // Try all connection URIs
  for (const uri of connectionURIs) {
    if (await checkMongoDBConnection(uri)) {
      connectionSuccess = true;
      break;
    }
  }
  
  if (!connectionSuccess) {
    console.log('\n=== Try Custom Connection URI ===');
    console.log('Your MongoDB might be using a different connection string.');
    console.log('In your application, update the MongoDB URI in:');
    console.log('1. lib/database.ts - Change DEFAULT_MONGODB_URI');
    console.log('2. scripts/setup-mongodb-node.js - Change "uri" constant');
    console.log('\nCommon MongoDB connection string formats:');
    console.log('- Local without auth: mongodb://localhost:27017');
    console.log('- Local with auth: mongodb://username:password@localhost:27017');
    console.log('- Atlas: mongodb+srv://username:password@cluster.mongodb.net');
  }
  
  // Always provide web browser connection information
  checkWebBrowserIssues();
  
  console.log('\n=== Diagnostics Complete ===');
}

runDiagnostics().catch(console.error); 