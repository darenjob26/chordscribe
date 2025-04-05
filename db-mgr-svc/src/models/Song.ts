import mongoose, { Schema, Document } from 'mongoose';

export interface ISong extends Document {
  _id: string;
  title: string;
  key: string;
  sections: {
    _id: string;
    name: string;
    lines: {
      _id: string;
      chords: {
        _id: string;
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
  _id: { type: String, required: true },
  root: { type: String, required: true },
  quality: { type: String, required: true },
  interval: { type: String, required: true },
  timing: { type: Number },
  bass: { type: String }
}, { _id: false });

const LineSchema = new Schema({
  _id: { type: String, required: true },
  chords: [ChordSchema]
}, { _id: false });

const SectionSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  lines: [LineSchema]
}, { _id: false });

const SongSchema = new Schema({
  userId: { type: String, required: true, ref: 'User' },
  playbookId: { type: String, required: true, ref: 'Playbook' },
  title: { type: String, required: true },
  key: { type: String, required: true },
  sections: [SectionSchema],
  synced: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<ISong>('Song', SongSchema); 