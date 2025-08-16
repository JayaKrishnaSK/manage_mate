import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeLog extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  date: Date;
  hours: number;
  description?: string;
}

const TimeLogSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true,
});

// Add indexes
TimeLogSchema.index({ userId: 1 });
TimeLogSchema.index({ taskId: 1 });
TimeLogSchema.index({ date: 1 });

export default mongoose.models.TimeLog || mongoose.model<ITimeLog>('TimeLog', TimeLogSchema);