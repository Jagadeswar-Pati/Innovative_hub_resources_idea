import mongoose from 'mongoose';

const resourcesCommentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesPost', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'resources_comments' }
);

resourcesCommentSchema.index({ postId: 1 });
resourcesCommentSchema.index({ userId: 1 });
resourcesCommentSchema.index({ createdAt: -1 });

const ResourcesComment = mongoose.model('ResourcesComment', resourcesCommentSchema);
export default ResourcesComment;
