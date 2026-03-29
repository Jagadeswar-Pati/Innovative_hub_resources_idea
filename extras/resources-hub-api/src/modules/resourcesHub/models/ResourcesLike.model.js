import mongoose from 'mongoose';

const resourcesLikeSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesPost', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'resources_likes' }
);

resourcesLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });
resourcesLikeSchema.index({ postId: 1 });
resourcesLikeSchema.index({ userId: 1 });

const ResourcesLike = mongoose.model('ResourcesLike', resourcesLikeSchema);
export default ResourcesLike;
