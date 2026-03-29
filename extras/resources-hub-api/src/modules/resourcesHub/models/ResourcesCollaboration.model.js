import mongoose from 'mongoose';

const resourcesCollaborationSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesPost', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', required: true },
    status: {
      type: String,
      enum: ['applied', 'accepted', 'payment_pending', 'ongoing', 'completed', 'rejected', 'cancelled'],
      default: 'applied',
    },
    applicantMessage: { type: String, default: '', trim: true },
    budget: { type: Number, default: null },
    platformFee: { type: Number, default: null },
    gstAmount: { type: Number, default: null },
    totalAmount: { type: Number, default: null },
    paidAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'resources_collaborations' }
);

resourcesCollaborationSchema.index({ postId: 1 });
resourcesCollaborationSchema.index({ ownerId: 1 });
resourcesCollaborationSchema.index({ applicantId: 1 });
resourcesCollaborationSchema.index({ status: 1 });
resourcesCollaborationSchema.index({ createdAt: -1 });

const ResourcesCollaboration = mongoose.model('ResourcesCollaboration', resourcesCollaborationSchema);
export default ResourcesCollaboration;
