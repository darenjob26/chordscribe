import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISong } from './song';

// Interface representing a Playbook document
export interface IPlaybook extends Document {
  name: string;
  description?: string;
  songs: mongoose.Types.ObjectId[] | ISong[];
}

// Define the Playbook schema
const PlaybookSchema = new Schema<IPlaybook>(
  {
    name: { type: String, required: true },
    description: { type: String },
    songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  },
  { timestamps: true }
);

// Create and export the Playbook model
// Handle case where mongoose.models might be undefined
let PlaybookModel: Model<IPlaybook>;

// Safer model initialization with better error handling
try {
  // Check if mongoose is properly initialized
  if (!mongoose || !mongoose.model) {
    console.error('Mongoose not properly initialized in playbook.ts');
    // @ts-ignore - Create a dummy model to prevent crashes
    PlaybookModel = {
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
      PlaybookModel = mongoose.model<IPlaybook>('Playbook');
    } catch (error) {
      // Model doesn't exist, create new one
      PlaybookModel = mongoose.model<IPlaybook>('Playbook', PlaybookSchema);
    }
  }
} catch (error) {
  console.error('Error initializing Playbook model:', error);
  // @ts-ignore - Create a dummy model to prevent crashes
  PlaybookModel = {
    findById: () => Promise.resolve(null),
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findByIdAndUpdate: () => Promise.resolve(null),
    findByIdAndDelete: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    new: () => ({}),
  } as any;
}

export default PlaybookModel; 