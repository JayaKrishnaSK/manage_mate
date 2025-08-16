import mongoose, { Schema, Document } from 'mongoose';

export interface IPersonalTodo extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  isCompleted: boolean;
  completedAt: Date | null;
  linkedResourceType: 'Project' | 'Module' | 'Task' | null;
  linkedResourceId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalTodoSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  linkedResourceType: {
    type: String,
    enum: ['Project', 'Module', 'Task', null],
    default: null,
  },
  linkedResourceId: {
    type: Schema.Types.ObjectId,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes
PersonalTodoSchema.index({ userId: 1 });
PersonalTodoSchema.index({ isCompleted: 1 });
PersonalTodoSchema.index({ linkedResourceType: 1 });
PersonalTodoSchema.index({ createdAt: 1 });
PersonalTodoSchema.index({ updatedAt: 1 });

// Middleware to update the `updatedAt` field before saving
PersonalTodoSchema.pre('save', function (next) {
  this.updatedAt = new Date(Date.now());
  next();
});

export default mongoose.models.PersonalTodo || mongoose.model<IPersonalTodo>('PersonalTodo', PersonalTodoSchema);