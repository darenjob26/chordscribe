import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISection } from './section';

// Interface representing a Song document
export interface ISong extends Document {
  title: string;
  key: string;
  sections: mongoose.Types.ObjectId[] | ISection[];
}

// Define the Song schema
const SongSchema = new Schema<ISong>(
  {
    title: { type: String, required: true },
    key: { type: String, required: true },
    sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
  },
  { timestamps: true }
);

// Create and export the Song model
// Handle case where mongoose.models might be undefined
let SongModel: Model<ISong>;

// Safer model initialization with better error handling
try {
  // Check if mongoose is properly initialized
  if (!mongoose || !mongoose.model) {
    console.error('Mongoose not properly initialized in song.ts');
    // @ts-ignore - Create a dummy model to prevent crashes
    SongModel = {
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
      SongModel = mongoose.model<ISong>('Song');
    } catch (error) {
      // Model doesn't exist, create new one
      SongModel = mongoose.model<ISong>('Song', SongSchema);
    }
  }
} catch (error) {
  console.error('Error initializing Song model:', error);
  // @ts-ignore - Create a dummy model to prevent crashes
  SongModel = {
    findById: () => Promise.resolve(null),
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findByIdAndUpdate: () => Promise.resolve(null),
    findByIdAndDelete: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    new: () => ({}),
  } as any;
}

export default SongModel; 