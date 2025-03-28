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

// Function to get Chord model (ensures model is created only once)
export function getChordModel(): Model<IChord> {
  try {
    // Try to get existing model first
    return mongoose.model<IChord>('Chord');
  } catch (e) {
    // Model doesn't exist yet, create it
    return mongoose.model<IChord>('Chord', ChordSchema);
  }
}

// Create and export the Chord model
const ChordModel = getChordModel();
export default ChordModel; 