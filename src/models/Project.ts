import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
  template: 'agile' | 'waterfall' | 'kanban' | 'custom';
  owners: mongoose.Types.ObjectId[]; // User IDs
  managers: mongoose.Types.ObjectId[]; // User IDs
  qaLeads: mongoose.Types.ObjectId[]; // User IDs
  members: mongoose.Types.ObjectId[]; // User IDs
  guestUsers: mongoose.Types.ObjectId[]; // User IDs
  components: string[]; // Component names
  startDate?: Date;
  endDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
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

const projectSchema = new Schema<IProject>({
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
  status: {
    type: String,
    enum: ['active', 'on_hold', 'completed', 'cancelled'],
    default: 'active',
  },
  template: {
    type: String,
    enum: ['agile', 'waterfall', 'kanban', 'custom'],
    default: 'agile',
  },
  owners: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  managers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  qaLeads: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  guestUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  components: [{
    type: String,
    trim: true,
  }],
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
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
projectSchema.index({ name: 'text', description: 'text' });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ owners: 1 });
projectSchema.index({ managers: 1 });
projectSchema.index({ members: 1 });
projectSchema.index({ createdAt: -1 });

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);