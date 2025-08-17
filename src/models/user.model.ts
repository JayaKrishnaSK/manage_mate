import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  systemRole: 'Admin' | 'User';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  systemRole: {
    type: String,
    enum: ['Admin', 'User'],
    default: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes
// UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);