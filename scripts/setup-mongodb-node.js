/**
 * MongoDB Setup Script for ChordScribe (Node.js version)
 * 
 * This script creates the ChordScribe database and its collections using Node.js.
 * Run with: node setup-mongodb-node.js
 * 
 * Requirements: npm install mongodb
 */

const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URI (update this as needed)
const uri = 'mongodb://localhost:27017';
const dbName = 'chordscribe';

// Collection names
const collections = ['chords', 'lines', 'sections', 'songs', 'playbooks'];

async function setupDatabase() {
  console.log(`Connecting to MongoDB at ${uri}...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB server');

    const db = client.db(dbName);
    console.log(`Using database: ${dbName}`);

    // Drop existing collections
    for (const collection of collections) {
      try {
        const exists = await db.listCollections({ name: collection }).hasNext();
        if (exists) {
          await db.collection(collection).drop();
          console.log(`Dropped collection: ${collection}`);
        } else {
          console.log(`Collection ${collection} does not exist, will be created`);
        }
      } catch (error) {
        console.log(`Error dropping collection ${collection}: ${error.message}`);
      }
    }

    // Create collections with validators
    await db.createCollection("chords", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["root", "quality"],
          properties: {
            root: {
              bsonType: "string",
              description: "The root note of the chord (e.g., C, D, E)"
            },
            quality: {
              bsonType: "string",
              description: "The quality of the chord (e.g., maj, min, 7)"
            },
            interval: {
              bsonType: "string",
              description: "Optional interval extension"
            },
            timing: {
              bsonType: "number",
              description: "Position in beats where the chord is played"
            },
            bass: {
              bsonType: "string",
              description: "Bass note for slash chords"
            }
          }
        }
      }
    });
    console.log("Created collection: chords");

    await db.createCollection("lines", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["chords"],
          properties: {
            chords: {
              bsonType: "array",
              description: "Array of chord ObjectIds"
            }
          }
        }
      }
    });
    console.log("Created collection: lines");

    await db.createCollection("sections", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "lines"],
          properties: {
            name: {
              bsonType: "string",
              description: "Name of the section (e.g., Verse, Chorus)"
            },
            lines: {
              bsonType: "array",
              description: "Array of line ObjectIds"
            }
          }
        }
      }
    });
    console.log("Created collection: sections");

    await db.createCollection("songs", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["title", "key"],
          properties: {
            title: {
              bsonType: "string",
              description: "Title of the song"
            },
            key: {
              bsonType: "string",
              description: "Musical key of the song"
            },
            sections: {
              bsonType: "array",
              description: "Array of section ObjectIds"
            }
          }
        }
      }
    });
    console.log("Created collection: songs");

    await db.createCollection("playbooks", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name"],
          properties: {
            name: {
              bsonType: "string",
              description: "Name of the playbook"
            },
            description: {
              bsonType: "string",
              description: "Description of the playbook"
            },
            songs: {
              bsonType: "array",
              description: "Array of song ObjectIds"
            }
          }
        }
      }
    });
    console.log("Created collection: playbooks");

    // Create indexes for better performance
    await db.collection('chords').createIndex({ root: 1, quality: 1 });
    await db.collection('songs').createIndex({ title: 1 });
    await db.collection('playbooks').createIndex({ name: 1 });
    console.log("Created indexes for better performance");

    // Create a sample playbook with a song for testing
    const exampleChordId1 = new ObjectId();
    const exampleChordId2 = new ObjectId();
    const exampleLineId = new ObjectId();
    const exampleSectionId = new ObjectId();
    const exampleSongId = new ObjectId();
    const examplePlaybookId = new ObjectId();

    // Insert sample chords
    await db.collection('chords').insertMany([
      {
        _id: exampleChordId1,
        root: "C",
        quality: "maj",
        timing: 0
      },
      {
        _id: exampleChordId2,
        root: "G",
        quality: "7",
        timing: 2
      }
    ]);
    console.log("Added sample chords");

    // Insert sample line
    await db.collection('lines').insertOne({
      _id: exampleLineId,
      chords: [exampleChordId1, exampleChordId2]
    });
    console.log("Added sample line");

    // Insert sample section
    await db.collection('sections').insertOne({
      _id: exampleSectionId,
      name: "Verse",
      lines: [exampleLineId]
    });
    console.log("Added sample section");

    // Insert sample song
    await db.collection('songs').insertOne({
      _id: exampleSongId,
      title: "Example Song",
      key: "C",
      sections: [exampleSectionId]
    });
    console.log("Added sample song");

    // Insert sample playbook
    await db.collection('playbooks').insertOne({
      _id: examplePlaybookId,
      name: "Example Playbook",
      description: "A sample playbook for testing",
      songs: [exampleSongId]
    });
    console.log("Added sample playbook");

    // Add timestamps to all documents
    const now = new Date();
    for (const collection of collections) {
      await db.collection(collection).updateMany(
        {},
        { $set: { createdAt: now, updatedAt: now } }
      );
      console.log(`Added timestamps to ${collection}`);
    }

    // Print some stats to verify
    for (const collection of collections) {
      const count = await db.collection(collection).countDocuments();
      console.log(`${collection}: ${count} document(s)`);
    }

    console.log("\nSetup complete! The ChordScribe database is ready to use.");
    console.log("Added a sample playbook with one song for testing purposes.");
    console.log("\nSummary of what was created:");
    console.log("- Database: chordscribe");
    console.log("- Collections: chords, lines, sections, songs, playbooks");
    console.log("- Indexes for better performance");
    console.log("- Sample data for testing");

  } catch (error) {
    console.error(`Error setting up database: ${error.message}`);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the setup
setupDatabase().catch(console.error); 