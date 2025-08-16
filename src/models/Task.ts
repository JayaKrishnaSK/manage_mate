import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  _id: string;
  projectId: mongoose.Types.ObjectId;
  moduleId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'testing' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignees: mongoose.Types.ObjectId[]; // User IDs
  reporter: mongoose.Types.ObjectId; // User ID
  labels: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  order: number; // For Kanban ordering
  attachments: {
    name: string;
    url: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }[];
  todos: {
    text: string;
    completed: boolean;
    createdAt: Date;
    completedAt?: Date;
  }[];
  relatedIssues: mongoose.Types.ObjectId[]; // Issue IDs
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  moduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    default: null,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'in_review', 'testing', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  assignees: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  labels: [{
    type: String,
    trim: true,
  }],
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
  dueDate: {
    type: Date,
    default: null,
  },
  startDate: {
    type: Date,
    default: null,
  },
  completedDate: {
    type: Date,
    default: null,
  },
  order: {
    type: Number,
    default: 0,
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
  todos: [{
    text: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  }],
  relatedIssues: [{
    type: Schema.Types.ObjectId,
    ref: 'Issue',
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
taskSchema.index({ projectId: 1 });
taskSchema.index({ moduleId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ order: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);