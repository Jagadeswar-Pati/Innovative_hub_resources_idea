import ResourcesCollaboration from '../models/ResourcesCollaboration.model.js';
import ResourcesPost from '../models/ResourcesPost.model.js';
import ResourcesUser from '../models/ResourcesUser.model.js';
import ResourcesTransaction from '../models/ResourcesTransaction.model.js';

export const applyForCollaboration = async (postId, applicantId, applicantMessage = '') => {
  const post = await ResourcesPost.findById(postId);
  if (!post) throw new Error('Post not found');
  if (post.createdBy.toString() === applicantId.toString()) {
    throw new Error('Cannot apply to your own post');
  }
  const existing = await ResourcesCollaboration.findOne({ postId, applicantId });
  if (existing) throw new Error('Already applied');

  const collab = await ResourcesCollaboration.create({
    postId,
    ownerId: post.createdBy,
    applicantId,
    status: 'applied',
    applicantMessage: (applicantMessage || '').trim(),
    budget: post.budget,
    platformFee: post.platformFee,
    gstAmount: post.gstAmount,
    totalAmount: post.totalAmount,
  });
  return collab.populate(['applicantId', 'ownerId'], 'name email role avatarUrl');
};

export const rejectApplicant = async (collabId, ownerId) => {
  const collab = await ResourcesCollaboration.findById(collabId);
  if (!collab) throw new Error('Collaboration not found');
  if (collab.ownerId.toString() !== ownerId.toString()) {
    throw new Error('Only post owner can reject');
  }
  if (collab.status !== 'applied') throw new Error('Invalid status');

  collab.status = 'rejected';
  await collab.save();
  return collab.populate(['applicantId', 'ownerId'], 'name email role avatarUrl');
};

export const acceptApplicant = async (collabId, ownerId) => {
  const collab = await ResourcesCollaboration.findById(collabId)
    .populate('postId')
    .populate('applicantId');
  if (!collab) throw new Error('Collaboration not found');
  if (collab.ownerId.toString() !== ownerId.toString()) {
    throw new Error('Only post owner can accept');
  }
  if (collab.status !== 'applied') throw new Error('Invalid status');

  const post = collab.postId;
  if (post.collaborationType === 'paid') {
    collab.status = 'payment_pending';
  } else {
    collab.status = 'ongoing';
  }
  await collab.save();
  return collab.populate(['applicantId', 'ownerId'], 'name email role avatarUrl');
};

export const recordEscrowPayment = async (collabId, applicantId) => {
  const collab = await ResourcesCollaboration.findById(collabId)
    .populate('postId');
  if (!collab) throw new Error('Collaboration not found');
  if (collab.applicantId.toString() !== applicantId.toString()) {
    throw new Error('Only applicant can pay');
  }
  if (collab.status !== 'payment_pending') throw new Error('Payment not pending');

  collab.status = 'ongoing';
  collab.paidAt = new Date();
  await collab.save();

  await ResourcesTransaction.create({
    collaborationId: collabId,
    type: 'escrow_in',
    amount: collab.totalAmount,
    gstAmount: collab.gstAmount,
    fromUserId: applicantId,
    status: 'completed',
    metadata: { postId: collab.postId._id },
  });
  return collab.populate(['applicantId', 'ownerId'], 'name email role avatarUrl');
};

export const completeCollaboration = async (collabId, ownerId) => {
  const collab = await ResourcesCollaboration.findById(collabId)
    .populate('postId');
  if (!collab) throw new Error('Collaboration not found');
  if (collab.ownerId.toString() !== ownerId.toString()) {
    throw new Error('Only post owner can mark complete');
  }
  if (collab.status !== 'ongoing') throw new Error('Collaboration not ongoing');

  collab.status = 'completed';
  collab.completedAt = new Date();
  await collab.save();

  const creatorReceives = collab.budget ? collab.budget - collab.platformFee : 0;

  if (creatorReceives > 0) {
    await ResourcesUser.findByIdAndUpdate(collab.applicantId, {
      $inc: { walletBalance: creatorReceives },
      updatedAt: new Date(),
    });
    await ResourcesTransaction.create({
      collaborationId: collabId,
      type: 'release_to_creator',
      amount: creatorReceives,
      toUserId: collab.applicantId,
      status: 'completed',
    });
    await ResourcesTransaction.create({
      collaborationId: collabId,
      type: 'platform_fee',
      amount: collab.platformFee,
      gstAmount: collab.gstAmount,
      status: 'completed',
      metadata: { collected: true },
    });
  }

  return collab.populate(['applicantId', 'ownerId'], 'name email role avatarUrl walletBalance');
};
