import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  message: string;
  type: 'TaskAssigned' | 'StatusUpdate' | 'ConflictDetected';
  isRead: boolean;
  link: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['TaskAssigned', 'StatusUpdate', 'ConflictDetected'],
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes
NotificationSchema.index({ recipientId: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: 1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);