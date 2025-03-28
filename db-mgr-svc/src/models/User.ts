import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
