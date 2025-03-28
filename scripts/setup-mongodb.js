/**
 * MongoDB Setup Script for ChordScribe
 * 
 * This script creates the ChordScribe database and its collections.
 * Run with: mongo setup-mongodb.js
 * or: mongosh setup-mongodb.js
 */

// Switch to or create the chordscribe database
db = db.getSiblingDB('chordscribe');

console.log("Connected to database: chordscribe");

// Drop collections if they exist (for clean setup)
const collections = ['chords', 'lines', 'sections', 'songs', 'playbooks'];
collections.forEach(collection => {
  try {
    db[collection].drop();
    console.log(`Dropped collection: ${collection}`);
  } catch (error) {
    console.log(`Collection ${collection} does not exist, will be created`);
  }
});

// Create collections with validators
db.createCollection("chords", {
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

db.createCollection("lines", {
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

db.createCollection("sections", {
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

db.createCollection("songs", {
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

db.createCollection("playbooks", {
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
db.chords.createIndex({ root: 1, quality: 1 });
db.songs.createIndex({ title: 1 });
db.playbooks.createIndex({ name: 1 });

console.log("Created indexes for better performance");

// Create a sample playbook with a song for testing
const exampleChordId1 = ObjectId();
const exampleChordId2 = ObjectId();
const exampleLineId = ObjectId();
const exampleSectionId = ObjectId();
const exampleSongId = ObjectId();
const examplePlaybookId = ObjectId();

// Insert sample chords
db.chords.insertMany([
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
db.lines.insertOne({
  _id: exampleLineId,
  chords: [exampleChordId1, exampleChordId2]
});
console.log("Added sample line");

// Insert sample section
db.sections.insertOne({
  _id: exampleSectionId,
  name: "Verse",
  lines: [exampleLineId]
});
console.log("Added sample section");

// Insert sample song
db.songs.insertOne({
  _id: exampleSongId,
  title: "Example Song",
  key: "C",
  sections: [exampleSectionId]
});
console.log("Added sample song");

// Insert sample playbook
db.playbooks.insertOne({
  _id: examplePlaybookId,
  name: "Example Playbook",
  description: "A sample playbook for testing",
  songs: [exampleSongId]
});
console.log("Added sample playbook");

// Add timestamps to all documents
const addTimestamps = (collection) => {
  const now = new Date();
  db[collection].updateMany(
    {},
    { $set: { createdAt: now, updatedAt: now } }
  );
  console.log(`Added timestamps to ${collection}`);
};

collections.forEach(addTimestamps);

console.log("\nSetup complete! The ChordScribe database is ready to use.");
console.log("Added a sample playbook with one song for testing purposes.");
console.log("\nSummary of what was created:");
console.log("- Database: chordscribe");
console.log("- Collections: chords, lines, sections, songs, playbooks");
console.log("- Indexes for better performance");
console.log("- Sample data for testing");

// Print some stats to verify
collections.forEach(collection => {
  const count = db[collection].count();
  console.log(`${collection}: ${count} document(s)`);
}); 