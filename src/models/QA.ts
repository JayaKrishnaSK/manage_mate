import mongoose, { Document, Schema } from 'mongoose';

export interface ITestCase extends Document {
  _id: string;
  projectId: mongoose.Types.ObjectId;
  moduleId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  component: string;
  preconditions?: string;
  testSteps: {
    step: number;
    action: string;
    expectedResult: string;
  }[];
  testData?: string;
  tags: string[];
  automatable: boolean;
  estimatedTime?: number; // in minutes
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const testCaseSchema = new Schema<ITestCase>({
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
    maxlength: 2000,
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
  },
  component: {
    type: String,
    required: true,
    trim: true,
  },
  preconditions: {
    type: String,
    maxlength: 1000,
    default: null,
  },
  testSteps: [{
    step: {
      type: Number,
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    expectedResult: {
      type: String,
      required: true,
      trim: true,
    },
  }],
  testData: {
    type: String,
    maxlength: 1000,
    default: null,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  automatable: {
    type: Boolean,
    default: false,
  },
  estimatedTime: {
    type: Number,
    min: 0,
    default: null,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
testCaseSchema.index({ projectId: 1 });
testCaseSchema.index({ moduleId: 1 });
testCaseSchema.index({ component: 1 });
testCaseSchema.index({ priority: 1 });
testCaseSchema.index({ tags: 1 });
testCaseSchema.index({ createdAt: -1 });
testCaseSchema.index({ title: 'text', description: 'text' });

export const TestCase = mongoose.models.TestCase || mongoose.model<ITestCase>('TestCase', testCaseSchema);

export interface ITestSuite extends Document {
  _id: string;
  projectId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  testCases: mongoose.Types.ObjectId[]; // TestCase IDs
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const testSuiteSchema = new Schema<ITestSuite>({
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
    maxlength: 1000,
  },
  testCases: [{
    type: Schema.Types.ObjectId,
    ref: 'TestCase',
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
testSuiteSchema.index({ projectId: 1 });
testSuiteSchema.index({ createdAt: -1 });
testSuiteSchema.index({ name: 'text', description: 'text' });

export const TestSuite = mongoose.models.TestSuite || mongoose.model<ITestSuite>('TestSuite', testSuiteSchema);

export interface ITestRun extends Document {
  _id: string;
  projectId: mongoose.Types.ObjectId;
  suiteId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: mongoose.Types.ObjectId; // User ID
  environment: 'prod' | 'staging' | 'dev';
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  results: {
    testCaseId: mongoose.Types.ObjectId;
    status: 'not_executed' | 'passed' | 'failed' | 'blocked' | 'skipped';
    actualResult?: string;
    executedBy?: mongoose.Types.ObjectId;
    executedAt?: Date;
    duration?: number; // in minutes
    attachments: {
      name: string;
      url: string;
      uploadedBy: mongoose.Types.ObjectId;
      uploadedAt: Date;
    }[];
    defects: mongoose.Types.ObjectId[]; // Issue IDs
    notes?: string;
  }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const testRunSchema = new Schema<ITestRun>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  suiteId: {
    type: Schema.Types.ObjectId,
    ref: 'TestSuite',
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
    maxlength: 1000,
    default: null,
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'cancelled'],
    default: 'not_started',
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  environment: {
    type: String,
    enum: ['prod', 'staging', 'dev'],
    default: 'dev',
  },
  plannedStartDate: {
    type: Date,
    default: null,
  },
  plannedEndDate: {
    type: Date,
    default: null,
  },
  actualStartDate: {
    type: Date,
    default: null,
  },
  actualEndDate: {
    type: Date,
    default: null,
  },
  results: [{
    testCaseId: {
      type: Schema.Types.ObjectId,
      ref: 'TestCase',
      required: true,
    },
    status: {
      type: String,
      enum: ['not_executed', 'passed', 'failed', 'blocked', 'skipped'],
      default: 'not_executed',
    },
    actualResult: {
      type: String,
      maxlength: 2000,
      default: null,
    },
    executedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    executedAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      min: 0,
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
    defects: [{
      type: Schema.Types.ObjectId,
      ref: 'Issue',
    }],
    notes: {
      type: String,
      maxlength: 1000,
      default: null,
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
testRunSchema.index({ projectId: 1 });
testRunSchema.index({ suiteId: 1 });
testRunSchema.index({ status: 1 });
testRunSchema.index({ assignedTo: 1 });
testRunSchema.index({ environment: 1 });
testRunSchema.index({ createdAt: -1 });
testRunSchema.index({ 'results.status': 1 });

export const TestRun = mongoose.models.TestRun || mongoose.model<ITestRun>('TestRun', testRunSchema);