import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectMembership extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'Manager' | 'BA' | 'Developer' | 'QA' | 'Guest';
}

const ProjectMembershipSchema: Schema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['Manager', 'BA', 'Developer', 'QA', 'Guest'],
    required: true,
  },
});

// Add indexes
ProjectMembershipSchema.index({ projectId: 1, userId: 1 }, { unique: true });
ProjectMembershipSchema.index({ userId: 1 });
ProjectMembershipSchema.index({ projectId: 1 });

export default mongoose.models.ProjectMembership || mongoose.model<IProjectMembership>('ProjectMembership', ProjectMembershipSchema);