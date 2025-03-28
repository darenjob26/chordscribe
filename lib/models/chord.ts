import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface representing a Chord document
export interface IChord extends Document {
  root: string;
  quality: string;
  interval: string;
  timing?: number;
  bass?: string;
}

// Define the Chord schema
const ChordSchema = new Schema<IChord>(
  {
    root: { type: String, required: true },
    quality: { type: String, required: true },
    interval: { type: String, required: true },
    timing: { type: Number },
    bass: { type: String },
  },
  { timestamps: true }
);

// Create and export the Chord model
// Handle case where mongoose.models might be undefined
let ChordModel: Model<IChord>;

// Safer model initialization with better error handling
try {
  // Check if mongoose is properly initialized
  if (!mongoose || !mongoose.model) {
    console.error('Mongoose not properly initialized in chord.ts');
    // @ts-ignore - Create a dummy model to prevent crashes
    ChordModel = {
      findById: () => Promise.resolve(null),
      find: () => Promise.resolve([]),
      findOne: () => Promise.resolve(null),
      findByIdAndUpdate: () => Promise.resolve(null),
      findByIdAndDelete: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      new: () => ({}),
    } as any;
  } else {
    try {
      // Try to get existing model
      ChordModel = mongoose.model<IChord>('Chord');
    } catch (error) {
      // Model doesn't exist, create new one
      ChordModel = mongoose.model<IChord>('Chord', ChordSchema);
    }
  }
} catch (error) {
  console.error('Error initializing Chord model:', error);
  // @ts-ignore - Create a dummy model to prevent crashes
  ChordModel = {
    findById: () => Promise.resolve(null),
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findByIdAndUpdate: () => Promise.resolve(null),
    findByIdAndDelete: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    new: () => ({}),
  } as any;
}

export default ChordModel; 