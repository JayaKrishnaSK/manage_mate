import mongoose, { Schema, Document } from 'mongoose';

export interface IModule extends Document {
  name: string;
  projectId: mongoose.Types.ObjectId;
  flowType: 'Waterfall' | 'Agile';
  ownerId: mongoose.Types.ObjectId;
  contributorIds: mongoose.Types.ObjectId[];
}

const ModuleSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  flowType: {
    type: String,
    enum: ['Waterfall', 'Agile'],
    required: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contributorIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

// Add indexes
ModuleSchema.index({ projectId: 1 });
ModuleSchema.index({ ownerId: 1 });
ModuleSchema.index({ flowType: 1 });

export default mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema);