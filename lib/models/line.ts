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

// Function to get Line model (ensures model is created only once)
export function getLineModel(): Model<ILine> {
  try {
    // Try to get existing model first
    return mongoose.model<ILine>('Line');
  } catch (e) {
    // Model doesn't exist yet, create it
    return mongoose.model<ILine>('Line', LineSchema);
  }
}

// Create and export the Line model
const LineModel = getLineModel();
export default LineModel; 