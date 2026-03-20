import ResourcesPost from '../models/ResourcesPost.model.js';
import ResourcesLike from '../models/ResourcesLike.model.js';
import ResourcesComment from '../models/ResourcesComment.model.js';
import ResourcesCollaboration from '../models/ResourcesCollaboration.model.js';
import { calculatePaymentBreakdown } from '../utils/paymentCalc.js';

/** Extract #hashtags from text */
const extractHashtags = (text) => {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(/#[\w]+/g) || [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
};

export const createPost = async (userId, body) => {
  const { title, description, mediaUrl, tags, postType, featuredPaid, collaborationType, budget, deadline } = body;
  let platformFee = null;
  let gstAmount = null;
  let totalAmount = null;

  if (collaborationType === 'paid') {
    if (!budget || budget < 5) {
      throw new Error('Paid posts require budget >= ₹5');
    }
    const breakdown = calculatePaymentBreakdown(budget);
    platformFee = breakdown.platformFee;
    gstAmount = breakdown.gstAmount;
    totalAmount = breakdown.totalAmount;
  }

  const explicitTags = Array.isArray(tags) ? tags : [];
  const fromDesc = extractHashtags(description);
  const mergedTags = [...new Set([...explicitTags.map((t) => String(t).toLowerCase()), ...fromDesc])];

  const post = await ResourcesPost.create({
    title,
    description,
    mediaUrl: mediaUrl || null,
    mediaType: 'image',
    tags: mergedTags,
    postType: ['idea', 'startup', 'resource', 'general'].includes(postType) ? postType : 'general',
    featuredPaid: !!featuredPaid,
    collaborationType,
    budget: collaborationType === 'paid' ? budget : null,
    deadline: collaborationType === 'paid' && deadline ? new Date(deadline) : null,
    platformFee,
    gstAmount,
    totalAmount,
    createdBy: userId,
  });
  return post.populate('createdBy', 'name email username role skills experienceLevel avatarUrl bio');
};

export const updatePost = async (postId, userId, body) => {
  const post = await ResourcesPost.findById(postId);
  if (!post) throw new Error('Post not found');
  if (post.createdBy.toString() !== userId.toString()) {
    throw new Error('Only post creator can edit');
  }
  const { title, description, mediaUrl, tags, postType, featuredPaid } = body;
  if (title !== undefined) post.title = title;
  if (description !== undefined) post.description = description;
  if (mediaUrl !== undefined) post.mediaUrl = mediaUrl;
  if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : post.tags;
  if (postType !== undefined && ['idea', 'startup', 'resource', 'general'].includes(postType)) post.postType = postType;
  if (featuredPaid !== undefined) post.featuredPaid = !!featuredPaid;
  post.updatedAt = new Date();
  await post.save();
  return post.populate('createdBy', 'name email role skills experienceLevel avatarUrl');
};

export const deletePost = async (postId, userId, isAdmin = false) => {
  const post = await ResourcesPost.findById(postId);
  if (!post) throw new Error('Post not found');
  if (!isAdmin && post.createdBy.toString() !== userId.toString()) {
    throw new Error('Only post creator or admin can delete');
  }
  await ResourcesPost.findByIdAndDelete(postId);
  await ResourcesLike.deleteMany({ postId });
  await ResourcesComment.deleteMany({ postId });
  return { deleted: true };
};

export const getPosts = async (filters = {}) => {
  const { collaborationType, tag, limit = 20, skip = 0 } = filters;
  const query = { status: 'active' };
  if (collaborationType) query.collaborationType = collaborationType;
  if (tag) query.tags = { $in: [tag] };
  if (filters.postType) query.postType = filters.postType;

  const posts = await ResourcesPost.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name email username role skills experienceLevel avatarUrl bio')
    .lean();
  return posts;
};

export const getPostById = async (postId) => {
  const post = await ResourcesPost.findById(postId)
    .populate('createdBy', 'name email username role skills experienceLevel avatarUrl bio')
    .lean();
  if (!post) throw new Error('Post not found');
  return post;
};
