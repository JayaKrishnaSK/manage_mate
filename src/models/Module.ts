import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
  _id: string;
  projectId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  owners: mongoose.Types.ObjectId[]; // User IDs
  contributors: mongoose.Types.ObjectId[]; // User IDs
  status: 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold';
  dependencies: mongoose.Types.ObjectId[]; // Module IDs that this module depends on
  startDate?: Date;
  endDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  progress: number; // 0-100
  tags: string[];
  attachments: {
    name: string;
    url: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  owners: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  contributors: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'testing', 'completed', 'on_hold'],
    default: 'planning',
  },
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'Module',
  }],
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: null,
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  attachments: [{
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
moduleSchema.index({ projectId: 1 });
moduleSchema.index({ status: 1 });
moduleSchema.index({ owners: 1 });
moduleSchema.index({ contributors: 1 });
moduleSchema.index({ name: 'text', description: 'text' });
moduleSchema.index({ createdAt: -1 });

export const Module = mongoose.models.Module || mongoose.model<IModule>('Module', moduleSchema);