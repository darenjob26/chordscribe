import mongoose, { Schema, Document } from 'mongoose';

export interface ISong extends Document {
  _id: string;
  title: string;
  key: string;
  sections: {
    id: string;
    name: string;
    lines: {
      id: string;
      chords: {
        id: string;
        root: string;
        quality: string;
        interval: string;
        timing?: number;
        bass?: string;
      }[];
    }[];
  }[];
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChordSchema = new Schema({
  root: { type: String, required: true },
  quality: { type: String, required: true },
  interval: { type: String, required: true },
  timing: { type: Number },
  bass: { type: String }
}, { _id: true });

const LineSchema = new Schema({
  chords: [ChordSchema]
}, { _id: true });

const SectionSchema = new Schema({
  name: { type: String, required: true },
  lines: [LineSchema]
}, { _id: true });

const SongSchema = new Schema({
  userId: { type: String, required: true, ref: 'User' },
  title: { type: String, required: true },
  key: { type: String, required: true },
  sections: [SectionSchema],
  synced: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<ISong>('Song', SongSchema); 