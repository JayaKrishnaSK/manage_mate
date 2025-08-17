import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  status: "Active" | "Archived" | "Completed" | "Paused";
  createdAt: Date;
  // managers: mongoose.Types.ObjectId[];
}

const ProjectSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // managers: {
  //   type: [{ type: Schema.Types.ObjectId, ref: "User" }],
  //   required: true,
  // },
  status: {
    type: String,
    enum: ["Active", "Archived", "Completed", "Paused"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ createdAt: 1 });

export default mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
