import mongoose from 'mongoose';

const resourcesPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    mediaUrl: { type: String, default: null },
    mediaType: { type: String, enum: ['image'], default: 'image' },
    tags: [{ type: String, trim: true }],
    postType: { type: String, enum: ['idea', 'startup', 'resource', 'general'], default: 'general' },
    collaborationType: { type: String, enum: ['free', 'paid'], required: true },
    featuredPaid: { type: Boolean, default: false },
    budget: { type: Number, default: null },
    deadline: { type: Date, default: null },
    platformFee: { type: Number, default: null },
    gstAmount: { type: Number, default: null },
    totalAmount: { type: Number, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    isDummy: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'resources_posts' }
);

resourcesPostSchema.index({ createdAt: -1 });
resourcesPostSchema.index({ createdBy: 1 });
resourcesPostSchema.index({ collaborationType: 1 });
resourcesPostSchema.index({ postType: 1 });
resourcesPostSchema.index({ status: 1 });
resourcesPostSchema.index({ tags: 1 });

const ResourcesPost = mongoose.model('ResourcesPost', resourcesPostSchema);
export default ResourcesPost;
