import mongoose from 'mongoose';

const resourcesTransactionSchema = new mongoose.Schema(
  {
    collaborationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesCollaboration' },
    type: {
      type: String,
      enum: ['escrow_in', 'escrow_out', 'release_to_creator', 'platform_fee', 'refund'],
      required: true,
    },
    amount: { type: Number, required: true },
    gstAmount: { type: Number, default: 0 },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser' },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'resources_transactions' }
);

resourcesTransactionSchema.index({ collaborationId: 1 });
resourcesTransactionSchema.index({ type: 1 });
resourcesTransactionSchema.index({ createdAt: -1 });

const ResourcesTransaction = mongoose.model('ResourcesTransaction', resourcesTransactionSchema);
export default ResourcesTransaction;
