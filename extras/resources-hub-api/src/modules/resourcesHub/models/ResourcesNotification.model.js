import mongoose from 'mongoose';

const resourcesNotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', default: null },
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    link: { type: String, default: '', trim: true },
    metadata: { type: Object, default: {} },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: 'resources_notifications' }
);

resourcesNotificationSchema.index({ userId: 1, createdAt: -1 });

const ResourcesNotification = mongoose.model('ResourcesNotification', resourcesNotificationSchema);
export default ResourcesNotification;
