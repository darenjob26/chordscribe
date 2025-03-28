import mongoose, { Schema, Document, Model } from 'mongoose';
import { IChord } from './chord';

// Interface representing a Line document
export interface ILine extends Document {
  chords: mongoose.Types.ObjectId[] | IChord[];
}

// Define the Line schema
const LineSchema = new Schema<ILine>(
  {
    chords: [{ type: Schema.Types.ObjectId, ref: 'Chord' }],
  },
  { timestamps: true }
);

// Create and export the Line model
// Handle case where mongoose.models might be undefined
let LineModel: Model<ILine>;

// Safer model initialization with better error handling
try {
  // Check if mongoose is properly initialized
  if (!mongoose || !mongoose.model) {
    console.error('Mongoose not properly initialized in line.ts');
    // @ts-ignore - Create a dummy model to prevent crashes
    LineModel = {
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
      LineModel = mongoose.model<ILine>('Line');
    } catch (error) {
      // Model doesn't exist, create new one
      LineModel = mongoose.model<ILine>('Line', LineSchema);
    }
  }
} catch (error) {
  console.error('Error initializing Line model:', error);
  // @ts-ignore - Create a dummy model to prevent crashes
  LineModel = {
    findById: () => Promise.resolve(null),
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findByIdAndUpdate: () => Promise.resolve(null),
    findByIdAndDelete: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    new: () => ({}),
  } as any;
}

export default LineModel; 