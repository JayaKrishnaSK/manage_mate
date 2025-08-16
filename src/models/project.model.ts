import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  status: 'Active' | 'Archived';
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Archived'],
    default: 'Active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ createdAt: 1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);