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

// Function to get Playbook model (ensures model is created only once)
export function getPlaybookModel(): Model<IPlaybook> {
  try {
    // Try to get existing model first
    return mongoose.model<IPlaybook>('Playbook');
  } catch (e) {
    // Model doesn't exist yet, create it
    return mongoose.model<IPlaybook>('Playbook', PlaybookSchema);
  }
}

// Create and export the Playbook model
const PlaybookModel = getPlaybookModel();
export default PlaybookModel; 