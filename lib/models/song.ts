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

// Function to get Song model (ensures model is created only once)
export function getSongModel(): Model<ISong> {
  try {
    // Try to get existing model first
    return mongoose.model<ISong>('Song');
  } catch (e) {
    // Model doesn't exist yet, create it
    return mongoose.model<ISong>('Song', SongSchema);
  }
}

// Create and export the Song model
const SongModel = getSongModel();
export default SongModel; 