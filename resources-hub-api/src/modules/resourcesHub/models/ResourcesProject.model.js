import mongoose from 'mongoose';

const categories = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'AI_ML', 'Robotics', 'IoT'];
const difficulties = ['beginner', 'intermediate', 'advanced'];

const resourcesProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: categories, required: true },
    difficulty: { type: String, enum: difficulties, default: 'intermediate' },
    tags: [{ type: String, trim: true }],
    links: [{ label: { type: String, trim: true }, url: { type: String, trim: true } }],
    pptUrl: { type: String, default: null, trim: true },
    circuitDetails: { type: String, default: null, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourcesUser', default: null },
    contactAllowed: { type: Boolean, default: true },
    isDummy: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'resources_projects' }
);

resourcesProjectSchema.index({ category: 1 });
resourcesProjectSchema.index({ difficulty: 1 });
resourcesProjectSchema.index({ tags: 1 });
resourcesProjectSchema.index({ isDummy: 1 });
resourcesProjectSchema.index({ createdAt: -1 });

const ResourcesProject = mongoose.model('ResourcesProject', resourcesProjectSchema);
export default ResourcesProject;
