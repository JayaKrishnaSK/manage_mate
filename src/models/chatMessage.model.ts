import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  moduleId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  content: string;
  timestamp: Date;
}

const ChatMessageSchema: Schema = new Schema({
  moduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes
ChatMessageSchema.index({ moduleId: 1 });
ChatMessageSchema.index({ userId: 1 });
ChatMessageSchema.index({ timestamp: 1 });

export default mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);