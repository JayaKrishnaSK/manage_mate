import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  moduleId: mongoose.Types.ObjectId;
  assigneeId: mongoose.Types.ObjectId;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  startDate: Date;
  deadline: Date;
  hasConflict: boolean;
  dependencies: mongoose.Types.ObjectId[]; // Array of task IDs that this task depends on
}

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  moduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  assigneeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  hasConflict: {
    type: Boolean,
    default: false,
  },
  dependencies: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
  ],
});

// Add indexes
TaskSchema.index({ moduleId: 1 });
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ startDate: 1 });
TaskSchema.index({ deadline: 1 });
TaskSchema.index({ hasConflict: 1 });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);