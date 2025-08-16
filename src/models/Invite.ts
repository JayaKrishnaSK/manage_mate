import mongoose, { Document, Schema } from 'mongoose';

export interface IInvite extends Document {
  _id: string;
  email: string;
  roles: ('admin' | 'manager' | 'qa_lead' | 'team_member' | 'guest')[];
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  invitedBy: string; // User ID who sent the invite
  usedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inviteSchema = new Schema<IInvite>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  roles: [{
    type: String,
    enum: ['admin', 'manager', 'qa_lead', 'team_member', 'guest'],
    required: true
  }],
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  invitedBy: {
    type: String,
    required: true,
  },
  usedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
inviteSchema.index({ email: 1 });
inviteSchema.index({ token: 1 });
inviteSchema.index({ expiresAt: 1 });
inviteSchema.index({ isUsed: 1 });

export const Invite = mongoose.models.Invite || mongoose.model<IInvite>('Invite', inviteSchema);
