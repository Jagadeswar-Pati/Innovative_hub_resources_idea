import ResourcesPost from '../models/ResourcesPost.model.js';
import ResourcesUser from '../models/ResourcesUser.model.js';
import ResourcesCollaboration from '../models/ResourcesCollaboration.model.js';
import ResourcesTransaction from '../models/ResourcesTransaction.model.js';
import mongoose from 'mongoose';

const validateAdmin = (req) => {
  const key = req.headers['x-admin-key'] || req.headers['x-resources-admin-key'];
  const secret = process.env.RESOURCES_ADMIN_SECRET || process.env.ADMIN_SECRET;
  if (!secret || key !== secret) {
    throw new Error('Unauthorized');
  }
};

export const getAllPosts = async (req, res) => {
  try {
    validateAdmin(req);
    const posts = await ResourcesPost.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role avatarUrl')
      .lean();
    res.json({ success: true, posts });
  } catch (err) {
    res.status(err.message === 'Unauthorized' ? 401 : 500).json({ success: false, message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    validateAdmin(req);
    await ResourcesPost.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(err.message === 'Unauthorized' ? 401 : 500).json({ success: false, message: err.message });
  }
};

export const getPaidCollaborations = async (req, res) => {
  try {
    validateAdmin(req);
    const collabs = await ResourcesCollaboration.find({ budget: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .populate('ownerId', 'name email')
      .populate('applicantId', 'name email')
      .populate('postId', 'title budget totalAmount')
      .lean();
    res.json({ success: true, collaborations: collabs });
  } catch (err) {
    res.status(err.message === 'Unauthorized' ? 401 : 500).json({ success: false, message: err.message });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    validateAdmin(req);
    const platformFees = await ResourcesTransaction.aggregate([
      { $match: { type: 'platform_fee' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' }, totalGst: { $sum: '$gstAmount' } } },
    ]);
    const revenue = platformFees[0]?.totalRevenue || 0;
    const gstCollected = platformFees[0]?.totalGst || 0;
    res.json({ success: true, totalRevenue: revenue, gstCollected });
  } catch (err) {
    res.status(err.message === 'Unauthorized' ? 401 : 500).json({ success: false, message: err.message });
  }
};

export const banUser = async (req, res) => {
  try {
    validateAdmin(req);
    const user = await ResourcesUser.findByIdAndUpdate(
      req.params.userId,
      { isBanned: true, updatedAt: new Date() },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User banned from Resources Hub', user });
  } catch (err) {
    res.status(err.message === 'Unauthorized' ? 401 : 500).json({ success: false, message: err.message });
  }
};

export const unbanUser = async (req, res) => {
  try {
    validateAdmin(req);
    const user = await ResourcesUser.findByIdAndUpdate(
      req.params.userId,
      { isBanned: false, updatedAt: new Date() },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User unbanned', user });
  } catch (err) {
    res.status(err.message === 'Unauthorized' ? 401 : 500).json({ success: false, message: err.message });
  }
};
