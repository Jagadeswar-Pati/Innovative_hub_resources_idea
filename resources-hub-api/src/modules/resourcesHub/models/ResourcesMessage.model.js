import mongoose from 'mongoose';

const resourcesMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesConversation', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', required: true },
    content: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: null },
    readAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'resources_messages' }
);

resourcesMessageSchema.index({ conversationId: 1, createdAt: 1 });

const ResourcesMessage = mongoose.model('ResourcesMessage', resourcesMessageSchema);
export default ResourcesMessage;
