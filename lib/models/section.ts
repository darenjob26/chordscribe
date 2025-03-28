import mongoose, { Schema, Document, Model } from 'mongoose';
import { ILine } from './line';

// Interface representing a Section document
export interface ISection extends Document {
  name: string;
  lines: mongoose.Types.ObjectId[] | ILine[];
}

// Define the Section schema
const SectionSchema = new Schema<ISection>(
  {
    name: { type: String, required: true },
    lines: [{ type: Schema.Types.ObjectId, ref: 'Line' }],
  },
  { timestamps: true }
);

// Create and export the Section model
// Handle case where mongoose.models might be undefined
let SectionModel: Model<ISection>;

// Safer model initialization with better error handling
try {
  // Check if mongoose is properly initialized
  if (!mongoose || !mongoose.model) {
    console.error('Mongoose not properly initialized in section.ts');
    // @ts-ignore - Create a dummy model to prevent crashes
    SectionModel = {
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
      SectionModel = mongoose.model<ISection>('Section');
    } catch (error) {
      // Model doesn't exist, create new one
      SectionModel = mongoose.model<ISection>('Section', SectionSchema);
    }
  }
} catch (error) {
  console.error('Error initializing Section model:', error);
  // @ts-ignore - Create a dummy model to prevent crashes
  SectionModel = {
    findById: () => Promise.resolve(null),
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findByIdAndUpdate: () => Promise.resolve(null),
    findByIdAndDelete: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    new: () => ({}),
  } as any;
}

export default SectionModel; 