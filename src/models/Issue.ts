import mongoose, { Document, Schema } from 'mongoose';

export interface IIssue extends Document {
  _id: string;
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'bug' | 'incident' | 'improvement' | 'request';
  status: 'new' | 'triaged' | 'in_progress' | 'in_review' | 'qa_testing' | 'done' | 'wontfix' | 'duplicate';
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  components: string[];
  environment: 'prod' | 'staging' | 'dev';
  reproducible: boolean;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  labels: string[];
  assignees: mongoose.Types.ObjectId[]; // User IDs
  reporter: mongoose.Types.ObjectId; // User ID
  relatedTasks: mongoose.Types.ObjectId[]; // Task IDs
  duplicateOf?: mongoose.Types.ObjectId; // Issue ID
  sla: {
    targetAt?: Date;
    breached: boolean;
  };
  similarityHash?: string; // For duplicate detection
  attachments: {
    name: string;
    url: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  closedBy?: mongoose.Types.ObjectId;
}

const issueSchema = new Schema<IIssue>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
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
  type: {
    type: String,
    enum: ['bug', 'incident', 'improvement', 'request'],
    default: 'bug',
  },
  status: {
    type: String,
    enum: ['new', 'triaged', 'in_progress', 'in_review', 'qa_testing', 'done', 'wontfix', 'duplicate'],
    default: 'new',
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
  },
  priority: {
    type: String,
    enum: ['p0', 'p1', 'p2', 'p3'],
    default: 'p2',
  },
  components: [{
    type: String,
    trim: true,
  }],
  environment: {
    type: String,
    enum: ['prod', 'staging', 'dev'],
    default: 'dev',
  },
  reproducible: {
    type: Boolean,
    default: false,
  },
  stepsToReproduce: {
    type: String,
    maxlength: 2000,
    default: null,
  },
  expectedResult: {
    type: String,
    maxlength: 1000,
    default: null,
  },
  actualResult: {
    type: String,
    maxlength: 1000,
    default: null,
  },
  labels: [{
    type: String,
    trim: true,
  }],
  assignees: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relatedTasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task',
  }],
  duplicateOf: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    default: null,
  },
  sla: {
    targetAt: {
      type: Date,
      default: null,
    },
    breached: {
      type: Boolean,
      default: false,
    },
  },
  similarityHash: {
    type: String,
    default: null,
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
  closedAt: {
    type: Date,
    default: null,
  },
  closedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
issueSchema.index({ projectId: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ severity: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ assignees: 1 });
issueSchema.index({ reporter: 1 });
issueSchema.index({ components: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ similarityHash: 1 });
issueSchema.index({ title: 'text', description: 'text' });

export const Issue = mongoose.models.Issue || mongoose.model<IIssue>('Issue', issueSchema);