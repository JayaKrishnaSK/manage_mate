import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  _id: string;
  userId: string; // Who performed the action
  action: string; // e.g., 'user_created', 'user_updated', 'user_invited', 'role_changed'
  resource: string; // e.g., 'user', 'invite'
  resourceId?: string; // ID of the affected resource
  details: Record<string, unknown>; // Additional context
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  userId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  resource: {
    type: String,
    required: true,
  },
  resourceId: {
    type: String,
    default: null,
  },
  details: {
    type: Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ resource: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
