import mongoose from 'mongoose';

const resourcesCommunitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    avatarUrl: { type: String, default: null },
    coverImageUrl: { type: String, default: null },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', required: true },
    adminIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser' }],
    memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser' }],
    isDummy: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'resources_communities' }
);

resourcesCommunitySchema.index({ isPublic: 1 });
resourcesCommunitySchema.index({ createdBy: 1 });
resourcesCommunitySchema.index({ memberIds: 1 });
resourcesCommunitySchema.index({ createdAt: -1 });

const ResourcesCommunity = mongoose.model('ResourcesCommunity', resourcesCommunitySchema);
export default ResourcesCommunity;
