import * as collaborationService from '../services/collaboration.service.js';

export const apply = async (req, res) => {
  try {
    const message = req.body?.message || '';
    const collab = await collaborationService.applyForCollaboration(req.params.postId, req.user._id, message);
    res.status(201).json({ success: true, collaboration: collab });
  } catch (err) {
    const status = err.message?.includes('Already') ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const reject = async (req, res) => {
  try {
    const collab = await collaborationService.rejectApplicant(req.params.collabId, req.user._id);
    res.json({ success: true, collaboration: collab, message: 'Application rejected' });
  } catch (err) {
    const status = err.message?.includes('owner') || err.message?.includes('Invalid') ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const accept = async (req, res) => {
  try {
    const collab = await collaborationService.acceptApplicant(req.params.collabId, req.user._id);
    res.json({ success: true, collaboration: collab });
  } catch (err) {
    const status = err.message?.includes('owner') || err.message?.includes('status') ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const collab = await collaborationService.recordEscrowPayment(req.params.collabId, req.user._id);
    res.json({ success: true, collaboration: collab, message: 'Payment recorded in escrow' });
  } catch (err) {
    const status = err.message?.includes('applicant') || err.message?.includes('pending') ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const complete = async (req, res) => {
  try {
    const collab = await collaborationService.completeCollaboration(req.params.collabId, req.user._id);
    res.json({ success: true, collaboration: collab, message: 'Collaboration completed' });
  } catch (err) {
    const status = err.message?.includes('owner') || err.message?.includes('ongoing') ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const getMyCollaborations = async (req, res) => {
  try {
    const ResourcesCollaboration = (await import('../models/ResourcesCollaboration.model.js')).default;
    const collabs = await ResourcesCollaboration.find({
      $or: [{ ownerId: req.user._id }, { applicantId: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('postId', 'title description collaborationType budget totalAmount')
      .populate('ownerId', 'name email avatarUrl')
      .populate('applicantId', 'name email avatarUrl')
      .lean();
    res.json({ success: true, collaborations: collabs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPostApplications = async (req, res) => {
  try {
    const ResourcesCollaboration = (await import('../models/ResourcesCollaboration.model.js')).default;
    const ResourcesPost = (await import('../models/ResourcesPost.model.js')).default;
    const post = await ResourcesPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only post owner can view applications' });
    }
    const applications = await ResourcesCollaboration.find({ postId: req.params.postId })
      .populate('applicantId', 'name email role skills experienceLevel avatarUrl')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
