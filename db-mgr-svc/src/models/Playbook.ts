import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaybook extends Document {
  name: string;
  description?: string;
  songs: mongoose.Types.ObjectId[];
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlaybookSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  synced: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<IPlaybook>('Playbook', PlaybookSchema); 