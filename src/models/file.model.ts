import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  moduleId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

const FileSchema: Schema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  moduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes
FileSchema.index({ uploadedBy: 1 });
FileSchema.index({ projectId: 1 });
FileSchema.index({ moduleId: 1 });
FileSchema.index({ taskId: 1 });
FileSchema.index({ uploadedAt: 1 });

export default mongoose.models.File || mongoose.model<IFile>('File', FileSchema);