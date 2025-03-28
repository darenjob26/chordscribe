import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaybook extends Document {
  name: string;
  description?: string;
  userId: string;
  songs: mongoose.Types.ObjectId[];
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlaybookSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  userId: { type: String, required: true, ref: 'User' },
  songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  synced: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<IPlaybook>('Playbook', PlaybookSchema); 