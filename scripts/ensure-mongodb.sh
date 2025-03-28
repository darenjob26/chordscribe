#!/bin/bash
# Script to check for MongoDB installation and start it if needed

echo "Checking MongoDB installation..."

# Check if MongoDB is installed
if command -v mongod &> /dev/null; then
    echo "MongoDB is installed."
else
    echo "MongoDB is not installed. Please install MongoDB first."
    echo "macOS: brew install mongodb-community"
    echo "Ubuntu: sudo apt-get install -y mongodb"
    echo "Windows: Visit https://www.mongodb.com/try/download/community"
    exit 1
fi

# Check if MongoDB service is running
if pgrep mongod > /dev/null; then
    echo "MongoDB service is already running."
else
    echo "MongoDB service is not running. Attempting to start..."
    
    # Check for different operating systems
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if brew services list | grep mongodb-community > /dev/null; then
            echo "Starting MongoDB community service..."
            brew services start mongodb-community
        else
            echo "Starting MongoDB manually..."
            mongod --config /usr/local/etc/mongod.conf --fork
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "Starting MongoDB service..."
        sudo systemctl start mongod
    else
        # Other systems - attempt manual start
        echo "Attempting to start MongoDB manually..."
        mongod --fork --logpath /tmp/mongodb.log
    fi
    
    # Check if start was successful
    sleep 2
    if pgrep mongod > /dev/null; then
        echo "MongoDB service started successfully."
    else
        echo "Failed to start MongoDB. Please start it manually."
        exit 1
    fi
fi

# Verify MongoDB connection
echo "Verifying MongoDB connection..."
if echo "db.version()" | mongo --quiet > /dev/null 2>&1; then
    echo "Successfully connected to MongoDB."
    echo "MongoDB is ready for ChordScribe setup."
    echo "Run 'scripts/setup-mongodb.js' or 'node scripts/setup-mongodb-node.js' to initialize the database."
else
    echo "Failed to connect to MongoDB. Please check your MongoDB installation and configuration."
    exit 1
fi

exit 0 