# MongoDB Setup for ChordScribe

This directory contains scripts to set up the MongoDB database for the ChordScribe application.

## Database Structure

The ChordScribe database consists of the following collections:

- **playbooks**: A collection of songs grouped together for performance or practice
- **songs**: Individual songs with their chord progressions
- **sections**: Parts of a song (verse, chorus, bridge, etc.)
- **lines**: Lines of music containing multiple chords
- **chords**: Individual chord data with root, quality, etc.

## Setup Options

### Option 1: Using MongoDB Shell

If you have the MongoDB shell (`mongo` or `mongosh`) installed, you can run:

```bash
mongo setup-mongodb.js
# or for newer MongoDB versions
mongosh setup-mongodb.js
```

### Option 2: Using Node.js

If you prefer to use Node.js, first install the MongoDB driver:

```bash
npm install mongodb
```

Then run:

```bash
node setup-mongodb-node.js
```

## What the Scripts Do

Both scripts perform the following actions:

1. Create the `chordscribe` database (or connect to it if it exists)
2. Drop existing collections to ensure a clean setup
3. Create the necessary collections with proper validation schemas
4. Create indexes for better query performance
5. Add sample data for testing purposes
6. Add timestamps to all documents

## Sample Data

The scripts create a simple data structure for testing:

- A playbook named "Example Playbook"
- A song named "Example Song" in the key of C
- A section named "Verse"
- A line with two chords (C major and G7)

## Customization

If you need to customize the database connection:

- In `setup-mongodb.js`, modify the MongoDB connection command if needed
- In `setup-mongodb-node.js`, modify the `uri` constant at the top of the file

## Troubleshooting

- **Connection issues**: Make sure MongoDB is running on localhost:27017 (or update the URI)
- **Permission issues**: Ensure you have the correct permissions to create databases
- **Validation errors**: If you modify the sample data, ensure it meets the schema requirements 