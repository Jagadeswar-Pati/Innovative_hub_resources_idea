import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const resourcesUserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    username: { type: String, trim: true, unique: true, sparse: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    bio: { type: String, default: '', trim: true },
    role: { type: String, enum: ['student', 'mentor', 'professor'], default: null },
    skills: [{ type: String, trim: true }],
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: null },
    institution: { type: String, default: '', trim: true },
    avatarUrl: { type: String, default: null },
    coverPhotoUrl: { type: String, default: null },
    links: {
      website: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      personalWebsite: { type: String, default: '' },
      other: { type: String, default: '' },
    },
    education: { type: String, default: '', trim: true },
    experience: { type: String, default: '', trim: true },
    interests: [{ type: String, trim: true }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser' }],
    paidProfile: { type: Boolean, default: false },
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    isBanned: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    isDummy: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'resources_users' }
);

resourcesUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

resourcesUserSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

resourcesUserSchema.index({ email: 1 });
resourcesUserSchema.index({ username: 1 });
resourcesUserSchema.index({ createdAt: -1 });
resourcesUserSchema.index({ isBanned: 1 });
resourcesUserSchema.index({ profileVisibility: 1 });
resourcesUserSchema.index({ resetPasswordToken: 1 });

const ResourcesUser = mongoose.model('ResourcesUser', resourcesUserSchema);
export default ResourcesUser;
