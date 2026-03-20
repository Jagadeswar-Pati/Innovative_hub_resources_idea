import mongoose from 'mongoose';

const resourcesConversationSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesPost', required: true },
    postOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', required: true },
    otherUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', required: true },
    postCollaborationType: { type: String, enum: ['free', 'paid'], required: true },
    messageAccessPaid: { type: Boolean, default: false },
    messageFeePaidAt: { type: Date, default: null },
    lastMessageAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'resources_conversations' }
);

resourcesConversationSchema.index({ postId: 1, otherUserId: 1 }, { unique: true });
resourcesConversationSchema.index({ postOwnerId: 1 });
resourcesConversationSchema.index({ otherUserId: 1 });
resourcesConversationSchema.index({ lastMessageAt: -1 });

const ResourcesConversation = mongoose.model('ResourcesConversation', resourcesConversationSchema);
export default ResourcesConversation;
