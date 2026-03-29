import { Schema, model, models } from "mongoose";

const IdeaSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    type: { type: String, enum: ["Startup Idea", "Project", "Research"], required: true },
    tags: { type: [String], default: [] },
    price: { type: Number, default: 0, min: 0 },
    isPaid: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    branch: { type: String, trim: true, default: "" },
    level: { type: String, trim: true, default: "" },
    views: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Idea = models.Idea ?? model("Idea", IdeaSchema);

