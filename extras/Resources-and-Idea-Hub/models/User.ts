import { Schema, models, model } from "mongoose";

const EducationSchema = new Schema(
  {
    degree: { type: String, trim: true, maxlength: 120, default: "" },
    field: { type: String, trim: true, maxlength: 120, default: "" },
    institution: { type: String, trim: true, maxlength: 200, default: "" },
    year: { type: String, trim: true, maxlength: 20, default: "" },
  },
  { _id: false }
);

const SocialLinksSchema = new Schema(
  {
    portfolio: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    github: { type: String, trim: true, default: "" },
    twitter: { type: String, trim: true, default: "" },
    googleScholar: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    profilePhoto: { type: String, trim: true, default: "" },
    coverPhoto: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    bio: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator(value: string) {
          if (!value) return true;
          const words = value.trim().split(/\s+/).filter(Boolean);
          return words.length <= 100;
        },
        message: "Bio must be at most 100 words",
      },
    },
    role: {
      type: String,
      enum: ["student", "mentor_guide_professor_teacher", "industrialists_employee", ""],
      default: "",
    },
    highestEducation: {
      type: String,
      enum: [
        "",
        "high_school",
        "diploma",
        "bachelor",
        "master",
        "doctorate",
        "post_doctorate",
        "other",
      ],
      default: "",
    },
    institution: { type: String, trim: true, default: "" },
    education: { type: [EducationSchema], default: [] },
    skills: { type: [String], default: [] },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
    isPublic: { type: Boolean, default: true },
    paidContact: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const User = models.User ?? model("User", UserSchema);
