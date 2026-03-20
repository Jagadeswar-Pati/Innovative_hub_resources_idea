import mongoose from 'mongoose';

const resourcesCommunityMessageSchema = new mongoose.Schema(
  {
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesCommunity', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', required: true },
    text: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true, collection: 'resources_community_messages' }
);

resourcesCommunityMessageSchema.index({ communityId: 1, createdAt: -1 });

const ResourcesCommunityMessage = mongoose.model('ResourcesCommunityMessage', resourcesCommunityMessageSchema);
export default ResourcesCommunityMessage;
