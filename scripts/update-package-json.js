/**
 * Script to update package.json with MongoDB setup commands
 * Run this script with: node update-package-json.js
 */

const fs = require('fs');
const path = require('path');

// Path to package.json (one directory up from this script)
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read the package.json file
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add MongoDB-related scripts
  packageJson.scripts = packageJson.scripts || {};
  
  // Add our MongoDB scripts if they don't exist
  const scriptsToAdd = {
    'mongodb:check': 'bash ./scripts/ensure-mongodb.sh',
    'mongodb:setup': 'node ./scripts/setup-mongodb-node.js',
    'mongodb:setup:shell': 'mongosh ./scripts/setup-mongodb.js',
    'mongodb:test': 'npx expo start',
    'mongodb:test:web': 'npx expo start --web',
    'mongodb:diagnose': 'node ./scripts/mongodb-diagnostic.js',
    'mongodb:fix': 'node ./scripts/fix-mongodb-connection.js'
  };
  
  // Add or update each script
  let updatedCount = 0;
  for (const [key, value] of Object.entries(scriptsToAdd)) {
    if (!packageJson.scripts[key] || packageJson.scripts[key] !== value) {
      packageJson.scripts[key] = value;
      updatedCount++;
    }
  }
  
  // Add MongoDB dependency if not present
  packageJson.dependencies = packageJson.dependencies || {};
  if (!packageJson.dependencies.mongodb) {
    packageJson.dependencies.mongodb = '^5.0.0';
    console.log('Added mongodb dependency to package.json');
  }
  
  // Write the updated package.json file
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  if (updatedCount > 0) {
    console.log(`Added ${updatedCount} MongoDB scripts to package.json`);
    console.log('Now you can run:');
    console.log('  npm run mongodb:check    - Check if MongoDB is installed and running');
    console.log('  npm run mongodb:setup    - Setup the MongoDB database using Node.js');
    console.log('  npm run mongodb:diagnose - Diagnose MongoDB connection issues');
    console.log('  npm run mongodb:fix      - Fix MongoDB connection issues');
    console.log('  npm run mongodb:test     - Run the MongoDB test page in native mode (recommended)');
    console.log('  npm run mongodb:test:web - Run the MongoDB test page in web mode (limited functionality)');
  } else {
    console.log('No changes made to package.json (scripts already exist)');
  }
  
} catch (error) {
  console.error('Error updating package.json:', error.message);
  process.exit(1);
} 