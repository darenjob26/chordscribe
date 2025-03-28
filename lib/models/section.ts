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

// Function to get Section model (ensures model is created only once)
export function getSectionModel(): Model<ISection> {
  try {
    // Try to get existing model first
    return mongoose.model<ISection>('Section');
  } catch (e) {
    // Model doesn't exist yet, create it
    return mongoose.model<ISection>('Section', SectionSchema);
  }
}

// Create and export the Section model
const SectionModel = getSectionModel();
export default SectionModel; 